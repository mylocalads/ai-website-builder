// Pure: item ids -> Stripe Checkout Session params. No network, no SDK.
// The API route calls this, then hands the result to stripe.checkout.sessions.create.
//
// Stripe constraints this encodes (verified against docs.stripe.com):
//   - subscription mode is required if ANY line item has a recurring price;
//     one-time prices ride along and land on the initial invoice only.
//   - trial_period_days lives on subscription_data and applies to the WHOLE
//     subscription, so it is only set when the trial item is the entire cart.
//
// Trust boundary: `priceIds` comes from server env, never from the request.
// The caller passes item ids only; nothing a client sends can change a price.

export class UnknownItemError extends Error {}
export class MissingPriceError extends Error {}

const SHIPPING_COUNTRIES = ['US', 'CA'];

export function buildSessionParams(itemIds, catalog, priceIds, { successUrl, cancelUrl }) {
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    throw new UnknownItemError('Cart is empty');
  }

  const records = itemIds.map((id) => {
    const record = catalog.find((a) => a.id === id);
    if (!record) throw new UnknownItemError(`Unknown add-on: ${id}`);
    return record;
  });

  const line_items = records.map((r) => {
    const price = priceIds[r.id];
    if (!price) throw new MissingPriceError(`No Stripe price configured for: ${r.id}`);
    return { price, quantity: 1 };
  });

  const hasRecurring = records.some((r) => r.billing === 'recurring');
  const trialApplies = records.length === 1 && records[0].trialDays > 0;

  const params = {
    mode: hasRecurring ? 'subscription' : 'payment',
    line_items,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { items: records.map((r) => r.id).join(',') },
  };

  if (trialApplies) {
    params.subscription_data = { trial_period_days: records[0].trialDays };
  }

  if (records.some((r) => r.shipping)) {
    params.shipping_address_collection = { allowed_countries: SHIPPING_COUNTRIES };
  }

  return params;
}
