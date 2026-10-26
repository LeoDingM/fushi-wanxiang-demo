/* 月河区 · 河东新城 P10 第五片 (2026-10-26). 在 x 840 东缘围挡之外再往东约 160 m。
 * 可玩东界收到 1000，地面到 1020。拆掉第四片 x 837.6 绿篱和东侧封边。
 * 河东大道 / 澜石南街穿过旧绿地，接到新东界。新次干银杏路 16 m。
 * 两栋：银杏中心 30F（办公科研，可进大堂）、研澜大厦 28F（科研外观）。
 * 衔接：榕校路东口 ↔ 河东大桥 ↔ 河东大道的人行／路缘连续；桥西口补步道灯。
 * 墙皮仍是浅石材裙楼＋冷玻璃塔身，银杏行道树。不做 438 m 塔，不加河东公交，不南扩。
 * 名字、楼高、路宽全部未经 Leo 确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10 || D.rongqiaoExpandP10b || !N.expansionP10) return;
  D.rongqiaoExpandP10b = 1;
  const G = D.ground, BX1 = 1000, GX1 = 1020;
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

  /* ---- 拆第四片东缘围挡／封边，并把外围固体推到新东界 ---- */
  const OLD_SEAL = 840, ROAD = 984, SEAL = 1000;
  const east = (D.colliders || []).find((c) => c.id === 'rqe_p10_east');
  if (east) {
    const r = east.rect;
    N.solids = N.solids.filter((s) => !(s[0] === r[0] && s[1] === r[1] && s[2] === r[2] && s[3] === r[3]));
    D.colliders = D.colliders.filter((c) => c.id !== 'rqe_p10_east');
  }
  for (const id of ['rqe_p10_south', 'rqe_p10_riverland', 'rqe_p10_north', 'rqe_p10_north_e']) {
    const c = (D.colliders || []).find((x) => x.id === id);
    if (!c) continue;
    const old = c.rect.slice();
    N.solids = N.solids.filter((s) => !(s[0] === old[0] && s[1] === old[1] && s[2] === old[2] && s[3] === old[3]));
    c.rect[2] = Math.max(c.rect[2], 1060);
    N.solids.push(c.rect.slice());
  }
  for (const ch of Object.values(root.SCENE_CHUNKS || {})) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => !/^rqp10_edge_h_/.test(o.id));
  }

  /* ---- 衔接：榕校路东口 → 桥西引道 → 河东大道（补齐 298–336 的步道与路缘） ---- */
  paint([298.4, 132, 336, 136.5], 'S');
  paint([298.4, 136.5, 336, 143.5], null, road);
  paint([298.4, 143.5, 336, 146.5], 'G');
  paint([298.4, 146.5, 336, 153.5], null, road);
  paint([298.4, 153.5, 336, 158], 'S');
  /* 桥面本身已由第一片铺过；西口再清一次榕桥侧残留绿篱（大道高度带） */
  for (const ch of Object.values(root.SCENE_CHUNKS || {})) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => {
      if (o.type === 'p_hedge' && o.x > 297.5 && o.x < 300.5 && o.y >= 128 && o.y < 162) return false;
      return true;
    });
  }

  /* ---- 往东推进：旧绿地改成大道／南街连续路面，新次干＋街块 ---- */
  paint([824, 64, ROAD, 192], 'S');
  paint([824, 64, ROAD, 67.5], 'S');
  paint([824, 67.5, ROAD, 76.5], null, road);
  paint([824, 76.5, ROAD, 80], 'S');
  paint([824, 132, ROAD, 136.5], 'S');
  paint([824, 136.5, ROAD, 143.5], null, road);
  paint([824, 143.5, ROAD, 146.5], 'G');
  paint([824, 146.5, ROAD, 153.5], null, road);
  paint([824, 153.5, ROAD, 158], 'S');
  /* 银杏路 16 m 次干（名字未经确认） */
  paint([856, 64, 859.5, 184], 'S');
  paint([859.5, 64, 868.5, 184], null, road);
  paint([868.5, 64, 872, 184], 'S');
  /* 东缘收边绿地 */
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
  block('rqe_p10_east', [SEAL, 64, 1060, 192]);
  block('rqe_p10b_north', [840, 192, 1060, 248]);
  block('rqe_p10b_south', [840, -104, 1060, 64]);

  const list = [];
  const put = (id, type, x, y, more) => {
    list.push(Object.assign({ id: 'rqp10b_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {}));
  };
  function ginkgo(x, y) { put('gk_' + x + '_' + y, 'rq_x_tree', x, y, { variant: 'ginkgo' }); }
  const inSideRoad = (x) => (x > 859.5 && x < 868.5);
  for (let x = 828; x <= 972; x += 12) { ginkgo(x, 134.2); ginkgo(x, 155.6); }
  for (let x = 828; x <= 972; x += 12) {
    if (inSideRoad(x)) continue;
    ginkgo(x, 65.6); ginkgo(x, 78.2);
  }
  for (const x of [900, 924, 948, 972]) for (const y of [88, 104, 120, 168, 184]) ginkgo(x, y);
  for (const y of [88, 112, 168, 184]) ginkgo(990, y);
  for (let y = 66; y <= 190; y += 2) put('edge_h_' + y, 'p_hedge', 997.6, y, { rot: 6 });
  for (const x of [846, 870, 894, 918, 942, 966]) {
    put('lamp_s_' + x, 'p_lamp', x, 133.2, { interact: 'lamp' });
    put('lamp_n_' + x, 'p_lamp', x, 156.4, { interact: 'lamp' });
  }
  for (const y of [72, 100, 124, 170]) put('lamp_yx_' + y, 'p_lamp', 857.2, y, { interact: 'lamp' });
  /* 桥西口衔接灯（榕校路东口／引道） */
  put('br_lamp_w1', 'p_lamp', 312, 133.2, { interact: 'lamp' });
  put('br_lamp_w2', 'p_lamp', 312, 156.4, { interact: 'lamp' });
  put('br_lamp_w3', 'p_lamp', 328, 133.2, { interact: 'lamp' });
  put('br_lamp_w4', 'p_lamp', 328, 156.4, { interact: 'lamp' });

  const TOWERS = [
    { id: 'yx', name: '银杏中心', x: 888, y: 162, F: 30, side: 'W' },
    { id: 'yl2', name: '研澜大厦', x: 948, y: 84, F: 28, side: 'W' },
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
  function bayPlan(spec, f, F, x, towerX) {
    const st = STYLE[spec.id] || {};
    const podium = st.podium || 3;
    const setback = st.setbackTop || 0;
    if (f <= podium) return { nS: 10, xS: x, nW: 4, xW: x };
    if (setback && f > F - setback) return { nS: 3, xS: towerX + 3, nW: 4, xW: towerX + 3 };
    return { nS: 5, xS: towerX, nW: 4, xW: towerX };
  }
  const built = [];
  for (const spec of TOWERS) {
    const fg = 'rqe_p10_' + spec.id, x = spec.x, y = spec.y, F = spec.F;
    const towerX = spec.side === 'E' ? x + 15 : x, wingX = spec.side === 'E' ? x : x + 15;
    const st0 = STYLE[spec.id] || {};
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3, st = f === 1 ? 'ground' : 'upper';
      const plan = bayPlan(spec, f, F, x, towerX);
      for (let b = 0; b < plan.nS; b++) {
        const lobby = f === 1 && b >= 3 && b <= 6;
        const face = pickFace(spec, f, F, lobby);
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
    put(spec.id + '_roof', 'b_roof_a', towerX + ((st0.setbackTop || 0) ? 3 : 0), y, { z: F * 3, fade_group: fg, variant: 'r_mod' });
    put(spec.id + '_wing', 'b_roof_a', wingX, y, { z: 9, fade_group: fg, variant: 'r_mod' });
    const logoX = towerX + ((st0.setbackTop || 0) ? 3 : 0) + 4.6;
    put(spec.id + '_logo', 'rq_hd_name', logoX, y - 0.02, { z: F * 3 - 1.7, variant: spec.id, fade_group: fg });
    put(spec.id + '_plate', 'rq_hd_plate', x + 12.6, y - 0.02, { z: 2.15, variant: spec.id, fade_group: fg });
    if (spec.id === 'yx') put('yx_entry', 'modern_entry_marker', 903, 161.1, { interact: 'portal', to: 'yx_lobby', label: '进入银杏中心 · 写字楼大堂', name: '银杏中心', reach: [903, 159.2], spawn: [8.2, 1.55, 'N'], fade_group: fg });
    block(fg, [x, y, x + 30, y + 12]);
    built.push({ id: fg, name: spec.name, x0: x, y0: y, W: 30, D: 12, F, floors: F });
  }

  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p10_e4 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p10_e4', name: '河东新城银杏', rect: [820, 8, 1040, 260], src: 'js/rongqiao_expand_p10b.js', load_m: 40, unload_m: 80 });

  const P = N.expansionP10;
  P.slice = 5;
  P.interior = 'yh_lobby+cj_lobby+dl_lobby+yx_lobby';
  P.names.cross3 = '银杏路';
  P.names.terminus = '河东东缘';
  P.cross3 = [856, 64, 872, 184];
  P.avenue = [300.05, 132, ROAD, 158];
  P.south = [368, 64, ROAD, 80];
  P.district = [356, 64, SEAL, 192];
  P.terminus = [ROAD, 64, SEAL, 192];
  P.buildings = (P.buildings || []).concat(built);
  P.reasons.x1 = '第五片：可玩东界从 840 收到 1000（+160 m），地面到 1020。拆掉第四片 837 m 绿篱。大道和南街铺到 984，再往东是银杏绿地，997 m 一带一道绿篱围挡。';
  P.reasons.slice5 = '第五片在东缘围挡外再推一小片。银杏路是南北 16 m 次干。银杏中心 30 层（办公科研，南门可进大堂），研澜大厦 28 层（科研外观）。墙皮仍是浅石材裙楼，银杏中心淡蓝中透、研澜米黄石材开窗，与西段淡金／深蓝／渐变等色族分开，银杏行道树。衔接上把榕校路东口到河东大桥西口的大道断面补齐，并加桥西口步道灯。不做 438 m 月河新城塔，不加河东公交，不南扩。名字和尺寸未经确认。';
  P.reasons.link = '榕校路东口（x≈298）经河东大桥（x 336–356）接河东大道。桥西引道按大道 26 m 断面重铺，清掉大道高度带残留绿篱，避免撞墙感。';

  N.mapPois = (N.mapPois || []).filter((p) => p.id !== 'p10_edge').concat([
    { id: 'p10_edge', name: '河东东缘', x: 986, y: 145, desc: '大道尽头的银杏绿地和围挡。名字未经确认', cat: 'life' },
    { id: 'p10_cross3', name: '银杏路', x: 857.2, y: 110, desc: '16 m 次干。名字和路宽未经确认', cat: 'life' },
    { id: 'p10_yx', name: '银杏中心', x: 903, y: 159.2, desc: '30 层办公科研。南门可进大堂，上层未开。名字未经确认', cat: 'work' },
    { id: 'p10_yl2', name: '研澜大厦', x: 963, y: 78.2, desc: '28 层科研外观。只是外观。名字未经确认', cat: 'work' },
    { id: 'p10_bridge_w', name: '河东大桥西口', x: 320, y: 145, desc: '榕校路东口接河东大桥。衔接补强。名字未经确认', cat: 'life' },
  ]);
})();
