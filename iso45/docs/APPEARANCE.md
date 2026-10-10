# 外观系统 · APPEARANCE（Stage Char-A 起步）

面向 Leo 长期角色管线：多职业 NPC、童/成年体型、衣柜换装、理发店发型、分层服装。Char-A 落地 schema/随机/衣柜桩；**Char-A2** 用 Blender 正渲替换 civic 制服（`police_cap`/`fire_helmet`/`nurse_cap`）。完整美术后补。

## 当前 API（`js/appearance.js`）

```js
SP.appearance.schema(partial)
SP.appearance.randomNpc(seed, jobHints)  // jobHints: string job | {job,gender,ageBand,...}
SP.appearance.resolveAtlas(npcOrAppearance) // → atlas set name via outfitHooks / JOB_ATLAS
SP.appearance.applyToActor(actor, appearance) // set + drawScale + radius
SP.appearance.openWardrobe()                // 衣柜菜单（li_mo / li_mo_uniform / li_mo_w）
SP.appearance.setOutfitId('casual'|'uniform'|'winter')  // 写入 ps.flags.outfitId
```

字段：

| 字段 | 值 |
|------|----|
| gender | male / female |
| ageBand | child / teen / adult / elder |
| height | short / avg / tall |
| bodyType | slim / avg / heavy |
| hairId | short_black / bob / …（理发店钩子） |
| job | police / firefighter / nurse / office / student / … |
| layers | { top, bottom, outer, shoes } |
| outfitSet | 现有 atlas 回退名 |

### 儿童体型（过渡）

尚无独立 child mesh：**adult 图集 + `drawScale ≈ 0.72` + 更小 radius**。Teen ≈ 0.88。真·儿童网格列入 Char-B。

### 换装

- 室内 `wardrobe` 互动 → 衣柜菜单
- 手机主屏「👔 换装」、上帝模式「衣柜换装 / 下一套衣服」
- 持久化：`G.ps.flags.outfitId`
- 便利店上班店服仍由 `store.js` 直接改 `player.set`；appearance hook 在 store 场景让位

### 发型

`hairId` 已进 schema；**理发店玩法未做**——菜单里有「理发店换发型（未开放）」占位。

## Civic 制服（本阶段已交付）

| 职业 | atlas | 来源 | 做法 |
|------|-------|------|------|
| 警察 | `police` | Blender `police.json` + `police_cap` | 藏青执勤服 + 大盖警帽（前檐+帽徽） |
| 消防员 | `firefighter` | Blender `firefighter.json` + `fire_helmet` | 橙夹克 + 黄盔（圆顶/后檐/短前檐） |
| 医护 | `nurse` | Blender `nurse.json`（无帽+bun） | 浅蓝/白 scrub + 发髻（弃纸帽） |

生成（Char-A2）：`art-pack/sprites3d/{police,firefighter,nurse}.json` → `build45.sh` → `out45/` → pack → `img/actors/{police,firefighter,nurse}.png` + `js/actors_civic.js`
`tools/recolor_civic_actors.py` 已弃用（Leo 拒收矩形帽重着色）  
接线：`stageD.NPC_SPEC` + `js/civic_look.js`（运行时再保险）

## 市政外立面

`tools/build_scene.py`：派出所/医院/消防一楼改为 **`f_shop` 玻璃门脸**，上层 plaster，附加 `f_shopsign`；消防不再用 brick 住宅壳。  
大厅墙面 layout `finish: tile`（浅色瓷砖）+ `civic_look` 室内补光。  
街面招牌文字叠层：`civic_look.drawSignLabels`。

## 分层服装美术管线（路线图）

1. **Char-A / Char-A2**：schema + 衣柜桩；civic 制服改为 Blender 45° 正渲（非重着色）  
2. **Char-B**：学校占位（小学/初中/高中楼 + 学生/教师 NPC 类）；更多 top/bottom 换色层；试做 1 套 true child mesh  
3. **Char-C**：理发店改 `hairId`；外套/裙装独立图层合成；男女体型骨架差  
4. **Char-D**：职业套装库（保安/快递员/厨师…）与天气 outer 自动层

## 相关文件

- `js/appearance.js` · `js/civic_look.js` · `js/actors_civic.js`
- `tools/recolor_civic_actors.py` · `tools/appearance_test.py`
- `docs/APPEARANCE.md`（本文件）· `CHAR_READY.md`
