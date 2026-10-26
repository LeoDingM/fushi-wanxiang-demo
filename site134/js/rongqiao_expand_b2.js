/* B2 城中村西缘 (2026-10-24). The P9 slab west of x -106, south of y 141, was backdrop so the
 * E3 forged points (-118, 0) and (-110, -30) stayed illegal. This opens that band as streets:
 * 万家桥路 continues south to 南关路, 西横巷 crosses it, and two columns of 4–8F kit blocks
 * (e80 warm brick, mixed shop signs) replace the old bgw row that sat in the roadway.
 * Saves: chunk list still appends (after P9). A position is legal when it is inside bounds and
 * not inside a solid — those two points are streets now; building interiors and x < -160 stay rejected.
 * 万家桥路 gets a static shelter pair. The live bus lines stay two stops each (a third stop drops the line).
 * Names and the lane width 未经Leo确认. No open interiors. 月河区 is not built here. */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, V = window.RONGQIAO_VARIETY;
  if (!D || !N || !V || !D.rongqiaoExpandP9 || D.rongqiaoExpandB2) return;
  D.rongqiaoExpandB2 = 1;
  const G = D.ground, root = window;
  const same = (r, a) => r && Math.abs(r[0] - a[0]) < 0.25 && Math.abs(r[1] - a[1]) < 0.25 && Math.abs(r[2] - a[2]) < 0.25 && Math.abs(r[3] - a[3]) < 0.25;
  const BGW = [];
  for (let y = -10; y < 132; y += 13) BGW.push([-124, y, -112, y + 9]);
  const WEDGE = [-107.4, -80, -106.4, 141.6], CLOSED = [-180, -80, -106.2, 141.15];
  const goneRect = (r) => same(r, WEDGE) || same(r, CLOSED) || BGW.some((g) => same(r, g));
  N.solids = (N.solids || []).filter((r) => !goneRect(r));
  D.colliders = (D.colliders || []).filter((c) => c.id !== 'rqe_p9_closed_w' && c.id !== 'rqe3_wedge' && !/^rqe_e3_bgw/.test(c.id || '') && !goneRect(c.rect));
  if (N.buildings) N.buildings = N.buildings.filter((b) => !/^rqe_e3_bgw/.test(b.id));
  const PLANT = new Set(['rq_x_shrub', 'rq_x_bed', 'rq_x_tree', 'p_tree', 'rq_x_bamboo']);
  const kill = (o) => /^rqe_e3_bgw/.test(o.fade_group || '') || /^rqe3_wedge_hedge_/.test(o.id || '')
    || (PLANT.has(o.type) && o.x < -106.15 && o.x > -161 && o.y > -70 && o.y < 141)
    || (/^rqe3_car_/.test(o.id || '') && o.x < -104 && o.x > -130 && o.y < -58 && o.y > -78);
  for (const ch of Object.values(root.SCENE_CHUNKS || {})) if (ch && ch.objects) ch.objects = ch.objects.filter((o) => !kill(o));
  function paint(rect, tile, fn) {
    const [ox, oy] = G.origin, ch = G.chunk;
    const c0 = Math.max(0, Math.floor((rect[0] - ox) / ch)), c1 = Math.min(G.cols, Math.ceil((rect[2] - ox) / ch));
    const r0 = Math.max(0, Math.floor((rect[1] - oy) / ch)), r1 = Math.min(G.rows, Math.ceil((rect[3] - oy) / ch));
    for (let r = r0; r < r1; r++) {
      const a = G.data_south_to_north[r].split('');
      for (let c = c0; c < c1; c++) {
        const x = ox + (c + 0.5) * ch, y = oy + (r + 0.5) * ch;
        if (x >= rect[0] && x < rect[2] && y >= rect[1] && y < rect[3]) { const t = fn ? fn(x, y, a[c]) : tile; if (t) a[c] = t; }
      }
      G.data_south_to_north[r] = a.join('');
    }
  }
  const road = (x, y) => ((Math.round(x * 3 + y) % 5) === 0 ? 'B' : 'A');
  // 南关路 west of the old ground edge, then the lane, then the avenues repaint their crossings.
  paint([-160, -80, -128, -76], 'S');
  paint([-160, -76, -128, -64], null, road);
  paint([-160, -64, -128, -56], 'S');
  paint([-160, -10, -128, -6], 'S');
  paint([-160, -6, -128, 0], null, road);
  paint([-160, 0, -128, 4], 'S');
  paint([-124, -64, -118, 143], 'S');
  paint([-118, -64, -112, 143], null, road);
  paint([-112, -64, -106, 143], 'S');
  paint([-160.2, -56, -156.15, 132], 'S');
  paint([-144.15, -56, -139.85, 132], 'S');
  paint([-128.15, -56, -124, 132], 'S');
  const ALLEYS = [[-47.15, -43.15], [-33.7, -26.3], [-16.8, -10], [17.15, 19.85], [29.15, 35.7]];
  for (let k = 0; k < 8; k++) ALLEYS.push([36 + k * 12 + 9.15, 36 + k * 12 + 11.85]);
  for (const [y0, y1] of ALLEYS) { paint([-160, y0, -124, y1], 'S'); paint([-112, y0, -106, y1], 'S'); }
  paint([-160, -33.7, -106, -26.3], 'S');
  paint([-160, -80, -106, -76], 'S');
  paint([-160, -76, -106, -64], null, road);
  paint([-160, -64, -106, -56], 'S');
  paint([-160, -10, -106, -6], 'S');
  paint([-160, -6, -106, 0], null, road);
  paint([-160, 0, -106, 4], 'S');
  const CH = [['rqe_b2_s', '南关西·万家西巷', [-180, -80, -106, 36]], ['rqe_b2_n', '城中村西缘', [-180, 36, -106, 142]]];
  const lists = { rqe_b2_s: [], rqe_b2_n: [] };
  const chunkOf = (y) => (y < 36 ? 'rqe_b2_s' : 'rqe_b2_n');
  const used = new Set();
  const uid = (s) => { let k = s, n = 1; while (used.has(k)) k = s + '_' + n++; used.add(k); return k; };
  let force = null;
  const put = (id, type, x, y, more) => lists[force || chunkOf(y)].push(Object.assign({ id: uid('rqb2_' + id), type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqe_b2_margin', [-180, -80, -160.35, 141.15]);
  for (let y = -78; y < 140; y += 2) put('hedge_' + y, 'p_hedge', -160.55, y, { rot: 6 });
  const SHOPS = [['s', 'window', 'ly'], ['e', 'noodle', 'mn'], ['s', 'door', 'wj'], ['e', 'kuaican', 'cf'], ['s', 'window', 'sg'], ['s', 'door', 'lf'], ['e', 'tea', 'ts'], ['s', 'window', 'xs'], ['s', 'door', 'bl'], ['s', 'window', 'zy'], ['e', 'tea', 'cy'], ['s', 'window', 'yj'], ['s', 'door', 'gx']];
  let shopK = 1, seed = 20261024;
  const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const nextShop = () => SHOPS[shopK++ % SHOPS.length];
  const BUILT = N.buildings || (N.buildings = []);
  const BRICK = ['base', 'w1', 'w2', 'm_brick2', 'm_stain'];
  function bld(id, x0, y0, o) {
    force = chunkOf(y0 + 4);
    const fg = 'rqe_b2_' + id;
    const S = V.style(fg, 'b2_cv', 6, { range: [4, 8], size: 'b', bays: 4, era: 'e80', mats: BRICK });
    const W = 12, Dp = 9, nS = 4, nW = 3, F = S.F, door = 2;
    const shops = o.shops || {}, wshops = o.wshops || {};
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = 0; b < nS; b++) {
        const x = x0 + b * 3, k = id + '_S' + f + '_' + b;
        if (f === 1 && shops[b]) {
          const [kind, state, sign] = shops[b];
          put(k + '_shop', kind === 'e' ? 'f_eatery' : 'f_shop', x, y0, { z, state, fade_group: fg });
          if (sign) put(k + '_sign', 'rq_x_sign_s', x, y0, { z: 2.42, variant: sign, fade_group: fg });
          continue;
        }
        put(k + '_wall', 'f_wall', x, y0, { z, state: st, fade_group: fg, variant: S.mat });
        if (f === 1 && b === door) put(k + '_door', 'f_door', x, y0, { z, state: 'closed', fade_group: fg });
        else if (f === 1) put(k + '_win', 'f_window', x, y0, { z, state: 'intact', fade_group: fg, night_lit: R() < 0.5, variant: S.win[b % S.win.length] });
        else {
          const u = V.unit(S, f, b, 0.5, 'S');
          if (u.kind === 'balc') put(k + '_balc', 'f_balcony', x, y0, { z, state: u.state, fade_group: fg, variant: u.variant });
          else put(k + '_win', 'f_window', x, y0, { z, state: 'intact', fade_group: fg, night_lit: u.reno || R() < 0.55, variant: u.variant });
        }
        if (f > 1 && R() < 0.28) put(k + '_ac', 'f_ac', x + 2.4, y0, { z: z + 0.5, fade_group: fg, variant: V.acVariant(S) });
      }
      for (let b = 0; b < nW; b++) {
        const y = y0 + 3 + b * 3, k = id + '_W' + f + '_' + b;
        if (f === 1 && wshops[b]) {
          const [kind, state, sign] = wshops[b];
          put(k + '_shop', kind === 'e' ? 'f_eatery' : 'f_shop', x0, y, { z, rot: 6, state, fade_group: fg });
          if (sign) put(k + '_sign', 'rq_x_sign_w', x0, y - 3, { z: 2.42, variant: sign, fade_group: fg });
          continue;
        }
        put(k + '_wall', 'f_wall', x0, y, { z, rot: 6, state: st, fade_group: fg, variant: S.mat });
        const u = f > 1 ? V.unit(S, f, nS + b, 0, 'W') : { variant: S.win[(b + 1) % S.win.length] };
        put(k + '_win', 'f_window', x0, y, { z, rot: 6, state: 'intact', fade_group: fg, night_lit: u.reno || R() < 0.45, variant: u.variant });
        if (f > 1 && R() < 0.16) put(k + '_ac', 'f_ac', x0, y - 0.6, { z: z + 0.5, rot: 6, fade_group: fg, variant: V.acVariant(S) });
      }
    }
    if (F > 2) put(id + '_pipe', 'f_pipe', x0 + W - 0.4, y0, { fade_group: fg });
    put(id + '_roof', 'b_roof_b', x0, y0, { z: F * 3, fade_group: fg, variant: V.tile(S.roof === 'c' ? 'base' : S.roof, 'b_roof_b', fg) });
    block(fg, [x0 - 0.32, y0 - 0.32, x0 + W, y0 + Dp]);
    BUILT.push({ id: fg, fam: 'b2_cv', x0, y0, W, D: Dp, F, mat: S.mat, roof: 'b_roof_b/' + S.roof, modern: false });
    force = null;
  }
  const face = () => ({ 0: nextShop(), 1: nextShop(), 3: nextShop() });
  const ROWS = [-56, -43, -25.6, 8, 20, 36, 48, 60, 72, 84, 96, 108, 120];
  const COLS = [-156, -140];
  ROWS.forEach((y0, i) => COLS.forEach((x0, c) => {
    bld('h' + i + '_' + c, x0, y0, { shops: face(), wshops: (i + c) % 2 ? { 1: nextShop() } : { 0: nextShop(), 2: nextShop() } });
  }));
  const STREET = ['rong', 'kapok', 'flame', 'camphor'];
  const tree = (x, y, i) => put('t_' + x + '_' + y, 'rq_x_tree', x, y, { variant: STREET[((i % 4) + 4) % 4] });
  let ti = 0;
  for (let y = -50; y < 130; y += 9) {
    if (y > -36 && y < -24) continue;
    if (y > -8 && y < 6) continue;
    tree(-121.6, y, ti); tree(-109.2, y + 4, ti + 2); ti++;
  }
  for (let y = -48; y < 128; y += 18) put('lamp_w_' + y, 'p_lamp', -120.2, y, { interact: 'lamp' });
  for (let y = -40; y < 128; y += 18) put('lamp_e_' + y, 'p_lamp', -108.4, y, { interact: 'lamp' });
  for (const y of [-45, -30, 18, 46, 70, 94, 118]) { put('lan_' + y, 'rq_x_lantern', -142.1, y); put('bin_' + y, 'p_trashbin', -126.2, y + 0.6); }
  for (let x = -154, i = 0; x < -132; x += 10, i++) tree(x, -62.2, i + 1);
  // static pair on the south bank of 万家桥路 (live lines are two stops each; a third stop removes the line)
  const p9 = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p9_w;
  if (p9) {
    p9.objects.push(
      { id: 'rqb2_bus_w', type: 'p_busstop', x: -122.2, y: 158, name: '万家桥路公交站' },
      { id: 'rqb2_bus_e', type: 'p_busstop', x: -109.2, y: 166, name: '万家桥路公交站' },
      { id: 'rqb2_sign_w', type: 'rq_x_busstop', x: -120.15, y: 158.15, variant: 'wjq', name: '万家桥路站牌' },
      { id: 'rqb2_sign_e', type: 'rq_x_busstop', x: -111.15, y: 166.15, variant: 'wjq', name: '万家桥路站牌' }
    );
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  const info = {
    phase: 'B2', unconfirmed: true,
    names: { lane: '万家桥路', cross: '西横巷', village: '万家城中村西缘', bus: '万家桥路公交站' },
    lane: [-124, -56, -106, 272],
    cross: [-160, -33.7, -106, -26.3],
    village: [-160, -56, -124, 132],
    bus: { live: false, shelters: [[-122.2, 158], [-109.2, 166]] },
    opened: [[-118, 0], [-110, -30]],
    margin: [-180, -80, -160.35, 141.15],
  };
  N.expansionB2 = info;
  if (N.expansionP9) N.expansionP9.closed = info.margin.slice();
  N.mapPois = (N.mapPois || []).concat([
    { id: 'b2_lane', name: '万家桥路', x: -121.5, y: 70, desc: '城中村西缘的窄路，向北过万家桥。名字未经确认', cat: 'life' },
    { id: 'b2_bus_w', name: '万家桥路公交站', x: -122.2, y: 155.2, desc: '西侧候车亭和站牌，可站。还没接入井槐里线或南关路线', cat: 'transit' },
    { id: 'b2_bus_e', name: '万家桥路公交站', x: -109.2, y: 163.2, desc: '东侧候车亭和站牌，可站。还没接入井槐里线或南关路线', cat: 'transit' },
  ]);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  for (const [id, name, rect] of CH) {
    root.SCENE_CHUNKS[id] = { objects: lists[id], colliders: [] };
    TAIL.push({ id, name, rect, src: 'js/rongqiao_expand_b2.js', load_m: 40, unload_m: 80 });
  }
})();
