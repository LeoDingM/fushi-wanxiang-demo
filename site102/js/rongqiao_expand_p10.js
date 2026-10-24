/* 月河区 · 河东新城 P10 第一片 (2026-10-24). Leo 开工令：榕桥主块齐了之后，按备忘做旁边区。
 * 外立面可走。室内、公交、东边下一片都不在这一批。
 * 数字全部未经Leo确认，理由写在 expansionP10.reasons：
 *   可玩东界 480，地面到 500。不一次铺到 840。桥东只放得下一个约 110 m 的街块。
 *   河东大道 26 m（y 132–158），澜石路和南街 16 m。大道只铺路面，不接实时车道。
 *   三栋：月河中心 26F、河东广场 24F、澜石大厦 28F。裙楼 3 层浅石材，塔楼冷玻璃，顶层石材收边。平屋面 r_mod。
 *   行道树只用银杏，过了河东大桥才开始，12 m 一棵。木棉和柳留在榕桥水边。
 *   月河在 x 336–356 折向南，河东大桥接榕校路东口。桥西仍是榕桥的柳和公园。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH;
  if (!D || !N || !D.rongqiaoExpandB3 || D.rongqiaoExpandP10) return;
  D.rongqiaoExpandP10 = 1;
  const G = D.ground, root = window, BX1 = 480, GX1 = 500;
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
  for (const c of D.colliders || []) if (c.id === 'rqe4_edge_e') c.rect = [299.8, 158, 300.4, 184];
  for (const ch of Object.values(root.SCENE_CHUNKS || {})) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => {
      if (o.type === 'p_hedge' && o.x > 298 && o.x < 299.5 && o.y >= 128 && o.y < 162) return false;
      if (o.type === 'rq_x_tree' && o.variant === 'rong' && o.x > 300 && o.x < 348 && o.y > 120 && o.y < 176) return false;
      return true;
    });
  }
  const WATER = [[319.2, 192, 356, 238], [336, 96, 356, 132], [336, 158, 356, 192]];
  for (const r of WATER) paint(r, null, (x, y) => (y < 194 || x < 338 ? 'V' : (Math.round(x + y) % 7 === 0 ? 'U' : 'W')));
  paint([356, 64, 468, 192], 'S');
  paint([320, 158, 336, 192], 'S');
  paint([300.05, 184, 336, 192], 'S');
  paint([320, 238, 356, 248], 'S');
  paint([368, 64, 468, 67.5], 'S');
  paint([368, 67.5, 468, 76.5], null, road);
  paint([368, 76.5, 468, 80], 'S');
  paint([408, 64, 411.5, 184], 'S');
  paint([411.5, 64, 420.5, 184], null, road);
  paint([420.5, 64, 424, 184], 'S');
  paint([300.05, 132, 468, 136.5], 'S');
  paint([300.05, 136.5, 468, 143.5], null, road);
  paint([300.05, 143.5, 468, 146.5], 'G');
  paint([300.05, 146.5, 468, 153.5], null, road);
  paint([300.05, 153.5, 468, 158], 'S');
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqe_p10_south', [300.2, -104, 520, 64]);
  block('rqe_p10_sw', [300.2, 64, 356, 132]);
  block('rqe_p10_park', [300.2, 158, 320, 184]);
  block('rqe_p10_east', [468, 64, 520, 192]);
  block('rqe_p10_riverland', [356, 192, 520, 238]);
  block('rqe_p10_north', [300.2, 248, 520, 460]);
  block('rqe_p10_north_e', [356, 238, 520, 248]);
  WATER.forEach((r, i) => block('rqe_p10_river_' + i, r));
  const list = [];
  const put = (id, type, x, y, more) => list.push(Object.assign({ id: 'rqp10_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  for (let x = 321; x < 354; x += 3) put('rail_n_' + x, 'rq_x_rail_s', x, 238.35);
  for (let x = 321; x < 334; x += 3) { put('rail_s_' + x, 'rq_x_rail_s', x, 191.7); put('emb_' + x, 'rq_x_embank_s', x, 238); }
  for (const [tag, x] of [['w', 335.75], ['e', 356.25]]) {
    for (let y = 96; y < 129; y += 3) put('rail_' + tag + '_' + y, 'rq_x_rail_w', x, y);
    for (let y = 158; y < 189; y += 3) put('rail_' + tag + 'b_' + y, 'rq_x_rail_w', x, y);
  }
  for (let x = 324; x < 366; x += 3) { put('br_s_' + x, 'rq_x_rail_s', x, 131.35); put('br_n_' + x, 'rq_x_rail_s', x, 158.25); }
  put('reed_a', 'rq_x_reed', 346, 110, { variant: 'reed' });
  put('reed_b', 'rq_x_reed', 350, 172, { variant: 'reed' });
  function ginkgo(x, y) { put('gk_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'ginkgo' }); }
  for (let x = 360; x <= 456; x += 12) { ginkgo(x, 134.2); ginkgo(x, 155.6); }
  for (let x = 372; x <= 456; x += 12) {
    if (x > 411.5 && x < 420.5) continue;
    ginkgo(x, 65.6); ginkgo(x, 78.2);
  }
  for (const y of [104, 116, 168, 180]) ginkgo(364, y);
  for (const x of [366, 390, 414, 438, 462]) { put('lamp_s_' + x, 'p_lamp', x, 133.2, { interact: 'lamp' }); put('lamp_n_' + x, 'p_lamp', x, 156.4, { interact: 'lamp' }); }
  for (const y of [72, 100, 124, 170]) put('lamp_ls_' + y, 'p_lamp', 409.2, y, { interact: 'lamp' });
  const TOWERS = [
    { id: 'yh', name: '月河中心', x: 376, y: 162, F: 26, side: 'W' },
    { id: 'hd', name: '河东广场', x: 424, y: 162, F: 24, side: 'E' },
    { id: 'ls', name: '澜石大厦', x: 376, y: 84, F: 28, side: 'W' },
  ];
  const built = [];
  for (const spec of TOWERS) {
    const fg = 'rqe_p10_' + spec.id, x = spec.x, y = spec.y, F = spec.F;
    const towerX = spec.side === 'E' ? x + 15 : x, wingX = spec.side === 'E' ? x : x + 15;
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      const nS = f <= 3 ? 10 : 5, xS = f <= 3 ? x : towerX;
      for (let b = 0; b < nS; b++) {
        const lobby = f === 1 && b >= 3 && b <= 6;
        const variant = lobby ? 'hd_glass' : (f <= 3 || f === F ? 'hd_stone' : 'hd_glass');
        put(spec.id + '_S' + f + '_' + b, 'f_wall', xS + b * 3, y, { z, state: st, fade_group: fg, variant });
      }
      const xW = f <= 3 ? x : towerX;
      for (let b = 0; b < 4; b++) {
        const variant = (f <= 3 || f === F) ? 'hd_stone' : 'hd_glass';
        put(spec.id + '_W' + f + '_' + b, 'f_wall', xW, y + 3 + b * 3, { z, rot: 6, state: st, fade_group: fg, variant });
      }
    }
    put(spec.id + '_roof', 'b_roof_a', towerX, y, { z: F * 3, fade_group: fg, variant: 'r_mod' });
    put(spec.id + '_wing', 'b_roof_a', wingX, y, { z: 9, fade_group: fg, variant: 'r_mod' });
    put(spec.id + '_logo', 'rq_hd_name', towerX + 4.6, y - 0.02, { z: F * 3 - 1.7, variant: spec.id, fade_group: fg });
    put(spec.id + '_plate', 'rq_hd_plate', x + 12.6, y - 0.02, { z: 2.15, variant: spec.id, fade_group: fg });
    block(fg, [x, y, x + 30, y + 12]);
    built.push({ id: fg, name: spec.name, x0: x, y0: y, W: 30, D: 12, F, floors: F });
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  for (const r of WATER) if (N.water) N.water.push(r.slice());
  const CHID = 'rqe_p10_hd';
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS[CHID] = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: CHID, name: '河东新城', rect: [300, 8, 500, 260], src: 'js/rongqiao_expand_p10.js', load_m: 40, unload_m: 80 });
  N.expansionP10 = {
    phase: 'P10', unconfirmed: true, slice: 1,
    names: {
      district: '月河区 · 河东新城', avenue: '河东大道', secondary: '澜石路', south: '澜石南街',
      bridge: '河东大桥', promenade: '河东滨河步道',
    },
    avenue: [300.05, 132, 468, 158],
    secondary: [408, 64, 424, 184],
    south: [368, 64, 468, 80],
    promenade: [356, 96, 372, 192],
    district: [356, 64, 468, 192],
    bridge: [336, 132, 356, 158],
    channel: WATER.map((r) => r.slice()),
    buildings: built,
    tree: 'ginkgo',
    bus: { live: false, reason: '这一片没有实时车道，也不往井槐里线或南关路线上加站。' },
    interior: false,
    reasons: {
      x1: '第一片停在 x 480。桥东大约 110 m，只够一个街块。90 m 街块再排一段会一次铺过 560，不在这一刀里。',
      roads: '主干按建议取 26 m，次干和南街 16 m。大道从榕校路东口展开，南半幅让开中学东围墙。',
      lane: '河东大道只铺路面。南关路实时车道若拉到 x 480，车会从新城南侧空地穿过去。',
      walls: '第三套墙皮是浅石材裙楼加冷玻璃塔楼。不用榕桥暖砖，也不用月湾红瓦坡顶。',
      tree: '行道树用银杏，过桥后 12 m 一棵。月湾路已经在轮换樟，银杏的扇冠能把河东分开。木棉和柳留在榕桥。',
      signs: '楼身大字和门厅铭牌。没有早市雨棚，也没有一家一牌。',
      water: '月河在 x 336 折向南。东岸是硬质步道，只留两丛芦苇。河东大桥是平板桥面加栏杆。',
    },
  };
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_avenue', name: '河东大道', x: 390, y: 134.2, desc: '26 m 大道，石材玻璃塔楼。名字和路宽未经确认', cat: 'life' },
    { id: 'p10_yh', name: '月河中心', x: 391, y: 159.2, desc: '26 层，裙楼石材、塔楼冷玻璃。只是外观', cat: 'work' },
    { id: 'p10_hd', name: '河东广场', x: 439, y: 159.2, desc: '24 层，澜石路东侧。只是外观', cat: 'work' },
    { id: 'p10_ls', name: '澜石大厦', x: 391, y: 78.2, desc: '28 层，南街北侧。只是外观', cat: 'work' },
    { id: 'p10_bank', name: '河东滨河步道', x: 364, y: 110, desc: '月河折弯东岸的硬质步道。名字未经确认', cat: 'life' },
  ]);
})();
