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
 * Raised from 5 to 6 for this client, deliberately. Stubbs runs six genuinely
 * distinct trades — hardscaping, landscaping, outdoor living, custom decks,
 * plunge pools, and lawn health — each with its own materials, crew skill, and
 * search intent, and each already carrying a substantial dedicated page on
 * their existing site. This is not the thin near-duplicate pile the cap exists
 * to prevent. Do not raise further without the same test. */
export const SERVICE_LIMIT = 6;

/** Service-area pages generated, and areas shown in nav/grid. */
export const AREA_LIMIT = 6;
