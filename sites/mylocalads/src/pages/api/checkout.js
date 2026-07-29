// Serverless checkout endpoint — the only on-demand route on this site.
// Every other page stays static.
//
// Trust boundary: the client sends item IDs and NOTHING else. Prices are
// re-derived here from server env vars, so a tampered request cannot change
// what Stripe is told to charge.
//
// process.env, NOT import.meta.env: Astro inlines import.meta.env at build
// time, which would write the secret key into the built function bundle.

export const prerender = false;

import Stripe from 'stripe';
import { addOns } from '../../data/addOns.js';
import {
  buildSessionParams,
  UnknownItemError,
  MissingPriceError,
} from '../../lib/checkout-params.js';

const priceIds = () => ({
  'crm': process.env.STRIPE_PRICE_CRM,
  'ai-agents': process.env.STRIPE_PRICE_AI_AGENTS,
  'seo-plan': process.env.STRIPE_PRICE_SEO_PLAN,
  'website': process.env.STRIPE_PRICE_WEBSITE,
  'roof-quote-pro': process.env.STRIPE_PRICE_ROOF_QUOTE_PRO,
});

const json = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function POST({ request, url }) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    // `fallback: true` tells the client to offer the per-product links and a
    // phone number rather than showing an error.
    return json({ error: 'stripe_not_configured', fallback: true }, 503);
  }

  let items;
  try {
    ({ items } = await request.json());
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  let params;
  try {
    params = buildSessionParams(items, addOns, priceIds(), {
      successUrl: `${url.origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${url.origin}/cart`,
    });
  } catch (err) {
    if (err instanceof UnknownItemError) return json({ error: 'unknown_item' }, 400);
    if (err instanceof MissingPriceError) {
      return json({ error: 'stripe_not_configured', fallback: true }, 503);
    }
    throw err;
  }

  try {
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create(params);
    return json({ url: session.url }, 200);
  } catch (err) {
    // Never surface Stripe's raw message to the browser.
    console.error('[checkout] Stripe error:', err?.message);
    return json({ error: 'stripe_error' }, 502);
  }
}
