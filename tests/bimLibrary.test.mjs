// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
import test from 'node:test';
import assert from 'node:assert/strict';
import { slug, partToDevice, deviceToPart } from '../js/bimLibrary.js';

const PART = {
  schema: 'apk.bim.part/1', id: 'qsc/core-110f', maker: 'qsc', manufacturer: 'QSC', model: 'Core 110f',
  name: 'Q-SYS Core 110f DSP', category: 'Audio', stage: 'declared',
  physical: { rack_units: 1, depth_mm: 350, height_mm: 44.45 }, power: { watts: 40, btu_hr: 136 },
  ports: [{ group: 'LAN A', side: 'connection', connector: 'RJ45', domain: 'network', count: 1, labels: ['A'] }],
  media: { images: [{ view: 'front', url: 'https://example.com/a.png' }] }, sources: ['symbols']
};

test('slug matches the server (bim/part.py)', () => {
  assert.equal(slug('Core 110f DSP'), 'core-110f-dsp');
  assert.equal(slug('Bowers & Wilkins'), 'bowers-and-wilkins');
  assert.equal(slug('Ünïcødé: a|b'), 'unicode-a-b');
});

test('a part round-trips through the editor without losing what it does not show', () => {
  const dev = partToDevice(PART);
  assert.equal(dev.ports[0].dir, 'Bidi');
  const back = deviceToPart(dev);
  assert.equal(back.id, 'qsc/core-110f');
  assert.deepEqual(back.media, PART.media);
  assert.deepEqual(back.ports[0].labels, ['A']);
  assert.equal(back.ports[0].domain, 'network');
  assert.equal(back.stage, undefined);          // derived by the server
});

test('editing keeps unknowns unknown and renames to a new id', () => {
  const dev = partToDevice({ ...PART, physical: {}, power: {} });
  assert.equal(dev.depthMm, '');
  dev.model = 'Core 110f Rev B';
  const back = deviceToPart(dev);
  assert.equal(back.id, 'qsc/core-110f-rev-b');
  assert.equal(back.physical, undefined);
  assert.equal(back.name, undefined);           // the old name described the old model
});

test('a part read from the library brings its BIM reference, and the device block keeps it (ROAD-3572)', async () => {
  const ref = { part: 'qsc/core-110f', url: '/api/bim/parts/qsc/core-110f', rev: 'r1' };
  const dev = partToDevice({ ...PART, ref });
  assert.deepEqual(dev.bimRef, ref);
  const { deviceToBlock, deviceFromBlock } = await import('../js/deviceBlock.js');
  const block = deviceToBlock(dev);
  assert.deepEqual(block.bimRef, ref);
  assert.deepEqual(deviceFromBlock(block).bimRef, ref, 'a block opened again keeps it');
  assert.equal(deviceFromBlock({ manufacturer: 'Typed', model: 'By hand' }).bimRef, undefined, 'an old block without one still opens');
});

test('BIM_CATEGORIES is the IFC mapping\'s category list, Concepts included', async () => {
  const { BIM_CATEGORIES } = await import('../js/bimLibrary.js');
  const { existsSync, readFileSync } = await import('node:fs');
  const mapping = new URL('../../../../../../contracts/ifc/mapping.json', import.meta.url);
  assert.ok(BIM_CATEGORIES.includes('Concepts'));
  if (existsSync(mapping)) assert.deepEqual(BIM_CATEGORIES, Object.keys(JSON.parse(readFileSync(mapping, 'utf8')).categories));
});
