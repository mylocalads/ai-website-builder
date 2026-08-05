# Raw source archive — nepa-classic-construction

Debugging archive for the 2026-08-04 intake run. The operator-facing artifact is
`../intake-scraped.json`; nothing here is read by the build.

| File | What it is |
|---|---|
| `homepage.json` | Firecrawl scrape of `https://nepaclassic.com` (markdown + html + links) |
| `homepage-shell.html` | The raw pre-JS HTML shell. Holds the schema.org `GeneralContractor` JSON-LD — the source for NAP, geo, hours and areaServed, since there is no Google Business Profile. |
| `site-bundle.js` | The client site's own JS data module. Because the site is a client-side React SPA whose FAQ accordions never mount their content, all 26 FAQ q/a pairs and every per-service block (intro, benefits, process, examples) were read from here. Real authored client content, not generated. |
| `site-styles.css` | The client's compiled CSS. Source for every brand colour (`--background`, `--foreground`, `--primary`, `--accent`) and both fonts (`--font-serif: Fraunces`, `--font-sans: Geist`). |
| `service-data-parsed.json` | The nine per-service blocks parsed out of `site-bundle.js`, plus the seven home-page FAQs. |
| `gbp-luzerne-county.json` | Apify Google Maps dataset for run `aRsfqVzpoWYX4o1VT` (`"NEPA Classic"` / Luzerne County PA). Eight results, none matching — this business has no GBP listing. The earlier Pittston-scoped run `OpzHRxnxIrGqqjOCU` returned zero rows and has no dataset worth keeping. |
| `wikimedia-landmark-licenses.json` | Commons `imageinfo` + `extmetadata` for the six service-area landmark photos. All CC BY-SA; the attribution strings in `src/content/service_areas/*.md` come from here. |

The nine `/services/*` Firecrawl markdown files were dropped after parsing — their entire
content is preserved in `service-data-parsed.json` and in the generated service markdown.
The seven `/contractor-{city}-pa` URLs listed in the client's sitemap all return 404 and
produced nothing to archive.
