# AI Website Builder — Astro Refactor Implementation Plan (v2.1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

---

## v2.2 Amendments (2026-07-22, second pass mid-execution)

Section arrangement and URL structure are now fixed — no randomization. Reference site DNA: `https://agcconcrete.com/` (seeded in Task 16 for both roofing and concrete verticals).

### E) Fixed section order per page type (affects Task 6, Task 9, Task 10, Task 11)

Every page of a given type ships the same section order, always. Financing, us-vs-them, and other conditional sections render only if the site config marks them enabled.

**Home page order:**
1. Header (mega menu — Task 5)
2. Hero + inline form
3. Partner badges strip
4. About us
5. Our services
6. Why choose us (icon grid)
7. Customer testimonials
8. Financing (only if enabled)
9. Us vs. Them comparison (only if enabled)
10. Service area
11. Gallery
12. FAQs
13. Get in touch (contact section)
14. Bottom CTA
15. Footer

**Service page (`/services/[slug]`) order:**
1. Header
2. Hero + form
3. Partner badges
4. About our service + gallery
5. Why choose us
6. Our services (cross-sell)
7. Testimonials
8. Financing (only if enabled)
9. Service area
10. FAQs
11. Get in touch
12. Bottom CTA
13. Footer

**Service area page (`/[city]-[state]`) order:**
1. Header
2. Hero + form
3. Partner badges
4. About our location + gallery
5. Why choose us
6. Our services
7. Testimonials
8. Financing (only if enabled)
9. Service area (grid of other areas)
10. FAQs
11. Get in touch
12. Bottom CTA
13. Footer

Contact / gallery / TOS / privacy / accessibility pages follow industry conventions but use the same header, footer, tokens, and design DNA.

**Remove `section_rhythm` field from the site config schema** — it's dead. If Task 2 already shipped with it (it did — commit `a80740a`), leave the field for backwards-compat but mark it deprecated in a comment; no consumer reads it now.

### F) Flat URL structure for service areas (affects Task 11, Task 12)

Service area pages live at flat `/{city-slug}-{state-abbr-lower}` URLs:

- `/miami-fl`
- `/denver-co`
- `/austin-tx`

Not nested under `/service-areas/`. Astro dynamic route: `src/pages/[area].astro`. The slug in `src/content/service_areas/*.md` frontmatter is the full `city-state` combined form (e.g. `slug: miami-fl`), not just the city.

`/service-areas` parent index still exists (Task 11) as a directory listing all areas — but individual area pages resolve at the flat root.

### G) Cut the programmatic SEO matrix (affects Task 12)

Task 12 (`src/pages/service-areas/[area]/[service].astro`) is removed. The user's spec cross-links services and areas via in-page sections rather than dedicated matrix pages. If pSEO matrix is desired later, it goes at `/{city}-{state}/{service}` — do not implement now.

**Mark Task 12 completed/skipped in TodoWrite** and do not dispatch an implementer for it.

### H) Expanded Task 6 component list

Task 6 now covers ALL these section components (max ~11 files):

- `Hero.astro` — same as v1 plan but with an optional inline form embed slot (contact_form_embed_url renders as iframe below the CTA when set)
- `PartnerBadges.astro` — horizontal logo strip. Reads `site.partners` (array of `{ name, logo_url, link_url? }`).
- `AboutSection.astro` — a reusable "about us / about our service / about our location" section that takes `heading`, `body`, `photo` props.
- `OurServices.astro` — grid of service tiles (renamed from `ServiceGrid` for clarity; same behavior).
- `WhyChooseUs.astro` — icon+title+description tiles. Reads `site.why_choose_us` (array of `{ icon, title, description }`).
- `Testimonials.astro` — same as v1 plan.
- `Financing.astro` — full-width section with headline, description, CTA. Renders only when `site.financing?.enabled` is true.
- `UsVsThem.astro` — two-column comparison table. Reads `site.us_vs_them` (`{ headline, us_label, them_label, rows: [{us, them}] }`). Renders only when set.
- `ServiceAreaGrid.astro` — same as v1 plan (grid of areas, top-5 sliced).
- `Gallery.astro` — merged Portfolio + gallery (renamed from `PortfolioGrid`). Renders `items: Project[]` prop.
- `FAQ.astro` — same as v1 plan.
- `CTA.astro` — same as v1 plan; used as "Bottom CTA" section.
- `PricingTable.astro` — same as v1 plan (pricing page only, not in fixed home order).

Order-of-render is enforced by the page templates in Tasks 9, 10, 11 — components themselves don't know the order.

### I) Site config schema additions (affects Task 2 — patch forward)

Add these optional fields to the `site.config` schema. Since Task 2 is already committed, apply as a follow-up commit before Task 6 dispatches (or fold into Task 6 setup):

```ts
partners: z.array(z.object({
  name: z.string(),
  logo_url: z.string().url(),
  link_url: z.string().url().optional(),
})).default([]),

why_choose_us: z.array(z.object({
  icon: z.string(),          // emoji or short label — no image required
  title: z.string(),
  description: z.string(),
})).default([]),

financing: z.object({
  enabled: z.boolean().default(false),
  headline: z.string().optional(),
  description: z.string().optional(),
  cta_text: z.string().optional(),
  cta_href: z.string().optional(),
  logo_url: z.string().url().optional(),
}).default({ enabled: false }),

us_vs_them: z.object({
  enabled: z.boolean().default(false),
  headline: z.string().optional(),
  us_label: z.string().optional(),
  them_label: z.string().optional(),
  rows: z.array(z.object({ us: z.string(), them: z.string() })).default([]),
}).default({ enabled: false, rows: [] }),

gallery: z.array(z.object({
  title: z.string().optional(),
  location: z.string().optional(),
  photo: z.string().url(),
  alt: z.string(),
  description: z.string().optional(),
})).default([]),
```

Also the `services` collection schema gets a per-service `gallery` (optional array of `{photo, alt}`) so service pages can render their own gallery under "about our service".

Also the `service_areas` collection schema gets `gallery` and a required `state_abbr` (two-letter, lowercase) field the routing uses to build the slug — or the slug itself carries the `-{state}` suffix. Simpler: keep `slug` as the full `city-state` string (e.g. `miami-fl`), and add a nice `name_full` optional display string.

### J) Global sections — header/footer stay in BaseLayout

Confirmation: `Header.astro` and `Footer.astro` are already global via `BaseLayout.astro`. All page templates inherit them without any per-page composition. No duplication risk.

---

## v2.1 Amendments (2026-07-22, mid-execution)

The following amendments override the task specs below where they conflict. Any implementer dispatched to an affected task receives the amended text.

### A) Standardized legal content (affects Task 2, Task 14, Task 15, Task 18)

Legal pages (Privacy Policy, Terms of Service, Accessibility Statement) are **standardized across all clients**. The body text is the same for every client — only business name, address, phone, email, state (for governing law), and last-updated date get substituted.

- `src/content/legal/{privacy,terms,accessibility}.md` ships the final production text with mustache-style `{{BUSINESS_NAME}}`, `{{ADDRESS}}`, `{{PHONE}}`, `{{EMAIL}}`, `{{STATE}}`, `{{UPDATED}}` tokens. No client-specific paragraphs.
- The `site-generate` skill only rewrites tokens — it does not vary the surrounding text.
- Do not add per-client sections, industry-specific carve-outs, or optional disclaimers.

### B) CRM integration is paste-only (affects Task 2, Task 7, Task 18)

The agent must never research, guess, or synthesize GHL widget loader URLs, form URLs, or scripts. The `site-generate` skill only **asks the user** for these strings and pastes them verbatim into the site config.

Amend the `site.crm` schema to store raw pasted content:

```ts
crm: z.object({
  provider: z.literal('ghl').default('ghl'),
  chat_widget_snippet: z.string().optional(),      // full <script> tag pasted from GHL
  contact_form_embed_url: z.string().url().optional(), // iframe src
  estimate_form_embed_url: z.string().url().optional(),
  reviews_widget_snippet: z.string().optional(),   // full HTML pasted from GHL
  call_tracking_snippet: z.string().optional(),    // GHL number-swap script
  call_tracking_number: z.string().optional(),
}).default({ provider: 'ghl' }),
```

Amend Task 7 components:

- `GHLChatWidget.astro`: renders `{site.crm.chat_widget_snippet}` via `<Fragment set:html={...} />` (or `<div set:html>`). No loader-URL synthesis.
- `GHLFormEmbed.astro`: takes `embed_url` prop, renders `<iframe src={embed_url}>` unchanged.
- `GHLReviewsWidget.astro`: renders `{site.crm.reviews_widget_snippet}` via `set:html`. No loader-URL synthesis.
- `CallTrackingScript.astro`: renders `{site.crm.call_tracking_snippet}` via `set:html`. No transformation.

The `site-generate` skill prompts explicitly:
> "Paste the GHL chat widget snippet (or blank if none):"
> "Paste the GHL reviews widget snippet (or blank if none):"
> "Paste the GHL number-swap tracking script (or blank if none):"
> "Paste the contact form embed URL (or blank if none):"
> "Paste the estimate form embed URL (or blank if none):"

### C) Universal code injection slots (affects Task 2, Task 4, Task 5, Task 18)

Every page needs three code-injection slots (head, body-start, body-end) for pixels, analytics, GHL number swap, and other third-party scripts. Site-wide by default; per-page overrides via frontmatter/props allowed.

Add to `site.config` schema:

```ts
code_injection: z.object({
  head: z.string().optional(),        // rendered in <head>
  body_start: z.string().optional(),  // rendered immediately after <body>
  body_end: z.string().optional(),    // rendered immediately before </body>
  per_page: z.record(z.object({       // key = page pathname without trailing slash (e.g. "/contact")
    head: z.string().optional(),
    body_start: z.string().optional(),
    body_end: z.string().optional(),
  })).default({}),
}).default({}),
```

Amend `BaseLayout.astro` (Task 4):

- Accept `pagePath` prop (e.g. `Astro.url.pathname` — page passes it in).
- Compute `injection = { ...site.code_injection, ...site.code_injection.per_page?.[pagePath] }` (per-page slot overrides site-wide).
- Render:
  - In `<head>`, before closing `</head>`: `{injection.head && <Fragment set:html={injection.head} />}`
  - Immediately after `<body>` opening: `{injection.body_start && <Fragment set:html={injection.body_start} />}`
  - Immediately before `</body>`: `{injection.body_end && <Fragment set:html={injection.body_end} />}`
