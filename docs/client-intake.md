# Client Intake Questionnaire — AI Website Builder

Fill this out per client BEFORE running the pipeline. Every field marked **[required]** must be filled in for the site to build. **[optional]** fields are skipped if left blank (the corresponding section on the site self-hides).

Reference site (the template we clone from): https://firefly-cd.vercel.app

---

## 1. Business Identity

- **[required] Business name (as displayed)** —
  *Example: `Firefly Contractors & Design`*
- **[optional] Legal name** (LLC / Inc — only if different from display name) —
  *Example: `Firefly Contractors & Design LLC`*
- **[required] Tagline** — one line, appears in the browser tab title —
  *Example: `Your Premier Spokane Remodeling Contractor`*
- **[required] Phone number** — any format, we'll clean it up —
  *Example: `(509) 590-4604`*
- **[optional] Email address** —
  *Example: `Office@fireflycd.com`*
- **[required] Physical office address**:
  - Street:
  - City:
  - State (2-letter):
  - ZIP:
- **[optional] Marketing target city + state** — only fill in if your marketing/SEO city is different from your physical office. Example: office is in `Otis Orchards, WA` but you market to `Spokane, WA` — put `Spokane` + `WA` here.
  - City:
  - State (2-letter):
- **[required] Business hours** — leave blank for closed days:
  - Monday:
  - Tuesday:
  - Wednesday:
  - Thursday:
  - Friday:
  - Saturday:
  - Sunday:
- **[optional] Years in business** —
- **[optional] Google Business Profile rating** (e.g. `4.9`) + **review count** (e.g. `73`)
- **[required] Credentials** (check all that apply): `[ ] Licensed` `[ ] Insured` `[ ] Bonded`
- **[optional] Social URLs** — paste any that apply:
  - Facebook:
  - Instagram:
  - YouTube:
  - Google Maps (business listing):
  - Yelp:

---

## 2. Branding

- **[required] Logo URL** — direct-image URL (transparent PNG preferred). Will be auto-sized.
- **[optional] Brand accent color** — hex (e.g. `#00cfd1`). Leave blank for neutral default.
- **[optional] Fonts** — leave blank for defaults (Fraunces + Inter). If you have a preference, name the Google Fonts.
- **[optional] Hero background photo URL** — a professional exterior/interior/completed-project shot.
- **[optional] Hero background video URL (MP4)** — takes priority over photo. Keep under 5 MB if possible.

---

## 3. About Us

- **[required] About Us story** — 2–3 paragraphs. Answer: who you are, what makes you local, how long you've been doing this, why homeowners trust you.
- **[optional] About Us image URL** — a photo of the shop, team at work, or the logo lockup. Renders right-aligned on desktop.

---

## 4. Team

Repeat this block for each team member you want featured. Max 6 recommended.

- **Name:**
- **Role:**
- **Photo URL:**
- **[optional] Bio** — 1–2 sentences.

---

## 5. Services (max 6)

Repeat this block for each service. Order matters — first entry is the "primary" service.

- **[required] Service name** —
  *Example: `Roofing`*
- **[required] SEO H1** — the search-optimized version of the service name for the hero. Include location.
  *Example: `Roof Replacement & Repair Services in Spokane, WA`*
- **[required] Short description** — 1–2 sentences. Used in meta description and service tile.
- **[required] Long description** — 2–4 sentences. Used on the service page. Include product/brand names, materials, warranty for SEO.
- **[required] Sub-services** — 3–5 bullet points that show under the service page's "About our X services" section as green check marks.
  *Example: `Roof Replacements` / `Roof Repairs` / `Roof Inspections` / `Shingle, Metal, Tile, and Flat Roofs`*
- **[required] Hero photo URL** — a shot representing this specific service.
- **[required] Gallery photos** — 2–3 URLs of completed projects for this service.
- **[optional] Custom "About our" heading** — override the auto `About our {service} services` if it sounds awkward (e.g. plural title). Example for "Kitchen Remodels" → `About our kitchen remodeling services`.
- **[optional] Per-service FAQs** — Q&A pairs specific to this service.

---

## 6. Service Areas (max 5)

Repeat this block for each city/area served. Order matters — first entry is the "primary" area.

- **[required] City name** —
  *Example: `Spokane`*
- **[required] State (2-letter)** —
  *Example: `WA`*
- **[required] Slug** — `city-state` format, all lowercase, hyphens only.
  *Example: `spokane-wa`*
- **[required] Landmark or area photo URL** — recognizable area image (skyline, park, notable building).
- **[optional] Local context** — 1–2 sentences on how long you've served the area, notable projects, or crew presence.
- **[optional] Neighborhoods served** — comma-separated list.

