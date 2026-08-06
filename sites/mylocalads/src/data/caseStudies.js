// Single source of truth for Results collections + case studies.
// Consumed by: src/pages/results.astro,
// src/pages/results/[category]/[client].astro,
// src/components/Header.astro,
// and astro.config.mjs (sitemap canonical filter).
//
// ---------------------------------------------------------------------------
// TAGGING MODEL
// ---------------------------------------------------------------------------
// Case studies live in ONE flat list. Each carries `categories` — the tag set.
// A study appears in EVERY category it tags, because clients bundle services and
// one engagement is genuinely Lead Gen *and* CRM *and* AI Agents.
//
//   categories: ['websites', 'crm', 'ai-agents']
//
// The FIRST tag is the primary category. It decides:
//   - the canonical URL (/results/{primary}/{slug}) — every other tagged
//     category also serves the page, but points its canonical here so Google
//     sees one page, not four duplicates
//   - ordering inside a collection: studies whose primary category IS this
//     collection sort ahead of studies merely cross-tagged into it
//
// Order tags most-relevant-first. Only tag a category the case study's own
// copy actually documents — a tag is a client-facing claim about work performed.
//
// ---------------------------------------------------------------------------
// REQUIRED FIELDS
// ---------------------------------------------------------------------------
// Every case study MUST have: slug (globally unique), categories (>= 1), client,
// industry, location, duration, headline, summary, metrics[], dashboardImage,
// challenge, approach[], outcome.
//
// Optional per case study:
//   quote        — { text, attribution }
//   beforeImage  — before-site screenshot URL
//   afterImage   — after-site screenshot URL
//   siteUrl      — live URL of the site we built, linked from the case study
//   servicesPurchased — string[] rendered as the "Services Purchased" chips.
//     Labels that name one of our collections (see SERVICE_LABEL_TO_CATEGORY)
//     must match the study's `categories`. Labels for services we sell but do
//     not yet have a Results collection for — "GBP Optimization" — are free-form.
//
// Before/after screenshots are full-page captures, thousands of pixels tall. The
// page shows the TOP of each one cropped to a fixed frame and links the full
// image, so the preview is a genuine crop rather than an unreadable squash.
//
// Before/after images and the feature chip list render whenever the case study
// HAS them — they are not gated on the category you arrived through, so a
// Websites + CRM study shows its rebuild from either URL.
//
// Placeholder images live at /placeholders/*.svg (public/placeholders/).

const DASHBOARD_PLACEHOLDER = '/placeholders/dashboard.svg';
const WEBSITE_BEFORE = '/placeholders/website-before.svg';
const WEBSITE_AFTER = '/placeholders/website-after.svg';

// Category metadata. Order here is the order of the pills on /results and the
// items in the header dropdown.
export const categories = [
  {
    slug: 'lead-generation',
    name: 'Lead Generation',
    tagline: 'Exclusive homeowner leads via Meta & Google.',
    intro:
      'Pay-per-lead campaigns for roofers, remodelers, concrete pros and more. Direct-response ads, exclusive leads, TCPA compliant.',
    // Typical metric shape: CPA · Ad Spend · Timeframe · Market
  },
  {
    slug: 'ai-agents',
    name: 'AI Agents',
    tagline: 'Voice + chat that qualifies leads on auto-pilot.',
    intro:
      'AI Employees running voice and chat inside the CRM — answering calls, qualifying leads, booking appointments 24/7 without new headcount.',
    // Typical metric shape: Channels · Speed to Lead · Cost vs Human · Volume
  },
  {
    slug: 'crm',
    name: 'CRM',
    tagline: 'The all-in-one system for lead-to-close.',
    intro:
      'GoHighLevel-powered CRM with pipelines, automations, call tracking, and reporting — configured for how home-service teams actually work.',
    // Typical metric shape: Users · Close-rate lift · Reputation lift
  },
  {
    slug: 'websites',
    name: 'Websites',
    tagline: 'Conversion-first sites for contractors.',
    intro:
      'Sales-focused websites with unlimited edits — fast, mobile-first, tied into the CRM, built to turn ad clicks into booked jobs.',
    // Typical metric shape: Mobile load time + Active features + Before/After
  },
];

