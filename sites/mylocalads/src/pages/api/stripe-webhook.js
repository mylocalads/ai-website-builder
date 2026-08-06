// Stripe webhook — the fulfillment half of checkout.
//
// Without this, a completed purchase does nothing but redirect the browser:
// no CRM contact, no notification, no record outside Stripe. The site promises
// contact "within one business day", and this is what makes that promise
// something other than a person remembering to open the dashboard.
//
// FLOW
//   Stripe -> POST /api/stripe-webhook (signed)
//     -> verify signature against STRIPE_WEBHOOK_SECRET
//     -> on checkout.session.completed, re-fetch the session from Stripe
//        (expanding line items) so we act on Stripe's data, not the request body
//     -> POST a flat order record to ORDER_WEBHOOK_URL (Make / Zapier / GHL
//        inbound webhook), which creates the contact and opportunity
//
// WHY RE-FETCH: the event payload is already signed and trustworthy, but it
// carries a snapshot without line items expanded. Retrieving keeps one code
// path for both the webhook and /checkout-success.

export const prerender = false;

import Stripe from 'stripe';
import { addOns } from '../../data/addOns.js';
import { buildOrderPayload, isFulfillable } from '../../lib/order-payload.js';

const json = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// Stripe retries non-2xx for days. Anything that a retry cannot fix — an event
// we do not handle, a session that is not fulfillable — must still answer 200,
// or we invite an endless retry storm for a non-problem.
const ACK = (note) => json({ received: true, note }, 200);

export async function POST({ request }) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    // 500, not 200: this IS retryable, and the retries are the safety net if
    // the env var is added shortly after the first order.
    console.error('[stripe-webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
    return json({ error: 'not_configured' }, 500);
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) return json({ error: 'missing_signature' }, 400);

  // Signature is computed over the RAW body — parsing it first would break
  // verification.
  const raw = await request.text();

  const stripe = new Stripe(secret);
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, signature, webhookSecret);
  } catch (err) {
    // An unverifiable request is not from Stripe. Never retry it, never act.
    console.error('[stripe-webhook] Signature verification failed:', err?.message);
    return json({ error: 'invalid_signature' }, 400);
  }

  if (event.type !== 'checkout.session.completed') {
    return ACK(`ignored ${event.type}`);
  }

  // Prefer a fresh read from Stripe, but never lose an order over it.
  //
  // The event payload is already signature-verified, which makes it authentic
  // Stripe data — the retrieve only buys freshness. So on any retrieval failure
  // we fall back to the signed payload and carry on:
  //   - a dashboard "Send test webhook" carries a sample session id that does
  //     not exist in the account, and would otherwise return 500 and look like
  //     a broken endpoint
  //   - a transient Stripe outage fulfills from signed data instead of relying
  //     on retries
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
      expand: ['line_items', 'customer_details'],
    });
  } catch (err) {
    console.warn(
      `[stripe-webhook] Session retrieve failed (${err?.message}); ` +
        'falling back to the signed event payload.'
    );
    session = event.data.object;
  }

  if (!isFulfillable(session)) {
    // An expired or unpaid session is a real outcome, not a failure to retry.
    return ACK(`not fulfillable: status=${session.status} payment=${session.payment_status}`);
  }

  const payload = buildOrderPayload(session, addOns, {
    sourceUrl: request.headers.get('referer') ?? null,
    occurredAt: new Date(event.created * 1000).toISOString(),
  });

  const destination = process.env.ORDER_WEBHOOK_URL;
  if (!destination) {
    // Loud, and still 200: the payment is real and Stripe replaying it will not
    // conjure a destination. The log line carries enough to recover the order
    // by hand.
    console.error(
      '[stripe-webhook] ORDER_WEBHOOK_URL is not set — order NOT delivered to the CRM.',
      JSON.stringify(payload)
    );
    return ACK('no destination configured');
  }

  try {
    const res = await fetch(destination, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`[stripe-webhook] CRM webhook returned ${res.status}`, JSON.stringify(payload));
      // Non-2xx downstream: let Stripe retry us rather than lose the order.
      return json({ error: 'crm_rejected' }, 500);
    }
  } catch (err) {
    console.error('[stripe-webhook] CRM webhook threw:', err?.message, JSON.stringify(payload));
    return json({ error: 'crm_unreachable' }, 500);
  }

  return json({ received: true, session_id: session.id }, 200);
}

// Stripe only ever POSTs here. Answering GET keeps a browser visit from
// looking like an outage.
export async function GET() {
  return json({ error: 'method_not_allowed' }, 405);
}
