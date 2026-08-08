// project-map: shared payload builder.
//
// This is the single definition of the project-map wire shape. Three consumers
// call it — src/pages/projects.json.ts, src/pages/projects.js.ts, and
// src/components/ProjectMap.astro — so the JSON feed and the server-rendered
// HTML can never disagree about what a project is.
//
// src/content/site/our-work.json is the source of truth. Everything this module
// emits is derived from it at build time; there is no hand-maintained copy that
// could drift.

import { getEntry } from 'astro:content';

export interface ProjectMapPhoto {
  url: string;
  alt: string;
}

export interface ProjectMapEntry {
  id: string;
  title: string;
  city: string;
  state: string;
  place: string;
  lat: number | null;
  lng: number | null;
  precision: 'street' | 'city' | 'manual';
  completed: string;
  completed_label: string;
  project_type: string;
  products_used: string[];
  photos: ProjectMapPhoto[];
  description: string | null;
}

export interface ProjectMapFacetValue {
  value: string;
  label: string;
  count: number;
}

export interface ProjectMapPayload {
  v: 1;
  generated_at: string;
  site: { business_name: string; site_url: string | null };
  map: {
    center: { lat: number; lng: number; zoom: number } | null;
    heading: string;
    intro: string | null;
  };
  facets: {
    type: ProjectMapFacetValue[];
    product: ProjectMapFacetValue[];
    place: ProjectMapFacetValue[];
  };
  projects: ProjectMapEntry[];
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "2026-03" -> "March 2026". Month precision only, by design. */
export function monthYear(completed: string): string {
  const [y, m] = completed.split('-');
  const idx = Number(m) - 1;
  return `${MONTHS[idx] ?? m} ${y}`;
}

/** Lowercase, hyphenated, ASCII-safe. Used for facet values and hash state. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Facet values are derived from the projects themselves, so a chip can never
 * exist for a value no project has, and no value can be missing a chip.
 */
function buildFacet(values: string[]): ProjectMapFacetValue[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const raw of values) {
    const label = raw.trim();
    if (!label) continue;
    const value = slugify(label);
    if (!value) continue;
    const hit = counts.get(value);
    if (hit) hit.count += 1;
    else counts.set(value, { label, count: 1 });
  }
  return [...counts.entries()]
    .map(([value, { label, count }]) => ({ value, label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export async function buildProjectMapPayload(): Promise<ProjectMapPayload> {
  const site = (await getEntry('site', 'config'))!.data as any;
  const work = (await getEntry('site', 'our-work').catch(() => null))?.data as any;
  const pm = work?.project_map ?? { enabled: false, heading: 'Where we work', projects: [] };

  const source: any[] = pm.enabled ? (pm.projects ?? []) : [];

  const projects: ProjectMapEntry[] = source
    .map((p) => ({
      id: p.id,
      title: p.title ?? `Project in ${p.city}, ${p.state}`,
      city: p.city,
      state: p.state,
      place: `${p.city}, ${p.state}`,
      lat: p.lat ?? null,
      lng: p.lng ?? null,
      precision: p.precision ?? 'street',
      completed: p.completed,
      completed_label: monthYear(p.completed),
      project_type: p.project_type,
      products_used: p.products_used ?? [],
      photos: p.photos ?? [],
      description: p.description ?? null,
    }))
    // Newest first — the most recent work is the most persuasive.
    .sort((a, b) => b.completed.localeCompare(a.completed) || a.id.localeCompare(b.id));

  return {
    v: 1,
    generated_at: new Date().toISOString(),
    site: {
      business_name: site.business_name,
      site_url: site.site_url ?? null,
    },
    map: {
      center: pm.map_center ?? null,
      heading: pm.heading ?? 'Where we work',
      intro: pm.intro ?? null,
    },
    facets: {
      type: buildFacet(projects.map((p) => p.project_type)),
      product: buildFacet(projects.flatMap((p) => p.products_used)),
      place: buildFacet(projects.map((p) => p.place)),
    },
    projects,
  };
}
