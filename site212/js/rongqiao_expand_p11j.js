/* 南埠 P11 第十片 (2026-10-25). 可玩南界从 -820 再往南 80 m，收到 -900。地面铺到 -940。
 * 拆掉第九片 y -840 的南篱和南侧封边。槐北街的油漆路面和人行道穿过旧篱，接到新南界。
 * 新收边绿篱在可玩界以南约 20 m（y -920）。篱外再留约 20 m 硬地，人走不到篱外。
 * 南汀路 12 m，只铺路面。按南湾路北缘 -772 再隔 80 m，路放在 -864…-852。
 * 路北两栋朝南：汀南居是西高东低的四段细阶（20 / 15 / 10 / 6 层，每段 12 m）；
 * 南汀楼是 14 层整板，5 到 10 层正中 24 m 腰洞，上下仍连在一起。腰洞里不放压顶，也不加内墙。
 * 不重复湾南居的高低连廊双塔、南湾楼的上层正中开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔。
 * 不改河东 x 840，不加实时车道，不建菜市场，不建第二小学。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11i || D.rongqiaoExpandP11j || !N.expansionP11) return;
  D.rongqiaoExpandP11j = 1;
  const G = D.ground, BY0 = -900, GY0 = -940, X0 = 8, X1 = 176;
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
  const south = (D.colliders || []).find((c) => c.id === 'rqp11i_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11i_south');
  }
  const old = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p11_s9;
  if (old && old.objects) old.objects = old.objects.filter((o) => !/^rqp11i_edge_s_/.test(o.id));
  paint([X0, BY0, X1, -820], 'S');
  paint([16, BY0, 22, -820], 'S');
  paint([22, BY0, 28, -820], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -820], 'S');
  paint([X0, -862, X1, -854], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11j_west', [-240, -960, X0, -876]);
  block('rqp11j_east', [X1 + 4, -960, 940, -876]);
  block('rqp11j_south', [X0, -960, X1 + 4, -904]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11j_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -853.2); flame(x, -863.2); }
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -853.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -863.4, { interact: 'lamp' });
  }
  for (let y = -918; y <= -840; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -920.4);
  function stepMax(b) {
    if (b < 4) return 20;
    if (b < 8) return 15;
    if (b < 12) return 10;
    return 6;
  }
  function faceSaw(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 4 === 0 ? 'sc_panel' : 'sc_shop';
    if (f === stepMax(b)) return 'sc_shop';
    return (b % 4) === ((f - 2) % 4) ? 'sc_shop' : 'sc_panel';
  }
  function faceFrame(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 3 === 0 ? 'sc_panel' : 'sc_shop';
    if (f >= 5 && f <= 10) {
      if (b === 3 || b === 12) return 'sc_shop';
      if (b === 1 || b === 14) return f % 2 === 0 ? 'sc_shop' : 'sc_panel';
      return 'sc_panel';
    }
    return b % 4 === 1 ? 'sc_shop' : 'sc_panel';
  }
  function rise(opt) {
    const fg = 'rqp11j_' + opt.id;
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
  const yS = -852;
  rise({
    id: 'tn', x0: 32, y: yS, wx: 32, f0: 1, f1: 20, b0: 0, b1: 4, db: 3, wk: 0, face: faceSaw,
    roofs: [{ k: 0, x: 32, z: 60 }],
  });
  rise({
    id: 'tn', x0: 32, y: yS, f0: 1, f1: 15, b0: 4, b1: 8, face: faceSaw,
    roofs: [{ k: 1, x: 44, z: 45 }],
  });
  rise({
    id: 'tn', x0: 32, y: yS, f0: 1, f1: 10, b0: 8, b1: 12, face: faceSaw,
    roofs: [{ k: 2, x: 56, z: 30 }],
  });
  rise({
    id: 'tn', x0: 32, y: yS, f0: 1, f1: 6, b0: 12, b1: 16, face: faceSaw,
    roofs: [{ k: 3, x: 68, z: 18 }],
  });
  rise({
    id: 'tl', x0: 100, y: yS, wx: 100, f0: 1, f1: 4, b0: 0, b1: 16, db: 4, wk: 0, face: faceFrame,
    roofs: [],
  });
  rise({
    id: 'tl', x0: 100, y: yS, wx: 100, f0: 5, f1: 10, b0: 0, b1: 4, db: 4, wk: 0, face: faceFrame,
    roofs: [],
  });
  rise({
    id: 'tl', x0: 100, y: yS, f0: 5, f1: 10, b0: 12, b1: 16, face: faceFrame,
    roofs: [],
  });
  rise({
    id: 'tl', x0: 100, y: yS, wx: 100, f0: 11, f1: 14, b0: 0, b1: 16, db: 4, wk: 0, face: faceFrame,
    roofs: [0, 1, 2, 3].map((k) => ({ k, x: 100 + k * 12, z: 42 })),
  });
  block('rqp11j_tn', [32, yS, 80, yS + 9]);
  block('rqp11j_tl', [100, yS, 148, yS + 12]);
  const built = [
    { id: 'rqp11j_tn', name: '汀南居', x0: 32, y0: yS, W: 48, D: 9, F: 20, style: '细阶', steps: '20/15/10/6', stepW: '12/12/12/12' },
    { id: 'rqp11j_tl', name: '南汀楼', x0: 100, y0: yS, W: 48, D: 12, F: 14, style: '腰洞', waistF: '5-10', waistW: 24, pierW: 12 },
  ];
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s10 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s10', name: '南埠南汀', rect: [-16, -950, 200, -800], src: 'js/rongqiao_expand_p11j.js', load_m: 50, unload_m: 100 });
  const P = N.expansionP11;
  P.slice = 10;
  P.names.road10 = '南汀路';
  P.names.block10 = '汀南居';
  P.names.mix10 = '南汀楼';
  P.road10 = [X0, -864, X1, -852];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.reasons.slice10 = '第十片再往南 80 m，可玩南界 -900，地面到 -940。第九片 y -840 的南篱拆掉。新收边绿篱在 -920，大约在可玩界以南 20 m，篱外仍是硬地。南汀路仍是 12 m 油漆路面，落在 -864 到 -852。汀南居是西高东低的四段细阶，20 层、15 层、10 层、6 层，每段宽 12 m。南汀楼是 14 层整板，5 到 10 层正中 24 m 腰洞，上下仍连成一块。不重复湾南居的高低连廊双塔、南湾楼的上层正中开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔，不改南埠中心。河东东界仍是 x 840。菜市场室内不扩。没有第二小学。名字和尺寸未经确认。';
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_nt_road', name: '南汀路', x: 40, y: -858, desc: '南湾路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_tnj', name: '汀南居', x: 56, y: -856, desc: '西高东低四段细阶，20 / 15 / 10 / 6 层，每段宽 12 m。每段顶层一条玻璃带，其余层一条斜向玻璃缝。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_ntl', name: '南汀楼', x: 124, y: -856, desc: '14 层，宽 48 m，进深 12 m。5 到 10 层正中 24 m 是腰洞，上下仍连成一整板。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
