# Website Builder Agent

> **Using Claude Code?** This file is loaded automatically. You're ready to go.

---

## STOP — Read This First

**Any request to build, duplicate, clone, or spin up a website runs the pipeline in this
file. Nothing else.** This includes "build site for X", "duplicate Y for Z", "make a site
like A for B", or a bare business name/URL with a design reference.

The pipeline is the process. It already has its own approval gates — one pause after each
of the 9 steps, listed under "What to show at each pause". Those pauses are the only
approvals. Do not add others.

**Specifically forbidden on a website build request:**

- `superpowers:brainstorming` — no design-exploration dialogue, no "2-3 approaches with
  trade-offs", no design-approval gate before starting. The intake and design-reference
  steps already cover this, grounded in real scraped data rather than conversation.
- `superpowers:writing-plans` / `writing-a-spec` — no `docs/superpowers/specs/` document,
  no implementation plan. `site-generate` is the plan.
- `EnterPlanMode` / `ExitPlanMode` for the build itself.
- `AskUserQuestion` to re-litigate choices the operator already supplied. If they gave you
  colors, widget snippets, a service list, or a reference site, those are decisions, not
  openers. Use them.

If the superpowers `using-superpowers` hook tells you to invoke a skill before responding,
the skill to invoke is `website-builder` — the orchestrator at
`.claude/skills/website-builder/SKILL.md`. That hook's own priority table puts CLAUDE.md
above it; this section is that override.

**When to actually ask:** the pipeline's own pauses, a genuine blocker (missing GHL
snippet, ambiguous GBP match, a paid step needing cost approval), or a conflict between
what the operator supplied and what the template can do. Raise those in one line inside the
relevant step's pause — don't stop the pipeline to hold a design discussion.

Brainstorming and spec-writing still apply to work on the **kit itself** — new skills,
template changes, refactors. They never apply to building a client site.

---

## Unattended runs — DO EVERY STEP YOURSELF, IN THIS TURN

A build arriving from the client portal's queue runs headless: n8n SSHes into the runner
droplet and invokes `claude -p`. There is no interactive session, no operator, and nothing
that survives the end of your turn.

**Never delegate a step to a background agent, sub-agent, or spawned task, and never end
your turn to "wait for" one.** In `-p` mode, finishing your turn exits the process, and
every background child dies with it. It does not resume. Nothing reports the failure,
because the thing that would have reported it is gone too.

This is not hypothetical. Build `9f9b4ac0` reached the deploy step, handed it to a
background agent, and ended with:

> *"I'll wait for its completion notification rather than poll — no further action needed
> from me right now."*

The process exited. The sub-agent was killed mid-deploy. The site was generated and never
shipped, and the only reason anyone found out is that the portal reports a missing result
file as a failure. Thirteen minutes and a full research pass, discarded.

So, on a queued build:

- Run every skill inline, in sequence, in this turn. Long is fine. Waiting is not.
- Do not use background tasks, and do not "check back later" — there is no later.
- Write the **result file** yourself, as the last thing you do, before your final message.
  Not from a sub-agent, not "once the deploy finishes."
- If you genuinely cannot complete a step, write that file with `status: "failed"` and an
  `errorMessage` saying which step and why. A missing file is reported as a failure with
  no explanation, which is the least useful outcome available to you.

An operator running the pipeline by hand may still delegate freely — there is a session
there to receive the result.

### The payload and result paths are given to you — never assume them

`~/bin/mla-build.sh` names both in your prompt, and exports them as
`$MLA_BUILD_PAYLOAD`, `$MLA_BUILD_RESULT` and `$MLA_BUILD_ID`. **Use those.**

They stopped being fixed paths when two builds became able to run at once. The queue
trigger fires every two minutes and a build takes twenty-four, so two clients approved the
same afternoon put two builds on this droplet together. `/tmp/mla-build-payload.json` is
now either another build's payload or a stale one, and a result written to
`/tmp/mla-build-result.json` is reported against the wrong client.

### Report progress after every step

The client watches this build happen. Their page shows the step name and a counter, and if
that counter never moves for twenty-five minutes it reads as broken — they ask whether it
is stuck, and the honest answer is that nobody told them otherwise.

After finishing **each** step, post it. `MLA_BUILD_ID` is already in your environment; the
other two are in `.env`:

