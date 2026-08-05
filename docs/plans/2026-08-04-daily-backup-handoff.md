# Handoff: Daily Automatic Backup to GitHub

**Written:** 2026-08-04
**For:** whoever implements this (fresh Claude session or a person)
**Repo:** `/Users/marcellusm/Claude Projects/mla-agents/ai-website-builder`
**Remote:** `git@github.com:mylocalads/ai-website-builder.git` (private)

---

## Why this exists

This repo holds the source for 26 client websites that My Local Ads is **paid** to
deliver. Until 2026-08-04 it had no git remote at all — 124 commits existed only on one
Mac Mini. That is now fixed, but backup is still **manual**: git never pushes on its own.
A drive failure, an bad `rm -rf`, or simply forgetting to push for three weeks loses paid
client work.

The goal is a job that runs once a day, commits whatever changed, and pushes it — with no
human in the loop, and **loud failure** if it ever stops working.

### The real risk is silent failure

A backup job that quietly dies is worse than no backup, because you *think* you're covered.
Most of the design below is about making failure visible, not about the happy path. Do not
drop the staleness check to save time.

---

## Verified preconditions

All of these were checked on 2026-08-04. Re-verify if significant time has passed.

| Fact | Status | Why it matters |
|---|---|---|
| SSH key `~/.ssh/id_ed25519_github` has **no passphrase** | ✅ verified | An encrypted key would block unattended push — no TTY to type into |
| Key authenticates as `mylocalads` | ✅ verified | `ssh -i ... -T git@github.com` → "Hi mylocalads!" |
| Repo has `core.sshCommand` set **locally** | ✅ set 2026-08-04 | `ssh -i ~/.ssh/id_ed25519_github -o IdentitiesOnly=yes`. **Not global** — plain `ssh` fails here because with no `~/.ssh/config` it reaches for `id_rsa`, which GitHub rejects |
| No secrets tracked | ✅ verified | Only `.env.example`. Real `.env` is gitignored |
| `dist/`, `node_modules/`, `.vercel/` ignored | ✅ verified | 0 tracked. Root `.gitignore` covers some; each `sites/*/` carries its own `.gitignore` from the template |
| Untracked files right now | **0** | `git add -A` is currently safe |
| Repo size | `.git` 97 MB, 2,966 tracked files | Daily deltas will be small |

### The one thing that could go wrong with `git add -A`

Build artifacts are excluded by **per-site** `.gitignore` files copied from
`astro-templates/{firefly,owl}/`. A site scaffolded some other way, or a stray folder
dropped into the repo, could have an unignored `dist/` or `node_modules/` — and a blind
`git add -A` would sweep gigabytes into git history, which is painful to undo.

**The script below guards against this with a size check.** Keep that guard.

---

## Design decisions

**Use `launchd`, not `cron`.** On macOS, `cron` is legacy and does not handle a sleeping
machine well. `launchd` with `StartCalendarInterval` runs a missed job when the Mac next
wakes, and again at boot if it was powered off. For a Mac Mini that sleeps, this is the
difference between a backup that runs and one that doesn't.

**Commit noise is acceptable.** This produces commits like
`chore: automatic backup 2026-08-05 18:30`. This is a *backup*, not a curated history.
Keep making real commits by hand with real messages — the job only sweeps up whatever is
left uncommitted at the end of the day.

**Script lives in the repo** (`scripts/daily-backup.sh`) so it is itself version-controlled
and backed up. The `launchd` plist points at its absolute path.

**Parameterised by repo path** so the same script can also cover
`/Users/marcellusm/Claude Projects` (the `claude-projects` monorepo), which has the same
exposure. Install a second plist for it — see "Extending" at the end.

---

## Step 1 — the script

Create `scripts/daily-backup.sh` in the repo:

