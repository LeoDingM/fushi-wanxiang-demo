/* 南埠当代墙皮和菜市场外壳 (Leo 2026-10-24：00 年代瓷砖太旧，南埠菜市场不要克隆榕桥大厅).
 * 白墙、一条青铜金属线、底层整面玻璃、上层横窗。珊瑚压顶。不是马赛克，不是暖砖，也不是河东的浅石材加冷玻璃竖梃。
 * 菜市场另用白铝顶棚、沿墙细柱、白面板墙。名字和细部未经Leo确认。 */
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
    return { W, box, Q, seg };
  }
  const geoL = (rot, g) => (rot === 6 ? [g[1], -g[3], g[2], g[4], -g[0], g[5]] : g);
  const F = -0.04, WHITE = '#f7f4ee', BRONZE = '#c4a574', INK = '#3a2e24', GLASS = '#d7ebe3', CORAL = '#e07a5f';
  function panel(l, st) {
    const Q = (a0, z0, a1, z1, f) => l.Q(F, a0, z0, a1, z1, f, null);
    l.box(0, F, 0, 3, 0.28, 3, WHITE, { skin: true });
    Q(0, 0, 3, 0.16, '#e7e0d4');
    Q(0, 2.62, 3, 2.78, BRONZE);
    Q(0, 2.78, 3, 2.92, WHITE);
    if (st === 'ground') { Q(0.35, 0.9, 2.65, 2.35, shade(GLASS, 0.96)); l.seg([0.35, F, 0.9], [2.65, F, 0.9], INK, 2); l.seg([0.35, F, 2.35], [2.65, F, 2.35], INK, 2); return; }
    Q(0.4, 0.85, 2.6, 2.2, GLASS);
    l.seg([0.4, F, 0.85], [2.6, F, 0.85], INK, 2);
    l.seg([0.4, F, 2.2], [2.6, F, 2.2], INK, 2);
    l.seg([1.5, F, 0.85], [1.5, F, 2.2], shade(INK, 1.3), 1);
  }
  function shop(l, st) {
    const Q = (a0, z0, a1, z1, f) => l.Q(F, a0, z0, a1, z1, f, null);
    l.box(0, F, 0, 3, 0.22, 3, GLASS, { skin: true });
    if (st === 'ground') {
      Q(0, 0, 3, 0.18, INK);
      Q(0.12, 0.22, 2.88, 2.48, shade(GLASS, 1.05));
      Q(0, 2.48, 3, 2.92, CORAL);
      l.seg([0.12, F, 0.22], [0.12, F, 2.48], INK, 2);
      l.seg([2.88, F, 0.22], [2.88, F, 2.48], INK, 2);
      l.seg([0.4, F, 2.2], [1.3, F, 0.55], 'rgba(255,255,255,0.55)');
      return;
    }
    Q(0, 0, 3, 0.7, WHITE);
    Q(0, 0.7, 3, 0.86, BRONZE);
    Q(0.1, 0.9, 2.9, 2.15, GLASS);
    Q(0, 2.15, 3, 2.32, BRONZE);
    Q(0, 2.32, 3, 2.92, WHITE);
    l.seg([0.1, F, 0.9], [2.9, F, 0.9], INK, 2);
    l.seg([0.1, F, 2.15], [2.9, F, 2.15], INK, 2);
  }
  A.skin('f_wall', {
    variants: ['sc_panel'], states: ['upper', 'ground'], rots: [0, 6], prune: true, pad: 2,
    geo: (rot) => geoL(rot, [0, -0.04, 0, 3, 0.32, 3]),
    draw(d, st, v, rot) { panel(L(d, rot), st); },
  });
  A.skin('f_wall', {
    variants: ['sc_shop'], states: ['upper', 'ground'], rots: [0, 6], prune: true, pad: 2,
    geo: (rot) => geoL(rot, [0, -0.04, 0, 3, 0.32, 3]),
    draw(d, st, v, rot) { shop(L(d, rot), st); },
  });
  const H = 3.6;
  A.define('rq_nb_wallx', { name: '南埠菜场横墙', shadow: false, geo: [0, 0, 0, 4, 0.28, H], draw(d) {
    d.box(0, 0, 0, 4, 0.28, H, WHITE, { noS: true, line: '#e7e0d4', top: '#fffdf8' });
    d.face([[0, 0, 0.16], [4, 0, 0.16], [4, 0, 2.35], [0, 0, 2.35]], GLASS, null);
    d.face([[0, 0, 2.4], [4, 0, 2.4], [4, 0, 2.62], [0, 0, 2.62]], BRONZE, null);
    d.face([[0, 0, 2.62], [4, 0, 2.62], [4, 0, H], [0, 0, H]], WHITE, null);
    d.seg([0, 0, 2.4], [4, 0, 2.4], INK, 2);
    d.seg([1.33, 0, 0.2], [1.33, 0, 2.35], INK, 1);
    d.seg([2.66, 0, 0.2], [2.66, 0, 2.35], INK, 1);
  } });
  A.define('rq_nb_wally', { name: '南埠菜场纵墙', shadow: false, geo: [0, 0, 0, 0.28, 4, H], draw(d) {
    d.box(0, 0, 0, 0.28, 4, H, WHITE, { noW: true, line: '#e7e0d4', top: '#fffdf8' });
    d.face([[0, 0, 0.2], [0, 4, 0.2], [0, 4, 2.35], [0, 0, 2.35]], shade(GLASS, 0.92), null);
    d.face([[0, 0, 2.4], [0, 4, 2.4], [0, 4, 2.62], [0, 0, 2.62]], shade(BRONZE, 0.9), null);
    d.seg([0, 0, 2.4], [0, 4, 2.4], INK, 2);
  } });
  A.define('rq_nb_gate', { name: '南埠菜场南门', shadow: false, geo: [0, 0, 0, 4, 0.3, H], draw(d) {
    d.box(0, 0, 2.7, 4, 0.22, H, CORAL, { noS: true, line: INK, top: '#f3b6a6' });
    d.box(0, 0, 0, 0.28, 0.22, 2.7, INK, { noS: true });
    d.box(3.72, 0, 0, 4, 0.22, 2.7, INK, { noS: true });
    d.face([[0.28, 0, 0.15], [3.72, 0, 0.15], [3.72, 0, 2.65], [0.28, 0, 2.65]], 'rgba(215,235,227,0.35)', null);
    d.seg([2, 0, 0.2], [2, 0, 2.6], shade(INK, 1.4), 1);
  } });
  A.define('rq_nb_col', { name: '南埠菜场细柱', shadow: false, geo: [-0.16, -0.16, 0, 0.16, 0.16, H], draw(d) {
    d.box(-0.14, -0.14, 0, 0.14, 0.14, 0.18, INK);
    d.box(-0.1, -0.1, 0.18, 0.1, 0.1, H - 0.12, '#fbfaf6', { line: '#e7e0d4' });
    d.box(-0.14, -0.14, 1.7, 0.14, 0.14, 1.86, BRONZE);
    d.box(-0.16, -0.16, H - 0.12, 0.16, 0.16, H, INK);
  } });
  A.define('rq_nb_roof', { name: '南埠菜场顶棚', variants: ['plain', 'vent'], shadow: false, geo: [0, 0, 3.45, 8, 7, 4.05], draw(d, st, v) {
    d.flat(0, 0, 8, 7, 3.72, '#f4f1ea', '#d9d3c8');
    for (let y = 0.6; y < 7; y += 0.7) d.seg([0.2, y, 3.74], [7.8, y, 3.74], y % 1.4 < 0.7 ? '#e7e0d4' : '#cfc6b8');
    d.box(0, 0, 3.55, 8, 0.16, 3.78, CORAL, { line: '#b85a42' });
    d.box(0, 0, 3.55, 0.14, 7, 3.78, BRONZE, { line: '#8a6a3e' });
    if (v === 'vent') {
      d.box(3.1, 2.4, 3.72, 4.9, 4.4, 4.02, '#fbfaf6', { line: INK });
      d.face([[3.2, 2.5, 3.8], [4.8, 2.5, 3.8], [4.8, 2.5, 3.98], [3.2, 2.5, 3.98]], GLASS, INK);
    }
  } });
  A.define('rq_nb_floor', { name: '南埠菜场地砖', layer: 'ground', geo: [0, 0, 0, 2, 2, 0], draw(d) {
    d.flat(0, 0, 2, 2, 0, '#e6e2da', '#cfc8bc');
    d.seg([0, 1, 0], [2, 1, 0], '#d5cfc4');
    d.seg([1, 0, 0], [1, 2, 0], '#d5cfc4');
  } });
})(typeof window !== 'undefined' ? window : globalThis);
