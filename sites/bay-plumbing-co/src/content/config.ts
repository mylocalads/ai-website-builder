import { defineCollection, z } from 'astro:content';

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    title_highlight: z.string().optional(),
    // Which market this service page is written for. Drives the two nav
    // dropdowns, the two /services sub-indexes, and the grouping on the home
    // grid and in the footer.
    //
    // REQUIRED on purpose — no default. A service that silently fell back to
    // one audience would vanish from the other menu with nothing failing at
    // build time, which is the same class of bug as the sliced-collection 404
    // documented in lib/limits.ts.
    audience: z.enum(['residential', 'commercial']),
    category: z.string().optional(),
    seo_h1: z.string().optional(),
    short_description: z.string(),
    long_description: z.string(),
    icon: z.string().optional(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    // URL or local path (e.g. /img/foo.jpg). Client photos are better served
    // from public/ than hotlinked off the client's old CMS, which can vanish.
    hero_photo: z.string().optional(),
    // A SECOND photo, distinct from hero_photo, for the AboutSection figure.
    // The service page used to pass hero_photo to BOTH the hero background and
    // the About figure, so the same image rendered twice on every service page.
    // Left unset, the About section renders text-only rather than repeating the
    // hero — that is the intended fallback, not a bug.
    about_photo: z.string().optional(),
    // Describes the about_photo for screen readers. The page previously fell
    // back to a templated "{title} — {business}" label, which names the service
    // rather than describing the image. Mirrors landmark_alt on service_areas.
    about_photo_alt: z.string().optional(),
    order: z.number().default(0),
    gallery: z.array(z.object({
      photo: z.string(),
      alt: z.string(),
    })).default([]),
    sub_services: z.array(z.string()).default([]),
    about_heading: z.string().optional(),
  }),
});

