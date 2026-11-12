# Smoke test — EDITORS.Device

Is `EDITORS.Device` deployed? Written by `.apk.scripts/smoke.py` from the module's own shape; what each check means is in that script's header.

← [Wiki home](../README.md)

**✅ PASS** — 3/3 checks, since 2026-11-12 00:40 EST

| Check | Target | Result | Detail |
|---|---|---|---|
| pushed | [APK.softapp.EDITORS.Device](https://github.com/LikeDotAudio/APK.softapp.EDITORS.Device.git) | ✅ | HEAD is on origin |
| web | [index.html](https://apk.audio/APK%3ASoftapps/EDITORS/EDITORS.Device/index.html) | ✅ | HTTP 200 |
| app | `OS/Device Library` → `PODS/POD.THIN/Softapps/EDITORS/EDITORS.Device/index.html` | ✅ | present |

Re-run: `python3 .apk.scripts/smoke.py PODS/POD.THIN/Softapps/EDITORS/EDITORS.Device`

<!-- smoke:sig 25e4f4a8f6c7 since 2026-11-12 00:40 EST -->
