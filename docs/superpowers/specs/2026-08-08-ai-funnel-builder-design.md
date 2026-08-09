# ai-funnel-builder — Design

**Date:** 2026-08-08
**Status:** Approved (design). Implementation plan to follow.
**Parent kit:** `ai-website-builder` (this repo)

---

## 1. Purpose

A sibling agent to `ai-website-builder` that takes a single business URL and, with no
further operator input, builds and deploys a 3-page paid-traffic booking funnel.

The output is not a website. It is a conversion asset for ad traffic: no navigation, no
outbound links, no SEO surface. Its only job is survey → book → confirm.

The visual DNA and step structure are modelled on the live reference funnel:

| Step | Reference URL |
|---|---|
| 1 | `https://find.bestlocalcontractor.online/firefly-booking-inspection` |
| 2 | `https://find.bestlocalcontractor.online/firefly-book-inspection` |
| 3 | `https://find.bestlocalcontractor.online/thank-you-firefly-361011` |

Reference funnel findings (verified 2026-08-08 by inspecting the live pages):

- Step 1 is a 4-step GHL survey ("1 of 4") over a photo hero, with a teal trust bar of
  four badges above it and the GHL reviews widget
  (`backend.leadconnectorhq.com/appengine/reviews/get_widget/…`) below.
- Step 2 is the GHL native calendar widget plus a long FAQ accordion.
- Step 3 interpolates the booked datetime into a headline and pushes a click-to-call.
- The footer carries copyright, Privacy/Terms links, and the My Local Ads house CTA
  ("RUN A HOME SERVICE BUSINESS? SEE HOW WE'D FILL UP YOUR CALENDAR!").

**We reproduce the structure and visual DNA, but replace all three GHL embeds with native
implementations.** See §4.

---

## 2. Decisions

Recorded so the implementation does not relitigate them.

| # | Decision | Chosen | Why not the alternative |
|---|---|---|---|
| D1 | Survey + booking implementation | **Fully native** — we build both | GHL embeds give no Google Places confirmation and no control over the survey's look |
| D2 | Repo | **Fresh sibling repo, kit files only** | Cloning carries 199 MB of history for 33 sites we will never build on |
| D3 | SEO posture | **`noindex` everywhere; SEO invariant dropped** | A paid funnel must not compete with the client's real site in search |
| D4 | Reviews carousel | **Native, from scraped GBP reviews** | Full control over the "extremely professional and interactive" look |
| D5 | Booking slot source | **Generated grid, request-to-book** | Nothing is hard-booked, so there is no double-booking risk and no GHL API token per client |
| D6 | Webhook delivery | **Server endpoint proxies to webhook URL** | Keeps the webhook URL out of page source and filters bot spam before the CRM |
| D7 | Google Maps key | **One MLA key, referrer-restricted per deploy** | Contractors will not have their own key; one billing account we control |
| D8 | Legal | **Footer-only Privacy + Terms, same domain** | Meta/Google ad review generally wants a crawlable privacy URL |
| D9 | MLA house CTA | **Ships on every funnel, default ON** | It is the agency's own lead source and belongs on every funnel we deploy |
| D10 | Pipeline gating | **Zero gates before deploy** | The operator wants one command in, a live URL out |
| D11 | Tracking phone + pixel | **Mandatory request, delivered post-deploy** | They cannot gate the build, but the run is not complete without them |

---

## 3. Repo shape

```
~/Claude Projects/mla-agents/ai-funnel-builder/          # fresh git init
├── CLAUDE.md                     # rewritten: funnel pipeline, zero-gate rules
├── README.md                     # rewritten
├── .gitignore                    # inherited, funnels/ paths substituted
├── .env.example                  # + GOOGLE_MAPS_API_KEY
├── package.json                  # name: funnel-builder-kit
├── .claude/
│   ├── commands/build-funnel.md
│   └── skills/{funnel-builder,intake-from-web,find-business,scrape-content,
│                local-research,design-reference,funnel-generate,
│                vercel-deploy,short-link,funnel-edit}/SKILL.md
├── .agent/workflows/funnel-builder.md
├── docs/funnel-intake.md         # from client-intake.md, cut to funnel fields
├── scripts/{screenshot.js,daily-backup.sh,verify-funnel.mjs}
├── reference-libraries/booking-funnel.json
├── astro-templates/booking-funnel/
└── funnels/{slug}/               # per-client output (was sites/)
```

