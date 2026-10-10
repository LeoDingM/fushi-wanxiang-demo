# 24便利店 (store_24) — ready for core integration

Everything is in **separate files**. No core file was edited (main.js, layers.js, place.js, game.js, world.js, env.js,
build_interiors.py, kit_int/, roomlayout.py all untouched). Standalone test page: `store_preview.html` (desktop + phone).

## Files
| file | what |
|---|---|
| `tools/layouts/store_24.json` | layout data (room-layout system format: bounds, ground, walls + openings, furniture slots, portals, spawn) + store NPC schedule data |
| `tools/build_store.py` | `python3 tools/build_store.py` → `store45.json` + `store45.js` (`window.STORE45.store_24`). Uses `roomlayout.build/validate` (overlap / walls / door swing / flood-fill reachability) + extra checks: the counter's second (staff-lane) approach spot, NPC routes sampled every 5 cm (min clearance 0.38 m). Fails on any problem. Current: **0 problems**, 20 checks. |
| `art-pack/scene3d/gen_kit45_store.py` + `build_kit45_store.sh` | the st_* pieces. Runs gen_kit45.py's setup (same camera / sun / shaders / `kit_materials.json` palette) and its render loop, then the same `pixelate_kit.py`. Output goes to `kit_store/` (`kit_atlas.png` 2048×225, `kit_emit.png`, `kit_manifest.json/.js` → `window.KIT_STORE_MANIFEST`). The full rebuild takes about 3 s. |
| `js/store_kit.js` | merges the st_* frames, pieces, masks and emit into `KIT_INT_MANIFEST`, with y shifted below the interior atlas. `STORE_KIT.compose(SP)` then stacks `kit_store/kit_atlas.png` and `kit_emit.png` under the int atlases, so the existing f[6]=1 path draws them. |
| `js/store.js` | `FushiStore.create(R)` (engine-free store rules, also used by node tests) + `SP.store` browser glue (auto-installs) |
| `tools/test_store.js` | `node tools/test_store.js`: **12/12 PASS** |
| `tools/capture_store.py` | screenshots S1 / S2 / S3 (+ S3b), 390×844 touch |
| `shared-rules/rules.json` | keys added only (canonical `../shared-rules` edited, then `build.py` and a copy here; md5 identical; `test_rules.js` 29/29) |

### Kit pieces (kit_store, prefix `st_`)
st_shelf (full/low) · st_fridge (3-door glass drinks fridge, lit, full/low) · st_counter (POS, customer display, scanner, WeChat+Alipay QR stand, impulse rack; default/goods; rot 0/6) · st_backshelf (cigarettes/liquor) · st_oden (full/low, rot 0/6) · st_coffee (idle/brewing) · st_micro (off/on) · st_bar (window bar, default/bento) · st_stool · st_bins (其他垃圾/可回收 + mop, clean/messy, rot 0/6) · **polish:** st_front13 / st_front145 (glass storefront bays: kick plate, aluminium mullions, empty panes tinted by `PL.drawGlass` via `piece.glass`, lit green sign-box band on top; state `glass`) · st_frontdoor (automatic sliding door, `glass` closed / `open`) · st_locker (3-door staff lockers, closed/open with the green uniform hanging) · st_board (排班表 + punch clock, default/mine).
Walls / staff door / floor tiles reuse kit_int: i_wall `tile`, i_door, g_tile, d_mat.
The st_* pieces **supersede the older kit_int s_gondola / s_cooler / s_counter / s_oden / s_micro / s_bar / s_barstool**. The core can drop those from `build_kit45_int.sh` whenever it likes; nothing in the store uses them.

