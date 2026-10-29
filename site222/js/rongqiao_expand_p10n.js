/* 月河区 · 山前与月津补块 (Site143). 不推北界、不推南埠。
 * 北侧把望山路到山径之间的空球场铺成住宅、铺面、社康和听山酒店；台地沿山径再排别墅。
 * 南侧把南堤到澜石南街之间的空地铺成住宅、铺面、月津小学、幼儿园、社康和潮声办公。
 * 塔楼层数、平面、材料和剪影都不跟已有塔相同。不做 438 m 塔。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10m || D.rongqiaoExpandP10n || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10n = 1;
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
  for (const k of ['east9', 'east10', 'east11', 'north12', 'south13', 'south14', 'north15']) take(P[k]);
  const roads = [
    [300, 132, 1704, 158], [368, 64, 1704, 80],
    [356, 248, 1724, 264], [356, 308, 1724, 324], [356, 348, 1724, 356],
    [356, -48, 1724, -32], [356, 16, 1724, 32], [356, -80, 1724, -64],
    [356, -208, 1724, -192], [356, -144, 1724, -128],
    [356, -260, 1724, -208], [356, -100, 1724, -80],
    [1040, -186, 1248, -168], [356, -220, 404, -196],
    [1704, -260, 1770, 400],
    [1104, 264, 1288, 348], [486, 264, 594, 348], [1420, 36, 1504, 62],
    [376, -214, 560, -112], [356, 358, 1688, 362],
  ];
  for (const [a, b] of NS) roads.push([a - 0.4, -220, b + 0.4, 378]);
  for (const r of roads) addBlock(r);

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
  const COURT = [1044, 38, 1094, 58];
  const POCKET = [1492, 326, 1514, 344];
  paint(COURT, 'C');
  paint(POCKET, 'G');

  const northList = [], southList = [], hillList = [];
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10o_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    (o.y >= 356 ? hillList : o.y >= 200 ? northList : southList).push(o);
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
    const m = spec.mass, fg = 'rqe_p10o_' + spec.id;
    for (const r of parts) block(fg + '_' + r[0] + '_' + r[1], r);
    built.push({
      id: fg, name: spec.name, x0: spec.x, y0: spec.y, W: m.podiumNS * 3, D: m.podiumNW * 3, F: m.F, floors: m.F,
      kind: spec.kind || 'home', form: spec.form || '', family: spec.family || '', glass: spec.glass || '',
      plate: spec.plate || (m.towerNS + 'x' + m.towerNW),
      parts: parts.map((r) => r.slice()), unconfirmed: true,
    });
  }
  function buildMass(spec) {
    const m = spec.mass, st = spec.st, F = m.F, fg = 'rqe_p10o_' + spec.id, x = spec.x, y = spec.y;
    const foot = [x, y, x + m.podiumNS * 3, y + m.podiumNW * 3];
    const clash = blocker(foot, 0.7);
    if (clash) throw new Error('site143 footprint ' + spec.id + ' ' + foot.join(',') + ' vs ' + clash.join(','));
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

  /* 听山酒店 17 层折面，冷青绿，塔身 7×3。潮声办公 19 层错台，暖石开窗，塔身 5×4。都不是已有剪影，也不是 438 m。 */
  buildMass({
    id: 'ts', name: '听山酒店', x: 640, y: 328, kind: 'hotel', glass: 'hd_g_wm', form: '折面', family: '冷青绿', plate: '7x3',
    signs: [{ face: 'S', floor: 1, bay: 3, text: '听山酒店' }],
    st: { podium: 2, setbackTop: 3, crownStone: 1, beltEvery: 5 },
    mass: { F: 17, podiumNS: 9, podiumNW: 4, towerNS: 7, towerNW: 3, towerOff: 1, midFromTop: 7, midNS: 5, midNW: 3, crownNS: 3, crownNW: 2 },
  });
  buildMass({
    id: 'cs', name: '潮声办公', x: 760, y: -30, kind: 'work', glass: 'hd_g_dl', form: '错台', family: '暖石开窗', plate: '5x4',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '潮声办公' }],
    st: { podium: 3, setbackTop: 4, crownStone: 2, beltEvery: 0 },
    mass: { F: 19, podiumNS: 8, podiumNW: 5, towerNS: 5, towerNW: 4, towerOff: 1, midFromTop: 8, midNS: 4, midNW: 3, crownNS: 2, crownNW: 2 },
  });
  box({ id: 'lc', name: '林泉社康', x: 980, y: 294, nS: 6, nW: 3, F: 3, glass: 'hd_g_ls', kind: 'clinic', family: '深蓝低透', signs: [{ face: 'S', floor: 2, bay: 2, text: '林泉社康' }] });
  box({ id: 'sch', name: '月津小学', x: 972, y: 36, nS: 8, nW: 4, F: 4, glass: 'hd_g_yx', kind: 'school', family: '淡蓝中透', signs: [{ face: 'S', floor: 2, bay: 3, text: '月津小学' }] });
  box({ id: 'kg', name: '月津幼儿园', x: 1188, y: -28, nS: 5, nW: 3, F: 2, glass: 'hd_g_yl2', kind: 'school', family: '米黄石材', signs: [{ face: 'S', floor: 1, bay: 1, text: '月津幼儿园' }] });
  box({ id: 'sk', name: '潮声社康', x: 500, y: 50, nS: 6, nW: 3, F: 3, glass: 'hd_g_qp', kind: 'clinic', family: '石墨低透', signs: [{ face: 'S', floor: 2, bay: 2, text: '潮声社康' }] });
  box({ id: 'pk', name: '林泉亭', x: 1496, y: 330, nS: 2, nW: 2, F: 1, glass: 'hd_g_hd', kind: 'park', family: '亭', form: '亭', signs: [{ face: 'S', floor: 1, bay: 0, text: '林泉亭' }] });
  box({ id: 'yt', name: '月津亭', x: 1056, y: 44, nS: 2, nW: 2, F: 1, glass: 'hd_g_hd', kind: 'park', family: '亭', form: '亭', signs: [{ face: 'S', floor: 1, bay: 0, text: '月津亭' }] });
  addBlock(COURT);
  addBlock(POCKET);

  const GLASS = ['hd_g_hd', 'hd_g_yx', 'hd_g_yl2', 'hd_g_wm', 'hd_g_sl', 'hd_g_ls', 'hd_g_dl', 'hd_g_qp'];
  const FS = [3, 4, 5, 6, 4, 3];
  let seq = 0;
  function fillRow(y, nW, x0, x1, homes, shops, family) {
    let x = x0, guard = 0;
    while (x + 12 <= x1 && guard++ < 420) {
      const nS = 4 + (seq % 4);
      const w = nS * 3;
      if (x + w > x1) break;
      const rect = [x, y, +(x + w).toFixed(2), +(y + nW * 3).toFixed(2)];
      if (hits(rect, 0.8)) { x += 3; continue; }
      const i = seq++;
      const shop = i % 5 === 0;
      const name = shop ? shops[i % shops.length] : homes[i % homes.length];
      const F = shop ? 2 : FS[i % FS.length];
      box({
        id: 'h' + i, name, x, y, nS, nW, F, glass: GLASS[i % GLASS.length],
        kind: shop ? 'shop' : 'home', family: shop ? '沿街铺' : family, form: nS + 'x' + nW,
        signs: [{ face: 'S', floor: 1, bay: 0, text: name }],
      });
      x += w + 6;
    }
  }
  const NH = ['山前里', '林缘居', '泉北居', '听山里', '台地居'];
  const NSU = ['山前面馆', '林缘菜店', '泉北文具', '听山花店', '台地茶铺'];
  fillRow(284, 2, 364, 1682, NH, NSU, '北住宅');
  fillRow(294, 4, 364, 1682, NH, NSU, '北住宅');
  fillRow(328, 4, 364, 1682, NH, NSU, '北住宅');
  const SH = ['月津里', '潮声居', '河口里', '南堤里', '望津居'];
  const SU = ['月津面馆', '潮声菜店', '南堤文具', '望津花店', '堤口茶铺'];
  fillRow(-62, 3, 364, 1682, SH, SU, '南住宅');
  fillRow(-28, 3, 364, 1682, SH, SU, '南住宅');
  fillRow(-18, 2, 364, 1682, SH, SU, '南住宅');
  fillRow(4, 3, 364, 1682, SH, SU, '南住宅');
  fillRow(50, 3, 364, 1682, SH, SU, '南住宅');

  const VILLA = [
    ['hd_g_yl2', '米黄石材', 2, 4],
    ['hd_g_ls', '深灰石材', 3, 3],
    ['hd_g_wm', '冷青石材', 2, 5],
    ['hd_g_dl', '暖木石材', 3, 4],
    ['hd_g_qp', '石墨石材', 2, 3],
  ];
  let vx = 364, vi = 0, guard = 0;
  while (vx + 12 <= 1682 && guard++ < 80) {
    const g = VILLA[vi % VILLA.length];
    const nS = g[3], w = nS * 3;
    const rect = [vx, 366, vx + w, 372];
    if (hits(rect, 0.9)) { vx += 3; continue; }
    const name = '台地' + (vi + 1) + '号';
    box({
      id: 'tv' + vi, name, x: vx, y: 366, nS, nW: 2, F: g[2], glass: g[0],
      kind: 'home', family: g[1], form: nS + 'x2',
      signs: [{ face: 'S', floor: 1, bay: 0, text: name }],
    });
    vi++;
    vx += w + 14;
  }

  function tree(id, x, y, variant, bag) {
    const o = { id: 'rqp10o_' + id, type: 'rq_x_tree', x, y, variant, fade_group: 'rqe_p10o_tree' };
    bag.push(o);
  }
  tree('tr_c1', 1052, 52, 'ginkgo', southList);
  tree('tr_c2', 1072, 40, 'sakura', southList);
  tree('tr_p1', 1510, 340, 'sakura', northList);
  tree('tr_p2', 1490, 340, 'ginkgo', northList);
  southList.push({ id: 'rqp10o_bench_c', type: 'community_bench', x: 1040, y: 54, rot: 0 });
  northList.push({ id: 'rqp10o_bench_p', type: 'community_bench', x: 1496, y: 340, rot: 0 });

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
  if (CH.rqe_p10_e10) CH.rqe_p10_e10.objects = scrub(CH.rqe_p10_e10.objects).concat(scrub(northList));
  if (CH.rqe_p10_e11) CH.rqe_p10_e11.objects = scrub(CH.rqe_p10_e11.objects).concat(scrub(southList));
  if (CH.rqe_p10_e13) CH.rqe_p10_e13.objects = scrub(CH.rqe_p10_e13.objects).concat(scrub(hillList));
  for (const ch of Object.values(CH)) {
    if (!ch || !ch.objects || ch === CH.rqe_p10_e10 || ch === CH.rqe_p10_e11 || ch === CH.rqe_p10_e13) continue;
    ch.objects = scrub(ch.objects);
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);

  const northB = built.filter((b) => b.y0 >= 200);
  const southB = built.filter((b) => b.y0 < 80);
  const towersOf = (list) => list.filter((b) => (b.kind === 'work' || b.kind === 'hotel') && b.F >= 16);
  P.slice = 16;
  P.north16 = { unconfirmed: true, buildings: northB, towers: towersOf(northB), court: POCKET.slice(), cap: 120 };
  P.south16 = { unconfirmed: true, buildings: southB, towers: towersOf(southB), school: [972, 36, 996, 48], court: COURT.slice(), cap: 120 };
  P.keepLots = (P.keepLots || []).concat([COURT.slice(), POCKET.slice()]);
  P.reasons.site143 = '第十六片：不推山体封口（北界仍是 y378），也不把南埠往 y-1540 以南推。山前把望山路和山径之间的空球场补成住宅、铺面和林泉社康，听山酒店是 17 层折面（冷青绿，塔身 7×3，约 51 m）。台地沿山径再排别墅，层数、面宽和石材颜色分开，中间留小院。南侧从南堤到澜石南街补住宅、铺面、月津小学、月津幼儿园和潮声社康。潮声办公是 19 层错台（暖石开窗，塔身 5×4，约 57 m）。两栋的层数、平面、材料和剪影都不跟已有塔楼相同，也不是 438 m。月津小学操场和林泉亭小园是故意留下的场地。新楼并进已有分块，不新占分块状态袋。名字和尺寸未经确认。';
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '月津小学', rect: [972, 36, 996, 48], kind: 'campus', prio: 1 },
    { name: '月津小学操场', rect: COURT.slice(), kind: 'campus', prio: 1 },
    { name: '月津幼儿园', rect: [1188, -28, 1203, -19], kind: 'campus', prio: 1 },
    { name: '林泉社康', rect: [980, 294, 998, 303], kind: 'campus', prio: 1 },
    { name: '潮声社康', rect: [500, 50, 518, 59], kind: 'campus', prio: 1 },
    { name: '林泉亭', rect: POCKET.slice(), kind: 'park', prio: 1 },
  ]);
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_ts', name: '听山酒店', x: 652, y: 324, desc: '17 层折面酒店。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_cs', name: '潮声办公', x: 772, y: -34, desc: '19 层错台办公楼。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_sch16', name: '月津小学', x: 984, y: 32, desc: '4 层教学楼和操场。只是外观。名字未经确认', cat: 'school' },
    { id: 'p10_kg16', name: '月津幼儿园', x: 1194, y: -32, desc: '2 层幼儿园外壳。没有室内。名字未经确认', cat: 'school' },
    { id: 'p10_lc', name: '林泉社康', x: 988, y: 290, desc: '3 层社康外壳。没有室内。名字未经确认', cat: 'life' },
    { id: 'p10_sk16', name: '潮声社康', x: 508, y: 46, desc: '3 层社康外壳。没有室内。名字未经确认', cat: 'life' },
  ]);
})();
