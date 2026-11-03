// Device Library & Equipment Chassis Editor Engine
// Part of the APK.audio project — http://APK.audio — Anthony Kuzub
// MIT Licence. Free, for everyone, forever.

export const EXPANSION_CARDS = [
  { id: 'card-mic8', name: '8-Ch Mic/Line Analog Input Card', ports: 8, powerW: 24, type: 'Input' },
  { id: 'card-out8', name: '8-Ch Line Analog Output Card', ports: 8, powerW: 18, type: 'Output' },
  { id: 'card-dante32', name: '32x32 Dante/AES67 Network Card', ports: 2, powerW: 12, type: 'Network' },
  { id: 'card-dsp', name: 'Dual SHARC DSP Coprocessor Card', ports: 0, powerW: 35, type: 'Processing' },
  { id: 'card-gpio', name: '8x8 Logic GPIO / Relay Card', ports: 16, powerW: 5, type: 'Control' }
];

export const DEFAULT_DEVICE_LIBRARY = [
  {
    id: 'dev-qsys-core110f',
    manufacturer: 'Q-SYS',
    model: 'Core 110f DSP',
    partNumber: 'CORE-110F',
    category: 'DSP',
    ru: 1,
    depthMm: 350,
    basePowerW: 40,
    btuHr: 136,
    slotCount: 0,
    slots: [],
    ports: [
      { id: 'p1', name: 'Mic/Line In 1-8', type: 'Phoenix-Euroblock', signal: 'Analog Audio', dir: 'In', count: 8 },
      { id: 'p2', name: 'Line Out 1-8', type: 'Phoenix-Euroblock', signal: 'Analog Audio', dir: 'Out', count: 8 },
      { id: 'p3', name: 'Flex In/Out 1-8', type: 'Phoenix-Euroblock', signal: 'Analog Audio', dir: 'Bidi', count: 8 },
      { id: 'p4', name: 'LAN A (Q-LAN / Dante)', type: 'RJ45', signal: 'Network', dir: 'Bidi', count: 1 },
      { id: 'p5', name: 'LAN B (Aux / Redundant)', type: 'RJ45', signal: 'Network', dir: 'Bidi', count: 1 },
      { id: 'p6', name: 'USB-B Audio/Video', type: 'USB-B', signal: 'USB', dir: 'Bidi', count: 1 },
      { id: 'p7', name: 'Mains AC Power', type: 'IEC-C14', signal: 'AC Power', dir: 'In', count: 1 }
    ]
  },
  {
    id: 'dev-cisco-cbs350-24p',
    manufacturer: 'Cisco',
    model: 'CBS350-24P-4G Managed Switch',
    partNumber: 'CBS350-24P-4G-NA',
    category: 'Switch',
    ru: 1,
    depthMm: 257,
    basePowerW: 45,
    btuHr: 153,
    slotCount: 0,
    slots: [],
    ports: [
      { id: 'p1', name: 'PoE+ Gigabit Ports 1-24', type: 'RJ45', signal: 'Network', dir: 'Bidi', count: 24 },
      { id: 'p2', name: 'SFP Uplink Ports 25-28', type: 'SFP', signal: 'Fiber/Network', dir: 'Bidi', count: 4 },
      { id: 'p3', name: 'Console Port', type: 'RJ45', signal: 'Serial Control', dir: 'In', count: 1 },
      { id: 'p4', name: 'Mains AC Power', type: 'IEC-C14', signal: 'AC Power', dir: 'In', count: 1 }
    ]
  },
  {
    id: 'dev-shure-ulxd4q',
    manufacturer: 'Shure',
    model: 'ULXD4Q Quad Digital Wireless Receiver',
    partNumber: 'ULXD4Q=-G50',
    category: 'Wireless',
    ru: 1,
    depthMm: 274,
    basePowerW: 26,
    btuHr: 89,
    slotCount: 0,
    slots: [],
    ports: [
      { id: 'p1', name: 'Audio Out Ch 1-4', type: 'XLR-M', signal: 'Analog Audio', dir: 'Out', count: 4 },
      { id: 'p2', name: 'Dante Primary / Secondary', type: 'RJ45', signal: 'Network', dir: 'Bidi', count: 2 },
      { id: 'p3', name: 'RF Antenna A / B In', type: 'BNC', signal: 'RF UHF', dir: 'In', count: 2 },
      { id: 'p4', name: 'RF Cascade A / B Out', type: 'BNC', signal: 'RF UHF', dir: 'Out', count: 2 },
      { id: 'p5', name: 'Mains AC Power', type: 'IEC-C14', signal: 'AC Power', dir: 'In', count: 1 }
    ]
  },
  {
    id: 'dev-modular-card-frame-4u',
    manufacturer: 'APK.audio',
    model: 'CardFrame-4U Modular Chassis',
    partNumber: 'APK-CF-4U',
    category: 'Frame',
    ru: 4,
    depthMm: 450,
    basePowerW: 60,
    btuHr: 205,
    slotCount: 4,
    slots: [
      { slotNumber: 1, card: { ...EXPANSION_CARDS[0] } },
      { slotNumber: 2, card: { ...EXPANSION_CARDS[1] } },
      { slotNumber: 3, card: { ...EXPANSION_CARDS[2] } },
      { slotNumber: 4, card: null }
    ],
    ports: [
      { id: 'p1', name: 'Redundant Power Supply A', type: 'IEC-C14', signal: 'AC Power', dir: 'In', count: 1 },
      { id: 'p2', name: 'Redundant Power Supply B', type: 'IEC-C14', signal: 'AC Power', dir: 'In', count: 1 },
      { id: 'p3', name: 'Chassis Control LAN', type: 'RJ45', signal: 'Network', dir: 'Bidi', count: 1 }
    ]
  },
  {
    id: 'dev-crestron-nvx-360',
    manufacturer: 'Crestron',
    model: 'DM-NVX-360 4K60 AV-over-IP Encoder/Decoder',
    partNumber: 'DM-NVX-360',
    category: 'Video',
    ru: 1,
    depthMm: 235,
    basePowerW: 35,
    btuHr: 120,
    slotCount: 0,
    slots: [],
    ports: [
      { id: 'p1', name: 'HDMI Input 1-2', type: 'HDMI', signal: 'Video/Audio', dir: 'In', count: 2 },
      { id: 'p2', name: 'HDMI Output', type: 'HDMI', signal: 'Video/Audio', dir: 'Out', count: 1 },
      { id: 'p3', name: '1GbE AV-over-IP Port', type: 'RJ45', signal: 'Network', dir: 'Bidi', count: 1 },
      { id: 'p4', name: 'Aux 1GbE Ethernet Port', type: 'RJ45', signal: 'Network', dir: 'Bidi', count: 1 },
      { id: 'p5', name: 'Audio Line In/Out', type: 'Phoenix-Euroblock', signal: 'Analog Audio', dir: 'Bidi', count: 2 },
      { id: 'p6', name: 'DC 24V Power In', type: 'Phoenix-Euroblock', signal: 'DC Power', dir: 'In', count: 1 }
    ]
  }
];

