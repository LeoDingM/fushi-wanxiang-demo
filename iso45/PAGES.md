# 浮世万象 · scene-proto-45 · Stage N 交接

旧街区；**CBD 暂停**。Stage N：工单回访结案↔门禁、漏服连续复诊、一键试穿、时段 POI、长图分享。

**勿改：** `appearance.js` / `gen_character.py` / civic atlases / `NPC_SPEC`。可调用已有 `setOutfitId` / `openWardrobe`。

## 交付

| 目标 | 落地 |
|------|------|
| 工单回访 | `closeTicket` 待跟进→已结案；可选 `extendAccess(+6h)`；物业微信 + 回复入口 |
| 漏服连续 | `rx_miss_streak≥2` → `hospital_revisit` 待办；医院交互清除 |
| 一键试穿 | 收衣菜单 `try_<id>` → `SP.appearance.setOutfitId` |
| 时段 POI | 小时明细「前往」→ `stageG.jumpTo` |
| 长图分享 | 预览页分享阿凯/阿姨/房东微信（演示） |

## 关键文件

- `js/stageN.js`
- `index.html`（接在 stageM 后）
- `tools/stageN_test.py` · `tools/capture_stageN.py`

## 截图

- `n1-ticket-follow.png` — 工单回访菜单  
- `n2-ticket-renew-wx.png` — 结案续期微信  
- `n3-miss-streak-hospital.png` — 复诊待办  
- `n4-try-on.png` — 一键试穿  
- `n5-hour-poi.png` — 时段前往  
- `n6-long-share.png` — 长图分享好友  

## 建议 Stage O

- 工单优先级/逾期催办与门岗二次核验  
- 复诊后重开处方疗程自动衔接 Stage K/L  
- 试穿预览对比（当前 vs 推荐）HUD 角标  
- 日程「行程」一键按小时串门店/公交  
- 长图加水印/二维码演示（仍不改 civic 美术）

## 质量

- stageN_test **10/10** · smoke **4/4** · stage6 **12/12**
