/* 南埠 P11 第九片 (2026-10-25). 可玩南界从 -740 再往南 80 m，收到 -820。地面铺到 -860。
 * 拆掉第八片 y -760 的南篱和南侧封边。槐北街的油漆路面和人行道穿过旧篱，接到新南界。
 * 新收边绿篱在可玩界以南约 20 m（y -840）。篱外再留约 20 m 硬地，人走不到篱外。
 * 南湾路 12 m，只铺路面。按南洲路北缘 -692 再隔 80 m，路放在 -784…-772。
 * 路北两栋朝南：湾南居是西塔 18 层、连廊 3 层、东塔 13 层；南湾楼是 10 层板楼，5 层以上正中开一槽。
 * 不重复洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔。
 * 不改河东 x 840，不加实时车道，不建菜市场，不建第二小学。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11h || D.rongqiaoExpandP11i || !N.expansionP11) return;
  D.rongqiaoExpandP11i = 1;
  const G = D.ground, BY0 = -820, GY0 = -860, X0 = 8, X1 = 176;
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
  const south = (D.colliders || []).find((c) => c.id === 'rqp11h_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11h_south');
  }
  const old = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p11_s8;
  if (old && old.objects) old.objects = old.objects.filter((o) => !/^rqp11h_edge_s_/.test(o.id));
  paint([X0, BY0, X1, -740], 'S');
  paint([16, BY0, 22, -740], 'S');
  paint([22, BY0, 28, -740], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -740], 'S');
  paint([X0, -782, X1, -774], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11i_west', [-240, -880, X0, -796]);
  block('rqp11i_east', [X1 + 4, -880, 940, -796]);
  block('rqp11i_south', [X0, -880, X1 + 4, -824]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11i_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -773.2); flame(x, -783.2); }
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -773.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -783.4, { interact: 'lamp' });
  }
  for (let y = -838; y <= -760; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -840.4);
  function faceTwin(f, b, side) {
    if (side === 'W') return 'sc_panel';
    const zone = b < 4 ? 'W' : b < 12 ? 'L' : 'E';
    const local = zone === 'W' ? b : zone === 'L' ? b - 4 : b - 12;
    if (f === 1) {
      if (zone === 'L') return b === 6 || b === 9 ? 'sc_panel' : 'sc_shop';
      return local === 0 ? 'sc_panel' : 'sc_shop';
    }
    if (zone === 'L') return local === 0 || local === 7 ? 'sc_shop' : 'sc_panel';
    if (zone === 'W') return local === (f % 4) ? 'sc_shop' : 'sc_panel';
    return local === (3 - (f % 4)) ? 'sc_shop' : 'sc_panel';
  }
  function faceSplit(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 3 === 2 ? 'sc_panel' : 'sc_shop';
    const shift = Math.floor((f - 2) / 2) % 4;
    const pos = (b + shift) % 4;
    return pos === 1 || pos === 2 ? 'sc_shop' : 'sc_panel';
  }
  function rise(opt) {
    const fg = 'rqp11i_' + opt.id;
    const wk = opt.wk || 0;
    for (let f = opt.f0; f <= opt.f1; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = opt.b0; b < opt.b1; b++) {
        put(opt.id + '_S' + f + '_' + b, 'f_wall', opt.x0 + b * 3, opt.y, { z, state: st, fade_group: fg, variant: opt.face(f, b, 'S') });
      }
      for (let b = 0; b < opt.db; b++) {
        put(opt.id + '_W' + f + '_' + wk + '_' + b, 'f_wall', opt.wx, opt.y + 3 + b * 3, { z, rot: 6, state: st, fade_group: fg, variant: opt.face(f, b, 'W') });
      }
    }
    for (const roof of opt.roofs) put(opt.id + '_roof_' + roof.k, 'b_roof_b', roof.x, opt.y, { z: roof.z, fade_group: fg, variant: 'r_lip' });
  }
  const yS = -772;
  rise({
    id: 'wn', x0: 36, y: yS, wx: 36, f0: 1, f1: 3, b0: 0, b1: 16, db: 4, wk: 0, face: faceTwin,
    roofs: [{ k: 0, x: 48, z: 9 }, { k: 1, x: 60, z: 9 }],
  });
  rise({
    id: 'wn', x0: 36, y: yS, wx: 36, f0: 4, f1: 18, b0: 0, b1: 4, db: 4, wk: 0, face: faceTwin,
    roofs: [{ k: 2, x: 36, z: 54 }],
  });
  rise({
    id: 'wn', x0: 36, y: yS, wx: 72, f0: 4, f1: 13, b0: 12, b1: 16, db: 4, wk: 1, face: faceTwin,
    roofs: [{ k: 3, x: 72, z: 39 }],
  });
  rise({
    id: 'wl', x0: 108, y: yS, wx: 108, f0: 1, f1: 5, b0: 0, b1: 12, db: 5, wk: 0, face: faceSplit,
    roofs: [0, 1, 2].map((k) => ({ k, x: 108 + k * 12, z: 15 })),
  });
  rise({
    id: 'wl', x0: 108, y: yS, wx: 108, f0: 6, f1: 10, b0: 0, b1: 4, db: 5, wk: 0, face: faceSplit,
    roofs: [{ k: 3, x: 108, z: 30 }],
  });
  rise({
    id: 'wl', x0: 108, y: yS, wx: 132, f0: 6, f1: 10, b0: 8, b1: 12, db: 5, wk: 1, face: faceSplit,
    roofs: [{ k: 4, x: 132, z: 30 }],
  });
  block('rqp11i_wn', [36, yS, 84, yS + 12]);
  block('rqp11i_wl', [108, yS, 144, yS + 15]);
  const built = [
    { id: 'rqp11i_wn', name: '湾南居', x0: 36, y0: yS, W: 48, D: 12, F: 18, style: '双塔', westF: 18, eastF: 13, linkF: 3, towerW: 12 },
    { id: 'rqp11i_wl', name: '南湾楼', x0: 108, y0: yS, W: 36, D: 15, F: 10, style: '分冠', podiumF: 5, crownW: 12 },
  ];
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s9 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s9', name: '南埠南湾', rect: [-16, -870, 200, -720], src: 'js/rongqiao_expand_p11i.js', load_m: 50, unload_m: 100 });
  const P = N.expansionP11;
  P.slice = 9;
  P.names.road9 = '南湾路';
  P.names.block9 = '湾南居';
  P.names.mix9 = '南湾楼';
  P.road9 = [X0, -784, X1, -772];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.reasons.slice9 = '第九片再往南 80 m，可玩南界 -820，地面到 -860。第八片 y -760 的南篱拆掉。新收边绿篱在 -840，大约在可玩界以南 20 m，篱外仍是硬地。南湾路仍是 12 m 油漆路面，落在 -784 到 -772。湾南居是西塔 18 层、连廊 3 层、东塔 13 层，南湾楼是 10 层、5 层以上正中开槽的分冠。不重复洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔，不改南埠中心。河东东界仍是 x 840。菜市场室内不扩。没有第二小学。名字和尺寸未经确认。';
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_nw_road', name: '南湾路', x: 40, y: -778, desc: '南洲路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_wnj', name: '湾南居', x: 60, y: -776, desc: '西塔 18 层、宽 12 m，连廊 3 层、宽 24 m，东塔 13 层、宽 12 m。塔楼各一条斜向玻璃缝。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_nwl', name: '南湾楼', x: 126, y: -776, desc: '10 层，宽 36 m，进深 15 m。5 层以上正中 12 m 开槽，玻璃按两跨一组逐层平移。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
