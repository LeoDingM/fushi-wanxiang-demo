/* 月河区 · 河东新城配套 (2026-10-26). 填现有走廊，不推东界，不南扩。
 * 月河天街：石材裙楼 + 冷玻璃，南门切场景进中庭。家禾河东店只是南立面店招。
 * 月河高级中学：教学楼、体育馆、跑道、校门，只有外观。
 * 河东堤岸公园：打开月河东岸 x360–430、y192–234。北侧 y234 以上仍封着。
 * 邻里生鲜、银杏里、河东里、河东派出所、河东社康、澄江广场补在塔楼空隙。
 * 墙皮沿用浅石材 / 冷玻璃 / 既有校园套件。店招是运行时文字，不新开图集页。
 * 菜市场仍是唯一无缝室内。不做 438 m 塔，不加河东公交。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window, SP = root.SP;
  if (!D || !N || !D.rongqiaoExpandP10c || D.rongqiaoExpandP10d || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10d = 1;
  const G = D.ground, CH = root.SCENE_CHUNKS || {};
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
  const rv = (D.colliders || []).find((c) => c.id === 'rqe_p10_riverland');
  if (rv && rv.rect[0] < 430) {
    const old = rv.rect.slice();
    N.solids = (N.solids || []).filter((s) => !(s[0] === old[0] && s[1] === old[1] && s[2] === old[2] && s[3] === old[3]));
    rv.rect[0] = 430;
    N.solids.push(rv.rect.slice());
  }
  paint([360, 192, 430, 234], 'G');
  paint([364, 192, 372, 232], 'S');
  paint([372, 206, 424, 214], 'S');
  paint([530, 164, 598, 188], 'S');

  const reserved = [
    [726, 82, 850, 128, 0],
    [488, 88, 546, 122, 1.2],
    [428, 94, 456, 108, 1.2],
    [884, 100, 912, 122, 1.2],
    [698, 164, 726, 180, 1.2],
    [457, 166, 466, 175, 2.2],
    [1050, 100, 1070, 114, 1.2],
    [528, 162, 600, 190, 0],
  ];
  const treeHit = (o, r) => o && o.type === 'rq_x_tree' && o.x > r[0] - r[4] && o.x < r[2] + r[4] && o.y > r[1] - r[4] && o.y < r[3] + r[4];
  for (const ch of Object.values(CH)) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => !reserved.some((r) => treeHit(o, r)));
  }

  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqe_p10_park_lip', [356, 234, 430, 238]);
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10d_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    const key = o.x >= 960 ? 'rqe_p10_e5' : o.x >= 820 ? 'rqe_p10_e4' : o.x >= 620 ? 'rqe_p10_e3' : o.x >= 460 ? 'rqe_p10_e2' : 'rqe_p10_hd';
    const ch = CH[key];
    if (ch && ch.objects) ch.objects.push(o);
    return o;
  }
  function pick(spec, f, side, b) {
    const sign = (spec.signs || []).find((s) => s.face === side && s.floor === f && s.bay === b);
    if (sign) return { variant: 'hd_g_sign', hdGlass: 1, sign: sign.text, forceGround: 1 };
    if (spec.wall) return { variant: side === 'W' ? (spec.wallW || spec.wall) : spec.wall };
    if (f <= (spec.podium || 1)) return { variant: 'hd_stone' };
    return { variant: spec.glass || 'hd_g_hd', hdGlass: 1 };
  }
  const built = [];
  function build(spec) {
    const F = spec.F, nS = spec.nS, nW = spec.nW, x = spec.x, y = spec.y;
    const fg = 'rqe_p10a_' + spec.id;
    const m = {
      F, podiumNS: nS, podiumNW: nW, towerNS: nS, towerNW: nW, towerOff: 0,
      midFromTop: 0, midNS: nS, midNW: nW, crownNS: nS, crownNW: nW,
    };
    const st = { podium: F, setbackTop: 0, beltEvery: 0 };
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3;
      for (let b = 0; b < nS; b++) {
        const face = pick(spec, f, 'S', b);
        const more = { z, state: face.forceGround || f === 1 ? 'ground' : 'upper', fade_group: fg, variant: face.variant };
        if (face.hdGlass) more.hdGlass = 1;
        if (face.sign) more.sign = face.sign;
        if (more.hdGlass && more.state === 'upper') more.night_lit = (f + b) % 4 !== 0 ? 1 : 0;
        put(spec.id + '_S' + f + '_' + b, 'f_wall', x + b * 3, y, more);
      }
      for (let b = 0; b < nW; b++) {
        const face = pick(spec, f, 'W', b);
        const more = { z, rot: 6, state: face.forceGround || f === 1 ? 'ground' : 'upper', fade_group: fg, variant: face.variant };
        if (face.hdGlass) more.hdGlass = 1;
        if (face.sign) more.sign = face.sign;
        if (more.hdGlass && more.state === 'upper') more.night_lit = (f * 3 + b) % 4 !== 0 ? 1 : 0;
        put(spec.id + '_W' + f + '_' + b, 'f_wall', x, y + 3 + b * 3, more);
      }
    }
    root.hedongRoofTower(put, spec, m, st, x, y, fg);
    const Wd = nS * 3, Dp = nW * 3;
    block(fg, [x, y, x + Wd, y + Dp]);
    built.push({ id: fg, name: spec.name, x0: x, y0: y, W: Wd, D: Dp, F, kind: spec.kind || 'amenity' });
    if (spec.portal) {
      const p = spec.portal;
      put(spec.id + '_entry', 'modern_entry_marker', p.x, p.y, {
        interact: 'portal', to: p.to, label: p.label, name: spec.name,
        reach: p.reach, spawn: p.spawn, fade_group: fg,
      });
    }
  }

  build({
    id: 'tj', name: '月河天街', x: 490, y: 90, nS: 18, nW: 10, F: 3, podium: 2, glass: 'hd_g_yh', kind: 'mall',
    signs: [{ face: 'S', floor: 3, bay: 8, text: '月河天街' }, { face: 'S', floor: 1, bay: 4, text: '家禾河东店' }],
    portal: { x: 517, y: 89.1, to: 'tj_lobby', label: '进入月河天街 · 首层中庭', reach: [517, 86], spawn: [9.0, 1.7, 'N'] },
  });
  build({
    id: 'fresh', name: '邻里生鲜', x: 430, y: 96, nS: 8, nW: 3, F: 2, podium: 1, glass: 'hd_g_hd', kind: 'shop',
    signs: [{ face: 'S', floor: 1, bay: 3, text: '邻里生鲜' }],
  });
  build({
    id: 'sch', name: '月河高级中学', x: 732, y: 102, nS: 8, nW: 5, F: 5, wall: 'sch_a', wallW: 'sch_b', kind: 'school',
  });
  build({
    id: 'gym', name: '月河高级中学体育馆', x: 824, y: 108, nS: 6, nW: 4, F: 3, wall: 'sch_c', wallW: 'sch_c', kind: 'school',
  });
  build({
    id: 'gL', name: '月河高级中学门亭', x: 768, y: 84, nS: 2, nW: 2, F: 2, podium: 2, kind: 'school',
    signs: [{ face: 'S', floor: 2, bay: 0, text: '月河高级中学' }],
  });
  build({
    id: 'gR', name: '月河高级中学门亭', x: 782, y: 84, nS: 2, nW: 2, F: 2, podium: 2, kind: 'school',
  });
  build({
    id: 'soho', name: '银杏里', x: 886, y: 104, nS: 8, nW: 4, F: 9, podium: 2, glass: 'hd_g_yl2', kind: 'home',
    signs: [{ face: 'S', floor: 1, bay: 3, text: '银杏里' }],
  });
  build({
    id: 'res', name: '河东里', x: 700, y: 166, nS: 8, nW: 4, F: 8, podium: 2, glass: 'hd_g_dl', kind: 'home',
    signs: [{ face: 'S', floor: 1, bay: 3, text: '河东里' }],
  });
  /* 原先 5 开间从 x460 收到 475，东墙压进澄江路车行道（471.5）。收到 3 开间，东缘 466，离西侧人行道 468 还有 2 m。 */
  build({
    id: 'pol', name: '河东派出所', x: 457, y: 166, nS: 3, nW: 3, F: 3, podium: 1, glass: 'hd_g_hd', kind: 'civic',
    signs: [{ face: 'S', floor: 2, bay: 1, text: '河东派出所' }],
  });
  build({
    id: 'clinic', name: '河东社康', x: 1052, y: 102, nS: 5, nW: 3, F: 2, podium: 1, glass: 'hd_g_sl', kind: 'civic',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '河东社康' }],
  });
  build({
    id: 'pk', name: '河东堤岸公园', x: 404, y: 196, nS: 2, nW: 1, F: 1, podium: 1, kind: 'park',
    signs: [{ face: 'S', floor: 1, bay: 0, text: '河东堤岸公园' }],
  });

  function ginkgo(x, y) { put('gk_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'ginkgo', fade_group: 'rqe_p10a_tree' }); }
  for (const [x, y] of [[384, 198], [400, 198], [416, 222], [384, 222], [544, 172], [568, 184], [588, 172], [560, 108], [588, 116], [640, 112], [664, 120], [714, 112], [848, 96], [678, 172], [678, 184], [740, 176], [780, 180], [820, 174], [840, 176], [898, 90], [920, 96]]) ginkgo(x, y);
  for (let x = 770; x < 808; x += 2) for (let y = 98; y < 112; y += 2) put('turf_' + x + '_' + y, 'rq_gturf', x, y, { fade_group: 'rqe_p10a_yard' });
  for (const x of [764, 770, 776, 782, 788, 794, 800, 806]) {
    put('trk_s_' + x, 'rq_s_trk_y', x, 90, { fade_group: 'rqe_p10a_yard' });
    put('trk_n_' + x, 'rq_s_trk_y', x, 116, { fade_group: 'rqe_p10a_yard' });
  }
  for (const y of [94, 98, 102, 108]) {
    put('trk_w_' + y, 'rq_s_trk_y', 764, y, { fade_group: 'rqe_p10a_yard' });
    put('trk_e_' + y, 'rq_s_trk_y', 808, y, { fade_group: 'rqe_p10a_yard' });
  }
  put('flag', 'rq_s_flag', 788, 106, { fade_group: 'rqe_p10a_yard' });
  put('hoop', 'rq_s_hoop', 800, 104, { variant: 's', fade_group: 'rqe_p10a_yard' });
  put('goal_w', 'rq_s_goal', 774, 106, { variant: 's', fade_group: 'rqe_p10a_yard' });
  put('goal_e', 'rq_s_goal', 802, 106, { variant: 'n', fade_group: 'rqe_p10a_yard' });
  put('pp', 'rq_s_pp', 784, 110, { fade_group: 'rqe_p10a_yard' });
  put('drop', 'rq_s_dropoff', 732, 77.6, { fade_group: 'rqe_p10a_yard' });
  const onDrop = (o) => o && o.type === 'rq_x_tree' && o.x > 729.85 && o.x < 748.15 && o.y > 75.7 && o.y < 81.9;
  for (const ch of Object.values(CH)) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => !onDrop(o));
  }
  for (let x = 730; x <= 766; x += 2.4) put('hedge_s1_' + Math.round(x), 'p_hedge', x, 82.4);
  for (let x = 790; x <= 846; x += 2.4) put('hedge_s2_' + Math.round(x), 'p_hedge', x, 82.4);
  for (let y = 86; y <= 126; y += 2.4) {
    put('hedge_w_' + Math.round(y), 'p_hedge', 728.4, y, { rot: 6 });
    put('hedge_e_' + Math.round(y), 'p_hedge', 846, y, { rot: 6 });
  }
  for (let x = 732; x <= 842; x += 2.4) put('hedge_n_' + Math.round(x), 'p_hedge', x, 126.2);
  for (const [x, y] of [[376, 200], [376, 224], [760, 81.2], [550, 168], [442, 94]]) put('lamp_' + x + '_' + y, 'p_lamp', x, y, { interact: 'lamp' });
  for (const [x, y, rot] of [[390, 200, 0], [408, 220, 4], [548, 180, 0], [576, 170, 2], [800, 96, 0]]) put('bench_' + x + '_' + y, 'community_bench', x, y, { rot });

  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);

  const P = N.expansionP10;
  P.amenities = { unconfirmed: true, buildings: built, park: [356, 192, 430, 234], plaza: [530, 164, 598, 188], school: [726, 82, 850, 128] };
  if (P.interior && P.interior.indexOf('tj_lobby') < 0) P.interior += '+tj_lobby';
  P.reasons.amenity = '配套这一批填在现有走廊里，东界仍是 1160，没有再往东推。月河天街是石材裙楼加冷玻璃的商场外壳，南门切场景进中庭；家禾河东店只是天街南立面的店招，不是第二套室内。月河高级中学是外观：教学楼、体育馆、跑道和校门，没有室内。河东堤岸公园打开月河东岸 x360–430、y192–234 的一角，北侧仍封着。邻里生鲜、银杏里、河东里、河东派出所、河东社康和澄江广场补在塔楼空隙。墙皮仍是浅石材、冷玻璃和既有校园套件，不回榕桥暖砖，不用南埠白幕墙，不新开图集页。不做 438 m 月河新城塔，不加河东公交，不南扩。名字和尺寸未经确认。';
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '河东堤岸公园', rect: [356, 192, 430, 234], kind: 'park', prio: 1 },
    { name: '月河高级中学', rect: [726, 82, 850, 128], kind: 'campus', prio: 1 },
    { name: '月河天街', rect: [490, 90, 544, 120], kind: 'market', prio: 1 },
    { name: '澄江广场', rect: [530, 164, 598, 188], kind: 'park', prio: 1 },
  ]);
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_tj', name: '月河天街', x: 517, y: 86, desc: '商场外壳。南门可进首层中庭，上层未开。名字未经确认', cat: 'shop' },
    { id: 'p10_jh', name: '家禾河东店', x: 505, y: 86, desc: '天街南立面的店招。不是单独的室内。名字未经确认', cat: 'shop' },
    { id: 'p10_fresh', name: '邻里生鲜', x: 442, y: 93, desc: '沿街小铺。只是外观。名字未经确认', cat: 'shop' },
    { id: 'p10_school', name: '月河高级中学', x: 778, y: 79, desc: '教学楼、操场和校门。只是外观。名字未经确认', cat: 'school' },
    { id: 'p10_park', name: '河东堤岸公园', x: 368, y: 210, desc: '月河东岸打开的一角。名字未经确认', cat: 'park' },
    { id: 'p10_soho', name: '银杏里', x: 898, y: 100, desc: '中高层住办。只是外观。名字未经确认', cat: 'home' },
    { id: 'p10_res', name: '河东里', x: 712, y: 163, desc: '大道北侧住宅。只是外观。名字未经确认', cat: 'home' },
    { id: 'p10_police', name: '河东派出所', x: 461, y: 164, desc: '民政外观。名字未经确认', cat: 'life' },
    { id: 'p10_clinic', name: '河东社康', x: 1060, y: 99, desc: '社康外观。名字未经确认', cat: 'life' },
    { id: 'p10_plaza', name: '澄江广场', x: 564, y: 176, desc: '大道北侧硬地广场。名字未经确认', cat: 'park' },
  ]);

  const A = SP && SP.modernResidence;
  if (A && A.opening && SP.scenes && !SP.scenes.tj_lobby) {
    const STREET = [517, 86, 'S'];
    const at = (id, type, x, y, more) => Object.assign({ id, type, x, y, z: 0, state: 'default' }, more);
    const id = 'tj_lobby', w = 18, h = 10;
    const s = {
      format: 'fushi-scene', version: 2, id, name: '月河天街 · 首层中庭', interior: true, units: 'm', grid_m: 0.5,
      bounds: { x0: 0, y0: 0, x1: w, y1: h }, spawn: [9.0, 1.7, 'N'],
      objects: [], colliders: [], portals: [], laundry: [], puddles: [], leaf_piles: [], wires: [], npcs: [], events: {}, interactions: {},
    };
    s.ground = { origin: [0, 0], chunk: 1, cols: w, rows: h, legend: { T: 'g_terrazzo:default' }, data_south_to_north: Array(h).fill('T'.repeat(w)) };
    s.colliders.push(
      { id: id + '_edge_s', rect: [0, -0.3, w, 0.1] },
      { id: id + '_edge_n', rect: [0, h - 0.1, w, h + 0.3] },
      { id: id + '_edge_w', rect: [-0.3, 0, 0.1, h] },
      { id: id + '_edge_e', rect: [w - 0.1, 0, w + 0.3, h] },
    );
    for (let x = 0; x < w; x++) {
      s.objects.push(at(id + '_n_' + x, 'modern_intwall', x, h - 0.02, { state: 'plain' }));
      s.objects.push(at(id + '_s_' + x, 'modern_intwall', x, 0, { state: 'cut' }));
    }
    for (let y = 0; y < h; y++) {
      s.objects.push(at(id + '_w_' + y, 'modern_intwall', 0, y + 1, { rot: 6, state: 'cut' }));
      s.objects.push(at(id + '_e_' + y, 'modern_intwall', w - 0.02, y + 1, { rot: 6, state: 'plain' }));
    }
    A.opening(s, 'south', 8.0, 10.2);
    s.objects.push(at(id + '_exit', 'modern_intdoor', 8.2, 0.02, { state: 'closed', interact: 'portal', to: 'street', spawn: STREET, reach: [9.0, 1.25], label: '出门 · 回到澜石南街（月河天街）', name: '出门' }));
    s.portals.push({ id: id + '_walk', rect: [7.9, 0.15, 10.3, 0.7], dir: 'S', to: 'street', spawn: STREET, label: '出门 · 回到澜石南街（月河天街）' });
    s.objects.push(at(id + '_desk', 's_counter', 3.6, 6.2, { rot: 4, interact: 'notice', reach: [4.8, 6.2], name: '服务台', note: '月河天街服务台。家禾河东店在南立面，这一批不另开室内。上层未开。菜市场仍是唯一的无缝室内。' }));
    s.objects.push(at(id + '_sofa', 'modern_sofa', 12.4, 3.4, { name: '中庭沙发' }));
    s.objects.push(at(id + '_sofa2', 'modern_sofa', 14.8, 6.6, { name: '中庭沙发' }));
    s.objects.push(at(id + '_chair', 'f_chair', 6.2, 3.2));
    s.objects.push(at(id + '_pot', 'p_planter', 1.6, 2.8));
    s.objects.push(at(id + '_pot2', 'p_planter', 16.2, 2.6));
    s.objects.push(at(id + '_pot3', 'p_planter', 16.2, 8.2));
    s.objects.push(at(id + '_dir', 'i_notice', 5.4, 8.4, { z: 1.15, interact: 'notice', reach: [5.4, 7.4], name: '楼层指南', note: '月河天街 · 1F 中庭。家禾河东店在室外南立面。2F 及以上未开。' }));
    s.objects.push(at(id + '_lamp', 'i_pendant', 9.2, 4.2, { state: 'on' }));
    s.objects.push(at(id + '_lamp2', 'i_pendant', 9.2, 7.4, { state: 'on' }));
    SP.scenes[id] = s;
    if (SP.rongqiaoP10Interior) SP.rongqiaoP10Interior.tj = id;
  }
})();
