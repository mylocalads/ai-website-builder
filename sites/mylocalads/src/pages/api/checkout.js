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

// The three Ads Plan commit terms are one Stripe product (the setup fee), so
// they all resolve to the same price. cart-core keeps them mutually exclusive,
// and the chosen term reaches Stripe via session metadata.
const priceIds = () => ({
  'crm': process.env.STRIPE_PRICE_CRM,
  'ai-agents': process.env.STRIPE_PRICE_AI_AGENTS,
  'seo-plan': process.env.STRIPE_PRICE_SEO_PLAN,
  'website': process.env.STRIPE_PRICE_WEBSITE,
  'social-media': process.env.STRIPE_PRICE_SOCIAL_MEDIA,
  'ppl-ads-3mo': process.env.STRIPE_PRICE_ADS_SETUP,
  'ppl-ads-6mo': process.env.STRIPE_PRICE_ADS_SETUP,
  'ppl-ads-12mo': process.env.STRIPE_PRICE_ADS_SETUP,
});

const json = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// Astro's request URL is the INTERNAL origin on Vercel's serverless runtime —
// it resolves to https://localhost, which produced a broken "Back" link and a
// broken post-payment redirect on Stripe's hosted page.
//
// Prefer the forwarded host the customer actually used, so this keeps working
// through the DNS migration from mylocalads.vercel.app to mylocalads.co with no
// code change. PUBLIC_SITE_URL is an optional override.
function publicOrigin(request, url) {
  const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (forwardedHost && !/^localhost(:|$)/.test(forwardedHost)) {
    const proto = request.headers.get('x-forwarded-proto') ?? 'https';
    return `${proto}://${forwardedHost}`;
  }
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/$/, '');
  return url.origin;
}

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

  const origin = publicOrigin(request, url);

  let params;
  try {
    params = buildSessionParams(items, addOns, priceIds(), {
      successUrl: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      // Stripe's logo / "Back" control on the hosted page uses cancel_url, so
      // this is what a customer clicking the brand mark lands on.
      cancelUrl: `${origin}/`,
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
