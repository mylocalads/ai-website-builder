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
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RAISED FOR THIS CLIENT — from the template defaults of 5 / 6.
 *
 * Tropical South Tree Services publishes 20 tree-service pages in three nav
 * groups and 16 service-area pages, and the operator asked for that structure to
 * be reproduced in full. The anti-thin-page rationale above still holds and was
 * checked rather than waived: each of the 20 services is a distinct billable job
 * with its own equipment, price basis and buying trigger (crown reduction is not
 * canopy thinning; hazardous removal is not storm cleanup), and each of the 16
 * areas carries genuinely local content — its own storm history, permitting
 * authority, HOA character and neighbourhood names. Nothing here is a city name
 * swapped into a shared paragraph.
 *
 * The INVARIANT the original bug taught is still enforced, and is the reason the
 * featured limits below are separate constants rather than inline slices:
 *
 *     featured ⊆ generated,  always.
 *
 * Showing FEWER items in a homepage grid than exist as pages is safe. Showing
 * MORE is the 404 bug. So the FEATURED_* limits may only ever be <= their
 * generation counterpart — see the assertions at the bottom of this file, which
 * fail the build rather than let the two drift apart again.
 */

/** Service detail pages generated, and services listed on /services + in nav. */
export const SERVICE_LIMIT = 22;

/** Service-area pages generated, and areas listed on /service-area + in nav. */
export const AREA_LIMIT = 16;

/**
 * Services shown in the HOMEPAGE tile grid. All 22 would bury the page in
 * a wall of tiles and flatten the priority order that actually drives calls, so
 * the grid shows the top `order` values only and defers the rest to /services.
 */
export const FEATURED_SERVICE_LIMIT = 6;

/**
 * Areas shown in the HOMEPAGE area grid, same reasoning. The remaining eight
 * stay one click away on /service-area, which is the page built to hold them.
 */
export const FEATURED_AREA_LIMIT = 8;

// Build-time guards. The whole point of this module is that generation and
// navigation cannot drift; a featured limit above its generation limit would
// reintroduce exactly the 404 this file exists to prevent.
if (FEATURED_SERVICE_LIMIT > SERVICE_LIMIT) {
  throw new Error(
    `FEATURED_SERVICE_LIMIT (${FEATURED_SERVICE_LIMIT}) exceeds SERVICE_LIMIT (${SERVICE_LIMIT}) — ` +
    'the homepage would link to service pages that are never generated.'
  );
}
if (FEATURED_AREA_LIMIT > AREA_LIMIT) {
  throw new Error(
    `FEATURED_AREA_LIMIT (${FEATURED_AREA_LIMIT}) exceeds AREA_LIMIT (${AREA_LIMIT}) — ` +
    'the homepage would link to service-area pages that are never generated.'
  );
}
