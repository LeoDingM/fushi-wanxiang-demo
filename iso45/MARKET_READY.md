# Amenities-Market · 井槐里菜市场 + 惠民小超市

Old-block first (井槐里), with **east-slide stubs** for midtown later (`SP.amenities.SLIDE_EAST`).

## Files (owned by this track)
| file | what |
|---|---|
| `js/amenities_market.js` | scenes + street stubs + buy + HUD |
| `img/amenities/*.png` | sign / banner placeholders |
| `market_preview.html` | standalone preview (desktop + phone) |
| `tools/capture_market.py` | market1–4 + smkt1–2 screenshots |
| `tools/smoke_market.js` | node smoke |
| `MARKET_READY.md` | this doc |

**Does not touch:** stageS/stageR/charB/npc_schedule/appearance/civic atlases.

## Integration
- **index.html:** one script after `js/store.js`:
  ```html
  <script src="js/amenities_market.js"></script>
  ```
- Auto-installs when `SP.game` + `SP.world` exist. Injects 4 street `p_stall` stubs on the old block and registers `SP.scenes.market_jhl` / `smkt_jhl`.

## Street stubs (old block)
| id | xy (approx) | interact |
|---|---|---|
| `mkt_jhl_a/b` + `mkt_jhl_gate` | ≈ (−13.8…−9.6, 1.85) | gate → `market` |
| `smkt_jhl_gate` | ≈ (15.2, 1.85) | `supermarket` |

`SP.amenities.slideEast()` applies `SLIDE_EAST` deltas (default +55 m east) for midtown dry-run.

## Interiors
- **菜市场 `market_jhl`:** 8×6 hall, 3× `s_counter` stalls + cooler; buy 青菜 / 鸡蛋 → `ps.items` + amenity bag.
- **小超市 `smkt_jhl`:** 7×5 aisles (`s_gondola` / `s_cooler` / counter); buy 方便面 / 面包.

## Preview / capture
```bash
# open market_preview.html  (?market=1 / ?smkt=1 / default=street at market)
node tools/smoke_market.js          # PASS
python3 tools/capture_market.py     # screenshots/market1–4 + smkt1–2
```

## Zip
`/workspace/fushi-wanxiang/scene-proto-45-market-play.zip` (side zip; does not clobber main play zip).

## Next
- Dedicated kit pieces (awning market hall, supermarket facade) instead of `p_stall` reuse.
- Vendor NPC lines; weigh-scale mini UX for 菜.
- Slide stubs onto midtown chunk when CBD/east land is stable.
