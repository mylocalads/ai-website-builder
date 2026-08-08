# Handoff — Backport the SEO baseline to fireflycd.com

**Status:** ready to start · **Site:** `sites/firefly-cd/` · **Live:** https://fireflycd.com
**Created:** 2026-08-06 · **Est:** 30–45 min including verification

---

## What this is

On 2026-08-06 the SEO/agent-discoverability baseline was added to both templates
(commit `556acef`) so every NEW site ships it. Sites generated before that date
do not have it. `firefly-cd` is the highest-priority backport because it is live
on a real customer domain.

Read `docs/seo-baseline.md` first — it explains the design and holds the
verification script. `CLAUDE.md` has the invariant summary.

---

## ⚠️ READ THIS BEFORE YOU COPY ANYTHING

**firefly-cd runs raised caps: 7 services, 6 areas. The template ships 5 and 5.**

Copying `astro-templates/firefly/src/lib/limits.ts` verbatim would cut the site
to 5 services and 5 areas — **deleting 3 live, indexed pages**:

- `/services/siding/`, `/services/windows/` (6th and 7th services)
- one service area page (6th area)

That is the exact opposite of the goal. When you create
`sites/firefly-cd/src/lib/limits.ts`, use:

```ts
export const SERVICE_LIMIT = 7;   // NOT 5 — firefly-cd was raised
export const AREA_LIMIT = 6;      // NOT 5 — firefly-cd was raised
```

Current live pages, to check against when you are done (24 URLs in
`sitemap-0.xml`):

- 7 services: `bathroom-remodels`, `decking`, `flooring`, `kitchen-remodels`,
  `roofing`, `siding`, `windows`
- 6 areas: `kootenai-county-id`, `liberty-lake-wa`, `otis-orchards-wa`,
  `post-falls-id`, `spokane-valley-wa`, `spokane-wa`

**No live URL may disappear.** If the page count drops, stop and fix the caps.

---

## Current state (audited 2026-08-06)

| | fireflycd.com today |
|---|---|
| JSON-LD | `LocalBusiness`, `FAQPage` |
| `WebSite` node | ✗ |
| `/llms.txt` | ✗ 404 |
| `/index.md` | ✗ 404 |
| `agent-site-summary` | ✗ |
| `content-language` | ✗ |
| `robots.txt`, sitemap | ✓ |

Missing files: `src/lib/agent-docs.js`, `src/lib/limits.ts`,
`src/pages/llms.txt.js`, `src/pages/index.md.js`.

The caps are currently hardcoded at **six** call sites:
`src/pages/services/[slug].astro`, `src/pages/[area].astro`,
`src/components/Header.astro`, `src/components/Footer.astro`,
`src/components/OurServices.astro`, `src/components/ServiceAreaGrid.astro`.

---

## Steps

### 1. Copy the four new files from the template

```bash
cd "sites/firefly-cd"
cp ../../astro-templates/firefly/src/lib/agent-docs.js   src/lib/agent-docs.js
cp ../../astro-templates/firefly/src/lib/limits.ts       src/lib/limits.ts
cp ../../astro-templates/firefly/src/pages/llms.txt.js   src/pages/llms.txt.js
cp ../../astro-templates/firefly/src/pages/index.md.js   src/pages/index.md.js
```

### 2. Fix the caps in the copied limits.ts — see the warning above

`SERVICE_LIMIT = 7`, `AREA_LIMIT = 6`.

Keep the template's `RESERVED_AREA_SLUGS` (it adds `book`, `llms.txt`,
`index.md`, which firefly-cd's inline list is missing) and `AREA_SLUG_PATTERN`.

### 3. Point the six call sites at limits.ts

Replace each `.slice(0, 7)` with `.slice(0, SERVICE_LIMIT)` and each
`.slice(0, 6)` with `.slice(0, AREA_LIMIT)`, adding the import. In
`src/pages/[area].astro` also delete the inline `RESERVED_SLUGS` /
`SLUG_PATTERN` consts and use the imported ones.

Careful in `src/pages/[area].astro` line ~55: there is an unrelated
`neighborhoods.slice(0, 3)` — leave it alone.

### 4. BaseLayout — three edits

Mirror `astro-templates/firefly/src/layouts/BaseLayout.astro`:

1. Import `getCollection` alongside `getEntry`, and
   `{ agentSiteSummary, publishedServices, publishedAreas }` from `../lib/agent-docs.js`
2. Add the `agentSummary` const (homepage only, `pathKey === '/'`) and the
   `websiteLd` object; add `websiteLd` to `ldPayloads`
3. Add `<meta http-equiv="content-language" content="en-us" />` and the
   `<script type="text/markdown" id="agent-site-summary">` block

### 5. robots.txt

Copy `astro-templates/firefly/public/robots.txt`, then replace
`REPLACE_SITE_URL` with `fireflycd.com` — the template ships the placeholder.

---

## Verification — do not skip

```bash
cd sites/firefly-cd && npm run build
```

- [ ] **Page count did not drop.** 7 service pages, 6 area pages, 24 sitemap
      URLs. Diff `dist/sitemap-0.xml` against the live one.
- [ ] `dist/llms.txt` and `dist/index.md` exist and contain no `undefined`
- [ ] `llms.txt` lists all 7 services and all 6 areas
- [ ] Business details match `src/content/site/config.json`:
      Firefly Contractors & Design · (509) 590-4604 · Office@fireflycd.com
- [ ] Homepage has `agent-site-summary`; an inner page does not
- [ ] Homepage JSON-LD: `LocalBusiness`, `WebSite`, `FAQPage`
- [ ] `robots.txt` has no `REPLACE_SITE_URL`
- [ ] Link-resolution script from `docs/seo-baseline.md` reports `NONE`

Note firefly builds to `dist/`, not `dist/client/`.

---

## Deploy

```bash
cd sites/firefly-cd && npx vercel deploy --prod
```

Then against the live domain:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://fireflycd.com/llms.txt   # expect 200
curl -s https://fireflycd.com/llms.txt | head -20
```

Spot-check that two previously-live URLs still resolve:

```bash
curl -s -o /dev/null -w '%{http_code} ' https://fireflycd.com/services/windows/
curl -s -o /dev/null -w '%{http_code}\n' https://fireflycd.com/spokane-wa/
```

Log the result in `sites/build-log.md` under a firefly-cd heading.

---

## Then commit

Scope to `sites/firefly-cd/` only. Suggested subject:

```
feat(firefly-cd): backport the SEO and agent-discoverability baseline
```

Call out in the body that caps were preserved at 7/6 rather than taking the
template's 5/5, and that no live URL was lost.

---

## The other 26 sites

Same procedure, but each has its own caps — **check them per site, never assume
the template's**. `firefly-cd` is the only one on a customer domain today; the
rest are on `*.vercel.app` and are lower risk. Worth batching once this one
proves the process.
