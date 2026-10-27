/* Site158：质量修补。生长空间已经没了，这一刀不新开街区，也不补楼。
 * Site151 给中层住宅轮过 pier/belt/crown，但南堤几排仍是整排同一套薄节奏，望北居更是从没拉开过。
 * 这一刀给二十二栋中层住宅按各自的节奏拆开立面。层数、平面和招牌玻璃不动。不改 facadeRhythm 字段。
 * 学校、渔村老街、公园、庭院和已经拉开的立面不动。
 * 不进山，不进海，不进澜海，不进月河。南埠不往 y-1540 以南推。没有 438 m 塔。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10z || D.rongqiaoExpandP10aa || !N.expansionP10) return;
  D.rongqiaoExpandP10aa = 1;
  const P = N.expansionP10;

  const byId = new Map();
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { for (const b of node) if (b && b.id && b.F) byId.set(b.id, b); return; }
    if (node.id && node.F && node.x0 != null) byId.set(node.id, node);
    if (Array.isArray(node.buildings)) for (const b of node.buildings) if (b && b.id) byId.set(b.id, b);
    if (Array.isArray(node.towers)) for (const b of node.towers) if (b && b.id) byId.set(b.id, b);
  }
  for (const b of (N.buildings || []).concat(N.modernBuildings || [])) {
    if (b && b.id && !byId.has(b.id)) byId.set(b.id, b);
  }
  for (const k of Object.keys(P)) walk(P[k]);

  const byFg = new Map();
  const CH = root.SCENE_CHUNKS || {};
  for (const ch of Object.values(CH)) {
    for (const o of (ch && ch.objects) || []) {
      if (!o || o.type !== 'f_wall' || !o.fade_group) continue;
      let list = byFg.get(o.fade_group);
      if (!list) byFg.set(o.fade_group, list = []);
      list.push(o);
    }
  }

  /* 二十二栋。Site153 / Site154 已经拉开的中层不在这里。相邻楼用不同节奏。 */
  const HOME_RHY = {
    rqe_hdg_wb: 'grille',
    rqe_p10o_h183: 'cascade',
    rqe_p10o_h189: 'blade',
    rqe_p10o_h201: 'comb',
    rqe_p10o_h207: 'ladder',
    rqe_p10o_h213: 'column',
    rqe_p10o_h219: 'terrace',
    rqe_p10o_h231: 'veneer',
    rqe_p10o_h237: 'plinth',
    rqe_p10o_h243: 'chord',
    rqe_p10o_h249: 'notch',
    rqe_p10o_h261: 'lattice',
    rqe_p10o_h267: 'rib',
    rqe_p10o_h273: 'crown',
    rqe_p10p_h15: 'mast',
    rqe_p10p_h21: 'fin',
    rqe_p10p_h27: 'course',
    rqe_p10q_h1: 'band',
    rqe_p10p_h33: 'spine',
    rqe_p10p_h39: 'stagger',
    rqe_p10o_h171: 'fold',
    rqe_p10o_h177: 'east',
  };

  const ALT = {
    hd_g_yh: 'hd_g_ls', hd_g_ls: 'hd_g_yh', hd_g_hd: 'hd_g_qp', hd_g_qp: 'hd_g_hd',
    hd_g_cj: 'hd_g_yl', hd_g_yl: 'hd_g_wm', hd_g_wm: 'hd_g_cj', hd_g_sl: 'hd_g_yx',
    hd_g_yx: 'hd_g_sl', hd_g_dl: 'hd_g_yl2', hd_g_yl2: 'hd_g_dl',
  };
  function altOf(variant, glass) {
    const src = typeof variant === 'string' && variant.indexOf('hd_g_') === 0 && variant !== 'hd_g_sign' ? variant : glass;
    return ALT[src] || 'hd_g_qp';
  }
  function warmOf(glass) { return glass === 'hd_g_dl' ? 'hd_g_yl' : 'hd_g_dl'; }
  function toStone(o) { o.variant = 'hd_stone'; delete o.hdGlass; o.night_lit = 0; }
  function toGlass(o, v, floor, bay) {
    o.variant = v;
    o.hdGlass = 1;
    if (o.state === 'upper') o.night_lit = (floor + bay) % 4 !== 0 ? 1 : 0;
  }
  function groupsOf(list) {
    const groups = new Map();
    for (const o of list) {
      const floor = Math.round((o.z || 0) / 3) + 1;
      const key = floor + ':' + (o.rot || 0);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(o);
    }
    return groups;
  }

  const homeNotes = [];
  for (const [id, rhythm] of Object.entries(HOME_RHY)) {
    const b = byId.get(id);
    if (!b) throw new Error('site158 home ' + id);
    const glassField = b.glass;
    const walls = byFg.get(id) || [];
    const glassWalls = walls.filter((o) => o.state === 'upper' && typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0 && o.variant !== 'hd_g_sign');
    if (glassWalls.length < 8) throw new Error('site158 home glass ' + id + ' ' + glassWalls.length);
    const origin = (glassField && glassWalls.some((o) => o.variant === glassField)) ? glassField : glassWalls[0].variant;
    const before = glassWalls.map((o) => ({ variant: o.variant, hdGlass: o.hdGlass, night: o.night_lit }));
    const groups = groupsOf(glassWalls);
    const floors = [...groups.keys()].map((k) => +k.split(':')[0]);
    const hi = Math.max(...floors);
    const midFloor = floors.slice().sort((a, c) => a - c)[Math.floor(floors.length / 2)] || 1;
    for (const [key, list] of groups) {
      const floor = +key.split(':')[0];
      const rot = +key.split(':')[1];
      const coord = (o) => (rot === 6 ? o.y : o.x);
      const min = Math.min(...list.map(coord));
      const tagged = list.map((o) => ({ o, bay: Math.round((coord(o) - min) / 3) }));
      const max = Math.max(...tagged.map((t) => t.bay));
      for (const t of tagged) {
        const bay = t.bay, o = t.o;
        if (typeof o.variant !== 'string' || o.variant.indexOf('hd_g_') !== 0) continue;
        let mode = '';
        if (rhythm === 'grille') mode = bay % 3 === 1 ? 'stone' : '';
        else if (rhythm === 'cascade') mode = floor % 2 === 0 ? 'alt' : '';
        else if (rhythm === 'blade') mode = (bay === 0 || bay === max) ? 'alt' : (bay === Math.floor(max / 2) ? 'stone' : '');
        else if (rhythm === 'comb') mode = bay % 2 === 0 ? 'stone' : '';
        else if (rhythm === 'ladder') mode = floor % 3 === 2 ? 'stone' : '';
        else if (rhythm === 'column') mode = bay % 3 === 0 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'terrace') mode = floor >= hi - 2 ? (bay % 2 === 0 ? 'warm' : 'stone') : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'veneer') mode = bay % 2 === 1 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'plinth') mode = floor <= midFloor && bay % 2 === 1 ? 'stone' : (floor > midFloor && bay % 3 === 0 ? 'alt' : '');
        else if (rhythm === 'chord') mode = (bay + floor) % 3 === 0 ? 'alt' : (bay % 2 === 0 ? 'stone' : '');
        else if (rhythm === 'notch') mode = bay === Math.floor(max / 2) ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'lattice') mode = ((bay % 2) ^ (floor % 2)) ? 'stone' : '';
        else if (rhythm === 'rib') mode = bay % 4 === 1 ? 'stone' : (bay % 4 === 3 ? 'alt' : '');
        else if (rhythm === 'crown') mode = floor >= hi - 1 ? 'stone' : (floor % 2 === 1 ? 'alt' : '');
        else if (rhythm === 'mast') mode = bay % 2 === 1 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'fin') mode = bay % 2 === 1 ? 'stone' : '';
        else if (rhythm === 'course') mode = floor % 3 === 1 ? 'stone' : '';
        else if (rhythm === 'band') mode = floor % 2 === 0 && floor < hi ? 'alt' : '';
        else if (rhythm === 'spine') mode = bay === Math.floor(max / 2) ? 'alt' : (floor % 3 === 0 ? 'stone' : '');
        else if (rhythm === 'stagger') mode = (bay + floor) % 3 === 0 ? 'stone' : '';
        else if (rhythm === 'fold') mode = floor > midFloor ? (bay % 2 === 0 ? 'warm' : 'alt') : (bay % 3 === 0 ? 'stone' : '');
        else if (rhythm === 'east') mode = bay >= Math.ceil((max + 1) / 2) ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        if (mode === 'stone') toStone(o);
        else if (mode === 'alt') toGlass(o, altOf(o.variant, origin), floor, bay);
        else if (mode === 'warm') toGlass(o, warmOf(origin), floor, bay);
      }
    }
    let kept = glassWalls.filter((o) => o.variant === origin).length;
    if (kept < 4) {
      const order = glassWalls.map((o, i) => i).sort((a, c) => (glassWalls[c].z || 0) - (glassWalls[a].z || 0));
      for (const i of order) {
        if (kept >= 4) break;
        const o = glassWalls[i], snap = before[i];
        if (snap.variant !== origin || o.variant === origin) continue;
        o.variant = snap.variant;
        if (snap.hdGlass) o.hdGlass = snap.hdGlass; else delete o.hdGlass;
        o.night_lit = snap.night || 0;
        kept++;
      }
    }
    const upper = walls.filter((o) => o.state === 'upper' && o.variant !== 'hd_g_sign');
    const variants = new Set(upper.map((o) => o.variant));
    let changed = 0;
    for (let i = 0; i < glassWalls.length; i++) if (glassWalls[i].variant !== before[i].variant) changed++;
    if (changed < 4 || variants.size < 2 || kept < 4) {
      throw new Error('site158 rhythm ' + id + ' ' + rhythm + ' ' + changed + ' ' + kept + ' ' + [...variants].join(','));
    }
    if (glassField != null && b.glass !== glassField) throw new Error('site158 glass field ' + id);
    if (!b.name) throw new Error('site158 name ' + id);
    const signs = walls.filter((o) => o.variant === 'hd_g_sign' || o.sign);
    if (signs.length && signs.some((o) => o.sign && o.sign !== b.name)) throw new Error('site158 sign ' + id);
    const bad = upper.filter((o) => o.variant !== 'hd_stone' && !(typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0));
    if (bad.length) throw new Error('site158 foreign ' + id + ' ' + bad[0].variant);
    homeNotes.push({
      id, name: b.name, rhythm, glass: origin, band: 'home', kind: b.kind || 'home',
      changed, kept, variants: variants.size, F: b.F, x: b.x0, y: b.y0,
    });
  }
  if (homeNotes.length !== 22) throw new Error('site158 homes ' + homeNotes.length);

  for (let i = 0; i < homeNotes.length; i++) {
    for (let j = i + 1; j < homeNotes.length; j++) {
      const a = homeNotes[i], c = homeNotes[j];
      if (Math.abs(a.y - c.y) < 12 && Math.abs(a.x - c.x) < 40 && a.rhythm === c.rhythm) {
        throw new Error('site158 neighbor ' + a.name + ' ' + c.name + ' ' + a.rhythm);
      }
    }
  }
  const rhythmSet = new Set(homeNotes.map((n) => n.rhythm));
  if (rhythmSet.size !== 22) throw new Error('site158 rhythm dup ' + rhythmSet.size);

  const school = (byFg.get('rqe_p10k_sch') || []).filter((o) => o.state === 'upper' && o.variant !== 'hd_g_sign');
  if (school.length < 8 || new Set(school.map((o) => o.variant)).size !== 1) throw new Error('site158 school');
  const old = (byFg.get('rqe_oldst_l3') || []).filter((o) => o.state === 'upper');
  if (old.length < 8 || old.some((o) => o.variant !== 'm_brick2')) throw new Error('site158 old street');

  for (const c of D.chunks || []) {
    const bag = CH[c.id];
    const n = (bag && bag.objects || []).length;
    if (n > 2600) throw new Error('site158 chunk cap ' + c.id + ' ' + n);
  }

  P.site158 = {
    unconfirmed: true,
    choice: 'quality',
    homes: homeNotes,
    counts: { homes: homeNotes.length },
    rhythms: [...rhythmSet],
    cap: 120,
  };
  P.reasons.site158 = '第二十九刀仍不做新区。北界 y432 以上是山，南边是海，东边是澜海。榕桥剩下的学校、河岸公园、庭院和渔村老街不动。月河石驳岸仍是一整面。西侧山体封口继续挡住 (400, 400) 和 (900, 400)，山径台地（600, 370）仍是草地。扫过街块之间的空档，剩下的是路、步行缝、公园和别墅院，没有一块能再放下几栋配套，所以这一刀不补楼，也不是 438 m。Site151 给中层住宅轮过 pier/belt/crown，但南堤 y−18 一整排仍是 pier、y4 一整排仍是 crown，望北居更是从没拉开过。二十二栋中层住宅按各自的节奏拆开立面：望北居、岸南居、岚湾居、柳口居、霜南居、海南居、澄津居、葵口居、曦南居、樱南居、岸津居、芷口居、帆北居、菊南居、桃津居、梅津居、梧津居、南街里、澄湾里、苇津居、桂口居、菁南居。层数、平面和招牌玻璃留着，不改 facadeRhythm 字段。相邻楼不共用同一套节奏。山前小学和渔村老街的墙皮不动。不加新物件，不加新碰撞。不进月河，不进澜海，不进山。不把南埠往 y-1540 以南推。名字和尺寸未经确认。';
  root.SITE158 = P.site158;
})();
