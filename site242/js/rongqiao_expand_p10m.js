/* 月河区 · 河东山径 (Site141). 山脚封口仍在 y378–390，y400 是山体，不再往北开。
 * 别墅和步道放在已经打开的台地 y356–378 上。滨海路不穿过封口。
 * 四栋别墅都在 3 层以内，平面和材料分开。不做 438 m 塔。名字和层数未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10l || D.rongqiaoExpandP10m || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10m = 1;
  const G = D.ground;
  const NS = [[408, 424], [468, 484], [602, 618], [856, 872], [1024, 1040], [1368, 1384], [1520, 1536], [1688, 1704]];
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
  const PARK = [356, 356, 1688, 378];
  const TRAIL = [356, 358, 1688, 362];
  paint(TRAIL, 'S');
  for (const [x0] of NS) {
    paint([x0 + 3.5, 356, x0 + 12.5, 362], null, (x) => ((Math.round(x * 3) % 5) < 3 ? 'A' : 'B'));
  }

  const list = [];
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10n_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    list.push(o);
    return o;
  }
  function faceOf(spec, f, F, side, b) {
    const sign = (spec.signs || []).find((s) => s.face === side && s.floor === f && s.bay === b);
    if (sign) return { variant: 'hd_g_sign', hdGlass: 1, sign: sign.text, forceGround: 1 };
    const st = spec.st || {};
    if (f <= (st.podium || 1)) return { variant: 'hd_stone' };
    if (st.crownStone && f > F - st.crownStone) return { variant: 'hd_stone' };
    return { variant: spec.glass || 'hd_g_hd', hdGlass: 1 };
  }
  const built = [];
  const solids = [], colliders = [];
  function block(id, rect) { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); }
  function remember(spec, parts) {
    const m = spec.mass, fg = 'rqe_p10n_' + spec.id;
    for (const r of parts) block(fg + '_' + r[0] + '_' + r[1], r);
    built.push({
      id: fg, name: spec.name, x0: spec.x, y0: spec.y, W: m.podiumNS * 3, D: m.podiumNW * 3, F: m.F, floors: m.F,
      kind: 'home', form: spec.form || '', family: spec.family || '', glass: spec.glass || '',
      plate: spec.plate || (m.towerNS + 'x' + m.towerNW),
      parts: parts.map((r) => r.slice()),
    });
  }
  function villa(s) {
    const m = {
      F: s.F, podiumNS: s.nS, podiumNW: s.nW, towerNS: s.nS, towerNW: s.nW, towerOff: 0,
      midFromTop: 0, midNS: s.nS, midNW: s.nW, crownNS: s.nS, crownNW: s.nW,
    };
    const st = { podium: 1, setbackTop: 0, crownStone: 1, beltEvery: 0 };
    const spec = { id: s.id, name: s.name, x: s.x, y: s.y, kind: 'home', glass: s.glass, family: s.family, signs: s.signs, form: s.form, plate: s.nS + 'x' + s.nW, st, mass: m };
    const fg = 'rqe_p10n_' + s.id;
    for (let f = 1; f <= m.F; f++) {
      const z = (f - 1) * 3;
      for (let b = 0; b < m.towerNS; b++) {
        const face = faceOf(spec, f, m.F, 'S', b);
        const more = { z, state: f === 1 ? 'ground' : 'upper', fade_group: fg, variant: face.variant };
        if (face.hdGlass) more.hdGlass = 1;
        if (face.sign) more.sign = face.sign;
        put(s.id + '_S' + f + '_' + b, 'f_wall', s.x + b * 3, s.y, more);
      }
      for (let b = 0; b < m.towerNW; b++) {
        const face = faceOf(spec, f, m.F, 'W', b);
        const more = { z, rot: 6, state: f === 1 ? 'ground' : 'upper', fade_group: fg, variant: face.variant };
        if (face.hdGlass) more.hdGlass = 1;
        if (face.sign) more.sign = face.sign;
        put(s.id + '_W' + f + '_' + b, 'f_wall', s.x, s.y + 3 + b * 3, more);
      }
    }
    root.hedongRoofTower(put, spec, m, st, s.x, s.y, fg);
    remember(spec, [[s.x, s.y, s.x + m.podiumNS * 3, s.y + m.podiumNW * 3]]);
  }
  villa({ id: 'v1', name: '山径一号', x: 700, y: 366, nS: 4, nW: 2, F: 2, glass: 'hd_g_yl2', family: '米黄石材', form: '坡院', signs: [{ face: 'S', floor: 1, bay: 1, text: '山径一号' }] });
  villa({ id: 'v2', name: '山径二号', x: 980, y: 366, nS: 5, nW: 2, F: 3, glass: 'hd_g_ls', family: '深灰石材', form: '窄院', signs: [{ face: 'S', floor: 1, bay: 1, text: '山径二号' }] });
  villa({ id: 'v3', name: '山径三号', x: 1300, y: 366, nS: 3, nW: 2, F: 2, glass: 'hd_g_wm', family: '冷青石材', form: '横院', signs: [{ face: 'S', floor: 1, bay: 0, text: '山径三号' }] });
  villa({ id: 'v4', name: '听澜别墅', x: 1560, y: 366, nS: 4, nW: 2, F: 3, glass: 'hd_g_dl', family: '暖木石材', form: '点院', signs: [{ face: 'S', floor: 1, bay: 1, text: '听澜别墅' }] });

  const feet = built.flatMap((b) => b.parts);
  const hit = (o, rect, pad) => o.x > rect[0] - pad && o.x < rect[2] + pad && o.y > rect[1] - pad && o.y < rect[3] + pad;
  for (const ch of Object.values(root.SCENE_CHUNKS || {})) {
    if (!ch || !ch.objects) continue;
    ch.objects = ch.objects.filter((o) => {
      if (o.type !== 'p_hedge' && o.type !== 'rq_x_tree' && o.type !== 'p_lamp' && o.type !== 'community_bench') return true;
      const pad = o.type === 'rq_x_tree' ? 2.2 : 0.5;
      return !feet.some((f) => hit(o, f, pad));
    });
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  root.SCENE_CHUNKS.rqe_p10_e13 = { objects: list, colliders: [] };
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  TAIL.push({ id: 'rqe_p10_e13', name: '河东山径', rect: [280, 300, 1860, 420], src: 'js/rongqiao_expand_p10m.js', load_m: 40, unload_m: 80 });

  const P = N.expansionP10;
  P.slice = 15;
  P.district = [356, Math.min(P.district[1], -220), 1750, 378];
  P.names.hillTrail = '山径步道';
  P.hillTrail = TRAIL.slice();
  P.north15 = { unconfirmed: true, north: [356, 378], park: PARK.slice(), trail: TRAIL.slice(), cap: 120, buildings: built, towers: [] };
  P.keepLots = (P.keepLots || []).concat([PARK.slice(), TRAIL.slice()]);
  P.reasons.north15 = '第十五片：山体封口仍在 y390，y400 继续不可进入。台地 y356–378 上加了山径步道和四栋别墅。山径一号 2 层坡院（米黄，4×2），山径二号 3 层窄院（深灰，5×2），山径三号 2 层横院（冷青，3×2），听澜别墅 3 层点院（暖木，4×2）。层数、平面和材料都不一样，没有塔楼，也不是 438 m。北界仍是 y378。新块 rqe_p10_e13 懒加载，载入距离 40 m。分块上限仍是 120，整图 86 块。南埠仍停在 y-1540。名字和尺寸未经确认。';
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '山径公园', rect: PARK.slice(), kind: 'park', prio: 1 },
    { name: '山径步道', rect: TRAIL.slice(), kind: 'park', prio: 1 },
  ]);
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_hill_park', name: '山径公园', x: 640, y: 370, desc: '山脚台地上的步道和别墅。景区。名字未经确认', cat: 'park' },
    { id: 'p10_v1', name: '山径一号', x: 706, y: 360, desc: '2 层坡院别墅。只是外观。名字和层数未经确认', cat: 'life' },
    { id: 'p10_v2', name: '山径二号', x: 986, y: 360, desc: '3 层窄院别墅。只是外观。名字和层数未经确认', cat: 'life' },
    { id: 'p10_v4', name: '听澜别墅', x: 1566, y: 360, desc: '3 层点院别墅。只是外观。名字和层数未经确认', cat: 'life' },
  ]);
})();