**Reserved slugs to avoid** (these are used by other pages): `about`, `services`, `service-areas`, `contact`, `pricing`, `our-work`, `privacy`, `terms`, `accessibility`, `book`.

---

## 7. Portfolio / Gallery

Site-wide gallery. Renders on the home page under "Craftsmanship that speaks for itself" and per-service on `/our-work`.

Repeat for 6–8 completed projects:

- **Title:**
- **Location:** (city, state)
- **Photo URL:**
- **Alt text:**
- **[optional] Short description**

---

## 8. Why Choose Us (4–5 tiles)

Repeat per tile:

- **Icon URL** (transparent PNG preferred) OR an emoji as fallback
- **Title** —
  *Example: `Licensed, Insured & Bonded`*
- **Description** — 1–2 sentences

---

## 9. Us vs Them (optional)

Leave blank to hide this section entirely.

- **Enable?** `[ ] Yes` `[ ] No`
- **Headline** —
  *Example: `Why Firefly & not the other guys`*
- **"US" column photo URL** (a nice completed project)
- **"THEM" column photo URL** (a bad-work example)
- **Rows** — attribute + check/X per column, 4–6 rows:
  - Row 1: `Personalized Design` | US: `[ ]✅ [ ]❌` | THEM: `[ ]✅ [ ]❌`
  - Row 2: ...
  - Row 3: ...

---

## 10. Financing (optional)

Leave blank to hide.

- **Enable?** `[ ] Yes` `[ ] No`
- **Headline:**
- **Description:**
- **CTA text:**
- **CTA link:**
- **Financing partner logo URL:**

---

## 11. Partner Badges (optional)

Leave blank to hide. Badges appear as a horizontal logo strip.

Repeat per partner:

- **Name:** (e.g. BBB, Angi, GAF)
- **Logo URL:**
- **Link URL** (optional — where it opens when clicked)

---

## 12. GHL / CRM Widgets (paste-only)

Paste the FULL HTML/script snippet exactly as GHL gives it. Do NOT rewrite or shorten.

- **[required for booking] Calendar embed snippet** — the `<iframe>` + `<script>` block from GHL's calendar widget code. Used on the hero and the `/book` page.
- **[optional] Chat widget snippet** — the `<script>` tag from GHL's chat widget.
- **[optional] Reviews widget snippet** — the `<script>` + `<iframe>` from GHL's reputation review widget.
- **[optional] Contact form embed snippet** — the `<iframe>` + `<script>` block for the general contact form. Used on `/contact`.
- **[optional] Estimate form embed URL** — just the iframe `src` URL (for shorter service-page forms if you want a different form than the calendar).
- **[optional] Call-tracking script snippet** — GHL number-swap script if you use one.
- **[optional] Call-tracking display number** — the number shown to visitors if number-swap is active.

---

## 13. Code Injection (paste-only)

For pixels, analytics, third-party tracking. Site-wide by default; per-page overrides are supported but rarely needed.

- **[optional] `<head>` injection** — Meta Pixel base code, Google Tag Manager, Google Ads gtag, meta verification tags, etc.
- **[optional] `<body>` start injection** — GTM noscript fallback, etc.
- **[optional] `<body>` end injection** — chat widgets not covered above, custom scripts, analytics beacons.
- **Per-page overrides needed?** Rare. If yes, specify which page path + which slot.

---

## 14. Pricing Page (optional)

Leave blank to keep the default sparse pricing page.

- **Pricing intro paragraph** — one paragraph on your pricing philosophy.
- **Packages** (optional — leave blank for a single "Get an estimate" pattern):
  - Repeat per package: Name / Price / Unit (e.g. "starting") / Features (bullet list) / CTA text / CTA link.

---

## 15. Legal & Compliance

Defaults are on for ADA / GDPR / A2P. Only fill in overrides:

- **Governing law state** — usually matches your legal address state.
- **Special SMS/A2P consent language** — leave blank for the standard `Reply STOP to opt out` boilerplate.

---

## 16. Domain

- **[optional] Custom domain** — the domain you'll attach to Vercel. If blank, we deploy to `<slug>.vercel.app`.

---

## Delivery

Once you've filled this in, hand it back to the AI Website Builder operator along with:

- Direct URLs (not Google Drive links) for every photo, logo, and video field.
- All GHL widget snippets pasted **exactly** as provided by GoHighLevel — don't reformat.
- Any Meta Pixel / GTM / analytics IDs already generated on your accounts.

Estimated turnaround: ~1 hour from filled intake → live Vercel URL.
