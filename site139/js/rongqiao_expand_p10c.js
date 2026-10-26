/* 月河区 · 河东新城 P10 第六片 (2026-10-26). 在 x 1000 东缘围挡之外再往东 160 m。
 * 可玩东界收到 1160，地面到 1180。拆掉第五片 x 997.6 绿篱和东侧封边。
 * 河东大道 / 澜石南街穿过旧绿地，接到新东界。新次干望月路 16 m。
 * 两栋体量拉开：望月中心 26F 偏置窄板（冷青绿），秋浦大厦 30F 浅进深宽板（石墨低透）。只是外壳。
 * 墙皮仍是浅石材裙楼＋冷玻璃塔身，银杏行道树。不做 438 m 塔，不加河东公交，不南扩，不开天街／高中。
 * 名字、楼高、路宽全部未经 Leo 确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10b || D.rongqiaoExpandP10c || !N.expansionP10) return;
  D.rongqiaoExpandP10c = 1;
  const G = D.ground, BX1 = 1160, GX1 = 1180;
  const addE = Math.max(0, Math.round((GX1 - (G.origin[0] + G.cols * G.chunk)) / G.chunk));
  if (addE) {
    G.data_south_to_north = G.data_south_to_north.map((row) => row + 'K'.repeat(addE));
    G.cols += addE;
  }
  D.bounds = Object.assign({}, D.bounds, { x1: Math.max(D.bounds.x1, BX1) });
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
  const road = (x) => ((Math.round(x * 3) % 5) < 3 ? 'A' : 'B');

  const OLD_ROAD = 984, ROAD = 1144, SEAL = 1160;
  const east = (D.colliders || []).find((c) => c.id === 'rqe_p10_east');
  if (east) {
    const r = east.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqe_p10_east');
  }
  for (const id of ['rqe_p10_south', 'rqe_p10_riverland', 'rqe_p10_north', 'rqe_p10_north_e', 'rqe_p10b_north', 'rqe_p10b_south']) {
    const c = (D.colliders || []).find((x) => x.id === id);
    if (!c) continue;
    const old = c.rect.slice();
    N.solids = N.solids.filter((s) => !(s[0] === old[0] && s[1] === old[1] && s[2] === old[2] && s[3] === old[3]));
    c.rect[2] = Math.max(c.rect[2], 1220);
    N.solids.push(c.rect.slice());
  }
  for (const ch of Object.values(root.SCENE_CHUNKS || {})) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => !/^rqp10b_edge_h_/.test(o.id));
  }

  paint([OLD_ROAD, 64, ROAD, 192], 'S');
  paint([OLD_ROAD, 64, ROAD, 67.5], 'S');
  paint([OLD_ROAD, 67.5, ROAD, 76.5], null, road);
  paint([OLD_ROAD, 76.5, ROAD, 80], 'S');
  paint([OLD_ROAD, 132, ROAD, 136.5], 'S');
  paint([OLD_ROAD, 136.5, ROAD, 143.5], null, road);
  paint([OLD_ROAD, 143.5, ROAD, 146.5], 'G');
  paint([OLD_ROAD, 146.5, ROAD, 153.5], null, road);
  paint([OLD_ROAD, 153.5, ROAD, 158], 'S');
  /* 望月路 16 m 次干（名字未经确认）。后铺，盖住大道／南街在路口的断面。 */
  paint([1024, 64, 1027.5, 184], 'S');
  paint([1027.5, 64, 1036.5, 184], null, road);
  paint([1036.5, 64, 1040, 184], 'S');
  paint([ROAD, 64, SEAL, 192], 'G');
  paint([SEAL, 64, GX1, 192], 'K');
  paint([ROAD, 64, SEAL, 67.5], 'S');
  paint([ROAD, 67.5, SEAL, 76.5], null, road);
  paint([ROAD, 76.5, SEAL, 80], 'S');
  paint([ROAD, 132, SEAL, 136.5], 'S');
  paint([ROAD, 136.5, SEAL, 143.5], null, road);
  paint([ROAD, 143.5, SEAL, 146.5], 'G');
  paint([ROAD, 146.5, SEAL, 153.5], null, road);
  paint([ROAD, 153.5, SEAL, 158], 'S');

  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqe_p10_east', [SEAL, 64, 1220, 192]);

  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp10c_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function ginkgo(x, y) { put('gk_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'ginkgo' }); }
  const inSideRoad = (x) => (x > 1027.5 && x < 1036.5);
  for (let x = 984; x <= 1140; x += 12) { ginkgo(x, 134.2); ginkgo(x, 155.6); }
  for (let x = 984; x <= 1140; x += 12) {
    if (inSideRoad(x)) continue;
    ginkgo(x, 65.6); ginkgo(x, 78.2);
  }
  /* 街块树避开望月中心（1056–1083, 162–174）和秋浦大厦（1096–1120, 84–99）。 */
  for (const x of [1008, 1068, 1136]) for (const y of [88, 104, 120, 184]) ginkgo(x, y);
  for (const y of [104, 120, 184]) ginkgo(1112, y);
  for (let y = 66; y <= 190; y += 2) put('edge_h_' + y, 'p_hedge', 1157.6, y, { rot: 6 });
  for (const x of [990, 1014, 1062, 1086, 1110, 1134]) {
    put('lamp_s_' + x, 'p_lamp', x, 133.2, { interact: 'lamp' });
    put('lamp_n_' + x, 'p_lamp', x, 156.4, { interact: 'lamp' });
  }
  for (const y of [72, 100, 124, 170]) put('lamp_wm_' + y, 'p_lamp', 1025.2, y, { interact: 'lamp' });

  const TOWERS = [
    { id: 'wm', name: '望月中心', x: 1056, y: 162, side: 'W' },
    { id: 'qp', name: '秋浦大厦', x: 1096, y: 84, side: 'W' },
  ];

  const STYLE = root.HEDONG_TOWER_STYLE || {};
  function pickFace(spec, f, F, lobby) {
    const st = STYLE[spec.id] || { glass: 'hd_glass', podium: 3, crownStone: 1, setbackTop: 0, beltEvery: 0 };
    if (lobby) return { variant: st.glass, hdGlass: 1 };
    if (f <= (st.podium || 3)) return { variant: 'hd_stone' };
    if (st.crownStone && f > F - st.crownStone) return { variant: 'hd_stone' };
    if (st.beltEvery && f > (st.podium || 3) && f % st.beltEvery === 0) return { variant: 'hd_stone' };
    return { variant: st.glass, hdGlass: 1 };
  }
  function massOf(spec) {
    const st = STYLE[spec.id] || {};
    const m = Object.assign({
      F: spec.F, podiumNS: 10, podiumNW: 4, towerNS: 5, towerNW: 4, towerOff: null,
      midFromTop: 0, midNS: 4, midNW: 4, crownNS: 3, crownNW: 3,
    }, st.mass || {});
    if (m.towerOff == null) m.towerOff = spec.side === 'E' ? Math.max(0, m.podiumNS - m.towerNS) : 0;
    return m;
  }
  function bayPlan(spec, f, F, x) {
    const st = STYLE[spec.id] || {};
    const m = massOf(spec);
    const podium = st.podium || 3;
    const setback = st.setbackTop || 0;
    if (f <= podium) return { nS: m.podiumNS, xS: x, nW: m.podiumNW, xW: x };
    if (setback && f > F - setback) {
      const cOff = m.towerOff + Math.floor((m.towerNS - m.crownNS) / 2);
      return { nS: m.crownNS, xS: x + cOff * 3, nW: m.crownNW, xW: x + cOff * 3 };
    }
    if (m.midFromTop && f > F - m.midFromTop) {
      const mOff = m.towerOff + Math.floor((m.towerNS - m.midNS) / 2);
      return { nS: m.midNS, xS: x + mOff * 3, nW: m.midNW, xW: x + mOff * 3 };
    }
    return { nS: m.towerNS, xS: x + m.towerOff * 3, nW: m.towerNW, xW: x + m.towerOff * 3 };
  }

  const built = [];
  for (const spec of TOWERS) {
    const st0 = STYLE[spec.id] || {};
    const m = massOf(spec);
    const F = m.F, fg = 'rqe_p10_' + spec.id, x = spec.x, y = spec.y;
    const W = m.podiumNS * 3, Dp = m.podiumNW * 3;
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      const plan = bayPlan(spec, f, F, x);
      for (let b = 0; b < plan.nS; b++) {
        const face = pickFace(spec, f, F, false);
        const more = { z, state: st, fade_group: fg, variant: face.variant };
        if (face.hdGlass) {
          more.hdGlass = 1;
          if (f > 1) more.night_lit = (f * 5 + b * 3) % 4 !== 0 ? 1 : 0;
        }
        put(spec.id + '_S' + f + '_' + b, 'f_wall', plan.xS + b * 3, y, more);
      }
      for (let b = 0; b < plan.nW; b++) {
        const face = pickFace(spec, f, F, false);
        const more = { z, rot: 6, state: st, fade_group: fg, variant: face.variant };
        if (face.hdGlass) {
          more.hdGlass = 1;
          if (f > 1) more.night_lit = (f * 5 + b * 3 + 1) % 4 !== 0 ? 1 : 0;
        }
        put(spec.id + '_W' + f + '_' + b, 'f_wall', plan.xW, y + 3 + b * 3, more);
      }
    }
    root.hedongRoofTower(put, spec, m, st0, x, y, fg);
    const top = root.hedongTopPlate(m, st0);
    const logoX = x + top.off * 3 + Math.min(4.6, top.nS * 1.2);
    put(spec.id + '_logo', 'rq_hd_name', logoX, y - 0.02, { z: F * 3 - 1.7, variant: spec.id, fade_group: fg });
    put(spec.id + '_plate', 'rq_hd_plate', x + W * 0.42, y - 0.02, { z: 2.15, variant: spec.id, fade_group: fg });
    block(fg, [x, y, x + W, y + Dp]);
    built.push({ id: fg, name: spec.name, x0: x, y0: y, W, D: Dp, F, floors: F, form: st0.form || '', family: st0.family || '' });
  }
  const feet = built.map((b) => [b.x0, b.y0, b.x0 + b.W, b.y0 + b.D]);
  const keepProp = (o) => !feet.some((f) => root.hedongHitsTower(o, f));
  const kept = list.filter(keepProp);
  list.length = 0;
  for (const o of kept) list.push(o);
  for (const ch of Object.values(root.SCENE_CHUNKS || {})) {
    if (ch && ch.objects) ch.objects = ch.objects.filter(keepProp);
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p10_e5 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p10_e5', name: '河东新城望月', rect: [960, 8, 1200, 260], src: 'js/rongqiao_expand_p10c.js', load_m: 40, unload_m: 80 });

  const P = N.expansionP10;
  P.slice = 6;
  P.names.cross4 = '望月路';
  P.names.terminus = '河东东缘';
  P.cross4 = [1024, 64, 1040, 184];
  P.avenue = [300.05, 132, ROAD, 158];
  P.south = [368, 64, ROAD, 80];
  P.district = [356, 64, SEAL, 192];
  P.terminus = [ROAD, 64, SEAL, 192];
  P.buildings = (P.buildings || []).concat(built);
  P.reasons.x1 = '第六片：可玩东界从 1000 收到 1160（+160 m），地面到 1180。拆掉第五片 997 m 绿篱。大道和南街铺到 1144，再往东是银杏绿地，1157 m 一带一道绿篱围挡。';
  P.reasons.slice6 = '第六片在东缘围挡外再推一小片。望月路是南北 16 m 次干。望月中心 26 层偏置窄板（冷青绿密竖梃，顶三层再收），秋浦大厦 30 层浅进深宽板（石墨低透，上部再收一皮）。两栋都只是外壳，没有新大堂。墙皮仍是浅石材裙楼加冷玻璃，银杏行道树。屋面改成按开间的石材屋面板和压边，不再用整张 15×12 的 b_roof_a，避免裙房屋顶插进塔身。不做 438 m 月河新城塔，不加河东公交，不加天街／高中，不南扩。名字和尺寸未经确认。';

  N.mapPois = (N.mapPois || []).filter((p) => p.id !== 'p10_edge').concat([
    { id: 'p10_edge', name: '河东东缘', x: 1146, y: 145, desc: '大道尽头的银杏绿地和围挡。名字未经确认', cat: 'life' },
    { id: 'p10_cross4', name: '望月路', x: 1025.2, y: 110, desc: '16 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p10_wm', name: '望月中心', x: 1068, y: 159.2, desc: '26 层偏置窄板。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_qp', name: '秋浦大厦', x: 1108, y: 80.8, desc: '30 层浅进深宽板。只是外观。名字和层数未经确认', cat: 'work' },
  ]);
})();
