# 《浮世万象》Web Demo · 井槐里12号（v2：动画 + 昼夜 + FX + NPC）

浏览器可玩切片：街口外景 ↔ 2F-02 室内。HD-2D 概念图做背板，李默 8 方向精灵动画，游戏内时钟驱动昼夜换图 + 调色，蒸汽 / 雨 / 窗光闪烁，摊主与路人 NPC。

## 打开

```bash
cd /workspace/fushi-wanxiang/web-demo
python3 -m http.server 8765      # → http://127.0.0.1:8765/
```

也能直接 `file://` 打开 `index.html`（全部是经典 `<script>`，没有 ES module / fetch；manifest 只给工具用）。

## 操作

| 键 | 作用 |
|---|---|
| WASD / 方向键 | 移动（可斜走，8 方向朝向） |
| E | 交互：单元门 / 早点摊点单 / 快递柜 / 睡觉 / 电脑 / 做饭 / 租约 / 出门 —— 李默先走到交互点、转向目标，再播 3D 动作片段（期间锁移动）；下雨时附近没热点 = 撑伞 / 收伞 |
| U | 下雨时撑伞 / 收伞（撑伞走路是单独渲染的 8 方向 uwalk / uidle 帧，动作同普通走路） |
| T | 测试用：时间跳到下一档（上午→中午→黄昏→夜晚→深夜→清晨），1.4 s 平滑过渡 |
| R | 测试用：切换今晚天气 晴 ↔ 雨（锁定，约 2.5 s 交叉淡化） |
| Esc | 关闭面板 |

时钟：1 秒现实 = 1 分钟游戏时间（`FW.GAME_MIN_PER_SEC`）。

### 手机 / 触屏

触屏设备（`pointer: coarse` / `maxTouchPoints>0`）或 `?touch=1` 时显示屏幕控件（`?touch=0` 强制隐藏；触屏笔记本一按键盘就自动隐藏）：

| 控件 | 作用 |
|---|---|
| 左下摇杆（左半屏任意位置按下即浮动出现） | 模拟量：方向吸附到 8 个精灵方向，推得越远走得越快（35%–100% 速度，走路帧随实际距离同步） |
| 右下「互动」 | = E（点单面板里 = 确认）；靠近热点时发光，提示文字变成「点「互动」…」 |
| ⏩ 时间 / ☂ 天气 | = T / R |

竖屏：画布贴宽、比 16:9 更高（约 390×413 css px），镜头跟随李默裁出一个更高的视窗（可见世界高约 600 px，`FW.PORTRAIT_VIEW_H`；`?zoom=` 可改），画布 backing store = CSS 尺寸 × DPR，像素 1:1 清晰；画布下方是「dock」：体力/心情/饱腹/金钱 + 今日小任务（吃早点 / 看招聘 / 睡一觉，完成打勾）+ 一句状态提示，再往下是摇杆和按钮；toast 移到画布顶部。横屏 / 桌面不变：16:9 贴高居中，HUD 缩小叠在画面上。面板 / toast 在手机上居中、字号 ≥13–17 px、按钮 ≥46 px 高。禁止页面滚动、双指缩放、双击缩放（viewport meta + `touch-action` + 事件拦截）。键盘玩法不变。

### 天气

室内夜晚同样分晴 / 雨：`img/bg/int_night_clear_window.png` 是只含窗格的 RGBA 补丁（`tools/build_int_night_clear.py`：日景窗外楼群调暗 + 天空渐变 + 城市辉光 + 星点，保留原图亮窗），加载时贴到 `int_night.jpg` 上得到晴夜室内——窗外以外每个像素与原图完全一致；下雨时交叉淡化回原雨夜图，代码画的窗玻璃雨痕（流水 + 水珠，按补丁 alpha 裁到窗格）只在下雨时出现。

夜晚默认是**晴夜**（`img/bg/ext_night.jpg`）；下雨是天气状态：每天 05:00 换天，第 1 天晴，之后每晚约 35% 下雨（确定性哈希，`?seed=N` 换序列）。`?weather=rain|clear` 锁定，`?time=rain` 隐含下雨，R / ☂ 测试切换。背板四层按权重精确混合（日 → 黄昏 → 晴夜 → 雨夜，第 k 层 alpha = w_k / Σw_0..k），雨量 / 雨夜底图 / 湿地冷光一起随 `FW.wet` 渐变。

## 实现

