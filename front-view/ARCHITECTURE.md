# 浮世万象 · Modular scene architecture (scene-proto)

> The 45° three-quarter-view version of this architecture (2:1 dimetric, iso sort, phone controls) is in `../scene-proto-45/ARCHITECTURE.md`.

Goal: the scene is no longer one painted plate. It is **assembled from kit pieces** (ground chunks, decals,
facade modules, props, actors) that are depth-sorted against 李默, collide by footprint, fade when they hide
him, and change **state** at runtime (fire, broken glass, crash). Everything here runs in the prototype
(`scene-proto/index.html`); the data is engine-agnostic so it can be loaded into Godot later.

## 1. World space, grid, projection

* World units = **metres**: `x` east, `y` north (away from camera), `z` up. Gameplay (movement, collision,
  traffic, events) runs only in world space; pixels are a view concern.
* Fixed camera = the 李默 sprite camera (orthographic, yaw 0°, pitch 27.95°, same sun `(-0.5,-0.62,0.75)`).
  Screen projection (1x pixels, y down):

      sx = 48·x        sy = −(22.5·y + 42.4·z)

  A 2 m ground chunk is exactly **96 × 45 px**; the authoring/snap grid is **0.5 m** (24 × 11.25 px).
  Kit and character share this so a 1.75 m 李默 is ~92 px tall next to a 3 m storey (~127 px).
* Every piece is authored with its origin on the ground plane (z=0) at a documented corner/centre, so placing it
  is `(x, y, rot)` only. Rotation is in **8 steps of 45°** in the format; the kit renders the steps a piece
  needs (cars: 2 = east, 6 = west; most props: 0 only). Facades are always rot 0 (camera-facing).

## 2. Layer model (draw order, back → front)

| # | layer | contents | sorting |
|---|-------|----------|---------|
| 0 | `ground` | 2 m chunks: asphalt a/b, sidewalk, courtyard brick, tree pit | none — baked once into one canvas, together with static decals and `low` pieces |
| 1 | `decal` | lane dashes, edge lines, zebra stripes, stop lines, manholes; runtime decals: glass, scorch, skid marks, triangle | none, insertion order |
| 1b | `low` | curb strips, entrance steps (flat, never over a character) | none |
| 2 | `shadow` | per-frame ground-shadow masks of props/cars (rendered in Blender on a shadow catcher) | none, multiply |
| 3 | `sorted` | walls, pillars, gate leaves, building slices, trees, poles, stall, locker, cars, 李默, particles | **y-sort by sort line** |
| 4 | `overhead` | power wires (catenaries between pole tops) | none |
| 5 | `fx_glow` | additive lights: fire flicker, window glow at night, headlights/hazards | additive |
| 6 | `grade` | day/night tint (multiply on the atlas) + emit atlas at night | — |

**Tall objects are split into parts** that are still drawn at the object's sort line, but can fade separately:
tree = `trunk` + `canopy` (only the canopy fades), pole = shaft + crossarm, stall = cart + awning.
**The building is a grid of facade modules**: one 3 m bay × 3 m storey per module, each a `f_wall` (state
`ground`/`upper`) plus a window module `f_window` (states `intact`, `lit`, `broken`, `boarded`, `scorched`),
door `f_door` (`closed`/`open`), `f_balcony` (with/without laundry), `f_ac`, `f_pipe`, `f_sign` (井槐里12号, CJK
drawn in the pixelate pass), `f_steps`. The demo shows 6 storeys × 8 bays.

## 3. Depth sorting

Each object has a **sort line** in world space (for small props a point = a zero-length line at the footprint
front edge). Drawing order in the `sorted` layer is by the line's front-most world `y` (smaller y = closer =
drawn later), with ties broken by `z_order` then `x`:

* Point objects (李默, tree, pole, locker): `y` of the foot.
* Long objects (courtyard wall, curb, facade): a horizontal sort line along the front face. Because the camera
  has yaw 0, a horizontal line has one `y`, so "is 李默 in front of the wall?" is just `player.y < wall.y`.
