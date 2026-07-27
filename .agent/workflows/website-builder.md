---
description: Website builder pipeline — 9 skills, run in sequence with dynamic ordering
---

# Website Builder Workflow

## Overview

Nine skills. Run them in order. At the end you have a live Vercel URL showing the business's freshly-scaffolded Astro site — ready to use as proof-of-work in outreach.

## Pipeline Order

```
/intake-from-web → /find-business (called by intake-from-web) → /scrape-content (optional deeper pass) → /local-research → /site-audit → /design-reference → /site-generate → /vercel-deploy → /short-link (optional)
```

The operator can start with either a business name, a website URL, or both — `/intake-from-web` asks for whichever is available in step 1 and uses Google Business Profile as the source-of-truth confirmation step. GBP-listed website URL wins over an operator-provided URL by default (operator can override).

`/intake-from-web` invokes `/find-business` internally as its GBP confirmation step. Running `/find-business` again standalone is only necessary if intake-from-web was skipped.

`/scrape-content` is now optional. It runs when `/intake-from-web` hits a site that blocks Firecrawl and needs the Playwright fallback, or when the operator wants a deeper full-site content pass beyond what intake-from-web extracts.

## Slug Generation

`/intake-from-web` owns slug generation. On operator input:
- **Name provided:** canonical slug comes from the confirmed GBP result name.
- **URL provided (name inferred):** a temporary slug is built from the URL's domain; once GBP confirms, the slug is upgraded to canonical form and any partially-written `sites/{slug}/` directory is renamed.
- **Both provided:** GBP-derived canonical name wins for the slug.

Format: lowercase, hyphenated, special characters removed (`Joe's Plumbing` → `joes-plumbing`).

## No-Website Edge Case

If `/intake-from-web` (via GBP confirmation) returns a business with no listed website URL:
1. Inform the operator
2. Skip Firecrawl web + inner-page scrapes; keep GBP-derived data only (name, address, phone, hours, rating, social URLs listed on GBP)
3. Skip `/scrape-content` and `/site-audit`
4. Proceed with `/local-research` and `/design-reference` (falls back to the vertical reference library)
5. `/site-generate` scaffolds the Astro project from GBP data + local research + design tokens + Unsplash imagery
6. Flag to the operator that more paste-in intake fields will be needed than usual (services list, testimonials, team members are all missing without a website)

## Architectural Ground Rules

Every run must respect these amendments from `docs/plans/2026-07-22-astro-refactor.md`:

- **Fixed section order per page type (v2.2 amendment E)** — Home, Service, and Service-area pages ship a fixed section order. Do not randomize or reshuffle.
- **CRM widgets are paste-only (v2.1 amendment B)** — GHL chat/reviews/form/call-tracking snippets are supplied by the user via paste-in during `/site-generate`. Never synthesize loader URLs or IDs.
- **Universal code injection (v2.1 amendment C)** — Every site exposes `head` / `body_start` / `body_end` code-injection slots (per-site plus per-page overrides) for pixels, GTM, GHL number-swap, and similar third-party scripts.
- **Reference libraries** — Curated per-vertical reference URLs live under `reference-libraries/{vertical}.json` (`default`, `roofing`, `concrete`, …). `/design-reference` reads these when the user does not supply their own URLs. Entries carry an optional `role` field; `/design-reference` weighs `role: "primary"` first (currently `https://firefly-cd.vercel.app/` for both roofing and concrete), then `secondary`, then unclassified.
- **Client website is brand-only, never design DNA** — `/intake-from-web` extracts fonts, colors, logo URL, and business context text from the client's existing site. It NEVER extracts layout patterns, section rhythms, component styling, or screenshots-as-inspiration. The selected template is the sole source of truth for design and structure. `/site-audit` produces screenshots for OPERATOR reference only — never for design cloning.
- **Manual intake fallback** — the operator-facing questionnaire at `docs/client-intake.md` remains the reference for fields that `/intake-from-web` cannot scrape. Client-supplied paste-ins are narrow (see section 12 of the questionnaire): (1) GHL forms/surveys/calendar booking snippet, (2) GHL reviews widget snippet, (3) GHL Live Chat widget snippet, (4) tracking phone number, (5) brand color codes as a fallback for when `intake-from-web` couldn't auto-detect them from the client's site/logo. Operator-configured fields (Meta Pixel/GTM in `code_injection.head`, `marketing_city`/`marketing_state` overrides, custom Vercel domain) are set on the CRM/deploy side, not requested from the client.

## Step Details

### Step 1 — `/intake-from-web` (NEW, replaces manual questionnaire fill-in)
**Skill:** `.agent/skills/intake-from-web/SKILL.md`

Discovers and confirms the client business, then auto-populates as much of the intake as possible from public web presence. Cost-gated at every paid sub-step.

- **Input:** business name and/or website URL (accepts either or both — URL disambiguates when GBP returns multiple hits).
- **Process:** GBP lookup via `/find-business` → confirmation card → Firecrawl homepage → Firecrawl approved inner pages → Firecrawl approved social profiles → aggregate into `sites/{slug}/intake-scraped.json`.
- **Extracts:** brand tokens (fonts, colors, logo URL), business context (name, phone, address, hours, rating, services list, testimonials text, team members, credentials, social URLs), and hero photo candidates.
- **Does NOT extract:** layout patterns, section rhythm, component styles, or screenshots-as-design-DNA from the client's existing website. Enforced anti-pattern lock.
- **Output:** `sites/{slug}/intake-scraped.json` matching the schema in `astro-templates/{template}/src/content/config.ts`, plus a report table of which fields were populated vs which still need operator paste-in per `docs/client-intake.md`.
- **Cost:** ~$0.20–0.35 for the batch (GBP + Firecrawl + optional socials). Sub-step warnings on every paid call.


