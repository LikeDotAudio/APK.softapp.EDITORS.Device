// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// ROAD-3501: the port table's connector and signal lists are the shared
// vocabulary (vendor/apk-vocabulary, the CAD's catalogue) through
// config/vocabulary.json — none of them is a list in this app's source.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PORT_TYPES, PORT_SIGNALS } from '../js/deviceBlock.js';
import { VOCABULARY } from '../js/vocabulary.js';

const V = globalThis.APKVocabulary;
const config = JSON.parse(readFileSync(new URL('../config/vocabulary.json', import.meta.url), 'utf8'));

test('config/vocabulary.json names only what the catalogue has', () => {
  assert.deepEqual(VOCABULARY.problems, []);
});

test('every offered connector is a catalogue entry from a configured group', () => {
  assert.ok(PORT_TYPES.length > 50, `the catalogue's connectors, not a short local list (${PORT_TYPES.length})`);
  for (const name of PORT_TYPES) {
    const e = V.connector(name);
    assert.ok(e, `${name} is in the CAD catalogue`);
    assert.ok(config.connectors.groups.includes(e.group), `${name} is in a configured group (${e.group})`);
  }
  for (const must of ['RJ45', 'X3S', 'X3P', 'BNC', 'HDMI', 'C14', 'USB-C', 'SFP']) assert.ok(PORT_TYPES.includes(must), must);
});

test('the editor\'s older spellings resolve to catalogue entries', () => {
  for (const [old, abbr] of Object.entries(config.connectors.aliases)) {
    assert.equal(VOCABULARY.connectorFor(old)?.abbreviation, abbr, old);
  }
  assert.equal(VOCABULARY.connectorFor('XLR-F').group, 'Audio-XLR');
});

test('signals: this app\'s classes first, then the CAD\'s networked flows; every class is a CAD signal class', () => {
  assert.equal(PORT_SIGNALS[0], 'Analog Audio');
  assert.ok(PORT_SIGNALS.includes('DANTE') && PORT_SIGNALS.includes('ST2110-30'));
  for (const x of config.formats.extra) if (x.class) assert.ok(V.signalClasses.includes(x.class), x.class);
});

test('no connector or signal list is typed into the app source', () => {
  const src = readFileSync(new URL('../js/deviceBlock.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /PORT_TYPES\s*=\s*\[/);
  assert.doesNotMatch(src, /PORT_SIGNALS\s*=\s*\[/);
});
