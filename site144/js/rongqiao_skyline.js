/* 天际线 (2026-10-24). 22:25 补高度。22:45 Leo 说高度可以、立面不行。
 * 2026-10-26 南埠中心原址腰收：中间细、上下略阔。不照搬中国尊的外形和比例。
 * 同日临涌五栋改成同一套玻璃幕墙，但节奏分开：南埠中心冷蓝密竖挺，涌南居淡青厚横带，
 * 埠南阁中灰粗竖肋，涌背居蓝灰双竖肋并在顶部收进，埠西阁青绿大玻璃加两道横档和阳台。
 * 榕桥／南埠是老区，不是 CBD。没有伴生塔，没有霓虹，没有菱格斜撑，也不再从东侧斜切收到尖上。
 * 不是河东石材密竖梃，也不把远南矮楼和街铺改成幕墙。压边、雨棚、珊瑚压顶还在，压顶不发光。
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
  function ynj(f) { return f === 22 ? 'nb_band_top' : 'nb_band'; }
  function bn(f) { return f === 18 || (f > 1 && f % 4 === 0) ? 'nb_rib4' : 'nb_rib'; }
  function bx() { return 'nb_wide'; }
  function yb(f, b, side, n) {
    if (f >= 13 && side === 'S' && outside(b, n)) return null;
    return 'nb_slot';
  }
  /* 腰收，左右对称，跨距 3 m。底和顶 24 m，肩 18 m，腰 12 m。
   * 不是中国尊那种连续曲线和扭转平面，也不是东西塔从一侧收到尖。
   * 幕墙全是冷蓝密格。夜里亮哪些窗格按开间错开，不另做一张白天皮。 */
  function ctr() { return 'nb_glass'; }
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
      const bay = (side, b, wx, wy) => {
        const variant = spec.pick(f, b, side, side === 'S' ? nS : nW);
        if (!variant) return;
        const more = { z, state: f === 1 ? 'ground' : 'upper', fade_group: fg, variant };
        if (side === 'W') more.rot = 6;
        if (spec.glass) {
          more.nbGlass = 1;
          if (f > 1) more.night_lit = (f * 5 + b * 3 + (side === 'W' ? 1 : 0)) % 4 !== 0 ? 1 : 0;
        }
        put(list, fg + '_' + side + f + '_' + b, 'f_wall', wx, wy, more);
      };
      for (let b = 0; b < nS; b++) {
        if (cut && (b < cut.lo || b > cut.hi)) continue;
        bay('S', b, x + b * 3, y);
      }
      for (let b = 0; b < nW; b++) {
        const wx = cut ? x + cut.inset : (spec.step && f >= spec.step ? x + spec.inset : x);
        bay('W', b, wx, y + 3 + b * 3);
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
    raise({ zone: 'nanbu', fg: 'rqp11k_ynj', name: '涌南居', style: '横带', x: 132, y: -260, W: 24, D: 9, F: 22, glass: true, pick: ynj, roofs: lip(2) }),
    raise({ zone: 'nanbu', fg: 'rqp11k_bn', name: '埠南阁', style: '竖肋', x: 46, y: -268, W: 12, D: 9, F: 18, glass: true, pick: bn, fins: true, roofs: lip(1) }),
    raise({ zone: 'nanbu', fg: 'rqp11k_bx', name: '埠西阁', style: '阳台', x: 72, y: -248, W: 24, D: 9, F: 14, glass: true, pick: bx, balc: true, roofs: lip(2) }),
    raise({ zone: 'nanbu', fg: 'rqp11k_yb', name: '涌背居', style: '竖槽', x: 88, y: -120, W: 24, D: 9, F: 16, glass: true, step: 13, inset: 6, pick: yb, roofs: [{ dx: 6, v: 'r_lip' }] }),
    raise({ zone: 'nanbu', fg: 'rqp11k_ctr', name: '南埠中心', style: '腰收', x: 148, y: -190, W: 24, D: 9, F: 36, landmark: true, glass: true, canopy: true, waist: true, pick: ctr, cut: ctrCut, roofs: [{ dx: 0, v: 'r_lip' }, { dx: 12, v: 'r_lip' }] }),
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
  P.reasons.sky = '中高层需多样化。涌南居是淡青横带幕墙，埠南阁是 12 m 中灰竖肋幕墙加疏青铜竖挺，埠西阁是青绿大玻璃加阳台，涌背居是蓝灰竖肋幕墙并在顶部收进。南埠中心是老区里略高一点的精致写字楼，只要腰收质感：1 到 6 层 24 m，7 到 12 层收到 18 m，13 到 24 层中间 12 m，25 到 30 层回到 18 m，31 到 36 层回到 24 m。冷蓝密竖梃连片玻璃，幕墙比邻楼更密，顶上一条珊瑚压边，入口雨棚还在。邻楼是另外四种幕墙节奏，不是同一模板换色。不照搬中国尊的外形、比例和幕墙分格，也不是河东石材密竖梃。没有伴生塔，不是 CBD 超高层，没有霓虹。约 108 m，不是 438 m 的月河新城塔。榕桥两栋仍是脏水泥和暖砖。矮楼底商还在。没有新的无缝室内。南界仍是 -340。名字未经确认。';
  N.expansionSkyline = P.sky;
  const W = root.SP && root.SP.world;
  const SP = root.SP;
  function glassOn(o) {
    if (!o || !o.nbGlass || !SP || !SP.tint || SP.tint.night <= 0.35 || (W && W.interior)) return false;
    if (o.state === 'ground') return true;
    if (o.state !== 'upper' || !o.night_lit) return false;
    const c = SP.clock;
    return !c || SP.windowLitAt(o.id, c.day, c.min);
  }
  if (W && W.shownState && !W._nbGlassShown) {
    const shown0 = W.shownState;
    W.shownState = function (o) {
      if (o && o.nbGlass && o.state === 'upper' && glassOn(o)) return 'lit';
      return shown0.call(W, o);
    };
    W._nbGlassShown = 1;
  }
  const H = SP && SP.households;
  if (H && H.paneFacade && H.drawPane && !H._nbGlassPane) {
    const pane0 = H.paneFacade, draw0 = H.drawPane;
    H.paneFacade = function (o) {
      const hit = pane0.apply(this, arguments);
      if (hit) return hit;
      return glassOn(o) ? { nbGlass: 1 } : null;
    };
    function fillPane(ctx, o, x0, z0, x1, z1) {
      const y = -0.06;
      ctx.beginPath();
      [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]].forEach((p, i) => {
        const w = W.local(o, p[0], p[1], p[2]);
        const X = SP.sx(w[0], w[1]), Y = SP.sy(w[0], w[1], w[2]);
        i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
      });
      ctx.closePath();
      ctx.fill();
    }
    function shadeHex(hex, f) {
      const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f))));
      return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
    }
    const FACE = {
      nb_glass: { g: '#3e86b0', hi: '#9ad8ee', lo: '#2a5e78', mull: '#f5fcff', band: '#21485c', mulls: [0, 0.5, 1, 1.5, 2, 2.5], sp: 0.34, rails: [1.5], railH: 0.1 },
      nb_band: { g: '#7ecbda', hi: '#c9eef4', lo: '#4e97a8', mull: '#f7fbfc', band: '#c5e4ea', mulls: [0], sp: 0.14, rails: [], belt: [0.92, 1.88], beltCol: '#f4fafc' },
      nb_band_top: { g: '#7ecbda', hi: '#c9eef4', lo: '#4e97a8', mull: '#f7fbfc', band: '#c5e4ea', mulls: [0], sp: 0.14, rails: [], belt: [0.48, 1.22], beltCol: '#f4fafc', cap: [1.78, 2.96], capCol: '#1b3038' },
      nb_rib: { g: '#c5ced3', hi: '#e4eaec', lo: '#8b989f', mull: '#161c20', band: '#9aa6ac', mulls: [0, 0.75, 1.5, 2.25], sp: 0.06, rails: [], mullW: 0.22 },
      nb_rib4: { g: '#c5ced3', hi: '#e4eaec', lo: '#8b989f', mull: '#161c20', band: '#9aa6ac', mulls: [0, 0.75, 1.5, 2.25], sp: 0.06, rails: [], mullW: 0.22, belt: [0.98, 1.7], beltCol: '#1c2328' },
      nb_slot: { g: '#6d98a8', hi: '#b9d8e3', lo: '#3c6170', mull: '#d5e2e6', band: '#2c4450', mulls: [], sp: 0.1, rails: [], ribs: [[0, 0.46], [1.18, 1.72]], ribCol: '#141e24' },
      nb_wide: { g: '#218f86', hi: '#7ed4cc', lo: '#166860', mull: '#e7f6f4', band: '#14564f', mulls: [0], sp: 0.16, rails: [0.9, 1.96], railH: 0.2, mullW: 0.1 },
    };
    function paintFace(ctx, o, alpha) {
      const s = FACE[o.variant]; if (!s) return;
      const west = o.rot === 6, col = (c) => (west && c && c[0] === '#' ? shadeHex(c, 0.84) : c);
      ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha;
      const Q = (x0, z0, x1, z1, c) => { ctx.fillStyle = col(c); fillPane(ctx, o, x0, z0, x1, z1); };
      const fine = s.mulls.length > 3;
      const members = (z0, z1) => {
        for (const x of s.mulls) {
          const w = s.mullW != null ? s.mullW : (fine && Math.abs(x % 1.5) < 0.01 ? 0.13 : 0.08);
          Q(x, z0, Math.min(3, x + w), z1, s.mull);
        }
        for (const [a, b] of s.ribs || []) Q(a, z0, b, z1, s.ribCol);
      };
      Q(-0.04, 0, 3.04, 3, s.g);
      if (o.state === 'ground') {
        Q(-0.04, 0, 3.04, 0.22, s.lo);
        Q(-0.04, 2.7, 3.04, 2.96, s.band);
        Q(0, 1.7, 3, 2.68, s.hi);
        members(0.22, 2.7);
      } else {
        const z1 = s.cap ? s.cap[0] : 2.96;
        Q(-0.04, 0, 3.04, s.sp, s.band);
        if (!s.belt && z1 > 1.9) Q(0.08, 1.92, 2.92, z1, s.hi);
        if (s.belt) Q(-0.04, s.belt[0], 3.04, s.belt[1], s.beltCol);
        if (s.cap) Q(-0.04, s.cap[0], 3.04, 2.96, s.capCol);
        for (const z of s.rails) {
          const h = s.railH || 0.08;
          if (z + h < z1) Q(-0.04, z, 3.04, z + h, s.mull);
        }
        members(s.sp, z1);
      }
      ctx.restore();
    }
    function paintGlass(ctx, o, alpha) {
      const v = o.variant || '', hot = 'rgba(255,226,170,' + (0.9 * alpha) + ')', dim = 'rgba(255,244,214,' + (0.72 * alpha) + ')';
      const pane = (x0, z0, x1, z1, col) => { ctx.fillStyle = col; fillPane(ctx, o, x0, z0, x1, z1); };
      if (o.state === 'ground') { pane(0.15, 0.35, 2.85, 2.45, 'rgba(255,236,200,' + (0.45 * alpha) + ')'); return; }
      if (v === 'nb_glass') {
        const phase = (SP.strHash(o.id) || 0) % 2;
        for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
          if ((i + j + phase) % 2) continue;
          const x0 = i * 0.5 + 0.1, z0 = 0.62 + j * 0.55;
          pane(x0, z0, x0 + 0.28, z0 + 0.34, (i + j) % 3 ? hot : dim);
        }
        return;
      }
      if (v === 'nb_band' || v === 'nb_band_top') {
        pane(0.16, 0.22, 1.4, 0.8, hot);
        pane(1.6, 0.22, 2.84, 0.8, dim);
        if (v === 'nb_band') pane(0.16, 2.02, 2.84, 2.78, hot);
        else pane(1.6, 1.32, 2.84, 1.66, hot);
        return;
      }
      if (v === 'nb_rib' || v === 'nb_rib4') {
        for (const x of [0.28, 1.04, 1.8, 2.54]) {
          pane(x, 0.16, x + 0.38, v === 'nb_rib4' ? 0.9 : 2.7, hot);
          if (v === 'nb_rib4') pane(x, 1.8, x + 0.38, 2.7, x > 1.5 ? dim : hot);
        }
        return;
      }
      if (v === 'nb_slot') { pane(0.54, 0.28, 1.1, 2.72, hot); pane(1.82, 0.28, 2.88, 2.72, dim); return; }
      pane(0.18, 0.24, 2.82, 0.78, hot);
      pane(0.18, 1.18, 2.82, 1.82, dim);
      pane(0.18, 2.24, 2.82, 2.78, hot);
    }
    H.drawPane = function (ctx, d, alpha, emission) {
      if (d && d.o && d.o.nbGlass) {
        const a = alpha == null ? 1 : alpha;
        if (!emission) { paintFace(ctx, d.o, a); return true; }
        if (glassOn(d.o)) { paintGlass(ctx, d.o, a); return true; }
        return false;
      }
      return draw0.apply(this, arguments);
    };
    H._nbGlassPane = 1;
  }
  const Ly = root.SP && root.SP.layers;
  if (Ly && Ly.checkLit && !Ly._nbGlassLit) {
    const prev = Ly.checkLit;
    const cache = { objs: null, n: -1, list: [] };
    function checkGlass() {
      if (!W || W.interior) return;
      if (cache.objs !== W.objects || cache.n !== W.objects.length) {
        cache.objs = W.objects; cache.n = W.objects.length;
        cache.list = W.objects.filter((o) => o.nbGlass);
      }
      for (const o of cache.list) {
        const s = W.shownState(o);
        if (o._nbLit !== s) {
          if (o._nbLit !== undefined) (Ly.refreshObj ? Ly.refreshObj(o) : Ly.invalidate());
          o._nbLit = s;
        }
      }
    }
    Ly.checkLit = function () { const r = prev.apply(Ly, arguments); checkGlass(); return r; };
    Ly._nbGlassLit = 1;
  }
  function aliasGlassFrames() {
    const K = SP && SP.K; if (!K || !K.frames) return;
    const piece = K.pieces && K.pieces.f_wall;
    const pairs = [['nb_glass', ['upper', 'ground']], ['nb_band', ['upper', 'ground']], ['nb_rib', ['upper', 'ground']], ['nb_slot', ['upper', 'ground']], ['nb_wide', ['upper', 'ground']], ['nb_band_top', ['upper']], ['nb_rib4', ['upper']]];
    if (piece) { piece.variants = piece.variants || ['base']; for (const [v] of pairs) if (!piece.variants.includes(v)) piece.variants.push(v); }
    for (const [v, states] of pairs) for (const st of states) for (const rot of [0, 6]) {
      const src = 'f_wall/sc_panel/main/' + st + '/' + rot, dst = 'f_wall/' + v + '/main/' + st + '/' + rot;
      if (K.frames[src]) K.frames[dst] = K.frames[src];
      if (K.masks && K.masks[src]) K.masks[dst] = K.masks[src];
    }
  }
  if (SP && SP.load && !SP._nbGlassAlias) {
    const load0 = SP.load;
    SP.load = function () {
      const ret = load0.apply(this, arguments);
      const done = () => { try { aliasGlassFrames(); } catch (e) { console.warn('nb glass', e); } };
      return ret && typeof ret.then === 'function' ? ret.then((r) => { done(); return r; }) : (done(), ret);
    };
    SP._nbGlassAlias = 1;
  }
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p11_ynj', name: '涌南居', x: 144, y: -264, desc: '22 层淡青横带幕墙，顶层深色收口。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_bn_tower', name: '埠南阁', x: 52, y: -272, desc: '18 层中灰竖肋幕墙，宽 12 m，每四层一条暗横带，南立面有疏的青铜竖挺。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_bx', name: '埠西阁', x: 84, y: -252, desc: '14 层青绿大玻璃幕墙，两道横档，南立面每层出阳台。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_ybei', name: '涌背居', x: 100, y: -124, desc: '16 层蓝灰玻璃幕墙，每跨两道深色竖肋，顶部收进。只是外观。名字未经确认', cat: 'work' },
    { id: 'p11_center', name: '南埠中心', x: 160, y: -194, desc: '36 层腰收写字楼。老区里略高的当代地标：底下 24 m，中间收到 12 m，上面回到 24 m。冷蓝密竖梃幕墙，珊瑚压顶。比邻楼更密。不照搬中国尊，不是 CBD，没有伴生塔。约 108 m。只是外观。名字未经确认', cat: 'work' },
    { id: 'rq_hb', name: '槐北综合楼', x: 46, y: 120, desc: '14 层暖砖框、脏水泥腰。水箱顶。只是外观。名字未经确认', cat: 'work' },
    { id: 'rq_he', name: '槐东板楼', x: 208, y: 0, desc: '18 层以脏水泥为主，只留一条暖砖。水箱顶。只是外观。名字未经确认', cat: 'work' },
  ]);
})();
