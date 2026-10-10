# Midtown-B · 云栖里 ESTATE_READY

## 2026-10-11 urgent fix (Leo)

### 1. Courtyard = outdoor continuous (NOT void interior)
- **Removed** playable `estate_compound` interior (black-void load).
- Courtyard lives on **street chunk** `chunks/estate.js` (gate → walk north, same world).
- API: `SP.estate.enterCourtyard()` / `SP.places.estate_compound` → outdoor warp `[151.8, 4, N]`.
- Interiors only behind doors: **现代大堂** `estate_lobby`, **会所** `estate_club`, **A-101**.

### 2. 现代大堂 redo (tier-1 direction)
- Layout: `tools/layouts/estate_lobby.json` — **plain** walls (not tile/dado), full **terrazzo**, wide glass S gap, N/W windows, stone `s_counter`, `i_mailbox` mail wall, LED `i_track` + pendants **on**, no corkboard / wood-flight stair.
- Ambient boost in `midtown_estate.js` while in lobby/club.
- Kit atlas still limits true glass-curtain / white-stone materials; structure+props lean modern within kit_int.

### Screenshots
- `mt-b-court1-gate` street→gate continuous
- `mt-b-court2-inside` courtyard toward lobby facade
- `mt-b-sport1` outdoor sports pad
- `mt-b-lobby1-modern` bright lobby
- `mt-b-club1` club stub
- prior `mt-b-var1…4` facade variety

### Lite zip
`scene-proto-45-estate-var-lite.zip` (rebuild below)

---


Parallel track for nicer 小区 grounds + larger modern unit interiors. **CBD paused.** Elevators / 7F+ = Midtown-A (`midtown.js` / `midtown_elev.js`) — not modified here.

## Ownership (NEW only)
| path | role |
|---|---|
| `js/midtown_estate.js` | install: register scenes, street gate mark near Midtown east strip, rent_table live patch, ambient bump |
| `estate45.js` / `estate45.json` | built scenes (`window.ESTATE45`) |
| `tools/layouts/estate_compound.json` | gated courtyard |
| `tools/layouts/estate_lobby.json` | modern lobby + elev stub notice |
| `tools/layouts/room_midtown_a101.json` | 一室一厅 ~48㎡ |
| `tools/build_estate.py` | roomlayout validate → estate45 |
| `tools/capture_estate.py` | screenshots mt-b1…mt-b6 |
| `chunks/estate.js` | outer facades chunk (SCENE_CHUNKS.estate) |
| `img/estate/*` | gate sign / lobby mat / unit card / compound map / rent table card |
| `shared-rules/rules.json` → `rent_table` | A101-yunqi ¥1980 · single-midtown-ref ¥1200 · inner.1ldk [1800,2200] |

**Do not touch:** midtown.js / midtown_elev.js / midtown_scenes.js, charB, store, market, npc_schedule, appearance, stage*.js, civic atlases.

## Index integration (additive)
```html
<script src="estate45.js"></script>                 <!-- after store45.js -->
…
<script src="js/midtown_estate.js"></script>        <!-- after midtown.js / store.js -->
```

Auto-installs when `SP.game` + `SP.world` exist. API: `SP.estate.enter()` / `enterLobby()` / `enterUnit()` / `RENT`.

Street: injects `estate_gate_mark` on sidewalk ≈ `[116, 3]` (Midtown-A strip) → 「进 云栖里」.

## Scenes (layout validate **0** problems)
| id | walkable | notes |
|---|---|---|
| `estate_compound` | ~299㎡ | perimeter walls, S gate + guard stub, garden path, trees/hedges/lamps, N lobby door; `fade_group` lobby_facade / gate |
| `estate_lobby` | ~40㎡ | terrazzo, reception, mail shelf, elev stub (Midtown-A), portal↔courtyard / A-101 |
| `room_midtown_a101` | **~50.8㎡** | bright wood+tile, bed by N window, enclosed bath+door, open living/kitchen; P partitions fade via world.js |

## Rent (editable)
Closer-to-center single **¥1200** · 一室一厅精装 **¥1980** (range ¥1800–2200).  
Canonical: `../shared-rules/rules.json` → `rent_table` (synced into `scene-proto-45/shared-rules/`).  
Also `SP.estate.RENT` + `img/estate/rent_table.png`.

## Wall fade
Reuses existing `world.js` occluder fade **read-only**: partition walls (`side: P`) + tagged `fade_group` on compound facade/gate.

## Screenshots
`screenshots/mt-b1-compound-gate.png` … `mt-b6-wall-fade.png` (+ `mt-b-rent-table.png`).

## Rebuild / capture
```bash
python3 tools/build_estate.py          # 0 problems
python3 tools/capture_estate.py        # mt-b1…6
bash tools/sync_rules.sh               # after editing canonical rent_table
```

## Next (suggested)
1. **Community clinic interior** (社区卫生站厅：挂号/输液椅，接 civic hospital 轻量版)  
2. **Sports** (小区健身区 / 球场 — `amenities_sport.js` already parallel; wire into compound)


## Facade variety (2026-10-10 · Leo: not identical)

Outer block **east of Midtown-A** (`chunks/estate.js`, x≈152–210). Four looks, each differs on ≥3 axes (height / wall / roof / balcony). Direction: modern Chinese high-end compound (cream–glass, clean AC), **not** cloned old-block brick boxes.

| key | name | floors | wall | roof | balcony | note |
|---|---|---|---|---|---|---|
| `yq_club` | 云栖会所 | **4** | glass_podium (shop+glass G, p1 upper) | `b_roof_deck` | sparse (top only) | clubhouse / lobby feel |
| `yq_cream` | 云栖暖石 | **11** | plaster **p1** ivory | `b_roof_a` | mid every-2F | CBD/云麓 cream rhythm |
| `yq_mason` | 云栖砖影 | **14** | warm **w2** masonry strip | `b_roof_b` | laundry_alt | lived-in but refined |
| `yq_glass` | 云栖璃湾 | **18** | glass_strip (window-dominant w1) | `b_roof_deck` | dense every-F | tall glass bar, no AC clutter |

**Rules (also `img/estate/VARIETY_RULES.json`):**
1. Neighbours within ~30 m must not share the same (floors band × wall mode × roof × balcony rhythm).
2. High-end prefers fewer pipes; AC sparse/none except masonry look.
3. Ground floor of club/glass may use `f_shop` for glass strip / lobby read.
4. Runtime: `midtown_estate.js` pads street ground east of x≈150 and registers chunk `estate` (does not edit Midtown-A sources).

**Screenshots:** `mt-b-var1`…`mt-b-var4`. Rebuild: `python3 tools/build_estate.py && python3 tools/capture_estate_var.py`.

**API:** `SP.estate.warpOuter(x,y)` · `SP.estate.variety()` → rules + building meta.

## Ownership
`js/midtown_estate.js`, `estate45.*`, `chunks/estate.js`, `tools/layouts/estate_*`, `room_midtown_*`, `img/estate/`.
Do **not** touch Midtown-A / amenities_infra / charC.

## Rebuild
```bash
python3 tools/build_estate.py
python3 tools/capture_estate_court.py
```