export const caseStudies = [
  {
    slug: 'firefly-contractors-design',
    // The full bundle: we run their lead gen, built fireflycd.com, and run the
    // CRM the leads land in. Tagged in the order the services lead the story.
    categories: ['lead-generation', 'crm', 'websites'],
    client: 'Firefly Contractors & Design',
    industry: 'Remodeling & Roofing',
    location: 'Spokane, WA',
    duration: '3 months (May–July 2026)',
    headline: '270 leads and $900K in revenue on under $40K of marketing',
    summary:
      'A full-stack engagement for a 15-year-old Spokane remodeler: a new conversion-first website at fireflycd.com, direct-response lead generation feeding it, and a CRM that tracks every lead from first click through to a closed job.',
    metrics: [
      { label: 'Leads generated', value: '270' },
      { label: 'Inspections booked', value: '110' },
      { label: 'Jobs closed', value: '57' },
      { label: 'Revenue', value: '$900K+' },
    ],
    beforeImage: '/case-studies/firefly-before.webp',
    beforeImageSize: { width: 1000, height: 4899 },
    afterImage: '/case-studies/firefly-after.webp',
    afterImageSize: { width: 1000, height: 4139 },
    siteUrl: 'https://fireflycd.com',
    servicesPurchased: ['Lead Generation', 'CRM', 'Website', 'GBP Optimization'],
    dashboardImage: DASHBOARD_PLACEHOLDER,
    challenge:
      'Firefly had 15 years of craftsmanship behind them and a website that showed none of it — a builder-template site that homeowners bounced off before ever finding a phone number. Lead flow was inconsistent, follow-up depended on whoever happened to be free, and nobody could say which marketing dollars actually turned into signed jobs.',
    approach: [
      'Rebuilt the site from scratch at fireflycd.com — mobile-first, one page per service, one per city they serve, with an estimate request and a tracked call button on every one',
      'Direct-response lead generation pointed at those pages, targeted to homeowners across the Spokane metro',
      'Every lead lands in the CRM with automated speed-to-lead follow-up, so inspections get booked instead of chased',
      'Full-funnel tracking from first click to closed job — lead source, inspection, and revenue all attributed in one dashboard',
    ],
    outcome:
      '270 leads in three months, 110 of them booked into in-home inspections (41%), and 57 closed jobs — a 52% close rate off every inspection and 21% of every lead ending in signed work. Against under $40,000 in total marketing spend, that produced over $900,000 in revenue: better than a 22:1 return, at under $150 all-in per lead.',
  },
];

/**
 * ARCHIVED — not published.
 *
 * These eight studies were written before we had real client numbers: the
 * clients are anonymized, the metrics are illustrative, and every one still
 * points at a `/placeholders/*.svg` dashboard. They are parked here rather than
 * deleted so restoring one is a move, not a rewrite.
 *
 * To publish a study again: move its object back into `caseStudies` above and
 * replace the placeholder imagery with real screenshots. The integrity checks
 * below run over these too, so an archived entry cannot silently rot.
 */
