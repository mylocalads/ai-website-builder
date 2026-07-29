import { describe, it, expect } from 'vitest';
import { addOns, byId } from '../src/data/addOns.js';

describe('addOns data', () => {
  it('has five add-ons', () => {
    expect(addOns).toHaveLength(5);
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

  it('states a price label consistent with priceCents', () => {
    for (const a of addOns) {
      const dollars = a.priceCents / 100;
      expect(a.priceLabel, `${a.id}`).toContain(String(dollars));
    }
  });

  it('is currently all-recurring, so every cart uses subscription mode', () => {
    expect(addOns.every((a) => a.billing === 'recurring')).toBe(true);
  });

  it('has no physical products, so no cart needs shipping', () => {
    expect(addOns.every((a) => a.shipping === false)).toBe(true);
  });

  it('looks up by id', () => {
    expect(byId('crm').title).toBe('CRM');
    expect(byId('nope')).toBeUndefined();
  });
});
