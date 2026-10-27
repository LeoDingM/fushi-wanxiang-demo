/* P3 art: 榕桥菜市场 back-of-house and site. Management office, vendor storage cages, cold room, shared cold counters, loading
 * pallets / carts / chain barriers, the public toilet block west of the west gate, the trash room at the south end of the east
 * service passage, a parked refrigerated light truck, bollards and parked e-bikes. World orientation, rot 0 only. */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt, M = root.RongqiaoMarketArt, S = root.RongqiaoMarketStalls; if (!A || !M || !S) return;
  const { shade } = A, { quad, tiles, sign, atS, atW, bricks, GREEN, DGREEN, BLUE, STEEL, DSTEEL } = M, { crate, produce, tarp } = S;
  const CREAM = '#ebe4d0';
  function room(d, W, D, H, wall, k) {
    d.box(0, 0, 0, W, D, H, wall, { line: shade(wall, 0.5), top: '#a9a69e' });
    d.flat(0.08, 0.08, W - 0.08, D - 0.08, H, '#b9b6ae', '#7e7b74'); d.seg([0, 0, H], [W, 0, H], shade(wall, 0.45));
  }
  function door(d, at, u, w, h, col, k) { quad(d, at, u, 0, u + w, h, shade(col, k), shade(col, k * 0.5)); quad(d, at, u + 0.06, 0.06, u + w - 0.06, h - 0.06, null, shade(col, k * 0.7)); d.px(...at(u + w - 0.12, h * 0.48).slice(0, 2), '#d9d4c6', 0, 0); }
  A.define('rq_mk_office', { name: '市场管理办', geo: [0, 0, 0, 6.7, 5.1, 2.7], shadow: false, draw(d) {
    room(d, 6.7, 5.1, 2.7, CREAM); const at = atS(0), aw = atW(0, 5.1);
    tiles(d, at, 0, 6.7, 0, 1.0, 1, '#e7e3d6', 0.25); tiles(d, aw, 0, 5.1, 0, 1.0, 0.8, '#e7e3d6', 0.25);
    quad(d, at, 0.6, 1.0, 3.4, 2.1, '#6f8f9c', '#3d4c52'); for (let z = 1.08; z < 2.05; z += 0.08) d.seg(at(0.65, z), at(3.35, z), '#c9d2d0');                  // window with blinds
    quad(d, at, 0.55, 0.96, 3.45, 1.0, '#f2efe6', '#888'); door(d, at, 4.3, 0.95, 2.1, '#8a6a4a', 1);
    d.box(3.65, -0.02, 2.2, 6.2, 0.04, 2.6, BLUE, { line: '#1d3b5e' }); sign(d, atS(-0.02), 3.65, 6.2, 2.22, 2.58, '市场管理办', 1, { bg: BLUE, edge: '#1d3b5e', frame: '#bcd2ea', size: 11 });
    quad(d, aw, 1.0, 1.1, 3.6, 2.2, '#2f6a52', '#1b3d30'); for (let i = 0; i < 6; i++) { const u = 1.15 + (i % 3) * 0.8, z = 1.3 + ((i / 3) | 0) * 0.45; quad(d, aw, u, z, u + 0.6, z + 0.38, '#f6f3ea', '#999'); d.seg(aw(u + 0.05, z + 0.3), aw(u + 0.5, z + 0.3), i % 2 ? '#c62828' : '#333'); }
    d.text('公示栏', ...aw(2.0, 2.0), 8, '#f6f3ea', { west: true });
    quad(d, at, 3.55, 1.3, 4.15, 1.75, '#fdfbf2', '#777'); d.text('投诉电话 12345', ...at(3.58, 1.5), 5, '#b03a2e', { weight: 'normal' });
    d.box(5.0, 3.2, 2.7, 5.9, 3.8, 3.25, '#e1e3df', { line: '#6e736f' }); d.disc(5.45, 3.2, 2.98, 0.2, '#3d4446', '#22282a');
  } });
  A.define('rq_mk_storage', { name: '摊主储物', geo: [0, 0, 0, 7, 5.1, 2.3], shadow: false, draw(d) {
    for (let x = 0.2; x < 6.6; x += 0.9) for (let y = 0.3; y < 4.6; y += 1.4) { const h = 1 + ((x * 3 + y) | 0) % 3; for (let k = 0; k < h; k++) crate(d, x, y, k * 0.22, x + 0.75, y + 0.55, ['#3a6fb0', '#3c8f4e', '#c94a3a', '#d9a92e'][((x + y) * 2 + k | 0) % 4]); }
    d.box(5.2, 3.2, 0, 6.6, 4.6, 0.45, '#c9b083', { line: '#7e6a44' }); d.box(5.25, 3.25, 0.45, 6.55, 4.55, 0.85, '#d8c194', { line: '#7e6a44' });
    const mesh = (pts, step, a) => { d.face(pts, 'rgba(60,70,72,0.10)', '#4a5254'); };
    mesh([[0, 0, 0], [7, 0, 0], [7, 0, 2.3], [0, 0, 2.3]]); mesh([[0, 0, 0], [0, 5.1, 0], [0, 5.1, 2.3], [0, 0, 2.3]]);
    for (let x = 0.15; x < 7; x += 0.15) d.seg([x, 0, 0], [x, 0, 2.3], 'rgba(70,80,82,0.55)'); for (let z = 0.15; z < 2.3; z += 0.15) d.seg([0, 0, z], [7, 0, z], 'rgba(70,80,82,0.55)');
    for (let y = 0.15; y < 5.1; y += 0.15) d.seg([0, y, 0], [0, y, 2.3], 'rgba(60,70,72,0.5)'); for (let z = 0.15; z < 2.3; z += 0.15) d.seg([0, 0, z], [0, 5.1, z], 'rgba(60,70,72,0.5)');
    for (const x of [0, 1.75, 3.5, 5.25, 7]) d.box(x - 0.03, -0.03, 0, x + 0.03, 0.03, 2.3, '#5b6164'); for (const y of [1.7, 3.4, 5.1]) d.box(-0.03, y - 0.03, 0, 0.03, y + 0.03, 2.3, '#5b6164');
    d.seg([0, 0, 2.3], [7, 0, 2.3], '#3b4244', 2); d.seg([0, 0, 2.3], [0, 5.1, 2.3], '#3b4244', 2);
    for (const x of [0.8, 2.55, 4.3, 6.05]) { quad(d, atS(-0.01), x - 0.1, 1.0, x + 0.1, 1.15, '#e8c33a', '#5a4a10'); }
    d.box(2.2, -0.02, 2.32, 4.8, 0.04, 2.68, GREEN, { line: DGREEN }); sign(d, atS(-0.02), 2.2, 4.8, 2.34, 2.66, '摊主储物', 1, { size: 10 });
  } });
  A.define('rq_mk_coldroom', { name: '冷库', geo: [0, 0, 0, 6.5, 5.1, 2.9], shadow: false, draw(d) {
    room(d, 6.5, 5.1, 2.9, '#eef1f2'); const at = atS(0), aw = atW(0, 5.1);
    for (let u = 1.0; u < 6.5; u += 1.0) d.seg(at(u, 0), at(u, 2.9), '#c3cacd'); for (let u = 1.0; u < 5.1; u += 1.0) d.seg(aw(u, 0), aw(u, 2.9), '#b8bfc2');
    quad(d, at, 0, 0, 6.5, 0.15, '#8f979a');
    quad(d, at, 1.8, 0.05, 4.0, 2.3, '#d6dcde', '#6d777b'); quad(d, at, 1.9, 0.12, 3.9, 2.22, null, '#9aa4a8'); d.box(3.6, -0.06, 0.95, 3.68, 0, 1.4, '#555');
    for (let u = 1.95; u < 3.9; u += 0.18) quad(d, at, u, 0.15, u + 0.12, 2.15, 'rgba(220,235,240,0.22)');
    d.box(4.3, -0.03, 1.6, 4.9, 0.01, 1.85, '#1f2b26', { line: '#111' }); d.box(2.2, -0.02, 2.45, 3.6, 0.04, 2.8, BLUE, { line: '#1d3b5e' }); sign(d, atS(-0.02), 2.2, 3.6, 2.47, 2.78, '冷库', 1, { bg: BLUE, edge: '#1d3b5e', frame: '#bcd2ea', size: 11 });
    quad(d, at, 0.4, 1.3, 1.4, 1.9, '#fdfbf2', '#777'); d.text('非工作人员勿入', ...at(0.43, 1.5), 5, '#b03a2e', { weight: 'normal' });
    d.box(0.6, 1.0, 2.9, 2.8, 2.4, 3.5, '#d9dcd8', { line: '#6e736f' }); d.disc(1.2, 1.0, 3.2, 0.22, '#3d4446', '#22282a'); d.disc(2.2, 1.0, 3.2, 0.22, '#3d4446', '#22282a');
  }, emit(d) { const p = d.P(4.35, -0.03, 1.66); d.g.fillStyle = '#ff5a4a'; d.g.fillRect(Math.round(p[0]) + 2, Math.round(p[1]) - 2, 9, 3); } });
  A.define('rq_mk_coldcase', { name: '冷柜', states: M.GOODS, geo: [0, 0, 0, 2.2, 0.9, 2.0], shadow: false, draw(d, st) {
    const f = M.fillOf(st); d.box(0, 0, 0, 2.2, 0.9, 2.0, '#f2f3f1', { line: '#7a7e7c', top: '#d9dcda', noS: true });
    const at = atS(0); quad(d, at, 0, 0, 2.2, 0.35, '#e1e4e2', '#7a7e7c'); quad(d, at, 0, 1.75, 2.2, 2.0, '#2a7a46', '#1c5532'); d.text('冷藏鲜品', ...at(0.6, 1.8), 8, '#fff');
    quad(d, at, 0.06, 0.35, 2.14, 1.75, '#2e3a3c'); for (const z of [0.7, 1.05, 1.4]) quad(d, at, 0.06, z - 0.02, 2.14, z, '#c8ccce');
    if (st !== 'closed') for (const z of [0.36, 0.7, 1.05, 1.4]) for (let u = 0.1; u < 2.05; u += 0.13) if (d.R() < f + 0.05) quad(d, at, u, z + 0.02, u + 0.1, z + 0.12 + d.R() * 0.12, ['#f6f3ea', '#e8c33a', '#5aa53a', '#d9452f', '#7fb4e0'][(u * 31 | 0) % 5], '#333');
    if (st === 'closed') quad(d, at, 0.06, 0.35, 2.14, 1.75, 'rgba(210,225,230,0.55)', '#7a8a90');
  }, emit(d, st) { if (st === 'closed') return false; quad(d, atS(-0.005), 0.08, 1.68, 2.12, 1.73, 'rgba(230,248,255,0.9)'); } });
  A.define('rq_mk_pallet', { name: '货物托盘', variants: ['veg', 'foam', 'sack'], geo: [0, 0, 0, 1.2, 1.0, 1.2], shadow: false, draw(d, st, v) {
    d.box(0, 0, 0, 1.2, 1.0, 0.14, '#b48552', { line: '#6e4a26' }); for (let x = 0.1; x < 1.2; x += 0.35) quad(d, atS(0), x, 0.02, x + 0.15, 0.1, '#4a3420');
    if (v === 'veg') { for (let k = 0; k < 3; k++) { crate(d, 0.05, 0.05, 0.14 + k * 0.22, 0.58, 0.95, '#3c8f4e'); crate(d, 0.62, 0.05, 0.14 + k * 0.22, 1.15, 0.95, k === 2 ? '#3a6fb0' : '#3c8f4e'); } produce(d, 0.09, 0.09, 0.54, 0.91, 0.78, 'cabbage', 1); produce(d, 0.66, 0.09, 1.11, 0.91, 0.78, 'carrot', 1); }
    else if (v === 'foam') { for (let k = 0; k < 4; k++) d.box(0.05, 0.05, 0.14 + k * 0.25, 1.15, 0.95, 0.37 + k * 0.25, '#f4f4ef', { line: '#9a9a90' }); d.seg([0.05, 0.05, 0.5], [1.15, 0.05, 0.5], '#2c6fb0', 2); }
    else { for (let k = 0; k < 4; k++) d.box(0.06, 0.06, 0.14 + k * 0.24, 1.14, 0.94, 0.36 + k * 0.24, '#f1ede2', { line: '#8a826e' }); for (let k = 0; k < 4; k++) quad(d, atS(0.059), 0.3, 0.2 + k * 0.24, 0.9, 0.3 + k * 0.24, k % 2 ? '#c62828' : '#2a7a46'); }
  } });
  A.define('rq_mk_cart', { name: '平板推车', geo: [0, 0, 0, 1.4, 0.7, 1.0], shadow: false, draw(d) {
    for (const [x, y] of [[0.15, 0.1], [1.15, 0.1], [0.15, 0.55], [1.15, 0.55]]) d.disc(x, y, 0.06, 0.07, '#222', '#000');
    d.box(0, 0, 0.12, 1.4, 0.7, 0.18, '#3a6fb0', { line: '#1d3b5e' }); d.box(1.32, 0.05, 0.18, 1.38, 0.65, 0.95, '#5b6164'); d.seg([1.35, 0.05, 0.95], [1.35, 0.65, 0.95], '#2c3134', 2);
    crate(d, 0.08, 0.08, 0.18, 0.62, 0.62, '#3c8f4e'); crate(d, 0.66, 0.08, 0.18, 1.2, 0.62, '#c94a3a'); crate(d, 0.08, 0.08, 0.38, 0.62, 0.62, '#3c8f4e');
  } });
  A.define('rq_mk_crates', { name: '周转筐', variants: ['blue', 'green', 'mixed', 'foam'], geo: [0, 0, 0, 0.75, 0.55, 0.9], shadow: false, draw(d, st, v) {
    const n = v === 'mixed' ? 4 : 3; for (let k = 0; k < n; k++) { if (v === 'foam') d.box(0, 0, k * 0.24, 0.75, 0.55, k * 0.24 + 0.22, '#f4f4ef', { line: '#9a9a90' }); else crate(d, 0, 0, k * 0.21, 0.75, 0.55, v === 'mixed' ? ['#3a6fb0', '#3c8f4e', '#c94a3a', '#d9a92e'][k] : v === 'blue' ? '#3a6fb0' : '#3c8f4e', 0.2); }
  } });
  A.define('rq_mk_chain_y', { name: '隔离链', geo: [-0.08, 0, 0, 0.08, 2, 1.0], shadow: false, draw(d) {
    for (const y of [0, 2]) { d.box(-0.07, y - 0.07, 0, 0.07, y + 0.07, 0.06, '#333'); d.box(-0.05, y - 0.05, 0.06, 0.05, y + 0.05, 0.92, '#e8c33a', { line: '#5a4a10' }); for (let z = 0.2; z < 0.9; z += 0.3) d.box(-0.051, y - 0.051, z, 0.051, y + 0.051, z + 0.12, '#222'); }
    for (let i = 0; i < 10; i++) { const y0 = i * 0.2, y1 = y0 + 0.2, s0 = Math.sin(i / 10 * Math.PI) * 0.15, s1 = Math.sin((i + 1) / 10 * Math.PI) * 0.15; d.seg([0, y0, 0.82 - s0], [0, y1, 0.82 - s1], i % 2 ? '#e8c33a' : '#222', 2); }
  } });
  A.define('rq_mk_chain_x', { name: '隔离链', geo: [0, -0.08, 0, 2, 0.08, 1.0], shadow: false, draw(d) {
    for (const x of [0, 2]) { d.box(x - 0.07, -0.07, 0, x + 0.07, 0.07, 0.06, '#333'); d.box(x - 0.05, -0.05, 0.06, x + 0.05, 0.05, 0.92, '#e8c33a', { line: '#5a4a10' }); for (let z = 0.2; z < 0.9; z += 0.3) d.box(x - 0.051, -0.051, z, x + 0.051, 0.051, z + 0.12, '#222'); }
    for (let i = 0; i < 10; i++) { const x0 = i * 0.2, x1 = x0 + 0.2, s0 = Math.sin(i / 10 * Math.PI) * 0.15, s1 = Math.sin((i + 1) / 10 * Math.PI) * 0.15; d.seg([x0, 0, 0.82 - s0], [x1, 0, 0.82 - s1], i % 2 ? '#e8c33a' : '#222', 2); }
    quad(d, atS(-0.01), 0.6, 0.4, 1.4, 0.68, '#e8c33a', '#5a4a10'); d.text('顾客止步', ...atS(-0.02)(0.66, 0.46), 7, '#222');
  } });
  A.define('rq_bollard', { name: '隔离桩', geo: [-0.12, -0.12, 0, 0.12, 0.12, 0.9], draw(d) {
    d.box(-0.12, -0.12, 0, 0.12, 0.12, 0.08, '#6d6a66'); d.box(-0.09, -0.09, 0.08, 0.09, 0.09, 0.85, '#d8d6d0', { line: '#5d5b56', top: '#f0eee8' });
    for (const z of [0.55, 0.7]) d.box(-0.091, -0.091, z, 0.091, 0.091, z + 0.07, '#e8c33a'); d.box(-0.1, -0.1, 0.85, 0.1, 0.1, 0.9, '#5d5b56');
  } });
  // ---------------------------------------------------------------- outdoor buildings
  A.define('rq_mk_toilet', { name: '公共卫生间', geo: [0, 0, 0, 7, 7, 3.3], draw(d) {
    d.box(0, 0, 0, 7, 7, 3.3, '#e8e6df', { line: '#5d5b56', top: '#a7a49c' }); d.flat(0.15, 0.15, 6.85, 6.85, 3.3, '#b4b1a9', '#7e7b74');
    const at = atS(0), aw = atW(0, 7);
    bricks(d, at, 0, 7, 0, 0.9, 1); bricks(d, aw, 0, 7, 0, 0.9, 0.8); quad(d, at, 0, 0.9, 7, 0.98, '#cfc6b6'); quad(d, aw, 0, 0.9, 7, 0.98, '#b9b1a2');
    tiles(d, at, 0, 7, 0.98, 2.6, 1, '#efeee8', 0.3); tiles(d, aw, 0, 7, 0.98, 2.6, 0.8, '#efeee8', 0.3);
    quad(d, at, 0, 2.6, 7, 3.3, '#3f6f5a', '#1f3a2e'); quad(d, aw, 0, 2.6, 7, 3.3, shade('#3f6f5a', 0.8), '#1f3a2e');
    for (const [u, lab, col] of [[0.9, '男', '#2c6fb0'], [4.9, '女', '#c0392b']]) {
      quad(d, at, u, 0, u + 1.2, 2.2, '#3a4446', '#1f2526'); quad(d, at, u + 0.1, 0, u + 1.1, 2.1, '#56626a'); for (let z = 0.2; z < 2.0; z += 0.12) d.seg(at(u + 0.15, z), at(u + 1.05, z), '#6a777e');
      quad(d, at, u + 0.3, 2.25, u + 0.9, 2.55, col, shade(col, 0.5)); d.text(lab, ...at(u + 0.48, 2.3), 9, '#fff');
    }
    sign(d, at, 2.55, 4.45, 2.68, 3.2, '公共卫生间', 1, { size: 12 });
    quad(d, at, 2.9, 1.0, 4.1, 1.8, '#f7f4ea', '#777'); d.text('无障碍 ♿', ...at(3.0, 1.3), 7, '#2c6fb0', { weight: 'normal' });
    for (const u of [1.0, 3.0, 5.0]) { quad(d, aw, u, 1.9, u + 1.0, 2.45, '#7a8a8e', '#3d4c52'); for (let z = 1.95; z < 2.42; z += 0.08) d.seg(aw(u + 0.05, z), aw(u + 0.95, z), '#a9b8bc'); }
    for (const u of [0.3, 6.3]) { d.box(u, -0.5, 0, u + 0.4, -0.1, 0.35, '#a5543d', { line: '#5a2a1c' }); produce(d, u + 0.03, -0.47, u + 0.37, -0.13, 0.35, 'greens', 1, { mound: 0.25, size: 3 }); }
    d.box(5.5, 2.0, 3.3, 6.5, 3.2, 3.9, '#d9dcd8', { line: '#6e736f' });
  } });
  A.define('rq_mk_trash', { name: '垃圾暂存间', geo: [0, 0, 0, 4, 5, 2.8], draw(d) {
    const at = atS(0), aw = atW(0, 5);
    d.flat(0.2, 0.2, 3.8, 4.8, 0.02, '#8f8a84');
    d.box(3.75, 0, 0, 4, 5, 2.6, '#a5543d', { line: '#4a3a30' }); d.box(0, 4.75, 0, 4, 5, 2.6, '#c9c2b4', { line: '#4a3a30' });
    const bins = [['#3a6fb0', '可回收'], ['#2a7a46', '厨余'], ['#2a7a46', '厨余'], ['#c0392b', '有害'], ['#5d6467', '其他']];
    bins.forEach(([c, t], i) => { const y = 4.2 - i * 0.85; d.box(1.2, y, 0, 1.95, y + 0.7, 1.05, c, { line: shade(c, 0.5), top: shade(c, 1.15) }); d.box(1.15, y - 0.03, 1.05, 2.0, y + 0.73, 1.12, shade(c, 0.85)); d.text(t, ...atW(1.19, 0)(-y - 0.62, 0.55), 6, '#fff', { west: true }); d.disc(1.4, y + 0.1, 0.05, 0.06, '#222'); });
    d.box(0, 0, 0, 4, 0.3, 2.6, '#a5543d', { line: '#4a3a30', top: '#8e8880', noS: true }); bricks(d, at, 0, 4, 0.3, 2.6, 1); quad(d, at, 0, 0, 4, 0.3, '#6d6a66');
    d.box(-0.1, -0.1, 2.6, 4.1, 5.1, 2.8, '#7c8285', { line: '#3b4244', top: '#9aa2a4' });
    sign(d, at, 0.6, 3.4, 1.7, 2.2, '垃圾暂存间', 1, { size: 11 });
    const icons = ['#3a6fb0', '#2a7a46', '#c0392b', '#5d6467']; icons.forEach((c, i) => quad(d, at, 0.8 + i * 0.65, 1.05, 1.3 + i * 0.65, 1.5, c, shade(c, 0.5)));
    quad(d, at, 0.7, 0.55, 3.3, 0.85, '#fdfbf2', '#777'); d.text('清运时间 每日 05:00 / 21:00', ...at(0.75, 0.62), 5, '#444', { weight: 'normal' });
    d.seg(aw(0.05, 2.58), aw(4.95, 2.58), '#3b4244', 2);
  } });
  A.define('rq_truck', { name: '冷链轻卡', geo: [0, 0, 0, 2.1, 5.8, 2.8], draw(d) {
    // cab at the north end (y 4.2-5.8), insulated box y 0.2-4.1, rear doors open toward the loading area (south)
    for (const y of [0.9, 1.6, 4.9]) { d.disc(0, y, 0.38, 0.38, '#1f1f1f', '#000'); d.disc(-0.01, y, 0.38, 0.16, '#8a8f92'); }
    d.box(0.05, 0.2, 0.55, 2.05, 5.6, 0.85, '#2e3336', { line: '#121516' });
    d.box(0.05, 4.2, 0.55, 2.05, 5.75, 2.3, '#2b5fa8', { line: '#14305a', top: '#3b6fb8' }); d.face([[0.05, 4.4, 1.45], [0.05, 5.5, 1.45], [0.05, 5.4, 2.15], [0.05, 4.5, 2.15]], '#86a9bd', '#23384a');
    d.box(0.0, 0.2, 0.85, 2.1, 4.15, 2.8, '#f4f5f2', { line: '#7a7e7c', top: '#e3e5e1' });
    const aw = (u, z) => [0, 4.15 - u, z]; quad(d, aw, 0.2, 1.1, 3.75, 1.4, '#2b5fa8'); d.text('榕桥冷链 · 生鲜配送', ...aw(0.45, 1.55), 10, '#2b5fa8', { west: true }); d.text('粤A·R3517', ...aw(0.5, 1.12), 6, '#fff', { west: true });
    const at = atS(0.2); quad(d, at, 0.08, 0.9, 2.02, 2.72, '#2a2f31'); for (let k = 0; k < 3; k++) { crate(d, 0.2, 0.3, 0.9 + k * 0.22, 0.9, 1.0, '#3c8f4e'); crate(d, 1.1, 0.3, 0.9 + k * 0.22, 1.8, 1.0, '#3a6fb0'); }
    d.face([[0.0, 0.2, 0.9], [0.0, -0.75, 0.9], [0.0, -0.75, 2.72], [0.0, 0.2, 2.72]], '#e6e8e4', '#7a7e7c'); d.face([[2.1, 0.2, 0.9], [2.1, -0.75, 0.9], [2.1, -0.75, 2.72], [2.1, 0.2, 2.72]], '#f4f5f2', '#7a7e7c');
    quad(d, atS(0.18), 0.6, 0.6, 1.5, 0.78, '#1e4fa0', '#0d2a5a'); d.text('粤A R3517', ...atS(0.17)(0.65, 0.63), 5, '#fff', { weight: 'normal' });
    for (const u of [0.15, 1.85]) d.box(u, 0.15, 0.6, u + 0.15, 0.2, 0.75, '#c62828');
  } });
  A.define('rq_ebikes', { name: '电动车', variants: ['a', 'b'], geo: [0, 0, 0, 2.6, 1.6, 1.1], draw(d, st, v) {
    const cols = v === 'a' ? ['#c62828', '#2c6fb0', '#e8e6df'] : ['#2a7a46', '#e8c33a', '#3a3a3a'];
    for (let i = 0; i < 3; i++) { const x = 0.35 + i * 0.85, c = cols[i];
      d.disc(x, 0.15, 0.22, 0.22, '#1f1f1f'); d.disc(x, 1.4, 0.22, 0.22, '#1f1f1f');
      d.box(x - 0.12, 0.25, 0.2, x + 0.12, 1.3, 0.55, c, { line: shade(c, 0.5) }); d.box(x - 0.13, 0.6, 0.55, x + 0.13, 1.1, 0.72, '#222'); d.box(x - 0.04, 0.12, 0.5, x + 0.04, 0.2, 1.0, '#555');
      d.seg([x - 0.28, 0.16, 1.0], [x + 0.28, 0.16, 1.0], '#333', 2); d.box(x - 0.16, -0.05, 0.75, x + 0.16, 0.12, 0.95, '#444'); if (i === 1) produce(d, x - 0.14, -0.03, x + 0.14, 0.1, 0.92, 'greens', 1, { size: 3 }); }
  } });
  root.RongqiaoMarketSite = true;
})(typeof window !== 'undefined' ? window : globalThis);
