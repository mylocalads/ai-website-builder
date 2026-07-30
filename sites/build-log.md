| Business | Slug | Pages | Vercel URL | Date |
|----------|------|-------|------------|------|
| Headley Construction Group | headley-construction-group | 19 | https://headley-construction-group.vercel.app | 2026-07-23 |
| Bilski's Lawn Care | bilskis-lawncare | 23 | https://bilskis-lawncare.vercel.app | 2026-07-29 |
| Smile Lawn Care | smile-lawn-care | 38 | https://smile-lawn-care.vercel.app | 2026-07-29 |

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
