# 云汇CBD (place `cbd`) — ready for integration

> Leo density / design pass applied (2026-10-10): capped skyline, unique top-15 silhouettes, 云麓花园 compound, larger central lake, atrium mall redesign. Re-capture C1–C7 done.

Standalone preview: `cbd_preview.html` (desktop + phone; `?touch=1`). Smoke + captures: `python3 tools/cbd_capture.py all` (0 JS errors).

## Files (CBD-owned only; no core / store / metro edits)
| file | what |
|---|---|
| `js/cbd.js` | streaming entry + `SP.places.cbd` |
| `js/cbd/*.js` | 10 modules: core, world, traffic, crowd, controls, render, lod_skyline, lighting, compose, lifecycle |
| `cbd_scene.json` / `.js` | generated scene (`window.CBD_SCENE`) |
| `kit_cbd/` | own atlases + `kit_manifest.js` |
| `tools/build_cbd.py` (+ `cbd_raster.py`, `cbd_capture.py`) | builder / captures |
| `shared-rules/rules.json` → key `cbd` only | towers table, metro_exits, schedule, pois (incl. compound) |

## Load order
Core already has: `kit/kit_manifest.js`, `shared-rules/rules.data.js`, `js/actors_data.js`, `js/core.js`, `js/clock.js`, `js/actors.js`.
Add one tag after them:
```html
<script src="js/cbd.js"></script>
```
`SP.cbd.load()` streams `cbd_scene.js`, `kit_cbd/kit_manifest.js`, then `js/cbd/{core,world,traffic,crowd,controls,render,lod_skyline,lighting,compose,lifecycle}.js`, then atlases.

## Lifecycle
```js
await SP.cbd.load();
SP.cbd.attach(canvas);
SP.cbd.enter("B");                 // "A".."D" | {exit:"B", from:"metro_cbd"} | [x,y,dir] | null
SP.cbd.frame(dt);                  // while active
SP.cbd.leave();                    // free caches
```
Hooks: `onExit(exit)` (`exit.link` = A–D → `metro_cbd`), `onToast`, `externalClock`, `ownKeys`.
`SP.cbd.actions` mirrors `SP.actions` so `js/mobile.js` works when the host points `SP.actions/cam/zoomBy/zoomEnd/panBy/player` at `SP.cbd.*`.

### Core glue (core worker owns this block)
```js
SP.cbd.host = { enter(o) {
  SP.cbd.load().then(() => {
    SP.cbd.player = SP.player; SP.cbd.attach(document.getElementById("game"));
    SP.cbd.externalClock = true; SP.cbd.enter(o);
    /* pause street loop; drive SP.cbd.frame(dt); swap mobile hooks to SP.cbd.* */
  });
  return null;
} };
SP.cbd.onExit = (e) => { SP.cbd.leave(); /* restore street */ SP.places.metro_cbd.enter({ link: e.link }); };
```

## Metro exits (agreed with `js/metro.js`)
| id | street name | CBD spawn |
|---|---|---|
| A | 中央公园 | `[128, 137.4, "S"]` |
| B | 云汇天地 / 臻品街 | `[192.4, 138, "W"]` |
| C | 天枢塔 / 金融城 | `[192.4, 202, "W"]` |
| D | 云汇体育中心 | `[138, 198.4, "S"]` |
Each exit: `{to:"metro_cbd", link:"A".."D"}`. Metro → CBD: `SP.places.cbd.enter({exit, from:"metro_cbd"})`.

## Skyline density (Leo caps — `rules.cbd.towers`)
| band | count | notes |
|---|---|---|
| ≥600 m | **1** | 天枢塔 648 m (landmark) |
| 500–600 m | **2** | 鲲鹏 568 · 星澜 532 |
| 400–500 m | **5** | 玉衡 488 · 汇潮 466 · 云帆 442 · 琉璃 418 · 鸿图 402 |
| 300–400 m | **7** | 澜庭…青岚 |
| ≤200 m | **~20** | avg ≈ 150–160 m; sparse outer grid + plaza buffer around the walkable map |
| fabric | few | unnamed 90–140 m, far corners only |

Top **15** each have an **original** silhouette (not copies of real landmarks): twist / sail / twin blades / atrium slot / stacked cylinders / blade lean / twin linked by skybridge / petal oct / deep terraces / diagrid / etc., with distinct facade palettes (`diagrid`, `glass_*`, `dark_glass`, `apt`, …).

Walkable-map anchors (lobbies): 天枢塔 · 鲲鹏 · 星澜 · 汇潮. Other tall towers sit on a **sparse ring** with wide gaps so the skyline is not a packed wall. Max zoom-out frames the full landmark including crown; labels are decluttered (tallest first, no overlap; 天枢 bold gold).

## Content
- **中央公园**: large central lake (shoreline plaza, north pier, east boardwalk, south viewing pier, fountain 07:00–22:30, water shimmer), seasonal trees, paths, benches, joggers / dog walkers by schedule.
- **臻品街**: boutiques / cafés, planters, evening buskers.
- **云汇天地**: modern atrium mall — curved glass curtain + stone podium, glazed roof lantern, west atrium hall (escalators through glass), LED canopy blade, outdoor plaza + LED screen slabs.
- **云汇体育中心**: arena exterior (unchanged bowl + roof ring).
- **云麓花园**: gated wealthy residential compound (南门 · 会所大堂 · 四栋中层玻璃/石材公寓 · 景观庭院 · 地下车库坡道), quiet streets — contrast to the old home block.
- Roads / BRT / taxis / rush-hour crowds as before.

## Screenshots
`screenshots/C1-park.png` · `C2-pedestrian-street.png` · `C3-mall-stadium.png` · `C4-towers-base.png` · `C5-skyline-far.png` (desktop 1280×720) · `C6-night-skyline.png` · `C7-wealthy-compound.png` (phone 390×844 except C5).

## Gaps
- Mall / stadium / lobby / compound interiors: door prompts only.
- No painted pedestrian signal heads (people still wait for green). Taxis don't pick up the player.
- Headless software render ~15–22 ms/frame; verify 60 fps on device.
