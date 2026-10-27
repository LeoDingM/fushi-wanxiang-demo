/* 南埠 P11 第十四片 (2026-10-26). 可玩南界从 -1140 再往南 80 m，收到 -1220。地面铺到 -1260。
 * 拆掉第十三片 y -1160 的南篱和南侧封边。槐北街的油漆路面和人行道穿过旧篱，接到新南界。
 * 新收边绿篱在可玩界以南约 20 m（y -1240）。篱外再留约 20 m 硬地，人走不到篱外。
 * 南汐路 12 m，只铺路面。按南矶路北缘 -1092 再隔 80 m，路放在 -1184…-1172。路南到可玩界仍留约 36 m，不必在 ±10–20 里再挪。
 * 路北两栋朝南：屿南居是鼓腹，1 到 4 层和 11 到 16 层只有中间 24 m，5 到 10 层向两侧铺开到 48 m，上面再收回去；
 * 南坞楼是侧槽，1 到 5 层和 13 到 18 层是 48 m 整板，6 到 12 层东侧缺 18 m，缺口开在侧面，上下仍连着。
 * 对象前缀用 rqp11s14_。不重复矶南居的门架、南澳楼的斜折、湄南居的偏悬、南湄楼的肩针、渚南居的倒阶、南濑楼的错移、汀南居的四段细阶、南汀楼的腰洞、湾南居的高低连廊双塔、南湾楼的上层开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔。
 * 不改河东 x 840，不加实时车道，不建菜市场，不建第二小学。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11m || D.rongqiaoExpandP11n || !N.expansionP11) return;
  D.rongqiaoExpandP11n = 1;
  const G = D.ground, BY0 = -1220, GY0 = -1260, X0 = 8, X1 = 176;
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
  const south = (D.colliders || []).find((c) => c.id === 'rqp11s13_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11s13_south');
  }
  const old = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p11_s13;
  if (old && old.objects) old.objects = old.objects.filter((o) => !/^rqp11s13_edge_s_/.test(o.id));
  paint([X0, BY0, X1, -1140], 'S');
  paint([16, BY0, 22, -1140], 'S');
  paint([22, BY0, 28, -1140], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -1140], 'S');
  paint([X0, -1182, X1, -1174], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11s14_west', [-240, -1280, X0, -1196]);
  block('rqp11s14_east', [X1 + 4, -1280, 940, -1196]);
  block('rqp11s14_south', [X0, -1280, X1 + 4, -1224]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11s14_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -1173.2); flame(x, -1183.2); }
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -1173.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -1183.4, { interact: 'lamp' });
  }
  for (let y = -1238; y <= -1160; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -1240.4);
  function faceShaft(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 2 === 0 ? 'sc_panel' : 'sc_shop';
    if (f === 4) return 'sc_panel';
    return b % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceTop(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 16) return 'sc_shop';
    if (f === 11) return 'sc_panel';
    return b % 3 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceBelly(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 5) return 'sc_panel';
    if (f === 10) return 'sc_shop';
    return (b + f) % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceBase(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 4 === 0 ? 'sc_panel' : 'sc_shop';
    if (f === 5) return 'sc_panel';
    return b % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceNotch(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 6) return 'sc_shop';
    if (f === 12) return 'sc_panel';
    return b % 3 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function faceCap(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 13) return 'sc_panel';
    if (f === 18) return 'sc_shop';
    return b % 2 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function rise(opt) {
    const fg = 'rqp11s14_' + opt.id;
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
  const yS = -1172;
  rise({ id: 'yu', x0: 32, y: yS, wx: 44, f0: 1, f1: 4, b0: 4, b1: 8, db: 4, wk: 0, face: faceShaft, roofs: [] });
  rise({
    id: 'yu', x0: 32, y: yS, wx: 44, f0: 11, f1: 16, b0: 4, b1: 8, db: 4, wk: 1, face: faceTop,
    roofs: [{ k: 0, x: 44, z: 48 }, { k: 1, x: 56, z: 48 }],
  });
  rise({
    id: 'yu', x0: 32, y: yS, wx: 32, f0: 5, f1: 10, b0: 0, b1: 16, db: 4, wk: 2, face: faceBelly,
    roofs: [{ k: 2, x: 32, z: 30 }, { k: 3, x: 68, z: 30 }],
  });
  rise({ id: 'wu', x0: 96, y: yS, wx: 96, f0: 1, f1: 5, b0: 0, b1: 16, db: 5, wk: 0, face: faceBase, roofs: [] });
  rise({ id: 'wu', x0: 96, y: yS, wx: 96, f0: 6, f1: 12, b0: 0, b1: 10, db: 5, wk: 1, face: faceNotch, roofs: [] });
  rise({
    id: 'wu', x0: 96, y: yS, wx: 96, f0: 13, f1: 18, b0: 0, b1: 16, db: 5, wk: 2, face: faceCap,
    roofs: [{ k: 0, x: 96, z: 54 }, { k: 1, x: 108, z: 54 }, { k: 2, x: 120, z: 54 }, { k: 3, x: 132, z: 54 }],
  });
  block('rqp11s14_yu', [32, yS, 80, yS + 12]);
  block('rqp11s14_wu', [96, yS, 144, yS + 15]);
  const built = [
    { id: 'rqp11s14_yu', name: '屿南居', x0: 32, y0: yS, W: 48, D: 12, F: 16, style: '鼓腹', shaftW: 24, bellyW: 48, bellyF: '5-10', shaftF: '1-4/11-16' },
    { id: 'rqp11s14_wu', name: '南坞楼', x0: 96, y0: yS, W: 48, D: 15, F: 18, style: '侧槽', notchW: 18, notchF: '6-12', plateF: '1-5/13-18' },
  ];
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s14 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s14', name: '南埠南汐', rect: [-16, -1270, 200, -1120], src: 'js/rongqiao_expand_p11n.js', load_m: 50, unload_m: 100 });
  const P = N.expansionP11;
  P.slice = 14;
  P.names.road14 = '南汐路';
  P.names.block14 = '屿南居';
  P.names.mix14 = '南坞楼';
  P.road14 = [X0, -1184, X1, -1172];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.reasons.slice14 = '第十四片再往南 80 m，可玩南界 -1220，地面到 -1260。第十三片 y -1160 的南篱拆掉。新收边绿篱在 -1240，大约在可玩界以南 20 m，篱外仍是硬地。南矶路北缘 -1092 再隔 80 m，南汐路仍是 12 m 油漆路面，落在 -1184 到 -1172，路南仍留约 36 m，不必在正负 10 到 20 里再挪。屿南居是鼓腹：1 到 4 层和 11 到 16 层只有中间 24 m，5 到 10 层向两侧铺开到 48 m，上面再收回去。南坞楼是侧槽：1 到 5 层和 13 到 18 层是 48 m 整板，6 到 12 层东侧 18 m 缺一块，缺口开在侧面，上下仍连着。不重复矶南居的门架、南澳楼的斜折、湄南居的偏悬、南湄楼的肩针、渚南居的倒阶、南濑楼的错移、汀南居的四段细阶、南汀楼的腰洞、湾南居的高低连廊双塔、南湾楼的上层正中开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔，不改南埠中心。河东东界仍是 x 840。菜市场室内不扩。没有第二小学。名字和尺寸未经确认。';
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_xi_road', name: '南汐路', x: 40, y: -1178, desc: '南矶路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_yuj', name: '屿南居', x: 56, y: -1176, desc: '鼓腹。1 到 4 层和 11 到 16 层只有中间 24 m，5 到 10 层向两侧铺开到 48 m，上面再收回去。进深 12 m。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_nwu', name: '南坞楼', x: 120, y: -1176, desc: '侧槽。1 到 5 层和 13 到 18 层是 48 m 整板，6 到 12 层东侧缺 18 m，缺口开在侧面，上下仍连着。进深 15 m。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