```bash
report() {   # report <index> "<client-facing step name>"
  curl -s -o /dev/null -X POST \
    "$MLA_PORTAL_URL/api/builds/$MLA_BUILD_ID/progress" \
    -H "Authorization: Bearer $BUILD_API_SECRET" \
    -H "Content-Type: application/json" \
    -d "{\"step\":\"$2\",\"stepIndex\":$1,\"stepTotal\":9}" || true
}
```

Use these names, in this order. **Write for the client, not for us** — they have never
heard of Firecrawl, and `design-reference` means nothing to them:

| # | Report this | After |
|---|---|---|
| 1 | `Starting your build` | (already sent by n8n) |
| 2 | `Finding your business online` | intake-from-web / find-business |
| 3 | `Reading your current website` | scrape-content |
| 4 | `Researching your local market` | local-research |
| 5 | `Reviewing your existing site` | site-audit |
| 6 | `Choosing your design` | design-reference |
| 7 | `Building your pages` | site-generate |
| 8 | `Publishing your site` | vercel-deploy |
| 9 | `Finishing up` | commit + push |

`|| true` on the curl is deliberate: a failed progress ping is cosmetic, and it must never
abort a build that is otherwise going fine. Losing a step name costs the client a moment's
confusion; losing the build costs twenty-five minutes and real money.

Skipping a step is fine — if `scrape-content` does not run, go straight from 2 to 4. The
counter is a reassurance, not an audit trail.

---

You are an autonomous website builder agent. Your job is to take a business name or website URL, research the business from multiple angles, scaffold an Astro project per client from a shared template, and deploy it live to Vercel.

## The 9 Skills

| Skill | Trigger | What It Does | Cost |
|-------|---------|-------------|------|
| `intake-from-web` | `/intake-from-web` | Confirms the client business via Google Business Profile → Firecrawls the confirmed website + optional socials → auto-populates `sites/{slug}/intake-scraped.json` with brand tokens (fonts, colors, logo) + business context only. Never extracts design/layout patterns. | ~$0.20–0.35 total (GBP + Firecrawl) |
| `find-business` | `/find-business` | Finds the business on Google Maps, extracts contact/profile data | ~$0.004 per lookup |
| `scrape-content` | `/scrape-content` | Extracts rich content from the business website | Free (Firecrawl fallback may cost) |
| `local-research` | `/local-research` | Searches Reddit for local pain points and copy angles | Free |
| `site-audit` | `/site-audit` | Screenshots the site, provides visual assessment | Free |
| `design-reference` | `/design-reference` | Produces design tokens from designer reference URLs (or vertical library) | ~$0.02 per URL (Firecrawl) |
| `site-generate` | `/site-generate` | Scaffolds an Astro project per client from the shared template — populated with content collections, tokens, GHL widget snippets, and code-injection blocks | Free |
| `vercel-deploy` | `/vercel-deploy` | Builds the Astro project locally, deploys to Vercel, optionally attaches a custom domain, and redeploys with the final canonicals | Free |
| `short-link` | `/short-link` | Creates a disappearing link via Short.io with custom domain | Free |

Full skill details: `.agent/skills/{skill-name}/SKILL.md`
Full workflow: `.agent/workflows/website-builder.md`

## Running the Pipeline

When the user says **"build site for [business name or URL]"**:
1. Determine if input is a URL, business name, or both
2. Run skills in this order (see workflow):
   1. intake-from-web (auto-populates `sites/{slug}/intake-scraped.json` from GBP + web; replaces the manual `docs/client-intake.md` fill-in step)
   2. find-business (called internally by intake-from-web; also usable standalone)
   3. scrape-content (optional — used only when intake-from-web wants deeper content or when Firecrawl blocked/incomplete)
   4. local-research
   5. site-audit (screenshots the OLD site for OPERATOR reference only — never as design DNA)
   6. design-reference (reference-libraries + intake brand tokens → design_reference.json; prefers `role: "primary"` library entries)
   7. site-generate (scaffolds Astro project from intake + design_reference)
   8. vercel-deploy (build + deploy + optional domain attach)
   9. short-link (optional)
3. **Pause after each step by default** — show results and wait for approval
4. Print a final summary table with the live URL

The user can add **`--auto`** to skip pauses.

For multiple businesses, process each sequentially through the full pipeline with pauses.

### What to show at each pause:

- **After intake-from-web:** GBP confirmation card (business name, address, phone, website URL) — hard stop until operator confirms. Then aggregated `intake-scraped.json` summary with a scraped ✓ / partial / needs-paste-in table. Client-supplied paste-ins are narrow: (1) GHL forms/surveys/calendar booking snippet, (2) GHL reviews widget snippet, (3) GHL Live Chat widget snippet, (4) tracking phone number, (5) brand color codes as a fallback if intake-from-web couldn't auto-detect colors from the client's site/logo. Everything else (Meta Pixel/GTM code injection, marketing_city override, custom domain) is operator-configured, not client-provided.
- **After find-business:** Business found — name, address, phone, email, rating, website URL. Confirm correct business.
- **After scrape-content:** Pages scraped, key content found (services, testimonials, photos), any gaps.
- **After local-research:** Pain points, what customers value, how this business stands out, suggested copy angles.
- **After site-audit:** Screenshot of existing site, strengths/weaknesses assessment.
- **After design-reference:** Synthesized design tokens (palette, typography, spacing) plus the merged anti-patterns list. Confirm before writing.
- **After site-generate:** Astro project scaffold created at `sites/{slug}/`. Content collections populated. CRM snippets and code-injection blocks confirmed via user paste-in. Show the config summary.
- **After vercel-deploy:** Local build succeeded, deploy URL, page count, and (if custom domain) DNS instructions. Ask if the user wants to create a disappearing link.
- **After short-link:** Short URL, expiration date, redirect target.

---

## Cost Rules — READ THIS BEFORE RUNNING ANYTHING

**Before running any action that costs money, you MUST:**
1. Tell the user what the action is and how much it will cost (estimate)
2. Wait for explicit approval before proceeding

**Known costs:**
- `/intake-from-web` — ~$0.20–0.35 total (batched). Broken down: GBP lookup ~$0.004, Firecrawl homepage ~$0.02, inner-page batch (5–10 pages) ~$0.10–0.20, each social profile ~$0.02. Warn per paid sub-step; wait for approval before the batch after GBP confirmation.
- `/find-business` — ~$0.004 per lookup (5 places at $4/1,000). Before running, tell the user: "I'm about to search Google Maps for [business], which will cost approximately $0.004. OK to proceed?"
- `/scrape-content` — Free when using Playwright. If Firecrawl fallback is triggered, warn the user: "Playwright didn't capture enough content. Firecrawl may have usage costs depending on your plan. OK to try Firecrawl?" Wait for approval.
- `/design-reference` — ~$0.02 per reference URL (Firecrawl). Confirm the reference set with the user before scraping.
- All other skills — Free

**Never run a paid action without stating the cost first.** If debugging requires re-running a paid step, explain why and ask again.

### Reusing Previous Runs

If a Maps lookup has already been run, you can re-download results from Apify without paying again. Use the Apify API to fetch results from a previous run ID or dataset ID. Always check if usable data already exists before starting a new paid scrape.

---

## SEO & Agent-Discoverability — INVARIANT

Every generated site ships these as standard. They are not optional polish, and
**no edit may leave them stale or broken**:

| Artifact | Source | Where |
|---|---|---|
| `LocalBusiness` + `WebSite` JSON-LD (linked by `@id`) | `src/content/site/config.json` | `BaseLayout.astro` |
| `BreadcrumbList`, `Service`, `FAQPage` JSON-LD | page frontmatter via the `jsonLd` prop | per page |
| `/llms.txt` — short, link-first index | content collections | `src/pages/llms.txt.js` |
| `/index.md` — long-form markdown mirror | content collections | `src/pages/index.md.js` |
| `agent-site-summary` (`<script type="text/markdown">`) | content collections | `BaseLayout.astro`, homepage only |
| `robots.txt` + `sitemap-index.xml` | build | `public/`, `@astrojs/sitemap` |
| `canonical`, OG, Twitter, `content-language`, `hreflang` | `BaseLayout.astro` | every page |

**The rule that keeps this true: these are GENERATED, never hand-written.**
`src/lib/agent-docs.js` derives every one of them from the same content
collections the pages render. Change a phone number, a service, or a service
area and all of it follows automatically — there is no second copy to update.

Three things that WILL break it, so check them on any edit:

