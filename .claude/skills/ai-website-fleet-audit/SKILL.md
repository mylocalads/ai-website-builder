---
name: ai-website-fleet-audit
description: Audit performance, SEO and agent-discoverability across every site in sites/, or one named site. Crawls each site with Unlighthouse (every page, not just the homepage), optionally pulls PageSpeed Insights field data and Google Search Console impressions, writes a dated JSON snapshot, and diffs against the previous run so regressions surface on their own. Use when the user says "fleet audit", "audit the sites", "how are our sites performing", "check performance", "which pages regressed", "SEO health check", or names a site with "audit". Do NOT trigger for building a new site, editing content, or deploying.
---

# Fleet Audit

Measure the fleet, store the result, and compare it to last time. Optimisation
without a baseline is guesswork — this exists so "did that help?" has an answer.

## What this is not

Not an optimiser. It does not edit sites. It produces a ranked list of what is
worst and what moved, and stops. Fixes go through `site-edit`, which snapshots
and rolls back; this skill has no write access to any site.

---

## Inputs

| Arg | Meaning |
|---|---|
| *(none)* | Audit every deployed site in `sites/` |
| `{slug}` | Audit one site |
| `--quick` | Unlighthouse only; skip the PSI and Search Console calls |
| `--psi` | Include PageSpeed Insights (lab + CrUX field data) |
| `--gsc` | Include Search Console impressions/clicks/position |

Default with no flags: Unlighthouse + PSI. Search Console only on `--gsc`,
because it answers a different question (did anyone *see* the site) and its
data lags 2–3 days.

---

## Prerequisites

- `npm install` at the repo root (Unlighthouse is a devDependency).
- Node 22.18+ and Chrome. Unlighthouse downloads Chromium if Chrome is absent.
- `.env` at the repo root for the API steps. **Never** paste a key into chat,
  a skill file, or a committed file — read it from the environment:

  ```
  PAGESPEED_API_KEY=...
  GSC_SERVICE_ACCOUNT_JSON=/absolute/path/to/service-account.json
  ```

  If a key is missing, run the steps that do work, and report which were
  skipped and why. Never invent a score.

**Disk check first.** Each Chrome worker writes traces, and this machine has
filled its volume before — a full disk fails as a confusing mid-run crash.

```bash
df -h /System/Volumes/Data | tail -1
```

Under ~5 GB free: stop and say so. `npm cache clean --force` reclaims several
GB safely if needed.

---

## Process

### 1. Resolve the target list

A site is auditable when it has a live URL. Read the canonical from each
site's config rather than assuming a `{slug}.vercel.app`, which has been wrong
before:

```bash
for d in sites/*/; do
  s=$(basename "$d")
  u=$(node -e "try{console.log(require('./$d/src/content/site/config.json').site_url)}catch(e){}" 2>/dev/null)
  [ -n "$u" ] && echo "$s $u"
done
```

Skip anything with no `site_url`. Report the skips — a site missing from an
audit must never look like a site that passed.

### 2. Unlighthouse per site

```bash
npx unlighthouse-ci --site {url} --build-static --output-path .unlighthouse/{slug}
```

Reads `unlighthouse.config.ts` at the repo root: mobile, sitemap-driven, every
page, concurrency 2.

Exit code 1 means a budget was missed, **not** that the run failed. Check for
`.unlighthouse/{slug}/ci-result.json` before treating it as an error.

Each record is flat:

```json
{ "path": "/", "score": 0.8, "performance": 0.6,
  "accessibility": 0.92, "best-practices": 0.69, "seo": 1 }
```

Scores are 0–1. Multiply by 100 for display.

### 3. PageSpeed Insights (`--psi`, default on)

One call per site homepage. Lab data plus CrUX field data when the origin has
enough traffic — field data is what Google actually ranks on.

```bash
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices&key=${PAGESPEED_API_KEY}"
```

Pull `lighthouseResult.categories.*.score` and, when present,
`loadingExperience.metrics` (real-user LCP/INP/CLS). The API is free at 25k
requests/day; a fleet run is ~30 calls.

PSI and Unlighthouse will disagree — different throttling and hardware. Never
present them as the same number. PSI is the reference for "what Google sees";
Unlighthouse is the reference for "which page is worst".

### 4. Search Console (`--gsc`)

Per site, last 28 days vs the preceding 28:

```
POST https://searchconsole.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query
{ "startDate": "...", "endDate": "...", "dimensions": ["page"], "rowLimit": 100 }
```

Authenticate with the service account in `GSC_SERVICE_ACCOUNT_JSON`. The
service-account email must be added as a user on each property in Search
Console — it is not automatic, and a 403 here means that step was missed.

This is the only signal in the audit that measures outcome rather than
mechanics. A site can score 98 and get no impressions.

### 5. Write the snapshot

```
audits/{YYYY-MM-DD}/{slug}.json     per-site detail
audits/{YYYY-MM-DD}/summary.json    fleet roll-up
audits/latest.json                  symlink/copy of the newest summary
```

Include the git SHA and the run timestamp. A score with no commit attached
cannot be tied back to a change.

### 6. Diff against the previous run

Find the most recent prior dated directory and compare per page:

- **Regressions** — any category down ≥ 5 points. Lead with these.
- **Improvements** — up ≥ 5 points, so a fix can be shown to have worked.
- **New / removed pages** — a page that vanished is usually a cap change
  (see `src/lib/limits.ts`) and is more urgent than any score.

First run: say it is the baseline. Do not fabricate a comparison.

### 7. Report

Ranked worst-first, because that is the work queue:

```
Fleet audit — 2026-08-08 (24 pages, 1 site)

  SITE          PAGES  PERF  A11Y   BP   SEO   Δ PERF
  firefly-cd       24    88    93   77   100     +40

  Worst pages
    /                60   hero video + calendar iframe
    /book/           68   calendar iframe
    /contact/        68   form iframe

  Regressions   none
  Improvements  /services/windows/ 51 → 98
```

Then at most three recommendations, each naming the page and the specific
audit. No generic advice — "optimise images" is not actionable; "`/` ships a
2.1 MB PNG as `team_photo`" is.

---

## Interpreting results — traps in this fleet specifically

- **A homepage far below its own inner pages means a third-party embed**, not
  bad markup. The GHL calendar, chat and reviews widgets carry their own JS and
  cannot be optimised from here. Weigh a real fix (defer, load on interaction)
  against the lead capture it would risk. Do not silently remove a widget to
  win a score.
- **Best-practices ~69 on widget pages and 100 elsewhere** is that same cause.
  It is a CRM cost, not a regression.
- **SEO 100 with zero Search Console impressions** means the pages are perfect
  and nobody is finding them. That is a content and links problem; no amount of
  Lighthouse work moves it.
- **A page disappearing between runs** is almost always a collection cap, not a
  crawl failure. Check `SERVICE_LIMIT` / `AREA_LIMIT` before anything else.
- **Never hand-edit `llms.txt`, `index.md` or the agent summary** in response to
  an SEO finding. They are generated from the content collections
  (`src/lib/agent-docs.js`); fix the collection. See `CLAUDE.md`.

---

## Guardrails

- Read-only. This skill never edits a site, never deploys, never commits.
- Never print an API key, token, or service-account path contents.
- Never report a score that was not produced by a run in this invocation.
- If a step is skipped (missing key, site unreachable, disk full), say which
  and why. A partial audit presented as complete is worse than no audit.
- Do not run the full fleet when the user named one site.
