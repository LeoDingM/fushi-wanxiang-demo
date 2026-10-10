# Midtown-B · 云栖里 estate — READY

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
