/**
 * Unlighthouse — site-wide Lighthouse.
 *
 * PageSpeed Insights scores one URL. These sites are 24+ pages, and the pages
 * that lose leads are rarely the homepage — a service page with an unoptimised
 * hero, or an area page nobody has opened since it was generated. Unlighthouse
 * crawls the sitemap and audits every page, so "the site scores 48" becomes
 * "these six pages score under 50".
 *
 * Usage:
 *   npm run audit -- --site https://fireflycd.com     # interactive dashboard
 *   npm run audit:ci -- --site https://fireflycd.com  # headless, writes JSON
 *
 * Reports land in .unlighthouse/ (gitignored) — the fleet-audit skill reads
 * ci-result.json from there.
 */
export default {
  // Mobile first: that is how local-services customers actually arrive, and it
  // is the throttled profile where these sites are weakest.
  scanner: {
    device: 'mobile',
    // Sitemaps here are generated from the content collections and list every
    // route, so crawling links on top of that adds time without adding pages.
    sitemap: true,
    crawler: true,
    // These sites have no near-duplicate page families (services and areas are
    // capped deliberately), so there is nothing to sample away — audit each
    // page once.
    samples: 1,
  },

  ci: {
    // Not a hard gate. Local-services sites carry third-party CRM widgets we do
    // not control, so a red build on every run would train everyone to ignore
    // it. Track the trend; act on regressions.
    budget: {
      performance: 50,
      accessibility: 90,
      'best-practices': 85,
      seo: 95,
    },
  },

  puppeteerOptions: {
    // Use the system Chrome when present; falls back to a downloaded Chromium.
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  },

  // Keep concurrency modest — each worker is a full Chrome instance, and this
  // machine has repeatedly run out of disk and memory headroom.
  puppeteerClusterOptions: {
    maxConcurrency: 2,
  },
};
