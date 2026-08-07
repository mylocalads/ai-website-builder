import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Legacy /website/* redirects live in vercel.json, NOT here.
//
// Astro's `redirects` emit route regexes anchored with `$`, so
// `/website/core-aeration` matched but `/website/core-aeration/` 404'd — and a
// trailing slash is exactly what every WordPress URL in the client's sitemap
// has. Verified against a live deployment: of the two candidate syntaxes only
// Vercel's `{/}?` matches both forms (`:rest*` does not). vercel.json redirects
// and this adapter's build output apply together, so nothing is lost by moving
// them.
//
// Trade-off worth knowing: vercel.json does not apply to `astro dev` or
// `astro preview`, so the legacy redirects only resolve on a deployment.

export default defineConfig({
  // Canonicals, JSON-LD and the sitemap all derive from this. It points at the
  // real domain from the moment the domain is attached, so nothing has to be
  // rewritten again once DNS propagates.
  site: 'https://whitmanlawncare.com',
  output: 'static',
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
