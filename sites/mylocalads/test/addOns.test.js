import { describe, it, expect } from 'vitest';
import { addOns, byId, bySection } from '../src/data/addOns.js';

describe('addOns data', () => {
  it('has seven entries: four add-ons plus three Ads Plan commit terms', () => {
    expect(addOns).toHaveLength(7);
    expect(bySection('addons')).toHaveLength(4);
    expect(bySection('ppl')).toHaveLength(3);
  });

  it('gives every add-on the required fields', () => {
    for (const a of addOns) {
      expect(typeof a.id, `${a.id}.id`).toBe('string');
      expect(typeof a.title, `${a.id}.title`).toBe('string');
      expect(typeof a.subtitle, `${a.id}.subtitle`).toBe('string');
      expect(typeof a.priceCents, `${a.id}.priceCents`).toBe('number');
      expect(a.priceCents, `${a.id}.priceCents`).toBeGreaterThan(0);
      expect(typeof a.priceLabel, `${a.id}.priceLabel`).toBe('string');
      expect(['recurring', 'one_time'], `${a.id}.billing`).toContain(a.billing);
      expect(Array.isArray(a.includes), `${a.id}.includes`).toBe(true);
      expect(a.includes.length, `${a.id}.includes`).toBeGreaterThanOrEqual(3);
      expect(typeof a.fallbackHref, `${a.id}.fallbackHref`).toBe('string');
      expect(Array.isArray(a.requires), `${a.id}.requires`).toBe(true);
      expect(typeof a.shipping, `${a.id}.shipping`).toBe('boolean');
      expect(typeof a.planLabel, `${a.id}.planLabel`).toBe('string');
      expect(['addons', 'ppl'], `${a.id}.section`).toContain(a.section);
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

  it('has no circular dependencies', () => {
    for (const a of addOns) {
      for (const req of a.requires) {
        const dep = addOns.find((x) => x.id === req);
        expect(dep.requires, `${a.id} <-> ${req} is circular`).not.toContain(a.id);
      }
    }
  });

  it('gives a trial only to crm', () => {
    for (const a of addOns) {
      if (a.id === 'crm') expect(a.trialDays).toBe(7);
      else expect(a.trialDays, `${a.id} should have no trial`).toBeNull();
    }
  });

  // Guards against a label and an amount drifting apart — the cart totals from
  // priceCents while the tile displays priceLabel, so a mismatch would show one
  // price and charge another. Compares thousands-separated, matching the label.
  it('states a price label consistent with priceCents', () => {
    for (const a of addOns) {
      const formatted = (a.priceCents / 100).toLocaleString('en-US');
      expect(a.priceLabel, `${a.id} label vs priceCents`).toContain(formatted);
    }
  });

  it('states a was-price higher than the price actually charged', () => {
    for (const a of addOns.filter((x) => x.wasPriceLabel)) {
      const was = Number(a.wasPriceLabel.replace(/[$,]/g, '')) * 100;
      expect(was, `${a.id}`).toBeGreaterThan(a.priceCents);
    }
  });

  it('has exactly one one-time product: the Ads Plan setup fee', () => {
    const oneTime = addOns.filter((a) => a.billing === 'one_time');
    expect(oneTime).toHaveLength(3);
    expect(oneTime.every((a) => a.group === 'ppl-ads')).toBe(true);
  });

  it('groups the three Ads Plan terms so only one can be carted', () => {
    const ads = addOns.filter((a) => a.group === 'ppl-ads');
    expect(ads).toHaveLength(3);
    expect(new Set(ads.map((a) => a.priceCents)).size).toBe(1);
  });

  it('shows the struck-through list price only on the discounted Ads Plan', () => {
    for (const a of addOns) {
      if (a.group === 'ppl-ads') expect(a.wasPriceLabel).toBe('$5,000');
      else expect(a.wasPriceLabel, `${a.id}`).toBeNull();
    }
  });

  it('no longer includes Roof Quote PRO', () => {
    expect(byId('roof-quote-pro')).toBeUndefined();
  });

  it('has no physical products, so no cart needs shipping', () => {
    expect(addOns.every((a) => a.shipping === false)).toBe(true);
  });

  // Tiles are ~330px wide; bullets longer than this wrap to a second line and
  // break the tiles' even rhythm. 32 chars is the measured safe ceiling.
  it('keeps every bullet short enough to render on one line', () => {
    for (const a of addOns) {
      for (const b of a.includes) {
        expect(b.length, `${a.id}: "${b}" is ${b.length} chars`).toBeLessThanOrEqual(32);
      }
    }
  });

  it('looks up by id', () => {
    expect(byId('crm').title).toBe('Home Service CRM');
    expect(byId('nope')).toBeUndefined();
  });
});
