/* 影视城古镇 art preview — props: 牌坊, 石狮 (雄/雌), 水井, 独轮推车, 轿子, 马车, 摊位 (果/玩具/面), 灯笼串, 宫灯路灯, 柳树, 槐树, 漕船, 码头. 未经Leo确认. */
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
  // ---------------- 摊位 market stalls: fruit (awning), toys (parasol), noodle (stove + benches) ----------------
  A.define('aq_stall', {
    name: '摊位', variants: ['fruit', 'toys', 'noodle'], geo: [-1.4, -1.6, 0, 1.6, 1.4, 3.2], fp: [[-1.1, -0.6, 1.1, 0.6]], prune: true,
    draw(d, st, v) {
      const h = H(d);
      const table = (x0, x1, y0, y1, zt) => { for (const [x, y] of [[x0 + 0.08, y1 - 0.08], [x1 - 0.08, y1 - 0.08], [x0 + 0.08, y0 + 0.08], [x1 - 0.08, y0 + 0.08]]) h.line([x, y, 0], [x, y, zt], WOOD_D, 2); d.box(x0, y0, zt - 0.08, x1, y1, zt, WOOD, { line: WOOD_D, top: shade(WOOD, 1.25) }); };
      if (v === 'fruit') {
        for (const [x, y] of [[-1.1, 0.6], [1.1, 0.6]]) h.line([x, y, 0], [x, y, 2.4], WOOD_D, 2);
        table(-1.0, 1.0, -0.55, 0.55, 0.8);
        for (const [x0, pal] of [[-0.95, ['#d8402a', '#c83020', '#e85a3a']], [-0.3, ['#e8b030', '#d89a20', '#f0c850']], [0.35, ['#6a9a3a', '#5a8a2a', '#8ab84a']]]) { d.box(x0, -0.5, 0.8, x0 + 0.6, 0.5, 0.92, '#b89a5a', { line: '#5a4a2a' }); d.heap(x0 + 0.04, -0.46, x0 + 0.56, 0.46, 0.92, pal, 0.95, { size: 3, step: 0.09, mound: 0.16 }); }
        for (let k = 0; k < 3; k++) d.tag(-0.8 + k * 0.65, -0.52, 0.82);
        for (const [x, y] of [[-1.1, -0.6], [1.1, -0.6]]) h.line([x, y, 0], [x, y, 2.2], WOOD_D, 2);
        d.face([[-1.3, -1.0, 2.0], [1.3, -1.0, 2.0], [1.3, 0.7, 2.45], [-1.3, 0.7, 2.45]], '#e8dcc0', '#7a6a4a');
        for (let x = -1.3; x < 1.3; x += 0.52) d.face([[x, -1.0, 2.0], [x + 0.26, -1.0, 2.0], [x + 0.26, 0.7, 2.45], [x, 0.7, 2.45]], '#b8342a', null);
        for (let x = -1.3; x < 1.3; x += 0.26) d.face([[x, -1.0, 2.0], [x + 0.26, -1.0, 2.0], [x + 0.13, -1.0, 1.85]], '#b8342a', '#6a1a10');
        d.box(-1.4, 0.6, 0, -1.0, 1.0, 0.4, '#a08050', { line: '#4a3a1a' });
      } else if (v === 'toys') {
        table(-0.9, 0.9, -0.45, 0.45, 0.75);
        for (let k = 0; k < 5; k++) { const x = -0.75 + k * 0.36, cols = ['#c8322c', '#e8c050', '#3a6aa8', '#e8e0d0', '#3a8a5a']; d.box(x - 0.12, -0.35, 0.75, x + 0.12, -0.2, 0.95, cols[k], { line: shade(cols[k], 0.5) }); h.blob(x, -0.36, 0.88, 3, 3, '#f0e0c8', '#5a4a3a'); }
        // 草把子 straw stand with 糖葫芦 / pinwheels
        h.line([0.6, 0.2, 0.75], [0.6, 0.2, 2.2], WOOD_D, 3); h.blob(0.6, 0.2, 1.9, 9, 14, '#c8b070', '#7a6a3a');
        for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, x = 0.6 + Math.cos(a) * 0.2, z = 1.9 + Math.sin(a) * 0.32; h.line([0.6, 0.2, 1.9], [x, 0.0, z + 0.15], '#8a6a3a'); for (let j = 0; j < 3; j++) h.blob(x + (x - 0.6) * j * 0.2, -0.02, z + 0.15 + j * 0.06, 2, 2, '#c8201a', '#6a0a08'); }
        for (const [x, z, c] of [[-0.6, 1.5, '#e85a8a'], [-0.3, 1.7, '#5ab0e8']]) { h.line([x, 0.0, 0.75], [x, 0.0, z], '#6a4a2a'); for (let k = 0; k < 4; k++) d.face([[x, -0.01, z], [x + Math.cos(k * 1.57) * 0.13, -0.01, z + Math.sin(k * 1.57) * 0.13], [x + Math.cos(k * 1.57 + 0.8) * 0.13, -0.01, z + Math.sin(k * 1.57 + 0.8) * 0.13]], k % 2 ? c : '#f0e8d0', shade(c, 0.5)); }
        // 油纸伞 parasol
        h.line([-0.95, 0.3, 0], [-0.95, 0.3, 2.6], WOOD_D, 2);
        const um = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; um.push([-0.95 + Math.cos(a) * 1.25, 0.3 + Math.sin(a) * 1.25, 2.25]); }
        d.face(um, '#c8a040', '#6a4a10'); for (let i = 0; i < 16; i += 2) d.face([[-0.95, 0.3, 2.65], um[i], um[(i + 1) % 16]], '#b8342a', null); for (let i = 1; i < 16; i += 2) d.face([[-0.95, 0.3, 2.65], um[i], um[(i + 1) % 16]], '#d8b050', null);
        for (const p of um) h.line([-0.95, 0.3, 2.65], p, '#6a3a1a');
      } else {
        // noodle stand: stove with pot + steam, bowl board, two benches, small 幌子
        d.box(-1.0, 0.0, 0, -0.2, 0.7, 0.85, '#8a5a3a', { line: '#2a1a0a', top: '#3a3430' }); h.QS(-0.01, -0.85, 0.2, -0.35, 0.5, '#1a1a1a'); h.QS(-0.02, -0.75, 0.25, -0.45, 0.4, '#e86020');
        d.disc(-0.6, 0.35, 0.86, 0.3, '#5a5a5a', '#2a2a2a'); d.disc(-0.6, 0.35, 0.88, 0.25, '#d8d0b8', null);
        for (let k = 0; k < 3; k++) h.pline([[-0.7 + k * 0.1, 0.35, 1.0], [-0.65 + k * 0.1, 0.35, 1.3], [-0.72 + k * 0.1, 0.35, 1.6], [-0.66 + k * 0.1, 0.35, 1.9]], 'rgba(240,240,240,0.9)', 2);
        table(0.0, 1.2, -0.1, 0.7, 0.8);
        for (let k = 0; k < 4; k++) { const x = 0.15 + k * 0.27; d.disc(x, 0.2, 0.82, 0.09, '#e8e8e0', '#5a6a8a'); d.disc(x, 0.2, 0.84, 0.06, '#c8a050', null); }
        h.line([0.2, 0.5, 0.82], [0.25, 0.4, 1.05], '#6a4a2a'); h.line([0.25, 0.5, 0.82], [0.3, 0.4, 1.05], '#6a4a2a');
        for (const y of [-0.6, 1.0]) d.box(-0.1, y, 0.4, 1.3, y + 0.25, 0.46, WOOD, { line: WOOD_D, top: shade(WOOD, 1.2) });
        for (const y of [-0.6, 1.0]) for (const x of [0.0, 1.2]) h.line([x, y + 0.12, 0], [x, y + 0.12, 0.4], WOOD_D, 2);
        h.line([1.25, 0.65, 0], [1.25, 0.65, 2.4], WOOD_D, 2); X.banner(d, 1.25, 0.6, 2.35, '麵', { col: '#e8dcc0', tc: '#a01e18', len: 0.9, w: 0.45, size: 13, pole: false });
      }
    },
    emit(d, st, v) { if (v === 'noodle') { H(d).QS(-0.03, -0.8, 0.22, -0.4, 0.48, '#ff9040'); return; } return false; },
  });
  // ---------------- 灯笼串 lantern string between two posts ----------------
  A.define('aq_lanterns', {
    shadowOf: () => [[[-0.2, -0.2], [0.2, -0.2], [0.7, 4.4], [0.3, 4.4]], [[7.8, -0.2], [8.2, -0.2], [8.7, 4.4], [8.3, 4.4]]],
    name: '灯笼串', geo: [-0.3, -0.3, 0, 8.3, 0.3, 4.8], fp: [[-0.15, -0.15, 0.15, 0.15], [7.85, -0.15, 8.15, 0.15]], prune: true,
    draw(d) {
      const h = H(d), sag = (x) => 4.2 - 0.6 * Math.sin(Math.PI * x / 8);
      for (const x of [0, 8]) { h.column(x, 0, 0, 4.4, 0.08, RED_W); d.box(x - 0.12, -0.12, 4.4, x + 0.12, 0.12, 4.52, GOLD, { line: '#6a4a10' }); }
      const pts = []; for (let x = 0; x <= 8; x += 0.25) pts.push([x, 0, sag(x)]); h.pline(pts, '#2a1a12');
      for (let x = 1; x < 8; x += 1) X.lantern(d, x, 0, sag(x), { r: 0.2, cord: 0.08, text: x === 4 ? '福' : null });
    },
    emit(d) { const sag = (x) => 4.2 - 0.6 * Math.sin(Math.PI * x / 8); for (let x = 1; x < 8; x += 1) X.lanternGlow(d, x, 0, sag(x), { r: 0.2, cord: 0.08 }); },
  });
  // ---------------- 宫灯路灯: modern street light dressed as a timber post with a hexagonal palace lantern ----------------
  A.define('aq_lamppost', {
    shadowOf: () => [[[-0.22, -0.22], [0.22, -0.22], [0.6, 3.7], [0.2, 3.7]]],
    name: '宫灯路灯', geo: [-0.5, -0.9, 0, 0.5, 0.5, 4.2], fp: [[-0.2, -0.2, 0.2, 0.2]], prune: true,
    draw(d) {
      const h = H(d);
      d.box(-0.22, -0.22, 0, 0.22, 0.22, 0.4, STONE, { line: shade(STONE, 0.5), west: STONE_W });
      d.box(-0.09, -0.09, 0.4, 0.09, 0.09, 3.6, '#5a2a1c', { line: '#2a0e08', west: '#4a2014' });
      d.box(-0.12, -0.8, 3.45, 0.04, 0.09, 3.55, '#5a2a1c', { line: '#2a0e08' });
      h.pline([[0, -0.1, 3.3], [-0.04, -0.4, 3.42], [-0.04, -0.7, 3.47]], '#5a2a1c', 2);
      lantern6(d, -0.04, -0.7, 3.4);
    },
    emit(d) { const h = H(d), c = h.P(-0.04, -0.7, 2.95); d.g.fillStyle = '#ffd890'; d.g.fillRect(Math.round(c[0] - 6), Math.round(c[1] - 9), 12, 16); d.g.fillStyle = '#fff4d0'; d.g.fillRect(Math.round(c[0] - 3), Math.round(c[1] - 6), 6, 10); },
  });
  function lantern6(d, x, y, z) {
    const h = H(d), c = h.P(x, y, z - 0.45), g = d.g;
    g.fillStyle = '#3a1a10'; g.fillRect(Math.round(c[0] - 9), Math.round(c[1] - 14), 18, 3); g.fillRect(Math.round(c[0] - 9), Math.round(c[1] + 9), 18, 3);
    g.fillStyle = '#e8d098'; g.fillRect(Math.round(c[0] - 8), Math.round(c[1] - 11), 16, 20); g.fillStyle = '#c8a868'; g.fillRect(Math.round(c[0] + 2), Math.round(c[1] - 11), 6, 20);
    g.fillStyle = '#5a2a1c'; for (const dx of [-8, -3, 2, 7]) g.fillRect(Math.round(c[0] + dx), Math.round(c[1] - 11), 1, 20);
    g.fillStyle = '#c8322c'; g.fillRect(Math.round(c[0] - 2), Math.round(c[1] + 12), 1, 6); g.fillRect(Math.round(c[0] + 2), Math.round(c[1] + 12), 1, 6); g.fillStyle = GOLD; g.fillRect(Math.round(c[0] - 10), Math.round(c[1] - 15), 2, 2); g.fillRect(Math.round(c[0] + 8), Math.round(c[1] - 15), 2, 2);
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
    },
  });
  A.define('aq_dock', {
    name: '码头(木栈台)', geo: [-0.4, -4.4, -2.0, 10.4, 0.4, 1.2], fp: [[0, -4, 10, 0]], prune: true, shadowOf: () => [[[0, -4], [10, -4], [10.3, -1.0], [0.3, -1.0]]],
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
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
