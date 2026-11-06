// Device Library & Equipment Chassis Editor Engine
// Part of the APK.audio project — http://APK.audio — Anthony Kuzub
// MIT Licence. Free, for everyone, forever.

import {
  BLOCK_TYPE, PORT_TYPES, PORT_SIGNALS, PORT_DIRS,
  deviceFromBlock, deviceToBlock, deviceMeta, newDiscoveredDevices,
} from './deviceBlock.js';

const S = () => window.APKSoftapp;

import {
  BIM_CATEGORIES, partToDevice, deviceToPart, searchParts, getPart, savePart, deletePart, bimApi
} from './bimLibrary.js';

import { loadExpansionCards, cardFor } from './expansionCards.js';
import { exportPartIfc, importPartIfc, readIfcTypes, pickType, downloadText } from './bimIfc.js';
import { libraryButton, acceptLibraryDrops, bimFields, loadLibrary } from './bimLibraryPicker.js';

export class DeviceLibraryApp {
  constructor() {
    // Every device comes from the BIM library (DATABASE.server.BIM) — none ship in this source.
    this.library = [];
    this.selectedDevice = null;
    this.searchTimer = null;

    this.discovery = null;     // APKSoftapp.discovered() handle, once the bus answers
    this.cards = [];           // expansion cards: BIM parts of config/expansion-cards.json's classes

    S().describe({
      name: 'Device Editor',
      does: 'Edits one device of the BIM library: maker, model, rack size, depth, power, heat and its port interfaces, drawn as a 19-inch front panel.',
      inputs: [
        { name: 'BIM library', from: 'DATABASE.server.BIM at /api/bim (search, read a part; ?bim= overrides, ?part= opens one)' },
        { name: 'Device block', from: 'the CAD (when opened from a drawing), or a .json file via Open', kind: 'file' },
        { name: 'IFC type file', from: 'a .ifc via Import .ifc: read here, then by the BIM importer as a dry run', kind: 'file' },
        { name: 'Discovered devices', from: 'the bus: things scanners and agents found (kinds in config/discovery.json)', kind: 'bus' },
        { name: 'Live instances', from: 'the BIM library: the bench devices of this part and the panel each presents on the bus' },
      ],
      outputs: [
        { name: 'BIM part', to: 'the BIM library on Save to Library; Delete removes it for everyone' },
        { name: 'IFC type file', to: 'a download on Export .ifc (GET /api/bim/parts/<id>.ifc)', kind: 'file' },
        { name: 'Device block', to: 'the CAD on Save & Return and on every edit; standalone Save downloads a .json', kind: 'file' },
      ],
      controls: [
        { name: 'Search', how: 'type to search the library (maker, model, connector); click a device to edit it' },
        { name: '📚 Library', how: 'call up the shared BIM library picker (Ctrl+Shift+L), or drop a part dragged from it on the list: the part opens here with its BIM reference' },
        { name: '+ New / Duplicate / Delete', how: 'start, copy or remove a device (Delete asks first for a library part)' },
        { name: 'Manufacturer ... BTU', how: 'device fields; the panel drawing follows (depth in mm)' },
        { name: '+ Add Port Interface', how: 'add a port; edit name, connector, signal, direction, count in the table' },
        { name: 'Discovered', how: 'add what the bus found as unsaved devices' },
        { name: 'Open its panel', how: 'when the part is live on the bench, opens the panel it presents on the bus' },
        { name: 'Open / Save to Library / Save & Return / Close', how: 'header buttons' },
        { name: 'Export .ifc / Import .ifc', how: 'the part as its IFC type file out; an IFC type file in, shown unsaved until Save to Library' },
      ],
      problems: ['fetch_failed', 'http_not_found', 'http_forbidden', 'http_server_error', 'bad_json', 'bad_input', 'file_unreadable', 'save_failed', 'not_in_cad', 'bus_missing'],
    });

    this.initElements();
    this.createPortsTable();
    this.attachEvents();

    // The CAD (cad.like.audio/host@1): load adds the block's device; request asks for it back.
    S().inheritTheme();
    this.host = S().connectHost({
      editor: 'Device Editor',
      blockType: BLOCK_TYPE,
      onLoad: (block, meta) => this.handleBlockLoaded(block, meta),
      onRequest: () => (this.selectedDevice
        ? { block: deviceToBlock(this.selectedDevice), meta: deviceMeta(this.selectedDevice) } : undefined),
    });
    this.loadInitialData();
    this.startDiscovery();
    this.loadCards();
  }

