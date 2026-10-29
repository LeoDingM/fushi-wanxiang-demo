/* 影视城古镇 art preview — 明德书塾, 四合院, 虹桥, 售票处 ticket office, 检票闸机 turnstiles.
 * Site207：曲廊/虹桥栏杆寻杖/雀替/挂落 densify（rail_xunzhang/ornament_queti/hanging_gualuo/baluster_xiaozhu）。
 * Site214：豪宅门厅/廊口落地罩·月洞·隔断 densify。
 * Site209：豪宅门屋门钉铺首/门槛/抱鼓 densify。
 * Site211：府邸台基/阶条/垂带踏垛 atlas densify。
 * Site216：漏窗/花墙/透空砖雕 densify（艮岳廊·豪宅侧墙·四合院墙）。未经Leo确认. */
(function (root) {
  'use strict';
  const { A, shade, C, H } = root.AncientCore;
  const X = root.AncientParts, ST = root.AncientStreet;
  const { RED, RED_W, WOOD, WOOD_D, PLASTER, PLASTER_W, STONE, STONE_W, GOLD, BRICK, BRICK_W } = C;
  function brickWall(d, x0, y0, x1, y1, z1, o = {}) {
    const h = H(d), col = o.col || BRICK, colW = o.colW || BRICK_W;
    d.box(x0, y0, 0, x1, y1, z1, col, { line: shade(col, 0.5), west: colW, top: shade(col, 1.1) });
    if (x1 - x0 > y1 - y0) d.coursesS(x0, x1, y0, 0.5, z1, 0.16, shade(col, 0.84), 0.5); else d.coursesW(x0, y0, y1, 0.5, z1, 0.16, shade(colW, 0.84), 0.5);
    h.QS(y0 - 0.005, x0, 0, x1, 0.5, STONE, shade(STONE, 0.5)); h.QW(x0 - 0.005, y0, 0, y1, 0.5, STONE_W, shade(STONE_W, 0.5));
    // tiled coping (两坡瓦顶) along the wall
    const t = 0.25, zt = z1 + 0.42;
    if (x1 - x0 > y1 - y0) { const ym = (y0 + y1) / 2; d.face([[x0 - t, y0 - t, z1], [x1 + t, y0 - t, z1], [x1 + t, ym, zt], [x0 - t, ym, zt]], C.TILE, shade(C.TILE, 0.5)); for (let x = x0; x < x1; x += 0.25) h.line([x, y0 - t, z1], [x, ym, zt], shade(C.TILE, 0.75)); d.face([[x0 - t, y0 - t, z1], [x0 - t, ym, zt], [x0 - t, y1 + t, z1]], shade(C.TILE, 0.75), shade(C.TILE, 0.5)); d.seg([x0 - t, ym, zt + 0.05], [x1 + t, ym, zt + 0.05], C.RIDGE, 3); }
    else { const xm = (x0 + x1) / 2; d.face([[x0 - t, y0 - t, z1], [x0 - t, y1 + t, z1], [xm, y1 + t, zt], [xm, y0 - t, zt]], shade(C.TILE, 0.82), shade(C.TILE, 0.5)); for (let y = y0; y < y1; y += 0.25) h.line([x0 - t, y, z1], [xm, y, zt], shade(C.TILE, 0.65)); d.face([[x0 - t, y0 - t, z1], [x1 + t, y0 - t, z1], [xm, y0 - t, zt]], C.TILE, shade(C.TILE, 0.5)); d.seg([xm, y0 - t, zt + 0.05], [xm, y1 + t, zt + 0.05], C.RIDGE, 3); }
  }
  root.AncientMisc = { brickWall };

  // ---------------- 明德书塾 village school: 3 bays 11 x 7 m, 悬山, lattice doors open, desks + students' slates, plaque ----------------
  A.define('aq_shushu', {
    name: '明德书塾', geo: [-1, -2.2, 0, 12, 7.8, 7.4], fp: [[0, 0, 11, 7]], prune: true,
    draw(d) {
      const h = H(d), zf = 0.6;
      X.platform(d, 0, 0, 11, 7, zf, { steps: [[5.5, 2.4]] });
      ST.sideWall(d, 0.05, 1.3, 7, zf, 3.9, { col: '#ddd5c4' });
      ST.interior(d, 1.45, 3.85, 7.15, zf, 3.7, { tables: [] });
      h.QS(1.43, 4.6, 1.6, 6.4, 3.0, '#e8e0c8', '#6a5a40'); h.vtext('至聖先師', 5.5, 1.42, 2.8, 9, '#3a2a1a');   // 孔子 scroll
      for (const x of [4.3, 5.5, 6.7]) { d.box(x - 0.4, 1.0, zf, x + 0.4, 1.3, zf + 0.7, '#6a4428', { line: '#2a1a0a', top: '#8a5a34' }); d.box(x - 0.15, 1.05, zf + 0.7, x + 0.15, 1.2, zf + 0.75, '#e8e0c8'); }
      X.hallFront(d, 1.0, 0, zf, 3.9, [{ w: 3.7, fill: 'win', sill: 0.9, style: 'diamond' }, { w: 3.6, fill: 'door', n: 4, open: [1, 2], style: 'grid' }, { w: 3.7, fill: 'win', sill: 0.9, style: 'diamond' }], { colC: '#7a3a24', frame: '#5a3a24', sillCol: BRICK });
      X.efang(d, 1.07, -0.05, 11.05, 3.55, 3.9, { base: '#3a5a50', alt: '#2f4a6a' });
      X.plaque(d, 0.95, 5.5, 3.25, '明德書塾', { size: 13, bg: '#2a3a2a', col: '#e8dca8', frame: '#6a4a2a' });
      for (const x of [3.7, 7.3]) X.vsign(d, 0.95, x, 3.05, x < 5 ? '讀書明理' : '修身立德', { size: 10, w: 0.38, bg: '#e8e0c8', col: '#2a2a2a', frame: '#6a4a2a' });
      X.roof(d, { x0: -0.8, x1: 11.8, y0: -0.4, y1: 7.6, z: 4.4, rise: 2.4, type: 'xuanshan', over: 0.75, lift: 0.22, ridgeH: 0.3, gableCol: '#ddd5c4' });
      // bamboo clump at the corner + a stone bench
      for (let k = 0; k < 9; k++) { const x = 11.2 + (k % 3) * 0.22, y = -0.6 + Math.floor(k / 3) * 0.25, ht = 3.4 + d.R() * 1.6; h.line([x, y, 0], [x + 0.1, y, ht], '#4a7a3a', 2); for (let z = 0.8; z < ht; z += 0.5) d.px(x + z * 0.02, y, z, '#2a4a20', 2, 1); }
      for (let k = 0; k < 40; k++) { const x = 11.1 + d.R() * 1.0, z = 2.4 + d.R() * 3.0, y = -0.6 + d.R() * 0.6; d.face([[x, y, z], [x + 0.25, y, z - 0.08], [x + 0.05, y, z - 0.04]], k % 3 ? '#5a9a46' : '#3e7a34', null); }
    },
  });

  // ---------------- 四合院 courtyard house: 16 x 20 m, brick enclosing wall, 如意门 gate at the SE corner, 北房 + 厢房, tree ----------------
  A.define('aq_siheyuan', {
    name: '四合院', geo: [-0.6, -1.4, 0, 16.6, 20.6, 9.6], fp: [[0, 0, 16, 20]], prune: true,
    draw(d) {
      const h = H(d);
      d.flat(0.4, 0.4, 15.6, 19.6, 0.02, '#b8b2a4');
      for (let x = 1; x < 15.6; x += 1.2) h.line([x, 0.4, 0.03], [x, 19.6, 0.03], '#aaa496');
      d.flat(6.6, 5.2, 9.4, 14, 0.04, '#9e988a');   // brick paving cross path
      // north main house 北房 (5 bays) facing south, with 前廊
      X.platform(d, 0.6, 14.0, 15.4, 19.6, 0.6, { steps: [[8, 2.4]] });
      ST.sideWall(d, 0.65, 15.2, 19.6, 0.6, 3.6, { col: '#ddd5c4' });
      X.hallFront(d, 14.75, 0.6, 0.6, 3.6, [{ w: 2.96, fill: 'win', sill: 0.9 }, { w: 2.96, fill: 'win', sill: 0.9, style: 'bubujin' }, { w: 2.96, fill: 'door', n: 4 }, { w: 2.96, fill: 'win', sill: 0.9, style: 'bubujin' }, { w: 2.96, fill: 'win', sill: 0.9 }], { colC: RED, frame: RED_W, sillCol: BRICK });
      X.efang(d, 14.85, 0.55, 15.45, 3.3, 3.6, { base: '#2f5a86', alt: '#3f7a6a' });
      X.roof(d, { x0: 0.2, x1: 15.8, y0: 13.6, y1: 20.2, z: 4.1, rise: 2.4, type: 'yingshan', lift: 0.12, ridgeH: 0.32, chiwen: false, gableCol: BRICK_W, gableBrick: true });
      // east wing 东厢房 (its W face = courtyard facade is visible)
      X.platform(d, 11.2, 4.8, 15.4, 13.4, 0.45, {});
      { const fx = 11.6; h.QW(fx, 5.2, 0.45, 13.0, 3.2, '#ddd5c4', '#8a8270');
        for (const [a, b, kind] of [[5.4, 7.8, 'win'], [7.9, 10.3, 'door'], [10.4, 12.8, 'win']]) { if (kind === 'win') { h.QW(fx - 0.01, a, 0.45, b, 1.3, BRICK_W); X.latticeW(d, fx - 0.02, a, 1.3, b, 3.0, { frame: RED_W }); } else { X.latticeW(d, fx - 0.02, a, 0.45, b, 3.0, { frame: RED_W, step: 0.11 }); } }
        for (const y of [5.2, 7.85, 10.35, 13.0]) h.column(fx - 0.2, y, 0.45, 3.2, 0.12, RED); }
      // the wing roof runs N-S: draw it as a W-facing slope
      { const x0 = 10.9, x1 = 13.4, y0 = 4.6, y1 = 13.6, z0 = 3.5, z1 = 5.3; d.face([[x0, y0, z0], [x0, y1, z0], [x1, y1, z1], [x1, y0, z1]], shade(C.TILE, 0.84), shade(C.TILE, 0.5)); for (let y = y0 + 0.15; y < y1; y += 0.28) { h.line([x0, y, z0], [x1, y, z1], shade(C.TILE, 0.68)); h.line([x0, y + 0.08, z0], [x1, y + 0.08, z1], shade(C.TILE, 1.08)); } d.face([[x0, y0, z0], [x1, y0, z1], [x1 + 2.5, y0, z0]], BRICK, shade(BRICK, 0.5)); d.seg([x1, y0, z1 + 0.06], [x1, y1, z1 + 0.06], C.RIDGE, 3); d.seg([x0, y0, z0], [x0, y1, z0], shade(C.TILE, 0.45), 2); }
      // courtyard tree (海棠 / 石榴) + water vat
      tree(d, 8.0, 9.0, 0, { r: 2.3, ht: 5.8, n: 70, leaf: 9, col: '#5f9248', col2: '#3d6e34', flowers: '#e89aa8' });
      { const c = h.P(6.0, 7.0, 0.5); d.disc(6.0, 7.0, 0.7, 0.42, '#5a4a3a', '#2a2018'); d.g.fillStyle = '#6a5a48'; d.g.fillRect(Math.round(c[0] - 19), Math.round(c[1] - 2), 38, 18); d.disc(6.0, 7.0, 0.72, 0.42, '#3a5a6a', '#2a2018'); }
      // west wing seen from behind (its back wall is the W enclosing wall)
      brickWall(d, 0, 0.6, 0.45, 19.6, 3.2);
      { const x0 = -0.3, x1 = 2.6, y0 = 4.6, y1 = 13.6, z0 = 3.25, z1 = 5.3; d.face([[x0, y0, z0], [x0, y1, z0], [x1, y1, z1], [x1, y0, z1]], shade(C.TILE, 0.84), shade(C.TILE, 0.5)); for (let y = y0 + 0.15; y < y1; y += 0.28) { h.line([x0, y, z0], [x1, y, z1], shade(C.TILE, 0.68)); h.line([x0, y + 0.08, z0], [x1, y + 0.08, z1], shade(C.TILE, 1.08)); } d.face([[x0 + 0.3, y0, z0 - 0.1], [x1, y0, z1 - 0.1], [x1 + 2.3, y0, z0 + 0.2], [x1 + 2.3, y0, 0.0], [x0 + 0.3, y0, 0.0]], BRICK, shade(BRICK, 0.5)); for (let z = 0.5; z < z1 - 0.2; z += 0.16) h.line([x0 + 0.3 + Math.max(0, (z - z0 + 0.1)) * (x1 - x0) / (z1 - z0), y0 - 0.01, z], [x1 + 2.3 - Math.max(0, (z - z0)) * 1.1, y0 - 0.01, z], shade(BRICK, 0.84)); d.face([[x0, y0, z0], [x1, y0, z1], [x1, y0, z1 - 0.18], [x0, y0, z0 - 0.18]], shade(C.TILE, 0.7), shade(C.TILE, 0.45)); d.seg([x1, y0, z1 + 0.06], [x1, y1, z1 + 0.06], C.RIDGE, 3); d.seg([x0, y0, z0], [x0, y1, z0], shade(C.TILE, 0.45), 2); }
      // south enclosing wall with the 如意门 gate house at the east end + 影壁 inside
      brickWall(d, 0, 0, 11.6, 0.45, 3.2);
      d.box(5.0, -0.02, 1.0, 6.2, 0.0, 1.8, '#c8bfae', { line: '#7a7262' }); h.QS(-0.03, 5.1, 1.1, 6.1, 1.7, null, '#8a8270');   // small 什锦窗
      // gate house 如意门 (3.6 m) with red doors, 门墩 drum stones, 门簪
      X.platform(d, 11.6, -0.4, 15.4, 4.4, 0.45, { steps: [[13.5, 2.0]] });
      d.box(11.6, 0.0, 0.45, 12.0, 4.4, 3.6, BRICK, { line: shade(BRICK, 0.5), west: BRICK_W });
      h.QS(0.6, 12.0, 0.45, 15.0, 3.6, BRICK, shade(BRICK, 0.5)); d.coursesS(12.0, 15.0, 0.6, 0.45, 3.6, 0.16, shade(BRICK, 0.84), 0.5);
      h.QS(0.59, 12.6, 0.45, 14.4, 3.1, '#2a1e16'); h.QS(0.58, 12.7, 0.45, 13.48, 2.8, '#8a2a1e', '#4a140c'); h.QS(0.58, 13.52, 0.45, 14.3, 2.8, '#8a2a1e', '#4a140c');
      for (const x of [13.2, 13.8]) d.px(x, 0.57, 1.8, '#e0b85a', 2, 2);
      for (const x of [13.1, 13.9]) h.blob(x, 0.56, 2.95, 3, 3, '#3a6a8a', '#1a2a3a');
      h.QS(0.57, 12.7, 2.85, 14.3, 3.05, '#6a4a2a'); h.stext('吉祥如意', 13.5, 0.56, 3.3, 9, '#2a2a2a');
      for (const x of [12.45, 14.55]) { d.box(x - 0.18, 0.15, 0.45, x + 0.18, 0.55, 0.8, STONE, { line: shade(STONE, 0.5) }); h.blob(x, 0.15, 1.05, 6, 8, '#c8c2b6', '#6a645a'); }
      X.roof(d, { x0: 11.3, x1: 15.6, y0: -0.6, y1: 4.8, z: 3.95, rise: 1.6, type: 'yingshan', lift: 0.1, ridgeH: 0.28, chiwen: false, gableCol: BRICK_W, gableBrick: true });
      for (const x of [12.0, 15.0]) X.lantern(d, x, -0.4, 3.75, { r: 0.18, cord: 0.15 });
      h.line([15.2, -0.25, 0.45], [15.2, -0.25, 3.2], '#4a3a2a'); h.QS(-0.26, 15.0, 2.3, 15.4, 3.1, '#e8e0c8', '#6a5a40'); h.vtext('李寓', 15.2, -0.27, 2.95, 8, '#2a2a2a');
      /* Site212：四合院如意门内影壁点景 */
      if (X.yingbiStamp) X.yingbiStamp(d, 8.5, 2.8, 0.05, { kind: 'yingbi', sx: 0.7, sy: 0.72, hsx: 0.65, hsy: 0.65 });
      /* Site216：四合院南墙/西墙漏窗·花格墙点缀（不改 footprint） */
      if (X.louwindowStamp) {
        X.louwindowStamp(d, 5.6, -0.08, 0.9, { kind: 'lou', sx: 0.55, sy: 0.55 });
        X.louwindowStamp(d, -0.08, 8.5, 0.85, { kind: 'lattice', sx: 0.55, sy: 0.6 });
        X.louwindowStamp(d, -0.08, 14.0, 0.9, { kind: 'toukong', sx: 0.7, sy: 0.7 });
      }
    },
    emit(d) { for (const x of [12.0, 15.0]) X.lanternGlow(d, x, -0.4, 3.75, { r: 0.18, cord: 0.15 }); H(d).QS(14.7, 7.0, 1.3, 9.5, 3.0, 'rgba(255,190,110,0.5)'); },
  });
  /** broadleaf tree: trunk + layered leaf clusters (shared with the props) */
  function tree(d, x, y, z, o) {
    const h = H(d), R = d.R, ht = o.ht || 5, r = o.r || 2, g = d.g, bark = o.bark || '#4a3626';
    h.line([x, y, z], [x - 0.08, y, z + ht * 0.5], bark, o.trunk || 5); h.line([x + 0.06, y, z], [x - 0.02, y, z + ht * 0.45], shade(bark, 1.3), 1);
    for (const [dx, dz] of [[-0.7, 0.72], [0.6, 0.75], [0.1, 0.85], [-0.3, 0.6]]) h.line([x - 0.08, y, z + ht * 0.48], [x + dx, y, z + ht * dz], bark, 3);
    const cl = [], n = o.n || 90;
    for (let i = 0; i < n; i++) { const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * r, zz = z + ht * 0.6 + (R() - 0.3) * ht * 0.42 + Math.sqrt(Math.max(0, 1 - (rr / r) ** 2)) * r * 0.35; cl.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.7, zz]); }
    cl.sort((p, q) => (q[0] + q[1]) - (p[0] + p[1]) || p[2] - q[2]);
    const dk = shade(o.col2, 0.75);
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + R(), rr = r * (0.25 + R() * 0.45), c = h.P(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.7, z + ht * 0.72 + (R() - 0.5) * ht * 0.2), S = r * 32 * (0.32 + R() * 0.12); g.fillStyle = dk; g.beginPath(); g.ellipse(c[0], c[1], S, S * 0.72, 0, 0, Math.PI * 2); g.fill(); }
    for (const [cx, cy, cz] of cl) { const c = h.P(cx, cy, cz), s = (o.leaf || 8) * (0.8 + R() * 0.6); g.fillStyle = dk; g.beginPath(); g.ellipse(c[0] + 1, c[1] + 2, s, s * 0.75, 0, 0, Math.PI * 2); g.fill(); }
    for (const [cx, cy, cz] of cl) {
      const c = h.P(cx, cy, cz), s = (o.leaf || 8) * (0.6 + R() * 0.5), lit = (cx - x) - (cy - y) > -0.3 * r && cz > z + ht * 0.6;
      g.fillStyle = o.col2; g.beginPath(); g.ellipse(c[0], c[1], s, s * 0.78, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = lit ? o.col : shade(o.col, 0.88); g.beginPath(); g.ellipse(c[0] - 1, c[1] - 1.5, s * 0.75, s * 0.55, 0, 0, Math.PI * 2); g.fill();
      if (lit) { g.fillStyle = shade(o.col, 1.3); g.fillRect(Math.round(c[0] - s * 0.4), Math.round(c[1] - s * 0.5), 2, 1); }
      for (let k = 0; k < 3; k++) { g.fillStyle = R() < 0.5 ? shade(o.col2, 0.8) : shade(o.col, lit ? 1.15 : 0.95); g.fillRect(Math.round(c[0] + (R() - 0.5) * s * 1.4), Math.round(c[1] + (R() - 0.5) * s), 1, 1); }
      if (o.flowers && R() < 0.5) { g.fillStyle = o.flowers; g.fillRect(Math.round(c[0] + (R() - 0.5) * s), Math.round(c[1] + (R() - 0.5) * s * 0.6), 2, 2); }
    }
  }
  root.AncientMisc.tree = tree;

  // ---------------- 虹桥 rainbow bridge: 24 m 编木拱 timber arch over the canal, 8 m deck, railings, stone abutments ----------------
  /* Site195: ns is a real N–S span (swap local X/Y), not a horizontal flip. ew stays parallel-to-bank for other uses. */
  function hongqiaoAxis(d, ns) {
    if (!ns) return d;
    const swap = (p) => [p[1], p[0], p[2]];
    return {
      g: d.g, R: d.R, shade: d.shade, mix: d.mix,
      P: (x, y, z) => d.P(y, x, z),
      face: (pts, fill, line, lw) => d.face(pts.map(swap), fill, line, lw),
      box: (x0, y0, z0, x1, y1, z1, col, o) => d.box(y0, x0, z0, y1, x1, z1, col, o),
      flat: (x0, y0, x1, y1, z, fill, line) => d.flat(y0, x0, y1, x1, z, fill, line),
      seg: (a, b, col, lw) => d.seg(swap(a), swap(b), col, lw),
      px: (x, y, z, col, w, h) => d.px(y, x, z, col, w, h),
      disc: (x, y, z, r, fill, line) => d.disc(y, x, z, r, fill, line),
      coursesS: (x0, x1, y, z0, z1, step, col, bond) => d.coursesW(y, x0, x1, z0, z1, step, col, bond),
      coursesW: (x, y0, y1, z0, z1, step, col, bond) => d.coursesS(y0, y1, x, z0, z1, step, col, bond),
    };
  }
  A.define('aq_hongqiao', {
    name: '虹桥(编木拱桥)', variants: ['ew', 'ns'], geo: [-4.5, -0.4, -2.2, 28.5, 8.4, 7.2], geoOf: (st, v) => v === 'ns' ? [-0.4, -4.5, -2.2, 8.4, 28.5, 7.2] : null,
    shadowOf: (st, v) => v === 'ns' ? [[[0, -4], [8, -4], [8.6, 28], [0.6, 28]]] : [[[-4, 0], [28, 0], [28.6, 8.5], [-3.4, 8.5]]],
    /* default fp = ns abutments (Songcheng places ns); ew callers should pass rot or override */
    fp: [[0, -4, 8, -0.5], [0, 24.5, 8, 28]],
    fpStates: { ew: [[-4, 0, -0.5, 8], [24.5, 0, 28, 8]] },
    prune: true,
    draw(d0, st, v) {
      const ns = v === 'ns';
      const d = hongqiaoAxis(d0, ns);
      const h = H(d), W = 8, zd = (x) => { const t = (x - 12) / 12; if (x < 0) return Math.max(0, 0.95 + x * 0.24); if (x > 24) return Math.max(0, 0.95 - (x - 24) * 0.24); return 0.95 + 3.6 * (1 - t * t); };
      // water + stone abutments (bank revetments) — Site194：与 aq_gwater 分层水色对齐
      d.face([[-0.6, -0.4, -1.6], [24.6, -0.4, -1.6], [24.6, 8.4, -1.6], [-0.6, 8.4, -1.6]], '#2a5c6e', null);
      d.face([[-0.6, -0.4, -1.6], [3.2, -0.4, -1.6], [3.2, 8.4, -1.6], [-0.6, 8.4, -1.6]], '#6e9a7a', null);
      d.face([[21.4, -0.4, -1.6], [24.6, -0.4, -1.6], [24.6, 8.4, -1.6], [21.4, 8.4, -1.6]], '#6e9a7a', null);
      d.face([[3.0, -0.4, -1.6], [8.5, -0.4, -1.6], [8.5, 8.4, -1.6], [3.0, 8.4, -1.6]], '#3f7f86', null);
      d.face([[15.5, -0.4, -1.6], [21.6, -0.4, -1.6], [21.6, 8.4, -1.6], [15.5, 8.4, -1.6]], '#3f7f86', null);
      for (let k = 0; k < 18; k++) {
        const x = 1 + d.R() * 22, y = d.R() * 8;
        h.line([x, y, -1.59], [x + 0.55 + d.R() * 0.7, y, -1.59], k % 3 ? 'rgba(210,235,230,0.7)' : 'rgba(245,240,220,0.75)');
      }
      for (const [a, b] of [[-4.2, -0.4], [24.4, 28.2]]) { d.box(a, -0.3, -1.8, b, W + 0.3, 0.02, STONE, { line: shade(STONE, 0.5), west: STONE_W, top: '#b8b2a4' }); d.coursesS(a, b, -0.3, -1.8, 0, 0.36, shade(STONE, 0.8), 0.9); }
      const xs = []; for (let x = -4; x <= 28.01; x += 0.5) xs.push(x);
      // north railing (behind the deck)
      rail(d, xs, W - 0.1, zd, true);
      // deck: planks
      d.face([...xs.map((x) => [x, 0, zd(x)]), ...xs.slice().reverse().map((x) => [x, W, zd(x)])], '#9a7a56', '#4a3420');
      for (const x of xs) { h.line([x, 0, zd(x)], [x, W, zd(x)], '#86684a'); if (d.R() < 0.3) h.line([x + 0.25, 0, zd(x + 0.25)], [x + 0.25, W * d.R(), zd(x + 0.25)], '#a88a64'); }
      for (const y of [2.6, 5.4]) h.pline(xs.map((x) => [x, y, zd(x)]), '#8a6c4c');
      d.face([[2, 3.4, zd(2)], [22, 3.4, zd(22)], [22, 4.6, zd(22)], [2, 4.6, zd(2)]], null, null);
      // arch structure on the S face: 3-beam + 4-beam interlaced systems, 横木 cross-beam ends, 护拱板
      const sp = [[0.4, -1.5], [24.6 - 1.0, -1.5]];
      const A3 = [[0.6, -1.5], [5.2, 2.55], [18.8, 2.55], [23.4, -1.5]], A4 = [[2.4, -1.5], [3.4, 1.5], [9.2, 3.55], [14.8, 3.55], [20.6, 1.5], [21.6, -1.5]];
      const beam = (pts, col, y) => { for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]], t = 0.24; d.face([[a[0], y, a[1] - t], [b[0], y, b[1] - t], [b[0], y, b[1] + t], [a[0], y, a[1] + t]], col, shade(col, 0.4)); d.seg([a[0], y - 0.01, a[1] + t - 0.06], [b[0], y - 0.01, b[1] + t - 0.06], shade(col, 1.3)); d.seg([a[0], y - 0.01, a[1] - 0.02], [b[0], y - 0.01, b[1] - 0.02], shade(col, 0.82)); } };
      // spandrel fill between arch and deck (dark, slatted)
      for (let x = 1.2; x < 23; x += 0.6) { const t = Math.abs(x - 12) / 12; const za = t < 0.47 ? 3.0 + (1 - t / 0.47) * 0.5 : 2.6 - (t - 0.47) * 6.5; if (zd(x) - 0.3 > za) h.line([x, -0.01, Math.max(-1.5, za)], [x, -0.01, zd(x) - 0.3], '#5a4026', 1); }
      beam(A4.map(([x, z]) => [x + 0.5, z]), '#5a3e24', 0.4); beam(A3, '#86603a', 0.0); beam(A4, '#7a5432', -0.05);
      // 拱上立柱 short posts carrying the deck over the arch shoulders
      for (const x of [1.6, 3.0, 4.2, 19.8, 21.0, 22.4]) { const za = x < 12 ? (x < 3.4 ? -1.5 + (x - 0.6) / 4.6 * 4.05 : 1.5) : (x > 20.6 ? -1.5 + (23.4 - x) / 4.6 * 4.05 : 1.5); h.line([x, -0.06, za + 0.2], [x, -0.06, zd(x) - 0.3], '#5a3e24', 3); }
      for (const [x, z] of [...A3.slice(1, -1), ...A4.slice(1, -1)]) { d.box(x - 0.18, -0.25, z - 0.18, x + 0.18, 0, z + 0.18, '#5a3a20', { line: '#2a1a0a', south: '#8a6a44' }); }
      for (let k = 0; k < 2; k++) for (const [x, z] of [[1.6 + k * 0.35, -1.5], [22.4 - k * 0.35, -1.5]]) d.px(x, -0.05, z + 0.4, '#3a2a1a', 2, 6);
      // deck fascia
      d.face([...xs.map((x) => [x, -0.02, zd(x)]), ...xs.slice().reverse().map((x) => [x, -0.02, zd(x) - 0.32])], '#6a4a2a', '#2e1e10');
      // south railing (in front) + 华表 posts at both ends
      rail(d, xs, 0.05, zd, false);
      for (const [x, y] of [[-3.6, 0.1], [27.6, 0.1]]) { h.column(x, y, zd(x), zd(x) + 3.8, 0.11, '#8a7a66'); d.box(x - 0.45, y - 0.06, zd(x) + 3.3, x + 0.45, y + 0.06, zd(x) + 3.55, '#9a8a74', { line: '#4a3a2a' }); }
    },
  });

  function rail(d, xs, y, zd, back) {
    const h = H(d), c = back ? '#7a5a3a' : '#8a6a44', top = xs.map((x) => [x, y, zd(x) + 1.05]);
    for (let i = 0; i < xs.length; i += 2) { const x = xs[i]; h.line([x, y, zd(x)], [x, y, zd(x) + 1.05], shade(c, 0.6), 2); }
    for (let i = 1; i < xs.length; i += 2) { const x = xs[i]; h.line([x, y, zd(x) + 0.15], [x, y, zd(x) + 0.75], shade(c, 0.85), 1); }
    h.pline(top, shade(c, 0.45), 4); h.pline(top, c, 2); h.pline(xs.map((x) => [x, y, zd(x) + 0.45]), shade(c, 0.7), 1);
    for (let i = 0; i < xs.length; i += 8) { const x = xs[i]; h.blob(x, y, zd(x) + 1.15, 2, 2, shade(c, 1.2), shade(c, 0.5)); }
    /* Site207：虹桥栏杆 atlas densify（寻杖/小柱；少改拱体/码头，不与虹桥宏观冲突） */
    if (!back && X.railXunzhang) {
      const pts = [];
      for (let i = 0; i < xs.length; i += 4) pts.push([xs[i], y - 0.02, zd(xs[i])]);
      if (pts.length >= 2) X.railXunzhang(d, pts, { dense: true, queti: false, sx: 0.85, sy: 0.75, zOff: 0 });
      for (let i = 0; i < xs.length; i += 10) {
        if (X.balusterStamp) X.balusterStamp(d, xs[i], y - 0.04, zd(xs[i]), { sx: 0.7, sy: 0.75 });
      }
    }
  }

  // ---------------- 售票处 ticket office: 5 windows, 仿古 hall 16 x 6 m, LED price board, queue rails ----------------
  A.define('aq_ticket', {
    name: '售票处', geo: [-1, -3.8, 0, 17, 7, 8], fp: [[0, 0, 16, 6]], prune: true,
    draw(d) {
      const h = H(d), zf = 0.3;
      X.platform(d, 0, 0, 16, 6, zf, {});
      ST.sideWall(d, 0.05, 0.8, 6, zf, 3.8, { col: '#ddd5c4' });
      h.QS(0.8, 0, zf, 16, 3.8, '#ddd5c4', '#8a8270'); h.QS(0.79, 0, zf, 16, zf + 0.9, BRICK); d.coursesS(0, 16, 0.78, zf, zf + 0.9, 0.16, shade(BRICK, 0.84), 0.5);
      for (let i = 0; i < 5; i++) {
        const x = 1.2 + i * 2.9; h.QS(0.78, x, zf + 0.9, x + 2.0, 2.9, '#2a3a44', '#1a1a1a');
        h.QS(0.77, x + 0.1, zf + 1.0, x + 1.9, 2.8, '#6a8a9a', '#3a4a52'); h.line([x + 0.1, 0.76, 2.4], [x + 1.9, 0.76, 2.0], '#a8c8d4');
        d.box(x - 0.1, 0.45, zf + 0.85, x + 2.1, 0.8, zf + 0.95, '#8a7a66', { line: '#3a2a1a' });
        h.QS(0.76, x + 0.6, zf + 0.92, x + 1.4, zf + 1.1, '#1a1a1a'); h.stext(String(i + 1) + '号窗', x + 1.0, 0.75, 3.1, 9, '#2a2a2a', { font: '"Noto Sans CJK SC"' });
      }
      X.efang(d, 0.85, -0.05, 16.05, 3.5, 3.8, {});
      // LED price board (modern element, styled dark wood frame)
      h.QS(0.7, 4.2, 3.0, 11.8, 3.48, '#3a2a1a'); h.QS(0.69, 4.3, 3.05, 11.7, 3.43, '#101418');
      h.stext('成人票 ¥120   学生票 ¥60   夜游票 ¥90', 8.0, 0.68, 3.24, 8, '#ff9a30', { font: '"Noto Sans CJK SC"', weight: 'normal' });
      X.roof(d, { x0: -0.7, x1: 16.7, y0: -0.6, y1: 6.6, z: 4.3, rise: 2.1, type: 'xieshan', lift: 0.4, beasts: 2, gable: 0.45, ridgeH: 0.32 });
      X.plaque(d, -0.65, 8.0, 4.9, '售票處', { size: 15, w: 2.6 });
      // queue rails (stainless posts + rope) in front of each window
      for (let i = 0; i < 6; i++) { const x = 0.75 + i * 2.9; for (const y of [-3.4, -1.8, -0.3]) { h.line([x, y, 0], [x, y, 1.0], '#9aa4aa', 2); h.blob(x, y, 1.02, 2, 2, '#c8d0d4', '#5a6266'); } h.line([x, -3.4, 0.9], [x, -0.3, 0.9], '#7a2418', 2); }
    },
    emit(d) { const h = H(d); for (let i = 0; i < 5; i++) { const x = 1.2 + i * 2.9; h.QS(0.76, x + 0.1, 1.3, x + 1.9, 2.8, 'rgba(255,220,160,0.7)'); } h.QS(0.67, 4.3, 3.05, 11.7, 3.43, 'rgba(255,140,40,0.6)'); },
  });
  // ---------------- 检票闸机: 4 lanes of tripod turnstiles with wood-clad housings + 入口 arch sign ----------------
  A.define('aq_turnstile', {
    name: '检票闸机(4通道)', geo: [-0.4, -0.6, 0, 7.6, 1.8, 4.6], fp: [[0, 0, 7.2, 1.2]], prune: true,
    draw(d) {
      const h = H(d);
      for (let i = 0; i < 5; i++) {
        const x = i * 1.75;
        d.box(x, 0, 0, x + 0.32, 1.2, 1.0, '#7a5232', { line: '#2a1a0a', top: '#c8ccd0', west: '#5a3e24' }); d.box(x - 0.02, -0.02, 0.95, x + 0.34, 1.22, 1.06, '#b8c0c6', { line: '#4a5258' }); for (let z = 0.15; z < 0.55; z += 0.12) H(d).line([x, -0.01, z], [x + 0.32, -0.01, z], '#5a3a20');
        h.QS(-0.01, x + 0.04, 0.6, x + 0.28, 0.9, '#20262a'); d.px(x + 0.1, -0.02, 0.82, i % 2 ? '#40d060' : '#40d060', 3, 2);
        if (i < 4) { const c = h.P(x + 0.32, 0.6, 0.85); d.g.strokeStyle = '#3a4248'; d.g.lineWidth = 4; d.g.beginPath(); d.g.moveTo(c[0], c[1]); d.g.lineTo(c[0] + 14, c[1] - 4); d.g.moveTo(c[0], c[1]); d.g.lineTo(c[0] + 6, c[1] + 6); d.g.moveTo(c[0], c[1]); d.g.lineTo(c[0] + 8, c[1] - 9); d.g.stroke(); d.g.strokeStyle = '#e8ecf0'; d.g.lineWidth = 2; d.g.beginPath(); d.g.moveTo(c[0], c[1]); d.g.lineTo(c[0] + 14, c[1] - 4); d.g.moveTo(c[0], c[1]); d.g.lineTo(c[0] + 6, c[1] + 6); d.g.moveTo(c[0], c[1]); d.g.lineTo(c[0] + 8, c[1] - 9); d.g.stroke(); d.g.lineWidth = 1; }
      }
      for (const x of [-0.2, 7.4]) h.column(x, 0.6, 0, 3.6, 0.1, RED);
      h.QS(0.5, -0.4, 3.0, 7.6, 3.6, '#2a2a2a', '#c8a050'); h.stext('入 口  ENTRANCE', 3.6, 0.49, 3.3, 11, '#e8c050', { font: '"Noto Sans CJK SC"' });
      X.roof(d, { x0: -0.6, x1: 7.8, y0: 0.1, y1: 1.1, z: 3.75, rise: 0.4, type: 'xuanshan', lift: 0.2, ridgeH: 0.12, chiwen: false, over: 0.2 });
    },
    emit(d) { for (let i = 0; i < 5; i++) d.px(i * 1.75 + 0.1, -0.03, 0.82, '#60ff80', 3, 2); },
  });

  // ---------------- 勾栏小戏台（Site194 点缀，体量小） ----------------
  A.define('aq_goulan', {
    name: '勾栏戏台', geo: [-1.0, -1.6, 0, 11.2, 8.4, 9.2], fp: [[0, 0, 10, 8]], prune: true,
    draw(d) {
      const h = H(d), zf = 0.85;
      X.platform(d, 0, 0, 10, 8, zf, { steps: [[5, 2.6]] });
      // open stage: rear wall + side screens, red columns
      h.QS(7.6, 0.4, zf, 9.6, 4.6, '#ddd5c4', '#8a8270');
      h.QW(0.35, 0.6, zf, 7.6, 4.4, '#c9c1b0', '#8a8270');
      h.QW(9.65, 0.6, zf, 7.6, 4.4, '#c9c1b0', '#8a8270');
      for (const x of [1.2, 5.0, 8.8]) h.column(x, 1.0, zf, 4.5, 0.14, RED, { base: STONE });
      for (const x of [1.2, 5.0, 8.8]) h.column(x, 7.2, zf, 4.5, 0.14, RED, { base: STONE });
      X.efang(d, 0.95, 0.4, 9.6, 4.2, 4.55, { base: '#2f5a86', alt: '#3f7a6a' });
      X.lattice(d, 7.55, 2.5, 3.2, 7.5, 4.3, { frame: RED_W, style: 'diamond', paper: '#3a2a1a' });
      // stage rug + props table
      h.QS(1.05, 2.2, zf + 0.02, 7.8, zf + 0.06, '#8a2a1e', '#4a140c');
      d.box(4.2, 6.4, zf, 5.8, 7.2, zf + 0.75, WOOD, { line: WOOD_D, top: shade(WOOD, 1.15) });
      X.plaque(d, 0.9, 5.0, 3.9, '勾欄', { size: 16, w: 2.2, bg: '#1a1a1a', col: '#e8c050' });
      X.roof(d, { x0: -0.7, x1: 10.7, y0: -0.5, y1: 8.5, z: 5.0, rise: 2.6, type: 'xieshan', over: 0.55, lift: 0.35, beasts: 2, ridgeH: 0.3, gable: 0.4 });
      for (const x of [1.5, 8.5]) X.lantern(d, x, 0.35, 4.7, { r: 0.22, cord: 0.25, text: '戲' });
      X.banner(d, 10.4, 0.2, 6.2, '戲', { col: '#c8322c', tc: '#e8e0c8', len: 1.6, w: 0.55, size: 18, pole: false, border: GOLD });
      h.line([10.4, 0.2, 6.5], [10.4, 0.2, 0.5], WOOD_D, 2);
    },
    emit(d) {
      for (const x of [1.5, 8.5]) X.lanternGlow(d, x, 0.35, 4.7, { r: 0.22, cord: 0.25 });
      H(d).QS(1.1, 2.4, 1.0, 7.6, 3.5, 'rgba(255,170,80,0.22)');
    },
  });

  // ---------------- 宝相寺小殿（Site194 点缀） ----------------
  A.define('aq_siyuan', {
    name: '宝相寺', geo: [-1.0, -2.0, 0, 13.2, 9.2, 10.0], fp: [[0, 0, 12, 9]], prune: true,
    draw(d) {
      const h = H(d), zf = 0.7;
      X.platform(d, 0, 0, 12, 9, zf, { steps: [[6, 3.0]] });
      ST.sideWall(d, 0.08, 1.2, 9, zf, 4.2, { col: '#ddd5c4' });
      // dark hall interior + Buddha niche silhouette
      h.QS(1.35, 3.2, zf, 8.8, 4.0, '#2a2218');
      h.QS(1.32, 5.0, 1.6, 7.0, 3.6, '#4a3a28'); h.blob(6.0, 1.28, 2.7, 10, 14, '#c8b080', '#6a5a40');
      X.hallFront(d, 1.05, 0, zf, 4.2, [
        { w: 3.2, fill: 'win', sill: 1.0, style: 'bubujin' },
        { w: 5.6, fill: 'door', n: 6, open: [2, 3], style: 'grid' },
        { w: 3.2, fill: 'win', sill: 1.0, style: 'bubujin' },
      ], { colC: RED, frame: RED_W, sillCol: BRICK });
      X.efang(d, 1.12, -0.05, 12.05, 3.85, 4.2, { base: '#2f5a86', alt: '#3f7a6a' });
      X.dougong(d, 1.0, [2.0, 4.5, 6.0, 7.5, 10.0], 4.2, { size: 0.7 });
      X.plaque(d, 0.95, 6.0, 3.55, '寶相寺', { size: 15, w: 2.8, bg: '#1a2a1a', col: '#e8dca8', frame: '#6a4a2a' });
      for (const x of [3.5, 8.5]) X.vsign(d, 0.95, x, 3.3, x < 6 ? '慈悲喜捨' : '普度眾生', { size: 10, w: 0.38, bg: '#e8e0c8', col: '#2a2a2a', frame: '#6a4a2a' });
      X.roof(d, { x0: -0.8, x1: 12.8, y0: -0.6, y1: 9.5, z: 4.7, rise: 3.0, type: 'xieshan', over: 0.7, lift: 0.4, beasts: 3, ridgeH: 0.38, gable: 0.5, dense: true });
      for (const x of [1.4, 10.6]) X.lantern(d, x, 0.3, 4.45, { r: 0.24, cord: 0.2 });
      // incense burner in front
      d.box(5.4, -1.4, 0, 6.6, -0.4, 0.55, STONE, { line: shade(STONE, 0.5), top: shade(STONE, 1.1) });
      h.blob(6.0, -0.9, 0.85, 5, 4, '#3a3a3a', '#1a1a1a');
      for (let i = 0; i < 5; i++) h.line([5.7 + i * 0.15, -0.9, 0.9], [5.7 + i * 0.15 + 0.02, -0.9, 1.35 + (i % 2) * 0.15], '#c8c8c8', 1);
    },
    emit(d) {
      for (const x of [1.4, 10.6]) X.lanternGlow(d, x, 0.3, 4.45, { r: 0.24, cord: 0.2 });
      H(d).QS(1.1, 3.4, 1.0, 8.6, 3.6, 'rgba(255,190,110,0.28)');
    },
  });


  // ---------------- Site197：艮岳苑 / 庭院点景 — 假山·亭·曲廊·豪宅（贴图块，非纯线稿） ----------------
  /** 假山叠石：多层石块 + 苔点，atlas 石色盒体 */
  A.define('aq_rockery', {
    name: '假山', variants: ['a', 'b', 'c'], geo: [-2.4, -1.8, 0, 2.6, 2.0, 4.2], fp: [[-1.6, -1.2, 1.8, 1.4]], prune: true,
    draw(d, st, v) {
      const h = H(d), R = d.R;
      const piles = v === 'b'
        ? [[-0.6, -0.2, 1.4, 1.1, 1.8], [0.5, 0.3, 1.1, 0.9, 2.6], [-0.1, 0.6, 0.9, 0.7, 3.2], [1.0, -0.5, 0.8, 0.6, 1.4]]
        : v === 'c'
          ? [[0.0, 0.0, 1.8, 1.4, 2.2], [-1.1, 0.4, 1.0, 0.8, 3.0], [0.9, -0.6, 1.0, 0.9, 2.8], [0.2, 0.8, 0.7, 0.6, 3.6]]
          : [[-0.8, 0.0, 1.6, 1.2, 2.0], [0.4, -0.4, 1.2, 1.0, 2.8], [0.0, 0.5, 1.0, 0.8, 3.4], [1.2, 0.2, 0.7, 0.6, 1.6]];
      for (const [cx, cy, w, dpth, ht] of piles) {
        const col = shade(STONE, 0.88 + R() * 0.18);
        d.box(cx - w / 2, cy - dpth / 2, 0, cx + w / 2, cy + dpth / 2, ht, col, { line: shade(STONE, 0.5), west: STONE_W, top: shade(STONE, 1.08) });
        d.coursesS(cx - w / 2, cx + w / 2, cy - dpth / 2 - 0.01, 0.1, ht - 0.05, 0.28, shade(STONE, 0.78), 0.6);
      }
      for (let k = 0; k < 14; k++) {
        const x = (R() - 0.5) * 3.2, y = (R() - 0.5) * 2.4, z = 0.4 + R() * 2.8;
        d.px(x, y, z, k % 3 ? '#4a6a3a' : '#6a8a4a', 2, 2);
      }
      // 小松 / 灌木冠
      for (let k = 0; k < 6; k++) {
        const x = (R() - 0.5) * 2.4, y = (R() - 0.5) * 1.6, z = 2.2 + R() * 1.4;
        const c = h.P(x, y, z); d.g.fillStyle = k % 2 ? '#3d6e34' : '#5a8a46';
        d.g.beginPath(); d.g.ellipse(c[0], c[1], 7 + R() * 4, 5 + R() * 3, 0, 0, Math.PI * 2); d.g.fill();
      }
      /* Site219：atlas 太湖石/叠石/峰石/苔 stamp densify（叠在既有假山体上） */
      if (X.rockeryStamp) {
        const kind = v === 'b' ? 'dieshi' : v === 'c' ? 'taihu' : 'peak_s';
        X.rockeryStamp(d, 0.15, -0.1, 0.05, { kind, sx: 0.72, sy: 0.75 });
        X.rockeryStamp(d, -0.85, 0.35, 0.4, { kind: 'moss', sx: 0.55, sy: 0.55 });
        X.rockeryStamp(d, 0.95, -0.4, 0.35, { kind: 'moss', sx: 0.5, sy: 0.5 });
        if (v !== 'c') X.rockeryStamp(d, 0.55, 0.45, 1.1, { kind: 'peak_s', sx: 0.45, sy: 0.5 });
      }
    },
  });

  /** 园亭：四柱歇山小亭，瓦顶走 atlas roof 模块 */
  A.define('aq_ting', {
    name: '园亭', variants: ['sq', 'hex'], geo: [-3.2, -3.2, 0, 3.4, 3.4, 6.8], fp: [[-2.2, -2.2, 2.4, 2.4]], prune: true,
    draw(d, st, v) {
      const h = H(d), zf = 0.35, span = v === 'hex' ? 2.4 : 2.6;
      X.platform(d, -span, -span, span, span, zf, {});
      const cols = v === 'hex'
        ? [[-1.6, -0.9], [-1.6, 0.9], [0, -1.8], [0, 1.8], [1.6, -0.9], [1.6, 0.9]]
        : [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]];
      for (const [x, y] of cols) h.column(x, y, zf, 3.6, 0.12, RED, { base: STONE });
      // 额枋环圈
      for (const [x0, y0, x1, y1] of [[-1.85, -1.85, 1.85, -1.75], [-1.85, 1.75, 1.85, 1.85], [-1.85, -1.85, -1.75, 1.85], [1.75, -1.85, 1.85, 1.85]]) {
        d.box(x0, y0, 3.35, x1, y1, 3.55, '#2f5a86', { line: '#1a3a50', top: '#3f7a6a' });
      }
      X.roof(d, { x0: -span - 0.5, x1: span + 0.5, y0: -span - 0.5, y1: span + 0.5, z: 3.7, rise: 2.0, type: 'xieshan', over: 0.55, lift: 0.35, beasts: 1, ridgeH: 0.28, gable: 0.35, dense: true });
      X.plaque(d, -span - 0.05, 0, 3.15, '攬勝', { size: 11, w: 1.6, bg: '#1a2a1a', col: '#e8dca8', frame: '#6a4a2a' });
      for (const [x, y] of [[-1.5, -1.9], [1.5, -1.9]]) X.lantern(d, x, y, 3.5, { r: 0.16, cord: 0.12 });
      // 石桌凳
      d.box(-0.45, -0.45, zf, 0.45, 0.45, zf + 0.45, STONE, { line: shade(STONE, 0.5), top: shade(STONE, 1.1) });
      for (const [x, y] of [[-1.1, 0], [1.1, 0], [0, -1.1], [0, 1.1]]) d.box(x - 0.25, y - 0.25, zf, x + 0.25, y + 0.25, zf + 0.32, STONE, { line: shade(STONE, 0.5) });
    },
    emit(d) {
      for (const [x, y] of [[-1.5, -1.9], [1.5, -1.9]]) X.lanternGlow(d, x, y, 3.5, { r: 0.16, cord: 0.12 });
    },
  });

  /** 曲廊片段：木柱 + 单坡/两坡廊顶，可连环放置 */
  A.define('aq_lang', {
    name: '曲廊', variants: ['ew', 'ns', 'corner'], geo: [-0.6, -1.2, 0, 7.2, 2.4, 4.6],
    geoOf: (st, v) => v === 'ns' ? [-1.2, -0.6, 0, 2.4, 7.2, 4.6] : v === 'corner' ? [-0.6, -0.6, 0, 4.2, 4.2, 4.6] : null,
    fp: [[0, 0, 6.5, 1.8]],
    fpStates: { ns: [[0, 0, 1.8, 6.5]], corner: [[0, 0, 3.6, 3.6]] },
    prune: true,
    draw(d0, st, v) {
      const ns = v === 'ns';
      const d = ns ? {
        g: d0.g, R: d0.R, shade: d0.shade, mix: d0.mix,
        P: (x, y, z) => d0.P(y, x, z),
        face: (pts, fill, line, lw) => d0.face(pts.map((p) => [p[1], p[0], p[2]]), fill, line, lw),
        box: (x0, y0, z0, x1, y1, z1, col, o) => d0.box(y0, x0, z0, y1, x1, z1, col, o),
        flat: (x0, y0, x1, y1, z, fill, line) => d0.flat(y0, x0, y1, x1, z, fill, line),
        seg: (a, b, col, lw) => d0.seg([a[1], a[0], a[2]], [b[1], b[0], b[2]], col, lw),
        px: (x, y, z, col, w, h) => d0.px(y, x, z, col, w, h),
        disc: (x, y, z, r, fill, line) => d0.disc(y, x, z, r, fill, line),
        coursesS: (x0, x1, y, z0, z1, step, col, bond) => d0.coursesW(y, x0, x1, z0, z1, step, col, bond),
        coursesW: (x, y0, y1, z0, z1, step, col, bond) => d0.coursesS(y0, y1, x, z0, z1, step, col, bond),
      } : d0;
      const h = H(d), zf = 0.2, L = v === 'corner' ? 3.4 : 6.4, W = v === 'corner' ? 3.4 : 1.6;
      d.flat(0, 0, L, W, zf, '#b8b2a4');
      const posts = [];
      for (let x = 0.3; x <= L - 0.2; x += 1.55) { posts.push([x, 0.25]); posts.push([x, W - 0.25]); }
      for (const [x, y] of posts) h.column(x, y, zf, 2.9, 0.09, RED, { base: STONE });
      // 坐槛
      d.box(0.1, 0.05, zf, L - 0.1, 0.22, zf + 0.55, WOOD, { line: WOOD_D, top: shade(WOOD, 1.1) });
      d.box(0.1, W - 0.22, zf, L - 0.1, W - 0.05, zf + 0.55, WOOD, { line: WOOD_D, top: shade(WOOD, 1.1) });
      /* Site207：廊道寻杖栏杆 + 柱头雀替 + 柱间挂落（atlas kitbash densify） */
      /* Site214：廊口月洞/落地罩点缀（少改廊 footprint） */
      if (X.screensStamp) {
        X.screensStamp(d, 3.3, 0.55, 0.05, { kind: 'yuedong', sx: 0.55, sy: 0.7 });
        X.screensStamp(d, 1.0, 0.7, 0.05, { kind: 'luodizhao', sx: 0.4, sy: 0.65 });
      }
      /* Site216：廊侧漏窗/花格墙点缀（与月洞互补，不改廊 footprint） */
      if (X.louwindowStamp) {
        X.louwindowStamp(d, 4.8, 0.05, 0.75, { kind: 'lou', sx: 0.42, sy: 0.55 });
        X.louwindowStamp(d, 2.2, W - 0.12, 0.7, { kind: 'lattice', sx: 0.4, sy: 0.5 });
      }
      /* Site219：曲廊侧石附苔/小峰点缀 */
      if (X.rockeryStamp) {
        X.rockeryStamp(d, 0.6, -0.15, 0.05, { kind: 'moss', sx: 0.42, sy: 0.42 });
        X.rockeryStamp(d, L - 0.8, W + 0.1, 0.05, { kind: 'peak_s', sx: 0.38, sy: 0.4 });
      }
      if (X.railXunzhang) {
        X.railXunzhang(d, [[0.2, 0.08, zf], [L - 0.2, 0.08, zf]], { dense: true, quetiZ: 2.35, sx: 0.95, sy: 0.85 });
        X.railXunzhang(d, [[0.2, W - 0.08, zf], [L - 0.2, W - 0.08, zf]], { dense: true, queti: false, sx: 0.95, sy: 0.85 });
      }
      for (const [x, y] of posts) {
        if (X.quetiStamp) X.quetiStamp(d, x, y - 0.06, 2.55, { sx: 0.65, sy: 0.7 });
      }
      if (X.gualuoStamp) {
        for (let i = 0; i < posts.length - 2; i += 2) {
          const a = posts[i], b = posts[i + 2];
          if (Math.abs(a[1] - b[1]) < 0.05) X.gualuoStamp(d, a[0] + 0.12, a[1] - 0.04, 2.35, b[0] - 0.12, { sy: 0.65 });
        }
      }
      X.roof(d, { x0: -0.35, x1: L + 0.35, y0: -0.35, y1: W + 0.35, z: 3.05, rise: 0.85, type: 'xuanshan', over: 0.35, lift: 0.12, ridgeH: 0.14, chiwen: false, gableCol: '#ddd5c4' });
      if (v === 'corner') {
        // L 形第二臂
        d.flat(0, 0, 1.6, L, zf, '#b8b2a4');
        for (let y = 0.3; y <= L - 0.2; y += 1.55) {
          h.column(0.25, y, zf, 2.9, 0.09, RED, { base: STONE });
          h.column(1.35, y, zf, 2.9, 0.09, RED, { base: STONE });
          if (X.quetiStamp) {
            X.quetiStamp(d, 0.25, y - 0.06, 2.55, { sx: 0.6, sy: 0.65 });
            X.quetiStamp(d, 1.35, y - 0.06, 2.55, { sx: 0.6, sy: 0.65 });
          }
        }
        if (X.railXunzhang) X.railXunzhang(d, [[0.15, 0.3, zf], [0.15, L - 0.3, zf]], { dense: true, queti: false, sx: 0.9, sy: 0.8 });
        X.roof(d, { x0: -0.35, x1: 1.95, y0: -0.35, y1: L + 0.35, z: 3.05, rise: 0.85, type: 'xuanshan', over: 0.35, lift: 0.12, ridgeH: 0.14, chiwen: false, gableCol: '#ddd5c4' });
      }
    },
  });

  /** 豪宅府邸：砖墙合院 + 北厅 + 厢房 + 如意门，中庭留空给池/假山/廊 */
  A.define('aq_haozhai', {
    name: '豪宅庭院', geo: [-1.0, -1.6, 0, 23.0, 24.0, 10.5], fp: [[0, 0, 22, 22]], prune: true,
    draw(d) {
      const h = H(d);
      d.flat(0.5, 0.5, 21.5, 21.5, 0.02, '#c2bcae');
      for (let x = 1; x < 21; x += 1.1) h.line([x, 0.5, 0.03], [x, 21.5, 0.03], '#aaa496');
      // 中庭草皮环（池塘由 paintSea 另铺）
      d.flat(7.2, 7.5, 14.8, 15.2, 0.03, '#8aaa6a');
      // 北厅
      /* Site211：府邸门屋台基 densify */
      X.platform(d, 1.0, 17.2, 21.0, 21.6, 0.55, { steps: [[11, 2.8]], dense: true });
      ST.sideWall(d, 1.05, 18.0, 21.6, 0.55, 3.7, { col: '#ddd5c4' });
      X.hallFront(d, 17.9, 1.0, 0.55, 3.7, [
        { w: 3.8, fill: 'win', sill: 0.9, style: 'bubujin' },
        { w: 3.8, fill: 'win', sill: 0.9 },
        { w: 4.4, fill: 'door', n: 6, open: [2, 3], style: 'grid' },
        { w: 3.8, fill: 'win', sill: 0.9 },
        { w: 3.8, fill: 'win', sill: 0.9, style: 'diamond' },
      ], { colC: RED, frame: RED_W, sillCol: BRICK });
      X.efang(d, 18.0, 0.95, 21.05, 3.4, 3.7, { base: '#2f5a86', alt: '#3f7a6a' });
      X.plaque(d, 17.85, 11.0, 3.2, '德澤堂', { size: 13, w: 2.4, bg: '#1a2a1a', col: '#e8dca8' });
      X.roof(d, { x0: 0.4, x1: 21.6, y0: 16.8, y1: 22.2, z: 4.2, rise: 2.5, type: 'yingshan', lift: 0.14, ridgeH: 0.32, chiwen: false, gableCol: BRICK_W, gableBrick: true });
      // 东厢
      X.platform(d, 16.6, 5.0, 21.0, 16.6, 0.45, {});
      { const fx = 16.9; h.QW(fx, 5.4, 0.45, 16.2, 3.3, '#ddd5c4', '#8a8270');
        for (const [a, b, kind] of [[5.6, 8.2, 'win'], [8.4, 11.2, 'door'], [11.4, 14.0, 'win'], [14.2, 16.0, 'win']]) {
          if (kind === 'win') { h.QW(fx - 0.01, a, 0.45, b, 1.3, BRICK_W); X.latticeW(d, fx - 0.02, a, 1.3, b, 3.05, { frame: RED_W }); }
          else X.latticeW(d, fx - 0.02, a, 0.45, b, 3.05, { frame: RED_W, step: 0.11 });
        }
        for (const y of [5.4, 8.3, 11.3, 14.1, 16.2]) h.column(fx - 0.18, y, 0.45, 3.25, 0.11, RED);
      }
      { const x0 = 16.2, x1 = 18.8, y0 = 4.8, y1 = 16.8, z0 = 3.5, z1 = 5.2;
        d.face([[x0, y0, z0], [x0, y1, z0], [x1, y1, z1], [x1, y0, z1]], shade(C.TILE, 0.84), shade(C.TILE, 0.5));
        for (let y = y0 + 0.15; y < y1; y += 0.28) { h.line([x0, y, z0], [x1, y, z1], shade(C.TILE, 0.68)); }
        d.seg([x1, y0, z1 + 0.05], [x1, y1, z1 + 0.05], C.RIDGE, 3);
      }
      // 西厢（背墙）
      brickWall(d, 0, 1.0, 0.5, 21.2, 3.3);
      /* Site216：西侧墙漏窗/透空砖雕 densify */
      if (X.louwindowStamp) {
        X.louwindowStamp(d, -0.08, 6.5, 0.85, { kind: 'lou', sx: 0.55, sy: 0.6 });
        X.louwindowStamp(d, -0.08, 11.0, 0.9, { kind: 'toukong', sx: 0.75, sy: 0.75 });
        X.louwindowStamp(d, -0.08, 15.5, 0.8, { kind: 'lattice', sx: 0.5, sy: 0.55 });
      }
      if (X.rockeryStamp) {
        /* Site219：豪宅侧墙石附苔/小峰点缀 */
        X.rockeryStamp(d, 1.2, -0.15, 0.05, { kind: 'moss', sx: 0.45, sy: 0.45 });
        X.rockeryStamp(d, 5.5, -0.12, 0.05, { kind: 'peak_s', sx: 0.4, sy: 0.42 });
      }
      { const x0 = -0.2, x1 = 2.8, y0 = 5.0, y1 = 16.4, z0 = 3.3, z1 = 5.1;
        d.face([[x0, y0, z0], [x0, y1, z0], [x1, y1, z1], [x1, y0, z1]], shade(C.TILE, 0.84), shade(C.TILE, 0.5));
        for (let y = y0 + 0.15; y < y1; y += 0.28) h.line([x0, y, z0], [x1, y, z1], shade(C.TILE, 0.68));
        d.seg([x1, y0, z1 + 0.05], [x1, y1, z1 + 0.05], C.RIDGE, 3);
      }
      // 南墙 + 门屋
      brickWall(d, 0.5, 0, 16.4, 0.5, 3.3);
      /* Site216：南侧墙花墙/漏窗 densify（与影壁互补） */
      if (X.louwindowStamp) {
        X.louwindowStamp(d, 4.5, -0.08, 0.85, { kind: 'lou', sx: 0.55, sy: 0.55 });
        X.louwindowStamp(d, 9.0, -0.1, 0.7, { kind: 'huaziang', sx: 0.55, sy: 0.55 });
        X.louwindowStamp(d, 13.5, -0.08, 0.9, { kind: 'lattice', sx: 0.5, sy: 0.55 });
      }
      /* Site211：府邸厅堂台基 densify */
      X.platform(d, 16.4, -0.3, 21.0, 4.6, 0.45, { steps: [[18.6, 2.2]], dense: true });
      d.box(16.4, 0.0, 0.45, 16.9, 4.6, 3.5, BRICK, { line: shade(BRICK, 0.5), west: BRICK_W });
      h.QS(0.55, 16.9, 0.45, 20.5, 3.5, BRICK, shade(BRICK, 0.5)); d.coursesS(16.9, 20.5, 0.54, 0.45, 3.5, 0.16, shade(BRICK, 0.84), 0.5);
      h.QS(0.53, 17.5, 0.45, 19.9, 3.0, '#2a1e16');
      h.QS(0.52, 17.6, 0.45, 18.65, 2.7, '#8a2a1e', '#4a140c');
      h.QS(0.52, 18.75, 0.45, 19.8, 2.7, '#8a2a1e', '#4a140c');
      /* Site209：豪宅门屋门钉/铺首/门槛/抱鼓 */
      if (X.doorHardwareStamp) {
        X.doorHardwareStamp(d, 17.6, 0.5, 0.45, 18.65, 2.7, { dense: true, baogu: false });
        X.doorHardwareStamp(d, 18.75, 0.5, 0.45, 19.8, 2.7, { dense: true, baogu: false });
        X.doorHardwareStamp(d, 17.4, 0.35, 0.4, 20.0, 0.7, {
          dense: false, mending: false, pushou: false, menkan: true, baogu: true, baoguSx: 0.8, baoguSy: 0.85, baoguInset: 0.2,
        });
      }
      h.stext('安居', 18.7, 0.51, 3.2, 10, '#2a2a2a');
      X.roof(d, { x0: 16.0, x1: 21.2, y0: -0.5, y1: 5.0, z: 3.9, rise: 1.7, type: 'yingshan', lift: 0.1, ridgeH: 0.26, chiwen: false, gableCol: BRICK_W, gableBrick: true });
      for (const x of [17.2, 20.2]) X.lantern(d, x, -0.35, 3.7, { r: 0.18, cord: 0.14 });
      /* Site212：豪宅门内影壁 atlas kitbash（替线稿福字板） */
      if (X.yingbiStamp) {
        X.yingbiStamp(d, 12.75, 3.35, 0.05, { kind: 'yingbi', sx: 1.05, sy: 0.95, hsx: 0.95, hsy: 0.95 });
      } else {
        d.box(10.5, 3.2, 0.05, 15.0, 3.55, 2.6, '#ddd5c4', { line: '#8a8270', west: '#c9c1b0', top: shade('#ddd5c4', 1.08) });
        h.QS(3.18, 11.2, 0.8, 14.3, 2.2, '#c8bfae', '#8a8270'); h.stext('福', 12.75, 3.16, 1.55, 22, '#8a2a1e');
      }
      /* Site214：门屋内侧月洞/落地罩/隔扇屏（门厅可见过渡） */
      if (X.screensStamp) {
        X.screensStamp(d, 18.7, 1.15, 0.5, { kind: 'menkuang', sx: 0.7, sy: 0.75 });
        X.screensStamp(d, 11.2, 4.2, 0.08, { kind: 'yuedong', sx: 0.72, sy: 0.78 });
        X.screensStamp(d, 14.4, 4.2, 0.08, { kind: 'luodizhao', sx: 0.55, sy: 0.72 });
        X.screensStamp(d, 8.8, 6.5, 0.08, { kind: 'geshan', sx: 0.55, sy: 0.68 });
      }
      /* Site216：院内花墙段点缀（与月洞/影壁互补） */
      if (X.louwindowStamp) {
        X.louwindowStamp(d, 6.2, 7.8, 0.05, { kind: 'huaziang', sx: 0.55, sy: 0.5 });
        X.louwindowStamp(d, 16.2, 10.5, 0.5, { kind: 'lou', sx: 0.45, sy: 0.5 });
      }
      // 院内花木点缀（池/假山/廊由布局另 put）
      tree(d, 5.5, 10.5, 0, { r: 1.8, ht: 5.2, n: 55, leaf: 8, col: '#5f9248', col2: '#3d6e34', flowers: '#e89aa8' });
      tree(d, 15.5, 9.0, 0, { r: 1.6, ht: 4.8, n: 48, leaf: 7, col: '#6e9a44', col2: '#466e30', flowers: '#d8a0c8' });
    },
    emit(d) {
      for (const x of [17.2, 20.2]) X.lanternGlow(d, x, -0.35, 3.7, { r: 0.18, cord: 0.14 });
      H(d).QS(18.0, 8.0, 1.2, 14.0, 3.2, 'rgba(255,190,110,0.35)');
    },
  });

})(typeof window !== 'undefined' ? window : globalThis);
