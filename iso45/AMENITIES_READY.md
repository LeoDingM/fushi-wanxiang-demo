# Amenities-Sport · READY（旧区 → 城中/东沿）

平行轨：`js/amenities_sport.js` + `amenities45.js` + `img/amenities/` + `tools/layouts/amenity_clinic.json`。  
**未改** midtown / midtown_estate / charB / store / market / stage\* / appearance / civic。  
**未建** 菜市场 / 小超市（见 `js/amenities_market.js`，另一 agent）。

## 已落地（本轨 Added）

| id | 名称 | 位置 | 状态 |
|----|------|------|------|
| court | 运动场地（篮球半场线 + 乒乓台 stub） | 井槐里12号院东侧空地 ≈(13.2, 18.6) | stub · 可互动「打球」 |
| park | 社区小公园（步道/花坛/长椅 overlay） | 12号楼北侧 ≈(6, 28.5) | stub · 坐长椅 +mood |
| stadium | 社区体育场外立面占位 | 东沿 midtown edge ≈(70, −28) | exterior_placeholder |
| clinic | 社区诊所外立面 + **可进候诊室** | 卫生中心东侧空档 ≈(31, −10) | enterable · `amenity_clinic` |
| express | 快递驿站 | 院内 ≈(9, 13.6) | prop · toast 取件 |
| charge | 充电桩 ×2 | 院内电瓶车旁 ≈(4.6, 6) | prop |
| recycle | 垃圾分类点 | 院内垃圾桶旁 ≈(−5.2, 11.6) | prop |

## 仍缺 / 提议给 Leo（Missing）

| 名称 | 标记 |
|------|------|
| 快递驿站（完整取件玩法） | prop_only_here（本轨仅柜机 stub） |
| 药店 | **missing** |
| 社区食堂 | **missing** |
| 幼儿园 | missing（CBD 云麓有示意，旧区未建） |
| 银行网点 | **missing** |
| 公厕 | **missing** |
| 地下车库入口 | **missing** |
| 物业中心门脸 | missing（玩法有物业，无独立立面） |
| 菜市场 | owned_by_other_agent |
| 小超市 | owned_by_other_agent |
| 干洗店/洗衣店 | missing |
| 邮政/通讯营业厅 | missing |

## 接入

`index.html` 已加：

```html
<script src="amenities45.js"></script>          <!-- after store45.js -->
<script src="js/amenities_sport.js"></script>   <!-- after store.js -->
```

自动 `SP.amenities.install()`：注册 `SP.scenes.amenity_clinic`、注入街面物件、wrap `drawOverlay` + `actionFor/use`。

API：`SP.amenities.spawnAt('court'|'park'|'stadium'|'clinic'|'clinic_in'|…)` · `listAdded()` · `listMissingProposed()`。

## 截图

- `screenshots/am1-court.png` — 旧区运动场  
- `screenshots/am2-park.png` — 社区小公园  
- `screenshots/am3-stadium.png` — 东沿体育场外立面  
- `screenshots/am4-clinic-ext.png` — 诊所外立面  
- `screenshots/am5-clinic-wait.png` — 候诊室内部  
- `screenshots/am6-bonus-props.png` — 驿站/充电桩/分类点一带  

## 质量

- clinic layout `roomlayout.validate` → **0 problems**  
- 重拍：`python3 tools/capture_amenities.py`  