  /** The host is told of every edit; standalone there is nobody to tell. */
  changed() {
    if (this.selectedDevice) this.host?.changed(deviceToBlock(this.selectedDevice), deviceMeta(this.selectedDevice));
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
    this.portTableHost = document.getElementById('device-port-table');
    this.discoveryStatus = document.getElementById('discovery-status');
    this.btnAddPort = document.getElementById('btn-add-port');

    // Visual Chassis Preview
    this.chassisStage = document.getElementById('chassis-preview-stage');

    this.btnSaveLibrary = document.getElementById('btn-save-library');
    this.btnExportIfc = document.getElementById('btn-export-ifc');
    this.btnImportIfc = document.getElementById('btn-import-ifc');
    this.inputImportIfc = document.getElementById('input-import-ifc');
    this.statusEl = document.getElementById('library-status');
    if (this.selectCategory) {
      this.selectCategory.replaceChildren(...BIM_CATEGORIES.map(c => new Option(c, c)));
    }
  }

  setStatus(text, isError = false) {
    if (!this.statusEl) return;
    this.statusEl.textContent = text;
    this.statusEl.style.color = isError ? 'var(--osc-accent-danger, #ef4444)' : 'var(--osc-text-muted)';
  }

  /** Ask the library for the devices matching `q` and show them. */
  async searchLibrary(q = '') {
    try {
      this.setStatus('Searching the BIM library…');
      const page = await searchParts({ q, limit: 200, hasPorts: !q });
      const fetched = page.items.map(s => ({
        id: s.id, bimId: s.id, manufacturer: s.manufacturer, model: s.model,
        category: s.category, ru: s.rack_units ?? '', stage: s.stage, ports: null
      }));
      // unsaved local devices (New / Duplicate) stay at the top of the list
      const local = this.library.filter(d => !d.bimId);
      this.library = [...local, ...fetched];
      this.setStatus(`${page.total.toLocaleString()} part${page.total === 1 ? '' : 's'} in the library${q ? ` match “${q}”` : ''}${page.total > fetched.length ? ` — showing ${fetched.length}` : ''}`);
    } catch (e) {
      this.setStatus(`BIM library unreachable (${e.message})`, true);
      S().showProblem(e, { subject: 'BIM library search', fix: [`The device list is the BIM library (DATABASE.server.BIM) at ${bimApi()}: check it is running in DockTor.`], onRetry: () => this.searchLibrary(q) });
    }
    if (!this.selectedDevice && this.library.length) await this.select(this.library[0]);
    else this.renderDeviceList();
  }

  /** A pick from the library ({bim, ref}) opened as the device: its full part when /api/bim answers,
      else the picked row; either way with the pick's BIM reference. */
  async openPick(item) {
    const { bimId, bimRef } = bimFields(item);
    let dev;
    try { dev = partToDevice(await getPart(bimId)); } catch (_) { dev = partToDevice(item.bim); }
    if (bimRef) dev.bimRef = bimRef;
    const i = this.library.findIndex(d => d.bimId === bimId);
    if (i !== -1) this.library[i] = dev; else this.library.unshift(dev);
    this.selectedDevice = dev;
    this.render();
    this.showLive(dev);
    this.changed();
    return dev;
  }

  /** Select a device; a library summary is swapped for its full part first. */
  async select(dev) {
    if (dev && dev.bimId && !dev._part) {
      try {
        const full = partToDevice(await getPart(dev.bimId));
        const i = this.library.indexOf(dev);
        if (i !== -1) this.library[i] = full;
        dev = full;
      } catch (e) {
        this.setStatus(e.message, true);
        S().showProblem(e, { subject: `BIM part ${dev.bimId}`, fix: [`The device list is the BIM library (DATABASE.server.BIM) at ${bimApi()}: check it is running in DockTor.`], onRetry: () => this.select(dev) });
      }
    }
    this.selectedDevice = dev;
    this.render();
    this.showLive(dev);
  }

