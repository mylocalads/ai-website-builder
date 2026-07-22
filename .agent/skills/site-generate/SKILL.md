---
name: site-generate
description: Scaffold a per-client Astro project from the shared astro-template, populated with content collections, design tokens, GHL widget snippets, and code-injection blocks from pipeline data and user paste-in.
trigger: "site-generate" or "generate site" or "build site" or "scaffold site"
---

## What This Skill Does

Takes all researched data about a business (Maps profile, scraped content, Reddit research, site audit, design reference) and scaffolds a full Astro project under `sites/{slug}/` populated with:

- `src/content/site/config.json` — business identity, address, contact, credentials, ratings, social, compliance defaults, CRM snippets, code injection slots
- `src/content/site/home.json` — hero copy, testimonials, FAQs
- `src/content/site/about.json` — company story
- `src/content/site/our-work.json` — projects gallery
- `src/content/site/pricing.json` — pricing packages (if applicable)
- `src/content/services/*.md` — one file per service (max 5)
- `src/content/service_areas/*.md` — one file per city-state slug (max 5)
- `src/styles/tokens.css` — CSS custom properties from design_reference.json
- `astro.config.mjs` — with site URL substituted
- `public/robots.txt` — with site URL substituted

**Legal pages, header, footer, and section order are inherited from the shared astro-template unchanged** — no per-client body edits.

## Inputs

Reads from `sites/{slug}/`:

- `business_profile.json` (required) — Google Maps profile
- `local_research.json` (required) — Reddit copy angles, pain points, differentiators
- `design_reference.json` (required — produced by `design-reference` skill)
- `scraped_content.json` (optional — no-website edge case)
- `audit_results.json` (optional)

## Output

- `sites/{slug}/` — complete Astro project ready to build and deploy

## Process

### 1. Copy template

Copy `astro-template/` → `sites/{slug}/`, excluding `node_modules`, `dist`, `.astro`, `.vercel`.

### 2. Determine site URL

Prompt user for target domain. If they haven't attached one yet, use `https://{slug}.vercel.app` as a placeholder. Store this as `site_url` — the `vercel-deploy` skill will rewrite it to the real URL after deploy.

### 3. Substitute `REPLACE_SITE_URL`

Rewrite `sites/{slug}/astro.config.mjs` — replace `REPLACE_SITE_URL` with the determined URL.
Rewrite `sites/{slug}/public/robots.txt` — replace `REPLACE_SITE_URL` with the determined URL.

### 4. Prompt user for CRM snippets (v2.1 B — paste-only)

CRITICAL: the agent never synthesizes GHL loader URLs. It only asks and pastes verbatim.

Prompts (one at a time, allow blank for skip):

- "Paste the GHL chat widget snippet (or blank if none):"
- "Paste the GHL reviews widget snippet (or blank if none):"
- "Paste the GHL number-swap call-tracking script (or blank if none):"
- "Paste the contact form embed URL (or blank if none):"
- "Paste the estimate form embed URL (or blank if none):"
- "Call-tracking display number (or blank):"

Store as `site.crm.chat_widget_snippet`, `reviews_widget_snippet`, `call_tracking_snippet`, `contact_form_embed_url`, `estimate_form_embed_url`, `call_tracking_number`.

### 5. Prompt user for code injection snippets (v2.1 C)

- "Paste any HTML/scripts to inject in <head> site-wide (Meta Pixel, GTM, Google Ads gtag, meta verification, etc.) — or blank:"
- "Paste any HTML/scripts to inject immediately after <body> (GTM noscript, etc.) — or blank:"
- "Paste any HTML/scripts to inject before </body> (chat/analytics/GHL number swap) — or blank:"
- "Per-page overrides needed? (rare — press enter to skip)"

Store as `site.code_injection.head`, `body_start`, `body_end`, `per_page`.

### 6. Sanity-check code injection snippets

Before writing, do a lightweight parse of each pasted snippet:

- Count `<script>` vs `</script>` occurrences — reject if mismatched.
- Look for stray `</head>`, `</body>`, or `</html>` — warn.
- If parse fails, ask the user to fix the paste and retry.

### 7. Write `src/content/site/config.json`

Populate from `business_profile.json` + `local_research.json`:

- `kind`: "config"
- `business_name`, `legal_name` (from GBP)
- `tagline` — synthesize from category + top copy angle
- `phone`, `phone_display` (E.164 + display)
- `email` (from GBP or scraped contact)
- `address` (street, city, state, postal, country)
- `geo` (lat, lng from Maps)
- `hours` (record keyed by weekday from GBP)
- `site_url` (from step 2)
- `rating`, `review_count` (from GBP)
- `licensed`, `insured`, `bonded` (default true for home services)
- `years_in_business` (from GBP or scrape)
- `social` (map of platform → URL from GBP)
- `compliance`: `{ ada: true, gdpr: true, a2p: true }`
- `crm`: from step 4
- `code_injection`: from step 5

Skip `reference_urls` and `section_rhythm` — deprecated.

### 8. Populate v2.2 site config sections

Also on the same config.json (if user has provided data):