- Emit `<!-- code-injection: head/body_start/body_end -->` comments for debuggability.

Amend page templates to pass `pagePath={Astro.url.pathname}` when calling BaseLayout.

The `site-generate` skill prompts:
> "Paste any HTML/scripts to inject in <head> site-wide (Meta Pixel, GTM, Google Ads gtag, meta verification, etc.) — or blank:"
> "Paste any HTML/scripts to inject immediately after <body> (GTM noscript, etc.) — or blank:"
> "Paste any HTML/scripts to inject before </body> (chat/analytics/GHL number swap) — or blank:"
> "Per-page overrides needed? (usually no — press enter to skip)"

### D) Seed reference URL (affects Task 16)

`https://agcconcrete.com/` seeds both `reference-libraries/roofing.json` and `reference-libraries/concrete.json` with notes: "Type-driven layout, editorial section rhythm, earth-tone palette, real project photography, no gradient hero, no glass morphism, no purple accents. Use as visual DNA reference for both roofing and concrete verticals."

---

**Goal:** Refactor the single-file HTML agent (copied from `website-builder-kit`) into a multi-page Astro site generator with full local-SEO best practices, ADA / GDPR / A2P compliance features, GHL CRM widget integration, per-vertical reference-URL template libraries, and Vercel domain automation.

**Architecture:** A versioned `astro-template/` provides the reusable Astro scaffold — content collections (`services`, `service_areas`, `pages`, `site`), a shared SEO-hardened `BaseLayout`, dynamic route templates, CSS custom-property design tokens, and enable-flags for compliance and CRM widgets driven by the per-site config. Per-vertical curated reference URLs live under `reference-libraries/` (e.g. `roofing.json`, `concrete.json`). The old `site-redesign` skill splits into three focused skills: `design-reference` (URLs → tokens + section rhythm, from an explicit list or a library), `site-generate` (copy template → populate collections + tokens + widget snippets), and a modified `vercel-deploy` (build → deploy → `vercel domains add` → rewrite site URL → redeploy).

**Tech Stack:** Astro 5, `@astrojs/sitemap`, `@astrojs/vercel`, Zod (via Astro content collections), Vercel CLI, Google Fonts, GHL widget embeds (chat, forms/surveys, call-tracking number swap, reviews), Cookie Consent banner (self-hosted), Playwright/Firecrawl/Apify (existing pipeline).

**Deploy target:** Vercel (unchanged). Agent runs `vercel domains add {domain}` after first deploy, then rewrites `site` URL + `robots.txt` and redeploys so canonicals, sitemap, and JSON-LD reference the final domain.

**Site map produced per client:**

```
/                         Home
/our-work                 Portfolio / gallery
/pricing                  Pricing (packages / lead pricing)
/contact                  Contact
/about                    About
/privacy                  Privacy Policy (GDPR-compliant)
/terms                    Terms of Service
/accessibility            Accessibility Statement (ADA)
/services                 Services parent (index of up to 5 subpages)
/services/[slug]          One per service (max 5)
/service-areas            Service Areas parent (index of up to 5 subpages)
/service-areas/[area]     One per area (max 5)
/service-areas/[area]/[service]   Programmatic SEO matrix (max 5 × 5 = 25)
/sitemap-index.xml        Auto-generated
/robots.txt               Auto-generated
```

Header nav uses **nested dropdowns** for Services and Service Areas so subpages are surfaced without cluttering the top nav.

**Local-SEO baseline (baked into every page):**

- `<title>`, meta description, canonical, OG, Twitter Card
- `LocalBusiness` JSON-LD on every page, `Service` JSON-LD on service pages, `FAQPage` JSON-LD where FAQs render, `BreadcrumbList` on all non-home pages, `AggregateRating` when review data exists
- NAP (Name / Address / Phone) consistent in header + footer + contact block, matching Maps profile exactly
- Geo-specific title / H1 / meta pattern on service and area pages (`{Service} in {City}, {State}`)
- `hreflang` = `en-US` (all pages)
- Image `alt`, `loading="lazy"` for below-the-fold
- Semantic HTML (`<main>`, `<article>`, `<nav>`, `<header>`, `<footer>`, `<section>`)
- Sitemap includes all dynamic routes; robots.txt allows all + points to sitemap
- Static output → strong Core Web Vitals by default

---

## File Structure

**New files inside `mla-agents/ai-website-builder/`:**

- `astro-template/` — reusable Astro project scaffold
  - `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `README.md`
  - `src/content/config.ts` — Zod schemas
  - `src/content/site/config.json`, `home.json`, `about.json`, `pricing.json`, `our-work.json` (populated per site)
  - `src/content/services/.gitkeep`
  - `src/content/service_areas/.gitkeep`
  - `src/content/legal/privacy.md`, `terms.md`, `accessibility.md` (templated, per-site substitutions)
  - `src/layouts/BaseLayout.astro`
  - `src/components/` — Header, Footer, Hero, ServiceGrid, ServiceAreaGrid, Testimonials, FAQ, TrustBadges, CTA, ContactBlock, Breadcrumbs, PortfolioGrid, PricingTable, CookieConsent, GHLChatWidget, GHLFormEmbed, GHLReviewsWidget, CallTrackingScript, SkipNav
  - `src/pages/` — index, about, contact, our-work, pricing, privacy, terms, accessibility, services/index, services/[slug], service-areas/index, service-areas/[area], service-areas/[area]/[service]
  - `src/styles/tokens.css`, `global.css`, `a11y.css`
  - `public/robots.txt`
- `reference-libraries/` — curated per-vertical reference sets
  - `default.json` — empty starter
  - `roofing.json` — empty starter with a schema doc
  - `concrete.json` — empty starter
  - `README.md` — how to add libraries
- `.agent/skills/design-reference/SKILL.md`
- `.agent/skills/site-generate/SKILL.md`
- `.agent/skills/vercel-deploy/SKILL.md` (rewritten)

**Removed / rewritten:**

- `.agent/skills/site-redesign/SKILL.md` — deleted
- `CLAUDE.md`, `.agent/workflows/website-builder.md` — updated

**Unchanged:** `find-business`, `scrape-content`, `local-research`, `site-audit`, `short-link`.

---

## Design Anti-Patterns (enforced in `site-generate` prompt)

- No gradient hero backgrounds
- No glass morphism
- No bento grids
- No purple / indigo / violet accents unless a reference URL uses one
- Max 1 outline icon per section, semantic only
- No "handshake" or "diverse team pointing at laptop" stock photography
- No "Trusted by 10,000+ customers" without real numbers
- No "Stunning / Beautiful / Powerful / Seamless / Effortless" in headers
- Section rhythm varies per site — driven by `design_reference.json.section_rhythm`

---

## Task 1: Bootstrap Astro template project

**Files:**

- Create: `astro-template/package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `README.md`

- [ ] **Step 1: `package.json`**

```json
{
  "name": "mla-astro-template",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": { "dev": "astro dev", "build": "astro build", "preview": "astro preview", "astro": "astro" },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/sitemap": "^3.2.0",
    "@astrojs/vercel": "^8.0.0"
  }
}
```

- [ ] **Step 2: `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/static';

export default defineConfig({
  site: 'https://REPLACE_SITE_URL',
  output: 'static',
  adapter: vercel({ webAnalytics: { enabled: false } }),
  integrations: [sitemap({ changefreq: 'weekly', lastmod: new Date() })],
  build: { format: 'directory' },
  compressHTML: true,
});
```

- [ ] **Step 3: `tsconfig.json`**

```json
{ "extends": "astro/tsconfigs/strict" }
```

- [ ] **Step 4: `.gitignore`**

```
node_modules
dist
.astro
.vercel
.DS_Store
```

- [ ] **Step 5: `README.md`**

```markdown
# MLA Astro Template

Reusable Astro scaffold cloned per client by the site-generate skill.
Do not edit content collections or `src/styles/tokens.css` here — those are populated per site.
Structural changes (layouts, components, page templates, schema plumbing) go here.
```

- [ ] **Step 6: Install and verify**

```bash
cd astro-template && npm install && npx astro --version
```

Expected: prints Astro 5.x version, no errors.

- [ ] **Step 7: Commit**

```bash
git add astro-template/
git commit -m "feat(astro-template): bootstrap Astro project scaffold"
```

---

## Task 2: Content collection schemas

**Files:** Create `astro-template/src/content/config.ts`, `src/content/site/config.json`, `.gitkeep` placeholders.

- [ ] **Step 1: `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    short_description: z.string(),
    long_description: z.string(),
    icon: z.string().optional(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    hero_photo: z.string().url().optional(),
    order: z.number().default(0),
  }),
});

const service_areas = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    county: z.string().optional(),
    state: z.string(),
    neighborhoods: z.array(z.string()).default([]),
    local_context: z.string().optional(),
    order: z.number().default(0),
  }),
});

const legal = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    updated: z.string(),
  }),
});

const site = defineCollection({
  type: 'data',
  schema: z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('config'),
      business_name: z.string(),
      legal_name: z.string().optional(),
      tagline: z.string(),
      phone: z.string(),
      phone_display: z.string(),
      email: z.string().email().optional(),
      address: z.object({
        street: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postal: z.string().optional(),
        country: z.string().default('US'),
      }),
      geo: z.object({ lat: z.number(), lng: z.number() }).optional(),
      hours: z.record(z.string()).optional(),
      site_url: z.string().url(),
      rating: z.number().optional(),
      review_count: z.number().optional(),
      licensed: z.boolean().default(false),
      insured: z.boolean().default(false),
      bonded: z.boolean().default(false),
      years_in_business: z.number().optional(),
      social: z.object({
        google_maps: z.string().url().optional(),
        facebook: z.string().url().optional(),
        instagram: z.string().url().optional(),
        yelp: z.string().url().optional(),
      }).default({}),
      reference_urls: z.array(z.string().url()).default([]),
      section_rhythm: z.array(z.string()).default([]),
      compliance: z.object({
        ada: z.boolean().default(true),
        gdpr: z.boolean().default(true),
        a2p: z.boolean().default(true),
      }).default({ ada: true, gdpr: true, a2p: true }),
      crm: z.object({
        provider: z.literal('ghl').default('ghl'),
        chat_widget_id: z.string().optional(),
        contact_form_embed: z.string().optional(),
        estimate_form_embed: z.string().optional(),
        reviews_widget_id: z.string().optional(),
        call_tracking_script: z.string().optional(),
        call_tracking_number: z.string().optional(),
      }).default({ provider: 'ghl' }),
    }),
    z.object({
      kind: z.literal('home'),
      hero: z.object({
        eyebrow: z.string().optional(),
        headline: z.string(),
        subheadline: z.string(),
        cta_text: z.string(),
        cta_href: z.string(),
        photo: z.string().url().optional(),
      }),
      testimonials: z.array(z.object({
        name: z.string(), location: z.string().optional(), text: z.string(), rating: z.number().optional(),
      })).default([]),
      faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    }),
    z.object({ kind: z.literal('about'), story: z.string() }),
    z.object({
      kind: z.literal('pricing'),
      intro: z.string(),
      packages: z.array(z.object({
        name: z.string(), price: z.string(), unit: z.string().optional(),
        includes: z.array(z.string()), cta_text: z.string(), cta_href: z.string(),
      })),
      notes: z.string().optional(),
    }),
    z.object({
      kind: z.literal('our-work'),
      intro: z.string(),
      projects: z.array(z.object({
        title: z.string(), location: z.string().optional(), photo: z.string().url(),
        alt: z.string(), description: z.string().optional(),
      })),
    }),
  ]),
});

export const collections = { services, service_areas, legal, site };
```

