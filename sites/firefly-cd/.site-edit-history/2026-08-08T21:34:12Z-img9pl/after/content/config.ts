import { defineCollection, z } from 'astro:content';

/**
 * A reference to an image.
 *
 * Normally a bare filename in src/assets/images/ — scripts/localize-images.mjs
 * pulls remote images into the repo so astro:assets + sharp can resize them,
 * emit modern formats, and supply intrinsic width/height. A URL string is
 * invisible to that pipeline, which is how this site once shipped a 2.1 MB PNG.
 *
 * Absolute URLs still validate, so a not-yet-localised image degrades to a
 * plain remote <img> rather than failing the build.
 */
const imageRef = z.string().min(1);

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    title_highlight: z.string().optional(),
    seo_h1: z.string().optional(),
    short_description: z.string(),
    long_description: z.string(),
    icon: z.string().optional(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    hero_photo: imageRef.optional(),
    order: z.number().default(0),
    gallery: z.array(z.object({
      photo: imageRef,
      alt: z.string(),
    })).default([]),
    sub_services: z.array(z.string()).default([]),
    about_heading: z.string().optional(),
  }),
});

// v2.2: service_areas entries resolve at the flat root URL `/{filename-slug}`
// via `src/pages/[area].astro`. The filename MUST match the pattern
// `city-state.md` with a two-letter lowercase state (e.g. `denver-co.md`,
// `miami-fl.md`) since Task 10 removed the `slug` field from the schema and
// Astro derives the entry slug from the filename. Reserved top-level slugs
// (about, services, service-areas, contact, pricing, our-work, privacy,
// terms, accessibility, 404, _astro, sitemap-index.xml, sitemap-0.xml,
// robots.txt) MUST NOT be used — the `[area].astro` route enforces this
// at build time in getStaticPaths.
const service_areas = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    county: z.string().optional(),
    state: z.string(),
    state_abbr: z.string()
      .length(2)
      .refine((v) => /^[a-z]{2}$/.test(v), {
        message: 'state_abbr must be two lowercase letters (e.g. "co", "fl") to match the filename slug convention',
      })
      .optional(),
    neighborhoods: z.array(z.string()).default([]),
    local_context: z.string().optional(),
    hero_photo: imageRef.optional(),
    landmark_photo: imageRef.optional(),
    landmark_alt: z.string().optional(),
    order: z.number().default(0),
    gallery: z.array(z.object({
      photo: imageRef,
      alt: z.string(),
    })).default([]),
  }),
});

const legal = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    updated: z.string(),
  }),
});

const codeInjectionSlots = z.object({
  head: z.string().optional(),
  body_start: z.string().optional(),
  body_end: z.string().optional(),
});

// project-map:begin
// One completed project shown as a pin on the /our-work map and as a card in
// the grid below it.
//
// There is deliberately NO address field, at any level. The street address is
// used once, at skill time, to geocode; it is never written here. Privacy is
// enforced by the absence of the data, not by a rendering rule that someone
// could later forget to apply.
const projectMapProject = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, {
    message: 'id must be lowercase alphanumeric with hyphens, e.g. "spokane-wa-2026-03-01"',
  }),
  city: z.string().min(1),
  state: z.string().length(2).refine((v) => /^[A-Z]{2}$/.test(v), {
    message: 'state must be two uppercase letters (e.g. "WA") — this is display text, unlike service_areas.state_abbr',
  }),
  // Optional so a project whose address will not geocode still appears in the
  // list and photo grid; it simply gets no pin. Without this, one unparseable
  // rural address forces either faking coordinates or dropping a real project.
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  precision: z.enum(['street', 'city', 'manual']).default('street'),
  // YYYY-MM, not a full date. Day-level precision combined with a street-level
  // pin and public permit records is a re-identification vector, and the UI
  // only ever shows month + year.
  completed: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'completed must be YYYY-MM, e.g. "2026-03"',
  }),
  project_type: z.string().min(1),
  products_used: z.array(z.string()).default([]),
  photos: z.array(z.object({
    url: imageRef,
    alt: z.string().min(1),
  })).min(1),
  description: z.string().optional(),
  // Display override. Default is "Project in {city}, {state}".
  title: z.string().optional(),
}).refine((p) => (p.lat === undefined) === (p.lng === undefined), {
  message: 'lat and lng must both be present or both absent',
});
// project-map:end

