/* Site149：月河区东侧山脚新街块。
 * 月河口那一横条 Site148 已经铺到滨海路。再往南是海，再往东是澜海，榕桥剩下的空地是学校、公园、庭院和老街。
 * 区界矩形仍是 [356, -220, 1750, 378]：西侧山体封口继续挡住 (400, 400) 和 (900, 400)，山径台地草地不动。
 * 这一刀只打开东侧封口：澜东路从山径穿过挡土墙，接到 y392–428、x1544–1683 的一块。
 * 一块里有住宅、铺面、小学、社康、菜场、山麓亭和小园，外加一栋 11 层折阶。不进月河，不进澜海。
 * 新楼并进已有分块，不新开分块。不做 438 m 塔，南埠不往南。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10q || D.rongqiaoExpandP10r || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10r = 1;
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
  /* 东侧挡土墙开一个门洞，街块落在门洞北面。西侧封口整段留下。 */
  const GATE = [1518, 378, 1538, 390];
  const OPEN = [1518, 390, 1686, 428];
  function carve(id, hole) {
    const col = (D.colliders || []).find((c) => c && c.id === id);
    if (!col) throw new Error('site149 missing seal ' + id);
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
      D.colliders.push({ id: id + '_s149_' + i, rect });
      N.solids.push(rect.slice());
    }
    blocked.length = 0;
    for (const c of D.colliders || []) if (c && c.rect) addBlock(c.rect);
    for (const w of N.water || []) addBlock(w);
  }
  carve('rqe_p10b_north', GATE);
  carve('rqe_p10_north_1_s145_24', OPEN);
  function sealed(x, y) {
    return (D.colliders || []).some((c) => c && c.rect && x > c.rect[0] && x < c.rect[2] && y > c.rect[1] && y < c.rect[3]);
  }
  if (!sealed(400, 400) || !sealed(900, 400)) throw new Error('site149 west seal opened');
  if (sealed(1528, 400) || sealed(1600, 404)) throw new Error('site149 block still sealed');
  if (!sealed(1560, 382)) throw new Error('site149 retaining wall gone');

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
  const GROVE = [1550, 412, 1670, 424];
  paint([1536, 390, 1686, 428], 'S');
  paint([1518, 354, 1538, 428], 'S');
  paint([1523.5, 354, 1532.5, 424], null, road);
  paint(GROVE, 'G');

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
    throw new Error('site149 no chunk ' + x + ',' + y);
  }
  const bags = {};
  const added = {};
  const CAP = 2400;
  function room(id, n) {
    const have = (CH[id] && CH[id].objects ? CH[id].objects.length : 0) + (added[id] || 0);
    return have + n <= CAP;
  }
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10s_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
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
    const m = spec.mass, fg = 'rqe_p10s_' + spec.id;
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
    if (clash) throw new Error('site149 footprint ' + spec.id + ' ' + foot.join(',') + ' vs ' + clash.join(','));
    const sig = [spec.form || '', F, spec.plate || '', spec.glass || ''].join('|');
    if (used.has(sig)) throw new Error('site149 clone ' + sig);
    const key = pickChunk(x + 1, y + 1);
    if (!room(key, estimate(spec))) throw new Error('site149 chunk room ' + spec.id + '@' + key);
    const fg = 'rqe_p10s_' + spec.id;
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
  /* 山麓折阶 11 层。裙楼 6×4 贴着山脚，塔身 3×4 贴西（进深大于面宽），中段再收成 2×3，冠是 2×2。
   * 米黄石材开窗，约 33 m。层数、平面、材料和剪影都不跟已有塔相同，也不是 438 m。 */
  buildMass({
    id: 'fold', name: '山麓折阶', x: 1544, y: Y, kind: 'work', glass: 'hd_g_yl2', form: '折阶', family: '米黄折阶', plate: '3x4',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '山麓折阶' }],
    st: { podium: 2, setbackTop: 3, crownStone: 2, beltEvery: 0 },
    mass: { F: 11, podiumNS: 6, podiumNW: 4, towerNS: 3, towerNW: 4, towerOff: 0, midFromTop: 6, midNS: 2, midNW: 3, crownNS: 2, crownNW: 2 },
  });
  box({ id: 'sc', name: '山麓小学', x: 1570, y: Y, nS: 5, nW: 4, F: 3, glass: 'hd_g_wm', kind: 'school', family: '冷青小学', signs: [{ face: 'S', floor: 1, bay: 1, text: '山麓小学' }] });
  box({ id: 'sh1', name: '麓口文具', x: 1591, y: Y, nS: 3, nW: 3, F: 2, glass: 'hd_g_cj', kind: 'shop', family: '沿街铺', form: '3x3', signs: [{ face: 'S', floor: 1, bay: 0, text: '麓口文具' }] });
  box({ id: 'sk', name: '山麓社康', x: 1608, y: Y, nS: 4, nW: 3, F: 3, glass: 'hd_g_ls', kind: 'clinic', family: '深蓝社康', signs: [{ face: 'S', floor: 2, bay: 1, text: '山麓社康' }] });
  box({ id: 'mk', name: '山麓菜场', x: 1626, y: Y, nS: 4, nW: 3, F: 2, glass: 'hd_g_dl', kind: 'market', family: '暖石菜场', form: '菜场棚', plate: '4x3', signs: [{ face: 'S', floor: 1, bay: 1, text: '山麓菜场' }] });
  box({ id: 'h1', name: '山麓里', x: 1644, y: Y, nS: 4, nW: 3, F: 5, glass: 'hd_g_yx', kind: 'home', family: '山麓住宅', form: '4x3', signs: [{ face: 'S', floor: 1, bay: 0, text: '山麓里' }] });
  box({ id: 'h2', name: '折阶里', x: 1662, y: Y, nS: 3, nW: 3, F: 4, glass: 'hd_g_qp', kind: 'home', family: '山麓住宅', form: '3x3', signs: [{ face: 'S', floor: 1, bay: 0, text: '折阶里' }] });
  box({ id: 'sh2', name: '麓东菜店', x: 1674, y: Y, nS: 3, nW: 3, F: 2, glass: 'hd_g_yh', kind: 'shop', family: '沿街铺', form: '铺面', plate: '3x3', signs: [{ face: 'S', floor: 1, bay: 0, text: '麓东菜店' }] });
  box({ id: 'gp', name: '山麓亭', x: 1600, y: 414, nS: 2, nW: 2, F: 1, glass: 'hd_g_hd', kind: 'park', family: '亭', form: '亭', plate: '2x2', signs: [{ face: 'S', floor: 1, bay: 0, text: '山麓亭' }] });
  addBlock(GROVE);
  function tree(id, x, y, variant) { put(id, 'rq_x_tree', x, y, { variant, fade_group: 'rqe_p10s_tree' }); }
  tree('tr1', 1564, 418, 'ginkgo');
  tree('tr2', 1652, 418, 'sakura');
  put('bench1', 'community_bench', 1620, 418, { rot: 0, fade_group: 'rqe_p10s_tree' });

  const feet = built.flatMap((b) => b.parts);
  const ROAD = [1518, 354, 1538, 428];
  const hit = (o, rect, pad) => o.x > rect[0] - pad && o.x < rect[2] + pad && o.y > rect[1] - pad && o.y < rect[3] + pad;
  const propHit = (o) => {
    if (!o) return false;
    const pad = o.type === 'rq_x_tree' ? 2.2 : (o.type === 'p_lamp' || o.type === 'p_hedge' || o.type === 'community_bench' || o.type === 'rq_x_shrub' ? 0.6 : 0);
    if (!pad) return false;
    if (hit(o, ROAD, pad)) return true;
    return feet.some((f) => hit(o, f, pad));
  };
  for (const ch of Object.values(CH)) if (ch && ch.objects) ch.objects = ch.objects.filter((o) => !propHit(o));
  for (const [id, list] of Object.entries(bags)) {
    if (!CH[id]) throw new Error('site149 missing chunk ' + id);
    const next = (CH[id].objects || []).concat(list);
    if (next.length > 2600) throw new Error('site149 chunk cap ' + id + ' ' + next.length);
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
  if (bad.length) throw new Error('site149 overlap ' + bad.slice(0, 6).join(' | '));
  const wet = [];
  for (const c of colliders) {
    for (const w of N.water || []) if (w && overlaps(c.rect, w)) wet.push(c.id);
  }
  if (wet.length) throw new Error('site149 water ' + wet.join(','));
  if (skipped.length) throw new Error('site149 skipped ' + skipped.join(','));

  const towers = built.filter((b) => (b.kind === 'work' || b.kind === 'hotel') && b.F >= 11);
  const counts = {};
  for (const [id, n] of Object.entries(added)) counts[id] = { added: n, total: CH[id].objects.length };
  P.site149 = {
    unconfirmed: true,
    buildings: built,
    towers,
    parks: [GROVE.slice()],
    gate: GATE.slice(),
    open: OPEN.slice(),
    road: [1520, 354, 1536, 424],
    counts,
    cap: 120,
  };
  P.keepLots = (P.keepLots || []).concat([GROVE.slice()]);
  P.reasons.site149 = '第二十刀不在月河口再铺一条，也不把楼推进澜海。南边 y-220 以外是海，东边 x1724 以外是澜海，榕桥区剩下的空地是学校、河岸公园、小区庭院和渔村老街。区界矩形仍是 [356, -220, 1750, 378]，西侧山体封口继续挡住 (400, 400) 和 (900, 400)，山径台地（600, 370）仍是草地。打开的是东侧山脚：澜东路穿过挡土墙（x1518–1538，y378–390），北面接一块街（x1544–1683，y396–420）。山麓折阶是 11 层折阶（米黄石材开窗，裙楼 6×4，塔身 3×4 贴西，中段 2×3，冠 2×2，约 33 m），在 (1544, 396)。同一块里有山麓小学、山麓社康、山麓菜场、麓口文具、麓东菜店、山麓里、折阶里，北侧山麓亭和小园。只有这一栋塔，层数、平面、材料和剪影都不跟已有塔楼相同，也不是 438 m。不进月河，不进澜海。不把南埠往 y-1540 以南推。新楼并进已有分块。名字和尺寸未经确认。';
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '山麓小学', rect: [1570, 396, 1585, 408], kind: 'campus', prio: 1 },
    { name: '山麓社康', rect: [1608, 396, 1620, 405], kind: 'campus', prio: 1 },
    { name: '山麓菜场', rect: [1626, 396, 1638, 405], kind: 'market', prio: 1 },
    { name: '山麓亭', rect: GROVE.slice(), kind: 'park', prio: 1 },
  ]);
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_fold', name: '山麓折阶', x: 1552, y: 392, desc: '11 层折阶。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_sc22', name: '山麓小学', x: 1576, y: 392, desc: '3 层小学外壳。没有室内。名字未经确认', cat: 'school' },
    { id: 'p10_sk22', name: '山麓社康', x: 1614, y: 392, desc: '3 层社康外壳。没有室内。名字未经确认', cat: 'life' },
    { id: 'p10_mk22', name: '山麓菜场', x: 1632, y: 392, desc: '2 层菜场外壳。没有室内。名字未经确认', cat: 'shop' },
  ]);
  root.SITE149 = P.site149;
})();
