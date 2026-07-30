---
description: Run the full 9-step website builder pipeline for a client business
argument-hint: <business name or URL> [--auto] [--template owl|firefly] [--reference <url>]
---

Run the website builder pipeline for: **$ARGUMENTS**

## Do this, in this order

1. Read `CLAUDE.md` (kit root) — operating rules, cost rules, file conventions.
2. Read `.agent/workflows/website-builder.md` — step ordering, pause behavior, output format.
3. Invoke the `website-builder` skill and run all 9 steps.

## Rules for this run

- **The pipeline is the process.** Its per-step pauses are the only approval gates. Do not
  add a design-approval gate, a spec document, an implementation plan, or a plan-mode
  round-trip. See the "STOP — Read This First" section of `CLAUDE.md`.
- **Do not invoke** `superpowers:brainstorming`, `superpowers:writing-plans`, or
  `EnterPlanMode` for this build.
- **Operator-supplied values are decisions, not openers.** Brand colors, GHL snippets,
  logo, service list, service areas, reference site — if it's in the request, use it. Don't
  re-ask, and don't offer alternatives to it.
- **State cost before every paid step and wait for approval** (per CLAUDE.md cost rules).
  This is the one place stopping is mandatory.
- **`--auto`** in the arguments: skip the per-step pauses. Cost approvals still stop.
- **`--template`**: defaults to `owl` unless the request implies otherwise.
- **`--reference <url>`** or "duplicate/clone <url>": pass to `/design-reference` as a
  primary reference URL. If that URL is a site this kit already built under `sites/`, read
  it from disk instead of scraping — and build from the current
  `astro-templates/{template}/`, not from that site's `src/`, which is a stale snapshot.
  Note any visual drift between the two in the design-reference pause.

## Finish with

The final summary table from `.agent/workflows/website-builder.md`, including the live URL,
page count, and anything still needing operator follow-up. Append the run to
`sites/build-log.md`.
