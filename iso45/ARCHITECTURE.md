# 浮世万象 · Modular scene architecture — 45° three-quarter view (scene-proto-45)

This is the straight-on `scene-proto/` design, converted to the camera used by the concept art
(`web-demo/img/bg/ext_day.jpg`): camera yawed 45°, so a building shows **two facades and its roof**. The data
model (metres, piece ids, states, events) is the same. Only the projection and the parts that depend on it changed:
ground tiles, sort keys, fade masks, input mapping and the art.

## 1. Projection: orthographic, yaw 45°, pitch 30° → 2:1 dimetric ("pixel isometric")

World: x = east, y = north, z = up, in metres. Ground grid 0.5 m. Camera looks from the south-west down to the NE.

```
sx =  (x − y) · 32                       px   (screen right)
sy = −((x + y) · 16 + z · 39.19)         px   (screen y grows downward)
```

* The pitch is **30°**, not the "true isometric" 35.26°: at 30°, a 1 m step along x or y moves exactly 32 px across
  and 16 px down. That is the clean **2:1 pixel ratio** pixel artists use, so ground lines are 2-px stair steps with no
  jaggies. True isometric (35.26°) would give 1.63:1 lines, which alias. The concept art is close to 2:1.
* Scale: 45.25 px per metre on the screen-right axis (32·√2). Vertical: 39.19 px per metre (45.25·cos 30°).
  A 1.75 m person is about 69 px tall, and the 6-storey 12号 building is about 700 px.
* Ground cell 0.5 m = a **32×16 px diamond**. Ground chunk 2 m = a 128×64 diamond. The ground is baked once per
  time of day into one canvas made of diamond chunks (`g_asphalt / g_sidewalk / g_court / g_treepit`).
* Sun (world) = (−0.08, −0.72, 0.69). That is the old screen-space key light mirrored to match the concept art
  (light from upper right, shadows fall to the lower left / north-west in world).
* All numbers live in `kit/kit_manifest.json → projection`, and `js/core.js` reads them from there.
  `SP.unproject(sx, sy)` inverts at z = 0, and `SP.screenToWorldDir(dx, dy)` maps screen directions to world
  directions.

**Characters (8 directions).** The 3D characters render with `VIEW_YAW = 45°`, so the 8 facings are the **world**
axes as seen by this camera. World N/E/S/W show up as screen diagonals (N = up-left, E = up-right, S = down-right,
W = down-left). NE/SE/SW/NW show up as screen up/right/down/left. Walking world-north therefore uses the "N" clip,
which looks like walking up-left, and the feet slide in the direction they point.

## 2. Pieces in two orientations

Anything that runs along an axis is rendered at **rot 0** (along x, facing south = screen lower-right) and
**rot 6** (along y, facing west = screen lower-left). This covers wall segments, fences, gate leaves, facade
modules (wall, window in 5 states, door, AC, balcony, sign, pipe, steps) and curbs. Rot 2 and rot 4 would be the
back faces. The camera never sees them on this block, so they are not rendered. The car has 8 directions plus the
crashed variant. Props are rendered at the rotations they are placed at. 35 pieces, 193 frames, one 2048² atlas,
plus an emit atlas for night (lit windows, lamp heads, headlights). The 12号 building is 21 bays: 3 m wide modules
on the S facade (rot 0) and the W facade (rot 6), 6 storeys, plus a roof piece with parapet, water tanks, solar
heater and clutter.

## 3. Depth sorting (iso)

Each drawable (object part, character, car, particle group) gets a **world-space sort box** `[x0,y0,x1,y1,z0,z1]`:

* Kit objects: the *real geometry extent* that `gen_kit45.py` exports per part and state (`geo`), rotated with the
  object, plus the solid **footprint polygons**.
* Characters: their foot circle(s), z 0..1.8 m (2.1 m with the umbrella). The rider + scooter uses 3 circles along
  the heading, and the umbrella widens the circle to 0.55 m.
* Cars: the rotated body rectangle.

Pairwise "A is in front of B" (`W.front`, the same rule order is in `audit.js truth`):

1. **Separated on the ground plane**: if A's box is entirely south of B's (A.y1 ≤ B.y0) or entirely west
   (A.x1 ≤ B.x0), A is nearer. With a 45° camera, "nearer" means smaller x or smaller y, so the old
   y-sort turns into an **x+y sort with box tests**.
