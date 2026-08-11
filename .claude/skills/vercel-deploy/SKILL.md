---
name: vercel-deploy
description: Deploy an Astro project from sites/{slug}/ to Vercel. Runs local build as a fail-fast gate, deploys to Vercel, attaches the public preview host {slug}.preview.mylocalads.co (creating its CNAME in Google Cloud DNS), optionally attaches the client's custom domain via `vercel domains add`, rewrites the site URL in astro.config / robots.txt / site config.json, and redeploys so canonicals + JSON-LD + sitemap reference the final domain.
trigger: "vercel-deploy" or "deploy" or "publish site"
---

## What This Skill Does

Takes a scaffolded Astro project at `sites/{slug}/` (produced by `site-generate`), builds it locally, deploys to Vercel, and (optionally) attaches a custom domain — then rewrites the site URL and redeploys so all SEO metadata references the final domain.

## Inputs

- `slug` — matches `sites/{slug}/` (Astro project directory)
- Optional `--domain={custom-domain}` — attaches this domain via `vercel domains add`. If unset, the site is still publicly viewable at its preview host (Step 4); the `{project}.vercel.app` URL is SSO-gated and is never the answer.
- Optional `--kind=website|funnel` (default `website`) — decides the preview host: `{slug}.preview…` vs `{slug}-funnel.preview…`. The two are separate Vercel projects and must not collide.
- Requires Vercel CLI installed and logged in (`vercel login` prompt if needed).
- Requires `gcloud` authenticated against a service account with DNS write on the `mylocalads.co` Cloud DNS zone, and `MLA_DNS_ZONE` set to that zone's name. Step 4 cannot run without it.

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

### 4. Attach the preview host — every build, not optional

The `*.vercel.app` URL is SSO-gated (see §Deployment Protection), so it renders a login
wall to a client and a blank frame inside the client portal's preview iframe. Every build
therefore gets a public preview host on a domain MLA controls. This is what the portal
shows under **Web → Website** / **Web → Funnels**, and what is reported back as
`stagingUrl` on `POST /api/builds/{id}/complete`.

```
website → {slug}.preview.mylocalads.co
funnel  → {slug}-funnel.preview.mylocalads.co
```

The two surfaces are separate Vercel projects and must not request the same host — the
second attach is rejected, and that surface ends up with no public URL at all.

**`preview.mylocalads.co` is not a delegated zone, and cannot be made one.** Vercel
refuses to hold a subdomain as a zone of its own:

```
$ vercel domains add preview.mylocalads.co
{ "reason": "project_required_for_subdomain",
  "message": "Only apex domains can be added without a project." }
```

So the DNS record is created directly in Google Cloud DNS, where `mylocalads.co` is
authoritative. Do not re-propose NS delegation or a wildcard: a wildcard routes to a
single project, and every client site is its own.

```bash
cd sites/{slug}
PREVIEW_HOST="{slug}.preview.mylocalads.co"   # {slug}-funnel.preview.mylocalads.co for funnels

vercel domains add "$PREVIEW_HOST"
```

Vercel replies with the record it requires. **Read the target out of that reply.** It is
per PROJECT — `client.mylocalads.co` points at `6be47abb7ef38542.vercel-dns-017.com` — so
a templated, guessed, or copied-from-another-site value silently never verifies, and the
failure surfaces hours later as "still misconfigured" with nothing pointing at the cause.

Then write it into Cloud DNS. Idempotent on purpose: a rebuild, or the relaunch that fires
when a client connects their own domain, runs this again against a record that exists.

```bash
ZONE="${MLA_DNS_ZONE:?set MLA_DNS_ZONE to the Cloud DNS zone name holding mylocalads.co}"
TARGET="<the value Vercel just returned>."    # trailing dot required

if gcloud dns record-sets describe "$PREVIEW_HOST." --zone="$ZONE" --type=CNAME >/dev/null 2>&1; then
  gcloud dns record-sets update "$PREVIEW_HOST." --zone="$ZONE" --type=CNAME --ttl=300 --rrdatas="$TARGET"
else
  gcloud dns record-sets create "$PREVIEW_HOST." --zone="$ZONE" --type=CNAME --ttl=300 --rrdatas="$TARGET"
fi
```

Verify before moving on — resolution first, then whether it actually serves:

```bash
dig +short CNAME "$PREVIEW_HOST"                                   # expect $TARGET
curl -s -o /dev/null -w '%{http_code}\n' "https://$PREVIEW_HOST"   # expect 200, NOT 401
```

**A 401 here means the host did not attach** and you are still being served the SSO-gated
deployment. Do not report success, and do not hand that URL to the portal — the client
would be shown a login wall.

Set `staging_url = https://$PREVIEW_HOST`.

Requires a GCP service account with DNS write on that zone (`roles/dns.admin`, scoped to
the `mylocalads.co` zone). Without it this step cannot run unattended, and a build with no
preview host has nothing a client can be shown.

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

### 9. Print summary

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

1. **Send them the preview host from Step 4** — `{slug}.preview.mylocalads.co`. It is a custom domain, so it is public by the same rule, and it is what the client portal already shows them. This is the answer in almost every case, and it is why Step 4 is not optional.
2. Preview locally: `cd sites/{slug} && npm run preview` (returns a localhost URL).
3. Or view the vercel.app URL logged into the Vercel dashboard (SSO passes the operator through automatically).
4. Or attach the client's own custom domain (Step 5) — that URL is always public too.

The preview host is deliberately kept out of search results by a host-scoped
`X-Robots-Tag: noindex` in the template's `vercel.json`. That header matches on the
request host, so it never applies to the client's real domain — there is no flag to clear
at launch. **Never add a static `<meta name="robots" content="noindex">` to the template**:
it is baked into the HTML, is blind to which host served it, and would follow the site onto
the client's own domain and de-index the thing they paid for.

If the operator explicitly asks to disable SSO, confirm the ask ("this is a non-standard deviation from how every other MLA project is configured — proceed?") before flipping it.

## Guardrails

- Ask before running `vercel domains add` for a CLIENT's domain (Step 5) — it attaches a domain to the Vercel project and may fail if the domain is already used elsewhere. The preview host in Step 4 is MLA's own and needs no approval; it runs unattended on every build.
- **Never template, guess, or reuse a CNAME target.** Vercel issues a different one per project. A copied value produces a record that looks right, resolves somewhere else, and never verifies — and the symptom appears hours later with nothing pointing at the cause.
- **Never propose delegating `preview.mylocalads.co` to Vercel's nameservers, or a `*.preview` wildcard.** Both were tested and rejected: Vercel refuses to hold a subdomain as a zone (`only apex domains can be added without a project`), and a wildcard routes to a single project while every client site is its own. See Step 4.
- Never point a client at a `*.vercel.app` URL. It is SSO-gated and shows them a login wall.
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
