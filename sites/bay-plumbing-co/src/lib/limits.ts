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

/**
 * Service detail pages generated in total.
 *
 * Raised from 5 to 10 when the catalogue was split into residential and
 * commercial sets. The guardrail this cap exists for has NOT been loosened —
 * it moved to SERVICE_NAV_LIMIT below, which is still 5 per market. Ten thin
 * pages would be just as bad as ten thin pages were before; what makes this
 * safe is that the two sets describe genuinely different work (a homeowner's
 * blocked toilet vs. a restaurant's grease trap), not the same work twice.
 */
export const SERVICE_LIMIT = 10;

/**
 * Services shown per market in the nav dropdown, the sub-index and the grid.
 *
 * This is the cap that actually protects against near-duplicate pages: it is
 * per AUDIENCE, so neither menu can quietly grow past five even though the
 * total is now ten.
 */
export const SERVICE_NAV_LIMIT = 5;

/** Service-area pages generated, and areas shown in nav/grid. */
export const AREA_LIMIT = 6;
