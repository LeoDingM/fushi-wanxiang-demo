/* 南埠 P11 第十一片 (2026-10-26). 可玩南界从 -900 再往南 80 m，收到 -980。地面铺到 -1020。
 * 拆掉第十片 y -920 的南篱和南侧封边。槐北街的油漆路面和人行道穿过旧篱，接到新南界。
 * 新收边绿篱在可玩界以南约 20 m（y -1000）。篱外再留约 20 m 硬地，人走不到篱外。
 * 南渚路 12 m，只铺路面。按南汀路北缘 -852 再隔 80 m，路放在 -944…-932。路南到可玩界仍留约 36 m，不必在 ±10–20 里再挪。
 * 路北两栋朝南：渚南居是倒阶，底下 5 层只有中间 12 m，6 到 12 层铺开到 36 m；
 * 南濑楼是错移，底下 8 层在西侧 36 m，9 到 16 层整段向东挪 12 m。东端 12 m 没有底层。
 * 对象前缀用 rqp11s11_，避开天际线已经占用的 rqp11k_。
 * 不重复汀南居的四段细阶、南汀楼的腰洞、湾南居的高低连廊双塔、南湾楼的上层开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔。
 * 不改河东 x 840，不加实时车道，不建菜市场，不建第二小学。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11j || D.rongqiaoExpandP11k || !N.expansionP11) return;
  D.rongqiaoExpandP11k = 1;
  const G = D.ground, BY0 = -980, GY0 = -1020, X0 = 8, X1 = 176;
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
  const south = (D.colliders || []).find((c) => c.id === 'rqp11j_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11j_south');
  }
  const old = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p11_s10;
  if (old && old.objects) old.objects = old.objects.filter((o) => !/^rqp11j_edge_s_/.test(o.id));
  paint([X0, BY0, X1, -900], 'S');
  paint([16, BY0, 22, -900], 'S');
  paint([22, BY0, 28, -900], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -900], 'S');
  paint([X0, -942, X1, -934], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11s11_west', [-240, -1040, X0, -956]);
  block('rqp11s11_east', [X1 + 4, -1040, 940, -956]);
  block('rqp11s11_south', [X0, -1040, X1 + 4, -984]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11s11_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -933.2); flame(x, -943.2); }
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -933.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -943.4, { interact: 'lamp' });
  }
  for (let y = -998; y <= -920; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -1000.4);
  function faceHat(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b === 4 || b === 7 ? 'sc_panel' : 'sc_shop';
    if (f <= 5) return (b === 5 || b === 6) && f % 2 === 0 ? 'sc_shop' : 'sc_panel';
    if (f === 12) return 'sc_shop';
    return (b + f) % 3 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceLow(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 4 === 0 ? 'sc_panel' : 'sc_shop';
    if (f % 2 === 0) return 'sc_panel';
    return b >= 3 && b <= 8 ? 'sc_shop' : 'sc_panel';
  }
  function faceUp(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 9) return 'sc_panel';
    if (f === 16) return 'sc_shop';
    return (b * 2 + f) % 5 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function rise(opt) {
    const fg = 'rqp11s11_' + opt.id;
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
  const yS = -932;
  rise({
    id: 'zn', x0: 36, y: yS, wx: 48, f0: 1, f1: 5, b0: 4, b1: 8, db: 4, wk: 0, face: faceHat,
    roofs: [],
  });
  rise({
    id: 'zn', x0: 36, y: yS, wx: 36, f0: 6, f1: 12, b0: 0, b1: 12, db: 4, wk: 1, face: faceHat,
    roofs: [
      { k: 0, x: 36, z: 15 }, { k: 1, x: 60, z: 15 },
      { k: 2, x: 36, z: 36 }, { k: 3, x: 48, z: 36 }, { k: 4, x: 60, z: 36 },
    ],
  });
  rise({
    id: 'nl', x0: 96, y: yS, wx: 96, f0: 1, f1: 8, b0: 0, b1: 12, db: 5, wk: 0, face: faceLow,
    roofs: [{ k: 0, x: 96, z: 24 }, { k: 1, x: 132, z: 24 }],
  });
  rise({
    id: 'nl', x0: 108, y: yS, wx: 108, f0: 9, f1: 16, b0: 0, b1: 12, db: 5, wk: 1, face: faceUp,
    roofs: [0, 1, 2].map((k) => ({ k: k + 2, x: 108 + k * 12, z: 48 })),
  });
  block('rqp11s11_zn', [36, yS, 72, yS + 12]);
  block('rqp11s11_nl', [96, yS, 144, yS + 15]);
  const built = [
    { id: 'rqp11s11_zn', name: '渚南居', x0: 36, y0: yS, W: 36, D: 12, F: 12, style: '倒阶', stemF: 5, stemW: 12, hatW: 36 },
    { id: 'rqp11s11_nl', name: '南濑楼', x0: 96, y0: yS, W: 48, D: 15, F: 16, style: '错移', lowF: 8, lowW: 36, slide: 12, upW: 36 },
  ];
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s11 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s11', name: '南埠南渚', rect: [-16, -1030, 200, -880], src: 'js/rongqiao_expand_p11k.js', load_m: 50, unload_m: 100 });
  const P = N.expansionP11;
  P.slice = 11;
  P.names.road11 = '南渚路';
  P.names.block11 = '渚南居';
  P.names.mix11 = '南濑楼';
  P.road11 = [X0, -944, X1, -932];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.reasons.slice11 = '第十一片再往南 80 m，可玩南界 -980，地面到 -1020。第十片 y -920 的南篱拆掉。新收边绿篱在 -1000，大约在可玩界以南 20 m，篱外仍是硬地。南汀路北缘 -852 再隔 80 m，南渚路仍是 12 m 油漆路面，落在 -944 到 -932，路南仍留约 36 m，不必在正负 10 到 20 里再挪。渚南居是倒阶：底下 5 层只有中间 12 m，6 到 12 层铺开到 36 m。南濑楼是错移：底下 8 层占西侧 36 m，9 到 16 层整段向东挪 12 m，东端没有底层。不重复汀南居的四段细阶、南汀楼的腰洞、湾南居的高低连廊双塔、南湾楼的上层正中开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔，不改南埠中心。河东东界仍是 x 840。菜市场室内不扩。没有第二小学。名字和尺寸未经确认。';
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_zhu_road', name: '南渚路', x: 40, y: -938, desc: '南汀路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_znj', name: '渚南居', x: 54, y: -936, desc: '倒阶。底下 5 层只有中间 12 m，6 到 12 层铺开到 36 m，宽 36 m，进深 12 m。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_nll', name: '南濑楼', x: 120, y: -936, desc: '错移。底下 8 层在西侧 36 m，9 到 16 层向东挪 12 m。进深 15 m。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
