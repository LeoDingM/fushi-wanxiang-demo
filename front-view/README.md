# scene-proto — front-view modular scene for 浮世万象 (v4 = Stage 2.1+2.2: home interiors · needs · rent · sleep; on top of v3 weather · seasons · interactions · NPCs · mobile)

Plain JS, runs from `file://`: open `index.html` (desktop or phone). Front view (yaw 0°, pitch 27.95°, 48 px/m),
same camera / sun / pixel ramp as 李默. The 45° line lives in `../scene-proto-45/` (separate worker).

## Controls
| desktop | phone | action |
|---|---|---|
| WASD / arrows | floating joystick (left half, analog) | walk |
| E | 互动 | use the thing in reach (prompt shows what: buy drink, unlock bike, honk, water plant, tidy bin, open gate/door, splash puddle …) |
| F | 踢 | kick / break it (bin, lamp, bike, vending machine, pot, window, poster, parked car alarm, puddle stomp) |
| T · R · Y · N | 时间 · 天气 · 季节 · (事件 sheet) | time fast-forward (smooth 1.6 s skip to next phase) · weather clear→rain→snow→fog · season · next day |
| 1 2 3 4 5 · 0 | 事件 sheet | broken window · fire · car crash · storm · blizzard · reset |
| E at the 12号 door / walk into stairs / doors | 互动 | enter the unit → 1F stairwell → stairs → 2F landing → 2F-02 (fade transition; walk south through the doorway to leave) |
| 1–9 · E · Esc/Q (while a menu is open) | tap an option / 取消 | choose among several actions (stove: noodles / fried greens; bed: sleep / nap / make bed …) |
| L · G | — | event log on/off · debug overlay (`?debug=1`: fps, cpu ms/frame, chunks, lights, NPC states, footprints, sort lines) |

URL params: `season=spring|summer|autumn|winter`, `weather=clear|rain|snow|fog`, `wi=0..1` (intensity),
`time=HH:MM|day|dusk|night`, `day=N`, `scale=N` (clock speed, 1 real s = 1 game min × N), `npcs=0`,
`px=&py=&dir=` (spawn), `scene=stair_1f|stair_2f|room_2f02` (start indoors), `zoom=2`, `touch=1` (force phone UI), `debug=1`, `log=0`, `manual=1&shot=1` (test stepping).

## What's new in v4 (Stage 2, sub-stages 1 + 2)
* **Interiors as modular scenes** (`tools/build_interiors.py` → `interiors.json/.js`): the 12号 unit door is a portal to
  the **1F stairwell** (terrazzo, dado with stuck-on ads, mailboxes, electricity meters, notice board, a parked bike,
  sound-activated light: stamp to light it), the stairs lead to the **2F landing** (neighbour door 2F-01, stair hole
  with railing, meter, plant) and the door to **2F-02 李默's rental** (8 × 4 m: kitchenette with sink + 2-burner stove,
  fridge, wardrobe, single bed, desk + PC + lamp, chair, bookshelf, rug, small table, ceiling lamp; 2 × 2 m tiled
  bathroom NE with toilet, basin, shower). Same rules as the street: footprint collision, depth sort, occluder fading
  (the bathroom partition and the camera-side cut-away wall stubs fade when 李默 is behind them), chunk cache.
  Every scene keeps its own state while you are away (`world.stash`) and the street keeps simulating its clock /
  repairs (a bin knocked over before going upstairs is tidied when you come back hours later).
* **Window with the live world**: interior windows draw the outside procedurally — sky by time of day + weather,
  the block opposite (lit windows at night), the street tree in its season (blossom / dense green / orange / bare +
  snow caps), rain streaks / snowflakes / fog, a glass glint; daylight patch on the floor by day.
* **Interior lighting**: dimmed outdoor ambient + real lamps (ceiling lamp switch, desk lamp + PC screen glow, stove
  flame, open-fridge light, stairwell lights that switch on when you stamp and go off by themselves).
