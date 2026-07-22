import { defineCollection, z } from 'astro:content';

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    short_description: z.string(),
    long_description: z.string(),
    icon: z.string().optional(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    hero_photo: z.string().url().optional(),
    order: z.number().default(0),
    gallery: z.array(z.object({
      photo: z.string().url(),
      alt: z.string(),
    })).default([]),
  }),
});

const service_areas = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    county: z.string().optional(),
    state: z.string(),
    state_abbr: z.string().length(2).optional(),
    neighborhoods: z.array(z.string()).default([]),
    local_context: z.string().optional(),
    order: z.number().default(0),
    gallery: z.array(z.object({
      photo: z.string().url(),
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

const site = defineCollection({
  type: 'data',
  schema: z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('config'),
      business_name: z.string(),
      legal_name: z.string().optional(),
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
        logo_url: z.string().url(),
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
        logo_url: z.string().url().optional(),
      }).default({ enabled: false }),
      us_vs_them: z.object({
        enabled: z.boolean().default(false),
        headline: z.string().optional(),
        us_label: z.string().optional(),
        them_label: z.string().optional(),
        rows: z.array(z.object({ us: z.string(), them: z.string() })).default([]),
      }).default({ enabled: false, rows: [] }),
      gallery: z.array(z.object({
        title: z.string().optional(),
        location: z.string().optional(),
        photo: z.string().url(),
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
      }).default({ provider: 'ghl' }),
      code_injection: codeInjectionSlots.extend({
        per_page: z.record(codeInjectionSlots).default({}),
      }).default({ per_page: {} }),
    }),
    z.object({
      kind: z.literal('home'),
      hero: z.object({
        eyebrow: z.string().optional(),
        headline: z.string(),
        subheadline: z.string(),
        cta_text: z.string(),
        cta_href: z.string(),
        photo: z.string().url().optional(),
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
      projects: z.array(z.object({
        title: z.string(), location: z.string().optional(), photo: z.string().url(),
        alt: z.string(), description: z.string().optional(),
      })),
    }),
  ]),
});

export const collections = { services, service_areas, legal, site };
