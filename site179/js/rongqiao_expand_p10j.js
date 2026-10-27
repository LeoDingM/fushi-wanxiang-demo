/* 月河区 · 河东望山 (2026-10-26). 接在滨海之后，向北约 140 m。
 * 可玩北界从堤岸封口 y238 收到 y378。望山路、林泉路和山径把澜石路、澄江路、石澜路、银杏路、望月路、东月路、澜东路、滨海路接到山脚，路口不断。
 * 山前是住宅、社区公园、山前小学和幼儿园、菜场、沿街小铺、两栋低层科研。再往北是台地，地面往山上抬。
 * 每个街块都排了房子、院子、停车或球场，不留大片空地。堤岸公园仍是景区。
 * 新块接在滨海后面。不做 438 m 塔，不南扩。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10i || D.rongqiaoExpandP10j || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10j = 1;
  const G = D.ground, CH = root.SCENE_CHUNKS || {};
  const NS = [[408, 424], [468, 484], [602, 618], [856, 872], [1024, 1040], [1368, 1384], [1520, 1536], [1688, 1704]];
  const Y_OPEN = 238, Y_HILL = 378, Y_SEAL0 = 378, Y_SEAL1 = 390;
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
  const north = (D.colliders || []).find((c) => c.id === 'rqe_p10_north');
  if (north) replaceSolid('rqe_p10_north', [[north.rect[0], Math.min(north.rect[1], 234), 356, north.rect[3]], [356, Y_SEAL1, Math.max(north.rect[2], 1810), north.rect[3]]]);
  retarget('rqe_p10_north_e', (r) => { r[1] = Y_SEAL0; r[3] = Y_SEAL1; });
  retarget('rqe_p10b_north', (r) => { r[1] = Y_SEAL0; r[3] = Y_SEAL1; });
  retarget('rqe_p10_sea', (r) => { r[3] = Y_SEAL1; });
  retarget('rqe_p10_east', (r) => { r[3] = Math.max(r[3], Y_SEAL1); });
  if (N.water) for (const w of N.water) if (w[0] === 1724 && w[1] === 64) w[3] = Y_SEAL1;
  const cuts = [408, 424, 468, 484, 602, 618, 856, 872, 1024, 1040, 1368, 1384, 1520, 1536, 1688, 1704];
  const lipSegs = [];
  let lx = 356;
  for (let i = 0; i < cuts.length; i += 2) {
    if (cuts[i] > lx) lipSegs.push([lx, 234, cuts[i], 238]);
    lx = cuts[i + 1];
  }
  if (lx < 1750) lipSegs.push([lx, 234, 1750, 238]);
  replaceSolid('rqe_p10_park_lip', lipSegs);
  const inNs = (x) => NS.some(([a, b]) => x >= a - 0.4 && x <= b + 0.4);
  for (const ch of Object.values(CH)) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => {
      if (!inNs(o.x)) return true;
      if (o.type === 'p_hedge' && o.y > 226 && o.y < 238) return false;
      if ((o.type === 'rq_x_tree' || o.type === 'p_lamp' || o.type === 'community_bench') && o.y >= 180 && o.y <= 238) return false;
      return true;
    });
  }

  paint([356, Y_OPEN, 1724, Y_HILL], 'S');
  paint([356, 282, 1688, 292], 'C');
  paint([356, 326, 1688, 346], 'C');
  paint([488, 282, 588, 306], 'C');
  paint([488, 326, 588, 346], 'C');
  paint([1104, 266, 1288, 346], 'G');
  paint([1104, 300, 1288, 308], 'S');
  paint([356, 356, 1724, Y_HILL], 'G');
  paint([1704, Y_OPEN, 1724, Y_HILL], 'S');
  paint([1714, 248, 1724, 370], 'G');
  const sea = (x, y) => (Math.round(x + y) % 7 === 0 ? 'U' : (Math.round(x) % 2 ? 'V' : 'W'));
  paint([1724, 64, 1770, Y_SEAL1], null, sea);
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
  for (const [x0] of NS) paintNS(x0, 184, 356);
  paintEW(248, 356, 1724);
  paintEW(308, 356, 1724);
  paint([356, 348, 1724, 356], 'S');
  for (const [x0] of NS) {
    paint([x0 + 3.5, 251.5, x0 + 12.5, 260.5], null, road);
    paint([x0 + 3.5, 311.5, x0 + 12.5, 320.5], null, road);
    paint([x0 + 3.5, 348, x0 + 12.5, 356], null, road);
  }

  const list = [];
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10k_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
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
    const m = spec.mass, fg = 'rqe_p10k_' + spec.id;
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
    const m = spec.mass, st = spec.st, F = m.F, fg = 'rqe_p10k_' + spec.id, x = spec.x, y = spec.y;
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
  const reserved = [[486, 264, 594, 348], [1104, 264, 1288, 348], [620, 264, 658, 284], [876, 264, 934, 284]];
  const hitsX = (x0, x1) => NS.some(([a, b]) => x0 < b && x1 > a);
  const hitsR = (rect) => reserved.some((r) => rect[0] < r[2] && rect[2] > r[0] && rect[1] < r[3] && rect[3] > r[1]);
  const GLASS = ['hd_g_hd', 'hd_g_yx', 'hd_g_yl2', 'hd_g_wm', 'hd_g_sl', 'hd_g_qp'];
  const FS = [4, 5, 3, 4];
  const HOMES = ['山前里', '林缘居', '望山里', '泉北居', '岸北里'];
  const SHOPS = ['望山面馆', '林缘菜店', '山前文具', '泉边花店', '北街茶铺'];
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
        glass: GLASS[i % GLASS.length], kind: shop ? 'shop' : 'home', family: '北住宅',
        signs: [{ face: 'S', floor: 1, bay: 0, text: name }],
      });
      x += w + 22;
    }
  }
  const spans = [];
  let prev = 361.2;
  for (const [a, b] of NS) {
    if (a - 1.2 >= prev + 15) spans.push([prev, a - 1.2]);
    prev = b + 1.2;
  }
  if (1686 >= prev + 15) spans.push([prev, 1686]);
  for (const [x0, x1] of spans) fillSpan(x0, x1, 268, 3);
  box({ id: 'kg', name: '山前幼儿园', x: 488, y: 268, nS: 5, nW: 3, F: 2, podium: 1, glass: 'hd_g_yx', kind: 'school', family: '淡蓝中透', signs: [{ face: 'S', floor: 1, bay: 1, text: '山前幼儿园' }] });
  box({ id: 'sch', name: '山前小学', x: 508, y: 268, nS: 8, nW: 4, F: 5, podium: 1, glass: 'hd_g_ls', kind: 'school', family: '深蓝低透', signs: [{ face: 'S', floor: 2, bay: 3, text: '山前小学' }] });
  box({ id: 'gym', name: '山前小学体育馆', x: 540, y: 268, nS: 6, nW: 3, F: 2, podium: 1, glass: 'hd_g_yl2', kind: 'school', family: '米黄石材', signs: [{ face: 'S', floor: 1, bay: 2, text: '山前小学体育馆' }] });
  box({ id: 'mk', name: '山前菜场', x: 624, y: 268, nS: 10, nW: 4, F: 2, podium: 1, glass: 'hd_g_hd', kind: 'market', family: '淡灰中透', signs: [{ face: 'S', floor: 1, bay: 4, text: '山前菜场' }] });
  buildMass({
    id: 'ly', name: '林缘科研', x: 880, y: 268, kind: 'work', glass: 'hd_g_ls', form: '林缘板', family: '深蓝低透', plate: '6x3',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '林缘科研' }],
    st: { podium: 2, setbackTop: 2, crownStone: 1, beltEvery: 0 },
    mass: { F: 12, podiumNS: 8, podiumNW: 4, towerNS: 6, towerNW: 3, towerOff: 1, midFromTop: 0, midNS: 6, midNW: 3, crownNS: 4, crownNW: 2 },
  });
  buildMass({
    id: 'sy', name: '山前实验楼', x: 912, y: 268, kind: 'work', glass: 'hd_g_wm', form: '偏置实验楼', family: '冷青绿', plate: '4x3',
    signs: [{ face: 'S', floor: 1, bay: 1, text: '山前实验楼' }],
    st: { podium: 2, setbackTop: 0, crownStone: 1, beltEvery: 0 },
    mass: { F: 9, podiumNS: 6, podiumNW: 4, towerNS: 4, towerNW: 3, towerOff: 1, midFromTop: 0, midNS: 4, midNW: 3, crownNS: 4, crownNW: 3 },
  });
  box({ id: 'pk', name: '山前亭', x: 1160, y: 276, nS: 2, nW: 1, F: 1, podium: 1, kind: 'park', form: '亭', signs: [{ face: 'S', floor: 1, bay: 0, text: '山前亭' }] });

  function tree(x, y, variant) { put('tr_' + variant + '_' + x + '_' + y, 'rq_x_tree', x, y, { variant, fade_group: 'rqe_p10k_tree' }); }
  for (let x = 368; x <= 1700; x += 32) {
    if (inNs(x)) continue;
    tree(x, 249.2, 'ginkgo'); tree(x, 309.2, 'sakura');
  }
  for (const [x, y] of [[1120, 280], [1168, 300], [1224, 280], [1264, 336], [1144, 340], [1208, 332]]) tree(x, y, (x / 16) % 2 ? 'sakura' : 'ginkgo');
  for (let x = 364; x <= 1700; x += 16) {
    if (inNs(x)) continue;
    put('hill_' + x, 'p_hedge', x, 368, { fade_group: 'rqe_p10k_hill' });
  }
  for (let x = 376; x <= 1688; x += 28) {
    if (inNs(x)) continue;
    put('lamp_a_' + x, 'p_lamp', x, 249.4, { interact: 'lamp' });
    put('lamp_b_' + x, 'p_lamp', x, 262.2, { interact: 'lamp' });
  }
  for (const [x, y] of [[1140, 304], [1220, 304], [1180, 340], [520, 330], [640, 250]]) put('bench_' + x + '_' + y, 'community_bench', x, y, { rot: 0 });

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
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p10_e10 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p10_e10', name: '河东望山', rect: [280, 180, 1860, 460], src: 'js/rongqiao_expand_p10j.js', load_m: 40, unload_m: 80 });

  const P = N.expansionP10;
  P.slice = 12;
  P.names.hill = '望山路';
  P.names.hill2 = '林泉路';
  P.names.hillPath = '山径';
  P.hillRoad = [356, 248, 1724, 264];
  P.hillRoad2 = [356, 308, 1724, 324];
  P.hillPath = [356, 348, 1724, 356];
  P.district = [356, P.district[1], 1750, Y_HILL];
  const park = [1104, 266, 1288, 346], school = [486, 266, 592, 346], hill = [356, 356, 1724, Y_HILL];
  P.north12 = {
    unconfirmed: true,
    north: [Y_OPEN, Y_HILL],
    park, school, hill,
    market: [624, 268, 654, 280],
    cap: 120,
    buildings: built,
    towers: built.filter((b) => (b.kind === 'work' || b.kind === 'hotel') && b.F >= 16),
  };
  P.reasons.north12 = '第十二片：河东向北收到 y378（约 +140 m），封口改到 y390。望山路（y248–264）和林泉路（y308–324）是东西向 16 m 路，山径贴着台地。澜石路、澄江路、石澜路、银杏路、望月路、东月路、澜东路、滨海路都向北接到山径，穿过堤岸公园，没有断头路。山前小学 5 层深蓝低透，山前幼儿园 2 层淡蓝中透，山前菜场 2 层。林缘科研 12 层林缘板（深蓝，塔身 6×3），山前实验楼 9 层偏置实验楼（冷青绿，塔身 4×3），都低于已有塔楼，不克隆。山前社区公园和北侧台地是景区，台地用绿篱作挡土。街块排了住宅、铺面、球场和硬地院子。滨海步道和澜海沿东缘向北续上。不做 438 m 塔，不南扩。名字和尺寸未经确认。';
  for (const lab of N.mapLabels || []) if (lab.name === '澜海') lab.rect = [1724, 64, 1770, Y_SEAL1];
  if (P.east11) P.east11.sea = [1724, 64, 1770, Y_SEAL1];
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '望山路', rect: P.hillRoad.slice(), kind: 'road', prio: 1 },
    { name: '林泉路', rect: P.hillRoad2.slice(), kind: 'road', prio: 1 },
    { name: '山前社区公园', rect: park.slice(), kind: 'park', prio: 1 },
    { name: '山前小学', rect: [508, 268, 532, 280], kind: 'campus', prio: 1 },
    { name: '山前幼儿园', rect: [488, 268, 503, 277], kind: 'campus', prio: 1 },
    { name: '山前菜场', rect: [624, 268, 654, 280], kind: 'market', prio: 1 },
    { name: '河东台地', rect: hill.slice(), kind: 'park', prio: 1 },
  ]);
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_n_sch', name: '山前小学', x: 520, y: 264, desc: '5 层教学楼和操场。只是外观。名字未经确认', cat: 'school' },
    { id: 'p10_n_kg', name: '山前幼儿园', x: 494, y: 264, desc: '2 层幼儿园外壳。没有室内。名字未经确认', cat: 'school' },
    { id: 'p10_n_mk', name: '山前菜场', x: 636, y: 264, desc: '2 层菜场外壳。没有室内。名字未经确认', cat: 'shop' },
    { id: 'p10_n_ly', name: '林缘科研', x: 892, y: 264, desc: '12 层科研楼。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_n_sy', name: '山前实验楼', x: 920, y: 264, desc: '9 层实验楼。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_n_park', name: '山前社区公园', x: 1188, y: 300, desc: '社区公园。名字未经确认', cat: 'park' },
    { id: 'p10_hill', name: '望山路', x: 700, y: 256, desc: '16 m 东西路，接到各条南北路。名字未经确认', cat: 'life' },
    { id: 'p10_hill2', name: '林泉路', x: 700, y: 316, desc: '16 m 东西路。名字未经确认', cat: 'life' },
  ]);
})();
