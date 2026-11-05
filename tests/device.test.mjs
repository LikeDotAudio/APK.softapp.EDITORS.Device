import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_DEVICE_LIBRARY } from './fixtures/defaultDevices.mjs';
import { readFileSync } from 'node:fs';
import { DeviceLibraryStore } from '../js/deviceApp.js';

const CARDS = JSON.parse(readFileSync(new URL('../config/expansion-cards.json', import.meta.url))).generic;

test('Device library defaults loaded', () => {
  const store = new DeviceLibraryStore(DEFAULT_DEVICE_LIBRARY);
  const all = store.getAll();
  assert.ok(all.length >= 4);
  assert.equal(all[0].manufacturer, 'Q-SYS');
  assert.equal(all[1].manufacturer, 'Cisco');
});

test('Device library getActive and setActive', () => {
  const store = new DeviceLibraryStore(DEFAULT_DEVICE_LIBRARY);
  const active = store.getActive();
  assert.equal(active.id, 'dev-qsys-core110f');

  const switched = store.setActive('dev-cisco-cbs350-24p');
  assert.equal(switched, true);
  assert.equal(store.getActive().model, 'CBS350-24P-4G Managed Switch');
});

test('Device library add and clone device', () => {
  const store = new DeviceLibraryStore(DEFAULT_DEVICE_LIBRARY);
  const initialCount = store.getAll().length;

  const cloned = store.cloneDevice('dev-qsys-core110f');
  assert.ok(cloned);
  assert.equal(cloned.manufacturer, 'Q-SYS');
  assert.match(cloned.model, /Copy/);
  assert.equal(store.getAll().length, initialCount + 1);

  const custom = store.addDevice({
    manufacturer: 'Yamaha',
    model: 'TF-RACK',
    category: 'Mixer',
    ru: 3,
    basePowerW: 85,
    btuHr: 290
  });
  assert.ok(custom);
  assert.equal(store.getActive().manufacturer, 'Yamaha');
});

test('Device library update and delete', () => {
  const store = new DeviceLibraryStore(DEFAULT_DEVICE_LIBRARY);
  store.updateDevice('dev-cisco-cbs350-24p', { basePowerW: 55 });
  const updated = store.getById('dev-cisco-cbs350-24p');
  assert.equal(updated.basePowerW, 55);

  const deleted = store.deleteDevice('dev-cisco-cbs350-24p');
  assert.equal(deleted, true);
  assert.equal(store.getById('dev-cisco-cbs350-24p'), null);
});

test('Device power and port calculations', () => {
  const store = new DeviceLibraryStore(DEFAULT_DEVICE_LIBRARY, { cards: CARDS });
  const frame = store.getById('dev-modular-card-frame-4u');
  const power = store.calculateTotalPower(frame);
  const ports = store.calculateTotalPorts(frame);

  assert.ok(power > frame.basePowerW);
  assert.ok(ports > 0);
});