export const archivedCaseStudies = [
  {
    slug: 'dm-construction',
    // Meta lead gen, plus the GHL pipeline / call tracking / SMS speed-to-lead
    // build documented in approach[].
    categories: ['lead-generation', 'crm'],
    client: 'DM Construction',
    industry: 'General Contractor',
    location: 'Southwest Florida',
    duration: '30 days',
    headline: 'Direct-response Meta ads that actually book jobs',
    summary:
      "Rebuilt DM Construction's lead engine with Meta ads targeting homeowners in high-value SWFL zip codes. Every lead qualified, project details captured up-front, delivered directly to the sales team.",
    metrics: [
      { label: 'Cost per lead', value: '$54.22' },
      { label: 'Ad spend', value: '$2,703' },
      { label: 'Timeframe', value: '30 days' },
      { label: 'Market', value: 'SW Florida' },
    ],
    dashboardImage: DASHBOARD_PLACEHOLDER,
    challenge:
      "DM Construction's marketing was scattered. Referrals had slowed, digital ads produced low-quality leads, and the sales team was burning hours on tire-kickers instead of writing estimates. The owner needed exclusive, ready-to-book homeowner leads at a price that made sense against his average job size.",
    approach: [
      'Rebuilt Meta ad targeting around high-value SWFL zip codes and homeowner project intent signals',
      'Custom qualification flow capturing project scope, timeline, budget signal, and address before the lead ever hits the inbox',
      'Instant handoff into the GHL pipeline with call tracking and SMS speed-to-lead sequences',
      'Weekly optimization cycle on ad creative, offer, and audience — no set-and-forget',
    ],
    outcome:
      '49 exclusive leads at a $54.22 cost per lead, 31 booked in-home inspections in the first 30 days, and the sales team closed at the highest month-over-month rate the business had seen in a year.',
    quote: {
      text: 'First time in years our ad spend paid for itself the same month.',
      attribution: 'Owner, DM Construction',
    },
  },
  {
    slug: 'pa-roofer',
    categories: ['lead-generation'],
    client: 'Pennsylvania Roofer',
    industry: 'Roofing',
    location: 'Pennsylvania',
    duration: '30 days',
    headline: 'Regional roofer hitting a $54 CPL in a competitive PA market',
    summary:
      'Full-funnel Meta ad program for a regional PA roofer — geo-targeted creative around storm season, exclusive homeowner leads, appointments booked straight into the sales team calendar.',
    metrics: [
      { label: 'Cost per lead', value: '$54.22' },
      { label: 'Ad spend', value: '$2,703' },
      { label: 'Timeframe', value: '30 days' },
      { label: 'Market', value: 'Pennsylvania' },
    ],
    dashboardImage: DASHBOARD_PLACEHOLDER,
    challenge:
      'A regional Pennsylvania roofer was competing head-to-head with national brands spending 5-10× more on the same zip codes. He needed a way to get in front of homeowners the moment they had storm damage or a roof concern — without matching a national ad budget.',
    approach: [
      'Storm-season-aware creative rotation: hail, wind, and inspection offers cycled based on local weather signals',
      'Tight geo-targeting to a 25-mile radius around the sales team',
      'Homeowner-only filters using property age and homeownership intent signals',
      'Auto-scheduled inspections directly into the sales calendar — no back-and-forth',
    ],
    outcome:
      '49 exclusive homeowner leads, 31 booked in-home inspections, and a $54.22 cost per lead — competitive with the national brands paying multiples more per market.',
    quote: {
      text: "I don't think about my ad account anymore. Leads just show up.",
      attribution: 'Owner, PA Roofer',
    },
  },
  {
    slug: 'regional-roofing-brand',
    // AI Voice + Chat deployed *inside the CRM*, auto-booking into the CRM
    // calendar with recordings and transcripts — documented in approach[].
    categories: ['ai-agents', 'crm'],
    client: 'Regional Roofing Brand',
    industry: 'Roofing',
    location: 'Multi-state (Southeast)',
    duration: '90 days',
    headline: 'AI Voice + Chat picking up every after-hours call',
    summary:
      'Deployed the AI Voice + Chat Employee inside the CRM to handle after-hours inbound. Every missed call gets recovered, qualified, and dropped into the pipeline before the team is back online.',
    metrics: [
      { label: 'Channels', value: 'Calls · SMS · Chat' },
      { label: 'Speed to lead', value: '< 20s' },
      { label: 'Cost vs. human staffing', value: '~90% less' },
      { label: 'After-hours bookings', value: '42' },
    ],
    dashboardImage: DASHBOARD_PLACEHOLDER,
    challenge:
      'A multi-state Southeast roofer was losing six figures per month in unanswered after-hours inbound calls. Hiring a 24/7 call center was cost-prohibitive, and the leads that did trickle in the next business day had already been called by three competitors.',
    approach: [
      'Deployed the AI Voice Employee to answer inbound calls evenings, weekends, and overflow during peak hours',
      'AI Chat Employee handling text and web-chat 24/7 with live handoff during business hours',
      "Custom-trained on the brand's services, service areas, financing options, and objection handling",
      "Auto-books qualified leads into the sales team's CRM calendar, with recording + transcript on every conversation",
    ],
    outcome:
      '78% of previously-missed calls now recovered, 42 after-hours appointments booked in 90 days, average response time under 20 seconds, and roughly 90% cheaper than equivalent human staffing.',
    quote: {
      text: "We stopped losing deals to the next roofer on Google. That's the whole game.",
      attribution: 'VP of Sales, Regional Roofing Brand',
    },
  },
  {
    slug: 'hvac-group',
    categories: ['ai-agents'],
    client: 'Local HVAC Group',
    industry: 'HVAC',
    location: 'Texas',
    duration: '60 days',
    headline: 'SMS + Email AI Agent qualifying homeowner leads at scale',
    summary:
      'AI Chat + Email Employee handling every inbound web form and text inquiry. Every homeowner gets a reply within seconds, gets qualified, and either books directly or gets escalated to a rep.',
    metrics: [
      { label: 'Channels', value: 'SMS · Email' },
      { label: 'Speed to lead', value: '< 20s' },
      { label: 'Cost vs. human staffing', value: '~90% less' },
      { label: 'Conversations / mo', value: '1,240+' },
    ],
    dashboardImage: DASHBOARD_PLACEHOLDER,
    challenge:
      "A Texas HVAC group was drowning in web inquiries every summer. Reps couldn't respond fast enough, leads went cold in the first 10 minutes, and the customer-service line was constantly on hold during peak season.",
    approach: [
      'Deployed AI SMS + Email Employee across every intake channel — web form, text-to-book, chat',
      'Custom-trained on service tiers, dispatch scheduling logic, and warranty language',
      'Auto-books qualified maintenance and repair requests directly into the dispatch board',
      'Escalation rules: unhappy customers, complex jobs, or price-sensitive leads route straight to a human',
    ],
    outcome:
      'Every homeowner reply now within 20 seconds, 1,240+ conversations handled per month during peak season, and rough cost savings of ~90% vs. staffing a 5-person night desk to cover the same volume.',
    quote: {
      text: 'Summer used to break us. Now it just books us.',
      attribution: 'Operations Manager, Local HVAC Group',
    },
  },
  {
    slug: 'concrete-contractor',
    categories: ['crm'],
    client: 'Concrete Contractor',
    industry: 'Concrete',
    location: 'Midwest',
    duration: '60 days',
    headline: 'A pipeline the owner actually opens every morning',
    summary:
      'Full CRM rollout: pipeline stages mapped to the sales process, automated lead-follow-up sequences, call tracking on every ad number, and a real-time dashboard for the owner.',
    metrics: [
      { label: 'Active CRM users', value: '18' },
      { label: 'Close-rate lift', value: '+22%' },
      { label: 'Reputation lift', value: '+140 Google reviews' },
      { label: 'Speed-to-lead', value: '< 5 min' },
    ],
    dashboardImage: DASHBOARD_PLACEHOLDER,
    challenge:
      'The owner was tracking leads across a text-message thread and a shared Google Sheet. Follow-up was ad-hoc, deals slipped through the cracks, and nobody could see where the pipeline was actually leaking — or which ad dollars were producing paying customers.',
    approach: [
      'Full GHL CRM implementation with pipeline stages mapped to the real sales process (lead → qualified → estimate scheduled → estimate delivered → sold)',
      'Automated email + SMS follow-up sequences for every stage — nothing manual, nothing forgotten',
      'Automated post-job review request sequence driving Google reviews on autopilot',
      'Real-time dashboard for the owner: pipeline value, close rate by source, and ROI on every dollar of ad spend',
    ],
    outcome:
      '18 team members actively using the CRM daily, close rate up 22%, 140 new Google reviews in 60 days lifting the local rating, and the owner got roughly 12 admin hours per week back.',
    quote: {
      text: 'I finally know exactly where every dollar goes and where every lead is.',
      attribution: 'Owner, Concrete Contractor',
    },
  },
  {
    slug: 'statewide-roofer',
    categories: ['crm'],
    client: 'Statewide Roofer',
    industry: 'Roofing',
    location: 'Georgia',
    duration: '90 days',
    headline: '35-user CRM rollout with automated review generation',
    summary:
      'Multi-crew roofing company rolled onto GHL with per-team pipelines, automated review requests, and unified reporting for ownership — all crews now working out of the same source of truth.',
    metrics: [
      { label: 'Active CRM users', value: '35' },
      { label: 'Close-rate lift', value: '+17%' },
      { label: 'Reputation lift', value: '+320 Google reviews / 6mo' },
      { label: 'Speed-to-lead', value: '< 3 min' },
    ],
    dashboardImage: DASHBOARD_PLACEHOLDER,
    challenge:
      'Every crew ran a different spreadsheet. Leads got double-worked, jobs slipped, and the owner had no accurate way to see which crew was actually converting. Online reputation was stagnant despite hundreds of completed jobs each month.',
    approach: [
      'Per-crew pipelines with shared visibility for the owner and ops team',
      'Automated Google review request sequence firing after job completion',
      'Call tracking on every marketing source with attribution to the exact crew',
      'Ownership dashboard showing close rate, revenue, and review velocity per crew',
    ],
    outcome:
      '35 users on the platform daily, close rate up 17% across crews, +320 Google reviews in 6 months — moving the company from a 4.4 to a 4.8 average across every service area.',
    quote: {
      text: 'Every crew finally works out of the same book. The reviews are the bonus.',
      attribution: 'Owner, Statewide Roofer',
    },
  },
  {
    slug: 'home-remodeler',
    // Site rebuild whose shipped feature set includes CRM Integration and an
    // AI Assistant — see activeFeatures below.
    categories: ['websites', 'crm', 'ai-agents'],
    client: 'Home Remodeler',
    industry: 'Kitchen & Bath',
    location: 'Northeast US',
    duration: 'Launch + 45 days',
    headline: 'Site rebuilt around one job: turn clicks into estimates',
    summary:
      'Rebuilt the marketing site around a single goal: turn homeowner ad traffic into estimate requests. Instant-quote flow, tracked call button, financing calculator, GBP-linked review pull-through.',
    metrics: [
      { label: 'Mobile load time', value: '< 1.2s' },
      { label: 'Conversion rate', value: '+3.1×' },
    ],
    beforeImage: WEBSITE_BEFORE,
    afterImage: WEBSITE_AFTER,
    servicesPurchased: ['Website', 'CRM', 'AI Agents'],
    dashboardImage: DASHBOARD_PLACEHOLDER,
    challenge:
      'A Northeast kitchen & bath remodeler was paying to send Meta and Google ad traffic to a slow, cluttered website that converted under 1% of visitors into estimate requests. Every ad dollar was buying a click, not a lead — and the mobile experience was the worst of it.',
    approach: [
      'Rebuilt the marketing site around a single goal: turn homeowner ad traffic into estimate requests',
      'Instant-quote flow with a 3-question qualifier and a tracked call button on every page',
      'Financing calculator embedded on every service page so budget objections get handled before the estimator ever picks up the phone',
      'Google Business Profile review pull-through auto-syncing to the site — social proof updates itself',
      'Mobile-first build with sub-1.2s load time on 4G',
    ],
    outcome:
      'Conversion rate up 3.1× vs. the previous site, 84 estimate requests per month, bounce rate down 38%, and the site is now the highest-ROI channel in the marketing mix.',
    quote: {
      text: "We stopped throwing money at a website that couldn't close. This one closes.",
      attribution: 'Marketing Lead, Home Remodeler',
    },
  },
  {
    slug: 'concrete-company-site',
    // Rebuild + direct GHL integration + AI Assistant chat widget, all
    // documented in approach[].
    categories: ['websites', 'crm', 'ai-agents'],
    client: 'Concrete Company',
    industry: 'Concrete',
    location: 'Ohio',
    duration: 'Launch + 30 days',
    headline: 'From 2005-era brochure site to a leadgen machine',
    summary:
      'Complete site rebuild for a family-owned concrete company. Mobile-first, sub-1s load time, integrated with GHL for instant lead capture and follow-up.',
    metrics: [
      { label: 'Mobile load time', value: '< 1.0s' },
      { label: 'Estimate requests / mo', value: '3.4×' },
    ],
    beforeImage: WEBSITE_BEFORE,
    afterImage: WEBSITE_AFTER,
    servicesPurchased: ['Website', 'CRM', 'AI Agents'],
    dashboardImage: DASHBOARD_PLACEHOLDER,
    challenge:
      "The company had a website built in the mid-2000s — slow, non-responsive, hard to update. Ad traffic was landing on it and bouncing immediately. Homeowners couldn't even find a phone number on mobile without pinch-zooming.",
    approach: [
      'Mobile-first rebuild with sub-1-second load time on 4G',
      'Prominent estimate request form + tracked call button above the fold on every page',
      'Direct CRM integration — every form submission and call routes into GHL for automated follow-up',
      'AI Assistant chat widget covering after-hours and overflow inquiries',
    ],
    outcome:
      'Estimate requests jumped 3.4×, mobile load time under 1 second, and the site is now the anchor for every ad campaign — instead of a leaky bucket.',
    quote: {
      text: 'People finally take us seriously online. Should have done this five years ago.',
      attribution: 'Owner, Concrete Company',
    },
  },
];

