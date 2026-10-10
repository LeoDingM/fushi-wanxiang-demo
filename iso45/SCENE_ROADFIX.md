# Outdoor Road Footprint Fix — scene-proto-45

**Date:** 2026-10-11 · **Mandate:** full-map footprint-on-road / wrong-stack fix (no new features)

## Root causes

| Bug | Root cause |
|-----|------------|
| Houses / civic walls on main asphalt (y −6..0) | `block()` south-strip civics & schools used `y0=-10, ny=3` → collider north edge **y=−1**, so W-face bays sat at y=−4 / −1 **on the road**. Same pattern copied into amenity bank / post / activity / clinic colliders (`…,-1.0]`). |
| 井槐里12号 street not open | Hospital at `x0=16..28` spanned the **side road** (x 22..28) and its W wall crossed the main road east of B12’s frontage — asphalt read as “houses on the road”. |
| Side-road clutter | Garage `(23.5,8.2)`, bus_stop_m `(22,1)`, hedge_belt4 `(27,-11.3)`, canteen/kinder stubs x∈22..28 sat on N-S asphalt. |
| Dryclean vs fire stack | Dryclean at x=48 overlapped civic_fire footprint (52..64). |

## Fixes (minimal)

1. **South strip y0 −10 → −19** (north edge −10, clear of `ROAD_Y`) for `civic_police` / `civic_hospital` / `civic_fire` / `school_*` in `tools/build_scene.py`; amenity bank/toilet/dryclean/post/activity/clinic POIs + colliders match.
2. **Hospital x0 16 → 10** (footprint x 10..22, west of side road); door spawn / civic_look / stageA → `[13,-6.5]`.
3. **Bounds y0 −11.5 → −20** so S-face doors stay walkable.
4. **Garage → x=29.8**; **bus_stop_m / hedge_belt4 → x=20.5**; canteen west of side road, kinder east; dryclean → x=42; toilet → x=39.5; green-belt trees → y≈−22 (were inside new footprints).
5. Rebuild `scene.json` / `chunks/east.*` via `build_scene.py`. Midtown/estate outdoor colliders already clear — untouched.

## Proof

- Runtime collider audit: **0** colliders intersecting main/side road bands.
- Screenshots: `road1-b12-open.png` · `road2-south-strip.png` · `road3-side-road.png` · `road4-east-civic.png` · `road5-b12-plate-road.png`
- Reference: `screenshots/ref-b12-open-road.png`

## Files changed

- `tools/build_scene.py` → `scene.json` / `scene.js` / `chunks/east.json` / `chunks/east.js`
- `js/amenities_infra.js` · `js/amenities_sport.js` · `js/amenities_civic.js`
- `js/civic_look.js` · `js/stageA.js`
- `tools/capture_roadfix.py` · `SCENE_ROADFIX.md`

## Zip

Lite: `scene-proto-45-roadfix-lite.zip` (<25MB). **Not deployed.**
