/* Site159：质量修补。生长空间已经没了，这一刀不新开街区，也不补楼。
 * Site153 给河东大道北侧中层轮过 pier/belt/crown，但九栋仍是裙楼石材加整片同色玻璃；
 * Site154 东岸海东/岸北/海北，以及山津/枣湾/山西/霜津几栋也还是同一套薄节奏。
 * 这一刀给十六栋中层住宅按各自的节奏拆开立面，并确保每栋都出现第二色玻璃。层数、平面和招牌玻璃不动。不改 facadeRhythm 字段。
 * 学校、渔村老街、公园、庭院和已经拉开的立面不动。
 * 不进山，不进海，不进澜海，不进月河。南埠不往 y-1540 以南推。没有 438 m 塔。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10aa || D.rongqiaoExpandP10ab || !N.expansionP10) return;
  D.rongqiaoExpandP10ab = 1;
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

  /* 十六栋。Site158 已经拉开的南堤中层不在这里。相邻楼用不同节奏。 */
  const HOME_RHY = {
    rqe_p10a_res: 'plinth',
    rqe_hdg_lb: 'ladder',
    rqe_hdg_ba: 'column',
    rqe_hdg_yy: 'blade',
    rqe_p10f_cy: 'comb',
    rqe_p10f_yq: 'veneer',
    rqe_p10h_qa: 'cascade',
    rqe_p10i_ld: 'grille',
    rqe_p10j_hx: 'terrace',
    rqe_p10j_eh: 'chord',
    rqe_p10j_nb: 'rib',
    rqe_p10j_eb: 'crown',
    rqe_p10o_h279: 'lattice',
    rqe_p10o_h39: 'mast',
    rqe_p10o_h51: 'fin',
    rqe_p10r_h8: 'notch',
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
    if (!b) throw new Error('site159 home ' + id);
    const glassField = b.glass;
    const walls = byFg.get(id) || [];
    const glassWalls = walls.filter((o) => o.state === 'upper' && typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0 && o.variant !== 'hd_g_sign');
    if (glassWalls.length < 8) throw new Error('site159 home glass ' + id + ' ' + glassWalls.length);
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
        if (rhythm === 'grille') mode = bay % 3 === 1 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'cascade') mode = floor % 2 === 0 ? 'alt' : (bay % 3 === 0 ? 'stone' : '');
        else if (rhythm === 'blade') mode = (bay === 0 || bay === max) ? 'alt' : (floor % 2 === 0 ? 'stone' : '');
        else if (rhythm === 'comb') mode = bay % 2 === 0 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'ladder') mode = floor % 3 === 2 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'column') mode = bay % 3 === 0 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'terrace') mode = floor >= hi - 2 ? (bay % 2 === 0 ? 'warm' : 'stone') : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'veneer') mode = bay % 2 === 1 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'plinth') mode = floor <= midFloor && bay % 2 === 1 ? 'stone' : (floor > midFloor && floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'chord') mode = (bay + floor) % 3 === 0 ? 'alt' : (bay % 2 === 0 ? 'stone' : '');
        else if (rhythm === 'notch') mode = (max > 0 && bay === Math.floor(max / 2)) ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'lattice') mode = ((bay % 2) ^ (floor % 2)) ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'rib') mode = bay % 2 === 1 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'crown') mode = floor >= hi - 1 ? 'stone' : (floor % 2 === 1 ? 'alt' : '');
        else if (rhythm === 'mast') mode = bay % 2 === 1 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'fin') mode = bay % 2 === 1 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        if (mode === 'stone') toStone(o);
        else if (mode === 'alt') toGlass(o, altOf(o.variant, origin), floor, bay);
        else if (mode === 'warm') toGlass(o, warmOf(origin), floor, bay);
      }
    }
    /* 前刀若已吃掉奇数层玻璃，楼层节奏可能碰不到第二色玻璃，再按开间补一刀。 */
    {
      const liveGlass = glassWalls.filter((o) => typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0);
      const liveVars = new Set(liveGlass.map((o) => o.variant));
      if (liveVars.size < 2) {
        const stillOrigin = liveGlass.filter((o) => o.variant === origin);
        stillOrigin.forEach((o, i) => {
          if (i % 2 === 0) toGlass(o, altOf(o.variant, origin), Math.round((o.z || 0) / 3) + 1, i);
        });
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
    const glassAfter = upper.filter((o) => typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0);
    const glassVars = new Set(glassAfter.map((o) => o.variant));
    let changed = 0;
    for (let i = 0; i < glassWalls.length; i++) if (glassWalls[i].variant !== before[i].variant) changed++;
    if (changed < 4 || variants.size < 3 || kept < 4 || glassVars.size < 2) {
      throw new Error('site159 rhythm ' + id + ' ' + rhythm + ' ' + changed + ' ' + kept + ' ' + glassVars.size + ' ' + [...variants].join(','));
    }
    if (glassField != null && b.glass !== glassField) throw new Error('site159 glass field ' + id);
    if (!b.name) throw new Error('site159 name ' + id);
    const signs = walls.filter((o) => o.variant === 'hd_g_sign' || o.sign);
    if (signs.length && signs.some((o) => o.sign && o.sign !== b.name)) throw new Error('site159 sign ' + id);
    const bad = upper.filter((o) => o.variant !== 'hd_stone' && !(typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0));
    if (bad.length) throw new Error('site159 foreign ' + id + ' ' + bad[0].variant);
    homeNotes.push({
      id, name: b.name, rhythm, glass: origin, band: 'home', kind: b.kind || 'home',
      changed, kept, variants: variants.size, glassVars: glassVars.size, F: b.F, x: b.x0, y: b.y0,
    });
  }
  if (homeNotes.length !== 16) throw new Error('site159 homes ' + homeNotes.length);

  for (let i = 0; i < homeNotes.length; i++) {
    for (let j = i + 1; j < homeNotes.length; j++) {
      const a = homeNotes[i], c = homeNotes[j];
      if (Math.abs(a.y - c.y) < 12 && Math.abs(a.x - c.x) < 40 && a.rhythm === c.rhythm) {
        throw new Error('site159 neighbor ' + a.name + ' ' + c.name + ' ' + a.rhythm);
      }
    }
  }
  const rhythmSet = new Set(homeNotes.map((n) => n.rhythm));
  if (rhythmSet.size !== 16) throw new Error('site159 rhythm dup ' + rhythmSet.size);

  const school = (byFg.get('rqe_p10k_sch') || []).filter((o) => o.state === 'upper' && o.variant !== 'hd_g_sign');
  if (school.length < 8 || new Set(school.map((o) => o.variant)).size !== 1) throw new Error('site159 school');
  const old = (byFg.get('rqe_oldst_l3') || []).filter((o) => o.state === 'upper');
  if (old.length < 8 || old.some((o) => o.variant !== 'm_brick2')) throw new Error('site159 old street');

  for (const c of D.chunks || []) {
    const bag = CH[c.id];
    const n = (bag && bag.objects || []).length;
    if (n > 2600) throw new Error('site159 chunk cap ' + c.id + ' ' + n);
  }

  P.site159 = {
    unconfirmed: true,
    choice: 'quality',
    homes: homeNotes,
    counts: { homes: homeNotes.length },
    rhythms: [...rhythmSet],
    cap: 120,
  };
  P.reasons.site159 = '第三十刀仍不做新区。北界 y432 以上是山，南边是海，东边是澜海。榕桥剩下的学校、河岸公园、庭院和渔村老街不动。月河石驳岸仍是一整面。西侧山体封口继续挡住 (400, 400) 和 (900, 400)，山径台地（600, 370）仍是草地。扫过街块之间的空档，剩下的是路、步行缝、公园和别墅院，没有一块能再放下几栋配套，所以这一刀不补楼，也不是 438 m。Site153 给河东大道北侧中层轮过 pier/belt/crown，但河东里、澜北居、北岸里、银月里、澄月里、月栖、栖岸居、澜东居、岸西居仍是裙楼石材加整片同色玻璃；Site154 的海东居、岸北居、海北居，以及山津居、枣湾居、山西居、霜津居也还是同一套薄节奏。十六栋中层住宅按各自的节奏拆开立面，并确保每栋都出现第二色玻璃。层数、平面和招牌玻璃留着，不改 facadeRhythm 字段。相邻楼不共用同一套节奏。山前小学和渔村老街的墙皮不动。不加新物件，不加新碰撞。不进月河，不进澜海，不进山。不把南埠往 y-1540 以南推。名字和尺寸未经确认。';
  root.SITE159 = P.site159;
})();
