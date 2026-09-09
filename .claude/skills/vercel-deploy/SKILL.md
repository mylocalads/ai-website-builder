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

### 0. Pull first — ALWAYS, before reading or writing anything

```bash
git pull --rebase -q origin master || {
  echo "could not pull. STOP. Do not build, do not deploy."
  echo "A build from a stale checkout republishes a stale site."
  exit 1
}
```

**This is not housekeeping, it is the whole safety property.** Everything below
edits files in `sites/{slug}` and then publishes them. If the checkout is behind,
the edit is applied to old content and the old content is what goes live.

That is what happened on 2026-09-09: a checkout 29 days stale for `firefly-cd`
had one text change applied and the lot published. Three services deleted on 4
September came back on a client's live site and a service added on 8 September
disappeared. Pulling at the END — which this skill used to do, at step 9 — is too
late: by then the wrong content has already been built and shipped.

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

### 3. First deploy — the ONLY `vercel --prod` in this skill

From inside `sites/{slug}`:

```bash
npx vercel --prod --yes
```

This one is a CLI upload on purpose: the Vercel project does not exist yet, and
this is what creates it. **Every deploy after this comes from a git push** — see
step 3b, which wires that up before anything else can deploy the old way.

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

### 3b. Connect the new project to this repo — before anything else deploys it

A project that is not git-connected can only ever be published by uploading a
folder, and whoever uploads last wins outright. Connect it the moment it exists:

```bash
PID=$(python3 -c "import json;print(json.load(open('.vercel/project.json'))['projectId'])")

# Root Directory first. Linking without it makes Vercel build the repo root,
# which is not an Astro site.
curl -s -X PATCH -H "Authorization: Bearer $VERCEL_TOKEN" -H "Content-Type: application/json" \
  -d "{\"rootDirectory\":\"sites/{slug}\",\"commandForIgnoringBuildStep\":\"git diff --quiet HEAD^ HEAD ./\"}" \
  "https://api.vercel.com/v9/projects/$PID?teamId=$VERCEL_TEAM_ID" > /dev/null

curl -s -X POST -H "Authorization: Bearer $VERCEL_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"github","repo":"mylocalads/ai-website-builder","gitBranch":"master"}' \
  "https://api.vercel.com/v9/projects/$PID/link?teamId=$VERCEL_TEAM_ID" | grep -q '"error"' && {
    echo "could not connect the project to git — a site that only ever deploys by upload"
    echo "is the 2026-09-09 failure waiting to happen. Fix this before finishing."
    exit 1
  }
```

**The Ignored Build Step is not optional.** Without it every push to `master`
rebuilds all 43 site projects instead of the one that changed. `git diff --quiet
HEAD^ HEAD ./` exits 0 — meaning skip — when nothing under this site's Root
Directory changed. Verified 2026-09-09: a root-level commit produced 43 builds,
all 43 skipped, none republished.

### 4. Make the deployment publicly viewable — every build, not optional

The client portal shows this site to the client under **Web → Website** /
**Web → Funnels**, inside an iframe. A deployment behind Vercel's login wall renders as a
blank frame there and a sign-in page if they click through, so every build must end with a
URL the client can actually open. That URL is reported as `stagingUrl` on
`POST /api/builds/{id}/complete`.

**Turn deployment protection OFF for this project**, then rely on the host-scoped
`X-Robots-Tag: noindex` the template ships (see §Deployment Protection).

New projects inherit the team's protection default, so a fresh client site comes out
protected unless something changes it. Nothing does that automatically — do it explicitly:

```bash
cd sites/{slug}
PROJECT_ID=$(python3 -c "import json;print(json.load(open('.vercel/project.json'))['projectId'])")

curl -s -X PATCH \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ssoProtection": null}' \
  "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=team_pZ4lsW05bOEjG4wgazLzUhRH" \
  -o /dev/null -w 'disable protection -> HTTP %{http_code}\n'
```

`{"ssoProtection": null}` is the documented disable payload. An object with a
`deploymentType` re-enables it — do not pass one here.

**Then verify the URL YOU ARE ABOUT TO REPORT, not any other URL.**

A project has several: the deployment-specific
`{project}-{hash}-{scope}.vercel.app` and the clean alias `{project}.vercel.app`. They do
not necessarily share a protection state — the alias can serve publicly while the
deployment URL redirects to a login. Checking the wrong one proves nothing about what the
client will see.

