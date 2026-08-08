# SEO & Agent-Discoverability Baseline

What every generated site ships, why it is built the way it is, and how to check
it after an edit.

Established 2026-08-06, ported from the mylocalads build into both templates.

---

## The design decision

**Every agent-readable artifact is generated from the content collections. None
is hand-written.**

The alternative — writing `llms.txt` once and maintaining it — creates a second
copy of the business's facts. It is correct on day one and wrong the first time
a phone number changes, and nothing surfaces the drift. An LLM that reads a
stale `llms.txt` will quote the old number to a customer with full confidence.
That failure is worse than having no file at all.

So: `src/lib/agent-docs.js` reads the same collections the pages render. One
source, many renderings.

---

## What ships

### Structured data (`BaseLayout.astro`)

- `LocalBusiness` — name, phone, email, address, geo, opening hours, `sameAs`,
  `aggregateRating` when the site has one.
- `WebSite` — linked to the business by `@id`, so a crawler resolves the site
  and the business as one entity instead of two unrelated nodes.
- `BreadcrumbList` — when the page passes breadcrumbs.
- Per-page `jsonLd` prop — `Service` on service pages, `FAQPage` where FAQs
  exist, `AdministrativeArea` on area pages, `BlogPosting` on owl posts.

### Agent documents

| Route | Format | Purpose |
|---|---|---|
| `/llms.txt` | `text/plain` | Short, link-first index (llmstxt.org): H1, blockquote summary, then link lists |
| `/index.md` | `text/markdown` | Long-form mirror — services with full descriptions, areas, hours |
| `agent-site-summary` | inert `<script type="text/markdown">` in `<head>`, homepage only | Fastest correct answer to "what is this business" for an agent parsing the DOM |

`type="text/markdown"` means a browser never executes or renders it, while an
agent reading the DOM finds it immediately.

The summary is homepage-only on purpose. It restates the business; repeating it
on every page is duplicate weight for no gain.

### Head

`canonical`, `robots`, OpenGraph, Twitter card, `content-language`,
`hreflang` (`en-US` + `x-default`), and the per-site code-injection slots.

---

## Why the caps are imported, not restated

`src/lib/limits.ts` owns `SERVICE_LIMIT`, `AREA_LIMIT`, the reserved-slug set,
and the area slug pattern. `getStaticPaths`, the nav components, and
`agent-docs.js` all import from it.

This is not tidiness. Before it existed, `getStaticPaths` built 5 service pages
while the footer linked 6 — every site with six services shipped a nav link to a
page that was never generated. Slicing a collection is always "valid", so no
build error fires. The agent docs would have had the same bug in a worse place:
a 404 handed to an LLM as an authoritative source.

**firefly** caps areas at 5 and resolves them at the flat root (`/denver-co`),
so its reserved-slug list must name every top-level page. **owl** caps at 6 and
nests them under `/service-area/`, so only `index` can collide.

---

## Checklist after any site edit

```bash
cd sites/{slug}
npm run build
cat dist/llms.txt          # firefly: dist/  ·  owl & mylocalads: dist/client/
```

Confirm:

- [ ] Business name, phone, email, address match `src/content/site/config.json`
- [ ] Every service listed is one that actually built a page
- [ ] Every service area listed is one that actually built a page
- [ ] No `undefined` anywhere (a symptom of reading `slug` off `.data` — Astro
      keeps it on the entry, not the data)
- [ ] `/index.md` is linked from `/llms.txt`
- [ ] Homepage has `agent-site-summary`; inner pages do not
- [ ] `robots.txt` and `astro.config.mjs` contain no `REPLACE_SITE_URL`

### Link-resolution check

Catches the failure mode that matters most — an agent doc advertising a URL that
was never built:

```bash
python3 - << 'PY'
import re, os, glob
root = 'dist/client' if os.path.isdir('dist/client') else 'dist'
base = open(f'{root}/llms.txt').read().split('](')[1].split('/')[0:3]
base = '/'.join(base).rstrip('/')
bad = []
for f in (f'{root}/llms.txt', f'{root}/index.md'):
    t = open(f).read()
    for url in set(re.findall(r'\]\(([^)]+)\)', t)) | set(re.findall(r'More: (\S+)', t)):
        if not url.startswith(base):
            continue
        p = url[len(base):] or '/'
        if p.endswith('.md'):
            cands = [root + p]
        else:
            cands = [f'{root}{p.rstrip("/")}/index.html', f'{root}/index.html' if p == '/' else None]
        if not any(c and os.path.exists(c) for c in cands):
            bad.append(p)
print('broken:', bad or 'NONE')
PY
```

A path here can be a false positive if the route is server-rendered rather than
prerendered (owl's `/book` is one). Check `.vercel/output/config.json` for the
route before treating it as a real break.

---

## Not included, and why

- **`google-site-verification`** — needs a per-property token from Search
  Console. Operator-supplied via `code_injection.head`.
- **GA4 / GTM** — needs a per-client measurement ID. Same slot.
- **`Offer` / price schema** — contractor sites rarely publish fixed prices, and
  inventing them in structured data is how sites earn manual penalties. The
  mylocalads site does emit `Offer`, because its prices are real and
  Stripe-backed.
