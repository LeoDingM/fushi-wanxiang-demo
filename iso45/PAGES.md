# 浮世万象 · scene-proto-45 · Stage O 交接

旧街区；**CBD 暂停**。Stage O：工单 SLA/二次核验、复诊重开疗程、试穿徽章、软行程链、长图水印二维码。

**勿改：** `appearance.js` / `gen_character.py` / civic atlases / `NPC_SPEC` / 学校场景（Char-B）。仅 `js/stageO.js`。

## 交付

| 目标 | 落地 |
|------|------|
| 工单 SLA | 待跟进工单 `dueDay=day+1`；逾期微信催办 + 待办；门岗二次核验 |
| 复诊→疗程 | `onHospitalRevisit` / 医院交互后 `startRxCourse('复诊续疗程')` |
| 试穿徽章 | HUD `试穿 A→B`（tryOn.prev/cur） |
| 软行程链 | 按时段 bus→store→… 按钮，`jumpTo` 软 POI |
| 水印/QR | 长图 canvas 斜水印 + 演示二维码块 |

## 关键文件

- `js/stageO.js`
- `index.html`（接在 stageN 后）
- `tools/stageO_test.py` · `tools/capture_stageO.py`

## 截图

- `o1-second-gate.png` — 二次核验  
- `o2-sla-todo.png` — SLA 待办  
- `o3-revisit-rx.png` — 复诊续疗程  
- `o4-tryon-badge.png` — 试穿徽章  
- `o5-itinerary.png` — 软行程链  
- `o6-watermark-qr.png` — 水印二维码  

## 建议 Stage P

- SLA 工单自动升级为物业上门（knock/物业 NPC 对话，不改 atlas）  
- 复诊疗程与药房取药状态机合一  
- 试穿徽章一键还原 prev outfit  
- 行程链记入 dayLog「今日路线」回放  
- 长图扫码打开手机门禁 App（演示深链）

## 质量

- stageO_test **9/9** · smoke **4/4** · stage6 **12/12**