export class DeviceLibraryStore {
  constructor(initialDevices = DEFAULT_DEVICE_LIBRARY) {
    this.devices = JSON.parse(JSON.stringify(initialDevices));
    this.activeDeviceId = this.devices[0]?.id || null;
  }

  getAll() {
    return this.devices;
  }

  getById(id) {
    return this.devices.find(d => d.id === id) || null;
  }

  getActive() {
    return this.getById(this.activeDeviceId) || this.devices[0] || null;
  }

  setActive(id) {
    if (this.devices.some(d => d.id === id)) {
      this.activeDeviceId = id;
      return true;
    }
    return false;
  }

  addDevice(deviceData) {
    const id = deviceData.id || `dev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newDev = {
      ...deviceData,
      id,
      slots: deviceData.slots || [],
      ports: deviceData.ports || []
    };
    this.devices.push(newDev);
    this.activeDeviceId = id;
    return newDev;
  }

  updateDevice(id, updates) {
    const idx = this.devices.findIndex(d => d.id === id);
    if (idx >= 0) {
      this.devices[idx] = { ...this.devices[idx], ...updates };
      return this.devices[idx];
    }
    return null;
  }

  deleteDevice(id) {
    const idx = this.devices.findIndex(d => d.id === id);
    if (idx >= 0) {
      this.devices.splice(idx, 1);
      if (this.activeDeviceId === id) {
        this.activeDeviceId = this.devices[0]?.id || null;
      }
      return true;
    }
    return false;
  }

  cloneDevice(id) {
    const orig = this.getById(id);
    if (!orig) return null;
    const cloned = JSON.parse(JSON.stringify(orig));
    cloned.id = `dev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    cloned.model = `${cloned.model} (Copy)`;
    this.devices.push(cloned);
    this.activeDeviceId = cloned.id;
    return cloned;
  }

  calculateTotalPower(device) {
    if (!device) return 0;
    const slotPower = (device.slots || []).reduce((acc, s) => acc + (s.card ? s.card.powerW : 0), 0);
    return (device.basePowerW || 0) + slotPower;
  }

  calculateTotalPorts(device) {
    if (!device) return 0;
    const fixedPorts = (device.ports || []).reduce((acc, p) => acc + (p.count || 1), 0);
    const slotPorts = (device.slots || []).reduce((acc, s) => acc + (s.card ? s.card.ports : 0), 0);
    return fixedPorts + slotPorts;
  }
}
