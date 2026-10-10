# 浮世万象 · scene-proto-45 · Stage I 交接

旧街区；**CBD 暂停**。Stage I：馨园扫码门禁反馈、待办完成心情、穿着磨损反馈、物业费回执。外观仍归 Char-A——未改 `NPC_SPEC` / `appearance.js` / actors / civic exteriors。

## 交付

| 目标 | 落地 |
|------|------|
| 门禁扫码 | 进入 `stair_xin_*` 时扫码 overlay（住户/临时通行 / 访客演示） |
| 待办完成 | 待办消失 → 心情 +3 + 日程记一笔 |
| 磨损反馈 | worn_h 阈值 toast；HUD 芯片显示「穿n%」；下班提示 |
| 物业费回执 | `renewByFee` → 背包 `property_fee_receipt`；可出示；物业接受再续期 |
| 民政回归 | i6 消防站（firefighter atlas ready） |

## 关键文件

- `js/stageI.js`
- `index.html`（挂 stageI.js）
- `tools/stageI_test.py` · `tools/capture_stageI.py`

## 截图

- `i1-xin-scan.png` — 馨园扫码  
- `i2-todo-done.png` — 待办完成 / 日程  
- `i3-wear-pct.png` — 穿着 % HUD  
- `i4-fee-receipt.png` — 背包物业费凭证  
- `i5-present-fee.png` — 出示物业费凭证  
- `i6-civic-fire-or-hospital.png` — 消防站立绘  

## 玩法速查

1. 走近馨园进楼 → 扫码「嘀」  
2. 做完待办（收衣/续期/门岗）→ 心情小涨  
3. 穿太久 HUD 显示穿旧百分比 → 去 1-02 洗衣  
4. 交物业费续门禁 → 背包凭证 → 可再出示物业  

## 建议 Stage J

1. 访客扫码登记本（姓名备注，门岗可查）  
2. 待办完成连环：收衣→自动建议换装  
3. 磨损与天气/加班倍率 HUD 说明  
4. 物业费凭证进微信物业会话  
5. 医院护士立绘回归 + 处方出示联调  

## 压缩包

- `/workspace/fushi-wanxiang/scene-proto-45-play.zip`
- `/workspace/fushi-wanxiang/scene-proto-45.zip`
