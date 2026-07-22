---
description: Website builder pipeline — 8 skills, run in sequence with dynamic ordering
---

# Website Builder Workflow

## Overview

Eight skills. Run them in order based on input type. At the end you have a live Vercel URL showing the business's freshly-scaffolded Astro site — ready to use as proof-of-work in outreach.

## Dynamic Step Ordering

**When URL is provided (e.g., "build site for joesplumbing.com"):**
```
/scrape-content → /find-business → /local-research → /site-audit → /design-reference → /site-generate → /vercel-deploy → /short-link (optional)
```

**When business name is provided (e.g., "build site for Joe's Plumbing in Austin TX"):**
```
/find-business → /scrape-content → /local-research → /site-audit → /design-reference → /site-generate → /vercel-deploy → /short-link (optional)
```

Both find-business and scrape-content always run. Maps provides structured contact data; the scrape provides rich content.

## Slug Generation

- **Name provided:** `/find-business` generates the canonical slug from the confirmed Maps result name.
- **URL provided:** `/scrape-content` generates a temporary slug from the domain name. When `/find-business` runs next, the slug is updated to canonical form and the `sites/` directory is renamed.

Format: lowercase, hyphenated, special characters removed (`Joe's Plumbing` → `joes-plumbing`).

## No-Website Edge Case

If `/find-business` returns a business with no website URL:
1. Inform the user
2. Skip `/scrape-content` and `/site-audit`
3. Proceed with `/local-research` and `/design-reference` (falls back to the vertical reference library)
4. `/site-generate` scaffolds the Astro project from Maps data + local research + design tokens + Unsplash imagery

## Architectural Ground Rules

Every run must respect these amendments from `docs/plans/2026-07-22-astro-refactor.md`:

- **Fixed section order per page type (v2.2 amendment E)** — Home, Service, and Service-area pages ship a fixed section order. Do not randomize or reshuffle.
- **CRM widgets are paste-only (v2.1 amendment B)** — GHL chat/reviews/form/call-tracking snippets are supplied by the user via paste-in during `/site-generate`. Never synthesize loader URLs or IDs.
- **Universal code injection (v2.1 amendment C)** — Every site exposes `head` / `body_start` / `body_end` code-injection slots (per-site plus per-page overrides) for pixels, GTM, GHL number-swap, and similar third-party scripts.
- **Reference libraries** — Curated per-vertical reference URLs live under `reference-libraries/{vertical}.json` (`default`, `roofing`, `concrete`, …). `/design-reference` reads these when the user does not supply their own URLs.

## Step Details

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

Scaffolds a per-client Astro project from the shared `astro-template/`. Populates content collections from the JSON files. Writes `tokens.css` from `design_reference.json`. Prompts the user to paste GHL chat/reviews/form/call-tracking snippets and any pixel / GTM / number-swap injection blocks (paste-only — never synthesized). Enforces the fixed section order for Home, Service, and Service-area pages. Emits up to 5 services and up to 5 service-area subpages.

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
