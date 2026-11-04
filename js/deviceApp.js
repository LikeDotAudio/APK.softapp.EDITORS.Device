// Device Library & Equipment Chassis Editor Engine
// Part of the APK.audio project — http://APK.audio — Anthony Kuzub
// MIT Licence. Free, for everyone, forever.

import { BlockBridge } from './blockBridge.js';

export const EXPANSION_CARDS = [
  { id: 'card-mic8', name: '8-Ch Mic/Line Analog Input Card', ports: 8, powerW: 24, type: 'Input' },
  { id: 'card-out8', name: '8-Ch Line Analog Output Card', ports: 8, powerW: 18, type: 'Output' },
  { id: 'card-dante32', name: '32x32 Dante/AES67 Network Card', ports: 2, powerW: 12, type: 'Network' },
  { id: 'card-dsp', name: 'Dual SHARC DSP Coprocessor Card', ports: 0, powerW: 35, type: 'Processing' },
  { id: 'card-gpio', name: '8x8 Logic GPIO / Relay Card', ports: 16, powerW: 5, type: 'Control' },
];

export const DEFAULT_DEVICE_LIBRARY = [
  {
    id: 'dev-qsys-core110f',
    manufacturer: 'Q-SYS',
    model: 'Core 110f DSP',
    partNumber: 'CORE-110F',
    category: 'Audio',
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
      { id: 'p7', name: 'Mains AC Power', type: 'IEC-C14', signal: 'AC Power', dir: 'In', count: 1 },
    ],
  },
  {
    id: 'dev-cisco-cbs350-24p',
    manufacturer: 'Cisco',
    model: 'CBS350-24P-4G Managed Switch',
    partNumber: 'CBS350-24P-4G-NA',
    category: 'Network',
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
      { id: 'p4', name: 'Mains AC Power', type: 'IEC-C14', signal: 'AC Power', dir: 'In', count: 1 },
    ],
  },
  {
    id: 'dev-shure-ulxd4q',
    manufacturer: 'Shure',
    model: 'ULXD4Q Quad Digital Wireless Receiver',
    partNumber: 'ULXD4Q=-G50',
    category: 'Audio',
    ru: 1,
    depthMm: 274,
    basePowerW: 32,
    btuHr: 109,
    slotCount: 0,
    slots: [],
    ports: [
      { id: 'p1', name: 'XLR Analog Output 1-4', type: 'XLR-M', signal: 'Analog Audio', dir: 'Out', count: 4 },
      { id: 'p2', name: 'Dante Primary / Secondary', type: 'RJ45', signal: 'Network', dir: 'Bidi', count: 2 },
      { id: 'p3', name: 'RF Antenna A/B Inputs', type: 'BNC', signal: 'RF Antenna', dir: 'In', count: 2 },
      { id: 'p4', name: 'RF Antenna Cascade A/B', type: 'BNC', signal: 'RF Antenna', dir: 'Out', count: 2 },
      { id: 'p5', name: 'Ethernet Control', type: 'RJ45', signal: 'Network', dir: 'Bidi', count: 1 },
      { id: 'p6', name: 'Mains AC Power', type: 'IEC-C14', signal: 'AC Power', dir: 'In', count: 1 },
    ],
  },
  {
    id: 'dev-crown-dci4-1250n',
    manufacturer: 'Crown',
    model: 'DCi 4|1250N DriveCore Network Amplifier',
    partNumber: 'DCI4-1250N',
    category: 'Audio',
    ru: 2,
    depthMm: 359,
    basePowerW: 850,
    btuHr: 2900,
    slotCount: 0,
    slots: [],
    ports: [
      { id: 'p1', name: 'Analog In 1-4', type: 'Phoenix-Euroblock', signal: 'Analog Audio', dir: 'In', count: 4 },
      { id: 'p2', name: 'Speaker Outputs 1-4 (Hi-Z/Low-Z)', type: 'Terminal-Strip', signal: 'Amplified Audio', dir: 'Out', count: 4 },
      { id: 'p3', name: 'BLU Link Audio In/Out', type: 'RJ45', signal: 'Digital Audio', dir: 'Bidi', count: 2 },
      { id: 'p4', name: 'HiQnet Control', type: 'RJ45', signal: 'Network', dir: 'Bidi', count: 1 },
      { id: 'p5', name: 'Mains AC Power (20A)', type: 'IEC-C20', signal: 'AC Power', dir: 'In', count: 1 },
    ],
  },
  {
    id: 'dev-modular-card-frame-4u',
    manufacturer: 'Modular Frame Systems',
    model: 'Modular Card Frame 4U',
    partNumber: 'MOD-FRAME-4U',
    category: 'Audio',
    ru: 4,
    depthMm: 400,
    basePowerW: 50,
    btuHr: 170,
    slotCount: 4,
    slots: [
      { slotNumber: 1, cardId: 'card-mic8' },
      { slotNumber: 2, cardId: 'card-out8' },
      { slotNumber: 3, cardId: 'card-dante32' },
      { slotNumber: 4, cardId: null },
    ],
    ports: [
      { id: 'p1', name: 'Mains AC Power', type: 'IEC-C14', signal: 'AC Power', dir: 'In', count: 1 },
    ],
  },
];

