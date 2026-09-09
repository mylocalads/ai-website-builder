/**
 * Pull every remote image referenced by the content collections into
 * src/assets/images/, and rewrite the content to point at the local file.
 *
 * WHY: Astro's image pipeline (astro:assets + sharp) can only resize, convert
 * to modern formats, and emit width/height for images it can see at build time.
 * A remote URL string in a JSON/markdown field is invisible to it — the browser
 * just fetches whatever the third party serves, at whatever size they stored it.
 * That is how this site ended up shipping a 2.1 MB team photo and a 946 KB
 * comparison photo hotlinked from another company's CDN.
 *
 * Localising also removes a live dependency on img1.wsimg.com (GoDaddy), which
 * the site no longer has any relationship with since the domain moved off it.
 *
 * Idempotent: an already-local value is left alone, so this can be re-run after
 * new content is added. Run it, then `npm run build`.
 *
 *   node scripts/localize-images.mjs [--dry]
 */
import { readFile, writeFile, mkdir, readdir, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

/**
 * Write via a temp file + rename, so the destination is either the old bytes or
 * the new ones and never a half-written file.
 *
 * This is not paranoia. A plain writeFile() truncates the target first; if the
 * process dies in that window the file is left at zero bytes. That happened
 * during development by piping this script into `head`, which closes stdout,
 * raises EPIPE, and kills node mid-write — it emptied a content file. rename()
 * is atomic on the same filesystem, so the window does not exist.
 */
async function writeAtomic(dest, contents) {
  const tmp = `${dest}.${process.pid}.tmp`;
  await writeFile(tmp, contents);
  await rename(tmp, dest);
}

const ROOT = path.resolve(import.meta.dirname, '..');
const ASSETS = path.join(ROOT, 'src/assets/images');
const DRY = process.argv.includes('--dry');

// Fields that hold an image. Anything else that happens to contain a URL (a
// social profile link, a form embed) must not be touched.
const IMAGE_KEY = /(photo|image|logo|icon|thumb|avatar|banner|hero)(_url)?$/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)(\?|$)/i;
// Hosts that serve images from an opaque path with no file extension.
const IMAGE_HOST = /(filesafe\.space|img1\.wsimg\.com|images\.unsplash\.com|b-cdn\.net|cloudfront\.net)/i;

const isRemoteImage = (v) =>
  typeof v === 'string' &&
  /^https?:\/\//.test(v) &&
  (IMAGE_EXT.test(v) || IMAGE_HOST.test(v));

/** Stable, readable filename: slug of the source + short hash of the full URL. */
function localName(url, contentType) {
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 8);
  let base = decodeURIComponent(new URL(url).pathname.split('/').pop() || 'image')
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'image';
  const ext =
    (contentType && { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
                      'image/avif': 'avif', 'image/gif': 'gif' }[contentType.split(';')[0].trim()]) ||
    (url.match(IMAGE_EXT)?.[1] ?? 'jpg').toLowerCase().replace('jpeg', 'jpg');
  return `${base}-${hash}.${ext}`;
}

const downloaded = new Map(); // url -> filename
let bytes = 0;

async function localize(url) {
  if (downloaded.has(url)) return downloaded.get(url);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'firefly-cd-build/1.0 (+https://fireflycd.com)' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  const type = res.headers.get('content-type') ?? '';
  if (!type.startsWith('image/')) throw new Error(`not an image (${type || 'no content-type'})`);

  const buf = Buffer.from(await res.arrayBuffer());
  const name = localName(url, type);
  const dest = path.join(ASSETS, name);

  if (!existsSync(dest) && !DRY) await writeFile(dest, buf);
  bytes += buf.length;
  downloaded.set(url, name);
  console.log(`  ↓ ${(buf.length / 1024).toFixed(0).padStart(5)} KB  ${name}`);
  return name;
}

/**
 * Walk any JSON shape, replacing remote image values in image-ish keys.
 *
 * `parent` is tracked because the project-map entries store their image under a
 * bare `url` key (`photos: [{ url, alt }]`), which no image-name pattern can
 * match on its own. Matching bare `url` only inside a `photos` array keeps
 * genuine links (site_url, social, form embeds) untouched.
 */
async function walk(node, key = '', parent = '') {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) node[i] = await walk(node[i], key, parent);
    return node;
  }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) node[k] = await walk(node[k], k, key);
    return node;
  }
  const isPhotoUrl = key === 'url' && parent === 'photos';
  if ((IMAGE_KEY.test(key) || isPhotoUrl) && isRemoteImage(node)) {
    try {
      return await localize(node);
    } catch (err) {
      console.warn(`  ! skipped ${node.slice(0, 70)} — ${err.message}`);
      return node; // leave the remote URL rather than break the page
    }
  }
  return node;
}

async function doJson(file) {
  const abs = path.join(ROOT, 'src/content', file);
  if (!existsSync(abs)) return;
  const data = JSON.parse(await readFile(abs, 'utf8'));
  console.log(`\n${file}`);
  const out = await walk(data);
  const next = JSON.stringify(out, null, 2) + '\n';
  // Localising only ever shortens values (long URL -> short filename), so the
  // file should stay the same order of magnitude. A collapse means something
  // went wrong upstream; refuse rather than overwrite good content.
  const prevLen = (await readFile(abs, 'utf8')).length;
  if (next.length < prevLen * 0.5) {
    throw new Error(`refusing to write ${file}: ${prevLen} -> ${next.length} bytes`);
  }
  if (!DRY) await writeAtomic(abs, next);
}

/** Markdown frontmatter: rewrite image values line-by-line to preserve formatting. */
async function doMarkdown(dir) {
  const abs = path.join(ROOT, 'src/content', dir);
  if (!existsSync(abs)) return;
  for (const f of (await readdir(abs)).filter((f) => f.endsWith('.md'))) {
    const file = path.join(abs, f);
    const lines = (await readFile(file, 'utf8')).split('\n');
    console.log(`\n${dir}/${f}`);
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^(\s*-?\s*)([a-z_]*(?:photo|image|logo|icon)[a-z_]*):\s*(\S+)\s*$/i);
      if (!m || !isRemoteImage(m[3])) continue;
      try {
        lines[i] = `${m[1]}${m[2]}: ${await localize(m[3])}`;
      } catch (err) {
        console.warn(`  ! skipped ${m[3].slice(0, 70)} — ${err.message}`);
      }
    }
    if (!DRY) await writeAtomic(file, lines.join('\n'));
  }
}

await mkdir(ASSETS, { recursive: true });
for (const f of ['site/config.json', 'site/home.json', 'site/our-work.json']) await doJson(f);
for (const d of ['services', 'service_areas']) await doMarkdown(d);

console.log(
  `\n${downloaded.size} image(s) localized, ${(bytes / 1024 / 1024).toFixed(2)} MB fetched${DRY ? ' (dry run — nothing written)' : ''}.`
);
