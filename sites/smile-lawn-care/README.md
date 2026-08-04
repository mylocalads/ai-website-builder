# Smile Lawn Care — site notes

> **Read this before touching `src/styles/tokens.css` or any `--color-primary`
> section.** This build inverts the owl template's core colour assumption.

In every other owl site `--color-primary` is a **dark** panel colour carrying
white text. Per this client's brief the yellow secondary background `#f5cf39` is
the "main colour focus", so here `--color-primary` is **light**:

| token | value | note |
|---|---|---|
| `--color-bg` | `#ffffff` | client-supplied primary background |
| `--color-primary` | `#f5cf39` | client-supplied secondary background — header + all primary bands |
| `--color-on-primary` | `#1a1a1a` | 11.49:1. White on the yellow is 1.51:1 and unusable |
| `--color-accent` | `#79a832` | client-supplied CTA. **Fill only — never a text colour** (2.81:1 on white, 1.86:1 on yellow) |
| `--color-on-accent` | `#1a1a1a` | 6.18:1 |
| `--color-accent-ink` | `#35591f` | the accent as *text*. 8.08:1 on bg, 7.53:1 on surface, 5.33:1 on the yellow |
| `--color-accent-edge` | `#2f4a17` | dark border for accent buttons on a yellow band (green-on-yellow is 1.86:1, under the 3:1 WCAG 1.4.11 floor) |

Consequences already handled in the components — preserve them:

- **Tile washes on primary-backed sections are BLACK at low alpha**, not white.
  `ProcessSteps`, `WhyChooseUs` and `Testimonials` use `rgba(0,0,0,0.04–0.16)`.
  A white overlay is invisible on yellow.
- **Every foreground use of the green is `--color-accent-ink`.** Eyebrows, step
  labels, stars, tile counters. `--color-accent` stays for fills only.
- **`ClosingCTA` has a `.has-photo` branch** that flips text back to white,
  because the photo variant paints a dark scrim where near-black is unreadable.
  No call site passes a photo today; the branch exists so the prop is not a trap.
- **The header is `--color-primary`**, with a near-white phone badge (a
  translucent green wash disappears into the yellow).

Verified on the live dev build: 0 contrast failures across 179 text elements
outside the photo-scrim regions (hero and service tiles, which paint white on a
dark scrim and were checked visually).

Other build-specific notes:

- **Caps raised.** Services 5 → 7 and service areas 6 → 18, per the operator's
  explicit list. `getStaticPaths` in both dynamic routes is uncapped, and the
  areas dropdown is two-column (`.submenu.two-col`) so 18 towns fit on screen.
- **`crm.form_action_url` is unset**, so `EstimateForm` posts to the built-in
  `/api/estimate`. Its `SERVICES` list **must** stay byte-identical to the one in
  `src/components/EstimateForm.astro` or every submission 400s as `?error=service`.
- **No `email` in the site config on purpose.** `Contact@SmileLawns.com` is on a
  domain with no A or MX record, so it would bounce. Add it back only with a live
  mailbox.
- **Calendar and contact form are placeholder images** per the brief, held in
  `crm.calendar_embed_snippet` / `crm.contact_form_snippet`. Swap those two
  strings for the real GHL embeds.

## Imagery rules for this site

Six real client photos exist, hotlinked from the GHL/filesafe CDN. Everything
below follows from that scarcity — read before adding images.

- **A service's `about_photo` must differ from its `hero_photo`.** Both fields
  exist for this reason; the page used to pass `hero_photo` to both and render
  the same image twice. Two services (Pressure Washing, Snow & Ice Removal) have
  no second photo and render a **text-only About on purpose** — do not "fix" that
  by pointing `about_photo` back at the hero.
- **`about_photo_alt` describes the image**, not the service. The fallback is a
  templated `"{title} — {business}"` label, which is worse than nothing.
- **Area `landmark_photo` values are Wikimedia Commons images, sourced by
  category, and every one is place-verified.** Full-text search is unreliable
  here — it returns Hudson Yards NYC for Hudson PA and Pringle Bay, South Africa
  for Pringle. If you add a town, use `Category:<Town>, Pennsylvania` and read the
  file's description before trusting it.
- **Hudson, Hilldale and Shavertown use township images, captioned as such.**
  They are unincorporated villages with no Commons category of their own. The alt
  text says which township — keep it that way rather than implying a landmark the
  village does not have.
