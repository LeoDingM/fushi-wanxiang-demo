/* 南埠菜市场无缝进场 (2026-10-24). 第二片的瓷砖外壳拆掉，换成榕桥菜市场同一套大厅
 * （js/rongqiao_market.js 的 layout() 平移）。南门中线落在已有门洞中点 x 61.5（DX=-4），
 * 南墙落在涌南路北侧 y -204（DY=-304）。大厅往北收到 y -176，贴着南埠涌南岸人行道。
 * 不扩南界，不碰河东 x 840，不加超高层。厕所、垃圾房、货车和路障不搬，免得挡住槐北街和涌南楼。
 * 金属屋面留下，给 openInterior 掀顶。账本只开五个摊和三位街坊，其余摊位物件只是摆设。
 * 新块接在 rqe_p11_s2 后面。名字未经Leo确认。 */
(function (root) {
  'use strict';
  const D = root.SCENE_DATA, M = root.RongqiaoMarket, N = root.RONGQIAO_NORTH;
  if (!D || !M || !D.rongqiaoExpandP11b || D.rongqiaoMarketNanbu) return;
  D.rongqiaoMarketNanbu = 1;
  const ID = 'rq_market_nb', NAME = '南埠菜市场', DX = -4, DY = -304, CHUNK = [32, -212, 96, -168];
  const LIVE = new Set(['pork', 'eggs', 'fish', 'bay0', 'bay4']);
  const T = (x, y) => [+(x + DX).toFixed(3), +(y + DY).toFixed(3)];
  const TR = (r) => [r[0] + DX + 0.001, r[1] + DY + 0.001, r[2] + DX - 0.001, r[3] + DY - 0.001].map((v) => +v.toFixed(3));
  const keepXY = (x, y) => x >= 47.9 && x < 83 && y >= 98 && y <= 128.05;
  const keepRect = (r) => r[0] >= 47.9 && r[2] <= 83.02 && r[1] >= 98 && r[3] <= 128.05;
  const L0 = M.layout(), ren = (id) => String(id).replace(/^rq_market/, ID);
  const objects = L0.objects.filter((o) => keepXY(o.x, o.y)).map((o) => {
    const n = Object.assign({}, o, { id: ren(o.id) });
    [n.x, n.y] = T(o.x, o.y);
    if (n.rqStall) {
      if (LIVE.has(n.rqStall)) n.rqStall = 'm4_' + n.rqStall;
      else { delete n.rqStall; delete n.interact; delete n.reach; if (n.name) delete n.name; }
    }
    if (Array.isArray(n.reach)) n.reach = n.reach.map((p) => T(p[0], p[1]));
    if (n.fade_group === M.ID) n.fade_group = ID;
    if (n.cutaway) n.cutaway = Object.assign({}, n.cutaway, { b: ID });
    if (n.type === 'rq_mk_signboard') n.variant = 'nb';
    return n;
  });
  const base = L0.base.filter((o) => keepXY(o.x, o.y)).map((o) => {
    const n = Object.assign({}, o, { id: ren(o.id) });
    [n.x, n.y] = T(o.x, o.y);
    return n;
  });
  const colliders = L0.colliders.filter((c) => keepRect(c.rect)).map((c) => ({ id: ren(c.id), rect: TR(c.rect), solid: c.solid }));
  const gates = {};
  for (const [k, g] of Object.entries(L0.gates)) gates[k] = { x: g.x + DX, y: g.y + DY, out: T(...g.out), in: T(...g.in) };
  const L = {
    id: ID, name: NAME, rect: TR(L0.rect), objects, base, colliders,
    lights: L0.lights.filter(([x, y]) => keepXY(x, y)).map(([x, y, z, r]) => [x + DX, y + DY, z, r]),
    doors: Object.entries(gates).map(([id, g]) => Object.assign({ id }, g)),
    gates, solids: colliders.filter((c) => c.solid).map((c) => c.rect), offset: [DX, DY],
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
  for (const [r, t] of [[[48, 100, 82, 128], 'M'], [[50, 118, 62, 122], 'Q'], [[68, 118, 82, 122], 'Q']]) paint(TR(r), t);
  D.objects = D.objects.concat(base);
  root.SCENE_CHUNKS[ID] = { objects: L.objects, colliders: L.colliders.map((c) => ({ id: c.id, rect: c.rect.slice() })) };
  (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []).push({ id: ID, name: NAME, rect: CHUNK, src: 'js/rongqiao_market_nanbu.js', load_m: 40, unload_m: 80 });
  if (N) for (const r of L.solids) N.solids.push(r.slice());
  const info = {
    id: ID, name: NAME, rect: L.rect, gates, offset: [DX, DY],
    stalls: ['m4_pork', 'm4_eggs', 'm4_fish', 'm4_bay0', 'm4_bay4'], shoppers: 3, unconfirmed: true,
  };
  if (N && N.expansionP11) {
    const P = N.expansionP11;
    P.names.market = NAME;
    P.market = {
      facade: false, interior: true, seamless: true, name: NAME,
      door: gates.S.out.slice(), stalls: info.stalls, shoppers: 3,
      reason: '瓷砖外壳拆掉。南门对齐第二片留下的门洞。openInterior 掀顶，人在街景里走进去，不切场景。账本先开五个摊和三位街坊。',
    };
    P.reasons.market = P.market.reason;
    const poi = (N.mapPois || []).find((p) => p.id === 'p11_market');
    if (poi) {
      poi.name = NAME;
      poi.desc = '可以走进去的菜市场，五个摊先开着。名字未经确认';
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
      const n = E.night || 0;
      if (n <= 0.01) return out;
      out.push({ x: 65.5 + DX, y: 99.6 + DY, z: 4.4, r: 3.6, c: [210, 255, 220], a: 0.6 * n, flat: false, refl: true });
      return out;
    };
  }
  SP.rongqiaoMarketNanbu = { data: L, info, sync, tick, get registered() { return !!(SP.openInterior && SP.openInterior.get(ID)); } };
  root.RongqiaoMarketNanbu = SP.rongqiaoMarketNanbu;
})(typeof window !== 'undefined' ? window : globalThis);
