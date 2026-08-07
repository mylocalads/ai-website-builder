// Shared source for the agent-readable documents: /llms.txt and /index.md.
//
// Generated from the product catalog rather than hand-written, so a price
// change in addOns.js propagates to every place an LLM might read it. A stale
// llms.txt quoting last quarter's pricing is worse than none at all.

import { addOns, bySection, byId } from '../data/addOns.js';

export const SITE = 'https://mylocalads.co';

// Whole dollars with thousands separators — "$2,500", not "$2500".
const usd = (cents) =>
  (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

/** Pay-per-lead commit terms. Mirrors pplTiers in index.astro. */
const PPL_TIERS = [
  { name: '3-Month Commit', booked: '$85', form: '$35' },
  { name: '6-Month Commit', booked: '$75', form: '$25' },
  { name: '12-Month Commit', booked: '$65', form: '$15' },
];

const monthlyPlans = () =>
  bySection('addons')
    .map((a) => `- **${a.planLabel} — ${a.title}**: ${a.priceLabel}. ${a.subtitle}`)
    .join('\n');

const setupFee = () => usd(byId('ppl-ads-6mo')?.priceCents ?? 250000);

/**
 * /llms.txt — the short, link-first index an agent reads to orient itself.
 * Follows the llmstxt.org convention: H1, blockquote summary, then link lists.
 */
export function llmsTxt() {
  return `# My Local Ads

> Marketing supplier for home service contractors across the United States. We generate exclusive, ready-to-book leads through direct-response advertising on Meta and Google, and supply the rest of the marketing stack: local SEO, websites, CRM, and AI voice and chat agents.

A lead is an in-person booked estimate, or an estimate request submitted by form or phone call. Leads are exclusive — never shared with another contractor, never resold.

- Phone: (866) 451-1915
- Email: support@mylocalads.co
- Book a call: ${SITE}/booking-page

## Pricing

- [Pay-per-lead advertising](${SITE}/#pricing): ${PPL_TIERS.map((t) => `${t.name} ${t.booked}/booked estimate`).join(', ')}. One-time setup $${setupFee()}.
${bySection('addons')
  .map((a) => `- [${a.title}](${SITE}/#add-ons): ${a.priceLabel} — ${a.subtitle}`)
  .join('\n')}

## Pages

- [Home](${SITE}/): what we do, pricing, industries served, FAQs
- [Results](${SITE}/results): client case studies with verified numbers
- [Campaign Planner](${SITE}/planner): plan a campaign
- [Pricing Calculator](${SITE}/pricing-calculator): estimate lead cost
- [Ads ROI Calculator](${SITE}/ads-roi-calculator): model return on ad spend
- [Team](${SITE}/team): who we are
- [Book a call](${SITE}/booking-page): schedule a 30-minute call
- [Contact](${SITE}/contact-us): send an inquiry

## Optional

- [Full site summary](${SITE}/index.md): the same information in long form
`;
}

/**
 * /index.md — the long-form markdown rendering of the site, for agents that
 * want the detail without parsing HTML.
 */
export function indexMd() {
  return `# My Local Ads

Marketing supplier for home service contractors. We generate exclusive leads and supply the marketing stack that turns them into booked jobs.

- **Legal name**: My Local Ads LLC
- **Phone**: (866) 451-1915
- **Email**: support@mylocalads.co
- **Website**: ${SITE}
- **Service area**: United States
- **Book a call**: ${SITE}/booking-page

## What a lead is

Every lead comes from a direct-response ad we run on Meta (Facebook and Instagram) and Google (Search, YouTube, Local Services). Leads are exclusive to one contractor — never shared, never resold. A lead is either an in-person estimate already booked on your calendar, or an estimate request that arrived by form or phone call.

## Contractors we serve

Roofing, Decking & Siding, Concrete, and Kitchen & Bath, plus plumbing, landscaping, tree services, electricians, and general contractors.

## Pay-per-lead advertising

Choose a commitment length; the longer the term, the lower the per-lead price.

| Term | Booked estimate | Estimate inquiry |
|---|---|---|
${PPL_TIERS.map((t) => `| ${t.name} | ${t.booked} | ${t.form} |`).join('\n')}

One-time setup fee: $${setupFee()} (50% off the $5,000 list price). Ad budget is billed separately and is not included in the per-lead price.

Included with every plan: exclusive homeowner leads, project details, lead nurturing sequences, 7 days to dispute a lead, 24/7 email support, and a TCPA compliance certificate.

## Monthly plans

${monthlyPlans()}

## Results

Client case studies with verified numbers: ${SITE}/results

## Frequently asked

- **Are the leads shared?** Never. Every lead is generated from direct-response campaigns showing your brand, and is sent to one contractor only.
- **Do prices include ad budget?** No. Pay-per-lead pricing excludes the advertising budget, which is paid separately.
- **Is there a commitment?** 3-month minimum, with 6-month and 12-month terms available at lower per-lead pricing.
- **Can plans be bought individually?** Yes, each plan can be purchased on its own.

Full FAQ: ${SITE}/#faqs
`;
}

/** Every product, for callers that want the catalog rather than prose. */
export function catalogSummary() {
  return addOns.map((a) => ({
    id: a.id,
    name: a.title,
    plan: a.planLabel,
    price: a.priceLabel,
    priceCents: a.priceCents,
    billing: a.billing,
  }));
}
