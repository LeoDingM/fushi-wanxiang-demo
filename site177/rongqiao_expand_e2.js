/* 榕桥区扩张 E2 (2026-10-17/18): 月河 + 榕桥古桥 + 两岸滨河公园 (district-expansion-plan.md). Pure data, loaded after
 * rongqiao_expand_e1.js. Walkable bounds grow north y 140 -> 272, ground to y 300.
 *   y 142..154  P2 背街楼群 (now inside the bounds: colliders + forbidden solids), 槐西巷 head block, planted gaps
 *   y 154..164  滨河南街 pedestrian promenade (槐北街 keeps its P2 curbs; pedestrians cross at the new zebra y 165)
 *   y 164..192  榕桥滨河公园: 竹林 + 望月亭, 垂柳花境, 滨河广场 (木棉), 古桥桥头广场 (古榕 + 石碑), 桃花/樱花林 + 廊,
 *               儿童乐园, 篮球场, 凤凰木林 + 公厕; waterside walkway y 186..192 with railing and willows
 *   y 192..238  月河 (46 m water, non-walkable): 槐北桥 (modern road bridge, 槐北街 x 16..32), 榕桥古桥 (three-span stone
 *               arch bridge x 60..68, deck y 186..244), lotus / reeds / boats, granite revetment on the north bank
 *   y 238..262  月河湾公园: 花海 + 木棉, 亲水广场, north bridgehead, 粉墙月洞门 Chinese garden with 清风亭 and 廊,
 *               樱花坡, 凤凰木 + 篮球场 + 公厕
 *   y 262..272  滨河北路 (road with parking), beyond: background row of old blocks (E1v variety styles), y 272..300
 * All names / layout choices 未经Leo确认. Chunks rqe_e2_* append after the E1 chunks (old saves keep their prefix). */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, V = window.RONGQIAO_VARIETY;
  if (!D || !N || !V || !D.rongqiaoExpandE1 || D.rongqiaoExpandE2) return; D.rongqiaoExpandE2 = 1;
  const G = D.ground, BX0 = -42, BX1 = 224, BY1 = 272, GY1 = 300, GX0 = G.origin[0];
  let seed = 20261019; const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = (a) => a[(R() * a.length) | 0];
  // ---- ground rows north to y 300 ----
  while (G.origin[1] + G.data_south_to_north.length * G.chunk < GY1) G.data_south_to_north.push('K'.repeat(G.cols));
  G.rows = G.data_south_to_north.length;
  G.legend = Object.assign({}, G.legend, { W: 'rq_gwater:a', U: 'rq_gwater:b', V: 'rq_gwater:c', Y: 'rq_gstone' });
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
  D.bounds = Object.assign({}, D.bounds, { y1: Math.max(D.bounds.y1, BY1) });
  N.bounds = Object.assign({}, N.bounds, { y1: BY1 });
  // ---- chunks: objects go to the chunk whose rect holds them ----
  const CH = [
    ['rqe_e2_sw', '滨河公园（西）', [-64, 140, 60, 192]], ['rqe_e2_se1', '古桥桥头·桃樱林', [60, 140, 140, 192]], ['rqe_e2_se2', '滨河公园（东）', [140, 140, 224, 192]],
    ['rqe_e2_water', '月河', [-64, 192, 224, 238]],
    ['rqe_e2_nw', '月河湾公园（西）', [-64, 238, 60, 300]], ['rqe_e2_ne1', '月河湾·粉墙园', [60, 238, 140, 300]], ['rqe_e2_ne2', '月河湾公园（东）', [140, 238, 224, 300]],
  ];
  const lists = {}; for (const [id] of CH) lists[id] = [];
  const chunkOf = (x, y) => { for (const [id, , r] of CH) if (x >= r[0] && x < r[2] && y >= r[1] && y < r[3]) return id; return x < 60 ? (y < 192 ? 'rqe_e2_sw' : 'rqe_e2_nw') : x < 140 ? (y < 192 ? 'rqe_e2_se1' : 'rqe_e2_ne1') : (y < 192 ? 'rqe_e2_se2' : 'rqe_e2_ne2'); };
  const used = new Set(); const uid = (s) => { let k = s, n = 1; while (used.has(k)) k = s + '_' + n++; used.add(k); return k; };
  const put = (id, type, x, y, more, inChunk) => lists[inChunk || chunkOf(x, y)].push(Object.assign({ id: uid('rqe2_' + id), type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  const base = [], solids = [], colliders = [];
  const baseAt = (id, type, x, y, more) => base.push(Object.assign({ id: 'rqe2_' + id, type, x, y }, more || {}));
  // ---- helpers (greenery) ----
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
  const pitTree = (x, y) => { paint([x - 1, y - 1, x + 1, y + 1], 'T'); put(`pt_${x}_${y}`, 'p_tree', x, y, { variant: R() < 0.35 ? 't2' : 'base' }); };
  const lamp = (x, y) => put(`lamp_${x}_${y}`, 'p_lamp', x, y, { interact: 'lamp' });
  const lantern = (x, y) => put(`lan_${x}_${y}`, 'rq_x_lantern', x, y);
  const bench = (x, y, rot) => put(`bench_${x}_${y}`, 'community_bench', x, y, { rot: rot || 0 });
  const kiosk = (id, type, x, y, w, d, more) => { put(id, type, x, y, more); solids.push([x, y, x + w, y + d]); };
  const solidPiece = (id, type, x, y, rect, more) => { put(id, type, x, y, more); solids.push(rect); };
  const inX = (x, spans) => spans.some(([a, b]) => x > a && x < b);
  // ---- buildings with the E1v variety styles (same module as E1's bld) ----
  const BUILT = N.buildings || (N.buildings = []);
  function bld(id, x0, y0, o) {
    const fg = 'rqe_e2_' + id, fam = o.fam || 'e2_' + id.replace(/\d+$/, '');
    const A = o.t !== 'B', W = A ? 15 : 12, Dp = A ? 12 : 9, size = A ? 'a' : 'b';
    const S = V.style(fg, fam, o.f, { range: o.fr, size, bays: W / 3 });
    const nS = W / 3, nW = Dp / 3, F = S.F, balc = o.balc == null ? 0.4 : o.balc, ac = o.ac == null ? 0.25 : o.ac, door = Math.floor(nS / 2);
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = 0; b < nS; b++) {
        const x = x0 + b * 3, k = `${id}_S${f}_${b}`;
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
        put(k + '_wall', 'f_wall', x0, y, { z, rot: 6, state: st, fade_group: fg, variant: S.mat });
        const u = f > 1 ? V.unit(S, f, nS + b, 0, 'W') : { variant: pick(S.win) };
        put(k + '_win', 'f_window', x0, y, { z, rot: 6, state: 'intact', fade_group: fg, night_lit: u.reno || R() < 0.5, variant: u.variant });
      }
    }
    if (F > 2) put(id + '_pipe', 'f_pipe', x0 + W - 0.4, y0, { fade_group: fg });
    put(id + '_roof', A ? 'b_roof_a' : 'b_roof_b', x0, y0, { z: F * 3, fade_group: fg, variant: V.tile(S.roof === 'c' && A ? 'base' : S.roof, A ? 'b_roof_a' : 'b_roof_b', fg) });
    solids.push([x0, y0, x0 + W, y0 + Dp]); colliders.push({ id: fg, rect: [x0 - 0.32, y0 - 0.32, x0 + W, y0 + Dp] });
    BUILT.push({ id: fg, fam, x0, y0, W, D: Dp, F, mat: S.mat, roof: (A ? 'b_roof_a' : 'b_roof_b') + '/' + S.roof, reno: S.reno.size });
  }

  // =====================================================================================================
  // y 140..164: P2 background row becomes solid; west head block; planted gaps; 滨河南街 promenade
  // =====================================================================================================
  const BG = [-24, -8, 34, 50, 66, 82, 98, 114, 130, 146, 162, 178, 194, 210];
  BG.forEach((x, i) => { colliders.push({ id: 'rq_bg_c' + i, rect: [x - 0.32, 141.68, x + 15, 154] }); solids.push([x, 142, x + 15, 154]); });
  paint([BX0, 140, -37, 156], 'K'); paint([-37, 142, -24.5, 154], 'S');
  bld('wh0', -36.6, 143.5, { t: 'B', f: 4, fr: [3, 6], fam: 'e2_bgrow' });
  planted([7.4, 142.2, 15.8, 153.8], { beds: false }); pitTree(11.5, 145); pitTree(11.5, 151);
  planted([32.1, 142.2, 33.9, 153.8], { beds: false, step: 1.8 });
  // strip behind the row + 滨河南街 (pedestrian, x -42..16 and 32..224)
  const RD = [[15.9, 32.1]];
  planted([BX0, 154, 16, 156], { beds: false, shrubs: ['hy', 'gb', 'sj'] }); planted([32, 154, BX1, 156], { beds: false, shrubs: ['hy', 'gb', 'sj'] });
  paint([BX0, 156, 16, 164], 'S'); paint([32, 156, BX1, 164], 'S');
  for (let x = -38; x < BX1 - 2; x += 8) if (!inX(x, [[13, 35]])) pitTree(x, 160);
  for (let x = -30; x < BX1; x += 24) if (!inX(x, [[12, 36]])) lamp(x, 157.2);
  for (let x = -34; x < BX1 - 4; x += 24) if (!inX(x, [[12, 36]])) { bench(x + 4, 162.6, 4); put(`bin_${x}`, 'p_trashbin', x + 7, 162.8); }
  for (const x of [40, 104, 168, 200]) put(`racks_${x}`, 'rq_ebikes', x, 157.8, { variant: x % 2 ? 'a' : 'b' });
  // west lane 槐西巷 head: K lane x -42..-37 to y 156, then the promenade
  lamp(-39.5, 150);

  // =====================================================================================================
  // 槐北街 north of y 164: pavements, carriageway, bridge deck, junction with 滨河北路, background stretch to 300
  // =====================================================================================================
  paint([16, 164, 22, GY1], 'S'); paint([22, 164, 28, GY1], null, road); paint([28, 164, 32, GY1], 'S');
  const CW_S = { id: 'cw_bh_s', x0: 22, x1: 28, y0: 165, y1: 168.6, road: 'y' }, CW_N = { id: 'cw_bh_n', x0: 22, x1: 28, y0: 256.4, y1: 260, road: 'y' };
  const JN = [262, 272];
  const gapY = (y, spans) => spans.some(([a, b]) => y > a && y < b);
  for (let y = 165; y < GY1; y += 2) {
    if (!gapY(y, [JN])) { baseAt(`curb_w${y}`, 'p_curb', 21.9, y, { rot: 2 }); baseAt(`curb_e${y}`, 'p_curb', 28.1, y, { rot: 2 }); }
    if (!gapY(y, [[164.4, 169.2], [255.8, 260.6], JN])) { baseAt(`edge_w${y}`, 'd_edge_line', 22.35, y, { rot: 2 }); baseAt(`edge_e${y}`, 'd_edge_line', 27.65, y, { rot: 2 }); }
  }
  for (let y = 170.5; y < GY1; y += 3) if (!gapY(y, [[254.5, 262], [261, 273]])) baseAt(`dash_${y}`, 'd_center_dash', 25, y, { rot: 2 });
  for (const C of [CW_S, CW_N]) {
    const ym = (C.y0 + C.y1) / 2; for (let k = 0; k < 6; k++) baseAt(`zebra_${C.id}_${k}`, 'd_stripe', 22.55 + 0.98 * k, ym);
    baseAt(`stop_${C.id}_nb`, 'd_stopline', 26.5, C.y0 - 0.4, { rot: 2 }); baseAt(`stop_${C.id}_sb`, 'd_stopline', 23.5, C.y1 + 0.4, { rot: 2 });
  }
  const T = D.traffic;
  for (const l of T.lanes) if (l.id === 'nb' || l.id === 'sb') {
    l.range = [l.range[0], Math.max(l.range[1], GY1)];
    for (const C of [CW_S, CW_N]) if (!l.stops.some((s) => s.cw === C.id)) l.stops.push(l.id === 'nb' ? { at: C.y0 - 0.4, cw: C.id } : { at: C.y1 + 0.4, cw: C.id });
    if (l.id === 'sb') l.stops.sort((a, b) => b.at - a.at); else l.stops.sort((a, b) => a.at - b.at);
  }
  for (const C of [CW_S, CW_N]) if (!T.crosswalks.some((c) => c.id === C.id)) T.crosswalks.push(Object.assign({}, C));
  for (const y of [172, 180, 246, 252]) { pitTree(19, y); pitTree(30.4, y + 2); }
  for (const y of [176, 250]) { lamp(21.4, y); }

  // =====================================================================================================
  // 榕桥滨河公园 (south bank y 164..192)
  // =====================================================================================================
  const SB = [[BX0, 16], [32, BX1]];
  for (const [x0, x1] of SB) {
    // hedge line with entrances, lawn strip, promenade y 170..173, waterside walkway y 186..192
    paint([x0, 164, x1, 166], 'S');
    for (let x = x0 + 1; x <= x1 - 1; x += 2) if (((x - x0) % 20) > 4) put(`hedge_${x}`, 'p_hedge', x, 165);
    paint([x0, 170, x1, 173], 'S'); paint([x0, 186, x1, 192], 'S');
    for (let x = x0 + 6; x < x1 - 2; x += 12) if (!inX(x, [[58, 70]])) lantern(x, 172.6);
    for (let x = x0 + 4.5; x < x1 - 1; x += 9) if (!inX(x, [[57, 71]])) tree(+x.toFixed(1), 187.6, 'willow');
    for (let x = x0 + 9; x < x1 - 2; x += 18) if (!inX(x, [[56, 72]])) { bench(x, 190.2, 0); }
    for (let x = x0 + 13.5; x < x1 - 2; x += 18) if (!inX(x, [[56, 72]])) lantern(x, 190.6);
    for (let x = x0; x < x1 - 0.5; x += 3) if (!inX(x + 1.5, [[59.5, 68.5]]) && x + 3 <= x1 + 0.01) put(`rail_s_${x}`, 'rq_x_rail_s', x, 191.85);
  }
  // lawn strip y 166..170 (fully dressed) except entrances
  planted([BX0, 166, 16, 170], { bedP: 0.3, skip: (x) => ((x - BX0) % 20) < 4 }); planted([32, 166, 52, 170], { bedP: 0.3, skip: (x) => ((x - 32) % 20) < 4 });
  planted([78, 166, BX1, 170], { bedP: 0.3, skip: (x) => ((x - 32) % 20) < 4 });
  for (const [x0, x1] of SB) for (let x = x0; x < x1; x += 20) paint([x, 166, x + 4, 170], 'S');
  // -- x -42..-2: 竹林 + 假山 + 望月亭
  planted([BX0, 173, -2, 186], { beds: false, step: 2.4, shrubs: ['sj', 'hy', 'gb'], skip: (x, y) => (x > -28 && x < -16 && y > 174 && y < 185) || (x > -10 && x < -7) });
  paint([-28, 174, -16, 185], 'S'); paint([-10, 173, -7, 186], 'S');
  solidPiece('pav_wangyue', 'rq_x_pavilion', -24, 177.5, [-24, 177.5, -20, 181.5]);
  for (const [x, y] of [[-40, 175], [-36.5, 179], [-39, 183.5], [-33, 175.5], [-31, 183], [-13.5, 175], [-14, 183.5], [-4.5, 178.5], [-30, 179.3]]) put(`bamboo_${x}_${y}`, 'rq_x_bamboo', x, y, { variant: R() < 0.5 ? 'a' : 'b' });
  for (const [x, y, v] of [[-26.5, 175.5, 'a'], [-17.5, 183.6, 'b'], [-17, 175.6, 'b']]) put(`rock_${x}`, 'rq_x_rock', x, y, { variant: v });
  bench(-22, 175.2, 0); bench(-22, 184, 4); lantern(-27.2, 181.2); lantern(-16.8, 178.8);
  // -- x -2..16: 垂柳花境 (willows + flower borders)
  planted([-2, 173, 16, 186], { bedP: 0.5, skip: (x, y) => y > 178.5 && y < 180.5 });
  paint([-2, 178.5, 16, 180.5], 'S'); for (const x of [1, 8, 14]) tree(x, 176, 'willow'); tree(4.5, 183.5, 'peach'); tree(11.5, 183.5, 'sakura');
  // -- 槐北街 west/east pavements are already S; planted margins along the bridge approach
  // -- x 32..56: 滨河广场 (木棉 grid, beds, benches)
  paint([32, 173, 56, 186], 'S');
  for (let i = 0; i < 4; i++) for (const y of [176, 183]) { const x = 35 + i * 6; paint([x - 1, y - 1, x + 1, y + 1], 'T'); tree(x, y, 'kapok'); }
  for (const x of [37, 43, 49]) { put(`plz_bed_${x}`, 'rq_x_bed', x, 179, { variant: pick(['a', 'b', 'c']) }); }
  bench(38.5, 174.6, 0); bench(50.5, 174.6, 0); bench(44.5, 185, 4); lamp(33.5, 179.5); put('plz_notice', 'p_notice', 54.5, 174.2, { rot: 0 }); put('plz_bin', 'p_trashbin', 55, 184.6);
  // -- x 52..78: 古桥桥头广场 (古榕, 石碑「榕桥」), deck x 60..68 from y 186
  paint([56, 170, 78, 186], 'S'); paint([60, 186, 68, 192], 'Y');
  solidPiece('banyan', 'rq_x_banyan', 73, 178.5, [72.1, 177.6, 73.9, 179.4]);
  paint([70, 175.5, 76, 181.5], 'C');
  solidPiece('stele', 'rq_x_stele', 58, 184, [57.2, 183.55, 58.8, 184.45]);
  for (const [x, y] of [[57.5, 176], [57.5, 181], [70.5, 184.5], [76.5, 184.5]]) lantern(x, y);
  bench(64, 175.4, 0); bench(76.5, 172.8, 0); put('qiao_bed1', 'rq_x_bed', 61, 179.5, { variant: 'a' }); put('qiao_bed2', 'rq_x_bed', 64.5, 182, { variant: 'c' });
  for (const x of [56.5, 77.5]) put(`qiao_rock_${x}`, 'rq_x_rock', x, 188.5, { variant: 'b' });
  // -- x 78..120: 桃花 / 樱花林 + 廊
  planted([78, 173, 120, 186], { bedP: 0.12, step: 2.2, shrubs: ['hy', 'hs', 'gb', 'dj'], skip: (x, y) => (x > 93.5 && x < 104.5 && y > 176 && y < 182) || (y > 178.9 && y < 180.6) });
  paint([78, 178.9, 120, 180.6], 'S'); paint([93.5, 176, 104.5, 182], 'S');
  for (let x = 81; x < 119; x += 5.2) { if (x > 92 && x < 106) continue; tree(+x.toFixed(1), 175.6, R() < 0.5 ? 'peach' : 'sakura'); tree(+(x + 2.6).toFixed(1), 183.4, R() < 0.5 ? 'sakura' : 'peach'); }
  solidPiece('lang_s', 'rq_x_lang', 96, 177, [96, 177, 102, 179.4]); bench(99, 181.2, 4);
  // -- x 120..140: 儿童乐园
  paint([120, 173, 140, 186], 'S'); paint([122, 174, 137, 184.5], 'C');
  solidPiece('play', 'rq_x_play', 125, 176, [125, 176, 131, 181]); put('play_fit', 'rq_x_fit', 134, 177); bench(129, 185.1, 4); bench(138.6, 179, 2); tree(121.2, 185, 'flame'); tree(139, 174.5, 'flame');
  // -- x 140..180: 篮球场
  paint([140, 173, 180, 186], 'S'); paint([146, 174, 172, 185.4], 'C');
  put('hoop_s', 'rq_x_hoop', 159, 174.4, { variant: 's' }); put('hoop_n', 'rq_x_hoop', 159, 185, { variant: 'n' });
  for (let x = 147; x < 172; x += 2) { put(`cfence_s_${x}`, 'w_fence', x, 173.8); }
  bench(143, 179.5, 2); bench(176.5, 179.5, 6); tree(142, 175, 'kapok'); tree(142, 184.4, 'kapok'); tree(176, 175, 'kapok'); tree(177, 184.4, 'kapok'); lamp(173.5, 174.6);
  // -- x 180..224: 凤凰木 / 木棉林 + 公厕
  planted([180, 173, BX1, 186], { bedP: 0.15, step: 2.2, skip: (x, y) => (x > 184 && x < 192.5 && y > 173 && y < 180) });
  paint([184, 173, 192.5, 180], 'S'); kiosk('toilet_s', 'rq_x_toilet', 186, 174.6, 6, 4);
  for (const [x, y, v] of [[196, 176, 'flame'], [205, 182, 'flame'], [214, 176, 'flame'], [221, 182.5, 'kapok'], [199, 183.5, 'kapok'], [210, 175.5, 'kapok'], [218.5, 177.5, 'flame'], [183, 183.5, 'flame']]) tree(x, y, v);

  // =====================================================================================================
  // 月河 (y 192..238): water, bridges, revetment, aquatic plants, boats
  // =====================================================================================================
  paint([GX0, 192, BX1 + 2, 238], null, (x, y) => (y < 194 ? 'V' : R() < 0.18 ? 'U' : 'W'));
  paint([16, 192, 22, 238], 'S'); paint([22, 192, 28, 238], null, road); paint([28, 192, 32, 238], 'S');
  paint([60, 192, 68, 238], 'Y');
  const WATER = [[GX0, 192, 16, 238], [32, 192, 60, 238], [68, 192, BX1 + 2, 238]];
  WATER.forEach((r, i) => { colliders.push({ id: 'rq_river_' + i, rect: r }); solids.push(r); });
  N.water = WATER.map((r) => r.slice());
  // 槐北桥: girders + piers on the W face, railings both sides
  for (let y = 192, k = 0; y < 238; y += 3, k++) put(`hbq_${y}`, 'rq_x_rbridge_w', 16, Math.min(y, 235), { variant: k % 4 === 2 ? 'p' : 'g' }, 'rqe_e2_water');
  for (let y = 190; y < 240; y += 3) { put(`hbq_rw_${y}`, 'rq_x_rail_w', 16.25, y, {}, 'rqe_e2_water'); put(`hbq_re_${y}`, 'rq_x_rail_w', 31.75, y, {}, 'rqe_e2_water'); }
  for (const y of [198, 214, 230]) { lamp(17, y); lamp(31, y + 6); }
  // 榕桥古桥: three stone arches (W face), balustrades both sides, lanterns at the ends
  for (let k = 0; k < 3; k++) put(`gq_arch_${k}`, 'rq_x_arch_w', 60, 192 + k * 46 / 3, {}, 'rqe_e2_water');
  for (let y = 190; y < 240; y += 3) { put(`gq_bw_${y}`, 'rq_x_bal_w', 60.25, y, {}, 'rqe_e2_water'); put(`gq_be_${y}`, 'rq_x_bal_w', 67.75, y, {}, 'rqe_e2_water'); }
  // north revetment (S face visible from the river)
  for (let x = GX0; x < BX1; x += 3) if (!inX(x + 1.5, [[15, 33], [59, 69]])) put(`emb_${x}`, 'rq_x_embank_s', x, 238, {}, 'rqe_e2_water');
  // lotus, reeds, boats
  for (const [x, y, v] of [[-30, 194.5, 'a'], [-26, 195.5, 'b'], [-6, 194.4, 'a'], [40, 194.6, 'a'], [46, 195.4, 'b'], [86, 194.5, 'a'], [90, 195.6, 'a'], [94, 194.4, 'b'], [132, 194.8, 'a'], [168, 194.5, 'b'], [172, 195.4, 'a'], [204, 194.6, 'a'],
    [-20, 234.6, 'a'], [4, 235, 'b'], [42, 234.8, 'a'], [80, 235, 'a'], [84, 233.8, 'b'], [112, 234.8, 'a'], [150, 234.6, 'b'], [154, 233.6, 'a'], [190, 234.8, 'a'], [212, 235, 'b']]) put(`lotus_${x}_${y}`, 'rq_x_lotus', x, y, { variant: v });
  for (let x = -40; x < BX1 - 2; x += 7) if (!inX(x, [[13, 35], [57, 71]])) { if (R() < 0.7) put(`reed_s_${x}`, 'rq_x_reed', x + R() * 3, 192.8, { variant: R() < 0.3 ? 'iris' : 'reed' }); if (R() < 0.6) put(`reed_n_${x}`, 'rq_x_reed', x + R() * 3, 236.9, { variant: R() < 0.3 ? 'iris' : 'reed' }); }
  for (const [x, y] of [[110, 212], [150, 205], [-12, 220]]) put(`boat_${x}`, 'rq_x_boat', x, y);

  // =====================================================================================================
  // 月河湾公园 (north bank y 238..262)
  // =====================================================================================================
  const NB = [[BX0, 16], [32, BX1]];
  for (const [x0, x1] of NB) {
    paint([x0, 238, x1, 243], 'S'); paint([x0, 252, x1, 255], 'S');
    for (let x = x0; x < x1 - 0.5; x += 3) if (!inX(x + 1.5, [[59.5, 68.5]]) && x + 3 <= x1 + 0.01) put(`rail_n_${x}`, 'rq_x_rail_s', x, 238.3);
    for (let x = x0 + 4.5; x < x1 - 1; x += 9) if (!inX(x, [[56, 72]])) tree(+x.toFixed(1), 244.6, 'willow');
    for (let x = x0 + 9; x < x1 - 2; x += 18) if (!inX(x, [[56, 72]])) { bench(x, 240.2, 4); lantern(x + 4.5, 242.6); }
    for (let x = x0 + 6; x < x1 - 2; x += 12) if (!inX(x, [[58, 70]])) lantern(x, 254.6);
  }
  // -- x -42..16: 花海 + 木棉
  planted([BX0, 243, 16, 252], { bedP: 0.55, skip: (x, y) => ((x - BX0) % 9) < 1 && y < 246 }); planted([BX0, 255, 16, 262], { bedP: 0.45 });
  for (let x = -38; x < 14; x += 7) { tree(x, 249, 'kapok'); tree(x + 3.5, 258.5, 'kapok'); }
  // -- x 32..56: 亲水广场
  paint([32, 243, 56, 252], 'S'); paint([32, 255, 56, 262], 'S');
  for (let i = 0; i < 4; i++) { const x = 35 + i * 6; paint([x - 1, 246, x + 1, 248], 'T'); tree(x, 247, 'flame'); paint([x - 1, 257.5, x + 1, 259.5], 'T'); tree(x + 0.5, 258.5, 'rong'); }
  for (const x of [37.5, 49.5]) put(`qs_bed_${x}`, 'rq_x_bed', x, 249.8, { variant: pick(['a', 'b', 'c']) }); bench(44, 250.5, 4); bench(44, 256.4, 0); lamp(33.6, 250); put('qs_vend', 'p_vending', 54.6, 257.2); put('qs_bin', 'p_trashbin', 53.8, 250.6);
  // -- x 56..76: north bridgehead plaza (deck x 60..68 to y 244)
  paint([56, 238, 76, 262], 'S'); paint([60, 238, 68, 244], 'Y');
  for (const [x, y] of [[57.5, 245], [70.5, 245], [57.5, 251], [70.5, 251]]) lantern(x, y);
  tree(73, 248, 'sakura'); tree(73, 259, 'rong'); tree(58.5, 259, 'rong'); put('nq_rock', 'rq_x_rock', 63, 249.5, { variant: 'a' }); put('nq_bed', 'rq_x_bed', 61.5, 257, { variant: 'b' }); bench(66, 257.4, 0);
  // -- x 76..124: 粉墙月洞门 Chinese garden (白墙 along y 256, 清风亭, 廊, rocks, bamboo)
  planted([76, 243, 124, 252], { bedP: 0.1, step: 2.2, shrubs: ['sj', 'gb', 'hy'], skip: (x, y) => (x > 83 && x < 91.5 && y > 243.5 && y < 251.5) || (x > 102 && x < 110 && y > 245 && y < 250) || (x > 97 && x < 101.5) });
  paint([83, 243.5, 91.5, 251.5], 'S'); paint([102, 245, 110, 250], 'S'); paint([97, 243, 101.5, 262], 'S');
  solidPiece('pav_qingfeng', 'rq_x_pavilion', 85.5, 245.5, [85.5, 245.5, 89.5, 249.5]); solidPiece('lang_n', 'rq_x_lang', 103, 246, [103, 246, 109, 248.4]);
  for (const [x, y, v] of [[82, 247, 'a'], [92.6, 249.5, 'b'], [111.5, 244.5, 'a'], [95, 245, 'b']]) put(`grock_${x}`, 'rq_x_rock', x, y, { variant: v });
  for (const [x, y] of [[79, 250.5], [114, 249.5], [119.5, 245.5], [93.5, 251]]) put(`gbamboo_${x}`, 'rq_x_bamboo', x, y, { variant: 'a' });
  for (let x = 76; x < 124; x += 3) { const gate = x === 97; if (x >= 97 && x < 100) { put('moongate', 'rq_x_moonwall', 98.5, 256, { state: 'gate' }); continue; } if (x === 100) continue; put(`mwall_${x}`, 'rq_x_moonwall', x, 256, { state: 'wall' }); void gate; }
  planted([76, 256.4, 97, 262], { bedP: 0.2, shrubs: ['sj', 'gb'] }); planted([101.5, 256.4, 124, 262], { bedP: 0.2, shrubs: ['sj', 'gb'] });
  for (const x of [80, 88, 106, 116]) put(`gbamb2_${x}`, 'rq_x_bamboo', x, 259, { variant: 'b' });
  lantern(96.4, 254.4); lantern(102.2, 254.4); tree(121, 247, 'sakura');
  // -- x 124..176: 樱花坡
  planted([124, 243, 176, 252], { bedP: 0.18, step: 2.2, shrubs: ['hs', 'hy', 'dj'] }); planted([124, 255, 176, 262], { bedP: 0.25 });
  for (let x = 127; x < 175; x += 5) { tree(x, 247.5, R() < 0.7 ? 'sakura' : 'peach'); tree(x + 2.5, 259, R() < 0.6 ? 'sakura' : 'rong'); }
  // -- x 176..224: 凤凰木 + 篮球场 + 公厕
  planted([176, 243, BX1, 252], { bedP: 0.15, skip: (x, y) => x > 188 && x < 216 }); planted([176, 255, BX1, 262], { bedP: 0.2, skip: (x, y) => (x > 178 && x < 186.5) || (x > 188 && x < 216) });
  paint([188, 243, 216, 262], 'S'); paint([190, 244, 214, 261], 'C'); paint([178, 255, 186.5, 262], 'S');
  put('hoop_n2s', 'rq_x_hoop', 202, 244.4, { variant: 's' }); put('hoop_n2n', 'rq_x_hoop', 202, 260.6, { variant: 'n' });
  kiosk('toilet_n', 'rq_x_toilet', 179.5, 256.6, 6, 4);
  for (const [x, y, v] of [[180, 247.5, 'flame'], [186, 249, 'kapok'], [219, 247, 'flame'], [221, 258.5, 'flame'], [217.5, 252.6, 'kapok']]) tree(x, y, v);
  bench(188.8, 252.5, 2); lamp(215.4, 252.4);

  // =====================================================================================================
  // 滨河北路 (y 262..272) + background row beyond the bound (y 272..300)
  // =====================================================================================================
  paint([GX0, 262, BX1 + 2, 264], 'S'); paint([GX0, 264, BX1 + 2, 270], null, road); paint([GX0, 270, BX1 + 2, 272], 'S');
  for (let x = -41; x < BX1; x += 2) {
    if (!inX(x, [[21, 29]])) { baseAt(`bnl_curb_s${x}`, 'p_curb', x, 263.9); baseAt(`bnl_curb_n${x}`, 'p_curb', x, 270.1); baseAt(`bnl_edge_s${x}`, 'd_edge_line', x, 264.35); baseAt(`bnl_edge_n${x}`, 'd_edge_line', x, 269.65); }
  }
  for (let x = -40.5; x < BX1; x += 3) if (!inX(x, [[19, 31]])) baseAt(`bnl_dash_${x}`, 'd_center_dash', x, 267);
  for (let x = -38; x <= BX1 - 4; x += 5.4) { if (inX(x, [[12, 38]]) || R() < 0.3) continue; put(`car_${x}`, 'p_car', x, 268.4, { rot: 2, state: 'normal', variant: R() < 0.12 ? 'red' : R() < 0.04 ? 'taxi' : 'base' }); }
  for (let x = -36; x < BX1; x += 24) if (!inX(x, [[12, 36]])) lamp(x, 262.8);
  // background: yards (K), old blocks with E1v styles (A/B mixed), 槐北街 continues to the ground edge
  paint([GX0, 272, BX1 + 2, GY1], 'K'); paint([16, 272, 22, GY1], 'S'); paint([22, 272, 28, GY1], null, road); paint([28, 272, 32, GY1], 'S');
  let bx = -40, k = 0;
  while (bx < BX1 - 9) { if (bx + 15 > 14 && bx < 34) { bx = 34; continue; } const A = R() < 0.55 && bx + 15 <= BX1 + 1; bld(`nbg${k++}`, bx, 274, { t: A ? 'A' : 'B', f: 5, fr: [3, 8], fam: 'e2_nbg', balc: 0.45 }); bx += (A ? 15 : 12) + 1 + Math.floor(R() * 3); }
  for (let x = -38; x < BX1; x += 11) if (!inX(x, [[12, 36]])) pitTree(x, 272.8 + 0.4);
  // west background column (urban village) south and north of the river, outside the bounds
  paint([GX0, 140, BX0, 192], 'K'); paint([GX0, 238, BX0, 262], 'K');
  [143, 155, 167, 179].forEach((y) => bld(`wv${y}`, -58, y, { t: 'B', f: 5, fr: [3, 7], fam: 'e2_wv_s', balc: 0.5 }));
  [241, 253].forEach((y) => bld(`wvn${y}`, -58, y, { t: 'B', f: 5, fr: [3, 7], fam: 'e2_wv_n', balc: 0.5 }));

  // ---- register ----
  for (const r of solids) N.solids.push(r);
  N.expansionE2 = { phase: 'E2', bounds: { y1: BY1 }, ground: { y1: GY1 }, solids: solids.length, water: WATER.length,
    names: { river: '月河', oldBridge: '榕桥古桥', roadBridge: '槐北桥', southPark: '榕桥滨河公园', northPark: '月河湾公园', promenade: '滨河南街', northRoad: '滨河北路', pavilionS: '望月亭', pavilionN: '清风亭' }, unconfirmed: true };
  D.colliders = D.colliders.concat(colliders);
  D.objects = D.objects.concat(base);
  window.SCENE_CHUNKS = window.SCENE_CHUNKS || {};
  const LATE = (window.RONGQIAO_LATE_CHUNKS = window.RONGQIAO_LATE_CHUNKS || []), src = 'rongqiao_expand_e2.js';
  for (const [id, name, rect] of CH) { window.SCENE_CHUNKS[id] = { objects: lists[id], colliders: [] }; LATE.push({ id, name, rect, src, load_m: 30, unload_m: 60 }); }
})();
