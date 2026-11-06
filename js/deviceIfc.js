// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
/* deviceIfc.js — THE DEVICE BLOCK'S .IFC TWIN (ROAD-3583). Standalone, Save writes the native device block
   AND this IFC4X3_ADD2 file through APKSoftapp.saveModel; Open reads either back to the same block.
   The library part's own type file stays the server's (Export .ifc, GET /api/bim/parts/<id>.ifc): this is
   the device AS THE EDITOR HOLDS IT, saved or not. The spine is netIfc.js.

     the type        IfcXxxType by the model and category (netIfc kindOf: a switch an
                     IfcCommunicationsApplianceType IPNETWORKEQUIPMENT, a receiver an IfcAudioVisualApplianceType
                     RECEIVER, else the AV type USERDEFINED with the category as ElementType); a library part's
                     GlobalId is the part's, ifcGuid('part', id), and it carries APK_Part.PartId;
                     Pset_ManufacturerTypeInformation {Manufacturer, ModelReference, ArticleNumber};
                     APK_AVDevice.RackUnits; Pset_ElectricalDeviceCommon {NominalPowerConsumption (W), HeatDissipation (W, from BTU/h)};
                     APK_DeviceEditor {EditorId, Category, Depth (mm), SlotCount, Slots}
     the occurrence  one element of that class, typed by it, Name = the model; a MAC identity is APK_Identity
                     and its GlobalId inst/mac:<mac>, any other identity APK_NetworkDevice.DeviceId
     its ports       one IfcDistributionPort CABLE per terminal (a row of count n is n ports, APK_Terminal.Group =
                     the row id, TerminalId 1..n), Name = the row's name, Description = its signal, FlowDirection
                     from In / Out / Bidi, SystemType from the signal; the connector as
                     Pset_DistributionPortTypeCable words and APK_Terminal.Connector as the editor names it */

import { ifcGuid, ifcModel, readIfc, occurrenceGuid, kindOf, connectorWords, systemTypeOf, ident, label, text, int, measure, num, str, MAC_RE } from './netIfc.js';

export { schemaOf } from './netIfc.js';

const BTU_PER_W = 3.412141633;   // 1 W = 3.412141633 BTU/h (IT)
const FLOW = { In: 'SINK', Out: 'SOURCE', Bidi: 'SOURCEANDSINK' };
const DIR = { SINK: 'In', SOURCE: 'Out', SOURCEANDSINK: 'Bidi' };
const stemOf = (n) => String(n || 'device').replace(/\.(ifc|json)$/i, '');

