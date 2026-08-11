# The runner droplet

The machine that actually builds client sites. n8n orchestrates, the portal
queues the work, and this box runs the pipeline.

## Why it exists

n8n Cloud, Make.com and Vercel are managed services: they run *your workflow*,
not arbitrary programs. This pipeline scaffolds an Astro project, runs
`npm install`, `npm run build`, `vercel deploy` and `gcloud dns` — that needs a
real filesystem and a shell. No orchestrator can provide one, so a box does.

## How to reach it

| | |
|---|---|
| Host | `165.227.84.34` |
| User | `runner` (not root — see below) |
| SSH key | `~/.ssh/id_ed25519_mla_runner` on the Mac |
| Provider | DigitalOcean, Ubuntu 24.04 LTS, 2 GB RAM + 2 GB swap |

```bash
ssh -i ~/.ssh/id_ed25519_mla_runner runner@165.227.84.34
```

**The key is dedicated to this box.** Its private half is pasted into n8n, so it
must not be a key that opens anything else — if the n8n account were ever
compromised, this key should be worth exactly one droplet and nothing more. For
the same reason the box logs in as `runner`, not `root`.

## Where the credentials live

**`/home/runner/ai-website-builder/.env`** — the repo's own convention, sitting
next to `.env.example`, and already covered by `.gitignore` line 2. Permissions
are `600`.

This is a **second copy** of what the Mac keeps at `~/Claude Projects/.env`. A
separate machine needs its own; nothing syncs them. When a token is rotated it
has to be changed in both places.

| Key | Where the value comes from |
|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | `claude setup-token`, run **on this box** |
| `VERCEL_TOKEN` | Same value as the Mac's `.env` |
| `APIFY_TOKEN` | Same value as the Mac's `.env` |
| `SHORTIO_API_KEY` | Same value as the Mac's `.env` — optional |
| `MLA_DNS_ZONE` | Cloud DNS zone name holding `mylocalads.co` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to the service-account JSON on this box |

### Adding or changing a key

```bash
ssh -i ~/.ssh/id_ed25519_mla_runner runner@165.227.84.34
nano ~/ai-website-builder/.env
# edit, then Ctrl+O, Enter, Ctrl+X
exit
```

`nano` rather than a shell one-liner on purpose: you can see what you pasted. A
token truncated by a bad copy is the most common failure here, and it surfaces
later as a `401` that looks like an account problem rather than a paste problem.

### Why `.bashrc` is not used

n8n's SSH node opens a **non-interactive** shell, and Ubuntu's `.bashrc` returns
early for those. Anything exported there would work when a human logs in and be
invisible to n8n — the worst kind of difference. The command n8n runs sources
this file explicitly instead:

```bash
set -a; . ~/ai-website-builder/.env; set +a
```

## What is installed

Node 22, Claude Code, the Vercel CLI, the Google Cloud CLI, and git. The repo is
cloned at `~/ai-website-builder`, kept current with `git pull`, and reads GitHub
through a **read-only deploy key** — the box can never push.

The 2 GB swap file is not optional. On 2 GB of RAM, `npm install` and an Astro
build get OOM-killed without it, unattended, with nothing in the logs that
explains why.

## Verifying it works

```bash
ssh -i ~/.ssh/id_ed25519_mla_runner runner@165.227.84.34 \
  'set -a; . ~/ai-website-builder/.env; set +a; claude -p "Reply with exactly: RUNNER_OK"'
```

`RUNNER_OK` means the box can run the agent headlessly. Anything else means the
token is wrong, truncated, or expired — start there before suspecting the
pipeline.
