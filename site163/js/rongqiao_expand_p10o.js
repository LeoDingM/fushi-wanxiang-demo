/* 月河区 · 片间与滨海南肩补块 (Site144). 不新开分块，不推北界，不推南埠。
 * 月津路和澜石南街之间、望月路到澜东路的中段、山径台地东段，以及滨海路西侧的南肩，原来是成片人行道。
 * 补住宅、铺面、菜场、超市、社康、学校，以及带树、长椅和亭的小园。风铃中心跟已有塔的层数、平面和材料都不同。
 * 堤岸公园、河口广场、渔村老街、澜海和操场不动。不做 438 m 塔。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10n || D.rongqiaoExpandP10o || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10o = 1;
  const P = N.expansionP10;
  const NS = [[408, 424], [468, 484], [602, 618], [856, 872], [1024, 1040], [1368, 1384], [1520, 1536], [1688, 1704]];
  const blocked = [];
  function addBlock(rect) { if (rect && rect.length >= 4) blocked.push(rect); }
  function collect(list) {
    for (const b of list || []) {
      const parts = b.parts && b.parts.length ? b.parts : (b.x0 != null ? [[b.x0, b.y0, b.x0 + b.W, b.y0 + (b.D || 0)]] : []);
      for (const p of parts) addBlock(p);
    }
  }
  function take(node) {
    if (!node) return;
    if (Array.isArray(node)) collect(node);
    else if (node.buildings) collect(node.buildings);
  }
  take(P.buildings); take(P.amenities); take(P.life); take(P.fill);
  for (const k of ['east9', 'east10', 'east11', 'north12', 'south13', 'south14', 'north15', 'north16', 'south16']) take(P[k]);
  const roads = [
    [300, 132, 1704, 158], [368, 64, 1704, 80],
    [356, 248, 1724, 264], [356, 308, 1724, 324], [356, 348, 1724, 356],
    [356, -48, 1724, -32], [356, 16, 1724, 32], [356, -80, 1724, -64],
    [356, -208, 1724, -192], [356, -144, 1724, -128],
    [356, -100, 1724, -80], [356, -220, 1724, -100],
    [1704, -260, 1770, 400], [1724, -260, 1810, 400],
    [356, 192, 1750, 234],
    [356, 358, 1688, 362],
    [1104, 264, 1288, 348], [486, 264, 594, 348],
    [1044, 38, 1094, 58], [1492, 326, 1514, 344],
    [726, 82, 850, 128], [490, 90, 544, 120],
    [1420, 38, 1500, 60], [1172, 100, 1272, 128], [1310, 100, 1360, 128],
    [622, 106, 686, 128], [530, 164, 598, 188], [1612, 116, 1640, 128],
    [702, 120, 710, 128], [1478, 116, 1490, 124],
  ];
  for (const [a, b] of NS) roads.push([a - 0.4, -220, b + 0.4, 378]);
  for (const r of roads) addBlock(r);
  for (const s of N.solids || []) addBlock(s);

  function blocker(rect, pad) {
    const a0 = rect[0] - pad, a1 = rect[1] - pad, a2 = rect[2] + pad, a3 = rect[3] + pad;
    for (let i = 0; i < blocked.length; i++) {
      const b = blocked[i];
      if (a0 < b[2] && b[0] < a2 && a1 < b[3] && b[1] < a3) return b;
    }
    return null;
  }
  function hits(rect, pad) { return !!blocker(rect, pad); }

  const G = D.ground;
  function paint(rect, tile) {
    const [ox, oy] = G.origin, ch = G.chunk;
    const c0 = Math.max(0, Math.floor((rect[0] - ox) / ch)), c1 = Math.min(G.cols, Math.ceil((rect[2] - ox) / ch));
    const r0 = Math.max(0, Math.floor((rect[1] - oy) / ch)), r1 = Math.min(G.rows, Math.ceil((rect[3] - oy) / ch));
    for (let r = r0; r < r1; r++) {
      const a = G.data_south_to_north[r].split('');
      for (let c = c0; c < c1; c++) {
        const x = ox + (c + 0.5) * ch, y = oy + (r + 0.5) * ch;
        if (x >= rect[0] && x < rect[2] && y >= rect[1] && y < rect[3]) a[c] = tile;
      }
      G.data_south_to_north[r] = a.join('');
    }
  }

  const CHUNKS = [
    ['rqe_p10_e13', 280, 300, 1860, 420],
    ['rqe_p10_e12', 280, -280, 1860, -40],
    ['rqe_p10_e11', 280, -140, 1860, 100],
    ['rqe_p10_e10', 280, 180, 1860, 460],
    ['rqe_p10_e9', 1560, 8, 1820, 280],
    ['rqe_p10_e8', 1400, 8, 1680, 280],
    ['rqe_p10_e7', 1240, 8, 1520, 280],
    ['rqe_p10_e6', 1100, 8, 1360, 280],
    ['rqe_p10_e5', 960, 8, 1200, 260],
    ['rqe_p10_e4', 820, 8, 1040, 260],
    ['rqe_p10_e3', 600, 8, 880, 260],
    ['rqe_p10_e2', 460, 8, 680, 260],
    ['rqe_p10_hd', 300, 8, 500, 260],
  ];
  function pickChunk(x, y) {
    let best = null, area = Infinity;
    for (const c of CHUNKS) {
      if (x >= c[1] && x < c[3] && y >= c[2] && y < c[4]) {
        const a = (c[3] - c[1]) * (c[4] - c[2]);
        if (a < area) { area = a; best = c[0]; }
      }
    }
    return best;
  }
  const bags = {};
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10p_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    const key = pickChunk(o.x, o.y);
    if (!key) throw new Error('site144 no chunk ' + o.x + ',' + o.y);
    (bags[key] || (bags[key] = [])).push(o);
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
  const solids = [], colliders = [];
  function block(id, rect) { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); addBlock(rect); }
  function remember(spec, parts) {
    const m = spec.mass, fg = 'rqe_p10p_' + spec.id;
    for (const r of parts) block(fg + '_' + r[0] + '_' + r[1], r);
    built.push({
      id: fg, name: spec.name, x0: spec.x, y0: spec.y, W: m.podiumNS * 3, D: m.podiumNW * 3, F: m.F, floors: m.F,
      kind: spec.kind || 'home', form: spec.form || '', family: spec.family || '', glass: spec.glass || '',
      plate: spec.plate || (m.towerNS + 'x' + m.towerNW),
      parts: parts.map((r) => r.slice()), unconfirmed: true,
    });
  }
  function buildMass(spec) {
    const m = spec.mass, st = spec.st, F = m.F, fg = 'rqe_p10p_' + spec.id, x = spec.x, y = spec.y;
    const foot = [x, y, x + m.podiumNS * 3, y + m.podiumNW * 3];
    const clash = blocker(foot, 0.7);
    if (clash) throw new Error('site144 footprint ' + spec.id + ' ' + foot.join(',') + ' vs ' + clash.join(','));
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
    remember(spec, [foot]);
  }
  function box(s) {
    buildMass({
      id: s.id, name: s.name, x: s.x, y: s.y, kind: s.kind, glass: s.glass, family: s.family || '', signs: s.signs,
      form: s.form || '整板', plate: s.nS + 'x' + s.nW,
      st: { podium: 1, setbackTop: 0, crownStone: s.F > 1 ? 1 : 0, beltEvery: 0 },
      mass: {
        F: s.F, podiumNS: s.nS, podiumNW: s.nW, towerNS: s.nS, towerNW: s.nW, towerOff: 0,
        midFromTop: 0, midNS: s.nS, midNW: s.nW, crownNS: s.nS, crownNW: s.nW,
      },
    });
  }

  /* 风铃中心 16 层。裙楼 7×3，塔身 3×3 贴东，中段再放宽，顶上收成小冠。淡金，约 48 m。不是已有剪影，也不是 438 m。 */
  buildMass({
    id: 'bell', name: '风铃中心', x: 1494, y: 116, kind: 'work', glass: 'hd_g_yl', form: '风铃', family: '淡金风铃', plate: '3x3',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '风铃中心' }],
    st: { podium: 2, setbackTop: 4, crownStone: 1, beltEvery: 4 },
    mass: { F: 16, podiumNS: 7, podiumNW: 3, towerNS: 3, towerNW: 3, towerOff: 3, midFromTop: 8, midNS: 4, midNW: 3, crownNS: 2, crownNW: 2 },
  });
  box({ id: 'sch', name: '望月小学', x: 1056, y: 116, nS: 6, nW: 3, F: 4, glass: 'hd_g_yx', kind: 'school', family: '淡蓝中透', signs: [{ face: 'S', floor: 2, bay: 2, text: '望月小学' }] });
  box({ id: 'mk', name: '澜东菜场', x: 1404, y: 116, nS: 6, nW: 3, F: 2, glass: 'hd_g_cj', kind: 'market', family: '蓝灰棚', form: '菜场棚', signs: [{ face: 'S', floor: 1, bay: 2, text: '澜东菜场' }] });
  box({ id: 'kg', name: '澜东幼儿园', x: 1434, y: 116, nS: 5, nW: 3, F: 2, glass: 'hd_g_yl2', kind: 'school', family: '米黄石材', signs: [{ face: 'S', floor: 1, bay: 1, text: '澜东幼儿园' }] });
  box({ id: 'sk2', name: '澜东社康', x: 1388, y: 116, nS: 4, nW: 3, F: 3, glass: 'hd_g_wm', kind: 'clinic', family: '冷青绿', signs: [{ face: 'S', floor: 2, bay: 1, text: '澜东社康' }] });
  box({ id: 'm1', name: '津口菜场', x: 672, y: 38, nS: 6, nW: 3, F: 2, glass: 'hd_g_yx', kind: 'market', family: '淡蓝棚', form: '菜场棚', signs: [{ face: 'S', floor: 1, bay: 2, text: '津口菜场' }] });
  box({ id: 'sk', name: '津北社康', x: 708, y: 38, nS: 5, nW: 3, F: 3, glass: 'hd_g_ls', kind: 'clinic', family: '深蓝低透', signs: [{ face: 'S', floor: 2, bay: 1, text: '津北社康' }] });
  box({ id: 'sm', name: '岸南超市', x: 1566, y: 38, nS: 6, nW: 3, F: 2, glass: 'hd_g_qp', kind: 'market', family: '石墨平铺', form: '平铺', signs: [{ face: 'S', floor: 1, bay: 2, text: '岸南超市' }] });
  box({ id: 'sk3', name: '岸南诊所', x: 1602, y: 38, nS: 5, nW: 3, F: 3, glass: 'hd_g_dl', kind: 'clinic', family: '暖石开窗', signs: [{ face: 'S', floor: 2, bay: 1, text: '岸南诊所' }] });

  const GROVE = [[744, 38, 774, 47], [1624, 38, 1642, 47], [1458, 116, 1476, 125]];
  box({ id: 'gp1', name: '津北亭', x: 750, y: 39, nS: 2, nW: 2, F: 1, glass: 'hd_g_hd', kind: 'park', family: '亭', form: '亭', signs: [{ face: 'S', floor: 1, bay: 0, text: '津北亭' }] });
  box({ id: 'gp2', name: '岸南亭', x: 1630, y: 39, nS: 2, nW: 2, F: 1, glass: 'hd_g_hd', kind: 'park', family: '亭', form: '亭', signs: [{ face: 'S', floor: 1, bay: 0, text: '岸南亭' }] });
  box({ id: 'gp3', name: '澜东亭', x: 1462, y: 117, nS: 2, nW: 2, F: 1, glass: 'hd_g_yh', kind: 'park', family: '亭', form: '亭', signs: [{ face: 'S', floor: 1, bay: 0, text: '澜东亭' }] });
  for (const g of GROVE) { addBlock(g); paint(g, 'G'); }
  function tree(id, x, y, variant) { put(id, 'rq_x_tree', x, y, { variant, fade_group: 'rqe_p10p_tree' }); }
  tree('tr1', 746, 40, 'ginkgo'); tree('tr2', 768, 44, 'sakura');
  tree('tr3', 1626, 40, 'sakura'); tree('tr4', 1638, 44, 'ginkgo');
  tree('tr5', 1459, 118, 'ginkgo'); tree('tr6', 1472, 122, 'sakura');
  put('bench1', 'community_bench', 766, 42, { rot: 0, fade_group: 'rqe_p10p_tree' });
  put('bench2', 'community_bench', 1636, 42, { rot: 0, fade_group: 'rqe_p10p_tree' });
  put('bench3', 'community_bench', 1470, 120, { rot: 0, fade_group: 'rqe_p10p_tree' });

  const GLASS = ['hd_g_yh', 'hd_g_cj', 'hd_g_yl', 'hd_g_sl', 'hd_g_wm', 'hd_g_qp', 'hd_g_dl', 'hd_g_ls'];
  const FS = [4, 5, 3, 6, 4, 3];
  let seq = 0;
  function fillRange(y, nW, x0, x1, homes, shops, family) {
    let x = x0, guard = 0;
    while (x + 12 <= x1 && guard++ < 480) {
      const nS = 4 + (seq % 3);
      const w = nS * 3;
      if (x + w > x1) break;
      const rect = [x, y, +(x + w).toFixed(2), +(y + nW * 3).toFixed(2)];
      if (hits(rect, 0.8)) { x += 3; continue; }
      const i = seq++;
      const shop = i % 4 === 0;
      const name = shop ? shops[i % shops.length] : homes[i % homes.length];
      box({
        id: 'h' + i, name, x, y, nS, nW, F: shop ? 2 : FS[i % FS.length], glass: GLASS[i % GLASS.length],
        kind: shop ? 'shop' : 'home', family: shop ? '沿街铺' : family, form: nS + 'x' + nW,
        signs: [{ face: 'S', floor: 1, bay: 0, text: name }],
      });
      x += w + 6;
    }
  }
  const SH = ['津北里', '岸南里', '月湾居', '堤南里', '海口里'];
  const SU = ['津北面馆', '岸南文具', '月湾花店', '堤南茶铺', '海口菜店'];
  fillRange(38, 3, 364, 1416, SH, SU, '南肩住宅');
  fillRange(38, 3, 1506, 1620, SH, SU, '滨海南肩');
  const MH = ['望月里', '澜东里', '银湾居', '澄湾里', '风铃里'];
  const MU = ['望月面馆', '澜东文具', '银湾花店', '澄湾茶铺', '风铃菜店'];
  fillRange(116, 3, 364, 1680, MH, MU, '中段住宅');

  /* 台地东段：山径三号和听澜别墅之间的空档。三栋低层，平面和石材都不跟已有别墅相同。 */
  box({ id: 'tv1', name: '台地折院', x: 1398, y: 366, nS: 5, nW: 2, F: 2, glass: 'hd_g_yh', kind: 'home', family: '淡蓝折板', form: '折院', signs: [{ face: 'S', floor: 1, bay: 1, text: '台地折院' }] });
  box({ id: 'tvp', name: '台地亭', x: 1420, y: 366, nS: 2, nW: 2, F: 1, glass: 'hd_g_hd', kind: 'park', family: '亭', form: '亭', signs: [{ face: 'S', floor: 1, bay: 0, text: '台地亭' }] });
  box({ id: 'tv2', name: '台地错院', x: 1440, y: 366, nS: 3, nW: 2, F: 3, glass: 'hd_g_qp', kind: 'home', family: '石墨错台', form: '错院', signs: [{ face: 'S', floor: 1, bay: 0, text: '台地错院' }] });
  box({ id: 'tv3', name: '台地长院', x: 1468, y: 366, nS: 6, nW: 2, F: 2, glass: 'hd_g_sl', kind: 'home', family: '淡灰长院', form: '长院', signs: [{ face: 'S', floor: 1, bay: 2, text: '台地长院' }] });
  const TGROVE = [1416, 366, 1434, 372];
  addBlock(TGROVE); paint(TGROVE, 'G');
  tree('tr7', 1416, 370, 'sakura');
  tree('tr8', 1432, 368, 'ginkgo');
  put('bench4', 'community_bench', 1428, 370, { rot: 0, fade_group: 'rqe_p10p_tree' });

  const feet = built.flatMap((b) => b.parts);
  const hit = (o, rect, pad) => o.x > rect[0] - pad && o.x < rect[2] + pad && o.y > rect[1] - pad && o.y < rect[3] + pad;
  const propHit = (o) => {
    if (!o) return false;
    const pad = o.type === 'rq_x_tree' ? 2.2 : (o.type === 'p_lamp' || o.type === 'p_hedge' || o.type === 'community_bench' ? 0.6 : 0);
    if (!pad) return false;
    return feet.some((f) => hit(o, f, pad));
  };
  function scrub(arr) {
    if (!arr) return [];
    const out = [];
    for (const o of arr) if (!propHit(o)) out.push(o);
    return out;
  }
  const CH = root.SCENE_CHUNKS || {};
  for (const ch of Object.values(CH)) if (ch && ch.objects) ch.objects = scrub(ch.objects);
  for (const [id, list] of Object.entries(bags)) {
    if (!CH[id]) continue;
    CH[id].objects = (CH[id].objects || []).concat(scrub(list));
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);

  const towers = built.filter((b) => (b.kind === 'work' || b.kind === 'hotel') && b.F >= 12);
  P.site144 = {
    unconfirmed: true,
    buildings: built,
    towers,
    parks: GROVE.map((g) => g.slice()).concat([TGROVE.slice()]),
    coast: [1566, 38, 1684, 47],
    cap: 120,
  };
  P.keepLots = (P.keepLots || []).concat(GROVE.map((g) => g.slice()), [TGROVE.slice()]);
  P.reasons.site144 = '第十七刀补的是片间缝，不推山体封口（北界仍是 y378），也不把南埠往 y-1540 以南推。月津路和澜石南街之间补了津口菜场、津北社康、住宅铺面和津北亭。滨海路西侧南肩补了岸南超市、岸南诊所和岸南亭。望月路到澜东路之间补了望月小学、澜东菜场、澜东幼儿园、澜东社康和澜东亭。风铃中心是 16 层风铃（淡金，裙楼 7×3，塔身 3×3 贴东，约 48 m），层数、平面、材料和剪影都不跟已有塔楼相同，也不是 438 m。山径台地东段补了折院、错院、长院和台地亭，跟已有别墅的层数和平面分开。堤岸公园、河口广场、渔村老街、澜海和月津小学操场不动。新楼并进已有分块，不新占分块状态袋。名字和尺寸未经确认。';
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '望月小学', rect: [1056, 116, 1074, 125], kind: 'campus', prio: 1 },
    { name: '澜东幼儿园', rect: [1434, 116, 1449, 125], kind: 'campus', prio: 1 },
    { name: '津口菜场', rect: [672, 38, 690, 47], kind: 'market', prio: 1 },
    { name: '岸南超市', rect: [1566, 38, 1584, 47], kind: 'market', prio: 1 },
    { name: '澜东菜场', rect: [1404, 116, 1422, 125], kind: 'market', prio: 1 },
    { name: '津北社康', rect: [708, 38, 723, 47], kind: 'campus', prio: 1 },
    { name: '岸南诊所', rect: [1602, 38, 1617, 47], kind: 'campus', prio: 1 },
    { name: '澜东社康', rect: [1388, 116, 1400, 125], kind: 'campus', prio: 1 },
    { name: '津北亭', rect: GROVE[0].slice(), kind: 'park', prio: 1 },
    { name: '岸南亭', rect: GROVE[1].slice(), kind: 'park', prio: 1 },
    { name: '澜东亭', rect: GROVE[2].slice(), kind: 'park', prio: 1 },
    { name: '台地亭', rect: TGROVE.slice(), kind: 'park', prio: 1 },
  ]);
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_bell', name: '风铃中心', x: 1504, y: 112, desc: '16 层风铃办公楼。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_sch17', name: '望月小学', x: 1064, y: 112, desc: '4 层教学楼外壳。没有室内。名字未经确认', cat: 'school' },
    { id: 'p10_kg17', name: '澜东幼儿园', x: 1440, y: 112, desc: '2 层幼儿园外壳。没有室内。名字未经确认', cat: 'school' },
    { id: 'p10_mk17', name: '津口菜场', x: 680, y: 34, desc: '2 层菜场外壳。没有室内。名字未经确认', cat: 'shop' },
    { id: 'p10_sm17', name: '岸南超市', x: 1574, y: 34, desc: '滨海南肩的超市外壳。没有室内。名字未经确认', cat: 'shop' },
    { id: 'p10_mk18', name: '澜东菜场', x: 1412, y: 112, desc: '2 层菜场外壳。没有室内。名字未经确认', cat: 'shop' },
    { id: 'p10_sk17', name: '津北社康', x: 714, y: 34, desc: '3 层社康外壳。没有室内。名字未经确认', cat: 'life' },
    { id: 'p10_sk18', name: '岸南诊所', x: 1608, y: 34, desc: '3 层诊所外壳。没有室内。名字未经确认', cat: 'life' },
    { id: 'p10_sk19', name: '澜东社康', x: 1394, y: 112, desc: '3 层社康外壳。没有室内。名字未经确认', cat: 'life' },
  ]);
})();