- `partners`: user provides partner badge list (name + logo_url + optional link_url)
- `why_choose_us`: synthesize from copy angles OR user provides (icon + title + description)
- `financing`: user opts in with headline/description/CTA
- `us_vs_them`: user opts in with headline/rows
- `gallery`: pull scraped project photos + Unsplash if needed

Prompt user for each block. Allow skips.

### 9. Write `src/content/site/home.json`

- `kind`: "home"
- `hero`: `{ eyebrow: "{city}, {state}", headline: from top copy angle, subheadline, cta_text, cta_href }`
- `testimonials`: from GBP reviews (top 5-10)
- `faqs`: from local_research pain points → Q&A

### 10. Write `src/content/site/about.json`

- `kind`: "about"
- `story`: from scraped About page OR synthesize from category + copy angles

### 11. Write `src/content/site/our-work.json`

- `kind`: "our-work"
- `intro`: short line about the work
- `projects`: from scraped photos + Unsplash

### 12. Write `src/content/site/pricing.json` (optional)

- `kind`: "pricing"
- `intro`, `packages` (from category defaults if unclear)

### 13. Write `src/content/services/{slug}.md` (max 5)

One file per service. Prefer real scraped services first; if fewer than 5, synthesize category defaults (e.g. roofer: Roof Replacement, Roof Repair, Storm Damage, Gutter Installation, Inspection).

Frontmatter shape (per Task 2 schema, minus `slug` field which Astro derives from filename):

```yaml
---
title: Roof Repair
short_description: ...
long_description: ...
faqs: [{q, a}]
hero_photo: https://...
order: 1
gallery: [{photo, alt}]
---
```

Filename `roof-repair.md` — the derived slug is `roof-repair`.

### 14. Write `src/content/service_areas/{city-state}.md` (max 5)

One file per area. Slug convention (per v2.2 amendment F): `{city-slug}-{state-lowercase}` (e.g. `denver-co`, `miami-fl`). Filename must match. Reserved slugs must NOT be used — see the `RESERVED_SLUGS` set in `src/pages/[area].astro`.

Frontmatter shape (per Task 6 schema, minus `slug`):

```yaml
---
name: Denver
state: CO
state_abbr: co
county: Denver County
neighborhoods: [Capitol Hill, Highland, Washington Park]
local_context: ...
order: 1
gallery: [{photo, alt}]
---
```

### 15. Write `src/styles/tokens.css`

From `design_reference.json` — replace the placeholder tokens.css with real values:

```css
:root {
  --color-bg: {palette.bg};
  --color-text: {palette.text};
  --color-muted: {palette.muted};
  --color-accent: {palette.accent};
  --color-surface: {palette.surface};
  --color-focus: #0057ff;
  --font-display: '{typography.display}', Georgia, serif;
  --font-body: '{typography.body}', system-ui, sans-serif;
  --radius-sm: {radius.sm};
  --radius-md: {radius.md};
  --space-1: {spacing[0]}; --space-2: {spacing[1]}; --space-3: {spacing[2]}; --space-4: {spacing[3]}; --space-5: {spacing[4]};
  --max-width: 1200px;
}
```

Also add Google Fonts `<link>` to BaseLayout.astro if the fonts differ from the placeholder — insert into head via `code_injection.head` as a safer alternative (avoids touching the template).

### 16. Append to `sites/build-log.md`

```markdown
| Business | Slug | Reference URLs | Pages | Vercel URL | Date |
|----------|------|----------------|-------|------------|------|
| {name} | {slug} | {urls} | (filled by deploy) | (filled by deploy) | YYYY-MM-DD |
```

## Anti-Patterns (enforced during content generation)

The generated content and tokens MUST NOT include:

- Gradient hero backgrounds (linear/radial/conic — none)
- Glass morphism
- Bento grid section layouts
- Purple / indigo / violet accent palettes unless the reference URL explicitly uses one
- Rows of outline icons (max 1 per section, only where semantically load-bearing)
- Stock hero photography of "professional shaking hands" or "diverse team pointing at laptop"
- "Trusted by 10,000+ customers" without a real number from business_profile.json
- Section headers reading "Stunning", "Beautiful", "Powerful", "Seamless", or "Effortless"

Section order is FIXED per page type (v2.2 amendment E) — do not randomize, do not add or remove sections. Financing and Us-vs-Them are conditional on `enabled` flags.

## Rules

- Real content only — no placeholder text in generated JSON/markdown
- Copy angles from `local_research.json` drive the hero headline and subheadline
- Testimonials use real GBP reviews first (from `business_profile.json.reviews`)
- If fewer than 5 services in scraped content, synthesize category defaults
- Service area slugs are `{city-slug}-{state-abbr-lowercase}` — required format for the flat `/[area]` route
- Never write raw HTML into the generated content — write Markdown / JSON that Astro content collections consume
- Never touch files outside `sites/{slug}/`
- Never modify `astro-template/` (structural changes go there through a separate workflow)

## Build log

Append to `sites/build-log.md`. If it doesn't exist yet, create it with a header row.
