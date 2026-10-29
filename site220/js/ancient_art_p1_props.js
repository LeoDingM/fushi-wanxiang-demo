/* 影视城古镇 art preview — props (Site200 灯笼光晕；Site201 漕船/码头船灯渔火): 牌坊, 石狮 (雄/雌), 水井, 独轮推车, 轿子, 马车, 摊位 (果/玩具/面), 灯笼串, 宫灯路灯, 柳树, 槐树, 漕船, 码头, 招幌, 桌凳, 花坛. 未经Leo确认. */
(function (root) {
  'use strict';
  const { A, shade, C, H } = root.AncientCore;
  const X = root.AncientParts, M = root.AncientMisc;
  const { RED, RED_W, WOOD, WOOD_D, STONE, STONE_W, GOLD } = C;
  /** circle / ellipse lying in a vertical S-facing plane (y = const): wheels, drum faces */
  function ringS(d, cx, y, cz, r, fill, line, rz) { const pts = []; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; pts.push([cx + Math.cos(a) * r, y, cz + Math.sin(a) * (rz || r)]); } d.face(pts, fill, line); }
  function wheel(d, cx, y, cz, r, o = {}) {
    const col = o.col || '#6a4a2c';
    ringS(d, cx, y, cz, r, shade(col, 0.6), '#2a1a0a'); ringS(d, cx, y - 0.03, cz, r * 0.86, null, shade(col, 1.15));
    for (let k = 0; k < (o.spokes || 10); k++) { const a = k / (o.spokes || 10) * Math.PI * 2; d.seg([cx, y - 0.03, cz], [cx + Math.cos(a) * r * 0.86, y - 0.03, cz + Math.sin(a) * r * 0.86], shade(col, 1.1)); }
    ringS(d, cx, y - 0.04, cz, r * 0.16, shade(col, 0.8), '#2a1a0a');
  }
  /** profile shape in an S-facing plane from (x,z) points */
  const prof = (d, y, pts, fill, line) => d.face(pts.map(([x, z]) => [x, y, z]), fill, line);
  function ellS(d, cx, y, cz, rx, rz, fill, line) { ringS(d, cx, y, cz, rx, fill, line, rz); }

  // ---------------- 牌坊 东京梦华: 3 bays 4 pillars 12 m, three hipped roofs, 彩画 beams, 夹杆石 ----------------
  A.define('aq_paifang', {
    shadowOf: () => [[[-0.5, -0.9], [13.3, -0.9], [14.2, 7.8], [0.4, 7.8]]],
    name: '牌坊(东京梦华)', geo: [-0.8, -1.2, 0, 13.6, 1.6, 10.6], fp: [[-0.4, -0.5, 0.4, 0.5], [3.6, -0.5, 4.4, 0.5], [8.4, -0.5, 9.2, 0.5], [12.4, -0.5, 13.2, 0.5]], prune: true,
    draw(d) {
      const h = H(d), xs = [0, 4, 8.8, 12.8], y = 0;
      for (const x of xs) { d.box(x - 0.45, y - 0.45, 0, x + 0.45, y + 0.45, 1.2, STONE, { line: shade(STONE, 0.5), west: STONE_W }); d.box(x - 0.3, y - 0.3, 1.2, x + 0.3, y + 0.3, 1.45, STONE, { line: shade(STONE, 0.5) }); for (const s of [-1, 1]) d.box(x - 0.12, y + s * 0.45 - 0.12, 0, x + 0.12, y + s * 0.95, 1.0, STONE_W, { line: shade(STONE, 0.45) }); }
      for (const [i, x] of xs.entries()) h.column(x, y, 1.2, i === 1 || i === 2 ? 7.4 : 6.0, 0.2, RED);
      X.efang(d, -0.06, 4, 8.8, 6.2, 6.7, {}); X.efang(d, -0.06, 4, 8.8, 5.0, 5.35, {});
      X.efang(d, -0.06, 0, 4, 4.95, 5.35, {}); X.efang(d, -0.06, 8.8, 12.8, 4.95, 5.35, {});
      X.plaque(d, -0.12, 6.4, 5.7, '東京夢華', { size: 18, w: 3.8, bg: '#1f2f4a' });
      for (const [a, b] of [[0, 4], [8.8, 12.8]]) h.QS(-0.1, a + 0.4, 4.0, b - 0.4, 4.9, '#2f5a86', GOLD);
      X.dougong(d, -0.25, [5.0, 6.4, 7.8], 6.7, { size: 0.55 }); X.dougong(d, -0.25, [1.2, 2.8, 10.0, 11.6], 5.35, { size: 0.5 });
      X.roof(d, { x0: -0.7, x1: 4.7, y0: -0.9, y1: 0.9, z: 6.0, rise: 0.75, type: 'wudian', lift: 0.32, ridgeH: 0.22, beasts: 0 });
      X.roof(d, { x0: 8.1, x1: 13.5, y0: -0.9, y1: 0.9, z: 6.0, rise: 0.75, type: 'wudian', lift: 0.32, ridgeH: 0.22, beasts: 0 });
      X.roof(d, { x0: 3.0, x1: 9.8, y0: -1.0, y1: 1.0, z: 7.55, rise: 0.9, type: 'wudian', lift: 0.38, ridgeH: 0.26, beasts: 0 });
    },
  });
  // ---------------- 石狮 stone lions on pedestals (male with ball, female with cub) ----------------
  A.define('aq_lion', {
    name: '石狮', variants: ['m', 'f'], geo: [-0.7, -0.8, 0, 0.9, 0.8, 2.7], fp: [[-0.6, -0.5, 0.6, 0.5]], prune: true,
    draw(d, st, v) {
      const h = H(d), S = '#b9b3a6', D = shade(S, 0.7), L = shade(S, 1.18), O = '#5a554c', g = d.g;
      d.box(-0.6, -0.5, 0, 0.6, 0.5, 0.25, S, { line: O, west: D }); d.box(-0.5, -0.42, 0.25, 0.5, 0.42, 0.9, S, { line: O, west: D }); d.box(-0.58, -0.48, 0.9, 0.58, 0.48, 1.05, S, { line: O, west: D });
      h.QS(-0.43, -0.4, 0.35, 0.4, 0.8, null, D); ellS(d, 0, -0.44, 0.58, 0.18, 0.14, null, D);
      // lion: haunch (back), chest, front legs, head with curled mane, open mouth
      const b = (x, y, z, rx, ry, c) => { const p = h.P(x, y, z); g.beginPath(); g.ellipse(p[0], p[1], rx, ry, 0, 0, Math.PI * 2); g.fillStyle = c; g.fill(); g.strokeStyle = O; g.lineWidth = 1; g.stroke(); };
      b(0.05, 0.2, 1.35, 15, 12, D); b(-0.05, -0.05, 1.45, 13, 15, S);
      for (const x of [-0.2, 0.15]) { h.QS(-0.25, x - 0.08, 1.05, x + 0.08, 1.55, x < 0 ? S : D, O); b(x, -0.3, 1.08, 4, 3, L); }
      if (v === 'm') { b(0.32, -0.32, 1.17, 6, 6, '#a8a294'); for (let k = 0; k < 6; k++) d.px(0.32 + Math.cos(k) * 0.08, -0.33, 1.17 + Math.sin(k) * 0.08, O); }
      else { b(-0.36, -0.3, 1.18, 6, 5, S); b(-0.4, -0.34, 1.3, 4, 4, L); }
      b(-0.05, -0.05, 1.95, 15, 14, D);
      for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, p = h.P(-0.05, -0.1, 1.95); g.beginPath(); g.arc(p[0] + Math.cos(a) * 12, p[1] + Math.sin(a) * 11, 3, 0, Math.PI * 2); g.fillStyle = k % 2 ? S : D; g.fill(); g.strokeStyle = O; g.stroke(); }
      b(-0.08, -0.2, 1.95, 9, 9, S);
      const f = h.P(-0.08, -0.25, 1.95); g.fillStyle = O; g.fillRect(Math.round(f[0] - 5), Math.round(f[1] - 3), 3, 2); g.fillRect(Math.round(f[0] + 2), Math.round(f[1] - 3), 3, 2); g.fillStyle = '#6a3a30'; g.fillRect(Math.round(f[0] - 3), Math.round(f[1] + 3), 6, 3); g.fillStyle = L; g.fillRect(Math.round(f[0] - 1), Math.round(f[1] - 1), 2, 3);
      g.fillStyle = L; g.fillRect(Math.round(f[0] - 6), Math.round(f[1] - 7), 4, 2);
      d.box(-0.12, -0.32, 1.55, 0.08, -0.22, 1.62, '#c8322c', { line: '#5a1410' });   // red ribbon/bell collar
    },
  });
  // ---------------- 水井: stone well curb + 辘轳 windlass + bucket ----------------
  A.define('aq_well', {
    name: '水井(辘轳)', geo: [-1.2, -1.0, 0, 1.2, 1.2, 2.6], fp: [[-0.75, -0.75, 0.75, 0.75]], prune: true,
    draw(d) {
      const h = H(d), S = '#a8a296';
      d.flat(-1.0, -1.0, 1.0, 1.0, 0.02, '#9e988c', '#6a645a');
      for (const [x, y] of [[-0.1, 0.9], [0.9, -0.1]]) d.box(x - 0.08, y - 0.08, 0, x + 0.08, y + 0.08, 1.9, WOOD, { line: WOOD_D });
      const ring = (z, r, fill, line) => { const pts = []; for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2; pts.push([Math.cos(a) * r, Math.sin(a) * r, z]); } d.face(pts, fill, line); };
      for (let i = 0; i < 8; i++) { const a0 = (i + 0.5) / 8 * Math.PI * 2, a1 = (i + 1.5) / 8 * Math.PI * 2, r = 0.68; const p0 = [Math.cos(a0) * r, Math.sin(a0) * r], p1 = [Math.cos(a1) * r, Math.sin(a1) * r]; if ((p0[1] + p1[1]) / 2 + (p0[0] + p1[0]) / 2 > 0.1) continue; d.face([[p0[0], p0[1], 0], [p1[0], p1[1], 0], [p1[0], p1[1], 0.7], [p0[0], p0[1], 0.7]], i % 2 ? S : shade(S, 0.85), '#5a554c'); }
      ring(0.7, 0.68, shade(S, 1.12), '#5a554c'); ring(0.71, 0.4, '#1e2a30', '#3a3a34'); ring(0.705, 0.32, '#2c4048', null);
      for (const [x, y] of [[-0.9, 0.0], [0.0, -0.9]]) d.box(x - 0.08, y - 0.08, 0, x + 0.08, y + 0.08, 1.9, WOOD, { line: WOOD_D });
      h.line([-0.9, 0.0, 1.75], [-0.1, 0.9, 1.75], WOOD_D, 3); h.line([0.0, -0.9, 1.75], [0.9, -0.1, 1.75], WOOD_D, 3);
      d.box(-0.75, -0.75, 1.62, 0.75, 0.75, 1.62, WOOD);
      const c = h.P(-0.45, -0.45, 1.75); d.g.fillStyle = '#7a5a3a'; d.g.fillRect(Math.round(c[0] - 4), Math.round(c[1] - 16), 30, 9); d.g.strokeStyle = '#2a1a0a'; d.g.strokeRect(Math.round(c[0] - 4) + 0.5, Math.round(c[1] - 16) + 0.5, 29, 8);
      for (let k = 0; k < 6; k++) d.g.fillRect(Math.round(c[0] - 2 + k * 5), Math.round(c[1] - 16), 1, 9);
      h.line([0.0, -0.05, 1.6], [0.0, -0.05, 0.95], '#c8b080'); d.box(-0.14, -0.2, 0.75, 0.14, 0.08, 0.98, '#6a4a2a', { line: '#2a1a0a', top: '#3a5a6a' });
      h.line([0.55, -0.6, 1.55], [0.7, -0.75, 1.3], '#5a3a20', 3);
      d.box(0.7, -0.95, 0, 1.05, -0.6, 0.35, '#7a5a3a', { line: '#2a1a0a', top: '#3a6a7a' });
    },
  });
  // ---------------- 独轮推车 wheelbarrow with grain sacks ----------------
  A.define('aq_cart', {
    name: '独轮推车', geo: [-1.4, -0.6, 0, 1.6, 0.7, 1.4], fp: [[-1.2, -0.4, 1.3, 0.4]], prune: true,
    draw(d) {
      const h = H(d);
      h.line([-1.3, 0.3, 0.75], [1.2, 0.3, 0.55], WOOD_D, 3);
      wheel(d, 0.35, 0.0, 0.42, 0.42, { spokes: 8 });
      h.line([-1.3, -0.3, 0.75], [1.2, -0.3, 0.55], WOOD_D, 3); h.line([-1.3, -0.32, 0.75], [1.2, -0.32, 0.55], shade(WOOD, 1.2), 1);
      for (const x of [-0.9, 1.0]) h.line([x, -0.3, 0.68], [x, -0.3, 0.0], WOOD_D, 2);
      d.box(-0.2, -0.32, 0.88, 0.9, 0.32, 0.92, WOOD, { line: WOOD_D });
      for (const [x, y, z, c] of [[-0.75, -0.25, 0.7, '#c8b27a'], [-0.75, 0.1, 0.7, '#b8a26a'], [0.9, -0.25, 0.6, '#c8b27a'], [-0.7, -0.1, 1.05, '#d4c08a']]) { d.box(x - 0.01, y, z, x + 0.55, y + 0.32, z + 0.32, c, { line: shade(c, 0.5), top: shade(c, 1.1) }); h.line([x + 0.27, y, z], [x + 0.27, y, z + 0.32], shade(c, 0.7)); d.px(x + 0.25, y, z + 0.34, '#6a5a3a', 3, 1); }
    },
  });
  // ---------------- 轿子 four-bearer sedan chair (red, with canopy and front curtain) ----------------
  A.define('aq_sedan', {
    name: '轿子', geo: [-2.6, -0.8, 0, 2.6, 0.8, 2.3], fp: [[-0.5, -0.5, 0.5, 0.5]], prune: true,
    draw(d) {
      const h = H(d), R1 = '#b0302a';
      h.line([-2.5, 0.42, 0.95], [2.5, 0.42, 0.95], '#3a2214', 3);
      for (const [x, y] of [[-0.45, 0.45], [0.45, 0.45], [-0.45, -0.45], [0.45, -0.45]]) h.line([x, y, 0], [x, y, 0.3], '#3a2214', 2);
      d.box(-0.5, -0.5, 0.3, 0.5, 0.5, 1.9, R1, { line: '#4a140c', west: shade(R1, 0.78), top: '#8a2a1e' });
      h.QS(-0.51, -0.38, 0.4, 0.38, 1.7, '#d8a040', '#6a4a10'); h.QS(-0.52, -0.3, 0.45, 0.3, 1.6, '#c8322c'); for (let z = 0.6; z < 1.6; z += 0.25) h.line([-0.3, -0.53, z], [0.3, -0.53, z], '#e8c050');
      h.QW(-0.51, -0.3, 0.9, 0.3, 1.5, '#e8d8a8', '#6a4a10'); for (let y = -0.25; y < 0.3; y += 0.1) h.line([-0.52, y, 0.92], [-0.52, y, 1.48], '#a0342a');
      d.box(-0.62, -0.62, 1.9, 0.62, 0.62, 2.0, '#2f5a86', { line: '#1a2a4a', top: '#3a6a96' });
      d.face([[-0.62, -0.62, 2.0], [0.62, -0.62, 2.0], [0, 0, 2.25]], '#c8322c', '#5a1410'); d.face([[-0.62, -0.62, 2.0], [-0.62, 0.62, 2.0], [0, 0, 2.25]], '#9a2620', '#5a1410');
      h.blob(0, 0, 2.3, 3, 3, GOLD, '#6a4a10');
      for (const x of [-0.6, 0.6]) h.line([x, -0.63, 1.98], [x, -0.63, 1.8], GOLD, 2);
      h.line([-2.5, -0.42, 0.95], [2.5, -0.42, 0.95], '#5a3420', 3); h.line([-2.5, -0.44, 0.97], [2.5, -0.44, 0.97], '#8a5a34');
    },
  });
  // ---------------- 马车 horse + two-wheel covered cart ----------------
  A.define('aq_horsecart', {
    name: '马车', geo: [-2.8, -0.9, 0, 3.6, 1.0, 2.7], fp: [[-2.6, -0.7, 3.4, 0.7]], prune: true,
    draw(d) {
      const h = H(d), hc = '#7a4e30', hd = shade(hc, 0.72), hl = shade(hc, 1.18);
      // far-side wheel + far legs
      wheel(d, -1.2, 0.62, 0.62, 0.62, { col: '#5a3e24' });
      const leg = (x0, y, top, kx, col) => { prof(d, y, [[x0 - 0.07, top], [x0 + 0.07, top], [x0 + 0.06 + kx, 0.45], [x0 + 0.05, 0.08], [x0 - 0.05, 0.08], [x0 - 0.06 + kx, 0.45]], col, '#2a1a10'); prof(d, y, [[x0 - 0.07, 0], [x0 + 0.09, 0], [x0 + 0.06, 0.1], [x0 - 0.06, 0.1]], '#2a2420', null); };
      leg(1.0, 0.18, 1.0, 0.02, hd); leg(2.35, 0.18, 1.0, 0.03, hd);
      // cart body: box + arched canvas hood
      h.line([-2.6, 0.55, 0.8], [1.2, 0.55, 1.05], '#3a2214', 3);
      d.box(-2.5, -0.55, 0.65, -0.1, 0.55, 1.0, '#6a4a2c', { line: '#2a1a0a', top: '#8a6a44' });
      const hood = []; for (let i = 0; i <= 10; i++) { const a = Math.PI * i / 10; hood.push([-2.4, -0.6 + 0.6 - Math.cos(a) * 0.6, 1.0 + Math.sin(a) * 0.7]); }
      d.face([[-2.4, -0.6, 1.0], [-0.2, -0.6, 1.0], [-0.2, -0.6, 1.62], [-2.4, -0.6, 1.62]], '#3a5a7a', '#1a2a3a');
      d.face([[-2.4, -0.6, 1.62], [-0.2, -0.6, 1.62], [-0.2, 0.6, 1.62], [-2.4, 0.6, 1.62]], '#4a6a8a', '#1a2a3a');
      d.face(hood, '#2e4a66', '#1a2a3a');
      for (let x = -2.2; x < -0.2; x += 0.4) h.line([x, -0.61, 1.0], [x, -0.61, 1.62], '#2a4058');
      h.QS(-0.62, -1.6, 1.08, -0.9, 1.5, '#c8b890', '#5a4a30');
      h.line([-0.1, -0.5, 0.95], [1.3, -0.5, 1.15], '#3a2214', 3);
      // horse body, neck, head, near legs, tail, harness
      leg(1.0, -0.15, 1.0, -0.04, hc); leg(2.35, -0.15, 1.0, -0.03, hc);
      ellS(d, 1.65, 0.0, 1.22, 0.85, 0.36, hc, '#2a1a10');
      prof(d, -0.01, [[2.2, 1.35], [2.5, 1.95], [2.75, 2.12], [2.95, 2.0], [2.6, 1.5], [2.45, 1.12]], hc, '#2a1a10');
      prof(d, -0.02, [[2.62, 2.18], [2.9, 2.25], [3.35, 1.78], [3.3, 1.65], [3.1, 1.66], [2.85, 1.88]], hc, '#2a1a10');
      prof(d, -0.03, [[2.25, 1.55], [2.5, 2.05], [2.7, 2.2], [2.62, 2.0], [2.4, 1.5]], '#2a1a14', null);   // mane
      prof(d, -0.03, [[2.7, 2.22], [2.76, 2.38], [2.82, 2.22]], hd, '#2a1a10');
      d.px(2.95, -0.04, 2.02, '#101010', 2, 2);
      prof(d, -0.03, [[0.8, 1.35], [0.62, 1.2], [0.55, 0.75], [0.7, 0.8], [0.78, 1.15]], '#2a1a14', null);   // tail
      ellS(d, 1.25, -0.04, 1.3, 0.3, 0.22, hl, null); ellS(d, 2.05, -0.04, 1.3, 0.25, 0.2, hl, null);
      h.line([2.3, -0.36, 1.45], [2.3, -0.36, 1.0], '#5a1a10', 3); h.line([1.3, -0.37, 1.58], [1.3, -0.37, 0.9], '#5a1a10', 2); h.line([3.1, -0.06, 1.85], [1.3, -0.6, 1.15], '#3a2214');
      leg(1.15, -0.32, 1.0, 0.0, hl); leg(2.5, -0.32, 1.0, 0.0, hl);
      h.blob(2.5, -0.36, 1.48, 4, 4, '#c8322c', '#5a1410');
      // near wheel
      wheel(d, -1.2, -0.62, 0.62, 0.62, { col: '#6a4a2c' });
    },
  });
  // ---------------- 摊位：贴图模块拼装（木板桌+条纹篷/伞+货筐），井槐里摊位 atlas 精细度 ----------------
  A.define('aq_stall', {
    name: '摊位', variants: ['fruit', 'toys', 'noodle'], geo: [-1.4, -1.6, 0, 1.6, 1.4, 3.2], fp: [[-1.1, -0.6, 1.1, 0.6]], prune: true,
    draw(d, st, v) {
      const h = H(d);
      const legs = (x0, x1, y0, y1, zt) => {
        for (const [x, y] of [[x0 + 0.08, y1 - 0.08], [x1 - 0.08, y1 - 0.08], [x0 + 0.08, y0 + 0.08], [x1 - 0.08, y0 + 0.08]]) {
          d.box(x - 0.04, y - 0.04, 0, x + 0.04, y + 0.04, zt - 0.06, WOOD_D, { line: '#2a1a0a' });
        }
        X.woodPlanks(d, x0, y0, zt - 0.1, x1, y1, zt, { step: 0.18 });
      };
      if (v === 'fruit') {
        for (const [x, y] of [[-1.15, 0.65], [1.15, 0.65], [-1.15, -0.65], [1.15, -0.65]]) {
          d.box(x - 0.06, y - 0.06, 0, x + 0.06, y + 0.06, 2.35, WOOD_D, { line: '#2a1a0a', west: '#3a2214' });
          d.box(x - 0.08, y - 0.08, 2.32, x + 0.08, y + 0.08, 2.42, GOLD, { line: '#6a4a10' });
        }
        legs(-1.05, 1.05, -0.55, 0.55, 0.82);
        const pals = [['#d8402a', '#c83020', '#e85a3a'], ['#e8b030', '#d89a20', '#f0c850'], ['#6a9a3a', '#5a8a2a', '#8ab84a'], ['#8a3a7a', '#6a2a5a', '#b0509a']];
        for (let i = 0; i < 4; i++) {
          const x0 = -0.98 + i * 0.5;
          X.crateMod(d, x0, -0.48, 0.82, x0 + 0.46, 0.48, ['#3c8f4e', '#3a6fb0', '#c94a3a', '#d9a92e'][i], 0.2);
          d.heap(x0 + 0.04, -0.44, x0 + 0.42, 0.44, 0.98, pals[i], 0.95, { size: 3, step: 0.08, mound: 0.18 });
          d.tag(x0 + 0.12, -0.5, 0.9);
        }
        X.awningStripe(d, [[-1.25, -0.95, 2.05], [1.25, -0.95, 2.05], [1.25, 0.75, 2.48], [-1.25, 0.75, 2.48]],
          ['#b8342a', '#e8dcc0', '#b8342a', '#e8dcc0', '#b8342a', '#e8dcc0', '#b8342a', '#e8dcc0', '#b8342a'], { valance: true });
        X.woodPlanks(d, -1.35, 0.55, 0, -0.95, 0.95, 0.45, { col: '#a08050', step: 0.16 });
        X.banner(d, 1.2, 0.7, 2.55, '果', { col: '#2f6a58', tc: '#f0efd8', len: 0.7, w: 0.4, size: 12, pole: false, border: GOLD });
      } else if (v === 'toys') {
        legs(-0.95, 0.95, -0.48, 0.48, 0.78);
        for (let k = 0; k < 6; k++) {
          const x = -0.8 + k * 0.3, cols = ['#c8322c', '#e8c050', '#3a6aa8', '#e8e0d0', '#3a8a5a', '#d860a0'];
          X.crateMod(d, x - 0.12, -0.4, 0.78, x + 0.12, -0.15, cols[k], 0.16);
          h.blob(x, -0.38, 0.98, 3, 3, '#f0e0c8', '#5a4a3a');
        }
        h.line([0.55, 0.15, 0.78], [0.55, 0.15, 2.15], WOOD_D, 3);
        h.blob(0.55, 0.15, 1.85, 10, 15, '#c8b070', '#7a6a3a');
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * Math.PI * 2, x = 0.55 + Math.cos(a) * 0.22, zz = 1.85 + Math.sin(a) * 0.34;
          h.line([0.55, 0.15, 1.85], [x, 0.0, zz + 0.12], '#8a6a3a');
          for (let j = 0; j < 3; j++) h.blob(x + (x - 0.55) * j * 0.18, -0.02, zz + 0.12 + j * 0.05, 2, 2, '#c8201a', '#6a0a08');
        }
        for (const [x, z, c] of [[-0.55, 1.55, '#e85a8a'], [-0.25, 1.75, '#5ab0e8']]) {
          h.line([x, 0.0, 0.78], [x, 0.0, z], '#6a4a2a', 2);
          for (let k = 0; k < 4; k++) d.face([[x, -0.01, z], [x + Math.cos(k * 1.57) * 0.14, -0.01, z + Math.sin(k * 1.57) * 0.14], [x + Math.cos(k * 1.57 + 0.8) * 0.14, -0.01, z + Math.sin(k * 1.57 + 0.8) * 0.14]], k % 2 ? c : '#f0e8d0', shade(c, 0.5));
        }
        d.box(-1.0, 0.25, 0, -0.9, 0.35, 2.55, WOOD_D, { line: '#2a1a0a' });
        const um = []; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; um.push([-0.95 + Math.cos(a) * 1.2, 0.3 + Math.sin(a) * 1.15, 2.2]); }
        for (let i = 0; i < 18; i++) {
          const c0 = i % 2 ? '#b8342a' : '#d8b050';
          d.face([[-0.95, 0.3, 2.58], um[i], um[(i + 1) % 18]], c0, shade(c0, 0.5));
        }
        for (const p of um) h.line([-0.95, 0.3, 2.58], p, '#6a3a1a');
        d.box(-1.02, 0.28, 2.55, -0.88, 0.32, 2.62, GOLD, { line: '#6a4a10' });
      } else {
        X.woodPlanks(d, -1.05, 0.0, 0, -0.15, 0.72, 0.88, { col: '#8a5a3a', step: 0.16 });
        h.QS(-0.01, -0.9, 0.22, -0.3, 0.52, '#1a1a1a'); h.QS(-0.02, -0.8, 0.28, -0.4, 0.42, '#e86020');
        d.disc(-0.6, 0.36, 0.9, 0.28, '#5a5a5a', '#2a2a2a'); d.disc(-0.6, 0.36, 0.92, 0.22, '#d8d0b8', null);
        for (let k = 0; k < 4; k++) h.pline([[-0.72 + k * 0.08, 0.36, 1.02], [-0.66 + k * 0.08, 0.36, 1.35], [-0.74 + k * 0.08, 0.36, 1.7], [-0.68 + k * 0.08, 0.36, 2.0]], 'rgba(240,240,240,0.85)', 2);
        legs(0.0, 1.25, -0.12, 0.72, 0.82);
        for (let k = 0; k < 4; k++) { const x = 0.18 + k * 0.28; d.disc(x, 0.22, 0.84, 0.09, '#e8e8e0', '#5a6a8a'); d.disc(x, 0.22, 0.86, 0.06, '#c8a050', null); }
        h.line([0.22, 0.52, 0.84], [0.28, 0.42, 1.08], '#6a4a2a'); h.line([0.28, 0.52, 0.84], [0.34, 0.42, 1.08], '#6a4a2a');
        for (const y of [-0.62, 1.05]) {
          X.woodPlanks(d, -0.05, y, 0.38, 1.35, y + 0.28, 0.48, { step: 0.2, edge: false });
          for (const x of [0.05, 1.25]) d.box(x - 0.04, y + 0.1, 0, x + 0.04, y + 0.18, 0.38, WOOD_D, { line: '#2a1a0a' });
        }
        d.box(1.2, 0.6, 0, 1.3, 0.7, 2.45, WOOD_D, { line: '#2a1a0a' });
        X.banner(d, 1.25, 0.62, 2.4, '麵', { col: '#e8dcc0', tc: '#a01e18', len: 0.95, w: 0.48, size: 14, pole: false, border: GOLD });
      }
    },
    emit(d, st, v) { if (v === 'noodle') { H(d).QS(-0.03, -0.85, 0.24, -0.35, 0.5, '#ff9040'); return; } return false; },
  });
  // ---------------- 灯笼串：石座柱头贴图 + 灯笼模块串 ----------------
  A.define('aq_lanterns', {
    shadowOf: () => [[[-0.2, -0.2], [0.2, -0.2], [0.7, 4.4], [0.3, 4.4]], [[7.8, -0.2], [8.2, -0.2], [8.7, 4.4], [8.3, 4.4]]],
    name: '灯笼串', geo: [-0.3, -0.3, 0, 8.3, 0.3, 4.8], fp: [[-0.15, -0.15, 0.15, 0.15], [7.85, -0.15, 8.15, 0.15]], prune: true,
    draw(d) {
      const h = H(d), sag = (x) => 4.2 - 0.6 * Math.sin(Math.PI * x / 8);
      for (const x of [0, 8]) {
        X.stoneCoursing(d, x - 0.18, -0.18, 0, x + 0.18, 0.18, 0.35, { top: shade(STONE, 0.95) });
        h.column(x, 0, 0.35, 4.4, 0.09, RED_W);
        d.box(x - 0.14, -0.14, 4.38, x + 0.14, 0.14, 4.55, GOLD, { line: '#6a4a10', top: '#e8c868' });
        d.box(x - 0.08, -0.08, 4.55, x + 0.08, 0.08, 4.62, '#c8322c', { line: '#5a1410' });
      }
      const pts = []; for (let x = 0; x <= 8; x += 0.2) pts.push([x, 0, sag(x)]); h.pline(pts, '#2a1a12', 2);
      const texts = [null, '喜', null, null, '福', null, null, '安'];
      for (let x = 1; x < 8; x += 1) X.lantern(d, x, 0, sag(x), { r: 0.22, cord: 0.1, text: texts[x] || null, col: x % 2 ? '#d0302a' : '#c82820' });
    },
    emit(d) { const sag = (x) => 4.2 - 0.6 * Math.sin(Math.PI * x / 8); for (let x = 1; x < 8; x += 1) X.lanternGlow(d, x, 0, sag(x), { r: 0.22, cord: 0.1, boost: 1.4, col: '#ffc878' }); },
  });
  // ---------------- 宫灯路灯：石座+木柱贴图+六角宫灯模块 ----------------
  A.define('aq_lamppost', {
    shadowOf: () => [[[-0.22, -0.22], [0.22, -0.22], [0.6, 3.7], [0.2, 3.7]]],
    name: '宫灯路灯', geo: [-0.5, -0.9, 0, 0.5, 0.5, 4.2], fp: [[-0.2, -0.2, 0.2, 0.2]], prune: true,
    draw(d) {
      const h = H(d);
      X.stoneCoursing(d, -0.24, -0.24, 0, 0.24, 0.24, 0.42, { top: shade(STONE, 1.05) });
      d.box(-0.1, -0.1, 0.42, 0.1, 0.1, 3.55, '#5a2a1c', { line: '#2a0e08', west: '#4a2014' });
      for (let z = 0.6; z < 3.4; z += 0.35) h.line([-0.11, -0.11, z], [0.11, -0.11, z], shade('#5a2a1c', 1.15));
      d.box(-0.14, -0.85, 3.4, 0.06, 0.12, 3.55, '#5a2a1c', { line: '#2a0e08' });
      h.pline([[0, -0.08, 3.25], [-0.04, -0.4, 3.4], [-0.04, -0.72, 3.46]], '#5a2a1c', 3);
      lantern6(d, -0.04, -0.72, 3.42);
    },
    emit(d) {
      /* Site200：宫灯路灯暖色多层光晕 */
      const h = H(d), c = h.P(-0.04, -0.72, 2.95), g = d.g;
      g.save(); g.globalCompositeOperation = 'lighter';
      g.beginPath(); g.ellipse(c[0], c[1], 28, 24, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(255,150,60,0.28)'; g.fill();
      g.beginPath(); g.ellipse(c[0], c[1], 18, 16, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(255,200,120,0.55)'; g.fill();
      g.fillStyle = '#ffd890'; g.fillRect(Math.round(c[0] - 8), Math.round(c[1] - 11), 16, 20);
      g.fillStyle = '#fff6d0'; g.fillRect(Math.round(c[0] - 4), Math.round(c[1] - 7), 8, 12);
      g.fillStyle = '#ffffff'; g.fillRect(Math.round(c[0] - 2), Math.round(c[1] - 4), 4, 7);
      const gnd = h.P(-0.04, -0.55, 0.02);
      g.beginPath(); g.ellipse(gnd[0], gnd[1], 26, 11, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(255,160,70,0.3)'; g.fill();
      g.restore();
    },
  });
  function lantern6(d, x, y, z) {
    const h = H(d), c = h.P(x, y, z - 0.48), g = d.g;
    g.fillStyle = '#c8a040'; g.fillRect(Math.round(c[0] - 10), Math.round(c[1] - 15), 20, 3); g.fillRect(Math.round(c[0] - 10), Math.round(c[1] + 10), 20, 3);
    g.fillStyle = '#e8d098'; g.fillRect(Math.round(c[0] - 9), Math.round(c[1] - 12), 18, 22);
    g.fillStyle = '#c8a868'; g.fillRect(Math.round(c[0] + 2), Math.round(c[1] - 12), 7, 22);
    g.fillStyle = '#5a2a1c'; for (const dx of [-9, -4, 1, 6, 9]) g.fillRect(Math.round(c[0] + dx), Math.round(c[1] - 12), 1, 22);
    g.fillStyle = '#e8c050'; g.fillRect(Math.round(c[0] - 6), Math.round(c[1] - 2), 12, 2);
    g.fillStyle = '#c8322c'; g.fillRect(Math.round(c[0] - 2), Math.round(c[1] + 13), 1, 7); g.fillRect(Math.round(c[0] + 2), Math.round(c[1] + 13), 1, 8);
    g.fillStyle = GOLD; g.fillRect(Math.round(c[0] - 11), Math.round(c[1] - 16), 3, 3); g.fillRect(Math.round(c[0] + 8), Math.round(c[1] - 16), 3, 3);
  }
  // ---------------- trees: 垂柳 weeping willow (2 sizes), 国槐 pagoda tree ----------------
  const ell = (cx, cy, rx, ry) => { const p = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; };
  A.define('aq_willow', {
    shadowOf: (st, v) => [ell(0.6, 4.2, v === 'a' ? 2.6 : 2.0, v === 'a' ? 2.4 : 1.9), [[-0.2, -0.2], [0.2, -0.2], [0.8, 4], [0.4, 4]]],
    name: '垂柳', variants: ['a', 'b'], geo: [-3.2, -3.2, 0, 3.2, 3.2, 8.2], fp: [[-0.3, -0.3, 0.3, 0.3]], prune: true,
    draw(d, st, v) {
      const h = H(d), R = d.R, ht = v === 'a' ? 7.2 : 5.6, r = v === 'a' ? 2.6 : 2.0, g = d.g;
      h.line([0, 0, 0], [0.15, 0, ht * 0.45], '#5a4434', 6); h.line([0.15, 0, ht * 0.45], [-0.6, 0, ht * 0.8], '#5a4434', 4); h.line([0.15, 0, ht * 0.45], [0.8, 0, ht * 0.85], '#5a4434', 4); h.line([0.15, 0, ht * 0.5], [0.1, 0.4, ht * 0.95], '#5a4434', 3);
      for (let i = 0; i < 26; i++) { const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * r * 0.8, c = h.P(Math.cos(a) * rr, Math.sin(a) * rr * 0.7, ht * 0.9 - rr * 0.3); g.fillStyle = i % 2 ? '#5f8e3c' : '#6f9e46'; g.beginPath(); g.ellipse(c[0], c[1], 12, 8, 0, 0, Math.PI * 2); g.fill(); }
      const tips = []; for (let i = 0; i < 150; i++) { const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * r; tips.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.7, ht * (0.82 + R() * 0.18) - rr * 0.35]); }
      tips.sort((p, q) => (q[0] + q[1]) - (p[0] + p[1]));
      for (const [x, y, z] of tips) {
        const len = 1.2 + R() * 2.6, lit = x - y > -0.4, c1 = lit ? '#8ab850' : '#5f8e3c', c2 = lit ? '#a8d068' : '#78a64a';
        const top = h.P(x, y, z); g.fillStyle = shade(c1, 0.8); g.beginPath(); g.ellipse(top[0], top[1], 6, 4, 0, 0, Math.PI * 2); g.fill();
        let px = top[0], py = top[1]; const sway = (R() - 0.3) * 0.25;
        for (let k = 0; k < len * 39; k += 2) { const t = k / (len * 39); px += sway; py += 2; g.fillStyle = k % 6 < 2 ? c2 : c1; g.fillRect(Math.round(px), Math.round(py), 1 + (t < 0.7 ? 1 : 0), 2); }
      }
    },
  });
  A.define('aq_huai', {
    shadowOf: () => [ell(0.7, 5.0, 3.1, 2.9), [[-0.3, -0.3], [0.3, -0.3], [0.9, 4.6], [0.4, 4.6]]],
    name: '国槐', geo: [-3.4, -3.4, 0, 3.4, 3.4, 8.6], fp: [[-0.35, -0.35, 0.35, 0.35]], prune: true,
    draw(d) { M.tree(d, 0, 0, 0, { r: 3.0, ht: 7.8, n: 320, leaf: 8, trunk: 9, col: '#6e9a44', col2: '#466e30', bark: '#4e3e30' }); d.box(-0.8, -0.8, 0, 0.8, 0.8, 0.35, STONE, { line: shade(STONE, 0.5), west: STONE_W, top: '#8a7a5a', noTop: false }); },
  });
  // ---------------- 漕船 canal cargo boat with 篷 cabin and mast; 码头 timber dock ----------------
  A.define('aq_boat', {
    name: '漕船(篷船)', geo: [-6.4, -1.8, -0.4, 6.6, 1.8, 6.4], fp: [[-6, -1.5, 6, 1.5]], prune: true, layer: 'sorted', shadow: false,
    draw(d) {
      const h = H(d), Hc = '#6a4a2c', Hl = '#8a6440', z0 = -0.3;
      const hull = (y, s) => { const pts = []; for (let i = 0; i <= 12; i++) { const x = -6 + i, t = Math.abs(x) / 6; pts.push([x, y * (1 - t ** 4 * 0.85), z0 + 0.95 + t ** 2 * 0.55]); } return pts; };
      const top = hull(1.5), bot = hull(-1.5);
      d.face([...top, ...bot.slice().reverse()], '#7a5a3a', '#2a1a0a');
      for (let x = -5; x < 6; x += 0.5) h.line([x, -1.4 * (1 - (Math.abs(x) / 6) ** 4 * 0.85), z0 + 0.95 + (x / 6) ** 2 * 0.55], [x, 1.4 * (1 - (Math.abs(x) / 6) ** 4 * 0.85), z0 + 0.95 + (x / 6) ** 2 * 0.55], '#6a4a2c');
      d.face([...bot, ...bot.slice().reverse().map(([x, y, z]) => [x, y + 0.3 * (1 - (x / 6) ** 2), z0 + 0.05 + (x / 6) ** 2 * 0.4])], Hc, '#2a1a0a');
      h.pline(bot, Hl, 2); h.pline(bot.map(([x, y, z]) => [x, y + 0.05, z - 0.35]), '#4a3020', 2);
      // 篷 arched mat cabin
      const ar = (x) => { const pts = []; for (let i = 0; i <= 10; i++) { const a = Math.PI * i / 10; pts.push([x, -Math.cos(a) * 1.25, z0 + 1.0 + Math.sin(a) * 1.3]); } return pts; };
      const A0 = ar(-2.5), A1 = ar(1.8);
      for (let i = 0; i < 10; i++) d.face([A0[i], A1[i], A1[i + 1], A0[i + 1]], i < 5 ? '#8a7448' : '#a08a58', '#4a3a20');
      d.face(A0, '#6a5838', '#3a2a14'); for (let k = 1; k < 4; k++) h.line([-2.5, -1.25 + k * 0.6, z0 + 1.0], [-2.5, -1.25 + k * 0.6, z0 + 2.0], '#4a3a20');
      for (let x = -2.2; x < 1.8; x += 0.5) h.pline(ar(x).slice(0, 6), '#5a4a28');
      // mast, yard, furled sail, rudder + oar, cargo
      h.line([3.0, 0, z0 + 1.2], [3.0, 0, z0 + 6.3], '#4a3020', 4); h.line([3.0, -0.02, z0 + 5.8], [3.0, -0.02, z0 + 2.6], '#c8b890', 6); h.line([2.4, 0, z0 + 6.0], [3.6, 0, z0 + 6.0], '#4a3020', 2);
      h.line([3.0, 0, z0 + 6.3], [-5.6, 0, z0 + 1.6], '#3a2a1a'); h.line([3.0, 0, z0 + 6.3], [5.8, 0, z0 + 1.6], '#3a2a1a');
      for (const [x, y] of [[3.8, -0.6], [4.5, -0.6], [3.9, 0.3]]) d.box(x, y, z0 + 1.2, x + 0.6, y + 0.6, z0 + 1.7, '#c8b27a', { line: '#6a5a3a' });
      h.line([-5.8, 0.2, z0 + 1.4], [-6.6, 0.4, z0 - 0.2], '#4a3020', 3); h.line([-4.8, -1.3, z0 + 1.2], [-3.4, -2.0, z0 + 0.0], '#5a3a20', 2);
      for (let k = 0; k < 3; k++) h.line([-5 + k * 4, -1.7, z0 + 0.02], [-4 + k * 4, -1.7, z0 + 0.02], '#9ac0c8');
      /* Site201：船灯/渔火（复用 lantern；黄昏 emit 见下） */
      X.lantern(d, -0.4, 1.15, z0 + 2.55, { r: 0.14, cord: 0.18, col: '#c8322c' });
      X.lantern(d, 3.05, -0.35, z0 + 5.55, { r: 0.12, cord: 0.22, col: '#d0302a' });
      X.lantern(d, -4.6, 0.25, z0 + 1.85, { r: 0.11, cord: 0.12, col: '#e07030' });
    },
    emit(d) {
      /* Site201：漕船船灯/渔火 — lanternGlow + 水面倒影 */
      const z0 = -0.3;
      X.lanternGlow(d, -0.4, 1.15, z0 + 2.55, { r: 0.14, cord: 0.18, boost: 1.55, col: '#ffc878', water: true, waterY: -1.35 });
      X.lanternGlow(d, 3.05, -0.35, z0 + 5.55, { r: 0.12, cord: 0.22, boost: 1.45, col: '#ffd890', water: true, waterY: -1.2 });
      X.lanternGlow(d, -4.6, 0.25, z0 + 1.85, { r: 0.13, cord: 0.12, boost: 1.75, col: '#ffb060', water: true, waterY: -1.4 });
    },
  });
  A.define('aq_dock', {
    name: '码头(木栈台)', geo: [-0.4, -4.4, -2.0, 10.4, 0.4, 2.0], fp: [[0, -4, 10, 0]], prune: true, shadowOf: () => [[[0, -4], [10, -4], [10.3, -1.0], [0.3, -1.0]]],
    draw(d) {
      const h = H(d), zt = 0.0;
      d.face([[-0.4, -4.4, -1.6], [10.4, -4.4, -1.6], [10.4, 0.0, -1.6], [-0.4, 0, -1.6]], '#4f7f8c', null);
      for (let x = 0.3; x < 10; x += 1.6) for (const y of [-3.85, -2.0]) { d.box(x - 0.13, y - 0.13, -1.8, x + 0.13, y + 0.13, zt - 0.05, '#5a3e24', { line: '#2a1a0a' }); h.line([x - 0.13, y - 0.14, -1.55], [x + 0.13, y - 0.14, -1.55], '#2a3a3a', 2); }
      h.line([0, -4.0, -0.35], [10, -4.0, -0.35], '#4a3020', 3);
      d.box(0, -4, zt - 0.18, 10, 0, zt, '#9a7a56', { line: '#4a3420', top: '#a8865e', west: '#7a5a3a' });
      for (let x = 0.25; x < 10; x += 0.25) h.line([x, -4, zt], [x, 0, zt], d.R() < 0.2 ? '#8a6a48' : '#94744e');
      for (const x of [1.5, 5.0, 8.5]) { d.box(x - 0.14, -3.95, zt, x + 0.14, -3.67, zt + 0.5, '#5a4a3a', { line: '#2a1a0a', top: '#7a6a5a' }); h.line([x, -3.95, zt + 0.35], [x + 0.6, -4.3, -1.2], '#c8b890'); }
      for (const [x, y, c] of [[3.0, -1.4, '#c8b27a'], [3.6, -1.4, '#b8a26a'], [3.3, -1.0, '#d4c08a'], [6.2, -1.2, '#7a5a3a'], [6.9, -1.2, '#6a4a2a']]) d.box(x, y, zt, x + 0.58, y + 0.5, zt + 0.42, c, { line: shade(c, 0.5), top: shade(c, 1.12) });
      d.box(6.2, -1.2, zt + 0.42, 6.8, -0.7, zt + 0.84, '#7a5a3a', { line: '#3a2a1a' });
      // stone steps down to the water at the W end
      for (let k = 0; k < 4; k++) d.box(-0.4 + 0, -4 + k * 0.0, -1.5 + k * 0.35 - 0.35, 0.0 + k * 0.0, 0, -1.5 + k * 0.35, STONE, { line: shade(STONE, 0.5), west: STONE_W, noTop: k < 3 });
      /* Site201：码头桩灯/河市灯笼（贴缆桩，黄昏 emit） */
      for (const x of [1.5, 5.0, 8.5]) {
        d.box(x - 0.06, -3.82, zt + 0.5, x + 0.06, -3.70, zt + 1.55, '#5a2a1c', { line: '#2a0e08' });
        X.lantern(d, x, -3.76, zt + 1.85, { r: 0.13, cord: 0.16, col: '#c8322c' });
      }
      X.lantern(d, 3.4, -0.55, zt + 1.55, { r: 0.11, cord: 0.14, col: '#d04028' });
    },
    emit(d) {
      /* Site201：码头灯 — lanternGlow + 向汴河水面倒影 */
      const zt = 0.0;
      for (const x of [1.5, 5.0, 8.5]) {
        X.lanternGlow(d, x, -3.76, zt + 1.85, { r: 0.13, cord: 0.16, boost: 1.6, col: '#ffc878', water: true, waterY: -4.35, waterZ: -0.2 });
      }
      X.lanternGlow(d, 3.4, -0.55, zt + 1.55, { r: 0.11, cord: 0.14, boost: 1.4, col: '#ffd090', ground: true });
    },
  });

  // ---------------- 招幌：石座+木杆贴图+布幌模块 ----------------
  A.define('aq_banner', {
    name: '招幌', variants: ['tea', 'wine', 'cloth', 'med', 'food'], geo: [-0.5, -0.8, 0, 0.6, 0.6, 4.2], fp: [[-0.15, -0.15, 0.15, 0.15]], prune: true,
    draw(d, st, v) {
      const h = H(d);
      const map = { tea: { t: '茶', col: '#2f6a58', tc: '#f0efd8' }, wine: { t: '酒', col: '#c8322c', tc: '#f6efd8' }, cloth: { t: '布', col: '#2f4f86', tc: '#f0efd8' }, med: { t: '藥', col: '#e8dcc0', tc: '#2a2a2a' }, food: { t: '食', col: '#b85a20', tc: '#f6efd8' } };
      const S = map[v] || map.tea;
      X.stoneCoursing(d, -0.2, -0.2, 0, 0.2, 0.2, 0.32, { top: shade(STONE, 1.05) });
      d.box(-0.08, -0.08, 0.32, 0.08, 0.08, 3.95, WOOD_D, { line: '#2a1a0a', west: '#3a2214' });
      for (let z = 0.6; z < 3.8; z += 0.4) h.line([-0.09, -0.09, z], [0.09, -0.09, z], shade(WOOD, 1.1));
      d.box(-0.12, -0.12, 3.9, 0.12, 0.12, 4.05, GOLD, { line: '#6a4a10', top: '#e8c868' });
      h.line([0, 0, 3.7], [0, -0.2, 3.7], WOOD_D, 2);
      X.banner(d, 0, -0.18, 3.65, S.t, { col: S.col, tc: S.tc, len: 1.45, w: 0.58, size: 17, pole: false, border: GOLD });
      X.lantern(d, 0.05, 0.15, 3.5, { r: 0.12, cord: 0.15, col: S.col === '#e8dcc0' ? '#c8322c' : S.col });
    },
  });
  // ---------------- 桌凳：木板桌面模块 + 四凳 + 茶/酒具 ----------------
  A.define('aq_table', {
    name: '桌凳', variants: ['tea', 'wine'], geo: [-1.2, -1.2, 0, 1.2, 1.2, 1.4], fp: [[-0.9, -0.9, 0.9, 0.9]], prune: true,
    draw(d, st, v) {
      const h = H(d);
      d.box(-0.08, -0.08, 0, 0.08, 0.08, 0.52, WOOD_D, { line: '#2a1a0a' });
      d.disc(0, 0, 0.52, 0.12, shade(WOOD, 0.85), WOOD_D);
      d.disc(0, 0, 0.62, 0.58, shade(WOOD, 1.12), WOOD_D);
      d.disc(0, 0, 0.64, 0.5, shade(WOOD, 1.28), null);
      for (let k = 0; k < 8; k++) {
        const a = k / 8 * Math.PI * 2;
        h.line([Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0.64], [Math.cos(a) * 0.48, Math.sin(a) * 0.48, 0.64], shade(WOOD, 0.75));
      }
      if (v === 'tea') {
        d.disc(-0.14, -0.08, 0.66, 0.08, '#e8e8e0', '#5a6a8a');
        d.disc(0.16, 0.1, 0.66, 0.07, '#e8e8e0', '#5a6a8a');
        d.disc(0.02, -0.18, 0.66, 0.06, '#e8e8e0', '#5a6a8a');
        X.woodPlanks(d, -0.12, 0.1, 0.64, 0.14, 0.32, 0.82, { col: '#c8a060', step: 0.1, edge: false });
        d.box(-0.02, 0.3, 0.72, 0.06, 0.38, 0.78, '#c8a060', { line: '#5a4a2a' });
        d.box(-0.04, 0.08, 0.82, 0.06, 0.18, 0.9, '#a08040', { line: '#5a4a2a' });
      } else {
        X.woodPlanks(d, -0.18, -0.12, 0.64, 0.08, 0.1, 0.95, { col: '#6a2a28', step: 0.08, edge: false });
        d.disc(0.2, 0.06, 0.66, 0.07, '#e8dcc0', '#5a4a2a');
        d.disc(-0.05, 0.22, 0.66, 0.055, '#e8dcc0', '#5a4a2a');
        d.box(0.12, -0.2, 0.64, 0.28, -0.05, 0.72, '#3a5a2a', { line: '#1a2a10' });
      }
      for (const [x, y] of [[-0.78, -0.58], [0.72, -0.52], [-0.72, 0.68], [0.68, 0.62]]) {
        for (const [dx, dy] of [[-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1], [0.1, 0.1]]) {
          d.box(x + dx * 0.5 - 0.03, y + dy * 0.5 - 0.03, 0, x + dx * 0.5 + 0.03, y + dy * 0.5 + 0.03, 0.34, WOOD_D, { line: '#2a1a0a' });
        }
        X.woodPlanks(d, x - 0.2, y - 0.2, 0.34, x + 0.2, y + 0.2, 0.42, { step: 0.12, edge: true });
      }
    },
  });
  // ---------------- 花坛：石砌贴图 + 泥土 + 花簇/灌木 ----------------
  A.define('aq_planter', {
    name: '花坛', variants: ['a', 'b', 'c'], geo: [-1.0, -0.8, 0, 1.0, 0.8, 1.6], fp: [[-0.85, -0.65, 0.85, 0.65]], prune: true,
    draw(d, st, v) {
      const h = H(d);
      X.stoneCoursing(d, -0.88, -0.68, 0, 0.88, 0.68, 0.38, { top: '#8a7a5a' });
      d.box(-0.75, -0.55, 0.38, 0.75, 0.55, 0.46, '#5a4a32', { line: '#2a1a10', top: '#3a2a18' });
      for (let i = 0; i < 12; i++) {
        const x = -0.65 + d.R() * 1.3, y = -0.45 + d.R() * 0.9;
        d.px(x, y, 0.47, shade('#3a2a18', 0.8 + d.R() * 0.4), 2, 1);
      }
      const pals = v === 'b' ? ['#c8322c', '#e85a3a', '#d8402a', '#f0a060'] : v === 'c' ? ['#e8b030', '#d89a20', '#f0c850', '#c8a040'] : ['#6a9a3a', '#5a8a2a', '#8ab84a', '#4a7a28'];
      d.heap(-0.58, -0.38, 0.58, 0.38, 0.46, pals, 0.6, { size: 3, step: 0.09, mound: 0.25 });
      for (const [x, y] of [[-0.98, -0.78], [0.98, -0.78], [-0.98, 0.78], [0.98, 0.78]]) {
        X.stoneCoursing(d, x - 0.14, y - 0.14, 0, x + 0.14, y + 0.14, 0.14, {});
      }
      if (v === 'a') {
        d.box(-0.04, -0.04, 0.5, 0.08, 0.08, 1.2, '#5a4434', { line: '#2a1a0a' });
        h.blob(0.08, 0.04, 1.3, 11, 9, '#6f9e46', '#466e30');
        h.blob(-0.08, -0.06, 1.42, 9, 8, '#8ab850', '#5f8e3c');
        h.blob(0.12, -0.08, 1.22, 6, 5, '#5a8a2a', '#3a6a18');
      } else if (v === 'b') {
        for (const [dx, dy, zz] of [[-0.25, 0.1, 0.85], [0.2, -0.15, 0.95], [0.05, 0.2, 0.75]]) {
          h.line([dx, dy, 0.5], [dx, dy, zz - 0.15], '#5a4434', 2);
          h.blob(dx, dy, zz, 5, 4, '#e85a3a', '#8a2010');
        }
      } else {
        for (const [dx, dy] of [[-0.3, -0.1], [0.25, 0.15], [-0.05, 0.25], [0.15, -0.2]]) {
          h.blob(dx, dy, 0.7 + Math.abs(dx) * 0.4, 4, 4, '#f0c850', '#a07020');
        }
      }
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
