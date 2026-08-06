import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { loadEnv } from 'vite';
import { isDuplicateCaseStudyPath } from './src/data/caseStudies.js';

// Vite loads .env into import.meta.env, not process.env. The checkout endpoint
// reads process.env deliberately — import.meta.env is inlined at build time and
// would write the Stripe secret into the built bundle. This bridges .env into
// process.env so local dev works the same way production does.
//
// No effect on Vercel: there is no .env file there, and the real environment
// variables are already present.
Object.assign(process.env, loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), ''));

export default defineConfig({
  site: 'https://mylocalads.co',
  output: 'static',
  adapter: vercel({ webAnalytics: { enabled: false } }),
  integrations: [
    sitemap({
      changefreq: 'weekly',
      lastmod: new Date(),
      // A case study tagged into several categories is served from each one.
      // Only its canonical URL belongs in the sitemap — the rest carry a
      // canonical tag pointing there and would just be duplicates.
      filter: (page) => !isDuplicateCaseStudyPath(new URL(page).pathname),
    }),
  ],
  build: { format: 'directory' },
  compressHTML: true,
});