## Integration (index.html: 4 script tags, nothing else)
```html
<script src="kit_int/kit_manifest.js"></script>
<script src="kit_store/kit_manifest.js"></script>   <!-- NEW -->
<script src="js/store_kit.js"></script>             <!-- NEW: must be after kit_int + kit_store manifests, BEFORE js/core.js -->
...
<script src="interiors45.js"></script>
<script src="store45.js"></script>                  <!-- NEW: scene data (window.STORE45) -->
...
<script src="js/game.js"></script>
<script src="js/store.js"></script>                 <!-- NEW: after game.js, BEFORE main.js -->
```
* **Init:** automatic. When `js/store.js` loads it calls `SP.store.install()` (it needs SP.game + SP.world). Calling it again does nothing. Install does the following:
  * registers `SP.scenes.store_24`.
  * wraps `SP.load`. After the core assets load, `STORE_KIT.compose(SP)` stacks the atlas. **Atlas load = automatic** (adds two images, about 30 KB).
  * wraps `SP.game.actionFor / use / pick / update / flags`. Store interact kinds are `store_*`, and the hook adds the `bar_meal` flag for the existing `eat_bar` action.
  * wraps `SP.env.lights / ambient`, only while `W.sceneId === "store_24"`: 6 cool-white LED panels `[228,240,255]`, fridge glow, warm microwave and oden glints, bright ambient day and night.
  * adds a `#storehud` DOM panel (shift timer + task list, basket, bag, next booked shift).
* **Door trigger:** the street door `scene.json → shop24_S1F_1_shop` (state door, interact `shop`) now offers **「进 24便利店」**. It runs `G.go({to:"store_24", spawn:[4.5,1.0,"N"]})`. Exit = portal `exit_street` (the gap in the south front, dir S) → street spawn `[37.0, 3.55, "S"]` outside the door bay. If the core would rather own the trigger, remove the `STREET_DOOR_ID` branch at the top of `G.actionFor/G.use` in store.js and call `SP.store.enter()` (or `G.go({to:"store_24", spawn: SP.scenes.store_24.spawn})`).
* **If the core grows a 3rd atlas slot** (f[6] = 2): drop compose() and load `kit_store/kit_atlas.png` as its own image. The manifest merge in store_kit.js is the only place that would change.
* **Explicit API**, for core menus or tests: `SP.store.enter()`, `SP.store.inStore()`, `SP.store.F` (rules: `pick/checkout/buyHot/heat/eat/edible/apply/slots/book/clockIn/clockOut/doTask/openTasks/shiftText/price/goods`), `SP.store.clockIn() / clockOut()`, `SP.store.devShift()` (dev: hire + book + clock into the open or next shift), `SP.store.hud()`, `SP.store.npcs`.
* The NPCs live in `SP.actors.list` only while you are in store_24 (the street list is restored by place.js as usual), and they use `SP.actors.move` (collision-safe).