export class DeviceLibraryApp {
  constructor() {
    this.library = [...DEFAULT_DEVICE_LIBRARY];
    this.selectedDevice = this.library[0];

    this.bridge = new BlockBridge({
      name: 'Device Editor',
      type: 'device',
      onBlockLoaded: (block, meta) => this.handleBlockLoaded(block, meta),
      onBlockChanged: () => {},
    });

    this.initElements();
    this.attachEvents();
    this.loadInitialData();
  }

  initElements() {
    this.btnOpen = document.getElementById('btn-open');
    this.btnSave = document.getElementById('btn-save');
    this.btnClose = document.getElementById('btn-close');
    this.btnSyncDiscovered = document.getElementById('btn-sync-discovered');

    this.deviceListEl = document.getElementById('device-list');
    this.searchInput = document.getElementById('search-input');
    this.btnNewDevice = document.getElementById('btn-new-device');
    this.btnDuplicateDevice = document.getElementById('btn-duplicate-device');
    this.btnDeleteDevice = document.getElementById('btn-delete-device');

    // Detail Inputs
    this.inputManufacturer = document.getElementById('input-manufacturer');
    this.inputModel = document.getElementById('input-model');
    this.inputPartNumber = document.getElementById('input-part-number');
    this.selectCategory = document.getElementById('select-category');
    this.inputRu = document.getElementById('input-ru');
    this.inputDepth = document.getElementById('input-depth');
    this.inputPower = document.getElementById('input-power');
    this.inputBtu = document.getElementById('input-btu');

    // Ports Table
    this.portTableBody = document.getElementById('device-port-table-body');
    this.btnAddPort = document.getElementById('btn-add-port');

    // Visual Chassis Preview
    this.chassisStage = document.getElementById('chassis-preview-stage');
  }

