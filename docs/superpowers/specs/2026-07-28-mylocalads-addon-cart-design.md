# Growth Add-Ons Cart — Design

**Date:** 2026-07-28
**Site:** `sites/mylocalads/` (bespoke Astro project)
**Status:** Approved

## Goal

Turn the Growth Add-Ons section on the mylocalads homepage into a shopping
experience: each tile lists what the service includes with checkmark bullets and
an "Add to cart" button, a cart summary appears below the tile grid, and checkout
runs through Stripe.

The reference the user supplied is a *behavioral* reference only. None of its
visual design is copied — the tiles keep the site's existing tokens (black bg,
yellow CTAs, blue accents, Poppins/Inter) and reuse the `.check` class already
defined in `index.astro`.

## Decisions

| Question | Decision |
|---|---|
| Checkout mechanism | Stripe **Checkout Sessions** via a serverless API route. Payment Links cannot express a multi-item cart. |
| Cart scope | All six add-ons purchasable at fixed prices. |
| Prerequisites | Adding AI Agents or Website **auto-adds CRM** with an explanatory note. |
| Cart persistence | Site-wide: header badge + `/cart` page + bar below the add-on grid. |
| CRM trial | Applies **only when the cart is exactly `['crm']`**. Any other combination bills immediately. |
| Bullet sourcing | From the client's own product pages. NFC Cards bullets are drafted and pending review. |

### Why the trial rule

`trial_period_days` in Stripe Checkout sits on `subscription_data` and applies to
the **entire subscription**, not a single line item. One-time line items are
"only included on the initial invoice" — which a trial defers to trial end.

So a trial on a mixed cart would give away 7 days of AI Agents, a website build,
and defer the $500 GBP charge to day 8. Restricting the trial to a solo CRM cart
avoids delivering paid work before any payment clears.

## Architecture

The site is `output: 'static'`. Astro 5 with the Vercel adapter renders a single
route on demand via `export const prerender = false`, so the existing 18 pages
stay static and only `/api/checkout` becomes a serverless function.

### New files

| File | Purpose |
|---|---|
| `src/data/addOns.js` | Single source of truth for all six add-ons (mirrors `caseStudies.js`) |
| `src/lib/cart.js` | Client cart: add/remove, dependency resolution, totals, `localStorage` |
| `src/components/AddOnCard.astro` | Tile: bullets + Add to cart |
| `src/components/CartBar.astro` | Summary bar below the add-on grid |
| `src/components/CartButton.astro` | Header badge with item count |
| `src/pages/cart.astro` | Cart review page |
| `src/pages/api/checkout.js` | Serverless Checkout Session builder |
| `src/pages/checkout-success.astro` | Post-payment landing; clears the cart |

### Modified files

- `src/pages/index.astro` — replace the `addOns` array and `.addon-grid` markup
- `src/components/Header.astro` — cart badge in desktop and mobile nav
- `package.json` — add `stripe`

### Data model

```js
{
  id: 'website',
  title: 'Website',
  subtitle: '...',
  priceCents: 30000,
  priceLabel: '$300/mo',
  priceNote: 'Requires active CRM account.',
  billing: 'recurring',        // 'recurring' | 'one_time'
  trialDays: null,             // 7 for CRM only
  stripePriceId: 'price_...',  // server-only, never emitted to the DOM
  requires: ['crm'],
  shipping: false,             // true for NFC
  includes: ['...'],           // checkmark bullets
  fallbackHref: 'https://start.mylocalads.co/all-in-one-website',
}
```

`stripePriceId` is consumed only inside `/api/checkout`. Tiles are server-rendered,
so it never reaches the browser and never appears in a data attribute.

## Add-on content

Prices confirmed by the user. Bullets sourced from the client's product pages
except where noted.