  /** Connected, discovered, known, with a panel on the bus: offer its default GUI. */
  async showLive(dev) {
    this.btnLiveGui?.remove();
    this.btnLiveGui = null;
    if (!dev?.bimId) return;
    // the bench's boxes of this part: the one picker carries them (APKLibrary.liveDevices, ROAD-3596)
    let lib;
    try { lib = await loadLibrary(); } catch (_) { return; }
    const live = await lib.liveDevices(dev.bimId, bimApi());
    if (this.selectedDevice !== dev) return;
    const online = live.filter(d => d.state === 'online');
    const target = online.find(d => d.panel?.prefix);
    if (!live.length) return;
    this.setStatus(`${online.length} on the bench${live.length > online.length ? ` · ${live.length - online.length} gone dark` : ''}`);
    if (!target) return;
    const b = document.createElement('button');
    b.className = 'btn btn-secondary';
    b.textContent = online.length > 1 ? `▶ Open its panel (${online.length})` : '▶ Open its panel';
    b.title = `Its default GUI: the panel ${target.name} presents on the bus`;
    b.addEventListener('click', () => {
      if (!lib.openDefaultGui(target, target.name)) this.setStatus('Open the Device editor inside the OS to open its panel', true);
    });
    this.statusEl?.after(b);
    this.btnLiveGui = b;
  }

  async saveToLibrary() {
    const dev = this.selectedDevice;
    if (!dev) return;
    try {
      const part = deviceToPart(dev);
      const saved = partToDevice(await savePart(part));
      const i = this.library.indexOf(dev);
      if (i !== -1) this.library[i] = saved;
      this.selectedDevice = saved;
      this.setStatus(`Saved ${saved.bimId} to the BIM library`);
      this.render();
    } catch (e) {
      this.setStatus(e.message, true);
      S().showProblem(e, {
        subject: `Save to Library: ${dev.manufacturer} ${dev.model}`,
        fix: ['The device is still on screen and unsaved: Save & Return (or its .json download) keeps a copy meanwhile.'],
        onRetry: () => this.saveToLibrary(),
      });
    }
  }

  /** Export .ifc: the library part's own IFC4X3 type file (an unsaved device has none yet). */
  async exportIfc() {
    const dev = this.selectedDevice;
    if (!dev?.bimId) {
      this.setStatus('Save to Library first: the .ifc is the library part\'s', true);
      return null;
    }
    try {
      const text = await exportPartIfc(dev.bimId);
      downloadText(text, `${dev.bimId.replace('/', '_')}.ifc`);
      this.setStatus(`Exported ${dev.bimId}.ifc`);
      return text;
    } catch (e) {
      this.setStatus(e.message, true);
      S().showProblem(e, { subject: `Export ${dev.bimId}.ifc`, onRetry: () => this.exportIfc() });
      return null;
    }
  }

  /** Import .ifc: read the file here, then the server's importer as a dry run; the part opens unsaved. */
  async importIfc(file) {
    if (!file) return null;
    try {
      const text = await file.text();
      const types = readIfcTypes(text);
      const t = pickType(types, this.selectedDevice?.bimId)
        || (types.length > 1 ? types.find(x => x.partId === prompt(`This file holds ${types.length} types — which one?\n${types.map(x => x.partId).join('\n')}`)) : null);
      if (!t) throw Object.assign(new Error(types.length ? 'no type picked' : 'the file holds no IFC type with a manufacturer'), { code: 'bad_input' });
      const { part, problems = [], warnings = [] } = await importPartIfc(text, t.partId);
      const dev = partToDevice(part);
      dev.imported = { from: file.name, entity: t.entity };   // unsaved until Save to Library
      const i = this.library.findIndex(d => d.bimId === dev.bimId);
      if (i !== -1) this.library[i] = dev; else this.library.unshift(dev);
      this.selectedDevice = dev;
      this.render();
      this.changed();
      const notes = [...problems, ...warnings].length;
      this.setStatus(`Read ${t.partId} from ${file.name} — review it, then Save to Library${notes ? ` (${notes} note${notes === 1 ? '' : 's'})` : ''}`);
      return dev;
    } catch (e) {
      this.setStatus(e.message, true);
      S().showProblem(e, { subject: `Import ${file.name}`, fix: ['An IFC4 / IFC4X3 type file (one type with Pset_ManufacturerTypeInformation) is what the importer reads.'] });
      return null;
    }
  }

