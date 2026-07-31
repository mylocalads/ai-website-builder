| Business | Slug | Pages | Vercel URL | Date |
|----------|------|-------|------------|------|
| Headley Construction Group | headley-construction-group | 19 | https://headley-construction-group.vercel.app | 2026-07-23 |
| Bilski's Lawn Care | bilskis-lawncare | 23 | https://bilskis-lawncare.vercel.app | 2026-07-29 |
| Smile Lawn Care | smile-lawn-care | 38 | https://smile-lawn-care.vercel.app | 2026-07-29 |
| H4 Roofing & Construction | h4-roofing-construction | 27 | https://h4-roofing-construction.vercel.app | 2026-07-30 |

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