/** The device block (deviceToBlock) as IFC4X3_ADD2 STEP text. */
export function deviceToIfc(block, { name } = {}) {
  const d = block || {};
  const stem = stemOf(name || d.id);
  const devId = str(d.id) || stem;
  const model = str(d.model) || 'Device';
  const m = ifcModel({ key: ['device', devId], name: `${str(d.manufacturer)} ${model}`.trim(), description: 'Device editor: one device and its terminals',
    app: 'APK.audio Device editor', appId: 'EDITORS.Device', storey: 'Devices' });
  const partId = str(d.bimId || d.bimRef?.part);
  let kind = kindOf(`${model} ${str(d.category)}`);
  if (kind.predefined === 'USERDEFINED') kind = { ...kind, objectType: str(d.category) || 'Device' };

  const typeGid = partId ? ifcGuid('part', partId) : m.gid('type');
  const ru = num(d.ru);
  const w = num(d.basePowerW);
  const btu = num(d.btuHr);
  const depth = num(d.depthMm);
  const slots = num(d.slotCount);
  const typeSets = [
    m.pset('Pset_ManufacturerTypeInformation', typeGid, [
      d.manufacturer ? m.prop('Manufacturer', label(d.manufacturer)) : null,
      m.prop('ModelReference', label(model)),
      d.partNumber ? m.prop('ArticleNumber', ident(d.partNumber)) : null,
    ]),
    partId ? m.pset('APK_Part', typeGid, [m.prop('PartId', ident(partId))]) : null,
    ru != null && ru > 0 ? m.pset('APK_AVDevice', typeGid, [m.prop('RackUnits', int(ru))]) : null,
    m.pset('Pset_ElectricalDeviceCommon', typeGid, [
      w != null ? m.prop('NominalPowerConsumption', measure('IFCPOWERMEASURE', w)) : null,
      btu != null ? m.prop('HeatDissipation', measure('IFCPOWERMEASURE', btu / BTU_PER_W)) : null,
    ]),
    m.pset('APK_DeviceEditor', typeGid, [
      m.prop('EditorId', ident(devId)),
      d.category ? m.prop('Category', label(d.category)) : null,
      depth != null && depth > 0 ? m.prop('Depth', measure('IFCPOSITIVELENGTHMEASURE', depth)) : null,
      slots != null ? m.prop('SlotCount', int(slots)) : null,
      Array.isArray(d.slots) && d.slots.length ? m.prop('Slots', text(JSON.stringify(d.slots))) : null,
    ]),
  ];
  const type = m.type(`${kind.entity}TYPE`, { gid: typeGid, name: model, tag: partId || null, elementType: kind.objectType, predefined: kind.predefined, sets: typeSets });

  const g = occurrenceGuid(m, d.identity, 'device', devId);
  const el = m.element(kind.entity, { gid: g, name: model, objectType: kind.objectType, tag: devId, predefined: kind.predefined });
  m.typeOf(el, type);
  m.contain(el, m.space(''));
  const id = str(d.identity).trim().toLowerCase();
  if (MAC_RE.test(id)) m.pset('APK_Identity', g, [m.prop('IdentityKey', ident(`mac:${id}`)), m.prop('MacAddress', ident(id))], [el]);
  else if (id) m.pset('APK_NetworkDevice', g, [m.prop('DeviceId', ident(d.identity))], [el]);

  const ports = [];
  (Array.isArray(d.ports) ? d.ports : []).forEach((row, i) => {
    const rid = str(row.id) || `p${i + 1}`;
    const n = Math.max(1, Math.trunc(num(row.count) ?? 1));
    const words = connectorWords(row.type);
    const sys = systemTypeOf(row.signal);
    for (let k = 1; k <= n; k++) {
      const pg = m.gid('device', devId, 'port', rid, String(k));
      const p = m.port({ gid: pg, name: str(row.name) || null, description: str(row.signal) || null, flow: FLOW[row.dir] || 'SOURCEANDSINK', kind: 'CABLE', system: sys });
      ports.push(p);
      if (words) {
        m.pset('Pset_DistributionPortTypeCable', pg, [
          m.enumProp('ElectricalConnectionType', words.type),
          m.prop('ConnectionSubtype', label(words.subtype)),
          m.enumProp('ConnectionGender', words.gender),
        ], [p]);
      }
      m.pset('APK_Terminal', pg, [m.prop('Group', label(rid)), m.prop('TerminalId', ident(String(k))), row.type ? m.prop('Connector', label(row.type)) : null], [p]);
    }
  });
  m.nest(el, g, ports);
  return m.finish(stem);
}

/** An IFC model this editor saved → the device block; throws a sentence for any other IFC. */
export function deviceFromIfc(textIn) {
  const x = readIfc(textIn);
  const t = x.file.entities.find((e) => /TYPE$/.test(e.type) && x.psets(e).APK_DeviceEditor);
  if (!t) throw new TypeError('no Device editor device in this IFC (no type carries APK_DeviceEditor): a library type file goes in with ⬆ Import .ifc');
  const ts = x.psets(t);
  const ed = ts.APK_DeviceEditor;
  const mi = ts.Pset_ManufacturerTypeInformation || {};
  const el = x.file.entities.find((e) => x.typeOf(e) === t);
  const ps = el ? x.psets(el) : {};
  const rows = [];
  for (const p of x.ports(el)) {
    const tp = x.psets(p).APK_Terminal || {};
    const rid = str(tp.Group);
    const last = rows[rows.length - 1];
    if (last && last.id === rid) { last.count += 1; continue; }
    rows.push({ id: rid, name: x.name(p), type: str(tp.Connector), signal: x.desc(p), dir: DIR[x.flow(p)] || 'Bidi', count: 1 });
  }
  const e = ps.Pset_ElectricalDeviceCommon || ts.Pset_ElectricalDeviceCommon || {};
  const block = {
    type: 'device',
    id: str(ed.EditorId),
    manufacturer: str(mi.Manufacturer),
    model: str(mi.ModelReference) || x.name(t),
    partNumber: str(mi.ArticleNumber),
    category: str(ed.Category),
    ru: ts.APK_AVDevice?.RackUnits ?? null,
    depthMm: ed.Depth ?? null,
    basePowerW: e.NominalPowerConsumption ?? null,
    btuHr: e.HeatDissipation == null ? null : Math.round(e.HeatDissipation * BTU_PER_W * 1000) / 1000,
    slotCount: ed.SlotCount ?? 0,
    slots: ed.Slots ? JSON.parse(ed.Slots) : [],
    ports: rows,
  };
  if (ts.APK_Part?.PartId) block.bimId = str(ts.APK_Part.PartId);
  const identity = ps.APK_Identity?.MacAddress || ps.APK_NetworkDevice?.DeviceId;
  if (identity) block.identity = str(identity);
  return block;
}
