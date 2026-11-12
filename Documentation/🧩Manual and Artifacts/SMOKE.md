# Smoke test — EDITORS.Device

Is `EDITORS.Device` deployed? Written by `.apk.scripts/smoke.py` from the module's own shape; what each check means is in that script's header.

← [Wiki home](../README.md)

**❌ FAIL** — 2/3 checks, since 2026-11-12 00:16 EST

| Check | Target | Result | Detail |
|---|---|---|---|
| pushed | [APK.softapp.EDITORS.Device](https://github.com/LikeDotAudio/APK.softapp.EDITORS.Device.git) | ❌ | 1 commit(s) not pushed |
| web | [index.html](https://apk.audio/APK%3ASoftapps/EDITORS/EDITORS.Device/index.html) | ✅ | HTTP 200 |
| app | `OS/Device Library` → `PODS/POD.THIN/Softapps/EDITORS/EDITORS.Device/index.html` | ✅ | present |

Re-run: `python3 .apk.scripts/smoke.py PODS/POD.THIN/Softapps/EDITORS/EDITORS.Device`

<!-- smoke:sig 438e7eefe8d8 since 2026-11-12 00:16 EST -->
