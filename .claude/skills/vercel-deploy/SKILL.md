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

### 1. Sanity check + CWD lock

Verify `sites/{slug}/astro.config.mjs` and `sites/{slug}/package.json` exist. If not, stop and instruct the user to run `site-generate` first.

**CRITICAL — clean up stray `.vercel/` at the workspace root:**

```bash
# Vercel walks the CWD looking for a .vercel/project.json; a stray one at the workspace
# root will hijack the deploy and link the wrong project (the workspace root instead
# of sites/{slug}). This was the 2026-07 mylocalads.co bug — the root deploy shipped an
# empty framework: None deployment that 404'd on every route.
if [ -e ".vercel/project.json" ]; then
  echo "STRAY .vercel/ at workspace root — removing before deploy"
  rm -rf .vercel
fi
```

Then `cd sites/{slug}` and confirm the working directory is correct BEFORE every subsequent command in this skill:

```bash
cd sites/{slug}
pwd | grep -Eq "/sites/{slug}$" || { echo "CWD is not sites/{slug} — aborting"; exit 1; }
```

Never chain `cd sites/{slug} && ...` across separate shell invocations — each Bash tool call is a fresh subshell, and repeated `cd sites/{slug}` from within `sites/{slug}` will silently fail into `sites/{slug}/sites/{slug}`. Run one `cd` up-front and confirm `pwd` inside the same block.

### 2. Local build gate

From inside `sites/{slug}`:

```bash
npm install && npm run build
```

If build fails, stop and surface the error. Do NOT proceed to deploy a broken build. Common build failures include:
- Missing content files (schemas expect at least one service and one service area — check counts)
- Schema validation error in `src/content/site/config.json` (missing required fields)
- Reserved-slug collisions in `src/content/service_areas/*.md` (see `RESERVED_SLUGS` set in `src/pages/[area].astro`)

### 3. First deploy

From inside `sites/{slug}`:

```bash
npx vercel --prod --yes
```

Capture the returned URL (typically `{project}.vercel.app`). Store as `interim_url`.

**Immediately verify the deploy actually shipped the site** — a `READY` state does not guarantee the right project was deployed:

```bash
sleep 2
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$interim_url/")
if [ "$STATUS" != "200" ] && [ "$STATUS" != "401" ]; then
  echo "DEPLOY BROKEN — homepage returned $STATUS (expected 200 or 401 if SSO on)"
  exit 1
fi
# 401 is expected when Vercel SSO is on for the *.vercel.app URL (standard for MLA client
# projects — see §Deployment Protection below). 200 means SSO is off. Anything else — 404,
# 500, 502 — means the deploy is empty or the wrong directory shipped. Fail loudly, do NOT
# report success.

# Also sanity-check that .vercel/project.json landed inside sites/{slug}/ (not the workspace root):
[ -f "$(pwd)/.vercel/project.json" ] || { echo "vercel link did not land in sites/{slug}/ — investigate"; exit 1; }
```

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

## Deployment Protection (SSO) — leave as default

Every MLA client Vercel project has `ssoProtection: {deploymentType: "all_except_custom_domains"}` set by default. This means:

- The raw `*.vercel.app` URL is behind Vercel SSO (only logged-in team members can view).
- Any attached custom domain is public.

**This is the intended pattern.** Client sites are viewed through their real domain; the vercel.app URL is deliberately gated to avoid duplicate-content SEO issues and to keep in-progress work hidden.

**DO NOT disable SSO to "make the vercel.app URL public"** — it's not the way these are meant to be viewed. If the operator wants to see the site publicly without a custom domain, the answer is:

1. Preview locally: `cd sites/{slug} && npm run preview` (returns a localhost URL).
2. Or view the vercel.app URL logged into the Vercel dashboard (SSO passes the operator through automatically).
3. Or attach a custom domain (Step 4) — that URL is always public.

If the operator explicitly asks to disable SSO, confirm the ask ("this is a non-standard deviation from how every other MLA project is configured — proceed?") before flipping it.

## Guardrails

- Ask before running `vercel domains add` — attaches a domain to the Vercel project and may fail if the domain is already used elsewhere.
- If the Vercel CLI isn't installed or logged in, stop and instruct the user to `npm install -g vercel && vercel login`.
- Never `--force`-attach domains.
- Never overwrite `astro.config.mjs` template — only `site:` line changes.
- Never touch `astro-templates/` — only `sites/{slug}/`.
- Never chain `cd sites/{slug} && <cmd>` across separate Bash tool invocations — each is a fresh subshell, and the repeated `cd` silently fails when you're already inside `sites/{slug}`. Run one `cd` up-front per Bash block and confirm `pwd`.
- Never disable Vercel SSO on a project by default — see §Deployment Protection above.

## Failure recovery

- **Build fails on first attempt:** most common cause is missing content in `src/content/site/config.json` or empty services/service_areas collections. Instruct user to run `site-generate` again with the missing data.
- **Vercel deploy fails auth:** run `vercel login`.
- **Domain add fails "domain already used":** confirm the user hasn't attached this domain to another Vercel project.
- **Redeploy shows old canonicals:** confirm astro.config.mjs `site:` was actually rewritten. Rebuild and verify `dist/index.html` head contains the new URL.
- **Deploy returns 404 on every route:** the CWD hijack bug. Symptoms: `vercel --prod` succeeds, deployment API shows `readyState: READY`, but every URL 404s and the deployment metadata shows `framework: None`. Root cause: `.vercel/project.json` at the workspace root (parent of `sites/`) hijacked the link, so Vercel deployed the wrong directory. Recovery: `rm -rf ../../.vercel .vercel && cd sites/{slug} && npx vercel --prod --yes`, then run the post-deploy verification curl from Step 3.