| 功能 | 说明 |
|---|---|
| 玩家动画 | 8 方向，8 帧走路 @10fps，静止切 idle；按场景 `actorScale` 缩放（室内更大）；脚底柔和椭圆阴影；随时段环境光染色 |
| 昼夜 | 外景四张背板 day / dusk / night（晴）/ rain 按时钟 × 天气权重交叉淡化；室内 day / night 同理；全屏调色（multiply+screen+饱和度）按关键帧插值 |
| 停步 | 走路中途松手：先把这一步走完到最近的触地帧（0 / 6，最多 2 帧，已在双支撑 1 / 7 则原地），再 2 帧把 idle 0 溶入（40% / 75%），共 3–4 帧 × 0.05 s，然后进入呼吸循环；途中再推摇杆/按键会从当前帧接着走 |
| FX | 程序粒子：早点摊 + 灶台蒸汽；夜雨雨丝 + 地面溅点；窗户/路灯/台灯/显示器光晕，平滑噪声闪烁 |
| NPC（3D 精灵） | 王阿姨（围裙+白帽，做早点循环 8 帧、递餐 6 帧、早点车道具）、巡逻大爷（光头背心短裤凉拖，聊天坐凳摇蒲扇 8 帧）、外卖骑手（电动车骑行 8 帧，三辐轮毂按移动距离转动 + 停车帧）、上班族、学生；行人全部 8 方向 × 12 帧走路 + 4 帧待机，与李默同一管线/相机/调色板规则 |
| NPC 日程 | `js/schedule.js` 纯数据（路点图 + 每人日程块 + 天气条件）+ `js/npcbrain.js` 引擎无关小状态机（无 DOM、无运行时随机）：按游戏时钟算出「此刻该在哪、做什么」。王阿姨 05:30 出摊（早点车淡入）→ 06:00–10:30 做早点/递餐 → 10:30 收摊 → 回家；大爷 07:00–08:30 沿固定路线晨练（每个路点停 2 分钟），14:00–18:00 坐在楼门口聊天，18:00 回家，下雨不出门；上班族 ~07:55 出门、19:00 回来；学生 07:20 上学、17:10 回家；骑手按时段生成送单（午高峰 11–13 每 9 分钟、晚高峰 17–20 每 10 分钟，平时 30–40 分钟，22–07 约 150 分钟一单），沿马路到 12 号门前停 1.5 分钟再走 |
| NPC 运动 | 显示位置以限速 + 限加速度跟随日程位置（起步/刹车平滑，日程本身也是梯形速度曲线），不瞬移；时间跳跃 > 3 分钟（睡觉 / T）直接对齐日程；朝向由速度方向决定，±(22.5°+14°) 滞回 + 0.12 s 保持 + 逐 45° 转身，不抖；走路/车轮帧按实际移动距离推进；挡路时先停 0.5 s，再侧移 26 px 绕过玩家，事后归位；玩家撞到 NPC/早点车脚底椭圆会停住，但永远可以往外走（不会卡死） |
| 交互动作 | 李默动作片段（`art-pack/sprites3d/li_mo_actions.json`，同一模型）：开门 6 帧（进门/出门）、买早点 6 帧（递钱→接袋子，和王阿姨递餐同步，效果在接到袋子那帧结算）、坐下用电脑（坐下 2 帧 + 打字循环 4 帧 + 起身倒放）、上床睡觉（坐起→后仰→躺平→呼吸，画在床上；黑场睡醒后倒放起身）、快递柜取件 6 帧（开柜门→伸手→抱出箱子，每天一件，心情 +4）、撑伞 4 帧 + 撑伞走路/待机整套；流程：走到 spot → 转向 face → 播放（锁移动）→ 回 idle |
| 交互 | 原有全部保留；早点摊「豆浆油条 ¥8」（饱腹 +28、心情 +3、−¥8、+12 分钟）；睡觉：白天=小睡到 19:40，晚上=睡到次日 07:00，黑场 + 分镜静帧淡入淡出，灯光随之切换；新增快递柜 |

## 文件

