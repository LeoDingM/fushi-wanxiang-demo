# 地铁 3号线（槐江线）· 井槐里站 ⇄ 中央商务区站 — ready for core integration

Rebuild after Leo playtest (2026-10-10 evening): **glass pavilion street entrance → one-step into B1**, **separate 入站/出站闸机**, wider halls/platforms, lower crowd.

Standalone: **`metro_preview.html`**. Flow smoke: `python3 tools/metro_capture.py flow` (PASS). Captures: `python3 tools/metro_capture.py all`.

## Files (metro-owned + two street-art touches)
| file | what |
|---|---|
| `js/metro.js` | `FushiMetro` + `installCore(SP)` (auto after game.js). IN/OUT gate logic, ride fare on arrival, no street-facade place. |
| `metro45.js` / `metro45.json` | built areas. **Live stations land on concourse** (`jhl_concourse` / `cbd_concourse`). `jhl_street` / `cbd_street` kept only for art debug. |
| `tools/layouts/metro_*.json` | rebuilt wider layouts; gate banks `kind:"in"` / `kind:"out"`. |
| `tools/build_metro.py` | expand + validate (0 problems). |
| `kit_metro/` | mt_* atlas (pavilion, gates, PSD, train, ads…). |
| `shared-rules/rules.json` → `metro` | keys only; stations[].area → concourse; crowd base 5 / max 14. |
| `tools/metro_capture.py` | `all` → M1–M5 + **M1b-street-stairs**; `flow` auto-test. |
| **Street art (needed for pavilion):** `art-pack/scene3d/gen_kit45.py` `p_metro_entry` rewritten as glass pavilion (stairs+escalator visible, name lightbox, totem); rebuild → `kit_int/`. `scene.js` plaza pave + trees/planters + `metro_jhl` at (41.2, −8.2) rot 0, reach (41.2, −10.6), hours 06:00–23:00. |

## Integration (index.html: 3 script tags)
```html
<script src="kit_metro/kit_manifest.js"></script>
<script src="metro45.js"></script>
<script src="js/metro.js"></script>   <!-- after game.js; auto-installs -->
```

### installCore
* Registers **`SP.places.metro_jhl`** / **`SP.places.metro_cbd`**.
* Street object `metro_jhl` (`interact:"metro"`, `to:"metro_jhl"`) → **one enter = B1 concourse** (no intermediate「地面入口」place).
* CBD exits `{to:"metro_cbd", link:"A".."D"}` → unpaid hall at that letter (`exit_spawns`).
* Full-screen metro canvas (z 50); core clock frozen (`scale=0`) while inside; money via `R.spend` + `G.payCard`; state at `G.ps.metro`.
* Exits: `street` → 李默 at `metro_jhl.reach` facing N (toward mouth); `cbd` → `SP.places.cbd.enter({exit, from:"metro_cbd"})` (letters A 中央公园 · B 云汇天地 · C 天枢塔 · D 云汇体育中心).

## Layout notes (Leo bugs fixed)
1. **Street pavilion:** glass walls + flat canopy + 「井槐里站」lightbox + red logo totem; stairs/escalator visible down; paved plaza + tree planters (not grass pit).
2. **No double-enter:** `rules.metro.stations[].area` = concourse; deprecated street areas not used on enter.
3. **Separate gates:** 入站闸机 (south unpaid → north paid) and 出站闸机 (north paid → south unpaid), parallel banks ~11 m apart at 井槐里; CBD wider (7 OUT).
4. **Circulation:** roomy security queue, 客服中心 on side reach without choke, ≥2.5–3 m side corridors; OUT → exits A–D without crossing unpaid awkwardly.
5. **Platforms:** widened island; crowd density reduced; PSDs kept.

## Screenshots (390×844)
| file | content |
|---|---|
| `M1-entrance.png` | 井槐里 B1 unpaid hall (stairs up + gates) |
| `M1b-street-stairs.png` | **core street** glass pavilion + visible stairs |
| `M2-security.png` | 安检 |
| `M3-gates.png` | 进站三方式菜单（扫码/单程票/交通卡） |
| `M4-platform.png` | 站台列车开门 |
| `M5-cbd-station.png` | CBD 站厅 |

## Known gaps
* Other 7 stations data-only（原型未开放）.
* No in-train view (fade + skip by design); no sound.
* NPCs don't use TVM/counter.
* Underground lighting is metro-local (no core weather FX).
