/* Site197–201 · 鹰山宋城：街巷密实 + 植物水系 + 艮岳/豪宅 + facade + 码头 + 城墙垛口 + 南广场市集 + 灯笼幌子光晕 + 汴河船灯渔火 Track。
 * Site198 wall-merlon：南薰门/城墙垛口·女墙·城砖 atlas kitbash（不改大布局）。
 * Site199：南薰门外南广场/瓮城口市集摊位再加密。
 * Site197 facade-detail：atlas/parts/facade 门窗隔扇斗拱屋脊瓦细化；putShop 仅加 aq_f_dougong 与变体。
 * Site198：屋脊/瓦当/鸱吻/滴水 atlas 增强（少改布局）。
 * Site200：灯笼/幌子黄昏夜景光晕与暖色叠层（挂钩既有黄昏 grade；少改布局）。
 * Site201：汴河码头黄昏渔火/船灯点光（复用 lanternGlow + 水面倒影；少改布局）。
 * Site202：御街/广场铺地砖纹·排水沟·路牙 atlas kitbash（aq_gpave + aq_drain/aq_curb；少改布局）。
 * Site203 lattice：格扇门窗/花窗/隔扇/槛窗 atlas 细化；putShop 门窗变体加 bubujin/huachuang/kanchuang；少改大布局。
 * site197Dock：汴河码头/船只/货箱（SongchengDock）。
 * 接在河东东界（x1750 / 地面 1770）以东、澜海对岸：世界原点 OX=1920 OY=-160 = 规划局部 (0,0) 城墙西南内角。
 * Track A/B/C + 水体已合入 site88。site197Street：街巷 putShop/道具 densify（竖招·披檐·横巷）。
 * site197Plants：SongchengScenic 松柳芦苇假山竹丛 + 小池动态水。
 * site197：艮岳苑（池塘假山柳亭廊）+ 豪宅院内唐宋庭院；院池接动态波纹；虹桥 ns 保持。
 * 立面 aq_f_* atlas kitbash；不进学校/渔村/石驳岸。名称与尺寸未经 Leo 确认。 */
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
    /* Site202：宋城硬地改铺地砖纹（方砖/条石/席纹），替换现代 g_sidewalk */
    S: 'aq_gpave:a',
    P: 'aq_gpave:b',
    R: 'aq_gpave:c',
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
  paint([OX, OY - 120, OX + CW, OY + CN], 'S');                 // 内城硬地（方砖 aq_gpave:a）
  paint([OX + 80, OY - 120, OX + 220, OY - 72], 'S');           // 南广场底
  /* Site202：南广场中心席纹装饰带 */
  paint([OX + 110, OY - 108, OX + 190, OY - 84], 'R');
  paint([OX + CX - 14, OY - 8, OX + CX + 14, OY + 100], null, road);
  paint([OX + CX - 14, OY - 8, OX + CX + 14, OY + 100], 'P');   // 御街条石
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
  /* Site197：艮岳苑主池 + 次池；豪宅院内小池（动态波纹覆盖，禁静态岸线装饰为主） */
  paintSea([OX + 18, OY + 160, OX + 58, OY + 186], { pad: 1.0 });     // 艮岳主池
  paintSea([OX + 62, OY + 174, OX + 76, OY + 186], { pad: 0.8 });     // 艮岳次池
  paintSea([OX + 252, OY + 164, OX + 264, OY + 174], { pad: 0.6 });   // 东北豪宅院池
  paintSea([OX + 136, OY + 176, OX + 148, OY + 186], { pad: 0.6 });   // 北宅院池
  paintSea([OX + 98, OY + 178, OX + 110, OY + 188], { pad: 0.6 });     // 御街西宅院池
  paint([OX + CX - 16, OY + 94, OX + CX + 16, OY + 116], 'S');  // 州桥落点
  paint([OX + 90, OY - 102, OX + 120, OY - 88], 'S');           // 售票处前
  /* 艮岳苑硬地环池（石板环岸，池心仍是水） */
  paint([OX + 12, OY + 152, OX + 82, OY + 160], 'S');
  paint([OX + 12, OY + 186, OX + 82, OY + 194], 'S');
  paint([OX + 12, OY + 160, OX + 18, OY + 186], 'S');
  paint([OX + 78, OY + 160, OX + 88, OY + 190], 'S');

  /* Site197：小池接动态水（D/E/I）；艮岳布局 Track 可扩，本处只点景水景 */
  let _scenicPonds = { waterRects: [] };
  if (root.SongchengScenic && typeof root.SongchengScenic.paintPonds === 'function') {
    _scenicPonds = root.SongchengScenic.paintPonds(paint, paintSea, { OX, OY, CX, CW, CN }) || _scenicPonds;
  }

  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id: 'aq_' + id, rect: rect.slice() }); };
  block('bay', [1770, BY0, OX - 16, BY1]);
  block('moat_s', [OX - 16, OY - 62, OX + CW + 16, OY - 46]);
  block('moat_n', [OX - 16, OY + CN, OX + CW + 16, OY + CN + 16]);
  block('moat_w', [OX - 16, OY - 46, OX, OY + CN]);
  block('moat_e', [OX + CW, OY - 46, OX + CW + 16, OY + CN]);
  block('bian_w', [OX, OY + 96, OX + CX - 16, OY + 114]);
  block('bian_e', [OX + CX + 16, OY + 96, OX + CW, OY + 114]);
  block('genyue_pond', [OX + 18, OY + 160, OX + 58, OY + 186]);
  block('genyue_pond2', [OX + 62, OY + 174, OX + 76, OY + 186]);
  block('hz_pond_ne', [OX + 252, OY + 164, OX + 264, OY + 174]);
  block('hz_pond_n', [OX + 136, OY + 176, OX + 148, OY + 186]);
  block('hz_pond_w', [OX + 98, OY + 178, OX + 110, OY + 188]);
  /* 南墙门洞：aq_wall_gate 开口 13–17 @ putX → 中心 putX+15 = CX */
  const gatePut = CX - 15;
  block('wall_s_w', [OX, OY - 8, OX + gatePut + 13, OY]);
  block('wall_s_e', [OX + gatePut + 17, OY - 8, OX + CW, OY]);
  block('wall_n', [OX, OY + CN - 8, OX + CW, OY + CN]);
  block('wall_w', [OX, OY, OX + 8, OY + CN - 8]);
  block('wall_e', [OX + CW - 8, OY, OX + CW, OY + CN - 8]);
  /* Site197 小池碰撞/水区（接动态水） */
  if (_scenicPonds && _scenicPonds.waterRects) {
    _scenicPonds.waterRects.forEach((r, i) => block('pond_' + i, r));
  }

  N.solids = (N.solids || []).concat(solids);
  D.colliders = (D.colliders || []).concat(colliders);
  N.water = (N.water || []).concat([
    [1770, BY0, OX - 16, BY1],
    [OX - 16, OY - 62, OX + CW + 16, OY - 46],
    [OX - 16, OY + CN, OX + CW + 16, OY + CN + 16],
    [OX - 16, OY - 46, OX, OY + CN],
    [OX + CW, OY - 46, OX + CW + 16, OY + CN],
    [OX, OY + 96, OX + CW, OY + 114],
    [OX + 18, OY + 160, OX + 58, OY + 186],
    [OX + 62, OY + 174, OX + 76, OY + 186],
    [OX + 252, OY + 164, OX + 264, OY + 174],
    [OX + 136, OY + 176, OX + 148, OY + 186],
    [OX + 98, OY + 178, OX + 110, OY + 188],
  ]);
  if (_scenicPonds && _scenicPonds.waterRects && _scenicPonds.waterRects.length) {
    N.water = N.water.concat(_scenicPonds.waterRects.map((r) => r.slice()));
  }

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
  /* 井槐里式拼装：壳 + 台基/立面/披檐/匾幌/竖招/灯笼。Site197 门面再密一档 + facade-detail。 */
  function putShop(id, kind, lx, ly) {
    const k = kind;
    const bay = Math.abs(Math.floor(lx * 10 + ly)) % 4;
    put(id, 'aq_shop_' + k, lx, ly);                         // depth shell + roof
    put(id + '_base', 'aq_f_base', lx + 0.2, ly);            // 台基 strip
    put(id + '_gable', 'aq_f_gable', lx - 0.05, ly);          // 硬山墀头
    if (k === 'dangpu') {
      put(id + '_w0', 'aq_f_wall', lx + 0.4, ly, { variant: 'dang' });
      /* Site203：隔扇变体含步步锦 */
      const doorV = (['grid', 'carved', 'bubujin', 'ban', 'diamond'])[bay % 5];
      put(id + '_d1', 'aq_f_door', lx + 0.4 + BW, ly, { variant: doorV });
    } else {
      put(id + '_s0', 'aq_f_shop', lx + 0.4, ly, { variant: k });
      /* Site203：花窗/槛窗/万字轮换 */
      const winV = (['grid', 'huachuang', 'wanzi', 'kanchuang', 'bubujin', 'diamond'])[bay % 6];
      /* second bay: alternate open shop / lattice window for rhythm */
      if (bay % 2 === 0) put(id + '_s1', 'aq_f_shop', lx + 0.4 + BW, ly, { variant: k });
      else put(id + '_w1', 'aq_f_window', lx + 0.4 + BW, ly, { variant: winV });
    }
    put(id + '_awn0', 'aq_f_awning', lx + 0.4, ly);
    put(id + '_awn1', 'aq_f_awning', lx + 0.4 + BW, ly);
    put(id + '_plq', 'aq_f_plaque', lx + 3.5, ly, { variant: k });
    put(id + '_ban', 'aq_f_banner', lx + 6.8, ly, { variant: k });
    put(id + '_vsg', 'aq_f_vsign', lx + 0.15, ly, { variant: k });  // 竖招
    put(id + '_col', 'aq_f_column', lx + 3.5, ly);
    /* Site197 facade-detail：檐下斗拱点缀 */
    put(id + '_dg', 'aq_f_dougong', lx + 1.8, ly, { variant: bay === 0 ? 'large' : 'bay' });
    put(id + '_lan', 'aq_lanterns', lx + 1.0, ly - 0.4);
    put(id + '_lan2', 'aq_lanterns', lx + 5.6, ly - 0.35);           // 第二串灯笼
    /* 门前点景：桌凳/花坛/招幌（街巷密实，非庭院） */
    if (bay % 3 === 0) put(id + '_tbl', 'aq_table', lx + 2.2, ly - 1.1, { variant: (bay % 2 ? 'wine' : 'tea') });
    if (bay % 2 === 0) put(id + '_pl', 'aq_planter', lx + 0.6, ly - 0.9, { variant: (['a', 'b', 'c'])[bay % 3] });
    if (bay === 1 || bay === 3) put(id + '_bnf', 'aq_banner', lx + 7.2, ly - 0.6, { variant: (['tea', 'food', 'cloth', 'wine'])[bay] });
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
  /* Site197：街巷再加密一排 + 夹缝店 */
  shopRow('row_x_w', 16, 41, 5, 6.9);
  shopRow('row_x_e', 170, 41, 5, 6.9);
  shopRow('row_y_w', 16, 56, 4, 6.9);
  shopRow('row_y_e', 180, 56, 4, 6.9);

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

  /* Site202：御街两侧排水沟 + 路牙（少改布局，只贴边线） */
  for (let y = 14; y <= 86; y += 8) {
    put('dr_l' + y, 'aq_drain', CX - 12.5, y, { variant: 'ns' });
    put('dr_r' + y, 'aq_drain', CX + 12.5, y, { variant: 'ns' });
    put('cb_l' + y, 'aq_curb', CX - 13.4, y, { variant: 'ns' });
    put('cb_r' + y, 'aq_curb', CX + 13.4, y, { variant: 'ns' });
  }
  /* 南广场边线排水沟 / 路牙 */
  for (let x = 100; x <= 200; x += 12) {
    put('dr_ps' + x, 'aq_drain', x, -118, { variant: 'ew' });
    put('cb_ps' + x, 'aq_curb', x, -119.2, { variant: 'ew' });
    put('dr_pn' + x, 'aq_drain', x, -74, { variant: 'ew' });
    put('cb_pn' + x, 'aq_curb', x, -72.8, { variant: 'ew' });
  }
  for (let y = -112; y <= -80; y += 10) {
    put('dr_pw' + y, 'aq_drain', 86, y, { variant: 'ns' });
    put('cb_pw' + y, 'aq_curb', 84.8, y, { variant: 'ns' });
    put('dr_pe' + y, 'aq_drain', 214, y, { variant: 'ns' });
    put('cb_pe' + y, 'aq_curb', 215.2, y, { variant: 'ns' });
  }

  /* —— 汴河：望川楼、茶坊、虹桥、柳、船、码头 —— */
  put('jiulou', 'aq_jiulou', CX + 18, 78, { name: '望川楼（名称未经确认）' });
  put('chafang', 'aq_chafang', 40, 82, { name: '清风茶坊（名称未经确认）' });
  /* Site195：虹桥改 ns 跨汴河——墩落南岸(~y89–93)/北岸(~y117–121)，桥面跨水，勿再 ew 横躺南岸泡水中 */
  put('hongqiao', 'aq_hongqiao', CX - 4, 91, { variant: 'ns', name: '虹桥（名称未经确认）' });
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

  /* —— Site197 街巷再加密：横巷灯笼串 / 招幌 / 摊位 / 桌凳 / 花坛（不改府邸庭院 put） —— */
  /* 东西市横巷灯笼串（比参照更密：约每 10–12 步一串） */
  for (const y of [22, 30, 38, 46, 54, 62, 70, 76, 84]) {
    for (let x = 28; x <= 130; x += 14) put('lan_sw_' + y + '_' + x, 'aq_lanterns', x, y);
    for (let x = 170; x <= 270; x += 14) put('lan_se_' + y + '_' + x, 'aq_lanterns', x, y);
  }
  /* 横巷招幌（贴店铺外缘，茶药布酒食轮换） */
  const alleyBanners = [
    [24, 20, 'tea'], [48, 20, 'med'], [72, 20, 'cloth'], [96, 20, 'food'], [120, 20, 'wine'],
    [174, 20, 'wine'], [198, 20, 'food'], [222, 20, 'tea'], [246, 20, 'cloth'], [268, 20, 'med'],
    [24, 36, 'food'], [60, 36, 'wine'], [96, 36, 'tea'], [120, 36, 'cloth'],
    [174, 36, 'med'], [210, 36, 'food'], [246, 36, 'wine'], [268, 36, 'tea'],
    [24, 52, 'cloth'], [56, 52, 'food'], [88, 52, 'wine'], [120, 52, 'tea'],
    [174, 52, 'tea'], [206, 52, 'cloth'], [238, 52, 'food'], [268, 52, 'wine'],
    [24, 68, 'wine'], [64, 68, 'tea'], [104, 68, 'med'], [120, 68, 'food'],
    [174, 68, 'cloth'], [214, 68, 'wine'], [248, 68, 'tea'], [268, 68, 'food'],
    [28, 82, 'food'], [70, 82, 'cloth'], [110, 82, 'wine'],
    [190, 82, 'tea'], [230, 82, 'med'], [266, 82, 'food'],
  ];
  alleyBanners.forEach(([x, y, v], i) => put('bn_al_' + i, 'aq_banner', x, y, { variant: v }));
  /* 横巷摊位再塞一档（水果/面/玩具交错，不挡御街中线） */
  const alleyStalls = [
    [32, 26, 'fruit'], [52, 28, 'noodle'], [76, 26, 'toys'], [100, 28, 'fruit'], [124, 26, 'noodle'],
    [178, 26, 'toys'], [202, 28, 'fruit'], [226, 26, 'noodle'], [250, 28, 'toys'], [266, 26, 'fruit'],
    [36, 42, 'noodle'], [68, 44, 'toys'], [100, 42, 'fruit'], [124, 44, 'noodle'],
    [182, 42, 'fruit'], [214, 44, 'toys'], [246, 42, 'noodle'], [266, 44, 'fruit'],
    [40, 58, 'toys'], [72, 60, 'fruit'], [104, 58, 'noodle'], [126, 60, 'toys'],
    [186, 58, 'noodle'], [218, 60, 'fruit'], [250, 58, 'toys'], [266, 60, 'noodle'],
    [44, 74, 'fruit'], [80, 76, 'noodle'], [112, 74, 'toys'],
    [194, 74, 'fruit'], [226, 76, 'noodle'], [258, 74, 'toys'],
  ];
  alleyStalls.forEach(([x, y, v], i) => put('stall_al_' + i, 'aq_stall', x, y, { variant: v }));
  /* 横巷桌凳与花坛簇 */
  for (const [x, y, v] of [
    [44, 24, 'tea'], [88, 24, 'wine'], [200, 24, 'tea'], [244, 24, 'wine'],
    [52, 40, 'tea'], [108, 40, 'wine'], [190, 40, 'tea'], [236, 40, 'wine'],
    [60, 56, 'tea'], [116, 56, 'wine'], [198, 56, 'tea'], [252, 56, 'wine'],
    [68, 72, 'tea'], [108, 72, 'wine'], [210, 72, 'tea'], [248, 72, 'wine'],
  ]) put('tbl_al_' + x + '_' + y, 'aq_table', x, y, { variant: v });
  for (const [x, y, v] of [
    [30, 24, 'a'], [90, 28, 'b'], [126, 24, 'c'], [178, 28, 'a'], [230, 24, 'b'], [270, 28, 'c'],
    [34, 40, 'b'], [94, 44, 'c'], [122, 40, 'a'], [186, 44, 'b'], [242, 40, 'c'], [270, 44, 'a'],
    [38, 56, 'c'], [98, 60, 'a'], [128, 56, 'b'], [190, 60, 'c'], [246, 56, 'a'], [270, 60, 'b'],
    [42, 72, 'a'], [102, 76, 'b'], [194, 72, 'c'], [254, 76, 'a'],
  ]) put('pl_al_' + x + '_' + y, 'aq_planter', x, y, { variant: v });
  /* 御街再密：中线两侧交错小摊与灯笼（填参照图偏疏的空） */
  for (let y = 14; y <= 86; y += 6) {
    put('lan_yj_l' + y, 'aq_lanterns', CX - 14, y);
    put('lan_yj_r' + y, 'aq_lanterns', CX + 14, y);
  }
  for (const [dx, y, v] of [
    [-6, 14, 'fruit'], [6, 20, 'noodle'], [-5, 28, 'toys'], [5, 36, 'fruit'],
    [-6, 44, 'noodle'], [6, 52, 'toys'], [-5, 60, 'fruit'], [5, 68, 'noodle'],
    [-6, 76, 'toys'], [6, 84, 'fruit'],
  ]) put('stall_yj2_' + y, 'aq_stall', CX + dx, y, { variant: v });
  /* 南广场再补招幌灯笼摊（入口热闹感） */
  put('lanterns_s3', 'aq_lanterns', 140, -100);
  put('lanterns_s4', 'aq_lanterns', 160, -92);
  put('stall_s3', 'aq_stall', 108, -104, { variant: 'noodle' });
  put('stall_s4', 'aq_stall', 188, -104, { variant: 'fruit' });
  put('bn_s3', 'aq_banner', 108, -108, { variant: 'wine' });
  put('bn_s4', 'aq_banner', 188, -108, { variant: 'cloth' });
  put('tbl_s3', 'aq_table', 140, -114, { variant: 'tea' });
  put('pl_s4', 'aq_planter', 155, -118, { variant: 'a' });
  put('pl_s5', 'aq_planter', 115, -120, { variant: 'b' });
  /* Site199：南薰门外南广场 / 瓮城口市集摊位再加密（参照 layout refs 更密；不改勾栏/宝相寺大布局） */
  for (const [x, y, v] of [
    /* 南广场外圈 */
    [96, -112, 'fruit'], [128, -116, 'noodle'], [152, -116, 'toys'], [172, -112, 'fruit'],
    [204, -112, 'noodle'], [88, -100, 'toys'], [210, -100, 'fruit'],
    /* 南广场中带填缝 */
    [102, -92, 'noodle'], [160, -98, 'fruit'], [192, -92, 'toys'], [136, -108, 'toys'],
    /* 瓮城口两侧（闸机西/东翼，贴硬地不进护城河） */
    [112, -84, 'fruit'], [122, -80, 'noodle'], [158, -80, 'toys'], [168, -84, 'fruit'],
    [100, -76, 'toys'], [180, -76, 'noodle'], [190, -82, 'fruit'], [106, -88, 'fruit'],
    [174, -88, 'noodle'], [146, -74, 'toys'],
  ]) put('stall_s199_' + x + '_' + y, 'aq_stall', x, y, { variant: v });
  for (const [x, y, v] of [
    [96, -116, 'food'], [128, -120, 'tea'], [160, -120, 'wine'], [192, -116, 'cloth'],
    [112, -88, 'food'], [168, -88, 'tea'], [100, -80, 'wine'], [180, -80, 'cloth'],
    [146, -78, 'med'], [204, -108, 'food'],
  ]) put('bn_s199_' + x + '_' + y, 'aq_banner', x, y, { variant: v });
  for (const [x, y] of [
    [104, -108], [120, -100], [156, -104], [184, -108], [200, -96],
    [116, -76], [164, -76], [140, -84], [172, -80], [108, -96],
  ]) put('lan_s199_' + x + '_' + y, 'aq_lanterns', x, y);
  for (const [x, y, v] of [
    [130, -120, 'tea'], [148, -118, 'wine'], [170, -118, 'tea'],
    [118, -86, 'wine'], [162, -86, 'tea'], [154, -76, 'wine'],
  ]) put('tbl_s199_' + x + '_' + y, 'aq_table', x, y, { variant: v });
  for (const [x, y, v] of [
    [90, -116, 'a'], [138, -122, 'b'], [182, -116, 'c'], [208, -108, 'a'],
    [114, -78, 'b'], [176, -78, 'c'], [150, -82, 'a'],
  ]) put('pl_s199_' + x + '_' + y, 'aq_planter', x, y, { variant: v });
  put('cart_s199a', 'aq_cart', 142, -104);
  put('cart_s199b', 'aq_cart', 186, -88);
  put('cart_s199c', 'aq_cart', 110, -92);
  put('lamp_s199a', 'aq_lamppost', 98, -86);
  put('lamp_s199b', 'aq_lamppost', 202, -86);
  put('lamp_s199c', 'aq_lamppost', 150, -122);
  put('lion_s199l', 'aq_lion', 124, -74, { variant: 'm' });
  put('lion_s199r', 'aq_lion', 176, -74, { variant: 'f' });
  /* 汴河南岸河市摊幌再密（贴岸不挡虹桥步行带） */
  for (const [x, y, v] of [
    [28, 90, 'fruit'], [56, 88, 'noodle'], [84, 90, 'toys'], [112, 88, 'fruit'],
    [168, 88, 'noodle'], [196, 90, 'toys'], [224, 88, 'fruit'], [252, 90, 'noodle'],
  ]) put('stall_rs_' + x, 'aq_stall', x, y, { variant: v });
  for (const [x, y, v] of [
    [32, 86, 'tea'], [80, 86, 'food'], [200, 86, 'wine'], [248, 86, 'cloth'],
  ]) put('bn_rs_' + x, 'aq_banner', x, y, { variant: v });
  for (let x = 36; x <= 260; x += 20) put('lan_rs_' + x, 'aq_lanterns', x, 86);
  /* 北市集外围招幌灯笼（围着市集，不改梦华府/四合院 put） */
  for (const [x, y, v] of [
    [114, 136, 'food'], [140, 136, 'tea'], [166, 136, 'wine'], [192, 136, 'cloth'], [218, 136, 'med'],
  ]) put('bn_nm_' + x, 'aq_banner', x, y, { variant: v });
  for (let x = 110; x <= 220; x += 12) put('lan_nm_' + x, 'aq_lanterns', x, 134);
  for (const [x, y, v] of [
    [126, 148, 'tea'], [154, 152, 'wine'], [182, 148, 'tea'], [206, 150, 'wine'],
  ]) put('tbl_nm_' + x, 'aq_table', x, y, { variant: v });

  /* Site197：植物/水系点景加密（松柳芦苇假山竹丛；岸线长条保留；小池已 paint） */
  let _scenicCounts = null;
  if (root.SongchengScenic && typeof root.SongchengScenic.place === 'function') {
    _scenicCounts = root.SongchengScenic.place(put, { OX, OY, CX, CW, CN });
  }
  let _dockCounts = null;
  if (root.SongchengDock && typeof root.SongchengDock.place === 'function') {
    _dockCounts = root.SongchengDock.place(put, { OX, OY, CX, CW, CN });
  }

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
  put('huai_n1', 'aq_huai', 88, 190);
  put('huai_n2', 'aq_huai', 210, 175);
  put('huai_n3', 'aq_huai', 100, 190);
  put('lion_n1', 'aq_lion', 78, 142, { variant: 'm' });
  put('lion_n2', 'aq_lion', 98, 142, { variant: 'f' });
  put('tbl_n1', 'aq_table', 150, 146, { variant: 'tea' });
  put('tbl_n2', 'aq_table', 170, 150, { variant: 'wine' });
  put('bn_n1', 'aq_banner', 126, 138, { variant: 'food' });
  put('bn_n2', 'aq_banner', 190, 138, { variant: 'wine' });
  put('pl_n1', 'aq_planter', 84, 136, { variant: 'a' });
  put('pl_n2', 'aq_planter', 108, 136, { variant: 'b' });
  put('pl_n3', 'aq_planter', 160, 136, { variant: 'c' });
  put('pl_n4', 'aq_planter', 90, 160, { variant: 'a' });
  put('pl_n5', 'aq_planter', 220, 160, { variant: 'b' });
  put('lion_n3', 'aq_lion', 168, 146, { variant: 'm' });
  put('lion_n4', 'aq_lion', 188, 146, { variant: 'f' });

  /* 西北/东北角：店 + 四合院填满边角空地（麻雀虽小五脏俱全） */
  shopRow('corner_nw', 16, 120, 4, 6.9);
  shopRow('corner_ne', 200, 120, 4, 6.9);
  shopRow('corner_n2', 100, 128, 3, 6.9);
  /* Site197：艮岳苑风景区（池塘·假山·柳·亭·廊）——西墙内、汴河北，避让衙门公堂 */
  put('genyue_ting', 'aq_ting', 38, 172, { variant: 'sq', name: '艮岳苑亭（名称未经确认）' });
  put('genyue_ting2', 'aq_ting', 68, 178, { variant: 'hex', name: '艮岳水榭（名称未经确认）' });
  put('genyue_rock_a', 'aq_rockery', 22, 164, { variant: 'a' });
  put('genyue_rock_b', 'aq_rockery', 52, 162, { variant: 'b' });
  put('genyue_rock_c', 'aq_rockery', 54, 182, { variant: 'c' });
  put('genyue_rock_d', 'aq_rockery', 28, 184, { variant: 'b' });
  put('genyue_rock_e', 'aq_rockery', 74, 172, { variant: 'a' });
  put('genyue_lang_s', 'aq_lang', 16, 154, { variant: 'ew' });
  put('genyue_lang_e', 'aq_lang', 78, 160, { variant: 'ns' });
  put('genyue_lang_n', 'aq_lang', 20, 188, { variant: 'ew' });
  put('genyue_lang_c', 'aq_lang', 60, 184, { variant: 'corner' });
  for (const [x, y] of [
    [16, 162], [16, 176], [16, 188], [30, 156], [48, 156], [64, 158],
    [80, 166], [80, 180], [44, 188], [60, 190], [34, 178], [50, 174],
  ]) put('willow_gy_' + x + '_' + y, 'aq_willow', x, y, { variant: (x + y) % 2 ? 'a' : 'b' });
  for (const [x, y, v] of [
    [20, 170, 'a'], [44, 160, 'b'], [56, 188, 'c'], [74, 178, 'a'], [32, 190, 'b'],
  ]) put('pl_gy_' + x, 'aq_planter', x, y, { variant: v });
  put('bn_gy1', 'aq_banner', 42, 154, { variant: 'tea' });
  put('lp_gy1', 'aq_lamppost', 24, 158);
  put('lp_gy2', 'aq_lamppost', 70, 158);
  put('lanterns_gy1', 'aq_lanterns', 36, 158);
  put('lanterns_gy2', 'aq_lanterns', 66, 186);

  /* Site197：豪宅院内唐宋庭院（小池·假山·花木·曲廊）×3 */
  put('haozhai_ne', 'aq_haozhai', 242, 152, { name: '东北豪宅（名称未经确认）' });
  put('hz_ne_rock', 'aq_rockery', 254, 166, { variant: 'c' });
  put('hz_ne_lang', 'aq_lang', 248, 176, { variant: 'ew' });
  put('hz_ne_ting', 'aq_ting', 258, 178, { variant: 'sq' });
  put('hz_ne_willow', 'aq_willow', 250, 162, { variant: 'b' });
  put('hz_ne_pl', 'aq_planter', 260, 170, { variant: 'a' });

  put('haozhai_n', 'aq_haozhai', 126, 166, { name: '北宅府邸（名称未经确认）' });
  put('hz_n_rock', 'aq_rockery', 138, 178, { variant: 'a' });
  put('hz_n_lang', 'aq_lang', 132, 186, { variant: 'ew' });
  put('hz_n_willow', 'aq_willow', 146, 180, { variant: 'a' });
  put('hz_n_pl', 'aq_planter', 134, 174, { variant: 'c' });

  put('haozhai_w', 'aq_haozhai', 88, 168, { name: '御街西宅（名称未经确认）' });
  put('hz_w_rock', 'aq_rockery', 100, 180, { variant: 'b' });
  put('hz_w_lang', 'aq_lang', 94, 188, { variant: 'ew' });
  put('hz_w_willow', 'aq_willow', 108, 176, { variant: 'a' });
  put('hz_w_pl', 'aq_planter', 96, 174, { variant: 'b' });

  /* 保留一处普通四合院（东北角再塞） */
  put('siheyuan_e2', 'aq_siheyuan', 268, 128, { name: '民居四合院（名称未经确认）' });
  put('siheyuan_se', 'aq_siheyuan', 268, 70, { name: '民居四合院（名称未经确认）' });
  /* 河市北岸再塞摊幌，消灭汴河北空带 */
  for (const [x, y, v] of [
    [50, 118, 'fruit'], [70, 120, 'noodle'], [90, 118, 'toys'],
    [180, 118, 'fruit'], [210, 120, 'noodle'], [240, 118, 'toys'],
  ]) put('stall_rb_' + x, 'aq_stall', x, y, { variant: v });
  for (let x = 40; x <= 260; x += 18) put('lp_rb' + x, 'aq_lamppost', x, 116);
  for (let x = 48; x <= 250; x += 24) put('lanterns_rb' + x, 'aq_lanterns', x, 122);
  /* Site197：御街/巷再塞摊幌桌凳 */
  for (const [x, y, v] of [
    [28, 28, 'fruit'], [80, 42, 'noodle'], [110, 58, 'toys'],
    [190, 28, 'fruit'], [230, 42, 'toys'], [260, 70, 'noodle'],
    [55, 72, 'fruit'], [250, 80, 'toys'],
  ]) put('stall_197_' + x + '_' + y, 'aq_stall', x, y, { variant: v });
  put('tbl_197a', 'aq_table', CX - 6, 44, { variant: 'tea' });
  put('tbl_197b', 'aq_table', CX + 6, 60, { variant: 'wine' });
  put('cart_197', 'aq_cart', 90, 50);
  put('bn_197a', 'aq_banner', 70, 40, { variant: 'cloth' });
  put('bn_197b', 'aq_banner', 210, 40, { variant: 'med' });

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
  /* 虹桥步行带：ns 桥面 local X0–8 × Y−4–28 @ put(CX-4,91) */
  const HONGQIAO_RECT = [OX + CX - 4, OY + 91 - 4, OX + CX + 4, OY + 91 + 28];
  N.expansionSongcheng = Object.assign(N.expansionSongcheng || {}, {
    unconfirmed: true,
    teleport: true,
    bridge: HONGQIAO_RECT.slice(),
    names: {
      district: '鹰山宋城',
      gate: '南薰门',
      street: '御街',
      river: '汴河',
      bridge: '虹桥',
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
        /^aq_(wall_gate|jiulou|chafang|yamen|gongtang|shushu|shop_|paifang|ticket|hongqiao|siheyuan|corner|goulan|siyuan|haozhai|ting|lang|rockery)/.test(o.type)
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
    site197Street: {
      unconfirmed: true,
      densify: true,
      focus: 'street_shop_props',
      props: list.filter((o) => /aq_(lanterns|lamppost|stall|banner|table|planter|lion)/.test(o.type)).length,
      facadeModules: list.filter((o) => /^aq_f_/.test(o.type)).length,
      shops: list.filter((o) => /^aq_shop_/.test(o.type)).length,
      stalls: list.filter((o) => o.type === 'aq_stall').length,
      banners: list.filter((o) => o.type === 'aq_banner' || o.type === 'aq_f_banner' || o.type === 'aq_f_vsign').length,
      lanterns: list.filter((o) => o.type === 'aq_lanterns' || o.type === 'aq_lamppost').length,
      denserThan194: true,
      kitbash: true,
      avoidGenyueCore: true,
    },
    site197FacadeDetail: {
      unconfirmed: true,
      focus: 'facade_atlas_parts',
      modules: ['win_wanzi_S', 'door_geshan_carved_S', 'door_ban_S', 'threshold_S', 'tile_ridge_S', 'dougong_large'],
      facadeDougong: list.filter((o) => o.type === 'aq_f_dougong').length,
      facadeDoors: list.filter((o) => o.type === 'aq_f_door').length,
      facadeWindows: list.filter((o) => o.type === 'aq_f_window').length,
      kitbash: true,
      avoidGenyueCore: true,
      noSchoolVillageBank: true,
    },
    site197Plants: {
      unconfirmed: true,
      densify: true,
      ponds: (_scenicPonds && _scenicPonds.waterRects && _scenicPonds.waterRects.length) || 0,
      counts: _scenicCounts || null,
      pines: list.filter((o) => o.type === 'aq_pine').length,
      rocks: list.filter((o) => o.type === 'aq_rock').length,
      bamboo: list.filter((o) => o.type === 'aq_bamboo').length,
      willows: list.filter((o) => o.type === 'aq_willow').length,
      reeds: list.filter((o) => o.type === 'aq_reed').length,
      kinds: ['pine', 'willow', 'reed', 'rock', 'bamboo', 'planter', 'pond'],
    },
    site197: {
      unconfirmed: true,
      genyue: true,
      courtyards: true,
      dynamicPonds: true,
      hongqiaoNs: true,
      footprint: [CW, CN],
      ting: list.filter((o) => o.type === 'aq_ting').length,
      lang: list.filter((o) => o.type === 'aq_lang').length,
      rockery: list.filter((o) => o.type === 'aq_rockery').length,
      haozhai: list.filter((o) => o.type === 'aq_haozhai').length,
      shops: list.filter((o) => /^aq_shop_/.test(o.type)).length,
      props: list.length,
      ponds: 5,
    },
    site197Dock: {
      unconfirmed: true,
      densify: true,
      focus: 'bian_dock_boats_cargo',
      counts: _dockCounts || null,
      docks: list.filter((o) => o.type === 'aq_dock').length,
      boats: list.filter((o) => o.type === 'aq_boat').length,
      skiffs: list.filter((o) => o.type === 'aq_skiff').length,
      cargos: list.filter((o) => o.type === 'aq_cargo').length,
      carts: list.filter((o) => o.type === 'aq_cart').length,
      denserThan194: true,
      keepDynamicWater: true,
      avoidGenyueCore: true,
      kinds: ['dock', 'boat', 'skiff', 'cargo', 'cart'],
    },
    site198WallMerlon: {
      unconfirmed: true,
      focus: 'nanxun_wall_merlon_parapet_brick',
      modules: ['city_brick_S', 'city_brick_W', 'city_stone_S', 'merlon_S', 'crenel_S', 'parapet_S', 'walk_top'],
      walls: list.filter((o) => o.type === 'aq_city_wall').length,
      gates: list.filter((o) => o.type === 'aq_wall_gate').length,
      corners: list.filter((o) => o.type === 'aq_corner_tower').length,
      kitbash: true,
      avoidGenyueCore: true,
      noSchoolVillageBank: true,
      noGoulanBaoxiangLayout: true,
    },
    site198Roof: {
      unconfirmed: true,
      focus: 'roof_ridge_wadang_chiwen_drip',
      modules: ['tile_wadang_S', 'tile_drip_S', 'chiwen_S', 'chiwen_flip_S', 'tile_ridge_S', 'tile_eave_S'],
      denseShopRoof: true,
      densePublicRoof: true,
      kitbash: true,
      avoidGenyueCore: true,
      noSchoolVillageBank: true,
      noGoulanSiyuanLayout: true,
      shops: list.filter((o) => /^aq_shop_/.test(o.type)).length,
      facadeRoofs: list.filter((o) => o.type === 'aq_f_roof').length,
    },
    site199NanxunPlaza: {
      unconfirmed: true,
      densify: true,
      focus: 'nanxun_south_plaza_wengcheng_market',
      plazaStalls: list.filter((o) => o.type === 'aq_stall'
        && o.x >= OX + 80 && o.x <= OX + 220 && o.y >= OY - 122 && o.y <= OY - 70).length,
      stalls: list.filter((o) => o.type === 'aq_stall').length,
      banners: list.filter((o) => o.type === 'aq_banner'
        && o.x >= OX + 80 && o.x <= OX + 220 && o.y >= OY - 122 && o.y <= OY - 70).length,
      lanterns: list.filter((o) => (o.type === 'aq_lanterns' || o.type === 'aq_lamppost')
        && o.x >= OX + 80 && o.x <= OX + 220 && o.y >= OY - 122 && o.y <= OY - 70).length,
      tables: list.filter((o) => o.type === 'aq_table'
        && o.x >= OX + 80 && o.x <= OX + 220 && o.y >= OY - 122 && o.y <= OY - 70).length,
      planters: list.filter((o) => o.type === 'aq_planter'
        && o.x >= OX + 80 && o.x <= OX + 220 && o.y >= OY - 122 && o.y <= OY - 70).length,
      denserThan194: true,
      keepDynamicWater: true,
      keepDockDensify: true,
      keepGenyue: true,
      keepWallMerlon: true,
      keepRoof: true,
      avoidGenyueCore: true,
      noSchoolVillageBank: true,
      noGoulanBaoxiangLayout: true,
      kinds: ['stall', 'banner', 'lanterns', 'table', 'planter', 'cart', 'lion'],
    },
    site200LanternGlow: {
      unconfirmed: true,
      focus: 'lantern_banner_dusk_night_glow',
      lanternGlow: true,
      bannerGlow: true,
      warmHalo: true,
      groundWash: true,
      duskGradeHook: true,
      kitbash: true,
      avoidGenyueCore: true,
      noSchoolVillageBank: true,
      noGoulanSiyuanLayout: true,
      lanterns: list.filter((o) => o.type === 'aq_lanterns' || o.type === 'aq_lamppost').length,
      banners: list.filter((o) => o.type === 'aq_f_banner' || o.type === 'aq_banner').length,
      awnings: list.filter((o) => o.type === 'aq_f_awning').length,
      vsigns: list.filter((o) => o.type === 'aq_f_vsign').length,
    },
    site201RiverLamps: {
      unconfirmed: true,
      focus: 'bian_dock_boat_lamps_dusk_fishing_fires',
      reuseLanternGlow: true,
      boatLampGlow: true,
      dockLampGlow: true,
      waterReflect: true,
      skiffLampGlow: true,
      cargoLampGlow: true,
      keepDockDensify: true,
      keepDynamicWater: true,
      duskGradeHook: true,
      avoidGenyueCore: true,
      noSchoolVillageBank: true,
      noGoulanSiyuanLayout: true,
      docks: list.filter((o) => o.type === 'aq_dock').length,
      boats: list.filter((o) => o.type === 'aq_boat').length,
      skiffs: list.filter((o) => o.type === 'aq_skiff').length,
      cargos: list.filter((o) => o.type === 'aq_cargo').length,
    },
    site201Signboards: {
      unconfirmed: true,
      focus: 'shop_signboard_plaque_banner_frame_refine',
      plaqueWood: true,
      vsignBoard: true,
      bannerCream: true,
      kitbash: true,
      keepRiverLamps: true,
      keepLanternGlow: true,
      avoidGenyueCore: true,
      noSchoolVillageBank: true,
      noGoulanSiyuanLayout: true,
      plaques: list.filter((o) => o.type === 'aq_f_plaque').length,
      banners: list.filter((o) => o.type === 'aq_f_banner' || o.type === 'aq_banner').length,
      vsigns: list.filter((o) => o.type === 'aq_f_vsign').length,
      shops: list.filter((o) => /^aq_shop_/.test(o.type)).length,
    },
    site202Paving: {
      unconfirmed: true,
      focus: 'yujie_plaza_paving_drain_curb',
      fangzhuan: true,
      tiaoshi: true,
      xiewen: true,
      drain: true,
      curb: true,
      kitbash: true,
      groundRemap: true,
      modules: ['pave_fangzhuan', 'pave_tiaoshi', 'pave_xiewen', 'drain_gutter', 'curb_stone'],
      keepSignboards: true,
      keepRiverLamps: true,
      keepLanternGlow: true,
      avoidGenyueCore: true,
      noSchoolVillageBank: true,
      noGoulanSiyuanLayout: true,
      drains: list.filter((o) => o.type === 'aq_drain').length,
      curbs: list.filter((o) => o.type === 'aq_curb').length,
      legend: { S: 'aq_gpave:a', P: 'aq_gpave:b', R: 'aq_gpave:c' },
    },
    site203Lattice: {
      unconfirmed: true,
      focus: 'lattice_geshan_huachuang_door_geshan_sill_kanchuang',
      modules: ['lattice_geshan_S', 'window_huachuang_S', 'door_geshan_bubujin_S', 'sill_kanchuang_S'],
      latticeGeshan: true,
      huachuang: true,
      geshanBubujin: true,
      kanchuang: true,
      kitbash: true,
      keepSignboards: true,
      keepRiverLamps: true,
      keepLanternGlow: true,
      keepPaving: true,
      avoidGenyueCore: true,
      noSchoolVillageBank: true,
      noGoulanSiyuanLayout: true,
      facadeDoors: list.filter((o) => o.type === 'aq_f_door').length,
      facadeWindows: list.filter((o) => o.type === 'aq_f_window').length,
      facadeShops: list.filter((o) => o.type === 'aq_f_shop').length,
      shops: list.filter((o) => /^aq_shop_/.test(o.type)).length,
    },
  });
  N.expansionSongcheng.names.genyue = '艮岳苑';
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
    { id: 'aq_genyue', name: '艮岳苑（未经确认）', x: OX + 40, y: OY + 172, cat: 'landmark' },
    { id: 'aq_haozhai_ne', name: '东北豪宅庭院（未经确认）', x: OX + 252, y: OY + 162, cat: 'civic' },
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
  P10.reasons.site195WaterWave = 'Site195：虹桥改 ns 跨汴河（墩落两岸）；宋城 aq_gwater 上加时间驱动动态波纹/流动高光（env.drawGround 叠层），岸线长条可保留；不改月河/学校/渔村/石驳岸。名称未经确认。';
  P10.site197Street = N.expansionSongcheng.site197Street;
  P10.reasons.site197Street = 'Site197 街巷密实：在 Site194 密实基线上再加密古城街巷 put 道具（横巷灯笼串/招幌/摊位/桌凳/花坛）、店铺门面（台基/竖招/双灯笼/门前点景）与 aq_f_* atlas kitbash；不改艮岳/府邸庭院核心 put，不进学校/渔村老街/石驳岸。名称未经确认。';
  P10.site197FacadeDetail = N.expansionSongcheng.site197FacadeDetail;
  P10.reasons.site197FacadeDetail = 'Site197 facade-detail：ancient_art_atlas/parts/facade 细化门窗隔扇斗拱屋脊瓦（万字窗/雕刻隔扇/板门/门槛/脊瓦/大斗拱），aq_f_dougong 模块；尽量少碰大布局；不改艮岳/府邸庭院核心，不进学校/渔村/石驳岸。名称未经确认。';
  P10.site197Plants = N.expansionSongcheng.site197Plants;
  P10.reasons.site197Plants = 'Site197 植物/水系点景加密：苍松·垂柳·芦苇·假山·竹丛 + 院外/风景口袋小池（D/E/I 接动态水）；岸线 aq_reed/aq_bank 长条保留；不改艮岳主体布局与街巷大批 put，不进学校/渔村/石驳岸。名称未经确认。';
  P10.site197 = N.expansionSongcheng.site197;
  P10.reasons.site197 = 'Site197：落地艮岳苑风景区（主/次池塘+假山+柳+亭+曲廊）与 3 处豪宅唐宋庭院（院内小池接动态波纹+假山花木曲廊）；保留 site197Street 街巷 densify 与 site197Plants 植物点景；虹桥 ns 保持；不改学校/渔村/石驳岸/月河。名称未经确认。';
  P10.site197Dock = N.expansionSongcheng.site197Dock;
  P10.reasons.site197Dock = 'Site197 汴河码头/船只/货箱点景加密：木栈码头·漕船·小舫·岸边货堆（木箱/粮袋）·独轮推车贴岸；参照 layout refs 更密一档；动态水面保留；不改艮岳主体布局，不进学校/渔村/石驳岸。名称未经确认。';
  P10.site198WallMerlon = N.expansionSongcheng.site198WallMerlon;
  P10.reasons.site198WallMerlon = 'Site198 wall-merlon：南薰门/城墙垛口·女墙·城砖 atlas kitbash（city_brick/merlon/crenel/parapet/walk_top）；细化 aq_city_wall / aq_wall_gate / aq_corner_tower 贴图拼装；不改勾栏/宝相寺大布局，不进学校/渔村/石驳岸。名称未经确认。';
  P10.site198Roof = N.expansionSongcheng.site198Roof;
  P10.reasons.site198Roof = 'Site198 屋脊/瓦当/鸱吻/屋檐滴水 atlas 细节增强：ancient_art_atlas 新模块 tile_wadang_S/tile_drip_S/chiwen_* + 更密脊瓦/瓦垄；店铺与公建屋顶 densify；少改 town 布局；不改勾栏/宝相寺大布局，不进学校/渔村/石驳岸。名称未经确认。';
  P10.site199NanxunPlaza = N.expansionSongcheng.site199NanxunPlaza;
  P10.reasons.site199NanxunPlaza = 'Site199：南薰门外南广场/瓮城口市集摊位再加密（摊位·招幌·灯笼·桌凳·花坛·推车·石狮）；参照 layout refs 更密一档；保留动态水面、码头 densify、艮岳、site198WallMerlon、site198Roof；不改勾栏/宝相寺大布局，不进学校/渔村/石驳岸。名称未经确认。';
  P10.site200LanternGlow = N.expansionSongcheng.site200LanternGlow;
  P10.reasons.site200LanternGlow = 'Site200 灯笼/幌子黄昏夜景光晕与暖色叠层：lanternGlow 多层暖晕+地面落光、bannerGlow 幌子布面柔光；披檐/竖招/灯笼串/宫灯 emit 增强；挂钩既有黄昏 grade 暖色径向叠层；少改 town 布局；不改勾栏/宝相寺大布局，不进学校/渔村/石驳岸。名称未经确认。';
  P10.site201RiverLamps = N.expansionSongcheng.site201RiverLamps;
  P10.reasons.site201RiverLamps = 'Site201 汴河码头黄昏渔火/船灯点光：复用 Site200 lanternGlow 管线给漕船/码头/小舫/货堆船灯，水面倒影（water）；保留码头 densify 与动态水面；少改 town 布局；不改勾栏/宝相寺大布局，不进学校/渔村/石驳岸。名称未经确认。';
  P10.site201Signboards = N.expansionSongcheng.site201Signboards;
  P10.reasons.site201Signboards = 'Site201 店招/牌匾/幌子文字与边框 atlas 细化：plaque_wood/vsign_board/banner_cream 金边如意·漆木匾·竖招板·奶油布织纹；aq_f_plaque/banner/vsign kitbash；保留 site201RiverLamps 与 site200LanternGlow；少改 town 布局；不改勾栏/宝相寺大布局，不进学校/渔村/石驳岸。名称未经确认。';
  P10.site202Paving = N.expansionSongcheng.site202Paving;
  P10.reasons.site202Paving = 'Site202 御街/广场铺地砖纹·排水沟·路牙：aq_gpave 方砖/条石/席纹替换现代 g_sidewalk；御街条石、南广场席纹装饰带；aq_drain/aq_curb 贴边线 atlas kitbash（pave_fangzhuan/tiaoshi/xiewen/drain_gutter/curb_stone）；保留 site201Signboards/site201RiverLamps/site200LanternGlow；少改 town 布局；不改勾栏/宝相寺大布局，不进学校/渔村/石驳岸。名称未经确认。';
  P10.site203Lattice = N.expansionSongcheng.site203Lattice;
  P10.reasons.site203Lattice = 'Site203 格扇门窗/花窗/隔扇/槛窗 atlas 细化：lattice_geshan_S/window_huachuang_S/door_geshan_bubujin_S/sill_kanchuang_S；aq_f_door/window/shop 门面 stamp 更密；保留 site201Signboards、site201RiverLamps、site200LanternGlow、site202Paving；少改 town 布局；不改勾栏/宝相寺大布局，不进学校/渔村/石驳岸。名称未经确认。';
  /* 地面图例改完后重烘，保证 aq_gwater 立刻进 ground atlas */
  try {
    if (root.SP && root.SP.world && typeof root.SP.world.bakeGround === 'function') root.SP.world.bakeGround();
  } catch (e) { /* boot race: main will bake later */ }

})();
