import { describe, it, expect } from 'vitest';
import { buildSessionParams, UnknownItemError, MissingPriceError } from '../src/lib/checkout-params.js';

// Fixture keeps one-time and shipping cases covered even though the current
// live catalog is all-recurring — so those branches stay verified if a
// one-time or physical product is reintroduced.
const FIXTURE = [
  { id: 'crm', priceCents: 9700, billing: 'recurring', trialDays: 7, requires: [], shipping: false },
  { id: 'website', priceCents: 30000, billing: 'recurring', trialDays: null, requires: ['crm'], shipping: false },
  { id: 'gbp', priceCents: 50000, billing: 'one_time', trialDays: null, requires: [], shipping: false },
  { id: 'nfc-cards', priceCents: 15000, billing: 'one_time', trialDays: null, requires: [], shipping: true },
];

const PRICES = {
  crm: 'price_crm',
  website: 'price_website',
  gbp: 'price_gbp',
  'nfc-cards': 'price_nfc',
};

const URLS = { successUrl: 'https://x.co/ok', cancelUrl: 'https://x.co/cart' };

describe('buildSessionParams', () => {
  it('uses payment mode when nothing recurs', () => {
    expect(buildSessionParams(['gbp'], FIXTURE, PRICES, URLS).mode).toBe('payment');
  });

  it('uses subscription mode when anything recurs', () => {
    expect(buildSessionParams(['gbp', 'crm'], FIXTURE, PRICES, URLS).mode).toBe('subscription');
  });

  it('maps every item to a line item', () => {
    const p = buildSessionParams(['crm', 'gbp'], FIXTURE, PRICES, URLS);
    expect(p.line_items).toEqual([
      { price: 'price_crm', quantity: 1 },
      { price: 'price_gbp', quantity: 1 },
    ]);
  });

  it('applies the trial when the trial item is the whole cart', () => {
    const p = buildSessionParams(['crm'], FIXTURE, PRICES, URLS);
    expect(p.subscription_data).toEqual({ trial_period_days: 7 });
  });

  it('omits the trial when the trial item is bundled', () => {
    const p = buildSessionParams(['crm', 'website'], FIXTURE, PRICES, URLS);
    expect(p.subscription_data).toBeUndefined();
  });

  it('collects a shipping address when a physical item is present', () => {
    const p = buildSessionParams(['nfc-cards'], FIXTURE, PRICES, URLS);
    expect(p.shipping_address_collection).toEqual({ allowed_countries: ['US', 'CA'] });
  });

  it('omits shipping collection for digital-only carts', () => {
    expect(buildSessionParams(['gbp'], FIXTURE, PRICES, URLS).shipping_address_collection).toBeUndefined();
  });

  it('passes through success and cancel urls', () => {
    const p = buildSessionParams(['gbp'], FIXTURE, PRICES, URLS);
    expect(p.success_url).toBe('https://x.co/ok');
    expect(p.cancel_url).toBe('https://x.co/cart');
  });

  it('records the item ids in metadata', () => {
    expect(buildSessionParams(['crm', 'gbp'], FIXTURE, PRICES, URLS).metadata.items).toBe('crm,gbp');
  });

  it('throws UnknownItemError for an id not in the catalog', () => {
    expect(() => buildSessionParams(['ghost'], FIXTURE, PRICES, URLS)).toThrow(UnknownItemError);
  });

  it('throws UnknownItemError for an empty cart', () => {
    expect(() => buildSessionParams([], FIXTURE, PRICES, URLS)).toThrow(UnknownItemError);
  });

  it('throws UnknownItemError for non-array input', () => {
    expect(() => buildSessionParams(null, FIXTURE, PRICES, URLS)).toThrow(UnknownItemError);
  });

  it('throws MissingPriceError when a price id is not configured', () => {
    expect(() => buildSessionParams(['crm'], FIXTURE, {}, URLS)).toThrow(MissingPriceError);
  });

  // Trust boundary: the client sends ids only. Anything else it sends must have
  // no effect on what Stripe is told to charge.
  it('derives prices from the server map, never from the request', () => {
    const p = buildSessionParams(['gbp'], FIXTURE, PRICES, URLS);
    expect(p.line_items[0].price).toBe('price_gbp');
    expect(p.line_items[0]).not.toHaveProperty('price_data');
    expect(p.line_items[0]).not.toHaveProperty('unit_amount');
  });
});
