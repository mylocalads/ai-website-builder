import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://fireflycd.com',
  output: 'static',
  adapter: vercel({ webAnalytics: { enabled: false } }),
  integrations: [sitemap({ changefreq: 'weekly', lastmod: new Date() })],
  build: {
    format: 'directory',
    // The site's own CSS is ~15 KB across two files, and both were
    // render-blocking: the browser could not paint until it had opened two
    // extra connections and fetched them. Inlining costs a few KB of HTML and
    // removes two round-trips from the critical path, which on Slow 4G is
    // worth far more than the bytes.
    inlineStylesheets: 'always',
  },
  compressHTML: true,
});
