/* Site204 · 鹰山宋城街具点景：石灯笼/石凳/花缸/挂灯杆 atlas kitbash。
 * Site212 · 巷口/入口影壁照壁点景 densify（aq_yingbi/aq_zhaobi；不堵主路）。
 * Site215 · 拴马桩/上马石/石敢当/路牙石标 densify（aq_shuanma/aq_shangma/aq_ganddang/aq_curb_marker；御街·南薰门外·府邸门前）。
 * Site216 · 漏窗/花墙/透空砖雕 densify（aq_window_lou/aq_wall_huaziang/aq_brick_toukong/aq_lattice_wall；艮岳苑·豪宅侧墙·巷墙）。
 * Site217 · 井亭/路亭/小牌坊 densify（aq_jingting/aq_luting/aq_paifang_s；御街交叉口·汴河岸·艮岳苑入口；点景不堵路）。
 * Site218 · 垂花门/小门楼/门罩/门柱石 densify（aq_chuihua/aq_menlou_s/aq_menzhao/aq_menzhu；豪宅·四合院门前·横巷口；点景不堵主路）。
 * Site219 · 太湖石/叠石/小峰石/石附苔 densify（aq_rock_taihu/aq_rock_dieshi/aq_rock_peak_s/aq_rock_moss；豪宅庭院池边·艮岳苑外围·曲廊侧）。
 * Site220 · 美人靠/飞来椅/坐槛/廊凳 densify（aq_meirenkao/aq_feilaichi/aq_zuokan/aq_bench_lang；曲廊侧·井亭路亭旁·汴河岸观景；点景不堵路）。
 * Site221 · 匾额/对联/小字牌/垂挂牌 densify（aq_biane/aq_duilian/aq_zhaopai_s/aq_hanging_sign；店铺门楣·宅门·巷口·亭侧；与 site201 招牌互补）。
 * Site222 · 抱鼓石/方门墩/小石炉 densify（aq_baogu/aq_mendun/aq_stone_lu；宅门两侧·垂花门前·巷口·富户院门）。
 * Site225：宫灯/纱灯/立灯 atlas 点景 densify（门楣·亭角·桥栏·巷口·廊前）；与灯笼#113/lanternGlow互补。
 * Site226：竹篱/花篱/柴扉 atlas 点景 densify（巷口·宅侧·园边·桥头小径）；与漏窗#131、隔断#129互补。
 * Site227：货摊/货架/晾晒 atlas 点景 densify（主街两侧·巷口·桥头·宅前）；与招牌#115、街具#118互补。
 * Site228：石桌/石凳/棋枰 atlas 点景 densify（庭院·巷角·亭侧·桥头·树下）；与美人靠#134、街具#118互补。
 * Site229：水缸/井栏/水桶 atlas 点景 densify（宅院角·巷口·井边·厨后·桥头）；与井亭#130互补（取水储水点景≠井亭建筑）。
 * Site230 · 香炉/烛台/小供案 densify（aq_xianglu/aq_zhutai/aq_gongan_s；影壁前·宅门内·亭侧·巷口小龛·庭院角；与影壁#126、匾额#135互补）。
 * Site231：柴堆/草垛/粮袋 atlas 点景 densify（宅后·厨侧·巷口·码头边·厩旁）；与货摊#141、水缸#143互补。
 * Site232：酒坛/陶瓮/酒旗 atlas 点景 densify（酒肆门前·宅侧巷口·码头边·厨房外·小院墙根）；与货摊#141、水缸#143、柴堆#145互补。
 * Site233：石磨/碾盘/石臼 atlas 点景 densify（厨侧·宅后·磨坊巷口·粮袋旁·厩侧）；与柴堆#145、粮袋互补。
 * Site234：晾衣杆/鱼篓/竹筐 atlas 点景 densify（宅后晾衣·巷口筐篓·码头鱼篓·厨侧）；与柴堆#145、货摊晾晒#141互补。
 * Site235：鸡笼/鸟笼/鸭舍 atlas 点景 densify（宅后·厩旁·巷口挂笼·厨侧）；与柴堆#145、晾衣#148、石磨#146互补。
 * Site236：蒲团/茶灶/茶具 atlas 点景 densify（廊下·石桌旁·庭院·茶摊侧）；与石桌#142、货摊#141、鸡笼#149、晾衣#148互补。
 * Site237：书案/棋盘/笔架砚台 atlas 点景 densify（廊下·庭院石桌旁·书房外檐·茶席侧）；与石桌#142、蒲团#150互补；≠棋枰桌。
 * Site238：花架/竹几/小博古架 atlas 点景 densify（庭院·廊下·豪宅侧院·茶席旁）；与盆景#137、蒲团#150、书案#151、抱鼓石#136互补。
 * Site239：市井串灯/布幌/招幌 atlas 点景 densify（店门·巷口·酒肆茶摊檐下）；与宫灯#113、酒旗#147、匾额#120互补；rebase keep site237Shuan/site238Huajia if present。
 * Site240：庭院石灯笼/水盆/洗手钵 atlas 点景 densify（庭院·门前·廊下·影壁侧）；≠街灯 prop_shideng / 水缸 prop_shuigang / 香炉；rebase keep site239Huangzi/site238Huajia。
 * Site241：蓑衣/斗笠/扁担 atlas 点景 densify（宅后·巷口·码头边·厨侧）；与晾衣#148、柴堆#145、禽笼#149互补；rebase keep site240Tingdeng。
 * Site242：铜镜/梳妆匣/胭脂粉盒 atlas 点景 densify（闺房外檐·廊侧案几·豪宅内院）；与花架#152、书案#151、博古架互补；rebase keep site241Suoyi。
 * Site243：金鱼缸/多层花盆架/鹦鹉栖架 atlas 点景 densify（庭院·廊下·豪宅侧院）；与盆景#137、花架#152、水缸#143、鸡笼鸟笼#149互补；rebase keep site242Tongjing。
 * Site224 · 石狮/小蹲兽 densify（aq_shishi/aq_shishi_s；宅门·桥头·广场入口·衙署/庙前；门兽≠屋脊兽）。
 * Site223 · 盆景/砖花坛/石台 densify（aq_penjing/aq_huatan/aq_shitai；富户庭院·巷口·桥头·亭侧·门前；与植物#106、太湖石#133互补）。
 * 沿御街、南广场、汴河岸、巷口 densify；复用 lanternGlow；少改宏观布局。
 * 挂灯杆/石灯笼 emit 不开 water，避免与码头渔火倒影打架。
 * 只服务古城 aq_*；不进学校/渔村/石驳岸；不改勾栏/宝相寺大布局。
 * 名称与尺寸未经 Leo 确认。 */
