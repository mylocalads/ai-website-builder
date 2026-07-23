---
name: intake-from-web
description: Discover the client business via Google Business Profile, confirm with the operator, then Firecrawl-scrape the confirmed website + optional socials to auto-populate the intake questionnaire — extracting ONLY brand tokens (fonts, colors, logo) and business context (name, phone, address, hours, services list, testimonials text, team info). Never extracts design/layout patterns.
trigger: "intake-from-web" or "start intake" or "auto intake" or "scrape intake"
---

# Intake From Web

<!--
Pipeline position (this skill is FIRST):

1. intake-from-web       ← this skill: GBP + web → sites/{slug}/intake-scraped.json
2. find-business         ← called by this skill; also a standalone entry point
3. scrape-content        ← optional deeper scrape / Playwright fallback if Firecrawl fails
4. local-research        ← Reddit angles
5. site-audit            ← screenshots of the OLD site for OPERATOR reference only
6. design-reference      ← reference-libraries + intake-scraped brand tokens → design_reference.json
7. site-generate         ← scaffolds Astro site from intake + design_reference
8. vercel-deploy
-->

## What this skill does

Kickstarts the client intake by discovering the business on Google Business Profile, confirming the correct listing with the operator, and then Firecrawl-scraping the confirmed website (plus optional inner pages and social profiles) to auto-populate as much of `docs/client-intake.md` as possible.

Output: `sites/{slug}/intake-scraped.json` — a partially-filled intake payload that mirrors the schema `site-generate` expects (see `astro-template/src/content/config.ts`), plus a per-URL raw archive under `sites/{slug}/raw/` for debugging. The operator then adds the paste-in-only fields (CRM widgets, code-injection blocks, custom domain) and hands the completed intake to `site-generate`.

---

## HARD ANTI-PATTERN LOCK — READ THIS BEFORE ANYTHING ELSE

This skill NEVER extracts, saves, or references the following from the client's existing website:

- **Layout patterns** — grid choices, section rhythm, hero composition, header/nav arrangement, page order, column ratios.
- **Component styles** — button shapes, card treatments, borders, shadows, hover states, transitions, animations, motion.
- **Any CSS beyond `font-family` declarations and color values.** No spacing scales, no radii, no z-index systems, no keyframes.
- **Screenshots as design inspiration.** Screenshots taken by `site-audit` exist for OPERATOR REFERENCE only — they are NOT design DNA and must never seed `design-reference` or `tokens.css`.
- **HTML structure, DOM patterns, or CSS class taxonomies.** Never save selectors, class names, or markup shape.

**The `astro-template/` is the sole source of truth for site design and structure.** The client's existing website is a source of BRAND TOKENS (fonts, colors, logo) and BUSINESS CONTEXT (name, phone, address, hours, services, team, testimonials text) only.

This is not a soft preference. It is a hard rule. If a downstream reader (or a future operator, or a future maintainer of this skill) is tempted to copy the client's existing site layout, the answer is always **no** — use the astro-template. The whole point of the pipeline is that every generated site inherits one strong, tested design; scraping the client's site to mimic it defeats that.

**What this skill IS allowed to extract, exhaustively:**

- Fonts: `font-family` values from CSS custom properties, `body`/`h1`–`h6`/`p` computed styles, or `<link>` tags to Google Fonts.
- Colors: dominant brand hex values from CSS custom properties, computed background/accent styles, or sampled from the logo image.
- Logo: file URL(s) — favicon and any primary logo image found in the header.
- Business name, tagline, phone, email, physical address, geo lat/lng, opening hours.
- Services list — names, short descriptions, long descriptions, sub-services, per-service hero photo + gallery URLs if present.
- Service areas / cities served, with local context sentences if written on the site.
- Testimonials — the reviewer name, location, and TEXT of the review. Never the styling of the testimonial card.
- Team member names, roles, photo URLs, and bios.
- Credentials — licensed / insured / bonded flags detected from badges or footer text; years in business if stated.
- Social profile URLs.
- FAQs — question + answer text pairs.

