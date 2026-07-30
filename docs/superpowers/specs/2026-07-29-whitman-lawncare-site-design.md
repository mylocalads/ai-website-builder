# Whitman Lawn Care — Site Design Spec

**Date:** 2026-07-29
**Slug:** `whitman-lawncare`
**Template:** `owl` (structural duplicate of `gilroy-roofing`)
**Deploy target:** `https://whitman-lawncare.vercel.app`

## Goal

Build a structural duplicate of https://gilroy-roofing.vercel.app for Whitman Lawn Care
LLC of Scranton, PA — same template, same component set, same fixed section order —
repopulated with Whitman's brand tokens, services, and service areas.

## Source of truth

| Field | Value | Source |
|---|---|---|
| Business name | Whitman Lawn Care LLC | whitmanlawncare.com |
| Tagline | Locally Owned and Operated Lawn Care Services | whitmanlawncare.com |
| Phone | (570) 451-3683 / `+15704513683` | whitmanlawncare.com |
| Email | dan@whitmanlawncare.net | whitmanlawncare.com |
| Address | PO Box 3092, Scranton, PA 18505 | whitmanlawncare.com |
| Hours | Mon–Fri 8:30am–4:30pm | whitmanlawncare.com |
| Experience | 25+ years serving Northeast PA | public directory listings |
| Facebook | https://www.facebook.com/WhitmanLawnCareLLC/ | web search |
| Rating / reviews | **None — no GBP exists** | Apify runs `sudYb2BOeJcpCnXXp`, `zekmPV8obZbA4CAPg` |

Saved to `sites/whitman-lawncare/business_profile.json`.

### No social proof — explicit decision

Two Apify Google Maps lookups (Scranton PA, Avoca PA) returned zero places. Yelp and
Manta listings are unclaimed. No public reviews exist for this business.

Consequences, all deliberate:

- `home.testimonials` — placeholder cards, not fabricated reviewer names.
- `hero.quote_card` — placeholder.
- `hero.trust_badges` — no star rating and no BBB grade. Two label-only badges carrying
  claims that are verifiably true: "25+ Years" / "Serving NEPA", and "Locally Owned" /
  "& Operated".
- `config.rating` and `config.review_count` — key omitted entirely.
- `seo_body.review` — key omitted, so `SeoBody` renders without the review card.

Never fabricate a reviewer name, star rating, or review count. When the client supplies
real reviews, swap the placeholders and add `rating` / `review_count` to `config.json`.

## Design tokens

`src/styles/tokens.css`:

```css
--color-bg:         #ffffff   /* primary background, client-specified */
--color-surface:    #f4f7f2   /* faint green tint; cards need to read against white */
--color-text:       #111a11
--color-muted:      #5a6a5a
--color-primary:    #0b4801   /* secondary background, client-specified */
--color-on-primary: #ffffff
--color-accent:     #feb81a   /* primary CTA, client-specified */
--color-on-accent:  #0b4801   /* 8.9:1 against #feb81a */
--color-focus:      #0057ff
```

Fonts unchanged from Gilroy: Montserrat display, Inter body.

**Contrast note:** white on `#feb81a` measures 2.0:1 and fails WCAG AA. Gilroy's
white-on-orange button treatment does not carry over — CTA labels are dark green.
`--color-on-accent` must not be set to white on this site.

Logo: `https://whitmanlawncare.com/website/wp-content/uploads/2025/10/2025logo.png`
downloaded to `public/logo-whitman.png`, referenced as `/logo-whitman.png`.

## Services — 10, caps raised

All 10 client-listed services get a markdown file and a detail page. Slugs mirror the
live site's URLs so existing links and any indexed equivalents map 1:1.

| Order | Title | Slug |
|---|---|---|
| 1 | Fertilization | `fertilization` |
| 2 | Weed Control | `weed-control` |
| 3 | Core Aeration | `core-aeration` |
| 4 | Grub Control | `grub-control` |
| 5 | Flea, Tick & Mosquito Control | `flea-tick-control` |
| 6 | Pest Control | `pest-control` |
| 7 | Tree and Shrub | `tree-and-shrub` |
| 8 | Organic Fertilizer | `organic-fertilizer` |
| 9 | Lime | `lime` |
| 10 | Soil Testing | `soil-testing` |

