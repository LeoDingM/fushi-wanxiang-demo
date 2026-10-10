/* scene-proto-45 · world: objects from scene.json, diamond ground bake, footprint colliders, ISO DEPTH SORT
   (3D sort boxes + topological order), occluder fading, runtime states + overlays, data-driven events.

   Depth sort (ARCHITECTURE §3): every drawable has a world-space sort box {x0,y0,x1,y1,z0,z1} (its real extent: the
   footprint / sort_box of the piece rotated by rot, z from sort_z; characters = foot circle box). The camera looks
   along +x +y and down, so for two drawables whose screen rects overlap:
     a is in front of b  if  a.x1 <= b.x0  or  a.y1 <= b.y0        (separated on the ground, a nearer)
                         else if a.z0 >= b.z1                        (a above b, e.g. canopy / awning over a head)
                         else if footprints / foot circles are separated: the closest-point normal decides
                         else z_order (modules of one facade sharing a bay: wall < window < AC/sign), else no constraint.
   Constraints become edges; a DFS topological sort visits nodes in a stable key order (depth x+y desc, z, z_order,
   id), so ties never flicker and cycles (impossible for disjoint boxes, but guarded) break deterministically.
   Long things are sliced: courtyard walls per 2 m segment, the building per 3 m bay x 3 m storey module + roof. */
