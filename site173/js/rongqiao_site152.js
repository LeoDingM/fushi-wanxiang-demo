/* Site152：质量修补。生长空间已经几乎没了，这一刀不新开街区。
 * 上台西端、挡土墙和上麓里之间还空着一块人行道，补一栋杂货。
 * 下台和山麓台地南侧人行道原先没有树也没有灯。挡土墙南缘是秃混凝土，补一条石面。
 * Site151 拉开了矮楼，九栋塔的层数和招牌玻璃留着，塔身不再是一整片同色。
 * 不进山，不进海，不进澜海，不进月河，不进学校、公园、庭院和渔村老街。
 * 南埠不往 y-1540 以南推。没有 438 m 塔。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10t || D.rongqiaoExpandP10u || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10u = 1;
  const P = N.expansionP10;
  const CH = root.SCENE_CHUNKS || {};

  const blocked = [];
  const lots = [];
  function addBlock(rect) { if (rect && rect.length >= 4) blocked.push(rect); }
  function addLot(rect) { if (rect && rect.length >= 4) lots.push(rect); }
  function collect(list) {
    for (const b of list || []) {
      const parts = b.parts && b.parts.length ? b.parts : (b.x0 != null ? [[b.x0, b.y0, b.x0 + b.W, b.y0 + (b.D || 0)]] : []);
      for (const p of parts) { addBlock(p); addLot(p); }
    }
  }
  function take(node) {
    if (!node) return;
    if (Array.isArray(node)) collect(node);
    else if (node.buildings) collect(node.buildings);
    else if (node.towers) collect(node.towers);
  }
  for (const k of Object.keys(P)) take(P[k]);
  for (const k of P.keepLots || []) { addBlock(k); addLot(k); }
  for (const c of D.colliders || []) if (c && c.rect) addBlock(c.rect);
  for (const w of N.water || []) { addBlock(w); addLot(w); }

  function overlaps(a, b) {
    return a[0] < b[2] - 0.05 && b[0] < a[2] - 0.05 && a[1] < b[3] - 0.05 && b[1] < a[3] - 0.05;
  }
  function pickChunk(x, y) {
    let best = null, area = Infinity;
    for (const c of D.chunks || []) {
      const r = c.rect;
      if (!r || x < r[0] || x >= r[2] || y < r[1] || y >= r[3]) continue;
      const a = (r[2] - r[0]) * (r[3] - r[1]);
      if (a < area && CH[c.id]) { area = a; best = c.id; }
    }
    if (best) return best;
    throw new Error('site152 no chunk ' + x + ',' + y);
  }
  const bags = {};
  const added = {};
  const CAP = 2520;
  function room(id, n) {
    const have = (CH[id] && CH[id].objects ? CH[id].objects.length : 0) + (added[id] || 0);
    return have + n <= CAP;
  }
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10v_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    const key = pickChunk(o.x, o.y);
    (bags[key] || (bags[key] = [])).push(o);
    added[key] = (added[key] || 0) + 1;
    return o;
  }
  function faceOf(spec, f, F, side, b) {
    const sign = (spec.signs || []).find((s) => s.face === side && s.floor === f && s.bay === b);
    if (sign) return { variant: 'hd_g_sign', hdGlass: 1, sign: sign.text, forceGround: 1 };
    if (f <= 1) return { variant: 'hd_stone' };
    if (b % 2 === 1) return { variant: 'hd_stone' };
    return { variant: spec.glass || 'hd_g_hd', hdGlass: 1 };
  }
  function bayPlan(spec, f, F, x) {
    const m = spec.mass;
    return { nS: m.towerNS, xS: x, nW: m.towerNW, xW: x };
  }
  function estimate(spec) {
    const m = spec.mass;
    let n = 12;
    for (let f = 1; f <= m.F; f++) n += m.podiumNS + m.podiumNW;
    n += m.podiumNS * m.podiumNW * 2;
    return n;
  }
  const built = [];
  const solids = [], colliders = [];
  const used = new Set();
  function sigOf(b) { return [b.form || '', b.F, b.plate || '', b.glass || ''].join('|'); }
  function harvest(node) {
    if (!node) return;
    const list = Array.isArray(node) ? node : [].concat(node.buildings || [], node.towers || []);
    for (const b of list) if (b && b.form) used.add(sigOf(b));
  }
  for (const k of Object.keys(P)) harvest(P[k]);
  for (const s of Object.values(root.HEDONG_TOWER_STYLE || {})) {
    if (s && s.mass) used.add([s.form, s.mass.F, s.mass.towerNS + 'x' + s.mass.towerNW, s.glass].join('|'));
  }
  function blocker(rect, pad) {
    const a0 = rect[0] - pad, a1 = rect[1] - pad, a2 = rect[2] + pad, a3 = rect[3] + pad;
    for (let i = 0; i < blocked.length; i++) {
      const b = blocked[i];
      if (a0 < b[2] && b[0] < a2 && a1 < b[3] && b[1] < a3) return b;
    }
    return null;
  }
  function block(id, rect) { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); addBlock(rect); addLot(rect); }
  function remember(spec, parts) {
    const m = spec.mass, fg = 'rqe_p10v_' + spec.id;
    for (const r of parts) block(fg + '_' + r[0] + '_' + r[1], r);
    const rec = {
      id: fg, name: spec.name, x0: spec.x, y0: spec.y, W: m.podiumNS * 3, D: m.podiumNW * 3, F: m.F, floors: m.F,
      kind: spec.kind || 'home', form: spec.form || '', family: spec.family || '', glass: spec.glass || '',
      plate: spec.plate || (m.towerNS + 'x' + m.towerNW),
      parts: parts.map((r) => r.slice()), unconfirmed: true,
    };
    built.push(rec);
    used.add(sigOf(rec));
    return rec;
  }
  function buildMass(spec) {
    const m = spec.mass, F = m.F, x = spec.x, y = spec.y;
    const foot = [x, y, x + m.podiumNS * 3, y + m.podiumNW * 3];
    const clash = blocker(foot, 0.7);
    if (clash) throw new Error('site152 footprint ' + spec.id + ' ' + foot.join(',') + ' vs ' + clash.join(','));
    const sig = [spec.form || '', F, spec.plate || '', spec.glass || ''].join('|');
    if (used.has(sig)) throw new Error('site152 clone ' + sig);
    const key = pickChunk(x + 1, y + 1);
    if (!room(key, estimate(spec))) throw new Error('site152 chunk room ' + spec.id + '@' + key);
    const fg = 'rqe_p10v_' + spec.id;
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
  }

  /* 上台人行道从 x1208 起，上麓里从 x1220 起。中间 12 m 是空人行道，不是草地，也不是挡土墙。 */
  buildMass({
    id: 'shop', name: '西台杂货', x: 1211, y: 408, kind: 'shop', glass: 'hd_g_hd', form: '角柜', family: '浅灰杂货', plate: '2x3',
    signs: [{ face: 'S', floor: 1, bay: 0, text: '西台杂货' }],
    st: { podium: 1, setbackTop: 0, crownStone: 0, beltEvery: 0 },
    mass: { F: 2, podiumNS: 2, podiumNW: 3, towerNS: 2, towerNW: 3, towerOff: 0, midFromTop: 0, midNS: 2, midNW: 3, crownNS: 2, crownNW: 3 },
  });
  put('shop_tr', 'rq_x_tree', 1214, 421, { variant: 'camphor', fade_group: 'rqe_p10v_shop' });

  const feet = built.flatMap((b) => b.parts);
  const hit = (o, rect, pad) => o.x > rect[0] - pad && o.x < rect[2] + pad && o.y > rect[1] - pad && o.y < rect[3] + pad;
  const propHit = (o) => {
    if (!o || String(o.fade_group || '').startsWith('rqe_p10v_')) return false;
    const pad = o.type === 'rq_x_tree' ? 2.2 : (o.type === 'p_lamp' || o.type === 'p_hedge' || o.type === 'community_bench' || o.type === 'rq_x_shrub' ? 0.6 : 0);
    if (!pad) return false;
    return feet.some((f) => hit(o, f, pad));
  };
  for (const ch of Object.values(CH)) if (ch && ch.objects) ch.objects = ch.objects.filter((o) => !propHit(o));

  function sealed(x, y) {
    return (D.colliders || []).some((c) => c && c.rect && x > c.rect[0] && x < c.rect[2] && y > c.rect[1] && y < c.rect[3]);
  }
  function insideFoot(x, y, pad) {
    return lots.some((r) => x > r[0] - pad && x < r[2] + pad && y > r[1] - pad && y < r[3] + pad);
  }
  const ROADS = [[1368, 362, 1384, 428], [1518, 354, 1538, 428]];
  function onRoad(x, y) { return ROADS.some((r) => x > r[0] && x < r[2] && y > r[1] && y < r[3]); }

  /* 挡土墙南缘。混凝土格子不动（上台南侧仍是 K）。石面贴在封口南边，不挡东月路和澜东路，也不加新的碰撞。 */
  const WALL_Y = 380.6;
  let walls = 0;
  function wallRun(tag, x0, x1) {
    for (let x = x0; x + 3 <= x1 + 0.01; x += 3) {
      const cx = x + 1.5;
      if (!sealed(cx, WALL_Y) || onRoad(cx, WALL_Y) || insideFoot(cx, WALL_Y, 0.4)) continue;
      put('bank_' + tag + '_' + x, 'f_wall', x, WALL_Y, { z: 0, state: 'ground', variant: 'hd_stone', fade_group: 'rqe_p10v_bank' });
      walls++;
    }
  }
  wallRun('w', 1208, 1365);
  wallRun('m', 1386, 1515);
  wallRun('e', 1542, 1683);
  if (walls < 80) throw new Error('site152 banks ' + walls);

  const hedges = [];
  for (const ch of Object.values(CH)) for (const o of (ch && ch.objects) || []) if (o && o.type === 'p_hedge') hedges.push(o);
  function nearHedge(x, y) { return hedges.some((o) => Math.abs(o.x - x) < 1.5 && Math.abs(o.y - y) < 1.2); }
  function addHedge(tag, x, y) {
    if (onRoad(x, y) || insideFoot(x, y, 0.8) || nearHedge(x, y)) return;
    if (!sealed(x, y) && !(y > 388 && y < 406)) return;
    const o = put('hg_' + tag + '_' + Math.round(x), 'p_hedge', x, y, { fade_group: 'rqe_p10v_bank' });
    hedges.push(o);
  }
  for (let x = 1210; x <= 1340; x += 3) addHedge('u', x, 404);
  for (let x = 1388; x <= 1512; x += 3) addHedge('l', x, 388);
  for (let x = 1544; x <= 1680; x += 3) addHedge('e', x, 381);

  const TREES = ['ginkgo', 'camphor', 'sakura'];
  let trees = 0, lamps = 0;
  function frontRow(tag, xs, yTree) {
    xs.forEach((x, i) => {
      if (onRoad(x, yTree) || insideFoot(x, yTree, 2.3)) return;
      put('tr_' + tag + '_' + x, 'rq_x_tree', x, yTree, { variant: TREES[i % TREES.length], fade_group: 'rqe_p10v_walk' });
      trees++;
      const lx = x + 9;
      if (lx < xs[xs.length - 1] + 12 && !onRoad(lx, yTree + 2.4) && !insideFoot(lx, yTree + 2.4, 0.8)) {
        put('lamp_' + tag + '_' + lx, 'p_lamp', lx, yTree + 2.4, { interact: 'lamp', fade_group: 'rqe_p10v_walk' });
        lamps++;
      }
    });
  }
  frontRow('lo', [1402, 1420, 1438, 1456, 1474, 1492], 391.8);
  frontRow('ea', [1554, 1572, 1590, 1608, 1626, 1644, 1662], 391.8);
  put('bench_lo', 'community_bench', 1426, 393.4, { rot: 0, fade_group: 'rqe_p10v_walk' });
  put('bench_lo2', 'community_bench', 1470, 393.4, { rot: 0, fade_group: 'rqe_p10v_walk' });
  put('bench_ea', 'community_bench', 1578, 393.4, { rot: 0, fade_group: 'rqe_p10v_walk' });
  put('bench_ea2', 'community_bench', 1632, 393.4, { rot: 0, fade_group: 'rqe_p10v_walk' });
  if (trees < 10 || lamps < 8) throw new Error('site152 walk ' + trees + ' ' + lamps);

  /* 九栋塔。层数、平面、招牌玻璃不动。塔身按各栋自己的节奏拆开，不写进 facadeRhythm，免得盖掉 Site151 的矮楼账。 */
  const RHYTHM = {
    rqe_p10o_ts: 'fin',
    rqe_p10o_cs: 'course',
    rqe_p10p_bell: 'band',
    rqe_p10q_slant: 'frame',
    rqe_p10q_curve: 'spine',
    rqe_p10r_seam: 'stagger',
    rqe_p10r_slot: 'slot',
    rqe_p10s_fold: 'fold',
    rqe_p10t_step: 'east',
  };
  const byFg = new Map();
  for (const ch of Object.values(CH)) {
    for (const o of (ch && ch.objects) || []) {
      if (!o || o.type !== 'f_wall' || !RHYTHM[o.fade_group]) continue;
      let list = byFg.get(o.fade_group);
      if (!list) byFg.set(o.fade_group, list = []);
      list.push(o);
    }
  }
  function toStone(o) { o.variant = 'hd_stone'; delete o.hdGlass; o.night_lit = 0; }
  function toGlass(o, v, floor, bay) {
    o.variant = v;
    o.hdGlass = 1;
    if (o.state === 'upper') o.night_lit = (floor + bay) % 4 !== 0 ? 1 : 0;
  }
  const towerNotes = {};
  let towerTouched = 0;
  for (const [id, rhythm] of Object.entries(RHYTHM)) {
    const walls = byFg.get(id) || [];
    const glassWalls = walls.filter((o) => o.state === 'upper' && o.variant !== 'hd_g_sign' && o.variant !== 'hd_stone' && String(o.variant || '').indexOf('hd_g_') === 0);
    if (!glassWalls.length) throw new Error('site152 tower glass ' + id);
    const origin = glassWalls[0].variant;
    const groups = new Map();
    for (const o of glassWalls) {
      const floor = Math.round((o.z || 0) / 3) + 1;
      const key = floor + ':' + (o.rot || 0);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(o);
    }
    const floors = [...groups.keys()].map((k) => +k.split(':')[0]);
    const midFloor = floors.slice().sort((a, b) => a - b)[Math.floor(floors.length / 2)] || 1;
    let changed = 0;
    for (const [key, list] of groups) {
      const floor = +key.split(':')[0];
      const rot = +key.split(':')[1];
      const coord = (o) => (rot === 6 ? o.y : o.x);
      const min = Math.min(...list.map(coord));
      const tagged = list.map((o) => ({ o, bay: Math.round((coord(o) - min) / 3) }));
      const max = Math.max(...tagged.map((t) => t.bay));
      for (const t of tagged) {
        const bay = t.bay;
        let mode = '';
        if (rhythm === 'fin') mode = bay % 3 === 2 ? 'stone' : '';
        else if (rhythm === 'course') mode = floor % 4 === 2 ? 'stone' : '';
        else if (rhythm === 'band') mode = floor % 2 === 0 ? 'alt' : '';
        else if (rhythm === 'frame') mode = max >= 2 && (bay === 0 || bay === max) ? 'stone' : '';
        else if (rhythm === 'spine') mode = max >= 2 && bay === Math.floor(max / 2) ? 'alt' : '';
        else if (rhythm === 'stagger') mode = (bay + floor) % 3 === 0 ? 'stone' : '';
        else if (rhythm === 'slot') mode = rot !== 6 && max >= 1 && bay === max ? 'stone' : '';
        else if (rhythm === 'fold') mode = floor > midFloor && bay % 2 === 0 ? 'warm' : '';
        else if (rhythm === 'east') mode = bay >= Math.ceil((max + 1) / 2) ? 'stone' : '';
        if (mode === 'stone') { toStone(t.o); changed++; }
        else if (mode === 'alt') { toGlass(t.o, rhythm === 'band' ? 'hd_g_yh' : 'hd_g_ls', floor, bay); changed++; }
        else if (mode === 'warm') { toGlass(t.o, 'hd_g_dl', floor, bay); changed++; }
      }
    }
    const upper = walls.filter((o) => o.state === 'upper' && o.variant !== 'hd_g_sign');
    const variants = new Set(upper.map((o) => o.variant));
    if (changed < 4 || variants.size < 2 || !upper.some((o) => o.variant === origin)) {
      throw new Error('site152 rhythm ' + id + ' ' + rhythm + ' ' + changed + ' ' + [...variants].join(','));
    }
    towerNotes[id] = { rhythm, glass: origin, changed, variants: variants.size };
    towerTouched++;
  }
  if (towerTouched !== 9) throw new Error('site152 towers ' + towerTouched);

  for (const [id, list] of Object.entries(bags)) {
    if (!CH[id]) throw new Error('site152 missing chunk ' + id);
    const next = (CH[id].objects || []).concat(list);
    if (next.length > 2600) throw new Error('site152 chunk cap ' + id + ' ' + next.length);
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
  if (bad.length) throw new Error('site152 overlap ' + bad.slice(0, 6).join(' | '));
  const wet = [];
  for (const c of colliders) for (const w of N.water || []) if (w && overlaps(c.rect, w)) wet.push(c.id);
  if (wet.length) throw new Error('site152 water ' + wet.join(','));
  const G = D.ground;
  const tileAt = (x, y) => {
    const c = Math.floor((x - G.origin[0]) / G.chunk), r = Math.floor((y - G.origin[1]) / G.chunk);
    const row = G.data_south_to_north[r];
    return row && row[c];
  };
  if (tileAt(1200, 400) !== 'K') throw new Error('site152 concrete ' + tileAt(1200, 400));
  if (tileAt(1328, 422) !== 'G' || tileAt(600, 370) !== 'G') throw new Error('site152 grass');

  const counts = {};
  for (const [id, n] of Object.entries(added)) counts[id] = { added: n, total: CH[id].objects.length };
  P.site152 = {
    unconfirmed: true,
    choice: 'quality',
    buildings: built,
    lot: [1211, 408, 1217, 417],
    banks: { y: WALL_Y, runs: [[1208, 1365], [1386, 1515], [1542, 1683]], walls },
    walk: { trees, lamps, fronts: [[1384, 390, 1518, 396], [1536, 390, 1686, 396]] },
    towers: towerNotes,
    counts,
    cap: 120,
  };
  P.reasons.site152 = '第二十三刀仍不做新区。北界 y432 以上是山，南边是海，东边是澜海。榕桥剩下的学校、河岸公园、庭院和渔村老街不动。月河石驳岸仍是一整面。西侧山体封口继续挡住 (400, 400) 和 (900, 400)，山径台地（600, 370）仍是草地。上台西端人行道从 x1208 起，上麓里从 x1220 起，中间这段不是草地：西台杂货 (1211, 408)，2 层角柜，6×9，北缘对齐上麓里 y417，西边留 3 m。没有办公塔，也不是 438 m。下台南人行道（y392 一带，x1402–1492）和山麓台地南人行道（x1554–1662）原先没有树和灯，补了银杏、樟和樱，间隔摆开。挡土墙混凝土格子不动，封口上 y380.6 贴了一条石面，让开东月路和澜东路，墙顶绿篱补密。Site151 没动的九栋塔（听山酒店、潮声办公、风铃中心、津东斜楼、堤北曲板、渔南错缝、港东槽楼、山麓折阶、麓西折廊）层数、平面和招牌玻璃还在，塔身改成竖墩、石腰、横带、边框、中槽、错缝、竖槽、上段暖石或东侧石脊，彼此不是同一套。不进月河，不进澜海，不进山。不把南埠往 y-1540 以南推。名字和尺寸未经确认。';
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '西台杂货', rect: [1211, 408, 1217, 417], kind: 'market', prio: 1 },
  ]);
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10v_shop', name: '西台杂货', x: 1214, y: 406, desc: '2 层杂货外壳。没有室内。名字未经确认', cat: 'shop' },
  ]);
  root.SITE152 = P.site152;
})();
