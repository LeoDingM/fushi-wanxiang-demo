# CHAR_READY · Stage Char-A / Char-A2 / Char-B

外观并行轨。CBD 仍暂停。近市中心扩张：学校落在东缘社区带（朝 midtown，非 CBD）。

## 已交付

### Char-A / A2
1. **Appearance schema** — `js/appearance.js`
2. **Civic NPC 制服** — police / firefighter / nurse Blender 正渲
3. **市政外立面** — 玻璃门脸 + 招牌
4. **街面 extras** — 随机外观路人（child scale）

### Char-B（本包）
1. **社区学校外立面** — `school_pri` / `school_mid` / `school_high` 在东缘南带（x≈65–101，消防站以东），招牌 `img/signs/school_*.png`
2. **学生/教师 NPC** — 进入校内大厅 spawn；小学 child_cue + 缩小比例；初/高中 student(_skirt/_long) + teacher→office
3. **剪艺理发** — 东街 `shop_barber` 外立面 + 店内 `interact:barber` 改 `hairId`（写入 `ps.flags.hairId`）
4. **服装层变体路人** — `layerx_*`（student_skirt / student_long / office_short / child_cue），不占用 Char-A `extra_*` 计数
5. **接入** — `index.html` → `charB.js`；上帝模式传送：小学/初中/高中/理发店

未做：社区诊所 stub（东缘已被三校占满，跳过以免挡学校）；真·儿童 mesh。

## 测试 / 截图 / 包
- `tools/charB_test.py` · `tools/capture_charB.py`
- screenshots/char-b1…char-b6
- zip: `scene-proto-45-charb-play.zip`（及常规 play/full）

## 建议 Char-C
- 发型立绘层 / 真 hair mesh；外套·裙装独立图层合成
- 社区诊所轻量厅（若 midtown 东缘腾空）
- 真·儿童 mesh 替换 0.62 缩放
