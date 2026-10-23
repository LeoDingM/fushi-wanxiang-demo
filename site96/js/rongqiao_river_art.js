/* 榕桥区扩张 E2 art: 月河 (water ground tiles, embankment, railings, lotus, reeds, boats), 榕桥古桥 (three-span stone arch
 * W face, stone balustrade, granite deck tiles), 槐北桥 road-bridge girders, riverside trees (古榕 with aerial roots, 榕树,
 * 木棉, 凤凰木, 垂柳, 桃花, 樱花), 竹林, 假山石, 亭, 廊, 粉墙月洞门, 石碑. World orientation, rot 0 only (rongqiao_art.js).
 * The water surface reads ~1.6 m below the banks: the north embankment and the bridge faces are drawn down to z -1.6. */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A) return;
  const shade = A.shade, mix = A.mix;
  // ------------------------------------------------------------------ ground tiles
  const WATER = '#3f7f86';
  A.define('rq_gwater', { name: '月河水面', layer: 'ground', states: ['a', 'b', 'c'], geo: [0, 0, 0, 2, 2, 0], draw(d, st) {
    const base = st === 'c' ? shade(WATER, 0.86) : WATER;
    d.flat(-0.04, -0.04, 2.04, 2.04, 0, base);
    if (st === 'c') d.flat(-0.04, -0.04, 2.04, 0.9, 0, shade(WATER, 0.7));                         // shade under the south bank
    for (let k = 0; k < 5; k++) { const x = d.R() * 1.6, y = d.R() * 1.8, w = 0.25 + d.R() * 0.35; d.seg([x, y, 0], [x + w, y, 0], k % 2 ? 'rgba(170,215,214,0.75)' : shade(base, 1.18)); }
    if (st === 'b') { const x = d.R() * 1.4, y = d.R() * 1.4; d.seg([x, y, 0], [x + 0.5, y, 0], 'rgba(235,245,240,0.8)'); }
  } });
  A.define('rq_gstone', { name: '古桥石板', layer: 'ground', geo: [0, 0, 0, 2, 2, 0], draw(d) {
    d.flat(-0.03, -0.03, 2.03, 2.03, 0, '#8f897b'); for (let j = 0; j < 4; j++) { const off = j % 2 ? 0.5 : 0; for (let x = -off; x < 2; x += 1) d.flat(Math.max(0, x), j * 0.5, Math.min(2, x + 1), j * 0.5 + 0.5, 0, shade('#b9b2a2', 0.9 + d.R() * 0.14), '#8f897b'); }
    if (d.R() < 0.5) d.flat(0.4, 0.9, 0.7, 1.0, 0, 'rgba(80,90,70,0.35)');
  } });
  // ------------------------------------------------------------------ embankment, railings, bridges
  A.define('rq_x_embank_s', { name: '花岗岩驳岸', geo: [0, -0.05, -1.6, 3, 0.35, 0.18], fp: [], noShadow: true, draw(d) {
    const F = (x0, z0, x1, z1, c, l) => d.face([[x0, -0.05, z0], [x1, -0.05, z0], [x1, -0.05, z1], [x0, -0.05, z1]], c, l);
    F(0, -1.6, 3, 0, '#a59f90', '#7d776a');
    for (let z = -1.6, k = 0; z < -0.05; z += 0.4, k++) for (let x = k % 2 ? -0.5 : 0; x < 3; x += 1) F(Math.max(0, x), z, Math.min(3, x + 1), Math.min(0, z + 0.4), shade('#aaa393', 0.9 + d.R() * 0.16), '#7d776a');
    F(0, -1.6, 3, -1.3, 'rgba(58,92,70,0.85)'); F(0, -1.3, 3, -1.18, 'rgba(70,110,80,0.6)');
    d.box(0, -0.05, 0, 3, 0.35, 0.18, '#c9c3b4', { line: '#8f897b' });
  } });
  function rail(d, at, stone) {
    for (let u = 0; u <= 3.01; u += 1.5) { const [x, y] = at(u); d.box(x - 0.09, y - 0.09, 0, x + 0.09, y + 0.09, 1.05, stone ? '#c8c1b1' : '#c9c3b4', { line: '#7f796c' }); }
    for (const z of [0.45, 0.95]) { const a = at(0), b = at(3); d.seg([a[0], a[1], z], [b[0], b[1], z], '#4c5a60', 2); }
  }
  A.define('rq_x_rail_s', { name: '滨河栏杆', geo: [-0.1, -0.1, 0, 3.1, 0.1, 1.05], fp: [[0, -0.08, 3, 0.08]], draw(d) { rail(d, (u) => [u, 0]); } });
  A.define('rq_x_rail_w', { name: '桥栏杆', geo: [-0.1, -0.1, 0, 0.1, 3.1, 1.05], fp: [[-0.08, 0, 0.08, 3]], draw(d) { rail(d, (u) => [0, 3 - u]); } });
  A.define('rq_x_bal_w', { name: '古桥石栏', geo: [-0.2, -0.1, 0, 0.2, 3.1, 1.1], fp: [[-0.15, 0, 0.15, 3]], draw(d) {
    d.box(-0.16, 0, 0, 0.16, 3, 0.18, '#bdb6a6', { line: '#8a8476' });
    for (const y of [2.4, 0.9]) d.box(-0.07, y - 0.75, 0.18, 0.07, y + 0.6, 0.82, '#cfc8b8', { line: '#8a8476' });
    for (const y of [3, 1.5, 0]) { d.box(-0.13, y - 0.13, 0, 0.13, y + 0.13, 0.95, '#c6bfae', { line: '#857f71' }); d.disc(0, y, 1.03, 0.11, '#d2cbbb', '#857f71'); }
    d.face([[-0.07, 2.0, 0.32], [-0.07, 1.3, 0.32], [-0.07, 1.3, 0.66], [-0.07, 2.0, 0.66]], null, '#9b9585');
  } });
  /* stone arch span, west face, 15.33 m long (three spans make the 46 m 榕桥古桥) */
  const SPAN = 46 / 3;
  A.define('rq_x_arch_w', { name: '榕桥古桥拱券', geo: [-0.35, 0, -1.6, 0, SPAN, 0.45], fp: [], noShadow: true, draw(d) {
    const X = -0.3, P = (y, z) => [X, y, z], g = d.g;
    // spandrel wall
    d.face([P(0, -1.6), P(SPAN, -1.6), P(SPAN, 0.45), P(0, 0.45)], '#b7ae9a', '#7e7666');
    for (let z = -1.5, k = 0; z < 0.4; z += 0.32, k++) d.seg(P(0, z), P(SPAN, z), 'rgba(110,100,85,0.45)');
    // arch opening (segmental), dark under-vault with a water reflection
    const c = SPAN / 2, hw = 5.6, top = 0.02, pts = [];
    for (let a = 0; a <= 32; a++) { const t = Math.PI * a / 32; pts.push(P(c + Math.cos(t) * hw, -1.6 + Math.sin(t) * (top + 1.6))); }
    d.face(pts, '#2c3a38', '#5d5547');
    const ref = []; for (let a = 0; a <= 16; a++) { const t = Math.PI * a / 16; ref.push(P(c + Math.cos(t) * hw * 0.92, -1.6 + Math.sin(t) * 0.45)); }
    d.face(ref, 'rgba(90,140,140,0.75)');
    // voussoirs
    for (let a = 1; a < 32; a += 2) { const t = Math.PI * a / 32, r0 = [Math.cos(t) * hw, Math.sin(t) * (top + 1.6)], r1 = [Math.cos(t) * (hw + 0.55), Math.sin(t) * (top + 1.6) + 0.42]; d.seg(P(c + r0[0], -1.6 + r0[1]), P(c + r1[0], -1.6 + Math.min(0.4, r1[1])), '#857c69'); }
    // string course + moss at the waterline
    d.face([P(0, 0.2), P(SPAN, 0.2), P(SPAN, 0.45), P(0, 0.45)], '#c9c0ac', '#7e7666');
    d.face([P(0, -1.6), P(c - hw, -1.6), P(c - hw, -1.32), P(0, -1.32)], 'rgba(60,95,72,0.85)'); d.face([P(c + hw, -1.6), P(SPAN, -1.6), P(SPAN, -1.32), P(c + hw, -1.32)], 'rgba(60,95,72,0.85)');
    for (let k = 0; k < 7; k++) { const y = d.R() * SPAN, z = -1.2 + d.R() * 1.3; if (Math.abs(y - c) < hw + 0.4 && z < 0) continue; d.px(X, y, z, '#4f7d4a', 3, 2); }
    void g;
  } });
  A.define('rq_x_rbridge_w', { name: '槐北桥梁体', variants: ['g', 'p'], geo: [-0.3, 0, -1.6, 0, 3, 0.25], fp: [], noShadow: true, draw(d, st, v) {
    const P = (y, z) => [-0.25, y, z];
    d.face([P(0, -0.7), P(3, -0.7), P(3, 0.25), P(0, 0.25)], '#a9aca8', '#6f7370'); d.face([P(0, 0.05), P(3, 0.05), P(3, 0.25), P(0, 0.25)], '#c4c7c2');
    d.face([P(0, -0.75), P(3, -0.75), P(3, -0.7), P(0, -0.7)], '#5d625f');
    if (v === 'p') { d.box(-0.6, 1.0, -1.6, -0.1, 2.0, -0.7, '#9da19d', { line: '#6a6e6b' }); d.face([[-0.6, 1.0, -1.6], [-0.6, 2.0, -1.6], [-0.6, 2.0, -1.35], [-0.6, 1.0, -1.35]], 'rgba(60,95,72,0.8)'); }
  } });
  // ------------------------------------------------------------------ water life
  A.define('rq_x_lotus', { name: '荷花', variants: ['a', 'b'], geo: [0, 0, 0, 3, 2, 0.7], fp: [], noShadow: true, draw(d, st, v) {
    const R = d.R;
    for (let k = 0; k < 22; k++) { const x = 0.25 + R() * 2.5, y = 0.2 + R() * 1.6; d.disc(x, y, 0.02, 0.16 + R() * 0.1, shade('#4f8f3e', 0.8 + R() * 0.35), '#2f5f2a'); }
    for (let k = 0; k < 4; k++) { const x = 0.4 + R() * 2.2, y = 0.3 + R() * 1.4; d.seg([x, y, 0], [x, y, 0.45], '#3d6e31'); d.disc(x, y, 0.5, 0.2, '#5a9a45', '#2f5f2a'); }
    const fl = v === 'b' ? '#f4f0e8' : '#f08fb0';
    for (let k = 0; k < 4; k++) { const x = 0.5 + R() * 2, y = 0.3 + R() * 1.4; d.seg([x, y, 0], [x, y, 0.55], '#3d6e31'); d.px(x, y, 0.62, fl, 4, 3); d.px(x, y, 0.66, shade(fl, 0.85), 2, 1); }
  } });
  A.define('rq_x_reed', { name: '芦苇', variants: ['reed', 'iris'], geo: [-0.6, -0.4, 0, 0.6, 0.4, 1.7], fp: [], noShadow: true, draw(d, st, v) {
    const R = d.R;
    for (let k = 0; k < 26; k++) { const x = (R() - 0.5) * 1.1, y = (R() - 0.5) * 0.7, h = 0.9 + R() * 0.75, lean = (R() - 0.5) * 0.3; d.seg([x, y, 0], [x + lean, y, h], shade(v === 'iris' ? '#4d8a3c' : '#8a9a4a', 0.8 + R() * 0.4)); if (v === 'reed' && k % 3 === 0) d.px(x + lean, y, h + 0.05, '#c9b98a', 2, 3); }
    if (v === 'iris') for (let k = 0; k < 5; k++) d.px((R() - 0.5) * 0.9, (R() - 0.5) * 0.5, 0.9 + R() * 0.3, '#7d5ac2', 3, 3);
  } });
  A.define('rq_x_boat', { name: '小木船', geo: [0, 0, -0.1, 4.6, 1.6, 0.9], fp: [], draw(d) {
    d.face([[0, 0.8, 0.45], [0.8, 0.05, 0], [3.8, 0.05, 0], [4.6, 0.8, 0.45], [3.8, 1.55, 0.45], [0.8, 1.55, 0.45]], '#6e4a2c', '#3e2a18');
    d.face([[0.8, 0.05, 0], [3.8, 0.05, 0], [3.8, 0.05, 0.45], [0.8, 0.05, 0.45]], '#8a5f38', '#3e2a18');
    d.face([[0.6, 0.3, 0.42], [4.0, 0.3, 0.42], [4.0, 1.3, 0.42], [0.6, 1.3, 0.42]], '#5a3c22');
    d.face([[1.6, 0.25, 0.45], [3.0, 0.25, 0.45], [3.0, 0.25, 0.85], [1.6, 0.25, 0.85]], '#2f2a22', '#1c1812'); d.face([[1.6, 0.25, 0.85], [3.0, 0.25, 0.85], [3.0, 1.35, 0.85], [1.6, 1.35, 0.85]], '#3c352a', '#1c1812');
  } });
  // ------------------------------------------------------------------ trees
  /** soft ground shadow (the sun throws shadows north, a little east) instead of the box sweep */
  function groundShadow(d, r) { const c = d.P(0.25 * r * 0.4, r * 0.55, 0), g = d.g; g.fillStyle = 'rgba(20,30,20,0.26)'; g.beginPath(); g.ellipse(c[0], c[1], r * 32 * 1.2, r * 16 * 1.25, 0, 0, Math.PI * 2); g.fill(); }
  function trunk(d, h, col, w) { w = w || 0.16; d.box(-w, -w, 0, w, w, h, col || '#6b4f36', { line: '#3e2c1d' }); }
  function blobs(d, cx, cy, cz, rx, rz, n, col, opt = {}) {
    const R = d.R, pts = [];
    for (let k = 0; k < n; k++) { const a = R() * Math.PI * 2, r = Math.sqrt(R()) * rx, z = cz + (R() - 0.35) * rz; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, z]); }
    pts.sort((a, b) => (b[0] + b[1]) - (a[0] + a[1]) || a[2] - b[2]);
    for (const [x, y, z] of pts) { const lit = 0.75 + (z - cz + rz) / (2 * rz) * 0.45 + (x < cx ? 0.06 : 0); d.disc(x, y, z, opt.r || 0.55, shade(col, lit), shade(col, 0.55)); }
    if (opt.flowers) for (let k = 0; k < opt.fn; k++) { const a = R() * Math.PI * 2, r = Math.sqrt(R()) * rx * 0.9; d.px(cx + Math.cos(a) * r, cy + Math.sin(a) * r, cz + (R() - 0.1) * rz, opt.flowers[k % opt.flowers.length], 3, 2); }
  }
  /** 垂柳 weeping willow: short gnarled dark trunk with a slight lean, a few limbs arching out of a low crown, and a dense
   *  curtain of long thin strands cascading almost to the ground — layered dark green at the back / inside to light
   *  yellow-green at the front and the tips, with gaps where the limbs show through.  lx/ly = crown lean (m), s = size. */
  function weeping(d, lx, ly, s) {
    const R = d.R, TR = '#4a3a2b', TL = '#2c2219', H = 3.3 * s, top = [lx, ly, H];
    // gnarled trunk: three kinked, tapering segments + a root flare
    const k1 = [lx * 0.3 + 0.12, ly * 0.3 - 0.08, H * 0.38], k2 = [lx * 0.7 - 0.1, ly * 0.7 + 0.1, H * 0.72];
    d.disc(0, 0, 0.04, 0.42 * s, '#4f4130', TL);
    for (const [a, b, w] of [[[0, 0, 0], k1, 9], [k1, k2, 8], [k2, top, 7]]) { d.seg(a, b, TL, w + 2); d.seg(a, b, TR, w); d.seg([a[0] - 0.08, a[1] + 0.08, a[2]], [b[0] - 0.08, b[1] + 0.08, b[2]], '#6a5642', 2); }
    // limbs arching up and out from the crown; each is a polyline we later hang strands from
    const n = 9 + Math.round(s * 3), limbs = [], rad = 2.55 * s;
    for (let k = 0; k < n; k++) {
      const a = k / n * Math.PI * 2 + R() * 0.5, r = rad * (0.8 + R() * 0.3), up = (1.5 + R() * 0.8) * s, pts = [];
      for (let t = 0; t <= 1.0001; t += 0.125) pts.push([top[0] + Math.cos(a) * r * t, top[1] + Math.sin(a) * r * t, top[2] + up * Math.sin(Math.PI * Math.min(1, t * 0.95)) * (1 - t * 0.25) + (t > 0.7 ? -(t - 0.7) * 1.2 * s : 0)]);
      limbs.push({ a, pts });
    }
    const depth = (p) => p[0] + p[1];
    limbs.sort((p, q) => depth(q.pts[4]) - depth(p.pts[4]));
    const strands = [];
    for (const L of limbs) {
      const gap = R() < 0.18;                                          // an open sector that shows the bare limb
      for (let i = 3; i < L.pts.length; i++) {
        const per = gap ? 1 : 5 + i;
        for (let m = 0; m < per; m++) {
          const t0 = L.pts[i - 1], t1 = L.pts[i], u = R(), p = [t0[0] + (t1[0] - t0[0]) * u + (R() - 0.5) * 0.4 * i * s / 4, t0[1] + (t1[1] - t0[1]) * u + (R() - 0.5) * 0.4 * i * s / 4, t0[2] + (t1[2] - t0[2]) * u];
          const outer = i / (L.pts.length - 1), len = p[2] * (0.55 + outer * 0.38 + R() * 0.12), drift = 0.12 + outer * 0.3;
          strands.push({ p, len, drift, a: L.a, d: depth(p), outer });
        }
      }
    }
    // inner shade mass so the curtain reads dense, not see-through
    for (let k = 0; k < 70; k++) { const a = R() * Math.PI * 2, r = Math.sqrt(R()) * 1.7 * s, x = top[0] + Math.cos(a) * r, y = top[1] + Math.sin(a) * r, z = H + (0.5 + R() * 0.9) * s; d.seg([x, y, z], [x + Math.cos(a) * 0.2, y + Math.sin(a) * 0.2, z * (0.3 + R() * 0.25)], shade('#3a5c25', 0.8 + R() * 0.35), 2); }
    const limbsDraw = (front) => { for (const L of limbs) if ((depth(L.pts[4]) < depth(top)) === front) for (let i = 1; i < L.pts.length; i++) d.seg(L.pts[i - 1], L.pts[i], i < 4 ? TR : '#5a4a36', i < 3 ? 4 : i < 6 ? 3 : 2); };
    limbsDraw(false);
    strands.sort((p, q) => q.d - p.d);
    const cMin = Math.min(...strands.map((t) => t.d)), cMax = Math.max(...strands.map((t) => t.d)), D = cMax - cMin || 1;
    const PAL = ['#3c6527', '#507d2e', '#679434', '#7fa93c', '#98bd4a', '#b2cf5e'];
    let frontDrawn = false;
    for (const t of strands) {
      if (!frontDrawn && t.d < depth(top)) { limbsDraw(true); frontDrawn = true; }
      const f = 1 - (t.d - cMin) / D, li = Math.min(PAL.length - 1, Math.max(0, Math.floor(f * 2.7 + t.outer * 1.4 + R() * 1.3))), col = PAL[li];
      const ox = Math.cos(t.a) * t.drift, oy = Math.sin(t.a) * t.drift, z1 = t.p[2] - t.len * 0.5, z2 = Math.max(0.25, t.p[2] - t.len);
      const m1 = [t.p[0] + ox * 0.7, t.p[1] + oy * 0.7, z1], m2 = [t.p[0] + ox, t.p[1] + oy, z2];
      d.seg(t.p, m1, shade(col, 0.92), R() < 0.6 ? 2 : 1); d.seg(m1, m2, col, R() < 0.3 ? 2 : 1);
      if (R() < 0.55) d.px(m2[0], m2[1], m2[2], PAL[Math.min(PAL.length - 1, li + 1)], 1, 2);   // a lighter leafy tip
    }
    if (!frontDrawn) limbsDraw(true);
  }
  const TREES = {
    rong: { geo: [-3, -3, 0, 3, 3, 6.4] }, kapok: { geo: [-2.6, -2.6, 0, 2.6, 2.6, 8.2] }, flame: { geo: [-3.8, -3.8, 0, 3.8, 3.8, 5.4] },
    willow: { geo: [-3.3, -3.3, 0, 3.3, 3.3, 6.2], wl: [0.5, -0.15, 1.0] }, willow2: { geo: [-3.9, -3.9, 0, 3.9, 3.9, 7.0], wl: [-0.35, 0.55, 1.18] }, willow3: { geo: [-2.7, -2.7, 0, 2.7, 2.7, 5.2], wl: [0.15, 0.7, 0.82] }, peach: { geo: [-2, -2, 0, 2, 2, 4] }, sakura: { geo: [-2.3, -2.3, 0, 2.3, 2.3, 4.4] },
  };
  A.define('rq_x_tree', { name: '园林树', variants: Object.keys(TREES), geo: TREES.rong.geo, noShadow: true, soft: true, pad: 48, geoOf: (s, v) => (TREES[v] || TREES.rong).geo, fp: [[-0.25, -0.25, 0.25, 0.25]], draw(d, st, v) {
    const R = d.R, gr = (TREES[v] || TREES.rong).geo[3] * 0.85;
    groundShadow(d, gr);
    if (v === 'rong') { trunk(d, 2.6, '#7a6a55', 0.28); for (const a of [0.6, 2.4, 4.1]) d.seg([0, 0, 2.2], [Math.cos(a) * 1.4, Math.sin(a) * 1.4, 3.3], '#6a5a46', 3); blobs(d, 0, 0, 4.4, 2.7, 1.5, 70, '#2f6e34'); }
    else if (v === 'kapok') { trunk(d, 6.4, '#8a7a66', 0.22); for (const z of [3.6, 4.8, 6.0]) for (const a of [0.3, 1.9, 3.5, 5.1]) { const r = 1.6 - (z - 3.6) * 0.3; d.seg([0, 0, z], [Math.cos(a + z) * r, Math.sin(a + z) * r, z + 0.3], '#6f604d', 2); } blobs(d, 0, 0, 6.3, 1.9, 1.6, 34, '#5f8f3a', { r: 0.42, flowers: ['#d8302a', '#e8502a', '#b81f1f'], fn: 46 }); }
    else if (v === 'flame') { trunk(d, 2.8, '#6b5a46', 0.2); for (const a of [0.2, 1.4, 2.6, 3.8, 5.0]) d.seg([0, 0, 2.6], [Math.cos(a) * 2.2, Math.sin(a) * 2.2, 3.7], '#5d4d3b', 2); blobs(d, 0, 0, 4.3, 3.5, 0.65, 60, '#4f8f3a', { r: 0.5, flowers: ['#e8501f', '#f06a1f', '#d83a1a'], fn: 90 }); }
    else if (TREES[v] && TREES[v].wl) weeping(d, ...TREES[v].wl);
    else if (v === 'peach' || v === 'sakura') { trunk(d, 1.6, '#6e4a3a', 0.13); for (const a of [0.5, 2.2, 3.9, 5.4]) d.seg([0, 0, 1.4], [Math.cos(a) * 1.2, Math.sin(a) * 1.2, 2.4], '#5e3e30', 2); const c = v === 'peach' ? '#e97ba5' : '#f4c4d4'; blobs(d, 0, 0, 2.9, 1.8, 0.8, 46, c, { r: 0.42, flowers: v === 'peach' ? ['#ffffff', '#c8487a'] : ['#ffffff', '#e89ab4'], fn: 30 }); blobs(d, 0, 0, 2.6, 1.4, 0.5, 8, '#6a9a44', { r: 0.3 }); }
  } });
  A.define('rq_x_banyan', { name: '古榕', geo: [-5.5, -5.5, 0, 5.5, 5.5, 9.5], noShadow: true, soft: true, pad: 48, fp: [[-0.9, -0.9, 0.9, 0.9]], draw(d) {
    const R = d.R;
    groundShadow(d, 5);
    d.disc(0, 0, 0.05, 1.4, '#8a7a62', '#5a4a36');
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, x = Math.cos(a) * 0.55, y = Math.sin(a) * 0.55; d.box(x - 0.22, y - 0.22, 0, x + 0.22, y + 0.22, 3.4, shade('#7b6b56', 0.85 + R() * 0.3), { line: '#43372a' }); }
    for (const a of [0.2, 1.3, 2.4, 3.5, 4.6, 5.6]) { const ex = Math.cos(a) * 3.8, ey = Math.sin(a) * 3.8; d.seg([0, 0, 3.0], [ex, ey, 4.6], '#6a5a46', 4); d.seg([ex * 0.6, ey * 0.6, 3.9], [ex * 0.6, ey * 0.6, 0], '#7a6a55', 2); }
    for (let k = 0; k < 60; k++) { const a = R() * Math.PI * 2, r = 1.2 + R() * 3.8, x = Math.cos(a) * r, y = Math.sin(a) * r, z = 4.4 + R() * 0.8; d.seg([x, y, z], [x, y, z - 1.2 - R() * 2.8], 'rgba(110,90,62,0.85)'); }
    blobs(d, 0, 0, 6.6, 5.0, 1.9, 150, '#2c6630', { r: 0.62 });
    d.box(-1.5, -1.5, 0, 1.5, 1.5, 0.45, '#bdb6a6', { line: '#857f71', noTop: true });                // stone tree ring seat
    d.face([[-1.5, -1.5, 0.45], [1.5, -1.5, 0.45], [1.5, -1.5, 0.52], [-1.5, -1.5, 0.52]], '#c95a3a');  // red prayer ribbon
  } });
  A.define('rq_x_bamboo', { name: '竹林', variants: ['a', 'b'], geo: [-1.3, -1, 0, 1.3, 1, 6], noShadow: true, soft: true, pad: 48, fp: [[-0.9, -0.6, 0.9, 0.6]], draw(d) {
    const R = d.R, culms = []; groundShadow(d, 1.6);
    for (let k = 0; k < 34; k++) culms.push([(R() - 0.5) * 1.8, (R() - 0.5) * 1.2, 4.2 + R() * 1.6, (R() - 0.5) * 0.6]);
    culms.sort((a, b) => (b[0] + b[1]) - (a[0] + a[1]));
    for (const [x, y, h, lean] of culms) { const c = shade('#6f9a3a', 0.8 + R() * 0.4); d.seg([x, y, 0], [x + lean, y, h], c, 2); for (let z = 0.6; z < h; z += 0.6) d.px(x + lean * z / h, y, z, shade(c, 0.6), 2, 1); }
    for (const [x, y, h, lean] of culms) for (let k = 0; k < 12; k++) { const z = h * (0.55 + R() * 0.45), xx = x + lean * z / h; d.seg([xx, y, z], [xx + (R() - 0.5) * 0.9, y + (R() - 0.5) * 0.4, z - 0.25], shade('#5e9a3a', 0.8 + R() * 0.5), 2); }
  } });
  // ------------------------------------------------------------------ garden structures
  const TILE = '#4d5257', RED = '#9c2f25';
  function roofPyr(d, x0, y0, x1, y1, z, h, over) {
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, a = [x0 - over, y0 - over], b = [x1 + over, y0 - over], c = [x1 + over, y1 + over], e = [x0 - over, y1 + over], ap = [cx, cy, z + h];
    d.face([[e[0], e[1], z + 0.25], [a[0], a[1], z + 0.25], ap], shade(TILE, 0.8), '#2a2d30'); d.face([[a[0], a[1], z + 0.25], [b[0], b[1], z + 0.25], ap], TILE, '#2a2d30');
    for (let t = 0.15; t < 1; t += 0.15) d.seg([a[0] + (b[0] - a[0]) * t, a[1], z + 0.25], [ap[0], ap[1], ap[2]], '#3b4044');
    d.seg([a[0], a[1], z + 0.25], [a[0] - 0.25, a[1] - 0.25, z + 0.55], '#2a2d30', 2); d.seg([b[0], b[1], z + 0.25], [b[0] + 0.25, b[1] - 0.25, z + 0.55], '#2a2d30', 2); d.seg([e[0], e[1], z + 0.25], [e[0] - 0.25, e[1] + 0.25, z + 0.55], '#2a2d30', 2);
    d.box(cx - 0.08, cy - 0.08, z + h, cx + 0.08, cy + 0.08, z + h + 0.45, '#b08a3a');
  }
  A.define('rq_x_pavilion', { name: '亭', geo: [-0.8, -0.8, 0, 4.8, 4.8, 5.4], fp: [[0, 0, 0.35, 0.35], [3.65, 0, 4, 0.35], [0, 3.65, 0.35, 4], [3.65, 3.65, 4, 4]], draw(d) {
    d.box(-0.3, -0.3, 0, 4.3, 4.3, 0.3, '#b9b2a2', { line: '#857f71' });
    for (const [x, y] of [[3.65, 3.65], [0, 3.65], [3.65, 0], [0, 0]]) d.box(x, y, 0.3, x + 0.35, y + 0.35, 3.2, RED, { line: '#5a1a14' });
    d.box(0.35, 3.75, 0.3, 3.65, 3.95, 0.85, '#7a3a24'); d.box(3.75, 0.35, 0.3, 3.95, 3.65, 0.85, '#7a3a24');
    d.face([[0, 0, 2.8], [4, 0, 2.8], [4, 0, 3.2], [0, 0, 3.2]], '#2f6a5a', '#1e3f36'); d.face([[0, 0, 2.8], [0, 4, 2.8], [0, 4, 3.2], [0, 0, 3.2]], '#285a4d', '#1e3f36');
    roofPyr(d, 0, 0, 4, 4, 3.2, 1.9, 0.8);
  } });
  A.define('rq_x_lang', { name: '廊', geo: [-0.5, -0.5, 0, 6.5, 2.9, 3.8], fp: [[0, 0, 0.3, 0.3], [2, 0, 2.3, 0.3], [4, 0, 4.3, 0.3], [5.7, 0, 6, 0.3], [0, 2.1, 0.3, 2.4], [2, 2.1, 2.3, 2.4], [4, 2.1, 4.3, 2.4], [5.7, 2.1, 6, 2.4]], draw(d) {
    d.box(-0.1, -0.1, 0, 6.1, 2.5, 0.25, '#b9b2a2', { line: '#857f71' });
    for (const y of [2.1, 0]) for (const x of [5.7, 4, 2, 0]) d.box(x, y, 0.25, x + 0.3, y + 0.3, 2.7, RED, { line: '#5a1a14' });
    d.box(0.3, 2.15, 0.25, 5.7, 2.35, 0.7, '#7a3a24');
    d.face([[0, 0, 2.45], [6, 0, 2.45], [6, 0, 2.7], [0, 0, 2.7]], '#2f6a5a', '#1e3f36');
    d.face([[-0.5, -0.5, 2.75], [6.5, -0.5, 2.75], [6.5, 1.2, 3.75], [-0.5, 1.2, 3.75]], TILE, '#2a2d30');
    d.face([[-0.5, -0.5, 2.75], [-0.5, 1.2, 3.75], [-0.5, 2.9, 2.75]], shade(TILE, 0.75), '#2a2d30');
    for (let x = 0; x < 6.5; x += 0.35) d.seg([x - 0.5, -0.5, 2.75], [x - 0.5, 1.2, 3.75], '#3b4044');
    d.seg([-0.5, 1.2, 3.78], [6.5, 1.2, 3.78], '#2a2d30', 2);
  } });
  A.define('rq_x_moonwall', { name: '粉墙月洞门', states: ['wall', 'gate'], geo: [0, -0.18, 0, 3, 0.18, 2.9], fp: [[0, -0.15, 3, 0.15]], fpStates: { wall: [[0, -0.15, 3, 0.15]], gate: [[0, -0.15, 0.35, 0.15], [2.65, -0.15, 3, 0.15]] }, draw(d, st) {
    const g = d.g, Y = -0.15, P = (x, z) => d.P(x, Y, z);
    g.beginPath(); for (const [i, p] of [[0, P(0, 0)], [1, P(3, 0)], [2, P(3, 2.55)], [3, P(0, 2.55)]]) i ? g.lineTo(...p) : g.moveTo(...p); g.closePath();
    if (st === 'gate') { for (let a = 0; a <= 40; a++) { const t = -Math.PI / 2 + Math.PI * 2 * a / 40, p = P(1.5 + Math.cos(t) * 1.15, 1.2 + Math.sin(t) * 1.15); a ? g.lineTo(...p) : g.moveTo(...p); } g.closePath(); }
    g.fillStyle = '#efece4'; g.fill('evenodd'); g.strokeStyle = '#a8a397'; g.lineWidth = 1; g.stroke();
    d.face([[0, Y, 0], [3, Y, 0], [3, Y, 0.3], [0, Y, 0.3]], '#7f8a8c');
    if (st === 'gate') { const ring = []; for (let a = 0; a <= 40; a++) { const t = Math.PI * 2 * a / 40; ring.push([1.5 + Math.cos(t) * 1.25, Y, 1.2 + Math.sin(t) * 1.25]); } d.face(ring, null, '#8f8a7e', 2); }
    d.box(-0.05, -0.28, 2.55, 3.05, 0.28, 2.75, TILE, { line: '#2a2d30' }); d.face([[-0.05, -0.28, 2.75], [3.05, -0.28, 2.75], [3.05, 0, 2.9], [-0.05, 0, 2.9]], shade(TILE, 1.1), '#2a2d30');
  } });
  A.define('rq_x_rock', { name: '假山石', variants: ['a', 'b'], geo: [-1, -0.8, 0, 1, 0.8, 1.9], fp: [[-0.8, -0.6, 0.8, 0.6]], draw(d, st, v) {
    const R = d.R, h = v === 'a' ? 1.8 : 1.2;
    for (let k = 0; k < 5; k++) { const x = (R() - 0.5) * 1.2, y = (R() - 0.5) * 0.8, w = 0.4 + R() * 0.4, hh = h * (0.5 + R() * 0.5); d.box(x - w, y - w * 0.7, 0, x + w, y + w * 0.7, hh, shade('#9a9a90', 0.85 + R() * 0.3), { line: '#5c5c55' }); }
    for (let k = 0; k < 6; k++) d.disc((R() - 0.5) * 1.2, -0.75, 0.3 + R() * (h - 0.4), 0.07, '#4a4a44');
    d.disc(0.5, 0.3, 0.2, 0.25, '#4f8f3e', '#2f5f2a');
  } });
  A.define('rq_x_stele', { name: '榕桥石碑', geo: [-0.9, -0.5, 0, 0.9, 0.5, 2.6], fp: [[-0.8, -0.45, 0.8, 0.45]], draw(d) {
    d.box(-0.85, -0.45, 0, 0.85, 0.45, 0.5, '#8e887a', { line: '#5c574d' });
    d.box(-0.55, -0.15, 0.5, 0.55, 0.15, 2.4, '#a19a8a', { line: '#5c574d' }); d.disc(0, -0.15, 2.45, 0.32, '#a19a8a', '#5c574d');
    d.text('榕', -0.18, -0.16, 1.75, 13, '#8e2a20'); d.text('桥', -0.18, -0.16, 1.25, 13, '#8e2a20'); d.text('古桥', -0.4, -0.16, 0.7, 7, '#4a443a', { weight: 'normal' });
  } });
  A.define('rq_x_lantern', { name: '园林灯', geo: [-0.2, -0.2, 0, 0.2, 0.2, 2.4], fp: [[-0.12, -0.12, 0.12, 0.12]], draw(d) {
    d.box(-0.06, -0.06, 0, 0.06, 0.06, 1.9, '#3a3d3f'); d.box(-0.18, -0.18, 1.9, 0.18, 0.18, 2.3, '#f3e2b0', { line: '#5a4a2a' }); d.box(-0.22, -0.22, 2.3, 0.22, 0.22, 2.38, '#3a3d3f');
  }, emit(d) { d.box(-0.16, -0.16, 1.92, 0.16, 0.16, 2.28, '#ffd98a', { line: false }); } });
})(typeof window !== 'undefined' ? window : globalThis);
