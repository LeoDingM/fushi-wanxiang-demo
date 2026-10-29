/* 南埠菜市场无缝进场 (2026-10-24，Leo 反馈后改布局).
 * 不再平移榕桥大厅。南门仍在 x 61.5 / y -204，门外点 y -205.4。
 * 门内先是约 8 m 门厅，水果和蔬菜档退到门厅北侧；鸡蛋、鲜鱼沿一条横过道，猪肉在北侧单独一档。
 * 顶棚是白铝板加珊瑚檐，柱子贴两侧，不是中轴天窗和蓝色岛柱。账本仍是 v4 的五个摊。
 * 名字和细部未经Leo确认。 */
(function (root) {
  'use strict';
  const D = root.SCENE_DATA, M = root.RongqiaoMarket, N = root.RONGQIAO_NORTH;
  if (!D || !M || !D.rongqiaoExpandP11b || D.rongqiaoMarketNanbu) return;
  D.rongqiaoMarketNanbu = 1;
  const ID = 'rq_market_nb', NAME = '南埠菜市场', RECT = [44, -204, 79, -176], CHUNK = [32, -212, 96, -168];
  const objs = [], cols = [], lights = [];
  let n = 0;
  const add = (type, x, y, role, more) => {
    const o = Object.assign({ id: ID + '_' + type.replace(/^rq_/, '') + '_' + (n++), type, x: +x.toFixed(3), y: +y.toFixed(3), z: 0, rot: 0, fade_group: ID }, more || {});
    if (role) o.cutaway = { b: ID, role };
    objs.push(o);
    return o;
  };
  const R = (id, a, b, c, d, solid) => cols.push({ id: ID + '_c_' + id, rect: [a, b, c, d], solid: !!solid });
  const deal = (sid, reach) => ({ rqStall: sid, interact: 'rq_stall', reach: [reach], name: '摊位柜台', state: 'full', rqGoods: 1 });
  add('rq_mk_bay', 46, -200.2, 'interior', { variant: 'fruit', state: 'open', rqBay: 1, rqStall: 'm4_bay0' });
  add('rq_mk_bayback', 46, -199.8, 'interior', Object.assign({ variant: 'fruit' }, deal('m4_bay0', [48.1, -194.75])));
  R('bay0', 46, -200.2, 49.9, -195.6, true);
  add('rq_mk_bay', 68, -200.2, 'interior', { variant: 'veg', state: 'open', rqBay: 1, rqStall: 'm4_bay4' });
  add('rq_mk_bayback', 68, -199.8, 'interior', Object.assign({ variant: 'veg' }, deal('m4_bay4', [70.1, -194.75])));
  R('bay4', 68, -200.2, 71.9, -195.6, true);
  add('rq_mk_stall_eggs', 50, -189.4, 'interior', deal('m4_eggs', [53, -190]));
  add('rq_mk_stallfront_eggs', 50, -189.4, 'interior', { state: 'full', rqGoods: 1, rqStall: 'm4_eggs' });
  R('eggs', 50, -188.9, 56, -185.4, true);
  add('rq_mk_stall_pork', 46, -182.85, 'interior', deal('m4_pork', [49, -178.6]));
  R('pork', 46, -182.9, 52, -179.15, true);
  add('rq_mk_ice', 66.2, -189.2, 'interior', Object.assign({ variant: 'fish' }, deal('m4_fish', [69, -189.7])));
  add('rq_mk_tanks', 66, -186.6, 'interior', { state: 'full', rqGoods: 1, rqStall: 'm4_fish' });
  R('fish', 66, -186.8, 72, -183.4, true);
  for (const [x, y] of [[44.8, -202], [77.2, -202], [44.8, -192], [77.2, -192], [44.8, -181], [77.2, -181]]) {
    add('rq_nb_col', x, y, 'interior');
    R('col' + x + '_' + y, x - 0.16, y - 0.16, x + 0.16, y + 0.16, true);
  }
  for (const x of [44, 48, 52, 56, 64, 68, 72]) add('rq_nb_wallx', x, -204, 'near');
  R('s_a', 44, -204.2, 59.4, -203.75, true);
  R('s_b', 63.6, -204.2, 79, -203.75, true);
  add('rq_nb_gate', 59.5, -204, 'near');
  add('rq_mk_signboard', 59.5, -204, 'roof', { variant: 'nb' });
  for (let y = -204; y < -176; y += 4) add('rq_nb_wally', 44, y, 'near');
  R('west', 44, -204, 44.32, -176, true);
  for (let y = -204; y < -176; y += 4) add('rq_nb_wally', 78.72, y, 'far');
  R('east', 78.68, -204, 79, -176, true);
  for (const x of [44, 48, 52, 56, 60, 64, 68, 72]) add('rq_nb_wallx', x, -176.28, 'far');
  R('north', 44, -176.35, 79, -176, true);
  for (const x of [44, 52, 60, 68]) for (const y of [-204, -197, -190, -183]) add('rq_nb_roof', x, y, 'roof', { variant: x === 52 && y === -190 ? 'vent' : 'plain' });
  for (const [x, y] of [[53, -191], [69, -191], [61.5, -199]]) { add('rq_mk_lamp', x, y, 'light'); lights.push([x, y, 2.85, 4.2]); }
  const gates = { S: { x: 61.5, y: -204, out: [61.5, -205.4], in: [61.5, -201.8] } };
  const L = {
    id: ID, name: NAME, rect: RECT.slice(), objects: objs, base: [], colliders: cols, lights,
    doors: [{ id: 'S', x: 61.5, y: -204, out: [61.5, -205.4], in: [61.5, -201.8] }],
    gates, solids: cols.filter((c) => c.solid).map((c) => c.rect),
  };
  const shell = (D.colliders || []).find((c) => c.id === 'rqp11b_mk');
  if (shell) {
    const r = shell.rect;
    if (N) N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11b_mk');
  }
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  const old = root.SCENE_CHUNKS.rqe_p11_s2;
  if (old && old.objects) {
    old.objects = old.objects.filter((o) => {
      if (/^rqp11b_mk_/.test(o.id)) return false;
      const front = o.x >= 43 && o.x <= 82 && o.y >= -207 && o.y <= -203;
      if (front && (o.type === 'rq_x_tree' || o.type === 'p_lamp')) return false;
      return true;
    });
  }
  if (N && N.expansionP11 && N.expansionP11.buildings) N.expansionP11.buildings = N.expansionP11.buildings.filter((b) => b.id !== 'rqp11b_mk');
  const G = D.ground;
  G.legend = Object.assign({}, G.legend, { F: 'rq_nb_floor' });
  const paint = (rect, t) => {
    for (let r = 0; r < G.data_south_to_north.length; r++) {
      let row = null;
      for (let c = 0; c < G.cols; c++) {
        const x = G.origin[0] + (c + 0.5) * G.chunk, y = G.origin[1] + (r + 0.5) * G.chunk;
        if (x >= rect[0] && x < rect[2] && y >= rect[1] && y < rect[3]) {
          row = row || G.data_south_to_north[r].split('');
          row[c] = t;
        }
      }
      if (row) G.data_south_to_north[r] = row.join('');
    }
  };
  paint(RECT, 'F');
  root.SCENE_CHUNKS[ID] = { objects: L.objects, colliders: L.colliders.map((c) => ({ id: c.id, rect: c.rect.slice() })) };
  (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []).push({ id: ID, name: NAME, rect: CHUNK, src: 'js/rongqiao_market_nanbu.js', load_m: 40, unload_m: 80 });
  if (N) for (const r of L.solids) N.solids.push(r.slice());
  const info = {
    id: ID, name: NAME, rect: L.rect, gates, stalls: ['m4_pork', 'm4_eggs', 'm4_fish', 'm4_bay0', 'm4_bay4'], shoppers: 3, unconfirmed: true,
  };
  if (N && N.expansionP11) {
    const P = N.expansionP11;
    P.names.market = NAME;
    P.market = {
      facade: false, interior: true, seamless: true, name: NAME,
      door: gates.S.out.slice(), stalls: info.stalls, shoppers: 3,
      reason: '南门仍对齐原来的门洞。不克隆榕桥大厅：白铝顶棚、贴墙细柱、门厅进深约 8 m，五个摊分开排。openInterior 掀顶，人在街景里走进去。',
    };
    P.reasons.market = P.market.reason;
    const poi = (N.mapPois || []).find((p) => p.id === 'p11_market');
    if (poi) {
      poi.name = NAME;
      poi.desc = '可以走进去的菜市场，白铝顶棚，和榕桥大厅不是同一套。名字未经确认';
    }
  }
  const SP = root.SP;
  if (!SP || !SP.world) { root.RongqiaoMarketNanbu = { data: L, info }; return; }
  const W = SP.world;
  function sync() {
    const OI = SP.openInterior;
    if (!OI || W.interior) return false;
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
  const now = () => (SP.clock ? SP.clock.min : 480);
  let phase = null;
  function tick() {
    const p = M.phaseKey(now());
    if (phase !== null && p !== phase && W.chunksIn && W.chunksIn[ID]) {
      if (SP.layers && SP.layers.reset) SP.layers.reset();
      if (SP.env && SP.env.invalidateLights) SP.env.invalidateLights();
    }
    phase = p;
  }
  if (SP.openInterior) {
    const OI = SP.openInterior, up0 = OI.update;
    OI.update = function () { sync(); tick(); return up0.apply(this, arguments); };
  }
  const E = SP.env;
  if (E && E.lights) {
    const lights0 = E.lights;
    E.lights = function () {
      const out = lights0.apply(this, arguments);
      if (W.interior || !(W.chunksIn && W.chunksIn[ID])) return out;
      const night = E.night || 0;
      if (night <= 0.01) return out;
      out.push({ x: 61.5, y: -205.2, z: 4.2, r: 3.6, c: [255, 186, 160], a: 0.6 * night, flat: false, refl: true });
      return out;
    };
  }
  SP.rongqiaoMarketNanbu = { data: L, info, sync, tick, get registered() { return !!(SP.openInterior && SP.openInterior.get(ID)); } };
  root.RongqiaoMarketNanbu = SP.rongqiaoMarketNanbu;
})(typeof window !== 'undefined' ? window : globalThis);
