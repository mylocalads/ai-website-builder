---
name: site-generate
description: Scaffold a per-client Astro project under sites/{slug}/ from the shared astro-template, driven by a completed docs/client-intake.md questionnaire plus any pipeline JSON (business_profile, local_research, scraped_content, audit_results, design_reference). Writes every content-collection file, tokens.css, and paste-in CRM + code-injection blocks; validates against the schema; runs the local build; hands off to vercel-deploy.
trigger: "site-generate" or "generate site" or "scaffold site" or "build site" or "spin up the site"
---

## What this skill does

Takes a filled-in `docs/client-intake.md` (the operator-facing questionnaire) plus optional pipeline data and produces a complete Astro project at `sites/{slug}/` that matches the reference site at https://firefly-cd.vercel.app one-for-one on shape and quality.

The canonical example of a completed site is `sites/firefly-cd/`. Every field this skill writes exists in that project — when in doubt about what a field should look like, read the equivalent file there. Do NOT invent example values that differ from Firefly.

This skill only writes files under `sites/{slug}/`. Page composition, layouts, components, and section order live in `astro-template/` and are inherited unchanged. Structural changes to the template are a separate workflow; never edit `astro-template/` from this skill.

## Inputs (must exist before running)

Required in the conversation / on disk:

- A completed `docs/client-intake.md` handed over by the operator (the source of truth for every content field).
- `sites/{slug}/business_profile.json` — Google Business Profile snapshot from `find-business`.
- `sites/{slug}/local_research.json` — Reddit / local copy angles.
- `sites/{slug}/design_reference.json` — required, produced by `design-reference`. Provides palette, typography, radius, and spacing tokens.

Optional:

- `sites/{slug}/scraped_content.json` — parsed existing-site content (no-website edge case: skip).
- `sites/{slug}/audit_results.json` — audit findings from an existing site.

If ANY required intake field is missing, stop and tell the operator to complete the intake — do NOT re-prompt the client interactively. This skill is not the intake channel.

## Cost rules

Free. The paid steps (Google Maps profile lookup, design-reference generation, any Firecrawl scrapes) already happened upstream. This skill only reads local files and writes local files.

## Anti-patterns (hard bans — enforced during content generation)

The generated content, tokens, and copy MUST NOT include any of the following. If the intake supplies one of these values, replace or ask the operator to revise:

- Gradient hero backgrounds (linear / radial / conic — none).
- Glass morphism / backdrop-blur panels.
- Bento grid section layouts.
- Purple / indigo / violet accent palettes unless the client's own brand is explicitly one of those.
- Rows of outline (Lucide-style) icons — max one icon per section, only where semantically load-bearing.
- Stock hero photography of "professionals shaking hands" or "diverse team pointing at a laptop / hardhat closeup."
- Copy like "Trusted by 10,000+ customers" without a real number sourced from `business_profile.json` or client intake.
- Section headers reading "Stunning", "Beautiful", "Powerful", "Seamless", or "Effortless".
- Randomized section order. Page composition is FIXED (hero → partner-badges → about → services → why-choose-us → testimonials → financing → us-vs-them → service-area-grid → gallery → faq → contact → CTA → footer) and lives in the template. Do not touch it.

Section rhythm and reference_urls fields on the site config are deprecated — leave as empty arrays.

## Reserved slugs (refuse conflicts)

The `[area].astro` route enforces these at build time. This skill must also refuse to write a `service_areas/*.md` (or a service markdown) whose derived slug is in this set:

`about`, `services`, `service-areas`, `contact`, `pricing`, `our-work`, `privacy`, `terms`, `accessibility`, `book`, `404`, `_astro`, `index`, `sitemap-index.xml`, `sitemap-0.xml`, `robots.txt`

Service-area slugs MUST match `^[a-z0-9-]+-[a-z]{2}$` (city-lowercase-hyphens + two-letter state, e.g. `spokane-wa`, `miami-fl`, `post-falls-id`). Reject anything else and ask the operator to fix the intake.

## Astro 5 content-layer gotcha (do not forget)

- Filenames derive the slug. Do NOT include a `slug:` field in service or service-area frontmatter — the schema does not allow it.
- Templates that iterate service or area collections must reference `entry.slug`, not `entry.data.slug`. This skill does not touch templates, but if a build fails with "cannot read data.slug", it is a template regression and belongs upstream in astro-template — flag it, don't patch it inside the client site.
- Write all markdown files with LF line endings.

