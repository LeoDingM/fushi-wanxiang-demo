/* 天际线 (2026-10-24). 22:25 补高度。22:45 Leo 说高度可以、立面不行。
 * 四栋不再同一种窗：涌南居整栋横窗，埠南阁收成 12 m 玻璃条楼并加疏竖挺，埠西阁加阳台，涌背居是成组竖槽、顶部收进。
 * 2026-10-26 南埠中心原址改成腰收：中间细、上下略阔。只要这种质感，不照搬中国尊的外形、比例和幕墙。
 * 榕桥／南埠是老区，不是 CBD。没有伴生塔，没有霓虹，没有菱格斜撑，也不再从东侧斜切收到尖上。
 * 墙皮用图集里已有的白墙和玻璃，压边和雨棚是已有小件，顶上另加一条珊瑚压边。不克隆河东密竖梃。
 * 这一刀本身不推南界。没有新的无缝室内，不是 438 m 塔。名字和层数未经 Leo 确认。
 * 榕桥两栋仍是脏水泥和暖砖，槐北更暖，槐东更素。 */
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
  /* 腰收，左右对称，跨距 3 m。底和顶 24 m，肩 18 m，腰 12 m。
   * 不是中国尊那种连续曲线和扭转平面，也不是东西塔从一侧收到尖。 */
  function ctr(f, b, side) {
    if (f === 1) return 'sc_shop';
    const waist = f >= 13 && f <= 24;
    if (waist) return side === 'S' && (b === 2 || b === 5) ? 'sc_panel' : 'sc_shop';
    if (f % 4 === 0) return 'sc_shop';
    if (side === 'S' && (b === 3 || b === 4)) return 'sc_shop';
    return 'sc_panel';
  }
  function ctrCut(f) {
    if (f <= 6 || f >= 31) return { lo: 0, hi: 7, inset: 0 };
    if (f <= 12 || f >= 25) return { lo: 1, hi: 6, inset: 3 };
    return { lo: 2, hi: 5, inset: 6 };
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
      const cut = spec.cut ? spec.cut(f) : null;
      for (let b = 0; b < nS; b++) {
        if (cut && (b < cut.lo || b > cut.hi)) continue;
        const variant = spec.pick(f, b, 'S', nS);
        if (!variant) continue;
        put(list, fg + '_S' + f + '_' + b, 'f_wall', x + b * 3, y, { z, state: f === 1 ? 'ground' : 'upper', fade_group: fg, variant });
      }
      for (let b = 0; b < nW; b++) {
        const variant = spec.pick(f, b, 'W', nW);
        if (!variant) continue;
        const wx = cut ? x + cut.inset : (spec.step && f >= spec.step ? x + spec.inset : x);
        put(list, fg + '_W' + f + '_' + b, 'f_wall', wx, y + 3 + b * 3, { z, rot: 6, state: f === 1 ? 'ground' : 'upper', fade_group: fg, variant });
      }
    }
    if (spec.fins) for (let f = 1; f <= F; f++) for (let b = 0; b < nS; b++) put(list, fg + '_fin' + f + '_' + b, 'rq_nb_fin', x + b * 3, y, { z: (f - 1) * 3, fade_group: fg });
    if (spec.balc) for (let f = 2; f <= F; f++) for (let b = 0; b < nS; b++) put(list, fg + '_bal' + f + '_' + b, 'rq_nb_balc', x + b * 3, y, { z: (f - 1) * 3, fade_group: fg });
    if (spec.step) for (let b = 0; b < nS; b++) if (outside(b, nS)) put(list, fg + '_cap' + b, 'rq_nb_cap', x + b * 3, y, { z: (spec.step - 1) * 3, fade_group: fg });
    if (spec.waist) {
      const lipAt = (f, bays) => { for (const b of bays) put(list, fg + '_cap' + f + '_' + b, 'rq_nb_cap', x + b * 3, y, { z: (f - 1) * 3, fade_group: fg }); };
      lipAt(7, [0, 7]);
      lipAt(13, [1, 6]);
      lipAt(25, [1, 6]);
      lipAt(31, [0, 7]);
      for (let b = 0; b < nS; b++) put(list, fg + '_crown_' + b, 'rq_nb_crown', x + b * 3, y - 0.02, { z: F * 3 - 0.48, fade_group: fg });
    }
    spec.roofs.forEach((r, k) => put(list, fg + '_roof_' + k, 'b_roof_b', x + r.dx, y, { z: r.z == null ? F * 3 : r.z, fade_group: fg, variant: r.v }));
    if (spec.canopy) {
      put(list, fg + '_canopy_a', 'rq_nb_canopy', x + 7.4, y - 0.08, { z: 2.62, fade_group: fg });
      put(list, fg + '_canopy_b', 'rq_nb_canopy', x + 12.2, y - 0.08, { z: 2.62, fade_group: fg });
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
    raise({ zone: 'nanbu', fg: 'rqp11k_ctr', name: '南埠中心', style: '腰收', x: 148, y: -190, W: 24, D: 9, F: 36, landmark: true, canopy: true, waist: true, pick: ctr, cut: ctrCut, roofs: [{ dx: 0, v: 'r_lip' }, { dx: 12, v: 'r_lip' }] }),
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
  P.reasons.sky = '中高层需多样化。涌南居是整栋横窗，埠南阁是 12 m 玻璃条楼加疏竖挺，埠西阁带阳台，涌背居是成组竖槽并在顶部收进。南埠中心是老区里略高一点的精致写字楼，只要腰收质感：1 到 6 层 24 m，7 到 12 层收到 18 m，13 到 24 层中间 12 m，25 到 30 层回到 18 m，31 到 36 层回到 24 m。白墙、玻璃和青铜线，顶上一条珊瑚压边，入口雨棚还在。不照搬中国尊的外形、比例和幕墙，也不是广州东西塔那种斜切收分和菱格。没有伴生塔，不是 CBD 超高层，没有霓虹。约 108 m，不是 438 m 的月河新城塔，也不是河东的密竖梃。榕桥两栋仍是脏水泥和暖砖。矮楼底商还在。没有新的无缝室内。南界仍是 -340。名字未经确认。';
  N.expansionSkyline = P.sky;
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_ynj', name: '涌南居', x: 144, y: -264, desc: '22 层横窗板楼。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_bn_tower', name: '埠南阁', x: 52, y: -272, desc: '18 层玻璃条楼，宽 12 m，南立面有疏的青铜竖挺。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_bx', name: '埠西阁', x: 84, y: -252, desc: '14 层阳台板楼。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_ybei', name: '涌背居', x: 100, y: -124, desc: '16 层白墙和玻璃竖槽成组排列，顶部收进。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_center', name: '南埠中心', x: 160, y: -194, desc: '36 层腰收写字楼。老区里略高的当代地标：底下 24 m，中间收到 12 m，上面回到 24 m。白墙、玻璃、青铜线，珊瑚压顶。不照搬中国尊，不是 CBD，没有伴生塔。约 108 m。只是外观。名字未经确认', cat: 'work' },
    { id: 'rq_hb', name: '槐北综合楼', x: 46, y: 120, desc: '14 层暖砖框、脏水泥腰。水箱顶。只是外观。名字未经确认', cat: 'work' },
    { id: 'rq_he', name: '槐东板楼', x: 208, y: 0, desc: '18 层以脏水泥为主，只留一条暖砖。水箱顶。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
