/* P9 榕桥水系 (2026-10-24, Leo：先把榕桥区做完再对详图). West playable edge -106 → -160, ground to -180.
 * 万家桥路 (the corridor market3 already painted west of the core) crosses 月河 on 万家桥.
 * 槐溪 runs north into 月河; a granite footbridge crosses it (the stone-arch frame is the 46 m 榕桥古桥 span and does not fit an 8 m east-west crossing).
 * 槐溪口公园 sits on the south bank. 月河湾公园 gains a pond with an inlet and an outlet — it had none.
 * South of y 141, west of x -106 stays a closed backdrop (E3 forged-save points). Names 未经Leo确认.
 * Chunks append on RONGQIAO_TAIL_CHUNKS after E5, so older saves keep their chunk prefix. */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, V = window.RONGQIAO_VARIETY;
  if (!D || !N || !V || !D.rongqiaoExpandE3 || !D.ground || D.rongqiaoExpandP9) return;
  D.rongqiaoExpandP9 = 1;
  const G = D.ground, BX0 = -160, GX0 = -180;
  const addC = Math.max(0, Math.round((G.origin[0] - GX0) / G.chunk));
  if (addC) { G.data_south_to_north = G.data_south_to_north.map((row) => 'K'.repeat(addC) + row); G.cols += addC; G.origin = [G.origin[0] - addC * G.chunk, G.origin[1]]; }
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
  D.bounds = Object.assign({}, D.bounds, { x0: Math.min(D.bounds.x0, BX0) });
  const CH = [['rqe_p9_w', '槐溪·万家桥路', [GX0, 141, -106, 192]], ['rqe_p9_n', '万家桥·槐溪口北岸', [GX0, 192, -64, 276]]];
  const lists = { rqe_p9_w: [], rqe_p9_n: [] };
  const chunkOf = (x, y) => (y < 192 ? 'rqe_p9_w' : 'rqe_p9_n');
  let force = null;
  const used = new Set(); const uid = (s) => { let k = s, n = 1; while (used.has(k)) k = s + '_' + n++; used.add(k); return k; };
  const put = (id, type, x, y, more) => lists[force || chunkOf(x, y)].push(Object.assign({ id: uid('rqp9_' + id), type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  const same = (r, a) => r && Math.abs(r[0] - a[0]) < 0.2 && Math.abs(r[1] - a[1]) < 0.2 && Math.abs(r[2] - a[2]) < 0.2 && Math.abs(r[3] - a[3]) < 0.2;
  const OLD = [-128, 192, -64, 238];
  D.colliders = (D.colliders || []).filter((c) => c.id !== 'rqe3_river_w');
  if (N.water) N.water = N.water.filter((r) => !same(r, OLD));
  N.solids = (N.solids || []).filter((r) => !same(r, OLD));
  const root = window;
  const drop = (pred) => { for (const ch of Object.values(root.SCENE_CHUNKS || {})) if (ch && ch.objects) ch.objects = ch.objects.filter((o) => !pred(o)); if (D.objects) D.objects = D.objects.filter((o) => !pred(o)); };
  drop((o) => /^rqe3_emb_/.test(o.id) && o.x >= -124 && o.x < -112);
  drop((o) => /^rqe3_lotus_/.test(o.id) && o.x > -124 && o.x < -112 && o.y > 191 && o.y < 239);
  // B2 lifts this slab and builds the walkable west village. Until that script runs, y < 141 stays closed.
  block('rqe_p9_closed_w', [-180, -80, -106.2, 141.15]);
  block('rqe_p9_margin', [-180, 141, -160.35, 272.3]);
  block('rqe_p9_north_bg', [-180, 272.3, -105.8, 460]);
  // 槐溪 (N-S) and the granite footbridge gap
  const CREEK = [[-150, 148, -142, 166], [-150, 170, -142, 192]];
  for (const r of CREEK) { paint(r, null, (x, y) => (x < -148.2 ? 'V' : ((Math.round(x + y) % 5) === 0 ? 'U' : 'W'))); block('rqe_p9_creek_' + r[1], r); if (N.water) N.water.push(r.slice()); }
  paint([-160, 166, -150, 170], 'S'); paint([-152, 166, -140, 170], 'Y'); paint([-142, 166, -118, 170], 'S');
  // 万家桥路: west sidewalk wide enough for the map pin (deck x0 + 2.5), carriageway, east sidewalk clear of the backdrop block at x -112
  paint([-124, 142, -118, 272], 'S'); paint([-118, 142, -114, 272], 'A'); paint([-114, 142, -106.6, 192], 'S'); paint([-114, 192, -112, 272], 'S');
  const RIVER = [[-180, 192, -124, 238], [-112, 192, -64, 238]];
  for (const r of RIVER) { paint(r, null, (x, y) => (y < 194 ? 'V' : ((Math.round(x * 2 + y) % 7) === 0 ? 'U' : 'W'))); block('rqe_p9_river_' + r[0], r); if (N.water) N.water.push(r.slice()); }
  paint([-124, 192, -118, 238], 'S'); paint([-118, 192, -114, 238], 'A'); paint([-114, 192, -112, 238], 'S');
  for (let y = 192, k = 0; y < 238; y += 3, k++) put('wj_fw_' + y, 'rq_x_rbridge_w', -124, Math.min(y, 235), { variant: k % 4 === 2 ? 'p' : 'g' });
  for (let y = 190; y < 240; y += 3) { put('wj_rw_' + y, 'rq_x_rail_w', -123.75, y); put('wj_re_' + y, 'rq_x_rail_w', -112.25, y); }
  for (const y of [200, 220, 234]) { put('wj_ll_' + y, 'p_lamp', -122.2, y); put('wj_lr_' + y, 'p_lamp', -113.2, y); }
  // south bank park + riverside path, west bank of the creek
  paint([-160, 142, -150, 192], 'G'); paint([-142, 148, -124, 192], 'G');
  paint([-160, 166, -118, 170], 'S'); paint([-152, 166, -140, 170], 'Y');
  paint([-160, 186, -124, 192], 'S'); paint([-106.2, 186, -64, 192], 'S');
  const wv = (x, y) => ['willow', 'willow2', 'willow', 'willow3'][Math.abs(Math.round(x * 7 + y * 13)) % 4];
  for (const [x, y] of [[-156, 150], [-156, 178], [-136, 156], [-130, 176], [-128, 188]]) put('t_' + x + '_' + y, 'rq_x_tree', x, y, { variant: wv(x, y) });
  put('t_rong', 'rq_x_tree', -134, 182, { variant: 'rong' });
  for (let y = 150; y < 190; y += 6) { put('reed_w_' + y, 'rq_x_reed', -150.6, y, { variant: y % 12 === 0 ? 'iris' : 'reed' }); put('reed_e_' + y, 'rq_x_reed', -141.4, y, { variant: 'reed' }); }
  put('lotus_m', 'rq_x_lotus', -146, 188.6, { variant: 'a' }); put('rock_m', 'rq_x_rock', -138, 172.4, { variant: 'a' });
  put('bench_p', 'community_bench', -132, 176.2, { rot: 0 }); put('bench_w', 'community_bench', -156.4, 178.2, { rot: 2 });
  put('lan_p', 'rq_x_lantern', -139.2, 174.2); put('lan_w', 'rq_x_lantern', -157.2, 160.2);
  for (let x = -150; x <= -141; x += 3) { put('fb_s_' + x, 'rq_x_rail_s', x, 166.15); put('fb_n_' + x, 'rq_x_rail_s', x, 169.85); }
  // north bank: promenade, pond, inlet / outlet into 月河 (月河湾公园 had no canals)
  paint([-160, 239.2, -124, 244], 'S'); paint([-136, 239.2, -124, 244], 'S');
  const CANALS = [[-148, 238, -145, 250], [-139, 238, -136, 250], [-152, 248, -136, 256]];
  for (const r of CANALS) { paint(r, null, () => 'W'); block('rqe_p9_canal_' + r[0] + '_' + r[1], r); if (N.water) N.water.push(r.slice()); }
  paint([-160, 256.2, -128, 262], 'G');
  for (let x = -158; x < -126; x += 3) if (x < -152 || x > -136) put('railn_' + x, 'rq_x_rail_s', x, 238.35);
  for (let x = -176; x < -124; x += 3) if (x < -152 || (x >= -136 && x < -124)) put('emb_' + x, 'rq_x_embank_s', x, 238);
  for (const [x, y] of [[-158, 246], [-132, 250], [-128, 258]]) put('tn_' + x, 'rq_x_tree', x, y, { variant: wv(x, y) });
  put('lotus_n', 'rq_x_lotus', -144, 252.2, { variant: 'b' }); put('bench_n', 'community_bench', -134.5, 246.2, { rot: 4 });
  for (let y = 144; y < 268; y += 2) put('hedge_' + y, 'p_hedge', -160.5, y, { rot: 6 });
  // backdrop village west of the fence: old 4–7F brick, not the 月湾 kit.
  // B3 opens the sidewalk in front of this row. The blocks themselves stay solid.
  function bld(id, x0, y0) {
    force = 'rqe_p9_w';
    const fg = 'rqe_p9_' + id, S = V.style(fg, 'p9_bgw', 5, { range: [4, 7], size: 'b', bays: 4 });
    const W = 12, Dp = 9, F = S.F;
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = 0; b < 4; b++) put(id + '_S' + f + '_' + b, 'f_wall', x0 + b * 3, y0, { z, state: st, fade_group: fg, variant: S.mat });
      for (let b = 0; b < 3; b++) put(id + '_W' + f + '_' + b, 'f_wall', x0, y0 + 3 + b * 3, { z, rot: 6, state: st, fade_group: fg, variant: S.mat });
    }
    put(id + '_roof', 'b_roof_b', x0, y0, { z: F * 3, fade_group: fg, variant: V.tile(S.roof === 'c' ? 'base' : S.roof, 'b_roof_b', fg) });
    block(fg, [x0 - 0.32, y0 - 0.32, x0 + W, y0 + Dp]);
    force = null;
  }
  bld('bg0', -174, 144); bld('bg1', -174, 156); bld('bg2', -174, 168);
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  const info = { phase: 'P9', bounds: { x0: BX0 }, ground: { x0: GX0 }, unconfirmed: true,
    names: { creek: '槐溪', foot: '槐溪小桥', bridge: '万家桥', road: '万家桥路', park: '槐溪口公园', canals: '月河湾水渠' },
    creek: CREEK.map((r) => r.slice()), footbridge: [-152, 166, -140, 170], bridge: [-124, 190, -112, 242],
    road: [-124, 142, -106.6, 272], park: [-141, 156, -125, 184], canals: CANALS.map((r) => r.slice()),
    closed: [-180, -80, -106.2, 141.15] };
  N.expansionP9 = info;
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  for (const [id, name, rect] of CH) { root.SCENE_CHUNKS[id] = { objects: lists[id], colliders: [] }; TAIL.push({ id, name, rect, src: 'js/rongqiao_expand_p9.js', load_m: 40, unload_m: 80 }); }
})();
