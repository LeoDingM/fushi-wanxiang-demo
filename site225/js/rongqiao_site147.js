/* Site147：月河区把还空着的街块补上。
 * 澜石南街和河东大道之间、大道北侧到堤岸公园南缘，以及渔港路和老街路之间老街以东的空档。
 * 山径台地、堤岸公园、河口广场、渔村老街、澜海、南汊和月河水面不动。
 * 新楼并进已有分块，不新开分块。不做 438 m 塔，南埠不往南。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10o || D.rongqiaoExpandP10p || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10p = 1;
  const P = N.expansionP10;
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
  for (const k of Object.keys(P)) take(P[k]);
  take(P.buildings); take(P.amenities); take(P.life); take(P.fill);
  for (const c of D.colliders || []) if (c && c.rect) addBlock(c.rect);
  for (const s of N.solids || []) addBlock(s);
  for (const w of N.water || []) addBlock(w);
  for (const k of P.keepLots || []) addBlock(k);
  /* 老街、内港、月河口、海岸步道。这些不是可盖的空地。 */
  const RESERVED = [
    [376, -214, 560, -112],
    [1040, -186, 1248, -168],
    [356, -220, 404, -196],
    [1396, -190, 1428, -170],
    [696, -190, 722, -174],
    [1704, -260, 1810, 432],
    [356, 192, 1750, 234],
    [356, 356, 1750, 390],
  ];
  for (const r of RESERVED) addBlock(r);

  function blocker(rect, pad) {
    const a0 = rect[0] - pad, a1 = rect[1] - pad, a2 = rect[2] + pad, a3 = rect[3] + pad;
    for (let i = 0; i < blocked.length; i++) {
      const b = blocked[i];
      if (a0 < b[2] && b[0] < a2 && a1 < b[3] && b[1] < a3) return b;
    }
    return null;
  }

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

  /* 跟已有楼同一分块，避免大块父级单独往外冒。 */
  const LOCAL = [
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
  const BINS = [
    ['rqe_p10_e10_w', 180, 460],
    ['rqe_p10_e12_w', -280, -40],
  ];
  const CH = root.SCENE_CHUNKS || {};
  function pickChunk(x, y) {
    let best = null, area = Infinity;
    for (const c of LOCAL) {
      if (x >= c[1] && x < c[3] && y >= c[2] && y < c[4]) {
        const a = (c[3] - c[1]) * (c[4] - c[2]);
        if (a < area) { area = a; best = c[0]; }
      }
    }
    if (best && CH[best]) return best;
    for (const [pre, y0, y1] of BINS) {
      if (y < y0 || y >= y1) continue;
      const id = pre + (Math.floor(x / 160) * 160);
      if (CH[id]) return id;
    }
    throw new Error('site147 no chunk ' + x + ',' + y);
  }
  const bags = {};
  const added = {};
  const CAP = 2480;
  function room(id, n) {
    const have = (CH[id] && CH[id].objects ? CH[id].objects.length : 0) + (added[id] || 0);
    return have + n <= CAP;
  }
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10q_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    const key = pickChunk(o.x, o.y);
    (bags[key] || (bags[key] = [])).push(o);
    added[key] = (added[key] || 0) + 1;
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
  function estimate(spec) {
    const m = spec.mass;
    let n = 12;
    for (let f = 1; f <= m.F; f++) {
      const plan = bayPlan(spec, f, m.F, spec.x);
      n += plan.nS + plan.nW;
    }
    n += m.podiumNS * m.podiumNW * 2;
    return n;
  }
  const built = [];
  const solids = [], colliders = [];
  const skipped = [];
  function block(id, rect) { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); addBlock(rect); }
  function remember(spec, parts) {
    const m = spec.mass, fg = 'rqe_p10q_' + spec.id;
    for (const r of parts) block(fg + '_' + r[0] + '_' + r[1], r);
    built.push({
      id: fg, name: spec.name, x0: spec.x, y0: spec.y, W: m.podiumNS * 3, D: m.podiumNW * 3, F: m.F, floors: m.F,
      kind: spec.kind || 'home', form: spec.form || '', family: spec.family || '', glass: spec.glass || '',
      plate: spec.plate || (m.towerNS + 'x' + m.towerNW),
      parts: parts.map((r) => r.slice()), unconfirmed: true,
    });
  }
  function buildMass(spec, soft) {
    const m = spec.mass, F = m.F, x = spec.x, y = spec.y;
    const foot = [x, y, x + m.podiumNS * 3, y + m.podiumNW * 3];
    const clash = blocker(foot, 0.9);
    if (clash) {
      if (soft) { skipped.push(spec.id); return false; }
      throw new Error('site147 footprint ' + spec.id + ' ' + foot.join(',') + ' vs ' + clash.join(','));
    }
    const key = pickChunk(x + 1, y + 1);
    const need = estimate(spec);
    if (!room(key, need)) { skipped.push(spec.id + '@' + key); return false; }
    const fg = 'rqe_p10q_' + spec.id;
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
    root.hedongRoofTower(put, spec, m, spec.st, x, y, fg);
    remember(spec, [foot]);
    return true;
  }
  function box(s, soft) {
    return buildMass({
      id: s.id, name: s.name, x: s.x, y: s.y, kind: s.kind, glass: s.glass, family: s.family || '', signs: s.signs,
      form: s.form || '整板', plate: s.nS + 'x' + s.nW,
      st: { podium: 1, setbackTop: 0, crownStone: s.F > 1 ? 1 : 0, beltEvery: 0 },
      mass: {
        F: s.F, podiumNS: s.nS, podiumNW: s.nW, towerNS: s.nS, towerNW: s.nW, towerOff: 0,
        midFromTop: 0, midNS: s.nS, midNW: s.nW, crownNS: s.nS, crownNW: s.nW,
      },
    }, soft);
  }

  /* 津东斜楼 14 层。裙楼 6×3，塔身 4×2 贴西，中段再收，顶上是小冠。淡灰，约 42 m。
   * 堤北曲板 20 层。裙楼 8×3，塔身 6×2 贴东，腰上收一档，冠是窄条。石墨，约 60 m。
   * 层数、平面、材料和剪影都不跟已有塔相同，也不是 438 m。 */
  buildMass({
    id: 'slant', name: '津东斜楼', x: 984, y: 100, kind: 'work', glass: 'hd_g_sl', form: '斜切', family: '淡灰斜切', plate: '4x2',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '津东斜楼' }],
    st: { podium: 2, setbackTop: 4, crownStone: 1, beltEvery: 0 },
    mass: { F: 14, podiumNS: 6, podiumNW: 3, towerNS: 4, towerNW: 2, towerOff: 0, midFromTop: 8, midNS: 3, midNW: 2, crownNS: 2, crownNW: 2 },
  });
  buildMass({
    id: 'curve', name: '堤北曲板', x: 1104, y: 176, kind: 'work', glass: 'hd_g_qp', form: '曲板', family: '石墨曲板', plate: '6x2',
    signs: [{ face: 'S', floor: 1, bay: 3, text: '堤北曲板' }],
    st: { podium: 3, setbackTop: 5, crownStone: 2, beltEvery: 4 },
    mass: { F: 20, podiumNS: 8, podiumNW: 3, towerNS: 6, towerNW: 2, towerOff: 2, midFromTop: 10, midNS: 4, midNW: 2, crownNS: 2, crownNW: 1 },
  });
  box({ id: 'sk', name: '津东社康', x: 1278, y: 88, nS: 5, nW: 3, F: 3, glass: 'hd_g_ls', kind: 'clinic', family: '深蓝低透', signs: [{ face: 'S', floor: 2, bay: 1, text: '津东社康' }] });
  box({ id: 'mk', name: '东肩菜场', x: 1542, y: 88, nS: 6, nW: 3, F: 2, glass: 'hd_g_cj', kind: 'market', family: '蓝灰棚', form: '菜场棚', signs: [{ face: 'S', floor: 1, bay: 2, text: '东肩菜场' }] });
  box({ id: 'kg', name: '堤北幼儿园', x: 770, y: 168, nS: 4, nW: 2, F: 2, glass: 'hd_g_yx', kind: 'school', family: '淡蓝中透', signs: [{ face: 'S', floor: 1, bay: 1, text: '堤北幼儿园' }] });

  const GROVE = [1432, 180, 1456, 188];
  box({ id: 'gp', name: '堤北亭', x: 1436, y: 180, nS: 2, nW: 2, F: 1, glass: 'hd_g_hd', kind: 'park', family: '亭', form: '亭', signs: [{ face: 'S', floor: 1, bay: 0, text: '堤北亭' }] });
  addBlock(GROVE);
  paint(GROVE, 'G');
  function tree(id, x, y, variant) { put(id, 'rq_x_tree', x, y, { variant, fade_group: 'rqe_p10q_tree' }); }
  tree('tr1', 1434, 182, 'ginkgo');
  tree('tr2', 1450, 184, 'sakura');
  put('bench1', 'community_bench', 1448, 182, { rot: 0, fade_group: 'rqe_p10q_tree' });

  const GLASS = ['hd_g_yh', 'hd_g_wm', 'hd_g_dl', 'hd_g_yl2', 'hd_g_hd', 'hd_g_cj', 'hd_g_yx', 'hd_g_qp', 'hd_g_yl', 'hd_g_ls', 'hd_g_sl'];
  const FS = [4, 6, 3, 5, 3, 4, 2];
  let seq = 0;
  function fillRange(y, nW, x0, x1, homes, shops, family) {
    let x = x0, guard = 0;
    while (x + 12 <= x1 && guard++ < 80) {
      const nS = 4 + (seq % 4);
      const w = nS * 3;
      if (x + w > x1) break;
      const rect = [x, y, x + w, y + nW * 3];
      if (blocker(rect, 0.9)) { x += 3; continue; }
      const i = seq++;
      const shop = i % 4 === 0;
      const name = shop ? shops[i % shops.length] : homes[i % homes.length];
      const ok = box({
        id: 'h' + i, name, x, y, nS, nW, F: shop ? 2 : FS[i % FS.length], glass: GLASS[(i + nW) % GLASS.length],
        kind: shop ? 'shop' : 'home', family: shop ? '沿街铺' : family, form: nS + 'x' + nW,
        signs: [{ face: 'S', floor: 1, bay: 0, text: name }],
      }, true);
      x += w + (ok ? 6 : 3);
    }
  }
  const SH = ['津东里', '南街里', '石南居', '澜石里', '东肩里'];
  const SU = ['津东面馆', '石南文具', '澜石花店', '东肩茶铺', '南街菜店'];
  /* 澜石南街北侧，贴着已有塔楼之间的空档。 */
  fillRange(88, 3, 876, 946, SH, SU, '南街住宅');
  fillRange(88, 3, 1008, 1092, SH, SU, '南街住宅');
  fillRange(88, 3, 1130, 1166, SH, SU, '南街住宅');
  fillRange(88, 3, 1428, 1454, SH, SU, '南街住宅');
  fillRange(88, 3, 1564, 1590, SH, SU, '东肩住宅');
  fillRange(104, 2, 548, 600, SH, SU, '南街住宅');
  fillRange(104, 2, 914, 978, SH, SU, '南街住宅');
  fillRange(104, 2, 1072, 1098, SH, SU, '南街住宅');
  fillRange(104, 2, 1136, 1168, SH, SU, '南街住宅');
  fillRange(104, 2, 1296, 1310, SH, SU, '南街住宅');
  const NH = ['堤北里', '岸北居', '公园南里', '望堤里', '曲板里'];
  const NU = ['堤北面馆', '岸北文具', '望堤花店', '公园茶铺', '曲板菜店'];
  /* 河东大道北侧，堤岸公园南缘留出人行道。 */
  fillRange(168, 2, 674, 698, NH, NU, '堤北住宅');
  fillRange(168, 2, 780, 794, NH, NU, '堤北住宅');
  fillRange(168, 2, 1088, 1100, NH, NU, '堤北住宅');
  fillRange(168, 2, 1132, 1166, NH, NU, '堤北住宅');
  fillRange(168, 2, 1280, 1306, NH, NU, '堤北住宅');
  fillRange(180, 2, 428, 466, NH, NU, '堤北住宅');
  fillRange(180, 2, 488, 528, NH, NU, '堤北住宅');
  fillRange(180, 2, 622, 668, NH, NU, '堤北住宅');
  fillRange(180, 2, 828, 854, NH, NU, '堤北住宅');
  fillRange(180, 2, 876, 932, NH, NU, '堤北住宅');
  fillRange(180, 2, 956, 1004, NH, NU, '堤北住宅');
  fillRange(180, 2, 1044, 1098, NH, NU, '堤北住宅');
  fillRange(180, 2, 1134, 1166, NH, NU, '堤北住宅');
  fillRange(180, 2, 1280, 1306, NH, NU, '堤北住宅');
  fillRange(180, 2, 1496, 1518, NH, NU, '堤北住宅');
  fillRange(180, 2, 1570, 1586, NH, NU, '东肩住宅');
  const FH = ['港北里', '渔北居', '老街东里'];
  const FU = ['港北渔具', '渔北茶铺', '街东面馆'];
  /* 渔港路与老街路之间，老街以东，不进内港和月河口。 */
  fillRange(-160, 2, 568, 680, FH, FU, '港北住宅');
  fillRange(-160, 2, 860, 1020, FH, FU, '港北住宅');
  fillRange(-160, 2, 1260, 1390, FH, FU, '港北住宅');
  fillRange(-160, 2, 1460, 1660, FH, FU, '港北住宅');

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
  for (const ch of Object.values(CH)) if (ch && ch.objects) ch.objects = scrub(ch.objects);
  for (const [id, list] of Object.entries(bags)) {
    if (!CH[id]) throw new Error('site147 missing chunk ' + id);
    const next = (CH[id].objects || []).concat(list);
    if (next.length > 2600) throw new Error('site147 chunk cap ' + id + ' ' + next.length);
    CH[id].objects = next;
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);

  function overlaps(a, b) {
    return a[0] < b[2] - 0.05 && b[0] < a[2] - 0.05 && a[1] < b[3] - 0.05 && b[1] < a[3] - 0.05;
  }
  const cols = (D.colliders || []).filter((c) => c && c.rect);
  const bad = [];
  for (let i = 0; i < colliders.length; i++) {
    for (let j = 0; j < cols.length; j++) {
      if (cols[j] === colliders[i]) continue;
      if (overlaps(colliders[i].rect, cols[j].rect)) bad.push(colliders[i].id + ' ~ ' + (cols[j].id || j));
    }
  }
  if (bad.length) throw new Error('site147 overlap ' + bad.slice(0, 6).join(' | '));
  const wet = [];
  for (const c of colliders) {
    for (const w of N.water || []) if (w && overlaps(c.rect, w)) wet.push(c.id);
  }
  if (wet.length) throw new Error('site147 water ' + wet.join(','));

  const towers = built.filter((b) => (b.kind === 'work' || b.kind === 'hotel') && b.F >= 12);
  const counts = {};
  for (const [id, n] of Object.entries(added)) counts[id] = { added: n, total: CH[id].objects.length };
  P.site147 = {
    unconfirmed: true,
    buildings: built,
    towers,
    parks: [GROVE.slice()],
    skipped,
    counts,
    cap: 120,
  };
  P.keepLots = (P.keepLots || []).concat([GROVE.slice()]);
  P.reasons.site147 = '第十八刀补的是月河区还空着的街块，不推山体封口（北界仍是 y378），也不把南埠往 y-1540 以南推。澜石南街和河东大道之间的空档补了津东社康、东肩菜场、住宅和铺面。津东斜楼是 14 层斜切（淡灰，裙楼 6×3，塔身 4×2 贴西，约 42 m）。河东大道北侧、堤岸公园南缘补了堤北幼儿园、堤北亭和住宅铺面。堤北曲板是 20 层曲板（石墨，裙楼 8×3，塔身 6×2 贴东，约 60 m）。两栋的层数、平面、材料和剪影都不跟已有塔楼相同，也不是 438 m。渔港路和老街路之间、渔村老街以东能放下的空档补了港北住宅和铺面，不进内港、月河口和老街。山径台地、堤岸公园、河口广场、澜海和南汊不动。新楼并进已有分块，不新占分块状态袋。名字和尺寸未经确认。';
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '津东社康', rect: [1278, 88, 1293, 97], kind: 'campus', prio: 1 },
    { name: '东肩菜场', rect: [1542, 88, 1560, 97], kind: 'market', prio: 1 },
    { name: '堤北幼儿园', rect: [770, 168, 782, 174], kind: 'campus', prio: 1 },
    { name: '堤北亭', rect: GROVE.slice(), kind: 'park', prio: 1 },
  ]);
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_slant', name: '津东斜楼', x: 992, y: 96, desc: '14 层斜切办公楼。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_curve', name: '堤北曲板', x: 1116, y: 172, desc: '20 层曲板办公楼。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_sk20', name: '津东社康', x: 1284, y: 84, desc: '3 层社康外壳。没有室内。名字未经确认', cat: 'life' },
    { id: 'p10_mk20', name: '东肩菜场', x: 1550, y: 84, desc: '2 层菜场外壳。没有室内。名字未经确认', cat: 'shop' },
    { id: 'p10_kg20', name: '堤北幼儿园', x: 776, y: 164, desc: '2 层幼儿园外壳。没有室内。名字未经确认', cat: 'school' },
  ]);
  root.SITE147 = P.site147;
})();
