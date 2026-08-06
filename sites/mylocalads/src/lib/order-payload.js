// Pure: a Stripe Checkout Session -> the flat order record we hand to the CRM.
// No network, no SDK. The webhook route calls this, then POSTs the result.
//
// Kept pure on purpose: this is the only place that decides what an order
// "means", and it is the part most likely to be wrong in a way nobody notices
// until a customer is missing from the CRM.
//
// PAYMENT STATE — the subtlety that matters here:
//   A CRM-only cart starts a 7-day trial, so Stripe reports
//   payment_status: 'no_payment_required' and amount_total: 0. That is a
//   WON deal, not a failed one. Treating only 'paid' as success would silently
//   drop every trial signup.

/** Stripe payment_status values that mean "this order is real". */
const SETTLED = new Set(['paid', 'no_payment_required']);

/**
 * True when the session represents a completed purchase — including a trial
 * that collected no money up front.
 */
export function isFulfillable(session) {
  if (!session) return false;
  return session.status === 'complete' && SETTLED.has(session.payment_status);
}

/** Value of a Stripe custom field by key, or null. */
export function customFieldValue(session, key) {
  const field = (session?.custom_fields ?? []).find((f) => f.key === key);
  return field?.text?.value ?? field?.numeric?.value ?? field?.dropdown?.value ?? null;
}

/**
 * Purchased items, resolved against the local catalog so the CRM gets readable
 * names rather than bare ids.
 *
 * Source of truth is `metadata.items`, which the checkout endpoint writes from
 * the same catalog — line items would give us Stripe product names, which drift
 * from the site copy independently.
 */
export function purchasedItems(session, catalog = []) {
  const ids = String(session?.metadata?.items ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  return ids.map((id) => {
    const record = catalog.find((a) => a.id === id);
    return {
      id,
      // An id with no catalog entry means the product was renamed or retired
      // between checkout and fulfillment. Pass it through rather than dropping
      // it — a mystery line is recoverable, a missing one is not.
      name: record?.title ?? id,
      plan: record?.planLabel ?? null,
      priceCents: record?.priceCents ?? null,
      billing: record?.billing ?? null,
    };
  });
}

/** Cents -> a plain decimal string, or null. Avoids float formatting drift. */
export function formatAmount(cents) {
  if (typeof cents !== 'number' || Number.isNaN(cents)) return null;
  return (cents / 100).toFixed(2);
}

/**
 * Build the order record posted to the CRM webhook.
 *
 * `session.id` is included so the receiving automation can dedupe: Stripe
 * retries a webhook until it gets a 2xx, so the same order can legitimately
 * arrive more than once.
 */
export function buildOrderPayload(session, catalog = [], extra = {}) {
  const details = session?.customer_details ?? {};
  const items = purchasedItems(session, catalog);

  return {
    event: 'order.completed',
    // Dedupe key — stable across Stripe's retries of the same event.
    session_id: session?.id ?? null,
    livemode: session?.livemode ?? null,

    contact: {
      email: details.email ?? null,
      name: details.name ?? null,
      phone: details.phone ?? null,
      business_name: customFieldValue(session, 'businessname'),
    },

    order: {
      mode: session?.mode ?? null,
      payment_status: session?.payment_status ?? null,
      // A trial signup settles at $0 today and bills later. Flagged explicitly
      // so the CRM can route it differently from a paid order.
      is_trial: session?.payment_status === 'no_payment_required',
      currency: session?.currency ?? null,
      amount_total: formatAmount(session?.amount_total),
      amount_subtotal: formatAmount(session?.amount_subtotal),
      amount_discount: formatAmount(session?.total_details?.amount_discount),
      item_ids: items.map((i) => i.id),
      item_names: items.map((i) => i.name),
      items,
    },

    stripe: {
      customer_id: typeof session?.customer === 'string' ? session.customer : (session?.customer?.id ?? null),
      subscription_id:
        typeof session?.subscription === 'string'
          ? session.subscription
          : (session?.subscription?.id ?? null),
      payment_intent_id:
        typeof session?.payment_intent === 'string'
          ? session.payment_intent
          : (session?.payment_intent?.id ?? null),
    },

    consent: {
      // Recorded because the checkbox also covers the Master Service Agreement
      // commitment — worth keeping alongside the order, not only in Stripe.
      terms_of_service: session?.consent?.terms_of_service ?? null,
    },

    source_url: extra.sourceUrl ?? null,
    occurred_at: extra.occurredAt ?? null,
  };
}