(function (SP) {
  "use strict";
  const K = SP.K;
  const W = (SP.world = { objects: [], byId: {}, decals: [], colliders: [], groundCanvas: null, groundOrigin: [0, 0], log: [] });
  const FADE_ALPHA = 0.35, FADE_RATE = 7, EPS = 1e-3;
  function piece(o) { return K.pieces[o.type]; }
  W.piece = piece;
  W.shownState = function (o) {
    if (o.type === "f_window" && o.state === "intact" && o.night_lit && SP.tint.night > 0.35) return "lit";
    return o.state;
  };
  W.load = function (data) {
    W.data = data; W.objects = []; W.byId = {}; W.decals = []; W.log = []; W.timers = [];
    for (const src of data.objects) {
      const o = Object.assign({ z: 0, rot: 0, variant: "base" }, src);
      const P = piece(o);
      if (!P) { console.warn("unknown piece", o.type); continue; }
      if (!o.state) o.state = P.states[0];
      o.overlays = []; o.alpha = {};
      W.objects.push(o); W.byId[o.id] = o;
    }
    W.rebuildColliders();
    W.bakeGround();
  };

  // ---------- footprints / colliders (world space) ----------
  W.footprints = function (o) {
    const P = piece(o);
    const rects = (P.footprint_states && o.state in P.footprint_states ? P.footprint_states[o.state] : P.footprint) || [];
    return rects.map((r) => SP.footPoly(r, o.rot, o.x, o.y));
  };
  W.rebuildColliders = function () {
    const C = [];
    for (const o of W.objects) o._box = null;          // sort boxes depend on state (gate leaves, crashed car)
    for (const o of W.objects) {
      if (piece(o).layer !== "sorted") continue;
      for (const poly of W.footprints(o)) C.push({ poly, box: SP.polyBox(poly), id: o.id });
    }
    for (const c of W.data.colliders || []) {
      const [x0, y0, x1, y1] = c.rect;
      C.push({ poly: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], box: c.rect, id: c.id });
    }
    W.colliders = C;
    // uniform 2 m grid for fast circle queries
    const G = (W.cgrid = new Map()), CS = 2;
    C.forEach((c, i) => {
      for (let gx = Math.floor(c.box[0] / CS); gx <= Math.floor(c.box[2] / CS); gx++)
        for (let gy = Math.floor(c.box[1] / CS); gy <= Math.floor(c.box[3] / CS); gy++) {
          const k = gx * 1000 + gy; if (!G.has(k)) G.set(k, []); G.get(k).push(i);
        }
    });
  };
  /** colliders whose box may touch the circle */
  W.nearColliders = function (x, y, r) {
    const CS = 2, out = new Set();
    for (let gx = Math.floor((x - r) / CS); gx <= Math.floor((x + r) / CS); gx++)
      for (let gy = Math.floor((y - r) / CS); gy <= Math.floor((y + r) / CS); gy++) { const l = W.cgrid.get(gx * 1000 + gy); if (l) for (const i of l) out.add(i); }
    return [...out].map((i) => W.colliders[i]);
  };
  /** static footprint / bounds hit for a circle; returns the collider id or null */
  W.blockedStatic = function (x, y, r) {
    const B = W.data.bounds;
    if (x - r < B.x0 || x + r > B.x1 || y - r < B.y0 || y + r > B.y1) return "bounds";
    for (const c of W.nearColliders(x, y, r)) {
      const b = c.box;
      if (x + r <= b[0] || x - r >= b[2] || y + r <= b[1] || y - r >= b[3]) continue;
      if (SP.circlePoly(x, y, r, c.poly)) return c.id;
    }
    return null;
  };
  /** static + cars */
  W.blocked = function (x, y, r, ignoreCars) {
    const s = W.blockedStatic(x, y, r); if (s) return s;
    if (!ignoreCars && SP.traffic) for (const car of SP.traffic.allCars()) if (SP.circlePoly(x, y, r, car.poly)) return car.id;
    return null;
  };

  // ---------- ground: 2 m diamond chunks + decals + low pieces baked into one canvas ----------
  W.bakeGround = function () {
    const G = W.data.ground, [X0, Y0] = G.origin, ch = G.chunk, X1 = X0 + G.cols * ch, Y1 = Y0 + G.rows * ch;
    const xs = [SP.sx(X0, Y1), SP.sx(X1, Y0)], ys = [SP.sy(X1, Y1, 0), SP.sy(X0, Y0, 0)];
    const ox = Math.floor(xs[0]) - 2, oy = Math.floor(ys[0]) - 2, w = Math.ceil(xs[1] - xs[0]) + 4, h = Math.ceil(ys[1] - ys[0]) + 40;
    const c = (W.groundCanvas = W.groundCanvas || document.createElement("canvas"));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    const x = c.getContext("2d");
    x.setTransform(1, 0, 0, 1, 0, 0); x.imageSmoothingEnabled = false; x.clearRect(0, 0, w, h);
    W.groundOrigin = [ox, oy];
    x.translate(-ox, -oy);
    G.data_south_to_north.forEach((row, r) => {
      for (let col = 0; col < row.length; col++) {
        const [pc, st] = G.legend[row[col]].split(":");
        const key = SP.frameKey(pc, "base", "main", st || "default", 0);
        const gx = X0 + col * ch, gy = Y0 + r * ch;
        SP.drawFrame(x, key, SP.sx(gx, gy), SP.sy(gx, gy, 0));
      }
    });
    const flat = W.objects.filter((o) => { const L = piece(o).layer; return L === "decal" || L === "low"; });
    flat.sort((a, b) => (piece(a).layer === "low") - (piece(b).layer === "low") || (b.x + b.y) - (a.x + a.y));
    for (const o of flat) SP.drawFrame(x, SP.frameKey(o.type, o.variant, "main", o.state, o.rot), SP.sx(o.x, o.y), SP.sy(o.x, o.y, o.z));
    W.groundTintKey = SP.tintKey;
  };

  // ---------- sort boxes ----------
  function rotRectBox(r, o) { return SP.polyBox(SP.footPoly(r, o.rot, o.x, o.y)); }
  /** world sort box of an object part: {x0,y0,x1,y1,z0,z1} + optional ground polygon (for rotated pieces) */
  W.sortBox = function (o, part) {
    const P = piece(o);
    const g = P.geo && P.geo[W.shownState(o)] && P.geo[W.shownState(o)][part] || P.geo && P.geo[o.state] && P.geo[o.state][part];
    if (g) {          // real geometry extent exported by gen_kit45.py, rotated with the object; footprints refine
      const b = rotRectBox([g[0], g[1], g[3], g[4]], o), fps = W.footprints(o);
      return { x0: b[0], y0: b[1], x1: b[2], y1: b[3], z0: (o.z || 0) + g[2], z1: (o.z || 0) + g[5], polys: fps.length ? fps : (o.rot % 2 ? [SP.footPoly([g[0], g[1], g[3], g[4]], o.rot, o.x, o.y)] : null) };
    }
    let rect = null, z = P.sort_z || [0, 1.0], polys = null;
    if (P.part_sort && P.part_sort[part]) { rect = P.part_sort[part].box; z = P.part_sort[part].z; }
    else if (P.sort_box) rect = P.sort_box;
    let b;
    if (rect) { b = rotRectBox(rect, o); if (o.rot % 2) polys = [SP.footPoly(rect, o.rot, o.x, o.y)]; }
    else {
      const fps = W.footprints(o);
      if (fps.length) {
        b = [1e9, 1e9, -1e9, -1e9];
        for (const p of fps) { const q = SP.polyBox(p); b = [Math.min(b[0], q[0]), Math.min(b[1], q[1]), Math.max(b[2], q[2]), Math.max(b[3], q[3])]; }
        if (o.rot % 2) polys = fps;
      } else b = [o.x - 0.15, o.y - 0.15, o.x + 0.15, o.y + 0.15];
    }
    return { x0: b[0], y0: b[1], x1: b[2], y1: b[3], z0: (o.z || 0) + z[0], z1: (o.z || 0) + z[1], polys };
  };
  /** drawable for a character: box = foot circle(s) */
  W.actorBox = function (a) {
    const cs = a.circles();
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [cx, cy, r] of cs) { x0 = Math.min(x0, cx - r); y0 = Math.min(y0, cy - r); x1 = Math.max(x1, cx + r); y1 = Math.max(y1, cy + r); }
    return { x0, y0, x1, y1, z0: 0, z1: a.height, circles: cs };
  };

  /** geometric front-to-back relation. +1: a in front of b (draw a after b), -1: b in front, 0: unconstrained */
  W.front = function (a, b) {
    const A = a.box, B = b.box;
    const aX = A.x1 <= B.x0 + EPS, bX = B.x1 <= A.x0 + EPS, aY = A.y1 <= B.y0 + EPS, bY = B.y1 <= A.y0 + EPS;
    const aF = aX || aY, bF = bX || bY;
    if (aF && !bF) return 1;
    if (bF && !aF) return -1;
    if (aF && bF) return (a.depth < b.depth - EPS) ? 1 : (b.depth < a.depth - EPS ? -1 : 0);
    // modules of one facade (one fade group) with overlapping ground boxes: the facade layer order decides
    // (wall < window/door < AC/sign/balcony), before the height test, so stacked bays never form cycles
    if (a.o && b.o && a.o.fade_group && a.o.fade_group === b.o.fade_group) return a.zo !== b.zo ? (a.zo > b.zo ? 1 : -1) : 0;
    // ground boxes overlap: one entirely above the other (canopy / awning / balcony over a head)?
    if (A.z0 >= B.z1 - EPS) return 1;
    if (B.z0 >= A.z1 - EPS) return -1;
    // same height band: the solid footprints / foot circles decide by their separating normal
    const r = refine(a, b);
    if (r) return r;
    return 0;
  };
  /** footprint shapes of a drawable for the prism test: foot circles, or footprint polygons, or the box rect */
  W.shapes = function (d) {
    const b = d.box;
    if (b.circles) return b.circles.map((c) => ({ c }));
    if (b.polys) return b.polys.map((p) => ({ p }));
    return [{ p: [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]] }];
  };
  function refine(a, b) {
    if (!a.box.circles && !b.box.circles && !a.box.polys && !b.box.polys) return 0;
    return SP.prismOrder(W.shapes(a), W.shapes(b));
  }
  const keyCmp = (a, b) => (b.depth - a.depth) || (a.box.z0 - b.box.z0) || (a.zo - b.zo) || (a.sid < b.sid ? -1 : a.sid > b.sid ? 1 : 0);
  /** topological painter order of drawables (each needs box, depth, zo, sid, rect) */
  W.sortDrawables = function (list) {
    W._dl = list;
    list.sort(keyCmp);
    const n = list.length, behind = new Array(n);
    for (let i = 0; i < n; i++) { behind[i] = []; list[i]._i = i; }
    for (let i = 0; i < n; i++) {
      const a = list[i], ra = a.rect;
      for (let j = i + 1; j < n; j++) {
        const b = list[j], rb = b.rect;
        if (!(ra.x0 < rb.x1 && rb.x0 < ra.x1 && ra.y0 < rb.y1 && rb.y0 < ra.y1)) continue;
        const f = W.front(a, b);
        if (f > 0) behind[i].push(j); else if (f < 0) behind[j].push(i);
      }
    }
    const state = new Uint8Array(n), out = [], stack = [];
    W.sortCycles = 0;
    const visit = (i) => {
      if (state[i] === 2) return;
      if (state[i] === 1) { W.sortCycles++; W.lastCycle = stack.slice(stack.indexOf(i)).map((k) => list[k].sid); return; }
      state[i] = 1; stack.push(i);
      const bs = behind[i]; bs.sort((p, q) => p - q);
      for (const j of bs) visit(j);
      state[i] = 2; stack.pop(); out.push(list[i]);
    };
    for (let i = 0; i < n; i++) visit(i);
    W.sortEdges = behind;
    return out;
  };
  /** drawables of static objects (per part) */
  W.drawables = function (out, view) {
    for (const o of W.objects) {
      const P = piece(o);
      if (P.layer !== "sorted") continue;
      const st = W.shownState(o), X = SP.sx(o.x, o.y), Y = SP.sy(o.x, o.y, o.z);
      P.parts.forEach((part, pi) => {
        const key = SP.frameKey(o.type, o.variant, part, st, o.rot);
        if (!key) return;
        const rect = SP.frameRect(key, X, Y);
        if (view && !SP.rectsOverlap(rect, view)) return;
        const box = (o._box && o._box[part + st]) || ((o._box = o._box || {})[part + st] = W.sortBox(o, part));
        const fadeable = !!(P.fadeable || (P.fade_parts && P.fade_parts.includes(part)));
        out.push({ kind: "obj", o, part, key, X, Y, rect, box, depth: (box.x0 + box.x1 + box.y0 + box.y1) / 2, zo: (P.z_order || 0) + pi * 0.01,
                   sid: o.id + "/" + part, fadeable });
      });
      for (const ov of o.overlays) if (ov.type === "soot" && ov.active) {
        const c = SP.rotPt([1.5, -0.02, 2.42], o.rot), sx = SP.sx(o.x + c[0], o.y + c[1]), sy = SP.sy(o.x + c[0], o.y + c[1], o.z + c[2]);
        const box = W.sortBox(o, P.parts[0]);
        const f = SP.frame("fx/soot"), rect = { x0: sx - f[4] - 20, y0: sy - f[5] - 20, x1: sx - f[4] + f[2] + 20, y1: sy - f[5] + f[3] + 20 };
        out.push({ kind: "overlay", o, key: "fx/soot", X: sx, Y: sy, rect, box, depth: (box.x0 + box.x1 + box.y0 + box.y1) / 2, zo: (P.z_order || 0) + 0.5,
                   sid: o.id + "/soot", alpha: Math.min(1, ov.t / 3), shear: o.rot === 6 ? 0.5 : -0.5 });
      }
    }
    return out;
  };
  /** occluder fading: anything drawn after the player whose opaque cells cover his body fades (by fade_group) */
  W.updateFade = function (list, playerIdx, body, dt) {
    const hit = new Set();
    W.fading = [];
    for (let i = playerIdx + 1; i < list.length; i++) {
      const d = list[i];
      if (!d.fadeable) continue;
      const f = SP.frame(d.key), dx = Math.round(d.X) - f[4], dy = Math.round(d.Y) - f[5];
      if (body.x1 < dx || body.x0 > dx + f[2] || body.y1 < dy || body.y0 > dy + f[3]) continue;
      if (SP.maskHits(d.key, dx, dy, body) >= 3) { hit.add(d.o.fade_group || d.o.id + "/" + d.part); W.fading.push(d.o.id + "/" + d.part); }
    }
    const k = Math.min(1, dt * FADE_RATE);
    for (const o of W.objects) {
      const P = piece(o);
      if (P.layer !== "sorted" || !(P.fadeable || P.fade_parts)) continue;
      for (const part of P.parts) {
        const on = hit.has(o.fade_group) || hit.has(o.id + "/" + part);
        const fadeable = P.fadeable || (P.fade_parts && P.fade_parts.includes(part));
        const target = on && fadeable ? FADE_ALPHA : 1;
        const a = o.alpha[part] == null ? 1 : o.alpha[part];
        o.alpha[part] = Math.abs(target - a) < 0.005 ? target : a + (target - a) * k;
      }
    }
    W.fadeHit = [...hit];
  };

  // ---------- events ----------
  W.trigger = function (name) {
    const ev = W.data.events[name];
    if (!ev) return false;
    W.log.push({ name, t: SP.now });
    for (const a of ev.actions) W.timers.push({ at: SP.now + (a.after || 0), a, ev: name });
    return true;
  };
  W.updateEvents = function (dt) {
    const due = W.timers.filter((t) => t.at <= SP.now);
    W.timers = W.timers.filter((t) => t.at > SP.now);
    for (const t of due) W.run(t.a);
    for (const o of W.objects) for (const ov of o.overlays) { ov.t += dt; ov.active = ov.dur == null || ov.t < ov.dur; }
  };
  /** world point on a facade module in its local frame (bay x along the face, -y out of the wall) */
  W.local = function (o, lx, ly, lz) { const p = SP.rotPt([lx, ly, lz], o.rot); return [o.x + p[0], o.y + p[1], (o.z || 0) + p[2]]; };
  W.run = function (a) {
    const o = a.target && W.byId[a.target];
    switch (a.do) {
      case "set_state": if (o) { o.state = a.state; o._box = null; W.rebuildColliders(); } break;
      case "overlay": if (o) o.overlays.push({ type: a.overlay, t: 0, dur: a.duration, active: true }); break;
      case "decal": W.decals.push({ key: a.frame, x: a.x, y: a.y, t: 0, shear: a.shear || 0 }); break;
      case "fx": if (a.fx === "glass_burst" && o) { const p = W.local(o, 1.5, -0.15, 1.6), n = SP.rotPt([0, -1], o.rot), t = SP.rotPt([1, 0], o.rot); SP.fx.glassBurst(p[0], p[1], p[2], a.n || 24, n, t); } break;
      case "traffic_crash": SP.traffic.crash(a); break;
    }
  };
})(window.SP);
