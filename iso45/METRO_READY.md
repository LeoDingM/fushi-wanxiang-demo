# 地铁 3号线（槐江线）· 井槐里站 ⇄ 中央商务区站 — ready for core integration

Everything is in **separate files**. I edited no core or store file (main.js, layers.js, place.js, game.js, world.js, kit_int/, store.js, kit_store/ are all untouched).
Standalone test page: **`metro_preview.html`** (desktop + phone, Chinese UI, floating joystick + 互动 button).

## Files
| file | what |
|---|---|
| `js/metro.js` | `window.FushiMetro`: self-contained module (own 45° renderer using the same projection constants as core.js, topo depth sort, glass, signs/LED text, actors from `window.ACTORS`, NPC crowd, trains, ticketing, HUD, touch). Also has `FushiMetro.installCore(SP)`, the core glue, which **auto-runs** when the file is loaded after game.js. |
| `metro45.js` / `metro45.json` | generated area data (`window.METRO45`): 6 areas jhl_street / jhl_concourse / jhl_platform / cbd_street / cbd_concourse / cbd_platform |
| `tools/layouts/metro_*.json` | the 6 hand-edited layouts (objects, walls, gate rows, PSD rows, portals, zones, staff, NPC routes, exits) |
| `tools/build_metro.py` | `python3 tools/build_metro.py` → metro45.*. Checks for overlaps, flood-fill reachability of every portal/interactable, portal spawn points that are free, and NPC route clearance (sampled). It fails on any problem. Current result: **0 problems** in all 6 areas. |
| `kit_metro/` | own atlas (`kit_atlas.png`, `kit_emit.png`, `kit_manifest.json/.js` → `window.KIT_METRO_MANIFEST`), 195 frames, 332 KB |
| `art-pack/scene3d/gen_kit45_metro.py` + `build_kit45_metro.sh` | mt_* pieces with the same gen_kit45 setup (camera / sun / palette) and the same `pixelate_kit.py`, skins `old` (井槐里) / `cbd` |
| `shared-rules/rules.json` → `metro` | **keys added only**. Covers the line (3号线 槐江线, #E07F2D), 9 stations, minutes, km, fare bands, hours 06:00–23:00, first/last train, headways, peak windows, crowd by hour, named commuters, security, and the card/token/QR rules. I mirrored it into canonical `../shared-rules/rules.json`, rebuilt with `build.py` (rules.data.js identical in both), and `test_rules.js` passes 29/29. |
| `tools/metro_capture.py` | `python3 tools/metro_capture.py all` saves screenshots M1–M5 (390×844 touch). `shot` mode runs ad-hoc JS for tests. |

## Integration (index.html: 3 script tags, nothing else)
```html
<script src="js/store.js"></script>
<script src="kit_metro/kit_manifest.js"></script>   <!-- NEW -->
<script src="metro45.js"></script>                  <!-- NEW -->
<script src="js/metro.js"></script>                 <!-- NEW: after game.js (auto-installs), before main.js is fine -->
```
I verified this with a copy of index.html plus these 3 tags (/tmp test page, not committed). From the street, `G.use(metro_jhl)` enters the station. I bought a token (Alipay, money moved through `R.spend` plus a payCard), rode to CBD (¥5 deducted, clock +25 min), left to `cbd` with exit B, re-entered through `SP.places.metro_cbd.enter({link:'C'})`, and came back to the street. The core clock scale was restored each time and 李默 was put back at the entrance's reach point (38.3, −12.2).

### What installCore does
* **Init:** automatic. It registers **`SP.places.metro_jhl`** and **`SP.places.metro_cbd`**, which are the existing Stage-5 hooks in game.js:
  * The street entrance trigger **already exists** in scene.js: object `metro_jhl` (`p_metro_entry` at x 41.2, y −12.2, rot 6, `interact:"metro"`, `to:"metro_jhl"`, `reach:[38.3,−12.2]`). game.js `actionFor` now shows `进站 · 井槐里站`, and `G.use` calls `SP.places.metro_jhl.enter(o)`. **No street edit is needed.**
  * The CBD module's exits (`cbd_scene.js` → `exits[]: {to:"metro_cbd", link:"A".."D"}`) should call `SP.places.metro_cbd.enter({link})`. The player enters `cbd_street` at that exit, walks down into the concourse, and comes out next to that letter's escalator.
* **Display:** on first entry it creates a full-screen `<canvas id="metro">` (fixed, z-index 50) above the core canvas. The canvas is hidden again on exit, and the core keeps its scene underneath.
* **Clock:** while you are inside, `SP.clock.scale = 0` and the metro advances `C.min/C.day` itself (walking at `rules.metro.clock_scale` = 0.1 game-min per real second, plus the ride skip). The scale is restored on exit.
* **Money:** `R.spend(G.ps, amount, label, C.abs())` plus `G.payCard(...)`. Card balance, tokens, and the open trip are kept at **`G.ps.metro`**, so they persist with the player state.
* **Input:** a window capture listener forwards keys to the metro and stops them while it is active, so the hidden street player doesn't move. `SP.metroActive` is true while you are inside. If the core has document-level touch handlers, it should ignore them when `SP.metroActive` is true. The metro's own touch events live on its own canvas.
* **Exits** (`onExit` defaults, which you can override with `FushiMetro.installCore(SP, { toStreet(info), toCbd(info) })`):
  * `street` (top of 井槐里 stairs): `SP.place.enter("street")` if needed, then 李默 is placed at `metro_jhl.reach`, facing W.
  * **`cbd`** (top of a CBD exit escalator; `info.exit` = "A"|"B"|"C"|"D"): if `SP.places.cbd.enter` exists, it is called with **`({exit, from:"metro_cbd"})`**. Otherwise, if `SP.scenes.cbd` exists, it calls `G.switchScene("cbd", CBD_SCENE.exits[letter].spawn)`. Otherwise it shows a toast. The letters and names match cbd_scene.js: A 中央公园 · B 云汇天地/臻品街 · C 天枢塔/金融城 · D 云汇体育中心.

### Core worker: 2 small notes
1. Street object `metro_jhl.hours` is `["06:00","23:30"]`, but rules.metro says 06:00–23:00 (last train 22:50). Set it to `["06:00","23:00"]` or read `rules.metro.hours.label`. The metro also refuses entry after hours by itself.
2. The metro reads `SP.clock` (abs/min/day/season) and `G.rules.date()` to tell workdays from weekends (peak, crowd, headway). No other core API is used.

## Gameplay covered (all verified by scripted runs; see `tools/metro_capture.py`)
* **井槐里站 street:** canopy entrance with lit 3号线 sign box and a totem, morning crowd streaming in, and the stairs down (closed after hours).
* **Concourse B1** (older tiles, cool fluorescent light, small signage):
  * **Security:** queue rails, X-ray belt (the bag rides through, about 2.2 s) with an operator, walk-through arch with a guard. Walking through without the bag gives a beep and pushes you back. The exit lane is one-way.
  * **TVMs:** pick a destination, then pay by WeChat/Alipay for a single-journey token at the fare price.
  * **Service counter:** top up the transit card with ¥20/50/100 via WeChat, Alipay or cash.
  * **Fare gates:** menu with **扫码（乘车码）/ 刷单程票 / 刷交通卡**. Flaps open and NPCs use the gates too. The fare by distance (bands ¥3/4/5/6) is settled when the train arrives: the card or QR is charged, and a token that doesn't cover the distance gets topped up from your money. If the card is short, the difference is paid as 补票 from your money. The exit gate swallows the token or shows the trip. Card minimum to enter is ¥3.
* **Island platform B2:** two tracks with PSDs, countdown boards (往 科技园 / 往 槐北新村), waiting crowd at the doors.
  * The train runs approach → dwell (doors and PSDs open, alighting/boarding NPCs) → depart, on a deterministic schedule: headway 3 min at peak, 6 normal, 10 late; west trains are phase-shifted.
  * **互动 at a door** opens the destination menu (only 井槐里 / 中央商务区 are open in this prototype). Then fade, ride panel with the line strip, the clock skips the ride time (井槐里→CBD 25 min), and you arrive on the CBD platform with the train dwelling.
  * **"等下一班车"** fast-forwards to the next arrival.
* **中央商务区站:** big polished-stone concourse, bright, LED ad walls, the same security, TVMs, counter and gates (gate row wider), wayfinding signs A/B/C/D, four exit escalators up to `cbd_street` (exit stub → module `cbd`).
* **Reverse trip:** CBD → 井槐里 works the same way (tested with QR: ¥5).
* **Crowd:** NPC count comes from `rules.metro.crowd.by_hour` × weekend multiplier; heavy at 07–09:30 and 17:30–19:30 on workdays, sparse late. Named commuters (e.g. 小周（程序员） home 井槐里 → work CBD, leaves 08:05, back 19:00) appear at their stations at those times on workdays.
* **Preview keys:** WASD/arrows, E/space 互动, 1–9 menu, Esc, T = +30 min, P = crowd ×2.2, +/- zoom. URL: `?time=08:10&day=2026-10-12&start=cbd&exit=B&money=50&touch=1&crowd=0`.

## Screenshots (390×844 portrait, touch UI)
`screenshots/M1-entrance.png` 井槐里 entrance · `M2-security.png` bag on the X-ray belt · `M3-gates.png` gate payment menu (3 ways) · `M4-platform.png` train in with doors open · `M5-cbd-station.png` CBD concourse.

## Known gaps
* The other 7 stations are data only (shown in menus as 原型未开放).
* No in-train view, by design (fade + ride panel instead).
* No sound.
* NPCs don't use the TVMs or counter (they walk past and use the gates).
* The metro renders its own frames, so the core's weather/rain FX and lighting system are not shared underground (the metro has its own lighting pass). The street-level areas use a fixed daylight/night tint rather than the core's weather.