### Step 1 or 2 — `/find-business`
**Skill:** `.agent/skills/find-business/SKILL.md`
**Input:** business name + location (or business name extracted from scrape)
**Output:** `sites/{slug}/business_profile.json`

Finds the business on Google Maps via Apify and extracts canonical contact data (name, address, phone, email, hours, rating, website URL). This is the source of truth for slug and NAP.

> **Pause:** Show business found — name, address, phone, email, rating, website. Ask user to confirm correct business.

### Step 1 or 2 — `/scrape-content`
**Skill:** `.agent/skills/scrape-content/SKILL.md`
**Input:** website URL (from user or from business_profile.json)
**Output:** `sites/{slug}/scraped_content.json`

Playwright-first extraction of the business's existing site (services, testimonials, hero copy, photos). Firecrawl fallback if Playwright underperforms.

> **Pause:** Show pages scraped, key content found, gaps. Ask: "Enough content? Proceed to local research?"

### Step 3 — `/local-research`
**Skill:** `.agent/skills/local-research/SKILL.md`
**Input:** category + location from business_profile.json
**Output:** `sites/{slug}/local_research.json`

Reddit search for local pain points, differentiators, and copy angles specific to the vertical + metro.

> **Pause:** Show pain points, differentiators, copy angles. Ask: "Good angles? Proceed to audit?"

### Step 4 — `/site-audit`
**Skill:** `.agent/skills/site-audit/SKILL.md`
**Input:** website URL from business_profile.json
**Output:** `sites/{slug}/audit_results.json` + `screenshots/{slug}.png`

Screenshot and visual assessment of the existing site — strengths, weaknesses, load issues.

> **Pause:** Show screenshot and assessment. Ask: "Proceed to design reference?"

### Step 5 — `/design-reference` (NEW)
**Skill:** `.agent/skills/design-reference/SKILL.md`
**Input:** designer-supplied reference URLs OR `reference-libraries/{vertical}.json`
**Output:** `sites/{slug}/design_reference.json` (palette, typography, spacing, motion, anti-patterns)

Scrapes the reference URLs, synthesizes design tokens, and merges the anti-patterns list. Falls back to the vertical library (roofing / concrete / default) when the user has no specific references.

> **Pause:** Show synthesized tokens and merged anti-patterns. Ask: "Tokens look right? Proceed to generate?"

### Step 6 — `/site-generate` (replaces `/site-redesign`)
**Skill:** `.agent/skills/site-generate/SKILL.md`
**Input:** All JSON files from previous steps + user paste-in for CRM snippets & code-injection blocks
**Output:** Full Astro project at `sites/{slug}/` (src/content/, src/styles/tokens.css, src/pages/, astro.config.mjs, package.json, …) + `sites/build-log.md`

Scaffolds a per-client Astro project from the selected template under `astro-templates/`. Populates content collections from the JSON files. Writes `tokens.css` from `design_reference.json`. Prompts the user to paste GHL chat/reviews/form/call-tracking snippets and any pixel / GTM / number-swap injection blocks (paste-only — never synthesized). Enforces the fixed section order for Home, Service, and Service-area pages. Emits up to 5 services and up to 5 service-area subpages.

> **Pause:** Show the config summary — content counts, tokens, code-injection blocks, CRM widgets. Ask: "Build and deploy?"

### Step 7 — `/vercel-deploy` (Astro build + deploy)
**Skill:** `.agent/skills/vercel-deploy/SKILL.md`
**Input:** `sites/{slug}/` Astro project folder
**Output:** live Vercel URL, page count, optional custom domain, updated canonicals → `sites/build-log.md`

Runs `npm install` and `npm run build` locally to catch errors early. Deploys via `vercel --prod`. If a custom domain is supplied, attaches it, waits for propagation, and redeploys with the final canonical URLs baked in.

> **Pause:** Show local build result, deploy URL, page count, DNS instructions (if custom domain). Then ask: "Would you like to create a disappearing link? If so, how many days should it be visible?"

### Step 8 (optional) — `/short-link`
**Skill:** `.agent/skills/short-link/SKILL.md`
**Input:** Vercel URL from deploy step + user-specified expiration days
**Output:** Short URL on `website-service.mylocalads.co` domain

Only runs if the user opts in after the deploy step. Creates a time-limited link via Short.io that expires and redirects after the specified number of days.

> **Pause:** Show the short URL, expiration date, and post-expiry redirect.

## Final Output

| Business | Old Site | Audit Summary | Copy Angles | Design Tokens | Vercel URL | Custom Domain | Short Link | Expires |
|----------|----------|---------------|-------------|--------------|------------|---------------|------------|---------|

## Pause Behavior

**Default:** Pause after each step, show results, wait for approval.
**With `--auto`:** Skip all pauses, print summary at end only.
**Multiple businesses:** Each business goes through the full pipeline sequentially.
