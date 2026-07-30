---
name: project-map
description: Adds an interactive project map plus a filterable project grid to an already-generated client site's /our-work page. Takes an operator-supplied CSV of completed projects (address, date, service type, products, photo URLs), geocodes each address once against Nominatim at 1 request/second with a local hash-keyed cache, discards the street address, and writes only city/state/lat/lng/month-year into sites/{slug}/src/content/site/our-work.json#project_map plus derived /projects.json and /projects.js build artifacts. Back-fills the ProjectMap component, the standalone project-map.js engine, and vendored Leaflet into sites that predate the feature. Snapshots to .site-edit-history/ so site-edit rollback works, then validates and hands off to vercel-deploy.
trigger: "project-map" or "add a project map" or "add the project map to {slug}" or "map the projects for {slug}" or "project map {slug}"
---

<!--
Pipeline position: this skill is OUT-OF-BAND. It does NOT run the intake →
design → generate → deploy pipeline. It runs against an existing, already
scaffolded and usually already deployed sites/{slug}/.

It is deliberately not a pipeline step: at scaffold time no client has yet
supplied project addresses or completion photos, so a pipeline version would
render an empty map on every new site.

Allowed write roots (per invocation, scoped to ONE confirmed slug):
  sites/{slug}/src/content/site/our-work.json     ← the project_map block
  sites/{slug}/src/content/config.ts              ← schema back-fill (marker-guarded)
  sites/{slug}/src/lib/project-map-payload.ts     ← back-fill
  sites/{slug}/src/pages/projects.json.ts         ← back-fill
  sites/{slug}/src/pages/projects.js.ts           ← back-fill
  sites/{slug}/src/pages/our-work.astro           ← SURGICAL INSERT ONLY, never overwrite
  sites/{slug}/src/layouts/BaseLayout.astro       ← SURGICAL INSERT ONLY (head slot)
  sites/{slug}/src/components/ProjectMap.astro    ← back-fill
  sites/{slug}/public/project-map.js              ← back-fill
  sites/{slug}/public/project-map.css             ← back-fill
  sites/{slug}/public/vendor/leaflet/1.9.4/**     ← back-fill (vendored, pinned)
  sites/{slug}/vercel.json                        ← headers-only, never routes
  sites/{slug}/.project-map-geocode-cache.json    ← hash → coordinate cache
  sites/{slug}/.gitignore                         ← to exclude the intake CSV
  sites/{slug}/.site-edit-history/**              ← shared snapshot history

Explicit deny (refuse even if the operator asks):
  astro-templates/**        ← READ-ONLY source for back-fills; never written here
  Anything outside sites/{slug}/

These write roots are WIDER than site-edit's — this is the first skill to write
public/, src/pages/, src/lib/, src/layouts/, and src/content/config.ts. That is
intentional, because the feature spans the whole stack, and it is the reason
step 2's drift check is not optional.

Template scope: FIREFLY ONLY. The Owl template does not carry the project map.
If sites/{slug}/ was generated from astro-templates/owl/, refuse at step 2.
-->

# Project Map Skill

## What this skill does

Turns a spreadsheet of completed jobs into an interactive map + filterable
project grid on an existing client site's `/our-work` page. The map is Leaflet
over OpenStreetMap tiles — no API key, no billing account, no per-client secret.
Addresses are geocoded once at skill time and then thrown away.

Seven gates, in order:

1. Slug resolve + confirm
2. Precondition + drift check (refuses bespoke and Owl-based sites)
3. Idempotent back-fill of the feature files
4. Intake validation — every row, before any network call
5. Geocode batch — hard stop before the first request
6. Preview + apply — hard stop
7. Validate (`astro sync` → `npm run build` → privacy assertions) → deploy

## Inputs (must exist before running)

- A scaffolded `sites/{slug}/` with `src/pages/our-work.astro`,
  `src/content/config.ts`, and `src/content/site/our-work.json`
- `sites/{slug}/project-map-intake.csv` (see step 4 for the header)
- `node_modules` installed in `sites/{slug}/` (`npm install` if absent)
- Network access to `nominatim.openstreetmap.org`

## Cost rules

**Free.** Nominatim charges nothing and needs no key.

The gate here is **time and reputation, not money**. Nominatim's usage policy
caps you at 1 request/second and requires a real identifying `User-Agent`.
Abuse gets the whole IP blocked, which breaks this skill for every future
client. So treat the rate limit exactly like a money gate: state the cost in
seconds before the batch and wait for explicit approval.

> N addresses needing geocoding × up to 3 attempts × 1.1s ≈ N×3.3 seconds.
> Cached addresses are free and instant.

**One standing cost the operator must know before rollout:** OSM's tile policy
prohibits heavy or commercial use of `tile.openstreetmap.org`. A single roofing
client's `/our-work` sits inside the light-use allowance. If a client site takes
real traffic, tiles must move to MapTiler, Stadia, or Carto — the tile URL is a
single named constant at the top of `public/project-map.js`. Say this out loud
in the final report; do not let it be discovered during an outage.

## Anti-patterns / HARD ADDRESS-PRIVACY LOCK

- The street address is **never** written to any file under
  `sites/{slug}/src/`, `public/`, or `dist/`. It lives only in the operator's
  intake CSV and in memory during geocoding. **There is no `address` field in
  the schema at any level** — privacy is enforced by the absence of the data,
  not by a rendering rule someone could later forget.
- The geocode cache is keyed by **SHA-256 of the normalized address** and stores
  only `{lat, lng, precision, resolved_at}`. No address string, ever. This is
  why the cache is safe to commit.
- Popups and cards render `Project in {city}, {state}` + month/year + photo.
  Never a street, never a house number, never a customer name, never a
  day-level date. `completed` is `YYYY-MM` on purpose: day precision plus a
  street-level pin plus public permit records is a re-identification vector.
- **Never invent coordinates.** Never guess a city. A failed geocode is
  surfaced to the operator, never quietly filled in.
- **Never overwrite `our-work.astro` or `BaseLayout.astro` wholesale.** Per-site
  copy drift is real and verified: `headley-construction-group` has a custom
  `<CTA headline>` a blind copy would destroy. Marker-guarded insert only.
- Never write to `astro-templates/`. Reading it to copy a back-fill file is
  required; writing it is a hard refusal.
- Never add `routes`, `rewrites`, `cleanUrls`, `trailingSlash`, or `functions`
  to `vercel.json`. Those override the adapter's generated config and produce
  the "deploy succeeds, every route 404s" failure already documented in
  `vercel-deploy/SKILL.md`. **Headers only.**
- Never emit `Place` / `PostalAddress` JSON-LD for a project. That would be a
  privacy regression and invites Google to surface a location card.
- Never delete the operator's intake CSV. Gitignore it and say so.

## Reserved slugs (refuse conflicts)

This feature claims these top-level paths. A service area or service with any of
these slugs must be refused:

`projects.json`, `projects.js`, `project-map.js`, `project-map.css`, `vendor`

---

## Process (execute in this order — do not reorder)

### 1. Resolve and confirm the slug

Same resolution rules as `site-edit` step 1: exact directory match → substring →
fuzzy match on `business_name` in `src/content/site/config.json`. Echo back:

```
Project map target
  Business : Firefly Contractors & Design
  Slug     : firefly-cd
  Page     : /our-work
  Live     : https://firefly-cd.vercel.app
```

**Hard stop until confirmed.**

### 2. Precondition + drift check

Refuse loudly and write nothing if any of these hold:

- `sites/{slug}/src/pages/our-work.astro` is missing → bespoke site. (This is
  what catches `mylocalads`, which has neither `our-work.astro` nor
  `config.ts`.) Stop.
- `sites/{slug}/src/content/config.ts` is missing → bespoke site. Stop.
- The site was generated from `astro-templates/owl/` → out of scope. Detect via
  the presence of `src/pages/service-area/` (Owl nests service areas) or
  `src/content/blog/`. Stop with: "Project map is a Firefly-template feature."

Then diff `our-work.astro` against the template's **pre-change** version. If it
differs by anything other than copy lines, show the operator the diff and
confirm the insert is still safe before proceeding.

`headley-construction-group` will trip this check with exactly one line:

```
48c48
<   <CTA headline="Need a roof inspection? Book a free inspection now!" ... />
---
>   <CTA headline="Need concrete or civil work? Get a fast, no-runaround quote." ... />
```

That drift is below both insert points, so it proceeds — but the operator sees
it, which is the point.

### 3. Back-fill the feature files (idempotent)

For each path in the back-fill list, copy from `astro-templates/firefly/` if
absent, and record it as touched:

```
src/lib/project-map-payload.ts
src/pages/projects.json.ts
src/pages/projects.js.ts
src/components/ProjectMap.astro
public/project-map.js
public/project-map.css
public/vendor/leaflet/1.9.4/{leaflet.js,leaflet.css,images/*.png}
vercel.json
```

For `config.ts`, `our-work.astro`, and `BaseLayout.astro`, do a
**marker-guarded surgical insert** so a second run is a no-op rather than a
duplicate:

- `.astro` / `.ts` → `// project-map:begin` … `// project-map:end`
- inside `.astro` templates → `{/* project-map:begin */}` … `{/* project-map:end */}`

If the markers are already present, skip that file.

**One non-obvious placement rule, learned the hard way:** the
`<Fragment slot="head">` must sit **inside** the `project-map` block next to
`<ProjectMap />`, not at the top of the `<BaseLayout>` children. Placing it
first perturbs the default slot's leading whitespace and changes the rendered
HTML by one byte even when the map is disabled — which breaks the "degrades to
exactly today's behavior" guarantee in step 10.

### 4. Read and validate the intake — no network yet

The intake is a **file**, not an interactive Q&A: 40 rows in a chat transcript
is unreliable and unreviewable, whereas a file is diffable, re-runnable, and can
be built from a spreadsheet the client already keeps.

`sites/{slug}/project-map-intake.csv`, header verbatim:

```
address,city,state,completed,project_type,products_used,photos,alt,description
```

- `state` — 2 letters (`WA`, `FL`)
- `completed` — `YYYY-MM` or `March 2026`; normalized to `YYYY-MM`
- `products_used`, `photos` — `;`-separated
- `photos` — absolute URLs. There is no local-image pipeline in this repo and
  no `astro:assets` usage anywhere; every image field is `z.string().url()`.
- **Quote any field containing a comma.** Image CDN URLs routinely contain them
  (`…/cr=t:0%25,l:0%25,w:100%25…`). Unquoted, they shred the row.

Validation runs over **every row before any network call** — don't geocode 39
rows and then discover row 40 is broken; the network is the rate-limited part.
Reject the whole file with a per-row error table if anything fails.

IDs are generated as `{city-slug}-{state}-{YYYY-MM}-{nn}` — deterministic across
re-runs, sortable, and containing no address text.

Spot-check the first three photo URLs with `curl -sI` and flag non-200s. This
catches the common Google-Photos / Facebook-CDN hotlink failure before it ships.

### 5. Geocode cache read

`sites/{slug}/.project-map-geocode-cache.json`, keyed by SHA-256 of
`lower(trim(address)) + '|' + lower(city) + '|' + STATE`. Cache hits skip the
network entirely. **Commit this file** — it contains no PII by construction, and
committing it makes re-runs free on any machine.

### 6. Geocode batch — hard gate before the network

Run the batch via the shipped script, which owns the rate limiting, the cache,
the fallback tiers, and the privacy contract:

```bash
node scripts/project-map-geocode.mjs {slug}            # preview only
node scripts/project-map-geocode.mjs {slug} --apply    # writes our-work.json
```

Show the operator this before the first request and **hard stop**:

```
Project map for firefly-cd
  7 projects in intake
  0 resolved from cache (free, instant)
  7 need geocoding

