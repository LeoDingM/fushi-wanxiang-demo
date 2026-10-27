/* 南埠 P11 第十六片 (2026-10-26). 可玩南界从 -1300 再往南 80 m，收到 -1380。地面铺到 -1420。
 * 拆掉第十五片 y -1320 的南篱和南侧封边。槐北街的油漆路面和人行道穿过旧篱，接到新南界。
 * 新收边绿篱在可玩界以南约 20 m（y -1400）。篱外再留约 20 m 硬地，人走不到篱外。
 * 南泓路 12 m，只铺路面。按南滩路北缘 -1252 再隔 80 m，路放在 -1344…-1332。路南到可玩界仍留约 36 m，不必在 ±10–20 里再挪。
 * 路北两栋朝南：泓南居是伞冠，1 到 13 层只有中间 24 m 的柱身，14 到 16 层才向两侧各出 12 m 的檐，檐只有顶上 3 层；
 * 南澜楼是对缺，1 到 4 层整板，5 到 8 层西侧缺 18 m，9 到 11 层整板把上下接上，12 到 15 层改到东侧缺 18 m，16 到 19 层再是整板。两处缺口在相反的侧面、不同的楼层。
 * 对象前缀用 rqp11s16_。不重复滩南居的错翼、南宕楼的扭叠、屿南居的鼓腹、南坞楼的侧槽、矶南居的门架、南澳楼的斜折、湄南居的偏悬、南湄楼的肩针、渚南居的倒阶、南濑楼的错移、汀南居的四段细阶、南汀楼的腰洞、湾南居的高低连廊双塔、南湾楼的上层开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔。
 * 不改河东 x 840，不加实时车道，不建菜市场，不建第二小学。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11o || D.rongqiaoExpandP11p || !N.expansionP11) return;
  D.rongqiaoExpandP11p = 1;
  const G = D.ground, BY0 = -1380, GY0 = -1420, X0 = 8, X1 = 176;
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
  const south = (D.colliders || []).find((c) => c.id === 'rqp11s15_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11s15_south');
  }
  const old = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p11_s15;
  if (old && old.objects) old.objects = old.objects.filter((o) => !/^rqp11s15_edge_s_/.test(o.id));
  paint([X0, BY0, X1, -1300], 'S');
  paint([16, BY0, 22, -1300], 'S');
  paint([22, BY0, 28, -1300], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -1300], 'S');
  paint([X0, -1342, X1, -1334], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11s16_west', [-240, -1440, X0, -1356]);
  block('rqp11s16_east', [X1 + 4, -1440, 940, -1356]);
  block('rqp11s16_south', [X0, -1440, X1 + 4, -1384]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11s16_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -1333.2); flame(x, -1343.2); }
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -1333.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -1343.4, { interact: 'lamp' });
  }
  for (let y = -1398; y <= -1320; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -1400.4);
  function faceShaft(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 2 === 0 ? 'sc_shop' : 'sc_panel';
    if (f === 13) return 'sc_panel';
    return (b + f) % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceBrim(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 14) return 'sc_shop';
    if (f === 16) return 'sc_panel';
    return b % 2 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function faceLow(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 2 === 0 ? 'sc_panel' : 'sc_shop';
    if (f === 4) return 'sc_shop';
    return (b + f) % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceNotchW(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 5) return 'sc_shop';
    if (f === 8) return 'sc_panel';
    return b % 2 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function faceBand(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 9) return 'sc_panel';
    if (f === 11) return 'sc_shop';
    return b % 3 === 0 ? 'sc_panel' : 'sc_shop';
  }
  function faceNotchE(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 12) return 'sc_shop';
    if (f === 15) return 'sc_panel';
    return b % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function faceTop(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 16) return 'sc_panel';
    if (f === 19) return 'sc_shop';
    return (b + f) % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function rise(opt) {
    const fg = 'rqp11s16_' + opt.id;
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
  const yS = -1332;
  rise({ id: 'hn', x0: 32, y: yS, wx: 44, f0: 1, f1: 13, b0: 4, b1: 12, db: 4, wk: 0, face: faceShaft, roofs: [] });
  rise({
    id: 'hn', x0: 32, y: yS, wx: 32, f0: 14, f1: 16, b0: 0, b1: 16, db: 4, wk: 1, face: faceBrim,
    roofs: [
      { k: 0, x: 32, z: 39 }, { k: 1, x: 68, z: 39 },
      { k: 2, x: 32, z: 48 }, { k: 3, x: 44, z: 48 }, { k: 4, x: 56, z: 48 }, { k: 5, x: 68, z: 48 },
    ],
  });
  rise({
    id: 'nl', x0: 96, y: yS, wx: 96, f0: 1, f1: 4, b0: 0, b1: 16, db: 5, wk: 0, face: faceLow,
    roofs: [{ k: 0, x: 96, z: 12 }, { k: 1, x: 108, z: 12 }],
  });
  rise({ id: 'nl', x0: 96, y: yS, wx: 114, f0: 5, f1: 8, b0: 6, b1: 16, db: 5, wk: 1, face: faceNotchW, roofs: [] });
  rise({
    id: 'nl', x0: 96, y: yS, wx: 96, f0: 9, f1: 11, b0: 0, b1: 16, db: 5, wk: 2, face: faceBand,
    roofs: [
      { k: 2, x: 96, z: 24 }, { k: 3, x: 108, z: 24 },
      { k: 4, x: 120, z: 33 }, { k: 5, x: 132, z: 33 },
    ],
  });
  rise({ id: 'nl', x0: 96, y: yS, wx: 96, f0: 12, f1: 15, b0: 0, b1: 10, db: 5, wk: 3, face: faceNotchE, roofs: [] });
  rise({
    id: 'nl', x0: 96, y: yS, wx: 96, f0: 16, f1: 19, b0: 0, b1: 16, db: 5, wk: 4, face: faceTop,
    roofs: [
      { k: 6, x: 120, z: 45 }, { k: 7, x: 132, z: 45 },
      { k: 8, x: 96, z: 57 }, { k: 9, x: 108, z: 57 }, { k: 10, x: 120, z: 57 }, { k: 11, x: 132, z: 57 },
    ],
  });
  block('rqp11s16_hn', [32, yS, 80, yS + 12]);
  block('rqp11s16_nl', [96, yS, 144, yS + 15]);
  const built = [
    { id: 'rqp11s16_hn', name: '泓南居', x0: 32, y0: yS, W: 48, D: 12, F: 16, style: '伞冠', shaftW: 24, shaftF: '1-13', brimW: 48, brimF: '14-16' },
    { id: 'rqp11s16_nl', name: '南澜楼', x0: 96, y0: yS, W: 48, D: 15, F: 19, style: '对缺', plateF: '1-4/9-11/16-19', westNotchF: '5-8', westNotchW: 18, eastNotchF: '12-15', eastNotchW: 18 },
  ];
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s16 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s16', name: '南埠南泓', rect: [-16, -1430, 200, -1280], src: 'js/rongqiao_expand_p11p.js', load_m: 50, unload_m: 100 });
  const P = N.expansionP11;
  P.slice = 16;
  P.names.road16 = '南泓路';
  P.names.block16 = '泓南居';
  P.names.mix16 = '南澜楼';
  P.road16 = [X0, -1344, X1, -1332];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.reasons.slice16 = '第十六片再往南 80 m，可玩南界 -1380，地面到 -1420。第十五片 y -1320 的南篱拆掉。新收边绿篱在 -1400，大约在可玩界以南 20 m，篱外仍是硬地。南滩路北缘 -1252 再隔 80 m，南泓路仍是 12 m 油漆路面，落在 -1344 到 -1332，路南仍留约 36 m，不必在正负 10 到 20 里再挪。泓南居是伞冠：1 到 13 层只有中间 24 m 的柱身，14 到 16 层才向两侧各出 12 m 的檐。南澜楼是对缺：1 到 4 层整板，5 到 8 层西侧缺 18 m，9 到 11 层整板接上，12 到 15 层东侧缺 18 m，16 到 19 层再是整板。不重复滩南居的错翼、南宕楼的扭叠、屿南居的鼓腹、南坞楼的侧槽、矶南居的门架、南澳楼的斜折、湄南居的偏悬、南湄楼的肩针、渚南居的倒阶、南濑楼的错移、汀南居的四段细阶、南汀楼的腰洞、湾南居的高低连廊双塔、南湾楼的上层正中开槽、洲南商住的三段阶梯、南洲阁的方点塔，也不另做地标塔，不改南埠中心。河东东界仍是 x 840。菜市场室内不扩。没有第二小学。名字和尺寸未经确认。';
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_hong_road', name: '南泓路', x: 40, y: -1338, desc: '南滩路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_hongj', name: '泓南居', x: 56, y: -1336, desc: '伞冠。1 到 13 层只有中间 24 m 的柱身，14 到 16 层向两侧各出 12 m 的檐。进深 12 m。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_nlan', name: '南澜楼', x: 120, y: -1336, desc: '对缺。5 到 8 层西侧缺 18 m，12 到 15 层东侧缺 18 m，中间和上下都是整板。进深 15 m。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
