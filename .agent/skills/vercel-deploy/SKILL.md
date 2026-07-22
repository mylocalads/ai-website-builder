---
name: vercel-deploy
description: Deploy an Astro project from sites/{slug}/ to Vercel. Runs local build as a fail-fast gate, deploys to Vercel, optionally attaches a custom domain via `vercel domains add`, rewrites the site URL in astro.config / robots.txt / site config.json, and redeploys so canonicals + JSON-LD + sitemap reference the final domain.
trigger: "vercel-deploy" or "deploy" or "publish site"
---

## What This Skill Does

Takes a scaffolded Astro project at `sites/{slug}/` (produced by `site-generate`), builds it locally, deploys to Vercel, and (optionally) attaches a custom domain — then rewrites the site URL and redeploys so all SEO metadata references the final domain.

## Inputs

- `slug` — matches `sites/{slug}/` (Astro project directory)
- Optional `--domain={custom-domain}` — attaches this domain via `vercel domains add`. If unset, deploys to the default `{project}.vercel.app` URL only.
- Requires Vercel CLI installed and logged in (`vercel login` prompt if needed).

## Process

### 1. Sanity check

Verify `sites/{slug}/astro.config.mjs` and `sites/{slug}/package.json` exist. If not, stop and instruct the user to run `site-generate` first.

### 2. Local build gate

```bash
cd sites/{slug} && npm install && npm run build
```

If build fails, stop and surface the error. Do NOT proceed to deploy a broken build. Common build failures include:
- Missing content files (schemas expect at least one service and one service area — check counts)
- Schema validation error in `src/content/site/config.json` (missing required fields)
- Reserved-slug collisions in `src/content/service_areas/*.md` (see `RESERVED_SLUGS` set in `src/pages/[area].astro`)

### 3. First deploy

```bash
cd sites/{slug} && vercel --prod --yes
```

Capture the returned URL (typically `{project}.vercel.app`). Store as `interim_url`.

### 4. Attach custom domain (only if `--domain` provided)

Ask the user for confirmation before running:

> "About to attach {domain} to the Vercel project. Vercel will provide DNS records you must set on your registrar (e.g. Namecheap, Cloudflare) for the domain to route correctly. Proceed?"

If confirmed:

```bash
cd sites/{slug} && vercel domains add {domain}
```

Show the DNS record instructions returned by Vercel to the user. Wait for the user to confirm DNS is set (or plan to set it later).

Store the final URL:
- If `--domain` was passed: `final_url = https://{domain}`
- Otherwise: `final_url = interim_url`

### 5. Rewrite the site URL

Rewrite three files inside `sites/{slug}/`:

- `astro.config.mjs` — replace the `site:` value with `final_url`
- `public/robots.txt` — replace `REPLACE_SITE_URL` (or the previous interim URL) with `final_url`
- `src/content/site/config.json` — set `site_url` to `final_url`

### 6. Redeploy

```bash
cd sites/{slug} && npm run build && vercel --prod --yes
```

Confirm the returned URL matches `final_url` (for custom domain) or matches `interim_url` (default).

### 7. Update `sites/build-log.md`

Append/update the row for this slug with:
- Final URL
- Page count from `dist/`:
  ```bash
  find sites/{slug}/dist -name 'index.html' | wc -l
  ```

### 8. Print summary

Show the user:
- Business name, slug, final URL
- Page count
- GHL widget IDs status (chat / reviews / form embed URLs / call-tracking presence)
- Compliance flags status (ADA / GDPR / A2P — all default true)
- Code injection slots status (head / body_start / body_end presence)
- Reserved-slug warnings if `getStaticPaths` filtered any service_areas

## Guardrails

- Ask before running `vercel domains add` — attaches a domain to the Vercel project and may fail if the domain is already used elsewhere.
- If the Vercel CLI isn't installed or logged in, stop and instruct the user to `npm install -g vercel && vercel login`.
- Never `--force`-attach domains.
- Never overwrite `astro.config.mjs` template — only `site:` line changes.
- Never touch `astro-template/` — only `sites/{slug}/`.

## Failure recovery

- **Build fails on first attempt:** most common cause is missing content in `src/content/site/config.json` or empty services/service_areas collections. Instruct user to run `site-generate` again with the missing data.
- **Vercel deploy fails auth:** run `vercel login`.
- **Domain add fails "domain already used":** confirm the user hasn't attached this domain to another Vercel project.
- **Redeploy shows old canonicals:** confirm astro.config.mjs `site:` was actually rewritten. Rebuild and verify `dist/index.html` head contains the new URL.
