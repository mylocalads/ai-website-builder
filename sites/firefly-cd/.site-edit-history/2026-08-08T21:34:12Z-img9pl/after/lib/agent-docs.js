// Agent-readable documents: /llms.txt and /index.md.
//
// WHY THIS IS GENERATED, NOT WRITTEN
// Every fact here already lives in a content collection. Hand-writing these
// files would create a second copy that silently rots the first time a phone
// number, service, or service area changes — and a confidently wrong llms.txt
// is worse than none, because an LLM will quote it verbatim to a customer.
//
// Any edit that adds, renames, or removes a service, a service area, or a
// business detail flows through here automatically. Nothing to remember.

/** Absolute URL for a site-relative path. */
export const abs = (siteUrl, path = '/') =>
  `${String(siteUrl).replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

// Shared with the route files. If these ever diverge from what getStaticPaths
// builds, the agent docs start advertising URLs that do not exist — which is
// why they are imported, not restated.
import {
  SERVICE_LIMIT,
  AREA_LIMIT,
  RESERVED_AREA_SLUGS,
  AREA_SLUG_PATTERN,
} from './limits.ts';

/**
 * Collection entries -> the plain objects these documents render, carrying the
 * entry slug (Astro keeps `slug` off `.data`, so it has to be lifted here).
 * Applies the same caps and filters as the routes.
 */
export function publishedServices(entries = []) {
  return entries
    .slice()
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0))
    .slice(0, SERVICE_LIMIT)
    .map((e) => ({ ...e.data, slug: e.slug }));
}

export function publishedAreas(entries = []) {
  return entries
    .slice()
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0))
    .slice(0, AREA_LIMIT)
    .filter((e) => !RESERVED_AREA_SLUGS.has(e.slug) && AREA_SLUG_PATTERN.test(e.slug))
    .map((e) => ({ ...e.data, slug: e.slug }));
}

/** Service areas are stored as name + state, not a display title. */
const areaTitle = (a) => [a.name, a.state_abbr ? a.state_abbr.toUpperCase() : a.state].filter(Boolean).join(', ');

const line = (label, value) => (value ? `- **${label}**: ${value}\n` : '');

/** Human-readable location, e.g. "Spokane, WA". Falls back to the legal city. */
export function marketLocation(site) {
  const city = site.marketing_city ?? site.address?.city;
  const state = site.marketing_state ?? site.address?.state;
  return [city, state].filter(Boolean).join(', ');
}

/**
 * The short, link-first index (llmstxt.org convention): H1, blockquote summary,
 * then link lists. Read by an agent to orient itself without crawling.
 */
export function llmsTxt({ site, services = [], areas = [] }) {
  const u = (p) => abs(site.site_url, p);
  const where = marketLocation(site);

  const credentials = [
    site.licensed && 'licensed',
    site.insured && 'insured',
    site.bonded && 'bonded',
  ].filter(Boolean);

  return `# ${site.business_name}

> ${site.tagline ?? `${site.business_name}${where ? ` — serving ${where}` : ''}`}${
    credentials.length ? ` Fully ${credentials.join(', ')}.` : ''
  }${site.years_in_business ? ` ${site.years_in_business} years in business.` : ''}

${line('Phone', site.phone_display ?? site.phone)}${line('Email', site.email)}${line(
    'Service area',
    where
  )}${line('Free estimate', u('/book'))}
## Services

${
  services.length
    ? services
        .map((s) => `- [${s.title}](${u(`/services/${s.slug}`)}): ${s.short_description ?? ''}`)
        .join('\n')
    : '- See ' + u('/services')
}

## Service areas

${
  areas.length
    ? areas.map((a) => `- [${areaTitle(a)}](${u(`/${a.slug}`)})`).join('\n')
    : '- ' + (where || 'See the site')
}

## Pages

- [Home](${u('/')})
- [About](${u('/about')})
- [Our work](${u('/our-work')})
- [Pricing](${u('/pricing')})
- [Book a free estimate](${u('/book')})
- [Contact](${u('/contact')})

## Optional

- [Full site summary](${u('/index.md')}): the same information in long form
`;
}

/** Long-form markdown mirror, for agents that want detail without HTML. */
export function indexMd({ site, services = [], areas = [] }) {
  const u = (p) => abs(site.site_url, p);
  const where = marketLocation(site);
  const addr = site.address ?? {};

  const credentials = [
    site.licensed && 'Licensed',
    site.insured && 'Insured',
    site.bonded && 'Bonded',
  ].filter(Boolean);

  return `# ${site.business_name}

${site.tagline ?? ''}

${line('Legal name', site.legal_name)}${line('Phone', site.phone_display ?? site.phone)}${line(
    'Email',
    site.email
  )}${line('Website', site.site_url)}${line(
    'Address',
    [addr.street, addr.city, addr.state, addr.postal].filter(Boolean).join(', ')
  )}${line('Service area', where)}${line('Credentials', credentials.join(', '))}${line(
    'Years in business',
    site.years_in_business
  )}${site.rating && site.review_count ? `- **Rating**: ${site.rating} from ${site.review_count} reviews\n` : ''}
## Services

${services
  .map(
    (s) =>
      `### ${s.title}\n\n${s.long_description ?? s.short_description ?? ''}\n\nMore: ${u(
        `/services/${s.slug}`
      )}\n`
  )
  .join('\n')}
## Service areas

${areas.length ? areas.map((a) => `- ${areaTitle(a)} — ${u(`/${a.slug}`)}`).join('\n') : where}

## Hours

${
  site.hours
    ? Object.entries(site.hours)
        .map(([day, h]) => `- ${day.charAt(0).toUpperCase() + day.slice(1)}: ${h}`)
        .join('\n')
    : 'Contact us for current hours.'
}

## Get a quote

Free estimates: ${u('/book')} · ${site.phone_display ?? site.phone ?? ''}
`;
}

/**
 * The inert markdown block embedded in <head> for agents parsing the DOM.
 * Deliberately compact — it duplicates the page, so it earns its bytes only by
 * being the fastest correct answer to "what is this business and what does it do".
 */
export function agentSiteSummary({ site, services = [], areas = [] }) {
  const u = (p) => abs(site.site_url, p);
  const where = marketLocation(site);

  return `# ${site.business_name} — Business Summary & Services
${line('Business Name', site.business_name)}${line('Phone', site.phone_display ?? site.phone)}${line(
    'Email',
    site.email
  )}${line(
    'Address',
    [site.address?.street, site.address?.city, site.address?.state, site.address?.postal]
      .filter(Boolean)
      .join(', ')
  )}${line('Service Area', where)}${line('Free Estimates', u('/book'))}
- **Services**:
${services.map((s) => `  - ${s.title}: ${u(`/services/${s.slug}`)}`).join('\n')}
${areas.length ? `- **Areas Served**: ${areas.map(areaTitle).join(', ')}\n` : ''}`;
}
