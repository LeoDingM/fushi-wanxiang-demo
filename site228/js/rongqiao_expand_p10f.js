/* 月河区 · 河东新城街坊 (2026-10-26). 接在生活街之后。
 * 不推东界。分块已经 79，再登记一块就会顶到存档状态袋 80。
 * 可玩东界仍是 1300，地面仍到 1320。南埠南界不动。
 * 填河东大道南侧和北侧的空草坪：菜场、幼儿园、阅览、中高层住宅、沿街小铺、硬地广场。
 * 三条步行缝把澜石南街接到河东大道，再把大道北侧人行道接到堤岸公园。不新开 16 m 次干。
 * 石澜路、银杏路、望月路的路口不断。墙皮仍是浅石材和已有冷玻璃，银杏。
 * 不回榕桥暖砖，不用南埠白幕墙，不新开图集页，不开新室内。
 * 不做 438 m 塔，不加河东公交，不南扩。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10e || D.rongqiaoExpandP10f || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10f = 1;
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
  /* 石澜路东、东澜大厦西：南街接到大道的邻里广场。 */
  paint([622, 106, 686, 128], 'S');
  paint([626, 112, 642, 124], 'G');
  paint([662, 114, 676, 124], 'G');
  paint([648, 80, 656, 132], 'S');
  paint([690, 104, 718, 128], 'S');
  /* 大道北侧两块空地：硬地广场，步行缝接到堤岸。不盖银杏路和望月路。 */
  paint([756, 164, 786, 186], 'S');
  paint([758, 170, 772, 182], 'G');
  paint([759, 158, 767, 192], 'S');
  paint([956, 164, 982, 186], 'S');
  paint([970, 168, 980, 180], 'G');
  paint([958, 158, 966, 192], 'S');

  const SPECS = [
    { id: 'mk', name: '石澜菜场', x: 622, y: 90, nS: 8, nW: 4, F: 2, podium: 1, glass: 'hd_g_sl', kind: 'market',
      signs: [{ face: 'S', floor: 1, bay: 3, text: '石澜菜场' }] },
    { id: 'kg', name: '石澜幼儿园', x: 658, y: 90, nS: 6, nW: 4, F: 3, podium: 1, glass: 'hd_g_cj', kind: 'school',
      signs: [{ face: 'S', floor: 2, bay: 2, text: '石澜幼儿园' }] },
    { id: 'rd', name: '邻里阅览', x: 696, y: 106, nS: 5, nW: 3, F: 2, podium: 1, glass: 'hd_g_yx', kind: 'civic',
      signs: [{ face: 'S', floor: 1, bay: 2, text: '邻里阅览' }] },
    { id: 'lb', name: '澜北居', x: 734, y: 166, nS: 6, nW: 4, F: 11, podium: 2, glass: 'hd_g_yl2', kind: 'home',
      signs: [{ face: 'S', floor: 1, bay: 2, text: '澜北居' }] },
    { id: 'csj', name: '澄石居', x: 794, y: 164, nS: 3, nW: 4, F: 13, podium: 2, glass: 'hd_g_wm', kind: 'home',
      signs: [{ face: 'S', floor: 1, bay: 1, text: '澄石居' }] },
    { id: 'lc', name: '澜北菜店', x: 812, y: 168, nS: 4, nW: 3, F: 2, podium: 1, glass: 'hd_g_hd', kind: 'shop',
      signs: [{ face: 'S', floor: 1, bay: 1, text: '澜北菜店' }] },
    { id: 'ba', name: '北岸里', x: 828, y: 166, nS: 8, nW: 3, F: 9, podium: 2, glass: 'hd_g_dl', kind: 'home',
      signs: [{ face: 'S', floor: 1, bay: 3, text: '北岸里' }] },
    { id: 'yy', name: '银月里', x: 934, y: 166, nS: 6, nW: 4, F: 12, podium: 2, glass: 'hd_g_yx', kind: 'home',
      signs: [{ face: 'S', floor: 1, bay: 2, text: '银月里' }] },
    { id: 'wb', name: '望北居', x: 986, y: 164, nS: 5, nW: 3, F: 7, podium: 2, glass: 'hd_g_yh', kind: 'home',
      signs: [{ face: 'S', floor: 1, bay: 2, text: '望北居' }] },
    { id: 'ys', name: '银月小铺', x: 1006, y: 168, nS: 4, nW: 3, F: 2, podium: 1, glass: 'hd_g_yl', kind: 'shop',
      signs: [{ face: 'S', floor: 1, bay: 1, text: '银月小铺' }] },
  ];
  const feet0 = SPECS.map((s) => [s.x, s.y, s.x + s.nS * 3, s.y + s.nW * 3]);
  const hits = (o, rect, pad) => o.x > rect[0] - pad && o.x < rect[2] + pad && o.y > rect[1] - pad && o.y < rect[3] + pad;
  const propHit = (o) => {
    if (!o) return false;
    const pad = o.type === 'rq_x_tree' ? 2.3 : (o.type === 'p_lamp' || o.type === 'p_hedge' || o.type === 'community_bench' || o.type === 'rq_x_shrub' ? 0.5 : 0);
    if (!pad) return false;
    return feet0.some((f) => hits(o, f, pad));
  };
  for (const ch of Object.values(CH)) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => !propHit(o));
  }

  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10g_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    const key = o.x >= 960 ? 'rqe_p10_e5' : o.x >= 820 ? 'rqe_p10_e4' : o.x >= 620 ? 'rqe_p10_e3' : o.x >= 460 ? 'rqe_p10_e2' : 'rqe_p10_hd';
    const ch = CH[key];
    if (ch && ch.objects) ch.objects.push(o);
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
    const fg = 'rqe_hdg_' + spec.id;
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
  for (const spec of SPECS) build(spec);

  function ginkgo(x, y) { put('gk_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'ginkgo', fade_group: 'rqe_hdg_tree' }); }
  for (const [x, y] of [[630, 118], [670, 120], [636, 124], [746, 182], [774, 176], [820, 182], [944, 182], [970, 176], [996, 180], [688, 122], [1012, 182]]) ginkgo(x, y);
  for (const [x, y] of [[632, 108], [668, 108], [704, 120], [770, 162], [778, 182], [962, 162], [974, 182], [840, 160]]) put('lamp_' + x + '_' + y, 'p_lamp', x, y, { interact: 'lamp' });
  for (const [x, y, rot] of [[634, 122, 0], [666, 122, 0], [774, 172, 0], [970, 174, 2], [708, 122, 0]]) put('bench_' + x + '_' + y, 'community_bench', x, y, { rot });

  const feet = built.map((b) => [b.x0, b.y0, b.x0 + b.W, b.y0 + b.D]);
  const keepProp = (o) => !feet.some((f) => hits(o, f, o.type === 'rq_x_tree' ? 2.3 : 0.5) && (o.type === 'rq_x_tree' || o.type === 'p_lamp' || o.type === 'community_bench' || o.type === 'p_hedge'));
  for (const ch of Object.values(CH)) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => !/^rqp10g_/.test(o.id) || keepProp(o));
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);

  const P = N.expansionP10;
  P.slice = 8;
  P.fill = {
    unconfirmed: true,
    boundsMoved: false,
    east: 1300,
    south: [622, 80, 718, 128],
    north: [[734, 158, 852, 186], [934, 158, 1018, 186]],
    plazas: [[622, 106, 686, 128], [756, 164, 786, 186], [956, 164, 982, 186]],
    lanes: [[648, 80, 656, 132], [759, 158, 767, 192], [958, 158, 966, 192]],
    buildings: built,
  };
  P.reasons.fill = '第八片不推东界。分块已经 79，再加一块会顶到存档状态袋 80，所以这一刀填河东大道南侧和北侧的空草坪。可玩东界仍是 1300，地面仍到 1320。石澜路和东澜大厦之间是石澜菜场（2 层，淡灰高透）、石澜幼儿园（3 层，蓝灰玻璃）和石澜邻里广场，一条 8 m 步行缝把澜石南街接到河东大道。东澜大厦北侧补一间邻里阅览。大道北侧、银杏路以西是澜北居 11 层（米黄石材开窗）、澄石居 13 层（冷青绿）、澜北菜店和北岸里 9 层（装饰艺术石材开窗），澜北广场的步行缝接到堤岸公园。银杏中心和望月路之间是银月里 12 层（淡蓝中透）、望北居 7 层（淡蓝高透）、银月小铺和银月广场，另一条步行缝也接到堤岸。石澜路、银杏路、望月路的车行道不断，没有新的 16 m 次干。都只是外壳，没有新的门。墙皮是浅石材和已有冷玻璃，银杏，不回榕桥暖砖，不用南埠白幕墙，不新开图集页。菜市场仍是唯一的无缝室内。不做 438 m 月河新城塔，不加河东公交，不南扩。名字和尺寸未经确认。';

  N.mapLabels = (N.mapLabels || []).concat([
    { name: '石澜邻里广场', rect: [622, 106, 686, 128], kind: 'park', prio: 1 },
    { name: '石澜菜场', rect: [622, 90, 646, 102], kind: 'market', prio: 1 },
    { name: '石澜幼儿园', rect: [658, 90, 676, 102], kind: 'campus', prio: 1 },
    { name: '澜北广场', rect: [756, 164, 786, 186], kind: 'park', prio: 1 },
    { name: '银月广场', rect: [956, 164, 982, 186], kind: 'park', prio: 1 },
  ]);
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_fill_mk', name: '石澜菜场', x: 634, y: 88, desc: '社区菜场外壳。没有室内。名字未经确认', cat: 'shop' },
    { id: 'p10_fill_kg', name: '石澜幼儿园', x: 667, y: 88, desc: '3 层幼儿园外壳。没有室内。名字未经确认', cat: 'school' },
    { id: 'p10_fill_rd', name: '邻里阅览', x: 703, y: 104, desc: '社区阅览外壳。没有室内。名字未经确认', cat: 'life' },
    { id: 'p10_fill_lb', name: '澜北居', x: 743, y: 163, desc: '11 层住宅。只是外观。名字和层数未经确认', cat: 'home' },
    { id: 'p10_fill_cs', name: '澄石居', x: 798, y: 161, desc: '13 层住宅。只是外观。名字和层数未经确认', cat: 'home' },
    { id: 'p10_fill_lc', name: '澜北菜店', x: 818, y: 165, desc: '沿街小铺。只是外观。名字未经确认', cat: 'shop' },
    { id: 'p10_fill_ba', name: '北岸里', x: 840, y: 163, desc: '9 层住宅。只是外观。名字和层数未经确认', cat: 'home' },
    { id: 'p10_fill_yy', name: '银月里', x: 943, y: 163, desc: '12 层住宅。只是外观。名字和层数未经确认', cat: 'home' },
    { id: 'p10_fill_wb', name: '望北居', x: 993, y: 161, desc: '7 层住宅。只是外观。名字和层数未经确认', cat: 'home' },
    { id: 'p10_fill_ys', name: '银月小铺', x: 1012, y: 165, desc: '沿街小铺。只是外观。名字未经确认', cat: 'shop' },
    { id: 'p10_fill_pl', name: '石澜邻里广场', x: 652, y: 116, desc: '大道南侧硬地广场。名字未经确认', cat: 'park' },
    { id: 'p10_fill_lbpl', name: '澜北广场', x: 770, y: 174, desc: '大道北侧硬地广场。名字未经确认', cat: 'park' },
    { id: 'p10_fill_yypl', name: '银月广场', x: 970, y: 174, desc: '大道北侧硬地广场。名字未经确认', cat: 'park' },
  ]);
})();
