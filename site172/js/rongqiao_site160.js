/* Site160：质量修补。生长空间已经没了，这一刀不新开街区，也不补楼。
 * Site157 给早期天际线与东岸科研塔轮过节奏，但十一栋仍是石材加整片同色玻璃（节奏只转石、不换第二色玻璃）；
 * Site152 的听山/潮声/津东/渔南/港东/麓西六栋南塔也还是同一套薄玻璃。
 * 这一刀给十七栋塔按各自的节奏拆开立面，并确保每栋都出现第二色玻璃。层数、平面和招牌玻璃不动。不改 facadeRhythm 字段。
 * 学校、渔村老街、公园、庭院和已经拉开的立面不动。
 * 不进山，不进海，不进澜海，不进月河。南埠不往 y-1540 以南推。没有 438 m 塔。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10ab || D.rongqiaoExpandP10ac || !N.expansionP10) return;
  D.rongqiaoExpandP10ac = 1;
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

  /* 十七栋。Site157/152 已拉开但仍缺第二色玻璃的塔。相邻楼用不同节奏。 */
  const TOWER_RHY = {
    rqe_p10h_ja: 'shaft',
    rqe_p10_yh: 'base',
    rqe_p10_sl: 'mesh',
    rqe_p10_qp: 'riser',
    rqe_p10_ls: 'weave',
    rqe_p10_cj: 'slot',
    rqe_p10h_ce: 'edge',
    rqe_p10_yl2: 'stripe',
    rqe_p10i_ay: 'ledge',
    rqe_p10o_cs: 'pier',
    rqe_p10r_seam: 'seam',
    rqe_p10o_ts: 'arcade',
    rqe_p10j_hf: 'step',
    rqe_p10q_slant: 'slash',
    rqe_p10r_slot: 'groove',
    rqe_p10t_step: 'gallery',
    rqe_p10k_sy: 'wing',
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

  const towerNotes = [];
  for (const [id, rhythm] of Object.entries(TOWER_RHY)) {
    const b = byId.get(id);
    if (!b) throw new Error('site160 tower ' + id);
    const glassField = b.glass;
    const walls = byFg.get(id) || [];
    const glassWalls = walls.filter((o) => o.state === 'upper' && typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0 && o.variant !== 'hd_g_sign');
    if (glassWalls.length < 8) throw new Error('site160 tower glass ' + id + ' ' + glassWalls.length);
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
        if (rhythm === 'shaft') mode = bay % 3 === 0 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'base') mode = floor <= midFloor && bay % 2 === 1 ? 'stone' : (floor > midFloor && floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'mesh') mode = ((bay % 2) ^ (floor % 2)) ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'riser') mode = floor % 3 === 2 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'weave') mode = bay % 3 === 1 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'slot') mode = (max > 0 && bay === Math.floor(max / 2)) ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'edge') mode = bay % 2 === 1 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'stripe') mode = bay % 2 === 0 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'ledge') mode = floor % 3 === 1 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'pier') mode = bay % 3 === 0 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'seam') mode = (bay + floor) % 3 === 0 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'arcade') mode = floor % 2 === 0 ? 'alt' : (bay % 3 === 0 ? 'stone' : '');
        else if (rhythm === 'step') mode = floor >= hi - 2 ? (bay % 2 === 0 ? 'warm' : 'stone') : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'slash') mode = (bay + floor) % 3 === 0 ? 'alt' : (bay % 2 === 0 ? 'stone' : '');
        else if (rhythm === 'groove') mode = (bay === 0 || bay === max) ? 'alt' : (floor % 2 === 0 ? 'stone' : '');
        else if (rhythm === 'gallery') mode = bay % 2 === 1 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        else if (rhythm === 'wing') mode = bay >= Math.ceil((max + 1) / 2) ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
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
    /* 河东回归会查高层原色玻璃，再补几块最高层的原色。 */
    {
      const hiNeed = glassWalls.filter((o) => (o.z || 0) >= (hi - 4) * 3 && o.variant === origin).length;
      if (hiNeed < 2) {
        const order = glassWalls.map((o, i) => i).sort((a, c) => (glassWalls[c].z || 0) - (glassWalls[a].z || 0));
        let added = hiNeed;
        for (const i of order) {
          if (added >= 2) break;
          const o = glassWalls[i], snap = before[i];
          if ((o.z || 0) < (hi - 4) * 3) continue;
          if (snap.variant !== origin || o.variant === origin) continue;
          o.variant = snap.variant;
          if (snap.hdGlass) o.hdGlass = snap.hdGlass; else delete o.hdGlass;
          o.night_lit = snap.night || 0;
          added++;
          if (o.variant === origin) kept++;
        }
      }
    }
    /* 保原色之后再确保第二色玻璃；只改够第二色，尽量留住原色。 */
    {
      const liveGlass = glassWalls.filter((o) => typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0);
      const liveVars = new Set(liveGlass.map((o) => o.variant));
      if (liveVars.size < 2) {
        const stillOrigin = liveGlass.filter((o) => o.variant === origin);
        const need = Math.min(4, Math.max(2, stillOrigin.length - 4));
        let n = 0;
        for (let i = stillOrigin.length - 1; i >= 0 && n < need; i--) {
          const o = stillOrigin[i];
          toGlass(o, altOf(o.variant, origin), Math.round((o.z || 0) / 3) + 1, i);
          n++;
        }
        kept = glassWalls.filter((o) => o.variant === origin).length;
        if (kept < 4) {
          const order = glassWalls.map((o, i) => i).sort((a, c) => (glassWalls[c].z || 0) - (glassWalls[a].z || 0));
          for (const i of order) {
            if (kept >= 4) break;
            const o = glassWalls[i], snap = before[i];
            if (snap.variant !== origin || o.variant === origin) continue;
            if (typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0 && o.variant !== origin) {
              /* 不要把最后一块第二色也回成原色 */
              const others = glassWalls.filter((x) => typeof x.variant === 'string' && x.variant.indexOf('hd_g_') === 0 && x.variant !== origin && x !== o);
              if (others.length < 2) continue;
            }
            o.variant = snap.variant;
            if (snap.hdGlass) o.hdGlass = snap.hdGlass; else delete o.hdGlass;
            o.night_lit = snap.night || 0;
            kept++;
          }
        }
      }
    }
    const upper = walls.filter((o) => o.state === 'upper' && o.variant !== 'hd_g_sign');
    const variants = new Set(upper.map((o) => o.variant));
    const glassAfter = upper.filter((o) => typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0);
    const glassVars = new Set(glassAfter.map((o) => o.variant));
    let changed = 0;
    for (let i = 0; i < glassWalls.length; i++) if (glassWalls[i].variant !== before[i].variant) changed++;
    if (changed < 4 || variants.size < 3 || kept < 4 || glassVars.size < 2) {
      throw new Error('site160 rhythm ' + id + ' ' + rhythm + ' ' + changed + ' ' + kept + ' ' + glassVars.size + ' ' + [...variants].join(','));
    }
    if (glassField != null && b.glass !== glassField) throw new Error('site160 glass field ' + id);
    if (!b.name) throw new Error('site160 name ' + id);
    const signs = walls.filter((o) => o.variant === 'hd_g_sign' || o.sign);
    if (signs.length && signs.some((o) => o.sign && o.sign !== b.name)) throw new Error('site160 sign ' + id);
    const bad = upper.filter((o) => o.variant !== 'hd_stone' && !(typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0));
    if (bad.length) throw new Error('site160 foreign ' + id + ' ' + bad[0].variant);
    towerNotes.push({
      id, name: b.name, rhythm, glass: origin, band: 'tower', kind: b.kind || 'work',
      changed, kept, variants: variants.size, glassVars: glassVars.size, F: b.F, x: b.x0 != null ? b.x0 : b.x, y: b.y0 != null ? b.y0 : b.y,
    });
  }
  if (towerNotes.length !== 17) throw new Error('site160 towers ' + towerNotes.length);

  for (let i = 0; i < towerNotes.length; i++) {
    for (let j = i + 1; j < towerNotes.length; j++) {
      const a = towerNotes[i], c = towerNotes[j];
      if (Math.abs(a.y - c.y) < 12 && Math.abs(a.x - c.x) < 40 && a.rhythm === c.rhythm) {
        throw new Error('site160 neighbor ' + a.name + ' ' + c.name + ' ' + a.rhythm);
      }
    }
  }
  const rhythmSet = new Set(towerNotes.map((n) => n.rhythm));
  if (rhythmSet.size !== 17) throw new Error('site160 rhythm dup ' + rhythmSet.size);

  const school = (byFg.get('rqe_p10k_sch') || []).filter((o) => o.state === 'upper' && o.variant !== 'hd_g_sign');
  if (school.length < 8 || new Set(school.map((o) => o.variant)).size !== 1) throw new Error('site160 school');
  const old = (byFg.get('rqe_oldst_l3') || []).filter((o) => o.state === 'upper');
  if (old.length < 8 || old.some((o) => o.variant !== 'm_brick2')) throw new Error('site160 old street');

  for (const c of D.chunks || []) {
    const bag = CH[c.id];
    const n = (bag && bag.objects || []).length;
    if (n > 2600) throw new Error('site160 chunk cap ' + c.id + ' ' + n);
  }

  P.site160 = {
    unconfirmed: true,
    choice: 'quality',
    towers: towerNotes,
    counts: { towers: towerNotes.length },
    rhythms: [...rhythmSet],
    cap: 120,
  };
  P.reasons.site160 = '第三十一刀仍不做新区。北界 y432 以上是山，南边是海，东边是澜海。榕桥剩下的学校、河岸公园、庭院和渔村老街不动。月河石驳岸仍是一整面。西侧山体封口继续挡住 (400, 400) 和 (900, 400)，山径台地（600, 370）仍是草地。扫过街块之间的空档，剩下的是路、步行缝、公园和别墅院，没有一块能再放下几栋配套，所以这一刀不补楼，也不是 438 m。Site157 给早期天际线与东岸科研塔轮过节奏，但金岸大厦、月河中心、石澜中心、秋浦大厦、澜石大厦、澄江中心、澄东中心、研澜大厦、岸砚科研、海风科研、山前实验楼仍是石材加整片同色玻璃；Site152 的潮声办公、渔南错缝、听山酒店、津东斜楼、港东槽楼、麓西折廊也还是同一套薄玻璃。十七栋塔按各自的节奏拆开立面，并确保每栋都出现第二色玻璃。层数、平面和招牌玻璃留着，不改 facadeRhythm 字段。相邻楼不共用同一套节奏。山前小学和渔村老街的墙皮不动。不加新物件，不加新碰撞。不进月河，不进澜海，不进山。不把南埠往 y-1540 以南推。名字和尺寸未经确认。';
  root.SITE160 = P.site160;
})();
