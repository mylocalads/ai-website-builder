---
name: harvest-media
description: Pick up to 15 marketing-worthy images for a client from the scrape the website build already paid for, or generate one from a prompt, and upload them into the customer portal's Files page under an AI Generated folder.
trigger: "harvest-media" or "harvest images" or "find images for" or "generate image for"
---

<!--
  THE PORTAL HALF OF THIS FEATURE LIVES IN ANOTHER REPO.

  The queue table, the four /api/harvests routes, the AI Generated folder and the
  disclaimer are in mla-starter-hub. A copy of this file is committed there, at
  docs/runner/harvest-media-SKILL.md, so that a change to a request or response
  shape can be reviewed against both ends in one diff.

  IF YOU EDIT THE CONTRACT HERE, EDIT IT THERE IN THE SAME CHANGE. Two copies
  that disagree are worse than one copy nobody can find.
-->

# Harvest Media Skill

## What This Skill Does

Takes the images the website build **already found** and puts them where the
customer can actually use them.

`intake-from-web` confirms the business on Google Business Profile, then
Firecrawls their site, their inner pages and their social profiles, and writes
every image URL it found into `sites/{slug}/intake-scraped.json`. Today those
images are used to generate a site and then forgotten — the customer never sees
them and the agency keeps no copy.

This skill selects the best of them, downloads them, and uploads them into the
portal at `client.mylocalads.co`, where they appear on the client's Files page in
an **AI Generated** folder, each badged with where it came from.

**It does not scrape if it does not have to.** A business whose site was already
built has a cached `intake-scraped.json`, and reusing it costs nothing. Only a
business with no cache pays the ~$0.20–0.35 that `intake-from-web` costs.

## How to Invoke

- `/harvest-media` — poll the portal queue and process what is waiting
- `/harvest-media joe-dougher-masonry-contractor` — one business by slug

Normally invoked unattended by the n8n workflow **MLA — Image Harvest Runner**,
which is woken by a webhook when the portal enqueues a harvest.

## Cost Rules — READ BEFORE RUNNING

Same rule as every other skill in this repo: state the cost, wait for approval,
and never run a paid step silently.

| Situation | Cost |
|---|---|
| `sites/{slug}/intake-scraped.json` exists | **$0.00** — reuse it |
| No cache, so `intake-from-web` must run | ~$0.20–0.35 |
| Downloading the chosen images | $0.00 |

**On an unattended run there is no operator to ask.** So the rule becomes a hard
one: if there is no cache, and the run is unattended, **report the cost and stop**
rather than spending. See Step 2.

## The Portal API

Four endpoints, all bearer-authed with `BUILD_API_SECRET` — the same credential
this repo already uses for `/api/builds/*`. It is in `~/ai-website-builder/.env`.

```
GET  /api/harvests/queue
POST /api/harvests/{id}/claim
POST /api/harvests/{id}/upload-urls
POST /api/harvests/{id}/complete
```

Base URL is the portal URL already in `.env`.

## What the Agent Does

Follow these steps exactly, in order.

### Step 0 — Read the credentials

Read `.env` for `BUILD_API_SECRET` and the portal URL. If either is missing,
**stop immediately** and say so. Never guess a URL and never proceed unauthed.

### Step 1 — Claim the work

`GET /api/harvests/queue`. Each entry is:

```json
{ "id": "...", "job": "harvest",
  "prompt": null,
  "business": { "id": "...", "slug": "...", "name": "..." }, "intake": { ... } }
```

**`job` decides which half of this skill you are running.**

| `job` | What it means | Where to go |
|---|---|---|
| `harvest` | Find images that already exist | Step 2 onward |
| `generate` | Make a new image from `prompt` | **Step G**, then Step 5 |

A business that cannot be identified is **held by the portal and never served**
— but only for a `harvest`. A `generate` is never held, because the prompt is
the whole input and nothing is being looked up.

`POST /api/harvests/{id}/claim` with `{"agentRunId": "<n8n execution id>"}`.

