/* P3 art: 榕桥菜市场 phase 1 (district plan §12 P3). Procedural pixel art in the kit's 45° projection, painted into atlas slot 2
 * by rongqiao_art.js. Real-world scale: 3.6 m single-storey market hall, red-brick outer walls, green striped awnings over the
 * street stalls, a skylight monitor along the main aisle, blue-pillar stall islands, live-fish tanks and ice tables.
 * Goods states are baked into the stall frames: full / half / empty / closed (covered). Interior pieces never cast sun shadows
 * (the hall is roofed); only the north and east outer walls and the outdoor buildings do. Everything here is presentation. */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A) return;
  const { shade, mix } = A;
  const H = 3.6;                                   // hall wall height (m)
  const BRICK = '#a5543d', MORTAR = '#c9a58c', PLINTH = '#6d6a66', COPING = '#cfc6b6';
  const TILE = '#ecebe3', GROUT = '#c7c5bb', PAINT = '#d9dfd2', DADO = '#3f7f6a';
  const GREEN = '#2a7a46', DGREEN = '#1c5532', SIGNW = '#f6f4ea', BLUE = '#2f5f94', STEEL = '#c4c9cc', DSTEEL = '#7f878b';
  const GOODS = ['full', 'half', 'empty', 'closed'];
  const fillOf = (st) => (st === 'full' ? 1 : st === 'half' ? 0.5 : 0);
  // ---------------------------------------------------------------- face helpers (at(u, z) -> world point on a face)
  const quad = (d, at, u0, z0, u1, z1, fill, line) => d.face([at(u0, z0), at(u1, z0), at(u1, z1), at(u0, z1)], fill, line);
  /** individual bricks with mortar; k = light factor (south 1, west 0.8) */
  function bricks(d, at, u0, u1, z0, z1, k) {
    quad(d, at, u0, z0, u1, z1, shade(MORTAR, k));
    const CH = 0.1, BW = 0.25;
    for (let z = z0, row = 0; z < z1 - 0.005; z += CH, row++) {
      const zt = Math.min(z1, z + CH) - 0.018;
      for (let u = u0 - (row % 2 ? BW / 2 : 0); u < u1; u += BW) {
        const a = Math.max(u0, u), b = Math.min(u1, u + BW) - 0.02; if (b - a < 0.03) continue;
        const r = d.R(), c = r < 0.08 ? '#8c4532' : r > 0.93 ? '#b8664a' : shade(BRICK, 0.93 + d.R() * 0.12);
        quad(d, at, a, z, b, zt, shade(c, k));
      }
    }
  }
  function tiles(d, at, u0, u1, z0, z1, k, col, step) {
    col = col || TILE; step = step || 0.2; quad(d, at, u0, z0, u1, z1, shade(col, k));
    for (let z = z0 + step; z < z1 - 0.01; z += step) d.seg(at(u0, z), at(u1, z), shade(GROUT, k));
    for (let u = u0 + step; u < u1 - 0.01; u += step) d.seg(at(u, z0), at(u, z1), shade(GROUT, k));
  }
  function interiorFace(d, at, u0, u1, k, z1) {
    z1 = z1 || H; tiles(d, at, u0, u1, 0, 1.5, k);
    quad(d, at, u0, 1.5, u1, 1.6, shade(DADO, k)); quad(d, at, u0, 1.6, u1, z1, shade(PAINT, k));
    for (let i = 0; i < 3; i++) { const u = u0 + d.R() * (u1 - u0); quad(d, at, u, 1.62, Math.min(u1, u + 0.05), 1.62 + d.R() * 0.6, shade(PAINT, k * 0.94)); }   // grime streaks
  }
  function exteriorFace(d, at, u0, u1, k, z1) {
    z1 = z1 || H; quad(d, at, u0, 0, u1, 0.35, shade(PLINTH, k), shade(PLINTH, k * 0.7));
    bricks(d, at, u0, u1, 0.35, z1 - 0.18, k); quad(d, at, u0, z1 - 0.18, u1, z1, shade(COPING, k), shade(COPING, k * 0.6));
    d.seg(at(u0, z1 - 0.19), at(u1, z1 - 0.19), shade('#5a3a2c', k));
  }
  function clerestory(d, at, uc, w, k, ext) {
    const u0 = uc - w / 2, u1 = uc + w / 2;
    quad(d, at, u0 - 0.04, 2.45, u1 + 0.04, 3.2, ext ? shade('#e0d8c8', k) : shade('#cfd5cb', k));
    quad(d, at, u0, 2.5, u1, 3.15, shade('#6f8f9c', k), shade('#3d4c52', k));
    for (let u = u0 + w / 4; u < u1 - 0.02; u += w / 4) d.seg(at(u, 2.5), at(u, 3.15), shade('#3d4c52', k));
    d.seg(at(u0, 2.82), at(u1, 2.82), shade('#3d4c52', k));
    d.seg(at(u0 + 0.05, 3.08), at(u0 + w * 0.3, 2.56), shade('#a9c4cf', k));         // reflection
    if (ext) quad(d, at, u0 - 0.06, 2.42, u1 + 0.06, 2.47, shade('#e8e2d4', k), shade('#8d867a', k));
  }
  function sign(d, at, u0, u1, z0, z1, txt, k, o) {
    o = o || {}; quad(d, at, u0, z0, u1, z1, shade(o.bg || GREEN, k), shade(o.edge || DGREEN, k));
    quad(d, at, u0 + 0.03, z0 + 0.03, u1 - 0.03, z1 - 0.03, null, shade(o.frame || '#cfe6d4', k));
    const size = o.size || Math.max(7, Math.round((z1 - z0) * 39 * 0.62)), tw = d.textW(txt, size), uc = (u0 + u1) / 2;
    const p = at(uc - tw / 2, z0 + (z1 - z0) * 0.24);
    d.text(txt, p[0], p[1], p[2], size, shade(o.fg || SIGNW, Math.min(1, k + 0.1)), { west: !!o.west });
  }
  // ---------------------------------------------------------------- walls
  const atS = (y) => (u, z) => [u, y, z];                         // south face of a wall running along +x
  const atW = (x, L) => (u, z) => [x, L - u, z];                  // west face of a wall running along +y (reads toward -y)
  function wallX(d, L, look, win) {
    d.box(0, 0, 0, L, 0.3, H, look === 'ext' ? BRICK : PAINT, { noS: true, line: '#4a3a30', top: '#8e8880' });
    if (look === 'ext') exteriorFace(d, atS(0), 0, L, 1); else interiorFace(d, atS(0), 0, L, 1);
    if (win) clerestory(d, atS(0), L / 2, Math.min(1.4, L - 0.4), 1, look === 'ext');
    d.seg([0, 0, H], [L, 0, H], '#3a2e27');
  }
  function wallY(d, L, look, win) {
    d.box(0, 0, 0, 0.3, L, H, look === 'ext' ? BRICK : PAINT, { noW: true, line: '#4a3a30', top: '#8e8880' });
    if (look === 'ext') exteriorFace(d, atW(0, L), 0, L, 0.8); else interiorFace(d, atW(0, L), 0, L, 0.8);
    if (win) clerestory(d, atW(0, L), L / 2, Math.min(1.4, L - 0.4), 0.8, look === 'ext');
    d.seg([0, 0, H], [0, L, H], '#3a2e27');
  }
  for (const L of [2, 1.5, 1]) {
    const n = String(L).replace('.', '');
    A.define('rq_mk_wall_x' + n, { name: '菜市场墙', variants: ['ext', 'int', 'ext_win', 'int_win'], geo: [0, 0, 0, L, 0.3, H],
      draw(d, st, v) { wallX(d, L, v.startsWith('ext') ? 'ext' : 'int', v.endsWith('win')); } });
    A.define('rq_mk_wall_y' + n, { name: '菜市场墙', variants: ['ext', 'int', 'ext_win', 'int_win'], geo: [0, 0, 0, 0.3, L, H], shadow: false,
      draw(d, st, v) { wallY(d, L, v.startsWith('ext') ? 'ext' : 'int', v.endsWith('win')); } });
  }
  /** 4 m gate module: piers 0.5 m, opening 3 m x 2.7 m, lintel + label sign */
  function gate(d, axis, look, label) {
    const L = 4, P0 = 0.5, P1 = L - 0.5, ZO = 2.7, ext = look === 'ext', k = axis === 'x' ? 1 : 0.8;
    const at = axis === 'x' ? atS(0) : atW(0, L);
    const B = (u0, u1, z0, z1) => (axis === 'x' ? d.box(u0, 0, z0, u1, 0.3, z1, ext ? BRICK : PAINT, { noS: true, line: '#4a3a30', top: '#8e8880' }) : d.box(0, L - u1, z0, 0.3, L - u0, z1, ext ? BRICK : PAINT, { noW: true, line: '#4a3a30', top: '#8e8880' }));
    // the far pier's inner jamb faces the opening (visible): draw first
    if (axis === 'x') d.face([[P1, 0, 0], [P1, 0.3, 0], [P1, 0.3, ZO], [P1, 0, ZO]], ext ? '#8e7d72' : '#b9bdb3', '#4a3a30');
    else d.face([[0, L - P1, 0], [0.3, L - P1, 0], [0.3, L - P1, ZO], [0, L - P1, ZO]], ext ? '#a08b7c' : '#cfd3c8', '#4a3a30');
    B(0, P0, 0, H); B(P1, L, 0, H); B(P0, P1, ZO, H);
    const face = ext ? exteriorFace : interiorFace;
    face(d, at, 0, P0, k); face(d, at, P1, L, k);
    // lintel band
    if (ext) { quad(d, at, P0, ZO, P1, H - 0.18, shade('#d8d0c0', k), shade('#7d7468', k)); quad(d, at, P0, H - 0.18, P1, H, shade(COPING, k)); }
    else { quad(d, at, P0, ZO, P1, H, shade(PAINT, k), shade('#8f978c', k)); }
    sign(d, at, 1.15, 2.85, ZO + 0.12, ZO + 0.58, label, k, { west: axis === 'y' });
    quad(d, at, P0, ZO - 0.06, P1, ZO, shade('#6a5f55', k));
    if (ext) { const p = at(0.25, 2.35); d.box(p[0] - 0.06, p[1] - 0.06, 2.3, p[0] + 0.06, p[1] + 0.06, 2.42, '#dcd6c8', { line: '#555' }); }
  }
  A.define('rq_mk_gate_x', { name: '菜市场北门', variants: ['north'], geo: [0, 0, 0, 4, 0.3, H], draw(d) { gate(d, 'x', 'int', '北门'); } });
  A.define('rq_mk_gate_y', { name: '菜市场侧门', variants: ['west', 'east'], geo: [0, 0, 0, 0.3, 4, H], shadow: false,
    draw(d, st, v) { gate(d, 'y', v === 'west' ? 'ext' : 'int', v === 'west' ? '西门' : '东门'); } });
  /** loading door on the east wall (interior face): rolled-up shutter, goods-only chain + sign */
  A.define('rq_mk_load', { name: '卸货门', geo: [0, 0, 0, 0.3, 4, H], draw(d) {
    const L = 4, at = atW(0, L), k = 0.8, P0 = 0.4, P1 = 3.6, ZO = 2.8;
    d.face([[0, L - P1, 0], [0.3, L - P1, 0], [0.3, L - P1, ZO], [0, L - P1, ZO]], '#cfd3c8', '#4a3a30');
    d.box(0, L - P0, 0, 0.3, L, H, PAINT, { noW: true, line: '#4a3a30', top: '#8e8880' }); d.box(0, 0, 0, 0.3, L - P1, H, PAINT, { noW: true, line: '#4a3a30', top: '#8e8880' });
    d.box(0, L - P1, ZO, 0.3, L - P0, H, PAINT, { noW: true, line: '#4a3a30', top: '#8e8880' });
    interiorFace(d, at, 0, P0, k); interiorFace(d, at, P1, L, k);
    quad(d, at, P0, ZO, P1, H, shade('#9aa3a6', k), shade('#5b6366', k));
    for (let z = ZO + 0.08; z < H - 0.02; z += 0.09) d.seg(at(P0, z), at(P1, z), shade('#6f787b', k));        // rolled shutter drum
    d.box(-0.12, L - P1 - 0.05, 0, -0.04, L - P1 + 0.05, 1.0, '#e8c33a', { line: '#5a4a10' }); d.box(-0.12, L - P0 - 0.05, 0, -0.04, L - P0 + 0.05, 1.0, '#e8c33a', { line: '#5a4a10' });
    for (let i = 0; i < 12; i++) { const u0 = P0 + 0.05 + i * 0.26, sag = Math.sin((i + 0.5) / 12 * Math.PI) * 0.12; d.seg([-0.08, L - u0, 0.88 - sag], [-0.08, L - u0 - 0.24, 0.88 - Math.sin((i + 1.5) / 12 * Math.PI) * 0.12], i % 2 ? '#e8c33a' : '#222', 2); }
    sign(d, at, 1.2, 2.8, 0.52, 0.76, '货运通道 顾客止步', k, { west: true, bg: '#e8c33a', edge: '#5a4a10', fg: '#2a2a2a', frame: '#fff3b0', size: 8 });
    sign(d, at, 1.35, 2.65, ZO + 0.15, ZO + 0.55, '卸货门', k, { west: true, bg: BLUE, edge: '#1d3b5e', frame: '#bcd2ea' });
  } });
  // ---------------------------------------------------------------- south facade: street-stall bays + main gate
  const BAY = 3.875;
  function awning(d, u0, u1) {
    const Y = -1.15, ZT = 2.5, ZB = 2.1, n = Math.round((u1 - u0) / 0.32);
    for (let i = 0; i < n; i++) {
      const a = u0 + (u1 - u0) * i / n, b = u0 + (u1 - u0) * (i + 1) / n, c = i % 2 ? '#f1f2ea' : '#2e8c4c';
      d.face([[a, 0, ZT], [b, 0, ZT], [b, Y, ZB], [a, Y, ZB]], c);
      d.face([[a, Y, ZB], [b, Y, ZB], [b, Y, ZB - 0.12], [a, Y, ZB - 0.12]], shade(c, 0.86));
      const m = (a + b) / 2, p = d.P(m, Y, ZB - 0.12); d.g.fillStyle = shade(c, 0.86); d.g.beginPath(); d.g.arc(p[0], p[1], 4.2, 0, Math.PI); d.g.fill();
    }
    d.face([[u0, 0, ZT], [u1, 0, ZT], [u1, Y, ZB], [u0, Y, ZB]], null, '#1f5a34');
    d.seg([u0, Y, ZB - 0.12], [u1, Y, ZB - 0.12], '#1f5a34');
    d.face([[u0, 0, ZT], [u0, Y, ZB], [u0, Y, ZB - 0.12], [u0, 0, ZT - 0.1]], '#24703c', '#1f5a34');
    for (const u of [u0 + 0.05, u1 - 0.05]) d.seg([u, 0, 2.38], [u, Y + 0.05, ZB - 0.05], '#555b5e');
  }
  function shutter(d, at, u0, u1, z1, open) {
    if (open) { quad(d, at, u0, z1 - 0.22, u1, z1, '#8d969a', '#4c5558'); for (let z = z1 - 0.18; z < z1; z += 0.06) d.seg(at(u0, z), at(u1, z), '#6c7579'); return; }
    quad(d, at, u0, 0, u1, z1, '#aab2b5', '#5b6366');
    for (let z = 0.06; z < z1; z += 0.07) d.seg(at(u0, z), at(u1, z), z % 0.21 < 0.07 ? '#8a9396' : '#c3cacc');
    quad(d, at, u0, 0, u1, 0.08, '#6d7578'); quad(d, at, (u0 + u1) / 2 - 0.06, 0.1, (u0 + u1) / 2 + 0.06, 0.2, '#3c3c3c');
    // flyposted ads and a phone number: everyday reality of old-town shutters
    const R = d.R; for (let i = 0; i < 3; i++) { const a = u0 + 0.3 + R() * (u1 - u0 - 0.8), z = 0.35 + R() * 0.9; quad(d, at, a, z, a + 0.18, z + 0.24, ['#f1ece0', '#f5e46a', '#e9eef2'][i], '#8c8c86'); d.seg(at(a + 0.03, z + 0.17), at(a + 0.15, z + 0.17), '#c0392b'); d.seg(at(a + 0.03, z + 0.1), at(a + 0.14, z + 0.1), '#555'); }
  }
  A.define('rq_mk_bay', { name: '临街摊位', states: ['open', 'shut'], variants: ['fruit', 'veg'], geo: [0, 0, 0, BAY, 0.35, H], paintBox: [0, -1.3, 0, BAY, 0.35, H], shadow: false,
    draw(d, st, v) {
      const at = atS(0), P = 0.45, ZO = 2.62, open = st === 'open';
      if (open) d.face([[BAY, 0, 0], [BAY, 0.35, 0], [BAY, 0.35, ZO], [BAY, 0, ZO]], '#8e7d72');
      d.box(0, 0, 0, P, 0.35, H, BRICK, { noS: true, line: '#4a3a30', top: '#8e8880' }); d.box(P, 0, ZO, BAY, 0.35, H, BRICK, { noS: true, line: '#4a3a30', top: '#8e8880' });
      exteriorFace(d, at, 0, P, 1);
      bricks(d, at, P, BAY, ZO, H - 0.18, 1); quad(d, at, P, H - 0.18, BAY, H, COPING, '#8d867a'); quad(d, at, P, ZO - 0.05, BAY, ZO + 0.02, '#5d5148');
      sign(d, at, P + 0.25, BAY - 0.25, ZO + 0.08, ZO + 0.5, v === 'fruit' ? '鲜果' : '时蔬', 1, { size: 12 });
      shutter(d, at, P, BAY, ZO - 0.05, open);
      if (!open) quad(d, at, P, 0, BAY, ZO - 0.05, null, '#4c5558');
      awning(d, P - 0.05, BAY + 0.02);
    },
    emit(d, st) { if (st !== 'open') return false; for (const u of [1.2, 2.8]) { const p = d.P(u, -0.2, 2.3); d.g.fillStyle = '#fff2c8'; d.g.fillRect(Math.round(p[0]) - 3, Math.round(p[1]) - 1, 6, 2); } } });
  A.define('rq_mk_gate_s', { name: '菜市场南门', geo: [0, 0, 0, 4, 0.35, H], shadow: false, draw(d) {
    const at = atS(0), P0 = 0.4, P1 = 3.6, ZO = 3.0;
    d.face([[P1, 0, 0], [P1, 0.35, 0], [P1, 0.35, ZO], [P1, 0, ZO]], '#8e7d72', '#4a3a30');
    for (const [a, b] of [[0, P0], [P1, 4]]) { d.box(a, 0, 0, b, 0.35, H, BRICK, { noS: true, line: '#4a3a30', top: '#8e8880' }); exteriorFace(d, at, a, b, 1); }
    d.box(P0, 0, ZO, P1, 0.35, H, '#d8d0c0', { noS: true, line: '#4a3a30', top: '#8e8880' });
    quad(d, at, P0, ZO, P1, H, '#dcd4c4', '#7d7468'); quad(d, at, P0, ZO - 0.06, P1, ZO, '#5d5148');
    d.text('营业时间 05:30-20:30', ...at(P0 + 0.45, ZO + 0.2), 8, '#4a443c', { weight: 'normal' });
    for (const u of [0.12, 3.75]) { quad(d, at, u, 1.2, u + 0.18, 1.75, '#f4efe2', '#7c7466'); d.seg(at(u + 0.03, 1.62), at(u + 0.15, 1.62), '#2a7a46'); for (let z = 1.3; z < 1.55; z += 0.06) d.seg(at(u + 0.03, z), at(u + 0.14, z), '#888'); }
  } });
  const SBN = { base: ['榕桥菜市场', 30], m2: ['榕桥第二菜市场', 22], m3: ['万家菜市场综合楼', 28], nb: ['南埠菜市场', 30] };   // E4: m2 = the second market on 南关路; nb = 南埠 (names 未经Leo确认)
  A.define('rq_mk_signboard', { name: '榕桥菜市场招牌', variants: Object.keys(SBN), geo: [-1, 0, 3.55, 5, 0.25, 5.25], shadow: false, draw(d, st, v) {
    const nb = v === 'nb';
    for (const u of [-0.6, 4.6]) d.box(u, 0.12, 3.55, u + 0.12, 0.24, 4.0, nb ? '#3a2e24' : '#5b6164', { line: '#2c3134' });
    d.box(-1, 0, 3.75, 5, 0.12, 5.2, nb ? '#f7f4ee' : DGREEN, { line: nb ? '#c4a574' : '#10301c', top: nb ? '#e7d7b8' : '#3b5f48' });
    const at = atS(0); quad(d, at, -0.93, 3.82, 4.93, 5.13, nb ? '#fffdf8' : GREEN, nb ? '#c4a574' : '#10301c'); quad(d, at, -0.86, 3.88, 4.86, 5.07, null, nb ? '#e07a5f' : '#9fd4ae');
    const [t, size] = SBN[v] || SBN.base, w = d.textW(t, size), p = at(2 - w / 2, size < 30 ? 4.22 : 4.12);
    d.text(t, p[0], p[1], p[2], size, nb ? '#c4503a' : '#fbfaf1', { stroke: nb ? '#fff6ee' : '#174628' });
    const s = nb ? 'NANBU WET MARKET' : 'RONGQIAO WET MARKET', sw = d.textW(s, 7), q = at(2 - sw / 2, 3.92); d.text(s, q[0], q[1], q[2], 7, nb ? '#8a6a3e' : '#cfe8d6', { weight: 'normal' });
    d.box(-1.02, -0.02, 5.17, 5.02, 0.14, 5.25, nb ? '#e07a5f' : '#d9d2c2', { line: '#555' });
  }, emit(d, st, v) { const at = atS(0), [t, size] = SBN[v] || SBN.base, w = d.textW(t, size), p = at(2 - w / 2, size < 30 ? 4.22 : 4.12); d.text(t, p[0], p[1], p[2], size, v === 'nb' ? '#ffd0c2' : '#fff8d8'); for (let u = -0.85; u < 4.86; u += 0.5) { const q = d.P(u, -0.01, 5.1); d.g.fillStyle = v === 'nb' ? '#ffb199' : '#ffe9a8'; d.g.fillRect(Math.round(q[0]), Math.round(q[1]), 2, 1); } } });
  // ---------------------------------------------------------------- roof: metal deck tiles + skylight monitor over the main aisle
  function deck(d, W, D, z, v) {
    d.flat(0, 0, W, D, z, '#9aa2a4', '#5d6467');
    for (let x = 0.25; x < W - 0.05; x += 0.25) d.seg([x, 0, z], [x, D, z], x % 0.5 < 0.25 ? '#b1b8ba' : '#848c8f');
    for (let i = 0; i < 4; i++) { const x = d.R() * (W - 0.6), y = d.R() * (D - 1); d.face([[x, y, z], [x + 0.25, y, z], [x + 0.25, y + 1.2, z], [x, y + 1.2, z]], 'rgba(120,112,98,0.22)'); }   // weathering
    if (v.includes('s')) { d.face([[0, 0, z - 0.32], [W, 0, z - 0.32], [W, 0, z + 0.06], [0, 0, z + 0.06]], '#d8cdb8', '#6d655a'); d.seg([0, 0, z - 0.26], [W, 0, z - 0.26], '#8d8476'); d.flat(0, 0, W, 0.12, z + 0.06, '#e3d9c6', '#6d655a'); }
    if (v.includes('w')) { d.face([[0, 0, z - 0.32], [0, D, z - 0.32], [0, D, z + 0.06], [0, 0, z + 0.06]], '#b9af9b', '#6d655a'); d.seg([0, 0, z - 0.26], [0, D, z - 0.26], '#7d7466'); d.flat(0, 0, 0.12, D, z + 0.06, '#e3d9c6', '#6d655a'); }
    if (v.includes('e')) {                       // rooftop condenser units + a water tank
      d.box(0.8, 1.0, z, 1.9, 1.6, z + 0.75, '#d9dcd8', { line: '#6e736f' }); d.disc(1.35, 1.0, z + 0.4, 0.22, '#3d4446', '#22282a');
      d.box(2.3, 1.0, z, 3.4, 1.6, z + 0.75, '#d9dcd8', { line: '#6e736f' }); d.disc(2.85, 1.0, z + 0.4, 0.22, '#3d4446', '#22282a');
      d.box(3.6, 2.2, z, 4.4, 3.0, z + 0.25, '#7b8285'); d.box(3.65, 2.25, z + 0.25, 4.35, 2.95, z + 1.2, '#4f8fbf', { line: '#24506e' });
      d.seg([1.9, 1.3, z + 0.2], [3.0, 3.5, z + 0.05], '#3a3a3a', 2);
    }
  }
  A.define('rq_roof_a', { name: '菜市场屋面', variants: ['in', 's', 'w', 'sw', 'e'], geo: [0, 0, 3.55, 5, 4, 3.75], shadow: false, draw(d, st, v) { deck(d, 5, 4, 3.72, v); } });
  A.define('rq_roof_b', { name: '菜市场屋面', variants: ['in', 's', 'w', 'sw', 'e'], geo: [0, 0, 3.55, 5.5, 4, 3.75], shadow: false, draw(d, st, v) { deck(d, 5.5, 4, 3.72, v); } });
  A.define('rq_roof_sky', { name: '采光天窗', variants: ['in', 's'], geo: [0, 0, 3.55, 4, 4, 4.7], shadow: false, draw(d, st, v) {
    deck(d, 4, 4, 3.72, v);
    const x0 = 0.35, x1 = 3.65, z0 = 3.72, z1 = 4.55;
    d.face([[x0, 0, z0], [x0, 4, z0], [x0, 4, z1], [x0, 0, z1]], '#7da3b4', '#3b5561');
    for (let y = 0.25; y < 4; y += 0.5) d.seg([x0, y, z0 + 0.04], [x0, y, z1 - 0.04], '#3b5561');
    d.seg([x0, 0, z0 + 0.42], [x0, 4, z0 + 0.42], '#3b5561'); d.seg([x0, 3.6, z0 + 0.1], [x0, 2.8, z1 - 0.08], '#bfe0ec');
    if (v === 's') { d.face([[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]], '#8db3c3', '#3b5561'); for (let x = x0 + 0.55; x < x1; x += 0.55) d.seg([x, 0, z0 + 0.04], [x, 0, z1 - 0.04], '#3b5561'); }
    d.flat(x0 - 0.08, 0, x1 + 0.08, 4, z1, '#c7cfd1', '#5d6467');
    for (let x = x0; x < x1; x += 0.3) d.seg([x, 0, z1], [x, 4, z1], '#aab3b6');
  } });
  // ---------------------------------------------------------------- floors (ground legend tiles) and decals
  A.define('rq_gfloor', { name: '防滑地砖', layer: 'ground', geo: [0, 0, 0, 2, 2, 0], draw(d) {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const x = i * 0.5, y = j * 0.5, c = shade('#b8b2a5', 0.95 + d.R() * 0.08); d.flat(x, y, x + 0.5, y + 0.5, 0, c, '#9d978a'); }
    for (let i = 0; i < 3; i++) d.flat(d.R() * 1.6, d.R() * 1.6, 0, 0, 0, null);
  } });
  A.define('rq_gwet', { name: '水产区地砖', layer: 'ground', geo: [0, 0, 0, 2, 2, 0], draw(d) {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const x = i * 0.5, y = j * 0.5, c = shade('#8f9c9e', 0.94 + d.R() * 0.1); d.flat(x, y, x + 0.5, y + 0.5, 0, c, '#76817f'); }
    for (let i = 0; i < 5; i++) { const x = d.R() * 1.7, y = d.R() * 1.7; d.flat(x, y, x + 0.25, y + 0.12, 0, 'rgba(210,232,238,0.55)'); }
  } });
  A.define('rq_dec_floorh', { name: '地砖', layer: 'decal', geo: [0, 0, 0, 0.7, 2, 0], draw(d) { for (let j = 0; j < 4; j++) d.flat(0, j * 0.5, 0.7, j * 0.5 + 0.5, 0, shade('#b8b2a5', 0.95 + d.R() * 0.08), '#9d978a'); } });
  A.define('rq_dec_yline_x', { name: '黄线', layer: 'decal', geo: [0, 0, 0, 2, 0.12, 0], draw(d) { d.flat(0, 0, 2, 0.12, 0, '#e2b52e'); } });
  A.define('rq_dec_yline_y', { name: '黄线', layer: 'decal', geo: [0, 0, 0, 0.12, 2, 0], draw(d) { d.flat(0, 0, 0.12, 2, 0, '#e2b52e'); } });
  A.define('rq_dec_hatch', { name: '黄黑斑马线', layer: 'decal', geo: [0, 0, 0, 2, 1, 0], draw(d) {
    d.flat(0, 0, 2, 1, 0, '#2d2d2b'); d.g.save(); d.face([[0, 0, 0], [2, 0, 0], [2, 1, 0], [0, 1, 0]]); d.g.clip();
    for (let x = -1.2; x < 2.2; x += 0.4) d.face([[x, 0, 0], [x + 0.2, 0, 0], [x + 1.2, 1, 0], [x + 1, 1, 0]], '#e2b52e');
    d.g.restore(); } });
  A.define('rq_dec_drain', { name: '排水沟', layer: 'decal', geo: [0, 0, 0, 2, 0.24, 0], draw(d) { d.flat(0, 0, 2, 0.24, 0, '#5d6467', '#3c4244'); for (let x = 0.05; x < 2; x += 0.08) d.seg([x, 0.03, 0], [x, 0.21, 0], '#9aa3a6'); } });
  A.define('rq_dec_drain_y', { name: '排水沟', layer: 'decal', geo: [0, 0, 0, 0.24, 2, 0], draw(d) { d.flat(0, 0, 0.24, 2, 0, '#5d6467', '#3c4244'); for (let y = 0.05; y < 2; y += 0.08) d.seg([0.03, y, 0], [0.21, y, 0], '#9aa3a6'); } });
  root.RongqiaoMarketArt = { H, BAY, GOODS, fillOf, quad, bricks, tiles, sign, atS, atW, interiorFace, exteriorFace, GREEN, DGREEN, BLUE, STEEL, DSTEEL, SIGNW };
})(typeof window !== 'undefined' ? window : globalThis);
