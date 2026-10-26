/* 南埠 P11 第十八片 (2026-10-26). 可玩南界从 -1460 再往南 80 m，收到 -1540。地面铺到 -1580。
 * 拆掉第十七片 y -1480 的南篱和南侧封边。槐北街的油漆路面和人行道穿过旧篱，接到新南界。
 * 新收边绿篱在可玩界以南约 20 m（y -1560）。篱外再留约 20 m 硬地，人走不到篱外。
 * 南滨路 12 m，只铺路面。按南泊路北缘 -1412 再隔 80 m，路放在 -1504…-1492。路南到可玩界仍留约 36 m，不必在 ±10–20 里再挪。
 * 路北两栋朝南：滨南居是齿冠，1 到 12 层是 48 m 整板，13 到 15 层只留两道 12 m 的齿，中间和东端各空 12 m；
 * 南滨楼是悬踏，四段各宽 12 m，1 到 5 层贴西侧落地，后面三段依次向东抬高，只在转角相接，东段不落地。
 * 对象前缀用 rqp11s18_。不重复泊南居的空桥、南潭楼的退冕、泓南居的伞冠、南澜楼的对缺、滩南居的错翼、南宕楼的扭叠、屿南居的鼓腹、南坞楼的侧槽、矶南居的门架、南澳楼的斜折、湄南居的偏悬、南湄楼的肩针、渚南居的倒阶、南濑楼的错移、汀南居的四段细阶、南汀楼的腰洞、湾南居的高低连廊双塔、南湾楼的上层开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔。
 * 不改河东 x 840，不加实时车道，不建菜市场，不建第二小学。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11q || D.rongqiaoExpandP11r || !N.expansionP11) return;
  D.rongqiaoExpandP11r = 1;
  const G = D.ground, BY0 = -1540, GY0 = -1580, X0 = 8, X1 = 176;
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
  const south = (D.colliders || []).find((c) => c.id === 'rqp11s17_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11s17_south');
  }
  const old = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p11_s17;
  if (old && old.objects) old.objects = old.objects.filter((o) => !/^rqp11s17_edge_s_/.test(o.id));
  paint([X0, BY0, X1, -1460], 'S');
  paint([16, BY0, 22, -1460], 'S');
  paint([22, BY0, 28, -1460], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -1460], 'S');
  paint([X0, -1502, X1, -1494], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11s18_west', [-240, -1600, X0, -1516]);
  block('rqp11s18_east', [X1 + 4, -1600, 940, -1516]);
  block('rqp11s18_south', [X0, -1600, X1 + 4, -1544]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11s18_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -1493.2); flame(x, -1503.2); }
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -1493.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -1503.4, { interact: 'lamp' });
  }
  for (let y = -1558; y <= -1480; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -1560.4);
  function faceSlab(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 2 === 0 ? 'sc_shop' : 'sc_panel';
    if (f === 12) return 'sc_panel';
    return (b + f) % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceTooth(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 13) return 'sc_shop';
    if (f === 15) return 'sc_panel';
    return b % 2 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function faceA(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 2 === 0 ? 'sc_shop' : 'sc_panel';
    if (f === 5) return 'sc_panel';
    return (b + f) % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceB(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 6) return 'sc_shop';
    if (f === 10) return 'sc_panel';
    return b % 2 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function faceC(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 11) return 'sc_shop';
    if (f === 14) return 'sc_panel';
    return (b + f) % 2 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function faceD(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 15) return 'sc_shop';
    if (f === 18) return 'sc_panel';
    return b % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function rise(opt) {
    const fg = 'rqp11s18_' + opt.id;
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
      if (opt.ex != null) {
        for (let b = 0; b < opt.db; b++) {
          put(opt.id + '_E' + f + '_' + opt.ewk + '_' + b, 'f_wall', opt.ex, opt.y + 3 + b * 3, { z, rot: 6, state: st, fade_group: fg, variant: opt.face(f, b, 'W') });
        }
      }
    }
    for (const roof of opt.roofs || []) put(opt.id + '_roof_' + roof.k, 'b_roof_b', roof.x, opt.y, { z: roof.z, fade_group: fg, variant: 'r_lip' });
  }
  const yS = -1492;
  rise({
    id: 'bn', x0: 32, y: yS, wx: 32, ex: 80, f0: 1, f1: 12, b0: 0, b1: 16, db: 4, wk: 0, ewk: 1, face: faceSlab,
    roofs: [{ k: 0, x: 44, z: 36 }, { k: 1, x: 68, z: 36 }],
  });
  rise({
    id: 'bn', x0: 32, y: yS, wx: 32, ex: 44, f0: 13, f1: 15, b0: 0, b1: 4, db: 4, wk: 2, ewk: 3, face: faceTooth,
    roofs: [{ k: 2, x: 32, z: 45 }],
  });
  rise({
    id: 'bn', x0: 32, y: yS, wx: 56, ex: 68, f0: 13, f1: 15, b0: 8, b1: 12, db: 4, wk: 4, ewk: 5, face: faceTooth,
    roofs: [{ k: 3, x: 56, z: 45 }],
  });
  rise({
    id: 'nb', x0: 96, y: yS, wx: 96, ex: 108, f0: 1, f1: 5, b0: 0, b1: 4, db: 5, wk: 0, ewk: 1, face: faceA,
    roofs: [{ k: 0, x: 96, z: 15 }],
  });
  rise({
    id: 'nb', x0: 96, y: yS, wx: 108, ex: 120, f0: 6, f1: 10, b0: 4, b1: 8, db: 5, wk: 2, ewk: 3, face: faceB,
    roofs: [{ k: 1, x: 108, z: 30 }],
  });
  rise({
    id: 'nb', x0: 96, y: yS, wx: 120, ex: 132, f0: 11, f1: 14, b0: 8, b1: 12, db: 5, wk: 4, ewk: 5, face: faceC,
    roofs: [{ k: 2, x: 120, z: 42 }],
  });
  rise({
    id: 'nb', x0: 96, y: yS, wx: 132, ex: 144, f0: 15, f1: 18, b0: 12, b1: 16, db: 5, wk: 6, ewk: 7, face: faceD,
    roofs: [{ k: 3, x: 132, z: 54 }],
  });
  block('rqp11s18_bn', [32, yS, 80, yS + 12]);
  block('rqp11s18_nb', [96, yS, 144, yS + 15]);
  const built = [
    { id: 'rqp11s18_bn', name: '滨南居', x0: 32, y0: yS, W: 48, D: 12, F: 15, style: '齿冠', baseW: 48, baseF: '1-12', toothW: 12, toothF: '13-15', toothN: 2, gapW: 12 },
    { id: 'rqp11s18_nb', name: '南滨楼', x0: 96, y0: yS, W: 48, D: 15, F: 18, style: '悬踏', stepW: 12, stepA: '1-5', stepB: '6-10', stepC: '11-14', stepD: '15-18' },
  ];
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s18 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s18', name: '南埠南滨', rect: [-16, -1590, 200, -1440], src: 'js/rongqiao_expand_p11r.js', load_m: 50, unload_m: 100 });
  const P = N.expansionP11;
  P.slice = 18;
  P.names.road18 = '南滨路';
  P.names.block18 = '滨南居';
  P.names.mix18 = '南滨楼';
  P.road18 = [X0, -1504, X1, -1492];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.reasons.slice18 = '第十八片再往南 80 m，可玩南界 -1540，地面到 -1580。第十七片 y -1480 的南篱拆掉。新收边绿篱在 -1560，大约在可玩界以南 20 m，篱外仍是硬地。南泊路北缘 -1412 再隔 80 m，南滨路仍是 12 m 油漆路面，落在 -1504 到 -1492，路南仍留约 36 m，不必在正负 10 到 20 里再挪。滨南居是齿冠：1 到 12 层是 48 m 整板，13 到 15 层只留两道 12 m 的齿，中间和东端各空 12 m。南滨楼是悬踏：四段各宽 12 m，1 到 5 层贴西侧落地，6 到 10 层、11 到 14 层、15 到 18 层依次向东抬高，只在转角相接，东段不落地。不重复泊南居的空桥、南潭楼的退冕、泓南居的伞冠、南澜楼的对缺、滩南居的错翼、南宕楼的扭叠、屿南居的鼓腹、南坞楼的侧槽、矶南居的门架、南澳楼的斜折、湄南居的偏悬、南湄楼的肩针、渚南居的倒阶、南濑楼的错移、汀南居的四段细阶、南汀楼的腰洞、湾南居的高低连廊双塔、南湾楼的上层正中开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔，不改南埠中心。河东东界仍是 x 840。菜市场室内不扩。没有第二小学。名字和尺寸未经确认。';
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_bin_road', name: '南滨路', x: 40, y: -1498, desc: '南泊路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_binj', name: '滨南居', x: 56, y: -1496, desc: '齿冠。12 层整板以上，顶上三层留两道齿。进深 12 m。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_nbin', name: '南滨楼', x: 120, y: -1496, desc: '悬踏。四段向东抬高，只有西段落地。进深 15 m。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
