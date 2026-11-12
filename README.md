# 📟 EDITORS.Device — Device Library & Chassis Editor

Edits a device TYPE: maker, model, part number, department, rack units, depth, power, heat, ports and
card slots, drawn as an EIA-310 front panel in mm.

**The catalogue is the BIM library** (`PODS/POD.database/DATABASE.server.BIM`, `/api/bim`) — this editor ships no
devices of its own (`js/bimLibrary.js`):
- the list searches the library; picking one loads the whole part;
- **Save to Library** PUTs it back (fields this editor does not show — media, `ext`, `aka` — are kept);
  **Delete** removes it after a confirm; the gateway asks for the bench credential;
- `?part=<maker>/<model>` opens one part (the BIM Store's "Edit in Device Editor");
- when the part has a device **on the bench** presenting its panel, **▶ Open its panel** opens that default GUI
  in the OS shell.

Unknown values stay blank — the library never invents a 0. Tests: `node --test tests/*.test.mjs`
(the five devices the editor used to ship are a test fixture, `tests/fixtures/defaultDevices.mjs`).

<!-- wiki:smoke -->
**Smoke test** — ❌ FAIL 2/3 since 2026-11-12 00:16 EST — [results](Documentation/%F0%9F%A7%A9Manual%20and%20Artifacts/SMOKE.md)
<!-- /wiki:smoke -->
