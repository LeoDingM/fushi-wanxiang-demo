# Amenities-Civic · 社区食堂 / 幼儿园接送 / 物业中心

Old-block → midtown-edge civic配套. **No NPC spawns** (Char-C). Facades use **different kit mixes** (stall+planter+notice / hedge+notice+planter / post+notice+side stall) — not cloned boxes.

## Files
| Path | Role |
|------|------|
| `js/amenities_civic.js` | Street inject + canteen/property interiors + menus |
| `img/amenities/civic/*.png` | Distinct signs / facade accents |
| `AMENITIES_CIVIC.md` | This note |
| `screenshots/civ1…civ4.png` | Shots |
| `tools/amenities_civic_test.py` / `capture_amenities_civic.py` | Test + capture |

**Avoided:** midtown*, sport, market body, charB, stage*, appearance, civic atlases, npc_schedule. Soft-calls `stageH.renewByFee` / `stageM.fileGateTicket` when present.

## Street (east old block)
| Landmark | Kit mix | xy (approx) |
|----------|---------|-------------|
| 社区食堂 | planter + **stall** gate + notice menu | 22.0, 1.95 |
| 幼儿园接送点 | **hedge** + notice + planter | 26.5, 1.9 |
| 物业中心 | **post** + notice gate + side stall | 31.5, 3.4 |

`SP.amenities.SLIDE_EAST.canteen|kindergarten|property = [50,0]`.

## Gameplay
- **食堂** interior `canteen_jhl`：堂食（`staff_meal` / `buy_kc_cheap`）· 打包（`bento`）→ bag；价从 `rules.data.prices` peripheral 表读取。
- **幼儿园**：门外接送打卡 only；明确不生成幼儿 NPC。
- **物业** interior `propcenter_jhl`：缴费（优先 Stage-H 续期）· 报修 → `gateTickets` / Stage-M 工单 + 物业微信。

## API
```js
SP.amenityCivic.status()
SP.amenityCivic.buyMeal('dine'|'pack')
SP.amenityCivic.kinderPickup()
SP.amenityCivic.propertyFee()
SP.amenityCivic.reportRepair('楼道灯')
SP.amenityCivic.enterCanteen() / enterProperty()
SP.amenityCivic.price(key, fallback)
```

## Zip
`scene-proto-45-civic-amen-play.zip` (<25MB)
