import { describe, it, expect } from 'vitest';
import {
  isFulfillable,
  customFieldValue,
  purchasedItems,
  formatAmount,
  buildOrderPayload,
} from '../src/lib/order-payload.js';
import { addOns } from '../src/data/addOns.js';

// Shaped after real Checkout Session responses.
const paidSession = {
  id: 'cs_live_a1b2c3',
  livemode: true,
  status: 'complete',
  payment_status: 'paid',
  mode: 'subscription',
  currency: 'usd',
  amount_total: 339700,
  amount_subtotal: 339700,
  total_details: { amount_discount: 0 },
  customer: 'cus_123',
  subscription: 'sub_456',
  payment_intent: null,
  consent: { terms_of_service: 'accepted' },
  metadata: { items: 'crm,ai-agents,seo-plan,website,ppl-ads-6mo' },
  customer_details: { email: 'owner@example.com', name: 'Dana Reyes', phone: '+15095554604' },
  custom_fields: [{ key: 'businessname', text: { value: 'Reyes Roofing' } }],
};

// A CRM-only cart: 7-day trial, no money today.
const trialSession = {
  ...paidSession,
  id: 'cs_live_trial',
  payment_status: 'no_payment_required',
  amount_total: 0,
  amount_subtotal: 0,
  metadata: { items: 'crm' },
};

describe('isFulfillable', () => {
  it('accepts a completed paid session', () => {
    expect(isFulfillable(paidSession)).toBe(true);
  });

  it('accepts a completed trial that collected no money', () => {
    // The regression this guards: treating only 'paid' as success silently
    // drops every 7-day-trial signup, which is the cheapest plan's whole funnel.
    expect(isFulfillable(trialSession)).toBe(true);
  });

  it('rejects an open or expired session', () => {
    expect(isFulfillable({ ...paidSession, status: 'open' })).toBe(false);
    expect(isFulfillable({ ...paidSession, status: 'expired' })).toBe(false);
  });

  it('rejects a complete session that was never paid', () => {
    expect(isFulfillable({ ...paidSession, payment_status: 'unpaid' })).toBe(false);
  });

  it('rejects nothing at all', () => {
    expect(isFulfillable(null)).toBe(false);
    expect(isFulfillable(undefined)).toBe(false);
    expect(isFulfillable({})).toBe(false);
  });
});

describe('customFieldValue', () => {
  it('reads the business name collected on Stripe', () => {
    expect(customFieldValue(paidSession, 'businessname')).toBe('Reyes Roofing');
  });

  it('returns null for a missing field or missing session', () => {
    expect(customFieldValue(paidSession, 'nope')).toBeNull();
    expect(customFieldValue({}, 'businessname')).toBeNull();
    expect(customFieldValue(null, 'businessname')).toBeNull();
  });
});

describe('purchasedItems', () => {
  it('resolves ids to catalog names in cart order', () => {
    const items = purchasedItems(paidSession, addOns);
    expect(items.map((i) => i.id)).toEqual([
      'crm', 'ai-agents', 'seo-plan', 'website', 'ppl-ads-6mo',
    ]);
    expect(items.every((i) => typeof i.name === 'string' && i.name.length > 0)).toBe(true);
    expect(items[0].name).toBe('Home Service CRM');
  });

  it('passes an unknown id through rather than dropping it', () => {
    // A retired product must not vanish from the order — a mystery line is
    // recoverable, a missing one is not.
    const items = purchasedItems({ metadata: { items: 'crm,retired-thing' } }, addOns);
    expect(items.map((i) => i.id)).toEqual(['crm', 'retired-thing']);
    expect(items[1].name).toBe('retired-thing');
    expect(items[1].priceCents).toBeNull();
  });

  it('tolerates empty, missing, and whitespace metadata', () => {
    expect(purchasedItems({ metadata: { items: '' } }, addOns)).toEqual([]);
    expect(purchasedItems({}, addOns)).toEqual([]);
    expect(purchasedItems(null, addOns)).toEqual([]);
    expect(purchasedItems({ metadata: { items: ' crm , website ' } }, addOns).map((i) => i.id))
      .toEqual(['crm', 'website']);
  });
});

