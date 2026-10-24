/* 月河区 · 河东新城 P10 第三套墙皮 (2026-10-24).
 * 浅石材 + 冷玻璃，横遮阳。不用榕桥暖砖，不用月湾红瓦，不加早市雨棚。
 * 楼名是楼身大字和门厅铭牌。名字、颜色未经Leo确认。
 * 接缝沿用 Site98：每跨 3 m 共用一条框，竖梃不画在 x=3，横线不压在 z=3。 */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A || !A.skin) return;
  const shade = A.shade;
  function L(d, rot) {
    const W = rot === 6, pt = (lx, ly, z) => (W ? [ly, -lx, z] : [lx, ly, z]), C = (c) => (W && c && c[0] === '#' ? shade(c, 0.84) : c);
    const face = (pts, fill, line, lw) => d.face(pts.map((p) => pt(...p)), C(fill), line, lw);
    const box = (lx0, ly0, z0, lx1, ly1, z1, col, o = {}) => {
      const o2 = Object.assign({}, o);
      if (o.skin) { lx0 -= 0.07; lx1 += 0.07; if (W) { o2.noS = true; o2.noW = false; } else { o2.noW = true; o2.noS = false; } o2.noTop = true; o2.line = false; delete o2.skin; }
      return W ? d.box(ly0, -lx1, z0, ly1, -lx0, z1, col, o2) : d.box(lx0, ly0, z0, lx1, ly1, z1, col, o2);
    };
    const Q = (ly, a0, z0, a1, z1, fill, line) => face([[a0, ly, z0], [a1, ly, z0], [a1, ly, z1], [a0, ly, z1]], fill, line);
    const seg = (a, b, col, lw) => d.seg(pt(...a), pt(...b), C(col), lw);
    const text = (s, lx, ly, z, size, col, o = {}) => d.text(s, ...pt(lx, ly, z), size, col, Object.assign({}, o, { west: W }));
    const textW = (s, size) => d.textW(s, size);
    return { W, pt, C, face, box, Q, seg, text, textW, R: d.R };
  }
  const geoL = (rot, g) => (rot === 6 ? [g[1], -g[3], g[2], g[4], -g[0], g[5]] : g);
  const F = -0.04;
  const STONE = '#d9d4c8', JOINT = '#b7b1a4', GLASS = '#8aa0ab', SHADE = '#5d6c74', SPANDREL = '#c5ccd0';
  function stone(l, st) {
    const Q = (a0, z0, a1, z1, f) => l.Q(F, a0, z0, a1, z1, f, null);
    l.box(0, F, 0, 3, 0.26, 3, STONE, { skin: true });
    Q(0, 0, 3, 0.18, '#c9c3b6');
    Q(0, 2.58, 3, 2.9, '#cfc9bc');
    for (const z of [0.72, 1.5, 2.28]) l.seg([0, F, z], [3, F, z], JOINT, 1);
    for (const x of [0, 1.5]) l.seg([x, F, 0.18], [x, F, 2.58], shade(JOINT, 1.05), 1);
    if (st === 'ground') Q(0.35, 0.85, 2.65, 1.15, shade(GLASS, 0.92));
  }
  function glass(l, st, lit) {
    const Q = (a0, z0, a1, z1, f) => l.Q(F, a0, z0, a1, z1, f, null);
    l.box(0, F, 0, 3, 0.22, 3, GLASS, { skin: true });
    const mull = [0, 0.75, 1.5, 2.25];
    if (st === 'ground') {
      Q(0, 0, 3, 0.22, '#3e474c');
      Q(0, 0.22, 3, 2.55, lit ? '#d5e4ee' : shade(GLASS, 1.08));
      Q(0, 2.55, 3, 2.9, SPANDREL);
      l.seg([0, F, 2.55], [3, F, 2.55], SHADE, 2);
      for (const x of mull) l.seg([x, F, 0.22], [x, F, 2.55], '#3a4448', x % 1.5 === 0 ? 2 : 1);
      if (!lit) l.seg([0.3, F, 2.2], [1.2, F, 0.55], 'rgba(230,240,246,0.55)');
      return;
    }
    Q(0, 0, 3, 0.28, SPANDREL);
    Q(0, 0.28, 3, 0.42, shade(SHADE, 1.15));
    Q(0, 0.42, 3, 2.55, lit ? '#d7e6f0' : GLASS);
    Q(0, 2.55, 3, 2.7, shade(SHADE, 1.1));
    Q(0, 2.7, 3, 2.92, SPANDREL);
    if (!lit) {
      l.seg([0.25, F, 2.15], [1.15, F, 0.7], 'rgba(232,242,248,0.5)');
      Q(0.08, 0.55, 2.92, 1.05, shade(GLASS, 1.12));
    }
    for (const x of mull) l.seg([x, F, 0.42], [x, F, 2.55], shade(SHADE, 0.85), (x === 0 || x === 1.5) ? 2 : 1);
  }
  A.skin('f_wall', {
    variants: ['hd_stone'], states: ['upper', 'ground'], rots: [0, 6], prune: true, pad: 2,
    geo: (rot) => geoL(rot, [0, -0.04, 0, 3, 0.32, 3]),
    draw(d, st, v, rot) { stone(L(d, rot), st); },
  });
  A.skin('f_wall', {
    variants: ['hd_glass'], states: ['upper', 'ground'], rots: [0, 6], prune: true, pad: 2,
    geo: (rot) => geoL(rot, [0, -0.04, 0, 3, 0.32, 3]),
    draw(d, st, v, rot) { glass(L(d, rot), st, false); },
    emit(d, st, v, rot) {
      const l = L(d, rot);
      if (st === 'ground') { l.Q(F, 0.3, 0.35, 2.7, 2.2, 'rgba(214,230,240,0.55)'); return; }
      l.Q(F, 0.55, 0.7, 2.85, 2.35, 'rgba(210,228,238,0.45)');
    },
  });
  const NAMES = { yh: '月河中心', hd: '河东广场', ls: '澜石大厦', cj: '澄江中心', yl: '月澜大厦' };
  const PLATES = { yh: NAMES.yh, hd: NAMES.hd, ls: NAMES.ls, cj: NAMES.cj, yl: NAMES.yl };
  A.define('rq_hd_name', {
    name: '河东楼名', variants: Object.keys(NAMES), shadow: false, noShadow: true, fp: [], prune: true,
    geo: [0, -0.06, 0, 5.2, 0.02, 1.35], pad: 1,
    draw(d, st, v) {
      const s = NAMES[v] || v, size = 32, w = d.textW(s, size), off = Math.max(0.15, (5.2 - w) / 2);
      d.face([[0.08, -0.05, 0.08], [5.12, -0.05, 0.08], [5.12, -0.05, 1.22], [0.08, -0.05, 1.22]], '#1c2830', '#0e1418');
      d.face([[0.08, -0.05, 0.08], [5.12, -0.05, 0.08], [5.12, -0.05, 0.18], [0.08, -0.05, 0.18]], '#8aa0ab');
      d.text(s, off, -0.07, 0.32, size, '#e7eef2', { stroke: 'rgba(8,14,18,0.45)' });
    },
  });
  A.define('rq_hd_plate', {
    name: '河东门厅铭牌', variants: Object.keys(PLATES), shadow: false, noShadow: true, fp: [], prune: true,
    geo: [0, -0.08, 0, 3.6, 0.02, 0.55], pad: 0,
    draw(d, st, v) {
      const s = PLATES[v] || v, size = 14, w = d.textW(s, size), off = Math.max(0.12, (3.6 - w) / 2);
      d.face([[0.06, -0.06, 0.04], [3.54, -0.06, 0.04], [3.54, -0.06, 0.5], [0.06, -0.06, 0.5]], '#243038', '#12181c');
      d.text(s, off, -0.08, 0.16, size, '#e7eef2');
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
