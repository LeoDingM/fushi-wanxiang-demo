/* 榕桥区 E5 art (2026-10-18, Leo 16:42): 月湾新区 north of 月河 — mid-rise / high-rise residential compounds and a small CBD,
 * with a proper height transition (old low-rise -> 7-9F -> 11-18F 小区 -> 20F+ offices).
 * Everything is a VARIANT of an existing kit / district piece (RongqiaoArt.skin, prune: true -> frames only for what is placed):
 *   f_wall  hr_cream / hr_grey / hr_terra / hr_white   2010s high-rise residential cladding (windows, balconies and AC units stay
 *           separate f_window / f_balcony / f_ac objects, so every flat keeps the dynamic night-light schedule)
 *           of_stone / of_dark (+ _b: another lit-office pattern at night)  office facades: stone grid with deep windows and fins,
 *           dark metal panels with ribbon glazing; of_lobby (ground) double-height lobby glass with revolving door
 *   rq_cw_logo / rq_cw_logo_w  name panels of the new towers (+ _l lobby fascia plates)
 *   rq_h_gname  name plaque over the beam of the reused E3 小区 gate (stone pillars, beam, barrier arm, guard booth)
 * Roofs reuse the E4e roof kit (rq_m3_dtile / rq_m3_par / rq_m3_kit): a closed slab over the whole footprint with parapets or a
 * crown on every edge. All names / colours / layouts 未经Leo确认 (names are Grok's call per Leo). */
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
    return { W, pt, C, face, box, Q, seg, text, textW: (s, size) => d.textW(s, size), R: d.R };
  }
  const geoL = (rot, g) => (rot === 6 ? [g[1], -g[3], g[2], g[4], -g[0], g[5]] : g);
  const F = -0.04, WALLGEO = (rot) => geoL(rot, [0, -0.04, 0, 3, 0.35, 3]);
  // ------------------------------------------------------------------ high-rise residential cladding
  const HR = { hr_cream: ['#ece3cf', '#bdb3a0'], hr_grey: ['#c9c8c2', '#8f8f8a'], hr_terra: ['#b9704f', '#efe4d2'], hr_white: ['#f1f0ec', '#4b5156'] };
  A.skin('f_wall', { variants: Object.keys(HR), states: ['upper'], rots: [0, 6], prune: true, geo: WALLGEO,
    draw(d, st, v, rot) {
      const l = L(d, rot), R = l.R, [base, acc] = HR[v], Q = (a0, z0, a1, z1, f, li) => l.Q(F, a0, z0, a1, z1, f, li);
      l.box(0, F, 0, 3, 0.35, 3, base, { skin: true });
      if (v === 'hr_cream') {
        Q(0, 0, 3, 0.22, acc, null); Q(0, 2.72, 3, 2.9, shade(base, 0.93), null);
        l.seg([1, F, 0.22], [1, F, 2.72], shade(base, 0.9)); l.seg([2, F, 0.22], [2, F, 2.72], shade(base, 0.9));
      } else if (v === 'hr_grey') {
        for (let z = 0.75; z < 2.95; z += 0.75) l.seg([0, F, z], [3, F, z], shade(base, 0.86));
        for (const x of [1, 2]) l.seg([x, F, 0.12], [x, F, 2.9], shade(base, 0.88));
        for (let k = 0; k < 4; k++) { const x = Math.floor(R() * 3), z = Math.floor(R() * 3) * 0.75 + 0.08; Q(x, z, Math.min(3, x + 1), Math.min(2.9, z + 0.75), shade(base, 0.95 + R() * 0.08), null); }
        Q(0, 0, 3, 0.16, acc, null);
      } else if (v === 'hr_terra') {
        for (let z = 0.18, k = 0; z < 2.9; z += 0.16, k++) { l.seg([0, F, z], [3, F, z], shade(base, 0.86)); for (let x = (k % 2 ? 0.28 : 0.55); x < 2.9; x += 0.55) l.seg([x, F, z - 0.16], [x, F, z], shade(base, 0.78)); }
        Q(0, 0, 3, 0.26, acc, null); Q(2.72, 0.26, 3, 2.9, acc, null);
      } else {
        Q(0, 0, 3, 0.2, '#d7d6d0', null); Q(2.72, 0.2, 3, 2.9, acc, null); Q(0, 2.72, 2.72, 2.9, shade(base, 0.92), null);
        l.seg([1.36, F, 0.2], [1.36, F, 2.72], shade(base, 0.9));
      }
    } });
  // ------------------------------------------------------------------ office facades
  const OF = { of_stone: ['#d8ccb4', '#3b4a55', '#a99c84'], of_dark: ['#4a5157', '#6f8f9e', '#2c3135'] };
  for (const k of Object.keys(OF)) OF[k + '_b'] = OF[k];
  function office(l, v, lit) {
    const [c, g, d2] = OF[v], R = l.R, Q = (a0, z0, a1, z1, f, li) => l.Q(F, a0, z0, a1, z1, f, li);
    l.box(0, F, 0, 3, 0.35, 3, c, { skin: true });
    if (/^of_stone/.test(v)) {
      // ashlar field. Course joints stop short of x=0 and x=3 so stones read across the bay.
      for (let z = 0.22, k = 0; z < 2.92; z += 0.28, k++) {
        l.seg([0, F, z], [3, F, z], shade(c, 0.78));
        for (let x = (k % 2 ? 0.45 : 0.9); x < 2.85; x += 0.9) l.seg([x, F, z - 0.28], [x, F, z], shade(c, 0.72));
      }
      Q(0, 0, 3, 0.34, shade(c, 0.9), null);
      Q(0, 2.78, 3, 2.94, shade(d2, 1.15), null);
      for (const x0 of [0.28, 1.58]) {
        Q(x0, 0.48, x0 + 1.12, 2.62, lit ? '#f1dfae' : g, null);
        l.seg([x0, F, 0.48], [x0, F, 2.62], shade(c, 0.45), 2);
        l.seg([x0 + 1.12, F, 0.48], [x0 + 1.12, F, 2.62], shade(c, 0.45), 2);
        l.seg([x0, F, 2.62], [x0 + 1.12, F, 2.62], shade(c, 0.45), 2);
        l.seg([x0 + 0.56, F, 0.48], [x0 + 0.56, F, 2.62], shade(c, 0.55), 1);
        l.seg([x0, F, 1.55], [x0 + 1.12, F, 1.55], shade(c, 0.55), 1);
        Q(x0 - 0.04, 0.36, x0 + 1.16, 0.48, shade(d2, 1.25), null);
        if (!lit) { Q(x0, 0.48, x0 + 1.12, 0.85 + R() * 0.35, shade(g, 1.18), null); l.seg([x0 + 0.12, F, 2.4], [x0 + 0.55, F, 1.05], 'rgba(220,232,240,0.5)'); }
      }
      for (const x of [0, 1.5]) l.box(x - 0.06, -0.22, 0.08, x + 0.06, F, 2.92, d2, { line: false, top: shade(d2, 1.15) });
      return;
    }
    Q(0, 0, 3, 0.55, shade(c, 0.92), null);
    Q(0, 2.62, 3, 2.94, shade(c, 0.88), null);
    for (let x = 0.5; x < 2.9; x += 0.5) l.seg([x, F, 0.08], [x, F, 0.55], shade(c, 1.25));
    Q(0, 0.55, 3, 2.62, lit ? '#efe0b4' : g, null);
    if (!lit) { Q(0, 0.55, 3, 1.05 + R() * 0.4, shade(g, 0.82), null); l.seg([0.25 + R() * 0.3, F, 2.4], [1.2 + R() * 0.4, F, 0.85], 'rgba(230,240,245,0.5)'); }
    for (const x of [0, 0.75, 1.5, 2.25]) l.seg([x, F, 0.55], [x, F, 2.62], d2, x % 1.5 === 0 ? 2 : 1);
    l.seg([0, F, 1.55], [3, F, 1.55], shade(d2, 1.2), 1);
    l.seg([0, F, 0.42], [3, F, 0.42], shade(c, 1.3), 1);
  }
  A.skin('f_wall', { variants: Object.keys(OF), states: ['upper'], rots: [0, 6], prune: true, geo: (rot) => geoL(rot, [0, -0.3, 0, 3, 0.35, 3]),
    draw(d, st, v, rot) { office(L(d, rot), v, false); },
    emit(d, st, v, rot) { const l = L(d, rot); if (/_b$/.test(v)) return false; if (/^of_stone/.test(v)) { l.Q(F, 1.6, 0.6, 2.75, 2.7, 'rgba(255,228,172,0.8)'); return; } l.Q(F, 0.75, 0.75, 2.25, 2.55, 'rgba(255,232,178,0.78)'); } });
  function lobbyGlass(l) {
    const Q = (a0, z0, a1, z1, f) => l.Q(F, a0, z0, a1, z1, f, null);
    l.box(0, F, 0, 3, 0.35, 3, '#3e4549', { skin: true });
    Q(0, 0.18, 3, 2.82, '#7d9cab'); Q(0, 0, 3, 0.18, '#2b2f32'); Q(0, 2.72, 3, 2.94, '#2b2f32');
    for (const x of [0, 0.75, 1.5, 2.25]) l.seg([x, F, 0.18], [x, F, 2.72], '#1f2427', x % 1.5 === 0 ? 2 : 1);
    l.seg([0, F, 1.5], [3, F, 1.5], '#1f2427', 1);
    l.seg([0.3, F, 2.5], [1.05, F, 0.7], 'rgba(235,245,250,0.55)');
  }
  function entryBay(l, kind) {
    const Q = (a0, z0, a1, z1, f) => l.Q(F, a0, z0, a1, z1, f, null);
    const stone = kind === 'mall' ? '#e4e1d8' : kind === 'cw' ? '#2a3136' : '#d9cbb3';
    const jamb = kind === 'cw' ? '#14181b' : '#3a342c';
    const band = kind === 'mall' ? '#d35400' : '#24323c';
    l.box(0, F, 0, 3, 0.42, 3, stone, { skin: true });
    Q(0, 0, 3, 0.22, kind === 'cw' ? '#15191c' : '#4a4034');
    Q(0.22, 0.22, 2.78, 2.58, '#9bb6c2');
    Q(0.55, 0.22, 2.45, 2.15, '#d5e3ea');
    l.seg([1.5, F, 0.22], [1.5, F, 2.15], jamb, 2);
    l.seg([0.55, F, 2.15], [2.45, F, 2.15], jamb, 2);
    l.seg([0.22, F, 0.22], [0.22, F, 2.85], jamb, 3);
    l.seg([2.78, F, 0.22], [2.78, F, 2.85], jamb, 3);
    l.seg([0.22, F, 2.58], [2.78, F, 2.58], jamb, 2);
    Q(0.22, 2.58, 2.78, 2.9, band);
    l.seg([1.32, F, 1.02], [1.32, F, 1.16], '#e8d39a', 2);
    l.seg([1.68, F, 1.02], [1.68, F, 1.16], '#e8d39a', 2);
    l.seg([0.7, F, 2.35], [1.25, F, 0.7], 'rgba(235,245,250,0.6)');
    if (kind === 'office') { Q(0.4, 0.22, 2.6, 0.7, '#c4b496'); Q(1.05, 0.7, 1.95, 0.95, '#4a3a2a'); }
  }
  A.skin('f_wall', { variants: ['of_lobby'], states: ['ground'], rots: [0, 6], prune: true, geo: WALLGEO,
    draw(d, st, v, rot) { lobbyGlass(L(d, rot)); },
    emit(d, st, v, rot) { const l = L(d, rot); l.Q(F, 0.1, 0.4, 2.9, 2.75, 'rgba(255,236,190,0.85)'); } });
  A.skin('f_wall', { variants: ['of_lobby_door', 'mall_door', 'cw_entry'], states: ['ground'], rots: [0, 6], prune: true, geo: (rot) => geoL(rot, [0, -0.08, 0, 3, 0.45, 3]),
    draw(d, st, v, rot) { entryBay(L(d, rot), v === 'mall_door' ? 'mall' : v === 'cw_entry' ? 'cw' : 'office'); },
    emit(d, st, v, rot) { const l = L(d, rot); l.Q(F, 0.4, 0.4, 2.6, 2.5, 'rgba(255,232,180,0.9)'); } });
  // ------------------------------------------------------------------ tower name panels
  const LOGO5 = { ywjr: ['月湾金融中心', '#f4f6f6', '#1d3d5c'], ywgj: ['月湾国际', '#f2d27a', '#2a2a2a'], hbkc: ['槐北科创大厦', '#ffffff', '#24445e'], ywtd: ['月湾天地', '#ffffff', '#c0392b'],
    // E5b
    ywh: ['月湾汇', '#ffffff', '#d35400'], ywzx: ['月湾中心', '#eef4f8', '#20323f'], ywsw: ['月湾商务广场', '#f6e3b0', '#3a2a14'], ywjd: ['月湾酒店', '#f2d27a', '#2a2a2a'], rxkj: ['榕溪科技大厦', '#ffffff', '#1f4d3a'] };
  const PANEL = new Set(['ywtd', 'ywh']);   // malls: a coloured sign panel behind the letters
  function logo(d, st, v, west, lit) {
    const lobby = /_l$/.test(v), k = lobby ? v.slice(0, -2) : v, [s, col, bg] = LOGO5[k];
    if (lobby) { const w = d.textW(s, 12), off = Math.max(0.1, (7 - w) / 2); if (!lit) d.face([[off - 0.3, -0.1, 0.02], [off + w + 0.3, -0.1, 0.02], [off + w + 0.3, -0.1, 0.62], [off - 0.3, -0.1, 0.62]], '#22303a', '#11181d'); d.text(s, off, -0.12, 0.12, 12, lit ? '#ffffff' : '#f2f4f4'); return; }
    const size = s.length > 5 ? 18 : 22, w = d.textW(s, size), off = Math.max(0.2, (7 - w) / 2);
    if (PANEL.has(k) && !lit) { if (west) d.face([[-0.1, -0.2, 0.05], [-0.1, -6.8, 0.05], [-0.1, -6.8, 1.5], [-0.1, -0.2, 1.5]], bg, shade(bg, 0.6)); else d.face([[0.2, -0.1, 0.05], [6.8, -0.1, 0.05], [6.8, -0.1, 1.5], [0.2, -0.1, 1.5]], bg, shade(bg, 0.6)); }
    if (west) d.text(s, -0.12, -off, 0.35, size, col, { west: true, stroke: lit ? null : 'rgba(0,0,0,0.35)' }); else d.text(s, off, -0.12, 0.35, size, col, { stroke: lit ? null : 'rgba(0,0,0,0.35)' });
  }
  A.skin('rq_cw_logo', { variants: Object.keys(LOGO5).concat(Object.keys(LOGO5).map((k) => k + '_l')), states: ['default'], rots: [0], prune: true, geo: (rot, st, v) => (/_l$/.test(v) ? [0, -0.15, 0, 7, 0, 0.7] : [0, -0.15, 0, 7, 0, 1.6]),   // lobby plates are 0.6 m tall: a lower frame saves atlas rows
    draw(d, st, v) { logo(d, st, v, false, false); }, emit(d, st, v) { logo(d, st, v, false, true); } });
  A.skin('rq_cw_logo_w', { variants: Object.keys(LOGO5), states: ['default'], rots: [0], prune: true, geo: () => [-0.15, -7, 0, 0, 0, 1.6],
    draw(d, st, v) { logo(d, st, v, true, false); }, emit(d, st, v) { logo(d, st, v, true, true); } });
  // ------------------------------------------------------------------ 小区 gate name plaques
  // atlas budget: the new compounds reuse the E3 gate build (rq_x_cgate/ngfh: pillars, beam, barrier arm, guard booth) and get their
  // own name on a plaque piece that exactly covers the beam's lettering. The plaque stands 0.6 m nearer the camera along the view
  // ray (x - s, y - s, z + 2 s KY / PZ projects onto the same pixels), so it always sorts in front of the gate it labels.
  const XQ5 = { ywjy: '月湾嘉园', hbmy: '槐北名苑', ywyf: '月湾悦府', hbjy: '槐北佳苑' }, GS = 0.6, GZ = 2 * GS * A.KY / A.PZ;
  A.define('rq_h_gname', { name: '小区名牌', variants: Object.keys(XQ5), prune: true, geo: [0.9, 0.08, 3.5 + GZ, 7.1, 0.12, 4.04 + GZ], fp: [], shadow: false, noShadow: true,
    draw(d, st, v) { const z0 = 3.5 + GZ, z1 = 4.04 + GZ; d.face([[0.9, 0.1, z0], [7.1, 0.1, z0], [7.1, 0.1, z1], [0.9, 0.1, z1]], v === 'ywyf' ? '#1f2a33' : '#7b5a22', '#3e2c10');
      const n = XQ5[v], sz = 11, w = d.textW(n, sz); d.text(n, 4 - w / 2, 0.08, 3.56 + GZ, sz, v === 'ywyf' ? '#e8edf0' : '#f3d27a', { weight: 'bold', stroke: '#3e2c10' }); } });
  // ------------------------------------------------------------------ E5b 月湾汇: poster bays, roof decks, rooftop car ramp
  // (Leo: no empty flat decks) the mall roof becomes a parking deck, badminton courts, a kids' area and a skylit atrium roof
  const AD = { mall_ad1: ['#1f6fb2', '#ffd23f', '夏日'], mall_ad2: ['#1f6fb2', '#ffffff', '焕新'], mall_ad3: ['#c2185b', '#ffffff', '美食'], mall_ad4: ['#c2185b', '#ffe082', '广场'] };
  A.skin('f_wall', { variants: Object.keys(AD), states: ['upper'], rots: [0, 6], prune: true, geo: (rot) => geoL(rot, [0, -0.3, 0, 3, 0.35, 3]),
    draw(d, st, v, rot) { const l = L(d, rot), [bg, fg, s] = AD[v], first = /[13]$/.test(v);
      l.box(0, F, 0, 3, 0.35, 3, '#d9d6cf', { skin: true });
      l.Q(-0.08, first ? 0.15 : 0, 0.2, first ? 3 : 2.85, 2.85, bg, null);                       // two bays make one 6 m billboard
      l.Q(-0.09, first ? 0.15 : 0, 0.2, first ? 3 : 2.85, 0.45, shade(bg, 0.7), null);
      for (let k = 0; k < 6; k++) l.seg([0.3 + k * 0.45, -0.1, 2.5], [0.55 + k * 0.45, -0.1, 2.75], 'rgba(255,255,255,0.35)', 2);
      l.text(s, first ? 0.75 : 0.25, -0.12, 0.85, 26, fg, { weight: 'bold', stroke: 'rgba(0,0,0,0.35)' }); },
    emit(d, st, v, rot) { const l = L(d, rot), first = /[13]$/.test(v); l.Q(-0.1, first ? 0.15 : 0, 0.5, first ? 3 : 2.85, 2.6, 'rgba(255,244,214,0.42)'); } });
  A.define('rq_e5_deck', { name: '屋面', variants: ['park', 'aisle', 'court_s', 'court_n'], geo: [0, 0, -0.1, 6, 4.5, 0.05], fp: [], shadow: false, layer: 'sorted', draw(d, st, v) {
    const R = d.R, W = '#f2f2ee';
    if (v === 'park' || v === 'aisle') {
      d.flat(0, 0, 6, 4.5, 0.02, '#76797c', null); for (let k = 0; k < 60; k++) d.px(R() * 6, R() * 4.5, 0.025, shade('#76797c', 0.85 + R() * 0.3), 2, 1);
      if (v === 'park') { for (const x of [0.3, 3.0, 5.7]) d.flat(x - 0.06, 0.35, x + 0.06, 4.5, 0.03, W, null); d.flat(0.3, 4.36, 5.7, 4.48, 0.03, W, null);
        for (const x of [1.65, 4.35]) d.box(x - 0.7, 3.75, 0, x + 0.7, 3.95, 0.12, '#e2b52e', { line: '#8a6a12' }); }
      else { for (let x = 0.3; x < 6; x += 2) d.flat(x, 2.18, x + 1.1, 2.32, 0.03, W, null);
        d.face([[2.2, 0.7, 0.03], [3.2, 0.7, 0.03], [3.2, 0.45, 0.03], [3.9, 1.0, 0.03], [3.2, 1.55, 0.03], [3.2, 1.3, 0.03], [2.2, 1.3, 0.03]], W, null); }
      d.seg([0, 0, 0.03], [6, 0, 0.03], 'rgba(40,40,40,0.25)'); return; }
    if (v === 'court_s' || v === 'court_n') {
      const S = v === 'court_s', y0 = S ? 0.3 : 0, y1 = S ? 4.5 : 4.2;
      d.flat(0, 0, 6, 4.5, 0.02, '#2f7a5a', null); d.flat(0.3, y0, 5.7, y1, 0.025, '#3f9670', null);
      const ln = (a, b) => d.seg([a[0], a[1], 0.03], [b[0], b[1], 0.03], W, 2);
      ln([0.3, y0], [0.3, y1]); ln([5.7, y0], [5.7, y1]); ln([0.75, y0], [0.75, y1]); ln([5.25, y0], [5.25, y1]);
      if (S) { ln([0.3, 0.3], [5.7, 0.3]); ln([0.3, 1.0], [5.7, 1.0]); ln([0.3, 2.5], [5.7, 2.5]); ln([3, 0.3], [3, 2.5]); }
      else { ln([0.3, 4.2], [5.7, 4.2]); ln([0.3, 3.5], [5.7, 3.5]); ln([0.3, 2.0], [5.7, 2.0]); ln([3, 2.0], [3, 4.2]); }
      return; } } });
  A.define('rq_e5_sky', { name: '采光天窗', geo: [0, 0, -0.1, 6, 4.5, 1.3], fp: [], shadow: false, layer: 'sorted', draw(d) {
    d.flat(0, 0, 6, 4.5, 0.02, '#a9a69d', null); d.box(0.5, 0.5, 0, 5.5, 4.0, 0.35, '#8d9396', { line: '#5a6062' });   // skylight ridge over the atrium
    d.face([[0.6, 0.6, 0.35], [5.4, 0.6, 0.35], [5.4, 2.25, 1.25], [0.6, 2.25, 1.25]], '#9cc6da', '#4d6470');
    d.face([[0.6, 2.25, 1.25], [5.4, 2.25, 1.25], [5.4, 3.9, 0.35], [0.6, 3.9, 0.35]], '#7da8bd', '#4d6470');
    d.face([[0.6, 0.6, 0.35], [0.6, 2.25, 1.25], [0.6, 3.9, 0.35]], '#8fb7ca', '#4d6470');
    for (let x = 1.2; x < 5.4; x += 0.6) d.seg([x, 0.6, 0.35], [x, 2.25, 1.25], '#4d6470'); d.seg([0.6, 2.25, 1.25], [5.4, 2.25, 1.25], '#dfe8ec', 2);
    d.seg([1.0, 0.8, 0.5], [2.2, 1.9, 1.1], 'rgba(255,255,255,0.6)', 2); },
    emit(d) { d.face([[0.6, 0.6, 0.35], [5.4, 0.6, 0.35], [5.4, 2.25, 1.25], [0.6, 2.25, 1.25]], 'rgba(255,226,170,0.7)'); } });
  A.define('rq_e5_net', { name: '羽毛球网', geo: [0, -0.1, 0, 6, 0.1, 1.6], fp: [], shadow: false, draw(d) {   // separate piece: a tall deck tile would sort over the parked cars
    for (const x of [0.12, 5.88]) d.box(x - 0.05, -0.05, 0, x + 0.05, 0.05, 1.55, '#d8dcdc', { line: '#6a6f70' });
    d.face([[0.15, 0, 0.8], [5.85, 0, 0.8], [5.85, 0, 1.55], [0.15, 0, 1.55]], 'rgba(235,240,240,0.35)', '#e8eded'); d.seg([0.15, 0, 1.55], [5.85, 0, 1.55], '#ffffff', 2); } });
  A.define('rq_e5_ramp', { name: '屋顶停车场坡道', variants: ['up', 'land'], geo: [0, 0, -0.45, 4, 6, 3.4], fp: [], shadow: false, draw(d, st, v) {
    if (v === 'land') {                                      // flat landing at deck level: parapets on the east and north, open to the west aisle
      d.face([[0, 0, -0.4], [4, 0, -0.4], [4, 0, 0], [0, 0, 0]], '#9c9a93', '#5f5d57'); d.face([[0, 0, -0.4], [0, 4.5, -0.4], [0, 4.5, 0], [0, 0, 0]], '#8f8d86', '#5f5d57');
      d.flat(0, 0, 4, 4.5, 0, '#6f7275', '#45484a'); d.face([[1.2, 1.2, 0.02], [2.8, 1.2, 0.02], [2.8, 0.9, 0.02], [1.6, 2.0, 0.02], [2.8, 3.1, 0.02], [2.8, 2.8, 0.02], [1.2, 2.8, 0.02]], '#f2f2ee', null);
      d.box(3.75, 0, 0, 4, 4.5, 1.1, '#c9c6bd', { line: '#77746c', top: '#ddd9cf' }); d.box(0, 4.25, 0, 3.75, 4.5, 1.1, '#c9c6bd', { line: '#77746c', top: '#ddd9cf' }); return; }
    const H = 2.25, zt = (y) => (y / 6) * H;
    d.face([[0, 0, -0.4], [4, 0, -0.4], [4, 0, 0], [0, 0, 0]], '#9c9a93', '#5f5d57');
    d.face([[0, 0, -0.4], [0, 6, H - 0.4], [0, 6, H], [0, 0, 0]], '#8f8d86', '#5f5d57');
    d.face([[0, 0, 0], [4, 0, 0], [4, 6, H], [0, 6, H]], '#6f7275', '#45484a');
    for (let y = 0.3; y < 6; y += 1.5) d.seg([1.95, y, zt(y) + 0.02], [1.95, y + 0.8, zt(y + 0.8) + 0.02], '#f2f2ee', 2);
    d.face([[0, 0, 0], [0, 6, H], [0, 6, H + 0.3], [0, 0, 0.3]], '#c9c6bd', '#77746c'); d.face([[0, 0, 0.3], [0.2, 0, 0.3], [0.2, 6, H + 0.3], [0, 6, H + 0.3]], '#ddd9cf', '#77746c');
    d.face([[3.75, 0, 0], [3.75, 6, H], [3.75, 6, H + 1.1], [3.75, 0, 1.1]], '#c9c6bd', '#77746c'); d.face([[3.75, 0, 1.1], [4, 0, 1.1], [4, 6, H + 1.1], [3.75, 6, H + 1.1]], '#ddd9cf', '#77746c');
    d.seg([3.7, 0, 1.0], [3.7, 6, H + 1.0], '#e2b52e', 2); } });
  A.E5 = { HR: Object.keys(HR), OF: Object.keys(OF), LOGO: Object.keys(LOGO5), XQ: Object.keys(XQ5) };
})(typeof window !== 'undefined' ? window : globalThis);
