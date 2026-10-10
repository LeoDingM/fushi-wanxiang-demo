# Midtown-A READY — near-downtown east strip

## Axis
**EAST** of the old/peripheral block (past `chunks/east` / school_high curb ~x103), continuing the asphalt toward near-downtown. Documented in HUD as「近市中心 · 东向 Midtown」. CBD remains paused.

Ground/bounds extended: `scene.json` `bounds.x1=150`, ground cols→97 (asphalt/sidewalk pad). Chunk `midtown` rect `[103.5,-40,148,64]`.

## Buildings (W→E, rising, visually distinct)

| key | name | floors | door | style recipe |
|-----|------|--------|------|--------------|
| `jx` | 景秀苑 | **8F** | x110 y4.5 | **transitional** — brick/plaster mix (`p1/w1/w2`), laundry balconies, dense AC+pipes, `b_roof_b`, few night-lit |
| `yj` | 云阶公馆 | **12F** | x124 y5.2 (setback) | **glass** — clean `w2` plaster, glass `b2` balconies rare, sparse AC, `b_roof_a`, shop `door`, high night-lit |
| `cn` | 城南一号 | **16F** | x138.5 y3.8 | **tower** — mixed walls, corner setback top 2F, dual shopfront (`window`+`shut`), `b_roof_b:c` + deck cap |

No long identical rows: wall variant cycles, balcony/AC/pipe odds, roof types, face_y offsets, and shopfront states differ per tower. Elevators required on all three (>7F).

## Elevator UX
- Lobby/corridor panel: `interact:"elevator"` on `i_notice` (every floor).
- `js/midtown_elev.js` wraps `G.actionFor` / `G.use` → menu「电梯 · 现在 NF」with direct floor picks (mirrors stair floor menu).
- **步梯** still `interact:"stairs"` → scoped `openFloorMenu` (only that tower’s halls).
- **消防通道** west door → `mt_*_fire_Nf` shaft (stairs + 1F emergency street exit).
- `G.floors()` scoped so midtown towers do not cross-list with 井槐里/馨园.

## Files (ownership)
| path | role |
|------|------|
| `js/midtown.js` | register scenes, chunk ensure, warp/enter helpers, HUD |
| `js/midtown_elev.js` | elevator + floor scoping |
| `js/midtown_scenes.js` | generated interiors (72 scenes) |
| `chunks/midtown.js` | generated street strip + facades |
| `tools/build_midtown.py` | builder (styles + chunk + scene patch) |
| `tools/layouts/midtown_*.json` | per-floor layout dumps + `midtown_meta.json` |
| `img/midtown/` | art notes (stock kit variants for now) |
| `tools/midtown_test.py` / `capture_midtown.py` | tests + mt-a1…a6 |
| `index.html` | script tags after stageS (no stageA–S source edits) |

**Not edited:** appearance.js, gen_character.py, civic atlases, charB.js, store.js, market.js, npc_schedule.js, stageA–S.js.

Parallel `js/midtown_estate.js` (Midtown-B compound) is separate and does not own Midtown-A facades.

## Tests / zip
- `python3 tools/midtown_test.py` → **10/10** (seam+chunk, elev lobby→8F, stairs scoped, fire shaft, yj/cn elevators).
- Screenshots: `screenshots/mt-a1-seam-east.png` … `mt-a6-cn-skyline.png`.
- Play zip: `scene-proto-45-midtown-a-play.zip` (does not clobber main `scene-proto-45-play.zip`).



## Midtown-A2 — livable units + rent

All corridor doors formerly「尚在装修」are now **portal** into 1LDK units (`room_mt_{jx|yj|cn}_{F}0{1|2}`), cloned from 馨园一房一厅 template with Midtown-A2 lease notes. **72 units** (2 per floor × 8+12+16). Exit door returns to that floor’s corridor.

### Featured rent rows (`rent_table.units` + `window.MIDTOWN_RENT`)
| id | label | rent |
|----|-------|------|
| mt-jx-101 | 景秀苑 1-01 | ¥1350 |
| mt-jx-502 | 景秀苑 5-02 | ¥1450 |
| mt-yj-601 | 云阶公馆 6-01 | ¥1680 |
| mt-yj-1201 | 云阶公馆 12-01 | ¥1850 |
| mt-cn-801 | 城南一号 8-01 | ¥1750 |
| mt-cn-1601 | 城南一号 16-01 | ¥2100 |

