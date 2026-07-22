# Reference Libraries

Curated per-vertical designer reference URLs the `design-reference` skill can pull from when no explicit URLs are provided for a given site.

## Adding a library

Create a new `{vertical}.json` file with this shape:

```json
{
  "vertical": "roofing",
  "references": [
    {
      "url": "https://example-roofer.com",
      "notes": "Type-driven layout, editorial section rhythm, brand palette limited to earth tones",
      "tags": ["editorial", "earth-tones", "large-type"]
    }
  ],
  "anti_patterns": [
    "gradient hero",
    "generic construction stock photo",
    "purple accents"
  ]
}
```

## Selecting a library

At `design-reference` invocation time, pass `--library {vertical}`. If unset and no explicit URLs are provided, `default.json` is used.
