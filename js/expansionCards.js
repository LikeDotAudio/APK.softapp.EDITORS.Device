// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
/* EXPANSION CARDS: generic types from config, real products from the BIM library.
   config/expansion-cards.json `generic` holds the card TYPES a design can name
   before a product is chosen (always offered; older blocks' slots name their ids);
   `bim_classes` names the library part classes that are card PRODUCTS, offered
   beside them when the library holds any. No card list lives in this source, and
   a generic type is never put in the library as if it were a product.
   partToCard is pure; loadExpansionCards takes its fetch so it runs under node. */

import { bimApi } from './bimLibrary.js';

export const CARDS_CONFIG_URL = './config/expansion-cards.json';

/** A BIM part → the card shape the slot calculators read. Unknown power stays 0 (adds nothing). */
export function partToCard(part) {
  const ports = (part.ports || []).reduce((n, p) => n + (Number(p.count) || 1), 0);
  return {
    id: part.id,
    name: part.name || [part.manufacturer, part.model].filter(Boolean).join(' ') || part.id,
    ports,
    powerW: Number(part.power?.watts) || 0,
    type: part.class || part.category || 'Other',
    bimId: part.id,
  };
}

/**
 * The cards: the library's card products (when it answers with any) and the
 * config's generic types, products first.
 * → { cards, source: 'bim+config' | 'bim' | 'config' | 'none', error } — error is the
 * library's (or the config's) failure, for APKSoftapp.showProblem; cards is never undefined.
 */
export async function loadExpansionCards({ fetchImpl = globalThis.fetch, api = bimApi(), configUrl = CARDS_CONFIG_URL } = {}) {
  let config = { bim_classes: [], generic: [] };
  let error = null;
  try {
    const res = await fetchImpl(configUrl, { cache: 'no-store' });
    if (!res.ok) throw Object.assign(new Error(`${configUrl}: ${res.status}`), { code: 'fetch_failed' });
    config = { ...config, ...(await res.json()) };
  } catch (e) {
    error = e;
  }
  // `fallback` is this file's name for `generic` before 2026-11-04; still read.
  const generic = Array.isArray(config.generic) ? config.generic : Array.isArray(config.fallback) ? config.fallback : [];
  let products = [];
  const classes = (config.bim_classes || []).filter(Boolean);
  if (classes.length) {
    try {
      const qs = new URLSearchParams({ class: classes.join(','), full: '1', limit: '1000' });
      const res = await fetchImpl(`${api}/parts?${qs}`);
      if (!res.ok) throw Object.assign(new Error(`BIM card parts: ${res.status}`), { status: res.status, code: res.status >= 500 ? 'http_server_error' : 'fetch_failed' });
      const page = await res.json();
      products = (page.items || []).map(partToCard);
    } catch (e) {
      if (!e.code) e.code = 'fetch_failed';
      error = error || e;
    }
  }
  const ids = new Set(products.map((c) => c.id));
  const cards = [...products, ...generic.filter((c) => !ids.has(c.id))];
  const source = products.length && generic.length ? 'bim+config' : products.length ? 'bim' : generic.length ? 'config' : 'none';
  return { cards, source, error: products.length ? null : error };
}

/** The card a slot holds, from a card list. */
export function cardFor(cards, cardId) {
  return cardId ? (cards || []).find((c) => c.id === cardId) || null : null;
}
