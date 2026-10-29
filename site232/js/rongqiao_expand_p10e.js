/* 月河区 · 河东新城生活街 (2026-10-26). 接在配套之后。
 * 可玩东界从 1160 收到 1300（+140 m），地面到 1320。拆掉第六片 x 1157.6 绿篱和东侧封边。
 * 河东大道 / 澜石南街穿过旧东缘绿地，接到新东界。望月路仍是 x1024–1040 的南北次干，两边路口不断。
 * 河东堤岸公园沿月河北侧干地从 x430 收到 x1300（y192–234）。水面仍停在折弯 x356，不新开河。y234 以上仍封着。
 * 围挡外是生活街，不是再一排办公塔：中高层住宅、SOHO、沿街小铺、硬地广场、银杏。
 * 墙皮仍是浅石材和已有冷玻璃。不回榕桥暖砖，不用南埠白幕墙，不新开图集页。
 * 不做 438 m 塔，不加河东公交，不南扩。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10d || D.rongqiaoExpandP10e || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10e = 1;
  const G = D.ground, CH = root.SCENE_CHUNKS || {}, BX1 = 1300, GX1 = 1320;
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
  for (const id of ['rqe_p10_south', 'rqe_p10_north', 'rqe_p10_north_e', 'rqe_p10b_south']) {
    retarget(id, (r) => { r[2] = Math.max(r[2], 1360); });
  }
  /* 月河水面只到折弯 x356。北侧干地 y192–234 可以打开，y234 以上继续封着。 */
  retarget('rqe_p10_riverland', (r) => { r[0] = 1300; r[2] = Math.max(r[2], 1360); });
  retarget('rqe_p10b_north', (r) => { r[1] = 234; r[2] = Math.max(r[2], 1360); });
  retarget('rqe_p10_park_lip', (r) => { r[2] = 1300; });
  for (const ch of Object.values(CH)) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => !/^rqp10c_edge_h_/.test(o.id));
  }

  const OLD = 1144, ROAD = 1284, SEAL = 1300;
  paint([OLD, 64, ROAD, 192], 'S');
  paint([OLD, 64, SEAL, 67.5], 'S');
  paint([OLD, 67.5, SEAL, 76.5], null, road);
  paint([OLD, 76.5, SEAL, 80], 'S');
  paint([OLD, 132, SEAL, 136.5], 'S');
  paint([OLD, 136.5, SEAL, 143.5], null, road);
  paint([OLD, 143.5, SEAL, 146.5], 'G');
  paint([OLD, 146.5, SEAL, 153.5], null, road);
  paint([OLD, 153.5, SEAL, 158], 'S');
  paint([1172, 100, 1272, 128], 'S');
  paint([1176, 108, 1204, 124], 'G');
  paint([1244, 108, 1268, 124], 'G');
  /* 生活巷：南街北侧人行道接到大道南侧人行道，不另开一条 16 m 次干。 */
  paint([1212, 80, 1220, 132], 'S');
  paint([ROAD, 80, SEAL, 132], 'G');
  paint([ROAD, 158, SEAL, 192], 'G');
  paint([SEAL, 64, GX1, 192], 'K');
  paint([430, 192, SEAL, 234], 'G');
  paint([424, 206, 1292, 214], 'S');
  for (const x of [480, 640, 800, 960, 1120, 1248]) paint([x, 192, x + 8, 214], 'S');

  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqe_p10_east', [SEAL, 64, 1360, 234]);

  const list = [];
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10e_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    if (o.x >= 1140) list.push(o);
    else {
      const key = o.x >= 960 ? 'rqe_p10_e5' : o.x >= 820 ? 'rqe_p10_e4' : o.x >= 620 ? 'rqe_p10_e3' : o.x >= 460 ? 'rqe_p10_e2' : 'rqe_p10_hd';
      const ch = CH[key];
      if (ch && ch.objects) ch.objects.push(o);
    }
    return o;
  }
  function pick(spec, f, side, b) {
    const sign = (spec.signs || []).find((s) => s.face === side && s.floor === f && s.bay === b);
    if (sign) return { variant: 'hd_g_sign', hdGlass: 1, sign: sign.text, forceGround: 1 };
    if (f <= (spec.podium || 1)) return { variant: 'hd_stone' };
    return { variant: spec.glass || 'hd_g_hd', hdGlass: 1 };
  }
  const built = [];
  function build(spec) {
    const F = spec.F, nS = spec.nS, nW = spec.nW, x = spec.x, y = spec.y;
    const fg = 'rqe_p10f_' + spec.id;
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
    built.push({ id: fg, name: spec.name, x0: x, y0: y, W: Wd, D: Dp, F, kind: spec.kind || 'life' });
  }

  build({
    id: 'cy', name: '澄月里', x: 1168, y: 166, nS: 8, nW: 4, F: 12, podium: 2, glass: 'hd_g_yl2', kind: 'home',
    signs: [{ face: 'S', floor: 1, bay: 3, text: '澄月里' }],
  });
  build({
    id: 'yq', name: '月栖', x: 1210, y: 164, nS: 5, nW: 5, F: 8, podium: 2, glass: 'hd_g_wm', kind: 'soho',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '月栖' }],
  });
  build({
    id: 'da', name: '东岸居', x: 1248, y: 168, nS: 9, nW: 3, F: 14, podium: 2, glass: 'hd_g_dl', kind: 'home',
    signs: [{ face: 'S', floor: 1, bay: 4, text: '东岸居' }],
  });
  build({
    id: 'xs', name: '杏南小铺', x: 1168, y: 84, nS: 6, nW: 3, F: 2, podium: 1, glass: 'hd_g_hd', kind: 'shop',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '杏南小铺' }],
  });
  build({
    id: 'cs', name: '河东茶舍', x: 1196, y: 84, nS: 4, nW: 3, F: 2, podium: 1, glass: 'hd_g_yl', kind: 'shop',
    signs: [{ face: 'S', floor: 1, bay: 1, text: '河东茶舍' }],
  });
  build({
    id: 'bk', name: '望月书店', x: 1228, y: 84, nS: 5, nW: 3, F: 3, podium: 1, glass: 'hd_g_yx', kind: 'shop',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '望月书店' }],
  });
  build({
    id: 'cd', name: '堤岸菜店', x: 1256, y: 84, nS: 5, nW: 3, F: 2, podium: 1, glass: 'hd_g_yh', kind: 'shop',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '堤岸菜店' }],
  });
  build({
    id: 'pk1', name: '堤岸亭', x: 520, y: 220, nS: 2, nW: 1, F: 1, podium: 1, kind: 'park',
    signs: [{ face: 'S', floor: 1, bay: 0, text: '堤岸亭' }],
  });
  build({
    id: 'pk2', name: '河东堤岸公园', x: 760, y: 220, nS: 2, nW: 2, F: 1, podium: 1, kind: 'park',
    signs: [{ face: 'S', floor: 1, bay: 0, text: '河东堤岸公园' }],
  });
  build({
    id: 'pk3', name: '堤岸亭', x: 1000, y: 220, nS: 2, nW: 1, F: 1, podium: 1, kind: 'park',
    signs: [{ face: 'S', floor: 1, bay: 0, text: '堤岸亭' }],
  });
  build({
    id: 'pk4', name: '月河堤岸', x: 1240, y: 220, nS: 3, nW: 1, F: 1, podium: 1, kind: 'park',
    signs: [{ face: 'S', floor: 1, bay: 1, text: '月河堤岸' }],
  });

  function ginkgo(x, y) { put('gk_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'ginkgo', fade_group: 'rqe_p10f_tree' }); }
  for (let x = 1152; x <= 1272; x += 12) { ginkgo(x, 134.2); ginkgo(x, 155.6); ginkgo(x, 65.6); ginkgo(x, 78.2); }
  for (const [x, y] of [[1184, 116], [1200, 108], [1236, 116], [1260, 112], [1188, 124], [1244, 120], [1200, 184], [1236, 184], [1188, 96]]) ginkgo(x, y);
  const shelters = [520, 760, 1000, 1240];
  for (let x = 448; x <= 1288; x += 20) {
    if (shelters.some((s) => Math.abs(x - s) < 10)) continue;
    ginkgo(x, 228);
  }
  for (let x = 456; x <= 1272; x += 24) ginkgo(x, 198);
  for (let y = 66; y <= 190; y += 2) put('edge_h_' + y, 'p_hedge', 1297.6, y, { rot: 6 });
  for (let y = 196; y <= 230; y += 3) put('park_e_' + y, 'p_hedge', 1296.4, y, { rot: 6 });
  for (let x = 440; x <= 1288; x += 4) put('park_n_' + x, 'p_hedge', x, 232.4);
  for (const x of [1164, 1188, 1236, 1260]) {
    put('lamp_s_' + x, 'p_lamp', x, 133.2, { interact: 'lamp' });
    put('lamp_n_' + x, 'p_lamp', x, 156.4, { interact: 'lamp' });
    put('lamp_ss_' + x, 'p_lamp', x, 78.2, { interact: 'lamp' });
  }
  for (const [x, y] of [[1184, 104], [1260, 104], [1236, 120], [480, 204], [720, 204], [960, 204], [1200, 204]]) put('lamp_' + x + '_' + y, 'p_lamp', x, y, { interact: 'lamp' });
  for (const [x, y, rot] of [[1192, 112, 0], [1252, 112, 0], [1224, 124, 2], [456, 204, 0], [624, 204, 0], [792, 204, 0], [984, 204, 0], [1176, 204, 0]]) put('bench_' + x + '_' + y, 'community_bench', x, y, { rot });

  const feet = built.map((b) => [b.x0, b.y0, b.x0 + b.W, b.y0 + b.D]);
  const keepProp = (o) => !feet.some((f) => root.hedongHitsTower(o, f));
  const kept = list.filter(keepProp);
  list.length = 0;
  for (const o of kept) list.push(o);
  for (const ch of Object.values(CH)) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => !/^rqp10e_/.test(o.id) || keepProp(o));
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p10_e6 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p10_e6', name: '河东生活街', rect: [1100, 8, 1360, 280], src: 'js/rongqiao_expand_p10e.js', load_m: 40, unload_m: 80 });

  const P = N.expansionP10;
  P.slice = 7;
  P.avenue = [300.05, 132, ROAD, 158];
  P.south = [368, 64, ROAD, 80];
  P.district = [356, 64, SEAL, 192];
  P.terminus = [ROAD, 64, SEAL, 192];
  if (P.amenities) P.amenities.park = [356, 192, SEAL, 234];
  P.life = {
    unconfirmed: true,
    east: [1160, SEAL],
    park: [356, 192, SEAL, 234],
    plaza: [1172, 100, 1272, 128],
    lane: [1212, 80, 1220, 132],
    buildings: built,
  };
  if (P.reasons && P.reasons.amenity) {
    P.reasons.amenity = P.reasons.amenity
      .replace('填在现有走廊里，东界仍是 1160，没有再往东推。', '填在当时的走廊里，东界当时是 1160。')
      .replace('河东堤岸公园打开月河东岸 x360–430、y192–234 的一角，北侧仍封着。', '河东堤岸公园先打开月河东岸 x360–430、y192–234 的一角，北侧仍封着。');
  }
  P.reasons.x1 = '第七片：可玩东界从 1160 收到 1300（+140 m），地面到 1320。拆掉第六片 1157 m 绿篱。大道和南街铺到 1284，再往东是银杏绿地，1297 m 一带一道绿篱围挡。第六片写过的 1180 地面已经往东铺过。';
  P.reasons.life = '生活街在 x1160 围挡外再推 140 m。河东大道和澜石南街铺到 1284，望月路仍是 x1024–1040，路口不断，中间加一条 8 m 生活巷，不另开 16 m 次干。澄月里 12 层住宅（米黄石材开窗）、月栖 8 层 SOHO（冷青绿玻璃）、东岸居 14 层住宅（装饰艺术石材开窗），沿南街是杏南小铺、河东茶舍、望月书店、堤岸菜店。望月生活广场是硬地加两块草坪。都只是外壳。河东堤岸公园沿月河北侧干地从 x430 收到 x1300、y192–234；月河水面仍停在折弯 x356，不新开河，y234 以上仍封着。墙皮是浅石材和已有冷玻璃，不回榕桥暖砖，不用南埠白幕墙，不新开图集页。不做 438 m 月河新城塔，不加河东公交，不南扩。名字和尺寸未经确认。';

  for (const lab of N.mapLabels || []) if (lab.name === '河东堤岸公园') lab.rect = [356, 192, SEAL, 234];
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '望月生活广场', rect: [1172, 100, 1272, 128], kind: 'park', prio: 1 },
  ]);
  for (const p of N.mapPois || []) {
    if (p.id === 'p10_edge') { p.x = 1290; p.y = 145; p.desc = '大道尽头的银杏绿地和围挡。名字未经确认'; }
    if (p.id === 'p10_park') p.desc = '月河北侧干地，从 x360 收到 x1300。水面仍在折弯。名字未经确认';
  }
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_life_cy', name: '澄月里', x: 1180, y: 163, desc: '12 层住宅。只是外观。名字和层数未经确认', cat: 'home' },
    { id: 'p10_life_yq', name: '月栖', x: 1218, y: 161, desc: '8 层 SOHO。只是外观。名字和层数未经确认', cat: 'home' },
    { id: 'p10_life_da', name: '东岸居', x: 1260, y: 165, desc: '14 层住宅。只是外观。名字和层数未经确认', cat: 'home' },
    { id: 'p10_life_xs', name: '杏南小铺', x: 1176, y: 81, desc: '沿街小铺。只是外观。名字未经确认', cat: 'shop' },
    { id: 'p10_life_cs', name: '河东茶舍', x: 1202, y: 81, desc: '沿街小铺。只是外观。名字未经确认', cat: 'shop' },
    { id: 'p10_life_bk', name: '望月书店', x: 1236, y: 81, desc: '沿街小铺。只是外观。名字未经确认', cat: 'shop' },
    { id: 'p10_life_cd', name: '堤岸菜店', x: 1264, y: 81, desc: '沿街小铺。只是外观。名字未经确认', cat: 'shop' },
    { id: 'p10_life_pl', name: '望月生活广场', x: 1224, y: 112, desc: '生活街硬地广场。名字未经确认', cat: 'park' },
  ]);
})();
