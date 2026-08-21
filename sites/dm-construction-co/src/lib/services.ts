/**
 * The service options offered by the native estimate form — in ONE place.
 *
 * Two consumers need this list and they must never disagree:
 *
 *   1. `components/EstimateForm.astro` renders it as the <select> options.
 *   2. `pages/api/estimate.ts` uses it as a server-side allowlist and rejects
 *      any `service` value that is not in it.
 *
 * When those two lists drift, the form offers an option the endpoint refuses,
 * and every submission choosing it is bounced as invalid. Nothing fails at
 * build time and nothing appears in a log the operator reads — the lead is just
 * gone. That is exactly what happened when each client hand-edited both copies
 * of a hardcoded array, so neither file owns the list any more: both import it
 * from here.
 *
 * The list is CONTENT, supplied per client via `estimate_form.services` in
 * `src/content/site/config.json`. The config is read through a direct JSON
 * import rather than `getEntry('site', 'config')` because the API route runs as
 * a serverless function: a static import is resolved at build time and cannot
 * fail at request time, and a content-collection lookup that throws inside the
 * endpoint would reject every lead the site receives.
 */
import siteConfig from '../content/site/config.json';

/**
 * Vertical-neutral fallback, used when a client's config leaves
 * `estimate_form.services` empty.
 *
 * These are deliberately trade-agnostic: the template is cloned for roofers,
 * HVAC/MEP contractors, landscapers, pool builders and remodelers, and a
 * default naming one trade's work ships that trade's vocabulary to every other
 * client. A real intake should always replace this — it is a floor, not a
 * recommendation.
 */
export const DEFAULT_ESTIMATE_SERVICES = [
  'Repair',
  'Installation or replacement',
  'Maintenance',
  'Inspection or estimate',
  'Emergency service',
  'Other',
];

/**
 * Vertical-neutral default heading for the estimate form, overridable per
 * client via `estimate_form.heading` and per page via the component's
 * `heading` prop.
 */
export const DEFAULT_ESTIMATE_HEADING = 'Get Your Free Estimate Today!';

const configured: string[] = (siteConfig as any).estimate_form?.services ?? [];

/** Options rendered in the form's service <select>, in the order given. */
export const ESTIMATE_SERVICES: string[] =
  configured.length > 0 ? configured : DEFAULT_ESTIMATE_SERVICES;

/** The same list as a lookup, for the endpoint's allowlist check. */
export const ESTIMATE_SERVICE_SET: ReadonlySet<string> = new Set(ESTIMATE_SERVICES);
