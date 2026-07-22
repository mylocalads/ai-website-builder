---
name: vercel-deploy
description: Deploy generated sites in the sites/ folder to Vercel using the CLI. Captures live URLs and logs them to the build log.
trigger: "vercel-deploy" or "deploy" or "deploy site"
---

# vercel-deploy

## What This Skill Does

Deploys sites in `sites/` to Vercel. Each site gets its own Vercel project and live URL. All URLs are logged to `sites/build-log.md`.

## How to Invoke

- `/vercel-deploy` — deploy all sites in `sites/` that have an `index.html`
- `/vercel-deploy joes-plumbing` — deploy a single site by slug

## Prerequisites

- Vercel CLI must be installed: `npm install -g vercel`
- Local: `vercel login` to authenticate
- Remote/SSH: add `VERCEL_TOKEN` to `.env`
- Free Vercel Hobby plan supports unlimited static projects

## What the Agent Does

### 1. Find sites to deploy

Look for subfolders in `sites/` that contain an `index.html`. Skip folders without one. If a specific slug was given, deploy only that one.

### 2. Deploy each site

```bash
vercel deploy --yes --prod sites/{slug}
```

If `VERCEL_TOKEN` is set in `.env`:

```bash
vercel deploy --yes --prod --token {VERCEL_TOKEN} sites/{slug}
```

### 3. Capture the URL

The deploy command outputs the live URL. Capture it — typically `https://{slug}.vercel.app`.

### 4. Wait between deploys

Always wait 10 seconds between deploying each site. Vercel rate-limits rapid CLI deploys.

### 5. Update the build log

Find the existing row for this business in `sites/build-log.md` (added by site-redesign) and fill in the Vercel URL column. If no row exists, append one.

Build log format:

| Business | Slug | Palette | Font | Layout | Theme | Vercel URL | Date |
|----------|------|---------|------|--------|-------|------------|------|

### 6. Print summary

After all deploys, print a final summary table:

| Business | Old Site | Audit Summary | Copy Angles | Vercel URL |
|----------|----------|---------------|-------------|------------|
| Joe's Plumbing | joesplumbing.com | Outdated layout, no CTA | "No surprise bills", 24/7 | https://joes-plumbing.vercel.app |

Pull "Old Site" from business_profile.json website field.
Pull "Audit Summary" from audit_results.json assessment field.
Pull "Copy Angles" from local_research.json copy_angles (first 2, shortened).

## Deployed URL Pattern

`https://{slug}.vercel.app`

## Timing

- Single site: ~10 seconds
- Multiple sites: ~30 seconds each (with rate-limit delay)

## Cost

Free. Vercel Hobby plan. Each site is a single HTML file (~10-15 KB).
