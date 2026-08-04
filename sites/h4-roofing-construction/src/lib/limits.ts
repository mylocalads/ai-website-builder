/**
 * Collection caps, in one place.
 *
 * These were previously hardcoded as `.slice(0, N)` at eleven call sites, and
 * they drifted: `getStaticPaths` in `pages/services/[slug].astro` built 5
 * service pages while `Header` and `Footer` linked 6. Any site with six or more
 * services shipped a nav link to a page that was never generated — a 404 that
 * no build error surfaces, because slicing a collection is always "valid".
 *
 * Import these instead of writing a literal. Raising a cap is then one edit, and
 * the page-generation limit can never fall behind the navigation limit.
 *
 * getStaticPaths is hoisted into its own module at build time and cannot see
 * frontmatter-level consts — but it CAN see module imports, which is why these
 * live in `src/lib/` rather than in each page's frontmatter.
 *
 * Raise deliberately. The caps exist to stop a site accumulating a pile of thin,
 * near-duplicate pages that compete with each other in search.
 */

/** Service detail pages generated, and services shown in nav//services/grid.
 *
 * Raised to 7 for this client: the operator supplied seven distinct trades
 * (roofing, inspection, siding, gutters, concrete, flooring, drywall) rather
 * than seven near-duplicate roofing pages, so the thin-content risk the default
 * guards against does not apply here. */
export const SERVICE_LIMIT = 7;

/** Service-area pages generated, and areas shown in nav/grid. */
export const AREA_LIMIT = 6;
