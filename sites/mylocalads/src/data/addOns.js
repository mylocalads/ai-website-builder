// Single source of truth for the Growth Add-Ons section.
// Consumed by: src/components/AddOnCard.astro, src/pages/index.astro,
// src/pages/cart.astro, src/lib/cart-store.js, src/pages/api/checkout.js.
//
// Stripe price IDs deliberately do NOT live here. They are read from env vars
// inside src/pages/api/checkout.js so they never enter the client bundle and
// never land in git.
//
// Bullet copy is sourced from the client's own product pages:
//   crm            -> start.mylocalads.co/growth
//   ai-agents      -> src/pages/ai-employee-add-on.astro
//   seo-plan       -> start.mylocalads.co/gbp (adapted: was a $500 one-time
//                     GBP optimization, now a $250/mo recurring SEO plan)
//   website        -> start.mylocalads.co/all-in-one-website
//   roof-quote-pro -> src/pages/roof-instant-estimator.astro
//
// NFC Review Cards was removed from this section (product being retired).
//
// Every add-on is currently `recurring`, so every cart resolves to Stripe
// subscription mode. The `billing`, `shipping`, and one-time handling in
// cart-core.js / checkout-params.js are retained and tested so a one-time or
// physical product can be reintroduced without reworking the logic.

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
    id: 'seo-plan',
    title: 'SEO Plan',
    subtitle: 'Appear organically in Google\'s Map Pack results to maximize lead flow.',
    priceCents: 25000,
    priceLabel: '$250/mo',
    priceNote: 'Ongoing local SEO management.',
    billing: 'recurring',
    trialDays: null,
    requires: [],
    shipping: false,
    includes: [
      'A-Z optimization of your Google Business Profile',
      'Keyword optimization for specific services',
      'Local SEO best-practices implemented',
      'Ongoing local SEO reporting',
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
];

export function byId(id) {
  return addOns.find((a) => a.id === id);
}
