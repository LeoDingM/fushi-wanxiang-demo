/* 影视城古镇 street buildings: 清风茶坊, shop shell (kitbash facade via aq_f_*), 望川楼 2F 酒楼.
 * Site208：望川楼/茶坊檐下彩绘梁枋·额枋·斗拱色块·檐板 atlas 细化。
 * Site210：旗幡/帷幔/流苏/檐下挂饰 atlas 点缀（与幌子互补）。未经Leo确认. */
(function (root) {
  'use strict';
  const { A, shade, C, H } = root.AncientCore;
  const X = root.AncientParts;
  const { RED, RED_W, WOOD, WOOD_D, PLASTER, PLASTER_W, STONE, GOLD } = C;
  /** timber-framed plaster side wall — atlas wall_brick_W + wall_plaster_W modules (井槐里 bay kitbash). */
  function sideWall(d, x, y0, y1, z0, z1, o = {}) {
    const AT = root.AncientAtlas, h = H(d);
    AT.fillW(d, 'wall_brick_W', x, y0, z0, y1, z0 + 0.5);
    AT.fillW(d, 'wall_plaster_W', x, y0, z0 + 0.5, y1, z1);
    // timber posts stamped as thin QS strips on top of modules
    const n = Math.max(1, Math.round((y1 - y0) / 2.4));
    for (let i = 0; i <= n; i++) { const y = y0 + (y1 - y0) * i / n; h.QW(x - 0.01, y - 0.09, z0 + 0.5, y + 0.09, z1, shade(WOOD, 0.85)); }
    h.QW(x - 0.01, y0, z0 + (z1 - z0) * 0.55, y1, z0 + (z1 - z0) * 0.55 + 0.14, shade(WOOD, 0.85));
  }
  /** interior seen through an open bay: dark back, a table + benches + counter shapes, optional shelves */
  function interior(d, y, x0, x1, z0, z1, o = {}) {
    const h = H(d), dk = o.dark || '#33261d';
    h.QS(y, x0, z0, x1, z1, dk);
    h.QS(y - 0.01, x0, z0, x1, z0 + 0.06, shade(dk, 0.7));
    if (o.shelves) { for (let z = z0 + 0.7; z < z1 - 0.3; z += 0.45) { h.QS(y - 0.02, x0 + 0.1, z, x1 - 0.1, z + 0.05, shade(WOOD, 0.75)); const R = d.R; for (let x = x0 + 0.2; x < x1 - 0.2; x += 0.16 + R() * 0.1) h.QS(y - 0.03, x, z + 0.05, x + 0.1, z + 0.15 + R() * 0.15, o.shelves[(R() * o.shelves.length) | 0]); } }
    if (o.tables) for (const tx of o.tables) {
      h.QS(y - 0.05, tx - 0.45, z0 + 0.72, tx + 0.45, z0 + 0.8, shade(WOOD, 1.05), shade(WOOD, 0.5));
      h.QS(y - 0.05, tx - 0.4, z0, tx - 0.34, z0 + 0.72, shade(WOOD, 0.7)); h.QS(y - 0.05, tx + 0.34, z0, tx + 0.4, z0 + 0.72, shade(WOOD, 0.7));
      h.QS(y - 0.06, tx - 0.7, z0 + 0.42, tx - 0.5, z0 + 0.47, shade(WOOD, 0.9)); h.QS(y - 0.06, tx + 0.5, z0 + 0.42, tx + 0.7, z0 + 0.47, shade(WOOD, 0.9));
      if (o.tea) { h.QS(y - 0.07, tx - 0.12, z0 + 0.8, tx + 0.02, z0 + 0.92, '#e8e4d8', '#8a8478'); h.QS(y - 0.07, tx + 0.12, z0 + 0.8, tx + 0.2, z0 + 0.86, '#b8d0c0'); }
    }
    if (o.counter) { const [a, b] = o.counter; d.box(a, y - 0.35, z0, b, y - 0.05, z0 + 1.0, WOOD, { line: shade(WOOD, 0.45), top: shade(WOOD, 1.2) }); h.line([a, y - 0.35, z0 + 0.5], [b, y - 0.35, z0 + 0.5], shade(WOOD, 0.7)); }
  }
  /** bamboo blind rolled half-down over a window bay */
  function blind(d, y, x0, x1, z0, z1) {
    const h = H(d), c = '#c8ae6c';
    h.QS(y, x0, z0, x1, z1, c, shade(c, 0.55));
    for (let z = z0 + 0.06; z < z1; z += 0.06) h.line([x0, y - 0.005, z], [x1, y - 0.005, z], shade(c, 0.85));
    h.QS(y - 0.01, x0 - 0.03, z0 - 0.08, x1 + 0.03, z0, shade(c, 0.75), shade(c, 0.45));
    h.line([x0 + 0.25, y - 0.012, z1], [x0 + 0.25, y - 0.012, z0 - 0.08], '#8a2a1c'); h.line([x1 - 0.25, y - 0.012, z1], [x1 - 0.25, y - 0.012, z0 - 0.08], '#8a2a1c');
  }
  root.AncientStreet = { sideWall, interior, blind };

  // ---------------- 清风茶坊 tea house: 3 bays 10 x 7 m, 悬山 roof, open centre bay with tea tables, 茶 banner ----------------
  A.define('aq_chafang', {
    name: '清风茶坊', geo: [-0.8, -1.4, 0, 10.8, 7.6, 7.2], fp: [[0, 0, 10, 7]], prune: true,
    draw(d) {
      const h = H(d), zf = 0.45;
      X.platform(d, 0, 0.2, 10, 7, zf, { steps: [[5, 3.2]] });
      sideWall(d, 0.05, 0.9, 7, zf, 3.75);
      interior(d, 1.0, 3.15, 6.85, zf, 3.6, { tables: [4.2, 5.9], tea: true });
      const xs = X.hallFront(d, 0.75, 0, zf, 3.75, [{ w: 3, fill: 'win', style: 'bubujin', sill: 0.8 }, { w: 4, fill: 'skip' }, { w: 3, fill: 'win', style: 'bubujin', sill: 0.8 }], { colC: RED, frame: RED_W, sillCol: C.BRICK });
      blind(d, 0.97, 0.2, 2.8, 2.5, 3.5); blind(d, 0.97, 7.2, 9.8, 2.7, 3.5);
      X.efang(d, 0.82, -0.05, 10.05, 3.45, 3.8, { base: '#2f5a86', alt: '#3f7a6a' });
      /* Site208：茶坊檐下斗拱色块 + 彩画带 + 檐板 */
      X.dougong(d, 0.78, [1.5, 5.0, 8.5], 3.35, { size: 0.7 });
      if (X.caihuaBand) X.caihuaBand(d, 0.76, 0.2, 9.8, 3.2);
      if (X.eaveBoard) X.eaveBoard(d, 0.7, 0.1, 9.9, 3.85);
      /* Site210：茶坊檐下帷幔/流苏/挂饰（开放间；旗幡靠边，避开茶幌） */
      if (X.softDecorStamp) X.softDecorStamp(d, 0.4, 0.55, 3.15, 9.6, { weiman: true, tassel: true, hang: true, qifan: true, qifanX: 1.1, weimanSy: 0.6, tasselStep: 1.5, hangStep: 2.2, tasselZ: -0.2, hangZ: -0.1, qifanZ: 0.35 });
      // hanging 楣子 lattice frieze in the open bay
      X.lattice(d, 0.8, 3.15, 3.15, 6.85, 3.45, { frame: RED_W, style: 'vbars', paper: '#33261d' });
      X.plaque(d, 0.7, 5, 2.85, '清风茶坊', { size: 15 });
      X.roof(d, { x0: -0.7, x1: 10.7, y0: -0.6, y1: 7.6, z: 4.15, rise: 2.5, type: 'xuanshan', over: 0.6, lift: 0.18, beasts: 0, ridgeH: 0.32, gableCol: PLASTER_W });
      for (const x of [1.2, 8.8]) X.lantern(d, x, -0.45, 3.95, { r: 0.22, cord: 0.3, text: '茶' });
      X.banner(d, 10.25, 0.15, 5.6, '茶', { col: '#2f6a58', len: 1.4, w: 0.6, size: 18, border: '#e8d9a8', pole: false });
      h.line([10.25, 0.15, 6.0], [10.25, 0.15, 0.45], WOOD_D, 2); h.line([10.25, 0.15, 5.65], [9.95, 0.15, 5.65], WOOD_D, 1);
    },
    emit(d) {
      const h = H(d);
      for (const x of [1.2, 8.8]) X.lanternGlow(d, x, -0.45, 3.95, { r: 0.22, cord: 0.3 });
      h.QS(0.98, 3.2, 0.5, 6.8, 3.0, 'rgba(255,160,70,0.22)');
      h.QS(0.96, 0.3, 1.3, 2.7, 2.45, 'rgba(255,190,110,0.3)'); h.QS(0.96, 7.3, 1.3, 9.7, 2.6, 'rgba(255,190,110,0.3)');
    },
  });

  // ---------------- shop row units: 2 bays 7 x 6 m, 硬山 with brick gables, signage + 幌子 ----------------
  const SHOPS = {
    dangpu: { name: '恒通当铺', sign: '當', plaque: '恒通當鋪', wall: true, col: '#5a3a2a', banner: null },
    yaopu: { name: '济世堂药铺', sign: '藥', plaque: '濟世堂', shelves: ['#8a6a3a', '#b08850', '#6a4a2a', '#c8b080'], banner: { t: '丸散膏丹', col: '#e8dcc0', tc: '#2a2a2a' } },
    buzhuang: { name: '锦绣布庄', sign: '布', plaque: '錦繡布莊', shelves: ['#b03a3a', '#3a5a9a', '#d8b050', '#3a7a5a', '#e8e0d0', '#8a3a7a'], banner: { t: '綾羅綢緞', col: '#2f4f86' } },
    gaobing: { name: '王记糕饼', sign: '餅', plaque: '王記糕餅', counter: true, banner: { t: '糕', col: '#c8322c' } },
    zahuo: { name: '万福杂货', sign: '雜', plaque: '萬福雜貨', shelves: ['#8a7a5a', '#6a8a9a', '#c8a060', '#5a5a4a', '#a8c8a8'], goods: true, banner: { t: '雜貨', col: '#7a5a2a' } },
  };
  for (const [k, S] of Object.entries(SHOPS)) {
    /* Site194 kitbash: aq_shop_* is a depth shell (台基+山墙+屋面+侧墙) only.
     * South facade detail is assembled from aq_f_* atlas modules in rongqiao_ancient_town. */
    A.define('aq_shop_' + k, {
      name: S.name, geo: [-0.5, -0.4, 0, 7.4, 6.4, 7.2], fp: [[0, 0, 7, 6]], prune: true,
      draw(d) {
        const h = H(d), zf = 0.35, F = 0.45;
        X.platform(d, 0, 0.4, 7, 6, zf, {});
        /* west brick gable kept for depth silhouette; front facade painted by aq_f_* */
        d.box(0, F + 0.2, 0, 0.4, 6, 4.3, C.BRICK, { line: shade(C.BRICK, 0.5), west: C.BRICK_W, top: shade(C.BRICK, 1.1) });
        d.box(6.55, F + 0.2, 0, 7, 6, 4.3, C.BRICK, { line: shade(C.BRICK, 0.5), west: C.BRICK_W, top: shade(C.BRICK, 1.1) });
        d.coursesW(0, F + 0.2, 6, 0.55, 4.3, 0.16, shade(C.BRICK_W, 0.82), 0.5);
        sideWall(d, 0.08, F + 0.5, 6, zf, 3.9);
        /* dark rear wall so open bays read depth when modules leave gaps */
        h.QS(5.9, 0.5, zf, 6.5, 3.7, '#2a1e16');
        /* Site198+205：店铺硬山瓦顶鸱吻 + dense 脊瓦/瓦当/滴水/瓦垄/檐口 */
        X.roof(d, { x0: -0.1, x1: 7.2, y0: 0.1, y1: 6.3, z: 4.4, rise: 2.2, type: 'yingshan', lift: 0.1, ridgeH: 0.34, chiwen: true, dense: true, site205: true, gableCol: C.BRICK_W, gableBrick: true, barge: '#6e6a64' });
      },
    });
  }
  function geshanDoor(d, y, x0, z0, x1, z1) { X.geshan(d, y, x0, z0, x1, z1, 2, { frame: '#3a2a20', style: 'grid' }); }

  // ---------------- 望川楼 2F restaurant (酒楼): 5 bays 15 x 9 m, 彩楼欢门 decorated gate, 平座 balcony, 歇山 roof, 酒 flag ----------------
  A.define('aq_jiulou', {
    name: '望川楼(酒楼)', geo: [-1.2, -2.6, 0, 16.2, 10.4, 13], fp: [[0, 0, 15, 9]], prune: true,
    draw(d) {
      const h = H(d), zf = 0.5, z1 = 3.7, z2 = 5.1, z3 = 7.8, F2 = 2.9;
      X.platform(d, 0, 0, 15, 9, zf, { steps: [[7.5, 3.6]] });
      sideWall(d, 0.05, 1.2, 9, zf, z1, { col: PLASTER_W });
      interior(d, 1.4, 3.1, 11.9, zf, z1 - 0.2, { tables: [4.4, 6.6, 8.6, 10.6], tea: true });
      X.hallFront(d, 1.05, 0, zf, z1, [{ w: 3, fill: 'door', n: 4, style: 'grid' }, { w: 3, fill: 'skip' }, { w: 3, fill: 'skip' }, { w: 3, fill: 'skip' }, { w: 3, fill: 'door', n: 4, style: 'grid' }], { colC: RED, frame: RED_W });
      X.efang(d, 1.12, -0.05, 15.05, z1 - 0.35, z1, {});
      X.dougong(d, 0.95, [1.5, 4.5, 7.5, 10.5, 13.5], z1, { size: 0.75 });
      /* Site208：一层檐下彩画带 + 檐板密实色块 */
      if (X.caihuaBand) X.caihuaBand(d, 0.9, 0.2, 14.8, z1 - 0.55);
      if (X.eaveBoard) X.eaveBoard(d, 0.88, 0.1, 14.9, z1 + 0.05);
      /* Site210：一层檐下帷幔/流苏/挂饰 */
      if (X.softDecorStamp) X.softDecorStamp(d, 0.5, 0.75, z1 - 0.7, 14.5, { weiman: true, tassel: true, hang: true, qifan: false, weimanSy: 0.55, tasselStep: 1.6, hangStep: 2.4, tasselZ: -0.15, hangZ: -0.05 });
      // 腰檐 lower eave (lean-to) over the ground-floor dougong
      X.roof(d, { x0: -0.6, x1: 15.6, y0: 0.25, y1: 2.05, z: 4.62, rise: 0.45, type: 'xuanshan', lift: 0.22, ridgeH: 0, chiwen: false, over: 0.01, gableCol: RED_W });
      X.leanW(d, -0.6, 0.7, 0.25, 9.4, 4.62, 5.15);
      // 平座 balcony deck, then the upper floor set back behind it
      d.box(-0.2, 1.9, z2 - 0.3, 15.2, F2 + 0.1, z2, '#7a4a2c', { line: '#3a2014', south: '#6a3e24', top: '#8a5634' });
      sideWall(d, 0.75, F2 + 0.2, 9, z2, z3, {});
      X.hallFront(d, F2 - 0.25, 0.7, z2, z3, [{ w: 2.72, fill: 'win', sill: 0.6, style: 'grid' }, { w: 2.72, fill: 'win', sill: 0.6, style: 'diamond' }, { w: 2.72, fill: 'door', n: 4, style: 'grid' }, { w: 2.72, fill: 'win', sill: 0.6, style: 'diamond' }, { w: 2.72, fill: 'win', sill: 0.6, style: 'grid' }], { colC: RED, frame: RED_W, sillCol: RED_W, colR: 0.13 });
      X.efang(d, F2 - 0.2, 0.65, 14.35, z3 - 0.3, z3, {});
      X.dougong(d, F2 - 0.35, [2.3, 4.9, 7.5, 10.1, 12.7], z3, { size: 0.8 });
      /* Site208：二层额枋下彩画带 + 檐板 */
      if (X.caihuaBand) X.caihuaBand(d, F2 - 0.4, 0.8, 14.2, z3 - 0.5);
      if (X.eaveBoard) X.eaveBoard(d, F2 - 0.42, 0.7, 14.3, z3 + 0.05);
      /* Site210：二层平座下帷幔/流苏 + 彩楼欢门旁旗幡（避开酒幌） */
      if (X.softDecorStamp) X.softDecorStamp(d, 1.0, F2 - 0.55, z3 - 0.65, 14.0, { weiman: true, tassel: true, hang: true, qifan: false, weimanSy: 0.5, tasselStep: 1.7, hangStep: 2.5, tasselZ: -0.12, hangZ: 0 });
      if (X.bannerQifan) {
        X.bannerQifan(d, 3.6, -0.95, 6.85, { sx: 0.8, sy: 0.85 });
        X.bannerQifan(d, 11.4, -0.95, 6.85, { sx: 0.8, sy: 0.85 });
      }
      for (const x of [2.3, 7.5, 12.7]) X.lantern(d, x, F2 - 0.75, z3 + 0.15, { r: 0.22, cord: 0.35 });
      const ry = 2.0; h.QS(ry, -0.2, z2, 15.2, z2 + 0.08, '#8a2a1c', '#4a140c'); h.QS(ry, -0.2, z2 + 0.85, 15.2, z2 + 0.95, '#a0342a', '#4a140c');
      for (let x = -0.2; x <= 15.25; x += 0.5) h.line([x, ry, z2], [x, ry, z2 + 0.85], '#7a2418', Math.abs((x + 0.2) % 1.5) < 0.1 ? 2 : 1);
      h.QS(ry - 0.01, -0.2, z2 + 0.42, 15.2, z2 + 0.48, '#8a2a1c');
      h.QW(-0.2, 2.0, z2, F2 + 0.1, z2 + 0.95, null, '#7a2418');
      X.roof(d, { x0: -0.9, x1: 15.9, y0: 2.0, y1: 10.3, z: z3 + 1.22, rise: 3.2, type: 'xieshan', lift: 0.55, beasts: 3, gable: 0.42, dense: true, ridgeH: 0.4 });
      // 彩楼欢门: decorated timber gateway frame with pennants, standing proud of the facade
      const gx0 = 4.4, gx1 = 10.6, gy = -0.75;
      for (const x of [gx0, gx1]) { h.column(x, gy, 0, 6.6, 0.11, '#b8342a'); h.column(x + (x === gx0 ? 0.9 : -0.9), gy, 0, 5.8, 0.09, '#b8342a'); }
      for (const [z, a, b] of [[6.4, gx0 - 0.3, gx1 + 0.3], [5.75, gx0, gx1], [5.1, gx0 + 0.9, gx1 - 0.9]]) { h.QS(gy - 0.05, a, z - 0.1, b, z + 0.1, '#2f5a86', '#1e3654'); h.line([a, gy - 0.06, z], [b, gy - 0.06, z], GOLD); }
      for (let x = gx0 - 0.1; x <= gx1 + 0.1; x += 0.45) { h.pline([[x, gy - 0.07, 6.3], [x + 0.22, gy - 0.07, 6.0], [x + 0.45, gy - 0.07, 6.3]], '#d8402e', 1); }
      for (let x = gx0 + 0.2; x < gx1; x += 0.5) d.face([[x, gy - 0.08, 5.65], [x + 0.3, gy - 0.08, 5.65], [x + 0.15, gy - 0.08, 5.3]], ['#d8b45a', '#c8322c', '#3f7a6a'][Math.round(x * 2) % 3], null);
      for (let x = gx0 - 0.2; x <= gx1 + 0.2; x += (gx1 - gx0 + 0.4) / 6) { h.line([x, gy - 0.08, 6.6], [x, gy - 0.08, 7.2], '#8a2a1c'); d.face([[x, gy - 0.08, 7.2], [x + 0.32, gy - 0.08, 7.05], [x, gy - 0.08, 6.9]], '#e8c050', '#8a6a20'); }
      X.plaque(d, gy - 0.1, 7.5, 4.55, '望川樓', { size: 17, w: 2.6 });
      // 酒 flag on a tall pole at the corner
      h.line([15.6, -0.9, 0], [15.6, -0.9, 9.6], WOOD_D, 3);
      X.banner(d, 15.25, -0.95, 9.4, '酒', { col: '#e8e0c8', tc: '#a01e18', len: 2.4, w: 0.75, size: 26, border: '#3a5a8a', pole: false });
      h.line([15.6, -0.95, 9.42], [14.85, -0.95, 9.42], WOOD_D, 2);
      for (const x of [0.8, 3.2, 11.8, 14.2]) X.lantern(d, x, 0.35, 4.5, { r: 0.24, cord: 0.15 });
    },
    emit(d) {
      const h = H(d);
      for (const x of [0.8, 3.2, 11.8, 14.2]) X.lanternGlow(d, x, 0.35, 4.5, { r: 0.24, cord: 0.15 });
      for (const x of [2.3, 7.5, 12.7]) X.lanternGlow(d, x, 2.15, 7.95, { r: 0.22, cord: 0.35 });
      h.QS(1.38, 3.2, 0.6, 11.8, 3.4, 'rgba(255,150,60,0.22)');
      for (let i = 0; i < 5; i++) h.QS(2.6, 1.3 + i * 2.6, 5.75, 1.0 + (i + 1) * 2.6 - 0.3, 7.4, 'rgba(255,190,100,0.32)');
      for (const x of [0.2, 3.2, 12.2]) h.QS(1.28, x, 1.2, x + 2.6, 3.3, 'rgba(255,190,110,0.26)');
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
