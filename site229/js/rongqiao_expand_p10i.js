/* 月河区 · 河东新城滨海 (2026-10-26). 接在澜东之后。
 * 可玩东界从 1600 收到 1750（+150 m），地面到 1770。拆掉第十片 x 1597 m 绿篱和堤岸东篱。
 * 河东大道、澜石南街铺到 1704，接到新的 16 m 南北次干滨海路（x 1688–1704）。路口不断，没有断头路。
 * 滨海路以东是滨海步道（x 1704–1724），再往东是澜海海面。堤岸公园沿干地收到步道，不在路面上封死。
 * 混合街区：三栋办公／酒店塔（错台、折板、砌体点塔，层数、平面和材料互不克隆）、两栋住宅、沿街小铺、滨海广场、滨海社康外壳。
 * 银杏行道树，广场、堤岸和步道夹樱花。屋面仍按开间铺石材板。不回榕桥暖砖，不用南埠白幕墙，不新开图集页，不开新室内。
 * 新块接在澜东后面，和上一块矩形重叠，load_m 仍是 40。分块状态袋上限仍是 120。
 * 不做 438 m 塔，不加河东公交，不南扩。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10h || D.rongqiaoExpandP10i || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10i = 1;
  const G = D.ground, CH = root.SCENE_CHUNKS || {}, BX1 = 1750, GX1 = 1770;
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
  const FAR = 1810, OLD = 1600, ROAD = 1704, SEAL = 1750;
  const CROSS0 = 1688, CROSS1 = 1704, PROM0 = 1704, PROM1 = 1724, SEA0 = 1724;
  for (const id of ['rqe_p10_south', 'rqe_p10_north', 'rqe_p10_north_e', 'rqe_p10b_south', 'rqe_p10b_north']) {
    retarget(id, (r) => { r[2] = Math.max(r[2], FAR); });
  }
  retarget('rqe_p10_riverland', (r) => { r[0] = SEAL; r[2] = Math.max(r[2], FAR); });
  retarget('rqe_p10_park_lip', (r) => { r[2] = SEAL; });
  for (const ch of Object.values(CH)) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => !/^rqp10i_edge_h_/.test(o.id) && !/^rqp10i_park_e_/.test(o.id));
  }

  paint([OLD, 64, ROAD, 67.5], 'S');
  paint([OLD, 67.5, ROAD, 76.5], null, road);
  paint([OLD, 76.5, ROAD, 80], 'S');
  paint([OLD, 132, ROAD, 136.5], 'S');
  paint([OLD, 136.5, ROAD, 143.5], null, road);
  paint([OLD, 143.5, ROAD, 146.5], 'G');
  paint([OLD, 146.5, ROAD, 153.5], null, road);
  paint([OLD, 153.5, ROAD, 158], 'S');
  paint([OLD, 80, CROSS0, 132], 'G');
  paint([OLD, 158, CROSS0, 192], 'G');
  paint([1584, 158, 1688, 192], 'S');
  paint([1612, 116, 1640, 128], 'S');
  paint([1616, 118, 1636, 126], 'G');
  /* 澜东路和滨海路之间原来是一整块草地。铺成院落和停车硬地，只留滨海广场那一小片草坪。 */
  paint([1584, 80, 1688, 132], 'S');
  paint([1616, 118, 1636, 126], 'G');
  paint([1584, 192, PROM1, 234], 'G');
  paint([1442, 206, PROM1, 214], 'S');
  paint([1520, 192, 1536, 214], 'S');
  paint([1523.5, 192, 1532.5, 214], null, road);
  paint([CROSS0, 64, 1691.5, 214], 'S');
  paint([1691.5, 64, 1700.5, 214], null, road);
  paint([1700.5, 64, CROSS1, 214], 'S');
  paint([CROSS0, 192, CROSS1, 214], 'S');
  paint([1691.5, 192, 1700.5, 214], null, road);
  paint([PROM0, 64, PROM1, 234], 'S');
  paint([1714, 68, PROM1, 230], 'G');
  const sea = (x, y) => (Math.round(x + y) % 7 === 0 ? 'U' : (Math.round(x) % 2 ? 'V' : 'W'));
  paint([SEA0, 64, GX1, 250], null, sea);

  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  const SEA = [SEA0, 64, GX1, 250];
  block('rqe_p10_sea', SEA);
  block('rqe_p10_east', [SEAL, 64, FAR, 250]);

  const list = [];
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10j_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    if (o.x >= 1590) list.push(o);
    else {
      const ch = CH.rqe_p10_e8;
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
    const m = spec.mass, fg = 'rqe_p10j_' + spec.id;
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
    const m = spec.mass, st = spec.st, F = m.F, fg = 'rqe_p10j_' + spec.id, x = spec.x, y = spec.y;
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

  /* 海风科研：裙楼 8×4，塔身 5×3 偏东一跨，上部再错一档。淡灰中透。17 层，约 51 m。 */
  buildMass({
    id: 'hf', name: '海风科研', x: 1612, y: 166, kind: 'work', glass: 'hd_g_hd', form: '错台', family: '淡灰中透', plate: '5x3',
    signs: [{ face: 'S', floor: 1, bay: 3, text: '海风科研' }],
    st: { podium: 3, setbackTop: 3, crownStone: 1, beltEvery: 0 },
    mass: { F: 17, podiumNS: 8, podiumNW: 4, towerNS: 5, towerNW: 3, towerOff: 2, midFromTop: 7, midNS: 4, midNW: 2, crownNS: 3, crownNW: 2 },
  });
  /* 澜湾酒店：裙楼 8×4，塔身 6×3 贴西，中段收成折板。淡蓝高透。26 层，约 78 m。 */
  buildMass({
    id: 'lw', name: '澜湾酒店', x: 1612, y: 86, kind: 'hotel', glass: 'hd_g_yh', form: '折板', family: '淡蓝高透', plate: '6x3',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '澜湾酒店' }],
    st: { podium: 3, setbackTop: 3, crownStone: 1, beltEvery: 0 },
    mass: { F: 26, podiumNS: 8, podiumNW: 4, towerNS: 6, towerNW: 3, towerOff: 0, midFromTop: 8, midNS: 4, midNW: 3, crownNS: 3, crownNW: 2 },
  });
  /* 滨石中心：6×6 石材裙，4×4 点塔，顶上再收。砌体开窗。31 层，约 93 m。 */
  buildMass({
    id: 'bs', name: '滨石中心', x: 1648, y: 164, kind: 'work', glass: 'hd_g_dl', form: '砌体点塔', family: '装饰艺术石材', plate: '4x4',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '滨石中心' }],
    st: { podium: 4, setbackTop: 4, crownStone: 2, beltEvery: 0 },
    mass: { F: 31, podiumNS: 6, podiumNW: 6, towerNS: 4, towerNW: 4, towerOff: 1, midFromTop: 0, midNS: 4, midNW: 4, crownNS: 2, crownNW: 2 },
  });
  box({ id: 'by', name: '滨月居', x: 1644, y: 86, nS: 4, nW: 3, F: 15, podium: 2, glass: 'hd_g_yx', kind: 'home', family: '淡蓝中透', signs: [{ face: 'S', floor: 1, bay: 1, text: '滨月居' }] });
  box({ id: 'hq', name: '海栖里', x: 1660, y: 86, nS: 4, nW: 4, F: 11, podium: 2, glass: 'hd_g_yl2', kind: 'home', family: '米黄石材', signs: [{ face: 'S', floor: 1, bay: 1, text: '海栖里' }] });
  box({ id: 'mg', name: '滨海面馆', x: 1612, y: 104, nS: 5, nW: 3, F: 2, podium: 1, glass: 'hd_g_hd', kind: 'shop', family: '淡灰中透', signs: [{ face: 'S', floor: 1, bay: 2, text: '滨海面馆' }] });
  box({ id: 'wj', name: '岸口文具', x: 1632, y: 104, nS: 4, nW: 3, F: 2, podium: 1, glass: 'hd_g_yl', kind: 'shop', family: '淡金', signs: [{ face: 'S', floor: 1, bay: 1, text: '岸口文具' }] });
  box({ id: 'sk', name: '滨海社康', x: 1648, y: 108, nS: 6, nW: 4, F: 3, podium: 1, glass: 'hd_g_ls', kind: 'clinic', family: '深蓝低透', signs: [{ face: 'S', floor: 2, bay: 2, text: '滨海社康' }] });
  box({ id: 'pk', name: '滨海亭', x: 1648, y: 214, nS: 2, nW: 1, F: 1, podium: 1, kind: 'park', form: '亭', signs: [{ face: 'S', floor: 1, bay: 0, text: '滨海亭' }] });
  /* 东肩补满：住宅、小铺、幼儿园和停车楼，不再留整块空垫。 */
  box({ id: 'hx', name: '岸西居', x: 1590, y: 84, nS: 6, nW: 4, F: 8, podium: 1, glass: 'hd_g_wm', kind: 'home', family: '冷青绿', signs: [{ face: 'S', floor: 1, bay: 2, text: '岸西居' }] });
  box({ id: 'hs', name: '岸西铺', x: 1590, y: 100, nS: 6, nW: 3, F: 2, podium: 1, glass: 'hd_g_sl', kind: 'shop', family: '淡灰高透', signs: [{ face: 'S', floor: 1, bay: 1, text: '岸西铺' }] });
  box({ id: 'hk', name: '滨海幼儿园', x: 1590, y: 116, nS: 6, nW: 4, F: 2, podium: 1, glass: 'hd_g_yx', kind: 'school', family: '淡蓝中透', signs: [{ face: 'S', floor: 1, bay: 2, text: '滨海幼儿园' }] });
  box({ id: 'eh', name: '海东居', x: 1674, y: 84, nS: 4, nW: 3, F: 7, podium: 1, glass: 'hd_g_qp', kind: 'home', family: '石墨低透', signs: [{ face: 'S', floor: 1, bay: 1, text: '海东居' }] });
  box({ id: 'es', name: '海东铺', x: 1674, y: 98, nS: 4, nW: 4, F: 2, podium: 1, glass: 'hd_g_yl2', kind: 'shop', family: '米黄石材', signs: [{ face: 'S', floor: 1, bay: 1, text: '海东铺' }] });
  box({ id: 'ep', name: '海东停车楼', x: 1674, y: 114, nS: 4, nW: 4, F: 4, podium: 1, glass: 'hd_g_hd', kind: 'parking', family: '淡灰中透', signs: [{ face: 'S', floor: 1, bay: 1, text: '海东停车楼' }] });
  box({ id: 'mp', name: '岸心停车楼', x: 1648, y: 97, nS: 3, nW: 3, F: 3, podium: 1, glass: 'hd_g_ls', kind: 'parking', family: '深蓝低透', signs: [{ face: 'S', floor: 1, bay: 1, text: '岸心停车楼' }] });
  box({ id: 'nb', name: '岸北居', x: 1588, y: 164, nS: 6, nW: 4, F: 6, podium: 1, glass: 'hd_g_yx', kind: 'home', family: '淡蓝中透', signs: [{ face: 'S', floor: 1, bay: 2, text: '岸北居' }] });
  box({ id: 'ns', name: '岸北铺', x: 1588, y: 180, nS: 6, nW: 3, F: 2, podium: 1, glass: 'hd_g_sl', kind: 'shop', family: '淡灰高透', signs: [{ face: 'S', floor: 1, bay: 1, text: '岸北铺' }] });
  box({ id: 'eb', name: '海北居', x: 1668, y: 164, nS: 5, nW: 4, F: 6, podium: 1, glass: 'hd_g_qp', kind: 'home', family: '石墨低透', signs: [{ face: 'S', floor: 1, bay: 1, text: '海北居' }] });
  box({ id: 'en', name: '海北铺', x: 1668, y: 180, nS: 5, nW: 3, F: 2, podium: 1, glass: 'hd_g_yl', kind: 'shop', family: '淡金', signs: [{ face: 'S', floor: 1, bay: 1, text: '海北铺' }] });

  function tree(x, y, variant) { put('tr_' + variant + '_' + x + '_' + y, 'rq_x_tree', x, y, { variant, fade_group: 'rqe_p10j_tree' }); }
  const onCross = (x) => x >= 1686 && x <= 1706;
  for (let x = 1608; x <= 1692; x += 12) {
    if (onCross(x)) continue;
    tree(x, 134.2, 'ginkgo'); tree(x, 155.6, 'ginkgo'); tree(x, 65.6, 'ginkgo'); tree(x, 78.2, 'ginkgo');
  }
  for (let x = 1604; x <= 1712; x += 16) tree(x, 226, (x / 16) % 2 ? 'sakura' : 'ginkgo');
  for (const [x, y] of [[1620, 122], [1632, 124], [1616, 200], [1656, 220], [1716, 100], [1716, 180]]) tree(x, y, 'sakura');
  for (let x = 1600; x <= 1716; x += 4) {
    if (onCross(x)) continue;
    put('park_n_' + x, 'p_hedge', x, 232.4, { fade_group: 'rqe_p10j_edge' });
  }
  for (const x of [1616, 1640, 1664, 1676]) {
    put('lamp_s_' + x, 'p_lamp', x, 133.2, { interact: 'lamp' });
    put('lamp_n_' + x, 'p_lamp', x, 156.4, { interact: 'lamp' });
    put('lamp_ss_' + x, 'p_lamp', x, 78.2, { interact: 'lamp' });
  }
  for (const [x, y] of [[1624, 120], [1712, 150], [1652, 204], [1708, 200]]) put('lamp_' + x + '_' + y, 'p_lamp', x, y, { interact: 'lamp' });
  for (const [x, y, rot] of [[1624, 124, 0], [1652, 208, 0], [1710, 188, 6]]) put('bench_' + x + '_' + y, 'community_bench', x, y, { rot });

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
  if (N.water) N.water.push(SEA.slice());
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p10_e9 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p10_e9', name: '河东滨海', rect: [1560, 8, 1820, 280], src: 'js/rongqiao_expand_p10i.js', load_m: 40, unload_m: 80 });

  const P = N.expansionP10;
  P.slice = 11;
  P.avenue = [300.05, 132, ROAD, 158];
  P.south = [368, 64, ROAD, 80];
  P.district = [356, 64, SEAL, 192];
  P.terminus = [PROM0, 64, SEAL, 192];
  P.names.cross7 = '滨海路';
  P.cross7 = [CROSS0, 64, CROSS1, 214];
  if (P.amenities) P.amenities.park = [356, 192, SEAL, 234];
  const towers = built.filter((b) => b.kind === 'work' || b.kind === 'hotel');
  P.east11 = {
    unconfirmed: true,
    east: [1600, SEAL],
    ground: GX1,
    park: [356, 192, SEAL, 234],
    plaza: [1612, 116, 1640, 128],
    promenade: [PROM0, 64, PROM1, 234],
    sea: SEA.slice(),
    cross: P.cross7.slice(),
    cap: 120,
    buildings: built,
    towers,
  };
  P.reasons.east11 = '第十一片：可玩东界从 1600 收到 1750（+150 m），地面到 1770。拆掉第十片 1597 m 绿篱。河东大道和澜石南街铺到 1704，接到滨海路。滨海路是 16 m 南北次干（x 1688–1704），南接澜石南街，北接到堤岸步道，路口不断，没有断头路。步道在 x 1704–1724，再往东是澜海，岸线开始转成滨海。海风科研 17 层错台（淡灰中透，塔身 5×3，偏东一跨）、澜湾酒店 26 层折板（淡蓝高透，塔身 6×3，贴西）、滨石中心 31 层砌体点塔（装饰艺术石材，塔身 4×4）。三栋的层数、平面和材料互不相同，也不跟已有塔楼或澜东三栋同高同板。约 51 m、78 m、93 m，都不是 438 m。滨月居 15 层，海栖里 11 层。沿南街是滨海面馆、岸口文具。滨海广场在大道南侧，滨海社康是 3 层深蓝低透外壳，没有室内。河东堤岸公园沿干地收到 x 1750、y 192–234，步道、银杏和樱花继续。屋面按开间铺石材板。墙皮是浅石材和已有冷玻璃，不回榕桥暖砖，不用南埠白幕墙，不新开图集页。新块 rqe_p10_e9 和上一块矩形重叠，载入距离仍是 40 m。分块状态袋上限仍是 120，整图 82 块。不做 438 m 月河新城塔，不加河东公交，不南扩。名字和尺寸未经确认。';

  for (const lab of N.mapLabels || []) if (lab.name === '河东堤岸公园') lab.rect = [356, 192, SEAL, 234];
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '滨海广场', rect: [1612, 116, 1640, 128], kind: 'park', prio: 1 },
    { name: '滨海社康', rect: [1648, 108, 1666, 120], kind: 'life', prio: 1 },
    { name: '滨海步道', rect: [PROM0, 64, PROM1, 234], kind: 'park', prio: 1 },
    { name: '澜海', rect: SEA.slice(), kind: 'water', prio: 2 },
  ]);
  for (const p of N.mapPois || []) {
    if (p.id === 'p10_edge') { p.x = 1712; p.y = 145; p.desc = '滨海步道和澜海岸线。名字未经确认'; }
    if (p.id === 'p10_park') p.desc = '月河北侧干地，从 x360 收到 x1750，东端接到滨海步道。名字未经确认';
  }
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_e_hf', name: '海风科研', x: 1620, y: 163, desc: '17 层错台。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_e_lw', name: '澜湾酒店', x: 1620, y: 83, desc: '26 层折板酒店。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_e_bs', name: '滨石中心', x: 1656, y: 161, desc: '31 层砌体点塔。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_e_by', name: '滨月居', x: 1650, y: 83, desc: '15 层住宅。只是外观。名字和层数未经确认', cat: 'home' },
    { id: 'p10_e_hq', name: '海栖里', x: 1666, y: 83, desc: '11 层住宅。只是外观。名字和层数未经确认', cat: 'home' },
    { id: 'p10_e_mg', name: '滨海面馆', x: 1618, y: 101, desc: '沿街小铺。只是外观。名字未经确认', cat: 'shop' },
    { id: 'p10_e_wj', name: '岸口文具', x: 1638, y: 101, desc: '沿街小铺。只是外观。名字未经确认', cat: 'shop' },
    { id: 'p10_e_sk', name: '滨海社康', x: 1656, y: 105, desc: '3 层社康外壳。没有室内。名字未经确认', cat: 'life' },
    { id: 'p10_e_bhpl', name: '滨海广场', x: 1626, y: 122, desc: '大道南侧硬地广场。名字未经确认', cat: 'park' },
    { id: 'p10_cross7', name: '滨海路', x: 1692, y: 110, desc: '16 m 次干，接到南街、大道和堤岸。名字和路宽未经确认', cat: 'life' },
    { id: 'p10_sea', name: '澜海', x: 1712, y: 140, desc: '滨海步道上看东侧和东南侧的海。岸线未经确认', cat: 'life' },
  ]);
})();
