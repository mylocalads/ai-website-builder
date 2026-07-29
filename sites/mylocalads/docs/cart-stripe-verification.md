# Cart — Stripe Verification

**Last verified:** 2026-07-29 against **live** Stripe
**Plan:** `docs/superpowers/plans/2026-07-28-mylocalads-addon-cart.md`

Observed results, not expected results. Sessions were created against the live
API and the hosted checkout pages were read to confirm actual amounts. **No
payment was completed** — creating and viewing a session charges nothing.

## Catalog

| Cart id | Plan label | Title | Price | Billing | Requires |
|---|---|---|---|---|---|
| `crm` | CRM Plan | My Local Ads CRM | $97/mo | recurring, 7-day trial | — |
| `ai-agents` | Conversion Plan | CRM AI Voice + AI Chat | $250/mo | recurring | `crm` |
| `seo-plan` | SEO Plan | Google Business Profile Management | $250/mo | recurring | — |
| `website` | Website Plan | Unlimited Changes | $300/mo | recurring | `crm` |
| `ppl-ads-3mo` / `-6mo` / `-12mo` | Ads Plan | Pay-Per-Lead Ads Setup | $2,500 one-time (list $5,000) | one-time | — |

The three Ads Plan entries are one Stripe product (`STRIPE_PRICE_ADS_SETUP`)
offered at three commitment terms. They share `group: 'ppl-ads'`, so adding one
displaces the others — the cart can never hold two.

Roof Quote PRO was removed: no price ID exists and it is not in the current
catalog.

## Live amount verification

Cart: all four monthly plans + Ads Plan 6-month.

Stripe's hosted page showed:

```
Pay My Local Ads LLC
$3,397.00
Then $897.00 per month
Add code
```

Reconciles exactly against the tiles:

| | Amount |
|---|---|
| CRM | $97 |
| Conversion Plan | $250 |
| SEO Plan | $250 |
| Website Plan | $300 |
| **Monthly** | **$897** ✅ matches "Then $897.00 per month" |
| Ads Plan setup (one-time) | $2,500 |
| **Due today** | **$3,397** ✅ matches "$3,397.00" |

This confirms the Ads Plan Stripe price is **$2,500**, not the $5,000 list price,
and that all four monthly prices are as displayed. The cart bar's
"$897/mo + $2,500 once" and the cart page's "Due today $3,397" both agree with
Stripe.

"Add code" confirms `allow_promotion_codes: true` — a promo code can still be
applied on top of the 50%-off setup price.

## Trial verification (live)

Cart: `crm` alone. Stripe's hosted page showed:

```
Try CRM Plan - LeadConnector
7 days free
Then $97.00 per month starting August 5, 2026
Includes 7-day free trial if purchased by itself.
```

August 5 is 7 days from the verification date. Note the product description in
Stripe says **"if purchased by itself"** — the same rule the code enforces.

Earlier test-mode runs proved the inverse: the same CRM price renders $0.00 alone
and $97.00 when bundled, so the trial is dropped whenever CRM is combined.

## Session matrix (live, all created successfully)

| Cart | Result |
|---|---|
| `crm` | ✅ subscription, 7-day trial, $0 today |
| `ai-agents` + `crm` | ✅ session created |
| `seo-plan` | ✅ session created |
| `website` + `crm` | ✅ session created |
| `ppl-ads-6mo` | ✅ session created |
| all five | ✅ $3,397 today, then $897/mo |

## Failure paths (verified test mode)

| Request | Status | Body |
|---|---|---|
| unknown item id | 400 | `{"error":"unknown_item"}` |
| empty cart | 400 | `{"error":"unknown_item"}` |
| malformed JSON | 400 | `{"error":"bad_request"}` |
| price not configured | 503 | `{"error":"stripe_not_configured","fallback":true}` |

## Tampering

A payload carrying `unit_amount: 1` and a fabricated `price_data` still produced
the correct charge. Prices are re-derived server-side from env vars; only item
ids cross the trust boundary.

## Secret handling

- `.env` is gitignored; no env file is tracked.
- Build output searched for `sk_test`, `sk_live`, and literal key values: no
  matches in `dist/` or `.vercel/output/`.
- The function bundle references `process.env.STRIPE_SECRET_KEY` as a runtime
  lookup, never an inlined value.
- `STRIPE_SECRET_KEY` and `STRIPE_TEST_KEY` are marked Sensitive in Vercel, so
  their values cannot be read back — `vercel env pull` returns `[SENSITIVE]`.

## Browser verification

| Check | Result |
|---|---|
| 4 add-on tiles, bullets 6/8/7/7 | ✅ |
| Plan-label kicker above each title | ✅ |
| 3 PPL tiles with "Ads Plan" kicker | ✅ |
| "Channels we run ads on:" label above Meta/Google | ✅ |
| PPL setup fee $5,000 struck through → $2,500 | ✅ |
| Two cart bars stay synced | ✅ |
| Commit terms mutually exclusive (12-mo displaces 3-mo) | ✅ |
| Website auto-adds CRM | ✅ |
| Mixed cart reads "$897/mo + $2,500 once" | ✅ |
| 375px and 320px — no horizontal overflow | ✅ |

## Unit tests

```
✓ test/cart-core.test.js       (26 tests)
✓ test/checkout-params.test.js (16 tests)
✓ test/addOns.test.js          (14 tests)
  56 passed
```

## Not yet verified

**No payment has been completed.** Sessions were created and their amounts read,
but no card was run, so the post-payment redirect to `/checkout-success` and the
cart-clearing behaviour remain untested against a real Stripe redirect. Verifying
this requires either a live purchase or test-mode price IDs (the current price
IDs are live-only and do not exist in test mode).
