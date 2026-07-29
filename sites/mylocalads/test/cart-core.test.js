import { describe, it, expect } from 'vitest';
import { addItem, removeItem, sanitize, computeTotals, dependentsOf } from '../src/lib/cart-core.js';

// Fixture rather than the real catalog: these tests describe the LOGIC, and
// should not break when a price changes or an add-on is added/removed.
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
    expect(removeItem(['crm', 'website', 'ai-agents'], 'crm', FIXTURE)).toEqual([]);
  });

  it('leaves unrelated items alone when removing a dependency', () => {
    expect(removeItem(['crm', 'website', 'gbp'], 'crm', FIXTURE)).toEqual(['gbp']);
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
      recurringCents: 0,
      oneTimeCents: 0,
      dueTodayCents: 0,
      trialApplies: false,
      needsShipping: false,
      count: 0,
    });
  });

  it('sums recurring and one-time separately', () => {
    const t = computeTotals(['crm', 'website', 'gbp'], FIXTURE);
    expect(t.recurringCents).toBe(39700);
    expect(t.oneTimeCents).toBe(50000);
  });

  it('applies the trial only when crm is alone', () => {
    const t = computeTotals(['crm'], FIXTURE);
    expect(t.trialApplies).toBe(true);
    expect(t.dueTodayCents).toBe(0);
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

  it('ignores unknown ids when totalling', () => {
    expect(computeTotals(['crm', 'ghost'], FIXTURE).recurringCents).toBe(9700);
  });
});
