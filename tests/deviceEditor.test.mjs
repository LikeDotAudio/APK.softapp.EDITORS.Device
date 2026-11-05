// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.

import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_DEVICE_LIBRARY } from './fixtures/defaultDevices.mjs';

import { readFileSync } from 'node:fs';
import { loadExpansionCards, partToCard } from '../js/expansionCards.js';

const CONFIG = readFileSync(new URL('../config/expansion-cards.json', import.meta.url), 'utf8');
/** A fetch that serves the config file and answers the BIM route with `bim` (or throws, as unreachable). */
const fakeFetch = (bim) => async (url) => {
  if (String(url).includes('expansion-cards.json')) return { ok: true, status: 200, json: async () => JSON.parse(CONFIG) };
  if (bim instanceof Error) throw bim;
  return { ok: true, status: 200, json: async () => bim };
};

test('Device Library Default Models', () => {
  assert.ok(DEFAULT_DEVICE_LIBRARY.length >= 3);
  const qsys = DEFAULT_DEVICE_LIBRARY.find(d => d.id === 'dev-qsys-core110f');
  assert.ok(qsys);
  assert.equal(qsys.manufacturer, 'Q-SYS');
  assert.equal(qsys.ru, 1);
  assert.ok(qsys.ports.length >= 5);
});

test('Expansion cards: the generic types are always offered, the ids older blocks name', async () => {
  const { cards, source, error } = await loadExpansionCards({ fetchImpl: fakeFetch(new TypeError('fetch failed')), api: '/api/bim' });
  assert.equal(source, 'config');
  assert.ok(error);                                   // the library's failure is handed back for showProblem
  assert.deepEqual(cards.map(c => c.id), ['card-mic8', 'card-out8', 'card-dante32', 'card-dsp', 'card-gpio']);
  const dante = cards.find(c => c.id === 'card-dante32');
  assert.equal(dante.ports, 2);
  assert.equal(dante.type, 'Network');
});

test('Expansion cards: BIM card products are offered first, beside the generic types', async () => {
  const seen = [];
  const part = { id: 'generic/dante-32', manufacturer: 'Generic', model: 'Dante 32', class: 'Expansion Card', category: 'Audio',
    power: { watts: 9 }, ports: [{ group: 'Primary', connector: 'RJ45' }, { group: 'Secondary', connector: 'RJ45', count: 1 }] };
  const fetchImpl = async (url) => { seen.push(String(url)); return fakeFetch({ total: 1, items: [part] })(url); };
  const { cards, source, error } = await loadExpansionCards({ fetchImpl, api: '/api/bim' });
  assert.equal(source, 'bim+config');
  assert.equal(error, null);
  assert.deepEqual(cards[0], partToCard(part));
  assert.equal(cards.length, 1 + 5, 'the product, then the five generic types');
  assert.deepEqual(cards[0], { id: 'generic/dante-32', name: 'Generic Dante 32', ports: 2, powerW: 9, type: 'Expansion Card', bimId: 'generic/dante-32' });
  const q = new URL(seen.find(u => u.includes('/parts')), 'http://x').searchParams;
  assert.equal(q.get('class'), 'Expansion Card,Option Card,I/O Card');
  assert.equal(q.get('full'), '1');
});

test('Expansion cards: a library with no card parts offers the generic types', async () => {
  const { source, cards } = await loadExpansionCards({ fetchImpl: fakeFetch({ total: 0, items: [] }), api: '/api/bim' });
  assert.equal(source, 'config');
  assert.equal(cards.length, 5);
});
