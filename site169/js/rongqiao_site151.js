/* Site151：质量修补，外加上台东端一小块配套。
 * 北界 y432 以上是山，南边是海，东边是澜海。榕桥剩下的学校、公园、庭院和渔村老街不动。
 * 月河石驳岸仍是 Site146 那一整面，这一刀不改河岸。
 * 上台人行道已经开到 x1368，楼却停在麓阶铺（x1298）。踏步在 x1344。中间这段是空着的沿街，不是草地。
 * 补茶寮、阅览和驿站，都不进上麓亭和草地。没有办公塔。
 * Site143 到 Site150 的矮楼大多是同一套：首层石材、上面整片同色玻璃、顶上一层石材。相邻的改成不同节奏。
 * 塔的脚印、层数和玻璃不动。不进月河，不进澜海，不进山。南埠不往 y-1540 以南推。没有 438 m 塔。
 * 名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10s || D.rongqiaoExpandP10t || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10t = 1;
  const P = N.expansionP10;
  const CH = root.SCENE_CHUNKS || {};

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
    else if (node.towers) collect(node.towers);
  }
  for (const k of Object.keys(P)) take(P[k]);
  for (const k of P.keepLots || []) addBlock(k);
  for (const c of D.colliders || []) if (c && c.rect) addBlock(c.rect);
  for (const w of N.water || []) addBlock(w);

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
    throw new Error('site151 no chunk ' + x + ',' + y);
  }
  const bags = {};
  const added = {};
  const CAP = 2480;
  function room(id, n) {
    const have = (CH[id] && CH[id].objects ? CH[id].objects.length : 0) + (added[id] || 0);
    return have + n <= CAP;
  }
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10u_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
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
  function sigOf(b) { return [b.form || '', b.F, b.plate || '', b.glass || ''].join('|'); }
  function harvest(node) {
    if (!node) return;
    const list = Array.isArray(node) ? node : (node.buildings || node.towers || null);
    if (list) for (const b of list) if (b && b.form) used.add(sigOf(b));
    if (node.towers && node.buildings) for (const b of node.towers) if (b && b.form) used.add(sigOf(b));
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
  function block(id, rect) { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); addBlock(rect); }
  function remember(spec, parts) {
    const m = spec.mass, fg = 'rqe_p10u_' + spec.id;
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
    if (clash) throw new Error('site151 footprint ' + spec.id + ' ' + foot.join(',') + ' vs ' + clash.join(','));
    const sig = [spec.form || '', F, spec.plate || '', spec.glass || ''].join('|');
    if (used.has(sig)) throw new Error('site151 clone ' + sig);
    const key = pickChunk(x + 1, y + 1);
    if (!room(key, estimate(spec))) throw new Error('site151 chunk room ' + spec.id + '@' + key + ' ' + ((CH[key].objects || []).length + (added[key] || 0)));
    const fg = 'rqe_p10u_' + spec.id;
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

  /* 进深只做 6 m，北缘停在 y414，让出上麓亭和草地（y418）。西侧让开麓阶铺，东侧让开踏步。 */
  const Y = 408;
  buildMass({
    id: 'tea', name: '麓东茶寮', x: 1300, y: Y, kind: 'shop', glass: 'hd_g_yl', form: '横铺', family: '淡金茶寮', plate: '2x2',
    signs: [{ face: 'S', floor: 1, bay: 0, text: '麓东茶寮' }],
    st: { podium: 1, setbackTop: 0, crownStone: 1, beltEvery: 0 },
    mass: { F: 2, podiumNS: 2, podiumNW: 2, towerNS: 2, towerNW: 2, towerOff: 0, midFromTop: 0, midNS: 2, midNW: 2, crownNS: 2, crownNW: 2 },
  });
  buildMass({
    id: 'read', name: '台地阅览', x: 1320, y: Y, kind: 'life', glass: 'hd_g_yx', form: '阅台', family: '淡蓝阅览', plate: '2x1',
    signs: [{ face: 'S', floor: 1, bay: 1, text: '台地阅览' }],
    st: { podium: 1, setbackTop: 1, crownStone: 1, beltEvery: 0 },
    mass: { F: 3, podiumNS: 3, podiumNW: 2, towerNS: 3, towerNW: 2, towerOff: 0, midFromTop: 0, midNS: 3, midNW: 2, crownNS: 2, crownNW: 1 },
  });
  buildMass({
    id: 'post', name: '踏步驿站', x: 1332, y: Y, kind: 'shop', glass: 'hd_g_wm', form: '驿亭', family: '冷青驿站', plate: '3x2',
    signs: [{ face: 'S', floor: 1, bay: 1, text: '踏步驿站' }],
    st: { podium: 1, setbackTop: 0, crownStone: 0, beltEvery: 0 },
    mass: { F: 2, podiumNS: 3, podiumNW: 2, towerNS: 3, towerNW: 2, towerOff: 0, midFromTop: 0, midNS: 3, midNW: 2, crownNS: 3, crownNW: 2 },
  });
  put('bench', 'community_bench', 1314, 411, { rot: 0, fade_group: 'rqe_p10u_tree' });
  put('tr', 'rq_x_tree', 1313, 413, { variant: 'ginkgo', fade_group: 'rqe_p10u_tree' });

  const feet = built.flatMap((b) => b.parts);
  const hit = (o, rect, pad) => o.x > rect[0] - pad && o.x < rect[2] + pad && o.y > rect[1] - pad && o.y < rect[3] + pad;
  const propHit = (o) => {
    if (!o || String(o.fade_group || '').startsWith('rqe_p10u_')) return false;
    const pad = o.type === 'rq_x_tree' ? 2.2 : (o.type === 'p_lamp' || o.type === 'p_hedge' || o.type === 'community_bench' || o.type === 'rq_x_shrub' ? 0.6 : 0);
    if (!pad) return false;
    return feet.some((f) => hit(o, f, pad));
  };
  for (const ch of Object.values(CH)) if (ch && ch.objects) ch.objects = ch.objects.filter((o) => !propHit(o));

  /* 矮楼立面。塔、亭和已经收过身的高层不动。同一排相邻的楼用不同节奏。 */
  const SKIP = new Set(['rqe_p10o_ts', 'rqe_p10o_cs', 'rqe_p10p_bell', 'rqe_p10q_slant', 'rqe_p10q_curve', 'rqe_p10r_seam', 'rqe_p10r_slot', 'rqe_p10s_fold', 'rqe_p10t_step']);
  const targets = [];
  function want(b) {
    if (!b || !b.id || b.F < 2 || b.kind === 'park' || b.kind === 'work' || b.kind === 'hotel') return;
    if (b.F >= 10 || SKIP.has(b.id)) return;
    if (!/^rqe_p10[opqrstu]_/.test(b.id)) return;
    targets.push(b);
  }
  for (const node of [P.north16, P.south16, P.site144, P.site147, P.site148, P.site149, P.site150]) {
    for (const b of (node && node.buildings) || []) want(b);
  }
  for (const b of built) want(b);
  const RHY = ['pier', 'belt', 'punch', 'stripe', 'crown', 'mix'];
  const rows = new Map();
  for (const b of targets) {
    const key = Math.round(b.y0 / 4);
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(b);
  }
  for (const list of rows.values()) {
    list.sort((a, b) => a.x0 - b.x0 || a.name.localeCompare(b.name));
    let prev = -1;
    list.forEach((b, i) => {
      let k = (i + (Math.round(b.y0) & 3)) % RHY.length;
      if (k === prev) k = (k + 1) % RHY.length;
      if (list[i + 1]) {
        const nxt = (i + 1 + (Math.round(list[i + 1].y0) & 3)) % RHY.length;
        if (k === nxt) k = (k + 2) % RHY.length;
      }
      prev = k;
      b.facadeRhythm = RHY[k];
    });
  }
  const ALT = {
    hd_g_yh: 'hd_g_ls', hd_g_ls: 'hd_g_yh', hd_g_hd: 'hd_g_qp', hd_g_qp: 'hd_g_hd',
    hd_g_cj: 'hd_g_yl', hd_g_yl: 'hd_g_wm', hd_g_wm: 'hd_g_cj', hd_g_sl: 'hd_g_yx',
    hd_g_yx: 'hd_g_sl', hd_g_dl: 'hd_g_yl2', hd_g_yl2: 'hd_g_dl',
  };
  const byFg = new Map();
  for (const ch of Object.values(CH)) {
    for (const o of (ch && ch.objects) || []) {
      if (!o || o.type !== 'f_wall' || !o.fade_group) continue;
      let list = byFg.get(o.fade_group);
      if (!list) byFg.set(o.fade_group, list = []);
      list.push(o);
    }
  }
  for (const list of Object.values(bags)) {
    for (const o of list) {
      if (o.type !== 'f_wall') continue;
      let bag = byFg.get(o.fade_group);
      if (!bag) byFg.set(o.fade_group, bag = []);
      bag.push(o);
    }
  }
  function toStone(o) { o.variant = 'hd_stone'; delete o.hdGlass; o.night_lit = 0; }
  function toGlass(o, v, floor, bay) {
    o.variant = v;
    o.hdGlass = 1;
    if (o.state === 'upper') o.night_lit = (floor + bay) % 4 !== 0 ? 1 : 0;
  }
  function bayOf(o, b) {
    if (o.rot === 6) return Math.round((o.y - (b.y0 + 3)) / 3);
    return Math.round((o.x - b.x0) / 3);
  }
  let retouched = 0, wallsChanged = 0;
  const rhythmCount = {};
  for (const b of targets) {
    const walls = byFg.get(b.id) || [];
    const rhythm = b.facadeRhythm || 'mix';
    const glass = b.glass || 'hd_g_hd';
    let changed = 0;
    function paint(o, mode) {
      const floor = Math.round((o.z || 0) / 3) + 1;
      const bay = bayOf(o, b);
      const isSign = o.variant === 'hd_g_sign' || o.state === 'ground';
      if (isSign) return false;
      const isGlass = typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0;
      const isStone = o.variant === 'hd_stone';
      if (mode === 'stone' && isGlass) { toStone(o); return true; }
      if (mode === 'masonry' && (isGlass || isStone)) { toGlass(o, bay % 2 ? 'hd_g_dl' : 'hd_g_yl2', floor, bay); return true; }
      if (mode === 'alt' && (isGlass || isStone)) { toGlass(o, ALT[isGlass ? o.variant : glass] || 'hd_g_qp', floor, bay); return true; }
      if (mode === 'own' && isStone) { toGlass(o, glass || 'hd_g_hd', floor, bay); return true; }
      return false;
    }
    for (const o of walls) {
      if (o.state === 'ground' || o.variant === 'hd_g_sign') continue;
      const floor = Math.round((o.z || 0) / 3) + 1;
      const bay = bayOf(o, b);
      const F = b.F;
      let mode = '';
      if (rhythm === 'pier') mode = bay % 2 === 1 ? 'stone' : (F <= 2 ? 'own' : '');
      else if (rhythm === 'belt') {
        const mid = Math.max(2, Math.min(F - 1, Math.ceil(F / 2)));
        mode = floor === mid ? 'stone' : (F <= 2 ? 'masonry' : '');
      } else if (rhythm === 'punch') mode = 'masonry';
      else if (rhythm === 'stripe') mode = floor % 2 === 0 ? 'alt' : (F <= 2 ? 'own' : '');
      else if (rhythm === 'crown') mode = (F >= 4 && floor >= F - 1) || (F < 4 && bay % 2 === 1) ? 'stone' : (F <= 2 ? 'masonry' : '');
      else mode = bay % 3 === 2 ? 'stone' : (bay % 3 === 1 ? 'masonry' : (F <= 2 ? 'alt' : ''));
      if (mode && paint(o, mode)) changed++;
    }
    const upperNow = () => walls.filter((o) => o.state === 'upper' && o.variant !== 'hd_g_sign');
    if (new Set(upperNow().map((o) => o.variant)).size < 2) {
      for (const o of upperNow()) {
        const floor = Math.round((o.z || 0) / 3) + 1;
        const bay = bayOf(o, b);
        if (bay % 2) toStone(o);
        else toGlass(o, ALT[glass] || 'hd_g_qp', floor, bay);
        changed++;
      }
    }
    if (changed) { retouched++; wallsChanged += changed; rhythmCount[rhythm] = (rhythmCount[rhythm] || 0) + 1; }
  }

  for (const [id, list] of Object.entries(bags)) {
    if (!CH[id]) throw new Error('site151 missing chunk ' + id);
    const next = (CH[id].objects || []).concat(list);
    if (next.length > 2600) throw new Error('site151 chunk cap ' + id + ' ' + next.length);
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
  if (bad.length) throw new Error('site151 overlap ' + bad.slice(0, 6).join(' | '));
  const wet = [];
  for (const c of colliders) for (const w of N.water || []) if (w && overlaps(c.rect, w)) wet.push(c.id);
  if (wet.length) throw new Error('site151 water ' + wet.join(','));
  if (retouched < 40) throw new Error('site151 facades ' + retouched);

  const counts = {};
  for (const [id, n] of Object.entries(added)) counts[id] = { added: n, total: CH[id].objects.length };
  P.site151 = {
    unconfirmed: true,
    choice: 'quality+fill',
    buildings: built,
    lot: [1300, 408, 1341, 414],
    rhythms: rhythmCount,
    retouched,
    wallsChanged,
    counts,
    cap: 120,
  };
  P.reasons.site151 = '第二十二刀不做新区。北界 y432 以上仍是山，南边是海，东边是澜海，榕桥剩下的学校、河岸公园、庭院和渔村老街不动。月河石驳岸仍是一整面，不改河岸。西侧山体封口继续挡住 (400, 400) 和 (900, 400)，山径台地（600, 370）仍是草地。上台人行道已经收到 x1368、y428，楼却停在麓阶铺 x1298，踏步在 x1344，中间这段沿街是空的，不是上麓亭那块草地。补了三栋配套，都在 y408、进深 6 m，北缘 y414，不压上麓亭和草地（y418）：麓东茶寮 (1300, 408)、台地阅览 (1320, 408)、踏步驿站 (1332, 408)。中间 x1306–1320 留着进小园的口。没有办公塔，也不是 438 m。Site143 到 Site150 的矮楼原先几乎都是首层石材、上面整片同色玻璃、顶上一层石材。相邻的改成竖墩、腰线、开窗、条带、重冠或跳色，塔的层数和玻璃不动。不进月河，不进澜海，不进山。不把南埠往 y-1540 以南推。名字和尺寸未经确认。';
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '台地阅览', rect: [1320, 408, 1329, 414], kind: 'campus', prio: 1 },
    { name: '麓东茶寮', rect: [1300, 408, 1306, 414], kind: 'market', prio: 1 },
  ]);
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10u_tea', name: '麓东茶寮', x: 1303, y: 406, desc: '2 层茶寮外壳。没有室内。名字未经确认', cat: 'shop' },
    { id: 'p10u_read', name: '台地阅览', x: 1324, y: 406, desc: '3 层阅览外壳，顶层退成小间。没有室内。名字未经确认', cat: 'life' },
    { id: 'p10u_post', name: '踏步驿站', x: 1336, y: 406, desc: '2 层驿站外壳。没有室内。名字未经确认', cat: 'shop' },
  ]);
  root.SITE151 = P.site151;
})();
