---
name: short-link
description: Create a disappearing short link via Short.io with a custom domain and configurable expiration. Uses the website-service.mylocalads.co domain. Link expires and redirects after the specified number of days.
trigger: "short-link" or "create short link" or "disappearing link" or "expiring link"
---

# Skill: Short Link (Disappearing Link)

## What This Skill Does
Creates a short, expiring link for a deployed Vercel site using Short.io and the custom domain `website-service.mylocalads.co`. After the specified number of days, the link stops working and redirects visitors to a fallback URL. This is useful for time-limited outreach — the prospect sees the redesigned site for a window, creating urgency.

---

## How to Invoke

```
/short-link
```
Reads from the latest deployed site in `sites/build-log.md` and prompts for expiration days.

Or with arguments:
```
/short-link https://dennison-roofing.vercel.app --days 7
```

---

## Prerequisites

**Required:** `SHORTIO_API_KEY` must be set in `.env`. Get it at: https://app.short.io/settings/integrations/api-key

**Required:** The custom domain `website-service.mylocalads.co` must already be configured in your Short.io account.

---

## What the Agent Does

### 1. Confirm with the user

After a Vercel deployment is published, ask:

> "The site is live at {vercel_url}. Would you like to create a disappearing link? If so, how many days should the link be visible before it expires?"

Wait for the user's response. If they decline, skip this step. If they confirm, use their specified number of days (default suggestion: 7 days).

### 2. Read the API key

Read `SHORTIO_API_KEY` from `.env`. If not set, stop and tell the user:

> "I need your Short.io API key to create the link. Add it to your .env file as SHORTIO_API_KEY. You can find it at https://app.short.io/settings/integrations/api-key"

### 3. Calculate expiration

Calculate the expiration timestamp in milliseconds from now:

```
expiresAt = (current time in ms) + (days * 24 * 60 * 60 * 1000)
```

For example, 7 days from now.

### 4. Create the short link

Make a POST request to the Short.io API:

```
POST https://api.short.io/links
```

**Headers:**
```
accept: application/json
content-type: application/json
authorization: {SHORTIO_API_KEY}
```

**JSON body:**
```json
{
  "domain": "website-service.mylocalads.co",
  "originalURL": "{vercel_url}",
  "expiresAt": {expiration_timestamp_in_ms},
  "expiredURL": "https://mylocalads.co",
  "allowDuplicates": false,
  "title": "{business_name} - Website Preview"
}
```

**Field notes:**
- `domain` — always use `website-service.mylocalads.co`
- `originalURL` — the Vercel deployment URL (e.g., `https://dennison-roofing.vercel.app`)
- `expiresAt` — Unix timestamp in milliseconds when the link should expire
- `expiredURL` — where visitors go after expiration. Default: `https://mylocalads.co`
- `title` — descriptive title for the link in the Short.io dashboard

### 5. Capture the short URL

From the API response, extract the `shortURL` field. It will look like:

```
https://website-service.mylocalads.co/{path}
```

### 6. Handle errors

- **401 Unauthorized** — API key is invalid. Tell the user to check their key.
- **400 Bad Request** — Check if the domain is configured in Short.io. Tell the user: "The domain website-service.mylocalads.co may not be configured in your Short.io account. Add it at https://app.short.io/settings/domains"
- **409 Conflict** — A link to this URL already exists. Set `allowDuplicates: true` and retry, or inform the user.

### 7. Update the build log

Update the row in `sites/build-log.md` — add a new `Short Link` column if it doesn't exist, or append the short URL info after the Vercel URL.

### 8. Report back

Show the user:

```
Disappearing link created!

Short URL:    https://website-service.mylocalads.co/{path}
Points to:    https://dennison-roofing.vercel.app
Expires:      {expiration_date} ({days} days from now)
After expiry: Redirects to https://mylocalads.co
```

---

## Output

The short link URL is displayed to the user and logged in the build log. No separate JSON file is created — the link is ephemeral by nature.

---

## Cost

Free (within Short.io plan limits). Requires Pro plan or above for link expiration feature.

---

## Notes

- The `expiresAt` parameter must be in milliseconds (Unix timestamp * 1000)
- Short.io also supports a `TTL` parameter that auto-deletes the link after expiration, but `expiresAt` + `expiredURL` is preferred because it redirects gracefully instead of showing an error
- The MCP integration for Short.io (`short-io` MCP server) can also be used if configured, but the REST API approach is more reliable for this use case since the MCP doesn't support editing/expiration well
- Links created here are visible in the Short.io dashboard at https://app.short.io
