// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// ROAD-3583: the device block's .ifc twin (js/deviceIfc.js) — written byte-deterministically, read back to
// the same block. IFC_OUT=<dir> npm test also writes the files there, for IfcOpenShell validate + the BIM
// oracle (DATABASE.server.BIM SRC/tools/ifc/editors_census.py).
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_DEVICE_LIBRARY } from './fixtures/defaultDevices.mjs';
import { deviceToBlock, deviceFromThing } from '../js/deviceBlock.js';
import { deviceToIfc, deviceFromIfc, schemaOf } from '../js/deviceIfc.js';
import { ifcGuid } from '../vendor/apk-contracts/apk-ifc.js';

function out(name, text) {
  if (!process.env.IFC_OUT) return;
  mkdirSync(process.env.IFC_OUT, { recursive: true });
  writeFileSync(join(process.env.IFC_OUT, name), text);
}

const blockOf = (dev) => { const b = deviceToBlock(dev, new Date(0)); delete b.timestamp; return b; };

test('every fixture device: the same block writes the same bytes, and reads back to the same block', () => {
  for (const dev of DEFAULT_DEVICE_LIBRARY) {
    const block = blockOf(dev);
    const a = deviceToIfc(block, { name: 'device_x' });
    assert.equal(a, deviceToIfc(JSON.parse(JSON.stringify(block)), { name: 'device_x' }), dev.id);
    assert.equal(schemaOf(a), 'IFC4X3_ADD2');
    const ports = block.ports.reduce((n, p) => n + (p.count || 1), 0);
    assert.equal((a.match(/IFCDISTRIBUTIONPORT\(/g) || []).length, ports, `${dev.id}: one port per terminal`);
    const b = deviceFromIfc(a);
    assert.deepEqual(b, block, dev.id);
    assert.equal(deviceToIfc(b, { name: 'device_x' }), a, `${dev.id}: read and written again, the same file`);
  }
  out('device-qsys-core110f.ifc', deviceToIfc(blockOf(DEFAULT_DEVICE_LIBRARY[0]), { name: 'device_core_110f_dsp' }));
});

test('a library part is typed by the part: its GlobalId is ifcGuid(part, id), with APK_Part and the maker', () => {
  const block = { ...blockOf(DEFAULT_DEVICE_LIBRARY[1]), bimId: 'cisco/cbs350-24p-4g' };
  const a = deviceToIfc(block, { name: 'device_cbs350' });
  out('device-library-part.ifc', a);
  assert.match(a, new RegExp(`IFCCOMMUNICATIONSAPPLIANCETYPE\\('${ifcGuid('part', 'cisco/cbs350-24p-4g').replace(/\$/g, '\\$')}',\\$,'CBS350-24P-4G Managed Switch'`));
  assert.match(a, /'PartId',\$,IFCIDENTIFIER\('cisco\/cbs350-24p-4g'\)/);
  assert.match(a, /'Manufacturer',\$,IFCLABEL\('Cisco'\)/);
  assert.match(a, /'NominalPowerConsumption',\$,IFCPOWERMEASURE\(45\.\)/);
  assert.match(a, /\.IPNETWORKEQUIPMENT\.\)/);
  assert.equal(deviceFromIfc(a).bimId, 'cisco/cbs350-24p-4g');
});

test('a discovered device: identity is its MAC (inst/mac:), its blank sizes stay blank', () => {
  const dev = deviceFromThing({ mac: 'b8:27:eb:00:00:01', vendor: 'Raspberry', model: 'Pi 4' });
  const block = blockOf(dev);
  const a = deviceToIfc(block, { name: 'device_pi' });
  assert.ok(a.includes(`'${ifcGuid('inst', 'mac:b8:27:eb:00:00:01')}'`));
  assert.match(a, /'MacAddress',\$,IFCIDENTIFIER\('b8:27:eb:00:00:01'\)/);
  assert.deepEqual(deviceFromIfc(a), block);
});

test('an IFC this editor did not write: a sentence pointing at Import .ifc', () => {
  const a = deviceToIfc(blockOf(DEFAULT_DEVICE_LIBRARY[0])).replace(/APK_DeviceEditor/g, 'APK_Other');
  assert.throws(() => deviceFromIfc(a), /Import \.ifc/);
});