`js/midtown.js` `wireRent()` / `wrapUnits()` merge into `SP.game.rules` + `stageA.units()` without editing estate `A101-yunqi` rows. Facade diversity styles unchanged. Elevator floor list ignores `room_mt_*`.

### A2 verify
- `tools/midtown_a2_test.py` **8/8**; `midtown_test.py` **10/10**
- Screenshots `mt-a2-1`…`mt-a2-6`
- Lite zip `scene-proto-45-midtown-a2-play.zip` (<25MB)

Barber-on-road (`shop_barber` y) left to barber-fix agent — Midtown rebuild does not touch `build_scene.py`.



## Midtown-A3 — style flavor + grouped rent UI

Units flavored by tower style (kit states only; no new atlases; estate courtyard untouched):

| style | tower | walls / window / bed / ground | extras |
|-------|-------|-------------------------------|--------|
| transitional | 景秀苑 | `dado_ads` / `dado` / messy / wood:a | i_clutter 纸箱 |
| glass | 云阶公馆 | `plain` / plain / made / terrazzo | drop pouf+tv；绿植架 |
| tower | 城南一号 | `tile` / tile / made / wood:b | drop coffee；i_meter |

Housing phone: `wrapHousing` →「近市中心 Midtown · 精选在租」block shows **6 featured** rows + copy「三塔共 72 户门可入样板」; other districts listed separately — no 72-row flood.

### A3 verify
- `tools/midtown_a3_test.py` **6/6**
- Screenshots `mt-a3-1`…`mt-a3-6`
- Lite zip `scene-proto-45-midtown-a3-play.zip`



## Midtown polish (post-A3) — occupied → facade

Uses existing hooks only (no new atlases; estate courtyard alone):

- **Night glow:** wrap `SP.households.windowLit` for `mt_*` units; occupied featured rentals light facade windows at night (style odds: glass 0.9 / tower 0.7 / transitional 0.55).
- **Laundry hint:** occupied transitional/tower balconies → `f_balcony` state `laundry`; glass stays clean.
- **Street door labels:** `mt_*_door.plate` =「名 · 精选在租N套」.
- `chunks/midtown.js` preloaded in `index.html` (same pattern as estate) so chunk apply is not async-racy.

### Polish verify
- `tools/midtown_a4_test.py` **7/7**
- Screenshots `mt-a4-1`…`mt-a4-4`
- Lite zip `scene-proto-45-midtown-a4-play.zip`



## Midtown unit plans (spatial variety)

Four data-driven layouts (`tools/layouts/room_mt_plan_{a,b,c,d}.json`), each **roomlayout validate 0**, with enclosed glass balcony + washer + dryrack:

| Plan | id | Concept | Size |
|------|-----|---------|------|
| **A** | `room_mt_plan_a` | 窗边床 + 开放L厨 + 南向封闭阳台 | ~36㎡ |
| **B** | `room_mt_plan_b` | 独立餐区（入户侧）+ 客厅 + 阳台 | ~36㎡ |
| **C** | `room_mt_plan_c` | 大客厅优先 + 宽阳台（3×玻璃） | ~48㎡ |
| **D** | `room_mt_plan_d` | 紧凑高效（无餐桌/脚凳）+ 阳台 | ~32㎡ |

### Tower assignment
- **景秀苑 (jx):** A/D alternate by `(floor+slot)%2`
- **云阶公馆 (yj):** C when `slot==1 && floor>=6`, else B
- **城南一号 (cn):** A→B→C→D rotate `(floor+slot)%4`

Counts (build): jx A8/D8 · yj B17/C7 · cn A8/B8/C8/D8. Style palette (transitional/glass/tower) still overlays walls/bed/ground.

Rent featured rows note 方案 + ㎡. Screenshots `mt-plan-a`…`d`, `mt-plan-c-balcony`, `mt-plan-housing-sizes`. Test `midtown_plans_test.py` 7/7. Zip `scene-proto-45-midtown-plans-play.zip`.

## Midtown-B handoff (小区 compound)
Suggested next (estate track already stubbed):
1. Gated **compound grounds** behind midtown strip (courtyard, gate mark, property booth).
2. Deliverable **units** (一室一厅) off corridor doors currently「尚在装修」.
3. Shared elev lobbies ↔ unit doors; rent_table midtown rows live.
4. Keep facade diversity rules: no clone rows when adding outer-block neighbors.
5. Do not merge CBD; keep elevators for any new >7F wing.