| id | Title | Price | Billing | Requires | Bullets |
|---|---|---|---|---|---|
| `crm` | CRM | $97/mo | recurring, 7-day trial | — | 6 of the 11 features on `/growth` |
| `ai-agents` | AI Agents | $250/mo | recurring | `crm` | 3 verified (page is thin) |
| `gbp` | Google Business Profile Optimization | $500 | one-time | — | 4, verbatim from `/gbp` |
| `website` | Website | $300/mo | recurring | `crm` | 5, from `/all-in-one-website` |
| `roof-quote-pro` | Roof Quote PRO™ Instant Estimator | $500/mo | recurring | — | 4 verified; roofers only |
| `nfc-cards` | NFC Review Cards (10-pack) | $150 | one-time, ships | — | **Drafted — pending client review** |

Note: `/all-in-one-website` currently advertises $5,000 one-time. The user
confirmed pricing is changing to $300/mo. The product page should be updated to
match, or the site will contradict itself.

## Cart behavior

State lives in `localStorage` under `mla_cart_v1` as an array of add-on IDs. The
module emits a change event; the header badge, tile buttons, and cart bar all
subscribe, so every surface stays in sync.

- `add('website')` also adds `crm`, flagged as auto-added
- `remove('crm')` while dependents are present prompts, then removes dependents
- On load, unknown IDs are dropped (guards against stale carts after a data change)
- Quantity is fixed at 1 per item in v1

### Two subtotals, not one

The cart mixes recurring and one-time items, so a single total would misstate
what the customer owes. The bar and cart page display **"$X/mo + $Y once"** and
state what is due today.

## Checkout flow

1. Client POSTs `{ items: ['crm', 'website'] }` — IDs only, never prices
2. Server validates every ID against `addOns.js`; unknown IDs → 400
3. Server computes:
   - `mode`: `subscription` if any item is recurring, else `payment`
   - `subscription_data.trial_period_days = 7` only when items is exactly `['crm']`
   - `shipping_address_collection` when any item has `shipping: true`
   - `success_url`: `/checkout-success?session_id={CHECKOUT_SESSION_ID}`
   - `cancel_url`: `/cart`
4. Server returns `{ url }`; client redirects
5. Success page clears the cart

## Progressive enhancement

Each tile's control ships in the HTML as `<a href={fallbackHref}>` pointing at the
add-on's existing `start.mylocalads.co` page. JS upgrades it into a cart button on
load. A customer who clicks before hydration, or with JS blocked, still reaches a
working purchase page.

## Failure modes

| Failure | Behavior |
|---|---|
| `STRIPE_SECRET_KEY` unset | API returns 503; client falls back to per-item product links |
| Unknown / stale item ID | 400; client drops the entry and re-renders |
| Stripe API error | 502; user sees "Couldn't start checkout" plus phone number and booking link — never a raw error |
| JS disabled | Tiles and bullets render; buttons are ordinary links |

## Testing

Stripe **test mode** keys, card `4242 4242 4242 4242`. Verify:

- CRM alone → subscription, 7-day trial, $0 due today
- CRM + AI Agents → subscription, **no** trial, both bill immediately
- GBP alone → payment mode
- NFC alone → payment mode with shipping address collection
- Website → auto-adds CRM; subscription mode
- Full cart → subscription mode with one-time items on the first invoice
- Tampering: POST an unknown ID → rejected; POST a `price` field → ignored
- Build: 18 pages remain static, only `/api/checkout` is a function

## Blockers on the client

Checkout cannot function live until:

1. `STRIPE_SECRET_KEY` is set in the Vercel project (a credential — the user must
   set this; Claude must not handle it)
2. The six `price_...` IDs are supplied
3. NFC bullets are reviewed

Until then everything ships in fallback mode: tiles, bullets, and cart UI all
work, and buttons behave exactly as they do today.

## Out of scope

- Quantities above 1 (e.g. multiple NFC packs)
- Coupon / promo codes
- Selling add-ons from pages other than the homepage and `/cart`
- Changing the Pay-Per-Lead pricing tiles
