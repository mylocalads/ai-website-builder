// Pure cart logic. No DOM, no storage, no network — everything here is a
// function of (items, catalog). The storage/event adapter is cart-store.js.
//
// `items` is always an array of add-on id strings. `catalog` is injected rather
// than imported so tests can run against a fixture and stay stable when the
// real add-on list or its prices change.

function find(catalog, id) {
  return catalog.find((a) => a.id === id);
}

export function addItem(items, id, catalog) {
  const record = find(catalog, id);
  if (!record) return items;

  const next = new Set(items);
  next.add(id);
  for (const req of record.requires) {
    if (find(catalog, req)) next.add(req);
  }
  return [...next];
}

export function dependentsOf(items, id, catalog) {
  return items.filter((itemId) => {
    const record = find(catalog, itemId);
    return record ? record.requires.includes(id) : false;
  });
}

export function removeItem(items, id, catalog) {
  const doomed = new Set([id, ...dependentsOf(items, id, catalog)]);
  return items.filter((itemId) => !doomed.has(itemId));
}

// Drops unknown ids and duplicates, then re-adds any missing dependencies.
// Guards against a stale localStorage cart after the catalog changes.
export function sanitize(items, catalog) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((id) => Boolean(find(catalog, id)))
    .reduce((acc, id) => addItem(acc, id, catalog), []);
}

export function computeTotals(items, catalog) {
  const records = items.map((id) => find(catalog, id)).filter(Boolean);

  const recurringCents = records
    .filter((r) => r.billing === 'recurring')
    .reduce((sum, r) => sum + r.priceCents, 0);

  const oneTimeCents = records
    .filter((r) => r.billing === 'one_time')
    .reduce((sum, r) => sum + r.priceCents, 0);

  // Trials in Stripe Checkout are subscription-wide, not per line item, so a
  // trial on a mixed cart would give away everything in it. Restrict the trial
  // to a cart holding exactly one trial-bearing item.
  const trialApplies = records.length === 1 && records[0].trialDays > 0;

  return {
    recurringCents,
    oneTimeCents,
    dueTodayCents: trialApplies ? 0 : recurringCents + oneTimeCents,
    trialApplies,
    needsShipping: records.some((r) => r.shipping),
    count: records.length,
  };
}
