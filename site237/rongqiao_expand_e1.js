/* 榕桥区扩张 E1 (2026-10-17): the district grows north, south and west together (district-expansion-plan.md, re-sequenced).
 * Pure data, loaded after every other *_extension.js and before core.js. Replaces the P2 construction hoardings with real
 * blocks and fills every new metre with buildings, lanes, paved yards, planted green, parking or courts (no bare lots).
 *   北：井槐北里 old six-to-eight storey compound (west plot, with 握手楼 urban-village column, 槐西巷, pocket park, court),
 *       槐北横街南 shop row (east_a), 社康 + 井槐里幼儿园 + shop row + 槐北花园 nine-to-eleven storey compound (east_b),
 *       槐北横街 continued east as a compound road, 槐东里 towers beyond the east service road.
 *   南：南关小街 two/three-storey shop row with 南巷 back lane, planted frontage along the main road, 公厕, 垃圾转运站.
 *   西：bounds x0 -24 -> -42 (槐西巷 and the old west blocks become walkable), background urban village beyond.
 * Ground grows 20 m west and 24 m south (origin shift; every consumer reads G.origin). All names / storeys 未经Leo确认.
 * Chunk index entries go to RONGQIAO_LATE_CHUNKS, appended by js/rongqiao_register.js after the P2/P3 chunks (save prefix). */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH;
  if (!D || !N || D.rongqiaoExpandE1) return; D.rongqiaoExpandE1 = 1;
  const G = D.ground, BX0 = -42, BY0 = -38, GX0 = -64, GY0 = -64;
  let seed = 20261018; const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = (a) => a[(R() * a.length) | 0];
  // ---- ground: prepend columns (west) and rows (south) ----
  const addC = Math.max(0, Math.round((G.origin[0] - GX0) / G.chunk)), addR = Math.max(0, Math.round((G.origin[1] - GY0) / G.chunk));
  if (addC) { G.data_south_to_north = G.data_south_to_north.map((row) => { let s = ''; for (let c = 0; c < addC; c++) s += R() < 0.5 ? 'K' : 'G'; return s + row; }); G.cols += addC; G.origin = [G.origin[0] - addC * G.chunk, G.origin[1]]; }
  if (addR) { const rows = []; for (let r = 0; r < addR; r++) rows.push('K'.repeat(G.cols)); G.data_south_to_north = rows.concat(G.data_south_to_north); G.rows = G.data_south_to_north.length; G.origin = [G.origin[0], G.origin[1] - addR * G.chunk]; }
  { const end = G.origin[0] + G.cols * G.chunk, tail = Math.max(0, Math.ceil((224 - end) / G.chunk));   // shared_home_scene.js would pad to x 224 later; pad now so E1 can paint there
    if (tail) { G.data_south_to_north = G.data_south_to_north.map((row) => row + 'G'.repeat(tail)); G.cols += tail; } }
  function paint(rect, tile, fn) {
    const [ox, oy] = G.origin, ch = G.chunk;
    const c0 = Math.max(0, Math.floor((rect[0] - ox) / ch)), c1 = Math.min(G.cols, Math.ceil((rect[2] - ox) / ch));
    const r0 = Math.max(0, Math.floor((rect[1] - oy) / ch)), r1 = Math.min(G.rows, Math.ceil((rect[3] - oy) / ch));
    for (let r = r0; r < r1; r++) {
      const a = G.data_south_to_north[r].split('');
      for (let c = c0; c < c1; c++) { const x = ox + (c + 0.5) * ch, y = oy + (r + 0.5) * ch; if (x >= rect[0] && x < rect[2] && y >= rect[1] && y < rect[3]) { const t = fn ? fn(x, y, a[c]) : tile; if (t) a[c] = t; } }
      G.data_south_to_north[r] = a.join('');
    }
  }
  const road = () => (R() < 0.72 ? 'A' : 'B');
  D.bounds = Object.assign({}, D.bounds, { x0: Math.min(D.bounds.x0, BX0), y0: Math.min(D.bounds.y0, BY0) });
  // ---- object lists per chunk ----
  const lists = {}, base = [], solids = [], colliders = [];
  let CUR = null; const use = (id) => { CUR = id; lists[id] = lists[id] || []; };
  const at = (id, type, x, y, more) => lists[CUR].push(Object.assign({ id, type, x, y }, more || {}));
  const used = new Set(); const uid = (s) => { let k = s, n = 1; while (used.has(k)) k = s + '_' + n++; used.add(k); return k; };
  const put = (id, type, x, y, more) => at(uid(id), type, x, y, more);
  // ---- buildings: 3 m facade modules (S face 5/4 modules, W face 4/3), roof, solid rect ----
  /* E1v: every block takes a seeded style from RONGQIAO_VARIETY (era, material, roof, floors within the family range, renovated
   * units next to old barred / laundry ones); some 15x12 blocks become 12x12 and some 12x9 become 9x9 with a 3 m offset so
   * widths, gaps and building lines vary. Footprints only ever shrink inside the planned lot (no new overlaps). 未经Leo确认 */
  const V = window.RONGQIAO_VARIETY;
  const VW = /^(hw|c1_|c2_|sg|wv|ea|ne|hd|hy_)/;
  function bld(id, x0, y0, o) {
    const fg = 'rqe_' + id, fam = o.fam || id.replace(/\d+$/, '').replace(/_\d+$/, '_');
    const vr = V.rng('w:' + fg); let A = o.t !== 'B', W = A ? 15 : 12, Dp = A ? 12 : 9, size = A ? 'a' : 'b';
    if (o.vw !== false && VW.test(id) && vr() < 0.24) { const sh = vr() < 0.5 ? 3 : 0; x0 += sh; W -= 3; if (A) { size = 's12'; } else { Dp = 9; size = 's9'; } }
    const S = V.style(fg, fam, o.f, { range: o.fr, keepF: o.keepF, size, bays: W / 3, era: o.era, reno: o.reno });
    const nS = W / 3, nW = Dp / 3, F = S.F, wall = o.wallKeep ? o.wall : S.mat;
    const shops = o.shops || {}, wshops = o.wshops || {}, door = o.door == null ? Math.floor(nS / 2) : Math.min(o.door, nS - 1), balc = o.balc == null ? 0.33 : o.balc, ac = o.ac == null ? 0.18 : o.ac;
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = 0; b < nS; b++) {
        const x = x0 + b * 3, k = `${fg}_S${f}_${b}`;
        if (f === 1 && shops[b]) {
          const [kind, state, sign] = shops[b];
          put(k + '_shop', kind === 'e' ? 'f_eatery' : 'f_shop', x, y0, { z, state, fade_group: fg });
          if (sign) put(k + '_sign', 'rq_x_sign_s', x, y0, { z: 2.42, variant: sign, fade_group: fg });
          continue;
        }
        put(k + '_wall', 'f_wall', x, y0, { z, state: st, fade_group: fg, variant: wall });
        if (f === 1 && b === door) { put(k + '_door', 'f_door', x, y0, { z, state: 'closed', fade_group: fg }); if (o.steps) put(k + '_steps', 'f_steps', x + 1.5, y0 - 0.02, { fade_group: fg }); }
        else if (f === 1) put(k + '_win', 'f_window', x, y0, { z, state: 'intact', fade_group: fg, night_lit: R() < 0.55, variant: S.R() < 0.5 ? 'w1' : pick(S.win) });
        else { const u = V.unit(S, f, b, balc, 'S');
          if (u.kind === 'balc') put(k + '_balc', 'f_balcony', x, y0, { z, state: u.state, fade_group: fg, variant: u.variant });
          else put(k + '_win', 'f_window', x, y0, { z, state: 'intact', fade_group: fg, night_lit: u.reno || R() < 0.55, variant: u.variant }); }
        if (f > 1 && R() < ac) put(k + '_ac', 'f_ac', x + 2.4, y0, { z: z + 0.5, fade_group: fg, variant: V.acVariant(S) });
      }
      for (let b = 0; b < nW; b++) {
        const y = y0 + 3 + b * 3, k = `${fg}_W${f}_${b}`;
        if (f === 1 && wshops[b]) {
          const [kind, state, sign] = wshops[b];
          put(k + '_shop', kind === 'e' ? 'f_eatery' : 'f_shop', x0, y, { z, rot: 6, state, fade_group: fg });
          if (sign) put(k + '_sign', 'rq_x_sign_w', x0, y - 3, { z: 2.42, variant: sign, fade_group: fg });
          continue;
        }
        put(k + '_wall', 'f_wall', x0, y, { z, rot: 6, state: st, fade_group: fg, variant: wall });
        if (o.wdoor === b && f === 1) put(k + '_door', 'f_door', x0, y, { z, rot: 6, state: 'closed', fade_group: fg });
        else { const u = f > 1 ? V.unit(S, f, nS + b, 0, 'W') : { variant: pick(['base', 'w1', 'w2']) };
          put(k + '_win', 'f_window', x0, y, { z, rot: 6, state: 'intact', fade_group: fg, night_lit: u.reno || R() < 0.5, variant: u.variant }); }
        if (f > 1 && R() < ac * 0.6) put(k + '_ac', 'f_ac', x0, y - 0.6, { z: z + 0.5, rot: 6, fade_group: fg, variant: V.acVariant(S) });
      }
    }
    if (F > 2) put(fg + '_pipe', 'f_pipe', x0 + W - 0.4, y0, { fade_group: fg });
    const roofType = size === 'a' ? 'b_roof_a' : size === 'b' ? 'b_roof_b' : size === 's12' ? 'rq_v_roof12' : 'rq_v_roof9';
    const roofV = size === 's12' || size === 's9' ? (['r_tank', 'r_shed', 'r_solar', 'r_green'].includes(S.roof) ? S.roof : 'r_tank') : S.roof === 'c' && size === 'a' ? 'base' : S.roof;
    put(fg + '_roof', roofType, x0, y0, { z: F * 3, fade_group: fg, variant: V.tile ? V.tile(roofV, roofType, fg) : roofV });
    const r = [x0 - 0.32, y0 - 0.32, x0 + W, y0 + Dp];
    solids.push([x0, y0, x0 + W, y0 + Dp]); colliders.push({ id: fg, rect: r });
    BUILT.push({ id: fg, fam, x0, y0, W, D: Dp, F, mat: wall, roof: roofType + '/' + roofV, reno: S.reno.size });
    return r;
  }
  const BUILT = [];
  /** a solid kiosk-type piece (own footprint collides) registered as a forbidden solid too */
  function kiosk(id, type, x, y, w, d, more) { put('rqe_' + id, type, x, y, more); solids.push([x, y, x + w, y + d]); }
  // ---- greenery helpers ----
  function tree(x, y, v) { paint([x - 1, y - 1, x + 1, y + 1], 'T'); put(`rqe_tree_${x}_${y}`, 'p_tree', x, y, { variant: v || (R() < 0.35 ? 't2' : 'base') }); }
  const SHR = ['dj', 'hy', 'hs', 'sj', 'sw', 'gb'];
  /** planted bed: grass tiles fully dressed with flowerbeds / shrubs (a 2 m grid, none left bare) */
  function planted(rect, opt = {}) {
    paint(rect, null, (x, y, c) => (c === 'T' ? null : 'G'));
    const [x0, y0, x1, y1] = rect, step = opt.step || 2;
    for (let y = y0 + step / 2; y < y1 - 0.4; y += step) for (let x = x0 + step / 2; x < x1 - 0.4; x += step) {
      if (opt.skip && opt.skip(x, y)) continue;
      const r = R();
      if (opt.beds !== false && r < 0.22 && x + 3 <= x1 && y + 1.2 <= y1 && !opt.noBedAt?.(x, y)) { put(`rqe_bed_${x}_${y}`, 'rq_x_bed', x - 0.9, y - 0.6, { variant: pick(['a', 'b', 'c']) }); x += 2; continue; }
      put(`rqe_shrub_${x}_${y}`, 'rq_x_shrub', x + (R() - 0.5) * 0.5, y + (R() - 0.5) * 0.5, { variant: opt.shrubs ? pick(opt.shrubs) : pick(SHR) });
    }
  }
  function hedgeX(x0, x1, y) { for (let x = x0 + 1; x <= x1 - 1; x += 2) put(`rqe_hedge_${x}_${y}`, 'p_hedge', x, y); }
  function hedgeY(x, y0, y1) { for (let y = y0 + 1; y <= y1 - 1; y += 2) put(`rqe_hedge_${x}_${y}`, 'p_hedge', x, y, { rot: 6 }); }
  function lamp(x, y) { put(`rqe_lamp_${x}_${y}`, 'p_lamp', x, y, { interact: 'lamp' }); }
  function cars(x0, x1, y, rot, gap) { for (let x = x0; x <= x1; x += rot === 2 ? 5.4 : 2.7) { if (R() < (gap || 0.18)) continue; put(`rqe_car_${x}_${y}`, 'p_car', x, y, { rot: rot || 0, state: 'normal', variant: R() < 0.12 ? 'red' : R() < 0.04 ? 'taxi' : 'base' }); } }
  function carsY(x, y0, y1) { for (let y = y0; y <= y1; y += 5.4) { if (R() < 0.18) continue; put(`rqe_car_${x}_${y}`, 'p_car', x, y, { rot: 0, state: 'normal', variant: R() < 0.12 ? 'red' : 'base' }); } }
  const SHOPS = [['s', 'window', 'ly'], ['e', 'noodle', 'mn'], ['s', 'door', 'wj'], ['e', 'kuaican', 'cf'], ['s', 'window', 'sg'], ['s', 'door', 'lf'], ['e', 'tea', 'ts'], ['s', 'window', 'xs'], ['s', 'door', 'bl'], ['s', 'window', 'zy'], ['e', 'tea', 'cy'], ['s', 'window', 'yj'], ['s', 'door', 'gx']];
  let shopK = 0; const nextShop = () => SHOPS[shopK++ % SHOPS.length];
  const shopRow = (n, skip) => { const o = {}; for (let b = 0; b < n; b++) if (!(skip || []).includes(b)) o[b] = nextShop(); return o; };

  // =====================================================================================================
  // 北 · 井槐北里 (west plot, x -42..16, y 48..140)
  // =====================================================================================================
  use('rqe_nw');
  paint([BX0, 48, 16, 56], 'K'); paint([BX0, 48, 16, 49.5], 'S'); paint([BX0, 54.5, 16, 56], 'S');           // 井槐北里横巷
  paint([BX0, 56, -37, 140], 'K'); paint([-25, 56, -21, 140], 'K'); paint([-6, 56, 0, 140], 'K');             // 槐西巷, 里巷
  paint([-37, 56, 16, 140], 'S');                                                                              // yards between blocks (paved)
  // 握手楼 column (12x9, 2.5 m gaps)
  [57, 68.5, 80, 91.5, 103, 114.5, 126].forEach((y, i) => bld(`hw${i}`, -37, y, { t: 'B', f: 6 + (i % 3), fr: [4, 9], wall: pick(['p1', 'base', 'w2']), balc: 0.45, ac: 0.3, shops: i === 0 ? shopRow(4) : (i % 2 ? { 0: nextShop() } : {}), wshops: i === 3 ? { 1: ['s', 'door', 'xs'] } : {} }));
  for (const y of [66, 77.5, 89, 100.5, 112, 123.5]) { put(`rqe_hwbike_${y}`, 'p_ebike', -31, y + 1.25, { rot: 0 }); put(`rqe_hwbin_${y}`, 'p_trashbin', -26, y + 1.2); }
  paint([-37, 135, -25, 140], 'S'); hedgeX(-37, -25, 138.6);
  // 6-7 storey blocks, two columns
  const NROWS = [58, 76, 94, 112, 128];
  NROWS.forEach((y, i) => {
    if (i !== 2) bld(`c1_${i}`, -21, y, { f: 6 + (i % 2), fr: [3, 7], shops: i === 0 ? shopRow(5) : {}, wshops: i === 1 ? { 0: ['s', 'door', 'sh'] } : {}, balc: 0.38 });
    if (i !== 3) bld(`c2_${i}`, 0, y, { f: 6 + ((i + 1) % 2), fr: [3, 7], wall: i % 2 ? 'base' : 'p1', shops: i === 0 ? shopRow(5) : {}, wshops: i === 0 ? { 3: ['s', 'door', 'yz'] } : i === 2 ? { 1: ['e', 'noodle', 'mn'] } : {}, balc: 0.35 });
  });
  // yards between rows (4..6 m): trees, bikes, bins, sheds
  for (const [y0, y1] of [[70, 76], [88, 94], [106, 112], [124, 128]]) {
    for (const [x0, x1] of [[-21, -6], [0, 15]]) {
      if ((x0 === -21 && (y0 === 88 || y0 === 106)) || (x0 === 0 && (y0 === 106 || y0 === 124))) continue;
      planted([x0 + 0.5, y0 + 0.4, x0 + 4.5, y1 - 0.4], { beds: false });
      put(`rqe_shed_${x0}_${y0}`, 'rq_x_shed', x0 + 6, y0 + 0.4); put(`rqe_bins_${x0}_${y0}`, 'p_bins', x1 - 2.5, y0 + 1.2);
      tree(x1 - 1.2, y1 - 1.3);
    }
  }
  // 井槐小游园 (pocket park, col1 row 2) with a public toilet
  paint([-21, 88, -6, 112], 'S');
  planted([-21, 88, -6, 91], { shrubs: ['dj', 'sj', 'hy'] }); planted([-21, 109, -6, 112], { shrubs: ['hs', 'gb', 'hy'] });
  for (const [x, y] of [[-19, 93], [-19, 101], [-12, 105], [-8.5, 92.5]]) tree(x, y);
  put('rqe_park_bench1', 'community_bench', -15, 96.5, { rot: 0 }); put('rqe_park_bench2', 'community_bench', -15, 100.5, { rot: 4 });
  put('rqe_park_fit', 'rq_x_fit', -20.5, 96); put('rqe_park_bed1', 'rq_x_bed', -17.5, 103.6, { variant: 'a' }); put('rqe_park_bed2', 'rq_x_bed', -14, 92.2, { variant: 'c' });
  kiosk('park_toilet', 'rq_x_toilet', -12, 94.6, 6, 4); paint([-12, 92.6, -6, 94.6], 'S');
  lamp(-17.2, 99); put('rqe_park_notice', 'p_notice', -9, 104.5, { rot: 0 });
  // basketball court (col2 row 3)
  paint([0, 106, 15, 128], 'S'); paint([1, 112, 14, 124], 'C');
  put('rqe_hoop_s', 'rq_x_hoop', 7.5, 112.4, { variant: 'n' }); put('rqe_hoop_n', 'rq_x_hoop', 7.5, 122.6, { variant: 's' });
  planted([0, 106.4, 15, 109.6], { shrubs: ['hy', 'hs'] });
  for (const y of [113, 117, 121]) put(`rqe_court_bench_${y}`, 'community_bench', 14.3, y, { rot: 2 });
  tree(0.6, 125.6); tree(14.2, 125.6);
  // lanes: trees, lamps, parked e-bikes, notice board + parcel lockers at the 驿站 gate
  for (const y of [64, 82, 100, 118, 134]) { tree(-39.6, y); lamp(-37.4, y + 4); }
  for (const y of [61, 79, 97, 115]) { put(`rqe_lane_eb_${y}`, 'p_ebike', -23, y, { rot: 2 }); }
  for (const y of [72, 90, 108, 126]) { tree(-3, y); }
  for (const y of [62, 84, 102, 120, 136]) lamp(-0.4, y);
  put('rqe_yz_locker', 'p_locker', -1.4, 66.5, { rot: 6 }); put('rqe_yz_notice', 'p_notice', -5.6, 57.6, { rot: 0 });
  // 横巷 (y 48..56): street trees, bins, parked e-bikes
  for (const x of [-38, -28, -16, -4, 8]) tree(x, 51.5);
  for (const x of [-33, -22, -10, 3, 13]) put(`rqe_hx_eb_${x}`, 'rq_ebikes', x - 1.3, 52.6, { variant: R() < 0.5 ? 'a' : 'b' });
  put('rqe_hx_bins', 'p_bins', -26.5, 49.2); put('rqe_hx_vend', 'p_vending', 15.2, 57.2);
  // west of the old blocks (x -42..-16, y 0..48): gaps planted, a 4-storey 握手楼 fills x -43..-31 y 36..45
  bld('wq0', -43.6, 36, { t: 'B', f: 4, balc: 0.5, ac: 0.3 });
  planted([-42, 29.4, -31.5, 35.6]); planted([-42, 45.4, -31.5, 48]); planted([-28, 15.8, -16.4, 19.4], { beds: false }); planted([-42, 15.8, -31.5, 19.4], { beds: false });
  planted([-30.6, 29.4, -16.4, 34.4], { beds: false }); planted([-31, 5.8, -28.6, 15.6], { beds: false }); paint([BX0, 0, -24, 5.8], 'S'); for (const x of [-38, -30]) tree(x, 3.2);

  // =====================================================================================================
  // 北 · 槐北横街南 shop row (east_a, x 32..96, y 48..82)
  // =====================================================================================================
  use('rqe_n_mid');
  paint([32, 48, 96, 50], 'S'); paint([32, 50, 96, 56], 'K'); paint([32, 56, 96, 59], 'S');
  [[33, 'p1'], [49, 'base'], [65, 'w2'], [81, 'p1']].forEach(([x, w], i) => bld(`ea${i}`, x, 59, { f: 6 + (i % 2), fr: [4, 7], wall: w, shops: shopRow(5), balc: 0.4 }));
  for (let x = 34; x < 95; x += 16) { cars(x + 1.4, x + 12, 53, 0); }
  for (const x of [48.5, 64.5, 80.5]) tree(x, 57.3);
  for (const x of [40, 72]) lamp(x, 49.2);
  paint([32, 71, 96, 74], 'K'); planted([32, 74, 96, 81.6], { skip: (x, y) => (x > 37 && x < 44) || (x > 69 && x < 76) });
  paint([37, 74, 44, 82], 'S'); paint([69, 74, 76, 82], 'S'); put('rqe_ea_shed1', 'rq_x_shed', 37.5, 74.6); put('rqe_ea_shed2', 'rq_x_shed', 69.5, 74.6);
  put('rqe_ea_bins', 'p_bins', 58, 72.6); put('rqe_ea_bins2', 'p_bins', 90, 72.6);

  // =====================================================================================================
  // 北 · 社康 / 幼儿园 / shop row (x 96..184, y 48..92) and 槐北横街 east
  // =====================================================================================================
  use('rqe_ne_s');
  paint([96, 48, 184, 50], 'S'); paint([96, 50, 184, 55], 'K'); paint([96, 55, 184, 58], 'S');
  bld('clinic', 98, 58, { f: 3, keepF: true, vw: false, era: 'e00', reno: false, wall: 'w1', shops: { 0: ['s', 'window', 'sk'], 1: ['s', 'window', null], 3: ['s', 'window', 'yy'], 4: ['s', 'door', null] }, door: 2, steps: true, balc: 0, ac: 0.3 });
  put('rqe_clinic_bike', 'rq_ebikes', 99, 55.2, { variant: 'a' }); put('rqe_clinic_bench', 'community_bench', 110, 56.4, { rot: 0 });
  bld('kinder', 117, 58, { f: 2, keepF: true, vw: false, era: 'e00', reno: false, wall: 'w2', shops: { 1: ['s', 'window', 'ye'], 3: ['s', 'window', null] }, door: 2, balc: 0, ac: 0 });
  bld('ne0', 136, 58, { f: 6, fr: [4, 8], shops: shopRow(5), balc: 0.4 });
  bld('ne1', 155, 58, { f: 7, fr: [4, 8], wall: 'base', shops: shopRow(5), balc: 0.4 });
  bld('ne2', 172, 58, { t: 'B', f: 4, fr: [3, 6], shops: shopRow(4), balc: 0.4 });
  for (const x of [114.5, 133.5, 152.5, 170.6]) tree(x, 52.5);
  planted([96, 58, 97.7, 70], { beds: false, step: 1.6 }); planted([113.2, 58, 116.8, 70], { beds: false }); planted([132.2, 58, 135.8, 70], { beds: false });
  planted([151.2, 58, 154.8, 70], { beds: false }); put('rqe_ne_eb1', 'p_ebike', 171, 63, { rot: 2 }); planted([172, 67.2, 184, 70], { beds: false });
  cars(119, 131, 52.8, 0); cars(138, 150, 52.8, 0); cars(157, 168, 52.8, 0); for (const x of [104, 146, 178]) lamp(x, 49.2);
  // 幼儿园 yard (soft court, play set, hedges), clinic rear garden, central garden + court + parking
  paint([117, 70, 132, 84], 'C'); hedgeX(117, 132, 84.4); hedgeY(132.4, 70, 84);
  put('rqe_kg_play1', 'rq_x_play', 119, 73); put('rqe_kg_play2', 'rq_x_play', 125.5, 78.5); put('rqe_kg_shrub1', 'rq_x_shrub', 130.5, 72, { variant: 'dj' }); tree(130.4, 81.6);
  planted([98, 70, 116.6, 84], { skip: (x, y) => x > 103 && x < 110 && y < 76 }); paint([103, 70, 110, 76], 'S'); put('rqe_cl_shed', 'rq_x_shed', 103.5, 70.4);
  paint([136, 70, 184, 84], 'S'); paint([158, 72, 172, 83], 'C'); put('rqe_c2_hoop_s', 'rq_x_hoop', 165, 72.4, { variant: 'n' }); put('rqe_c2_hoop_n', 'rq_x_hoop', 165, 82.6, { variant: 's' });
  planted([136, 70, 157.4, 84], { skip: (x, y) => y > 75 && y < 79 && x > 140 && x < 152 });
  put('rqe_g_bench1', 'community_bench', 144, 76.4, { rot: 0 }); put('rqe_g_bench2', 'community_bench', 150, 76.4, { rot: 0 }); put('rqe_g_fit', 'rq_x_fit', 152.6, 75.6);
  for (const [x, y] of [[138, 72], [155.5, 81.5], [138, 82]]) tree(x, y);
  paint([173, 70, 184, 84], 'K'); carsY(176, 73, 81); carsY(180.6, 73, 81);
  // 槐北横街 continued east (x 96..184) as a compound road
  paint([96, 84, 184, 86], 'S'); paint([96, 86, 184, 92], null, road); paint([96, 92, 184, 94], 'S');
  for (let x = 97; x < 184; x += 2) { put(`rqe_curb_hs${x}`, 'p_curb', x, 85.9); put(`rqe_curb_hn${x}`, 'p_curb', x, 92.1); }
  for (const x of [100, 124, 148, 172]) lamp(x, 92.6);
  for (const x of [108, 116, 140, 156, 180]) tree(x, 84.9);

  // =====================================================================================================
  // 北 · 槐北花园 (x 96..184, y 94..140), nine to eleven storeys, internal lanes, garden
  // =====================================================================================================
  use('rqe_ne_n');
  paint([96, 94, 184, 140], 'S');
  const GX = [99, 120, 141, 162];
  GX.forEach((x, i) => {
    bld(`hy_a${i}`, x, 94, { f: 9 + (i % 2), fr: [8, 12], wall: 'w1', balc: 0.5, ac: 0.3, wshops: i === 0 ? { 0: ['s', 'door', 'hy'] } : {} });
    bld(`hy_b${i}`, x, 112, { f: 10 + (i % 2), fr: [8, 12], wall: i % 2 ? 'w2' : 'w1', balc: 0.5, ac: 0.3 });
    bld(`hy_c${i}`, x, 130, { t: 'B', f: 9, fr: [6, 10], wall: 'w1', balc: 0.5, ac: 0.3 });
  });
  for (let i = 0; i < 3; i++) { const x = GX[i] + 15; planted([x + 0.4, 94.4, x + 5.6, 106], { beds: false }); planted([x + 0.4, 112.4, x + 5.6, 124]); tree(x + 3, 99.5); tree(x + 3, 118); }
  planted([177, 94.4, 184, 106], { beds: false }); planted([177, 112.4, 184, 124], { beds: false }); planted([174.4, 130.4, 184, 139.6], { beds: false });
  for (let i = 0; i < 3; i++) { const x = GX[i] + 12; planted([x + 0.4, 130.4, x + 8.6, 139.6], { beds: i !== 1 }); }
  for (const [y0, y1] of [[106, 112], [124, 130]]) { paint([96, y0, 184, y1], 'K'); cars(101, 176, y0 + 2.6, 2); for (const x of [117.5, 138.5, 159.5]) tree(x, y1 - 1.1); }
  planted([96, 94, 98.6, 140], { beds: false, step: 1.6 });

  // =====================================================================================================
  // 北 · 槐东里 (x 184..224, y 54..140): service road continued north, three towers, court, grove
  // =====================================================================================================
  use('rqe_ne_e');
  paint([184, 56, 192, 140], null, road); paint([192, 54, 196, 140], 'S');
  [60, 82, 104, 126].forEach((y, i) => bld(`hd${i}`, 196, y, { t: i === 3 ? 'B' : 'A', f: i === 3 ? 8 : 11, fr: i === 3 ? [6, 9] : [9, 13], wall: 'w2', balc: 0.5, ac: 0.3, wshops: i === 0 ? { 0: ['s', 'door', 'bl'], 2: ['e', 'kuaican', 'cf'] } : {} }));
  for (const [y0, y1] of [[72, 82], [94, 104], [116, 126]]) { planted([196, y0 + 0.4, 211, y1 - 0.4], { skip: (x, y) => x > 199 && x < 204 }); tree(208, y0 + 5); paint([199.5, y0, 204, y1], 'S'); }
  paint([211, 56, 224, 140], 'S'); paint([212, 60, 223, 74], 'C'); put('rqe_c3_hoop_s', 'rq_x_hoop', 217.5, 60.4, { variant: 'n' }); put('rqe_c3_hoop_n', 'rq_x_hoop', 217.5, 73.6, { variant: 's' });
  planted([211, 56, 224, 59.6], { beds: false }); planted([211, 74.4, 224, 140], { step: 2.2 });
  for (const y of [80, 92, 104, 116, 128]) { tree(214, y); tree(220.5, y + 6); }
  for (const y of [64, 88, 112, 136]) lamp(192.6, y);
  planted([184, 54, 196, 56], { beds: false }); planted([196, 136, 211, 140], { beds: false }); planted([208.2, 126, 211, 136], { beds: false });
  planted([196, 48, 201.6, 54], { beds: false }); planted([220.2, 48, 224, 54], { beds: false }); planted([196, 54, 224, 59.6], { skip: (x) => x > 199 && x < 204 }); paint([199.5, 54, 204, 60], 'S');
  lamp(182.4, 128.8); lamp(182.4, 110.8);

  // =====================================================================================================
  // 南 · planted frontage, 南关小街 shop row, 南巷, 公厕, 垃圾转运站 (y -38..-10)
  // =====================================================================================================
  const SBLD = [[60, 2], [75, 2], [90, 3], [105, 2], [120, 2], [135, 2], [150, 2], [165, 2]];
  const OLD_S = [[-42.3, -30], [-27.3, -15], [-10.3, 2], [4.7, 17], [30.7, 43], [45.7, 58]];
  const gapsS = [[-30, -27.3], [-15, -10.3], [2, 4.7], [17, 30.7], [43, 45.7], [58, 60]].concat(SBLD.map(([x]) => [x + 12, x + 15]));
  const inGap = (x) => gapsS.some(([a, b]) => x > a - 1 && x < b + 1);
  for (const [name, x0, x1] of [['rqe_s_w', BX0, 58], ['rqe_s_m', 58, 130], ['rqe_s_e', 130, 224]]) {
    use(name);
    // frontage between the pavement and the row: planted strip y -20..-14 with paved gaps, wider pavement y -14..-10
    const fx1 = Math.min(x1, 196);
    paint([x0, -14, fx1, -10], null, (x, y, c) => (c === 'T' ? null : 'S'));
    if (x0 < fx1) planted([x0, -20, fx1, -14.4], { skip: (x, y) => inGap(x) || (x > 33 && x < 49) || (x > 15.5 && x < 32.5) });
    for (let x = Math.ceil(x0 / 2) * 2; x < fx1; x += 2) if (inGap(x + 1) || (x > 33 && x < 49)) paint([x, -20, x + 2, -14], 'S');
    for (let x = x0 + 4.5; x < x1 - 1; x += 9) if (!(x > 14 && x < 34) && !(x > 35 && x < 47) && !(x0 < 56 && x < 56)) tree(+x.toFixed(1), -12.6);
    for (const [a, b] of gapsS) if (a >= x0 && b <= x1 && b - a < 5) { paint([a, -29.3, b, -20], 'S'); put(`rqe_gap_bike_${a}`, 'p_bike', (a + b) / 2, -24.5, { rot: 2, state: 'parked' }); }
    // back lane 南巷 y -38..-29.3 with a paved apron along the shopfronts, planters along the south fence (槐北街 x 15..33 passes through)
    const road_ = (x) => x > 14.5 && x < 33.5;
    paint([x0, -38, x1, -29.3], 'K'); paint([x0, -32, x1, -29.3], 'S');
    for (let x = x0 + 1; x < x1 - 0.5; x += 2) if (!road_(x)) put(`rqe_fence_${x}`, 'w_fence', x, -38.25);
    for (let x = x0 + 3; x < x1 - 2; x += 9) { if (road_(x) || road_(x + 3)) continue; if (R() < 0.5) put(`rqe_sl_bed_${x}`, 'rq_x_bed', x, -37.7, { variant: pick(['a', 'b', 'c']) }); else put(`rqe_sl_shrub_${x}`, 'rq_x_shrub', x + 1, -37.2, { variant: pick(SHR) }); }
    for (let x = x0 + 7; x < x1 - 2; x += 18) if (!road_(x)) lamp(x, -36.8);
    // background parking lot and hedge beyond the bound (y -64..-38.6)
    paint([x0, -64, x1, -38.6], 'K');
    for (let x = x0 + 2; x < x1 - 2; x += 2.6) if (!road_(x) && !road_(x + 2.5)) put(`rqe_sp_mark_${x}`, 'modern_parking', x, -47);
    for (const [y, g] of [[-44.4, 0.35], [-54, 0.45]]) for (let x = x0 + 3.2; x <= x1 - 3; x += 2.7) { if (road_(x) || R() < g) continue; put(`rqe_car_${x}_${y}`, 'p_car', x, y, { rot: 0, state: 'normal', variant: R() < 0.12 ? 'red' : R() < 0.04 ? 'taxi' : 'base' }); }
    for (let x = x0 + 8; x < x1 - 4; x += 16) if (!road_(x)) tree(x, -49.4);
    planted([x0, -40, x1, -38.6], { beds: false, step: 1.4, shrubs: ['hy', 'hs', 'gb'], skip: road_ });
  }
  for (const y of [-17, -26, -35]) { tree(19, y); tree(31, y + 1); }
  // 槐北街 runs on south past the new bound (cars arrive from the far ground edge)
  paint([16, GY0, 22, -10], 'S'); paint([22, GY0, 28, -10], null, road); paint([28, GY0, 32, -10], 'S');
  for (const l of D.traffic.lanes) if ((l.id === 'nb' || l.id === 'sb') && l.range[0] > GY0) l.range = [GY0, l.range[1]];
  use('rqe_s_w');
  // existing two-storey row gets ground-floor life on its S face toward 南巷 (decor only, the blocks are unchanged)
  for (const [k, [x0]] of OLD_S.entries()) { put(`rqe_olds_sign_${k}`, 'rq_x_sign_s', x0 + 0.3 + 3, -29.3, { z: 2.42, variant: pick(['ly', 'wj', 'lf', 'yj', 'gx']) }); put(`rqe_olds_eb_${k}`, 'p_ebike', x0 + 8.5, -31, { rot: 2 }); }
  paint([BX0, -11.5, -24, -10], 'S');
  for (const [name, list] of [['rqe_s_m', SBLD.slice(0, 5)], ['rqe_s_e', SBLD.slice(5)]]) {
    use(name);
    for (const [x, f] of list) bld(`sg${x}`, x, -29.3, { t: 'B', f, fr: [1, 3], wall: pick(['p1', 'base', 'w2']), shops: shopRow(4), balc: 0.45, ac: 0.35 });
    for (const [x] of list) { put(`rqe_sg_eb_${x}`, 'rq_ebikes', x + 12.2, -33.6, { variant: 'b' }); if (x < 165) put(`rqe_sg_bin_${x}`, 'p_trashbin', x + 13.5, -21.2); }
  }
  use('rqe_s_e');
  // 公厕 + small plaza (x 177..196), 垃圾转运站 (x 196..224, back street at the district edge, downwind)
  // x 179..188.2 y -22.5..-16.3 stays a paved small plaza: it is the reserved lot of the dev-only open-interior demo (?oidemo=1)
  paint([177, -29.3, 196, -14], 'S'); kiosk('s_toilet', 'rq_x_toilet', 190, -27.5, 6, 4); tree(194, -17.5); put('rqe_s_bench', 'community_bench', 192.4, -15.4, { rot: 0 }); lamp(190.5, -20.5);
  put('rqe_s_plaza_bed1', 'rq_x_bed', 179, -28.6, { variant: 'a' }); put('rqe_s_plaza_bed2', 'rq_x_bed', 183.5, -28.6, { variant: 'b' }); put('rqe_s_plaza_eb', 'rq_ebikes', 178.2, -25.6, { variant: 'a' });
  paint([196, -38, 224, -10], 'K'); paint([196, -14, 224, -10], 'S');
  bld('transfer', 203, -33, { t: 'A', f: 1, keepF: true, vw: false, reno: false, era: 'e80', wall: 'base', shops: { 1: ['s', 'shut', 'lj'], 2: ['s', 'shut', null] }, door: 4, balc: 0, ac: 0 });
  put('rqe_tr_truck', 'rq_x_truck', 198.5, -31); solids.push([198.5, -31, 200.9, -24]);
  for (const x of [204, 207.5, 211, 214.5]) put(`rqe_tr_bins_${x}`, 'p_bins', x, -35.4);
  planted([196, -20, 224, -14.4], { shrubs: ['hy', 'gb', 'hs'] }); planted([218.6, -38, 224, -20.4], { beds: false }); for (const y of [-34, -27, -22]) tree(221.5, y);
  hedgeY(196.6, -20, -10); for (const x of [200, 208, 216]) tree(x, -17.4);

  // =====================================================================================================
  // 西 · background urban village beyond the west bound (x -64..-43): W faces visible, not walkable
  // =====================================================================================================
  use('rqe_w_bg');
  paint([GX0, -6, BX0, 0], null, road); paint([GX0, -10, BX0, -6], 'S'); paint([GX0, 0, BX0, 4], 'S');
  paint([GX0, 4, -43, 140], 'K'); paint([GX0, -64, -43, -10], 'K');
  [8, 20, 32, 44, 56, 68, 80, 92, 104, 116, 128].forEach((y, i) => bld(`wv${i}`, -58, y, { t: 'B', f: 4 + (i % 4), fr: [3, 8], wall: pick(['p1', 'base', 'w2']), balc: 0.5, ac: 0.35, shops: i % 3 === 0 ? { 1: nextShop() } : {} }));
  [-34, -22].forEach((y, i) => bld(`wvs${i}`, -58, y, { t: 'B', f: 2 + i, balc: 0.4, ac: 0.3 }));
  for (const y of [18.5, 42.5, 66.5, 90.5, 114.5]) tree(-60, y);

  // ---- remove the P2 hoardings, retire the plots; the new blocks become forbidden solids ----
  for (const id of ['rq_north_street', 'rq_north_plots']) { const c = window.SCENE_CHUNKS && window.SCENE_CHUNKS[id]; if (c) c.objects = c.objects.filter((o) => o.type !== 'rq_hoard_s' && o.type !== 'rq_hoard_w'); }
  N.plots = []; N.version = 2; N.buildings = BUILT;
  for (const r of solids) N.solids.push(r);
  N.expansion = { phase: 'E1', bounds: { x0: BX0, y0: BY0 }, ground: { x0: GX0, y0: GY0 }, solids: solids.length,
    names: { compound: '井槐北里', urbanVillage: '槐西巷握手楼', shopRow: '槐北横街南', clinic: '井槐街道社区卫生服务中心', kinder: '井槐里幼儿园', garden: '槐北花园', east: '槐东里', south: '南关小街', backLane: '南巷', transfer: '榕桥区垃圾转运站' } };
  D.colliders = D.colliders.concat(colliders);
  D.objects = D.objects.concat(base);
  // ---- chunks (index entries appended after the P2/P3 chunks by js/rongqiao_register.js) ----
  window.SCENE_CHUNKS = window.SCENE_CHUNKS || {};
  const LATE = (window.RONGQIAO_LATE_CHUNKS = window.RONGQIAO_LATE_CHUNKS || []), src = 'rongqiao_expand_e1.js';
  const META = {
    rqe_nw: ['井槐北里', [-42, 0, 16, 140]], rqe_n_mid: ['槐北横街南', [32, 48, 96, 82]], rqe_ne_s: ['社康·幼儿园', [96, 48, 184, 94]],
    rqe_ne_n: ['槐北花园', [96, 94, 184, 140]], rqe_ne_e: ['槐东里', [184, 54, 224, 140]], rqe_s_w: ['南巷（西）', [-42, -64, 58, -10]],
    rqe_s_m: ['南关小街', [58, -64, 130, -10]], rqe_s_e: ['南关小街·转运站', [130, -64, 224, -10]], rqe_w_bg: ['槐西城中村', [-64, -64, -42, 140]],
  };
  for (const id of Object.keys(META)) { window.SCENE_CHUNKS[id] = { objects: lists[id] || [], colliders: [] }; LATE.push({ id, name: META[id][0], rect: META[id][1], src, load_m: 30, unload_m: 60 }); }
})();