* Objects with depth (car, stall) use the **front edge of the footprint** (`y_min` after rotation), not the
  centre, so you walk "behind" a car when your feet are north of its bumper line.
* Large objects that a character can be both in front of and behind are **sliced**: the facade is per-bay
  modules, the front wall per 3 m segment, so a sprite never needs to be half in front of one image.
* Diagonal/rotated long objects (not used in this slice; needed in Godot/iso later): compare the actor to the
  line with a side-of-line test, i.e. sort key = projection of the actor onto the line.

Overlay sprites (fire, soot, glass) take the sort key of their host object + ε. Particles use their own ground
`y` (a falling shard lands in front of the wall).

## 4. Occluder fading

Objects with `fadeable: true` (per piece in the manifest, overridable per instance; parts via `fade_parts`)
fade to **35 % alpha** when they **cover 李默's screen rect and are in front of him**:

1. Cheap reject: only drawables sorted **after** the player (i.e. in front of him) are tested.
2. Screen-rect test: the player's body rect (24 × 76 px above his feet) vs. the frame's screen bbox.
3. Exact test: the manifest stores a coarse **coverage mask per frame (4 px cells)**; at least 3 opaque cells
   must overlap the body rect. This keeps a tree trunk from fading because 李默 stands in the empty
   corner of its bbox.
4. `fade_group`: when one member fades, the whole group fades (the whole courtyard wall + pillars + gate leaves
   = `front_wall`, so it does not fade as a checkerboard of segments).
5. Alpha eases exponentially toward the target (rate 7/s, ~0.3 s), so it reads as a dissolve, not a pop.
   (Not done yet: a silhouette for non-fadeable occluders.)

## 5. Collision

* Colliders come from **footprints in the piece definition** (rects in piece-local metres, rotated by `rot`,
  optional polygons), plus explicit `colliders` in the scene (building mass, neighbouring blocks).
* Footprints can depend on state (`footprint_states`): the gate leaf open vs closed, a crashed car's rotated hull.
* The player is a 0.22 m circle; movement resolves per axis with **sliding** (try full move, else x-only,
  else y-only, with a small sub-step), so walking diagonally into a wall glides along it.
* Cars are dynamic colliders (their rotated rect each frame). Road and crosswalk are walkable; nothing is
  painted into a walk mask.

## 6. Dynamic state system

