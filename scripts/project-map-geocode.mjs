#!/usr/bin/env node
/**
 * project-map-geocode — turn an operator's project CSV into the project_map
 * block of sites/{slug}/src/content/site/our-work.json.
 *
 *   node scripts/project-map-geocode.mjs <slug>            # preview only
 *   node scripts/project-map-geocode.mjs <slug> --apply    # write our-work.json
 *
 * PRIVACY CONTRACT — the reason this is a script and not prose:
 *   The street address is read from the CSV, sent to Nominatim once, and then
 *   discarded. It is never written to our-work.json, never to the cache (which
 *   is keyed by SHA-256), and therefore never to dist/. Privacy here is a
 *   property of the data flow, not a rendering rule someone could forget.
 *
 * NOMINATIM USAGE POLICY — https://operations.osmfoundation.org/policies/nominatim/
 *   Max 1 request/second, a real identifying User-Agent, and results cached.
 *   On 429/403 this aborts the whole batch rather than backing off and
 *   retrying: a retry loop is how an IP gets banned for every future client.
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const USER_AGENT = 'mla-website-builder/1.0 (marcellus@mylocalads.co)';
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const RATE_LIMIT_MS = 1100; // >1s, with headroom for clock jitter

// CONUS + AK + HI. A hit outside this is a misparse, not a real address.
const US_BBOX = { minLat: 18.9, maxLat: 71.5, minLng: -179.2, maxLng: -66.9 };

const REQUIRED = ['address', 'city', 'state', 'completed', 'project_type', 'photos', 'alt'];
const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

/* ---- CSV (RFC 4180: quoted fields, embedded commas, doubled quotes) ------
 * Not optional. Image CDN URLs routinely contain commas
 * (…/cr=t:0%25,l:0%25,w:100%25…), so a naive split(',') silently shreds every
 * row. Operators must quote those fields; this parser honours the quoting. */

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }

  const nonEmpty = rows.filter((r) => r.some((v) => v.trim() !== ''));
  if (!nonEmpty.length) return [];
  const header = nonEmpty[0].map((h) => h.trim().toLowerCase());
  return nonEmpty.slice(1).map((r, idx) => {
    const obj = { __line: idx + 2 };
    header.forEach((h, i) => { obj[h] = (r[i] ?? '').trim(); });
    return obj;
  });
}

/* ---- Normalisation + validation ---------------------------------------- */

function slugify(v) {
  return String(v).toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Accepts "2026-03" or "March 2026". Day precision is deliberately dropped. */
function normalizeCompleted(raw) {
  const v = String(raw).trim();
  let m = /^(\d{4})-(\d{1,2})$/.exec(v);
  if (m) {
    const mm = Number(m[2]);
    return mm >= 1 && mm <= 12 ? `${m[1]}-${String(mm).padStart(2, '0')}` : null;
  }
  m = /^([A-Za-z]+)\s+(\d{4})$/.exec(v);
  if (m) {
    const mm = MONTHS[m[1].toLowerCase()];
    return mm ? `${m[2]}-${String(mm).padStart(2, '0')}` : null;
  }
  return null;
}

function splitMulti(v) {
  return String(v).split(';').map((s) => s.trim()).filter(Boolean);
}

function validate(rows) {
  const errors = [];
  const clean = [];
  const seenIds = new Map();

  rows.forEach((r) => {
    const rowErrors = [];
    for (const f of REQUIRED) {
      if (!r[f]) rowErrors.push(`missing "${f}"`);
    }

    const state = (r.state || '').toUpperCase();
    if (state && !/^[A-Z]{2}$/.test(state)) rowErrors.push(`state "${r.state}" must be 2 letters`);

    const completed = r.completed ? normalizeCompleted(r.completed) : null;
    if (r.completed && !completed) rowErrors.push(`completed "${r.completed}" must be YYYY-MM or "March 2026"`);

    const photos = splitMulti(r.photos || '');
    if (r.photos && !photos.length) rowErrors.push('no photo URLs parsed');
    photos.forEach((u) => {
      try { new URL(u); } catch { rowErrors.push(`photo is not an absolute URL: ${u.slice(0, 60)}`); }
    });

    if (rowErrors.length) {
      errors.push({ line: r.__line, errors: rowErrors });
      return;
    }

    // Deterministic, sortable, and contains no address text.
    const base = `${slugify(r.city)}-${state.toLowerCase()}-${completed}`;
    const n = (seenIds.get(base) ?? 0) + 1;
    seenIds.set(base, n);

    clean.push({
      __line: r.__line,
      __address: r.address, // in-memory only; never serialised
      id: `${base}-${String(n).padStart(2, '0')}`,
      city: r.city,
      state,
      completed,
      project_type: r.project_type,
      products_used: splitMulti(r.products_used || ''),
      photos: photos.map((u, i) => ({ url: u, alt: i === 0 ? r.alt : `${r.alt} (${i + 1})` })),
      description: r.description || undefined,
    });
  });

  return { clean, errors };
}

/* ---- Geocode cache (SHA-256 keys; no address ever stored) ---------------- */

function cacheKey(address, city, state) {
  const norm = `${address.trim().toLowerCase()}|${city.trim().toLowerCase()}|${state.toUpperCase()}`;
  return createHash('sha256').update(norm).digest('hex');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class RateLimitError extends Error {}

async function nominatim(params) {
  const url = new URL(NOMINATIM);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('countrycodes', 'us');
  for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v);

  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en' },
  });

  if (res.status === 429 || res.status === 403) {
    throw new RateLimitError(`Nominatim returned ${res.status} — aborting batch.`);
  }
  if (!res.ok) return null;

  const body = await res.json();
  return Array.isArray(body) && body.length ? body[0] : null;
}

