// Browser-only adapter around cart-core. Persists to localStorage and emits a
// 'mla-cart-change' event on window so the header badge, the tile buttons, and
// the cart bar all re-render from one source of truth.
//
// All decision logic lives in cart-core.js (unit tested). This file only does
// storage and event plumbing.

import { addOns } from '../data/addOns.js';
import { addItem, removeItem, sanitize, computeTotals, dependentsOf } from './cart-core.js';

const KEY = 'mla_cart_v1';
const EVENT = 'mla-cart-change';

function read() {
  try {
    return sanitize(JSON.parse(localStorage.getItem(KEY) || '[]'), addOns);
  } catch {
    // Corrupt JSON or storage unavailable — start from an empty cart.
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Private browsing or quota exceeded — the cart still works for this page
    // view, it just will not survive a reload.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { items } }));
  return items;
}

export const cart = {
  items: read,
  has: (id) => read().includes(id),
  totals: () => computeTotals(read(), addOns),
  dependents: (id) => dependentsOf(read(), id, addOns),
  add: (id) => write(addItem(read(), id, addOns)),
  remove: (id) => write(removeItem(read(), id, addOns)),
  clear: () => write([]),
  toggle: (id) => (read().includes(id) ? cart.remove(id) : cart.add(id)),

  // Calls fn immediately with the current items, then on every change.
  // Returns an unsubscribe function.
  subscribe(fn) {
    const handler = (e) => fn(e.detail.items);
    window.addEventListener(EVENT, handler);
    fn(read());
    return () => window.removeEventListener(EVENT, handler);
  },
};

export { addOns };
