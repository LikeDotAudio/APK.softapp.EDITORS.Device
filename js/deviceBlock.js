// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// The device block, in and out, and a discovered thing as a device — no DOM, no
// bus, so the tests drive it.

export const BLOCK_TYPE = 'device';

/* The port vocabulary the editor offers (the port table's selects). A value a
   block brings that is not here is kept and offered too. */
export const PORT_TYPES = ['RJ45', 'XLR-F', 'XLR-M', 'Phoenix-Euroblock', 'BNC', 'HDMI', 'USB-B', 'USB-C', 'SFP', 'Terminal-Strip', 'IEC-C14'];
export const PORT_SIGNALS = ['Analog Audio', 'Digital Audio', 'Network', 'Video', 'Serial Control', 'AC Power', 'RF Antenna'];
export const PORT_DIRS = ['In', 'Out', 'Bidi'];

/** A device from a block (the CAD's toEditor.load, or an opened .json). */
export function deviceFromBlock(block, now = Date.now()) {
  if (!block || typeof block !== 'object') return null;
  return {
    id: block.id || `dev_${now}`,
    manufacturer: block.manufacturer || 'Custom',
    model: block.model || block.name || 'Custom Block Device',
    partNumber: block.partNumber || '',
    category: block.category || 'Audio',
    ru: block.ru || 1,
    depthMm: block.depthMm || 300,
    basePowerW: block.basePowerW || block.powerW || 50,
    btuHr: block.btuHr || 170,
    slotCount: block.slotCount || 0,
    slots: Array.isArray(block.slots) ? block.slots : [],
    ports: Array.isArray(block.ports) ? block.ports.map((p) => ({ ...p })) : [],
    ...(block.bimId ? { bimId: block.bimId } : {}),
    ...(block.identity ? { identity: block.identity } : {}),
  };
}

/** The block a device saves as (toCad.blockSave / blockChanged): the editor's own fields, no _part cache. */
export function deviceToBlock(dev, now = new Date()) {
  const { _part, ...rest } = dev || {};
  return { type: BLOCK_TYPE, ...JSON.parse(JSON.stringify(rest)), timestamp: now.toISOString() };
}

export function deviceMeta(dev) {
  const model = String((dev && dev.model) || 'device');
  return {
    title: `${(dev && dev.manufacturer) || ''} ${model}`.trim(),
    filename: `device_${model.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
  };
}

/** A discovered thing's identity: MAC, else serial, else the agent — never an IP. */
export function thingIdentity(t) {
  return (t && (t.mac || t.serial || t.agent)) || '';
}

/**
 * A discovered thing (APKSoftapp.discovered().things()) as an unsaved device.
 * The network says who it is, not how big it is: RU, depth and power stay blank
 * for the user (or the BIM library) to fill — nothing is made up.
 */
export function deviceFromThing(t) {
  const identity = thingIdentity(t);
  if (!identity) return null;
  return {
    id: `disc_${identity.replace(/[^\w]/g, '_')}`,
    identity,
    manufacturer: t.vendor || 'Discovered',
    model: t.model || t.name || identity,
    partNumber: t.model || '',
    category: 'Other',
    ru: null,
    depthMm: null,
    basePowerW: null,
    btuHr: null,
    slotCount: 0,
    slots: [],
    ports: [],
  };
}

/** The discovered devices `library` does not hold yet (by identity), newest first. */
export function newDiscoveredDevices(library, things) {
  const have = new Set((library || []).map((d) => d.identity).filter(Boolean));
  const out = [];
  for (const t of things || []) {
    const dev = deviceFromThing(t);
    if (!dev || have.has(dev.identity)) continue;
    have.add(dev.identity);
    out.push(dev);
  }
  return out;
}