  attachEvents() {
    this.btnOpen?.addEventListener('click', () => this.promptOpen());
    this.btnSave?.addEventListener('click', () => this.saveBlock());
    this.btnSaveLibrary?.addEventListener('click', () => this.saveToLibrary());
    this.btnExportIfc?.addEventListener('click', () => this.exportIfc());
    this.btnImportIfc?.addEventListener('click', () => this.inputImportIfc?.click());
    this.inputImportIfc?.addEventListener('change', (e) => {
      const f = e.target.files?.[0];
      e.target.value = '';
      if (f) void this.importIfc(f);
    });
    this.btnClose?.addEventListener('click', () => this.host.close());
    this.btnSyncDiscovered?.addEventListener('click', () => this.addDiscovered());

    this.searchInput?.addEventListener('input', (e) => {
      clearTimeout(this.searchTimer);
      const q = e.target.value.trim();
      this.searchTimer = setTimeout(() => this.searchLibrary(q), 250);
    });

    // 📚 Library (ROAD-3572): the shared picker — the part opens here, its BIM reference kept on the device block
    const openItems = (items) => { if (items[0]) void this.openPick(items[0]); };
    this.btnNewDevice?.before(libraryButton(openItems, { className: 'btn btn-secondary btn-sm', title: 'Open a part from the BIM library' }));
    if (this.deviceListEl) acceptLibraryDrops(this.deviceListEl, (it) => openItems([it]));

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
      this.changed();
    });

    this.btnDuplicateDevice?.addEventListener('click', () => {
      if (!this.selectedDevice) return;
      const dup = JSON.parse(JSON.stringify(this.selectedDevice));
      dup.id = `dev_${Date.now()}`;
      dup.model += ' (Copy)';
      delete dup.bimId;              // unsaved until Save to Library; keeps _part's media/ext as a starting point
      delete dup.bimRef;             // a copy is not that part
      this.library.unshift(dup);
      this.selectedDevice = dup;
      this.render();
      this.changed();
    });

    this.btnDeleteDevice?.addEventListener('click', async () => {
      const dev = this.selectedDevice;
      if (!dev) return;
      if (dev.bimId) {
        if (!confirm(`Delete ${dev.manufacturer} ${dev.model} from the BIM library for everyone?`)) return;
        try {
          await deletePart(dev.bimId);
          this.setStatus(`Deleted ${dev.bimId} from the BIM library`);
        } catch (e) {
          this.setStatus(e.message, true);
          S().showProblem(e, { subject: `Delete ${dev.bimId}`, onRetry: () => this.btnDeleteDevice?.click() });
          return;
        }
      }
      this.library = this.library.filter(d => d !== dev);
      this.selectedDevice = null;
      if (this.library.length) await this.select(this.library[0]); else this.render();
      this.changed();
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
        this.changed();
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
      this.changed();
    });
  }

  async loadInitialData() {
    const wanted = new URLSearchParams(globalThis.location?.search || '').get('part');
    if (wanted) {
      await this.select({ id: wanted, bimId: wanted });
    }
    await this.searchLibrary(this.searchInput?.value?.trim() || '');
  }

  /** Expansion cards: the library's card products beside the config's generic types. */
  async loadCards() {
    const { cards, source, error } = await loadExpansionCards();
    this.cards = cards;
    // Library down but the generic types read: searchLibrary already says the library is down.
    if (source === 'none' && error) {
      S().showProblem(error, {
        subject: 'Expansion cards',
        fix: [`Cards are BIM library parts (DATABASE.server.BIM) at ${bimApi()}: check it is running in DockTor.`,
          'The generic card types are config/expansion-cards.json: check it is served next to the page.'],
        onRetry: () => this.loadCards(),
      });
    }
  }

  /** What the bus knows, through APKSoftapp; the kinds offered are config/discovery.json's. */
  async startDiscovery() {
    let kinds = [];
    try {
      const res = await fetch('./config/discovery.json', { cache: 'no-store' });
      if (res.ok) kinds = (await res.json()).kinds || [];
    } catch (_) { /* no config: every kind */ }
    const d = await S().discovered({ kinds, onChange: (things) => this.sayDiscovered(things) });
    this.discovery = d.ok ? d : null;
    this.discoveryProblem = d.ok ? null : d.problem;
    if (!d.ok) this.sayDiscovery(d.reason, 'dead');
    else this.sayDiscovered(d.things());
  }

  sayDiscovered(things) {
    const good = things.filter((t) => t.live && t.live.state === 'good').length;
    this.sayDiscovery(`${things.length} discovered on the bus (${good} verified in the last ${S().TRUST_MINUTES} min)`,
      things.length ? (good ? 'good' : 'kinda') : 'kinda');
  }

  sayDiscovery(text, state) {
    if (!this.discoveryStatus) return;
    this.discoveryStatus.textContent = text;
    this.discoveryStatus.setAttribute('data-apk-state', state);
  }

  /** Discovered things become unsaved devices (by MAC / serial, once each); size and power stay blank. */
  addDiscovered() {
    if (!this.discovery) {
      // the button did nothing before: say why, and Retry reads the bus again
      S().showProblem(this.discoveryProblem || 'bus_missing', {
        subject: 'Discovered devices',
        onRetry: () => this.startDiscovery().then(() => { if (this.discovery) this.addDiscovered(); }),
      });
      return;
    }
    const fresh = newDiscoveredDevices(this.library, this.discovery.things());
    if (!fresh.length) { this.sayDiscovery('Every discovered device is in the list already.', 'kinda'); return; }
    this.library = [...fresh, ...this.library];
    this.selectedDevice = fresh[0];
    this.render();
    this.changed();
  }

  handleBlockLoaded(block, meta = {}) {
    const loadedDev = deviceFromBlock(block);
    if (!loadedDev) return;
    this.library.unshift(loadedDev);
    this.selectedDevice = loadedDev;
    const tag = document.getElementById('block-tag');
    if (tag) tag.textContent = meta.title || meta.blockName || meta.name || 'DEVICE BLOCK';
    this.render();
  }

  /** Save: into the drawing inside the CAD, a .json download standalone. */
  saveBlock() {
    if (!this.selectedDevice) return;
    this.host.save(deviceToBlock(this.selectedDevice), deviceMeta(this.selectedDevice));
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
    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // The library answered the search already; only the unsaved local devices are filtered here.
    this.library
      .filter(d => d.bimId || !filter || `${d.manufacturer} ${d.model}`.toLowerCase().includes(String(filter).toLowerCase()))
      .forEach(dev => {
        const item = document.createElement('div');
        const isActive = this.selectedDevice && (this.selectedDevice === dev || this.selectedDevice.id === dev.id);
        item.className = `device-item ${isActive ? 'active' : ''}`;
        item.style.padding = '8px 10px';
        item.style.marginBottom = '4px';
        item.style.borderRadius = '4px';
        item.style.cursor = 'pointer';
        item.style.background = isActive ? 'var(--osc-bg-surface-hover)' : 'var(--osc-bg-input)';
        item.style.border = `1px solid ${isActive ? 'var(--osc-accent-primary)' : 'var(--osc-border-default)'}`;

        item.innerHTML = `
          <div style="font-weight:600; color:${isActive ? 'var(--osc-accent-primary)' : 'var(--osc-text-primary)'}; font-size:12px;">${esc(dev.model)}${dev.bimId ? '' : ' <span style="color:var(--osc-accent-primary);font-weight:400;">· unsaved</span>'}</div>
          <div style="font-size:10px; color:var(--osc-text-muted); display:flex; justify-content:space-between; margin-top:2px;">
            <span>${esc(dev.manufacturer)}</span>
            <span>${dev.ru ? `${dev.ru}U · ` : ''}${esc(dev.category)}${dev.stage === 'stub' ? ' · stub' : ''}</span>
          </div>
        `;
        item.addEventListener('click', () => this.select(dev));
        this.deviceListEl.appendChild(item);
      });
  }

  renderFormFields() {
    if (!this.selectedDevice) return;
    this.inputManufacturer.value = this.selectedDevice.manufacturer || '';
    this.inputModel.value = this.selectedDevice.model || '';
    this.inputPartNumber.value = this.selectedDevice.partNumber || '';
    this.selectCategory.value = this.selectedDevice.category || 'Other';
    // An unknown stays blank — the library never invents a 0 or a default depth.
    this.inputRu.value = this.selectedDevice.ru ?? '';
    this.inputDepth.value = this.selectedDevice.depthMm ?? '';
    this.inputPower.value = this.selectedDevice.basePowerW ?? '';
    this.inputBtu.value = this.selectedDevice.btuHr ?? '';
  }

  createPortsTable() {
    if (!this.portTableHost) return;
    this.portsTable = window.APKTable.create(this.portTableHost, {
      id: 'device-ports',
      columns: [
        { key: 'name', label: 'Port Group / Name' },
        { key: 'type', label: 'Connector', type: 'select', options: PORT_TYPES },
        { key: 'signal', label: 'Signal', type: 'select', options: PORT_SIGNALS },
        { key: 'dir', label: 'Direction', type: 'select', options: PORT_DIRS },
        { key: 'count', label: 'Qty', type: 'number', width: '50px' },
      ],
      rows: [],
      onEdit: (i, key, value, row) => {
        if (key === 'count') row.count = parseInt(value, 10) || 1;
        this.renderChassisPreview();
        this.changed();
      },
      onDelete: (i) => {
        this.selectedDevice.ports.splice(i, 1);
        this.renderPortsTable();
        this.renderChassisPreview();
        this.changed();
      },
      empty: 'No ports yet: + Add Port Interface.',
    });
  }

  /** The rows are the device's own ports: an edit lands on the device. */
  renderPortsTable() {
    if (!this.portsTable || !this.selectedDevice) return;
    if (!Array.isArray(this.selectedDevice.ports)) this.selectedDevice.ports = [];
    this.portsTable.setRows(this.selectedDevice.ports);
  }

  renderChassisPreview() {
    if (!this.chassisStage || !this.selectedDevice) return;
    const dev = this.selectedDevice;
    const ru = dev.ru || 1;
    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    /* EIA-310 front, in mm: a 482.6 mm (19") panel, a 440 mm body between two
       ears, 44.45 mm per U, two fixing slots per U per ear at ±15.875 mm from
       the U's centre. The slots are WIDE (9.5 x 7 mm, horizontal) — the slack
       is sideways, to meet the rail — never tall and skinny. */
    const PANEL_W = 482.6, BODY_W = 440, U = 44.45, HOLE_OFFSET = 15.875;
    const SLOT_W = 9.5, SLOT_H = 7, SLOT_FROM_EDGE = 7.95;
    const EAR_W = (PANEL_W - BODY_W) / 2;
    const M = 6;                                  // margin around the drawing
    const H = ru * U;
    const parts = [];

    // Ears and their slots
    for (const x0 of [M, M + PANEL_W - EAR_W]) {
      parts.push(`<rect x="${x0}" y="${M}" width="${EAR_W}" height="${H}" fill="#0f0f11" stroke="#3f3f46" stroke-width="0.8"/>`);
      const cx = x0 === M ? M + SLOT_FROM_EDGE : M + PANEL_W - SLOT_FROM_EDGE;
      for (let u = 0; u < ru; u++) {
        const uc = M + u * U + U / 2;
        for (const cy of [uc - HOLE_OFFSET, uc + HOLE_OFFSET]) {
          parts.push(`<rect x="${cx - SLOT_W / 2}" y="${cy - SLOT_H / 2}" width="${SLOT_W}" height="${SLOT_H}" rx="${SLOT_H / 2}" fill="#09090b" stroke="#52525b" stroke-width="0.6"/>`);
        }
      }
    }

    // Body
    const bx = M + EAR_W;
    parts.push(`<rect x="${bx}" y="${M}" width="${BODY_W}" height="${H}" rx="2" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>`);
    parts.push(`<text x="${bx + 8}" y="${M + Math.min(H / 2 - 2, 16)}" fill="#F4902C" font-size="9" font-weight="bold" font-family="sans-serif">${esc((dev.manufacturer || '').toUpperCase())}</text>`);
    parts.push(`<text x="${bx + 8}" y="${M + Math.min(H / 2 + 9, 27)}" fill="#f4f4f5" font-size="6.5" font-family="sans-serif">${esc(dev.model)}</text>`);

    /* Ports: EVERY port is drawn. Groups sit side by side after the name
       block; when they do not fit, all of them shrink together — nothing is
       dropped. Relative cell widths are the editor's own until per-connector
       datasheet footprints land (see EDITORS.CAD.Like.audio connectors). */
    const ports = dev.ports || [];
    const cellW = (t) => (/euroblock|phoenix/i.test(t) ? 18 : /iec|c1[3-9]|powercon/i.test(t) ? 16 : /rj45|ethercon|sfp/i.test(t) ? 13 : 11);
    const shortType = (t) => String(t || '?').replace(/^Phoenix-Euroblock$/i, 'Euro').replace(/-/g, ' ');
    const GAP = 1.5, GROUP_GAP = 7;
    const startX = bx + 120, endX = bx + BODY_W - 8;
    const labelOf = (p) => ((p.count || 1) > 1 ? `${shortType(p.type)} ×${p.count}` : shortType(p.type));
    const FONT = 4.2, CHAR_W = FONT * 0.62;     // monospace advance
    const labelW = (p) => labelOf(p).length * CHAR_W;
    const cellsW = (p) => (p.count || 1) * (cellW(p.type) + GAP) - GAP;
    // Labels keep their size and only the cells shrink, so find the scale that fits by search.
    const widthAt = (k) => ports.reduce((w, p) => w + Math.max(cellsW(p) * k, labelW(p)) + GROUP_GAP * k, -GROUP_GAP * k);
    let k = 1;
    while (k > 0.2 && widthAt(k) > endX - startX) k -= 0.01;
    const cellH = Math.min(14, H - 18);
    const cy = M + H / 2 - 3;
    let x = startX;
    ports.forEach((p) => {
      const n = p.count || 1;
      const w = cellW(p.type) * k;
      const slotW = Math.max(cellsW(p) * k, labelW(p));   // the label never shrinks below legible
      const g0 = x;
      let cx0 = g0 + (slotW - cellsW(p) * k) / 2;
      for (let c = 0; c < n; c++) {
        parts.push(`<rect x="${cx0}" y="${cy - cellH / 2}" width="${w}" height="${cellH}" rx="1.2" fill="#0f0f11" stroke="#4A9EFF" stroke-width="0.5"><title>${esc(p.name)} — ${esc(p.type)} ${c + 1}/${n}</title></rect>`);
        if (/euroblock|phoenix/i.test(p.type)) {
          for (let pin = 0; pin < 3; pin++) parts.push(`<circle cx="${cx0 + w * (pin + 1) / 4}" cy="${cy}" r="${Math.min(1.6, w / 9)}" fill="#a1a1aa"/>`);
        }
        cx0 += w + GAP * k;
      }
      parts.push(`<text x="${g0 + slotW / 2}" y="${cy + cellH / 2 + 6.5}" fill="#a1a1aa" font-size="${FONT}" text-anchor="middle" font-family="monospace"><title>${esc(p.name)}</title>${esc(labelOf(p))}</text>`);
      x = g0 + slotW + GROUP_GAP * k;
    });

    this.chassisStage.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PANEL_W + 2 * M} ${H + 2 * M}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
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
      reader.onerror = () => S().showProblem('file_unreadable', {
        subject: file.name, detail: reader.error && reader.error.message, onRetry: () => this.promptOpen(),
      });
      reader.onload = (re) => {
        try {
          const parsed = JSON.parse(re.target.result);
          if (!parsed || typeof parsed !== 'object') throw new TypeError('the file holds no device object');
          this.handleBlockLoaded(parsed, { title: file.name });
        } catch (err) {
          S().showProblem(err instanceof SyntaxError ? 'bad_json' : 'bad_input', {
            subject: file.name,
            detail: err.message,
            fix: ['Open a device block .json (Save & Return outside the CAD downloads one).'],
            onRetry: () => this.promptOpen(),
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
}

let _deviceCounter = 1;

export class DeviceLibraryStore {
  /** `cards`: the expansion cards slots may hold (loadExpansionCards' list); none = slots add nothing. */
  constructor(initial = [], { cards = [] } = {}) {
    this.devices = JSON.parse(JSON.stringify(initial));
    this.cards = cards;
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
          const card = cardFor(this.cards, slot.cardId);
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
          const card = cardFor(this.cards, slot.cardId);
          if (card && card.ports) ports += card.ports;
        }
      });
    }
    return ports;
  }
}

if (typeof window !== 'undefined') {
  // vocabulary.js awaits its config at the top level, so this module can finish after
  // DOMContentLoaded has fired: start now when it has (the editor never started otherwise)
  const start = () => { window.deviceApp = new DeviceLibraryApp(); };
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', start);
  else start();
}
