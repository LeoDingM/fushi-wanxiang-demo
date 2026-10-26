/* 月河区 · 河东渔港 (Site141). 南堤之外、澜海南汊再往南，到 y-220 的渔港和滨海南岸。
 * 南汊水面留着，南北路用硬地栈桥接过水面。西端月河口旁是渔村老街（景区），东端滨海步道沿 x1750 续到岸线。
 * 帆脊酒店是 15 层米白石材帆脊，平面 6×3，不是已有的金框板、叠台或浅进深宽板。住宅和铺面把街块排满。
 * 不做 438 m 塔。名字和层数未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10k || D.rongqiaoExpandP10l || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10l = 1;
  const G = D.ground, CH = root.SCENE_CHUNKS || {};
  const NS = [[408, 424], [468, 484], [602, 618], [856, 872], [1024, 1040], [1368, 1384], [1520, 1536], [1688, 1704]];
  const Y0 = -220, Y_WATER0 = -100, Y_WATER1 = -80;
  function paint(rect, tile, fn) {
    const [ox, oy] = G.origin, ch = G.chunk;
    const c0 = Math.max(0, Math.floor((rect[0] - ox) / ch)), c1 = Math.min(G.cols, Math.ceil((rect[2] - ox) / ch));
    const r0 = Math.max(0, Math.floor((rect[1] - oy) / ch)), r1 = Math.min(G.rows, Math.ceil((rect[3] - oy) / ch));
    for (let r = r0; r < r1; r++) {
      const a = G.data_south_to_north[r].split('');
      for (let c = c0; c < c1; c++) {
        const x = ox + (c + 0.5) * ch, y = oy + (r + 0.5) * ch;
        if (x >= rect[0] && x < rect[2] && y >= rect[1] && y < rect[3]) {
          const t = fn ? fn(x, y) : tile;
          if (t) a[c] = t;
        }
      }
      G.data_south_to_north[r] = a.join('');
    }
  }
  const road = (x) => ((Math.round(x * 3) % 5) < 3 ? 'A' : 'B');
  const seaTile = (x, y) => (Math.round(x + y) % 7 === 0 ? 'U' : (Math.round(x) % 2 ? 'V' : 'W'));
  const solids = [], colliders = [];
  function dropSolid(rect) {
    N.solids = (N.solids || []).filter((s) => !(s[0] === rect[0] && s[1] === rect[1] && s[2] === rect[2] && s[3] === rect[3]));
  }
  function dropId(id) {
    for (const c of (D.colliders || []).filter((x) => x.id === id || String(x.id).indexOf(id + '_') === 0)) dropSolid(c.rect);
    D.colliders = (D.colliders || []).filter((x) => x.id !== id && String(x.id).indexOf(id + '_') !== 0);
  }
  function retarget(id, fn) {
    const c = (D.colliders || []).find((x) => x.id === id);
    if (!c) return;
    dropSolid(c.rect);
    fn(c.rect);
    N.solids.push(c.rect.slice());
  }
  dropId('rqe_p10_south_sea');
  dropId('rqe_p10b_south');
  /* 第十三片把南汊整段封成 rqe_p10_south_1，栈桥穿不过去。水面改由下面的缺口碰撞体挡住。 */
  for (const c of (D.colliders || []).filter((x) => x.id === 'rqe_p10_south_1')) dropSolid(c.rect);
  D.colliders = (D.colliders || []).filter((x) => x.id !== 'rqe_p10_south_1');
  retarget('rqe_p10_sea', (r) => { r[1] = -260; r[3] = 432; });
  retarget('rqe_p10_east', (r) => { r[1] = Math.min(r[1], Y0); });
  /* 南埠封口原来盖到 x940，压住新开的渔港和栈桥。封口收到河东西界 x356。 */
  for (const id of ['rqp11_east', 'rqp11_belt_e']) {
    const c = (D.colliders || []).find((x) => x.id === id);
    if (!c || c.rect[2] <= 356) continue;
    dropSolid(c.rect);
    c.rect[2] = 356;
    N.solids.push(c.rect.slice());
  }
  const gaps = [];
  let gx = 356;
  for (const [a, b] of NS) {
    if (a > gx) gaps.push([gx, Y_WATER0, a, Y_WATER1]);
    gx = b;
  }
  if (gx < 1724) gaps.push([gx, Y_WATER0, 1724, Y_WATER1]);
  gaps.forEach((r, i) => { solids.push(r.slice()); colliders.push({ id: i ? 'rqe_p10_south_sea_' + i : 'rqe_p10_south_sea', rect: r.slice() }); });
  const SOUTH_SEA = [356, -260, 1724, Y0];
  solids.push(SOUTH_SEA.slice()); colliders.push({ id: 'rqe_p10_mouth_sea', rect: SOUTH_SEA.slice() });
  const BASIN = [1040, -186, 1248, -168];
  const INLET = [356, -220, 404, -196];
  solids.push(BASIN.slice()); colliders.push({ id: 'rqe_p10_harbor', rect: BASIN.slice() });
  solids.push(INLET.slice()); colliders.push({ id: 'rqe_p10_estuary_mouth', rect: INLET.slice() });

  paint([356, Y0, 1724, Y_WATER0], 'S');
  paint([1704, Y0, 1724, 64], 'S');
  paint([1724, -260, 1770, 64], null, seaTile);
  paint(SOUTH_SEA, null, seaTile);
  const OLD_STREET = [376, -214, 560, -112];
  paint(OLD_STREET, 'G');
  paint([392, -208, 548, -204], 'S');
  paint([392, -176, 548, -172], 'S');
  paint([392, -140, 548, -136], 'S');
  paint([420, -214, 436, -112], 'S');
  function paintNS(x0, y0, y1) {
    paint([x0, y0, x0 + 3.5, y1], 'S');
    paint([x0 + 3.5, y0, x0 + 12.5, y1], null, road);
    paint([x0 + 12.5, y0, x0 + 16, y1], 'S');
  }
  function paintEW(y0, x0, x1) {
    paint([x0, y0, x1, y0 + 3.5], 'S');
    paint([x0, y0 + 3.5, x1, y0 + 12.5], null, road);
    paint([x0, y0 + 12.5, x1, y0 + 16], 'S');
  }
  for (const [x0] of NS) {
    paintNS(x0, Y0, -64);
    paint([x0, Y_WATER0, x0 + 16, Y_WATER1], 'S');
    paint([x0 + 3.5, Y_WATER0, x0 + 12.5, Y_WATER1], null, road);
  }
  paintEW(-208, 356, 1724);
  paintEW(-144, 356, 1724);
  for (const [x0] of NS) {
    paint([x0 + 3.5, -204.5, x0 + 12.5, -195.5], null, road);
    paint([x0 + 3.5, -140.5, x0 + 12.5, -131.5], null, road);
  }
  paint([356, -220, 1724, -208], 'S');
  paint([356, -112, 1724, -100], 'S');
  paint(BASIN, null, seaTile);
  paint(INLET, null, seaTile);

  const list = [];
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10m_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    list.push(o);
    return o;
  }
  function faceOf(spec, f, F, side, b) {
    const sign = (spec.signs || []).find((s) => s.face === side && s.floor === f && s.bay === b);
    if (sign) return { variant: 'hd_g_sign', hdGlass: 1, sign: sign.text, forceGround: 1 };
    const st = spec.st || {};
    if (f <= (st.podium || 1)) return { variant: 'hd_stone' };
    if (st.crownStone && f > F - st.crownStone) return { variant: 'hd_stone' };
    if (st.beltEvery && f > (st.podium || 1) && f % st.beltEvery === 0) return { variant: 'hd_stone' };
    return { variant: spec.glass || 'hd_g_hd', hdGlass: 1 };
  }
  function bayPlan(spec, f, F, x) {
    const m = spec.mass, st = spec.st || {};
    const podium = st.podium || 3;
    const setback = st.setbackTop || 0;
    if (f <= podium) return { nS: m.podiumNS, xS: x, nW: m.podiumNW, xW: x };
    if (setback && f > F - setback) {
      const cOff = (m.towerOff || 0) + Math.floor((m.towerNS - m.crownNS) / 2);
      return { nS: m.crownNS, xS: x + cOff * 3, nW: m.crownNW, xW: x + cOff * 3 };
    }
    if (m.midFromTop && f > F - m.midFromTop) {
      const mOff = (m.towerOff || 0) + Math.floor((m.towerNS - m.midNS) / 2);
      return { nS: m.midNS, xS: x + mOff * 3, nW: m.midNW, xW: x + mOff * 3 };
    }
    return { nS: m.towerNS, xS: x + (m.towerOff || 0) * 3, nW: m.towerNW, xW: x + (m.towerOff || 0) * 3 };
  }
  const built = [];
  function block(id, rect) { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); }
  function remember(spec, parts) {
    const m = spec.mass, fg = 'rqe_p10m_' + spec.id;
    const W = m.podiumNS * 3, Dp = m.podiumNW * 3;
    for (const r of parts) block(fg + '_' + r[0] + '_' + r[1], r);
    built.push({
      id: fg, name: spec.name, x0: spec.x, y0: spec.y, W, D: Dp, F: m.F, floors: m.F,
      kind: spec.kind || 'work', form: spec.form || '', family: spec.family || '', glass: spec.glass || '',
      plate: spec.plate || (m.towerNS + 'x' + m.towerNW),
      parts: parts.map((r) => r.slice()),
    });
  }
  function buildMass(spec) {
    const m = spec.mass, st = spec.st, F = m.F, fg = 'rqe_p10m_' + spec.id, x = spec.x, y = spec.y;
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3;
      const plan = bayPlan(spec, f, F, x);
      for (let b = 0; b < plan.nS; b++) {
        const face = faceOf(spec, f, F, 'S', b);
        const more = { z, state: face.forceGround || f === 1 ? 'ground' : 'upper', fade_group: fg, variant: face.variant };
        if (face.hdGlass) more.hdGlass = 1;
        if (face.sign) more.sign = face.sign;
        if (more.hdGlass && more.state === 'upper') more.night_lit = (f + b) % 4 !== 0 ? 1 : 0;
        put(spec.id + '_S' + f + '_' + b, 'f_wall', plan.xS + b * 3, y, more);
      }
      for (let b = 0; b < plan.nW; b++) {
        const face = faceOf(spec, f, F, 'W', b);
        const more = { z, rot: 6, state: face.forceGround || f === 1 ? 'ground' : 'upper', fade_group: fg, variant: face.variant };
        if (face.hdGlass) more.hdGlass = 1;
        if (face.sign) more.sign = face.sign;
        if (more.hdGlass && more.state === 'upper') more.night_lit = (f * 3 + b) % 4 !== 0 ? 1 : 0;
        put(spec.id + '_W' + f + '_' + b, 'f_wall', plan.xW, y + 3 + b * 3, more);
      }
    }
    root.hedongRoofTower(put, spec, m, st, x, y, fg);
    remember(spec, [[x, y, x + m.podiumNS * 3, y + m.podiumNW * 3]]);
  }
  function box(s) {
    buildMass({
      id: s.id, name: s.name, x: s.x, y: s.y, kind: s.kind, glass: s.glass, family: s.family || '', signs: s.signs,
      form: s.form || '整板', plate: s.nS + 'x' + s.nW,
      st: { podium: s.podium == null ? 1 : s.podium, setbackTop: 0, crownStone: 0, beltEvery: 0 },
      mass: {
        F: s.F, podiumNS: s.nS, podiumNW: s.nW, towerNS: s.nS, towerNW: s.nW, towerOff: 0,
        midFromTop: 0, midNS: s.nS, midNW: s.nW, crownNS: s.nS, crownNW: s.nW,
      },
    });
  }
  /* 帆脊酒店 15 层，塔身 6×3，约 45 m。米白石材横带，不是 438 m，也不跟河口中心、望海酒店同板。 */
  buildMass({
    id: 'sail', name: '帆脊酒店', x: 1400, y: -186, kind: 'hotel', glass: 'hd_g_qp', form: '帆脊', family: '米白石材', plate: '6x3',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '帆脊酒店' }],
    st: { podium: 2, setbackTop: 4, crownStone: 2, beltEvery: 4 },
    mass: { F: 15, podiumNS: 8, podiumNW: 4, towerNS: 6, towerNW: 3, towerOff: 1, midFromTop: 5, midNS: 5, midNW: 3, crownNS: 3, crownNW: 2 },
  });
  box({ id: 'mk', name: '渔港菜场', x: 700, y: -186, nS: 6, nW: 3, F: 2, podium: 1, glass: 'hd_g_yx', kind: 'market', family: '淡蓝中透', signs: [{ face: 'S', floor: 1, bay: 2, text: '渔港菜场' }] });
  const reserved = [OLD_STREET.slice(), BASIN.slice(), INLET.slice(), [1396, -190, 1428, -170], [696, -190, 722, -174]];
  const hitsX = (x0, x1) => NS.some(([a, b]) => x0 < b && x1 > a);
  const hitsR = (rect) => reserved.some((r) => rect[0] < r[2] && rect[2] > r[0] && rect[1] < r[3] && rect[3] > r[1]);
  const GLASS = ['hd_g_yl2', 'hd_g_hd', 'hd_g_ls', 'hd_g_dl', 'hd_g_sl', 'hd_g_wm'];
  const FS = [3, 4, 3, 5];
  const HOMES = ['渔港里', '帆影居', '网寮里', '潮声居', '月湾里'];
  const SHOPS = ['渔港面馆', '网寮杂货', '潮声茶铺', '帆影花店', '岸口文具'];
  let seq = 0;
  function fillSpan(x0, x1, y, nW) {
    let x = x0, guard = 0;
    while (x + 15 <= x1 && guard++ < 120) {
      const nS = 5 + (seq % 3);
      const w = nS * 3;
      if (x + w > x1) break;
      const rect = [x, y, x + w, y + nW * 3];
      if (hitsX(rect[0] - 0.8, rect[2] + 0.8) || hitsR(rect)) { x += 3; continue; }
      const i = seq++;
      const shop = i % 5 === 0;
      const name = shop ? SHOPS[i % SHOPS.length] : HOMES[i % HOMES.length];
      box({
        id: 'h' + i, name, x, y, nS, nW, F: shop ? 2 : FS[i % FS.length], podium: 1,
        glass: GLASS[i % GLASS.length], kind: shop ? 'shop' : 'home', family: shop ? '沿街铺' : '渔港住宅',
        signs: [{ face: 'S', floor: 1, bay: 0, text: name }],
      });
      x += w + 4;
    }
  }
  const spans = [];
  let prev = 568;
  for (const [a, b] of NS) {
    if (a > 560 && a - 1.2 >= prev + 15) spans.push([prev, a - 1.2]);
    if (b + 1.2 > prev) prev = b + 1.2;
  }
  if (1686 >= prev + 15) spans.push([prev, 1686]);
  for (const [x0, x1] of spans) {
    fillSpan(x0, x1, -186, 3);
    fillSpan(x0, x1, -158, 3);
    fillSpan(x0, x1, -122, 3);
  }

  const inNs = (x) => NS.some(([a, b]) => x >= a - 0.4 && x <= b + 0.4);
  function tree(x, y, variant) { put('tr_' + variant + '_' + x + '_' + y, 'rq_x_tree', x, y, { variant, fade_group: 'rqe_p10m_tree' }); }
  for (let x = 420; x <= 1688; x += 28) {
    if (inNs(x) || (x > 1036 && x < 1252) || (x > 1394 && x < 1430)) continue;
    tree(x, -214.2, x % 56 < 28 ? 'ginkgo' : 'sakura');
    tree(x, -108.4, 'ginkgo');
  }
  for (let x = 400; x <= 1680; x += 32) {
    if (inNs(x)) continue;
    put('lamp_q_' + x, 'p_lamp', x, -216, { interact: 'lamp' });
    put('lamp_n_' + x, 'p_lamp', x, -110, { interact: 'lamp' });
  }
  const feet = built.flatMap((b) => b.parts);
  const hit = (o, rect, pad) => o.x > rect[0] - pad && o.x < rect[2] + pad && o.y > rect[1] - pad && o.y < rect[3] + pad;
  const propHit = (o) => {
    if (!o) return false;
    const pad = o.type === 'rq_x_tree' ? 2.2 : (o.type === 'p_lamp' || o.type === 'community_bench' ? 0.5 : 0);
    if (!pad) return false;
    return feet.some((f) => hit(o, f, pad));
  };
  const kept = list.filter((o) => !propHit(o));
  list.length = 0;
  for (const o of kept) list.push(o);
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  if (N.water) {
    N.water = N.water.filter((w) => !(w[0] === 356 && w[1] === -100 && w[2] === 1724 && w[3] === -80));
    for (const w of N.water) if (w[0] === 1724) { w[1] = -260; w[3] = 432; }
    N.water.push(SOUTH_SEA.slice(), BASIN.slice(), INLET.slice());
    for (const g of gaps) N.water.push(g.slice());
  }
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p10_e12 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p10_e12', name: '河东渔港', rect: [280, -280, 1860, -40], src: 'js/rongqiao_expand_p10l.js', load_m: 40, unload_m: 80 });

  const P = N.expansionP10;
  P.slice = 14;
  P.district = [356, Y0, 1750, P.district[3]];
  for (const key of ['secondary', 'cross', 'cross2', 'cross3', 'cross4', 'cross5', 'cross6', 'cross7']) {
    const r = P[key];
    if (r) P[key] = [r[0], Y0, r[2], r[3]];
  }
  P.names.harborRoad = '渔港路';
  P.names.oldStreetRoad = '老街路';
  P.harborRoad = [356, -208, 1724, -192];
  P.oldStreetRoad = [356, -144, 1724, -128];
  const towers = built.filter((b) => (b.kind === 'work' || b.kind === 'hotel') && b.F >= 10);
  P.south14 = { unconfirmed: true, south: [Y0, -80], basin: BASIN.slice(), inlet: INLET.slice(), oldStreet: OLD_STREET.slice(), cap: 120, buildings: built, towers };
  const keep = [OLD_STREET.slice(), BASIN.slice(), INLET.slice(), SOUTH_SEA.slice(), [356, -220, 1724, -208], [356, -112, 1724, -100], [1704, Y0, 1724, 378], [1724, -260, 1770, 432]];
  P.keepLots = (P.keepLots || []).concat(keep);
  P.reasons.south14 = '第十四片：河东从南堤再往南收到 y-220，接到月河口和澜海。澜海南汊还在 y-100 到 y-80，南北次干用栈桥过水面，渔港路（y-208–-192）和老街路（y-144–-128）是东西向 16 m 路。西端渔村老街是景区，月河口是一小段水面。渔港是内港。帆脊酒店 15 层帆脊（米白石材，塔身 6×3，约 45 m），跟河口中心的金框板、望海酒店的叠台都不同，也不是 438 m。渔港菜场是 2 层。住宅和铺面把其余街块排满。滨海步道沿 x1750 向南续到岸线。新块 rqe_p10_e12 懒加载，载入距离 40 m。分块上限仍是 120。南埠仍停在 y-1540。名字和尺寸未经确认。';
  for (const lab of N.mapLabels || []) {
    if (lab.name === '澜海' && lab.rect) lab.rect = [1724, -260, 1770, 432];
    if (lab.name === '滨海步道' && lab.rect) { lab.rect[1] = Y0; lab.rect[3] = Math.max(lab.rect[3], 378); }
  }
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '渔港路', rect: P.harborRoad.slice(), kind: 'road', prio: 1 },
    { name: '老街路', rect: P.oldStreetRoad.slice(), kind: 'road', prio: 1 },
    { name: '渔村老街', rect: OLD_STREET.slice(), kind: 'park', prio: 2 },
    { name: '渔港', rect: BASIN.slice(), kind: 'water', prio: 2 },
    { name: '月河口', rect: INLET.slice(), kind: 'water', prio: 2 },
    { name: '滨海南岸', rect: [356, -220, 1724, -208], kind: 'park', prio: 1 },
  ]);
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_sail', name: '帆脊酒店', x: 1412, y: -194, desc: '15 层米白石材帆脊。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_harbor_mk', name: '渔港菜场', x: 708, y: -194, desc: '2 层菜场外壳。没有室内。名字未经确认', cat: 'shop' },
    { id: 'p10_old_st', name: '渔村老街', x: 430, y: -176, desc: '月河口旁的渔村老街。景区。名字未经确认', cat: 'life' },
    { id: 'p10_harbor', name: '渔港', x: 1100, y: -214, desc: '内港水面。岸线未经确认', cat: 'life' },
    { id: 'p10_mouth', name: '月河口', x: 430, y: -214, desc: '渔村老街南侧的河口。岸线未经确认', cat: 'life' },
    { id: 'p10_quay', name: '滨海南岸', x: 800, y: -214, desc: '渔港南侧步道。名字未经确认', cat: 'park' },
  ]);
})();