```
index.html / style.css
js/config.js      常量、场景（可走多边形、热点、蒸汽点、窗光位置）、调色关键帧、时间档
js/assets.js      图片预加载
js/timeofday.js   时钟→背板权重 / 夜晚系数 / 调色
js/sprites.js     精灵绘制（脚底锚点）、阴影、环境光染色、李默动画状态机
js/fx.js          蒸汽、雨、灯光
js/schedule.js    NPC 日程纯数据（路点图、日程块、送单时段；可原样搬到 Godot WorldCore）
js/npcbrain.js    日程规划/采样小状态机（planDay / sample / path，引擎无关，node 也能 require）
js/npc.js         NPC 显示层：平滑跟随、朝向滞回、按距离推进动画、避让玩家、早点车、绘制
js/ui.js          HUD、提示、toast、面板、黑场
js/game.js        主循环、输入（键盘 + FW.touchInput）、天气、镜头、碰撞、交互、URL 参数
js/mobile.js      手机布局（16:9 适配竖/横屏）、虚拟摇杆、互动/时间/天气按钮、防滚动/缩放
img/bg/           清理过的背板（去掉概念图里自带的 HUD/人物/标注；Telea + 自写样本块填充）
img/bg/ext_night.jpg  晴夜：ext_day 调夜色（降饱和/降明度/偏蓝 + 屋顶月光）+ 从 ext_rain 抠暖光（窗/路灯/便利店/摊位，ECC 对齐，湿地反光与打伞路人去掉）— tools/build_night.py，非新 AI 图
img/sprites/li_mo walk_{dir}_{0-11}.png + idle_{dir}_{0-3}.png（3D 渲染像素，144×204，地面原点 (72,189)，palette.json）
                  + 动作片段 door/buy/sit/mail/umbrella/uwalk/uidle_{dir}_{i}.png、lie_BED_{0-3}.png（actions.json）
img/sprites/npc3d/<vendor|uncle|rider|office|student>/  NPC 3D 精灵（<clip>_{dir}_{i}.png + palette.json；骑手 160×224，原点 (80,189)）
img/bg/int_night_clear_window.png  晴夜室内窗格补丁（运行时合成到 int_night.jpg）
img/sprites/li_mo_ai_backup/  旧 AI 手绘帧备份（8 帧，锚点 (72,200)）
img/sprites/npc/  旧 4 帧 AI NPC（已不加载，留作对比）
img/story/        点单、睡觉分镜
tools/slice_sprites.py     切帧 + 去底 + 去底座 + 归一化 → PNG + manifest
tools/clean_backgrounds.py 背板清理
tools/shoot.py / capture_all.py  headless Chrome 截图
tools/playtest.py          CDP 自动化冒烟（键盘 + 触屏 + 天气 + 停步 + 竖屏 dock + 晴/雨室内 + NPC 日程 + 交互动作，68 项）
tools/capture_clips.py     ?manual=1 逐帧录 NPC 行走 / 交互动作 GIF（screenshots/40-*, 43-*）
tools/build_int_night_clear.py  生成晴夜室内窗格补丁
tools/capture_mobile.py    手机截图 390×844 / 844×390（触屏模拟，DPR 2）→ screenshots/30-mobile-*.png
tools/build_night.py       生成 img/bg/ext_night.jpg
tools/walk_strip.py        旧 AI 走路帧总览图 + GIF
tools/capture_walk_gif.py  ?manual=1 逐帧步进录游戏内行走 GIF（screenshots/20-street-walk.gif）
```

### 李默帧来源（2026-10-10 起：3D 渲染）

全部 8 方向 × (12 帧走路 + 4 帧待机) 由 `art-pack/sprites3d/`（Blender 4.2 低模 + 程序步态 + 像素化）渲染，无镜像、无合成：
同一模型同一调色板，脸/发型/衣服逐帧一致；`./build.sh li_mo.json` 约 15 秒重建，再拷到 `img/sprites/li_mo/`。
动画：走路相位 = 实际移动的地面距离 / 步幅（113.3 px/周期，竖直方向按 sin28° 还原透视），脚不打滑；
转向逐 45° 过渡（0.045 s/档）；停下播 4 帧呼吸。旧 AI 帧在 `img/sprites/li_mo_ai_backup/`。

## 截图 URL 参数

`scene=interior` · `time=day|noon|dusk|night|rain|late|dawn|HH:MM` · `weather=rain|clear` · `seed=N` · `touch=1|0` · `zoom=N` · `clock=stop` · `x= y=` · `face=E|SW…` · `walk=1&frame=N&freeze=1`（冻结在走路第 N 帧，N=0–11）· `manual=1`（游戏不自走，由 `__fushiDemo.step(dt, keys)` 步进）· `order=1` · `lease=1` · `near=door` · `uncle=0..1` · `riderp=0..1` · `toast=0` · `ui=0` · `npcnames=1`（NPC 头顶显示「名字 · 当前日程动作」）。旧的 `uncle=` / `riderp=` 已删除：NPC 只跟日程走，用 `time=HH:MM` 摆位置

`python3 tools/capture_all.py` 重拍全部截图（`tools/capture_mobile.py` 拍手机图，`tools/capture_clips.py` 录 40/43 GIF；工具每次用随机空闲 DevTools 端口，`CDP_PORT=` 可固定）；`python3 tools/playtest.py` 跑冒烟（需本地 8765 服务）。

## 打包 / 发布

`web-demo.zip`（上级目录）= 可玩静态包（不含 screenshots/、tools/、li_mo_ai_backup/），解压后双击 `index.html` 即可（file://），或丢到任意静态托管（GitHub Pages / Netlify / OSS）用手机打开。
