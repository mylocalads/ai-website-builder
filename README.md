# Website Builder Kit

**Give it a business. Get back a live, redesigned website.**

A 6-skill pipeline that runs inside Claude Code. Point it at a business name or URL, and it researches the business from multiple angles, redesigns their website with a bold home service theme, and deploys it live to Vercel — ready to use as proof-of-work in outreach.

---

## Setup

### Step 1: Determine your environment

- **Claude Code** — you are running inside a terminal/IDE and have a working directory. You auto-load `CLAUDE.md` files.

If you are none of the above, tell the user what environment you are and ask how to proceed.

### Step 2: Read the docs

Before installing anything, read these two files completely:

- **CLAUDE.md** — Your operating rules for this kit. Covers the 6 skills, cost rules, key behaviors, design theme, and file conventions.
- **.agent/workflows/website-builder.md** — The pipeline workflow. Defines dynamic step ordering (URL-first vs name-first), what to show at each pause, and the final output format.

These contain critical rules about cost approvals and default behaviors. Do not skip them.

### Step 3: Install into your environment

**If you are Claude Code:**

1. Place the kit folder in your working directory and `cd` into it.
2. `CLAUDE.md` auto-loads. Skills and workflows auto-load from `.agent/`. You're ready.

The kit includes a wrapper skill (`website-builder/SKILL.md`) that loads the operating rules and workflow when triggered. The 6 sub-skills (`find-business`, `scrape-content`, `local-research`, `site-audit`, `site-redesign`, `vercel-deploy`) are also available and can be used independently.

### Step 4: Install dependencies

The kit requires **Node.js 18+**, **Playwright with Chromium**, and the **Vercel CLI**. Install them from inside the kit folder. On Linux, also install Playwright's system-level dependencies for Chromium. If anything fails, stop and tell the user the exact error.

### Step 5: Configure API keys

Copy `.env.example` to `.env`, then ask the user for:

1. **APIFY_TOKEN** (required) — "I need your Apify API token. You can find it at apify.com > Settings > Integrations."
2. **VERCEL_TOKEN** (only for remote/SSH setups) — "Are you on a local machine or a remote server? If remote, I'll need a Vercel token from vercel.com/account/tokens."

If the user says local, skip the Vercel token and run `vercel login` instead. Never expose these keys.

### Step 6: Verify and confirm

Confirm that Node.js, Playwright, and the Vercel CLI are all installed and working. If everything checks out, tell the user:

"Setup complete. The Website Builder kit is installed. I now have 6 skills: find-business, scrape-content, local-research, site-audit, site-redesign, and vercel-deploy. These chain together as a pipeline to research a business, redesign their website, and deploy it live. What business would you like me to build a site for?"

If anything failed, tell the user exactly what went wrong.

---

## How It Works

The pipeline runs 6 skills in sequence. The order of the first two steps depends on whether you provide a URL or a business name.

**URL provided:**
```
/scrape-content → /find-business → /local-research → /site-audit → /site-redesign → /vercel-deploy
```

**Business name provided:**
```
/find-business → /scrape-content → /local-research → /site-audit → /site-redesign → /vercel-deploy
```

| Skill | What It Does | Cost |
|-------|-------------|------|
| `/find-business` | Finds the business on Google Maps, extracts contact/profile data | ~$0.004 per lookup |
| `/scrape-content` | Extracts rich content from the business website (Playwright first, Firecrawl fallback) | Free (Firecrawl fallback may cost) |
| `/local-research` | Searches Reddit for local pain points and copy angles | Free |
| `/site-audit` | Screenshots the site, provides visual assessment of strengths/weaknesses | Free |
| `/site-redesign` | Generates a premium single-file HTML site using all gathered research | Free |
| `/vercel-deploy` | Deploys the site to Vercel, captures live URL | Free |

---

## Running the Pipeline

### Single business — by URL

```
Build site for joesplumbing.com
```

Starts with `/scrape-content` (URL is already known), then `/find-business` to get Maps data, then continues through the rest of the pipeline.

### Single business — by name

```
Build site for Joe's Plumbing in Austin TX
```

Starts with `/find-business` (need to look up the URL first), then `/scrape-content`, then continues through the rest of the pipeline.

### Batch input — multiple businesses

```
Build sites for these businesses:
- joesplumbing.com
- Mike's Roofing in Dallas TX
- acmehvac.net
```

Each business goes through the full pipeline sequentially, with pauses between steps.

### Automatic mode (no pauses)

Add `--auto` to skip the review pauses and run all 6 steps back-to-back:

```
Build site for Joe's Plumbing in Austin TX --auto
```

Only use this when you're confident in the pipeline.

---

## Running Skills Individually

You can run any skill on its own:

```
/find-business Joe's Plumbing in Austin TX
/scrape-content joesplumbing.com
/local-research plumber Austin TX
/site-audit joesplumbing.com
/site-redesign joes-plumbing
/vercel-deploy joes-plumbing
```

---

## Design Theme — Home Service Business

The design system has two directions based on the type of business:

