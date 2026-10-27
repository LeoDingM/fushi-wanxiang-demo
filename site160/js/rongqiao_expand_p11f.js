/* 南埠 P11 第六片 (2026-10-25). 可玩南界从 -500 再往南 80 m，收到 -580。地面铺到 -620。
 * 拆掉第五片 y -520 的南篱和南侧封边。槐北街的油漆路面和人行道穿过旧篱，接到新南界。
 * 新收边绿篱在可玩界以南约 20 m（y -600）。篱外再留约 20 m 硬地，人走不到篱外。
 * 南津路 12 m，只铺路面。按南环路北缘 -452 再隔 80 m，路放在 -544…-532。
 * 路北两栋朝南：津南坊是西端 11 层退台加东翼 3 层铺面，南津居是 15 层双联窗、进深 15 m。
 * 不重复南环轩的东端退台、环南商住的单跨错窗、槐南居的三层玻璃腰，也不另做地标塔。
 * 不改河东 x 840，不加实时车道，不建菜市场，不建第二小学。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11e || D.rongqiaoExpandP11f || !N.expansionP11) return;
  D.rongqiaoExpandP11f = 1;
  const G = D.ground, BY0 = -580, GY0 = -620, X0 = 8, X1 = 176;
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
  const south = (D.colliders || []).find((c) => c.id === 'rqp11e_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11e_south');
  }
  const old = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p11_s5;
  if (old && old.objects) old.objects = old.objects.filter((o) => !/^rqp11e_edge_s_/.test(o.id));
  paint([X0, BY0, X1, -500], 'S');
  paint([16, BY0, 22, -500], 'S');
  paint([22, BY0, 28, -500], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -500], 'S');
  paint([X0, -542, X1, -534], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11f_west', [-240, -640, X0, -556]);
  block('rqp11f_east', [X1 + 4, -640, 940, -556]);
  block('rqp11f_south', [X0, -640, X1 + 4, -584]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11f_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -533.2); flame(x, -543.2); }
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -533.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -543.4, { interact: 'lamp' });
  }
  for (let y = -598; y <= -518; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -600.4);
  function faceJin(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f <= 3) return f === 1 && b >= 7 && b <= 9 ? 'sc_shop' : 'sc_panel';
    if (f % 4 === 3) return 'sc_shop';
    return b === 3 ? 'sc_shop' : 'sc_panel';
  }
  function faceJu(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b === 0 || b === 6 || b === 11 ? 'sc_panel' : 'sc_shop';
    if (f % 5 === 0) return 'sc_panel';
    return (Math.floor(b / 2) + f) % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  function rise(opt) {
    const fg = 'rqp11f_' + opt.id;
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
  const yS = -532;
  rise({
    id: 'jn', x0: 36, y: yS, wx: 36, f0: 1, f1: 3, b0: 0, b1: 12, db: 3, face: faceJin,
    roofs: [{ k: 0, x: 48, z: 9 }, { k: 1, x: 60, z: 9 }],
  });
  rise({
    id: 'jn', x0: 36, y: yS, wx: 36, f0: 4, f1: 11, b0: 0, b1: 4, db: 3, face: faceJin,
    roofs: [{ k: 2, x: 36, z: 33 }],
  });
  rise({
    id: 'jj', x0: 108, y: yS, wx: 108, f0: 1, f1: 15, b0: 0, b1: 12, db: 5, face: faceJu,
    roofs: [0, 1, 2].map((k) => ({ k, x: 108 + k * 12, z: 45 })),
  });
  block('rqp11f_jn', [36, yS, 72, yS + 9]);
  block('rqp11f_jj', [108, yS, 144, yS + 15]);
  const built = [
    { id: 'rqp11f_jn', name: '津南坊', x0: 36, y0: yS, W: 36, D: 9, F: 11, style: '西退台', podiumF: 3, towerW: 12 },
    { id: 'rqp11f_jj', name: '南津居', x0: 108, y0: yS, W: 36, D: 15, F: 15, style: '双联窗' },
  ];
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s6 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s6', name: '南埠南津', rect: [-16, -630, 200, -480], src: 'js/rongqiao_expand_p11f.js', load_m: 50, unload_m: 100 });
  const P = N.expansionP11;
  P.slice = 6;
  P.names.road6 = '南津路';
  P.names.block6 = '津南坊';
  P.names.mix6 = '南津居';
  P.road6 = [X0, -544, X1, -532];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.reasons.slice6 = '第六片再往南 80 m，可玩南界 -580，地面到 -620。第五片 y -520 的南篱拆掉。新收边绿篱在 -600，大约在可玩界以南 20 m，篱外仍是硬地。南津路仍是 12 m 油漆路面，落在 -544 到 -532。津南坊是西端 11 层退台、东翼 3 层铺面，南津居 15 层双联窗、进深 15 m。不重复南环轩的东端退台、环南商住的单跨错窗、槐南居的三层玻璃腰，也不另做地标塔，不改南埠中心。河东东界仍是 x 840。菜市场室内不扩。没有第二小学。名字和尺寸未经确认。';
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_nj_road', name: '南津路', x: 40, y: -538, desc: '南环路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_jnf', name: '津南坊', x: 48, y: -536, desc: '西端 11 层退台，东翼 3 层铺面。白墙，底层玻璃偏在东翼。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_njj', name: '南津居', x: 126, y: -536, desc: '15 层，宽 36 m，进深 15 m。双联窗，第 5、10、15 层是白腰带。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
