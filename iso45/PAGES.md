# 浮世万象 · scene-proto-45 · Stage L 交接

旧街区；**CBD 暂停**。Stage L：门岗核验合并、天气穿衣、服药打卡、登记导出物业微信、日程周视图+待办优先级。

**CRITICAL：** Char-A2 正在 Blender 重渲警察/消防/护士立绘——**勿改** `appearance.js` / `gen_character.py` / civic actor atlases / `NPC_SPEC`。本轨仅 `js/stageL.js`。

## 交付

| 目标 | 落地 |
|------|------|
| 门岗核验合并 | 压制 G `maybeGateFollowup` + K `maybeGateScanQuiz`；统一 `maybeUnifiedGateQuiz`（双因可「一并说明」） |
| 天气穿衣 | 收衣换装建议 toast + 菜单「听天气穿衣建议」 |
| 服药打卡 | `ps.rxCourse`；药房开疗程；日程/背包「今日服药」；阿姨微信提醒 |
| 登记导出 | 摘要→物业微信；菜单/门禁 App 按钮 |
| 周视图+优先级 | 日程「本周/按日」；待办 P 排序（gate_unified > access > rx_dose …） |

## 关键文件

- `js/stageL.js`
- `index.html`（接在 stageK 后）
- `tools/stageL_test.py` · `tools/capture_stageL.py`

## 截图

- `l1-unified-gate.png` — 合并门岗核验  
- `l2-weather-outfit.png` — 雨天换装建议  
- `l3-rx-dose.png` — 服药打卡  
- `l4-scan-export-wx.png` — 导出物业微信  
- `l5-week-view.png` — 日程本周  
- `l6-todo-priority.png` — 待办优先级  

## 玩法速查

1. 夜间未接派出所来电 **且/或** 昨夜未扫码 → 白天门岗一次核验菜单。  
2. 收干衣后看天气穿衣建议。  
3. 药房取药后每日手机打卡服药。  
4. 门禁 App「导出摘要到物业微信」。  
5. 日程切「本周」；待办按优先级排列。  

## 外观并行轨（严禁抢改）

- `js/appearance.js` · `tools/gen_character.py`（若存在）  
- civic actor atlases / Char-A2 Blender 警察·消防·护士  
- `js/stageD.js` · `NPC_SPEC`

## 建议 Stage M

- 门岗核验结果写入物业微信工单线程  
- 服药漏打惩罚（mood/energy）与疗程延长  
- 天气换装与 Char wardrobe 标签软推荐（只读 look labels，不改 atlas）  
- 日程周视图拖到具体小时条  
- 登记簿按月归档 + 导出 PDF/长图（演示）

## 质量

- stageL_test **13/13** · smoke **4/4** · stage6 **12/12**