**A 409 means another execution got there first. Stop. Do not process it.** That
is the mutex that stops two runs paying to scrape the same business.

### Step G — Generate (only when `job` is `generate`)

The prompt came from a card the user read and confirmed. **Use it verbatim.** Do
not expand it, restyle it, or add "professional, 4k, highly detailed" — the user
approved the words they wrote, and a generation they did not ask for still costs
them and still has to be hidden by hand.

1. Generate **one** image from `prompt` using the Higgsfield MCP server
   (`generate_image`). One, not a set of four: the portal files everything you
   send, and a client who asked for an image gets an image.
2. Save it locally, then go to **Step 5** with a single-entry manifest:

   ```json
   { "filename": "generated-<slug>-<short-description>.png",
     "mimeType": "image/png", "sizeBytes": 812000,
     "sourceUrl": null, "sourcePlatform": "website",
     "subject": "completed_work", "origin": "generated" }
   ```

   - `origin` **must** be `"generated"`. This is what puts the AI disclaimer over
     it on the customer's page.
   - `sourceUrl` is `null`, and that is correct — there is nothing to point at.
     **Do not invent one.** A made-up provenance is a lie; an absent one is a
     fact, and the portal accepts null here only for generated images.
   - `subject` is your best honest guess at what it depicts.

3. Report with `usedCache: false` and `imagesFound: 1`.

**If the generation fails**, complete as `failed` with the real reason. Do not
substitute a scraped image for a generation the user asked for — they asked for
a picture of something that does not exist yet, and handing them a photograph of
something else is not a smaller version of that.

### Step 2 — Find the scrape, or decide not to pay for one

Look for `sites/{slug}/intake-scraped.json`.

- **It exists** → use it. Remember `usedCache: true`.
- **It does not exist** → this run would cost ~$0.20–0.35.
  - *Attended:* state the cost, wait for approval, then run `/intake-from-web`.
    Remember `usedCache: false`.
  - *Unattended:* **do not spend.** Complete the harvest as failed with
    `errorMessage: "No cached scrape for {slug}; an unattended run will not pay
    for one. Build the site first, or run /harvest-media attended."` and stop.

**Prefer to wait for the website build.** A harvest is enqueued at the same
instant as the website build, so on a first-ever run the cache is usually not
there *yet* — it appears minutes later when `intake-from-web` finishes. Before
deciding there is no cache, check whether that business has a website build in
flight and let it finish. Paying twice for the same scrape is the single thing
this skill exists to avoid.

### Step 3 — Pull out the candidate images

Every URL you need is already in `intake-scraped.json`. Read these keys:

| Want | Read from |
|---|---|
| Logo | `logo_url` |
| Completed work | `gallery[].photo`, `services[].gallery[]`, `services[].hero_photo` |
| Before / after | `gallery[]` whose `alt` or `title` matches `/before\|after/i` |
| Testimonials | `testimonials[]` carrying an image, and `raw/social-*.json` review cards |
| Team | `team_members[].photo` |
| Owner | `team_members[]` whose `role` matches `/owner\|founder\|president\|principal/i` |
| Anything else | `default_hero_photo`, `about_photo` |

Social profiles scraped by `intake-from-web` step 8 are in
`sites/{slug}/raw/social-{platform}.json`. Use them — Facebook and Instagram are
where a contractor's real job photos actually live.

### Step 4 — Choose up to 15

**Rank, then cut. Never send more than 15 — the portal refuses a 16th.**

Rules, in order:

1. The logo first, if there is one.
2. At least one of each subject before a second of any subject. A folder of
   fifteen wall photos and no logo is a worse outcome than one of each.
3. Drop anything under **600px on its long edge**. Check it after downloading,
   not by guessing from the URL.
4. Drop known stock-photo hosts (`shutterstock`, `istockphoto`, `gettyimages`,
   `unsplash`, `pexels`, `adobestock`). These are on the client's site but they
   are not the client's work, and presenting them as such is the failure this
   whole feature must not have.
