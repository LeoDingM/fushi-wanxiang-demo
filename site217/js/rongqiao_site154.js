/* Site154：质量修补。生长空间已经几乎没了，这一刀不新开街区，也不补楼。
 * 渔港三排、南堤一排、山前一排的矮住宅，还有海东居、岸北居、海北居，裙楼仍是石材，上面整片同色玻璃。
 * 层数和平面不动，相邻的楼用不同节奏把塔身拆开。山前小学、渔村老街、学校、公园和庭院不动。
 * 下台和山麓台地的北缘人行道（草地和山体封口之间，y425 一带）原先没有树。南侧和靠楼的北侧人行道 Site152、Site153 已经种过。
 * 不进山，不进海，不进澜海，不进月河，不进学校、公园、庭院和渔村老街。
 * 南埠不往 y-1540 以南推。没有 438 m 塔。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10v || D.rongqiaoExpandP10w || !N.expansionP10) return;
  D.rongqiaoExpandP10w = 1;
  const P = N.expansionP10;
  const CH = root.SCENE_CHUNKS || {};

  function pickChunk(x, y) {
    let best = null, area = Infinity;
    for (const c of D.chunks || []) {
      const r = c.rect;
      if (!r || x < r[0] || x >= r[2] || y < r[1] || y >= r[3]) continue;
      const a = (r[2] - r[0]) * (r[3] - r[1]);
      if (a < area && CH[c.id]) { area = a; best = c.id; }
    }
    if (best) return best;
    throw new Error('site154 no chunk ' + x + ',' + y);
  }
  const bags = {};
  const added = {};
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10x_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    const key = pickChunk(o.x, o.y);
    (bags[key] || (bags[key] = [])).push(o);
    added[key] = (added[key] || 0) + 1;
    return o;
  }

  const byId = new Map();
  for (const b of (N.buildings || []).concat(N.modernBuildings || [])) {
    if (b && b.id && !byId.has(b.id)) byId.set(b.id, b);
  }
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { for (const b of node) if (b && b.id && b.F) byId.set(b.id, b); return; }
    if (node.id && node.F && node.x0 != null) byId.set(node.id, node);
    if (Array.isArray(node.buildings)) for (const b of node.buildings) if (b && b.id) byId.set(b.id, b);
    if (Array.isArray(node.towers)) for (const b of node.towers) if (b && b.id) byId.set(b.id, b);
  }
  for (const k of Object.keys(P)) walk(P[k]);

  const byFg = new Map();
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
  function wanted(b) {
    if (!b || b.kind !== 'home' || b.facadeRhythm || b.F < 3 || b.F > 9) return false;
    if (b.y0 < -220 || b.y0 > 378 || b.x0 < 356 || b.x0 > 1750) return false;
    if (hitsOld(b) || /^rqe_oldst_/.test(b.id)) return false;
    const row = /^rqe_p10m_h\d+$/.test(b.id) || /^rqe_p10l_h\d+$/.test(b.id) || /^rqe_p10k_h\d+$/.test(b.id);
    const east = b.id === 'rqe_p10j_eh' || b.id === 'rqe_p10j_nb' || b.id === 'rqe_p10j_eb';
    return row || east;
  }
  const targets = [];
  for (const b of byId.values()) if (wanted(b)) targets.push(b);
  const RHY = ['pier', 'belt', 'stripe', 'frame', 'crown', 'quilt'];
  const rows = new Map();
  for (const b of targets) {
    const key = Math.round(b.y0);
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(b);
  }
  for (const list of rows.values()) {
    list.sort((a, b) => a.x0 - b.x0 || a.id.localeCompare(b.id));
    list.forEach((b, i) => { b._rhythm = RHY[i % RHY.length]; });
  }
  function crowded(b, rhythm) {
    return targets.some((o) => o !== b && o._rhythm === rhythm && Math.abs(o.y0 - b.y0) < 12 && Math.abs(o.x0 - b.x0) < 64);
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
  function warmOf(glass) { return glass === 'hd_g_dl' ? 'hd_g_yl' : 'hd_g_dl'; }
  function altOf(variant, glass) {
    const src = typeof variant === 'string' && variant.indexOf('hd_g_') === 0 && variant !== 'hd_g_sign' ? variant : glass;
    return ALT[src] || 'hd_g_qp';
  }
  function toStone(o) { o.variant = 'hd_stone'; delete o.hdGlass; o.night_lit = 0; }
  function toGlass(o, v, floor, bay) {
    o.variant = v;
    o.hdGlass = 1;
    if (o.state === 'upper') o.night_lit = (floor + bay) % 4 !== 0 ? 1 : 0;
  }
  const notes = [];
  for (const b of targets) {
    const walls = byFg.get(b.id) || [];
    const upper = walls.filter((o) => o.state === 'upper' && o.variant !== 'hd_g_sign');
    if (upper.length < 8) throw new Error('site154 walls ' + b.id + ' ' + upper.length);
    const glass = upper[0].variant;
    if (typeof glass !== 'string' || glass.indexOf('hd_g_') !== 0) throw new Error('site154 skin ' + b.id + ' ' + glass);
    if (upper.some((o) => o.variant !== glass)) throw new Error('site154 already mixed ' + b.id);
    const before = upper.map((o) => ({ variant: o.variant, hdGlass: o.hdGlass, night: o.night_lit }));
    const groups = new Map();
    for (const o of upper) {
      const floor = Math.round((o.z || 0) / 3) + 1;
      const key = floor + ':' + (o.rot || 0);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(o);
    }
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
          else if (rhythm === 'belt') mode = floor === Math.max(2, Math.min(F - 1, Math.ceil(F / 2))) ? 'stone' : '';
          else if (rhythm === 'stripe') mode = floor % 2 === 1 ? 'alt' : '';
          else if (rhythm === 'frame') mode = (max >= 2 && (bay === 0 || bay === max)) || (max < 2 && bay % 2 === 1) ? 'stone' : '';
          else if (rhythm === 'crown') mode = floor === F ? 'stone' : '';
          else if (rhythm === 'quilt') mode = (bay + floor) % 2 === 0 ? 'alt' : '';
          const prev = o.variant;
          if (mode === 'stone' && typeof prev === 'string' && prev.indexOf('hd_g_') === 0) toStone(o);
          else if (mode === 'alt' && typeof prev === 'string' && prev.indexOf('hd_g_') === 0) toGlass(o, altOf(prev, glass), floor, bay);
          else if (mode === 'warm' && typeof prev === 'string' && prev.indexOf('hd_g_') === 0) toGlass(o, warmOf(glass), floor, bay);
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
    if (changed < 4 || variants.size < 2 || kept < 2) {
      throw new Error('site154 rhythm ' + b.id + ' ' + b._rhythm + ' ' + changed + ' ' + kept + ' ' + [...variants].join(','));
    }
    const bad = upper.filter((o) => o.variant !== 'hd_stone' && !(typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0));
    if (bad.length) throw new Error('site154 foreign ' + b.id + ' ' + bad[0].variant);
    const band = /^rqe_p10m_h/.test(b.id) ? 'harbor' : /^rqe_p10l_h/.test(b.id) ? 'quay' : /^rqe_p10k_h/.test(b.id) ? 'hill' : 'east';
    notes.push({
      id: b.id, name: b.name, rhythm: b._rhythm, glass, band,
      changed, kept, variants: variants.size, F: b.F, x: b.x0, y: b.y0,
    });
    delete b._rhythm;
  }
  if (notes.length < 110) throw new Error('site154 homes ' + notes.length);
  const bandCount = { harbor: 0, quay: 0, hill: 0, east: 0 };
  for (const n of notes) bandCount[n.band]++;
  if (bandCount.harbor < 80 || bandCount.quay < 12 || bandCount.hill < 12 || bandCount.east !== 3) {
    throw new Error('site154 bands ' + JSON.stringify(bandCount));
  }
  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const a = notes[i], c = notes[j];
      if (Math.abs(a.y - c.y) < 10 && Math.abs(a.x - c.x) < 48 && a.rhythm === c.rhythm) {
        throw new Error('site154 neighbor ' + a.name + ' ' + c.name + ' ' + a.rhythm);
      }
    }
  }

  const feet = [];
  for (const c of D.colliders || []) if (c && c.rect) feet.push(c.rect);
  function insideFoot(x, y, pad) {
    return feet.some((r) => x > r[0] - pad && x < r[2] + pad && y > r[1] - pad && y < r[3] + pad);
  }
  const G = D.ground;
  const tileAt = (x, y) => {
    const c = Math.floor((x - G.origin[0]) / G.chunk), r = Math.floor((y - G.origin[1]) / G.chunk);
    const row = G.data_south_to_north[r];
    return row && row[c];
  };
  const ROADS = [[1368, 362, 1384, 428], [1518, 354, 1538, 428]];
  function onRoad(x, y) { return ROADS.some((r) => x > r[0] && x < r[2] && y > r[1] && y < r[3]); }
  const treesNear = [];
  for (const ch of Object.values(CH)) for (const o of (ch && ch.objects) || []) if (o && o.type === 'rq_x_tree') treesNear.push(o);
  function nearTree(x, y) { return treesNear.some((o) => Math.abs(o.x - x) < 7 && Math.abs(o.y - y) < 6); }
  const TREES = ['ginkgo', 'camphor', 'sakura'];
  let trees = 0, lamps = 0, benches = 0;
  const bands = { lo: 0, ea: 0 };
  const TREE_Y = 425.5;
  function tryTree(tag, x, y) {
    if (onRoad(x, y) || insideFoot(x, y, 1.6) || nearTree(x, y) || tileAt(x, y) !== 'S') return false;
    const o = put('tr_' + tag + '_' + Math.round(x), 'rq_x_tree', x, y, { variant: TREES[trees % TREES.length], fade_group: 'rqe_p10x_walk' });
    treesNear.push(o);
    trees++;
    bands[tag]++;
    return true;
  }
  function tryLamp(tag, x, y) {
    if (onRoad(x, y) || insideFoot(x, y, 0.6) || tileAt(x, y) !== 'S') return;
    put('lamp_' + tag + '_' + Math.round(x), 'p_lamp', x, y, { interact: 'lamp', fade_group: 'rqe_p10x_walk' });
    lamps++;
  }
  function tryBench(tag, x, y) {
    if (onRoad(x, y) || insideFoot(x, y, 0.6) || tileAt(x, y) !== 'S') return;
    put('bench_' + tag + '_' + Math.round(x), 'community_bench', x, y, { rot: 0, fade_group: 'rqe_p10x_walk' });
    benches++;
  }
  /* 北缘人行道。草地大约收到 y424，山体封口从 y428 起。树种在中间这条铺装上，让开东月路和澜东路。 */
  for (const x of [1396, 1414, 1432, 1450, 1468, 1486, 1504]) if (tryTree('lo', x, TREE_Y)) tryLamp('lo', x + 8, TREE_Y);
  for (const x of [1552, 1570, 1588, 1606, 1624, 1642, 1660]) if (tryTree('ea', x, TREE_Y)) tryLamp('ea', x + 8, TREE_Y);
  tryBench('lo', 1428, 424.6);
  tryBench('lo', 1464, 424.6);
  tryBench('ea', 1592, 424.6);
  tryBench('ea', 1646, 424.6);
  if (trees < 12 || bands.lo < 5 || bands.ea < 5 || lamps < 8 || benches < 4) {
    throw new Error('site154 walk ' + trees + ' ' + bands.lo + ' ' + bands.ea + ' ' + lamps + ' ' + benches);
  }

  for (const [id, list] of Object.entries(bags)) {
    if (!CH[id]) throw new Error('site154 missing chunk ' + id);
    const next = (CH[id].objects || []).concat(list);
    if (next.length > 2600) throw new Error('site154 chunk cap ' + id + ' ' + next.length);
    CH[id].objects = next;
  }
  const wet = [];
  for (const list of Object.values(bags)) {
    for (const o of list) for (const w of N.water || []) {
      if (w && o.x > w[0] && o.x < w[2] && o.y > w[1] && o.y < w[3]) wet.push(o.id);
    }
  }
  if (wet.length) throw new Error('site154 water ' + wet.join(','));
  if (tileAt(1200, 400) !== 'K') throw new Error('site154 concrete ' + tileAt(1200, 400));
  if (tileAt(1328, 422) !== 'G' || tileAt(1460, 418) !== 'G' || tileAt(600, 370) !== 'G') throw new Error('site154 grass');
  if (tileAt(1440, 425.5) !== 'S' || tileAt(1600, 425.5) !== 'S') throw new Error('site154 rim');

  const counts = {};
  for (const [id, n] of Object.entries(added)) counts[id] = { added: n, total: CH[id].objects.length };
  P.site154 = {
    unconfirmed: true,
    choice: 'quality',
    homes: notes,
    bands: bandCount,
    rhythms: RHY,
    walk: { trees, lamps, benches, bands, y: TREE_Y, fronts: [[1384, 424, 1518, 427], [1538, 424, 1686, 427]] },
    counts,
    cap: 120,
  };
  P.reasons.site154 = '第二十五刀仍不做新区。北界 y432 以上是山，南边是海，东边是澜海。榕桥剩下的学校、河岸公园、庭院和渔村老街不动。月河石驳岸仍是一整面。西侧山体封口继续挡住 (400, 400) 和 (900, 400)，山径台地（600, 370）仍是草地。扫过街块之间的空档，剩下的是路、步行缝、公园和别墅院，没有一块能再放下几栋配套，所以这一刀不补楼，也不是 438 m。渔港三排矮住宅（y-186、y-158、y-122）、南堤一排（y-62）和山前一排（y268）原先都是裙楼石材、上面整片同色玻璃，名字还在潮声居、网寮里、帆影居、月湾里、望海里、月津居、林缘居、望山里这几套里打转。海东居 (1674, 84)、岸北居 (1588, 164)、海北居 (1668, 164) 也是整片玻璃。层数、平面和原来的玻璃还留着，相邻的楼改成竖墩、石腰、奇数层跳色、边框、顶层石冠或棋盘，左右不跟同一套。山前小学和渔村老街的墙皮不动。下台北缘人行道（y425.5，x1396–1504）和山麓台地北缘人行道（x1552–1660）夹在草地和山体封口之间，原先没有树，补了银杏、樟和樱，灯和长椅让开楼、路和草地。不进月河，不进澜海，不进山。不把南埠往 y-1540 以南推。名字和尺寸未经确认。';
  root.SITE154 = P.site154;
})();
