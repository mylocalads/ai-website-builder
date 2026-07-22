---
name: site-audit
description: Screenshot a business website using Playwright and provide a visual assessment of its design quality. Informational — not a gate. Useful for before/after storytelling.
trigger: "site-audit" or "audit site" or "assess website"
---

## What This Skill Does

Takes a full-page screenshot of the business website, then visually assesses the screenshot to produce a design audit report. This is informational — it does NOT filter leads. The audit informs the redesign and provides before/after storytelling for outreach.

## How to Invoke

- `/site-audit` — reads website URL from `sites/{slug}/business_profile.json`
- `/site-audit https://example.com` — audit a specific URL

## What the Agent Does

### 0. Dedup check

Read `sites/build-log.md`. If this business name or website URL already appears, skip it with a note: "Already audited and redesigned in a previous run."

### 1. Get the URL and slug

- If URL argument provided: use it, derive slug from `business_profile.json` or domain
- If no argument: read from `sites/{slug}/business_profile.json` -> `website` field

### 2. Take screenshot

```bash
node scripts/screenshot.js --url {url} --out screenshots/{slug}.png
```

The screenshot script handles:

- Headless Chromium launch
- Scrolling to trigger lazy-loaded content
- Full-page capture
- Fallback to viewport-only if full-page fails

### 3. Read the screenshot

Read the PNG image directly using vision capability.

### 4. Visual assessment

Assess the screenshot against these criteria. Frame findings as observations, not pass/fail:

| Signal | What to Look For |
|--------|-----------------|
| Visual design era | Table layouts, clip art, beveled buttons, tiled backgrounds, text drop shadows, gradients everywhere |
| Mobile responsiveness | Fixed-width layout, horizontal scrollbar, no viewport meta |
| Typography | Only one font, no contrast between headings and body, generic system fonts |
| Hero / CTA | No clear hero section, no button above the fold, wall of text |
| Layout quality | Cluttered, too many elements competing, no visual hierarchy |
| Imagery | Few/no photos, broken images, low-quality stock photos |
| Trust signals | http:// only, copyright pre-2020, "under construction", missing contact info |
| Template detection | Looks like default Wix, Squarespace, GlossGenius, Setmore theme |
| Navigation | Plain text links, no hover effects, basic rectangular buttons |
| Overall feel | Generic, no brand personality, no animations or polish |

Produce:

- `assessment` — 1-2 sentence summary of the site's current state
- `strengths` — array of things the site does well (be fair)
- `weaknesses` — array of design/UX problems found
- `overall` — one-line verdict (e.g., "Strong candidate for redesign — good content buried in poor presentation")

### 5. Handle errors

If the screenshot fails (timeout, SSL error, site down):

- Save audit with `assessment: "ERROR: Could not load website — [reason]"`
- Set `screenshotPath` to null
- Note the error but don't block the pipeline — site-redesign can still work from scraped content

### 6. Save output

Save to `sites/{slug}/audit_results.json`:

```json
{
  "slug": "joes-plumbing",
  "website": "https://joesplumbing.com",
  "screenshotPath": "screenshots/joes-plumbing.png",
  "assessment": "Outdated design with table layout, no mobile responsiveness, clip art graphics, copyright 2014. No clear CTA above the fold.",
  "strengths": ["Has all contact info visible", "Service list is comprehensive"],
  "weaknesses": ["Fixed-width layout", "No hero image", "Generic system fonts", "No testimonials displayed"],
  "overall": "Strong candidate for redesign — good content buried in poor presentation"
}
```

### 7. Report back

Show the screenshot (if possible) and the assessment. Present strengths and weaknesses as bullet lists. Ask: "Proceed to redesign?"

## Cost

Free. Runs locally using Playwright.

## Notes

- Playwright launches headless Chromium — no visible window
- Screenshots saved to `screenshots/{slug}.png`
- This step is skipped in the no-website edge case (when find-business returned no website URL)
