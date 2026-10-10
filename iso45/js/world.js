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
  SP.piece = piece;
  W.piece = piece;
  /** atlas variant of an object: its geometry variant (weathering / shape), + the season recolour for trees */
  W.variant = function (o) {
    const P = piece(o), se = SP.season || "summer";
    if (P.seasons && se !== "summer" && se !== "winter") return o.variant === "base" ? se : o.variant + "." + se;
    return o.variant;
  };
  W.shownState = function (o) {
    if (o.type === "f_window" && o.state === "intact" && SP.tint.night > 0.35 && SP.households && !W.interior) {
      const h = SP.households.windowLit(o); if (h !== null) return h ? "lit" : o.state;      // per-household occupancy (shared-rules)
    }
    if (o.type === "f_window" && o.state === "intact" && o.night_lit && SP.tint.night > 0.35) {
      const c = SP.clock, m = c ? c.min : 1200;                  // most lights go out after ~23:00 (per-window, per-day hash)
      if (c && (m > 1380 || m < 330) && SP.hash(SP.strHash(o.id), c.day) < 0.7) return o.state;
      return "lit";
    }
    return o.state;
  };
  W.load = function (data) {
    W.data = data; W.objects = []; W.byId = {}; W.chunkCols = []; W.chunksIn = {}; W.decals = []; W.log = W.log || []; W.timers = [];
    for (const src of data.objects) {
      const o = Object.assign({ z: 0, rot: 0, variant: "base" }, src);
      const P = piece(o);
      if (!P) { console.warn("unknown piece", o.type); continue; }
      if (!o.state) o.state = P.states[0];
      o.overlays = []; o.alpha = {};
      W.objects.push(o); W.byId[o.id] = o;
    }
    W.rebuildColliders();
    if (W.initRules) W.initRules(data);
    W.bakeGround();
  };
  /** season change (clock.js): recoloured trees + seasonal ground (fallen leaves / petals) */
  W.applySeason = function () { if (SP.clock) SP.season = SP.clock.season; W.bakeGround(); W.logEvent && W.logEvent(`换季：${SP.clock ? SP.clock.seasonName() : SP.season}`); };

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
      if (piece(o).layer !== "sorted" || o.carried) continue;     // a pushed bike collides as part of 李默
      for (const poly of W.footprints(o)) C.push({ poly, box: SP.polyBox(poly), id: o.id, roof: !!o.on_roof });
    }
    // interior doors (room-layout system): the door bay blocks while closed; open = walk through
    for (const o of W.objects) if (o.block && o.state !== "open") { const [x0, y0, x1, y1] = o.block; C.push({ poly: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], box: o.block, id: o.id }); }
    for (const c of (W.data.colliders || []).concat(W.chunkCols || [])) {
      const [x0, y0, x1, y1] = c.rect;
      C.push({ poly: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], box: c.rect, id: c.id });
    }
    W.colliders = C;
    if (SP.layers) SP.layers.invalidate();
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
    // two levels share the street world: on the 12号 roof only roof props collide, on the street never roof props
    const roof = !!(W._mover && W._mover.level === "roof");
    const res = []; for (const i of out) { const c = W.colliders[i]; if (!!c.roof === roof) res.push(c); }
    return res;
  };
  /** static footprint / bounds hit for a circle; returns the collider id or null */
  W.blockedStatic = function (x, y, r) {
    const B = W.data.bounds;
    if (x - r < B.x0 || x + r > B.x1 || y - r < B.y0 || y + r > B.y1) return "bounds";
    // the 12号 rooftop is a level of the street world: whoever walks up there stays inside the parapets
    const M = W._mover; if (M && M.level === "roof" && W.data.roof) { const R = W.data.roof.rect; if (x - r < R[0] || x + r > R[2] || y - r < R[1] || y + r > R[3]) return "parapet"; }
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
    if (!ignoreCars && SP.traffic && !(W._mover && W._mover.level === "roof")) for (const car of SP.traffic.allCars()) if (SP.circlePoly(x, y, r, car.poly)) return car.id;
    return null;
  };

  // ---------- ground: 2 m diamond chunks + decals + low pieces, baked lazily into 1024 x 512 px screen tiles ----------
  // (one canvas for a 100 m map would be 6000+ px wide: too big for phones; tiles are baked on first view per tint and
  //  evicted when far away, so the map can keep growing)
  const TW = 1024, TH = 512, TILE_CAP = 36;
  W.bakeGround = function () {           // (re)index; tiles re-bake lazily on the next draw
    const G = W.data.ground, [X0, Y0] = G.origin, ch = G.chunk, X1 = X0 + G.cols * ch, Y1 = Y0 + G.rows * ch;
    W.groundRect = [X0, Y0, X1, Y1];
    const items = [];
    G.data_south_to_north.forEach((row, r) => {
      for (let col = 0; col < row.length; col++) {
        if (!G.legend[row[col]]) continue;                          // "." = no floor (interiors: outside the room)
        const [pc, st] = G.legend[row[col]].split(":"), key = SP.frameKey(pc, "base", "main", st || "default", 0);
        const gx = X0 + col * ch, gy = Y0 + r * ch, X = SP.sx(gx, gy), Y = SP.sy(gx, gy, 0);
        if (key) items.push({ key, X, Y, rect: SP.frameRect(key, X, Y), o: 0, road: pc === "g_asphalt", g: [gx, gy, ch] });
      }
    });
    // seasonal ground: fallen leaves (autumn) / blossom petals (spring) under every tree
    const se = SP.season;
    if (se === "autumn" || se === "spring") for (const o of W.objects) {
      if (o.type !== "p_tree") continue;
      for (let i = 0; i < 2; i++) {
        const hh = SP.strHash(o.id) + i * 7, k = `fx/${se === "autumn" ? "leaves" : "petals"}/${hh % 3}`; if (!SP.frame(k)) continue;
        const x = o.x + (SP.hash(hh, 1) - 0.5) * 1.6, y = o.y + (SP.hash(hh, 2) - 0.5) * 1.6, X = SP.sx(x, y), Y = SP.sy(x, y, 0);
        items.push({ key: k, X, Y, rect: SP.frameRect(k, X, Y), o: 0.5 });
      }
    }
    const flat = W.objects.filter((o) => { const L = piece(o).layer; return L === "decal" || L === "low"; });
    flat.sort((a, b) => (piece(a).layer === "low") - (piece(b).layer === "low") || (b.x + b.y) - (a.x + a.y));
    flat.forEach((o, i) => { const key = SP.frameKey(o.type, o.variant, "main", o.state, o.rot); if (!key) return; const X = SP.sx(o.x, o.y), Y = SP.sy(o.x, o.y, o.z);
                             items.push({ key, X, Y, rect: SP.frameRect(key, X, Y), o: 1 + i }); });
    const idx = new Map();
    for (const it of items) {
      for (let tx = Math.floor(it.rect.x0 / TW); tx <= Math.floor((it.rect.x1 - 1) / TW); tx++)
        for (let ty = Math.floor(it.rect.y0 / TH); ty <= Math.floor((it.rect.y1 - 1) / TH); ty++) {
          const k = tx + "," + ty; if (!idx.has(k)) idx.set(k, []); idx.get(k).push(it);
        }
    }
    W.groundItems = items; if (SP.layers) SP.layers.groundChanged();
    W.groundIdx = idx; W.groundTiles = W.groundTiles || new Map(); W.groundTiles.forEach((t) => (t.tint = null));
    W.groundTintKey = gkey();
  };
  const gkey = () => SP.tintKey + "|" + (SP.env ? SP.env.snowLevel() : 0) + "|" + SP.season;
  function groundTile(tx, ty) {
    const k = tx + "," + ty; let t = W.groundTiles.get(k);
    if (t && t.tint === W.groundTintKey) { t.used = SP.frameNo || 0; return t; }
    const list = W.groundIdx.get(k); if (!list) return null;
    if (!t) { t = { c: document.createElement("canvas") }; t.c.width = TW; t.c.height = TH; W.groundTiles.set(k, t); }
    const x = t.c.getContext("2d"); x.setTransform(1, 0, 0, 1, 0, 0); x.imageSmoothingEnabled = false; x.clearRect(0, 0, TW, TH);
    x.translate(-tx * TW, -ty * TH);
    for (const it of list) SP.drawFrame(x, it.key, it.X, it.Y);
    const sl = SP.env ? SP.env.snowLevel() : 0;
    if (sl) SP.env.snowFill(x, list, sl, [tx * TW, ty * TH, TW, TH]);
    t.tint = W.groundTintKey; t.used = SP.frameNo || 0; W.groundBakes = (W.groundBakes || 0) + 1;
    if (W.groundTiles.size > TILE_CAP) {                      // evict least recently used
      const old = [...W.groundTiles.entries()].sort((a, b) => a[1].used - b[1].used).slice(0, W.groundTiles.size - TILE_CAP);
      for (const [kk, tt] of old) if (tt !== t) { tt.c.width = tt.c.height = 0; W.groundTiles.delete(kk); }
    }
    return t;
  }
  /** draw the ground under the screen-space view rect */
  W.drawGround = function (ctx, view) {
    const gk = gkey(); if (W.groundTintKey !== gk) W.groundTintKey = gk;          // tiles re-bake lazily (key mismatch)
    for (let tx = Math.floor(view.x0 / TW); tx <= Math.floor(view.x1 / TW); tx++)
      for (let ty = Math.floor(view.y0 / TH); ty <= Math.floor(view.y1 / TH); ty++) {
        const t = groundTile(tx, ty); if (t) ctx.drawImage(t.c, tx * TW, ty * TH);
      }
  };

  // ---------- sort boxes ----------
  function rotRectBox(r, o) { return SP.polyBox(SP.footPoly(r, o.rot, o.x, o.y)); }
  /** world sort box of an object part: {x0,y0,x1,y1,z0,z1} + optional ground polygon (for rotated pieces) */
  W.sortBox = function (o, part) {
    const b = sortBox0(o, part);
    if (o.sortz) { b.z0 = (o.z || 0) + o.sortz[0]; b.z1 = (o.z || 0) + o.sortz[1]; }   // per-object band (stair well: below the floor)
    return b;
  };
  function sortBox0(o, part) {
    const P = piece(o);
    const gv = o.variant !== "base" && P.geo_var && P.geo_var[o.variant], ss = W.shownState(o);
    const g = (gv && gv[ss] && gv[ss][part]) || (P.geo && P.geo[ss] && P.geo[ss][part]) || (P.geo && P.geo[o.state] && P.geo[o.state][part]);
    if (g) {          // real geometry extent exported by gen_kit45.py, rotated with the object; footprints refine
      const b = rotRectBox([g[0], g[1], g[3], g[4]], o), fps = W.footprints(o);
      // tree canopies overhang lanes: their sort band starts above the tallest vehicle (bus 3.22 m), so a canopy is
      // always "above" buses / cars / characters passing under it (no canopy-bus-pole cycles)
      const z0 = g[2];
      return { x0: b[0], y0: b[1], x1: b[2], y1: b[3], z0: (o.z || 0) + z0, z1: (o.z || 0) + g[5], polys: fps.length ? fps : (o.rot % 2 ? [SP.footPoly([g[0], g[1], g[3], g[4]], o.rot, o.x, o.y)] : null) };
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
  }
  /** drawable for a character: box = foot circle(s) */
  W.actorBox = function (a) {
    const cs = a.circles();
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [cx, cy, r] of cs) { x0 = Math.min(x0, cx - r); y0 = Math.min(y0, cy - r); x1 = Math.max(x1, cx + r); y1 = Math.max(y1, cy + r); }
    const z = a.z || 0;
    return { x0, y0, x1, y1, z0: z, z1: z + a.height, circles: cs };
  };

  /** geometric front-to-back relation. +1: a in front of b (draw a after b), -1: b in front, 0: unconstrained */
  // walkable roofs: things standing on a building's roof (props tagged on_roof, 李默 at level "roof") are drawn over
  // that building's own modules below the roof line, whatever the ground-box separation says
  const roofOf = (d) => {
    const R = W.data.roof, b = d.box; if (!R || !b || b.z0 < R.z - 0.05) return null;
    const r = R.rect; return b.x0 > r[0] - 0.8 && b.x1 < r[2] + 0.8 && b.y0 > r[1] - 0.8 && b.y1 < r[3] + 0.8 ? "b12" : null;
  };
  W.front = function (a, b) {
    const A = a.box, B = b.box;
    const ra = roofOf(a), rb = roofOf(b);
    if (ra && b.o && b.o.fade_group === ra && A.z0 >= B.z1 - 0.05) return 1;
    if (rb && a.o && a.o.fade_group === rb && B.z0 >= A.z1 - 0.05) return -1;
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
      if (P.layer !== "sorted" || o.carried) continue;
      const st = W.shownState(o), X = SP.sx(o.x, o.y), Y = SP.sy(o.x, o.y, o.z);
      const vr = W.variant(o), bare = P.seasons && SP.season === "winter";
      P.parts.forEach((part, pi) => {
        if (bare && part === "canopy") return;                 // winter: bare branches
        const key = SP.frameKey(o.type, vr, part, st, o.rot);
        if (!key) return;
        const rect = SP.frameRect(key, X, Y);
        if (view && !SP.rectsOverlap(rect, view)) return;
        const box = (o._box && o._box[part + st]) || ((o._box = o._box || {})[part + st] = W.sortBox(o, part));
        const fadeable = !!(P.fadeable || (P.fade_parts && P.fade_parts.includes(part)));
        out.push({ kind: "obj", o, part, key, X, Y, rect, box, depth: (box.x0 + box.x1 + box.y0 + box.y1) / 2, zo: (P.z_order || 0) + pi * 0.01,
                   sid: o.id + "/" + part, fadeable });
      });
      W.overlayDrawables(o, out);
    }
    return out;
  };
  W.overlayDrawables = function (o, out) {
    const P = piece(o);
      for (const ov of o.overlays) if (ov.type === "soot" && ov.active) {
        const c = SP.rotPt([1.5, -0.02, 2.42], o.rot), sx = SP.sx(o.x + c[0], o.y + c[1]), sy = SP.sy(o.x + c[0], o.y + c[1], o.z + c[2]);
        const box = W.sortBox(o, P.parts[0]);
        const f = SP.frame("fx/soot"), rect = { x0: sx - f[4] - 20, y0: sy - f[5] - 20, x1: sx - f[4] + f[2] + 20, y1: sy - f[5] + f[3] + 20 };
        out.push({ kind: "overlay", o, key: "fx/soot", X: sx, Y: sy, rect, box, depth: (box.x0 + box.x1 + box.y0 + box.y1) / 2, zo: (P.z_order || 0) + 0.5,
                   sid: o.id + "/soot", alpha: Math.min(1, ov.t / 3), shear: o.rot === 6 ? 0.5 : -0.5 });
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
      if (SP.player && SP.player.level === "roof" && d.box && d.box.z1 <= SP.player.z + 0.6) continue;   // the building under his feet
      const f = SP.frame(d.key), dx = Math.round(d.X) - f[4], dy = Math.round(d.Y) - f[5];
      if (body.x1 < dx || body.x0 > dx + f[2] || body.y1 < dy || body.y0 > dy + f[3]) continue;
      if (SP.maskHits(d.key, dx, dy, body) >= 3) { hit.add(d.o.fade_group || d.o.id + "/" + d.part); W.fading.push(d.o.id + "/" + d.part); }
    }
    const k = Math.min(1, dt * FADE_RATE), q = (a) => (a > 0.985 ? 1 : Math.round(a * 8) / 8), ch = (W.fadeChanged = []);
    for (const o of W.objects) {
      const P = piece(o);
      if (P.layer !== "sorted" || !(P.fadeable || P.fade_parts)) continue;
      for (const part of P.parts) {
        const on = hit.has(o.fade_group) || hit.has(o.id + "/" + part);
        const fadeable = P.fadeable || (P.fade_parts && P.fade_parts.includes(part));
        const target = Math.min(on && fadeable ? FADE_ALPHA : 1, o.ghost || 1);   // ghost: always half see-through (balcony glass)
        const a = o.alpha[part] == null ? 1 : o.alpha[part];
        const na = Math.abs(target - a) < 0.005 ? target : a + (target - a) * k;
        if (q(na) !== q(a)) ch.push(o.id + "/" + part);
        o.alpha[part] = na;
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
