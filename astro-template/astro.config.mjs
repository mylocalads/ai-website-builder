import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://REPLACE_SITE_URL',
  output: 'static',
  adapter: vercel({ webAnalytics: { enabled: false } }),
  integrations: [sitemap({ changefreq: 'weekly', lastmod: new Date() })],
  build: { format: 'directory' },
  compressHTML: true,
});
