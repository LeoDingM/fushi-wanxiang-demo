/* 天际线 (2026-10-24). 22:25 补高度。22:45 Leo 说高度可以、立面不行。
 * 四栋不再同一种窗：涌南居整栋横窗，埠南阁收成 12 m 玻璃条楼并加疏竖挺，埠西阁加阳台，涌背居是成组竖槽、顶部收进。
 * 南埠中心做成写字楼：两侧白墙、中段玻璃、入口雨棚、顶部收进，屋顶一根灯冠。
 * 墙皮用图集里已有的白墙和玻璃，不克隆河东密竖梃。南界仍是 y -340。没有新的无缝室内，不是 438 m 塔。
 * 名字和层数未经 Leo 确认。榕桥两栋仍是脏水泥和暖砖，槐北更暖，槐东更素。 */
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
  function outside(b, n) { return b < 2 || b >= n - 2; }
  function ynj() { return 'sc_panel'; }
  function bn(f) { return f > 1 && f % 4 === 0 ? 'sc_panel' : 'sc_shop'; }
  function bx(f, b, side) { return f === 1 && side === 'S' ? 'sc_shop' : 'sc_panel'; }
  function yb(f, b, side, n) {
    if (f >= 13) return side === 'S' && outside(b, n) ? null : 'sc_shop';
    if (side === 'S' && (f === 1 ? b >= 2 && b <= 5 : b % 4 >= 2)) return 'sc_shop';
    return 'sc_panel';
  }
  function ctr(f, b, side, n) {
    if (f >= 34) return side === 'S' && outside(b, n) ? null : 'sc_shop';
    if (side === 'S' && b >= 2 && b <= 5) return 'sc_shop';
    if (side === 'W' && b === 1) return 'sc_shop';
    return 'sc_panel';
  }
  function hb(f, b, side, n) {
    if (f === 1 || f === 14 || b === 0 || b === n - 1) return 'm_brick2';
    return 'm_cement';
  }
  function he(f, b, side) {
    if (side === 'S' && b === 0) return 'm_brick2';
    if (side === 'W' && b === 2) return 'm_brick2';
    return 'm_cement';
  }
  function raise(spec) {
    const list = lists[spec.zone === 'nanbu' ? 'nb' : 'rq'];
    const fg = spec.fg, x = spec.x, y = spec.y, F = spec.F, W = spec.W, D = spec.D;
    const rect = [x, y, x + W, y + D];
    clearFoot(rect);
    const nS = W / 3, nW = D / 3;
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3;
      for (let b = 0; b < nS; b++) {
        const variant = spec.pick(f, b, 'S', nS);
        if (!variant) continue;
        put(list, fg + '_S' + f + '_' + b, 'f_wall', x + b * 3, y, { z, state: f === 1 ? 'ground' : 'upper', fade_group: fg, variant });
      }
      for (let b = 0; b < nW; b++) {
        const variant = spec.pick(f, b, 'W', nW);
        if (!variant) continue;
        const wx = spec.step && f >= spec.step ? x + spec.inset : x;
        put(list, fg + '_W' + f + '_' + b, 'f_wall', wx, y + 3 + b * 3, { z, rot: 6, state: f === 1 ? 'ground' : 'upper', fade_group: fg, variant });
      }
    }
    if (spec.fins) for (let f = 1; f <= F; f++) for (let b = 0; b < nS; b++) put(list, fg + '_fin' + f + '_' + b, 'rq_nb_fin', x + b * 3, y, { z: (f - 1) * 3, fade_group: fg });
    if (spec.balc) for (let f = 2; f <= F; f++) for (let b = 0; b < nS; b++) put(list, fg + '_bal' + f + '_' + b, 'rq_nb_balc', x + b * 3, y, { z: (f - 1) * 3, fade_group: fg });
    if (spec.step) for (let b = 0; b < nS; b++) if (outside(b, nS)) put(list, fg + '_cap' + b, 'rq_nb_cap', x + b * 3, y, { z: (spec.step - 1) * 3, fade_group: fg });
    spec.roofs.forEach((r, k) => put(list, fg + '_roof_' + k, 'b_roof_b', x + r.dx, y, { z: F * 3, fade_group: fg, variant: r.v }));
    if (spec.canopy) {
      put(list, fg + '_canopy_a', 'rq_nb_canopy', x + 7.4, y - 0.08, { z: 2.62, fade_group: fg });
      put(list, fg + '_canopy_b', 'rq_nb_canopy', x + 12.2, y - 0.08, { z: 2.62, fade_group: fg });
      put(list, fg + '_beacon', 'rq_nb_beacon', x + 11.3, y + 1.4, { z: F * 3 + 0.2, fade_group: fg });
    }
    block(fg, rect);
    return { id: fg, name: spec.name, x0: x, y0: y, W, D, F, zone: spec.zone, landmark: !!spec.landmark, style: spec.style };
  }
  const lip = (n) => Array.from({ length: n }, (_, k) => ({ dx: k * 12, v: 'r_lip' }));
  const built = [
    raise({ zone: 'nanbu', fg: 'rqp11k_ynj', name: '涌南居', style: '横窗', x: 132, y: -260, W: 24, D: 9, F: 22, pick: ynj, roofs: lip(2) }),
    raise({ zone: 'nanbu', fg: 'rqp11k_bn', name: '埠南阁', style: '玻璃条', x: 46, y: -268, W: 12, D: 9, F: 18, pick: bn, fins: true, roofs: lip(1) }),
    raise({ zone: 'nanbu', fg: 'rqp11k_bx', name: '埠西阁', style: '阳台', x: 72, y: -248, W: 24, D: 9, F: 14, pick: bx, balc: true, roofs: lip(2) }),
    raise({ zone: 'nanbu', fg: 'rqp11k_yb', name: '涌背居', style: '竖槽', x: 88, y: -120, W: 24, D: 9, F: 16, step: 13, inset: 6, pick: yb, roofs: [{ dx: 6, v: 'r_lip' }] }),
    raise({ zone: 'nanbu', fg: 'rqp11k_ctr', name: '南埠中心', style: '写字楼', x: 148, y: -190, W: 24, D: 9, F: 36, landmark: true, step: 34, inset: 6, canopy: true, pick: ctr, roofs: [{ dx: 6, v: 'r_lip' }] }),
    raise({ zone: 'rongqiao', fg: 'rqh_hb', name: '槐北综合楼', style: '暖砖', x: 40, y: 124, W: 12, D: 9, F: 14, pick: hb, roofs: [{ dx: 0, v: 'r_tank' }] }),
    raise({ zone: 'rongqiao', fg: 'rqh_he', name: '槐东板楼', style: '水泥', x: 202, y: 4, W: 12, D: 9, F: 18, pick: he, roofs: [{ dx: 0, v: 'r_tank' }] }),
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
  P.reasons.sky = '中高层需多样化。涌南居是整栋横窗，埠南阁是 12 m 玻璃条楼加疏竖挺，埠西阁带阳台，涌背居是成组竖槽并在顶部收进。南埠中心是地标级精致写字楼：中段玻璃、两侧白墙、入口雨棚、顶部收进和灯冠，约 108 m，不是 438 m 的月河新城塔，也不是河东的密竖梃。榕桥两栋仍是脏水泥和暖砖。矮楼底商还在。没有新的无缝室内。南界仍是 -340。名字未经确认。';
  N.expansionSkyline = P.sky;
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_ynj', name: '涌南居', x: 144, y: -264, desc: '22 层横窗板楼。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_bn_tower', name: '埠南阁', x: 52, y: -272, desc: '18 层玻璃条楼，宽 12 m，南立面有疏的青铜竖挺。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_bx', name: '埠西阁', x: 84, y: -252, desc: '14 层阳台板楼。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_ybei', name: '涌背居', x: 100, y: -124, desc: '16 层白墙和玻璃竖槽成组排列，顶部收进。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_center', name: '南埠中心', x: 160, y: -194, desc: '36 层写字楼，中段玻璃、入口雨棚、顶部灯冠。约 108 m。不是月河新城塔。只是外观。名字未经确认', cat: 'work' },
    { id: 'rq_hb', name: '槐北综合楼', x: 46, y: 120, desc: '14 层暖砖框、脏水泥腰。水箱顶。只是外观。名字未经确认', cat: 'work' },
    { id: 'rq_he', name: '槐东板楼', x: 208, y: 0, desc: '18 层以脏水泥为主，只留一条暖砖。水箱顶。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
