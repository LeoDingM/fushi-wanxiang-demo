/* 月河区 · 河东新城东澄 (2026-10-26). 接在街坊加密之后。
 * 可玩东界从 1300 收到 1450（+150 m），地面到 1470。拆掉第七片 x 1297.6 绿篱和东侧封边。
 * 河东大道、澜石南街铺到新东界。东月路是 16 m 南北次干，南接南街、北接到堤岸步道，路口不断。
 * 河东堤岸公园沿干地收到 x 1450（y192–234）。水面仍停在折弯 x356，不新开河。y234 以上仍封着。
 * 混合街区：三栋办公／科研塔（方点、宽板、L 型，层数和色族互不克隆，也不克隆已有十一栋）、
 * 两栋住宅、沿街小铺、东澄广场、东月小学外壳。银杏行道树，广场和堤岸夹樱花。
 * 屋面仍按开间铺石材板，排序盒贴着本跨。不回榕桥暖砖，不用南埠白幕墙，不新开图集页，不开新室内。
 * 分块状态袋上限从 80 抬到 120。新块接在生活街后面，和上一块矩形重叠，load_m 仍是 40。
 * 不做 438 m 塔，不加河东公交，不南扩。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10f || D.rongqiaoExpandP10g || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10g = 1;
  const G = D.ground, CH = root.SCENE_CHUNKS || {}, BX1 = 1450, GX1 = 1470;
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
  const FAR = 1510, OLD = 1284, ROAD = 1434, SEAL = 1450;
  for (const id of ['rqe_p10_south', 'rqe_p10_north', 'rqe_p10_north_e', 'rqe_p10b_south', 'rqe_p10b_north']) {
    retarget(id, (r) => { r[2] = Math.max(r[2], FAR); });
  }
  retarget('rqe_p10_riverland', (r) => { r[0] = SEAL; r[2] = Math.max(r[2], FAR); });
  retarget('rqe_p10_park_lip', (r) => { r[2] = SEAL; });
  for (const ch of Object.values(CH)) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => !/^rqp10e_edge_h_/.test(o.id) && !/^rqp10e_park_e_/.test(o.id));
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
  paint([1336, 108, 1354, 122], 'G');
  paint([1394, 108, 1422, 124], 'G');
  paint([1368, 64, 1371.5, 214], 'S');
  paint([1371.5, 64, 1380.5, 214], null, road);
  paint([1380.5, 64, 1384, 214], 'S');
  paint([ROAD, 80, SEAL, 132], 'G');
  paint([ROAD, 158, SEAL, 192], 'G');
  paint([SEAL, 64, GX1, 192], 'K');
  paint([1300, 192, SEAL, 234], 'G');
  paint([1292, 206, 1442, 214], 'S');
  paint([1368, 192, 1384, 214], 'S');
  paint([1371.5, 192, 1380.5, 214], null, road);

  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqe_p10_east', [SEAL, 64, FAR, 234]);

  const list = [];
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10h_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    if (o.x >= 1290) list.push(o);
    else {
      const key = o.x >= 1140 ? 'rqe_p10_e6' : o.x >= 960 ? 'rqe_p10_e5' : o.x >= 820 ? 'rqe_p10_e4' : 'rqe_p10_e3';
      const ch = CH[key];
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
    const m = spec.mass, fg = 'rqe_p10h_' + spec.id;
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
    const m = spec.mass, st = spec.st, F = m.F, fg = 'rqe_p10h_' + spec.id, x = spec.x, y = spec.y;
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

  /* 东砚科研：L 型。东南角缺一截，西南能看见退进的南立面。塔身沿 L 收一圈，顶上再收到西侧方块。 */
  function lCells(kind) {
    const s = new Set();
    const fill = (i0, i1, j0, j1, cut) => {
      for (let i = i0; i < i1; i++) for (let j = j0; j < j1; j++) {
        if (cut && cut(i, j)) continue;
        s.add(i * 100 + j);
      }
    };
    if (kind === 'pod') fill(0, 10, 0, 6, (i, j) => i >= 6 && j < 2);
    else if (kind === 'tower') fill(0, 8, 1, 6, (i, j) => i >= 5 && j < 3);
    else fill(1, 5, 2, 6);
    return s;
  }
  function southKey(k) { const j = k % 100; return j === 0 ? -1 : ((k / 100) | 0) * 100 + (j - 1); }
  function westKey(k) { const i = (k / 100) | 0; return i === 0 ? -1 : (i - 1) * 100 + (k % 100); }
  function diffCells(a, b) {
    const s = new Set();
    for (const k of a) if (!b.has(k)) s.add(k);
    return s;
  }
  function buildL(spec) {
    const pod = lCells('pod'), tower = lCells('tower'), crown = lCells('crown');
    for (const k of tower) if (!pod.has(k)) throw new Error('L tower leaves the podium');
    for (const k of crown) if (!tower.has(k)) throw new Error('L crown leaves the tower');
    const F = spec.mass.F, fg = 'rqe_p10h_' + spec.id, x = spec.x, y = spec.y;
    const plateAt = (f) => (f <= 4 ? pod : f <= 24 ? tower : crown);
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
    push(4 * 3, diffCells(pod, tower), pod);
    push(24 * 3, diffCells(tower, crown), tower);
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
    remember(spec, [[x, y, x + 18, y + 18], [x + 18, y + 6, x + 30, y + 18]]);
  }

  buildL({
    id: 'dy', name: '东砚科研', x: 1308, y: 164, kind: 'work', glass: 'hd_g_ls', form: 'L型', family: '深蓝低透', plate: 'L10x6',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '东砚科研' }],
    st: { podium: 4, setbackTop: 0, crownStone: 2, beltEvery: 5 },
    mass: { F: 30, podiumNS: 10, podiumNW: 6, towerNS: 8, towerNW: 5, towerOff: 0, midFromTop: 0, midNS: 8, midNW: 5, crownNS: 4, crownNW: 4 },
  });
  buildMass({
    id: 'ja', name: '金岸大厦', x: 1390, y: 88, kind: 'work', glass: 'hd_g_yl', form: '宽板', family: '淡金高档', plate: '9x3',
    signs: [{ face: 'S', floor: 1, bay: 4, text: '金岸大厦' }],
    st: { podium: 3, setbackTop: 0, crownStone: 1, beltEvery: 0 },
    mass: { F: 33, podiumNS: 12, podiumNW: 4, towerNS: 9, towerNW: 3, towerOff: 1, midFromTop: 6, midNS: 7, midNW: 3, crownNS: 7, crownNW: 3 },
  });
  buildMass({
    id: 'ce', name: '澄东中心', x: 1392, y: 164, kind: 'work', glass: 'hd_g_sl', form: '方点塔', family: '淡灰高透', plate: '5x5',
    signs: [{ face: 'S', floor: 1, bay: 3, text: '澄东中心' }],
    st: { podium: 3, setbackTop: 0, crownStone: 1, beltEvery: 0 },
    mass: { F: 24, podiumNS: 7, podiumNW: 5, towerNS: 5, towerNW: 5, towerOff: 1, midFromTop: 0, midNS: 5, midNW: 5, crownNS: 5, crownNW: 5 },
  });
  box({ id: 'qa', name: '栖岸居', x: 1346, y: 166, nS: 5, nW: 4, F: 16, podium: 2, glass: 'hd_g_yx', kind: 'home', family: '淡蓝中透', signs: [{ face: 'S', floor: 1, bay: 2, text: '栖岸居' }] });
  box({ id: 'cl', name: '澄东里', x: 1418, y: 164, nS: 4, nW: 5, F: 18, podium: 2, glass: 'hd_g_yl2', kind: 'home', family: '米黄石材开窗', signs: [{ face: 'S', floor: 1, bay: 1, text: '澄东里' }] });
  box({ id: 'mg', name: '东月面馆', x: 1310, y: 86, nS: 5, nW: 3, F: 2, podium: 1, glass: 'hd_g_hd', kind: 'shop', family: '淡灰中透', signs: [{ face: 'S', floor: 1, bay: 2, text: '东月面馆' }] });
  box({ id: 'fl', name: '澄东花店', x: 1330, y: 86, nS: 4, nW: 3, F: 2, podium: 1, glass: 'hd_g_yh', kind: 'shop', family: '淡蓝高透', signs: [{ face: 'S', floor: 1, bay: 1, text: '澄东花店' }] });
  box({ id: 'st', name: '岸口文具', x: 1346, y: 88, nS: 4, nW: 2, F: 3, podium: 1, glass: 'hd_g_wm', kind: 'shop', family: '冷青绿', signs: [{ face: 'S', floor: 1, bay: 1, text: '岸口文具' }] });
  box({ id: 'ps', name: '东月小学', x: 1310, y: 104, nS: 6, nW: 4, F: 4, podium: 1, glass: 'hd_g_qp', kind: 'school', family: '石墨低透', signs: [{ face: 'S', floor: 2, bay: 2, text: '东月小学' }] });
  box({ id: 'pk', name: '东澄亭', x: 1404, y: 220, nS: 2, nW: 1, F: 1, podium: 1, kind: 'park', form: '亭', signs: [{ face: 'S', floor: 1, bay: 0, text: '东澄亭' }] });

  function tree(x, y, variant) { put('tr_' + variant + '_' + x + '_' + y, 'rq_x_tree', x, y, { variant, fade_group: 'rqe_p10h_tree' }); }
  const onCross = (x) => x > 1366 && x < 1386;
  for (let x = 1284; x <= 1440; x += 12) {
    if (onCross(x)) continue;
    tree(x, 134.2, 'ginkgo'); tree(x, 155.6, 'ginkgo'); tree(x, 65.6, 'ginkgo'); tree(x, 78.2, 'ginkgo');
  }
  for (let x = 1308; x <= 1436; x += 20) tree(x, 228, (x / 20) % 2 ? 'sakura' : 'ginkgo');
  for (let x = 1312; x <= 1424; x += 24) tree(x, 198, 'ginkgo');
  for (const [x, y] of [[1344, 114], [1408, 116], [1416, 200], [1332, 222], [1360, 228]]) tree(x, y, 'sakura');
  for (let y = 66; y <= 190; y += 2) put('edge_h_' + y, 'p_hedge', 1447.6, y, { rot: 6, fade_group: 'rqe_p10h_edge' });
  for (let y = 196; y <= 230; y += 3) put('park_e_' + y, 'p_hedge', 1446.4, y, { rot: 6, fade_group: 'rqe_p10h_edge' });
  for (let x = 1292; x <= 1444; x += 4) put('park_n_' + x, 'p_hedge', x, 232.4, { fade_group: 'rqe_p10h_edge' });
  for (const x of [1308, 1332, 1356, 1404, 1428]) {
    put('lamp_s_' + x, 'p_lamp', x, 133.2, { interact: 'lamp' });
    put('lamp_n_' + x, 'p_lamp', x, 156.4, { interact: 'lamp' });
    put('lamp_ss_' + x, 'p_lamp', x, 78.2, { interact: 'lamp' });
  }
  for (const [x, y] of [[1340, 126], [1404, 126], [1376, 200], [1320, 204]]) put('lamp_' + x + '_' + y, 'p_lamp', x, y, { interact: 'lamp' });
  for (const [x, y, rot] of [[1344, 120, 0], [1408, 122, 0], [1324, 204, 0], [1420, 204, 0]]) put('bench_' + x + '_' + y, 'community_bench', x, y, { rot });
  put('flag', 'rq_s_flag', 1332, 110, { fade_group: 'rqe_p10h_ps' });

  const feet = built.flatMap((b) => b.parts);
  const keepProp = (o) => !feet.some((f) => root.hedongHitsTower(o, f));
  const kept = list.filter(keepProp);
  list.length = 0;
  for (const o of kept) list.push(o);
  for (const ch of Object.values(CH)) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => !/^rqp10h_/.test(o.id) || keepProp(o));
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p10_e7 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p10_e7', name: '河东东澄', rect: [1240, 8, 1520, 280], src: 'js/rongqiao_expand_p10g.js', load_m: 40, unload_m: 80 });

  const P = N.expansionP10;
  P.slice = 9;
  P.avenue = [300.05, 132, ROAD, 158];
  P.south = [368, 64, ROAD, 80];
  P.district = [356, 64, SEAL, 192];
  P.terminus = [ROAD, 64, SEAL, 192];
  P.names.cross5 = '东月路';
  P.cross5 = [1368, 64, 1384, 214];
  if (P.amenities) P.amenities.park = [356, 192, SEAL, 234];
  const towers = built.filter((b) => b.kind === 'work');
  P.east9 = {
    unconfirmed: true,
    east: [1300, SEAL],
    ground: GX1,
    park: [356, 192, SEAL, 234],
    plaza: [1310, 100, 1360, 128],
    yard: [1332, 104, 1360, 126],
    cross: P.cross5.slice(),
    cap: 120,
    buildings: built,
    towers,
  };
  P.reasons.east = '第九片：可玩东界从 1300 收到 1450（+150 m），地面到 1470。拆掉第七片 1297 m 绿篱。河东大道和澜石南街铺到 1434，再往东到 1450 仍是路面，两侧是银杏绿地，1447 m 一带一道绿篱围挡。东月路是 16 m 南北次干（x 1368–1384），南接澜石南街，北接到堤岸步道，路口不断。东砚科研 30 层 L 型（东南缺角，深蓝低透）、金岸大厦 33 层宽板（淡金，塔身 9×3，上部收到 7×3）、澄东中心 24 层方点（5×5，淡灰高透）。三栋的层数、面宽、进深和剪影互不相同，也不跟已有十一栋同高同板。栖岸居 16 层淡蓝中透，澄东里 18 层米黄石材开窗。沿南街是东月面馆、澄东花店、岸口文具。东澄广场在小学北侧，东月小学是 4 层石墨玻璃外壳，没有室内。河东堤岸公园沿干地收到 x 1450、y 192–234，步道、银杏和樱花继续；月河水面仍停在折弯 x 356，y 234 以上仍封着。屋面按开间铺石材板。墙皮是浅石材和已有冷玻璃，不回榕桥暖砖，不用南埠白幕墙，不新开图集页。新块 rqe_p10_e7 和上一块矩形重叠，载入距离仍是 40 m。分块状态袋上限从 80 抬到 120，整图 80 块。不做 438 m 月河新城塔，不加河东公交，不南扩。名字和尺寸未经确认。';

  for (const lab of N.mapLabels || []) if (lab.name === '河东堤岸公园') lab.rect = [356, 192, SEAL, 234];
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '东澄广场', rect: [1310, 100, 1360, 128], kind: 'park', prio: 1 },
    { name: '东月小学', rect: [1310, 104, 1328, 116], kind: 'campus', prio: 1 },
  ]);
  for (const p of N.mapPois || []) {
    if (p.id === 'p10_edge') { p.x = 1440; p.y = 145; p.desc = '大道尽头的银杏绿地和围挡。名字未经确认'; }
    if (p.id === 'p10_park') p.desc = '月河北侧干地，从 x360 收到 x1450。水面仍在折弯。名字未经确认';
  }
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_e_dy', name: '东砚科研', x: 1316, y: 161, desc: '30 层 L 型科研楼。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_e_ja', name: '金岸大厦', x: 1402, y: 84, desc: '33 层淡金宽板。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_e_ce', name: '澄东中心', x: 1402, y: 161, desc: '24 层方点塔。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_e_qa', name: '栖岸居', x: 1354, y: 163, desc: '16 层住宅。只是外观。名字和层数未经确认', cat: 'home' },
    { id: 'p10_e_cl', name: '澄东里', x: 1424, y: 161, desc: '18 层住宅。只是外观。名字和层数未经确认', cat: 'home' },
    { id: 'p10_e_mg', name: '东月面馆', x: 1318, y: 83, desc: '沿街小铺。只是外观。名字未经确认', cat: 'shop' },
    { id: 'p10_e_fl', name: '澄东花店', x: 1336, y: 83, desc: '沿街小铺。只是外观。名字未经确认', cat: 'shop' },
    { id: 'p10_e_st', name: '岸口文具', x: 1352, y: 85, desc: '沿街小铺。只是外观。名字未经确认', cat: 'shop' },
    { id: 'p10_e_ps', name: '东月小学', x: 1318, y: 100, desc: '4 层小学外壳。没有室内。名字未经确认', cat: 'school' },
    { id: 'p10_e_pl', name: '东澄广场', x: 1344, y: 118, desc: '大道南侧硬地广场。名字未经确认', cat: 'park' },
    { id: 'p10_cross5', name: '东月路', x: 1369.2, y: 110, desc: '16 m 次干，接到南街、大道和堤岸。名字和路宽未经确认', cat: 'life' },
  ]);
})();
