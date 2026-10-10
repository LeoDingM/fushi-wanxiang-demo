# CHAR_READY · Stage Char-A / A2 / B / C

外观并行轨。CBD 暂停。学校在东缘社区带。理发店外立面由并行修复轨挪至人行道（y≈6.5）。

## Char-C（本包）— 发型多样性 + 女性路人 + 彩色街头穿搭

### 发型 hairId（22）
**男 (11):** m_buzz 寸头 · m_short 短碎发 · m_sidepart 偏分 · m_bowl 锅盖 · m_undercut 侧铲 · m_crew 平头 · m_spiky 刺头 · m_mid 中分 · m_brown 短棕 · m_grey 花白 · m_bald 光头

**女 (11):** f_bob 波波 · f_long 长直 · f_wave 齐肩波浪 · f_pony 马尾 · f_bun 丸子 · f_twin 双马尾 · f_lob 锁骨发 · f_hime 姬发式 · f_air 空气刘海 · f_brown_long 棕长 · f_grey_bob 灰白波波

视觉：silhouette 叠加（非 civic）；理发店分男女菜单；真·发型 mesh 后续。

### 女性路人
- `randomNpc` 未指定性别时 **♀ ≈ 48%**
- 街面 extras/layerx：**♀ ≈ 60%+**；性别驱动裙装/dress atlas
- 路线 NPC：student / tea_girl / vendor / walker_e → 女装+女发

### 彩色街头穿搭（12 fit_* atlas，recolor 无 Blender）
hoodie / oversized 黄 Tee / athletic / tee_red / dress / skirt_teal / shirt / knit / jacket / jeans / cargo / work  
衣柜增加「街头 · …」10 套；`randomNpc` 平民走彩色 outfit（**不碰** police/firefighter/nurse）。

### 社区诊所
东缘南带已被三校占满 → **跳过**（见 PROGRESS）。

## 测试 / 截图 / 包
- charC_test 17/17 · appearance 12/12 · screenshots/char-c1…c6
- zip: `scene-proto-45-charc-play.zip`（lite <25MB）

## 建议 Char-D
- 真·发型 / 服装 mesh 分层合成；office_skirt 独立图集
- 社区诊所厅；理发店搬进人行道后的室内灯光打磨