/**
 * "Services Purchased" labels that correspond to a Results collection. Labels
 * absent from this map are services we sell without a collection of their own
 * yet (GBP Optimization) and are accepted as-is.
 *
 * Note "Website" (singular) is how the service is sold; "Websites" is the
 * collection name.
 */
export const SERVICE_LABEL_TO_CATEGORY = {
  'Lead Generation': 'lead-generation',
  'AI Agents': 'ai-agents',
  CRM: 'crm',
  Website: 'websites',
  Websites: 'websites',
};

// --- Integrity checks -------------------------------------------------------
// These run at import time, so a bad tag fails `npm run build` with a readable
// message instead of silently dropping a case study off /results.

const CATEGORY_SLUGS = new Set(categories.map((c) => c.slug));

// Archived studies are validated too — they are meant to be restorable, which
// they only stay if their tags and slugs keep making sense.
const ALL_CASE_STUDIES = [...caseStudies, ...archivedCaseStudies];

for (const cs of ALL_CASE_STUDIES) {
  if (!Array.isArray(cs.categories) || cs.categories.length === 0) {
    throw new Error(`caseStudies: "${cs.slug}" must tag at least one category.`);
  }
  for (const slug of cs.categories) {
    if (!CATEGORY_SLUGS.has(slug)) {
      throw new Error(
        `caseStudies: "${cs.slug}" tags unknown category "${slug}". ` +
          `Known categories: ${[...CATEGORY_SLUGS].join(', ')}.`
      );
    }
  }
  if (new Set(cs.categories).size !== cs.categories.length) {
    throw new Error(`caseStudies: "${cs.slug}" tags the same category twice.`);
  }
  // A "Services Purchased" chip naming a collection is a claim about what the
  // client bought — it has to agree with the tag set driving the pills.
  for (const label of cs.servicesPurchased ?? []) {
    const mapped = SERVICE_LABEL_TO_CATEGORY[label];
    if (mapped && !cs.categories.includes(mapped)) {
      throw new Error(
        `caseStudies: "${cs.slug}" lists "${label}" under servicesPurchased ` +
          `but does not tag the "${mapped}" category.`
      );
    }
  }
}