// Owl: service_areas entries resolve at `/service-area/{filename-slug}` via
// `src/pages/service-area/[slug].astro`. The filename MUST match the pattern
// `city-state.md` with a two-letter lowercase state (e.g. `denver-co.md`,
// `miami-fl.md`) — the schema has no `slug` field and Astro derives the entry
// slug from the filename. Because the route is nested, city slugs can no longer
// collide with top-level static routes; only `index` is reserved, enforced in
// getStaticPaths.
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
    // local_context feeds the HERO subheadline; about_body feeds the
    // AboutSection further down the page. Both used to read local_context, so
    // the identical paragraph rendered twice on every service-area page.
    // When unset the About section falls back to a GENERIC line, never to
    // local_context — falling back to it would just restage the duplication.
    about_body: z.string().optional(),
    local_context: z.string().optional(),
    // URL or local path (e.g. /img/foo.jpg). Client photos are better served
    // from public/ than hotlinked off the client's old CMS, which can vanish.
    hero_photo: z.string().optional(),
    landmark_photo: z.string().optional(),
    landmark_alt: z.string().optional(),
    // CC BY / CC BY-SA sources require visible attribution.
    landmark_credit: z.string().optional(),
    landmark_credit_href: z.string().url().optional(),
    order: z.number().default(0),
    gallery: z.array(z.object({
      photo: z.string(),
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

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publish_date: z.string().refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), {
      message: 'publish_date must be ISO yyyy-mm-dd so posts sort correctly',
    }),
    read_time: z.string(),
    // URL or local path (e.g. /img/foo.jpg). Client photos are better served
    // from public/ than hotlinked off the client's old CMS, which can vanish.
    hero_image: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
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
      logo_url: z.string().optional(),            // URL or local path, e.g. /logo.png
      // Light-on-dark variant of the logo, for surfaces the primary mark would
      // disappear on. This site inverts the header to the brand red, so the
      // header reads this and the footer — still on a light background — keeps
      // logo_url. Unset, Header falls back to logo_url and nothing changes.
      logo_url_inverse: z.string().optional(),
      default_hero_photo: z.string().optional(),  // URL or local path
      // URL or local path, matching default_hero_photo above. This was
      // `.url()`-only, which silently made self-hosting impossible: a client
      // video dropped in public/ can only be referenced as `/video/x.mp4`, and
      // that fails URL validation, so the only way to satisfy the schema was to
      // hardcode the deploy domain — which then breaks on every preview URL and
      // the day a custom domain is attached.
      default_hero_video: z.string().optional(),
      about_photo: z.string().optional(),         // URL or local path
      team_photo: z.string().optional(),          // URL or local path
      team_members: z.array(z.object({
        name: z.string(),
        role: z.string().optional(),
        photo: z.string(),
        bio: z.string().optional(),
      })).default([]),
      tagline: z.string(),
      phone: z.string(),
      phone_display: z.string(),
      // Bay Plumbing has run two published numbers for decades — a Miami line
      // and a Key Biscayne line — and the client treats both as primary. The
      // header stacks them; everywhere else (footer, JSON-LD, CTA copy) still
      // uses `phone`, so an unset secondary changes nothing.
      phone_label: z.string().optional(),
      phone_secondary: z.string().optional(),
      phone_secondary_display: z.string().optional(),
      phone_secondary_label: z.string().optional(),
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
        logo_url: z.string().url(),
        link_url: z.string().url().optional(),
      })).default([]),
      why_choose_us: z.array(z.object({
        // Optional and unused by the owl template: WhyChooseUs renders a
        // typographic tile grid with no icon slot. Kept for firefly parity.
        icon: z.string().optional(),
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
        us_label: z.string().default('US'),
        them_label: z.string().default('THEM'),
        us_photo: z.string().optional(),
        them_photo: z.string().optional(),
        rows: z.array(z.object({
          label: z.string(),
          us: z.boolean().default(true),
          them: z.boolean().default(false),
        })).default([]),
      }).default({ enabled: false, us_label: 'US', them_label: 'THEM', rows: [] }),
      gallery: z.array(z.object({
        title: z.string().optional(),
        location: z.string().optional(),
        photo: z.string(),
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
        // Native EstimateForm: operator-supplied POST endpoint and captcha
        // markup. Never synthesize either — an unset action renders the
        // form disabled rather than silently dropping submissions.
        form_action_url: z.string().url().optional(),
        captcha_snippet: z.string().optional(),
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
      // Native EstimateForm copy and options. `services` feeds BOTH the form's
      // <select> and the server-side allowlist in pages/api/estimate.ts, which
      // read it through src/lib/services.ts — see that file for why they must
      // not be maintained separately. Left empty, the form falls back to a
      // vertical-neutral list; a real intake should always supply this, because
      // the options are what the lead record ends up saying the job is.
      estimate_form: z.object({
        heading: z.string().optional(),
        services: z.array(z.string()).default([]),
      }).default({ services: [] }),
      // Site-wide default copy for the ClosingCTA band, which appears on eleven
      // pages. Unset, only a neutral headline and button render — no body. That
      // is deliberate: the body is where a guarantee ("no payment until you're
      // satisfied"), a founding year, or a service area gets asserted, and none
      // of those may be inherited from a template. Pages with a different ask
      // still override per call site.
      closing_cta: z.object({
        headline: z.string().optional(),
        body: z.string().optional(),
        cta_text: z.string().optional(),
        cta_href: z.string().optional(),
      }).default({}),
      // Blog section naming. `heading` is the <h2> above the recent-articles
      // row; `description` is the /blog meta description. Both default to
      // trade-agnostic copy — "Roofing Advice" on a landscaper's site is the
      // kind of leftover this exists to prevent.
      blog_section: z.object({
        heading: z.string().optional(),
        description: z.string().optional(),
      }).default({}),
    }),
    z.object({
      kind: z.literal('home'),
      hero: z.object({
        eyebrow: z.string().optional(),
        headline: z.string(),
        subheadline: z.string(),
        cta_text: z.string(),
        cta_href: z.string(),
        photo: z.string().optional(),
        video: z.string().optional(),   // URL or local path — see default_hero_video
        video_link_text: z.string().optional(),
        video_link_href: z.string().optional(),
        trust_badges: z.array(z.object({
          mark: z.enum(['google', 'bbb']).optional(),
          rating: z.number().optional(),
          label: z.string(),
          sublabel: z.string().optional(),
        })).default([]),
        quote_card: z.object({
          quote: z.string(),
          author: z.string().optional(),
          author_photo: z.string().optional(),
          cta_text: z.string(),
          cta_href: z.string(),
          rating: z.number().optional(),
          review_count: z.number().optional(),
        }).optional(),
      }),
      promise_bar: z.array(z.union([
        z.string(),
        z.object({ text: z.string(), icon: z.string().optional() }),
      ])).default([]),
      promise_band: z.object({
        eyebrow: z.string().optional(),
        headline: z.string(),
        body: z.string(),
        cta_text: z.string().optional(),
        cta_href: z.string().optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
      }).optional(),
      signature_system: z.object({
        eyebrow: z.string().optional(),
        headline: z.string(),
        intro: z.string().optional(),
        blocks: z.array(z.object({
          title: z.string(),
          body: z.string(),
          // `icon` is a KEY into the component's icon registry (shield,
          // document, umbrella, calendar, broom, home). An unknown key
          // renders nothing — it is never printed as text.
          icon: z.string().optional(),
          image: z.string().optional(),
        })).default([]),
        steps_title: z.string().optional(),
        steps_icon: z.string().optional(),   // icon registry key
        steps: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
        guarantee: z.object({
          title: z.string(),
          body: z.string(),
          cta_text: z.string().optional(),
          cta_href: z.string().optional(),
          badge_image: z.string().optional(),   // URL or local path e.g. /badge.svg
          badge_alt: z.string().optional(),
        }).optional(),
      }).optional(),
      process_steps: z.object({
        headline: z.string(),
        steps: z.array(z.object({
          label: z.string(),
          title: z.string(),
          body: z.string().optional(),
          icon: z.string().optional(),
        })).default([]),
        cta_text: z.string().optional(),
        cta_href: z.string().optional(),
      }).optional(),
      about_block: z.object({
        eyebrow: z.string().optional(),
        headline: z.string(),
        body: z.string(),
        checklist: z.array(z.string()).default([]),
        photo: z.string().optional(),        // URL or local path
        photo_alt: z.string().optional(),
        // Set true for a transparent PNG cut-out (e.g. the owner). Drops the
        // rounded frame and bottom-aligns so the subject stands on the baseline
        // instead of floating in a rounded box.
        photo_cutout: z.boolean().default(false),
        cta_text: z.string().optional(),
        cta_href: z.string().optional(),
      }).optional(),
      seo_body: z.object({
        eyebrow: z.string().optional(),
        headline: z.string(),
        paragraphs: z.array(z.string()).default([]),
        checklist: z.array(z.string()).default([]),
        image: z.string().optional(),
        image_alt: z.string().optional(),
        image_position: z.enum(['left', 'right']).optional(),
        review: z.object({
          name: z.string(),
          text: z.string(),
          rating: z.number().optional(),
          source: z.string().optional(),
          avatar: z.string().optional(),
        }).optional(),
        cta_text: z.string().optional(),
        cta_href: z.string().optional(),
      }).optional(),
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
      // Optional cost table on /pricing. Shape is deliberately generic — an
      // n-column table of strings — because what a client can honestly publish
      // varies: a roofer may have per-square ranges, a mechanical contractor
      // may only have the variables that drive a quote. The template ships NO
      // default rows: an invented rate card is a price the client never agreed
      // to, so an unset cost_table hides the section entirely.
      cost_table: z.object({
        heading: z.string(),
        lede: z.string().optional(),
        columns: z.array(z.string()).min(2),
        rows: z.array(z.array(z.string())).default([]),
        footnote: z.string().optional(),
      })
        .refine((t) => t.rows.every((r) => r.length === t.columns.length), {
          message: 'every cost_table row must have exactly as many cells as there are columns',
        })
        .optional(),
    }),
    z.object({
      kind: z.literal('our-work'),
      intro: z.string(),
      projects: z.array(z.object({
        title: z.string(), location: z.string().optional(), photo: z.string(),
        alt: z.string(), description: z.string().optional(),
      })),
    }),
  ]),
});

export const collections = { services, service_areas, legal, site, blog };
