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
  const FADE_ALPHA = 0.20, FADE_RATE = 9, EPS = 1e-3;
  function piece(o) { return K.pieces[o.type]; }
  SP.piece = piece;
  W.piece = piece;
  /** atlas variant of an object: its geometry variant (weathering / shape), + the season recolour for trees */
  W.variant = function (o) {
    const P = piece(o), se = SP.season || "summer";
    if (P.seasons && se !== "summer" && se !== "winter") return o.variant === "base" ? se : o.variant + "." + se;
    return o.variant;
  };
  /* 【未经Leo确认】 window lights without a modelled household: each window (or modern unit) gets its own schedule per
     night instead of all switching at the same minute — lights come on one by one 17:30–19:40 once it is dark, most go out
     21:30–24:00, ~12% night owls stay up to 00:30–03:00, ~22% early risers switch on 05:00–06:20 until daylight, ~8%
     of flats stay dark that night. Callers still gate on darkness (night > 0.35). Household windows keep their
     shared-rules occupancy (SP.households.windowLit). */
  SP.windowLitAt = function (id, day, min) {
    const h = SP.strHash(String(id)), night = min < 720 ? day - 1 : day, r = (k) => SP.hash(h * 31 + k, night);
    if (r(1) < 0.08) return false;
    const owl = r(2) < 0.12, early = r(3) < 0.22, t = min < 720 ? min + 1440 : min;
    const on = 1050 + r(4) * 130, off = owl ? 1470 + r(5) * 150 : 1290 + r(5) * 150;
    if (t >= on && t < off) return true;
    return early && min < 720 && min >= 300 + r(6) * 80;
  };
  W.shownState = function (o) {
    if (o.type === "f_window" && o.state === "intact" && SP.tint.night > 0.35 && SP.households && !W.interior) {
      const h = SP.households.windowLit(o); if (h !== null) return h ? "lit" : o.state;      // per-household occupancy (shared-rules)
    }
    if (o.type === "f_window" && o.state === "intact" && o.night_lit && SP.tint.night > 0.35) {
      const c = SP.clock;                                         // per-window nightly schedule (SP.windowLitAt)
      return !c || SP.windowLitAt(o.id, c.day, c.min) ? "lit" : o.state;
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
  /** Explicit map focus only: inspect nearby authored tall geometry, never per-frame. */
  W.cameraFocusBounds = function(x,y) {
    const sources = [W.data?.objects || [], ...Object.values(window.SCENE_CHUNKS || {}).filter(Boolean).map(c=>c.objects||[])];
    let box = [SP.sx(x,y),SP.sy(x,y,0),SP.sx(x,y),SP.sy(x,y,0)], tall=false;
    for (const list of sources) for (const o of list) {
      const P=K.pieces[o.type], top=(o.z||0)+(P?.sort_z?.[1]||0);
      if (!P || top<6 || Math.hypot(o.x-x,o.y-y)>24) continue;
      tall=true;const rect=P.sort_box||P.footprint?.[0]||[-.5,-.5,.5,.5];
      for(const p of SP.footPoly(rect,o.rot||0,o.x,o.y))for(const z of [0,top]) {
        const sx=SP.sx(p[0],p[1]),sy=SP.sy(p[0],p[1],z);
        box=[Math.min(box[0],sx),Math.min(box[1],sy),Math.max(box[2],sx),Math.max(box[3],sy)];
      }
    }
    return tall?box:null;
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
  let cellDone = null, cellCols = 0, cellRows = 0, coverBox = null, scanKey = "", scanAt = 0;
  function indexGroundItem(it) {
    W.groundItems.push(it);
    if (!it.rect || !W.groundIdx) return;
    for (let tx = Math.floor(it.rect.x0 / TW); tx <= Math.floor((it.rect.x1 - 1) / TW); tx++)
      for (let ty = Math.floor(it.rect.y0 / TH); ty <= Math.floor((it.rect.y1 - 1) / TH); ty++) {
        const k = tx + "," + ty; let l = W.groundIdx.get(k); if (!l) W.groundIdx.set(k, (l = [])); l.push(it);
      }
  }
  let chunkMap = null, chunkMapData = null;
  function ensureChunkMap() {
    const data = W.data;
    if (chunkMap && chunkMapData === data) return chunkMap;
    chunkMap = new Map(); chunkMapData = data;
    for (const c of (data && data.chunks) || []) chunkMap.set(c.id, c.rect);
    return chunkMap;
  }
  function chunkHits(rect, box) {
    return rect[2] >= box[0] - 96 && rect[0] <= box[2] + 96 && rect[3] >= box[1] - 96 && rect[1] <= box[3] + 96;
  }
  /** true when a streamed chunk's footprint cannot meet this screen rect (base-scene objects are never skipped) */
  W.chunkHidden = function (o, box) {
    if (!box || !o || !o._chunk) return false;
    const rect = ensureChunkMap().get(o._chunk);
    return !!(rect && !chunkHits(rect, box));
  };
  W.viewWorldBox = (view) => (view ? worldBoxOf(view) : null);
  /** screen-px rect -> world AABB that contains every ground point projecting inside it */
  function worldBoxOf(rect) {
    let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
    for (const [X, Y] of [[rect.x0, rect.y0], [rect.x1, rect.y0], [rect.x0, rect.y1], [rect.x1, rect.y1]]) {
      const [x, y] = SP.unproject(X, Y);
      if (x < minx) minx = x; if (y < miny) miny = y; if (x > maxx) maxx = x; if (y > maxy) maxy = y;
    }
    return [minx - 6, miny - 6, maxx + 6, maxy + 6];
  }
  /**
   * Index ground cells that project into `view` (screen px). `budget` caps new cells per call so the first
   * frame does not walk the whole expanded city (~5e5 cells). Manual / small interiors still scan everything
   * inside bakeGround. Returns screen rects that gained sprites (callers dirty cached ground tiles).
   */
  W.coverGround = function (view, budget) {
    const G = W.data && W.data.ground; if (!G || !cellDone) return [];
    budget = budget == null ? 1e9 : budget;
    if (budget <= 0) return [];
    const [X0, Y0] = G.origin, ch = G.chunk;
    let c0 = 0, c1 = G.cols - 1, r0 = 0, r1 = G.rows - 1, box = null;
    if (view) {
      box = worldBoxOf(view);
      if (coverBox && box[0] >= coverBox[0] && box[1] >= coverBox[1] && box[2] <= coverBox[2] && box[3] <= coverBox[3]) return [];
      c0 = Math.max(0, Math.floor((box[0] - X0) / ch)); c1 = Math.min(G.cols - 1, Math.floor((box[2] - X0) / ch));
      r0 = Math.max(0, Math.floor((box[1] - Y0) / ch)); r1 = Math.min(G.rows - 1, Math.floor((box[3] - Y0) / ch));
    }
    const cw = c1 - c0 + 1, rh = r1 - r0 + 1, total = cw * rh;
    if (total <= 0) return [];
    const key = c0 + "," + r0 + "," + c1 + "," + r1;
    // new camera window: start near the middle so the viewport (not the NW corner) fills first
    if (key !== scanKey) { scanKey = key; scanAt = total > 1 ? Math.floor(rh / 2) * cw + Math.floor(cw / 2) : 0; }
    let u = null, n = 0, guard = 0;
    const add = (it) => { indexGroundItem(it); if (!it.rect) return; u = u ? { x0: Math.min(u.x0, it.rect.x0), y0: Math.min(u.y0, it.rect.y0), x1: Math.max(u.x1, it.rect.x1), y1: Math.max(u.y1, it.rect.y1) } : { x0: it.rect.x0, y0: it.rect.y0, x1: it.rect.x1, y1: it.rect.y1 }; };
    while (n < budget && guard < total) {
      const at = scanAt++; if (scanAt >= total) scanAt = 0;
      guard++;
      const r = r0 + Math.floor(at / cw), c = c0 + (at % cw);
      const i = r * G.cols + c; if (cellDone[i]) continue; cellDone[i] = 1; n++;
      const row = G.data_south_to_north[r]; if (!row) continue;
      const code = row[c]; if (!G.legend[code]) continue;
      const [pc, st] = G.legend[code].split(":"), fk = SP.frameKey(pc, "base", "main", st || "default", 0); if (!fk) continue;
      const gx = X0 + c * ch, gy = Y0 + r * ch, X = SP.sx(gx, gy), Y = SP.sy(gx, gy, 0);
      add({ key: fk, X, Y, rect: SP.frameRect(fk, X, Y), o: 0, road: pc === "g_asphalt", g: [gx, gy, ch] });
    }
    if (box && guard >= total) coverBox = coverBox ? [Math.min(coverBox[0], box[0]), Math.min(coverBox[1], box[1]), Math.max(coverBox[2], box[2]), Math.max(coverBox[3], box[3])] : box;
    W.groundVisited = (W.groundVisited || 0) + n;
    return u ? [u] : [];
  };
  W.groundStats = function () {
    const G = W.data && W.data.ground; let indexed = 0;
    if (cellDone) for (let i = 0; i < cellDone.length; i++) indexed += cellDone[i];
    return { cells: G ? G.cols * G.rows : 0, indexed, items: (W.groundItems || []).length };
  };
  W.bakeGround = function () {           // (re)index; cell sprites stream in around the camera unless the grid is small / manual
    const G = W.data.ground, [X0, Y0] = G.origin, ch = G.chunk, X1 = X0 + G.cols * ch, Y1 = Y0 + G.rows * ch;
    W.groundRect = [X0, Y0, X1, Y1];
    W.groundItems = []; W.groundIdx = new Map(); W.groundVisited = 0;
    cellCols = G.cols; cellRows = G.rows; cellDone = new Uint8Array(G.cols * G.rows); coverBox = null; scanKey = ""; scanAt = 0;
    // seasonal ground: fallen leaves (autumn) / blossom petals (spring) under every loaded tree
    const se = SP.season;
    if (se === "autumn" || se === "spring") for (const o of W.objects) {
      if (o.type !== "p_tree") continue;
      for (let i = 0; i < 2; i++) {
        const hh = SP.strHash(o.id) + i * 7, k = `fx/${se === "autumn" ? "leaves" : "petals"}/${hh % 3}`; if (!SP.frame(k)) continue;
        const x = o.x + (SP.hash(hh, 1) - 0.5) * 1.6, y = o.y + (SP.hash(hh, 2) - 0.5) * 1.6, X = SP.sx(x, y), Y = SP.sy(x, y, 0);
        indexGroundItem({ key: k, X, Y, rect: SP.frameRect(k, X, Y), o: 0.5 });
      }
    }
    const flat = W.objects.filter((o) => { const L = piece(o).layer; return L === "decal" || L === "low"; });
    flat.sort((a, b) => (piece(a).layer === "low") - (piece(b).layer === "low") || (b.x + b.y) - (a.x + a.y));
    flat.forEach((o, i) => { const key = SP.frameKey(o.type, o.variant, "main", o.state, o.rot); if (!key) return; const X = SP.sx(o.x, o.y), Y = SP.sy(o.x, o.y, o.z);
                             indexGroundItem({ key, X, Y, rect: SP.frameRect(key, X, Y), o: 1 + i }); });
    const cells = G.cols * G.rows;
    const full = !!(SP.state && SP.state.manual) || !!W.interior || cells <= 20000;
    if (full) W.coverGround(null, 1e9);
    if (SP.layers) SP.layers.groundChanged();
    W.groundTiles = W.groundTiles || new Map(); W.groundTiles.forEach((t) => (t.tint = null));
    W.groundTintKey = gkey();
  };
  const gkey = () => SP.tintKey + "|" + (SP.env ? SP.env.snowLevel() : 0) + "|" + SP.season;
  function groundTile(tx, ty) {
    const k = tx + "," + ty; let t = W.groundTiles.get(k);
    if (t && t.tint === W.groundTintKey) { t.used = SP.frameNo || 0; return t; }
    const list = W.groundIdx.get(k); if (!list) return null;
    if (list.length > 1) list.sort((a, b) => (a.o || 0) - (b.o || 0));
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
    if (view && W.coverGround) W.coverGround(view, (SP.state && SP.state.manual) ? 1e9 : 12000);
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
    if (a.o && b.o && a.o._facadeFrontOf === b.o.id) return 1;
    if (a.o && b.o && b.o._facadeFrontOf === a.o.id) return -1;
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
  /** depth order only. Gesture frames use this instead of the overlap graph (that graph is the pan hitch). */
  W.sortKey = function (list) { list.sort(keyCmp); return list; };
  /** topological painter order of drawables (each needs box, depth, zo, sid, rect) */
  /* perf (zoom-out): the all-pairs overlap scan is O(n^2); a far-zoom tile holds ~10k statics (≈1.2 s per sort on a
     desktop, several seconds on a phone). Large lists find the overlapping pairs through a uniform grid instead.
     Same pairs, same W.front(a, b) calls with a = lower index, behind[] sorted before the DFS -> identical output. */
  const SORT_GRID = 128, SORT_GRID_MIN = 160;
  function sortEdgesGrid(list, n, behind) {
    for (let i = 0; i < n; i++) { const r = list[i].rect; if (!r || !((r.x1 - r.x0) / SORT_GRID < 512 && (r.y1 - r.y0) / SORT_GRID < 512) || !Number.isFinite(r.x0 + r.y0)) return false; }   // odd rect: brute force
    const grid = new Map(), cells = new Array(n);
    for (let i = 0; i < n; i++) {
      const r = list[i].rect, cx0 = Math.floor(r.x0 / SORT_GRID), cx1 = Math.floor(r.x1 / SORT_GRID), cy0 = Math.floor(r.y0 / SORT_GRID), cy1 = Math.floor(r.y1 / SORT_GRID);
      const mine = [];
      for (let cx = cx0; cx <= cx1; cx++) for (let cy = cy0; cy <= cy1; cy++) { const k = (cx + 32768) * 65536 + (cy + 32768); let l = grid.get(k); if (!l) grid.set(k, (l = [])); l.push(i); mine.push(l); }
      cells[i] = mine;
    }
    const seen = new Int32Array(n).fill(-1);
    for (let i = 0; i < n; i++) {
      const a = list[i], ra = a.rect, mine = cells[i];
      for (let c = 0; c < mine.length; c++) {
        const l = mine[c];
        for (let q = 0; q < l.length; q++) {
          const j = l[q]; if (j <= i || seen[j] === i) continue; seen[j] = i;
          const rb = list[j].rect;
          if (!(ra.x0 < rb.x1 && rb.x0 < ra.x1 && ra.y0 < rb.y1 && rb.y0 < ra.y1)) continue;
          const f = W.front(a, list[j]);
          if (f > 0) behind[i].push(j); else if (f < 0) behind[j].push(i);
        }
      }
    }
    return true;
  }
  W.sortDrawables = function (list) {
    W._dl = list;
    list.sort(keyCmp);
    const n = list.length, behind = new Array(n);
    for (let i = 0; i < n; i++) { behind[i] = []; list[i]._i = i; }
    if (!(n >= SORT_GRID_MIN && !W.sortBrute && sortEdgesGrid(list, n, behind))) for (let i = 0; i < n; i++) {
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
  /* perf (far cache, time-sliced): the same sort as W.sortDrawables (same keyCmp order, same grid / brute edges, same
     DFS) as a generator that yields whenever over() says the frame budget is spent. Does not touch W.sortEdges /
     W.sortCycles / W.lastCycle (other sorts run between the slices); returns { out, cycles }. */
  W.sortDrawablesGen = function* (list, over) {
    list.sort(keyCmp);
    const n = list.length, behind = new Array(n);
    for (let i = 0; i < n; i++) behind[i] = [];
    if (over()) yield;
    let grid = n >= SORT_GRID_MIN;
    for (let i = 0; grid && i < n; i++) { const r = list[i].rect; if (!r || !((r.x1 - r.x0) / SORT_GRID < 512 && (r.y1 - r.y0) / SORT_GRID < 512) || !Number.isFinite(r.x0 + r.y0)) grid = false; }
    if (grid) {
      const G = new Map(), cells = new Array(n);
      for (let i = 0; i < n; i++) {
        const r = list[i].rect, cx0 = Math.floor(r.x0 / SORT_GRID), cx1 = Math.floor(r.x1 / SORT_GRID), cy0 = Math.floor(r.y0 / SORT_GRID), cy1 = Math.floor(r.y1 / SORT_GRID), mine = [];
        for (let cx = cx0; cx <= cx1; cx++) for (let cy = cy0; cy <= cy1; cy++) { const k = (cx + 32768) * 65536 + (cy + 32768); let l = G.get(k); if (!l) G.set(k, (l = [])); l.push(i); mine.push(l); }
        cells[i] = mine;
        if ((i & 255) === 255 && over()) yield;
      }
      if (over()) yield;
      const seen = new Int32Array(n).fill(-1);
      for (let i = 0; i < n; i++) {
        if ((i & 15) === 15 && over()) yield;
        const a = list[i], ra = a.rect, mine = cells[i];
        for (let c = 0; c < mine.length; c++) {
          const l = mine[c];
          for (let q = 0; q < l.length; q++) {
            const j = l[q]; if (j <= i || seen[j] === i) continue; seen[j] = i;
            const rb = list[j].rect;
            if (!(ra.x0 < rb.x1 && rb.x0 < ra.x1 && ra.y0 < rb.y1 && rb.y0 < ra.y1)) continue;
            const f = W.front(a, list[j]);
            if (f > 0) behind[i].push(j); else if (f < 0) behind[j].push(i);
          }
        }
      }
    } else for (let i = 0; i < n; i++) {
      if ((i & 15) === 15 && over()) yield;
      const a = list[i], ra = a.rect;
      for (let j = i + 1; j < n; j++) {
        const b = list[j], rb = b.rect;
        if (!(ra.x0 < rb.x1 && rb.x0 < ra.x1 && ra.y0 < rb.y1 && rb.y0 < ra.y1)) continue;
        const f = W.front(a, b);
        if (f > 0) behind[i].push(j); else if (f < 0) behind[j].push(i);
      }
    }
    const state = new Uint8Array(n), out = [];
    let cycles = 0;
    const visit = (i) => {
      if (state[i] === 2) return;
      if (state[i] === 1) { cycles++; return; }
      state[i] = 1;
      const bs = behind[i]; bs.sort((p, q) => p - q);
      for (const j of bs) visit(j);
      state[i] = 2; out.push(list[i]);
    };
    for (let i = 0; i < n; i++) visit(i);
    return { out, cycles };
  };
  /** drawables of static objects (per part) */
  W.drawables = function (out, view) {
    const box = view ? worldBoxOf(view) : null;
    for (const o of W.objects) {
      if (W.chunkHidden(o, box)) continue;
      // cheap reject before frame lookup: the caller expands `view` to cover tall facades (base sits below the screen)
      if (view) {
        const X = SP.sx(o.x, o.y), Y = SP.sy(o.x, o.y, o.z || 0);
        if (X < view.x0 - 640 || X > view.x1 + 640 || Y < view.y0 - 480 || Y > view.y1 + 160) continue;
      }
      if (W.objDrawables(o, out, view)) W.overlayDrawables(o, out);
    }
    return out;
  };
  /** static (per part) drawables of one object (the body of W.drawables; layers.js refreshes single objects with it);
      false = not a sorted object (W.drawables then also skips its overlays, as before) */
  W.objDrawables = function (o, out, view) {
      const P = piece(o);
      if (P.layer !== "sorted" || o.carried) return false;
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
    return true;
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
  const entranceCache = new WeakMap();
  /** A small, world-space approach area also reveals the door the player is trying to use. */
  W.fadeFocus = function(body) {
    const p=SP.player, r={x0:body.x0-12,x1:body.x1+12,y0:body.y0-8,y1:body.y1+12};
    if(!p || W.interior || p.level==='roof')return {rect:r,entrance:null};
    let memo=entranceCache.get(W.objects);
    if(!memo||memo.length!==W.objects.length){memo={length:W.objects.length,entries:W.objects.filter(o=>o.to||/(?:entrance|entry)$/.test(o.interact||''))};entranceCache.set(W.objects,memo);}
    const entries=memo.entries;
    let entrance=null,point=null,best=3.2;
    for(const o of entries){let q;try{q=W.reachPt(o);}catch{continue;}if(!Array.isArray(q)||!q.slice(0,2).every(Number.isFinite))continue;const d=Math.hypot(p.x-q[0],p.y-q[1]);if(d<best){best=d;entrance=o;point=q;}}
    if(entrance){const x=SP.sx(...point),y=SP.sy(point[0],point[1],0);r.x0=Math.min(r.x0,x-42);r.x1=Math.max(r.x1,x+42);r.y0=Math.min(r.y0,y-112);r.y1=Math.max(r.y1,y+20);}
    return {rect:r,entrance};
  };
  /* Street occlusion (【Leo已定】 A10, replaces the whole-building ghost fade outdoors): occluders that really sit between
   * the camera and the player (painter-later + silhouette over his body) get a circular, feather-edged see-through hole
   * centred on him; everything outside the circle stays fully opaque. A usable entrance nearby gets its own smaller
   * circle. Interiors keep the alpha fade (their storefront glass uses the cut frame, A11). Drawing: see_through.js. */
  const SEE_R = 66, SEE_F = 20, SEE_DOOR_R = 46;
  W.SEE = { R: SEE_R, F: SEE_F, DOOR_R: SEE_DOOR_R };
  /** radius is ~150 screen px at any zoom (world px = screen / zoom), clamped for far / very near views */
  W.seeRadius = function () { const z = W.seeZoom || 1; return { r: Math.max(SEE_R, Math.min(190, 150 / z)), f: Math.max(SEE_F, Math.min(40, 30 / z)) }; };
  W.seeCircles = function (body, entrance) {
    const R = W.seeRadius(), C = [{ x: (body.x0 + body.x1) / 2, y: (body.y0 + body.y1) / 2, r: R.r, f: R.f }];
    if (entrance) { let q = null; try { q = W.reachPt(entrance); } catch (e) { q = null; } if (Array.isArray(q) && Number.isFinite(q[0]) && Number.isFinite(q[1])) C.push({ x: SP.sx(q[0], q[1]), y: SP.sy(q[0], q[1], 0) - 40, r: SEE_DOOR_R, f: 16 }); }
    return C;
  };
  W.seeRect = function (body) {
    const f = W.fadeFocus(body), C = W.seeCircles(body, f.entrance);
    let r = f.rect; for (const c of C) r = { x0: Math.min(r.x0, c.x - c.r - 2), y0: Math.min(r.y0, c.y - c.r - 2), x1: Math.max(r.x1, c.x + c.r + 2), y1: Math.max(r.y1, c.y + c.r + 2) };
    return r;
  };
  W.seeThroughOn = function () { return !W.interior && W.seeThroughMode !== "alpha"; };
  /** Reveal the body and a nearby usable entrance, keeping the actual doorway opaque. */
  const FADE_SWEEP = 30, fadeIdx = { objs: null, n: -1, frame: 0, byKey: new Map(), active: new Set() };
  W.updateFade = function (list, playerIdx, body, dt) {
    const hit = new Set(), focus=W.fadeFocus(body), entranceHit=new Set();
    W.fading = [];
    for (let i = 0; i < list.length; i++) {
      const d = list[i];
      if (!d.fadeable || d.o===focus.entrance || (i<=playerIdx&&!focus.entrance)) continue;
      if (SP.player && SP.player.level === "roof" && d.box && d.box.z1 <= SP.player.z + 0.6) continue;   // the building under his feet
      const f = SP.frame(d.key), dx = Math.round(d.X) - f[4], dy = Math.round(d.Y) - f[5];
      const area=focus.rect;
      if (area.x1 < dx || area.x0 > dx + f[2] || area.y1 < dy || area.y0 > dy + f[3]) continue;
      if (SP.maskHits(d.key, dx, dy, area) >= 3) { const key=d.o.fade_group || d.o.id + "/" + d.part;hit.add(key);if(focus.entrance)entranceHit.add(key);W.fading.push(d.o.id + "/" + d.part); }
    }
    const k = Math.min(1, dt * FADE_RATE), q = (a) => (a > 0.985 ? 1 : Math.round(a * 8) / 8), ch = (W.fadeChanged = []);
    const street = W.seeThroughOn();
    if (street) {        // circular see-through hole instead of fading whole buildings (A10)
      const ST = W.seeThrough || (W.seeThrough = { k: 0, keys: new Set(), after: new Set(), circles: [], rect: null, entrance: null });
      if (hit.size) ST.keys = new Set(hit);
      ST.k = hit.size ? ST.k + (1 - ST.k) * k : ST.k * (1 - k); if (ST.k < 0.01) { ST.k = 0; ST.keys = new Set(); }
      ST.entrance = entranceHit.size ? focus.entrance : null;
      ST.circles = W.seeCircles(body, ST.entrance);
      let r = null; for (const c of ST.circles) { const b = { x0: c.x - c.r, y0: c.y - c.r, x1: c.x + c.r, y1: c.y + c.r }; r = r ? { x0: Math.min(r.x0, b.x0), y0: Math.min(r.y0, b.y0), x1: Math.max(r.x1, b.x1), y1: Math.max(r.y1, b.y1) } : b; }
      ST.rect = r; ST.after = new Set(); ST.list = list;
      if (ST.k > 0) for (let i = playerIdx + 1; i < list.length; i++) { const d = list[i]; if (!d || d.kind !== "obj" || !d.fadeable || !d.rect) continue; if (!(ST.keys.has(d.o.fade_group) || ST.keys.has(d.o.id + "/" + d.part))) continue; if (SP.player && SP.player.level === "roof" && d.box && d.box.z1 <= SP.player.z + 0.6) continue; if (d.o.cutaway && SP.openInterior && SP.openInterior.levelOf && SP.openInterior.levelOf(d.o) > 0) continue; if (d.rect.x1 > r.x0 && d.rect.x0 < r.x1 && d.rect.y1 > r.y0 && d.rect.y0 < r.y1) ST.after.add(d); }
    } else if (W.seeThrough) W.seeThrough = null;
    /* perf: the per-frame fade pass used to visit all ~32k objects. Only objects that are hit or not yet at rest
       (alpha != min(1, ghost)) can change, so between full sweeps (every FADE_SWEEP frames, or when the object list
       changes) only those are visited. A full sweep is exactly the old loop. */
    const objs = W.objects, full = fadeIdx.objs !== objs || fadeIdx.n !== objs.length || ++fadeIdx.frame >= FADE_SWEEP;
    let todo = objs;
    if (full) {
      fadeIdx.objs = objs; fadeIdx.n = objs.length; fadeIdx.frame = 0; fadeIdx.byKey = new Map(); fadeIdx.active = new Set();
      for (const o of objs) { const P = piece(o); if (P.layer !== "sorted" || !(P.fadeable || P.fade_parts)) continue;
        const add = (k) => { let l = fadeIdx.byKey.get(k); if (!l) fadeIdx.byKey.set(k, (l = [])); l.push(o); };
        if (o.fade_group) add(o.fade_group); for (const part of P.parts) add(o.id + "/" + part); }
    } else {
      const c = new Set(fadeIdx.active);
      for (const key of hit) for (const o of fadeIdx.byKey.get(key) || []) c.add(o);
      todo = c;
    }
    const act = (fadeIdx.active = new Set());
    for (const o of todo) {
      const P = piece(o);
      if (P.layer !== "sorted" || !(P.fadeable || P.fade_parts)) continue;
      const rest = Math.min(1, o.ghost || 1);
      for (const part of P.parts) {
        const on = hit.has(o.fade_group) || hit.has(o.id + "/" + part);
        const fadeable = P.fadeable || (P.fade_parts && P.fade_parts.includes(part));
        const nearDoor=entranceHit.has(o.fade_group)||entranceHit.has(o.id+"/"+part);
        const target = Math.min(on && fadeable && !street ? (nearDoor?0.125:FADE_ALPHA) : 1, o.ghost || 1);   // ghost: always half see-through (balcony glass)
        const a = o.alpha[part] == null ? 1 : o.alpha[part];
        const na = Math.abs(target - a) < 0.005 ? target : a + (target - a) * k;
        if (q(na) !== q(a)) ch.push(o.id + "/" + part);
        o.alpha[part] = na;
        if (na !== rest) act.add(o);
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
  /** perf: objects that have overlays (smoke / fire / ...), cached per object-list identity + length + overlay pushes
      (W.run "overlay" is the only writer); objects without overlays contribute nothing to the overlay loops */
  const ovC = { objs: null, n: -1, ver: -1, list: [] };
  W.overlayObjs = function () {
    if (ovC.objs !== W.objects || ovC.n !== W.objects.length || ovC.ver !== (W._ovVer || 0)) { ovC.objs = W.objects; ovC.n = W.objects.length; ovC.ver = W._ovVer || 0; ovC.list = W.objects.filter((o) => o.overlays && o.overlays.length); }
    return ovC.list;
  };
  W.updateEvents = function (dt) {
    const due = W.timers.filter((t) => t.at <= SP.now);
    W.timers = W.timers.filter((t) => t.at > SP.now);
    for (const t of due) W.run(t.a);
    for (const o of W.overlayObjs()) for (const ov of o.overlays) { ov.t += dt; ov.active = ov.dur == null || ov.t < ov.dur; }
  };
  /** world point on a facade module in its local frame (bay x along the face, -y out of the wall) */
  W.local = function (o, lx, ly, lz) { const p = SP.rotPt([lx, ly, lz], o.rot); return [o.x + p[0], o.y + p[1], (o.z || 0) + p[2]]; };
  W.run = function (a) {
    const o = a.target && W.byId[a.target];
    switch (a.do) {
      case "set_state": if (o) { o.state = a.state; o._box = null; W.rebuildColliders(); } break;
      case "overlay": if (o) { o.overlays.push({ type: a.overlay, t: 0, dur: a.duration, active: true }); W._ovVer = (W._ovVer || 0) + 1; } break;
      case "decal": W.decals.push({ key: a.frame, x: a.x, y: a.y, t: 0, shear: a.shear || 0 }); break;
      case "fx": if (a.fx === "glass_burst" && o) { const p = W.local(o, 1.5, -0.15, 1.6), n = SP.rotPt([0, -1], o.rot), t = SP.rotPt([1, 0], o.rot); SP.fx.glassBurst(p[0], p[1], p[2], a.n || 24, n, t); } break;
      case "traffic_crash": SP.traffic.crash(a); break;
    }
  };
})(window.SP);
