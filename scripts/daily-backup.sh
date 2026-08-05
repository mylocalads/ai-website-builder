#!/bin/bash
# Unattended git backup for a repo of paid client work.
# See docs/plans/2026-08-04-daily-backup-handoff.md
#
#   usage: daily-backup.sh /absolute/path/to/repo
#
# Exits non-zero AND raises a macOS notification on failure. A backup that fails
# silently is the exact failure mode this exists to prevent, so every guard below
# is loud rather than clever.

set -uo pipefail

REPO="${1:?usage: daily-backup.sh /path/to/repo}"
NAME="$(basename "$REPO")"
LOG="$HOME/Library/Logs/git-daily-backup.log"
STAMP="$REPO/.git/last-successful-backup"
LOCK="$REPO/.git/daily-backup.lock"

MAX_ADD_MB=300   # abort if a single run would add more than this
STALE_DAYS=2     # shout if the last success is older than this

export PATH="/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

mkdir -p "$(dirname "$LOG")"
log()    { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$NAME] $*" >> "$LOG"; }
notify() { osascript -e "display notification \"$1\" with title \"Backup FAILED: $NAME\" sound name \"Basso\"" 2>/dev/null || true; }
die()    { log "FAIL: $*"; notify "$*"; exit 1; }

cd "$REPO" || die "repo not found: $REPO"

# --- lock (flock is NOT installed on this Mac; mkdir is atomic everywhere) ----
if ! mkdir "$LOCK" 2>/dev/null; then
  if [ -f "$LOCK/pid" ] && ! kill -0 "$(cat "$LOCK/pid")" 2>/dev/null; then
    log "clearing stale lock"; rm -rf "$LOCK"
    mkdir "$LOCK" 2>/dev/null || { log "could not lock, skipping"; exit 0; }
  else
    log "another run in progress, skipping"; exit 0
  fi
fi
echo $$ > "$LOCK/pid"
trap 'rm -rf "$LOCK"' EXIT

log "starting"

# --- guard: never auto-commit mid-rebase/merge -------------------------------
if [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ] || [ -f .git/MERGE_HEAD ]; then
  die "rebase or merge in progress — refusing to auto-commit"
fi

# --- self-heal: convert any new screenshot PNG to WebP ------------------------
# site-audit writes PNGs. .gitignore excludes screenshots/*.png so they never
# reach git, but without this step new screenshots would simply never be backed
# up at all — silently. Convert first, then they get picked up as .webp.
if [ -d screenshots ] && command -v cwebp >/dev/null 2>&1; then
  for png in screenshots/*.png; do
    [ -e "$png" ] || continue
    webp="${png%.png}.webp"
    if [ ! -f "$webp" ]; then
      if cwebp -q 80 -quiet "$png" -o "$webp" 2>/dev/null && [ -s "$webp" ]; then
        log "converted $(basename "$png") -> webp"
      else
        log "WARN: cwebp failed on $png (left as png, will not be backed up)"
      fi
    fi
  done
fi

# --- guard: refuse to commit a live API key ----------------------------------
# Scrape archives under sites/*/raw/ are pulled from clients' public HTML and
# have carried live keys. GitHub secret scanning would notify the vendor and can
# get a PAYING CLIENT's key revoked, breaking their site.
if git status --porcelain | grep -qE '^\?\?|^ ?M'; then
  if grep -rqE 'AIza[0-9A-Za-z_-]{35}|sk-[A-Za-z0-9]{20,}|apify_api_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}' \
       --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null; then
    die "an API key pattern is present in the working tree — refusing to commit. Scrub it first."
  fi
fi

# --- guard: size of what we are about to add ---------------------------------
ADD_KB=$(git add -A --dry-run 2>/dev/null \
  | sed -E "s/^(add|remove) '//;s/'$//" \
  | while IFS= read -r f; do [ -f "$f" ] && du -k "$f" 2>/dev/null | cut -f1; done \
  | awk '{s+=$1} END {print s+0}')
ADD_MB=$(( ADD_KB / 1024 ))
if [ "$ADD_MB" -gt "$MAX_ADD_MB" ]; then
  die "would add ${ADD_MB}MB (limit ${MAX_ADD_MB}MB) — check for an unignored dist/ or node_modules/"
fi

# --- commit ------------------------------------------------------------------
if [ -n "$(git status --porcelain)" ]; then
  git add -A                                                   || die "git add failed"
  git commit -q -m "chore: automatic backup $(date '+%Y-%m-%d %H:%M')" || die "git commit failed"
  log "committed (~${ADD_MB}MB of changes)"
else
  log "no local changes"
fi

# --- push --------------------------------------------------------------------
UNPUSHED=$(git rev-list --count @{u}..HEAD 2>/dev/null) \
  || die "no upstream configured — run: git push -u origin master"

if [ "$UNPUSHED" -gt 0 ]; then
  if ! git push -q origin HEAD 2>>"$LOG"; then
    log "push failed, retrying in 30s"
    sleep 30
    git push -q origin HEAD 2>>"$LOG" || die "push failed twice — $UNPUSHED commit(s) NOT backed up"
  fi
  log "pushed $UNPUSHED commit(s)"
else
  log "already in sync"
fi

# --- verify the remote genuinely matches before claiming success -------------
git fetch -q origin 2>>"$LOG"
[ "$(git rev-parse HEAD)" = "$(git rev-parse @{u})" ] \
  || die "local and remote still differ after push"

date '+%s' > "$STAMP"
log "SUCCESS — remote at $(git rev-parse --short HEAD)"

# --- staleness self-check ----------------------------------------------------
AGE_DAYS=$(( ( $(date '+%s') - $(cat "$STAMP") ) / 86400 ))
[ "$AGE_DAYS" -gt "$STALE_DAYS" ] && notify "Last successful backup was ${AGE_DAYS} days ago"

exit 0
