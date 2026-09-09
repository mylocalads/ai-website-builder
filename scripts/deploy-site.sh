#!/usr/bin/env bash
#
# Deploy one site to production, in the only order that is safe.
#
#   ./scripts/deploy-site.sh firefly-cd
#   ./scripts/deploy-site.sh firefly-cd --check    # say what it would do, change nothing
#
# ============================ WHY THIS EXISTS ================================
#
# No Vercel project in this account is connected to a git repository. A deploy
# is therefore a WHOLE-FOLDER UPLOAD from whichever machine ran it, and the last
# deploy wins outright — it does not merge, and it does not warn.
#
# On 2026-09-09 that cost a client's live site a month of work. The portal's
# edit agent rebuilt firefly-cd from a checkout of this repo that was 29 days
# old, applied one text change and published the lot: three services deleted on
# 4 September came back, and the attic-insulation service added on 8 September
# disappeared. The agent was not careless — it used the best source it had. The
# 8 September work had been deployed straight from a laptop and never committed,
# so the repo it pulled genuinely did not contain it.
#
# THE FIX IS AN ORDER, NOT A TOOL: commit and push FIRST, deploy SECOND. Then
# git always holds at least what production holds, and a stale copy is refused
# by `git push` instead of silently overwriting a colleague's work.
#
# This script enforces that order so nobody has to remember it.
#
# ============================ WHAT IT REFUSES ================================
#
#   - a dirty working tree for this site      -> commit it first
#   - local commits not yet pushed            -> push them first
#   - a branch behind its remote              -> pull first, or you are about to
#                                                deploy without a colleague's work
#   - a failing build                         -> never publish something unbuilt
#
# Every refusal names the command that clears it.
set -euo pipefail

SLUG="${1:-}"
MODE="${2:-}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE="sites/$SLUG"

die() { printf '\n  REFUSED: %s\n\n' "$1" >&2; exit 1; }
step() { printf '\n== %s\n' "$1"; }

[ -n "$SLUG" ] || die "no site given.  usage: ./scripts/deploy-site.sh <slug> [--check]"
cd "$REPO_ROOT"
[ -d "$SITE" ] || die "no such site: $SITE"

step "1/5  is this site's work committed?"
if [ -n "$(git status --porcelain -- "$SITE")" ]; then
  git status --short -- "$SITE" | head -20
  die "$SITE has uncommitted changes.
           Commit them:  git add $SITE && git commit
           They must be in git BEFORE they are in production, or the next
           agent run rebuilds from a repo that has never seen them."
fi
echo "   clean."

step "2/5  is the branch level with its remote?"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
git fetch --quiet origin "$BRANCH" || die "could not reach origin. Fix the network or your SSH key first."
BEHIND="$(git rev-list --count "HEAD..origin/$BRANCH")"
AHEAD="$(git rev-list --count "origin/$BRANCH..HEAD")"

# BEHIND IS THE DANGEROUS ONE, and it is the shape of the 2026-09-09 incident:
# your folder is missing commits that are in the repo, so deploying it publishes
# a site without them.
[ "$BEHIND" = "0" ] || die "your branch is $BEHIND commit(s) BEHIND origin/$BRANCH.
           Deploying now would publish a site missing that work — this is
           exactly what broke firefly-cd on 2026-09-09.
           Fix:  git pull --rebase   (then re-run this script)"

if [ "$AHEAD" != "0" ]; then
  echo "   $AHEAD commit(s) to push."
  [ "$MODE" = "--check" ] || git push
else
  echo "   level."
fi

step "3/5  does it build?"
if [ "$MODE" = "--check" ]; then
  echo "   skipped (--check)."
else
  ( cd "$SITE" && npm run build >/tmp/deploy-$SLUG-build.log 2>&1 ) \
    || { tail -20 "/tmp/deploy-$SLUG-build.log"; die "the build failed. Nothing was deployed."; }
  echo "   built."
fi

step "4/5  deploy to production"
if [ "$MODE" = "--check" ]; then
  echo "   would run: vercel deploy --prod  (in $SITE)"
  printf '\n  --check only. Nothing was pushed, built or deployed.\n\n'
  exit 0
fi
( cd "$SITE" && npx vercel deploy --prod --yes )

step "5/5  done"
cat <<NOTE

  Git and production now hold the same content for $SLUG.

  If someone reports the site "went back in time" after this, the cause is
  almost always a deploy that skipped step 1. Check:

      git log -1 --format='%h %ad %s' --date=short -- $SITE

  against the deployment time in the Vercel dashboard.

NOTE