5. Drop sprites, icons, logos of other companies, badges and payment marks.
6. Deduplicate by URL **and** by content hash — the same photo is routinely
   served at three sizes from one site.

### Step 5 — Get somewhere to put them

`POST /api/harvests/{id}/upload-urls` with up to 15:

```json
{ "images": [
  { "filename": "stone-wall-job.jpg", "mimeType": "image/jpeg", "sizeBytes": 244000,
    "sourceUrl": "https://facebook.com/joedougher/photos/1",
    "sourcePlatform": "facebook", "subject": "completed_work" }
]}
```

- `sourcePlatform` — one of `facebook`, `instagram`, `linkedin`, `tiktok`, `gbp`,
  `google_search`, `website`
- `subject` — one of `logo`, `completed_work`, `before_after`, `testimonial`,
  `team`, `owner`
- `mimeType` must be `image/*`; `sizeBytes` must be ≤ 10 MB

**Provenance is required, not optional.** An image whose real source URL you
cannot state is an image you must not upload. The portal prints that source as a
badge on the customer's own page — "From Facebook", "From your website" — and an
image with no origin would be presented to them as their own when it may not be.
If you are unsure where something came from, **drop it**.

The response gives one `storagePath` and `signedUrl` per image. **The portal
mints the path, not you.**

### Step 6 — Upload the bytes

`PUT` each file to its `signedUrl` with the right `Content-Type`. The portal
never carries the pixels — a serverless request body caps at 4.5 MB and a job
photo can exceed it.

Record which ones actually succeeded. A failed PUT is not fatal; it is one image.

### Step 7 — Report

`POST /api/harvests/{id}/complete`:

```json
{ "status": "succeeded", "usedCache": true, "imagesFound": 37,
  "images": [ { "...same fields as step 5...", "storagePath": "<from step 5>" } ] }
```

**Send only the images that actually uploaded.** This call is what creates the
rows on the customer's Files page, so anything listed here and missing from
storage becomes a broken thumbnail.

- `imagesFound` is how many candidates you saw, before ranking. The gap between
  that and what you stored is what an account manager looks at when a client says
  their folder looks thin.
- Failing? `status: "failed"` **requires** `errorMessage`. Still send whatever
  images did land — four good photos and an explained failure beats nothing.
- A 409 means the harvest already completed. Do not retry.

## Optional — Higgsfield enhancement

Off by default and **not required for a working harvest.**

Scraped images are often small, compressed, or a logo on a white rectangle. When
`HIGGSFIELD_API_KEY` is set in `.env`, an image may be improved between step 6
and step 7:

- **Logo** → background removal, so it can sit on any colour
- **Anything under 1200px** → upscale

If you enhance an image, **it stops being purely `found`**. Send it with
`"origin": "generated"` so the portal badges it "AI generated" and covers it with
the AI disclaimer. This matters: an upscaled photograph contains pixels a model
invented, and the customer is entitled to know which of their images those are.

An unenhanced image keeps `"origin": "found"` — send the field or leave it out,
`found` is the default.

**Never enhance without setting `origin`.** Quietly returning a model-touched
image as a real photograph is the one thing the portal's disclaimer exists to
prevent.

## Anti-Patterns — DO NOT

- **Do not scrape a business whose site was just built.** The cache is coming.
- **Do not upload an image you cannot name a source for.**
- **Do not upload a stock photo** from the client's existing site.
- **Do not exceed 15.** The portal refuses the request, not just the extra image.
- **Do not invent a `storagePath`.** Only paths from `/upload-urls` are accepted,
  and the portal checks each one belongs to that business.
- **Do not retry a 409.** Somebody else has the work.
- **Do not enhance an image and call it `found`.**

## Verify Before Reporting Done

1. Every uploaded image PUT returned 2xx.
2. Every image in the `complete` payload has a `storagePath` from `/upload-urls`.
3. Nothing in the payload is a stock photo, an icon, or under 600px.
4. Every image has a real `sourceUrl`.
5. `usedCache` is accurate. It is the cost story of this feature.