Everything else is either the operator's paste-in job (§12–§16 of `docs/client-intake.md`) or comes from the astro-template.

---

## Cost rules

Every paid step must be warned in advance and gated by explicit operator approval. State the cost in USD and the exact action about to run.

| Step | Cost | When |
|---|---|---|
| `find-business` (Apify Google Maps) | ~$0.004 per lookup | Step 2 |
| Firecrawl homepage scrape | ~$0.02 | Step 5 |
| Firecrawl inner-page batch (5–10 pages) | ~$0.10–0.20 | Step 7 |
| Each social profile scrape | ~$0.02 | Step 8 |
| **Typical total per run** | **~$0.20–0.35** | |

Never proceed to a paid step without explicit "yes / go / approved" from the operator. If the operator declines a step, log which fields will be left unpopulated and continue with what's available — do not silently skip.

---

## Process (execute in this order — do not reorder)

### 1. Kickoff — one question to the operator

Ask exactly ONE question, no more:

> "What's the client's business name, and (if you already have it) their website URL?"

Accept any of:

- Business name alone (e.g., `Firefly Contractors & Design`) — most common.
- URL alone (e.g., `https://fireflycd.com`) — treat as the disambiguator.
- Both — ideal.

If the operator gave only a URL, do a quick `WebFetch` on the homepage first to extract the business name from `<title>` or the primary `<h1>` before running the GBP lookup. If only a name, proceed directly to Step 2.

Do NOT run a full interactive intake questionnaire. The point of this skill is to REDUCE what the operator has to type. Everything else in `docs/client-intake.md` is what this skill will try to auto-populate.

### 2. Google Business Profile lookup (paid — ~$0.004)

Warn cost, wait for approval, then delegate to the `find-business` skill (see `.agent/skills/find-business/SKILL.md`). Pass the business name + a location if the operator gave one (or the city extracted from the URL homepage `<title>` if it appears there).

If `find-business` is unavailable in this session, replicate its Apify Google Maps call using the pattern documented in that skill (POST to `lukaskrivka~google-maps-with-contact-details`, poll every 8 seconds, cap at 30 polls). Do not invent a new lookup provider.

### 3. Confirmation card (hard stop until confirmed)

Present the GBP hit(s) to the operator in a numbered list, one card per candidate:

```
Found 2 matches:

1. Firefly Contractors & Design
   Address:  1234 Main St, Otis Orchards, WA 99027
   Phone:    (509) 590-4604
   Website:  https://fireflycd.com
   Hours:    Mon-Fri 8am-5pm
   Rating:   4.9 (73 reviews)

2. Firefly Home Services
   Address:  ...
   ...

Is this the right business? [1 / 2 / correct me / abort]
```

Rules:

- If the operator provided a URL in Step 1, auto-prefer the GBP hit whose listed website matches (still show the card for confirmation — never auto-select silently).
- If multiple hits come back (common for franchise names or "&" variations), list them all and ask the operator to pick a number.
- If ONE hit comes back, still confirm — never auto-proceed on a single result.
- If the operator picks "correct me", ask what to correct (name spelling? location? URL?) and re-run Step 2.
- If the operator picks "abort", stop the skill and clean up any partial files.

**Do not spend any Firecrawl budget before the operator confirms.**

### 4. Extract from the confirmed GBP payload

Once confirmed, pull these fields into the intake payload staging area (do not write to disk yet):

- `business_name`
- `phone`, `phone_display` (E.164 for `phone`, as-given for `phone_display`)
- `address.{street, city, state, postal, country}` — parse the GBP address string
- `geo.{lat, lng}` if available in the Apify response
- `hours` — record `{ monday: "8am-5pm", ... }`, omit closed-day keys
- `rating`, `review_count` (as numbers, not strings)
- `social` — any URLs GBP has listed
- `website_url` — the confirmed website URL to scrape in Step 5
- `category` — the GBP primary category (used later for reference-library selection)
- `reviews[]` — up to 5 GBP reviews, mapped to `{ name, text, rating }`

