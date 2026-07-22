---
description: Website builder pipeline — 6 skills, run in sequence with dynamic ordering
---

# Website Builder Workflow

## Overview

Six skills. Run them in order based on input type. At the end you have a live Vercel URL showing the business's redesigned site — ready to use as proof-of-work in outreach.

## Dynamic Step Ordering

**When URL is provided (e.g., "build site for joesplumbing.com"):**
```
/scrape-content → /find-business → /local-research → /site-audit → /site-redesign → /vercel-deploy
```

**When business name is provided (e.g., "build site for Joe's Plumbing in Austin TX"):**
```
/find-business → /scrape-content → /local-research → /site-audit → /site-redesign → /vercel-deploy
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
3. Proceed with `/local-research` only
4. `/site-redesign` generates from Maps data + local research + Unsplash imagery

## Step Details

### Step 1 or 2 — `/find-business`
**Skill:** `.agent/skills/find-business/SKILL.md`
**Input:** business name + location (or business name extracted from scrape)
**Output:** `sites/{slug}/business_profile.json`

> **Pause:** Show business found — name, address, phone, email, rating, website. Ask user to confirm correct business.

### Step 1 or 2 — `/scrape-content`
**Skill:** `.agent/skills/scrape-content/SKILL.md`
**Input:** website URL (from user or from business_profile.json)
**Output:** `sites/{slug}/scraped_content.json`

> **Pause:** Show pages scraped, key content found, gaps. Ask: "Enough content? Proceed to local research?"

### Step 3 — `/local-research`
**Skill:** `.agent/skills/local-research/SKILL.md`
**Input:** category + location from business_profile.json
**Output:** `sites/{slug}/local_research.json`

> **Pause:** Show pain points, differentiators, copy angles. Ask: "Good angles? Proceed to audit?"

### Step 4 — `/site-audit`
**Skill:** `.agent/skills/site-audit/SKILL.md`
**Input:** website URL from business_profile.json
**Output:** `sites/{slug}/audit_results.json` + `screenshots/{slug}.png`

> **Pause:** Show screenshot and assessment. Ask: "Proceed to redesign?"

### Step 5 — `/site-redesign`
**Skill:** `.agent/skills/site-redesign/SKILL.md`
**Input:** All JSON files from previous steps
**Output:** `sites/{slug}/index.html` + `sites/build-log.md`

> **Pause:** Show design choices, explain preview. Ask: "Deploy this?"

### Step 6 — `/vercel-deploy`
**Skill:** `.agent/skills/vercel-deploy/SKILL.md`
**Input:** `sites/{slug}/` folder
**Output:** live Vercel URL → `sites/build-log.md`

> **Pause:** Show final summary with Vercel URL. Then ask: "Would you like to create a disappearing link? If so, how many days should it be visible?"

### Step 7 (optional) — `/short-link`
**Skill:** `.agent/skills/short-link/SKILL.md`
**Input:** Vercel URL from deploy step + user-specified expiration days
**Output:** Short URL on `website-service.mylocalads.co` domain

Only runs if the user opts in after the deploy step. Creates a time-limited link via Short.io that expires and redirects after the specified number of days.

> **Pause:** Show the short URL, expiration date, and post-expiry redirect.

## Final Output

| Business | Old Site | Audit Summary | Copy Angles | Vercel URL | Short Link | Expires |
|----------|----------|---------------|-------------|------------|------------|---------|

## Pause Behavior

**Default:** Pause after each step, show results, wait for approval.
**With `--auto`:** Skip all pauses, print summary at end only.
**Multiple businesses:** Each business goes through the full pipeline sequentially.