| Craft Type | Theme Direction | Examples |
|-----------|----------------|---------|
| **Hands-on trades** | US patriotism, blue-collar pride, bold reds/whites/blues, strong typography, badge/shield motifs, "Built by American hands" energy | Roofers, HVAC, Plumbers, Electricians, Concrete, General Contractors |
| **Style-oriented services** | Premium craftsmanship, rich textures, before/after imagery, refined palettes, elegant but still bold | Home Builders, Kitchen Remodelers, Bathroom Remodelers, Landscapers |

Both directions share: strong CTAs, trust badges (licensed/insured/bonded), prominent phone number, hero images of real work, and a sense of local pride. Copy angles are driven by the `/local-research` step — what local customers actually care about shapes the headlines, hero text, and section order.

---

## Previewing Sites Before Deploy

**Local machine:** Open `sites/{slug}/index.html` directly in your browser.

**Remote / SSH setup:** Start a temporary web server:
```bash
cd sites && python3 -m http.server 8080 --bind 127.0.0.1
```
Then visit `http://localhost:8080/{slug}/` in your browser. VS Code Remote SSH will auto-forward the port.

---

## File Structure

```
website-builder-kit/
├── CLAUDE.md                              # Agent brain (auto-loaded in Claude Code)
├── README.md                              # This file
├── .env.example                           # API key template
├── package.json
├── .agent/
│   ├── workflows/
│   │   └── website-builder.md             # Pipeline workflow (dynamic ordering)
│   └── skills/
│       ├── website-builder/SKILL.md       # Wrapper skill (loads rules + workflow)
│       ├── find-business/SKILL.md         # Skill 1: Google Maps lookup
│       ├── scrape-content/SKILL.md        # Skill 2: Website content extraction
│       ├── local-research/SKILL.md        # Skill 3: Reddit local research
│       ├── site-audit/SKILL.md            # Skill 4: Screenshot + assessment
│       ├── site-redesign/SKILL.md         # Skill 5: Generate site
│       └── vercel-deploy/SKILL.md         # Skill 6: Deploy
├── scripts/
│   └── screenshot.js                      # Playwright screenshotter
├── screenshots/                           # Site screenshots
└── sites/
    ├── build-log.md                       # Tracks design combos + Vercel URLs
    └── {slug}/
        ├── business_profile.json          # Maps data
        ├── scraped_content.json           # Website content
        ├── local_research.json            # Reddit research
        ├── audit_results.json             # Screenshot + assessment
        └── index.html                     # Generated site
```

---

## Good Niches to Target

Home service businesses that care about reputation and have budget to pay for a website:

- Roofers
- HVAC technicians
- Plumbing contractors
- Electrical contractors
- General contractors
- Concrete contractors
- Kitchen remodelers
- Bathroom remodelers
- Home builders
- Landscapers
- Fence installers
- Garage door companies

**Avoid:** National chains, franchises, restaurants (razor-thin margins), lawyers (already have agencies), businesses with no online presence at all (hard to scrape content).

---

## Troubleshooting

**Screenshots fail or show blank pages:**
- Run `npx playwright install-deps chromium` to install system dependencies
- Some sites load content dynamically — the screenshot script handles this with scroll passes, but very slow sites may still appear incomplete

**Scrape returns no usable content:**
- Some sites are built entirely in JavaScript frameworks that Playwright struggles with
- The pipeline will automatically try Firecrawl as a fallback (may have costs depending on your plan)
- Sites behind Cloudflare protection or login walls cannot be scraped

**find-business returns the wrong business:**
- The pipeline pauses after this step so you can confirm the correct business was found
- If wrong, provide a more specific name or add the city/state

**Deploy fails with "no credentials":**
- Run `vercel login` (local) or add `VERCEL_TOKEN` to your `.env` (remote/SSH)

**Node.js errors about imports or parseArgs:**
- You need Node.js 18+. Check with `node --version`

**local-research finds nothing relevant:**
- Some niches or cities have minimal Reddit presence
- The redesign will still work using Maps data and scraped content — local research just adds extra copy angles

---

## FAQ

**Do I need an Anthropic API key?**
No. Claude does the research analysis, site audit, and redesign directly through conversation. No separate API calls.

**How much does it cost per business?**
About $0.004 for the Google Maps lookup (via Apify). Everything else is free unless the Firecrawl fallback is triggered for content scraping.

**How long does one business take?**
- Find business: ~30 seconds
- Scrape content: ~1 minute
- Local research: ~1 minute
- Site audit: ~1 minute
- Redesign: ~3 minutes
- Deploy: ~30 seconds
- **Total: ~7 minutes per business**

**Is Vercel really free?**
Yes. The Hobby plan is free and supports unlimited projects. Each site is one HTML file (~10-15 KB).

**What if the business has no website?**
The pipeline handles this. It skips the scrape and audit steps, and builds the site using Maps data, local research, and Unsplash imagery instead.

**Can I run this on multiple businesses at once?**
Yes. List them in one prompt and each will go through the full pipeline sequentially. The agent pauses between steps for each business by default.
