// Pure: item ids -> Stripe Checkout Session params. No network, no SDK.
// The API route calls this, then hands the result to stripe.checkout.sessions.create.
//
// Stripe constraints this encodes (verified against docs.stripe.com):
//   - subscription mode is required if ANY line item has a recurring price;
//     one-time prices ride along and land on the initial invoice only.
//   - trial_period_days lives on subscription_data and applies to the WHOLE
//     subscription, so it is only set when the trial item is the entire cart.
//
// Terms of Service and Privacy acceptance is handled on Stripe's hosted page,
// which displays them at the point of payment.
//
// Trust boundary: `priceIds` comes from server env, never from the request.
// The caller passes item ids only; nothing a client sends can change a price.

export class UnknownItemError extends Error {}
export class MissingPriceError extends Error {}

const SHIPPING_COUNTRIES = ['US', 'CA'];
const TOS_URL = 'https://start.mylocalads.co/terms-of-service';
// Per-session branding, so the account-wide Stripe branding is left alone.
// Stripe derives the button label colour from the contrast against
// button_color; there is no separate text-colour parameter.
const BUTTON_COLOR = '#2f43ff';

export function buildSessionParams(itemIds, catalog, priceIds, { successUrl, cancelUrl } = {}) {
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
    // Stripe's hosted page shows the "Add promotion code" field. Codes are
    // created and managed in the Stripe dashboard.
    allow_promotion_codes: true,
    // Requires an explicit "I agree to the terms of service" checkbox before
    // paying, rather than the passive footer text. Stripe needs a Terms of
    // service URL set under Settings → Checkout and Payment Links, or session
    // creation fails.
    consent_collection: { terms_of_service: 'required' },
    // Stripe supports exactly ONE consent checkbox (terms_of_service) and its
    // custom_fields types are only dropdown/numeric/text — there is no way to
    // add a second checkbox. The MSA commitment is folded into the same
    // required checkbox so it is still explicitly agreed to before payment.
    custom_text: {
      terms_of_service_acceptance: {
        message: `I agree to the [Terms of Service](${TOS_URL}) and to sign the Master Service Agreement to complete this purchase.`,
      },
    },
    // Required phone number. Stripe marks this field mandatory whenever
    // collection is enabled.
    phone_number_collection: { enabled: true },
    branding_settings: { button_color: BUTTON_COLOR },
    // Business name. `optional: false` makes it mandatory.
    custom_fields: [
      {
        key: 'businessname',
        label: { type: 'custom', custom: 'Business name' },
        type: 'text',
        optional: false,
        text: { minimum_length: 2, maximum_length: 100 },
      },
    ],
  };

  if (trialApplies) {
    params.subscription_data = { trial_period_days: records[0].trialDays };
  }

  if (records.some((r) => r.shipping)) {
    params.shipping_address_collection = { allowed_countries: SHIPPING_COUNTRIES };
  }

  return params;
}
