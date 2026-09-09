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

/**
 * SITE-SPECIFIC CAPS — these deliberately differ from the template's 5 / 5.
 *
 * AREA_LIMIT is 6, not the template's 5. Re-copying
 * astro-templates/firefly/src/lib/limits.ts over this file would drop it back
 * to 5 and silently delete `kootenai-county-id` (area 6 by `order`). Slicing a
 * collection is never a build error, so nothing would warn you.
 *
 * SERVICE_LIMIT is 5 and happens to match the template today. It was 7 until
 * the kitchen-remodels, bathroom-remodels and flooring pages were removed on
 * 2026-09-04; the five that remain are roofing, siding, windows, insulation and
 * decking. Keep this number equal to the number of service files — a cap higher
 * than the collection is harmless, but a cap lower than it hides pages with no
 * error, which is how the flooring page once vanished from /services/.
 *
 * If you raise these again, add the content first, then the cap.
 */

/** Service detail pages generated, and services shown in nav/grids. */
export const SERVICE_LIMIT = 5;

/** Service-area pages generated, and areas shown in nav/grids. */
export const AREA_LIMIT = 6;

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
