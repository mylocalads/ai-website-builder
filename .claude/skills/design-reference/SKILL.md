---
name: design-reference
description: Produce a design_reference.json for a client site from either an explicit list of designer reference URLs OR a curated per-vertical reference library. Fights the LLM aesthetic by grounding the visual direction in real designed work.
trigger: "design-reference" or "reference URLs" or "design tokens"
---

## What This Skill Does

Reads reference URLs from one of two sources:

1. **Explicit URLs** — user provides 3–5 URLs and optional notes at invocation (e.g. via prompt).
2. **Library** — user passes `--library {vertical}` (e.g. `roofing`, `concrete`) and the skill reads `reference-libraries/{vertical}.json` at the agent root.

For each URL, uses Firecrawl to scrape HTML/CSS and (optionally) take a screenshot. From the results plus any user notes, synthesize:

- Palette (bg, surface, text, muted, accent) as hex
- Typography (font-display, font-body — Google Fonts names)
- Spacing scale (rem values)
- Radius scale (px)
- Section styling hints — copy any dominant visual cues (borders, dividers, motifs) as short strings
- Anti-patterns — merged from the library file's `anti_patterns` and from `audit_results.json` if present

Writes `sites/{slug}/design_reference.json`.

## Invocation modes

- `/design-reference {slug}` — interactive: prompts user for URLs and notes
- `/design-reference {slug} --library {vertical}` — pulls URLs from `reference-libraries/{vertical}.json`
- `/design-reference {slug} --urls url1,url2,url3` — explicit URL list, non-interactive
- Both `--library` and `--urls` may be combined; explicit URLs are appended to the library set.

## Inputs

- CLI: `slug` (matches `sites/{slug}/`)
- Prompt to user (interactive mode only): request 3–5 reference URLs and optional notes
- Reads: `sites/{slug}/audit_results.json` (optional; used to detect what to avoid on the client's current site)
- Reads: `reference-libraries/{vertical}.json` if `--library` passed

## Process

1. Determine invocation mode (interactive / library / URLs / combo).
2. Build the working URL list (deduplicate URLs).
   - **Library ordering rule:** When reading `reference-libraries/{vertical}.json`, entries carry an optional `role` field. Order the URL list as `role: "primary"` first, then `role: "secondary"`, then unclassified. This guarantees the canonical MLA reference (currently `https://firefly-cd.vercel.app/`) is scraped and weighted ahead of secondary inspirations (agcconcrete.com, etc.). If a `primary` entry becomes unreachable, warn the operator and fall through to the next primary or the highest-ranked secondary — don't silently drop.
   - **URL fragility note:** Reference library entries may include a `note_url_fragility` field flagging URLs likely to move (e.g. Vercel preview aliases). If a primary URL 404s and its entry carries that note, tell the operator and point them at the matching template directory itself (`ai-website-builder/astro-templates/{firefly,owl}/`) as the structural source of truth while they update the library.
3. For each URL:
   a. Warn user of Firecrawl cost (~$0.02 per URL) and total.
   b. Wait for approval.
   c. Firecrawl scrape (HTML + screenshot).
4. Analyze:
   - Palette: extract dominant colors from screenshots + CSS variables.
   - Typography: parse `font-family` declarations; map to Google Fonts nearest equivalents.
   - Spacing scale: default reasonable rem scale unless site suggests otherwise.
   - Radius: default reasonable.
5. Merge anti-patterns from library file + `audit_results.json` client-site tells (if the client's current site had gradient heroes, glass morphism, etc.).
6. Synthesize `design_reference.json`:

```json
{
  "sources": {
    "mode": "library" | "urls" | "combo",
    "library": "roofing" | null,
    "urls": ["https://..."]
  },
  "palette": { "bg": "#...", "surface": "#...", "text": "#...", "muted": "#...", "accent": "#..." },
  "typography": { "display": "EB Garamond", "body": "Inter" },
  "spacing": ["0.5rem", "1rem", "1.5rem", "2.5rem", "4rem"],
  "radius": { "sm": "4px", "md": "8px" },
  "avoid": ["gradient hero", "purple accents", "handshake stock photo"]
}
```

7. Show the user the synthesized JSON. Ask for confirmation before writing.
8. Write to `sites/{slug}/design_reference.json`.

## Cost

- Firecrawl scrape + screenshot per URL: ~$0.02.
- Warn user before running: total = URL count × $0.02.

## Anti-Pattern Detection

If `sites/{slug}/audit_results.json` shows the client's current site uses gradient heroes, glass morphism, generic stock photography, or purple accents, include those explicitly in `avoid: [...]` so `site-generate` steers away.

## Rules

- Never write to `astro-templates/` — only to `sites/{slug}/design_reference.json`.
- Always show the user the synthesized tokens for confirmation before finalizing.
- Never fabricate reference URLs — only use library entries or user-supplied URLs.
- Firecrawl failures on a URL: proceed with remaining URLs, note the failure in the output.