const site = defineCollection({
  type: 'data',
  schema: z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('config'),
      business_name: z.string(),
      legal_name: z.string().optional(),
      logo_url: imageRef.optional(),
      default_hero_photo: imageRef.optional(),
      default_hero_video: z.string().url().optional(),
      about_photo: imageRef.optional(),
      team_photo: imageRef.optional(),
      team_members: z.array(z.object({
        name: z.string(),
        role: z.string().optional(),
        photo: imageRef,
        bio: z.string().optional(),
      })).default([]),
      tagline: z.string(),
      phone: z.string(),
      phone_display: z.string(),
      email: z.string().email().optional(),
      address: z.object({
        street: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postal: z.string().optional(),
        country: z.string().default('US'),
      }),
      marketing_city: z.string().optional(),
      marketing_state: z.string().optional(),
      geo: z.object({ lat: z.number(), lng: z.number() }).optional(),
      hours: z.record(z.string()).optional(),
      site_url: z.string().url(),
      rating: z.number().optional(),
      review_count: z.number().optional(),
      licensed: z.boolean().default(false),
      insured: z.boolean().default(false),
      bonded: z.boolean().default(false),
      years_in_business: z.number().optional(),
      social: z.record(z.string().url()).default({}),
      reference_urls: z.array(z.string().url()).default([]),
      // DEPRECATED (v2.2): section order is fixed per page type; this field is no longer read.
      section_rhythm: z.array(z.string()).default([]),
      partners: z.array(z.object({
        name: z.string(),
        logo_url: imageRef,
        link_url: z.string().url().optional(),
      })).default([]),
      why_choose_us: z.array(z.object({
        icon: z.string(),
        title: z.string(),
        description: z.string(),
      })).default([]),
      financing: z.object({
        enabled: z.boolean().default(false),
        headline: z.string().optional(),
        description: z.string().optional(),
        cta_text: z.string().optional(),
        cta_href: z.string().optional(),
        logo_url: imageRef.optional(),
      }).default({ enabled: false }),
      us_vs_them: z.object({
        enabled: z.boolean().default(false),
        headline: z.string().optional(),
        us_label: z.string().default('US'),
        them_label: z.string().default('THEM'),
        us_photo: imageRef.optional(),
        them_photo: imageRef.optional(),
        rows: z.array(z.object({
          label: z.string(),
          us: z.boolean().default(true),
          them: z.boolean().default(false),
        })).default([]),
      }).default({ enabled: false, us_label: 'US', them_label: 'THEM', rows: [] }),
      gallery: z.array(z.object({
        title: z.string().optional(),
        location: z.string().optional(),
        photo: imageRef,
        alt: z.string(),
        description: z.string().optional(),
      })).default([]),
      compliance: z.object({
        ada: z.boolean().default(true),
        gdpr: z.boolean().default(true),
        a2p: z.boolean().default(true),
      }).default({ ada: true, gdpr: true, a2p: true }),
      crm: z.object({
        provider: z.literal('ghl').default('ghl'),
        chat_widget_snippet: z.string().optional(),
        contact_form_embed_url: z.string().url().optional(),
        estimate_form_embed_url: z.string().url().optional(),
        reviews_widget_snippet: z.string().optional(),
        call_tracking_snippet: z.string().optional(),
        call_tracking_number: z.string().optional(),
        calendar_embed_snippet: z.string().optional(),
        contact_form_snippet: z.string().optional(),
      }).default({ provider: 'ghl' }),
      code_injection: codeInjectionSlots.extend({
        per_page: z.record(codeInjectionSlots).default({}),
      }).default({ per_page: {} }),
      services_section: z.object({
        eyebrow: z.string().default('Our Services'),
        heading_lead: z.string().optional(),
        heading_rest: z.string().optional(),
        subtitle: z.string().optional(),
      }).default({ eyebrow: 'Our Services' }),
    }),
    z.object({
      kind: z.literal('home'),
      hero: z.object({
        eyebrow: z.string().optional(),
        headline: z.string(),
        subheadline: z.string(),
        cta_text: z.string(),
        cta_href: z.string(),
        photo: imageRef.optional(),
      }),
      testimonials: z.array(z.object({
        name: z.string(), location: z.string().optional(), text: z.string(), rating: z.number().optional(),
      })).default([]),
      faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    }),
    z.object({ kind: z.literal('about'), story: z.string() }),
    z.object({
      kind: z.literal('pricing'),
      intro: z.string(),
      packages: z.array(z.object({
        name: z.string(), price: z.string(), unit: z.string().optional(),
        includes: z.array(z.string()), cta_text: z.string(), cta_href: z.string(),
      })),
      notes: z.string().optional(),
    }),
    z.object({
      kind: z.literal('our-work'),
      intro: z.string(),
      // LEGACY shape — unchanged, now defaulted so files that omit it validate.
      projects: z.array(z.object({
        title: z.string(), location: z.string().optional(), photo: imageRef,
        alt: z.string(), description: z.string().optional(),
      })).default([]),
      // project-map:begin
      // Populated by the /project-map skill. Defaulted so every our-work.json
      // written before this feature existed validates with zero migration.
      project_map: z.object({
        enabled: z.boolean().default(false),
        heading: z.string().default('Where we work'),
        intro: z.string().optional(),
        map_center: z.object({
          lat: z.number(),
          lng: z.number(),
          zoom: z.number().int().min(1).max(19),
        }).optional(),
        projects: z.array(projectMapProject).default([]),
      }).default({ enabled: false, heading: 'Where we work', projects: [] }),
      // project-map:end
    }),
  ]),
});

export const collections = { services, service_areas, legal, site };
