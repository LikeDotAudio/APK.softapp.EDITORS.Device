// Part of APK.audio - Device & Equipment Chassis Editor
// Ported from OneThing gui-Interfaces/devices and 140_deviceGrid

export const EXPANSION_CARDS = [
  { id: 'card-mic8', name: '8-Ch Mic/Line Analog Input Card', ports: 8, powerW: 24, type: 'Input' },
  { id: 'card-out8', name: '8-Ch Line Analog Output Card', ports: 8, powerW: 18, type: 'Output' },
  { id: 'card-dante32', name: '32x32 Dante/AES67 Network Card', ports: 2, powerW: 12, type: 'Network' },
  { id: 'card-dsp', name: 'Dual SHARC DSP Coprocessor Card', ports: 0, powerW: 35, type: 'Processing' },
  { id: 'card-gpio', name: '8x8 Logic GPIO / Relay Card', ports: 16, powerW: 5, type: 'Control' }
];

export class DeviceChassisModel {
  constructor(name = 'DSP-MAINFRAME-01', slotCount = 4) {
    this.name = name;
    this.basePowerW = 45;
    this.slots = Array.from({ length: slotCount }, (_, i) => ({
      slotNumber: i + 1,
      card: null
    }));
  }

  installCard(slotNumber, cardId) {
    const card = EXPANSION_CARDS.find(c => c.id === cardId);
    const slot = this.slots.find(s => s.slotNumber === slotNumber);
    if (slot && card) {
      slot.card = { ...card };
      return true;
    }
    return false;
  }

  removeCard(slotNumber) {
    const slot = this.slots.find(s => s.slotNumber === slotNumber);
    if (slot && slot.card) {
      slot.card = null;
      return true;
    }
    return false;
  }

  getTotalPower() {
    return this.basePowerW + this.slots.reduce((sum, s) => sum + (s.card ? s.card.powerW : 0), 0);
  }

  getTotalPorts() {
    return this.slots.reduce((sum, s) => sum + (s.card ? s.card.ports : 0), 0);
  }
}
