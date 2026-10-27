/* 榕桥区扩张 E5a+E5b (2026-10-18, Leo 16:42 / 17:29): 月湾新区 — modern district north of 月河 with a height transition,
 * following the coastal plan v2 topology (Option B: newer, taller development across the river from the old town,
 * the main N-S road 槐北街 as its spine, the tallest offices at the far (north) edge where their camera occlusion only covers
 * ground beyond the map). Pure data, loaded after rongqiao_expand_e4.js (before rongqiao_ebikes.js, which styles the racks).
 * Bounds grow north y 272 -> 432, ground y 300 -> 456 (rows appended north; every coordinate is absolute, old saves unaffected).
 * E5b (same file, chunks after rqe_e5_bg): the temporary seal at x 100 is gone; the district continues east to x 300.
 *   y 272..300  the E2 background row of old 3-8F blocks (now inside the bounds) + their back yards / lane
 *   y 302..310  月湾路 (two-lane street, painted; no live lanes — 槐北街 keeps the only live N-S traffic)
 *   y 314..326  沿街商住楼 7-9F (00s/90s, shops on 月湾路) with gaps for the compound gates; service lane behind
 *   y 330..388  gated 小区 11-18F: 月湾嘉园 (west of 槐北街) and 槐北名苑 (east): gate + guard booth on 月湾路, fence, inner roads with
 *               parking, e-bike sheds, a central garden (play, fitness, pavilion, trees); 11-14F front row, 15-18F back row
 *   y 390..398  月湾北路 (CBD street)
 *   y 401..428  CBD: 月湾国际 26F (stone grid), 槐北科创大厦 22F (dark metal), 月湾金融中心 32F (curtain wall) on plazas with lobbies,
 *               canopies, name panels, podium shops, parking ramps; 月湾天地 5F mall with storefronts
 * Every new building is a closed volume: S + W facade bays on every floor (the camera only sees those faces), a roof slab of
 * rq_m3_dtile tiles over the whole footprint with parapets / a crown on all four edges, roof equipment (E4e roof kit).
 * Residential windows are f_window objects with night_lit on ~70% of flats (per-window nightly schedule of the perf pass; the rest are empty or away).
 * Chunks rqe_e5_* go to RONGQIAO_TAIL_CHUNKS, appended by js/rongqiao_register.js after every older chunk (old saves keep their
 * chunk prefix). East of x 100: 月湾汇 (3F podium + 2F glass setback, roof deck in use), 月湾悦府 / 槐北佳苑, 榕校路 north, east CBD.
 * All names / storeys / layouts are Grok's choices (未经Leo确认). */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, V = window.RONGQIAO_VARIETY;
  if (!D || !N || !V || !D.rongqiaoExpandE4 || D.rongqiaoExpandE5) return; D.rongqiaoExpandE5 = 1;
  const G = D.ground, BY1 = 432, GY1 = 456, X0 = -42, X1 = 100, GX0 = G.origin[0], GX1 = G.origin[0] + G.cols * G.chunk;
  let seed = 20261025; const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = (a) => a[(R() * a.length) | 0];
  // ---- ground rows north to y 456 ----
  while (G.origin[1] + G.data_south_to_north.length * G.chunk < GY1) G.data_south_to_north.push('K'.repeat(G.cols));
  G.rows = G.data_south_to_north.length;
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
  N.bounds = Object.assign({}, N.bounds, { y1: Math.max(N.bounds.y1 || 0, BY1) });
  // ---- chunks (rects reach south so the tall volumes stream in while the camera looks at them from the river side) ----
  const CH = [
    ['rqe_e5_ywl', '月湾路·沿街商住', [X0, 286, X1, 330]],
    ['rqe_e5_xqw', '月湾嘉园', [X0, 300, 16, 388]],
    ['rqe_e5_xqe', '槐北名苑', [32, 300, X1, 388]],
    ['rqe_e5_cbd', '月湾北路·月湾CBD', [X0, 300, X1, GY1]],
    ['rqe_e5_bg', '月湾新区（背景）', [GX0, 272, GX1, GY1]],
    // E5b east of x 100 (appended after the E5a chunks)
    ['rqe_e5_ywle', '月湾路东段·沿街商住', [X1, 272, 300, 330]],
    ['rqe_e5_mall', '月湾汇', [X1, 300, 163, 388]],
    ['rqe_e5_xqm', '月湾悦府', [163, 300, 232, 388]],
    ['rqe_e5_xqn', '槐北佳苑 · 榕校路', [232, 286, 300, 456]],
    ['rqe_e5_cbde', '月湾北路东段·CBD', [X1, 300, 300, GY1]],
  ];
  const lists = {}; for (const [id] of CH) lists[id] = [];
  let FORCE = null;
  const chunkOf = (x, y) => (x < X0 || x >= 300 ? 'rqe_e5_bg' : x >= X1 ? (y < 330 ? 'rqe_e5_ywle' : y >= 388 ? 'rqe_e5_cbde' : x < 163 ? 'rqe_e5_mall' : x < 232 ? 'rqe_e5_xqm' : 'rqe_e5_xqn') : y < 330 ? 'rqe_e5_ywl' : y < 388 ? (x < 24 ? 'rqe_e5_xqw' : 'rqe_e5_xqe') : 'rqe_e5_cbd');
  const used = new Set(); const uid = (s) => { let k = s, n = 1; while (used.has(k)) k = s + '_' + n++; used.add(k); return k; };
  const put = (id, type, x, y, more) => lists[FORCE || chunkOf(x, y)].push(Object.assign({ id: uid('rqe5_' + id), type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  const solids = [], colliders = [];
  const inX = (x, spans) => spans.some(([a, b]) => x > a && x < b);
  const SHR = ['dj', 'hy', 'hs', 'sj', 'sw', 'gb'];
  const wv = (x, y) => ['willow', 'willow2', 'willow', 'willow3'][Math.abs(Math.round(x * 7 + y * 13)) % 4];
  const tree = (x, y, v) => put(`t_${v}_${x}_${y}`, 'rq_x_tree', x, y, { variant: v === 'willow' ? wv(x, y) : v });
  const pitTree = (x, y, v) => { paint([x - 1, y - 1, x + 1, y + 1], 'T'); tree(x, y, v || pick(['rong', 'kapok', 'flame'])); };
  // 月湾路 / 月湾北路行道树：榕、木棉、凤凰木、樟按桩距轮换。显式品种前仍消耗一次 R()，后面的随机摆放不挪位。
  const STREET = ['rong', 'kapok', 'flame', 'camphor'];
  const streetAt = (x) => STREET[((Math.round((x - (X0 + 4)) / 9) % 4) + 4) % 4];
  const keepR = (v) => (R(), v);
  const lamp = (x, y) => put(`lamp_${x}_${y}`, 'p_lamp', x, y, { interact: 'lamp' });
  const bench = (x, y, rot) => put(`bench_${x}_${y}`, 'community_bench', x, y, { rot: rot || 0 });
  const solid = (id, rect) => { solids.push(rect); colliders.push({ id: 'rqe5_c_' + id, rect }); };
  function planted(rect, opt = {}) {
    paint(rect, null, (x, y, c) => (c === 'T' ? null : 'G'));
    const [x0, y0, x1, y1] = rect, step = opt.step || 2;
    for (let y = y0 + step / 2; y < y1 - 0.4; y += step) for (let x = x0 + step / 2; x < x1 - 0.4; x += step) {
      if (opt.skip && opt.skip(x, y)) continue;
      if (opt.beds !== false && R() < (opt.bedP || 0.2) && x + 3 <= x1 && y + 1.2 <= y1) { put(`bed_${x}_${y}`, 'rq_x_bed', x - 0.9, y - 0.6, { variant: pick(['a', 'b', 'c']) }); x += 2; continue; }
      put(`shrub_${x}_${y}`, 'rq_x_shrub', x + (R() - 0.5) * 0.5, y + (R() - 0.5) * 0.5, { variant: opt.shrubs ? pick(opt.shrubs) : pick(SHR) });
    }
  }
  function cars(x0, x1, y, rot, gap, step) { for (let x = x0; x <= x1; x += step || (rot === 2 ? 5.4 : 2.7)) { if (R() < (gap || 0.2)) continue; put(`car_${x}_${y}`, 'p_car', x, y, { rot: rot || 0, state: 'normal', variant: R() < 0.12 ? 'red' : R() < 0.06 ? 'taxi' : 'base' }); } }
  const fenceX = (key, x0, x1, y, skip) => { for (let x = x0 + 1; x < x1 - 0.5; x += 2) if (!(skip || []).some(([a, b]) => x > a - 1 && x < b + 1)) put(`${key}_${x}`, 'w_fence', x, y); };
  const fenceY = (key, x, y0, y1, skip) => { for (let y = y0 + 1; y < y1 - 0.5; y += 2) if (!(skip || []).some(([a, b]) => y > a - 1 && y < b + 1)) put(`${key}_${y}`, 'w_fence', x, y, { rot: 2 }); };
  const SHOPS = [['s', 'window', 'ly'], ['e', 'noodle', 'mn'], ['s', 'door', 'wj'], ['e', 'kuaican', 'cf'], ['s', 'window', 'sg'], ['s', 'door', 'lf'], ['e', 'tea', 'ts'], ['s', 'window', 'xs'], ['s', 'door', 'bl'], ['s', 'window', 'zy'], ['e', 'tea', 'cy']];
  let shopK = 5; const nextShop = () => SHOPS[shopK++ % SHOPS.length];
  // ---- 商住楼 on the variety system (same module as E1-E4 bld) ----
  const BUILT = N.buildings || (N.buildings = []), MODERN = N.modernBuildings || (N.modernBuildings = []);
  function bld(id, x0, y0, o) {
    const fg = 'rqe_e5_' + id, fam = o.fam || 'e5_' + id.replace(/\d+$/, '');
    const A = o.t !== 'B', W = A ? 15 : 12, Dp = A ? 12 : 9, size = A ? 'a' : 'b';
    const S = V.style(fg, fam, o.f, { range: o.fr, size, bays: W / 3, era: o.era, mats: o.mats });
    const nS = W / 3, nW = Dp / 3, F = S.F, balc = o.balc == null ? 0.45 : o.balc, ac = o.ac == null ? 0.3 : o.ac, door = Math.floor(nS / 2);
    const shops = o.shops || {};
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
        put(k + '_wall', 'f_wall', x0, y, { z, rot: 6, state: st, fade_group: fg, variant: S.mat });
        const u = f > 1 ? V.unit(S, f, nS + b, 0, 'W') : { variant: pick(S.win) };
        put(k + '_win', 'f_window', x0, y, { z, rot: 6, state: 'intact', fade_group: fg, night_lit: u.reno || R() < 0.5, variant: u.variant });
        if (f > 1 && R() < ac * 0.6) put(k + '_ac', 'f_ac', x0, y - 0.6, { z: z + 0.5, rot: 6, fade_group: fg, variant: V.acVariant(S) });
      }
    }
    if (F > 2) put(id + '_pipe', 'f_pipe', x0 + W - 0.4, y0, { fade_group: fg });
    const roofType = A ? 'b_roof_a' : 'b_roof_b';
    // pitch is applied after style() so the era pool's R() count stays put (e80 still rolls tank/shed for other districts).
    const roofVar = o.pitch ? V.tile('r_pitch', roofType, fg) : V.tile(S.roof === 'c' && A ? 'base' : S.roof, roofType, fg);
    put(id + '_roof', roofType, x0, y0, { z: F * 3, fade_group: fg, variant: roofVar });
    solids.push([x0, y0, x0 + W, y0 + Dp]); colliders.push({ id: fg, rect: [x0 - 0.32, y0 - 0.32, x0 + W, y0 + Dp] });
    BUILT.push({ id: fg, chunk: FORCE || chunkOf(x0 + W / 2, y0 + Dp / 2), fam, x0, y0, W, D: Dp, F, mat: S.mat, roof: roofType + '/' + roofVar, reno: S.reno.size });
    return fg;
  }
  // ---- closed roof (E4e kit): 6 x 4.5 slab tiles over the whole footprint, parapet or crown on all four edges, roof equipment ----
  function roof(id, fg, x0, y0, W, Dp, z, o = {}) {
    const more = { z, fade_group: fg };
    for (let x = x0; x < x0 + W - 0.01; x += 6) for (let y = y0; y < y0 + Dp - 0.01; y += 4.5) {
      const t = o.tile ? o.tile(+(x - x0).toFixed(2), +(y - y0).toFixed(2)) : null; if (t === false) continue;   // E5b: decks (parking, courts, lawn, skylights); false = covered by a setback block
      put(`${id}_rt${x}_${y}`, t ? t[0] : 'rq_m3_dtile', x, y, Object.assign({ variant: t ? t[1] : 'roof' }, more));
    }
    const cs = o.crown ? 'crs' : 's', cw = o.crown ? 'crw' : 'w';
    for (let x = x0; x < x0 + W - 0.01; x += 6) { put(`${id}_ps${x}`, 'rq_m3_par', x, y0, Object.assign({ variant: cs }, more)); put(`${id}_pn${x}`, 'rq_m3_par', x, y0 + Dp - 0.25, Object.assign({ variant: 's' }, more)); }
    for (let y = y0; y < y0 + Dp - 0.01; y += 4.5) { put(`${id}_pw${y}`, 'rq_m3_par', x0, y, Object.assign({ variant: cw }, more)); if (!(o.gapE && y + 4.5 > o.gapE[0] && y < o.gapE[1])) put(`${id}_pe${y}`, 'rq_m3_par', x0 + W - 0.25, y, Object.assign({ variant: 'w' }, more)); }
    for (const [v, rx, ry] of o.kit || []) put(`${id}_k${v}_${rx}_${ry}`, 'rq_m3_kit', x0 + rx, y0 + ry, Object.assign({ variant: v }, more));
  }
  // ---- high-rise residential tower (W multiple of 6, D multiple of 9): cladding walls + window / balcony / AC units ----
  const HRES = [];
  function tower(id, x0, y0, W, Dp, F, o) {
    const fg = 'rqe_e5_' + id, nS = W / 3, nW = Dp / 3, door = Math.floor(nS / 2) - (nS % 2 ? 0 : 1), mat = o.mat;
    const balCol = (b) => (o.balEvery === 2 ? b % 2 === 1 : b % 3 === 1);
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = 0; b < nS; b++) {
        const x = x0 + b * 3, k = `${id}_S${f}_${b}`;
        const accent = o.accent && b === o.accent;
        put(k + '_wall', 'f_wall', x, y0, { z, state: 'upper', fade_group: fg, variant: accent && f > 1 ? o.accent2 || mat : mat });
        if (f === 1) {
          if (b === door || b === door + 1) put(k + '_door', 'f_door', x, y0, { z, state: 'closed', fade_group: fg });
          else put(k + '_win', 'f_window', x, y0, { z, state: 'intact', fade_group: fg, night_lit: R() < 0.7, halo: false, variant: 'n2' });
          continue;
        }
        if (balCol(b) && !accent) put(k + '_balc', 'f_balcony', x, y0, { z, state: R() < 0.3 ? 'laundry' : 'default', fade_group: fg, variant: (f + b) % 4 ? 'g1' : 'g2' });
        else { put(k + '_win', 'f_window', x, y0, { z, state: 'intact', fade_group: fg, night_lit: R() < 0.7, halo: false, variant: R() < 0.7 ? 'n1' : 'n2' });
          if (R() < 0.42) put(k + '_ac', 'f_ac', x + 2.4, y0, { z: z + 0.5, fade_group: fg, variant: 'a1' }); }
      }
      for (let b = 0; b < nW; b++) {
        const y = y0 + 3 + b * 3, k = `${id}_W${f}_${b}`;
        put(k + '_wall', 'f_wall', x0, y, { z, rot: 6, state: 'upper', fade_group: fg, variant: mat });
        put(k + '_win', 'f_window', x0, y, { z, rot: 6, state: 'intact', fade_group: fg, night_lit: R() < 0.7, halo: false, variant: f === 1 ? 'n2' : R() < 0.6 ? 'n1' : 'n2' });
        if (f > 1 && R() < 0.25) put(k + '_ac', 'f_ac', x0, y - 0.6, { z: z + 0.5, rot: 6, fade_group: fg, variant: 'a1' });
      }
    }
    put(id + '_pipe', 'f_pipe', x0 + W - 0.4, y0, { fade_group: fg });
    roof(id, fg, x0, y0, W, Dp, F * 3, { crown: o.crown, kit: [['tank', 1.2, Dp - 4], ['mach', W / 2 - 1.75, Dp / 2 - 1.3], ['solar', 1.4, 1.2], ['solar', W - 4.2, 1.2]] });
    solids.push([x0, y0, x0 + W, y0 + Dp]); colliders.push({ id: fg, rect: [x0 - 0.32, y0 - 0.32, x0 + W, y0 + Dp] });
    MODERN.push({ id: fg, chunk: FORCE || chunkOf(x0 + W / 2, y0 + Dp / 2), kind: 'residential', name: o.name || null, x0, y0, W, D: Dp, F, mat, roof: 'closed' }); HRES.push(fg);
    return fg;
  }
  // ---- office tower / mall: facade skins per floor, lobby + podium shops on the ground floor, canopy, name panels, closed roof ----
  const OFFICES = [], MALLS = [];
  function office(id, x0, y0, W, Dp, F, o) {
    const fg = 'rqe_e5_' + id, nS = W / 3, nW = Dp / 3, lobby = o.lobby || [Math.floor(nS / 2) - 1, Math.floor(nS / 2)], shopsS = o.shops || [], alt = o.skin + '_b';
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      const sk0 = (b) => (o.kind === 'mall' ? 'mall_a' : f > 1 && (f * 7 + b * 3 + ((f * b) % 3)) % 5 < 2 ? alt : o.skin);
      const sk = (b, side) => (o.wall && f > 1 && o.wall(f, b, side || 'S')) || sk0(b);
      const doorBay = lobby[Math.floor((lobby.length - 1) / 2)];
      const groundBay = (b, shop) => {
        if (lobby.includes(b) && b === doorBay) return o.kind === 'mall' ? 'mall_door' : /^cw_/.test(o.skin) ? 'cw_entry' : 'of_lobby_door';
        if (lobby.includes(b)) return o.kind === 'mall' ? 'mall_a' : /^cw_/.test(o.skin) ? o.skin : 'of_lobby';
        return shop || (o.kind === 'mall' ? 'mall_a' : /^cw_/.test(o.skin) ? o.skin : 'of_lobby');
      };
      for (let b = 0; b < nS; b++) {
        let v = sk(b), s = st;
        if (f === 1) { v = groundBay(b, shopsS[b % Math.max(1, shopsS.length)]); s = 'ground'; }
        put(`${id}_S${f}_${b}`, 'f_wall', x0 + b * 3, y0, { z, state: s, fade_group: fg, variant: v });
      }
      for (let b = 0; b < nW; b++) {
        let v = sk(b + 1, 'W'), s = st;
        if (f === 1) { v = o.wshops && o.wshops[b] ? o.wshops[b] : o.kind === 'mall' ? 'mall_a' : /^cw_/.test(o.skin) ? o.skin : 'of_lobby'; s = 'ground'; }
        put(`${id}_W${f}_${b}`, 'f_wall', x0, y0 + 3 + b * 3, { z, rot: 6, state: s, fade_group: fg, variant: v });
      }
    }
    const zt = F * 3;
    // E5b (Leo: no empty flat roofs): towers ≥ 24 m wide also get a solar row and an exhaust stack; a mall can bring its own roof (o.roofFn)
    const big = W >= 24 && o.kind !== 'mall' ? [['solar', 1.4, 1.2], ['solar', 5.4, 1.2], ['solar', 9.4, 1.2], ['vent', W / 2 - 1.6, Dp - 3.4]] : [];
    if (o.roofFn) o.roofFn(fg, zt); else roof(id, fg, x0, y0, W, Dp, zt, { crown: false, kit: o.kind === 'mall' ? [['ac', 2, 4], ['ac', W - 6, 4], ['vent', W / 2 - 1.8, Dp - 4]] : [['lift', W / 2 - 1.8, Dp / 2 - 1.3], ['mach', 1.5, Dp - 4], ['ac', W - 5, Dp - 4], ['tank', W - 4, 1.4]].concat(big) });
    const cx = x0 + lobby[0] * 3 + (lobby.length * 3 - 6) / 2;
    put(id + '_canopy', 'rq_cw_canopy', cx, y0, { fade_group: fg });
    for (const ex of o.canopies || []) put(`${id}_canopy${ex}`, 'rq_cw_canopy', x0 + ex, y0, { fade_group: fg });
    if (o.logo) {
      put(id + '_logo', 'rq_cw_logo', x0 + Math.max(0.5, (W - 7) / 2), y0 - 0.02, { z: zt - 2.2, variant: o.logo, fade_group: fg });
      if (o.logoW) put(id + '_logo_w', 'rq_cw_logo_w', x0 - 0.02, y0 + Dp / 2 + 3.5, { z: zt - 2.2, variant: o.logo, fade_group: fg });
      if (o.kind !== 'mall') put(id + '_logo_lobby', 'rq_cw_logo', cx - 0.5, y0 - 2.42, { z: 3.45, variant: o.logo + '_l', fade_group: fg });
    }
    solids.push([x0, y0, x0 + W, y0 + Dp]); colliders.push({ id: fg, rect: [x0 - 0.32, y0 - 0.32, x0 + W, y0 + Dp] });
    const rec = { id: fg, chunk: FORCE || chunkOf(x0 + W / 2, y0 + Dp / 2), kind: o.kind || 'office', name: o.name, x0, y0, W, D: Dp, F, skin: o.skin, roof: 'closed', desc: o.desc || null };
    MODERN.push(rec); (o.kind === 'mall' ? MALLS : OFFICES).push(rec);
    return fg;
  }

  // =====================================================================================================
  // the E2 background row (old 3-8F, y 274..286) is now inside the bounds: back yards + lane behind it
  // =====================================================================================================
  FORCE = 'rqe_e5_ywl';
  // (槐北街 x 16..32 keeps the E2 carriageway + pavements that already run to the old ground edge y 300)
  paint([X0, 286, 16, 300], 'K'); paint([32, 286, X1, 300], 'K');
  for (let x = X0 + 3; x < X1 - 2; x += 7) { if (inX(x, [[14, 34]])) continue; tree(+(x + R() * 1.5).toFixed(1), 289 + R(), pick(['rong', 'camphor', 'peach', 'kapok'])); }
  for (let x = X0 + 6; x < X1 - 4; x += 21) if (!inX(x, [[10, 38]])) put(`yard_shed_${x}`, 'rq_x_shed', x, 287.2);
  cars(X0 + 2, 12, 293.2, 2, 0.35); cars(36, X1 - 3, 293.2, 2, 0.35);
  for (let x = X0 + 4; x < X1 - 2; x += 9) if (!inX(x, [[12, 36]])) planted([x, 297, x + 5, 299.6], { beds: false, step: 1.6, shrubs: ['hy', 'gb', 'sj'] });
  for (let x = X0 + 10; x < X1; x += 26) if (!inX(x, [[12, 36]])) { put(`yard_bins_${x}`, 'p_bins', x, 296.6); put(`yard_rack_${x}`, 'rq_ebikes', x + 4, 296.4); }
  // =====================================================================================================
  // 月湾路 y 302..310 + pavements, then the 7-9F 商住楼 frontage (shops face the street and the camera)
  // =====================================================================================================
  paint([X0, 300, X1, 302], 'S'); paint([X0, 302, X1, 310], null, road); paint([X0, 310, X1, 314], 'S');
  for (let x = X0 + 1; x < X1; x += 2) if (!inX(x, [[15, 33]])) { put(`ywl_curb_s${x}`, 'p_curb', x, 301.9); put(`ywl_curb_n${x}`, 'p_curb', x, 310.1); put(`ywl_edge_s${x}`, 'd_edge_line', x, 302.35); put(`ywl_edge_n${x}`, 'd_edge_line', x, 309.65); }
  for (let x = X0 + 1.5; x < X1; x += 3) if (!inX(x, [[13, 35]])) put(`ywl_dash_${x}`, 'd_center_dash', x, 306);
  for (const xm of [12, 38]) for (let k = 0; k < 8; k++) put(`ywl_zebra_${xm}_${k}`, 'd_stripe', xm, 302.55 + k, { rot: 2 });
  for (let x = X0 + 4; x < X1 - 2; x += 9) if (!inX(x, [[8, 40], [-10, 4], [62, 80]])) pitTree(+x.toFixed(1), 311.6, keepR(streetAt(x)));   // crowns clear the 商住楼 fronts at y 314.4
  for (let x = X0 + 8; x < X1; x += 22) if (!inX(x, [[12, 36]])) { lamp(x, 300.8); lamp(x + 11, 313.2); }
  cars(X0 + 3, 8, 303.4, 2, 0.45); cars(44, X1 - 4, 303.4, 2, 0.45);
  put('ywl_bus_w', 'p_busstop', 2, 313.0); put('ywl_bus_e', 'p_busstop', 42, 300.8);
  // 槐北街 north of the E2 ground edge (y 300 -> 456): carriageway + pavements; live nb / sb lanes extended
  FORCE = 'rqe_e5_cbd';
  paint([16, 300, 22, GY1], 'S'); paint([22, 300, 28, GY1], null, road); paint([28, 300, 32, GY1], 'S'); paint([16, 302, 32, 310], null, road); paint([16, 390, 32, 398], null, road);
  for (let y = 301; y < GY1; y += 2) { if (inX(y, [[301, 311], [389, 399]])) continue; put(`hb_curb_w${y}`, 'p_curb', 21.9, y, { rot: 2 }); put(`hb_curb_e${y}`, 'p_curb', 28.1, y, { rot: 2 }); put(`hb_edge_w${y}`, 'd_edge_line', 22.35, y, { rot: 2 }); put(`hb_edge_e${y}`, 'd_edge_line', 27.65, y, { rot: 2 }); }
  for (let y = 301.5; y < GY1; y += 3) if (!inX(y, [[300, 312], [388, 400]])) put(`hb_dash_${y}`, 'd_center_dash', 25, y, { rot: 2 });
  for (let y = 318, i = 0; y < BY1; y += 10, i++) { if (inX(y, [[386, 402]])) continue; pitTree(18.4, y, keepR(STREET[i % 4])); pitTree(30, y + 5, keepR(STREET[(i + 2) % 4])); }
  for (let y = 324; y < BY1; y += 24) { lamp(17, y); lamp(31, y + 12); }
  for (const l of D.traffic.lanes) if (l.id === 'nb' || l.id === 'sb') l.range = [l.range[0], Math.max(l.range[1], GY1)];
  FORCE = null;
  const SZL = [];
  function szl(id, x0, t, fr) {
    const nS = t === 'B' ? 4 : 5, door = Math.floor(nS / 2), shops = {};
    for (let b = 0; b < nS; b++) if (b !== door) shops[b] = nextShop();
    SZL.push(bld(id, x0, 314.4, { t, fr: fr || [7, 9], era: 'e80', mats: ['base', 'w1', 'w2', 'w1', 'base', 'm_brick2'], fam: 'e5_szl', shops, balc: 0.55, ac: 0.4, pitch: true }));
  }
  FORCE = 'rqe_e5_ywl';
  szl('szw0', -39, 'A'); szl('szw1', -23, 'A'); szl('szw2', 4, 'B', [7, 8]);
  szl('sze0', 33, 'A'); szl('sze1', 49, 'A'); szl('sze2', 77, 'A');
  // service lane behind the frontage (bins, e-bike racks), pocket plazas at the ends
  paint([X0, 326.4, X1, 330], 'K');
  for (const x of [-34, -17, 37, 54, 82]) { put(`svc_bins_${x}`, 'p_bins', x, 327.4); put(`svc_rack_${x}`, 'rq_ebikes', x + 4.5, 327.2); }
  FORCE = null;

  // =====================================================================================================
  // gated 小区: gate on 月湾路 between the frontage blocks, fence, inner roads + parking, two rows of towers, central garden
  // =====================================================================================================
  const XQ = [];
  function compound(key, name, gv, x0, x1, gateX, rows, chunk) {
    FORCE = chunk;
    const FY = 314.2, Y0 = 330.4, Y1 = 388;
    // entrance drive through the frontage gap, gate + booth at the street line
    paint([gateX, 310, gateX + 8, Y0], 'K'); paint([gateX - 1, FY - 0.4, gateX, Y0], 'S'); paint([gateX + 8, FY - 0.4, gateX + 10.4, Y0], 'S');
    put(key + '_gate', 'rq_x_cgate', gateX, FY - 0.4, { variant: 'ngfh' }); put(key + '_gname', 'rq_h_gname', gateX - 0.6, FY - 1.0, { variant: gv });
    solid(key + '_booth', [gateX + 8.3, FY + 0.6, gateX + 10, FY + 2.6]);
    // gap fences beside the drive, unless a frontage block already closes that side
    const closed = (x) => BUILT.some((b) => x > b.x0 - 1.6 && x < b.x0 + b.W + 1.6 && b.y0 < Y0 && b.y0 + b.D > FY);   // within 1.6 m the facade closes the side (a fence there reads as jammed into the wall)
    if (!closed(gateX - 0.8)) { fenceY(key + '_fgw', gateX - 0.8, FY + 0.8, Y0); colliders.push({ id: `rqe5_c_${key}_gw`, rect: [gateX - 1.1, FY + 0.8, gateX - 0.5, Y0 - 0.3] }); }
    if (!closed(gateX + 10.6)) { fenceY(key + '_fge', gateX + 10.6, FY + 2.8, Y0); colliders.push({ id: `rqe5_c_${key}_ge`, rect: [gateX + 10.3, FY + 2.8, gateX + 10.9, Y0 - 0.3] }); }
    // fence on the outer edges (the frontage blocks close the south side)
    fenceX(key + '_fs', x0, x1, Y0, [[gateX, gateX + 8]]); fenceX(key + '_fn', x0, x1, Y1);
    fenceY(key + '_fw', x0, Y0, Y1); fenceY(key + '_fe', x1, Y0, Y1);
    for (const r of [[x0 - 0.3, Y0 - 0.3, x1 + 0.3, Y0 + 0.3, 's'], [x0 - 0.3, Y1 - 0.3, x1 + 0.3, Y1 + 0.3, 'n'], [x0 - 0.3, Y0 + 0.3, x0 + 0.3, Y1 - 0.3, 'w'], [x1 - 0.3, Y0 + 0.3, x1 + 0.3, Y1 - 0.3, 'e']]) {   // non-overlapping runs
      if (r[4] === 's') { colliders.push({ id: `rqe5_c_${key}_fs0`, rect: [r[0], r[1], gateX, r[3]] }, { id: `rqe5_c_${key}_fs1`, rect: [gateX + 8, r[1], r[2], r[3]] }); continue; }
      colliders.push({ id: `rqe5_c_${key}_f${r[4]}`, rect: r.slice(0, 4) }); }
    // inner ring road with parking, central garden, back garden strip
    paint([x0 + 0.5, Y0 + 0.5, x1 - 0.5, Y0 + 5.5], 'K'); paint([x0 + 0.5, Y1 - 4.6, x1 - 0.5, Y1 - 0.5], 'K');
    const [r1y, r2y] = [Y0 + 7, Y1 - 23];
    const gardenY0 = r1y + 18, gardenY1 = r2y;
    const blocks = [];
    for (const [row, y0] of [[rows[0], r1y], [rows[1], r2y]]) for (const [bx, W, F, mat, crown, acc] of row) blocks.push(tower(`${key}_${blocks.length}`, bx, y0, W, 18, F, { mat, crown, accent: acc, accent2: mat === 'hr_cream' ? 'hr_terra' : 'hr_white', balEvery: W > 18 ? 3 : 2, name }));
    // side drive + parking along the free edge, between the tower rows a garden
    const xs = [].concat(rows[0], rows[1]).map(([bx, W]) => [bx, bx + W]), freeE = Math.max(...xs.map((s) => s[1])), freeW = Math.min(...xs.map((s) => s[0]));
    if (x1 - freeE > 6) { paint([freeE + 1, Y0 + 5.5, x1 - 0.5, Y1 - 4.6], 'K'); for (let y = Y0 + 8; y < Y1 - 7; y += 2.7) if (R() > 0.25) put(`${key}_pcar_${y}`, 'p_car', x1 - 3.2, +y.toFixed(1), { rot: 0, state: 'normal', variant: R() < 0.15 ? 'red' : 'base' }); put(key + '_shed', 'rq_x_shed', freeE + 1.6, gardenY0 + 1.5); }
    if (freeW - x0 > 3) planted([x0 + 0.6, Y0 + 5.6, freeW - 0.4, Y1 - 4.8], { beds: false, step: 1.8, shrubs: ['hy', 'gb', 'sj', 'dj'] });
    cars(x0 + 2, x1 - 3, Y0 + 2.6, 2, 0.3); cars(x0 + 2, x1 - 3, Y1 - 2.6, 2, 0.35);
    planted([freeW, gardenY0 + 0.4, freeE, gardenY1 - 0.4], { beds: true, step: 1.8, shrubs: ['hy', 'gb', 'sj', 'dj', 'hs'], skip: (x, y) => (Math.abs(x - (freeW + 6)) < 3.2) || (Math.abs(x - (freeE - 8)) < 4) || Math.abs(y - (gardenY0 + gardenY1) / 2) < 1.1 });
    paint([freeW, (gardenY0 + gardenY1) / 2 - 1.1, freeE, (gardenY0 + gardenY1) / 2 + 1.1], 'S');
    put(key + '_play', 'rq_x_play', freeW + 4.4, gardenY0 + 1.2); put(key + '_fit', 'rq_x_fit', freeW + 9, gardenY0 + 1.4); put(key + '_pav', 'rq_x_pavilion', freeE - 8.5, gardenY0 + 0.8);
    for (let x = freeW + 2, i = 0; x < freeE - 1; x += 6, i++) { if (Math.abs(x - (freeE - 6.5)) < 4.5) continue; tree(+x.toFixed(1), gardenY1 - 3, keepR(i % 2 ? 'peach' : 'sakura')); }   // low flowering crowns inside the compound
    bench(freeW + 11, (gardenY0 + gardenY1) / 2 - 1.6, 0); bench(freeE - 14, (gardenY0 + gardenY1) / 2 + 1.4, 4);
    for (let x = freeW + 8; x < freeE - 4; x += 12) lamp(+x.toFixed(1), +((gardenY0 + gardenY1) / 2 + 1.5).toFixed(1));   // path lamps
    for (const [x, y] of [[x0 + 2.5, Y0 + 3], [x1 - 2.5, Y1 - 3], [freeW + 2, gardenY0 + 4], [freeE - 2, gardenY1 - 2]]) lamp(+x.toFixed(1), +y.toFixed(1));
    put(key + '_bins', 'p_bins', x1 - 3, Y0 + 1); put(key + '_rack', 'rq_ebikes', gateX + 1, Y0 + 1.2); put(key + '_ramp', 'rq_x_ramp', freeE + 1.2, Y1 - 16);
    XQ.push({ key, name, x0, x1, y0: Y0, y1: Y1, gate: [gateX + 4, FY], blocks });
    FORCE = null;
  }
  // 月湾嘉园 west of 槐北街: 18 x 18 point towers, cream render / terracotta accents
  compound('xqw', '月湾嘉园', 'ywjy', X0 + 1, 15, -7.5, [[[-39, 18, 11, 'hr_cream', false, 0], [-15, 18, 13, 'hr_terra', false, 0]], [[-39, 18, 16, 'hr_terra', true, 0], [-15, 18, 18, 'hr_cream', true, 5]]], 'rqe_e5_xqw');
  // 槐北名苑 east of 槐北街: 24 x 18 slab blocks, grey stone / white with charcoal strips
  compound('xqe', '槐北名苑', 'hbmy', 33, X1 - 1, 65.5, [[[35, 24, 12, 'hr_grey', false, 0], [64, 24, 14, 'hr_white', false, 0]], [[35, 24, 17, 'hr_white', true, 3], [64, 24, 15, 'hr_grey', true, 0]]], 'rqe_e5_xqe');
  // pocket plaza at the east end of the frontage (E5b continues east of x 100)
  FORCE = 'rqe_e5_ywl'; paint([92.4, 314, X1, 326.4], 'S'); pitTree(95, 317); pitTree(95, 323.4); pitTree(98.4, 320); bench(93, 319.6, 2); put('pp_bed', 'rq_x_bed', 96, 315.2, { variant: 'b' }); lamp(99.2, 314.8); put('pp_vend', 'p_vending', 93, 325); FORCE = null;

  // =====================================================================================================
  // 月湾北路 y 390..398 + the CBD (y 401..428): offices on plazas, 月湾天地 mall, tallest at the north edge
  // =====================================================================================================
  FORCE = 'rqe_e5_cbd';
  paint([X0, 388, X1, 390], 'S'); paint([X0, 390, X1, 398], null, road); paint([X0, 398, X1, 410], 'S');
  for (let x = X0 + 1; x < X1; x += 2) if (!inX(x, [[15, 33]])) { put(`ybl_curb_s${x}`, 'p_curb', x, 389.9); put(`ybl_curb_n${x}`, 'p_curb', x, 398.1); put(`ybl_edge_s${x}`, 'd_edge_line', x, 390.35); put(`ybl_edge_n${x}`, 'd_edge_line', x, 397.65); }
  for (let x = X0 + 1.5; x < X1; x += 3) if (!inX(x, [[13, 35]])) put(`ybl_dash_${x}`, 'd_center_dash', x, 394);
  for (const xm of [12, 38]) for (let k = 0; k < 8; k++) put(`ybl_zebra_${xm}_${k}`, 'd_stripe', xm, 390.55 + k, { rot: 2 });
  cars(X0 + 3, 8, 391.4, 2, 0.4); cars(42, X1 - 4, 391.4, 2, 0.4);
  put('ybl_bus_w', 'p_busstop', -20, 399.2); put('ybl_bus_e', 'p_busstop', 60, 399.2);
  const TY = 410.4;
  office('cbd_gj', -38, TY, 24, 18, 26, { skin: 'of_stone', logo: 'ywgj', name: '月湾国际', shops: ['mf_cafe', 'mf_book', 0, 0, 'mf_bake', 'mf_flower'].map((v) => v || null), lobby: [3, 4], wshops: ['mf_tea', 0, 0, 0, 0, 'mf_glass'] });
  office('cbd_kc', -9, TY, 18, 18, 22, { skin: 'of_dark', logo: 'hbkc', name: '槐北科创大厦', shops: ['mf_phone', 0, 0, 'mf_tea', 'mf_wear'].map((v) => v || null), lobby: [2, 3] });
  office('cbd_jr', 36, TY, 30, 18, 32, { skin: 'cw_blue', logo: 'ywjr', logoW: true, name: '月湾金融中心', shops: ['mf_cafe', 'mf_glass', 'mf_bake', 0, 0, 0, 0, 'mf_wear', 'mf_book', 'mf_flower'].map((v) => v || null), lobby: [3, 4, 5, 6] });
  office('cbd_td', 72, TY, 24, 18, 5, { kind: 'mall', skin: 'mall_a', logo: 'ywtd', name: '月湾天地', shops: ['mf_wear', 'mf_phone', 'mf_cafe', 0, 0, 'mf_tea', 'mf_bake', 'mf_glass'].map((v) => v || null), lobby: [3, 4], wshops: ['mf_book', 'mf_flower', 0, 0, 'mf_wear', 'mf_cafe'] });
  // plazas: paving, tree pits with benches, flower beds, lamps, bins, e-bike racks, parking ramps beside the towers
  for (let x = X0 + 3, i = 0; x < X1 - 2; x += 6.5, i++) { if (inX(x, [[13, 35]])) continue; pitTree(+x.toFixed(1), 401.6, keepR(STREET[i % 4])); }
  for (const x of [-32, -20, -4, 6, 42, 54, 62, 78, 90]) { put(`plz_bed_${x}`, 'rq_x_bed', x - 1.5, 405, { variant: pick(['a', 'b', 'c']) }); bench(x + 2, 405.3, 0); }
  for (const x of [-38.4, -12, 10, 35, 67, 71, 97]) lamp(x, 407.6);
  for (const x of [-26, 0, 50, 84]) { put(`plz_bin_${x}`, 'p_trashbin', x, 403.6); put(`plz_rack_${x}`, 'rq_ebikes', x + 1.8, 408.6); }
  put('cbd_ramp_gj', 'rq_x_ramp', -13.9, TY + 4); put('cbd_ramp_jr', 'rq_x_ramp', 67.3, TY + 4);
  // north edge: hedge + backdrop trees beyond the bound
  paint([X0, 428.4, X1, GY1], 'G');
  for (let x = X0 + 1; x < X1; x += 2) if (!inX(x, [[15, 33]])) put(`nedge_hedge_${x}`, 'p_hedge', x, BY1 - 0.6);
  for (let x = X0 + 2; x < X1; x += 5) if (!inX(x, [[14, 34]])) { tree(+(x + R() * 2).toFixed(1), 436 + R() * 3, pick(['willow', 'rong', 'willow', 'rong'])); if (R() < 0.6) tree(+(x + 2 + R()).toFixed(1), 446 + R() * 4, pick(['rong', 'kapok'])); }
  // the strips between the towers and behind them (service yards): planted
  for (const [a, b] of [[-14, -9], [9, 16], [32, 36], [66, 72], [96, X1]]) planted([a + 0.4, TY + 14.5, b - 0.4, 428], { beds: false, step: 1.8, shrubs: ['hy', 'gb', 'sj'] });
  for (const [a, b] of [[9, 16], [32, 36], [96, X1]]) planted([a + 0.4, TY + 0.4, b - 0.4, TY + 14.5], { beds: false, step: 1.8, shrubs: ['hy', 'gb', 'sj', 'dj'] });
  solid('cbd_north', [X0 + 0.2, 428.4, X1, BY1]);
  FORCE = null;

  // =====================================================================================================
  // E5b (Leo 17:29): east of 槐北名苑 to the map edge x 300 — 月湾汇 mall + parking, 月湾悦府 / 槐北佳苑 compounds,
  // 榕校路 north extension, east CBD; the temporary east seal is gone
  // =====================================================================================================
  const XE = 300, RX0 = 232, RX1 = 242;   // 榕校路 corridor (pavement 232..234, road 234..240, pavement 240..242)
  const SKIPR = [[RX0 - 1, RX1 + 1]];
  // ---- back yards behind the E2 row (x 100..232) + the strip either side of the 榕校路 stub becomes park ----
  FORCE = 'rqe_e5_ywle';
  paint([X1, 286, RX0, 300], 'K');
  for (let x = X1 + 3; x < RX0 - 2; x += 7) tree(+(x + R() * 1.5).toFixed(1), 289 + R(), pick(['rong', 'camphor', 'peach', 'kapok']));
  for (let x = X1 + 9; x < RX0 - 6; x += 23) put(`eyard_shed_${x}`, 'rq_x_shed', x, 287.2);
  cars(X1 + 2, RX0 - 4, 293.2, 2, 0.35);
  for (let x = X1 + 4; x < RX0 - 6; x += 9) planted([x, 297, x + 5, 299.6], { beds: false, step: 1.6, shrubs: ['hy', 'gb', 'sj'] });
  for (let x = X1 + 12; x < RX0 - 4; x += 26) { put(`eyard_bins_${x}`, 'p_bins', x, 296.6); put(`eyard_rack_${x}`, 'rq_ebikes', x + 4, 296.4); }
  planted([224.4, 272.4, RX0 - 0.2, 286], { beds: true, step: 1.8, shrubs: ['hy', 'gb', 'sj', 'dj'] }); tree(228, 276, 'rong'); tree(228, 283, 'kapok');
  // 榕溪北园 (x 242..300, y 272..300): lawn, trees, a cross path, benches and lamps (continues the riverside park to the south)
  paint([RX1, 272, XE, 300], 'G'); paint([RX1, 285, XE, 287], 'S'); paint([267, 272, 269, 300], 'S');
  planted([RX1 + 0.4, 272.4, 266.6, 284.6], { beds: true, step: 1.9, bedP: 0.15, skip: (x, y) => ((x - 254) ** 2 + (y - 278) ** 2 < 9) });
  planted([269.4, 272.4, XE - 0.6, 284.6], { beds: true, step: 1.9, bedP: 0.15, skip: (x, y) => ((x - 284) ** 2 + (y - 278) ** 2 < 9) });
  planted([RX1 + 0.4, 287.4, 266.6, 299.6], { beds: false, step: 1.9 }); planted([269.4, 287.4, XE - 0.6, 299.6], { beds: false, step: 1.9 });
  for (const [x, y, v] of [[254, 278, 'willow'], [284, 278, 'rong'], [248, 293, 'willow'], [260, 295, 'sakura'], [276, 293, 'rong'], [292, 295, 'flame']]) tree(x, y, v);
  bench(262, 286.6, 0); bench(274, 284.2, 4); lamp(266.2, 285.6); lamp(296, 287.6); put('rxbp_pav', 'rq_x_pavilion', 290, 279.6);
  // ---- 月湾路 east (y 302..310) with the 榕校路 junction ----
  paint([X1, 300, XE, 302], 'S'); paint([X1, 302, XE, 310], null, road); paint([X1, 310, XE, 314], 'S');
  for (let x = X1 + 1; x < XE; x += 2) if (!inX(x, SKIPR)) { put(`ywle_curb_s${x}`, 'p_curb', x, 301.9); put(`ywle_curb_n${x}`, 'p_curb', x, 310.1); put(`ywle_edge_s${x}`, 'd_edge_line', x, 302.35); put(`ywle_edge_n${x}`, 'd_edge_line', x, 309.65); }
  for (let x = X1 + 1.5; x < XE; x += 3) if (!inX(x, [[RX0 - 3, RX1 + 3]])) put(`ywle_dash_${x}`, 'd_center_dash', x, 306);
  for (const xm of [160, 228.6, 245.4]) for (let k = 0; k < 8; k++) put(`ywle_zebra_${xm}_${k}`, 'd_stripe', xm, 302.55 + k, { rot: 2 });
  cars(X1 + 4, 154, 303.4, 2, 0.45); cars(166, 224, 303.4, 2, 0.45); cars(250, XE - 4, 303.4, 2, 0.5);
  for (let x = X1 + 4; x < XE - 2; x += 9) if (!inX(x, [[157, 163], [194, 212], [226, 249], [256, 274]])) pitTree(+x.toFixed(1), 311.6, keepR(streetAt(x)));
  for (const x of [112, 139, 175, 211, 255, 290]) lamp(x, 300.8);
  put('ywle_bus_e', 'p_busstop', 186, 300.8); put('ywle_bus_w', 'p_busstop', 276, 313.0);
  // ---- 榕校路 north extension (y 286..456): carriageway, pavements, curbs, junctions with 月湾路 / 月湾北路 ----
  FORCE = 'rqe_e5_xqn';
  paint([RX0, 286, RX0 + 2, GY1], 'S'); paint([RX0 + 2, 286, RX1 - 2, GY1], null, road); paint([RX1 - 2, 286, RX1, GY1], 'S');
  paint([RX0, 302, RX1, 310], null, road); paint([RX0, 390, RX1, 398], null, road);
  for (let y = 287; y < GY1; y += 2) { if (inX(y, [[301, 311], [389, 399]])) continue; put(`rx_curb_w${y}`, 'p_curb', RX0 + 1.9, y, { rot: 2 }); put(`rx_curb_e${y}`, 'p_curb', RX1 - 1.9, y, { rot: 2 }); }
  for (let y = 287.5; y < GY1; y += 3) if (!inX(y, [[300, 312], [388, 400]])) put(`rx_dash_${y}`, 'd_center_dash', (RX0 + RX1) / 2, y, { rot: 2 });
  for (const ym of [313.6, 386.4]) for (let k = 0; k < 6; k++) put(`rx_zebra_${ym}_${k}`, 'd_stripe', RX0 + 2.5 + k, ym);
  for (let y = 318, i = 0; y < BY1; y += 12, i++) { if (inX(y, [[384, 402]])) continue; pitTree(RX0 + 1, y, STREET[i % 4]); }
  for (let y = 324; y < BY1; y += 24) lamp(RX1 - 0.8, y);
  cars(RX1 - 3.4, RX1 - 3.4, 330, 0, 0); for (let y = 336; y < 380; y += 5.4) if (R() > 0.4) put(`rx_pcar_${y}`, 'p_car', RX1 - 3.2, +y.toFixed(1), { rot: 0, state: 'normal', variant: R() < 0.15 ? 'red' : 'base' });
  FORCE = null;
  // ---- frontage: 商住楼 either side of the two new compound gates ----
  FORCE = 'rqe_e5_ywle';
  szl('sze3', 165, 'A'); szl('sze4', 181, 'A'); szl('sze5', 209, 'A');
  szl('sze6', 243, 'A', [7, 8]); szl('sze7', 271, 'A');
  paint([163, 326.4, RX0, 330], 'K'); paint([RX1, 326.4, XE, 330], 'K');
  for (const x of [168, 186, 212, 246, 274]) { put(`esvc_bins_${x}`, 'p_bins', x, 327.4); put(`esvc_rack_${x}`, 'rq_ebikes', x + 4.5, 327.2); }
  // pocket plazas at the corners of 榕校路 and the map edge
  paint([224.4, 314, RX0, 326.4], 'S'); pitTree(227.6, 317.4); pitTree(227.6, 323.4); bench(225, 320.2, 2); lamp(230.6, 314.8);
  paint([286.4, 314, XE, 326.4], 'S'); pitTree(290, 317.4); pitTree(296, 317.4); pitTree(293, 323.4); bench(288, 320.6, 2); put('epp_vend', 'p_vending', 297.6, 325); put('epp_bed', 'rq_x_bed', 290.4, 324.2, { variant: 'a' });
  FORCE = null;
  // ---- 月湾汇: 5F mall on 月湾路 east with a surface car park + garage ramp behind it ----
  FORCE = 'rqe_e5_mall';
  paint([X1, 314, 163, 316.4], 'S'); paint([X1, 316.4, 103, 388], 'S'); paint([157, 316.4, 163, 352.4], 'S');
  // 月湾汇 (E5b review: no empty flat deck, more mall character): a 3F podium with glass atria, poster bays and three entrance
  // canopies; a 2F glass block set back on it (skylit roof, solar, HVAC); the rest of the podium roof is a parking deck reached
  // by a ramp along the east side, four badminton courts, a kids' play deck and a roof garden / terrace cafe on the street side
  const MX = 103, MY = 316.4, MW = 54, MD = 36, MZ = 9, UB = [6, 4.5, 30, 22.5];     // podium; setback block (relative x0, y0, x1, y1)
  const mallWall = (f, b, side) => {
    if (side === 'S') { if ([2, 3, 8, 9, 14, 15].includes(b)) return 'cw_blue'; if (f === 2 && (b === 4 || b === 5)) return b === 4 ? 'mall_ad1' : 'mall_ad2'; if (f === 3 && (b === 11 || b === 12)) return b === 11 ? 'mall_ad3' : 'mall_ad4'; return 'mall_a'; }
    if (b === 1 || b === 2) return 'cw_blue'; if (f === 2 && (b === 5 || b === 6)) return b === 6 ? 'mall_ad1' : 'mall_ad2'; return 'mall_a';
  };
  const mallRoof = (fg) => {
    const RP = { z: MZ, fade_group: fg };
    roof('e_mall', fg, MX, MY, MW, MD, MZ, { gapE: [MY + 31.5, MY + MD], tile: (rx, ry) => {
      if (rx >= UB[0] && rx < UB[2] && ry >= UB[1] && ry < UB[3]) return false;
      if (ry === 0) return rx <= 24 ? ['rq_m3_dtile', 'lawn'] : ['rq_m3_dtile', 'deck'];
      if (rx === 0) return ['rq_m3_dtile', ry <= 18 ? 'play' : 'lawn'];
      if (rx < 30) return ry === 22.5 ? ['rq_e5_deck', 'court_s'] : ry === 27 ? ['rq_e5_deck', 'court_n'] : ['rq_m3_dtile', 'deck'];
      return ['rq_e5_deck', [9, 18, 27].includes(ry) ? 'park' : 'aisle'];
    } });
    // parking deck: cars nose-in on the bay rows (rot 0 = along y), a few empty bays
    for (const ry of [9, 18, 27]) for (let rx = 30; rx < MW; rx += 6) for (const bx of [1.65, 4.35]) if (R() > 0.22) put(`mroof_car_${rx}_${ry}_${bx}`, 'p_car', MX + rx + bx, MY + ry + 2.4, Object.assign({ rot: 0, state: 'normal', variant: R() < 0.15 ? 'red' : 'base' }, { z: MZ + 0.08 }));   // no fade group (one fade group sorts by facade layer, which put the deck tiles over the cars); just above the tiles
    // kids' deck, courts, garden / terrace
    put('mroof_play', 'rq_x_play', MX + 1.5, MY + 7.5, RP); put('mroof_play2', 'rq_x_play', MX + 1.5, MY + 14.5, RP);
    for (const y of [MY + 26, MY + 30]) put(`mroof_tb_w${y}`, 'rq_m3_kit', MX + 1.2, y, Object.assign({ variant: 'tbox' }, RP));
    for (const y of [MY + 26, MY + 30]) put(`mroof_tr_w${y}`, 'rq_x_tree', MX + 1.9, y + 0.7, { z: MZ + 0.6, fade_group: fg, variant: 'kapok' });
    for (let x = MX + 7; x < MX + 30; x += 6) { put(`mroof_perg_${x}`, 'rq_m3_kit', x + 1, MY + 32.2, Object.assign({ variant: 'perg' }, RP)); }
    for (let x = MX + 2; x < MX + 28; x += 5) { put(`mroof_tb_s${x}`, 'rq_m3_kit', x, MY + 1.6, Object.assign({ variant: 'tbox' }, RP)); put(`mroof_tr_s${x}`, 'rq_x_tree', x + 0.7, MY + 2.3, { z: MZ + 0.6, fade_group: fg, variant: pick(['flame', 'kapok', 'rong']) }); }
    for (let x = MX + 31; x < MX + MW - 2; x += 4.5) put(`mroof_umb_${x}`, 'rq_m3_kit', x, MY + 1.0, Object.assign({ variant: 'umb' }, RP));
    for (let rx = 6; rx < 30; rx += 6) put(`mroof_net_${rx}`, 'rq_e5_net', MX + rx, MY + 27, RP);
    put('mroof_ac1', 'rq_m3_kit', MX + 0.8, MY + 19.2, Object.assign({ variant: 'ac' }, RP));
    // setback block: two glass floors over the atrium, skylights + solar + HVAC on top
    const bx0 = MX + UB[0], by0 = MY + UB[1], bw = UB[2] - UB[0], bd = UB[3] - UB[1];
    for (let f = 1; f <= 2; f++) { const z = MZ + (f - 1) * 3;
      for (let b = 0; b < bw / 3; b++) put(`e_mall_U_S${f}_${b}`, 'f_wall', bx0 + b * 3, by0, { z, state: 'upper', fade_group: fg, variant: 'cw_blue' });
      for (let b = 0; b < bd / 3; b++) put(`e_mall_U_W${f}_${b}`, 'f_wall', bx0, by0 + 3 + b * 3, { z, rot: 6, state: 'upper', fade_group: fg, variant: b === 2 || b === 3 ? 'cw_blue' : 'mall_a' }); }
    roof('e_mall_up', fg, bx0, by0, bw, bd, MZ + 6, { tile: (rx, ry) => (ry === 4.5 || ry === 9) && rx >= 6 && rx <= 12 ? ['rq_e5_sky', null] : null,
      kit: [['solar', 1.2, 1.0], ['solar', 19.2, 1.0], ['solar', 1.2, 14.2], ['solar', 19.2, 14.2], ['ac', 1.4, 6.0], ['ac', 19.4, 6.0], ['vent', 19.4, 10.0], ['mach', 1.2, 10.2]] });
    // ramp up along the east side (rises north), landing at the deck's NE aisle
    for (let k = 0; k < 4; k++) put(`mall_rampup${k}`, 'rq_e5_ramp', MX + MW + 0.4, MY + 7.5 + k * 6, { z: k * 2.25, variant: 'up', fade_group: fg });
    put('mall_rampland', 'rq_e5_ramp', MX + MW + 0.4, MY + 31.5, { z: MZ, variant: 'land', fade_group: fg });
    solid('mall_ramp', [MX + MW + 0.2, MY + 7.3, MX + MW + 4.6, MY + MD]);
  };
  office('e_mall', MX, MY, MW, MD, 3, { kind: 'mall', skin: 'mall_a', logo: 'ywh', name: '月湾汇', desc: '5层购物中心（3层裙楼+2层玻璃退台）· 屋顶停车场、羽毛球场、儿童乐园与空中花园，后面是地面停车场 · 南侧雨棚可进室内（1F中庭 / 2F零售 / 3F美食广场）',
    wall: mallWall, roofFn: mallRoof, canopies: [6, 42],
    shops: ['mf_wear', 'mf_cafe', 0, 0, 'mf_bake', 'mf_glass', 'mf_book', 'mf_flower', 0, 0, 'mf_wear', 'mf_cafe', 'mf_tea', 'mf_phone', 0, 0, 'mf_book', 'mf_flower'].map((v) => v || 'mall_a'),
    lobby: [8, 9], wshops: ['mf_cafe', 'mf_flower', 'mf_tea', 0, 0, 0, 0, 0, 0, 'mf_book', 'mf_bake', 'mf_wear'] });
  const mallDoorX = MX + 8 * 3 + 1.5, mallReachY = MY - 1.7;
  for (const [tag, x] of [['main', mallDoorX], ['w', MX + 6 + 1.5], ['e', MX + 42 + 1.5]]) {
    put('ywh_entry_' + tag, 'modern_entry_marker', x, MY - 0.85, { interact: 'portal', to: 'ywh_l1', label: '进入月湾汇 · 1F 中庭', name: '月湾汇', reach: [x, mallReachY], spawn: [9.2, 1.7, 'N'] });
  }
  Object.assign(MALLS[MALLS.length - 1], { setback: { x0: MX + UB[0], y0: MY + UB[1], W: UB[2] - UB[0], D: UB[3] - UB[1], F: 2, z0: MZ }, rampGap: 1, roofUse: ['parking', 'badminton', 'kids', 'garden', 'terrace'], entry: [mallDoorX, mallReachY] });
  for (const x of [106, 118, 142, 154]) { put(`mall_bed_${x}`, 'rq_x_bed', x - 1.5, 314.6, { variant: pick(['a', 'b', 'c']) }); }
  for (const y of [322, 334, 346]) { pitTree(100.4, y, 'flame'); pitTree(162.6, y, 'kapok'); }
  lamp(101.2, 328); lamp(162.8, 340.6); put('mall_rack_w', 'rq_ebikes', 101.0, 352.6); put('mall_bin_e', 'p_trashbin', 161.8, 316.8);
  // car park y 352.4..388: two double rows, a tree strip, a ramp down to the basement, a pay booth
  paint([103, 352.4, 162.6, 388], 'K');
  cars(106, 152, 356.0, 2, 0.25); cars(106, 152, 361.6, 2, 0.3); cars(106, 152, 372.4, 2, 0.3); cars(106, 152, 378.0, 2, 0.35);
  planted([104, 365.6, 152, 368.4], { beds: false, step: 1.8, shrubs: ['hy', 'gb', 'sj'] }); for (let x = 106; x < 152; x += 8) tree(x, 367, pick(['rong', 'kapok']));
  put('mall_ramp', 'rq_x_ramp', 155.4, 356); put('mall_booth', 'rq_x_shed', 154.4, 381.4); lamp(104, 384); lamp(130, 384); put('mall_bins', 'p_bins', 158, 385.6);
  FORCE = null;
  // ---- compounds ----
  compound('xqm', '月湾悦府', 'ywyf', 164, RX0 - 1, 197.5, [[[166, 24, 13, 'hr_white', false, 0], [194, 24, 15, 'hr_terra', false, 0]], [[166, 24, 17, 'hr_grey', true, 3], [194, 24, 18, 'hr_cream', true, 0]]], 'rqe_e5_xqm');
  compound('xqn', '槐北佳苑', 'hbjy', RX1 + 1, XE - 1, 259.5, [[[245, 18, 11, 'hr_cream', false, 0], [267, 18, 12, 'hr_grey', false, 0]], [[245, 18, 16, 'hr_white', true, 0], [267, 18, 15, 'hr_terra', true, 4]]], 'rqe_e5_xqn');
  // ---- 月湾北路 east + the east CBD (tallest still on the north edge) ----
  FORCE = 'rqe_e5_cbde';
  paint([X1, 388, XE, 390], 'S'); paint([X1, 390, XE, 398], null, road); paint([X1, 398, XE, 410], 'S');
  for (let x = X1 + 1; x < XE; x += 2) if (!inX(x, SKIPR)) { put(`ybe_curb_s${x}`, 'p_curb', x, 389.9); put(`ybe_curb_n${x}`, 'p_curb', x, 398.1); put(`ybe_edge_s${x}`, 'd_edge_line', x, 390.35); put(`ybe_edge_n${x}`, 'd_edge_line', x, 397.65); }
  for (let x = X1 + 1.5; x < XE; x += 3) if (!inX(x, [[RX0 - 3, RX1 + 3]])) put(`ybe_dash_${x}`, 'd_center_dash', x, 394);
  for (const xm of [160, 228.6, 245.4]) for (let k = 0; k < 8; k++) put(`ybe_zebra_${xm}_${k}`, 'd_stripe', xm, 390.55 + k, { rot: 2 });
  cars(X1 + 4, 154, 391.4, 2, 0.4); cars(166, 224, 391.4, 2, 0.45); cars(250, XE - 4, 391.4, 2, 0.5);
  put('ybe_bus_w', 'p_busstop', 120, 399.2); put('ybe_bus_e', 'p_busstop', 200, 399.2);
  office('e_zx', 104, TY, 24, 18, 24, { skin: 'cw_silver', logo: 'ywzx', name: '月湾中心', desc: '24层写字楼 · 月湾北路东段 · 南侧大堂可进，电梯到 12F 样板办公层', shops: ['mf_cafe', 'mf_book', 0, 0, 'mf_tea', 'mf_flower', 'mf_bake', 'mf_glass'].map((v) => v || null), lobby: [3, 4], wshops: ['mf_phone', 0, 0, 0, 0, 'mf_cafe'] });
  const zxDoorX = 104 + 3 * 3 + 1.5, zxReachY = TY - 1.7;
  put('ywz_entry', 'modern_entry_marker', zxDoorX, TY - 0.9, { interact: 'portal', to: 'ywz_lobby', label: '进入月湾中心 · 写字楼大堂', name: '月湾中心', reach: [zxDoorX, zxReachY], spawn: [8.2, 1.55, 'N'] });
  OFFICES[OFFICES.length - 1].entry = [zxDoorX, zxReachY];
  office('e_sw', 134, TY, 30, 18, 28, { skin: 'cw_bronze', logo: 'ywsw', name: '月湾商务广场', desc: '28层写字楼 · 月湾北路东段', shops: ['mf_bake', 'mf_cafe', 'mf_wear', 0, 0, 0, 0, 'mf_tea', 'mf_phone', 'mf_book'].map((v) => v || null), lobby: [3, 4, 5, 6] });
  office('e_jd', 170, TY, 24, 18, 20, { skin: 'of_stone', logo: 'ywjd', name: '月湾酒店', kind: 'office', desc: '20层酒店 · 月湾北路东段', shops: ['mf_flower', 'mf_cafe', 0, 0, 'mf_tea', 'mf_bake', 'mf_glass', 'mf_wear'].map((v) => v || null), lobby: [3, 4] });
  office('e_kj', 246, TY, 24, 18, 22, { skin: 'of_dark', logo: 'rxkj', name: '榕溪科技大厦', desc: '22层写字楼 · 榕校路与月湾北路路口', shops: ['mf_phone', 'mf_cafe', 0, 0, 'mf_tea', 'mf_book', 'mf_bake', 'mf_wear'].map((v) => v || null), lobby: [3, 4], wshops: ['mf_tea', 0, 0, 0, 0, 'mf_glass'] });
  // plaza strip, the pocket park 月湾北园 (x 196..231) and the corner green east of 榕溪科技大厦
  for (let x = X1 + 3, i = 0; x < XE - 2; x += 6.5, i++) { if (inX(x, [[RX0 - 2, RX1 + 2]])) continue; pitTree(+x.toFixed(1), 401.6, keepR(STREET[i % 4])); }
  for (const x of [110, 122, 140, 156, 176, 188, 252, 264]) { put(`eplz_bed_${x}`, 'rq_x_bed', x - 1.5, 405, { variant: pick(['a', 'b', 'c']) }); bench(x + 2, 405.3, 0); }
  for (const x of [103.4, 129, 165, 197, 245, 271]) lamp(x, 407.6);
  for (const x of [116, 150, 182, 258]) { put(`eplz_bin_${x}`, 'p_trashbin', x, 403.6); put(`eplz_rack_${x}`, 'rq_ebikes', x + 1.8, 408.6); }
  put('cbd_ramp_sw', 'rq_x_ramp', 128.9, TY + 4); put('cbd_ramp_jd', 'rq_x_ramp', 164.9, TY + 4);
  paint([196, 410, RX0, 428.4], 'S');
  planted([196.4, 410.4, 230.6, 428], { beds: true, step: 1.8, bedP: 0.25, shrubs: ['hy', 'gb', 'sj', 'dj', 'hs'], skip: (x, y) => Math.abs(y - 419) < 1.4 || Math.abs(x - 213) < 1.4 || ((x - 222) ** 2 + (y - 413.6) ** 2 < 14) });
  put('ybp_pav', 'rq_x_pavilion', 220, 411.6); for (const [x, y, v] of [[200, 414, 'willow'], [206, 425, 'rong'], [226, 425, 'willow'], [200, 424, 'sakura']]) tree(x, y, v);
  bench(208, 417.6, 0); bench(217, 420.4, 4); lamp(212.4, 418); lamp(197, 427);
  for (const [a, b] of [[128, 134], [164, 170], [194, 196], [270, 299.6]]) planted([a + 0.4, TY + 14.5, b - 0.4, 428], { beds: false, step: 1.8, shrubs: ['hy', 'gb', 'sj'] });
  planted([270.4, TY + 0.4, 299.2, TY + 14.5], { beds: true, step: 1.8, shrubs: ['hy', 'gb', 'sj', 'dj'], skip: (x, y) => ((x - 285) ** 2 + (y - (TY + 7)) ** 2 < 12) }); tree(285, TY + 7, 'rong');
  paint([X1, 428.4, XE, GY1], 'G');
  for (let x = X1 + 1; x < XE; x += 2) if (!inX(x, SKIPR)) put(`nedge_hedge_e${x}`, 'p_hedge', x, BY1 - 0.6);
  for (let x = X1 + 2; x < XE; x += 5) if (!inX(x, [[RX0 - 1, RX1 + 1]])) { tree(+(x + R() * 2).toFixed(1), 436 + R() * 3, pick(['willow', 'rong', 'willow', 'rong'])); if (R() < 0.6) tree(+(x + 2 + R()).toFixed(1), 446 + R() * 4, pick(['rong', 'kapok'])); }
  solid('cbd_north_e', [X1, 428.4, RX0, BY1]); solid('cbd_north_e2', [RX1, 428.4, XE - 0.2, BY1]); solid('eedge', [XE - 0.2, 272, XE + 0.4, 428.4]);
  FORCE = null;

  // =====================================================================================================
  // backdrop: west of the district (x < -42); beyond the east map edge (x > 300)
  // =====================================================================================================
  FORCE = 'rqe_e5_bg';
  paint([GX0, 286, X0, GY1], 'G'); paint([300, 272, GX1, GY1], 'G');
  for (let y = 274; y < BY1; y += 2) put(`wedge_hedge_${y}`, 'p_hedge', X0 + 0.6, y, { rot: 6 });
  // west: the E3 background row (y 274.68..287) stays; a strip south of it and the block north of it close the backdrop
  solid('west_s', [-106, 272, X0 + 0.2, 274.6]); solid('west', [-106, 287.1, X0 + 0.2, BY1]); solid('west_gap', [-64.9, 274.6, X0 + 0.2, 287.1]);
  for (let x = GX0 + 4; x < X0 - 2; x += 6) for (let y = 290; y < GY1 - 2; y += 7) if (R() < 0.75) tree(+(x + R() * 2).toFixed(1), +(y + R() * 3).toFixed(1), pick(['willow', 'rong', 'camphor', 'rong']));
  for (let x = 304; x < GX1 - 2; x += 6) for (let y = 276; y < GY1 - 2; y += 7) if (R() < 0.7) tree(+(x + R() * 2).toFixed(1), +(y + R() * 3).toFixed(1), pick(['willow', 'rong', 'camphor', 'rong']));
  FORCE = null;

  // ---- register ----
  for (const r of solids) N.solids.push(r);
  N.expansionE5 = { phase: 'E5b', bounds: { y1: BY1 }, ground: { y1: GY1 }, district: '月湾新区', rect: [X0, 286, X1, BY1], solids: solids.length,
    names: { street: '月湾路', cbdStreet: '月湾北路', road: '榕校路', compounds: XQ.map((q) => q.name), offices: OFFICES.map((o) => o.name), malls: MALLS.map((m) => m.name), park: '榕溪北园', pocketPark: '月湾北园' },
    transition: { old: BUILT.filter((b) => /^rqe_e2_nbg/.test(b.id)).map((b) => b.id), frontage: SZL, residential: HRES, offices: OFFICES.map((o) => o.id), malls: MALLS.map((m) => m.id), compounds: XQ },
    /* see-through zones: inside a compound, on the CBD plazas and in the 月湾汇 car park the see-through circle around the
       player grows (js/rongqiao_e5_reveal.js), so the gardens / plazas behind the 15-18F rows stay readable */
    reveal: XQ.map((q) => [q.x0, q.y0, q.x1, q.y1]).concat([[X0, 398, 300, 428.4], [100, 352.4, 163, 388]]),
    unconfirmed: true };
  // map POIs: one per gated compound at its gate (the phone map derives offices / malls from N.modernBuildings itself)
  N.mapPois = (N.mapPois || []).concat(XQ.map((q) => ({ id: 'compound_e5_' + q.key, name: q.name, x: q.gate[0], y: q.gate[1] - 1.2, desc: '门禁小区 · ' + q.blocks.length + ' 栋高层 · 大门门岗与道闸 · 月湾路', cat: 'home' })));
  D.colliders = D.colliders.concat(colliders);
  window.SCENE_CHUNKS = window.SCENE_CHUNKS || {};
  const TAIL = (window.RONGQIAO_TAIL_CHUNKS = window.RONGQIAO_TAIL_CHUNKS || []), src = 'rongqiao_expand_e5.js';
  for (const [id, name, rect] of CH) { window.SCENE_CHUNKS[id] = { objects: lists[id], colliders: [] }; TAIL.push({ id, name, rect, src, load_m: 40, unload_m: 80 }); }
})();