* **Daily needs, money, rent, sleep** — rules live in `../shared-rules/` (engine-agnostic JSON + pure functions; API in
  `../shared-rules/README.md`), bridged by `js/game.js`. Needs 饱腹 / 精力 / 清洁 / 心情 decay per game hour; HUD bars +
  money + "房租 N天M小时后". Actions with real durations fast-forward the clock while 李默 is busy: cook noodles with egg /
  stir-fried greens (consumes fridge items, the table shows the meal, clear it after), snack / drink from the fridge,
  shower (hidden in the cubicle, water runs), wash, toilet, change clothes, browse on the PC, read, look out of the
  window, sleep (21:00–06:00, wakes 07:00, screen darkens, bed left messy → make it) or nap when tired; buy breakfast
  at the stall (only while 王阿姨 is cooking) and drinks at the vending machine (both cost money now). Rent ¥450 is
  taken every Sunday 20:00 if the money is there, otherwise it is owed (mood hit, "欠租" in the HUD). Conditions:
  starving / smelly / tired (walks slower) / soaked in rain without umbrella / owing rent.
* **Facade variety + weathering** (shared ask with the 45° line): seeded per-module looks — brick bays with water/rust
  streaks or a plaster patch, windows with three different curtain sets, laundry and things kept on the security
  cage, flower pots, thin drip streaks under some sills, AC units with rust runs and condensate pipes; parked bikes
  now face 6 different ways; warmer late-afternoon light (14:30–17:30 ambient keys).
* Small fixes: no duplicate date on the phone (top bar only), weekday follows the day counter (rent is weekly).

## What's new in v3
* **60 fps renderer** (`js/render.js`, `main.js`): rAF + fixed 60 Hz simulation with render interpolation; static
  world (ground, decals, facades, static props, baked static shadows) cached in 256² chunk canvases that are only
  re-rendered when something in them changes (state swap, snow level step, season); only dynamic sprites are
  y-sorted per frame; pooled particles / light records / drawables (no per-frame allocation in the hot path);
  integer-pixel camera with exponentially smoothed follow (no sub-pixel shimmer); lightmap at ½ res, nearest upscale.
  Walk frames animate by distance (~12–16 fps cadence), movement + camera at display rate.
* **Clock / calendar / weather / seasons** (`js/clock.js`): in-game date (5 days per season, weekday), smooth ambient
  keyframes dawn→day→dusk→night, weather rolled per day from season chances (winter → snow likely), manual override.
  - *Rain*: screen-space streaks + ground splashes, road/sidewalk darken with wetness that builds and dries,
    puddles (interactable), lamp/window/headlight reflections on the wet ground, rainy tint, umbrellas for 李默
    (web-demo umbrella set) and NPCs (rider keeps the raincoat).
  - *Snow*: flakes, accumulation that ramps up over time on ground + roofs/walls/tops/cars/trees (3 snow atlases from
    a Blender "up" normal pass, cross-faded), slush tire tracks on the road, footprints / bike tracks stamped
    behind every character that slowly fill back in, breath puffs in the cold.
  - *Fog*: depth-graded haze; *lighting*: darkness layer + real light sources (street lamps, pole lamps, lit windows,
    shop, vending machine, stall bulb when the vendor cooks, locker, car head/tail lights + beams, fire, hazard
    blinkers) — works in every weather.
  - *Seasons*: Blender tree variants spring (fresh green + blossom), summer (dense dark green), autumn (国槐/法桐
    yellow-orange), winter (bare branches with twigs); falling petals / leaves, leaf piles on the sidewalk that
    scatter when walked through, seasonal ground tint.
* **Interactive / destructible / stateful elements** (all data-driven in `scene.json → interactions`):
  street lamps (on by clock, kick → broken flicker), trash bins (knock over → litter decal; tidy), shared bikes
  (unlock + push + park anywhere free; knock over), vending machine (buy; kick → broken/暂停服务), shop shutter
  (open 07:00–22:00), puddles (splash), potted plants (water → grows after 1 h; break), ground-floor windows
  (smash → glass + hazard → boarded after 2 h → glazed after 10 h), fire hydrant (valve; crash → water column),
  parked car (honk, alarm), posters on the wall (tear → replaced next day), laundry on lines swaying with wind,
  gate + unit door, plus the old events (broken window, fire→scorch, crash) and new storm / blizzard.
  **Event log** (bottom-left, `L`) records every action, event, weather change and repair; **repair-over-time**
  rules (`repair: {to, hours}`) restore the world.