- [ ] **Step 2: `src/content/site/config.json` placeholder**

```json
{
  "kind": "config",
  "business_name": "Example Roofing Co",
  "legal_name": "Example Roofing LLC",
  "tagline": "Local roofing you can count on",
  "phone": "+15555550100",
  "phone_display": "(555) 555-0100",
  "address": { "city": "Denver", "state": "CO", "country": "US" },
  "site_url": "https://REPLACE_SITE_URL",
  "reference_urls": [],
  "section_rhythm": ["hero", "trust", "services", "areas", "testimonials", "cta", "faq", "contact"]
}
```

- [ ] **Step 3: `.gitkeep` for services and areas**

```bash
touch astro-template/src/content/services/.gitkeep astro-template/src/content/service_areas/.gitkeep
mkdir -p astro-template/src/content/legal
```

- [ ] **Step 4: Verify schema**

```bash
cd astro-template && npx astro sync
```

Expected: no error.

- [ ] **Step 5: Commit**

```bash
git add astro-template/src/content/
git commit -m "feat(astro-template): add content collection schemas (services, service_areas, legal, site with discriminated union)"
```

---

## Task 3: Design tokens + global styles + a11y styles

**Files:** Create `src/styles/tokens.css`, `global.css`, `a11y.css`, `public/robots.txt`.

- [ ] **Step 1: `src/styles/tokens.css` placeholder**

```css
:root {
  --color-bg: #ffffff;
  --color-text: #111111;
  --color-muted: #555555;
  --color-accent: #b7472a;
  --color-surface: #f5f2ee;
  --color-focus: #0057ff;
  --font-display: 'EB Garamond', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --radius-sm: 4px; --radius-md: 8px;
  --space-1: 0.5rem; --space-2: 1rem; --space-3: 1.5rem; --space-4: 2.5rem; --space-5: 4rem;
  --max-width: 1200px;
}
```

- [ ] **Step 2: `src/styles/global.css`**

```css
@import './tokens.css';
@import './a11y.css';

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0; background: var(--color-bg); color: var(--color-text);
  font-family: var(--font-body); line-height: 1.5; -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4 { font-family: var(--font-display); line-height: 1.15; margin: 0 0 var(--space-2); }
a { color: inherit; text-underline-offset: 3px; }
img { max-width: 100%; height: auto; display: block; }
.container { max-width: var(--max-width); margin: 0 auto; padding: 0 var(--space-3); }
```

- [ ] **Step 3: `src/styles/a11y.css`**

```css
.skip-nav {
  position: absolute; left: -9999px; top: 0; background: var(--color-focus); color: white;
  padding: 0.75rem 1rem; z-index: 1000; text-decoration: none;
}
.skip-nav:focus { left: 0; }
:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  html { scroll-behavior: auto; }
}
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
```

- [ ] **Step 4: `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://REPLACE_SITE_URL/sitemap-index.xml
```

- [ ] **Step 5: Commit**

```bash
git add astro-template/src/styles astro-template/public/robots.txt
git commit -m "feat(astro-template): add design tokens, global styles, a11y styles, robots.txt"
```

---

## Task 4: BaseLayout with local-SEO plumbing

**Files:** Create `src/layouts/BaseLayout.astro`.

- [ ] **Step 1: `BaseLayout.astro`**

```astro
---
import '../styles/global.css';
import { getEntry } from 'astro:content';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import SkipNav from '../components/SkipNav.astro';
import CookieConsent from '../components/CookieConsent.astro';
import CallTrackingScript from '../components/CallTrackingScript.astro';

export interface Props {
  title: string;
  description: string;
  canonical?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  breadcrumbs?: Array<{ name: string; href: string }>;
  ogImage?: string;
}

const { title, description, canonical, jsonLd, breadcrumbs, ogImage } = Astro.props;
const site = (await getEntry('site', 'config')).data as any;
const canonicalUrl = canonical ?? new URL(Astro.url.pathname, Astro.site).toString();

const localBusinessLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${site.site_url}#localbusiness`,
  name: site.business_name,
  legalName: site.legal_name,
  telephone: site.phone,
  email: site.email,
  url: site.site_url,
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    postalCode: site.address.postal,
    addressCountry: site.address.country,
  },
  geo: site.geo ? { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng } : undefined,
  sameAs: Object.values(site.social).filter(Boolean),
  aggregateRating: site.rating && site.review_count
    ? { '@type': 'AggregateRating', ratingValue: site.rating, reviewCount: site.review_count }
    : undefined,
};

const breadcrumbLd = breadcrumbs && breadcrumbs.length > 0 ? {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((b, i) => ({
    '@type': 'ListItem', position: i + 1, name: b.name, item: new URL(b.href, Astro.site).toString(),
  })),
} : null;

const ldPayloads = [localBusinessLd, breadcrumbLd, ...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [])].filter(Boolean);
---
<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalUrl} />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:locale" content="en_US" />
    {ogImage && <meta property="og:image" content={ogImage} />}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {ldPayloads.map((ld) => <script type="application/ld+json" set:html={JSON.stringify(ld)} />)}
  </head>
  <body>
    <SkipNav />
    <Header />
    <main id="main" tabindex="-1"><slot /></main>
    <Footer />
    {site.compliance?.gdpr && <CookieConsent />}
    {site.crm?.call_tracking_script && <CallTrackingScript />}
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add astro-template/src/layouts/BaseLayout.astro
git commit -m "feat(astro-template): BaseLayout with local-SEO meta, JSON-LD (LocalBusiness + BreadcrumbList), Twitter Card, canonical, skip-nav, cookie consent gate, call-tracking hook"
```

---

## Task 5: Core components (Header, Footer, SkipNav, Breadcrumbs, TrustBadges, ContactBlock)

**Files:** Create `src/components/Header.astro`, `Footer.astro`, `SkipNav.astro`, `Breadcrumbs.astro`, `TrustBadges.astro`, `ContactBlock.astro`.

- [ ] **Step 1: `SkipNav.astro`**

```astro
<a class="skip-nav" href="#main">Skip to main content</a>
```

- [ ] **Step 2: `Header.astro` (with nested dropdowns for Services and Service Areas)**

```astro
---
import { getEntry, getCollection } from 'astro:content';
const site = (await getEntry('site', 'config')).data as any;
const services = (await getCollection('services')).sort((a, b) => a.data.order - b.data.order).slice(0, 5);
const areas = (await getCollection('service_areas')).sort((a, b) => a.data.order - b.data.order).slice(0, 5);
---
<header class="site-header">
  <div class="container header-row">
    <a href="/" class="brand" aria-label={`${site.business_name} — Home`}>{site.business_name}</a>
    <nav aria-label="Primary">
      <ul class="nav-list">
        <li class="has-menu">
          <a href="/services" aria-haspopup="true">Services ▾</a>
          <ul class="submenu">
            {services.map((s) => <li><a href={`/services/${s.data.slug}`}>{s.data.title}</a></li>)}
            <li><a href="/services">All services</a></li>
          </ul>
        </li>
        <li class="has-menu">
          <a href="/service-areas" aria-haspopup="true">Service Areas ▾</a>
          <ul class="submenu">
            {areas.map((a) => <li><a href={`/service-areas/${a.data.slug}`}>{a.data.name}</a></li>)}
            <li><a href="/service-areas">All areas</a></li>
          </ul>
        </li>
        <li><a href="/our-work">Our Work</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
        <li><a href={`tel:${site.phone}`} class="phone-cta">{site.phone_display}</a></li>
      </ul>
    </nav>
  </div>
</header>
<style>
  .site-header { border-bottom: 1px solid var(--color-surface); position: sticky; top: 0; background: var(--color-bg); z-index: 50; }
  .header-row { display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) 0; gap: var(--space-3); }
  .brand { font-family: var(--font-display); font-size: 1.25rem; text-decoration: none; }
  .nav-list { list-style: none; padding: 0; margin: 0; display: flex; gap: var(--space-3); align-items: center; }
  .nav-list a { text-decoration: none; }
  .has-menu { position: relative; }
  .submenu {
    position: absolute; top: 100%; left: 0; min-width: 220px; background: var(--color-bg);
    border: 1px solid var(--color-surface); padding: var(--space-1) 0; margin: 0; list-style: none;
    display: none; box-shadow: 0 4px 14px rgba(0,0,0,0.08); border-radius: var(--radius-sm);
  }
  .has-menu:hover .submenu, .has-menu:focus-within .submenu { display: block; }
  .submenu li a { display: block; padding: 0.5rem var(--space-2); }
  .phone-cta { background: var(--color-accent); color: white; padding: 0.5rem 1rem; border-radius: var(--radius-sm); }
  @media (max-width: 900px) { .nav-list li:not(.phone-cta-item) { display: none; } .phone-cta { display: inline-block; } }
