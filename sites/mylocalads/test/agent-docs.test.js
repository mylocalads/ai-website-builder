import { describe, it, expect } from 'vitest';
import { llmsTxt, indexMd, catalogSummary, SITE } from '../src/lib/agent-docs.js';
import { addOns, bySection } from '../src/data/addOns.js';

const llms = llmsTxt();
const md = indexMd();

describe('llms.txt', () => {
  it('opens with an H1 and a blockquote summary, per llmstxt.org', () => {
    const lines = llms.split('\n').filter(Boolean);
    expect(lines[0]).toMatch(/^# /);
    expect(lines[1]).toMatch(/^> /);
  });

  it('lists every monthly plan with its price', () => {
    // The whole point of generating this file is that a new product cannot be
    // silently missing from what an LLM reads.
    for (const a of bySection('addons')) {
      expect(llms, `${a.id} missing from llms.txt`).toContain(a.title);
      expect(llms, `${a.id} price missing`).toContain(a.priceLabel);
    }
  });

  it('carries contact details and a booking link', () => {
    expect(llms).toContain('(866) 451-1915');
    expect(llms).toContain('support@mylocalads.co');
    expect(llms).toContain(`${SITE}/booking-page`);
  });

  it('uses absolute URLs throughout', () => {
    const links = [...llms.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
    expect(links.length).toBeGreaterThan(5);
    for (const l of links) {
      expect(l, `relative link: ${l}`).toMatch(/^https:\/\//);
    }
  });

  it('points at index.md for the long form', () => {
    expect(llms).toContain(`${SITE}/index.md`);
  });
});

describe('index.md', () => {
  it('lists every monthly plan with its price', () => {
    for (const a of bySection('addons')) {
      expect(md, `${a.id} missing from index.md`).toContain(a.title);
      expect(md, `${a.id} price missing`).toContain(a.priceLabel);
    }
  });

  it('states the exclusivity and lead definition', () => {
    expect(md.toLowerCase()).toContain('never shared');
    expect(md.toLowerCase()).toContain('booked on your calendar');
  });

  it('is explicit that ad budget is separate', () => {
    // A pricing claim an agent could otherwise report incorrectly.
    expect(md.toLowerCase()).toContain('ad budget is billed separately');
  });

  it('formats money with thousands separators', () => {
    expect(md).toContain('$2,500');
    expect(md).not.toMatch(/\$2500\b/);
  });
});

describe('catalogSummary', () => {
  it('covers the whole catalog', () => {
    const s = catalogSummary();
    expect(s).toHaveLength(addOns.length);
    expect(s.map((x) => x.id).sort()).toEqual(addOns.map((a) => a.id).sort());
  });

  it('reports prices straight from the catalog', () => {
    for (const row of catalogSummary()) {
      const source = addOns.find((a) => a.id === row.id);
      expect(row.priceCents).toBe(source.priceCents);
      expect(row.price).toBe(source.priceLabel);
    }
  });
});
