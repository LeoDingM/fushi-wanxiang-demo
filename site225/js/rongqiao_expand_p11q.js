/* 南埠 P11 第十七片 (2026-10-26). 可玩南界从 -1380 再往南 80 m，收到 -1460。地面铺到 -1500。
 * 拆掉第十六片 y -1400 的南篱和南侧封边。槐北街的油漆路面和人行道穿过旧篱，接到新南界。
 * 新收边绿篱在可玩界以南约 20 m（y -1480）。篱外再留约 20 m 硬地，人走不到篱外。
 * 南泊路 12 m，只铺路面。按南泓路北缘 -1332 再隔 80 m，路放在 -1424…-1412。路南到可玩界仍留约 36 m，不必在 ±10–20 里再挪。
 * 路北两栋朝南：泊南居是空桥，西塔 12 层、宽 12 m，东塔 16 层、宽 12 m，中间 24 m 只在 6 到 8 层连成一道桥，桥下和桥上都空着；
 * 南潭楼是退冕，1 到 7 层是 48 m 整板，8 到 12 层收到西侧 36 m，13 到 16 层收到西侧 24 m，17 到 19 层收到西侧 12 m。
 * 对象前缀用 rqp11s17_。不重复泓南居的伞冠、南澜楼的对缺、滩南居的错翼、南宕楼的扭叠、屿南居的鼓腹、南坞楼的侧槽、矶南居的门架、南澳楼的斜折、湄南居的偏悬、南湄楼的肩针、渚南居的倒阶、南濑楼的错移、汀南居的四段细阶、南汀楼的腰洞、湾南居的高低连廊双塔、南湾楼的上层开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔。
 * 不改河东 x 840，不加实时车道，不建菜市场，不建第二小学。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11p || D.rongqiaoExpandP11q || !N.expansionP11) return;
  D.rongqiaoExpandP11q = 1;
  const G = D.ground, BY0 = -1460, GY0 = -1500, X0 = 8, X1 = 176;
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
  const south = (D.colliders || []).find((c) => c.id === 'rqp11s16_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11s16_south');
  }
  const old = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p11_s16;
  if (old && old.objects) old.objects = old.objects.filter((o) => !/^rqp11s16_edge_s_/.test(o.id));
  paint([X0, BY0, X1, -1380], 'S');
  paint([16, BY0, 22, -1380], 'S');
  paint([22, BY0, 28, -1380], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -1380], 'S');
  paint([X0, -1422, X1, -1414], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11s17_west', [-240, -1520, X0, -1436]);
  block('rqp11s17_east', [X1 + 4, -1520, 940, -1436]);
  block('rqp11s17_south', [X0, -1520, X1 + 4, -1464]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11s17_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -1413.2); flame(x, -1423.2); }
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -1413.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -1423.4, { interact: 'lamp' });
  }
  for (let y = -1478; y <= -1400; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -1480.4);
  function faceWest(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 2 === 0 ? 'sc_shop' : 'sc_panel';
    if (f === 12) return 'sc_panel';
    return (b + f) % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceBridge(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 6) return 'sc_shop';
    if (f === 8) return 'sc_panel';
    return b % 2 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function faceEast(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 2 === 0 ? 'sc_panel' : 'sc_shop';
    if (f === 6 || f === 8) return 'sc_panel';
    if (f === 16) return 'sc_shop';
    return (b + f) % 2 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function faceBase(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 2 === 0 ? 'sc_shop' : 'sc_panel';
    if (f === 7) return 'sc_panel';
    return (b + f) % 3 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceStep2(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 8) return 'sc_shop';
    if (f === 12) return 'sc_panel';
    return b % 2 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function faceStep3(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 13) return 'sc_panel';
    if (f === 16) return 'sc_shop';
    return (b + f) % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceCrown(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 17) return 'sc_shop';
    if (f === 19) return 'sc_panel';
    return b % 2 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function rise(opt) {
    const fg = 'rqp11s17_' + opt.id;
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
  const yS = -1412;
  rise({
    id: 'bo', x0: 32, y: yS, wx: 32, f0: 1, f1: 12, b0: 0, b1: 4, db: 4, wk: 0, face: faceWest,
    roofs: [{ k: 0, x: 32, z: 36 }],
  });
  rise({
    id: 'bo', x0: 32, y: yS, f0: 6, f1: 8, b0: 4, b1: 12, db: 4, wk: 4, face: faceBridge,
    roofs: [
      { k: 1, x: 44, z: 15 }, { k: 2, x: 56, z: 15 },
      { k: 3, x: 44, z: 24 }, { k: 4, x: 56, z: 24 },
    ],
  });
  rise({ id: 'bo', x0: 32, y: yS, wx: 68, f0: 1, f1: 5, b0: 12, b1: 16, db: 4, wk: 1, face: faceEast, roofs: [] });
  rise({ id: 'bo', x0: 32, y: yS, f0: 6, f1: 8, b0: 12, b1: 16, db: 4, wk: 2, face: faceEast, roofs: [] });
  rise({
    id: 'bo', x0: 32, y: yS, wx: 68, f0: 9, f1: 16, b0: 12, b1: 16, db: 4, wk: 3, face: faceEast,
    roofs: [{ k: 5, x: 68, z: 48 }],
  });
  rise({
    id: 'nt', x0: 96, y: yS, wx: 96, f0: 1, f1: 7, b0: 0, b1: 16, db: 5, wk: 0, face: faceBase,
    roofs: [{ k: 0, x: 132, z: 21 }],
  });
  rise({
    id: 'nt', x0: 96, y: yS, wx: 96, f0: 8, f1: 12, b0: 0, b1: 12, db: 5, wk: 1, face: faceStep2,
    roofs: [{ k: 1, x: 120, z: 36 }],
  });
  rise({
    id: 'nt', x0: 96, y: yS, wx: 96, f0: 13, f1: 16, b0: 0, b1: 8, db: 5, wk: 2, face: faceStep3,
    roofs: [{ k: 2, x: 108, z: 48 }],
  });
  rise({
    id: 'nt', x0: 96, y: yS, wx: 96, f0: 17, f1: 19, b0: 0, b1: 4, db: 5, wk: 3, face: faceCrown,
    roofs: [{ k: 3, x: 96, z: 57 }],
  });
  block('rqp11s17_bo', [32, yS, 80, yS + 12]);
  block('rqp11s17_nt', [96, yS, 144, yS + 15]);
  const built = [
    { id: 'rqp11s17_bo', name: '泊南居', x0: 32, y0: yS, W: 48, D: 12, F: 16, style: '空桥', westW: 12, westF: '1-12', eastW: 12, eastF: '1-16', bridgeW: 24, bridgeF: '6-8', gapW: 24 },
    { id: 'rqp11s17_nt', name: '南潭楼', x0: 96, y0: yS, W: 48, D: 15, F: 19, style: '退冕', baseW: 48, baseF: '1-7', step2W: 36, step2F: '8-12', step3W: 24, step3F: '13-16', crownW: 12, crownF: '17-19' },
  ];
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s17 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s17', name: '南埠南泊', rect: [-16, -1510, 200, -1360], src: 'js/rongqiao_expand_p11q.js', load_m: 50, unload_m: 100 });
  const P = N.expansionP11;
  P.slice = 17;
  P.names.road17 = '南泊路';
  P.names.block17 = '泊南居';
  P.names.mix17 = '南潭楼';
  P.road17 = [X0, -1424, X1, -1412];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.reasons.slice17 = '第十七片再往南 80 m，可玩南界 -1460，地面到 -1500。第十六片 y -1400 的南篱拆掉。新收边绿篱在 -1480，大约在可玩界以南 20 m，篱外仍是硬地。南泓路北缘 -1332 再隔 80 m，南泊路仍是 12 m 油漆路面，落在 -1424 到 -1412，路南仍留约 36 m，不必在正负 10 到 20 里再挪。泊南居是空桥：西塔 12 层、宽 12 m，东塔 16 层、宽 12 m，中间 24 m 只在 6 到 8 层连成一道桥，桥下和桥上都空着。南潭楼是退冕：1 到 7 层是 48 m 整板，8 到 12 层收到西侧 36 m，13 到 16 层收到西侧 24 m，17 到 19 层收到西侧 12 m，退台都落在整板上。不重复泓南居的伞冠、南澜楼的对缺、滩南居的错翼、南宕楼的扭叠、屿南居的鼓腹、南坞楼的侧槽、矶南居的门架、南澳楼的斜折、湄南居的偏悬、南湄楼的肩针、渚南居的倒阶、南濑楼的错移、汀南居的四段细阶、南汀楼的腰洞、湾南居的高低连廊双塔、南湾楼的上层正中开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔，不改南埠中心。河东东界仍是 x 840。菜市场室内不扩。没有第二小学。名字和尺寸未经确认。';
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_bo_road', name: '南泊路', x: 40, y: -1418, desc: '南泓路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_boj', name: '泊南居', x: 56, y: -1416, desc: '空桥。西塔 12 层，东塔 16 层，中间只在 6 到 8 层连成一道桥。进深 12 m。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_ntan', name: '南潭楼', x: 120, y: -1416, desc: '退冕。整板打底，往上逐级收到西侧。进深 15 m。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
