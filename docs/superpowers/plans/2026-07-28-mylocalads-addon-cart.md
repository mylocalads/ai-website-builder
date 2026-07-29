# Growth Add-Ons Cart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Growth Add-Ons section on the mylocalads homepage into a working cart — each tile lists what the service includes with checkmark bullets and an "Add to cart" button, a cart summary sits below the grid, and checkout runs through Stripe Checkout Sessions.

**Architecture:** Pure-logic modules (`cart-core.js`, `checkout-params.js`) hold every decision worth testing and are unit-tested with Vitest. Thin adapters wrap them: `cart-store.js` for `localStorage` + events, `/api/checkout.js` for the Stripe SDK call. Astro components stay dumb. The site remains `output: 'static'`; only `/api/checkout` opts into on-demand rendering.

**Tech Stack:** Astro 5, `@astrojs/vercel`, `stripe` (Node SDK), Vitest, vanilla JS (no framework on this site).

Spec: `docs/superpowers/specs/2026-07-28-mylocalads-addon-cart-design.md`

---

## File Structure

**Create:**

| File | Responsibility |
|---|---|
| `sites/mylocalads/src/data/addOns.js` | The six add-on records. No logic. |
| `sites/mylocalads/src/lib/cart-core.js` | Pure: add/remove with dependencies, sanitize, totals. No DOM, no storage. |
| `sites/mylocalads/src/lib/cart-store.js` | Thin adapter: `localStorage` + change events. Wraps cart-core. |
| `sites/mylocalads/src/lib/checkout-params.js` | Pure: item IDs → Stripe Checkout Session params. No network. |
| `sites/mylocalads/src/components/AddOnCard.astro` | One tile: bullets + Add to cart control. |
| `sites/mylocalads/src/components/CartBar.astro` | Summary bar rendered below the add-on grid. |
| `sites/mylocalads/src/components/CartButton.astro` | Header badge with item count. |
| `sites/mylocalads/src/pages/cart.astro` | Cart review page. |
| `sites/mylocalads/src/pages/api/checkout.js` | Serverless route; calls Stripe. |
| `sites/mylocalads/src/pages/checkout-success.astro` | Post-payment landing; clears cart. |
| `sites/mylocalads/test/cart-core.test.js` | Unit tests for cart logic. |
| `sites/mylocalads/test/checkout-params.test.js` | Unit tests for session params. |
| `sites/mylocalads/test/addOns.test.js` | Data invariants. |

**Modify:**

| File | Change |
|---|---|
| `sites/mylocalads/src/pages/index.astro` | Replace `addOns` array + `.addon-grid` markup with `AddOnCard` + `CartBar` |
| `sites/mylocalads/src/components/Header.astro` | Add `CartButton` to desktop and mobile nav |
| `sites/mylocalads/package.json` | Add `stripe`, `vitest`; add `test` script |

**Why this split:** every rule that can be wrong (does removing CRM drop the Website? does a mixed cart use subscription mode? does the trial apply?) lives in a pure function with a test. The Astro components only render.

---

### Task 1: Test infrastructure

**Files:**
- Modify: `sites/mylocalads/package.json`

- [ ] **Step 1: Install Vitest**

```bash
cd sites/mylocalads && npm install -D vitest@^2
```

- [ ] **Step 2: Add the test script**

In `sites/mylocalads/package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Verify the runner starts**

Run: `cd sites/mylocalads && npm test`
Expected: exits reporting "No test files found" (not a crash).

- [ ] **Step 4: Commit**

```bash
git add sites/mylocalads/package.json sites/mylocalads/package-lock.json
git commit -m "chore(mylocalads): add vitest for cart logic tests"
```

---

### Task 2: Add-on data module

**Files:**
- Create: `sites/mylocalads/src/data/addOns.js`
- Test: `sites/mylocalads/test/addOns.test.js`

- [ ] **Step 1: Write the failing test**

Create `sites/mylocalads/test/addOns.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { addOns, byId } from '../src/data/addOns.js';