2. Modules of **one facade** (same fade group) with overlapping boxes: facade layer order (`z_order`
   wall < window/door < AC/sign/balcony). Without it, stacked bays form cycles.
3. **Height separation**: a box entirely above another (canopy, awning, balcony over a head) is in front.
4. **Prism test** (`SP.prismOrder`): solid vertical prisms (foot circles, convex footprints) are compared on the
   screen-horizontal axis u = x − y. If their u-intervals do not overlap, they can never occlude each other (no
   constraint). Otherwise the one with smaller x + y over the overlap is nearer.
5. Otherwise: no constraint.

The pair relations become a graph over the drawables whose **screen rectangles overlap**, and a **topological sort**
orders it. Ties keep the previous frame's order and then a stable key (depth x + y, then id). That rules out
flicker when two keys are close. The playtest sweeps 李默 and the camera over the whole map (672 positions) and
finds **0 cycles**.

**Long objects are sliced.** Walls are 2 m segments, facades are 3 m bays per storey, curbs are 2 m pieces, and the
building is not a single sprite. No piece is long enough to be both in front of and behind a character.

## 4. Occluder fading

When 李默's body rectangle (screen) overlaps a drawable that is **in front of him by the sort rule above** and the
4-px coverage mask of its frame confirms real pixels over his body, the object (or its whole `fade_group`:
`front_wall`, `b12`, `nb`, …) fades to 35 % alpha. The fade is a smooth transition, not a pop. Trees only fade the
canopy. The trunk stays opaque. With the diagonal camera, the walls that hide you are the ones south and west of
you (screen lower-left and lower-right).

## 5. Collision (world space)

Collision never uses screen space. Characters are circles at the feet (r 0.22 m, umbrella 0.55 m, rider 3 circles).
Obstacles are the footprint polygons of every piece (rotated and translated), extra `colliders` (building blocks),
the scene bounds and the car bodies. A uniform 2 m grid accelerates the queries.

* Movement runs in sub-steps of at most 0.05 m. Each step tries full movement, then slides along x and along y
  (axis-aligned in world, which slides along the diagonal walls on screen), then gives up.
* Actor vs actor: hard separation. A move that would overlap another foot circle is rejected or slid. After every
  frame, spawn and time skip, a depenetration pass pushes overlapping shapes apart (player pushed, NPCs yield).
* NPCs steer locally (they slow down, sidestep and yield). When stuck for more than
  1.2 s, they back off away from the blocker for 0.6–1.4 s, which breaks deadlocks in the 0.94 m corridor
  between the car and the wall.
* **Build-time route validation** (`tools/build_scene.py`): every NPC route segment is sampled every 5 cm against
  all static footprints. The build fails if clearance is below foot radius + 5 cm. The current minimum clearance is
  0.18 m. The playtest re-checks this at runtime.

## 6. Input (screen directions → world vectors)

WASD and arrows are **screen** directions: W = up the screen, D = right, and W+D = up-right, and so on. The vector
(dx, dy) on screen maps to world `wx = dx − dy, wy = −dx − dy`, normalised (`SP.screenToWorldDir`). Holding W walks
straight up the screen (world NE). Holding W+A walks up-left (world N) along the courtyard wall. Facing snaps
to the nearest of the 8 world directions, and the diagonal key combos map exactly onto the world axes, so a
diagonal walk never jitters between two clips.

**Phone** (`js/mobile.js`, ported from `web-demo/js/mobile.js`): a floating analog joystick on the left half.
Its screen direction goes through the same mapping and its magnitude scales speed (35–100 %). Buttons: 互动 (E),
which pulses when the gate is in reach; 时间 (T); 伞 (U); and 破窗 / 起火 / 撞车 / 重置 / 调试. The canvas fills the
screen in portrait and landscape and the camera follows 李默 (in portrait he sits 12 % above centre, clear of the
thumbs). Viewport meta disables zoom, and touchmove, gesture and double-tap are blocked, so the page never scrolls
or zooms. Touch UI appears on touch devices (or with `?touch=1`). The desktop keyboard is unchanged.

## 7. Dynamic state, events, traffic

Unchanged from scene-proto: object `state` swaps frames and footprints (gate open/closed, window
intact/lit/broken/boarded/scorched, car normal/crashed), overlays (fire, smoke, soot), decals, and an event runner
fed from `scene.json → events` (1 broken window, 2 fire, 3 crash). Traffic runs on 4 lanes (EB/WB main road,
NB/SB side road) with these rules:

