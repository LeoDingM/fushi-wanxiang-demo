/* P3 art: 榕桥菜市场 stalls and goods. Every goods-bearing frame has four baked states: full / half / empty / closed (covered).
 * Street stalls (outdoor stepped crates under the awnings), inner back-to-back bay stalls, the eight blue-pillar island stalls
 * (pork, beef & lamb, poultry, eggs / tofu, deli, dry goods, grain & oil), live-fish tanks, ice tables, wash sinks, the fair
 * scale and hand-wash point, blue pillars and pendant lamps. World orientation, rot 0 only. */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt, M = root.RongqiaoMarketArt; if (!A || !M) return;
  const { shade } = A, { GOODS, fillOf, quad, tiles, sign, atS, atW, GREEN, DGREEN, BLUE, STEEL, DSTEEL } = M;
  const PAL = {
    orange: ['#f39a2b', '#f7ae3e', '#e88420'], apple: ['#c9303b', '#d94a3e', '#b5262f', '#e3a548'], grape: ['#5b2d6e', '#6e3a82', '#4a2259'],
    dragon: ['#d8427a', '#e0558a', '#c23468'], mango: ['#f0b53a', '#e6a02a', '#d4bd3a'], pear: ['#d9d27a', '#e4dc8c', '#c8c068'], lychee: ['#c8343a', '#b02a30', '#d6503f'],
    greens: ['#4f9a35', '#6bb540', '#3c7d29', '#8cc74e'], choy: ['#3f8a2c', '#e8f0d8', '#5aa53a', '#d6e8c0'], tomato: ['#d9452f', '#e5583c', '#c43a28'],
    carrot: ['#e8862a', '#f09a3a', '#d77420'], eggplant: ['#5e2f6e', '#4d2560', '#6c3a7e'], chili: ['#d32f2f', '#e64a2a', '#b71c1c'], cucumber: ['#3f7f2c', '#4f9238', '#5ea444'],
    potato: ['#c9a46a', '#b8935a', '#d6b47a'], cabbage: ['#b9d88a', '#a7cc72', '#cfe5a0'], corn: ['#f0d050', '#e8c23e', '#d9b232'], garlic: ['#efe7d6', '#ddd2bc', '#f6f0e4'],
    pork: ['#d4605e', '#e07a76', '#c94a4a', '#f2c6b4'], beef: ['#9e2b2b', '#b23a35', '#8a2222', '#e8c8b4'], chicken: ['#f2d39a', '#eac283', '#f6deb0'],
    egg: ['#e2b17c', '#f3eee2', '#d9a46a', '#cfe3d8'], tofu: ['#f4f1e6', '#ebe6d6', '#fbf9f1'], puff: ['#d9a23a', '#e6b24a', '#c98f2a'], goose: ['#8b3a1d', '#a2481f', '#6e2c14'],
    mushroom: ['#5a3d2a', '#6e4c34', '#4a3122'], dates: ['#8e1f1f', '#a52a22', '#7a1818'], goji: ['#d63a2a', '#e04a32'], peanut: ['#d6b07a', '#c99f66'], shrimp: ['#e98a6a', '#f09a78', '#dd7a5a'],
    rice: ['#f2efe6', '#e8e4d8'], fish: ['#9aa7b0', '#c7d0d6', '#7f8d97'], crab: ['#c4502c', '#b04424', '#5c6b3a'], clam: ['#d8cbb0', '#c8b898', '#e6dcc6'],
  };
  const CRATE = { green: '#3c8f4e', blue: '#3a6fb0', red: '#c94a3a', yellow: '#d9a92e' };
  // ---------------------------------------------------------------- small builders
  function crate(d, x0, y0, z, x1, y1, col, h) {
    h = h || 0.2; d.box(x0, y0, z, x1, y1, z + h, col, { line: shade(col, 0.5), top: shade(col, 0.7) });
    for (let x = x0 + 0.06; x < x1 - 0.08; x += 0.12) quad(d, (u, zz) => [u, y0, zz], x, z + 0.05, x + 0.06, z + h - 0.06, shade(col, 0.6));
    d.flat(x0 + 0.03, y0 + 0.03, x1 - 0.03, y1 - 0.03, z + h - 0.02, shade(col, 0.45));
  }
  function produce(d, x0, y0, x1, y1, z, kind, fill, o) {
    if (fill <= 0) return; o = o || {};
    const pal = PAL[kind] || PAL.greens, big = { cabbage: 3, choy: 3, greens: 3, potato: 2, corn: 2, dragon: 3, mango: 2, pear: 2, chicken: 3, tofu: 3, goose: 3 }[kind] || 2;
    d.heap(x0, y0, x1, y1, z, pal, Math.min(1, fill), { size: o.size || big, step: o.step || (big >= 3 ? 0.085 : 0.06), mound: o.mound == null ? 0.1 : o.mound });
    if (kind === 'greens' || kind === 'choy') for (let i = 0; i < 10 * fill; i++) { const x = x0 + d.R() * (x1 - x0), y = y0 + d.R() * (y1 - y0), p = d.P(x, y, z + 0.08); d.g.fillStyle = '#2f6a22'; d.g.fillRect(Math.round(p[0]), Math.round(p[1]) - 2, 1, 3); }
    if (kind === 'cucumber' || kind === 'eggplant' || kind === 'carrot' || kind === 'corn') for (let i = 0; i < 14 * fill; i++) { const x = x0 + 0.05 + d.R() * (x1 - x0 - 0.15), y = y0 + 0.05 + d.R() * (y1 - y0 - 0.1); d.seg([x, y, z + 0.06], [x + 0.12, y + 0.03, z + 0.07], pal[i % pal.length], 2); }
  }
  /** price card: fluorescent star-card (yellow) or white card, stuck on a short stick at a counter edge (south face) */
  function price(d, x, y, z, i) {
    const c = ['#f5e04a', '#fdfaf0', '#f7a440', '#f5e04a'][i % 4];
    d.seg([x + 0.06, y, z], [x + 0.06, y, z + 0.08], '#6b5a3a');
    quad(d, (u, zz) => [u, y - 0.01, zz], x, z + 0.07, x + 0.15, z + 0.17, c, '#6b5a3a');
    d.px(x + 0.03, y - 0.01, z + 0.14, '#c62828', 3, 1); d.px(x + 0.04, y - 0.01, z + 0.11, '#333', 2, 1);
  }
  function qr(d, x, y, z, col) { d.box(x, y, z, x + 0.18, y + 0.03, z + 0.24, col || '#2aa14e', { line: '#1b5e2f' }); const at = (u, zz) => [u, y, zz]; quad(d, at, x + 0.03, z + 0.05, x + 0.15, z + 0.17, '#fff'); for (let i = 0; i < 9; i++) if ((i * 7 + 3) % 4) d.px(x + 0.04 + (i % 3) * 0.035, y, z + 0.15 - ((i / 3) | 0) * 0.04, '#111', 1, 1); }
  function scaleOn(d, x, y, z) { d.box(x, y, z, x + 0.32, y + 0.26, z + 0.08, '#e8e6df', { line: '#6e6a62' }); d.flat(x + 0.04, y + 0.06, x + 0.28, y + 0.24, z + 0.09, STEEL, DSTEEL); d.box(x + 0.08, y, z + 0.01, x + 0.24, y + 0.02, z + 0.06, '#1f2b26'); d.px(x + 0.1, y, z + 0.05, '#7cff8a', 3, 1); }
  function tarp(d, x0, y0, z0, x1, y1, z1, col) {
    col = col || '#2f6fb6'; d.box(x0, y0, z0, x1, y1, z1, col, { line: shade(col, 0.55), top: shade(col, 1.12) });
    for (let x = x0 + 0.3; x < x1 - 0.1; x += 0.45 + d.R() * 0.3) { d.seg([x, y0, z0 + 0.04], [x + 0.06, y0, z1 - 0.02], shade(col, 0.7)); d.seg([x, y0, z1], [x + 0.1, y1, z1], shade(col, 0.85)); }
    for (let x = x0; x < x1; x += 0.3) d.seg([x, y0, z1], [x + 0.15, y0, z1], '#f2f2f2');
  }
  // ---------------------------------------------------------------- street stall (outdoor stepped crates, 3.2 x 1.3)
  const FRUIT = ['orange', 'apple', 'mango', 'grape', 'dragon', 'pear', 'lychee', 'orange'], VEG = ['greens', 'tomato', 'carrot', 'choy', 'eggplant', 'potato', 'cucumber', 'chili'];
  A.define('rq_mk_streetstall', { name: '临街果蔬摊', states: GOODS, variants: ['fruit', 'veg'], geo: [0, 0, 0, 3.2, 1.3, 0.95], shadow: false,
    draw(d, st, v) {
      const kinds = v === 'fruit' ? FRUIT : VEG, f = fillOf(st), cols = v === 'fruit' ? ['blue', 'green', 'blue', 'red'] : ['green', 'green', 'blue', 'yellow'];
      // stepped frame: back tier (y .65-1.3, top .72), front tier (y 0-.65, top .42)
      d.box(0, 0.65, 0, 3.2, 1.3, 0.5, '#7a6a55', { line: '#3e3428' }); d.box(0, 0, 0, 3.2, 0.65, 0.2, '#7a6a55', { line: '#3e3428' });
      if (st === 'closed') { crate(d, 0.1, 0.7, 0.5, 0.85, 1.25, CRATE.blue); crate(d, 0.1, 0.7, 0.7, 0.85, 1.25, CRATE.green); crate(d, 2.2, 0.75, 0.5, 2.95, 1.25, CRATE.blue); tarp(d, 0.02, 0.02, 0.2, 3.18, 1.28, 0.62, '#2f6fb6'); return; }
      for (let i = 0; i < 4; i++) {
        const x0 = 0.05 + i * 0.78, x1 = x0 + 0.72;
        crate(d, x0, 0.7, 0.5, x1, 1.25, CRATE[cols[i]]); produce(d, x0 + 0.04, 0.74, x1 - 0.04, 1.21, 0.66, kinds[i + 4], i % 2 ? f : Math.min(1, f * 1.2));
        crate(d, x0, 0.05, 0.2, x1, 0.6, CRATE[cols[(i + 1) % 4]]); produce(d, x0 + 0.04, 0.09, x1 - 0.04, 0.56, 0.36, kinds[i], f);
        price(d, x0 + 0.2, 0.05, 0.38, i);
      }
      if (st === 'empty') { d.box(2.5, 0.12, 0.42, 2.95, 0.5, 0.62, '#c8a46a', { line: '#6e5530' }); }
      d.box(-0.05, 0.4, 0, 0.05, 0.5, 0.95, '#6c625a');
    } });
  // ---------------------------------------------------------------- inner bay stall (back-to-back with the street stall; counter faces north)
  A.define('rq_mk_bayback', { name: '背靠背内摊', states: GOODS, variants: ['fruit', 'veg', 'vacant'], geo: [0, 3.65, 0, M.BAY, 4.65, 2.2], paintBox: [0, 0, 0, M.BAY, 4.65, 2.2], shadow: false,
    draw(d, st, v) {
      const L = M.BAY, f = v === 'vacant' ? 0 : fillOf(st), kinds = v === 'fruit' ? FRUIT : VEG;
      // inner counter along the ring aisle (north edge, y 3.7-4.6): we see its vendor side; sign hangs over it
      for (const u of [0.25, L - 0.3]) d.box(u, 4.35, 0, u + 0.05, 4.4, 2.15, '#5b6164');
      d.box(0.2, 4.3, 1.75, L - 0.2, 4.36, 2.12, GREEN, { line: DGREEN });
      sign(d, atS(4.3), 0.3, L - 0.3, 1.78, 2.09, v === 'vacant' ? '招租' : v === 'fruit' ? '水果' : '蔬菜', 1, v === 'vacant' ? { bg: '#c0392b', edge: '#7b241c', frame: '#f5b7b1', size: 11 } : { size: 11 });
      d.box(0.15, 3.7, 0, L - 0.15, 4.6, 0.85, '#e9e7df', { line: '#7a776f', top: STEEL });
      tiles(d, atS(3.7), 0.15, L - 0.15, 0, 0.8, 1, '#e9e7df', 0.2);
      for (let x = 0.4; x < L - 0.6; x += 1.1) { d.box(x, 3.72, 0.1, x + 0.8, 3.74, 0.6, '#d0cdc4'); crate(d, x + 0.05, 3.76, 0.1, x + 0.75, 4.2, CRATE.green, 0.18); }
      if (st === 'closed' && v !== 'vacant') tarp(d, 0.12, 3.68, 0.85, L - 0.12, 4.62, 1.0, '#2f6fb6');
      else {
        for (let i = 0; i < 4; i++) { const x0 = 0.25 + i * (L - 0.5) / 4, x1 = x0 + (L - 0.5) / 4 - 0.06; d.flat(x0, 3.8, x1, 4.5, 0.86, '#f2f0ea', '#8f8b82'); produce(d, x0 + 0.03, 3.83, x1 - 0.03, 4.47, 0.87, kinds[(i + 2) % 8], f); }
        if (v !== 'vacant') { scaleOn(d, L - 0.75, 3.85, 0.86); qr(d, 0.3, 3.82, 0.86); }
      }
      // storage behind (crates stacked against the facade), a stool, a broom
      if (v !== 'vacant') {
        crate(d, 0.6, 0.2, 0, 1.3, 0.75, CRATE.blue); crate(d, 0.6, 0.2, 0.2, 1.3, 0.75, CRATE.blue); crate(d, 1.4, 0.2, 0, 2.1, 0.75, CRATE.green);
        if (f > 0) produce(d, 1.44, 0.24, 2.06, 0.71, 0.18, kinds[1], 0.8);
      } else { quad(d, atS(3.7), 1.2, 0.3, 2.6, 0.75, '#fdf7e8', '#b03a2e'); d.text('招租 电话 8823', ...atS(3.69)(1.28, 0.46), 7, '#b03a2e', { weight: 'normal' }); }
    } });
  // ---------------------------------------------------------------- island stalls (6 x 3.75)
  const ISL = { W: 6, D: 3.75 }, FLAP = { pork: 'L', poultry: 'L', beef: 'R', eggs: 'R', tofu: 'L', dry: 'L', deli: 'R', grain: 'R' };
  const KIND = {
    pork: { name: '猪肉', face: 'N', tray: '#f2f0ea' }, beef: { name: '牛羊肉', face: 'N', tray: '#f2f0ea' }, poultry: { name: '禽类', face: 'S', tray: '#e8eef0' }, eggs: { name: '蛋品', face: 'S', tray: '#c9c2b4' },
    tofu: { name: '豆制品', face: 'N', tray: '#dfe7ea' }, deli: { name: '熟食', face: 'N', tray: '#f2f0ea' }, dry: { name: '干货', face: 'S', tray: '#c9b083' }, grain: { name: '粮油', face: 'S', tray: '#f2efe6' },
  };
  function meatSlab(d, x, y, z, kind, big) { const pal = PAL[kind], w = big ? 0.34 : 0.24, dp = big ? 0.22 : 0.16; d.box(x, y, z, x + w, y + dp, z + 0.05, pal[(d.R() * 3) | 0], { line: shade(pal[0], 0.55), top: pal[(d.R() * 3) | 0] }); d.seg([x + 0.02, y, z + 0.035], [x + w - 0.02, y, z + 0.035], pal[3]); d.seg([x + 0.04, y + dp * 0.5, z + 0.05], [x + w - 0.05, y + dp * 0.4, z + 0.05], pal[3]); }
  function hanging(d, x0, x1, y, z, kind, n) {
    d.seg([x0, y, z], [x1, y, z], '#9aa0a3', 2); for (const x of [x0, x1]) d.box(x - 0.03, y - 0.03, 0.9, x + 0.03, y + 0.03, z + 0.02, '#8a9093');
    for (let i = 0; i < 6; i++) { const x = x0 + 0.3 + i * (x1 - x0 - 0.6) / 5; d.seg([x, y, z], [x, y, z - 0.12], '#666'); if (i < n) { const pal = PAL[kind], p = d.P(x, y, z - 0.12); d.g.fillStyle = shade(pal[0], 0.7); d.g.fillRect(Math.round(p[0]) - 3, Math.round(p[1]), 7, 13); d.g.fillStyle = pal[i % 2]; d.g.fillRect(Math.round(p[0]) - 3, Math.round(p[1]), 6, 12); d.g.fillStyle = pal[3]; d.g.fillRect(Math.round(p[0]) - 3, Math.round(p[1]), 6, 2); d.g.fillRect(Math.round(p[0]) + 1, Math.round(p[1]) + 4, 1, 6); } }
  }
  function glassCase(d, x0, y0, x1, y1, z0, z1, inner) {
    d.box(x0, y0, z0 - 0.05, x1, y1, z0, '#b8bec1', { line: DSTEEL });
    if (inner) inner();
    d.face([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], 'rgba(200,230,240,0.32)', '#7a8a90');
    d.face([[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]], 'rgba(180,215,228,0.3)', '#7a8a90');
    d.flat(x0, y0, x1, y1, z1, 'rgba(210,235,242,0.35)', '#7a8a90'); d.seg([x0 + 0.1, y0, z1 - 0.05], [x0 + 0.5, y0, z0 + 0.05], 'rgba(255,255,255,0.8)');
  }
  function counterGoods(d, kind, x0, y0, x1, y1, z, f) {
    const K = KIND[kind];
    if (kind === 'pork' || kind === 'beef') {
      d.flat(x0, y0, x1, y1, z, '#f2f0ea', '#9a968c');
      const n = Math.round(14 * f); for (let i = 0; i < n; i++) meatSlab(d, x0 + 0.08 + (i % 7) * ((x1 - x0 - 0.4) / 7), y0 + 0.08 + ((i / 7) | 0) * 0.32, z, kind, i % 3 === 0);
      d.box(x1 - 0.7, y0 + 0.1, z, x1 - 0.2, y1 - 0.1, z + 0.12, '#b48552', { line: '#6e4a26', top: '#c9a06a' }); d.seg([x1 - 0.55, y0 + 0.3, z + 0.13], [x1 - 0.32, y0 + 0.45, z + 0.13], '#d8dcde', 2);
    } else if (kind === 'poultry') {
      glassCase(d, x0, y0, x1 - 0.8, y1, z, z + 0.45, () => { d.flat(x0, y0, x1 - 0.8, y1, z + 0.01, '#e8f2f6'); const n = Math.round(10 * f); for (let i = 0; i < n; i++) { const x = x0 + 0.2 + (i % 5) * 0.75, y = y0 + 0.15 + ((i / 5) | 0) * 0.35; d.disc(x, y, z + 0.06, 0.13, PAL.chicken[i % 3], '#b08850'); d.disc(x - 0.05, y + 0.05, z + 0.1, 0.06, shade(PAL.chicken[0], 1.15)); } });
      quad(d, atS(y0 - 0.01), x0 + 0.2, z + 0.1, x0 + 0.85, z + 0.3, '#2c6fb0', '#16385a'); d.text('冰鲜', ...atS(y0 - 0.02)(x0 + 0.3, z + 0.14), 7, '#fff');
      d.box(x1 - 0.7, y0 + 0.1, z, x1 - 0.2, y1 - 0.1, z + 0.12, '#b48552', { line: '#6e4a26', top: '#c9a06a' });
    } else if (kind === 'eggs') {
      const n = Math.round(12 * f + (f > 0 ? 2 : 0));
      for (let i = 0; i < 12; i++) { const x = x0 + 0.05 + (i % 6) * ((x1 - x0) / 6), y = y0 + 0.05 + ((i / 6) | 0) * 0.4, h = 1 + ((i * 7) % 3); for (let k = 0; k < h; k++) { d.box(x, y, z + k * 0.06, x + 0.32, y + 0.32, z + k * 0.06 + 0.05, '#c9c2b4', { line: '#8a8274' }); }
        if (i < n) { const pal = [PAL.egg[i % 4], PAL.egg[(i + 1) % 4]]; for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) d.px(x + 0.04 + a * 0.07, y + 0.04 + b * 0.07, z + h * 0.06 + 0.02, pal[(a + b) % 2], 2, 2); } }
    } else if (kind === 'tofu') {
      for (let i = 0; i < 3; i++) { const a = x0 + i * (x1 - x0) / 3 + 0.04, b = a + (x1 - x0) / 3 - 0.08; d.box(a, y0, z, b, y1, z + 0.08, '#dfe7ea', { line: '#7d8a90' }); d.flat(a + 0.03, y0 + 0.03, b - 0.03, y1 - 0.03, z + 0.07, '#b9d4dc');
        const kinds = ['tofu', 'puff', 'tofu']; if (f > 0) { if (i === 1) produce(d, a + 0.04, y0 + 0.04, b - 0.04, y1 - 0.04, z + 0.07, 'puff', f, { mound: 0.08 }); else for (let k = 0; k < Math.round(8 * f); k++) d.box(a + 0.05 + (k % 4) * 0.22, y0 + 0.06 + ((k / 4) | 0) * 0.3, z + 0.07, a + 0.24 + (k % 4) * 0.22, y0 + 0.3 + ((k / 4) | 0) * 0.3, z + 0.14, PAL[kinds[i]][k % 3], { line: '#b8b2a0' }); } }
    } else if (kind === 'deli') {
      glassCase(d, x0, y0, x1 - 0.9, y1, z, z + 0.75, () => { d.flat(x0, y0, x1 - 0.9, y1, z + 0.01, '#f2e6cf'); d.seg([x0 + 0.1, y0 + 0.4, z + 0.7], [x1 - 1.0, y0 + 0.4, z + 0.7], '#999', 1);
        const n = Math.round(6 * f); for (let i = 0; i < n; i++) { const x = x0 + 0.35 + i * 0.6, p = d.P(x, y0 + 0.4, z + 0.68); d.g.fillStyle = '#5e2410'; d.g.beginPath(); d.g.ellipse(p[0], p[1] + 9, 5, 9, 0, 0, Math.PI * 2); d.g.fill(); d.g.fillStyle = i % 2 ? '#a2481f' : '#8b3a1d'; d.g.beginPath(); d.g.ellipse(p[0] - 1, p[1] + 8, 4, 8, 0, 0, Math.PI * 2); d.g.fill(); d.g.fillStyle = '#d07a3a'; d.g.fillRect(Math.round(p[0]) - 3, Math.round(p[1]) + 4, 2, 4); }
        if (f > 0) for (let i = 0; i < Math.round(5 * f); i++) d.box(x0 + 0.2 + i * 0.5, y0 + 0.1, z + 0.02, x0 + 0.55 + i * 0.5, y0 + 0.25, z + 0.07, '#b5482a', { line: '#5e2410', top: '#c4572e' }); });
      d.box(x1 - 0.8, y0 + 0.1, z, x1 - 0.2, y1 - 0.1, z + 0.1, '#b48552', { line: '#6e4a26', top: '#c9a06a' });
    } else if (kind === 'dry') {
      const kinds = ['mushroom', 'dates', 'goji', 'peanut', 'shrimp', 'mushroom', 'garlic', 'dates'];
      for (let i = 0; i < 8; i++) { const x = x0 + 0.05 + (i % 4) * ((x1 - x0) / 4), y = y0 + 0.05 + ((i / 4) | 0) * 0.42, w = (x1 - x0) / 4 - 0.12;
        d.box(x, y, z, x + w, y + 0.36, z + 0.2, '#c9b083', { line: '#7e6a44', top: '#ad9264' }); d.box(x + 0.02, y + 0.02, z + 0.2, x + w - 0.02, y + 0.34, z + 0.26, '#d8c194', { line: '#7e6a44' });
        produce(d, x + 0.05, y + 0.05, x + w - 0.05, y + 0.31, z + 0.24, kinds[i], f, { mound: 0.06 }); }
    } else if (kind === 'grain') {
      for (let i = 0; i < 4; i++) { const x = x0 + 0.05 + i * ((x1 - x0) / 4), w = (x1 - x0) / 4 - 0.1; d.box(x, y0 + 0.05, z, x + w, y1 - 0.05, z + 0.25, '#e9e2cf', { line: '#8a826e' }); if (i < 3) produce(d, x + 0.05, y0 + 0.1, x + w - 0.05, y1 - 0.1, z + 0.24, ['rice', 'peanut', 'corn'][i], f, { mound: 0.05, size: 1 }); else if (f > 0) for (let k = 0; k < Math.round(6 * f); k++) d.box(x + 0.05 + (k % 3) * 0.25, y0 + 0.1 + ((k / 3) | 0) * 0.3, z + 0.25, x + 0.22 + (k % 3) * 0.25, y0 + 0.28 + ((k / 3) | 0) * 0.3, z + 0.55, '#f0c419', { line: '#8a6a00', top: '#c0392b' }); }
    }
    for (let i = 0; i < 5; i++) price(d, x0 + 0.2 + i * (x1 - x0 - 0.5) / 4, y0, z, i);
  }
  function backShelf(d, kind, y, f) {
    // tiled spine with a steel shelf; supplies per kind
    d.box(0.1, y, 0, ISL.W - 0.1, y + 0.3, 1.7, '#e9e7df', { line: '#7a776f', top: '#cfccc2', noS: true });
    tiles(d, atS(y), 0.1, ISL.W - 0.1, 0, 1.5, 1, '#eceae2', 0.15); quad(d, atS(y), 0.1, 1.5, ISL.W - 0.1, 1.7, '#3f7f6a');
    d.box(0.3, y - 0.3, 1.0, ISL.W - 0.3, y, 1.04, STEEL, { line: DSTEEL });
    const items = { pork: '#e8e2d6', beef: '#e8e2d6', poultry: '#d6e4ea', eggs: '#c9c2b4', tofu: '#f4f1e6', deli: '#d8b07a', dry: '#c9b083', grain: '#f0c419' }[kind];
    if (f > 0) for (let x = 0.45; x < ISL.W - 0.6; x += 0.42) d.box(x, y - 0.26, 1.04, x + 0.3, y - 0.04, 1.04 + 0.12 + (x * 7 % 3) * 0.04, items, { line: shade(items, 0.55) });
    const p = atS(y)(0.5, 1.2); d.box(p[0], p[1] - 0.01, 1.18, p[0] + 0.22, p[1], 1.4, '#c62828', { line: '#7b1414' }); d.text('福', p[0] + 0.03, p[1] - 0.02, 1.23, 7, '#f6d04d');
  }
  function stall(d, kind, st) {
    const K = KIND[kind], f = fillOf(st), W = ISL.W, D = ISL.D, closed = st === 'closed';
    const fy = K.face === 'S' ? 0.1 : D - 0.95;            // front counter y0
    if (K.face === 'S') backShelf(d, kind, D - 0.3, f);
    // sign: hangs over the front counter on a pipe frame, two-sided (drawn on its south face)
    const sy = K.face === 'S' ? D - 0.32 : D - 0.12;
    for (const u of [0.4, W - 0.45]) d.box(u, sy, K.face === 'S' ? 1.7 : 0.9, u + 0.05, sy + 0.05, 2.45, '#5b6164');
    d.box(1.6, sy - 0.02, 1.98, W - 1.6, sy + 0.04, 2.42, GREEN, { line: DGREEN }); sign(d, atS(sy - 0.02), 1.6, W - 1.6, 2.0, 2.4, K.name, 1, { size: 13 });
    // side counters (L shape)
    const s0 = K.face === 'S' ? 1.0 : 0.35, s1 = K.face === 'S' ? D - 0.35 : D - 0.95;
    for (const [a, b] of [[0.1, 0.7], [W - 0.7, W - 0.1]]) { d.box(a, s0, 0, b, s1, 0.88, '#e9e7df', { line: '#7a776f', top: STEEL }); if (!closed && f > 0 && a < 1) produce(d, a + 0.05, s0 + 0.1, b - 0.05, s1 - 0.1, 0.89, { pork: 'pork', beef: 'beef', poultry: 'chicken', eggs: 'egg', tofu: 'tofu', deli: 'goose', dry: 'peanut', grain: 'rice' }[kind], f * 0.6, { mound: 0.05 }); }
    // P3b counter flap on the island-end side counter: the vendor's way in (hinged lift-up section + handle)
    const fx = FLAP[kind] === 'L' ? [0.1, 0.7] : [W - 0.7, W - 0.1], fy0 = (K.face === 'S' ? 2.0 : 1.55) - 0.38, fy1 = fy0 + 0.76;
    d.box(fx[0], fy0, 0.86, fx[1], fy1, 0.9, '#c9ced0', { line: DSTEEL }); d.seg([fx[0], fy0, 0.9], [fx[1], fy0, 0.9], '#4d5558', 2); d.seg([fx[0], fy1, 0.9], [fx[1], fy1, 0.9], '#4d5558', 2);
    d.box((fx[0] + fx[1]) / 2 - 0.06, (fy0 + fy1) / 2 - 0.02, 0.9, (fx[0] + fx[1]) / 2 + 0.06, (fy0 + fy1) / 2 + 0.02, 0.94, '#e2b13c', { line: '#7a5a12' });
    // vendor floor props (stool and rubber boots by the side, clear of where the vendor stands)
    d.box(W / 2 + 1.25, (s0 + s1) / 2, 0, W / 2 + 1.6, (s0 + s1) / 2 + 0.35, 0.42, '#2f6fb6', { line: '#173a60' });
    if (kind === 'grain' || kind === 'dry') for (let i = 0; i < 3; i++) d.box(1.0 + i * 0.7, s1 - 0.8, 0, 1.6 + i * 0.7, s1 - 0.2, 0.28 + (i % 2) * 0.28, '#f1ede2', { line: '#8a826e' });
    if (K.face === 'S') { if (kind === 'pork' || kind === 'beef') hanging(d, 0.6, W - 0.6, fy + 0.15, 1.85, kind, closed ? 0 : Math.round(5 * f)); return; }   // S-facing: the front counter is its own sorted piece
    front(d, kind, st);
    if (kind === 'pork' || kind === 'beef') hanging(d, 0.6, W - 0.6, fy + 0.15, 1.85, kind, closed ? 0 : Math.round(5 * f));
  }
  /** front counter + goods + scale + QR (or the night tarp); S-facing stalls draw it as a separate piece in front of the vendor */
  function front(d, kind, st) {
    const K = KIND[kind], f = fillOf(st), W = ISL.W, D = ISL.D, closed = st === 'closed', fy = K.face === 'S' ? 0.1 : D - 0.95;
    const sFace = K.face === 'S';
    d.box(0.1, fy, 0, W - 0.1, fy + 0.85, 0.9, '#ecebe3', { line: '#77746c', top: STEEL, noS: true });
    if (sFace) { tiles(d, atS(fy), 0.1, W - 0.1, 0, 0.82, 1, '#eceae2', 0.15); quad(d, atS(fy), 0.1, 0.55, W - 0.1, 0.63, kind === 'eggs' || kind === 'dry' || kind === 'grain' ? '#c9a24a' : '#2c6fb0'); quad(d, atS(fy), 0.1, 0.82, W - 0.1, 0.9, STEEL, DSTEEL); }
    else { quad(d, atS(fy), 0.1, 0, W - 0.1, 0.9, '#cfd3d5', DSTEEL); for (const z of [0.25, 0.55]) d.seg(atS(fy)(0.15, z), atS(fy)(W - 0.15, z), DSTEEL); for (let x = 0.4; x < W - 0.6; x += 0.7) d.box(x, fy + 0.05, 0.27, x + 0.45, fy + 0.4, 0.27 + 0.2, ['#d9c9a4', '#cfd8dc', '#e9e2cf'][(x * 3 | 0) % 3], { line: '#6e6a62' }); }
    if (closed) { tarp(d, 0.05, fy - 0.03, 0.9, W - 0.05, fy + 0.88, 1.08, kind === 'pork' || kind === 'beef' ? '#e9ecef' : '#2f6fb6'); }
    else { counterGoods(d, kind, 0.25, fy + 0.08, W - 0.25, fy + 0.8, 0.9, f); scaleOn(d, W - 1.1, fy + 0.45, 0.9); qr(d, 0.25, fy + 0.5, 0.9, kind === 'deli' ? '#1677ff' : '#2aa14e'); }
  }
  const STALL_FP = { S: [0, 0, ISL.W, ISL.D], N: [0, 0, ISL.W, ISL.D] };
  // P3b sort boxes: only the part behind the vendor (S-facing: back shelf; N-facing: the front counter on the north edge), so a vendor
  // standing inside the stall sorts in front of it, and the S-facing front counter (own piece) sorts in front of the vendor
  for (const kind of Object.keys(KIND)) if (KIND[kind].face === 'S') A.define('rq_mk_stallfront_' + kind, { name: KIND[kind].name + '摊柜台', states: GOODS, geo: [0, 0.1, 0, ISL.W, 0.95, 0.9], paintBox: [0, 0, 0, ISL.W, 1.0, 1.4], shadow: false, draw(d, st) { front(d, kind, st); } });
  for (const kind of Object.keys(KIND)) A.define('rq_mk_stall_' + kind, { name: KIND[kind].name + '摊', states: GOODS, geo: KIND[kind].face === 'S' ? [0, 2.95, 0, ISL.W, ISL.D, 1.7] : [0, 2.75, 0, ISL.W, ISL.D, 1.0], paintBox: [0, 0, 0, ISL.W, ISL.D, 2.5], shadow: false,
    draw(d, st) { stall(d, kind, st); },
    emit: kind === 'deli' || kind === 'pork' || kind === 'beef' ? (d, st) => { if (st === 'closed') return false; const y = KIND[kind].face === 'S' ? 0.5 : ISL.D - 0.5; for (const x of [1.5, 3, 4.5]) { const p = d.P(x, y, 1.6); d.g.fillStyle = 'rgba(255,90,70,0.9)'; d.g.fillRect(Math.round(p[0]) - 3, Math.round(p[1]), 6, 2); } } : null });
  // ---------------------------------------------------------------- blue pillar, pendant lamp, fair scale, hand-wash
  A.define('rq_mk_pillar', { name: '蓝色立柱', variants: ['plain', 'notice'], geo: [-0.2, -0.2, 0, 0.2, 0.2, M.H], shadow: false, draw(d, st, v) {
    d.box(-0.22, -0.22, 0, 0.22, 0.22, 0.3, '#24496f', { line: '#122438' }); d.box(-0.2, -0.2, 0.3, 0.2, 0.2, M.H, BLUE, { line: '#173251', top: '#4b7bb0' });
    d.seg([-0.2, -0.2, 0.32], [-0.2, -0.2, M.H - 0.02], '#5d8dc2');
    if (v === 'notice') { quad(d, atS(-0.21), -0.15, 1.3, 0.15, 1.75, '#f7f4ea', '#6b6b6b'); d.seg(atS(-0.22)(-0.12, 1.68), atS(-0.22)(0.12, 1.68), '#c62828'); for (let z = 1.38; z < 1.62; z += 0.06) d.seg(atS(-0.22)(-0.12, z), atS(-0.22)(0.1, z), '#888'); }
  } });
  A.define('rq_mk_lamp', { name: '吊灯', geo: [-0.25, -0.25, 2.75, 0.25, 0.25, M.H], shadow: false, draw(d) {
    d.seg([0, 0, M.H], [0, 0, 3.05], '#333'); d.face([[-0.2, -0.2, 2.85], [0.2, -0.2, 2.85], [0.08, -0.08, 3.05], [-0.08, -0.08, 3.05]], '#2f5d46', '#173326');
    d.face([[-0.2, -0.2, 2.85], [-0.2, 0.2, 2.85], [-0.08, 0.08, 3.05], [-0.08, -0.08, 3.05]], '#244a37', '#173326'); d.disc(0, 0, 2.84, 0.1, '#fff4cf', '#c9b37a');
  }, emit(d) { d.disc(0, 0, 2.84, 0.12, '#fff2c0'); const p = d.P(0, 0, 2.8); d.g.fillStyle = 'rgba(255,236,180,0.55)'; d.g.fillRect(Math.round(p[0]) - 4, Math.round(p[1]), 8, 2); } });
  A.define('rq_mk_scale', { name: '公平秤', geo: [0, 0, 0, 0.8, 0.6, 1.0], paintBox: [0, 0, 0, 0.8, 0.6, 2.2], shadow: false, draw(d) {
    d.box(0, 0, 0, 0.8, 0.6, 0.85, '#f2f1ec', { line: '#6e6a62', top: '#dcdad4' }); scaleOn(d, 0.22, 0.15, 0.85);
    for (const u of [0.05, 0.7]) d.box(u, 0.5, 0.85, u + 0.05, 0.55, 2.15, '#5b6164');
    d.box(0, 0.48, 1.6, 0.8, 0.52, 2.15, GREEN, { line: DGREEN }); sign(d, atS(0.48), 0.03, 0.77, 1.82, 2.12, '公平秤', 1, { size: 10 });
    quad(d, atS(0.479), 0.06, 1.63, 0.74, 1.79, '#fdfbf2', '#7a7a70'); d.text('短斤缺两 请复秤', ...atS(0.47)(0.08, 1.66), 6, '#b03a2e', { weight: 'normal' });
    quad(d, atS(-0.01), 0.1, 0.25, 0.7, 0.6, '#2c6fb0', '#16385a'); d.text('市场管理处', ...atS(-0.02)(0.14, 0.36), 6, '#fff', { weight: 'normal' });
  }, emit(d) { const p = d.P(0.32, 0.15, 0.9); d.g.fillStyle = '#7cff8a'; d.g.fillRect(Math.round(p[0]), Math.round(p[1]), 3, 1); } });
  A.define('rq_mk_handwash', { name: '洗手池', geo: [0, 0, 0, 1.2, 0.5, 1.0], paintBox: [0, 0, 0, 1.2, 0.5, 2.2], shadow: false, draw(d) {
    d.box(0, 0.3, 0, 1.2, 0.5, 2.0, '#e9e7df', { line: '#7a776f', top: '#cfccc2' }); tiles(d, atS(0.3), 0, 1.2, 0, 2.0, 1, '#eceae2', 0.2);
    quad(d, atS(0.299), 0.2, 1.1, 1.0, 1.6, '#a9c8d3', '#5d6f75'); d.seg(atS(0.298)(0.3, 1.5), atS(0.298)(0.5, 1.2), '#e6f4f8');
    d.box(0.1, 0, 0.62, 1.1, 0.3, 0.8, '#f6f6f2', { line: '#8a8a84', top: '#fdfdfb' }); d.flat(0.2, 0.06, 0.55, 0.26, 0.8, '#cfd8dc', '#7a8a90'); d.flat(0.65, 0.06, 1.0, 0.26, 0.8, '#cfd8dc', '#7a8a90');
    for (const u of [0.37, 0.82]) { d.box(u - 0.02, 0.24, 0.8, u + 0.02, 0.28, 0.95, STEEL); d.seg([u, 0.26, 0.95], [u, 0.16, 0.92], DSTEEL, 2); }
    d.box(0.15, 0.1, 0, 0.3, 0.25, 0.62, '#d0d0ca'); d.box(0.9, 0.1, 0, 1.05, 0.25, 0.62, '#d0d0ca');
    d.box(0.25, 0.28, 1.68, 0.95, 0.31, 1.98, '#2c6fb0', { line: '#16385a' }); sign(d, atS(0.28), 0.25, 0.95, 1.7, 1.96, '洗手', 1, { size: 10, bg: '#2c6fb0', edge: '#16385a', frame: '#bcd2ea' });
  } });
  // ---------------------------------------------------------------- aquatic: live tanks, ice tables; wash sinks
  function fish(d, x, y, z, col, flip) { const p = d.P(x, y, z), X = Math.round(p[0]), Y = Math.round(p[1]); d.g.fillStyle = col; d.g.fillRect(X - 3, Y - 1, 6, 3); d.g.fillRect(flip ? X + 3 : X - 5, Y - 2, 2, 5); d.g.fillStyle = shade(col, 1.3); d.g.fillRect(X - 2, Y - 1, 4, 1); d.g.fillStyle = '#111'; d.g.fillRect(flip ? X - 3 : X + 2, Y, 1, 1); }
  A.define('rq_mk_tanks', { name: '活鱼缸', states: GOODS, geo: [0, 0, 0, 3, 1.1, 1.95], shadow: false, draw(d, st) {
    const f = st === 'closed' ? 0.6 : fillOf(st);
    d.box(0, 0, 0, 3, 1.1, 0.3, '#5b6164', { line: '#2c3134' });
    for (let t = 0; t < 3; t++) {
      const z0 = 0.32 + t * 0.53, z1 = z0 + 0.46, at = atS(0), y0 = t * 0.12;
      d.box(0.05, y0, z0, 2.95, 1.05, z1, '#4e93b3', { line: '#2a4a58', top: '#8cc3d8', noS: true });
      quad(d, (u, z) => [u, y0, z], 0.05, z0, 2.95, z1, '#5da6c4', '#2a4a58'); quad(d, (u, z) => [u, y0, z], 0.05, z1 - 0.06, 2.95, z1 - 0.02, '#a8d8e8');
      const n = Math.round([7, 5, 6][t] * f); for (let i = 0; i < n; i++) fish(d, 0.25 + ((i * 0.43 + t * 0.2) % 2.6), y0, z0 + 0.1 + ((i * 37) % 30) / 100, ['#7f8d97', '#c47a3a', '#6b5a3a', '#9aa7b0', '#5a6e4a'][(i + t) % 5], i % 2);
      for (let i = 0; i < 4; i++) d.px(0.4 + i * 0.7, y0, z0 + 0.12 + (i % 2) * 0.15, '#e6f6fb', 1, 1);
      d.seg([0.05, y0, z1], [2.95, y0, z1], '#2a4a58');
    }
    for (const u of [0.05, 1.5, 2.95]) d.box(u - 0.03, 0, 0.3, u + 0.03, 0.04, 1.95, '#8a9093');
    d.box(0.2, 0.7, 1.92, 2.8, 0.8, 1.98, '#d0d4d6'); d.seg([0.4, 0.75, 1.98], [0.4, 0.3, 1.86], '#2c6fb0', 2);
    if (st === 'closed') quad(d, atS(-0.01), 0.05, 0.32, 2.95, 1.0, 'rgba(30,60,50,0.55)', '#1e3a30');
    quad(d, atS(-0.01), 0.9, 0.05, 2.1, 0.25, '#2c6fb0', '#16385a'); d.text('鲜活水产', ...atS(-0.02)(1.05, 0.09), 8, '#fff');
  }, emit(d, st) { for (let t = 0; t < 3; t++) { const z0 = 0.32 + t * 0.53; quad(d, (u, z) => [u, t * 0.12, z], 0.06, z0 + 0.36, 2.94, z0 + 0.42, st === 'closed' ? 'rgba(80,160,200,0.35)' : 'rgba(120,210,255,0.7)'); } } });
  A.define('rq_mk_ice', { name: '冰台', states: GOODS, variants: ['fish', 'shell'], geo: [0, 0, 0, 2.6, 1.4, 0.95], shadow: false, draw(d, st, v) {
    const f = fillOf(st);
    for (const [x, y] of [[0.1, 0.1], [2.4, 0.1], [0.1, 1.2], [2.4, 1.2]]) d.box(x, y, 0, x + 0.08, y + 0.08, 0.7, DSTEEL);
    d.box(0, 0, 0.7, 2.6, 1.4, 0.9, STEEL, { line: DSTEEL, top: '#dfe4e6' }); d.box(0.1, 0.1, 0.2, 2.5, 1.3, 0.24, '#aab1b4');
    if (st === 'closed') { for (let i = 0; i < 4; i++) d.box(0.05 + i * 0.64, 0.1, 0.9, 0.62 + i * 0.64, 1.3, 1.12, '#f4f4ef', { line: '#9a9a90' }); return; }
    d.flat(0.08, 0.08, 2.52, 1.32, 0.91, '#e3eef2', '#9fb3bb'); for (let i = 0; i < 90; i++) d.px(0.1 + d.R() * 2.4, 0.1 + d.R() * 1.2, 0.92, d.R() < 0.5 ? '#ffffff' : '#c3d9e1', 1, 1);
    if (v === 'fish') { const n = Math.round(12 * f); for (let i = 0; i < n; i++) { const x = 0.2 + (i % 6) * 0.38, y = 0.25 + ((i / 6) | 0) * 0.55, p = d.P(x, y, 0.94), c = PAL.fish[i % 3]; d.g.fillStyle = shade(c, 0.6); d.g.fillRect(Math.round(p[0]) - 6, Math.round(p[1]) - 1, 13, 4); d.g.fillStyle = c; d.g.fillRect(Math.round(p[0]) - 6, Math.round(p[1]) - 2, 12, 3); d.g.fillStyle = shade(c, 1.25); d.g.fillRect(Math.round(p[0]) - 4, Math.round(p[1]) - 2, 8, 1); d.g.fillStyle = '#222'; d.g.fillRect(Math.round(p[0]) + 4, Math.round(p[1]) - 1, 1, 1); } }
    else { const trays = ['shrimp', 'crab', 'clam', 'shrimp']; for (let i = 0; i < 4; i++) { const x0 = 0.12 + i * 0.6; d.box(x0, 0.2, 0.91, x0 + 0.52, 1.2, 0.97, '#3a6fb0', { line: '#1d3b5e' }); produce(d, x0 + 0.04, 0.24, x0 + 0.48, 1.16, 0.97, trays[i], f, { mound: 0.05, size: trays[i] === 'crab' ? 3 : 2 }); } }
    for (let i = 0; i < 4; i++) price(d, 0.2 + i * 0.6, 0, 0.9, i);
  } });
  A.define('rq_mk_wash', { name: '清洗池', geo: [0, 0, 0, 6.5, 1.2, 1.0], paintBox: [0, 0, 0, 6.5, 1.2, 2.3], shadow: false, draw(d) {
    d.box(0, 1.0, 0, 6.5, 1.2, 2.1, '#e9e7df', { line: '#7a776f', top: '#cfccc2' }); tiles(d, atS(1.0), 0, 6.5, 0, 2.1, 1, '#eceae2', 0.2);
    d.box(2.4, 0.98, 1.65, 4.1, 1.0, 2.0, GREEN, { line: DGREEN }); sign(d, atS(0.98), 2.4, 4.1, 1.66, 1.98, '清洗区', 1, { size: 11 });
    for (let i = 0; i < 3; i++) { const x0 = 0.2 + i * 2.1, x1 = x0 + 1.9; for (const x of [x0 + 0.05, x1 - 0.12]) d.box(x, 0.15, 0, x + 0.07, 0.22, 0.6, DSTEEL);
      d.box(x0, 0.1, 0.6, x1, 1.0, 0.9, STEEL, { line: DSTEEL, top: '#dfe4e6' }); d.flat(x0 + 0.1, 0.2, x1 - 0.1, 0.9, 0.9, '#7f8b90', '#55605f'); d.flat(x0 + 0.15, 0.25, x1 - 0.15, 0.85, 0.89, '#9fb8c0');
      d.box((x0 + x1) / 2 - 0.03, 0.92, 0.9, (x0 + x1) / 2 + 0.03, 0.98, 1.25, STEEL); d.seg([(x0 + x1) / 2, 0.95, 1.25], [(x0 + x1) / 2, 0.7, 1.18], DSTEEL, 2); }
    d.disc(6.2, 0.4, 0.02, 0.25, '#2c6fb0', '#16385a'); d.disc(6.2, 0.4, 0.3, 0.25, '#3a7fc0', '#16385a'); d.box(0.1, -0.05, 0, 6.4, 0.12, 0.02, '#5d6467');
  } });
  root.RongqiaoMarketStalls = { ISL, KIND, PAL, crate, produce, tarp, price, qr, scaleOn };
})(typeof window !== 'undefined' ? window : globalThis);
