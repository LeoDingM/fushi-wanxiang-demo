/* Site204 · 鹰山宋城街具点景：石灯笼/石凳/花缸/挂灯杆 atlas kitbash。
 * Site212 · 巷口/入口影壁照壁点景 densify（aq_yingbi/aq_zhaobi；不堵主路）。
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

  function place(put, ctx) {
    const CX = (ctx && ctx.CX) != null ? ctx.CX : 72;
    const counts = { shideng: 0, shiteng: 0, huagang: 0, lamp_pole: 0, yingbi: 0, zhaobi: 0 };
    function add(kind, type, lx, ly, more) {
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

    return counts;
  }

  root.SongchengStreetProps = {
    place,
    site204: { streetProps: true, shideng: true, shiteng: true, huagang: true, lampPole: true, kitbash: true },
    site212: { yingbi: true, zhaobi: true, huaxin: true, screenBase: true, kitbash: true, alleyStamp: true },
  };
})(typeof window !== 'undefined' ? window : globalThis);
