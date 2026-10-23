/* E4 (2026-10-18): 榕桥第二菜市场 on the 南关路 east section — the SAME market system as 榕桥菜市场 (js/rongqiao_market.js):
 * its pure layout() translated by (DX, DY) onto the old parking lot north of 南关路 (x 156-191, y -60..-32, south main gate on the
 * 南关路 pavement, W / N / E side gates, loading door, toilet, trash room, truck yard), the same seamless open interior
 * (【Leo已定 2026-10-17 20:09】 only wet markets: roof hide, near-wall cut, pendant lights) and the same schedule-driven goods /
 * shutter presentation (W.shownState). Single ledger: since E4b-trade the stalls here carry rqStall 'm2_<id>' + interact
 * 'rq_stall' + translated reach points, served by the SAME trade ledger (ps.wetMarket, WetMarketModel v2: the 17 'm2_*' stalls,
 * their vendors and 12 regulars of their own); goods states follow that ledger. A v1 ledger migrates with the new stalls empty.
 * The chunk appends after the E4 chunks (RONGQIAO_LATE_CHUNKS), so every older save keeps its chunk prefix.
 * Name / placement 未经Leo确认. */
(function (root) {
  'use strict';
  const D = root.SCENE_DATA, M = root.RongqiaoMarket, N = root.RONGQIAO_NORTH;
  if (!D || !M || !D.rongqiaoExpandE4 || D.rongqiaoMarket2) return; D.rongqiaoMarket2 = 1;
  const ID = 'rq_market2', NAME = '榕桥第二菜市场', DX = 108, DY = -160, CHUNK = [140, -66, 208, -28];
  const T = (x, y) => [+(x + DX).toFixed(3), +(y + DY).toFixed(3)], TR = (r) => [r[0] + DX + 0.001, r[1] + DY + 0.001, r[2] + DX - 0.001, r[3] + DY - 0.001].map((v) => +v.toFixed(3));   // 1 mm inset: float sums of the offset must not make routes that just clear a counter in 榕桥菜市场 touch it here
  const L0 = M.layout(), ren = (id) => String(id).replace(/^rq_market/, ID);
  const objects = L0.objects.map((o) => { const n = Object.assign({}, o, { id: ren(o.id) }); [n.x, n.y] = T(o.x, o.y);
    if (n.rqStall) n.rqStall = 'm2_' + n.rqStall; if (Array.isArray(n.reach)) n.reach = n.reach.map((p) => T(p[0], p[1]));
    if (n.fade_group === M.ID) n.fade_group = ID; if (n.cutaway) n.cutaway = Object.assign({}, n.cutaway, { b: ID }); if (n.type === 'rq_mk_signboard') n.variant = 'm2'; return n; });
  const base = L0.base.map((o) => { const n = Object.assign({}, o, { id: ren(o.id) }); [n.x, n.y] = T(o.x, o.y); return n; });
  const colliders = L0.colliders.map((c) => ({ id: ren(c.id), rect: TR(c.rect), solid: c.solid }));
  const gates = {}; for (const [k, g] of Object.entries(L0.gates)) gates[k] = { x: g.x + DX, y: g.y + DY, out: T(...g.out), in: T(...g.in) };
  const L = { id: ID, name: NAME, rect: TR(L0.rect), objects, base, colliders, lights: L0.lights.map(([x, y, z, r]) => [x + DX, y + DY, z, r]),
    doors: Object.entries(gates).map(([id, g]) => Object.assign({ id }, g)), gates, solids: colliders.filter((c) => c.solid).map((c) => c.rect), offset: [DX, DY] };
  // ---- clear the old parking lot (E1 cars, lot fence, marks) and any street prop the market footprint covers
  const CLEAR = [[143.5, -60, 206, -33.2]].concat(colliders.map((c) => [c.rect[0] - 0.4, c.rect[1] - 0.4, c.rect[2] + 0.4, c.rect[3] + 0.4]));
  const inR = (o, r) => o.x >= r[0] && o.x <= r[2] && o.y >= r[1] && o.y <= r[3];
  const removed = [];
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  for (const [cid, ch] of Object.entries(root.SCENE_CHUNKS)) {
    if (!ch || !ch.objects || cid === ID || /^rq_market/.test(cid)) continue;
    const keep = ch.objects.filter((o) => { const lot = /^rqe_/.test(o.id) && !/^rqe3?_e3_|_roof|_wall|_win|_door|_shop|_balc/.test(o.id) && inR(o, CLEAR[0]), hit = CLEAR.slice(1).some((r) => inR(o, r)) && !/_wall|_win|_door|_roof|_shop|_balc|_sign|_ac$|_pipe/.test(o.id);
      if (lot || hit) { removed.push(o.id); return false; } return true; });
    ch.objects = keep;
  }
  // ---- ground: market floor 'M', wet zones 'Q', service strips concrete
  const G = D.ground;
  const paint = (rect, t) => { for (let r = 0; r < G.data_south_to_north.length; r++) { let row = null; for (let c = 0; c < G.cols; c++) { const x = G.origin[0] + (c + 0.5) * G.chunk, y = G.origin[1] + (r + 0.5) * G.chunk; if (x >= rect[0] && x < rect[2] && y >= rect[1] && y < rect[3]) { row = row || G.data_south_to_north[r].split(''); row[c] = t; } } if (row) G.data_south_to_north[r] = row.join(''); } };
  for (const [r, t] of [[[48, 100, 82, 128], 'M'], [[50, 118, 62, 122], 'Q'], [[68, 118, 82, 122], 'Q'], [[76, 122, 82, 128], 'K'], [[82, 100, 84, 128], 'K']]) paint(TR(r), t);
  paint([142, -58, 156, -33], 'K'); paint([191, -58, 206, -33], 'K');     // service lanes W / E of the hall (were parking bays)
  D.objects = D.objects.concat(base);
  root.SCENE_CHUNKS[ID] = { objects: L.objects, colliders: L.colliders.map((c) => ({ id: c.id, rect: c.rect.slice() })) };
  (root.RONGQIAO_LATE_CHUNKS = root.RONGQIAO_LATE_CHUNKS || []).push({ id: ID, name: NAME, rect: CHUNK, src: 'js/rongqiao_market2.js', load_m: 30, unload_m: 60 });
  if (N) for (const r of L.solids) N.solids.push(r.slice());
  const info = { id: ID, name: NAME, rect: L.rect, gates, offset: [DX, DY], removed: removed.length, ledger: 'ps.wetMarket (same ledger, stalls m2_*)', unconfirmed: true };
  if (N && N.expansionE4) N.expansionE4.market = info;
  const SP = root.SP; if (!SP || !SP.world) { root.RongqiaoMarket2 = { data: L, info }; return; }
  const W = SP.world;
  function sync() {
    const OI = SP.openInterior; if (!OI || W.interior) return false;
    const inWorld = !!(W.chunksIn && W.chunksIn[ID]), reg = !!OI.get(ID);
    if (inWorld && !reg) { OI.register({ id: ID, name: NAME, rect: L.rect, doors: L.doors, lights: L.lights, wallH: 3.6 }); return true; }
    if (!inWorld && reg) { OI.unregister(ID); return true; }
    return false;
  }
  if (SP.chunks) { const CH = SP.chunks, apply0 = CH.apply, drop0 = CH.drop;
    CH.apply = function (c) { const r = apply0.apply(this, arguments); if (c && c.id === ID) sync(); return r; };
    CH.drop = function (c) { const r = drop0.apply(this, arguments); if (c && c.id === ID) sync(); return r; }; }
  const now = () => (SP.clock ? SP.clock.min : 480);
  let phase = null;
  function tick() { const p = M.phaseKey(now()); if (phase !== null && p !== phase && W.chunksIn && W.chunksIn[ID]) { if (SP.layers && SP.layers.reset) SP.layers.reset(); if (SP.env && SP.env.invalidateLights) SP.env.invalidateLights(); } phase = p; }
  if (SP.openInterior) { const OI = SP.openInterior, up0 = OI.update; OI.update = function () { sync(); tick(); return up0.apply(this, arguments); }; }
  const E = SP.env;
  if (E && E.lights) { const lights0 = E.lights; E.lights = function () {
    const out = lights0.apply(this, arguments); if (W.interior || !(W.chunksIn && W.chunksIn[ID])) return out;
    const n = E.night || 0; if (n <= 0.01) return out; const open = M.isOpen(now());
    out.push({ x: 65.5 + DX, y: 99.6 + DY, z: 4.4, r: 3.6, c: [210, 255, 220], a: 0.6 * n, flat: false, refl: true });
    if (open) for (const bx of [48, 51.875, 55.75, 59.625, 67.5, 71.375, 75.25, 79.125]) { out.push({ x: bx + 2 + DX, y: 99.2 + DY, z: 2.2, r: 2.6, c: [255, 226, 170], a: 0.75 * n, flat: false, refl: false }); out.push({ x: bx + 2 + DX, y: 98.8 + DY, z: 0, r: 3.2, c: [255, 222, 168], a: 0.55 * n, flat: true }); }
    out.push({ x: 40 + DX, y: 107.4 + DY, z: 2.4, r: 2.6, c: [235, 245, 255], a: 0.7 * n, flat: false, refl: true });
    return out; }; }
  SP.rongqiaoMarket2 = { data: L, info, sync, tick, get registered() { return !!(SP.openInterior && SP.openInterior.get(ID)); } };
  root.RongqiaoMarket2 = SP.rongqiaoMarket2;
})(typeof window !== 'undefined' ? window : globalThis);
