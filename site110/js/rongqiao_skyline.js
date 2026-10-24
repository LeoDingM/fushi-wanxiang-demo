/* 天际线 (2026-10-24 22:25 北京时间). Leo 认可当代方向，说现在全是矮楼，不像大城市。
 * 南界仍停在 y -340，不往南推。在已有可玩范围里补高度。名字和层数未经 Leo 确认。
 * 南埠：四栋 14–22F，外加临涌的南埠中心 36F（约 108 m）。白墙、玻璃、青铜线。不是河东的石材冷玻璃，也不是 438 m 塔。
 * 榕桥：不推倒旧街，只点两栋 90 年代脏水泥 / 暖砖板楼，屋顶是水箱。没有新的无缝室内。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP11c || !N.expansionP11 || D.rongqiaoSkyline) return;
  D.rongqiaoSkyline = 1;
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  const clutter = /^(rq_x_tree|p_tree|rq_x_shrub|p_lamp|p_hedge|rq_x_bed|community_bench|p_bench|p_car)$/;
  function clearFoot(rect) {
    for (const ch of Object.values(root.SCENE_CHUNKS || {})) {
      if (!ch || !ch.objects) continue;
      ch.objects = ch.objects.filter((o) => {
        if (!clutter.test(o.type || '')) return true;
        return !(o.x >= rect[0] && o.x < rect[2] && o.y >= rect[1] && o.y < rect[3]);
      });
    }
  }
  const lists = { nb: [], rq: [] };
  function put(list, id, type, x, y, more) {
    list.push(Object.assign({ id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  }
  function raise(spec) {
    const list = lists[spec.zone === 'nanbu' ? 'nb' : 'rq'];
    const fg = spec.fg, x = spec.x, y = spec.y, F = spec.F, W = spec.W, D = spec.D;
    const rect = [x, y, x + W, y + D];
    clearFoot(rect);
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3;
      const st = (f === 1 || (spec.landmark && f === F)) ? 'ground' : 'upper';
      for (let b = 0; b < W / 3; b++) {
        let variant = 'sc_panel';
        if (spec.zone === 'nanbu') variant = (spec.landmark || f === 1 || b % 2 === 0) ? 'sc_shop' : 'sc_panel';
        else variant = (f === 1 || b % 3 === 0) ? 'm_brick2' : 'm_cement';
        put(list, fg + '_S' + f + '_' + b, 'f_wall', x + b * 3, y, { z, state: st, fade_group: fg, variant });
      }
      for (let b = 0; b < D / 3; b++) {
        const variant = spec.zone === 'nanbu' ? (spec.landmark ? 'sc_shop' : 'sc_panel') : (b % 2 === 0 ? 'm_cement' : 'm_brick2');
        put(list, fg + '_W' + f + '_' + b, 'f_wall', x, y + 3 + b * 3, { z, rot: 6, state: st, fade_group: fg, variant });
      }
    }
    const roof = spec.zone === 'nanbu' ? 'r_lip' : 'r_tank';
    for (let k = 0; k < W / 12; k++) put(list, fg + '_roof_' + k, 'b_roof_b', x + k * 12, y, { z: F * 3, fade_group: fg, variant: roof });
    block(fg, rect);
    return { id: fg, name: spec.name, x0: x, y0: y, W, D, F, zone: spec.zone, landmark: !!spec.landmark };
  }
  const built = [
    raise({ zone: 'nanbu', fg: 'rqp11k_ynj', name: '涌南居', x: 132, y: -260, W: 24, D: 9, F: 22 }),
    raise({ zone: 'nanbu', fg: 'rqp11k_bn', name: '埠南阁', x: 40, y: -268, W: 24, D: 9, F: 18 }),
    raise({ zone: 'nanbu', fg: 'rqp11k_bx', name: '埠西阁', x: 72, y: -248, W: 24, D: 9, F: 14 }),
    raise({ zone: 'nanbu', fg: 'rqp11k_yb', name: '涌背居', x: 88, y: -120, W: 24, D: 9, F: 16 }),
    raise({ zone: 'nanbu', fg: 'rqp11k_ctr', name: '南埠中心', x: 148, y: -190, W: 24, D: 9, F: 36, landmark: true }),
    raise({ zone: 'rongqiao', fg: 'rqh_hb', name: '槐北综合楼', x: 40, y: 124, W: 12, D: 9, F: 14 }),
    raise({ zone: 'rongqiao', fg: 'rqh_he', name: '槐东板楼', x: 202, y: 4, W: 12, D: 9, F: 18 }),
  ];
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = (D.colliders || []).concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p11_sky = { objects: lists.nb, colliders: [] };
  root.SCENE_CHUNKS.rqe_rq_sky = { objects: lists.rq, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p11_sky', name: '南埠天际线', rect: [-16, -300, 200, -100], src: 'js/rongqiao_skyline.js', load_m: 70, unload_m: 120 });
  TAIL.push({ id: 'rqe_rq_sky', name: '榕桥点状高层', rect: [20, -16, 230, 150], src: 'js/rongqiao_skyline.js', load_m: 70, unload_m: 120 });
  const P = N.expansionP11;
  P.sky = { unconfirmed: true, buildings: built };
  P.buildings = P.buildings.concat(built.filter((b) => b.zone === 'nanbu'));
  P.reasons.sky = '现有可玩范围内补了中高层和地标，南界仍是 -340，没有再往南推。南埠四栋 14–22F 用白墙、玻璃和青铜线，南埠中心 36F 临涌，约 108 m，不是 438 m 的月河新城塔。榕桥点了两栋脏水泥和暖砖板楼。矮楼底商还在。没有新的无缝室内。名字未经确认。';
  N.expansionSkyline = P.sky;
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_ynj', name: '涌南居', x: 144, y: -264, desc: '22 层白墙和玻璃。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_bn_tower', name: '埠南阁', x: 52, y: -272, desc: '18 层白墙和玻璃，站在埠南商铺北侧。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_bx', name: '埠西阁', x: 84, y: -252, desc: '14 层白墙和玻璃。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_ybei', name: '涌背居', x: 100, y: -124, desc: '16 层白墙和玻璃，站在货栈北侧。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_center', name: '南埠中心', x: 160, y: -194, desc: '36 层临涌玻璃塔，约 108 m。不是月河新城塔。只是外观。名字未经确认', cat: 'work' },
    { id: 'rq_hb', name: '槐北综合楼', x: 46, y: 120, desc: '14 层脏水泥和暖砖板楼，水箱顶。只是外观。名字未经确认', cat: 'work' },
    { id: 'rq_he', name: '槐东板楼', x: 208, y: 0, desc: '18 层脏水泥和暖砖板楼，点在井槐东缘。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