const seenSlugs = new Set();
for (const cs of ALL_CASE_STUDIES) {
  // Slugs are global now, not per-category — a collision would make one study
  // unreachable at /results/{category}/{slug}.
  if (seenSlugs.has(cs.slug)) {
    throw new Error(`caseStudies: duplicate slug "${cs.slug}". Slugs must be globally unique.`);
  }
  seenSlugs.add(cs.slug);
}

// --- Derived accessors ------------------------------------------------------

/** The primary (canonical) category slug for a case study. */
export function primaryCategorySlug(caseStudy) {
  return caseStudy.categories[0];
}

/** Every case study tagged into `categorySlug`, primary-tagged ones first. */
export function caseStudiesIn(categorySlug) {
  const tagged = caseStudies.filter((cs) => cs.categories.includes(categorySlug));
  const isPrimary = (cs) => primaryCategorySlug(cs) === categorySlug;
  // Stable partition: studies whose primary tag is this category lead the
  // collection, cross-tagged ones follow, each group keeping list order.
  return [...tagged.filter(isPrimary), ...tagged.filter((cs) => !isPrimary(cs))];
}

/**
 * Categories a case study is tagged into, as metadata objects, in tag order.
 * Drives the tag pills.
 */
export function categoriesFor(caseStudy) {
  return caseStudy.categories.map((slug) => categories.find((c) => c.slug === slug));
}