function acceptable(hit, state) {
  if (!hit) return null;
  const lat = Number(hit.lat), lng = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < US_BBOX.minLat || lat > US_BBOX.maxLat) return null;
  if (lng < US_BBOX.minLng || lng > US_BBOX.maxLng) return null;
  // A wrong-state hit means the address was misparsed. Worse than no hit.
  const got = hit.address?.['ISO3166-2-lvl4'];
  if (got && got.toUpperCase() !== `US-${state.toUpperCase()}`) return null;
  return { lat, lng };
}

/**
 * Tier 1 street -> Tier 1b street without house number -> Tier 2 city centroid.
 * Tier 3 (no result at all) returns null and the project keeps no coordinates:
 * it still appears in the list and the photo grid, it just has no pin.
 */
async function geocode(row, budget) {
  const attempts = [
    { precision: 'street', params: { street: row.__address, city: row.city, state: row.state } },
    {
      precision: 'street',
      params: {
        street: row.__address.replace(/^\s*[\d-]+\s+/, ''),
        city: row.city, state: row.state,
      },
    },
    { precision: 'city', params: { city: row.city, state: row.state } },
  ];

  for (const attempt of attempts) {
    if (!attempt.params.street && attempt.precision === 'street') continue;
    if (budget.calls > 0) await sleep(RATE_LIMIT_MS);
    budget.calls++;
    const hit = acceptable(await nominatim(attempt.params), row.state);
    if (hit) return { ...hit, precision: attempt.precision };
  }
  return null;
}

/* ---- Coincident-pin jitter ----------------------------------------------
 * Two projects on the same street land within metres and one hides the other.
 * Deterministic (hash-derived) so rebuilds never shuffle pins, and it is a
 * small privacy bonus on top. */

function jitterFor(id) {
  const h = createHash('sha256').update(id).digest();
  const dx = ((h[0] / 255) - 0.5) * 0.0004;
  const dy = ((h[1] / 255) - 0.5) * 0.0004;
  return [dy, dx];
}

function deJitter(projects) {
  const THRESHOLD = 0.0003; // ~30 m
  for (let i = 0; i < projects.length; i++) {
    const a = projects[i];
    if (a.lat == null) continue;
    for (let j = 0; j < i; j++) {
      const b = projects[j];
      if (b.lat == null) continue;
      if (Math.abs(a.lat - b.lat) < THRESHOLD && Math.abs(a.lng - b.lng) < THRESHOLD) {
        const [dy, dx] = jitterFor(a.id);
        a.lat = Number((a.lat + dy).toFixed(6));
        a.lng = Number((a.lng + dx).toFixed(6));
        break;
      }
    }
  }
}

/* ---- Main ---------------------------------------------------------------- */