* **5 schedule-driven NPCs** (王阿姨/vendor, 大爷/uncle, 上班族/office, 学生/student, 骑手/rider) with their
  front-view 3D sprite sheets; node-graph routes (Dijkstra), timed acts (cook / chat / wait / deliver), weather rules
  (umbrellas in rain, 大爷 stays home in rain, student stays home in heavy snow), avoid broken-glass hazards,
  wait for cars at the road, open the gate if someone closed it, '!' reaction + look when something breaks nearby,
  cars stop / honk for anyone on the zebra or in the lane.
* **Zero clipping**: foot circles with separation + steering for all actors, footprint collision against static
  objects / cars / hazards, stable sort tie-break (per-entity seq), route validation at load, and a clipping audit
  in the playtest (≈96 in-game hours, every 1/60 s step, with events, weather and gate toggles).
* **Phone support** (`js/mobile.js`, ported from web-demo): viewport meta, no scroll / pinch / double-tap zoom,
  floating joystick, 互动 + 踢 buttons, top bar 时间/天气/季节/事件 + event sheet, portrait and landscape layouts
  (canvas = viewport × DPR, crisp pixels, camera follow), desktop keyboard UI unchanged.

## Measured performance (headless Chrome, software raster, `tools/fpsprobe.py`, 李默 walking so the camera scrolls)
| scene | fps | JS+raster ms/frame p50 / p95 / max |
|---|---|---|
| desktop 1280×720 · summer noon | 60.0 (0 frames > 20 ms) | 2.2 / 3.3 / 7.6 |
| desktop · rain night (lightmap, reflections) | 60.0 | 5.2 / 6.2 / 7.5 |
| desktop · heavy snow, winter | 60.0 | 5.0 / 7.9 / 10.0 |
| desktop · autumn dusk fog | 60.0 | 6.7 / 8.4 / 10.2 |
| phone 390×844, CPU ×4 throttle · day | 60.0 | 3.6 / 5.3 / 7.4 |
| phone 844×390, CPU ×4 · day | 60.0 | 4.0 / 6.2 / 12.6 |
| phone 390×844, CPU ×4 · rain night | 60.0 | 8.5 / 11.0 / 13.3 |
| phone 844×390, CPU ×4 · rain night | 60.0 | 8.8 / 11.9 / 14.5 |
No full-screen CSS/canvas filters are used (lighting = one ½-res multiply + additive halos).

## Files
* `ARCHITECTURE.md` — projection, layers, sorting, fading, collision, state system, data formats, v3 renderer,
  clock/weather, interaction rules, NPC brain, audit, mobile, Godot 4 mapping.
