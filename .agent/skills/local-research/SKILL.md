---
name: local-research
description: Search Reddit for local discussions about the business's service category to extract customer pain points, values, and copy angles for the website redesign.
trigger: "local-research" or "research pain points" or "reddit research"
---

# Local Research Skill

## What This Skill Does

Searches Reddit for local conversations about the business's trade/category in their city. Extracts what customers complain about, what they value, and maps how the target business stands out. Produces copy angles that drive the website's hero messaging and content structure.

## How to Invoke

- `/local-research plumber in Austin TX` — standalone with category + location
- `/local-research` — auto-reads category and location from `sites/{slug}/business_profile.json`

## What the Agent Does

### Step 1: Gather Inputs

- Read `sites/{slug}/business_profile.json` for category, location (city from address), business name, rating, hours.
- Read `sites/{slug}/scraped_content.json` (if it exists) for services, testimonials, about text.
- If running standalone with arguments: parse category and city from the user input instead. For example, `/local-research plumber in Austin TX` gives category = "plumber", city = "Austin TX".

### Step 2: Run Reddit Searches Using WebSearch

Execute these 4 searches. Each query must use the `site:reddit.com` prefix to restrict results to Reddit threads:

1. `site:reddit.com "{category} in {city}"`
2. `site:reddit.com "{category} recommendations {city}"`
3. `site:reddit.com "best {category} {city}"`
4. `site:reddit.com "avoid {category} {city}"`

**Example for a plumber in Austin:**

1. `site:reddit.com "plumber in Austin"`
2. `site:reddit.com "plumber recommendations Austin"`
3. `site:reddit.com "best plumber Austin"`
4. `site:reddit.com "avoid plumber Austin"`

Run all 4 searches in parallel using the WebSearch tool.

### Step 3: Read the Top Threads

1. From the combined search results, identify the 5-10 most relevant Reddit thread URLs. Prioritize threads with many comments, recent dates, and direct relevance to the category + city.
2. For each thread: use **WebFetch** as the primary method (free, no dependency). If WebFetch fails on a thread, try Firecrawl as fallback.
3. Read the thread content. Focus on **comments**, not just the original post. The comments contain the real opinions, complaints, and recommendations.

### Step 4: Synthesize Findings

From all threads read, extract and synthesize the following categories:

**pain_points** (3-5 items):
What do people complain about in this service category? Look for common frustrations, horror stories, reasons people avoid certain providers. Write each as a clear, specific statement.

**what_customers_value** (3-5 items):
What do people praise? What do they wish they could find? What are the deciding factors when choosing a provider? Write each as a clear, specific statement.

**business_differentiators** (3-5 items):
Cross-reference the pain points and valued qualities against this specific business's data from `business_profile.json` and `scraped_content.json`. How does this business address those pain points? Use real data only: their rating, their services, their hours, their testimonials. Do not fabricate claims. Every differentiator must be grounded in actual business data.

**copy_angles** (3-5 items):
Specific messaging suggestions for the website. Each angle should connect a pain point to something this business does well. These will directly drive the hero headline, subheadline, and section ordering in the redesign. Write each as a concrete, actionable suggestion (e.g., "Lead with X" or "Emphasize Y in the hero section").

### Step 5: Save Output

Save the research output to `sites/{slug}/local_research.json` in this format:

```json
{
  "slug": "joes-plumbing",
  "category": "Plumber",
  "location": "Austin TX",
  "threads_analyzed": 12,
  "pain_points": [
    "Plumbers not showing up on time or ghosting after estimates",
    "Hidden fees — quoted $200, billed $600",
    "Can't find anyone available for weekend emergencies"
  ],
  "what_customers_value": [
    "Upfront transparent pricing",
    "Same-day or emergency availability",
    "Licensed and insured with proof on website"
  ],
  "business_differentiators": [
    "Joe's has 4.7 stars with multiple reviews praising on-time arrival",
    "Website mentions free estimates — addresses hidden fee concern",
    "Offers 24/7 emergency service per scraped content"
  ],
  "copy_angles": [
    "Lead with 'No surprise bills' — transparent pricing hero message",
    "Emphasize 24/7 availability — biggest local pain point",
    "Feature real review quotes about punctuality"
  ]
}
```

### Step 6: Report Back

Show the user a summary:

- **Top pain points found** — list the pain points extracted from Reddit.
- **How this business differentiates** — list the differentiators grounded in real business data.
- **Suggested copy angles for the website** — list the copy angle recommendations.

Then ask: "These look like good angles? Proceed to audit?"

## Cost

Free. Uses web search only.

## Notes

- If Reddit has very few results for this category + city combo, broaden the search: try the state level (e.g., "plumber in Texas"), or try without city for general category pain points (e.g., "best plumber recommendations"). The goal is to gather enough signal even if the specific city has limited Reddit activity.
- The **copy angles are the most important output**. They directly inform how the site-redesign skill writes headlines and structures content. Spend extra care making these specific and actionable.
- **Differentiators must be grounded in real data** from the business. Do not make claims that are not supported by `business_profile.json` or `scraped_content.json`. If the business data does not support a differentiator for a given pain point, note that as a gap rather than fabricating a claim.
