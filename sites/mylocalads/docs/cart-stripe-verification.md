# Cart — Stripe Test-Mode Verification

**Date:** 2026-07-28
**Mode:** Stripe **test** mode
**Plan:** `docs/superpowers/plans/2026-07-28-mylocalads-addon-cart.md` (Tasks 12–13)

Observed results, not expected results. Every row below was executed against the
live Stripe test API and the created session was retrieved and inspected.

## Price ID mapping

Resolved by querying the Stripe API. All four amounts match the tile prices.

| Add-on | Stripe product | Amount | Type |
|---|---|---|---|
| `crm` | Growth | $97.00 | recurring/month |
| `ai-agents` | AI Employee (Add-On) | $250.00 | recurring/month |
| `website` | Custom Website Unlimited Edits | $300.00 | recurring/month |
| `roof-quote-pro` | Instant Estimator Powered By Roofle® | $500.00 | recurring/month |
| `seo-plan` | **no test price exists** | — | — |

## Checkout session matrix

| Cart | Mode | amount_total | Line items | Result |
|---|---|---|---|---|
| `crm` | subscription | **$0.00** | Growth $0.00 | ✅ trial applied |
| `crm` + `ai-agents` | subscription | **$347.00** | Growth $97.00, AI Employee $250.00 | ✅ no trial |
| `website` (auto-adds `crm`) | subscription | **$397.00** | Website $300.00, Growth $97.00 | ✅ dependency auto-added |
| `roof-quote-pro` | subscription | **$500.00** | Instant Estimator $500.00 | ✅ |
| `seo-plan` | — | — | — | ✅ 503 `stripe_not_configured` fallback |

**The trial rule is proven, not assumed.** The same CRM price ID renders
`$0.00` when it is the whole cart and `$97.00` when bundled with AI Agents.
That is the design decision working: a customer cannot get a free week of a
website build or AI Agents by adding CRM to the cart.

`payment` mode and shipping collection were **not** exercised — the catalog is
now all-recurring (NFC retired, GBP became a recurring SEO Plan). Those code
paths remain unit-tested in `test/checkout-params.test.js` against a fixture.

## Failure paths

| Request | Status | Body |
|---|---|---|
| `{"items":["ghost"]}` | 400 | `{"error":"unknown_item"}` |
| `{"items":[]}` | 400 | `{"error":"unknown_item"}` |
| malformed JSON body | 400 | `{"error":"bad_request"}` |
| `{"items":["seo-plan"]}` (no price configured) | 503 | `{"error":"stripe_not_configured","fallback":true}` |

## Tampering

Posted a payload with client-supplied pricing:

```json
{"items":["crm","ai-agents"],"price":1,"unit_amount":1,
 "line_items":[{"price_data":{"unit_amount":1}}]}
```

Session created charged **$347.00** — the injected fields were ignored entirely.
Prices are re-derived server-side from env vars; only item IDs cross the trust
boundary.

## Secret handling

- `.env` is gitignored and does not appear in `git status`.
- Build output searched for `sk_test`, `sk_live`, and the literal key value:
  **no matches** in `dist/` or `.vercel/output/`.
- The function bundle references `process.env.STRIPE_SECRET_KEY` as a runtime
  lookup, never an inlined value.

## Browser verification

| Check | Result |
|---|---|
| 5 tiles render with checkmark bullets (6/3/4/5/4) | ✅ |
| Buttons ship as product links, upgraded by JS | ✅ |
| Cart bar hidden when empty | ✅ |
| CRM alone → "Free for 7 days, then $97/mo" | ✅ |
| Website → auto-adds CRM, CRM button reads "Added ✓", $397/mo | ✅ |
| + SEO Plan → $647/mo | ✅ |
| Cart page lines, totals, due-today, trial note | ✅ |
| One-time subtotal row hidden (nothing is one-time) | ✅ |
| Badge persists across pages and reloads | ✅ |
| 375px and 320px — no horizontal overflow, header fits | ✅ |

## Unit tests

```
✓ test/cart-core.test.js       (21 tests)
✓ test/checkout-params.test.js (14 tests)
✓ test/addOns.test.js          (10 tests)
  45 passed
```

## Not yet verified

1. **SEO Plan end-to-end** — no test-mode price ID exists. Currently returns the
   fallback. Needs a `$250/mo` recurring price created in Stripe.
2. **Live mode** — all IDs above are test mode. Live price IDs differ and must be
   set separately in Vercel.
3. **A real completed payment** — sessions were created and inspected, but no
   checkout was carried through with card `4242 4242 4242 4242`, so the
   post-payment redirect to `/checkout-success` and the cart-clearing behavior
   are untested against a real Stripe redirect.
