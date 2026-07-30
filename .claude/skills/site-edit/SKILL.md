---
name: site-edit
description: Surgical, single-field or multi-field edits to an already-generated client site under sites/{slug}/. Rewrites the operator's natural-language request into a short technical diff spec, shows it for Y/N confirmation, then applies ONLY the listed changes — no adjacent cleanups, no invented values, no scope creep. Snapshots every change to a per-site history directory + JSONL log so any batch can be rolled back. Runs schema validation + local build, then auto-deploys via vercel-deploy so the operator can see the change live.
trigger: "site-edit" or "edit site" or "edit the {slug} site" or "change {field} on {slug}" or "update {slug}" or "site-edit rollback {slug}" or "rollback the {slug} site"
---

# Site Edit

<!--
Pipeline position: this skill is OUT-OF-BAND. It does NOT run the intake → design → generate → deploy pipeline. It exists so operators can fix a typo, swap a photo, tweak a color, or update a CRM paste-in without regenerating the whole site.

Allowed write roots (per invocation, scoped to ONE confirmed slug):
  sites/{slug}/src/content/**             ← JSON + markdown copy, services, areas, config
  sites/{slug}/src/styles/tokens.css      ← brand colors, fonts, radii
  sites/{slug}/src/components/**          ← per-site component overrides only
  sites/{slug}/.site-edit-history/**      ← version-control snapshots + JSONL log

Explicit deny (refuse even if the operator asks):
  astro-templates/**                       ← template edits are a separate workflow
  Anything outside sites/{slug}/          ← other clients' files, agent config, workflows
-->

## What this skill does

Two modes:

**Mode A — Edit (default).** Take a natural-language change request from the operator (e.g. "change Firefly's phone number to 509-555-1234", "swap the accent color to #b91c1c on riverside-plumbing", "add a new roofing FAQ to firefly-cd") and apply it surgically to the target site under `sites/{slug}/`. Every edit batch is snapshotted first so it can be rolled back later. After a successful build, the skill auto-runs `vercel-deploy` so the operator can immediately see the change live.

**Mode B — Rollback.** Show the recent edit history for a site, let the operator pick an entry to revert to, restore the snapshotted files, re-validate + rebuild, and auto-deploy.

Every edit run has the same six gates:

1. **Slug confirmation** — infer the slug from the operator's phrasing, echo it back, wait for "yes".
2. **Technical diff spec** — rewrite the request into a numbered list of `SET path → value` lines, wait for "yes".
3. **Snapshot** — copy every file the batch will touch into a timestamped history entry under `.site-edit-history/`.
4. **Apply** — write ONLY the listed changes, atomically. Never edit anything not in the spec.
5. **Validate** — run `npx astro sync` + `npm run build`. On failure, revert every edit and mark the history entry as failed.
6. **Deploy** — delegate to `vercel-deploy` so the change is live. Record the deploy URL + Vercel deployment ID in the history entry.

Rollback runs a matching six-gate flow with the snapshot as the source of truth for what to restore.

---

## HARD ANTI-HALLUCINATION LOCK — READ BEFORE ANY EDIT

The core promise of this skill is: **the file diff after apply is exactly the set of changes the operator confirmed. Nothing more.**

Rules the skill MUST follow, in every invocation:

- **No adjacent cleanups.** If the operator asks for a phone-number change, do not also fix a typo you noticed two lines away, do not reformat JSON, do not sort keys, do not "improve" a nearby description. If it isn't in the confirmed spec, it isn't in the diff.
- **No invented values.** If the request is missing information (e.g. "make the service page match the new hero"), stop and ask the operator to specify the exact target value. Do not guess. Do not use "reasonable defaults."
- **No copy rewrites.** Never rephrase, shorten, or "polish" copy the operator did not ask you to change. Copy edits are ONLY made when the operator gives the new copy verbatim.
- **No template edits.** `astro-templates/**` is off-limits. If the operator's request can only be satisfied by editing the template, refuse and tell them a template change is a separate workflow.
- **No cross-site edits.** One invocation edits one `sites/{slug}/`. If the operator asks to edit two clients at once, refuse and ask them to run the skill twice.
- **No scope inflation via "obvious related fields."** The ONE explicit exception is the mechanical derivation of `phone` (E.164) from a `phone_display` change and vice versa — that's called out in Step 3 below. Every other "well, if we change X we should probably also change Y" instinct is wrong here. Ask the operator; don't act.
- **Atomic apply or full revert.** If any file in the batch fails to write, revert every file already written in this batch from the snapshot before reporting the failure. Never leave the site in a partially-applied state.
- **Never touch a snippet the operator pasted in.** CRM widget snippets, code-injection blocks, and financing / partner HTML are paste-only. If the operator asks to "clean up" a pasted snippet, refuse and ask them to paste the corrected version verbatim.

If the skill is uncertain whether a specific change would violate one of these rules, it stops and asks. Uncertainty is not permission.

---

## Version control layer — `sites/{slug}/.site-edit-history/`

Every edit batch (Mode A) and every rollback (Mode B) writes to a per-site history directory. This is the skill's rollback source of truth. It is NOT git — it is a self-contained on-disk snapshot store so rollback works even in worktrees, detached HEADs, or environments where the sites/ directory is gitignored.

### Directory shape

```
sites/{slug}/.site-edit-history/
  log.jsonl                             ← append-only audit log, newest at the bottom
  {ISO-timestamp}-{shortid}/            ← one directory per batch (edit or rollback)
    manifest.json                       ← spec + status + deploy info for this batch
    before/                             ← byte-for-byte copy of every file this batch touched, PRIOR to apply
      src/content/site/config.json
      src/styles/tokens.css
      ...
    after/                              ← byte-for-byte copy of every file this batch produced, AFTER successful apply
      src/content/site/config.json
      src/styles/tokens.css
      ...
```

`shortid` is a 6-character `[a-z0-9]` slug generated from the batch — use a hash of the manifest contents; do NOT depend on `Date.now()` or `Math.random()` at snapshot time if the environment forbids them (fall back to counting existing history entries + a suffix from a stable hash of the spec).

Snapshot rules:

- Snapshots capture ONLY files the batch will touch (or, for rollback, files the target entry restored). Do NOT snapshot `node_modules/`, `dist/`, `.astro/`, `.vercel/`, or other build artifacts — those are regenerated by the build step.
- Directory paths inside `before/` and `after/` mirror the file's path relative to `sites/{slug}/` exactly.
- New files created by the batch (e.g. a new service markdown) get a zero-byte `before/{path}.absent` marker instead of a `before/{path}` copy, so rollback can distinguish "restore prior contents" from "delete this file".
- Deleted files (e.g. a `REMOVE` line) get their prior contents in `before/{path}` and a zero-byte `after/{path}.absent` marker.

### `manifest.json` shape

```jsonc
{
  "batch_id": "2026-07-23T14:33:07Z-a3f9c2",
  "mode": "edit",                             // "edit" or "rollback"
  "slug": "firefly-cd",
  "operator_request": "change phone to (509) 555-1234 and accent to #b91c1c",
  "diff_spec": [
    { "op": "SET",    "path": "src/content/site/config.json",  "field": "phone_display", "value": "(509) 555-1234" },
    { "op": "SET",    "path": "src/content/site/config.json",  "field": "phone",         "value": "+15095551234", "note": "mechanical derivation from phone_display" },
    { "op": "SET",    "path": "src/styles/tokens.css",         "field": "css.--color-accent", "value": "#b91c1c" }
  ],
  "files_touched": [
    "src/content/site/config.json",
    "src/styles/tokens.css"
  ],
  "status": "deployed",                        // one of: "applied", "build_failed", "reverted", "deployed", "deploy_failed", "rollback_target"
  "astro_sync": "ok",
  "npm_build": "ok",
  "deploy": {
    "vercel_deployment_id": "dpl_...",
    "url": "https://firefly-cd-abc123.vercel.app",
    "canonical_url": "https://fireflycd.com",
    "at": "2026-07-23T14:34:12Z"
  },
  "rolls_back_to": null,                       // for mode=rollback: the batch_id being restored
  "reverted_by": null                          // populated when a later rollback targets this batch
}
```

### `log.jsonl` shape

One line per batch, appended in the order they run. Same fields as `manifest.json` but flattened; readers use this for fast history listing without opening each manifest.

```jsonl
{"batch_id":"2026-07-23T14:33:07Z-a3f9c2","mode":"edit","slug":"firefly-cd","status":"deployed","summary":"phone_display, phone, --color-accent","at":"2026-07-23T14:34:12Z"}
```

### Retention

Keep the last 50 entries per site. When a new batch commits and the count exceeds 50, delete the OLDEST entry's directory (but leave its line in `log.jsonl` for audit). If the operator asks for a rollback target older than the retention window, tell them the snapshot is gone and offer any that remain.

---

## Cost rules

Free for the edit + snapshot + build steps. The auto-deploy step invokes `vercel-deploy`, which uses the operator's Vercel account (no per-deploy cost on the standard plan). Warn the operator only if `vercel-deploy` itself requests confirmation for a domain-attach step.

---

## Process — Mode A (Edit)

Execute in this order — do not reorder.

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
  Last edit: 2026-07-22 (3 batches in history)

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
- For file creation: `CREATE {path} → {contents}` with the full new file body. Only used when the operator has explicitly asked to add a new service, new area, or new component override.
- For file deletion: `REMOVE {path}`.
- For renames: `RENAME {old-path} → {new-path}` (used for service-area filename slug changes).

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
- **Off-scope refusal.** If any line would write outside the allowed roots (`src/content/**`, `src/styles/tokens.css`, `src/components/**`, `.site-edit-history/**` — all scoped to the confirmed `sites/{slug}/`), refuse the whole diff and tell the operator which line was out of scope.
- **Paste-in refusal.** If the operator's request asks the skill to synthesize, "clean up", or rewrite a `crm.*` snippet, `code_injection.*` block, or `financing`/`partners` HTML, refuse and ask for a verbatim paste.

Then print the diff spec and hard-stop:

```
Proposed edits to sites/firefly-cd/:

1. SET src/content/site/config.json#phone_display → "(509) 555-1234"
2. SET src/content/site/config.json#phone → "+15095551234"
   (mechanical derivation from #1)
3. SET src/styles/tokens.css#css.--color-accent → "#b91c1c"

This batch will snapshot 2 files to .site-edit-history/ (rollback-able)
and auto-deploy on success.

Apply these 3 edits? [yes / no / revise]
```

**Hard stop until the operator says "yes".** Any other answer (including "yes but also change X") means: cancel this batch, go back to Step 2 with the revised request. Never apply a partial "yes" — the operator must confirm the exact final list.

### 3. Snapshot (before-apply)

Compute the list of files the batch will touch (union of every `path` in the diff spec, plus any `RENAME` old-and-new paths).

Create the batch directory: `sites/{slug}/.site-edit-history/{ISO-timestamp}-{shortid}/`.

For each file that will be touched:

- If the file exists: copy its current bytes to `before/{same-relative-path}`.
- If the file does not exist (a `CREATE` line targets it): write a zero-byte marker at `before/{same-relative-path}.absent`.

Write `manifest.json` with the diff spec, the operator request, `mode: "edit"`, `status: "pending"`, and empty deploy info.

Append the batch to `log.jsonl` with `status: "pending"` (this line will be updated when the batch's terminal status is known — either overwrite the line via file rewrite, OR append a second line with the same batch_id and terminal status; the reader convention is "last line for a batch_id wins").

If snapshot writing itself fails (disk full, permission denied), stop. Do not touch any content file.

### 4. Apply the edits (atomically)

For each numbered line, in order:

1. Read the target file.
2. Verify the target field exists at the path (or that `APPEND`/`CREATE`/`REMOVE`/`RENAME` targets a valid state). If not, revert every prior write in this batch from the snapshot's `before/` directory, mark the manifest `status: "reverted"`, mark the log line `reverted`, then stop and tell the operator which line's target path was invalid.
3. Apply the single change using the `Edit` tool (for scalar/frontmatter changes) or a targeted rewrite (for `RENAME`, `APPEND`, `CREATE`, `REMOVE` operations).
4. On any exception during the write, revert every prior write in this batch from the snapshot's `before/`, mark the manifest `status: "reverted"`, and stop with the error.

Preserve invariants that already hold in the file:

- LF line endings.
- Trailing newline at EOF.
- Existing indentation and key ordering — never reformat, sort, or normalize JSON.
- For JSON: never rewrite the whole file; use the smallest possible byte-range replacement that changes the target scalar or array element. If a change would require restructuring (e.g. adding a new top-level key), preserve the surrounding file byte-for-byte outside the inserted block.
- For markdown: never re-flow paragraphs. Frontmatter edits touch the YAML block only; body edits touch the specific paragraph the operator named.
- For `tokens.css`: preserve `@import` order, existing declaration order, and comments. Only the target `--custom-property` value line changes.

Once every line applies cleanly, copy the resulting file bytes into `after/{same-relative-path}` alongside the `before/` snapshots. Mark the manifest `status: "applied"`.

### 5. Validate

Run inside `sites/{slug}/`:

```bash
npx astro sync
```

If `astro sync` fails (schema mismatch, missing required field, invalid URL, reserved slug leak):

1. Revert every write in this batch from the snapshot's `before/` directory.
2. Mark the manifest `status: "build_failed"` and record the error text in `manifest.astro_sync`.
3. Update the log line to `build_failed`.
4. Print the astro-sync error verbatim and tell the operator which of the numbered edits produced an invalid state.

If `astro sync` succeeds:

```bash
npm run build
```

If `npm run build` fails:

1. Revert every write from `before/`.
2. Mark the manifest `status: "build_failed"` and record the error text in `manifest.npm_build`.
3. Update the log line.
4. Print the build error verbatim, best-guess the offending line by matching the error's file path to the edited files (if unclear, say so).

Note: `npm install` is NOT run by this skill. If `node_modules` is missing, tell the operator to run `npm install` inside `sites/{slug}/` first and abort.

### 6. Deploy

On successful `npm run build`, delegate to the `vercel-deploy` skill for this slug (see `.agent/skills/vercel-deploy/SKILL.md`). Pass the slug; do NOT pass `--domain` unless the operator's original request explicitly asked to change or add a domain (a domain change is a distinct kind of edit — if the request implied one, it must have appeared in the confirmed spec).

Capture from `vercel-deploy`:

- `vercel_deployment_id` — from the CLI output (`dpl_...`).
- `url` — the `{project}.vercel.app` URL Vercel returned.
- `canonical_url` — the final canonical (custom domain if attached, otherwise the vercel URL).

Write those into `manifest.deploy` and set `manifest.status: "deployed"`. Update the log line to `deployed`.

If `vercel-deploy` fails (Vercel CLI error, DNS check timeout, auth failure):

- **Do NOT roll back the file edits.** The edits are valid and the build passed — the failure is downstream. Rolling back would silently discard the operator's confirmed work.
- Mark the manifest `status: "deploy_failed"` and record the error in `manifest.deploy.error`.
- Update the log line.
- Print the deploy error and tell the operator: "Files updated + build OK, but deploy failed. Rerun `vercel-deploy` when the issue is fixed, or run `site-edit rollback {slug}` to revert."

### 7. Report and hand off

On successful apply + build + deploy, print:

```
✓ Applied 3 edits to sites/firefly-cd/
✓ Snapshotted to .site-edit-history/2026-07-23T14:33:07Z-a3f9c2/
✓ Build: OK
✓ Deployed: https://fireflycd.com  (dpl_9x8y7z)

Files changed:
  src/content/site/config.json     (phone_display, phone)
  src/styles/tokens.css            (--color-accent)

Rollback: `site-edit rollback firefly-cd` to revert this or an earlier batch.
```

---

## Process — Mode B (Rollback)

Triggered by phrases like `site-edit rollback firefly-cd`, "rollback the firefly site", "undo the last edit on riverside-plumbing", "restore firefly-cd to yesterday's version".

### 1. Resolve and confirm the slug

Same as Mode A Step 1.

### 2. List recent history

Read `sites/{slug}/.site-edit-history/log.jsonl`. Present the last 10 entries (or fewer if the log is shorter), newest first, with their status and a compact summary:

```
Recent edits to sites/firefly-cd/:

  # BATCH ID                       WHEN                  STATUS      SUMMARY
  1  2026-07-23T14:33:07Z-a3f9c2   2 minutes ago         deployed    phone_display, phone, --color-accent
  2  2026-07-22T09:11:44Z-b81a3e   yesterday             deployed    home hero photo swap
  3  2026-07-20T18:02:19Z-c14fd0   3 days ago            deployed    added Coeur d'Alene service area
  4  2026-07-19T10:47:03Z-d92e5b   4 days ago            reverted    (build failed — never applied)
  5  2026-07-18T16:22:57Z-e0a7c1   5 days ago            deployed    updated 3 testimonials

Rollback options:
  - Pick a number to restore the site to the state AS OF JUST BEFORE that batch.
  - "undo last" is shorthand for restoring to the state before batch #1.

Which entry do you want to restore to? (Or "cancel".)
```

If the operator says "cancel", stop.

If the operator picks number N, that means: restore every file the site currently has to whatever it looked like in `before/` of batch N — plus, for every batch NEWER than N (batches 1..N-1 in the display), also restore any `before/` files they touched that batch N did NOT touch, because those files were modified between then and now.

Practical implementation: walk batches 1..N in newest-first order, building a map `{path → source}` where the newest `before/` wins for each path. That map is the exact set of files (and prior bytes) to restore.

For files that were `CREATE`d in batch N or newer (their `before/{path}.absent` marker is present), the rollback DELETES them.

### 3. Show restore preview

Print the file-level diff of the pending restore:

```
Rolling back to state before batch #1 (2026-07-23T14:33:07Z-a3f9c2).

Files that will be restored:
  src/content/site/config.json     (phone_display, phone → prior values)
  src/styles/tokens.css            (--color-accent → prior value)

Files that will be deleted:
  (none)

This will create a NEW history entry (mode: rollback) so the rollback itself is auditable
and can also be rolled back.

Proceed? [yes / no]
```

**Hard stop until "yes".**

### 4. Snapshot (before-restore)

Create a new batch directory in `.site-edit-history/` with a fresh `{ISO-timestamp}-{shortid}` and `mode: "rollback"`.

Snapshot the CURRENT state of every file the restore will touch into this new batch's `before/` — so the rollback itself is reversible.

`manifest.rolls_back_to` = the target batch_id.

For each batch in the range 1..N (inclusive), set `reverted_by` on that batch's manifest to the new batch_id.

### 5. Restore

For every file in the restore map:

- If `before/{path}` exists in the source batch: copy those bytes to `sites/{slug}/{path}`.
- If `before/{path}.absent` exists: delete `sites/{slug}/{path}`.

Once complete, copy the restored file bytes into the new batch's `after/`.

### 6. Validate

Run `npx astro sync` + `npm run build` in `sites/{slug}/`. If either fails, revert the restore from the new batch's `before/` directory (yes — a failed rollback is itself rolled back), mark the manifest `status: "reverted"`, and tell the operator which file broke. This is rare (a state that was previously live and healthy should build again), but real: dependency versions may have drifted, or the template may have moved on.

### 7. Deploy

Same as Mode A Step 6. Capture deploy info into the new batch's `manifest.deploy`. Mark `status: "deployed"`.

### 8. Report

```
✓ Rolled back sites/firefly-cd/ to state before batch #1
✓ Snapshotted current state to .site-edit-history/2026-07-23T14:41:02Z-f30b9a/ (rollback-able)
✓ Build: OK
✓ Deployed: https://fireflycd.com  (dpl_5w4v3u)

Restored:
  src/content/site/config.json     (phone_display, phone reverted)
  src/styles/tokens.css            (--color-accent reverted)
```

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
- **Target field path doesn't exist.** Revert any prior writes in the batch from `before/`, mark the manifest `reverted`, tell the operator which line has an invalid path, ask them to correct.
- **Reserved-slug leak.** Refuse the specific line at Step 2; the operator picks a different slug.
- **Out-of-scope write.** Refuse the entire batch at Step 2 and name the offending line.
- **Astro sync failure post-apply.** Full rollback from `before/`, manifest `build_failed`, verbatim error, name the likely offending line.
- **Build failure post-apply.** Same as above.
- **`node_modules` missing.** Abort with a clear "run `npm install` inside sites/{slug}/ first".
- **Deploy failure.** Do NOT roll back the local files. Mark manifest `deploy_failed`. Tell the operator they can rerun `vercel-deploy` or use `site-edit rollback` to revert.
- **Snapshot write failure** (disk full, permission denied, etc.). Stop before touching any content file. The batch was never applied.
- **Rollback target older than retention window.** Its `before/` files have been pruned. Tell the operator which entries are still restorable and stop.
- **Rollback build failure.** Revert the restore from the rollback batch's `before/`. Tell the operator which file broke and suggest running a fresh `site-generate` if the state can't be brought back.
- **Operator asks to edit a snippet paste.** Refuse and ask for a verbatim replacement paste.
- **Operator asks the skill to fix a typo they noticed while reading the diff, but it's not in the numbered spec.** Refuse and tell them to include it in the next batch — this is exactly the scope-creep this skill is built to prevent.

---

## Rules (summary)

- Never edit `astro-templates/`.
- Never write outside the confirmed `sites/{slug}/`.
- Never edit outside `src/content/**`, `src/styles/tokens.css`, `src/components/**`, or `.site-edit-history/**` within that slug.
- Never rewrite a pasted-in snippet (CRM, code injection, financing, partners).
- Never invent values; if a value is missing from the request, ask and stop.
- Never batch-edit two slugs in one invocation.
- Never reformat, sort keys, or "improve" JSON/YAML/CSS outside the confirmed spec lines.
- Never rewrite copy the operator did not supply verbatim.
- Always resolve + confirm the slug before parsing the request.
- Always show the technical diff spec and get an explicit "yes" before applying.
- Always snapshot the affected files to `.site-edit-history/` BEFORE applying — no snapshot, no edit.
- Always run `astro sync` + `npm run build` after applying.
- Always full-revert from `before/` on any validate failure — atomic apply or nothing.
- Always delegate to `vercel-deploy` on a successful build — the operator needs to see the change.
- On deploy failure, keep the file edits but flag the manifest as `deploy_failed`. Do not silently discard confirmed work.
- Always write files with LF line endings and preserve the trailing newline.
- Always append the batch's terminal status to `log.jsonl` before returning to the operator.

---

## What NOT to ask about

The skill runs at most three interactive turns per Mode-A invocation:

1. Slug confirmation (Step 1).
2. Value clarification if the request is missing information (mid Step 2 — one round trip, then re-emit the spec).
3. Diff-spec confirmation (Step 2).

And at most two interactive turns per Mode-B (rollback) invocation:

1. Slug confirmation.
2. Rollback-target selection + confirmation.

Do not run any other interactive prompt. Do not ask "while I'm here should I also…" — the answer is always no. Do not ask "want me to deploy?" — deploy is automatic on Mode-A success and automatic on Mode-B success.

---

## Handoff invariants

At the end of a successful Mode-A run, all of the following must be true:

- Every file changed corresponds to a numbered line in the confirmed diff spec.
- No file outside `sites/{slug}/` was modified.
- No file inside `sites/{slug}/` outside the allowed write roots was modified.
- `sites/{slug}/.site-edit-history/{batch_id}/before/` contains a byte-for-byte snapshot of every file the batch touched (or `.absent` markers for files that did not exist).
- `sites/{slug}/.site-edit-history/{batch_id}/after/` contains the applied state of every touched file (or `.absent` markers for files removed).
- `sites/{slug}/.site-edit-history/{batch_id}/manifest.json` has `status: "deployed"` and populated `deploy` block.
- `sites/{slug}/.site-edit-history/log.jsonl` has a line for this batch with terminal status.
- `npx astro sync` exited 0 inside `sites/{slug}/`.
- `npm run build` exited 0 inside `sites/{slug}/` and produced a fresh `dist/`.
- `vercel-deploy` returned a deployment ID and URL, and both are stored in the manifest.
- No template file was touched.
- No pasted snippet was rewritten.

For a successful Mode-B (rollback) run, the same invariants hold, PLUS:

- `manifest.mode === "rollback"` and `manifest.rolls_back_to` names the target batch_id.
- Every batch newer than or equal to the target has `reverted_by` set to this batch's id.

If any invariant fails, the batch is either fully reverted (Mode A) or the rollback is aborted and the site is restored to its pre-rollback state (Mode B) — do not report success.
