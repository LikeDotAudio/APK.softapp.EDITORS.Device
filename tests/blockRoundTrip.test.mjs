// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// ROAD-3486: the device block in and out over cad.like.audio/host@1, through
// the vendored apk-softapp client, wired as deviceApp.js wires it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { world, ORIGIN } from './softappWorld.mjs';
import { BLOCK_TYPE, deviceFromBlock, deviceToBlock, deviceMeta, newDiscoveredDevices } from '../js/deviceBlock.js';

const BLOCK = {
  type: BLOCK_TYPE, id: 'dev_9', manufacturer: 'ACME', model: 'Stage Box 16', category: 'Audio', ru: 2,
  ports: [{ id: 'p1', name: 'Mic 1-16', type: 'XLR-F', signal: 'Analog Audio', dir: 'In', count: 16 }],
};

function app(w) {
  let selected = null;
  const host = w.S.connectHost({
    editor: 'Device Editor',
    blockType: BLOCK_TYPE,
    onLoad: (block) => { selected = deviceFromBlock(block); },
    onRequest: () => (selected ? { block: deviceToBlock(selected), meta: deviceMeta(selected) } : undefined),
  });
  return { host, dev: () => selected };
}

test('in the CAD: editorReady, load, request → blockSave carries the edited device, to our origin only', () => {
  const w = world();
  const a = app(w);
  assert.equal(w.toParent[0].m.type, 'editorReady');
  assert.equal(w.toParent[0].m.blockType, BLOCK_TYPE);
  assert.equal(w.toParent[0].o, ORIGIN);
  w.fire({ protocol: 'cad.like.audio/host@1', type: 'load', block: BLOCK, meta: { blockName: 'SB16' } });
  assert.equal(a.dev().model, 'Stage Box 16');
  a.dev().ports[0].count = 8;                               // an edit in the ports table
  a.dev()._part = { media: 'big' };                         // the library cache never travels
  w.fire({ protocol: 'cad.like.audio/host@1', type: 'request' });
  const save = w.toParent.at(-1);
  assert.equal(save.m.type, 'blockSave');
  assert.equal(save.o, ORIGIN);
  assert.equal(save.m.block.type, BLOCK_TYPE);
  assert.equal(save.m.block.ports[0].count, 8);
  assert.equal(save.m.block._part, undefined);
  assert.equal(save.m.meta.filename, 'device_stage_box_16');
  assert.equal(BLOCK.ports[0].count, 16, 'the loaded block is not mutated');
  assert.equal(w.downloads.length, 0);
});

test('a stranger, or the old private APK_LOAD_BLOCK, loads nothing', () => {
  const w = world();
  const a = app(w);
  w.fire({ protocol: 'cad.like.audio/host@1', type: 'load', block: BLOCK }, { source: {} });
  w.fire({ type: 'APK_LOAD_BLOCK', block: BLOCK });
  assert.equal(a.dev(), null);
});

test('standalone: save downloads the device as .json', () => {
  const w = world({ framed: false });
  const a = app(w);
  const dev = deviceFromBlock(BLOCK);
  assert.equal(a.host.save(deviceToBlock(dev), deviceMeta(dev)), 'download');
  assert.equal(w.downloads[0].name, 'device_stage_box_16.json');
});

test('discovered things become unsaved devices once each, by MAC/serial, with no invented size', () => {
  const things = [
    { mac: 'aa:bb:cc:dd:ee:01', vendor: 'Shure', model: 'ULXD4', ips: ['10.0.0.5'] },
    { serial: 'SN-1', name: 'amp-left', ips: ['10.0.0.5'] },
    { ips: ['10.0.0.9'] },
  ];
  const first = newDiscoveredDevices([], things);
  assert.deepEqual(first.map((d) => d.identity), ['aa:bb:cc:dd:ee:01', 'SN-1']);
  assert.equal(first[0].manufacturer, 'Shure');
  assert.equal(first[0].ru, null);
  assert.equal(first[0].depthMm, null);
  assert.equal(newDiscoveredDevices(first, things).length, 0);
});
