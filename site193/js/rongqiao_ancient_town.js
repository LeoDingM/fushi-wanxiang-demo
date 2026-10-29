/* Site193 · 鹰山宋城（影视城古镇）核心可玩区。
 * 接在河东东界（x1750 / 地面 1770）以东、澜海对岸：世界原点 OX=1920 OY=-160 = 规划局部 (0,0) 城墙西南内角。
 * 入口：区级总览「鹰山宋城」传送到南广场（不走路穿海）；规划写的 BRT2 / 6 号线接驳尚未做。
 * 美术：ancient_art_* 预览级城门 / 御街店铺 / 望川楼 / 汴河虹桥 / 衙门书塾等，宁少而精，不对齐 Site182–192 碎小品。
 * 不进学校、渔村老街、柳口居；不改 Site146 石驳岸；不南扩南埠；不做 438 m 塔。
 * 全部名称与尺寸未经 Leo 确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || D.rongqiaoAncientTown || !root.RongqiaoArt) return;
  if (!root.RongqiaoArt.DEFS || !root.RongqiaoArt.DEFS.get('aq_wall_gate')) return;
  D.rongqiaoAncientTown = 1;

  const OX = 1920, OY = -160;           // 规划局部原点 → 世界
  const W = (lx, ly) => [OX + lx, OY + ly];
  const BX0 = OX - 40, BX1 = OX + 520, BY0 = OY - 200, BY1 = OY + 360;
  const GX1 = OX + 540, GY0 = OY - 220;
  const G = D.ground, CH = root.SCENE_CHUNKS || {};

  /* 地面扩到宋城东/南界外 20 m */
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
    x1: Math.max(D.bounds.x1 || 0, BX1),
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
  const sea = (x, y) => (Math.round(x + y) % 7 === 0 ? 'U' : (Math.round(x) % 2 ? 'V' : 'W'));

  /* 湾区缓冲：1770→1920 仍是水面（澜海东延），人不可走；宋城本体铺石板/御街/草地 */
  paint([1770, BY0, OX - 16, BY1], null, sea);
  paint([OX - 16, BY0, GX1, BY1], 'G');                         // 外缘草地
  paint([OX, OY - 150, OX + 480, OY + 320], 'S');               // 内城硬地
  paint([OX + 150, OY - 150, OX + 330, OY - 72], 'S');          // 南广场
  paint([OX + 228, OY - 8, OX + 252, OY + 230], null, road);    // 御街
  paint([OX + 228, OY - 8, OX + 252, OY + 230], 'S');           // 御街石板（覆盖路纹边缘）
  paint([OX + 140, OY + 62, OX + 340, OY + 74], 'S');           // 东西大街
  paint([OX - 16, OY - 62, OX + 496, OY - 46], null, sea);      // 南护城河
  paint([OX - 16, OY + 320, OX + 496, OY + 336], null, sea);    // 北护城河
  paint([OX - 16, OY - 46, OX, OY + 320], null, sea);           // 西护城河
  paint([OX + 480, OY - 46, OX + 496, OY + 320], null, sea);    // 东护城河
  paint([OX, OY + 136, OX + 480, OY + 160], null, sea);         // 汴河
  paint([OX + 220, OY + 132, OX + 260, OY + 164], 'S');         // 州桥落点硬地（御街过河）
  paint([OX + 186, OY - 102, OX + 204, OY - 88], 'S');          // 售票处前

  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id: 'aq_' + id, rect: rect.slice() }); };
  /* 湾面不可走 */
  block('bay', [1770, BY0, OX - 16, BY1]);
  block('moat_s', [OX - 16, OY - 62, OX + 496, OY - 46]);
  block('moat_n', [OX - 16, OY + 320, OX + 496, OY + 336]);
  block('moat_w', [OX - 16, OY - 46, OX, OY + 320]);
  block('moat_e', [OX + 480, OY - 46, OX + 496, OY + 320]);
  /* 汴河水体（虹桥/州桥落点不堵；虹桥 fp 只挡桥台） */
  block('bian_w', [OX, OY + 136, OX + 220, OY + 160]);
  block('bian_e', [OX + 260, OY + 136, OX + 480, OY + 160]);
  /* 城墙实体：南墙留门洞 225–229（对应 aq_wall_gate 开口 13–17 @ x212） */
  block('wall_s_w', [OX, OY - 8, OX + 212, OY]);
  block('wall_s_e', [OX + 242, OY - 8, OX + 480, OY]);
  block('wall_n', [OX, OY + 312, OX + 480, OY + 320]);
  block('wall_w', [OX, OY, OX + 8, OY + 312]);
  block('wall_e', [OX + 472, OY, OX + 480, OY + 312]);

  N.solids = (N.solids || []).concat(solids);
  D.colliders = (D.colliders || []).concat(colliders);
  N.water = (N.water || []).concat([
    [1770, BY0, OX - 16, BY1],
    [OX - 16, OY - 62, OX + 496, OY - 46],
    [OX - 16, OY + 320, OX + 496, OY + 336],
    [OX - 16, OY - 46, OX, OY + 320],
    [OX + 480, OY - 46, OX + 496, OY + 320],
    [OX, OY + 136, OX + 480, OY + 160],
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

  /* —— 南广场：售票 + 闸机 —— */
  put('ticket', 'aq_ticket', 186, -102, { name: '售票处（名称未经确认）' });
  put('gate_a', 'aq_turnstile', 210, -76, { name: '检票闸机' });
  put('gate_b', 'aq_turnstile', 218, -76, { name: '检票闸机' });
  put('gate_c', 'aq_turnstile', 226, -76, { name: '检票闸机' });
  put('lion_sl', 'aq_lion', 220, -88, { variant: 'm', name: '石狮' });
  put('lion_sr', 'aq_lion', 248, -88, { variant: 'f', name: '石狮' });
  put('lamp_s1', 'aq_lamppost', 200, -120);
  put('lamp_s2', 'aq_lamppost', 280, -120);
  put('huai_s1', 'aq_huai', 170, -130);
  put('huai_s2', 'aq_huai', 310, -130);

  /* —— 南薰门 —— */
  put('nanxun', 'aq_wall_gate', 212, -46, { name: '南薰门（名称未经确认）' });
  put('lion_gl', 'aq_lion', 218, -50, { variant: 'm' });
  put('lion_gr', 'aq_lion', 236, -50, { variant: 'f' });

  /* —— 城墙段（视觉；碰撞已用 solids） —— */
  for (let i = 0; i < 8; i++) {
    const x = i * 24;
    if (x + 24 <= 212) put('ws_w' + i, 'aq_city_wall', x, -8, { variant: 'ew' });
  }
  for (let i = 0; i < 10; i++) {
    const x = 242 + i * 24;
    if (x < 480) put('ws_e' + i, 'aq_city_wall', Math.min(x, 456), -8, { variant: 'ew' });
  }
  for (let i = 0; i < 20; i++) put('wn' + i, 'aq_city_wall', i * 24, 312, { variant: 'ew' });
  for (let i = 0; i < 13; i++) {
    put('ww' + i, 'aq_city_wall', 0, i * 24, { variant: 'ns' });
    put('we' + i, 'aq_city_wall', 472, i * 24, { variant: 'ns' });
  }
  put('ct_sw', 'aq_corner_tower', -1, -9);
  put('ct_se', 'aq_corner_tower', 471, -9);
  put('ct_nw', 'aq_corner_tower', -1, 311);
  put('ct_ne', 'aq_corner_tower', 471, 311);

  /* —— 东京梦华牌坊 + 御街闹市 —— */
  put('paifang', 'aq_paifang', 228, 16, { name: '东京梦华（名称未经确认）' });
  const shopsL = [
    ['dangpu', 218, 28], ['yaopu', 218, 42], ['buzhuang', 218, 56],
    ['gaobing', 218, 78], ['zahuo', 218, 92],
  ];
  const shopsR = [
    ['yaopu', 254, 28], ['gaobing', 254, 42], ['zahuo', 254, 56],
    ['buzhuang', 254, 78], ['dangpu', 254, 92],
  ];
  shopsL.forEach(([k, x, y], i) => put('shop_l' + i, 'aq_shop_' + k, x, y, { name: undefined }));
  shopsR.forEach(([k, x, y], i) => put('shop_r' + i, 'aq_shop_' + k, x, y));
  /* 街灯与摊 */
  for (let y = 24; y <= 120; y += 16) {
    put('lp_l' + y, 'aq_lamppost', 226, y);
    put('lp_r' + y, 'aq_lamppost', 254, y);
  }
  put('stall_f1', 'aq_stall', 236, 34, { variant: 'fruit' });
  put('stall_n1', 'aq_stall', 244, 48, { variant: 'noodle' });
  put('stall_t1', 'aq_stall', 236, 68, { variant: 'toys' });
  put('cart1', 'aq_cart', 240, 88);
  put('lanterns1', 'aq_lanterns', 228, 40);
  put('lanterns2', 'aq_lanterns', 228, 80);

  /* —— 汴河：望川楼、茶坊、虹桥、柳、船、码头 —— */
  put('jiulou', 'aq_jiulou', 254, 112, { name: '望川楼（名称未经确认）' });
  put('chafang', 'aq_chafang', 330, 118, { name: '清风茶坊（名称未经确认）' });
  put('hongqiao', 'aq_hongqiao', 356, 136, { variant: 'ew', name: '虹桥（名称未经确认）' });
  put('zhou_deck', 'aq_dock', 228, 148, { name: '州桥码头' });
  put('boat1', 'aq_boat', 300, 148);
  put('boat2', 'aq_boat', 400, 148);
  put('dock_e', 'aq_dock', 400, 162);
  for (const [x, y] of [[210, 162], [270, 168], [320, 164], [380, 170], [440, 166], [100, 164], [50, 168]]) {
    put('willow_' + x + '_' + y, 'aq_willow', x, y, { variant: (x + y) % 2 ? 'a' : 'b' });
  }
  put('well1', 'aq_well', 270, 100);

  /* —— 北部：梦华府、公堂、书塾、四合院、市集感 —— */
  put('yamen', 'aq_yamen_gate', 210, 250, { name: '梦华府（名称未经确认）' });
  put('drum', 'aq_drum', 206, 248);
  put('gongtang', 'aq_gongtang', 206, 268, { name: '公堂' });
  put('shushu', 'aq_shushu', 286, 250, { name: '明德书塾（名称未经确认）' });
  put('sihe1', 'aq_siheyuan', 60, 200);
  put('sihe2', 'aq_siheyuan', 360, 200);
  put('stall_m1', 'aq_stall', 260, 210, { variant: 'fruit' });
  put('stall_m2', 'aq_stall', 280, 214, { variant: 'noodle' });
  put('horsecart', 'aq_horsecart', 300, 206);
  put('sedan', 'aq_sedan', 240, 240);
  put('huai_n1', 'aq_huai', 180, 220);
  put('huai_n2', 'aq_huai', 320, 220);
  for (let x = 200; x <= 300; x += 20) put('lp_n' + x, 'aq_lamppost', x, 236);

  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_songcheng = { objects: list, colliders: [] };

  /* 登记分块（若 far_districts 已预留则只填内容） */
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

  const spawn = W(240, -100);
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
    },
    district: [BX0, BY0, BX1, BY1],
    spawn: [spawn[0], spawn[1], 'N'],
    origin: [OX, OY],
    site193: {
      unconfirmed: true,
      choice: 'quality',
      buildings: list.filter((o) => /^aq_(wall_gate|jiulou|chafang|yamen|gongtang|shushu|shop_|paifang|ticket|hongqiao|siheyuan|corner)/.test(o.type) || /aq_shop_/.test(o.type)).length,
      props: list.length,
      gate: true,
      street: true,
      river: true,
    },
  });
  N.mapPois = (N.mapPois || []).concat([
    { id: 'aq_nanxun', name: '南薰门（未经确认）', x: OX + 227, y: OY - 42, cat: 'landmark' },
    { id: 'aq_yujie', name: '御街闹市（未经确认）', x: OX + 240, y: OY + 50, cat: 'shop' },
    { id: 'aq_jiulou', name: '望川楼（未经确认）', x: OX + 260, y: OY + 120, cat: 'landmark' },
    { id: 'aq_yamen', name: '梦华府（未经确认）', x: OX + 220, y: OY + 260, cat: 'civic' },
  ]);
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '鹰山宋城（未经确认）', rect: [BX0, BY0, BX1, BY1] },
  ]);

  const P10 = N.expansionP10 || (N.expansionP10 = {});
  P10.site193 = N.expansionSongcheng.site193;
  P10.reasons = P10.reasons || {};
  P10.reasons.site193 = 'Site193：鹰山宋城影视城古镇核心可玩区落在河东澜海以东（世界原点 1920,−160 = 规划局部西南内角）。南薰门、御街闹市、汴河虹桥、望川楼、梦华府、明德书塾等用预览级 ancient_art 渲染，宁少而精。入口经区级总览「鹰山宋城」传送南广场（不穿海走路）。不做 438 m 塔，不南扩南埠（−1540），不进学校/渔村老街/柳口居，不改 Site146 石驳岸。勾栏、宝相寺未做。名称与尺寸未经确认。';
})();
