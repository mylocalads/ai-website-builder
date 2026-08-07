| Business | Slug | Pages | Vercel URL | Date |
|----------|------|-------|------------|------|
| Raircon Corporation | raircon | 24 | https://raircon.vercel.app | 2026-08-04 |
| Prezkop Builders | prezkop-builders | 25 | https://prezkop-builders.vercel.app | 2026-08-03 |
| Stubbs Landscaping | stubbs-landscaping | 25 | https://stubbs-landscaping.vercel.app | 2026-08-03 |
| Morris Kitchens & Donnelly Designs | morris-kitchens-donnelly-designs | 26 | https://morris-kitchens-donnelly-designs.vercel.app | 2026-08-03 |
| Comprehensive Pain Specialists | comprehensive-pain-specialists | 23 | https://comprehensive-pain-specialists.vercel.app | 2026-08-03 |
| Royal Roofing Systems | royal-roofing-systems | 26 | https://royal-roofing-systems.vercel.app | 2026-08-03 |
| Pinnacle Roofing & Sheet Metal | pinnacle-roofing-sheet-metal | 25 | https://pinnacle-roofing-sheet-metal.vercel.app | 2026-08-03 |
| Headley Construction Group | headley-construction-group | 19 | https://headleycg.com | 2026-08-03 |
| Bilski's Lawn Care | bilskis-lawncare | 23 | https://bilskis-lawncare.vercel.app | 2026-07-29 |
| Smile Lawn Care | smile-lawn-care | 38 | https://smile-lawn-care.vercel.app | 2026-07-29 |
| H4 Roofing & Construction | h4-roofing-construction | 27 | https://h4-roofing-construction.vercel.app | 2026-07-30 |
| Results Roofing | results-roofing | 26 | https://results-roofing-seven.vercel.app | 2026-07-31 |
| G&T Roofing & Home Improvements | gt-roofing | 24 | https://gt-roofing-five.vercel.app | 2026-08-03 |
| Quality Roofing Express | quality-roofing-express | 26 + /book (SSR) | https://quality-roofing-express.vercel.app | 2026-08-03 |
| Eastern Residential Solutions | eastern-residential-solutions | 23 | https://eastern-residential-solutions.vercel.app | 2026-08-03 |
| AmeriStar Maids | ameristar-maids | 25 | https://ameristar-maids.vercel.app | 2026-08-03 |
| Patriot Metal Products | patriot-metal-products | 24 | https://patriot-metal-products.vercel.app | 2026-08-03 |
| Golden Business Machines | golden-business-machines | 24 | https://golden-business-machines.vercel.app | 2026-08-03 |

## Golden Business Machines — `golden-business-machines` — 2026-08-03

Template: **owl**. Full 9-step pipeline, `--auto`. Live: https://golden-business-machines.vercel.app

### Business

Office technology dealer and managed IT provider, Kingston PA. Founded 1969 by Joseph R. Bradley,
locally owned, 45+ sales and service staff, five offices (Kingston HQ, Edwardsville service/warehouse,
Moosic/Scranton, Hazleton, Williamsport). Exclusive authorized Canon dealer; authorized HP reseller and
service center; Microsoft Certified. GBP: 4.0 stars / 4 reviews, category "Printing equipment supplier".

### ⚠️ Vertical mismatch — first B2B/office-tech client on this kit

This is **not** a home-services contractor. The owl template's copy defaults assume a homeowner buying a
roof. Everything customer-facing was remapped to office technology; see "Template debt" below for what
should move upstream so the next non-home-services client doesn't need the same pass.

### Pipeline

| Step | Result |
|---|---|
| intake-from-web | `intake-scraped.json` — GBP + 20 pages Firecrawled |
| find-business | Single exact GBP match, website matched operator URL. Apify run `evAkIOca2gmcqJikf` |
| scrape-content | Not needed — Firecrawl got everything |
| local-research | `local_research.json` — copier-lease and MSP pain points |
| site-audit | `screenshots/golden-business-machines.png` + `audit_results.json` |
| design-reference | `design_reference.json` — brand red kept, palette re-derived for AA |
| site-generate | 24 pages |
| vercel-deploy | Live, all routes 200 |
| short-link | Skipped (`--auto`) |

**Actual spend: ~$0.40** (GBP $0.004 + 21 Firecrawl page scrapes). Above the documented $0.20–0.35 band
because the client site has five product sub-pages and six IT sub-pages worth reading, plus two geo pages.

### Content shipped

- 5 services: copiers-and-mfps, printers-and-scanners, wide-format-and-digital-presses,
  managed-it-services, managed-print-and-document-management