</style>
```

- [ ] **Step 3: `Footer.astro`**

```astro
---
import { getEntry, getCollection } from 'astro:content';
const site = (await getEntry('site', 'config')).data as any;
const services = (await getCollection('services')).sort((a, b) => a.data.order - b.data.order).slice(0, 5);
const areas = (await getCollection('service_areas')).sort((a, b) => a.data.order - b.data.order).slice(0, 5);
const year = new Date().getFullYear();
---
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="brand">{site.business_name}</div>
        <p>{site.tagline}</p>
        <address>
          {site.address.street && <>{site.address.street}<br /></>}
          {site.address.city}, {site.address.state} {site.address.postal ?? ''}
        </address>
        <p><a href={`tel:${site.phone}`}>{site.phone_display}</a></p>
        {site.email && <p><a href={`mailto:${site.email}`}>{site.email}</a></p>}
      </div>
      <div>
        <h3>Services</h3>
        <ul>{services.map((s) => <li><a href={`/services/${s.data.slug}`}>{s.data.title}</a></li>)}</ul>
      </div>
      <div>
        <h3>Service Areas</h3>
        <ul>{areas.map((a) => <li><a href={`/service-areas/${a.data.slug}`}>{a.data.name}, {a.data.state}</a></li>)}</ul>
      </div>
      <div>
        <h3>Company</h3>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/our-work">Our Work</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-legal">
      <ul>
        <li><a href="/privacy">Privacy Policy</a></li>
        <li><a href="/terms">Terms of Service</a></li>
        <li><a href="/accessibility">Accessibility Statement</a></li>
      </ul>
      <p>© {year} {site.legal_name ?? site.business_name}. All rights reserved.</p>
    </div>
  </div>
</footer>
<style>
  .site-footer { background: var(--color-surface); padding: var(--space-5) 0 var(--space-3); margin-top: var(--space-5); }
  .footer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); }
  .brand { font-family: var(--font-display); font-size: 1.15rem; }
  h3 { font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: var(--space-1); }
  ul { list-style: none; padding: 0; }
  ul li { padding: 0.25rem 0; }
  address { font-style: normal; }
  .footer-legal { border-top: 1px solid rgba(0,0,0,0.08); padding-top: var(--space-2); margin-top: var(--space-3); display: flex; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2); font-size: 0.875rem; color: var(--color-muted); }
  .footer-legal ul { display: flex; gap: var(--space-3); }
  @media (max-width: 780px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 4: `Breadcrumbs.astro`**

```astro
---
export interface Props { items: Array<{ name: string; href: string }>; }
const { items } = Astro.props;
---
<nav aria-label="Breadcrumb" class="crumbs">
  <ol>
    {items.map((c, i) => (
      <li>
        {i < items.length - 1 ? <a href={c.href}>{c.name}</a> : <span aria-current="page">{c.name}</span>}
      </li>
    ))}
  </ol>
</nav>
<style>
  .crumbs { padding: var(--space-2) 0; font-size: 0.9rem; color: var(--color-muted); }
  ol { list-style: none; display: flex; gap: 0.5rem; padding: 0; margin: 0; flex-wrap: wrap; }
  li + li::before { content: '/'; margin-right: 0.5rem; opacity: 0.5; }
  a { color: inherit; }
</style>
```

- [ ] **Step 5: `TrustBadges.astro`**

```astro
---
import { getEntry } from 'astro:content';
const site = (await getEntry('site', 'config')).data as any;
const badges = [
  site.licensed && 'Licensed',
  site.insured && 'Insured',
  site.bonded && 'Bonded',
  site.years_in_business && `${site.years_in_business}+ years serving ${site.address.city}`,
  site.rating && site.review_count && `${site.rating}★ (${site.review_count} reviews)`,
].filter(Boolean);
---
{badges.length > 0 && (
  <section class="trust" aria-label="Credentials">
    <div class="container"><ul>{badges.map((b) => <li>{b}</li>)}</ul></div>
  </section>
)}
<style>
  .trust { padding: var(--space-2) 0; border-top: 1px solid var(--color-surface); border-bottom: 1px solid var(--color-surface); }
  ul { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: var(--space-3); justify-content: center; font-size: 0.9rem; color: var(--color-muted); }
</style>
```

- [ ] **Step 6: `ContactBlock.astro`** — same as v1 plan (see previous Task 4 Step 10 pattern; unchanged).

- [ ] **Step 7: Commit**

```bash
git add astro-template/src/components/Header.astro astro-template/src/components/Footer.astro astro-template/src/components/SkipNav.astro astro-template/src/components/Breadcrumbs.astro astro-template/src/components/TrustBadges.astro astro-template/src/components/ContactBlock.astro
git commit -m "feat(astro-template): Header (with nested Services/Areas dropdowns), Footer (with legal links), SkipNav, Breadcrumbs, TrustBadges, ContactBlock"
```

---

## Task 6: Section components (Hero, ServiceGrid, ServiceAreaGrid, Testimonials, FAQ, CTA, PortfolioGrid, PricingTable)

**Files:** Create Hero, ServiceGrid, ServiceAreaGrid, Testimonials, FAQ, CTA, PortfolioGrid, PricingTable Astro components.

- [ ] **Step 1: `Hero.astro`** — same shape as v1 plan Task 4 Step 3. Ensure `<img>` has meaningful `alt` from props.

- [ ] **Step 2: `ServiceGrid.astro` (max 5)**

```astro
---
import { getCollection } from 'astro:content';
const services = (await getCollection('services')).sort((a, b) => a.data.order - b.data.order).slice(0, 5);
---
<section id="services" class="services" aria-label="Services">
  <div class="container">
    <h2>Services</h2>
    <div class="grid">
      {services.map((s) => (
        <a href={`/services/${s.data.slug}`} class="card">
          <h3>{s.data.title}</h3>
          <p>{s.data.short_description}</p>
        </a>
      ))}
    </div>
  </div>
</section>
<style>
  .services { padding: var(--space-5) 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); }
  .card { display: block; padding: var(--space-3); background: var(--color-surface); border-radius: var(--radius-md); text-decoration: none; transition: transform 0.15s; }
  .card:hover, .card:focus-visible { transform: translateY(-2px); }
  .card h3 { margin: 0 0 var(--space-1); }
  .card p { color: var(--color-muted); margin: 0; }
</style>
```

- [ ] **Step 3: `ServiceAreaGrid.astro` (max 5)**

```astro
---
import { getCollection } from 'astro:content';
const areas = (await getCollection('service_areas')).sort((a, b) => a.data.order - b.data.order).slice(0, 5);
---
<section id="areas" class="areas" aria-label="Service areas">
  <div class="container">
    <h2>Service Areas</h2>
    <ul class="area-list">
      {areas.map((a) => (
        <li><a href={`/service-areas/${a.data.slug}`}>{a.data.name}, {a.data.state}</a></li>
      ))}
    </ul>
  </div>
</section>
<style>
  .areas { padding: var(--space-5) 0; background: var(--color-surface); }
  .area-list { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-1); }
  .area-list a { text-decoration: none; padding: var(--space-1) 0; display: block; }
</style>
```

- [ ] **Step 4: `Testimonials.astro`, `FAQ.astro`, `CTA.astro`** — same as v1 plan. FAQ additionally emits FAQPage JSON-LD via BaseLayout `jsonLd` prop when rendered on a page (page composes it — see Task 7).

- [ ] **Step 5: `PortfolioGrid.astro`**

```astro
---
export interface Project { title: string; location?: string; photo: string; alt: string; description?: string; }
export interface Props { items: Project[]; }
const { items } = Astro.props;
---
<section class="portfolio" aria-label="Our work">
  <div class="container">
    <div class="grid">
      {items.map((p) => (
        <figure class="card">
          <img src={p.photo} alt={p.alt} loading="lazy" />
          <figcaption>
            <h3>{p.title}</h3>
            {p.location && <p class="loc">{p.location}</p>}
            {p.description && <p>{p.description}</p>}
          </figcaption>
        </figure>
      ))}
    </div>
  </div>
</section>
<style>
  .portfolio { padding: var(--space-5) 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); }
  .card { margin: 0; }
  .card img { border-radius: var(--radius-md); aspect-ratio: 4/3; object-fit: cover; }
  h3 { margin: var(--space-1) 0 0; }
  .loc { color: var(--color-muted); font-size: 0.9rem; margin: 0; }
</style>
```

- [ ] **Step 6: `PricingTable.astro`**

```astro
---
export interface Package { name: string; price: string; unit?: string; includes: string[]; cta_text: string; cta_href: string; }
export interface Props { packages: Package[]; }
const { packages } = Astro.props;
---
<section class="pricing" aria-label="Pricing">
  <div class="container">
    <div class="grid">
      {packages.map((p) => (
        <article class="tier">
          <h3>{p.name}</h3>
          <p class="price">{p.price}<span>{p.unit ? ` / ${p.unit}` : ''}</span></p>
          <ul>{p.includes.map((line) => <li>{line}</li>)}</ul>
          <a href={p.cta_href} class="cta">{p.cta_text}</a>
        </article>
      ))}
    </div>
  </div>
</section>
<style>
  .pricing { padding: var(--space-5) 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); }
  .tier { padding: var(--space-3); background: var(--color-surface); border-radius: var(--radius-md); display: flex; flex-direction: column; }
  .price { font-family: var(--font-display); font-size: 2rem; margin: var(--space-1) 0; }
  .price span { font-size: 1rem; color: var(--color-muted); }
  ul { flex: 1; list-style: none; padding: 0; margin: 0 0 var(--space-2); }
  ul li { padding: 0.25rem 0; }
  .cta { display: inline-block; text-align: center; background: var(--color-accent); color: white; padding: 0.75rem 1.25rem; border-radius: var(--radius-sm); text-decoration: none; }
</style>
```

- [ ] **Step 7: Commit**

```bash
git add astro-template/src/components/
git commit -m "feat(astro-template): section components (Hero, ServiceGrid, ServiceAreaGrid, Testimonials, FAQ, CTA, PortfolioGrid, PricingTable)"
```

---

## Task 7: GHL CRM widget components

**Files:** Create `src/components/GHLChatWidget.astro`, `GHLFormEmbed.astro`, `GHLReviewsWidget.astro`, `CallTrackingScript.astro`.

- [ ] **Step 1: `GHLChatWidget.astro`**

```astro
---
import { getEntry } from 'astro:content';
const site = (await getEntry('site', 'config')).data as any;
const id = site.crm?.chat_widget_id;
---
{id && (
  <script is:inline src={`https://widgets.leadconnectorhq.com/loader.js`} data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js" data-widget-id={id} async></script>
)}
```

- [ ] **Step 2: `GHLFormEmbed.astro`**

```astro
---
export interface Props { embed_url: string; title: string; height?: number; }
const { embed_url, title, height = 620 } = Astro.props;
---
<div class="ghl-form-wrap">
  <iframe
    src={embed_url}
    title={title}
    style={`width:100%;height:${height}px;border:0;`}
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</div>
<style>
  .ghl-form-wrap { max-width: 720px; margin: 0 auto; }