* Each instance: `state` (one of the piece's `states`, picks the frame), optional `variant` (car colour), and
  a list of **overlays** (`fire`, `smoke`, `soot`, …) with timers. Overlays are FX-layer sprites/emitters bound
  to the host's anchor, not baked frames, so any window/car can burn.
* A frame key is `piece[/variant]/part/state/rot` (e.g. `f_window/main/broken/0`, `p_car/taxi/main/crashed/2`);
  missing combinations fall back to `default`.
* Night: the kit is rendered once plus an **emit atlas** (lit windows, lamp boxes, headlights). Night = atlas ×
  tint + emit × night factor; windows marked `lit` use the `lit` state or emit, so random apartments light up.
* **Scene events** are data: a list of timed actions —
  `set_state`, `overlay` (with duration), `fx` (particle burst), `decal`, `traffic_crash`; each with `after` seconds.
  The runtime does not know what a "fire" is; it is the event `fire` in `scene.json`:
  fire+smoke overlays → glass bursts at 2.5 s (`broken`) → soot overlay → `scorched` state + scorch decal at 12 s.

## 7. Data format

Two files, both JSON (the `.js` twins only wrap the same JSON for `file://`):

**Kit manifest** `kit/kit_manifest.json` (generated by `art-pack/scene3d`):

```jsonc
{ "projection": {"px_per_m_x":48,"px_per_m_y":22.5,"px_per_m_z":42.4,"pitch_deg":27.95,"chunk_m":2,"grid_m":0.5},
  "atlas": "kit_atlas.png", "emit_atlas": "kit_emit.png", "mask_cell": 4,
  "pieces": { "p_tree": {"layer":"sorted","origin":"center","footprint":[[-0.2,-0.2,0.2,0.2]],
                          "parts":["trunk","canopy"],"fade_parts":["canopy"],"states":["default"],"rots":[0]},
              "f_window": {"layer":"sorted","origin":"bay-bottom-left","sort_line":[[0,0],[3,0]],"fadeable":true,
                           "states":["intact","lit","broken","boarded","scorched"]} },
  "frames": { "f_window/main/broken/0": {"x":..,"y":..,"w":..,"h":..,"ax":..,"ay":..,"shadow":"..","mask":".."} } }
```

`ax, ay` = the pixel of the piece origin inside the frame (the anchor), so drawing is
`screen(origin) − (ax, ay)`.

**Scene** `scene.json` (generated by `tools/build_scene.py`, hand-editable):

```jsonc
{ "format":"fushi-scene", "version":1, "units":"m", "grid_m":0.5, "kit":"kit/kit_manifest.json",
  "ground": {"origin":[0,-4],"chunk":2,"legend":{"A":"g_asphalt:a","S":"g_sidewalk","C":"g_court"},
             "data_south_to_north":["SSSS…","AAAA…"]},
  "objects": [ {"id":"gate_l","type":"w_gate_l","x":12.54,"y":12.15,"rot":0,"state":"open",
                "fade_group":"front_wall","interact":"gate"},
               {"id":"parked_car","type":"p_car","x":26,"y":14.6,"rot":2,"state":"normal","variant":"base"} ],
  "colliders": [{"id":"building","rect":[4,18,28,30]}],
  "traffic": {"lanes":[{"id":"eb","y":2,"dir":1,"rot":2,"stop_x":10.7}], "crosswalk":{"x0":12.2,"x1":16.3,"y0":-0.3,"y1":8.3}},
  "events": {"fire":{"key":"2","actions":[{"do":"overlay","target":"win_1F_19","overlay":"fire","duration":14},
                                          {"do":"set_state","target":"win_1F_19","state":"scorched","after":12}]}} }
```

No pixel coordinates in the scene: everything is metres + piece ids, so the same file can be re-projected
(another camera, 2x art, Godot).

## 8. Mapping to Godot 4

| this prototype | Godot 4 |
|---|---|
| `ground` grid of 2 m chunks | `TileMapLayer`, rectangular 96×45 tiles, TileSet built from `g_*` frames |
| `decal` | second `TileMapLayer` (lane marks) + `Sprite2D`s for runtime decals |
| `sorted` layer | `Node2D` with `y_sort_enabled = true`; each object a `Node2D` at `screen(sort point)` with child `Sprite2D` parts offset by `−(ax, ay)` (the y-sort origin is then the sort line) |
| long objects | already sliced per bay/segment → each slice its own node, so stock y-sort works |
| fadeable + masks | script on the player: query objects in front whose `Rect2`/mask hits the body rect, tween `modulate.a` → 0.35 (or a CanvasItem shader uniform) |
| footprints | `StaticBody2D` + `CollisionPolygon2D` with the footprint projected to the ground plane (affine: x·48, y·−22.5), or physics in a separate metre-space layer |
| states / variants | `AnimatedSprite2D`/`AtlasTexture` per frame key, or a `Resource` per piece listing frames by state |
| overlays / FX | `GPUParticles2D` / `AnimatedSprite2D` children toggled by the event runner |
| emit atlas | second texture in a CanvasItem shader (`night` uniform) or additive `Sprite2D` |
| events | same JSON → GDScript `EventRunner` (timers + `set_state`, `overlay`, `fx`, `decal`, `traffic`) |
| traffic | `Path2D`/lanes + simple state machine (same rules) |

An `EditorImportPlugin` (or a Python converter producing `.tscn`) reads `kit_manifest.json` + `scene.json`;
nothing in the data is web-specific.

---
# v3 additions (weather · seasons · interactions · NPCs · mobile)

## 9. Frame loop and renderer (`main.js`, `render.js`)
* **Loop**: `requestAnimationFrame` → accumulate real dt (clamped 0.25 s) → `update(1/60)` k times (fixed step) →
  `render(alpha)` where `alpha = acc/DT` interpolates every moving thing (李默, NPCs, cars: `px/py → x/y`).
  Test hooks: `__proto.step(dt,n)` (n render frames of dt, fixed steps inside), `__proto.sim(s)` (no render),
  `__proto.audit(n)`.
* **Camera**: target = 李默 centred, lifted (`lift` 50 px portrait / ≤120 px landscape) so the facade stays in view;
  exponential smoothing on a float follower, then the *offset* between target and follower is rounded, so the
  camera is always an integer pixel and the player never jitters against the background.
* **Chunks**: the static world is split into 256×256 px screen chunks. Each chunk canvas holds ground tiles + decor
  + ground snow + `low` layer pieces + static shadows + every `bg` object whose sort never changes against actors
  (facades, walls behind the sidewalk line, static props). A chunk has a `key` (season, snow step, wet step,
  states of its bg objects); when the key changes it is marked dirty and re-rendered (visible-urgent first, then
  ≤2 non-visible per frame). Objects classify as `dyn` when they can be in front of an actor, fade, or change often.
* **Per frame**: blit visible chunks → footprint trail canvas (clipped) → dynamic decals, puddles, leaf piles,
  wetness overlay → wet reflections → moving shadows → **y-sorted dynamic list** (world dyn objects, cars,
  particles, 李默, NPCs, laundry; comparator = sort line, then `zo`, then stable `seq`) → air particles (leaves,
  petals) → bubbles → **lightmap** → halos → screen-space rain/snow → fog gradient → HUD.
* **Lightmap**: ½-res canvas filled with the clock's ambient colour, light sprites added with `lighter` (radial
  gradient sprites cached per colour; `flat` lights are 0.47-squashed ground pools), emissive kit frames
  (`kit_emit.png`) stamped where `emitOn(o)`, then multiplied over the frame with nearest upscale. Skipped (single
  multiply fill) when ambient is white and no light is active. Halos (`lighter`) for bulbs/headlights drawn after.
