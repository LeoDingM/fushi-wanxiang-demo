/* 榕桥区 E4e art (2026-10-18): 万家菜市场 riverside mixed-use block — 1F wet market (the market kit), 2–3F commercial podium,
 * apartment slab above, street-entrance lift + stair core. Facades are VARIANTS of the kit f_wall (RongqiaoArt.skin) so the
 * block sorts / fades like every building:
 *   f_wall  nb_pod   podium glazing (shop / clinic / class rooms behind curtain glass, aluminium fins, slab band)
 *           nb_res   apartment bay: warm light render, window with AC ledge + security grille (nb_resl = same, lit at night)
 *           nb_resb  apartment balcony bay: glass balustrade, plants, laundry on the rail (lived-in; nb_resbl lit)
 *           nb_core  lift / stair core: dark grey panel with staggered stair windows; ground = lobby glass door
 * New types: rq_m3_dtile / rq_m3_par / rq_m3_kit (roofs composed of small tiles, parapet runs and roof furniture), rq_m3_band (podium tenant sign band, S face), rq_m3_name (roof-top name).
 * All names / colours / tenants 未经Leo确认. */
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
  const F = -0.04, REN = '#e9e2d4', REN2 = '#d9cfbd', GLASS = '#7c9fae', FRAME = '#3c4a50';
  function podium(l, st) {
    const Q = (a0, z0, a1, z1, f, li) => l.Q(F, a0, z0, a1, z1, f, li), R = l.R;
    l.box(0, F, 0, 3, 0.3, 3, '#cfd3d2', { line: '#6f7577', top: '#e3e6e5' });
    Q(0, 0, 3, 0.42, '#b9bfc0', '#6f7577');                                           // slab band
    Q(0.08, 0.42, 2.92, 2.86, GLASS, FRAME);
    const inside = ['#d9c9a8', '#cfd8dc', '#e3d3b8', '#b9c7cf'][Math.floor(R() * 4)];
    Q(0.2, 0.55, 2.8, 1.35 + R() * 0.4, shade(inside, 0.85));                           // shelving / counters seen through glass
    for (let k = 0; k < 3; k++) { const x = 0.35 + R() * 2.2; Q(x, 1.6, x + 0.18, 2.5, 'rgba(255,255,255,0.18)'); }
    for (const x of [1.0, 2.0]) l.seg([x, F, 0.42], [x, F, 2.86], FRAME, 2);
    l.seg([0.08, F, 2.2], [2.92, F, 2.2], FRAME);
    l.seg([0.4, F, 2.7], [1.0, F, 1.0], 'rgba(235,245,250,0.5)');
    Q(0, 2.86, 3, 3, '#9aa1a3');
  }
  function apt(l, st, balc) {
    const Q = (a0, z0, a1, z1, f, li) => l.Q(F, a0, z0, a1, z1, f, li), R = l.R;
    l.box(0, F, 0, 3, 0.3, 3, REN, { line: shade(REN, 0.6), top: shade(REN, 1.04) });
    Q(0, 0, 3, 0.25, REN2, shade(REN2, 0.7));
    if (!balc) {
      Q(0.45, 0.95, 2.55, 2.55, GLASS, FRAME); Q(0.45, 0.95, 2.55, 1.25 + R() * 0.4, '#6a8a99');
      l.seg([1.5, F, 0.95], [1.5, F, 2.55], FRAME, 2);
      for (let x = 0.55; x < 2.5; x += 0.22) l.seg([x, F - 0.05, 0.95], [x, F - 0.05, 2.0], 'rgba(70,74,76,0.7)');   // security grille
      l.box(0.35, -0.35, 0.78, 2.65, F, 0.9, REN2, { line: '#8a8070' });                                            // AC ledge
      if (R() < 0.7) l.box(0.6, -0.33, 0.9, 1.45, -0.05, 1.45, '#eef0ee', { line: '#7a7f80' });
      if (R() < 0.35) Q(0.5, 2.0, 2.5, 2.5, ['#c9a46b', '#b8c7a0', '#d7b9b4'][Math.floor(R() * 3)]);                 // curtain
    } else {
      Q(0.2, 0.2, 2.8, 2.7, '#6f8792', FRAME); Q(0.3, 0.3, 1.4, 2.55, '#86a5b2', FRAME);
      l.box(0.1, -1.0, 0, 2.9, F, 0.12, '#cfc8ba', { line: '#857d70' });                                            // slab
      l.Q(-1.0, 0.1, 0.12, 2.9, 1.1, 'rgba(170,205,215,0.45)', '#56656b');                                         // glass balustrade
      l.seg([0.1, -1.0, 1.1], [2.9, -1.0, 1.1], '#56656b', 2);
      if (R() < 0.8) { l.seg([0.2, -0.75, 2.05], [2.8, -0.75, 2.05], '#666', 1);                                   // laundry pole
        const cols = ['#d84b3c', '#f1f1ea', '#3d6fa8', '#e6c24f', '#7bb07a', '#e58fb0', '#5c5c66'];
        for (let x = 0.35; x < 2.6; x += 0.3 + R() * 0.25) { if (R() < 0.3) continue; const h = 0.35 + R() * 0.45; l.Q(-0.75, x, 2.05 - h, x + 0.22, 2.05, cols[Math.floor(R() * cols.length)], 'rgba(0,0,0,0.25)'); } }
      if (R() < 0.6) { l.box(2.2, -0.9, 0.12, 2.75, -0.45, 0.45, '#8a5a3c'); l.box(2.15, -0.95, 0.45, 2.8, -0.4, 0.95, '#5f9a52', { line: '#3c6a34' }); }
    }
    Q(0, 2.88, 3, 3, shade(REN, 0.9));
  }
  /** nb_resw: projecting bay window (frame box, side lights, flower box) over an AC unit on a bracket;
   *  nb_resa: terracotta accent panel with two narrow windows and two AC units on brackets (breaks the grid vertically) */
  function aptBay(l, st) {
    const Q = (a0, z0, a1, z1, f, li) => l.Q(F, a0, z0, a1, z1, f, li), R = l.R;
    l.box(0, F, 0, 3, 0.3, 3, REN, { line: shade(REN, 0.6), top: shade(REN, 1.04) }); Q(0, 0, 3, 0.25, REN2, shade(REN2, 0.7));
    l.box(0.35, -0.55, 0.7, 2.65, F, 2.75, '#d4ccbd', { line: '#7c7466', top: '#e6e0d4' });                       // bay box
    l.Q(-0.56, 0.5, 0.95, 2.5, 2.55, GLASS, FRAME); l.Q(-0.56, 0.5, 0.95, 2.5, 1.3 + R() * 0.3, '#6a8a99');
    for (const x of [1.15, 1.85]) l.seg([x, -0.57, 0.95], [x, -0.57, 2.55], FRAME, 2);
    if (R() < 0.5) l.Q(-0.57, 0.55, 2.0, 2.45, 2.5, ['#c9a46b', '#d7b9b4', '#b8c7a0'][Math.floor(R() * 3)]);       // blind
    l.box(0.45, -0.85, 0.55, 2.55, -0.56, 0.75, '#8a5a3c', { line: '#4e3222' });                                   // flower box
    for (let x = 0.55; x < 2.5; x += 0.28) l.box(x, -0.82, 0.75, x + 0.2, -0.6, 0.95 + R() * 0.15, R() < 0.25 ? '#d8506a' : '#5f9a52');
    l.box(0.9, -0.5, 0.02, 2.1, F, 0.5, '#eef0ee', { line: '#7a7f80' });                                           // AC unit under the bay
    l.seg([1.0, -0.5, 0.25], [2.0, -0.5, 0.25], '#9aa0a2');
    Q(0, 2.88, 3, 3, shade(REN, 0.9));
  }
  function aptAccent(l, st) {
    const Q = (a0, z0, a1, z1, f, li) => l.Q(F, a0, z0, a1, z1, f, li), R = l.R, AC = '#b8714f';
    l.box(0, F, 0, 3, 0.3, 3, AC, { line: shade(AC, 0.55), top: shade(AC, 1.08) });
    Q(0, 0, 3, 0.25, shade(AC, 0.8));
    for (const x0 of [0.35, 1.75]) { Q(x0, 0.9, x0 + 0.9, 2.6, GLASS, FRAME); Q(x0, 0.9, x0 + 0.9, 1.3 + R() * 0.4, '#6a8a99'); l.seg([x0 + 0.45, F, 0.9], [x0 + 0.45, F, 2.6], FRAME); }
    for (const x0 of [0.3, 1.7]) { l.box(x0, -0.42, 0.55, x0 + 1.0, F, 0.62, '#9a9286'); if (R() < 0.85) { l.box(x0 + 0.05, -0.4, 0.62, x0 + 0.95, -0.05, 0.98, '#eef0ee', { line: '#7a7f80' }); l.seg([x0 + 0.5, -0.41, 0.8], [x0 + 0.5, -0.41, 0.8], '#888'); } }
    l.seg([2.8, F - 0.02, 0], [2.8, F - 0.02, 3], '#8d8a84', 2);                                                   // drain pipe
    Q(0, 2.88, 3, 3, shade(AC, 0.85));
  }
  function core(l, st) {
    const Q = (a0, z0, a1, z1, f, li) => l.Q(F, a0, z0, a1, z1, f, li);
    l.box(0, F, 0, 3, 0.3, 3, '#7d8588', { line: '#40474a', top: '#9aa2a5' });
    if (st === 'ground') { Q(0.3, 0, 2.7, 2.6, '#9fbccb', FRAME); l.seg([1.5, F, 0], [1.5, F, 2.6], FRAME, 2); Q(0.3, 2.6, 2.7, 2.9, '#3c4a50'); return; }
    Q(1.1, 0.5, 1.9, 2.6, '#a9c3cf', FRAME); Q(1.1, 0.5, 1.9, 1.1, '#87a4b1');
    for (const z of [0.0, 2.95]) Q(0, z, 3, z + 0.05, '#5e6669');
  }
  // atlas budget: only the faces / states that are placed get a frame (S-only balcony + lit bays, core street door only on the S face)
  const WALL = { geo: (rot) => geoL(rot, [0, -0.04, 0, 3, 0.35, 3]),
    draw(d, st, v, rot) { const l = L(d, rot === 6);
      if (v === 'nb_pod') podium(l, st); else if (v === 'nb_core') core(l, st); else if (v === 'nb_resw') aptBay(l, st); else if (v === 'nb_resa') aptAccent(l, st); else apt(l, st, v === 'nb_resb' || v === 'nb_resbl'); },
    emit(d, st, v, rot) { const l = L(d, rot === 6);
      if (v === 'nb_pod') { l.Q(F, 0.1, 0.45, 2.9, 2.84, 'rgba(255,244,214,0.78)'); return; }
      if (v === 'nb_core') { if (st === 'ground') l.Q(F, 0.3, 0, 2.7, 2.6, 'rgba(255,246,220,0.85)'); else l.Q(F, 1.1, 0.5, 1.9, 2.6, 'rgba(235,245,255,0.75)'); return; }
      if (v === 'nb_resl') { l.Q(F, 0.45, 0.95, 2.55, 2.55, 'rgba(255,232,180,0.82)'); return; }
      if (v === 'nb_resbl') { l.Q(F, 0.2, 0.2, 2.8, 2.7, 'rgba(255,232,180,0.8)'); return; }
      return false; } };
  A.skin('f_wall', Object.assign({ variants: ['nb_pod', 'nb_res', 'nb_core'], states: ['upper'], rots: [0, 6], prune: true }, WALL));
  A.skin('f_wall', Object.assign({ variants: ['nb_resl', 'nb_resb', 'nb_resbl'], states: ['upper'], rots: [0], prune: true }, WALL));
  A.skin('f_wall', Object.assign({ variants: ['nb_core'], states: ['ground'], rots: [0], prune: true }, WALL));
  A.skin('f_wall', Object.assign({ variants: ['nb_resw', 'nb_resa'], states: ['upper'], rots: [0, 6], prune: true }, WALL));
  // ------------------------------------------------------------------ roofs
  // roofs are composed from small reusable pieces (atlas budget: one 12 x 9 frame per roof variant did not fit the 4 mobile pages):
  // rq_m3_dtile 6 x 4.5 flat tiles (deck = residents' terrace paving over the market, roof = tower / core roof membrane), rq_m3_par
  // parapet runs (s: 6 m along x on a south edge or north edge, w: 4.5 m along y), rq_m3_kit roof furniture (water tank, lift machine
  // room, solar water heaters); planters are the shared rq_x_bed.
  A.define('rq_m3_dtile', { name: '屋面', variants: ['deck', 'roof', 'lawn', 'play'], geo: [0, 0, -0.1, 6, 4.5, 0.05], fp: [], shadow: false, layer: 'sorted', draw(d, st, v) {
    if (v === 'lawn') { const R = d.R; d.flat(0, 0, 6, 4.5, 0.02, '#7fa04a', null); d.flat(0.05, 0.05, 5.95, 4.45, 0.12, '#86a852', null);   // raised turf on the drainage mat
      for (let k = 0; k < 140; k++) d.px(R() * 6, R() * 4.5, 0.13, shade('#86a852', 0.8 + R() * 0.4), 2, 1);
      for (let k = 0; k < 10; k++) d.px(0.3 + R() * 5.4, 0.3 + R() * 3.9, 0.14, ['#f2e86b', '#ffffff', '#e98ab0'][k % 3], 2, 2);
      d.seg([0, 0, 0.13], [6, 0, 0.13], '#6a7d45'); d.seg([0, 0, 0.13], [0, 4.5, 0.13], '#6a7d45'); return; }
    if (v === 'play') { d.flat(0, 0, 6, 4.5, 0.03, '#c8553f', null); for (let x = 1.5; x < 6; x += 1.5) d.seg([x, 0, 0.04], [x, 4.5, 0.04], 'rgba(90,30,20,0.3)');
      d.flat(1, 1, 2.6, 2.6, 0.04, '#e0b54a', null); d.flat(3.4, 1.8, 5, 3.4, 0.04, '#4f8fbf', null); return; }   // rubber play mat with hopscotch squares
    const [c, l] = v === 'deck' ? ['#b7b4aa', 'rgba(120,115,104,0.25)'] : ['#a9a69d', 'rgba(96,92,84,0.22)'];
    d.flat(0, 0, 6, 4.5, 0.02, c, null);
    for (let x = 0.5; x < 6; x += 1) d.seg([x, 0, 0.03], [x, 4.5, 0.03], l);
  } });
  A.define('rq_m3_par', { name: '女儿墙', variants: ['s', 'w', 'crs', 'crw'], geo: [0, 0, 0, 6, 0.25, 1.1], geoOf: (st, v) => (v === 'w' ? [0, 0, 0, 0.25, 4.5, 1.1] : v === 'crs' ? [0, 0, 0, 6, 0.3, 2.4] : v === 'crw' ? [0, 0, 0, 0.3, 4.5, 2.4] : null), fp: [], shadow: false, draw(d, st, v) {
    const c = '#cfc9bc', t = { line: '#7d776b', top: '#e2ddd2' };
    if (v === 'crs' || v === 'crw') {          // tower crown: solid parapet + a louvred screen frame with a terracotta cap band
      const W = v === 'crw', L = W ? 4.5 : 6, P = (u, o, z) => (W ? [o, L - u, z] : [u, o, z]);
      if (W) d.box(0, 0, 0, 0.3, 4.5, 1.05, shade(c, 0.86), t); else d.box(0, 0, 0, 6, 0.3, 1.05, c, t);
      for (let u = 0.2; u < L; u += 0.45) d.seg(P(u, 0, 1.05), P(u, 0, 2.1), W ? '#8a8a84' : '#9a9a94', 2);
      for (const u of [0, L - 0.15]) d.seg(P(u + 0.07, 0, 1.05), P(u + 0.07, 0, 2.4), '#6f6f6a', 3);
      d.face([P(0, 0, 2.1), P(L, 0, 2.1), P(L, 0, 2.4), P(0, 0, 2.4)], W ? '#a4644a' : '#b8714f', '#6b3a28'); return; }
    if (v === 'w') d.box(0, 0, 0, 0.25, 4.5, 1.05, shade(c, 0.86), t); else d.box(0, 0, 0, 6, 0.25, 1.05, c, t);
  } });
  A.define('rq_m3_kit', { name: '屋顶设备', variants: ['tank', 'mach', 'solar', 'lift', 'tbox', 'perg', 'ac', 'vent', 'umb'], geo: [0, 0, 0, 3.6, 2.6, 2.9], fp: [], shadow: false, draw(d, st, v) {
    if (v === 'tank') { d.box(0, 0, 0, 2.4, 2.4, 0.3, '#7b8285'); d.box(0.1, 0.1, 0.3, 2.3, 2.3, 2.4, '#d7d9d4', { line: '#6e736f' }); return; }
    if (v === 'mach') { d.box(0, 0, 0, 3.5, 2.5, 0.9, '#8f9597', { line: '#5a6062' }); return; }
    if (v === 'tbox') { d.box(0, 0, 0, 1.4, 1.4, 0.6, '#9a8f7e', { line: '#5d5446', top: '#6b5238' }); d.box(0.05, 0.05, 0.6, 1.35, 1.35, 0.66, '#5a4632'); return; }   // tree box (tree placed on top)
    if (v === 'perg') {                                                    // pergola with two benches and climbing plants
      for (const [x, y] of [[0.1, 0.1], [3.3, 0.1], [0.1, 2.3], [3.3, 2.3]]) d.box(x, y, 0, x + 0.2, y + 0.2, 2.5, '#7a5a3c', { line: '#4a3422' });
      for (const y of [0.1, 2.3]) d.box(0, y, 2.5, 3.6, y + 0.2, 2.68, '#8a6a48', { line: '#4a3422' });
      for (let x = 0.2; x < 3.5; x += 0.45) d.box(x, 0, 2.68, x + 0.12, 2.6, 2.8, '#9a7a56', { line: '#5a4430' });
      const R = d.R; for (let k = 0; k < 40; k++) d.disc(R() * 3.6, R() * 2.6, 2.8 + R() * 0.15, 0.22, shade('#5f9a42', 0.8 + R() * 0.4));
      for (const y of [0.5, 1.7]) { d.box(0.6, y, 0.42, 3.0, y + 0.42, 0.5, '#b08a5a', { line: '#6a5032' }); d.box(0.7, y + 0.1, 0, 0.8, y + 0.3, 0.42, '#555'); d.box(2.8, y + 0.1, 0, 2.9, y + 0.3, 0.42, '#555'); }
      return; }
    if (v === 'ac') { d.box(0, 0.2, 0, 3.4, 2.4, 0.18, '#7b8285'); for (const x of [0.15, 1.25, 2.35]) { d.box(x, 0.4, 0.18, x + 0.95, 2.2, 1.1, '#e6e8e6', { line: '#7a7f80' }); d.disc(x + 0.48, 1.3, 1.11, 0.32, '#3c4245', '#9aa0a2'); } return; }   // mall condensers
    if (v === 'vent') { d.box(0.2, 0.3, 0, 3.2, 1.1, 0.7, '#a7adaf', { line: '#62686a' }); for (const x of [0.6, 1.7, 2.8]) { d.box(x - 0.2, 1.4, 0, x + 0.2, 1.8, 1.1, '#9aa1a3', { line: '#5a6062' }); d.disc(x, 1.6, 1.25, 0.32, '#c3c8ca', '#5a6062'); } return; }   // kitchen / hall exhaust ducts
    if (v === 'umb') { d.disc(1.2, 1.2, 0.02, 0.9, 'rgba(40,40,40,0.18)'); d.box(0.75, 0.75, 0, 1.65, 1.65, 0.75, '#e8e2d6', { line: '#8a8274' });          // terrace table, two chairs, parasol
      for (const [x, y] of [[0.2, 1.0], [2.0, 1.0]]) d.box(x, y, 0, x + 0.4, y + 0.4, 0.45, '#5a4a3a');
      d.seg([1.2, 1.2, 0.75], [1.2, 1.2, 2.3], '#666', 2); const c = d.R() < 0.5 ? '#c8402f' : '#e8e0c8';
      for (let k = 0; k < 8; k++) { const a0 = k / 8 * Math.PI * 2, a1 = (k + 1) / 8 * Math.PI * 2; d.face([[1.2, 1.2, 2.45], [1.2 + Math.cos(a0) * 1.3, 1.2 + Math.sin(a0) * 1.3, 1.95], [1.2 + Math.cos(a1) * 1.3, 1.2 + Math.sin(a1) * 1.3, 1.95]], k % 2 ? c : shade(c, 0.85), shade(c, 0.6)); }
      return; }
    if (v === 'lift') { d.box(0, 0, 0, 3.6, 2.6, 2.9, '#7d8588', { line: '#40474a', top: '#9aa2a5' }); d.box(0.4, -0.05, 1.6, 1.2, 0, 2.5, '#a9c3cf'); return; }
    d.box(0, 0, 0, 2.2, 1.3, 0.25, '#6f7678'); d.face([[0, 0, 0.25], [2.2, 0, 0.25], [2.2, 1.3, 1.0], [0, 1.3, 1.0]], '#2f4b6e', '#1c2e44'); d.box(0.2, 1.3, 0.6, 2.0, 1.7, 1.0, '#e9ecec', { line: '#8a8f90' });
  } });
  // tenant sign band across 3 bays of the podium (S face), mounted at the top of a podium storey
  const BAND = { cha: ['万家茶楼 · 早茶 午市', '#b8322a', '#f7e7b5'], edu: ['启航培优 · 英语 编程 书法', '#2f6aa8', '#ffffff'], gym: ['活力健身 24h', '#2b2b2b', '#f2c94c'],
    den: ['康贝口腔', '#2f8f7a', '#ffffff'], rft: ['云顶餐厅 · 屋顶露台', '#7a3b1f', '#ffe7a6'], pha: ['万家大药房', '#2f8f3a', '#ffffff'], hair: ['阿杰美发', '#5b3a8c', '#ffffff'] };
  A.define('rq_m3_band', { name: '商铺招牌', variants: Object.keys(BAND), geo: [0, -0.3, 0, 9, 0.05, 0.8], fp: [], shadow: false, draw(d, st, v) {
    const [t, bg, fg] = BAND[v], l = L(d, false);
    l.box(0, -0.3, 0, 9, -0.05, 0.8, bg, { line: shade(bg, 0.5) });
    const sz = 14, w = l.textW(t, sz); l.text(t, 4.5 - w / 2, -0.31, 0.18, sz, fg, { weight: 'bold' });
  }, emit(d, st, v) { const [t, , fg] = BAND[v], l = L(d, false), sz = 14, w = l.textW(t, sz); l.text(t, 4.5 - w / 2, -0.31, 0.18, sz, '#fff6d6', { weight: 'bold' }); } });
  const NM = { wjhy: '万家花园' };
  A.define('rq_m3_name', { name: '楼名', variants: Object.keys(NM), geo: [-0.2, -0.3, 0, 8, 0.4, 1.6], fp: [], shadow: false, draw(d, st, v) {
    const l = L(d, false), n = NM[v], sz = 20, w = l.textW(n, sz);
    for (const x of [0.4, Math.max(0.6, w - 0.5)]) l.box(x, 0.05, 0, x + 0.12, 0.17, 1.2, '#7c8183');
    l.text(n, 0, 0, 0.25, sz, '#c8a24a', { weight: 'bold', stroke: '#3a2f1a' });
  }, emit(d, st, v) { const l = L(d, false), n = NM[v]; l.text(n, 0, 0, 0.25, 20, '#ffe7a6', { weight: 'bold' }); } });
})(typeof window !== 'undefined' ? window : globalThis);
