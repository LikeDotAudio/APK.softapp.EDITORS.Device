// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.

import test from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_DEVICE_LIBRARY, EXPANSION_CARDS } from '../js/deviceApp.js';

test('Device Library Default Models', () => {
  assert.ok(DEFAULT_DEVICE_LIBRARY.length >= 3);
  const qsys = DEFAULT_DEVICE_LIBRARY.find(d => d.id === 'dev-qsys-core110f');
  assert.ok(qsys);
  assert.equal(qsys.manufacturer, 'Q-SYS');
  assert.equal(qsys.ru, 1);
  assert.ok(qsys.ports.length >= 5);
});

test('Expansion Cards Catalog', () => {
  assert.ok(EXPANSION_CARDS.length >= 4);
  const dante = EXPANSION_CARDS.find(c => c.id === 'card-dante32');
  assert.ok(dante);
  assert.equal(dante.ports, 2);
  assert.equal(dante.type, 'Network');
});