**Not copied:** `sites/` (7.2 GB), `node_modules/`, `screenshots/`, `.unlighthouse/`,
`.firecrawl/`, git history, `unlighthouse.config.ts`.

**Dropped skills:** `site-audit` (there is no prior funnel to screenshot), `project-map`
(a map of client websites), `ai-website-fleet-audit` (SEO/GSC-oriented). Funnel page speed
still matters for ad cost — a funnel-specific performance check is deliberate future work,
not a port of the SEO one.

**Renames:** `sites/` → `funnels/`, `site-generate` → `funnel-generate`, `site-edit` →
`funnel-edit`, `website-builder` → `funnel-builder`, `client-intake.md` →
`funnel-intake.md`.

---

## 4. The `booking-funnel` template

### 4.1 Routes

| Route | Prerender | Purpose |
|---|---|---|
| `/` | static | Step 1 — survey + social proof |
| `/book` | static | Step 2 — booking grid |
| `/thank-you` | static | Step 3 — confirmation |
| `/privacy`, `/terms` | static | Footer-linked legal, `noindex` |
| `/api/step1` | **`prerender = false`** | Webhook fire #1 |
| `/api/step2` | **`prerender = false`** | Webhook fire #2 |

`output: 'static'` with the Vercel adapter, exactly as `astro-templates/owl` does — the two
API routes opt out of prerendering individually.

There is no `Header.astro`. `FunnelLayout.astro` emits `noindex,nofollow`, the three
code-injection slots (`head` / `body_start` / `body_end`), and the brand tokens. It emits
none of the SEO artifacts.

### 4.2 Components

`TrustBar` · `FunnelHero` · `SurveyCard` · `ReviewsCarousel` · `BadgeStrip` ·
`BookingGrid` · `FunnelFAQ` · `CallCTA` · `MlaAgencyCTA` · `FunnelFooter`

`MlaAgencyCTA` renders the My Local Ads house CTA at the bottom of every funnel step.
`config.mla_cta.enabled` defaults to **`true`**; copy and destination live in the template,
not in per-client content, so a copy change propagates on the next build of every funnel.

### 4.3 Content collections

`src/content/site/config.json` (`kind: "config"`) — identity, brand tokens, logo, phone,
IANA timezone, badge/partner assets, webhook config, code injection, `mla_cta`, compliance.

`src/content/site/step1.json` — hero headline, trust-bar items, survey definition
(services-needed options, timeline options), TCPA consent line.

`src/content/site/step2.json` — headline, FAQ list, booking-window config.

`src/content/site/step3.json` — confirmation headline, call-CTA copy.

`src/content/reviews/` — carousel entries scraped from GBP.

No `services` or `service_areas` collections. No `src/lib/limits.ts`, no
`src/lib/agent-docs.js`.

### 4.4 Step 1 survey

A four-pane JS wizard inside `SurveyCard`, with the reference's progress bar:

1. **Services needed** — radio, options from `step1.json` (e.g. Roof Replacement, Roof
   Repair, Decking, Siding).
2. **Timeline** — radio (e.g. Urgent (within 1–3 days), This month, Next month, Not sure).
3. **Project address** — Google Places Autocomplete with a read-only confirmation line and
   an edit affordance.
4. **Contact** — first name, last name, email, phone; TCPA consent text interpolating the
   business name; honeypot field.

One POST at the end of pane 4. Panes are client-side only; nothing is sent until the lead
completes the survey.

### 4.5 Google Places

Loaded from `PUBLIC_GOOGLE_MAPS_KEY`. Captures `formatted_address`, address components,
`place_id`, and lat/lng.

**Degradation is mandatory:** if the key is absent, the script fails to load, or the API
errors, pane 3 falls back to manual street/city/state/postal inputs with format validation.
A Maps outage must never block a paid-traffic lead.

