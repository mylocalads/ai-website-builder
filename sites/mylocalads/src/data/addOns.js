// Single source of truth for every cart-purchasable product.
// Consumed by: src/components/AddOnCard.astro, src/pages/index.astro,
// src/pages/cart.astro, src/lib/cart-store.js, src/pages/api/checkout.js.
//
// Stripe price IDs deliberately do NOT live here. They are read from env vars
// inside src/pages/api/checkout.js so they never enter the client bundle and
// never land in git.
//
// FIELDS
//   section    'addons' renders in the Growth Add-Ons grid; 'ppl' renders in the
//              Pay-Per-Lead section (its Add to cart lives on the PPL tiles).
//   planLabel  Small kicker above the title, e.g. "CRM Plan" over
//              "My Local Ads CRM". Mirrors the PPL tiles' "Ads Plan" kicker.
//   group      Items sharing a group are MUTUALLY EXCLUSIVE — adding one
//              removes the others. The three Ads Plan commit terms are the same
//              Stripe product, so only one can be in the cart at a time.
//   wasPriceLabel  Struck-through list price shown beside a discounted price.
//
// Copy supplied by the client 2026-07-29 along with the live price IDs.

export const addOns = [
  {
    id: 'crm',
    section: 'addons',
    planLabel: 'CRM Plan',
    title: 'My Local Ads CRM',
    subtitle: 'Automate and grow your marketing with the all-in-one CRM suite.',
    priceCents: 9700,
    priceLabel: '$97/mo',
    wasPriceLabel: null,
    priceNote: 'After 7-day free trial. Usage rates apply.',
    billing: 'recurring',
    trialDays: 7,
    requires: [],
    group: null,
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
    section: 'addons',
    planLabel: 'Conversion Plan',
    title: 'CRM AI Voice + AI Chat',
    subtitle: 'Let AI handle calls and conversations with leads on auto-pilot.',
    priceCents: 25000,
    priceLabel: '$250/mo',
    wasPriceLabel: null,
    priceNote: 'Requires CRM.',
    billing: 'recurring',
    trialDays: null,
    requires: ['crm'],
    group: null,
    shipping: false,
    includes: [
      'Automate lead nurturing & conversation follow-ups',
      'No missed calls — handles calls instantly',
      '24/7 lead qualification & routing',
      'Calendar integrated booking & rescheduling',
      'Handles SMS, email, live chat, & social DMs',
      'Fully customize AI system prompt, voice, & more',
      'Choose AI models to power your agent',
      'Can trigger API actions & workflows',
    ],
    fallbackHref: '/ai-employee-add-on',
  },
  {
    id: 'seo-plan',
    section: 'addons',
    planLabel: 'SEO Plan',
    title: 'Google Business Profile Management',
    subtitle: 'Appear organically in Google\'s Map Pack results to maximize lead flow.',
    priceCents: 25000,
    priceLabel: '$250/mo',
    wasPriceLabel: null,
    priceNote: 'Monthly Google Business Profile management.',
    billing: 'recurring',
    trialDays: null,
    requires: [],
    group: null,
    shipping: false,
    includes: [
      'Fully optimize Google Business Profile',
      'Improve Google Map Pack visibility',
      'Monthly profile posts',
      'Profile maintenance & upkeep',
      'Review replies',
      'Call tracking implementation (if CRM active)',
      'Backed by AI agents',
    ],
    fallbackHref: 'https://start.mylocalads.co/gbp',
  },
  {
    id: 'website',
    section: 'addons',
    planLabel: 'Website Plan',
    title: 'Unlimited Changes',
    subtitle: 'Close more deals with a stunning website while we manage your site A-Z.',
    priceCents: 30000,
    priceLabel: '$300/mo',
    wasPriceLabel: null,
    priceNote: 'No setup fee. Requires active CRM account.',
    billing: 'recurring',
    trialDays: null,
    requires: ['crm'],
    group: null,
    shipping: false,
    includes: [
      'Conversion optimized website design',
      'Full integration w/ My Local Ads CRM',
      'Best in-class local SEO',
      'Includes up to 5 service & service area pages',
      'Includes hosting & custom domain',
      'Unlimited edit requests',
      'Backed by AI agents',
    ],
    fallbackHref: 'https://start.mylocalads.co/all-in-one-website',
  },

  // Ads Plan — one Stripe product (the setup fee) offered at three commitment
  // terms. Same price for all three; the term is what the customer is choosing,
  // so they share a group and only one can be carted.
  ...['3-Month', '6-Month', '12-Month'].map((term) => ({
    id: `ppl-ads-${term.split('-')[0].toLowerCase()}mo`,
    section: 'ppl',
    planLabel: 'Ads Plan',
    title: `Pay-Per-Lead Ads Setup — ${term} Commit`,
    subtitle: 'One-time setup for your pay-per-lead ad campaigns.',
    priceCents: 250000,
    priceLabel: '$2,500',
    wasPriceLabel: '$5,000',
    priceNote: 'One-time setup fee. 50% off list price.',
    billing: 'one_time',
    trialDays: null,
    requires: [],
    group: 'ppl-ads',
    shipping: false,
    includes: [
      'Qualified & exclusive homeowner leads',
      '7 days to dispute unqualified leads',
      'Full ad management & optimizations',
      'Creative production included',
      'Pixel & UTM tracking installation',
      'Lead nurturing automations',
      'Capture TCPA compliant leads w/ audit trail',
      'Backed by AI agents',
    ],
    fallbackHref: 'https://start.mylocalads.co/book-now-v2',
  })),
];

export function byId(id) {
  return addOns.find((a) => a.id === id);
}

export function bySection(section) {
  return addOns.filter((a) => a.section === section);
}
