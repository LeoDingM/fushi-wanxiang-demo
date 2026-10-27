/* 南埠 P11 第八片 (2026-10-25). 可玩南界从 -660 再往南 80 m，收到 -740。地面铺到 -780。
 * 拆掉第七片 y -680 的南篱和南侧封边。槐北街的油漆路面和人行道穿过旧篱，接到新南界。
 * 新收边绿篱在可玩界以南约 20 m（y -760）。篱外再留约 20 m 硬地，人走不到篱外。
 * 南洲路 12 m，只铺路面。按南浦路北缘 -612 再隔 80 m，路放在 -704…-692。
 * 路北两栋朝南：洲南商住是西低东高的三段阶梯（5 / 11 / 16 层），南洲阁是 21 层的 12 m 方点塔。
 * 不重复浦南商住的正中退台、南环轩的东端退台、津南坊的西端退台、南浦居的窄深板，也不另做地标塔。
 * 不改河东 x 840，不加实时车道，不建菜市场，不建第二小学。数字未经Leo确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11g || D.rongqiaoExpandP11h || !N.expansionP11) return;
  D.rongqiaoExpandP11h = 1;
  const G = D.ground, BY0 = -740, GY0 = -780, X0 = 8, X1 = 176;
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
  const south = (D.colliders || []).find((c) => c.id === 'rqp11g_south');
  if (south) {
    const r = south.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqp11g_south');
  }
  const old = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p11_s7;
  if (old && old.objects) old.objects = old.objects.filter((o) => !/^rqp11g_edge_s_/.test(o.id));
  paint([X0, BY0, X1, -660], 'S');
  paint([16, BY0, 22, -660], 'S');
  paint([22, BY0, 28, -660], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -660], 'S');
  paint([X0, -702, X1, -694], null, (x) => roadX(x));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11h_west', [-240, -800, X0, -716]);
  block('rqp11h_east', [X1 + 4, -800, 940, -716]);
  block('rqp11h_south', [X0, -800, X1 + 4, -744]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11h_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -693.2); flame(x, -703.2); }
  for (const x of [48, 132]) {
    put('lamp_n_' + x, 'p_lamp', x, -693.4, { interact: 'lamp' });
    put('lamp_s_' + x, 'p_lamp', x, -703.4, { interact: 'lamp' });
  }
  for (let y = -758; y <= -678; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 12; x <= 170; x += 4) put('edge_s_' + x, 'p_hedge', x, -760.4);
  function faceStep(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f === 1) return b % 5 === 0 ? 'sc_panel' : 'sc_shop';
    const band = Math.floor((f - 2) / 2) % 2;
    const pair = Math.floor(b / 2) % 2;
    return band === pair ? 'sc_shop' : 'sc_panel';
  }
  function facePoint(f, b, side) {
    if (side === 'W') return 'sc_panel';
    if (f % 4 === 0) return b === 1 || b === 2 ? 'sc_panel' : 'sc_shop';
    return b === 1 || b === 2 ? 'sc_shop' : 'sc_panel';
  }
  function rise(opt) {
    const fg = 'rqp11h_' + opt.id;
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
  const yS = -692;
  rise({
    id: 'zn', x0: 36, y: yS, wx: 36, f0: 1, f1: 5, b0: 0, b1: 16, db: 3, face: faceStep,
    roofs: [{ k: 0, x: 36, z: 15 }, { k: 1, x: 48, z: 15 }],
  });
  rise({
    id: 'zn', x0: 36, y: yS, wx: 60, f0: 6, f1: 11, b0: 8, b1: 16, db: 3, face: faceStep,
    roofs: [{ k: 2, x: 60, z: 33 }],
  });
  rise({
    id: 'zn', x0: 36, y: yS, wx: 72, f0: 12, f1: 16, b0: 12, b1: 16, db: 3, face: faceStep,
    roofs: [{ k: 3, x: 72, z: 48 }],
  });
  rise({
    id: 'zg', x0: 112, y: yS, wx: 112, f0: 1, f1: 21, b0: 0, b1: 4, db: 4, face: facePoint,
    roofs: [{ k: 0, x: 112, z: 63 }],
  });
  block('rqp11h_zn', [36, yS, 84, yS + 9]);
  block('rqp11h_zg', [112, yS, 124, yS + 12]);
  const built = [
    { id: 'rqp11h_zn', name: '洲南商住', x0: 36, y0: yS, W: 48, D: 9, F: 16, style: '阶梯', steps: '5/11/16', stepW: '24/12/12' },
    { id: 'rqp11h_zg', name: '南洲阁', x0: 112, y0: yS, W: 12, D: 12, F: 21, style: '框槽' },
  ];
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s8 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s8', name: '南埠南洲', rect: [-16, -790, 200, -640], src: 'js/rongqiao_expand_p11h.js', load_m: 50, unload_m: 100 });
  const P = N.expansionP11;
  P.slice = 8;
  P.names.road8 = '南洲路';
  P.names.block8 = '洲南商住';
  P.names.mix8 = '南洲阁';
  P.road8 = [X0, -704, X1, -692];
  P.district = [X0, BY0, X1, -104];
  P.buildings = P.buildings.concat(built);
  P.reasons.slice8 = '第八片再往南 80 m，可玩南界 -740，地面到 -780。第七片 y -680 的南篱拆掉。新收边绿篱在 -760，大约在可玩界以南 20 m，篱外仍是硬地。南洲路仍是 12 m 油漆路面，落在 -704 到 -692。洲南商住是西低东高的三段阶梯，5 层、11 层、16 层，南洲阁是 21 层、12 m 见方的点式塔。不重复浦南商住的正中退台、南环轩的东端退台、津南坊的西端退台、南浦居的窄深板，也不另做地标塔，不改南埠中心。河东东界仍是 x 840。菜市场室内不扩。没有第二小学。名字和尺寸未经确认。';
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_nz_road', name: '南洲路', x: 40, y: -698, desc: '南浦路南侧的 12 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_zns', name: '洲南商住', x: 60, y: -696, desc: '西段 5 层宽 24 m，中段 11 层宽 12 m，东段 16 层宽 12 m。两层两跨一块的双格窗。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_nzg', name: '南洲阁', x: 118, y: -696, desc: '21 层，12 m 见方。平时中间一条玻璃槽，每四层换成四角玻璃的框。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