/** URL for a case study within a given category. */
export function caseStudyPath(caseStudy, categorySlug) {
  return `/results/${categorySlug}/${caseStudy.slug}`;
}

/**
 * The one URL search engines should index for this case study. Multi-tagged
 * studies are served from every tagged category; all of them point here.
 */
export function canonicalPath(caseStudy) {
  return caseStudyPath(caseStudy, primaryCategorySlug(caseStudy));
}

/** True when `path` is a case-study URL that is NOT the canonical one. */
export function isDuplicateCaseStudyPath(path) {
  const match = path.match(/^\/results\/([^/]+)\/([^/]+)\/?$/);
  if (!match) return false;
  const [, categorySlug, clientSlug] = match;
  const caseStudy = caseStudies.find((cs) => cs.slug === clientSlug);
  if (!caseStudy) return false;
  return (
    caseStudy.categories.includes(categorySlug) && primaryCategorySlug(caseStudy) !== categorySlug
  );
}

/**
 * Category metadata with its case studies attached — the shape /results and the
 * header dropdown consume.
 *
 * Every category is exposed, including ones with nothing published yet — they
 * are services we sell, so hiding them from the Results nav costs a sales
 * surface. /results renders an empty-state panel with a booking CTA in place of
 * the carousel for those, which is why `caseStudies` here may be [].
 */