Copy is adapted from each live page (scraped 2026-07-29), rewritten to the owl schema's
`short_description` / `long_description` shape. No placeholder body text.

### Template cap changes (this site only, never `astro-templates/`)

| File | Change |
|---|---|
| `src/components/ServicesGridOwl.astro` | `slice(0, 5)` → `slice(0, 10)` |
| `src/pages/services/index.astro` | `slice(0, 5)` → `slice(0, 10)` |
| `src/components/Header.astro` | services `slice(0, 6)` → `slice(0, 10)` |
| `src/components/Footer.astro` | services `slice(0, 6)` → `slice(0, 10)` |
| `src/pages/services/[slug].astro` | related-services `slice(0, 5)` unchanged |

Service-area slices stay at 6 everywhere.

## Service areas — 6

`scranton-pa`, `wilkes-barre-pa`, `clarks-summit-pa`, `dickson-city-pa`, `moosic-pa`,
`carbondale-pa`. All match `^[a-z0-9-]+-[a-z]{2}$` and none collide with the owl
reserved slug (`index`).

Each carries county, neighborhoods, and lawn-specific `local_context` — clay and shale
soil, freeze-thaw, acidic soil needing lime, crabgrass pre-emergent timing, grub
pressure — not generic filler. Landmark photos are CC-licensed Wikimedia images with
`landmark_credit` and `landmark_credit_href` populated, matching Gilroy's pattern.

## Placeholder widget slots

The client has not supplied GHL snippets. Rather than fall back to the native
`EstimateForm`, both slots render a labeled placeholder image sized to the real widget,
so the slot is visually obvious and the later swap is a one-line change.

| Page | Slot | Placeholder | Height |
|---|---|---|---|
| `/book` | `crm.calendar_embed_snippet` | `public/placeholder-calendar.svg` | ~700px |
| `/contact` | `crm.contact_form_snippet` | `public/placeholder-contact-form.svg` | ~1391px |

Placeholders are local SVGs — no external requests, theme-aware via the site's own
tokens. The conditional in each page becomes: snippet if present, else placeholder
image. The `EstimateForm` fallback branch is removed from these two pages.

Testimonials and the hero quote card get the same treatment via placeholder card
markup, per the no-social-proof decision above.

## Home page content

Fixed owl section order, unchanged: hero → promise-bar → services-grid → testimonials →
promise-band → signature-system → process-steps → about → seo-body → faq → blog-cards →
closing-cta → footer.

- **Hero** — eyebrow "Scranton, PA"; headline built on the real differentiator (25+
  years, locally owned, treatment-program specialist rather than a mow-and-blow crew);
  CTA "Get My Free Lawn Analysis" → `/book`.
- **Promise bar** — three true claims: locally owned and operated, 25+ years in NEPA,
  custom treatment plans per lawn.
- **Signature system** — Whitman's own name for their program. Never another company's
  branded system name.
- **Process steps** — soil test / analysis → custom program → seasonal applications.
- **SEO body** — NEPA-specific: acidic shale soil, short growing season, grub and
  crabgrass pressure timing.
- **FAQs** — 6 entries on program timing, safety around pets and children, organic
  options, soil testing, service area, and scheduling.

`config.services_section`: eyebrow "Our Services", heading "Lawn treatment" / "programs
that work".

## Blog

Owl requires at least one post or `/blog` renders empty and `BlogCards` omits itself.
One real NEPA-specific article: the northeast Pennsylvania lawn treatment calendar
(pre-emergent timing, grub window, fall aeration and lime).

## Legal and compliance

Privacy, Terms, and Accessibility use the standardized shared body text with business
info interpolated. `compliance: { ada: true, gdpr: true, a2p: true }`.

## Out of scope

- Vercel deploy — separate step, run after local build passes.
- Custom domain attach.
- Short link.
- GHL widget wiring — placeholders until the client supplies snippets.
- Meta Pixel / GTM code injection — `code_injection` slots left empty.

## Verification

1. `npm install && npm run build` in `sites/whitman-lawncare/` — must pass clean.
2. `npm run preview`, then check the home page, one service page, one service-area page,
   `/book`, and `/contact` in the browser.
3. Confirm CTA contrast renders dark-on-yellow, not white-on-yellow.
4. Confirm all 10 services appear in the home grid, header, and footer.
5. Confirm no fabricated review text, reviewer name, or star rating appears anywhere.
