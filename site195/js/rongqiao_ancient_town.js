/* Site194 · 鹰山宋城（影视城古镇）——更小更满更华丽；立面 aq_f_* + Track B atlas + Track C 道具模块。
 * 接在河东东界（x1750 / 地面 1770）以东、澜海对岸：世界原点 OX=1920 OY=-160 = 规划局部 (0,0) 城墙西南内角。
 * Track A：内城 footprint 收缩（约 300×210），少空地；御街/东西市/汴河加密；补勾栏+宝相寺；店铺立面 aq_f_* kitbash。
 * Track B/C 已合入 site88：ancient_art atlas 管线 + 氛围道具贴图模块（woodPlanks/stoneCoursing/awningStripe/crateMod）。
 * 入口：区级总览「鹰山宋城」传送南广场。不做 438 m 塔；不南扩南埠；不进学校/渔村老街/柳口居；不改 Site146 石驳岸。
 * 全部名称与尺寸未经 Leo 确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || D.rongqiaoAncientTown || !root.RongqiaoArt) return;
  if (!root.RongqiaoArt.DEFS || !root.RongqiaoArt.DEFS.get('aq_wall_gate')) return;
  D.rongqiaoAncientTown = 1;

  const OX = 1920, OY = -160;           // 规划局部原点 → 世界
  const W = (lx, ly) => [OX + lx, OY + ly];
  /* 收缩后的城：本地约 0..300 × -8..200；外缘缓冲略收 */
  const CW = 300, CN = 200;
  const CX = 150;                       // 御街中线 / 门洞中心
  const BX0 = OX - 40, BX1 = OX + CW + 40, BY0 = OY - 160, BY1 = OY + CN + 40;
  const GX1 = OX + CW + 60, GY0 = OY - 180;
  const G = D.ground, CH = root.SCENE_CHUNKS || {};
  /* Site194：宋城专用水面图例（D/E/I → aq_gwater），不改月河 rq_gwater 的 U/V/W */
  G.legend = Object.assign({}, G.legend, {
    D: 'aq_gwater:a',
    E: 'aq_gwater:b',
    I: 'aq_gwater:c',
  });

  const addE = Math.max(0, Math.round((GX1 - (G.origin[0] + G.cols * G.chunk)) / G.chunk));
  if (addE) {
    G.data_south_to_north = G.data_south_to_north.map((row) => row + 'K'.repeat(addE));
    G.cols += addE;
  }
  const addR = Math.max(0, Math.round((G.origin[1] - GY0) / G.chunk));
  if (addR) {
    const rows = [];
    for (let r = 0; r < addR; r++) rows.push('K'.repeat(G.cols));
    G.data_south_to_north = rows.concat(G.data_south_to_north);
    G.rows = G.data_south_to_north.length;
    G.origin = [G.origin[0], G.origin[1] - addR * G.chunk];
  }
  D.bounds = Object.assign({}, D.bounds, {
    x1: Math.max(D.bounds.x1 || 0, Math.max(BX1, 2440)),
    y0: Math.min(D.bounds.y0 || 0, BY0),
    y1: Math.max(D.bounds.y1 || 0, BY1),
  });

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
  const road = (x, y) => ((Math.round(x * 2 + y) % 5) < 3 ? 'A' : 'B');
  /* Site194 写实水面：按距岸深浅选 D浅 / E中 / I深；近岸噪声咬出不规则岸线（不改建筑 footprint） */
  const hash01 = (x, y) => {
    const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return s - Math.floor(s);
  };
  const seaDepth = (x, y, rect) => {
    const dx = Math.min(x - rect[0], rect[2] - x);
    const dy = Math.min(y - rect[1], rect[3] - y);
    const edge = Math.min(dx, dy);
    const n = hash01(x * 0.5, y * 0.5);
    const d = edge + (n - 0.5) * 1.8;           // 岸线抖动
    const span = Math.min(rect[2] - rect[0], rect[3] - rect[1]);
    const shallow = Math.min(2.6, span * 0.22);
    const mid = Math.min(6.5, span * 0.42);
    if (d < shallow) return 'D';
    if (d < mid) return 'E';
    /* 微扰：偶发中层纹理，避免整片纯平 */
    return (Math.round(x + y) % 11 === 0 ? 'E' : 'I');
  };
  const paintSea = (rect, opts) => {
    const pad = (opts && opts.pad) || 0;
    const r = [rect[0] - pad, rect[1] - pad, rect[2] + pad, rect[3] + pad];
    paint(r, null, (x, y) => {
      const dx = Math.min(x - rect[0], rect[2] - x);
      const dy = Math.min(y - rect[1], rect[3] - y);
      const inside = x >= rect[0] && x < rect[2] && y >= rect[1] && y < rect[3];
      const edge = Math.min(dx, dy);
      const n = hash01(x, y);
      if (!inside) {
        /* 外扩浅滩：噪声决定是否铺浅水，形成碎石/泥岸凹凸 */
        if (n > 0.55) return 'D';
        return null;
      }
      /* 内侧近岸：偶尔留空，让草地/石板咬进水面（不规则岸） */
      if (edge < 1.15 && n < 0.28) return null;
      return seaDepth(x, y, rect);
    });
  };

  /* 湾区缓冲仍是水面；内城几乎满铺石板；水体 paintSea→D/E/I 分层（不改 rq_gwater） */
  paintSea([1770, BY0, OX - 16, BY1], { pad: 1.5 });
  paint([OX - 16, BY0, GX1, BY1], 'G');
  paint([OX, OY - 120, OX + CW, OY + CN], 'S');                 // 内城硬地（几乎不留草地）
  paint([OX + 80, OY - 120, OX + 220, OY - 72], 'S');           // 南广场
  paint([OX + CX - 14, OY - 8, OX + CX + 14, OY + 100], null, road);
  paint([OX + CX - 14, OY - 8, OX + CX + 14, OY + 100], 'S');   // 御街
  paint([OX + 16, OY + 28, OX + CW - 16, OY + 40], 'S');        // 东西市南巷
  paint([OX + 16, OY + 44, OX + CW - 16, OY + 54], 'S');        // 中市横巷
  paint([OX + 16, OY + 58, OX + CW - 16, OY + 70], 'S');        // 东西市北巷
  paint([OX + 16, OY + 116, OX + CW - 16, OY + 128], 'S');      // 汴河北岸河市
  paint([OX + 40, OY + 130, OX + 260, OY + 190], 'S');          // 北部硬地（衙门/寺/宅）
  paintSea([OX - 16, OY - 62, OX + CW + 16, OY - 46], { pad: 1.2 });  // 南护城河
  paintSea([OX - 16, OY + CN, OX + CW + 16, OY + CN + 16], { pad: 1.2 });
  paintSea([OX - 16, OY - 46, OX, OY + CN], { pad: 1.2 });
  paintSea([OX + CW, OY - 46, OX + CW + 16, OY + CN], { pad: 1.2 });
  paintSea([OX, OY + 96, OX + CW, OY + 114], { pad: 1.4 });           // 汴河（收窄）
  paint([OX + CX - 16, OY + 94, OX + CX + 16, OY + 116], 'S');  // 州桥落点
  paint([OX + 90, OY - 102, OX + 120, OY - 88], 'S');           // 售票处前

  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id: 'aq_' + id, rect: rect.slice() }); };
  block('bay', [1770, BY0, OX - 16, BY1]);
  block('moat_s', [OX - 16, OY - 62, OX + CW + 16, OY - 46]);
  block('moat_n', [OX - 16, OY + CN, OX + CW + 16, OY + CN + 16]);
  block('moat_w', [OX - 16, OY - 46, OX, OY + CN]);
  block('moat_e', [OX + CW, OY - 46, OX + CW + 16, OY + CN]);
  block('bian_w', [OX, OY + 96, OX + CX - 16, OY + 114]);
  block('bian_e', [OX + CX + 16, OY + 96, OX + CW, OY + 114]);
  /* 南墙门洞：aq_wall_gate 开口 13–17 @ putX → 中心 putX+15 = CX */
  const gatePut = CX - 15;
  block('wall_s_w', [OX, OY - 8, OX + gatePut + 13, OY]);
  block('wall_s_e', [OX + gatePut + 17, OY - 8, OX + CW, OY]);
  block('wall_n', [OX, OY + CN - 8, OX + CW, OY + CN]);
  block('wall_w', [OX, OY, OX + 8, OY + CN - 8]);
  block('wall_e', [OX + CW - 8, OY, OX + CW, OY + CN - 8]);

  N.solids = (N.solids || []).concat(solids);
  D.colliders = (D.colliders || []).concat(colliders);
  N.water = (N.water || []).concat([
    [1770, BY0, OX - 16, BY1],
    [OX - 16, OY - 62, OX + CW + 16, OY - 46],
    [OX - 16, OY + CN, OX + CW + 16, OY + CN + 16],
    [OX - 16, OY - 46, OX, OY + CN],
    [OX + CW, OY - 46, OX + CW + 16, OY + CN],
    [OX, OY + 96, OX + CW, OY + 114],
  ]);

  const list = [];
  function put(id, type, lx, ly, more) {
    const o = Object.assign({
      id: 'aq_' + id,
      type,
      x: +(OX + lx).toFixed(2),
      y: +(OY + ly).toFixed(2),
      fade_group: 'aq_songcheng',
    }, more || {});
    list.push(o);
    return o;
  }

  const SHOP_KINDS = ['dangpu', 'yaopu', 'buzhuang', 'gaobing', 'zahuo'];
  const BW = (root.AncientFacade && root.AncientFacade.BW) || 3.5;
  /* 井槐里式拼装：壳(aq_shop) + 立面模块(aq_f_*) + 匾幌灯。密度与贴图细节一起上。 */
  function putShop(id, kind, lx, ly) {
    const k = kind;
    const bay = Math.abs(Math.floor(lx * 10 + ly)) % 4;
    put(id, 'aq_shop_' + k, lx, ly);                         // depth shell + roof
    put(id + '_gable', 'aq_f_gable', lx - 0.05, ly);          // 硬山墀头
    if (k === 'dangpu') {
      put(id + '_w0', 'aq_f_wall', lx + 0.4, ly, { variant: 'dang' });
      put(id + '_d1', 'aq_f_door', lx + 0.4 + BW, ly, { variant: 'grid' });
    } else {
      put(id + '_s0', 'aq_f_shop', lx + 0.4, ly, { variant: k });
      const winV = (['grid', 'bubujin', 'diamond', 'blind'])[bay];
      /* second bay: alternate open shop / lattice window for rhythm */
      if (bay % 2 === 0) put(id + '_s1', 'aq_f_shop', lx + 0.4 + BW, ly, { variant: k });
      else put(id + '_w1', 'aq_f_window', lx + 0.4 + BW, ly, { variant: winV });
    }
    put(id + '_awn0', 'aq_f_awning', lx + 0.4, ly);
    put(id + '_awn1', 'aq_f_awning', lx + 0.4 + BW, ly);
    put(id + '_plq', 'aq_f_plaque', lx + 3.5, ly, { variant: k });
    put(id + '_ban', 'aq_f_banner', lx + 6.8, ly, { variant: k });
    put(id + '_col', 'aq_f_column', lx + 3.5, ly);
    put(id + '_lan', 'aq_lanterns', lx + 1.0, ly - 0.4);
  }
  function shopRow(prefix, x0, y, n, step) {
    for (let i = 0; i < n; i++) {
      const k = SHOP_KINDS[i % SHOP_KINDS.length];
      putShop(prefix + i, k, x0 + i * (step || 7.2), y);
    }
  }

  /* —— 南广场：售票 + 闸机 + 石狮灯笼树（加密） —— */
  put('ticket', 'aq_ticket', 92, -102, { name: '售票处（名称未经确认）' });
  put('gate_a', 'aq_turnstile', 128, -78, { name: '检票闸机' });
  put('gate_b', 'aq_turnstile', 138, -78, { name: '检票闸机' });
  put('gate_c', 'aq_turnstile', 148, -78, { name: '检票闸机' });
  put('lion_sl', 'aq_lion', 136, -90, { variant: 'm', name: '石狮' });
  put('lion_sr', 'aq_lion', 164, -90, { variant: 'f', name: '石狮' });
  put('lion_s2l', 'aq_lion', 120, -108, { variant: 'f' });
  put('lion_s2r', 'aq_lion', 180, -108, { variant: 'm' });
  put('lamp_s1', 'aq_lamppost', 110, -118);
  put('lamp_s2', 'aq_lamppost', 190, -118);
  put('lamp_s3', 'aq_lamppost', 130, -112);
  put('lamp_s4', 'aq_lamppost', 170, -112);
  put('huai_s1', 'aq_huai', 100, -128);
  put('huai_s2', 'aq_huai', 200, -128);
  put('huai_s3', 'aq_huai', 80, -110);
  put('huai_s4', 'aq_huai', 220, -110);
  put('lanterns_s1', 'aq_lanterns', 132, -96);
  put('lanterns_s2', 'aq_lanterns', 148, -88);
  put('stall_s1', 'aq_stall', 118, -96, { variant: 'fruit' });
  put('stall_s2', 'aq_stall', 178, -96, { variant: 'toys' });
  put('cart_s1', 'aq_cart', 155, -100);
  /* Track C 氛围道具（收缩坐标系）：招幌/桌凳/花坛 */
  put('bn_s1', 'aq_banner', 118, -100, { variant: 'food' });
  put('bn_s2', 'aq_banner', 178, -100, { variant: 'tea' });
  put('tbl_s1', 'aq_table', 150, -108, { variant: 'tea' });
  put('tbl_s2', 'aq_table', 165, -112, { variant: 'wine' });
  put('pl_s1', 'aq_planter', 125, -112, { variant: 'a' });
  put('pl_s2', 'aq_planter', 175, -112, { variant: 'b' });
  put('pl_s3', 'aq_planter', 145, -120, { variant: 'c' });

  /* —— 南薰门 —— */
  put('nanxun', 'aq_wall_gate', gatePut, -46, { name: '南薰门（名称未经确认）' });
  put('lion_gl', 'aq_lion', gatePut + 6, -50, { variant: 'm' });
  put('lion_gr', 'aq_lion', gatePut + 24, -50, { variant: 'f' });
  put('lanterns_gate', 'aq_lanterns', gatePut + 8, -42);

  /* —— 城墙段（视觉；碰撞已用 solids） —— */
  for (let i = 0; i < 12; i++) {
    const x = i * 24;
    if (x + 24 <= gatePut + 13) put('ws_w' + i, 'aq_city_wall', x, -8, { variant: 'ew' });
  }
  for (let i = 0; i < 8; i++) {
    const x = gatePut + 17 + i * 24;
    if (x < CW) put('ws_e' + i, 'aq_city_wall', Math.min(x, CW - 24), -8, { variant: 'ew' });
  }
  for (let i = 0; i < 13; i++) put('wn' + i, 'aq_city_wall', i * 24, CN - 8, { variant: 'ew' });
  for (let i = 0; i < 9; i++) {
    put('ww' + i, 'aq_city_wall', 0, i * 24, { variant: 'ns' });
    put('we' + i, 'aq_city_wall', CW - 28, i * 24, { variant: 'ns' });
  }
  put('ct_sw', 'aq_corner_tower', -1, -9);
  put('ct_se', 'aq_corner_tower', CW - 29, -9);
  put('ct_nw', 'aq_corner_tower', -1, CN - 9);
  put('ct_ne', 'aq_corner_tower', CW - 29, CN - 9);

  /* —— 东京梦华牌坊 + 御街闹市（加密店铺/摊/灯笼） —— */
  put('paifang', 'aq_paifang', CX - 7, 6, { name: '东京梦华（名称未经确认）' });

  /* 东西市：南向立面贴巷，满铺少空地（步距 6.9，多一间） */
  shopRow('row_s_w', 16, 18, 6, 6.9);           // 西段南巷
  shopRow('row_s_e', 162, 18, 6, 6.9);          // 东段
  shopRow('row_a_w', 16, 34, 6, 6.9);           // 中市南排
  shopRow('row_a_e', 162, 34, 6, 6.9);
  shopRow('row_m_w', 16, 48, 6, 6.9);           // 中巷
  shopRow('row_m_e', 162, 48, 6, 6.9);
  shopRow('row_b_w', 16, 64, 5, 6.9);           // 中市北排
  shopRow('row_b_e', 170, 64, 5, 6.9);
  shopRow('row_n_w', 16, 78, 5, 6.9);           // 近汴河南岸
  shopRow('row_n_e', 170, 78, 5, 6.9);
  shopRow('row_r_w', 16, 88, 4, 6.9);           // 河市南岸
  shopRow('row_r_e', 200, 88, 4, 6.9);  // 避开望川楼

  /* 御街两侧贴边小店（侧影仍撑满视线） */
  const sideL = [
    ['dangpu', CX - 22, 12], ['yaopu', CX - 22, 24], ['buzhuang', CX - 22, 36],
    ['gaobing', CX - 22, 48], ['zahuo', CX - 22, 60], ['yaopu', CX - 22, 72],
    ['buzhuang', CX - 22, 84],
  ];
  const sideR = [
    ['yaopu', CX + 16, 12], ['gaobing', CX + 16, 24], ['zahuo', CX + 16, 36],
    ['buzhuang', CX + 16, 48], ['dangpu', CX + 16, 60], ['gaobing', CX + 16, 72],
    ['zahuo', CX + 16, 84],
  ];
  sideL.forEach(([k, x, y], i) => putShop('side_l' + i, k, x, y));
  sideR.forEach(([k, x, y], i) => putShop('side_r' + i, k, x, y));

  /* 街心：摊、车、灯柱、灯笼串、井 —— 拉满利用率 */
  for (let y = 12; y <= 88; y += 8) {
    put('lp_l' + y, 'aq_lamppost', CX - 10, y);
    put('lp_r' + y, 'aq_lamppost', CX + 10, y);
  }
  for (let y = 16; y <= 84; y += 12) put('lanterns_y' + y, 'aq_lanterns', CX - 8, y);
  const stalls = [
    [CX - 2, 18, 'fruit'], [CX + 4, 24, 'noodle'], [CX - 3, 32, 'toys'],
    [CX + 3, 40, 'fruit'], [CX - 2, 48, 'noodle'], [CX + 4, 56, 'toys'],
    [CX - 3, 64, 'fruit'], [CX + 3, 72, 'noodle'], [CX - 2, 80, 'toys'],
    [40, 34, 'fruit'], [60, 36, 'noodle'], [200, 34, 'toys'], [220, 38, 'fruit'],
    [40, 64, 'toys'], [220, 64, 'noodle'], [100, 34, 'fruit'], [250, 50, 'toys'],
  ];
  stalls.forEach(([x, y, v], i) => put('stall_' + i, 'aq_stall', x, y, { variant: v }));
  put('cart1', 'aq_cart', CX, 36);
  put('cart2', 'aq_cart', CX + 2, 68);
  put('horsecart1', 'aq_horsecart', 70, 34);
  put('horsecart2', 'aq_horsecart', 210, 62);
  put('sedan1', 'aq_sedan', CX - 4, 52);
  put('well1', 'aq_well', 48, 56);
  put('well2', 'aq_well', 240, 56);
  put('huai_m1', 'aq_huai', 36, 40);
  put('huai_m2', 'aq_huai', 256, 40);
  put('huai_m3', 'aq_huai', 36, 70);
  put('huai_m4', 'aq_huai', 256, 70);
  /* Track C：御街招幌/桌凳/花坛（A 坐标系） */
  const bannersL = [['tea', CX - 18, 20], ['med', CX - 18, 36], ['cloth', CX - 18, 52], ['food', CX - 18, 68], ['wine', CX - 18, 84]];
  const bannersR = [['wine', CX + 18, 20], ['food', CX + 18, 36], ['tea', CX + 18, 52], ['cloth', CX + 18, 68], ['med', CX + 18, 84]];
  bannersL.forEach(([v, x, y], i) => put('bn_l' + i, 'aq_banner', x, y, { variant: v }));
  bannersR.forEach(([v, x, y], i) => put('bn_r' + i, 'aq_banner', x, y, { variant: v }));
  put('tbl_a1', 'aq_table', CX - 4, 22, { variant: 'tea' });
  put('tbl_a2', 'aq_table', CX + 4, 38, { variant: 'wine' });
  put('tbl_a3', 'aq_table', CX - 4, 54, { variant: 'tea' });
  put('tbl_a4', 'aq_table', CX + 4, 70, { variant: 'tea' });
  put('pl_a1', 'aq_planter', CX - 12, 14, { variant: 'a' });
  put('pl_a2', 'aq_planter', CX + 12, 14, { variant: 'b' });
  put('pl_a3', 'aq_planter', CX - 12, 86, { variant: 'c' });
  put('pl_a4', 'aq_planter', CX + 12, 86, { variant: 'a' });
  put('pl_a5', 'aq_planter', 48, 50, { variant: 'b' });
  put('pl_a6', 'aq_planter', 240, 50, { variant: 'c' });

  /* —— 汴河：望川楼、茶坊、虹桥、柳、船、码头 —— */
  put('jiulou', 'aq_jiulou', CX + 18, 78, { name: '望川楼（名称未经确认）' });
  put('chafang', 'aq_chafang', 40, 82, { name: '清风茶坊（名称未经确认）' });
  put('hongqiao', 'aq_hongqiao', CX - 14, 96, { variant: 'ew', name: '虹桥（名称未经确认）' });
  put('zhou_deck', 'aq_dock', CX - 10, 108, { name: '州桥码头' });
  put('dock_w', 'aq_dock', 40, 112);
  put('dock_e', 'aq_dock', 240, 112);
  put('boat1', 'aq_boat', 70, 104);
  put('boat2', 'aq_boat', 200, 104);
  put('boat3', 'aq_boat', 250, 106);
  for (const [x, y] of [
    [24, 118], [56, 120], [88, 118], [120, 122], [180, 120], [212, 118], [244, 122], [276, 118],
    [30, 90], [270, 90], [100, 118], [160, 118],
  ]) {
    put('willow_' + x + '_' + y, 'aq_willow', x, y, { variant: (x + y) % 2 ? 'a' : 'b' });
  }
  put('lanterns_river1', 'aq_lanterns', CX - 8, 90);
  put('lanterns_river2', 'aq_lanterns', 48, 90);
  put('lanterns_river3', 'aq_lanterns', 220, 90);
  put('stall_river1', 'aq_stall', CX - 6, 88, { variant: 'noodle' });
  put('stall_river2', 'aq_stall', CX + 8, 88, { variant: 'fruit' });
  put('tbl_r1', 'aq_table', CX + 12, 84, { variant: 'wine' });
  put('tbl_r2', 'aq_table', 56, 92, { variant: 'tea' });
  put('bn_river1', 'aq_banner', CX + 22, 82, { variant: 'wine' });
  put('bn_river2', 'aq_banner', 48, 86, { variant: 'tea' });
  put('pl_r1', 'aq_planter', 36, 94, { variant: 'a' });
  put('pl_r2', 'aq_planter', 220, 94, { variant: 'b' });
  put('pl_r3', 'aq_planter', CX, 92, { variant: 'c' });
  /* Site194 写实水体：汴河/护城河岸芦苇与泥石岸（贴密实 footprint，不改建筑） */
  const reedSpots = [
    [24, 94], [48, 116], [90, 94], [120, 116], [180, 94], [200, 116],
    [240, 94], [270, 116],
    [8, -54], [60, -54], [120, -50], [200, -54], [260, -50],
    [8, CN + 8], [80, CN + 8], [160, CN + 4], [240, CN + 8],
    [-8, 40], [-8, 100], [-8, 160],
    [CW + 8, 40], [CW + 8, 100], [CW + 8, 160],
  ];
  reedSpots.forEach(([x, y], i) => {
    put('reed_' + i, 'aq_reed', x, y, { variant: (i % 5 === 0) ? 'iris' : 'reed' });
  });
  const bankSpots = [
    [30, 96], [110, 114], [190, 96], [250, 114],
    [40, -48], [180, -60], [260, -48],
    [-10, 80], [-10, 160], [CW + 10, 100], [CW + 10, 160],
  ];
  bankSpots.forEach(([x, y], i) => {
    put('bank_' + i, 'aq_bank', x, y, { variant: i % 2 ? 'stone' : 'mud' });
  });

  /* —— 北部：梦华府、公堂、书塾、勾栏、宝相寺、市集 —— */
  put('yamen', 'aq_yamen_gate', 70, 145, { name: '梦华府（名称未经确认）' });
  put('drum', 'aq_drum', 66, 143);
  put('gongtang', 'aq_gongtang', 66, 160, { name: '公堂' });
  put('shushu', 'aq_shushu', 160, 148, { name: '明德书塾（名称未经确认）' });
  put('goulan', 'aq_goulan', 20, 128, { name: '勾栏（名称未经确认）' });
  put('siyuan', 'aq_siyuan', 230, 140, { name: '宝相寺（名称未经确认）' });
  /* 北市集填满衙门与书塾之间 */
  for (const [x, y, v] of [
    [120, 140, 'fruit'], [132, 142, 'noodle'], [144, 140, 'toys'],
    [120, 152, 'toys'], [136, 154, 'fruit'], [148, 150, 'noodle'],
    [200, 138, 'fruit'], [212, 142, 'noodle'], [180, 148, 'toys'],
    [190, 156, 'fruit'], [210, 152, 'noodle'],
  ]) put('stall_n_' + x + '_' + y, 'aq_stall', x, y, { variant: v });
  put('horsecart_n', 'aq_horsecart', 100, 148);
  put('sedan_n', 'aq_sedan', 88, 140);
  put('cart_n', 'aq_cart', 200, 148);
  put('well_n', 'aq_well', 160, 138);
  for (let x = 80; x <= 220; x += 16) put('lp_n' + x, 'aq_lamppost', x, 136);
  for (let x = 90; x <= 210; x += 20) put('lanterns_n' + x, 'aq_lanterns', x, 144);
  put('huai_n1', 'aq_huai', 50, 175);
  put('huai_n2', 'aq_huai', 210, 175);
  put('huai_n3', 'aq_huai', 120, 178);
  put('lion_n1', 'aq_lion', 78, 142, { variant: 'm' });
  put('lion_n2', 'aq_lion', 98, 142, { variant: 'f' });
  put('tbl_n1', 'aq_table', 150, 146, { variant: 'tea' });
  put('tbl_n2', 'aq_table', 170, 150, { variant: 'wine' });
  put('bn_n1', 'aq_banner', 126, 138, { variant: 'food' });
  put('bn_n2', 'aq_banner', 190, 138, { variant: 'wine' });
  put('pl_n1', 'aq_planter', 84, 136, { variant: 'a' });
  put('pl_n2', 'aq_planter', 108, 136, { variant: 'b' });
  put('pl_n3', 'aq_planter', 160, 136, { variant: 'c' });
  put('pl_n4', 'aq_planter', 60, 160, { variant: 'a' });
  put('pl_n5', 'aq_planter', 220, 160, { variant: 'b' });
  put('lion_n3', 'aq_lion', 168, 146, { variant: 'm' });
  put('lion_n4', 'aq_lion', 188, 146, { variant: 'f' });

  /* 西北/东北角：店 + 四合院填满边角空地（麻雀虽小五脏俱全） */
  shopRow('corner_nw', 16, 120, 4, 6.9);
  shopRow('corner_ne', 200, 120, 4, 6.9);
  shopRow('corner_n2', 100, 128, 3, 6.9);
  put('siheyuan_w', 'aq_siheyuan', 36, 155, { name: '民居四合院（名称未经确认）' });
  put('siheyuan_e', 'aq_siheyuan', 248, 158, { name: '民居四合院（名称未经确认）' });
  put('siheyuan_n', 'aq_siheyuan', 128, 168, { name: '客栈四合院（名称未经确认）' });
  /* 河市北岸再塞摊幌，消灭汴河北空带 */
  for (const [x, y, v] of [
    [50, 118, 'fruit'], [70, 120, 'noodle'], [90, 118, 'toys'],
    [180, 118, 'fruit'], [210, 120, 'noodle'], [240, 118, 'toys'],
  ]) put('stall_rb_' + x, 'aq_stall', x, y, { variant: v });
  for (let x = 40; x <= 260; x += 18) put('lp_rb' + x, 'aq_lamppost', x, 116);
  for (let x = 48; x <= 250; x += 24) put('lanterns_rb' + x, 'aq_lanterns', x, 122);

  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_songcheng = { objects: list, colliders: [] };

  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  if (!TAIL.some((c) => c.id === 'rqe_songcheng') && !(D.chunks || []).some((c) => c.id === 'rqe_songcheng')) {
    TAIL.push({
      id: 'rqe_songcheng',
      name: '鹰山宋城',
      rect: [BX0, BY0, BX1, BY1],
      src: 'js/rongqiao_ancient_town.js',
      load_m: 60,
      unload_m: 120,
    });
  }

  const spawn = W(CX, -95);
  N.expansionSongcheng = Object.assign(N.expansionSongcheng || {}, {
    unconfirmed: true,
    teleport: true,
    names: {
      district: '鹰山宋城',
      gate: '南薰门',
      street: '御街',
      river: '汴河',
      jiulou: '望川楼',
      chafang: '清风茶坊',
      yamen: '梦华府',
      shushu: '明德书塾',
      paifang: '东京梦华',
      goulan: '勾栏',
      siyuan: '宝相寺',
    },
    district: [BX0, BY0, BX1, BY1],
    spawn: [spawn[0], spawn[1], 'N'],
    origin: [OX, OY],
    site194: {
      unconfirmed: true,
      choice: 'dense_ornate',
      footprint: [CW, CN],
      buildings: list.filter((o) =>
        /^aq_(wall_gate|jiulou|chafang|yamen|gongtang|shushu|shop_|paifang|ticket|hongqiao|siheyuan|corner|goulan|siyuan)/.test(o.type)
        || /aq_shop_/.test(o.type)).length,
      props: list.length,
      shops: list.filter((o) => /^aq_shop_/.test(o.type)).length,
      stalls: list.filter((o) => o.type === 'aq_stall').length,
      lanterns: list.filter((o) => o.type === 'aq_lanterns' || o.type === 'aq_lamppost').length,
      facadeModules: list.filter((o) => /^aq_f_/.test(o.type)).length,
      kitbash: true,
      gate: true,
      street: true,
      river: true,
      goulan: true,
      siyuan: true,
      siheyuan: true,
      denserThan193: true,
    },
    site194TrackC: {
      unconfirmed: true,
      densify: true,
      props: list.filter((o) => /aq_(lanterns|lamppost|stall|banner|table|planter|lion|willow|huai|cart|well)/.test(o.type)).length,
      kinds: ['lanterns', 'banner', 'stall', 'table', 'lion', 'planter', 'trees'],
    },
  });
  /* 保留 site193 键：旧测试读 choice=quality；已被 194 加密版取代 */
  N.expansionSongcheng.site193 = Object.assign({}, N.expansionSongcheng.site194, {
    supersededBy: 194,
    choice: 'quality',
    denserThan193: false,
  });
  N.mapPois = (N.mapPois || []).concat([
    { id: 'aq_nanxun', name: '南薰门（未经确认）', x: OX + CX, y: OY - 42, cat: 'landmark' },
    { id: 'aq_yujie', name: '御街闹市（未经确认）', x: OX + CX, y: OY + 40, cat: 'shop' },
    { id: 'aq_jiulou', name: '望川楼（未经确认）', x: OX + CX + 24, y: OY + 86, cat: 'landmark' },
    { id: 'aq_yamen', name: '梦华府（未经确认）', x: OX + 80, y: OY + 155, cat: 'civic' },
    { id: 'aq_goulan', name: '勾栏（未经确认）', x: OX + 28, y: OY + 134, cat: 'landmark' },
    { id: 'aq_siyuan', name: '宝相寺（未经确认）', x: OX + 240, y: OY + 148, cat: 'landmark' },
  ]);
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '鹰山宋城（未经确认）', rect: [BX0, BY0, BX1, BY1] },
  ]);

  const P10 = N.expansionP10 || (N.expansionP10 = {});
  P10.site194 = N.expansionSongcheng.site194;
  P10.site193 = N.expansionSongcheng.site193;
  P10.reasons = P10.reasons || {};
  P10.reasons.site194 = 'Site194：鹰山宋城相对 Site193 收缩内城（约 300×210，原约 480×320），加密店铺/摊幌/灯笼/柳树/石狮/四合院，补勾栏与宝相寺小体量，少素土空地、更满更华丽宋代鼎盛感。店铺立面按井槐里管线用宋代主题 aq_f_* atlas 模块拼装（非整栋线条式），密度+贴图细节一起上。世界原点仍 1920,−160。入口区跳「鹰山宋城」传送南广场（不穿海）。不做 438 m 塔，不南扩南埠（−1540），不进学校/渔村老街/柳口居，不改 Site146 石驳岸。名称与尺寸未经确认。';
  P10.reasons.site193 = P10.reasons.site194;
  P10.site194TrackC = N.expansionSongcheng.site194TrackC;
  P10.reasons.site194TrackC = 'Site194 Track C：氛围道具（灯笼串/招幌/摊位/桌凳/石狮/花木/花坛）贴图模块拼装已合入密实布局；不改城墙 footprint、不进学校/渔村老街/石驳岸。名称未经确认。';
  P10.reasons.site194Water = 'Site194 水体写实：宋城专用 D/E/I→aq_gwater 浅/中/深分层 + 噪声碎岸 + 芦苇/泥石岸小品；不改月河 rq_gwater（U/V/W），不进学校/渔村/石驳岸。名称未经确认。';
  /* 地面图例改完后重烘，保证 aq_gwater 立刻进 ground atlas */
  try {
    if (root.SP && root.SP.world && typeof root.SP.world.bakeGround === 'function') root.SP.world.bakeGround();
  } catch (e) { /* boot race: main will bake later */ }

})();