If the operator supplied a URL in Step 1 that DISAGREES with the GBP-listed website, warn:

> "Heads up — you gave https://X but Google lists https://Y for this business. Which should I scrape?"

Let the operator decide. Never scrape both silently.

### 5. Firecrawl the confirmed homepage (paid — ~$0.02)

Warn cost, wait for approval, then Firecrawl-scrape the confirmed website homepage.

Use `firecrawl:firecrawl-scrape` with a full-page markdown + HTML fetch. Save the raw response to `sites/{slug}/raw/homepage.json`.

Extract into the staging payload:

- `tagline` — from `<title>` (strip the business name suffix), meta description, or the primary `<h1>` if it reads as a tagline rather than an SEO H1.
- `email` — first `mailto:` link or plain-text email in the footer.
- `logo_url` — best candidate from the header. Prefer transparent PNG. Fall back order: `<link rel="apple-touch-icon">` → `<img>` inside `<header>` with `alt` containing "logo" or the business name → `<link rel="icon">` (favicon).
- `default_hero_photo` — the largest `<img>` (or CSS background) in the first viewport, IF it looks like a real photograph (not a decorative gradient, not an icon). If unsure, leave null — the operator can supply one.
- `brand.fonts.{display, body}` — from `<link>` tags to Google Fonts, or from `font-family` declarations in inline/external CSS. Prefer the font used on `<h1>` for display and on `<body>`/`<p>` for body. If detected, save the family names as strings (e.g. `"Fraunces"`, `"Inter"`). If not detected, save `null` — `design-reference` handles the fallback (`Fraunces` + `Inter`).
- `brand.colors.{bg, text, accent, muted, surface}` — from CSS custom properties (`--color-*`, `--brand-*`), computed styles on `body` (bg + text), and the accent from the primary button / link / logo. Save all detected candidates in a `brand.colors.candidates[]` array so `design-reference` can choose the highest-contrast set. Do NOT normalize or convert — save as authored (hex, rgb(), hsl()).
- Detected social profile URLs on the homepage — Facebook, Instagram, YouTube, Yelp, LinkedIn, TikTok.
- Initial services list — parse from a nav labeled "Services", a hero services grid, or a `<ul>` under a "What we do" heading. Save as candidates; the operator confirms in Step 6.
- Initial inner-page candidates — hrefs on the same domain to `/about`, `/services`, `/service-areas`, `/contact`, `/team`, `/testimonials`, `/reviews`, `/gallery`, `/our-work`, `/faq`. Deduplicate.

**Extraction ban reminder:** Do NOT save button styles, card styles, section backgrounds, radius/border/shadow values, keyframes, spacing/gap values, or any CSS class names. Fonts and color values only.

### 6. Present detected candidates to the operator

Show a compact card:

```
Homepage scrape complete.

Detected socials:
  Facebook   https://facebook.com/fireflycd
  Instagram  https://instagram.com/firefly.cd
  Yelp       —

Detected inner pages (same domain):
  [ ] /about
  [ ] /services
  [ ] /service-areas
  [ ] /contact
  [ ] /our-work

Estimated cost to scrape all checked inner pages: ~$0.10 (5 pages @ $0.02 each)
Estimated cost per social profile: ~$0.02 each

Which do you want to include? Reply with the paths + socials to scrape, or "all" / "none".
```

Wait for explicit approval. If the operator says "all", warn again with the totalled cost and require a second "yes".

### 7. Firecrawl the approved inner pages (paid — ~$0.02 per page)

For each approved inner page, Firecrawl-scrape and save raw to `sites/{slug}/raw/{path-slug}.json`.

