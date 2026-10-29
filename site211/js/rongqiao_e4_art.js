/* 榕桥区 E4 art (2026-10-18): 榕桥第一小学 / 榕桥中学 exteriors (Shenzhen-style modern schools) + school-gate kit.
 * Facades are VARIANTS of the kit f_wall (RongqiaoArt.skin), so school blocks sort / fade / collide like every building:
 *   f_wall  sch_a  white render, orange slab band, big classroom windows        (小学 teaching block, S faces)
 *           sch_b  外廊 open corridor: white parapet with a blue stripe, shaded back wall with classroom doors (W faces)
 *           sch_c  canteen / gym: light grey, large glazing, green cornice band
 *           sch_d  warm beige + terracotta band (中学), lit at night (晚自习)
 * New types: rq_s_gate_s / rq_s_gate_w (校门: pillars + cantilever name beam + 伸缩门 + 门岗), rq_s_name(_w) roof-top school
 * name, rq_s_flag 升旗台, rq_s_goal 小球门, rq_s_hoop 篮球架, rq_s_pp 乒乓球台, rq_s_trk_y / rq_s_trk_arc 塑胶跑道 decals
 * (four 1.5 m lanes, 30° ring sectors around one centre), rq_s_circle 中圈, rq_s_line_x 中线, rq_s_key 篮球场罚球区 decal,
 * rq_s_dropoff 接送区 / rq_s_roadtxt 路面字 decals, ground tiles rq_gturf 人造草 and rq_gcourt 球场地坪.
 * All names / colours / layouts 未经Leo确认. */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A || !A.skin) return;
  const shade = A.shade;
  function L(d, W) {
    const pt = (lx, ly, z) => (W ? [ly, -lx, z] : [lx, ly, z]), C = (c) => (W && c && c[0] === '#' ? shade(c, 0.84) : c);
    const face = (pts, fill, line, lw) => d.face(pts.map((p) => pt(...p)), C(fill), line, lw);
    const box = (lx0, ly0, z0, lx1, ly1, z1, col, o = {}) => (W ? d.box(ly0, -lx1, z0, ly1, -lx0, z1, C(col), o) : d.box(lx0, ly0, z0, lx1, ly1, z1, col, o));
    const Q = (ly, a0, z0, a1, z1, fill, line) => face([[a0, ly, z0], [a1, ly, z0], [a1, ly, z1], [a0, ly, z1]], fill, line);
    const seg = (a, b, col, lw) => d.seg(pt(...a), pt(...b), C(col), lw);
    const text = (s, lx, ly, z, size, col, o = {}) => d.text(s, ...pt(lx, ly, z), size, col, Object.assign({}, o, { west: W }));
    return { W, pt, C, face, box, Q, seg, text, textW: (s, size) => d.textW(s, size), R: d.R };
  }
  const geoL = (rot, g) => (rot === 6 ? [g[1], -g[3], g[2], g[4], -g[0], g[5]] : g);
  const F = -0.04;
  // ------------------------------------------------------------------ facades
  const PAL = { sch_a: ['#f4f2ec', '#e5793b'], sch_b: ['#f4f2ec', '#2f7fc1'], sch_c: ['#dfe2df', '#3a8f5a'], sch_d: ['#efe3cf', '#b5523b'] };
  function classroom(l, st, wall, band, lit) {
    const Q = (a0, z0, a1, z1, f, li) => l.Q(F, a0, z0, a1, z1, f, li), R = l.R;
    l.box(0, F, 0, 3, 0.3, 3, wall, { line: shade(wall, 0.62), top: shade(wall, 1.04) });
    if (st === 'ground') Q(0, 0, 3, 0.55, shade(wall, 0.78));                       // plinth
    else Q(0, 0, 3, 0.32, band, shade(band, 0.7));                                  // slab band
    const z0 = st === 'ground' ? 0.85 : 0.9;
    Q(0.22, z0 - 0.08, 2.78, z0, shade(wall, 0.86));                                // sill
    Q(0.25, z0, 2.75, 2.5, lit ? '#f4e2b0' : '#7fa3b5', '#3e5966');
    if (!lit) { Q(0.25, z0, 2.75, z0 + 0.5 + R() * 0.3, '#6d8ea0'); l.seg([0.5, F, 2.4], [1.1, F, z0 + 0.2], 'rgba(235,245,250,0.55)'); }
    for (const x of [1.08, 1.92]) l.seg([x, F, z0], [x, F, 2.5], '#3e5966', 2);
    l.seg([0.25, F, 1.9], [2.75, F, 1.9], '#3e5966');
  }
  function corridor(l, st, wall, band) {
    const Q = (a0, z0, a1, z1, f, li) => l.Q(F, a0, z0, a1, z1, f, li), R = l.R, back = '#8f989d';
    l.box(0, F, 0, 3, 0.3, 3, wall, { line: shade(wall, 0.62), top: shade(wall, 1.04) });
    if (st === 'ground') {                                                           // open ground-floor colonnade
      Q(0, 0, 3, 2.75, shade(back, 0.82)); Q(0.5, 0, 1.4, 2.3, '#5f7a88', '#33444d'); Q(1.8, 1.0, 2.6, 2.1, '#6d8a99');
      Q(0, 0, 0.18, 3, wall, shade(wall, 0.6)); Q(2.82, 0, 3, 3, wall, shade(wall, 0.6)); Q(0, 2.75, 3, 3, shade(wall, 0.95)); return;
    }
    Q(0, 1.05, 3, 2.75, back); Q(0.45, 1.05, 1.3, 2.55, '#5f7a88', '#33444d'); Q(1.7, 1.5, 2.65, 2.45, R() < 0.5 ? '#6d8a99' : '#7a96a3', '#33444d');
    Q(0, 0, 3, 1.05, wall, shade(wall, 0.6)); Q(0, 0.78, 3, 0.95, band); Q(0, 2.75, 3, 3, shade(wall, 0.95));
    l.seg([0, F, 1.05], [3, F, 1.05], shade(wall, 0.55));
  }
  function canteen(l, st, wall, band) {
    const Q = (a0, z0, a1, z1, f, li) => l.Q(F, a0, z0, a1, z1, f, li);
    l.box(0, F, 0, 3, 0.3, 3, wall, { line: shade(wall, 0.6), top: shade(wall, 1.04) });
    Q(0.15, st === 'ground' ? 0.1 : 0.45, 2.85, 2.55, '#86a8b4', '#2f3f46'); l.seg([1.5, F, 0.3], [1.5, F, 2.55], '#2f3f46', 2);
    l.seg([0.4, F, 2.3], [1.0, F, 0.7], 'rgba(235,245,250,0.55)'); Q(0, 2.62, 3, 3, band, shade(band, 0.6));
  }
  A.skin('f_wall', { variants: Object.keys(PAL), states: ['upper', 'ground'], rots: [0, 6], geo: (rot) => geoL(rot, [0, -0.04, 0, 3, 0.35, 3]),
    draw(d, st, v, rot) { const l = L(d, rot === 6), [w, b] = PAL[v];
      if (v === 'sch_b') corridor(l, st, w, b); else if (v === 'sch_c') canteen(l, st, w, b); else classroom(l, st, w, b, false); },
    emit(d, st, v, rot) { if (v !== 'sch_d') return false; const l = L(d, rot === 6); l.Q(F, 0.3, 0.95, 2.7, 2.45, 'rgba(255,240,205,0.82)'); } });
  // ------------------------------------------------------------------ school gate (S facing / W facing)
  const SN = { rq1: '榕桥第一小学', rqz: '榕桥中学' };
  function gate(d, W, v) {
    const l = L(d, W), n = SN[v] || v;
    // guard booth inside, east (S gate) / south (W gate) of the opening
    l.box(8.4, 0.9, 0, 10.3, 3.3, 2.6, '#f1f2ef', { line: '#8a9094' }); l.box(8.25, 0.75, 2.6, 10.45, 3.45, 2.8, '#2f6aa8', { line: '#1d3f66' });
    l.Q(0.89, 8.65, 0.9, 9.95, 1.9, '#6f93a8', '#3d4a52'); l.Q(0.89, 8.55, 2.05, 10.15, 2.45, '#2f6aa8'); { const t = '门岗', w = l.textW(t, 6); l.text(t, 9.35 - w / 2, 0.87, 2.1, 6, '#ffffff', { weight: 'bold' }); }
    // retractable gate (伸缩门) across the opening, closed
    for (let k = 0; k < 13; k++) { const x = 0.9 + k * 0.5; l.seg([x, 0.45, 0.15], [x + 0.25, 0.45, 1.45], '#c9ccce', 1); l.seg([x + 0.5, 0.45, 0.15], [x + 0.25, 0.45, 1.45], '#c9ccce', 1); }
    l.seg([0.9, 0.45, 1.45], [7.3, 0.45, 1.45], '#e9ebec', 2); l.seg([0.9, 0.45, 0.15], [7.3, 0.45, 0.15], '#8d9194', 2); l.box(6.9, 0.25, 0, 7.3, 0.65, 1.6, '#3c4246', { line: '#1d2124' });
    // pillars + cantilever beam with the name
    for (const x0 of [0, 7.4]) { l.box(x0, 0, 0, x0 + 0.8, 0.9, 4.3, '#e9e6de', { line: '#8f8b82' }); l.Q(-0.01, x0 + 0.1, 0.4, x0 + 0.7, 0.55, '#c8261d'); }
    l.box(-0.6, -0.3, 4.3, 10.6, 1.4, 5.0, '#f6f5f1', { line: '#9b978e', top: '#ffffff' }); l.Q(-0.31, -0.6, 4.3, 10.6, 4.42, '#c8261d');
    const sz = 13, w = l.textW(n, sz); l.text(n, 5 - w / 2, -0.32, 4.48, sz, '#c8261d', { weight: 'bold' });
  }
  A.define('rq_s_gate_s', { name: '校门', variants: ['rq1'], geo: [-0.7, -0.7, 0, 10.7, 3.5, 5.1], fp: [[0, 0, 0.8, 0.9], [7.4, 0, 8.2, 0.9], [8.4, 0.9, 10.3, 3.3]], draw(d, st, v) { gate(d, false, v); } });
  A.define('rq_s_gate_w', { name: '校门', variants: ['rqz'], geo: [-0.7, -10.45, 0, 3.5, 0.45, 5.1], fp: [[0, -0.8, 0.9, 0], [0, -8.2, 0.9, -7.4], [0.9, -10.3, 3.3, -8.4]], draw(d, st, v) { gate(d, true, v); } });
  // roof-top name boards (S / W faces)
  function nameBoard(d, W, v) { const l = L(d, W), n = SN[v] || v, sz = 20, w = l.textW(n, sz);
    for (const x of [0.4, Math.max(0.6, w - 0.5)]) l.box(x, 0.05, 0, x + 0.12, 0.17, 1.2, '#7c8183');
    l.text(n, 0, 0, 0.25, sz, '#c8261d', { weight: 'bold', stroke: '#ffffff' }); }
  A.define('rq_s_name', { name: '校名', variants: Object.keys(SN), geo: [-0.2, -0.3, 0, 4.4, 0.4, 1.5], fp: [], shadow: false, draw(d, st, v) { nameBoard(d, false, v); } });
  A.define('rq_s_name_w', { name: '校名', variants: ['rqz'], geo: [-0.3, -4.4, 0, 0.4, 0.2, 1.5], fp: [], shadow: false, draw(d, st, v) { nameBoard(d, true, v); } });
  // 升旗台 + flag
  A.define('rq_s_flag', { name: '升旗台', geo: [-1.6, -1.6, 0, 2.6, 1.6, 11], fp: [[-1.5, -1.5, 1.5, 1.5]], shadowOf: () => [[-1.5, -1.5], [1.5, -1.5], [1.5, 1.5], [-1.5, 1.5]],
    draw(d) {
      d.box(-1.5, -1.5, 0, 1.5, 1.5, 0.35, '#c9c4b8', { line: '#8a8578', top: '#d8d3c7' }); d.box(-0.9, -0.9, 0.35, 0.9, 0.9, 0.6, '#d8d3c7', { line: '#8a8578' });
      d.box(-0.06, -0.06, 0.6, 0.06, 0.06, 10.6, '#d7dbde', { line: '#8d9296' }); d.disc(0, 0, 10.65, 0.09, '#e8c547');
      const fz = 10.4, f = (u, h) => [0.08 + u, 0, fz - h]; d.face([f(0, 0), f(1.9, 0.05), f(1.95, 1.25), f(0, 1.2)], '#d5281b', '#8e1a12');
      d.text('★', 0.16, -0.01, fz - 0.62, 8, '#ffde00'); for (const [u, h] of [[0.62, 0.16], [0.76, 0.3], [0.76, 0.5], [0.62, 0.64]]) d.text('★', u, -0.01, fz - h - 0.14, 4, '#ffde00');
    } });
  // 小球门 (5-a-side), facing the pitch: n = goal at the north end (opening south), s = at the south end
  A.define('rq_s_goal', { name: '球门', variants: ['n', 's'], geo: [-1.6, -0.9, 0, 1.6, 0.9, 2.1], fp: [[-1.55, -0.1, -1.45, 0.1], [1.45, -0.1, 1.55, 0.1]],
    draw(d, st, v) { const b = v === 'n' ? 0.8 : -0.8;
      for (let x = -1.5; x <= 1.51; x += 0.25) d.seg([x, 0, 2], [x, b, 0], 'rgba(235,238,240,0.6)'); for (let z = 0.25; z < 2; z += 0.25) d.seg([-1.5, b * (1 - z / 2), z], [1.5, b * (1 - z / 2), z], 'rgba(235,238,240,0.5)');
      for (const x of [-1.5, 1.5]) d.box(x - 0.05, -0.05, 0, x + 0.05, 0.05, 2, '#ffffff', { line: '#9aa0a3' }); d.box(-1.5, -0.05, 1.95, 1.5, 0.05, 2.05, '#ffffff', { line: '#9aa0a3' }); } });
  // 篮球架: board faces s (court to the south) or n
  A.define('rq_s_hoop', { name: '篮球架', variants: ['s', 'n'], geo: [-0.9, -1.6, 0, 0.9, 1.6, 3.7], fp: [[-0.3, -0.3, 0.3, 0.3]],
    draw(d, st, v) { const s = v === 's' ? -1 : 1, by = 1.2 * s;
      d.box(-0.25, -0.25, 0, 0.25, 0.25, 0.3, '#3d6fb0', { line: '#203c60' }); d.box(-0.08, -0.08, 0.3, 0.08, 0.08, 3.1, '#3d6fb0', { line: '#203c60' });
      d.seg([0, 0, 3.0], [0, by, 3.0], '#3d6fb0', 3); d.box(-0.9, by - 0.03, 2.9, 0.9, by + 0.03, 3.95, '#f7f7f5', { line: '#555' });
      d.face([[-0.3, by + 0.04 * s, 3.05], [0.3, by + 0.04 * s, 3.05], [0.3, by + 0.04 * s, 3.45], [-0.3, by + 0.04 * s, 3.45]], 'rgba(0,0,0,0)', '#d23a2a');
      d.disc(0, by + 0.28 * s, 3.05, 0.23, 'rgba(0,0,0,0)', '#e2662a'); } });
  A.define('rq_s_pp', { name: '乒乓球台', geo: [0, 0, 0, 2.74, 1.53, 0.95], fp: [[0, 0, 2.74, 1.53]],
    draw(d) { d.box(0.3, 0.45, 0, 0.6, 1.08, 0.68, '#9c9a94'); d.box(2.14, 0.45, 0, 2.44, 1.08, 0.68, '#9c9a94');
      d.box(0, 0, 0.68, 2.74, 1.53, 0.76, '#2f7a4e', { line: '#1d4a30', top: '#3a8f5c' }); d.seg([0, 0.765, 0.77], [2.74, 0.765, 0.77], '#f2f2f2');
      d.face([[1.37, 0, 0.76], [1.37, 1.53, 0.76], [1.37, 1.53, 0.92], [1.37, 0, 0.92]], 'rgba(240,240,240,0.55)', '#555'); } });
  // ------------------------------------------------------------------ ground tiles + decals
  A.define('rq_gturf', { name: '人造草', layer: 'ground', geo: [0, 0, 0, 2, 2, 0], draw(d) { d.flat(0, 0, 2, 2, 0, '#4f9a4a'); d.flat(0, 0, 2, 1, 0, '#57a352'); for (let k = 0; k < 10; k++) d.px(d.R() * 2, d.R() * 2, 0, '#6cb866'); } });
  const RED = '#b9473a', LW = 'rgba(250,250,245,0.92)', RS = [9, 10.5, 12, 13.5, 15];
  A.define('rq_s_trk_y', { name: '塑胶跑道', layer: 'decal', geo: [0, 0, 0, 6, 4, 0], draw(d) { d.flat(0, 0, 6, 4, 0, RED); for (let k = 0; k < 14; k++) d.px(d.R() * 6, d.R() * 4, 0, '#c45547'); for (let i = 0; i < 5; i++) { const x = i * 1.5; d.seg([x, 0, 0], [x, 4, 0], LW, 1); } } });
  const ARC = Array.from({ length: 12 }, (_, i) => 'a' + i);
  const arcGeo = (v) => { const i = +String(v).slice(1) || 0, a0 = (i * 30 * Math.PI) / 180, a1 = ((i + 1) * 30 * Math.PI) / 180, xs = [], ys = [];
    for (let k = 0; k <= 6; k++) { const a = a0 + ((a1 - a0) * k) / 6; for (const r of [9, 15]) { xs.push(r * Math.cos(a)); ys.push(r * Math.sin(a)); } }
    return [Math.min(...xs) - 0.1, Math.min(...ys) - 0.1, 0, Math.max(...xs) + 0.1, Math.max(...ys) + 0.1, 0]; };
  A.define('rq_s_trk_arc', { name: '塑胶跑道弯道', layer: 'decal', variants: ARC, geo: arcGeo('a0'), geoOf: (st, v) => arcGeo(v),
    draw(d, st, v) { const i = +String(v).slice(1) || 0, a0 = (i * 30 * Math.PI) / 180, n = 12, P = (r, k) => { const a = a0 + ((Math.PI / 6) * k) / n; return [r * Math.cos(a), r * Math.sin(a), 0]; };
      const poly = []; for (let k = 0; k <= n; k++) poly.push(P(15, k)); for (let k = n; k >= 0; k--) poly.push(P(9, k)); d.face(poly, RED);
      for (let k = 0; k < 14; k++) { const p = P(9 + d.R() * 6, d.R() * n); d.px(p[0], p[1], 0, '#c45547'); }
      for (const r of RS) for (let k = 0; k < n; k++) d.seg(P(r, k), P(r, k + 1), LW, 1); } });
  A.define('rq_s_circle', { name: '中圈', layer: 'decal', geo: [-3.1, -3.1, 0, 3.1, 3.1, 0], draw(d) { const n = 28; for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2, b = ((k + 1) / n) * Math.PI * 2; d.seg([3 * Math.cos(a), 3 * Math.sin(a), 0], [3 * Math.cos(b), 3 * Math.sin(b), 0], LW, 1); } d.disc(0, 0, 0, 0.15, LW); } });
  A.define('rq_s_line_x', { name: '球场线', layer: 'decal', geo: [0, -0.06, 0, 6, 0.06, 0], draw(d) { d.flat(0, -0.05, 6, 0.05, 0, LW); } });
  A.define('rq_s_line_y', { name: '球场线', layer: 'decal', geo: [-0.06, 0, 0, 0.06, 6, 0], draw(d) { d.flat(-0.05, 0, 0.05, 6, 0, LW); } });
  // 篮球场罚球区: key 4.9 x 5.8 + free-throw circle; v s = basket at the south baseline (y 0), n = north (y 7.6 is the baseline)
  A.define('rq_s_key', { name: '篮球场罚球区', layer: 'decal', variants: ['s', 'n'], geo: [0, 0, 0, 4.9, 7.6, 0],
    draw(d, st, v) { const Y = (y) => (v === 's' ? y : 7.6 - y), sg = (a, b) => d.seg([a[0], Y(a[1]), 0], [b[0], Y(b[1]), 0], LW, 1);
      d.flat(0, Math.min(Y(0), Y(5.8)), 4.9, Math.max(Y(0), Y(5.8)), 0, 'rgba(190,80,60,0.85)'); sg([0, 0], [0, 5.8]); sg([4.9, 0], [4.9, 5.8]); sg([0, 5.8], [4.9, 5.8]);
      for (let k = 0; k < 16; k++) { const a = Math.PI * (k / 16), b = Math.PI * ((k + 1) / 16); sg([2.45 + 1.8 * Math.cos(a), 5.8 + 1.8 * Math.sin(a)], [2.45 + 1.8 * Math.cos(b), 5.8 + 1.8 * Math.sin(b)]); } } });
  A.define('rq_s_dropoff', { name: '接送区', layer: 'decal', geo: [0, 0, 0, 14, 2.4, 0], draw(d) {
      const Y = '#e8c12e'; d.flat(0, 0, 14, 0.12, 0, Y); d.flat(0, 2.28, 14, 2.4, 0, Y); d.flat(0, 0, 0.12, 2.4, 0, Y); d.flat(13.88, 0, 14, 2.4, 0, Y);
      for (let x = 0.6; x < 13.6; x += 1.2) d.seg([x, 0.15, 0], [x + 0.9, 2.25, 0], 'rgba(232,193,46,0.75)', 1);
      d.flat(4.4, 0.55, 9.6, 1.85, 0, '#5a5f63'); d.text('接送区 限停3分钟', 4.6, 0.62, 0, 7, Y, { weight: 'bold' }); } });
  const RT = { xx: '学校', mx: '慢行' };
  A.define('rq_s_roadtxt', { name: '路面字', layer: 'decal', variants: Object.keys(RT), geo: [0, 0, 0, 3, 2.4, 0], draw(d, st, v) { d.text(RT[v], 0.2, 0.5, 0, 12, 'rgba(250,250,245,0.92)', { weight: 'bold' }); } });
  A.SCHOOL = { SN, PAL: Object.keys(PAL) };
})(typeof window !== 'undefined' ? window : globalThis);