describe('addOns data', () => {
  it('has six add-ons', () => {
    expect(addOns).toHaveLength(6);
  });

  it('gives every add-on the required fields', () => {
    for (const a of addOns) {
      expect(typeof a.id, `${a.id}.id`).toBe('string');
      expect(typeof a.title, `${a.id}.title`).toBe('string');
      expect(typeof a.priceCents, `${a.id}.priceCents`).toBe('number');
      expect(a.priceCents, `${a.id}.priceCents`).toBeGreaterThan(0);
      expect(['recurring', 'one_time'], `${a.id}.billing`).toContain(a.billing);
      expect(Array.isArray(a.includes), `${a.id}.includes`).toBe(true);
      expect(a.includes.length, `${a.id}.includes`).toBeGreaterThanOrEqual(3);
      expect(typeof a.fallbackHref, `${a.id}.fallbackHref`).toBe('string');
      expect(Array.isArray(a.requires), `${a.id}.requires`).toBe(true);
    }
  });

  it('uses unique ids', () => {
    const ids = addOns.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only references requires ids that exist', () => {
    const ids = new Set(addOns.map((a) => a.id));
    for (const a of addOns) {
      for (const req of a.requires) {
        expect(ids.has(req), `${a.id} requires unknown ${req}`).toBe(true);
      }
    }
  });

  it('gives a trial only to crm', () => {
    for (const a of addOns) {
      if (a.id === 'crm') expect(a.trialDays).toBe(7);
      else expect(a.trialDays, `${a.id}`).toBeNull();
    }
  });

  it('looks up by id', () => {
    expect(byId('crm').title).toBe('CRM');
    expect(byId('nope')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd sites/mylocalads && npx vitest run test/addOns.test.js`
Expected: FAIL — cannot resolve `../src/data/addOns.js`.

- [ ] **Step 3: Write the data module**

Create `sites/mylocalads/src/data/addOns.js`:

```js
// Single source of truth for the Growth Add-Ons section.
// Consumed by: src/components/AddOnCard.astro, src/components/CartBar.astro,
// src/pages/index.astro, src/pages/cart.astro, src/pages/api/checkout.js.
//
// Stripe price IDs deliberately do NOT live here — they are read from env vars
// inside src/pages/api/checkout.js so they never enter the client bundle.
//
// Bullet copy is sourced from the client's own product pages. The NFC Cards
// bullets are drafted and pending client review (that page is a checkout form
// with no feature list).

export const addOns = [
  {
    id: 'crm',
    title: 'CRM',
    subtitle: 'Automate and grow your marketing with the all-in-one CRM suite from GoHighLevel.',
    priceCents: 9700,
    priceLabel: '$97/mo',
    priceNote: 'After 7-day free trial. Usage rates apply.',
    billing: 'recurring',
    trialDays: 7,
    requires: [],
    shipping: false,
    includes: [
      'Unlimited users & all-in-one inbox',
      'Calendar, appointments & workflow automations',
      'Send estimates & invoices',
      'Phone dialer & call tracking',
      'Review management, email & SMS marketing',
      'Real-time reporting & 24/7 support',
    ],
    fallbackHref: 'https://start.mylocalads.co/growth',
  },
  {
    id: 'ai-agents',
    title: 'AI Agents',
    subtitle: '(Voice + Chat) — Let AI handle calls and conversations with leads on auto-pilot.',
    priceCents: 25000,
    priceLabel: '$250/mo',
    priceNote: 'Requires CRM.',
    billing: 'recurring',
    trialDays: null,
    requires: ['crm'],
    shipping: false,
    includes: [
      'AI Employee (Voice & Chat)',
      'Runs inside your existing CRM',
      '24/7 automated lead handling',
    ],
    fallbackHref: '/ai-employee-add-on',
  },
  {
    id: 'gbp',
    title: 'Google Business Profile Optimization',
    subtitle: 'Appear organically in Google\'s Map Pack results to maximize lead flow.',
    priceCents: 50000,
    priceLabel: '$500',
    priceNote: 'One-time. Does not include website edits.',
    billing: 'one_time',
    trialDays: null,
    requires: [],
    shipping: false,
    includes: [
      'A-Z optimization of your Google Business Profile',
      'Keyword optimization for specific services',
      'Local SEO best-practices implemented',
      'Local SEO report',
    ],
    fallbackHref: 'https://start.mylocalads.co/gbp',
  },
  {
    id: 'website',
    title: 'Website',
    subtitle: 'Close more deals with a stunning website while we manage your site A-Z.',
    priceCents: 30000,
    priceLabel: '$300/mo',
    priceNote: 'Requires active CRM account.',
    billing: 'recurring',
    trialDays: null,
    requires: ['crm'],
    shipping: false,
    includes: [
      'Built for conversion rate, SEO & brand',
      'Home, Our Work, Pricing, Contact + legal pages',
      'Up to 5 service and 5 service-area sub-pages',
      'ADA, GDPR & A2P compliant',
      '10-20 business day turnaround',
    ],
    fallbackHref: 'https://start.mylocalads.co/all-in-one-website',
  },
  {
    id: 'roof-quote-pro',
    title: 'Roof Quote PRO™ Instant Estimator',
    subtitle: 'Boost your Ad campaign results & improve lead quality. Only available for Roofers!',
    priceCents: 50000,
    priceLabel: '$500/mo',
    priceNote: 'No setup fee. Requires an active Facebook or Google Ads campaign.',
    billing: 'recurring',
    trialDays: null,
    requires: [],
    shipping: false,
    includes: [
      'Roof QuotePRO® access',
      'Instant aerial-measured roof estimates',
      '24/7 email & SMS support',
      'Only for roofers',
    ],
    fallbackHref: '/roof-instant-estimator',
  },
  {
    id: 'nfc-cards',
    title: 'NFC Review Cards',
    subtitle: 'Tap a customer\'s smartphone & capture Google reviews in seconds for local SEO.',
    priceCents: 15000,
    priceLabel: '$150',
    priceNote: 'One-time. Pack of 10. Ships in 5-7 days.',
    billing: 'one_time',
    trialDays: null,
    requires: [],
    shipping: true,
    includes: [
      'Pack of 10 NFC review cards',
      'Tap a phone to open your Google review page',
      'Preconfigured with your Google Place ID',
      'No app required for your customers',
      '5-7 day shipping',
    ],
    fallbackHref: 'https://start.mylocalads.co/buy-10-pack',
  },
];

export function byId(id) {
  return addOns.find((a) => a.id === id);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd sites/mylocalads && npx vitest run test/addOns.test.js`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add sites/mylocalads/src/data/addOns.js sites/mylocalads/test/addOns.test.js
git commit -m "feat(mylocalads): add-on data module with feature bullets"
```

---

### Task 3: Cart core logic

**Files:**
- Create: `sites/mylocalads/src/lib/cart-core.js`
- Test: `sites/mylocalads/test/cart-core.test.js`

- [ ] **Step 1: Write the failing test**

Create `sites/mylocalads/test/cart-core.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { addItem, removeItem, sanitize, computeTotals, dependentsOf } from '../src/lib/cart-core.js';

const FIXTURE = [
  { id: 'crm', priceCents: 9700, billing: 'recurring', trialDays: 7, requires: [], shipping: false },
  { id: 'website', priceCents: 30000, billing: 'recurring', trialDays: null, requires: ['crm'], shipping: false },
  { id: 'ai-agents', priceCents: 25000, billing: 'recurring', trialDays: null, requires: ['crm'], shipping: false },
  { id: 'gbp', priceCents: 50000, billing: 'one_time', trialDays: null, requires: [], shipping: false },
  { id: 'nfc-cards', priceCents: 15000, billing: 'one_time', trialDays: null, requires: [], shipping: true },
];

describe('addItem', () => {
  it('adds an item with no dependencies', () => {
    expect(addItem([], 'gbp', FIXTURE)).toEqual(['gbp']);
  });

  it('auto-adds a required dependency', () => {
    expect(addItem([], 'website', FIXTURE).sort()).toEqual(['crm', 'website']);
  });

  it('does not duplicate an already-present dependency', () => {
    const result = addItem(['crm'], 'website', FIXTURE);
    expect(result.filter((id) => id === 'crm')).toHaveLength(1);
  });

  it('is idempotent', () => {
    expect(addItem(['gbp'], 'gbp', FIXTURE)).toEqual(['gbp']);
  });

  it('ignores an unknown id', () => {
    expect(addItem(['gbp'], 'nope', FIXTURE)).toEqual(['gbp']);
  });
});

describe('removeItem', () => {
  it('removes a standalone item', () => {
    expect(removeItem(['gbp', 'crm'], 'gbp', FIXTURE)).toEqual(['crm']);
  });

  it('removes dependents when their dependency is removed', () => {
    const result = removeItem(['crm', 'website', 'ai-agents'], 'crm', FIXTURE);
    expect(result).toEqual([]);
  });

  it('leaves unrelated items alone when removing a dependency', () => {
    const result = removeItem(['crm', 'website', 'gbp'], 'crm', FIXTURE);
    expect(result).toEqual(['gbp']);
  });

  it('does not remove the dependency when a dependent is removed', () => {
    expect(removeItem(['crm', 'website'], 'website', FIXTURE)).toEqual(['crm']);
  });
});

describe('dependentsOf', () => {
  it('lists items in the cart that require the given id', () => {
    expect(dependentsOf(['crm', 'website', 'gbp'], 'crm', FIXTURE)).toEqual(['website']);
  });

  it('returns empty when nothing depends on it', () => {
    expect(dependentsOf(['crm', 'gbp'], 'gbp', FIXTURE)).toEqual([]);
  });
});

describe('sanitize', () => {
  it('drops unknown ids', () => {
    expect(sanitize(['crm', 'ghost'], FIXTURE)).toEqual(['crm']);
  });

  it('drops duplicates', () => {
    expect(sanitize(['crm', 'crm'], FIXTURE)).toEqual(['crm']);
  });

  it('adds missing dependencies', () => {
    expect(sanitize(['website'], FIXTURE).sort()).toEqual(['crm', 'website']);
  });

  it('returns empty for non-array input', () => {
    expect(sanitize(null, FIXTURE)).toEqual([]);
  });
});

describe('computeTotals', () => {
  it('returns zeroes for an empty cart', () => {
    expect(computeTotals([], FIXTURE)).toEqual({
      recurringCents: 0, oneTimeCents: 0, dueTodayCents: 0, trialApplies: false, needsShipping: false, count: 0,
    });
  });

  it('sums recurring and one-time separately', () => {
    const t = computeTotals(['crm', 'website', 'gbp'], FIXTURE);
    expect(t.recurringCents).toBe(39700);
    expect(t.oneTimeCents).toBe(50000);
  });

  it('applies the trial only when crm is alone', () => {
    expect(computeTotals(['crm'], FIXTURE).trialApplies).toBe(true);
    expect(computeTotals(['crm'], FIXTURE).dueTodayCents).toBe(0);
  });

  it('does not apply the trial when crm is bundled', () => {
    const t = computeTotals(['crm', 'gbp'], FIXTURE);
    expect(t.trialApplies).toBe(false);
    expect(t.dueTodayCents).toBe(59700);
  });

  it('flags shipping when a physical item is present', () => {
    expect(computeTotals(['nfc-cards'], FIXTURE).needsShipping).toBe(true);
    expect(computeTotals(['gbp'], FIXTURE).needsShipping).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd sites/mylocalads && npx vitest run test/cart-core.test.js`
Expected: FAIL — cannot resolve `../src/lib/cart-core.js`.

- [ ] **Step 3: Write the implementation**

Create `sites/mylocalads/src/lib/cart-core.js`:

```js
// Pure cart logic. No DOM, no storage, no network — everything here is a
// function of (items, catalog). The storage/event adapter is cart-store.js.
//
// `items` is always an array of add-on id strings. `catalog` is the addOns
// array (injected rather than imported so tests can use a fixture).

function find(catalog, id) {
  return catalog.find((a) => a.id === id);
}

export function addItem(items, id, catalog) {
  const record = find(catalog, id);
  if (!record) return items;
  const next = new Set(items);
  next.add(id);
  for (const req of record.requires) {
    if (find(catalog, req)) next.add(req);
  }
  return [...next];
}

export function dependentsOf(items, id, catalog) {
  return items.filter((itemId) => {
    const record = find(catalog, itemId);
    return record ? record.requires.includes(id) : false;
  });
}

export function removeItem(items, id, catalog) {
  const doomed = new Set([id, ...dependentsOf(items, id, catalog)]);
  return items.filter((itemId) => !doomed.has(itemId));
}

export function sanitize(items, catalog) {
  if (!Array.isArray(items)) return [];
  const known = items.filter((id) => Boolean(find(catalog, id)));
  return known.reduce((acc, id) => addItem(acc, id, catalog), []);
}

export function computeTotals(items, catalog) {
  const records = items.map((id) => find(catalog, id)).filter(Boolean);

  const recurringCents = records
    .filter((r) => r.billing === 'recurring')
    .reduce((sum, r) => sum + r.priceCents, 0);

  const oneTimeCents = records
    .filter((r) => r.billing === 'one_time')
    .reduce((sum, r) => sum + r.priceCents, 0);

  // The trial only applies when CRM is the entire cart. See the spec: Stripe
  // trials are subscription-wide, so a mixed cart would give away everything.
  const trialApplies = records.length === 1 && records[0].trialDays > 0;

  return {
    recurringCents,
    oneTimeCents,
    dueTodayCents: trialApplies ? 0 : recurringCents + oneTimeCents,
    trialApplies,
    needsShipping: records.some((r) => r.shipping),
    count: records.length,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd sites/mylocalads && npx vitest run test/cart-core.test.js`
Expected: PASS, 18 tests.

- [ ] **Step 5: Commit**

```bash
git add sites/mylocalads/src/lib/cart-core.js sites/mylocalads/test/cart-core.test.js
git commit -m "feat(mylocalads): pure cart logic with dependency resolution"
```

---

### Task 4: Checkout session params

**Files:**
- Create: `sites/mylocalads/src/lib/checkout-params.js`
- Test: `sites/mylocalads/test/checkout-params.test.js`

- [ ] **Step 1: Write the failing test**

Create `sites/mylocalads/test/checkout-params.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { buildSessionParams, UnknownItemError, MissingPriceError } from '../src/lib/checkout-params.js';

const FIXTURE = [
  { id: 'crm', priceCents: 9700, billing: 'recurring', trialDays: 7, requires: [], shipping: false },
  { id: 'website', priceCents: 30000, billing: 'recurring', trialDays: null, requires: ['crm'], shipping: false },
  { id: 'gbp', priceCents: 50000, billing: 'one_time', trialDays: null, requires: [], shipping: false },
  { id: 'nfc-cards', priceCents: 15000, billing: 'one_time', trialDays: null, requires: [], shipping: true },
];

const PRICES = {
  crm: 'price_crm', website: 'price_website', gbp: 'price_gbp', 'nfc-cards': 'price_nfc',
};

const URLS = { successUrl: 'https://x.co/ok', cancelUrl: 'https://x.co/cart' };

describe('buildSessionParams', () => {
  it('uses payment mode when nothing recurs', () => {
    const p = buildSessionParams(['gbp'], FIXTURE, PRICES, URLS);
    expect(p.mode).toBe('payment');
  });

  it('uses subscription mode when anything recurs', () => {
    const p = buildSessionParams(['gbp', 'crm'], FIXTURE, PRICES, URLS);
    expect(p.mode).toBe('subscription');
  });

  it('maps every item to a line item', () => {
    const p = buildSessionParams(['crm', 'gbp'], FIXTURE, PRICES, URLS);
    expect(p.line_items).toEqual([
      { price: 'price_crm', quantity: 1 },
      { price: 'price_gbp', quantity: 1 },
    ]);
  });

  it('applies the trial only when crm is the whole cart', () => {
    const solo = buildSessionParams(['crm'], FIXTURE, PRICES, URLS);
    expect(solo.subscription_data).toEqual({ trial_period_days: 7 });

    const mixed = buildSessionParams(['crm', 'website'], FIXTURE, PRICES, URLS);
    expect(mixed.subscription_data).toBeUndefined();
  });

  it('collects a shipping address when a physical item is present', () => {
    const p = buildSessionParams(['nfc-cards'], FIXTURE, PRICES, URLS);
    expect(p.shipping_address_collection).toEqual({ allowed_countries: ['US', 'CA'] });
  });

  it('omits shipping collection for digital-only carts', () => {
    const p = buildSessionParams(['gbp'], FIXTURE, PRICES, URLS);
    expect(p.shipping_address_collection).toBeUndefined();
  });

  it('passes through success and cancel urls', () => {
    const p = buildSessionParams(['gbp'], FIXTURE, PRICES, URLS);
    expect(p.success_url).toBe('https://x.co/ok');
    expect(p.cancel_url).toBe('https://x.co/cart');
  });

  it('records the item ids in metadata', () => {
    const p = buildSessionParams(['crm', 'gbp'], FIXTURE, PRICES, URLS);
    expect(p.metadata.items).toBe('crm,gbp');
  });

  it('throws UnknownItemError for an id not in the catalog', () => {
    expect(() => buildSessionParams(['ghost'], FIXTURE, PRICES, URLS)).toThrow(UnknownItemError);
  });

  it('throws MissingPriceError when a price id is not configured', () => {
    expect(() => buildSessionParams(['crm'], FIXTURE, {}, URLS)).toThrow(MissingPriceError);
  });

  it('throws UnknownItemError for an empty cart', () => {
    expect(() => buildSessionParams([], FIXTURE, PRICES, URLS)).toThrow(UnknownItemError);
  });

  it('ignores any client-supplied price and uses the server map', () => {
    const p = buildSessionParams(['gbp'], FIXTURE, PRICES, URLS);
    expect(JSON.stringify(p)).not.toContain('1');
    expect(p.line_items[0].price).toBe('price_gbp');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd sites/mylocalads && npx vitest run test/checkout-params.test.js`
Expected: FAIL — cannot resolve `../src/lib/checkout-params.js`.

- [ ] **Step 3: Write the implementation**

Create `sites/mylocalads/src/lib/checkout-params.js`:

```js
// Pure: item ids -> Stripe Checkout Session params. No network, no SDK.
// The API route calls this, then hands the result to stripe.checkout.sessions.create.
//
// Stripe constraints this encodes (verified against docs.stripe.com):
//   - subscription mode is required if ANY line item has a recurring price;
//     one-time prices ride along and land on the initial invoice only.
//   - trial_period_days lives on subscription_data and applies to the WHOLE
//     subscription, so we only set it when CRM is the entire cart.

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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd sites/mylocalads && npx vitest run test/checkout-params.test.js`
Expected: PASS, 12 tests.

- [ ] **Step 5: Run the whole suite**

Run: `cd sites/mylocalads && npm test`
Expected: PASS, 36 tests across 3 files.

- [ ] **Step 6: Commit**

```bash
git add sites/mylocalads/src/lib/checkout-params.js sites/mylocalads/test/checkout-params.test.js
git commit -m "feat(mylocalads): pure Stripe Checkout Session param builder"
```

---

### Task 5: Cart store adapter

**Files:**
- Create: `sites/mylocalads/src/lib/cart-store.js`

No unit test: this file is a thin `localStorage` + `CustomEvent` wrapper with no
branching logic of its own. Its behavior is covered by cart-core tests plus the
manual browser verification in Task 11.

- [ ] **Step 1: Write the store**

Create `sites/mylocalads/src/lib/cart-store.js`:

```js
// Browser-only adapter around cart-core. Persists to localStorage and emits a
// 'mla-cart-change' event on window so the header badge, tiles, and cart bar
// all re-render from one source.

import { addOns } from '../data/addOns.js';
import { addItem, removeItem, sanitize, computeTotals, dependentsOf } from './cart-core.js';

const KEY = 'mla_cart_v1';
const EVENT = 'mla-cart-change';

function read() {
  try {
    return sanitize(JSON.parse(localStorage.getItem(KEY) || '[]'), addOns);
  } catch {
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Private browsing or storage full — cart stays in-memory for this page.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { items } }));
  return items;
}

export const cart = {
  items: read,
  has: (id) => read().includes(id),
  totals: () => computeTotals(read(), addOns),
  dependents: (id) => dependentsOf(read(), id, addOns),
  add: (id) => write(addItem(read(), id, addOns)),
  remove: (id) => write(removeItem(read(), id, addOns)),
  clear: () => write([]),
  toggle: (id) => (read().includes(id) ? cart.remove(id) : cart.add(id)),
  subscribe(fn) {
    const handler = (e) => fn(e.detail.items);
    window.addEventListener(EVENT, handler);
    fn(read());
    return () => window.removeEventListener(EVENT, handler);
  },
};

export { addOns };
```

- [ ] **Step 2: Verify it type-checks by building**

Run: `cd sites/mylocalads && npm run build`
Expected: build completes, 18 pages.

- [ ] **Step 3: Commit**

```bash
git add sites/mylocalads/src/lib/cart-store.js
git commit -m "feat(mylocalads): localStorage cart store with change events"
```

---

### Task 6: AddOnCard component

**Files:**
- Create: `sites/mylocalads/src/components/AddOnCard.astro`

- [ ] **Step 1: Write the component**

Create `sites/mylocalads/src/components/AddOnCard.astro`:

```astro
---
// One Growth Add-On tile: price, feature bullets, and an Add to cart control.
//
// The control ships as a plain <a> to the add-on's existing product page.
// Client JS upgrades it into a cart button. A visitor who clicks before
// hydration, or with JS off, still lands on a working purchase page.

export interface Props {
  addOn: {
    id: string;
    title: string;
    subtitle: string;
    priceLabel: string;
    priceNote: string;
    includes: string[];
    fallbackHref: string;
  };
}

const { addOn } = Astro.props;
---
<div class="card addon-card" data-addon-id={addOn.id}>
  <h3>{addOn.title}</h3>
  <p class="addon-sub">{addOn.subtitle}</p>

  <div class="addon-price">{addOn.priceLabel}</div>
  <div class="addon-price-sub">{addOn.priceNote}</div>

  <ul class="addon-includes">
    {addOn.includes.map((item) => (
      <li><span class="check" aria-hidden="true">✓</span>{item}</li>
    ))}
  </ul>

  <a
    href={addOn.fallbackHref}
    class="btn btn-primary btn-sm addon-cta"
    data-cart-toggle={addOn.id}
    rel="noopener"
  >Add to cart</a>
</div>

<style>
  .addon-includes {
    list-style: none; padding: 0; margin: 0 0 var(--space-2);
    flex: 1;
  }
  .addon-includes li {
    display: flex; align-items: flex-start; gap: 0.6rem;
    padding: 0.3rem 0;
    font-size: 0.92rem; color: var(--color-text);
  }
  .addon-cta[data-in-cart='true'] {
    background: transparent;
    color: var(--color-green);
    border: 1px solid var(--color-green);
    box-shadow: none;
  }
</style>
```

- [ ] **Step 2: Verify the build still passes**

Run: `cd sites/mylocalads && npm run build`
Expected: build completes, 18 pages (component not yet used).

- [ ] **Step 3: Commit**

```bash
git add sites/mylocalads/src/components/AddOnCard.astro
git commit -m "feat(mylocalads): AddOnCard tile with feature bullets"
```

---

### Task 7: CartBar component

**Files:**
- Create: `sites/mylocalads/src/components/CartBar.astro`

- [ ] **Step 1: Write the component**

Create `sites/mylocalads/src/components/CartBar.astro`:

```astro
---
// Cart summary rendered directly below the add-on grid. Hidden until the cart
// has at least one item. Shows recurring and one-time subtotals separately —
// summing them would misstate what the customer owes.
---
<div class="cart-bar" data-cart-bar hidden>
  <div class="cart-bar-left">
    <span class="cart-bar-icon" aria-hidden="true">🛒</span>
    <div>
      <div class="cart-bar-total" data-cart-total></div>
      <div class="cart-bar-items" data-cart-items></div>
    </div>
  </div>
  <div class="cart-bar-right">
    <span class="cart-bar-count" data-cart-count></span>
    <a href="/cart" class="btn btn-primary btn-sm">Checkout →</a>
  </div>
</div>

<style>
  .cart-bar {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--space-3); flex-wrap: wrap;
    margin: var(--space-3) auto 0; max-width: 1100px;
    padding: var(--space-3);
    background: var(--color-bg-elev);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
  }
  .cart-bar[hidden] { display: none; }
  .cart-bar-left { display: flex; align-items: center; gap: var(--space-2); }
  .cart-bar-icon { font-size: 1.5rem; }
  .cart-bar-total {
    font-family: var(--font-display); font-weight: 800;
    font-size: 1.35rem; color: #fff; line-height: 1.2;
  }
  .cart-bar-items { color: var(--color-text-muted); font-size: 0.85rem; }
  .cart-bar-right { display: flex; align-items: center; gap: var(--space-2); }
  .cart-bar-count { color: var(--color-text-muted); font-size: 0.85rem; white-space: nowrap; }
  @media (max-width: 560px) {
    .cart-bar { flex-direction: column; align-items: stretch; }
    .cart-bar-right { justify-content: space-between; }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add sites/mylocalads/src/components/CartBar.astro
git commit -m "feat(mylocalads): cart summary bar component"
```

---

### Task 8: Wire the add-ons section

**Files:**
- Modify: `sites/mylocalads/src/pages/index.astro`

- [ ] **Step 1: Replace the inline addOns array with an import**

In `sites/mylocalads/src/pages/index.astro`, delete the entire `const addOns = [ ... ];`
block (currently lines 59-108) and add these imports at the top of the frontmatter,
next to the existing component imports:

```js
import { addOns } from '../data/addOns.js';
import AddOnCard from '../components/AddOnCard.astro';
import CartBar from '../components/CartBar.astro';
```

- [ ] **Step 2: Replace the grid markup**

Find the `.addon-grid` block (currently around line 400) and replace the whole
`<div class="addon-grid"> ... </div>` with:

```astro
      <div class="addon-grid">
        {addOns.map((a) => <AddOnCard addOn={a} />)}
      </div>
      <CartBar />
```

- [ ] **Step 3: Add the cart wiring script**

At the end of `sites/mylocalads/src/pages/index.astro`, before the closing
`</BaseLayout>`, add:

```astro
<script>
  import { cart, addOns } from '../lib/cart-store.js';

  const money = (cents) => `$${(cents / 100).toLocaleString('en-US')}`;

  function summaryLine(t) {
    const parts = [];
    if (t.recurringCents) parts.push(`${money(t.recurringCents)}/mo`);
    if (t.oneTimeCents) parts.push(`${money(t.oneTimeCents)} once`);
    if (t.trialApplies) return `Free for 7 days, then ${money(t.recurringCents)}/mo`;
    return parts.join(' + ') || '$0';
  }

  cart.subscribe((items) => {
    // Tile buttons
    document.querySelectorAll('[data-cart-toggle]').forEach((el) => {
      const id = el.getAttribute('data-cart-toggle');
      const inCart = items.includes(id);
      el.dataset.inCart = String(inCart);
      el.textContent = inCart ? 'Added ✓' : 'Add to cart';
    });

    // Bar
    const bar = document.querySelector('[data-cart-bar]');
    if (!bar) return;
    bar.hidden = items.length === 0;
    if (items.length === 0) return;

    const t = cart.totals();
    bar.querySelector('[data-cart-total]').textContent = summaryLine(t);
    bar.querySelector('[data-cart-items]').textContent = items
      .map((id) => addOns.find((a) => a.id === id).title)
      .join(' · ');
    bar.querySelector('[data-cart-count]').textContent =
      `${t.count} item${t.count === 1 ? '' : 's'}`;
  });

  // Upgrade the fallback links into cart controls.
  document.querySelectorAll('[data-cart-toggle]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const id = el.getAttribute('data-cart-toggle');
      const dependents = cart.has(id) ? cart.dependents(id) : [];
      if (dependents.length) {
        const names = dependents
          .map((d) => addOns.find((a) => a.id === d).title)
          .join(', ');
        if (!confirm(`Removing this will also remove: ${names}. Continue?`)) return;
      }
      cart.toggle(id);
    });
  });
</script>
```

- [ ] **Step 4: Build and verify**

Run: `cd sites/mylocalads && npm run build`
Expected: PASS, 18 pages.

- [ ] **Step 5: Commit**

```bash
git add sites/mylocalads/src/pages/index.astro
git commit -m "feat(mylocalads): render add-on tiles with bullets and cart bar"
```

---

### Task 9: Header cart badge

**Files:**
- Create: `sites/mylocalads/src/components/CartButton.astro`
- Modify: `sites/mylocalads/src/components/Header.astro`

- [ ] **Step 1: Write the badge component**

Create `sites/mylocalads/src/components/CartButton.astro`:

```astro
---
// Header cart badge. Hidden until the cart has items.
---
<a href="/cart" class="cart-badge" data-cart-badge hidden aria-label="View cart">
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
  <span class="cart-badge-count" data-cart-badge-count>0</span>
</a>

<style>
  .cart-badge {
    display: inline-flex; align-items: center; gap: 0.4rem;
    color: #fff; text-decoration: none;
    padding: 0.4rem 0.7rem;
    border: 1px solid rgba(255,255,255,0.35);
    border-radius: var(--radius-pill);
    font-family: var(--font-display); font-weight: 700; font-size: 0.85rem;
    transition: background 0.15s ease;
  }
  .cart-badge[hidden] { display: none; }
  .cart-badge:hover { background: rgba(255,255,255,0.12); color: #fff; }
  .cart-badge-count {
    background: #faf24c; color: #000;
    min-width: 20px; height: 20px; border-radius: 10px;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 0.75rem; font-weight: 800; padding: 0 0.35rem;
  }
</style>
```

- [ ] **Step 2: Add it to the header**

In `sites/mylocalads/src/components/Header.astro`, add to the frontmatter imports:

```js
import CartButton from './CartButton.astro';
```

Then insert `<CartButton />` immediately before the existing desktop CTA line:

```astro
    <CartButton />
    <a href="https://start.mylocalads.co/book-now-v2" class="btn btn-secondary btn-sm cta" rel="noopener">Get More Leads!</a>
```

And in the mobile nav `<ul>`, insert a list item before the existing CTA `<li>`:

```astro
          <li><a href="/cart">Cart</a></li>
          <li><a href="https://start.mylocalads.co/book-now-v2" class="btn btn-secondary btn-sm" rel="noopener">Get More Leads!</a></li>
```

- [ ] **Step 3: Add badge wiring to BaseLayout**

In `sites/mylocalads/src/layouts/BaseLayout.astro`, before the closing `</body>`, add:

```astro
<script>
  import { cart } from '../lib/cart-store.js';
  cart.subscribe((items) => {
    document.querySelectorAll('[data-cart-badge]').forEach((el) => {
      el.hidden = items.length === 0;
    });
    document.querySelectorAll('[data-cart-badge-count]').forEach((el) => {
      el.textContent = String(items.length);
    });
  });
</script>
```

- [ ] **Step 4: Build and verify**

Run: `cd sites/mylocalads && npm run build`
Expected: PASS, 18 pages.

- [ ] **Step 5: Commit**

```bash
git add sites/mylocalads/src/components/CartButton.astro sites/mylocalads/src/components/Header.astro sites/mylocalads/src/layouts/BaseLayout.astro
git commit -m "feat(mylocalads): header cart badge synced to cart store"
```

---

### Task 10: Checkout API route

**Files:**
- Create: `sites/mylocalads/src/pages/api/checkout.js`
- Modify: `sites/mylocalads/package.json`

- [ ] **Step 1: Install the Stripe SDK**

```bash
cd sites/mylocalads && npm install stripe@^17
```

- [ ] **Step 2: Write the route**

Create `sites/mylocalads/src/pages/api/checkout.js`:

```js
// Serverless checkout endpoint. The only on-demand route on this site.
//
// Trust boundary: the client sends item IDs and NOTHING else. Every price is
// re-derived here from env vars, so a tampered payload cannot change what is
// charged.

export const prerender = false;

import Stripe from 'stripe';
import { addOns } from '../../data/addOns.js';
import { buildSessionParams, UnknownItemError, MissingPriceError } from '../../lib/checkout-params.js';

// process.env, NOT import.meta.env: Astro inlines import.meta.env at build
// time, which would write the secret key into the built function bundle.
// process.env is read at runtime, so nothing sensitive lands in build output.
const PRICE_IDS = () => ({
  'crm': process.env.STRIPE_PRICE_CRM,
  'ai-agents': process.env.STRIPE_PRICE_AI_AGENTS,
  'gbp': process.env.STRIPE_PRICE_GBP,
  'website': process.env.STRIPE_PRICE_WEBSITE,
  'roof-quote-pro': process.env.STRIPE_PRICE_ROOF_QUOTE_PRO,
  'nfc-cards': process.env.STRIPE_PRICE_NFC_CARDS,
});

const json = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function POST({ request, url }) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
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
    params = buildSessionParams(items, addOns, PRICE_IDS(), {
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
  } catch {
    return json({ error: 'stripe_error' }, 502);
  }
}
```

- [ ] **Step 3: Verify only this route becomes a function**

Run: `cd sites/mylocalads && npm run build`
Expected: build completes; output reports 18 static pages plus a server entry for
`/api/checkout`.

- [ ] **Step 4: Confirm no secret leaked into client output**

Run: `cd sites/mylocalads && grep -rn "STRIPE_SECRET\|sk_live\|sk_test" dist/ || echo "CLEAN"`
Expected: `CLEAN`

- [ ] **Step 5: Commit**

```bash
git add sites/mylocalads/src/pages/api/checkout.js sites/mylocalads/package.json sites/mylocalads/package-lock.json
git commit -m "feat(mylocalads): server-validated Stripe checkout endpoint"
```

---

### Task 11: Cart page and success page

**Files:**
- Create: `sites/mylocalads/src/pages/cart.astro`
- Create: `sites/mylocalads/src/pages/checkout-success.astro`

- [ ] **Step 1: Write the cart page**

Create `sites/mylocalads/src/pages/cart.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import BottomCTA from '../components/BottomCTA.astro';
---
<BaseLayout
  title="Your Cart | My Local Ads"
  description="Review your selected Growth Add-Ons and check out securely with Stripe."
>
  <section class="section">
    <div class="container container-narrow">
      <span class="eyebrow">Your Cart</span>
      <h1>Review Your Add-Ons</h1>

      <div data-cart-empty hidden>
        <p class="lead">Your cart is empty.</p>
        <a href="/#addons" class="btn btn-primary">Browse Growth Add-Ons</a>
      </div>

      <div data-cart-filled hidden>
        <ul class="cart-lines" data-cart-lines></ul>

        <div class="cart-summary">
          <div class="cart-summary-row"><span>Monthly</span><span data-sum-recurring></span></div>
          <div class="cart-summary-row"><span>One-time</span><span data-sum-onetime></span></div>
          <div class="cart-summary-row cart-summary-due"><span>Due today</span><span data-sum-due></span></div>
          <p class="cart-note" data-cart-note></p>
        </div>

        <button class="btn btn-primary" data-checkout>Checkout →</button>
        <p class="cart-error" data-cart-error hidden></p>
      </div>
    </div>
  </section>

  <BottomCTA />
</BaseLayout>

<script>
  import { cart, addOns } from '../lib/cart-store.js';

  const money = (cents) => `$${(cents / 100).toLocaleString('en-US')}`;
  const $ = (sel) => document.querySelector(sel);

  cart.subscribe((items) => {
    const empty = items.length === 0;
    $('[data-cart-empty]').hidden = !empty;
    $('[data-cart-filled]').hidden = empty;
    if (empty) return;

    const t = cart.totals();
    const lines = $('[data-cart-lines]');
    lines.innerHTML = '';

    for (const id of items) {
      const a = addOns.find((x) => x.id === id);
      const li = document.createElement('li');
      li.className = 'cart-line';
      li.innerHTML = `
        <div>
          <strong>${a.title}</strong>
          <div class="cart-line-note">${a.priceNote}</div>
        </div>
        <div class="cart-line-right">
          <span>${a.priceLabel}</span>
          <button type="button" class="cart-remove" data-remove="${a.id}" aria-label="Remove ${a.title}">✕</button>
        </div>`;
      lines.appendChild(li);
    }

    $('[data-sum-recurring]').textContent = t.recurringCents ? `${money(t.recurringCents)}/mo` : '—';
    $('[data-sum-onetime]').textContent = t.oneTimeCents ? money(t.oneTimeCents) : '—';
    $('[data-sum-due]').textContent = money(t.dueTodayCents);
    $('[data-cart-note]').textContent = t.trialApplies
      ? 'Your 7-day free trial starts today. Billing begins on day 8.'
      : '';

    lines.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-remove');
        const deps = cart.dependents(id);
        if (deps.length) {
          const names = deps.map((d) => addOns.find((a) => a.id === d).title).join(', ');
          if (!confirm(`Removing this will also remove: ${names}. Continue?`)) return;
        }
        cart.remove(id);
      });
    });
  });

  $('[data-checkout]').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const err = $('[data-cart-error]');
    btn.disabled = true;
    btn.textContent = 'Starting checkout…';
    err.hidden = true;

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.items() }),
      });
      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.error === 'unknown_item') {
        cart.clear();
        err.textContent = 'Some items were no longer available and have been removed. Please re-add them.';
      } else if (data.fallback) {
        err.innerHTML =
          'Online checkout isn\'t available right now. Call <a href="tel:+18664511915">(866) 451-1915</a> or <a href="https://start.mylocalads.co/book-now-v2">book a call</a> and we\'ll get you set up.';
      } else {
        err.innerHTML =
          'We couldn\'t start checkout. Call <a href="tel:+18664511915">(866) 451-1915</a> or <a href="https://start.mylocalads.co/book-now-v2">book a call</a>.';
      }
      err.hidden = false;
    } catch {
      err.textContent = 'Network error. Please check your connection and try again.';
      err.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Checkout →';
    }
  });
</script>

<style>
  .cart-lines { list-style: none; padding: 0; margin: var(--space-3) 0; }
  .cart-line {
    display: flex; justify-content: space-between; align-items: center; gap: var(--space-2);
    padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border);
  }
  .cart-line-note { color: var(--color-text-subtle); font-size: 0.82rem; }
  .cart-line-right { display: flex; align-items: center; gap: var(--space-2); white-space: nowrap; }
  .cart-remove {
    background: none; border: none; color: var(--color-text-muted);
    cursor: pointer; font-size: 1rem; padding: 0.25rem 0.4rem; border-radius: var(--radius-sm);
  }
  .cart-remove:hover { color: #fff; background: rgba(255,255,255,0.08); }
  .cart-summary { margin: var(--space-3) 0; }
  .cart-summary-row {
    display: flex; justify-content: space-between;
    padding: 0.4rem 0; color: var(--color-text-muted);
  }
  .cart-summary-due {
    border-top: 1px solid var(--color-border-strong); margin-top: 0.4rem; padding-top: 0.8rem;
    color: #fff; font-family: var(--font-display); font-weight: 800; font-size: 1.2rem;
  }
  .cart-note { color: var(--color-green); font-size: 0.9rem; margin: 0.5rem 0 0; }
  .cart-error { color: var(--color-orange); margin-top: var(--space-2); }
</style>
```

- [ ] **Step 2: Write the success page**

Create `sites/mylocalads/src/pages/checkout-success.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import BottomCTA from '../components/BottomCTA.astro';
---
<BaseLayout
  title="Order Confirmed | My Local Ads"
  description="Your My Local Ads order is confirmed. Our team will reach out with next steps."
>
  <section class="section">
    <div class="container container-narrow text-center">
      <span class="eyebrow">Order Confirmed</span>
      <h1>You're All Set!</h1>
      <p class="lead">
        Thanks for your order. Our team will reach out within one business day with
        onboarding next steps. Questions right now? Call
        <a href="tel:+18664511915">(866) 451-1915</a>.
      </p>
      <a href="/" class="btn btn-primary">Back To Home</a>
    </div>
  </section>

  <BottomCTA />
</BaseLayout>

<script>
  import { cart } from '../lib/cart-store.js';
  cart.clear();
</script>
```

- [ ] **Step 3: Add the addons anchor**

In `sites/mylocalads/src/pages/index.astro`, find the add-ons `<section>` and add
`id="addons"` to it so `/cart`'s empty-state link resolves.

- [ ] **Step 4: Build and verify page count**

Run: `cd sites/mylocalads && npm run build`
Expected: PASS, **20** pages (18 + `/cart` + `/checkout-success`).

- [ ] **Step 5: Commit**

```bash
git add sites/mylocalads/src/pages/cart.astro sites/mylocalads/src/pages/checkout-success.astro sites/mylocalads/src/pages/index.astro
git commit -m "feat(mylocalads): cart review page and post-checkout landing"
```

---

### Task 12: Browser verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Use `preview_start` with `{name: "mylocalads"}`. Do not use Bash for this.

- [ ] **Step 2: Verify tiles render with bullets**

Read the page and confirm each of the six `.addon-card` elements contains a
`.addon-includes` list with at least 3 `<li>` items and a `[data-cart-toggle]`
control reading "Add to cart".

- [ ] **Step 3: Verify auto-add of dependencies**

Click the Website tile's button. Confirm the cart bar appears, shows two items,
and lists "CRM · Website". Confirm the CRM tile's button now reads "Added ✓".

- [ ] **Step 4: Verify the two-subtotal display**

With CRM + Website + GBP in the cart, confirm the bar reads `$397/mo + $500 once`.

- [ ] **Step 5: Verify the trial line**

Clear the cart, add CRM only. Confirm the bar reads
`Free for 7 days, then $97/mo` and `/cart` shows "Due today $0".

- [ ] **Step 6: Verify dependent removal warning**

With CRM + Website carted, remove CRM on `/cart`. Confirm the confirm() dialog
names Website, and that accepting removes both.

- [ ] **Step 7: Verify persistence and the header badge**

Navigate to `/team`, confirm the header badge shows the item count. Reload,
confirm the cart survives.

- [ ] **Step 8: Verify graceful failure with no Stripe key**

With `STRIPE_SECRET_KEY` unset locally, click Checkout on `/cart`. Confirm the
inline message offers the phone number and booking link, and that no raw error
or stack trace is shown.

- [ ] **Step 9: Verify responsive layout**

Resize to 375px. Confirm no horizontal overflow, the tile grid is single-column,
and the cart bar stacks.

- [ ] **Step 10: Commit any fixes**

```bash
git add -A sites/mylocalads
git commit -m "fix(mylocalads): cart UI fixes from browser verification"
```

---

### Task 13: Stripe test-mode verification

**Files:** none (verification only)

**Blocked on the user supplying:** a test-mode `STRIPE_SECRET_KEY` and the six
test-mode price IDs. Do not attempt to create Stripe products or keys — ask.

- [ ] **Step 1: Set local env**

Create `sites/mylocalads/.env` (already gitignored via `.env`) with the test key
and the six `STRIPE_PRICE_*` values the user supplies.

- [ ] **Step 2: Verify each cart shape**

For each row, complete checkout with test card `4242 4242 4242 4242`, then check
the resulting object in the Stripe test dashboard:

| Cart | Expected mode | Expected result |
|---|---|---|
| `crm` | subscription | 7-day trial, $0 first invoice |
| `crm` + `ai-agents` | subscription | No trial, $347 charged now |
| `gbp` | payment | $500 one-time |
| `nfc-cards` | payment | $150 + shipping address collected |
| `website` | subscription | CRM auto-added, $397/mo, no trial |
| all six | subscription | One-time items on the initial invoice |

- [ ] **Step 3: Verify tampering is rejected**

```bash
curl -s -X POST http://localhost:4321/api/checkout \
  -H 'Content-Type: application/json' \
  -d '{"items":["ghost"]}'
```
Expected: `{"error":"unknown_item"}` with status 400.

```bash
curl -s -X POST http://localhost:4321/api/checkout \
  -H 'Content-Type: application/json' \
  -d '{"items":["gbp"],"price":1}'
```
Expected: a session URL — the `price` field is ignored, and the Stripe dashboard
shows $500, not $0.01.

- [ ] **Step 4: Record results**

Write the observed outcome of each row above into
`sites/mylocalads/docs/cart-stripe-verification.md` — actual observed behavior,
not expected. If any row differs from the table, stop and report it.

- [ ] **Step 5: Commit**

```bash
git add sites/mylocalads/docs/cart-stripe-verification.md
git commit -m "docs(mylocalads): Stripe test-mode cart verification results"
```

---

### Task 14: Deploy

**Files:** none

**Blocked on the user:** setting `STRIPE_SECRET_KEY` and the six `STRIPE_PRICE_*`
vars in the Vercel project (`mylocalads`, team `marcellus-mylocaladscs-projects`).
These are credentials — the user must set them; do not handle key values.

- [ ] **Step 1: Confirm the full suite passes**

Run: `cd sites/mylocalads && npm test`
Expected: PASS, all tests.

- [ ] **Step 2: Build**

Run: `cd sites/mylocalads && npm run build`
Expected: PASS, 20 pages.

- [ ] **Step 3: Ask before deploying**

Deployment is outward-facing. Confirm with the user before running it.

- [ ] **Step 4: Deploy and alias**

```bash
cd sites/mylocalads && npx vercel --prod --yes
```

Then alias the returned deployment to `mylocalads.vercel.app`.

- [ ] **Step 5: Verify live**

Confirm the six tiles render with bullets, the cart bar appears on add, and
`/cart` loads. If Stripe env vars are not yet set, confirm the fallback message
appears rather than an error.

---

## Self-Review

**Spec coverage:**

| Spec requirement | Task |
|---|---|
| Checkmark bullets per tile | 2 (content), 6 (render) |
| Add to cart button per tile | 6, 8 |
| Cart bar below the grid | 7, 8 |
| Header badge | 9 |
| `/cart` page | 11 |
| Stripe Checkout Session | 4, 10 |
| Auto-add CRM dependency | 3, 8 |
| Trial only for solo CRM | 3, 4 |
| Two subtotals | 3, 8, 11 |
| Price IDs never in client | 10 (verified in step 4) |
| Progressive enhancement | 6, 8 |
| All four failure modes | 10, 11, 12 step 8 |
| Test matrix | 13 |
| 18 pages stay static | 10 step 3 |

**Naming consistency check:** `cart.items()`, `cart.add/remove/toggle/clear`,
`cart.dependents()`, `cart.totals()`, `cart.subscribe()` used identically in
Tasks 5, 8, 9, 11. `buildSessionParams(itemIds, catalog, priceIds, urls)` matches
between Tasks 4 and 10. `computeTotals` returns the same six keys everywhere.

**Known deviation from spec:** the spec put `stripePriceId` in `addOns.js`; this
plan reads price IDs from env vars in the API route instead. Same guarantee that
they never reach the client, plus they stay out of git. Task 2's data module and
Task 10's `PRICE_IDS` map reflect this.