* `scene.json` (+ `scene.js` for file://) — v3 slice: 306 objects, puddles, leaf piles, laundry, calendar + weather
  chances, `interactions` (use/kick/repair per state), NPC graph + 5 agents, 5 events. Generated by `tools/build_scene.py`.
* `kit/` — atlas 2048² (195 frames), emit atlas, 3 snow atlases, manifest (incl. snow rects). Built by
  `art-pack/scene3d/build_kit.sh` (`gen_kit.py` Blender → `pixelate_front.py`, `fx_gen_front.py`).
* `img/sheets/` — 李默 (walk/idle/umbrella) + 5 NPC sprite sheets (`tools/import_sprites.py`).
* `js/` — `core.js` projection/atlas/masks/light sprites · `clock.js` time/weather/season · `world.js` objects,
  states, footprints, chunk ground, sorting, fading, interactions, rules, events, log · `actors.js` 李默 + NPC agents,
  steering, ground effects, audit · `traffic.js` · `fx.js` particles + weather · `render.js` chunks, lightmap,
  frame composition · `mobile.js` touch UI · `main.js` loop, input, camera, HUD, debug, test hooks.
* `interiors.json` (+ `interiors.js`) — `stair_1f`, `stair_2f`, `room_2f02` (objects, colliders, portals, camera fit). Generated by `tools/build_interiors.py`.
* `js/game.js` — gameplay bridge: rules state, action menus, timed activities, scene transitions / portals, auto lights, needs HUD.
* `../shared-rules/` — rules.json / rules.js / tests (shared with the 45° line).
* `tools/playtest.py` — **123 checks, last run 123/123 PASS** (v3's 91 + 32 Stage-2 checks: transitions both ways, room collision / sorting / fading, lamp switch, window view by time / weather / season, street state persists while inside, needs decay, cooking, shower, sleep, nap / make bed, tired speed, rent paid / owed, shop costs, action menu, interior clipping audit).
* Previous: `tools/playtest.py` — **91 checks, last run 91/91 PASS** (collision, sorting, fading, traffic, events, every
  interaction + repair timings, log, lighting, rain/snow/fog, seasons, calendar, URL params, NPC schedule + weather
  reactions, route validation, clipping audit, mobile portrait/landscape with emulated touch, no JS errors).
* `tools/capture.py` — deterministic captures → `screenshots/80–89`; `tools/fpsprobe.py`, `tools/profile.py`,
  `tools/smoke.py`. Every tool starts its own Chrome on a free DevTools port with a private profile.

Screenshots: `80-spring.png`, `81-summer.png`, `82-autumn.png`, `83-winter-snow.png`, `84-rain-night.png`,
`85-interactions.gif` (+`.mp4`, 63 s @30 fps; GIF = first 30 s, 20 fps, cropped), `86-destruction-repair.gif`
(+`.mp4`, 25 fps; time-lapse repair), `87-walk-60fps.mp4` (60 fps), `88-debug-fps.png`, `89-mobile-portrait.png`,
`89-mobile-landscape.png`. Older v2 shots `50–57` kept for comparison.

Stage 2.1+2.2 captures: `90-room-day.png`, `91-room-night-lamp.png`, `92-room-rain-window.png` (autumn dusk rain through the
window), `93-stair-1f.png`, `94-stair-2f-night.png`, `95-street-facade-variety.png`, phone portrait `96-phone-room.png`,
`96-phone-stair-1f.png`, `96-phone-stair-2f.png`, `96-phone-action-menu.png`, and `97-home-routine.mp4` (30 fps, ~50 s:
street → door → stairs → 2F → room → lamp → cook → clear table → PC → sleep → morning → shower → out).

## Honest quality notes (v4)
* Interiors are 8 × 4 m single-depth rooms seen from the front with the camera-side wall cut away; the 2F-02 room is
  readable but furniture is small at 1× on a phone, so phone portrait uses ×2 zoom indoors and pans with 李默.
* 李默 has no cooking / sleeping / showering animations: he is hidden (bed / shower) or stands idle while a progress
  bar runs and the object changes state (stove flame, meal on the table, running shower, PC on).
* The window view is a procedural painting, not the real street rendered from the inside.
* Needs balance is first-pass (a sensible routine keeps everything above ~30 for a week; tested in `test_rules.js`).
* No job yet, so money only goes down (rent + food) — the convenience-store shift arrives in sub-stage 3.
* Bike riding animation: still pushing only (no riding sprite exists for 李默).

## Honest quality notes (v3)
* Lighting is a 2D lightmap (multiply + additive halos), not relit renders: night reads well, but light pools on
  the ground are soft blobs and headlight beams are modest; no shadows from lamps.
* Snow accumulation on objects is a 3-step cross-fade of pre-rendered "up"-facing overlays — convincing on roofs,
  wall tops, cars and trees, but the snow does not pile up with depth; road snow is procedural blobs + tire tracks.
* Rain reflections are vertical streak sprites under lights, not true mirrored reflections.
* Leaf piles / petals / litter are small procedural sprites; autumn piles are subtle at 1×.
* NPC animation is walk/idle only (cook/chat are idle poses + bubbles); NPCs never interact with objects except the gate.
* (fixed in v4: parked bikes face 6 ways) 李默 pushes the bike (no riding sprite).
* The street is still one 28 m slice; facades repeat 5 module types.

## Earlier assessment of the look (v2, still valid for surfaces) (vs. concept art `web-demo/img/bg/ext_day.jpg`)
**Where it matches:** the same block vocabulary (red-brick 6-storey slab, 井槐里12号 sign, barred windows, AC units,
laundry balconies, low brick wall + gate, locker, stall, poles + wires, trees, zebra), colours sampled from the
plate, and — most important — it is *exactly* consistent with 李默: same camera, scale, sun and pixel ramp, so he
finally stands *in* the scene instead of on top of a painting. It's crisp, readable, and every piece re-renders in
seconds with any state.

**Where it falls short (it is clearly below the concept art):**
1. **Camera.** The concept plate is a *diagonal* (yaw ≈ 45°, steeper pitch) view showing two facades + roof
   (solar heater, roof clutter), which gives most of its depth and charm. The kit uses 李默's camera (yaw 0°,
   frontal) → one flat facade, the scene reads more like a side-on "Stardew/Pokémon" street. This is a decision
   to make, not a bug: the whole web-demo already mixes a diagonal plate with a frontal-camera character.
2. **Surface richness.** Procedural brick/asphalt + a 4-tone ramp = clean and uniform. Missing: grime, water
   streaks under AC units, rust, patched plaster, faded paint, posters, potted plants, cables, varied curtains.
   48 bays use 5 module types → visible repetition.
3. **Lighting.** Hard sun + flat ramp, no AO / bounce / golden-hour falloff. The concept's warmth comes mostly
   from that. Our dusk/night are global tints + emit, not relit renders.
4. **Organic/complex shapes.** Trees are icosphere clusters (blobby), cars are boxy low-poly sedans, the stall is
   simple. The character is far more detailed than the props.
5. **FX** are procedural pixel particles — fine for a prototype, not shippable as is.

**Recommendation to close the gap (keeps the system, upgrades the pixels):**
1. *Decide the camera first.* If the diagonal view of the concept is the target, render kit **and** 李默 at yaw 45°
   (both are Blender, one parameter). The engine is unchanged except projection (`sx=(x−y)·k`) and diagonal
   sort lines (side-of-line test, already specified in ARCHITECTURE §3).
2. *AI-painted tileable texture sets projected on the kit* (brick with grime variants, plaster, asphalt with
   patches, window interiors/curtains ×10, roof clutter) → same Blender render + pixelate pass. Keeps
   geometry/consistency/states, adds painterly richness. Cheapest high-impact step.
3. *Per-module AI img2img / inpainting* guided by our own passes (we already output id, depth, clay → ControlNet
   depth/lineart/segmentation), low denoise, then palette-quantize. Mask module borders so tiles stay seamless;
   for state variants inpaint only the changed region (broken glass, soot) on top of the approved base so states
   stay pixel-identical elsewhere.
4. *Decal library* (stains, rust streaks, posters, cracks, puddles, leaves) as overlays — variety without new modules.
5. Render AO + one bounce in the clay pass and do dusk/night as real re-renders (2 more light rigs), keep tint
   only for transitions.
6. Hand-paint or AI-paint hero props (stall, sign, door, car) at higher detail; replace icosphere trees with
   card-based foliage.

## Migration plan
**→ web-demo (exterior scene):**
1. Copy `kit/` and `js/{core,world,traffic,fx}.js` into web-demo behind a flag (`?scene=modular`), keep the plate as
   fallback. 2. Switch web-demo's walk mask + hotspots to scene objects (`interact` field: stall, locker, gate,
   door → existing UI/actions). 3. NPCs (摊主/大爷/骑手) become sorted actors with foot sort points; rain = FX
   layer + wet-asphalt ground variant (one more kit render). 4. Drive the tint from web-demo's timeofday keys;
   night windows from the emit atlas. 5. Port playtest checks into web-demo's playtest. 6. Interiors (2F-02)
   keep their plate until an interior kit exists (same pipeline, different camera distance).
   Note: web-demo's sprites are 2x (144×204); the proto uses 1x + integer zoom. Use zoom=2 there.
**→ Godot 4:** importer (EditorImportPlugin or a Python → `.tscn` converter) that reads `kit_manifest.json` +
`scene.json`: ground/decals → `TileMapLayer` (96×45 tiles), sorted objects → `Node2D` children of a
`y_sort_enabled` root with sprite offset = −anchor, footprints → `StaticBody2D/CollisionPolygon2D` (projected
ground plane), fade → player script tweening `modulate.a` using the same masks, states → `AtlasTexture` per frame
key, events → GDScript runner with the same action names, glows/emit → CanvasItem shader. Mapping table in
ARCHITECTURE §8.

## Known limits
Interiors: home only (store in 2.3); one street slice (streaming in 2.4); props mostly rot 0; traffic has no lane changes; the GIFs are large
because the camera scrolls (use the MP4s).