Nominatim is free but rate-limited to 1 request/second.
Worst case ~23s (up to 3 attempts each).
Only the street address, city, and state are sent. Addresses are NOT
written to any file under sites/firefly-cd/.

Proceed? [yes / no]
```

The script enforces, and you must not work around:

- Structured query (`&street=&city=&state=&countrycodes=us`), far more reliable
  than free-form `q=`
- `User-Agent: mla-website-builder/1.0 (marcellus@mylocalads.co)` — Nominatim
  blocks absent or default agents
- ≥1100 ms between requests, strictly sequential, never parallel
- **On HTTP 429/403: abort the entire batch immediately**, saving everything
  geocoded so far. Do not back off and retry — a retry loop is how an IP gets
  banned for every future client.
- Reject any hit whose returned state doesn't match the input, or that falls
  outside a CONUS+AK+HI bounding box. A wrong-state hit means the address was
  misparsed, which is worse than no hit.

### 7. Geocode failure handling — three tiers, never a silent drop

| Tier | Trigger | Action |
|---|---|---|
| 1 | 0 results, or state mismatch | Retry once without the house number, keeping street + city + state |
| 2 | Still nothing | Geocode `{city}, {state}` alone → city centroid. `precision: "city"`, flagged `⚠ city` in the preview |
| 3 | City also fails | Project keeps **no coordinates**: it still appears in the list and the photo grid, it just has no pin. Flagged `⚠ no pin (grid only)` |

Tier 3 is why `lat`/`lng` are optional in the schema. Without it, one
unparseable rural address forces either faking coordinates or dropping a real
project. If the operator would rather supply coordinates by hand, they can add
`lat`/`lng` to `our-work.json` directly and set `precision: "manual"`.

Coincident pins (within ~30 m) get a **deterministic** `hash(id)`-derived jitter
of ±0.0002° so one project cannot hide another. Deterministic so rebuilds never
shuffle pins — and a small privacy bonus on top.

### 8. Preview + confirm — hard stop

```
7 projects → sites/firefly-cd/src/content/site/our-work.json#project_map

