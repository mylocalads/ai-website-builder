# Why `vercel.json` sets these cache headers

`vercel.json` is schema-validated on deploy and rejects unknown properties —
including `"//"` comment keys, which fail the build with
`Invalid vercel.json - should NOT have additional property //`. So the reasoning
lives here instead.

## `/_astro/(.*)` → `max-age=31536000, immutable`

Everything Astro emits under `/_astro/` carries a content hash in its filename,
so any change produces a new URL. The default here was
`public, max-age=0, must-revalidate`, which forced a revalidation round-trip for
every hashed asset on every visit — Lighthouse reported it as "use efficient
cache lifetimes, est. savings 348 KiB".

`immutable` is the correct header for content-addressed files and cannot serve
stale content: a rebuild changes the hash, which changes the URL.

## `/images/(.*)` → `max-age=86400, must-revalidate`

Files in `public/images/` are **not** content-hashed — `kootenai-county-hero.jpg`
keeps its name when its bytes change. Marking those immutable would pin a stale
image in browser caches for a year with no way to bust it. A day with
revalidation is the safe ceiling.

Images referenced from the content collections do not live here; they are in
`src/assets/images/` and are emitted into `/_astro/` with hashes, so they get
the immutable header above.