* **Allocation**: particles, light records, drawable records and sort arrays are pooled/reused.

## 10. Clock, weather, seasons (`clock.js`, `scene.json → calendar, weather`)
* `C.min` (0–1440) advances `scale × dt` minutes per real second; `C.day` → season (`days_per_season` = 5),
  weekday, date label. `skipTo(min, 1.6)` fast-forwards smoothly (T key), so lights, repairs, NPCs all transition.
* Weather state: `target`, `weather`, `intensity`; daily roll from `weather.chances[season]`; manual override locks
  the day. Derived continuous fields, eased each step: `wet` (rain raises, dries otherwise), `snow` (accumulates
  with snow intensity, melts over `melt_min[season]` minutes when it stops, 3× faster in rain), `fog`, `dark`, `lampsOn`, `ambient[rgb]` from hour keyframes ×
  season × weather multipliers.
* Snow on objects: Blender "up" pass (world-normal z) → `pixelate_front.py` → 3 cumulative snow atlases; drawn over
  a frame with alpha from `C.snow` using per-frame `snow_rects` sub-rects. Ground snow is baked into chunks per
  step (blobs + tire tracks), footprints go to a persistent trail canvas that fades out over time.
* Season → `W.applySeason()`: tree `variant/state` (spring/base/autumn × full/bare), ground tint, petals/leaves
  emitters, leaf piles.

## 11. Interaction rules, log, repair (`scene.json → interactions`, `world.js`)
```json
"lamp": { "use":  { "ok": {"label":"…"} },
          "kick": { "ok": {"label":"踢坏", "to":"broken", "fx":"glass", "hazard":0.7, "log":"人行道路灯被踢坏…"} },
          "repair": { "broken": {"to":"ok", "hours":6, "log":"…修好了"} } }
```
* Each object with `interact: kind` uses the table by its current state; action fields: `to` (state), `fx`,
  `decal`, `hazard` (radius, NPCs avoid), `toast`, `log`, `special` (bike push/park, hydrant valve, honk, alarm,
  purchase, water). `W.nearest()` picks the target (sort-line distance; gate = opening), `W.actionFor()` gives the
  prompt for E / F.