```bash
STAGING_URL="https://{project}.vercel.app"   # the exact value you will report

# -L follows redirects, because SSO does not announce itself with an error code:
# it answers 302 and sends you to vercel.com/login, which then returns a healthy 200.
# A bare status check sees "200" and concludes all is well.
FINAL=$(curl -sL -o /tmp/probe.html -w '%{url_effective}' "$STAGING_URL")
CODE=$(curl -sL -o /dev/null -w '%{http_code}' "$STAGING_URL")

case "$FINAL" in
  *vercel.com/login*|*vercel.com/sso-api*)
    echo "FAIL: $STAGING_URL lands on a Vercel login page — the client would see a sign-in form"
    exit 1;;
esac
[ "$CODE" = "200" ] || { echo "FAIL: $STAGING_URL returned $CODE"; exit 1; }
grep -qi "<title" /tmp/probe.html || { echo "FAIL: no HTML title — not the site"; exit 1; }

echo "OK: $STAGING_URL is publicly viewable"
```

**Three checks, because each misses something the others catch.** The status code alone
passes on a login page. The final URL alone passes on a 404 that never redirected. The
title alone passes on Vercel's own error page. Report success only when all three agree.

Set `staging_url = $STAGING_URL`.

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

### 5b. Turnstile — create the widget and wire both keys

Runs on EVERY deploy, after the final hostname set is known (so after any
`--domain` attach) and BEFORE the Step 7 redeploy, because the site key is baked
into the HTML at build time.

**Why this is automated rather than documented.** `api/estimate.ts` has verified
Turnstile tokens since the template was written, and it sat switched off on every
site for months, because nothing in the pipeline ever set a key. A protection
that depends on a human remembering is a protection you do not have. Whitman took
five bot leads through a live form in six days before anyone noticed.

Needs `CLOUDFLARE_API_TOKEN` (scope: *Account → Turnstile → Edit*) and
`CLOUDFLARE_ACCOUNT_ID` in `.env`. **If either is unset, skip this step, say so in
the summary, and carry on.** A missing captcha must never fail a deploy that is
otherwise good.

One widget per client, named for the slug — so a leaked secret is one site's
problem, hostnames stay accurate, and Cloudflare analytics separate per client.

```bash
cd sites/{slug}
if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "Turnstile: CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID unset — skipping"
else
  CF="https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/challenges/widgets"
  AUTH="Authorization: Bearer $CLOUDFLARE_API_TOKEN"

  # Every hostname the form can be served from. Miss one and Turnstile rejects
  # every submission from it — hostname validation is enforced, not advisory.
  # Apex, www, the vercel.app alias, and the preview subdomain.
  DOMAINS_JSON=$(python3 -c "
import json,sys
slug, domain = sys.argv[1], sys.argv[2]
hosts = [f'{slug}.vercel.app', f'{slug}.mylocalads-preview.co']
if domain:
    hosts = [domain, 'www.' + domain] + hosts
print(json.dumps(hosts))
" "{slug}" "{domain}")

  # Reuse this slug's widget if it already exists. A second widget would orphan
  # the secret already sitting in Vercel and silently break the live form.
  SITEKEY=$(curl -s -H "$AUTH" "$CF" | python3 -c "
import json,sys
ws = json.load(sys.stdin).get('result') or []
print(next((w['sitekey'] for w in ws if w.get('name') == '{slug}'), ''))
")

  if [ -n "$SITEKEY" ]; then
    curl -s -X PATCH -H "$AUTH" -H 'Content-Type: application/json' \
      --data "$(python3 -c "
import json,sys;print(json.dumps({'domains': json.loads(sys.argv[1]), 'mode': 'managed'}))
" "$DOMAINS_JSON")" "$CF/$SITEKEY" -o /dev/null
    # Only a rotate hands back the secret; a GET never returns it.
    SECRET=$(curl -s -X POST -H "$AUTH" "$CF/$SITEKEY/rotate_secret" \
      | python3 -c "import json,sys;print(json.load(sys.stdin)['result']['secret'])")
  else
    RESP=$(curl -s -X POST -H "$AUTH" -H 'Content-Type: application/json' \
      --data "$(python3 -c "
import json,sys;print(json.dumps({'name': '{slug}', 'domains': json.loads(sys.argv[1]), 'mode': 'managed'}))
" "$DOMAINS_JSON")" "$CF")
    SITEKEY=$(echo "$RESP" | python3 -c "import json,sys;print(json.load(sys.stdin)['result']['sitekey'])")
    SECRET=$(echo "$RESP"  | python3 -c "import json,sys;print(json.load(sys.stdin)['result']['secret'])")
  fi
fi
```

`mode: managed` — Cloudflare decides per visitor. Nearly every real person sees
nothing; a suspicious one gets a checkbox. `invisible` looks tidier but leaves no
fallback when Cloudflare is unsure, which on a lead form means silently losing a
customer.

