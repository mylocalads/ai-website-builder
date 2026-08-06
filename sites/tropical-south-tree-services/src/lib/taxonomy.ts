/**
 * Service grouping, in one place.
 *
 * This client sells twenty distinct services. Presented flat they read as an
 * undifferentiated list; grouped, they read as three coherent lines of business —
 * which is how the business itself describes them and how buyers actually search.
 *
 * The groups are PRESENTATION ONLY. Grouping never changes which pages exist:
 * every service handed to `groupServicesByCategory` comes back in exactly one
 * group, including any whose `category` is missing or unrecognised (those fall
 * into the last group rather than being silently dropped). That property is what
 * keeps `src/lib/limits.ts`'s featured ⊆ generated invariant intact — a service
 * can never disappear from the nav just because someone typo'd its category.
 *
 * `category` is a free-string field in the content schema, so the match is done
 * case-insensitively and trimmed.
 */

import type { CollectionEntry } from 'astro:content';

type Service = CollectionEntry<'services'>;

/** Display order of the groups, and the canonical label for each. */
export const SERVICE_CATEGORY_ORDER = [
  'Tree Care Services',
  'Land & Specialty Services',
  'Arborist Services',
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORY_ORDER)[number];

/** Anything unrecognised lands here rather than vanishing from the nav. */
const FALLBACK_CATEGORY: ServiceCategory = 'Tree Care Services';

const norm = (s: string | undefined) => (s ?? '').trim().toLowerCase();

const CANONICAL = new Map<string, ServiceCategory>(
  SERVICE_CATEGORY_ORDER.map((c) => [norm(c), c])
);

export interface ServiceGroup {
  title: ServiceCategory;
  services: Service[];
}

/**
 * Bucket services into the ordered groups above, preserving the incoming sort
 * (which callers set by `order`). Empty groups are omitted so a client with only
 * two lines of business does not render an empty column.
 */
export function groupServicesByCategory(services: Service[]): ServiceGroup[] {
  const buckets = new Map<ServiceCategory, Service[]>(
    SERVICE_CATEGORY_ORDER.map((c) => [c, []])
  );

  for (const s of services) {
    const key = CANONICAL.get(norm(s.data.category)) ?? FALLBACK_CATEGORY;
    buckets.get(key)!.push(s);
  }

  const grouped = SERVICE_CATEGORY_ORDER
    .map((title) => ({ title, services: buckets.get(title)! }))
    .filter((g) => g.services.length > 0);

  // Belt and braces: grouping must never lose a service. If this ever trips,
  // the nav is about to under-report and the bug is here, not in the content.
  const total = grouped.reduce((n, g) => n + g.services.length, 0);
  if (total !== services.length) {
    throw new Error(
      `groupServicesByCategory dropped services: ${services.length} in, ${total} out.`
    );
  }

  return grouped;
}
