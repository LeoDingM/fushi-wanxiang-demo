# 浮世万象 · scene-proto-45 · Stage R 交接

旧街区；**CBD 暂停**。Stage R：预约改期/爽约评分、服药周报、衣柜收藏、通勤模板、深链路由+通知栏。

**勿改：** `appearance.js` / `gen_character.py` / civic atlases / `NPC_SPEC` / 学校场景。仅 `js/stageR.js`。

## 交付

| 目标 | 落地 |
|------|------|
| 改期/爽约 | `rescheduleVisit` / `markVisitNoShow` + `propertyRating` |
| 服药周报 | `weeklyMedReport` 于健康页；可发王阿姨 |
| 衣柜收藏 | `wardrobeFavs`；HUD ★；健康页穿上/取消 |
| 通勤模板 | `commuteTemplates` 保存/套用今日路线 |
| 深链+通知栏 | `routeDeepLink` + `#stageR-notif` 捷径 |

## 关键文件

- `js/stageR.js`
- `index.html`（接在 stageQ 后）
- `tools/stageR_test.py` · `tools/capture_stageR.py`

## 截图

- `r1-visit-manage.png` — 预约管理  
- `r2-weekly-med.png` — 服药周报  
- `r3-wardrobe-favs.png` — 收藏夹  
- `r4-commute-tpl.png` — 通勤模板  
- `r5-notif-bar.png` — 通知栏捷径  
- `r6-deeplink-health.png` — 路由健康页  

## 建议 Stage S

- 评分影响门禁续期折扣/押金  
- 周报图表按日热力  
- 收藏夹排序与季节自动置顶  
- 通勤模板闹钟提醒  
- 通知栏可折叠/自定义捷径顺序

## 质量

- stageR_test **8/8** · smoke **4/4** · stage6 **12/12**
