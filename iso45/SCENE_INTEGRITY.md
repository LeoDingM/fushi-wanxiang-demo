# Outdoor Scene Integrity — scene-proto-45

**Date:** 2026-10-11 · **Mandate:** full outdoor integrity audit + fix (no new features)

## Root causes

| Bug | Root cause |
|-----|------------|
| Ghost brick walls over 小公园 / 运动场 / 爱心屋 | (1) Courtyard `east_wall` / `west_wall` were **one fade_group** spanning ~24 m — any hit ghosted the whole run. (2) Tall far facades (esp. b12) overlapped the player sprite on screen and triggered **group fade** for the entire building. (3) Amenity **HUD overlays** (`drawOverlay`) painted labels/art *after* the world, so marks floated on top of foreground facades. |
| 井槐里12号 stacked on midtown/estate | Kit piece `f_sign` has baked text **「井槐里12号」**. Midtown `mt_seam_sign` and estate `es_seam_sign` used `type: "f_sign"`, so they rendered Building 12’s plate. |
| 电梯加装公示 + garage + walls 穿模 | Garage `(20,12.2)` sat on `east_wall`; elev `(19.5,2.25)` sat on `front_wall` / hospital edge; HUD art stacked without depth. |
| Amenity labels through building ghosts | Same HUD-overlay path as above + POIs sitting in the north courtyard behind b12’s screen silhouette. |

## Fixes (fix only)

1. **Fade groups split** — `east_wall` / `west_wall` → `_s` / `_m` / `_n` in `scene.json` + `tools/build_scene.py`.
2. **Local + behind fade** — `js/world.js` `updateFade`: only consider occluders within ~12 m of the player; require player deeper than wall (camera-behind); group fade only for members within 8 m of the player; exact hit pieces still fade.
3. **12号 plate lock** — `js/main.js` doorplates: 「井槐里 12号」 only for `unit_door`. Midtown/estate seam signs → `f_shopsign`.
4. **Amenity POIs relocated** — park/court/animal into clear N courtyard (outside b12 footprint); garage east of east_wall `(23.5,8.2)`; elev on S sidewalk near 12号 `(9.2,2.15)`.
5. **No HUD floats for courtyard amenities** — park/court/animal marks & overlay art removed; world kit props + E interact remain. Street-facing clinic/stadium overlays stay proximity-gated.

## Checklist (automated — 12/12 after estate seam fix)

- [x] `east_wall` / `west_wall` split S/M/N
- [x] No stray 「井槐里 12号」 on non-`unit_door` doors
- [x] `unit_door.plate === 井槐里 12号`
- [x] Midtown seam `f_shopsign` (not `f_sign`)
- [x] Estate seam `f_shopsign` (not `f_sign`)
- [x] Only `sign_12` uses kit `f_sign`
- [x] Park / court / animal / garage / elev outside wrong footprints
- [x] Standing in park (`y≈31`) does **not** fade `b12`
- [x] Standing just behind b12 south wall (`y≈14.5`) **does** fade `b12`
- [x] Screenshots of broken areas + east / midtown / old block walk

## Screenshots

| File | What |
|------|------|
| `screenshots/integrity1-park-court.png` | N courtyard park/court — no b12 ghost, no floating amenity HUD |
| `screenshots/integrity2-elev-12.png` | Elev notice on S sidewalk near 12号 |
| `screenshots/integrity3-garage.png` | Garage east of courtyard wall |
| `screenshots/integrity4-b12-plate.png` | Real 井槐里 12号 plate only |
| `screenshots/integrity5-midtown-seam.png` | Midtown seam — no 12号 f_sign |
| `screenshots/integrity6-east-walk.png` | East strip walk |
| `screenshots/integrity7-oldblock.png` | Old-block overview |
| `screenshots/integrity8-animal.png` | 爱心屋 world props (no HUD float) |
| `screenshots/integrity9-b12-behind-fade.png` | Control: local fade still works behind wall |

## Files changed

- `js/world.js` — local/behind fade
- `js/main.js` — plate guard
- `js/amenities_sport.js` — POI move + no courtyard HUD overlays
- `js/amenities_infra.js` — POI move + elev/animal overlay trim
- `scene.json` / `scene.js` — wall fade_group split
- `tools/build_scene.py` — keep split on rebuild
- `tools/build_midtown.py` + `chunks/midtown.js` — seam → f_shopsign
- `tools/build_estate.py` + `chunks/estate.js` — seam → f_shopsign
- `tools/capture_integrity.py` — capture harness
- `SCENE_INTEGRITY.md` — this doc

## Zip

Lite play zip (integrity pass, &lt;25MB): see delivery path in report.
