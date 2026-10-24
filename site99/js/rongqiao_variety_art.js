/* 榕桥区 E1v variety pass (Leo 2026-10-17 23:36 / 23:38): old districts are varied. Extra VARIANTS for the kit facade pieces
 * (painted by RongqiaoArt.skin, the object keeps its kit type so save identity is unchanged):
 *   f_wall     materials: white tile, beige/yellow paint, grey cement, mosaic, repainted pink / light grey, weathered streaks,
 *              dark 80s brick (kit base/w1/w2 brick and p1 plaster stay in the mix)
 *   f_window   new aluminium (n1) / white uPVC with flower box (n2), rusty 防盗网 cage (g), white cage with plants (gw), drying rack (rk)
 *   f_balcony  renovated glass railing + many potted plants (g1), + hanging swing chair (g2), old aluminium enclosure (o1),
 *              old open balcony behind a rusty cage with clutter (o2); renovated ones glow warm at night
 *   f_ac       rusty old unit (rust)
 *   b_roof_a / b_roof_b  flat roof with water tanks + stair hut (r_tank), rooftop 加建 steel shed (r_shed), pitched tile roof
 *              (r_pitch), solar water heaters (r_solar), rooftop vegetable garden / greenery (r_green)
 * plus rq_v_roof (9x9 and 12x12 footprints, so building widths/depths vary). Design choices 未经Leo确认. */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A || !A.skin) return;
  const shade = A.shade, KX = A.KX, KY = A.KY;
  /** local facade frame -> world: rot 0 face on y = const reading +x; rot 6 face on x = const reading -y (kit convention) */
  function L(d, rot) {
    const W = rot === 6, pt = (lx, ly, z) => (W ? [ly, -lx, z] : [lx, ly, z]), C = (c) => (W && c && c[0] === '#' ? shade(c, 0.84) : c);
    const face = (pts, fill, line, lw) => d.face(pts.map((p) => pt(...p)), C(fill), line, lw);
    const box = (lx0, ly0, z0, lx1, ly1, z1, col, o = {}) => {
      const o2 = Object.assign({}, o);
      if (o.skin) { lx0 -= 0.07; lx1 += 0.07; if (W) { o2.noS = true; o2.noW = false; } else { o2.noW = true; o2.noS = false; } o2.noTop = true; o2.line = false; delete o2.skin; }
      return W ? d.box(ly0, -lx1, z0, ly1, -lx0, z1, col, o2) : d.box(lx0, ly0, z0, lx1, ly1, z1, col, o2);
    };
    const Q = (ly, a0, z0, a1, z1, fill, line) => face([[a0, ly, z0], [a1, ly, z0], [a1, ly, z1], [a0, ly, z1]], fill, line);   // quad on a face plane
    const seg = (a, b, col, lw) => d.seg(pt(...a), pt(...b), C(col), lw);
    const disc = (lx, ly, z, r, f, l) => d.disc(...pt(lx, ly, z), r, C(f), l);
    const px = (lx, ly, z, col, w, h) => d.px(...pt(lx, ly, z), C(col), w, h);
    return { W, pt, C, face, box, Q, seg, disc, px, R: d.R };
  }
  const geoL = (rot, g) => (rot === 6 ? [g[1], -g[3], g[2], g[4], -g[0], g[5]] : g);
  // ------------------------------------------------------------------ f_wall materials
  const MAT = {
    m_white: '#e8e6de', m_beige: '#dcc38c', m_cement: '#a8a79d', m_mosaic: '#a6c6bd', m_pink: '#e4b39f', m_grey: '#d2d5d3', m_stain: '#d6cbae', m_brick2: '#8c5b45',
  };
  A.skin('f_wall', { variants: Object.keys(MAT), states: ['upper', 'ground'], rots: [0, 6], geo: (rot) => geoL(rot, [0, -0.04, 0, 3, 0.35, 3]), draw(d, st, v, rot) {
    const l = L(d, rot), R = l.R, base = MAT[v], F = -0.04, Q = (a0, z0, a1, z1, f, li) => l.Q(F, a0, z0, a1, z1, f, li);
    l.box(0, F, 0, 3, 0.35, 3, base, { skin: true });
    if (v === 'm_white') { for (let z = 0.3; z < 2.95; z += 0.3) l.seg([0, F, z], [3, F, z], '#cfcbc0'); for (let x = 0.3; x < 2.95; x += 0.3) l.seg([x, F, 0.08], [x, F, 2.95], '#d6d2c8');
      for (let k = 0; k < 3; k++) { const x = 0.7 + R() * 1.6; l.seg([x, F, 0.78], [x, F, 0.78 - 0.3 - R() * 0.5], 'rgba(150,108,70,0.55)'); } }
    else if (v === 'm_mosaic') { for (let x = 0; x < 3; x += 0.15) for (let z = 0; z < 2.95; z += 0.15) { const r = R(); Q(x, z, Math.min(3, x + 0.15), Math.min(2.95, z + 0.15), r < 0.03 ? '#e9ece6' : shade(base, 0.95 + r * 0.09), null); } }
    else if (v === 'm_cement') { for (let k = 0; k < 9; k++) { const x = R() * 2.6, z = R() * 2.5; Q(x, z, Math.min(2.95, x + 0.3 + R() * 0.6), Math.min(2.9, z + 0.2 + R() * 0.4), shade(base, R() < 0.5 ? 0.88 : 1.07), null); } for (let z = 0.75; z < 2.9; z += 0.75) l.seg([0, F, z], [3, F, z], shade(base, 0.9)); }
    else if (v === 'm_beige') { for (let k = 0; k < 6; k++) { const x = R() * 2.4, z = R() * 2.3; Q(x, z, Math.min(2.95, x + 0.4 + R() * 0.6), Math.min(2.9, z + 0.3 + R() * 0.5), shade(base, 1.06), null); } Q(0, 0, 3, 0.5, 'rgba(110,85,50,0.28)', null); }
    else if (v === 'm_stain') { for (let k = 0; k < 12; k++) { const x = 0.1 + R() * 2.7, len = 0.4 + R() * 2.0; l.seg([x, F, 2.9], [x, F, Math.max(0.15, 2.9 - len)], 'rgba(55,50,44,0.5)', R() < 0.3 ? 2 : 1); } for (let k = 0; k < 3; k++) { const x = R() * 2.4, z = R() * 2; Q(x, z, x + 0.5, z + 0.4, 'rgba(90,100,70,0.3)', null); } }
    else if (v === 'm_brick2') { for (let z = 0.2, k = 0; z < 2.95; z += 0.2, k++) { l.seg([0, F, z], [3, F, z], '#b4a596'); for (let x = (k % 2 ? 0.25 : 0.5); x < 2.95; x += 0.5) l.seg([x, F, z - 0.2], [x, F, z], '#a69585'); } for (let k = 0; k < 10; k++) { const x = 0.1 + R() * 2.6, z = 0.1 + R() * 2.6; Q(x, z, x + 0.25, z + 0.1, shade(base, 0.8 + R() * 0.4), null); } }
    else if (v === 'm_pink' || v === 'm_grey') { Q(0, 2.55, 3, 2.72, v === 'm_pink' ? '#f4ece4' : '#6f7c86', null); if (R() < 0.5) Q(0, 0.12, 3, 0.2, shade(base, 0.9), null); for (const x of [1, 2]) l.seg([x, F, 0.2], [x, F, 2.55], shade(base, 0.92)); }
    Q(0, 0, 3, 0.08, shade(base, 0.8), null);
    if (st === 'ground') { Q(0, 0, 3, 0.62, v === 'm_white' || v === 'm_pink' || v === 'm_grey' ? '#8d8a83' : '#6d6862', null); l.seg([0, F, 0.62], [3, F, 0.62], '#4f4b46', 2); for (let x = 0.6; x < 2.95; x += 0.6) l.seg([x, F, 0], [x, F, 0.62], '#57534d'); }
  } });
  // ------------------------------------------------------------------ f_window styles
  const WIN = ['n1', 'n2', 'g', 'gw', 'rk'];
  function glass(l, F, x0, z0, x1, z1, lit, tint) {
    l.Q(F, x0, z0, x1, z1, lit ? '#f6d48a' : tint || '#5f7a86');
    if (!lit) l.seg([x0 + 0.2, F, z1 - 0.1], [x0 + 0.7, F, z0 + 0.3], 'rgba(220,235,240,0.6)');
    else l.Q(F, x0, z0, x1, z0 + 0.25, '#e8b964');
  }
  function cage(l, x0, z0, x1, z1, out, col) {
    // protruding 防盗网 box: front plane ly = -out, side planes at x0 / x1, top plane
    for (let x = x0; x <= x1 + 0.001; x += 0.13) { l.seg([x, -out, z0], [x, -out, z1], col); l.seg([x, -out, z1], [x, -0.06, z1], col); }
    for (const z of [z0, z0 + (z1 - z0) * 0.45, z1]) { l.seg([x0, -out, z], [x1, -out, z], col, z === z0 ? 2 : 1); l.seg([x0, -out, z], [x0, -0.06, z], col); }
    for (let y = -0.06; y >= -out; y -= 0.13) l.seg([x0, y, z0], [x0, y, z1], col);
  }
  function pot(l, x, y, z, s, leaf, flower) {
    l.box(x - 0.09 * s, y - 0.09 * s, z, x + 0.09 * s, y + 0.09 * s, z + 0.16 * s, '#b0603d', { line: '#5e2f1d' });
    for (let k = 0; k < 4; k++) l.disc(x + (l.R() - 0.5) * 0.18 * s, y + (l.R() - 0.5) * 0.1, z + 0.22 * s + l.R() * 0.18 * s, 0.09 * s, shade(leaf || '#4f9a43', 0.8 + l.R() * 0.4), '#2c5a27');
    if (flower) l.px(x, y, z + 0.4 * s, flower, 2, 2);
  }
  A.skin('f_window', { variants: WIN, states: ['intact', 'lit'], rots: [0, 6], soft: false, geo: (rot) => geoL(rot, [0.35, -0.75, 0.55, 2.65, 0.32, 2.85]), draw(d, st, v, rot) {
    const l = L(d, rot), lit = st === 'lit', F = -0.05, x0 = 0.55, x1 = 2.45, z0 = 0.8, z1 = 2.62;
    if (v === 'n1') { l.Q(F, x0 - 0.06, z0 - 0.06, x1 + 0.06, z1 + 0.06, '#3f464b'); glass(l, F, x0 + 0.04, z0 + 0.04, x1 - 0.04, z1 - 0.04, lit, '#6a8c9a'); l.seg([1.5, F, z0], [1.5, F, z1], '#3f464b', 2); l.seg([x0, F, 1.9], [x1, F, 1.9], '#3f464b'); l.box(x0 - 0.1, -0.2, z0 - 0.12, x1 + 0.1, -0.04, z0 - 0.04, '#cfd3d4'); }
    else if (v === 'n2') { l.Q(F, x0 - 0.08, z0 - 0.08, x1 + 0.08, z1 + 0.08, '#f4f4f0', '#9aa0a0'); glass(l, F, x0 + 0.06, z0 + 0.06, x1 - 0.06, z1 - 0.06, lit, '#6f93a0'); l.seg([1.5, F, z0], [1.5, F, z1], '#f4f4f0', 2);
      l.box(x0, -0.32, z0 - 0.3, x1, -0.05, z0 - 0.05, '#7a5a3c', { line: '#3e2a18' }); for (let x = x0 + 0.2; x < x1; x += 0.34) pot(l, x, -0.19, z0 - 0.05, 0.8, '#4f9a43', ['#e04a6a', '#f2c84b', '#f4f0e8'][Math.floor(l.R() * 3)]); }
    else {
      l.Q(F, x0 - 0.05, z0 - 0.05, x1 + 0.05, z1 + 0.05, v === 'g' ? '#7d6a55' : '#b9b5aa'); glass(l, F, x0, z0, x1, z1, lit, v === 'g' ? '#55707a' : '#5f7a86');
      l.seg([1.5, F, z0], [1.5, F, z1], '#8a8e8e', 2); l.seg([1.0, F, z0], [1.0, F, z1], '#8a8e8e'); l.seg([2.0, F, z0], [2.0, F, z1], '#8a8e8e');
      if (v === 'g') { cage(l, x0 - 0.12, z0 - 0.2, x1 + 0.12, z1 + 0.1, 0.5, '#6b4a33'); l.Q(-0.5, x0 - 0.12, z0 - 0.2, x1 + 0.12, z0 - 0.12, 'rgba(120,70,40,0.9)'); for (let k = 0; k < 3; k++) l.box(x0 + k * 0.6, -0.42, z0 - 0.12, x0 + k * 0.6 + 0.35, -0.1, z0 + 0.12, ['#c9b48a', '#8aa0b0', '#d0d0c8'][k], { line: '#555' }); l.seg([x0 + 0.3, -0.5, z1 + 0.1], [x0 + 0.1, -0.5, z0 - 0.7], 'rgba(110,70,40,0.6)'); }
      else if (v === 'gw') { cage(l, x0 - 0.12, z0 - 0.2, x1 + 0.12, z1 + 0.1, 0.45, '#e6e6e0'); for (let x = x0 + 0.1; x < x1; x += 0.3) pot(l, x, -0.28, z0 - 0.18, 0.9, l.R() < 0.5 ? '#4f9a43' : '#6aa84f', l.R() < 0.4 ? '#e04a6a' : null); for (let k = 0; k < 5; k++) l.seg([x0 + l.R() * 1.9, -0.45, z1 + 0.1], [x0 + l.R() * 1.9, -0.45, z1 - 0.3 - l.R() * 0.6], '#4f9a43', 2); }
      else if (v === 'rk') { for (const y of [-0.15, -0.75]) l.seg([x0 - 0.2, y, z1 + 0.05], [x1 + 0.2, y, z1 + 0.05], '#8f9496', 2); l.seg([x0 - 0.2, -0.75, z1 + 0.05], [x0 - 0.2, -0.05, z1 + 0.05], '#8f9496'); l.seg([x1 + 0.2, -0.75, z1 + 0.05], [x1 + 0.2, -0.05, z1 + 0.05], '#8f9496');
        const cols = ['#b85a4a', '#5a74a8', '#ecebe2', '#d8c27a', '#7a9a7a', '#8a7a9a', '#3c3c44']; let x = x0; while (x < x1 - 0.1) { const w = 0.14 + l.R() * 0.16, c = cols[Math.floor(l.R() * cols.length)]; l.seg([x + w / 2, -0.75, z1 + 0.05], [x + w / 2, -0.75, z1 - 0.05], '#666'); l.Q(-0.75, x, z1 - 0.35 - l.R() * 0.45, x + w, z1 - 0.05, c, shade(c, 0.6)); x += w + 0.12 + l.R() * 0.2; } }
    }
  }, emit(d, st, v, rot) { if (st !== 'lit') return false; const l = L(d, rot); l.Q(-0.05, 0.6, 0.85, 2.4, 2.57, v === 'n1' || v === 'n2' ? '#ffd38a' : '#ffe2a0'); } });
  // ------------------------------------------------------------------ f_balcony: renovated / old
  const BAL = ['g1', 'g2', 'o1', 'o2'];
  A.skin('f_balcony', { variants: BAL, states: ['default', 'laundry'], rots: [0, 6], soft: true, geo: (rot) => geoL(rot, [0.05, -1.1, -0.1, 2.95, 0.05, 2.95]), draw(d, st, v, rot) {
    const l = L(d, rot), R = l.R, X0 = 0.14, X1 = 2.86, Y = -0.98, reno = v === 'g1' || v === 'g2';
    // back: door/window to the room
    l.Q(-0.03, 0.45, 0.15, 2.55, 2.45, reno ? '#3f464b' : '#7d7d72'); glass(l, -0.035, 0.52, 0.2, 2.48, 2.38, false, reno ? '#7a9aa6' : '#566f78'); l.seg([1.5, -0.035, 0.2], [1.5, -0.035, 2.38], reno ? '#3f464b' : '#8a8e8e', 2);
    l.box(X0, Y, 0, X1, 0, 0.15, reno ? '#e6e3dc' : '#b4b0a5', { line: '#6f6c66' });                       // slab
    if (reno) {
      l.box(X0, Y, 2.62, X1, 0, 2.78, '#e9e6df', { line: '#8a8780', noTop: false });                           // slab above (ceiling edge)
      // plants inside: tall monstera / olive in corners, pots along the rail, hanging pothos
      l.box(0.3, -0.35, 0.15, 0.62, -0.1, 0.55, '#d8d3c8', { line: '#7a766d' }); for (let k = 0; k < 10; k++) l.disc(0.46 + (R() - 0.5) * 0.5, -0.22, 0.75 + R() * 0.9, 0.13, shade('#3f8a3a', 0.75 + R() * 0.45), '#244f22');
      for (let x = 0.45; x < 2.7; x += 0.3) pot(l, x, -0.82, 0.15, 1.1, ['#4f9a43', '#6aa84f', '#3f8a3a'][Math.floor(R() * 3)], R() < 0.45 ? ['#e04a6a', '#f2c84b', '#f49ac0', '#ffffff'][Math.floor(R() * 4)] : null);
      for (let k = 0; k < 4; k++) { const x = 0.5 + R() * 2, len = 0.4 + R() * 0.6; l.seg([x, -0.9, 2.6], [x, -0.9, 2.6 - len], '#4f9a43', 2); l.px(x, -0.9, 2.6 - len, '#6aa84f', 3, 2); }
      if (v === 'g2') { // hanging rattan swing chair
        l.seg([1.95, -0.5, 2.6], [1.95, -0.5, 1.75], '#5a4a36', 2);
        for (let z = 0.35; z < 1.65; z += 0.08) { const r = 0.34 * Math.sin(Math.PI * (z - 0.25) / 1.5); l.disc(1.95, -0.5, z, Math.max(0.06, r), shade('#c9a46a', 0.85 + (z / 1.65) * 0.3), '#7a5a32'); }
        l.disc(1.95, -0.58, 0.72, 0.22, '#f0e6d2', '#a89a80'); l.disc(1.9, -0.66, 0.85, 0.1, '#e07a5a');
      } else { l.box(1.6, -0.6, 0.15, 2.2, -0.25, 0.55, '#8a6a4a', { line: '#4a3420' }); l.disc(2.3, -0.45, 0.62, 0.15, '#f2f2ea', '#999'); }
      l.seg([1.5, -0.4, 2.6], [1.5, -0.4, 2.4], '#333'); l.disc(1.5, -0.4, 2.35, 0.07, '#ffe6a8', '#8a7a50');
      if (st === 'laundry') { l.seg([0.7, -0.2, 2.3], [1.3, -0.2, 2.3], '#bbb'); l.Q(-0.2, 0.75, 1.75, 1.0, 2.3, '#f2f2ea'); l.Q(-0.2, 1.02, 1.85, 1.25, 2.3, '#c8d6e6'); }
      // frameless glass railing (soft alpha) with a slim steel top rail
      l.Q(Y, X0, 0.15, X1, 1.12, 'rgba(178,220,228,0.45)', 'rgba(120,160,170,0.8)'); l.face([[X0, 0, 0.15], [X0, Y, 0.15], [X0, Y, 1.12], [X0, 0, 1.12]], 'rgba(160,205,215,0.45)', 'rgba(120,160,170,0.8)');
      l.seg([X0, Y, 1.14], [X1, Y, 1.14], '#56606a', 2); l.seg([X0, Y, 1.14], [X0, 0, 1.14], '#56606a', 2);
    } else if (v === 'o1') { // old aluminium + blue glass enclosure (封阳台)
      l.Q(Y, X0, 0.15, X1, 1.0, '#cfcabe', '#7a766d'); l.face([[X0, 0, 0.15], [X0, Y, 0.15], [X0, Y, 2.62], [X0, 0, 2.62]], '#6f9ea8', '#9aa0a0');
      l.Q(Y, X0, 1.0, X1, 2.62, '#6f9ea8', '#9aa0a0'); for (let x = X0; x <= X1 + 0.01; x += 0.68) l.seg([x, Y, 1.0], [x, Y, 2.62], '#c9ccc8', 2); l.seg([X0, Y, 1.0], [X1, Y, 1.0], '#c9ccc8', 2); l.seg([X0, Y, 2.62], [X1, Y, 2.62], '#c9ccc8', 2);
      l.Q(Y - 0.005, X0 + 0.7, 1.05, X0 + 1.3, 2.55, 'rgba(40,60,70,0.85)');                                // one panel slid open
      l.box(X0 - 0.05, Y - 0.05, 2.62, X1 + 0.05, 0, 2.78, '#b9b5aa');
      if (st === 'laundry') { l.seg([X0, Y - 0.5, 2.5], [X1, Y - 0.5, 2.5], '#999'); let x = X0 + 0.1; while (x < X1 - 0.2) { const w = 0.3 + R() * 0.3, c = ['#d94a3a', '#3a6ad9', '#f2f2ea', '#e8c34a'][Math.floor(R() * 4)]; l.Q(Y - 0.5, x, 1.7 + R() * 0.3, x + w, 2.5, c, shade(c, 0.6)); x += w + 0.1; } }
      for (let k = 0; k < 2; k++) l.seg([X0 + 0.3 + k * 1.6, Y, 1.0], [X0 + 0.35 + k * 1.6, Y, 0.3], 'rgba(120,85,50,0.5)');
    } else { // o2: open balcony behind a rusty full-height cage, clutter
      l.box(X0, Y + 0.1, 0.15, X1, Y + 0.25, 1.0, '#b4b0a5', { line: '#6f6c66' });
      l.box(0.4, -0.6, 0.15, 0.9, -0.2, 0.6, '#a88a5a', { line: '#5a4630' }); l.box(0.45, -0.55, 0.6, 0.85, -0.25, 0.85, '#c9b48a', { line: '#5a4630' }); l.seg([2.5, -0.3, 0.15], [2.6, -0.4, 1.6], '#6a5a46', 2);
      pot(l, 1.4, -0.65, 1.0, 1, '#4f9a43'); pot(l, 1.8, -0.65, 1.0, 0.9, '#6aa84f');
      if (st === 'laundry') { l.seg([X0, -0.5, 2.4], [X1, -0.5, 2.4], '#999'); let x = X0 + 0.15; while (x < X1 - 0.2) { const w = 0.25 + R() * 0.35, c = ['#d94a3a', '#3a6ad9', '#f2f2ea', '#e8c34a', '#9a5ac2'][Math.floor(R() * 5)]; l.Q(-0.5, x, 1.6 + R() * 0.4, x + w, 2.4, c, shade(c, 0.6)); x += w + 0.08; } }
      for (let x = X0; x <= X1 + 0.001; x += 0.14) l.seg([x, Y, 0.15], [x, Y, 2.7], '#6b4a33');
      for (const z of [0.15, 1.0, 1.9, 2.7]) l.seg([X0, Y, z], [X1, Y, z], '#6b4a33', 2);
      for (let y = 0; y >= Y; y -= 0.14) l.seg([X0, y, 0.15], [X0, y, 2.7], '#6b4a33');
      l.seg([0.6, Y, 2.7], [0.5, Y, 0.4], 'rgba(130,80,45,0.55)');
    }
  }, emit(d, st, v, rot) { if (v !== 'g1' && v !== 'g2') return false; const l = L(d, rot); l.Q(-0.04, 0.55, 0.22, 2.45, 2.36, '#ffcf80'); l.disc(1.5, -0.4, 2.35, 0.09, '#fff1c8'); } });
  // ------------------------------------------------------------------ f_ac rusty
  A.skin('f_ac', { variants: ['rust'], states: ['default'], rots: [0, 6], geo: (rot) => geoL(rot, [-0.45, -0.5, -0.4, 0.45, 0.05, 0.6]), draw(d, st, v, rot) {
    const l = L(d, rot);
    l.seg([-0.35, -0.02, -0.02], [-0.35, -0.45, -0.02], '#5a3a26', 2); l.seg([0.35, -0.02, -0.02], [0.35, -0.45, -0.02], '#5a3a26', 2); l.seg([-0.35, -0.02, -0.3], [-0.35, -0.45, -0.02], '#5a3a26'); l.seg([0.35, -0.02, -0.3], [0.35, -0.45, -0.02], '#5a3a26');
    l.box(-0.38, -0.44, 0, 0.38, -0.06, 0.5, '#c9bfa6', { line: '#6a6050' });
    l.disc(-0.08, -0.44, 0.25, 0.17, '#5d5a52', '#3a3832'); for (let k = -2; k <= 2; k++) l.seg([-0.08 + k * 0.06, -0.445, 0.12], [-0.08 + k * 0.06, -0.445, 0.38], '#8a8576');
    l.seg([0.2, -0.44, 0.45], [0.18, -0.44, 0.05], 'rgba(140,80,40,0.8)'); l.seg([-0.3, -0.44, 0.1], [-0.28, -0.44, 0.0], 'rgba(140,80,40,0.8)'); l.px(0.26, -0.44, 0.3, '#8a4a26', 3, 2);
    l.seg([0.3, -0.25, 0], [0.3, -0.25, -0.38], '#ddd');
  } });
  // ------------------------------------------------------------------ roofs
  function cyl(d, x, y, z0, z1, r, col) {
    const g = d.g, a = d.P(x, y, z0), b = d.P(x, y, z1), rx = r * KX * 1.414, ry = r * KY * 1.414;
    g.fillStyle = shade(col, 0.8); g.beginPath(); g.ellipse(a[0], a[1], rx, ry, 0, 0, Math.PI); g.lineTo(b[0] - rx, b[1]); g.ellipse(b[0], b[1], rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fill(); g.strokeStyle = shade(col, 0.5); g.lineWidth = 1; g.stroke();
    g.fillStyle = col; g.fillRect(Math.round(b[0] - rx * 0.2), Math.round(b[1]), Math.max(1, Math.round(rx * 0.25)), Math.round(a[1] - b[1]));
    d.disc(x, y, z1, r, shade(col, 1.12), shade(col, 0.5));
  }
  /* 四坡屋顶 hip roof over the WHOLE footprint: eaves overhang O on all four sides, a ridge along the long axis (a pyramid only when
   * square), four slopes lit per face (S brightest, W mid, N / E darker), tile courses + channels, ridge / hip caps, fascia + gutter on
   * the seen eaves, and old-roof details: chimney, attic vent, water tank on a steel stand, TV antenna, moss along the eaves, a patch. */
  const PITCH = { r_pitch: { c: '#a8492f', cap: '#7a2e1c', name: 'clay' }, r_pitchg: { c: '#7a7e80', cap: '#55595b', name: 'cement' }, r_pitchb: { c: '#4f6478', cap: '#33465a', glaze: true, name: 'glazed' } };
  function hip(d, W, D, P) {
    const R = d.R, O = 0.3, E = 0.12, x0 = -O, y0 = -O, x1 = W + O, y1 = D + O, long = x1 - x0 >= y1 - y0, hd = Math.min(x1 - x0, y1 - y0) / 2, H = hd * 0.5, Z = E + H;
    const A = long ? [x0 + hd, (y0 + y1) / 2, Z] : [(x0 + x1) / 2, y0 + hd, Z], B = long ? [x1 - hd, (y0 + y1) / 2, Z] : [(x0 + x1) / 2, y1 - hd, Z];   // ridge ends (A west / south)
    const c = P.c, sw = [x0, y0, E], se = [x1, y0, E], ne = [x1, y1, E], nw = [x0, y1, E];
    const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
    // faces: back slopes first; each is [eave a, eave b, ridge b, ridge a] (a triangle repeats a point when the ridge end is shared)
    const S = [sw, se, long ? B : A, A], N = [ne, nw, long ? A : B, B], Wf = [nw, sw, A, long ? A : B], Ef = [se, ne, B, long ? B : A];
    const slope = (f, lit, rows) => {
      d.face(f, shade(c, lit), shade(c, lit * 0.55));
      for (let t = 1 / rows; t < 0.999; t += 1 / rows) { const p0 = lerp(f[0], f[3], t), p1 = lerp(f[1], f[2], t); d.seg(p0, p1, shade(c, lit * 0.7), 2); d.seg([p0[0], p0[1], p0[2] + 0.03], [p1[0], p1[1], p1[2] + 0.03], shade(c, lit * 1.12)); }   // tile courses: shadow line + lit lip
      // tile channels run straight up the slope (perpendicular to the eave) until they meet a hip or the ridge
      const ex = f[1][0] - f[0][0], ey = f[1][1] - f[0][1], L = Math.hypot(ex, ey), nx = -ey / L, ny = ex / L, n = Math.max(4, Math.round(L / 0.3));
      const hit = (px, py, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], den = nx * dy - ny * dx; if (Math.abs(den) < 1e-9) return null;
        const s1 = ((a[0] - px) * dy - (a[1] - py) * dx) / den, t = ((a[0] - px) * ny - (a[1] - py) * nx) / den; return s1 > 1e-6 && t >= -1e-6 && t <= 1 + 1e-6 ? [s1, lerp(a, b, t)] : null; };
      for (let k = 1; k < n; k++) { const e = lerp(f[0], f[1], k / n); let best = null;
        for (const [a2, b2] of [[f[0], f[3]], [f[3], f[2]], [f[1], f[2]]]) { const h2 = hit(e[0], e[1], a2, b2); if (h2 && (!best || h2[0] < best[0])) best = h2; }
        if (best) d.seg(e, best[1], shade(c, lit * (k % 2 ? 0.9 : 0.84))); }
      if (P.glaze) for (let k = 0; k < 18; k++) { const u = R(), t = R() * 0.9; const p = lerp(lerp(f[0], f[1], u), lerp(f[3], f[2], u), t); d.px(p[0], p[1], p[2], 'rgba(220,235,250,0.55)', 2, 1); }
    };
    const rows = Math.round(hd / 0.36); slope(N, 0.7, rows); slope(Ef, 0.62, rows);
    slope(Wf, 0.84, rows); slope(S, 1.0, rows);
    // weathering: moss + streaks along the low courses, one repaired patch of newer tiles
    for (let k = 0; k < 26; k++) { const u = R(), f = R() < 0.65 ? S : Wf, p = lerp(lerp(f[0], f[1], u), lerp(f[3], f[2], u), R() * 0.22); d.px(p[0], p[1], p[2], R() < 0.6 ? 'rgba(78,104,52,0.75)' : 'rgba(40,36,30,0.35)', 2 + Math.round(R() * 2), 1); }
    { const u = 0.25 + R() * 0.4, t = 0.3 + R() * 0.3, q = (du, dt) => lerp(lerp(S[0], S[1], u + du), lerp(S[3], S[2], u + du), t + dt); d.face([q(0, 0), q(0.12, 0), q(0.12, 0.18), q(0, 0.18)], shade(c, 1.12), shade(c, 0.6)); }
    // fascia board + gutter on the seen eaves (S, W), downpipe at the SW corner
    d.box(x0, y0 - 0.08, E - 0.18, x1, y0, E, '#e6e0d2', { line: '#8a8274' }); d.box(x0 - 0.08, y0, E - 0.18, x0, y1, E, '#d8d2c4', { line: '#8a8274' });
    d.box(x0, y0 - 0.2, E - 0.24, x1, y0 - 0.08, E - 0.12, '#9aa0a2', { line: '#5e6466' });
    // ridge + hip caps
    const cap = (p, q) => { d.seg(p, q, P.cap, 4); d.seg([p[0], p[1], p[2] + 0.04], [q[0], q[1], q[2] + 0.04], shade(P.cap, 1.35), 1); };
    cap(A, B); cap(sw, A); cap(nw, long ? A : B); cap(se, long ? B : A); cap(ne, B);
    // details: attic vent (little gabled louvre) on the S slope, chimney, water tank on a stand on the back slope, TV antenna
    { const p = lerp(lerp(S[0], S[1], 0.32), lerp(S[3], S[2], 0.32), 0.45); d.face([[p[0] - 0.4, p[1], p[2]], [p[0] + 0.4, p[1], p[2]], [p[0], p[1], p[2] + 0.5]], '#d9d2c2', '#6a6252'); for (const dx of [-0.2, 0, 0.2]) d.seg([p[0] + dx, p[1] - 0.01, p[2] + 0.05], [p[0] + dx, p[1] - 0.01, p[2] + 0.3 - Math.abs(dx)], '#5a5246'); }
    { const p = lerp(lerp(S[0], S[1], 0.72), lerp(S[3], S[2], 0.72), 0.7); d.box(p[0] - 0.3, p[1] - 0.3, p[2] - 0.3, p[0] + 0.3, p[1] + 0.3, p[2] + 0.75, '#8e6a52', { line: '#4e3a2c', top: '#3a302a' }); }
    { const p = lerp(lerp(N[0], N[1], 0.35), lerp(N[3], N[2], 0.35), 0.55); for (const [a, b] of [[-0.6, -0.5], [0.6, -0.5], [-0.6, 0.5], [0.6, 0.5]]) d.seg([p[0] + a, p[1] + b, p[2] - 0.2], [p[0] + a, p[1] + b, p[2] + 0.6], '#5a5e60', 2);
      cyl(d, p[0], p[1], p[2] + 0.6, p[2] + 1.25, 0.55, '#d9dcdc'); }
    { const p = lerp(A, B, 0.5); d.seg(p, [p[0], p[1], p[2] + 0.75], '#6a6e70', 1); for (const z of [0.45, 0.6, 0.75]) d.seg([p[0] - 0.5, p[1] + 0.2, p[2] + z], [p[0] + 0.5, p[1] - 0.2, p[2] + z], '#6a6e70', 1); }
  }
  function roof(d, W, D, v) {
    const R = d.R, PC = '#c8c4b9', back = [], front = [];
    if (PITCH[v]) return hip(d, W, D, PITCH[v]);
    d.flat(0, 0, W, D, 0, '#9d978b', '#6e6a62');
    for (let k = 0; k < 6; k++) { const x = R() * (W - 3), y = R() * (D - 3); d.flat(x, y, x + 1 + R() * 2.5, y + 0.8 + R() * 2, 0, 'rgba(70,64,56,0.22)'); }
    const parapet = (which) => { if (which === 'b') { d.box(0, D - 0.25, 0, W, D, 0.9, PC, { line: '#7e7a70' }); d.box(W - 0.25, 0, 0, W, D, 0.9, PC, { line: '#7e7a70' }); } else { d.box(0, 0, 0, 0.25, D, 0.9, PC, { line: '#7e7a70' }); d.box(0, 0, 0, W, 0.25, 0.9, PC, { line: '#7e7a70' }); } };
    void back; void front;
    parapet('b');
    if (v === 'r_tank') {
      d.box(W - 4.4, D - 3.9, 0, W - 1.4, D - 1.0, 2.5, '#d2cec4', { line: '#7e7a70' }); d.face([[W - 3.6, D - 3.9, 0], [W - 2.6, D - 3.9, 0], [W - 2.6, D - 3.9, 2.0], [W - 3.6, D - 3.9, 2.0]], '#6a5a4a', '#3a2e22');
      for (const [x, y] of [[2.2, D - 2.2], [4.4, D - 2.0]]) { d.box(x - 0.7, y - 0.7, 0, x + 0.7, y + 0.7, 0.6, '#6d6a64'); cyl(d, x, y, 0.6, 2.2, 0.65, '#d9dcdc'); }
      for (let k = 0; k < 3; k++) d.box(1 + k * 2.4, 0.5, 0, 1.8 + k * 2.4, 1.0, 0.55, '#e4e2dc', { line: '#7e7a70' });
      d.seg([W - 1.6, 1, 0.1], [W - 1.6, D - 4, 0.1], '#4a4a48', 2);
    } else if (v === 'r_shed') {
      const sx0 = 1.2, sx1 = Math.min(W - 2, 7.5), sy0 = D - 5.2, sy1 = D - 0.6;
      d.box(sx0, sy0, 0, sx1, sy1, 2.5, '#4f7fb3', { line: '#2a4a70' }); for (let x = sx0 + 0.2; x < sx1; x += 0.2) d.seg([x, sy0, 0.05], [x, sy0, 2.45], '#3e6a9a');
      d.face([[sx0 - 0.2, sy0 - 0.3, 2.5], [sx1 + 0.2, sy0 - 0.3, 2.5], [sx1 + 0.2, sy1 + 0.2, 2.8], [sx0 - 0.2, sy1 + 0.2, 2.8]], '#6f97c2', '#2a4a70');
      d.face([[sx0 + 0.6, sy0, 0], [sx0 + 1.5, sy0, 0], [sx0 + 1.5, sy0, 2.0], [sx0 + 0.6, sy0, 2.0]], '#efefe8', '#777'); d.face([[sx0 + 2.3, sy0, 1.1], [sx0 + 3.6, sy0, 1.1], [sx0 + 3.6, sy0, 2.0], [sx0 + 2.3, sy0, 2.0]], '#5f7a86', '#ddd');
      for (let x = W - 5; x < W - 1; x += 0.9) { d.box(x, 1.0, 0, x + 0.6, 1.4, 0.35, '#eeeeea', { line: '#999' }); d.disc(x + 0.3, 1.2, 0.5, 0.25, '#4f9a43', '#2c5a27'); }
      d.seg([W - 6, 3, 1.7], [W - 1, 3.5, 1.7], '#999'); for (let k = 0; k < 4; k++) { const x = W - 5.6 + k * 1.1, c = ['#d94a3a', '#f2f2ea', '#3a6ad9', '#e8c34a'][k]; d.face([[x, 3 + k * 0.1, 1.0], [x + 0.6, 3 + k * 0.1, 1.0], [x + 0.6, 3 + k * 0.1, 1.7], [x, 3 + k * 0.1, 1.7]], c, shade(c, 0.6)); }
      d.box(W - 3, D - 2.2, 0, W - 1.6, D - 0.8, 0.6, '#6d6a64'); cyl(d, W - 2.3, D - 1.5, 0.6, 2.0, 0.6, '#d9dcdc');
    } else if (v === 'r_solar') {
      const n = Math.max(2, Math.floor((W - 2) / 2.4));
      for (let k = 0; k < n; k++) { const x = 1 + k * 2.4, y = D * 0.45;
        d.face([[x, y, 0.3], [x + 1.9, y, 0.3], [x + 1.9, y + 1.4, 1.4], [x, y + 1.4, 1.4]], '#24375a', '#c0c4c8'); for (let t = 0.24; t < 1.9; t += 0.24) d.seg([x + t, y, 0.3], [x + t, y + 1.4, 1.4], '#3a5a8a');
        d.seg([x + 0.1, y, 0], [x + 0.1, y, 0.3], '#999'); d.seg([x + 1.8, y, 0], [x + 1.8, y, 0.3], '#999'); d.seg([x + 0.1, y + 1.4, 0], [x + 0.1, y + 1.4, 1.4], '#999'); d.seg([x + 1.8, y + 1.4, 0], [x + 1.8, y + 1.4, 1.4], '#999');
        const g = d.g, a = d.P(x, y + 1.55, 1.6), b = d.P(x + 1.9, y + 1.55, 1.6); g.strokeStyle = '#8a8e90'; g.lineWidth = 7; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.strokeStyle = '#e4e6e6'; g.lineWidth = 5; g.stroke(); }
      d.box(W - 3.2, 0.8, 0, W - 1.2, 2.4, 2.2, '#d2cec4', { line: '#7e7a70' });
      d.box(W - 2.6, D - 2.4, 0, W - 1.2, D - 1.0, 0.6, '#6d6a64'); cyl(d, W - 1.9, D - 1.7, 0.6, 1.9, 0.6, '#d9dcdc');
    } else if (v === 'r_green') {
      for (let y = 1.2; y < D - 1.4; y += 1.6) { const x1 = W - (y > D - 4 ? 4.5 : 1.2); d.box(1.0, y, 0, x1, y + 0.8, 0.4, '#8a6a4a', { line: '#4a3420' }); for (let x = 1.2; x < x1 - 0.1; x += 0.35) d.disc(x, y + 0.4, 0.55 + R() * 0.15, 0.2, shade(R() < 0.2 ? '#8fbf4a' : '#4f9a43', 0.8 + R() * 0.4), '#2c5a27'); if (R() < 0.5) for (let k = 0; k < 4; k++) d.px(1.5 + R() * (x1 - 2.5), y + 0.4, 0.75, R() < 0.5 ? '#d94a3a' : '#f2c84b', 2, 2); }
      const tx = W - 4, ty = D - 3.4; for (const [a, b] of [[0, 0], [3, 0], [0, 2.4], [3, 2.4]]) d.seg([tx + a, ty + b, 0], [tx + a, ty + b, 2.2], '#6a5a46', 2);
      for (let k = 0; k < 40; k++) d.disc(tx + R() * 3, ty + R() * 2.4, 2.2 + R() * 0.25, 0.22, shade('#5a9a3a', 0.8 + R() * 0.4), '#2c5a27');
      d.box(tx + 1, ty + 0.8, 0, tx + 1.5, ty + 1.3, 0.5, '#eeeeea'); for (let k = 0; k < 4; k++) d.box(W - 2 - k * 0.7, 0.6, 0, W - 1.5 - k * 0.7, 0.9, 0.3, '#f4f4f0', { line: '#aaa' });
    }
    parapet('f');
    for (let k = 0; k < 3; k++) d.disc(0.5 + R() * (W - 1), 0.12, 0.95, 0.15, '#4f9a43', '#2c5a27');
  }
  const ROOFS = ['r_tank', 'r_shed', 'r_pitch', 'r_solar', 'r_green', 'r_pitchg'];
  A.skin('b_roof_a', { variants: ROOFS.filter((v) => v !== 'r_pitchg'), states: ['default'], rots: [0], pad: 6, geo: () => [-0.5, -0.5, -0.2, 15.35, 12.35, 4.1], draw(d, st, v) { roof(d, 15, 12, v); } });
  A.skin('b_roof_b', { variants: ROOFS, states: ['default'], rots: [0], pad: 6, geo: () => [-0.5, -0.5, -0.2, 12.35, 9.35, 3.4], draw(d, st, v) { roof(d, 12, 9, v); } });
  /* extra footprints (9x9, 12x12) for buildings narrower / squarer than the kit roofs; kit-style sort hints as b_roof_* */
  for (const [type, w, dd] of [['rq_v_roof9', 9, 9], ['rq_v_roof12', 12, 12]]) A.define(type, { name: '屋顶', variants: ['r_tank', 'r_shed', 'r_solar', 'r_green'], noShadow: true, shadow: false,
    geo: [-0.3, -0.3, -0.2, w + 0.3, dd + 0.3, 3.6], fp: [], piece: { z_order: 10, sort_box: [0, 0, w, dd], sort_z: [0, 3], size: [w, dd], origin: 'building SW corner at roof level' },
    draw(d, st, v) { roof(d, w, dd, v); } });
  A.VARIETY = { MAT: Object.keys(MAT), WIN, BAL, ROOFS };
})(typeof window !== 'undefined' ? window : globalThis);
