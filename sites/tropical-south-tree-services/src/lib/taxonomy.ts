/**
 * Service grouping, in one place.
 *
 * This client sells services across two distinct lines of business, and the nav
 * reflects that with two separate top-level menus:
 *
 *   "Tree Services"        → TREE_MENU_CATEGORIES  (20 services, 3 groups)
 *   "Landscaping Services" → LANDSCAPING_MENU_CATEGORIES (2 services, 1 group)
 *
 * Grouping is PRESENTATION ONLY. It never changes which pages exist: every
 * service handed to `groupServicesByCategory` comes back in exactly one group,
 * including any whose `category` is missing or unrecognised (those fall into the
 * fallback rather than being silently dropped). That property is what keeps
 * `src/lib/limits.ts`'s featured ⊆ generated invariant intact — a service can
 * never disappear from the nav because someone typo'd its category.
 *
 * `category` is a free-string field in the content schema, so matching is done
 * case-insensitively and trimmed.
 */

import type { CollectionEntry } from 'astro:content';

type Service = CollectionEntry<'services'>;

/** Groups shown under the "Tree Services" menu, in display order. */
export const TREE_MENU_CATEGORIES = [
  'Tree Care Services',
  'Land & Specialty Services',
  'Arborist Services',
] as const;

/** Groups shown under the "Landscaping Services" menu, in display order. */
export const LANDSCAPING_MENU_CATEGORIES = [
  'Landscaping Services',
] as const;

/** Every category, in the order the /services hub lists them. */
export const SERVICE_CATEGORY_ORDER = [
  ...TREE_MENU_CATEGORIES,
  ...LANDSCAPING_MENU_CATEGORIES,
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
 * one line of business does not render an empty column.
 *
 * `only` restricts the result to a subset of categories — that is how the two
 * nav menus each show their own half without either one silently swallowing the
 * other's services.
 */
export function groupServicesByCategory(
  services: Service[],
  only?: readonly ServiceCategory[]
): ServiceGroup[] {
  const buckets = new Map<ServiceCategory, Service[]>(
    SERVICE_CATEGORY_ORDER.map((c) => [c, []])
  );

  for (const s of services) {
    const key = CANONICAL.get(norm(s.data.category)) ?? FALLBACK_CATEGORY;
    buckets.get(key)!.push(s);
  }

  const wanted = only ?? SERVICE_CATEGORY_ORDER;
  const grouped = SERVICE_CATEGORY_ORDER
    .filter((c) => wanted.includes(c))
    .map((title) => ({ title, services: buckets.get(title)! }))
    .filter((g) => g.services.length > 0);

  // Belt and braces: when grouping the FULL set, nothing may be lost. Skipped
  // when `only` is passed, because a subset is expected to drop the rest.
  if (!only) {
    const total = grouped.reduce((n, g) => n + g.services.length, 0);
    if (total !== services.length) {
      throw new Error(
        `groupServicesByCategory dropped services: ${services.length} in, ${total} out.`
      );
    }
  }

  return grouped;
}
