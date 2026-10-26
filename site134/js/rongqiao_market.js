/* P3 榕桥菜市场 phase 1 (district plan §12 P3): a 35 x 28 m wet market on the east side of 槐北街, in the SAME world coordinates
 * as the street (no scene switch; 【Leo已定】2026-10-17 20:09 only wet markets use the seamless open interior).
 *   - structure, stalls and props stream in as chunk 'rq_market'; on apply it registers with SP.openInterior (roof hide, 1.1 m
 *     near-wall cut, rain mask, night pendant lights, LOD), on drop / street reload it unregisters and re-registers;
 *   - four customer gates (S main gate with signboard, W, N, E) + a goods-only loading door off the east service passage;
 *   - goods states (full / half / empty / closed-covered) and bay shutters follow the 05:30-20:30 opening schedule through
 *     W.shownState only: presentation, never a ledger, never a save field (old saves load unchanged);
 *   - floors are ground-legend tiles + base decals baked into the ground; colliders are explicit chunk rects.
 * Layout is a pure function (node tests). P3b (rongqiao_market_trade*.js) adds vendors, buying and real stock: stall objects carry
 * rqStall + interact 'rq_stall' + a customer reach point, and goods states then follow the trade ledger (ps.wetMarket). */
(function (root) {
  'use strict';
  const ID = 'rq_market', RECT = [48, 100, 83, 128], NAME = '榕桥菜市场';
  const BAY = 3.875, OPEN = 330, CLOSE = 1230;            // 05:30 - 20:30
  const GATES = { S: { x: 65.5, y: 100, out: [65.5, 98.6], in: [65.5, 102.2] }, N: { x: 65.5, y: 128, out: [65.5, 129.4], in: [65.5, 126.6] },
    W: { x: 48, y: 116, out: [46.6, 116], in: [49.6, 116] }, E: { x: 83, y: 116, out: [84.4, 116], in: [81.4, 116] } };
  function layout() {
    const objs = [], base = [], cols = [], lights = [];
    let n = 0;
    const add = (type, x, y, role, more) => { const o = Object.assign({ id: `${ID}_${type.replace(/^rq_(mk_)?/, '')}_${n++}`, type, x: +x.toFixed(3), y: +y.toFixed(3), z: 0, rot: 0, fade_group: ID }, more || {}); if (role) o.cutaway = { b: ID, role }; objs.push(o); return o; };
    const deco = (type, x, y, more) => base.push(Object.assign({ id: `${ID}_d${base.length}`, type, x: +x.toFixed(3), y: +y.toFixed(3), z: 0, rot: 0 }, more || {}));
    const R = (id, a, b, c, d, solid) => cols.push({ id: `${ID}_c_${id}`, rect: [a, b, c, d], solid: !!solid });
    // ---- south facade: 8 street-stall bays + main gate
    const bays = [0, 1, 2, 3].map((i) => 48 + i * BAY).concat([0, 1, 2, 3].map((i) => 67.5 + i * BAY));
    bays.forEach((bx, i) => {
      const v = i < 4 ? 'fruit' : 'veg';
      const sid = i < 7 ? 'bay' + i : null, deal = sid ? { rqStall: sid, interact: 'rq_stall', reach: [[bx + 2.1, 105.45]], name: '内摊柜台' } : {};
      add('rq_mk_bay', bx, 100, 'near', { variant: v, state: 'open', rqBay: 1, rqStall: sid });
      add('rq_mk_bayback', bx, 100.35, 'interior', Object.assign({ variant: i === 7 ? 'vacant' : v, state: 'full', rqGoods: 1, rqVacant: i === 7 ? 1 : 0 }, deal));
      add('rq_mk_streetstall', bx + 0.56, 98.55, null, { variant: v, state: 'full', rqGoods: 1, rqStall: sid, rqVacant: i === 7 ? 1 : 0 });
      R('bay' + i, bx, 100, bx + BAY, 105, true); R('ss' + i, bx + 0.56, 98.55, bx + 3.76, 99.85);
    });
    add('rq_mk_gate_s', 63.5, 100, 'near'); add('rq_mk_signboard', 63.5, 100, 'roof');      // hidden with the roof while inside (no ghost sign over the stalls)
    R('gs_a', 63.5, 100, 63.9, 100.35); R('gs_b', 67.1, 100, 67.5, 100.35);
    // ---- west wall (exterior brick) with the west gate
    const yWall = (x, look, from, to, gateAt, gateType, gateVar) => {
      for (let y = from; y < to - 0.01;) { if (gateAt != null && Math.abs(y - gateAt) < 0.01) { add(gateType, x, y, look === 'ext' ? 'near' : 'far', { variant: gateVar }); y += 4; continue; } add('rq_mk_wall_y2', x, y, look === 'ext' ? 'near' : 'far', { variant: look + ((Math.round(y) / 2) % 2 ? '_win' : '') }); y += 2; }
    };
    yWall(48, 'ext', 100, 128, 114, 'rq_mk_gate_y', 'west');
    R('w_a', 48, 100, 48.3, 114.5, true); R('w_b', 48, 117.5, 48.3, 128, true);
    // ---- east wall (interior face) with the east gate and the loading door
    for (let y = 100; y < 128;) {
      if (y === 114) { add('rq_mk_gate_y', 82.7, y, 'far', { variant: 'east' }); y += 4; continue; }
      if (y === 122) { add('rq_mk_load', 82.7, y, 'far'); y += 4; continue; }
      add('rq_mk_wall_y2', 82.7, y, 'far', { variant: (y / 2) % 2 ? 'int_win' : 'int' }); y += 2;
    }
    R('e_a', 82.7, 100, 83, 114.5, true); R('e_b', 82.7, 117.5, 83, 128, true);
    // ---- north wall (interior face) with the north gate
    const xs = [[48, 'rq_mk_wall_x2'], [50, 'rq_mk_wall_x2'], [52, 'rq_mk_wall_x2'], [54, 'rq_mk_wall_x2'], [56, 'rq_mk_wall_x2'], [58, 'rq_mk_wall_x2'], [60, 'rq_mk_wall_x2'], [62, 'rq_mk_wall_x15'],
      [67.5, 'rq_mk_wall_x15'], [69, 'rq_mk_wall_x2'], [71, 'rq_mk_wall_x2'], [73, 'rq_mk_wall_x2'], [75, 'rq_mk_wall_x2'], [77, 'rq_mk_wall_x2'], [79, 'rq_mk_wall_x2'], [81, 'rq_mk_wall_x2']];
    xs.forEach(([x, t], i) => add(t, x, 127.7, 'far', { variant: i % 3 === 1 ? 'int_win' : 'int' }));
    add('rq_mk_gate_x', 63.5, 127.7, 'far', { variant: 'north' });
    R('n_a', 48, 127.7, 64, 128, true); R('n_b', 67, 127.7, 83, 128, true);
    // ---- roof: 7 x 7 tiles, skylight monitor over the main aisle
    const colsX = [[48, 'rq_roof_a'], [53, 'rq_roof_a'], [58, 'rq_roof_b'], [63.5, 'rq_roof_sky'], [67.5, 'rq_roof_b'], [73, 'rq_roof_a'], [78, 'rq_roof_a']];
    colsX.forEach(([x, t], ci) => { for (let r = 0; r < 7; r++) { const y = 100 + r * 4; let v = (r === 0 ? 's' : '') + (ci === 0 ? 'w' : ''); if (t === 'rq_roof_sky') v = r === 0 ? 's' : 'in'; else if (!v) v = (ci === 5 && r === 4) || (ci === 1 && r === 5) ? 'e' : 'in'; add(t, x, y, 'roof', { variant: v }); } });
    // ---- stall islands A (meat / poultry / eggs) and B (tofu / deli / dry goods / grain & oil), blue pillars
    const isl = [[50.5, ['poultry', 'eggs'], ['pork', 'beef']], [68.5, ['dry', 'grain'], ['tofu', 'deli']]];
    isl.forEach(([x0, south, north], k) => {
      south.forEach((kind, i) => add('rq_mk_stall_' + kind, x0 + i * 6, 107, 'interior', { state: 'full', rqGoods: 1, rqStall: kind, interact: 'rq_stall', reach: [[x0 + i * 6 + 3, 106.45]], name: '摊位柜台' }));
      north.forEach((kind, i) => add('rq_mk_stall_' + kind, x0 + i * 6, 110.75, 'interior', { state: 'full', rqGoods: 1, rqStall: kind, interact: 'rq_stall', reach: [[x0 + i * 6 + 3, 115.0]], name: '摊位柜台' }));
      for (const dx of [0, 6, 12]) for (const y of [107, 114.5]) add('rq_mk_pillar', x0 + dx, y, 'interior', { variant: dx === 6 && y === 107 ? 'notice' : 'plain' });
      R('isl' + k, x0 - 0.2, 106.8, x0 + 12.2, 114.7, true);
    });
    // ---- aquatic (live tanks + ice tables), cold counters, wash
    [[50.5, 4], [68.5, 2]].forEach(([x0, m], k) => { for (let i = 0; i < m; i++) { const sid = k === 0 && i < 2 ? 'fish' : 'shell', deal = k === 0 ? { interact: 'rq_stall', reach: [[x0 + 1.5 + i * 3, 117.7]], name: '水产冰台' } : {}; add('rq_mk_tanks', x0 + i * 3, 120.4, 'interior', { state: 'full', rqGoods: 1, rqStall: sid }); add('rq_mk_ice', x0 + 0.2 + i * 3, 118.2, 'interior', Object.assign({ variant: i % 2 ? 'shell' : 'fish', state: 'full', rqGoods: 1, rqStall: sid }, deal)); } });
    R('aq_w', 50.5, 118, 62.5, 121.5, true); R('aq_e', 68.5, 118, 74.5, 122.6, true);
    add('rq_mk_coldcase', 69.0, 121.6, 'interior', { state: 'full', rqGoods: 1, rqStall: 'shell' }); add('rq_mk_coldcase', 71.6, 121.6, 'interior', { state: 'full', rqGoods: 1, rqStall: 'shell' });
    add('rq_mk_wash', 75.8, 120.3, 'interior'); R('wash', 75.8, 120.3, 82.3, 121.5, true);
    // ---- back of house: office, vendor storage (NW); cold room, loading (NE)
    add('rq_mk_office', 48.3, 122.6, 'interior'); R('office', 48.3, 122.6, 55, 127.7, true);
    add('rq_mk_storage', 55.4, 122.6, 'interior'); R('storage', 55.4, 122.6, 62.4, 127.7, true);
    add('rq_mk_coldroom', 68.5, 122.6, 'interior'); R('coldroom', 68.5, 122.6, 75, 127.7, true);
    for (const x of [75.3, 77.3, 79.3]) add('rq_mk_chain_x', x, 122.45, 'interior');
    add('rq_mk_crates', 81.4, 122.0, 'interior', { variant: 'mixed' }); R('load', 75.1, 122.3, 82.7, 122.6, true); R('load_c', 81.4, 122.0, 82.2, 122.6, true);
    [['veg', 76.0, 123.2], ['foam', 77.6, 123.4], ['sack', 79.2, 124.6], ['veg', 76.2, 125.6], ['foam', 80.6, 126.3]].forEach(([v, x, y]) => add('rq_mk_pallet', x, y, 'interior', { variant: v }));
    add('rq_mk_cart', 79.0, 123.0, 'interior');
    // ---- entrance points: hand-wash left of the main aisle, fair scale right of it
    add('rq_mk_handwash', 62.1, 105.1, 'interior'); R('hw', 62.1, 105.1, 63.3, 105.6);
    add('rq_mk_scale', 67.9, 105.1, 'interior'); R('scale', 67.9, 105.1, 68.7, 105.7);
    for (const [x, y, v] of [[49.0, 106.0, 'blue'], [81.2, 106.0, 'green'], [49.2, 118.4, 'foam'], [63.0, 121.8, 'foam'], [74.9, 118.3, 'mixed']]) { add('rq_mk_crates', x, y, 'interior', { variant: v }); R('cr' + x, x, y, x + 0.75, y + 0.55); }
    // ---- pendant lamps over the aisles (lights for the lightmap)
    const lampAt = [[65.5, 103], [65.5, 109], [65.5, 115], [65.5, 121], [65.5, 126], [52, 105.9], [58, 105.9], [72, 105.9], [78, 105.9], [51, 116.3], [57, 116.3], [74, 116.3], [80, 116.3], [49.4, 110.5], [81.6, 110.5], [56.5, 119.6], [71.5, 119.6], [78.8, 119.6], [51.5, 122.0], [78.5, 124.8]];
    for (const [x, y] of lampAt) { add('rq_mk_lamp', x, y, 'light'); lights.push([x, y, 2.85, 4.2]); }
    // ---- outside: toilet block, trash room, truck yard, passage bollards, e-bikes
    add('rq_mk_toilet', 36.5, 108, null); R('toilet', 36.5, 108, 43.5, 115, true);
    add('rq_mk_trash', 88, 100.3, null); R('trash', 88, 100.3, 92, 105.3, true);
    add('rq_truck', 84.4, 120.0, null); R('truck', 84.2, 119.2, 86.6, 125.9, true);
    for (const x of [83, 85, 87, 89, 91, 93]) add('rq_mk_chain_x', x, 118.4, null);
    add('rq_bollard', 95.6, 118.4, null); R('yard', 83, 118.3, 96, 118.5, true);
    for (let y = 101; y < 118; y += 2.2) { add('rq_bollard', 85.8, y, null); R('bo' + y.toFixed(1), 85.68, y - 0.12, 85.92, y + 0.12); }
    for (const [x, v] of [[33.4, 'a'], [36.4, 'b'], [44.6, 'a']]) { add('rq_ebikes', x, 97.0, null, { variant: v }); R('eb' + x, x, 96.9, x + 2.6, 98.4); }
    // ---- base decals (baked into the ground)
    for (let y = 100; y < 121; y += 2) deco('rq_dec_floorh', 82, y);
    for (let x = 50.5; x < 62.4; x += 2) deco('rq_dec_drain', x, 117.6);
    for (let x = 68.5; x < 74.4; x += 2) deco('rq_dec_drain', x, 117.6);
    for (const x of [75.4, 77.4, 79.4]) deco('rq_dec_hatch', x, 122.7);
    for (let y = 100; y < 118; y += 2) deco('rq_dec_yline_y', 85.75, y);
    for (const x of [83, 85, 87]) deco('rq_dec_hatch', x, 118.6);
    deco('rq_dec_drain_y', 65.4, 100.6); deco('rq_dec_drain_y', 65.4, 102.6);
    // P3b: S-facing island stalls get their front counter as its own sorted piece (vendor stands between it and the back shelf); appended so earlier ids stay
    for (const [kind, x] of [['poultry', 50.5], ['eggs', 56.5], ['dry', 68.5], ['grain', 74.5]]) add('rq_mk_stallfront_' + kind, x, 107, 'interior', { state: 'full', rqGoods: 1, rqStall: kind });
    return { id: ID, name: NAME, rect: RECT.slice(), objects: objs, base, colliders: cols, lights, doors: Object.entries(GATES).map(([id, g]) => Object.assign({ id }, g)),
      gates: GATES, solids: cols.filter((c) => c.solid).map((c) => c.rect) };
  }
  /** goods / shutter presentation from the opening schedule (pure) */
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  function isOpen(min) { const m = ((min % 1440) + 1440) % 1440; return m >= OPEN && m < CLOSE; }
  function goodsState(o, min) {
    const m = ((min % 1440) + 1440) % 1440; if (!isOpen(m)) return 'closed';
    if (o.rqVacant) return 'empty'; const h = hash(o.id);
    if (m < 390) return h < 0.6 ? 'half' : 'full';                 // 05:30-06:30 setting up
    if (m < 720) return h < 0.12 ? 'half' : 'full';                // morning peak
    if (m < 1020) return h < 0.7 ? 'half' : 'full';                // afternoon
    if (m < 1140) return h < 0.25 ? 'empty' : 'half';              // evening
    return h < 0.55 ? 'empty' : 'half';                            // last hour
  }
  function phaseKey(min) { const m = ((min % 1440) + 1440) % 1440; return !isOpen(m) ? 0 : m < 390 ? 1 : m < 720 ? 2 : m < 1020 ? 3 : m < 1140 ? 4 : 5; }
  const api = { ID, RECT, NAME, BAY, OPEN, CLOSE, GATES, layout, goodsState, isOpen, phaseKey };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RongqiaoMarket = api;
  // ======================================================================== game wiring
  const D = root.SCENE_DATA; if (!D || D.rongqiaoMarket) return; D.rongqiaoMarket = 1;
  const L = layout();
  // ground: market floor 'M', wet zones 'Q', loading / passage strip concrete
  const G = D.ground; G.legend = Object.assign({}, G.legend, { M: 'rq_gfloor', Q: 'rq_gwet' });
  const paint = (rect, t) => { for (let r = 0; r < G.data_south_to_north.length; r++) for (let c = 0; c < G.cols; c++) { const x = G.origin[0] + (c + 0.5) * G.chunk, y = G.origin[1] + (r + 0.5) * G.chunk; if (x >= rect[0] && x < rect[2] && y >= rect[1] && y < rect[3]) { const s = G.data_south_to_north[r]; G.data_south_to_north[r] = s.slice(0, c) + t + s.slice(c + 1); } } };
  paint([48, 100, 82, 128], 'M'); paint([50, 118, 62, 122], 'Q'); paint([68, 118, 82, 122], 'Q'); paint([76, 122, 82, 128], 'K'); paint([82, 100, 84, 128], 'K');
  D.objects = D.objects.concat(L.base);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS[ID] = { objects: L.objects, colliders: L.colliders.map((c) => ({ id: c.id, rect: c.rect.slice() })) };
  (root.RONGQIAO_PENDING_CHUNKS = root.RONGQIAO_PENDING_CHUNKS || []).push({ id: ID, name: NAME, rect: [32, 96, 96, 140], src: 'js/rongqiao_market.js', load_m: 30, unload_m: 60 });
  if (root.RONGQIAO_NORTH) for (const r of L.solids) root.RONGQIAO_NORTH.solids.push(r.slice());
  const SP = root.SP; if (!SP || !SP.world) return;
  const W = SP.world;
  // ---- open-interior registration follows the chunk (apply / drop / street reload)
  function sync() {
    const OI = SP.openInterior; if (!OI || W.interior) return false;
    const inWorld = !!(W.chunksIn && W.chunksIn[ID]), reg = !!OI.get(ID);
    if (inWorld && !reg) { OI.register({ id: ID, name: NAME, rect: L.rect, doors: L.doors, lights: L.lights, wallH: 3.6 }); return true; }
    if (!inWorld && reg) { OI.unregister(ID); return true; }
    return false;
  }
  if (SP.chunks) {
    const CH = SP.chunks, apply0 = CH.apply, drop0 = CH.drop;
    CH.apply = function (c) { const r = apply0.apply(this, arguments); if (c && c.id === ID) sync(); return r; };
    CH.drop = function (c) { const r = drop0.apply(this, arguments); if (c && c.id === ID) sync(); return r; };
  }
  if (SP.openInterior) { const OI = SP.openInterior, up0 = OI.update; OI.update = function () { sync(); return up0.apply(this, arguments); }; }
  // ---- schedule-driven presentation (goods, shutters); a phase change rebakes once
  const now = () => (SP.clock ? SP.clock.min : 480);
  const shown0 = W.shownState;
  /* P3b: when the trade ledger runs (SP.wetMarket), goods follow real stock and the vendor's presence; the schedule stays the fallback */
  W.shownState = function (o) {
    const T = SP.wetMarket && SP.wetMarket.ready && SP.wetMarket.ready();
    if (o && o.rqGoods) return T && o.rqStall && !o.rqVacant ? SP.wetMarket.goodsState(o.rqStall) : goodsState(o, now());
    if (o && o.rqBay) return T && o.rqStall ? (SP.wetMarket.present(o.rqStall) ? 'open' : 'shut') : isOpen(now()) ? 'open' : 'shut';
    return shown0.call(W, o);
  };
  let phase = null;
  function tick() { const p = phaseKey(now()); if (phase !== null && p !== phase && W.chunksIn && W.chunksIn[ID]) { if (SP.layers && SP.layers.reset) SP.layers.reset(); if (SP.env && SP.env.invalidateLights) SP.env.invalidateLights(); } phase = p; }
  if (SP.openInterior) { const OI = SP.openInterior, up1 = OI.update; OI.update = function () { tick(); return up1.apply(this, arguments); }; }
  // ---- exterior night lights: signboard, awning lamps while open, toilet and trash-room lamps
  const E = SP.env;
  if (E && E.lights) {
    const lights0 = E.lights; E.lights = function () {
      const out = lights0.apply(this, arguments); if (W.interior || !(W.chunksIn && W.chunksIn[ID])) return out;
      const n = E.night || 0; if (n <= 0.01) return out; const open = isOpen(now());
      out.push({ x: 65.5, y: 99.6, z: 4.4, r: 3.6, c: [210, 255, 220], a: 0.6 * n, flat: false, refl: true });
      if (open) for (const bx of [48, 51.875, 55.75, 59.625, 67.5, 71.375, 75.25, 79.125]) { out.push({ x: bx + 2, y: 99.2, z: 2.2, r: 2.6, c: [255, 226, 170], a: 0.75 * n, flat: false, refl: false }); out.push({ x: bx + 2, y: 98.8, z: 0, r: 3.2, c: [255, 222, 168], a: 0.55 * n, flat: true }); }
      out.push({ x: 40, y: 107.4, z: 2.4, r: 2.6, c: [235, 245, 255], a: 0.7 * n, flat: false, refl: true }, { x: 40, y: 106.8, z: 0, r: 3.4, c: [235, 245, 255], a: 0.5 * n, flat: true });
      out.push({ x: 87.6, y: 102.8, z: 2.3, r: 2.4, c: [255, 220, 160], a: 0.6 * n, flat: false, refl: true });
      return out;
    };
  }
  SP.rongqiaoMarket = Object.assign(Object.create(api), { data: L, sync, tick });
  Object.defineProperty(SP.rongqiaoMarket, 'registered', { get: () => !!(SP.openInterior && SP.openInterior.get(ID)) });
})(typeof window !== 'undefined' ? window : globalThis);
