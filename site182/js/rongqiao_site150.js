/* Site150：月河区山脚再向西、向北收两级台地。
 * 南边 y-220 以外是海，东边 x1724 以外是澜海。北界 y432 以上仍是山体，Site149 那一块已经铺到 y428，再往北没有一整条街的进深。
 * 区界矩形仍是 [356, -220, 1750, 378]。西侧山体继续挡住 (400, 400) 和 (900, 400)，山径台地（600, 370）仍是草地。
 * 东月路从山径穿过挡土墙。墙东、与澜东路之间是下台（y396，接到 Site149）。墙西、挡土墙以北是上台（y408）。
 * 下台有住宅、铺面、菜场、小园和一栋 10 层折廊。上台有住宅、铺面、社康和小园。不进月河，不进澜海。
 * 新楼并进已有分块，不新开分块。不做 438 m 塔，南埠不往南。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10r || D.rongqiaoExpandP10s || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10s = 1;
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
  for (const k of P.keepLots || []) addBlock(k);
  for (const c of D.colliders || []) if (c && c.rect) addBlock(c.rect);
  for (const s of N.solids || []) addBlock(s);
  for (const w of N.water || []) addBlock(w);

  function overlaps(a, b) {
    return a[0] < b[2] - 0.05 && b[0] < a[2] - 0.05 && a[1] < b[3] - 0.05 && b[1] < a[3] - 0.05;
  }
  function subtract(a, hole) {
    const ix0 = Math.max(a[0], hole[0]), iy0 = Math.max(a[1], hole[1]);
    const ix1 = Math.min(a[2], hole[2]), iy1 = Math.min(a[3], hole[3]);
    if (!(ix0 < ix1 && iy0 < iy1)) return [a.slice()];
    const out = [];
    if (iy0 - a[1] > 0.2) out.push([a[0], a[1], a[2], iy0]);
    if (a[3] - iy1 > 0.2) out.push([a[0], iy1, a[2], a[3]]);
    if (ix0 - a[0] > 0.2) out.push([a[0], iy0, ix0, iy1]);
    if (a[2] - ix1 > 0.2) out.push([ix1, iy0, a[2], iy1]);
    return out;
  }
  function rectEq(a, b) {
    return a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
  }
  /* 东月路打开南侧挡土墙。下台接到澜东路和 Site149，上台在挡土墙北面再收一级。西侧封口留下。 */
  const GATE = [1368, 378, 1384, 390];
  const ROAD = [1368, 390, 1384, 428];
  const LOWER = [1384, 390, 1518, 428];
  const UPPER = [1208, 406, 1368, 428];
  const STAIR = [1344, 390, 1368, 406];
  function carveHole(hole) {
    const col = (D.colliders || []).find((c) => c && c.rect && c.rect[0] <= hole[0] + 0.01 && c.rect[1] <= hole[1] + 0.01 && c.rect[2] >= hole[2] - 0.01 && c.rect[3] >= hole[3] - 0.01);
    if (!col) throw new Error('site150 no seal for ' + hole.join(','));
    const old = col.rect.slice();
    const pieces = subtract(old, hole);
    N.solids = (N.solids || []).filter((s) => !rectEq(s, old));
    if (!pieces.length) {
      D.colliders = D.colliders.filter((c) => c !== col);
      return;
    }
    col.rect = pieces[0].slice();
    N.solids.push(col.rect.slice());
    for (let i = 1; i < pieces.length; i++) {
      const rect = pieces[i].slice();
      D.colliders.push({ id: col.id + '_s150_' + i, rect });
      N.solids.push(rect.slice());
    }
  }
  carveHole(GATE);
  carveHole(ROAD);
  carveHole(LOWER);
  carveHole(UPPER);
  carveHole(STAIR);
  blocked.length = 0;
  for (const c of D.colliders || []) if (c && c.rect) addBlock(c.rect);
  for (const w of N.water || []) addBlock(w);
  for (const k of P.keepLots || []) addBlock(k);
  function sealed(x, y) {
    return (D.colliders || []).some((c) => c && c.rect && x > c.rect[0] && x < c.rect[2] && y > c.rect[1] && y < c.rect[3]);
  }
  if (!sealed(400, 400) || !sealed(900, 400)) throw new Error('site150 west seal opened');
  if (sealed(1376, 400) || sealed(1450, 400) || sealed(1240, 412) || sealed(1356, 398)) throw new Error('site150 terrace still sealed');
  if (!sealed(1200, 400) || !sealed(1100, 400)) throw new Error('site150 retaining wall gone');
  if (!sealed(1560, 382)) throw new Error('site150 site149 wall gone');

  const G = D.ground;
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
  const GROVE_A = [1408, 412, 1492, 424];
  const GROVE_B = [1306, 418, 1352, 426];
  paint(LOWER, 'S');
  paint(UPPER, 'S');
  paint(STAIR, 'S');
  paint([1368, 362, 1384, 428], 'S');
  paint([1371.5, 362, 1380.5, 424], null, road);
  paint(GROVE_A, 'G');
  paint(GROVE_B, 'G');

  const CH = root.SCENE_CHUNKS || {};
  function pickChunk(x, y) {
    let best = null, area = Infinity;
    for (const c of D.chunks || []) {
      const r = c.rect;
      if (!r || x < r[0] || x >= r[2] || y < r[1] || y >= r[3]) continue;
      const a = (r[2] - r[0]) * (r[3] - r[1]);
      if (a < area && CH[c.id]) { area = a; best = c.id; }
    }
    if (best) return best;
    throw new Error('site150 no chunk ' + x + ',' + y);
  }
  const bags = {};
  const added = {};
  const CAP = 2400;
  function room(id, n) {
    const have = (CH[id] && CH[id].objects ? CH[id].objects.length : 0) + (added[id] || 0);
    return have + n <= CAP;
  }
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10t_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
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
  const used = new Set();
  function blocker(rect, pad) {
    const a0 = rect[0] - pad, a1 = rect[1] - pad, a2 = rect[2] + pad, a3 = rect[3] + pad;
    for (let i = 0; i < blocked.length; i++) {
      const b = blocked[i];
      if (a0 < b[2] && b[0] < a2 && a1 < b[3] && b[1] < a3) return b;
    }
    return null;
  }
  function block(id, rect) { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); addBlock(rect); }
  function remember(spec, parts) {
    const m = spec.mass, fg = 'rqe_p10t_' + spec.id;
    for (const r of parts) block(fg + '_' + r[0] + '_' + r[1], r);
    const rec = {
      id: fg, name: spec.name, x0: spec.x, y0: spec.y, W: m.podiumNS * 3, D: m.podiumNW * 3, F: m.F, floors: m.F,
      kind: spec.kind || 'home', form: spec.form || '', family: spec.family || '', glass: spec.glass || '',
      plate: spec.plate || (m.towerNS + 'x' + m.towerNW),
      parts: parts.map((r) => r.slice()), unconfirmed: true,
    };
    built.push(rec);
    used.add([rec.form, rec.F, rec.plate, rec.glass].join('|'));
    return rec;
  }
  function buildMass(spec) {
    const m = spec.mass, F = m.F, x = spec.x, y = spec.y;
    const foot = [x, y, x + m.podiumNS * 3, y + m.podiumNW * 3];
    const clash = blocker(foot, 0.9);
    if (clash) throw new Error('site150 footprint ' + spec.id + ' ' + foot.join(',') + ' vs ' + clash.join(','));
    const sig = [spec.form || '', F, spec.plate || '', spec.glass || ''].join('|');
    if (used.has(sig)) throw new Error('site150 clone ' + sig);
    const key = pickChunk(x + 1, y + 1);
    if (!room(key, estimate(spec))) throw new Error('site150 chunk room ' + spec.id + '@' + key);
    const fg = 'rqe_p10t_' + spec.id;
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
  function box(s) {
    return buildMass({
      id: s.id, name: s.name, x: s.x, y: s.y, kind: s.kind, glass: s.glass, family: s.family || '', signs: s.signs,
      form: s.form || (s.nS + 'x' + s.nW), plate: s.plate || (s.nS + 'x' + s.nW),
      st: { podium: 1, setbackTop: 0, crownStone: s.F > 1 ? 1 : 0, beltEvery: 0 },
      mass: {
        F: s.F, podiumNS: s.nS, podiumNW: s.nW, towerNS: s.nS, towerNW: s.nW, towerOff: 0,
        midFromTop: 0, midNS: s.nS, midNW: s.nW, crownNS: s.nS, crownNW: s.nW,
      },
    });
  }

  const Y = 396;
  /* 麓西折廊 10 层。裙楼 7×3 贴着下台，塔身 4×2 贴东（面宽大于进深），中段收到 3×2，冠是 2×2。
   * 蓝灰竖向渐变，约 30 m。层数、平面、材料和剪影都不跟已有塔相同，也不是 438 m。只有这一栋塔。 */
  buildMass({
    id: 'step', name: '麓西折廊', x: 1392, y: Y, kind: 'work', glass: 'hd_g_cj', form: '折廊', family: '蓝灰折廊', plate: '4x2',
    signs: [{ face: 'S', floor: 1, bay: 3, text: '麓西折廊' }],
    st: { podium: 2, setbackTop: 2, crownStone: 1, beltEvery: 0 },
    mass: { F: 10, podiumNS: 7, podiumNW: 3, towerNS: 4, towerNW: 2, towerOff: 3, midFromTop: 6, midNS: 3, midNW: 2, crownNS: 2, crownNW: 2 },
  });
  box({ id: 'h1', name: '麓西里', x: 1416, y: Y, nS: 4, nW: 3, F: 5, glass: 'hd_g_yx', kind: 'home', family: '麓西住宅', form: '里坊', signs: [{ face: 'S', floor: 1, bay: 1, text: '麓西里' }] });
  box({ id: 'sh1', name: '麓西茶铺', x: 1431, y: Y, nS: 3, nW: 3, F: 2, glass: 'hd_g_yh', kind: 'shop', family: '沿街铺', form: '茶铺', signs: [{ face: 'S', floor: 1, bay: 0, text: '麓西茶铺' }] });
  box({ id: 'sk', name: '麓西社康', x: 1443, y: Y, nS: 4, nW: 3, F: 3, glass: 'hd_g_ls', kind: 'clinic', family: '深蓝社康', form: '社康', signs: [{ face: 'S', floor: 2, bay: 1, text: '麓西社康' }] });
  box({ id: 'mk', name: '麓西菜场', x: 1458, y: Y, nS: 4, nW: 3, F: 2, glass: 'hd_g_dl', kind: 'market', family: '暖石菜场', form: '菜棚', plate: '4x3', signs: [{ face: 'S', floor: 1, bay: 1, text: '麓西菜场' }] });
  box({ id: 'h2', name: '台阶里', x: 1473, y: Y, nS: 3, nW: 3, F: 4, glass: 'hd_g_qp', kind: 'home', family: '麓西住宅', form: '台阶', signs: [{ face: 'S', floor: 1, bay: 0, text: '台阶里' }] });
  box({ id: 'h3', name: '折廊里', x: 1485, y: Y, nS: 4, nW: 3, F: 6, glass: 'hd_g_sl', kind: 'home', family: '麓西住宅', form: '折里', signs: [{ face: 'S', floor: 1, bay: 1, text: '折廊里' }] });
  box({ id: 'sh2', name: '麓西文具', x: 1500, y: Y, nS: 3, nW: 3, F: 2, glass: 'hd_g_wm', kind: 'shop', family: '沿街铺', form: '文具', signs: [{ face: 'S', floor: 1, bay: 0, text: '麓西文具' }] });
  box({ id: 'gp', name: '麓西亭', x: 1444, y: 414, nS: 2, nW: 2, F: 1, glass: 'hd_g_hd', kind: 'park', family: '亭', form: '亭', plate: '2x2', signs: [{ face: 'S', floor: 1, bay: 0, text: '麓西亭' }] });

  const YU = 408;
  box({ id: 'uh1', name: '上麓里', x: 1220, y: YU, nS: 4, nW: 3, F: 5, glass: 'hd_g_yh', kind: 'home', family: '上麓住宅', form: '上里', signs: [{ face: 'S', floor: 1, bay: 1, text: '上麓里' }] });
  box({ id: 'ush1', name: '上麓书店', x: 1235, y: YU, nS: 3, nW: 3, F: 2, glass: 'hd_g_sl', kind: 'shop', family: '沿街铺', form: '书店', signs: [{ face: 'S', floor: 1, bay: 0, text: '上麓书店' }] });
  box({ id: 'usk', name: '上麓社康', x: 1247, y: YU, nS: 4, nW: 3, F: 3, glass: 'hd_g_wm', kind: 'clinic', family: '冷青社康', form: '台康', signs: [{ face: 'S', floor: 2, bay: 1, text: '上麓社康' }] });
  box({ id: 'uh2', name: '叠院', x: 1262, y: YU, nS: 3, nW: 3, F: 3, glass: 'hd_g_ls', kind: 'home', family: '上麓住宅', form: '叠院', signs: [{ face: 'S', floor: 1, bay: 0, text: '叠院' }] });
  box({ id: 'uh3', name: '台地里', x: 1274, y: YU, nS: 4, nW: 3, F: 4, glass: 'hd_g_dl', kind: 'home', family: '上麓住宅', form: '台地', signs: [{ face: 'S', floor: 1, bay: 1, text: '台地里' }] });
  box({ id: 'ush2', name: '麓阶铺', x: 1289, y: YU, nS: 3, nW: 3, F: 2, glass: 'hd_g_qp', kind: 'shop', family: '沿街铺', form: '阶铺', signs: [{ face: 'S', floor: 1, bay: 0, text: '麓阶铺' }] });
  box({ id: 'ugp', name: '上麓亭', x: 1312, y: 418, nS: 2, nW: 2, F: 1, glass: 'hd_g_yh', kind: 'park', family: '亭', form: '台亭', plate: '2x2', signs: [{ face: 'S', floor: 1, bay: 0, text: '上麓亭' }] });

  function hedgeRow(tag, x0, x1, y, step) {
    for (let x = x0; x <= x1; x += step) put('hg_' + tag + '_' + x, 'p_hedge', x, y, { fade_group: 'rqe_p10t_wall' });
  }
  hedgeRow('s', 1396, 1508, 388, 8);
  hedgeRow('m', 1224, 1336, 404, 8);
  hedgeRow('n', 1224, 1360, 429, 10);
  hedgeRow('ne', 1392, 1504, 429, 10);
  for (let y = 410; y <= 424; y += 4) put('hg_w_' + y, 'p_hedge', 1206, y, { rot: 6, fade_group: 'rqe_p10t_wall' });

  function tree(id, x, y, variant) { put(id, 'rq_x_tree', x, y, { variant, fade_group: 'rqe_p10t_tree' }); }
  tree('tr1', 1418, 418, 'ginkgo');
  tree('tr2', 1480, 418, 'sakura');
  tree('tr3', 1336, 422, 'ginkgo');
  put('bench1', 'community_bench', 1464, 418, { rot: 0, fade_group: 'rqe_p10t_tree' });
  put('bench2', 'community_bench', 1344, 422, { rot: 0, fade_group: 'rqe_p10t_tree' });
  addBlock(GROVE_A);
  addBlock(GROVE_B);

  const feet = built.flatMap((b) => b.parts);
  const ROADS = [[1368, 362, 1384, 428], [1518, 354, 1538, 428]];
  const hit = (o, rect, pad) => o.x > rect[0] - pad && o.x < rect[2] + pad && o.y > rect[1] - pad && o.y < rect[3] + pad;
  const propHit = (o) => {
    if (!o) return false;
    const pad = o.type === 'rq_x_tree' ? 2.2 : (o.type === 'p_lamp' || o.type === 'p_hedge' || o.type === 'community_bench' || o.type === 'rq_x_shrub' ? 0.6 : 0);
    if (!pad) return false;
    if (ROADS.some((r) => hit(o, r, pad))) return true;
    return feet.some((f) => hit(o, f, pad));
  };
  for (const ch of Object.values(CH)) if (ch && ch.objects) ch.objects = ch.objects.filter((o) => !propHit(o));
  for (const [id, list] of Object.entries(bags)) {
    if (!CH[id]) throw new Error('site150 missing chunk ' + id);
    const next = (CH[id].objects || []).concat(list);
    if (next.length > 2600) throw new Error('site150 chunk cap ' + id + ' ' + next.length);
    CH[id].objects = next;
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);

  const cols = (D.colliders || []).filter((c) => c && c.rect);
  const bad = [];
  for (let i = 0; i < colliders.length; i++) {
    for (let j = 0; j < cols.length; j++) {
      if (cols[j] === colliders[i]) continue;
      if (overlaps(colliders[i].rect, cols[j].rect)) bad.push(colliders[i].id + ' ~ ' + (cols[j].id || j));
    }
  }
  if (bad.length) throw new Error('site150 overlap ' + bad.slice(0, 6).join(' | '));
  const wet = [];
  for (const c of colliders) {
    for (const w of N.water || []) if (w && overlaps(c.rect, w)) wet.push(c.id);
  }
  if (wet.length) throw new Error('site150 water ' + wet.join(','));

  const towers = built.filter((b) => (b.kind === 'work' || b.kind === 'hotel') && b.F >= 10);
  const counts = {};
  for (const [id, n] of Object.entries(added)) counts[id] = { added: n, total: CH[id].objects.length };
  P.site150 = {
    unconfirmed: true,
    buildings: built,
    towers,
    parks: [GROVE_A.slice(), GROVE_B.slice()],
    gate: GATE.slice(),
    lower: LOWER.slice(),
    upper: UPPER.slice(),
    stair: STAIR.slice(),
    road: [1368, 362, 1384, 424],
    counts,
    cap: 120,
  };
  P.keepLots = (P.keepLots || []).concat([GROVE_A.slice(), GROVE_B.slice()]);
  P.reasons.site150 = '第二十一刀不往南铺进海里，也不把楼推进澜海。北界 y432 以上仍是山体，Site149 的人行道已经收到 y428，再往北没有一整条街的进深。区界矩形仍是 [356, -220, 1750, 378]，西侧山体封口继续挡住 (400, 400) 和 (900, 400)，山径台地（600, 370）仍是草地。打开的是东侧山脚再往西的两级台地：东月路穿过挡土墙（x1368–1384，y378–390）。下台在挡土墙以北、澜东路以西（x1392–1509，y396），上台再往北收一级（x1220–1298，y408），中间留着挡土墙（y390–406）和踏步（x1344–1368）。麓西折廊是 10 层折廊（蓝灰竖向渐变，裙楼 7×3，塔身 4×2 贴东，中段 3×2，冠 2×2，约 30 m），在 (1392, 396)。下台还有麓西里、麓西茶铺、麓西社康、麓西菜场、台阶里、折廊里、麓西文具和麓西亭。上台有上麓里、上麓书店、上麓社康、叠院、台地里、麓阶铺和上麓亭。只有这一栋塔，层数、平面、材料和剪影都不跟已有塔楼相同，也不是 438 m。不进月河，不进澜海，渔村老街不动。不把南埠往 y-1540 以南推。新楼并进已有分块。名字和尺寸未经确认。';
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '麓西社康', rect: [1443, 396, 1455, 405], kind: 'campus', prio: 1 },
    { name: '麓西菜场', rect: [1458, 396, 1470, 405], kind: 'market', prio: 1 },
    { name: '麓西亭', rect: GROVE_A.slice(), kind: 'park', prio: 1 },
    { name: '上麓社康', rect: [1247, 408, 1259, 417], kind: 'campus', prio: 1 },
    { name: '上麓亭', rect: GROVE_B.slice(), kind: 'park', prio: 1 },
  ]);
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10t_step', name: '麓西折廊', x: 1402, y: 392, desc: '10 层折廊。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10t_sk', name: '麓西社康', x: 1448, y: 392, desc: '3 层社康外壳。没有室内。名字未经确认', cat: 'life' },
    { id: 'p10t_mk', name: '麓西菜场', x: 1464, y: 392, desc: '2 层菜场外壳。没有室内。名字未经确认', cat: 'shop' },
    { id: 'p10t_usk', name: '上麓社康', x: 1252, y: 404, desc: '3 层社康外壳。没有室内。名字未经确认', cat: 'life' },
  ]);
  root.SITE150 = P.site150;
})();