export const collections = categories.map((category) => ({
  ...category,
  caseStudies: caseStudiesIn(category.slug),
}));

/** Categories with nothing published yet — these render the empty state. */
export function emptyCollections() {
  return collections.filter((c) => c.caseStudies.length === 0).map((c) => c.slug);
}

export function findCollection(slug) {
  return collections.find((c) => c.slug === slug);
}

/**
 * Resolve a /results/{category}/{client} URL. Returns null unless the case study
 * is actually tagged into that category, so an untagged pairing fails to build
 * rather than rendering a study under a category it never worked in.
 */
export function findCaseStudy(categorySlug, clientSlug) {
  const collection = findCollection(categorySlug);
  if (!collection) return null;
  const caseStudy = caseStudies.find((cs) => cs.slug === clientSlug);
  if (!caseStudy || !caseStudy.categories.includes(categorySlug)) return null;
  return { collection, caseStudy };
}

/** Every case study once, regardless of how many categories it tags. */
export function allCaseStudies() {
  return caseStudies.map((cs) => ({
    ...cs,
    primaryCategorySlug: primaryCategorySlug(cs),
    categoryRefs: categoriesFor(cs),
    canonicalPath: canonicalPath(cs),
  }));
}

/** Every (category, case study) pair — one per route the site serves. */
export function allCaseStudyRoutes() {
  return caseStudies.flatMap((cs) =>
    cs.categories.map((categorySlug) => ({ categorySlug, caseStudy: cs }))
  );
}
