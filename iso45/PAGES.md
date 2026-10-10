# 浮世万象 · scene-proto-45 · Stage Q 交接

旧街区；**CBD 暂停**。Stage Q：上门预约槽、健康页、试穿撤销栈、路线微信小结、深链 daylog/ticket。

**勿改：** `appearance.js` / `gen_character.py` / civic atlases / `NPC_SPEC` / 学校场景。仅 `js/stageQ.js`。

## 交付

| 目标 | 落地 |
|------|------|
| 预约时间槽 | `openVisitBooking` / `visitAppt`；到点 `maybeFulfillAppt` → 上门对话 |
| 健康页 | 手机 App「健康」· careSM 步骤条 + 疗程 + 打卡 |
| 试穿栈 | `tryOnStack`；HUD `↩×n` 逐步撤销 |
| 路线微信 | `shareRouteSummary` → 阿凯/阿姨 |
| 深链扩展 | `fushi://app/daylog` · `ticket` · `scanlog` |

## 关键文件

- `js/stageQ.js`
- `index.html`（接在 stageP 后）
- `tools/stageQ_test.py` · `tools/capture_stageQ.py`

## 截图

- `q1-visit-slots.png` — 预约时段  
- `q2-health-page.png` — 健康页  
- `q3-tryon-stack.png` — 撤销栈  
- `q4-route-wx.png` — 路线微信  
- `q5-deeplink-daylog.png` — 深链日程  
- `q6-deeplink-ticket.png` — 深链工单按钮  

## 建议 Stage R

- 预约改期/爽约惩罚与物业评分  
- 健康页周报（服药依从性）  
- 试穿栈与衣柜收藏夹  
- 路线小结生成「周常通勤」模板  
- 深链统一路由器 + 通知栏捷径

## 质量

- stageQ_test **8/8** · smoke **4/4** · stage6 **12/12**