```bash
#!/bin/bash
# Daily unattended git backup. See docs/plans/2026-08-04-daily-backup-handoff.md
#
# Usage: daily-backup.sh /absolute/path/to/repo
#
# Exits non-zero on failure AND raises a macOS notification, because a backup
# that fails silently is the failure mode this whole thing exists to prevent.

set -uo pipefail

REPO="${1:?usage: daily-backup.sh /path/to/repo}"
NAME="$(basename "$REPO")"
LOG="$HOME/Library/Logs/git-daily-backup.log"
STAMP="$REPO/.git/last-successful-backup"
LOCK="$REPO/.git/daily-backup.lock"

# Guard: how many MB of NEW content is too much to sweep in blindly.
MAX_ADD_MB=200
# Guard: warn loudly if the last success is older than this.
STALE_DAYS=2

mkdir -p "$(dirname "$LOG")"
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$NAME] $*" >> "$LOG"; }
notify() { osascript -e "display notification \"$1\" with title \"Backup FAILED: $NAME\" sound name \"Basso\"" 2>/dev/null || true; }
die() { log "FAIL: $*"; notify "$*"; exit 1; }

# Homebrew git, and PATH for a non-login launchd context.
export PATH="/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

cd "$REPO" || die "repo not found: $REPO"

# Don't stack runs. `flock` is NOT installed on this Mac (verified 2026-08-04),
# so this uses mkdir, which is atomic on every POSIX filesystem.
if ! mkdir "$LOCK" 2>/dev/null; then
  # Clear a stale lock left by a crashed run.
  if [ -f "$LOCK/pid" ] && ! kill -0 "$(cat "$LOCK/pid")" 2>/dev/null; then
    log "clearing stale lock"
    rm -rf "$LOCK"
    mkdir "$LOCK" 2>/dev/null || { log "could not acquire lock, skipping"; exit 0; }
  else
    log "another run in progress, skipping"
    exit 0
  fi
fi
echo $$ > "$LOCK/pid"
trap 'rm -rf "$LOCK"' EXIT

log "starting"

# Guard: never touch a repo mid-rebase/merge — committing here corrupts the operation.
if [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ] || [ -f .git/MERGE_HEAD ]; then
  die "rebase or merge in progress — refusing to auto-commit"
fi

# Guard: size of what we're about to add.
ADD_KB=$(git add -A --dry-run 2>/dev/null | sed 's/^add //;s/^remove //' | tr -d "'" \
  | while IFS= read -r f; do [ -f "$f" ] && du -k "$f" 2>/dev/null | cut -f1; done \
  | awk '{s+=$1} END {print s+0}')
ADD_MB=$(( ADD_KB / 1024 ))
if [ "$ADD_MB" -gt "$MAX_ADD_MB" ]; then
  die "would add ${ADD_MB}MB (limit ${MAX_ADD_MB}MB) — check for an unignored dist/ or node_modules/"
fi

# Commit only if there is something to commit.
if [ -n "$(git status --porcelain)" ]; then
  git add -A || die "git add failed"
  git commit -q -m "chore: automatic backup $(date '+%Y-%m-%d %H:%M')" || die "git commit failed"
  log "committed ${ADD_MB}MB of changes"
else
  log "no local changes"
fi

# Push if we're ahead — retry once for transient network failure.
UNPUSHED=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "unknown")
if [ "$UNPUSHED" = "unknown" ]; then
  die "no upstream configured — run: git push -u origin master"
fi

if [ "$UNPUSHED" -gt 0 ]; then
  if ! git push -q origin HEAD 2>>"$LOG"; then
    log "push failed, retrying in 30s"
    sleep 30
    git push -q origin HEAD 2>>"$LOG" || die "push failed twice — $UNPUSHED commits unbacked-up"
  fi
  log "pushed $UNPUSHED commit(s)"
else
  log "already in sync"
fi

# Confirm the remote genuinely matches before claiming success.
git fetch -q origin 2>>"$LOG"
if [ "$(git rev-parse HEAD)" != "$(git rev-parse @{u})" ]; then
  die "local and remote still differ after push"
fi

date '+%s' > "$STAMP"
log "SUCCESS — remote at $(git rev-parse --short HEAD)"

# Staleness self-check: catches "the job silently stopped weeks ago".
if [ -f "$STAMP" ]; then
  AGE_DAYS=$(( ( $(date '+%s') - $(cat "$STAMP") ) / 86400 ))
  if [ "$AGE_DAYS" -gt "$STALE_DAYS" ]; then
    notify "Last successful backup was ${AGE_DAYS} days ago"
  fi
fi

exit 0
```

Make it executable:

```bash
chmod +x "/Users/marcellusm/Claude Projects/mla-agents/ai-website-builder/scripts/daily-backup.sh"
```

> **Note on locking:** `flock` is not installed on this Mac (verified 2026-08-04 —
> `command -v flock` returns nothing). The script above therefore uses an atomic
> `mkdir` lock with stale-PID recovery instead. Do not "simplify" it back to `flock`
> without installing it first.

---

## Step 2 — the launchd job

