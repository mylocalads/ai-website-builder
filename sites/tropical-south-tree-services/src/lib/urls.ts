/**
 * URL construction, in one place.
 *
 * This site serves service and service-area detail pages at the ROOT
 * (`/tree-removal`, `/pinecrest-fl`) rather than under `/services/` and
 * `/service-area/` as the owl template does. That is an operator decision for
 * this client, and it has one dangerous consequence the nested layout did not
 * have: every detail slug now shares a namespace with every static route.
 *
 * Under `/services/{slug}` a service called "about" was harmless. At the root it
 * silently shadows `/about` — or rather, it does not, because Astro resolves the
 * static route first and the service page simply never gets built. Either way a
 * page the content author wrote does not exist, and nothing errors.
 *
 * So: build hrefs through the helpers here rather than interpolating strings at
 * call sites, and validate slugs through `assertRoutableSlug` in getStaticPaths.
 */

/** Detail-page hrefs. Both collections resolve at the root — see above. */
export const serviceHref = (slug: string) => `/${slug}`;
export const areaHref = (slug: string) => `/${slug}`;

/** Hub pages. These stay nested; only the detail pages were flattened. */
export const SERVICES_HUB = '/services';
export const AREAS_HUB = '/service-area';

/**
 * Every path this site serves from `src/pages/` that is NOT a collection detail
 * page. A service or area slug matching one of these would be shadowed by the
 * static route and never built.
 *
 * Keep in sync with `src/pages/`. The build fails loudly on a collision rather
 * than shipping a missing page, which is the whole point of the list existing.
 */
export const RESERVED_SLUGS = new Set([
  // static pages
  'about', 'accessibility', 'blog', 'book', 'contact', 'faq', 'index', 'our-work',
  'pricing', 'privacy', 'terms', 'thank-you',
  // hub routes
  'services', 'service-area',
  // endpoints and generated files
  'api', 'robots.txt', 'sitemap-index.xml', 'sitemap-0.xml', '404', '_astro',
]);

/**
 * Anchor id for a sub-service bullet, so the Landscaping menu can link to a
 * specific item within its parent service page. Used by BOTH the menu and the
 * bullet list — they must agree, which is why it is one exported function
 * rather than two inline `.toLowerCase().replace(...)` chains that drift.
 */
export const subServiceId = (label: string) =>
  label.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Throws if a collection slug cannot be served at the root. Call from
 * getStaticPaths so a bad slug fails the build instead of quietly vanishing.
 */
export function assertRoutableSlug(slug: string, collection: string): void {
  if (RESERVED_SLUGS.has(slug)) {
    throw new Error(
      `[${collection}] "${slug}" collides with a static route. Detail pages are served at the root ` +
      `on this site, so this entry would be shadowed by /${slug} and never built. ` +
      `Rename the content file, or remove the conflicting page from src/pages/.`
    );
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error(`[${collection}] "${slug}" is not a valid URL slug (lowercase, digits and hyphens only).`);
  }
}
