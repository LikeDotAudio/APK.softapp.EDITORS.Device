// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readIfcTypes, importPartIfc, exportPartIfc, partIfcUrl, pickType } from '../js/bimIfc.js';
import { partToDevice, deviceToPart } from '../js/bimLibrary.js';
import { buildBundle, BUNDLE } from '../scripts/vendor-ifc.mjs';

// The device editor's IFC in / out (IFC-CORE-DELTAS instruments-4): Save to Library stays JSON; an IFC
// type file is exported as the server writes it and imported through the server's importer (dry run).

// tests/fixtures/keysight-34401a.ifc: DATABASE.server.BIM bim/ifc.build of keysight/34401a, as GET /parts/<id>.ifc answers
const FIXTURE = readFileSync(new URL('./fixtures/keysight-34401a.ifc', import.meta.url), 'utf8');

function fakeFetch(answers) {
  const calls = [];
  const impl = async (url, init = {}) => {
    calls.push({ url, ...init });
    const a = answers(url, init);
    return { ok: a.status < 400, status: a.status, json: async () => a.body, text: async () => a.text ?? '' };
  };
  return { impl, calls };
}

test('the vendored STEP codec is what contracts/src/ifc builds to today', async () => {
  const now = await buildBundle();
  if (now == null) return; // this repo on its own: the committed bundle is what there is
  assert.equal(readFileSync(BUNDLE, 'utf8'), now, 'run node scripts/vendor-ifc.mjs');
});

test('the page reads the types of a part file with the contracts codec, offline', () => {
  const types = readIfcTypes(FIXTURE);
  assert.equal(types.length, 1);
  assert.deepEqual(
    { entity: types[0].entity, partId: types[0].partId, manufacturer: types[0].manufacturer, model: types[0].model },
    { entity: 'IFCFLOWINSTRUMENTTYPE', partId: 'keysight/34401a', manufacturer: 'Keysight', model: '34401A' });
  assert.equal(pickType(types, 'keysight/34401a'), types[0]);
  assert.equal(pickType(types, 'other/thing'), types[0], 'the only type is the one');
  assert.equal(pickType([...types, { ...types[0], partId: 'x/y' }], 'z/z'), null, 'two types and no match: the person picks');
});

test('a file that is not IFC4 / IFC4X3, or not STEP, is refused, not guessed', () => {
  assert.throws(() => readIfcTypes('not a step file'), /STEP/);
  const ifc2x3 = FIXTURE.replace("FILE_SCHEMA(('IFC4X3_ADD2'));", "FILE_SCHEMA(('IFC2X3'));");
  assert.throws(() => readIfcTypes(ifc2x3), (e) => e.code === 'bad_input' && /IFC2X3/.test(e.message));
});

test('Import .ifc is a dry-run PUT of the file to the part\'s .ifc route; nothing is saved', async () => {
  const candidate = { id: 'keysight/34401a', maker: 'keysight', manufacturer: 'Keysight', model: '34401A',
    category: 'Test & Measurement', sources: ['symbols', 'ifc-import'], physical: { rack_units: 2 }, ports: [] };
  const f = fakeFetch(() => ({ status: 200, body: { part: candidate, problems: [], report: {} } }));
  const got = await importPartIfc(FIXTURE, 'keysight/34401a', { api: '/api/bim', fetchImpl: f.impl });
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].url, '/api/bim/parts/keysight/34401a.ifc?dry_run=1');
  assert.equal(f.calls[0].method, 'PUT');
  assert.equal(f.calls[0].headers['Content-Type'], 'application/x-step');
  assert.equal(f.calls[0].body, FIXTURE);
  assert.deepEqual(got.part, candidate);
  // Save to Library stays the JSON PUT: the imported part goes back as JSON with its provenance kept
  const back = deviceToPart(partToDevice(got.part));
  assert.deepEqual(back.sources, ['symbols', 'ifc-import']);
  assert.equal(back.id, 'keysight/34401a');
});

test('an importer refusal carries its problem code', async () => {
  const f = fakeFetch(() => ({ status: 422, body: { error: 'no type in the file is keysight/34401a' } }));
  await assert.rejects(importPartIfc(FIXTURE, 'keysight/34401a', { api: '/api/bim', fetchImpl: f.impl }),
    (e) => e.status === 422 && e.code === 'bad_input' && /no type/.test(e.message));
  await assert.rejects(importPartIfc(FIXTURE, 'nope', { api: '/api/bim', fetchImpl: f.impl }), /not a part id/);
});

test('Export .ifc is GET /parts/<id>.ifc, text as the server writes it', async () => {
  assert.equal(partIfcUrl('keysight/34401a', '/api/bim'), '/api/bim/parts/keysight/34401a.ifc');
  const f = fakeFetch((url) => (url.endsWith('/keysight/34401a.ifc') ? { status: 200, text: FIXTURE } : { status: 404 }));
  assert.equal(await exportPartIfc('keysight/34401a', { api: '/api/bim', fetchImpl: f.impl }), FIXTURE);
  await assert.rejects(exportPartIfc('nobody/none', { api: '/api/bim', fetchImpl: f.impl }), (e) => e.code === 'http_not_found');
});
