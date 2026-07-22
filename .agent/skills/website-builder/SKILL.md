---
name: website-builder
description: Master orchestrator for the website builder pipeline. Takes a business name or URL, runs all 7 sub-skills in sequence, and produces a live Vercel URL with optional disappearing link. This is the wrapper skill — it loads operating rules and runs the pipeline.
trigger: "website-builder" or "build site for" or "run the pipeline" or "build website"
---

# Skill: Website Builder

This is the wrapper skill for the Website Builder pipeline. When triggered, load these two files for full context:

1. **`CLAUDE.md`** (kit root) — Operating rules: skills, cost rules, design theme, file conventions.
2. **`.agent/workflows/website-builder.md`** — Pipeline workflow: step ordering, pause behavior, final output format.

Read both before doing anything else.

## Sub-skills

| Step | Skill | What It Does | Cost |
|------|-------|-------------|------|
| 1 or 2 | `/find-business` | Google Maps lookup for business profile data | ~$0.004 |
| 1 or 2 | `/scrape-content` | Extract rich content from business website | Free |
| 3 | `/local-research` | Reddit pain point research + copy angles | Free |
| 4 | `/site-audit` | Screenshot + visual assessment | Free |
| 5 | `/site-redesign` | Generate premium HTML site | Free |
| 6 | `/vercel-deploy` | Deploy to Vercel | Free |
| 7 | `/short-link` | Create disappearing link via Short.io (optional) | Free |

## Input Parsing

Determine if the user provided a URL or business name:

**URL detection:** Input contains `http://`, `https://`, or looks like a domain (contains a dot followed by a TLD like `.com`, `.net`, `.org`, `.io`).
- Examples: `joesplumbing.com`, `https://joesplumbing.com`, `http://www.joesplumbing.com`
- → **URL-first flow**

**Business name:** Everything else.
- Examples: `Joe's Plumbing in Austin TX`, `ABC Electric Dallas`
- → **Name-first flow**

Extract business name and location from natural language. If location is ambiguous or missing, ask.

## URL-First Flow

```
1. /scrape-content (using provided URL, temporary slug from domain)
2. /find-business (using business name extracted from scraped content)
   → After find-business confirms real name: rename sites/{temp-slug}/ to sites/{canonical-slug}/
   → Update scraped_content.json slug field
3. /local-research
4. /site-audit
5. /site-redesign
6. /vercel-deploy
7. /short-link (optional — only if user opts in)
```

## Name-First Flow

```
1. /find-business (search Maps for the business)
2. /scrape-content (using website URL from business_profile.json)
3. /local-research
4. /site-audit
5. /site-redesign
6. /vercel-deploy
7. /short-link (optional — only if user opts in)
```

## No-Website Edge Case

If `/find-business` returns a business with no website URL:
1. Inform the user
2. Skip `/scrape-content` and `/site-audit`
3. Run `/local-research` → `/site-redesign` → `/vercel-deploy` → `/short-link` (optional)

## Pause Behavior

**Default (no flag):** Pause after each step:
1. After find-business → show business details, confirm correct
2. After scrape-content → show content summary, confirm enough
3. After local-research → show pain points + copy angles, confirm
4. After site-audit → show screenshot + assessment
5. After site-redesign → show design choices, explain preview
6. After vercel-deploy → show final summary table, then ask: "Would you like to create a disappearing link? If so, how many days should it be visible?"
7. After short-link → show short URL, expiration date, post-expiry redirect

**With `--auto`:** Skip all pauses. Run all steps back-to-back. Skip short-link (requires user input for days). Print final summary at end only.

## Batch Handling

If the user provides multiple businesses:
```
build sites for:
- Joe's Plumbing in Austin TX
- ABC Electric in Dallas TX
```

Process each business sequentially through the full pipeline. Pause between each complete pipeline run. Ask about disappearing links after each deploy.

## Final Summary

After the last deploy (and optional short-link), print:

| Business | Old Site | Audit Summary | Copy Angles | Vercel URL | Short Link | Expires |
|----------|----------|---------------|-------------|------------|------------|---------|
