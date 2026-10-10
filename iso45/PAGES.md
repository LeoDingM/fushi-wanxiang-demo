# 浮世万象 · scene-proto-45 · Stage G 交接

旧街区玩法；**CBD 扩建暂停**。Stage G 在 F 的出示/报站/日志之上兑现回执收益、洗衣闭环 UI、日程日历与门岗跟进。

**并行轨（Char-A）**：民政 NPC 立绘 / `appearance.js` / 市政外立面由对方负责。本阶段**未改** `stageD.js` `NPC_SPEC`、actors、civic exteriors。

## 本阶段交付

| 目标 | 落地 |
|------|------|
| 回执→门禁/押金 | 物业收 `police_receipt` → `xin_access_until`（24 游戏时）；房东收回执/章 → `deposit_discount` ¥100，`rentUnit` 减免 |
| 馨园1-02 洗衣 UI | 洗衣机/晾衣杆打开统一菜单：进度、洗、晾、收、演示快进晾干 |
| 日程日历 | 按日折叠；带 `place` 的条目可「前往」 |
| 门岗跟进 | 忽略夜间派出所来电 → 次日 `gate_followup_pending` → 白天盘问 |
| 外观 | 不碰 NPC_SPEC（Char-A 可能已改为专用 set） |

## 关键文件

- `js/stageG.js` — 本阶段全部逻辑（包裹 stageF present/morning/daylog、stageA rentUnit）
- `js/stageF.js` — 出示/日志基础（G 只包裹，不重写）
- `index.html` — 挂载 stageG.js
- `tools/stageG_test.py` · `tools/capture_stageG.py`

未修改（留给 Char-A）：`js/stageD.js` NPC_SPEC、`js/appearance.js`（若有）、`tools/build_scene.py` civic blocks、`js/actors*.js`。

## 截图

- `g1-access-discount.png` — 出示后租房页门禁/优惠提示  
- `g2-laundry-menu.png` — 1-02 洗衣菜单  
- `g3-laundry-hang.png` — 阳台杆晾衣  
- `g4-daylog-calendar.png` — 日程折叠日历  
- `g5-gate-followup.png` — 门岗夜间来电跟进  
- `g6-deposit-rent.png` — 押金优惠提示  

## 玩法速查

1. 派出所拿回执 → 出示物业 → 馨园临时门禁；出示房东 → 租房押金 −¥100  
2. 馨园 1-02：脏衣→洗衣机→晾阳台杆→（时间/演示快进）→收衣  
3. 手机「日程」按日展开，可跳转公交站/馨园/门岗等  
4. 夜里忽略派出所电话 → 第二天门岗会拦你问话  

## 建议 Stage H

1. 门禁到期提醒 + 续期（再出示章/交物业费）  
2. 押金优惠与微信房东会话脚本分支  
3. 洗衣脏衣来源（换衣服/打工）提示 HUD  
4. 日程「待办」：未处理门岗/未收衣服  
5. 合并 Char-A 立绘后做一轮民政场景回归截图（不改玩法）  

## 压缩包

- 轻量：`/workspace/fushi-wanxiang/scene-proto-45-play.zip`
- 完整：`/workspace/fushi-wanxiang/scene-proto-45.zip`