Then set BOTH halves. **Never set one without the other.** A site key with no
secret renders a widget that gates nothing: `captchaOk()` returns `true` when no
secret is configured, so the form looks protected and is not.

```bash
# Public half -> content. It ships inside the HTML, so it is not a secret.
python3 - "$SITEKEY" <<'PYEOF'
import json, sys, io
p = 'src/content/site/config.json'
d = json.load(io.open(p, encoding='utf-8'))
d.setdefault('crm', {})['turnstile_site_key'] = sys.argv[1]
io.open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(d, indent=2) + '\n')
PYEOF

# Private half -> Vercel env. Remove first: `env add` does not overwrite.
npx vercel env rm TURNSTILE_SECRET_KEY production --yes 2>/dev/null || true
printf '%s' "$SECRET" | npx vercel env add TURNSTILE_SECRET_KEY production
```

**Never write the secret into `config.json`, into `sites/build-log.md`, or into a
commit.** It is the only thing standing between the form and the bots, and the
public site key sitting beside it makes the two easy to confuse.

Verify after the Step 7 redeploy:

```bash
curl -s https://{domain}/book | grep -c 'challenges.cloudflare.com/turnstile'
```

Expect exactly `1` — the loader lives in `BaseLayout`, so two would mean a page
is pulling it twice. Then check the rendered key matches:

```bash
curl -s https://{domain}/book | grep -o 'data-sitekey="[^"]*"' | head -1
```

Finally, confirm a REAL browser gets a token. A captcha that rejects real
customers is worse than the spam it stops, and this is the only check that
catches a hostname missing from the widget's list.

**Turnstile will not solve inside the agent's automated browser.** No challenge
iframe is created, no token appears, and — the part that wastes an hour — no
error callback fires and the console stays clean, so it looks exactly like a
broken configuration. It is not. Do not go hunting for a CSP, re-create the
widget, or change `data-appearance` on this evidence. The two checks that ARE
conclusive from here:

```bash
# Is the secret itself valid? invalid-input-response = good (only the dummy token
# was rejected). invalid-input-secret = the secret is genuinely wrong.
curl -s -X POST https://challenges.cloudflare.com/turnstile/v0/siteverify \
  -d "secret=$SECRET" -d "response=dummy" | grep -o 'invalid-input-[a-z]*'

# Is enforcement live? A tokenless POST must come back error=captcha.
curl -s -o /dev/null -w '%{redirect_url}\n' -X POST https://{domain}/api/estimate \
  -H 'Origin: https://{domain}' --data-urlencode 'full_name=x' --data-urlencode 'return_to=/book'
```

For the client half, ask the operator to open `/book` in a normal browser and
confirm the green **Success!** tick. Until they confirm, **do not leave
`TURNSTILE_SECRET_KEY` set** — with the secret present and tokens not generating,
every real lead is rejected, which is far more expensive than the spam. Set the
site key, deploy, get the confirmation, then add the secret and redeploy.

Leave the widget VISIBLE — never `data-appearance="interaction-only"` on a lead
form. Invisible is tidier right up until it fails, and then the visitor sees an
ordinary form that silently refuses every submission with no error anywhere.

**Firefly sites are out of scope.** That template has no `api/estimate.ts` — it
embeds a GoHighLevel form in an iframe, so the form runs on GHL's servers and its
spam settings live in GHL, not here. Skip this step entirely for firefly.

### 6. Rewrite the site URL

Rewrite three files inside `sites/{slug}/`:

- `astro.config.mjs` — replace the `site:` value with `final_url`
- `public/robots.txt` — replace `REPLACE_SITE_URL` (or the previous interim URL) with `final_url`
- `src/content/site/config.json` — set `site_url` to `final_url`

### 7. Redeploy — by pushing, not by uploading

Build locally to prove the URL rewrite compiles, then let **git** publish it:

```bash
cd sites/{slug} && npm run build      # a gate, not a deploy
```

**Do NOT run `vercel --prod` here.** Every site project is connected to this repo
(Root Directory `sites/{slug}`, branch `master`), so **the push in step 9 is the
deploy.** Running the CLI as well uploads this box's folder directly to
production, which is the one action that can put something live that is not in
git — the exact failure this ordering exists to prevent.

The only place `vercel --prod` still belongs is step 3, where it CREATES a
project that does not exist yet.

Confirm after step 9 that the deployment Vercel produced from the push carries
`final_url` (custom domain) or `interim_url` (default).

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

