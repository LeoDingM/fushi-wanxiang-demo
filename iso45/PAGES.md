# 浮世万象 · scene-proto-45 · Stage H 交接

旧街区；**CBD 暂停**。Stage H 补齐门禁续期、房东优惠微信、脏衣 HUD、日程待办。外观仍由 Char-A 并行轨负责——本阶段未改 `NPC_SPEC` / `appearance.js` / actors / civic exteriors。

## 交付

| 目标 | 落地 |
|------|------|
| 门禁到期+续期 | `<2h` 提醒、过期通知；续期=出示 `police_stamp` 或缴物业费（rules 固定费 ¥45）+24 游戏时 |
| 房东微信优惠 | 押金券生效后推送微信；回复「押金优惠还作数吗」 |
| 脏衣 HUD | `#needs` 上 👕 芯片；穿脏 toast → 洗衣循环 |
| 日程待办 | 门岗 / 晾衣 / 脏衣 / 门禁 / 押金券 |
| 民政回归截图 | h6 派出所（Char-A `police`/`firefighter`/`nurse` 已在树内） |

## 关键文件

- `js/stageH.js` — 本阶段全部（包裹 stageG / stageF / stageA / game.hud）
- `index.html` — stageH.js
- `tools/stageH_test.py` · `tools/capture_stageH.py`

未修改：`js/stageD.js` NPC_SPEC、`js/appearance.js`、`js/actors*.js`、`tools/build_scene.py` civic。

## 截图

- `h1-access-renew.png` — 门禁续期菜单  
- `h2-landlord-coupon.png` — 房东微信优惠  
- `h3-dirty-hud.png` — 脏衣 HUD  
- `h4-daylog-todos.png` — 日程待办  
- `h5-laundry-from-dirty.png` — 脏衣→洗衣菜单  
- `h6-civic-or-housing.png` — 派出所立绘回归（sets ready）  

## 玩法速查

1. 门禁快到期：物业公告/手机租房页 → 出示章或交 ¥45 续期  
2. 出示回执给房东后微信有优惠说明；租房页仍显示 −¥100  
3. 穿太久 → HUD「衣臭」→ 馨园 1-02 洗衣  
4. 手机日程顶部「待办」可一键前往  

## 建议 Stage I

1. 门禁与馨园门禁扫码动画（轻表现，不改外立面）  
2. 待办完成后自动勾掉 + 轻微心情 buff  
3. 打工/睡觉加速 `worn_h` 的可读提示  
4. 物业费收据进背包并可出示  
5. Char-A 消防/医院回归截图组进相册  

## 压缩包

- `/workspace/fushi-wanxiang/scene-proto-45-play.zip`
- `/workspace/fushi-wanxiang/scene-proto-45.zip`
