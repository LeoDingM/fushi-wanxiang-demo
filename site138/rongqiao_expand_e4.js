/* 榕桥区扩张 E4 (2026-10-18, Leo 02:38): schools + gate shops in the new north-east land, quiet branch road 榕校路.
 * Pure data, loaded after rongqiao_traffic_ng.js (E3 opened the east land x 224..300; until now it was backdrop north of y -8).
 *   榕校路 (quiet branch road, no through traffic): east-west y 134..140 from the 槐东 side road (x 192) to x 298, then north
 *          x 234..240 up to the north edge; pavements, street trees, lamps, 学校 / 慢行 road text, a 接送区 drop-off bay.
 *          Nearest main roads: the north main road (y -3) >= 130 m, 槐北街 (x 25) >= 200 m, 南关路 >= 200 m (plan: >= 80 m).
 *   榕桥第一小学 x 242..298, y 142..220: south gate (cantilever name beam, 伸缩门, 门岗) on 榕校路 + drop-off bay, 升旗台
 *          plaza, 5F teaching block (white render / orange bands, 外廊 corridor facing the field), 2F canteen, basketball
 *          court + ping-pong tables, N-S running track (four 1.5 m lanes around a 5-a-side pitch: 40 m straights, r 9-15).
 *   榕桥中学 x 242..298, y 220..272: west gate on 榕校路北段, 6F teaching block + 5F lab block (beige / terracotta, lit for
 *          晚自习), full basketball court, ping-pong tables, flag.
 *   校门口商铺: 2-3F 商住 shops at both gates (学林文具, 早餐包点, 小书虫托管, 便利店, 茶餐厅 ...) on the variety system.
 * Exterior only: the school grounds are fenced and not walkable (one solid rect), so no save can stand inside them; the
 * first old saves load unchanged (chunk rqe_e4_sch appends after the E3 chunks; the second market 榕桥第二菜市场 is
 * js/rongqiao_market2.js and appends after it). All names / storeys / layouts 未经Leo确认.
 * riverfix (2026-10-18, Leo 12:59): the schools no longer sit across the 月河 — the river runs on east under a 榕校路 bridge to the east
 *   map edge (x 226..320, y 192..238: embankment, railings, waterside walks y 186..192 / 238..244, willows, two new riverside parks
 *   x 242..300). Both schools moved, unchanged inside, by DY -142 onto the former E3 backdrop south of 榕校路 (x 242..300, y 0..130,
 *   between the 槐东 blocks and the 南关路 compounds, off every main road): 榕桥中学 y 78..130 (west gate on the new 榕校路南段
 *   x 234..240, y -6.4..134), 榕桥第一小学 y 0..78 (south gate on the new 校前巷 y -6.4..0.2, a dead-end school lane with the drop-off).
 *   Old saves: no walkable old position becomes water or school ground (the old school lot and the backdrop were solid); a save
 *   position inside a riverfix zone is still moved to the nearest walkable point by RONGQIAO_RELOCATE (documented, never across
 *   the map: <= 30 m, only inside the changed zones). Placement 未经Leo确认. */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, V = window.RONGQIAO_VARIETY;
  if (!D || !N || !V || !D.rongqiaoExpandE3 || D.rongqiaoExpandE4) return; D.rongqiaoExpandE4 = 1;
  const G = D.ground;
  let seed = 20261024; const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = (a) => a[(R() * a.length) | 0];
  let PY = 0;                                      // riverfix: the school section paints with a y offset
  function paint(rect, tile, fn) {
    if (PY) rect = [rect[0], rect[1] + PY, rect[2], rect[3] + PY];
    const [ox, oy] = G.origin, ch = G.chunk;
    const c0 = Math.max(0, Math.floor((rect[0] - ox) / ch)), c1 = Math.min(G.cols, Math.ceil((rect[2] - ox) / ch));
    const r0 = Math.max(0, Math.floor((rect[1] - oy) / ch)), r1 = Math.min(G.rows, Math.ceil((rect[3] - oy) / ch));
    for (let r = r0; r < r1; r++) {
      const a = G.data_south_to_north[r].split('');
      for (let c = c0; c < c1; c++) { const x = ox + (c + 0.5) * ch, y = oy + (r + 0.5) * ch; if (x >= rect[0] && x < rect[2] && y >= rect[1] && y < rect[3]) { const t = fn ? fn(x, y, a[c]) : tile; if (t) a[c] = t; } }
      G.data_south_to_north[r] = a.join('');
    }
  }
  G.legend = Object.assign({}, G.legend, { H: 'rq_gturf' });
  const road = () => (R() < 0.72 ? 'A' : 'B');
  const CHID = 'rqe_e4_sch', CHRECT = [192, -10, 320, 300];
  const list = [], solids = [], colliders = [], base = [];
  const used = new Set(); const uid = (s) => { let k = s, n = 1; while (used.has(k)) k = s + '_' + n++; used.add(k); return k; };
  const put = (id, type, x, y, more) => list.push(Object.assign({ id: uid('rqe4_' + id), type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  // 垂柳: three weeping-willow variants (std / big leaning / small) picked by position; the id keeps the plain name
  const wv = (x, y) => ['willow', 'willow2', 'willow', 'willow3'][Math.abs(Math.round(x * 7 + y * 13)) % 4];
  const tree = (x, y, v) => put(`t_${v}_${x}_${y}`, 'rq_x_tree', x, y, { variant: v === 'willow' ? wv(x, y) : v });
  const pitTree = (x, y, v) => { paint([x - 1, y - 1, x + 1, y + 1], 'T'); tree(x, y, v); };
  const lamp = (x, y) => put(`lamp_${x}_${y}`, 'p_lamp', x, y, { interact: 'lamp' });
  const bench = (x, y, rot) => put(`bench_${x}_${y}`, 'community_bench', x, y, { rot: rot || 0 });
  const SHR = ['dj', 'hy', 'hs', 'sj', 'sw', 'gb'];
  const shrubs = (rect, step) => { paint(rect, 'G'); for (let y = rect[1] + 1; y < rect[3] - 0.5; y += step) for (let x = rect[0] + 1; x < rect[2] - 0.5; x += step) put(`shrub_${x}_${y}`, 'rq_x_shrub', x + (R() - 0.5) * 0.5, y + (R() - 0.5) * 0.5, { variant: pick(SHR) }); };
  const BUILT = N.buildings || (N.buildings = []), MODERN = N.modernBuildings || (N.modernBuildings = []);
  function bld(id, x0, y0, o) {
    const fg = 'rqe_e4_' + id, fam = o.fam || 'e4_' + id.replace(/\d+$/, '');
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

  /** school block: f_wall skins per face (sch_*), b_roof_a tiles (15 x 12), kept in N.modernBuildings with kind 'school' */
  function school(id, x0, y0, o) {
    const fg = 'rqe_e4_' + id, W = o.W, Dp = o.D, F = o.F, nS = W / 3, nW = Dp / 3;
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = 0; b < nS; b++) put(`${id}_S${f}_${b}`, 'f_wall', x0 + b * 3, y0, { z, state: st, fade_group: fg, variant: o.s });
      for (let b = 0; b < nW; b++) put(`${id}_W${f}_${b}`, 'f_wall', x0, y0 + 3 + b * 3, { z, rot: 6, state: st, fade_group: fg, variant: o.w });
    }
    for (let rx = 0; rx < W; rx += 15) for (let ry = 0; ry < Dp; ry += 12) put(`${id}_roof_${rx}_${ry}`, 'b_roof_a', x0 + rx, y0 + ry, { z: F * 3, fade_group: fg, variant: (rx + ry) % 2 ? 'r_mod2' : 'r_mod' });
    solids.push([x0, y0, x0 + W, y0 + Dp]); colliders.push({ id: fg, rect: [x0 - 0.32, y0 - 0.32, x0 + W, y0 + Dp] });
    MODERN.push({ id: fg, kind: 'school', name: o.name || null, school: o.school, x0, y0, W, D: Dp, F });
  }
  /** basketball court outline (rq_s_line_* 6 m pieces) x0..x0+15 / y0..y1 with keys at the baselines that have a basket */
  function court(key, x0, y0, y1, ends) {
    for (const y of [y0, y1]) for (const x of [x0, x0 + 6, x0 + 9]) put(`${key}_lx_${x}_${y}`, 'rq_s_line_x', x, y);
    for (const x of [x0, x0 + 15]) for (let y = y0; y < y1 - 0.1; y += 6) put(`${key}_ly_${x}_${y}`, 'rq_s_line_y', x, Math.min(y, y1 - 6));
    if (ends.includes('s')) put(`${key}_key_s`, 'rq_s_key', x0 + 5.05, y0, { variant: 's' });
    if (ends.includes('n')) put(`${key}_key_n`, 'rq_s_key', x0 + 5.05, y1 - 7.6, { variant: 'n' });
    if (y1 - y0 > 20) for (const x of [x0, x0 + 6, x0 + 9]) put(`${key}_mid_${x}`, 'rq_s_line_x', x, (y0 + y1) / 2);
  }
  const fenceX = (key, x0, x1, y, skip) => { for (let x = x0 + 1; x < x1 - 0.5; x += 2) if (!(skip || []).some(([a, b]) => x > a - 1 && x < b + 1)) put(`${key}_${x}`, 'w_fence', x, y); };
  const fenceY = (key, x, y0, y1, skip) => { for (let y = y0 + 1; y < y1 - 0.5; y += 2) if (!(skip || []).some(([a, b]) => y > a - 1 && y < b + 1)) put(`${key}_${y}`, 'w_fence', x, y, { rot: 2 }); };

  // ===================================================================================================
  // open the east land north of y 131.6 (E3 closed x 224..300 up to the north edge as backdrop)
  // ===================================================================================================
  const near = (a, b) => Math.abs(a - b) < 1e-6;
  // riverfix: the whole E3 east backdrop opens (schools, 榕校路南段, 校前巷 and a hedge buffer take it)
  D.colliders = D.colliders.filter((c) => c.id !== 'rqe3_eedge');
  const si = N.solids.findIndex((r) => near(r[0], 224.2) && near(r[1], -8) && near(r[3], 272)); if (si >= 0) N.solids.splice(si, 1);
  const DY = -142, SY = (y) => +(y + DY).toFixed(2);
  /** 榕溪 (name + route 未经Leo确认): a narrow tributary of 月河 in the old 8 m hedge buffer between the 槐东 blocks and 榕校路南段 —
   *  out of a culvert headwall at y 3.6 (city drain outlet by the old road end), under 榕校路 in a culvert, under the waterside walk
   *  by a footbridge deck, into 月河 at y 192. Natural grassy banks with reeds, rocks and willows; railing on the path side. */
  const CREEK = { name: '榕溪', water: [[226.5, 3.6, 229.5, 31.8], [226.5, 34.2, 229.5, 131.6], [226.5, 142, 229.5, 186]], crossings: [{ kind: 'footbridge', rect: [224.2, 31.8, 232, 34.2] }, { kind: 'culvert', name: '榕校路', rect: [224, 131.6, 232, 142] }, { kind: 'footbridge', rect: [224, 186, 232, 192] }], mouth: [228, 192], source: [228, 3.6] };
  const RIVER = { water: [[224, 192, 232.2, 238], [241.8, 192, 320, 238]], bridge: [232, 192, 242, 238], walks: [[224, 186, 320, 192], [224, 238, 320, 244]], parks: [[242, 142, 300, 185], [242, 245, 300, 272]], edge: 320 };
  const EW = [192, 134, 298, 140], NS = [234, 134, 240, 300], NSS = [234, -6.4, 240, 134], LANE = [240, -6.4, 298, -2];
  const ROADS = [[208.4, 131.6, 298.4, 142], [192, 136, 208.4, 142], [232, 131.6, 242, 300], [232, -7.0, 300.4, 131.6], [225.6, 3.0, 230.4, 192]];   // (riverfix: + 榕溪 channel) west of x 208.4 the E1 block hd3 reaches y 135
  // street props of older phases standing on the new road / pavements go (chunk contents are outside the save contract)
  const removed = [];
  for (const [cid, ch] of Object.entries(window.SCENE_CHUNKS || {})) { if (!ch || !ch.objects || cid === CHID) continue;
    ch.objects = ch.objects.filter((o) => { const hit = ROADS.some((r) => o.x > r[0] && o.x < r[2] && o.y > r[1] && o.y < r[3]) && !/_wall|_win|_door|_roof|_shop|_balc|_sign|_ac$|_pipe|_S\d|_W\d/.test(o.id) && !/^f_|^b_roof/.test(o.type);
      if (hit) removed.push(o.id); return !hit; }); }
  // ---- 榕校路 ----
  paint([208.4, 132, 298, 134], 'S'); paint([192, 140, 242, 142], 'S'); paint([242, 140, 298, 142], 'S');
  paint(EW, null, road); paint(NS, null, road); paint(NSS, null, road); paint(LANE, null, road); paint([232, -6.4, 234, 131.6], 'S'); paint([240, -2, 242, 131.6], 'S'); paint([242, -2, 298, 0.2], 'S'); paint([192, 134, 208.4, 136], 'S'); /* 2 m ground grid: keep the carriageway clear of hd3 (4 m one-lane pinch beside it) */ paint([232, 142, 234, 300], 'S'); paint([240, 142, 242, 300], 'S');
  for (let x = 196; x < 296; x += 6) put(`ew_dash_${x}`, 'rq_dec_yline_x', x, 136.94);
  for (let y = 144; y < 298; y += 6) if (y < 186 || y > 244) put(`ns_dash_${y}`, 'rq_dec_yline_y', 236.94, y);
  for (let y = -4; y < 128; y += 6) put(`nss_dash_${y}`, 'rq_dec_yline_y', 236.94, y);
  put('txt_xx_ew', 'rq_s_roadtxt', 246, 134.5, { variant: 'xx' }); put('txt_mx_ew', 'rq_s_roadtxt', 210, 134.5, { variant: 'mx' });
  put('txt_xx_ns', 'rq_s_roadtxt', 234.4, 84, { variant: 'xx' }); put('txt_mx_ns', 'rq_s_roadtxt', 234.4, 40, { variant: 'mx' });
  put('dropoff', 'rq_s_dropoff', 262, SY(137.5));
  for (const x of [200, 216, 252, 270, 288]) lamp(x, x < 232 ? 141.2 : 132.8);
  for (const y of [150, 168, 186, 244, 258]) lamp(232.8, y);
  for (const y of [4, 22, 58, 76, 94, 112, 128]) lamp(231.2, y);
  for (const x of [250, 264, 286]) lamp(x, -6.9);
  for (const x of [246, 262, 278, 294]) pitTree(x, 133, pick(['rong', 'kapok', 'flame']));
  for (const y of [159, 177, 249, 267]) pitTree(233, y, pick(['rong', 'kapok']));
  // south hedge of the remaining backdrop, buffer between the old blocks / 月河 end and 榕校路北段, east edge
  for (let x = 225; x < 298; x += 2) if (x < 226 || x > 241) put(`shedge_${x}`, 'p_hedge', x, 131.4);
  const RIV = (y) => y > 184.5 && y < 245.5;    // riverfix: river + both waterside walks
  paint([224, 142, 232, 300], 'G'); for (let y = 143; y < 272; y += 2) if (!RIV(y) && y > 186) put(`bhedge_${y}`, 'p_hedge', 231.6, y, { rot: 6 });
  for (let y = 146; y < 270; y += 9) { const ty = +(y + R() * 3).toFixed(1), tx = +(227.5 + R() * 1.5).toFixed(1), v = pick(['rong', 'kapok', 'flame', 'willow']); if (!RIV(ty) && ty > 186) tree(tx, ty, v); }
  paint([298, 132, 320, 300], 'G'); for (let y = 133; y < 272; y += 2) if (!RIV(y)) put(`ehedge_${y}`, 'p_hedge', 298.6, y, { rot: 6 });
  for (let y = 136; y < 270; y += 11) if (!RIV(y)) tree(+(306 + R() * 6).toFixed(1), y, 'rong');
  // hedge buffer west of 榕校路南段 (the 槐东 blocks / E1 lots behind it)
  paint([224, 3.4, 232, 131.6], 'G'); paint([224, -7, 232, 3.4], 'S');   // (riverfix: the hedge buffer now carries 榕溪 — see creek() in riverfix)
  // the school grounds: a closed fence ring for movement (school buildings carry their own colliders, so no collider overlaps
  // another); N.solids keeps the whole ground so forged save positions inside are rejected
  // (riverfix: the ring moved with the schools by DY; the old buffer is cut by the river and its two walks)
  const ring = [{ id: 'rqe4_sch_fn', rect: [242, 142.2, 286, 142.6] }, { id: 'rqe4_sch_fn2', rect: [298.4, 142.2, 299.6, 142.6] }, { id: 'rqe4_sch_fe', rect: [299.6, 142.2, 300, 272] }, { id: 'rqe4_sch_fs', rect: [242, 271.6, 299.6, 272] },
    { id: 'rqe4_sch_fw0', rect: [242, 142.6, 242.4, 221.6] }, { id: 'rqe4_sch_fw1', rect: [242, 234.1, 242.4, 245.6] }, { id: 'rqe4_sch_fw2', rect: [242, 258.1, 242.4, 271.6] }]
    .map((c) => ({ id: c.id, rect: [c.rect[0], SY(c.rect[1]), c.rect[2], SY(c.rect[3])] }));
  colliders.push({ id: 'rqe4_buffer', rect: [224.2, 142, 232, 185] }, { id: 'rqe4_buffer_n', rect: [224.2, 245, 232, 272] }, { id: 'rqe4_buffer_s', rect: [224.2, 3.4, 232, 31.6] }, { id: 'rqe4_buffer_s2', rect: [224.2, 34.4, 232, 131.6] }, ...ring);
  solids.push([224.2, 142, 232, 185], [224.2, 245, 232, 272], [224.2, 3.4, 232, 31.6], [224.2, 34.4, 232, 131.6], [242, SY(142.2), 300, SY(272)]);
  riverfix();

  const L0 = list.length, C0 = colliders.length, S0 = solids.length, B0 = BUILT.length, M0 = MODERN.length; PY = DY;
  // ===================================================================================================
  // 榕桥第一小学 x 242..298, y 142..220 (riverfix: drawn here in the old coordinates, moved by DY below)
  // ===================================================================================================
  paint([242, 142, 298, 220], 'G');
  const GX = 274.4;                                                    // gate opening x 275.2..281.8 (gatefix: whole gate incl. booth stays >= 0.9 m west of the 学林文具 block at x 286.08)
  fenceX('p_fs', 242, 286, 142.4, [[274.4, 282.6]]); fenceY('p_fw', 242.4, 142.4, 220);
  put('p_gate', 'rq_s_gate_s', GX, 142.4, { variant: 'rq1' });
  put('p_ebikes', 'rq_ebikes', 268.2, 140.3, { variant: 'b' });
  // gate shops (2-3F 商住, variety system)
  bld('gate_p0', 286.4, 142.4, { t: 'B', fr: [2, 3], era: 'e00', fam: 'e4_gate', shops: { 0: ['s', 'window', 'wd'], 1: ['e', 'kuaican', 'zc'], 2: ['s', 'door', 'tg'], 3: ['s', 'window', 'bl'] }, balc: 0.3, ac: 0.35 });
  // running track: N-S oval, curve centres (259, 161) / (259, 201), lanes r 9..15, pitch inside
  paint([244, 144, 276, 218], 'H');
  const CX = 259, CS = 161, CN = 201;
  for (let y = CS; y < CN - 0.1; y += 4) { put(`trk_w_${y}`, 'rq_s_trk_y', CX - 15, y); put(`trk_e_${y}`, 'rq_s_trk_y', CX + 9, y); }
  for (let i = 0; i < 6; i++) { put(`trk_n_${i}`, 'rq_s_trk_arc', CX, CN, { variant: 'a' + i }); put(`trk_s_${i}`, 'rq_s_trk_arc', CX, CS, { variant: 'a' + (6 + i) }); }
  for (const x of [251, 257, 261]) { put(`pitch_gs_${x}`, 'rq_s_line_x', x, 154); put(`pitch_gn_${x}`, 'rq_s_line_x', x, 208); }
  for (const x of [250, 256, 262]) put(`pitch_half_${x}`, 'rq_s_line_x', x, 181);
  for (let y = 154; y < 203; y += 6) { put(`pitch_tw_${y}`, 'rq_s_line_y', 251, Math.min(y, 202)); put(`pitch_te_${y}`, 'rq_s_line_y', 267, Math.min(y, 202)); }
  put('pitch_circle', 'rq_s_circle', CX, 181);
  put('goal_s', 'rq_s_goal', CX, 154.4, { variant: 's' }); put('goal_n', 'rq_s_goal', CX, 207.6, { variant: 'n' });
  // plaza + flag inside the gate, trees along the field
  paint([274, 142.4, 298, 158], 'S'); paint([274, 158, 281, 220], 'S');
  put('p_flag', 'rq_s_flag', 279.5, 152.6);
  for (const [x, y, v] of [[275.6, 148, 'kapok'], [275.6, 162, 'flame'], [275.6, 176, 'rong'], [275.6, 206, 'kapok'], [275.6, 216, 'flame'], [296.6, 214, 'rong']]) tree(x, y, v);
  bench(276.4, 154.5, 6); bench(276.4, 168.5, 6); bench(276.4, 196, 6);
  for (const y of [185.5, 190.5]) put(`p_pp_${y}`, 'rq_s_pp', 277.6, y);
  // teaching block A (5F, 外廊 corridor facing the field), canteen (2F), basketball court between them
  school('p_jxl', 281, 158, { W: 15, D: 24, F: 5, s: 'sch_a', w: 'sch_b', name: '教学楼', school: 'primary' });
  put('p_name', 'rq_s_name', 283.2, 157.94, { z: 15.15, variant: 'rq1' });
  paint([280, 182, 296, 196], 'C'); court('p_court', 280.5, 182.6, 195.8, 'n'); put('p_hoop', 'rq_s_hoop', 288, 196.0, { variant: 's' });   // gatefix: clear of the canteen at y 197.68
  school('p_st', 281, 198, { W: 15, D: 12, F: 2, s: 'sch_c', w: 'sch_c', name: '食堂', school: 'primary' });
  fenceX('pm_f', 242.4, 298, 220.2);

  // ===================================================================================================
  // 榕桥中学 x 242..298, y 220..272 (west gate on 榕校路北段)
  // ===================================================================================================
  paint([242, 220, 298, 272], 'S');
  put('m_gate', 'rq_s_gate_w', 242.4, 245, { variant: 'rqz' });   // gatefix: draw box trimmed to the posts, >= 0.2 m clear of both gate shops
  fenceY('m_fw', 242.4, 234, 237.6); fenceY('m_fw2', 242.4, 258, 272);
  bld('gate_m0', 242, 222, { t: 'A', fr: [2, 3], era: 'e00', fam: 'e4_gate', wshops: { 0: ['s', 'window', 'wd'], 1: ['e', 'kuaican', 'zc'], 2: ['s', 'door', 'tg'], 3: ['s', 'window', 'sg'] }, balc: 0.3, ac: 0.35 });
  bld('gate_m1', 242, 246, { t: 'A', fr: [2, 3], era: 'e00', fam: 'e4_gate', wshops: { 0: ['s', 'window', 'ly'], 1: ['s', 'door', 'xs'], 2: ['e', 'tea', 'ts'], 3: ['s', 'window', 'yj'] }, balc: 0.3, ac: 0.35 });
  put('m_flag', 'rq_s_flag', 254.5, 240.5);
  paint([258, 222, 278, 256], 'C');
  court('m_court', 260, 225, 253, 'sn');
  put('m_hoop_s', 'rq_s_hoop', 267.5, 223.8, { variant: 'n' }); put('m_hoop_n', 'rq_s_hoop', 267.5, 254.2, { variant: 's' });
  for (const y of [227, 232, 237, 242]) put(`m_pp_${y}`, 'rq_s_pp', 277.6, y);
  school('m_lab', 281, 222, { W: 15, D: 24, F: 5, s: 'sch_d', w: 'sch_b', name: '实验楼', school: 'middle' });
  school('m_jxl', 263, 258, { W: 30, D: 12, F: 6, s: 'sch_d', w: 'sch_d', name: '教学楼', school: 'middle' });
  put('m_name', 'rq_s_name', 271.5, 257.94, { z: 18.15, variant: 'rqz' });
  put('m_name_w', 'rq_s_name_w', 280.94, 238, { z: 15.15, variant: 'rqz' });
  for (const [x, y, v] of [[244.5, 262, 'rong'], [251, 266, 'kapok'], [258.5, 262, 'flame'], [296.6, 250, 'rong']]) tree(x, y, v);   // gatefix: the two trees at x 256.5 grew into the gate shops
  bench(246, 268.5, 0); bench(252, 268.5, 0);
  // riverfix: move everything of the school section by DY
  PY = 0;
  for (let i = L0; i < list.length; i++) list[i].y = SY(list[i].y);
  for (let i = C0; i < colliders.length; i++) { const r = colliders[i].rect; colliders[i].rect = [r[0], SY(r[1]), r[2], SY(r[3])]; }
  for (let i = S0; i < solids.length; i++) { const r = solids[i]; solids[i] = [r[0], SY(r[1]), r[2], SY(r[3])]; }
  for (let i = B0; i < BUILT.length; i++) BUILT[i].y0 = SY(BUILT[i].y0);
  for (let i = M0; i < MODERN.length; i++) MODERN[i].y0 = SY(MODERN[i].y0);
  // E4e: the e-bikes no longer stand in the 中学 west gate opening: a parking strip on the 榕校路南段 pavement along the 一小 west
  // fence (no shop fronts, off the students' approach from the north). Placement 未经Leo确认.
  for (const [k, y, v] of [['', 64.4, 'a'], ['2', 66.6, 'b'], ['3', 68.8, 'a']]) put('m_ebikes' + k, 'rq_ebikes', 239.6, y, { variant: v });

  /** riverfix: 月河 east of the old dead end — water, 榕校路 bridge, embankment, railings, waterside walks, two riverside parks */
  function riverfix() {
    const inX = (x, rs) => rs.some(([a, b]) => x > a && x < b);
    for (const r of RIVER.water) { paint(r, null, (x, y) => (y < 194 ? 'V' : R() < 0.18 ? 'U' : 'W')); colliders.push({ id: 'rqe4_river_' + r[0], rect: r.slice() }); solids.push(r.slice()); if (N.water) N.water.push(r.slice()); }
    paint([224, 186, 232, 192], 'S'); paint([242, 186, 320, 192], 'S'); paint([224, 238, 232, 244], 'S'); paint([242, 238, 320, 244], 'S');
    // 榕校路 bridge: deck = the road + pavements painted across; west fascia + both railings (rails collide, the walks pass under their ends)
    for (let y = 192; y < 238; y += 3) put(`brg_fw_${y}`, 'rq_x_rbridge_w', 232, Math.min(y, 235), { variant: (y / 3) % 4 === 2 ? 'p' : 'g' });
    for (let y = 190; y < 240; y += 3) { put(`brg_rw_${y}`, 'rq_x_rail_w', 232.25, y); put(`brg_re_${y}`, 'rq_x_rail_w', 241.75, y); }
    colliders.push({ id: 'rqe4_brg_rw', rect: [232, 190.2, 232.4, 239.8] }, { id: 'rqe4_brg_re', rect: [241.6, 190.2, 242, 239.8] });
    for (let x = 224; x < 318; x += 3) if (!inX(x + 1.5, [[230.5, 243.5]])) { put(`rv_rail_s_${x}`, 'rq_x_rail_s', x, 191.85); put(`rv_emb_${x}`, 'rq_x_embank_s', x, 238); put(`rv_rail_n_${x}`, 'rq_x_rail_s', x, 238.3); }
    for (let x = 226; x < 318; x += 8) if (!inX(x, [[229, 245]])) { tree(x, 187.6, 'willow'); tree(x + 3.5, 242.6, 'willow'); }
    for (const x of [248, 268, 288]) { lamp(x, 186.4); lamp(x + 6, 243.6); bench(x + 3, 186.6, 0); }
    // two riverside parks (dense planting, paths, a small plaza; walkable lawns, beds and shrubs)
    const park = (key, r, py) => {
      const [x0, y0, x1, y1] = r; paint(r, 'G');
      paint([x0, py - 1, x1, py + 1], 'S'); paint([269, y0, 271, y1], 'S'); paint([276, py - 5, 288, py + 5], 'S');
      for (const x of [279, 285]) { bench(x, py + 4.4, 4); bench(x, py - 4.4, 0); } put(key + '_bin', 'p_trashbin', 288.6, py + 1.6);
      for (const x of [252, 262, 292]) lamp(x, py + 1.4);
      for (let y = y0 + 3; y < y1 - 2; y += 5.5) for (let x = x0 + 3; x < x1 - 2; x += 6.5) {
        const tx = +(x + (R() - 0.5) * 2).toFixed(1), ty = +(y + (R() - 0.5) * 2).toFixed(1);
        if (Math.abs(ty - py) < 2.6 || Math.abs(tx - 270) < 2.4 || (tx > 274 && tx < 290 && Math.abs(ty - py) < 7.5)) continue;
        if (R() < 0.62) tree(tx, ty, pick(['rong', 'kapok', 'flame', 'willow', 'rong'])); else put(`${key}_bed_${tx}_${ty}`, 'rq_x_bed', tx - 1.5, ty - 0.6, { variant: pick(['a', 'b', 'c']) });
        if (R() < 0.7) put(`${key}_shrub_${tx}_${ty}`, 'rq_x_shrub', +(tx + 1.6).toFixed(1), +(ty + 1.2).toFixed(1), { variant: pick(SHR) });
      }
    };
    park('pk_s', RIVER.parks[0], 164); park('pk_n', RIVER.parks[1], 258);
    colliders.push({ id: 'rqe4_edge_e', rect: [299.8, 142, 300.4, 186] }, { id: 'rqe4_edge_e2', rect: [299.8, 244, 300.4, 272] });
    creek();
  }
  function creek() {
    for (const r of CREEK.water) { paint(r, null, (x, y) => (x < 227.3 ? 'V' : R() < 0.22 ? 'U' : 'W')); colliders.push({ id: 'rqe4_creek_' + r[1], rect: r.slice() }); solids.push(r.slice()); if (N.water) N.water.push(r.slice()); }
    paint([224, 31.8, 232, 34.2], 'S');   // footbridge deck (and its approach on the west bank)
    put('crk_head', 'rq_x_embank_s', 226.5, 3.6); put('crk_head_r', 'rq_x_rail_s', 226.5, 3.5);
    for (const [k, y] of [['fb_s', 31.75], ['fb_n', 34.35], ['cv_s', 131.45], ['cv_n', 142.25], ['wk_s', 186.15]]) put('crk_' + k, 'rq_x_rail_s', 226.5, y);
    // path-side railing (east bank), broken only at the footbridge; banks: reeds, irises, rocks, willows and a few banyans
    for (const [y0, y1] of [[3.6, 31.7], [34.3, 131.5], [142.3, 186.1]]) for (let y = y0; y < y1 - 0.5; y += 3) put(`crk_rw_${y.toFixed(1)}`, 'rq_x_rail_w', 231.75, +Math.min(y, y1 - 3.1).toFixed(2));
    for (let y = 5; y < 185; y += 2.6) { if ((y > 30 && y < 36) || (y > 130 && y < 143.5)) continue; const yy = +(y + R()).toFixed(1);
      if (R() < 0.7) put(`crk_reed_w_${yy}`, 'rq_x_reed', +(225.9 + R() * 0.4).toFixed(2), yy, { variant: R() < 0.25 ? 'iris' : 'reed' });
      if (R() < 0.55) put(`crk_reed_e_${yy}`, 'rq_x_reed', +(230.1 + R() * 0.4).toFixed(2), +(yy + 0.8).toFixed(1), { variant: R() < 0.25 ? 'iris' : 'reed' });
    }
    for (let y = 9; y < 184; y += 11) if (!(y > 27 && y < 39) && !(y > 126 && y < 147)) tree(R() < 0.5 ? 224.9 : 231.0, +(y + R() * 2).toFixed(1), R() < 0.75 ? 'willow' : 'rong');
    lamp(231.2, 30.4); lamp(231.2, 35.6); bench(222.4, 36.2, 0);
  }
  /** old-save safety: a street position that ends up inside the riverfix zones (water / school ground / hedges) moves to the nearest
   *  walkable point (rings of 0.5 m, <= 30 m). Only the pre-riverfix school lot band — positions in the new school lot are still rejected. Called by progress_save before its checks. */
  const ZR = (window.RONGQIAO_RELOCATE_ZONES = window.RONGQIAO_RELOCATE_ZONES || []);   // later phases add { id, rect, old } (old = footprints that were already solid: still rejected)
  ZR.push({ id: 'riverfix', rect: [224, 142, 320.5, 272], old: [] });   // the old school lot + buffer, now river / walks / parks; the new school lot stays forged-reject
  window.RONGQIAO_RELOCATE = (x, y) => {
    const inR = (r) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3];
    if (!N.forbidden(x, y) || !ZR.some((z) => inR(z.rect) && !(z.old || []).some(inR))) return null;
    const cols = D.colliders, free = (px, py) => !N.forbidden(px, py) && !cols.some((c) => px > c.rect[0] - 0.3 && px < c.rect[2] + 0.3 && py > c.rect[1] - 0.3 && py < c.rect[3] + 0.3) && px >= D.bounds.x0 && px <= D.bounds.x1 && py >= D.bounds.y0 && py <= D.bounds.y1;
    for (let r = 0.5; r <= 30; r += 0.5) for (let k = 0; k < Math.max(8, Math.round(r * 12)); k++) { const a = (k / Math.max(8, Math.round(r * 12))) * Math.PI * 2, px = +(x + Math.cos(a) * r).toFixed(2), py = +(y + Math.sin(a) * r).toFixed(2); if (free(px, py)) return [px, py]; }
    return null;
  };
  // ---- register ----
  for (const r of solids) N.solids.push(r);
  const SCHOOLS = [{ id: 'rq1', name: '榕桥第一小学', kind: 'primary', rect: [242, SY(142), 298, SY(220)], gate: [GX + 4.1, SY(141.6)], gateFace: 's', track: { centres: [[CX, SY(CS)], [CX, SY(CN)]], r: [9, 15], straight: CN - CS } },
    { id: 'rqz', name: '榕桥中学', kind: 'middle', rect: [242, SY(220), 298, SY(272)], gate: [241.6, SY(241)], gateFace: 'w' }];
  N.expansionE4 = { phase: 'E4', road: { name: '榕校路', ew: EW, ns: NS, nss: NSS, lane: LANE, dropoff: [262, SY(137.5), 276, SY(139.9)] }, schools: SCHOOLS, river: RIVER, creek: CREEK, gateShops: ['rqe_e4_gate_p0', 'rqe_e4_gate_m0', 'rqe_e4_gate_m1'],
    removed: removed.length, unconfirmed: true };
  D.colliders = D.colliders.concat(colliders);
  D.objects = D.objects.concat(base);
  window.SCENE_CHUNKS = window.SCENE_CHUNKS || {};
  window.SCENE_CHUNKS[CHID] = { objects: list, colliders: [] };
  (window.RONGQIAO_LATE_CHUNKS = window.RONGQIAO_LATE_CHUNKS || []).push({ id: CHID, name: '榕校路·榕桥第一小学·榕桥中学', rect: CHRECT, src: 'rongqiao_expand_e4.js', load_m: 30, unload_m: 60 });
})();