ID                            WHEN     TYPE      PHOTOS  COORDS              PRECISION
spokane-wa-2026-03-01         2026-03  Roofing   1       47.6589, -117.4225  street
otis-orchards-wa-2025-11-01   2025-11  Siding    1       47.7005, -117.1117  ⚠ city
zzzqqxxville-wa-2025-09-01    2025-09  Flooring  1       —                   ⚠ no pin (grid only)

Filter facets that will render:
  Project Type:  Roofing (3), Siding (2), Flooring (1), Windows (1)
  Products Used: GAF Timberline HDZ (3), Andersen 100 Series (1), …
  City & State:  Spokane, WA (2), Liberty Lake, WA (1), …

PRIVACY: street addresses were used for geocoding only and appear in no
output file under sites/firefly-cd/.

Photo URL spot-check: 3/3 returned 200.

Apply? [yes / no]
```

### 9. Snapshot, then apply

Snapshot **every touched file** into
`.site-edit-history/{ISO}-{shortid}/before/` before writing anything, using
`site-edit`'s mechanism exactly: `.absent` zero-byte markers for files being
created, `after/` on success, `manifest.json`, one appended `log.jsonl` line.
Set `manifest.mode: "project-map"`.

Then write. Atomic — any write failure reverts the whole batch from `before/`.

Append `project-map-intake.*` to `sites/{slug}/.gitignore` if absent. **The
intake CSV is the only file in the repo that contains customer street
addresses.** Not gitignoring it is the single way this feature leaks them.

### 10. Validate

```bash
cd sites/{slug} && npx astro sync && npm run build
```

Then assert against `dist/`:

- `test -f dist/projects.json` — a real file, not a directory (verified: non-HTML
  endpoints bypass `build.format: 'directory'`)
- `grep -c 'Project in ' dist/our-work/index.html` ≥ the project count — proves
  the content is server-rendered, not JS-injected
- **No project street address anywhere in the output.** Scope this assertion
  carefully or it produces false positives: the client's *own* address is in the
  `LocalBusiness` JSON-LD on every page by design, and service-area pages list
  neighborhood names that can coincide with street names. Assert on the actual
  intake addresses, and on keys rather than values:

```bash
node -e "
const w=require('./src/content/site/our-work.json');
const banned=['address','street','street_address','full_address','addr'];
const bad=[];
for (const p of w.project_map.projects)
  for (const k of Object.keys(p)) if (banned.includes(k)) bad.push(k);
