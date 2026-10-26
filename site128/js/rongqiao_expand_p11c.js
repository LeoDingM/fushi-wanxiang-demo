/* 南埠 P11 第三片 (2026-10-24). 可玩南界从 -260 再往南 80 m，收到 -340，地面到 -360。
 * 埠南路 12 m，路北两栋是白墙和玻璃：埠南商铺 4F、埠南仓 2F，都只有外壳。
 * 拆掉第二片南侧封边和那道收边绿篱，槐北街的油漆路面继续铺下来。
 * 不改河东 x 840 封边，不加实时车道，不建超高层，不改公交，不扩菜市场室内。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11b || !D.rongqiaoMarketNanbu || D.rongqiaoExpandP11c || !N.expansionP11) return;
  D.rongqiaoExpandP11c = 1;
  const G = D.ground, BY0 = -340, GY0 = -360, X0 = 8, X1 = 176;
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
  const south = (D.colliders || []).find((c) => c.id === 'rqp11b_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11b_south');
  }
  const old = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p11_s2;
  if (old && old.objects) old.objects = old.objects.filter((o) => !/^rqp11b_edge_s_/.test(o.id));
  paint([X0, BY0, X1, -260], 'S');
  paint([16, BY0, 22, -260], 'S');
  paint([22, BY0, 28, -260], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -260], 'S');
  paint([X0, -302, X1, -294], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11c_west', [-240, -380, X0, -298]);
  block('rqp11c_east', [X1 + 4, -380, 940, -298]);
  block('rqp11c_south', [X0, -380, X1 + 4, -344]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11c_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -293.2); flame(x, -303.2); }
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -293.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -303.4, { interact: 'lamp' });
  }
  for (let y = -338; y <= -258; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -342.4);
  const BLOCKS = [
    { id: 'sp', name: '埠南商铺', x: 40, y: -292, W: 36, D: 9, F: 4 },
    { id: 'wh', name: '埠南仓', x: 108, y: -292, W: 36, D: 9, F: 2 },
  ];
  const built = [];
  for (const spec of BLOCKS) {
    const fg = 'rqp11c_' + spec.id, x = spec.x, y = spec.y, F = spec.F;
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = 0; b < spec.W / 3; b++) {
        const v = f === 1 || b % 2 === 0 ? 'sc_shop' : 'sc_panel';
        put(spec.id + '_S' + f + '_' + b, 'f_wall', x + b * 3, y, { z, state: st, fade_group: fg, variant: v });
      }
      for (let b = 0; b < spec.D / 3; b++) {
        put(spec.id + '_W' + f + '_' + b, 'f_wall', x, y + 3 + b * 3, { z, rot: 6, state: st, fade_group: fg, variant: 'sc_panel' });
      }
    }
    for (let k = 0; k < spec.W / 12; k++) put(spec.id + '_roof_' + k, 'b_roof_b', x + k * 12, y, { z: F * 3, fade_group: fg, variant: 'r_lip' });
    block(fg, [x, y, x + spec.W, y + spec.D]);
    built.push({ id: fg, name: spec.name, x0: x, y0: y, W: spec.W, D: spec.D, F });
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s3 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s3', name: '南埠埠南', rect: [-16, -370, 200, -248], src: 'js/rongqiao_expand_p11c.js', load_m: 40, unload_m: 80 });
  const P = N.expansionP11;
  P.slice = 3;
  P.names.road3 = '埠南路';
  P.names.shop3 = '埠南商铺';
  P.names.yard3 = '埠南仓';
  P.road3 = [X0, -304, X1, -292];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.reasons.slice3 = '第三片再往南 80 m，可玩南界 -340，地面到 -360。埠南路仍是 12 m 油漆路面。埠南商铺 4F、埠南仓 2F 已改白墙和玻璃，没有超高层。河东东界仍是 x 840。菜市场室内不扩。';
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_bn_road', name: '埠南路', x: 40, y: -298, desc: '涌南路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_bn', name: '埠南商铺', x: 56, y: -308, desc: '4 层白墙和玻璃。只是外观。名字未经确认', cat: 'life' },
    { id: 'p11_wh3', name: '埠南仓', x: 120, y: -308, desc: '2 层白墙货仓。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
