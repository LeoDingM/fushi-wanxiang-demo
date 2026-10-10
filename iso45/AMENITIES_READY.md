# Amenities · READY（旧区 → 城中/东沿）

平行轨：
- **Sport** `js/amenities_sport.js` · 运动场 / 公园 / 体育场 / 诊所
- **Infra** `js/amenities_infra.js` · 银行 / 公厕 / 车库 / 干洗 / **邮政·通讯** / **活动中心·书屋** / **修车摊·修锁**
- art `img/amenities/` (+ `infra/`) · layouts `tools/layouts/amenity_*.json` · `amenities45.js`

**未改** midtown / midtown_estate / charB / store / market / stage\* / appearance / civic。  
**未建** 菜市场 / 小超市（market）· 驿站/药店/充电桩/分类（props）· 食堂/幼儿园/物业（civic）。

## 已落地 · Sport

| id | 名称 | 位置 | 状态 |
|----|------|------|------|
| court | 运动场地 | ≈(13.2, 18.6) | stub |
| park | 社区小公园 | ≈(6, 28.5) | stub |
| stadium | 社区体育场外立面 | ≈(70, −28) | exterior |
| clinic | 社区诊所 + 候诊室 | ≈(31, −10) | enterable |

## 已落地 · Infra

| id | 名称 | 位置 | 状态 | 立面差异 |
|----|------|------|------|----------|
| bank | 银行网点 + ATM | ≈(−10, −10) | enterable+atm | cream / `roof_a` / `w1` |
| toilet | 公厕 + 三厕位 | ≈(10, −10) | enterable | pipe + hedge |
| garage | 地下车库坡道 | ≈(20, 12) | ramp_stub | **非建筑** posts+fence |
| dryclean | 干洗店 | ≈(48, −10) | exterior | shut + laundry balcony |
| **post** | **邮政·通讯营业厅** | ≈(−22, −10) | **enterable** · 寄件/话费 | 绿标 + `f_shopsign` + 邮筒 |
| **activity** | **社区活动中心·书屋** | ≈(2, −10) | **enterable** · 阅览/报名 | 暖色 `f_door` + balcony default（≠干洗 laundry） |
| **bike_repair** | **路边修车摊** | ≈(−13.5, 2.2) | stall · 补胎 ¥15 | `p_stall`+bike+bins |
| **locksmith** | **修锁配钥匙** | ≈(−11, 2.3) | stall · 配钥匙 ¥25 | notice+locker（非建筑克隆） |
| **animal_rescue** | **爱心屋·流浪救助** | 小公园北 ≈(9.2, 29) | prop_stall · 投喂/告示 | stall+pots+bowl（远离南街克隆带） |
| **elev_notice** | **电梯加装公示** | 12号东北人行道 ≈(19.5, 2.3) | notice_board | post+notice only |

截图：`infra1–7` · **`infra8-animal` / `infra9-elev`** · 另有内景 1b/2b/5b/6b。

## 仍缺 / 归属

| 名称 | 标记 |
|------|------|
| 快递驿站 / 药店 / 充电桩 / 垃圾分类 | owned_by_amenities_props |
| 菜市场 / 小超市 | owned_by_amenities_market |
| 社区食堂 / 幼儿园 / 物业中心 | owned_by_amenities_civic |
| 银行 / 公厕 / 车库 / 干洗 | done · amenities_infra |
| 邮政·通讯 / 活动中心·书屋 / 修车摊·修锁 | **done · amenities_infra** |
| 社区卫生站独立药房门脸 | missing（诊所已有；药店归 props） |
| 流浪动物救助点 / 爱心屋 | **done · amenities_infra** · 小公园北 ≈(9.2,29) |
| 老旧小区电梯加装公示点 | **done · amenities_infra** · 北人行道 ≈(19.5,2.3) |

## 文件（本轮新增/更新）

```
js/amenities_infra.js          # v2：+post / activity / bike_repair / locksmith
img/amenities/infra/{post,activity,bike_repair,locksmith,wrench}.png
tools/layouts/amenity_post.json
tools/layouts/amenity_activity.json
amenities45.js                 # + amenity_post / amenity_activity
tools/capture_infra_v2.py
screenshots/infra5–9 (+ interiors)
img/amenities/infra/{animal,elevator,bowl}.png
scene-proto-45-amenities-infra-lite.zip
```