### 4.6 Booking grid

`config.timezone` is an IANA zone written at generate time from the GBP profile. The grid
renders the next 7 days × 8:00 am–8:00 pm in **the client's** zone via `Intl.DateTimeFormat`,
so a lead in another timezone still selects the contractor's local hours.

Request-to-book: no availability lookup, nothing hard-booked. Step 3 states that a team
member will call to confirm, which is what the reference funnel already promises.

---

## 5. Data flow

### 5.1 Step 1 submit

```
SurveyCard (pane 4)
  └─ POST /api/step1  (FormData)
       ├─ honeypot check
       ├─ required-field + email/phone format validation
       ├─ same-site origin check   ← ported from owl's /api/estimate
       └─ server-side POST → FUNNEL_WEBHOOK_URL (Vercel env var)
            └─ 303 → /book?lid={uuid}
```

Payload: `lead_id`, `services_needed`, `timeline`, `address{formatted, street, city, state,
postal, lat, lng, place_id}`, `first_name`, `last_name`, `email`, `phone`, `consent`,
`utm_*`, `page`, `submitted_at`.

### 5.2 PII never enters a URL

The redirect carries **only `lid`, an opaque UUID**. Name, email, phone and address are
never placed in a query string. The display name for step 2's greeting rides in
`sessionStorage` (same-origin, cleared on tab close). With JS enabled the wizard `fetch`es
and then navigates; with JS disabled the native form POST and 303 produce the same result.

### 5.3 Step 2 submit

```
BookingGrid
  └─ POST /api/step2  { lead_id, slot_iso, slot_display, timezone }
       └─ server-side POST → FUNNEL_WEBHOOK_URL (event: "booking_requested")
            └─ 303 → /thank-you?t={slot_display}
```

A slot time is not personal data, so it may travel in the URL — step 3 interpolates it into
the confirmation headline, matching the reference.

UTM parameters are captured on step 1, held in `sessionStorage`, and forwarded on both
fires so attribution survives the hop.

---

## 6. Pipeline — zero-gate

```
/build-funnel {url}
  → intake-from-web → find-business → scrape-content (conditional)
  → local-research → design-reference → funnel-generate → vercel-deploy
  → short-link (only with --short-link {days})
  → POST-DEPLOY HANDBACK
```

**The pipeline does not pause.** There is no per-step approval, no design-approval gate, no
config-summary confirmation. One command in, a live URL out. This is the deliberate inverse
of `ai-website-builder`'s pause-after-every-step default, and `CLAUDE.md` in the new repo
must say so explicitly, because the parent kit's instincts are the opposite.

Two consequences follow, and both need an explicit rule rather than a prompt:

### 6.1 Cost pre-authorization (replaces per-step cost approval)

The parent kit stops and asks before every paid action. That is incompatible with D10, so
the funnel kit pre-authorizes a ceiling instead:

> Invoking `/build-funnel` authorizes up to **$0.40** of paid intake (GBP lookup ~$0.004 +
> Firecrawl homepage ~$0.02 + inner-page batch ~$0.10–0.20 + up to 2 socials ~$0.04).
> A run projected to exceed the ceiling — an unusually large site, many social profiles, a
> retry after a failed batch — **stops and asks**, naming the projected figure.

The ceiling is stated in the new `CLAUDE.md` and echoed in the post-deploy handback with
actual spend.

### 6.2 Business-match confidence (replaces the GBP confirmation card)

The parent kit hard-stops on a GBP confirmation card. Without it, a wrong match silently
produces a funnel for the wrong business. Rule:

- The command's input is a **URL**, so the top GBP result is auto-accepted when its listed
  website domain matches the supplied domain (registrable domain, `www` ignored).
- **No domain match, or multiple GBP results with the same domain → stop and ask.** This is
  a correctness gate, not an approval gate, and is the one permitted interruption.

### 6.3 Skill changes vs the parent kit

