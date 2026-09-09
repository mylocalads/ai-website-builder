/**
 * Resolve the image filenames stored in the content collections to real,
 * optimised URLs.
 *
 * Content stores bare filenames (see scripts/localize-images.mjs) because that
 * is what lets astro:assets + sharp process them. Anything that renders an
 * image therefore has to go through here — a filename emitted straight into
 * markup or CSS is a 404.
 *
 * Two consumers, two shapes:
 *   - <SmartImage> needs the ImageMetadata object, so it can emit a srcset and
 *     intrinsic width/height. Use resolveAsset().
 *   - A CSS `background-image: url(...)` can only take a string, and gets no
 *     srcset and no dimensions. Use imageUrl(), and prefer a real <img> when
 *     the element is a candidate for LCP.
 */
import { getImage } from 'astro:assets';

const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{jpg,jpeg,png,webp,avif,gif}',
  { eager: true }
);

/** ImageMetadata for a local filename; null for a remote URL or a miss. */
export function resolveAsset(src?: string | null): ImageMetadata | null {
  if (!src || /^https?:\/\//.test(src)) return null;
  return modules[`/src/assets/images/${src}`]?.default ?? null;
}

/**
 * An optimised URL for a filename, for use in CSS or a `poster` attribute.
 * Falls back to the input unchanged so a remote URL still renders.
 */
export async function imageUrl(
  src?: string | null,
  { width = 1600, quality = 70 }: { width?: number; quality?: number } = {}
): Promise<string | null> {
  const asset = resolveAsset(src);
  if (!asset) return src ?? null;
  // Never request more than the source has; Astro treats upscaling as an error.
  const w = Math.min(width, asset.width);
  return (await getImage({ src: asset, width: w, format: 'webp', quality })).src;
}
