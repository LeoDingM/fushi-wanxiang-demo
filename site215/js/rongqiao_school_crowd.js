/* E4c 上下学人流 (2026-10-18): on school days parents walk 榕桥第一小学 pupils from the E1 blocks along 槐东侧路 and 榕校路 to the
 * south gate (07:15-07:55) and fetch them at 16:30; 榕桥中学 students walk to the west gate (07:20-07:50) and home after 17:20; some
 * stop at the 早餐包点 by each gate and queue (served one after another). Presentation only: every walker's position is a pure
 * function of the clock (authored routes from a real building door, walking speed as the market people, queue order from arrival),
 * so there is no save field and old saves load unchanged; nobody appears from nothing — a walk starts at a home door, a child
 * enters / leaves only through the school gate. Near the schools (player within ~75 m, E4 chunk loaded) walkers are visible actors
 * that chase their scheduled point with collision (never jumping); away from it nothing is drawn and the schedule runs on.
 * riverfix (2026-10-18): the schools moved south of 榕校路 by DY -142 — pupils go down the west pavement of the new 榕校路南段
 * (x 233.2) to the 校前巷 pavement (y -1.5) and the primary gate; teens cross 榕校路 and walk down the east pavement (x 241.1) to the
 * 中学 west gate (y 100.8), the breakfast line now north of that gate (mirrored about it, the walkers come from the north).
 * Counts, times, routes and the queue rule 未经Leo确认. */
