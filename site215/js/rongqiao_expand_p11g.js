/* 南埠 P11 第七片 (2026-10-25). 可玩南界从 -580 再往南 80 m，收到 -660。地面铺到 -700。
 * 拆掉第六片 y -600 的南篱和南侧封边。槐北街的油漆路面和人行道穿过旧篱，接到新南界。
 * 新收边绿篱在可玩界以南约 20 m（y -680）。篱外再留约 20 m 硬地，人走不到篱外。
 * 南浦路 12 m，只铺路面。按南津路北缘 -532 再隔 80 m，路放在 -624…-612。
 * 路北两栋朝南：浦南商住是 5 层裙楼加正中 9 层退台，南浦居是 19 层窄深板楼。
 * 不重复津南坊的西端退台、南环轩的东端退台、南津居的双联窗，也不另做地标塔。
 * 不改河东 x 840，不加实时车道，不建菜市场，不建第二小学。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11f || D.rongqiaoExpandP11g || !N.expansionP11) return;
  D.rongqiaoExpandP11g = 1;
  const G = D.ground, BY0 = -660, GY0 = -700, X0 = 8, X1 = 176;
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
  const south = (D.colliders || []).find((c) => c.id === 'rqp11f_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11f_south');
  }
  const old = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p11_s6;
  if (old && old.objects) old.objects = old.objects.filter((o) => !/^rqp11f_edge_s_/.test(o.id));
  paint([X0, BY0, X1, -580], 'S');
  paint([16, BY0, 22, -580], 'S');
  paint([22, BY0, 28, -580], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -580], 'S');
  paint([X0, -622, X1, -614], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11g_west', [-240, -720, X0, -636]);
  block('rqp11g_east', [X1 + 4, -720, 940, -636]);
  block('rqp11g_south', [X0, -720, X1 + 4, -664]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11g_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -613.2); flame(x, -623.2); }
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -613.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -623.4, { interact: 'lamp' });
  }
  for (let y = -678; y <= -598; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -680.4);
  function facePu(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 4 === 0 ? 'sc_panel' : 'sc_shop';
    return Math.floor(b / 3) % 2 === f % 2 ? 'sc_shop' : 'sc_panel';
  }
  function faceNp(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (b === 0 || b === 7) return 'sc_panel';
    if (f % 2 === 1) return 'sc_shop';
    return b === 3 || b === 4 ? 'sc_shop' : 'sc_panel';
  }
  function rise(opt) {
    const fg = 'rqp11g_' + opt.id;
    for (let f = opt.f0; f <= opt.f1; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = opt.b0; b < opt.b1; b++) {
        put(opt.id + '_S' + f + '_' + b, 'f_wall', opt.x0 + b * 3, opt.y, { z, state: st, fade_group: fg, variant: opt.face(f, b, 'S') });
      }
      for (let b = 0; b < opt.db; b++) {
        put(opt.id + '_W' + f + '_' + b, 'f_wall', opt.wx, opt.y + 3 + b * 3, { z, rot: 6, state: st, fade_group: fg, variant: opt.face(f, b, 'W') });
      }
    }
    for (const roof of opt.roofs) put(opt.id + '_roof_' + roof.k, 'b_roof_b', roof.x, opt.y, { z: roof.z, fade_group: fg, variant: 'r_lip' });
  }
  const yS = -612;
  rise({
    id: 'pn', x0: 40, y: yS, wx: 40, f0: 1, f1: 5, b0: 0, b1: 16, db: 3, face: facePu,
    roofs: [{ k: 0, x: 40, z: 15 }, { k: 1, x: 76, z: 15 }],
  });
  rise({
    id: 'pn', x0: 40, y: yS, wx: 52, f0: 6, f1: 9, b0: 4, b1: 12, db: 3, face: facePu,
    roofs: [{ k: 2, x: 52, z: 27 }, { k: 3, x: 64, z: 27 }],
  });
  rise({
    id: 'np', x0: 114, y: yS, wx: 114, f0: 1, f1: 19, b0: 0, b1: 8, db: 6, face: faceNp,
    roofs: [0, 1].map((k) => ({ k, x: 114 + k * 12, z: 57 })),
  });
  block('rqp11g_pn', [40, yS, 88, yS + 9]);
  block('rqp11g_np', [114, yS, 138, yS + 18]);
  const built = [
    { id: 'rqp11g_pn', name: '浦南商住', x0: 40, y0: yS, W: 48, D: 9, F: 9, style: '中退台', podiumF: 5, towerW: 24 },
    { id: 'rqp11g_np', name: '南浦居', x0: 114, y0: yS, W: 24, D: 18, F: 19, style: '窄板' },
  ];
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s7 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s7', name: '南埠南浦', rect: [-16, -710, 200, -560], src: 'js/rongqiao_expand_p11g.js', load_m: 50, unload_m: 100 });
  const P = N.expansionP11;
  P.slice = 7;
  P.names.road7 = '南浦路';
  P.names.block7 = '浦南商住';
  P.names.mix7 = '南浦居';
  P.road7 = [X0, -624, X1, -612];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.reasons.slice7 = '第七片再往南 80 m，可玩南界 -660，地面到 -700。第六片 y -600 的南篱拆掉。新收边绿篱在 -680，大约在可玩界以南 20 m，篱外仍是硬地。南浦路仍是 12 m 油漆路面，落在 -624 到 -612。浦南商住是 5 层裙楼加正中 9 层退台、宽 24 m，南浦居是 19 层窄板、宽 24 m、进深 18 m。不重复津南坊的西端退台、南环轩的东端退台、南津居的双联窗，也不另做地标塔，不改南埠中心。河东东界仍是 x 840。菜市场室内不扩。没有第二小学。名字和尺寸未经确认。';
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_npu_road', name: '南浦路', x: 40, y: -618, desc: '南津路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_pns', name: '浦南商住', x: 64, y: -616, desc: '裙楼 5 层、宽 48 m，正中退台收到 9 层、宽 24 m。三连窗。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_npj', name: '南浦居', x: 126, y: -616, desc: '19 层，宽 24 m，进深 18 m。奇数层是玻璃横带，偶数层只留中间一条玻璃槽。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
