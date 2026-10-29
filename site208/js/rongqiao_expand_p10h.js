/* 月河区 · 河东新城澜东 (2026-10-26). 接在东澄之后。
 * 可玩东界从 1450 收到 1600（+150 m），地面到 1620。拆掉第九片 x 1447.6 绿篱和堤岸东篱。
 * 河东大道、澜石南街铺到新东界。澜东路是 16 m 南北次干，南接南街、北接到堤岸步道，路口不断。
 * 河东堤岸公园沿干地收到 x 1600（y192–234）。水面仍停在折弯 x356，不新开河。y234 以上仍封着。
 * 混合街区：三栋办公／科研塔（退台板、点式、双裙，层数和色族互不克隆，也不克隆已有十一栋和东澄三栋）、
 * 两栋住宅、沿街小铺、澜东广场、澜东健身外壳。银杏行道树，广场和堤岸夹樱花。
 * 屋面仍按开间铺石材板，排序盒贴着本跨。不回榕桥暖砖，不用南埠白幕墙，不新开图集页，不开新室内。
 * 新块接在东澄后面，和上一块矩形重叠，load_m 仍是 40。分块状态袋上限仍是 120。
 * 不做 438 m 塔，不加河东公交，不南扩。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10g || D.rongqiaoExpandP10h || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10h = 1;
  const G = D.ground, CH = root.SCENE_CHUNKS || {}, BX1 = 1600, GX1 = 1620;
  const addE = Math.max(0, Math.round((GX1 - (G.origin[0] + G.cols * G.chunk)) / G.chunk));
  if (addE) {
    G.data_south_to_north = G.data_south_to_north.map((row) => row + 'K'.repeat(addE));
    G.cols += addE;
  }
  D.bounds = Object.assign({}, D.bounds, { x1: Math.max(D.bounds.x1, BX1) });
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
  function retarget(id, fn) {
    const c = (D.colliders || []).find((x) => x.id === id);
    if (!c) return;
    const old = c.rect.slice();
    N.solids = (N.solids || []).filter((s) => !(s[0] === old[0] && s[1] === old[1] && s[2] === old[2] && s[3] === old[3]));
    fn(c.rect);
    N.solids.push(c.rect.slice());
  }
  const east = (D.colliders || []).find((c) => c.id === 'rqe_p10_east');
  if (east) {
    const r = east.rect;
    N.solids = (N.solids || []).filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqe_p10_east');
  }
  const FAR = 1660, OLD = 1434, ROAD = 1584, SEAL = 1600;
  for (const id of ['rqe_p10_south', 'rqe_p10_north', 'rqe_p10_north_e', 'rqe_p10b_south', 'rqe_p10b_north']) {
    retarget(id, (r) => { r[2] = Math.max(r[2], FAR); });
  }
  retarget('rqe_p10_riverland', (r) => { r[0] = SEAL; r[2] = Math.max(r[2], FAR); });
  retarget('rqe_p10_park_lip', (r) => { r[2] = SEAL; });
  for (const ch of Object.values(CH)) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => !/^rqp10h_edge_h_/.test(o.id) && !/^rqp10h_park_e_/.test(o.id));
  }

  paint([OLD, 64, SEAL, 67.5], 'S');
  paint([OLD, 67.5, SEAL, 76.5], null, road);
  paint([OLD, 76.5, SEAL, 80], 'S');
  paint([OLD, 132, SEAL, 136.5], 'S');
  paint([OLD, 136.5, SEAL, 143.5], null, road);
  paint([OLD, 143.5, SEAL, 146.5], 'G');
  paint([OLD, 146.5, SEAL, 153.5], null, road);
  paint([OLD, 153.5, SEAL, 158], 'S');
  paint([OLD, 80, ROAD, 132], 'S');
  paint([OLD, 158, ROAD, 192], 'S');
  paint([1456, 114, 1512, 128], 'S');
  paint([1468, 116, 1500, 126], 'G');
  paint([1520, 64, 1523.5, 214], 'S');
  paint([1523.5, 64, 1532.5, 214], null, road);
  paint([1532.5, 64, 1536, 214], 'S');
  paint([ROAD, 80, SEAL, 132], 'G');
  paint([ROAD, 158, SEAL, 192], 'G');
  paint([SEAL, 64, GX1, 192], 'K');
  paint([1450, 192, SEAL, 234], 'G');
  paint([1442, 206, 1592, 214], 'S');
  paint([1520, 192, 1536, 214], 'S');
  paint([1523.5, 192, 1532.5, 214], null, road);

  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqe_p10_east', [SEAL, 64, FAR, 234]);

  const list = [];
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10i_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    if (o.x >= 1440) list.push(o);
    else {
      const ch = CH.rqe_p10_e7;
      if (ch && ch.objects) ch.objects.push(o);
    }
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
  function remember(spec, parts) {
    const m = spec.mass, fg = 'rqe_p10i_' + spec.id;
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
    const m = spec.mass, st = spec.st, F = m.F, fg = 'rqe_p10i_' + spec.id, x = spec.x, y = spec.y;
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
      id: s.id, name: s.name, x: s.x, y: s.y, kind: s.kind, glass: s.glass, signs: s.signs,
      form: s.form || '整板', family: s.family || '', plate: s.nS + 'x' + s.nW,
      st: { podium: s.podium == null ? 1 : s.podium, setbackTop: 0, crownStone: 0, beltEvery: 0 },
      mass: {
        F: s.F, podiumNS: s.nS, podiumNW: s.nW, towerNS: s.nS, towerNW: s.nW, towerOff: 0,
        midFromTop: 0, midNS: s.nS, midNW: s.nW, crownNS: s.nS, crownNW: s.nW,
      },
    });
  }

  /* 双月研发：西裙 6×4、东裙 5×4，北侧 2 开间相连，南侧留一条凹口。塔身只落在西裙，顶上再收一圈。 */
  function twinCells(kind) {
    const s = new Set();
    const fill = (i0, i1, j0, j1) => {
      for (let i = i0; i < i1; i++) for (let j = j0; j < j1; j++) s.add(i * 100 + j);
    };
    if (kind === 'pod') {
      fill(0, 6, 0, 4);
      fill(6, 8, 2, 4);
      fill(8, 13, 0, 4);
    } else if (kind === 'tower') fill(0, 5, 0, 3);
    else fill(1, 4, 0, 2);
    return s;
  }
  function southKey(k) { const j = k % 100; return j === 0 ? -1 : ((k / 100) | 0) * 100 + (j - 1); }
  function westKey(k) { const i = (k / 100) | 0; return i === 0 ? -1 : (i - 1) * 100 + (k % 100); }
  function diffCells(a, b) {
    const s = new Set();
    for (const k of a) if (!b.has(k)) s.add(k);
    return s;
  }
  function buildTwin(spec) {
    const pod = twinCells('pod'), tower = twinCells('tower'), crown = twinCells('crown');
    for (const k of tower) if (!pod.has(k)) throw new Error('twin tower leaves the podium');
    for (const k of crown) if (!tower.has(k)) throw new Error('twin crown leaves the tower');
    const F = spec.mass.F, fg = 'rqe_p10i_' + spec.id, x = spec.x, y = spec.y;
    const plateAt = (f) => (f <= 3 ? pod : f <= 30 ? tower : crown);
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, cells = plateAt(f);
      for (const k of cells) {
        const i = (k / 100) | 0, j = k % 100;
        if (!cells.has(southKey(k))) {
          const face = faceOf(spec, f, F, 'S', i);
          const more = { z, state: face.forceGround || f === 1 ? 'ground' : 'upper', fade_group: fg, variant: face.variant };
          if (face.hdGlass) more.hdGlass = 1;
          if (face.sign) more.sign = face.sign;
          if (more.hdGlass && more.state === 'upper') more.night_lit = (f + i) % 4 !== 0 ? 1 : 0;
          put(spec.id + '_S' + f + '_' + i + '_' + j, 'f_wall', x + i * 3, y + j * 3, more);
        }
        if (!cells.has(westKey(k))) {
          const face = faceOf(spec, f, F, 'W', j);
          const more = { z, rot: 6, state: face.forceGround || f === 1 ? 'ground' : 'upper', fade_group: fg, variant: face.variant };
          if (face.hdGlass) more.hdGlass = 1;
          if (face.sign) more.sign = face.sign;
          if (more.hdGlass && more.state === 'upper') more.night_lit = (f * 3 + j) % 4 !== 0 ? 1 : 0;
          put(spec.id + '_W' + f + '_' + i + '_' + j, 'f_wall', x + i * 3, y + (j + 1) * 3, more);
        }
      }
    }
    const levels = [];
    const push = (z, exposed, lower) => { if (exposed && exposed.size && lower && lower.size) levels.push({ z, exposed, lower }); };
    push(3 * 3, diffCells(pod, tower), pod);
    push(30 * 3, diffCells(tower, crown), tower);
    push(F * 3, crown, crown);
    let n = 0, mech = null;
    for (const lv of levels) {
      const top = lv.z === F * 3;
      for (const k of lv.exposed) {
        const i = (k / 100) | 0, j = k % 100;
        const south = !lv.lower.has(southKey(k));
        const west = !lv.lower.has(westKey(k));
        const variant = south && west ? 'sw' : south ? 's' : west ? 'w' : 'in';
        put(spec.id + '_dk' + n, 'rq_hd_deck', x + i * 3, y + j * 3, { z: lv.z, fade_group: fg, variant });
        if (south) put(spec.id + '_ls' + n, 'rq_hd_lip', x + i * 3, y + j * 3, { z: lv.z, fade_group: fg });
        if (west) put(spec.id + '_lw' + n, 'rq_hd_lipw', x + i * 3, y + j * 3, { z: lv.z, fade_group: fg });
        if (top && !south && !west) mech = [i, j];
        n++;
      }
    }
    if (!mech) {
      let best = null, score = -1;
      for (const k of crown) {
        const i = (k / 100) | 0, j = k % 100, sc = i + j;
        if (sc >= score) { score = sc; best = [i, j]; }
      }
      mech = best;
    }
    if (mech) put(spec.id + '_mech', 'rq_hd_mech', x + mech[0] * 3, y + mech[1] * 3, { z: F * 3, fade_group: fg });
    remember(spec, [[x, y, x + 18, y + 12], [x + 18, y + 6, x + 24, y + 12], [x + 24, y, x + 39, y + 12]]);
  }

  buildMass({
    id: 'ay', name: '岸砚科研', x: 1462, y: 164, kind: 'work', glass: 'hd_g_sl', form: '退台板', family: '淡灰高透', plate: '7x3',
    signs: [{ face: 'S', floor: 1, bay: 4, text: '岸砚科研' }],
    st: { podium: 3, setbackTop: 4, crownStone: 1, beltEvery: 0 },
    mass: { F: 22, podiumNS: 10, podiumNW: 4, towerNS: 7, towerNW: 3, towerOff: 1, midFromTop: 0, midNS: 7, midNW: 3, crownNS: 5, crownNW: 2 },
  });
  buildMass({
    id: 'cc', name: '澄澜中心', x: 1544, y: 164, kind: 'work', glass: 'hd_g_yl', form: '点式塔', family: '淡金', plate: '4x4',
    signs: [{ face: 'S', floor: 1, bay: 3, text: '澄澜中心' }],
    st: { podium: 3, setbackTop: 3, crownStone: 1, beltEvery: 0 },
    mass: { F: 28, podiumNS: 7, podiumNW: 6, towerNS: 4, towerNW: 4, towerOff: 1, midFromTop: 0, midNS: 4, midNW: 4, crownNS: 3, crownNW: 3 },
  });
  buildTwin({
    id: 'sy', name: '双月研发', x: 1474, y: 88, kind: 'work', glass: 'hd_g_cj', form: '双裙楼', family: '蓝灰渐变', plate: '5x3',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '双月研发' }],
    st: { podium: 3, setbackTop: 0, crownStone: 2, beltEvery: 0 },
    mass: { F: 33, podiumNS: 13, podiumNW: 4, towerNS: 5, towerNW: 3, towerOff: 0, midFromTop: 0, midNS: 5, midNW: 3, crownNS: 3, crownNW: 2 },
  });
  box({ id: 'ld', name: '澜东居', x: 1498, y: 166, nS: 5, nW: 3, F: 19, podium: 2, glass: 'hd_g_wm', kind: 'home', family: '冷青绿', signs: [{ face: 'S', floor: 1, bay: 2, text: '澜东居' }] });
  box({ id: 'ly', name: '澜月居', x: 1572, y: 166, nS: 3, nW: 3, F: 12, podium: 2, glass: 'hd_g_dl', kind: 'home', family: '石材开窗', signs: [{ face: 'S', floor: 1, bay: 1, text: '澜月居' }] });
  box({ id: 'bk', name: '澄澜书店', x: 1456, y: 88, nS: 4, nW: 3, F: 2, podium: 1, glass: 'hd_g_yh', kind: 'shop', family: '淡蓝高透', signs: [{ face: 'S', floor: 1, bay: 1, text: '澄澜书店' }] });
  box({ id: 'tp', name: '南街茶铺', x: 1456, y: 102, nS: 5, nW: 3, F: 2, podium: 1, glass: 'hd_g_hd', kind: 'shop', family: '淡灰中透', signs: [{ face: 'S', floor: 1, bay: 2, text: '南街茶铺' }] });
  box({ id: 'cv', name: '澜东便利', x: 1566, y: 108, nS: 4, nW: 3, F: 2, podium: 1, glass: 'hd_g_yl2', kind: 'shop', family: '米黄石材', signs: [{ face: 'S', floor: 1, bay: 1, text: '澜东便利' }] });
  box({ id: 'gy', name: '澜东健身', x: 1544, y: 108, nS: 6, nW: 4, F: 3, podium: 1, glass: 'hd_g_yx', kind: 'gym', family: '淡蓝中透', signs: [{ face: 'S', floor: 2, bay: 2, text: '澜东健身' }] });
  box({ id: 'pk', name: '澜东亭', x: 1560, y: 220, nS: 2, nW: 1, F: 1, podium: 1, kind: 'park', form: '亭', signs: [{ face: 'S', floor: 1, bay: 0, text: '澜东亭' }] });

  function tree(x, y, variant) { put('tr_' + variant + '_' + x + '_' + y, 'rq_x_tree', x, y, { variant, fade_group: 'rqe_p10i_tree' }); }
  const onCross = (x) => x >= 1518 && x <= 1538;
  for (let x = 1452; x <= 1584; x += 12) {
    if (onCross(x)) continue;
    tree(x, 134.2, 'ginkgo'); tree(x, 155.6, 'ginkgo'); tree(x, 65.6, 'ginkgo'); tree(x, 78.2, 'ginkgo');
  }
  for (let x = 1460; x <= 1580; x += 20) {
    if (onCross(x)) continue;
    tree(x, 228, (x / 20) % 2 ? 'sakura' : 'ginkgo');
  }
  for (let x = 1464; x <= 1584; x += 24) {
    if (onCross(x)) continue;
    tree(x, 198, 'ginkgo');
  }
  for (const [x, y] of [[1472, 118], [1488, 120], [1504, 118], [1476, 200], [1552, 204]]) tree(x, y, 'sakura');
  for (let y = 66; y <= 190; y += 2) put('edge_h_' + y, 'p_hedge', 1597.6, y, { rot: 6, fade_group: 'rqe_p10i_edge' });
  for (let y = 196; y <= 230; y += 3) put('park_e_' + y, 'p_hedge', 1596.4, y, { rot: 6, fade_group: 'rqe_p10i_edge' });
  for (let x = 1448; x <= 1592; x += 4) put('park_n_' + x, 'p_hedge', x, 232.4, { fade_group: 'rqe_p10i_edge' });
  for (const x of [1468, 1496, 1508, 1552, 1576]) {
    if (onCross(x)) continue;
    put('lamp_s_' + x, 'p_lamp', x, 133.2, { interact: 'lamp' });
    put('lamp_n_' + x, 'p_lamp', x, 156.4, { interact: 'lamp' });
    put('lamp_ss_' + x, 'p_lamp', x, 78.2, { interact: 'lamp' });
  }
  for (const [x, y] of [[1464, 126], [1496, 126], [1552, 124], [1472, 204], [1568, 204]]) put('lamp_' + x + '_' + y, 'p_lamp', x, y, { interact: 'lamp' });
  for (const [x, y, rot] of [[1464, 122, 0], [1496, 122, 0], [1476, 204, 0], [1564, 204, 0]]) put('bench_' + x + '_' + y, 'community_bench', x, y, { rot });

  const feet = built.flatMap((b) => b.parts);
  const hit = (o, rect, pad) => o.x > rect[0] - pad && o.x < rect[2] + pad && o.y > rect[1] - pad && o.y < rect[3] + pad;
  const propHit = (o) => {
    if (!o) return false;
    const pad = o.type === 'rq_x_tree' ? 2.2 : (o.type === 'p_lamp' || o.type === 'p_hedge' || o.type === 'community_bench' || o.type === 'rq_x_shrub' ? 0.5 : 0);
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
  root.SCENE_CHUNKS.rqe_p10_e8 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p10_e8', name: '河东澜东', rect: [1400, 8, 1680, 280], src: 'js/rongqiao_expand_p10h.js', load_m: 40, unload_m: 80 });

  const P = N.expansionP10;
  P.slice = 10;
  P.avenue = [300.05, 132, ROAD, 158];
  P.south = [368, 64, ROAD, 80];
  P.district = [356, 64, SEAL, 192];
  P.terminus = [ROAD, 64, SEAL, 192];
  P.names.cross6 = '澜东路';
  P.cross6 = [1520, 64, 1536, 214];
  if (P.amenities) P.amenities.park = [356, 192, SEAL, 234];
  const towers = built.filter((b) => b.kind === 'work');
  P.east10 = {
    unconfirmed: true,
    east: [1450, SEAL],
    ground: GX1,
    park: [356, 192, SEAL, 234],
    plaza: [1456, 114, 1512, 128],
    cross: P.cross6.slice(),
    cap: 120,
    buildings: built,
    towers,
  };
  P.reasons.east10 = '第十片：可玩东界从 1450 收到 1600（+150 m），地面到 1620。拆掉第九片 1447 m 绿篱。河东大道和澜石南街铺到 1584，再往东到 1600 仍是路面，两侧是银杏绿地，1597 m 一带一道绿篱围挡。澜东路是 16 m 南北次干（x 1520–1536），南接澜石南街，北接到堤岸步道，路口不断。岸砚科研 22 层退台板（淡灰高透，塔身 7×3，顶部收到 5×2）、澄澜中心 28 层点式塔（淡金，塔身 4×4）、双月研发 33 层双裙楼（蓝灰渐变，西裙落塔，南侧留凹口）。三栋的层数、平面和剪影互不相同，也不跟已有十一栋或东澄三栋同高同板。澜东居 19 层冷青绿，澜月居 12 层石材开窗。沿南街是澄澜书店、南街茶铺，澜东路东侧是澜东便利。澜东广场在大道南侧，澜东健身是 3 层淡蓝中透外壳，没有室内。河东堤岸公园沿干地收到 x 1600、y 192–234，步道、银杏和樱花继续；月河水面仍停在折弯 x 356，y 234 以上仍封着。屋面按开间铺石材板。墙皮是浅石材和已有冷玻璃，不回榕桥暖砖，不用南埠白幕墙，不新开图集页。新块 rqe_p10_e8 和上一块矩形重叠，载入距离仍是 40 m。分块状态袋上限仍是 120，整图 81 块。不做 438 m 月河新城塔，不加河东公交，不南扩。名字和尺寸未经确认。';

  for (const lab of N.mapLabels || []) if (lab.name === '河东堤岸公园') lab.rect = [356, 192, SEAL, 234];
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '澜东广场', rect: [1456, 114, 1512, 128], kind: 'park', prio: 1 },
    { name: '澜东健身', rect: [1544, 108, 1562, 120], kind: 'life', prio: 1 },
  ]);
  for (const p of N.mapPois || []) {
    if (p.id === 'p10_edge') { p.x = 1590; p.y = 145; p.desc = '大道尽头的银杏绿地和围挡。名字未经确认'; }
    if (p.id === 'p10_park') p.desc = '月河北侧干地，从 x360 收到 x1600。水面仍在折弯。名字未经确认';
  }
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_e_ay', name: '岸砚科研', x: 1474, y: 161, desc: '22 层退台板。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_e_cc', name: '澄澜中心', x: 1554, y: 161, desc: '28 层点式塔。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_e_sy', name: '双月研发', x: 1482, y: 85, desc: '33 层双裙楼。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_e_ld', name: '澜东居', x: 1504, y: 163, desc: '19 层住宅。只是外观。名字和层数未经确认', cat: 'home' },
    { id: 'p10_e_ly', name: '澜月居', x: 1576, y: 163, desc: '12 层住宅。只是外观。名字和层数未经确认', cat: 'home' },
    { id: 'p10_e_bk', name: '澄澜书店', x: 1462, y: 85, desc: '沿街小铺。只是外观。名字未经确认', cat: 'shop' },
    { id: 'p10_e_tp', name: '南街茶铺', x: 1464, y: 99, desc: '沿街小铺。只是外观。名字未经确认', cat: 'shop' },
    { id: 'p10_e_cv', name: '澜东便利', x: 1572, y: 105, desc: '沿街小铺。只是外观。名字未经确认', cat: 'shop' },
    { id: 'p10_e_gy', name: '澜东健身', x: 1552, y: 105, desc: '3 层健身外壳。没有室内。名字未经确认', cat: 'life' },
    { id: 'p10_e_ldpl', name: '澜东广场', x: 1484, y: 120, desc: '大道南侧硬地广场。名字未经确认', cat: 'park' },
    { id: 'p10_cross6', name: '澜东路', x: 1522, y: 110, desc: '16 m 次干，接到南街、大道和堤岸。名字和路宽未经确认', cat: 'life' },
  ]);
})();