  attachEvents() {
    this.btnOpen?.addEventListener('click', () => this.promptOpen());
    this.btnSave?.addEventListener('click', () => this.saveBlock());
    this.btnClose?.addEventListener('click', () => this.bridge.close());
    this.btnSyncDiscovered?.addEventListener('click', () => this.loadFromDiscoveredProject());

    this.searchInput?.addEventListener('input', (e) => {
      this.renderDeviceList(e.target.value);
    });

    this.btnNewDevice?.addEventListener('click', () => {
      const newDev = {
        id: `dev_${Date.now()}`,
        manufacturer: 'Generic',
        model: 'New Equipment Model',
        partNumber: 'MODEL-01',
        category: 'Audio',
        ru: 1,
        depthMm: 300,
        basePowerW: 50,
        btuHr: 170,
        slotCount: 0,
        slots: [],
        ports: [
          { id: 'p1', name: 'Input 1-2', type: 'XLR-F', signal: 'Analog Audio', dir: 'In', count: 2 },
          { id: 'p2', name: 'Output 1-2', type: 'XLR-M', signal: 'Analog Audio', dir: 'Out', count: 2 },
          { id: 'p3', name: 'Mains AC Power', type: 'IEC-C14', signal: 'AC Power', dir: 'In', count: 1 },
        ],
      };
      this.library.unshift(newDev);
      this.selectedDevice = newDev;
      this.render();
      this.bridge.notifyChanged();
    });

    this.btnDuplicateDevice?.addEventListener('click', () => {
      if (!this.selectedDevice) return;
      const dup = JSON.parse(JSON.stringify(this.selectedDevice));
      dup.id = `dev_${Date.now()}`;
      dup.model += ' (Copy)';
      this.library.unshift(dup);
      this.selectedDevice = dup;
      this.render();
      this.bridge.notifyChanged();
    });

    this.btnDeleteDevice?.addEventListener('click', () => {
      if (!this.selectedDevice || this.library.length <= 1) return;
      this.library = this.library.filter(d => d.id !== this.selectedDevice.id);
      this.selectedDevice = this.library[0];
      this.render();
      this.bridge.notifyChanged();
    });

    // Form inputs change
    const fields = [
      { el: this.inputManufacturer, f: 'manufacturer' },
      { el: this.inputModel, f: 'model' },
      { el: this.inputPartNumber, f: 'partNumber' },
      { el: this.selectCategory, f: 'category' },
      { el: this.inputRu, f: 'ru', isNum: true },
      { el: this.inputDepth, f: 'depthMm', isNum: true },
      { el: this.inputPower, f: 'basePowerW', isNum: true },
      { el: this.inputBtu, f: 'btuHr', isNum: true },
    ];
    fields.forEach(({ el, f, isNum }) => {
      el?.addEventListener('input', (e) => {
        if (!this.selectedDevice) return;
        this.selectedDevice[f] = isNum ? (parseInt(e.target.value, 10) || 0) : e.target.value;
        this.renderChassisPreview();
        this.renderDeviceList(this.searchInput?.value);
        this.bridge.notifyChanged();
      });
    });

    this.btnAddPort?.addEventListener('click', () => {
      if (!this.selectedDevice) return;
      if (!Array.isArray(this.selectedDevice.ports)) this.selectedDevice.ports = [];
      const nextId = `p${this.selectedDevice.ports.length + 1}`;
      this.selectedDevice.ports.push({
        id: nextId,
        name: `Port ${this.selectedDevice.ports.length + 1}`,
        type: 'RJ45',
        signal: 'Network',
        dir: 'Bidi',
        count: 1,
      });
      this.renderPortsTable();
      this.renderChassisPreview();
      this.bridge.notifyChanged();
    });
  }

  loadInitialData() {
    this.loadFromDiscoveredProject().catch(() => {
      this.render();
    });
  }

  async loadFromDiscoveredProject() {
    try {
      const data = await this.bridge.fetchDiscoveredProject();
      if (data && (data.devices || data.equipment || data.nodes)) {
        const raw = data.devices || data.equipment || data.nodes;
        if (Array.isArray(raw) && raw.length > 0) {
          const disc = raw.map((d, i) => ({
            id: d.id || `dev_disc_${i}`,
            manufacturer: d.manufacturer || d.make || 'Discovered',
            model: d.model || d.name || `Device ${i + 1}`,
            partNumber: d.partNumber || d.model || '',
            category: d.category || 'Audio',
            ru: d.ru || d.heightRu || 1,
            depthMm: d.depthMm || 300,
            basePowerW: d.powerW || 50,
            btuHr: d.btuHr || 170,
            slotCount: 0,
            slots: [],
            ports: (d.ports || []).map((p, pi) => ({
              id: p.id || `p${pi + 1}`,
              name: p.name || p.label || `P${pi + 1}`,
              type: p.connector || p.type || 'RJ45',
              signal: p.signal || 'Network',
              dir: p.dir || 'Bidi',
              count: 1,
            })),
          }));
          this.library = [...disc, ...this.library];
          this.selectedDevice = this.library[0];
          this.render();
          return;
        }
      }
    } catch (_) {}
    this.render();
  }

  handleBlockLoaded(block, meta = {}) {
    if (!block) return;
    const loadedDev = {
      id: block.id || `dev_${Date.now()}`,
      manufacturer: block.manufacturer || 'Custom',
      model: block.model || block.name || 'Custom Block Device',
      partNumber: block.partNumber || '',
      category: block.category || 'Audio',
      ru: block.ru || 1,
      depthMm: block.depthMm || 300,
      basePowerW: block.basePowerW || block.powerW || 50,
      btuHr: block.btuHr || 170,
      slotCount: block.slotCount || 0,
      slots: block.slots || [],
      ports: Array.isArray(block.ports) ? block.ports : [],
    };
    this.library.unshift(loadedDev);
    this.selectedDevice = loadedDev;
    this.render();
  }

