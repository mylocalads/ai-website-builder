---
name: vercel-deploy
description: Deploy an Astro project from sites/{slug}/ to Vercel. Runs local build as a fail-fast gate, deploys to Vercel, confirms the deployment is publicly viewable, optionally attaches the client's custom domain via `vercel domains add`, rewrites the site URL in astro.config / robots.txt / site config.json, and redeploys so canonicals + JSON-LD + sitemap reference the final domain.
trigger: "vercel-deploy" or "deploy" or "publish site"
---

## What This Skill Does

Takes a scaffolded Astro project at `sites/{slug}/` (produced by `site-generate`), builds it locally, deploys to Vercel, and (optionally) attaches a custom domain — then rewrites the site URL and redeploys so all SEO metadata references the final domain.

## Inputs

- `slug` — matches `sites/{slug}/` (Astro project directory)
- Optional `--domain={custom-domain}` — attaches this domain via `vercel domains add`. If unset, the site is still publicly viewable at its `*.vercel.app` URL, because protection is off for client projects (Step 4).
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

### 4. Make the deployment publicly viewable — every build, not optional

The client portal shows this site to the client under **Web → Website** /
**Web → Funnels**, inside an iframe. A deployment behind Vercel's login wall renders as a
blank frame there and a sign-in page if they click through, so every build must end with a
URL the client can actually open. That URL is reported as `stagingUrl` on
`POST /api/builds/{id}/complete`.

**Turn deployment protection OFF for client site projects**, and rely on the host-scoped
`X-Robots-Tag: noindex` the template ships (see §Deployment Protection). The `*.vercel.app`
URL then serves publicly, and `staging_url` is simply the deploy URL from Step 3.

```bash
cd sites/{slug}
# Confirm it actually serves to an anonymous visitor. 200 is the requirement;
# 401 means protection is still on and the client would hit a login wall.
curl -s -o /dev/null -w '%{http_code}\n' "$interim_url"
```

**A 401 here is a failure, not a warning.** Do not report success, and do not hand that URL
to the portal.

Set `staging_url = $interim_url`.

**Branded preview URLs (`{slug}.preview.mylocalads.co`) are PARKED, not abandoned.**
They need a DNS record created per client, and `mylocalads.co` DNS is currently
Squarespace-managed with no API. The full plan, the prerequisite, and the two approaches
already tested and rejected are in `docs/parked-preview-domain.md`. Read that before
proposing anything involving the preview subdomain — a wildcard and an NS delegation have
both been tried against the live account and neither works.

### 5. Attach custom domain (only if `--domain` provided)

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

### 6. Rewrite the site URL

Rewrite three files inside `sites/{slug}/`:

- `astro.config.mjs` — replace the `site:` value with `final_url`
- `public/robots.txt` — replace `REPLACE_SITE_URL` (or the previous interim URL) with `final_url`
- `src/content/site/config.json` — set `site_url` to `final_url`

### 7. Redeploy

```bash
cd sites/{slug} && npm run build && vercel --prod --yes
```

Confirm the returned URL matches `final_url` (for custom domain) or matches `interim_url` (default).

### 8. Update `sites/build-log.md`

Append/update the row for this slug with:
- Final URL
- Page count from `dist/`:
  ```bash
  find sites/{slug}/dist -name 'index.html' | wc -l
  ```

### 9. Commit and push the generated site

Without this, a site built on the runner droplet exists **only on that droplet's
disk**. It never reaches GitHub, never reaches the operator's Mac, and cannot be
edited or redeployed from anywhere else. If the droplet is rebuilt, the Astro
project is gone — the deployed site survives on Vercel, but the source that made
it does not.

Run from the **repo root**, not from `sites/{slug}`:

