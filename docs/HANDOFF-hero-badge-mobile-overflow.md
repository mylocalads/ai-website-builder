# HANDOFF — fix the hero badge mobile overflow on six live sites

**Date:** 2026-09-18
**Repo:** this one (`ai-website-builder`). The fix cannot be done anywhere else.
**Status:** template already fixed and pushed. **Six live sites are still broken.**
**Effort:** one `sed`, then one deploy per site.

---

## 1. What is wrong

On a phone, the home page of six sites is **wider than the screen**. The heading
is clipped and the estimate form is pushed half off the right edge.

The cause is three CSS lines in each site's `src/components/HeroOwl.astro`:

```css
@media (max-width: 560px) {
  .trust-badges { flex-wrap: nowrap; ... }   /* turns wrapping OFF */
  .badge-label  { ... white-space: nowrap; } /* text cannot break */
  .badge-sub    { ... white-space: nowrap; } /* text cannot break */
}
```

The base rule is `flex-wrap: wrap`, which is right. The **mobile** rule turns it
off. Whoever wrote it measured one pair of labels at 147 + 202 px and assumed all
labels would be that size. They are not.

Forbidding a wrap does not make text narrower. The list gets stuck at its text
width, which pins the hero's grid track, which widens the container, which
overflows the page. **A trust badge breaks the lead form.**

## 2. Who is affected

Measured live at a 375 px viewport on 2026-09-18:

| Site | Overflow | In the portal? |
|---|---:|---|
| `royal-roofing-systems` | **250 px** | no business row |
| `garp-construction-group` | **118 px** | no business row |
| `advanced-electrical-and-communications` | **78 px** | yes — this is the client being handed over |
| `nepa-roofing-pros` | **71 px** | no business row |
| `whitman-lawncare` | **21 px** | yes, but `website_builds_enabled = false` |
| `stubbs-landscaping` | **6 px** | no business row |

The other 30 live sites measured **0 px**. They are fine — their badge text
happens to be short enough. They are not urgent, but see §6.

## 3. The fix

The `@media (max-width: 560px)` block is **byte-identical** across all six files
(md5 `4f56a14cde565953e18901d8e6d73daa`), so one command does all of them.

Keep the size reductions. They are what lets a *short* pair share a row. Remove
only the three rules that forbid wrapping.

```bash
cd "$(git rev-parse --show-toplevel)"

for s in royal-roofing-systems garp-construction-group \
         advanced-electrical-and-communications nepa-roofing-pros \
         whitman-lawncare stubbs-landscaping; do
  f="sites/$s/src/components/HeroOwl.astro"
  perl -0pi -e 's/\.trust-badges \{ flex-wrap: nowrap; gap: var\(--space-2\); \}/.trust-badges { gap: var(--space-2); }/' "$f"
  perl -0pi -e 's/(\.badge-label \{ font-size: 0\.74rem; letter-spacing: 0\.03em;) white-space: nowrap; \}/$1 }/' "$f"
  perl -0pi -e 's/(\.badge-sub \{ font-size: 0\.66rem;) white-space: nowrap; \}/$1 }/' "$f"
  echo "$s -> $(grep -c 'nowrap' "$f") nowrap left (expect 0)"
done
```

Every line must print `0`. If one prints `1`, that file drifted — open it and
make the same edit by hand.

**These three commands are tested.** Run against
`sites/advanced-electrical-and-communications/src/components/HeroOwl.astro`, the
resulting `@media (max-width: 560px)` block is byte-identical to the fixed
template's.

**One thing the commands do not do:** the comment directly above the block still
reads *"Tighten the gap and the type so both sit on one row"*, which is now the
opposite of what the code does. Replace those two comment lines with something
honest, e.g.:

```
  /* Below 560px, shrink the badges so a SHORT pair can share a row.
     TIGHTEN, NEVER FORBID WRAPPING — a `nowrap` here pins the list's width,
     which pins the hero grid track, which overflows the whole page. See
     astro-templates/owl/src/components/HeroOwl.astro for the full reasoning. */
```

A comment that asserts the opposite of the code is worse than no comment,
because the next person builds on it. That is how this bug survived 37 sites.

`astro-templates/owl/src/components/HeroOwl.astro` is **already fixed** (commit
`9f53fb5`). Do not redo it. It only governs sites built from now on, which is
exactly why these six need patching individually.

## 4. Deploy each site

Each site is its own Vercel project. `vercel deploy --prod` builds remotely, so a
local `npm install` should not be needed — confirm on the first site before
looping.

```bash
cd sites/<slug>
vercel deploy --prod
```

Sites already linked locally have `.vercel/project.json`. Those that do not
(`advanced-electrical-and-communications` was one) need `vercel link` first, or
deploy them by project name. The Vercel CLI on this Mac is already authenticated
— do not go looking for a token.

Project ids seen while investigating:

- `royal-roofing-systems` → `prj_osXmYMD2kLW5ir3atOXgw2NmdLPU`
- `whitman-lawncare` → `prj_C667VNbpIPCbpfAcwBfvKZXqdSpU`
- `advanced-electrical-and-communications` → `prj_DMkt9f8DRt6Jhs97VfqcYncbgU2u`

## 5. Verify

For each site, load it at a 375 px viewport and check the page is not wider than
the screen:

```js
// in the browser console on the site's home page, at 375px wide
document.documentElement.scrollWidth - document.documentElement.clientWidth
// must be 0
```

Advanced Electrical was measured at **453 px on a 375 px viewport** before, and
**375 px** after the same change was injected live. Expect every site to reach 0.

Check the home page only — it is the only page with `trust-badges`. `/book/`,
`/contact/` and the service pages all measured 0 already.

## 6. Do NOT do these

- **Do not run a portal rebuild to fix this.** A rebuild hands the agent the
  site's existing source, which still carries the bug. It costs 30+ minutes and
  real money per site and may not fix anything. Four of the six are not in the
  portal at all, so it is not even possible for them.
- **Do not change `whitman-lawncare`'s `website_builds_enabled` flag.** It is
  `false` in the portal and that looks deliberate. Patching and deploying the
  site source does not need it touched.
- **Do not "fix" the template again.** Done in `9f53fb5`.
- **Do not patch the other 30 sites as part of this.** They measure 0 today and
  will pick the fix up on their next build. Doing them now is a 30-file diff for
  no user-visible change. Worth doing separately if you want uniformity, since
  any of them could start overflowing if its badge text is ever edited.

## 7. Unrelated but already fixed today

These are done and live; listed only so nobody re-investigates them.

- The runner script now POSTs its own build result
  (`~/bin/mla-build.sh` on `mla-web-runner`, `165.227.84.34`).
- The portal refuses to record a failure from a report carrying `exit=?`
  (`mla-starter-hub`, deployed).
- The n8n workflow `ueMLlHxlXIX30aDX` no longer invents a failure from silence
  (published).

Together those stop n8n's ~31 minute SSH cutoff from marking live sites as
failed, which it had been doing since at least 2026-09-04.

## 8. Still open after this

- The **funnel** template has not been checked for the same pattern.
- The repo copy of the n8n workflow (`mla-starter-hub/docs/n8n/website-build-runner.json`)
  has drifted from live — live node names carry a `1` suffix. Reconcile it before
  anyone trusts that file.
