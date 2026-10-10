# 浮世万象 · scene-proto-45 · Stage M 交接

旧街区；**CBD 暂停**。Stage M：门岗工单、漏服惩罚、天气软推荐衣柜、周视图时段条、门禁归档/长图。

**勿改：** `appearance.js` / `gen_character.py` / civic atlases / `NPC_SPEC`（Char-A2 管制服立绘）。本轨仅 `js/stageM.js`。

## 交付

| 目标 | 落地 |
|------|------|
| 门岗→物业工单 | 核验选项后 `fileGateTicket` → 物业微信（已结案/待跟进） |
| 漏服惩罚 | 日切未打卡：mood−6 energy−5 hygiene−2 + 阿姨微信 |
| 天气软推荐 | 只读 `PLAYER_LOOKS`；收衣菜单「天气软推荐」；可调用 `openWardrobe` |
| 时段条 | 本周视图 6–22 小时条，点选看当日该时段 dayLog |
| 归档/长图 | `scanArchive`；canvas PNG dataURL；手机长图预览 |

## 关键文件

- `js/stageM.js`
- `index.html`（接在 stageL 后）
- `tools/stageM_test.py` · `tools/capture_stageM.py`

## 截图

- `m1-gate-ticket-wx.png` — 物业工单微信  
- `m2-missed-dose.png` — 漏服惩罚  
- `m3-soft-wardrobe.png` — 雪天软推荐  
- `m4-hour-strip.png` — 时段条  
- `m5-scan-archive.png` — 归档  
- `m6-long-image.png` — 长图导出  

## 玩法速查

1. 门岗核验任意选项 → 物业微信出现工单号。  
2. 服药疗程隔夜未打卡 → 心情/精力下降。  
3. 收衣后看「天气软推荐」，可打开衣柜（不改外观文件）。  
4. 日程本周点小时看明细。  
5. 门禁 App：归档 / 生成长图。  

## 建议 Stage N

- 物业工单回访（待跟进→结案）与门禁续期联动  
- 漏服连续惩罚升级 + 医院复诊待办  
- 软推荐一键试穿（仍只调 `setOutfitId`，不改 atlas）  
- 时段条拖到跳转 POI  
- 长图分享到微信好友（演示）

## 质量

- stageM_test **12/12** · smoke **4/4** · stage6 **12/12**
