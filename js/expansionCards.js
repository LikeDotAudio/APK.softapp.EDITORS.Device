// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
/* EXPANSION CARDS ARE BIM LIBRARY PARTS. No card list lives in this source:
   config/expansion-cards.json names the part classes that are cards
   (bim_classes) and carries a fallback list for when the library is
   unreachable or has no card parts yet (standalone use, older blocks whose
   slots name the fallback ids). partToCard is pure; loadExpansionCards takes
   its fetch so it runs under node. */

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
 * The cards, from the library when it answers with any, else the config's fallback.
 * → { cards, source: 'bim' | 'config' | 'none', error } — error is the library's (or the
 * config's) failure, for APKSoftapp.showProblem; cards is never undefined.
 */
export async function loadExpansionCards({ fetchImpl = globalThis.fetch, api = bimApi(), configUrl = CARDS_CONFIG_URL } = {}) {
  let config = { bim_classes: [], fallback: [] };
  let error = null;
  try {
    const res = await fetchImpl(configUrl, { cache: 'no-store' });
    if (!res.ok) throw Object.assign(new Error(`${configUrl}: ${res.status}`), { code: 'fetch_failed' });
    config = { ...config, ...(await res.json()) };
  } catch (e) {
    error = e;
  }
  const classes = (config.bim_classes || []).filter(Boolean);
  if (classes.length) {
    try {
      const qs = new URLSearchParams({ class: classes.join(','), full: '1', limit: '1000' });
      const res = await fetchImpl(`${api}/parts?${qs}`);
      if (!res.ok) throw Object.assign(new Error(`BIM card parts: ${res.status}`), { status: res.status, code: res.status >= 500 ? 'http_server_error' : 'fetch_failed' });
      const page = await res.json();
      const cards = (page.items || []).map(partToCard);
      if (cards.length) return { cards, source: 'bim', error: null };
    } catch (e) {
      if (!e.code) e.code = 'fetch_failed';
      error = error || e;
    }
  }
  const fallback = Array.isArray(config.fallback) ? config.fallback : [];
  return { cards: fallback, source: fallback.length ? 'config' : 'none', error };
}

/** The card a slot holds, from a card list. */
export function cardFor(cards, cardId) {
  return cardId ? (cards || []).find((c) => c.id === cardId) || null : null;
}
