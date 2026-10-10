# NPC 日程 + 好感（npc_schedule）

并行轨：街坊 NPC 按游戏时钟走 **日/夜日程**，不再纯随机游走；玩家 **打招呼 / 闲聊** 提升好感，并有 toast + 小 HUD。

## 文件

| 路径 | 说明 |
|------|------|
| `js/npc_schedule.js` | 本轨唯一实现（wrap `SP.npcs.update` + `SP.actions.interact`） |
| `index.html` | 在 `households.js` **之后** 加一行 script |
| `NPC_SCHEDULE.md` | 本文 |
| `screenshots/npc-sch1…4.png` | 截图 |
| `tools/npc_schedule_test.py` | 冒烟/断言 |
| `tools/capture_npc_sch.py` | 截图脚本 |

**不改**：`stageR.js` / `stage*.js`、`charB.js`、`appearance.js`、civic atlases、`store.js`、`metro.js`、`cbd*.js`、`gen_character.py`、`npc.js` 本体（只 wrap）。

## 日程 NPC（≥4）

| id | 称呼 | 白天 | 夜晚 |
|----|------|------|------|
| `office` | 上班族小陈 | 通勤 → 上班点（东侧人行道/工作路点） | 回家隐藏 |
| `student` | 学生小林 | 通勤 → **学校**路点（Char-B `school_mid` 街面，否则 `[5,-6.5]`） | 回家隐藏 |
| `vendor` | 王阿姨 | 出摊（早点摊） | 回家隐藏 |
| `uncle` | 张大爷 | 遛弯 / 歇脚 | 回家隐藏 |

另：夜间对 `walker_e` / `rider` 做街面稀疏（`hidden`），早晨恢复。

## 好感

- `E` 靠近 NPC（优先于远处物件）→ `SP.npcSchedule.greet`
- 每次 +5～+9（已熟络时衰减），上限 100
- Toast：`名字「台词」 好感 +Δ → N`
- HUD `#npc-aff-hud`：名字 / 好感 / 当前日程相位
- 持久化钩子：`SP.game.ps.npcAffinity`（若 game.ps 存在）

## API（测试 / 上帝）

```js
SP.npcSchedule.status()
SP.npcSchedule.greet(npcOrNull)
SP.npcSchedule.chat(npcOrNull)
SP.npcSchedule.snapToSchedule()   // 瞬移到当前槽位（截图用）
SP.npcSchedule.getAffinity(id)
__proto.greetNpc(id?)
__proto.npcSched()
```

## 打包

`scene-proto-45-npc-sch-play.zip`（避免覆盖其它轨的 play.zip）。