Create `~/Library/LaunchAgents/com.mylocalads.aiwebsitebuilder.backup.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.mylocalads.aiwebsitebuilder.backup</string>

  <key>ProgramArguments</key>
  <array>
    <string>/Users/marcellusm/Claude Projects/mla-agents/ai-website-builder/scripts/daily-backup.sh</string>
    <string>/Users/marcellusm/Claude Projects/mla-agents/ai-website-builder</string>
  </array>

  <!-- Daily at 18:30. If the Mac is asleep, launchd runs it on wake;
       if powered off, at next boot. -->
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key><integer>18</integer>
    <key>Minute</key><integer>30</integer>
  </dict>

  <key>StandardOutPath</key>
  <string>/Users/marcellusm/Library/Logs/git-daily-backup.out</string>
  <key>StandardErrorPath</key>
  <string>/Users/marcellusm/Library/Logs/git-daily-backup.err</string>

  <key>RunAtLoad</key>
  <false/>
</dict>
</plist>
```

Load it:

```bash
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.mylocalads.aiwebsitebuilder.backup.plist
```

Keep a copy in the repo at `scripts/com.mylocalads.aiwebsitebuilder.backup.plist` so the
config is version-controlled too.

---

## Step 3 — verify it actually works

Do not skip this. An unverified backup job is not a backup job.

**Run it by hand first:**

```bash
"/Users/marcellusm/Claude Projects/mla-agents/ai-website-builder/scripts/daily-backup.sh" "/Users/marcellusm/Claude Projects/mla-agents/ai-website-builder"
```

Expect exit 0 and a `SUCCESS` line in `~/Library/Logs/git-daily-backup.log`.

**Then force the scheduled job:**

```bash
launchctl kickstart -p gui/$(id -u)/com.mylocalads.aiwebsitebuilder.backup
```

**Then prove it captures a real change** — this is the test that matters:

```bash
cd "/Users/marcellusm/Claude Projects/mla-agents/ai-website-builder" && echo "backup test $(date)" > .backup-test && launchctl kickstart -p gui/$(id -u)/com.mylocalads.aiwebsitebuilder.backup && sleep 20 && git fetch -q origin && git show origin/master:.backup-test
```

If that prints your timestamp, the file made it to GitHub. Clean up:

```bash
cd "/Users/marcellusm/Claude Projects/mla-agents/ai-website-builder" && rm .backup-test && git add -A && git commit -q -m "chore: remove backup test file" && git push -q
```

**Confirm it is scheduled:**

```bash
launchctl print gui/$(id -u)/com.mylocalads.aiwebsitebuilder.backup | head -20
```

---

## Failure modes and how each is handled

| Failure | Handling |
|---|---|
| Mac asleep at 18:30 | `launchd` runs it on wake |
| Mac powered off | Runs at next boot |
| No network | Push retried once after 30s; then fails loudly |
| Push rejected (remote ahead) | Fails loudly. **Deliberately does not auto-pull or force** — resolving divergence unattended risks losing work |
| Mid-rebase/merge | Refuses to run |
| Unignored `dist/`/`node_modules/` appears | Aborts if the add exceeds 200 MB |
| Two runs overlap | Lock file; second run exits |
| Job silently stops | Staleness check notifies if last success > 2 days |
| SSH key rotated/removed | Push fails → notification |

**The notification is the weak link** — it only shows if someone is logged in and looking.
If this work is truly business-critical, consider adding an off-machine check: a nightly
`git ls-remote` from elsewhere, or a dead-man's-switch service that alerts when it stops
receiving a daily ping. Out of scope here, worth a follow-up.

---

## What this deliberately does NOT do

- **Does not resolve divergence.** If remote is ahead, it stops and tells you.
- **Does not force-push.** Ever.
- **Does not back up ignored files** — `node_modules/`, `dist/`, `.vercel/`, and `.env`.
  All regenerable or secret.
- **`screenshots/` and `sites/*/raw/` must be un-ignored before this job is useful.**
  Marcellus confirmed 2026-08-04 that these are business assets: screenshots are the
  "before" half of before/after marketing, and the raw archives are used for QC. As long
  as they stay in `.gitignore`, the daily job will not back them up. See the section below
  — there is a live API key to scrub first.
- **Does not replace Time Machine.** This backs up one git repo, not the machine.

---

## Step 0 (do this FIRST) — un-ignore the marketing assets

These are business assets, not build junk. But two of them must be dealt with before the
first commit, because **once something is committed it is in git history permanently** —
removing it later means rewriting every SHA.

### Sizes, measured 2026-08-04

