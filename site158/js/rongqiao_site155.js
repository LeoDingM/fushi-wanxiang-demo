/* Site155：质量修补。生长空间已经没了，这一刀不新开街区，也不补楼。
 * 渔港三排里每五栋有一栋铺面，序号一除五余数是零，招牌却用同一个余数去取名字，二十四栋都叫渔港面馆，上面还是整片同色玻璃。
 * 南堤一排、山前一排和月津路南侧的铺面，以及七栋月津停车楼，也是裙楼石材、上面整片同色玻璃。
 * 层数和平面不动。铺面、菜场、社康和停车楼按各自的节奏拆开，左右不跟 Site154 的住宅同一套。
 * 河口中心、望海酒店、帆脊酒店只留着石冠或横带，塔身仍是一种玻璃。层数、平面和招牌玻璃留着，塔身再拆开。
 * 学校、渔村老街、公园、庭院和已经拉开的住宅、塔不动。
 * 不进山，不进海，不进澜海，不进月河。南埠不往 y-1540 以南推。没有 438 m 塔。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10w || D.rongqiaoExpandP10x || !N.expansionP10) return;
  D.rongqiaoExpandP10x = 1;
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
  const OLD_STREET = [376, -192, 560, -112];
  function hitsOld(b) {
    const x1 = b.x0 + (b.W || 9), y1 = b.y0 + (b.D || 9);
    return b.x0 < OLD_STREET[2] && x1 > OLD_STREET[0] && b.y0 < OLD_STREET[3] && y1 > OLD_STREET[1];
  }
  function upperOf(b) {
    return (byFg.get(b.id) || []).filter((o) => o.state === 'upper' && o.variant !== 'hd_g_sign');
  }
  const KINDS = { shop: 1, parking: 1, market: 1, clinic: 1 };
  function flatGlass(b) {
    if (!b || !KINDS[b.kind] || b.kind === 'school' || b.kind === 'park') return false;
    if (b.y0 < -220 || b.y0 > 378 || b.x0 < 356 || b.x0 > 1750) return false;
    if (hitsOld(b) || /^rqe_oldst_/.test(b.id)) return false;
    const upper = upperOf(b);
    if (upper.length < 4) return false;
    const glass = upper[0].variant;
    if (typeof glass !== 'string' || glass.indexOf('hd_g_') !== 0) return false;
    return upper.every((o) => o.variant === glass);
  }
  const targets = [];
  for (const b of byId.values()) if (flatGlass(b)) targets.push(b);

  const PARK_NAMES = {
    rqe_p10l_pk430: '西津停车楼',
    rqe_p10l_pk520: '津西停车楼',
    rqe_p10l_pk700: '河口停车楼',
    rqe_p10l_pk940: '中津停车楼',
    rqe_p10l_pk1100: '月津停车楼',
    rqe_p10l_pk1440: '望海停车楼',
    rqe_p10l_pk1660: '澜南停车楼',
  };
  const HARBOR_NAMES = ['网寮杂货', '潮声茶铺', '帆影花店', '港东渔具', '槽口菜档', '潮寮面铺', '湾口茶铺', '网口干货', '帆口茶档', '寮东杂货', '潮口渔具', '港西干货', '西寮面铺', '中港茶档', '东寮渔具', '南槽杂货', '北网菜档', '口西干货', '寮南茶铺', '港南渔具', '潮西面铺', '帆东杂货', '网南茶档'];
  function rename(b, name) {
    if (!name || b.name === name) return;
    b.name = name;
    if (Array.isArray(b.signs)) for (const s of b.signs) if (s && s.text) s.text = name;
    for (const o of byFg.get(b.id) || []) if (o.sign) o.sign = name;
  }
  for (const b of targets) if (PARK_NAMES[b.id]) rename(b, PARK_NAMES[b.id]);
  const harbor = targets.filter((b) => b.name === '渔港面馆').sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
  const harborRows = new Map();
  for (const b of harbor) {
    const key = Math.round(b.y0);
    if (!harborRows.has(key)) harborRows.set(key, []);
    harborRows.get(key).push(b);
  }
  let harborKept = null, harborNamed = 0;
  const rowKeys = [...harborRows.keys()].sort((a, b) => a - b);
  for (const key of rowKeys) {
    for (const b of harborRows.get(key)) {
      if (!harborKept) { harborKept = b; continue; }
      const name = HARBOR_NAMES[harborNamed++];
      if (!name) throw new Error('site155 harbor names');
      rename(b, name);
    }
  }
  if (harbor.length && (!harborKept || harborKept.name !== '渔港面馆')) throw new Error('site155 harbor name');
  const harborNames = new Set();
  for (const b of harbor) {
    if (harborNames.has(b.name)) throw new Error('site155 harbor dup ' + b.name);
    harborNames.add(b.name);
  }
  const nameAt = new Map();
  for (const b of targets) {
    const key = b.name;
    if (!nameAt.has(key)) nameAt.set(key, []);
    nameAt.get(key).push(b);
  }
  for (const [name, list] of nameAt) {
    if (name !== '渔港面馆' && name !== '月津停车楼') continue;
    if (list.length !== 1) throw new Error('site155 clone name ' + name + ' ' + list.length);
  }

  const RHY = ['pier', 'frame', 'quilt', 'split', 'lintel', 'sash'];
  const homes = (P.site154 && P.site154.homes) || [];
  function besideHome(b, rhythm) {
    return homes.some((n) => Math.abs(n.y - b.y0) < 16 && Math.abs(n.x - b.x0) < 42 && n.rhythm === rhythm);
  }
  const rows = new Map();
  for (const b of targets) {
    const key = Math.round(b.y0 / 8) * 8;
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(b);
  }
  for (const list of rows.values()) {
    list.sort((a, b) => a.x0 - b.x0 || a.y0 - b.y0 || a.id.localeCompare(b.id));
    list.forEach((b, i) => {
      let picked = '';
      for (let t = 0; t < RHY.length; t++) {
        const rhythm = RHY[(i + t) % RHY.length];
        const prev = i > 0 ? list[i - 1]._rhythm : '';
        if (rhythm !== prev && !besideHome(b, rhythm)) { picked = rhythm; break; }
      }
      b._rhythm = picked || RHY[(i + 3) % RHY.length];
    });
  }
  function crowded(b, rhythm) {
    if (besideHome(b, rhythm)) return true;
    return targets.some((o) => o !== b && o._rhythm === rhythm && Math.abs(o.y0 - b.y0) < 14 && Math.abs(o.x0 - b.x0) < 48);
  }
  targets.sort((a, b) => a.x0 - b.x0 || a.y0 - b.y0);
  for (const b of targets) {
    if (!crowded(b, b._rhythm)) continue;
    for (let k = 1; k <= RHY.length; k++) {
      const rhythm = RHY[(RHY.indexOf(b._rhythm) + k) % RHY.length];
      if (!crowded(b, rhythm)) { b._rhythm = rhythm; break; }
    }
  }

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
  const notes = [];
  for (const b of targets) {
    const upper = upperOf(b);
    const glass = upper[0].variant;
    const before = upper.map((o) => ({ variant: o.variant, hdGlass: o.hdGlass, night: o.night_lit }));
    const groups = groupsOf(upper);
    const floors = [...groups.keys()].map((k) => +k.split(':')[0]);
    const F = b.F || Math.max(...floors);
    function paint(rhythm) {
      for (const [key, list] of groups) {
        const floor = +key.split(':')[0];
        const rot = +key.split(':')[1];
        const coord = (o) => (rot === 6 ? o.y : o.x);
        const min = Math.min(...list.map(coord));
        const tagged = list.map((o) => ({ o, bay: Math.round((coord(o) - min) / 3) }));
        const max = Math.max(...tagged.map((t) => t.bay));
        for (const t of tagged) {
          const bay = t.bay, o = t.o;
          let mode = '';
          if (rhythm === 'pier') mode = bay % 2 === 1 ? 'stone' : '';
          else if (rhythm === 'frame') mode = (max >= 2 && (bay === 0 || bay === max)) || (max < 2 && bay % 2 === 1) ? 'stone' : '';
          else if (rhythm === 'quilt') mode = (bay + floor) % 2 === 0 ? 'alt' : '';
          else if (rhythm === 'split') mode = bay <= max / 2 ? 'alt' : '';
          else if (rhythm === 'lintel') mode = rot === 6 ? 'stone' : (bay === 0 ? 'alt' : '');
          else if (rhythm === 'sash') mode = bay % 2 === 0 ? 'alt' : '';
          const prev = o.variant;
          if (mode === 'stone' && typeof prev === 'string' && prev.indexOf('hd_g_') === 0) toStone(o);
          else if (mode === 'alt' && typeof prev === 'string' && prev.indexOf('hd_g_') === 0) toGlass(o, altOf(prev, glass), floor, bay);
        }
      }
    }
    paint(b._rhythm);
    let variants = new Set(upper.map((o) => o.variant));
    if (variants.size < 2) {
      for (const [key, list] of groups) {
        const floor = +key.split(':')[0];
        const rot = +key.split(':')[1];
        const coord = (o) => (rot === 6 ? o.y : o.x);
        const min = Math.min(...list.map(coord));
        list.forEach((o) => {
          const bay = Math.round((coord(o) - min) / 3);
          if ((bay + floor) % 2) toStone(o);
          else toGlass(o, altOf(o.variant, glass), floor, bay);
        });
      }
      variants = new Set(upper.map((o) => o.variant));
    }
    let kept = upper.filter((o) => o.variant === glass).length;
    if (kept < 2) {
      for (let i = upper.length - 1; i >= 0 && kept < 2; i--) {
        const o = upper[i], snap = before[i];
        if (snap.variant !== glass || o.variant === glass) continue;
        o.variant = snap.variant;
        if (snap.hdGlass) o.hdGlass = snap.hdGlass; else delete o.hdGlass;
        o.night_lit = snap.night || 0;
        kept++;
      }
    }
    variants = new Set(upper.map((o) => o.variant));
    let changed = 0;
    for (let i = 0; i < upper.length; i++) if (upper[i].variant !== before[i].variant) changed++;
    if (changed < 2 || variants.size < 2 || kept < 2) {
      throw new Error('site155 rhythm ' + b.id + ' ' + b._rhythm + ' ' + changed + ' ' + kept + ' ' + [...variants].join(','));
    }
    const bad = upper.filter((o) => o.variant !== 'hd_stone' && !(typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0));
    if (bad.length) throw new Error('site155 foreign ' + b.id + ' ' + bad[0].variant);
    const band = /^rqe_p10m_h/.test(b.id) ? 'harbor'
      : /^rqe_p10l_h/.test(b.id) ? 'quay'
      : /^rqe_p10k_h/.test(b.id) ? 'hill'
      : /^rqe_p10l_sh/.test(b.id) ? 'street'
      : /^rqe_p10l_pk/.test(b.id) ? 'parkade'
      : b.kind;
    notes.push({
      id: b.id, name: b.name, rhythm: b._rhythm, glass, band, kind: b.kind,
      changed, kept, variants: variants.size, F, x: b.x0, y: b.y0,
    });
    delete b._rhythm;
  }

  const TOWER_RHY = {
    rqe_p10l_hk: 'rib',
    rqe_p10l_wh: 'warm',
    rqe_p10m_sail: 'mast',
  };
  const towerNotes = [];
  for (const [id, rhythm] of Object.entries(TOWER_RHY)) {
    const b = byId.get(id);
    if (!b) throw new Error('site155 tower ' + id);
    const glassField = b.glass;
    const walls = byFg.get(id) || [];
    const glassWalls = walls.filter((o) => o.state === 'upper' && typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0 && o.variant !== 'hd_g_sign');
    if (glassWalls.length < 12) throw new Error('site155 tower glass ' + id + ' ' + glassWalls.length);
    const origin = glassWalls.find((o) => o.variant === glassField) ? glassField : glassWalls[0].variant;
    const before = glassWalls.map((o) => ({ variant: o.variant, hdGlass: o.hdGlass, night: o.night_lit }));
    const groups = groupsOf(glassWalls);
    const floors = [...groups.keys()].map((k) => +k.split(':')[0]);
    const F = b.F || Math.max(...floors);
    const hi = Math.max(...floors);
    for (const [key, list] of groups) {
      const floor = +key.split(':')[0];
      const rot = +key.split(':')[1];
      const coord = (o) => (rot === 6 ? o.y : o.x);
      const min = Math.min(...list.map(coord));
      const tagged = list.map((o) => ({ o, bay: Math.round((coord(o) - min) / 3) }));
      for (const t of tagged) {
        const bay = t.bay, o = t.o;
        if (typeof o.variant !== 'string' || o.variant.indexOf('hd_g_') !== 0) continue;
        let mode = '';
        if (rhythm === 'rib') mode = bay % 4 === 1 ? 'stone' : (bay % 4 === 3 ? 'alt' : '');
        else if (rhythm === 'warm') mode = floor >= hi - 4 ? 'warm' : '';
        else if (rhythm === 'mast') mode = rot !== 6 && bay % 2 === 1 ? 'stone' : (rot === 6 && floor % 3 === 0 ? 'alt' : '');
        if (mode === 'stone') toStone(o);
        else if (mode === 'alt') toGlass(o, altOf(o.variant, origin), floor, bay);
        else if (mode === 'warm') toGlass(o, warmOf(origin), floor, bay);
      }
    }
    let kept = glassWalls.filter((o) => o.variant === origin).length;
    if (kept < 4) {
      for (let i = glassWalls.length - 1; i >= 0 && kept < 4; i--) {
        const o = glassWalls[i], snap = before[i];
        if (snap.variant !== origin || o.variant === origin) continue;
        o.variant = snap.variant;
        if (snap.hdGlass) o.hdGlass = snap.hdGlass; else delete o.hdGlass;
        o.night_lit = snap.night || 0;
        kept++;
      }
    }
    const variants = new Set(glassWalls.map((o) => o.variant));
    let changed = 0;
    for (let i = 0; i < glassWalls.length; i++) if (glassWalls[i].variant !== before[i].variant) changed++;
    if (changed < 8 || variants.size < 2 || kept < 4) {
      throw new Error('site155 tower rhythm ' + id + ' ' + rhythm + ' ' + changed + ' ' + kept + ' ' + [...variants].join(','));
    }
    if (b.glass !== glassField) throw new Error('site155 tower glass field ' + id);
    const sign = walls.find((o) => o.variant === 'hd_g_sign' && o.sign === b.name);
    if (!sign) throw new Error('site155 tower sign ' + id);
    towerNotes.push({
      id, name: b.name, rhythm, glass: origin, band: 'tower', kind: b.kind,
      changed, kept, variants: variants.size, F: b.F, x: b.x0, y: b.y0,
    });
  }

  const all = notes.concat(towerNotes);
  if (notes.length < 50) throw new Error('site155 shops ' + notes.length);
  if (harbor.length < 20) throw new Error('site155 harbor ' + harbor.length);
  const bandCount = {};
  for (const n of all) bandCount[n.band] = (bandCount[n.band] || 0) + 1;
  if ((bandCount.harbor || 0) < 20 || (bandCount.quay || 0) < 3 || (bandCount.hill || 0) < 2 || (bandCount.street || 0) < 4 || (bandCount.parkade || 0) !== 7 || (bandCount.tower || 0) !== 3) {
    throw new Error('site155 bands ' + JSON.stringify(bandCount));
  }
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i], c = all[j];
      if (Math.abs(a.y - c.y) < 12 && Math.abs(a.x - c.x) < 40 && a.rhythm === c.rhythm) {
        throw new Error('site155 neighbor ' + a.name + ' ' + c.name + ' ' + a.rhythm);
      }
    }
  }
  for (const n of notes) {
    const home = homes.find((h) => Math.abs(h.y - n.y) < 16 && Math.abs(h.x - n.x) < 42);
    if (home && home.rhythm === n.rhythm) throw new Error('site155 home rhythm ' + n.name + ' ' + home.name);
  }
  const school = upperOf(byId.get('rqe_p10k_sch') || { id: 'rqe_p10k_sch' });
  if (school.length < 8 || new Set(school.map((o) => o.variant)).size !== 1) throw new Error('site155 school');
  const old = (byFg.get('rqe_oldst_l3') || []).filter((o) => o.state === 'upper');
  if (old.length < 8 || old.some((o) => o.variant !== 'm_brick2')) throw new Error('site155 old street');
  for (const c of D.chunks || []) {
    const bag = CH[c.id];
    const n = (bag && bag.objects || []).length;
    if (n > 2600) throw new Error('site155 chunk cap ' + c.id + ' ' + n);
  }

  P.site155 = {
    unconfirmed: true,
    choice: 'quality',
    shops: notes,
    towers: towerNotes,
    bands: bandCount,
    rhythms: RHY.concat(['rib', 'warm', 'mast']),
    harborKept: harborKept ? { id: harborKept.id, name: harborKept.name, x: harborKept.x0, y: harborKept.y0 } : null,
    cap: 120,
  };
  P.reasons.site155 = '第二十六刀仍不做新区。北界 y432 以上是山，南边是海，东边是澜海。榕桥剩下的学校、河岸公园、庭院和渔村老街不动。月河石驳岸仍是一整面。西侧山体封口继续挡住 (400, 400) 和 (900, 400)，山径台地（600, 370）仍是草地。扫过街块之间的空档，剩下的是路、步行缝、公园和别墅院，没有一块能再放下几栋配套，所以这一刀不补楼，也不是 438 m。渔港三排的铺面本来要轮换网寮杂货、潮声茶铺、帆影花店这几个名字，取名用的余数和“每五栋一铺”是同一个数，二十四栋招牌都写成了渔港面馆，上面还是整片同色玻璃。最西边那一栋留着渔港面馆，其余改成不同的铺名。南堤、山前和月津路南侧的铺面，七栋月津停车楼，以及还是整片玻璃的菜场和社康，层数、平面和原来的玻璃留着，相邻的改成竖墩、边框、棋盘、对半跳色、侧墙石面或偶数开间跳色，不跟旁边 Site154 的住宅同一套。停车楼按位置改成西津、津西、河口、中津、月津、望海、澜南，只留一栋叫月津停车楼。河口中心 (1544, -62) 加竖向金框，望海酒店 (1600, -30) 上段改暖玻，帆脊酒店 (1400, -186) 南立面加竖墩。三栋的层数、平面和招牌还在。山前小学和渔村老街的墙皮不动。不进月河，不进澜海，不进山。不把南埠往 y-1540 以南推。名字和尺寸未经确认。';
  root.SITE155 = P.site155;
})();
