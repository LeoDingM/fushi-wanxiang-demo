/* 榕桥区 E3 art (2026-10-18): the old district has kept up with the times (Leo 01:10) + 榕桥老街早市.
 * Facade / roof pieces are VARIANTS of the kit f_wall / b_roof_a (painted by RongqiaoArt.skin), so modern buildings sort, fade
 * and collide exactly like the old ones:
 *   f_wall  cw_blue / cw_silver / cw_bronze  glass curtain wall (spandrel band, mullions, sky reflections; ground = lobby glass)
 *           mall_a  aluminium-panel mall facade with LED strip (ground: glass entrance)
 *           mf_*    modern storefronts (ground only): 咖啡 茶饮 面包 花店 眼镜 手机 服饰 书店 — glass, awning, light-box sign
 *   b_roof_a r_mod / r_mod2  modern flat roof (parapet cap, HVAC, gondola track, stair-lift hut / skylights)
 * New types: rq_cw_canopy(_w) lobby canopy, rq_cw_logo top-of-building name panels, rq_x_ramp underground parking ramp,
 * 早市 rq_x_mstall (folding table + umbrella + goods), rq_x_mtrike (三轮车 with load), rq_x_mtarp (地摊布).
 * All names / colours / layouts 未经Leo确认. */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A || !A.skin) return;
  const shade = A.shade;
  function L(d, rot) {
    const W = rot === 6, pt = (lx, ly, z) => (W ? [ly, -lx, z] : [lx, ly, z]), C = (c) => (W && c && c[0] === '#' ? shade(c, 0.84) : c);
    const face = (pts, fill, line, lw) => d.face(pts.map((p) => pt(...p)), C(fill), line, lw);
    const box = (lx0, ly0, z0, lx1, ly1, z1, col, o = {}) => {
      const o2 = Object.assign({}, o);
      // skin: only the facade plane. A west-end cap and a top lip on every 3 m bay read as a splice.
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
  // ------------------------------------------------------------------ curtain walls
  const CW = { cw_blue: ['#4f7f99', '#86b4c8', '#2c4756'], cw_silver: ['#7e8f99', '#b9c8cf', '#4a565d'], cw_bronze: ['#6e6152', '#a8957a', '#3e352c'] };
  for (const k of Object.keys(CW)) CW[k + '_b'] = CW[k];   // same glass, other lit-office pattern at night (towers mix both)
  function curtain(l, v, st, lit) {
    const [g, hi, sp] = CW[v], R = l.R, Q = (a0, z0, a1, z1, f, li) => l.Q(F, a0, z0, a1, z1, f, li);
    // One shared frame per bay. Mullions sit on x=0 and on a 0.75 m period (3 m divides evenly).
    // Nothing is drawn on x=3 or z=3, so the next bay's left mullion is the only joint.
    l.box(0, F, 0, 3, 0.3, 3, g, { skin: true });
    const mull = [0, 0.75, 1.5, 2.25];
    if (st === 'ground') {
      Q(0, 0.16, 3, 2.82, lit ? '#f3dca3' : shade(g, 1.1), null);
      Q(0, 0, 3, 0.16, '#2a3034', null);
      Q(0, 2.72, 3, 2.92, shade(sp, 0.9), null);
      for (const x of mull) l.seg([x, F, 0.16], [x, F, 2.72], '#2a3034', x % 1.5 === 0 ? 2 : 1);
      l.seg([0, F, 1.45], [3, F, 1.45], '#2a3034', 1);
      if (!lit) { l.seg([0.25, F, 2.45], [1.15, F, 0.55], 'rgba(230,240,245,0.55)'); Q(0.08, 0.16, 2.92, 0.85, shade(g, 0.78), null); Q(0, 2.35, 3, 2.72, shade(hi, 0.92), null); }
      return;
    }
    Q(0, 0, 3, 0.38, sp, null);
    Q(0, 0.32, 3, 0.46, shade(hi, 1.2), null);
    Q(0, 0.46, 3, 2.78, lit ? '#f1e0b0' : g, null);
    Q(0, 2.7, 3, 2.92, shade(sp, 1.05), null);
    if (!lit) {
      const t = R();
      Q(0.06, 0.5 + t * 0.35, 2.94, 1.15 + t * 0.35, shade(g, 1.16), null);
      l.seg([0.2 + R() * 0.3, F, 2.55], [1.15 + R() * 0.4, F, 0.7], 'rgba(235,245,250,0.55)');
      if (R() < 0.6) Q(0.12, 1.55, 1.4, 2.62, shade(g, 0.7), null);
      Q(1.55, 2.15, 2.9, 2.68, shade(hi, 0.88), null);
    }
    for (const x of mull) l.seg([x, F, 0.38], [x, F, 2.78], shade(sp, 0.72), (x === 0 || x === 1.5) ? 2 : 1);
    l.seg([0, F, 1.62], [3, F, 1.62], shade(sp, 0.85), 1);
  }
  A.skin('f_wall', { variants: Object.keys(CW), states: ['upper', 'ground'], rots: [0, 6], geo: (rot) => geoL(rot, [0, -0.04, 0, 3, 0.35, 3]),
    draw(d, st, v, rot) { curtain(L(d, rot), v, st, false); },
    emit(d, st, v, rot) { const l = L(d, rot), R = l.R; if (st === 'ground') { l.Q(F, 0.1, 0.18, 2.9, 2.35, 'rgba(255,226,160,0.9)'); return; } if (/_b$/.test(v)) return false; l.Q(F, 1.55, 0.5, 2.95, 2.95, 'rgba(255,228,172,0.78)'); l.Q(F, 1.55, 2.6, 2.95, 2.95, 'rgba(255,246,220,0.85)'); } });
  // ------------------------------------------------------------------ mall facade
  A.skin('f_wall', { variants: ['mall_a'], states: ['upper', 'ground'], rots: [0, 6], geo: (rot) => geoL(rot, [0, -0.04, 0, 3, 0.35, 3]),
    draw(d, st, v, rot) { const l = L(d, rot), Q = (a0, z0, a1, z1, f, li) => l.Q(F, a0, z0, a1, z1, f, li);
      l.box(0, F, 0, 3, 0.35, 3, '#e6e7e3', { skin: true });
      if (st === 'ground') {
        Q(0, 0, 3, 0.18, '#3a3f44', null); Q(0, 2.62, 3, 2.92, '#3a3f44', null);
        Q(0.12, 0.22, 2.88, 2.55, '#6c8c9a', null);
        l.seg([1.5, F, 0.22], [1.5, F, 2.55], '#2f3b40', 2); l.seg([0.12, F, 1.4], [2.88, F, 1.4], '#2f3b40', 1);
        l.seg([0.4, F, 2.3], [1.05, F, 0.55], 'rgba(235,245,250,0.55)');
        return;
      }
      for (let z = 1; z <= 2; z += 1) l.seg([0, F, z], [3, F, z], '#b7b9b4');
      for (const x of [1, 2]) l.seg([x, F, 0.2], [x, F, 2.85], '#c4c6c0');
      Q(0, 0, 3, 0.16, '#c8cac6', null); Q(0, 2.78, 3, 2.94, '#d5d6d2', null);
      Q(0.15, 2.42, 2.85, 2.7, '#ff7a3d', null);
      Q(0.35, 0.4, 1.35, 2.15, '#5f7c88', null); Q(1.55, 0.4, 2.65, 2.15, shade('#5f7c88', 1.08), null);
      l.seg([0.85, F, 0.4], [0.85, F, 2.15], '#3a4a52', 1); l.seg([2.1, F, 0.4], [2.1, F, 2.15], '#3a4a52', 1);
      l.seg([0.45, F, 1.9], [1.15, F, 0.6], 'rgba(235,245,250,0.45)'); },
    emit(d, st, v, rot) { const l = L(d, rot); l.Q(F, 2.3, 0, 2.55, 3, 'rgba(255,140,80,0.95)'); if (st === 'ground') l.Q(F, 0.15, 0.1, 2.85, 2.6, 'rgba(255,230,170,0.9)'); else l.Q(F, 0.4, 1.0, 1.8, 2.2, 'rgba(255,236,190,0.85)'); } });
  // ------------------------------------------------------------------ modern storefronts (ground floor only)
  const MF = { mf_cafe: ['咖啡', '#3b2a20', '#c8a27a'], mf_tea: ['茶饮', '#2f6b4f', '#e9d9a8'], mf_bake: ['面包', '#c06a2b', '#f3e2c4'], mf_flower: ['花店', '#7a3f62', '#f2c6d6'],
    mf_glass: ['眼镜', '#24364a', '#d8e0e6'], mf_phone: ['手机', '#1f4f8f', '#e8eef5'], mf_wear: ['服饰', '#2a2a2c', '#e8e2d8'], mf_book: ['书店', '#5a4630', '#efe6d2'] };
  A.skin('f_wall', { variants: Object.keys(MF), states: ['ground'], rots: [0, 6], geo: (rot) => geoL(rot, [0, -0.9, 0, 3, 0.35, 3.1]),
    draw(d, st, v, rot) { const l = L(d, rot), R = l.R, [name, c, c2] = MF[v], Q = (a0, z0, a1, z1, f, li) => l.Q(F, a0, z0, a1, z1, f, li);
      l.box(0, F, 0, 3, 0.35, 3, '#3a3d40', { skin: true });
      l.seg([0, F, 0.08], [0, F, 2.92], '#202224', 2);
      Q(0.12, 0.12, 2.88, 2.2, '#86a6b2', '#1e2326'); Q(0.12, 0.12, 2.88, 0.32, '#2d3134');
      for (let k = 0; k < 5; k++) { const x = 0.3 + k * 0.5 + R() * 0.1, h = 0.4 + R() * 0.7; Q(x, 0.32, x + 0.28, 0.32 + h, shade(c2, 0.8 + R() * 0.3)); }   // goods / tables inside
      l.seg([1.5, F, 0.12], [1.5, F, 2.2], '#1e2326', 2); l.seg([0.35, F, 2.0], [0.9, F, 0.5], 'rgba(235,245,250,0.55)');
      Q(0, 2.3, 3, 2.98, c, shade(c, 0.6)); const w = l.textW(name, 11); l.text(name, 1.5 - w / 2, F - 0.01, 2.42, 11, c2);
      for (let k = 0; k < 6; k++) { const a0 = k * 0.5, col = k % 2 ? c2 : c; l.face([[a0, F, 2.25], [a0 + 0.5, F, 2.25], [a0 + 0.5, -0.85, 1.95], [a0, -0.85, 1.95]], col, shade(c, 0.5)); }   // awning
    },
    emit(d, st, v, rot) { const l = L(d, rot); l.Q(F, 0.12, 0.32, 2.88, 2.2, 'rgba(255,232,180,0.85)'); l.Q(F, 0.05, 2.32, 2.95, 2.96, 'rgba(255,245,215,0.6)'); } });
  // ------------------------------------------------------------------ modern roofs (b_roof_a 15 x 12)
  function modRoof(d, v) {
    const w = 15, dd = 12, z = 0;
    d.box(0, 0, z - 0.15, w, dd, z + 0.05, '#8e9296', { line: '#5d6164', top: '#9a9ea1' });
    for (let x = 1.5; x < w; x += 1.5) d.seg([x, 0.3, z + 0.06], [x, dd - 0.3, z + 0.06], '#8a8e91');
    const par = (x0, y0, x1, y1) => d.box(x0, y0, z, x1, y1, z + 1.1, '#d9dcdc', { line: '#7c8183', top: '#eef0ef' });
    par(0, dd - 0.3, w, dd); par(w - 0.3, 0, w, dd - 0.3);                                     // far parapets first
    if (v === 'r_mod') { d.box(9.5, 6.5, z, 13.5, 10.8, z + 3.2, '#cfd3d4', { line: '#6f7476', top: '#e2e5e5' }); d.face([[9.5, 6.5, 0.1], [9.5, 7.6, 0.1], [9.5, 7.6, 2.3], [9.5, 6.5, 2.3]], '#5d666b'); }
    else for (const [x, y] of [[4, 6], [7.5, 6], [11, 6]]) { d.box(x, y, z, x + 2.6, y + 3.6, z + 0.6, '#9fb6c0', { line: '#5c6c73', top: '#bcd3dc' }); d.seg([x + 0.3, y + 0.3, z + 0.61], [x + 2.3, y + 3.3, z + 0.61], 'rgba(255,255,255,0.6)'); }
    for (const [x, y] of [[2, 7.5], [4.6, 7.5], [2, 9.6]]) { d.box(x, y, z, x + 2, y + 1.6, z + 1.2, '#b7bcbe', { line: '#63686a', top: '#cdd1d2' }); d.disc(x + 1, y + 0.8, z + 1.22, 0.45, '#43484b', '#2a2d2f'); }
    for (const x of [0.9, w - 0.9]) d.seg([x, 0.6, z + 1.25], [x, dd - 0.6, z + 1.25], '#5f6466', 2);       // gondola track
    par(0, 0, w, 0.3); par(0, 0.3, 0.3, dd - 0.3);
  }
  A.skin('b_roof_a', { variants: ['r_mod', 'r_mod2'], states: ['default'], rots: [0], pad: 6, geo: () => [-0.3, -0.3, -0.2, 15.3, 12.3, 3.4], draw(d, st, v) { modRoof(d, v); } });
  // ------------------------------------------------------------------ lobby canopy, name panels, parking ramp
  for (const [type, west] of [['rq_cw_canopy', false], ['rq_cw_canopy_w', true]]) A.define(type, { name: '大堂雨棚', noShadow: false, fp: [],
    geo: west ? [-2.4, -6, 3.4, 0, 0, 3.9] : [0, -2.4, 3.4, 6, 0, 3.9],
    draw(d) { const P = (u, o, z) => (west ? [-o, -u, z] : [u, -o, z]);
      const q = (pts, f, li) => d.face(pts.map((p) => P(...p)), f, li);
      for (const u of [0.4, 5.6]) { const a = P(u, 2.2, 0), b = P(u, 2.2, 3.5); d.box(Math.min(a[0], b[0]) - 0.06, Math.min(a[1], b[1]) - 0.06, 0, Math.min(a[0], b[0]) + 0.06, Math.min(a[1], b[1]) + 0.06, 3.5, '#c9ced1', { line: '#6c7275' }); }
      q([[0, 0, 3.5], [6, 0, 3.5], [6, 2.4, 3.5], [0, 2.4, 3.5]], 'rgba(170,200,212,0.55)', '#5a656b'); q([[0, 2.4, 3.5], [6, 2.4, 3.5], [6, 2.4, 3.85], [0, 2.4, 3.85]], '#d2d6d8', '#6a7073');
      q([[0, 0, 3.85], [6, 0, 3.85], [6, 2.4, 3.85], [0, 2.4, 3.85]], '#e3e6e7', '#7a8083'); } });
  const LOGO = { rqzx: ['榕桥中心', '#f4f6f6', '#1d3d5c'], hjds: ['汇金大厦', '#f2d27a', '#3a2c1c'], ngjj: ['南关国际', '#ffffff', '#24445e'], rqh: ['榕桥汇', '#ff6a3d', '#ffffff'], rqtj: ['榕桥天街', '#ffffff', '#2f5f7a'] };
  const LOBBY = ['rqzx', 'hjds', 'ngjj'].map((k) => k + '_l');   // small dark name plates on the lobby canopy fascia
  for (const [type, west] of [['rq_cw_logo', false], ['rq_cw_logo_w', true]]) A.define(type, { name: '楼名', variants: Object.keys(LOGO).concat(west ? [] : LOBBY), shadow: false, noShadow: true, fp: [],
    geo: west ? [-0.15, -7, 0, 0, 0, 1.6] : [0, -0.15, 0, 7, 0, 1.6],
    draw(d, st, v) {
      if (/_l$/.test(v)) { const [s] = LOGO[v.slice(0, -2)], w = d.textW(s, 12), off = (7 - w) / 2; d.face([[off - 0.3, -0.1, 0.02], [off + w + 0.3, -0.1, 0.02], [off + w + 0.3, -0.1, 0.62], [off - 0.3, -0.1, 0.62]], '#22303a', '#11181d'); d.text(s, off, -0.12, 0.12, 12, '#f2f4f4'); return; }
      const [s, col, bg] = LOGO[v], size = v === 'rqh' ? 30 : 22, w = d.textW(s, size), off = Math.max(0.2, (7 - w) / 2);
      if (v === 'rqh' || v === 'rqtj') { if (west) d.face([[-0.1, -0.2, 0.05], [-0.1, -6.8, 0.05], [-0.1, -6.8, 1.5], [-0.1, -0.2, 1.5]], bg, shade(bg, 0.6)); else d.face([[0.2, -0.1, 0.05], [6.8, -0.1, 0.05], [6.8, -0.1, 1.5], [0.2, -0.1, 1.5]], bg, shade(bg, 0.6)); }
      if (west) d.text(s, -0.12, -off, 0.35, size, v === 'rqh' ? col : col, { west: true, stroke: v === 'rqh' ? null : 'rgba(0,0,0,0.35)' }); else d.text(s, off, -0.12, 0.35, size, col, { stroke: v === 'rqh' ? null : 'rgba(0,0,0,0.35)' }); },
    emit(d, st, v) { if (/_l$/.test(v)) { const [s] = LOGO[v.slice(0, -2)], w = d.textW(s, 12); d.text(s, (7 - w) / 2, -0.12, 0.12, 12, '#ffffff'); return; } const [s, col] = LOGO[v], size = v === 'rqh' ? 30 : 22, w = d.textW(s, size), off = Math.max(0.2, (7 - w) / 2); if (west) d.text(s, -0.12, -off, 0.35, size, col, { west: true }); else d.text(s, off, -0.12, 0.35, size, col); } });
  A.define('rq_x_ramp', { name: '地下车库入口', geo: [0, 0, 0, 4.2, 10, 2.9], fp: [[0, 0, 4.2, 10]],
    draw(d) {
      d.face([[0.3, 0, 0.02], [3.9, 0, 0.02], [3.9, 10, 0.02], [0.3, 10, 0.02]], '#4b4f52');
      for (let y = 0.6; y < 9.5; y += 0.6) d.seg([0.4, y, 0.03], [3.8, y, 0.03], '#5d6164');
      d.face([[0.3, 6, 0.03], [3.9, 6, 0.03], [3.9, 10, 0.03], [0.3, 10, 0.03]], '#202325');                    // goes underground
      d.box(0, 0, 0, 0.3, 10, 1.0, '#c9c6bd', { line: '#7a776f' }); d.box(3.9, 0, 0, 4.2, 10, 1.0, '#c9c6bd', { line: '#7a776f' });
      for (let k = 0; k < 6; k++) d.face([[0.3 + k * 0.6, -0.01, 0.02], [0.6 + k * 0.6, -0.01, 0.02], [0.6 + k * 0.6, 0.4, 0.02], [0.3 + k * 0.6, 0.4, 0.02]], k % 2 ? '#2a2a2a' : '#e8c22a');
      d.box(0.3, 6, 2.2, 3.9, 10, 2.5, '#d4d7d8', { line: '#6c7072' });                                           // portal canopy
      d.face([[0.3, 6, 2.2], [3.9, 6, 2.2], [3.9, 6, 2.5], [0.3, 6, 2.5]], '#2f5f9a'); d.text('P 地下车库', 0.6, 5.98, 2.26, 7, '#ffffff', { weight: 'bold' });
      d.box(0.35, 2.8, 0, 0.6, 3.05, 1.0, '#e0e0e0', { line: '#777' }); d.seg([0.6, 2.9, 0.9], [3.6, 2.9, 0.9], '#d33', 3); d.seg([1.2, 2.9, 0.9], [1.6, 2.9, 0.9], '#fff', 3); d.seg([2.4, 2.9, 0.9], [2.8, 2.9, 0.9], '#fff', 3);   // barrier
      d.box(4.25, 1.2, 0, 4.5, 1.45, 2.6, '#9aa0a3', { line: '#555' }); d.box(4.2, 1.0, 1.9, 4.55, 1.65, 2.6, '#2f5f9a', { line: '#1a3556' }); d.text('P', 4.22, 1.15, 2.05, 13, '#fff', { west: true }); } });
  // ------------------------------------------------------------------ 早市 (榕桥老街早市) stalls
  const STALL = { veg: ['#4f9a3a', '#7cc04a', '#c8d65a', '#2f7a2a'], fruit: ['#e85b2a', '#f2b12a', '#d8342f', '#86c24a'], egg: ['#f2e2c4', '#e8cfa2', '#f6ecd8'], tofu: ['#f4f1e6', '#e8e2c8', '#d8cfa8'],
    snack: ['#c87a3a', '#e8b25a', '#8a4a2a'], cloth: ['#3a5f9a', '#c83a4a', '#e8e2d2', '#3a8a5a'], fish: ['#b8a68a', '#9a8a70', '#d8c8a8'], flower: ['#e85a8a', '#f2d23a', '#ffffff', '#c83a5a'] };
  const UMB = ['#c8372f', '#2f6fb3', '#e8b82a', '#3a8a5a', '#e8e2d2', '#7a4fb0'];
  A.define('rq_x_mstall', { name: '早市摊位', variants: Object.keys(STALL), geo: [0, 0, 0, 2.2, 1.2, 2.5], fp: [[0.05, 0.05, 2.15, 1.15]],
    draw(d, st, v) { const R = d.R, pal = STALL[v];
      for (const [x, y] of [[0.15, 0.15], [2.0, 0.15], [0.15, 1.0], [2.0, 1.0]]) d.seg([x, y, 0], [x, y, 0.72], '#7a7f82', 2);
      d.box(0.05, 0.05, 0.72, 2.15, 1.15, 0.78, '#e8e6de', { line: '#8a8880' });
      if (v === 'cloth') { for (let k = 0; k < 6; k++) d.box(0.15 + k * 0.32, 0.2, 0.78, 0.42 + k * 0.32, 1.0, 0.86, pal[k % pal.length], { line: shade(pal[k % pal.length], 0.6) }); }
      else if (v === 'egg') { for (const x of [0.15, 0.85, 1.5]) { d.box(x, 0.2, 0.78, x + 0.55, 0.95, 0.9, '#c8a46a', { line: '#7a6040' }); d.heap(x + 0.04, 0.24, x + 0.51, 0.91, 0.9, pal, 0.9, { size: 2, mound: 0.05 }); } }
      else d.heap(0.15, 0.15, 2.05, 1.05, 0.78, pal, 0.95, { size: 2 });
      d.box(1.85, 0.25, 0.78, 2.1, 0.5, 0.86, '#e8e8e8', { line: '#555' });                                                        // electronic scale
      for (let k = 0; k < 2; k++) d.box(0.2 + k * 0.7, -0.35, 0, 0.75 + k * 0.7, 0.05, 0.3, k ? '#2f6fb3' : '#d8342f', { line: '#333' }); // crates in front
      const c = UMB[Math.floor(R() * UMB.length)], cx = 1.1, cy = 0.6; d.seg([cx, cy, 0.78], [cx, cy, 2.2], '#555', 2);
      const pts = []; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; pts.push([cx + Math.cos(a) * 1.25, cy + Math.sin(a) * 1.25, 2.05]); }
      for (let k = 0; k < 8; k++) { const p = pts[k], q = pts[(k + 1) % 8]; d.face([[cx, cy, 2.4], p, q], k % 2 ? c : shade(c, k < 4 ? 0.85 : 1.08), shade(c, 0.55)); } } });
  A.define('rq_x_mtrike', { name: '三轮车', variants: ['veg', 'fruit'], geo: [0, 0, 0, 2.4, 1.2, 1.3], fp: [[0, 0, 2.4, 1.2]],
    draw(d, st, v) { const pal = STALL[v];
      for (const [x, y] of [[0.4, 0.1], [0.4, 1.1], [2.1, 0.6]]) { d.disc(x, y, 0.25, 0.25, '#1f2124', '#0d0e0f'); d.disc(x, y, 0.25, 0.12, '#9aa0a4'); }
      d.box(0.05, 0.05, 0.42, 1.45, 1.15, 0.78, '#3d6fa8', { line: '#1f3a5a', top: '#2d4a6a' }); d.heap(0.1, 0.1, 1.4, 1.1, 0.78, pal, 1, { size: 2, mound: 0.25 });
      d.seg([1.45, 0.6, 0.55], [2.1, 0.6, 0.3], '#3a3f42', 3); d.seg([2.0, 0.6, 0.3], [1.95, 0.6, 1.05], '#3a3f42', 2); d.seg([1.95, 0.3, 1.05], [1.95, 0.9, 1.05], '#222', 2);
      d.box(1.5, 0.45, 0.75, 1.8, 0.75, 0.82, '#222', { line: '#111' }); } });
  A.define('rq_x_mtarp', { name: '地摊', variants: ['a', 'b', 'c'], geo: [0, 0, 0, 2, 1.4, 0.4], fp: [],
    draw(d, st, v) { const cols = { a: '#2f6fb3', b: '#c8372f', c: '#3a8a5a' }, c = cols[v];
      d.face([[0, 0, 0.01], [2, 0, 0.01], [2, 1.4, 0.01], [0, 1.4, 0.01]], c, shade(c, 0.6));
      if (v === 'a') d.heap(0.15, 0.15, 1.85, 1.25, 0.02, ['#4f9a3a', '#7cc04a', '#2f7a2a'], 0.9, { size: 2 });
      else if (v === 'b') for (let k = 0; k < 6; k++) d.box(0.15 + (k % 3) * 0.6, 0.2 + Math.floor(k / 3) * 0.55, 0.01, 0.6 + (k % 3) * 0.6, 0.6 + Math.floor(k / 3) * 0.55, 0.12, ['#e8b25a', '#d8d2c2', '#8a6a4a'][k % 3], { line: '#555' });
      else d.heap(0.15, 0.15, 1.85, 1.25, 0.02, ['#f2e2c4', '#c87a3a', '#e85b2a'], 0.85, { size: 2 });
      d.box(1.6, 1.0, 0, 1.9, 1.3, 0.35, '#e8e2d2', { line: '#777' }); } });
  // 小区大门 (transition pass, Leo 02:47): stone pillars + name beam facing the street (local -y), barrier arm, guard booth
  // inside the fence (local +y, east of the opening)
  const XQN = { rqhy: '榕桥花园', ngfh: '南关华府', hjya: '汇金雅苑' };
  A.define('rq_x_cgate', { name: '小区大门', variants: Object.keys(XQN), geo: [0, -0.4, 0, 10.3, 3.2, 4.2], fp: [[0, 0, 0.7, 0.8], [7.3, 0, 8, 0.8]],
    draw(d, st, v) {
      d.box(8.1, 0.8, 2.5, 10.2, 3.2, 2.68, '#6f767c', { line: '#3d4246' });
      d.box(8.3, 1.0, 0, 10, 3.0, 2.5, '#eef0ee', { line: '#8a9094' });
      d.face([[8.3, 0.99, 2.02], [10, 0.99, 2.02], [10, 0.99, 2.3], [8.3, 0.99, 2.3]], '#2f5f9a'); d.text('门岗', 8.75, 0.97, 2.06, 6, '#ffffff', { weight: 'bold' });
      d.face([[8.55, 0.99, 0.95], [9.75, 0.99, 0.95], [9.75, 0.99, 1.85], [8.55, 0.99, 1.85]], '#6f93a8', '#3d4a52');
      d.box(6.75, 0.85, 0, 7.05, 1.15, 1.05, '#d8d8d4', { line: '#777' });
      for (let k = 0; k < 6; k++) d.seg([6.75 - k * 0.95, 1.0, 0.98], [5.8 - k * 0.95, 1.0, 0.98], k % 2 ? '#f2f2ee' : '#d23a2a', 3);
      for (const x0 of [0, 7.3]) { d.box(x0, 0, 0, x0 + 0.7, 0.8, 3.3, '#d9d3c6', { line: '#8a8478' }); d.box(x0 - 0.05, -0.05, 3.3, x0 + 0.75, 0.85, 3.42, '#b9b2a4', { line: '#7a7468' }); }
      d.box(0, 0.12, 3.42, 8, 0.68, 4.12, '#5f6468', { line: '#33373a' });
      d.face([[0.9, 0.1, 3.5], [7.1, 0.1, 3.5], [7.1, 0.1, 4.04], [0.9, 0.1, 4.04]], '#7b5a22', '#3e2c10');
      const n = XQN[v] || v, sz = 11, w = d.textW(n, sz); d.text(n, 4 - w / 2, 0.08, 3.56, sz, '#f3d27a', { weight: 'bold', stroke: '#3e2c10' });
    } });
  // 交通信号灯 (Leo 02:38: signals at the new 南关路 junction): pole + mast arm + 3-lamp head (static), the lit lamp is a
  // dynamic overlay frame rq_x_siglamp/<face>/<r|y|g> drawn by SP.traffic at the head (only faces the camera sees: s, w)
  const SIG = { nb: [-2.3, 0, 's'], sb: [2.3, 0, 'n'], eb: [0, 5.3, 'w'], wb: [0, -5.3, 'e'] };
  const LAMP = { r: [5.62, '#ff4a3a'], y: [5.38, '#ffc23a'], g: [5.14, '#4dff8a'] };
  const sigGeo = (v) => { const [hx, hy] = SIG[v] || SIG.nb; return [Math.min(0, hx) - 0.3, Math.min(0, hy) - 0.3, 0, Math.max(0, hx) + 0.3, Math.max(0, hy) + 0.3, 6.1]; };
  // one type per arm direction (the sort box must follow the arm; piece geometry is per type, not per variant)
  for (const sv of Object.keys(SIG)) A.define('rq_x_signal_' + sv, { name: '交通信号灯', geo: sigGeo(sv), fp: [[-0.15, -0.15, 0.15, 0.15]],
    shadowOf: () => [[-0.1, -0.1], [0.1, -0.1], [0.76, 6.26], [0.76, 6.46], [0.56, 6.46], [-0.1, 0.1]],
    draw(d) {
      const v = sv, [hx, hy, face] = SIG[v];
      d.box(-0.12, -0.12, 0, 0.12, 0.12, 0.25, '#5a5f63', { line: '#2d3134' }); d.box(-0.07, -0.07, 0.25, 0.07, 0.07, 6.0, '#7d8489', { line: '#3f4447' });
      d.seg([0, 0, 5.95], [hx, hy, 5.95], '#6c7378', 3); d.seg([0, 0, 5.3], [hx * 0.45, hy * 0.45, 5.92], '#6c7378', 2);
      d.box(hx - 0.16, hy - 0.16, 4.95, hx + 0.16, hy + 0.16, 5.85, '#24282b', { line: '#0e1011' });
      if (face === 's' || face === 'w') for (const k of Object.keys(LAMP)) { const z = LAMP[k][0];
        if (face === 's') { d.disc(hx, hy - 0.17, z, 0.085, '#3a3f42', '#111'); d.box(hx - 0.12, hy - 0.26, z + 0.08, hx + 0.12, hy - 0.16, z + 0.11, '#1a1d1f'); }
        else { d.disc(hx - 0.17, hy, z, 0.085, '#3a3f42', '#111'); d.box(hx - 0.26, hy - 0.12, z + 0.08, hx - 0.16, hy + 0.12, z + 0.11, '#1a1d1f'); } }
      else d.box(face === 'n' ? hx - 0.2 : hx - 0.2, face === 'e' ? hy - 0.2 : hy - 0.2, 4.9, hx + 0.2, hy + 0.2, 4.95, '#1a1d1f');   // back plate rim
      d.box(-0.11, -0.2, 2.6, 0.11, -0.12, 3.15, '#24282b', { line: '#0e1011' });                                   // pedestrian head (dark)
    } });
  A.define('rq_x_siglamp', { name: '信号灯（亮）', variants: ['s', 'w'], states: Object.keys(LAMP), geo: [-0.3, -0.3, 4.9, 0.3, 0.3, 5.9], fp: [], shadow: false, fadeable: false,
    draw(d, st, v) { const [z, col] = LAMP[st] || LAMP.r;
      if (v === 's') { d.disc(0, -0.18, z, 0.13, 'rgba(255,255,255,0.0)'); d.disc(0, -0.18, z, 0.088, col, '#fff6d8'); }
      else { d.disc(-0.18, 0, z, 0.13, 'rgba(255,255,255,0.0)'); d.disc(-0.18, 0, z, 0.088, col, '#fff6d8'); } } });
  // 南关路 south-pavement bus stop sign (E4d): pole + blue board across the pavement, its west face (the one the camera sees)
  // carries 公交 + the stop name; the north-side stops use the E3 shelters. Names 未经Leo确认.
  const BUSN = { ngw: '南关路西', nge: '南关路东', wjq: '万家桥路' };
  A.define('rq_x_busstop', { name: '公交站牌', variants: Object.keys(BUSN), geo: [-0.2, -0.45, 0, 0.2, 0.45, 2.95], fp: [[-0.08, -0.08, 0.08, 0.08]],
    draw(d, st, v) {
      d.box(-0.05, -0.05, 0, 0.05, 0.05, 2.9, '#8a9196', { line: '#40464a' });
      d.box(-0.05, -0.42, 1.85, 0.05, 0.42, 2.85, '#1f5fa8', { line: '#0f2f55' });
      d.box(-0.06, -0.42, 2.55, 0.06, 0.42, 2.85, '#f4f6f8', { line: '#0f2f55' });
      d.text('公交', -0.065, 0.28, 2.6, 9, '#1f5fa8', { weight: 'bold', west: true });
      d.text(BUSN[v] || '', -0.065, 0.38, 2.05, 6, '#ffffff', { weight: 'bold', west: true });
    } });
  A.MODERN = { CW: Object.keys(CW), MF: Object.keys(MF), LOGO: Object.keys(LOGO), STALL: Object.keys(STALL) };
})(typeof window !== 'undefined' ? window : globalThis);
