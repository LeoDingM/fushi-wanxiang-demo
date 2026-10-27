/* 月河区 · 河东南堤 (2026-10-26). 接在望山之后，向南约 144 m，到 y-80。
 * 河口路、月津路和南堤把南北次干收到水边。澜石南街以北的路网不断，也不往南埠的 y-1540 推。
 * 混合街区：河口中心（淡金金框板）和望海酒店（蓝灰渐变叠台）两栋不克隆的塔，加上住宅、社康、广场和南堤。
 * 街块排满房子、停车楼、球场和硬地，不留大片空地。南汊水面和南堤是景区。
 * 新块接在望山后面。不做 438 m 塔。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10j || D.rongqiaoExpandP10k || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10k = 1;
  const G = D.ground, CH = root.SCENE_CHUNKS || {};
  const NS = [[408, 424], [468, 484], [602, 618], [856, 872], [1024, 1040], [1368, 1384], [1520, 1536], [1688, 1704]];
  const YS = -80;
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
  const solids = [], colliders = [];
  function dropSolid(rect) {
    N.solids = (N.solids || []).filter((s) => !(s[0] === rect[0] && s[1] === rect[1] && s[2] === rect[2] && s[3] === rect[3]));
  }
  function replaceSolid(id, rects) {
    const c = (D.colliders || []).find((x) => x.id === id);
    if (!c) return;
    dropSolid(c.rect);
    D.colliders = D.colliders.filter((x) => x.id !== id);
    rects.forEach((r, i) => {
      solids.push(r.slice());
      colliders.push({ id: i ? id + '_' + i : id, rect: r.slice() });
    });
  }
  function retarget(id, fn) {
    const c = (D.colliders || []).find((x) => x.id === id);
    if (!c) return;
    const old = c.rect.slice();
    dropSolid(old);
    fn(c.rect);
    N.solids.push(c.rect.slice());
  }
  const south = (D.colliders || []).find((c) => c.id === 'rqe_p10_south');
  if (south) replaceSolid('rqe_p10_south', [[south.rect[0], south.rect[1], 356, south.rect[3]], [356, south.rect[1], south.rect[2], YS]]);
  retarget('rqe_p10b_south', (r) => { r[3] = YS; });
  retarget('rqe_p10_sea', (r) => { r[1] = -100; });
  retarget('rqe_p10_east', (r) => { r[1] = Math.min(r[1], YS); });
  const SEA = [356, -100, 1724, YS];
  function blockSea() { solids.push(SEA.slice()); colliders.push({ id: 'rqe_p10_south_sea', rect: SEA.slice() }); }
  blockSea();

  paint([356, YS, 1724, 64], 'S');
  paint([356, -14, 1688, 14], 'C');
  paint([1420, 38, 1500, 60], 'S');
  paint([1432, 42, 1488, 54], 'G');
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
  for (const [x0] of NS) paintNS(x0, -64, 64);
  paint([356, YS, 1724, -64], 'S');
  paintEW(-48, 356, 1724);
  paintEW(16, 356, 1724);
  for (const [x0] of NS) {
    paint([x0 + 3.5, -44.5, x0 + 12.5, -35.5], null, road);
    paint([x0 + 3.5, 19.5, x0 + 12.5, 28.5], null, road);
    paint([x0 + 3.5, -64, x0 + 12.5, -68], 'S');
  }
  const seaTile = (x, y) => (Math.round(x + y) % 7 === 0 ? 'U' : (Math.round(x) % 2 ? 'V' : 'W'));
  paint(SEA, null, seaTile);
  paint([1724, -100, 1770, 64], null, seaTile);
  /* 大道北侧、堤岸公园以南的剩草坪改成硬地院子，避开已命名的广场草坪。 */
  paint([700, 184, 854, 192], 'S');
  paint([788, 158, 854, 184], 'S');
  const inNsS = (x0) => {
    paint([x0 + 3.5, 158, x0 + 12.5, 192], null, road);
  };
  for (const [x0] of NS) if (x0 + 12.5 > 700 && x0 < 854) inNsS(x0);

  const list = [];
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10l_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
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
    const m = spec.mass, fg = 'rqe_p10l_' + spec.id;
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
    const m = spec.mass, st = spec.st, F = m.F, fg = 'rqe_p10l_' + spec.id, x = spec.x, y = spec.y;
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
  /* 河口中心 21 层淡金金框板，约 63 m。望海酒店 18 层蓝灰渐变叠台，约 54 m。都不是 438 m。 */
  buildMass({
    id: 'hk', name: '河口中心', x: 1544, y: -62, kind: 'work', glass: 'hd_g_yl', form: '金框板', family: '淡金', plate: '8x2',
    signs: [{ face: 'S', floor: 1, bay: 3, text: '河口中心' }],
    st: { podium: 3, setbackTop: 3, crownStone: 1, beltEvery: 0 },
    mass: { F: 21, podiumNS: 10, podiumNW: 4, towerNS: 8, towerNW: 2, towerOff: 1, midFromTop: 6, midNS: 6, midNW: 2, crownNS: 4, crownNW: 2 },
  });
  buildMass({
    id: 'wh', name: '望海酒店', x: 1600, y: -30, kind: 'hotel', glass: 'hd_g_cj', form: '叠台', family: '蓝灰渐变', plate: '5x5',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '望海酒店' }],
    st: { podium: 3, setbackTop: 3, crownStone: 1, beltEvery: 0 },
    mass: { F: 18, podiumNS: 7, podiumNW: 6, towerNS: 5, towerNW: 5, towerOff: 1, midFromTop: 6, midNS: 4, midNW: 4, crownNS: 3, crownNW: 3 },
  });
  box({ id: 'sk', name: '河口社康', x: 1336, y: 36, nS: 6, nW: 4, F: 3, podium: 1, glass: 'hd_g_ls', kind: 'clinic', family: '深蓝低透', signs: [{ face: 'S', floor: 2, bay: 2, text: '河口社康' }] });
  const reserved = [[1540, -66, 1578, -46], [1596, -34, 1626, -8], [1332, 34, 1358, 52], [1416, 34, 1504, 62]];
  const hitsX = (x0, x1) => NS.some(([a, b]) => x0 < b && x1 > a);
  const hitsR = (rect) => reserved.some((r) => rect[0] < r[2] && rect[2] > r[0] && rect[1] < r[3] && rect[3] > r[1]);
  const GLASS = ['hd_g_yl2', 'hd_g_hd', 'hd_g_yx', 'hd_g_dl', 'hd_g_sl', 'hd_g_qp'];
  const FS = [3, 4, 3, 4];
  const HOMES = ['河口里', '望海里', '月津居', '南堤里', '澜南居'];
  const SHOPS = ['河口面馆', '南堤菜店', '月津文具', '望海花店', '堤口茶铺'];
  let seq = 0;
  function fillSpan(x0, x1, y, nW) {
    let x = x0, guard = 0;
    while (x + 15 <= x1 && guard++ < 80) {
      const nS = 5 + (seq % 3);
      const w = nS * 3;
      if (x + w > x1) break;
      const rect = [x, y, x + w, y + nW * 3];
      if (hitsX(rect[0] - 0.6, rect[2] + 0.6) || hitsR(rect)) { x += 3; continue; }
      const i = seq++;
      const shop = i % 6 === 0;
      const name = shop ? SHOPS[i % SHOPS.length] : HOMES[i % HOMES.length];
      box({
        id: 'h' + i, name, x, y, nS, nW, F: shop ? 2 : FS[i % FS.length], podium: 1,
        glass: GLASS[i % GLASS.length], kind: shop ? 'shop' : 'home', family: '南住宅',
        signs: [{ face: 'S', floor: 1, bay: 0, text: name }],
      });
      x += w + 40;
    }
  }
  const spans = [];
  let prev = 361.2;
  for (const [a, b] of NS) {
    if (a - 1.2 >= prev + 15) spans.push([prev, a - 1.2]);
    prev = b + 1.2;
  }
  if (1686 >= prev + 15) spans.push([prev, 1686]);
  for (const [x0, x1] of spans) fillSpan(x0, x1, -62, 3);
  for (const [x, name] of [[640, '月津面馆'], [900, '南堤菜店'], [1100, '望海花店'], [1200, '堤口茶铺'], [1660, '澜南文具']]) {
    box({ id: 'sh' + x, name, x, y: 36, nS: 5, nW: 3, F: 2, podium: 1, glass: 'hd_g_yx', kind: 'shop', family: '沿街铺', signs: [{ face: 'S', floor: 1, bay: 1, text: name }] });
  }
  for (const x of [430, 520, 700, 940, 1100, 1440, 1660]) {
    box({ id: 'pk' + x, name: '月津停车楼', x, y: -10, nS: 5, nW: 3, F: 2, podium: 1, glass: 'hd_g_hd', kind: 'parking', family: '淡灰中透', signs: [{ face: 'S', floor: 1, bay: 1, text: '月津停车楼' }] });
  }

  const inNs = (x) => NS.some(([a, b]) => x >= a - 0.4 && x <= b + 0.4);
  function tree(x, y, variant) { put('tr_' + variant + '_' + x + '_' + y, 'rq_x_tree', x, y, { variant, fade_group: 'rqe_p10l_tree' }); }
  for (let x = 368; x <= 1700; x += 32) {
    if (inNs(x)) continue;
    tree(x, -66.4, 'ginkgo'); tree(x, 17.6, 'ginkgo'); tree(x, 34.2, 'sakura');
  }
  for (const [x, y] of [[1448, 48], [1472, 46], [1456, 50], [1712, -72], [1712, -20], [1712, 40]]) tree(x, y, 'sakura');
  for (let x = 376; x <= 1688; x += 28) {
    if (inNs(x)) continue;
    put('lamp_l_' + x, 'p_lamp', x, -70, { interact: 'lamp' });
    put('lamp_e_' + x, 'p_lamp', x, -46.6, { interact: 'lamp' });
    put('lamp_m_' + x, 'p_lamp', x, 18.2, { interact: 'lamp' });
  }
  for (const [x, y] of [[1440, 48], [1476, 48], [1710, -70], [600, -70]]) put('bench_' + x + '_' + y, 'community_bench', x, y, { rot: 0 });

  const feet = built.flatMap((b) => b.parts);
  const hit = (o, rect, pad) => o.x > rect[0] - pad && o.x < rect[2] + pad && o.y > rect[1] - pad && o.y < rect[3] + pad;
  const propHit = (o) => {
    if (!o) return false;
    const pad = o.type === 'rq_x_tree' ? 2.2 : (o.type === 'p_lamp' || o.type === 'p_hedge' || o.type === 'community_bench' ? 0.5 : 0);
    if (!pad) return false;
    return feet.some((f) => hit(o, f, pad));
  };
  const kept = list.filter((o) => !propHit(o));
  list.length = 0;
  for (const o of kept) list.push(o);
  for (const ch of Object.values(CH)) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => !propHit(o));
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  if (N.water) N.water.push(SEA.slice());
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p10_e11 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p10_e11', name: '河东南堤', rect: [280, -140, 1860, 100], src: 'js/rongqiao_expand_p10k.js', load_m: 40, unload_m: 80 });

  const P = N.expansionP10;
  const YN = 356;
  P.slice = 13;
  P.district = [356, YS, 1750, 378];
  for (const key of ['secondary', 'cross', 'cross2', 'cross3', 'cross4', 'cross5', 'cross6', 'cross7']) {
    const r = P[key];
    if (r) P[key] = [r[0], YS, r[2], YN];
  }
  P.names.estuary = '河口路';
  P.names.southCross = '月津路';
  P.names.levee = '南堤步道';
  P.estuary = [356, -48, 1724, -32];
  P.southCross = [356, 16, 1724, 32];
  P.levee = [356, YS, 1724, -64];
  const plaza = [1420, 38, 1500, 60];
  const towers = built.filter((b) => (b.kind === 'work' || b.kind === 'hotel') && b.F >= 16);
  P.south13 = {
    unconfirmed: true,
    south: [YS, 64],
    plaza, levee: P.levee.slice(), sea: SEA.slice(),
    cap: 120,
    buildings: built,
    towers,
  };
  const keep = [
    [356, 192, 1750, 234],
    [726, 82, 850, 128],
    [530, 164, 598, 188],
    [1172, 100, 1272, 128],
    [1310, 100, 1360, 128],
    [1612, 116, 1640, 128],
    [1104, 266, 1288, 346],
    [486, 266, 592, 346],
    [356, 356, 1724, 378],
    [1704, 64, 1724, 378],
    [1724, -100, 1770, 390],
    P.levee.slice(),
    SEA.slice(),
    plaza.slice(),
  ];
  if (P.north12) keep.push(P.north12.park, P.north12.school, P.north12.hill);
  P.keepLots = keep;
  P.reasons.south13 = '第十三片：河东向南收到 y-80（约 +144 m），南埠仍停在 y-1540。河口路（y-48–-32）和月津路（y16–32）是东西向 16 m 路，南堤步道贴着澜海南汊。南北次干从山径一直铺到南堤，没有断头路。河口中心 21 层金框板（淡金，塔身 8×2，约 63 m），望海酒店 18 层叠台（蓝灰渐变，塔身 5×5，约 54 m）。两栋的层数、平面和材料不同，也不跟已有塔楼同高同板，都不是 438 m。河口社康是 3 层深蓝低透外壳，没有室内。河口广场、住宅、铺面和月津停车楼把街块排满。南汊和南堤是景区。总图收到 [356, -80, 1750, 378]。新块 rqe_p10_e10、rqe_p10_e11 懒加载，载入距离 40 m。分块状态袋上限仍是 120，整图 84 块。不南扩。名字和尺寸未经确认。';
  if (N.water) for (const w of N.water) if (w[0] === 1724) w[1] = -100;
  for (const lab of N.mapLabels || []) if (lab.name === '澜海' && lab.rect) lab.rect[1] = -100;
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '河口路', rect: P.estuary.slice(), kind: 'road', prio: 1 },
    { name: '月津路', rect: P.southCross.slice(), kind: 'road', prio: 1 },
    { name: '南堤步道', rect: P.levee.slice(), kind: 'park', prio: 1 },
    { name: '澜海南汊', rect: SEA.slice(), kind: 'water', prio: 2 },
    { name: '河口广场', rect: plaza.slice(), kind: 'park', prio: 1 },
    { name: '河口社康', rect: [1336, 36, 1354, 48], kind: 'life', prio: 1 },
  ]);
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_s_hk', name: '河口中心', x: 1556, y: -66, desc: '21 层淡金金框板。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_s_wh', name: '望海酒店', x: 1610, y: -34, desc: '18 层叠台酒店。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_s_sk', name: '河口社康', x: 1344, y: 32, desc: '3 层社康外壳。没有室内。名字未经确认', cat: 'life' },
    { id: 'p10_s_pl', name: '河口广场', x: 1460, y: 48, desc: '月津路北侧的硬地广场。名字未经确认', cat: 'park' },
    { id: 'p10_estuary', name: '河口路', x: 800, y: -40, desc: '16 m 东西路，接到各条南北路和南堤。名字未经确认', cat: 'life' },
    { id: 'p10_levee', name: '南堤步道', x: 800, y: -72, desc: '澜海南汊北岸的堤。名字未经确认', cat: 'park' },
    { id: 'p10_south2', name: '月津路', x: 800, y: 24, desc: '16 m 东西路。名字未经确认', cat: 'life' },
    { id: 'p10_s_sea', name: '澜海南汊', x: 900, y: -90, desc: '河东南方的水面。岸线未经确认', cat: 'life' },
  ]);
})();
