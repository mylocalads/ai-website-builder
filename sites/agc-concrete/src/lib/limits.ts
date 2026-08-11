/**
 * Collection caps, in one place.
 *
 * These were hardcoded as `.slice(0, N)` literals in the route files. A cap that
 * drifts from the navigation — or now from /llms.txt and the agent summary —
 * ships a link to a page that was never generated. Nothing surfaces that as a
 * build error, because slicing a collection is always "valid".
 *
 * Import these instead of writing a literal.
 *
 * getStaticPaths is hoisted into its own module at build time and cannot see
 * frontmatter-level consts — but it CAN see module imports, which is why these
 * live in src/lib/ rather than in each page's frontmatter.
 *
 * Raise deliberately. The caps exist to stop a site accumulating a pile of thin,
 * near-duplicate pages that compete with each other in search.
 */

/** Service detail pages generated, and services shown in nav/grids. */
export const SERVICE_LIMIT = 5;

/** Service-area pages generated, and areas shown in nav/grids. */
export const AREA_LIMIT = 5;

/**
 * Area slugs that would collide with a static route. firefly resolves areas at
 * the flat root (/denver-co), so this list is long — every top-level page is a
 * potential collision.
 */
export const RESERVED_AREA_SLUGS = new Set([
  'about', 'services', 'service-areas', 'contact', 'pricing', 'our-work',
  'privacy', 'terms', 'accessibility', 'book', '404', '_astro', 'index',
  'sitemap-index.xml', 'sitemap-0.xml', 'robots.txt', 'llms.txt', 'index.md',
]);

/** Service-area slugs must read city-state, e.g. denver-co. */
export const AREA_SLUG_PATTERN = /^[a-z0-9-]+-[a-z]{2}$/;
