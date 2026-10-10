/* 云汇CBD · crowd: schedule-driven people on the walk graph (A*), from rules/scene 'schedule':
   commuters metro/BRT/bus <-> tower lobbies at rush hours, lunch crowd lobby -> shops / park benches -> back,
   leisure visitors (mall, boutiques, buskers, stadium), joggers + dog walkers looping the park, two buskers (evening).
   People wait for the pedestrian green at crosswalks, keep a lateral lane offset, step aside for 李默. */
(function (SP) {
  "use strict";
  const C = SP.cbd, X = C._; if (!X) return; C._mods.crowd = true;
  const { D, F, W, NPC, rnd, clamp, dirOf } = X;
  const NN = D.nav.nodes, PO = D.poi;
  function astar(a, b) {
    if (a === b) return [a];
    const n = NN.length, g = new Float64Array(n).fill(1e18), prev = new Int32Array(n).fill(-1), open = [a], inOpen = new Uint8Array(n);
    g[a] = 0; inOpen[a] = 1;
    const h = (i) => Math.hypot(NN[i][0] - NN[b][0], NN[i][1] - NN[b][1]);
    while (open.length) {
      let bi = 0, bf = 1e18; for (let i = 0; i < open.length; i++) { const f = g[open[i]] + h(open[i]); if (f < bf) { bf = f; bi = i; } }
      const u = open[bi]; open[bi] = open[open.length - 1]; open.pop(); inOpen[u] = 0;
      if (u === b) break;
      for (const [v, L, cw] of W.adj[u]) { const ng = g[u] + L + (cw ? 6 : 0); if (ng < g[v]) { g[v] = ng; prev[v] = u; if (!inOpen[v]) { inOpen[v] = 1; open.push(v); } } }
    }
    if (prev[b] < 0) return null;
    const path = []; for (let u = b; u >= 0; u = prev[u]) { path.push(u); if (u === a) break; }
    return path.reverse();
  }
  C.astar = astar;
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const SETS = { office: ["office", "office", "office", "student"], leisure: ["student", "office", "uncle", "vendor"], jog: ["student", "office"], dog: ["uncle", "vendor"] };
  const DOGV = ["base", "w", "b"].filter((v) => F[`dog/${v}/w0/-/0`]);
  function route(a, to) { const p = astar(a.node, to); if (!p || p.length < 2) return false; a.path = p; a.pi = 1; a.goal = to; return true; }
  function mkNPC(kind, from, to, opt) {
    const sets = SETS[kind === "commute" || kind === "lunch" ? "office" : kind] || SETS.leisure;
    const set = pick(sets.filter((s) => window.ACTORS && window.ACTORS[s])) || "office";
    const a = new SP.Actor({ id: "cbd_" + (++NPC.t), set, speed: 1.35, radius: 0.22 });
    Object.assign(a, { kind, path: null, pi: 0, linger: 0, lat: (rnd() - 0.5) * 1.6, sp: (kind === "jog" ? 2.5 : 1.15 + rnd() * 0.45) * (kind === "commute" ? 1.15 : 1) }, opt || {});
    a.x = NN[from][0]; a.y = NN[from][1]; a.node = from;
    if (!route(a, to)) return null;
    if (kind === "dog") { a.dog = { x: a.x - 1, y: a.y, dir: 0, ph: 0, v: pick(DOGV) || "base" }; a.sp = 0.85; }
    NPC.list.push(a); return a;
  }
  function warmPlace(a) {   // initial fill: put the walker somewhere along its route instead of at the start
    if (!C._warm || !a.path) return;
    const k = 1 + Math.floor(rnd() * (a.path.length - 1)); a.pi = k; a.node = a.path[k - 1]; a.x = NN[a.node][0]; a.y = NN[a.node][1];
    if (a.dog) { a.dog.x = a.x - 1; a.dog.y = a.y; }
  }
  X.npcSpawnStep = function (dt) {
    const S = X.schedule;
    const want = { commute_in: 46 * S("office_in"), commute_out: 46 * S("office_out"), lunch: 34 * S("lunch"), leisure: 10 + 34 * S("leisure"), jog: 9 * S("jog"), dog: 5 * S("dog") };
    const has = {}; for (const a of NPC.list) if (!a.gone) has[a.sub] = (has[a.sub] || 0) + 1;
    const transit = () => pick([PO.metro.A, PO.metro.B, PO.metro.C, PO.metro.D, PO.metro.C, PO.metro.B, PO.brt[0], PO.brt[1], PO.bus[0], pick(PO.edge)]);
    const benches = D.benches.map((b) => b.node), busk = D.buskers.map((b) => b.node);
    const dests = () => PO.shop.concat(PO.shop, PO.park_loop.slice(0, 6), PO.mall, PO.mall, benches, busk, busk);
    const N8 = C._warm ? 60 : 1, go = (k, p) => (has[k] || 0) < want[k] && (C._warm || rnd() < dt * p);
    for (let k = 0; k < N8; k++) {
      let a = null;
      if (go("commute_in", 3)) a = mkNPC("commute", transit(), pick(PO.lobby), { sub: "commute_in" });
      else if (go("commute_out", 3)) a = mkNPC("commute", pick(PO.lobby), transit(), { sub: "commute_out" });
      else if (go("lunch", 2)) { const home = pick(PO.lobby); a = mkNPC("lunch", home, pick(dests()), { home, sub: "lunch" }); }
      else if (go("leisure", 1.5)) a = mkNPC("leisure", transit(), pick(dests().concat(PO.stadium, PO.compound || [])), { home: transit(), sub: "leisure" });
      else if (go("jog", 0.6)) { const i = Math.floor(rnd() * PO.park_loop.length); a = mkNPC("jog", PO.park_loop[i], PO.park_loop[(i + 9) % PO.park_loop.length], { laps: 2 + Math.floor(rnd() * 3), sub: "jog" }); if (a) a.runK = 1; }
      else if (go("dog", 0.4)) { const i = Math.floor(rnd() * PO.park_loop.length); a = mkNPC("dog", PO.park_loop[i], PO.park_loop[(i + 7) % PO.park_loop.length], { laps: 1, sub: "dog" }); }
      else break;
      if (a) { has[a.sub] = (has[a.sub] || 0) + 1; warmPlace(a); }
    }
    const on = S("busk") > 0.3;
    for (const b of D.buskers) {
      if (on && !b.actor) { const a = new SP.Actor({ id: "busker" + b.x, set: b.x < 300 ? "student" : "vendor", speed: 0, radius: 0.22 }); a.x = b.x; a.y = b.y; a.setDir("S"); a.kind = "busker"; a.sub = "busker"; b.actor = a; NPC.list.push(a); }
      if (!on && b.actor) { b.actor.gone = true; b.actor = null; }
    }
  };
  X.npcStep = function (dt) {
    const P = C.player, rush = X.schedule("office_in") > 0.6 || X.schedule("office_out") > 0.6;
    for (const a of NPC.list) {
      if (a.gone) continue;
      if (a.kind === "busker") { a.update(dt, false, "S", 0); continue; }
      if (a.linger > 0) {
        a.linger -= dt; if (!a.hidden) a.update(dt, false, a.lookDir || a.dir, 0);
        if (a.linger <= 0) { a.hidden = false; if (!route(a, a.home != null ? a.home : pick(PO.edge))) a.gone = true; a.home = null; a.back = true; }
        continue;
      }
      if (!a.path || a.pi >= a.path.length) { arrive(a); continue; }
      const i = a.path[a.pi - 1], j = a.path[a.pi], ex = NN[j][0] - NN[i][0], ey = NN[j][1] - NN[i][1], L = Math.hypot(ex, ey) || 1;
      const edge = W.adj[i].find((e) => e[0] === j), cw = edge && edge[2];
      if (cw && !a.onCw) { if (!X.pedGreen(cw, 9)) { a.update(dt, false, a.dir, 0); continue; } a.onCw = true; }
      const gx = NN[j][0] - ey / L * a.lat, gy = NN[j][1] + ex / L * a.lat;
      const dx = gx - a.x, dy = gy - a.y, d = Math.hypot(dx, dy);
      if (d < 0.35) { a.pi++; a.onCw = false; a.node = j; continue; }
      const step = Math.min(d, a.sp * (a.kind !== "jog" && rush ? 1.12 : 1) * dt), mx = dx / d * step, my = dy / d * step;
      if (P && Math.hypot(a.x + mx / step * 0.7 - P.x, a.y + my / step * 0.7 - P.y) < 0.5) {      // 李默 in the way: wait, then sidestep
        a.blockT = (a.blockT || 0) + dt;
        if (a.blockT < 0.7) { a.update(dt, false, a.dir, 0); continue; }
        a.lat = clamp(a.lat + (a.lat > 0 ? 0.5 : -0.5), -1.8, 1.8); a.blockT = 0;
      }
      a.x += mx; a.y += my;
      a.update(dt, true, dirOf(mx, my), step);
      if (a.dog) {
        const g = a.dog, dd = Math.hypot(a.x - g.x, a.y - g.y);
        if (dd > 1.3) { const k = (dd - 1.3) / dd; g.x += (a.x - g.x) * k; g.y += (a.y - g.y) * k; g.ph += step * 5; g.dir = ((Math.round(Math.atan2(a.y - g.y, a.x - g.x) / (Math.PI / 4)) % 8) + 8) % 8; }
      }
    }
    for (let i = NPC.list.length - 1; i >= 0; i--) if (NPC.list[i].gone) NPC.list.splice(i, 1);
  };
  function arrive(a) {
    const n = a.node;
    if (a.kind === "jog" || a.kind === "dog") {
      if (a.laps > 0) { a.laps--; const L = PO.park_loop, k = Math.max(0, L.indexOf(n)); if (route(a, L[(k + 13) % L.length])) return; }
      if (a.left) { a.gone = true; return; }
      a.left = true; if (!route(a, pick(PO.edge.concat([PO.metro.A])))) a.gone = true; return;
    }
    if (a.kind === "commute" || a.back) { a.gone = true; return; }
    const bench = D.benches.find((b) => b.node === n), busk = D.buskers.find((b) => b.node === n);
    if (busk && busk.actor) { a.x = busk.x + (rnd() - 0.5) * 4; a.y = busk.y - 2.0 - rnd() * 1.6; a.lookDir = "N"; a.linger = 20 + rnd() * 40; return; }
    if (bench) { a.x = bench.x - bench.face[0] * 0.9; a.y = bench.y - bench.face[1] * 0.9; a.lookDir = dirOf(bench.face[0], bench.face[1]); a.linger = 25 + rnd() * 50; return; }
    if (PO.shop.includes(n) || PO.mall.includes(n) || PO.stadium.includes(n) || (PO.compound || []).includes(n)) { a.hidden = true; a.linger = 15 + rnd() * 40; return; }
    a.linger = 8 + rnd() * 20; a.lookDir = a.dir;
  }
})(window.SP = window.SP || {});