(function (root) {
  'use strict';
  const Core = root.AncientCore;
  if (!Core || !Core.A) return;
  const { A, shade, C, H } = Core;
  const X = root.AncientParts;
  if (!X) return;
  const AT = root.AncientAtlas;
  const { WOOD, WOOD_D, STONE, STONE_W, GOLD } = C;
  const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080';
  const CER = '#8a5a3a', CERW = '#6a4028', GLAZE = '#6a8a58', RIM = '#c8a878';

  function stampProp(d, key, x, y, z, o) {
    if (AT && typeof AT.stamp === 'function') AT.stamp(d, key, x, y, z, o || {});
  }

  /* —— 石灯笼：基座·中柱·灯室·宝顶；atlas prop_shideng + 暖光（无水面） —— */
  A.define('aq_shideng', {
    name: '石灯笼',
    geo: [-0.55, -0.55, 0, 0.55, 0.55, 2.2],
    fp: [[-0.42, -0.42, 0.42, 0.42]],
    prune: true,
    draw(d) {
      const h = H(d);
      stampProp(d, 'prop_shideng', 0, 0, 0, {});
      X.stoneCoursing(d, -0.42, -0.42, 0, 0.42, 0.42, 0.28, { top: shade(ST, 0.9) });
      d.box(-0.16, -0.16, 0.28, 0.16, 0.16, 0.95, shade(ST, 0.95), { line: shade(ST, 0.5), west: STW, top: TOP });
      for (let z = 0.4; z < 0.9; z += 0.14) h.line([-0.17, -0.17, z], [0.17, -0.17, z], shade(ST, 0.75));
      d.box(-0.34, -0.34, 0.95, 0.34, 0.34, 1.55, shade(ST, 1.02), { line: shade(ST, 0.48), west: STW, top: TOP });
      h.QS(-0.35, -0.22, 1.05, 0.22, 1.45, '#e8d090', shade(ST, 0.55));
      h.QS(-0.36, -0.16, 1.12, 0.16, 1.38, '#fff0b8');
      for (const x of [-0.14, 0, 0.14]) h.line([x, -0.355, 1.05], [x, -0.355, 1.45], shade(ST, 0.55));
      for (const z of [1.18, 1.32]) h.line([-0.22, -0.355, z], [0.22, -0.355, z], shade(ST, 0.55));
      d.box(-0.48, -0.48, 1.55, 0.48, 0.48, 1.68, shade(ST, 1.08), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.2) });
      d.box(-0.22, -0.22, 1.68, 0.22, 0.22, 1.88, shade(ST, 1.05), { line: shade(ST, 0.5), west: STW, top: TOP });
      d.box(-0.08, -0.08, 1.88, 0.08, 0.08, 2.12, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.8), top: '#e8c868' });
      for (const [x, y] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) {
        d.box(x - 0.08, y - 0.08, 0.28, x + 0.08, y + 0.08, 0.42, shade(ST, 0.9), { line: shade(ST, 0.5), west: STW, top: TOP });
      }
    },
    emit(d) {
      /* 温和暖晕；不开 water，避免与汴河渔火倒影叠加 */
      X.lanternGlow(d, 0, 0, 1.55, { r: 0.28, cord: 0.05, boost: 1.12, col: '#ffc878', ground: true });
    },
  });

  /* —— 石凳：双石腿 + 厚坐面 atlas prop_shiteng —— */
  A.define('aq_shiteng', {
    name: '石凳',
    geo: [-0.8, -0.4, 0, 0.8, 0.4, 0.6],
    fp: [[-0.7, -0.3, 0.7, 0.3]],
    prune: true,
    draw(d) {
      const h = H(d);
      stampProp(d, 'prop_shiteng', 0, 0, 0, {});
      d.box(-0.55, -0.22, 0, -0.32, 0.22, 0.38, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.88) });
      d.box(0.32, -0.22, 0, 0.55, 0.22, 0.38, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.88) });
      for (let z = 0.12; z < 0.36; z += 0.12) {
        h.line([-0.54, -0.225, z], [-0.33, -0.225, z], shade(ST, 0.7));
        h.line([0.33, -0.225, z], [0.54, -0.225, z], shade(ST, 0.7));
      }
      d.box(-0.72, -0.32, 0.38, 0.72, 0.32, 0.52, shade(ST, 1.02), { line: shade(ST, 0.48), west: STW, top: shade(ST, 1.15) });
      X.stoneCoursing(d, -0.72, -0.32, 0.38, 0.72, 0.32, 0.52, { top: shade(ST, 1.12) });
      for (let x = -0.5; x < 0.55; x += 0.28) h.line([x, -0.325, 0.52], [x, 0.325, 0.52], shade(ST, 0.78));
    },
  });

  /* —— 花缸：陶缸釉带 + 花叶簇 atlas prop_huagang —— */
  A.define('aq_huagang', {
    name: '花缸',
    variants: ['a', 'b', 'c'],
    geo: [-0.5, -0.5, 0, 0.5, 0.5, 1.4],
    fp: [[-0.42, -0.42, 0.42, 0.42]],
    prune: true,
    draw(d, st, v) {
      const h = H(d);
      stampProp(d, 'prop_huagang', 0, 0, 0, {});
      d.box(-0.38, -0.38, 0, 0.38, 0.38, 0.22, shade(CER, 0.9), { line: shade(CER, 0.5), west: CERW, top: shade(CER, 0.85) });
      d.box(-0.42, -0.42, 0.22, 0.42, 0.42, 0.72, CER, { line: shade(CER, 0.48), west: CERW, top: shade(CER, 0.95) });
      d.box(-0.36, -0.36, 0.72, 0.36, 0.36, 0.88, shade(CER, 1.05), { line: shade(CER, 0.5), west: CERW, top: RIM });
      h.QS(-0.425, -0.35, 0.38, 0.35, 0.52, GLAZE, shade(CER, 0.55));
      h.QS(-0.425, -0.32, 0.58, 0.32, 0.66, shade(RIM, 0.95), shade(CER, 0.55));
      for (let z = 0.28; z < 0.7; z += 0.12) h.line([-0.43, -0.43, z], [0.43, -0.43, z], shade(CER, 0.72));
      d.box(-0.3, -0.3, 0.88, 0.3, 0.3, 0.96, '#4a3a28', { line: '#2a1a10', top: '#3a2a18', west: '#3a2a18' });
      const pals = v === 'b'
        ? [[-0.12, -0.08, 1.15, '#c8322c', '#8a2010'], [0.14, 0.06, 1.28, '#e85a3a', '#a03018'], [0.02, -0.14, 1.08, '#f0a060', '#a05020']]
        : v === 'c'
          ? [[-0.12, -0.08, 1.15, '#f0c850', '#a07020'], [0.14, 0.06, 1.28, '#e8b030', '#906018'], [0.02, -0.14, 1.08, '#d89a20', '#805010']]
          : [[-0.12, -0.08, 1.15, '#6f9e46', '#466e30'], [0.14, 0.06, 1.28, '#8ab850', '#5f8e3c'], [0.02, -0.14, 1.08, '#5a8a2a', '#3a6a18']];
      for (const [dx, dy, zz, c1, c2] of pals) {
        h.blob(dx, dy, zz, 9, 7, c1, c2);
      }
      h.blob(-0.05, 0.12, 1.22, 6, 5, v === 'b' ? '#e85a3a' : '#6f9e46', v === 'b' ? '#a03018' : '#466e30');
    },
  });

  /* —— 挂灯杆：石座木杆横挑臂 + 挂灯；atlas prop_lamp_pole；emit 无 water —— */
  A.define('aq_lamp_pole', {
    name: '挂灯杆',
    geo: [-0.35, -1.1, 0, 0.35, 0.35, 3.8],
    fp: [[-0.22, -0.22, 0.22, 0.22]],
    prune: true,
    draw(d) {
      const h = H(d);
      stampProp(d, 'prop_lamp_pole', 0, 0, 0, {});
      X.stoneCoursing(d, -0.28, -0.28, 0, 0.28, 0.28, 0.36, { top: shade(ST, 0.9) });
      d.box(-0.09, -0.09, 0.36, 0.09, 0.09, 3.55, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
      for (let z = 0.7; z < 3.4; z += 0.35) h.line([-0.1, -0.1, z], [0.1, -0.1, z], shade(WOOD, 1.15));
      d.box(-0.08, -0.95, 3.25, 0.08, 0.12, 3.42, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.08) });
      d.box(-0.12, -0.12, 3.5, 0.12, 0.12, 3.7, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.8), top: '#e8c868' });
      h.line([0, -0.78, 3.28], [0, -0.78, 2.95], WOOD_D, 2);
      X.lantern(d, 0, -0.78, 2.95, { r: 0.18, cord: 0.08, col: '#c8322c' });
    },
    emit(d) {
      X.lanternGlow(d, 0, -0.78, 2.95, {
        r: 0.2, cord: 0.08, boost: 1.18, col: '#ffc878', ground: true,
        /* 故意不开 water：汴河岸点缀时不与码头渔火倒影打架 */
      });
    },
  });

  /**
   * densify：御街两侧、南广场、汴河岸（避开码头渔火密集区）、巷口。
   * put(id, type, lx, ly, more) — lx/ly 为宋城局部坐标。
   */

  /* —— Site212 影壁：须弥座 + 墙身 + 砖雕花心 atlas kitbash —— */
  A.define('aq_yingbi', {
    name: '影壁',
    geo: [-1.4, -0.45, 0, 1.4, 0.45, 3.4],
    fp: [[-1.2, -0.35, 1.2, 0.35]],
    prune: true,
    draw(d) {
      if (X.yingbiStamp) X.yingbiStamp(d, 0, 0, 0, { kind: 'yingbi', sx: 1.0, sy: 1.0 });
      else {
        stampProp(d, 'screen_base', -1.3, 0, 0, {});
        stampProp(d, 'wall_yingbi', -1.2, -0.02, 0.48, {});
        stampProp(d, 'brick_huaxin', 0, -0.06, 1.9, {});
      }
    },
  });
  /* —— Site212 照壁：更正式入口对景 —— */
  A.define('aq_zhaobi', {
    name: '照壁',
    geo: [-1.6, -0.5, 0, 1.6, 0.5, 3.9],
    fp: [[-1.4, -0.38, 1.4, 0.38]],
    prune: true,
    draw(d) {
      if (X.yingbiStamp) X.yingbiStamp(d, 0, 0, 0, { kind: 'zhaobi', sx: 1.0, sy: 1.0 });
      else {
        stampProp(d, 'screen_base', -1.4, 0, 0, { sx: 1.08 });
        stampProp(d, 'wall_zhaobi', -1.4, -0.02, 0.5, {});
        stampProp(d, 'brick_huaxin', 0, -0.06, 2.15, {});
      }
    },
  });


  /* —— Site215 拴马桩：须弥座 + 方柱鼓节 + 兽首金环 atlas post_shuanma —— */
  A.define('aq_shuanma', {
    name: '拴马桩',
    geo: [-0.45, -0.45, 0, 0.45, 0.45, 2.6],
    fp: [[-0.32, -0.32, 0.32, 0.32]],
    prune: true,
    draw(d) {
      if (X.hitchingStamp) X.hitchingStamp(d, 0, 0, 0, { kind: 'shuanma' });
      else stampProp(d, 'post_shuanma', 0, 0, 0, {});
    },
  });
  /* —— Site215 上马石：三级踏石 atlas stone_shangma —— */
  A.define('aq_shangma', {
    name: '上马石',
    geo: [-0.8, -0.5, 0, 0.8, 0.5, 0.9],
    fp: [[-0.65, -0.4, 0.65, 0.4]],
    prune: true,
    draw(d) {
      if (X.hitchingStamp) X.hitchingStamp(d, 0, 0, 0, { kind: 'shangma' });
      else stampProp(d, 'stone_shangma', 0, 0, 0, {});
    },
  });
  /* —— Site215 石敢当：碑身铭文框 + 尖顶 atlas stone_ganddang —— */
  A.define('aq_ganddang', {
    name: '石敢当',
    geo: [-0.5, -0.35, 0, 0.5, 0.35, 2.05],
    fp: [[-0.38, -0.25, 0.38, 0.25]],
    prune: true,
    draw(d) {
      if (X.hitchingStamp) X.hitchingStamp(d, 0, 0, 0, { kind: 'ganddang' });
      else stampProp(d, 'stone_ganddang', 0, 0, 0, {});
    },
  });
  /* —— Site215 路牙石标：矮方柱帽顶 atlas curb_marker —— */
  A.define('aq_curb_marker', {
    name: '路牙石标',
    geo: [-0.35, -0.35, 0, 0.35, 0.35, 1.05],
    fp: [[-0.25, -0.25, 0.25, 0.25]],
    prune: true,
    draw(d) {
      if (X.hitchingStamp) X.hitchingStamp(d, 0, 0, 0, { kind: 'curb' });
      else stampProp(d, 'curb_marker', 0, 0, 0, {});
    },
  });


  /* —— Site217 井亭：石台基四柱歇山顶 + 井口 atlas pavilion_jingting —— */
  /* —— Site216 漏窗：墙面透空花窗 atlas window_lou —— */
  A.define('aq_window_lou', {
    name: '漏窗',
    geo: [-1.0, -0.3, 0, 1.0, 0.3, 2.2],
    fp: [[-0.9, -0.2, 0.9, 0.2]],
    prune: true,
    draw(d) {
      if (X.louwindowStamp) X.louwindowStamp(d, 0, 0, 0, { kind: 'lou' });
      else stampProp(d, 'window_lou', -0.9, 0, 0, {});
    },
  });
  /* —— Site216 花墙：透空花墙段 atlas wall_huaziang —— */
  A.define('aq_wall_huaziang', {
    name: '花墙',
    geo: [-1.7, -0.35, 0, 1.7, 0.35, 2.9],
    fp: [[-1.5, -0.25, 1.5, 0.25]],
    prune: true,
    draw(d) {
      if (X.louwindowStamp) X.louwindowStamp(d, 0, 0, 0, { kind: 'huaziang' });
      else stampProp(d, 'wall_huaziang', -1.6, 0, 0, {});
    },
  });
  /* —— Site216 透空砖雕：独立砖雕面板 atlas brick_toukong —— */
  A.define('aq_brick_toukong', {
    name: '透空砖雕',
    geo: [-0.8, -0.3, 0, 0.8, 0.3, 1.6],
    fp: [[-0.65, -0.2, 0.65, 0.2]],
    prune: true,
    draw(d) {
      if (X.louwindowStamp) X.louwindowStamp(d, 0, 0, 0.7, { kind: 'toukong' });
      else stampProp(d, 'brick_toukong', 0, 0, 0.7, {});
    },
  });
  /* —— Site216 花格墙：花格墙板 atlas lattice_wall —— */
  A.define('aq_lattice_wall', {
    name: '花格墙',
    geo: [-1.3, -0.3, 0, 1.3, 0.3, 2.6],
    fp: [[-1.15, -0.2, 1.15, 0.2]],
    prune: true,
    draw(d) {
      if (X.louwindowStamp) X.louwindowStamp(d, 0, 0, 0, { kind: 'lattice' });
      else stampProp(d, 'lattice_wall', -1.2, 0, 0, {});
    },
  });

  A.define('aq_jingting', {
    name: '井亭',
    geo: [-1.4, -1.4, 0, 1.4, 1.4, 4.0],
    fp: [[-1.1, -1.1, 1.1, 1.1]],
    prune: true,
    draw(d) {
      if (X.pavilionStamp) X.pavilionStamp(d, 0, 0, 0, { kind: 'jingting' });
      else stampProp(d, 'pavilion_jingting', 0, 0, 0, {});
    },
  });
  /* —— Site217 路亭：开敞坐槛歇山 atlas pavilion_luting —— */
  A.define('aq_luting', {
    name: '路亭',
    geo: [-1.6, -1.3, 0, 1.6, 1.3, 4.0],
    fp: [[-1.25, -0.95, 1.25, 0.95]],
    prune: true,
    draw(d) {
      if (X.pavilionStamp) X.pavilionStamp(d, 0, 0, 0, { kind: 'luting' });
      else stampProp(d, 'pavilion_luting', 0, 0, 0, {});
    },
  });
  /* —— Site217 小牌坊：单开间石柱歇山 atlas gate_paifang_s（点景，非大牌坊） —— */
  A.define('aq_paifang_s', {
    name: '小牌坊',
    geo: [-1.95, -0.6, 0, 1.95, 0.6, 4.8],
    fp: [[-1.55, -0.4, 1.55, 0.4]],
    prune: true,
    draw(d) {
      if (X.pavilionStamp) X.pavilionStamp(d, 0, 0, 0, { kind: 'paifang_s' });
      else stampProp(d, 'gate_paifang_s', 0, 0, 0, {});
    },
  });



  A.define('aq_chuihua', {
    name: '垂花门',
    geo: [-1.8, -0.6, 0, 1.8, 0.6, 4.5],
    fp: [[-1.4, -0.4, 1.4, 0.4]],
    prune: true,
    draw(d) {
      if (X.chuihuamenStamp) X.chuihuamenStamp(d, 0, 0, 0, { kind: 'chuihua' });
      else stampProp(d, 'gate_chuihua', 0, 0, 0, {});
    },
  });
  /* —— Site218 小门楼：砖墩门洞歇山小楼 atlas gate_menlou_s —— */
  A.define('aq_menlou_s', {
    name: '小门楼',
    geo: [-1.6, -0.75, 0, 1.6, 0.75, 4.65],
    fp: [[-1.25, -0.5, 1.25, 0.5]],
    prune: true,
    draw(d) {
      if (X.chuihuamenStamp) X.chuihuamenStamp(d, 0, 0, 0, { kind: 'menlou_s' });
      else stampProp(d, 'gate_menlou_s', 0, 0, 0, {});
    },
  });
  /* —— Site218 门罩：浅出檐披瓦 atlas eave_menzhao —— */
  A.define('aq_menzhao', {
    name: '门罩',
    geo: [-1.45, -0.4, 0, 1.45, 0.5, 2.1],
    fp: [[-1.1, -0.25, 1.1, 0.35]],
    prune: true,
    draw(d) {
      if (X.chuihuamenStamp) X.chuihuamenStamp(d, 0, 0, 0, { kind: 'menzhao' });
      else stampProp(d, 'eave_menzhao', 0, 0, 0, {});
    },
  });
  /* —— Site218 门柱石：须弥座方柱帽顶 atlas post_menzhu —— */
  A.define('aq_menzhu', {
    name: '门柱石',
    geo: [-0.45, -0.45, 0, 0.45, 0.45, 2.4],
    fp: [[-0.35, -0.35, 0.35, 0.35]],
    prune: true,
    draw(d) {
      if (X.chuihuamenStamp) X.chuihuamenStamp(d, 0, 0, 0, { kind: 'menzhu' });
      else stampProp(d, 'post_menzhu', 0, 0, 0, {});
    },
  });

  /* —— Site219 太湖石：多孔玲珑石峰 atlas rock_taihu —— */
  A.define('aq_rock_taihu', {
    name: '太湖石',
    geo: [-1.0, -0.8, 0, 1.0, 0.8, 3.65],
    fp: [[-0.75, -0.55, 0.75, 0.55]],
    prune: true,
    draw(d) {
      if (X.rockeryStamp) X.rockeryStamp(d, 0, 0, 0, { kind: 'taihu' });
      else stampProp(d, 'rock_taihu', 0, 0, 0, {});
    },
  });
  /* —— Site219 叠石组：层叠假山 atlas rock_dieshi —— */
  A.define('aq_rock_dieshi', {
    name: '叠石',
    geo: [-1.45, -1.1, 0, 1.45, 1.1, 3.95],
    fp: [[-1.15, -0.85, 1.15, 0.85]],
    prune: true,
    draw(d) {
      if (X.rockeryStamp) X.rockeryStamp(d, 0, 0, 0, { kind: 'dieshi' });
      else stampProp(d, 'rock_dieshi', 0, 0, 0, {});
    },
  });
  /* —— Site219 小峰石：独立峰石点景 atlas rock_peak_s —— */
  A.define('aq_rock_peak_s', {
    name: '小峰石',
    geo: [-0.6, -0.5, 0, 0.6, 0.5, 3.25],
    fp: [[-0.4, -0.35, 0.4, 0.35]],
    prune: true,
    draw(d) {
      if (X.rockeryStamp) X.rockeryStamp(d, 0, 0, 0, { kind: 'peak_s' });
      else stampProp(d, 'rock_peak_s', 0, 0, 0, {});
    },
  });
  /* —— Site219 石附苔：苔藓点缀 atlas plant_rock_moss —— */
  A.define('aq_rock_moss', {
    name: '石附苔',
    geo: [-0.6, -0.45, 0, 0.6, 0.45, 1.45],
    fp: [[-0.4, -0.3, 0.4, 0.3]],
    prune: true,
    draw(d) {
      if (X.rockeryStamp) X.rockeryStamp(d, 0, 0, 0, { kind: 'moss' });
      else stampProp(d, 'plant_rock_moss', 0, 0, 0, {});
    },
  });


  /* —— Site220 美人靠：廊边鹅颈靠背坐具 atlas seat_meirenkao —— */
  A.define('aq_meirenkao', {
    name: '美人靠',
    geo: [-1.4, -0.4, 0, 1.4, 0.45, 1.5],
    fp: [[-1.15, -0.3, 1.15, 0.35]],
    prune: true,
    draw(d) {
      if (X.meirenkaoStamp) X.meirenkaoStamp(d, 0, 0, 0, { kind: 'meirenkao' });
      else stampProp(d, 'seat_meirenkao', 0, 0, 0, {});
    },
  });
  /* —— Site220 飞来椅：亭旁飞来靠背椅 atlas seat_feilaichi —— */
  A.define('aq_feilaichi', {
    name: '飞来椅',
    geo: [-0.6, -0.5, 0, 0.6, 0.6, 1.6],
    fp: [[-0.48, -0.38, 0.48, 0.48]],
    prune: true,
    draw(d) {
      if (X.meirenkaoStamp) X.meirenkaoStamp(d, 0, 0, 0, { kind: 'feilaichi' });
      else stampProp(d, 'seat_feilaichi', 0, 0, 0, {});
    },
  });
  /* —— Site220 坐槛：廊边可坐低槛 atlas rail_zuokan —— */
  A.define('aq_zuokan', {
    name: '坐槛',
    geo: [-1.25, -0.3, 0, 1.25, 0.35, 1.3],
    fp: [[-1.05, -0.22, 1.05, 0.28]],
    prune: true,
    draw(d) {
      if (X.meirenkaoStamp) X.meirenkaoStamp(d, 0, 0, 0, { kind: 'zuokan' });
      else stampProp(d, 'rail_zuokan', 0, 0, 0, {});
    },
  });
  /* —— Site220 廊凳：廊侧长凳 atlas bench_lang —— */
  A.define('aq_bench_lang', {
    name: '廊凳',
    geo: [-1.1, -0.4, 0, 1.1, 0.4, 0.75],
    fp: [[-0.95, -0.3, 0.95, 0.3]],
    prune: true,
    draw(d) {
      if (X.meirenkaoStamp) X.meirenkaoStamp(d, 0, 0, 0, { kind: 'bench_lang' });
      else stampProp(d, 'bench_lang', 0, 0, 0, {});
    },
  });


  /* —— Site221 横匾：店铺门楣/宅门额匾 atlas sign_biane —— */
  A.define('aq_biane', {
    name: '横匾',
    geo: [-1.4, -0.22, 1.8, 1.4, 0.22, 2.85],
    fp: [[-1.1, -0.15, 1.1, 0.15]],
    prune: true,
    draw(d) {
      if (X.bianeStamp) X.bianeStamp(d, 0, 0, 2.2, { kind: 'biane' });
      else stampProp(d, 'sign_biane', 0, 0, 2.2, {});
    },
  });
  /* —— Site221 对联：宅门两侧竖联 atlas sign_duilian —— */
  A.define('aq_duilian', {
    name: '对联',
    geo: [-0.28, -0.14, 0.4, 0.28, 0.14, 2.9],
    fp: [[-0.2, -0.1, 0.2, 0.1]],
    prune: true,
    draw(d) {
      if (X.bianeStamp) X.bianeStamp(d, 0, 0, 0.4, { kind: 'duilian' });
      else stampProp(d, 'sign_duilian', 0, 0, 0.4, {});
    },
  });
  /* —— Site221 小字牌：巷口/侧门小牌 atlas sign_zhaopai_s —— */
  A.define('aq_zhaopai_s', {
    name: '小字牌',
    geo: [-0.65, -0.16, 1.2, 0.65, 0.14, 1.9],
    fp: [[-0.5, -0.1, 0.5, 0.1]],
    prune: true,
    draw(d) {
      if (X.bianeStamp) X.bianeStamp(d, 0, 0, 1.4, { kind: 'zhaopai_s' });
      else stampProp(d, 'sign_zhaopai_s', 0, 0, 1.4, {});
    },
  });
  /* —— Site221 垂挂牌：亭侧/檐下木牌 atlas sign_hanging —— */
  A.define('aq_hanging_sign', {
    name: '垂挂牌',
    geo: [-0.45, -0.14, 1.4, 0.45, 0.14, 3.3],
    fp: [[-0.35, -0.1, 0.35, 0.1]],
    prune: true,
    draw(d) {
      if (X.bianeStamp) X.bianeStamp(d, 0, 0, 3.2, { kind: 'hanging' });
      else stampProp(d, 'sign_hanging', 0, 0, 3.2, {});
    },
  });


  /* —— Site222 抱鼓石：宅门两侧鼓形石座 atlas stone_baogu（复用 site209 画法作街景点景） —— */
  A.define('aq_baogu', {
    name: '抱鼓石',
    geo: [-0.5, -0.4, 0, 0.5, 0.5, 1.3],
    fp: [[-0.4, -0.32, 0.4, 0.4]],
    prune: true,
    draw(d) {
      if (X.baoguGateStamp) X.baoguGateStamp(d, 0, 0, 0, { kind: 'baogu' });
      else stampProp(d, 'stone_baogu', 0, 0, 0, {});
    },
  });
  /* —— Site222 方门墩：方正门墩 atlas stone_mendun —— */
  A.define('aq_mendun', {
    name: '方门墩',
    geo: [-0.55, -0.45, 0, 0.55, 0.45, 1.3],
    fp: [[-0.42, -0.36, 0.42, 0.36]],
    prune: true,
    draw(d) {
      if (X.baoguGateStamp) X.baoguGateStamp(d, 0, 0, 0, { kind: 'mendun' });
      else stampProp(d, 'stone_mendun', 0, 0, 0, {});
    },
  });
  /* —— Site222 小石炉：香炉座 atlas stone_lu —— */
  A.define('aq_stone_lu', {
    name: '小石炉',
    geo: [-0.4, -0.35, 0, 0.4, 0.35, 1.3],
    fp: [[-0.32, -0.28, 0.32, 0.28]],
    prune: true,
    draw(d) {
      if (X.baoguGateStamp) X.baoguGateStamp(d, 0, 0, 0, { kind: 'lu' });
      else stampProp(d, 'stone_lu', 0, 0, 0, {});
    },
  });

  /* —— Site223 盆景：宅院/门前/亭侧陶盆小树 atlas pot_penjing —— */
  A.define('aq_penjing', {
    name: '盆景',
    geo: [-0.55, -0.55, 0, 0.55, 0.55, 2.9],
    fp: [[-0.4, -0.4, 0.4, 0.4]],
    prune: true,
    draw(d) {
      if (X.penjingStamp) X.penjingStamp(d, 0, 0, 0, { kind: 'penjing' });
      else stampProp(d, 'pot_penjing', 0, 0, 0, {});
    },
  });
  /* —— Site223 砖花坛：巷口/桥头/庭院砖砌花坛 atlas bed_huatan —— */
  A.define('aq_huatan', {
    name: '砖花坛',
    geo: [-0.95, -0.7, 0, 0.95, 0.7, 1.5],
    fp: [[-0.85, -0.6, 0.85, 0.6]],
    prune: true,
    draw(d) {
      if (X.penjingStamp) X.penjingStamp(d, 0, 0, 0, { kind: 'huatan' });
      else stampProp(d, 'bed_huatan', 0, 0, 0, {});
    },
  });
  /* —— Site223 石台：门前/亭侧/巷口条石座 atlas stone_shitai —— */
  A.define('aq_shitai', {
    name: '石台',
    geo: [-1.05, -0.5, 0, 1.05, 0.5, 0.9],
    fp: [[-0.95, -0.4, 0.95, 0.4]],
    prune: true,
    draw(d) {
      if (X.penjingStamp) X.penjingStamp(d, 0, 0, 0, { kind: 'shitai' });
      else stampProp(d, 'stone_shitai', 0, 0, 0, {});
    },
  });


  /* —— Site224 石狮：门兽 atlas stone_shishi（≠屋脊兽；与抱鼓石互补） —— */
  A.define('aq_shishi', {
    name: '石狮',
    geo: [-0.6, -0.55, 0, 0.6, 0.55, 1.7],
    fp: [[-0.48, -0.42, 0.48, 0.42]],
    prune: true,
    draw(d) {
      if (X.shishiStamp) X.shishiStamp(d, 0, 0, 0, { kind: 'shishi' });
      else stampProp(d, 'stone_shishi', 0, 0, 0, {});
    },
  });
  /* —— Site224 小蹲兽：桥头/次位 atlas stone_shishi_s —— */
  A.define('aq_shishi_s', {
    name: '小蹲兽',
    geo: [-0.42, -0.36, 0, 0.42, 0.36, 1.18],
    fp: [[-0.34, -0.28, 0.34, 0.28]],
    prune: true,
    draw(d) {
      if (X.shishiStamp) X.shishiStamp(d, 0, 0, 0, { kind: 'shishi_s' });
      else stampProp(d, 'stone_shishi_s', 0, 0, 0, {});
    },
  });

  A.define('aq_gongdeng', {
    name: '宫灯',
    geo: [-0.45, -0.45, 0.5, 0.45, 0.45, 2.65],
    fp: [[-0.2, -0.2, 0.2, 0.2]],
    prune: true,
    draw(d) {
      if (X.gongdengStamp) X.gongdengStamp(d, 0, 0, 0, { kind: 'gong' });
      else stampProp(d, 'lantern_gong', 0, 0, 0, {});
    },
    emit(d) {
      if (!X.lanternGlow) return;
      X.lanternGlow(d, 0, 0, 1.55, { r: 0.26, cord: 0.06, boost: 1.18, col: '#ffd890', ground: true });
    },
  });
  A.define('aq_shadeng', {
    name: '纱灯',
    geo: [-0.4, -0.4, 0.4, 0.4, 0.4, 2.25],
    fp: [[-0.18, -0.18, 0.18, 0.18]],
    prune: true,
    draw(d) {
      if (X.gongdengStamp) X.gongdengStamp(d, 0, 0, 0, { kind: 'sha' });
      else stampProp(d, 'lantern_sha', 0, 0, 0, {});
    },
    emit(d) {
      if (!X.lanternGlow) return;
      X.lanternGlow(d, 0, 0, 1.35, { r: 0.22, cord: 0.05, boost: 1.1, col: '#ffe0a8', ground: true });
    },
  });
  A.define('aq_lideng', {
    name: '立灯',
    geo: [-0.35, -0.95, 0, 0.35, 0.35, 2.55],
    fp: [[-0.28, -0.35, 0.28, 0.28]],
    prune: true,
    draw(d) {
      if (X.gongdengStamp) X.gongdengStamp(d, 0, 0, 0, { kind: 'stand' });
      else stampProp(d, 'lantern_stand', 0, 0, 0, {});
    },
    emit(d) {
      if (!X.lanternGlow) return;
      X.lanternGlow(d, 0, -0.7, 1.6, { r: 0.2, cord: 0.08, boost: 1.15, col: '#ffc878', ground: true });
    },
  });


  A.define('aq_zhuli', {
    name: '竹篱',
    geo: [-1.1, -0.2, 0, 1.1, 0.2, 1.55],
    fp: [[-1.0, -0.18, 1.0, 0.18]],
    prune: true,
    draw(d) {
      if (X.zhuliStamp) X.zhuliStamp(d, 0, 0, 0, { kind: 'zhuli' });
      else stampProp(d, 'fence_zhuli', 0, 0, 0, {});
    },
  });
  A.define('aq_huali', {
    name: '花篱',
    geo: [-1.2, -0.22, 0, 1.2, 0.22, 1.9],
    fp: [[-1.1, -0.2, 1.1, 0.2]],
    prune: true,
    draw(d) {
      if (X.zhuliStamp) X.zhuliStamp(d, 0, 0, 0, { kind: 'huali' });
      else stampProp(d, 'fence_huali', 0, 0, 0, {});
    },
  });
  A.define('aq_chaifei', {
    name: '柴扉',
    geo: [-1.05, -0.24, 0, 1.05, 0.24, 2.15],
    fp: [[-0.85, -0.22, 0.85, 0.22]],
    prune: true,
    draw(d) {
      if (X.zhuliStamp) X.zhuliStamp(d, 0, 0, 0, { kind: 'chaifei' });
      else stampProp(d, 'gate_chaifei', 0, 0, 0, {});
    },
  });



  /* —— Site229 水缸：宅院角/厨后/巷口储水 atlas prop_shuigang —— */
  A.define('aq_shuigang', {
    name: '水缸',
    geo: [-0.55, -0.55, 0, 0.55, 0.55, 1.35],
    fp: [[-0.45, -0.45, 0.45, 0.45]],
    prune: true,
    draw(d) {
      if (X.shuigangStamp) X.shuigangStamp(d, 0, 0, 0, { kind: 'shuigang' });
      else stampProp(d, 'prop_shuigang', 0, 0, 0, {});
    },
  });
  /* —— Site229 井栏：井边石栏口 atlas prop_jinglan（≠井亭） —— */
  A.define('aq_jinglan', {
    name: '井栏',
    geo: [-0.9, -0.9, 0, 0.9, 0.9, 1.65],
    fp: [[-0.75, -0.75, 0.75, 0.75]],
    prune: true,
    draw(d) {
      if (X.shuigangStamp) X.shuigangStamp(d, 0, 0, 0, { kind: 'jinglan' });
      else stampProp(d, 'prop_jinglan', 0, 0, 0, {});
    },
  });
  /* —— Site229 水桶：井边/桥头/巷口取水 atlas prop_shuitong —— */
  A.define('aq_shuitong', {
    name: '水桶',
    geo: [-0.4, -0.4, 0, 0.4, 0.4, 1.3],
    fp: [[-0.32, -0.32, 0.32, 0.32]],
    prune: true,
    draw(d) {
      if (X.shuigangStamp) X.shuigangStamp(d, 0, 0, 0, { kind: 'shuitong' });
      else stampProp(d, 'prop_shuitong', 0, 0, 0, {});
    },
  });


  /* —— Site231 柴堆：宅后/厨侧/厩旁储柴 atlas prop_chaidui —— */
  A.define('aq_chaidui', {
    name: '柴堆',
    geo: [-0.95, -0.5, 0, 0.95, 0.5, 1.2],
    fp: [[-0.85, -0.4, 0.85, 0.4]],
    prune: true,
    draw(d) {
      if (X.chaiduiStamp) X.chaiduiStamp(d, 0, 0, 0, { kind: 'chaidui' });
      else stampProp(d, 'prop_chaidui', 0, 0, 0, {});
    },
  });
  /* —— Site231 草垛：宅后/厩旁/码头边 atlas prop_caoduo —— */
  A.define('aq_caoduo', {
    name: '草垛',
    geo: [-1.0, -0.9, 0, 1.0, 0.9, 1.9],
    fp: [[-0.85, -0.75, 0.85, 0.75]],
    prune: true,
    draw(d) {
      if (X.chaiduiStamp) X.chaiduiStamp(d, 0, 0, 0, { kind: 'caoduo' });
      else stampProp(d, 'prop_caoduo', 0, 0, 0, {});
    },
  });
  /* —— Site231 粮袋：巷口/码头边/厨侧麻袋堆 atlas prop_liangdai —— */
  A.define('aq_liangdai', {
    name: '粮袋',
    geo: [-0.75, -0.5, 0, 0.75, 0.5, 2.0],
    fp: [[-0.65, -0.4, 0.65, 0.4]],
    prune: true,
    draw(d) {
      if (X.chaiduiStamp) X.chaiduiStamp(d, 0, 0, 0, { kind: 'liangdai' });
      else stampProp(d, 'prop_liangdai', 0, 0, 0, {});
    },
  });

  /* —— Site232 酒坛：酒肆门前/厨房外褐陶大坛 atlas prop_jiutan —— */
  A.define('aq_jiutan', {
    name: '酒坛',
    geo: [-0.6, -0.58, 0, 0.6, 0.58, 2.0],
    fp: [[-0.5, -0.45, 0.5, 0.45]],
    prune: true,
    draw(d) {
      if (X.jiutanStamp) X.jiutanStamp(d, 0, 0, 0, { kind: 'jiutan' });
      else stampProp(d, 'prop_jiutan', 0, 0, 0, {});
    },
  });
  /* —— Site232 陶瓮：巷口/码头边/小院墙根瓮堆 atlas prop_taoweng —— */
  A.define('aq_taoweng', {
    name: '陶瓮',
    geo: [-0.8, -0.6, 0, 0.8, 0.6, 2.05],
    fp: [[-0.7, -0.5, 0.7, 0.5]],
    prune: true,
    draw(d) {
      if (X.jiutanStamp) X.jiutanStamp(d, 0, 0, 0, { kind: 'taoweng' });
      else stampProp(d, 'prop_taoweng', 0, 0, 0, {});
    },
  });
  /* —— Site232 酒旗：酒肆门前小幌 atlas prop_jiuqi（点景非大牌坊） —— */
  A.define('aq_jiuqi', {
    name: '酒旗',
    geo: [-0.2, -0.2, 0, 1.45, 0.2, 3.2],
    fp: [[-0.15, -0.15, 0.35, 0.15]],
    prune: true,
    draw(d) {
      if (X.jiutanStamp) X.jiutanStamp(d, 0, 0, 0, { kind: 'jiuqi' });
      else stampProp(d, 'prop_jiuqi', 0, 0, 0, {});
    },
  });

  /* —— Site233 石磨：厨侧/磨坊巷口 atlas prop_shima —— */
  A.define('aq_shima', {
    name: '石磨',
    geo: [-0.75, -0.75, 0, 1.2, 0.75, 1.6],
    fp: [[-0.65, -0.65, 1.05, 0.65]],
    prune: true,
    draw(d) {
      if (X.shimaStamp) X.shimaStamp(d, 0, 0, 0, { kind: 'shima' });
      else stampProp(d, 'prop_shima', 0, 0, 0, {});
    },
  });
  /* —— Site233 碾盘：磨坊巷口/厩侧 atlas prop_nianpan —— */
  A.define('aq_nianpan', {
    name: '碾盘',
    geo: [-1.1, -1.1, 0, 1.1, 1.1, 1.2],
    fp: [[-0.95, -0.95, 0.95, 0.95]],
    prune: true,
    draw(d) {
      if (X.shimaStamp) X.shimaStamp(d, 0, 0, 0, { kind: 'nianpan' });
      else stampProp(d, 'prop_nianpan', 0, 0, 0, {});
    },
  });
  /* —— Site233 石臼：厨侧/粮袋旁 atlas prop_shijiu —— */
  A.define('aq_shijiu', {
    name: '石臼',
    geo: [-0.55, -0.55, 0, 0.55, 0.55, 2.0],
    fp: [[-0.45, -0.45, 0.45, 0.45]],
    prune: true,
    draw(d) {
      if (X.shimaStamp) X.shimaStamp(d, 0, 0, 0, { kind: 'shijiu' });
      else stampProp(d, 'prop_shijiu', 0, 0, 0, {});
    },
  });


  /* —— Site234 晾衣杆：宅后/厨侧 atlas prop_liangyi —— */
  A.define('aq_liangyi', {
    name: '晾衣杆',
    geo: [-1.15, -0.2, 0, 1.15, 0.2, 2.55],
    fp: [[-1.05, -0.15, 1.05, 0.15]],
    prune: true,
    draw(d) {
      if (X.liangyiStamp) X.liangyiStamp(d, 0, 0, 0, { kind: 'liangyi' });
      else stampProp(d, 'prop_liangyi', 0, 0, 0, {});
    },
  });
  /* —— Site234 鱼篓：码头/巷口 atlas prop_yulou —— */
  A.define('aq_yulou', {
    name: '鱼篓',
    geo: [-0.55, -0.55, 0, 0.55, 0.55, 1.95],
    fp: [[-0.45, -0.45, 0.45, 0.45]],
    prune: true,
    draw(d) {
      if (X.liangyiStamp) X.liangyiStamp(d, 0, 0, 0, { kind: 'yulou' });
      else stampProp(d, 'prop_yulou', 0, 0, 0, {});
    },
  });
  /* —— Site234 竹筐：巷口/厨侧堆叠 atlas prop_zhukuang —— */
  A.define('aq_zhukuang', {
    name: '竹筐',
    geo: [-0.75, -0.58, 0, 0.75, 0.58, 1.7],
    fp: [[-0.65, -0.48, 0.65, 0.48]],
    prune: true,
    draw(d) {
      if (X.liangyiStamp) X.liangyiStamp(d, 0, 0, 0, { kind: 'zhukuang' });
      else stampProp(d, 'prop_zhukuang', 0, 0, 0, {});
    },
  });


  /* —— Site235 鸡笼：宅后/厨侧/厩旁 atlas prop_jilong —— */
  A.define('aq_jilong', {
    name: '鸡笼',
    geo: [-0.9, -0.6, 0, 0.9, 0.6, 1.6],
    fp: [[-0.8, -0.5, 0.8, 0.5]],
    prune: true,
    draw(d) {
      if (X.jilongStamp) X.jilongStamp(d, 0, 0, 0, { kind: 'jilong' });
      else stampProp(d, 'prop_jilong', 0, 0, 0, {});
    },
  });
  /* —— Site235 鸟笼：巷口挂笼/檐下 atlas prop_niaolong —— */
  A.define('aq_niaolong', {
    name: '鸟笼',
    geo: [-0.7, -0.7, 0, 0.7, 0.7, 2.45],
    fp: [[-0.35, -0.35, 0.35, 0.35]],
    prune: true,
    draw(d) {
      if (X.jilongStamp) X.jilongStamp(d, 0, 0, 0, { kind: 'niaolong' });
      else stampProp(d, 'prop_niaolong', 0, 0, 0, {});
    },
  });
  /* —— Site235 小鸭舍：宅后/厩旁/厨侧 atlas prop_yashe —— */
  A.define('aq_yashe', {
    name: '小鸭舍',
    geo: [-1.1, -0.8, 0, 1.1, 0.85, 1.65],
    fp: [[-0.95, -0.7, 0.95, 0.7]],
    prune: true,
    draw(d) {
      if (X.jilongStamp) X.jilongStamp(d, 0, 0, 0, { kind: 'yashe' });
      else stampProp(d, 'prop_yashe', 0, 0, 0, {});
    },
  });




  /* —— Site238 花架：庭院/廊下/豪宅侧院/茶席旁 atlas prop_huajia —— */
  A.define('aq_huajia', {
    name: '花架',
    geo: [-0.75, -0.5, 0, 0.75, 0.5, 2.9],
    fp: [[-0.55, -0.35, 0.55, 0.35]],
    prune: true,
    draw(d) {
      if (X.huajiaStamp) X.huajiaStamp(d, 0, 0, 0, { kind: 'huajia' });
      else stampProp(d, 'prop_huajia', 0, 0, 0, {});
    },
  });
  /* —— Site238 竹几：茶席旁/廊下/庭院 atlas prop_zhuji —— */
  A.define('aq_zhuji', {
    name: '竹几',
    geo: [-0.7, -0.48, 0, 0.7, 0.48, 1.35],
    fp: [[-0.55, -0.35, 0.55, 0.35]],
    prune: true,
    draw(d) {
      if (X.huajiaStamp) X.huajiaStamp(d, 0, 0, 0, { kind: 'zhuji' });
      else stampProp(d, 'prop_zhuji', 0, 0, 0, {});
    },
  });
  /* —— Site238 小博古架：廊下/豪宅侧院/茶席旁 atlas prop_bogu（≠stone_baogu） —— */
  A.define('aq_bogu', {
    name: '小博古架',
    geo: [-0.65, -0.4, 0, 0.65, 0.45, 2.7],
    fp: [[-0.5, -0.3, 0.5, 0.35]],
    prune: true,
    draw(d) {
      if (X.huajiaStamp) X.huajiaStamp(d, 0, 0, 0, { kind: 'bogu' });
      else stampProp(d, 'prop_bogu', 0, 0, 0, {});
    },
  });

  /* —— Site239 串灯：店门/巷口/酒肆茶摊檐下 atlas prop_chuanleng —— */
  A.define('aq_chuanleng', {
    name: '串灯',
    geo: [-1.2, -0.2, 1.2, 1.2, 0.2, 2.55],
    fp: [[-0.9, -0.12, 0.9, 0.12]],
    prune: true,
    draw(d) {
      if (X.huangziStamp) X.huangziStamp(d, 0, 0, 0, { kind: 'chuanleng' });
      else stampProp(d, 'prop_chuanleng', 0, 0, 0, {});
    },
    emit(d) {
      if (!X.lanternGlow) return;
      X.lanternGlow(d, -0.54, 0, 1.75, { r: 0.14, cord: 0.04, boost: 0.85, col: '#ffe0a0', ground: true });
      X.lanternGlow(d, 0.18, 0, 1.75, { r: 0.14, cord: 0.04, boost: 0.85, col: '#ffe8b0', ground: true });
      X.lanternGlow(d, 0.9, 0, 1.75, { r: 0.14, cord: 0.04, boost: 0.8, col: '#ffd890', ground: true });
    },
  });
  /* —— Site239 布幌：店门/茶摊檐下竖幌+横杆 atlas prop_huangzi —— */
  A.define('aq_huangzi', {
    name: '布幌',
    geo: [-0.2, -0.18, 0.4, 1.1, 0.18, 2.9],
    fp: [[0.1, -0.12, 0.85, 0.12]],
    prune: true,
    draw(d) {
      if (X.huangziStamp) X.huangziStamp(d, 0, 0, 0, { kind: 'huangzi' });
      else stampProp(d, 'prop_huangzi', 0, 0, 0, {});
    },
  });
  /* —— Site239 招幌：店门巷口圆形/菱形招客幌 atlas prop_zhaohuang —— */
  A.define('aq_zhaohuang', {
    name: '招幌',
    geo: [-0.15, -0.5, 0.9, 0.9, 0.5, 2.8],
    fp: [[0.1, -0.3, 0.7, 0.3]],
    prune: true,
    draw(d) {
      if (X.huangziStamp) X.huangziStamp(d, 0, 0, 0, { kind: 'zhaohuang' });
      else stampProp(d, 'prop_zhaohuang', 0, 0, 0, {});
    },
  });



  /* —— Site241 蓑衣：挂墙/架上 atlas prop_suoyi —— */
  A.define('aq_suoyi', {
    name: '蓑衣',
    geo: [-0.95, -0.5, 0, 0.95, 0.5, 2.1],
    fp: [[-0.75, -0.4, 0.75, 0.4]],
    prune: true,
    draw(d) {
      if (X.suoyiStamp) X.suoyiStamp(d, 0, 0, 0, { kind: 'suoyi' });
      else stampProp(d, 'prop_suoyi', 0, 0, 0, {});
    },
  });
  /* —— Site241 斗笠：叠放/挂 atlas prop_douli —— */
  A.define('aq_douli', {
    name: '斗笠',
    geo: [-1.0, -1.0, 0, 1.0, 1.0, 2.05],
    fp: [[-0.7, -0.7, 0.7, 0.7]],
    prune: true,
    draw(d) {
      if (X.suoyiStamp) X.suoyiStamp(d, 0, 0, 0, { kind: 'douli' });
      else stampProp(d, 'prop_douli', 0, 0, 0, {});
    },
  });
  /* —— Site241 扁担+筐：斜靠墙 atlas prop_biandan —— */
  A.define('aq_biandan', {
    name: '扁担',
    geo: [-1.4, -0.6, 0, 1.4, 0.6, 1.8],
    fp: [[-1.2, -0.5, 1.2, 0.5]],
    prune: true,
    draw(d) {
      if (X.suoyiStamp) X.suoyiStamp(d, 0, 0, 0, { kind: 'biandan' });
      else stampProp(d, 'prop_biandan', 0, 0, 0, {});
    },
  });


  /* —— Site242 铜镜：闺房外檐/廊侧案几/豪宅内院 atlas prop_tongjing —— */
  A.define('aq_tongjing', {
    name: '铜镜',
    geo: [-0.6, -0.35, 0, 0.6, 0.35, 2.55],
    fp: [[-0.45, -0.28, 0.45, 0.28]],
    prune: true,
    draw(d) {
      if (X.tongjingStamp) X.tongjingStamp(d, 0, 0, 0, { kind: 'tongjing' });
      else stampProp(d, 'prop_tongjing', 0, 0, 0, {});
    },
  });
  /* —— Site242 梳妆匣：闺房外檐/廊侧案几/豪宅内院 atlas prop_shuzhuang —— */
  A.define('aq_shuzhuang', {
    name: '梳妆匣',
    geo: [-0.75, -0.5, 0, 0.75, 0.5, 1.4],
    fp: [[-0.6, -0.4, 0.6, 0.4]],
    prune: true,
    draw(d) {
      if (X.tongjingStamp) X.tongjingStamp(d, 0, 0, 0, { kind: 'shuzhuang' });
      else stampProp(d, 'prop_shuzhuang', 0, 0, 0, {});
    },
  });
  /* —— Site242 胭脂/粉盒：案几旁小点景 atlas prop_yanzhi —— */
  A.define('aq_yanzhi', {
    name: '胭脂盒',
    geo: [-0.45, -0.35, 0, 0.45, 0.4, 1.05],
    fp: [[-0.35, -0.28, 0.35, 0.32]],
    prune: true,
    draw(d) {
      if (X.tongjingStamp) X.tongjingStamp(d, 0, 0, 0, { kind: 'yanzhi' });
      else stampProp(d, 'prop_yanzhi', 0, 0, 0, {});
    },
  });

  /* —— Site240 庭院石灯笼：庭院/门前/廊下/影壁侧 atlas prop_tingdeng（≠街灯 prop_shideng） —— */
  A.define('aq_tingdeng', {
    name: '庭院石灯笼',
    geo: [-0.55, -0.55, 0, 0.55, 0.55, 2.05],
    fp: [[-0.4, -0.4, 0.4, 0.4]],
    prune: true,
    draw(d) {
      if (X.tingdengStamp) X.tingdengStamp(d, 0, 0, 0, { kind: 'tingdeng' });
      else stampProp(d, 'prop_tingdeng', 0, 0, 0, {});
    },
  });
  /* —— Site240 水盆：庭院/廊下/影壁侧 atlas prop_shuipen（≠水缸 prop_shuigang） —— */
  A.define('aq_shuipen', {
    name: '水盆',
    geo: [-0.7, -0.7, 0, 0.7, 0.7, 1.0],
    fp: [[-0.55, -0.55, 0.55, 0.55]],
    prune: true,
    draw(d) {
      if (X.tingdengStamp) X.tingdengStamp(d, 0, 0, 0, { kind: 'shuipen' });
      else stampProp(d, 'prop_shuipen', 0, 0, 0, {});
    },
  });
  /* —— Site240 洗手钵：门前/影壁侧/廊下 atlas prop_xishoubo —— */
  A.define('aq_xishoubo', {
    name: '洗手钵',
    geo: [-0.55, -0.55, 0, 0.55, 0.55, 1.2],
    fp: [[-0.4, -0.4, 0.4, 0.4]],
    prune: true,
    draw(d) {
      if (X.tingdengStamp) X.tingdengStamp(d, 0, 0, 0, { kind: 'xishoubo' });
      else stampProp(d, 'prop_xishoubo', 0, 0, 0, {});
    },
  });
  /* —— Site243 金鱼缸：庭院/廊下/豪宅侧院 atlas prop_yugang —— */
  A.define('aq_yugang', {
    name: '金鱼缸',
    geo: [-0.6, -0.6, 0, 0.6, 0.6, 1.6],
    fp: [[-0.48, -0.48, 0.48, 0.48]],
    prune: true,
    draw(d) {
      if (X.yugangStamp) X.yugangStamp(d, 0, 0, 0, { kind: 'yugang' });
      else stampProp(d, 'prop_yugang', 0, 0, 0, {});
    },
  });
  /* —— Site243 多层花盆架：庭院/廊下/豪宅侧院 atlas prop_huapenjia —— */
  A.define('aq_huapenjia', {
    name: '花盆架',
    geo: [-0.75, -0.5, 0, 0.75, 0.5, 2.75],
    fp: [[-0.6, -0.4, 0.6, 0.4]],
    prune: true,
    draw(d) {
      if (X.yugangStamp) X.yugangStamp(d, 0, 0, 0, { kind: 'huapenjia' });
      else stampProp(d, 'prop_huapenjia', 0, 0, 0, {});
    },
  });
  /* —— Site243 鹦鹉栖架：庭院/廊下/豪宅侧院 atlas prop_yingwujia —— */
  A.define('aq_yingwujia', {
    name: '鹦鹉架',
    geo: [-0.75, -0.55, 0, 0.9, 0.55, 2.85],
    fp: [[-0.6, -0.45, 0.75, 0.45]],
    prune: true,
    draw(d) {
      if (X.yugangStamp) X.yugangStamp(d, 0, 0, 0, { kind: 'yingwujia' });
      else stampProp(d, 'prop_yingwujia', 0, 0, 0, {});
    },
  });



  /* —— Site244 纺车：庭院/廊下/豪宅侧院 atlas prop_fangche —— */
  A.define('aq_fangche', {
    name: '纺车',
    geo: [-0.95, -0.75, 0, 0.95, 0.75, 2.05],
    fp: [[-0.75, -0.55, 0.75, 0.55]],
    prune: true,
    draw(d) {
      if (X.fangcheStamp) X.fangcheStamp(d, 0, 0, 0, { kind: 'fangche' });
      else stampProp(d, 'prop_fangche', 0, 0, 0, {});
    },
  });
  /* —— Site244 绣绷：庭院/廊下/豪宅侧院 atlas prop_xiubeng —— */
  A.define('aq_xiubeng', {
    name: '绣绷',
    geo: [-0.55, -0.55, 0, 0.55, 0.55, 1.85],
    fp: [[-0.4, -0.45, 0.95, 0.5]],
    prune: true,
    draw(d) {
      if (X.fangcheStamp) X.fangcheStamp(d, 0, 0, 0, { kind: 'xiubeng' });
      else stampProp(d, 'prop_xiubeng', 0, 0, 0, {});
    },
  });
  /* —— Site244 线筐：庭院/廊下/豪宅侧院 atlas prop_xiankuang（≠prop_zhukuang 空竹筐） —— */
  A.define('aq_xiankuang', {
    name: '线筐',
    geo: [-0.7, -0.6, 0, 0.7, 0.6, 1.55],
    fp: [[-0.55, -0.45, 0.55, 0.45]],
    prune: true,
    draw(d) {
      if (X.fangcheStamp) X.fangcheStamp(d, 0, 0, 0, { kind: 'xiankuang' });
      else stampProp(d, 'prop_xiankuang', 0, 0, 0, {});
    },
  });


  /* —— Site245 风铃：庭院/廊下/檐下/门侧 atlas prop_fengling —— */
  A.define('aq_fengling', {
    name: '风铃',
    geo: [-0.6, -0.45, 0, 0.6, 0.45, 2.55],
    fp: [[-0.35, -0.25, 0.35, 0.25]],
    prune: true,
    draw(d) {
      if (X.fenglingStamp) X.fenglingStamp(d, 0, 0, 0, { kind: 'fengling' });
      else stampProp(d, 'prop_fengling', 0, 0, 0, {});
    },
  });
  /* —— Site245 竹帘：庭院/廊下/豪宅侧院 atlas prop_zhulian —— */
  A.define('aq_zhulian', {
    name: '竹帘',
    geo: [-1.05, -0.25, 0, 1.05, 0.25, 2.4],
    fp: [[-0.85, -0.15, 0.85, 0.15]],
    prune: true,
    draw(d) {
      if (X.fenglingStamp) X.fenglingStamp(d, 0, 0, 0, { kind: 'zhulian' });
      else stampProp(d, 'prop_zhulian', 0, 0, 0, {});
    },
  });
  /* —— Site245 纱幔：院廊浅色纱帐 atlas prop_shaman（≠布幌/晾衣） —— */
  A.define('aq_shaman', {
    name: '纱幔',
    geo: [-1.15, -0.2, 0, 1.15, 0.2, 2.6],
    fp: [[-0.9, -0.12, 0.9, 0.12]],
    prune: true,
    draw(d) {
      if (X.fenglingStamp) X.fenglingStamp(d, 0, 0, 0, { kind: 'shaman' });
      else stampProp(d, 'prop_shaman', 0, 0, 0, {});
    },
  });

  /* —— Site246 茶盘：庭院/廊下/店前/豪宅 atlas prop_chapan（≠prop_chaju 茶盏托盘） —— */
  A.define('aq_chapan', {
    name: '茶盘',
    geo: [-0.9, -0.65, 0, 0.9, 0.65, 1.35],
    fp: [[-0.75, -0.5, 0.75, 0.5]],
    prune: true,
    draw(d) {
      if (X.chapanStamp) X.chapanStamp(d, 0, 0, 0, { kind: 'chapan' });
      else stampProp(d, 'prop_chapan', 0, 0, 0, {});
    },
  });
  /* —— Site246 食盒：分层提盒 atlas prop_shihe —— */
  A.define('aq_shihe', {
    name: '食盒',
    geo: [-0.75, -0.55, 0, 0.75, 0.55, 2.8],
    fp: [[-0.6, -0.45, 0.6, 0.45]],
    prune: true,
    draw(d) {
      if (X.chapanStamp) X.chapanStamp(d, 0, 0, 0, { kind: 'shihe' });
      else stampProp(d, 'prop_shihe', 0, 0, 0, {});
    },
  });
  /* —— Site246 果盘：高足盘+果 atlas prop_guopan（≠盆景） —— */
  A.define('aq_guopan', {
    name: '果盘',
    geo: [-0.95, -0.85, 0, 0.95, 0.85, 2.05],
    fp: [[-0.8, -0.7, 0.8, 0.7]],
    prune: true,
    draw(d) {
      if (X.chapanStamp) X.chapanStamp(d, 0, 0, 0, { kind: 'guopan' });
      else stampProp(d, 'prop_guopan', 0, 0, 0, {});
    },
  });

  /* —— Site237 书案：廊下/石桌旁/书房外檐/茶席侧 atlas prop_shuan —— */
  A.define('aq_shuan', {
    name: '书案',
    geo: [-1.05, -0.55, 0, 1.05, 0.55, 1.55],
    fp: [[-0.85, -0.4, 0.85, 0.4]],
    prune: true,
    draw(d) {
      if (X.shuanStamp) X.shuanStamp(d, 0, 0, 0, { kind: 'shuan' });
      else stampProp(d, 'prop_shuan', 0, 0, 0, {});
    },
  });
  /* —— Site237 棋盘：石桌旁/廊下/茶席侧 atlas prop_qipan（≠棋枰桌） —— */
  A.define('aq_qipan', {
    name: '棋盘',
    geo: [-0.8, -0.8, 0, 0.8, 0.8, 0.85],
    fp: [[-0.6, -0.6, 0.6, 0.6]],
    prune: true,
    draw(d) {
      if (X.shuanStamp) X.shuanStamp(d, 0, 0, 0, { kind: 'qipan' });
      else stampProp(d, 'prop_qipan', 0, 0, 0, {});
    },
  });
  /* —— Site237 笔架砚台：书房外檐/廊下/茶席侧 atlas prop_bijia —— */
  A.define('aq_bijia', {
    name: '笔架砚台',
    geo: [-0.6, -0.45, 0, 0.6, 0.45, 1.6],
    fp: [[-0.45, -0.35, 0.45, 0.35]],
    prune: true,
    draw(d) {
      if (X.shuanStamp) X.shuanStamp(d, 0, 0, 0, { kind: 'bijia' });
      else stampProp(d, 'prop_bijia', 0, 0, 0, {});
    },
  });

  /* —— Site236 蒲团：廊下/石桌旁/庭院 atlas prop_putuan —— */
  A.define('aq_putuan', {
    name: '蒲团',
    geo: [-0.75, -0.75, 0, 0.75, 0.75, 0.75],
    fp: [[-0.55, -0.55, 0.55, 0.55]],
    prune: true,
    draw(d) {
      if (X.putuanStamp) X.putuanStamp(d, 0, 0, 0, { kind: 'putuan' });
      else stampProp(d, 'prop_putuan', 0, 0, 0, {});
    },
  });
  /* —— Site236 小茶灶：茶摊侧/庭院/廊下 atlas prop_chazao —— */
  A.define('aq_chazao', {
    name: '小茶灶',
    geo: [-0.55, -0.5, 0, 0.55, 0.5, 2.2],
    fp: [[-0.45, -0.4, 0.45, 0.4]],
    prune: true,
    draw(d) {
      if (X.putuanStamp) X.putuanStamp(d, 0, 0, 0, { kind: 'chazao' });
      else stampProp(d, 'prop_chazao', 0, 0, 0, {});
    },
  });
  /* —— Site236 茶盏托盘：石桌旁/廊下/茶摊侧 atlas prop_chaju —— */
  A.define('aq_chaju', {
    name: '茶盏托盘',
    geo: [-0.72, -0.48, 0, 0.72, 0.48, 0.9],
    fp: [[-0.55, -0.35, 0.55, 0.35]],
    prune: true,
    draw(d) {
      if (X.putuanStamp) X.putuanStamp(d, 0, 0, 0, { kind: 'chaju' });
      else stampProp(d, 'prop_chaju', 0, 0, 0, {});
    },
  });

  /* —— Site227 小货摊：主街侧/巷口/桥头 atlas stall_huotan —— */
  A.define('aq_huotan', {
    name: '小货摊',
    geo: [-1.1, -0.65, 0, 1.1, 0.6, 2.3],
    fp: [[-0.95, -0.5, 0.95, 0.5]],
    prune: true,
    draw(d) {
      if (X.huotanStamp) X.huotanStamp(d, 0, 0, 0, { kind: 'huotan' });
      else stampProp(d, 'stall_huotan', 0, 0, 0, {});
    },
  });
  /* —— Site227 货架：店侧/宅前 atlas rack_huojia —— */
  A.define('aq_huojia', {
    name: '货架',
    geo: [-0.8, -0.35, 0, 0.8, 0.35, 2.65],
    fp: [[-0.7, -0.28, 0.7, 0.28]],
    prune: true,
    draw(d) {
      if (X.huotanStamp) X.huotanStamp(d, 0, 0, 0, { kind: 'huojia' });
      else stampProp(d, 'rack_huojia', 0, 0, 0, {});
    },
  });
  /* —— Site227 晾晒杆：宅前/巷口 atlas pole_liangshai —— */
  A.define('aq_liangshai', {
    name: '晾晒杆',
    geo: [-1.25, -0.4, 0, 1.25, 0.4, 2.95],
    fp: [[-1.1, -0.25, 1.1, 0.25]],
    prune: true,
    draw(d) {
      if (X.huotanStamp) X.huotanStamp(d, 0, 0, 0, { kind: 'liangshai' });
      else stampProp(d, 'pole_liangshai', 0, 0, 0, {});
    },
  });

  /* —— Site228 石桌：庭院/亭侧/树下闲坐 atlas seat_shizhuo —— */
  A.define('aq_shizhuo', {
    name: '石桌',
    geo: [-1.0, -0.8, 0, 1.0, 0.8, 0.95],
    fp: [[-0.85, -0.7, 0.85, 0.7]],
    prune: true,
    draw(d) {
      if (X.shizhuoStamp) X.shizhuoStamp(d, 0, 0, 0, { kind: 'shizhuo' });
      else stampProp(d, 'seat_shizhuo', 0, 0, 0, {});
    },
  });
  /* —— Site228 石凳：鼓墩密实（≠site204 prop_shiteng；≠石灯笼 aq_shideng） atlas seat_shideng —— */
  A.define('aq_seat_shideng', {
    name: '石凳',
    geo: [-0.55, -0.55, 0, 0.55, 0.55, 0.85],
    fp: [[-0.45, -0.45, 0.45, 0.45]],
    prune: true,
    draw(d) {
      if (X.shizhuoStamp) X.shizhuoStamp(d, 0, 0, 0, { kind: 'shideng' });
      else stampProp(d, 'seat_shideng', 0, 0, 0, {});
    },
  });
  /* —— Site228 棋枰桌：对弈点景 atlas seat_qiping —— */
  A.define('aq_qiping', {
    name: '棋枰',
    geo: [-0.9, -0.9, 0, 0.9, 0.9, 1.0],
    fp: [[-0.75, -0.75, 0.75, 0.75]],
    prune: true,
    draw(d) {
      if (X.shizhuoStamp) X.shizhuoStamp(d, 0, 0, 0, { kind: 'qiping' });
      else stampProp(d, 'seat_qiping', 0, 0, 0, {});
    },
  });
  /* —— Site230 香炉：影壁前/小龛/供案 atlas prop_xianglu（≠site222 stone_lu） —— */
  A.define('aq_xianglu', {
    name: '香炉',
    geo: [-0.5, -0.42, 0, 0.5, 0.42, 2.1],
    fp: [[-0.4, -0.35, 0.4, 0.35]],
    prune: true,
    draw(d) {
      if (X.xiangluStamp) X.xiangluStamp(d, 0, 0, 0, { kind: 'xianglu' });
      else stampProp(d, 'prop_xianglu', 0, 0, 0, {});
    },
  });
  /* —— Site230 烛台：案几/龛侧 atlas prop_zhutai —— */
  A.define('aq_zhutai', {
    name: '烛台',
    geo: [-0.35, -0.3, 0, 0.35, 0.3, 2.0],
    fp: [[-0.28, -0.24, 0.28, 0.24]],
    prune: true,
    draw(d) {
      if (X.xiangluStamp) X.xiangluStamp(d, 0, 0, 0, { kind: 'zhutai' });
      else stampProp(d, 'prop_zhutai', 0, 0, 0, {});
    },
  });
  /* —— Site230 小供案/条几：宅门内/影壁前/亭侧 atlas prop_gongan_s（≠大庙殿） —— */
  A.define('aq_gongan_s', {
    name: '小供案',
    geo: [-1.0, -0.45, 0, 1.0, 0.45, 1.25],
    fp: [[-0.9, -0.38, 0.9, 0.38]],
    prune: true,
    draw(d) {
      if (X.xiangluStamp) X.xiangluStamp(d, 0, 0, 0, { kind: 'gongan' });
      else stampProp(d, 'prop_gongan_s', 0, 0, 0, {});
    },
  });

  function place(put, ctx) {
    const CX = (ctx && ctx.CX) != null ? ctx.CX : 72;
    const counts = { shideng: 0, shiteng: 0, huagang: 0, lamp_pole: 0, yingbi: 0, zhaobi: 0, shuanma: 0, shangma: 0, ganddang: 0, curb_marker: 0, jingting: 0, luting: 0, paifang_s: 0 , window_lou: 0, wall_huaziang: 0, brick_toukong: 0, lattice_wall: 0, chuihua: 0, menlou_s: 0, menzhao: 0, menzhu: 0, rock_taihu: 0, rock_dieshi: 0, rock_peak_s: 0, rock_moss: 0, meirenkao: 0, feilaichi: 0, zuokan: 0, bench_lang: 0, biane: 0, duilian: 0, zhaopai_s: 0, hanging_sign: 0, baogu: 0, mendun: 0, stone_lu: 0, penjing: 0, huatan: 0, shitai: 0 , shishi: 0, shishi_s: 0, gongdeng: 0, shadeng: 0, lideng: 0, zhuli: 0, huali: 0, chaifei: 0, huotan: 0, huojia: 0, liangshai: 0, shizhuo: 0, seat_shideng: 0, qiping: 0, shuigang: 0, jinglan: 0, shuitong: 0, xianglu: 0, zhutai: 0, gongan_s: 0, chaidui: 0, caoduo: 0, liangdai: 0 };
    function add(kind, type, lx, ly, more) {
      if (counts[kind] == null) counts[kind] = 0;
      put('sp_' + kind + '_' + counts[kind], type, lx, ly, more || {});
      counts[kind]++;
    }

    /* —— 御街（y=10..84）：两侧交替石灯笼 + 挂灯杆，石凳成组，花缸拐角 —— */
    for (let y = 10; y <= 84; y += 7) {
      const side = ((y / 7) | 0) % 2 === 0;
      if (side) add('shideng', 'aq_shideng', CX - 11.2, y);
      else add('lamp_pole', 'aq_lamp_pole', CX - 11.4, y);
      if (side) add('lamp_pole', 'aq_lamp_pole', CX + 11.4, y, { rot: Math.PI });
      else add('shideng', 'aq_shideng', CX + 11.2, y);
    }
    for (const y of [18, 34, 50, 66, 78]) {
      add('shiteng', 'aq_shiteng', CX - 9.2, y, { rot: Math.PI / 2 });
      add('shiteng', 'aq_shiteng', CX - 9.2, y + 1.4, { rot: Math.PI / 2 });
      add('shiteng', 'aq_shiteng', CX + 9.2, y, { rot: Math.PI / 2 });
      add('shiteng', 'aq_shiteng', CX + 9.2, y + 1.4, { rot: Math.PI / 2 });
      add('huagang', 'aq_huagang', CX - 10.0, y - 1.2, { variant: 'a' });
      add('huagang', 'aq_huagang', CX + 10.0, y - 1.2, { variant: 'b' });
    }

    /* —— 南广场 / 瓮城口（y=-130..-70） —— */
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      add('shideng', 'aq_shideng', CX + Math.cos(a) * 22, -98 + Math.sin(a) * 14, { rot: a });
    }
    for (const [lx, ly, rot] of [
      [CX - 16, -118, 0], [CX - 8, -118, 0], [CX + 8, -118, 0], [CX + 16, -118, 0],
      [CX - 18, -88, Math.PI / 2], [CX + 18, -88, Math.PI / 2],
      [CX - 14, -78, 0], [CX + 14, -78, 0],
    ]) add('shiteng', 'aq_shiteng', lx, ly, { rot });
    for (const [lx, ly, v] of [
      [CX - 20, -110, 'a'], [CX + 20, -110, 'b'], [CX - 22, -95, 'c'], [CX + 22, -95, 'a'],
      [CX - 12, -72, 'b'], [CX + 12, -72, 'c'], [CX, -125, 'a'], [CX - 6, -85, 'b'], [CX + 6, -85, 'c'],
    ]) add('huagang', 'aq_huagang', lx, ly, { variant: v });
    for (const [lx, ly] of [
      [CX - 24, -105], [CX + 24, -105], [CX - 10, -128], [CX + 10, -128],
    ]) add('lamp_pole', 'aq_lamp_pole', lx, ly, { rot: lx < CX ? 0 : Math.PI });

    /* —— 汴河岸：多花缸石凳，石灯稀疏；挂灯杆避开码头密集点 —— */
    for (let x = 18; x <= 130; x += 8) {
      add('huagang', 'aq_huagang', x, 90 + ((x / 8) % 2) * 1.2, { variant: ((x / 8) % 3 === 0) ? 'b' : 'a' });
      if ((x / 8) % 3 === 0) add('shiteng', 'aq_shiteng', x + 2.5, 91.5);
      if ((x / 8) % 4 === 0) add('shideng', 'aq_shideng', x + 1.2, 89.2);
    }
    for (let x = 140; x <= 270; x += 9) {
      add('huagang', 'aq_huagang', x, 90 + ((x / 9) % 2), { variant: 'c' });
      if ((x / 9) % 2 === 0) add('shiteng', 'aq_shiteng', x + 2, 92, { rot: Math.PI / 2 });
      if ((x / 9) % 3 === 0) add('shideng', 'aq_shideng', x - 1, 88.8);
    }
    const dockXs = [18, 42, 60, 78, 90, 110, 118, 130, 150, 158, 170, 190, 210, 250, 260, 270];
    for (const x of [28, 58, 98, 138, 178, 230, 265]) {
      if (dockXs.some((d) => Math.abs(d - x) < 10)) continue;
      add('lamp_pole', 'aq_lamp_pole', x, 93.5, { rot: Math.PI });
    }

    /* —— 巷口：横巷入口两侧花缸 + 石灯 —— */
    const alleys = [
      [24, 20], [24, 36], [24, 52], [24, 68], [24, 82],
      [130, 20], [130, 36], [130, 52], [130, 68], [130, 82],
      [170, 20], [170, 44], [170, 68],
      [270, 20], [270, 44], [270, 68],
    ];
    for (const [ax, ay] of alleys) {
      add('huagang', 'aq_huagang', ax - 1.6, ay - 2.2, { variant: 'a' });
      add('huagang', 'aq_huagang', ax + 1.6, ay - 2.2, { variant: 'b' });
      add('shideng', 'aq_shideng', ax, ay - 3.4);
      if ((ax + ay) % 20 < 10) add('shiteng', 'aq_shiteng', ax - 2.8, ay - 1.0, { rot: Math.PI / 2 });
      /* Site212：巷口侧影壁（偏一侧，不堵巷道） */
      if ((ax + ay) % 24 < 12) add('yingbi', 'aq_yingbi', ax - 3.6, ay - 1.2, { rot: Math.PI / 2 });
      else add('yingbi', 'aq_yingbi', ax + 3.6, ay - 1.2, { rot: -Math.PI / 2 });
    }

    /* Site212：南薰门内两侧照壁（夹御街，不占中线） */
    add('zhaobi', 'aq_zhaobi', CX - 11.5, 5.5, { rot: Math.PI });
    add('zhaobi', 'aq_zhaobi', CX + 11.5, 5.5, { rot: Math.PI });
    /* 府邸门前侧照壁点缀（豪宅门口外侧，偏旁不堵路） */
    add('yingbi', 'aq_yingbi', 248, 150.5);
    add('yingbi', 'aq_yingbi', 132, 164.5);
    add('zhaobi', 'aq_zhaobi', 78, 143.2, { rot: Math.PI });

    /* —— 虹桥南北桥头补点 —— */
    for (const [lx, ly] of [[CX - 8, 100], [CX + 8, 100], [CX - 8, 112], [CX + 8, 112]]) {
      add('huagang', 'aq_huagang', lx, ly, { variant: 'c' });
    }
    add('shideng', 'aq_shideng', CX - 10, 106);
    add('shideng', 'aq_shideng', CX + 10, 106);


    /* —— Site215：御街两侧拴马桩/上马石（靠边不堵中线） —— */
    for (const y of [14, 28, 42, 56, 70, 82]) {
      add('shuanma', 'aq_shuanma', CX - 10.4, y);
      add('shuanma', 'aq_shuanma', CX + 10.4, y, { rot: Math.PI });
    }
    for (const y of [22, 46, 74]) {
      add('shangma', 'aq_shangma', CX - 9.6, y, { rot: Math.PI / 2 });
      add('shangma', 'aq_shangma', CX + 9.6, y, { rot: -Math.PI / 2 });
    }
    for (const y of [16, 40, 64, 80]) {
      add('curb_marker', 'aq_curb_marker', CX - 8.6, y);
      add('curb_marker', 'aq_curb_marker', CX + 8.6, y);
    }

    /* Site215：南薰门外广场石敢当 + 拴马桩（瓮城口两侧，不堵中线） */
    add('ganddang', 'aq_ganddang', CX - 14, -108);
    add('ganddang', 'aq_ganddang', CX + 14, -108);
    add('ganddang', 'aq_ganddang', CX - 18, -82, { rot: Math.PI / 2 });
    add('ganddang', 'aq_ganddang', CX + 18, -82, { rot: -Math.PI / 2 });
    for (const [lx, ly, rot] of [
      [CX - 20, -100, 0], [CX + 20, -100, Math.PI],
      [CX - 12, -122, 0], [CX + 12, -122, Math.PI],
      [CX - 22, -90, Math.PI / 2], [CX + 22, -90, -Math.PI / 2],
    ]) add('shuanma', 'aq_shuanma', lx, ly, { rot });
    for (const [lx, ly] of [[CX - 16, -115], [CX + 16, -115], [CX - 10, -76], [CX + 10, -76]]) {
      add('shangma', 'aq_shangma', lx, ly);
    }
    for (const [lx, ly] of [[CX - 8, -126], [CX + 8, -126], [CX - 24, -98], [CX + 24, -98]]) {
      add('curb_marker', 'aq_curb_marker', lx, ly);
    }

    /* Site215：府邸/衙署门前拴马桩 + 上马石（偏旁，与影壁互补） */
    for (const [lx, ly, rot] of [
      [245, 148.5, 0], [251, 148.5, Math.PI],
      [129, 162.5, 0], [135, 162.5, Math.PI],
      [75, 141.2, Math.PI / 2], [81, 141.2, -Math.PI / 2],
    ]) add('shuanma', 'aq_shuanma', lx, ly, { rot });
    for (const [lx, ly] of [[246.5, 147.2], [133.5, 161.2], [78, 139.8]]) {
      add('shangma', 'aq_shangma', lx, ly);
    }
    add('ganddang', 'aq_ganddang', 242, 146.5);
    add('ganddang', 'aq_ganddang', 138, 160.5);
    add('ganddang', 'aq_ganddang', 84, 140.5, { rot: Math.PI });

    /* —— Site216：巷墙漏窗/花墙 densify（与影壁互补，不堵巷道） —— */
    for (const [ax, ay] of alleys) {
      if ((ax + ay) % 28 < 14) add('window_lou', 'aq_window_lou', ax - 4.2, ay + 1.5, { rot: Math.PI / 2 });
      else add('lattice_wall', 'aq_lattice_wall', ax + 4.2, ay + 1.5, { rot: -Math.PI / 2 });
      if ((ax + ay) % 36 < 18) add('brick_toukong', 'aq_brick_toukong', ax, ay + 2.8);
    }
    /* Site216：艮岳苑外围花墙/漏窗点缀（池岸旁，不改核心 put） */
    for (const [lx, ly, rot, kind] of [
      [14, 158, Math.PI / 2, 'wall_huaziang'],
      [82, 166, -Math.PI / 2, 'wall_huaziang'],
      [30, 152, 0, 'window_lou'],
      [55, 190, Math.PI, 'window_lou'],
      [70, 156, 0, 'lattice_wall'],
      [42, 188, Math.PI, 'lattice_wall'],
      [20, 170, Math.PI / 2, 'brick_toukong'],
      [76, 180, -Math.PI / 2, 'brick_toukong'],
    ]) {
      if (kind === 'wall_huaziang') add('wall_huaziang', 'aq_wall_huaziang', lx, ly, { rot });
      else if (kind === 'window_lou') add('window_lou', 'aq_window_lou', lx, ly, { rot });
      else if (kind === 'lattice_wall') add('lattice_wall', 'aq_lattice_wall', lx, ly, { rot });
      else add('brick_toukong', 'aq_brick_toukong', lx, ly, { rot });
    }
    /* Site216：豪宅外侧巷墙漏窗点缀（偏旁，与影壁/拴马互补） */
    for (const [lx, ly, rot] of [
      [238, 154, Math.PI / 2], [258, 154, -Math.PI / 2],
      [122, 170, Math.PI / 2], [144, 170, -Math.PI / 2],
      [84, 172, Math.PI / 2], [106, 172, -Math.PI / 2],
    ]) add('window_lou', 'aq_window_lou', lx, ly, { rot });
    for (const [lx, ly] of [[240, 160], [128, 174], [90, 176]]) {
      add('wall_huaziang', 'aq_wall_huaziang', lx, ly);
    }

    /* —— Site217：井亭（近既有井口偏旁，不盖井） —— */
    add('jingting', 'aq_jingting', 45.5, 53.5);
    add('jingting', 'aq_jingting', 242.5, 53.5);
    add('jingting', 'aq_jingting', 157.5, 135.5);
    /* 御街交叉口侧再点缀小型井亭（靠巷口旁侧，不占中线） */
    add('jingting', 'aq_jingting', CX - 13.5, 34);
    add('jingting', 'aq_jingting', CX + 13.5, 66);

    /* —— Site217：路亭（御街交叉口旁侧 + 汴河岸，靠边不堵路） —— */
    for (const y of [20, 52, 82]) {
      add('luting', 'aq_luting', CX - 12.8, y);
      add('luting', 'aq_luting', CX + 12.8, y, { rot: Math.PI });
    }
    for (const [lx, ly, rot] of [
      [36, 91.5, 0], [88, 92.2, Math.PI / 2], [168, 91.8, 0], [230, 92.5, -Math.PI / 2],
    ]) add('luting', 'aq_luting', lx, ly, { rot });

    /* —— Site217：小牌坊（巷口/艮岳苑入口/汴河近岸；点景级，不堵主路中线） —— */
    /* 御街交叉口两侧小牌坊（夹御街，偏旁） */
    add('paifang_s', 'aq_paifang_s', CX - 14.5, 18, { rot: Math.PI / 2 });
    add('paifang_s', 'aq_paifang_s', CX + 14.5, 48, { rot: -Math.PI / 2 });
    add('paifang_s', 'aq_paifang_s', CX - 14.5, 68, { rot: Math.PI / 2 });
    /* 横巷口小牌坊（偏巷口外侧） */
    add('paifang_s', 'aq_paifang_s', 22, 18.5);
    add('paifang_s', 'aq_paifang_s', 132, 34.5);
    add('paifang_s', 'aq_paifang_s', 268, 42.5, { rot: Math.PI });
    /* 汴河岸近桥头小牌坊（不占码头） */
    add('paifang_s', 'aq_paifang_s', CX - 16, 96);
    add('paifang_s', 'aq_paifang_s', CX + 16, 114, { rot: Math.PI });
    /* 艮岳苑入口南侧（lang_s 南，偏旁不堵廊） */
    add('paifang_s', 'aq_paifang_s', 30, 148.5);
    add('paifang_s', 'aq_paifang_s', 52, 149.2, { rot: Math.PI });
    /* 艮岳入口旁路亭点缀 */
    add('luting', 'aq_luting', 40, 146.5);



    /* —— Site218：垂花门（豪宅/四合院门前偏旁，不堵主路中线） —— */
    add('chuihua', 'aq_chuihua', 242, 148);
    add('chuihua', 'aq_chuihua', 126, 162);
    add('chuihua', 'aq_chuihua', 88, 164);
    add('chuihua', 'aq_chuihua', 268, 124);
    add('chuihua', 'aq_chuihua', 268, 66);

    /* —— Site218：小门楼（横巷口外侧，靠边） —— */
    add('menlou_s', 'aq_menlou_s', 22, 22);
    add('menlou_s', 'aq_menlou_s', 132, 38);
    add('menlou_s', 'aq_menlou_s', 268, 48, { rot: Math.PI });
    add('menlou_s', 'aq_menlou_s', CX - 15.2, 28, { rot: Math.PI / 2 });
    add('menlou_s', 'aq_menlou_s', CX + 15.2, 58, { rot: -Math.PI / 2 });
    add('menlou_s', 'aq_menlou_s', 40, 150.5);

    /* —— Site218：门罩（店铺侧门/民居门前浅出檐，偏旁） —— */
    for (const [lx, ly, rot] of [
      [CX - 20.5, 24, 0], [CX + 20.5, 40, Math.PI], [CX - 20.5, 56, 0], [CX + 20.5, 72, Math.PI],
      [250, 150, Math.PI / 2], [110, 168, Math.PI / 2], [96, 170, -Math.PI / 2],
    ]) add('menzhao', 'aq_menzhao', lx, ly, { rot });

    /* —— Site218：门柱石（夹门两侧，贴入口） —— */
    for (const [lx, ly] of [
      [239.5, 148], [244.5, 148], [123.5, 162], [128.5, 162], [85.5, 164], [90.5, 164],
      [265.5, 124], [270.5, 124], [265.5, 66], [270.5, 66],
      [CX - 16.5, 28], [CX - 13.9, 28], [CX + 13.9, 58], [CX + 16.5, 58],
    ]) add('menzhu', 'aq_menzhu', lx, ly);


    /* —— Site219：豪宅庭院池边太湖石/叠石/小峰石 densify（偏旁，不堵御街） —— */
    /* 东北豪宅院池边 */
    for (const [lx, ly, kind, rot] of [
      [250, 168, 'rock_taihu', 0], [258, 170, 'rock_peak_s', Math.PI / 4],
      [252, 172, 'rock_moss', 0], [260, 164, 'rock_moss', Math.PI / 2],
    ]) {
      if (kind === 'rock_taihu') add('rock_taihu', 'aq_rock_taihu', lx, ly, { rot });
      else if (kind === 'rock_peak_s') add('rock_peak_s', 'aq_rock_peak_s', lx, ly, { rot });
      else add('rock_moss', 'aq_rock_moss', lx, ly, { rot });
    }
    add('rock_dieshi', 'aq_rock_dieshi', 256, 174);
    /* 北宅府邸院池边 */
    for (const [lx, ly, kind] of [
      [134, 180, 'rock_taihu'], [142, 182, 'rock_peak_s'], [136, 176, 'rock_moss'], [144, 176, 'rock_moss'],
    ]) {
      if (kind === 'rock_taihu') add('rock_taihu', 'aq_rock_taihu', lx, ly);
      else if (kind === 'rock_peak_s') add('rock_peak_s', 'aq_rock_peak_s', lx, ly);
      else add('rock_moss', 'aq_rock_moss', lx, ly);
    }
    add('rock_dieshi', 'aq_rock_dieshi', 140, 184);
    /* 御街西宅院池边 */
    for (const [lx, ly, kind] of [
      [96, 182, 'rock_taihu'], [104, 184, 'rock_peak_s'], [98, 176, 'rock_moss'], [106, 178, 'rock_moss'],
    ]) {
      if (kind === 'rock_taihu') add('rock_taihu', 'aq_rock_taihu', lx, ly);
      else if (kind === 'rock_peak_s') add('rock_peak_s', 'aq_rock_peak_s', lx, ly);
      else add('rock_moss', 'aq_rock_moss', lx, ly);
    }
    add('rock_dieshi', 'aq_rock_dieshi', 102, 186);

    /* Site219：艮岳苑外围点景（池岸旁/廊侧，不改核心 put） */
    for (const [lx, ly, kind, rot] of [
      [18, 162, 'rock_taihu', 0], [48, 160, 'rock_dieshi', Math.PI / 6],
      [58, 186, 'rock_taihu', Math.PI], [26, 186, 'rock_peak_s', 0],
      [70, 168, 'rock_peak_s', -Math.PI / 4], [34, 156, 'rock_dieshi', 0],
      [80, 176, 'rock_taihu', Math.PI / 2], [14, 176, 'rock_peak_s', -Math.PI / 2],
    ]) {
      if (kind === 'rock_taihu') add('rock_taihu', 'aq_rock_taihu', lx, ly, { rot });
      else if (kind === 'rock_dieshi') add('rock_dieshi', 'aq_rock_dieshi', lx, ly, { rot });
      else add('rock_peak_s', 'aq_rock_peak_s', lx, ly, { rot });
    }
    /* 石附苔沿艮岳池岸点缀 */
    for (const [lx, ly] of [[20, 168], [36, 160], [50, 170], [64, 182], [72, 178], [30, 178], [44, 186], [56, 158]]) {
      add('rock_moss', 'aq_rock_moss', lx, ly);
    }

    /* Site219：曲廊侧石组 densify（廊外偏旁） */
    for (const [lx, ly, kind] of [
      [14, 156, 'rock_peak_s'], [22, 152, 'rock_moss'], [76, 158, 'rock_peak_s'], [82, 164, 'rock_moss'],
      [18, 190, 'rock_moss'], [28, 190, 'rock_peak_s'], [62, 188, 'rock_moss'],
      [246, 178, 'rock_moss'], [130, 188, 'rock_moss'], [92, 190, 'rock_moss'],
    ]) {
      if (kind === 'rock_peak_s') add('rock_peak_s', 'aq_rock_peak_s', lx, ly);
      else add('rock_moss', 'aq_rock_moss', lx, ly);
    }



    /* —— Site220：美人靠（曲廊侧临池/临河，靠边不堵廊心） —— */
    for (const [lx, ly, rot] of [
      [16, 151.5, 0], [28, 151.5, 0], [70, 157.5, Math.PI / 2], [78, 168, Math.PI / 2],
      [20, 185.5, Math.PI], [40, 185.5, Math.PI],
      [248, 173.5, 0], [132, 183.5, 0], [94, 185.5, 0],
    ]) add('meirenkao', 'aq_meirenkao', lx, ly, { rot });

    /* —— Site220：飞来椅（井亭/路亭旁点景） —— */
    for (const [lx, ly, rot] of [
      [47, 53.5, 0], [244, 53.5, Math.PI], [159, 135.5, Math.PI / 2],
      [CX - 12.2, 20, 0], [CX + 12.2, 52, Math.PI], [CX - 12.2, 82, 0],
      [38, 91.5, 0], [90, 92.2, Math.PI / 2], [232, 92.5, -Math.PI / 2],
      [42, 146.5, 0],
    ]) add('feilaichi', 'aq_feilaichi', lx, ly, { rot });

    /* —— Site220：坐槛（廊侧低槛可坐；贴廊外缘） —— */
    for (const [lx, ly, rot] of [
      [16, 156.5, 0], [60, 181.5, 0], [78, 164, Math.PI / 2],
      [248, 178.5, 0], [132, 188.5, 0], [94, 190.5, 0],
      [CX - 11.5, 36, Math.PI / 2], [CX + 11.5, 68, -Math.PI / 2],
    ]) add('zuokan', 'aq_zuokan', lx, ly, { rot });

    /* —— Site220：廊凳（汴河岸观景 + 廊侧补点，不堵路） —— */
    for (const [lx, ly, rot] of [
      [24, 91.8, 0], [52, 92.2, 0], [100, 91.5, Math.PI / 2], [148, 92.0, 0],
      [200, 91.8, 0], [248, 92.2, Math.PI / 2],
      [22, 158, Math.PI / 2], [55, 186, 0], [250, 178, 0], [136, 186, 0],
    ]) add('bench_lang', 'aq_bench_lang', lx, ly, { rot });



    /* —— Site221：店铺门楣横匾 densify（御街两侧店铺额枋高度，偏旁不堵路） —— */
    for (const [lx, ly, rot] of [
      [CX - 12.6, 16, 0], [CX + 12.6, 16, Math.PI], [CX - 12.6, 30, 0], [CX + 12.6, 30, Math.PI],
      [CX - 12.6, 44, 0], [CX + 12.6, 44, Math.PI], [CX - 12.6, 58, 0], [CX + 12.6, 58, Math.PI],
      [CX - 12.6, 72, 0], [CX + 12.6, 72, Math.PI],
      [48, 42, Math.PI / 2], [108, 42, -Math.PI / 2], [168, 36, Math.PI / 2], [228, 36, -Math.PI / 2],
    ]) add('biane', 'aq_biane', lx, ly, { rot });

    /* —— Site221：宅门对联 densify（豪宅/四合院门两侧成对） —— */
    for (const [lx, ly, side] of [
      [239.2, 148, -1], [244.8, 148, 1], [123.2, 162, -1], [128.8, 162, 1],
      [85.2, 164, -1], [90.8, 164, 1], [265.2, 124, -1], [270.8, 124, 1],
      [265.2, 66, -1], [270.8, 66, 1], [CX - 16.6, 28, -1], [CX - 13.8, 28, 1],
      [CX + 13.8, 58, -1], [CX + 16.6, 58, 1],
    ]) add('duilian', 'aq_duilian', lx, ly);

    /* —— Site221：巷口小字牌 densify —— */
    for (const [lx, ly, rot] of [
      [22, 24, 0], [132, 40, Math.PI], [268, 50, Math.PI], [40, 152, 0],
      [CX - 15.5, 22, Math.PI / 2], [CX + 15.5, 52, -Math.PI / 2],
      [18, 70, 0], [138, 70, Math.PI], [250, 88, Math.PI / 2], [110, 100, -Math.PI / 2],
      [60, 120, 0], [200, 120, Math.PI],
    ]) add('zhaopai_s', 'aq_zhaopai_s', lx, ly, { rot });

    /* —— Site221：亭侧垂挂牌 densify（井亭/路亭旁檐下，与幌子互补偏旁） —— */
    for (const [lx, ly, rot] of [
      [CX - 9.5, 48, 0], [CX + 9.5, 48, Math.PI], [CX - 9.5, 68, 0], [CX + 9.5, 68, Math.PI],
      [36, 158, Math.PI / 2], [56, 172, -Math.PI / 2], [74, 160, 0], [28, 168, Math.PI],
      [CX - 18, 90, 0], [CX + 18, 90, Math.PI], [90, 86, Math.PI / 2], [160, 86, -Math.PI / 2],
    ]) add('hanging_sign', 'aq_hanging_sign', lx, ly, { rot });


    /* —— Site222：抱鼓石（宅门/垂花门两侧成对；偏旁不堵主路中线） —— */
    /* 垂花门前夹抱鼓 */
    for (const [lx, ly] of [
      [239.2, 147.2], [244.8, 147.2], [123.2, 161.2], [128.8, 161.2],
      [85.2, 163.2], [90.8, 163.2], [265.2, 123.2], [270.8, 123.2],
      [265.2, 65.2], [270.8, 65.2],
    ]) add('baogu', 'aq_baogu', lx, ly);
    /* 富户院门两侧 */
    for (const [lx, ly] of [
      [248.5, 150.5], [253.5, 150.5], [130.5, 166.5], [135.5, 166.5],
      [100.5, 168.5], [105.5, 168.5],
    ]) add('baogu', 'aq_baogu', lx, ly);

    /* —— Site222：方门墩（巷口/民居宅门；比抱鼓更方正） —— */
    for (const [lx, ly, rot] of [
      [20.5, 21.2, 0], [23.5, 21.2, 0], [130.5, 37.2, 0], [133.5, 37.2, 0],
      [266.5, 47.2, Math.PI], [269.5, 47.2, Math.PI],
      [CX - 16.8, 27.5, Math.PI / 2], [CX - 14.2, 27.5, Math.PI / 2],
      [CX + 14.2, 57.5, -Math.PI / 2], [CX + 16.8, 57.5, -Math.PI / 2],
      [38.5, 149.8, 0], [41.5, 149.8, 0],
      [CX - 21.2, 23.5, 0], [CX + 21.2, 39.5, Math.PI],
      [CX - 21.2, 55.5, 0], [CX + 21.2, 71.5, Math.PI],
    ]) add('mendun', 'aq_mendun', lx, ly, { rot });

    /* —— Site222：小石炉（富户院门/巷口香火点景，稀疏） —— */
    for (const [lx, ly, rot] of [
      [241, 146.2, 0], [125, 160.2, 0], [87, 162.2, 0],
      [267, 122.2, 0], [267, 64.2, 0],
      [22, 20.5, 0], [132, 36.5, 0], [40, 148.8, 0],
    ]) add('stone_lu', 'aq_stone_lu', lx, ly, { rot });


    /* —— Site223：富户庭院盆景 densify（豪宅院内偏旁，不堵御街；与太湖石互补） —— */
    for (const [lx, ly, rot] of [
      [246, 166, 0], [254, 172, Math.PI / 4], [262, 166, Math.PI / 2],
      [130, 178, 0], [138, 176, Math.PI / 6], [146, 180, -Math.PI / 4],
      [92, 180, 0], [100, 178, Math.PI / 3], [108, 182, Math.PI],
    ]) add('penjing', 'aq_penjing', lx, ly, { rot });

    /* —— Site223：巷口/门前砖花坛 densify —— */
    for (const [lx, ly, rot] of [
      [24, 22, 0], [128, 38, Math.PI / 2], [264, 48, Math.PI], [42, 150, 0],
      [CX - 14.5, 24, Math.PI / 2], [CX + 14.5, 54, -Math.PI / 2],
      [20, 68, 0], [140, 68, Math.PI], [248, 86, Math.PI / 2], [112, 98, -Math.PI / 2],
      [58, 118, 0], [198, 118, Math.PI],
      [238, 146, 0], [122, 160, Math.PI / 2], [268, 120, 0],
    ]) add('huatan', 'aq_huatan', lx, ly, { rot });

    /* —— Site223：桥头/汴河岸石台 densify（岸旁偏置不堵桥心） —— */
    for (const [lx, ly, rot] of [
      [30, 88, 0], [60, 89.5, Math.PI / 2], [110, 88.5, 0], [170, 89, Math.PI / 2],
      [210, 88, 0], [250, 89.5, Math.PI / 2],
      [CX - 16, 86, 0], [CX + 16, 86, Math.PI],
    ]) add('shitai', 'aq_shitai', lx, ly, { rot });

    /* —— Site223：亭侧盆景 + 石台 densify —— */
    for (const [lx, ly, rot] of [
      [CX - 10.5, 46, 0], [CX + 10.5, 46, Math.PI], [CX - 10.5, 70, 0], [CX + 10.5, 70, Math.PI],
      [34, 156, Math.PI / 2], [54, 170, -Math.PI / 2],
    ]) add('penjing', 'aq_penjing', lx, ly, { rot });
    for (const [lx, ly, rot] of [
      [CX - 8.5, 50, 0], [CX + 8.5, 50, Math.PI], [38, 162, Math.PI / 2], [70, 162, -Math.PI / 2],
    ]) add('shitai', 'aq_shitai', lx, ly, { rot });

    /* —— Site223：门前盆景点景（宅门两侧偏旁） —— */
    for (const [lx, ly, rot] of [
      [236, 146, 0], [248, 146, Math.PI], [120, 160, 0], [132, 160, Math.PI],
      [82, 162, 0], [94, 162, Math.PI], [262, 122, 0], [274, 122, Math.PI],
    ]) add('penjing', 'aq_penjing', lx, ly, { rot });




    /* —— Site224：石狮（富户宅门两侧成对；偏外于抱鼓，不堵御街中线） —— */
    for (const [lx, ly] of [
      [237.5, 145.5], [246.5, 145.5], [121.5, 159.5], [130.5, 159.5],
      [83.5, 161.5], [92.5, 161.5], [263.5, 121.5], [272.5, 121.5],
      [263.5, 63.5], [272.5, 63.5],
    ]) add('shishi', 'aq_shishi', lx, ly);
    /* 广场入口 / 南薰门内侧偏旁 */
    for (const [lx, ly] of [
      [CX - 18, -6], [CX + 18, -6], [CX - 22, 8], [CX + 22, 8],
    ]) add('shishi', 'aq_shishi', lx, ly);
    /* 衙署（梦华府）/庙前点位偏旁 */
    for (const [lx, ly] of [
      [74, 152], [86, 152], [232, 144], [248, 144],
    ]) add('shishi', 'aq_shishi', lx, ly);

    /* —— Site224：小蹲兽（桥头/汴河岸偏旁；不堵桥心） —— */
    for (const [lx, ly, rot] of [
      [28, 87.5, 0], [62, 90.5, Math.PI / 2], [108, 87.8, 0], [172, 90.2, Math.PI / 2],
      [208, 87.5, 0], [252, 90.5, Math.PI / 2],
      [CX - 17.5, 85.5, 0], [CX + 17.5, 85.5, Math.PI],
      [CX - 19, 92.5, 0], [CX + 19, 92.5, Math.PI],
      [40, 91, Math.PI / 4], [140, 86.5, -Math.PI / 4],
    ]) add('shishi_s', 'aq_shishi_s', lx, ly, { rot });

    /* —— Site225：门楣下挂宫灯 densify（宅门/店铺门楣偏旁，不堵中线） —— */
    for (const [lx, ly, rot] of [
      [CX - 12.2, 22, 0], [CX + 12.2, 22, Math.PI], [CX - 12.2, 38, 0], [CX + 12.2, 38, Math.PI],
      [CX - 12.2, 54, 0], [CX + 12.2, 54, Math.PI], [CX - 12.2, 70, 0], [CX + 12.2, 70, Math.PI],
      [236.5, 147.8, 0], [247.5, 147.8, Math.PI], [120.5, 161.8, 0], [131.5, 161.8, Math.PI],
      [82.5, 163.8, 0], [93.5, 163.8, Math.PI], [262.5, 123.8, 0], [273.5, 123.8, Math.PI],
    ]) add('gongdeng', 'aq_gongdeng', lx, ly, { rot });

    /* —— Site225：亭角挂宫灯 densify —— */
    for (const [lx, ly, rot] of [
      [CX - 9.2, 47.5, 0], [CX + 9.2, 47.5, Math.PI], [CX - 9.2, 68.5, 0], [CX + 9.2, 68.5, Math.PI],
      [35.5, 157.5, Math.PI / 2], [54.5, 171.5, -Math.PI / 2],
    ]) add('gongdeng', 'aq_gongdeng', lx, ly, { rot });

    /* —— Site225：巷口纱灯 densify —— */
    for (const [lx, ly, rot] of [
      [21.5, 21.5, 0], [129.5, 37.5, Math.PI / 2], [265.5, 47.5, Math.PI], [39.5, 149.5, 0],
      [CX - 15.5, 26, Math.PI / 2], [CX + 15.5, 56, -Math.PI / 2],
      [21.5, 67.5, 0], [139.5, 67.5, Math.PI], [247.5, 85.5, Math.PI / 2], [113.5, 97.5, -Math.PI / 2],
      [57.5, 117.5, 0], [197.5, 117.5, Math.PI],
      [237.5, 145.5, 0], [121.5, 159.5, Math.PI / 2],
    ]) add('shadeng', 'aq_shadeng', lx, ly, { rot });

    /* —— Site225：桥栏立灯 densify（岸旁偏置不堵桥心） —— */
    for (const [lx, ly, rot] of [
      [28.5, 87.5, 0], [58.5, 89.2, Math.PI / 2], [108.5, 87.8, 0], [168.5, 88.5, Math.PI / 2],
      [208.5, 87.5, 0], [248.5, 89.2, Math.PI / 2],
      [CX - 14.5, 85.5, 0], [CX + 14.5, 85.5, Math.PI],
    ]) add('lideng', 'aq_lideng', lx, ly, { rot });

    /* —— Site225：富户廊前立灯 densify —— */
    for (const [lx, ly, rot] of [
      [244, 158, 0], [256, 168, Math.PI / 4], [128, 170, 0], [140, 174, Math.PI / 6],
      [90, 172, 0], [102, 176, Math.PI / 3], [266, 118, 0], [268, 70, Math.PI],
    ]) add('lideng', 'aq_lideng', lx, ly, { rot });



    /* —— Site226：巷口竹篱 densify（偏旁不堵巷心） —— */
    for (const [lx, ly, rot] of [
      [18.5, 24.5, Math.PI / 2], [24.5, 20.5, 0], [126.5, 36.5, Math.PI / 2], [132.5, 40.5, 0],
      [262.5, 46.5, Math.PI], [268.5, 50.5, Math.PI / 2], [36.5, 148.5, 0], [42.5, 152.5, Math.PI / 2],
      [CX - 18.5, 28, Math.PI / 2], [CX + 18.5, 58, -Math.PI / 2],
      [18.5, 66.5, 0], [136.5, 66.5, Math.PI], [244.5, 84.5, Math.PI / 2], [110.5, 96.5, -Math.PI / 2],
      [54.5, 116.5, 0], [194.5, 116.5, Math.PI],
    ]) add('zhuli', 'aq_zhuli', lx, ly, { rot });

    /* —— Site226：宅侧花篱 densify —— */
    for (const [lx, ly, rot] of [
      [CX - 20.5, 34, 0], [CX + 20.5, 34, Math.PI], [CX - 20.5, 50, 0], [CX + 20.5, 50, Math.PI],
      [CX - 20.5, 66, 0], [CX + 20.5, 66, Math.PI],
      [230.5, 152.5, 0], [250.5, 162.5, Math.PI / 4], [116.5, 166.5, 0], [146.5, 172.5, Math.PI / 6],
      [86.5, 168.5, 0], [106.5, 174.5, Math.PI / 3],
    ]) add('huali', 'aq_huali', lx, ly, { rot });

    /* —— Site226：园边花篱 densify（艮岳外围/豪宅园边偏置） —— */
    for (const [lx, ly, rot] of [
      [28.5, 158.5, Math.PI / 2], [48.5, 168.5, 0], [68.5, 178.5, Math.PI / 2],
      [252.5, 156.5, 0], [270.5, 166.5, Math.PI / 4], [258.5, 176.5, Math.PI],
      [130.5, 178.5, 0], [150.5, 182.5, Math.PI / 6],
    ]) add('huali', 'aq_huali', lx, ly, { rot });

    /* —— Site226：桥头小径竹篱 densify（岸旁偏置不堵桥心） —— */
    for (const [lx, ly, rot] of [
      [26.5, 84.5, 0], [56.5, 91.5, Math.PI / 2], [106.5, 84.5, 0], [166.5, 91.5, Math.PI / 2],
      [206.5, 84.5, 0], [246.5, 91.5, Math.PI / 2],
      [CX - 16.5, 82.5, 0], [CX + 16.5, 82.5, Math.PI],
    ]) add('zhuli', 'aq_zhuli', lx, ly, { rot });

    /* —— Site226：桥头/园门柴扉 densify —— */
    for (const [lx, ly, rot] of [
      [34.5, 86.5, Math.PI / 2], [120.5, 86.5, -Math.PI / 2], [180.5, 86.5, Math.PI / 2], [230.5, 86.5, -Math.PI / 2],
      [40.5, 156.5, 0], [70.5, 170.5, Math.PI / 4], [240.5, 154.5, 0], [264.5, 172.5, Math.PI],
      [CX - 22.5, 42, 0], [CX + 22.5, 62, Math.PI],
      [22.5, 44.5, Math.PI / 2], [128.5, 52.5, -Math.PI / 2],
    ]) add('chaifei', 'aq_chaifei', lx, ly, { rot });




    /* —— Site229：宅院角水缸 densify —— */
    for (const [lx, ly, rot] of [
      [38.5, 148.5, 0], [68.5, 152.5, Math.PI / 4], [118.5, 148.5, 0], [148.5, 156.5, Math.PI / 6],
      [234.5, 148.5, 0], [264.5, 156.5, Math.PI], [248.5, 172.5, Math.PI / 3], [130.5, 172.5, 0],
      [80.5, 168.5, Math.PI / 5], [95.5, 176.5, Math.PI],
    ]) add('shuigang', 'aq_shuigang', lx, ly, { rot });

    /* —— Site229：巷口/厨后水缸 densify —— */
    for (const [lx, ly, rot] of [
      [22.5, 22.5, 0], [130.5, 38.5, Math.PI / 2], [256.5, 48.5, Math.PI], [40.5, 144.5, 0],
      [CX - 15.5, 26, Math.PI / 2], [CX + 15.5, 50, -Math.PI / 2],
      [28.5, 68.5, 0], [140.5, 68.5, Math.PI],
      [CX - 14.5, -104, 0], [CX + 14.5, -104, Math.PI],
      [52.5, 118.5, 0], [198.5, 118.5, Math.PI],
      [110.5, 100.5, Math.PI / 4], [210.5, 102.5, -Math.PI / 4],
    ]) add('shuigang', 'aq_shuigang', lx, ly, { rot });

    /* —— Site229：井边井栏 densify（近既有井亭偏旁，≠井亭本身） —— */
    for (const [lx, ly, rot] of [
      [47.5, 55.5, 0], [244.5, 55.5, Math.PI / 4], [159.5, 137.5, 0],
      [CX - 11.5, 36, Math.PI / 6], [CX + 11.5, 64, -Math.PI / 6],
      [42.5, 50.5, Math.PI / 2], [238.5, 50.5, -Math.PI / 2],
      [154.5, 132.5, Math.PI], [CX - 15.5, 38, 0], [CX + 15.5, 68, Math.PI],
      [36.5, 58.5, Math.PI / 3], [250.5, 58.5, -Math.PI / 3],
    ]) add('jinglan', 'aq_jinglan', lx, ly, { rot });

    /* —— Site229：井边/巷口水桶 densify —— */
    for (const [lx, ly, rot] of [
      [49.5, 52.5, 0], [246.5, 52.5, Math.PI / 2], [161.5, 134.5, 0],
      [CX - 10.5, 32, Math.PI / 4], [CX + 10.5, 68, -Math.PI / 4],
      [26.5, 28.5, 0], [134.5, 42.5, Math.PI / 2], [260.5, 52.5, Math.PI],
      [44.5, 150.5, 0], [CX - 17.5, 44, Math.PI / 2], [CX + 17.5, 60, -Math.PI / 2],
    ]) add('shuitong', 'aq_shuitong', lx, ly, { rot });

    /* —— Site229：桥头水桶 densify（岸旁偏置不堵桥心） —— */
    for (const [lx, ly, rot] of [
      [30.5, 86.5, 0], [60.5, 90.5, Math.PI / 2], [110.5, 86.5, 0], [170.5, 90.5, Math.PI / 2],
      [208.5, 86.5, 0], [248.5, 90.5, Math.PI / 2],
      [CX - 15.5, 86.5, 0], [CX + 15.5, 86.5, Math.PI],
    ]) add('shuitong', 'aq_shuitong', lx, ly, { rot });


    /* —— Site231：宅后柴堆 densify —— */
    for (const [lx, ly, rot] of [
      [36.5, 154.5, 0], [66.5, 160.5, Math.PI / 5], [116.5, 154.5, 0], [146.5, 162.5, Math.PI / 6],
      [232.5, 154.5, 0], [262.5, 162.5, Math.PI], [246.5, 178.5, Math.PI / 4], [128.5, 178.5, 0],
      [78.5, 174.5, Math.PI / 3], [100.5, 180.5, Math.PI],
    ]) add('chaidui', 'aq_chaidui', lx, ly, { rot });

    /* —— Site231：厨侧柴堆 densify —— */
    for (const [lx, ly, rot] of [
      [42.5, 146.5, 0], [72.5, 150.5, Math.PI / 4], [122.5, 146.5, 0], [152.5, 154.5, Math.PI / 6],
      [238.5, 146.5, 0], [270.5, 154.5, Math.PI], [90.5, 166.5, 0], [200.5, 166.5, Math.PI],
    ]) add('chaidui', 'aq_chaidui', lx, ly, { rot });

    /* —— Site231：巷口草垛 densify —— */
    for (const [lx, ly, rot] of [
      [20.5, 26.5, 0], [128.5, 42.5, Math.PI / 2], [254.5, 52.5, Math.PI], [38.5, 140.5, 0],
      [CX - 17.5, 30, Math.PI / 2], [CX + 17.5, 54, -Math.PI / 2],
      [26.5, 72.5, 0], [138.5, 72.5, Math.PI],
      [50.5, 122.5, 0], [196.5, 122.5, Math.PI],
    ]) add('caoduo', 'aq_caoduo', lx, ly, { rot });

    /* —— Site231：厩旁草垛 densify（近拴马桩偏旁） —— */
    for (const [lx, ly, rot] of [
      [CX - 12.5, 14, 0], [CX + 12.5, 14, Math.PI], [CX - 12.5, 40, 0], [CX + 12.5, 40, Math.PI],
      [CX - 12.5, 66, 0], [CX + 12.5, 66, Math.PI],
      [24.5, 20.5, Math.PI / 4], [136.5, 36.5, -Math.PI / 4],
    ]) add('caoduo', 'aq_caoduo', lx, ly, { rot });

    /* —— Site231：码头边粮袋 densify（岸旁偏置不堵码头/桥心） —— */
    for (const [lx, ly, rot] of [
      [28.5, 88.5, 0], [58.5, 92.5, Math.PI / 2], [108.5, 88.5, 0], [168.5, 92.5, Math.PI / 2],
      [206.5, 88.5, 0], [246.5, 92.5, Math.PI / 2],
      [CX - 17.5, 88.5, 0], [CX + 17.5, 88.5, Math.PI],
      [34.5, 96.5, Math.PI / 3], [220.5, 96.5, -Math.PI / 3],
    ]) add('liangdai', 'aq_liangdai', lx, ly, { rot });

    /* —— Site231：巷口/厨侧粮袋 densify —— */
    for (const [lx, ly, rot] of [
      [24.5, 32.5, 0], [132.5, 46.5, Math.PI / 2], [258.5, 56.5, Math.PI],
      [CX - 16.5, 48, Math.PI / 2], [CX + 16.5, 62, -Math.PI / 2],
      [46.5, 152.5, 0], [74.5, 158.5, Math.PI / 5], [240.5, 152.5, 0],
      [CX - 15.5, -100, 0], [CX + 15.5, -100, Math.PI],
      [108.5, 104.5, Math.PI / 4], [208.5, 106.5, -Math.PI / 4],
    ]) add('liangdai', 'aq_liangdai', lx, ly, { rot });

    /* —— Site232：酒肆门前酒坛 densify（御街两侧偏旁，不堵中线） —— */
    for (const [lx, ly, rot] of [
      [CX - 15.5, 18, 0], [CX + 15.5, 18, Math.PI], [CX - 15.5, 34, 0], [CX + 15.5, 34, Math.PI],
      [CX - 15.5, 50, 0], [CX + 15.5, 50, Math.PI], [CX - 15.5, 66, 0], [CX + 15.5, 66, Math.PI],
      [CX - 16.5, -106, 0], [CX + 16.5, -106, Math.PI],
      [104.5, -98, Math.PI / 2], [184.5, -98, -Math.PI / 2],
      [CX - 14.8, 42, 0], [CX + 14.8, 42, Math.PI],
      [CX - 14.8, 58, 0], [CX + 14.8, 58, Math.PI],
      [112.5, 46.5, 0], [188.5, 46.5, Math.PI],
    ]) add('jiutan', 'aq_jiutan', lx, ly, { rot });

    /* —— Site232：厨房外酒坛 densify —— */
    for (const [lx, ly, rot] of [
      [44.5, 144.5, 0], [76.5, 148.5, Math.PI / 5], [124.5, 144.5, 0], [156.5, 152.5, Math.PI / 6],
      [242.5, 144.5, 0], [272.5, 152.5, Math.PI],
    ]) add('jiutan', 'aq_jiutan', lx, ly, { rot });

    /* —— Site232：宅侧巷口陶瓮 densify —— */
    for (const [lx, ly, rot] of [
      [18.5, 28.5, 0], [126.5, 44.5, Math.PI / 2], [252.5, 54.5, Math.PI], [36.5, 138.5, 0],
      [CX - 18.5, 32, Math.PI / 2], [CX + 18.5, 56, -Math.PI / 2],
      [30.5, 74.5, 0], [136.5, 74.5, Math.PI],
      [48.5, 120.5, 0], [194.5, 120.5, Math.PI],
      [106.5, 98.5, Math.PI / 4], [214.5, 100.5, -Math.PI / 4],
    ]) add('taoweng', 'aq_taoweng', lx, ly, { rot });

    /* —— Site232：小院墙根陶瓮 densify —— */
    for (const [lx, ly, rot] of [
      [40.5, 156.5, 0], [70.5, 164.5, Math.PI / 4], [120.5, 156.5, 0], [150.5, 164.5, Math.PI / 6],
      [236.5, 156.5, 0], [266.5, 164.5, Math.PI], [250.5, 180.5, Math.PI / 3], [132.5, 180.5, 0],
    ]) add('taoweng', 'aq_taoweng', lx, ly, { rot });

    /* —— Site232：码头边陶瓮 densify（岸旁偏置不堵码头/桥心） —— */
    for (const [lx, ly, rot] of [
      [32.5, 94.5, 0], [62.5, 98.5, Math.PI / 2], [114.5, 94.5, 0], [174.5, 98.5, Math.PI / 2],
      [212.5, 94.5, 0],
    ]) add('taoweng', 'aq_taoweng', lx, ly, { rot });

    /* —— Site232：酒肆门前酒旗 densify（偏旁不堵主路） —— */
    for (const [lx, ly, rot] of [
      [CX - 17.2, 20, 0], [CX + 17.2, 20, Math.PI], [CX - 17.2, 38, 0], [CX + 17.2, 38, Math.PI],
      [CX - 17.2, 54, 0], [CX + 17.2, 54, Math.PI], [CX - 17.2, 70, 0], [CX + 17.2, 70, Math.PI],
      [CX - 18.5, -110, 0], [CX + 18.5, -110, Math.PI],
      [100.5, -104, Math.PI / 2], [192.5, -104, -Math.PI / 2],
      [CX - 16.8, 46, 0], [CX + 16.8, 46, Math.PI],
    ]) add('jiuqi', 'aq_jiuqi', lx, ly, { rot });

    /* —— Site232：巷口/厨房外酒旗 densify —— */
    for (const [lx, ly, rot] of [
      [22.5, 34.5, 0], [130.5, 48.5, Math.PI / 2], [256.5, 58.5, Math.PI],
      [48.5, 148.5, 0], [82.5, 156.5, Math.PI / 5], [244.5, 148.5, 0],
    ]) add('jiuqi', 'aq_jiuqi', lx, ly, { rot });

    /* —— Site233：厨侧石磨 densify —— */
    for (const [lx, ly, rot] of [
      [40.5, 148.5, 0], [70.5, 152.5, Math.PI / 5], [120.5, 148.5, 0], [150.5, 156.5, Math.PI / 6],
      [236.5, 148.5, 0], [268.5, 156.5, Math.PI], [88.5, 168.5, 0], [198.5, 168.5, Math.PI],
      [54.5, 160.5, Math.PI / 4], [210.5, 160.5, -Math.PI / 4],
    ]) add('shima', 'aq_shima', lx, ly, { rot });

    /* —— Site233：宅后石磨 densify —— */
    for (const [lx, ly, rot] of [
      [34.5, 156.5, 0], [64.5, 162.5, Math.PI / 5], [114.5, 156.5, 0], [144.5, 164.5, Math.PI / 6],
      [230.5, 156.5, 0], [260.5, 164.5, Math.PI], [76.5, 176.5, Math.PI / 3], [126.5, 180.5, 0],
    ]) add('shima', 'aq_shima', lx, ly, { rot });

    /* —— Site233：磨坊巷口碾盘 densify —— */
    for (const [lx, ly, rot] of [
      [18.5, 28.5, 0], [126.5, 44.5, Math.PI / 2], [252.5, 54.5, Math.PI], [36.5, 142.5, 0],
      [CX - 18.5, 32, Math.PI / 2], [CX + 18.5, 56, -Math.PI / 2],
      [24.5, 74.5, 0], [136.5, 74.5, Math.PI],
      [48.5, 124.5, 0], [194.5, 124.5, Math.PI],
      [30.5, 110.5, Math.PI / 4], [220.5, 110.5, -Math.PI / 4],
    ]) add('nianpan', 'aq_nianpan', lx, ly, { rot });

    /* —— Site233：厩侧碾盘 densify（近拴马桩偏旁） —— */
    for (const [lx, ly, rot] of [
      [CX - 14.5, 12, 0], [CX + 14.5, 12, Math.PI], [CX - 14.5, 38, 0], [CX + 14.5, 38, Math.PI],
      [CX - 14.5, 64, 0], [CX + 14.5, 64, Math.PI],
      [22.5, 18.5, Math.PI / 4], [134.5, 34.5, -Math.PI / 4],
    ]) add('nianpan', 'aq_nianpan', lx, ly, { rot });

    /* —— Site233：粮袋旁石臼 densify —— */
    for (const [lx, ly, rot] of [
      [26.5, 34.5, 0], [134.5, 48.5, Math.PI / 2], [260.5, 58.5, Math.PI],
      [CX - 15.5, 50, Math.PI / 2], [CX + 15.5, 64, -Math.PI / 2],
      [48.5, 154.5, 0], [76.5, 160.5, Math.PI / 5], [242.5, 154.5, 0],
      [110.5, 106.5, Math.PI / 4], [210.5, 108.5, -Math.PI / 4],
    ]) add('shijiu', 'aq_shijiu', lx, ly, { rot });

    /* —— Site233：厨侧/宅后石臼 densify —— */
    for (const [lx, ly, rot] of [
      [44.5, 150.5, 0], [74.5, 154.5, Math.PI / 4], [124.5, 150.5, 0], [154.5, 158.5, Math.PI / 6],
      [240.5, 150.5, 0], [272.5, 158.5, Math.PI],
      [38.5, 158.5, 0], [248.5, 166.5, Math.PI],
      [92.5, 172.5, 0], [202.5, 172.5, Math.PI],
    ]) add('shijiu', 'aq_shijiu', lx, ly, { rot });


    /* —— Site234：宅后晾衣 densify —— */
    for (const [lx, ly, rot] of [
      [32.5, 158.5, 0], [62.5, 164.5, Math.PI / 5], [112.5, 158.5, 0], [142.5, 166.5, Math.PI / 6],
      [228.5, 158.5, 0], [258.5, 166.5, Math.PI], [82.5, 178.5, Math.PI / 3], [124.5, 182.5, 0],
      [98.5, 170.5, Math.PI], [190.5, 172.5, 0],
    ]) add('liangyi', 'aq_liangyi', lx, ly, { rot });

    /* —— Site234：厨侧晾衣 densify —— */
    for (const [lx, ly, rot] of [
      [48.5, 144.5, 0], [78.5, 148.5, Math.PI / 4], [128.5, 144.5, 0], [158.5, 152.5, Math.PI / 6],
      [244.5, 144.5, 0], [274.5, 152.5, Math.PI], [96.5, 164.5, 0], [206.5, 164.5, Math.PI],
    ]) add('liangyi', 'aq_liangyi', lx, ly, { rot });

    /* —— Site234：码头鱼篓 densify（岸旁偏置不堵码头/桥心） —— */
    for (const [lx, ly, rot] of [
      [30.5, 90.5, 0], [60.5, 94.5, Math.PI / 2], [110.5, 90.5, 0], [170.5, 94.5, Math.PI / 2],
      [208.5, 90.5, 0], [248.5, 94.5, Math.PI / 2],
      [CX - 19.5, 90.5, 0], [CX + 19.5, 90.5, Math.PI],
      [36.5, 98.5, Math.PI / 3], [222.5, 98.5, -Math.PI / 3],
    ]) add('yulou', 'aq_yulou', lx, ly, { rot });

    /* —— Site234：巷口鱼篓 densify —— */
    for (const [lx, ly, rot] of [
      [22.5, 30.5, 0], [130.5, 46.5, Math.PI / 2], [256.5, 56.5, Math.PI], [40.5, 138.5, 0],
      [CX - 19.5, 34, Math.PI / 2], [CX + 19.5, 58, -Math.PI / 2],
      [28.5, 76.5, 0], [140.5, 76.5, Math.PI],
    ]) add('yulou', 'aq_yulou', lx, ly, { rot });

    /* —— Site234：巷口竹筐 densify —— */
    for (const [lx, ly, rot] of [
      [18.5, 34.5, 0], [124.5, 50.5, Math.PI / 2], [250.5, 60.5, Math.PI], [34.5, 136.5, 0],
      [CX - 20.5, 38, Math.PI / 2], [CX + 20.5, 60, -Math.PI / 2],
      [22.5, 80.5, 0], [134.5, 80.5, Math.PI],
      [52.5, 126.5, 0], [192.5, 126.5, Math.PI],
    ]) add('zhukuang', 'aq_zhukuang', lx, ly, { rot });

    /* —— Site234：厨侧竹筐 densify —— */
    for (const [lx, ly, rot] of [
      [52.5, 150.5, 0], [82.5, 154.5, Math.PI / 5], [132.5, 150.5, 0], [162.5, 158.5, Math.PI / 6],
      [248.5, 150.5, 0], [278.5, 158.5, Math.PI], [104.5, 170.5, 0], [214.5, 170.5, Math.PI],
    ]) add('zhukuang', 'aq_zhukuang', lx, ly, { rot });


    /* —— Site235：宅后鸡笼 densify —— */
    for (const [lx, ly, rot] of [
      [40.5, 156.5, 0], [70.5, 162.5, Math.PI / 5], [120.5, 156.5, 0], [150.5, 164.5, Math.PI / 6],
      [236.5, 156.5, 0], [266.5, 164.5, Math.PI], [86.5, 176.5, Math.PI / 3], [132.5, 180.5, 0],
    ]) add('jilong', 'aq_jilong', lx, ly, { rot });

    /* —— Site235：厨侧鸡笼 densify —— */
    for (const [lx, ly, rot] of [
      [46.5, 148.5, 0], [76.5, 152.5, Math.PI / 4], [126.5, 148.5, 0], [156.5, 156.5, Math.PI / 6],
      [242.5, 148.5, 0], [274.5, 156.5, Math.PI],
    ]) add('jilong', 'aq_jilong', lx, ly, { rot });

    /* —— Site235：厩旁鸡笼 densify（近拴马桩偏旁） —— */
    for (const [lx, ly, rot] of [
      [CX - 14.5, 18, 0], [CX + 14.5, 18, Math.PI], [CX - 14.5, 44, 0], [CX + 14.5, 44, Math.PI],
    ]) add('jilong', 'aq_jilong', lx, ly, { rot });

    /* —— Site235：巷口挂笼 densify —— */
    for (const [lx, ly, rot] of [
      [16.5, 28.5, 0], [126.5, 44.5, Math.PI / 2], [252.5, 54.5, Math.PI], [36.5, 134.5, 0],
      [CX - 18.5, 32, Math.PI / 2], [CX + 18.5, 56, -Math.PI / 2],
      [24.5, 74.5, 0], [136.5, 74.5, Math.PI],
      [48.5, 124.5, 0], [194.5, 124.5, Math.PI],
    ]) add('niaolong', 'aq_niaolong', lx, ly, { rot });

    /* —— Site235：宅后檐下挂笼 densify —— */
    for (const [lx, ly, rot] of [
      [54.5, 160.5, 0], [104.5, 168.5, Math.PI / 5], [184.5, 160.5, 0], [214.5, 168.5, Math.PI],
    ]) add('niaolong', 'aq_niaolong', lx, ly, { rot });

    /* —— Site235：厨侧挂笼 densify —— */
    for (const [lx, ly, rot] of [
      [58.5, 146.5, 0], [108.5, 154.5, Math.PI / 6], [198.5, 146.5, 0], [228.5, 154.5, Math.PI],
    ]) add('niaolong', 'aq_niaolong', lx, ly, { rot });

    /* —— Site235：宅后鸭舍 densify —— */
    for (const [lx, ly, rot] of [
      [28.5, 160.5, 0], [98.5, 166.5, Math.PI / 5], [168.5, 160.5, 0], [248.5, 168.5, Math.PI],
      [58.5, 178.5, Math.PI / 4], [188.5, 178.5, 0],
    ]) add('yashe', 'aq_yashe', lx, ly, { rot });

    /* —— Site235：厩旁鸭舍 densify —— */
    for (const [lx, ly, rot] of [
      [CX - 15.5, 22, 0], [CX + 15.5, 22, Math.PI], [CX - 15.5, 48, 0], [CX + 15.5, 48, Math.PI],
      [CX - 15.5, 70, 0], [CX + 15.5, 70, Math.PI],
    ]) add('yashe', 'aq_yashe', lx, ly, { rot });

    /* —— Site235：厨侧鸭舍 densify —— */
    for (const [lx, ly, rot] of [
      [38.5, 150.5, 0], [88.5, 158.5, Math.PI / 5], [218.5, 150.5, 0], [268.5, 158.5, Math.PI],
    ]) add('yashe', 'aq_yashe', lx, ly, { rot });




    /* —— Site238：廊下花架 densify（曲廊侧偏旁，不堵廊心） —— */
    for (const [lx, ly, rot] of [
      [26.5, 44.5, 0], [54.5, 60.5, Math.PI / 5], [226.5, 44.5, Math.PI], [86.5, 92.5, Math.PI / 4],
      [CX - 15.5, 22, 0], [CX + 15.5, 50, Math.PI],
    ]) add('huajia', 'aq_huajia', lx, ly, { rot });

    /* —— Site238：庭院花架 densify —— */
    for (const [lx, ly, rot] of [
      [30.5, 154.5, 0], [58.5, 166.5, Math.PI / 4], [78.5, 174.5, 0],
      [246.5, 154.5, Math.PI / 6], [264.5, 164.5, 0], [144.5, 170.5, Math.PI / 3],
    ]) add('huajia', 'aq_huajia', lx, ly, { rot });

    /* —— Site238：豪宅侧院花架 densify（东北/北宅院侧偏旁） —— */
    for (const [lx, ly, rot] of [
      [248.5, 172.5, 0], [254.5, 178.5, Math.PI / 5], [132.5, 178.5, 0],
      [148.5, 184.5, Math.PI / 4], [94.5, 180.5, 0], [108.5, 186.5, Math.PI],
    ]) add('huajia', 'aq_huajia', lx, ly, { rot });

    /* —— Site238：茶席旁竹几 densify —— */
    for (const [lx, ly, rot] of [
      [CX - 18.5, 16, 0], [CX + 18.5, 16, Math.PI], [CX - 18.5, 30, 0], [CX + 18.5, 30, Math.PI],
      [22.5, 24.5, 0], [132.5, 40.5, Math.PI / 2],
    ]) add('zhuji', 'aq_zhuji', lx, ly, { rot });

    /* —— Site238：廊下竹几 densify —— */
    for (const [lx, ly, rot] of [
      [38.5, 50.5, 0], [82.5, 96.5, Math.PI / 2], [236.5, 50.5, Math.PI],
      [CX - 7.5, 34, 0], [CX + 7.5, 62, Math.PI], [50.5, 86.5, 0],
    ]) add('zhuji', 'aq_zhuji', lx, ly, { rot });

    /* —— Site238：庭院竹几 densify（石桌旁偏置） —— */
    for (const [lx, ly, rot] of [
      [40.5, 160.5, 0], [60.5, 170.5, Math.PI / 4], [80.5, 178.5, 0],
      [254.5, 158.5, Math.PI / 6], [272.5, 168.5, 0], [136.5, 174.5, Math.PI / 3],
    ]) add('zhuji', 'aq_zhuji', lx, ly, { rot });

    /* —— Site238：廊下博古架 densify —— */
    for (const [lx, ly, rot] of [
      [34.5, 42.5, 0], [48.5, 54.5, Math.PI / 5], [222.5, 42.5, Math.PI], [96.5, 90.5, Math.PI / 4],
      [CX - 6.5, 28, 0], [CX + 6.5, 56, Math.PI],
    ]) add('bogu', 'aq_bogu', lx, ly, { rot });

    /* —— Site238：豪宅侧院博古架 densify —— */
    for (const [lx, ly, rot] of [
      [252.5, 166.5, 0], [258.5, 176.5, Math.PI / 5], [138.5, 176.5, 0],
      [146.5, 182.5, Math.PI / 4], [100.5, 178.5, 0], [112.5, 184.5, Math.PI],
    ]) add('bogu', 'aq_bogu', lx, ly, { rot });

    /* —— Site238：茶席旁博古架 densify —— */
    for (const [lx, ly, rot] of [
      [CX - 19.5, 20, 0], [CX + 19.5, 20, Math.PI], [CX - 19.5, 36, 0], [CX + 19.5, 36, Math.PI],
      [20.5, 32.5, 0], [128.5, 48.5, Math.PI / 2],
    ]) add('bogu', 'aq_bogu', lx, ly, { rot });

    /* —— Site239：店门檐下串灯 densify（御街两侧偏旁，不堵中线；≠宫灯位置） —— */
    for (const [lx, ly, rot] of [
      [CX - 13.8, 20, 0], [CX + 13.8, 20, Math.PI], [CX - 13.8, 36, 0], [CX + 13.8, 36, Math.PI],
      [CX - 13.8, 52, 0], [CX + 13.8, 52, Math.PI], [CX - 13.8, 68, 0], [CX + 13.8, 68, Math.PI],
      [CX - 14.5, -104, 0], [CX + 14.5, -104, Math.PI],
    ]) add('chuanleng', 'aq_chuanleng', lx, ly, { rot });

    /* —— Site239：巷口/酒肆茶摊檐下串灯 densify —— */
    for (const [lx, ly, rot] of [
      [23.5, 28.5, 0], [131.5, 42.5, Math.PI / 2], [254.5, 52.5, Math.PI],
      [44.5, 146.5, 0], [78.5, 154.5, Math.PI / 5], [246.5, 146.5, 0],
    ]) add('chuanleng', 'aq_chuanleng', lx, ly, { rot });

    /* —— Site239：店门布幌 densify（偏旁不堵主路；≠酒旗杆） —— */
    for (const [lx, ly, rot] of [
      [CX - 16.2, 18, 0], [CX + 16.2, 18, Math.PI], [CX - 16.2, 34, 0], [CX + 16.2, 34, Math.PI],
      [CX - 16.2, 50, 0], [CX + 16.2, 50, Math.PI], [CX - 16.2, 66, 0], [CX + 16.2, 66, Math.PI],
      [CX - 17.2, -108, 0], [CX + 17.2, -108, Math.PI],
    ]) add('huangzi', 'aq_huangzi', lx, ly, { rot });

    /* —— Site239：茶摊/酒肆檐下布幌 densify —— */
    for (const [lx, ly, rot] of [
      [25.5, 30.5, 0], [133.5, 44.5, Math.PI / 2], [256.5, 54.5, Math.PI],
      [46.5, 150.5, 0], [80.5, 158.5, Math.PI / 5], [248.5, 150.5, 0],
    ]) add('huangzi', 'aq_huangzi', lx, ly, { rot });

    /* —— Site239：店门招幌 densify（圆形/菱形招客幌；≠匾额墙招） —— */
    for (const [lx, ly, rot] of [
      [CX - 14.8, 24, 0], [CX + 14.8, 24, Math.PI], [CX - 14.8, 40, 0], [CX + 14.8, 40, Math.PI],
      [CX - 14.8, 56, 0], [CX + 14.8, 56, Math.PI], [CX - 14.8, 72, 0], [CX + 14.8, 72, Math.PI],
      [CX - 15.5, -100, 0], [CX + 15.5, -100, Math.PI],
    ]) add('zhaohuang', 'aq_zhaohuang', lx, ly, { rot });

    /* —— Site239：巷口招幌 densify —— */
    for (const [lx, ly, rot] of [
      [22.5, 26.5, 0], [130.5, 40.5, Math.PI / 2], [255.5, 50.5, Math.PI],
      [42.5, 144.5, 0], [76.5, 152.5, Math.PI / 5], [244.5, 144.5, 0],
    ]) add('zhaohuang', 'aq_zhaohuang', lx, ly, { rot });



    /* —— Site241：宅后挂蓑 densify —— */
    for (const [lx, ly, rot] of [
      [36.5, 154.5, 0], [66.5, 160.5, Math.PI / 5], [116.5, 154.5, 0], [146.5, 162.5, Math.PI / 6],
      [232.5, 154.5, 0], [262.5, 162.5, Math.PI],
    ]) add('suoyi', 'aq_suoyi', lx, ly, { rot });

    /* —— Site241：巷口挂蓑 densify —— */
    for (const [lx, ly, rot] of [
      [20.5, 32.5, 0], [128.5, 48.5, Math.PI / 2], [254.5, 58.5, Math.PI], [38.5, 132.5, 0],
      [CX - 17.5, 36, Math.PI / 2], [CX + 17.5, 54, -Math.PI / 2],
    ]) add('suoyi', 'aq_suoyi', lx, ly, { rot });

    /* —— Site241：厨侧挂蓑 densify —— */
    for (const [lx, ly, rot] of [
      [44.5, 146.5, 0], [74.5, 150.5, Math.PI / 4], [124.5, 146.5, 0], [154.5, 154.5, Math.PI / 6],
      [240.5, 146.5, 0], [272.5, 154.5, Math.PI],
    ]) add('suoyi', 'aq_suoyi', lx, ly, { rot });

    /* —— Site241：宅后斗笠 densify —— */
    for (const [lx, ly, rot] of [
      [52.5, 158.5, 0], [102.5, 166.5, Math.PI / 5], [182.5, 158.5, 0], [212.5, 166.5, Math.PI],
      [88.5, 174.5, Math.PI / 3], [168.5, 176.5, 0],
    ]) add('douli', 'aq_douli', lx, ly, { rot });

    /* —— Site241：巷口斗笠 densify —— */
    for (const [lx, ly, rot] of [
      [26.5, 36.5, 0], [134.5, 52.5, Math.PI / 2], [260.5, 62.5, Math.PI], [44.5, 130.5, 0],
      [CX - 16.5, 40, Math.PI / 2], [CX + 16.5, 62, -Math.PI / 2],
    ]) add('douli', 'aq_douli', lx, ly, { rot });

    /* —— Site241：码头斗笠 densify（岸旁偏置不堵码头/桥心） —— */
    for (const [lx, ly, rot] of [
      [34.5, 88.5, 0], [64.5, 92.5, Math.PI / 2], [114.5, 88.5, 0], [174.5, 92.5, Math.PI / 2],
      [212.5, 88.5, 0], [252.5, 92.5, Math.PI / 2],
    ]) add('douli', 'aq_douli', lx, ly, { rot });

    /* —— Site241：宅后扁担 densify —— */
    for (const [lx, ly, rot] of [
      [44.5, 168.5, 0], [94.5, 172.5, Math.PI / 5], [174.5, 168.5, 0], [244.5, 172.5, Math.PI],
    ]) add('biandan', 'aq_biandan', lx, ly, { rot });

    /* —— Site241：巷口扁担 densify —— */
    for (const [lx, ly, rot] of [
      [30.5, 40.5, 0], [138.5, 56.5, Math.PI / 2], [246.5, 66.5, Math.PI], [50.5, 128.5, 0],
    ]) add('biandan', 'aq_biandan', lx, ly, { rot });

    /* —— Site241：码头扁担 densify —— */
    for (const [lx, ly, rot] of [
      [40.5, 96.5, 0], [100.5, 100.5, Math.PI / 3], [180.5, 96.5, 0], [230.5, 100.5, Math.PI],
    ]) add('biandan', 'aq_biandan', lx, ly, { rot });

    /* —— Site241：厨侧扁担 densify —— */
    for (const [lx, ly, rot] of [
      [56.5, 152.5, 0], [106.5, 160.5, Math.PI / 5], [196.5, 152.5, 0], [256.5, 160.5, Math.PI],
    ]) add('biandan', 'aq_biandan', lx, ly, { rot });


    /* —— Site242：闺房外檐铜镜 densify（宅院外檐偏旁，近书房外檐带但错开） —— */
    for (const [lx, ly, rot] of [
      [42.5, 124.5, 0], [62.5, 132.5, Math.PI / 5], [182.5, 124.5, 0], [212.5, 132.5, Math.PI],
      [106.5, 140.5, Math.PI / 4], [256.5, 120.5, 0],
    ]) add('tongjing', 'aq_tongjing', lx, ly, { rot });

    /* —— Site242：廊侧案几铜镜 densify（曲廊侧偏旁，不堵廊心） —— */
    for (const [lx, ly, rot] of [
      [24.5, 48.5, 0], [50.5, 62.5, Math.PI / 5], [230.5, 48.5, Math.PI], [90.5, 98.5, Math.PI / 4],
      [CX - 17.5, 26, 0], [CX + 17.5, 54, Math.PI],
    ]) add('tongjing', 'aq_tongjing', lx, ly, { rot });

    /* —— Site242：豪宅内院铜镜 densify —— */
    for (const [lx, ly, rot] of [
      [246.5, 170.5, 0], [256.5, 180.5, Math.PI / 5], [130.5, 180.5, 0],
      [150.5, 186.5, Math.PI / 4], [96.5, 182.5, 0], [110.5, 188.5, Math.PI],
    ]) add('tongjing', 'aq_tongjing', lx, ly, { rot });

    /* —— Site242：闺房外檐梳妆匣 densify —— */
    for (const [lx, ly, rot] of [
      [46.5, 128.5, 0], [66.5, 136.5, Math.PI / 5], [186.5, 128.5, 0], [216.5, 136.5, Math.PI],
      [110.5, 144.5, Math.PI / 4], [260.5, 124.5, 0],
    ]) add('shuzhuang', 'aq_shuzhuang', lx, ly, { rot });

    /* —— Site242：廊侧案几梳妆匣 densify —— */
    for (const [lx, ly, rot] of [
      [40.5, 52.5, 0], [84.5, 94.5, Math.PI / 2], [238.5, 52.5, Math.PI],
      [CX - 5.5, 36, 0], [CX + 5.5, 64, Math.PI], [52.5, 84.5, 0],
    ]) add('shuzhuang', 'aq_shuzhuang', lx, ly, { rot });

    /* —— Site242：豪宅内院梳妆匣 densify —— */
    for (const [lx, ly, rot] of [
      [250.5, 174.5, 0], [260.5, 182.5, Math.PI / 5], [134.5, 182.5, 0],
      [152.5, 188.5, Math.PI / 4], [102.5, 184.5, 0], [114.5, 190.5, Math.PI],
    ]) add('shuzhuang', 'aq_shuzhuang', lx, ly, { rot });

    /* —— Site242：闺房外檐胭脂盒 densify —— */
    for (const [lx, ly, rot] of [
      [38.5, 120.5, 0], [58.5, 128.5, Math.PI / 5], [178.5, 120.5, 0], [208.5, 128.5, Math.PI],
      [102.5, 136.5, Math.PI / 4], [252.5, 116.5, 0],
    ]) add('yanzhi', 'aq_yanzhi', lx, ly, { rot });

    /* —— Site242：廊侧案几胭脂盒 densify —— */
    for (const [lx, ly, rot] of [
      [30.5, 50.5, 0], [46.5, 58.5, Math.PI / 5], [220.5, 50.5, Math.PI], [94.5, 96.5, Math.PI / 4],
      [CX - 11.5, 30, 0], [CX + 11.5, 58, Math.PI],
    ]) add('yanzhi', 'aq_yanzhi', lx, ly, { rot });

    /* —— Site242：豪宅内院胭脂盒 densify —— */
    for (const [lx, ly, rot] of [
      [244.5, 168.5, 0], [254.5, 176.5, Math.PI / 5], [136.5, 178.5, 0],
      [144.5, 184.5, Math.PI / 4], [98.5, 176.5, 0], [116.5, 186.5, Math.PI],
    ]) add('yanzhi', 'aq_yanzhi', lx, ly, { rot });

    /* —— Site240：庭院庭灯 densify（庭心偏旁，不堵路） —— */
    for (const [lx, ly, rot] of [
      [30.5, 154.5, 0], [54.5, 164.5, Math.PI / 4], [74.5, 172.5, 0],
      [246.5, 152.5, Math.PI / 6], [264.5, 162.5, 0], [138.5, 168.5, Math.PI / 3],
    ]) add('tingdeng', 'aq_tingdeng', lx, ly, { rot });

    /* —— Site240：门前庭灯 densify —— */
    for (const [lx, ly, rot] of [
      [22.5, 112.5, 0], [58.5, 116.5, Math.PI / 5], [178.5, 112.5, 0], [218.5, 118.5, Math.PI],
      [102.5, 124.5, Math.PI / 4], [252.5, 108.5, 0],
    ]) add('tingdeng', 'aq_tingdeng', lx, ly, { rot });

    /* —— Site240：廊下庭灯 densify（曲廊侧偏旁，不堵廊心） —— */
    for (const [lx, ly, rot] of [
      [26.5, 44.5, 0], [48.5, 54.5, Math.PI / 5], [226.5, 44.5, Math.PI], [86.5, 92.5, Math.PI / 4],
      [CX - 14.5, 22, 0], [CX + 14.5, 50, Math.PI],
    ]) add('tingdeng', 'aq_tingdeng', lx, ly, { rot });

    /* —— Site240：庭院水盆 densify —— */
    for (const [lx, ly, rot] of [
      [36.5, 156.5, 0], [60.5, 166.5, Math.PI / 4], [80.5, 174.5, 0],
      [250.5, 154.5, Math.PI / 6], [268.5, 164.5, 0], [144.5, 170.5, Math.PI / 3],
    ]) add('shuipen', 'aq_shuipen', lx, ly, { rot });

    /* —— Site240：廊下/影壁侧水盆 densify —— */
    for (const [lx, ly, rot] of [
      [34.5, 50.5, 0], [84.5, 98.5, Math.PI / 2], [230.5, 50.5, Math.PI],
      [CX - 10.5, 36, 0], [CX + 10.5, 64, Math.PI], [44.5, 86.5, 0],
    ]) add('shuipen', 'aq_shuipen', lx, ly, { rot });

    /* —— Site240：门前水盆 densify —— */
    for (const [lx, ly, rot] of [
      [CX - 18.5, 18, 0], [CX + 18.5, 18, Math.PI], [CX - 18.5, 32, 0], [CX + 18.5, 32, Math.PI],
      [26.5, 26.5, 0], [134.5, 42.5, Math.PI / 2],
    ]) add('shuipen', 'aq_shuipen', lx, ly, { rot });

    /* —— Site240：门前洗手钵 densify —— */
    for (const [lx, ly, rot] of [
      [40.5, 114.5, 0], [62.5, 122.5, Math.PI / 5], [182.5, 114.5, 0], [212.5, 122.5, Math.PI],
      [106.5, 130.5, Math.PI / 4], [256.5, 110.5, 0],
    ]) add('xishoubo', 'aq_xishoubo', lx, ly, { rot });

    /* —— Site240：影壁侧洗手钵 densify —— */
    for (const [lx, ly, rot] of [
      [30.5, 48.5, 0], [46.5, 52.5, Math.PI / 5], [222.5, 48.5, Math.PI], [90.5, 90.5, Math.PI / 4],
      [CX - 7.5, 30, 0], [CX + 7.5, 58, Math.PI],
    ]) add('xishoubo', 'aq_xishoubo', lx, ly, { rot });

    /* —— Site240：廊下/庭院洗手钵 densify —— */
    for (const [lx, ly, rot] of [
      [CX - 19.5, 24, 0], [CX + 19.5, 24, Math.PI], [32.5, 162.5, 0], [52.5, 172.5, Math.PI / 4],
      [242.5, 160.5, Math.PI / 6], [128.5, 176.5, Math.PI / 3],
    ]) add('xishoubo', 'aq_xishoubo', lx, ly, { rot });
    /* —— Site243：廊下金鱼缸 densify（曲廊侧偏旁，不堵廊心） —— */
    for (const [lx, ly, rot] of [
      [22.5, 42.5, 0], [50.5, 58.5, Math.PI / 5], [222.5, 42.5, Math.PI], [82.5, 90.5, Math.PI / 4],
      [CX - 17.5, 20, 0], [CX + 17.5, 48, Math.PI],
    ]) add('yugang', 'aq_yugang', lx, ly, { rot });

    /* —— Site243：庭院金鱼缸 densify —— */
    for (const [lx, ly, rot] of [
      [34.5, 152.5, 0], [62.5, 164.5, Math.PI / 4], [82.5, 172.5, 0],
      [242.5, 152.5, Math.PI / 6], [260.5, 162.5, 0], [140.5, 168.5, Math.PI / 3],
    ]) add('yugang', 'aq_yugang', lx, ly, { rot });

    /* —— Site243：豪宅侧院金鱼缸 densify —— */
    for (const [lx, ly, rot] of [
      [244.5, 170.5, 0], [250.5, 176.5, Math.PI / 5], [128.5, 176.5, 0],
      [144.5, 182.5, Math.PI / 4], [90.5, 178.5, 0], [104.5, 184.5, Math.PI],
    ]) add('yugang', 'aq_yugang', lx, ly, { rot });

    /* —— Site243：廊下花盆架 densify —— */
    for (const [lx, ly, rot] of [
      [30.5, 40.5, 0], [46.5, 56.5, Math.PI / 5], [218.5, 40.5, Math.PI], [92.5, 88.5, Math.PI / 4],
      [CX - 5.5, 26, 0], [CX + 5.5, 54, Math.PI],
    ]) add('huapenjia', 'aq_huapenjia', lx, ly, { rot });

    /* —— Site243：庭院花盆架 densify —— */
    for (const [lx, ly, rot] of [
      [36.5, 156.5, 0], [66.5, 168.5, Math.PI / 4], [86.5, 176.5, 0],
      [238.5, 156.5, Math.PI / 6], [268.5, 166.5, 0], [148.5, 172.5, Math.PI / 3],
    ]) add('huapenjia', 'aq_huapenjia', lx, ly, { rot });

    /* —— Site243：豪宅侧院花盆架 densify —— */
    for (const [lx, ly, rot] of [
      [240.5, 168.5, 0], [262.5, 174.5, Math.PI / 5], [124.5, 174.5, 0],
      [156.5, 180.5, Math.PI / 4], [88.5, 176.5, 0], [118.5, 182.5, Math.PI],
    ]) add('huapenjia', 'aq_huapenjia', lx, ly, { rot });

    /* —— Site243：廊下鹦鹉架 densify —— */
    for (const [lx, ly, rot] of [
      [18.5, 46.5, 0], [58.5, 64.5, Math.PI / 5], [234.5, 46.5, Math.PI], [78.5, 98.5, Math.PI / 4],
      [CX - 19.5, 18, 0], [CX + 19.5, 46, Math.PI],
    ]) add('yingwujia', 'aq_yingwujia', lx, ly, { rot });

    /* —— Site243：庭院鹦鹉架 densify —— */
    for (const [lx, ly, rot] of [
      [28.5, 150.5, 0], [54.5, 162.5, Math.PI / 4], [74.5, 170.5, 0],
      [250.5, 150.5, Math.PI / 6], [274.5, 160.5, 0], [132.5, 166.5, Math.PI / 3],
    ]) add('yingwujia', 'aq_yingwujia', lx, ly, { rot });

    /* —— Site243：豪宅侧院鹦鹉架 densify —— */
    for (const [lx, ly, rot] of [
      [246.5, 164.5, 0], [256.5, 172.5, Math.PI / 5], [120.5, 172.5, 0],
      [140.5, 178.5, Math.PI / 4], [96.5, 174.5, 0], [106.5, 180.5, Math.PI],
    ]) add('yingwujia', 'aq_yingwujia', lx, ly, { rot });


    /* —— Site244：廊下纺车 densify（曲廊侧偏旁，不堵廊心；避 site240 庭灯位） —— */
    for (const [lx, ly, rot] of [
      [18.5, 40.5, 0], [60.5, 62.5, Math.PI / 5], [220.5, 40.5, Math.PI], [78.5, 88.5, Math.PI / 4],
      [CX - 22.5, 18, 0], [CX + 22.5, 46, Math.PI],
    ]) add('fangche', 'aq_fangche', lx, ly, { rot });

    /* —— Site244：庭院纺车 densify —— */
    for (const [lx, ly, rot] of [
      [42.5, 148.5, 0], [68.5, 160.5, Math.PI / 4], [90.5, 168.5, 0],
      [234.5, 148.5, Math.PI / 6], [256.5, 158.5, 0], [150.5, 164.5, Math.PI / 3],
    ]) add('fangche', 'aq_fangche', lx, ly, { rot });

    /* —— Site244：豪宅侧院纺车 densify —— */
    for (const [lx, ly, rot] of [
      [230.5, 176.5, 0], [246.5, 182.5, Math.PI / 5], [114.5, 182.5, 0],
      [160.5, 188.5, Math.PI / 4], [80.5, 184.5, 0], [120.5, 190.5, Math.PI],
    ]) add('fangche', 'aq_fangche', lx, ly, { rot });

    /* —— Site244：廊下绣绷 densify —— */
    for (const [lx, ly, rot] of [
      [22.5, 38.5, 0], [64.5, 60.5, Math.PI / 5], [216.5, 38.5, Math.PI], [82.5, 86.5, Math.PI / 4],
      [CX - 8.5, 26, 0], [CX + 8.5, 54, Math.PI],
    ]) add('xiubeng', 'aq_xiubeng', lx, ly, { rot });

    /* —— Site244：庭院绣绷 densify —— */
    for (const [lx, ly, rot] of [
      [46.5, 150.5, 0], [72.5, 162.5, Math.PI / 4], [94.5, 170.5, 0],
      [230.5, 150.5, Math.PI / 6], [260.5, 160.5, 0], [154.5, 166.5, Math.PI / 3],
    ]) add('xiubeng', 'aq_xiubeng', lx, ly, { rot });

    /* —— Site244：豪宅侧院绣绷 densify —— */
    for (const [lx, ly, rot] of [
      [226.5, 174.5, 0], [252.5, 180.5, Math.PI / 5], [110.5, 180.5, 0],
      [166.5, 186.5, Math.PI / 4], [76.5, 182.5, 0], [126.5, 188.5, Math.PI],
    ]) add('xiubeng', 'aq_xiubeng', lx, ly, { rot });

    /* —— Site244：廊下线筐 densify —— */
    for (const [lx, ly, rot] of [
      [14.5, 46.5, 0], [66.5, 64.5, Math.PI / 5], [228.5, 46.5, Math.PI], [74.5, 96.5, Math.PI / 4],
      [CX - 24.5, 14, 0], [CX + 24.5, 42, Math.PI],
    ]) add('xiankuang', 'aq_xiankuang', lx, ly, { rot });

    /* —— Site244：庭院线筐 densify —— */
    for (const [lx, ly, rot] of [
      [40.5, 146.5, 0], [66.5, 158.5, Math.PI / 4], [88.5, 166.5, 0],
      [238.5, 146.5, Math.PI / 6], [270.5, 156.5, 0], [148.5, 162.5, Math.PI / 3],
    ]) add('xiankuang', 'aq_xiankuang', lx, ly, { rot });

    /* —— Site244：豪宅侧院线筐 densify —— */
    for (const [lx, ly, rot] of [
      [236.5, 170.5, 0], [250.5, 178.5, Math.PI / 5], [108.5, 178.5, 0],
      [158.5, 184.5, Math.PI / 4], [84.5, 180.5, 0], [118.5, 186.5, Math.PI],
    ]) add('xiankuang', 'aq_xiankuang', lx, ly, { rot });


    /* —— Site245：廊下风铃 densify（曲廊檐侧偏旁；亦可门侧；避 site240 庭灯/site242 铜镜/site244 纺车位） —— */
    for (const [lx, ly, rot] of [
      [24.5, 44.5, 0], [56.5, 66.5, Math.PI / 5], [212.5, 44.5, Math.PI], [86.5, 92.5, Math.PI / 4],
      [CX - 18.5, 22, 0], [CX + 18.5, 50, Math.PI],
    ]) add('fengling', 'aq_fengling', lx, ly, { rot });

    /* —— Site245：庭院风铃 densify —— */
    for (const [lx, ly, rot] of [
      [36.5, 152.5, 0], [74.5, 154.5, Math.PI / 4], [98.5, 162.5, 0],
      [242.5, 152.5, Math.PI / 6], [264.5, 164.5, 0], [142.5, 170.5, Math.PI / 3],
    ]) add('fengling', 'aq_fengling', lx, ly, { rot });

    /* —— Site245：豪宅侧院/门侧风铃 densify —— */
    for (const [lx, ly, rot] of [
      [222.5, 178.5, 0], [240.5, 186.5, Math.PI / 5], [118.5, 186.5, 0],
      [172.5, 192.5, Math.PI / 4], [70.5, 188.5, 0], [132.5, 194.5, Math.PI],
    ]) add('fengling', 'aq_fengling', lx, ly, { rot });

    /* —— Site245：廊下竹帘 densify —— */
    for (const [lx, ly, rot] of [
      [30.5, 42.5, 0], [70.5, 58.5, Math.PI / 5], [208.5, 42.5, Math.PI], [92.5, 84.5, Math.PI / 4],
      [CX - 12.5, 30, 0], [CX + 12.5, 58, Math.PI],
    ]) add('zhulian', 'aq_zhulian', lx, ly, { rot });

    /* —— Site245：庭院竹帘 densify —— */
    for (const [lx, ly, rot] of [
      [52.5, 154.5, 0], [80.5, 166.5, Math.PI / 4], [104.5, 172.5, 0],
      [248.5, 154.5, Math.PI / 6], [272.5, 166.5, 0], [136.5, 172.5, Math.PI / 3],
    ]) add('zhulian', 'aq_zhulian', lx, ly, { rot });

    /* —— Site245：豪宅侧院竹帘 densify —— */
    for (const [lx, ly, rot] of [
      [218.5, 172.5, 0], [258.5, 184.5, Math.PI / 5], [102.5, 184.5, 0],
      [178.5, 190.5, Math.PI / 4], [66.5, 186.5, 0], [140.5, 192.5, Math.PI],
    ]) add('zhulian', 'aq_zhulian', lx, ly, { rot });

    /* —— Site245：廊下纱幔 densify —— */
    for (const [lx, ly, rot] of [
      [34.5, 48.5, 0], [54.5, 70.5, Math.PI / 5], [204.5, 48.5, Math.PI], [96.5, 98.5, Math.PI / 4],
      [CX - 28.5, 20, 0], [CX + 28.5, 48, Math.PI],
    ]) add('shaman', 'aq_shaman', lx, ly, { rot });

    /* —— Site245：庭院纱幔 densify —— */
    for (const [lx, ly, rot] of [
      [58.5, 156.5, 0], [84.5, 168.5, Math.PI / 4], [112.5, 174.5, 0],
      [252.5, 156.5, Math.PI / 6], [278.5, 168.5, 0], [130.5, 176.5, Math.PI / 3],
    ]) add('shaman', 'aq_shaman', lx, ly, { rot });

    /* —— Site245：豪宅侧院纱幔 densify —— */
    for (const [lx, ly, rot] of [
      [214.5, 170.5, 0], [262.5, 188.5, Math.PI / 5], [96.5, 188.5, 0],
      [184.5, 194.5, Math.PI / 4], [62.5, 190.5, 0], [146.5, 196.5, Math.PI],
    ]) add('shaman', 'aq_shaman', lx, ly, { rot });

    /* —— Site246：廊下茶盘 densify（曲廊侧偏旁；避 site243/site240） —— */
    for (const [lx, ly, rot] of [
      [22.8, 42.8, 0], [50.8, 54.8, Math.PI / 5], [224.8, 42.8, Math.PI], [84.8, 90.8, Math.PI / 4],
      [CX - 16.8, 28, 0], [CX + 16.8, 56, Math.PI],
    ]) add('chapan', 'aq_chapan', lx, ly, { rot });

    /* —— Site246：庭院茶盘 densify —— */
    for (const [lx, ly, rot] of [
      [40.8, 154.8, 0], [70.8, 160.8, Math.PI / 4], [96.8, 168.8, 0],
      [246.8, 154.8, Math.PI / 6], [270.8, 164.8, 0], [136.8, 170.8, Math.PI / 3],
    ]) add('chapan', 'aq_chapan', lx, ly, { rot });

    /* —— Site246：店前/豪宅茶盘 densify —— */
    for (const [lx, ly, rot] of [
      [20.8, 114.8, 0], [60.8, 120.8, Math.PI / 5], [180.8, 114.8, 0],
      [220.8, 120.8, Math.PI], [110.8, 126.8, Math.PI / 4], [254.8, 110.8, 0],
    ]) add('chapan', 'aq_chapan', lx, ly, { rot });

    /* —— Site246：廊下食盒 densify —— */
    for (const [lx, ly, rot] of [
      [26.8, 46.8, 0], [54.8, 58.8, Math.PI / 5], [228.8, 46.8, Math.PI], [88.8, 94.8, Math.PI / 4],
      [CX - 14.8, 32, 0], [CX + 14.8, 60, Math.PI],
    ]) add('shihe', 'aq_shihe', lx, ly, { rot });

    /* —— Site246：庭院食盒 densify —— */
    for (const [lx, ly, rot] of [
      [44.8, 158.8, 0], [74.8, 164.8, Math.PI / 4], [100.8, 172.8, 0],
      [250.8, 158.8, Math.PI / 6], [274.8, 168.8, 0], [144.8, 174.8, Math.PI / 3],
    ]) add('shihe', 'aq_shihe', lx, ly, { rot });

    /* —— Site246：店前/豪宅食盒 densify —— */
    for (const [lx, ly, rot] of [
      [24.8, 116.8, 0], [64.8, 122.8, Math.PI / 5], [184.8, 116.8, 0],
      [224.8, 122.8, Math.PI], [114.8, 128.8, Math.PI / 4], [258.8, 112.8, 0],
    ]) add('shihe', 'aq_shihe', lx, ly, { rot });

    /* —— Site246：廊下果盘 densify —— */
    for (const [lx, ly, rot] of [
      [32.8, 50.8, 0], [60.8, 62.8, Math.PI / 5], [232.8, 50.8, Math.PI], [92.8, 98.8, Math.PI / 4],
      [CX - 12.8, 36, 0], [CX + 12.8, 64, Math.PI],
    ]) add('guopan', 'aq_guopan', lx, ly, { rot });

    /* —— Site246：庭院果盘 densify —— */
    for (const [lx, ly, rot] of [
      [48.8, 162.8, 0], [78.8, 168.8, Math.PI / 4], [104.8, 176.8, 0],
      [254.8, 162.8, Math.PI / 6], [278.8, 172.8, 0], [148.8, 178.8, Math.PI / 3],
    ]) add('guopan', 'aq_guopan', lx, ly, { rot });

    /* —— Site246：店前/豪宅果盘 densify —— */
    for (const [lx, ly, rot] of [
      [28.8, 118.8, 0], [68.8, 124.8, Math.PI / 5], [188.8, 118.8, 0],
      [228.8, 124.8, Math.PI], [118.8, 130.8, Math.PI / 4], [262.8, 114.8, 0],
    ]) add('guopan', 'aq_guopan', lx, ly, { rot });

    /* —— Site237：廊下书案 densify（曲廊侧偏旁，不堵廊心） —— */
    for (const [lx, ly, rot] of [
      [28.5, 46.5, 0], [52.5, 58.5, Math.PI / 5], [228.5, 46.5, Math.PI], [88.5, 94.5, Math.PI / 4],
      [CX - 13.5, 24, 0], [CX + 13.5, 52, Math.PI],
    ]) add('shuan', 'aq_shuan', lx, ly, { rot });

    /* —— Site237：庭院石桌旁书案 densify —— */
    for (const [lx, ly, rot] of [
      [32.5, 158.5, 0], [56.5, 168.5, Math.PI / 4], [76.5, 176.5, 0],
      [248.5, 156.5, Math.PI / 6], [266.5, 166.5, 0], [140.5, 172.5, Math.PI / 3],
    ]) add('shuan', 'aq_shuan', lx, ly, { rot });

    /* —— Site237：书房外檐书案 densify —— */
    for (const [lx, ly, rot] of [
      [44.5, 122.5, 0], [64.5, 130.5, Math.PI / 5], [184.5, 122.5, 0], [214.5, 130.5, Math.PI],
      [108.5, 138.5, Math.PI / 4], [258.5, 118.5, 0],
    ]) add('shuan', 'aq_shuan', lx, ly, { rot });

    /* —— Site237：石桌旁棋盘 densify（贴石桌偏旁；≠棋枰桌 footprint） —— */
    for (const [lx, ly, rot] of [
      [38.5, 162.5, 0], [58.5, 172.5, Math.PI / 4], [78.5, 180.5, 0],
      [252.5, 160.5, Math.PI / 6], [270.5, 170.5, 0], [142.5, 176.5, Math.PI / 3],
    ]) add('qipan', 'aq_qipan', lx, ly, { rot });

    /* —— Site237：廊下棋盘 densify —— */
    for (const [lx, ly, rot] of [
      [36.5, 54.5, 0], [86.5, 100.5, Math.PI / 2], [232.5, 54.5, Math.PI],
      [CX - 9.5, 38, 0], [CX + 9.5, 66, Math.PI], [46.5, 88.5, 0],
    ]) add('qipan', 'aq_qipan', lx, ly, { rot });

    /* —— Site237：茶席侧棋盘 densify —— */
    for (const [lx, ly, rot] of [
      [CX - 16.5, 20, 0], [CX + 16.5, 20, Math.PI], [CX - 16.5, 34, 0], [CX + 16.5, 34, Math.PI],
      [24.5, 28.5, 0], [136.5, 44.5, Math.PI / 2],
    ]) add('qipan', 'aq_qipan', lx, ly, { rot });

    /* —— Site237：书房外檐笔架 densify —— */
    for (const [lx, ly, rot] of [
      [40.5, 126.5, 0], [60.5, 134.5, Math.PI / 5], [180.5, 126.5, 0], [210.5, 134.5, Math.PI],
      [104.5, 142.5, Math.PI / 4], [254.5, 122.5, 0],
    ]) add('bijia', 'aq_bijia', lx, ly, { rot });

    /* —— Site237：廊下笔架 densify —— */
    for (const [lx, ly, rot] of [
      [32.5, 52.5, 0], [48.5, 56.5, Math.PI / 5], [224.5, 52.5, Math.PI], [92.5, 92.5, Math.PI / 4],
      [CX - 8.5, 32, 0], [CX + 8.5, 60, Math.PI],
    ]) add('bijia', 'aq_bijia', lx, ly, { rot });

    /* —— Site237：茶席侧/石桌旁笔架 densify —— */
    for (const [lx, ly, rot] of [
      [CX - 17.5, 22, 0], [CX + 17.5, 22, Math.PI], [28.5, 166.5, 0], [48.5, 176.5, Math.PI / 4],
      [244.5, 164.5, Math.PI / 6], [130.5, 180.5, Math.PI / 3],
    ]) add('bijia', 'aq_bijia', lx, ly, { rot });

    /* —— Site236：廊下蒲团 densify（曲廊侧偏旁，不堵廊心） —— */
    for (const [lx, ly, rot] of [
      [30.5, 48.5, 0], [50.5, 56.5, Math.PI / 5], [230.5, 48.5, Math.PI], [90.5, 96.5, Math.PI / 4],
      [CX - 11.5, 26, 0], [CX + 11.5, 54, Math.PI],
    ]) add('putuan', 'aq_putuan', lx, ly, { rot });

    /* —— Site236：石桌旁蒲团 densify（贴石桌偏旁） —— */
    for (const [lx, ly, rot] of [
      [34.5, 160.5, 0], [54.5, 170.5, Math.PI / 4], [74.5, 178.5, 0],
      [250.5, 158.5, Math.PI / 6], [268.5, 168.5, 0], [138.5, 174.5, Math.PI / 3],
    ]) add('putuan', 'aq_putuan', lx, ly, { rot });

    /* —— Site236：庭院蒲团 densify —— */
    for (const [lx, ly, rot] of [
      [42.5, 168.5, 0], [62.5, 176.5, Math.PI / 5], [180.5, 168.5, 0], [210.5, 176.5, Math.PI],
      [100.5, 182.5, Math.PI / 4], [260.5, 128.5, 0],
    ]) add('putuan', 'aq_putuan', lx, ly, { rot });

    /* —— Site236：茶摊侧茶灶 densify（近货摊偏旁，不堵中线） —— */
    for (const [lx, ly, rot] of [
      [CX - 15.5, 14, 0], [CX + 15.5, 14, Math.PI], [CX - 15.5, 28, 0], [CX + 15.5, 28, Math.PI],
      [CX - 15.5, 42, 0], [CX + 15.5, 42, Math.PI],
    ]) add('chazao', 'aq_chazao', lx, ly, { rot });

    /* —— Site236：庭院茶灶 densify —— */
    for (const [lx, ly, rot] of [
      [36.5, 164.5, 0], [66.5, 172.5, Math.PI / 5], [186.5, 164.5, 0], [216.5, 172.5, Math.PI],
      [110.5, 178.5, Math.PI / 4], [254.5, 164.5, 0],
    ]) add('chazao', 'aq_chazao', lx, ly, { rot });

    /* —— Site236：廊下茶灶 densify —— */
    for (const [lx, ly, rot] of [
      [40.5, 52.5, 0], [84.5, 98.5, Math.PI / 2], [234.5, 52.5, Math.PI],
      [CX - 12.5, 36, 0], [CX + 12.5, 68, Math.PI], [48.5, 90.5, 0],
    ]) add('chazao', 'aq_chazao', lx, ly, { rot });

    /* —— Site236：石桌旁茶具 densify —— */
    for (const [lx, ly, rot] of [
      [30.5, 164.5, 0], [50.5, 174.5, Math.PI / 4], [70.5, 182.5, 0],
      [246.5, 162.5, Math.PI / 6], [264.5, 172.5, 0], [134.5, 178.5, Math.PI / 3],
    ]) add('chaju', 'aq_chaju', lx, ly, { rot });

    /* —— Site236：廊下茶具 densify —— */
    for (const [lx, ly, rot] of [
      [34.5, 50.5, 0], [46.5, 54.5, Math.PI / 5], [226.5, 50.5, Math.PI], [94.5, 94.5, Math.PI / 4],
      [CX - 10.5, 30, 0], [CX + 10.5, 58, Math.PI],
    ]) add('chaju', 'aq_chaju', lx, ly, { rot });

    /* —— Site236：茶摊侧茶具 densify —— */
    for (const [lx, ly, rot] of [
      [CX - 14.5, 18, 0], [CX + 14.5, 18, Math.PI], [CX - 14.5, 32, 0], [CX + 14.5, 32, Math.PI],
      [26.5, 26.5, 0], [134.5, 42.5, Math.PI / 2],
    ]) add('chaju', 'aq_chaju', lx, ly, { rot });

    /* —— Site227：主街两侧小货摊 densify（御街两侧偏旁，不堵中线） —— */
    for (const [lx, ly, rot] of [
      [CX - 13.5, 16, 0], [CX + 13.5, 16, Math.PI], [CX - 13.5, 30, 0], [CX + 13.5, 30, Math.PI],
      [CX - 13.5, 44, 0], [CX + 13.5, 44, Math.PI], [CX - 13.5, 58, 0], [CX + 13.5, 58, Math.PI],
      [CX - 13.5, 72, 0], [CX + 13.5, 72, Math.PI],
      [CX - 14.2, -108, 0], [CX + 14.2, -108, Math.PI], [CX - 16.5, -92, 0], [CX + 16.5, -92, Math.PI],
      [108, -100, Math.PI / 2], [188, -100, -Math.PI / 2],
    ]) add('huotan', 'aq_huotan', lx, ly, { rot });

    /* —— Site227：巷口货摊 densify —— */
    for (const [lx, ly, rot] of [
      [24.5, 24.5, 0], [132.5, 40.5, Math.PI / 2], [258.5, 50.5, Math.PI], [42.5, 146.5, 0],
      [CX - 16.5, 28, Math.PI / 2], [CX + 16.5, 52, -Math.PI / 2],
      [26.5, 70.5, 0], [142.5, 70.5, Math.PI],
    ]) add('huotan', 'aq_huotan', lx, ly, { rot });

    /* —— Site227：货架 densify（店侧/宅前空地） —— */
    for (const [lx, ly, rot] of [
      [CX - 12.8, 20, 0], [CX + 12.8, 20, Math.PI], [CX - 12.8, 36, 0], [CX + 12.8, 36, Math.PI],
      [CX - 12.8, 52, 0], [CX + 12.8, 52, Math.PI], [CX - 12.8, 68, 0], [CX + 12.8, 68, Math.PI],
      [234.5, 148.5, 0], [249.5, 148.5, Math.PI], [118.5, 162.5, 0], [133.5, 162.5, Math.PI],
      [80.5, 164.5, 0], [95.5, 164.5, Math.PI], [260.5, 125.5, 0], [276.5, 125.5, Math.PI],
    ]) add('huojia', 'aq_huojia', lx, ly, { rot });

    /* —— Site227：桥头货架 densify（岸旁偏置不堵桥心） —— */
    for (const [lx, ly, rot] of [
      [32.5, 89.5, 0], [62.5, 91.2, Math.PI / 2], [112.5, 89.8, 0], [172.5, 90.5, Math.PI / 2],
      [CX - 16.5, 88.5, 0], [CX + 16.5, 88.5, Math.PI],
    ]) add('huojia', 'aq_huojia', lx, ly, { rot });

    /* —— Site227：宅前/巷口晾晒 densify —— */
    for (const [lx, ly, rot] of [
      [28.5, 18.5, 0], [136.5, 34.5, Math.PI / 2], [252.5, 44.5, Math.PI], [48.5, 152.5, 0],
      [CX - 17.5, 42, Math.PI / 2], [CX + 17.5, 62, -Math.PI / 2],
      [30.5, 64.5, 0], [148.5, 64.5, Math.PI], [240.5, 82.5, Math.PI / 2], [116.5, 100.5, -Math.PI / 2],
      [60.5, 120.5, 0], [200.5, 120.5, Math.PI],
      [242.5, 152.5, 0], [126.5, 166.5, Math.PI / 2], [88.5, 168.5, 0], [268.5, 128.5, Math.PI],
    ]) add('liangshai', 'aq_liangshai', lx, ly, { rot });
    /* —— Site228：庭院石桌 densify（富户庭院/艮岳外围偏旁，不堵路） —— */
    for (const [lx, ly, rot] of [
      [32.5, 162.5, 0], [52.5, 172.5, Math.PI / 4], [72.5, 180.5, 0],
      [248.5, 160.5, Math.PI / 6], [266.5, 170.5, 0], [136.5, 176.5, Math.PI / 3],
      [96.5, 174.5, 0], [258.5, 120.5, Math.PI],
    ]) add('shizhuo', 'aq_shizhuo', lx, ly, { rot });

    /* —— Site228：巷角石桌 densify —— */
    for (const [lx, ly, rot] of [
      [22.5, 28.5, 0], [130.5, 42.5, Math.PI / 2], [260.5, 52.5, Math.PI],
      [CX - 16.5, 32, Math.PI / 2], [CX + 16.5, 62, -Math.PI / 2],
      [26.5, 70.5, 0], [142.5, 70.5, Math.PI],
    ]) add('shizhuo', 'aq_shizhuo', lx, ly, { rot });

    /* —— Site228：亭侧石凳 densify（井亭/路亭旁，靠边） —— */
    for (const [lx, ly, rot] of [
      [44.5, 51.5, 0], [240.5, 51.5, Math.PI], [156.5, 133.5, Math.PI / 2],
      [CX - 10.5, 22, 0], [CX + 10.5, 50, Math.PI], [CX - 10.5, 80, 0],
      [36.5, 93.5, 0], [88.5, 94.2, Math.PI / 2], [228.5, 94.5, -Math.PI / 2],
      [40.5, 148.5, 0], [50.5, 148.5, Math.PI],
    ]) add('seat_shideng', 'aq_seat_shideng', lx, ly, { rot });

    /* —— Site228：桥头石凳 densify（岸旁偏置不堵桥心） —— */
    for (const [lx, ly, rot] of [
      [30.5, 85.5, 0], [60.5, 90.5, Math.PI / 2], [110.5, 85.5, 0], [170.5, 90.5, Math.PI / 2],
      [210.5, 85.5, 0], [250.5, 90.5, Math.PI / 2],
      [CX - 13.5, 83.5, 0], [CX + 13.5, 83.5, Math.PI],
    ]) add('seat_shideng', 'aq_seat_shideng', lx, ly, { rot });

    /* —— Site228：树下/庭院石凳 densify —— */
    for (const [lx, ly, rot] of [
      [34.5, 166.5, 0], [48.5, 166.5, Math.PI / 4], [68.5, 176.5, 0],
      [252.5, 164.5, 0], [268.5, 174.5, Math.PI / 6], [140.5, 180.5, 0],
      [100.5, 178.5, Math.PI / 3], [262.5, 124.5, Math.PI],
      [28.5, 32.5, 0], [134.5, 46.5, Math.PI / 2],
    ]) add('seat_shideng', 'aq_seat_shideng', lx, ly, { rot });

    /* —— Site228：庭院/亭侧棋枰 densify（对弈点景，少而精） —— */
    for (const [lx, ly, rot] of [
      [38.5, 168.5, 0], [56.5, 178.5, Math.PI / 4], [244.5, 166.5, 0], [128.5, 182.5, Math.PI / 6],
      [CX - 14.5, 46, Math.PI / 2], [CX + 14.5, 74, -Math.PI / 2],
      [46.5, 55.5, 0], [236.5, 55.5, Math.PI],
      [42.5, 152.5, 0], [254.5, 156.5, Math.PI / 3],
      [24.5, 36.5, 0], [148.5, 74.5, Math.PI],
    ]) add('qiping', 'aq_qiping', lx, ly, { rot });


    /* —— Site230：影壁前香炉 densify（贴影壁/照壁偏旁，不堵路） —— */
    for (const [lx, ly, rot] of [
      [CX - 11.5, 8.2, 0], [CX + 11.5, 8.2, 0],
      [244.5, 150.5, 0], [136.5, 164.5, 0], [78.5, 146.5, Math.PI],
      [20.5, 18.8, Math.PI / 2], [133.5, 34.8, -Math.PI / 2], [266.5, 42.8, Math.PI / 2],
      [20.5, 50.8, Math.PI / 2], [173.5, 42.8, -Math.PI / 2],
    ]) add('xianglu', 'aq_xianglu', lx, ly, { rot });

    /* —— Site230：宅门内/庭院角香炉 densify —— */
    for (const [lx, ly, rot] of [
      [36.5, 158.5, 0], [54.5, 168.5, Math.PI / 4], [250.5, 156.5, 0],
      [140.5, 172.5, Math.PI / 6], [100.5, 170.5, 0], [262.5, 118.5, Math.PI],
      [30.5, 148.5, 0], [246.5, 148.5, Math.PI],
    ]) add('xianglu', 'aq_xianglu', lx, ly, { rot });

    /* —— Site230：巷口小龛烛台 densify —— */
    for (const [lx, ly, rot] of [
      [22.5, 22.5, 0], [128.5, 38.5, Math.PI / 2], [268.5, 48.5, Math.PI],
      [CX - 15.5, 26, Math.PI / 2], [CX + 15.5, 58, -Math.PI / 2],
      [28.5, 66.5, 0], [146.5, 66.5, Math.PI],
      [42.5, 150.5, 0], [238.5, 150.5, Math.PI],
      [CX - 12.5, 18, 0], [CX + 12.5, 48, Math.PI],
    ]) add('zhutai', 'aq_zhutai', lx, ly, { rot });

    /* —— Site230：亭侧/案几烛台 densify —— */
    for (const [lx, ly, rot] of [
      [46.5, 53.5, 0], [238.5, 53.5, Math.PI], [158.5, 135.5, Math.PI / 2],
      [CX - 11.5, 24, 0], [CX + 11.5, 52, Math.PI],
      [38.5, 95.5, 0], [90.5, 96.2, Math.PI / 2],
      [44.5, 154.5, 0], [252.5, 158.5, Math.PI / 3],
    ]) add('zhutai', 'aq_zhutai', lx, ly, { rot });

    /* —— Site230：影壁前/宅门内小供案 densify —— */
    for (const [lx, ly, rot] of [
      [CX - 11.5, 10.5, 0], [CX + 11.5, 10.5, 0],
      [240.5, 152.5, 0], [128.5, 166.5, 0], [82.5, 145.5, Math.PI],
      [34.5, 160.5, 0], [56.5, 170.5, Math.PI / 4], [248.5, 162.5, 0],
      [134.5, 178.5, Math.PI / 6], [98.5, 176.5, 0],
    ]) add('gongan_s', 'aq_gongan_s', lx, ly, { rot });

    /* —— Site230：亭侧/庭院角小供案 densify —— */
    for (const [lx, ly, rot] of [
      [48.5, 57.5, 0], [234.5, 57.5, Math.PI], [154.5, 137.5, Math.PI / 2],
      [40.5, 156.5, 0], [256.5, 154.5, Math.PI / 3],
      [26.5, 34.5, 0], [150.5, 72.5, Math.PI],
      [70.5, 178.5, 0], [260.5, 168.5, Math.PI],
    ]) add('gongan_s', 'aq_gongan_s', lx, ly, { rot });

    return counts;
  }

  root.SongchengStreetProps = {
    place,
    site204: { streetProps: true, shideng: true, shiteng: true, huagang: true, lampPole: true, kitbash: true },
    site212: { yingbi: true, zhaobi: true, huaxin: true, screenBase: true, kitbash: true, alleyStamp: true },
    site215: { hitching: true, shuanma: true, shangma: true, ganddang: true, curbMarker: true, kitbash: true },
    site216: { louwindow: true, windowLou: true, wallHuaziang: true, brickToukong: true, latticeWall: true, kitbash: true, alleyStamp: true, genyueStamp: true },
    site217: { pavilions: true, jingting: true, luting: true, paifangS: true, roofTing: true, kitbash: true },
    site218: { chuihuamen: true, chuihua: true, menlouS: true, menzhao: true, menzhu: true, kitbash: true },
    site219: { rockery: true, rockTaihu: true, rockDieshi: true, rockPeakS: true, plantRockMoss: true, kitbash: true, haozhaiStamp: true, genyueStamp: true, langStamp: true },
    site220: { meirenkao: true, feilaichi: true, zuokan: true, benchLang: true, kitbash: true },
    site221: { biane: true, duilian: true, zhaopaiS: true, hanging: true, kitbash: true, shopLintel: true, houseDoor: true, alleyMouth: true, pavilionSide: true },
    site222: { baogu: true, stoneBaogu: true, stoneMendun: true, stoneLu: true, kitbash: true, gateStamp: true, alleyStamp: true, haozhaiStamp: true },
    site223: { penjing: true, potPenjing: true, bedHuatan: true, stoneShitai: true, kitbash: true, courtyard: true, alleyMouth: true, bridgeHead: true, pavilionSide: true, doorFront: true },
    site224: { shishi: true, stoneShishi: true, stoneShishiS: true, kitbash: true, gateStamp: true, bridgeHead: true, plazaEntrance: true, yamenTempleFront: true },
    site225: { gongdeng: true, lanternGong: true, lanternSha: true, lanternStand: true, kitbash: true, lintel: true, pavilionCorner: true, bridgeRail: true, alleyMouth: true, haozhaiCorridor: true },
    site226: { zhuli: true, fenceZhuli: true, fenceHuali: true, gateChaifei: true, kitbash: true, alleyMouth: true, houseSide: true, gardenEdge: true, bridgePath: true },
    site227: { huotan: true, stallHuotan: true, rackHuojia: true, poleLiangshai: true, kitbash: true, mainStreet: true, alleyMouth: true, bridgeHead: true, houseFront: true },
    site228: { shizhuo: true, seatShizhuo: true, seatShideng: true, seatQiping: true, kitbash: true, courtyard: true, alleyCorner: true, pavilionSide: true, bridgeHead: true, underTree: true },
    site229: { shuigang: true, propShuigang: true, propJinglan: true, propShuitong: true, kitbash: true, courtyardCorner: true, alleyMouth: true, wellSide: true, kitchenBack: true, bridgeHead: true },
    site230: { xianglu: true, propXianglu: true, propZhutai: true, propGonganS: true, kitbash: true, yingbiFront: true, houseGateInner: true, pavilionSide: true, alleyNiche: true, courtyardCorner: true },
    site231: { chaidui: true, propChaidui: true, propCaoduo: true, propLiangdai: true, kitbash: true, houseBack: true, kitchenSide: true, alleyMouth: true, dockSide: true, stableSide: true },
    site232: { jiutan: true, propJiutan: true, propTaoweng: true, propJiuqi: true, kitbash: true, tavernFront: true, alleyMouth: true, dockSide: true, kitchenOut: true, courtyardWall: true },
    site233: { shima: true, propShima: true, propNianpan: true, propShijiu: true, kitbash: true, kitchenSide: true, houseBack: true, millAlley: true, grainSackSide: true, stableSide: true },
    site234: { liangyi: true, propLiangyi: true, propYulou: true, propZhukuang: true, kitbash: true, houseBack: true, kitchenSide: true, alleyMouth: true, dockSide: true },
    site235: { jilong: true, propJilong: true, propNiaolong: true, propYashe: true, kitbash: true, houseBack: true, kitchenSide: true, alleyMouth: true, stableSide: true },
    site236: { putuan: true, propPutuan: true, propChazao: true, propChaju: true, kitbash: true, corridorSide: true, stoneTableSide: true, courtyard: true, teaStallSide: true },
    site237: { shuan: true, propShuan: true, propQipan: true, propBijia: true, kitbash: true, corridorSide: true, stoneTableSide: true, studyEave: true, teaSeatSide: true },
    site238: { huajia: true, propHuajia: true, propZhuji: true, propBogu: true, kitbash: true, courtyard: true, corridorSide: true, haozhaiSide: true, teaSeatSide: true },
    site239: { huangzi: true, propChuanleng: true, propHuangzi: true, propZhaohuang: true, kitbash: true, shopDoor: true, alleyMouth: true, tavernEave: true, teaStallEave: true },
    site240: { tingdeng: true, propTingdeng: true, propShuipen: true, propXishoubo: true, kitbash: true, courtyard: true, gateFront: true, corridorSide: true, yingbiSide: true },
    site241: { suoyi: true, propSuoyi: true, propDouli: true, propBiandan: true, kitbash: true, houseBack: true, alleyMouth: true, dockSide: true, kitchenSide: true },
    site242: { tongjing: true, propTongjing: true, propShuzhuang: true, propYanzhi: true, kitbash: true, boudoirEave: true, corridorTable: true, haozhaiCourtyard: true },
    site243: { yugang: true, propYugang: true, propHuapenjia: true, propYingwujia: true, kitbash: true, courtyard: true, corridorSide: true, haozhaiSide: true },
    site244: { fangche: true, propFangche: true, propXiubeng: true, propXiankuang: true, kitbash: true, courtyard: true, corridorSide: true, haozhaiSide: true },
    site245: { fengling: true, propFengling: true, propZhulian: true, propShaman: true, kitbash: true, courtyard: true, corridorSide: true, haozhaiSide: true, eaveGate: true },
    site246: { chapan: true, propChapan: true, propShihe: true, propGuopan: true, kitbash: true, courtyard: true, corridor: true, shop: true, haozhai: true },
  };
})(typeof window !== 'undefined' ? window : globalThis);