async function main() {
  const slug = process.argv[2];
  const apply = process.argv.includes('--apply');
  if (!slug) {
    console.error('usage: node scripts/project-map-geocode.mjs <slug> [--apply]');
    process.exit(2);
  }

  const siteDir = join(ROOT, 'sites', slug);
  const csvPath = join(siteDir, 'project-map-intake.csv');
  const workPath = join(siteDir, 'src', 'content', 'site', 'our-work.json');
  const cachePath = join(siteDir, '.project-map-geocode-cache.json');

  if (!existsSync(csvPath)) {
    console.error(`No intake file at ${csvPath}`);
    console.error('Expected header:');
    console.error('  address,city,state,completed,project_type,products_used,photos,alt,description');
    console.error('Quote any field containing a comma (image CDN URLs usually do).');
    process.exit(2);
  }
  if (!existsSync(workPath)) {
    console.error(`No our-work.json at ${workPath} — is this a bespoke site?`);
    process.exit(2);
  }

  const { clean, errors } = validate(parseCsv(readFileSync(csvPath, 'utf8')));

  // Reject the whole file rather than geocode 39 rows and discover row 40 is
  // broken — the network calls are the expensive, rate-limited part.
  if (errors.length) {
    console.error(`\n${errors.length} invalid row(s) — nothing was geocoded:\n`);
    for (const e of errors) console.error(`  line ${e.line}: ${e.errors.join('; ')}`);
    process.exit(1);
  }
  if (!clean.length) {
    console.error('Intake file has no data rows.');
    process.exit(1);
  }

  const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};
  const needed = clean.filter((r) => !cache[cacheKey(r.__address, r.city, r.state)]);

  console.log(`\nProject map for ${slug}`);
  console.log(`  ${clean.length} projects in intake`);
  console.log(`  ${clean.length - needed.length} resolved from cache (free, instant)`);
  console.log(`  ${needed.length} need geocoding`);
  if (needed.length) {
    console.log(`\nNominatim is free but rate-limited to 1 request/second.`);
    console.log(`Worst case ~${Math.ceil((needed.length * 3 * RATE_LIMIT_MS) / 1000)}s (up to 3 attempts each).`);
    console.log(`Only the street address, city, and state are sent. Addresses are NOT`);
    console.log(`written to any file under sites/${slug}/.\n`);
  }

  const budget = { calls: 0 };
  let aborted = false;

  for (const row of clean) {
    const key = cacheKey(row.__address, row.city, row.state);
    if (cache[key]) continue;
    if (aborted) continue;
    try {
      const hit = await geocode(row, budget);
      cache[key] = hit
        ? { lat: hit.lat, lng: hit.lng, precision: hit.precision, resolved_at: new Date().toISOString() }
        : { lat: null, lng: null, precision: null, resolved_at: new Date().toISOString() };
      process.stdout.write(hit ? '.' : '!');
    } catch (err) {
      if (err instanceof RateLimitError) {
        aborted = true;
        console.error(`\n\n${err.message}`);
        console.error('Progress so far has been cached. Re-run later; cached rows cost nothing.');
      } else throw err;
    }
  }
  if (budget.calls) process.stdout.write('\n');

  // Cache holds hashes and coordinates only. Safe to commit.
  writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');

  const projects = clean.map((row) => {
    const hit = cache[cacheKey(row.__address, row.city, row.state)];
    const out = {
      id: row.id,
      city: row.city,
      state: row.state,
      completed: row.completed,
      project_type: row.project_type,
      products_used: row.products_used,
      photos: row.photos,
      precision: hit?.precision ?? 'street',
    };
    if (hit?.lat != null) { out.lat = hit.lat; out.lng = hit.lng; }
    else { out.precision = 'street'; } // no coords; list + grid only
    if (row.description) out.description = row.description;
    return out;
  });

  deJitter(projects);

  console.log('\nID                              WHEN      TYPE      PHOTOS  COORDS                PRECISION');
  for (const p of projects) {
    const coords = p.lat != null ? `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}` : '—';
    const prec = p.lat == null ? '⚠ no pin (grid only)' : p.precision === 'city' ? '⚠ city' : 'street';
    console.log(
      `${p.id.padEnd(31)} ${p.completed.padEnd(9)} ${p.project_type.padEnd(9)} ` +
      `${String(p.photos.length).padEnd(7)} ${coords.padEnd(21)} ${prec}`,
    );
  }

  const pinned = projects.filter((p) => p.lat != null).length;
  console.log(`\n${pinned} of ${projects.length} projects will show a pin.`);
  console.log(`PRIVACY: street addresses were used for geocoding only and appear in no output file.`);

  if (!apply) {
    console.log('\nPreview only. Re-run with --apply to write our-work.json.');
    return;
  }

  const work = JSON.parse(readFileSync(workPath, 'utf8'));
  work.project_map = {
    ...(work.project_map ?? {}),
    enabled: true,
    heading: work.project_map?.heading ?? 'Where we work',
    projects,
  };
  writeFileSync(workPath, JSON.stringify(work, null, 2) + '\n');
  console.log(`\nWrote ${projects.length} projects to ${workPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
