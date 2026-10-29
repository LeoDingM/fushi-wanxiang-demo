/* 榕桥区扩张 E3 (2026-10-18): 榕桥老街 + 早市, 万家城中村 握手楼 grid, 南关路 — and "the old district has kept up with the
 * times" (Leo 01:10): modern office towers and a commercial area on the main roads, old buildings in the back streets.
 * Pure data, loaded after rongqiao_expand_e2.js (and before rongqiao_ebikes.js, which styles the e-bikes placed here).
 * Bounds grow west x -42 -> -106, south y -38 -> -80 and east x 224 -> 300; ground to x -128 / y -104 / x 320 (origin shift, every consumer reads G.origin).
 *   南关路 y -76..-64: four-lane avenue (painted; no live traffic lanes — the traffic model supports one intersection only),
 *          pavements both sides, green belt to the south; zebra over 槐北街 (live nb/sb stop lines).
 *   Transition pass (Leo 02:47 — towers right next to low old blocks were too abrupt): 南关路 north frontage is now 7-9F
 *          90s/00s 商住楼 with street shops; the towers moved to the new east edge (bounds x1 224 -> 300, ground to 320) beyond
 *          a 7-8F 商住楼 column and the gated 小区 南关华府 (11-17F 商品房: gate + guard booth, fence, internal road, parking,
 *          garden): 榕桥中心 26F on the 南关路 corner, 南关国际中心 20F and 汇金大厦 18F behind it, bus stop in front.
 *   榕桥汇 mall (5F, 30 x 24) on the main road north side with a bus stop; 榕桥天街 pedestrian street (modern storefronts:
 *          咖啡 茶饮 面包 花店 眼镜 手机 服饰 书店) south of the main road, 早市 plaza beside it and stalls along 老街.
 *   榕桥老街 x -76..-58: stone street from 南关路 to the river edge; the old 槐西 blocks get ground-floor shops on their W faces.
 *   万家城中村 x -106..-72, y 36..129: 5-8 storey blocks 3-4 m apart (握手楼) with alley shops.
 *   Backdrop beyond the bounds (x < -106, north-west of the river) is old blocks + water, fenced off.
 * All names / storeys / layouts 未经Leo确认. Chunks rqe_e3_* append after the E2 chunks (old saves keep their prefix). */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, V = window.RONGQIAO_VARIETY;
  if (!D || !N || !V || !D.rongqiaoExpandE2 || D.rongqiaoExpandE3) return; D.rongqiaoExpandE3 = 1;
  const G = D.ground, BX0 = -106, BY0 = -80, BX1 = 300, GX0 = -128, GY0 = -104, GX1 = 320, OLD_X1 = 224;
  let seed = 20261020; const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = (a) => a[(R() * a.length) | 0];
  // ---- ground: prepend columns (west) and rows (south) ----
  const addC = Math.max(0, Math.round((G.origin[0] - GX0) / G.chunk)), addR = Math.max(0, Math.round((G.origin[1] - GY0) / G.chunk));
  if (addC) { G.data_south_to_north = G.data_south_to_north.map((row) => 'K'.repeat(addC) + row); G.cols += addC; G.origin = [G.origin[0] - addC * G.chunk, G.origin[1]]; }
  if (addR) { const rows = []; for (let r = 0; r < addR; r++) rows.push('K'.repeat(G.cols)); G.data_south_to_north = rows.concat(G.data_south_to_north); G.rows = G.data_south_to_north.length; G.origin = [G.origin[0], G.origin[1] - addR * G.chunk]; }
  { const addE = Math.max(0, Math.round((GX1 - (G.origin[0] + G.cols * G.chunk)) / G.chunk)); if (addE) { G.data_south_to_north = G.data_south_to_north.map((row) => row + 'G'.repeat(addE)); G.cols += addE; } }
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
  D.bounds = Object.assign({}, D.bounds, { x0: Math.min(D.bounds.x0, BX0), y0: Math.min(D.bounds.y0, BY0), x1: Math.max(D.bounds.x1, BX1) });
  // ---- chunks ----
  const CH = [
    ['rqe_e3_s_w', '南关路·榕桥中心', [-42, GY0, 58, -38]], ['rqe_e3_s_e', '南关路（东）', [58, GY0, BX1 + 2, -38]],
    ['rqe_e3_sw', '榕桥老街·早市·天街', [GX0, GY0, -42, -10]], ['rqe_e3_wm', '榕桥汇·老街口', [GX0, -10, -42, 36]],
    ['rqe_e3_cv', '万家城中村', [GX0, 36, -42, 141]], ['rqe_e3_nw', '月河西段（背景）', [GX0, 141, -42, 300]],
    // transition pass (Leo 02:47): the tall buildings move to the new east edge of 南关路 (appended; old saves keep their chunk prefix)
    ['rqe_e3_east', '南关路东·南关华府·榕桥中心', [OLD_X1, GY0, GX1, 0]],
  ];
  const lists = {}; for (const [id] of CH) lists[id] = [];
  const chunkOf = (x, y) => { for (const [id, , r] of CH) if (x >= r[0] && x < r[2] && y >= r[1] && y < r[3]) return id; return x < -42 ? (y < -10 ? 'rqe_e3_sw' : y < 36 ? 'rqe_e3_wm' : y < 141 ? 'rqe_e3_cv' : 'rqe_e3_nw') : x < 58 ? 'rqe_e3_s_w' : 'rqe_e3_s_e'; };
  const used = new Set(); const uid = (s) => { let k = s, n = 1; while (used.has(k)) k = s + '_' + n++; used.add(k); return k; };
  let FORCE = null;   // while set, put() files objects into that chunk (south-side transition chunks overlap the E3 rects)
  const put = (id, type, x, y, more, inChunk) => lists[inChunk || FORCE || chunkOf(x, y)].push(Object.assign({ id: uid('rqe3_' + id), type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  const base = [], solids = [], colliders = [];
  const baseAt = (id, type, x, y, more) => base.push(Object.assign({ id: 'rqe3_' + id, type, x, y }, more || {}));
  const inX = (x, spans) => spans.some(([a, b]) => x > a && x < b);
  // ---- greenery / furniture helpers ----
  const SHR = ['dj', 'hy', 'hs', 'sj', 'sw', 'gb'];
  function planted(rect, opt = {}) {
    paint(rect, null, (x, y, c) => (c === 'T' ? null : 'G'));
    const [x0, y0, x1, y1] = rect, step = opt.step || 2;
    for (let y = y0 + step / 2; y < y1 - 0.4; y += step) for (let x = x0 + step / 2; x < x1 - 0.4; x += step) {
      if (opt.skip && opt.skip(x, y)) continue;
      if (opt.beds !== false && R() < (opt.bedP || 0.22) && x + 3 <= x1 && y + 1.2 <= y1) { put(`bed_${x}_${y}`, 'rq_x_bed', x - 0.9, y - 0.6, { variant: pick(['a', 'b', 'c']) }); x += 2; continue; }
      put(`shrub_${x}_${y}`, 'rq_x_shrub', x + (R() - 0.5) * 0.5, y + (R() - 0.5) * 0.5, { variant: opt.shrubs ? pick(opt.shrubs) : pick(SHR) });
    }
  }
  // 垂柳: three weeping-willow variants (std / big leaning / small) picked by position; the id keeps the plain name
  const wv = (x, y) => ['willow', 'willow2', 'willow', 'willow3'][Math.abs(Math.round(x * 7 + y * 13)) % 4];
  const tree = (x, y, v) => put(`t_${v}_${x}_${y}`, 'rq_x_tree', x, y, { variant: v === 'willow' ? wv(x, y) : v });
  const pitTree = (x, y, v) => { paint([x - 1, y - 1, x + 1, y + 1], 'T'); if (v) tree(x, y, v); else put(`pt_${x}_${y}`, 'p_tree', x, y, { variant: R() < 0.35 ? 't2' : 'base' }); };
  const lamp = (x, y) => put(`lamp_${x}_${y}`, 'p_lamp', x, y, { interact: 'lamp' });
  const lantern = (x, y) => put(`lan_${x}_${y}`, 'rq_x_lantern', x, y);
  const bench = (x, y, rot) => put(`bench_${x}_${y}`, 'community_bench', x, y, { rot: rot || 0 });
  const solidPiece = (id, type, x, y, rect, more) => { put(id, type, x, y, more); solids.push(rect); colliders.push({ id: 'rqe3_c_' + id, rect }); };
  function cars(x0, x1, y, rot, gap) { for (let x = x0; x <= x1; x += rot === 2 ? 5.4 : 2.7) { if (R() < (gap || 0.2)) continue; put(`car_${x}_${y}`, 'p_car', x, y, { rot: rot || 0, state: 'normal', variant: R() < 0.12 ? 'red' : R() < 0.06 ? 'taxi' : 'base' }); } }
  const SHOPS = [['s', 'window', 'ly'], ['e', 'noodle', 'mn'], ['s', 'door', 'wj'], ['e', 'kuaican', 'cf'], ['s', 'window', 'sg'], ['s', 'door', 'lf'], ['e', 'tea', 'ts'], ['s', 'window', 'xs'], ['s', 'door', 'bl'], ['s', 'window', 'zy'], ['e', 'tea', 'cy'], ['s', 'window', 'yj'], ['s', 'door', 'gx']];
  let shopK = 3; const nextShop = () => SHOPS[shopK++ % SHOPS.length];
  // ---- old blocks (E1v variety system, same module as E1/E2 bld) ----
  const BUILT = N.buildings || (N.buildings = []);
  function bld(id, x0, y0, o) {
    const fg = 'rqe_e3_' + id, fam = o.fam || 'e3_' + id.replace(/\d+$/, '');
    const A = o.t !== 'B', W = A ? 15 : 12, Dp = A ? 12 : 9, size = A ? 'a' : 'b';
    const S = V.style(fg, fam, o.f, { range: o.fr, size, bays: W / 3, era: o.era });
    const nS = W / 3, nW = Dp / 3, F = S.F, balc = o.balc == null ? 0.45 : o.balc, ac = o.ac == null ? 0.3 : o.ac, door = Math.floor(nS / 2);
    const shops = o.shops || {}, wshops = o.wshops || {};
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = 0; b < nS; b++) {
        const x = x0 + b * 3, k = `${id}_S${f}_${b}`;
        if (f === 1 && shops[b]) { const [kind, state, sign] = shops[b]; put(k + '_shop', kind === 'e' ? 'f_eatery' : 'f_shop', x, y0, { z, state, fade_group: fg }); if (sign) put(k + '_sign', 'rq_x_sign_s', x, y0, { z: 2.42, variant: sign, fade_group: fg }); continue; }
        put(k + '_wall', 'f_wall', x, y0, { z, state: st, fade_group: fg, variant: S.mat });
        if (f === 1 && b === door) put(k + '_door', 'f_door', x, y0, { z, state: 'closed', fade_group: fg });
        else if (f === 1) put(k + '_win', 'f_window', x, y0, { z, state: 'intact', fade_group: fg, night_lit: R() < 0.5, variant: pick(S.win) });
        else { const u = V.unit(S, f, b, balc, 'S');
          if (u.kind === 'balc') put(k + '_balc', 'f_balcony', x, y0, { z, state: u.state, fade_group: fg, variant: u.variant });
          else put(k + '_win', 'f_window', x, y0, { z, state: 'intact', fade_group: fg, night_lit: u.reno || R() < 0.55, variant: u.variant }); }
        if (f > 1 && R() < ac) put(k + '_ac', 'f_ac', x + 2.4, y0, { z: z + 0.5, fade_group: fg, variant: V.acVariant(S) });
      }
      for (let b = 0; b < nW; b++) {
        const y = y0 + 3 + b * 3, k = `${id}_W${f}_${b}`;
        if (f === 1 && wshops[b]) { const [kind, state, sign] = wshops[b]; put(k + '_shop', kind === 'e' ? 'f_eatery' : 'f_shop', x0, y, { z, rot: 6, state, fade_group: fg }); if (sign) put(k + '_sign', 'rq_x_sign_w', x0, y - 3, { z: 2.42, variant: sign, fade_group: fg }); continue; }
        put(k + '_wall', 'f_wall', x0, y, { z, rot: 6, state: st, fade_group: fg, variant: S.mat });
        const u = f > 1 ? V.unit(S, f, nS + b, 0, 'W') : { variant: pick(S.win) };
        put(k + '_win', 'f_window', x0, y, { z, rot: 6, state: 'intact', fade_group: fg, night_lit: u.reno || R() < 0.5, variant: u.variant });
        if (f > 1 && R() < ac * 0.6) put(k + '_ac', 'f_ac', x0, y - 0.6, { z: z + 0.5, rot: 6, fade_group: fg, variant: V.acVariant(S) });
      }
    }
    if (F > 2) put(id + '_pipe', 'f_pipe', x0 + W - 0.4, y0, { fade_group: fg });
    put(id + '_roof', A ? 'b_roof_a' : 'b_roof_b', x0, y0, { z: F * 3, fade_group: fg, variant: V.tile(S.roof === 'c' && A ? 'base' : S.roof, A ? 'b_roof_a' : 'b_roof_b', fg) });
    solids.push([x0, y0, x0 + W, y0 + Dp]); colliders.push({ id: fg, rect: [x0 - 0.32, y0 - 0.32, x0 + W, y0 + Dp] });
    BUILT.push({ id: fg, fam, x0, y0, W, D: Dp, F, mat: S.mat, roof: (A ? 'b_roof_a' : 'b_roof_b') + '/' + S.roof, reno: S.reno.size });
  }
  // ---- modern buildings: curtain wall / mall / storefront modules (f_wall variants from js/rongqiao_modern_art.js) ----
  const MODERN = N.modernBuildings || (N.modernBuildings = []);   // kept apart from N.buildings (the old-block variety list)
  function mbld(id, x0, y0, o) {
    const fg = 'rqe_e3_' + id, W = o.W, Dp = o.D, F = o.F, nS = W / 3, nW = Dp / 3;
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = 0; b < nS; b++) put(`${id}_S${f}_${b}`, 'f_wall', x0 + b * 3, y0, { z, state: st, fade_group: fg, variant: o.skin(f, b, 'S') });
      for (let b = 0; b < nW; b++) put(`${id}_W${f}_${b}`, 'f_wall', x0, y0 + 3 + b * 3, { z, rot: 6, state: st, fade_group: fg, variant: o.skin(f, b, 'W') });
    }
    for (const [type, rx, ry, v] of o.roofs) put(`${id}_roof_${rx}_${ry}`, type, x0 + rx, y0 + ry, { z: F * 3, fade_group: fg, variant: v });
    solids.push([x0, y0, x0 + W, y0 + Dp]); colliders.push({ id: fg, rect: [x0 - 0.32, y0 - 0.32, x0 + W, y0 + Dp] });
    MODERN.push({ id: fg, kind: o.kind, name: o.name || null, x0, y0, W, D: Dp, F });
  }
  /** office tower 15 x 12: curtain wall, lobby glass + canopy, name panels near the top, parapet roof */
  function tower(id, x0, y0, F, cw, logo, o = {}) {
    const alt = cw + '_b';
    mbld(id, x0, y0, { W: 15, D: 12, F, kind: 'office', name: o.name, mat: cw, roofs: [['b_roof_a', 0, 0, 'r_mod']], skin: (f, b) => (f > 1 && (f * 7 + b * 3 + ((f * b) % 3)) % 5 < 3 ? alt : cw) });
    const fg = 'rqe_e3_' + id;
    put(id + '_canopy', 'rq_cw_canopy', x0 + 4.5, y0, { fade_group: fg });
    put(id + '_logo', 'rq_cw_logo', x0 + 4, y0 - 0.02, { z: F * 3 - 2.2, variant: logo, fade_group: fg });
    put(id + '_logo_w', 'rq_cw_logo_w', x0 - 0.02, y0 + 9.5, { z: F * 3 - 2.2, variant: logo, fade_group: fg });
    put(id + '_logo_lobby', 'rq_cw_logo', x0 + 4, y0 - 2.42, { z: 3.45, variant: logo + '_l', fade_group: fg });
  }
  /** plaza in front of a tower: paving, tree pits, benches, beds, lamps, bins, bike rack */
  function plaza(rect, o = {}) {
    const [x0, y0, x1, y1] = rect; paint(rect, 'S');
    for (let x = x0 + 3; x < x1 - 1.5; x += o.dx || 6) for (const y of o.rows || [(y0 + y1) / 2]) { if (o.skip && o.skip(x, y)) continue; pitTree(+x.toFixed(1), y, o.tree || pick(['rong', 'kapok', 'flame'])); bench(+(x + 1.6).toFixed(1), y - 0.4, 0); }
    if (o.beds) for (const [x, y] of o.beds) put(`pbed_${x}_${y}`, 'rq_x_bed', x, y, { variant: pick(['a', 'b', 'c']) });
    for (const [x, y] of o.lamps || []) lamp(x, y);
    if (o.bin) put(`pbin_${o.bin[0]}`, 'p_trashbin', o.bin[0], o.bin[1]);
  }

  // =====================================================================================================
  // 南关路 (y -76..-64) + green belt south of it (beyond the bound) + 槐北街 to the new ground edge
  // =====================================================================================================
  const RX0 = GX0, RX1 = BX1 + 2, HB = [[15.9, 32.1]];
  paint([RX0, -64, RX1, -60], 'S'); paint([RX0, -76, RX1, -64], null, road); paint([RX0, -80, RX1, -76], 'S');
  planted([RX0, -84, RX1, -80], { beds: false, step: 2, shrubs: ['hy', 'gb', 'hs', 'sj'] });
  paint([RX0, GY0, RX1, -84], 'G');
  for (let x = RX0 + 3; x < RX1 - 2; x += 6) { tree(x, -88 - R() * 2, pick(['kapok', 'rong', 'flame', 'rong'])); tree(x + 3, -96 - R() * 3, pick(['rong', 'kapok', 'willow'])); }
  planted([RX0, -102, RX1, -98.5], { beds: false, step: 2.4, shrubs: ['hy', 'gb', 'sj'] });
  for (let x = RX0 + 1.5; x < RX1 - 1; x += 4) put(`gb_shrub_${x}`, 'rq_x_shrub', x + R(), -91.5 - R() * 3, { variant: pick(['hy', 'gb', 'dj', 'hs']) });
  for (let x = RX0 + 1; x < RX1 - 0.5; x += 2) if (!inX(x, [[21, 29], [9, 15], [35, 41], [-73, -61]])) { put(`ng_curb_s${x}`, 'p_curb', x, -76.1); put(`ng_curb_n${x}`, 'p_curb', x, -63.9); put(`ng_edge_s${x}`, 'd_edge_line', x, -75.65); put(`ng_edge_n${x}`, 'd_edge_line', x, -64.35); }
  for (let x = RX0 + 1.5; x < RX1; x += 3) if (!inX(x, [[19, 31], [8, 16], [34, 42], [-74, -60]])) { put(`ng_dash_c${x}`, 'd_center_dash', x, -70.15); put(`ng_dash_c2${x}`, 'd_center_dash', x, -69.85); put(`ng_dash_s${x}`, 'd_center_dash', x, -73); put(`ng_dash_n${x}`, 'd_center_dash', x, -67); }
  for (const xm of [12, 38, -67]) for (let k = 0; k < 12; k++) put(`ng_zebra_${xm}_${k}`, 'd_stripe', xm, -75.45 + k, { rot: 2 });
  for (let x = RX0 + 6; x < RX1 - 2; x += 9) if (!inX(x, [[10, 42], [-78, -56]])) pitTree(+x.toFixed(1), -78);
  for (let x = RX0 + 10; x < RX1; x += 24) if (!inX(x, [[12, 36]])) { lamp(x, -63.2); lamp(x + 12, -76.8); }
  // kerbside parking bays (east of the towers), bus stops near the junction and by 汇金大厦
  cars(60, 120, -74.6, 2, 0.35); cars(140, 214, -65.4, 2, 0.4); cars(-40, -14, -74.6, 2, 0.3); cars(-126, -100, -65.4, 2, 0.35);
  put('ng_bus_n', 'p_busstop', -15, -61.2); put('ng_bus_e', 'p_busstop', 66, -61.2); put('ng_bus_w', 'p_busstop', -101.5, -61.2);
  // 槐北街 continues south across 南关路 to the ground edge (live nb/sb lanes, zebra on the north side of the junction)
  paint([16, GY0, 22, -38], 'S'); paint([22, GY0, 28, -38], null, road); paint([28, GY0, 32, -38], 'S'); paint([16, -76, 32, -64], null, road);
  const CW_NG = { id: 'cw_ng', x0: 22, x1: 28, y0: -63.6, y1: -60, road: 'y' };
  for (let y = GY0 + 1; y < -38; y += 2) {
    if (!inX(y, [[-77, -63]])) { put(`hb_curb_w${y}`, 'p_curb', 21.9, y, { rot: 2 }); put(`hb_curb_e${y}`, 'p_curb', 28.1, y, { rot: 2 }); }
    if (!inX(y, [[-77, -59.4]])) { put(`hb_edge_w${y}`, 'd_edge_line', 22.35, y, { rot: 2 }); put(`hb_edge_e${y}`, 'd_edge_line', 27.65, y, { rot: 2 }); }
  }
  for (let y = GY0 + 1.5; y < -38; y += 3) if (!inX(y, [[-78, -58.5]])) put(`hb_dash_${y}`, 'd_center_dash', 25, y, { rot: 2 });
  { const ym = (CW_NG.y0 + CW_NG.y1) / 2; for (let k = 0; k < 6; k++) baseAt(`zebra_cw_ng_${k}`, 'd_stripe', 22.55 + 0.98 * k, ym);
    baseAt('stop_cw_ng_nb', 'd_stopline', 26.5, CW_NG.y0 - 0.4, { rot: 2 }); baseAt('stop_cw_ng_sb', 'd_stopline', 23.5, CW_NG.y1 + 0.4, { rot: 2 }); }
  const T = D.traffic;
  for (const l of T.lanes) {
    if (l.id === 'nb' || l.id === 'sb') {
      l.range = [Math.min(l.range[0], GY0), l.range[1]];
      if (!l.stops.some((s) => s.cw === CW_NG.id)) l.stops.push(l.id === 'nb' ? { at: CW_NG.y0 - 0.4, cw: CW_NG.id } : { at: CW_NG.y1 + 0.4, cw: CW_NG.id });
      if (l.id === 'sb') l.stops.sort((a, b) => b.at - a.at); else l.stops.sort((a, b) => a.at - b.at);
    }
  }
  if (!T.crosswalks.some((c) => c.id === CW_NG.id)) T.crosswalks.push(Object.assign({}, CW_NG));
  for (const y of [-90, -98]) { pitTree(19, y); pitTree(30.4, y + 2); }

  // =====================================================================================================
  // Height / style transition (Leo 02:47: towers right next to low old blocks were too abrupt).
  //   old 1-4F blocks (north, back streets) -> 南关路 north frontage: 7-8F 90s/00s 商住楼 with street shops (e90 tiles)
  //   -> across the avenue, the south side: 11-18F 商品房 gated 小区 (e00 paint/tile, new windows, glass balconies)
  //   -> office towers 18-26F at the junctions / on the avenue (curtain wall). 城中村 keeps no modern towers.
  // =====================================================================================================
  const LOTS = [[-46, -62, 17, -41], [31, -62, 144, -41], [BX0, -62, -76, -41]];
  for (const cid of ['rqe_s_w', 'rqe_s_m', 'rqe_s_e']) { const c = window.SCENE_CHUNKS && window.SCENE_CHUNKS[cid]; if (c) c.objects = c.objects.filter((o) => !(/^rqe_(sp_mark|car|tree)_/.test(o.id) && LOTS.some((r) => o.x > r[0] - 1.5 && o.x < r[2] + 1.5 && o.y > r[1] && o.y < r[3]))); }
  // ---- north frontage: 商住楼 (ground-floor shops on 南关路, flats above), pavement in front, service lane behind ----
  const SZL = [];
  function szl(id, x0, t) {
    const nS = t === 'B' ? 4 : 5, door = Math.floor(nS / 2), shops = {};
    for (let b = 0; b < nS; b++) if (b !== door) shops[b] = nextShop();
    bld(id, x0, -56, { t, fr: [7, 9], era: 'e90', fam: 'e3_szl', shops, balc: 0.5, ac: 0.4 }); SZL.push(id);
  }
  paint([-46, -60, 16, -40.4], 'S'); paint([31, -60, 144, -40.4], 'S'); paint([BX0, -60, -76, -40.4], 'S');
  [[-45, 'A'], [-29, 'A'], [-13, 'B'], [0, 'A']].forEach(([x, t], i) => szl('szw' + i, x, t));
  [32, 48, 64, 80, 96, 112, 128].forEach((x, i) => szl('sze' + i, x, 'A'));
  szl('szx0', -105, 'A'); szl('szx1', -89, 'B');
  for (const x of [-37.5, -21.5, -5.5, 40.5, 56.5, 72.5, 88.5, 104.5, 120.5, 136.5, -97.5]) put(`szl_racks_${x}`, 'rq_ebikes', x - 1.2, -59.2);
  for (const x of [-46, -30, -14, 31.5, 47.5, 63.5, 79.5, 95.5, 111.5, 127.5, 143.5, -89.5]) { lamp(x + 0.4, -43); put(`szl_bin_${x}`, 'p_trashbin', x + 0.5, -41.4); }

  // ---- east edge (new land x 224..300 north of 南关路): the height steps up away from the old blocks ----
  //   x 229-244 商住楼 7-8F | x 244-278 南关华府 小区 11-17F | x 280-298 office towers 18-26F at the east edge on 南关路
  const XQ = [], MODERN_RES = [], EX0 = OLD_X1, EY1 = -8;
  FORCE = 'rqe_e3_east';
  paint([EX0, -60, BX1, EY1], 'S');
  // the void north of the east land (beyond the old east bound) is closed by a hedge + wall; backdrop trees beyond
  for (let x = EX0 + 1; x < BX1; x += 2) put(`eedge_hedge_${x}`, 'p_hedge', x, EY1 + 0.6);
  colliders.push({ id: 'rqe3_eedge', rect: [EX0 + 0.2, EY1, BX1, 272] }); solids.push([EX0 + 0.2, EY1, BX1, 272]);
  paint([EX0, EY1, GX1, 40], 'G'); for (let x = EX0 + 4; x < GX1 - 2; x += 7) for (const y of [-2, 9, 21]) if (R() < 0.7) tree(+(x + R() * 2).toFixed(1), +(y + R() * 3).toFixed(1), pick(['rong', 'kapok', 'flame']));
  paint([BX1, -64, GX1, EY1], 'G'); for (let y = -58; y < EY1 - 1; y += 2) put(`eeast_hedge_${y}`, 'p_hedge', BX1 + 0.6, y, { rot: 6 });
  for (let y = -104; y < -64; y += 7) tree(BX1 + 6, y + R() * 2, 'rong');
  // 商住楼 column >10 m from the old 1-2F blocks (7-8F, the step up continues to the 11-17F 小区 and the towers)
  [[-56, 'A'], [-38, 'A'], [-20, 'B']].forEach(([y0, t], i) => { const nS = t === 'B' ? 4 : 5, door = Math.floor(nS / 2), shops = {}; for (let b = 0; b < nS; b++) if (b !== door) shops[b] = nextShop();
    bld('sze_e' + i, 229, y0, { t, fr: [7, 8], era: 'e90', fam: 'e3_sze', shops, wshops: i === 0 ? {} : { 1: nextShop() }, balc: 0.5, ac: 0.4 }); SZL.push('sze_e' + i); });
  /** 商品房 look: tidy facades — most balconies without laundry, glass railings, newer window frames, fewer AC units */
  function modernize(fg) {
    const L = lists.rqe_e3_east;
    for (let i = L.length - 1; i >= 0; i--) { const o = L[i]; if (o.fade_group !== fg) continue;
      if (o.type === 'f_balcony' && o.state === 'laundry' && R() < 0.8) o.state = 'default';
      if (o.type === 'f_balcony' && !/^g/.test(o.variant || '') && R() < 0.7) o.variant = R() < 0.5 ? 'g1' : 'g2';
      if (o.type === 'f_window' && (o.z || 0) > 0 && !/^n/.test(o.variant || '') && R() < 0.8) o.variant = R() < 0.6 ? 'n1' : 'n2';
      if (o.type === 'f_ac') { if (R() < 0.55) L.splice(i, 1); else o.variant = 'a1'; } }
  }
  // 南关华府: gate + guard booth on 南关路, fence, internal road with parking, two rows of point blocks, back garden
  { const key = 'xqe', x0 = 244.5, x1 = 278.5, FY = -59.6, gateX = 257;
    paint([x0, FY, x1, EY1], 'G'); paint([x0 + 0.5, FY + 0.4, x1 - 0.5, -54.4], 'K'); paint([x0 + 0.5, -40, x1 - 0.5, -36], 'K'); paint([gateX, -60, gateX + 8, FY], 'K');
    for (let x = x0 + 1; x < x1 - 0.5; x += 2) if (!(x > gateX - 0.5 && x < gateX + 8.5)) put(`${key}_fence_s${x}`, 'w_fence', x, FY);
    for (let y = FY + 1.6; y < EY1 - 0.5; y += 2) { put(`${key}_fence_w${y}`, 'w_fence', x0, y, { rot: 2 }); put(`${key}_fence_e${y}`, 'w_fence', x1, y, { rot: 2 }); }
    put(key + '_gate', 'rq_x_cgate', gateX, FY - 0.4, { variant: 'ngfh' });
    solids.push([gateX + 8.3, FY + 0.6, gateX + 10, FY + 2.6]); colliders.push({ id: 'rqe3_xqe_booth', rect: [gateX + 8.3, FY + 0.6, gateX + 10, FY + 2.6] });
    const blocks = [[246, -52, [11, 13]], [262, -52, [14, 16]], [246, -34, [12, 13]], [262, -34, [15, 17]]];
    blocks.forEach(([tx, ty, fr], i) => { bld(`${key}${i}`, tx, ty, { t: 'A', fr, era: 'e00', fam: 'e3_xq', balc: 0.62, ac: 0.35, renoP: 0.9 }); MODERN_RES.push(`rqe_e3_${key}${i}`); modernize(`rqe_e3_${key}${i}`); });
    cars(x0 + 3, gateX - 3, -56.4, 2, 0.3); cars(gateX + 12, x1 - 3, -56.4, 2, 0.3); cars(x0 + 3, x1 - 3, -38, 2, 0.35);
    put(key + '_racks', 'rq_ebikes', gateX - 3.6, -55.2); put(key + '_bins', 'p_bins', x1 - 3, -54.8); lamp(gateX - 1, -55); lamp(x1 - 2.5, -38.6); lamp(x0 + 2.5, -38.6);
    planted([x0 + 0.6, -21.6, x1 - 0.6, EY1 - 1.2], { beds: true, step: 1.8, shrubs: ['hy', 'gb', 'sj'], skip: (x, y) => (x > 252 && x < 258) || (x > 268 && x < 273) });
    put(key + '_play', 'rq_x_play', 252.6, -19.4); put(key + '_fit', 'rq_x_fit', 268.4, -19.2); bench(259, -15.4, 0); bench(275, -15.4, 0);
    for (let x = x0 + 2; x < x1 - 1; x += 5.5) tree(+x.toFixed(1), -10.6, pick(['rong', 'kapok', 'flame']));
    XQ.push({ key, name: '南关华府', x0, x1, gate: [gateX + 4, FY], blocks: blocks.length }); }
  // office towers at the east edge, the corner one on 南关路 (canopy + name panels face the avenue / the camera)
  paint([279.5, -60, BX1, EY1], 'S');
  tower('t1', 282, -56, 26, 'cw_blue', 'rqzx', { name: '榕桥中心' });
  tower('t2', 282, -38, 20, 'cw_silver', 'ngjj', { name: '南关国际中心' });
  tower('t3', 282, -20, 18, 'cw_bronze', 'hjds', { name: '汇金大厦' });
  for (const y of [-42.6, -24.6]) { put(`tw_bed_${y}`, 'rq_x_bed', 286, y, { variant: pick(['a', 'b', 'c']) }); bench(291.5, y + 0.3, 0); }
  for (const [x, y] of [[280.4, -58.6], [298.6, -58.6], [280.4, -40.6], [298.6, -22.6]]) lamp(x, y);
  pitTree(280.8, -45.6, 'rong'); pitTree(280.8, -27.6, 'kapok'); pitTree(298.4, -50, 'kapok'); pitTree(298.4, -32, 'rong'); pitTree(298.4, -14, 'flame'); put('tw_racks', 'rq_ebikes', 290, -11.4); put('tw_bin', 'p_trashbin', 280.6, -12);
  put('ng_bus_ee', 'p_busstop', 270, -61.2);
  FORCE = null;

  // =====================================================================================================
  // West: 汇金大厦, 早市, 榕桥天街, 榕桥老街 (south section) — x -106..-42, y -64..-10
  // =====================================================================================================
  // E1 left x -64..-43 as background yard: it is now inside the bounds
  paint([BX0, -60, -42, -10], 'K');
  // 榕桥老街 x -76..-58 (stone carriageway -70..-62, stoops either side), from 南关路 to the river side compound wall
  paint([-76, -64, -70, 141], 'S'); paint([-70, -64, -62, 141], 'Y'); paint([-62, -64, -58, 141], 'S');
  // 早市 plaza y -40..-30 (folding stalls with umbrellas, 三轮车, 地摊)
  paint([BX0, -40, -76, -30], 'S');
  const SV = ['veg', 'fruit', 'egg', 'tofu', 'snack', 'cloth', 'fish', 'flower'];
  let sk = 0; for (const y of [-38.8, -34.2]) for (let x = BX0 + 1.5; x < -79; x += 3.4) { if (R() < 0.12) { put(`mtarp_${x}_${y}`, 'rq_x_mtarp', x, y, { variant: pick(['a', 'b', 'c']) }); continue; } put(`mstall_${x}_${y}`, 'rq_x_mstall', x, y, { variant: SV[sk++ % SV.length] }); }
  for (const [x, y, v] of [[-104.5, -31.4, 'veg'], [-86, -31.4, 'fruit']]) put(`mtrike_${x}`, 'rq_x_mtrike', x, y, { variant: v });
  lamp(-95, -30.6); lamp(-80, -30.6); put('mk_bin', 'p_trashbin', -100, -30.8); put('mk_eb', 'rq_ebikes', -83, -31.6);
  // 榕桥天街 pedestrian street y -30..-24, modern storefront blocks y -22..-13 (S faces on the street)
  paint([BX0, -30, -76, -10], 'S');
  for (const x of [-96.2, -85.7]) { pitTree(x, -26.4, 'flame'); bench(x + 1.6, -28.8, 0); }
  for (const x of [-103, -91, -80.5]) { put(`tj_bed_${x}`, 'rq_x_bed', x, -29.2, { variant: pick(['a', 'b', 'c']) }); bench(x + 3.6, -29, 0); }
  for (const x of [-101, -87, -79]) lamp(x, -24.6);
  const MF = ['mf_cafe', 'mf_tea', 'mf_bake', 'mf_flower', 'mf_glass', 'mf_phone', 'mf_wear', 'mf_book'];
  let mk = 0;
  [[-106, 'cw_silver'], [-95.5, 'mall_a'], [-85, 'cw_blue']].forEach(([x0, up], i) => {
    mbld('tj' + i, x0, -22, { W: 9, D: 9, F: 3, kind: 'retail', name: '榕桥天街', mat: up, roofs: [['rq_v_roof9', 0, 0, i === 1 ? 'r_green' : 'r_tank']],
      skin: (f, b, face) => (f === 1 ? (face === 'W' && b > 0 ? MF[(mk + 3) % MF.length] : MF[mk++ % MF.length]) : up) });
  });
  for (const x of [-96.6, -86.1]) { put(`tj_gap_eb_${x}`, 'p_ebike', x, -18, { rot: 0 }); }
  put('tj_gate', 'rq_cw_logo', -83.6, -24.2, { z: 3.2, variant: 'rqtj' }); put('tj_gate_l', 'p_lamp', -84, -24.4, { interact: 'lamp' }); put('tj_gate_r', 'p_lamp', -76.4, -24.4, { interact: 'lamp' });
  put('tj_vend', 'p_vending', -75.5, -20); put('tj_eb', 'p_ebike', -76.4, -16, { rot: 2 });
  planted([BX0, -12, -76, -10.4], { beds: false, step: 1.6, shrubs: ['hy', 'gb'] });
  // east side of 老街 (south section): old 槐西 blocks
  bld('ws2', -58, -58, { t: 'B', f: 4, fr: [3, 5], fam: 'e3_ws', wshops: { 0: nextShop(), 1: nextShop(), 2: nextShop() } });
  bld('ws3', -58, -46, { t: 'B', f: 3, fr: [2, 4], fam: 'e3_ws', wshops: { 0: nextShop(), 2: nextShop() } });
  paint([-46, -60, -42, -10], 'S'); paint([-58, -49, -46, -46], 'S'); paint([-58, -37, -46, -34], 'S');
  for (const y of [-56, -50, -44, -31]) put(`ws_eb_${y}`, 'p_ebike', -44, y, { rot: 0 });
  // 早市 along 老街 (west stoop) and the street furniture
  for (let y = -58; y < -12; y += 3.3) { if (inX(y, [[-41, -29]])) continue; if (R() < 0.18) put(`lj_tarp_${y}`, 'rq_x_mtarp', -75.4, y, { variant: pick(['a', 'b', 'c']) }); else put(`lj_stall_${y}`, 'rq_x_mstall', -75.6, y, { variant: SV[sk++ % SV.length] }); }
  put('lj_trike_s', 'rq_x_mtrike', -69.6, -48, { variant: 'veg' }); put('lj_trike_s2', 'rq_x_mtrike', -64.8, -20.5, { variant: 'fruit' });
  for (const y of [-52, -36, -18]) lantern(-61, y);
  pitTree(-60, -40, 'rong'); pitTree(-60, -26.5, 'rong');
  // main road continues west (eb/wb lanes extend to the ground edge), zebra at the 老街 mouth
  paint([GX0, -6, -42, 0], null, road); paint([GX0, -10, -76, -6], 'S'); paint([-58, -10, -42, -6], 'S'); paint([GX0, 0, -42, 4], 'S'); paint([-76, -10, -58, -6], 'Y'); paint([-76, 0, -58, 4], 'Y');
  const CW_LJ = { id: 'cw_lj', x0: -70, x1: -66, y0: -6, y1: 0, road: 'x' };
  for (let x = GX0 + 1; x < -44; x += 2) if (!inX(x, [[-71, -65]])) { put(`mr_curb_s${x}`, 'p_curb', x, -6.1); put(`mr_curb_n${x}`, 'p_curb', x, 0.1); put(`mr_edge_s${x}`, 'd_edge_line', x, -5.65); put(`mr_edge_n${x}`, 'd_edge_line', x, -0.35); }
  for (let x = GX0 + 1.5; x < -44; x += 3) if (!inX(x, [[-72, -64]])) put(`mr_dash_${x}`, 'd_center_dash', x, -3);
  for (let k = 0; k < 6; k++) baseAt(`zebra_cw_lj_${k}`, 'd_stripe', -68, -5.45 + k, { rot: 2 });
  baseAt('stop_cw_lj_eb', 'd_stopline', CW_LJ.x0 - 0.6, -4.5); baseAt('stop_cw_lj_wb', 'd_stopline', CW_LJ.x1 + 0.6, -1.5);
  for (const l of T.lanes) if (l.id === 'eb' || l.id === 'wb') {
    const asc = l.stops.length < 2 || l.stops[0].at <= l.stops[l.stops.length - 1].at;
    l.range = [Math.min(l.range[0], GX0), l.range[1]];
    if (!l.stops.some((s) => s.cw === CW_LJ.id)) l.stops.push(l.id === 'eb' ? { at: CW_LJ.x0 - 0.6, cw: CW_LJ.id } : { at: CW_LJ.x1 + 0.6, cw: CW_LJ.id });
    l.stops.sort((a, b) => (asc ? a.at - b.at : b.at - a.at));
  }
  if (!T.crosswalks.some((c) => c.id === CW_LJ.id)) T.crosswalks.push(Object.assign({}, CW_LJ));
  for (let x = GX0 + 8; x < -44; x += 9) if (!inX(x, [[-79, -56]])) { pitTree(+x.toFixed(1), -8.2); pitTree(+(x + 4).toFixed(1), 2.2); }
  put('mr_bus_n', 'p_busstop', -84, 2.4);

  // =====================================================================================================
  // 榕桥汇 mall (main road north side, x -103..-73, y 8..32) + mall forecourt
  // =====================================================================================================
  paint([BX0, 4, -76, 36], 'S');
  mbld('mall', -103, 8, { W: 30, D: 24, F: 5, kind: 'mall', name: '榕桥汇', mat: 'mall_a',
    roofs: [['b_roof_a', 0, 0, 'r_mod2'], ['b_roof_a', 15, 0, 'r_mod2'], ['b_roof_a', 0, 12, 'r_mod2'], ['b_roof_a', 15, 12, 'r_mod']],
    skin: (f, b, face) => (face === 'S' && b >= 3 && b <= 6 && f > 1 ? 'cw_blue' : face === 'W' && b >= 2 && b <= 5 && f > 1 ? 'cw_blue_b' : 'mall_a') });
  put('mall_canopy', 'rq_cw_canopy', -91, 8, { fade_group: 'rqe_e3_mall' }); put('mall_canopy_w', 'rq_cw_canopy_w', -103, 23, { fade_group: 'rqe_e3_mall' });
  put('mall_logo', 'rq_cw_logo', -91.5, 7.98, { z: 12.2, variant: 'rqh', fade_group: 'rqe_e3_mall' }); put('mall_logo_w', 'rq_cw_logo_w', -103.02, 27.5, { z: 12.2, variant: 'rqh', fade_group: 'rqe_e3_mall' });
  for (const x of [-101, -80]) { pitTree(x, 6, 'kapok'); bench(x + 2, 5.2, 0); }
  put('mall_bed1', 'rq_x_bed', -97.5, 4.8, { variant: 'b' }); put('mall_bed2', 'rq_x_bed', -85, 4.8, { variant: 'c' }); put('mall_racks', 'rq_ebikes', -77.6, 9); put('mall_racks2', 'rq_ebikes', -77.6, 14);
  put('mall_vend', 'p_vending', -72.3, 27.5);   /* gatefix: was inside the mall footprint */ lamp(-93, 5); lamp(-104.5, 18); put('mall_bin', 'p_trashbin', -104.6, 12);

  // =====================================================================================================
  // 万家城中村 握手楼 grid x -106..-72, y 36..129 (alleys 3-4 m, alley shops), 老街 north section
  // =====================================================================================================
  paint([BX0, 32, -76, 141], 'K');
  for (let k = 0; k < 8; k++) {
    const y0 = 36 + k * 12;
    bld(`cv_w${k}`, -104, y0, { t: 'B', f: 6, fr: [5, 8], fam: 'e3_cv', balc: 0.55, ac: 0.4, shops: k % 2 ? { 1: nextShop(), 3: nextShop() } : { 0: nextShop() }, wshops: k % 3 === 0 ? { 1: nextShop() } : {} });
    bld(`cv_e${k}`, -88, y0, { t: 'B', f: 6, fr: [5, 8], fam: 'e3_cv', balc: 0.55, ac: 0.4, shops: k % 2 ? { 0: nextShop() } : { 2: nextShop(), 3: nextShop() }, wshops: { 0: nextShop(), 2: nextShop() } });
    paint([BX0, y0 + 9, -76, y0 + 12], 'S');
    if (k % 2) put(`cv_alley_eb_${k}`, 'p_ebike', -93.5 + R() * 2, y0 + 10.4, { rot: 2 }); else put(`cv_alley_bin_${k}`, 'p_trashbin', -89.6, y0 + 10.6);
    if (k % 3 === 1) put(`cv_alley_lan_${k}`, 'rq_x_lantern', -79.5, y0 + 10.5);
  }
  paint([-92, 32, -88, 141], 'S'); paint([BX0, 32, -104, 141], 'S');
  for (let y = 40; y < 128; y += 9) put(`cv_lane_eb_${y}`, 'p_ebike', -90, y, { rot: 0 });
  planted([BX0, 129.4, -76, 140.4], { bedP: 0.3, skip: (x) => x > -92 && x < -88 }); tree(-98, 134.5, 'rong'); tree(-82, 134.5, 'flame');
  // 老街 north section: old trees, lanterns, parked e-bikes, a 早点 stall at the corner
  for (let y = 10; y < 136; y += 14) { lantern(-74.4, y); lantern(-60.6, y + 7); }
  for (const y of [22, 58, 94, 124]) tree(-73.6, y, 'rong');
  for (const y of [30, 66, 102]) put(`lj_eb_${y}`, 'rq_ebikes', -61.8, y);
  put('lj_stall_n1', 'rq_x_mstall', -75.2, 6.2, { variant: 'snack' }); put('lj_stall_n2', 'rq_x_mstall', -75.2, 40.6, { variant: 'tofu' });
  // the old 槐西 column (E1 rqe_w_bg) faces 老街 with ground-floor shops on its W faces (chunk content only)
  const WBG = window.SCENE_CHUNKS && window.SCENE_CHUNKS.rqe_w_bg;
  if (WBG) {
    const extra = [];
    for (const b of BUILT.filter((q) => /^rqe_wv\d+$/.test(q.id))) {
      const drop = new Set(); const nW = b.D / 3;
      for (let k = 0; k < nW; k++) { if (k === 1 && b.F > 5) continue; drop.add(`${b.id}_W1_${k}_wall`); drop.add(`${b.id}_W1_${k}_win`); drop.add(`${b.id}_W1_${k}_door`);
        const [kind, state, sign] = nextShop(), y = b.y0 + 3 + k * 3;
        extra.push({ id: uid(`rqe3_lj_${b.id}_${k}_shop`), type: kind === 'e' ? 'f_eatery' : 'f_shop', x: b.x0, y, z: 0, rot: 6, state, fade_group: b.id });
        extra.push({ id: uid(`rqe3_lj_${b.id}_${k}_sign`), type: 'rq_x_sign_w', x: b.x0, y: y - 3, z: 2.42, variant: sign, fade_group: b.id }); }
      WBG.objects = WBG.objects.filter((o) => !(drop.has(o.id) && o.rot === 6 && !o.z));
    }
    WBG.objects = WBG.objects.concat(extra);
  }
  paint([-64, -10, -58, 141], null, (x, y, c) => (c === 'Y' ? null : 'S')); paint([-46, 4, -42, 141], 'S');

  // =====================================================================================================
  // Bound edges: hedges / fences close the west and the north-west (backdrop is not walkable)
  // =====================================================================================================
  for (let y = BY0 + 1; y < 141; y += 2) put(`wedge_hedge_${y}`, 'p_hedge', BX0 - 0.6, y, { rot: 6 });
  colliders.push({ id: 'rqe3_wedge', rect: [BX0 - 1.4, BY0, BX0 - 0.4, 141.6] });
  for (let x = BX0 + 1; x < -42; x += 2) put(`nedge_fence_${x}`, 'w_fence', x, 141);
  colliders.push({ id: 'rqe3_nedge', rect: [BX0 - 1.4, 140.6, -42.4, 141.6] });
  for (let y = 142; y < 192; y += 2) put(`nwedge_hedge_${y}`, 'p_hedge', -43, y, { rot: 6 });
  for (let y = 239; y < 272; y += 2) put(`nwedge_hedge2_${y}`, 'p_hedge', -43, y, { rot: 6 });
  colliders.push({ id: 'rqe3_nwedge_s', rect: [-43.6, 140.6, -42.4, 192] }, { id: 'rqe3_nwedge_n', rect: [-43.6, 238, -42.4, 272] });
  solids.push([BX0 - 1.4, BY0, BX0 - 0.4, 141.6], [BX0 - 1.4, 140.6, -42.4, 141.6], [-43.6, 140.6, -42.4, 192], [-43.6, 238, -42.4, 272]);

  // =====================================================================================================
  // Backdrop: west urban-village column beyond x -106, north-west blocks, 月河 continues west
  // =====================================================================================================
  paint([GX0, -60, BX0 - 0.2, 141], 'K');
  planted([GX0, -60, BX0 - 1.4, -13], { bedP: 0.25, step: 2.2 }); for (let y = -56; y < -14; y += 7) tree(-118 + R() * 6, y, pick(['rong', 'kapok', 'flame']));
  for (let y = -10, k = 0; y < 132; y += 13, k++) bld(`bgw${k}`, -124, y, { t: 'B', f: 5, fr: [3, 7], fam: 'e3_bgw', balc: 0.5, shops: k % 3 === 0 ? { 1: nextShop() } : {} });
  for (let y = 2; y < 136; y += 26) tree(-109, y, 'rong');
  paint([GX0, 141, -42, 192], 'K'); paint([GX0, 238, -42, 300], 'K');
  paint([GX0, 192, -64, 238], null, (x, y) => (y < 194 ? 'V' : R() < 0.18 ? 'U' : 'W'));
  const WATER = [GX0, 192, -64, 238]; colliders.push({ id: 'rqe3_river_w', rect: WATER }); solids.push(WATER.slice()); if (N.water) N.water.push(WATER.slice());
  for (let x = GX0; x < -64; x += 3) put(`emb_${x}`, 'rq_x_embank_s', x, 238);
  for (const [x, y] of [[-100, 194.6], [-96, 195.4], [-80, 234.8], [-118, 235]]) put(`lotus_${x}_${y}`, 'rq_x_lotus', x, y, { variant: R() < 0.5 ? 'a' : 'b' });
  [[-104, 144], [-89, 144], [-74, 144], [-104, 158], [-89, 158], [-74, 158], [-124, 147], [-124, 165]].forEach(([x, y], i) => bld(`bgn${i}`, x, y, { t: 'B', f: 5, fr: [4, 7], fam: 'e3_bgn' }));
  planted([-106, 168, -64, 176], { bedP: 0.2 }); for (let x = -102; x < -64; x += 6) tree(x, 182 + R() * 6, pick(['willow', 'rong', 'kapok']));
  paint([-106, 186, -64, 192], 'S'); for (let x = -105; x < -64; x += 9) tree(x, 187.6, 'willow');
  [[-112, 240], [-96, 240], [-80, 240], [-112, 275], [-96, 275], [-80, 275]].forEach(([x, y], i) => bld(`bgr${i}`, x, y, { t: 'A', f: 5, fr: [4, 8], fam: 'e3_bgr' }));
  paint([GX0, 262, -42, 272], 'S'); paint([GX0, 264, -42, 270], null, road);
  for (let x = -64; x < -44; x += 6) tree(x, 250, 'kapok');

  // ---- gatefix (2026-10-18): canopies must not grow into building facades. A tree whose crown box (±3 m) overlaps a building
  // footprint by > 1 m both ways is nudged out along the shallower axis (0.3 m clear); if that still hits a building it is dropped.
  { const B = D.colliders.concat(colliders).filter((c) => /^rqe_|^rq_bg/.test(c.id)).map((c) => c.rect), CR = 3;
    const hit = (x, y, m) => B.find((r) => Math.min(x + CR, r[2]) - Math.max(x - CR, r[0]) > m && Math.min(y + CR, r[3]) - Math.max(y - CR, r[1]) > m);
    for (const k of Object.keys(lists)) lists[k] = lists[k].filter((o) => { if (o.type !== 'rq_x_tree' || !/^rqe3_t_/.test(o.id)) return true; const r = hit(o.x, o.y, 1); if (!r) return true;
      const ox = Math.min(o.x + CR, r[2]) - Math.max(o.x - CR, r[0]), oy = Math.min(o.y + CR, r[3]) - Math.max(o.y - CR, r[1]);
      const nx = ox < oy ? (o.x < (r[0] + r[2]) / 2 ? r[0] - CR - 0.3 : r[2] + CR + 0.3) : o.x, ny = ox < oy ? o.y : (o.y < (r[1] + r[3]) / 2 ? r[1] - CR - 0.3 : r[3] + CR + 0.3);
      if (hit(nx, ny, 1) || Math.hypot(nx - o.x, ny - o.y) > 4) return false; o.x = +nx.toFixed(2); o.y = +ny.toFixed(2); return true; }); }

  // ---- register ----
  for (const r of solids) N.solids.push(r);
  N.expansionE3 = { phase: 'E3', bounds: { x0: BX0, y0: BY0 }, ground: { x0: GX0, y0: GY0 }, solids: solids.length, modern: MODERN,
    names: { avenue: '南关路', oldStreet: '榕桥老街', market: '榕桥老街早市', village: '万家城中村', mall: '榕桥汇', retailStreet: '榕桥天街', towers: ['榕桥中心', '南关国际中心', '汇金大厦'], compounds: XQ.map((q) => q.name) },
    transition: { frontage: SZL.map((id) => 'rqe_e3_' + id), compounds: XQ, residential: MODERN_RES, offices: ['rqe_e3_t1', 'rqe_e3_t2', 'rqe_e3_t3'] }, unconfirmed: true };
  D.colliders = D.colliders.concat(colliders);
  D.objects = D.objects.concat(base);
  window.SCENE_CHUNKS = window.SCENE_CHUNKS || {};
  const LATE = (window.RONGQIAO_LATE_CHUNKS = window.RONGQIAO_LATE_CHUNKS || []), src = 'rongqiao_expand_e3.js';
  for (const [id, name, rect] of CH) { window.SCENE_CHUNKS[id] = { objects: lists[id], colliders: [] }; LATE.push({ id, name, rect, src, load_m: 30, unload_m: 60 }); }
})();
