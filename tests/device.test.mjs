import test from 'node:test';
import assert from 'node:assert/strict';
import { DeviceChassisModel } from '../js/deviceApp.js';

test('DeviceChassisModel manages expansion slots and computes power/port rollups', () => {
  const dev = new DeviceChassisModel('TEST-CHASSIS', 4);
  assert.equal(dev.slots.length, 4);
  assert.equal(dev.getTotalPower(), 45); // base power
  assert.equal(dev.getTotalPorts(), 0);

  // Install 8ch mic card in slot 1
  const ok = dev.installCard(1, 'card-mic8');
  assert.equal(ok, true);
  assert.equal(dev.slots[0].card.ports, 8);
  assert.equal(dev.getTotalPorts(), 8);
  assert.equal(dev.getTotalPower(), 45 + 24);

  // Eject card
  dev.removeCard(1);
  assert.equal(dev.slots[0].card, null);
  assert.equal(dev.getTotalPorts(), 0);
});
