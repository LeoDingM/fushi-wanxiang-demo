/* Site157：质量修补。生长空间已经没了，这一刀不新开街区，也不补楼。
 * Site152 拉开了九栋南塔，Site155 拉开了河口中心、望海酒店、帆脊酒店，但河东大道两侧的早期天际线和东岸科研塔仍是裙楼石材、上面整片同色玻璃。
 * 这一刀给二十二栋办公、酒店和科研塔按各自的节奏拆开塔身。层数、平面和招牌玻璃不动。不写 facadeRhythm。
 * 学校、渔村老街、公园、庭院和已经拉开的立面不动。
 * 不进山，不进海，不进澜海，不进月河。南埠不往 y-1540 以南推。没有 438 m 塔。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10y || D.rongqiaoExpandP10z || !N.expansionP10) return;
  D.rongqiaoExpandP10z = 1;
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

  /* 二十二栋。Site152 / Site155 已经碰过的塔不在这里。相邻楼用不同节奏。 */
  const TOWER_RHY = {
    rqe_p10_ls: 'grille',
    rqe_p10_yl: 'cascade',
    rqe_p10_dl: 'blade',
    rqe_p10_yl2: 'comb',
    rqe_p10_qp: 'ladder',
    rqe_p10h_ja: 'column',
    rqe_p10i_sy: 'terrace',
    rqe_p10j_lw: 'veneer',
    rqe_p10_yh: 'plinth',
    rqe_p10_hd: 'chord',
    rqe_p10_cj: 'notch',
    rqe_p10_sl: 'lattice',
    rqe_p10_yx: 'rib',
    rqe_p10_wm: 'crown',
    rqe_p10h_dy: 'mast',
    rqe_p10h_ce: 'fin',
    rqe_p10i_ay: 'course',
    rqe_p10i_cc: 'band',
    rqe_p10j_bs: 'spine',
    rqe_p10j_hf: 'stagger',
    rqe_p10k_ly: 'fold',
    rqe_p10k_sy: 'east',
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
    if (!b) throw new Error('site157 tower ' + id);
    const glassField = b.glass;
    const walls = byFg.get(id) || [];
    const glassWalls = walls.filter((o) => o.state === 'upper' && typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0 && o.variant !== 'hd_g_sign');
    if (glassWalls.length < 12) throw new Error('site157 tower glass ' + id + ' ' + glassWalls.length);
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
        else if (rhythm === 'cascade') mode = floor % 3 === 0 ? 'alt' : '';
        else if (rhythm === 'blade') mode = max >= 2 && (bay === 0 || bay === max) ? 'alt' : '';
        else if (rhythm === 'comb') mode = bay % 2 === 0 ? 'stone' : '';
        else if (rhythm === 'ladder') mode = floor % 5 === 2 ? 'stone' : '';
        else if (rhythm === 'column') mode = bay % 4 === 0 ? 'stone' : '';
        else if (rhythm === 'terrace') mode = floor >= hi - 3 && bay % 2 === 0 ? 'warm' : '';
        else if (rhythm === 'veneer') mode = rot === 6 && bay % 2 === 1 ? 'stone' : (floor % 4 === 1 ? 'alt' : '');
        else if (rhythm === 'plinth') mode = floor <= Math.max(2, Math.floor(midFloor / 2)) && bay % 2 === 1 ? 'stone' : '';
        else if (rhythm === 'chord') mode = (bay + floor) % 4 === 0 ? 'alt' : '';
        else if (rhythm === 'notch') mode = max >= 2 && bay === Math.floor(max / 2) ? 'stone' : '';
        else if (rhythm === 'lattice') mode = ((bay % 2) ^ (floor % 2)) ? 'stone' : '';
        else if (rhythm === 'rib') mode = bay % 4 === 1 ? 'stone' : (bay % 4 === 3 ? 'alt' : '');
        else if (rhythm === 'crown') mode = floor >= hi - 2 && bay % 2 === 1 ? 'stone' : (floor % 3 === 1 ? 'alt' : '');
        else if (rhythm === 'mast') mode = rot !== 6 && bay % 2 === 1 ? 'stone' : (rot === 6 && floor % 3 === 0 ? 'alt' : '');
        else if (rhythm === 'fin') mode = bay % 3 === 2 ? 'stone' : '';
        else if (rhythm === 'course') mode = floor % 4 === 2 ? 'stone' : '';
        else if (rhythm === 'band') mode = floor % 2 === 0 && floor < hi - 1 ? 'alt' : '';
        else if (rhythm === 'spine') mode = max >= 2 && bay === Math.floor(max / 2) ? 'alt' : '';
        else if (rhythm === 'stagger') mode = (bay + floor) % 3 === 0 ? 'stone' : '';
        else if (rhythm === 'fold') mode = floor > midFloor && bay % 2 === 0 ? 'warm' : '';
        else if (rhythm === 'east') mode = bay >= Math.ceil((max + 1) / 2) ? 'stone' : '';
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
    const upper = walls.filter((o) => o.state === 'upper' && o.variant !== 'hd_g_sign');
    const variants = new Set(upper.map((o) => o.variant));
    let changed = 0;
    for (let i = 0; i < glassWalls.length; i++) if (glassWalls[i].variant !== before[i].variant) changed++;
    if (changed < 8 || variants.size < 2 || kept < 4) {
      throw new Error('site157 rhythm ' + id + ' ' + rhythm + ' ' + changed + ' ' + kept + ' ' + [...variants].join(','));
    }
    if (glassField != null && b.glass !== glassField) throw new Error('site157 glass field ' + id);
    if (!b.name) throw new Error('site157 name ' + id);
    const signs = walls.filter((o) => o.variant === 'hd_g_sign' || o.sign);
    if (signs.length && signs.some((o) => o.sign && o.sign !== b.name)) throw new Error('site157 sign ' + id);
    // 早期天际线有的塔没有招牌墙，有招牌的必须对上名字。
    const bad = upper.filter((o) => o.variant !== 'hd_stone' && !(typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0));
    if (bad.length) throw new Error('site157 foreign ' + id + ' ' + bad[0].variant);
    towerNotes.push({
      id, name: b.name, rhythm, glass: origin, band: 'tower', kind: b.kind || 'work',
      changed, kept, variants: variants.size, F: b.F, x: b.x0, y: b.y0,
    });
  }
  if (towerNotes.length !== 22) throw new Error('site157 towers ' + towerNotes.length);

  for (let i = 0; i < towerNotes.length; i++) {
    for (let j = i + 1; j < towerNotes.length; j++) {
      const a = towerNotes[i], c = towerNotes[j];
      if (Math.abs(a.y - c.y) < 12 && Math.abs(a.x - c.x) < 40 && a.rhythm === c.rhythm) {
        throw new Error('site157 neighbor ' + a.name + ' ' + c.name + ' ' + a.rhythm);
      }
    }
  }
  const rhythmSet = new Set(towerNotes.map((n) => n.rhythm));
  if (rhythmSet.size !== 22) throw new Error('site157 rhythm dup ' + rhythmSet.size);

  const school = (byFg.get('rqe_p10k_sch') || []).filter((o) => o.state === 'upper' && o.variant !== 'hd_g_sign');
  if (school.length < 8 || new Set(school.map((o) => o.variant)).size !== 1) throw new Error('site157 school');
  const old = (byFg.get('rqe_oldst_l3') || []).filter((o) => o.state === 'upper');
  if (old.length < 8 || old.some((o) => o.variant !== 'm_brick2')) throw new Error('site157 old street');

  for (const c of D.chunks || []) {
    const bag = CH[c.id];
    const n = (bag && bag.objects || []).length;
    if (n > 2600) throw new Error('site157 chunk cap ' + c.id + ' ' + n);
  }

  P.site157 = {
    unconfirmed: true,
    choice: 'quality',
    towers: towerNotes,
    counts: { towers: towerNotes.length },
    rhythms: [...rhythmSet],
    cap: 120,
  };
  P.reasons.site157 = '第二十八刀仍不做新区。北界 y432 以上是山，南边是海，东边是澜海。榕桥剩下的学校、河岸公园、庭院和渔村老街不动。月河石驳岸仍是一整面。西侧山体封口继续挡住 (400, 400) 和 (900, 400)，山径台地（600, 370）仍是草地。扫过街块之间的空档，剩下的是路、步行缝、公园和别墅院，没有一块能再放下几栋配套，所以这一刀不补楼，也不是 438 m。Site152 和 Site155 已经拉开了南塔和河口一带，但河东大道两侧的早期天际线和东岸科研塔仍是裙楼石材、上面整片同色玻璃。二十二栋办公、酒店和科研塔按各自的节奏拆开塔身：澜石大厦、月澜大厦、东澜大厦、研澜大厦、秋浦大厦、金岸大厦、双月研发、澜湾酒店、月河中心、河东广场、澄江中心、石澜中心、银杏中心、望月中心、东砚科研、澄东中心、岸砚科研、澄澜中心、滨石中心、海风科研、林缘科研、山前实验楼。层数、平面和招牌玻璃留着，不写 facadeRhythm。相邻楼不共用同一套节奏。山前小学和渔村老街的墙皮不动。不加新物件，不加新碰撞。不进月河，不进澜海，不进山。不把南埠往 y-1540 以南推。名字和尺寸未经确认。';
  root.SITE157 = P.site157;
})();