| Skill | Change |
|---|---|
| `intake-from-web` | GBP **reviews become load-bearing** — they are the step-1 carousel, not a nice-to-have. Confirmation card replaced by §6.2. |
| `find-business` | Unchanged; invoked internally. |
| `scrape-content` | Unchanged; still conditional on a blocked/thin Firecrawl pass. |
| `local-research` | Kept. Copy angles drive the step-1 headline, the timeline options, and the step-2 FAQ. |
| `design-reference` | Kept. New `reference-libraries/booking-funnel.json` with the Firefly funnel as `role: "primary"`. |
| `funnel-generate` | New, replacing `site-generate`. Writes the collections, `tokens.css`, timezone, reviews, code injection, and the pending-config manifest (§7). |
| `vercel-deploy` | Additionally sets `FUNNEL_WEBHOOK_URL` and `PUBLIC_GOOGLE_MAPS_KEY` on the Vercel project, and emits the Maps-key referrer-allowlist reminder for the new domain. |
| `short-link` | Unchanged, but **skipped by default** — it needs an expiry in days, and asking for one would be a gate. Runs only when the operator passes `--short-link {days}` on the original command. |
| `funnel-edit` | From `site-edit`. The channel through which the post-deploy items are injected. |

---

## 7. Post-deploy handback — mandatory, not optional

Because nothing is requested before deploy (D10), the run ends by **requesting the
operator-supplied config it deliberately did not block on** (D11). `funnel-generate` writes
`funnels/{slug}/pending-config.json` recording which of these are unset; `vercel-deploy`
prints them as the last thing the operator sees:

```
DEPLOYED — https://{slug}.vercel.app        Intake spend: $0.NN

NOT YET LIVE-READY. Three items are required before sending traffic:

  1. WEBHOOK URL       FUNNEL_WEBHOOK_URL is unset — both fires are no-ops.
                       Leads submitted now are LOST.
  2. TRACKING PHONE    No tracking number set; the funnel shows the GBP number.
  3. PIXEL / GTM       code_injection.head is empty — no conversion tracking on
                       any of the three steps.

Supply them with:  /funnel-edit {slug} --webhook … --phone … --pixel …
```

A run is **not reported as complete** while any of the three is unset. "Deployed" and
"complete" are different states and the handback says so in those words. Item 1 is called
out as lead-losing because a funnel that silently drops leads is worse than one that is
visibly unfinished.

---

## 8. Explicitly dropped

The entire SEO & agent-discoverability invariant from the parent `CLAUDE.md`:
`llms.txt`, `/index.md`, `agent-site-summary`, `sitemap-index.xml`, `LocalBusiness` /
`WebSite` / `BreadcrumbList` / `Service` / `FAQPage` JSON-LD, canonical/OG/hreflang tags.
`robots.txt` disallows all. Every page carries `noindex,nofollow`.

Also dropped: `services` and `service_areas` collections, the 5-service / 5-area caps,
`src/lib/limits.ts`, `src/lib/agent-docs.js`, and the `Header` component.

---

## 9. Verification

Per-funnel `npm run build` gate, as the parent kit does today, plus a new
`scripts/verify-funnel.mjs` run against `dist/` that asserts:

1. All five pages built.
2. Every page carries `noindex`.
3. **Zero outbound links** outside the footer legal pair, `tel:`, and the MLA house CTA.
4. Both API routes are present in the Vercel function output.
5. No `REPLACE_` placeholder survives in any built file.
6. No webhook URL appears in any client-side bundle.
7. `robots.txt` disallows all.

Manual smoke test before a real client webhook goes in: walk the four survey panes against
a `webhook.site` URL and confirm both fires land with the expected payload shape.

---

## 10. Phasing

| Phase | Scope | Done when |
|---|---|---|
| 1 | Repo scaffold, `booking-funnel` template, `funnel-generate`, `vercel-deploy` | A funnel builds and deploys from hand-written content |
| 2 | `intake-from-web`, `find-business`, `scrape-content`, `local-research`, `design-reference` ports; `/build-funnel` orchestrator | One URL in, live funnel out, zero gates |
| 3 | `funnel-edit`, `verify-funnel.mjs`, `pending-config.json` handback | A run refuses to report complete with config outstanding |
