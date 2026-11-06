// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
/* THE DEVICE LIBRARY IS THE BIM LIBRARY (DATABASE.server.BIM, /api/bim).
   This editor used to ship five devices in its own source; every device type
   now lives once, as an `apk.bim.part/1` part, and this module is the only
   place the editor's device shape and a part meet.

   partToDevice / deviceToPart are pure (tested under node); the rest is the
   HTTP client. BIM_API is same-origin /api/bim unless the page sets
   globalThis.APK_BIM_API or the URL carries ?bim=<url>. */

export const BIM_CATEGORIES = [
  'Audio', 'Microphones', 'Video', 'Network', 'Control', 'Power',
  'Infrastructure', 'Test & Measurement', 'Computing', 'Accessories', 'Other'
];

const DIR_TO_SIDE = { In: 'input', Out: 'output', Bidi: 'connection' };
const SIDE_TO_DIR = { input: 'In', output: 'Out', connection: 'Bidi', supply: 'In' };

/** The server's slug (bim/part.py): ascii, a-z0-9, single dashes, ≤80. */
export function slug(text) {
  const FOLD = { 'ø': 'o', 'Ø': 'O', 'æ': 'ae', 'Æ': 'AE', 'ß': 'ss', 'ł': 'l', 'Ł': 'L', 'đ': 'd', 'Đ': 'D', 'œ': 'oe', 'Œ': 'OE', 'þ': 'th', 'Þ': 'TH' };
  let s = String(text ?? '').replace(/[øØæÆßłŁđĐœŒþÞ]/g, c => FOLD[c]).normalize('NFKD').replace(/[^\x00-\x7f]/g, '');
  s = s.replace(/&/g, ' and ').replace(/\+/g, ' plus ');
  s = s.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase().replace(/-{2,}/g, '-');
  s = s.slice(0, 80).replace(/^-+|-+$/g, '');
  return s || 'unnamed';
}

export function partIdFor(manufacturer, model) {
  return `${slug(manufacturer)}/${slug(model)}`;
}

/** A BIM part → the editor's device. Unknowns stay unknown ('' / 0 is never invented). */
export function partToDevice(part) {
  const phys = part.physical || {};
  const power = part.power || {};
  return {
    id: part.id,
    bimId: part.id,
    manufacturer: part.manufacturer || '',
    model: part.model || '',
    partNumber: part.part_number || '',
    category: part.category || 'Other',
    stage: part.stage,
    ru: phys.rack_units ?? '',
    depthMm: phys.depth_mm ?? '',
    basePowerW: power.watts ?? '',
    btuHr: power.btu_hr ?? '',
    slotCount: (part.slots || []).length,
    slots: part.slots || [],
    ports: (part.ports || []).map((p, i) => ({
      id: `p${i + 1}`,
      name: p.group || p.terminal || `Port ${i + 1}`,
      type: p.connector || '',
      signal: p.signal || '',
      dir: SIDE_TO_DIR[p.side] || 'In',
      count: p.count || 1,
      _bim: p                       // the part's own port, so a save keeps domain/labels/face
    })),
    // its BIM reference {part, url, rev} (ROAD-3572): saved with the device block
    ...(part.ref && part.ref.part ? { bimRef: { part: part.ref.part, url: part.ref.url || '', rev: part.ref.rev || '' } } : {}),
    _part: part                     // everything the editor does not show (media, ext, aka…)
  };
}

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

function prune(obj) {
  if (Array.isArray(obj)) return obj.map(prune).filter(v => v !== undefined);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      const p = prune(v);
      if (p === undefined || p === '' || p === null) continue;
      if (typeof p === 'object' && !Array.isArray(p) && !Object.keys(p).length) continue;
      if (Array.isArray(p) && !p.length) continue;
      out[k] = p;
    }
    return out;
  }
  return obj;
}

/** The editor's device → a part to PUT. Fields the editor does not show are kept from the part it came from. */
export function deviceToPart(dev) {
  const base = dev._part ? JSON.parse(JSON.stringify(dev._part)) : {};
  const maker = slug(dev.manufacturer);
  const id = `${maker}/${slug(dev.model)}`;
  const renamed = base.id && base.id !== id;
  const part = {
    ...base,
    id,
    maker,
    manufacturer: String(dev.manufacturer || '').trim(),
    model: String(dev.model || '').trim(),
    part_number: dev.partNumber || undefined,
    name: renamed || !base.name ? undefined : base.name,
    category: BIM_CATEGORIES.includes(dev.category) ? dev.category : 'Other',
    physical: { ...(base.physical || {}), rack_units: num(dev.ru), depth_mm: num(dev.depthMm) },
    power: { ...(base.power || {}), watts: num(dev.basePowerW), btu_hr: num(dev.btuHr) },
    ports: (dev.ports || []).map(p => {
      const was = p._bim || {};
      const sameGroup = (was.group || was.terminal) === p.name;
      return {
        ...(sameGroup ? was : {}),
        group: p.name,
        side: DIR_TO_SIDE[p.dir] || 'input',
        connector: p.type || undefined,
        signal: p.signal || undefined,
        domain: sameGroup && was.domain ? was.domain : undefined,
        count: Math.max(1, parseInt(p.count, 10) || 1)
      };
    }),
    slots: dev.slots && dev.slots.length ? dev.slots : undefined
  };
  if (!dev.ru && part.physical) delete part.physical.height_mm;   // derived from RU; let the server re-derive
  delete part.stage;                                                // derived by the server, never trusted
  delete part.updated_at;
  delete part.schema;
  return prune(part);
}

// ---------------------------------------------------------------- HTTP ----
export function bimApi() {
  try {
    const fromUrl = new URLSearchParams(globalThis.location?.search || '').get('bim');
    if (fromUrl) return fromUrl.replace(/\/$/, '');
  } catch (_) { /* no location under node */ }
  return (globalThis.APK_BIM_API || '/api/bim').replace(/\/$/, '');
}

/* An HTTP failure as an Error that carries its problem code (contracts/problems), so
   APKSoftapp.showProblem says what to do about it, not just the status. */
function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  err.code = status === 401 || status === 403 ? 'http_forbidden'
    : status === 404 ? 'http_not_found'
      : status >= 500 ? 'http_server_error' : 'bad_input';
  return err;
}

async function json(res, what) {
  if (res.status === 401) throw httpError(`${what}: the gateway wants the bench credential for a library write`, 401);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw httpError(`${what}: ${body.error || res.status}`, res.status);
  return body;
}

export async function searchParts({ q = '', limit = 200, sort = 'featured', hasPorts = false } = {}) {
  const qs = new URLSearchParams({ limit: String(limit), sort });
  if (q) qs.set('q', q);
  if (hasPorts) qs.set('has_ports', '1');
  return json(await fetch(`${bimApi()}/parts?${qs}`), 'search');
}

export async function getPart(id) {
  return json(await fetch(`${bimApi()}/parts/${id}`), `read ${id}`);
}

export async function savePart(part) {
  return json(await fetch(`${bimApi()}/parts/${part.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(part)
  }), `save ${part.id}`);
}

export async function deletePart(id) {
  return json(await fetch(`${bimApi()}/parts/${id}`, { method: 'DELETE' }), `delete ${id}`);
}