## Polish round (uniforms · storefront · bar stool · 员工室) — extra integration steps
**1 extra script tag** (actor sheets), right after actors_data.js:
```html
<script src="js/actors_data.js"></script>
<script src="js/actors_store.js"></script>          <!-- NEW: Object.assign(window.ACTORS, {clerk_zhao, clerk_zhou, li_mo_uniform, li_mo_bar}) -->
```
* Sheets (NEW files, same format as actors_data.js): `img/actors/clerk_zhao.png` (赵姐 店长: white top + green 店服 apron), `img/actors/clerk_zhou.png` (小周 夜班), `img/actors/li_mo_uniform.png` (李默 on shift) — 8 dirs, idle 4 + walk 12, from the Blender character pipeline (`art-pack/sprites3d/{clerk_zhao,clerk_zhou,li_mo_uniform}.json` = the vendor / student / li_mo rigs with `outfit.apron` in store green #2e8a4c; `./build45.sh <cfg>`), packed by `python3 tools/pack_store_actors.py` (does not touch actors_data.js). Plus `img/actors/li_mo_bar.png`: the li_mo_home *eat* pose facing S/SW/SE (li_mo_home only has eat_N, so sitting at the window bar used to draw nothing).
* Loading: since main.js builds its asset list from `window.ACTORS`, the tag above is enough (≈330 KB total). To keep them lazy instead, load actors_store.js after boot. store.js calls `SP.ensureActor()` before it uses a sheet, and it falls back to the old sprite (`sprite_fallback`: vendor / student / li_mo) when a sheet is missing. So skipping the tag doesn't break anything.
* Who wears what: store staff NPCs use `store_24.json → npcs.staff[].sprite` (clerk_zhao / clerk_zhou). The player gets `SP.player.set = "li_mo_uniform"` while `ps.store.uniform` is on **and** he is in store_24 or the back room. On the street he goes back to his own `set` (stored as `player.baseSet`). Clocking in switches the uniform on, and the locker switches it on/off (you can't take it off mid-shift). store.js sets `player.set` each tick from its update hook. If the core also swaps `player.set` (e.g. other outfits), tell me and I'll use a hook instead.
* **Storefront:** `tools/build_store.py` swaps the S-side `i_cut` stubs for 5 glass bays + the door (`store_24.json → storefront`). The wall colliders are unchanged and the pieces have no footprint. All 6 share `fade_group: "storefront"`, so the whole front fades together (world.js fade) when it hides the player. The door object `front_door` is set to `open` by store.js while anyone is within ~1 m of the entrance. Nothing is needed from the core.
* **Bar stool:** while seated, the eat pose is lifted `player.z = 0.33` (seat 0.78 m vs the 0.45 m chair the clip was made for; feet land on the footrest ring) and uses li_mo_bar facing the window. It resets when the activity ends. Posed store activities now hold ≥2.4 s, like the core's posed ones.
* **员工室 back room:** new scene `SP.scenes.store_24_staff` (`tools/layouts/store_24_staff.json`, same room-layout system, validated: 0 problems), registered by store.js from `window.STORE45.store_24_staff`. Staff door (E wall) with a job → `G.go` into the back room (door swings). Without a job → 「员工通道 · 闲人免进」. Inside: lockers `store_locker` (换上店服 / 换回便服, 3 min, door open while changing), schedule board `store_board` (booked shifts, 排班…, 上班打卡 → walks you out to the counter staff spot, 下班打卡; the board shows your shift circled when booked), portal `exit_store` (W gap) → store `[7.4, 5.4, "W"]`. Same LED lighting. No door trigger needed from the core.
* Re-run: `python3 tools/build_store.py` (both layouts) · `node tools/test_store.js` (13/13) · `python3 tools/capture_store2.py` (S4 / S4b / S5 / S5b / S5c).

## What it does
* **Buying:** the fridge and shelves put goods in a basket (max 8). At the counter you pay with 「结账」 → 微信支付 / 支付宝. The scan animation sets the counter to `goods`, the pay card comes from the existing `G.payCard`, and the cashier shows a 「滴」 bubble. Prices come from `rules.prices`: existing keys bento ¥15, buy_oden ¥8, drink ¥4, milk ¥5, bread ¥6, bun ¥2, buy_coffee ¥9, cigs ¥20, plus a new price group for cola, water, yogurt, onigiri, sandwich, cup noodle, ice cream, tea egg and latte. Inventory goods (bento, drink, milk, bread, cigs) go to `ps.items`, so the home fridge actions keep working. Everything else goes to `ps.store.bag`.
* **Hot food:** 关东煮 at the pot (existing `buy_oden`). Coffee is paid at the machine (existing `buy_coffee`, latte is store-only). The microwave runs the existing `heat_bento_store` → hot bento. At the window bar (a free stool is needed; you sit facing the street with the `eat` clip) you eat with the existing `eat_bar`, or eat bag goods. A cold bento gives ×0.8 hunger and −2 mood.
* **NPCs:** staff on schedule: 赵姐（店长） 07–23 (vendor sprite), 小周 night clerk 23–07 (student sprite). The staff stand behind the counter, step back to the floor while you work, and greet you when you walk in. Three shoppers (office / student / uncle) have hour windows and visit intervals. They walk the validated routes, browse (dwell), pay at the counter and leave.
* **Shift job:** uses the existing `rules.jobs.store_clerk` and `R.job`. At the counter: 应聘店员 → 找店长排班 (排班 slots) → 上班打卡 inside the check-in window. The staff door also clocks you in. On clock-in you are moved to the staff lane. Tasks from R.job's seeded loop, done in the store:
  * **收银:** a customer walks up and waits; scan from behind the counter.
  * **补货:** the named shelf or fridge switches to `low`.
  * **拖地:** the bins switch to `messy`.
  * **加关东煮:** the pot switches to `low`.
  
  Quality is 1.0 within half the deadline and 0.7 after that. Missed tasks fail, and a waiting customer leaves. 下班打卡 before the end = 早退 (pay ×0.5, no bonus). Lateness = (late − 10 min grace) × ¥0.5. A booked shift you never clock into = 旷工 (strike, mood −6); 3 strikes → fired. Wage = `prices.wage_per_h` (¥15/h), paid by the core's existing `shift_paid` WeChat card. `rules.store._wage_note` (Chinese) says real tier-1 part-time minimums are about ¥24–28/h.

## Known gaps / notes for the core
* **Core bug seen during testing:** at 19:03 `scene.js` had 2 street wires anchored to `pole_e3`, which no longer exists. `main.js anchorPt → W.piece(undefined)` throws on the first frame and the rAF loop dies, so index.html shows a frozen street. store_preview.html filters those wires (preview-only guard); the core should fix the data.
* No staff-uniform sprite: the staff reuse the vendor and student sprites, and 李默 doesn't change into a uniform. A `clerk` sprite from sprites3d would fix both.
* The bar seat uses the home `eat` clip, which was made for a 0.46 m stool, so on the 0.78 m bar stool he sits a bit low.
* There is no glazing on the south front: the cut-away stubs stand in for the shop window. The staff room is a closed door with no interior.
* Shoppers are simple waypoint walkers (no steering / backoff). If you block a route they wait, and after 4 s they skip a waypoint.
* `R.job` has a single job id (`store_clerk`), so this store and any other job share one employment.

## Store-D deepen (shift loop · props · night light · wage slip) — 2026-10-10

Self-contained deepen of the clerk job. **Only store-owned files touched** (`js/store.js`, tests/capture under `tools/`, this doc, `screenshots/store-d*`). No stage*/charB/env.js/index.html edits.

### What shipped
1. **Clearer shift loop (HUD phases)**  
   `F.phase(ps, abs)` drives Chinese steps: ①应聘/排班/打卡 → ②当班任务（补货/收银/拖地） → ③下班打卡领工资条. `#storehud` shows the current step + next hint while on shift.
2. **Wage slip in bag / bank**  
   `F.clockOut` / auto `shift_paid` → `F.makeWageSlip` → `ps.store.slips[]` + `ps.store.bag.wage_slip` + `ps.store.bank[]` ledger. Toast「📄 工资条 · 实发 ¥N（已入账）」. Idempotent on `(at, pay)` so clockOut + log replay never doubles.
3. **≥2 interactive props with visible state**  
   - Shelf / cooler: open `restock` → piece state `low`（空货架）→ complete → `full`.  
   - Floor / bins: open `mop` → bins `messy` + 4× `fx/litter` ground decals (`storeDirty`) → mop → `clean` + litter cleared.  
   `F.propWant` / `ST.propState` / `ST.devInjectTasks` for tests & capture.
4. **Night vs day store lighting (store-local overlay)**  
   Still wraps `SP.env.lights` / `ambient` only while in `store_24` / staff room — no `env.js` rewrite. Day: bright cool LED ambient `[236,242,250]`. Night: dim cooler `[72,86,110]`, dimmer overhead panels, stronger fridge glow, green 24h sign spill. `ST.lightSnap()`.
5. **Screenshots** `screenshots/store-d1-empty-shelf.png` · `store-d2-dirty-floor.png` · `store-d3-night-light.png` · `store-d4-wage-slip.png` (`python3 tools/capture_store_d.py`).
6. **Tests** `node tools/test_store.js` → **16/16 PASS** (3 new Store-D). Smoke: `node tools/smoke_store_d.js`.
7. **Zip** prefer `/workspace/fushi-wanxiang/scene-proto-45-store-d-play.zip` (avoids racing concurrent Stage R / Char-B writers of `scene-proto-45-play.zip`).

### Dev helpers (preview / capture)
- `SP.store.devShift()` — hire + book + clock-in (unchanged).  
- `SP.store.devInjectTasks(['restock','mop'])` — force open tasks + sync props.  
- `SP.store.propState()` / `SP.store.lightSnap()` — snapshots.  
- Preview bar: ⏱上班 / 下班 / +¥100 (store_preview.html).

### Suggested next store step
- **Store-E:** customer dialogue lines while scanning; restock *walk-to* the named shelf (guided arrow); night-shift NPC 小周 takes over the counter more clearly; optional PC `store_preview` day/night toggle button; put 工资条 readable detail panel (tap bag).

