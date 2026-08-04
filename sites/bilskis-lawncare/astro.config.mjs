import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://bilskis-lawncare.vercel.app',
  output: 'static',
  adapter: vercel({ webAnalytics: { enabled: false } }),
  integrations: [sitemap({ changefreq: 'weekly', lastmod: new Date() })],
  build: { format: 'directory' },
  compressHTML: true,
  // See src/pages/api/estimate.ts — the origin check is done explicitly there
  // because Astro's built-in one rejects same-site posts behind a Vercel alias.
  security: { checkOrigin: false },
});
