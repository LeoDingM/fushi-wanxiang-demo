# CHAR_READY · Stage Char-A / Char-A2 Civic-look

外观并行轨第一包。CBD 仍暂停。

## 已交付

1. **Appearance schema** — `js/appearance.js`（gender/ageBand/height/bodyType/hairId/job/layers/outfitSet；`randomNpc` / `resolveAtlas` / 衣柜）
2. **Civic NPC 制服（Char-A2）** — `police` / `firefighter` / `nurse` 经 Blender 45° 正渲（`police_cap`/`fire_helmet`/`nurse_cap`），同 office/student 品质；重着色已弃用
3. **市政外立面现代化** — 一楼玻璃 `f_shop` + plaster 上层 + 招牌；大厅 tile + 补光
4. **街面 extras** — 2–4 个随机外观路人（含 child scale 0.72）
5. **文档/测试** — `docs/APPEARANCE.md`、`tools/appearance_test.py`

## 接入

`index.html` 已挂：`actors_civic.js` →（actors）… → `appearance.js` + `civic_look.js`（在 stageF 之后）。

## 建议 Char-B

- 学校占位建筑 + 学生/教师 job
- 更多服装层换色（短袖/长袖、裙装）
- 真·儿童 mesh（替换 0.72 缩放）
- 理发店 UI 改 hairId
