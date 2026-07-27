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
2. `SMSConsent` + `GHLFormEmbed`, when the page passes `form_embed_url`
3. the `quote_card` from home content, when it does not

Service and area pages pass `form_embed_url`; the home page passes `quote_card`.
The A2P consent language rides along with the form — removing the form slot
would strand it, since nothing else on the page renders `SMSConsent`.
