# 浮世万象 · scene-proto-45 · Stage J 交接

旧街区；**CBD 暂停**。Stage J：门禁登记簿、收衣换装链、磨损倍率说明、物业费微信、处方出示打磨。未改 Char-A `appearance.js` / `NPC_SPEC`（仅调用 `openWardrobe`）。

## 交付

| 目标 | 落地 |
|------|------|
| 扫码登记簿 | `ps.scanLog`；物业/门岗菜单「查阅」；手机门禁 App |
| 收衣→换装 | `collect_clothes` 后建议换装；可走 rules 换衣或 `SP.appearance.openWardrobe` |
| 磨损说明 | HUD 芯片 title + 点击 toast（上班×1.5 / 睡觉×0.3 / 季节系数） |
| 物业费微信 | 续期缴费后推送物业会话；回复「凭证怎么看」 |
| 处方+护士 | 医院出示文案加长；护士场景回归截图 |

## 关键文件

- `js/stageJ.js`
- `index.html`
- `tools/stageJ_test.py` · `tools/capture_stageJ.py`

## 截图

- `j1-scan-log.png` — 门禁登记簿  
- `j2-outfit-suggest.png` — 收衣换装建议  
- `j3-wear-tip.png` — 磨损倍率提示  
- `j4-fee-property-wx.png` — 物业微信缴费  
- `j5-rx-hospital.png` — 出示处方  
- `j6-nurse-or-scan-menu.png` — 护士立绘回归  

## 玩法速查

1. 进馨园扫码 → 手机「门禁」或物业菜单看登记簿  
2. 1-02 收干衣 → 弹出换装建议（系统换衣 / 外观衣柜）  
3. 点 HUD 衣服芯片看磨损倍率  
4. 交物业费 → 微信物业有凭证对话  

## 建议 Stage K

1. 登记簿按日筛选 + 门岗盘问引用「昨晚未扫码」  
2. 换装后清除 dirty-wear toast / 心情小 buff  
3. 雨天/加班磨损倍率动态写进芯片颜色  
4. 处方过期机制（游戏日）与药房联动  
5. 门禁 App 与日程待办合并入口  

## 压缩包

- `/workspace/fushi-wanxiang/scene-proto-45-play.zip`
- `/workspace/fushi-wanxiang/scene-proto-45.zip`
