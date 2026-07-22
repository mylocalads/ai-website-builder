---
name: scrape-content
description: Extract rich content from a business website using Playwright for multi-page crawling, with Firecrawl as fallback for JS-heavy sites.
trigger: "scrape-content" or "scrape website" or "extract content"
---

# Scrape Content

## What This Skill Does

Extracts rich content from a business's website by crawling up to 5 internal pages. Captured content includes services, about text, testimonials, photos, social links, and calls-to-action. Uses Playwright (headless Chromium) as the primary scraping method and falls back to Firecrawl MCP for JS-heavy sites that Playwright cannot fully render.

## How to Invoke

- `/scrape-content https://joesplumbing.com` — scrape a specific URL directly.
- `/scrape-content` — automatically reads the website URL from `sites/{slug}/business_profile.json` (use this when running in the pipeline after `find-business`).

## What the Agent Does

### Step 0: Determine the URL and Slug

1. **If a URL is provided directly** (as an argument or by the user):
   - Use that URL as the scrape target.
   - If no slug context exists yet (URL-first flow), generate a temporary slug from the domain name: strip `www.`, strip the TLD, and lowercase. Example: `joesplumbing.com` becomes `joesplumbing`.
2. **If running after find-business** (no URL argument):
   - Read `sites/{slug}/business_profile.json` and use the `website` field as the scrape target.
   - Reuse the existing slug from that file.
3. Create the `sites/{slug}/` directory if it does not already exist.

### Step 1: Write and Execute an Inline Playwright Scraping Script

Write a temporary Node.js script (e.g., `/tmp/scrape-content-{slug}.js`) and run it with `node`. The script must do the following:

a. **Launch headless Chromium** via Playwright (follow the same browser-launch pattern used in `screenshot.js`).

b. **Load the homepage** with a realistic user-agent string (e.g., a recent Chrome on macOS UA).

c. **Extract all internal navigation links** from the homepage. Only keep links on the same domain (or `www.` variant). Ignore external links, anchors (`#`), `mailto:`, and `tel:` links.

d. **Prioritize links** by matching URL path segments or visible link text against these patterns, in order:
   1. Home / main page (already loaded — no extra request needed)
   2. About, About Us, Our Story, Who We Are
   3. Services, What We Do, Our Work
   4. Contact, Contact Us, Get in Touch
   5. Testimonials, Reviews, What Clients Say

e. **Visit up to 5 pages total** (the homepage plus up to 4 prioritized internal pages). If fewer than 4 internal links match the priority patterns, visit whatever internal links are available up to the cap.

f. **For each page visited**, extract:
   - All heading text (`h1` through `h6`), tagged by level
   - All paragraph text (`p` elements)
   - All list items (`li` elements)
   - All image URLs (`img[src]` attributes, resolved to absolute URLs)
   - All link URLs (`a[href]` attributes, resolved to absolute URLs) for social media detection
   - Any structured data present in `<script type="application/ld+json">` tags (parse the JSON)

g. **Handle timeouts gracefully.** If any page takes longer than 15 seconds to load, skip it and record the URL as a failed page in the output.

h. **Output all extracted content as JSON to stdout.** Structure it as an array of page objects, each containing `{ url, headings, paragraphs, listItems, images, links, structuredData }`.

i. **Close the browser** and clean up.

Run the script:
```bash
node /tmp/scrape-content-{slug}.js
```

Capture stdout as the raw extraction result.

### Step 2: Parse and Structure the Extracted Content

From the raw extraction JSON, synthesize the following fields:

- **`headline`** — The main `h1` (or most prominent heading) from the homepage.
- **`about`** — Text content from the about page, or from an about-like section on the homepage if no dedicated about page was found.
- **`services`** — A list of services. Look on the services page first; fall back to homepage sections that list services. Extract individual service names as an array of strings.
- **`testimonials`** — Any review or testimonial quotes found. Look for quote patterns, blockquote elements, or testimonial sections. Each entry should have `text` and `author` (author may be null if not attributed).
- **`photos`** — An array of absolute image URLs found across all pages. Filter out likely icons, spacer images, and tracking pixels: only keep images whose filenames or context suggest they are content images (not SVG icons, not images with dimensions likely under 100px). Deduplicate.
- **`social_links`** — Detect links to Facebook, Instagram, Twitter/X, LinkedIn, YouTube, and Yelp. Store as an object with platform keys and URL values. Set to `null` for platforms not found.
- **`pricing`** — Any pricing information found (dollar amounts, pricing tables, rate mentions). Often `null`.
- **`cta_text`** — The primary call-to-action button text found on the homepage (e.g., "Call Now", "Get a Free Quote", "Schedule Service").

### Step 3: Check Content Quality

Count the total words across all extracted text (headings + paragraphs + list items). If the total is fewer than **100 words**, classify this as **thin content** and proceed to Step 4.

If content is 100 words or more, skip to Step 5.

### Step 4: Firecrawl Fallback (Thin Content Only)

If the Playwright extraction yielded thin content:

1. **Warn the user:**
   > "Playwright didn't capture enough content (only [X] words). This likely means the site uses heavy JavaScript rendering. Firecrawl may have usage costs depending on your plan. OK to try Firecrawl?"

2. **Wait for the user's approval** before proceeding.

3. **If approved:**
   - Use the Firecrawl MCP tool (`firecrawl:firecrawl-cli`) to scrape the target URL.
   - Firecrawl returns clean markdown. Parse that markdown into the same structured JSON schema described in Step 2.
   - Set `scrape_method` to `"firecrawl"` in the output.

4. **If Firecrawl is unavailable or the user declines:**
   - Proceed with whatever content Playwright captured.
   - Set `scrape_method` to `"playwright"`.
   - Note the thin content in the summary report.

### Step 5: Save Output

Save the structured result to `sites/{slug}/scraped_content.json`:

```json
{
  "slug": "joes-plumbing",
  "website": "https://joesplumbing.com",
  "pages_scraped": 4,
  "content": {
    "headline": "Austin's Trusted Plumber Since 1998",
    "about": "Family-owned plumbing company serving...",
    "services": [
      "Emergency Repairs",
      "Water Heater Installation",
      "Drain Cleaning"
    ],
    "testimonials": [
      { "text": "Joe saved us from a flooded basement...", "author": "Sarah M." }
    ],
    "photos": ["https://joesplumbing.com/images/team.jpg"],
    "social_links": {
      "facebook": "https://facebook.com/joesplumbing",
      "instagram": null,
      "twitter": null,
      "linkedin": null,
      "youtube": null,
      "yelp": null
    },
    "pricing": null,
    "cta_text": "Call Now for a Free Estimate"
  },
  "scrape_method": "playwright"
}
```

### Step 6: Report Back

Show the user a summary including:

- Number of pages successfully scraped (and any that failed/timed out)
- The headline found
- Number of services extracted
- Number of testimonials found
- Number of photos captured
- Social links detected
- Scrape method used (Playwright or Firecrawl)
- Any content gaps, explicitly called out. Examples:
  - "No testimonials found on website"
  - "No pricing information detected"
  - "No social media links found"
  - "About section is thin — only one sentence captured"

## Cost

- **Playwright (primary):** Free. Runs locally using headless Chromium.
- **Firecrawl (fallback):** May incur costs depending on the user's Firecrawl plan. The agent always asks for approval before using Firecrawl.

## Notes

- Playwright launches headless Chromium with no visible browser window.
- Some sites built with heavy JS frameworks (React, Angular, Vue SPA) may not render meaningful content for Playwright's DOM extraction. This is the primary reason the Firecrawl fallback exists.
- The scraping script sets a 15-second timeout per page. Pages exceeding this are skipped and noted in the output.
- The agent should delete the temporary script file after execution completes.
- Image filtering is best-effort. The goal is to capture real content photos (team photos, project images, hero banners) and exclude tiny UI elements (favicons, 1x1 tracking pixels, bullet icons).
