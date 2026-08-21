import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

/**
 * 301s from the published dmconstructionco.com URL scheme onto this one.
 *
 * The old site is a GoHighLevel funnel: services and cities both resolve at the
 * FLAT root (`/kitchen-remodeling`, `/cape-coral-fl`). This template nests them
 * (`/services/…`, `/service-area/…`). Every one of those flat URLs is currently
 * indexed and linked from the live nav, so without these the migration would
 * hand the client two dozen 404s on pages that earn traffic today.
 *
 * Keep this map in step with src/content/services and src/content/service_areas:
 * a renamed markdown file silently orphans its redirect.
 */
const LEGACY_REDIRECTS = {
  // Specialty pages → /services/{slug}
  '/commercial-tenant-buildouts': '/services/commercial-tenant-buildouts',
  '/outdoor-living-spaces': '/services/outdoor-living-spaces',
  '/whole-home-remodel': '/services/whole-home-remodel',
  '/design-build': '/services/design-build',
  '/kitchen-remodeling': '/services/kitchen-remodeling',
  '/feature-fireplace-wall': '/services/feature-fireplace-wall',
  '/door-windows': '/services/door-windows',
  '/other-services': '/services/other-services',

  // City pages → /service-area/{slug}
  '/cape-coral-fl': '/service-area/cape-coral-fl',
  '/fort-myers-fl': '/service-area/fort-myers-fl',
  '/north-fort-myers-fl': '/service-area/north-fort-myers-fl',
  '/fort-myers-beach-fl': '/service-area/fort-myers-beach-fl',
  '/estero-fl': '/service-area/estero-fl',
  '/bokeelia-fl': '/service-area/bokeelia-fl',
  '/naples-fl': '/service-area/naples-fl',
  '/punta-gorda-fl': '/service-area/punta-gorda-fl',
  '/st-james-city-fl': '/service-area/st-james-city-fl',
  '/matlacha-fl': '/service-area/matlacha-fl',
  '/sanibel-fl': '/service-area/sanibel-fl',
  '/captiva-fl': '/service-area/captiva-fl',
  '/lehigh-acres-fl': '/service-area/lehigh-acres-fl',
  '/bonita-springs-fl': '/service-area/bonita-springs-fl',
  '/port-charlotte-fl': '/service-area/port-charlotte-fl',
  '/alva-fl': '/service-area/alva-fl',

  // Renamed top-level pages
  '/contact-us': '/contact',
  '/pricing-page': '/pricing',
  '/privacy-policy': '/privacy',
  '/book-free-estimate': '/book',
  '/license-insurance-information': '/about',
  '/home-1217': '/',
};

export default defineConfig({
  site: 'https://dm-construction-co.vercel.app',
  output: 'static',
  redirects: LEGACY_REDIRECTS,
  adapter: vercel({ webAnalytics: { enabled: false } }),
  integrations: [sitemap({ changefreq: 'weekly', lastmod: new Date() })],
  build: { format: 'directory' },
  compressHTML: true,
  // Astro's built-in CSRF check compares the Origin header against the origin
  // the function sees. Behind a Vercel alias that is the internal deployment
  // host, so genuine same-site form posts are rejected with
  // "Cross-site POST form submissions are forbidden". The check is done
  // explicitly in src/pages/api/estimate.ts against a known host allowlist.
  security: { checkOrigin: false },
});
