/* 南埠 P11 第十二片 (2026-10-26). 可玩南界从 -980 再往南 80 m，收到 -1060。地面铺到 -1100。
 * 拆掉第十一片 y -1000 的南篱和南侧封边。槐北街的油漆路面和人行道穿过旧篱，接到新南界。
 * 新收边绿篱在可玩界以南约 20 m（y -1080）。篱外再留约 20 m 硬地，人走不到篱外。
 * 南湄路 12 m，只铺路面。按南渚路北缘 -932 再隔 80 m，路放在 -1024…-1012。路南到可玩界仍留约 36 m，不必在 ±10–20 里再挪。
 * 路北两栋朝南：湄南居是偏悬，裙楼 5 层铺满 48 m，6 到 16 层的 36 m 塔身坐在东侧并再向东悬出 12 m；
 * 南湄楼是肩针，底下 5 层是 48 m 整板，6 到 18 层正中立一根 12 m 的针，6 到 11 层两侧再各留 12 m 的肩，针和肩之间左右各空 6 m。
 * 对象前缀用 rqp11s12_。不重复渚南居的倒阶、南濑楼的错移、汀南居的四段细阶、南汀楼的腰洞、湾南居的高低连廊双塔、南湾楼的上层开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔。
 * 不改河东 x 840，不加实时车道，不建菜市场，不建第二小学。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11k || D.rongqiaoExpandP11l || !N.expansionP11) return;
  D.rongqiaoExpandP11l = 1;
  const G = D.ground, BY0 = -1060, GY0 = -1100, X0 = 8, X1 = 176;
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
  const south = (D.colliders || []).find((c) => c.id === 'rqp11s11_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11s11_south');
  }
  const old = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p11_s11;
  if (old && old.objects) old.objects = old.objects.filter((o) => !/^rqp11s11_edge_s_/.test(o.id));
  paint([X0, BY0, X1, -980], 'S');
  paint([16, BY0, 22, -980], 'S');
  paint([22, BY0, 28, -980], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -980], 'S');
  paint([X0, -1022, X1, -1014], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11s12_west', [-240, -1120, X0, -1036]);
  block('rqp11s12_east', [X1 + 4, -1120, 940, -1036]);
  block('rqp11s12_south', [X0, -1120, X1 + 4, -1064]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11s12_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -1013.2); flame(x, -1023.2); }
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -1013.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -1023.4, { interact: 'lamp' });
  }
  for (let y = -1078; y <= -1000; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -1080.4);
  function facePod(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 4 === 0 ? 'sc_panel' : 'sc_shop';
    if (f === 5) return 'sc_shop';
    return b % 2 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function faceHang(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 16 || f % 5 === 0) return 'sc_shop';
    if (b < 2 || b >= 10) return 'sc_shop';
    return 'sc_panel';
  }
  function faceBase(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 4 === 0 ? 'sc_panel' : 'sc_shop';
    if (f === 5) return 'sc_panel';
    return (b + f) % 4 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceSh(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 11) return 'sc_shop';
    if (b === 3 || b === 12) return 'sc_shop';
    return f % 2 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function faceNeedle(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 18) return 'sc_shop';
    if (f === 12) return 'sc_panel';
    return b === 7 || b === 8 ? 'sc_shop' : 'sc_panel';
  }
  function rise(opt) {
    const fg = 'rqp11s12_' + opt.id;
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
  const yS = -1012;
  rise({
    id: 'mh', x0: 32, y: yS, wx: 32, f0: 1, f1: 5, b0: 0, b1: 16, db: 4, wk: 0, face: facePod,
    roofs: [{ k: 0, x: 32, z: 15 }, { k: 1, x: 44, z: 15 }],
  });
  rise({
    id: 'mh', x0: 56, y: yS, wx: 56, f0: 6, f1: 16, b0: 0, b1: 12, db: 4, wk: 1, face: faceHang,
    roofs: [
      { k: 2, x: 80, z: 15 },
      { k: 3, x: 56, z: 48 }, { k: 4, x: 68, z: 48 }, { k: 5, x: 80, z: 48 },
    ],
  });
  rise({
    id: 'ml', x0: 108, y: yS, wx: 108, f0: 1, f1: 5, b0: 0, b1: 16, db: 5, wk: 0, face: faceBase,
    roofs: [],
  });
  rise({
    id: 'ml', x0: 108, y: yS, wx: 108, f0: 6, f1: 11, b0: 0, b1: 4, db: 5, wk: 1, face: faceSh,
    roofs: [{ k: 0, x: 108, z: 33 }],
  });
  rise({
    id: 'ml', x0: 108, y: yS, wx: 144, f0: 6, f1: 11, b0: 12, b1: 16, db: 5, wk: 2, face: faceSh,
    roofs: [{ k: 1, x: 144, z: 33 }],
  });
  rise({
    id: 'ml', x0: 108, y: yS, wx: 126, f0: 6, f1: 18, b0: 6, b1: 10, db: 5, wk: 3, face: faceNeedle,
    roofs: [{ k: 2, x: 126, z: 54 }],
  });
  block('rqp11s12_mh', [32, yS, 92, yS + 12]);
  block('rqp11s12_ml', [108, yS, 156, yS + 15]);
  const built = [
    { id: 'rqp11s12_mh', name: '湄南居', x0: 32, y0: yS, W: 60, D: 12, F: 16, style: '偏悬', podiumF: 5, podiumW: 48, towerW: 36, hang: 12 },
    { id: 'rqp11s12_ml', name: '南湄楼', x0: 108, y0: yS, W: 48, D: 15, F: 18, style: '肩针', baseF: 5, shoulderF: '6-11', shoulderW: 12, slotW: 24, needleF: '6-18', needleW: 12 },
  ];
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s12 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s12', name: '南埠南湄', rect: [-16, -1110, 200, -960], src: 'js/rongqiao_expand_p11l.js', load_m: 50, unload_m: 100 });
  const P = N.expansionP11;
  P.slice = 12;
  P.names.road12 = '南湄路';
  P.names.block12 = '湄南居';
  P.names.mix12 = '南湄楼';
  P.road12 = [X0, -1024, X1, -1012];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.reasons.slice12 = '第十二片再往南 80 m，可玩南界 -1060，地面到 -1100。第十一片 y -1000 的南篱拆掉。新收边绿篱在 -1080，大约在可玩界以南 20 m，篱外仍是硬地。南渚路北缘 -932 再隔 80 m，南湄路仍是 12 m 油漆路面，落在 -1024 到 -1012，路南仍留约 36 m，不必在正负 10 到 20 里再挪。湄南居是偏悬：裙楼 5 层铺满 48 m，6 到 16 层的 36 m 塔身坐在东侧，再向东悬出 12 m，西侧裙楼顶留着 24 m。南湄楼是肩针：底下 5 层是 48 m 整板，6 到 18 层正中立一根 12 m 的针，6 到 11 层两侧再各留 12 m 的肩，针和肩之间左右各空 6 m，12 层以上只剩这根针。不重复渚南居的倒阶、南濑楼的错移、汀南居的四段细阶、南汀楼的腰洞、湾南居的高低连廊双塔、南湾楼的上层正中开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔，不改南埠中心。河东东界仍是 x 840。菜市场室内不扩。没有第二小学。名字和尺寸未经确认。';
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_mei_road', name: '南湄路', x: 40, y: -1018, desc: '南渚路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_mhj', name: '湄南居', x: 62, y: -1016, desc: '偏悬。裙楼 5 层宽 48 m，6 到 16 层向东悬出 12 m。进深 12 m。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_nml', name: '南湄楼', x: 132, y: -1016, desc: '肩针。底下 5 层整板，6 到 18 层正中一根 12 m 的针，6 到 11 层两侧留肩。进深 15 m。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
