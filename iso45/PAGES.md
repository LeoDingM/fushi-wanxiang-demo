# 浮世万象 · scene-proto-45 · Stage P 交接

旧街区；**CBD 暂停**。Stage P：物业上门结案、医护状态机、试穿还原、行程回放、QR 深链门禁。

**勿改：** `appearance.js` / `gen_character.py` / civic atlases / `NPC_SPEC` / 学校场景。仅 `js/stageP.js`。

## 交付

| 目标 | 落地 |
|------|------|
| 物业上门 | 逾期工单靠近馨园或微信触发菜单：结案 / 结案续期 / 改约 |
| 医护 SM | `ps.careSM.phase`：revisit_needed→registering→consulting→pharmacy→course→done |
| 试穿还原 | HUD 徽章点击 → `setOutfitId(prevId)` |
| 行程回放 | `itinReplay` + dayLog `itin_replay`；日程页「今日路线回放」 |
| QR 深链 | `fushi://app/scanlog`；长图页「扫描→打开门禁」 |

## 关键文件

- `js/stageP.js`
- `index.html`（接在 stageO 后）
- `tools/stageP_test.py` · `tools/capture_stageP.py`

## 截图

- `p1-property-visit.png` — 物业上门  
- `p2-care-sm.png` — 药房医护进度  
- `p3-tryon-restore.png` — 试穿可还原  
- `p4-itin-replay.png` — 路线回放  
- `p5-qr-deeplink.png` — 深链按钮  
- `p6-deeplink-scanlog.png` — 打开门禁  

## 建议 Stage Q

- 上门对话冷却/预约时间槽  
- careSM 手机健康页可视化  
- 还原试穿撤销栈（多步）  
- 路线回放生成「今日小结」微信发给阿凯  
- 深链支持 `fushi://app/daylog` / `ticket`

## 质量

- stageP_test **8/8** · smoke **4/4** · stage6 **12/12**