---

## Process (execute in this order — do not reorder)

### 1. Confirm the slug

Derive the slug from the business name: lowercased, ASCII, hyphens only (e.g. "Firefly Contractors & Design" → `firefly-cd`). Confirm the slug with the operator before proceeding. Refuse if it collides with any reserved slug above.

### 2. Copy the template

Copy `astro-template/` → `sites/{slug}/`, excluding `node_modules`, `dist`, `.astro`, `.vercel`, and any lockfile that would pin to the template's install path. Do not modify the template in place under any circumstance.

### 3. Determine site URL and substitute placeholders

- If intake §16 supplies a custom domain, use `https://{that-domain}`.
- Otherwise use `https://{slug}.vercel.app`.

Then rewrite the two `REPLACE_SITE_URL` placeholders:

- `sites/{slug}/astro.config.mjs` — replaces `https://REPLACE_SITE_URL` in the `site:` field.
- `sites/{slug}/public/robots.txt` — replaces the same token in the `Sitemap:` URL.

`vercel-deploy` will overwrite these again once the real production URL is known.

### 4. Write `src/content/site/config.json` (kind: "config")

Populate from intake §1, §2, §8, §9, §10, §11, §12, §13, §15. Refer to `sites/firefly-cd/src/content/site/config.json` for the exact shape. Fields to set:

Identity + credentials:

- `kind: "config"`
- `business_name` (intake §1) — required.
- `legal_name` (intake §1) — optional, omit key if blank.
- `tagline` (intake §1) — required. Short, appears in the browser title.
- `phone` — E.164 (`+1` + 10 digits, no spaces). Derive from the intake phone.
- `phone_display` — intake phone as given.
- `email` — omit if blank.
- `address: { street, city, state, postal, country: "US" }` — required city + state; street / postal optional.
- `marketing_city` / `marketing_state` — set ONLY if intake §1 fills those in. When set, the service page hero eyebrow uses `marketing_city`; otherwise it falls back to `address.city`. Firefly is the reference example: office in Otis Orchards, marketing to Spokane.
- `hours` — one key per weekday the business is open. Omit keys for closed days (do not write `"closed"` strings — omit the key entirely, matching Firefly).
- `site_url` — from step 3.
- `rating`, `review_count` — from intake §1 or `business_profile.json`. Numbers, not strings. Omit if blank.
- `licensed`, `insured`, `bonded` — booleans from intake §1. Default `true` for home services if the intake box is checked; explicit `false` otherwise.
- `years_in_business` — number, omit if blank.
- `social` — object of `{ platform: url }` for facebook, instagram, youtube, google_maps, yelp. Only include keys the intake actually provides.

Branding + hero media:

- `logo_url` — required (intake §2).
- `default_hero_photo` — required backup; used when a page-level hero photo is unset.
- `default_hero_video` — optional; when set, hero video takes priority over photo (matches Firefly behavior).
- `about_photo` — optional (intake §3).
- `team_photo` — optional (intake §4 group photo, if any).
- `team_members: [{ name, role, photo, bio? }]` — up to 6 (intake §4). Empty array if none.

Deprecated (leave empty):

- `reference_urls: []`
- `section_rhythm: []`

Marketing blocks (all default off / empty when the intake is blank — no defaults invented):

- `partners: [{ name, logo_url, link_url? }]` — intake §11. Empty array to hide the badge strip.
- `why_choose_us: [{ icon, title, description }]` — intake §8, 4 tiles standard. `icon` is EITHER a URL for CSS-mask tinting (as in Firefly) OR an emoji as fallback. Empty array hides the section.
- `financing: { enabled, headline?, description?, cta_text?, cta_href?, logo_url? }` — intake §10. `enabled: false` when the intake box is unchecked.
- `us_vs_them: { enabled, headline?, us_label: "US", them_label: "THEM", us_photo?, them_photo?, rows: [{ label, us: bool, them: bool }] }` — intake §9. `enabled: false` to hide the whole section.
- `gallery: [{ title?, location?, photo, alt, description? }]` — intake §7, 6–8 entries. Renders on the home page and `/our-work`. Empty array is allowed but the section will render empty; recommend at least 4 entries.