  saveBlock() {
    if (!this.selectedDevice) return;
    const block = {
      type: 'device',
      ...this.selectedDevice,
      timestamp: new Date().toISOString(),
    };
    this.bridge.saveBlock(block, {
      title: `${this.selectedDevice.manufacturer} ${this.selectedDevice.model}`,
      filename: `device_${this.selectedDevice.model.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    });
  }

  render() {
    this.renderDeviceList(this.searchInput?.value);
    this.renderFormFields();
    this.renderPortsTable();
    this.renderChassisPreview();
  }

  renderDeviceList(filter = '') {
    if (!this.deviceListEl) return;
    this.deviceListEl.innerHTML = '';
    const q = (filter || '').toLowerCase();

    this.library
      .filter(d => !q || d.model.toLowerCase().includes(q) || d.manufacturer.toLowerCase().includes(q) || d.category.toLowerCase().includes(q))
      .forEach(dev => {
        const item = document.createElement('div');
        const isActive = this.selectedDevice && this.selectedDevice.id === dev.id;
        item.className = `device-item ${isActive ? 'active' : ''}`;
        item.style.padding = '8px 10px';
        item.style.marginBottom = '4px';
        item.style.borderRadius = '4px';
        item.style.cursor = 'pointer';
        item.style.background = isActive ? 'var(--osc-bg-surface-hover)' : 'var(--osc-bg-input)';
        item.style.border = `1px solid ${isActive ? 'var(--osc-accent-primary)' : 'var(--osc-border-default)'}`;

        item.innerHTML = `
          <div style="font-weight:600; color:${isActive ? 'var(--osc-accent-primary)' : 'var(--osc-text-primary)'}; font-size:12px;">${dev.model}</div>
          <div style="font-size:10px; color:var(--osc-text-muted); display:flex; justify-content:space-between; margin-top:2px;">
            <span>${dev.manufacturer}</span>
            <span>${dev.ru}U · ${dev.category}</span>
          </div>
        `;
        item.addEventListener('click', () => {
          this.selectedDevice = dev;
          this.render();
        });
        this.deviceListEl.appendChild(item);
      });
  }

  renderFormFields() {
    if (!this.selectedDevice) return;
    this.inputManufacturer.value = this.selectedDevice.manufacturer || '';
    this.inputModel.value = this.selectedDevice.model || '';
    this.inputPartNumber.value = this.selectedDevice.partNumber || '';
    this.selectCategory.value = this.selectedDevice.category || 'Audio';
    this.inputRu.value = this.selectedDevice.ru || 1;
    this.inputDepth.value = this.selectedDevice.depthMm || 300;
    this.inputPower.value = this.selectedDevice.basePowerW || 0;
    this.inputBtu.value = this.selectedDevice.btuHr || 0;
  }

  renderPortsTable() {
    if (!this.portTableBody || !this.selectedDevice) return;
    this.portTableBody.innerHTML = '';
    const ports = this.selectedDevice.ports || [];

    ports.forEach((port, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" class="cell-input" data-idx="${idx}" data-field="name" value="${port.name}"></td>
        <td>
          <select class="cell-input" data-idx="${idx}" data-field="type">
            <option value="RJ45" ${port.type === 'RJ45' ? 'selected' : ''}>RJ45</option>
            <option value="XLR-F" ${port.type === 'XLR-F' ? 'selected' : ''}>XLR-F</option>
            <option value="XLR-M" ${port.type === 'XLR-M' ? 'selected' : ''}>XLR-M</option>
            <option value="Phoenix-Euroblock" ${port.type === 'Phoenix-Euroblock' ? 'selected' : ''}>Phoenix / Euroblock</option>
            <option value="BNC" ${port.type === 'BNC' ? 'selected' : ''}>BNC</option>
            <option value="HDMI" ${port.type === 'HDMI' ? 'selected' : ''}>HDMI</option>
            <option value="USB-B" ${port.type === 'USB-B' ? 'selected' : ''}>USB-B</option>
            <option value="USB-C" ${port.type === 'USB-C' ? 'selected' : ''}>USB-C</option>
            <option value="SFP" ${port.type === 'SFP' ? 'selected' : ''}>SFP/Optical</option>
            <option value="Terminal-Strip" ${port.type === 'Terminal-Strip' ? 'selected' : ''}>Terminal Strip</option>
            <option value="IEC-C14" ${port.type === 'IEC-C14' ? 'selected' : ''}>IEC Power</option>
          </select>
        </td>
        <td>
          <select class="cell-input" data-idx="${idx}" data-field="signal">
            <option value="Analog Audio" ${port.signal === 'Analog Audio' ? 'selected' : ''}>Analog Audio</option>
            <option value="Digital Audio" ${port.signal === 'Digital Audio' ? 'selected' : ''}>Digital Audio</option>
            <option value="Network" ${port.signal === 'Network' ? 'selected' : ''}>Network</option>
            <option value="Video" ${port.signal === 'Video' ? 'selected' : ''}>Video</option>
            <option value="Serial Control" ${port.signal === 'Serial Control' ? 'selected' : ''}>Serial Control</option>
            <option value="AC Power" ${port.signal === 'AC Power' ? 'selected' : ''}>AC Power</option>
            <option value="RF Antenna" ${port.signal === 'RF Antenna' ? 'selected' : ''}>RF Antenna</option>
          </select>
        </td>
        <td>
          <select class="cell-input" data-idx="${idx}" data-field="dir">
            <option value="In" ${port.dir === 'In' ? 'selected' : ''}>Input</option>
            <option value="Out" ${port.dir === 'Out' ? 'selected' : ''}>Output</option>
            <option value="Bidi" ${port.dir === 'Bidi' ? 'selected' : ''}>Bi-directional</option>
          </select>
        </td>
        <td style="width:50px;"><input type="number" class="cell-input text-center" data-idx="${idx}" data-field="count" value="${port.count || 1}"></td>
        <td class="col-actions">
          <button class="btn-icon btn-del-port" data-idx="${idx}" title="Delete Port">🗑</button>
        </td>
      `;
      this.portTableBody.appendChild(tr);
    });

    this.portTableBody.querySelectorAll('.cell-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        const f = e.target.dataset.field;
        let val = e.target.value;
        if (f === 'count') val = parseInt(val, 10) || 1;
        this.selectedDevice.ports[i][f] = val;
        this.renderChassisPreview();
        this.bridge.notifyChanged();
      });
    });

    this.portTableBody.querySelectorAll('.btn-del-port').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        this.selectedDevice.ports.splice(i, 1);
        this.renderPortsTable();
        this.renderChassisPreview();
        this.bridge.notifyChanged();
      });
    });
  }

  renderChassisPreview() {
    if (!this.chassisStage || !this.selectedDevice) return;
    const dev = this.selectedDevice;
    const ru = dev.ru || 1;
    const heightMm = ru * 44.45;
    const widthMm = 440; // 19" chassis width minus rack ears

    const ports = dev.ports || [];
    const parts = [];

    // Chassis Faceplate
    parts.push(`<rect x="15" y="10" width="${widthMm}" height="${heightMm}" rx="3" fill="#121A2F" stroke="#2D3D60" stroke-width="1.2"/>`);

    // Rack Ears
    parts.push(`<rect x="2" y="10" width="13" height="${heightMm}" fill="#0E1424" stroke="#2D3D60" stroke-width="0.8"/>`);
    parts.push(`<rect x="${widthMm + 15}" y="10" width="13" height="${heightMm}" fill="#0E1424" stroke="#2D3D60" stroke-width="0.8"/>`);

    // Ear mounting slots
    parts.push(`<rect x="5" y="${10 + heightMm / 2 - 4}" width="6" height="8" rx="2" fill="#080C16" stroke="#2D3D60" stroke-width="0.5"/>`);
    parts.push(`<rect x="${widthMm + 19}" y="${10 + heightMm / 2 - 4}" width="6" height="8" rx="2" fill="#080C16" stroke="#2D3D60" stroke-width="0.5"/>`);

    // Device branding label
    parts.push(`<text x="24" y="${10 + Math.min(heightMm / 2 + 4, 16)}" fill="#F4902C" font-size="10" font-weight="bold" font-family="sans-serif">${dev.manufacturer.toUpperCase()}</text>`);
    parts.push(`<text x="24" y="${10 + Math.min(heightMm / 2 + 16, 26)}" fill="#F0F4F8" font-size="8" font-family="sans-serif">${dev.model}</text>`);

    // Render physical connectors
    let currentX = 160;
    const connectorY = 10 + heightMm / 2;

    ports.forEach(p => {
      const pCount = p.count || 1;
      const portWidth = p.type === 'Phoenix-Euroblock' ? 18 : 12;

      for (let c = 0; c < Math.min(pCount, 8); c++) {
        if (currentX + portWidth > widthMm) break;

        // Draw connector icon
        parts.push(`<g>`);
        parts.push(`<rect x="${currentX}" y="${connectorY - 7}" width="${portWidth - 2}" height="14" rx="2" fill="#0E1424" stroke="#4A9EFF" stroke-width="0.6"/>`);
        parts.push(`<text x="${currentX + portWidth / 2 - 1}" y="${connectorY + 3}" fill="#8B9BB4" font-size="6" text-anchor="middle" font-family="monospace">${p.type.substring(0, 3)}</text>`);
        parts.push(`</g>`);
        currentX += portWidth + 2;
      }
      currentX += 6;
    });

    const svgWidth = widthMm + 30;
    const svgHeight = heightMm + 20;

    this.chassisStage.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        ${parts.join('')}
      </svg>
    `;
  }

  promptOpen() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const parsed = JSON.parse(re.target.result);
          this.handleBlockLoaded(parsed, { title: file.name });
        } catch (err) {
          alert('Invalid JSON device block');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
}

let _deviceCounter = 1;

export class DeviceLibraryStore {
  constructor(initial = DEFAULT_DEVICE_LIBRARY) {
    this.devices = JSON.parse(JSON.stringify(initial));
    this.activeId = this.devices.length > 0 ? this.devices[0].id : null;
  }

  getAll() {
    return this.devices;
  }

  getById(id) {
    return this.devices.find(d => d.id === id) || null;
  }

  getActive() {
    return this.devices.find(d => d.id === this.activeId) || this.devices[0] || null;
  }

  setActive(id) {
    const found = this.devices.find(d => d.id === id);
    if (found) {
      this.activeId = id;
      return true;
    }
    return false;
  }

  cloneDevice(id) {
    const src = this.devices.find(d => d.id === id);
    if (!src) return null;
    const cloned = JSON.parse(JSON.stringify(src));
    cloned.id = `dev-clone-${++_deviceCounter}-${Date.now().toString(36)}`;
    cloned.model = `${src.model} (Copy)`;
    this.devices.push(cloned);
    return cloned;
  }

  addDevice(data = {}) {
    const dev = {
      id: data.id || `dev-add-${++_deviceCounter}-${Date.now().toString(36)}`,
      manufacturer: data.manufacturer || 'Generic',
      model: data.model || 'New Device',
      partNumber: data.partNumber || '',
      category: data.category || 'Audio',
      ru: data.ru || 1,
      depthMm: data.depthMm || 300,
      basePowerW: data.basePowerW || 20,
      btuHr: data.btuHr || 68,
      slotCount: data.slotCount || 0,
      slots: data.slots || [],
      ports: data.ports || []
    };
    this.devices.push(dev);
    this.activeId = dev.id;
    return dev;
  }

  updateDevice(id, data = {}) {
    const dev = this.devices.find(d => d.id === id);
    if (dev) {
      Object.assign(dev, data);
      return dev;
    }
    return null;
  }

  deleteDevice(id) {
    const idx = this.devices.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.devices.splice(idx, 1);
      if (this.activeId === id) {
        this.activeId = this.devices.length > 0 ? this.devices[0].id : null;
      }
      return true;
    }
    return false;
  }

  calculateTotalPower(dev) {
    if (!dev) return 0;
    let power = dev.basePowerW || 0;
    if (Array.isArray(dev.slots)) {
      dev.slots.forEach(slot => {
        if (slot && slot.cardId) {
          const card = EXPANSION_CARDS.find(c => c.id === slot.cardId);
          if (card && card.powerW) power += card.powerW;
        }
      });
    }
    return power;
  }

  calculateTotalPorts(dev) {
    if (!dev) return 0;
    let ports = 0;
    if (Array.isArray(dev.ports)) {
      dev.ports.forEach(p => {
        ports += (p.count || 1);
      });
    }
    if (Array.isArray(dev.slots)) {
      dev.slots.forEach(slot => {
        if (slot && slot.cardId) {
          const card = EXPANSION_CARDS.find(c => c.id === slot.cardId);
          if (card && card.ports) ports += card.ports;
        }
      });
    }
    return ports;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.deviceApp = new DeviceLibraryApp();
  });
}