(function (root) {
  'use strict';
  const SP = root.SP, W = SP && SP.world, C = SP && SP.clock;
  const SPEED = 1.2, SERVICE = 1.0, SLOT = 0.75, NEAR = [262, 66, 85], CHUNK = 'rqe_e4_sch';
  // homes: E1 blocks east of 槐东侧路, door on the south face -> the 槐东侧路 east pavement (x 193.6)
  const HOMES = [
    { id: 'hd3', door: [202.5, 125.2], out: [[202.5, 124.4], [193.6, 124.4]] },
    { id: 'hd2', door: [202.5, 103.3], out: [[202.5, 102.4], [193.6, 102.4]] },
    { id: 'hd1', door: [202.5, 81.3], out: [[202.5, 80.4], [193.6, 80.4]] },
    { id: 'hd0', door: [202.5, 59.3], out: [[202.5, 58.6], [202.5, 56.4], [193.6, 56.4]] },
  ];
  const ROAD_Y = 140.5;                                     // 榕校路 school-side pavement
  const DY = -142, RY2 = ROAD_Y + DY, XC = 233.2;              // riverfix: 校前巷 school-side pavement, 榕校路南段 west pavement column
  const P_GATE = [278.4, 141.5 + DY], M_GATE = [241.1, 100.8];   // just outside each gate
  const P_Q = { head: [290.9, 141.1 + DY], dir: [-1, 0], entry: [284.5, RY2] };    // 早餐包点 by the primary gate, queue runs west
  const M_Q = { head: [241.1, 117.1], dir: [0, 1], entry: [241.1, 122.6] };     // 早餐包点 north of the middle-school gate, queue runs north
  const M_IN = 123.1, M_OUT = 115.0;                                            // column point above the queue / below its head
  const toRoad = (h) => [h.door].concat(h.out, [[193.6, ROAD_Y]]);
  const SW = 1.6;                                              // riverfix: pupils walk south down the 193.6 path, then east past the old road end to 榕校路南段
  const toLane = (h) => [h.door].concat(h.out, [[194, h.out[h.out.length - 1][1]], [194, SW], [XC, SW], [XC, RY2]]);
  const pRoute = (h) => toLane(h).concat([[276.9, RY2]]);
  const mRoute = (h) => toRoad(h).concat([[241.1, ROAD_Y]]);
  const len = (p) => { let l = 0; for (let i = 1; i < p.length; i++) l += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return l; };
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  const NAMES_P = ['小乐', '朵朵', '浩浩', '欣欣', '子轩', '一诺', '安安', '小雨', '俊熙', '可可', '思彤', '宇航', '乐乐', '梓涵'], NAMES_M = ['陈同学', '林同学', '黄同学', '李同学', '吴同学', '郑同学', '何同学', '罗同学', '周同学', '许同学'];
  /* legs: {t0, t1, pts} walk (pts polyline at SPEED) or {t0, t1, at} wait. A walker exists from its first leg to its last. */
  function walkLeg(t0, pts) { return { t0, t1: t0 + len(pts) / SPEED, pts }; }
  function posAt(legs, t) {
    if (!legs.length || t < legs[0].t0 || t > legs[legs.length - 1].t1) return null;
    for (const g of legs) { if (t > g.t1) continue; if (g.at) return { x: g.at[0], y: g.at[1], moving: false };
      let d = g.t1 > g.t0 ? (t - g.t0) / (g.t1 - g.t0) * len(g.pts) : len(g.pts); for (let i = 1; i < g.pts.length; i++) { const a = g.pts[i - 1], b = g.pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (d <= l || i === g.pts.length - 1) { const k = l ? Math.min(1, d / l) : 1; return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, moving: k < 1, dx: b[0] - a[0], dy: b[1] - a[1] }; } d -= l; } }
    const g = legs[legs.length - 1], p = g.at || g.pts[g.pts.length - 1]; return { x: p[0], y: p[1], moving: false };
  }
  const slotPt = (Q, k) => [+(Q.head[0] + Q.dir[0] * SLOT * k).toFixed(3), +(Q.head[1] + Q.dir[1] * SLOT * k).toFixed(3)];
  /* queue: people reach the entry at a_i; service in arrival order; until served, a person stands at slot = how many ahead are still queued */
  function queue(Q, list, svc = SERVICE) {
    list.sort((a, b) => a.a - b.a || (a.id < b.id ? -1 : 1)); let done = -1e9;
    for (let i = 0; i < list.length; i++) { const q = list[i]; let t = q.a, k = 0; for (let j = 0; j < i; j++) if (list[j].done > t) k++;
      const legs = [], put = (k2, at) => { const to = slotPt(Q, k2), from = legs.length ? (legs[legs.length - 1].at || legs[legs.length - 1].pts.slice(-1)[0]) : Q.entry; const w = walkLeg(at, [from, to]); legs.push(w); return w.t1; };
      t = put(k, t); const s = Math.max(t, done);
      for (let j = 0; j < i; j++) { const dj = list[j].done; if (dj > q.a && dj <= s && k > 0) { const at = Math.max(t, dj); legs.push({ t0: t, t1: at, at: slotPt(Q, k) }); k--; t = put(k, at); } }
      while (k > 0) { legs.push({ t0: t, t1: t, at: slotPt(Q, k) }); k--; t = put(k, t); }
      const s2 = Math.max(t, done); legs.push({ t0: t, t1: s2 + svc, at: slotPt(Q, 0) }); q.done = done = s2 + svc; q.legs = legs; }
    return list;
  }
  function schoolDay(day) { const R = SP && SP.game && SP.game.rules; if (!R || !R.date) return day % 7 < 5; const d = R.date(day * 1440 + 600); return !!d.makeup || !(d.weekend || d.holiday); }
  /* spreading (E4c2): every walker keeps its own lane on the pavement (lateral offset), a parent walks beside the child on the
   * road side, children step into the gate at their own spot across the gate width, parents say goodbye a step short of the gate
   * and wait for pick-up at their own spot along the pavement; a guard comes out of each gate for the rush */
  const GATE_HALF = 0.9, LANE = 0.3, BESIDE = 0.55;
  // the school-side pavement is y 140..142 (fence at 142.5): lanes map into 140.08..140.8 (lamp posts at y 141) so nobody walks on the carriageway
  const yOf = (d) => +(ROAD_Y + 0.15 + d * 0.5).toFixed(3), yP = (d) => +(yOf(d) + DY).toFixed(3);
  const laneOf = (id) => (hash(id + ':lane') - 0.5) * 2 * LANE;
  function shift(pts, d) { return pts.map((p) => [p[0] === 193.6 ? +(p[0] - d).toFixed(3) : p[0] === XC ? +(p[0] - d * 0.8).toFixed(3) : p[0] === 241.1 && p[1] > M_Q.entry[1] ? +(p[0] + d).toFixed(3) : p[0], p[1] === ROAD_Y ? yOf(d) : p[1] === RY2 ? yP(d) : p[1] === SW ? +(SW + d * 0.5).toFixed(3) : p[1]]); }
  // the primary gate opens in the east-west fence (spread along x), the middle-school gate in the north-south fence (spread along y)
  const alongY = (g) => g === M_GATE || (g[0] === M_GATE[0] && g[1] === M_GATE[1]);
  const atGate = (p, g) => alongY(g) ? Math.abs(p.x - g[0]) < 0.05 && Math.abs(p.y - g[1]) <= GATE_HALF + 1e-6 : Math.abs(p.x - g[0]) <= GATE_HALF + 1e-6 && Math.abs(p.y - g[1]) < 0.05;
  const gateSpot = (g, id) => { const j = +((hash(id + ':gate') - 0.5) * 2 * GATE_HALF).toFixed(3); return alongY(g) ? [g[0], +(g[1] + j).toFixed(3)] : [+(g[0] + j).toFixed(3), g[1]]; };
  const end = (legs) => { const g = legs[legs.length - 1]; return g.at || g.pts[g.pts.length - 1]; };
  // morning line at the primary gate along the fence side of the pavement: the guard waves pupils in one by one (15 s each)
  const G_Q = { head: P_GATE, dir: [-1, 0], entry: [271.9, 141.0 + DY] }, G_SVC = 0.25;
  const P_POST = [280.8, 141.9 + DY], M_POST = [239.9, 99.0];
  const GRAND = ['奶奶', '爷爷', '外婆', '外公'], PARENT = ['妈妈', '爸爸'];
  /* the day plan: pure in (day); memoised */
  const memo = new Map();
  function plan(day) {
    if (memo.has(day)) return memo.get(day); const out = [];
    if (!schoolDay(day)) { memo.set(day, out); return out; }
    const base = day * 1440, pq = [], mq = [], gq = [];
    NAMES_P.forEach((name, i) => { const h = HOMES[i % HOMES.length], id = 'rqk_' + i, pid = 'rqp_' + i, o = laneOf(id), op = o - BESIDE, arrive = 435 + Math.floor(hash(id + day) * 38), bf = hash(id + ':b:' + day) < 0.4;
      const who = hash(pid + ':who') < 0.35 ? GRAND[Math.floor(hash(pid + ':g') * 4)] : PARENT[Math.floor(hash(pid + ':g') * 2)], pname = name + who, gs = gateSpot(P_GATE, id + day), bye = [+(268.9 + hash(pid + ':bye' + day) * 9).toFixed(3), yP(op)];
      const going = bf ? shift(pRoute(h), o).concat([[P_Q.entry[0], RY2]]) : shift(toLane(h), o).concat([G_Q.entry]), goingP = (bf ? shift(pRoute(h), op) : shift(toLane(h), op)).concat(bf ? [[+(P_Q.entry[0] - 0.8 - hash(pid + ':wait' + day) * 2.4).toFixed(3), yP(op)]] : [bye]);   // waits a few steps short of the shop while the child queues
      const t0 = base + arrive - len(going) / SPEED - (bf ? 4 : 0);
      out.push({ id, kind: 'pupil', name, home: h.id, legs: [walkLeg(t0, going)], bf, gs });
      out.push({ id: pid, kind: 'parent', who, name: pname, home: h.id, legs: [walkLeg(t0, goingP)], bf, bye });
      if (bf) pq.push({ id, a: t0 + len(going) / SPEED }); else gq.push({ id, a: t0 + len(going) / SPEED });
      // afternoon: the parent waits at an own spot on the pavement; the child comes out of the gate, walks over, both go home
      const out1 = base + 990 + Math.floor(hash(id + ':o:' + day) * 12), gs2 = gateSpot(P_GATE, id + ':pm' + day);
      const spot = [+(263 + hash(pid + ':spot' + day) * 14.4).toFixed(3), yP(op)], meet = [spot[0], yP(o)];
      const toMeet = walkLeg(out1 + 0.5, [gs2, [gs2[0], yP(o)], meet]), tm = toMeet.t1;
      out.push({ id: id + '_pm', kind: 'pupil', name, home: h.id, legs: [{ t0: out1, t1: out1 + 0.5, at: gs2 }, toMeet, walkLeg(tm, [meet].concat(shift(pRoute(h), o).reverse()))] });
      const fetch = shift(pRoute(h), op).concat([spot]), pa = out1 - 3 - len(fetch) / SPEED;
      out.push({ id: pid + '_pm', kind: 'parent', who, name: pname, home: h.id, legs: [walkLeg(pa, fetch), { t0: pa + len(fetch) / SPEED, t1: tm, at: spot }, walkLeg(tm, [spot].concat(shift(pRoute(h), op).reverse()))] });
    });
    NAMES_M.forEach((name, i) => { const h = HOMES[(i + 1) % HOMES.length], id = 'rqm_' + i, o = laneOf(id), arrive = 440 + Math.floor(hash(id + day) * 30), bf = hash(id + ':b:' + day) < 0.5, gs = gateSpot(M_GATE, id + day);
      const going = shift(mRoute(h), o).concat(bf ? [M_Q.entry] : [[241.1, M_IN], gs]); const t0 = base + arrive - len(going) / SPEED - (bf ? 4 : 0);
      out.push({ id, kind: 'teen', name, home: h.id, legs: [walkLeg(t0, going)], bf, gs }); if (bf) mq.push({ id, a: t0 + len(going) / SPEED });
      const ob = base + 1040 + Math.floor(hash(id + ':o:' + day) * 15), gs2 = gateSpot(M_GATE, id + ':pm' + day), back = [gs2, [241.1, M_IN]].concat(shift(mRoute(h), o).reverse());
      out.push({ id: id + '_pm', kind: 'teen', name, home: h.id, legs: [{ t0: ob, t1: ob + 0.4, at: gs2 }, walkLeg(ob + 0.4, back)] });
    });
    // gate guards: come out of the gate before the rush, stand at the post, go back in after it
    for (const [gid, g, post, ranges] of [['rqg_p', P_GATE, P_POST, [[425, 488], [975, 1012]]], ['rqg_m', M_GATE, M_POST, [[430, 485], [1030, 1068]]]])
      ranges.forEach(([a0, a1], k) => { const w1 = walkLeg(base + a0, [g, post]), w3 = walkLeg(base + a1, [post, g]);
        out.push({ id: gid + (k ? '_pm' : ''), kind: 'guard', name: '门卫', legs: [w1, { t0: w1.t1, t1: base + a1, at: post }, w3] }); });
    // breakfast queues; after being served each buyer walks on to the gate (a pupil's parent walks beside the pupil, on the road side)
    const by = new Map(out.map((w) => [w.id, w]));
    for (const q of queue(P_Q, pq)) { const w = by.get(q.id), p = by.get(q.id.replace('rqk_', 'rqp_')); w.legs = w.legs.concat(q.legs); const t = q.done; const back = walkLeg(t, [slotPt(P_Q, 0), [P_Q.head[0], RY2], [G_Q.entry[0], RY2], G_Q.entry]); w.legs.push(back); gq.push({ id: q.id, a: back.t1 });
      const p0 = end(p.legs), pt = p.legs[p.legs.length - 1].t1, go = Math.max(t, pt); p.legs.push({ t0: pt, t1: go, at: p0 }); p.legs.push(walkLeg(go, [p0, p.bye])); }   // the carer waits aside while the child queues
    for (const q of queue(M_Q, mq)) { const w = by.get(q.id); w.legs = w.legs.concat(q.legs); w.legs.push(walkLeg(q.done, [slotPt(M_Q, 0), [241.1, M_OUT], w.gs])); }
    for (const q of queue(G_Q, gq, G_SVC)) { const w = by.get(q.id); w.legs = w.legs.concat(q.legs); w.gateA = q.a; }
    // the child joins the gate line; the parent waves a moment, then walks home to the door on its own lane
    for (const w of out) if (w.kind === 'parent' && !/_pm$/.test(w.id)) { const k = by.get(w.id.replace('rqp_', 'rqk_')), kEnd = k.legs[k.legs.length - 1].t1, last = w.legs[w.legs.length - 1], at = end(w.legs);
      const tEnd = Math.max(k.gateA != null ? k.gateA + 0.4 : kEnd, last.t1), op = laneOf(k.id) - BESIDE; w.legs.push({ t0: last.t1, t1: tEnd + 0.6, at }); w.legs.push(walkLeg(tEnd + 0.6, [at].concat(shift(pRoute(HOMES.find((h) => h.id === w.home)), op).reverse()))); }
    // keep each leg contiguous in time (a walk leg may start a hair after the previous ends: hold position)
    for (const w of out) { const L = []; for (const g of w.legs) { const prev = L[L.length - 1]; if (prev && g.t0 > prev.t1 + 1e-9) L.push({ t0: prev.t1, t1: g.t0, at: prev.at || prev.pts[prev.pts.length - 1] }); L.push(g); } w.legs = L; w.t0 = L[0].t0; w.t1 = L[L.length - 1].t1; }
    memo.set(day, out); if (memo.size > 6) memo.delete(memo.keys().next().value); return out;
  }
  function at(t) { const d = Math.floor(t / 1440), out = []; for (const day of [d - 1, d]) for (const w of plan(day)) { if (t < w.t0 || t > w.t1) continue; const p = posAt(w.legs, t); if (p) out.push(Object.assign({ id: w.id, kind: w.kind, who: w.who, name: w.name, home: w.home }, p)); } return out; }
  const api = { SPEED, SERVICE, SLOT, HOMES, P_GATE, M_GATE, P_Q, M_Q, G_Q, ROAD_Y, plan, at, posAt, queue, len, hash, schoolDay, routes: () => HOMES.flatMap((h) => [-LANE - BESIDE, -LANE, LANE].flatMap((d) => [shift(pRoute(h), d).concat([[P_GATE[0] + (d > 0 ? GATE_HALF : -GATE_HALF), yP(d)], [P_GATE[0] + (d > 0 ? GATE_HALF : -GATE_HALF), P_GATE[1]]]), shift(mRoute(h), d).concat([[241.1, M_IN], [M_GATE[0], M_GATE[1] + (d > 0 ? GATE_HALF : -GATE_HALF)]]), shift(pRoute(h), d).concat([[P_Q.entry[0], yP(d)], P_Q.head]), shift(mRoute(h), d).concat([M_Q.entry, M_Q.head])])).concat([[G_Q.entry, P_GATE], [[P_Q.head[0], RY2], [G_Q.entry[0], RY2], G_Q.entry], [[268.9, yP(-LANE - BESIDE)], [277.9, yP(-LANE - BESIDE)]], [P_GATE, P_POST], [M_GATE, M_POST], [[263, yP(-LANE - BESIDE)], [277.4, yP(-LANE - BESIDE)]]]), atGate, P_POST, M_POST, GATE_HALF, LANE, BESIDE };
  root.RongqiaoSchoolCrowd = api;
  if (!SP || !W || !C || !SP.game || SP.schoolCrowd) return;
  const G = SP.game, actors = new Map(); const now = () => C.abs();
  function near() { return SP.place && SP.place.where && SP.place.where() === 'street' && !W.interior && !SP.metroActive && !(SP.cbd && SP.cbd.active) && !!(W.chunksIn && W.chunksIn[CHUNK]) && !!SP.player && Math.hypot(SP.player.x - NEAR[0], SP.player.y - NEAR[1]) < NEAR[2]; }
  /* looks (E4c2). Pupils / teens: the student atlas (blue tracksuit, white stripe) re-tinted at runtime into uniform variants —
   * blue tracksuit or white top + blue trousers (深圳校服), backpack colour, a yellow safety cap on some pupils, and a smaller
   * scale for pupils (0.84 / 0.9; the repo has no child atlas yet, so this is a scaled student sheet — 未经Leo确认).
   * Adults: the native diversity adapter with adult profiles (parents 30-45, grandparents 58-72 with grey hair / perm / bun),
   * the guard in work clothes. All cosmetic; nothing is saved. */
  const BAGS = [[221, 87, 76], [240, 196, 52], [236, 120, 170], [70, 160, 90], [52, 64, 96], [90, 150, 230]];
  const uniKey = (w) => { const kid = w.kind === 'pupil', h = (k) => hash(w.id.replace(/_pm$/, '') + k);
    return ['rqu', h(':top') < 0.5 ? 'w' : 'b', Math.floor(h(':bag') * BAGS.length), kid && h(':cap') < 0.45 ? 'c' : 'n', kid ? (h(':sz') < 0.5 ? 84 : 90) : (h(':sz') < 0.5 ? 95 : 100)].join('_'); };
  function uniform(key) {
    const name = key, ACT = root.ACTORS, src = SP.img && SP.img.actor_student, D = ACT && ACT.student;
    if (!D) return null; if (SP.img['actor_' + name]) return name; if (!src || !src.width) { SP.ensureActor && SP.ensureActor('student'); return null; }
    try {
      const doc = root.document, [, top, bag, cap, sz] = key.split('_'), k = +sz / 100, W0 = src.width, H0 = src.height;
      const c0 = doc.createElement('canvas'); c0.width = W0; c0.height = H0; const g0 = c0.getContext('2d'); if (!g0 || !g0.getImageData) return null;
      g0.drawImage(src, 0, 0); const im = g0.getImageData(0, 0, W0, H0), px = im.data, B = BAGS[+bag] || BAGS[0];
      for (const f of Object.values(D.frames)) { const [fx, fy, fw, fh] = f;
        for (let y = fy; y < fy + fh; y++) { const ry = (y - fy) / fh; for (let x = fx; x < fx + fw; x++) { const i = (y * W0 + x) * 4; if (px[i + 3] < 100) continue; const r = px[i], gg = px[i + 1], bb = px[i + 2];
          if (r > 100 && r > gg * 1.6 && r > bb * 1.6) { const l = r / 221; px[i] = Math.min(255, B[0] * l); px[i + 1] = Math.min(255, B[1] * l); px[i + 2] = Math.min(255, B[2] * l); }       // backpack
          else if (top === 'w' && ry > 0.3 && ry < 0.56 && bb > 90 && bb > r * 1.4 && bb > gg * 1.1) { const l = Math.min(1.08, bb / 195); px[i] = 236 * l; px[i + 1] = 238 * l; px[i + 2] = Math.min(255, 242 * l); }   // white top
          else if (cap === 'c' && ry < 0.11 && Math.max(r, gg, bb) < 80) { const l = 0.75 + Math.max(r, gg, bb) / 160; px[i] = Math.min(255, 250 * l); px[i + 1] = Math.min(255, 204 * l); px[i + 2] = 40 * l; }   // yellow cap
        } } }
      g0.putImageData(im, 0, 0);
      const c1 = doc.createElement('canvas'); c1.width = Math.ceil(W0 * k); c1.height = Math.ceil(H0 * k); const g1 = c1.getContext('2d'); g1.imageSmoothingEnabled = false; g1.drawImage(c0, 0, 0, c1.width, c1.height);
      const frames = {}; for (const [fk, f] of Object.entries(D.frames)) frames[fk] = [Math.round(f[0] * k), Math.round(f[1] * k), Math.max(1, Math.round(f[2] * k)), Math.max(1, Math.round(f[3] * k)), f[4] * k, f[5] * k].concat(f.slice(6));
      ACT[name] = Object.assign({}, D, { img: '', frames, rqUniform: key }); (SP._actLoading || (SP._actLoading = {}))[name] = true; SP.img['actor_' + name] = c1; return name;
    } catch (e) { return null; }
  }
  function look(a, w) {
    if (w.kind === 'pupil' || w.kind === 'teen') { a.rqUni = uniKey(w); return; }
    if (!SP.npcDiversity || !SP.npcDiversity.adapt) return; const h = (k) => hash(w.id.replace(/_pm$/, '') + k), grand = w.who && GRAND.includes(w.who), guard = w.kind === 'guard';
    const female = guard ? false : w.who ? ['妈妈', '奶奶', '外婆'].includes(w.who) : h('g') < 0.5;
    const hair = guard ? 'buzz' : grand ? (female ? (h('h') < 0.5 ? 'perm' : 'bun') : 'grey') : undefined;
    const outfit = guard ? 'work' : grand ? ['casual', 'jacket', 'casual'][Math.floor(h('o') * 3)] : female ? ['casual', 'shirt', 'office_skirt', 'hoodie', 'jacket'][Math.floor(h('o') * 5)] : ['shirt', 'casual', 'jacket', 'hoodie', 'work'][Math.floor(h('o') * 5)];
    try { SP.npcDiversity.adapt(a, Object.assign({ ageYears: guard ? 52 : grand ? 58 + Math.floor(h('a') * 14) : 30 + Math.floor(h('a') * 15), heightCm: (female ? 152 : 163) + Math.floor(h('ht') * 18), gender: female ? 'female' : 'male', job: guard ? 'guard' : 'civilian', outfit }, hair ? { hair } : {})); } catch (e) { /* look is cosmetic */ }
  }
  function drop() { if (SP.actors && SP.actors.list) SP.actors.list = SP.actors.list.filter((a) => !actors.has(a.id) || actors.get(a.id) !== a); actors.clear(); }
  let lastT = null;
  function tick(dt) {
    if (!G.ps) return; const t = now(); if (!near()) { if (actors.size) drop(); lastT = t; return; }
    const want = at(t), ids = new Set(want.map((w) => w.id)), step = lastT === null ? 0 : Math.max(0, Math.min(5, t - lastT)); lastT = t;
    for (const [id, a] of actors) if (!ids.has(id)) { SP.actors.list = SP.actors.list.filter((b) => b !== a); actors.delete(id); }
    for (const w of want) { let a = actors.get(w.id);
      if (!a) { if (!SP.Actor) continue; const set = w.kind === 'parent' || w.kind === 'guard' ? (hash(w.id) < 0.5 ? 'office' : 'uncle') : 'student'; a = new SP.Actor({ id: w.id, set, name: w.name, x: w.x, y: w.y, speed: 1.1, radius: w.kind === 'pupil' ? 0.17 : 0.21, height: w.kind === 'pupil' ? 1.3 : 1.66, dir: 'S', schoolCrowd: w.kind }); if (SP.ensureActor) SP.ensureActor(set); look(a, w); actors.set(w.id, a); }
      if (!SP.actors.list.includes(a)) SP.actors.list.push(a);
      if (a.rqUni && a.set === 'student') { const u = uniform(a.rqUni); if (u) a.set = u; }
      else if (!a.rqUni && !a.diversity && ((a.rqLook = (a.rqLook || 0) + 1) % 30 === 0)) look(a, w);   // adult atlases may still be loading
      // chase the scheduled point: at most 1.6x walking pace per game minute, with collision; never placed
      const dx = w.x - a.x, dy = w.y - a.y, l = Math.hypot(dx, dy), max = SPEED * 1.6 * step;
      let moved = 0; if (l > 0.03 && max > 0) { const k = Math.min(l, max); moved = SP.actors.move ? SP.actors.move(a, dx / l * k, dy / l * k) : (a.x += dx / l * k, a.y += dy / l * k, k); }
      a.moving = moved > 1e-3; if (a.moving && SP.dirFromWorld) a.dir = a.target = SP.dirFromWorld(dx, dy) || a.dir; else if (!a.moving && w.kind !== 'parent' && l < 0.1) { /* queue / gate: face the counter or the gate */ }
      if (a.update) a.update((dt || 0.016) * 0.98, a.moving, a.dir, moved);
    }
  }
  const update0 = G.update; G.update = function (dt) { const r = update0 ? update0.apply(this, arguments) : undefined; try { tick(dt); } catch (e) { root.console && root.console.error && root.console.error(e); } return r; };
  SP.schoolCrowd = Object.assign({}, api, { tick, near, actors: () => [...actors.values()], reset: () => { drop(); lastT = null; } });
})(typeof window !== 'undefined' ? window : globalThis);