</style>
```

- [ ] **Step 3: `GHLReviewsWidget.astro`**

```astro
---
import { getEntry } from 'astro:content';
const site = (await getEntry('site', 'config')).data as any;
const id = site.crm?.reviews_widget_id;
---
{id && (
  <div class="reviews">
    <div class="container">
      <h2>Client reviews</h2>
      <div id="ghl-reviews-widget" data-widget-id={id}></div>
      <script is:inline src={`https://widgets.leadconnectorhq.com/reviews-widget/loader.js`} async></script>
    </div>
  </div>
)}
<style>
  .reviews { padding: var(--space-5) 0; }
</style>
```

- [ ] **Step 4: `CallTrackingScript.astro`**

```astro
---
import { getEntry } from 'astro:content';
const site = (await getEntry('site', 'config')).data as any;
const script = site.crm?.call_tracking_script;
---
{script && <script is:inline set:html={script} />}
```

Notes:
- The exact loader URL and embed shape vary by GHL revision. The per-site config allows overriding via `chat_widget_id` (used to build the loader URL) or a full-fat `call_tracking_script` HTML string for services that need one.
- Adjust the loader URL when you standardize on a specific GHL widget version.

- [ ] **Step 5: Commit**

```bash
git add astro-template/src/components/GHLChatWidget.astro astro-template/src/components/GHLFormEmbed.astro astro-template/src/components/GHLReviewsWidget.astro astro-template/src/components/CallTrackingScript.astro
git commit -m "feat(astro-template): GHL CRM widget components (chat, form embed, reviews, call tracking)"
```

---

## Task 8: Compliance components (CookieConsent for GDPR)

**Files:** Create `src/components/CookieConsent.astro`.

- [ ] **Step 1: `CookieConsent.astro`**

```astro
<div id="cookie-consent" hidden>
  <div class="cc-inner container">
    <p>We use cookies to improve your experience and analyze site traffic. Read our <a href="/privacy">Privacy Policy</a>.</p>
    <div class="cc-actions">
      <button type="button" data-cc="accept">Accept</button>
      <button type="button" data-cc="reject">Reject non-essential</button>
    </div>
  </div>
</div>
<style>
  #cookie-consent { position: fixed; bottom: 0; left: 0; right: 0; background: var(--color-bg); border-top: 1px solid var(--color-surface); padding: var(--space-2) 0; z-index: 100; box-shadow: 0 -4px 14px rgba(0,0,0,0.08); }
  .cc-inner { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); flex-wrap: wrap; }
  .cc-actions { display: flex; gap: var(--space-1); }
  .cc-actions button { padding: 0.5rem 1rem; border: 1px solid var(--color-text); background: transparent; cursor: pointer; border-radius: var(--radius-sm); }
  .cc-actions button[data-cc="accept"] { background: var(--color-accent); color: white; border-color: var(--color-accent); }
</style>
<script is:inline>
  (function () {
    var el = document.getElementById('cookie-consent');
    if (!el) return;
    var stored = localStorage.getItem('cc');
    if (!stored) el.hidden = false;
    el.addEventListener('click', function (e) {
      var t = e.target.closest('[data-cc]');
      if (!t) return;
      localStorage.setItem('cc', t.getAttribute('data-cc'));
      el.hidden = true;
      window.dispatchEvent(new CustomEvent('cookie-consent', { detail: { choice: t.getAttribute('data-cc') } }));
    });
  })();
</script>
```

Notes:
- Bare-bones GDPR banner (accept / reject non-essential). Analytics/ads scripts should listen for `cookie-consent` event with `detail.choice === 'accept'` before loading. For MVP, no analytics ships by default.

- [ ] **Step 2: Commit**

```bash
git add astro-template/src/components/CookieConsent.astro
git commit -m "feat(astro-template): GDPR cookie consent banner with accept/reject controls"
```

---

## Task 9: Home page

**Files:** Create `src/pages/index.astro`.

- [ ] **Step 1: `index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getEntry } from 'astro:content';
import Hero from '../components/Hero.astro';
import TrustBadges from '../components/TrustBadges.astro';
import ServiceGrid from '../components/ServiceGrid.astro';
import ServiceAreaGrid from '../components/ServiceAreaGrid.astro';
import Testimonials from '../components/Testimonials.astro';
import FAQ from '../components/FAQ.astro';
import CTA from '../components/CTA.astro';
import ContactBlock from '../components/ContactBlock.astro';
import GHLReviewsWidget from '../components/GHLReviewsWidget.astro';
import GHLChatWidget from '../components/GHLChatWidget.astro';

const site = (await getEntry('site', 'config')).data as any;
const home = (await getEntry('site', 'home')).data as any;

const faqJsonLd = home.faqs && home.faqs.length > 0 ? {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: home.faqs.map((f: any) => ({
    '@type': 'Question', name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
} : null;
---
<BaseLayout
  title={`${site.business_name} — ${site.tagline}`}
  description={home.hero.subheadline || site.tagline}
  jsonLd={faqJsonLd ? [faqJsonLd] : undefined}
>
  <Hero {...home.hero} />
  <TrustBadges />
  <ServiceGrid />
  <ServiceAreaGrid />
  {home.testimonials.length > 0 && <Testimonials items={home.testimonials} />}
  <GHLReviewsWidget />
  <CTA headline="Ready to get started?" />
  {home.faqs.length > 0 && <FAQ items={home.faqs} />}
  <ContactBlock />
  <GHLChatWidget />
</BaseLayout>
```

- [ ] **Step 2: Placeholder `src/content/site/home.json`**

```json
{
  "kind": "home",
  "hero": {
    "eyebrow": "Denver, CO",
    "headline": "Local roofing you can count on",
    "subheadline": "Fast, honest, licensed work for Denver homeowners.",
    "cta_text": "Get a free estimate",
    "cta_href": "/contact"
  },
  "testimonials": [],
  "faqs": []
}
```

- [ ] **Step 3: Build**

```bash
cd astro-template && npm run build
```

- [ ] **Step 4: Verify JSON-LD present**

```bash
grep -c '"@type":"LocalBusiness"' dist/index.html
```

Expected: `1`.

- [ ] **Step 5: Commit**

```bash
git add astro-template/src/pages/index.astro astro-template/src/content/site/home.json
git commit -m "feat(astro-template): home page composing hero, trust, services, areas, testimonials, reviews, CTA, FAQ, contact, chat"
```

---

## Task 10: Services parent index + service subpage

**Files:** Create `src/pages/services/index.astro`, `src/pages/services/[slug].astro`. Add `src/content/services/roof-repair.md` fixture.

- [ ] **Step 1: `services/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getEntry, getCollection } from 'astro:content';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import CTA from '../../components/CTA.astro';
import ContactBlock from '../../components/ContactBlock.astro';

const site = (await getEntry('site', 'config')).data as any;
const services = (await getCollection('services')).sort((a, b) => a.data.order - b.data.order).slice(0, 5);
const crumbs = [{ name: 'Home', href: '/' }, { name: 'Services', href: '/services' }];
---
<BaseLayout
  title={`Services — ${site.business_name}`}
  description={`Full range of services from ${site.business_name} across ${site.address.city}, ${site.address.state}.`}
  breadcrumbs={crumbs}
>
  <div class="container"><Breadcrumbs items={crumbs} /></div>
  <section class="services-index">
    <div class="container">
      <h1>Services</h1>
      <div class="grid">
        {services.map((s) => (
          <a href={`/services/${s.data.slug}`} class="card">
            <h2>{s.data.title}</h2>
            <p>{s.data.short_description}</p>
          </a>
        ))}
      </div>
    </div>
  </section>
  <CTA headline="Not sure what you need?" />
  <ContactBlock />
</BaseLayout>
<style>
  .services-index { padding: var(--space-4) 0 var(--space-5); }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); }
  .card { display: block; padding: var(--space-3); background: var(--color-surface); border-radius: var(--radius-md); text-decoration: none; }
  .card h2 { margin: 0 0 var(--space-1); font-size: 1.25rem; }
  .card p { color: var(--color-muted); margin: 0; }
</style>
```

- [ ] **Step 2: `services/[slug].astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection, getEntry } from 'astro:content';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import CTA from '../../components/CTA.astro';
import FAQ from '../../components/FAQ.astro';
import ContactBlock from '../../components/ContactBlock.astro';
import GHLFormEmbed from '../../components/GHLFormEmbed.astro';

export async function getStaticPaths() {
  const services = await getCollection('services');
  return services.slice(0, 5).map((s) => ({ params: { slug: s.data.slug }, props: { service: s } }));
}