Header / footer content is driven by `services_section` and address — no separate keys:

- `services_section: { eyebrow: "Our Services", heading_lead?, heading_rest?, subtitle? }` — controls the OurServices home section header. Defaults to `{ eyebrow: "Our Services" }` if the operator has not authored copy; when they have, populate `heading_lead` + `heading_rest` (see Firefly: "Full-service" + "home remodeling").

Compliance defaults (rarely overridden — only touch on intake §15 override):

- `compliance: { ada: true, gdpr: true, a2p: true }`.

CRM paste-only block (intake §12 — paste verbatim, DO NOT synthesize URLs, DO NOT reformat):

- `crm.provider: "ghl"`.
- `crm.calendar_embed_snippet` — full `<iframe>` + `<script>` block from GHL.
- `crm.chat_widget_snippet` — full `<script>` tag.
- `crm.reviews_widget_snippet` — full `<script>` + `<iframe>` block.
- `crm.contact_form_snippet` — full `<iframe>` + `<script>` block for the contact form.
- `crm.contact_form_embed_url` — bare iframe src URL for the general contact form (if the operator gave a URL instead of a full snippet).
- `crm.estimate_form_embed_url` — bare iframe src URL for the shorter estimate form on service pages.
- `crm.call_tracking_snippet` — GHL number-swap `<script>`.
- `crm.call_tracking_number` — the display number that number-swap replaces.

Omit any key the operator left blank. Do not write empty-string values.

Code injection (intake §13 — paste verbatim):

- `code_injection.head` — Meta Pixel base code, GTM, Google Ads gtag, meta verification tags, etc.
- `code_injection.body_start` — GTM noscript fallback, etc.
- `code_injection.body_end` — analytics beacons, additional chat scripts, etc.
- `code_injection.per_page` — record of `{ "path": { head?, body_start?, body_end? } }`. Empty object `{}` when no overrides.

Before writing, do a lightweight sanity check on each pasted snippet: count `<script>` vs `</script>` occurrences (reject if mismatched); warn on stray `</head>`, `</body>`, or `</html>`. If a paste fails, ask the operator to fix and retry — do NOT silently rewrite the paste.

### 5. Write `src/content/site/home.json` (kind: "home")

From intake §1, §3, §5 (hero copy), plus reviews from `business_profile.json` when available.

- `kind: "home"`.
- `hero`:
  - `eyebrow` — `"{marketing_city or address.city}, {marketing_state or address.state}"`. Matches Firefly's `"Spokane, WA"`.
  - `headline` — the SEO H1 for the primary service, or the tagline if no clear primary. Reference Firefly's headline for tone (real, benefit-driven, no fluff).
  - `subheadline` — one line summarizing what the business does (list top services separated by commas, ending "— done right by a local team." style — see Firefly).
  - `cta_text` — default `"Get Your Free Estimate!"` unless the operator supplies otherwise.
  - `cta_href` — default `/book`. Change ONLY if the site is not using the built-in booking page (rare).
  - `photo` — direct URL. Defaults to `config.default_hero_photo` if the operator didn't supply a home-specific hero.
- `testimonials: [{ name, location?, text, rating? }]` — 3–10 entries. Prefer real GBP reviews from `business_profile.json.reviews`; otherwise use intake-provided testimonials. Never fabricate reviewer names.
- `faqs: [{ q, a }]` — 5–8 general FAQs. Draw from intake §5 per-service FAQs or common categories: timelines, permits, warranty, insurance, financing, service area. Answers should be 2–4 sentences and specific to the business.

### 6. Write `src/content/site/about.json` (kind: "about")

- `kind: "about"`.
- `story` — 2–3 paragraphs from intake §3. Preserve the operator's phrasing; only fix obvious grammar. If the intake is blank AND `scraped_content.json` has an About page, use that; if neither exists, stop and ask the operator for copy.

### 7. Write `src/content/site/pricing.json` (kind: "pricing")

- `kind: "pricing"`.
- `intro` — one paragraph from intake §14. Firefly's intro is a good tone reference: transparent, anti-corporate, no upsell language.
- `packages: []` when the operator opts out of tiered pricing (this is the common case — matches Firefly). Otherwise `[{ name, price, unit?, includes: [], cta_text, cta_href }]`.
- `notes` — omit if blank.

