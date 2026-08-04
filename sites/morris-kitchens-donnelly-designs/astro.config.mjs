import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://morris-kitchens-donnelly-designs.vercel.app',
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
