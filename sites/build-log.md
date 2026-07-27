| Business | Slug | Pages | Vercel URL | Date |
|----------|------|-------|------------|------|
| Headley Construction Group | headley-construction-group | 19 | https://headley-construction-group.vercel.app | 2026-07-23 |

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
