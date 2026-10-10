/* NPC brain — small deterministic state machine / planner over js/schedule.js. Engine-agnostic: no DOM, no canvas,
   no randomness at run time. planDay() turns a schedule into timed segments for one day (+ weather); sample() gives
   the exact state at any clock minute, so time skips (sleep, T key) and save/load stay consistent.
     segment: { t0, t1, type: "walk", pts: [[x,y]..], len, act } | { t0, t1, type: "stay", x, y, act, face, hidden }
     sample:  { x, y, vx, vy (px/min), act, face, hidden, moving, block }
   Times inside a plan are "day minutes" = minutes since 05:00. */
(function (root) {
  "use strict";
  const DAY0 = 300;
  const hm = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  const dayMin = (clock) => ((((clock - DAY0) % 1440) + 1440) % 1440);           // clock minute -> day minute
  const span = (b) => { const f = dayMin(hm(b.from)); let t = dayMin(hm(b.to)); if (t <= f) t += 1440; return [f, t]; };
  function hash(a, b) { let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x27d4eb2f, 0xc2b2ae35); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; return (h >>> 0) / 4294967296; }

  /** shortest path between graph nodes (Dijkstra, tiny graph) -> list of node ids */
  function path(graph, a, b) {
    if (a === b) return [a];
    const N = graph.nodes, adj = {};
    for (const [u, v] of graph.edges) { (adj[u] = adj[u] || []).push(v); (adj[v] = adj[v] || []).push(u); }
    const dist = { [a]: 0 }, prev = {}, open = new Set([a]);
    while (open.size) {
      let u = null; for (const n of open) if (u === null || dist[n] < dist[u]) u = n;
      open.delete(u);
      if (u === b) break;
      for (const v of adj[u] || []) {
        const d = dist[u] + Math.hypot(N[u][0] - N[v][0], N[u][1] - N[v][1]);
        if (dist[v] == null || d < dist[v]) { dist[v] = d; prev[v] = u; open.add(v); }
      }
    }
    if (dist[b] == null) return [a, b];
    const out = [b]; while (out[0] !== a) out.unshift(prev[out[0]]);
    return out;
  }
  const plen = (pts) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };

  /** weather/conditions: ctx = { weather: "rain"|"clear" } */
  function active(block, ctx) {
    const u = block.unless;
    if (!u) return block;
    if (u.weather && ctx.weather === u.weather) return Object.assign({ from: block.from, to: block.to }, block.instead || { act: "inside", at: null });
    return block;
  }

  function planWalker(def, graph, ctx) {
    const N = graph.nodes, segs = [];
    let loc = def.start, t = 0;
    const blocks = def.blocks.map((b) => [span(b), b]).sort((x, y) => x[0][0] - y[0][0]);
    // the NPC is wherever the last block of the previous day left them; start hidden there
    const last = blocks[blocks.length - 1][1];
    const lastAct = active(last, ctx);
    if (lastAct.act === "inside" || lastAct.at == null) loc = lastAct.at || def.home || def.start; else loc = lastAct.at || def.start;
    const hiddenAt = (n) => ({ hidden: true });
    let hidden = true;
    const walkTo = (node, t0, act) => {
      const ids = path(graph, loc, node), pts = ids.map((n) => N[n]);
      const len = plen(pts), dur = len / def.speed;
      if (len > 0.5) segs.push({ t0, t1: t0 + dur, type: "walk", pts, len, act: act || "walk", from: loc, to: node });
      loc = node; return t0 + dur;
    };
    for (const [[f, to], b0] of blocks) {
      const b = active(b0, ctx);
      t = Math.max(t, f);
      if (b.act === "route") {
        let tt = t, i = 0;
        const R = b.route;
        while (tt < to) {
          const n = R[i % R.length];
          tt = walkTo(n, tt, "route");
          const w = b.wait || 0;
          if (w > 0) { const N0 = N[n]; segs.push({ t0: tt, t1: Math.min(to, tt + w), type: "stay", x: N0[0], y: N0[1], act: "route", face: null, block: b.from }); tt += w; }
          i++;
          if (i > 200) break;
        }
        t = tt;
        continue;
      }
      const at = b.at || def.start;
      t = walkTo(at, t, "walk");
      const P = N[at];
      if (t < to) segs.push({ t0: t, t1: to, type: "stay", x: P[0], y: P[1], act: b.act, face: b.face || null, hidden: b.act === "inside", block: b.from });
      t = Math.max(t, to);
    }
    return segs;
  }

  function planTrips(def, graph, ctx, day) {
    const N = graph.nodes, T = def.trips, segs = [];
    const pts = T.path.map((n) => N[n]);
    const si = T.path.indexOf(T.stopAt);
    const a = pts.slice(0, si + 1), b = pts.slice(si);
    const la = plen(a), lb = plen(b), da = la / def.speed, db = lb / def.speed;
    let k = 0, lastEnd = -1;
    for (const w of T.windows) {
      const [f, to] = span(w);
      for (let t = f; t < to; t += w.every) {
        const s = t + (hash(day * 131 + k, 7) - 0.5) * 2 * (w.jitter || 0);
        k++;
        if (s < lastEnd + 0.5 || s < 0 || s + da + T.stop + db > 1440) continue;    // one rider at a time
        segs.push({ t0: s, t1: s + da, type: "walk", pts: a, len: la, act: "ride" });
        segs.push({ t0: s + da, t1: s + da + T.stop, type: "stay", x: a[a.length - 1][0], y: a[a.length - 1][1], act: "stop", face: T.face });
        segs.push({ t0: s + da + T.stop, t1: s + da + T.stop + db, type: "walk", pts: b, len: lb, act: "ride" });
        lastEnd = s + da + T.stop + db;
      }
    }
    return segs;
  }

  function planDay(def, graph, ctx, day) {
    const segs = def.trips ? planTrips(def, graph, ctx, day || 0) : planWalker(def, graph, ctx);
    segs.sort((x, y) => x.t0 - y.t0);
    return { segs, def, ctx: Object.assign({}, ctx), day };
  }

  /** trapezoid speed profile: accelerate / brake over `ta` minutes at both ends (smooth starts and stops) */
  function profile(u, dur) {
    const ta = Math.min(0.45, dur / 3), T = dur;
    const vmax = 1 / (T - ta);            // distance normalised to 1
    const t = u * T;
    let s, v;
    if (t < ta) { s = 0.5 * vmax / ta * t * t; v = vmax * t / ta; }
    else if (t > T - ta) { const r = T - t; s = 1 - 0.5 * vmax / ta * r * r; v = vmax * r / ta; }
    else { s = 0.5 * vmax * ta + vmax * (t - ta); v = vmax; }
    return [Math.min(1, Math.max(0, s)), v];
  }
  function along(pts, d) {
    for (let i = 1; i < pts.length; i++) {
      const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (d <= L || i === pts.length - 1) {
        const k = L > 0 ? Math.min(1, d / L) : 0;
        return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k, (pts[i][0] - pts[i - 1][0]) / (L || 1), (pts[i][1] - pts[i - 1][1]) / (L || 1)];
      }
      d -= L;
    }
    const p = pts[pts.length - 1]; return [p[0], p[1], 0, 0];
  }

  /** state at clock minute `clock` */
  function sample(plan, clock) {
    const tm = dayMin(clock), S = plan.segs;
    let cur = null, prev = null;
    for (const s of S) { if (s.t0 <= tm && tm < s.t1) { cur = s; break; } if (s.t1 <= tm) prev = s; }
    if (!cur) {
      // between segments: hold where the last one ended (hidden if nothing happened yet today and the NPC starts inside)
      if (prev) {
        const e = prev.type === "walk" ? prev.pts[prev.pts.length - 1] : [prev.x, prev.y];
        const hid = prev.type === "stay" ? !!prev.hidden : (plan.def.trips ? true : false);
        return { x: e[0], y: e[1], vx: 0, vy: 0, act: plan.def.trips ? "away" : prev.type === "stay" ? prev.act : "idle", face: prev.face || null, hidden: hid || (!!plan.def.trips), moving: false };
      }
      const first = S[0];
      if (plan.def.trips || !first) { const p = first ? first.pts[0] : [0, 0]; return { x: p[0], y: p[1], vx: 0, vy: 0, act: "away", hidden: true, moving: false }; }
      const p = first.type === "walk" ? first.pts[0] : [first.x, first.y];
      return { x: p[0], y: p[1], vx: 0, vy: 0, act: "inside", hidden: true, moving: false };
    }
    if (cur.type === "stay") return { x: cur.x, y: cur.y, vx: 0, vy: 0, act: cur.act, face: cur.face, hidden: !!cur.hidden, moving: false, until: cur.t1 };
    const dur = cur.t1 - cur.t0, u = (tm - cur.t0) / dur;
    const [s, v] = profile(u, dur);
    const [x, y, dx, dy] = along(cur.pts, s * cur.len);
    const sp = v * cur.len;               // px per minute
    return { x, y, vx: dx * sp, vy: dy * sp, act: cur.act, face: null, hidden: false, moving: sp > 1e-3 };
  }

  const API = { planDay, sample, path, dayMin, hm };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else (root.FW = root.FW || {}).NPCBrain = API;
})(typeof window !== "undefined" ? window : globalThis);