describe('formatAmount', () => {
  it('converts cents to a decimal string', () => {
    expect(formatAmount(339700)).toBe('3397.00');
    expect(formatAmount(9700)).toBe('97.00');
    expect(formatAmount(0)).toBe('0.00');
  });

  it('returns null for anything that is not a number', () => {
    expect(formatAmount(undefined)).toBeNull();
    expect(formatAmount(null)).toBeNull();
    expect(formatAmount(NaN)).toBeNull();
  });
});

describe('buildOrderPayload', () => {
  it('carries every field the CRM needs to create the contact', () => {
    const p = buildOrderPayload(paidSession, addOns);
    expect(p.contact).toEqual({
      email: 'owner@example.com',
      name: 'Dana Reyes',
      phone: '+15095554604',
      business_name: 'Reyes Roofing',
    });
  });

  it('includes the session id as a dedupe key', () => {
    // Stripe retries until it gets a 2xx, so the same order can arrive twice.
    expect(buildOrderPayload(paidSession, addOns).session_id).toBe('cs_live_a1b2c3');
  });

  it('reports money as decimal strings', () => {
    const p = buildOrderPayload(paidSession, addOns);
    expect(p.order.amount_total).toBe('3397.00');
    expect(p.order.currency).toBe('usd');
  });

  it('flags a trial distinctly from a paid order', () => {
    const paid = buildOrderPayload(paidSession, addOns);
    const trial = buildOrderPayload(trialSession, addOns);
    expect(paid.order.is_trial).toBe(false);
    expect(trial.order.is_trial).toBe(true);
    expect(trial.order.amount_total).toBe('0.00');
  });

  it('flattens item ids and names for automations that cannot loop', () => {
    const p = buildOrderPayload(paidSession, addOns);
    expect(p.order.item_ids).toHaveLength(5);
    expect(p.order.item_names).toHaveLength(5);
    expect(p.order.item_ids).toContain('ppl-ads-6mo');
  });

  it('unwraps Stripe ids whether they arrive as strings or objects', () => {
    const expanded = buildOrderPayload(
      { ...paidSession, customer: { id: 'cus_obj' }, subscription: { id: 'sub_obj' } },
      addOns
    );
    expect(expanded.stripe.customer_id).toBe('cus_obj');
    expect(expanded.stripe.subscription_id).toBe('sub_obj');

    const plain = buildOrderPayload(paidSession, addOns);
    expect(plain.stripe.customer_id).toBe('cus_123');
    expect(plain.stripe.subscription_id).toBe('sub_456');
  });

  it('records terms of service acceptance', () => {
    expect(buildOrderPayload(paidSession, addOns).consent.terms_of_service).toBe('accepted');
  });

  it('passes through source url and timestamp', () => {
    const p = buildOrderPayload(paidSession, addOns, {
      sourceUrl: 'https://mylocalads.co/cart',
      occurredAt: '2026-08-05T12:00:00.000Z',
    });
    expect(p.source_url).toBe('https://mylocalads.co/cart');
    expect(p.occurred_at).toBe('2026-08-05T12:00:00.000Z');
  });

  it('produces JSON-serializable output with no undefined values', () => {
    // Undefined silently disappears through JSON.stringify, which would hand
    // the CRM a payload missing fields it is mapping against.
    const p = buildOrderPayload({ id: 'cs_min', status: 'complete', payment_status: 'paid' }, addOns);
    const roundTripped = JSON.parse(JSON.stringify(p));
    const findUndefined = (obj, path = '') =>
      Object.entries(obj).flatMap(([k, v]) =>
        v && typeof v === 'object' && !Array.isArray(v)
          ? findUndefined(v, `${path}${k}.`)
          : v === undefined ? [`${path}${k}`] : []
      );
    expect(findUndefined(p)).toEqual([]);
    expect(Object.keys(roundTripped)).toEqual(Object.keys(p));
  });

  it('does not throw on a sparse session', () => {
    expect(() => buildOrderPayload({}, addOns)).not.toThrow();
    expect(() => buildOrderPayload(null, addOns)).not.toThrow();
  });
});
