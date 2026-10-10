# 浮世万象 · scene-proto-45 · Stage S 交接

旧街区；**CBD 暂停**。Stage S：评分折扣/押金、服药热力、季节收藏置顶、通勤闹钟、通知栏折叠排序。

**勿改：** `appearance.js` / `gen_character.py` / civic atlases / `NPC_SPEC` / 学校 / `store.js` / `npc_schedule.js` / `charB.js`。仅 `js/stageS.js`。

## 交付

| 目标 | 落地 |
|------|------|
| 评分联动 | 续期费按评分折扣/加价；押金 `deposit_discount` 同步 |
| 服药热力 | 近7日 taken/missed/mixed/empty 色块 |
| 季节置顶 | winter→冬装等优先；📌 标记 |
| 通勤闹钟 | `setCommuteAlarm` 7:00 提醒 + 通知栏 |
| 通知栏 | 折叠 ▾/▸；‹› 调整捷径顺序 |

## 关键文件

- `js/stageS.js`
- `index.html`（接在 stageR 后）
- `tools/stageS_test.py` · `tools/capture_stageS.py`

## 截图

- `s1-rating-renew.png` — 评分续期菜单  
- `s2-med-heatmap.png` — 服药热力  
- `s3-seasonal-favs.png` — 季节置顶  
- `s4-commute-alarm.png` — 通勤闹钟  
- `s5-notif-collapsed.png` — 折叠捷径  
- `s6-notif-order.png` — 自定义顺序  

## 建议 Stage T

- 低分限制临时门禁时长  
- 热力点击补打卡/备注  
- 季节置顶一键换装  
- 闹钟贪睡与跳过一天  
- 通知栏配置页（拖拽排序持久化说明）

## 质量

- stageS_test **8/8** · smoke **4/4** · stage6 **12/12**
