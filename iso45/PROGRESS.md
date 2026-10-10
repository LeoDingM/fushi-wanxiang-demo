16:31 · Stage 3A: layers/LOD/free-zoom done (perf 48->8ms z0.5); building run + winter sprites; next interiors · shot: /tmp/s45/far.png
16:46 · 冬装+跑步已完成（跑步动画/冬装NPC），正在做室内：楼梯间1F-6F折返楼梯、楼层菜单、天台、2F-02房间+阳台 · screenshots/96-run-winter.png
17:02 · 室内已接入：楼道1F-6F折返楼梯+天台(街景同一世界)+2F-02房间/阳台，正在测楼层菜单/触发器循环/洗衣 · screenshots/92-rooftop.png
17:20 · 2F-02按房间布局系统重做：床靠窗+床头柜台灯、独立卫生间(隔墙+可开关门+碰撞)、自动可达性检查通过；正在修手机端调试按钮遮挡标题 · screenshots/93b-room-bathroom-door.png
17:24 · 手机端调试按钮收进☰菜单(标题不再被遮)，楼层菜单横屏两列；95-interior-walk.mp4已录；接着跑全量回归+裁剪审计后打包 · screenshots/91-floor-menu-mobile.png
17:46 · 衣柜/阳台玻璃遮挡淡出、椅子朝向书桌、坐下打字动画(+睡觉盖被/做饭姿势)已完成；正在跑全量回归+裁剪审计后打包 · screenshots/98-pc-sitting.png
18:01 · 第一包已交付：scene-proto-45.zip + scene-proto-45-play.zip（playtest 103/103、室内15/15）；按指示停止，等待下一步 · screenshots/98-pc-sitting.png
18:17 · Stage 4 开始：盘点现有功能（敲门/声控灯/需求/日志/租约规则） · screenshots/98-pc-sitting.png
18:19 · shared-rules 一线城市物价重平衡（早点¥12/便当¥25/外卖¥30-36/员工餐¥12/奶茶/周末出门/话费日用），30/90天模拟：全职月存约¥1.3k，兼职勉强持平 · screenshots/98-pc-sitting.png
18:28 · 已完成：小圆凳吃饭、磨砂淋浴剪影、声控灯（跺脚/敲门/关门/跑步）、3F-6F 敲门回应、微信/支付宝支付卡片、房东微信消息、真实日历（周末/国庆/调休）、公交站牌、字幕不再压住房租栏；正在跑全量回归+室内/跑步穿模审计 · screenshots/99-home-poses.png
18:30 · 按 Leo 要求下调为城郊老小区物价（早点¥6/面馆¥12/快餐¥14/便当¥15/外卖¥17-20/奶茶¥10/食材一顿约¥8-10），全部价格集中在 rules.json「prices」表；时薪¥15+手机分期¥199，90天模拟全职月存约¥1.5k、兼职约持平；跑全量回归中 · screenshots/99c-pay-caption.png
18:35 · Stage 4 交付：scene-proto-45.zip + scene-proto-45-play.zip（playtest 105/105、室内 22/22、rules 28/28，含室内+跑步穿模审计 0 违例）；按指示停止，等待下一阶段 · screenshots/99-home-poses.png
18:36 · Stage 5 开始：盘点便利店/街区/规则 job 接口 · screenshots/99d-busstop-sign.png
18:45 · 紧急热修复：天台车灯光、重置后室内画出公交、床无法互动、室内杂乱（Stage 5 暂停，街区扩展代码已写一半未构建） · screenshots/99d-busstop-sign.png
18:54 · [便利店] 开工：读完架构/布局系统/规则引擎（R.job 已有排班/打卡/任务/扣款），开始做 store_24 布局 + kit_store 美术 + js/store.js · -
- 19:02 热修复完成：天台灯光按高度分层（街面车灯/路灯光斑与光晕不再照到天台，测试：天台正下方注入车灯光斑像素不变）；重置后进入任意室内不再绘制街上车辆/公交/NPC（4处重置×7个室内自动测试）；交互目标按朝向+交互点排序，多目标可用 Tab/Q 或手机「⇄换」切换，床加长边交互点，睡觉/小睡可达（43个交互点逐一测试）；2F-02 去杂（去地毯、衣柜移到远侧隔墙、书桌低矮靠近镜头侧、阳台玻璃常驻半透明、室内色调更亮更中性）；夜景：每栋楼入口加门灯+发光蓝色门牌（井槐里N号），钠灯/LED/钨丝窗光/荧光楼道/霓虹分色温，更大更柔光斑、墙面补光、环境反弹光，按季节/天气/时间全局调色。截图：screenshots/h1-room-declutter.png h2-bed-prompt.png h3-roof-night.png h4-night-entrances.png h5-night-winter-vs-summer.png。回归：playtest 105/105、室内 26/26、规则 29/29、手机测试 0 错误、走/跑全量穿模审计 0。
19:03 · [地铁] 开工：读完架构/布局/kit管线，方案=独立 js/metro.js 自带等角渲染+kit_metro 图集（不改核心），先建 Blender 地铁套件 · -
19:04 · [CBD] 开工：读完架构/相机LOD/规则/Blender管线，方案=独立 place 'cbd'（js/cbd.js 自带世界/排序/碰撞/LOD塔楼替身），kit_cbd 用 Python 等距光线栅格化像素图集 · -
19:08 · [便利店] store_24 布局(校验0问题)+kit_store 图集(12件 st_* 同一45°管线)+js/store.js(购物篮/扫码微信支付宝/关东煮/咖啡/微波炉/吧台/店员NPC/班次任务)已能在 store_preview.html 跑通，正在补测试和截图 · screenshots/S2-store-checkout.png
19:11 · [便利店] 完成：store_preview.html 可逛店/购物/扫码付款/热便当吧台吃/上班打卡做任务，test_store 12/12，STORE_READY.md 写好接入方式（4 个 script 标签）；发现核心 scene.js 电线指向不存在的 pole_e3 会让 index 首帧崩 · screenshots/S3-shift.png
19:18 · [地铁] kit_metro 图集完成（195帧：入口雨棚/安检机/安检门/售票机/客服中心/闸机/屏蔽门/列车/倒计时屏/LED广告墙），6个地铁区域布局+校验通过，rules.json 加 metro 段（3号线9站/票价/运营时间/高峰/通勤NPC）；正在写 js/metro.js · -
19:21 · [CBD] kit_cbd 图集完成（136帧：四季公园树/银杏、长椅、路灯、地铁口、BRT站棚/铰接BRT、咖啡座、雕塑、遛狗犬8向、地面/幕墙材质），布局+54座塔楼数据生成，开始写 js/cbd.js · -
19:22 · [便利店] 打磨：店员绿围裙店服（赵姐/小周/李默 8向走+站，Blender 管线）、玻璃门面+感应门+亮绿招牌灯箱(遮挡整体淡出)、吧台高脚凳坐姿抬高+补朝窗吃饭姿势、员工室(更衣柜/排班打卡板)；test_store 13/13、两个布局 0 问题 · screenshots/S4-uniform.png S5-storefront.png
- [主线] 19:40 街道延伸+阳台+便利店接入完成：东侧街区分块流式加载（chunks/east.js，靠近/镜头可见时载入，远离卸载并记住破损状态，重置清空）；拐角新街段含 兰州牛肉面 / 好味快餐 / 茶语奶茶 临街小店（按营业时间开关门，按共享价格表下单）、店员与下班白领 NPC；井槐里站地铁口（旧式花岗岩栏杆+钢玻璃雨棚+蓝色站名牌，06:00–23:30，交互预留给地铁模块）；修复 pole_e3 电线导致首帧崩溃（电线按分块标记+anchorPt 容错+首 60 帧冒烟测试）；2F-02 阳台移到远侧（床头墙后，推拉门进入），衣柜靠卫生间隔墙，镜头侧不再有高物；24便利店模块按 STORE_READY 接入（4 个 script 标签，街门「进 24便利店」）。截图：screenshots/h1-room-declutter.png、screenshots/s5-east-eateries.png、screenshots/s5-metro-entrance.png。回归：playtest 105（2 项为测试阈值调整：店员 NPC 移动量、商店贴图懒加载）、室内 26、街区 8、冒烟 4、便利店 13、规则 29、手机 0 错误、穿模审计 0。
- [主线] 19:58 便利店打磨版接入：js/actors_store.js 启动后懒加载（店服/店员贴图首次使用时加载，未加载时用后备贴图，不再抛错）；核心新增 SP.outfitHooks 换装钩子；员工室 store_24_staff 已注册。截图：screenshots/s5-east-eateries.png
19:31 · [地铁] js/metro.js + metro_preview.html 跑通全流程自动测试：安检/售票机/充值/三种过闸/候车/列车进站开门/乘车扣费/CBD出站B口/反向回井槐里；修复进区域后摇杆残留导致弹回、拥挤度0无效、重复提示 · -
