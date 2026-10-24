/* 南埠 P11 第一片 (2026-10-24). 河东一期停在 x 840 之后，南关路以南开一小段。
 * 可玩南界从 y -80 收到 -180，地面到 -200。100 m 落在 80–120 中间。
 * 从槐北街已有的南向人行道接进来。绿带其余部分继续封着，南关路实时车道不延长。
 * 数字全部未经Leo确认，理由写在 expansionP11.reasons：
 *   南埠路 12 m（y -144…-132），比榕桥巷宽，比河东大道窄。只铺路面。
 *   三栋沿街：南埠商行 5F 马赛克、南埠货栈 2F、涌边楼 6F 粉白瓷砖。平顶水箱/棚/太阳能。
 *   行道树只用凤凰木，18 m 一棵。不是银杏，也不跟月湾路轮换。
 *   南埠涌是一段硬质排洪渠，涌口小桥可过。南埠菜市场这一片不建。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10 || D.rongqiaoExpandP11) return;
  D.rongqiaoExpandP11 = 1;
  const G = D.ground, BY0 = -180, GY0 = -200;
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
  for (const ch of Object.values(root.SCENE_CHUNKS || {})) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => {
      if (o.x > 15 && o.x < 33 && o.y < -80 && o.y > -105 && (o.type === 'rq_x_shrub' || o.type === 'rq_x_tree' || o.type === 'p_tree' || o.type === 'rq_x_bed')) return false;
      return true;
    });
  }
  const X0 = 8, X1 = 176, CANAL = [48, -162, 156, -154], BR = [98, -162, 108, -154];
  paint([16, BY0, 22, -104], 'S');
  paint([22, BY0, 28, -104], null, (x, y) => roadY(y));
  paint([28, BY0, 32, -104], 'S');
  paint([36, -124, X1, -104], 'S');
  paint([X0, -144, X1, -142], 'S');
  paint([X0, -142, X1, -134], null, (x) => roadX(x));
  paint([X0, -134, X1, -132], 'S');
  paint(CANAL, 'W');
  paint([48, -176, 156, -162], 'S');
  paint([48, -154, 156, -148], 'S');
  paint(BR, 'S');
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqp11_belt_w', [-240, -104, 15.5, -80]);
  block('rqp11_belt_e', [32.5, -104, 940, -80]);
  block('rqp11_west', [-240, -220, X0, -104]);
  block('rqp11_east', [X1 + 4, -220, 940, -104]);
  block('rqp11_south', [X0, -220, X1 + 4, -176]);
  block('rqp11_canal_w', [CANAL[0], CANAL[1], BR[0], CANAL[3]]);
  block('rqp11_canal_e', [BR[2], CANAL[1], CANAL[2], CANAL[3]]);
  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp11_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function flame(x, y) { put('fl_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'flame' }); }
  for (let x = 36; x <= 162; x += 18) { flame(x, -133.2); flame(x, -143.2); }
  for (const x of [48, 84, 120, 156]) { put('lamp_n_' + x, 'p_lamp', x, -133.4, { interact: 'lamp' }); put('lamp_s_' + x, 'p_lamp', x, -143.2, { interact: 'lamp' }); }
  for (let y = -168; y <= -110; y += 2) put('edge_h_' + y, 'p_hedge', 177.2, y, { rot: 6 });
  for (let x = 50; x < 154; x += 3) {
    if (x > 96 && x < 110) continue;
    put('rail_n_' + x, 'rq_x_rail_s', x, -153.6);
    put('rail_s_' + x, 'rq_x_rail_s', x, -162.4);
  }
  const BLOCKS = [
    { id: 'sh', name: '南埠商行', x: 40, y: -132, W: 24, D: 9, F: 5, mats: ['m_mosaic', 'm_beige'], roof: 'r_tank' },
    { id: 'wh', name: '南埠货栈', x: 76, y: -132, W: 36, D: 9, F: 2, mats: ['m_grey', 'm_beige'], roof: 'r_shed' },
    { id: 'yb', name: '涌边楼', x: 124, y: -132, W: 24, D: 9, F: 6, mats: ['m_pink', 'm_white'], roof: 'r_solar' },
  ];
  const built = [];
  for (const spec of BLOCKS) {
    const fg = 'rqp11_' + spec.id, x = spec.x, y = spec.y, F = spec.F;
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      for (let b = 0; b < spec.W / 3; b++) {
        const shop = f === 1 && b % 2 === 0;
        if (shop) put(spec.id + '_S' + f + '_' + b, 'f_shop', x + b * 3, y, { z, state: b % 4 === 0 ? 'door' : 'window', fade_group: fg });
        else put(spec.id + '_S' + f + '_' + b, 'f_wall', x + b * 3, y, { z, state: st, fade_group: fg, variant: spec.mats[(f + b) % spec.mats.length] });
      }
      for (let b = 0; b < spec.D / 3; b++) {
        put(spec.id + '_W' + f + '_' + b, 'f_wall', x, y + 3 + b * 3, { z, rot: 6, state: st, fade_group: fg, variant: spec.mats[b % spec.mats.length] });
      }
    }
    for (let k = 0; k < spec.W / 12; k++) put(spec.id + '_roof_' + k, 'b_roof_b', x + k * 12, y, { z: F * 3, fade_group: fg, variant: spec.roof });
    block(fg, [x, y, x + spec.W, y + spec.D]);
    built.push({ id: fg, name: spec.name, x0: x, y0: y, W: spec.W, D: spec.D, F });
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  if (N.water) N.water.push(CANAL.slice());
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_s = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_s', name: '南埠', rect: [-16, -210, 200, -60], src: 'js/rongqiao_expand_p11.js', load_m: 40, unload_m: 80 });
  N.expansionP11 = {
    phase: 'P11', unconfirmed: true, slice: 1,
    names: { district: '南埠', road: '南埠路', canal: '南埠涌', bridge: '南埠涌小桥' },
    road: [X0, -144, X1, -132],
    canal: CANAL.slice(),
    bridge: BR.slice(),
    district: [X0, -176, X1, -104],
    buildings: built,
    tree: 'flame',
    market: false,
    bus: { live: false, reason: '南埠路没有实时车道。不往井槐里线或南关路线上加站。' },
    reasons: {
      y0: '第一片从南关路南侧人行道再往南 100 m，可玩南界 -180，地面到 -200。100 落在 80–120 中间。只从槐北街已有的南向人行道接进来，绿带其余段继续封着。',
      road: '南埠路 12 m。榕桥老城巷大约 6–8 m，河东大道 26 m。12 m 站在中间，仍然只铺路面，不接实时车道。',
      walls: '沿街是马赛克、米黄、粉和灰白瓷砖，底层铺面，平顶加水箱、棚或太阳能。不用榕桥暖砖，也不用河东的浅石材和冷玻璃。',
      tree: '行道树只用凤凰木，18 m 一棵。河东是银杏，月湾路在轮换四种树。凤凰木的橙红树冠把南埠分开。',
      water: '南埠涌是南埠路南侧一段硬质渠，不是月河那种草坡。涌口小桥可过。南埠菜市场这一片不建，避免再做一套无缝菜市场。',
    },
  };
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_road', name: '南埠路', x: 60, y: -138, desc: '12 m 次干，瓷砖铺面和凤凰木。名字和路宽未经确认', cat: 'life' },
    { id: 'p11_sh', name: '南埠商行', x: 52, y: -136, desc: '5 层马赛克铺面。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_wh', name: '南埠货栈', x: 94, y: -136, desc: '2 层货栈。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_yb', name: '涌边楼', x: 136, y: -136, desc: '6 层粉白瓷砖。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_canal', name: '南埠涌', x: 70, y: -152, desc: '硬质排洪渠的北岸。名字未经确认', cat: 'life' },
    { id: 'p11_bridge', name: '南埠涌小桥', x: 103, y: -158, desc: '可步行过涌。名字未经确认', cat: 'life' },
  ]);
})();