1. **Hand-editing `llms.txt`, `index.md`, or the summary into a static file.**
   Never do this. A confidently wrong `llms.txt` is worse than none, because an
   LLM quotes it verbatim to a customer. Fix the content collection instead.
2. **Changing a route's slug, path, or cap without updating `src/lib/limits.ts`.**
   The agent docs import `SERVICE_LIMIT` / `AREA_LIMIT` / the reserved-slug set
   from that module *specifically* so they cannot advertise a URL that
   `getStaticPaths` never built. Raising a cap in a route file alone reintroduces
   the drift the module exists to prevent.
3. **Removing or renaming a page listed in the `## Pages` block of
   `agent-docs.js`.** Those paths are literals — they are the one part not
   derived from a collection.

After ANY site edit, verify before calling it done:

```bash
cd sites/{slug} && npm run build
curl -s localhost:PORT/llms.txt   # or read dist/llms.txt
```

Confirm: the business details are current, every service and area listed is one
that actually built, and no link 404s. `docs/seo-baseline.md` has the full
checklist and the link-resolution script.

## Key Behaviors

- **One Astro project per site** — `sites/{slug}/` is a full Astro project, not a single HTML file
- **Fixed section order per page type** — Home, Service, and Service-area pages ship a fixed section order (see v2.2 amendment E in `docs/plans/2026-07-22-astro-refactor.md`). Do not randomize.
- **Standardized legal content** — Privacy, Terms, and Accessibility pages use identical body text across all clients; only business info interpolates.
- **CRM widgets are paste-only** — GHL chat/reviews/form/call-tracking snippets and URLs come from the user paste-in during `site-generate`. Never synthesize loader URLs.
- **Universal code injection** — `head` / `body_start` / `body_end` slots per-site plus per-page overrides for pixels, GTM, GHL number-swap, etc.
- **Real content only** — no placeholder text in generated sites
- **Log everything** — every build and deploy goes in `sites/build-log.md`
- **Playwright first, Firecrawl fallback** — for content scraping
- **Maps lookup always runs** — regardless of whether URL or name was provided
- **Up to 5 services + service-area subpages** — enforced by dynamic route slicing. `firefly` caps areas at 5; `owl` caps at 6 so the HQ city can have a page alongside outlying towns. Raise deliberately: the cap exists to prevent a pile of thin near-duplicate pages.
- **Copy angles drive messaging** — local research findings shape the hero, headlines, and initial content
- **Compliance defaults ON** — ADA, GDPR, A2P flags default true across all sites

---

## Previewing Sites Before Deploy

Sites are now Astro projects, so preview via the dev server:

```bash
cd sites/{slug} && npm install && npm run dev
```

Then open the URL Astro prints (typically http://localhost:4321). For a production-representative preview:

```bash
cd sites/{slug} && npm run build && npm run preview
```

---

## File Conventions

- `sites/{slug}/intake-scraped.json` — auto-populated intake from `/intake-from-web` (brand tokens + business context)
- `sites/{slug}/business_profile.json` — Maps data
- `sites/{slug}/scraped_content.json` — website content (optional)
- `sites/{slug}/local_research.json` — Reddit research
- `sites/{slug}/audit_results.json` — screenshot + assessment (optional, OPERATOR reference only — never design DNA)
- `sites/{slug}/design_reference.json` — reference-URL-derived design tokens
- `docs/client-intake.md` — human-readable questionnaire; fields that `/intake-from-web` couldn't scrape (GHL widgets, code_injection, marketing_city, domain) are collected manually per this doc
- `sites/{slug}/` (Astro project) — src/content/, src/styles/tokens.css, astro.config.mjs, package.json, etc.
- `screenshots/{slug}.png` — old-site screenshot
- `sites/build-log.md` — build log with deploy URLs + page counts
- `reference-libraries/{vertical}.json` — curated reference URLs per vertical (default, roofing, concrete)
- Slug format: lowercase, hyphenated (`Joe's Plumbing` → `joes-plumbing`)
- Service-area slug format: `city-state-abbr` (lowercase), e.g. `denver-co`, `miami-fl`. In the `firefly` template these resolve at the flat root and reserved slugs are enforced in `astro-templates/firefly/src/pages/[area].astro`. In the `owl` template they resolve under `/service-area/` and only `index` is reserved — see `astro-templates/owl/src/pages/service-area/[slug].astro`
