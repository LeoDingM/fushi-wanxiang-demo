/* 南埠 P11 第五片 (2026-10-25). 可玩南界从 -420 再往南 80 m，收到 -500。地面铺到 -540。
 * 拆掉第四片 y -440 的南篱和南侧封边。槐北街的油漆路面和人行道穿过旧篱，接到新南界。
 * 新收边绿篱在可玩界以南约 20 m（y -520）。篱外再留约 20 m 硬地，人走不到篱外。
 * 南环路 12 m，只铺路面。按槐南路北缘 -372 再隔 80 m，路放在 -464…-452，不放在 -480…-468。
 * 路北两栋朝南：南环轩是 4 层白裙楼加东端 17 层退台，环南商住是 8 层错窗。不重复槐南铺、南缘楼、槐南居的横窗，也不另做地标塔。
 * 不改河东 x 840，不加实时车道，不建菜市场，不建第二小学。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11d || D.rongqiaoExpandP11e || !N.expansionP11) return;
  D.rongqiaoExpandP11e = 1;
  const G = D.ground, BY0 = -500, GY0 = -540, X0 = 8, X1 = 176;
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
  const south = (D.colliders || []).find((c) => c.id === 'rqp11d_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11d_south');
  }
  const old = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p11_s4;
  if (old && old.objects) old.objects = old.objects.filter((o) => !/^rqp11d_edge_s_/.test(o.id));
  paint([X0, BY0, X1, -420], 'S');
  paint([16, BY0, 22, -420], 'S');
  paint([22, BY0, 28, -420], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -420], 'S');
  paint([X0, -462, X1, -454], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11e_west', [-240, -560, X0, -476]);
  block('rqp11e_east', [X1 + 4, -560, 940, -476]);
  block('rqp11e_south', [X0, -560, X1 + 4, -504]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11e_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -453.2); flame(x, -463.2); }
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -453.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -463.4, { interact: 'lamp' });
  }
  for (let y = -518; y <= -438; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -520.4);
  function facePodium(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1 && (b <= 1 || (b >= 5 && b <= 6))) return 'sc_shop';
    return 'sc_panel';
  }
  function faceTower(f, b, side) {
    if (side === 'W') return b === 1 ? 'sc_shop' : 'sc_panel';
    const local = b - 8;
    if (local === 1) return 'sc_shop';
    if (local === 2 && f % 5 === 0) return 'sc_shop';
    return 'sc_panel';
  }
  function faceHuan(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b >= 6 && b <= 9 ? 'sc_shop' : 'sc_panel';
    return (b + f) % 3 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function rise(opt) {
    const fg = 'rqp11e_' + opt.id;
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
  const yS = -452;
  rise({
    id: 'nhx', x0: 48, y: yS, wx: 48, f0: 1, f1: 4, b0: 0, b1: 12, db: 3, face: facePodium,
    roofs: [{ k: 0, x: 48, z: 12 }, { k: 1, x: 60, z: 12 }],
  });
  rise({
    id: 'nhx', x0: 48, y: yS, wx: 72, f0: 5, f1: 17, b0: 8, b1: 12, db: 3, face: faceTower,
    roofs: [{ k: 2, x: 72, z: 51 }],
  });
  rise({
    id: 'hs', x0: 108, y: yS, wx: 108, f0: 1, f1: 8, b0: 0, b1: 16, db: 4, face: faceHuan,
    roofs: [0, 1, 2, 3].map((k) => ({ k, x: 108 + k * 12, z: 24 })),
  });
  block('rqp11e_nhx', [48, yS, 84, yS + 9]);
  block('rqp11e_hs', [108, yS, 156, yS + 12]);
  const built = [
    { id: 'rqp11e_nhx', name: '南环轩', x0: 48, y0: yS, W: 36, D: 9, F: 17, style: '退台', podiumF: 4, towerW: 12 },
    { id: 'rqp11e_hs', name: '环南商住', x0: 108, y0: yS, W: 48, D: 12, F: 8, style: '错窗' },
  ];
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s5 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s5', name: '南埠南环', rect: [-16, -550, 200, -400], src: 'js/rongqiao_expand_p11e.js', load_m: 50, unload_m: 100 });
  const P = N.expansionP11;
  P.slice = 5;
  P.names.road5 = '南环路';
  P.names.block5 = '南环轩';
  P.names.mix5 = '环南商住';
  P.road5 = [X0, -464, X1, -452];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.reasons.slice5 = '第五片再往南 80 m，可玩南界 -500，地面到 -540。第四片 y -440 的南篱拆掉。新收边绿篱在 -520，大约在可玩界以南 20 m，篱外仍是硬地。南环路仍是 12 m 油漆路面，落在 -464 到 -452。南环轩是 4 层裙楼加 17 层退台，环南商住 8 层错窗。不重复槐南铺、南缘楼、槐南居的横窗，也不另做地标塔，不改南埠中心。河东东界仍是 x 840。菜市场室内不扩。没有第二小学。名字和尺寸未经确认。';
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_nh_road', name: '南环路', x: 40, y: -458, desc: '槐南路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_nhx', name: '南环轩', x: 60, y: -456, desc: '裙楼 4 层、东端退台 17 层。白墙，南立面一条玻璃缝。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_hs', name: '环南商住', x: 132, y: -456, desc: '8 层，宽 48 m，进深 12 m。错窗，底层不是整面玻璃。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
