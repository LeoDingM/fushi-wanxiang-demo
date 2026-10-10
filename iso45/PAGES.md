# 浮世万象 · scene-proto-45 · Stage K 交接

旧街区；**CBD 暂停**。Stage K：门禁按日筛选与漏扫盘问、换装清爽心情、雨天/加班衣芯片、处方有效期、门禁↔日程待办合并。未改 Char-A `appearance.js` / civic shells / `NPC_SPEC`（仅 runtime wrap `setOutfitId`）。

## 交付

| 目标 | 落地 |
|------|------|
| 登记簿按日筛选 | `ps.scanFilterDay`；门禁 App 日按钮；漏扫警示条 |
| 昨夜未扫码盘问 | 日切无通行记录→`missed_scan_pending`；白天门岗菜单（解释/出示/敷衍） |
| 换装清爽 | 换装清 wearNotices、worn_h=0，心情+4 |
| 雨天/加班芯片 | `.cloth-chip.wet` / `.ot` 着色 |
| 处方有效期 | `rx_slip.expiresDay`（开方日+3）；过期拒医院出示；药房状态项 |
| 门禁↔日程 | 待办含漏扫/查登记簿/处方将过期；日程页跳转门禁 App |

## 关键文件

- `js/stageK.js`
- `index.html`（接在 stageJ 后）
- `tools/stageK_test.py` · `tools/capture_stageK.py`

## 截图

- `k1-scan-day-filter.png` — 门禁按日筛选 + 待办
- `k2-missed-scan-quiz.png` — 门岗漏扫盘问
- `k3-outfit-mood.png` — 换装清爽
- `k4-chip-rain-ot.png` — 雨天/加班芯片
- `k5-rx-expiry.png` — 药房处方过期/有效
- `k6-daylog-merge.png` — 日程合并门禁入口

## 玩法速查

1. 进馨园扫码 → 手机「门禁」按日看登记；隔夜不扫 → 次日门岗盘问。
2. 衣柜换装或洗衣换装 → 磨损清零、心情小涨。
3. 下雨或加班时看 HUD 衣服芯片颜色变化。
4. 开处方后 3 游戏日内取药；过期需重开。
5. 「日程」待办可跳转门禁登记簿。

## 外观并行轨（勿抢改）

- `js/appearance.js` · Char wardrobe / NPC looks
- `js/stageD.js` · `NPC_SPEC`（police/nurse/firefighter）
- civic exterior / school shells（Char-B）

## 建议 Stage L

- 门禁登记导出/分享给物业微信
- 换装与季节自动推荐（雨衣/薄外套）挂钩 weather
- 处方疗程打卡（每日服药）+ 药效 mood/energy
- 漏扫盘问与 Stage G 门岗跟进合并去重
- 日程周视图 + 待办优先级

## 质量

- stageK_test **12/12** · smoke **4/4** · stage6 **12/12**
