---
name: find-business
description: Find a specific business on Google Maps via Apify and extract structured contact/profile data including reviews.
trigger: "find-business" or "find business" or "lookup business"
---

# Find Business Skill

## What This Skill Does

Find a specific business on Google Maps using the Apify Google Maps scraper. Extracts structured contact and profile data including name, address, phone, email, website, rating, category, hours, and up to 5 Google reviews (for use as testimonials on the redesigned site). Saves the result as `business_profile.json` in the project's `sites/{slug}/` directory.

## How to Invoke

- `/find-business Joe's Plumbing in Austin TX`
- `/find-business "Sunrise Bakery" in Portland OR --country us`
- `/find-business` (auto-triggered from pipeline after `scrape-content` when a URL was provided first)

When triggered automatically from the URL-first flow, the business name is extracted from the previously scraped content.

## What the Agent Does

Follow these steps exactly, in order.

### Step 0 — Read APIFY_TOKEN

Read the `.env` file in the project root and extract `APIFY_TOKEN`.

If `.env` does not exist or `APIFY_TOKEN` is not set, **stop immediately** and tell the user:

> "I need an Apify API token to search Google Maps. Please add `APIFY_TOKEN=your_token_here` to the `.env` file in the project root and try again."

Do not proceed without a valid token.

### Step 1 — Parse the Input

- **Direct invocation** (e.g., `/find-business Joe's Plumbing in Austin TX`): Split the input into a **search query** (the business name) and a **location** (the city/region). The word "in" is the delimiter. Everything before "in" is the business name; everything after is the location.
- **URL-first flow** (no explicit business name given): Open `scraped_content.json` from the most recent scrape-content run. Extract the business name from the `headline` or `pageTitle` field. If the scraped content includes an address or city, use that as the location.
- **No location provided**: If only a business name is given with no location, ask the user: "What city or region is this business in? I need a location to narrow the Google Maps search."
- **Country code**: If the user includes `--country XX` (e.g., `--country gb`), use that as the `countryCode`. Otherwise, infer the country from the city name (e.g., Austin TX -> `us`, London -> `gb`, Toronto ON -> `ca`). Default to `us` if unclear.

### Step 2 — Cost Approval

Before making any API call, tell the user:

> "I'm about to search Google Maps for **[business name]** in **[location]**, which will cost approximately **$0.004**. OK to proceed?"

Wait for explicit approval (e.g., "yes", "go ahead", "ok"). **Never proceed without it.**

### Step 3 — Check for Previous Runs

Before paying for a new scrape, check if `sites/{slug}/business_profile.json` already exists (where `{slug}` is derived from the business name per Step 9).

If the file exists and contains usable data, tell the user:

> "I found an existing business profile for [name] saved on [date]. Do you want to reuse this data or run a fresh Google Maps lookup?"

If the user wants to reuse it, skip to Step 12 and report the existing data.

### Step 4 — Start an Apify Run

Use `WebFetch` to POST to:

```
https://api.apify.com/v2/acts/lukaskrivka~google-maps-with-contact-details/runs?token={APIFY_TOKEN}
```

With JSON body:

```json
{
  "searchStringsArray": ["{business name only}"],
  "locationQuery": "{location only}",
  "countryCode": "{country code, e.g. us}",
  "maxCrawledPlacesPerSearch": 5,
  "language": "en",
  "maxImages": 0,
  "maxReviews": 5
}
```

Key details:
- `searchStringsArray` takes the business name only (not the location).
- `locationQuery` takes the city/region only.
- `maxCrawledPlacesPerSearch` is 5 to get enough candidates for disambiguation.
- `maxReviews` is 5 to capture Google reviews for use as testimonials.
- `maxImages` is 0 because we use Unsplash for imagery instead.

Save the `runId` and `defaultDatasetId` from the response.

### Step 5 — Poll for Completion

Every **8 seconds**, GET:

```
https://api.apify.com/v2/actor-runs/{runId}?token={APIFY_TOKEN}
```

Check the `status` field:
- `SUCCEEDED` — proceed to Step 6.
- `RUNNING` or `READY` — wait 8 seconds and poll again.
- `FAILED`, `ABORTED`, or `TIMED-OUT` — stop and tell the user the error. Include the status and any error message from the response.

Do not poll more than 30 times (4 minutes). If it hasn't completed by then, tell the user the run is taking too long and provide the Apify console URL for manual checking.

### Step 6 — Download Results

GET:

```
https://api.apify.com/v2/datasets/{defaultDatasetId}/items?token={APIFY_TOKEN}&format=json&clean=true
```