| Path | Size | Files | Verdict |
|---|---|---|---|
| `screenshots/` | **93 MB** | 38 PNGs | Back up. No secrets. Before/after marketing |
| `sites/*/raw/` minus h4 photos | **~5 MB** | HTML/JSON/MD scrape archives | Back up **after scrubbing** — see below |
| `sites/h4-roofing-construction/raw/photos/` | **252 MB** | 52 client JPGs | **Decision needed** — see below |

Current `.git` is 97 MB. Adding everything takes the repo to roughly **450 MB**. Under
GitHub's 1 GB soft warning, but most of it is one folder. No single file exceeds
GitHub's 100 MB hard limit (largest is 10 MB).

### BLOCKER: a live Google API key is in the raw archives

Four files contain the **same** Google Maps browser key (`AIzaSyCmL1…`):

```
sites/gilroy-roofing/raw/home.json
sites/royal-roofing-systems/raw/homepage.json
sites/springlake-pools-masonry/raw/homepage.json
sites/springlake-pools-masonry/raw/contact.json
```

It is scraped from the clients' own public page HTML, so it is already public — but that
does **not** make committing it safe. GitHub secret scanning will detect it and notify
Google, and Google may auto-revoke it. That would **break the map on a paying client's live
website**, caused by our backup job. Not acceptable.

Scrub before the first commit:

```bash
cd "/Users/marcellusm/Claude Projects/mla-agents/ai-website-builder" && grep -rlE 'AIza[0-9A-Za-z_-]{35}' sites/*/raw | xargs sed -i '' -E 's/AIza[0-9A-Za-z_-]{35}/REDACTED_GOOGLE_API_KEY/g'
```

Then confirm zero matches remain:

```bash
cd "/Users/marcellusm/Claude Projects/mla-agents/ai-website-builder" && grep -rcE 'AIza[0-9A-Za-z_-]{35}' sites/*/raw | grep -v ':0' || echo "clean — no keys remain"
```

Re-run that check whenever a new client is scraped. Better: add it as a guard inside
`daily-backup.sh` so the job refuses to commit if a key pattern appears.

### Decision: the 252 MB of h4 photos

`sites/h4-roofing-construction/raw/photos/` holds 52 original client JPGs. The site's
`public/` already tracks 38 of them at 12 MB total — i.e. the tracked copies were resized,
and these are the untouched originals.

They came from the client's own website, so they are re-downloadable. Committing them puts
252 MB into history forever for one client. **Recommend excluding them** and keeping the
rest of `raw/`:

```gitignore
sites/*/raw/photos/
```

If the originals genuinely matter, they belong in object storage or a Drive folder, not in
git.

### Recommended `.gitignore` change

Remove the `sites/*/raw/` and `screenshots/` lines, and replace with:

```gitignore
# Screenshots and scrape archives ARE backed up — they are before/after marketing
# assets and QC records. Only the bulk photo originals are excluded.
sites/*/raw/photos/
```

### Worth doing: shrink the screenshots

93 MB for 38 PNGs is ~2.4 MB each, and git stores binaries whole — re-screenshotting the
same client stores another full copy forever, so this grows fast. Converting to WebP at
quality 80 typically cuts it 80–90%, to roughly 10–15 MB, with no visible loss for
marketing use:

```bash
cd "/Users/marcellusm/Claude Projects/mla-agents/ai-website-builder" && /opt/homebrew/bin/brew install webp
```

Do this **before** the first commit if you're going to do it at all — converting after
means both formats live in history.

---

## Extending to the monorepo

`/Users/marcellusm/Claude Projects` (remote: `mylocalads/claude-projects`) has the same
exposure and holds every other project. The script already takes a repo path, so:

1. Copy the plist to `com.mylocalads.claudeprojects.backup.plist`
2. Change `Label`, the second `ProgramArguments` string to `/Users/marcellusm/Claude Projects`,
   and the schedule (use `19:00` so the two don't contend)
3. Bootstrap it the same way

Note that repo sets `core.sshCommand` locally too, so SSH will work.

---

## Open decisions for Marcellus

1. **Time of day** — 18:30 assumed. Pick something the Mac is reliably awake for.
2. **Off-machine alerting** — do you want a dead-man's-switch, or is a local notification
   enough? Given these are paid client sites, a local-only alert on the same machine that
   holds the only copy is a thin guarantee.
3. **The 252 MB of h4 photo originals** — exclude (recommended) or commit? Only genuine
   size question left.
4. **Convert screenshots to WebP before first commit?** Saves ~80 MB of permanent history.
   Decide before committing, not after.
