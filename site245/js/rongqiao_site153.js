/* Site153：质量修补。生长空间已经几乎没了，这一刀不新开街区，也不补楼。
 * 扫过月河区，剩下的开口是路、步行缝、公园、学校和别墅院，不是能放下几栋的配套地。
 * 河东大道北侧和南侧还有十六栋中层住宅，裙楼石材、上面整片同色玻璃。层数和平面不动，塔身按各栋自己的节奏拆开。
 * 下台和山麓台地的北侧人行道、上台北侧人行道，原先几乎没有树。南侧 Site152 已经种过。
 * 不进山，不进海，不进澜海，不进月河，不进学校、公园、庭院和渔村老街。
 * 南埠不往 y-1540 以南推。没有 438 m 塔。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10u || D.rongqiaoExpandP10v || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10v = 1;
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
    throw new Error('site153 no chunk ' + x + ',' + y);
  }
  const bags = {};
  const added = {};
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10w_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    const key = pickChunk(o.x, o.y);
    (bags[key] || (bags[key] = [])).push(o);
    added[key] = (added[key] || 0) + 1;
    return o;
  }

  const TARGETS = [
    { id: 'rqe_p10a_res', name: '河东里', rhythm: 'pier', glass: 'hd_g_dl' },
    { id: 'rqe_hdg_lb', name: '澜北居', rhythm: 'belt', glass: 'hd_g_yl2' },
    { id: 'rqe_hdg_csj', name: '澄石居', rhythm: 'stripe', glass: 'hd_g_wm' },
    { id: 'rqe_hdg_ba', name: '北岸里', rhythm: 'frame', glass: 'hd_g_dl' },
    { id: 'rqe_hdg_yy', name: '银月里', rhythm: 'crown', glass: 'hd_g_yx' },
    { id: 'rqe_p10f_cy', name: '澄月里', rhythm: 'stagger', glass: 'hd_g_yl2' },
    { id: 'rqe_p10f_yq', name: '月栖', rhythm: 'fin', glass: 'hd_g_wm' },
    { id: 'rqe_p10f_da', name: '东岸居', rhythm: 'band', glass: 'hd_g_dl' },
    { id: 'rqe_p10h_qa', name: '栖岸居', rhythm: 'course', glass: 'hd_g_yx' },
    { id: 'rqe_p10h_cl', name: '澄东里', rhythm: 'spine', glass: 'hd_g_yl2' },
    { id: 'rqe_p10i_ld', name: '澜东居', rhythm: 'slot', glass: 'hd_g_wm' },
    { id: 'rqe_p10i_ly', name: '澜月居', rhythm: 'fold', glass: 'hd_g_dl' },
    { id: 'rqe_p10a_soho', name: '银杏里', rhythm: 'quilt', glass: 'hd_g_yl2' },
    { id: 'rqe_p10j_hx', name: '岸西居', rhythm: 'rib', glass: 'hd_g_wm' },
    { id: 'rqe_p10j_by', name: '滨月居', rhythm: 'sash', glass: 'hd_g_yx' },
    { id: 'rqe_p10j_hq', name: '海栖里', rhythm: 'notch', glass: 'hd_g_yl2' },
  ];
  const byId = new Map();
  for (const k of Object.keys(P)) {
    const node = P[k];
    if (!node) continue;
    const list = Array.isArray(node) ? node : [].concat(node.buildings || [], node.towers || []);
    for (const b of list) if (b && b.id && !byId.has(b.id)) byId.set(b.id, b);
  }
  const byFg = new Map();
  for (const ch of Object.values(CH)) {
    for (const o of (ch && ch.objects) || []) {
      if (!o || o.type !== 'f_wall' || !o.fade_group) continue;
      let list = byFg.get(o.fade_group);
      if (!list) byFg.set(o.fade_group, list = []);
      list.push(o);
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
  const rhythms = new Set();
  for (const spec of TARGETS) {
    const b = byId.get(spec.id);
    if (!b) throw new Error('site153 missing ' + spec.id);
    if (rhythms.has(spec.rhythm)) throw new Error('site153 rhythm clone ' + spec.rhythm);
    rhythms.add(spec.rhythm);
    const walls = byFg.get(spec.id) || [];
    const upper = walls.filter((o) => o.state === 'upper' && o.variant !== 'hd_g_sign');
    if (upper.length < 12) throw new Error('site153 walls ' + spec.id + ' ' + upper.length);
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
    const midFloor = floors.slice().sort((a, c) => a - c)[Math.floor(floors.length / 2)] || 1;
    let changed = 0;
    for (const [key, list] of groups) {
      const floor = +key.split(':')[0];
      const rot = +key.split(':')[1];
      const coord = (o) => (rot === 6 ? o.y : o.x);
      const min = Math.min(...list.map(coord));
      const tagged = list.map((o) => ({ o, bay: Math.round((coord(o) - min) / 3) }));
      const max = Math.max(...tagged.map((t) => t.bay));
      for (const t of tagged) {
        const bay = t.bay;
        const o = t.o;
        if (o.variant === 'hd_g_sign') continue;
        let mode = '';
        const rhythm = spec.rhythm;
        if (rhythm === 'pier') mode = bay % 2 === 1 ? 'stone' : '';
        else if (rhythm === 'belt') mode = floor === Math.max(2, Math.min(F - 1, Math.ceil(F / 2))) ? 'stone' : '';
        else if (rhythm === 'stripe') mode = floor % 2 === 1 ? 'alt' : '';
        else if (rhythm === 'frame') mode = max >= 2 && (bay === 0 || bay === max) ? 'stone' : '';
        else if (rhythm === 'crown') mode = floor >= F - 1 ? 'stone' : '';
        else if (rhythm === 'stagger') mode = (bay + floor) % 3 === 0 ? 'stone' : '';
        else if (rhythm === 'fin') mode = bay % 3 === 2 ? 'stone' : '';
        else if (rhythm === 'band') mode = floor % 2 === 0 ? 'warm' : '';
        else if (rhythm === 'course') mode = floor % 4 === 2 ? 'stone' : '';
        else if (rhythm === 'spine') mode = max >= 2 && bay === Math.floor(max / 2) ? 'alt' : '';
        else if (rhythm === 'slot') mode = max >= 1 && bay === max ? 'stone' : '';
        else if (rhythm === 'fold') mode = floor > midFloor && bay % 2 === 0 ? 'warm' : '';
        else if (rhythm === 'quilt') mode = (bay + floor) % 2 === 0 ? 'alt' : '';
        else if (rhythm === 'rib') mode = bay % 3 === 0 ? 'stone' : '';
        else if (rhythm === 'sash') mode = floor % 3 === 0 ? 'warm' : '';
        else if (rhythm === 'notch') mode = bay === 0 ? 'stone' : (floor % 2 === 0 ? 'alt' : '');
        const prev = o.variant;
        if (mode === 'stone' && typeof prev === 'string' && prev.indexOf('hd_g_') === 0) toStone(o);
        else if (mode === 'alt' && (prev === 'hd_stone' || (typeof prev === 'string' && prev.indexOf('hd_g_') === 0))) toGlass(o, altOf(prev, spec.glass), floor, bay);
        else if (mode === 'warm' && (prev === 'hd_stone' || (typeof prev === 'string' && prev.indexOf('hd_g_') === 0))) toGlass(o, warmOf(spec.glass), floor, bay);
        if (o.variant !== prev) changed++;
      }
    }
    let kept = upper.filter((o) => o.variant === spec.glass).length;
    if (kept < 2) {
      for (let i = upper.length - 1; i >= 0 && kept < 2; i--) {
        const o = upper[i];
        const snap = before[i];
        if (snap.variant !== spec.glass || o.variant === spec.glass) continue;
        o.variant = snap.variant;
        if (snap.hdGlass) o.hdGlass = snap.hdGlass; else delete o.hdGlass;
        o.night_lit = snap.night || 0;
        kept++;
      }
    }
    const variants = new Set(upper.map((o) => o.variant));
    if (changed < 4 || variants.size < 2 || kept < 2) {
      throw new Error('site153 rhythm ' + spec.id + ' ' + spec.rhythm + ' ' + changed + ' ' + kept + ' ' + [...variants].join(','));
    }
    const bad = upper.filter((o) => o.variant !== 'hd_stone' && !(typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0));
    if (bad.length) throw new Error('site153 skin ' + spec.id + ' ' + bad[0].variant);
    notes.push({
      id: spec.id, name: spec.name, rhythm: spec.rhythm, glass: spec.glass,
      changed, kept, variants: variants.size, F: b.F, x: b.x0, y: b.y0,
    });
  }
  if (notes.length !== 16) throw new Error('site153 mids ' + notes.length);
  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const a = notes[i], c = notes[j];
      if (a.rhythm === c.rhythm) throw new Error('site153 same rhythm ' + a.name + ' ' + c.name);
      if (Math.abs(a.y - c.y) < 10 && Math.abs(a.x - c.x) < 48 && a.rhythm === c.rhythm) {
        throw new Error('site153 neighbor ' + a.name + ' ' + c.name);
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
  const bands = { lo: 0, ea: 0, up: 0 };
  function tryTree(tag, x, y) {
    if (onRoad(x, y) || insideFoot(x, y, 2.3) || nearTree(x, y)) return false;
    if (tileAt(x, y) !== 'S') return false;
    const o = put('tr_' + tag + '_' + Math.round(x) + '_' + Math.round(y), 'rq_x_tree', x, y, { variant: TREES[trees % TREES.length], fade_group: 'rqe_p10w_walk' });
    treesNear.push(o);
    trees++;
    bands[tag]++;
    return true;
  }
  function tryLamp(tag, x, y) {
    if (onRoad(x, y) || insideFoot(x, y, 0.8) || tileAt(x, y) !== 'S') return;
    put('lamp_' + tag + '_' + Math.round(x), 'p_lamp', x, y, { interact: 'lamp', fade_group: 'rqe_p10w_walk' });
    lamps++;
  }
  function tryBench(tag, x, y) {
    if (onRoad(x, y) || insideFoot(x, y, 0.8) || tileAt(x, y) !== 'S') return;
    put('bench_' + tag + '_' + Math.round(x), 'community_bench', x, y, { rot: 0, fade_group: 'rqe_p10w_walk' });
    benches++;
  }
  /* 北侧人行道。楼的北缘大约在 y405–408，草地从 y412 起。树种在中间这条铺装上。 */
  for (let x = 1402; x <= 1502; x += 16) if (tryTree('lo', x, 409)) tryLamp('lo', x + 8, 409);
  for (let x = 1556; x <= 1670; x += 16) if (tryTree('ea', x, 409)) tryLamp('ea', x + 8, 409);
  for (let x = 1222; x <= 1290; x += 16) if (tryTree('up', x, 423)) tryLamp('up', x + 8, 423);
  tryBench('lo', 1428, 410.2);
  tryBench('lo', 1476, 410.2);
  tryBench('ea', 1588, 410.2);
  tryBench('ea', 1644, 410.2);
  tryBench('up', 1248, 424.2);
  if (trees < 12 || bands.lo < 4 || bands.ea < 4 || lamps < 6) throw new Error('site153 walk ' + trees + ' ' + bands.lo + ' ' + bands.ea + ' ' + bands.up + ' ' + lamps);

  for (const [id, list] of Object.entries(bags)) {
    if (!CH[id]) throw new Error('site153 missing chunk ' + id);
    const next = (CH[id].objects || []).concat(list);
    if (next.length > 2600) throw new Error('site153 chunk cap ' + id + ' ' + next.length);
    CH[id].objects = next;
  }
  const wet = [];
  for (const list of Object.values(bags)) {
    for (const o of list) for (const w of N.water || []) {
      if (w && o.x > w[0] && o.x < w[2] && o.y > w[1] && o.y < w[3]) wet.push(o.id);
    }
  }
  if (wet.length) throw new Error('site153 water ' + wet.join(','));
  if (tileAt(1200, 400) !== 'K') throw new Error('site153 concrete ' + tileAt(1200, 400));
  if (tileAt(1328, 422) !== 'G' || tileAt(1460, 418) !== 'G' || tileAt(600, 370) !== 'G') throw new Error('site153 grass');

  const counts = {};
  for (const [id, n] of Object.entries(added)) counts[id] = { added: n, total: CH[id].objects.length };
  P.site153 = {
    unconfirmed: true,
    choice: 'quality',
    mids: notes,
    walk: { trees, lamps, benches, bands, fronts: [[1384, 406, 1518, 412], [1536, 406, 1686, 412], [1208, 418, 1306, 428]] },
    counts,
    cap: 120,
  };
  P.reasons.site153 = '第二十四刀仍不做新区。北界 y432 以上是山，南边是海，东边是澜海。榕桥剩下的学校、河岸公园、庭院和渔村老街不动。月河石驳岸仍是一整面。西侧山体封口继续挡住 (400, 400) 和 (900, 400)，山径台地（600, 370）仍是草地。扫过街块之间的空档，剩下的是路、步行缝、公园和别墅院，没有一块能再放下几栋配套，所以这一刀不补楼，也不是 438 m。河东大道北侧和滨海南侧还有十六栋中层住宅，原先都是裙楼石材、上面整片同色玻璃：河东里、澜北居、澄石居、北岸里、银月里、澄月里、月栖、东岸居、栖岸居、澄东里、澜东居、澜月居、银杏里、岸西居、滨月居、海栖里。层数、平面和原来的玻璃还留着，塔身改成竖墩、石腰、奇数层跳色、边框、重冠、错缝、三开间竖墩、偶数层暖玻、四层一腰、中槽、边槽、上段暖玻、棋盘、三开间石墩、三层一腰或西侧石脊，十六套互不相同。下台北人行道（y409，x1402–1502）、山麓台地北人行道（x1556–1670）和上台北人行道（y423，x1222–1290）原先几乎没有树，补了银杏、樟和樱，灯和长椅让开楼、路和草地。不进月河，不进澜海，不进山。不把南埠往 y-1540 以南推。名字和尺寸未经确认。';
  root.SITE153 = P.site153;
})();
