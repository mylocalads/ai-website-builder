// Shared browser-side checkout call, used by the cart bar on the homepage and
// by the cart page. Both send item ids only and redirect to the Stripe-hosted
// Checkout Session the server creates.
//
// Every failure resolves to a human message rather than a raw error; the caller
// decides where to display it.

import { cart } from './cart-store.js';

const SUPPORT_HTML =
  'Call <a href="tel:+18664511915">(866) 451-1915</a> or ' +
  '<a href="/booking-page">book a call</a>.';

/**
 * Creates a Stripe Checkout Session for the current cart and redirects to it.
 * Resolves to { ok: true } after triggering navigation, or { ok: false, html }
 * with a message to show the customer.
 */
export async function startCheckout() {
  const items = cart.items();
  if (items.length === 0) {
    return { ok: false, html: 'Your cart is empty.' };
  }

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.url) {
      window.location.href = data.url;
      return { ok: true };
    }

    if (data.error === 'unknown_item') {
      cart.clear();
      return {
        ok: false,
        html: 'Some items are no longer available and have been removed from your cart.',
      };
    }
    if (data.fallback) {
      return { ok: false, html: `Online checkout isn't available right now. ${SUPPORT_HTML}` };
    }
    return { ok: false, html: `We couldn't start checkout. ${SUPPORT_HTML}` };
  } catch {
    return { ok: false, html: 'Network error. Please check your connection and try again.' };
  }
}