* Cars stop at the zebra stop line while anyone is on the zebra or about to step on it.
* "Don't block the zebra or the box": a car only crosses if there is room for it beyond.
* The intersection is a claimed box (x-axis priority). A claim is released if the car has to stop.
* Pedestrians only start crossing when every approaching car can still stop. They give up after 25 s if
  traffic is jammed on the zebra.
* A car only stops for someone ahead of its bumper, not beside it.

## 8. Clipping audit (`js/audit.js`, run by `tools/playtest.py`)

The audit simulates 3 hours at 30 Hz: 324 000 steps with all 5 NPCs plus a random-walking 李默. Every step checks
foot-circle overlaps and intrusions into footprints or cars. About every 7th step it re-sorts and checks every
overlapping character/object pair against the geometric truth. About every 140th step it renders an id-buffer of the
real sprite silhouettes and checks pixel ownership (an occluder's pixels must be drawn over the character's where
it is in front). Last run: **0 overlaps, 0 intrusions, 0 sort violations (592 777 pairs), 0 pixel violations
(17.4 M px)**. Pixels where silhouettes overlap but the geometry gives no order (a hand next to a gate leaf) are
reported separately as "ambiguous". They are not counted as errors.

## 9. Data format

Same as scene-proto, plus:

* `kit_manifest.json → projection` (above), and per piece `rots`, `geo[state][part] = [x0,y0,z0,x1,y1,z1]`,
  `z_order`.
* `scene.json → npcs[] = {id, sprite, speed, radius, mode: loop|pingpong, route: [[x,y,("cw_main")]…], clearance_m}`.
* `traffic = {lanes[], crosswalks[], intersection}`.

## 9b. Time, weather, light, interactions (Stage 2, shared with the front-view line)
* `clock.js` is the front-view module unchanged except named times: game minutes, calendar from `scene.json.calendar`,
  weather state machine from `scene.json.weather` (chances per season, wet / snow rise and melt rates), ambient colour
  keyframes. Both lines read the same data, so they show the same day.
* Lighting is no longer a per-time-of-day tinted atlas copy: the frame is drawn untinted, then `env.applyLight`
  multiplies a half-resolution lightmap (ambient + additive light sprites; 2:1 ellipses for ground pools). Emissive
  atlas pixels are painted into a separate layer during the painter pass; a drawable that overlaps an emissive rect
  erases its silhouette from that layer (`destination-out`), so lit windows never shine through a nearer wall or tree.
  The layer is added after the multiply, then small halos.
* Snow: Blender renders an extra world-normal-Z pass; `pixelate_kit.py` turns up-facing pixels into 3 cumulative
  levels (cropped, default state only; other states / recolours reuse it when the frame size matches). Ground snow is a
  periodic-noise pattern filled into the cached ground tiles (asphalt gets less, greyer slush) — the tile key includes
  the snow step, so a step change re-bakes lazily. Footprints / tyre tracks: a 1500-stamp ring buffer.
* Falling leaves / petals are depth-sorted particles released just below the canopy band and outside the trunk box
  (keeps the topological sort acyclic). The laundry line is its own sorted drawable.
* `interact.js` = the front-view rules table (`scene.json.interactions`): use / kick by state, fx, decals, hazards,
  repair / grow after N game hours. 45°-specific: a state change that grows a footprint is refused while someone
  stands there; the pushed shared bike adds its foot circles to 李默 and is excluded from colliders while carried;
  sheltering NPCs (`hidden`) have no shape at all.

## 10. Mapping to Godot 4

| this prototype | Godot 4 |
|---|---|
| projection 2:1 | `TileMapLayer` with **isometric** TileSet, tile 128×64 (2 m) or 32×16 (0.5 m), diamond layout |
| sort graph | Godot's y-sort is a single key, which is not enough for big boxes. Keep the slicing and set `z_index`/order from the same topological sort in a small `@tool`/runtime script, or Y-sort by `x+y` of each slice's nearest corner (works for the sliced kit except rare overlaps) |
| footprints | `StaticBody2D` in a metre-space physics layer (or `CollisionPolygon2D` transformed by the iso matrix `[[32,16],[-32,16]]`) |
| fade | player script: query front-sorted occluders overlapping the body rect, tween `modulate.a` → 0.35 |
| input | `Input.get_vector()` → `Vector2(dx − dy, −dx − dy).normalized()`; touch: `TouchScreenButton` + virtual joystick scene |
| events / traffic / NPCs | same JSON → GDScript runners |
