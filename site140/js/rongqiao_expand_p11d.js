/* 南埠 P11 第四片 (2026-10-24). Leo 说继续，不再等立面反馈。
 * 可玩南界从 -340 再往南 80 m，收到 -420。地面铺到 -460。
 * 拆掉第三片 y -342 的南篱和南侧封边。槐北街的油漆路面和人行道穿过旧篱。
 * 新收边绿篱在可玩界以南约 20 m（y -440）。篱外再留约 20 m 硬地，人走不到篱外。
 * 槐南路 12 m，只铺路面。路北三栋朝南：槐南铺 3F、南缘楼 5F，外加槐南居 12F。
 * 槐南居是白墙夹玻璃腰，只在两跨出阳台。不重复涌南居、埠南阁、埠西阁、涌背居，也不改南埠中心。
 * 不改河东 x 840，不加实时车道，不建菜市场，不建第二小学。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11c || D.rongqiaoExpandP11d || !N.expansionP11) return;
  D.rongqiaoExpandP11d = 1;
  const G = D.ground, BY0 = -420, GY0 = -460, X0 = 8, X1 = 176;
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
  const south = (D.colliders || []).find((c) => c.id === 'rqp11c_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11c_south');
  }
  const old = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p11_s3;
  if (old && old.objects) old.objects = old.objects.filter((o) => !/^rqp11c_edge_s_/.test(o.id));
  paint([X0, BY0, X1, -340], 'S');
  paint([16, BY0, 22, -340], 'S');
  paint([22, BY0, 28, -340], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -340], 'S');
  paint([X0, -382, X1, -374], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11d_west', [-240, -480, X0, -376]);
  block('rqp11d_east', [X1 + 4, -480, 940, -376]);
  block('rqp11d_south', [X0, -480, X1 + 4, -424]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11d_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -373.2); flame(x, -383.2); }
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -373.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -383.4, { interact: 'lamp' });
  }
  for (let y = -438; y <= -340; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -440.4);
  const BLOCKS = [
    { id: 'sp', name: '槐南铺', x: 40, y: -372, W: 36, D: 9, F: 3, kind: 'street', style: '街铺' },
    { id: 'ny', name: '南缘楼', x: 84, y: -372, W: 24, D: 9, F: 5, kind: 'street', style: '街铺' },
    { id: 'hn', name: '槐南居', x: 132, y: -372, W: 24, D: 9, F: 12, kind: 'belt', style: '玻璃腰' },
  ];
  function face(spec, f, b, side) {
    if (spec.kind === 'belt') {
      if (side === 'W') return 'sc_panel';
      if (f === 1 || f % 3 === 2) return 'sc_shop';
      return 'sc_panel';
    }
    if (side === 'W') return 'sc_panel';
    return f === 1 || b % 2 === 0 ? 'sc_shop' : 'sc_panel';
  }
  const built = [];
  for (const spec of BLOCKS) {
    const fg = 'rqp11d_' + spec.id, x = spec.x, y = spec.y, F = spec.F;
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = 0; b < spec.W / 3; b++) {
        put(spec.id + '_S' + f + '_' + b, 'f_wall', x + b * 3, y, { z, state: st, fade_group: fg, variant: face(spec, f, b, 'S') });
      }
      for (let b = 0; b < spec.D / 3; b++) {
        put(spec.id + '_W' + f + '_' + b, 'f_wall', x, y + 3 + b * 3, { z, rot: 6, state: st, fade_group: fg, variant: face(spec, f, b, 'W') });
      }
    }
    if (spec.kind === 'belt') {
      for (let f = 3; f <= F; f += 3) for (const b of [2, 5]) {
        put(spec.id + '_bal' + f + '_' + b, 'rq_nb_balc', x + b * 3, y, { z: (f - 1) * 3, fade_group: fg });
      }
    }
    for (let k = 0; k < spec.W / 12; k++) put(spec.id + '_roof_' + k, 'b_roof_b', x + k * 12, y, { z: F * 3, fade_group: fg, variant: 'r_lip' });
    block(fg, [x, y, x + spec.W, y + spec.D]);
    built.push({ id: fg, name: spec.name, x0: x, y0: y, W: spec.W, D: spec.D, F, style: spec.style });
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s4 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s4', name: '南埠槐南', rect: [-16, -470, 200, -328], src: 'js/rongqiao_expand_p11d.js', load_m: 40, unload_m: 80 });
  const P = N.expansionP11;
  P.slice = 4;
  P.names.road4 = '槐南路';
  P.names.shop4 = '槐南铺';
  P.names.block4 = '南缘楼';
  P.names.mid4 = '槐南居';
  P.road4 = [X0, -384, X1, -372];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.reasons.slice4 = '第四片再往南 80 m，可玩南界 -420，地面到 -460。第三片 y -342 的南篱拆掉。新收边绿篱在 -440，大约在可玩界以南 20 m，篱外仍是硬地。槐南路仍是 12 m 油漆路面。槐南铺 3F、南缘楼 5F 是白墙和玻璃。槐南居 12F 是玻璃腰，只在两跨出阳台，不重复已有中高层，也不改南埠中心。河东东界仍是 x 840。菜市场室内不扩。没有第二小学。';
  if (P.reasons.sky) P.reasons.sky = P.reasons.sky.replace('南界仍是 -340。', '南埠中心轮廓不因南扩改动。');
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_hn_road', name: '槐南路', x: 40, y: -378, desc: '埠南路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_hn', name: '槐南铺', x: 56, y: -376, desc: '3 层白墙和玻璃。只是外观。名字未经确认', cat: 'life' },
    { id: 'p11_ny', name: '南缘楼', x: 96, y: -376, desc: '5 层白墙和玻璃。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_hnj', name: '槐南居', x: 144, y: -376, desc: '12 层。白墙为主，每三层一条玻璃腰，南立面只在两跨出阳台。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