* `W.updateRules()` runs every game minute: `repair` timers (`brokenAt + hours × repair_hours_scale`), growth
  (watered pot → grown after 1 h), shop opening `hours`, leaf piles re-forming. All changes go through
  `W.setState()` (footprints rebuilt, chunk invalidated) and `W.logEvent()` (day + clock stamp).

## 12. NPC brain and the clipping audit (`actors.js`, `scene.json → npcs`)
* `npcs.graph`: named nodes (metres) + undirected edges; `hidden` nodes are inside buildings; `road` nodes mark the
  crossing. `agents[*].blocks`: `{from, to, act, at | route, unless: ["rain", "snow"]}` (rain > 0.3 / snow > 0.6 → the
  agent stays at its hidden home node instead), `trips` (rider delivery loop).
* Agent step: goal from schedule → Dijkstra path → follow waypoints with arrival radius; at road nodes wait until
  no car is within the time gap; steer: 11 candidate headings (0, ±26° … ±149° with falling speed factors), reject any move that intersects a static
  footprint, car poly, hazard circle, or another actor's foot circle (radius sum + 0.02 m) — the move is only
  committed if free, so overlaps cannot happen, only waiting. Waypoint counts as reached when within 0.9 m and
  occupied (no orbiting). Closed gate on the path → the agent opens it.
* `A.validateRoutes()` sweeps every edge with r = 0.34 against static footprints at load (reported in debug).
* `__proto.audit(n)` runs n fixed steps and counts per step: actor–actor overlaps, actors inside static footprints,
  actors inside cars, plus the longest stuck time. Playtest: 36 × 2400 steps at clock ×4 (~96 game hours) with
  李默 wandering, 3 events, rain/snow/clear, gate toggles → must be 0 / 0 / 0.

## 13. Mobile (`mobile.js`, `index.html`)
* `body.mobile` when touch/coarse pointer (or `?touch=1`); `portrait` / `landscape` classes. Canvas backing store
  = viewport × `devicePixelRatio` / s, with integer s = round(short side × dpr / 400) device px per game px
  (crisp pixels, ~400 game px on the short side); the camera code uses canvas
  size, so both orientations follow 李默.
* `touch-action:none`, `overscroll-behavior:none`, preventDefault on touchmove/gesture events, double-tap guard;
  viewport `user-scalable=no, viewport-fit=cover`, safe-area insets.
* Floating joystick (pointer events in the left zone; knob range 52 px, dead zone 0.16; `SP.touchInput {x,y,m}` analog) →
  `movePlayer`; buttons 互动 / 踢 → `SP.interact('use'|'kick')`; top bar 时间/天气/季节/事件 → same functions as keys;
  event sheet → `SP.button(ev)`. The UI ticks on a 120 ms interval (not rAF) so it never costs frame time.

## 14. Godot 4 mapping of the v3 systems
| web | Godot |
|---|---|
| fixed step + interpolation | `_physics_process` 60 Hz + `Engine.physics_jitter_fix` / manual interpolation |
| chunk canvases | `TileMapLayer` + static `Sprite2D` children under a `CanvasGroup` per chunk (or baked `ViewportTexture`) |
| lightmap | `CanvasModulate` (ambient) + `PointLight2D` with the same radii/colours; emit atlas as `light_mask` sprites |
| snow atlases | second sprite per object with `modulate.a = snow` (or a shader blending 3 textures) |
| clock / weather / rules / interactions JSON | `WorldCore` autoload: same JSON, same state machines (engine-agnostic) |
| NPC brain | `NavigationAgent2D` optional; the graph + schedule state machine ports 1:1 |
| touch UI | `TouchScreenButton` + virtual joystick scene |