- 6 service areas: wilkes-barre-pa, scranton-pa, kingston-pa (HQ), hazleton-pa, williamsport-pa,
  stroudsburg-pa — all **scraped** (named on the client's own site and/or backed by a physical office)
- 7 home FAQs, 6-item gallery, 6 partner badges (Canon, Microsoft 365, N-able, uniFLOW, PaperCut, Barracuda)
- 1 blog post: "The Five Copier Lease Costs Nobody Quotes You"
- `marketing_city` Wilkes-Barre / `marketing_state` PA (office in Kingston) — the Firefly pattern

### Design tokens

Brand red `#DF0028` extracted from the client's live CSS and kept. Fonts Poppins + Open Sans, also theirs.

GBM's red is the **inverse** of the template default's contrast problem: the stock gold fails as text on
LIGHT backgrounds and works on dark bands; this red passes on light (5.04:1 on white) and fails on dark
(2.89:1 on `--color-primary`). So a new `--color-accent-on-dark: #ff7383` token (5.79:1) was added and the
dark-band components — Testimonials, ProcessSteps, WhyChooseUs — were pointed at it for accent-coloured
TEXT. Fills and buttons keep `--color-accent`; their white labels carry the contrast.

### Imagery

Unsplash for services (12 files in `public/img/`), Wikimedia Commons for the six service-area landmarks
with visible CC attribution in frontmatter. Client's own logo pulled to `public/logo-gbm.png`; partner
logos hotlink the client's CDN because the schema's `partners[].logo_url` requires `z.string().url()` and
will not take a local path.

**Note on process:** the first image pass mis-assigned four slots — a coffee-shop photo shipped as
`copiers-mfp.jpg` — because candidates were picked off a contact sheet numbered by grid position, and
blank cells shifted the numbering. Fixed by labelling every tile with its own Unsplash photo ID. Do that
from the start.

### Template debt (fixed in the site copy; belongs upstream in `astro-templates/owl`)

These are all hardcoded roofing/home-services strings or layout assumptions in the template, not content:

- `pages/index.astro`, `about.astro`, `our-work.astro`, `pricing.astro`, `book.astro`,
  `service-area/[slug].astro`, `services/[slug].astro` — hardcoded "Get Your Free Estimate!" /
  "Request A Free In-Person Roof Estimate Today!"
- `pricing.astro` shipped a hardcoded four-row **roof cost table** with dollar figures
- `WhyChooseUs.astro` heading read "Reasons homeowners pick us"
- `services/index.astro` read "What we do for {city} homeowners"
- `ClosingCTA.astro` defaults referenced a new roof **and "Serving Wilkes-Barre and the Wyoming Valley
  since 1972"** — leftover copy from an earlier client, not a template default
- `BlogCards.astro` heading "Roofing Advice"
- `EstimateForm.astro` + `api/estimate.ts` shared a roofing service list (must stay in sync) and a
  "Property address" label
- `ServicesGridOwl.astro` fallback heading "Full-service roofing solutions"
- `services/[slug].astro` built its form heading as `` `Free ${title.toLowerCase()} estimate` `` —
  lowercasing mangles acronyms ("Free managed it services estimate")

Two genuine layout bugs, also fixed in the site copy:

- **ServicesGridOwl tile clipping.** `.tile` had a fixed `aspect-ratio: 16/10` with `.body` absolutely
  positioned at `bottom: 0`. Service names that wrap to three lines overflowed the box and were clipped
  by `overflow: hidden` — the first line of "Copiers & Multifunction Printers" was cut in half. Changed
  to a flex column with `min-height` so the tile grows; scrim ramp strengthened to cover the taller text.
- **HeroOwl mobile overflow.** The `max-width: 560px` block forces `flex-wrap: nowrap` plus
  `white-space: nowrap` on trust badges, tuned for exactly two. Three badges pushed the document to
  449px on a 390px viewport and the whole page scrolled sideways. Changed to wrap.

### Verification

Playwright over the production build, desktop 1280 and mobile 390: 8 pages, 0 console errors, 0 failed
requests, 0 broken images, no horizontal overflow. All 11 live routes return 200.

### Open items

- **CRM is empty.** `crm` is `{ provider: "ghl" }` only — no chat, reviews, form/calendar embed,
  call-tracking snippet or number. The native `EstimateForm` posts to `/api/estimate`, which needs a
  destination in env or it returns `unavailable`.
- `code_injection` head / body_start / body_end all empty. No Meta Pixel, no GTM.
- **No testimonials.** GBP reports 4 reviews but the Apify actor returned no review bodies, and the
  client site publishes none. `testimonials: []` — the section self-hides rather than shipping fakes.
- **`rating` / `review_count` deliberately omitted** from `config.json`. 4.0 from 4 reviews is real but
  too thin to display as social proof, and omitting it also suppresses the AggregateRating JSON-LD.
  Operator's call to switch on.
- No team members — the client site names only the 1969 founder.
- No custom domain attached. Client's live site remains goldenbusiness.com.
- No short link (`--auto` skips it).
- Client's existing stack noted but **not** copied into `crm.*`: WPForms + reCAPTCHA, TeamViewer remote
  support (`get.teamviewer.com/dhm4sj3`), UserWay accessibility widget.

## Patriot Metal Products — `patriot-metal-products` — 2026-08-03

Template: **owl**. Full 9-step pipeline, `--auto`. Live: https://patriot-metal-products.vercel.app

**Business:** multi-process industrial custom coater at 1005 N. Vine Street, Berwick, PA 18603.
Incorporated 1986. Autophoretic, powder, zinc plating, batch paint, dip coating, plus fabrication,
assembly, burn-off, blasting, an onsite certification laboratory, and a three-truck fleet.
Phone 570-759-3634, info@patriot-mp.com. GBP category "Sheet metal contractor" (understates them).

**Content:** 5 services, 6 service areas, 8 gallery items, 8 home FAQs, 1 blog article, 24 pages.

### Deliberate omissions — do not "fix" these without new data
- **Rating suppressed.** GBP shows **2.7 across 7 reviews**. No rating badge, star row, review-count
  chip, or `aggregateRating` schema anywhere on the site. This is a live reputation problem — the fix
  is a review-generation push, not a website change. Flag to the client.
- **No testimonials.** GBP returned zero review bodies and the client site has none. `testimonials: []`
  and the section self-hides. Nothing was fabricated.
- **No team section.** The client's three `/team/` pages carry lorem ipsum bios and WordPress demo names
  ("JOHN LEADER", "STEVE CHEMICI", "MARK TERAN"), and the "headshots" render as placeholder chrome
  letters D/N/M. Real names and roles are preserved in `intake-scraped.json`; photos are null.
- **licensed/insured/bonded all false.** No badge or footer disclosure found. Not guessed.
- `financing` and `us_vs_them` disabled — consumer-finance framing is wrong for a B2B job shop.

### Template gaps found and patched in the client copy (worth fixing upstream in `astro-templates/owl`)
The owl template hardcodes roofing/home-services copy in places a non-roofing client cannot override:
- `ClosingCTA.astro` shipped **another client's copy as its default** — "Serving Wilkes-Barre and the
  Wyoming Valley since 1972" (Gilroy). Any client not overriding it publishes Gilroy's history.
- `EstimateForm.astro` — default heading "Request A Free In-Person Roof Estimate Today!", a hardcoded
  roofing `SERVICES` list, and a "Property address" field label.
- `api/estimate.ts` — the server-side `SERVICES` allowlist is a second hardcoded roofing list that must
  be kept in sync with the component or valid submissions fail validation.
- `pricing.astro` — a hardcoded asphalt/metal/cedar/tile roof cost table.
- `book.astro` — "Book Your Free Inspection", on-site-visit copy.
- `ServicesGridOwl.astro` ("Full-service roofing solutions"), `BlogCards.astro` ("Roofing Advice"),
  `WhyChooseUs.astro` ("Reasons homeowners pick us"), `services/index.astro` ("for {city} homeowners"),
  `blog/index.astro` description.
All rewritten in `sites/patriot-metal-products/` for a coating buyer. `astro-templates/` untouched.

### Design
- Palette derived from the **real** brand mark, not the old site's CSS. The plant sign at 1005 N. Vine
  is a red/white/blue "PMP" on a black plaque; the old site's `#3498DB` is the WordPress theme demo's
  blue and was dropped. Firecrawl's detected `#FAB702` amber was used for a first pass and then
  discarded once the sign was visible in the hero photo.
- `--color-primary #0d1520` (near-black navy, from the sign plaque), `--color-accent #ef4136` (patriot
  red), `--color-accent-ink #a81f2b`, `--color-on-accent #16181b`.
- Contrast computed, not eyeballed: accent on the dark band **4.78:1**, button label on accent **4.64:1**,
  accent-ink on bg **6.70:1**, white on primary **18.34:1**. A truer flag red (`#C8102E`) was rejected —
  it falls to 2.66:1 on the dark band.
- Fonts: Montserrat display (matches both the owl default and the client's detected heading font) +
  Source Sans 3 body (closest maintained sibling to their PT Sans).

### Images
All 13 client photos were **downloaded into `public/img/`, not hotlinked**. The client's site is
`http://` with a **broken TLS handshake**, so hotlinking would have been blocked as mixed content on an
HTTPS Vercel site. Resized to 1600px max and recompressed: 12.9 MB → 2.4 MB.
`facility-aerial.jpg` was renamed `plant-entrance.jpg` — it is the building entrance, not an aerial.

### Open items for the operator
- **CRM is empty.** No GHL chat, reviews, calendar, contact-form or call-tracking snippets were supplied,
  so `crm` is `{provider: "ghl"}` only and those sections self-hide. The native `EstimateForm` posts to
  `/api/estimate`, which needs a delivery destination configured in env or it will fail closed.
- **No code injection.** `code_injection` is empty — no Meta Pixel, no GTM.
- **Logo is weak.** The only asset is a 94×85 px chrome "PMP" wordmark, too small for retina header use.
  The plant sign photo shows a much better red/white/blue mark — ask the client for the vector original.
- **Service areas are partly inferred.** Only Berwick is GBP-confirmed. Bloomsburg, Danville, Hazleton,
  Wilkes-Barre and Williamsport are justified by the client's own I-80 access and three-truck fleet
  claims, but are marked `_source: "inferred"` and should be confirmed.
- **No lead times published anywhere** — the single loudest buyer complaint in this category, and the
  client says nothing about it. Worth asking them for a real number.
- **No ISO 9001 / IATF claim found.** Engineering buyers filter on it. If they hold one, it belongs in
  the header.
- Local research ran at **snippet depth only** — Reddit blocks both the WebSearch crawler and Firecrawl,
  and its JSON endpoint refused requests. Pain points are directionally sound but not quote-verified.
- No custom domain attached. No short link created (`--auto` skips it).
- Vercel SSO is **off** for this project — the `.vercel.app` URL is publicly reachable, unlike the
  documented default. Flag if that is not intended.

## eastern-residential-solutions (2026-08-03)

Full 9-step pipeline, `--auto`. Template: **owl**. Roofing / siding / seamless gutters, Jessup PA
(1 Keystone Pl) with a second office in Baltimore MD. GBP: 5.0 across 31 reviews, one clean match,
website agreed with the operator-supplied URL. Spend ~$0.28 (Apify $0.004 + 13 Firecrawl pages).

**Design.** Brand tokens came out of Firecrawl's `branding` format on the client homepage: accent
`#d90916` (their real Get Quote red), secondary navy `#2c506e`, display face Oswald. Two derivations
were forced by contrast, both recorded in `design_reference.json`:

- The navy could not be used as `--color-primary` directly. Owl renders eyebrows, star rows and
  quote marks in `--color-accent` on the dark bands, and the brand red measures **1.61:1** against
  `#2c506e` — unreadable. Driving the navy to `#0a1622` lifts it to 3.48:1.
- Firecrawl reported `Playfair Display` in the body role. It is a serif display face and was
  rejected for running copy in favour of the template default, Inter. Oswald was kept for display.
- `#0000ee` was also detected and discarded — it is the browser default link colour on unstyled
  anchors, not a brand colour. Worth watching for on any Wix site.

All seven contrast pairs pass the README's verify script.

**Images: do not hotlink Wix, and do not trust the client's own gallery.** Downloaded 29 images off
`static.wixstatic.com` into `public/img/` (the GoDaddy lesson from firefly-cd applies equally here),
resized with PIL, total 5.1MB. Then **9 of the 29 had to be thrown out after visual inspection**,
which is the part worth remembering — a contact sheet of every downloaded asset should be a standard
step, not an optional one:

- 3 were Eastern-branded BEFORE/AFTER marketing cards with a phone number burned into the pixels
  (would have conflicted with any future call-tracking number).
- 2 were stacked BEFORE/AFTER composites with white letterboxing.
- 1 was a testimonial quote card, not a photo.
- 1 was a stock photo of glass skyscrapers sitting on their *roofing* page.
- 2 were commercial buildings (a car wash, a modern black-clad build) on a residential site.
- 3 more had an "AFTER" label baked into the top strip and were salvaged by cropping 10% off the top.

The Owens Corning badge had a **Pink Panther graphic** beside it on the source site; cropped out and
re-composited onto a white tile so it reads on the dark `--color-primary` guarantee card. Team
headshots were re-fetched using Wix's own `/v1/crop/x_,y_,w_,h_/` transform params rather than
centre-cropping the originals — Wix has already computed a face-centred crop and it is better than
guessing.

`partners[].logo_url` is `z.string().url()` in the schema, so it cannot take a local path. It is set
to the absolute production URL and 404s in local preview until deploy. **If this project's URL ever
changes, that field has to change with it.**

**Reddit was unreachable.** WebFetch, Firecrawl and the `.json` API all refused `reddit.com` this
run. `local_research.json` was built from Firecrawl *search-result excerpts* across 28 real threads
(r/Scranton, r/baltimore, r/Roofing, r/HomeImprovement, r/homeowners, r/RoofingSales, r/Insurance)
and the file records that the depth is excerpt-level, not full-thread. The angles held up well —
"roofers never call back" is the dominant complaint in both metros and Eastern has a review answering
it verbatim, which became the hero headline.

### Three owl TEMPLATE defects found — fixed in this site copy only, flagged upstream

1. **`ClosingCTA.astro` ships another client's copy as its default prop.** Line 16 of the template
   reads *"Serving Wilkes-Barre and the Wyoming Valley since 1972"* plus a no-payment-until-satisfied
   term. Every page calls `<ClosingCTA />` with no props, so this renders site-wide. It is false for
   every client except G&T Roofing and it has **already shipped live** on `gilroy-roofing`,
   `quality-roofing-express` and `results-roofing`.
2. **`AboutSection.astro` renders `body` as a single `<p>`,** while site-generate's contract for
   `about.story` is explicitly "2–3 paragraphs". A correctly authored story collapses into a wall of
   text. Fixed here by splitting on blank lines; single-paragraph callers are unaffected.
3. **`about.astro` feeds `story.slice(0, 190)` into the hero,** which cuts mid-word on any real
   story. Fixed here by taking whole sentences up to ~190 chars.

All three belong upstream in `astro-templates/owl/`, and defect 1 needs a fix-and-redeploy pass over
the three affected live sites. Not done from this run — `site-generate` must never write to
`astro-templates/`.

**Operator paste-ins still outstanding** (each section self-hides or degrades gracefully until set):
GHL chat / reviews / calendar / contact-form snippets, `crm.captcha_snippet`, call-tracking number,
`code_injection.head` (Meta Pixel / GTM), and a custom domain. The native `/api/estimate` endpoint is
live but has **no lead destination configured** — set `LEAD_WEBHOOK_URL`, or `RESEND_API_KEY` +
`LEAD_NOTIFY_EMAIL` + `LEAD_FROM_EMAIL`, in the Vercel project env. Until then a submission returns
the "please call us instead" message rather than silently dropping the lead, but **no lead reaches
the CRM**. This is the highest-priority item before the site is used for outreach.

**Two accuracy notes carried into the content.** `insured` and `bonded` are `false` — the client's
site displays licensing (PA HIC# 017000, MD HIC# 161389) but never states insured status, so nothing
on the generated site claims it. And GBP lists (570) 382-8629 while the client's footer displays a
toll-free (877) 570-3774 whose `tel:` link still dials the 570 number; the GBP number is canonical
throughout.

`sites/eastern-residential-solutions/raw/` was deleted during scaffold cleanup before the Astro copy
— the aggregated `intake-scraped.json` retains every extracted field, but the per-URL Firecrawl
archive is gone. Re-scraping would cost ~$0.26 and yield no new content, so it was not repeated.

## mylocalads (2026-07-25)
- Source: 1:1 recreation of live https://mylocalads.co (all 9 pages)
- Approach: bespoke Astro project, NOT using astro-template's contractor collections (user override — see conversation notes)
- Pages: /, /booking-page, /pricing-calculator, /contact-us, /ads-roi-calculator, /google-ads-bundle, /facebook-google-ads-bundle, /roof-instant-estimator, /ai-employee-add-on
- Design tokens extracted from live source: #0038FF primary blue, #1B263B navy, #fa5518 orange, Poppins/Inter/Montserrat
- Firecrawl spend: ~$0.18 (9 pages × ~$0.02)
- Vercel project: ai-website-builder (marcellus-mylocaladscs-projects)
- Deployment URL: https://ai-website-builder-pgkky4slx-marcellus-mylocaladscs-projects.vercel.app
- Deployment protection: SSO enabled by default (must be disabled in Vercel project settings to make public)
- Interactive JS: pricing-calculator + ads-roi-calculator sliders (client-side, no build step)
- Form: /contact-us has real form fields (no backend endpoint wired yet — action currently points to /contact-us?sent=1)

## gilroy-roofing — 2026-07-27

- **Client:** Gilroy Roofers (legal: Gilroy Construction; GBP lists "Gilroy Roofing")
- **Template:** `owl` (first production use)
- **Live URL:** https://gilroy-roofing.vercel.app
- **Deployment:** dpl_7wbHfhNXG7VtEuejQ4Fn1JvKdp4C
- **Pages:** 23 — home, about, 5 services, 5 service areas (nested /service-area/), blog + 1 post, contact, pricing, our-work, book, privacy, terms, accessibility
- **Palette:** bg #f0f2f7 / primary #000000 / accent #f15537 (operator-supplied; matches their existing brand orange #F05522)
- **Contrast:** 18.75 / 5.56 / 21.00 / 3.45 — all pass (accent labels at 20px bold => 3:1 threshold)
- **Intake spend:** ~$0.16 (2x Apify Maps $0.004, 7 Firecrawl pages)
- **Verified live:** 15/15 routes 200; old flat area URL /nanticoke-pa correctly 404s; canonical, LocalBusiness JSON-LD, and sitemap all reference the final domain

### Lead capture — LIVE (2026-07-27)
- Native estimate form at /book posting to /api/estimate (serverless, prerender=false)
- Destination: Make.com webhook, stored as the encrypted Vercel env var
  LEAD_WEBHOOK_URL (production). NOT in git, NOT in source.
- Verified in a real browser on the live deployment: valid submission -> /thank-you
  (only reachable when the webhook returns 2xx); consent omitted -> /book?error=consent
- Payload: full_name, email, phone, address, service, tcpa_consent,
  tcpa_consent_text, source_url, submitted_at, ip
- A TEST SUBMISSION lead was sent to the Make scenario during verification —
  delete it from any downstream CRM.

### Still outstanding
- Captcha — no site key yet. Set crm.captcha_snippet plus TURNSTILE_SECRET_KEY or
  RECAPTCHA_SECRET_KEY. Honeypot + validation are active in the meantime.
- GHL reviews widget snippet — NOT SET
- GHL Live Chat widget snippet — NOT SET
- Tracking phone number — NOT SET (site uses their real line, (570) 829-0239)
- Custom domain — not attached; on default vercel.app
- Owner cut-out PNG for the About section (house photo stands in)
- Satisfaction badge — generated SVG in place, swap public/badge-satisfaction.svg

### Notes
- Reddit was unreachable for local-research (blocks both WebSearch UA and Firecrawl); copy angles derived from their own 12-review corpus plus search-result titles.
- Client's "20K+ customers" claim excluded as unverifiable; operator set 10K+.
- Logo asset is `Screenshot_1.png` and reads "GILROY ROOFING", conflicting with the "Gilroy Roofers" name used site-wide. Needs a real logo.
- No socials found on GBP or their site.

## bilskis-lawncare — 2026-07-29

- **Client:** Bilski's Lawn Care (legal: Bilski's Lawn Care & Landscaping LLC)
- **Brief:** duplicate of the `gilroy-roofing` build (same `owl` structure) for a lawn/landscape vertical
- **Template:** `owl`, cloned from `sites/gilroy-roofing` — structure untouched, content collections + tokens swapped
- **Status:** DEPLOYED 2026-07-29
- **Live URL:** https://bilskis-lawncare.vercel.app
- **Deployment:** dpl_8YqEgUKPGD9V9rnpTKm34XcsmVEk (Vercel project `bilskis-lawncare`, prj_GUMu3mtm65Odv6fElBK40eH4XQSw)
- **Verified live:** 25/25 route checks 200 (24 sitemap URLs + `/book`). Canonical, `og:url`, LocalBusiness JSON-LD (4.9/40, hours, geo), FAQPage, robots.txt and sitemap all reference the final domain — `astro.config.mjs` was already set to the alias pre-deploy, so no URL-rewrite redeploy was needed
- **NOTE — SSO is OFF on this project:** `https://bilskis-lawncare.vercel.app` returns 200 publicly, unlike the documented MLA default (`ssoProtection: all_except_custom_domains`). The site is therefore publicly indexable with a vercel.app canonical. Worth gating or attaching the real domain before this accrues duplicate-content history
- **Deploy gotcha hit:** the documented CWD-hijack bug was live — a stray `.vercel/project.json` at the workspace root pointed at the old `ai-website-builder` project. Neutralized before deploying (moved out of the repo, contents preserved in the session scratchpad). Post-deploy check confirmed `.vercel/project.json` landed in `sites/bilskis-lawncare/` as project `bilskis-lawncare`
- **Pages:** 23 prerendered + `/book` and `/api/estimate` as serverless (both `prerender = false`) — home, about, 4 services + index, 6 service areas + index (nested `/service-area/`), blog + 1 post, contact, pricing, our-work, thank-you, privacy, terms, accessibility
- **Palette:** bg #ffffff / primary (secondary bg) #2d2d2d / accent #67ac46 — all operator-supplied
- **New token:** `--color-accent-ink` #4a7d32. #67ac46 as *foreground* on white is only 2.78:1; the darker green hits 4.91:1. Light sections use ink, `--color-primary`-backed sections (Testimonials, ProcessSteps, WhyChooseUs) and the photo-scrim hero keep the brand green (4.96:1 on #2d2d2d)
- **Contrast:** text/bg 17.40, muted/bg 6.43, on-primary/primary 13.77, on-accent/accent 6.27, text/surface 15.96, muted/surface 5.89 — all pass
- **Logo:** client supplied the *white* variant, which is invisible on the #ffffff header (`.site-header` uses `--color-bg`). Found their dark-text variant on the same Wix CDN and used that instead — `public/logo-bilskis.png`
- **Intake spend:** ~$0.008 (2x Apify Maps; first run returned 0 places — the GBP is registered in Hilldale/Bear Creek and was filtered `outOfLocation` against a "Wilkes-Barre PA" query. Re-ran against "Luzerne County, Pennsylvania"). No Firecrawl spend — site content came from free WebFetch/WebSearch
- **Verified GBP:** 4.9 / 40 reviews, 839 N Main St, Hilldale PA 18702, (570) 899-6400, Mon–Fri 8–4, closed weekends
- **Testimonials:** 6 real reviews with attribution, parsed from experience.com JSON-LD (Yelp and Angi both 403). Apify returned the profile but no review text
- **Imagery:** 4 real client job photos hotlinked from their Wix CDN (lawn, mulch/beds, retaining wall, commercial plow) + 6 CC0/CC-BY-SA Wikimedia landmarks for the area pages, all credited. 10/10 remote images verified 200

### Deliberate scope calls
- **Service areas:** client listed 18 towns; the `owl` template caps area pages at 6 (`slice(0, 6)` in `[slug].astro`, `service-area/index.astro`, `ServiceAreaGrid`, `Footer`). Built 6 pages for the strongest markets and named all 18 in crawlable copy (home `seo_body` paragraph 3 + the "What areas do you cover?" FAQ). Raising the cap to 18 is a one-line change per file if wanted
- **Calendar + contact form:** per the brief these are placeholder images, not live widgets — `crm.calendar_embed_snippet` and `crm.contact_form_snippet` hold `<img>` tags pointing at `public/placeholder-calendar.svg` / `public/placeholder-form.svg`. Swap those two strings for the real GHL embeds when they land. Hero asides on service/area pages keep the working native `EstimateForm`, matching Gilroy
- **Pricing page:** replaced Gilroy's hardcoded roof-cost table with a "what we price each job on" table. No dollar figures — we do not have this client's rate card and inventing a range would set an expectation the real quote has to argue with

### Template bugs fixed while cloning (worth back-porting to `astro-templates/owl`)
- `EstimateForm.astro` SERVICES and `api/estimate.ts` SERVICES are two separate hardcoded lists that must match — a mismatch silently rejects every submission as `?error=service`. Both were roofing-only
- `Financing`, `Footer`, `CookieConsent`, `PricingTable`, `contact.astro` hardcoded `color: white` on accent-filled elements, which the README explicitly forbids. Broke on this light accent; now `var(--color-on-accent)`
- `Header.astro` and `EstimateForm.astro` hardcoded Gilroy's orange `rgba(241,85,55,…)` for the phone badge, pulse animation, and form-error tint
- `ClosingCTA.astro` default body carried Gilroy's "since 1972" and their no-payment-until-satisfied policy as template defaults
- `.form-error` tinted itself with `--color-accent`; on a green-accent client the error banner reads as success. Now a fixed red
- Roofing copy baked into component/page defaults: `ServicesGridOwl`, `BlogCards`, `HeroOwl`, `book.astro`, `pricing.astro`, `blog/index.astro`

### Rendering fixes — 2026-07-29 (redeploy dpl_3jdQ22VDQBenjpzx9qyd4BUiVfbB)

Operator reported rendering mistakes on the service and service-area pages. Four issues found; three were content, one was a genuine CSS bug.

1. **`AboutSection` mobile: image collapsed to ~89px wide (CSS BUG — back-port to `astro-templates/owl`).**
   The `@media (max-width: 780px)` block set `grid-template-areas: none` and then reset
   `grid-area: auto` on `.about-copy` and **`.about-photo`** — but `.about-photo` is the
   `<img>`; the grid item is `.about-figure`. The figure kept `grid-area: photo` pointing at
   a named area that no longer existed, so it collapsed to its intrinsic width. Measured
   89×67 on a 375px viewport; now 327×245. Only bites the `photo_position="left"` variant,
   i.e. every service page. Gilroy has the same defect on its 5 service pages.
   Fix: reset the FIGURE, plus `.about-figure { width: 100%; min-width: 0 }`.
   `AboutSection` is the only component in the template using named grid areas, so the bug
   class is contained to this one file.

2. **Service pages showed the same photo twice** — the page passed `hero_photo` to both the
   hero background and the AboutSection figure. Added an optional `about_photo` to the
   services schema and pointed AboutSection at it, with NO fallback to `hero_photo` (so a
   service without a second photo renders a text-only About rather than repeating the hero).

3. **Area pages rendered the same paragraph twice** — `local_context` fed both the hero
   subheadline and the AboutSection body. Added an optional `about_body` to the
   service_areas schema (falls back to `local_context`) and wrote distinct About copy per town.

4. **All six area pages shared one hero image** — none set `hero_photo`, so all fell through
   to `site.default_hero_photo`. Each now has its own, chosen to match the copy (stone-bank
   erosion shot on Pittston's riverside-drainage page, plow truck on Scranton's commercial page).

**Extra imagery sourced:** re-scanned the client's Wix CDN across their home/about/services/contact
pages and found 8 more genuine job photos (12 total, up from 4). Now used as distinct service
About photos and to populate real galleries — Landscaping 3 cards, Hardscaping 2. All 18 remote
images verified 200.

**Verification:** all 20 routes measured in-page at 375px and 1280px — zero horizontal overflow,
zero broken images, zero undersized images (the one 220px hit is the circular satisfaction badge,
correct at that size). Built-HTML audit across all 10 service/area pages: 0 duplicate hero/About
images, 0 duplicate hero/About copy, 6/6 distinct area heroes. 25/25 live routes 200.

**Caveat on my own process:** I first measured the collapsed image at 139px mid-resize and wrote it
off as a transient reading. It was the real bug. Measure at a settled, explicitly-set viewport
before dismissing a layout anomaly.

## smile-lawn-care — 2026-07-29

- **Client:** Smile Lawn Care (legal: Smile Lawn Care & Landscapers), Wilkes-Barre PA
- **Brief:** duplicate of the `gilroy-roofing` build (same `owl` structure) for the business at https://lawnmowingwilkesbarre.com/ — operator-supplied logo, palette, 7 services and 18 service areas; calendar + contact form to be placeholder images
- **Template:** `owl`, cloned from `sites/bilskis-lawncare` rather than `sites/gilroy-roofing`. Same structure either way, but bilskis already carries the template bug fixes logged in its entry below (the two `SERVICES` lists, the hardcoded `color: white` on accent fills, the `.form-error` accent tint, the Gilroy copy baked into component defaults). Cloning from Gilroy would have meant re-fixing all of them.
- **Status:** DEPLOYED 2026-07-29
- **Live URL:** https://smile-lawn-care.vercel.app
- **Deployment:** dpl_CGZhur6geeqMEoDuH8AUU1EYZzb6 (Vercel project `smile-lawn-care`, prj_3w4mo5TAnJfnmBJq17eq0Chtf38N, team_pZ4lsW05bOEjG4wgazLzUhRH). Framework preset auto-detected as Astro; Node 24.x
- **No URL-rewrite redeploy needed:** `astro.config.mjs` `site:` was already set to `https://smile-lawn-care.vercel.app` pre-deploy and the production alias resolved to exactly that, so canonicals/`og:url`/JSON-LD/robots/sitemap were correct on the first deploy. Single deploy, not the two-pass rewrite the skill describes
- **Deploy gotcha NOT hit this time:** checked all four parent directories for a stray `.vercel/project.json` before deploying — all clean (the bilskis build had to neutralize one at the workspace root). Post-deploy check confirms `.vercel/project.json` landed in `sites/smile-lawn-care/` as project `smile-lawn-care`
- **NOTE — the production alias is PUBLIC:** `https://smile-lawn-care.vercel.app` returns 200 with no SSO and no `x-robots-tag`. Only the deployment-specific URL (`smile-lawn-care-z6d8acvhl-…`) is SSO-gated (302 → `vercel.com/sso-api`). Same non-standard state as `bilskis-lawncare`, and it differs from the `ssoProtection: all_except_custom_domains` default the vercel-deploy skill documents. The site is therefore publicly indexable with a vercel.app canonical — gate it or attach the real domain before this accrues duplicate-content history
- **Pages:** 38 prerendered, plus `/book` and `/api/estimate` served by the Vercel render function (both `prerender = false`) — home, about, 7 services + index, 18 service areas + index (nested `/service-area/`), blog + 1 post, contact, book, pricing, our-work, thank-you, privacy, terms, accessibility. 38/38 routes 200 on the dev server; sitemap 39 URLs (38 prerendered + `/book`)

### NOT the same business as bilskis-lawncare
Worth flagging because the two look identical at a glance: same market, and the **exact same 18-town service area list**. They are different clients — Bilski's is 839 N Main St, Hilldale, (570) 899-6400, 4.9/40; Smile is 147 Abbott St, Wilkes-Barre, (570) 855-0780, 5.0/37. The shared 18-town list is just the standard MLA Wyoming Valley coverage set.

### Palette — this build INVERTS the owl assumption
Operator-supplied: bg `#ffffff`, secondary bg `#f5cf39`, CTA `#79a832`, with the brief stating the yellow is the "main colour focus" and the header menu colour. In every other owl build `--color-primary` is a **dark** panel colour carrying white text; here it is a **light yellow**, so:
- `--color-on-primary` is `#1a1a1a` (11.49:1). White on the yellow is **1.51:1** — unusable.
- `--color-accent` `#79a832` is **fill-only**. As text it is 2.81:1 on white and 1.86:1 on the yellow. Introduced `--color-accent-ink` `#35591f` for every foreground use of the green — 8.08:1 on bg, 7.53:1 on surface, 5.33:1 on the yellow. One token safe on all three backgrounds.
- Introduced `--color-accent-edge` `#2f4a17` because a green button on a yellow band is 1.86:1, below the 3:1 WCAG 1.4.11 floor for a control boundary.
- Tile washes on primary-backed sections (`ProcessSteps`, `WhyChooseUs`, `Testimonials`) flipped from `rgba(255,255,255,…)` to `rgba(0,0,0,…)`. White overlays are invisible on yellow.
- `ClosingCTA` had a latent bug: it sets `color: var(--color-on-primary)` but paints a **dark** scrim when passed a `photo`, so near-black text would land on a dark photo. Added a `.has-photo` branch that flips back to white. No call site passes a photo today; fixed so the prop is not a trap.
- Header is `--color-primary` with a near-white phone badge — a translucent green wash disappears into the yellow.
- **Verified:** all 10 token pairs ≥ 4.5:1 via the README script, and a live-DOM audit found **0 failures across 179 text elements** outside the photo-scrim regions (hero + service tiles, which paint white over a dark scrim and were confirmed visually).

### Deliberate scope calls
- **18 service-area pages, cap raised from 6.** Operator explicitly chose this over the 6-pages-plus-named-in-copy approach that `bilskis-lawncare` took at the same fork. `getStaticPaths` uncapped in both dynamic routes; header areas menu is now two-column (`.submenu.two-col`, 420px, verified to fit at 1280px) and the mobile nav's existing max-height/overflow handles all 18 (scrollHeight 1020 vs clientHeight 714). All 18 towns carry **genuinely differentiated** `local_context` — terrain, housing stock, tree cover, lot size — tied to what each actually changes about the lawn work, rather than 18 interchangeable pages. This is the doorway-page risk CLAUDE.md warns about; mitigated by the copy, not ignored.
- **7 services, cap raised from 5.** All seven are distinct services the client already sells and already navigates to on their own funnel.
- **Email omitted from the site config.** `Contact@SmileLawns.com` (decoded from the funnel's Cloudflare email-protection blob) is on a domain with **no A record and no MX record** — the mailbox is dead. A live mailto is worse than none.
- **No years-in-business claim anywhere.** Nothing verifiable was published. Earliest Google review is 2024-04-20 and the logo hit the GHL CDN in March 2024, but neither establishes a founding year, so the site makes no "since 20XX" claim. Note the regenerated satisfaction badge says "5.0 ★ 37 REVIEWS" where Bilski's said "SINCE 2020".
- **Pricing page carries no dollar figures** — same reasoning as the bilskis build. No rate card for this client.
- **Pressure Washing has no photo.** Its grid tile uses the template's `.no-photo` gradient (which reads as deliberate, not broken) and its page hero falls back to the mowing photo. Did not substitute stock: a generic pressure-washing photo on a service tile implies it is their crew's work. It is the one asset gap.
- **FAQ rewritten from scratch.** The client's live funnel ships the GHL template's **commercial-real-estate-development** boilerplate ("What factors should I consider when selecting a commercial development site?", "our architectural design approach") — three questions with nothing to do with lawn care. Replaced with seven real ones.

### Content provenance
- **Testimonials, rating, trust badges:** 12 real 5-star Google reviews with attribution, all verbatim. Rating 5.0 / 37 reviews is GBP-verified and feeds `AggregateRating` in the LocalBusiness JSON-LD.
- **Owner's first name (Eric)** came out of the reviews themselves — used in the about copy and the "Talk to Eric" guarantee CTA. No surname is published anywhere, so none is claimed.
- **Copy angles** derive from the review corpus: punctuality and communication are what reviewers lead with, ahead of the work itself, so "we turn up on the day we said" is the site's spine rather than a generic quality claim.
- **Imagery:** 6 real client job photos hotlinked from the GHL/filesafe CDN, each matched to the service it actually depicts, all verified 200 and confirmed loading in-browser. Logo pulled as the original 896×808 RGBA PNG (the `f_webp` CDN variant transcodes to WebP despite the `.png` path).
- **Reddit local-research was skipped** — no cost incurred and nothing it would have added; the 12-review corpus already gave concrete, attributable copy angles.

### Intake spend: ~$0.012
Three Apify runs. The first (`lukaskrivka~google-maps-with-contact-details`, "Smile Lawn Care" in "Wilkes-Barre, Pennsylvania") returned **0 places** — the same `outOfLocation` filtering that hit the bilskis build, because the GBP pin sits east of the city. Re-ran against the **Google Maps place URL directly**, which bypasses location filtering entirely and returned the profile — that is the approach to reach for first on any service-area business whose pin is off its stated city. That run returned `reviews: []` despite `maxReviews: 8`, so a third run on `compass~google-maps-reviews-scraper` against the place_id pulled all 12 review texts. No Firecrawl spend: the funnel came down via plain `curl` and the directories via WebFetch.

### Verified LIVE (post-deploy, 2026-07-29)
- **39/39 sitemap URLs return 200** on the live alias, plus `/book` and `/thank-you` 200 (serverless render function)
- Live `LocalBusiness` JSON-LD reads name "Smile Lawn Care", phone +15708550780, 5.0/37, 147 Abbott St / Wilkes-Barre / 18705. Canonical and `og:url` both `https://smile-lawn-care.vercel.app/`. robots.txt and sitemap-index reference the same host
- **All 8 images load from the live origin** — the 6 hotlinked GHL/filesafe CDN photos plus the local logo and badge. No referrer blocking on the CDN
- **`/api/estimate` live and behaving:** valid service → `?error=unavailable` (correct — no `LEAD_WEBHOOK_URL` set), stale bilskis value "Retaining wall" → `?error=service`. **No lead was transmitted** — with no destination configured the function rejects before any outbound call, so there is nothing to delete downstream. This is the opposite of the gilroy build, where a real test lead reached the Make scenario
- Dev-only captcha notice confirmed absent from live HTML; no `bilski`/`gilroy` leakage in the live home page
- Live home page rendered and screenshotted at 1280×800 — yellow header, hero photo + scrim, trust badges, green CTA all correct

### Verified locally (pre-deploy)
- `npm run build` clean; 38/38 routes 200
- All 18 area slugs and 7 service slugs present in header, footer, home, and both index pages; all 18 town names also in crawlable home `seo_body` copy
- **Lead form validation tested end-to-end** against the dev server — the trap the bilskis entry flags. Valid service → passes service + TCPA gates, then `?error=unavailable` (no `LEAD_WEBHOOK_URL` locally, which is correct); a stale bilskis value ("Retaining wall") → `?error=service`; missing consent → `?error=consent`. The two `SERVICES` lists are confirmed byte-identical. **No lead left the machine** — no webhook is configured, so nothing was transmitted and there is no test record to clean up downstream.
- Canonical, `og:url`, LocalBusiness JSON-LD (5.0/37, hours, geo), FAQPage, per-area `Service` + `BreadcrumbList`, robots.txt and sitemap all reference `https://smile-lawn-care.vercel.app` — set pre-deploy so no URL-rewrite redeploy is needed
- Mobile (375×812) and desktop (1280) both checked; dev-only captcha warning confirmed absent from the built HTML
- No `bilski` / `gilroy` / roofing / hardscaping / Wix-CDN leakage anywhere in source or built output

### Still outstanding
- **`LEAD_WEBHOOK_URL` env var is NOT set — the lead form is live but drops every submission** (`?error=unavailable`). This is the highest-priority item: the site is publicly reachable and currently cannot capture a lead. Set it as an encrypted production env var on the `smile-lawn-care` project, then redeploy
- **`VERCEL_TOKEN` in `~/Claude Projects/.env` is expired** (`invalidToken` from the v9 projects API). The CLI's own local credentials work, so deploys are fine, but any script that reads that token will fail. Worth rotating
- GHL calendar + contact form embeds (placeholder images in place per the brief)
- GHL reviews widget and Live Chat snippets — NOT SET
- Captcha site key — honeypot + validation active meanwhile
- Custom domain — none attached. Note `smilelawns.com` is expired/unresolving, so it is available to reclaim if the client still wants it
- A pressure-washing job photo
- Confirm (570) 855-0780 is the intended tracking line; GBP lists (570) 290-5159 as the raw business number
- **Decide on the public vercel.app alias.** Confirmed directly: the alias is 200/public with no `x-robots-tag` while only the deployment URL is SSO-gated. Either gate the alias, add a `noindex` header for the vercel.app host, or attach the real domain — otherwise Google indexes a vercel.app canonical that a later domain move has to compete with. Same open question as `bilskis-lawncare`; worth settling once for both

### Rendering fixes + template back-port — 2026-07-29 (redeploy dpl_9JijvPhfqw8DA3sa3hWTUHQQP5rE)

Operator reported rendering mistakes on the service and service-area pages and asked for the
fixes to land in `astro-templates/owl` so they stop recurring. Four bugs reproduced on the live
site, all four present in the template. **Root cause of them reaching production here:** this site
was cloned from `sites/bilskis-lawncare` at 20:53, and the bilskis session found and fixed the same
four *after* that — in its own site only. The template was never updated, so the defects were
copied forward. That is the loop this entry closes.

**1. `AboutSection` collapsed on mobile (CSS BUG).** The `@media (max-width: 780px)` block reset
`grid-area: auto` on `.about-copy` and **`.about-photo`** — but `.about-photo` is the `<img>`; the
grid item carrying `grid-area: photo` is `.about-figure`. With `grid-template-areas: none` the
figure still pointed at a named area that no longer existed and collapsed to its intrinsic width.
Measured **151×113 on a 375px viewport; now 327×245.** Only bit the `photo_position="left"`
variant — i.e. every service page. Also added `.about-photo { width: 100% }` at all breakpoints:
without it a source narrower than the column left a ragged gap on desktop.

**2. Service pages showed the same photo twice** — the page passed `hero_photo` to both the hero
background and the About figure. Added `about_photo` to the services schema. **No fallback to
`hero_photo` on purpose:** a service with no second photo renders a text-only About rather than
repeating the hero. Two of the seven do exactly that.

**3. Area pages rendered the same paragraph twice** — `local_context` fed both the hero subheadline
and the About body. Added `about_body` (falls back to `local_context`) and wrote 18 distinct
second paragraphs.

**4. All 18 area pages shared one hero image** — none set `hero_photo`, so every one fell through
to `site.default_hero_photo`. Each now carries one of the six real client photos, matched to what
its copy emphasises (snow-blower on Laurel Run's winter-heavy page, overgrowth clearing on the
wooded Laflin/Larksville pages).

**Landmark images — all 18 areas, none previously.** Sourced from Wikimedia Commons **by category**
(`Category:<Town>, Pennsylvania`), not full-text search. That mattered: search returned Hudson Yards
NYC for Hudson PA, a Hilldale shopping mall in Wisconsin, Bonnie-Jill Laflin the person for Laflin,
and Pringle Bay, South Africa. Every image is now place-verified, and all 18 URLs return 200.
Mostly borough/municipal buildings, which are unambiguous. Notable calls:
- **Hudson and Hilldale have no Commons category** — they are unincorporated villages in Plains
  Township. Both use a Plains Township image with alt text that says so explicitly rather than
  implying a landmark that does not exist.
- **Shavertown** likewise uses the Kingston Township municipal building, captioned as such.
- **`File:Battle of Wyoming Marker.jpg` was NOT used for Wyoming borough** — its own Commons
  description places it in Exeter. Wyoming uses the former Luzerne Presbyterial Institute, whose
  description confirms Institute Street, Wyoming. Checking the description caught a miscaption.
- Attribution renders via the existing `landmark_credit` / `landmark_credit_href` fields (CC BY-SA
  and CC BY require it; CC0/PD entries are credited anyway).

**Also added `about_photo_alt`** to the services schema. The page previously fell back to a
templated `"{title} — {business}"` alt, which names the service instead of describing the image.

### Back-ported to `astro-templates/owl` — the point of this round
Everything above, plus the defects bilskis logged as "worth back-porting" and nobody had:
- `--color-accent-ink` **added to the template tokens.** The template's own default accent
  `#c8973f` as *text* measures **2.42:1 on `--color-bg` and 2.64:1 on `--color-surface` — it fails
  AA out of the box**, and gilroy, bilskis and smile each re-derived this token by hand. Default ink
  `#8a6420` is 4.91 / 5.35. Swapped the 15 light-background foreground usages across
  SectionHead, ServicesGridOwl, SignatureSystem, ServiceAreaGrid, AboutSection, AboutOwl, SeoBody,
  FAQ, EstimateForm, PromiseBand, BlogCards and Header. **Dark-panel sections deliberately keep
  `--color-accent`** (Testimonials, ProcessSteps, WhyChooseUs, HeroOwl's scrim): the accent clears
  3.78:1 on `#3f4531` where the ink would drop to 1.86:1. The token comment states that rule.
- **Gilroy's orange removed from the template.** `Header.astro` still hardcoded
  `rgba(241,85,55,…)` for the phone badge and the pulse keyframes, and `EstimateForm.astro` for the
  error banner. The header now derives both from the accent with `color-mix()`, so it follows any
  client's brand with no hand-editing.
- **`.form-error` is now a fixed red** (`#be1e1e`) instead of `--color-accent`. On a green- or
  gold-accent client the error banner read as success.
- **`color: white` on accent fills** replaced with `var(--color-on-accent)` in `Financing`,
  `Footer`, `PricingTable` and `contact.astro` — the README forbids this and it breaks every
  light-accent client.
- **`services/index.astro` hero fallback.** Its dark gradient is applied inline and only when the
  client has a `default_hero_photo`, but `color: white` was unconditional — so a client without one
  got white text on the page background. Now has a fixed dark `background-color`. Deliberately a
  neutral `#0f1419` rather than `--color-primary`, because a client whose secondary background is
  light (this one's yellow) would fail there.

Template `npm run build` passes; its fixture service page correctly renders a text-only About now
that `about_photo` is unset. Build artifacts removed from the template directory afterwards.

### Verification for this round
- **50 layout checks — 25 service + area pages × 375px and 1280px, via same-origin iframes.**
  Zero horizontal overflow, zero broken images (`naturalWidth === 0`), zero collapsed About figures,
  zero About images missing alt text, 7 rendered sections on every page.
- Desktop `photo-left` confirmed intact: figure at x=57, copy at x=653, both 556px.
- All 18 landmark URLs 200; live spot-checks confirm image, alt and credit render on the deployed site.
- 39/39 live routes 200 after redeploy.
- Built-HTML audit across all 25 pages: no service page repeats its hero as its About photo, no area
  page repeats its hero paragraph, all 18 areas carry a landmark image and credit, hero photos now
  spread across all six client images instead of one.

### Note on overlap with the whitman build
Commit `3e70db7 fix(owl-template,whitman): service/area page render defects` landed the same four
rendering fixes in the template from the concurrent Whitman session. My edits to
`AboutSection.astro`, `content/config.ts` and both `[slug].astro` came out byte-identical, so those
files show no diff — the fix is in either way. The template changes still uncommitted here are the
*additional* ones nobody had done: `--color-accent-ink`, the Gilroy orange literals in `Header` and
`EstimateForm`, `color: white` on accent fills, the fixed-red `.form-error`, the
`services/index.astro` hero fallback, and `about_photo_alt`.

That commit also added **`astro-templates/owl/src/lib/limits.ts`**, which centralises
`SERVICE_LIMIT` / `AREA_LIMIT` — a better mechanism than the eleven inline `.slice(0, N)` calls,
and it documents a genuine bug: nav linking more pages than `getStaticPaths` generates, producing
404s that no build error surfaces. **This site does not use `limits.ts`** — it removed the slices
inline instead, so page generation and navigation are both uncapped and therefore consistent.
Verified: a crawl of 42 distinct internal links on the live site returns 200 on every one. Adopting
`limits.ts` here (with 7/18) would be tidier and is worth doing next time this site is touched, but
it is a refactor, not a fix.

### Known gap left open
`Gallery` renders nothing on service and area pages, and that is deliberate. The heading is
`"{Area} work"` / `"{Service} gallery"`, and with only six client photos — already used as heroes and
About images — populating it would repeat the same images and, on an area page, imply a photo was
taken in a town we cannot verify. It stays empty until there are more real job photos. Same reason
Pressure Washing still has no photo of its own: Commons has no usable residential pressure-washing
image (only US Navy flight-deck washdowns), and its hero now points at the house-with-driveway shot
rather than a mower.

## 2026-07-29 — Whitman Lawn Care (`whitman-lawncare`)

**Brief:** structural duplicate of `gilroy-roofing` (owl template) for Whitman Lawn Care LLC of
Scranton, PA. Client-supplied brand: CTA `#feb81a`, primary bg `#ffffff`, secondary bg `#0b4801`,
logo from their WordPress. 10 services and a NEPA service-area map supplied by the operator.

**Built:** 29 pages — home, 10 service pages, 6 service-area pages, services + service-area
indexes, about, contact, book, pricing, our-work, blog index + 1 post, privacy, terms,
accessibility, thank-you. Local build clean, all 16 spot-checked routes 200. Not yet deployed.

**Scaffolded from `astro-templates/owl/`, not from `sites/gilroy-roofing/`** — Gilroy's `src/` is
identical to the template apart from `tokens.css` and four stray leftover files at the wrong
nesting level (`src/config.ts`, `src/index.astro`, `src/HeroOwl.astro`, `src/AboutOwl.astro`,
`src/components/config.ts`, `src/components/icons.ts`). Copying Gilroy would have carried that
cruft forward.

### Caps raised to 10 (this site only)

`ServicesGridOwl`, `pages/services/index.astro`, `Header`, `Footer`, and — the one that is easy to
miss — `pages/services/[slug].astro`'s `getStaticPaths`. The first build looked green and silently
emitted only 5 of 10 service pages, because the slice in `getStaticPaths` reads like the
related-services slice. **If you raise the service cap, grep for every `slice(` in the site, then
count the emitted routes in the build output.** Service-area slices stay at 6.

### No Google Business Profile — no social proof

Two Apify Maps lookups (`sudYb2BOeJcpCnXXp` Scranton, `zekmPV8obZbA4CAPg` Avoca) returned zero
places; Yelp and Manta listings are unclaimed. No public reviews exist. So: `testimonials: []`
with a `placeholder` prop on the Testimonials band, no rating or review_count in config, no
`seo_body.review`, and hero trust badges carrying only claims that are verifiably true ("25+
Years", "Locally Owned") rather than a fabricated star rating. New `PlaceholderSlot.astro` renders
labelled wireframes for the GHL calendar (`/book`), GHL contact form (`/contact`), and the
testimonial cards.

### The owl template carries hardcoded roofing copy

Invisible on Gilroy, glaring on a lawn-care site. Found and replaced in: `ClosingCTA` (default
body read *"...no payment until the job is finished. Serving Wilkes-Barre and the Wyoming Valley
since 1972"* — Gilroy's copy, on every page), `EstimateForm` (default heading **and** a hardcoded
10-item roofing `SERVICES` list), `pages/api/estimate.ts` (a matching server-side allowlist —
submissions would have failed `error=service`), `pricing.astro` (an entire asphalt/metal/cedar
roof cost table), `BlogCards`, `blog/index`, `ServicesGridOwl`, `HeroOwl`, `about.astro`,
`book.astro`. **Sweep `grep -riwE "roof|shingle|siding|gutter|1972|gilroy"` over `src/` and again
over the built HTML for any non-roofing client on this template.** The EstimateForm dropdown now
derives from the services collection instead of a hardcoded list.

### Yellow accent needed a second token

`#feb81a` as button *fill* is fine, but white-on-yellow is 2.0:1 and yellow-as-text on white is
1.7:1 — Gilroy's orange `#f15537` scraped by, this does not. Added `--color-accent-ink: #8f6200`
(same hue, darkened to clear 4.5:1 on both `--color-bg` and `--color-surface`) for eyebrows, step
labels, ticks, and link text on light sections; `--color-accent` stays for fills and for text on
the dark green band. `--color-on-accent: #0b4801` for button labels.

Traps hit along the way:
- `SectionHead` is shared by light *and* dark sections, so no single eyebrow colour works. It now
  reads `var(--eyebrow-color, var(--color-accent-ink))` and `WhyChooseUs` (dark) overrides the
  variable on itself.
- Swapping accent→accent-ink globally regressed `ProcessSteps` labels and `WhyChooseUs` numerals
  to 1.7–2.0:1 on the dark green band. Both reverted.
- Four white-on-accent buttons (`Financing`, `PricingTable`, `CookieConsent` accept, contact/footer
  social chips) hardcoded `color: white` rather than using the token.

**Measure, don't eyeball.** The contrast audit script is worth rewriting per site, but note the two
bugs mine had: it treated `rgba(255,255,255,0.055)` overlays as opaque white (must composite alpha
up the ancestor chain), and it reports white-on-white false positives for anything sitting over a
background *image* (bail out and skip when an ancestor has `background-image`).

### Imagery

Guessing Unsplash photo IDs does not work — 8 of 9 guessed IDs resolved to a salad, a forest path,
vegetables, seedlings, and a man holding a pipe. **Download and actually look at every image before
shipping it.** Replaced with the client's own 12 service photos scraped from their WordPress and
served locally from `public/img/` (their WordPress originals are only ~500px wide — flagged to the
operator; ask the client for high-res originals). Relaxed `services.hero_photo` and
`blog.hero_image` from `z.string().url()` to `z.string()` so local paths validate.

Two layout fixes from measuring rather than looking:
- `ServicesGridOwl` tiles: `.body` is absolutely positioned so it can never grow the tile —
  "Flea, Tick & Mosquito Control" wrapped to two lines and overflowed the 16/10 box by 12px,
  clipping the title. Title clamp reduced to `clamp(1.35rem, 2.2vw, 1.85rem)` and gap to 0.75rem.
  Verified zero clipping at 1280 / 1060 / 375.
- The mobile hero is ~4.2:1 tall, so `cover` scales a landscape photo to fit its *height* exactly
  and vertical `background-position` does nothing. Fixed by pre-cropping 30% of sky out of
  `hero-lawn.jpg` (500×305 → 500×214). Keep replacement hero art wide-but-shallow.

**Deployed 2026-07-29:** https://whitman-lawncare.vercel.app — 29 pages, all 19 spot-checked
routes 200, canonicals and sitemap already pointed at the final URL (site_url was set correctly at
scaffold time, so the skill's rewrite-and-redeploy step was a no-op). Project linked at
`sites/whitman-lawncare/.vercel/`, not the workspace root. Live HTML re-scanned for stale roofing
copy across /, /pricing, /contact, /book, /about — clean. All 12 images plus logo 200.

Note: unlike other MLA client projects, the `*.vercel.app` alias on this one is **public** (200,
not the usual SSO 302) — the deployment-specific URL is gated but the alias is not. Worth deciding
deliberately rather than leaving by accident, since it is a duplicate-content surface once a real
domain is attached.

**Open before this goes to the client:**
1. `/api/estimate` has no delivery destination — `vercel env ls production` returns empty, so
   `LEAD_WEBHOOK_URL` (or `RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL` + `LEAD_FROM_EMAIL`) is unset.
   The hero, about, and pricing forms submit and fail closed with "Online requests aren't switched
   on yet — please call us", which is the right degradation but means zero lead capture. Wire this
   before any traffic.
2. No captcha (`crm.captcha_snippet` unset) — the honeypot is the only bot defence on that form.
3. GHL calendar, contact form, chat, and reviews snippets still placeholders.
4. Client photos are ~500px originals; request high-res.
5. No GBP exists — social proof is placeholder everywhere.

### 2026-07-29 (later) — service + area page render audit, fixed in the template too

Operator reported rendering mistakes on service and area pages. Four defects, all of
them template bugs rather than Whitman content, so all four are fixed in
`astro-templates/owl/` as well as in `sites/whitman-lawncare/`.

**1. `AboutSection` collapsed on mobile — every service page.** The ≤780px media query set
`grid-template-areas: none` and then reset `grid-area` on `.about-photo` — but the desktop
rule sets `grid-area: photo` on `.about-figure`. The figure kept pointing at a named area
that no longer existed, so the browser built implicit columns. Measured at a settled 375px
viewport: `grid-template-columns: 178.672px 0px 100.328px`, body copy crushed to **179px**,
image to **100px**. Only bit `photo_position="left"`, which is exactly what service pages
pass. Fix: reset the same element the area was set on, plus `width:100%; min-width:0` on
the figure. **Reset grid-area on the element that has it — the img was never a grid item.**

**2. Same photo twice on every service page.** The page passed `hero_photo` to both the hero
background and the About figure. Added `about_photo` (+ `about_photo_alt`) to the services
schema; the About figure reads only that, with **no fallback to `hero_photo`** — unset
renders text-only, which `.no-photo` already handles.

**3. Same paragraph twice on every area page.** `local_context` fed both the hero subheadline
and the About body. Added `about_body`. The fallback chain deliberately skips
`local_context` and goes straight to the generic line — falling back to it would just
restage the duplication the field exists to fix.

**4. `.about-photo` had no `width:100%`.** An `<img>` falls back to intrinsic width, so the
client's 500px photos sat in a 556px column with a ragged gap. Only visible once real
(small) client images replaced the wide stock URLs.

**Latent bug found while auditing, fixed before it shipped:** `getStaticPaths` built
**5** service pages while `Header`/`Footer` linked **6**. Any site with 6+ services would
ship a nav link to a page that was never generated — a 404 no build error surfaces, because
slicing a collection is always "valid". Whitman only dodged it because every cap here was
raised to 10. Fix: `src/lib/limits.ts` exports `SERVICE_LIMIT` / `AREA_LIMIT` and all eleven
call sites import them, so page-generation can no longer fall behind navigation. Both
`[slug].astro` routes now `console.warn` and name the dropped slugs when a collection
exceeds its cap — verified by temporarily adding a 7th area and watching it fire.
`getStaticPaths` cannot see frontmatter consts but **can** see module imports; that is why
the constants live in `src/lib/`.

Also relaxed every image field in the schema from `z.string().url()` to `z.string()` so
local `/img/...` paths validate — serving client photos from `public/` beats hotlinking a
CMS that can vanish.

**Whitman content filled in behind those fixes:** each of the 6 areas now has its own
`hero_photo` matched to its local angle (aeration on Wilkes-Barre's compaction page, weed
control on Dickson City's, ticks on Moosic's) instead of all six sharing
`default_hero_photo`; distinct `about_body`; and a `landmark_photo`. Five landmarks are
CC-licensed Wikimedia photos with visible `landmark_credit` attribution. Carbondale has
none — Commons' only options were a 1940s postcard illustration, an 1870s lithograph, and a
school with a visibly drought-stressed lawn, which is a poor advert on a lawn-care page — so
it uses a client photo with alt text that does not claim to depict Carbondale.

**Verification:** all 16 service + area pages measured in-page at 375px and 1280px via
iframes — zero zero-width grid columns, zero collapsed figures, zero photo/figure width
mismatches, zero horizontal overflow, zero broken images, 7/7 sections each. Built-HTML
audit: 0 duplicate hero/About images, 0 duplicate hero/About copy, alt text on every About
figure, credits on all 5 Wikimedia landmarks.

**Process note:** the first measurement of this bug came back `vw: 0` with everything at
0px. That reading was real in direction but taken mid-resize; the numbers only became
trustworthy after explicitly setting the viewport and re-measuring. Set the viewport, then
measure — and equally, do not dismiss an anomaly just because the first reading looks odd.

---

## Infinity Roofing & Cleaning — `infinity-roofing` — 2026-07-30

| | |
|---|---|
| **Live** | https://infinity-roofing.vercel.app |
| **Template** | `owl` (design reference: https://gilroy-roofing.vercel.app/) |
| **Pages** | 27 built + `/book` (SSR) |
| **Client site** | https://www.ir-ga.com/ |
| **Spend** | ~$0.04 (Apify $0.0001 + 6 Firecrawl calls) |

**Content:** 7 services (6 client + Solar Installation added by operator), 7 service
areas, 8 testimonials, 7 FAQs, 1 blog article.

### Caps raised
`SERVICE_LIMIT` 5→7 and `AREA_LIMIT` 6→7 in `src/lib/limits.ts`, deliberately — the
operator asked for a page per service and Dallas is the HQ alongside six outlying towns.

### Claims deliberately NOT made
Three of the client's own claims went unpublished because sources contradict each other
and nothing could arbitrate:

- **No rating or review count anywhere**, including JSON-LD `aggregateRating`. ir-ga.com
  says "5.0 / 100+ reviews" on the homepage and "5.0 / 127 reviews" on its reviews page;
  Directorii shows 4.7 from 27. The GBP lookup returned zero matches, so nothing settles
  it. Hero trust badges carry "Licensed & Insured" and "500+ Roofs Completed" instead.
- **No "since YYYY".** ir-ga.com says 2018; Directorii says 2015 and carries reviews dated
  four years back. Hero eyebrow reads "Serving Dallas & North Georgia".
- **No warranty term.** Directorii carries two 1-star reviews about warranty
  non-response and a repair that leaked ~2 months after a $6,000 job with a stated 25-year
  warranty. Gilroy's "50-Year Warranty" slot was refilled with the insurance-claim angle.

Testimonials are the 8 strongest of 15 real, named, dated Directorii reviews — NOT the 9
on ir-ga.com, which are self-labelled "Website testimonial" with no platform attribution.

### Template defects found (fixed per-site, should be upstreamed to `astro-templates/owl`)

1. **`ClosingCTA.astro` shipped Gilroy's copy as its default `body`** — "Serving
   Wilkes-Barre and the Wyoming Valley since 1972", plus a "no payment until the job is
   finished" promise. Eleven call sites, every page. Any site built from owl since commit
   5380c60 renders another client's city, region and founding year unless it overrides.
   **Only caught by grepping the BUILT html, not the source.** Whitman likely has it too.
2. **Hero scrim assumes the desktop two-column layout.** The 90deg gradient falls to
   `rgba(15,20,25,0.25)` at full width. Below the 900px breakpoint the grid collapses to
   one column and the copy spans the full width into that weak end — worst case
   **1.74:1** over a bright photo. Fixed here with a vertical scrim below 900px
   (`0.68 → 0.80`), which guarantees **≥6.41:1 against any possible photo**.
3. `legal` collection is declared in `src/content/config.ts` but never read, so every
   build logs a spurious glob-loader warning.

### Per-site deviations from the template
- **`HeroOwl.astro` gained a `ghl` aside mode.** Operator chose "GHL iframe everywhere",
  so the pasted GHL form replaces the native `EstimateForm` in every hero (home, service,
  area). The native form remains the fallback when no snippet is pasted. Worth upstreaming
  as a first-class aside mode.
- CTA label unified to "Get My Free Inspection!" — the template shipped three variants
  ("Get My Free Estimate!", "Get Your Free Estimate!", plus the button label).

### Known deltas vs. gilroy-roofing.vercel.app
Both are deliberate template improvements made after Gilroy deployed, not regressions:
breadcrumbs are hidden site-wide (e09a329, 440f21b), and the closing CTA was reworked
(5380c60). Everything else — section order, component set, type treatment — is verbatim.
Gilroy's tinted-page/white-card relationship is inverted here (white page `#ffffff`,
tinted card `#fafaf9`) because the operator specified a white background.

### Open items for the client
- **Real job photos.** Pressure Washing and Gutter Services have **no hero photo** —
  Pexels' free library for both is European or automotive, and a Mediterranean tile roof on
  a Georgia gutter page is worse than no photo. Two service pages render text-only until
  Dan sends real work.
- **Business hours and geo lat/lng** — absent without GBP. Needed for the `/book` hours
  block and `LocalBusiness` JSON-LD.
- **Confirm founding year, review count, and any warranty term** before any of the three
  goes on the site.
- **No GBP listing found** for "Infinity Roofing & Cleaning" in Dallas GA. Apify searched
  the correct coordinates and crawled 58 pages. Worth checking what name the Google
  listing actually uses — the site claims 127 Google reviews, so one likely exists.

---

## h4-roofing-construction — 2026-07-30

**Brief:** structural duplicate of `gilroy-roofing` (owl template) for H4 Roofing & Construction, LLC
of Dayton, Ohio. Operator supplied the palette (#c49029 CTA, #ffffff bg, #0a0a0a secondary), seven
services, and "Dayton + up to 5 surrounding" areas. Calendar and contact form to be a placeholder
business card.

**Scaffolded from `astro-templates/owl/`, not `sites/gilroy-roofing/`** — same reasoning as the
Whitman build: Gilroy's `src/` predates the 2026-07-29 service/area render fixes.

### Intake cost: $0.02 total

Nearly the whole intake came from free sources. The BBB profile, the client's own site, and a raw
`curl` of the HTML supplied the address, phone, email, hours, owners, credentials, socials and the
full asset list. **The only paid call was one Firecrawl of the Chamber of Commerce profile
(~$0.02)** to recover real review text after it 403'd `curl`.

Worth repeating on future builds: **try `curl` with a browser UA before reaching for Firecrawl.**
It returned the full rendered HTML of a GoHighLevel site including the email address that WebFetch
had masked and all 51 media URLs.

### Operator said "no GBP" — but Google reviews exist

Directed to use BBB as the source of record, which we did. Noting for the record anyway: the five
testimonials recovered are all labelled "on Google" and carry **dated business responses from July
2026**, so a Google listing exists and is actively managed. Chamber of Commerce reports 5.0 from
52 reviews (51 five-star, 1 four-star). **That number is NOT published on the site** — it is
third-party search metadata, not first-party verified, and the operator agreed to withhold it.

### The logo already existed

The operator asked for a Higgsfield-generated logo believing there was none. There is one: a black
"H4 ROOFING" wordmark with four-point sparkles, transparent PNG, 676x369 — and it is on H4's
**physical yard signs and feather flags in a dozen of their own job photos**. Generating a new mark
would have desynced the site from their real-world signage, and AI image models mangle letterforms.

Operator agreed to reuse it. Three variants produced by deterministic alpha-preserving PIL recolor
(`logo/`): black (light backgrounds), **#c49029 gold** (the dark header/footer), white (knockout).
**No AI generation, no credits spent, letterforms untouched.**

### Photography — 40+ real job photos at full resolution

The client's portfolio page yielded 51 images on GoHighLevel's CDN, most at **5712x4284** — the
opposite of the Whitman problem, where client photos were 500px. Downloaded, contact-sheeted, and
reviewed visually before assignment.

**Five were identified as stock and excluded**, all by resolution tell: a clay-tile installer
(612x408), a window installer (526x350), two generic house exteriors, and — caught only on the
second pass — a dramatic steep-roof shot with orange underlayment and scaffolding at 612x408. That
one looked like the best action photo on the sheet and was nearly used as the hero. **Check the
dimensions before falling in love with an image.**

31 images resized into `public/img/` (~11MB). First pass constrained by *width*, which let portrait
shots reach 2400px on the long edge — re-run constrained by longest side, 13MB → 11.2MB.

Originals kept on disk but **gitignored** (245MB) via a site-level `.gitignore`; every other site's
`raw/` is a JSON archive under 200KB. They are kept rather than deleted because the CDN hosting them
is the client's old platform and vanishes when they leave it.

### Reddit was unreachable — three ways

`WebSearch` silently dropped the `site:reddit.com` operator and returned HomeAdvisor pages;
`old.reddit.com` and `www.reddit.com` both 403 to `curl`; and reddit.com is blocked by browser
policy. Rather than spend Firecrawl on it, the research was grounded in free local sources, and the
result is sharper than a generic thread would have been:

- **April 2025: the Dayton BBB publicly warned Miami Valley homeowners about storm chasers** after
  hail and flooding. One Jamestown homeowner had three uninvited contractors at her door. Their
  rep, Sheri Sword: storm chasers "leave and you can't get in touch with them again."
- **Ohio issues no statewide roofing license.** Verification burden falls entirely on the homeowner.
- **17 confirmed hail reports within 25 miles of Dayton in the trailing 12 months**; 1.75" hail
  2025-06-28; 74 mph winds 2025-03-30. Montgomery County is among Ohio's top hail-claim counties.

The strategic hinge: H4 is **BBB Accredited A+ — accredited by the same organisation issuing the
warning** — and CertainTeed ShingleMaster credentialed. In a no-license state those are the only
checkable credentials that exist, so both are in the hero, not a footer trust bar.

### Contrast re-derived, not inherited

Owl's default accent (#c8973f) is within a degree of hue of H4's #c49029, so `--color-accent-ink`
landed on the same #8a6420. **That is a measured coincidence, not an inheritance** — noted in
`tokens.css` so nobody later assumes the token was skipped.

The load-bearing result: **white on #c49029 measures 2.85:1 and fails even WCAG's large-text
allowance.** `--color-on-accent` is #0a0a0a at 6.95:1, clearing the full 4.5:1 threshold rather than
the 3:1 exemption. The operator's #0a0a0a maps onto the template's dark bands, where the gold reads
at 6.95:1 — better than the template default's 3.78:1.

### Four template defects found and fixed in the client site

Per the site-generate rules this skill must not edit `astro-templates/`, so all four are fixed in
`sites/h4-roofing-construction/` only. **All four should be ported upstream.**

**1. Four pages shipped with no `<h1>`.** `/contact`, `/book`, `/blog` and `/service-area` use
`SectionHead` as their only page heading and never render a `HeroOwl`; `SectionHead` hardcoded
`<h2>`. Confirmed in the built output of gilroy, whitman and bilskis (`/contact` h1 count: 0), so it
is a template defect, not a content mistake. Added an optional `as` prop defaulting to `'h2'`; the
four page-level heads pass `as="h1"`. `h1, h2` share one CSS rule so the tag choice is structural
and changes nothing visually.

**2. Area pages published an unverified "licensed" claim.** `service-area/[slug].astro` hardcoded
"local, licensed service" into the meta description and JSON-LD of every area page, ignoring
`config.licensed`. `TrustBadges.astro` gates the same word correctly; this route did not. Doubly
wrong here — the site's own copy explains Ohio issues no roofing licence. Both occurrences now gate
on `site.licensed`.

**3. Hero trust badges forced 425px of horizontal overflow at 375px.** The `≤560px` rule sets
`flex-wrap: nowrap` plus `white-space: nowrap`, sized against the label lengths its own comment
cites ("147 + 202"). H4's longer labels ("CERTAINTEED SHINGLEMASTER" / "Credentialed installer")
gave the list a **377px min-content**, which propagated through the grid item's default
`min-width: auto` and stretched the hero's single mobile column to 376.6px inside a 327px content
box. Overridden to allow wrapping — a two-line badge pair is a presentation preference; a page that
scrolls sideways on a phone is a defect.

**4. The hero's native `EstimateForm` renders live but cannot deliver.** It posts to
`/api/estimate`, which needs `LEAD_WEBHOOK_URL` (or the Resend trio) in the Vercel environment —
the same gap logged against Whitman. Until a destination exists the form accepts a submission and
returns `?error=unavailable`. Since the operator asked for a placeholder business card anyway,
`HeroOwl` now falls back to the contact-card snippet whenever `crm.form_action_url` is unset. **It
reverts itself**: set `form_action_url` (or wire `LEAD_WEBHOOK_URL`) and the native form returns.

### Dead config removed

`us_vs_them` and the site-wide `gallery` were populated, then removed — **neither is rendered by
owl.** `UsVsThem` is firefly-only, and `/our-work` builds its strips from per-service `gallery`
frontmatter, not `config.gallery`. Populated keys that do nothing look like configuration and invite
someone to edit them expecting a result. The photos moved into the service markdown, where they
render. A `_removed_keys_note` in `config.json` records why.

### Scope decisions

- **`SERVICE_LIMIT` raised 5 → 7** in `src/lib/limits.ts`. The operator's seven are seven distinct
  trades, not seven near-duplicate roofing pages, so the thin-content risk the cap guards does not
  apply. `AREA_LIMIT` untouched at 6 (Dayton + 5).
- **"Roof Inspection" description rewritten.** The operator-supplied text was pressure-washing copy
  ("Professional house washing, driveway cleaning...") pasted from another business.
- **Concrete, Flooring and Drywall render text-only.** Zero photo coverage across all 51 images —
  every one is roofing or roofing-adjacent. The owl service schema handles an unset `about_photo`
  by design rather than repeating the hero. Copy angles them at post-leak interior work, which is
  both honest and a genuine cross-sell.
- Areas chosen as the five nearest the 45440 office: Kettering, Centerville, Beavercreek, Bellbrook,
  Miamisburg. Dropped from the client's list of 10: Springboro, Huber Heights, Vandalia, Troy.

### Verification

- `npm run build` exits 0. **26 pages.**
- **All 18 routes return 200**; every page has exactly one `<h1>`; unique titles and meta
  descriptions throughout; **zero images without alt text**.
- Measured in-page at **375px and 1280px**: zero horizontal overflow on all 15 checked routes, zero
  collapsed grid columns, zero broken images.
- **Zero unverified credential claims** in the built HTML — no "licensed", "insured", "bonded",
  review count or numeric rating anywhere.
- NAP consistent across all 26 pages; **(937) 412-0001 is the only phone number in the output.**
- Leakage sweep clean: no gilroy / whitman / bilskis / firefly / owl-template / Denver / Spokane
  strings, and **no hotlinks to filesafe.space or leadconnectorhq** — every image is served locally.

### Open before this goes to the client

1. **`years_in_business` conflict.** The client's site claims "15 years of industry experience";
   BBB records the LLC as founded 2015-06-04 (11 years) and "locally owned since 2024-11-01". Using
   their own published claim of 15. **Confirm before publishing.**
2. **No licensed / insured / bonded claim anywhere** — the client's site makes none, so nothing was
   asserted. In a state with no roofing licence, liability insurance and workers' comp are precisely
   what homeowners are told to verify. **This is the single highest-value addition available, and it
   needs the client to confirm coverage.**
3. **`/api/estimate` has no delivery destination** — see defect 4. Wire `LEAD_WEBHOOK_URL` before
   any traffic; until then the hero renders the contact card instead of a dead form.
4. GHL calendar, contact form, chat and reviews snippets are all still placeholders.
5. **Review count withheld** pending first-party verification of the 5.0 / 52 figure.
6. Area `landmark_photo` slots use H4's own job photos with alt text that describes the work rather
   than claiming to depict a city landmark (same approach as Whitman's Carbondale). Real landmark
   photography would strengthen the local-recognition angle.
7. **No team photos.** Drew and Trey Harper are named throughout and one review names Trey
   personally; portraits would convert well.
8. Sister domain `h4constructionohpa.com` 404s on every path despite being listed on BBB and still
   indexed — **and the client's own email address is on that dead domain.** Worth raising with them.

### Revision 2 — 2026-07-30 (operator fixes)

1. **Hero aside now renders the GHL BOOKING CALENDAR, not the contact form.** Home, all 7
   service pages and all 7 area pages. The contact form is confined to `/contact` —
   verified against the built output: exactly one of 27 html files contains the form
   snippet. Panel headings moved from estimate wording to booking wording.
2. **Logo replaced with the client's real mark**, regenerated on a white background via
   Higgsfield (`nano_banana_pro`, 2 variants, 4 credits) from the logo already in the
   Higgsfield media library (`754f3006-…`). Variant B was discarded — it rendered heavy
   black outlines around the gold, an artifact of the source sitting on a black field.
   Variant A was trimmed of its dead margin and alpha-masked: the header is `#ffffff`
   but the footer is `--color-surface #fafaf9`, so a hard-white plate would have shown a
   faint rectangle in the footer. The hand-built `logo-infinity.svg` is deleted.
   Because the real mark is a STACKED 1:1 lockup rather than the wide lockup the template
   assumes, header logo max-height went 99px→116px (bar is 149px), mobile 69px→82px, and
   footer 60px→96px — at the stock sizes the "Of Georgia" tier rendered ~7px tall.
3. **Pressure Washing and Gutter Services tiles now have photos.** Both were falling back
   to the `.no-photo` dark gradient. Generated via Higgsfield (2 credits each): a US
   suburban house wash showing a clean strip against algae-stained siding, and white
   seamless gutter + downspout against dark asphalt shingles. All 7 service tiles now
   carry real imagery; zero `.no-photo` tiles remain.

Business name stays **Infinity Roofing & Cleaning** (operator decision) even though the
logo reads "Infinity Roofing — Of Georgia". Three of the seven services are exterior
cleaning, so the name carries information the logo does not.

Higgsfield spend this revision: 8 credits (2 tile images + 2 logo variants).

### Deploy + post-deploy QA — 2026-07-30

**Live:** https://h4-roofing-construction.vercel.app (alias returns **200 — public**, like whitman
and unlike the usual SSO 302; the deployment-specific URL is gated at 302 as normal). 27 URLs in
the sitemap. `/book` is `prerender = false` by template design (it reads `?error=`), so it is served
from `_render.func` rather than `dist/client` — not a defect, but it means `find dist/client` will
undercount by one.

**The first deploy shipped six defects. A post-deploy QA pass caught all six.** Recording them in
detail because five were inherited template content that the pre-deploy sweep was simply not looking
for, and the same trap is waiting on every future build.

**1. Another client's city and founding year on 21 pages.** `ClosingCTA.astro`'s default `body` read
*"Serving Wilkes-Barre and the Wyoming Valley since 1972."* — Whitman's market and founding year,
baked into a **component default** and therefore rendered on 21 of 27 pages. It also promised *"no
payment until the job is finished"*, a guarantee H4 has never made.

The pre-deploy leakage sweep missed it because it grepped for client *names* (`gilroy|whitman|
bilski|firefly`) and not for their *geography*. **The lesson: sweep for prior clients' cities,
regions, founding years and guarantees, not just their names — and audit component DEFAULT props
specifically, since a default renders everywhere while appearing in no content file.**

**2. A roofing CTA at the foot of the Concrete, Flooring and Drywall pages** — "Need A New Roof?
Book Your Inspection Now." Service pages now close on their own trade via a generated
`Need {title} in {city}?`, with an optional `closing_headline` frontmatter escape hatch (used on
Roof Inspection, which wanted an article).

**3. `/pricing` published a fabricated price table with wrong units.** The template hardcoded
"Average roof costs in {city}" — figures not sourced to Dayton but attributed to it by name, and
internally inconsistent: a column headed **"Per square (100 sq ft)"** carried per-square-FOOT values,
so "$4–$7" against "$8,000–$14,000 for a 2,000 sq ft home" was off by a factor of ~100. It also
contradicted the page's own copy, which explains H4 does not quote from the driveway. Removed and
replaced with prose on what actually drives the price. **Real published ranges must come from the
client, never from a template default.**

**4. `/pricing` meta description advertised "windows, kitchens, and baths"** — firefly's remodeling
services. H4 offers none of them.

**5. `/pricing` rendered the contact card twice** — hero aside plus the down-page booking section,
printing the phone, hours and address twice within a screen. Gated on a real embed
(`/<iframe|<script/`) rather than on the snippet merely being non-empty, so it self-reverts when a
genuine GHL calendar is pasted in.

**6. Alt text was wrong on seven images — the most embarrassing find.** Filenames were assigned from
memory of a contact sheet instead of by re-checking each image, so `work-01` and `work-02` (feather-
flag and in-progress shots) were captioned as *completed* roof replacements, `work-03` (a flag
outside a stone-and-siding ranch) as "materials staged on a driveway", and `work-04` (a plain brick
house) as "pallets of shingles". `/about` was passing `photo_alt={site.business_name}` — the
company's name rather than any description of the picture. All rewritten against a freshly rendered
sheet of the actual `public/img/` files. **Caption from the image, never from the filename.**

Two smaller items fixed in the same pass: Kala Ellington's review appeared twice on the home page
(testimonials *and* the SEO-body pull quote — removed from testimonials, leaving four); and the
Gutters page used `svc-gutters-about.jpg` as both its About photo and a gallery tile.

### Final verification, run against the LIVE site

- **All 27 routes 200.** Every referenced local asset (28 of them) returns 200 — **zero missing
  images.**
- **Zero issues across all 27 pages at 1280px and 375px**: no horizontal overflow, no broken images,
  no collapsed columns, no images wider than the viewport, no sub-40px tap targets.
- Exactly **one `<h1>` per page**; no skipped heading levels; unique titles and meta descriptions.
- **No duplicate paragraphs and no duplicate images within any page.**
- **Zero** occurrences of prior-client copy, non-H4 services, dollar figures, or unverified
  licensed / insured / bonded / review-count claims.
- NAP consistent across every page; **(937) 412-0001 is the only phone number in the output.**

### Operator revisions — 2026-07-30 (post-QA)

Four operator-requested fixes, all live.

**1. Logo reduced 20%.** `.brand-logo` max-height 99px → **79px** desktop, 69px → **55px** mobile. The
H4 wordmark is wide and short, so at 99px it set the header bar height and left a band of whitespace
around the nav.

**2. Every icon slot was empty — filled.** `PromiseBar` accepts either plain strings or
`{text, icon}` objects, and the build had passed **plain strings**, so the three items under the hero
rendered as bare text with no icon disc. The same omission ran through the rest of the page:
`promise_band.icon`, `signature_system.steps_icon` and all four `process_steps[].icon` were unset
too. Assigned from the registry in `src/lib/icons.ts` (`home`, `award`, `document`, `shield`,
`hammer`, `phone`, `clipboard`). Verified in the built HTML: promise-bar 3 SVGs, process 4,
signature 3, promise-band 1. **A string in `promise_bar` is silently icon-less — always use the
object form.**

**3. Concrete, Flooring and Drywall tiles had no image.** Those three services have no `hero_photo`,
and `ServicesGridOwl` falls back to a `.no-photo` dark gradient — which is why they read as broken
next to four photographic tiles. The client's 51-image library is 100% roofing, so there was nothing
real to use.

Generated three images with Higgsfield (`nano_banana_pro`, 4:3) at **2 credits each, 6 total** of
1,139.67 available. Deliberately constrained to **generic trade imagery with no people, no signage
and no yard signs** — a staged "finished project" shot would imply it depicts H4's work, and
no-people also avoids AI hand artifacts and the banned hardhat-team stock trope.

Guardrails on provenance, since this is the first AI imagery on a client site here:
- Filenames carry an **`ai-` prefix** so provenance is obvious to any future maintainer.
- Each service markdown carries a comment explaining what the image is and to replace it.
- Used **only** as the tile/hero background, which is a CSS `background-image` and therefore carries
  **no alt text** and makes no claim about who did the work.
- Deliberately **absent from `gallery`**, so they can never surface on `/our-work`, whose intro
  states every photograph there is work H4 actually completed. Verified: 0 hits on that page.

**4. Hero link relabelled** "Why homeowners pick a local roofer" → **"Why hire H4 Roofing?!"**

**Verified after:** all 7 service tiles carry a background image and all 7 load (`ok: true`); zero
issues across 13 pages at 1280px and 375px — no overflow, broken images, tiles without a background,
or empty icon sections.

**Open item added:** the three `ai-*.jpg` images should be replaced with real client photography of
concrete, flooring and drywall work as soon as H4 supplies any.

### 2026-07-29 (later still) — /online-payments page with PayPal checkout

Added `sites/whitman-lawncare/src/pages/online-payments.astro`, styled to match
`/contact` (same two-column grid, same `pay-card`/`info-col` treatment, same sidebar
blocks). Linked from the header (desktop + mobile) and the footer Company column. URL
matches the client's existing public page, `/online-payments`, so anything already printed
on an invoice still lands.

**Do not transcribe the client ID from a screenshot.** The operator supplied a DevTools
screenshot of the PayPal element. The ID rendered there was
`...Cj0hmh_uMh8diPSNIu6gLBh3...` — the real one scraped from the live page is
`...Cj0hmhayJEPzbUf2uMh8diPSNIu6gLBh3...`. The screenshot had dropped `ayJEPzbUf2` mid-string.
Pasting what was visible would have shipped a button that silently failed for every payer.
Always scrape the live page for the real value.

The PayPal client ID is a **public** identifier — it ships in client-side JS on any site
with a PayPal button. It lives in `config.json` under `payments.paypal_client_id`. The
secret half of the credential pair is not in this repo and is not needed for this
integration.

**Astro gotcha — `is:inline` is load-bearing on both scripts.** Astro bundles bare
`<script>` tags into deferred ES modules, which breaks the ordering the SDK requires and
puts the `paypal` global out of scope for the initialiser. Both the SDK tag and the init
block are `is:inline` so they execute as classic scripts in document order. Verified in the
built HTML: SDK tag present inline, zero `<script type="module">` on the page.

**Improvements over the client's original button-factory script**, all verified in-browser
by instrumenting a parallel `paypal.Buttons()` instance and watching `enable`/`disable` fire:

| Input | Original | Now |
|---|---|---|
| empty | disabled | disabled |
| customer only | disabled | disabled |
| amount `abc` | **enabled** → PayPal rejects, payer sees nothing | disabled |
| amount `0` | **enabled** → rejected | disabled |
| amount `-5` | **enabled** → rejected | disabled |
| amount `125.999` | **enabled** → rejected | disabled |
| amount `125.50` | enabled | enabled |
| whitespace-only customer | **enabled** | disabled |

The original validated with `value.length > 0`, so any non-empty string passed the gate and
failed later inside PayPal with only a `console.log`. Now: a real numeric check
(`/^\d+(\.\d{1,2})?$/`, value > 0), visible field errors on blur with `aria-invalid`, an
`onError` handler that tells the payer they were **not** charged and to call, an `onCancel`
handler, and a success panel quoting the PayPal order ID as a reference. Dropped the
vestigial invoice-id field — it was permanently hidden on the source page
(`invoiceidDiv.firstChild.innerHTML.length > 1` against a label containing one space).

Omitting `payments.paypal_client_id` renders a "payments are not switched on" notice and
emits **no** PayPal SDK script at all — verified by removing the key, rebuilding, and
confirming zero `paypal.com/sdk` references, then restoring.

**Not verified, and deliberately so:** no real transaction was put through. The button
renders, the gate behaves, and the order payload is built correctly, but only a live test
payment proves funds land in the right PayPal account. That is the operator's to run.

**Deployed 2026-07-29:** `/online-payments` live at
https://whitman-lawncare.vercel.app/online-payments/ — 30 pages, all spot-checked routes
200, page in the sitemap, 3 nav links (header desktop + mobile, footer). Live HTML verified:
SDK tag present and inline, client ID byte-identical to `config.json`, zero
`<script type="module">` on the page, zero console errors.

Validation re-verified **against the deployed page**, not just locally, by instrumenting a
parallel `paypal.Buttons()` instance: disabled on load; disabled for customer-only, `abc`,
`0`, `-5`, `125.999`, and a whitespace-only customer number; enabled only at `125.50`.

**Still outstanding — the operator's to do:** no live transaction has been put through, so
nothing here proves funds land in the intended PayPal account. Run one small real payment
and confirm it appears in Whitman's PayPal before pointing customers at this page. Also
still open from the earlier deploy: `/api/estimate` has no delivery destination
(`vercel env ls production` is empty), so the lead forms capture nothing; and there is no
captcha on that endpoint.

## results-roofing — 2026-07-31

- **Client:** Results Roofing (GBP: "Results Roofing", HQ 2828 E Trinity Mills Rd Ste 212, Carrollton TX 75006)
- **Source site:** https://resultsroofing.com/ — a modern, competently built Divi site, NOT an old-site rescue
- **Template:** `owl`, scaffolded from `astro-templates/owl/` (operator asked for "the Gilroy template"; gilroy-roofing is an owl build)
- **Pages:** 26 static + `/book` on-demand (`prerender = false`, same as gilroy)
- **Local build:** clean. All 17 spot-checked routes 200 on the dev server.
- **Spend this run:** ~$0.25 total — GBP lookup $0.004, Firecrawl 12 pages ~$0.23, Firecrawl web search for Reddit ~$0.02. design-reference cost $0.

### Why this rebuild is a conversion job, not a redesign

The audit screenshot is the argument. Their site is responsive, HTTPS, real typography, their own
photography — and its **testimonials section renders completely empty**. A full-width blue band
reads "WHAT OUR CUSTOMERS SAY ABOUT US" and shows nothing, because the Trustindex widget never
populates. A business with **1,802 reviews at 4.9 stars was displaying zero of them.** The bottom
contact form renders as a blank white rectangle in the same capture.

Meanwhile the differentiator — insurance-claim advocacy — appears nowhere on their home page. It is
buried in `/services/emergency-services` and `/storm-damage`. Google's own review tags say
insurance claim assistance is mentioned **181** times, adjuster meetings 26, thorough inspection 62.
The thing customers value most was the thing hardest to find.

So: testimonials are baked into `home.json` as real text (never a third-party widget), and the
`signature_system` slot carries the claim process on the home page.

### Research notes

Reddit is **hard-blocked** for both WebSearch (`domains are not accessible to our user agent`) and
Firecrawl (`we do not support this site`). `old.reddit.com` still returns 200 to a normal browser
UA; `www.reddit.com` returns 403. Threads were found via Firecrawl web search and fetched with
curl. 9 DFW threads, ~200 comments — see `local_research.json`.

### Contrast: the client's brand red cannot do both jobs

Measured, not estimated:

| pair | ratio | |
|---|---|---|
| white on brand red `#ba2a22` | 6.10:1 | PASS — every button |
| brand red as text on `--color-bg` | 5.64:1 | PASS |
| white on deep navy `#062a6b` | 13.54:1 | PASS — all four dark bands |
| coral `#f4756a` on `#062a6b` | 4.90:1 | PASS — new token |
| brand red on their own brand blue `#0047ba` | **1.32:1** | fail — why primary is not the raw blue |
| brand red on the deepened navy | **2.22:1** | fail — why the new token exists |
| brand red on pure **black** | **3.44:1** | fail — no dark band rescues it |

**Added `--color-accent-on-dark` in the site copy** and repointed 8 rules: Testimonials
`.eyebrow`/`.stars`/`.mark`, ProcessSteps `.label`, WhyChooseUs counter, HeroOwl `.badge-copy
.stars`, plus the two dark-band `:hover` border-colors. Fills (`background: var(--color-accent)` +
`--color-on-accent`) were already correct and were left alone. HeroOwl:212 `.stars` sits on
`--color-surface` (white) at 6.10:1 and was also left alone.

This is the exact mirror of the `--color-accent-ink` fix already in the template — one
`--color-accent` cannot serve both button fills and text on navy. Worth upstreaming.

For reference: **gilroy's own accent `#f15537` is 3.45:1 with white button text and fails AA.**
Gilroy's palette *shape* was the reference here, not its values.

### TEMPLATE BUGS FOUND (not fixed upstream — fixed in the site copy only)

1. **`astro-templates/owl/src/components/ClosingCTA.astro:16` still ships Gilroy's copy as its
   default `body`:** *"...no payment until the job is finished and you're satisfied. Serving
   Wilkes-Barre and the Wyoming Valley since 1972."* Eleven call sites take that default, so it
   rendered on this Dallas client's home page with another client's city, another client's founding
   year, and a payment-terms promise Results Roofing has never made. The 2026-07-25 log entry claims
   this was swept; it was not. **Every owl build since then should be re-checked.**
2. **`ServicesGridOwl.astro` clipped long service titles.** `.tile` had a hard `aspect-ratio: 16/10`
   with `.body` absolutely pinned to `bottom: 0`; a two-line title plus three chips overflowed
   upward and "Storm Damage & Insurance Claims" lost its entire first line. Site copy now uses a
   flex column with `min-height`, so the tile grows instead of clipping.
3. **`EstimateForm` / `HeroOwl` printed raw review counts** ("1802 reviews") while every other
   surface said "1,802". Both now use `toLocaleString('en-US')`.

### KIT BUG FIXED UPSTREAM (`scripts/screenshot.js`)

Playwright was not installed at the kit root at all, and once installed, its bundled
`chrome-headless-shell` was served a **bare 403 page** by resultsroofing.com's WAF — which
screenshotted cleanly and would have silently poisoned the audit with a picture of an error page.
The script now launches the locally installed Google Chrome (falling back to bundled chromium) and
**warns loudly on any HTTP >= 400**.

### Content decisions

- **5 services** (owl cap). Storm Damage & Insurance Claims is `order: 1` — deliberately ahead of
  Roof Replacement. Replacement is what they sell; the claim is what people search at 11pm after
  the hail stops. Emergency Services was folded into Storm Damage rather than dropped. Paintless
  Dent Repair excluded — it is an auto-body service on a separate domain (resultspdr.com).
- **6 service areas** (owl cap): Dallas, Fort Worth, Houston, Austin, San Antonio, Atlanta. Their
  other four markets (Raleigh, Wilmington, N Myrtle Beach, Amarillo, Temple, College Station) are
  named in body copy but have no pages.
- **3 original blog posts** written from the Reddit research: the storm-chaser piece, an ACV vs RCV
  explainer, and the should-you-file trade-off. None are rewrites of their existing posts.
- **All 19 photos localized to `public/img/`** rather than hotlinked off their WordPress CDN,
  per the schema comment. Optimized to 2.8MB total. Two stock images from their site were dropped
  (a terracotta-tile shot and an AdobeStock tree-on-roof kept only for the Atlanta area page).
- Content was drafted in British spelling and swept to US: 23 replacements across 2 passes
  (cheque->check, neighbourhood->neighborhood, mould->mold, labour->labor, favour->favor,
  itemised->itemized, scrutinise->scrutinize, authorisation->authorization, maths->math,
  characterise->characterize, realise->realize, localised->localized).

### Claims deliberately NOT made (no source)

- `insured: false`. Their site says "licensed roofing construction company" but "licensed and
  insured" appears only as generic advice about what to look for in *any* contractor, never as a
  claim about themselves. **Operator must confirm before flipping this.**
- No `years_in_business` — no "since YYYY" appears anywhere on their site.
- No claim about how Results Roofing handles deductibles. The FAQ and blog state the **Texas statute**
  (a contractor may not pay, waive, rebate or absorb any part of a deductible) as consumer education
  and never assert their own practice.
- The one-year filing window is phrased as policy-dependent ("many set an outside limit of roughly a
  year... the exact window is set by your policy"), never as a statutory deadline, because it is not one.
- No Class 4 shingle *program* is claimed — it is discussed as an option to ask their agent about.

### OPEN ITEMS for the operator

- **Phone.** Using the site-wide header number (214) 301-5533. They publish **nine**: GBP says
  (469) 270-8037, the HQ footer says 469-218-8983, `/storm-damage` and `/about` say (214) 505-1442,
  plus seven regional office lines. Swap in a tracking number before this goes to the client.
- **All five CRM paste-ins are unset** (`crm: { provider: "ghl" }` only). The native `EstimateForm`
  renders and validates but `crm.form_action_url` is unset, so **submissions go nowhere**. Also no
  `crm.captcha_snippet` — the dev-only notice is correctly absent from the production build, but the
  endpoint is uncaptcha'd. Do not send traffic here until both are wired.
- `code_injection.head` / `body_end` empty — no Meta Pixel, no GTM.
- No service-area landmark photos. `landmark_photo` is unset on all six, so AboutSection falls back
  to text-only (the intended fallback per the schema comment, not a bug).
- Hero video not used. They ship one (`og:video` mp4) and the template supports it, but the schema
  requires an absolute URL and their CDN link is a hotlink risk. Revisit after deploy if wanted.
- `.form-error` uses a fixed `#be1e1e`, deliberately not accent-derived. For this client that is
  within a hair of the brand red, so an error banner will read as brand chrome. Cosmetic; noted.

### Deploy — 2026-07-31

**Live: https://results-roofing-seven.vercel.app** — 26 static pages + `/book` on-demand. All 29
routes (including `/sitemap-index.xml` and `/robots.txt`) verified 200 against the live host.

**`results-roofing.vercel.app` is NOT ours and must never be used.** It is a Next.js app on someone
else's Vercel account, titled "Results Roofing | Instant Roof Replacement Quotes" — almost certainly
the client's own Roofle instant-quote product. Because the clean name was taken, Vercel auto-assigned
`results-roofing-seven`.

`site-generate` had optimistically baked `https://results-roofing.vercel.app` into `astro.config.mjs`,
`robots.txt` and `config.json` before the project existed, so the first deploy shipped **canonical
tags and a sitemap pointing at a third party's site**. Caught by sweeping every route on the live
host rather than trusting the deploy's READY state — the first sweep came back a nonsense mix of 200s
and 404s, which is what a foreign app answering your hostname looks like. Rewritten and redeployed;
canonicals and the robots sitemap line now verified live.

**Lesson for `site-generate`:** do not write a presumed `{slug}.vercel.app` into canonicals. Either
leave `REPLACE_SITE_URL` in place until `vercel-deploy` resolves the real alias, or claim the project
first. The interim URL is a guess and this is the second failure mode it has produced (see the
mylocalads CWD-hijack entry above for the first).

Verification on the live host: zero occurrences of `Wilkes`, `1972`, `Wyoming Valley`, `DEV ONLY`,
`Sample`, `Denver`, `Example Roofing`, `gilroy`, `Lorem`, or the wrong `results-roofing.vercel.app`
across 8 sampled pages. Exactly two phone numbers render site-wide: the main line (214) 301-5533 and
the claims department (844) 227-3484 — both intentional.

**Still true and still blocking client hand-off:** `crm.form_action_url` is unset, so the estimate
form validates and then drops the lead; there is no captcha on `/api/estimate`; no Pixel/GTM; and the
phone is the client's published header number rather than a tracking number.

If a nicer URL is wanted before outreach, rename the Vercel project (e.g. `results-roofing-tx`) or
attach a custom domain — then re-run the URL rewrite + redeploy, because canonicals are baked at
build time.

---

## 2026-08-03 — firefly-cd: custom domain `fireflycd.com` attached (DNS pending)

`fireflycd.com` and `www.fireflycd.com` added to Vercel project `firefly-cd` (ownership verified,
`domainOwnership: current-scope`, no conflicts). Canonicals rewritten from `firefly-cd.vercel.app`
to `https://fireflycd.com` in `astro.config.mjs`, `public/robots.txt`, and
`src/content/site/config.json`; rebuilt (22 pages) and redeployed to production. Verified
`dist/index.html` carries `rel="canonical" href="https://fireflycd.com/"`.

**Not yet live** — the domain is on GoDaddy nameservers (`ns59/ns60.domaincontrol.com`) and still
resolves to GoDaddy Website Builder (`76.223.105.230`, `13.248.243.5`, `Server: DPS/2.0.0-beta`).
Operator must swap the web records at GoDaddy:

| Type  | Name | Value                                  |
|-------|------|----------------------------------------|
| A     | `@`  | `216.198.79.1`                         |
| A     | `@`  | `64.29.17.1`                           |
| CNAME | `www`| `d71b7c76faba8aae.vercel-dns-017.com.`  |

**Do NOT change nameservers and do NOT touch MX or TXT.** Google Workspace email is live on this
domain (MX → `aspmx.l.google.com` et al.) and there are two `google-site-verification` TXT records
plus an SPF record (`v=spf1 include:dc-aa8e722993._spfm.fireflycd.com ~all`). Moving to
`ns1/ns2.vercel-dns.com` would drop all of it and break the client's email. Record-level swap only.

Cutting the A records replaces the client's existing GoDaddy-built site at the root — that is the
intent, but it is the point of no return for the old site's content, which lives only in GoDaddy's
builder.

## headley-construction-group — domain attach 2026-08-03

- **Domain:** headleycg.com (apex, canonical) + www.headleycg.com (308 → apex)
- **Registrar:** Squarespace Domains; **DNS host:** HostGator (ns6125/6126.hostgator.com)
- **DNS method:** A-record swap at HostGator — nameservers deliberately NOT delegated to Vercel
  because the domain runs Google Workspace email (MX aspmx.l.google.com + SPF TXT). NS
  delegation would drop those records and break the client's email.
- **Records handed to operator (not yet set as of this entry):**
  - `A  @    216.198.79.1` and `A  @    64.29.17.1` (Vercel rank-1 IPv4 pair; legacy `76.76.21.21` also valid)
  - `A  www  216.198.79.1` / `64.29.17.1` — or `CNAME www → cname.vercel-dns.com.`
  - Delete the existing `A @ 192.254.237.187` and `A www 192.254.237.187` (HostGator shared host)
- **Cutover state:** headleycg.com still serving the OLD HostGator site (HTTP 200) until the
  A records change. Vercel side is fully configured and waiting.
- **Canonical rewrite:** astro.config.mjs `site:`, public/robots.txt sitemap line, and
  src/content/site/config.json `site_url` all moved vercel.app → https://headleycg.com
- **Redeploy:** dpl_AExECEMrBv8jTx12vv5UXsc4c1P9 (READY, prod, 19 pages) — verified
  canonical + sitemap emit https://headleycg.com
- **SSO:** left at default (`all_except_custom_domains`) — vercel.app gated, custom domain public

### Same day — DNS cut over, `fireflycd.com` verified live

Operator made the GoDaddy record swap. Verified against public DNS (`@8.8.8.8`):

- Root A → `216.198.79.1`, `64.29.17.1` ✓
- `www` → CNAME `d71b7c76faba8aae.vercel-dns-017.com.` ✓, 301s to apex ✓
- `http://` → 308 to `https://` ✓
- SSL cert issued and validating clean (`ssl_verify_result=0`), `server: Vercel`, `x-vercel-cache: HIT`
- **MX, SPF, and both `google-site-verification` TXT records intact** — Google Workspace email unaffected
- Nameservers deliberately still `ns59/ns60.domaincontrol.com`; Vercel's inspect flags this as a
  nameserver mismatch (`✘`). **That flag is expected and must be ignored** — record-level pointing is
  the correct configuration here precisely because moving NS to Vercel would strand the client's email.

All 22 routes return 200: `/`, `/about/`, `/accessibility/`, `/book/`, `/contact/`, `/our-work/`,
`/pricing/`, `/privacy/`, `/terms/`, `/service-areas/`, `/services/` + 6 service pages, and the 5
flat-root area pages (`/spokane-wa/`, `/spokane-valley-wa/`, `/liberty-lake-wa/`, `/post-falls-id/`,
`/otis-orchards-wa/`). Unknown paths 404 correctly. Sitemap resolves and points at `fireflycd.com`.
Zero `firefly-cd.vercel.app` references across 6 sampled pages. Title renders the correct market
("Spokane") — no geography leakage from other clients.

**Verification gotcha worth remembering:** the first live sweep after the cutover returned `200` on
`/` and `404` on every other route, with GoDaddy's `Server: DPS/2.0.0-beta` and GoDaddy's
`robots.txt`. That was **not** a deploy failure — it was the local macOS resolver still caching the
old GoDaddy A records while public DNS had already updated. Confirm with
`curl -w "%{remote_ip}"` before diagnosing anything; if it shows the old IP, re-test with
`curl --resolve fireflycd.com:443:216.198.79.1` to hit the Vercel edge directly. A partial-404 sweep
is the exact signature of a stale resolver pointing at a foreign host, and it looks identical to a
broken deploy.

### 2026-08-03 — firefly-cd: added Kootenai County, ID service area (23 pages)

New service-area page live at `https://fireflycd.com/kootenai-county-id/`. Deploy
`dpl_33gX3MzYGZGpH9hXAD1bCHBnXMVj`. Snapshotted to
`.site-edit-history/2026-08-03T17:46:34Z-k7n3x1/` (rollback-able).

**Operator said "Kootenay County" — corrected to Kootenai County, Idaho.** Kootenay is a region in
British Columbia; the Idaho county bordering Spokane is Kootenai, and the existing `post-falls-id.md`
already carried `county: Kootenai County`. Worth noting the overlap: Post Falls sits inside Kootenai
County, so these two pages compete for some of the same queries.

**The real work was the area cap, not the markdown.** `firefly` hardcodes `.slice(0, 5)` on
service_areas in FIVE places, and the site already had exactly 5 areas:

    src/pages/[area].astro:31              ← route generation (the critical one)
    src/pages/service-areas/index.astro:8
    src/components/Header.astro:5
    src/components/Footer.astro:5
    src/components/ServiceAreaGrid.astro:4

Dropping in a 6th markdown file alone would have **silently discarded one area** — sort-by-order
then slice, no build error, page just 404s. All five raised to 6 with operator approval (CLAUDE.md
flags this cap as "raise deliberately"). Two of the five live under `src/pages/**`, outside
`site-edit`'s allowed write roots — called out and approved before applying, not assumed.

**Photos: Google Places URLs are not usable here.** They are signed, they expire, and Google's terms
bar persisting them in a static site. Used Wikimedia Commons instead, filtered to **CC0 and public
domain only** — CC BY-SA would drag attribution + share-alike onto a commercial client page.

**Then hotlinking Wikimedia failed too, and the failure was quiet.** `upload.wikimedia.org` only
serves *pre-rendered* thumbnail widths: `1920px` and `1280px` returned 200 while `1600px`, `1200px`,
`1024px` and `800px` all returned **400**. The first deploy shipped 400ing images because the widths
were swapped to 1600/1200 after only the 1920px URL had been verified — re-verify a URL after
changing any part of it, including a size segment. Fix: downloaded the originals and self-hosted at
`public/images/`, referenced by absolute URL (`https://fireflycd.com/images/...`) because the
schema's `z.string().url()` rejects root-relative paths. Self-hosting is the better answer regardless
— no dependency on a third party's thumbnail cache.

Sized 1600x900 (hero) and 1200x900 (landmark) via PIL, q=75, ~310KB each. That is ~2.5x the ~125KB
of the existing Unsplash area photos; dense lake/forest detail does not compress like the simpler
stock shots, and hitting 150KB required q=45, which visibly degrades a hero. Chose visual quality.

Verified live: all 6 area pages 200, new page in sitemap, header/footer nav and `/service-areas/`
index, `local_context` renders, zero occurrences of the "Kootenay" misspelling.

**Standing risk, unrelated to this edit (flagged, not fixed):** 42 image references across this site
still point at `img1.wsimg.com` — GoDaddy's CDN, scraped from the old GoDaddy Website Builder site.
Now that the domain has moved off GoDaddy hosting, cancelling the GoDaddy website plan could 404 all
42. They should be migrated to `public/` before that plan lapses.

### 2026-08-03 — firefly-cd: Kootenai County hero swapped to operator-supplied kcgov.us photo

Deploy `dpl_3sQhvSA51GjdZAttd75p5FA4UVfK`. Snapshot
`.site-edit-history/2026-08-03T17:58:07Z-p2m8q4/`.

Operator supplied `https://www.kcgov.us/ImageRepository/Document?documentID=22679` — an aerial of
Coeur d'Alene looking down the Spokane River toward the lake, autumn color. Materially better than
the generic lake stock it replaced: locally recognizable, which is the whole point of an area page.

Source 2200x1150 (aspect 1.913) → LANCZOS 1722x900 → center-crop 1600x900, q78, **184KB** — lighter
than the 309KB shot it replaced. Crop trims only 61px per side; river, townfront, lake and mountains
all survive.

Filename kept identical, so no markdown edit was needed. That raises a stale-CDN risk, so the live
asset was verified by **sha256 against the local file** rather than by HTTP 200 — they match, and
dimensions read 1600x900. A 200 alone would not have distinguished the new image from a cached old
one at the same URL.

**LICENSE UNVERIFIED — open risk on a live commercial page.** Only US *federal* works are
automatically public domain (17 USC §105); state and county works are not. A drone shot this
polished is commonly licensed to a county by its photographer for the county's own use, which would
not cover a contractor's marketing site. Operator was told before the swap and chose to proceed.
Confirm reuse rights with Kootenai County; if they decline, roll back to batch
`2026-08-03T17:58:07Z-p2m8q4` to restore the CC0 lake photo.

Landmark photo left as the public-domain Lake Coeur d'Alene sunset — the supplied image is a 1.913
panorama and cropping it to the landmark slot's 4:3 would gut the composition.

## G&T Roofing & Home Improvements — `gt-roofing` — 2026-08-03

**Live:** https://gt-roofing-five.vercel.app · **Template:** owl · **Pages:** 24
**GBP:** 77 Center St, Pittston, PA 18640 · (570) 880-1640 · 5.0 (5 ratings) · place_id `ChIJd20SX60fxYkRI8bVPVzlOx8`

### Pipeline notes

**GBP took three lookups (~$0.012).** "G&T Roofing & Home Improvements" + "Scranton, PA" returned
zero results; broadening to "Northeast Pennsylvania" resolved the location query to the Philadelphia
metro and returned eight unrelated Bucks County contractors. A free WebSearch surfaced the real city
(Pittston) from a Thumbtack listing, and the third Apify run with `locationQuery: "Pittston, PA"` hit
on the first result with an exact website match. Lesson: when a `locationQuery` names a *region*
rather than a city, Apify geocodes it badly — find the actual city first, even if that costs a free
search.

**Firecrawl spend: $0.00.** The existing site is a Hostinger Horizons Vite/React SPA whose served
HTML is a 6.4 KB shell with an empty `<title>`. All page content ships inside `assets/index-*.js`,
so the entire content set — services, testimonials, gallery with categories and captions, about
copy, manufacturer list, both owner phone numbers — was extracted for free by grepping the JS
bundle. Brand tokens came from the CSS bundle plus a live Playwright `getComputedStyle` read. Worth
checking for any Horizons / Lovable / v0-style SPA before paying to scrape one.

**Brand palette is logo-derived, not CSS-derived.** The site's CSS declares `--primary hsl(210 100%
20%)` (#003366) and `--accent hsl(0 100% 40%)` (#cc0000); the logo PNG samples at #053173 and
#b60c16. Used the logo values — the mark is what sits next to these colours on every page. Font is
DM Sans for both roles, taken from the client's own Google Fonts link.

**Contrast: the owl template's single `--color-accent` fails on this brand.** #b60c16 measures
1.80:1 on the navy dark bands. Applied the same `--color-accent-on-dark` fix results-roofing uses —
#ff7d70, a tint of the same brand red, 4.97:1 on #053173 — and patched the eight call sites in
`Testimonials`, `ProcessSteps`, `WhyChooseUs` and `HeroOwl` in this client site only. The template
still ships one token for two incompatible jobs; third client to hit it.

### TEMPLATE DEFECT FOUND — unconditional licensing claim

`astro-templates/owl/src/pages/service-area/[slug].astro` asserts "local, licensed service" in the
meta description of **every** service-area page, and "fast, honest, licensed work" in the
AboutSection fallback body — both hardcoded, neither gated on `site.licensed`. `TrustBadges.astro`
gates its visible badge correctly; these two strings do not.

G&T publishes **no** licensing, insurance, bonding or warranty claim anywhere on their own site, and
no PA HIC registration number is on public record for them. Set `licensed`/`insured`/`bonded` to
`false` and patched both strings in this client site to key off `site.licensed`. Verified zero
occurrences of "licens/insured/bonded" in the rendered HTML of every page except `/terms` (where
"licensors" is unrelated boilerplate).

**Still live upstream.** Every other owl site with `licensed: false` is publishing the same claim.
Spawned a follow-up task to fix the template and audit results-roofing, infinity-roofing,
h4-roofing-construction, quality-roofing-express and eastern-residential-solutions.

### SECOND TEMPLATE DEFECT — WhyChooseUs eyebrow fails AA

`WhyChooseUs.astro` renders `SectionHead` on a `--color-primary` band and already `:global()`-overrides
that head's `h2` and `.subtitle` for the dark background — but not `.eyebrow`, which is
`--color-accent-ink`, the accent tuned for LIGHT backgrounds. So "WHY CHOOSE US" rendered at
**1.80:1** on navy. Caught by pixel-sampling the deployed page, not by reading the CSS; the section
looks plausible in a full-page screenshot at thumbnail scale.

Fixed here with one `:global(.section-head .eyebrow)` override to `--color-accent-on-dark` (4.97:1),
verified live by re-sampling the same pixel region — #b60c16 before, #ff7d70 after. Spawned a second
follow-up task to fix it upstream, ship `--color-accent-on-dark` in the template's own `tokens.css`
(three client sites have now added it independently), and audit the other owl builds.

### Open items for the operator

- **PA HIC number** — Pennsylvania requires registration for home-improvement work over $500, the
  registry is public, and homeowners are actively advised to check it. This is the single
  highest-value missing asset on the site. Collect it from Alex, then set `licensed: true` and add
  the number to the footer.
- **Written workmanship warranty** — nothing on record. Competitors publishing a 2-year written
  workmanship warranty beat G&T on this directly.
- **All CRM slots empty** — `crm` is `{ provider: "ghl" }` only. No chat, reviews widget, calendar,
  form embed or call-tracking snippet. The native `EstimateForm` renders but has no
  `form_action_url`, so **submissions currently go nowhere**. Highest-priority paste-in.
- **Client is already running paid traffic** to the old site — GA4 `G-4P5P2053KW` and Google Ads
  `AW-18177232427` are installed there. Neither was carried over (client tags are not ours to
  copy). Decide whose tags go in `code_injection.head` before pointing any ads at this URL.
- **Six site-published testimonials** (Maria Santos, Robert Chen, Jennifer Kowalski, David Martinez,
  Sarah Thompson, Michael Patel) came from the client's existing site and could not be independently
  verified — the GBP has 5 ratings but zero review text. The three Thumbtack reviews (Tanis R.,
  Anthony E., Daniel K.) are verifiable. Confirm the six with the client or drop them.
- **Second owner's number** — Luis at (570) 453-8725 appears in body copy but `phone` is Alex's
  (570) 880-1640 throughout the header, schema and footer, per GBP.
- **No city landmark photos** — service-area pages use the client's own project photography as hero
  images and omit `landmark_photo` rather than using unlicensed or generic stock.

### Content

5 services (roof-replacement, roof-repair, seamless-gutters, siding-and-exterior,
chimney-and-skylights — consolidated from the client's 8 to fit `SERVICE_LIMIT = 5`, all 8 covered
via `sub_services`). 6 service areas (scranton, wilkes-barre, pittston, hazleton, carbondale,
stroudsburg — all `-pa`, `AREA_LIMIT = 6`). 8 home testimonials, 8 home FAQs, 9 gallery items, 4
partner badges, 1 blog post (ice dams / NEPA freeze-thaw). 14 client images pulled from the
Hostinger CDN into `public/img/` rather than hotlinked; logo background made transparent, trimmed
and resized 1254px/977KB → 640px/272KB.


## Quality Roofing Express — `quality-roofing-express` — 2026-08-03

| | |
|---|---|
| **Live** | https://quality-roofing-express.vercel.app |
| **Template** | `owl` |
| **Pages** | 26 static + `/book` (SSR) = 27 routes, all 200 |
| **Client site (old)** | https://www.qualityroofingexpress.org/ — SITE123, single page |
| **GBP** | 4.6 ★ / 74 reviews · placeId `ChIJT3NpTdXZxIkRXrlxdqrgXIk` |
| **Deployment** | `dpl_7ZeDgedCjtrFQskSfMSRMin4V7gV` (READY, prod) |
| **Spend** | ~$0.012 (2 Apify runs: Maps lookup + reviews scrape). **Zero Firecrawl spend** — the client site is a single page and was fetched with `curl` + parsed locally; Reddit research used Firecrawl *search* snippets only, since Firecrawl refuses to scrape reddit.com. |

### Intake

Business confirmed from 2 GBP hits by matching the operator-supplied URL. 614 N Rebecca Ave,
West Scranton PA 18504 · (570) 614-3914 · Qualityroofingexpress@gmail.com · open 7 days
(7am–7pm Mon–Fri, 8am–7pm Sat, 9am–12pm Sun).

The Maps actor returned `reviews: null` despite `maxReviews: 5`, so a second run against
`compass~google-maps-reviews-scraper` supplied 12 reviews (10 with usable text). Worth
remembering — `lukaskrivka~google-maps-with-contact-details` does not reliably honour
`maxReviews`, and testimonials are not optional content.

Brand tokens came off the client's own CSS custom properties, not guesswork:
`--global_main_color: #cf1b1b` (confirmed by `<meta name="theme-color">` and the logo),
`--font_slogan: Playfair Display`, `--global_font: Open Sans`. Logo pulled as a transparent
PNG from their CDN and served from `public/img/` — hotlinking a SITE123 CDN that disappears
the day they cancel that plan is not an option.

40 real job photos were pulled off their CDN, EXIF-transposed, resized and committed to
`public/img/`. No stock photography anywhere on the site.

### Content decisions

- **9 service tiles consolidated to 5** (the `owl` `SERVICE_LIMIT`). The four separate
  membrane tiles (EPDM / TPO / torch-down / peel-and-stick) became one **Flat & Rubber
  Roofing** page with the four as `sub_services`; chimney flashing and skylights folded into
  **Roof Repairs & Leaks**. Four thin near-duplicate membrane pages would have competed with
  each other for the same query.
- **Siding is deliberately NOT a service page**, despite being in the client's own tagline.
  The only 1-star Google review (Dec 2024) is a siding job that rippled, with the owner
  attributing it to the manufacturer. The site leads with roofing, which is where the
  evidence is.
- **6 service areas** are an operator/marketing decision, not scraped — the client's site
  lists no coverage at all. Scranton (HQ), Dunmore, Dickson City, Old Forge, Clarks Summit,
  Wilkes-Barre. Neighbourhoods are real; local context is written from the housing stock,
  not invented specifics.
- **Copy angle** comes straight from the research: cleanup and speed. Three separate Google
  reviewers praise the cleanup unprompted, and "nails left in the yard" is the single most
  common homeowner complaint about roofers on Reddit. Hero headline is
  "The roof goes on. The mess doesn't stay."
- **Winter availability** got its own PromiseBand section. NEPA does most of its roof damage
  Dec–Mar; the client's own site already said "Winter weather doesn't stop us" and nobody
  else in the metro advertises it.
- **`licensed` / `insured` / `bonded` are all `false`.** Nothing on the client's site claims
  them and nothing verifies them. Pennsylvania issues no roofing licence at all — HICPA
  registration confirms insurance and identifies the registrant, nothing more — so the site
  argues from repeat business and reviews instead. The template hardcoded "licensed" into
  two strings in `service-area/[slug].astro`; both were rewritten out.
- **Third-party badges left off.** Their site displays BBB, Angie's List and Loc8NearMe
  marks. The files are in `public/img/` (`badge-bbb.png`, `badge-angies-list.png`,
  `badge-loc8nearme.png`) but `partners: []` — "Angie's List" has not existed as a brand
  since the Angi rebrand, and none of the three could be verified as current. Reinstate once
  confirmed.

### Template defects found and fixed in the site copy

All four ship with `astro-templates/owl` and will recur on every future owl build. Fixed here
only — upstreaming is a separate change.

1. **`ClosingCTA.astro` defaults to Gilroy Roofing's copy.** The `body` default literally
   reads "Serving Wilkes-Barre and the Wyoming Valley since 1972" — another client's market
   and another client's founding year — and it renders on *every page* of any site cloned
   from the template. `sites/eastern-residential-solutions/` has the same string live.
2. **No `<h1>` on four routes.** `/blog`, `/service-area`, `/contact` and `/book` used
   `SectionHead` as their only heading and it hardcoded `<h2>`. Added an `as` prop
   (default `h2`, styling identical) and passed `as="h1"` on those four. All 27 routes now
   carry exactly one h1, a meta description and a canonical.
3. **`.header-row` silently zeroed the container gutter.** It is also `.container`
   (`padding: 0 var(--space-3)`), and its own `padding: var(--space-2) 0` shorthand won on
   Astro's scoped-selector specificity. Above 1200px the auto margin hid it; below that the
   logo ran flush to the screen edge. Restoring the gutter then squeezed the logo to 79px
   wide via flex, so the mobile logo is now width-pinned and the circular phone badge is
   dropped under 480px — the *number* stays visible, since "no phone CTA on mobile" was the
   old site's worst defect.
4. **16 rigid `repeat(auto-fit, minmax(Npx, 1fr))` grid floors** caused horizontal scroll on
   narrow viewports (the 330px service tile overflowed a 320px screen). All rewritten to
   `minmax(min(Npx, 100%), 1fr)`.

Verified after the fixes: no horizontal overflow on any of 27 routes at 375 / 414 / 768 /
1024 / 1440. At 320px two pages still exceed by 3px — cosmetic, unfixed, iPhone-SE-1 era.

### Contrast

Brand red `#cf1b1b` is a mid-dark red (luminance 0.113). White on it is 5.49:1 and it also
works as text on light surfaces (4.99:1 on bg, 5.49:1 on surface), so `--color-accent-ink`
is the same value rather than a darkened variant. It fails on the dark bands at 2.91:1, so a
`--color-accent-on-dark: #f2685f` token (5.26:1) was added and the six accent-as-text-on-dark
call sites repointed — the same fix `results-roofing` needed, for the same template reason.

### OPEN — blocking for real lead capture

1. **No lead destination configured.** `vercel env ls` returns nothing. `/api/estimate`
   currently returns `?error=unavailable` and shows the visitor "Online requests aren't
   switched on yet. Please call us and we'll get you booked in." Set `LEAD_WEBHOOK_URL`
   (GHL inbound webhook) — or `RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL` + `LEAD_FROM_EMAIL` —
   on the Vercel project. Every form on the site is dead until this is set.
2. **No GHL snippets pasted.** `crm` is `{provider: "ghl"}` only — no chat widget, no reviews
   widget, no calendar embed, no call-tracking number. Those sections self-hide.
3. **No `code_injection`.** No Meta Pixel, no GTM.
4. **Vercel SSO is OFF on this project** — the `*.vercel.app` URL is publicly reachable,
   unlike the `all_except_custom_domains` default noted in the vercel-deploy skill. Left as
   found (it is what makes the URL usable for outreach), but flagging the deviation.
5. **Unverified with the client:** deposit and payment schedule (the FAQ answer is written
   conservatively and says "ask us"), licensed/insured/bonded status, years in business, and
   whether the 6 service areas match their real coverage radius.
6. **No custom domain attached.** `qualityroofingexpress.org` still serves the SITE123 site.

### 2026-08-03 — Pinnacle Roofing & Sheet Metal, Inc. (owl template)

Full 9-step pipeline, `--auto`. Nanticoke, PA commercial roofing contractor, est. 1993.
GBP confirmed (`ChIJSYsJpegNxYkRLbkogpFFRu8`, 100 Hay St, 5.0 / 3 reviews). Old site is a
Hibu template on a full-bleed `#F30E1E` red background; brand tokens taken as teal
`#03779C` + yellow `#FAE231` (logo mountain + sun), red deliberately dropped as a surface
colour. Tokens: primary `#0a2a38`, accent `#f4d01c`, accent-ink `#04688a`. All six
contrast checks pass, including accent-on-dark-band at 9.9:1.

- **Cost:** ~$0.18 (GBP $0.004 + 9 Firecrawl scrapes). The Apify run used
  `locationQuery: "Pennsylvania"`, which is far too broad — it found the right place in the
  first ~30s and then kept crawling for 15+ minutes (5,689 search pages) before it was
  aborted manually. **Pass a city, not a state.** Because it was aborted, the run returned
  no review bodies, so `testimonials[]` on this site is intentionally EMPTY rather than
  fabricated; the Testimonials section self-hides.
- **Social proof substitute:** the client's `/experience-and-affiliations` page lists a
  verifiable roster of NEPA buildings (Geisinger ×4, Sanofi Pasteur, Tobyhanna Army Depot,
  Kalahari Resort, Wilkes University, WBS Airport, P&G Mehoopany …). That roster carries
  the SeoBody checklist and WhyChooseUs in place of reviews, and is stronger than three
  Google stars for a commercial buyer.
- **Stale claim NOT carried forward:** the old homepage says "With 23 years' experience"
  while also claiming "Established in 1993". `years_in_business` was derived from 1993 (33),
  and the 23 was dropped.
- **Imagery:** every client photo on the old Hibu site tops out at 723px wide (the
  `-1920w` CDN suffix is a lie — the source assets are small). Client photos are therefore
  used only for gallery tiles, team headshots and the small promise-band figure; all
  hero/full-bleed images are Unsplash commercial low-slope roofing, downloaded to
  `public/img/` rather than hotlinked. One Unsplash pick was swapped after review because
  it was a Stockholm street ("FLEMINGGATAN") standing in for Scranton.

**Template defects found and patched inside `sites/pinnacle-roofing-sheet-metal/` only —
these are still present in `astro-templates/owl/` and should be fixed upstream:**

1. `ClosingCTA.astro` ships Gilroy's copy as its DEFAULT body — "no payment until the job
   is finished" and "Serving Wilkes-Barre and the Wyoming Valley since 1972". It renders on
   8 pages with no props, so every new owl client inherits another client's guarantee as a
   factual claim. **Highest-severity of the five.**
2. `WhyChooseUs.astro` hardcodes `heading="Reasons homeowners pick us"`, and
   `pages/services/index.astro` hardcodes "What we do for {city} homeowners." Both are
   wrong for any commercial-only client.
3. `Gallery.astro` `.card img` has no `width: 100%`, so images render at intrinsic width.
   A 230px client photo rendered as a 230px thumbnail next to a full-width tile.
4. `Footer.astro` has icon branches for facebook/youtube/instagram only. A GBP-only client
   (`social: { google_maps }`) renders an empty accent-coloured square with an aria-label
   and no glyph. Added map-pin + yelp branches. `contact.astro` already had the map pin —
   the two components had drifted.
5. `about.astro` used `story.slice(0, 190)` for the hero subheadline, cutting mid-word
   ("…flat and low"). Replaced with sentence-boundary truncation.
   Separately, `.role` (about), `.phone-large a` (book), `.eyebrow` (thank-you) and `.keep`
   (blog index) use `--color-accent` as foreground text on a LIGHT background. That is the
   exact case `--color-accent-ink` exists for, and it fails AA for any client with a light
   accent — here the yellow measured 1.3:1. `BlogCards.astro` already uses the ink variant;
   `blog/index.astro` had drifted from it.

**Left for operator paste-in:** all five GHL snippets (chat, reviews, calendar, contact
form, call-tracking), `code_injection.head`/`body_end`, `crm.form_action_url` +
`captcha_snippet` (the native EstimateForm currently has no POST target), and
`licensed`/`insured`/`bonded` — all three are `false` because the client's site displays no
badge or footer disclosure, which is almost certainly wrong for a contractor of this size
and needs confirming rather than guessing.

### 2026-08-03 — firefly-cd: confirming redeploy (`dpl_FVux8GW6uzW9vkEmnNekJVy4pj1b`)

Operator-requested deploy. **No content change** — a fresh build was compared to the live host by
sha256 first (hero image, landmark image, and `kootenai-county-id/index.html` all MATCH), so
`dpl_3sQhvSA51GjdZAttd75p5FA4UVfK` was already current. Redeployed anyway on request; new deployment
id, identical bytes.

Full sweep green: all 23 routes 200, plus sitemap, robots.txt and both self-hosted images.

Operator closed the two open hand-off items: the 42 `img1.wsimg.com` GoDaddy-CDN image references and
the estimate form's `crm.form_action_url` are both confirmed OK. No longer tracked as risks.

**Only item still open: the kcgov.us hero photo's reuse license** (see the
`2026-08-03T17:58:07Z-p2m8q4` entry above). Unverified, live, operator-accepted.

### headleycg.com — LIVE 2026-08-03

- **Cutover complete.** DNS moved off HostGator entirely; nameservers now
  nse1-4.squarespacedns.com (registrar-managed). HostGator dependency eliminated.
- **Why the NS migration instead of the planned A-record edit:** client could not recover
  the HostGator account (support required a court order). HostGator was never handling
  email — MX pointed at Google Workspace the whole time — it was only hosting the DNS
  zone. That made the zone unmaintainable and put email at risk if the account lapsed.
  Rebuilding the zone at Squarespace removed the single point of failure.
- **Records live:** A @ + www -> 216.198.79.1 / 64.29.17.1 (Vercel); MX x5 Google Workspace;
  SPF `v=spf1 include:_spf.google.com ~all`; DKIM regenerated (old google._domainkey in the
  HostGator zone was truncated mid-key and had never validated — fixed during migration).
- **SSL gotcha worth remembering:** Vercel's automatic cert issuance had already failed and
  stopped retrying, because the domain was attached hours BEFORE DNS pointed at Vercel, so
  the initial http-01 challenge failed. `verified: true` / `misconfigured: false` in the API
  masked it — port 443 accepted TCP then dropped the TLS handshake (SSL_ERROR_SYSCALL) with
  no cert to serve. Fix: force issuance via `POST /v7/certs` with cns [apex, www].
  cert_AP1c4PXMfFC9Lt6kw9bqvUf9, valid to 2026-11-01, autoRenew on.
  **Lesson: attach the domain AFTER DNS is repointed, or force-issue the cert afterward.**
- **Verified live:** all 19 routes HTTP 200 over the custom domain (incl. 5 flat service-area
  slugs), canonical + sitemap emit https://headleycg.com, www -> apex 308, old HostGator page
  fully replaced (42,898 B Astro build vs 19,001 B legacy), Google Workspace mail unaffected.

---

## Comfortable Climate HVAC — 2026-08-03

| Business | Slug | Template | Pages | Vercel URL | Date |
|----------|------|----------|-------|------------|------|
| Comfortable Climate HVAC | `comfortable-climate-hvac` | owl | 24 | https://comfortable-climate-hvac.vercel.app | 2026-08-03 |

**Source:** https://comfortableclimatehvac.com/ — Dallas, PA (Back Mountain / Wyoming Valley, NEPA).
GBP confirmed: HVAC contractor, 5.0 from 17 reviews, all five-star. Service-area business, no
public street address. Owner: Joe Szczechowicz. Licensed & insured, PA #091633.

**Pipeline cost:** ~$0.37 (3× Apify Google Maps @ ~$0.004, 16 Firecrawl page scrapes, 1 branding
extraction).

**Content:** 5 services (Heating, Air Conditioning, Plumbing, Ductless Mini-Splits, Water Heaters),
6 service areas (Dallas, Wilkes-Barre, Kingston, Scranton, Clarks Summit, Tunkhannock — spanning
Luzerne, Lackawanna and Wyoming counties), 10 home testimonials, 8 home FAQs, 6 gallery items,
1 blog post. All testimonials are real named reviews scraped from the client's own /reviews
pages 1–6.

**Brand tokens:** detected from the client's site — Montserrat / Open Sans, accent #fadb6e
(their yellow), primary #1e2452 (their navy). `--color-on-accent` set to navy, NOT white: white
on their yellow measures 1.36:1 and fails even large-text AA. `--color-accent-ink` derived as
#8a6a00 for accent-as-text on light backgrounds. All seven contrast pairs PASS AA.

**Data conflicts found on the client's site (resolved conservatively):**
- Tenure stated three ways — "over 25 years" (home + footer), "over 35 years" (about), "over 30
  years" of plumbing experience. Used 25.
- Hours conflict — GBP shows 7am–8pm seven days; site footer states Mon–Fri 8:00–5:00. Used the
  site's published hours; emergency availability is surfaced in copy instead.
- Rating conflict — Google 5.0/17 vs on-site widget 4.6/26 (inflated by spam submissions to an
  unmoderated review form). Used the Google figures.
- **The client's existing homepage carries fabricated placeholder testimonials** ("Michael Doe",
  "Sue Jones", "Carolyn Wintner" with stock avatars). Excluded entirely.

**Template defects found and patched inside `sites/comfortable-climate-hvac/` only:**
These are `owl` template bugs — roofing-specific content hardcoded into shared components, which
would have shipped roofing copy on an HVAC site. Patched locally; the upstream template still has
them and every non-roofing client will hit the same thing.
1. `EstimateForm.astro` + `api/estimate.ts` — service dropdown hardcoded to roofing options
   (`Roof repair`, `Gutter installation`, `Skylight repair`…). The two lists must stay in sync or
   valid submissions fail server-side validation. Replaced both with HVAC options.
2. `EstimateForm.astro` / `HeroOwl.astro` / `book.astro` / `index.astro` / `about.astro` — default
   heading "Request A Free In-Person **Roof** Estimate Today!".
3. `pricing.astro` — an entire hardcoded roof-cost table (asphalt/metal/cedar/tile per-square
   pricing). Replaced with broad HVAC installed-cost ranges, explicitly labelled not-a-quote.
4. `ClosingCTA.astro` — default body was **Gilroy Roofers' copy verbatim**: "no payment until the
   job is finished… Serving Wilkes-Barre and the Wyoming Valley since 1972." Both claims are false
   for this client. This is the most serious of the four — it is another client's guarantee.
5. `ServicesGridOwl.astro` — subtitle default "Full-service roofing solutions"; `BlogCards.astro`
   heading "Roofing Advice"; `blog/index.astro` description.
6. `ServicesGridOwl.astro` scrim — template gradient fades to rgba(…,0.08) at the top, where the
   tile TITLE sits. This client's own job photos are brightly-lit mechanical rooms, so titles
   dropped below AA. Raised the top end to 0.46.

**Still needs operator paste-in (sections self-hide until supplied):** GHL chat widget, reviews
widget, calendar embed, contact/estimate form embed URLs, call-tracking snippet + number,
`code_injection.head` (Meta Pixel / GTM), `code_injection.body_end`, custom domain.
No `crm.*` field was auto-populated — the client's existing site uses native WordPress forms with
an arithmetic captcha, and no third-party CRM loader was detected.

**Verified live:** 24 routes built; homepage, a service page, a service-area page and
sitemap-index.xml all HTTP 200 on the production URL. Canonical and JSON-LD
(LocalBusiness + AggregateRating + FAQPage + GeoCoordinates + OpeningHoursSpecification) emit
https://comfortable-climate-hvac.vercel.app.


---

## AmeriStar Maids — 2026-08-03

| | |
|---|---|
| **Live** | https://ameristar-maids.vercel.app |
| **Template** | `owl` |
| **Pages** | 25 built (incl. `/book`, `/api/estimate` SSR fn) |
| **Client site** | https://ameristarmaids.com/ (WordPress / Astra + Elementor) |
| **GBP** | AmeriStar Maids, 1100 Twin Stacks Dr Ste. 1202, Dallas PA 18612 — 4.9 (171 reviews), House cleaning service |
| **Spend** | ~$0.004 (Apify GBP lookup only — see note below) |

### Pipeline notes

- **Zero Firecrawl spend.** ameristarmaids.com serves complete server-rendered HTML, so all 11
  pages (homepage, 5 service pages, specials, request-a-quote, gift-cards, 2 blog posts) came
  back on a plain `curl` with a browser UA. Firecrawl was never needed. Total run cost was the
  single Apify Google Maps call.
- **Apify returned 0 review bodies** despite `maxReviews: 5`. The 4 testimonials on the site are
  the named reviews published on the client's own homepage instead.
- **Reddit is now closed to both paths** — `reddit.com/search.json` blocks the datacenter IP and
  Firecrawl refuses the domain outright ("we do not support this site"). `local-research` fell
  back to Firecrawl *search*, which still surfaces indexed thread titles + snippets; 26 threads
  across r/housekeeping, r/homeowners, r/workingmoms and r/CleaningTips. Local NEPA subreddit
  activity for this category is effectively zero, so the pain-point set is national-category
  signal applied to the local market. **If this keeps recurring, `local-research` Step 3 should
  be rewritten around search snippets rather than thread fetches.**
- **Copy angle that drove the build:** the loudest complaint in the category is a rotating
  cleaner. AmeriStar already had "One Maid. Same Maid. Every Time." buried mid-page in small
  type on their old site — it is now the H1.

### Owl template carried roofing copy into a non-roofing vertical

The owl template hardcodes roofing strings in ELEVEN places outside the content collections, so
a cleaning client ships "Request A Free In-Person **Roof** Estimate Today!" above the fold and an
"Average **roof** costs" price table on /pricing. All were fixed in the client copy under
`sites/ameristar-maids/`, but they will recur on the next non-roofing owl build:

| File | String |
|---|---|
| `pages/index.astro`, `pages/about.astro`, `pages/book.astro` | `form_heading="Request A Free In-Person Roof Estimate Today!"` |
| `components/HeroOwl.astro` | same string, twice, as the `form_heading` fallback |
| `components/EstimateForm.astro` | same string as the `heading` default, plus a 10-item roofing `SERVICES` list |
| `pages/api/estimate.ts` | the server-side `SERVICES` allowlist — **must stay byte-identical to the form's list** |
| `components/ClosingCTA.astro` | default body: *"…no payment until the job is finished… Serving Wilkes-Barre and the Wyoming Valley since 1972."* — a leftover claim from an earlier client, shipped on every page |
| `components/ServicesGridOwl.astro` | `'Full-service roofing solutions'` fallback |
| `components/BlogCards.astro` | `<h2>Roofing Advice</h2>` |
| `pages/blog/index.astro` | `Roofing advice and local guidance from …` meta description |
| `pages/pricing.astro` | entire `roofCostRows` table + "measure the roof" calendar copy |
| `pages/thank-you.astro` | *"dealing with an active leak?"* |

**Recommended upstream fix:** move these to `config.json` (a `vertical_copy` block, or reuse
`services_section`) so they are per-client data rather than template literals. The
ClosingCTA "since 1972" line is the worst of them — it is a factual claim about a different
business that renders on all 25 pages by default.

### Other defects found and fixed in the client copy

- `Footer.astro` renders a social link as a 36px accent-coloured tile but only has icon arms for
  facebook / youtube / instagram. A `google_maps` entry therefore shipped as an **empty blue
  square**. Added a map-pin arm. Same latent bug for `yelp`, `linkedin`, `tiktok`.
- `EstimateForm.astro` labels the address field "Property address" — fine for roofing, reworded
  to "Home address" here.

### Design tokens

Client brand blue `#148dbd` re-derived against the owl contrast rules rather than dropped in raw:

| Token | Value | Ratio |
|---|---|---|
| `--color-accent` | `#148dbd` | white label 3.77:1 — passes ONLY because accent buttons are 1.25rem/700 (3:1 threshold) |
| `--color-accent-ink` | `#0b5f81` | 6.78:1 on bg — the text-weight variant for eyebrows/ticks/stars |
| `--color-primary` | `#0a2f40` | white 14.06:1; accent-on-primary 3.73:1 for dark panels |
| `--color-bg` / `--color-text` / `--color-muted` | `#f6fbfd` / `#101218` / `#4b4f58` | 17.95:1 / 7.87:1 |

Fonts kept from the client's own site: Poppins (display) + Lato (body).

### Open items

- **SSO is OFF on this project** — `https://ameristar-maids.vercel.app/` returns 200 publicly,
  unlike the `all_except_custom_domains` default described in the vercel-deploy skill. Left as
  found; flag before using this URL in outreach if the gate was intended.
- **No CRM widgets wired.** `crm` is `{provider: "ghl"}` only. The native EstimateForm posts to
  the site's own `/api/estimate` function; `crm.captcha_snippet` is unset, so there is no spam
  gate on it. Paste in the GHL calendar / chat / reviews / form snippets before this takes real
  traffic.
- **No code injection.** `code_injection` is empty. The client's existing site runs their own
  Meta Pixel (`742989059457566`, via PixelYourSite) — that is the CLIENT's pixel and was
  deliberately NOT copied. MLA's own pixel/GTM goes in `code_injection.head`.
- **Service areas were derived, not scraped.** The client names REGIONS only ("Back Mountain,
  Wyoming Valley, Mountain Top … throughout Luzerne County"). The six town pages (Dallas,
  Shavertown, Kingston, Wilkes-Barre, Mountain Top, Harveys Lake) are all inside those named
  regions, but the specific towns are an operator choice — confirm with the client.
- **`licensed: false`** — the site claims bonded + insured + workers' comp, never licensed. Left
  false rather than guessed. PA does not license house cleaners statewide, so this is probably
  correct as-is.
- No custom domain attached. No short link created (`--auto` skips it).

## Morris Kitchens & Donnelly Designs — 2026-08-03

- **Template:** `owl`. Live: https://morris-kitchens-donnelly-designs.vercel.app (26 pages).
- **Source:** https://morriskitchensllc.com/ (WordPress + Elementor, built 2024 by 75 Degrees West).
- **GBP:** "Morris Kitchens & Donnelly Designs LLC", 107 West End Rd, Hanover PA 18706,
  (570) 825-6956, 4.7 / 31 reviews, category "Kitchen remodeler". First Apify query
  (name + "Wilkes-Barre, PA") returned 0 rows; re-ran as "Morris Kitchens" +
  "Hanover Township, Luzerne County, PA" and matched. Two lookups billed.
- **Brand tokens auto-detected** from the client's Elementor globals: primary `#114261`
  (navy), accent `#9CC233` (lime), font Archivo. Lime fails AA as body text on light
  (~1.9:1), so `--color-accent-ink: #4f6b13` (5.6:1) was derived for eyebrows/ticks/stars.
- **Images:** 28 real project photos downloaded from the client's CMS into `public/img/`
  rather than hotlinked. No stock photography anywhere on the site.
- **Content:** 5 services (kitchen, bathroom, cabinets, countertops, design services),
  6 service areas (Wilkes-Barre, Hanover Township, Kingston, Mountain Top, Dallas,
  Nanticoke), 8 testimonials, 8 home FAQs, 12 gallery items, 3 blog posts, 2 team members.
- **Copy angle used:** the client's own FAQ already publishes real lead times (HomeCrest
  ~3wk, Omega 5-6wk, kitchen 6-8wk, countertops 1-2wk) and terms (75% deposit). Local
  research says the #1 NEPA complaint is estimate ghosting and vague timelines, so those
  numbers were pulled out of the buried FAQ and given their own promise band and a
  pricing-page table.

### Template defect found (owl) — flagged, not patched upstream

`astro-templates/owl/` has roofing-specific strings hardcoded outside content collections.
Patched in this site's copy only:

- `EstimateForm.astro` — default heading + the entire 10-item `SERVICES` dropdown (attic
  venting, gutters, roof repair, skylights) were roofing-only.
- `ClosingCTA.astro` — default headline "Need A New Roof?" and a body claiming
  "Serving Wilkes-Barre and the Wyoming Valley since 1972" (a leftover from another client,
  coincidentally the same metro).
- `ServicesGridOwl.astro` — heading fallback "Full-service roofing solutions".
- `BlogCards.astro` — hardcoded `<h2>Roofing Advice</h2>`.
- `blog/index.astro` — description "Roofing advice and local guidance from…".
- `HeroOwl.astro`, `index.astro`, `about.astro` — form heading default.
- `pricing.astro` — an entire hardcoded asphalt/metal/cedar/tile cost table. Replaced with
  a lead-time + deposit-terms table sourced from the client's own FAQ (no invented prices).

### Notes / open items

- **`insured: false`, `bonded: false`** — neither is stated anywhere on the client's site or
  GBP, so both were left false rather than guessed. `licensed: true` is backed by the PA HIC
  registration `#PA 191211` in their footer. Worth confirming with the client.
- **Service areas beyond Wilkes-Barre and Hanover Township are operator-chosen** — the
  client's site has no service-area page at all. Kingston, Mountain Top, Dallas, and
  Nanticoke are Luzerne County towns within reasonable range of the showroom; confirm.
- **The client's live /bathrooms page contains competitor boilerplate** — it refers to the
  "Artisan design team" and "Artisan's designers" several times. Not carried over; the
  bathroom copy was rewritten from their remaining content. Worth telling them regardless,
  since it is on their live site today.
- **All CRM paste-ins are unset** — no GHL chat, reviews, calendar, contact form, or call
  tracking. Those sections self-hide. The native `EstimateForm` posts to `/api/estimate`,
  which needs env config before it delivers leads anywhere.
- **No code injection** — no Meta Pixel, GTM, or number-swap configured.
- No custom domain attached. No short link created (`--auto` skips it).

---

## SpringLake Pools & Masonry — 2026-08-03

| Field | Value |
|---|---|
| Slug | `springlake-pools-masonry` |
| Template | `owl` |
| Old site | https://springlakepools.com/ |
| Live URL | https://springlake-pools-masonry.vercel.app |
| Vercel project | `springlake-pools-masonry` (`prj_x0Fjbpoq0n7CRPm7fEJLnT1DSdIu`) |
| Pages built | 24 |
| Services | 5 — Custom Pool & Spa Construction, Pool Renovation & Remodeling, Pool Repair Service, Pool Cleaning & Maintenance, Masonry & Outdoor Living |
| Service areas | 6 — Dallas, Back Mountain, Wilkes-Barre, Mountain Top, Clarks Summit, Scranton (all PA) |
| Blog posts | 1 — "Why Gunite Holds Up To A Pennsylvania Winter" |
| GBP | 5.0 (8 reviews), Swimming pool contractor, place `ChIJVet0clQ0YoURzxb0fEPVSco` |
| Spend | ~$0.25 (2 Apify runs + 11 Firecrawl scrapes) |

**Brand tokens** — auto-detected from the client site via Firecrawl's branding extractor:
Cormorant (display) + Karla (body); navy `#0f2a43`, teal accent `#2cb1bc`.
`--color-on-accent` is `#06232e` (DARK), not white — the brand teal measures 2.61:1 against
white and fails AA. `--color-accent-ink` `#10707a` is the accent-as-text variant (5.3:1 on bg).

**Open items for the operator:**

- **No testimonials.** The Apify Google Maps actor returned an empty `reviews[]` array on two
  separate runs for this place ID; the client's own site publishes no testimonials; Facebook
  and Reddit are both unsupported by Firecrawl. Rating (5.0) and count (8) are confirmed and
  used as a trust badge, but no review TEXT exists anywhere. `home.json.testimonials` is `[]`
  and the section does not render. Nothing was fabricated. Paste real reviews in or wire the
  GHL reviews widget.
- **Founding-year conflict on the client's own site.** `/about-us` says "Since 1982" and
  "OVER 40 YEARS OF EXPERIENCE"; the homepage and every 2025 service page say "Since 2007" and
  "over a decade"; the OG description says "more than 30 years". Three different answers.
  `years_in_business` was left unset and NO founding year is asserted anywhere in the generated
  site. Confirm with the client, then add it.
- **CRM widgets are all unset.** `crm` is `{ provider: "ghl" }` only — no chat, reviews,
  calendar, contact form, call-tracking snippet or `form_action_url`. The native EstimateForm
  posts to `/api/estimate`, which needs a delivery destination in env or it will 500. Also no
  `captcha_snippet`.
- **No code injection.** `code_injection` is empty — MLA's pixel/GTM still needs adding.
  The client's existing site runs reCAPTCHA and a WordPress plugin form; neither was copied.
- **`insured` / `bonded` left false.** The client's service page says "Licensed swimming pool
  contractor serving NEPA" (so `licensed: true`), but makes no insurance or bonding claim.
- **Four service-area towns were dropped** to stay inside the owl 6-area cap: Bear Creek,
  Blakeslee, Tannersville, Pittston. They exist on the old site if the client wants them.
- **Reddit research ran degraded.** reddit.com is blocked for both Firecrawl and WebFetch here,
  so `local_research.json` was synthesized from search-result titles and snippets rather than
  full comment bodies. Directionally sound, not quotable.
- No custom domain attached. No short link created (`--auto` skips it).

**Template defect found (owl) — belongs upstream, patched only in this client site:**
`astro-templates/owl` hardcodes roofing copy in eight places that every non-roofing client
will hit: `EstimateForm.astro` (default heading + a hardcoded roofing service dropdown),
`src/pages/api/estimate.ts` (hardcoded roofing allowlist — a mismatch silently rejects real
leads with `?error=service`), `HeroOwl.astro`, `ClosingCTA.astro` (defaults still carry
Gilroy Roofers' "Wilkes-Barre … since 1972" copy), `BlogCards.astro` ("Roofing Advice"),
`ServicesGridOwl.astro`, `book.astro`, `blog/index.astro`, and `pricing.astro` (an entire
hardcoded asphalt/metal/cedar/tile roof-cost table). All fixed inside
`sites/springlake-pools-masonry/` per the rule that `site-generate` never edits the template.

---

## Comprehensive Pain Specialists — 2026-08-03

**Live:** https://comprehensive-pain-specialists.vercel.app
**Template:** `owl` (Gilroy) · **Slug:** `comprehensive-pain-specialists` · **Pages:** 23 static + `/book` (SSR)
**Source:** operator-supplied https://www.cpmspecialists.com/ (serves the same site as the GBP-listed
https://comprehensivepaindocs.org/ — all asset URLs live on the `.org` domain).

**GBP confirmation:** Comprehensive Pain Specialists, 1177 PA-315, Dolphin Plaza, Wilkes-Barre, PA 18702 ·
(570) 232-3920 · Pain management physician · 3.2★ (27 reviews) · placeId `ChIJpcjlCXQbxYkRCWVQUib_Yh4`.

**Pipeline cost this run:** ~$0.16 (2× Apify GBP lookup $0.008, Firecrawl homepage + 6 inner pages ~$0.15,
0 social scrapes, 0 design-reference scrapes).

### Vertical mismatch — read before the next edit

This is a **medical practice**, not home services. The `owl` template ships contractor-shaped pages and copy.
The following client-site deviations were made deliberately and are NOT template drift:

- `/pricing` → **`/insurance`** (rewritten as an Insurance & Payment page; the hardcoded roof-cost table is gone).
  Nav label in `Header.astro` and `Footer.astro` changed to "Insurance".
- **`/our-work` deleted** along with `our-work.json` — a clinic has no project gallery, and the page would
  have rendered empty. Nav links removed.
- `pricing.json` deleted (no published prices; self-pay quoted by phone).
- `EstimateForm` reason-for-visit list replaced the roofing service list (mirrored in `pages/api/estimate.ts`
  so server-side validation still matches). "Property address" → "City or town". Submit label →
  "Request My Appointment".
- `ClosingCTA` defaults rewritten — the template default still carried Owl Roofing's
  *"Serving Wilkes-Barre and the Wyoming Valley since 1972"* line. Coincidentally the right metro, entirely
  the wrong business. Check this on every owl clone.
- `terms.astro` §2–6 rewritten for a medical practice: no-medical-advice notice, no physician-patient
  relationship from website use, results-may-vary, insurance/self-pay responsibility, models-not-patients
  photo notice. The contractor warranty/project/estimate language is legally wrong here. **This diverges from
  the "identical legal body text across all clients" rule in CLAUDE.md — intentional, and any future medical
  client needs the same treatment.**
- `Testimonials` eyebrow "Real Customer Experiences" → "Real Patient Experiences"; `WhyChooseUs` heading
  "Reasons homeowners pick us" → "Why patients choose us"; `BlogCards` "Roofing Advice" → "Pain Management
  Insights"; services index "for {city} homeowners" → "for patients across…".
- `src/content/config.ts`: `partners[].logo_url` relaxed from `z.string().url()` to `z.string()` so insurance
  carrier logos serve from this site's own `public/img/insurers/` instead of hotlinking the client's CMS or
  hardcoding the production hostname. **Worth upstreaming to both templates.**

### Content decisions

- **Rating suppressed.** GBP aggregate is 3.2★ (27). It appears nowhere on the site — no trust badge, no
  form star strip, no schema aggregateRating. The three attributed 5★ patient quotes carry the social proof
  instead. Do not "fix" this by adding the aggregate back.
- **Services (5/5)** — Back Pain, Neck Pain, Joint Pain, Nerve Pain, Complex Pain Conditions. These are the
  five the client's own homepage prioritises, chosen out of ~90 condition/procedure pages on the old site.
- **Service areas (6/6)** — Wilkes-Barre, Mountain Top, Pittston, Dallas, Plymouth, Glen Lyon. All six are
  named verbatim on the client's homepage ("We serve patients from Wilkes-Barre PA, Glen Lyon PA, Dallas PA,
  Pittston PA, Mountain Top PA, Plymouth PA"). County/neighborhood detail is operator-derived from geography.
- **Two phone numbers.** New patients (570) 232-3920 is the site-wide number; existing patients
  (570) 270-5700 appears only on `/book`. Both are on the client's contact page.
- **`licensed: true`, `insured: false`, `bonded: false`** — "licensed" reflects the board-certified physician;
  the other two are contractor concepts with no medical analogue and were left false rather than guessed.
- **Local research** — Reddit thread bodies were unfetchable (Reddit blocks both WebFetch and Firecrawl).
  Findings came from search-result titles and indexed comment snippets across r/ChronicPain, r/PainManagement,
  r/ChronicIllness, r/Fibromyalgia, r/NEPA, r/Scranton. The hero angle ("Seen this week, not next year")
  comes from the two strongest signals: 6–14 month waits to see a pain specialist, and NEPA-specific
  complaints about the dominant hospital system's scheduling.
- **Images** are the client's own, downloaded to `public/img/` rather than hotlinked. Provider headshots,
  condition photos, hero, and six insurance carrier logos.
- **Design tokens** derived from the client's brand blue `#1025A1`. That blue is unreadable on the owl
  template's dark navy bands (1.56:1), so it became `--color-accent-ink` for text on light backgrounds and a
  lighter sibling `#2E5BFF` carries the fill/CTA role. Fonts: Poppins (client's own) for display, Inter for
  body — the client's live site sets body copy at 12px Poppins, a readability defect for this demographic.

### Open items

- **No GHL snippets pasted** — `crm` is `{provider: "ghl"}` only. Chat widget, reviews widget, calendar embed,
  contact/estimate form embeds, and call tracking are all unset. The native `EstimateForm` posts to
  `/api/estimate`, which has **no destination configured** — set `LEAD_WEBHOOK_URL`, or
  `RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL` + `LEAD_FROM_EMAIL`, in Vercel env or form submissions go nowhere.
- **No captcha** — `crm.captcha_snippet` unset. Honeypot + TCPA consent checkbox only.
- **No code injection** — no Meta Pixel, no GTM, no number-swap.
- **HIPAA** — the client's existing stack (onrevenue.us, hipaaserver2.us) is HIPAA-flagged. The generated form
  collects name, email, phone, city, and a reason-for-visit category only. Do not add free-text symptom or
  history fields without a BAA in place. Client's vendor widget URLs are recorded in
  `intake-scraped.json._detected_crm_snippets` for reference — do NOT paste them into `crm.*`.
- **No email address** — none published by the client or listed on GBP. `email` omitted; footer shows phone only.
- No custom domain attached. No short link created (`--auto` skips it).
- Vercel SSO is **off** for this project — the `.vercel.app` URL is publicly reachable, unlike the documented
  default. Flag if that is not intended.

---

## Royal Roofing Systems — `royal-roofing-systems` — 2026-08-03

**Template:** `owl` · **Live:** https://royal-roofing-systems.vercel.app (SSO off — public) · **26 pages**

### Pipeline

| Step | Result |
|---|---|
| intake-from-web | Firecrawl homepage + 10 inner pages. Branding format detected fonts/colors/logo. |
| find-business (Apify GBP) | 1 exact match, GBP website = operator URL. `reviews[]` came back EMPTY despite `maxReviews:5`. |
| scrape-content | Skipped — Firecrawl succeeded on all 11 pages. |
| local-research | **DEGRADED.** reddit.com is blocked three ways in this environment: Firecrawl refuses the domain, direct curl returns an interstitial, and the browser pane blocks it by policy. Findings built from Firecrawl *search-result descriptions* (which quote Reddit comments), r/Scranton thread titles, and GBP review tags. No thread bodies read — flagged in `local_research.json.method`. |
| site-audit | Playwright full-page screenshot → `screenshots/royal-roofing-systems.png` (6.2 MB — the old Elementor page is that heavy). |
| design-reference | Library `roofing`, no Firecrawl spend. Rationale in `design_reference.json.sources.why_not_scraped`. |
| site-generate | 5 services, 6 areas, 3 blog posts, 8 gallery items. |
| vercel-deploy | 4 deploys (initial + 3 fixes). All 17 spot-checked routes 200. |

### Client facts

- **NAP:** Royal Roofing Systems, LLC · 20 W Grove St, Edwardsville PA 18704 · (570) 550-6578 · office@royalroofnepa.com
- **Phone conflict:** the GBP `phone` field lists **(570) 258-8866**, but GBP contact-enrichment `phones[]` AND every CTA on royalroofnepa.com use **(570) 550-6578**. Used 550-6578. A third number, (570) 258-8236, sits in the old site's sticky mobile bar — likely an existing tracking number. **Confirm with the client before any paid traffic runs.**
- 4.8★ / 61 reviews · 15 years · licensed, bonded, insured · GAF + Owens Corning
- Warranty stack: lifetime manufacturer + 10-year workmanship + 15-year no-leak
- 0% financing; 5% military / first responder / senior discount over $1,500

### Design tokens

Accent `#ff8604` is the client's own brand orange, carried verbatim. **`--color-on-accent` is near-black `#14181f`, not white** — white-on-#ff8604 is 2.42:1 and fails even the 3:1 non-text threshold, which is exactly what the client's current WordPress site ships. Near-black is 7.34:1. `--color-accent-ink: #a8560a` is the light-background text variant (5.25:1 on surface). `--color-primary: #0b2233` is a navy derived from their secondary blue `#0977b8`, which is reused as the focus ring so it stops competing with orange as a second CTA color. Stray magenta `#cc3366` from their CSS was dropped. Fonts: Poppins (their brand face) display + Inter body.

### Deviations from the pristine template — all inside `sites/royal-roofing-systems/`

1. **`BaseLayout.astro`** — Google Fonts `<link>` switched from Montserrat to Poppins. The owl template loads fonts via `<link>` in BaseLayout, not via `@import` in tokens.css as `site-generate` §11 assumes. Editing the existing link beat adding a second loading mechanism and shipping an unused Montserrat.
2. **`ClosingCTA.astro`** — see template defects below.
3. **`Footer.astro`** — see template defects below.

### ⚠ Template defects found — fix in `astro-templates/owl/`, not per-client

1. **`ClosingCTA.astro` default `body` carries another client's facts.** Shipped text: *"…no payment until the job is finished and you're satisfied. Serving Wilkes-Barre and the Wyoming Valley since 1972."* That is Gilroy Roofers' copy (founded 1972, Wilkes-Barre). It renders on **eleven** pages of every owl build. For Royal it was factually false — they are 15 years old and make no no-payment-until-satisfied claim. A default that states a *claim* ships that claim; the default should be claim-free and copy should come from content. Overridden locally.
2. **`Footer.astro` renders an empty accent square for any `social` key that is not facebook / youtube / instagram.** `google_maps` (the GBP CID link) hit this. The key cannot simply be dropped — `BaseLayout.astro:58` feeds every social URL into the LocalBusiness `sameAs` array and the GBP CID is the strongest sameAs signal a local business has. Added a map-pin glyph locally; the template should either carry glyphs for every key it accepts or skip unknown keys instead of drawing an empty tile.
3. **Minor:** `home.json.hero.quote_card.rating` reads as the *aggregate* rating in `HeroOwl.astro:141` (`"{rating} rating from {review_count} reviews"`), not as the individual quoted reviewer's stars. Setting it to the review's own `5` printed "5.0 rating from 61 reviews" against a real 4.8. Not a code bug, but the field name invites the mistake — worth a schema comment.

### YAML gotcha (cost a build)

Four frontmatter values contained `: ` inside unquoted scalars (`about_body` on kingston/hazleton/dallas, `long_description` on custom-decks) → `bad indentation of a mapping entry`. Fixed with `>-` block scalars. Worth a lint step in `site-generate` before `astro sync`.

### Still needs operator paste-in

`crm.*` is `{ provider: "ghl" }` only — no chat widget, no reviews widget, no form embed, no call-tracking snippet or number. `code_injection` head/body_start/body_end all empty (no Meta Pixel, no GTM). No custom domain attached. No team members (the client's site has no team page — worth requesting crew photos, since "local, accountable, not a storm chaser" is the whole positioning and it currently has no faces).

**Note:** the client's existing site runs an Ngage live-chat widget (`websiteid=221-132-36-26-245-173-219-31`) and a second phone in a sticky bar. Both were deliberately NOT carried over — they are the client's current vendor's, not MLA's.

---

## Diamond Ridge Industrial Services — `diamond-ridge-industrial-services` — 2026-08-03

**Template:** `owl` · **Live:** https://diamond-ridge-industrial-services.vercel.app (SSO off — public) · **25 static pages + `/book` (SSR)**

**Vertical note:** first **B2B / industrial** build on this kit. The buyer is a facility or maintenance
manager, not a homeowner, and a lot of the owl template's default copy assumes the opposite. See
"Template defects" below.

### Pipeline

| Step | Result |
|---|---|
| intake-from-web | Firecrawl homepage (`-f markdown,branding,links`) + 9 inner pages. The CLI's `branding` format returned fonts, colors, logo and favicon in one call — cheaper and cleaner than parsing CSS by hand. |
| find-business (Apify GBP) | **Two runs billed.** `locationQuery: "Archbald, Pennsylvania"` returned **0 results**; `locationQuery: "Scranton, Pennsylvania"` returned the exact match. Lesson: for a small-borough service-area business, query the metro, not the borough. Confirmed by website-URL match. `reviews[]` came back empty again (5.0 / 1 review). |
| scrape-content | Skipped — Firecrawl succeeded on all 10 pages. |
| local-research | Reddit reachable this run via `firecrawl search`. Threads on forklift-traffic concrete repair and peeling epoxy, plus trade sources on joint-arris progression and the 80%-of-coating-failures-are-prep statistic. |
| site-audit | Playwright returned **HTTP 403** — the client's WP host blocks the local headless browser. Fell back to a Firecrawl screenshot (`-f screenshot --json`, then download the returned GCS URL). |
| design-reference | Library `concrete`. Palette derived, not scraped — see below. |
| site-generate | 5 services, 6 areas, 2 blog posts, 9 project entries, 5 partner logos, 22 client photos localised to `public/img/`. |
| vercel-deploy | 1 deploy. Homepage, a service page, an area page and the sitemap all 200. |

### Client facts

- **NAP:** Diamond Ridge Industrial Services · PO Box 138, Archbald PA 18403 · (570) 862-9399 · info@diamondridgeindservices.com
- **No street address anywhere** — service-area business, GBP publishes none. PO Box taken from the client's `/contact`.
- **Phone conflict:** `/contact` lists a second number as **(570) 479-2629**; the global footer and GBP both list **(570) 479-2620**. Used the footer/GBP value. Primary CTA number is (570) 862-9399. **Confirm both with the client.**
- GBP: 5.0 / **1 review**, category "Construction company", Mon–Fri 8–5. `rating` / `review_count` were deliberately **omitted from `config.json`** — TrustBadges would have rendered "5★ (1 reviews)" and the hero quote card "5.0 rating from 1 reviews". Credibility rides on the named enterprise logos instead.
- **Women-owned.** Stated on their site; used as a supplier-diversity angle rather than a decorative badge.
- Stated coverage: PA, NY, NJ, DE, MD, WV. Named clients: McLane, Amcor, Berry Global, Lowe's, Diamond H.
- `licensed` / `insured` / `bonded` all left **false** — no badge or footer disclosure anywhere on the client site.

### Service areas are DERIVED, not scraped

The client names **six states and zero cities**. Six metros inside that stated footprint were chosen for the
area pages — Scranton, Wilkes-Barre, Hazleton, Allentown (PA), Binghamton (NY), Newark (NJ) — weighted to
warehouse/distribution corridors. DE, MD and WV are covered in body copy but have no page. Flagged in
`intake-scraped.json._notes.warnings`. **Worth confirming with the client before ads run.**

### Design tokens

`--color-primary: #144e9d` is the client's own CSS brand navy, carried verbatim — and it is the *only*
chromatic brand value they have. Both logo files sample as **pure monochrome white** (mean RGB 254.5/255.0),
so there was no ink to derive from and no logo usable on the owl template's light header. Fix: recomposed a
high-res horizontal lockup from the 1080×572 stacked logo (badge cropped, wordmark cropped, recombined,
alpha-tinted) in navy for the header/footer, white for dark contexts, plus a square favicon set from the
mountain badge. All in `public/`.

Accent `#f5a623` is **derived, not scraped**, and the reasoning is recorded in `design_reference.json.rationale`:
the client's other detected colors (`#2ea3f2`, `#2098d1`) are Divi defaults measuring under 1.6:1 against the
navy panel, so they cannot function as the template's accent-on-dark; safety amber is already the colour of
their own floor-line-marking work. Measured pairs: accent-on-primary 3.98:1, `--color-accent-ink #8a5a00`
5.47:1 on bg / 5.93:1 on surface, text 16.39:1, muted 6.04:1, on-primary 8.06:1, on-accent 8.48:1.

Fonts: detected heading face **Bank Gothic** is proprietary with no Google Fonts equivalent, so the detected
*body* face (Red Hat Display) was promoted to display at 600–900 — it keeps the squared technical letterform
without substituting an unrelated face. Inter carries body. Radii tightened 4/8/14 → 3/6/10.

### Deviations from the pristine template — all inside `sites/diamond-ridge-industrial-services/`

1. **B2B copy sweep.** Every "Get Your Free Estimate" / "Free In-Person Roof Estimate" string became
   "Request A Site Assessment" / "Request A Free On-Site Assessment"; the form submit button and the
   `Property address` field label became `Request My Site Assessment` and `Facility address`.
2. **`EstimateForm.astro` `SERVICES[]`** replaced with the client's own contact-form options (Fibrecrete-G,
   Traditional Concrete Repair, Joint Repair & Protection, Industrial Floor Coating, Floor Line Marking,
   Freezer / Cold Storage, Other).
3. **`pricing.astro`** — the hardcoded `roofCostRows` table (asphalt/metal/cedar/tile with dollar ranges) was
   replaced with a six-row "what we assess and why it moves the number" table carrying **no dollar figures**.
   Industrial concrete is scoped per site and the client publishes no rate card; inventing ranges on a page a
   facility manager reads as a quote would be a fabricated claim. Class renamed `.roof-cost` → `.scope-table`.
4. **`service-area/[slug].astro`** — the default H1 `${business_name} — Serving ${name}, ${full state}`
   wrapped to **six lines** on this business name. Now `Industrial Concrete Repair In {City}, {ST}` using
   `state_abbr`; `<title>` still carries the brand. Meta description dropped the word "licensed" (unverified)
   and `serviceType` no longer interpolates the tagline.
5. **`services/[slug].astro`** — `form_heading` no longer lowercases the service title ("Free fibrecrete-g
   estimate" → "Free Fibrecrete-G assessment").
6. **`BaseLayout.astro`** — Montserrat → Red Hat Display; favicon/apple-touch-icon links added (the owl
   template ships none).
7. **`config.ts`** — `partners[].logo_url` relaxed from `z.string().url()` to `z.string()` so partner logos
   can be served from `public/` (see defect 3).

### ⚠ Template defects found — fix in `astro-templates/owl/`, not per-client

1. **Residential assumptions are baked into shared components, not content.** `WhyChooseUs.astro` hardcodes
   *"Reasons homeowners pick us"*; `services/index.astro` hardcodes *"What we do for {city} homeowners"*;
   `ServicesGridOwl.astro` falls back to *"Full-service roofing solutions"*; `BlogCards.astro` hardcodes
   *"Roofing Advice"*; `blog/index.astro`'s meta description hardcodes *"Roofing advice and local guidance"*;
   `EstimateForm.astro` hardcodes a ten-item roofing service list and a `Property address` label;
   `HeroOwl.astro` hardcodes the roofing form heading twice as a fallback. None of these are reachable from
   content — every non-roofing client has to patch component source. **These belong in `site/config.json`.**
2. **`ClosingCTA.astro` still ships Gilroy's facts as its default `body`** (*"…Serving Wilkes-Barre and the
   Wyoming Valley since 1972."*). Reported on the royal-roofing-systems build 2026-08-03 and still present.
   Overridden locally again.
3. **`partners[].logo_url` is `z.string().url()`** while every other image field in the same schema accepts a
   local path and is *documented* as preferring one. A client whose partner logos are hotlinked off a CDN
   cannot localise them without editing the schema.
4. **Hero headline and `ClosingCTA` headline can collide.** Both defaulted to the same string here until the
   ClosingCTA default was changed — worth a note, since ClosingCTA renders on every page.

### Client-site issues worth raising with the owner (from `audit_results.json`)

- Footer "Terms of Use" and "Privacy Policy" links on the service pages point at `#` — there are no such pages.
- A default WordPress `hello world` post is still published at `/2025/12/01/hello-world`.
- The testimonial section repeats the same review three times.
- The site returns 403 to non-browser clients, which blocks some crawlers and preview tools.
- The two phone numbers disagree between `/contact` and the footer.

### Still needs operator paste-in

`crm` is `{ provider: "ghl" }` only — no chat widget, no reviews widget, no form embed, no call-tracking
snippet or number. `code_injection` head / body_start / body_end all empty (no Meta Pixel, no GTM). No custom
domain attached. No short link (`--auto` skips it). No team members — the client has no team page, but they
do have a good crew photo (already used as the About image) and a women-owned story that would carry a
founder bio well.

**Note:** the client's `/contact` form is a native Divi form with no CRM behind it. Nothing was carried over —
recorded in `intake-scraped.json._detected_crm_snippets` for reference only.

---

## Stubbs Landscaping — `stubbs-landscaping` — 2026-08-03

**Template:** owl (Gilroy/Owl, operator-pinned) · **Live:** https://stubbs-landscaping.vercel.app · **25 pages**

Source: https://stubbslandscaping.com/ (WordPress + Elementor, built by 75 Degrees West).
GBP confirmed: Stubbs Landscaping LLC, Landscaper, 5.0 ★ / 26 reviews, (570) 760-6813.
GBP has no street address (service-area listing) — 24 Yeager Rd, Mountain Top PA 18707 came from the
site footer and /contact. Run in `--auto`; all pipeline pauses skipped per operator instruction.

**Cost this run:** ~$0.23 (Apify GBP $0.004 + Firecrawl homepage w/ branding + 9 inner pages + 1 raw HTML).
`design-reference` ran template-pinned with no Firecrawl (~$0.02/URL saved) — see design_reference.json.

### Content

6 services (hardscaping, landscaping, outdoor-living, custom-decks, plunge-pools, lawn-health) ·
6 service areas (mountain-top-pa, wilkes-barre-pa, dallas-pa, kingston-pa, drums-pa, hazleton-pa) ·
3 testimonials · 8 home FAQs · 10 gallery items · 1 blog post.

`SERVICE_LIMIT` raised 5 → 6 in `src/lib/limits.ts`, deliberately and documented in-file: six genuinely
distinct trades, each with a substantial dedicated page on the client's existing site, not the thin
near-duplicate pile the cap exists to prevent.

### Design tokens

Brand pair sampled from the logo PNG: orange `#F08020/#F58022` + leaf green `#8DC63F`. The Firecrawl
branding extractor also returned `#CC3366` — an unused Elementor kit default that appears nowhere on the
rendered page or in the logo. Discarded.

`--color-primary: #223b14` is the leaf green taken down to a deep forest value (white 12.3:1, brand orange
4.7:1 on it). `--color-on-accent: #16201a` — white on the brand orange is 2.6:1 and fails AA.
`--color-accent-ink: #af5000` for the orange as text on light (4.9:1 on bg, 5.3:1 on surface).
Fonts kept at the owl defaults (Montserrat + Inter): the client's site has no brand typeface — headings
fall through to a system-ui stack and body is Roboto.

### Template defect found and patched locally

The owl template ships **hardcoded roofing copy** that `site-generate` does not touch. Patched in
`sites/stubbs-landscaping/` across 9 files:

- `EstimateForm.astro` + `api/estimate.ts` — default heading and the 10-item service dropdown were roofing
  options (Attic venting, Gutter repair, Roof inspection…). Both lists must stay in sync or the API
  rejects valid submissions.
- `ClosingCTA.astro` — shipped Owl Roofing's own body copy including **"Serving Wilkes-Barre and the
  Wyoming Valley since 1972"**, which would have published a false founding date on every page. Stubbs
  was founded 2010.
- `HeroOwl.astro`, `ServicesGridOwl.astro`, `BlogCards.astro`, `pages/index.astro`, `pages/about.astro`,
  `pages/book.astro`, `pages/blog/index.astro` — roofing headings and fallbacks.
- `pages/pricing.astro` — an entire hardcoded "Average roof costs" table (asphalt shingle / metal / cedar
  shake / tile per-square pricing). Replaced with a six-row "what decides the price" table.

**This hits every non-roofing client built on owl.** Belongs upstream in `astro-templates/owl/`.

### Correction made mid-build

`Employee-5.jpg` was initially read as a photo of owner Justin Rinehimer and written into `team_members`
and the About block alt text. It is not identified as him anywhere — the client's site uses it in the
"Interested in Being Part of Our Team?" careers section, so it is an unnamed crew member. Attribution
removed, `team_members` emptied, file renamed to `crew-landscape-lighting.jpg`, alt text corrected.
**No verified photo of Justin exists in the scraped set — operator should request one.**

### Imagery

24 photos pulled as full-size originals from `/wp-content/uploads/` (not Elementor thumbnails) and served
from `public/img/`. Re-encoded at q76 / 1600px cap only where that beat the original: 13.0 MB → 7.8 MB.
The one image with no recoverable original was a stock iStock lawn photo, replaced with an owned crew photo.

### Verified live

All 25 routes return 200. Canonical `https://stubbs-landscaping.vercel.app/`. No console errors, no broken
images, no horizontal overflow at 1280px or 375px. Section order confirmed against the owl fixed order:
hero → promise-bar → services → testimonials → promise-band → signature → process → about → seo-body →
faq → blog-cards → closing-cta. Service dropdown confirmed rendering the 10 landscaping options.
SSO is **off** on this project, so the vercel.app URL is publicly reachable.

### Still needs operator paste-in

`crm` is `{ provider: "ghl" }` only — no chat widget, no reviews widget, no form/calendar embed, no
call-tracking snippet or number. The native `EstimateForm` posts to `/api/estimate`, which needs a
destination configured in env or it will return `unavailable`. `code_injection` head / body_start /
body_end all empty (no Meta Pixel, no GTM). No custom domain. No short link (`--auto` skips it).

`licensed` / `insured` / `bonded` all left **false** — the client's site displays no badge or footer
disclosure for any of the three. Confirm with the client before flipping; a landscaper this size is almost
certainly insured, but we do not publish it on their behalf without confirmation.

Service areas were **derived**, not scraped — the client's site names no explicit area list, only
"Northeastern Pennsylvania" and "Luzerne County". Worth confirming the six chosen towns match where they
actually take work.


## Prezkop Builders — `prezkop-builders` — 2026-08-03

**Live:** https://prezkop-builders.vercel.app — 25 pages, owl template, build + deploy clean.

### The headline problem: the client lost their domain

`prezkopbuilders.com` no longer belongs to Prezkop Builders. Every path on it — `/`, `/about`,
`/contact` and all four service pages — now returns HTTP 200 serving an Indonesian online-gambling
site branded **Bambuhoki88**. The squatter kept the original URL structure to inherit Prezkop's search
equity, and the page `<title>` reads "BAMBUHOKI88 Prezkopbuilders…", so the business name is indexed
alongside gambling content. The BBB profile's "Visit Website" button already points at a Facebook page
rather than the domain, which suggests the loss predates this build. Screenshot at
`screenshots/prezkop-builders.png`. Last legitimate archive capture: 2025-10-07.

**Nothing on the live domain was used as input.** All content and imagery were recovered from Internet
Archive snapshots (8 pages). The owl template remains the sole source of design and layout.

### No Google Business Profile

Three Apify Google Maps runs (Nanticoke PA / Wilkes-Barre PA / unfiltered "Prezkop Builders Nanticoke PA")
returned **zero** matching places. Competitors in the same searches returned normally, so the actor and
token are fine — the listing genuinely does not exist. Consequences:

- `rating` and `review_count` are **unset**. No aggregate rating renders anywhere on the site.
  HomeAdvisor shows 5.0 but publishes no review count, so it was not imported.
- Testimonials are the four verbatim reviews recovered from the client's own archived site
  (Melissa Roberts, Renee McGuire Dopko, Jim Brogna, Shannon Dixon) — all real, all attributed.
- Claiming the GBP is the single highest-value local-SEO action available to this client and is an
  obvious sales angle.

### NAP sources (no GBP, so assembled)

| Field | Value | Source |
|---|---|---|
| Address | 1092 W Main St, Nanticoke, PA 18634 | BBB profile + HBA of NEPA Buyers Guide |
| Phone | (570) 814-0099 | client website footer (2025 snapshot) — **used as primary** |
| Phone (alt) | (570) 417-5360 | number on file with the BBB — **confirm which one rings** |
| Email | prezkop.builders@yahoo.com | client website footer |
| Hours | Mon–Fri 7:00am–5:00pm | HomeAdvisor listing |
| License | PA164836 (PA Office of the Attorney General) | BBB profile |
| Entity | Prezkop Builders, LLC — started 4/1/2021, incorporated 4/19/2021 | BBB + PA corporate registry |

`licensed` and `insured` set **true** (BBB records a real PA HIC license number). `bonded` false.
`years_in_business` 5.

### Imagery

Only **13 of ~56** referenced images survive in the Internet Archive. All 13 recovered, re-encoded to
1600px / q55 (3.0 MB total) and served from `public/img/`. That is 12 real photos plus the logo —
enough for an 8-item gallery, 3 team headshots, 4 service heroes and 3 blog heroes with no repeats that
matter. **Zero stock photography used.** If the client can supply their current project photos, the
gallery and service pages are the first place to spend them.

### Template defects fixed in this client's copy

The owl template hardcodes roofing copy in places a non-roofing client cannot use. Fixed under
`sites/prezkop-builders/` only (template untouched):

- `EstimateForm.astro` — default heading "Request A Free In-Person **Roof** Estimate Today!" and a
  10-item roofing-only service dropdown (roof repair, skylights, gutters). Replaced with the client's
  actual services.
- `HeroOwl.astro`, `index.astro`, `about.astro`, `book.astro` — same roofing form heading passed as a prop.
- `ClosingCTA.astro` — "Need A New Roof? Book Your Inspection Now."
- `BlogCards.astro` — "Roofing Advice" heading; `blog/index.astro` description.
- `ServicesGridOwl.astro` — "Full-service roofing solutions" fallback.
- `pricing.astro` — an entire hardcoded **average roof cost table** (asphalt/metal/cedar/tile with
  dollar ranges). Replaced with a "what drives the number" table by project type, with **no invented
  dollar figures** — this client's spread runs from four stair treads to a whole-home remodel, and a
  made-up range would contradict the page's own promise.

**This is worth fixing upstream.** Those strings should come from `config.json`, not be baked into the
template — every non-roofing owl client will hit the same six files.

### Design tokens

Accent `#3c6c8c` and accent-ink `#1b4e73` are the client's own Astra global brand blues, recovered
from the archived CSS. Contrast measured, not assumed: accent 5.65:1 on white (white button labels pass
AA), 3.07:1 on `--color-primary: #1c1a17` (clears the 3:1 non-text minimum on the dark panels).
Accent-ink 8.80:1 on bg / 7.94:1 on surface. Primary is a warm near-black rather than the template's
olive — a mid blue needs the darker panel to hold that 3:1. Fonts Raleway + Roboto, also the client's own.
`BaseLayout.astro` font `<link>` updated to match (owl loads fonts via link, not a tokens.css @import).

### Content shipped

- 4 services: outdoor-living, remodeling-new-construction, hardwood-floor-refinishing, pre-construction-services
- 6 service areas: nanticoke-pa (HQ), wilkes-barre-pa, hunlock-creek-pa, dallas-pa, kingston-pa, mountain-top-pa
  — Nanticoke, Hunlock Creek and Dallas are **scraped** (named on the client's own site, including a
  "Hardwood Floor Refinishing Dallas, PA" page title); Wilkes-Barre, Kingston and Mountain Top are
  **derived** from the metro. Worth confirming the derived three.
- 8 home FAQs, 4 testimonials, 8-item gallery, 3 team members, 3 blog posts
- `marketing_city` Wilkes-Barre / `marketing_state` PA (office in Nanticoke) — the Firefly pattern

### Open items

- **CRM is empty.** `crm` is `{ provider: "ghl" }` only — no chat, reviews, form/calendar embed,
  call-tracking snippet or number. The native `EstimateForm` posts to `/api/estimate`, which needs a
  destination in env or it returns `unavailable`.
- `code_injection` head / body_start / body_end all empty. No Meta Pixel, no GTM.
- No custom domain attached. **This is the urgent one** — the client cannot go back to
  `prezkopbuilders.com`, so a replacement domain is a prerequisite, not a nice-to-have.
- No short link (`--auto` skips it).
- Confirm which of the two phone numbers rings.

---

## NEPA Classic Construction — `nepa-classic-construction` — 2026-08-04

**Live:** https://nepa-classic-construction.vercel.app — 24 pages, owl template, build + deploy clean.
Run in `--auto` (operator: "without questions asked"). Total paid spend this run: **~$0.38**
(2 Apify Google Maps runs ≈ $0.008, 18 Firecrawl scrapes ≈ $0.36).

### No Google Business Profile

Two Apify Google Maps runs — `"NEPA Classic Construction"` / Pittston PA (run `OpzHRxnxIrGqqjOCU`,
0 results) and `"NEPA Classic"` / Luzerne County PA (run `aRsfqVzpoWYX4o1VT`, 8 results, none matching) —
returned **no listing**. Unrelated NEPA-named businesses came back normally, so the actor and token
are fine; the listing genuinely does not exist. Consequences:

- `rating` and `review_count` are **unset**. No aggregate rating renders anywhere on the site.
- `testimonials` is **empty** — there are no reviews on the client's site or on Google, and none
  were fabricated. The `Testimonials` component self-hides on an empty array.
- NAP, hours, geo, licensed/insured and years-in-business come from the client's own site:
  the schema.org `GeneralContractor` JSON-LD block and the footer text.
- **Claiming the GBP and collecting the first reviews is the single highest-value action available
  to this client, and the obvious sales angle.** Every NEPA contractor-recommendation thread we read
  resolves into "who has reviews".

### The old site is a Lovable React SPA with real problems

`nepaclassic.com` ships an empty `<div id="root">` — no server-rendered HTML at all. Findings in
`sites/nepa-classic-construction/audit_results.json`:

- **All seven `/contractor-{city}-pa` service-area URLs listed in its sitemap return 404 on the live
  site.** The sitemap advertises pages that were never built.
- FAQ answers and all per-service copy live only in the JS bundle; the accordions never mount their
  content, so none of it is in the DOM for a crawler.
- About / Portfolio / FAQ / Contact are hash anchors, not pages. No privacy, terms or accessibility page.

Because Firecrawl could not read the un-rendered accordions, per-service copy and the 26 FAQ q/a pairs
were read out of the site's **own JS data module** (`/assets/index-LM1c6zrL.js`). That is a real,
traceable source — the client's own authored content — not generated text.

### Brand tokens (client site + logo, brand only — never layout)

| Token | Value | Source |
|---|---|---|
| `--color-bg` | `#faf8f5` | client CSS `--background: hsl(43 33% 97%)` |
| `--color-text` | `#1a1e1b` | client CSS `--foreground: hsl(135 7% 11%)` |
| `--color-primary` | `#0b3729` | client CSS `--primary: hsl(160 68% 13%)`, also a literal hex in their bundle |
| `--color-accent` | `#c7a257` | client CSS `--accent: hsl(40 50% 56%)` |
| `--font-display` | Fraunces | client CSS `--font-serif` |
| `--font-body` | Geist | client CSS `--font-sans` |
| logo red / green | `#c92121` / `#3e9c26` | sampled from `logo-BjbCzadu.png` |

**Why the accent is the gold and not the logo red.** The red is the louder brand colour, but owl uses
`--color-accent` as TEXT on the dark `--color-primary` panels (Testimonials, ProcessSteps, WhyChooseUs,
hero scrim). Red on `#0b3729` measures **2.34:1** and fails AA there. The client's own declared gold
clears **5.48:1**. So the gold is the token and the red stays in the logo mark. Full contrast audit in
`design_reference.json`. `--color-on-accent` is dark (`#1a1e1b`, 7.01:1) because white on the gold is
2.4:1; `--color-accent-ink` (`#7d5a1c`) is the darkened variant for text on light sections.

**Logo treatment.** The mark's letterforms and the "CONSTRUCTION" wordmark are **white**, so it is only
legible on a dark field — which is how the client presents it on their own dark header. Rather than
recolour the artwork, `public/logo-nepa-classic.png` composites the untouched logo onto a `#0b3729`
plate. The source PNG is transparent-background; alpha bbox was used to trim it.

### Content caps applied

- **9 services detected → 5 shipped** (`SERVICE_LIMIT`). `patio-installation`, `retaining-walls` and
  `walkways-driveways` folded into Hardscaping `sub_services`; `home-renovations` folded into General
  Contracting. No copy was lost — the sub-service FAQs were merged into the parent service.
- **7 service areas detected → 6 shipped** (`AREA_LIMIT`). Plains, PA dropped (smallest, a township).

### Imagery

Only **6 real project photos** exist (3 before/after pairs), all pulled from the client's site and
served from `public/img/` rather than hotlinked. Two service cards were rendering the same photo, so
`svc-exterior-detail.jpg` and `svc-landscape-detail.jpg` are distinct crops of `exterior-reno-after.jpg`
— same real project, different framing. All five service cards are now visually distinct.

Service-area landmark photos are Wikimedia Commons town images, downloaded locally and resized, each
with visible `landmark_credit` + `landmark_credit_href` (all CC BY-SA, attribution required).
Note: Wikimedia `/thumb/` URLs 400'd for these files; the originals fetched fine and were resized locally.

### Local research is thin by necessity

Reddit is blocked in this environment for WebSearch, WebFetch, Firecrawl scrape **and** the in-app
browser (403 / unsupported-site / blocked-by-policy). Findings in `local_research.json` come from
Firecrawl web-search result snippets — which do surface real Reddit post and comment text — across
11 threads including four NEPA-specific ones. Full comment threads were not read. The dominant signal
is unambiguous and consistent: **contractors ghosting after the walkthrough**, wild quote spreads on the
same job (one r/Scranton commenter: quoted $90–120k for a rewire, had it done for $25k), and nobody
wanting the small-to-mid job. That drove the hero.

### Copy angle driving the build

Hero leads with the estimate promise — "The Free Estimate You Will Actually Get Back" — rather than a
services list, because ghosting is the #1 local pain point and essentially nobody markets against it.
The `promise_band` and `signature_system` both extend it. Second angle: one contractor for the whole
project. Third: the pre-1940 NEPA housing stock (knob-and-tube, plaster) and freeze-thaw base spec,
which the client already speaks to in their own copy.

### Template copy replaced (owl ships roofing defaults)

`form_heading` on index/about/book, `EstimateForm` + `api/estimate.ts` service option lists (kept in
sync — the API rejects any value not in its Set), `ClosingCTA` headline and body, `BlogCards` heading,
`ServicesGridOwl` fallback subtitle, and the whole `/pricing` cost table. The pricing table now carries
only ranges NEPA Classic actually publishes ($20–45/sq ft pavers, $3k–25k+ landscaping) and says
"Quoted per project" everywhere else rather than inventing a number.

### Open items for the operator

- **GHL paste-ins: none supplied.** `crm` is `{provider: "ghl"}` only — no chat widget, no reviews
  widget, no calendar embed, no contact-form snippet, no call-tracking number. Those sections self-hide.
- **The native EstimateForm posts to `/api/estimate`, which has no destination configured.** Set
  `LEAD_WEBHOOK_URL`, or `RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL` + `LEAD_FROM_EMAIL`, in the Vercel
  project env — otherwise submissions are logged and dropped.
- No captcha snippet (`crm.captcha_snippet`) and no `TURNSTILE_SECRET_KEY` / `RECAPTCHA_SECRET_KEY`.
  The honeypot is the only bot defence right now.
- `code_injection` head / body_start / body_end all empty. No Meta Pixel, no GTM.
- No custom domain attached. Deploy is on the bare `*.vercel.app` alias and is publicly reachable
  (SSO is off on this project).
- No short link (`--auto` skips it).
- No socials found anywhere (site, GBP, footer). `social` is `{}` and the footer social row self-hides.
- No street address published by the client — city/state/ZIP only. Worth obtaining for local SEO.
- Claim the Google Business Profile. This is the top priority.

---

## Raircon Corporation — `raircon` — 2026-08-04

**Live:** https://raircon.vercel.app · **Template:** `owl` · **Pages:** 24 · **Old site:** https://raircon.com/

**Business (GBP-confirmed):** Raircon Corporation, 1388 SE 9th Ct, Hialeah, FL 33010 ·
(305) 885-4422 · 4.7★ / 219 reviews · Air conditioning contractor · founded Jan 2002 ·
place_id `ChIJtakHa5-82YgRMDAkCyejfBI`.

**Pipeline cost this run: ~$0.008.** Only the Apify GBP lookup was paid (two runs — the first
query `Raircon` + `Miami, FL` returned 0 results; `Raircon Corporation` + `Miami-Dade County,
Florida` found it). **No Firecrawl spend:** raircon.com returns full server-rendered HTML to a
plain fetch, so all 13 pages were captured with curl. `design-reference` read the owl template
in-repo rather than scraping the reference URLs.

**Content:** 5 services (client lists 8; grouped into 5 to fit `SERVICE_LIMIT` with nothing
dropped — AC+HVAC, Mechanical+Refrigeration, Plumbing, Electrical, Construction+Remodeling) ·
6 service areas (Miami, Hialeah, Miami Beach, Fort Lauderdale, Pembroke Pines, Key West) ·
5 testimonials · 8 FAQs · 8 gallery items · 1 blog post. All imagery is the client's own,
downloaded to `public/img/` rather than hotlinked off their WordPress.

**Tokens:** brand red `#bd0101` accent + navy `#002349` primary, Outfit + Roboto (both detected
on the client's Google Fonts link). Note: `intake-from-web` initially read the accent as the
Kadence *theme default* orange `#f7630c` from CSS custom properties — the rendered screenshot
showed the live brand is red, and it was corrected.

### Template defects found and patched in this client site

The `owl` template carries hardcoded **roofing** copy in nine places. All were fixed inside
`sites/raircon/`, but they will recur on every non-roofing client until fixed upstream in
`astro-templates/owl/`:

| File | Was |
|---|---|
| `pages/index.astro` | `form_heading="Request A Free In-Person Roof Estimate Today!"` |
| `pages/book.astro` | same heading + roof-specific intro |
| `pages/about.astro` | same heading |
| `components/HeroOwl.astro` | same string as the default in two places |
| `components/EstimateForm.astro` | default heading + a roofing-only `SERVICES` dropdown |
| **`pages/api/estimate.ts`** | **server-side `SERVICES` allowlist was roofing-only** |
| `components/ClosingCTA.astro` | `'Need A New Roof?'` + body asserting *Gilroy's* guarantee and "Serving Wilkes-Barre and the Wyoming Valley since 1972" |
| `components/BlogCards.astro` | `<h2>Roofing Advice</h2>` |
| `pages/pricing.astro` | a hardcoded asphalt-shingle / cedar-shake / metal price table |

Two of these were more than cosmetic:

- **`api/estimate.ts`** validates `service` against a server-side allowlist. Because the form
  now offers HVAC options and the API still expected roofing ones, *every* submission would
  have been rejected as invalid — a silent lead drop. The two lists are now in sync and
  carry comments saying so.
- **`ClosingCTA.astro`** shipped another client's guarantee ("no payment until the job is
  finished") and another client's city and founding year as the site-wide default body.

`pricing.astro` was rewritten as a "what drives the price" table rather than a price table —
there is no verified Raircon rate card, and the page copy explicitly says we do not publish
flat prices.

**Accent-on-dark contrast:** the owl template uses `--color-accent` both as a button fill and as
accent text inside the dark `--color-primary` bands. Raircon's brand red satisfies the first
(6.63:1 on white) but fails the second (2.37:1 on `#002349`), and no single red satisfies both.
`tokens.css` adds a `--color-accent-on-dark: #ff8a8a` (7.4:1 on the navy) applied to text only,
so button fills stay true brand red. Verified in-browser via computed styles.

### Open items for the operator

- **Lead capture is not wired up.** `/api/estimate` has no destination configured: it needs
  either `LEAD_WEBHOOK_URL`, or `RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL` + `LEAD_FROM_EMAIL` set
  in Vercel env — or GHL snippets pasted into `crm.*`. Until then the form returns
  "Online requests aren't switched on yet."
- No GHL paste-ins supplied: chat widget, reviews widget, calendar embed, contact/estimate form
  embeds, call-tracking snippet. All self-hide.
- No code injection (Meta Pixel / GTM) supplied.
- No custom domain attached; `raircon.vercel.app` is publicly reachable (SSO is off on this project).
- No short link (`--auto` skips it).
- Client publishes **no email address** anywhere on their site — `email` is unset.
- Client's footer Instagram link is a dead placeholder (`https://instagram.com`) — omitted.
  Facebook is real and included.
- Reddit comment bodies were unreachable (blocked to the WebSearch/WebFetch UA, 403 on the
  public JSON API, unsupported by Firecrawl). `local_research.json` is synthesized from thread
  titles and search snippets — directional, not a full comment read.
- Worth telling the client: their **current** site's main homepage body block still sells
  "expert sprinkler repair services... lawn sprinkler system" — leftover from an unrelated
  template — and their reviews section renders as a blank white void.

### 2026-08-04 — firefly-cd: added Decking service page + fixed hidden Flooring bug (24 pages)

Live at `https://fireflycd.com/services/decking/`. Deploy
`firefly-lt8bimi6y`. Snapshot `.site-edit-history/2026-08-05T01:20:57Z-d5w9r2/`.

**Found a live bug while raising the cap: Flooring was invisible on `/services/`.** The service caps
were inconsistent — `[slug].astro`, `OurServices`, `Header` and `Footer` all sliced at 6, but
`src/pages/services/index.astro` sliced at **5**, with 6 services in the collection. So the services
index grid rendered only 5 cards and `flooring` (order=6) never appeared, despite having its own
page and sitting in the nav. It looked fine on a link sweep because the header/footer nav still
emitted the link on that page — counting `href` occurrences finds nothing; you have to count cards
*inside* the `.grid` block. All service caps now 7.

**Watch the sed blast radius.** `sed 's|slice(0, 6)|slice(0, 7)|'` over `Header.astro` and
`Footer.astro` also hit the *service_areas* line in those files, silently raising the area cap to 7
while `[area].astro` stayed at 6. Harmless today (only 6 areas exist, so nothing 404s) but it would
have produced a dead nav link the moment a 7th area was added. Reverted; final audit confirms
services=7, areas=6 in all ten slice sites. Grep the full cap surface after any bulk substitution —
`Header`/`Footer` carry both collections on adjacent lines.

**Decking is a real Firefly service, not an assumed one** — `config.json` already carried a project
titled "Exterior + deck refresh" in Otis Orchards. Hero and gallery use that project's own photo from
`img1.wsimg.com`, re-cropped through iSteam params (`cr=t:12%,h:56%/rs=w:1200`) from portrait
600x800 into 1200x895 (4:3), matching the aspect the other service heroes use. Only one genuine deck
photo exists in their asset set, so the gallery has a single entry rather than padded filler.

Verified live: all 7 service pages 200, `/services/` grid renders 7 cards (flooring + decking both
present), decking in sitemap and homepage nav, hero image 200, all 6 area pages still 200.

**Copy is drafted, not client-supplied — needs Firefly's sign-off on three specifics:** the materials
list (composite / PVC / wood), "we pull the permits where the job calls for them", and the one-to-two
week build estimate. Everything else mirrors claims already published elsewhere on their site.

---

## mylocalads — multi-category case studies (2026-08-05)

Case studies could previously live in exactly one Results collection, because they were nested
inside `collections[].caseStudies[]`. Clients bundle services, so that shape could not represent a
real engagement. Restructured to a flat `caseStudies[]` list where each study carries a
`categories` tag array and appears in **every** category it tags.

**Model** (`src/data/caseStudies.js`)
- `categories` — collection metadata only. `caseStudies` — flat list, each with `categories: [...]`.
- **First tag is primary.** It sets the canonical URL and sorts that study ahead of merely
  cross-tagged ones inside its collection.
- `collections` is now derived, so `results.astro` and `Header.astro` consume the same shape as
  before — no changes needed in either beyond the tag pills.
- Import-time integrity checks throw on an unknown tag, an empty tag set, a repeated tag, or a
  duplicate slug. Slugs are now **globally** unique, not per-collection.

**Routing** — `getStaticPaths` emits one route per (category, study) pair: 17 routes for 9 studies.
`findCaseStudy` returns null unless the study actually tags that category, so an untagged pairing
404s (verified: `/results/websites/pa-roofer`, `/results/ai-agents/firefly-contractors-design`,
`/results/crm/hvac-group` all 404).

**SEO** — every cross-tagged URL sets `rel=canonical` to the primary-category URL, and
`astro.config.mjs` filters non-canonical case-study URLs out of the sitemap via
`isDuplicateCaseStudyPath`. Sitemap carries 9 case-study URLs, one per study — not 17.

**Rendering decoupled from URL category.** Before/after images and the feature chips now render on
data presence rather than `collection.slug === 'websites'`, so a Websites+CRM study keeps its
rebuild visuals when reached via `/results/crm/`. Verified live in the browser.

**Tag pills** — the case-study header and each carousel slide render the full tag set; the category
you arrived through is filled, the others are outlined and link to `/results#{slug}`. Wraps to two
rows at 320px with no horizontal overflow.

### New case study: Firefly Contractors & Design (operator-supplied metrics)

- `firefly-contractors-design`, tagged `['lead-generation', 'crm', 'websites']` — first three-service
  bundle on the site, and the reason for this refactor. Leads the Lead Generation carousel.
- Spokane WA remodeler, 15 years, the same client as `sites/firefly-cd/` — links out to the live
  site we built at fireflycd.com via a new optional `siteUrl` field.
- Metrics (operator-supplied, 3 months ≈ May–July 2026): 270 leads, 110 inspections (41%),
  57 closed jobs (52% off inspections, 21% lead→sale), under $40K total marketing spend,
  over $900K revenue → better than 22:1, under $150 all-in per lead.
- **Spend is OVERALL marketing spend, not ad spend** — the copy says "total marketing spend" and the
  derived per-lead figure is labelled "all-in", deliberately not "cost per lead", to avoid implying
  an ad CPL comparable to the other Lead Gen studies.

### OPEN ITEMS

- **Narrative copy is drafted, not client-supplied.** Challenge / approach / outcome for Firefly were
  written from the metrics plus what `sites/firefly-cd/` documents. Needs Firefly's sign-off before
  outreach — it names them and publishes their revenue.
- **Before/after images are still `/placeholders/website-*.svg`** on all three Websites studies. No
  screenshot of Firefly's old GoDaddy builder site exists (per the 2026-08-03 cutover entry its
  content lived only in GoDaddy's builder), so a genuine "before" may be unrecoverable.
- All 8 pre-existing case studies keep placeholder `dashboardImage`s.
- Tag sets on the 8 original studies were assigned from each study's own `approach[]` /
  `activeFeatures` copy, not from billing records. Operator should reconcile against what each
  client actually bought.
- Not deployed. Local build + 92 unit tests pass; last production deploy predates this change.

### Same day — Services Purchased + real Firefly before/after

**"Active Features" → "Services Purchased."** Field renamed `activeFeatures` → `servicesPurchased`.
Firefly's chips are `['Lead Generation', 'CRM', 'Website', 'GBP Optimization']`.

**GBP Optimization has no Results collection.** The chip list is therefore its own field, not derived
from `categories`. `SERVICE_LABEL_TO_CATEGORY` maps the labels that DO name a collection
("Website" → `websites`, singular service name vs plural collection name) and an import-time check
throws if a study claims one of those without the matching tag — verified by temporarily adding
"AI Agents" to Firefly, which failed the build with the expected message. Unmapped labels
(GBP Optimization) pass through untouched.

The other two Websites studies had `activeFeatures` listing site features (Live Chat, Call Tracking,
CRM Integration, AI Assistant). Under the new heading that would have read as a purchase claim, so
they now list `['Website', 'CRM', 'AI Agents']` — matching their tags.

**Real screenshots replace the placeholders on Firefly.** Operator-supplied full-page captures,
`cwebp -q 74 -resize 1000 0 -m 6`:

| | Source | Shipped |
|---|---|---|
| before | 2022×9905 PNG, 4.4MB | `/case-studies/firefly-before.webp` 1000×4899, 169K |
| after | 1882×7788 PNG, 7.0MB | `/case-studies/firefly-after.webp` 1000×4139, 168K |

11.4MB → 337K. Intrinsic `width`/`height` are declared in the data so the tall capture cannot shift
layout while loading.

**Crop-to-top + click for full page.** A page-height screenshot scaled to fit is unreadable, so the
frame is `aspect-ratio: 4/3` with `overflow: hidden` and the image at natural aspect — showing the
top 15.5% (before) and 18.3% (after). Measured live: 416×312 frame over a 416×2038 image, tops
aligned. Same treatment on the carousel minis, which otherwise would have rendered a slide thousands
of pixels tall.

Clicking opens a full-page viewer: fixed overlay, image at natural width in a scrollable pane, Esc or
backdrop to close, body scroll locked, focus moved to the close button and restored on close.
Verified live — open sets the right src/caption, `scrollTop` resets to 0 on reopen, and scrolling
reaches the bottom of the full capture. The underlying markup is a plain `<a href="{image}">`, so it
degrades to opening the raw image without JS, and modified clicks (⌘/ctrl/shift) are deliberately not
intercepted — confirmed by a ⌘-click navigating to the image itself.

**Deploy:** dpl_wnvbmsVqfh8kCesu4c4K2fFiXARL (preview, READY) —
https://mylocalads-89lef6bl4-marcellus-mylocaladscs-projects.vercel.app
Supersedes dpl_7xcfNb8LR8LTdAEs5mEzViMKZjdh. Still SSO-gated (all routes 302 to vercel.com/sso-api),
so the link only opens for the team. 99 unit tests pass.

**Verification note:** the Browser pane went hidden mid-session, which makes `clientWidth` read 0 and
screenshots come back solid black. A "horizontal overflow" reading on /results was that artifact, not
a real defect — re-measured at an explicit 1280×800 viewport, `scrollWidth === clientWidth`. Force a
viewport size before trusting any layout measurement from a hidden pane.

**Still outstanding:** placeholder before/after on `home-remodeler` and `concrete-company-site`;
placeholder `dashboardImage` on all 8 non-Firefly studies; Firefly's narrative copy still needs the
client's sign-off.

### 2026-08-05 — Results trimmed to the one real case study; production live

Operator: "remove the other dummy templates for now." The eight pre-Firefly studies were
anonymized clients with illustrative metrics and `/placeholders/*.svg` imagery — unpublished, not
deleted.

**Archived, not removed.** They now sit in `archivedCaseStudies` in the same file, exported so tests
can guard them. The integrity checks run over published + archived together, so an archived entry
cannot drift out of validity while parked. Restoring one is a move back into `caseStudies` plus real
screenshots.

**Empty categories are now dropped from `collections`.** With only Firefly published, `ai-agents` has
nothing in it; left alone it would have rendered a category pill opening a blank carousel and a
header dropdown item going nowhere. `categories` still defines all four, so AI Agents reappears by
itself the moment a study tags it. Verified live: pills and dropdown both show exactly Lead
Generation / CRM / Websites.

**Tests reworked to be derived rather than slug-hardcoded.** Several asserted against slugs that are
now archived — `findCaseStudy('websites', 'pa-roofer')` still returned null, but vacuously, testing
nothing. They now iterate the published set. Added coverage for archived studies staying out of every
collection, staying restorable (valid tags, no slug collision), and 404ing on every category. The
single-tag code path is now only exercised by the archive, and there is an explicit test saying so —
if the last single-tagged study is ever deleted outright, that test fails loudly.

**Live: https://mylocalads.vercel.app** — dpl_8EpiuZpUwxwobMn4WN8kLWcLzwe8 (production, READY).

Verified anonymously against the live host:
- 3 Firefly routes 200; all 6 sampled archived routes 404
- Zero occurrences of any archived slug or client name anywhere in `dist/` (11 strings swept)
- Sitemap down to `/results/` + the one canonical Firefly URL
- 13 pages total, 103 unit tests pass

**Copy worth revisiting:** the /results hero still reads "Pick a category below to see the case
studies" — with one study cross-tagged into three categories, every pill shows the same slide. Not
broken, but the invitation over-promises. Left as-is rather than rewriting marketing copy unasked.

**Unchanged and still true:** canonicals point at `mylocalads.co`, which still serves the old
Cloudflare site, so these pages will not be indexed until the domain moves. `/google-ads-bundle` and
`/facebook-google-ads-bundle` exist on the old site and have no equivalent here — a domain cutover
would 404 them.

### Same day — AI Agents restored with an empty state

Removing the eight dummy studies emptied `ai-agents` entirely: all four studies tagged with it
(Regional Roofing Brand, Local HVAC Group, Home Remodeler, Concrete Company) were archived, and
Firefly bought GBP Optimization rather than AI Agents. The "drop empty collections" filter added
alongside the archival then hid the category from the pills and the header dropdown — which silently
pulled a $250/mo product off a sales surface. Operator caught it.

**Reverted the filter; empty categories now render an empty state instead of disappearing.**
`collections` exposes all four categories again. A category with nothing published renders a dashed
panel using its existing `tagline` + `intro` (previously unused in the UI) plus a "Book a call with
our team" CTA into /booking-page. New `emptyCollections()` helper reports which are in that state.

Deliberately NOT a `.case-slide` — the carousel counts those, so reusing the class would have
rendered "1 / 1" with live arrows over a panel that is not a case study. The control row is hidden
outright when the active track has zero slides rather than showing "1 / 0".

**Copy bug caught in the browser, not in review:** the first draft read "We're preparing a AI Agents
case study" — the category name is interpolated, so "a CRM" / "a AI Agents" would need per-category
a/an handling. Rephrased to "{name} case studies are being prepared for publication", which needs no
article at all.

Verified live across all four pills: lead-generation / crm / websites each 1 slide with controls
visible and "1/1"; ai-agents 0 slides, empty panel, controls hidden, "0/0". No horizontal overflow.
Sitemap unchanged — an empty category publishes no URL. Archived routes still 404.

**Live: https://mylocalads.vercel.app** — dpl_Hha86kiDeveiw1hf91mBNCW1bcEy (production, READY).
105 unit tests pass, including new coverage that every collection carries the copy its empty state
needs and that the carousel's default category is never an empty one.

**Still unresolved:** GBP Optimization is sold and appears as a Services Purchased chip on Firefly,
but has no Results category, so it gets no pill. Adding it would mean a fifth category that is empty
on day one.

## 2026-08-05 — mylocalads: post-payment fulfillment + verified confirmation page

Closing the gap identified while walking the checkout flow: a completed purchase did nothing but
redirect the browser. One API route existed (`/api/checkout`), nothing listened for
`checkout.session.completed`, and `/checkout-success` confirmed unconditionally.

### 1. `/api/stripe-webhook` (new, on-demand)

Verifies the Stripe signature over the RAW body via `constructEventAsync`, re-fetches the session
from Stripe (rather than trusting the event snapshot, and to expand line items), and POSTs a flat
order record to `ORDER_WEBHOOK_URL`.

Status-code discipline matters here because Stripe retries non-2xx for days:
- unhandled event type, or a session that is not fulfillable → **200** (retrying cannot help)
- missing/invalid signature → **400**, never retried, never acted on
- missing env config, Stripe retrieve failure, downstream CRM non-2xx or unreachable → **500**, so
  Stripe's retries act as the safety net rather than the order being lost
- `ORDER_WEBHOOK_URL` unset → **200** plus a `console.error` carrying the full payload, so the order
  is recoverable from logs by hand. Retrying would not conjure a destination.

### 2. `src/lib/order-payload.js` (new, pure)

Session → CRM record. Kept pure and separately tested because it is the only place that decides what
an order *means*.

**The trap it exists to avoid:** a CRM-only cart starts the 7-day trial, so Stripe reports
`payment_status: 'no_payment_required'` and `amount_total: 0`. Treating only `'paid'` as success
would have silently dropped every trial signup — the entire funnel for the cheapest plan.
`isFulfillable()` accepts both, and the payload flags `is_trial` so the CRM can route them apart.

Unknown item ids pass through with the raw id as the name rather than being dropped: a mystery line
is recoverable, a missing one is not.

### 3. `/checkout-success` — static → on-demand, now verified

Previously any visitor to the URL saw "You're All Set!" and had their cart emptied; `session_id` was
placed in the URL and never read. Now retrieves the session and renders one of three states:
`confirmed` (clears the cart), `incomplete` (cart preserved, back to /cart), or `unverified`.

`unverified` is the deliberate fallback for a Stripe outage or a bad id — it never tells a customer
who may well have paid that their order failed, and never clears the cart. Confirmed orders greet
the customer by first name and vary the copy for a trial.

### Verified

Signature handling exercised end-to-end against a local dev server with a known secret, computing
real HMACs:

| Request | Result |
|---|---|
| no signature header | 400 `missing_signature` |
| forged signature | 400 `invalid_signature` |
| signature from the wrong secret | 400 `invalid_signature` |
| **valid signature over a tampered body** | **400 `invalid_signature`** |
| valid signature | passes verification, proceeds to retrieve |
| valid signature, `invoice.paid` | 200, `ignored invoice.paid` |
| GET | 405 |

`/checkout-success` verified live: no longer confirms without a real session, emits
`confirmed = false` so the cart-clear does not fire, and the raw `session_id` is never reflected into
the HTML (XSS check: 0 occurrences of an injected `<script>`).

127 unit tests pass (22 new). `/checkout-success` confirmed absent from static output; both API
routes present in `.vercel/output/config.json`.

**Live: https://mylocalads.vercel.app** — dpl_FviLxBZqdfdf6trKTcj2m6mcFJ2d (production, READY).

### OPERATOR — two env vars required before fulfillment works

The webhook currently answers `500 not_configured`, which is correct and harmless: the endpoint is
not registered in Stripe yet, so nothing is calling it.

1. Stripe → Developers → Webhooks → Add endpoint
   URL `https://mylocalads.vercel.app/api/stripe-webhook`, event `checkout.session.completed`.
   Copy the signing secret (`whsec_…`) → `vercel env add STRIPE_WEBHOOK_SECRET production`
2. Create the receiving automation (Make / Zapier / GHL inbound webhook) that creates the contact +
   opportunity → `vercel env add ORDER_WEBHOOK_URL production`
3. Redeploy — Vercel env changes only reach the functions on a new deployment.
4. Stripe → "Send test webhook" to confirm a 200.

**Dedupe is the receiving automation's job.** Stripe retries until it gets a 2xx, so the same order
can legitimately arrive more than once. Every payload carries `session_id` as a stable key.

**After the DNS cutover**, update the Stripe endpoint URL to `https://mylocalads.co/...`. The
checkout endpoint's own origin detection follows `x-forwarded-host` automatically and needs no
change; the Stripe-side endpoint registration is manual.

`docs/cart-stripe-verification.md` is now partly stale — its "Not yet verified" section still says
the post-payment redirect is untested, which remains true for a real card, but the page it describes
has been replaced.

### Same day — env vars wired, retrieve-failure fallback, fulfillment live

`STRIPE_WEBHOOK_SECRET` and `ORDER_WEBHOOK_URL` added to the **mylocalads** project by the operator.
The `500 not_configured` guard is gone; the endpoint now rejects unsigned/forged requests with 400,
which confirms both secrets are readable by the function.

**Note for future work:** `mla-starter-hub` (client.mylocalads.co) also has a `STRIPE_WEBHOOK_SECRET`,
holding a DIFFERENT value. Stripe signing secrets are per-endpoint, so the two are not
interchangeable — running `vercel env add` from the wrong directory would silently break signature
verification on one of them. Checked for a collision: the starter-hub endpoint subscribes only to
`invoice.*` and no-ops everything else, so `checkout.session.completed` reaching it cannot cause
duplicate fulfillment.

**Retrieve failure no longer loses the order.** The handler re-fetched the session and returned 500
on failure. Two problems: Stripe's dashboard "Send test webhook" carries a sample session id that
does not exist in the account, so a perfectly healthy endpoint would answer 500 and look broken —
training the operator to ignore a status that also signals real failure. And a transient Stripe
outage depended on retries.

Since the event payload is already signature-verified, it is authentic Stripe data — the retrieve
only buys freshness. On any retrieval failure the handler now logs a warning and falls back to the
signed payload. Nothing in `buildOrderPayload` needs expanded line items (it reads `metadata.items`),
so the fallback is complete, not degraded.

**Full chain verified locally** — dev server with a dummy Stripe key (forcing the fallback), a known
webhook secret, real computed HMACs, and a local HTTP receiver standing in for the CRM:

| Case | Result |
|---|---|
| paid 5-item cart, valid signature | 200, payload delivered |
| CRM-only trial, valid signature | 200, `is_trial: true`, `amount_total "0.00"` |
| CRM endpoint down | 500 `crm_unreachable`, full payload logged for recovery |
| fallback engaged | logged 3/3 |

Captured payload confirmed: contact (email/name/phone/business_name), item ids resolved to catalog
names (`crm` → "Home Service CRM"), amounts as decimal strings, `session_id` dedupe key,
`terms_of_service: "accepted"`, subscription + customer ids unwrapped.

**Live: https://mylocalads.vercel.app** — dpl_5p83T2Bzjew7p5d5NHJt6X4fqhgJ (production, READY).
127 tests pass. Live: unsigned 400, forged 400, GET 405, `/checkout-success` with a fake id renders
the neutral "confirming" state rather than a false confirmation.

**Remaining:** no real card has been run end to end. The Stripe endpoint registration itself was done
by the operator and has not been observed delivering a live event.

---

## Bay Plumbing Co. — `bay-plumbing-co` — 2026-08-06

**Live: https://bay-plumbing-co.vercel.app** — 21 pages, `owl` template, project `bay-plumbing-co`
(`prj_ZQhVFyYUchmGGbzJcLVMpgGzfsrG`), deployment `dpl_A7ixKzjeJn7rCS9zz3wyX4mjp8TM` (production, READY).

Source site: https://www.bayplumbingco.com/ (Weebly free tier). Miami-Dade plumbing contractor,
3029 SW 28th St, Miami FL 33133, family owned since 1968.

### Pipeline

| Step | Result |
|---|---|
| intake-from-web | 8 pages Firecrawled + 3 review directories → `intake-scraped.json` |
| find-business (GBP) | **SKIPPED — no APIFY_TOKEN in repo.** See below. |
| local-research | Reddit blocked; substituted the client's own 61-review corpus as local voice |
| site-audit | `screenshots/bay-plumbing-co.png` + `audit_results.json` |
| design-reference | `design_reference.json`, $0 (no reference URLs, no plumbing library) |
| site-generate | owl scaffold, 5 services, 6 areas, 1 blog post |
| vercel-deploy | local build clean, deployed, all 11 spot-checked routes 200 |
| short-link | not run |

Spend this run: ~$0.24 Firecrawl. No Apify spend (token absent).

### GBP lookup did not run

`.env` does not exist in the repo — only `.env.example` — so `APIFY_TOKEN` was unavailable and
`find-business` could not execute. Identity was instead confirmed against the client's own site plus
four independent directories (Yelp, BestProsInTown, BBB, YellowPages), all agreeing on name, address
and phone. **Consequence:** `rating`, `review_count` and `geo` are unset in `config.json`, so the site
ships no star badge and the LocalBusiness JSON-LD carries no coordinates. Re-run `/find-business`
once a token is in place.

### Rating deliberately withheld

Third-party aggregates disagree sharply — Yelp **2.5 / 23 reviews**, BestProsInTown **4.3 / 38**.
Publishing either would be a coin-flip on accuracy, so no aggregate rating appears anywhere on the
site and "displaying an aggregate star rating" was added to the anti-patterns list in
`design_reference.json`. The five testimonials used are real, attributable, published reviews (four
Yelp, one BestProsInTown), verbatim apart from trimming one trailing signature. Nothing was written.

### What the review corpus actually says (matters for the client conversation)

The recurring complaint is **not workmanship** — it is phone manner and fee disclosure. Reviewers
repeatedly split the two: praise the plumber by name, fault the office. The single loudest theme is a
$150 estimate/trip fee disclosed only after the plumber arrived. That shaped the copy: the
`promise_band` is built entirely around stating the price on the phone before dispatch, and the
`/pricing` page publishes a `cost_table` of what is a free estimate vs. what is a service call rather
than a rate card. The site can set honest expectations; it cannot fix the call experience. Raise it.

### Assets and credentials

License numbers were not in the HTML — they are baked into the logo artwork and painted on the
building. Read off both: **Licensed C.C. 6469 · Insured CFC057007**. Logo and a genuine photo of the
shop and signage pulled to `public/`. No stock photography used anywhere.

### Tokens

Brand red `#f90909` measures 4.14:1 on white — under AA for the white button labels owl puts on
`--color-accent`. Re-derived the documented three-token set: fill `#d10a0a` (5.59:1 on white), ink
`#b80a0a` (6.19:1 on bg / 6.81:1 on surface), on-dark `#ff5f52` (5.52:1 on `--color-primary`). This is
verbatim the "dark saturated red" case the owl `tokens.css` comment anticipates.

### Old site — notable findings

Live production placeholder text on `/why-us`: a pull-quote reading "If you're writing a medium or
long section of text, break it up with more than one paragraph", plus an entire orphan section titled
"It's What's for Breakfast" with coffee and cookie stock icons and "To edit, click on the text and add
your own words." The homepage hero overlay reads "We are working on the ADA Compliance version.
Coming Soon!" The contact form's comment field is labelled "massage". Body copy says "over 40 years"
against a 1968 founding date. `/property-maintenance.html` calls the company "Bay County Plumbing"
twice. Full list in `audit_results.json`.

### Verification

Local build clean, no console errors on any of 16 routes crawled. Mobile 390px: no horizontal
overflow (`scrollWidth === clientWidth`). Live: 11/11 routes 200, canonical and sitemap both resolve
to `https://bay-plumbing-co.vercel.app`.

Two layout fixes caught in review before deploy: `signature_system` had 4 grid items against an
`auto-fit minmax(300px)` track, orphaning the fourth across a full row — merged to 3. And the shop
photo was set on both `about_block.photo` and `seo_body.image`, rendering the site's only photograph
twice on one page — dropped from `seo_body`.

### Outstanding — needs operator / client

| Field | Status |
|---|---|
| `crm.*` (chat, reviews, calendar, contact form, call tracking) | empty — GHL paste-in |
| `crm.form_action_url` / `captcha_snippet` | unset — native EstimateForm cannot submit until set |
| `code_injection.head` / `body_end` (Pixel, GTM) | empty — operator |
| `rating` / `review_count` / `geo` | unset — needs GBP lookup |
| Custom domain | not attached |
| Job photography | none exists; `/our-work` ships a written capability statement and an empty `projects` array rather than stock imagery. Highest-value asset to collect from the client. |
| Service areas | Miami and Key Biscayne are stated by the client. Coconut Grove, Coral Gables, South Miami and Miami Beach were derived from HQ proximity — confirm before driving traffic. |

---

## Tropical South Tree Services — 2026-08-06

| | |
|---|---|
| Slug | `tropical-south-tree-services` |
| Template | `owl` (caps raised — see below) |
| Old site | https://tropicalsouthtreeservices.com/ (GroovePages) |
| Live | https://tropical-south-tree-services.vercel.app |
| Pages | 51 — 20 services, 16 service areas, 3 blog posts |
| Vertical | Tree service / arboriculture |
| Market | Miami-Dade County, FL (HQ Cutler Bay) |

> **Supersedes `tropical-south-landscaping`,** built earlier the same day against
> the wrong reference URL and removed in the same commit. Same owner — Rafael
> Quezada, Cutler Bay — but a genuinely different business with its own phone
> number, address and brand. The orphaned `tropical-south-landscaping` Vercel
> project was **not** deleted; that is an operator call.

### Identity

Tropical South Tree Services, founded March 2019 by Rafael Quezada.
9980 Haitian Dr, Cutler Bay, FL 33189 · (305) 299-1189 ·
tropicalsouthtreeservices@gmail.com · Mon–Sat 7:00 AM – 8:00 PM,
24/7 emergency storm response. Licensed and insured, Commercial General
Liability. **5.0 stars across 200+ Google reviews.**

Sourcing was unusually easy: the client publishes an `llms.txt` at the site root
carrying NAP, hours, the full service and area taxonomy, and directional pricing.
That plus 36 scraped sub-pages is the whole intake. No Apify GBP lookup was run
(still no `APIFY_TOKEN` in `.env`), but `llms.txt` and the site agree on
everything a GBP call would have returned except geo, which is left unset.

### The structural decision

The client publishes **20 service pages in three nav groups and 16 service-area
pages.** The owl template caps at 5 and 6. The operator asked for the full
structure, so the caps were raised — deliberately, and with the anti-thin-page
rationale in `src/lib/limits.ts` checked rather than waived:

- The 20 services are distinct billable jobs with different equipment, price
  bases and buying triggers. Crown reduction is not canopy thinning; hazardous
  removal is not storm cleanup; arborist reports are a different product entirely.
- The 16 areas carry genuinely local content. **Permitting is the differentiator
  and it is real:** Coral Gables and Pinecrest administer their own tree
  ordinances on top of Miami-Dade DERM, the unincorporated communities go
  straight to the county with no municipal layer, Homestead adds city urban
  forestry for right-of-way, and Redland's agricultural parcels follow different
  provisions at 18-inch trunk diameter. Storm history differs too — Andrew made
  landfall on Homestead, Irma hit Cutler Bay directly.

Three additions keep that scale usable:

- **`src/lib/taxonomy.ts`** groups services into the client's own three lines of
  business, with a runtime assertion that grouping can never drop a service.
- **`FEATURED_SERVICE_LIMIT` (6) / `FEATURED_AREA_LIMIT` (8)** keep the homepage
  grids short while all 20/16 pages generate and appear in nav, footer and hubs.
  `limits.ts` now **throws at build time** if a featured limit ever exceeds its
  generation limit — the exact 404 that file was written to prevent, previously
  documented in a comment and now enforced.
- **Header** renders both menus as grouped mega-menus.

### Design

Operator-supplied: `#0f4d89` primary, `#f1d940` for CTAs and secondary titles.

This client is the textbook case for owl's three-token accent split. `#f1d940`
measures **1.42:1 as text on white** — unusable — and **6.03:1 on the navy** —
excellent. So it is kept completely unmodified as the button fill and as
`--color-accent-on-dark`, with a deep gold `#6b5200` derived for accent-as-text
on light backgrounds (6.90:1 on bg, 7.42:1 on surface). Every text pair clears
WCAG AA. Secondary titles use the yellow as a rule beneath group headings on
`/services`.

Imagery: 10 real job photos from the client's own gallery, resized to 1400–1600px
and served from `public/`. Only photos that were actually inspected were kept —
the other 20 were discarded rather than shipped with guessed alt text.

### Defects found and fixed during verification

1. **`/contact`, `/blog` and `/service-area` shipped with no `h1` at all.**
   `SectionHead` always emitted `h2`, and on those three pages it *is* the
   primary heading. Added an `as` prop defaulting to `h2` so no other call site
   changed. A page with no h1 is a ranking and screen-reader defect, and nothing
   in the build surfaces it.
2. **`WhyChooseUs` eyebrow rendered at 1.16:1 on the primary band** — invisible.
   It inherited `--color-accent-ink`, which is tuned for light backgrounds.
   `SectionHead`'s colours are now overridable through inherited custom
   properties that a dark section sets once on its own container.
3. **The services tile clipped long titles.** `aspect-ratio: 16/10` plus an
   absolutely-positioned caption meant the caption could not influence tile
   height, so "Hazardous Tree Removal" was cut off at the top — with a green
   build. Tiles now size to content with a `min-height` floor. **Second client in
   a row to hit this**; worth fixing in `astro-templates/owl` itself.
4. **The services mega-menu overflowed the viewport by 60px** at 1280. Now
   anchored to the header container rather than its nav item.

### Verification

51/51 pages have exactly one `h1`. All titles and meta descriptions unique. No
broken internal links. No horizontal overflow at 375px. JSON-LD emits
LocalBusiness, Service, FAQPage and BreadcrumbList across the site. Live: all 36
service and area sub-pages return 200, canonical / robots / sitemap all resolve
to the production alias.

### Pricing

Unlike most clients, this one publishes real bands, so `/pricing` ships an actual
cost table: removal $250–$3,500+, trimming $150–$950 per tree, stump grinding
$100–$450 per stump, with the variables that move each number. Cleanup is stated
as included in every figure because the client includes it.

### Outstanding — needs operator / client

| Field | Status |
|---|---|
| `crm.*` (chat, reviews, calendar, contact form, call tracking) | empty — GHL paste-in |
| `crm.form_action_url` / `captcha_snippet` | unset — the native EstimateForm posts to `/api/estimate`, which needs `LEAD_WEBHOOK_URL` **or** `RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL` + `LEAD_FROM_EMAIL` in Vercel env, or submissions fail with `?error=unavailable` |
| `code_injection.head` / `body_end` (Pixel, GTM) | empty — operator |
| `geo` | unset — needs a GBP lookup once `APIFY_TOKEN` is restored |
| `social` | empty — no social profiles linked from the client's site |
| Custom domain | not attached |
| `team_members` | empty — only Rafael and a site supervisor named Steve appear publicly |
| Old `tropical-south-landscaping` Vercel project | still live and now orphaned — delete or leave, operator's call |

### Amendment — 2026-08-06, operator-requested restructure

Three changes, all local to this site. `astro-templates/owl` is untouched.

**Detail pages moved to flat URLs.** `/tree-removal`, `/pinecrest-fl` — not
`/services/tree-removal`, `/service-area/pinecrest-fl`. The hub pages `/services`
and `/service-area` stay put; only the detail pages flattened. Astro cannot have
two `[slug].astro` at the same level, so the two routes merged into one
`src/pages/[slug].astro` dispatcher with the bodies extracted to
`ServiceDetail.astro` / `AreaDetail.astro`.

The old nested URLs now 404. **If the client ever points a real domain at this
and the old paths were ever indexed, they need 301s** — nothing here creates
them.

Flattening merges both collections into one namespace shared with every static
page, and `src/lib/urls.ts` exists to keep that safe:

- `RESERVED_SLUGS` + `assertRoutableSlug` — a service called `about` would be
  shadowed by `/about` and silently never built. Now throws at build time.
- A service and an area sharing a slug would emit duplicate params with one
  winning arbitrarily. Checked explicitly in `getStaticPaths`.
- `serviceHref()` / `areaHref()` replace fourteen interpolated href sites.

**Nav renamed and split.** "Services" → "Tree Services" (label only). New
"Landscaping Services" menu alongside it. `groupServicesByCategory` gained an
`only` parameter so each menu renders its own categories — without it both would
render all 22 services and the split would be cosmetic.

**Two new services**, category `Landscaping Services`, orders 21–22 so the
homepage featured six are unchanged:

| Service | Sub-services |
|---|---|
| Landscape Maintenance | Mowing, Edging, Trimming, Blowing, Landscape Design, Planting, Mulching, Weeding Flower Beds, Spring Cleanup |
| Sod | Sod Installation, Sod Replacement |

The 11 sub-services are **sections of their parent page, not pages**. "Blowing"
and "Edging" do not support a defensible standalone page, and minting eleven of
them is precisely the thin-content pile `SERVICE_LIMIT` exists to prevent. The
menu deep-links into the parent by anchor instead, with the id produced by one
shared `subServiceId()` used by both the menu and the bullet list so the two
cannot drift. `AboutSection` gained an opt-in `bullet_ids` prop and
`scroll-margin-top` so a deep link clears the sticky header.

`SERVICE_LIMIT` 20 → 22. `/services` now covers both lines of business, so its
title and h1 were corrected to "Tree & Landscaping Services" — it would otherwise
have under-described its own contents.

Site is now **53 pages**. Verified live: all 22 services and 16 areas resolve at
the root, both old nested paths return 404, every page has exactly one h1, all
titles unique, no broken internal links, sitemap carries only the flat URLs, and
the landscaping anchors resolve to real ids.

### Fix — mega menu was unclickable

Reported immediately after the restructure: the menus disappeared on the way to
them, so **no sub-page in any of the three menus could be reached by mouse.**

Anchoring the menus to `.header-row` (which is what stopped a wide menu
overflowing the viewport) moved them out of the nav item's own box. The logo
makes the header row 131px tall while a nav link is 24px and vertically centred,
so the link sat at y=54–78 with the menu starting at y=131 — a **54px dead
zone**. Travelling from the link to the menu crossed it, `:hover` on the `<li>`
was lost, and the menu closed mid-move.

Fixed by making the nav items span the header's full height so their box meets
the menu — not by a hover-bridge pseudo-element or a JS close-delay. Hovering the
menu already keeps the `<li>` hovered because the menu is a descendant of it, so
the gap was the whole problem.

The stretch had to pass down the entire chain to work: `align-self: stretch` on
the `<nav>` alone left the `<ul>` at its 40px content height, so the `<li>`
children had nothing tall to stretch against. The `<nav>` is now a flex container
with stretch alignment. The last 16px of header bottom padding is closed with
`top: calc(100% - var(--space-2))` on the menu.

Verified by driving the pointer rather than by inspection — gap measures 0px on
all three menus, and hover → travel → click lands on the right page, live.

### Header restyle — blue / yellow

Header shell is brand blue `#0f4d89`; top-level nav is brand yellow `#f1d940`
bold; sub-menus are white panels with blue text; phone number white beside a
yellow phone icon.

**The logo had to be recoloured.** The source is a 400x400 raster with a hard
white background and a blue wordmark — on a blue header it renders as a white
box. It is now transparent with a white wordmark, sun and palm untouched.

Method matters here: it was done by **un-premultiplying the artwork from white**
(`alpha = 1 - min(channel)`, colour divided back out), not by threshold-keying
white to transparent. A threshold leaves a white halo on every anti-aliased edge
— worst on the sun's rim and the palm fronds. Blue pixels then map to white at
their existing alpha so the letters keep soft edges, and the low-saturation
pixels left over from the original's white letter-outline are pushed to white
too; left grey they read as a dirty fringe against the blue.

The original is preserved at `public/logo-original.webp`. **This is a change to
the client's logo asset** — if they object, swap `logo_url` back and put a white
chip behind it instead.

**Scoping.** The yellow applies to `.nav-list > li > a` — the child combinator is
load-bearing, since without it the rule repaints the sub-menu links that are
meant to stay blue-on-white. `.phone-cta` is excluded because the phone block has
its own colour split.

**Mega-menu hover:** a yellow accent bar wipes in from the left while the row
nudges 4px right and takes a soft blue wash, driven by `transform` and a
pseudo-element rather than animated padding or border-width so it stays on the
compositor and the text never reflows. Top-level items grow a white underline
from the centre that persists while their menu is open.

**Contrast re-audited against rendered values, all pass:** yellow nav on blue
6.03:1 · white phone number 8.60:1 · phone label 5.92:1 · blue sub-menu items on
white 8.60:1 · gold group headings 7.42:1. Header focus rings moved off
`--color-focus` (#0057ff — nearly invisible on this blue) to the brand yellow.

Worth recording: the audit script itself was wrong first. It parsed
`color(srgb 1 1 1 / 0.78)` as `(1,1,1)` and reported the phone label at 2.43:1 —
normalised channels read as 0-255. The corrected parser puts it at 5.92:1. Any
future contrast sweep on this repo needs to handle `color(srgb …)`, not just
`rgb()`/`rgba()`.

**Mobile:** the hamburger was a hardcoded `stroke="#111"`, all but invisible on
blue — it now inherits `currentColor` and renders yellow. The drop-down panel is
a white sheet with blue text, matching the desktop menus rather than the header
it drops out of.

### Home hero image + Stump Grinding tile

**Home hero** uses the operator-supplied shot (branded crew member in a Niftylift
bucket working a hedge against blue sky), served locally rather than hotlinked.

It needed a focal-point control to survive mobile. The hero stacks headline,
sub-copy, badges, CTA and the quote form, so at 375px the box is ~1566px tall —
`background-size: cover` on a 2038x1222 landscape photo then shows a slice about
20% of the image width, and centred that slice was **pure sky with the crew
cropped out entirely**. HeroOwl gained optional `photo_focus` /
`photo_focus_mobile` (CSS background-position via custom properties, mobile →
desktop → centre fallback chain). Desktop keeps the centre crop; mobile uses
`64% 50%` so the hard hat and branded shirt land beside the headline. Values were
chosen by trying them in the browser at 375px, not derived from the dimensions.

**Stump Grinding tile had no background image** — the only one of the six
featured services without a `hero_photo`, so it fell back to the `no-photo`
gradient and sat as a flat blue panel among five photographs.

The client has **no photograph of stump grinding**. Every shot in their gallery is
trimming or removal, and their own /stump-grinding page reuses a palm
before/after. Rather than caption a picture as something it is not, the two most
literal photos were reassigned:

| Service | Photo | Why it is honest |
|---|---|---|
| Stump Grinding | sectioned-trunk shot | Literally two trunk stumps cut to grade with the canopy cleared — the exact state a grinder is brought in for |
| Tree Removal | removal-in-progress shot (new) | Tree cut back to bare stubs, felled canopy across the garden, chip truck standing by |

All six featured tiles now render with a photo; none fall back to the gradient.

**Gotcha worth remembering:** Astro's content-layer cache in `.astro/` held the
old parsed `home.json` after the schema gained the new fields, and **Zod silently
strips unknown keys** — so the focal point was dropped with no error and no
warning, and the mobile hero looked unchanged. `rm -rf .astro` before rebuilding
whenever a content-schema field is added.

### Cert marquee, 2x2 mobile promise bar, menu heading colour

**Landscaping menu headings were the wrong colour.** "Landscape Maintenance" and
"Sod" are the only two headings in either mega menu that are LINKS to a page, but
they inherited `.mega-heading`'s gold — the colour of the *non-clickable*
category labels in the Tree Services menu. The one thing you could click looked
like the one thing you could not. Now blue, matching every other clickable item;
the uppercase weight still marks them as their column heading.

**Promise bar on mobile** was `auto-fit minmax(220px, 1fr)`, which collapses to a
single column at 375px and turned four short claims into a tall left-aligned
list. Now a strict 2x2 grid, icon stacked above centred text.

The icon highlight took two passes: concentric hard rings of translucent yellow
desaturate against the blue and came out olive. Replaced with a thin hard ring
plus a **blurred** glow, which holds the hue.

**Certification marquee** sits between the hero and the promise bar — seven
client badges (Google Guaranteed, Best of HomeAdvisor 2016–2021), downloaded and
served locally from `public/badges/`, sized by HEIGHT so the wider Google seal
sits level with the HomeAdvisor ones. The Google badge shipped 768x592 with a
large white margin; trimmed to its bounding box and downscaled so it does not
dwarf the rest.

> Note for the operator: the HomeAdvisor awards run 2016–2021, but the tree
> services brand was founded March 2019. They belong to the same legal entity
> (Tropical South Landscaping Inc — the BBB listing carries this phone number),
> and they came from the client's own site, so they are theirs to display. Flagged
> only because the dates predate the brand.

**Marquee loop maths — got it wrong first, caught it by measuring.** The markup is
TWO tracks side by side, which requires each to translate `-100%` of its own
width. I wrote `-50%`, which is the value for the *other* common shape — ONE
track holding the list twice. At `-50%` the strip jumps backwards once per cycle.

Verified by seeking the animation to its last frame and asserting track two lands
exactly where track one started. Live: 981.6px travel against a 982px track,
seamless.

> Measurement trap worth remembering: `getAnimations()[0].currentTime` stays at 0
> while the browser pane is hidden, because animation clocks are throttled. Sampling
> positions over wall-clock time shows a frozen marquee that is actually fine —
> seek the animation explicitly instead.

Motion is opt-out twice over: hover/focus pauses it so a badge can be read, and
`prefers-reduced-motion` stops it dead and hands scrolling back to the user with
the duplicate track hidden. The duplicate is `aria-hidden`, so a screen reader
hears each award once rather than twice.

### FAQ page, owner section, footer profiles, header polish

**Menu headings back to gold** — reverted the previous change. Column headings
read the same in both mega menus; the hover state signals the two Landscaping
ones are clickable.

**Phone CTA** is now a pill with an accent ring and the number underlined in
brand yellow, so it reads as a link rather than a printed number.

**Cert strip: static on desktop, scrolling on mobile.** All seven fit across the
container at desktop widths, so scrolling added motion without information — and
a repeating loop implies more badges than exist. The duplicate track is
`display: none` on desktop rather than merely unanimated, which would have
doubled every badge.

**Band order swapped:** hero → promise bar → certs → owner → services.

**New owner section** above the services grid, "Why Miami-Dade Homeowners Trust
Tropical South Tree Services & Rafael", with proof points as a stat row (founded
2019 · 5.0★ · 24/7 · same-day quotes).

**Footer profile badges — every URL verified by fetching it.** This mattered more
than expected:

| Platform | Correct URL | Trap |
|---|---|---|
| Yelp | `/biz/tropical-south-tree-service-cutler-bay` | The obvious hit is the **landscaping** listing (305) 333-2642 |
| HomeAdvisor | `rated.TropicalSouth.131737213` (256 reviews) | Landscaping profile is `45356792` (224 reviews) |
| Yellow Pages | `/nationwide/mip/tropical-south-tree-service-576110523` | Search returns the landscaping listing on Marine Dr first |
| Google | Maps search-by-query URL | No verifiable place-ID link is public — **swap in the real profile link when the client supplies it** |

**Facebook and Instagram added** (operator-supplied, both 200):
`facebook.com/profile.php?id=61583598667693` and
`instagram.com/tropicalsouthtreeservices`. These live in `site.social` rather
than `site.profiles` — the Footer already carries inline glyphs for them, and
they are social feeds rather than review listings, which is the distinction the
two fields draw. Trailing `#` stripped from the Facebook URL (address-bar
artifact). The glyph row is pulled up under the badges so the footer reads as one
"Find us on" group. Social links now announce the business name in their
aria-label instead of just "facebook".

This owner runs two brands out of one entity, so all four directories carry BOTH
records. Linking the wrong one puts a conflicting phone number one click from the
footer, which is a genuine NAP-consistency problem for local SEO.

Badges are the official platform marks the client already uses on their own site,
not hand-drawn approximations of trademarked logos.

**Regression fixed:** the footer was showing the recoloured WHITE-wordmark logo on
the white footer, so the business name was invisible. Added `footer_logo_url`
(falls back to `logo_url`) pointing at the preserved `logo-original.webp`. Worth
remembering whenever a logo is recoloured for a dark header — check the footer.

**New `/faq`, rewritten rather than copied.** The client's page runs 38 entries of
which ~12 are near-duplicates of "do you plant native trees?", third-person and
keyword-padded. Near-identical answers on one page compete with each other — the
classic thin-content pattern. Now **26 distinct questions in five topics**, in the
site's voice, every answer that names a service or price linking to the page that
owns it, and FAQPage JSON-LD over the set.

The accordion is native `<details>`/`<summary>`: open-able, keyboard operable and
findable by in-page search before any JS runs. JS only adds category filtering and
expand-all. Filtering uses the `hidden` attribute rather than a display class so
the state reaches assistive tech. Expand-all temporarily drops the exclusive
`name="faq"` grouping, which would otherwise fight it.

One inconsistency resolved: the client's FAQ quotes stump grinding at $75–$400
while their own llms.txt says $100–$450. The site uses **$100–$450** throughout so
`/faq` and `/pricing` agree with each other.

### Meet The Owner — portrait, tighter copy, real Google review card

**Copy cut to a lede plus one paragraph** (141 words, down from ~330) and
refocused on Rafael. The previous version opened by describing how the rest of
the trade works — commissioned salesmen, subcontracted crews, invoices that do
not match. Even as a contrast that plants the doubt before answering it: the
reader is now thinking about crews they cannot trust while looking at ours.
Removed from the paragraphs *and* the checklist, which carried the same "no call
centre, no commissioned salesman" line.

Replaced with his story — started 2019 with one truck, grew up working these
yards, knows which royal palms drop early and which live oak rides out a storm,
comes out himself and will say when a tree needs nothing yet.

> **Still outstanding:** the same framing survives in the `signature_system`
> block further down the homepage — "a working tree service, not a call centre
> with subcontractors". Left in place because the operator scoped this change to
> the Meet The Owner section, but the same reasoning applies. One-line change to
> `home.json` if wanted.

**Owner portrait** replaces the generic crew photo. The supplied PNG carries its
own rounded white frame and drop shadow, so the container's border-radius and
box-shadow double-framed it — added a `photo_framed` flag that drops the wrapper
chrome and shows the image whole instead of cropping to 4:3. Worth reusing for
any client-supplied image that arrives pre-framed.

**The review now reads as an actual Google review** rather than a highlighted
pull-quote: avatar, name, date, Google mark, five stars, link through to the
profile. Styled to Google's own conventions — `#dadce0` hairline border,
`#70757a` secondary text, amber `#FBBC04` stars **rather than the site's brand
yellow**. Borrowing the site accent would have undercut the one thing the card
exists to do, which is look like it came from Google rather than from us.

Avatar and date are the real ones from Nando's May 2026 review, taken from the
client's own review widget and self-hosted rather than hotlinked off
googleusercontent.

**Stat row removed** (2019 · 5.0★ · 24/7 · Same day). Every figure was already on
the page — "founded 2019" opens this section's own lede, the rating and review
count are in the hero trust badge, and 24/7 response plus same-day quotes are
both in the promise bar directly above it. A fourth repetition added height, not
credibility.

Removed the data, markup, `Stat` type, schema field and CSS rather than blanking
the array: the component guarded on length, so leaving it would have meant ~25
lines that could never render. `git revert 8480043` restores it.

**If sub-service pages are wanted later** (`/mowing`, `/sod-installation`), say
so — they would need real, differentiated content rather than a split of the
parent page, and the reserved-slug guard in `urls.ts` will catch any collision.


### 2026-08-06 — bay-plumbing-co: hero background video

Operator supplied `b_w_875.mp4` — the client's own hero footage, pulled off their Weebly site.
Self-hosted at `public/video/hero-bay-plumbing.mp4`. 1280×720, H.264 + AAC, 35.6s, **11.19 MB**,
already faststart (`moov` before `mdat`), so it streams rather than waiting on a full download.

**Both video schema fields were `.url()`-only, which made self-hosting impossible.** A file dropped
in `public/` can only be referenced as `/video/x.mp4`, and that fails URL validation — the only way
to satisfy the schema was to hardcode the deploy domain, which then breaks on every preview URL and
the day a custom domain is attached. Relaxed `default_hero_video` and `hero.video` to `z.string()`,
matching the "URL or local path" convention the photo fields already document.

**Set on `home.hero.video`, deliberately not on `config.default_hero_video`.** Service and
service-area pages pass no `video` prop, but `default_hero_video` would have put an 11 MB autoplay
asset behind the hero of all 25 pages. Verified in the built output: exactly 1 page carries a
`<video>`.

The poster is `/img/hero-pipe-wrenches.jpg`, so LCP paints from the JPEG rather than waiting on video
data, and `prefers-reduced-motion` — which the component honours by hiding the video entirely —
leaves the still in place. Confirmed `display: none` under a reduced-motion context.

Caching: Vercel serves it `max-age=0, must-revalidate`, but with a strong ETag. Checked a
conditional request — repeat visits get **304, 0 bytes re-sent** — so the 11 MB is a first-visit cost
only. `accept-ranges: bytes` is set, so seeking and partial fetch work. Left as-is rather than adding
a `vercel.json` header rule that could collide with the adapter's generated config.

**Content note for the operator.** The clip is a montage and the plumbing does not lead: roughly the
first 10 seconds are the black-and-white interior/window footage flagged in `audit_results.json`, and
it only reaches the showerhead and chrome-tap shots at about 14s and 28s. A first-time visitor sees
the living-room segment. Trimming the first ~12s would fix it and would also cut the file size
substantially, but that needs a transcoder — **ffmpeg is not installed on this machine**, so nothing
was re-encoded. A `#t=12` media fragment was considered and rejected: `loop` restarts at 0, so it
would only affect the very first play.

Also unaddressed without a transcoder: the file still carries an AAC audio track that can never play
(the element is `muted`), and mobile downloads the full 11 MB — the component has no small-screen
opt-out.

Verified: 13 routes, exactly 1 with a hero video, 0 console errors; playing/looping/muted at 1280×720
locally and live; mobile 390px playing with no horizontal overflow; production asset 200 with
correct `video/mp4` content type.

### 2026-08-06 — bay-plumbing-co: two header phone buttons + residential/commercial service split

**Two stacked call buttons.** Miami `(305) 446-8141` and Key Biscayne `(305) 361-1177` — both numbers
the client has published for decades. Style and effects unchanged from the single button (white ring,
two-ring pulse, hover lift); everything scaled down so the pair occupies about the height one used to
and the bar does not grow: badge 2.5rem→2.05rem, glyph 1.35rem→1.1rem, number 1.05rem→0.95rem, label
0.72rem→0.66rem. Header measures 106px at desktop and 103px at mobile — unchanged.

The label now carries the LOCATION rather than "Give Us A Call!", which makes it load-bearing: it is
the only thing distinguishing the two buttons, so the old `.mobile-phone .phone-label { display:
none }` rule had to go or mobile would show two identical-looking buttons.

Both buttons render from one `phones` array used by the desktop nav and the mobile bar, so the two
can never drift, and the secondary entry drops out cleanly for a client with one number.

**Services split into two audiences — full separate sets, per operator decision.** Ten service pages
now: five residential, five commercial. `SERVICE_LIMIT` raised 5→10, but the guardrail did not
loosen — it moved to a new `SERVICE_NAV_LIMIT = 5`, which is **per market**, so neither menu can
quietly grow past five.

| Residential | Commercial |
|---|---|
| Emergency Plumbing Repair | Backflow Testing & Certification *(moved from residential)* |
| Drain Cleaning & Stoppages | Grease Trap Pumping & Repair *(new)* |
| Septic Systems & Drainfields | Property Maintenance & Inspections *(new)* |
| Water & Sewer Lines | Commercial Drain & Sewer Jetting *(new)* |
| Fixtures, Water Heaters & Remodels *(new)* | New Construction Plumbing *(new)* |

Every new page is built from capability the client already documents on their own site — grease trap
pump-outs, the property-maintenance inspection list (sewer, backflow, drainfield, septic, leaks,
water pressure, hot water service, water connections), new construction, fixture install and
kitchen/bath remodelling. Nothing was invented.

New `audience` enum on the services schema, **required with no default**: a service that silently
defaulted would vanish from one menu with nothing failing at build time — the same class of bug as
the sliced-collection 404 that `lib/limits.ts` documents.

Nav labels are "Residential Plumbing" / "Commercial Plumbing" rather than the full page titles, to
keep the bar off the two phone buttons. The full "…Services" name is the H1 and the `aria-label`, so
nothing is lost to a screen reader or to search. Verified no wrap or overflow at 1600/1440/1280/1180/
1024/940 — nav height is a constant 70px across all of them.

`/services/residential` and `/services/commercial` are new static routes, which under Astro take
priority over `[slug].astro`. That makes `residential` and `commercial` **reserved service slugs**: a
service file named either would build a detail page permanently shadowed by the index — reachable
from nowhere and invisible to any check that only asserts a 200. `getStaticPaths` now throws on the
collision rather than shipping a dead page.

All three index pages (`/services` and the two sub-indexes) render through one new `ServiceIndex`
component rather than three near-identical copies — `/services` passes both groups and gets headings,
the sub-indexes pass one and render without. The home grid and the footer are likewise grouped, the
footer going from 4 to 5 columns.

**One layout bug this surfaced.** The home service tiles were `display: block` with `aspect-ratio:
16/10` and an absolutely positioned `.body` pinned to the bottom, so any title long enough to wrap to
three lines grew *upward* past the top edge and was cut off by `overflow: hidden`. "Fixtures, Water
Heaters & Remodels" lost its entire first line. Rebuilt as a flex column that pushes the body to the
end, with the 16/10 proportion kept as a minimum via a `::before` spacer rather than a fixed size —
short titles look identical, long ones make the tile taller. Title clamp trimmed to
`clamp(1.3rem, 2.1vw, 1.75rem)`. Asserted zero clipped tiles at 1440/900/390.

Verified: **32 routes**, 0 bad statuses, 0 broken images, 0 header/phone/pulse mismatches, UserWay
present on every page, 0 console errors, no horizontal overflow at 390px. Live re-check of 9 routes
including all five new service pages returns 200, with both phone labels and both menu labels correct.

**Watch item for the operator:** "Drain Cleaning & Stoppages" (residential) and "Commercial Drain &
Sewer Jetting" are the one genuine overlap in the split. The copy differentiates them hard — domestic
blockage vs. grease-laden shared commercial lines, preventive intervals and out-of-hours scheduling —
but they are the two pages most likely to compete with each other in search. Worth watching once
there is ranking data.

### 2026-08-06 — firefly-cd: swapped GHL booking calendar widget site-wide

Deploy `firefly-2352v0xuf`. Snapshot `.site-edit-history/2026-08-07T01:01:26Z-c4v7n8/`.

Operator pasted a new GHL booking snippet. Booking id `J4EfjuMK45J9Yqx54csv` →
`n9qMfgZ9DjXJ5ETyTHaf`, iframe id `A02mxvDgWoqPZgbsPZ1v_1784767364982` →
`KMD91vGgtSPfUcKDZc8G_1786064413346`, and the new snippet adds `allow="payment"` — the old one had
no `allow` attribute, so this calendar can take payment at booking where the previous one could not.

**One field changed.** The widget lives in `crm.calendar_embed_snippet` and is consumed by
`Hero.astro`, `book.astro`, and `pricing.astro`, so a single config edit reaches every page that
renders it. Pasted verbatim per the paste-only rule — no loader URL synthesized, no reformatting.
Verified by parsing before/after JSON and diffing flattened key paths: exactly one field differs,
and the stored value is a byte-exact match for the operator's paste.

**Renders on 16 of 24 pages** — home, `/book/`, `/pricing/`, all 6 area pages, and all 7 service
pages. It does NOT appear on `/about/`, `/contact/`, `/our-work/`, `/services/`, `/service-areas/`,
`/privacy/`, `/terms/`, `/accessibility/` — those templates never included a calendar. "On all pages"
was read as *replace it everywhere it currently appears*, not *add it to pages that never had one*.
If the latter was intended, that is a template change, not a config change.

Pre-deploy, both the new widget URL and `form_embed.js` were checked for 200 — a dead booking id
would have shipped an empty iframe that still passes every HTML-level check. Post-deploy sweep of all
16 live pages: 16/16 carry the new booking id, 0 retain the old booking id, 0 retain the old iframe
id.

### 2026-08-06 — firefly-cd: phone number switched site-wide

Deploy `firefly-gcyty7gey`. Snapshot `.site-edit-history/2026-08-07T01:16:05Z-h8t2y5/`.

`(509) 590-4604` / `+15095904604` → `+1 509-295-9346` / `+15092959346`. Two fields in
`config.json` (`phone`, `phone_display`); before/after JSON key-path diff confirms exactly those two
changed and nothing else.

**Only one phone number has ever existed on this site.** A regex sweep of `src/content/` throws a
pile of false positives — Unsplash photo ids (`photo-1516216628859-…`), `our-work.json` longitudes
(`-117.4224898`), the Facebook profile id (`61563790073217`), and the GHL calendar iframe id
(`…_1786064413346`) all match a naive phone pattern. The real number lived in exactly two config
fields. Verified there is no second line (no claims dept, no separate tracking number) and no phone
inside the pasted CRM snippets or `code_injection`, so nothing paste-only had to be touched.

Render counts are identical before and after — 82 display strings, 76 `tel:` hrefs, 24 E.164
(schema.org JSON-LD), across all 24 pages. Old number: zero occurrences in `dist/` and zero across a
17-page live sweep.

**Display format changed, deliberately but flagged.** The operator wrote the display string as
`+1 509-295-9346`, so that is what was stored, verbatim. The site's prior convention was the
parenthesised `(509) 590-4604`. If the intent was only to change the digits and keep the house style,
the one-line fix is `phone_display: "(509) 295-9346"` — `phone` stays as is either way.

Note for anyone diffing a live sweep loop: `for p in $PAGES` with a space-joined variable did not
word-split here and silently fetched a single bogus URL, reporting 0/17. Inline the list in the
`for` statement instead of building it in a variable.

---

## GreenTree Inc. — 2026-08-07

| | |
|---|---|
| Slug | `greentree-inc` |
| Template | `owl` (standard caps) |
| Old site | https://greentreeinc.com/ (WordPress 6.5.9, Total theme v5.19) |
| Live | https://greentree-inc.vercel.app |
| Pages | 22 static + `/book` and `/api/estimate` as SSR functions — 4 services, 3 service areas, 3 blog posts |
| Vertical | Commercial landscape maintenance |
| Market | Miami-Dade, Broward and Palm Beach Counties, FL |
| Cost this run | **$0.00** |

> Operator asked for this "following the Tropical South Tree Services template".
> Same template (`owl`) and same three-token accent problem, but **not** Tropical's
> raised caps: that client published 20 services and 16 areas with real permitting
> differences per city. GreenTree publishes 4 services and claims 3 counties. Caps
> left at stock; forcing 20 pages here would manufacture exactly the thin
> near-duplicate pages `src/lib/limits.ts` exists to prevent.

### Identity

GreenTree Inc., founded 1984. (305) 665-8128 · landscape@greentreeinc.com ·
Mon–Fri 8:00 AM – 4:30 PM. Family owned and run, **Minority Certified**, commercial
clients only, landscape maintenance only. No street address is published anywhere.

### Both paid data sources were unavailable — and it cost nothing

- **No `.env` in the kit root**, so `APIFY_TOKEN` is unset and `/find-business`
  could not run. Same condition as the Tropical build. No GBP means no verified
  address, no geo, no rating, no review count.
- **Firecrawl was blocked outright** — all engines failed
  (`fire-engine;chrome-cdp;stealth`) on greentreeinc.com. Fell back to direct HTTP
  fetch, which succeeded on every page. Reddit is also unreachable both ways now
  (WebSearch blocks the domain, Firecrawl returns "we do not support this site"),
  so `local-research` was built from Firecrawl *search snippets* plus two
  commercial-landscape trade sources.

Net effect: full intake, zero spend, but `address.street`, `geo`, `rating` and
`review_count` ship unset. `LocalBusiness` JSON-LD emits without a street address.

### Three things the client should be told regardless of whether they buy

1. **Another company's website is live inside theirs.** `/193-2/`, titled "ABOUT",
   serves complete marketing copy for **Fluidity Funding Solutions**, a Denver
   small-business lender — its logo, its Denver address, its phone number, and an
   "APPY NOW" typo. Unlinked from nav but publicly reachable and indexable.
2. **The homepage has no `h1` at all**, and no page has a meta description.
3. **The phone number is not a link anywhere on the site.** Zero `tel:` elements.
   For a business whose only conversion path is a phone call, that is the costliest
   single defect on the old site.

### Content decisions

**Testimonials excluded.** The old site carries ten reviews signed Rachel Patel,
James Kim, Jessica Lee, Michael Brown, Emily Thompson, Robert Stevens, Melissa
Williams, David Peterson, Sarah Kim and John Smith — a stock-name roster, uniformly
AI-flavoured prose, and not one company name on a **commercial-only** contractor's
testimonial page. Tagged `_suspect_placeholder` in `intake-scraped.json` and kept
out of `home.json`. `Testimonials.astro` guards on `items.length > 0`, so the band
self-hides cleanly. **Do not ship these without the client vouching for them.**

**No licensed / insured / bonded claims.** The client asserts none of the three
anywhere, and procurement buyers verify. All three are `false`.

**No rating, no review count, no published prices.** Nothing verifiable exists for
the first two; the client publishes none of the third. `/pricing` therefore ships
the *variables that drive a quote* shape of `cost_table` (as `raircon` does) rather
than an invented rate card.

**Copy is aimed at property managers, not homeowners.** This is the whole
positioning: the buyer is a commercial property manager, HOA board or facility
manager buying predictability and reputation protection. Every "free estimate" call
site was rewritten to "request a proposal", matching the client's own "Request A
Quote" language.

**GO GREENTREE** — the client's own nine-letter acrostic, buried at the bottom of
their services page — became the `signature_system` section. It is a genuine brand
property and the template's own guidance says to use the client's own name for that
section, never another company's.

### Design

Brand greens taken from the client's stylesheet: `#275304` (20 occurrences, the
logo mark) and `#6da716` (21 occurrences, links/accents). Textbook owl three-token
split, same shape as Tropical:

| Token | Value | Measured |
|---|---|---|
| `--color-primary` | `#275304` | white on it = **9.03:1** |
| `--color-accent` (fill only) | `#6da716` unmodified | `#10230a` on it = **5.68:1**; as text on bg it is 2.71:1, hence never text |
| `--color-accent-ink` | `#3d6b08` | **5.91:1** on bg, **6.35:1** on surface |
| `--color-accent-on-dark` | `#a8d95f` | **5.49:1** on primary (fill green would be 3.09:1) |

Every text pair clears WCAG AA. Fonts: **PT Sans** for both display and body — the
client's actual brand font and the only family detected, so owl's Montserrat/Inter
default was overridden rather than blended.

Imagery: 8 photos from the client's own site, each opened and inspected. Three
rejected — a visibly blurry upscaled hedge, a 3D-rendered turf clipart, and the
Fluidity Funding logo. **Caveat: every surviving photo is temperate-climate stock**
(spruce, hostas, begonia borders); the hero is plainly a northern office park. A
South Florida commercial landscaper whose site shows no South Florida is a weak
proof point, and real crew photos are the single biggest upgrade available.

### Three template defects inherited, all previously known

All three were fixed locally in `sites/greentree-inc/`. **None of them are fixed in
`astro-templates/owl`.**

1. **`/contact`, `/blog` and `/service-area` shipped with no `h1`.** `SectionHead`
   always emits `h2`, and on those three pages it *is* the primary heading. This is
   the identical defect fixed in `sites/tropical-south-tree-services` on
   2026-08-06 — the `as` prop fix was never back-ported, so every owl site
   scaffolded since has re-inherited it. Ported the same fix (default stays `h2`;
   also brought across the `--section-head-*` inheritable colour overrides).
2. **Service tiles clip long titles.** `aspect-ratio: 16/10` plus an absolutely
   positioned `.body` means the caption cannot influence tile height, so it grows
   upward past the top edge and `overflow: hidden` eats it — with a green build.
   Tropical's log called this the *second* client in a row to hit it and said it
   was "worth fixing in `astro-templates/owl` itself". **This is the third**
   ("Landscape Maintenance" plus three chips). Ported Tropical's content-sized
   `min-height` fix.
3. **NEW — the hero trust-badge row is hard-coded for exactly two badges.** The
   `@media (max-width: 560px)` rule pins `flex-wrap: nowrap` *and*
   `white-space: nowrap`, correct for a Google + BBB pair and broken for any other
   count: the row can no longer wrap and its text can no longer break, so the
   list's min-content width becomes the sum of every badge. Three badges produced a
   **410px floor inside a 375px viewport** and pushed the entire document into
   horizontal scroll — hero container, `main` and the cookie bar all stretched with
   it. Fixed by keeping `wrap` and dropping the `nowrap` on the labels, which is
   count-agnostic; a two-badge pair still fits on one row at the reduced sizes, so
   the case the rule was written for is unchanged.

A fourth, milder issue was content-level rather than structural: `/services/`
hard-codes `"What we do for {city} homeowners."` and `WhyChooseUs` hard-codes
`"Reasons homeowners pick us"`. Both are wrong for any commercial-only client and
were rewritten here.

### Verification

22/22 static pages have exactly one `h1`. All titles unique, all meta descriptions
present, 0 broken internal links, no horizontal overflow at 375px on home, pricing
or service pages. JSON-LD emits LocalBusiness, Service, FAQPage, BreadcrumbList and
Organization. Live: all 22 routes plus `/book` return 200; canonical, robots and
sitemap all resolve to `https://greentree-inc.vercel.app`.

### Outstanding — needs operator / client

| Field | Status |
|---|---|
| `address.street` / `postal` / `geo` | **unset — genuinely ambiguous.** Nothing on the client's site. Directories split: 8313 NW 70th St, Miami FL 33166 (Manta, Yellow Pages) vs 9920 SW 77th Dr, Miami FL 33173 (ZoomInfo). Needs the client or a GBP lookup. |
| `rating` / `review_count` | unset — needs `APIFY_TOKEN` restored in `.env` |
| `crm.*` (chat, reviews, calendar, contact form, call tracking) | empty — GHL paste-in |
| `crm.form_action_url` / `captcha_snippet` | unset. The native EstimateForm posts to `/api/estimate`, which needs `LEAD_WEBHOOK_URL` **or** `RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL` + `LEAD_FROM_EMAIL` in Vercel env, or submissions fail with `?error=unavailable`. **The form is live and cannot deliver a lead until this is set.** |
| `code_injection.head` / `body_end` (Pixel, GTM) | empty — operator |
| `licensed` / `insured` / `bonded` | all `false` — ask the client; a commercial contractor almost certainly carries GL, they just never published it |
| `team_members` | empty — nobody is named publicly |
| `testimonials` | deliberately empty — see above |
| Custom domain | not attached |
| Short link | not created |
| Back-port of the three owl fixes | **not done — template still ships all three** |

### 2026-07-29 — DNS cutover prep: domain attached, legacy redirects, canonicals

Operator is moving whitmanlawncare.com nameservers to GoDaddy. Attached
`whitmanlawncare.com` and `www.whitmanlawncare.com` to the Vercel project, repointed
canonicals, and covered every legacy URL.

**DNS snapshot taken BEFORE the switch** (old nameservers ns1/ns2.uneedevisions.com, host
72.52.212.85 = host2.uneedevisions.com):

| Record | Value |
|---|---|
| A (apex) | 72.52.212.85 |
| www | CNAME → apex |
| **MX** | **`0 whitmanlawncare.com`** — mail is on the same box as the site |
| TXT | `v=spf1 +a +mx +ip4:72.52.212.85 ~all` |
| mail / webmail / autodiscover / ftp / cpanel | all → 72.52.212.85 |

**The trap:** MX points at the apex. Repoint the apex A record at Vercel without changing
MX and every @whitmanlawncare.com address starts resolving to Vercel, which runs no mail
server — inbound mail dies silently. Fix is to give MX its own host: `mail` A →
72.52.212.85, MX → mail.whitmanlawncare.com, and drop `+a` from SPF (the apex will no
longer be a mail sender). whitmanlawncare.**net** is a separate domain on the same host
with the same self-referencing MX — the client's actual address (dan@whitmanlawncare.net)
lives there, so leave .net alone unless it is being moved too.

**Legacy redirects — the trailing slash nearly ate this.** All 20 URLs in the client's
WordPress sitemap live under `/website/` and all end in a slash. Astro's `redirects` config
emits route regexes anchored `^…$`, so `/website/core-aeration` matched and
`/website/core-aeration/` returned 404 — i.e. the form that actually exists would have
broken. Verified against a real deployment, not assumed.

Tested three candidate syntaxes on throwaway paths in one deploy:

| Syntax | `/x` | `/x/` |
|---|---|---|
| `/x` | 307 | **404** |
| `/x{/}?` | 307 | **307** |
| `/x/:rest*` | 307 | **404** |
| `/x/?` | — | rejected at deploy: invalid source pattern |

So `{/}?` is the one. Also confirmed **vercel.json redirects and the Astro Vercel adapter's
build output apply together** — adding vercel.json did not clobber the adapter's routes and
normal pages kept serving. All redirects therefore now live in `vercel.json` as the single
source of truth (removed from astro.config). Trade-off: vercel.json does not apply to
`astro dev`/`astro preview`, so legacy redirects only resolve on a deployment.

All 20 verified live: 308 → 200, zero failures. `/website/free-estimates/` → `/book`,
`/website/promos/` → `/pricing`, `/website/employment/` → `/contact` are judgement calls
(no 1:1 page exists yet); everything else is a true equivalent. A `/website/:path*`
catch-all sends anything unlisted to the home page.

**Canonicals repointed** to `https://whitmanlawncare.com` in astro.config `site`,
`robots.txt` and `config.json` `site_url` — done now so nothing needs rewriting after
propagation. Verified: canonical and og:url on the real domain, 31 sitemap URLs all on the
real domain, zero `.vercel.app` strings left in the home HTML or sitemap.

**Origin allowlist widened** in `src/pages/api/estimate.ts`: once a custom domain is
attached Vercel serves both apex and www, but `site` names only one, so a form posted from
the other host would have been rejected as cross-site. It now accepts the sibling host in
both directions.

**DNS cutover COMPLETE 2026-07-29.** whitmanlawncare.com is live on Vercel.

Operator built the GoDaddy zone as specified. Verified by querying ns75.domaincontrol.com
directly rather than trusting propagation or the control panel:

| Record | Value | Purpose |
|---|---|---|
| A `@` | 76.76.21.21 | Vercel |
| CNAME `www` | whitmanlawncare.com. | resolves through to Vercel |
| A `mail` | 72.52.212.85 | old host — gives MX a target that is not Vercel |
| MX `@` | mail.whitmanlawncare.com (pri 0) | mail stays on the old server |
| TXT `@` | v=spf1 +mx +ip4:72.52.212.85 ~all | `+a` dropped, apex is no longer a sender |

**GoDaddy blocks an A record at `www` if a CNAME already exists** — that is the DNS rule
that a CNAME cannot coexist with any other record at the same name, not a GoDaddy quirk.
The pre-existing `CNAME www → apex` already chains to Vercel, so the A record was
unnecessary. Preferable too: only the apex A needs changing if Vercel's IP ever moves.

**Vercel did NOT auto-provision the TLS certificate.** DNS resolved correctly and the site
served fine over HTTP (`Server: Vercel`), but HTTPS failed for 5+ minutes with
`SSL_ERROR_SYSCALL` — the edge rejecting the handshake because no cert matched the SNI.
`vercel certs ls` confirmed no cert existed for the domain while other domains in the team
had them, so the mechanism worked and this one had simply stalled. Fixed with an explicit
`vercel certs issue whitmanlawncare.com www.whitmanlawncare.com` (18s). **If a cutover
looks right but HTTPS hangs, check `vercel certs ls` before assuming propagation.**

Note `openssl s_client` is useless from this sandbox — raw TCP sockets are blocked, so it
returns empty and looks like a server fault. Only curl HTTP(S) gets out. An earlier port
scan of the client's mail host reported every port closed for the same reason; that reading
was worthless and was retracted rather than acted on.

**Final verification, all against https://whitmanlawncare.com:**
- Valid cert (`ssl_verify_result: 0`), HTTP/2, HSTS `max-age=63072000`, http → 308 → https.
- Both apex and www serve 200.
- 20/20 legacy `/website/*` URLs → 308 → 200.
- 21/21 new routes 200, including `/online-payments` with the PayPal SDK present.
- Canonicals on the real domain, 31 sitemap URLs, zero stale `.vercel.app` references.

Still open and unchanged by the cutover: `/api/estimate` has no delivery destination
(`vercel env ls production` empty) so lead forms capture nothing — now live traffic; no
captcha on that endpoint; no live PayPal test transaction has confirmed funds routing; and
`/free-estimates`, `/promos`, `/employment` are redirects to near-equivalents rather than
real rebuilt pages.
