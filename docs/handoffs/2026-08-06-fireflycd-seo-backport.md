# Handoff — Backport the SEO baseline to fireflycd.com

**Status:** ✅ **COMPLETE for `firefly-cd`** (2026-08-08) · **Site:** `sites/firefly-cd/`
**Live:** https://fireflycd.com · **Created:** 2026-08-06 · **Completed:** 2026-08-08
**Commit:** `a0eb2cb` · **Deploy:** `firefly-rf4nlw8df`

> This document was corrected on 2026-08-08 while executing it. Four things in
> the original were wrong or stale and would have caused real damage if followed
> literally. They are fixed inline below and called out in
> **[What the original got wrong](#what-the-original-got-wrong)**.
>
> **Scope note:** this handoff now covers `firefly-cd` only. The "other 26 sites"
> rollout is **not scheduled and not started** — see [Not in scope](#not-in-scope).

---

## What this was

On 2026-08-06 the SEO/agent-discoverability baseline was added to both templates
(commit `556acef`) so every NEW site ships it. Sites generated before that date
do not have it. `firefly-cd` was the highest-priority backport because it is live
on a real customer domain.

Background: `docs/seo-baseline.md` explains the design and holds the verification
script. `CLAUDE.md` has the invariant summary.

---

## ⚠️ THE CAPS TRAP — the single most dangerous step

**firefly-cd runs raised caps: 7 services, 6 areas. The template ships 5 and 5.**

Copying `astro-templates/firefly/src/lib/limits.ts` verbatim cuts the site to
5 and 5, **deleting 3 live, indexed pages**. Slicing a collection is never a
build error, so nothing warns you — the pages just stop existing.

The pages that would be deleted, **by `order`, not by nav position**:

| Collection | Cut at 5 | Slug |
|---|---|---|
| services | 6th | `flooring` (`order: 6`) |
| services | 7th | `decking` (`order: 7`) |
| service_areas | 6th | `kootenai-county-id` (`order: 6`) |

Service order is `roofing`(1), `siding`(2), `windows`(3), `kitchen-remodels`(4),
`bathroom-remodels`(5), `flooring`(6), `decking`(7). Siding and windows are 2nd
and 3rd and were never at risk — **the original handoff named them, incorrectly.**

`sites/firefly-cd/src/lib/limits.ts` now reads:

```ts
export const SERVICE_LIMIT = 7;   // NOT 5 — firefly-cd was raised
export const AREA_LIMIT = 6;      // NOT 5 — firefly-cd was raised
```

and carries a comment block explaining the deviation, so a future re-copy from
the template has to override it deliberately rather than by accident.

**No live URL may disappear.** Diff the built sitemap against the live one before
deploying.

---

## The cap call sites — there are EIGHT, not six

Ten slice expressions across eight files. `Header.astro` and `Footer.astro` each
carry **both** collections on adjacent lines.

| File | Caps |
|---|---|
| `src/pages/services/[slug].astro` | SERVICE |
| `src/pages/services/index.astro` | SERVICE ← *missing from the original list* |
| `src/pages/[area].astro` | AREA (+ reserved slugs, slug pattern) |
| `src/pages/service-areas/index.astro` | AREA ← *missing from the original list* |
| `src/components/Header.astro` | SERVICE **and** AREA |
| `src/components/Footer.astro` | SERVICE **and** AREA |
| `src/components/OurServices.astro` | SERVICE |
| `src/components/ServiceAreaGrid.astro` | AREA |

Missing the two index pages is not cosmetic. That exact inconsistency — the
`/services/` index capped at 5 while everything else was at 6 — **silently hid
the `flooring` page from the services grid** until it was caught on 2026-08-04.
It is the precise drift `limits.ts` exists to prevent.

Two traps when editing these:

- **`src/pages/[area].astro` line ~55 has an unrelated `neighborhoods.slice(0, 3)`.**
  Leave it alone.
- **A blind `sed 's|slice(0, 6)|slice(0, 7)|'` over `Header`/`Footer` hits the
  *service_areas* line too**, desyncing the area nav from the area route cap.
  Grep the whole cap surface after any bulk substitution.

---

## Steps (as executed)

### 1. Copy the four new files from the template

```bash
cd "sites/firefly-cd"
cp ../../astro-templates/firefly/src/lib/agent-docs.js   src/lib/agent-docs.js
cp ../../astro-templates/firefly/src/lib/limits.ts       src/lib/limits.ts
cp ../../astro-templates/firefly/src/pages/llms.txt.js   src/pages/llms.txt.js
cp ../../astro-templates/firefly/src/pages/index.md.js   src/pages/index.md.js
```

### 2. Fix the caps in the copied limits.ts

`SERVICE_LIMIT = 7`, `AREA_LIMIT = 6` — see the caps trap above.

Keep the template's `RESERVED_AREA_SLUGS` (it adds `book`, `llms.txt`,
`index.md`, which firefly-cd's old inline list was missing) and
`AREA_SLUG_PATTERN`.

### 3. Point all eight call sites at limits.ts

Replace each literal with `SERVICE_LIMIT` / `AREA_LIMIT` and add the import. In
`src/pages/[area].astro` also delete the inline `RESERVED_SLUGS` / `SLUG_PATTERN`
consts and use the imported ones.

Note the import specifier differs per file — some import
`{ getCollection }`, others `{ getEntry, getCollection }`. Match the actual line.

### 4. BaseLayout — EDIT IT, DO NOT COPY IT

**`sites/firefly-cd/src/layouts/BaseLayout.astro` has a `<slot name="head" />`
(project-map) that the template does NOT have.** `/our-work/` fills it via
`<Fragment slot="head">` and renders its map assets through it. Copying the
template's BaseLayout over this file silently breaks the project map.

Apply these three edits by hand, leaving the project-map slot in place:

1. Import `getCollection` alongside `getEntry`, and
   `{ agentSiteSummary, publishedServices, publishedAreas }` from `../lib/agent-docs.js`
2. Add the `agentSummary` const (homepage only, `pathKey === '/'`) and the
   `websiteLd` object; add `websiteLd` to `ldPayloads`
3. Add `<meta http-equiv="content-language" content="en-us" />` and the
   `<script type="text/markdown" id="agent-site-summary">` block

`websiteLd.publisher` points at `${site.site_url}#localbusiness`; confirm
`localBusinessLd` actually uses that `@id` or the two nodes will not resolve as
one entity.

### 5. robots.txt

Copy `astro-templates/firefly/public/robots.txt`, then replace
`REPLACE_SITE_URL` with `fireflycd.com` — the template ships the placeholder.

---

## Verification — all passed 2026-08-08

```bash
cd sites/firefly-cd && npm run build
```

- [x] **Page count did not drop.** 7 service pages, 6 area pages, 24 sitemap URLs.
      Built `sitemap-0.xml` diffed against the live one: 24 vs 24, nothing added,
      nothing removed.
- [x] `dist/llms.txt` and `dist/index.md` exist and contain no `undefined`
- [x] `llms.txt` lists all 7 services and all 6 areas
- [x] Business details match `src/content/site/config.json`:
      Firefly Contractors ＆ Design · **+1 509-295-9346** · Office@fireflycd.com
- [x] Homepage has `agent-site-summary`; inner pages do not
- [x] Homepage JSON-LD: `LocalBusiness`, `WebSite`, `FAQPage`
- [x] `robots.txt` has no `REPLACE_SITE_URL`
- [x] Link-resolution script from `docs/seo-baseline.md` reports `NONE`
- [x] Post-deploy: all 24 live URLs return 200

Note firefly builds to `dist/`, not `dist/client/`.

⚠️ The phone number in this checklist was `(509) 590-4604` in the original. It
was changed to **+1 509-295-9346** on 2026-08-06, before this backport ran. Any
checklist that hardcodes business details will rot — read
`src/content/site/config.json` as the source of truth.

ℹ️ `business_name` is `Firefly Contractors ＆ Design` with a **fullwidth
ampersand** (U+FF06), not `&`. Pre-existing; it already renders that way in every
`<title>` and now also in `llms.txt`, `/index.md` and the agent summary. Not
fixed here — worth a one-line batch of its own.

---

## Deploy — done

Deployed `firefly-rf4nlw8df`. Live checks:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://fireflycd.com/llms.txt   # 200
curl -s -o /dev/null -w '%{http_code}\n' https://fireflycd.com/index.md   # 200
```

Logged in `sites/build-log.md` under the 2026-08-08 firefly-cd heading.

---

## What the original got wrong

Recorded so the same mistakes are not repeated in any future handoff of this
shape. All four are fixed above.

1. **"The caps are currently hardcoded at six call sites."** There are **eight**
   (ten slice expressions). It omitted `src/pages/services/index.astro` and
   `src/pages/service-areas/index.astro`. Following it literally leaves those two
   hardcoded and reintroduces the drift the module exists to prevent.
2. **"Copying limits.ts would delete `/services/siding/` and `/services/windows/`."**
   Wrong pages. By `order` those are 2nd and 3rd and were never at risk. The
   pages actually at risk were `flooring`, `decking` and `kootenai-county-id`.
   The conclusion (use 7/6) was right; the reasoning would have sent someone
   spot-checking the wrong two URLs and concluding all was well.
3. **Stale business details in the verification checklist** — the phone had
   changed two days earlier. Point checklists at the config file, don't restate
   values.
4. **"Mirror BaseLayout" understated the risk.** firefly-cd's BaseLayout carries
   a project-map `<slot name="head" />` the template lacks. "Mirror" reads as
   "copy" to anyone moving fast; copying breaks `/our-work/`.

---

## Not in scope

The other 26 pre-`556acef` sites are **not scheduled and not started.** This
handoff is closed at `firefly-cd`, which was the only one on a customer domain.
The rest are on `*.vercel.app` and carry no customer-facing risk today.

If that rollout is ever picked up, it needs its own handoff — and the caps
warning above generalises: **every site has its own caps, never assume the
template's 5/5.** Audit `limits.ts`-equivalent literals per site before copying
anything, and diff each built sitemap against the live one before deploying.
