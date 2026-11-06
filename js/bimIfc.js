// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
/* IFC IN AND OUT OF THE DEVICE EDITOR (IFC-CORE-DELTAS instruments-4).

   Save to Library stays the JSON PUT (bimLibrary.js savePart): the part is the stored form, and the
   server writes its .ifc twin beside it. IFC is the EXCHANGE file going in and out:

     Export .ifc   GET  /api/bim/parts/<maker>/<model>.ifc            the part's own IFC4X3_ADD2 type file
     Import .ifc   the file is read HERE first with the contracts' STEP codec (vendor/apk-contracts/apk-ifc.js,
                   contracts/src/ifc — one parser, its Python twin bim/ifc_read.py), so the page can say what
                   types it holds before anything is sent; then
                   PUT  /api/bim/parts/<maker>/<model>.ifc?dry_run=1  the server's importer answers the
                   candidate part {part, problems, report}, merged onto the stored one, nothing saved.
                   The editor shows it unsaved; Save to Library then PUTs it as JSON (sources += ifc-import).

   panel and protocols never come from an IFC (the server keeps the stored ones). */

import { parseStep, schemaOf, getPsets, isTypeObject } from '../vendor/apk-contracts/apk-ifc.js';
import { bimApi, partIdFor, slug } from './bimLibrary.js';

const SCHEMAS = ['IFC4X3_ADD2', 'IFC4X3', 'IFC4'];

/** The URL of a part's IFC type file. */
export function partIfcUrl(id, api = bimApi()) {
  return `${api}/parts/${id}.ifc`;
}

/** Every IFC type in the text that names a maker: [{entity, name, partId, manufacturer, model, predefined}].
    Throws (with the reader's line) on a file that is not ISO 10303-21, or not IFC4 / IFC4X3. */
export function readIfcTypes(text) {
  const file = parseStep(String(text ?? ''));
  const schema = schemaOf(file);
  if (!SCHEMAS.includes(String(schema || '').toUpperCase())) {
    const err = new Error(`this file is ${schema || 'no IFC schema'}: the library reads ${SCHEMAS.join(', ')}`);
    err.code = 'bad_input';
    throw err;
  }
  const out = [];
  for (const e of file.entities) {
    if (!e.type.startsWith('IFC') || !isTypeObject(e.type)) continue;
    const ps = getPsets(file, e);
    const m = ps.Pset_ManufacturerTypeInformation || {};
    const apk = ps.APK_Part || {};
    const manufacturer = m.Manufacturer || '';
    const model = m.ModelReference || m.ModelLabel || (typeof e.args[2] === 'string' ? e.args[2] : '');
    if (!manufacturer && !apk.PartId) continue;   // a type with no maker is no catalogue part
    const predefined = e.args.length ? e.args[e.args.length - 1] : null;
    out.push({
      entity: e.type,
      name: typeof e.args[2] === 'string' ? e.args[2] : '',
      partId: apk.PartId || partIdFor(manufacturer, model),
      manufacturer, model,
      predefined: predefined && predefined.kind === 'enum' ? predefined.value : null,
    });
  }
  return out;
}

async function answer(res, what) {
  if (res.status === 401) {
    const err = new Error(`${what}: the gateway wants the bench credential for a library write`);
    err.status = 401; err.code = 'http_forbidden';
    throw err;
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`${what}: ${body.error || res.status}`);
    err.status = res.status;
    err.code = res.status === 404 ? 'http_not_found' : res.status >= 500 ? 'http_server_error' : 'bad_input';
    throw err;
  }
  return body;
}

/** The part's IFC type file as text (Export .ifc). */
export async function exportPartIfc(id, { api = bimApi(), fetchImpl = globalThis.fetch } = {}) {
  const res = await fetchImpl(partIfcUrl(id, api));
  if (!res.ok) {
    const err = new Error(`export ${id}.ifc: ${res.status}`);
    err.status = res.status;
    err.code = res.status === 404 ? 'http_not_found' : 'http_server_error';
    throw err;
  }
  return res.text();
}

/** The candidate part the server's importer reads from the file for `partId` — never saved (?dry_run=1).
    Answers {part, problems, warnings?, report}. */
export async function importPartIfc(text, partId, { api = bimApi(), fetchImpl = globalThis.fetch } = {}) {
  const [maker, model] = String(partId || '').split('/');
  if (!maker || !model) throw Object.assign(new Error(`not a part id <maker>/<model>: ${partId}`), { code: 'bad_input' });
  const res = await fetchImpl(`${api}/parts/${slug(maker)}/${slug(model)}.ifc?dry_run=1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-step' },
    body: text,
  });
  return answer(res, `import ${partId}.ifc`);
}

/** The type to import: the one that is `wantId` (the device on screen), else the file's only one. */
export function pickType(types, wantId) {
  return types.find(t => t.partId === wantId) || (types.length === 1 ? types[0] : null);
}

/** A download of text as a file (the page's Export .ifc), no APKSoftapp needed. */
export function downloadText(text, name, type = 'model/step') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