```bash
cd ~/ai-website-builder
pwd | grep -Eq "/ai-website-builder$" || { echo "not at repo root — aborting commit"; exit 1; }

# Land on top of anything the operator pushed while this build was running.
git pull --rebase -q origin master

# STAGE ONLY GENERATED OUTPUT.
# Never `git add -A`, never `git add .`. An unattended run must not be able to
# commit a change to a skill, a template or CLAUDE.md — that is a run quietly
# editing how every future run behaves, with nobody watching.
git add sites/{slug} sites/build-log.md

# Nothing to commit is a valid outcome — a relaunch may change no files.
git diff --cached --quiet && { echo "no generated changes to commit"; exit 0; }

# Refuse if anything outside sites/ crept into the index.
if git diff --cached --name-only | grep -qv '^sites/'; then
  echo "staged files outside sites/ — refusing to commit:"
  git diff --cached --name-only
  exit 1
fi

git commit -q -m "feat(sites): build {slug}

Generated unattended from the portal build queue.
Live: {final_url}"

git push -q origin master || {
  # Someone pushed between the pull and now. Rebase once and retry.
  git pull --rebase -q origin master && git push -q origin master
} || {
  echo "push failed after retry — the site is built and live, but its source is only on this box"
  exit 1
}

echo "pushed sites/{slug}"
```

**Never `git push --force`, and never resolve a conflict by discarding.** The
operator's own work is on the other side of that push.

`.env` is gitignored so credentials cannot be swept in — but the explicit staging
above is what makes that a guarantee rather than a hope.

**On an operator's own Mac this step is optional**: commit when you normally
would. It is mandatory on the droplet, which has no human to do it.

### 10. Print summary

Show the user:
- Business name, slug, final URL
- Page count
- GHL widget IDs status (chat / reviews / form embed URLs / call-tracking presence)
- Compliance flags status (ADA / GDPR / A2P — all default true)
- Code injection slots status (head / body_start / body_end presence)
- Reserved-slug warnings if `getStaticPaths` filtered any service_areas

## Deployment Protection (SSO) — OFF for client sites

Client site projects run with deployment protection **disabled**, so the `*.vercel.app`
URL is publicly viewable.

**This reverses the old rule, deliberately.** Projects used to ship
`ssoProtection: {deploymentType: "all_except_custom_domains"}`, and this section used to
say never to turn it off. The reason it existed was duplicate-content SEO — stopping the
vercel.app copy competing with the client's real site in search results.

That reason is now handled directly, and better, by a host-scoped header in the template's
`vercel.json`:

```json
{
  "headers": [{
    "source": "/(.*)",
    "has": [{ "type": "host", "value": ".*\\.vercel\\.app" }],
    "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }]
  }]
}
```

The header matches on the request host, so the vercel.app copy is never indexed and the
client's own domain never carries the header at all. There is no flag to clear at launch
and nothing to remember.

**Never add a static `<meta name="robots" content="noindex">` to the template.** It is
baked into the HTML, blind to which host served it, and would follow the site onto the
client's own domain and de-index the thing they paid for. The entire mechanism depends on
the header being host-scoped.

Protection stays ON for the client portal (`mla-starter-hub`) and for `mylocalads.co` —
this exemption is for generated client sites only, whose whole purpose is being looked at
by someone outside the team.

## Guardrails

- Ask before running `vercel domains add` for a CLIENT's domain (Step 5) — it attaches a domain to the Vercel project and may fail if the domain is already used elsewhere.
- **Never template, guess, or reuse a CNAME target.** Vercel issues a different one per project. A copied value produces a record that looks right, resolves somewhere else, and never verifies — and the symptom appears hours later with nothing pointing at the cause.
- **Never propose delegating `preview.mylocalads.co` to Vercel's nameservers, or a `*.preview` wildcard.** Both were tested against the live account and rejected — see `docs/parked-preview-domain.md`. Branded preview URLs are parked pending a DNS move off Squarespace, which has no API.
- Never report a build as succeeded while its URL returns 401. That means protection is still on and the client would hit a login wall where the portal expects a site.
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
