/* 南埠 P11 第二片 (2026-10-24). 可玩南界从 -180 再往南 80 m，收到 -260，地面到 -280。
 * 涌南路 12 m，路北两栋仍是瓷砖：南埠菜市场 2F 只做外立面和入口门洞，涌南楼 4F 只有外壳。
 * 瓷砖壳和门洞先放在这里。无缝大厅由 js/rongqiao_market_nanbu.js 接上后拆掉这层壳。
 * 不改河东 x 840 封边，不加实时车道，不建超高层。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11 || D.rongqiaoExpandP11b || !N.expansionP11) return;
  D.rongqiaoExpandP11b = 1;
  const G = D.ground, BY0 = -260, GY0 = -280, X0 = 8, X1 = 176;
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
  const south = (D.colliders || []).find((c) => c.id === 'rqp11_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11_south');
  }
  paint([X0, BY0, X1, -176], 'S');
  paint([16, BY0, 22, -180], 'S');
  paint([22, BY0, 28, -180], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -180], 'S');
  paint([X0, -214, X1, -206], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11b_west', [-240, -300, X0, -218]);
  block('rqp11b_east', [X1 + 4, -300, 940, -218]);
  block('rqp11b_south', [X0, -300, X1 + 4, -264]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11b_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (const x of [42, 78, 96, 114, 132, 150]) flame(x, -205.2);
  for (const x of [42, 60, 78, 96, 114, 132, 150]) flame(x, -218);
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -205.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -215.2, { interact: 'lamp' });
  }
  for (let y = -256; y <= -170; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -262.4);
  const BLOCKS = [
    { id: 'mk', name: '南埠菜市场', x: 36, y: -204, W: 48, D: 12, F: 2, mats: ['m_mosaic', 'm_white'], roof: 'r_shed', doors: [7, 8] },
    { id: 'yn', name: '涌南楼', x: 108, y: -204, W: 36, D: 9, F: 4, roof: 'r_lip', doors: [] },
  ];
  const built = [];
  for (const spec of BLOCKS) {
    const fg = 'rqp11b_' + spec.id, x = spec.x, y = spec.y, F = spec.F, doors = spec.doors || [];
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = 0; b < spec.W / 3; b++) {
        if (f === 1 && doors.indexOf(b) >= 0) {
          put(spec.id + '_door_' + b, 'f_door', x + b * 3, y, { z, state: 'open', fade_group: fg });
          continue;
        }
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
  root.SCENE_CHUNKS.rqe_p11_s2 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s2', name: '南埠南片', rect: [-16, -290, 200, -168], src: 'js/rongqiao_expand_p11b.js', load_m: 40, unload_m: 80 });
  const P = N.expansionP11;
  P.slice = 2;
  P.names.road2 = '涌南路';
  P.names.market = '南埠菜市场';
  P.road2 = [X0, -216, X1, -204];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.market = {
    facade: true, interior: false, seamless: false, name: '南埠菜市场',
    door: [60, -205.5],
    reason: '无缝菜市场要接现有账本、摊位和 openInterior。这一片只留外立面和两跨敞开的门洞，室内留下一刀。',
  };
  P.reasons.slice2 = '第二片再往南 80 m，可玩南界 -260，地面到 -280。涌南路仍是 12 m 油漆路面。涌南楼 4F 已改白墙和玻璃，没有超高层。河东东界仍是 x 840。';
  P.reasons.market = P.market.reason;
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_yn_road', name: '涌南路', x: 40, y: -210, desc: '南埠路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_market', name: '南埠菜市场', x: 60, y: -208, desc: '2 层瓷砖外立面，入口是门洞。室内未开。名字未经确认', cat: 'life' },
    { id: 'p11_yn', name: '涌南楼', x: 120, y: -208, desc: '4 层白墙和玻璃。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
