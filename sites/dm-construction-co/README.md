# MLA Astro Template — Owl

Reusable Astro scaffold cloned per client by the site-generate skill (`--template owl`).
Do not edit content collections or `src/styles/tokens.css` here — those are populated per site.
Structural changes (layouts, components, page templates, schema plumbing) go here.

**Only the structure is reusable. Never the words.**

This layout was derived by studying a third-party site. Section order, component
shape and page composition are generic craft and are reused freely. Copy,
taglines, and above all **branded program names** — the named "system",
"guarantee" or "promise" blocks — belong to whoever coined them, and reproducing
one in a client's site puts another company's trademark on a page that client
pays for.

Every section here is content-driven for exactly that reason: each block reads
its naming from the client's own content collection, and ships with no default
copy to fall back on. **If you find yourself writing a default string into a
component, stop** — a template default is how borrowed copy reaches a live site
without anyone deciding to put it there. `sites/build-log.md` records that
happening twice before it was caught.

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

## No vertical-specific copy in this template

This scaffold is cloned for roofers, HVAC/MEP contractors, landscapers, pool
builders and remodelers. A default that names one trade ships that trade's
vocabulary to every other client — and the failure is silent, because a roofing
sentence on an HVAC site still builds and still renders.

So the template holds no trade nouns and no client facts. Anything that names
the work, or asserts a guarantee, a founding year or a service area, is content:

| What | Where the client supplies it | Fallback when unset |
| --- | --- | --- |
| Estimate-form heading | `config.estimate_form.heading` | `Get Your Free Estimate Today!` |
| Estimate-form service options | `config.estimate_form.services` | generic Repair / Installation / … list |
| Closing-CTA band | `config.closing_cta.{headline,body,cta_text,cta_href}` | neutral headline + button, **no body** |
| Blog section name + `/blog` description | `config.blog_section.{heading,description}` | `Advice & Insights` |
| Services-grid heading | `config.services_section.heading_lead` + `heading_rest` | `What we do` |
| `/pricing` cost table | `pricing.cost_table` | section does not render |

Two of those fallbacks are deliberately empty rather than generic. The
closing-CTA **body** and the pricing **cost table** are where a guarantee and a
rate card get asserted — inherit either and the site makes a promise on behalf
of a business that never made it. Rendering nothing is the correct default.

### The estimate form's service list is shared code

`src/lib/services.ts` owns the list. `components/EstimateForm.astro` renders it
as the `<select>` options and `pages/api/estimate.ts` uses it as a server-side
allowlist, and both import it from there. Do not re-introduce a second copy: the
endpoint rejects any `service` value not in its set, so a form offering an
option the endpoint has not been told about drops every lead that picks it —
with no build error and nothing in a log the operator reads.

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

### Three accent tokens, one per job

The brand accent does three different things and one hex value rarely does all
three well, so each job has its own token. All three are re-derived per client:

- `--color-accent` — **fill** behind `--color-on-accent`: buttons, icon circles,
  social tiles. Never body text.
- `--color-accent-ink` — the accent as **text on a light background**: eyebrows,
  tick marks, quote-card stars, "Keep Reading" links. Needs 4.5:1 on
  `--color-bg` / `--color-surface`.
- `--color-accent-on-dark` — the accent as **text inside the dark
  `--color-primary` bands** (Testimonials, ProcessSteps, WhyChooseUs) and over
  the hero scrim. Needs 4.5:1 on `--color-primary`.

Even the default gold needs the third token: as a fill it is fine, but on the
dark band it measures 3.78:1 — under AA for the 0.75–0.95rem eyebrows, step
labels and star rows there — so accent-on-dark is a lighter tint of the same
gold at 5.03:1. For many brands the two sides cannot be reconciled at all. A
dark saturated red is the standard case: 6.6:1 on white makes it a correct button
fill, but it is 2.4:1 on a navy band, and any red light enough to pass on the
navy is too light to carry white button text. That client sets
`--color-accent-on-dark` to a lighter tint and leaves the fill alone — the fix
belongs in `tokens.css`, not in an `!important` block overriding component CSS.

Verify after any token change:

```bash
node -e '
const fs=require("fs");const css=fs.readFileSync("src/styles/tokens.css","utf8");
const tok=(n)=>{const m=css.match(new RegExp("--color-"+n+":\\s*(#[0-9a-fA-F]{6})"));if(!m)throw new Error(n);return m[1];};
const lum=(h)=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];};
const r=(a,b)=>{const[x,y]=[lum(a),lum(b)].sort((m,n)=>n-m);return (x+0.05)/(y+0.05);};
for(const[l,f,b]of[["text/bg","text","bg"],["muted/bg","muted","bg"],["on-primary/primary","on-primary","primary"],["on-accent/accent","on-accent","accent"],["accent-ink/bg","accent-ink","bg"],["accent-ink/surface","accent-ink","surface"],["accent-on-dark/primary","accent-on-dark","primary"]])
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
