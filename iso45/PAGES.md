# 浮世万象 · scene-proto-45 · Stage F 交接

旧街区（井槐里）玩法线继续；**CBD 扩建暂停**。本阶段在 Stage E（背包/公交动画/夜间事件/馨园1-02）之上完成「出示证件、公交报站、阳台洗衣深化、日程/晨间心情」。

## 本阶段交付（Stage F）

| 目标 | 落地 |
|------|------|
| 出示物品给 NPC | `js/stageF.js`：`presentItem` / `openPresentMenu`；敲门、信箱/公告、铁门门岗、民政窗口菜单注入「出示背包证件…」；接受/拒收/已出示过 |
| 公交打磨 | 报站铃（WebAudio）+ 下一站/到站 toast；保留 Stage E `rideBus` 动画与跳过 |
| 馨园 1-02 | `tools/layouts/room_xin_102.json`：飘窗玻璃碰撞 + 室内晾衣杆（`laundry` rack=balcony）；`layout validate 0` |
| 夜间→日志 | `ps.dayLog`；忽略/处理写日志；跨日 `applyMorningMood`；手机「日程」App |
| 质量 | `tools/stageF_test.py` 17/17；smoke 4/4；stage6 12/12；截图 `screenshots/f1`–`f6` |

## 关键文件

- `js/stageF.js` — Stage F 主模块（出示 / 报站 / 日志 / 晨间）
- `js/stageE.js` — 背包、公交动画、夜间事件（F 包裹其 rideBus / offerNightEvent / openPhone）
- `js/stageD.js` — 民政玩法 + 窗口菜单（F 注入 present_docs）
- `js/main.js` — 铁门交互可走 `SP.presentAtGate`（有证件时弹出推门/出示）
- `tools/layouts/room_xin_102.json` — 1-02 阳台碰撞与晾衣
- `tools/stageF_test.py` · `tools/capture_stageF.py`
- `index.html` — 已挂 `stageF.js`

## 截图

- `f1-present-menu.png` — 馨园一楼出示菜单
- `f2-bus-announce.png` — 公交行驶/报站 overlay
- `f3-xin102-balcony.png` — 1-02 南向飘窗阳台
- `f4-daylog.png` — 手机日程日志
- `f5-present-police.png` — 派出所窗口出示
- `f6-morning-mood.png` — 晨间心情后日程

## 玩法速查

1. 派出所报案 / 医院开方 / 消防讲解 → 背包出回执/处方/卡片  
2. 敲门、点信箱/馨园公告、推铁门（有证件时）、或民政窗口「出示背包证件…」→ 对方接受或拒收  
3. 坐公交：听叮声与报站；可跳过车程  
4. 馨园 1-02：洗衣机洗完可晾到飘窗杆（对接 shared-rules laundry）  
5. 夜间事件忽略或处理后，手机「日程」可见；第二天早上心情浮动  

## 外观并行轨（Leo 反馈 · 本轨不改外观）

派出所/消防员目前复用路人立绘，市政外立面用旧居民楼 `block()` 生成，看起来偏「老破小」而非一线城市公建。**请并行轨改外观时按下列路径下手**（勿动 CBD 扩建）：

| 关注点 | 路径 |
|--------|------|
| 民政 NPC 用哪套 sprite | `js/stageD.js` → `D.NPC_SPEC`（现：警察 `set:"uncle"`、护士 `student`、消防员 `office`） |
| 立绘打包数据 | `js/actors_data.js`（`window.ACTORS`）；图：`img/actors/*.png`；打包脚本 `tools/pack_actors.py`；源艺术 `art-pack/sprites3d/out45`（若仓库有） |
| Actor 绘制/换装 | `js/actors.js`（`SP.Actor` / `atlasName` / `ensureActor`） |
| 室内布局（家具交互，非立绘） | `tools/layouts/civic_police.json` · `civic_hospital.json` · `civic_fire.json` |
| 室内编译进引擎 | `tools/build_interiors.py`（`from_layout` → `interiors45.js/json`） |
| **街道外立面**生成 | `tools/build_scene.py` 约 L217–219：`block("civic_police"… plaster)` / hospital plaster / fire **brick**；门洞映射 L272–274 |
| 街景产物 | `scene.json`（`fade_group: civic_*` 立面件）；改完需重跑 build_scene |
| 值班/对话逻辑（可保留） | `js/stageD.js`（`onDuty` / `policeMenu` / `fireDuty` / `syncCivicNpcs`） |
| 出示证件目标表 | `js/stageF.js` → `F.OUTCOMES`（改名可同步文案） |

并行轨建议：新增专用 sprite set（如 `cop` / `firefighter`）写入 ACTORS，只改 `NPC_SPEC.set`；外立面用新 facade kit 或独立 `block` 材质，避免继续 plaster/brick 住宅壳。

## 建议 Stage G（旧街区 · CBD 仍暂停）

1. 租约材料链：出示回执/盖章证明 → 物业临时门禁 / 房东微信确认 / 轻微押金减免  
2. 洗衣全链路在 1-02：脏衣→洗→晾→收，湿度/雨天影响（规则已有，接 UI 提示）  
3. 日程日历视图（按日折叠）+ 可点回事件地点  
4. 门岗登记簿：夜间未处理来电 → 次日门岗盘问（玩法钩，仍可不改立绘）  
5. 等并行轨交付新立绘/立面后，只改 `NPC_SPEC` + rebuild scene，不重做玩法  

## 压缩包

- 轻量试玩：`/workspace/fushi-wanxiang/scene-proto-45-play.zip`
- 完整：`/workspace/fushi-wanxiang/scene-proto-45.zip`
