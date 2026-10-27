/* Site148：月河口把渔港路和老街路之间还空着的一横条补上。
 * 渔村老街以东，从石澜路东侧一直到滨海路西侧。东缘是港东槽楼和港东幼儿园。
 * 山前小学操场、山前社区公园、山径、堤岸公园、河口广场、渔村老街、澜海、南汊和月河水面不动。
 * 榕桥区剩下的是学校、河岸公园、小区庭院和路面，没有大块可盖的空地。
 * 新楼并进已有分块，不新开分块。不做 438 m 塔，南埠不往南。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10p || D.rongqiaoExpandP10q || !N.expansionP10 || !root.hedongRoofTower) return;
  D.rongqiaoExpandP10q = 1;
  const P = N.expansionP10;
  const blocked = [];
  function addBlock(rect) { if (rect && rect.length >= 4) blocked.push(rect); }
  function collect(list) {
    for (const b of list || []) {
      const parts = b.parts && b.parts.length ? b.parts : (b.x0 != null ? [[b.x0, b.y0, b.x0 + b.W, b.y0 + (b.D || 0)]] : []);
      for (const p of parts) addBlock(p);
    }
  }
  function take(node) {
    if (!node) return;
    if (Array.isArray(node)) collect(node);
    else if (node.buildings) collect(node.buildings);
  }
  for (const k of Object.keys(P)) take(P[k]);
  take(P.buildings); take(P.amenities); take(P.life); take(P.fill);
  for (const c of D.colliders || []) if (c && c.rect) addBlock(c.rect);
  for (const s of N.solids || []) addBlock(s);
  for (const w of N.water || []) addBlock(w);
  for (const k of P.keepLots || []) addBlock(k);
  /* 老街、内港、月河口、南汊、海面、山前学校和公园。这些不是可盖的空地。 */
  const RESERVED = [
    [376, -214, 560, -112],
    [1040, -186, 1248, -168],
    [356, -220, 404, -196],
    [1396, -190, 1428, -170],
    [696, -190, 722, -174],
    [356, -112, 1750, -80],
    [1704, -260, 1810, 432],
    [486, 264, 594, 348],
    [1104, 264, 1288, 348],
    [356, 192, 1750, 238],
    [356, 356, 1750, 390],
    [242, 142, 300, 300],
  ];
  for (const r of RESERVED) addBlock(r);

  function blocker(rect, pad) {
    const a0 = rect[0] - pad, a1 = rect[1] - pad, a2 = rect[2] + pad, a3 = rect[3] + pad;
    for (let i = 0; i < blocked.length; i++) {
      const b = blocked[i];
      if (a0 < b[2] && b[0] < a2 && a1 < b[3] && b[1] < a3) return b;
    }
    return null;
  }

  const G = D.ground;
  function paint(rect, tile) {
    const [ox, oy] = G.origin, ch = G.chunk;
    const c0 = Math.max(0, Math.floor((rect[0] - ox) / ch)), c1 = Math.min(G.cols, Math.ceil((rect[2] - ox) / ch));
    const r0 = Math.max(0, Math.floor((rect[1] - oy) / ch)), r1 = Math.min(G.rows, Math.ceil((rect[3] - oy) / ch));
    for (let r = r0; r < r1; r++) {
      const a = G.data_south_to_north[r].split('');
      for (let c = c0; c < c1; c++) {
        const x = ox + (c + 0.5) * ch, y = oy + (r + 0.5) * ch;
        if (x >= rect[0] && x < rect[2] && y >= rect[1] && y < rect[3]) a[c] = tile;
      }
      G.data_south_to_north[r] = a.join('');
    }
  }

  /* 渔港这一横条落在已经拆开的南块上。 */
  const BINS = [
    ['rqe_p10_e12_w', -280, -40],
    ['rqe_p10_e11_w', -140, 100],
    ['rqe_p10_e10_w', 180, 460],
  ];
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
    for (const [pre, y0, y1] of BINS) {
      if (y < y0 || y >= y1) continue;
      const id = pre + (Math.floor(x / 160) * 160);
      if (CH[id]) return id;
    }
    throw new Error('site148 no chunk ' + x + ',' + y);
  }
  const bags = {};
  const added = {};
  const CAP = 2480;
  function room(id, n) {
    const have = (CH[id] && CH[id].objects ? CH[id].objects.length : 0) + (added[id] || 0);
    return have + n <= CAP;
  }
  function put(id, type, x, y, more) {
    const o = Object.assign({ id: 'rqp10r_' + id, type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    const key = pickChunk(o.x, o.y);
    (bags[key] || (bags[key] = [])).push(o);
    added[key] = (added[key] || 0) + 1;
    return o;
  }
  function faceOf(spec, f, F, side, b) {
    const sign = (spec.signs || []).find((s) => s.face === side && s.floor === f && s.bay === b);
    if (sign) return { variant: 'hd_g_sign', hdGlass: 1, sign: sign.text, forceGround: 1 };
    const st = spec.st || {};
    if (f <= (st.podium || 1)) return { variant: 'hd_stone' };
    if (st.crownStone && f > F - st.crownStone) return { variant: 'hd_stone' };
    if (st.beltEvery && f > (st.podium || 1) && f % st.beltEvery === 0) return { variant: 'hd_stone' };
    return { variant: spec.glass || 'hd_g_hd', hdGlass: 1 };
  }
  function bayPlan(spec, f, F, x) {
    const m = spec.mass, st = spec.st || {};
    const podium = st.podium || 3;
    const setback = st.setbackTop || 0;
    if (f <= podium) return { nS: m.podiumNS, xS: x, nW: m.podiumNW, xW: x };
    if (setback && f > F - setback) {
      const cOff = (m.towerOff || 0) + Math.floor((m.towerNS - m.crownNS) / 2);
      return { nS: m.crownNS, xS: x + cOff * 3, nW: m.crownNW, xW: x + cOff * 3 };
    }
    if (m.midFromTop && f > F - m.midFromTop) {
      const mOff = (m.towerOff || 0) + Math.floor((m.towerNS - m.midNS) / 2);
      return { nS: m.midNS, xS: x + mOff * 3, nW: m.midNW, xW: x + mOff * 3 };
    }
    return { nS: m.towerNS, xS: x + (m.towerOff || 0) * 3, nW: m.towerNW, xW: x + (m.towerOff || 0) * 3 };
  }
  function estimate(spec) {
    const m = spec.mass;
    let n = 12;
    for (let f = 1; f <= m.F; f++) {
      const plan = bayPlan(spec, f, m.F, spec.x);
      n += plan.nS + plan.nW;
    }
    n += m.podiumNS * m.podiumNW * 2;
    return n;
  }
  const built = [];
  const solids = [], colliders = [];
  const skipped = [];
  const used = new Set();
  function block(id, rect) { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); addBlock(rect); }
  function remember(spec, parts) {
    const m = spec.mass, fg = 'rqe_p10r_' + spec.id;
    for (const r of parts) block(fg + '_' + r[0] + '_' + r[1], r);
    const rec = {
      id: fg, name: spec.name, x0: spec.x, y0: spec.y, W: m.podiumNS * 3, D: m.podiumNW * 3, F: m.F, floors: m.F,
      kind: spec.kind || 'home', form: spec.form || '', family: spec.family || '', glass: spec.glass || '',
      plate: spec.plate || (m.towerNS + 'x' + m.towerNW),
      parts: parts.map((r) => r.slice()), unconfirmed: true,
    };
    built.push(rec);
    used.add([rec.form, rec.F, rec.plate, rec.glass].join('|'));
    return rec;
  }
  function buildMass(spec, soft) {
    const m = spec.mass, F = m.F, x = spec.x, y = spec.y;
    const foot = [x, y, x + m.podiumNS * 3, y + m.podiumNW * 3];
    const clash = blocker(foot, 0.9);
    if (clash) {
      if (soft) { skipped.push(spec.id); return false; }
      throw new Error('site148 footprint ' + spec.id + ' ' + foot.join(',') + ' vs ' + clash.join(','));
    }
    const sig = [spec.form || '', F, spec.plate || '', spec.glass || ''].join('|');
    if (used.has(sig)) {
      if (soft) { skipped.push(spec.id + ' sig'); return false; }
      throw new Error('site148 clone ' + sig);
    }
    const key = pickChunk(x + 1, y + 1);
    const need = estimate(spec);
    if (!room(key, need)) { skipped.push(spec.id + '@' + key); return false; }
    const fg = 'rqe_p10r_' + spec.id;
    for (let f = 1; f <= F; f++) {
      const z = (f - 1) * 3;
      const plan = bayPlan(spec, f, F, x);
      for (let b = 0; b < plan.nS; b++) {
        const face = faceOf(spec, f, F, 'S', b);
        const more = { z, state: face.forceGround || f === 1 ? 'ground' : 'upper', fade_group: fg, variant: face.variant };
        if (face.hdGlass) more.hdGlass = 1;
        if (face.sign) more.sign = face.sign;
        if (more.hdGlass && more.state === 'upper') more.night_lit = (f + b) % 4 !== 0 ? 1 : 0;
        put(spec.id + '_S' + f + '_' + b, 'f_wall', plan.xS + b * 3, y, more);
      }
      for (let b = 0; b < plan.nW; b++) {
        const face = faceOf(spec, f, F, 'W', b);
        const more = { z, rot: 6, state: face.forceGround || f === 1 ? 'ground' : 'upper', fade_group: fg, variant: face.variant };
        if (face.hdGlass) more.hdGlass = 1;
        if (face.sign) more.sign = face.sign;
        if (more.hdGlass && more.state === 'upper') more.night_lit = (f * 3 + b) % 4 !== 0 ? 1 : 0;
        put(spec.id + '_W' + f + '_' + b, 'f_wall', plan.xW, y + 3 + b * 3, more);
      }
    }
    root.hedongRoofTower(put, spec, m, spec.st, x, y, fg);
    remember(spec, [foot]);
    return true;
  }
  function box(s, soft) {
    return buildMass({
      id: s.id, name: s.name, x: s.x, y: s.y, kind: s.kind, glass: s.glass, family: s.family || '', signs: s.signs,
      form: s.form || (s.nS + 'x' + s.nW), plate: s.plate || (s.nS + 'x' + s.nW),
      st: { podium: 1, setbackTop: 0, crownStone: s.F > 1 ? 1 : 0, beltEvery: 0 },
      mass: {
        F: s.F, podiumNS: s.nS, podiumNW: s.nW, towerNS: s.nS, towerNW: s.nW, towerOff: 0,
        midFromTop: 0, midNS: s.nS, midNW: s.nW, crownNS: s.nS, crownNW: s.nW,
      },
    }, soft);
  }

  const Y = -175;
  /* 渔南错缝 18 层。裙楼 7×3，塔身 5×2 贴西，中段收一档，冠是方一点的窄条。暖金，约 54 m。
   * 港东槽楼 13 层。裙楼 8×3，塔身 4×2 贴东，腰上再收，冠是扁条。青灰，约 39 m。
   * 层数、平面、材料和剪影都不跟已有塔相同，也不是 438 m。两栋都只有 9 m 进深，让出渔港路和老街路。 */
  buildMass({
    id: 'seam', name: '渔南错缝', x: 640, y: Y, kind: 'work', glass: 'hd_g_yl', form: '错缝', family: '暖金错缝', plate: '5x2',
    signs: [{ face: 'S', floor: 1, bay: 2, text: '渔南错缝' }],
    st: { podium: 3, setbackTop: 4, crownStone: 2, beltEvery: 6 },
    mass: { F: 18, podiumNS: 7, podiumNW: 3, towerNS: 5, towerNW: 2, towerOff: 0, midFromTop: 8, midNS: 4, midNW: 2, crownNS: 2, crownNW: 2 },
  });
  buildMass({
    id: 'slot', name: '港东槽楼', x: 1608, y: Y, kind: 'work', glass: 'hd_g_yx', form: '槽板', family: '青灰槽板', plate: '4x2',
    signs: [{ face: 'S', floor: 1, bay: 3, text: '港东槽楼' }],
    st: { podium: 2, setbackTop: 3, crownStone: 1, beltEvery: 0 },
    mass: { F: 13, podiumNS: 8, podiumNW: 3, towerNS: 4, towerNW: 2, towerOff: 4, midFromTop: 6, midNS: 3, midNW: 2, crownNS: 2, crownNW: 1 },
  });
  box({ id: 'sk', name: '港东社康', x: 900, y: Y, nS: 5, nW: 3, F: 3, glass: 'hd_g_wm', kind: 'clinic', family: '冷青社康', signs: [{ face: 'S', floor: 2, bay: 1, text: '港东社康' }] });
  box({ id: 'mk', name: '港东菜场', x: 1302, y: Y, nS: 6, nW: 3, F: 2, glass: 'hd_g_dl', kind: 'market', family: '暖石菜场', form: '菜场棚', signs: [{ face: 'S', floor: 1, bay: 2, text: '港东菜场' }] });
  box({ id: 'kg', name: '港东幼儿园', x: 1552, y: Y, nS: 5, nW: 3, F: 2, glass: 'hd_g_yl2', kind: 'school', family: '米黄幼园', signs: [{ face: 'S', floor: 1, bay: 1, text: '港东幼儿园' }] });

  const GROVE = [1444, -173, 1456, -167];
  box({ id: 'gp', name: '港东亭', x: 1436, y: Y, nS: 2, nW: 2, F: 1, glass: 'hd_g_hd', kind: 'park', family: '亭', form: '亭', plate: '2x2', signs: [{ face: 'S', floor: 1, bay: 0, text: '港东亭' }] });
  addBlock(GROVE);
  paint(GROVE, 'G');
  function tree(id, x, y, variant) { put(id, 'rq_x_tree', x, y, { variant, fade_group: 'rqe_p10r_tree' }); }
  tree('tr1', 1448, -171, 'ginkgo');
  tree('tr2', 1452, -169.5, 'sakura');
  put('bench1', 'community_bench', 1450, -170.2, { rot: 0, fade_group: 'rqe_p10r_tree' });

  const GLASS = ['hd_g_yh', 'hd_g_wm', 'hd_g_dl', 'hd_g_yl2', 'hd_g_hd', 'hd_g_cj', 'hd_g_yx', 'hd_g_qp', 'hd_g_yl', 'hd_g_ls', 'hd_g_sl'];
  const FS = [4, 6, 3, 5, 3, 4, 5];
  let seq = 0;
  function fillRange(x0, x1, homes, shops, family) {
    let x = x0, guard = 0;
    while (x + 12 <= x1 && guard++ < 80) {
      const nS = 4 + (seq % 4);
      const w = nS * 3;
      if (x + w > x1) break;
      const rect = [x, Y, x + w, Y + 9];
      const hit = blocker(rect, 0.9);
      if (hit) { x = Math.max(x + 3, hit[2] + 6); continue; }
      const shop = seq % 5 === 0;
      let placed = false;
      for (let k = 0; k < 24 && !placed; k++) {
        const F = shop ? 2 : FS[(seq + k) % FS.length];
        const glass = GLASS[(seq * 3 + k) % GLASS.length];
        const form = nS + 'x3';
        const sig = [form, F, form, glass].join('|');
        if (used.has(sig)) continue;
        const name = shop ? shops[seq % shops.length] : homes[seq % homes.length];
        placed = box({
          id: 'h' + seq, name, x, y: Y, nS, nW: 3, F, glass,
          kind: shop ? 'shop' : 'home', family: shop ? '沿街铺' : family, form,
          signs: [{ face: 'S', floor: 1, bay: 0, text: name }],
        }, true);
        if (!placed) break;
      }
      if (placed) seq++;
      x += w + (placed ? 6 : 3);
    }
  }
  const HOMES = ['港东里', '渔南居', '槽板里', '错缝里', '岸东里', '口东居'];
  const SHOPS = ['港东面馆', '渔南文具', '槽板花店', '错缝茶铺', '岸东菜店', '口东渔具'];
  /* 渔港路北侧、老街路南侧已有两排楼之间的空档。不进内港、月河口和老街。 */
  fillRange(622, 842, HOMES, SHOPS, '港东住宅');
  fillRange(877, 1010, HOMES, SHOPS, '港东住宅');
  fillRange(1252, 1355, HOMES, SHOPS, '港东住宅');
  fillRange(1429, 1505, HOMES, SHOPS, '港东住宅');
  fillRange(1540, 1672, HOMES, SHOPS, '东缘住宅');

  const feet = built.flatMap((b) => b.parts);
  const hit = (o, rect, pad) => o.x > rect[0] - pad && o.x < rect[2] + pad && o.y > rect[1] - pad && o.y < rect[3] + pad;
  const propHit = (o) => {
    if (!o) return false;
    const pad = o.type === 'rq_x_tree' ? 2.2 : (o.type === 'p_lamp' || o.type === 'p_hedge' || o.type === 'community_bench' ? 0.6 : 0);
    if (!pad) return false;
    return feet.some((f) => hit(o, f, pad));
  };
  function scrub(arr) {
    if (!arr) return [];
    const out = [];
    for (const o of arr) if (!propHit(o)) out.push(o);
    return out;
  }
  for (const ch of Object.values(CH)) if (ch && ch.objects) ch.objects = scrub(ch.objects);
  for (const [id, list] of Object.entries(bags)) {
    if (!CH[id]) throw new Error('site148 missing chunk ' + id);
    const next = (CH[id].objects || []).concat(list);
    if (next.length > 2600) throw new Error('site148 chunk cap ' + id + ' ' + next.length);
    CH[id].objects = next;
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);

  function overlaps(a, b) {
    return a[0] < b[2] - 0.05 && b[0] < a[2] - 0.05 && a[1] < b[3] - 0.05 && b[1] < a[3] - 0.05;
  }
  const cols = (D.colliders || []).filter((c) => c && c.rect);
  const bad = [];
  for (let i = 0; i < colliders.length; i++) {
    for (let j = 0; j < cols.length; j++) {
      if (cols[j] === colliders[i]) continue;
      if (overlaps(colliders[i].rect, cols[j].rect)) bad.push(colliders[i].id + ' ~ ' + (cols[j].id || j));
    }
  }
  if (bad.length) throw new Error('site148 overlap ' + bad.slice(0, 6).join(' | '));
  const wet = [];
  for (const c of colliders) {
    for (const w of N.water || []) if (w && overlaps(c.rect, w)) wet.push(c.id);
  }
  if (wet.length) throw new Error('site148 water ' + wet.join(','));

  const towers = built.filter((b) => (b.kind === 'work' || b.kind === 'hotel') && b.F >= 12);
  const counts = {};
  for (const [id, n] of Object.entries(added)) counts[id] = { added: n, total: CH[id].objects.length };
  P.site148 = {
    unconfirmed: true,
    buildings: built,
    towers,
    parks: [GROVE.slice()],
    skipped,
    counts,
    cap: 120,
  };
  P.keepLots = (P.keepLots || []).concat([GROVE.slice()]);
  P.reasons.site148 = '第十九刀补的是渔港路和老街路之间、渔村老街以东还空着的一横条，靠近月河口，东边接到滨海路。北面朝山的山前小学操场、山前社区公园和山径，堤岸公园、河口广场、澜海、南汊和月河水面都不铺楼。榕桥区扫下来，剩下的空地是学校、河岸公园、小区庭院和路面，没有大块可盖的空地。港东槽楼是 13 层槽板（青灰，裙楼 8×3，塔身 4×2 贴东，约 39 m），在 (1608, -175)。渔南错缝是 18 层错缝（暖金，裙楼 7×3，塔身 5×2 贴西，约 54 m），在 (640, -175)。两栋的层数、平面、材料和剪影都不跟已有塔楼相同，也不是 438 m。东缘有港东幼儿园，中段有港东社康和港东菜场，沿条是住宅和铺面，港东亭是一小块绿地。不推山体封口（北界仍是 y378），也不把南埠往 y-1540 以南推。新楼并进已有分块。名字和尺寸未经确认。';
  N.mapLabels = (N.mapLabels || []).concat([
    { name: '港东社康', rect: [900, -175, 915, -166], kind: 'campus', prio: 1 },
    { name: '港东菜场', rect: [1302, -175, 1320, -166], kind: 'market', prio: 1 },
    { name: '港东幼儿园', rect: [1552, -175, 1567, -166], kind: 'campus', prio: 1 },
    { name: '港东亭', rect: GROVE.slice(), kind: 'park', prio: 1 },
  ]);
  N.mapPois = (N.mapPois || []).concat([
    { id: 'p10_seam', name: '渔南错缝', x: 650, y: -179, desc: '18 层错缝办公楼。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_slot', name: '港东槽楼', x: 1620, y: -179, desc: '13 层槽板办公楼。只是外观。名字和层数未经确认', cat: 'work' },
    { id: 'p10_sk21', name: '港东社康', x: 906, y: -179, desc: '3 层社康外壳。没有室内。名字未经确认', cat: 'life' },
    { id: 'p10_mk21', name: '港东菜场', x: 1310, y: -179, desc: '2 层菜场外壳。没有室内。名字未经确认', cat: 'shop' },
    { id: 'p10_kg21', name: '港东幼儿园', x: 1558, y: -179, desc: '2 层幼儿园外壳。没有室内。名字未经确认', cat: 'school' },
  ]);
  root.SITE148 = P.site148;
})();