const { service } = Astro.props;
const site = (await getEntry('site', 'config')).data as any;
const { Content } = await service.render();
const title = `${service.data.title} in ${site.address.city}, ${site.address.state} | ${site.business_name}`;
const description = service.data.short_description;
const crumbs = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: service.data.title, href: `/services/${service.data.slug}` },
];
const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: service.data.title,
  provider: { '@type': 'LocalBusiness', name: site.business_name },
  areaServed: { '@type': 'AdministrativeArea', name: `${site.address.city}, ${site.address.state}` },
  description: service.data.long_description,
};
const faqLd = service.data.faqs.length > 0 ? {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: service.data.faqs.map((f: any) => ({
    '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
} : null;
---
<BaseLayout
  title={title}
  description={description}
  breadcrumbs={crumbs}
  jsonLd={faqLd ? [serviceLd, faqLd] : [serviceLd]}
>
  <div class="container"><Breadcrumbs items={crumbs} /></div>
  <article class="service">
    <div class="container">
      <h1>{service.data.title} in {site.address.city}, {site.address.state}</h1>
      <p class="lede">{service.data.short_description}</p>
      {service.data.hero_photo && <img src={service.data.hero_photo} alt={`${service.data.title} — ${site.business_name}`} loading="lazy" />}
      <Content />
    </div>
  </article>
  {site.crm?.estimate_form_embed && (
    <section class="form-embed"><div class="container"><h2>Request an estimate</h2>
      <GHLFormEmbed embed_url={site.crm.estimate_form_embed} title={`${service.data.title} estimate request`} />
    </div></section>
  )}
  <CTA headline={`Need ${service.data.title.toLowerCase()}? Call today.`} />
  {service.data.faqs.length > 0 && <FAQ items={service.data.faqs} />}
  <ContactBlock />
</BaseLayout>
<style>
  .service { padding: var(--space-4) 0 var(--space-5); }
  .lede { font-size: 1.15rem; color: var(--color-muted); max-width: 45rem; }
  img { border-radius: var(--radius-md); margin: var(--space-3) 0; }
  .form-embed { padding: var(--space-5) 0; background: var(--color-surface); }
</style>
```

- [ ] **Step 3: Fixture `src/content/services/roof-repair.md`**

```markdown
---
title: Roof Repair
slug: roof-repair
short_description: Fast, reliable roof repair for storm damage, leaks, and wear.
long_description: We diagnose, quote, and repair — usually within 48 hours.
order: 1
faqs:
  - q: How fast can you come out?
    a: Same-day inspections in most cases.
---

We handle asphalt, tile, and metal roof repair across the region. Every job is signed off by a licensed roofer.
```

- [ ] **Step 4: Build and verify**

```bash
cd astro-template && npm run build && ls dist/services/
```

Expected: `dist/services/index.html`, `dist/services/roof-repair/index.html`.

- [ ] **Step 5: Commit**

```bash
git add astro-template/src/pages/services astro-template/src/content/services/roof-repair.md
git commit -m "feat(astro-template): services parent index + [slug] subpage with Service + FAQPage JSON-LD, breadcrumbs, form embed slot (max 5 subpages)"
```

---

## Task 11: Service Areas parent index + area subpage

**Files:** Create `src/pages/service-areas/index.astro`, `src/pages/service-areas/[area].astro`. Fixture `src/content/service_areas/denver.md`.

- [ ] **Step 1: `service-areas/index.astro`** — mirror structure of `services/index.astro`, listing areas (max 5), with breadcrumbs `Home > Service Areas`.

- [ ] **Step 2: `service-areas/[area].astro`** — as sketched in v1 plan Task 7, plus:
  - Include `getStaticPaths` slice to 5.
  - Add breadcrumbs `Home > Service Areas > {Area}`.
  - Add `Service` JSON-LD keyed to the area (with `areaServed` = the area name).
  - Cross-link to matrix pages for each service (already in v1 plan).

- [ ] **Step 3: Fixture `denver.md`** — same as v1 plan Task 7 Step 2 with `order: 1` added.

- [ ] **Step 4: Build and verify** — `dist/service-areas/index.html` + `dist/service-areas/denver/index.html`.

- [ ] **Step 5: Commit**

```bash
git add astro-template/src/pages/service-areas astro-template/src/content/service_areas/denver.md
git commit -m "feat(astro-template): service-areas parent index + [area] subpage with breadcrumbs, Service JSON-LD, matrix cross-links (max 5 subpages)"
```

---

## Task 12: Programmatic SEO matrix (service × area)

**Files:** Create `src/pages/service-areas/[area]/[service].astro`.

- [ ] **Step 1:** Same shape as v1 plan Task 8, with these additions:
  - Slice both collections to 5 in `getStaticPaths` (max 5 × 5 = 25 matrix pages).
  - Add breadcrumbs `Home > Service Areas > {Area} > {Service}`.
  - Emit a `Service` JSON-LD with `areaServed` = the specific area.
  - Title: `{Service} in {Area}, {State} | {Business Name}`.
  - Description: 155 chars, includes service short description and area name.

- [ ] **Step 2:** Build; count matrix pages.

```bash
find dist/service-areas -mindepth 3 -name 'index.html' | wc -l
```

Expected: 1 (1 area × 1 service fixture).

- [ ] **Step 3: Commit**

```bash
git add astro-template/src/pages/service-areas/[area]/[service].astro
git commit -m "feat(astro-template): programmatic SEO matrix (service × area) with per-pair Service JSON-LD, breadcrumbs, geo title/description (max 25 pages)"
```

---

## Task 13: Static pages — About, Contact, Our Work, Pricing

**Files:** Create `src/pages/about.astro`, `contact.astro`, `our-work.astro`, `pricing.astro`. Placeholder JSON content in `src/content/site/`.

- [ ] **Step 1: `about.astro`** — Reads `site/about`, composes hero-lite + story + CTA + ContactBlock.

- [ ] **Step 2: `contact.astro`** — Composes ContactBlock + `GHLFormEmbed` bound to `site.crm.contact_form_embed`, plus `GHLChatWidget`. Add breadcrumbs `Home > Contact`.

- [ ] **Step 3: `our-work.astro`** — Reads `site/our-work`, composes `PortfolioGrid` + CTA + ContactBlock. Breadcrumbs.

- [ ] **Step 4: `pricing.astro`** — Reads `site/pricing`, composes `PricingTable` + CTA + FAQ (if present) + ContactBlock. Breadcrumbs.

- [ ] **Step 5:** Placeholder JSON files:

`src/content/site/about.json`:

```json
{ "kind": "about", "story": "Locally owned and operated." }
```

`src/content/site/our-work.json`:

```json
{ "kind": "our-work", "intro": "A sample of recent projects.", "projects": [] }
```

`src/content/site/pricing.json`:

```json
{ "kind": "pricing", "intro": "Straightforward pricing.", "packages": [] }
```

- [ ] **Step 6: Build and verify**

```bash
cd astro-template && npm run build && ls dist/about dist/contact dist/our-work dist/pricing
```

- [ ] **Step 7: Commit**

```bash
git add astro-template/src/pages astro-template/src/content/site
git commit -m "feat(astro-template): about, contact, our-work, pricing pages with breadcrumbs, content-collection data, GHL form + chat embeds where applicable"
```

---

## Task 14: Legal + accessibility pages (Privacy, Terms, Accessibility Statement)

**Files:** Create `src/pages/privacy.astro`, `terms.astro`, `accessibility.astro`. Fixtures under `src/content/legal/`.

- [ ] **Step 1: `src/content/legal/privacy.md`** — GDPR-compliant baseline:

```markdown
---
title: Privacy Policy
updated: 2026-07-22
---

## Who we are

{BUSINESS_NAME} ("we", "us", "our") operates this website ({SITE_URL}).

## What data we collect

- Contact information you submit via forms (name, email, phone, address)
- Cookies used for essential site functionality and, with your consent, analytics
- Automatically collected: IP address, browser type, pages visited (aggregated)

## How we use it

- To respond to inquiries and provide services
- To improve the site and understand traffic patterns
- To comply with legal obligations

We do not sell personal data. We share data only with service providers required to deliver our services (e.g. our CRM, our lead-generation partner) under confidentiality agreements.

## Your rights (EEA / UK / CCPA)

You have the right to access, correct, or delete your personal data. Contact us at {EMAIL} to exercise these rights.

## Cookies

We use essential cookies to operate the site. Analytics and marketing cookies load only if you accept them via the cookie banner.

## Data retention

We retain form submissions for 24 months unless a longer period is required by law or contract.

## Contact

{BUSINESS_NAME}, {ADDRESS}, {PHONE}, {EMAIL}

Last updated: {UPDATED}
```

- [ ] **Step 2: `src/content/legal/terms.md`** — baseline TOS (services rendered, payment, liability, governing law placeholder), tokens `{BUSINESS_NAME}`, `{ADDRESS}`, `{STATE}`, `{EMAIL}`, `{UPDATED}` to be substituted by site-generate skill.

- [ ] **Step 3: `src/content/legal/accessibility.md`** — WCAG 2.1 AA statement:

```markdown
---
title: Accessibility Statement
updated: 2026-07-22
---

## Our commitment

{BUSINESS_NAME} is committed to making our website accessible to people with disabilities. We aim to conform to WCAG 2.1 Level AA.

## What we do

- Semantic HTML and ARIA where appropriate
- Skip-to-content link, keyboard-navigable menus, visible focus indicators
- Text alternatives for images
- Sufficient color contrast (4.5:1 for body text)
- Respect for `prefers-reduced-motion`
- Responsive design for a range of assistive technologies

## Feedback

If you encounter an accessibility barrier, contact us at {EMAIL} or {PHONE}. We aim to respond within 5 business days.

Last updated: {UPDATED}
```

- [ ] **Step 4: `src/pages/privacy.astro`** — Reads `legal/privacy`, renders with Breadcrumbs `Home > Privacy`.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getEntry } from 'astro:content';
import Breadcrumbs from '../components/Breadcrumbs.astro';
const entry = await getEntry('legal', 'privacy');
const { Content } = await entry.render();
const site = (await getEntry('site', 'config')).data as any;
const crumbs = [{ name: 'Home', href: '/' }, { name: 'Privacy Policy', href: '/privacy' }];
---
<BaseLayout
  title={`${entry.data.title} — ${site.business_name}`}
  description={`Privacy Policy for ${site.business_name}.`}
  breadcrumbs={crumbs}
>
  <div class="container"><Breadcrumbs items={crumbs} /></div>
  <article class="legal container"><h1>{entry.data.title}</h1><Content /></article>
</BaseLayout>
<style>.legal { padding: var(--space-4) 0 var(--space-5); max-width: 800px; }</style>
```

- [ ] **Step 5: `src/pages/terms.astro`** — same shape, reads `legal/terms`.

- [ ] **Step 6: `src/pages/accessibility.astro`** — same shape, reads `legal/accessibility`.

- [ ] **Step 7: Build**

```bash
cd astro-template && npm run build && ls dist/privacy dist/terms dist/accessibility
```

- [ ] **Step 8: Commit**

```bash
git add astro-template/src/pages/privacy.astro astro-template/src/pages/terms.astro astro-template/src/pages/accessibility.astro astro-template/src/content/legal/
git commit -m "feat(astro-template): privacy, terms, accessibility pages with tokenized markdown (privacy/GDPR, TOS, WCAG 2.1 AA statement)"
```

---

## Task 15: A2P compliance — SMS opt-in form pattern

**Files:** Add note to `src/components/GHLFormEmbed.astro` and add an `SMSConsent.astro` snippet for pages that trigger SMS follow-up.

Since GHL-hosted forms handle their own opt-in checkbox UI, the primary A2P concern here is ensuring:

- `Contact` and `Estimate` form embeds in GHL are configured with an SMS opt-in checkbox with explicit consent language (this is a GHL config concern, not an Astro concern).
- Legal terms page includes an SMS terms section.
- A visible `SMSConsent.astro` component is available when a page has any form embed, spelling out consent language above the fold and linking to `/terms` and `/privacy`.

- [ ] **Step 1: `src/components/SMSConsent.astro`**

```astro
---
import { getEntry } from 'astro:content';
const site = (await getEntry('site', 'config')).data as any;
---
{site.compliance?.a2p && (
  <p class="sms-consent">
    By submitting, you agree to receive SMS/MMS messages from {site.business_name} at the phone number provided. Reply STOP to opt out.
    Msg & data rates may apply. See our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
  </p>
)}
<style>
  .sms-consent { font-size: 0.85rem; color: var(--color-muted); max-width: 720px; margin: var(--space-1) auto; }
</style>
```

- [ ] **Step 2:** In `contact.astro` and `services/[slug].astro`, render `<SMSConsent />` immediately before any `<GHLFormEmbed />`.

- [ ] **Step 3:** Add an "SMS Communications" section to the Terms of Service markdown template (`src/content/legal/terms.md`) with token substitution for business name and reply-STOP language.

- [ ] **Step 4: Commit**

```bash
git add astro-template/src/components/SMSConsent.astro astro-template/src/pages/contact.astro astro-template/src/pages/services astro-template/src/content/legal/terms.md
git commit -m "feat(astro-template): A2P SMS consent language above form embeds, terms addendum"
```

---

## Task 16: Reference libraries folder

**Files:** Create `reference-libraries/` with `README.md`, `default.json`, `roofing.json`, `concrete.json`.

- [ ] **Step 1: `reference-libraries/README.md`**

```markdown
# Reference Libraries

Curated per-vertical designer reference URLs the `design-reference` skill can pull from when no explicit URLs are provided for a given site.

## Adding a library

Create a new `{vertical}.json` file with this shape:

```json
{
  "vertical": "roofing",
  "references": [
    {
      "url": "https://example-roofer.com",
      "notes": "Type-driven layout, editorial section rhythm, brand palette limited to earth tones",
      "tags": ["editorial", "earth-tones", "large-type"]
    }
  ],
  "anti_patterns": [
    "gradient hero",
    "generic construction stock photo",
    "purple accents"
  ]
}
```

## Selecting a library

At `design-reference` invocation time, pass `--library {vertical}`. If unset and no explicit URLs are provided, `default.json` is used.
```

- [ ] **Step 2: `reference-libraries/default.json`**

```json
{ "vertical": "default", "references": [], "anti_patterns": [] }
```

- [ ] **Step 3: `reference-libraries/roofing.json`** — empty starter with vertical + placeholders. User will fill this in with curated URLs later.

```json
{
  "vertical": "roofing",
  "references": [],
  "anti_patterns": [
    "gradient hero",
    "handshake stock photo",
    "purple / indigo accents",
    "generic diverse-team-in-hardhats stock photo"
  ]
}
```

- [ ] **Step 4: `reference-libraries/concrete.json`** — same structure, concrete-specific.

- [ ] **Step 5: Commit**

```bash
git add reference-libraries/
git commit -m "feat(reference-libraries): per-vertical curated design reference URL folder (default, roofing, concrete starters)"
```

---

## Task 17: New `design-reference` skill (dual-mode: explicit URLs OR library)

**Files:** Create `.agent/skills/design-reference/SKILL.md`.

- [ ] **Step 1: Skill markdown**

```markdown
---
name: design-reference
description: Produce a `design_reference.json` for a client site from either an explicit list of designer reference URLs OR a curated per-vertical reference library. Fights the LLM aesthetic by grounding the visual direction in real designed work.
trigger: "design-reference" or "reference URLs" or "design tokens"
---

## What This Skill Does

Reads reference URLs from one of two sources:

1. **Explicit URLs** — user provides 3-5 URLs and optional notes at invocation (e.g. via prompt).
2. **Library** — user passes `--library {vertical}` (e.g. `roofing`, `concrete`) and the skill reads `reference-libraries/{vertical}.json`.

For each URL, uses Firecrawl to scrape HTML/CSS + take a screenshot, then extracts:

- Palette (bg, surface, text, muted, accent) as hex
- Typography (font-display, font-body — Google Fonts names)
- Spacing scale (rem values)
- Radius scale (px)
- Section rhythm — ordered list of section-type identifiers observed
- Anti-patterns to avoid, merged from the library file and from the client site's `audit_results.json`

Outputs `sites/{slug}/design_reference.json`.

## Invocation

- `/design-reference {slug}` — interactive: prompts user for URLs and notes
- `/design-reference {slug} --library {vertical}` — pulls URLs from the library file
- `/design-reference {slug} --urls url1,url2,url3` — explicit URL list, non-interactive

## Cost

- Firecrawl scrape + screenshot per URL: ~$0.02
- Warn user before running: total = `URL count × $0.02`

## Anti-Pattern Detection

If `sites/{slug}/audit_results.json` shows the client's current site uses gradient heroes, glass morphism, or generic stock photography, the output MUST include those in `avoid: [...]` so `site-generate` steers away.

## Output Shape

```json
{
  "sources": {
    "mode": "library" | "urls",
    "library": "roofing" | null,
    "urls": ["https://..."]
  },
  "palette": { "bg": "#...", "surface": "#...", "text": "#...", "muted": "#...", "accent": "#..." },
  "typography": { "display": "EB Garamond", "body": "Inter" },
  "spacing": ["0.5rem", "1rem", "1.5rem", "2.5rem", "4rem"],
  "radius": { "sm": "4px", "md": "8px" },
  "section_rhythm": ["hero_split", "trust_strip", "services_stacked", "areas_map", "testimonials_wide", "cta_fullbleed", "faq", "contact"],
  "avoid": ["gradient hero", "purple accents", "handshake stock photo"]
}
```

## Rules

- Never write to the astro-template — only to `sites/{slug}/design_reference.json`
- Always show the user the synthesized tokens for confirmation before finalizing
```

- [ ] **Step 2: Commit**

```bash
git add .agent/skills/design-reference/SKILL.md
git commit -m "feat(agent): design-reference skill supporting explicit URLs OR per-vertical library"
```

---

## Task 18: New `site-generate` skill

**Files:** Create `.agent/skills/site-generate/SKILL.md`. Delete `.agent/skills/site-redesign/`.

- [ ] **Step 1: Delete old skill**

```bash
rm -rf .agent/skills/site-redesign
git add -A && git commit -m "chore(agent): remove site-redesign skill (replaced by site-generate)"
```

- [ ] **Step 2: `site-generate/SKILL.md`**

Full skill markdown covering:

- **Inputs** — reads `sites/{slug}/business_profile.json` (req), `local_research.json` (req), `design_reference.json` (req), `scraped_content.json` (opt), `audit_results.json` (opt).
- **Process:**
  1. Copy `astro-template/` → `sites/{slug}/` (exclude `node_modules`, `dist`, `.astro`).
  2. Compute site URL (either provided or `https://{slug}.vercel.app` placeholder).
  3. Rewrite `astro.config.mjs` and `public/robots.txt` — replace `REPLACE_SITE_URL`.
  4. Write `src/content/site/config.json` from business profile (business_name, phone, phone_display, address, geo, hours, social, licensed/insured/bonded flags, years_in_business, rating, review_count, compliance defaults enabled, crm block with GHL IDs from config source).
  5. Write `src/content/site/home.json` — hero from top copy angle, testimonials from Google reviews, FAQs from local research pain points.
  6. Write `src/content/site/about.json` from scraped about content (or generated from category + copy angles if no site).
  7. Write `src/content/site/our-work.json` — projects from scraped photos + captions.
  8. Write `src/content/site/pricing.json` — packages from scraped pricing or a category-default template.
  9. Write `src/content/services/*.md` — max 5 services, real ones from scrape first, then category-defaults to fill.
  10. Write `src/content/service_areas/*.md` — max 5 areas from Maps profile city + neighborhoods + Reddit-mentioned nearby areas.
  11. Substitute tokens in `src/content/legal/{privacy,terms,accessibility}.md` (`{BUSINESS_NAME}`, `{ADDRESS}`, `{PHONE}`, `{EMAIL}`, `{SITE_URL}`, `{STATE}`, `{UPDATED}`).
  12. Write `src/styles/tokens.css` from `design_reference.json` palette + typography + spacing + radius. Add Google Fonts `<link>` snippet in BaseLayout via a `src/content/site/fonts.txt` or by editing the tokens.css `@import url('https://fonts.googleapis.com/css2?...')` block.
  13. Append row to `sites/build-log.md`.
- **Anti-patterns block** — same as the top-of-plan anti-patterns list, enforced during generation.
- **Rules** — real content only; NAP consistency across config, header, footer; A2P/GDPR/ADA flags default true; GHL IDs left null if user hasn't provided them (widgets self-hide).
- **Build log format** — includes Vercel URL (filled in by deploy step) and page count.

- [ ] **Step 3: Commit**

```bash
git add .agent/skills/site-generate/SKILL.md
git commit -m "feat(agent): site-generate skill scaffolding an Astro project per client with content collections, tokens, GHL config, legal-page token substitution, and anti-pattern enforcement"
```

---

## Task 19: Rewrite `vercel-deploy` skill (build → deploy → domains add → rewrite → redeploy)

**Files:** Rewrite `.agent/skills/vercel-deploy/SKILL.md`.

- [ ] **Step 1:** New skill body specifies:

**Inputs:**

- `sites/{slug}/` must be a full Astro project.
- Optional `domain` arg (e.g. `--domain=roofers.example.com`). If unset, the skill deploys to the default Vercel domain only and skips the `domains add` + rewrite.

**Process:**

1. Local build gate:

   ```bash
   cd sites/{slug} && npm install && npm run build
   ```

   Stop and surface errors if build fails.

2. First deploy:

   ```bash
   cd sites/{slug} && vercel --prod --yes
   ```

   Capture the returned URL (`{project}.vercel.app`).

3. If a `domain` was passed:

   ```bash
   cd sites/{slug} && vercel domains add {domain}
   ```

   Show the DNS record instructions returned by Vercel to the user.

4. Determine final `site_url`:
   - If `domain` was passed, use `https://{domain}`.
   - Otherwise use the returned `*.vercel.app` URL.

5. Rewrite `sites/{slug}/astro.config.mjs`:

   ```js
   // Replace the site: line to reflect the final URL
   site: 'https://REAL_DOMAIN',
   ```

6. Rewrite `sites/{slug}/public/robots.txt`:

   ```
   Sitemap: https://REAL_DOMAIN/sitemap-index.xml
   ```

7. Rewrite `sites/{slug}/src/content/site/config.json` field `site_url` to the final URL.

8. Redeploy so canonicals, JSON-LD, and sitemap reference the final URL:

   ```bash
   cd sites/{slug} && npm run build && vercel --prod --yes
   ```

9. Update `sites/build-log.md` row with the final URL and page count from `dist/`.

10. Print summary table: business, slug, final URL, page count, GHL widget IDs status, compliance flag status.

**Guardrails:**

- Ask before running `vercel domains add` — this is a destructive-ish action (attaches domain, may fail if used elsewhere).
- If Vercel CLI isn't logged in, stop and instruct the user to `vercel login`.
- Never `--force`-attach domains.

- [ ] **Step 2: Commit**

```bash
git add .agent/skills/vercel-deploy/SKILL.md
git commit -m "feat(agent): vercel-deploy runs build gate, deploys, adds domain (if provided), rewrites site URL in config/robots/tokens, redeploys"
```

---

## Task 20: Update `CLAUDE.md` and workflow

**Files:** Modify `CLAUDE.md`, `.agent/workflows/website-builder.md`.

- [ ] **Step 1: `CLAUDE.md` — replace skills table**

New rows (keep find-business, scrape-content, local-research, site-audit, short-link as-is):

```markdown
| `design-reference` | `/design-reference` | Produce design_reference.json from explicit URLs OR a vertical library | ~$0.02 per URL (Firecrawl) |
| `site-generate` | `/site-generate` | Scaffold Astro project per client, populate collections + tokens + GHL config + legal | Free |
| `vercel-deploy` | `/vercel-deploy` | Build, deploy, add domain, rewrite site URL, redeploy | Free |
```

- [ ] **Step 2:** Update Key Behaviors section:

- One Astro project per site (`sites/{slug}/` = full Astro project, not a single HTML)
- All content in content collections; no inline HTML generation
- All pages inherit BaseLayout SEO (JSON-LD LocalBusiness + BreadcrumbList; per-page Service/FAQPage as applicable)
- Compliance flags (ADA/GDPR/A2P) default true; each has a matching UI/legal-content commitment
- GHL widget IDs left null if unset — widgets self-hide

- [ ] **Step 3:** Update File Conventions:

```markdown
- `sites/{slug}/business_profile.json` — Maps data
- `sites/{slug}/scraped_content.json` — website content (optional)
- `sites/{slug}/local_research.json` — Reddit research
- `sites/{slug}/audit_results.json` — screenshot + assessment (optional)
- `sites/{slug}/design_reference.json` — reference-URL-derived tokens
- `sites/{slug}/` (Astro project) — src/content/, src/styles/tokens.css, astro.config.mjs, etc.
- `screenshots/{slug}.png` — old-site screenshot
- `sites/build-log.md`
- `reference-libraries/{vertical}.json` — curated reference URLs per vertical
```

- [ ] **Step 4:** Update `.agent/workflows/website-builder.md` pipeline order:

```markdown
1. find-business
2. scrape-content
3. local-research
4. site-audit
5. design-reference   ← NEW
6. site-generate      ← replaces site-redesign
7. vercel-deploy      ← rewritten (build gate + domains add + rewrite + redeploy)
8. short-link (optional)
```

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md .agent/workflows/website-builder.md
git commit -m "docs(agent): update CLAUDE.md and workflow — new skills table, key behaviors, file conventions, pipeline order"
```

---

## Task 21: Smoke test end-to-end

**Files:** Manual — validate pipeline against `dennison-roofing` fixture.

- [ ] **Step 1: Copy fixture data**

```bash
mkdir -p sites/dennison-roofing
cp -R "/Users/marcellusm/Claude Projects/website-builder-kit/sites/dennison-roofing/"{business_profile,local_research,audit_results,scraped_content}.json sites/dennison-roofing/ 2>/dev/null || true
```

- [ ] **Step 2: Hand-write minimal `design_reference.json`** to unblock end-to-end validation:

```bash
cat > sites/dennison-roofing/design_reference.json <<'EOF'
{
  "sources": { "mode": "urls", "urls": [] },
  "palette": { "bg": "#faf7f2", "surface": "#efe9df", "text": "#1a1a1a", "muted": "#6b6156", "accent": "#a63a1e" },
  "typography": { "display": "Fraunces", "body": "Inter" },
  "spacing": ["0.5rem", "1rem", "1.5rem", "2.5rem", "4rem"],
  "radius": { "sm": "4px", "md": "8px" },
  "section_rhythm": ["hero_split", "trust_strip", "services_stacked", "areas_grid", "testimonials_wide", "cta_fullbleed", "faq", "contact"],
  "avoid": ["gradient hero", "purple accents", "handshake stock photo"]
}
EOF
```

- [ ] **Step 3: Run `/site-generate dennison-roofing`**

Expected: `sites/dennison-roofing/` becomes a full Astro project.

- [ ] **Step 4: Build**

```bash
cd sites/dennison-roofing && npm install && npm run build
find dist -name 'index.html' | wc -l
```

Expected page count (with 5 services × 5 areas): 1 home + 1 about + 1 contact + 1 our-work + 1 pricing + 1 privacy + 1 terms + 1 accessibility + 1 services index + 5 service subpages + 1 service-areas index + 5 area subpages + 25 matrix pages = **44 pages**.

- [ ] **Step 5: SEO sanity checks**

```bash
# JSON-LD present on home
grep -c '"@type":"LocalBusiness"' dist/index.html
# Breadcrumb JSON-LD on a subpage
grep -c '"@type":"BreadcrumbList"' dist/services/index.html
# Sitemap has matrix routes
grep -c '/service-areas/' dist/sitemap-0.xml
# Cookie consent scaffold present
grep -c 'cookie-consent' dist/index.html
```

- [ ] **Step 6: Visual spot-check**

```bash
cd sites/dennison-roofing && npm run preview
```

Open in browser. Confirm nested dropdowns work, breadcrumbs render, footer legal links present, cookie banner appears on first visit, GHL widgets self-hide when IDs absent.

- [ ] **Step 7: Deploy (behind explicit user approval)**

```bash
cd sites/dennison-roofing && vercel --prod --yes
```

Optionally: user provides a real domain, agent runs `vercel domains add` and rewrites → redeploys.

- [ ] **Step 8: Commit results**

```bash
cd "/Users/marcellusm/Claude Projects/mla-agents/ai-website-builder"
git add sites/build-log.md
git commit -m "test(agent): end-to-end smoke test — dennison-roofing fixture builds 44-page Astro site with SEO/compliance/GHL slots"
```

---

## Self-Review Notes

- **Sitemap coverage:** Home ✓, Our Work ✓, Pricing ✓, Contact ✓, Privacy ✓, Terms ✓, Accessibility ✓, About ✓, Services parent + 5 subpages ✓, Service Areas parent + 5 subpages ✓, service × area matrix ✓.
- **Compliance:** ADA — semantic HTML, skip-nav, focus styles, ARIA, alt text, reduced-motion, WCAG statement page ✓. GDPR — cookie banner, privacy page, retention terms ✓. A2P — SMS consent language above forms, terms addendum ✓.
- **CRM integration:** GHL chat widget ✓, form/survey embed ✓, call tracking script slot ✓, reviews widget ✓, all conditional on IDs in config so no dangling embeds.
- **Local SEO:** Baseline covered in Task 4 (BaseLayout) — `LocalBusiness` + `BreadcrumbList` JSON-LD, canonical, OG, Twitter Card, robots, sitemap. Extended in Tasks 9-12 with `Service`, `FAQPage`, `AggregateRating`. NAP consistency in Header/Footer/ContactBlock. Geo-specific title/H1/meta on services, areas, matrix.
- **Deploy flow:** Vercel default + optional `vercel domains add` + URL rewrite + redeploy ensures canonicals reference final domain.
- **Reference libraries:** `reference-libraries/{default,roofing,concrete}.json` scaffolded; user fills in curated URLs later. `design-reference` supports both explicit URLs and library selection.
- **Placeholder scan:** No TBDs remain.
- **Type consistency:** `crm.*`, `compliance.*`, `address.*` field names used consistently across schema, layouts, components, and skill inputs. `slug`/`name`/`title` field names match between content collections and page routing.

---

## Open questions confirmed

1. Vercel deploy target ✓ (confirmed)
2. Vercel domains add automation ✓ (baked into vercel-deploy Task 19)
3. Both reference modes ✓ (explicit URLs + libraries in Task 16-17)
4. Execution model: sub-agent driven ✓ (superpowers:subagent-driven-development next)

## Notes for execution

- The current directory is not a dedicated worktree; execution runs in-place in `mla-agents/ai-website-builder/`. If you want isolation, run `git worktree add` before starting.
- The GHL widget loader URLs in Task 7 are placeholder shapes matching the current LeadConnector pattern. If your specific GHL revision uses different loader URLs, adjust the component after the first end-to-end smoke test — this is a one-line-per-component change.
- The A2P consent language (Task 15) is a general baseline. If your carrier registration requires exact wording, update `SMSConsent.astro` to match.
