---
name: site-edit
description: Surgical, single-field or multi-field edits to an already-generated client site under sites/{slug}/. Rewrites the operator's natural-language request into a short technical diff spec, shows it for Y/N confirmation, then applies ONLY the listed changes — no adjacent cleanups, no invented values, no scope creep. Runs schema validation + local build after applying; operator triggers vercel-deploy separately.
trigger: "site-edit" or "edit site" or "edit the {slug} site" or "change {field} on {slug}" or "update {slug}"
---

# Site Edit

<!--
Pipeline position: this skill is OUT-OF-BAND. It does NOT run the intake → design → generate → deploy pipeline. It exists so operators can fix a typo, swap a photo, tweak a color, or update a CRM paste-in without regenerating the whole site.

Allowed write roots (per invocation, scoped to ONE confirmed slug):
  sites/{slug}/src/content/**        ← JSON + markdown copy, services, areas, config
  sites/{slug}/src/styles/tokens.css ← brand colors, fonts, radii
  sites/{slug}/src/components/**     ← per-site component overrides only

Explicit deny (refuse even if the operator asks):
  astro-template/**                  ← template edits are a separate workflow
  Anything outside sites/{slug}/     ← other clients' files, agent config, workflows
-->

## What this skill does

Takes a natural-language change request from the operator (e.g. "change Firefly's phone number to 509-555-1234", "swap the accent color to #b91c1c on riverside-plumbing", "add a new roofing FAQ to firefly-cd") and applies it surgically to the target site under `sites/{slug}/`.

Every run has the same four gates:

1. **Slug confirmation** — infer the slug from the operator's phrasing, echo it back, wait for "yes".
2. **Technical diff spec** — rewrite the request into a numbered list of `SET path → value` lines, wait for "yes".
3. **Apply** — write ONLY the listed changes, atomically. Never edit anything not in the spec.
4. **Validate** — run `npx astro sync` + `npm run build`. On failure, revert every edit and report which line broke.

Then hand off to the operator with a one-line summary and the reminder to run `vercel-deploy` when they're ready to push.

---

## HARD ANTI-HALLUCINATION LOCK — READ BEFORE ANY EDIT

The core promise of this skill is: **the file diff after apply is exactly the set of changes the operator confirmed. Nothing more.**

Rules the skill MUST follow, in every invocation:

- **No adjacent cleanups.** If the operator asks for a phone-number change, do not also fix a typo you noticed two lines away, do not reformat JSON, do not sort keys, do not "improve" a nearby description. If it isn't in the confirmed spec, it isn't in the diff.
- **No invented values.** If the request is missing information (e.g. "make the service page match the new hero"), stop and ask the operator to specify the exact target value. Do not guess. Do not use "reasonable defaults."
- **No copy rewrites.** Never rephrase, shorten, or "polish" copy the operator did not ask you to change. Copy edits are ONLY made when the operator gives the new copy verbatim.
- **No template edits.** `astro-template/**` is off-limits. If the operator's request can only be satisfied by editing the template, refuse and tell them a template change is a separate workflow.
- **No cross-site edits.** One invocation edits one `sites/{slug}/`. If the operator asks to edit two clients at once, refuse and ask them to run the skill twice.
- **No scope inflation via "obvious related fields."** The ONE explicit exception is the mechanical derivation of `phone` (E.164) from a `phone_display` change and vice versa — that's called out in Step 3 below. Every other "well, if we change X we should probably also change Y" instinct is wrong here. Ask the operator; don't act.
- **Atomic apply or full revert.** If any file in the batch fails to write, revert every file already written in this batch before reporting the failure. Never leave the site in a partially-applied state.
- **Never touch a snippet the operator pasted in.** CRM widget snippets, code-injection blocks, and financing / partner HTML are paste-only. If the operator asks to "clean up" a pasted snippet, refuse and ask them to paste the corrected version verbatim.

If the skill is uncertain whether a specific change would violate one of these rules, it stops and asks. Uncertainty is not permission.

---

## Cost rules

Free. This skill only reads and writes local files and runs a local build. No paid APIs.

---

## Process (execute in this order — do not reorder)

### 1. Resolve and confirm the slug

Parse the operator's request for a slug hint. Accept any of:

- Explicit slug: `site-edit firefly-cd: …`
- Natural-language name: "edit the Firefly site", "update Riverside Plumbing", "change the Otis Orchards contractor's phone"
- Bare site name matching a directory in `sites/`

Slug-matching rules:

1. Exact directory match under `sites/` → use it.
2. Substring match on a single `sites/{slug}/` directory (case-insensitive on the slug) → use it.
3. Match against `business_name` field in `sites/{slug}/src/content/site/config.json` (fuzzy substring, case-insensitive) → use it.
4. Zero matches → ask: "Which site? I looked for `X` and didn't find a match under `sites/`. Which slug should I edit?"
5. Multiple matches → list them numbered and ask the operator to pick.

Once resolved, echo back for confirmation:

```
Editing site: firefly-cd
  Business: Firefly Contractors & Design
  Path:     sites/firefly-cd/
  Live at:  https://fireflycd.com  (or vercel URL if no custom domain)

Is this the site you want to edit? [yes / no / different slug]
```

**Hard stop until confirmed.** Do not proceed to Step 2 without an explicit "yes".

### 2. Rewrite the request into a technical diff spec

Parse the confirmed request into a numbered list of atomic edits. Each line uses the shape:

```
SET {relative-path-under-sites/{slug}/}#{field-path} → {new value}
```

- `#field-path` uses JSONPath-style dots for nested keys in JSON files, or `#frontmatter.{key}` for markdown frontmatter, or `#body` for markdown body text, or `#css.{--custom-property}` for CSS custom properties in `tokens.css`.
- For array operations, use `APPEND` / `REMOVE` / `SET index N` explicitly.
- For file-scope replacements (e.g. swap a photo URL in three gallery entries), each replacement is a separate numbered line — do not collapse them.

Examples:

```
1. SET src/content/site/config.json#phone_display → "(509) 555-1234"
2. SET src/content/site/config.json#phone → "+15095551234"
   (mechanical derivation from #1)
3. SET src/styles/tokens.css#css.--color-accent → "#b91c1c"
4. APPEND src/content/services/roofing.md#frontmatter.faqs → { q: "Do you offer emergency repair?", a: "Yes, 24/7 in the Spokane metro." }
5. SET src/content/site/config.json#social.instagram → "https://instagram.com/fireflycd"
```

Rules for the rewrite:

- **Shortest technical form.** No prose, no rationale, no "I'll also update…" side effects. Just the list.
- **No new material information.** Every value on the right of `→` must appear verbatim (or be a mechanical derivation of) something the operator said. If the operator did not say the value, insert `{ASK}` and stop.
- **Mechanical derivations that ARE allowed** (only these — nothing else counts):
  - `phone` (E.164) ⇄ `phone_display` (as-written) when the operator changes one.
  - `state_abbr` (2-letter lowercase) from `state` (2-letter uppercase) or vice versa on service-area files.
  - `slug` on a service-area markdown filename when the operator supplies a new `city` + `state`. Filename change is one line: `RENAME src/content/service_areas/spokane-wa.md → src/content/service_areas/coeur-dalene-id.md`.
- **Reserved-slug refusal.** If the diff would produce a service-area slug in the reserved set (`about`, `services`, `service-areas`, `contact`, `pricing`, `our-work`, `privacy`, `terms`, `accessibility`, `book`, `404`, `_astro`, `index`, `sitemap-index.xml`, `sitemap-0.xml`, `robots.txt`), refuse the line and tell the operator to pick a non-reserved slug.
- **Off-scope refusal.** If any line would write outside the allowed roots (`src/content/**`, `src/styles/tokens.css`, `src/components/**` — all scoped to the confirmed `sites/{slug}/`), refuse the whole diff and tell the operator which line was out of scope.
- **Paste-in refusal.** If the operator's request asks the skill to synthesize, "clean up", or rewrite a `crm.*` snippet, `code_injection.*` block, or `financing`/`partners` HTML, refuse and ask for a verbatim paste.

Then print the diff spec and hard-stop:

```
Proposed edits to sites/firefly-cd/:

1. SET src/content/site/config.json#phone_display → "(509) 555-1234"
2. SET src/content/site/config.json#phone → "+15095551234"
   (mechanical derivation from #1)
3. SET src/styles/tokens.css#css.--color-accent → "#b91c1c"

Apply these 3 edits? [yes / no / revise]
```

**Hard stop until the operator says "yes".** Any other answer (including "yes but also change X") means: cancel this batch, go back to Step 2 with the revised request. Never apply a partial "yes" — the operator must confirm the exact final list.

### 3. Apply the edits (atomically)

For each numbered line, in order:

1. Read the target file.
2. Verify the target field exists at the path (or that `APPEND` targets an array). If not, revert every prior write in this batch, stop, and tell the operator which line's target path was invalid.
3. Apply the single change using the `Edit` tool (for scalar/frontmatter changes) or a targeted rewrite (for `RENAME` and `APPEND` operations).
4. Track the write in a rollback list (path + prior contents).

Preserve invariants that already hold in the file:

- LF line endings.
- Trailing newline at EOF.
- Existing indentation and key ordering — never reformat, sort, or normalize JSON.
- For JSON: never rewrite the whole file; use the smallest possible byte-range replacement that changes the target scalar or array element. If a change would require restructuring (e.g. adding a new top-level key), preserve the surrounding file byte-for-byte outside the inserted block.
- For markdown: never re-flow paragraphs. Frontmatter edits touch the YAML block only; body edits touch the specific paragraph the operator named.
- For `tokens.css`: preserve `@import` order, existing declaration order, and comments. Only the target `--custom-property` value line changes.

If any write raises an error, revert every prior write in this batch (restore from the rollback list), then stop and report the failure with the line number that broke.

### 4. Validate

Run inside `sites/{slug}/`:

```bash
npx astro sync
```

If `astro sync` fails (schema mismatch, missing required field, invalid URL, reserved slug leak):

1. Revert every write in this batch from the rollback list.
2. Print the astro-sync error verbatim.
3. Tell the operator which of the numbered edits produced an invalid state and ask them to revise.

If `astro sync` succeeds:

```bash
npm run build
```

If `npm run build` fails (broken component reference, TS error, missing prop, invalid image URL at build time):

1. Revert every write in this batch from the rollback list.
2. Print the build error verbatim.
3. Tell the operator which line most likely caused it (best guess by matching the error's file path to the edited files; if unclear, say so).

Note: `npm install` is NOT run by this skill. If `node_modules` is missing (rare, since the site was already generated by `site-generate`), tell the operator to run `npm install` inside `sites/{slug}/` first and abort.

### 5. Report and hand off

On successful apply + build, print:

```
✓ Applied 3 edits to sites/firefly-cd/

Files changed:
  src/content/site/config.json     (phone_display, phone)
  src/styles/tokens.css            (--color-accent)

Build: OK (npm run build exited 0)

Next: run `vercel-deploy` when ready to push to production.
```

Do NOT run `vercel-deploy` from this skill. The operator triggers deploys separately.

---

## Component override edits (per-site `src/components/**`)

Component overrides are permitted, but they carry more risk than content edits — a broken component can crash the whole site build. Extra rules apply when the diff spec touches `sites/{slug}/src/components/**`:

- The change must be scoped to a SINGLE named file. Multi-component rewrites in one invocation are refused — the operator must run the skill once per component override.
- The operator must supply the new component code verbatim, or name a specific line-range edit ("delete lines 42–48"). The skill does not author new components from scratch inside this skill.
- Never create a new component override that shadows a template component the operator did not explicitly name. Overrides only exist when the operator explicitly says "override the X component for this site."
- Never delete an existing component override without a numbered `REMOVE src/components/{Name}.astro` line in the confirmed spec.

If any of the above is unclear from the operator's request, stop and ask. Component overrides are one of the easier ways to silently damage a site — err heavily on the side of asking.

---

## Failure modes

Handle each explicitly. Never silently fail.

- **Slug can't be resolved.** Zero matches under `sites/` and no fuzzy `business_name` hit → ask the operator for the slug. Do not guess.
- **Multiple slug matches.** List them numbered and let the operator pick.
- **Operator says "no" or "revise" at Step 2.** Cancel the batch, go back to parsing the revised request. Never apply a partial confirmation.
- **Target field path doesn't exist.** Revert any prior writes in the batch, tell the operator which line has an invalid path, ask them to correct.
- **Reserved-slug leak** (e.g. renaming a service-area to `contact-us` → `contact-us.md`). Refuse the specific line at Step 2; the operator picks a different slug.
- **Out-of-scope write** (any path outside `sites/{slug}/src/content/**`, `sites/{slug}/src/styles/tokens.css`, `sites/{slug}/src/components/**`). Refuse the entire batch at Step 2 and name the offending line.
- **Astro sync failure post-apply.** Full rollback, verbatim error, name the likely offending line.
- **Build failure post-apply.** Full rollback, verbatim error, best-guess line if the error path maps to an edited file.
- **`node_modules` missing.** Abort with a clear "run `npm install` inside sites/{slug}/ first" — this skill doesn't install for the operator.
- **Operator asks to edit a snippet paste** (CRM widget, code injection, financing HTML). Refuse and ask for a verbatim replacement paste.
- **Operator asks the skill to fix a typo they noticed while reading the diff, but it's not in the numbered spec.** Refuse and tell them to include it in the next batch — this is exactly the scope-creep this skill is built to prevent.

---

## Rules (summary)

- Never edit `astro-template/`.
- Never write outside the confirmed `sites/{slug}/`.
- Never edit outside `src/content/**`, `src/styles/tokens.css`, or `src/components/**` within that slug.
- Never rewrite a pasted-in snippet (CRM, code injection, financing, partners).
- Never invent values; if a value is missing from the request, ask and stop.
- Never batch-edit two slugs in one invocation.
- Never reformat, sort keys, or "improve" JSON/YAML/CSS outside the confirmed spec lines.
- Never rewrite copy the operator did not supply verbatim.
- Always resolve + confirm the slug before parsing the request.
- Always show the technical diff spec and get an explicit "yes" before applying.
- Always run `astro sync` + `npm run build` after applying.
- Always full-revert on any failure — atomic apply or nothing.
- Always write files with LF line endings and preserve the trailing newline.
- Always tell the operator to run `vercel-deploy` separately when they're ready to push.

---

## What NOT to ask about

The skill runs at most three interactive turns per invocation:

1. Slug confirmation (Step 1).
2. Value clarification if the request is missing information (mid Step 2 — one round trip, then re-emit the spec).
3. Diff-spec confirmation (Step 2).

Do not run any other interactive prompt. Do not ask "while I'm here should I also…" — the answer is always no. Do not ask "want me to deploy?" — the operator runs `vercel-deploy` themselves.

---

## Handoff invariants

At the end of a successful run, all of the following must be true:

- Every file changed corresponds to a numbered line in the confirmed diff spec.
- No file outside `sites/{slug}/` was modified.
- No file inside `sites/{slug}/` outside the allowed write roots was modified.
- `npx astro sync` exited 0 inside `sites/{slug}/`.
- `npm run build` exited 0 inside `sites/{slug}/` and produced a fresh `dist/` directory.
- No template file was touched.
- No pasted snippet was rewritten.
- The rollback list is empty (all writes committed).

If any invariant fails, the batch has been fully reverted — do not report success.