# COMMIT FIRST. DO NOT PULL YET.
#
# This order is not stylistic, it is the whole safety of the step. Pulling
# first, with a freshly generated site sitting in the working tree over a
# previous version that is already committed, makes git refuse:
#
#     error: cannot pull with rebase: You have unstaged changes.
#
# The obvious way out of that error is `git checkout -- .` or `git reset
# --hard`, and BOTH DESTROY THE SITE THAT WAS JUST BUILT — restoring the old
# committed version over twenty minutes of work. That happened on the
# agc-concrete rebuild of 2026-08-11: the owl site was generated, the pull
# failed, the tree was restored to the firefly version, and the run had to
# rebuild from scratch.
#
# Committing first puts the work somewhere a pull cannot reach. NEVER add a
# pull, checkout, stash or reset above this line.

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

# Pull again before pushing. Step 0 already pulled -- this is the second one, and
# it catches anything the operator pushed WHILE the build was running. The work
# is in a commit by now, so a rebase moves it rather than risking it.
#
# Step 0 is the one that protects the CONTENT; this one only protects the push.
git pull --rebase -q origin master || {
  echo "rebase hit a conflict — STOP. Do not checkout, reset or force."
  echo "The site is built, live, and committed locally; only the push is pending."
  exit 1
}

git push -q origin master || {
  git pull --rebase -q origin master && git push -q origin master
} || {
  echo "push failed after retry — the site is built and live, but its source is only on this box"
  exit 1
}

echo "pushed sites/{slug}"
```

**THE PUSH IS THE DEPLOY.** Every site project is connected to this repo, so the
push above is what publishes the site — not step 3, and not any `vercel --prod`
you might be tempted to add. Confirm it landed before reporting success:

```bash
sleep 20
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=$PID&teamId=$VERCEL_TEAM_ID&limit=1" \
  | python3 -c "import json,sys; d=json.load(sys.stdin)['deployments'][0]; print(d['uid'], d['state'], d.get('source'))"
```

Expect `source: git` and a state of `BUILDING` or `READY`. **`CANCELED` means the
Ignored Build Step skipped it** — correct when this push changed nothing under
`sites/{slug}`, and a real problem if it did.

**Never `git push --force`, and never resolve a conflict by discarding.** The
operator's own work is on the other side of that push — and on this side, so is
a site that took twenty minutes and real money to generate. A conflict here is
an operator's problem to resolve, not something to clear with a reset.

`.env` is gitignored so credentials cannot be swept in — but the explicit staging
above is what makes that a guarantee rather than a hope.

**On an operator's own Mac this step is optional**: commit when you normally
would. It is mandatory on the droplet, which has no human to do it.

### 10. Print summary

Show the user:
- Business name, slug, final URL
- Page count
- GHL widget IDs status (chat / reviews / form embed URLs / call-tracking presence)
- Turnstile status — `sitekey set + secret set`, or `SKIPPED (no Cloudflare credentials)`.
  Say which, every time. A silent skip is how it stayed off everywhere before.
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
- Never set `turnstile_site_key` without also setting `TURNSTILE_SECRET_KEY`, or the
  form renders a widget that gates nothing — the endpoint skips verification when no
  secret is present, so it looks protected and is not.
- Never put a Turnstile secret in `config.json`, `build-log.md`, or a commit. The site
  key beside it IS public; the secret is not.
- Never attach a domain without adding it to the Turnstile widget in the same run. An
  unlisted hostname makes Turnstile reject every submission from it — a silent, total
  lead outage on the client's real domain.

## Failure recovery

- **Build fails on first attempt:** most common cause is missing content in `src/content/site/config.json` or empty services/service_areas collections. Instruct user to run `site-generate` again with the missing data.
- **Vercel deploy fails auth:** run `vercel login`.
- **Domain add fails "domain already used":** confirm the user hasn't attached this domain to another Vercel project.
- **Redeploy shows old canonicals:** confirm astro.config.mjs `site:` was actually rewritten. Rebuild and verify `dist/index.html` head contains the new URL.
- **Deploy returns 404 on every route:** the CWD hijack bug. Symptoms: `vercel --prod` succeeds, deployment API shows `readyState: READY`, but every URL 404s and the deployment metadata shows `framework: None`. Root cause: `.vercel/project.json` at the workspace root (parent of `sites/`) hijacked the link, so Vercel deployed the wrong directory. Recovery: `rm -rf ../../.vercel .vercel && cd sites/{slug} && npx vercel --prod --yes`, then run the post-deploy verification curl from Step 3. **This recovery is for a FIRST deploy only** — a project that is already git-connected must be repaired by pushing a fix, never by uploading, or the upload becomes a live site that is not in git.