console.log(bad.length ? 'FAIL: '+bad : 'PASS — no address-bearing keys');
"
```

Any failure → full revert from `before/`, `status: "build_failed"`, and report
the error verbatim.

### 11. Deploy

Hand off to `vercel-deploy`. Then:

```bash
curl -sI "$FINAL_URL/projects.json" | grep -i 'access-control-allow-origin'
```

**Report whether the CORS header landed; do not fail the run if it didn't.**
Phase 1 fetches same-origin and does not need it, and the phase-2 embed path
(`/projects.js`, a `<script src>` that was never subject to CORS) works
regardless. Record the answer so the operator learns the ground truth once.

---

## Rules

- One slug per invocation. Never touch a second site.
- Never write to `astro-templates/**`. Read-only source for back-fills.
- Never overwrite `our-work.astro` / `BaseLayout.astro` / `config.ts` — insert
  between markers, or skip if the markers are already there.
- Never rewrite copy the operator didn't supply. `intro` and `heading` come from
  `our-work.json` or the operator, never invented.
- Never touch pasted CRM or code-injection snippets.
- Never disable Vercel deployment protection.
- The build must exit 0 before anything deploys.

## What NOT to ask about

The skill runs at **at most three interactive turns**: slug confirmation, the
geocode batch gate, and the apply gate — plus one round-trip per Tier-3 failure
if the operator wants to supply coordinates by hand.

Do not ask about: which map provider (Leaflet/OSM, fixed), whether to cluster
pins (no, below ~150), where the section goes (`/our-work`, fixed), whether to
keep the per-service galleries (yes — they do a different job, internal linking
into `/services/{slug}`), or what the popup should say (city, state, month,
photo — fixed by the privacy lock).

## Handoff invariants

On success, all of these hold:

- `npm run build` exited 0
- `dist/projects.json` exists, is a file, and has `"v": 1`
- No intake street address appears in any file under
  `sites/{slug}/src/`, `public/`, or `dist/`
- No address-bearing key exists in any `project_map.projects[]` entry
- `.gitignore` covers `project-map-intake.*`
- The `.site-edit-history/` batch is `deployed` with a populated `deploy` block
- `astro-templates/` is untouched — verify with `git status astro-templates/`
- With `project_map.projects` empty, `dist/our-work/index.html` is
  **byte-identical** to its pre-feature output and ships zero Leaflet bytes

## Rollback

This skill does **not** implement its own rollback. It writes into the shared
`.site-edit-history/`, and `site-edit`'s Mode B walks `log.jsonl` and restores
whatever is in `before/` regardless of which skill wrote the batch:

```
site-edit rollback {slug}
```

One rollback UI, one mental model.

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Every route 404s after deploy | `vercel.json` contains `routes`/`rewrites` | Headers only; delete the file if the header doesn't land |
| Markers 404 / invisible | Someone replaced `L.divIcon` with `L.Icon.Default` | Leaflet resolves default marker images relative to the stylesheet URL. Keep the inline SVG `divIcon`. |
| Map is 0px tall | `aspect-ratio` on `.pm-mapwrap` instead of an explicit height | Leaflet measures the container at init. Keep the pixel height. |
| Popup styling does nothing | Someone moved CSS into an Astro `<style>` block | Astro scopes CSS at build time; Leaflet builds its DOM at runtime and never gets the scope attribute. All styling stays in global `public/project-map.css`. |
| CORS "works" locally, fails in production | `Response` headers are discarded in a static build | Only `curl -sI` against the deployed URL proves anything. |
| Map eats page scroll on mobile | `scrollWheelZoom` enabled at init | Off at init, enabled on first click. |
| Nominatim returns 403/429 | Missing `User-Agent`, or requests too fast | Abort the batch. Do not retry-loop. |
