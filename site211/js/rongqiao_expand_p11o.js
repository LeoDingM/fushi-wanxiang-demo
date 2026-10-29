/* 南埠 P11 第十五片 (2026-10-26). 可玩南界从 -1220 再往南 80 m，收到 -1300。地面铺到 -1340。
 * 拆掉第十四片 y -1240 的南篱和南侧封边。槐北街的油漆路面和人行道穿过旧篱，接到新南界。
 * 新收边绿篱在可玩界以南约 20 m（y -1320）。篱外再留约 20 m 硬地，人走不到篱外。
 * 南滩路 12 m，只铺路面。按南汐路北缘 -1172 再隔 80 m，路放在 -1264…-1252。路南到可玩界仍留约 36 m，不必在 ±10–20 里再挪。
 * 路北两栋朝南：滩南居是错翼，24 m 核心从 1 层拉到 14 层，西翼 12 m 只在 4 到 7 层，东翼 12 m 只在 8 到 12 层，两翼不同层、贴着核心，没有同时出现的肩；
 * 南宕楼是扭叠，1 到 6 层只占东侧 24 m，7 到 12 层铺成 48 m 整板，13 到 18 层收到西侧 24 m，顶和底落在相反的两端。
 * 对象前缀用 rqp11s15_。不重复屿南居的鼓腹、南坞楼的侧槽、矶南居的门架、南澳楼的斜折、湄南居的偏悬、南湄楼的肩针、渚南居的倒阶、南濑楼的错移、汀南居的四段细阶、南汀楼的腰洞、湾南居的高低连廊双塔、南湾楼的上层开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔。
 * 不改河东 x 840，不加实时车道，不建菜市场，不建第二小学。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11n || D.rongqiaoExpandP11o || !N.expansionP11) return;
  D.rongqiaoExpandP11o = 1;
  const G = D.ground, BY0 = -1300, GY0 = -1340, X0 = 8, X1 = 176;
  const addR = Math.max(0, Math.round((G.origin[1] - GY0) / G.chunk));
  if (addR) {
    const rows = [];
    for (let r = 0; r < addR; r++) rows.push('K'.repeat(G.cols));
    G.data_south_to_north = rows.concat(G.data_south_to_north);
    G.rows = G.data_south_to_north.length;
    G.origin = [G.origin[0], G.origin[1] - addR * G.chunk];
  }
  D.bounds = Object.assign({}, D.bounds, { y0: Math.min(D.bounds.y0, BY0) });
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
  const roadX = (x) => ((Math.round(x * 3) % 5) < 3 ? 'A' : 'B');
  const roadY = (y) => ((Math.round(y * 3) % 5) < 3 ? 'A' : 'B');
  const south = (D.colliders || []).find((c) => c.id === 'rqp11s14_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11s14_south');
  }
  const old = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p11_s14;
  if (old && old.objects) old.objects = old.objects.filter((o) => !/^rqp11s14_edge_s_/.test(o.id));
  paint([X0, BY0, X1, -1220], 'S');
  paint([16, BY0, 22, -1220], 'S');
  paint([22, BY0, 28, -1220], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -1220], 'S');
  paint([X0, -1262, X1, -1254], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11s15_west', [-240, -1360, X0, -1276]);
  block('rqp11s15_east', [X1 + 4, -1360, 940, -1276]);
  block('rqp11s15_south', [X0, -1360, X1 + 4, -1304]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11s15_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -1253.2); flame(x, -1263.2); }
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -1253.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -1263.4, { interact: 'lamp' });
  }
  for (let y = -1318; y <= -1240; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -1320.4);
  function faceCore(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 2 === 0 ? 'sc_shop' : 'sc_panel';
    if (f === 14) return 'sc_panel';
    if (f === 4) return 'sc_shop';
    return (b + f) % 2 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function faceWestWing(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 4) return 'sc_panel';
    if (f === 7) return 'sc_shop';
    return b % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceEastWing(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 8) return 'sc_shop';
    if (f === 12) return 'sc_panel';
    return b % 2 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function faceLow(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 2 === 0 ? 'sc_panel' : 'sc_shop';
    if (f === 6) return 'sc_shop';
    return (b + f) % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceMid(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 7) return 'sc_panel';
    if (f === 12) return 'sc_shop';
    return b % 4 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function faceHigh(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 13) return 'sc_panel';
    if (f === 18) return 'sc_shop';
    return b % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function rise(opt) {
    const fg = 'rqp11s15_' + opt.id;
    const wk = opt.wk || 0;
    for (let f = opt.f0; f <= opt.f1; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = opt.b0; b < opt.b1; b++) {
        put(opt.id + '_S' + f + '_' + b, 'f_wall', opt.x0 + b * 3, opt.y, { z, state: st, fade_group: fg, variant: opt.face(f, b, 'S') });
      }
      if (opt.wx != null) {
        for (let b = 0; b < opt.db; b++) {
          put(opt.id + '_W' + f + '_' + wk + '_' + b, 'f_wall', opt.wx, opt.y + 3 + b * 3, { z, rot: 6, state: st, fade_group: fg, variant: opt.face(f, b, 'W') });
        }
      }
    }
    for (const roof of opt.roofs || []) put(opt.id + '_roof_' + roof.k, 'b_roof_b', roof.x, opt.y, { z: roof.z, fade_group: fg, variant: 'r_lip' });
  }
  const yS = -1252;
  rise({
    id: 'th', x0: 32, y: yS, wx: 44, f0: 1, f1: 14, b0: 4, b1: 12, db: 4, wk: 0, face: faceCore,
    roofs: [{ k: 0, x: 44, z: 42 }, { k: 1, x: 56, z: 42 }],
  });
  rise({
    id: 'th', x0: 32, y: yS, wx: 32, f0: 4, f1: 7, b0: 0, b1: 4, db: 4, wk: 1, face: faceWestWing,
    roofs: [{ k: 2, x: 32, z: 21 }],
  });
  rise({
    id: 'th', x0: 32, y: yS, wx: 68, f0: 8, f1: 12, b0: 12, b1: 16, db: 4, wk: 2, face: faceEastWing,
    roofs: [{ k: 3, x: 68, z: 36 }],
  });
  rise({ id: 'nd', x0: 96, y: yS, wx: 120, f0: 1, f1: 6, b0: 8, b1: 16, db: 5, wk: 0, face: faceLow, roofs: [] });
  rise({
    id: 'nd', x0: 96, y: yS, wx: 96, f0: 7, f1: 12, b0: 0, b1: 16, db: 5, wk: 1, face: faceMid,
    roofs: [{ k: 0, x: 120, z: 36 }, { k: 1, x: 132, z: 36 }],
  });
  rise({
    id: 'nd', x0: 96, y: yS, wx: 96, f0: 13, f1: 18, b0: 0, b1: 8, db: 5, wk: 2, face: faceHigh,
    roofs: [{ k: 2, x: 96, z: 54 }, { k: 3, x: 108, z: 54 }],
  });
  block('rqp11s15_th', [32, yS, 80, yS + 12]);
  block('rqp11s15_nd', [96, yS, 144, yS + 15]);
  const built = [
    { id: 'rqp11s15_th', name: '滩南居', x0: 32, y0: yS, W: 48, D: 12, F: 14, style: '错翼', coreW: 24, wingW: 12, westWingF: '4-7', eastWingF: '8-12', coreF: '1-14' },
    { id: 'rqp11s15_nd', name: '南宕楼', x0: 96, y0: yS, W: 48, D: 15, F: 18, style: '扭叠', lowW: 24, midW: 48, highW: 24, lowF: '1-6', midF: '7-12', highF: '13-18' },
  ];
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s15 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s15', name: '南埠南滩', rect: [-16, -1350, 200, -1200], src: 'js/rongqiao_expand_p11o.js', load_m: 50, unload_m: 100 });
  const P = N.expansionP11;
  P.slice = 15;
  P.names.road15 = '南滩路';
  P.names.block15 = '滩南居';
  P.names.mix15 = '南宕楼';
  P.road15 = [X0, -1264, X1, -1252];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.reasons.slice15 = '第十五片再往南 80 m，可玩南界 -1300，地面到 -1340。第十四片 y -1240 的南篱拆掉。新收边绿篱在 -1320，大约在可玩界以南 20 m，篱外仍是硬地。南汐路北缘 -1172 再隔 80 m，南滩路仍是 12 m 油漆路面，落在 -1264 到 -1252，路南仍留约 36 m，不必在正负 10 到 20 里再挪。滩南居是错翼：24 m 核心从 1 层拉到 14 层，西翼 12 m 只在 4 到 7 层，东翼 12 m 只在 8 到 12 层，两翼不同层。南宕楼是扭叠：1 到 6 层只占东侧 24 m，7 到 12 层铺成 48 m 整板，13 到 18 层收到西侧 24 m。不重复屿南居的鼓腹、南坞楼的侧槽、矶南居的门架、南澳楼的斜折、湄南居的偏悬、南湄楼的肩针、渚南居的倒阶、南濑楼的错移、汀南居的四段细阶、南汀楼的腰洞、湾南居的高低连廊双塔、南湾楼的上层正中开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔，不改南埠中心。河东东界仍是 x 840。菜市场室内不扩。没有第二小学。名字和尺寸未经确认。';
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_tan_road', name: '南滩路', x: 40, y: -1258, desc: '南汐路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_thnj', name: '滩南居', x: 56, y: -1256, desc: '错翼。24 m 核心从 1 层拉到 14 层，西翼 12 m 只在 4 到 7 层，东翼 12 m 只在 8 到 12 层。进深 12 m。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_ndl', name: '南宕楼', x: 120, y: -1256, desc: '扭叠。1 到 6 层只占东侧 24 m，7 到 12 层铺成 48 m 整板，13 到 18 层收到西侧 24 m。进深 15 m。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