Extract into the staging payload — **same anti-pattern lock applies** — never save layout, never save CSS beyond fonts + colors, never save class names.

Per-page extraction targets:

| Page | Extract into |
|---|---|
| `/about` | `about.story` (2–3 paragraphs of body text), `about_photo` URL if a hero photo exists |
| `/services` | Expand the initial services list — one `{title, short_description, long_description, sub_services[], hero_photo?, gallery[]}` object per service tile / section on the page |
| `/service-areas` (or `/locations`) | `service_areas[]` — `{name, state, state_abbr, slug, local_context?, neighborhoods?}` |
| `/team` (or `/about#team`, `/our-people`) | `team_members[]` — `{name, role, photo, bio?}` |
| `/testimonials` / `/reviews` | Append to `testimonials[]` — `{name, location?, text}` |
| `/gallery` / `/our-work` | `gallery[]` — `{photo, alt, title?, location?, description?}` |
| `/contact` | Fill any missing `phone`, `email`, `address` fields; extract additional social URLs; note GHL/CRM iframe hrefs in a `_detected_crm_snippets` field for the operator to review (do NOT save them as `crm.*` — those must be paste-in from the operator's own GHL account) |
| `/faq` | `faqs[]` — `{q, a}` pairs |

For every service extracted here, tag `_source: "scraped"` so `site-generate` knows which entries came from the web vs. which the operator pasted in.

Refuse to scrape more than 10 inner pages in one run — if the operator wants more, ask them to run this skill again after reviewing the first batch.

### 8. Firecrawl the approved socials (paid — ~$0.02 each)

For each approved social URL, Firecrawl-scrape the profile page and save raw to `sites/{slug}/raw/social-{platform}.json`.

Extract only:

- Additional team member names/photos (Instagram grid where team is tagged, Facebook "about" section for owner names).
- Additional testimonials — for Facebook or Yelp, save reviews as `{name, location?, text, _source: "social:{platform}"}`.
- Brand voice / bio text — save as a `brand_voice_sample` string; `site-generate` may use it to match tone in generated copy, but the astro-template's structural copy stays intact.

**Same anti-pattern lock.** Do not save any styling or layout from social profiles. Do not attempt to mimic the client's Instagram aesthetic in the generated site — the astro-template design wins.

### 9. Aggregate into `sites/{slug}/intake-scraped.json`

Derive the slug from the business name (lowercase, ASCII, hyphens only — mirror `find-business` Step 9). Confirm the slug with the operator only if it collides with a reserved slug or a slug already in `sites/`.

Write the aggregated payload. Shape mirrors the schema `site-generate` consumes (see `astro-template/src/content/config.ts`). At minimum populate the following top-level keys — set to `null` (not empty string) for fields you could not detect, so downstream skills can tell "missing" from "empty":

```jsonc
{
  "slug": "firefly-cd",
  "business_name": "Firefly Contractors & Design",
  "legal_name": null,
  "tagline": "Your Premier Spokane Remodeling Contractor",
  "phone": "+15095904604",
  "phone_display": "(509) 590-4604",
  "email": "office@fireflycd.com",
  "address": {
    "street": "1234 Main St",
    "city": "Otis Orchards",
    "state": "WA",
    "postal": "99027",
    "country": "US"
  },
  "marketing_city": null,           // operator paste-in — defaults to address.city downstream
  "marketing_state": null,
  "geo": { "lat": 47.7, "lng": -117.1 },
  "hours": { "monday": "8am-5pm", "tuesday": "8am-5pm", "wednesday": "8am-5pm", "thursday": "8am-5pm", "friday": "8am-5pm" },
  "rating": 4.9,
  "review_count": 73,
  "licensed": true,                 // true only if the site displays a badge or footer text like "Licensed & Insured"
  "insured": true,
  "bonded": false,
  "years_in_business": null,
  "social": {
    "facebook": "https://facebook.com/fireflycd",
    "instagram": "https://instagram.com/firefly.cd",
    "google_maps": "https://maps.google.com/?cid=..."
  },
  "site_url": "https://fireflycd.com",   // the confirmed URL — vercel-deploy will overwrite in the generated site
  "logo_url": "https://fireflycd.com/wp-content/uploads/logo.png",
  "default_hero_photo": "https://fireflycd.com/wp-content/uploads/hero.jpg",
  "default_hero_video": null,       // operator paste-in
  "about_photo": null,
  "brand": {
    "fonts": { "display": "Fraunces", "body": "Inter" },
    "colors": {
      "bg": "#ffffff",
      "text": "#0f172a",
      "accent": "#00cfd1",
      "muted": "#64748b",
      "surface": "#f5f7fa",
      "candidates": ["#00cfd1", "#0f172a", "#f5f7fa", "#e2e8f0"]
    }
  },
  "services": [
    {
      "title": "Roofing",
      "short_description": "...",
      "long_description": "...",
      "sub_services": ["Roof Replacements", "Roof Repairs", "Roof Inspections"],
      "hero_photo": "https://fireflycd.com/roofing-hero.jpg",
      "gallery": [{ "photo": "...", "alt": "..." }],
      "faqs": [],
      "_source": "scraped"
    }
  ],
  "service_areas": [
    {
      "name": "Spokane",
      "state": "WA",
      "state_abbr": "wa",
      "slug": "spokane-wa",
      "local_context": "Serving Spokane homeowners since 2015.",
      "neighborhoods": ["South Hill", "North Side"],
      "_source": "scraped"
    }
  ],
  "testimonials": [
    { "name": "Sarah M.", "location": "Spokane, WA", "text": "...", "rating": 5, "_source": "gbp" }
  ],
  "team_members": [
    { "name": "Jamie Firefly", "role": "Owner", "photo": "https://...", "bio": "..." }
  ],
  "faqs": [
    { "q": "Do you offer free estimates?", "a": "Yes, we..." }
  ],
  "gallery": [
    { "photo": "https://...", "alt": "Completed kitchen remodel", "title": null, "location": null }
  ],
  "brand_voice_sample": "...",
  "_detected_crm_snippets": {
    "contact_form_iframe_src": null,
    "chat_widget_script_src": null,
    "note": "Detected iframes/scripts on /contact — operator: verify these are the CLIENT's GHL widgets and paste them into intake §12 if so."
  },
  "_notes": {
    "gbp_confirmed": true,
    "pages_scraped": ["/", "/about", "/services", "/service-areas", "/contact"],
    "socials_scraped": ["facebook", "instagram"],
    "generated_at": "YYYY-MM-DD",
    "cost_estimate_usd": 0.24
  }
}
```

**Field-mapping rules:**

- `phone` is normalized to E.164 (`+1` + 10 digits, no spaces). `phone_display` is verbatim from the site.
- `address.state` is 2-letter uppercase; `service_areas[].state_abbr` is 2-letter LOWERCASE (matches the astro-template filename convention).
- `hours` uses lowercase weekday keys; omit closed-day keys entirely (do NOT write `"closed"` strings).
- `licensed` / `insured` / `bonded` are set to `true` ONLY when a badge, footer disclosure, or credentials section explicitly says so. Default to `false` when uncertain — never guess `true`.
- `years_in_business` requires an explicit "Since YYYY" or "N+ years" statement on the site. Do not derive from GBP or infer.
- `service_areas[].slug` MUST match `^[a-z0-9-]+-[a-z]{2}$`. Refuse to write slugs in the reserved set (`about`, `services`, `service-areas`, `contact`, `pricing`, `our-work`, `privacy`, `terms`, `accessibility`, `book`, `404`, `_astro`, `index`, `sitemap-index.xml`, `sitemap-0.xml`, `robots.txt`). If the client's service-area city collides with a reserved slug, flag it for the operator and skip that area.
- Every scraped array entry is tagged with a `_source` field (`"gbp"`, `"scraped"`, `"social:facebook"`, etc.) so `site-generate` can distinguish auto vs. paste-in origin.

### 10. Report table to the operator

Print exactly this table (adjust rows to match what you actually scraped / detected):

```
FIELD                        SOURCE       STATUS
business_name                GBP          ✓ scraped
address                      GBP          ✓ scraped
phone / phone_display        GBP          ✓ scraped
hours                        GBP          ✓ scraped
rating / review_count        GBP          ✓ scraped
logo_url                     homepage     ✓ scraped
tagline                      homepage     ✓ scraped
brand.fonts                  CSS          ✓ scraped (Fraunces + Inter)
brand.colors                 CSS          ✓ scraped (5 candidates)
services (5 detected)        homepage     ✓ scraped
service_areas (3 detected)   /service-areas  ✓ scraped
team_members (3 detected)    /about       ✓ scraped
testimonials (8 detected)    GBP + site   ✓ scraped
faqs (6 detected)            /faq         ✓ scraped
gallery (12 items)           /our-work    ✓ scraped
social (facebook, instagram) homepage     ✓ scraped

default_hero_video           —            ✗ needs paste-in
marketing_city               —            ✗ needs paste-in (or defaults to address.city)
marketing_state              —            ✗ needs paste-in
crm.chat_widget_snippet      —            ✗ needs paste-in (GHL)
crm.reviews_widget_snippet   —            ✗ needs paste-in (GHL)
crm.calendar_embed_snippet   —            ✗ needs paste-in (GHL)
crm.contact_form_snippet     —            ✗ needs paste-in (GHL)
crm.call_tracking_snippet    —            ✗ needs paste-in (GHL)
code_injection.head          —            ✗ needs paste-in (Meta Pixel / GTM)
code_injection.body_end      —            ✗ needs paste-in (analytics / tracking)
custom_domain                —            ✗ needs paste-in (operator/client)

Total spent this run: ~$0.24
Written: sites/firefly-cd/intake-scraped.json
Raw archive: sites/firefly-cd/raw/

Next: continue to `design-reference` and then `site-generate`. Before `site-generate` runs,
add the remaining paste-in fields to intake-scraped.json — see docs/client-intake.md §12–§16.
```

Guide the operator: paste-in fields go into the same `intake-scraped.json` file (or the operator can also fill `docs/client-intake.md` and hand both to `site-generate`).

---

## Failure modes

Handle each explicitly. Never silently fail.

- **GBP returns no match.** Tell the operator, ask them to provide the website URL directly (if not already given in Step 1), then skip Steps 3–4. Warn: "Without GBP, I can't auto-populate address, hours, rating, or geo — you'll need to add those manually to intake-scraped.json." Continue to Step 5 with the URL the operator provides.
- **Multiple GBP matches (>1).** List them all in Step 3 and let the operator pick. If the operator provided a URL in Step 1, note which match's website URL agrees ("row 2 matches your URL"), but still require the operator to confirm the number.
- **Confirmation rejected in Step 3.** Ask the operator to correct the business name / location / URL, then re-run Step 2. Never scrape without confirmation.
- **Operator declines a paid step.** Skip it, note in the report which fields will be left null, and continue. Do not retry silently.
- **Website 404s or blocks Firecrawl.** Warn the operator, suggest running `scrape-content` (Playwright fallback) and re-invoking this skill with `--from-scraped` (reads from `sites/{slug}/scraped_content.json` instead of live Firecrawl). If the operator declines, write out the payload with only the GBP-derived fields populated.
- **Firecrawl succeeds but returns empty content** (JS-heavy SPA that Firecrawl can't render). Same fallback: suggest `scrape-content` with Playwright.
- **No fonts detected.** Set `brand.fonts` to `null`. `design-reference` handles the fallback (`Fraunces` display + `Inter` body — the template default).
- **Colors detected but low contrast** (bg and text too close, or accent fails WCAG AA against the bg). Save all detected colors in `brand.colors.candidates[]` and note the contrast concern in `_notes.warnings[]`; `design-reference` chooses the best combination.
- **Service-area slug collides with a reserved slug.** Skip that area, flag it to the operator, ask if they want to rename it (e.g., `services` city → `services-city-st` variant) or drop it.
- **Detected CRM/tracking script src URLs.** Save under `_detected_crm_snippets` for operator review, but NEVER copy them into `crm.*` — those must be the OPERATOR's GHL account snippets, not the client's existing vendor's.

---

## Rules

- Never write to `astro-template/`. Structural / template changes happen through a separate workflow, not this skill.
- Never save CSS beyond `font-family` values and color values. No spacing, no radii, no shadows, no borders, no animations, no class names, no selectors.
- Never save layout or component patterns from the scraped site. See the anti-pattern lock at the top.
- Never save screenshots of the scraped site as design inspiration. Screenshots are the operator's reference material from `site-audit`, nothing more.
- Always confirm business identity in Step 3 before running the paid Firecrawl batch in Step 5.
- Always confirm each social URL individually in Step 6 before scraping it.
- Save every raw Firecrawl response under `sites/{slug}/raw/` for debugging. The operator-facing artifact is the aggregated `intake-scraped.json`.
- Write markdown and JSON files with LF line endings.
- Do NOT invent values. Every detected field must trace to a real source (GBP payload, homepage HTML/CSS, inner-page HTML/CSS, or social profile HTML). If a field can't be traced, save `null` — the operator will fill it in.
- Do NOT run a full interactive intake. Ask ONE question in Step 1; every other prompt in this skill is confirmation of a specific detected value or approval of a specific paid step.
- Do NOT synthesize CRM widget URLs, GHL loader scripts, or code-injection blocks. Those are paste-only from the operator during `site-generate`.
- Do NOT scrape more than 10 inner pages or more than 4 social profiles in a single run without asking the operator a second time.

---

## What NOT to ask about

Do not run an interactive questionnaire. The paste-in fields (`docs/client-intake.md` §12–§16 — CRM widgets, code injection, custom domain, per-page overrides) are the operator's job to add later. This skill exists to REDUCE what the operator types, not to REPLACE the operator's paste-in step.

The only prompts allowed in this skill are:

1. Step 1 — the single kickoff question.
2. Step 3 — GBP confirmation.
3. Step 5 — Firecrawl homepage approval (cost warning).
4. Step 6 — inner-page + social selection (cost warning).
5. Step 4 — URL disagreement resolution (if GBP-listed URL differs from operator-supplied URL).
6. Step 9 — slug collision resolution (only if the derived slug already exists in `sites/`).

Every other detected field is either populated from a real source or left `null`. Never ask the operator to type a value this skill could have detected from the web.

---

## Handoff invariants

At the end of a successful run, all of the following must be true:

- `sites/{slug}/intake-scraped.json` exists and is valid JSON.
- Every array field is either populated with real data (with `_source` tags) or is an empty array — never contains fabricated entries.
- Every scalar field is either detected from a real source or is explicitly `null`.
- `sites/{slug}/raw/` contains one file per URL that was successfully scraped (homepage + any inner pages + any socials).
- The `_notes.pages_scraped` and `_notes.socials_scraped` arrays reflect exactly what was fetched.
- No CSS beyond fonts + color values appears anywhere in the output.
- No layout / component / class / selector data appears anywhere in the output.
- No `crm.*` fields are auto-populated (they remain paste-only for the operator).
- The `_notes.cost_estimate_usd` reflects the actual paid steps that ran.

If any invariant fails, the skill has not completed — do not report success.
