/* 榕桥区 E1v variety pass (Leo 2026-10-17 23:36 + 23:38): real old districts are varied. Deterministic, seeded per building id
 * (stable across reloads/saves): era (80s / 90s / 2000s) -> facade material, roof type, window & balcony mix, rusty or newer AC;
 * floor counts jittered within a family range with no two neighbours alike; some buildings get a few renovated units
 * (glass-railing balconies with plants / swing chair, new window frames, warm light) next to old barred / laundry units.
 * Pure data, loaded after rongqiao_north_extension.js and before rongqiao_expand_e1.js (E1/E2 bld() use the API).
 * restyleOld() re-skins the older blocks by VARIANT only (base objects keep [id,type,x,y,state], so the save contract holds);
 * the P2 background row (chunk content, not in the contract) also gets varied floor counts. All choices 未经Leo确认. */
(function () {
  'use strict';
  const D = window.SCENE_DATA; if (!D || window.RONGQIAO_VARIETY) return;
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(s) { let a = hash(String(s)) || 1; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const pickR = (R, a) => a[Math.floor(R() * a.length)];
  const KIT_BRICK = ['base', 'w1', 'w2'];
  const PITCH_V = ['r_pitch', 'r_pitchg'];
  const tile = (roof, type, id) => (roof === 'r_pitch' && type === 'b_roof_b' ? PITCH_V[(hash(String(id) + ':tile') >>> 5) % 2] : roof);   // 12 x 9 hip roofs: red clay or grey cement tile (atlas budget: a glazed set and a grey 15 x 12 did not fit the 4 mobile pages)
  const ERA = {
    e80: { mat: ['base', 'w1', 'w2', 'm_brick2', 'm_cement', 'm_stain'], roofA: ['base', 'r_tank', 'r_shed', 'r_shed'], roofB: ['base', 'c', 'r_tank', 'r_shed'], small: ['r_tank', 'r_shed'],
      win: ['w1', 'w1', 'g', 'g', 'rk', 'base', 'w2', 'base', 'w1'], bal: ['b1', 'b2', 'o2', 'o2', 'o1'], rust: 0.6, reno: 0.3 },
    e90: { mat: ['m_white', 'm_white', 'm_mosaic', 'm_beige', 'p1', 'm_stain'], roofA: ['r_solar', 'r_tank', 'r_shed', 'r_green'], roofB: ['r_solar', 'r_tank', 'r_shed', 'c'], small: ['r_solar', 'r_tank', 'r_shed'],
      win: ['base', 'g', 'gw', 'rk', 'w2', 'gw', 'base', 'w1'], bal: ['o1', 'o1', 'b1', 'b2', 'o2'], rust: 0.35, reno: 0.4 },
    e00: { mat: ['m_pink', 'm_grey', 'm_beige', 'm_white', 'p1'], roofA: ['r_pitch', 'r_green', 'r_solar', 'r_pitch'], roofB: ['r_pitch', 'r_green', 'r_solar'], small: ['r_green', 'r_solar'],
      win: ['n1', 'n2', 'base', 'gw', 'n1'], bal: ['o1', 'g1', 'b2'], rust: 0.1, reno: 0.6 },
  };
  const prev = {};
  /** per-building style. fam groups neighbours (no two consecutive alike); range = [lo, hi] floors */
  function style(id, fam, f, opt = {}) {
    const R = rng('v:' + id), last = prev[fam];
    const era = opt.era || pickR(R, ['e80', 'e80', 'e90', 'e90', 'e00']), E0 = ERA[era] || ERA.e90, E = opt.mats ? Object.assign({}, E0, { mat: opt.mats }) : E0;
    const lo = opt.range ? opt.range[0] : f <= 2 ? Math.max(1, f - 1) : f <= 8 ? Math.max(3, f - 2) : f - 2, hi = opt.range ? opt.range[1] : f <= 2 ? Math.min(3, f + 1) : f + 2;
    let F = opt.keepF ? f : lo + Math.floor(R() * (hi - lo + 1));
    if (!opt.keepF && last && last.F === F && hi > lo) F = F + 1 <= hi ? F + 1 : F - 1;
    let mat = pickR(R, E.mat); const matPool = opt.mats ? E.mat : E.mat.concat(ERA.e90.mat); for (let k = 0; k < 6 && last && last.mat === mat; k++) mat = pickR(R, matPool);
    const size = opt.size || 'a', pool = size === 'a' ? E.roofA : size === 'b' ? E.roofB : E.small;
    let roof = pickR(R, pool.filter((r) => (r !== 'base' && r !== 'c') || KIT_BRICK.includes(mat)).concat(size === 's9' || size === 's12' ? [] : []));
    if (!roof) roof = pickR(R, E.small);
    for (let k = 0; k < 6 && last && last.roof === roof; k++) roof = pickR(R, size === 'a' ? ['r_tank', 'r_shed', 'r_solar', 'r_green', 'r_pitch'] : size === 'b' ? ['r_tank', 'r_shed', 'r_solar', 'r_green', 'r_pitch'] : E.small.concat(['r_tank', 'r_shed']));
    const s = { id, era, F, mat, roof, R, win: E.win, bal: E.bal, rust: E.rust, reno: new Set(), renoWin: new Set() };
    prev[fam] = s;
    if (opt.reno !== false && F >= 2 && R() < (opt.renoP != null ? opt.renoP : E.reno)) {
      const bays = opt.bays || 4, n = 1 + Math.floor(R() * Math.max(2, Math.round((F - 1) * bays * 0.18)));
      for (let k = 0; k < n; k++) { const fl = 2 + Math.floor(R() * (F - 1)), b = Math.floor(R() * bays); s.reno.add(fl + ':' + b); for (const db of [-1, 1]) if (R() < 0.6) s.renoWin.add(fl + ':' + (b + db)); }
    }
    return s;
  }
  /** facade unit choice for upper floors: { kind: 'balc' | 'win', variant, state } */
  function unit(s, f, b, balcP, face) {
    const R = s.R, key = f + ':' + b;
    if (face !== 'W' && s.reno.has(key)) return { kind: 'balc', variant: R() < 0.45 ? 'g2' : 'g1', state: R() < 0.25 ? 'laundry' : 'default', reno: true };
    if (s.renoWin.has(key) || (face === 'W' && s.reno.has(key))) return { kind: 'win', variant: R() < 0.5 ? 'n1' : 'n2', reno: true };
    if (face !== 'W' && R() < balcP) return { kind: 'balc', variant: pickR(R, s.bal), state: R() < 0.6 ? 'laundry' : 'default' };
    return { kind: 'win', variant: pickR(R, s.win) };
  }
  const acVariant = (s) => (s.R() < s.rust ? 'rust' : s.R() < 0.5 ? 'a1' : 'a2');
  /** re-skin an existing building group by variant only (floors unchanged unless allowed) */
  function restyleGroup(list, fg, fam, opt = {}) {
    const objs = list.filter((o) => o.fade_group === fg); if (!objs.length) return null;
    const walls = objs.filter((o) => o.type === 'f_wall'), F0 = new Set(walls.map((o) => Math.round((o.z || 0) / 3))).size;
    const roofO = objs.find((o) => /^b_roof_[ab]$/.test(o.type));
    const s = style(fg, fam, F0, Object.assign({ keepF: !opt.floors, size: roofO ? (roofO.type === 'b_roof_a' ? 'a' : 'b') : 'a', bays: 5 }, opt));
    if (opt.floors && s.F !== F0 && roofO) {
      const top = F0 - 1;
      if (s.F < F0) { for (const o of objs) if (o !== roofO && Math.round((o.z || 0) / 3) >= s.F && o.z > 0.01) { const i = list.indexOf(o); if (i >= 0) list.splice(i, 1); } }
      else { const tops = objs.filter((o) => o !== roofO && o.z != null && Math.abs(o.z - top * 3 - (o.type === 'f_ac' ? 0.5 : 0)) < 0.01 && o.type !== 'f_pipe'); for (let f = F0; f < s.F; f++) for (const o of tops) list.push(Object.assign({}, o, { id: `${o.id}_v${f}`, z: o.z + (f - top) * 3 })); }
      roofO.z = s.F * 3;
    }
    for (const o of list) {
      if (o.fade_group !== fg) continue;
      const fl = Math.round((o.z || 0) / 3) + 1, b = Math.round(((o.rot === 6 ? -o.y : o.x) % 15 + 15) % 15 / 3);
      if (o.type === 'f_wall') o.variant = s.mat;
      else if (o.type === 'f_window') { if (fl > 1) { const u = unit(s, fl, b, 0, o.rot === 6 ? 'W' : 'S'); o.variant = u.reno ? (u.kind === 'win' ? u.variant : 'n1') : pickR(s.R, s.win); } }
      else if (o.type === 'f_balcony') { const u = s.reno.has(fl + ':' + b) ? { variant: s.R() < 0.45 ? 'g2' : 'g1' } : { variant: pickR(s.R, s.bal) }; o.variant = u.variant; }
      else if (o.type === 'f_ac') o.variant = acVariant(s);
      else if (o === roofO && s.roof && !(s.roof === 'c' && o.type === 'b_roof_a')) o.variant = tile(s.roof, o.type, fg);   // hip roofs: red clay / grey cement tile
    }
    return s;
  }
  /** older blocks: base scene rows (variant only), east chunk, P2 background row (variant + floors) */
  function restyleOld() {
    const C = window.SCENE_CHUNKS || {}, done = [];
    const groups = (list, re) => [...new Set(list.filter((o) => o.type === 'f_wall' && re.test(o.fade_group || '')).map((o) => o.fade_group))];
    for (const fg of groups(D.objects, /^(nb_|b12$|shop24$)/)) done.push(restyleGroup(D.objects, fg, 'base:' + fg.replace(/\d+$/, ''), { keepF: true }));
    if (C.east) for (const fg of groups(C.east.objects, /^nb_e/)) done.push(restyleGroup(C.east.objects, fg, 'east', { keepF: true }));
    for (const id of ['rq_north_bg_w', 'rq_north_bg_m', 'rq_north_bg_e']) if (C[id]) for (const fg of groups(C[id].objects, /^rq_bg/)) done.push(restyleGroup(C[id].objects, fg, 'p2bg', { floors: true, range: [3, 7], keepF: false }));
    return done.filter(Boolean).length;
  }
  window.RONGQIAO_VARIETY = { hash, rng, style, unit, acVariant, restyleGroup, restyleOld, ERA, tile, version: 1 };
  window.RONGQIAO_VARIETY.restyled = restyleOld();
})();
