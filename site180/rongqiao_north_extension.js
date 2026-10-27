/* District P2 (榕桥区 north expansion, plan §12 P2): walkable bounds grow NORTH only (y 56 -> 140), ground to y 164,
 * side street 槐北街 continues the existing x 22-28 road north, 槐北横街 (6 m lane, no through traffic) and a 5 m back lane
 * frame the future 榕桥菜市场 block, street trees / lamps, construction hoarding around the still-unbuilt plots, and a
 * closed background row of old 5-storey blocks beyond the north bound. No venues here (the market is P3).
 * Pure data, loaded before core.js like the other *_extension.js files. Sorted pieces live in streamed chunks;
 * ground marks (curbs, lane lines, zebra) are base objects so they bake into the ground tiles.
 * Decisions marked 未经Leo确认 in docs/rongqiao-p2-p3-implementation.md: 槐北街 = northward continuation of the existing
 * x 22-28 side road; 槐北横街 name/position; hoarded plots; background row. */
(function () {
  'use strict';
  const D = window.SCENE_DATA; if (!D || D.rongqiaoNorth) return; D.rongqiaoNorth = 1;
  const Y1 = 140, GY = 164, G = D.ground, R = (() => { let a = 20261017; return () => { a = (a * 1103515245 + 12345) & 0x7fffffff; return a / 0x7fffffff; }; })();
  const LAYOUT = window.RONGQIAO_NORTH = {
    version: 1, bounds: { y1: Y1 }, groundTop: GY,
    street: { name: '槐北街', road: [22, 28], west: [16, 22], east: [28, 32] },
    lane: { name: '槐北横街', south: [82, 86], road: [86, 92], north: [92, 96], x: [32, 96] },
    backLane: { name: '菜市场背街', y: [134, 140], x: [28, 96] },
    marketBlock: [32, 96, 96, 134],
    crosswalk: { id: 'cw_hb', x0: 22, x1: 28, y0: 93, y1: 96.6, road: 'y' },
    plots: [{ id: 'west', rect: [-24, 57, 15.7, 140] }, { id: 'east_a', rect: [32.3, 57, 96, 81.7] }, { id: 'east_b', rect: [96, 57, 224, 140] }],
    corridorGap: [19.4, 32.6],
    /** extra solid rects (P3 buildings register here); a street position inside a plot or a solid is never legitimate */
    solids: [],
    forbidden(x, y) {
      const inside = (r, m) => x > r[0] + m && x < r[2] - m && y > r[1] + m && y < r[3] - m;
      return this.plots.some((p) => inside(p.rect, 0.1)) || this.solids.some((r) => inside(r, 0));
    },
  };
  D.bounds = Object.assign({}, D.bounds, { y1: Math.max(D.bounds.y1, Y1) });
  // ---- ground: extra rows north, then paint ----
  const cols = G.cols, rowsNeeded = Math.ceil((GY - G.origin[1]) / G.chunk);
  while (G.data_south_to_north.length < rowsNeeded) {
    let s = ''; for (let c = 0; c < cols; c++) s += R() < 0.62 ? 'G' : 'K';
    G.data_south_to_north.push(s);
  }
  G.rows = G.data_south_to_north.length;
  function paint(rect, tile, fn) {
    for (let row = 0; row < G.rows; row++) for (let col = 0; col < G.cols; col++) {
      const x = G.origin[0] + (col + 0.5) * G.chunk, y = G.origin[1] + (row + 0.5) * G.chunk;
      if (x >= rect[0] && x < rect[2] && y >= rect[1] && y < rect[3]) { const s = G.data_south_to_north[row], t = fn ? fn(x, y) : tile; if (t) G.data_south_to_north[row] = s.slice(0, col) + t + s.slice(col + 1); }
    }
  }
  const road = () => (R() < 0.72 ? 'A' : 'B');
  paint([-44, 140, 300, GY], 'K');                                     // background row yards
  paint([-44, 140, 300, 142], 'S');                                    // pavement in front of the background row
  paint([16, 56, 22, GY], 'S'); paint([22, 64, 28, GY], null, road); paint([28, 56, 32, GY], 'S');
  paint([32, 82, 96, 86], 'S'); paint([28, 86, 96, 92], null, road); paint([32, 92, 96, 96], 'S');
  paint([32, 96, 96, 134], 'S');                                       // market block paving (P3 lays the hall floor)
  paint([84, 96, 88, 134], 'K'); paint([88, 96, 96, 134], null, (x, y) => (y < 106 ? 'K' : 'G'));
  paint([28, 134, 96, 140], 'K');
  // ---- trees (treepits), lamps ----
  const objects = [], base = [], at = (list, id, type, x, y, more) => list.push(Object.assign({ id, type, x, y }, more || {}));
  const trees = [];
  for (const y of [61, 69, 77, 85, 101, 109, 117, 125, 149, 157]) trees.push([19, y]);
  for (const y of [61, 69, 77, 103, 111, 119, 127]) trees.push([31, y]);
  for (const x of [37, 45, 53, 61, 69, 77, 85, 93]) trees.push([x, 83]);
  trees.forEach(([x, y], i) => { paint([x - 1, y - 1, x + 1, y + 1], 'T'); at(objects, `rq_tree_${x}_${y}`, 'p_tree', x, y, { variant: i % 3 ? 'base' : 't2' }); });
  for (const y of [66, 90, 114, 138]) at(objects, `rq_lamp_w${y}`, 'p_lamp', 21.4, y, { interact: 'lamp' });
  for (const x of [40, 64, 88]) at(objects, `rq_lamp_l${x}`, 'p_lamp', x, 92.6, { interact: 'lamp' });
  at(objects, 'rq_bin_hb1', 'p_trashbin', 20.8, 98.5); at(objects, 'rq_bin_hb2', 'p_trashbin', 33.4, 92.9); at(objects, 'rq_hydrant_hb', 'p_hydrant', 29, 80.5);
  // ---- ground marks: curbs, lane lines, zebra, stop lines (base objects -> baked into ground) ----
  const gap = (y, spans) => spans.some(([a, b]) => y > a && y < b);
  for (let y = 65; y < GY; y += 2) {
    at(base, `rq_curb_w${y}`, 'p_curb', 21.9, y, { rot: 2 });
    if (!gap(y, [[85, 93], [133, 141]])) at(base, `rq_curb_e${y}`, 'p_curb', 28.1, y, { rot: 2 });
    if (!gap(y, [[92.4, 97.2]])) at(base, `rq_edge_w${y}`, 'd_edge_line', 22.35, y, { rot: 2 });
    if (!gap(y, [[85, 97.2], [133, 141]])) at(base, `rq_edge_e${y}`, 'd_edge_line', 27.65, y, { rot: 2 });
  }
  for (let y = 66.5; y < GY; y += 3) if (!gap(y, [[91.5, 98.5]])) at(base, `rq_dash_${y}`, 'd_center_dash', 25, y, { rot: 2 });
  for (let x = 33; x < 96; x += 2) { at(base, `rq_curb_ls${x}`, 'p_curb', x, 85.9); if (x < 83 || x > 89) at(base, `rq_curb_ln${x}`, 'p_curb', x, 92.1); at(base, `rq_edge_ls${x}`, 'd_edge_line', x, 86.35); }
  for (let x = 34.5; x < 94; x += 3) at(base, `rq_dash_l${x}`, 'd_center_dash', x, 89);
  for (let k = 0; k < 6; k++) at(base, `rq_zebra_hb${k}`, 'd_stripe', 22.55 + 0.98 * k, 94.8);
  for (let k = 0; k < 6; k++) at(base, `rq_zebra_mouth${k}`, 'd_stripe', 30, 86.55 + 0.98 * k, { rot: 2 });
  at(base, 'rq_stop_nb', 'd_stopline', 26.5, 92.6, { rot: 2 }); at(base, 'rq_stop_sb', 'd_stopline', 23.5, 97.0, { rot: 2 });
  D.objects = D.objects.concat(base);
  // ---- construction hoarding (3 m panels) around unbuilt plots ----
  const hoard = [], vs = ['a', 'b', 'c', 'a', 'd', 'c'];
  function lineX(y, x0, x1, tag) { let k = 0; for (let x = x0; x < x1 - 0.01; x += 3, k++) at(hoard, `rq_hoard_${tag}_${k}`, 'rq_hoard_s', Math.min(x, x1 - 3), y, { variant: vs[k % vs.length] }); }
  function lineY(x, y0, y1, tag) { let k = 0; for (let y = y0; y < y1 - 0.01; y += 3, k++) at(hoard, `rq_hoard_${tag}_${k}`, 'rq_hoard_w', x, Math.min(y, y1 - 3), { variant: vs[(k + 2) % vs.length] }); }
  lineY(15.7, 57, 141, 'west_e'); { let k = 0; for (let x = 12.7; x > -27; x -= 3, k++) at(hoard, `rq_hoard_west_s_${k}`, 'rq_hoard_s', x, 57, { variant: vs[k % vs.length] }); }
  lineX(57, 32.3, 225, 'east_s'); lineY(32.3, 57, 81.7, 'ea_w'); lineX(81.7, 32.3, 96, 'ea_n'); lineY(96, 81.7, 141, 'eb_w');
  // ---- closed background row beyond the north bound: old 5-storey brick blocks (S/W facades, as the existing nb_* row) ----
  function block(id, x0, y0, floors, list, seed) {
    const W = 15, Dp = 12, fg = id; let s = seed;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let f = 1; f <= floors; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = 0; b < 5; b++) {
        const x = x0 + b * 3, base = `${id}_S${f}F_${b}`;
        at(list, base + '_wall', 'f_wall', x, y0, { z, state: st, fade_group: fg, variant: 'p1' });
        if (f === 1 && b === 2) at(list, base + '_door', 'f_door', x, y0, { z, state: 'closed', fade_group: fg });
        else if (f > 1 && rnd() < 0.35) at(list, base + '_balc', 'f_balcony', x, y0, { z, state: rnd() < 0.6 ? 'laundry' : 'default', fade_group: fg, variant: rnd() < 0.5 ? 'b1' : 'b2' });
        else at(list, base + '_win', 'f_window', x, y0, { z, state: 'intact', fade_group: fg, night_lit: rnd() < 0.6, variant: ['base', 'w1', 'w2'][(rnd() * 3) | 0] });
        if (f > 1 && rnd() < 0.18) at(list, base + '_ac', 'f_ac', x + 2.4, y0, { z: z + 0.5, fade_group: fg, variant: rnd() < 0.5 ? 'a1' : 'a2' });
      }
      for (let b = 0; b < 4; b++) {
        const y = y0 + 3 + b * 3, base = `${id}_W${f}F_${b}`;
        at(list, base + '_wall', 'f_wall', x0, y, { z, rot: 6, state: st, fade_group: fg, variant: 'p1' });
        at(list, base + '_win', 'f_window', x0, y, { z, rot: 6, state: 'intact', fade_group: fg, night_lit: rnd() < 0.5, variant: ['base', 'w1', 'w2'][(rnd() * 3) | 0] });
      }
    }
    at(list, id + '_roof', 'b_roof_a', x0, y0, { z: floors * 3, fade_group: fg });
  }
  const bg = { w: [], m: [], e: [] };
  [-24, -8, 34, 50, 66, 82, 98, 114, 130, 146, 162, 178, 194, 210].forEach((x, i) => block(`rq_bg${i}`, x, 142, 5 + (i % 3 === 1 ? 1 : 0), x < 60 ? bg.w : x < 140 ? bg.m : bg.e, 4242 + i * 97));
  window.SCENE_CHUNKS = window.SCENE_CHUNKS || {};
  const src = 'rongqiao_north_extension.js';
  /* Chunk index entries are appended later by js/rongqiao_register.js, after shared_home_scene.js has pushed its own
   * chunk: progress_save checks old saves' chunk list as an index-by-index prefix, so new chunks must go last. */
  const RQ_PENDING = (window.RONGQIAO_PENDING_CHUNKS = window.RONGQIAO_PENDING_CHUNKS || []);
  const chunk = (id, name, rect, objs) => { window.SCENE_CHUNKS[id] = { objects: objs, colliders: [] }; RQ_PENDING.push({ id, name, rect, src, load_m: 30, unload_m: 60 }); };
  chunk('rq_north_street', '槐北街', [-24, 56, 40, GY], objects.filter((o) => o.x < 32).concat(hoard.filter((o) => o.x < 20)));
  chunk('rq_north_plots', '槐北横街', [32, 56, 224, 140], objects.filter((o) => o.x >= 32).concat(hoard.filter((o) => o.x >= 20)));
  chunk('rq_north_bg_w', '槐北背街楼群（西）', [-24, 140, 60, 156], bg.w);
  chunk('rq_north_bg_m', '槐北背街楼群（中）', [60, 140, 140, 156], bg.m);
  chunk('rq_north_bg_e', '槐北背街楼群（东）', [140, 140, 224, 156], bg.e);
  // ---- open the closed background band where 槐北街 passes (the road already ran to y 64 on the ground) ----
  const out = [];
  for (const c of D.colliders) {
    if (c.id !== 'community_north_closed_background') { out.push(c); continue; }
    const [x0, y0, x1, y1] = c.rect, [g0, g1] = LAYOUT.corridorGap;
    out.push({ id: c.id, rect: [x0, y0, g0, y1] }, { id: c.id + '_east', rect: [g1, y0, x1, y1] });
  }
  D.colliders = out;
  // ---- traffic: 槐北街 lanes run to the new ground edge; zebra cw_hb with stop lines ----
  const T = D.traffic;
  for (const l of T.lanes) if (l.id === 'nb' || l.id === 'sb') {
    l.range = [l.range[0], GY];
    l.stops = l.stops.concat([l.id === 'nb' ? { at: 92.6, cw: 'cw_hb' } : { at: 97.0, cw: 'cw_hb' }]);
    if (l.id === 'sb') l.stops.sort((a, b) => b.at - a.at); else l.stops.sort((a, b) => a.at - b.at);
  }
  if (!T.crosswalks.some((c) => c.id === 'cw_hb')) T.crosswalks.push(Object.assign({}, LAYOUT.crosswalk));
})();