### 8. Write `src/content/site/our-work.json` (kind: "our-work")

- `kind: "our-work"`.
- `intro` — one paragraph on craftsmanship / process. Firefly's intro references project count and "no cutting corners" — mirror that tone using intake facts, not generic filler.
- `projects: [{ title, location?, photo, alt, description? }]` — usually empty, since the site-wide `config.gallery` already provides the imagery this page renders. Only populate `projects` if the client wants a distinct project set here.

### 9. Write per-service markdowns under `src/content/services/{filename}.md` (max 6)

One file per service block in intake §5. Filename is the kebab-cased service name (e.g. `roofing.md`, `kitchen-remodels.md`, `bathroom-remodels.md`). The slug is derived from the filename — do NOT include a `slug:` frontmatter field.

Frontmatter fields (all required unless marked optional — see `sites/firefly-cd/src/content/services/roofing.md` for the reference shape):

```yaml
---
title: Roofing                              # intake §5 required
title_highlight: Roofing                    # optional; a word to visually highlight — currently unused post-redesign but still schema-valid
seo_h1: Roof Replacement & Repair Services in Spokane, WA   # intake §5 required
short_description: ...                      # intake §5 required — 1–2 sentences, used in meta description
long_description: ...                       # intake §5 required — 2–4 sentences with brand names / materials / warranty
order: 1                                    # 1-indexed, matches intake order
sub_services:                               # intake §5 required — 3–5 items
  - Roof Replacements
  - Roof Repairs
  - Roof Inspections
  - Shingle, Metal, Tile, and Flat Roofs
about_heading: ...                          # optional — override "About our {service} services" for awkward plurals (e.g. "About our kitchen remodeling services" for "Kitchen Remodels")
hero_photo: https://...                     # intake §5 required — direct URL
gallery:                                    # intake §5 required — 2–3 entries
  - photo: https://...
    alt: ...
faqs:                                       # intake §5 optional
  - q: ...
    a: ...
---

One-line body summary of the service (renders in the service tile subtitle). Keep it one sentence, present tense.
```

### 10. Write per-area markdowns under `src/content/service_areas/{slug}.md` (max 5)

One file per area block in intake §6. Filename MUST match the intake slug and pass `^[a-z0-9-]+-[a-z]{2}$`. Reject reserved-slug conflicts (see reserved slug list above).

Frontmatter fields (see `sites/firefly-cd/src/content/service_areas/spokane-wa.md`):

```yaml
---
name: Spokane                               # intake §6 required — display name
state: WA                                   # intake §6 required — 2-letter uppercase (schema stores as-is)
state_abbr: wa                              # 2-letter LOWERCASE — must match the filename suffix
county: Spokane County                      # optional; derive from GBP or intake context
neighborhoods: [South Hill, North Side]     # intake §6 optional
local_context: ...                          # intake §6 optional — 1–2 sentences on presence
hero_photo: https://...                     # intake §6 optional — top-of-page image
landmark_photo: https://...                 # intake §6 required — the recognizable-area image
landmark_alt: ...                           # optional but recommended; describes landmark_photo
order: 1                                    # 1-indexed, matches intake order
gallery: []                                 # optional; usually empty (uses site-wide gallery)
---

One-line body summary of what the business does in the area.
```

### 11. Write `src/styles/tokens.css`

Replace the placeholder tokens.css copied from the template with real values from `design_reference.json` and intake §2. Reference `sites/firefly-cd/src/styles/tokens.css` for the exact shape.

Contents:

```css
@import url('https://fonts.googleapis.com/css2?family={DISPLAY_FONT}:opsz,wght@9..144,400;9..144,600..900&family={BODY_FONT}:wght@400;500;700&display=swap');

:root {
  --color-bg: {palette.bg};                 /* usually #ffffff */
  --color-text: {palette.text};             /* near-black */
  --color-muted: {palette.muted};           /* mid-grey */
  --color-accent: {palette.accent};         /* client brand accent — NOT purple/indigo unless the brand is */
  --color-surface: {palette.surface};       /* light section fill */
  --color-focus: #0057ff;                   /* fixed */
  --font-display: '{typography.display}', Georgia, serif;
  --font-body: '{typography.body}', system-ui, sans-serif;
  --radius-sm: {radius.sm};                 /* e.g. 4px */
  --radius-md: {radius.md};                 /* e.g. 8px */
  --space-1: {spacing[0]}; --space-2: {spacing[1]}; --space-3: {spacing[2]}; --space-4: {spacing[3]}; --space-5: {spacing[4]};
  --max-width: 1200px;
}
```

