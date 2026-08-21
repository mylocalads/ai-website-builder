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
 * Raised for this client only, deliberately.
 *
 * dmconstructionco.com is an EXISTING published site being migrated onto this
 * template, not a new build. It already ranks on eight specialty pages and
 * sixteen city pages, and every one of them is linked from its own nav. Capping
 * at 5/6 here would not prevent thin pages — the pages already exist and are
 * indexed — it would silently drop ten of them from the rebuild and hand the
 * client ten 404s on URLs that currently earn traffic.
 *
 * The usual caution still applies to NEW sites: do not copy these numbers
 * forward as a default.
 */

/** Service detail pages generated, and services shown in nav//services/grid. */
export const SERVICE_LIMIT = 8;

/** Service-area pages generated, and areas shown in nav/grid. */
export const AREA_LIMIT = 16;
