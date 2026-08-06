import { describe, it, expect } from 'vitest';
import {
  categories,
  caseStudies,
  collections,
  findCollection,
  findCaseStudy,
  allCaseStudies,
  allCaseStudyRoutes,
  caseStudiesIn,
  categoriesFor,
  primaryCategorySlug,
  canonicalPath,
  caseStudyPath,
  isDuplicateCaseStudyPath,
  SERVICE_LABEL_TO_CATEGORY,
  archivedCaseStudies,
  emptyCollections,
} from '../src/data/caseStudies.js';

const CATEGORY_SLUGS = categories.map((c) => c.slug);

describe('data integrity', () => {
  it('gives every case study at least one known category', () => {
    for (const cs of caseStudies) {
      expect(cs.categories.length, `${cs.slug} has no categories`).toBeGreaterThan(0);
      for (const slug of cs.categories) {
        expect(CATEGORY_SLUGS, `${cs.slug} tags unknown "${slug}"`).toContain(slug);
      }
    }
  });

  it('keeps case study slugs globally unique', () => {
    const slugs = caseStudies.map((cs) => cs.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('never repeats a category on one case study', () => {
    for (const cs of caseStudies) {
      expect(new Set(cs.categories).size, `${cs.slug} repeats a tag`).toBe(cs.categories.length);
    }
  });

  it('populates every required field', () => {
    const required = [
      'client', 'industry', 'location', 'duration',
      'headline', 'summary', 'dashboardImage', 'challenge', 'outcome',
    ];
    for (const cs of caseStudies) {
      for (const field of required) {
        expect(cs[field], `${cs.slug} missing ${field}`).toBeTruthy();
      }
      expect(cs.metrics.length, `${cs.slug} has no metrics`).toBeGreaterThan(0);
      expect(cs.approach.length, `${cs.slug} has no approach`).toBeGreaterThan(0);
    }
  });

  it('exposes every category as a collection, in category order', () => {
    // Including ones with nothing published — they are services we sell, and
    // /results renders an empty-state panel rather than hiding them.
    expect(collections.map((c) => c.slug)).toEqual(CATEGORY_SLUGS);
  });

  it('reports which collections are empty', () => {
    const expected = CATEGORY_SLUGS.filter(
      (slug) => !caseStudies.some((cs) => cs.categories.includes(slug))
    );
    expect(emptyCollections()).toEqual(expected);
  });

  it('gives every collection the copy its empty state needs', () => {
    // The empty panel renders tagline + intro, so a category missing either
    // would render a blank card.
    for (const collection of collections) {
      expect(collection.tagline, `${collection.slug} has no tagline`).toBeTruthy();
      expect(collection.intro, `${collection.slug} has no intro`).toBeTruthy();
      expect(collection.name, `${collection.slug} has no name`).toBeTruthy();
    }
  });

  it('starts the carousel on a category that has something to show', () => {
    // /results defaults to collections[0]; landing on an empty state would be
    // a poor first impression.
    expect(collections[0].caseStudies.length).toBeGreaterThan(0);
  });
});

describe('archived case studies', () => {
  it('keeps archived studies out of every published collection', () => {
    const published = new Set(collections.flatMap((c) => c.caseStudies.map((cs) => cs.slug)));
    for (const cs of archivedCaseStudies) {
      expect(published, `${cs.slug} is archived but still rendering`).not.toContain(cs.slug);
    }
  });

  it('keeps archived studies restorable', () => {
    // They are parked, not abandoned — tags must stay valid and slugs must not
    // collide with anything published, or restoring one would break the build.
    const publishedSlugs = new Set(caseStudies.map((cs) => cs.slug));
    for (const cs of archivedCaseStudies) {
      expect(cs.categories.length, `${cs.slug}`).toBeGreaterThan(0);
      for (const slug of cs.categories) {
        expect(CATEGORY_SLUGS, `${cs.slug} tags unknown "${slug}"`).toContain(slug);
      }
      expect(publishedSlugs, `${cs.slug} collides with a published slug`).not.toContain(cs.slug);
    }
  });

  it('still covers the single-tagged code path', () => {
    // Nothing published is single-tagged right now, so this is the only place
    // that ordering/membership behaviour for a one-tag study is exercised.
    expect(archivedCaseStudies.some((cs) => cs.categories.length === 1)).toBe(true);
  });
});

describe('multi-category membership', () => {
  it('lists a case study in every category it tags', () => {
    for (const cs of caseStudies) {
      for (const slug of cs.categories) {
        const collection = findCollection(slug);
        expect(
          collection.caseStudies.map((x) => x.slug),
          `${cs.slug} missing from ${slug}`
        ).toContain(cs.slug);
      }
    }
  });

  it('keeps a case study out of categories it does not tag', () => {
    for (const cs of caseStudies) {
      const untagged = CATEGORY_SLUGS.filter((s) => !cs.categories.includes(s));
      for (const slug of untagged) {
        // An untagged category may have nothing published at all, in which case
        // it is not exposed as a collection — that also means no leak.
        expect(
          caseStudiesIn(slug).map((x) => x.slug),
          `${cs.slug} leaked into ${slug}`
        ).not.toContain(cs.slug);
      }
    }
  });

  it('surfaces a bundled client in all of its collections at once', () => {
    // Firefly is Lead Gen + CRM + Websites — the exact bundling case this
    // model exists for.
    const bundled = caseStudies.find((cs) => cs.categories.length > 1);
    expect(bundled, 'no multi-tagged study published').toBeTruthy();
    for (const slug of bundled.categories) {
      expect(caseStudiesIn(slug).map((x) => x.slug)).toContain(bundled.slug);
    }
  });

  it('surfaces the Firefly bundle in all three of its collections', () => {
    // Lead Gen + CRM + Websites — one engagement, three services purchased.
    const firefly = caseStudies.find((cs) => cs.slug === 'firefly-contractors-design');
    expect(firefly.categories).toEqual(['lead-generation', 'crm', 'websites']);
    for (const slug of firefly.categories) {
      expect(caseStudiesIn(slug).map((x) => x.slug)).toContain('firefly-contractors-design');
    }
    // ...and stays out of the one it did not buy.
    expect(caseStudiesIn('ai-agents').map((x) => x.slug)).not.toContain('firefly-contractors-design');
  });

  it('sorts primary-tagged case studies ahead of cross-tagged ones', () => {
    for (const slug of CATEGORY_SLUGS) {
      const listed = caseStudiesIn(slug);
      const flags = listed.map((cs) => primaryCategorySlug(cs) === slug);
      const firstCrossTagged = flags.indexOf(false);
      if (firstCrossTagged === -1) continue;
      expect(
        flags.slice(firstCrossTagged).every((isPrimary) => !isPrimary),
        `${slug} interleaves cross-tagged studies with primary ones`
      ).toBe(true);
    }
  });

  it('returns tag metadata in tag order', () => {
    for (const cs of caseStudies) {
      expect(categoriesFor(cs).map((c) => c.slug)).toEqual(cs.categories);
      expect(categoriesFor(cs).every((c) => typeof c.name === 'string')).toBe(true);
    }
  });
});

describe('routing', () => {
  it('emits one route per (category, case study) pair', () => {
    const routes = allCaseStudyRoutes();
    const expected = caseStudies.reduce((sum, cs) => sum + cs.categories.length, 0);
    expect(routes.length).toBe(expected);
  });

  it('emits unique routes', () => {
    const keys = allCaseStudyRoutes().map((r) => `${r.categorySlug}/${r.caseStudy.slug}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('resolves a multi-tagged case study from each of its categories', () => {
    const bundled = caseStudies.find((cs) => cs.categories.length > 1);
    for (const slug of bundled.categories) {
      const match = findCaseStudy(slug, bundled.slug);
      expect(match, `${slug}/${bundled.slug} did not resolve`).not.toBeNull();
      expect(match.caseStudy.slug).toBe(bundled.slug);
      expect(match.collection.slug).toBe(slug);
    }
  });

  it('refuses a category the case study is not tagged into', () => {
    // Derived, so this keeps testing a real published study rather than going
    // vacuously true when a hardcoded slug gets archived.
    for (const cs of caseStudies) {
      for (const slug of CATEGORY_SLUGS.filter((s) => !cs.categories.includes(s))) {
        expect(findCaseStudy(slug, cs.slug), `${slug}/${cs.slug} should not resolve`).toBeNull();
      }
    }
  });

  it('refuses an archived case study on any category', () => {
    for (const cs of archivedCaseStudies) {
      for (const slug of CATEGORY_SLUGS) {
        expect(findCaseStudy(slug, cs.slug), `archived ${slug}/${cs.slug} resolved`).toBeNull();
      }
    }
  });

  it('refuses unknown categories and unknown clients', () => {
    const published = caseStudies[0].slug;
    expect(findCaseStudy('not-a-category', published)).toBeNull();
    expect(findCaseStudy(caseStudies[0].categories[0], 'not-a-client')).toBeNull();
  });

  it('resolves every route it emits', () => {
    for (const { categorySlug, caseStudy } of allCaseStudyRoutes()) {
      expect(findCaseStudy(categorySlug, caseStudy.slug), `${categorySlug}/${caseStudy.slug}`)
        .not.toBeNull();
    }
  });
});

describe('canonical URLs', () => {
  it('canonicalizes to the primary category', () => {
    for (const cs of caseStudies) {
      expect(canonicalPath(cs)).toBe(`/results/${cs.categories[0]}/${cs.slug}`);
    }
  });

  it('gives every case study exactly one canonical path', () => {
    const paths = caseStudies.map(canonicalPath);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('flags cross-tagged URLs as duplicates and canonical ones as not', () => {
    for (const cs of caseStudies) {
      for (const slug of cs.categories) {
        const path = caseStudyPath(cs, slug);
        const isCanonical = slug === primaryCategorySlug(cs);
        expect(isDuplicateCaseStudyPath(path), path).toBe(!isCanonical);
        // Astro emits directory-format URLs with a trailing slash.
        expect(isDuplicateCaseStudyPath(`${path}/`), `${path}/`).toBe(!isCanonical);
      }
    }
  });

  it('leaves non-case-study paths out of the duplicate filter', () => {
    for (const path of ['/', '/results', '/results/', '/team', '/cart', '/pricing-calculator']) {
      expect(isDuplicateCaseStudyPath(path), path).toBe(false);
    }
  });

  it('does not flag a URL for an unknown client', () => {
    expect(isDuplicateCaseStudyPath('/results/crm/not-a-client')).toBe(false);
  });

  it('excludes exactly the cross-tagged routes from the sitemap', () => {
    const routes = allCaseStudyRoutes();
    const kept = routes.filter(
      ({ categorySlug, caseStudy }) =>
        !isDuplicateCaseStudyPath(caseStudyPath(caseStudy, categorySlug))
    );
    expect(kept.length).toBe(caseStudies.length);
  });
});

describe('allCaseStudies()', () => {
  it('returns each case study once, not once per category', () => {
    expect(allCaseStudies().length).toBe(caseStudies.length);
    const slugs = allCaseStudies().map((cs) => cs.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('attaches resolved category metadata and the canonical path', () => {
    for (const cs of allCaseStudies()) {
      expect(cs.categoryRefs.length).toBe(cs.categories.length);
      expect(cs.primaryCategorySlug).toBe(cs.categories[0]);
      expect(cs.canonicalPath).toBe(`/results/${cs.categories[0]}/${cs.slug}`);
    }
  });
});

describe('services purchased', () => {
  it('never claims a service the study is not tagged for', () => {
    for (const cs of caseStudies) {
      for (const label of cs.servicesPurchased ?? []) {
        const mapped = SERVICE_LABEL_TO_CATEGORY[label];
        if (!mapped) continue;
        expect(cs.categories, `${cs.slug} claims "${label}"`).toContain(mapped);
      }
    }
  });

  it('lists exactly what Firefly bought, including the GBP work', () => {
    const firefly = caseStudies.find((cs) => cs.slug === 'firefly-contractors-design');
    expect(firefly.servicesPurchased).toEqual([
      'Lead Generation', 'CRM', 'Website', 'GBP Optimization',
    ]);
  });

  it('allows a service with no Results collection of its own', () => {
    // GBP Optimization is sold but has no collection, so it must not be forced
    // to match a category tag.
    expect(SERVICE_LABEL_TO_CATEGORY['GBP Optimization']).toBeUndefined();
    const firefly = caseStudies.find((cs) => cs.slug === 'firefly-contractors-design');
    expect(firefly.servicesPurchased).toContain('GBP Optimization');
    expect(firefly.categories).not.toContain('gbp-optimization');
  });

  it('retired the old activeFeatures field', () => {
    for (const cs of caseStudies) {
      expect(cs.activeFeatures, `${cs.slug} still has activeFeatures`).toBeUndefined();
    }
  });

  it('maps every category to a service label', () => {
    // Otherwise a tagged category could never be expressed as a purchased service.
    for (const category of categories) {
      const labels = Object.entries(SERVICE_LABEL_TO_CATEGORY)
        .filter(([, slug]) => slug === category.slug)
        .map(([label]) => label);
      expect(labels.length, `no service label maps to ${category.slug}`).toBeGreaterThan(0);
    }
  });
});

describe('rendering inputs', () => {
  it('pairs before and after images — never one without the other', () => {
    for (const cs of caseStudies) {
      expect(Boolean(cs.beforeImage), `${cs.slug}`).toBe(Boolean(cs.afterImage));
    }
  });

  it('pairs image dimensions with the image they describe', () => {
    // width/height are what stop the tall capture from shifting layout while
    // it loads, so a size without its image is a mistake.
    for (const cs of caseStudies) {
      if (cs.beforeImageSize) {
        expect(cs.beforeImage, `${cs.slug}`).toBeTruthy();
        expect(cs.beforeImageSize.width).toBeGreaterThan(0);
        expect(cs.beforeImageSize.height).toBeGreaterThan(0);
      }
      if (cs.afterImageSize) {
        expect(cs.afterImage, `${cs.slug}`).toBeTruthy();
        expect(cs.afterImageSize.width).toBeGreaterThan(0);
        expect(cs.afterImageSize.height).toBeGreaterThan(0);
      }
    }
  });

  it('gives Firefly real screenshots rather than the shared placeholders', () => {
    const firefly = caseStudies.find((cs) => cs.slug === 'firefly-contractors-design');
    expect(firefly.beforeImage).toBe('/case-studies/firefly-before.webp');
    expect(firefly.afterImage).toBe('/case-studies/firefly-after.webp');
    // Full-page captures — the crop-to-top treatment only matters if they are
    // in fact much taller than wide.
    expect(firefly.beforeImageSize.height / firefly.beforeImageSize.width).toBeGreaterThan(2);
    expect(firefly.afterImageSize.height / firefly.afterImageSize.width).toBeGreaterThan(2);
  });

  it('only attaches a live site link to a study that has before/after visuals', () => {
    for (const cs of caseStudies.filter((x) => x.siteUrl)) {
      expect(cs.siteUrl, `${cs.slug}`).toMatch(/^https:\/\//);
      // The link renders inside the before/after section, so it would be
      // invisible on a study without one.
      expect(Boolean(cs.beforeImage && cs.afterImage), `${cs.slug}`).toBe(true);
    }
  });

  it('carries before/after through every category a study is tagged into', () => {
    // The rebuild visual is a property of the case study, not of the category
    // the visitor arrived through.
    const withVisuals = caseStudies.filter((cs) => cs.beforeImage && cs.afterImage);
    expect(withVisuals.length).toBeGreaterThan(0);
    for (const cs of withVisuals) {
      for (const slug of cs.categories) {
        const found = caseStudiesIn(slug).find((x) => x.slug === cs.slug);
        expect(found.beforeImage, `${cs.slug} in ${slug}`).toBeTruthy();
        expect(found.afterImage, `${cs.slug} in ${slug}`).toBeTruthy();
      }
    }
  });
});
