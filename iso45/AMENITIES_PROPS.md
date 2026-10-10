# Amenities-Props · 快递驿站 / 药店 / 充电桩 / 垃圾分类

Old-block street props (slide-ready toward midtown). **No NPC spawns** — Char-C owns gender/hair; pharmacy is furniture-only.

## Files
| Path | Role |
|------|------|
| `js/amenities_props.js` | Inject street stubs + pharmacy interior + interact |
| `img/amenities/props/*.png` | Signs / markers |
| `AMENITIES_PROPS.md` | This note |
| `screenshots/prop1…prop4.png` | Shots |
| `tools/amenities_props_test.py` / `capture_amenities_props.py` | Test + capture |

**Does not touch:** `npc_schedule.js`, midtown*, `amenities_sport.js`, `amenities_market.js` (only merges `SLIDE_EAST` keys), store/charB/stage*/appearance/civic.

## Street stubs (old block)
| id | kit | interact | approx xy |
|----|-----|----------|-----------|
| `prop_parcel` | `p_locker` | 取件 → Stage-E bag `快递包裹` | 10.2, 3.55 |
| `prop_pharm_gate` | `p_stall` | enter `pharm_jhl` | -16.8, 1.9 |
| `prop_charger` | `p_ebike` | 慢充 ¥1 | 4.8, 3.45 |
| `prop_recycle` | `p_bins` | 可回收 / 其他 | -5.6, 3.5 |

`SP.amenities.SLIDE_EAST.parcel|pharmacy|charger|recycle = [55,0]` · `SP.amenityProps.slideEast()`.

## Pharmacy
Tiny interior `pharm_jhl`: gondola shelves buy **创可贴** (`med_band`, ¥6) into rules items + bag. Counter toast only — **no clerk actor**.

## API
```js
SP.amenityProps.status()
SP.amenityProps.enterPharmacy()
SP.amenityProps.pickParcel()
SP.amenityProps.buyBandage(ps)
SP.amenityProps.devGoto('parcel'|'pharmacy'|'charger'|'recycle'|'pharm')
```

## Zip
`scene-proto-45-props-play.zip`