- **`landmark_credit` is mandatory for CC BY / CC BY-SA.** CC0 and public-domain
  entries are credited too, by convention.
- **Area `gallery` arrays are intentionally empty.** The heading is `"{Area} work"`,
  so putting a stock or non-local photo there would claim the job was done in that
  town. Populate only with photos genuinely taken there.
- **Still needed:** a real pressure-washing job photo. Commons has no usable
  residential one.

---

# MLA Astro Template — Owl

Reusable Astro scaffold cloned per client by the site-generate skill (`--template owl`).
Do not edit content collections or `src/styles/tokens.css` here — those are populated per site.
Structural changes (layouts, components, page templates, schema plumbing) go here.

Modeled on the structure of owlroofing.com. The **structure** is the reference —
their copy and their branded program names ("We Give A Hoot", "Protect Your Nest
System", "Get It Right Guarantee") are Owl Roofing's own brand assets and must
never appear in a generated site. Every section here is content-driven so each
client supplies its own naming.

## Fixed home section order

hero → promise-bar → services-grid → testimonials → promise-band →
signature-system → process-steps → about → seo-body → faq → blog-cards →
closing-cta → footer

This order is fixed. Do not randomize or reorder it per client.

Sections whose content key is absent from `src/content/site/home.json` render
nothing at all — no empty heading, no orphan eyebrow. A client without a
signature program simply omits `signature_system`.

## Differences from the firefly template

- Service areas are nested at `/service-area/{city-st}`, not at the flat root.
  Because the route is nested, city slugs cannot collide with top-level routes,
  so the reserved-slug blocklist is just `index`.
- A `blog` collection with `/blog` and `/blog/{slug}` routes exists, plus a
  recent-articles row on the home page.
- Tokens add `--color-primary`, `--color-on-primary`, `--color-on-accent`, and
  `--radius-lg`.
- `Hero`, `OurServices`, `CTA`, and `UsVsThem` are gone, replaced by `HeroOwl`,
  `ServicesGridOwl`, and `ClosingCTA`. Owl's section order has no us-vs-them.

## Button contrast — read before changing the accent

Button label color MUST come from `--color-on-accent`. Never hardcode `white`.

Every accent-backed label in this template is **1.25rem (20px) at weight 700**.
That is deliberate: WCAG's large-text threshold is 18.66px bold, and at 20px a
3:1 ratio is sufficient instead of 4.5:1. Dropping any accent-backed label below
1.25rem re-imposes the 4.5:1 requirement and will break light accents. If you
shrink a button, re-run the contrast check at the stricter threshold.

White on this template's default gold (`#c8973f`) measures 2.64:1 and fails even
large-text AA, which is why the default label is near-black at 6.51:1. A client
with a darker accent will set it to white instead. Hardcoding the label color in
a component silently breaks contrast for every client whose accent is light.

Verify after any token change:

```bash
node -e '
const fs=require("fs");const css=fs.readFileSync("src/styles/tokens.css","utf8");
const tok=(n)=>{const m=css.match(new RegExp("--color-"+n+":\\s*(#[0-9a-fA-F]{6})"));if(!m)throw new Error(n);return m[1];};
const lum=(h)=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];};
const r=(a,b)=>{const[x,y]=[lum(a),lum(b)].sort((m,n)=>n-m);return (x+0.05)/(y+0.05);};
for(const[l,f,b]of[["text/bg","text","bg"],["muted/bg","muted","bg"],["on-primary/primary","on-primary","primary"],["on-accent/accent","on-accent","accent"]])
console.log((r(tok(f),tok(b))>=4.5?"PASS":"FAIL"),l,r(tok(f),tok(b)).toFixed(2));'
```

## The hero aside column

`HeroOwl` renders exactly one thing in its right-hand column, in priority order:

1. `calendar_embed_snippet` from the site CRM config, when the page passes `form_embed_url`
2. `GHLFormEmbed`, when the page passes `form_embed_url`
3. the `quote_card` from home content, when it does not

Service and area pages pass `form_embed_url`; the home page passes `quote_card`.

## A2P / SMS consent

The template renders **no** SMS consent language of its own. Consent is collected
inside the embedded GHL form or calendar, which is where the phone number is
actually captured — so that is where the disclosure belongs.

The `compliance.a2p` flag still exists in the site config schema, but nothing in
the template reads it. It is declarative, the same as `compliance.ada`. Only
`compliance.gdpr` gates a component (`CookieConsent` in `BaseLayout`).