Parse the JSON array of results. If the array is empty, tell the user:

> "No results found for [business name] in [location]. Please check the spelling and try again, or try a broader location."

### Step 7 — Ambiguity Handling

If **multiple results** are returned, **always** present a numbered list to the user. Never auto-select, even if one looks like an obvious match.

Format:

```
Found [N] matches:

1. Joe's Plumbing — 1234 Main St, Austin TX — 4.7 (89 reviews)
2. Joe's Plumbing & HVAC — 5678 Oak Ave, Austin TX — 4.2 (34 reviews)
3. Joe's Master Plumbing — 910 Elm St, Round Rock TX — 4.9 (156 reviews)

Which one is the right business?
```

Wait for the user to pick a number before continuing.

If **exactly one result** is returned, confirm it with the user:

> "I found **[name]** at **[address]** — [rating] ([reviewCount] reviews). Is this the right business?"

Only proceed after confirmation.

### Step 8 — Field Mapping

Map the confirmed Apify result to the output schema:

| Apify Field | Output Field | Notes |
|---|---|---|
| `title` | `name` | Business name as listed on Google Maps |
| `emails[0]` | `email` | First email, may be `null` |
| `phones[0]` | `phone` | First phone number, may be `null` |
| `website` | `website` | May be `null` (see Step 11) |
| `address` | `address` | Full street address |
| `totalScore` | `rating` | Google Maps star rating (e.g., 4.7) |
| `reviewsCount` | `reviewCount` | Total number of reviews |
| `categoryName` | `category` | Primary business category (e.g., "Plumber") |
| `openingHours` | `hours` | Format as a readable string like "Mon-Fri 8am-6pm, Sat 9am-2pm" |
| `reviews` | `reviews` | Array of up to 5 reviews (see below) |

For each review in the `reviews` array, extract:
- `text` — the review text (trim to first 200 characters if very long)
- `author` — the reviewer's display name
- `rating` — the reviewer's star rating (1-5)

Skip reviews that have no text content.

### Step 9 — Generate Slug

Create a URL-safe slug from the confirmed business name:

1. Convert to lowercase.
2. Remove apostrophes and special characters (keep letters, numbers, spaces).
3. Replace spaces with hyphens.
4. Collapse multiple hyphens into one.

Examples:
- `Joe's Plumbing` -> `joes-plumbing`
- `Dr. Smith & Associates` -> `dr-smith-associates`
- `The 123 Cafe!` -> `the-123-cafe`

### Step 10 — Create Output Directory and Save

Create the directory `sites/{slug}/` if it doesn't already exist.

Save the mapped data to `sites/{slug}/business_profile.json`:

```json
{
  "name": "Joe's Plumbing",
  "email": "joe@joesplumbing.com",
  "phone": "+1-512-555-0123",
  "address": "1234 Main St, Austin, TX 78701",
  "website": "https://joesplumbing.com",
  "rating": 4.7,
  "reviewCount": 89,
  "category": "Plumber",
  "hours": "Mon-Fri 8am-6pm",
  "slug": "joes-plumbing",
  "reviews": [
    { "text": "Joe was on time and fixed our leak fast.", "author": "Sarah M.", "rating": 5 },
    { "text": "Fair pricing, great work.", "author": "Mike R.", "rating": 5 }
  ]
}
```

Use `null` for any fields that were not available in the Apify response. Do not omit fields; always include them with `null` if empty.

### Step 11 — No-Website Edge Case

If the selected business has no `website` field (null or empty), inform the user:

> "This business doesn't have a website listed on Google Maps. I'll skip the website scrape and site audit, and proceed with local research only. The redesigned site will use Maps data + local research + Unsplash imagery."

Set `website` to `null` in the saved JSON. The pipeline should skip the `scrape-content` and `site-audit` skills when no website is present.

### Step 12 — Report Back

Display the business details in a clear summary:

```
Business Profile Saved

Name:        Joe's Plumbing
Address:     1234 Main St, Austin, TX 78701
Phone:       +1-512-555-0123
Email:       joe@joesplumbing.com
Website:     https://joesplumbing.com
Rating:      4.7 (89 reviews)
Category:    Plumber
Hours:       Mon-Fri 8am-6pm

Reviews:     5 saved for testimonial use
Output:      sites/joes-plumbing/business_profile.json
```

If any fields are null, show "Not listed" instead.

## Cost

- **~$0.004 per lookup** (5 places at $4 per 1,000 results).
- Always state the cost and ask for approval before running the Apify actor.
- If the user runs this skill multiple times for the same business, remind them about the existing `business_profile.json` to avoid unnecessary charges.