Defaults if the intake left fonts blank: `Fraunces` display + `Inter` body. Defaults if palette is missing: match Firefly exactly.

Do NOT modify `BaseLayout.astro` from this skill to add font links. The `@import` at the top of tokens.css is the loading mechanism.

### 12. Validate content collections

Run `npx astro sync` inside `sites/{slug}/`. If it errors, the schema is unhappy — fix the offending file and retry. Common failures:

- Extra `slug:` field on a service or area (remove it).
- `state_abbr` uppercase (must be two lowercase letters).
- Bare `photo:` field without `alt:` in a gallery entry.
- Empty required string field (schema rejects `""`).

### 13. Local build gate

Run `npm install` (if node_modules not present) then `npm run build` inside `sites/{slug}/`. Must exit 0 and produce a `dist/` directory. If it fails, fix and retry — do NOT hand off a failing build to `vercel-deploy`.

### 14. Append to `sites/build-log.md`

Create the file with the header row if it doesn't exist yet. Append one line:

```markdown
| Business | Slug | Pages | Vercel URL | Date |
|----------|------|-------|------------|------|
| {business_name} | {slug} | {count from dist/} | (filled by vercel-deploy) | YYYY-MM-DD |
```

Page count = number of `index.html` files under `dist/` (approximate: home + about + services + pricing + our-work + contact + book + privacy + terms + accessibility + per-service pages + per-area pages).

### 15. Hand off to `vercel-deploy`

Print a handoff summary for the operator:

```
Site scaffold complete — sites/{slug}/

Business:   {business_name}
Slug:       {slug}
Site URL:   {site_url}  (placeholder — vercel-deploy will update)

Services populated:      {N}/6 — [list]
Service areas populated: {N}/5 — [list]
Home testimonials:       {N}
Home FAQs:               {N}
Site-wide gallery items: {N}

Paste-only fields left blank (section will self-hide):
  - {each unset optional CRM / marketing block}

Next: run vercel-deploy to push to Vercel and update site_url.
```

Do NOT run `vercel-deploy` yourself. The operator triggers that skill separately.

---

## Rules

- Real content only — no `Lorem ipsum`, no `"Coming soon"`, no placeholder counts. If a required field is missing, stop and ask.
- NAP (name, address, phone) must be consistent across `config.json`, structured data, footer text, and any pasted CRM snippets.
- Paste-only for CRM and code-injection: never synthesize a GHL loader URL, never edit a pasted snippet. If a paste is malformed, ask the operator to re-paste.
- Never touch files outside `sites/{slug}/`.
- Never modify `astro-template/` from this skill — template edits are a separate workflow.
- Write markdown files with LF line endings.
- Refuse to write reserved slugs.
- Do not re-prompt the operator for anything already covered in `docs/client-intake.md` — if the intake is incomplete, name the missing field and stop.

## What NOT to ask about

Everything in `docs/client-intake.md` §1–§16 is the operator's job to hand you. Do not run an interactive questionnaire. The only interactive prompts allowed in this skill are:

1. Confirming the derived slug.
2. Asking the operator to fix a specific malformed paste (identify which field).
3. Asking the operator to supply a specific missing required field (name it precisely).

## Handoff invariants

At the end of a successful run, the following must be true:

- `sites/{slug}/dist/` exists and `npm run build` exits 0.
- `sites/{slug}/src/content/site/config.json` validates as `kind: "config"`.
- Every service and area markdown validates against the schema.
- Every reserved slug is absent from `src/content/service_areas/`.
- `tokens.css` has real values, not template placeholders.
- `astro.config.mjs` and `public/robots.txt` no longer contain `REPLACE_SITE_URL`.
- `sites/build-log.md` has a fresh row for this client.

If any invariant fails, the skill has not completed — do not report success.
