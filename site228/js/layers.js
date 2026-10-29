/* scene-proto-45 · cached static layers + dynamic regions + LOD (Stage 3).

   The static world (ground, decals, low pieces, static shadows; and every sorted static object part with its snow
   overlay and its emissive pixels) is baked into 512 x 512 px tiles. Tiles exist per LEVEL: level L covers
   512·2^L world px, so far zoom draws a handful of pre-downscaled tiles instead of thousands of sprites
   (level = floor(log2(1/zoom)); the tile is never upscaled more than 1.0 -> crisp near default zoom, smooth far out).
   Three tile layers: G (opaque ground incl. static shadows), O (transparent objects), E (emissive, night only).

   Per frame:  bg canvas  = backdrop + G tiles + ground fx (wet/puddles/footprints/leaves) + reflections + dynamic shadows
               main       = bg + O tiles
               regions    = screen rects of the DYNAMIC drawables (characters, cars, particles, fire, laundry, soot),
                            merged into clusters; each cluster is clipped and fully repainted: bg copy, then every static
                            + dynamic drawable overlapping it in topological painter order (W.sortDrawables). That is the
                            same result as painting the whole frame, at the cost of a few small sorts.
   Invalidation: object state / season / bike moved / lit window -> per-object signature diff -> dirty tile rects
   (rebaked immediately); fading occluders (quantised alpha) -> dirty; global keys (snow amount, shadow strength,
   snow atlas loaded) -> tiles go stale and rebake on a per-frame budget (unlimited in test mode). LRU cap. */
(function (SP) {
  "use strict";
  const Ly = (SP.layers = { stats: { bakes: 0, regions: 0, regionItems: 0, fastFrames: 0 }, budget: 3 });
  const W = SP.world, TS = 512, PAD = 2, CELL = 256, CAP = 56;
  const tiles = new Map();
  let statics = [], sgrid = new Map(), bySid = new Map(), byObj = new Map(), litQ = new Set(), shadows = [], shgrid = new Map(), gitems = [], ggrid = new Map();
  let sigs = new Map(), indexedIds = new Set(), qid = 1, built = false, decalSig = "", decalRects = [], decalSnap = [];
  let staticGen = 1, regionOrder = new Map();
  Ly.need = true; Ly.groundNeed = true;
  const gk = (gx, gy) => (gx + 32768) * 65536 + (gy + 32768);
  function gadd(grid, it, r) {
    for (let gx = Math.floor(r.x0 / CELL); gx <= Math.floor((r.x1 - 1) / CELL); gx++)
      for (let gy = Math.floor(r.y0 / CELL); gy <= Math.floor((r.y1 - 1) / CELL); gy++) {
        const k = gk(gx, gy); let l = grid.get(k); if (!l) grid.set(k, (l = [])); l.push(it);
      }
  }
  function gquery(grid, r, out) {
    const q = ++qid;
    for (let gx = Math.floor(r.x0 / CELL); gx <= Math.floor((r.x1 - 1) / CELL); gx++)
      for (let gy = Math.floor(r.y0 / CELL); gy <= Math.floor((r.y1 - 1) / CELL); gy++) {
        const l = grid.get(gk(gx, gy)); if (!l) continue;
        for (const it of l) if (it._q !== q) { it._q = q; if (SP.rectsOverlap(it.rect, r)) out.push(it); }
      }
    return out;
  }
  const union = (a, b) => (a ? { x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) } : { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 });
  /** quantised alpha used for statics (tile + region agree; a fade costs ~6 rebakes, not 30) */
  const aq = (d) => { const a = d.o.alpha[d.part]; return a == null || a > 0.985 ? 1 : Math.round(a * 8) / 8; };
  Ly.alpha = aq;

  // ---------------- static index ----------------
  function rebuild(view) {
    const all = []; W.drawables(all, view || null);
    statics = []; sgrid = new Map(); bySid = new Map(); byObj = new Map(); litQ.clear();
    const objRect = new Map();
    for (const d of all) {
      if (d.kind !== "obj") continue;
      d.static = true; statics.push(d); gadd(sgrid, d, d.rect); bySid.set(d.sid, d); { let l = byObj.get(d.o); if (!l) byObj.set(d.o, (l = [])); l.push(d); }
      objRect.set(d.o, union(objRect.get(d.o), d.rect));
    }
    const oldSh = shDiff && built ? shadows : null; shDiff = false;
    shadows = []; shgrid = new Map();
    const box = view && W.viewWorldBox ? W.viewWorldBox(view) : null;
    for (const o of W.objects) {
      if (W.chunkHidden && W.chunkHidden(o, box)) continue;
      const P = W.piece(o); if (!P || P.catcher !== "ground" || o.carried) continue;
      if (view) { const X0 = SP.sx(o.x, o.y), Y0 = SP.sy(o.x, o.y, o.z || 0); if (X0 < view.x0 - 200 || X0 > view.x1 + 200 || Y0 < view.y0 - 200 || Y0 > view.y1 + 80) continue; }
      const k = SP.frameKey(o.type, o.variant, P.parts[0], o.state, o.rot) + "#shadow"; if (!SP.frame(k)) continue;
      const X = SP.sx(o.x, o.y), Y = SP.sy(o.x, o.y, o.z), it = { key: k, X, Y, rect: SP.frameRect(k, X, Y), o };
      shadows.push(it); gadd(shgrid, it, it.rect);
    }
    if (oldSh) {       // chunk swap: static shadows that appeared / vanished / changed -> their ground tiles
      const sk = (it) => it.o.id + "|" + it.key + "|" + it.X + "|" + it.Y, nk = new Set(shadows.map(sk)), ok = new Set(oldSh.map(sk));
      for (const it of oldSh) if (!nk.has(sk(it)) && it.rect) dirty(it.rect, "g", 2);
      for (const it of shadows) if (!ok.has(sk(it)) && it.rect) dirty(it.rect, "g", 2);
    }
    // signature diff -> dirty only what changed
    const ns = new Map();
    for (const o of W.objects) {
      if (view && W.chunkHidden && W.chunkHidden(o, box)) { const old = sigs.get(o.id); if (old) ns.set(o.id, old); continue; }
      const P = W.piece(o); if (!P || (P.layer !== "sorted" && P.catcher !== "ground")) continue;
      if (view && !objRect.has(o)) {
        const keep = () => { const old = sigs.get(o.id); if (old) ns.set(o.id, old); };
        if (P.catcher !== "ground") { keep(); continue; }
        const X0 = SP.sx(o.x, o.y), Y0 = SP.sy(o.x, o.y, 0);
        if (X0 < view.x0 - 240 || X0 > view.x1 + 240 || Y0 < view.y0 - 240 || Y0 > view.y1 + 120) { keep(); continue; }
      }
      const r = objRect.get(o) || null;
      const sig = sigOf(o);
      ns.set(o.id, { sig, r });
      if (!built) continue;
      const old = sigs.get(o.id);
      if (!old || old.sig !== sig) { if (old && old.r) dirty(old.r, "og", 40); if (r) dirty(r, "og", 40); }
      else if (view && r && !indexedIds.has(o.id)) dirty(r, "og", 40);   // entered the camera window since the last index
    }
    if (built) for (const [id, old] of sigs) if (!ns.has(id) && old.r) dirty(old.r, "og", 40);
    sigs = ns; indexedIds = new Set(); for (const o of objRect.keys()) if (o && o.id) indexedIds.add(o.id);
    built = true; Ly.need = false; staticGen++; regionOrder.clear(); Ly.stats.rebuilds = (Ly.stats.rebuilds || 0) + 1;
  }
  /** camera window grew: add statics that were outside the previous index. Off-screen ones stay cached until the cap.
      `limit` caps new objects per call so a sudden zoom-out does not hitch the main thread. */
  function expand(view, limit) {
    const box = view && W.viewWorldBox ? W.viewWorldBox(view) : null;
    limit = limit == null ? 1e9 : limit;
    let added = 0, more = false;
    for (const o of W.objects) {
      if (!o || indexedIds.has(o.id)) continue;
      if (W.chunkHidden && W.chunkHidden(o, box)) continue;
      if (view) {
        const X = SP.sx(o.x, o.y), Y = SP.sy(o.x, o.y, o.z || 0);
        if (X < view.x0 - 960 || X > view.x1 + 960 || Y < view.y0 - 720 || Y > view.y1 + 240) continue;
      }
      if (added >= limit) { more = true; break; }
      const nu = [];
      const sorted = W.objDrawables(o, nu, null);
      if (sorted) W.overlayDrawables(o, nu);
      let r = null; const mine = [];
      for (const d of nu) {
        if (d.kind !== "obj") continue;
        d.static = true; statics.push(d); gadd(sgrid, d, d.rect); bySid.set(d.sid, d); mine.push(d); r = union(r, d.rect);
      }
      if (mine.length) byObj.set(o, mine);
      indexedIds.add(o.id); added++;
      const P = W.piece(o);
      if (P && (P.layer === "sorted" || P.catcher === "ground")) {
        const sig = sigOf(o), old = sigs.get(o.id);
        sigs.set(o.id, { sig, r });
        if (!old || old.sig !== sig) { if (old && old.r) dirty(old.r, "og", 40); if (r) dirty(r, "og", 40); }
        else if (r) dirty(r, "og", 40);
      }
      if (P && P.catcher === "ground" && !o.carried) {
        const k = SP.frameKey(o.type, o.variant, P.parts[0], o.state, o.rot) + "#shadow";
        if (SP.frame(k)) {
          const X = SP.sx(o.x, o.y), Y = SP.sy(o.x, o.y, o.z), it = { key: k, X, Y, rect: SP.frameRect(k, X, Y), o };
          shadows.push(it); if (it.rect) gadd(shgrid, it, it.rect);
        }
      }
    }
    if (added) { staticGen++; regionOrder.clear(); }
    Ly.need = more; Ly.stats.expands = (Ly.stats.expands || 0) + 1;
    return !more;
  }
  const sigOf = (o) => (o.carried ? "c" : `${o.state}|${W.shownState(o)}|${W.variant(o)}|${o.x}|${o.y}|${o.rot}|${SP.season === "winter" ? "w" : ""}`);
  /* perf: a lit window / facade switching (checkLit, once per game minute) used to rebuild the whole static index
     (~32k objects, ~50 ms desktop) every couple of seconds at dusk. Now only that object's drawables are replaced,
     with the same signature diff -> the same dirty rects as the full rebuild. */
  function gdel(grid, it, r) {
    for (let gx = Math.floor(r.x0 / CELL); gx <= Math.floor((r.x1 - 1) / CELL); gx++)
      for (let gy = Math.floor(r.y0 / CELL); gy <= Math.floor((r.y1 - 1) / CELL); gy++) {
        const l = grid.get(gk(gx, gy)); if (!l) continue; const i = l.indexOf(it); if (i >= 0) l.splice(i, 1);
      }
  }
  function refreshObjs() {
    const gone = new Set();
    for (const o of litQ) {
      const P = W.piece(o);
      if (!P || P.catcher === "ground" || !W.objects.includes(o)) { Ly.need = true; break; }      // shadows / removed: full rebuild
      const old = byObj.get(o) || [];
      for (const d of old) { gdel(sgrid, d, d.rect); if (bySid.get(d.sid) === d) bySid.delete(d.sid); gone.add(d); }
      const nu = []; W.objDrawables(o, nu, null);
      let r = null; const mine = [];
      for (const d of nu) { if (d.kind !== "obj") continue; d.static = true; statics.push(d); gadd(sgrid, d, d.rect); bySid.set(d.sid, d); mine.push(d); r = union(r, d.rect); }
      byObj.set(o, mine);
      if (P.layer !== "sorted" && P.catcher !== "ground") continue;
      const sig = sigOf(o), prev = sigs.get(o.id);
      if (!prev || prev.sig !== sig) { if (prev && prev.r) dirty(prev.r, "og", 40); if (r) dirty(r, "og", 40); }
      sigs.set(o.id, { sig, r });
    }
    litQ.clear();
    if (gone.size) statics = statics.filter((d) => !gone.has(d));
    staticGen++; regionOrder.clear();
    Ly.stats.refreshes = (Ly.stats.refreshes || 0) + 1;
  }
  /** an object's shown state changed (lit window etc.): refresh just its static drawables */
  Ly.refreshObj = function (o) { if (built && !Ly.need) litQ.add(o); else Ly.need = true; };
  let gSynced = 0;
  function rebuildGround() {
    gitems = (W.groundItems || []).slice(); ggrid = new Map();
    gitems.forEach((it, i) => { it.n = it.o != null ? it.o : i; gadd(ggrid, it, it.rect); });
    gSynced = gitems.length;
    Ly.groundNeed = false; Ly.groundVer = (Ly.groundVer || 0) + 1;
  }
  /** append cells streamed in after the last ground index, without rebuilding the whole grid */
  function syncGroundTail() {
    const all = W.groundItems || [];
    if (Ly.groundNeed || !ggrid) { rebuildGround(); return; }
    for (let i = gSynced; i < all.length; i++) {
      const it = all[i]; it.n = it.o != null ? it.o : i; gitems.push(it); if (it.rect) gadd(ggrid, it, it.rect);
    }
    gSynced = all.length;
  }
  Ly.invalidate = function () { Ly.need = true; };
  /** street chunks streamed in / out: static index rebuild with signature diff + static-shadow diff (see chunks.js) */
  let shDiff = false;
  Ly.chunksChanged = function () { if (!built) { Ly.reset(); return; } Ly.need = true; shDiff = true; };
  Ly.groundChanged = function () { Ly.groundNeed = true; };
  Ly.statics = () => statics;
  /** mark tiles overlapping world-px rect r dirty; which: "o" objects, "g" ground, "og" both; pad px */
  function dirty(r, which, pad) {
    pad = pad || 0;
    for (const t of tiles.values()) {
      const tr = t.r;
      if (r.x1 + pad > tr.x0 && r.x0 - pad < tr.x1 && r.y1 + pad > tr.y0 && r.y0 - pad < tr.y1) {
        if (which.includes("o")) t.od = true;
        if (which.includes("g")) t.gd = true;
      }
    }
  }
  Ly.dirty = dirty;
  Ly.reset = function () { jobs.clear(); for (const t of tiles.values()) for (const c of [t.g, t.o, t.e]) if (c) c.width = c.height = 0; tiles.clear(); built = false; Ly.need = true; Ly.groundNeed = true; sigs = new Map(); indexedIds = new Set(); Ly._covered = null; Ly._prevCx = Ly._prevCy = null; Ly._moveX = Ly._moveY = 0; Ly._holeFill = false; };

  // ---------------- keys ----------------
  function keys() {
    const C = SP.clock, E = SP.env;
    const snowQ = C ? Math.round(C.snow * 24) / 24 : 0;
    const sh = C ? C.shadow * (1 - 0.6 * SP.tint.night) : 0.3;
    Ly.shadowA = Math.round(sh * 40) / 40;
    Ly.snowQ = snowQ;
    return { g: `${Ly.groundVer}|${E ? E.snowLevel() : 0}|${Ly.shadowA}|${SP.tint.night > 0.3 ? 1 : 0}`, o: `${snowQ}|${SP.img.snow ? 1 : 0}` };
  }

  // ---------------- tiles ----------------
  function mk() { const c = document.createElement("canvas"); c.width = c.height = TS + 2 * PAD; return c; }
  function tile(S, tx, ty) {
    const k = S + ":" + tx + ":" + ty;
    let t = tiles.get(k);
    if (!t) {
      const span = TS / S, p = PAD / S;
      t = { k, S, tx, ty, span, r: { x0: tx * span - p, y0: ty * span - p, x1: (tx + 1) * span + p, y1: (ty + 1) * span + p }, g: null, o: null, e: null, gk: null, ok: null, ek: null, gd: false, od: false };
      tiles.set(k, t);
    }
    t.used = SP.frameNo || 0;
    return t;
  }
  function xf(x, t) {
    const s = t.S;
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, TS + 2 * PAD, TS + 2 * PAD);
    x.setTransform(s, 0, 0, s, -t.tx * TS + PAD, -t.ty * TS + PAD);
    x.imageSmoothingEnabled = s < 0.999;
  }
  let maskC = null;
  function bakeG(t, K) {
    const list = gquery(ggrid, t.r, []);
    list.sort((a, b) => a.n - b.n);
    if (!t.g) t.g = mk();
    const x = t.g.getContext("2d"); xf(x, t);
    if (Ly.viewOutside(t.r)) drawBackdrop(x, t.r, t.S);         // distant city, baked like the ground
    for (const it of list) SP.drawFrame(x, it.key, it.X, it.Y);
    const sl = SP.env ? SP.env.snowLevel() : 0;
    if (sl) SP.env.snowFill(x, list, sl, [t.r.x0, t.r.y0, t.r.x1 - t.r.x0, t.r.y1 - t.r.y0]);
    for (const d of W.decals) { const f = SP.frame(d.key); if (!f) continue; const X = SP.sx(d.x, d.y), Y = SP.sy(d.x, d.y, 0); if (X + 200 < t.r.x0 || X - 200 > t.r.x1 || Y + 200 < t.r.y0 || Y - 200 > t.r.y1) continue; SP.drawFrame(x, d.key, X, Y); }
    // static shadows: opaque union in a mask, composited once (no double darkening)
    const sh = gquery(shgrid, t.r, []);
    if (sh.length && Ly.shadowA > 0.005) {
      if (!maskC) maskC = mk();
      const m = maskC.getContext("2d"); xf(m, t);
      for (const it of sh) SP.drawFrame(m, it.key, it.X, it.Y, 1, true);
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = Ly.shadowA; x.drawImage(maskC, 0, 0); x.globalAlpha = 1;
    }
    t.gk = K.g; t.gd = false; Ly.stats.bakes++; Ly.stats.syncBakes = (Ly.stats.syncBakes || 0) + 1;
  }
  function staticsSorted(t) {
    if (t._ord && t._gen === staticGen) return t._ord;
    const list = gquery(sgrid, t.r, []);
    const out = list.length ? W.sortDrawables(list) : list;
    if (list.length) Ly.frameCycles += W.sortCycles;
    t._ord = out; t._gen = staticGen;
    return out;
  }
  function drawStatic(x, d) {
    const a = aq(d);
    if (d.o.cutaway && SP.openInterior && SP.openInterior.drawStatic(x, d, a)) return;     // open interiors: roof hide / 1.1 m cut walls
    SP.drawFrame(x, d.key, d.X, d.Y, a);
    if (SP.households && d.kind === "obj") SP.households.drawPane(x, d, a, false);
    if (Ly.snowQ > 0.01) SP.drawSnow(x, d.key, d.X, d.Y, Ly.snowQ, a);
  }
  function bakeO(t, K, emitOn) {
    const list = staticsSorted(t);
    t.ok = K.o; t.od = false; Ly.stats.bakes++; Ly.stats.syncBakes = (Ly.stats.syncBakes || 0) + 1;
    if (!list.length) { t.oEmpty = true; t.ek = K.o; return; }
    t.oEmpty = false;
    if (!t.o) t.o = mk();
    const x = t.o.getContext("2d"); xf(x, t);
    for (const d of list) drawStatic(x, d);
    if (emitOn) bakeE(t, K, list); else t.ek = null;
  }
  function bakeE(t, K, list) {
    list = list || staticsSorted(t);
    if (!t.e) t.e = mk();
    const x = t.e.getContext("2d"); xf(x, t);
    let any = false;
    if (t.outside == null) t.outside = Ly.viewOutside(t.r);
    if (t.outside) any = drawBackdrop(x, t.r, t.S, true);
    t.eN = Ly.emitSeq(x, list) + (any ? 1 : 0); t.eEmpty = !t.eN; t.ek = K.o;
  }
  /** emissive pass over a painter-ordered list: add emitters, erase emitted pixels covered by later drawables */
  Ly.emitSeq = function (ex, list, holes) {
    const R = [];
    for (const d of list) {
      const oi = d.kind === "obj" && d.o.cutaway && SP.openInterior ? SP.openInterior.emitMode(d) : 0;
      if (oi === 1) continue;
      if (oi === 2) { ex.save(); SP.openInterior.clip(ex, d); }
      let hit = false;
      for (let i = 0; i < R.length; i++) if (SP.rectsOverlap(R[i], d.rect)) { hit = true; break; }
      const a = d.kind === "obj" ? aq(d) : 1;
      const hole = holes && d.kind === "obj" && SP.seeThrough && SP.seeThrough.holed(d);
      if (hit) {
        ex.globalCompositeOperation = "destination-out";
        if (hole) SP.seeThrough.withHole(ex, d, (c) => SP.eraseFrame(c, d.key, d.X, d.Y), "destination-out", a);
        else if (d.kind === "obj" || d.kind === "car") { ex.globalAlpha = a; SP.eraseFrame(ex, d.key, d.X, d.Y); ex.globalAlpha = 1; }
        else if (d.kind === "actor") d.actor.draw(ex);
        else if (d.kind === "laundry") SP.env.drawLaundry(ex, d);
        else if (d.kind === "facadeFan" && SP.households) SP.households.drawFan(ex, d);
        ex.globalCompositeOperation = "source-over";
      }
      const pane = d.kind === "obj" && SP.households && SP.households.paneFacade(d.o);
      if ((d.kind === "obj" || d.kind === "car") && SP.hasEmit(d.key)) { if (hole) SP.seeThrough.withHole(ex, d, (c) => SP.drawEmit(c, d.key, d.X, d.Y, 1), "source-over", a); else SP.drawEmit(ex, d.key, d.X, d.Y, a); R.push(d.rect); }
      if (pane && SP.households.drawPane(ex, d, a, true)) R.push(d.rect);
      if (oi === 2) ex.restore();
    }
    return R.length;
  };
  /* LRU cap: 56 tiles on desktop, 24 on phones (each tile is up to three 516² canvases ≈ 1 MB each); the pinned
     panorama tier and tiles with a queued bake stay */
  Ly.cap = () => (SP.isTouch || (typeof window !== "undefined" && Math.min(window.innerWidth || 1e4, window.innerHeight || 1e4) < 520) ? 24 : CAP);
  function evict() {
    const cap = Ly.cap();
    if (tiles.size <= cap) return;
    const busy = new Set(); for (const j of jobs.values()) busy.add(j.t);
    const old = [...tiles.values()].filter((t) => !t.pin && !busy.has(t)).sort((a, b) => a.used - b.used).slice(0, tiles.size - cap);
    const f = SP.frameNo || 0;
    for (const t of old) { if (t.used >= f) continue; for (const c of [t.g, t.o, t.e]) if (c) c.width = c.height = 0; tiles.delete(t.k); }
  }
  /* tile scale (tile px per world px): 1 at zoom >= 1 (nearest-neighbour upscale: crisp pixel art); below 1, while
     the zoom is moving: the next power of two above (cheap, never upscaled); once it settled: exactly the zoom, so
     tiles blit 1:1 without resampling */
  Ly.level = (z) => Math.max(0, Math.min(6, Math.floor(Math.log2(1 / z) + 1e-6)));
  let lastZ = 0, still = 0;
  const potScale = (z) => (z >= 0.999 ? 1 : 1 / (1 << Ly.level(z)));
  const isPot = (S) => S >= 0.999 || Math.abs(Math.log2(S) - Math.round(Math.log2(S))) < 1e-6;
  /** wheel / pinch / zoom step: keep the current power-of-two tiles and do not sync-bake until the gesture settles */
  Ly.kickGesture = function (ms) {
    if (SP.state && SP.state.manual) return;
    const until = performance.now() + (ms || 360);
    if (!Ly._gestureUntil || until > Ly._gestureUntil) Ly._gestureUntil = until;
    if (Ly._freezeScale == null && SP.cam) Ly._freezeScale = potScale(SP.cam.zoom || 1);
  };
  Ly.inGesture = function () {
    if (SP.state && SP.state.manual) return false;
    if (!Ly._gestureUntil) return false;
    const cam = SP.cam, anim = cam && cam.zt != null && Math.abs(Math.log((cam.zt || cam.zoom) / cam.zoom)) > 0.004;
    if (performance.now() < Ly._gestureUntil || anim) return true;
    Ly._gestureUntil = 0;
    if (!(Ly._releaseLeft > 0)) Ly._freezeScale = null;
    return false;
  };
  Ly.scaleFor = function (z) {
    if (Math.abs(z - lastZ) > 1e-4) { lastZ = z; still = 0; } else still++;
    if (z >= 0.999 && !(Ly._gest && Ly._freezeScale)) return 1;
    const pot = potScale(z);
    if ((Ly._gest || Ly._releaseLeft > 0) && Ly._freezeScale) return Ly._freezeScale;
    if (still >= 8 && z >= Ly.FAR) return Math.round(z * 1000) / 1000;      // settled: exact scale (interactive path time-slices the rebake)
    return pot;
  };
  /** world-px rect whose statics are fully sorted and drawn. Far zoom stays near the camera instead of the whole city.
      Bias the window toward recent camera motion so the ground / buildings ahead of a pan fill first. */
  function indexView(view, z) {
    if (!view) return null;
    const mx = Ly._moveX || 0, my = Ly._moveY || 0;
    const vw = view.x1 - view.x0, vh = view.y1 - view.y0;
    if (z < Ly.FAR) {
      const hx = Math.max(3000, vw * 0.55 + 700), hy = Math.max(2400, vh * 0.55 + 600);
      const cx = (view.x0 + view.x1) / 2 + mx * hx * 0.4, cy = (view.y0 + view.y1) / 2 + my * hy * 0.4;
      return { x0: cx - hx, y0: cy - hy, x1: cx + hx, y1: cy + hy };
    }
    const padX = 900 + Math.abs(mx) * 500;
    const padY0 = 960 + Math.max(0, -my) * 480;
    const padY1 = 5600 + Math.max(0, my) * 480;
    return {
      x0: view.x0 - padX + Math.min(0, mx) * vw * 0.25,
      y0: view.y0 - padY0 + Math.min(0, my) * vh * 0.2,
      x1: view.x1 + padX + Math.max(0, mx) * vw * 0.25,
      y1: view.y1 + padY1 + Math.max(0, my) * vh * 0.2,
    };
  }
  /** grow the live view a bit in the move direction so coverGround / jobs fill what is about to scroll on */
  function leadView(view) {
    if (!view) return view;
    const mx = Ly._moveX || 0, my = Ly._moveY || 0;
    const vw = view.x1 - view.x0, vh = view.y1 - view.y0;
    const px = 320 + Math.abs(mx) * vw * 0.5, py = 320 + Math.abs(my) * vh * 0.5;
    return {
      x0: view.x0 - px + Math.min(0, mx) * vw * 0.4,
      y0: view.y0 - py + Math.min(0, my) * vh * 0.4,
      x1: view.x1 + px + Math.max(0, mx) * vw * 0.4,
      y1: view.y1 + py + Math.max(0, my) * vh * 0.4,
    };
  }
  function trackCamMove(view) {
    if (!view) return;
    const cx = (view.x0 + view.x1) / 2, cy = (view.y0 + view.y1) / 2;
    if (Ly._prevCx != null) {
      const dx = cx - Ly._prevCx, dy = cy - Ly._prevCy, len = Math.hypot(dx, dy);
      if (len > 6) { Ly._moveX = dx / len; Ly._moveY = dy / len; }
      else { Ly._moveX = (Ly._moveX || 0) * 0.82; Ly._moveY = (Ly._moveY || 0) * 0.82; }
    }
    Ly._prevCx = cx; Ly._prevCy = cy;
  }
  const contains = (a, b) => a && b && b.x0 >= a.x0 && b.y0 >= a.y0 && b.x1 <= a.x1 && b.y1 <= a.y1;
  const manualMode = () => !!(SP.state && SP.state.manual);
  /** missing / stale far or in-gesture tiles bake on a budget; tests (?manual=1) stay synchronous */
  function deferTile(t) {
    if (manualMode()) return false;
    if (Ly._gest) return true;
    if (t.S < Ly.FAR) return true;
    if (!isPot(t.S)) return true;
    return false;
  }
  function takeSync(kind) {
    if (manualMode()) return true;
    const key = kind === "o" ? "_syncO" : "_syncG";
    if ((Ly[key] || 0) <= 0) return false;
    Ly[key]--;
    return true;
  }
  /* ---------------- far tiles: time-sliced bakes (perf, zoom-out) ----------------
     A far tile (scale < FAR, ~10k statics) is never baked in one go outside test mode. Missing / dirty / stale far
     layers become jobs (generators) that paint into a staging canvas a few ms per frame and swap in when complete;
     meanwhile the old image stays, or the nearest cached level is shown (four finer tiles, else the crop of a coarser
     one). In idle time a whole-map panorama tier (PANO_S, pinned) and the ZMIN view are pre-baked, so a fresh
     pinch-out always has a fallback. The finished tile is exactly what the synchronous bake would paint. */
  Ly.FAR_REBAKE_MS = 800; Ly.JOB_MS = 8; Ly.IDLE_MS = 2.5; Ly.PANO_S = 1 / 32;
  const jobs = new Map();
  let jobDeadline = 0;
  const over = () => performance.now() > jobDeadline;
  const farDefer = (t) => t.S < Ly.FAR && !(SP.state && SP.state.manual);
  const layerDone = (t, which) => (which === "g" ? !!t.g && t.gk != null : which === "o" ? t.ok != null : !!t.e && t.ek != null);
  const layerCanvas = (t, which) => (which === "g" ? t.g : which === "o" ? (t.oEmpty ? null : t.o) : (t.eEmpty ? null : t.e));
  function* genG(t, K) {
    yield;
    const c = mk(), x = c.getContext("2d"); xf(x, t);
    const list = gquery(ggrid, t.r, []);
    if (over()) yield;
    list.sort((a, b) => a.n - b.n);
    if (over()) yield;
    if (Ly.viewOutside(t.r)) { drawBackdrop(x, t.r, t.S); if (over()) yield; }
    for (let i = 0; i < list.length; i++) { const it = list[i]; SP.drawFrame(x, it.key, it.X, it.Y); if ((i & 31) === 31 && over()) yield; }
    const sl = SP.env ? SP.env.snowLevel() : 0;
    if (sl) { SP.env.snowFill(x, list, sl, [t.r.x0, t.r.y0, t.r.x1 - t.r.x0, t.r.y1 - t.r.y0]); if (over()) yield; }
    for (const d of W.decals) { const f = SP.frame(d.key); if (!f) continue; const X = SP.sx(d.x, d.y), Y = SP.sy(d.x, d.y, 0); if (X + 200 < t.r.x0 || X - 200 > t.r.x1 || Y + 200 < t.r.y0 || Y - 200 > t.r.y1) continue; SP.drawFrame(x, d.key, X, Y); }
    const sh = gquery(shgrid, t.r, []);
    if (sh.length && Ly.shadowA > 0.005) {
      if (over()) yield;
      const mc = mk(), m = mc.getContext("2d"); xf(m, t);
      for (let i = 0; i < sh.length; i++) { const it = sh[i]; SP.drawFrame(m, it.key, it.X, it.Y, 1, true); if ((i & 31) === 31 && over()) yield; }
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = K.shadowA; x.drawImage(mc, 0, 0); x.globalAlpha = 1; mc.width = mc.height = 0;
    }
    return { c };
  }
  function* genO(t) {
    yield;                                                      // start on a fresh frame budget
    let list, cycles = 0;
    if (t._ord && t._gen === staticGen) list = t._ord;
    else {
      list = gquery(sgrid, t.r, []);
      if (over()) yield;
      if (list.length) { const g = W.sortDrawablesGen(list, over); let r; while (!(r = g.next()).done) yield; list = r.value.out; cycles = r.value.cycles; }
      t._ord = list; t._gen = staticGen;
    }
    if (!list.length) return { list, cycles };
    if (over()) yield;
    const c = mk(), x = c.getContext("2d"); xf(x, t);
    for (let i = 0; i < list.length; i++) { drawStatic(x, list[i]); if ((i & 15) === 15 && over()) yield; }
    return { c, list, cycles };
  }
  /* the emissive pass of Ly.emitSeq (tile flavour: no see-through holes) as a generator; covered-emitter rects are kept
     in a grid instead of a flat list (same any-overlap answer, O(n) instead of O(n·emitters) at night) */
  function* emitGen(ex, list) {
    const RG = new Map(), RC = 256; let nR = 0;
    const cells = (r, fn) => { for (let gx = Math.floor(r.x0 / RC); gx <= Math.floor(r.x1 / RC); gx++) for (let gy = Math.floor(r.y0 / RC); gy <= Math.floor(r.y1 / RC); gy++) if (fn(gk(gx, gy))) return true; return false; };
    const finiteR = (r) => Number.isFinite(r.x0 + r.x1 + r.y0 + r.y1) && r.x1 - r.x0 < 1e5 && r.y1 - r.y0 < 1e5;
    const flat = [];                                           // odd (non-finite / huge) rects: checked linearly
    const hitR = (r) => { for (const q of flat) if (SP.rectsOverlap(q, r)) return true; if (!finiteR(r)) { for (const l of RG.values()) for (const q of l) if (SP.rectsOverlap(q, r)) return true; return false; }
      return cells(r, (k) => { const l = RG.get(k); if (l) for (const q of l) if (SP.rectsOverlap(q, r)) return true; return false; }); };
    const addR = (r) => { nR++; if (!finiteR(r)) { flat.push(r); return; } cells(r, (k) => { let l = RG.get(k); if (!l) RG.set(k, (l = [])); l.push(r); return false; }); };
    for (let n = 0; n < list.length; n++) {
      if ((n & 15) === 15 && over()) yield;
      const d = list[n];
      const oi = d.kind === "obj" && d.o.cutaway && SP.openInterior ? SP.openInterior.emitMode(d) : 0;
      if (oi === 1) continue;
      if (oi === 2) { ex.save(); SP.openInterior.clip(ex, d); }
      const hit = nR > 0 && hitR(d.rect);
      const a = d.kind === "obj" ? aq(d) : 1;
      if (hit) {
        ex.globalCompositeOperation = "destination-out";
        if (d.kind === "obj" || d.kind === "car") { ex.globalAlpha = a; SP.eraseFrame(ex, d.key, d.X, d.Y); ex.globalAlpha = 1; }
        else if (d.kind === "actor") d.actor.draw(ex);
        else if (d.kind === "laundry") SP.env.drawLaundry(ex, d);
        else if (d.kind === "facadeFan" && SP.households) SP.households.drawFan(ex, d);
        ex.globalCompositeOperation = "source-over";
      }
      const pane = d.kind === "obj" && SP.households && SP.households.paneFacade(d.o);
      if ((d.kind === "obj" || d.kind === "car") && SP.hasEmit(d.key)) { SP.drawEmit(ex, d.key, d.X, d.Y, a); addR(d.rect); }
      if (pane && SP.households.drawPane(ex, d, a, true)) addR(d.rect);
      if (oi === 2) ex.restore();
    }
    return nR;
  }
  function* genE(t) {
    yield;
    let list = t.list;
    if (!list) { list = gquery(sgrid, t.r, []); if (list.length) { const g = W.sortDrawablesGen(list, over); let r; while (!(r = g.next()).done) yield; list = r.value.out; } }
    const c = mk(), x = c.getContext("2d"); xf(x, t);
    let any = false;
    if (t.outside == null) t.outside = Ly.viewOutside(t.r);
    if (t.outside) { any = drawBackdrop(x, t.r, t.S, true); if (over()) yield; }
    const g = emitGen(x, list); let r; while (!(r = g.next()).done) yield;
    return { c, n: r.value + (any ? 1 : 0) };
  }
  function finish(job, r) {
    const t = job.t, K = job.K; Ly.stats.bakes++; Ly.stats.jobsDone = (Ly.stats.jobsDone || 0) + 1;
    if (tiles.get(t.k) !== t) { if (r.c) r.c.width = r.c.height = 0; return; }         // evicted meanwhile
    t["at" + job.which] = performance.now();
    if (job.which === "g") { if (t.g && t.g !== r.c) t.g.width = t.g.height = 0; t.g = r.c; t.gk = K.g; }
    else if (job.which === "e") { if (t.e && t.e !== r.c) t.e.width = t.e.height = 0; t.e = r.c; t.eN = r.n; t.eEmpty = !r.n; t.ek = K.o; }
    else {
      Ly.frameCycles += r.cycles || 0; t.ok = K.o; t.list = r.list;
      if (!r.c) { t.oEmpty = true; t.ek = K.o; } else { t.oEmpty = false; if (t.o && t.o !== r.c) t.o.width = t.o.height = 0; t.o = r.c; t.ek = t.e ? "stale" : null; }   // stale emissive stays shown until its re-bake
    }
  }
  /** queue (or re-prioritise) a far layer bake; pri 0 = visible & nothing to show, 1 = visible refresh, 2 = idle pre-bake */
  function want(t, which, K, pri) {
    const k = t.k + "|" + which; let j = jobs.get(k);
    if (!j) { j = { k, t, which, K, pri, gen: null, seen: SP.frameNo || 0 }; jobs.set(k, j); }
    else { j.pri = Math.min(j.pri, pri); j.seen = SP.frameNo || 0; }
    return j;
  }
  function startJob(j) {
    const t = j.t; j.K = Object.assign({}, Ly._K || j.K, { shadowA: Ly.shadowA });
    if (j.which === "g") { t.gd = false; j.gen = genG(t, j.K); } else if (j.which === "e") j.gen = genE(t); else { t.od = false; j.gen = genO(t); }
  }
  function stepJob(j) { if (!j.gen) startJob(j); const r = j.gen.next(); if (r.done) { jobs.delete(j.k); finish(j, r.value); return true; } return false; }
  /** run queued far jobs until the frame budget (ms) is spent */
  Ly.runJobs = function (ms) {
    if (!jobs.size) return;
    const f = SP.frameNo || 0;
    for (const j of jobs.values()) if ((tiles.get(j.t.k) !== j.t) || (j.pri < 2 && !j.gen && f - j.seen > 30)) jobs.delete(j.k);   // evicted / scrolled away before it started
    jobDeadline = performance.now() + ms;
    // hole-fill: raise the per-frame finish cap until visible missing tiles clear; gesture stays low so the pinch stays smooth
    let done = 0, cap = manualMode() ? 1e9 : (Ly._gest ? 1 : ((Ly._releaseLeft > 0) ? 4 : (Ly._holeFill ? 3 : 2)));
    while (jobs.size && !over() && done < cap) {
      let best = null; for (const j of jobs.values()) if (!best || j.pri < best.pri || (j.pri === best.pri && !!j.gen && !best.gen)) best = j;
      best.t.used = f; if (stepJob(best)) done++;
    }
  };
  Ly.holeJobs = () => { let n = 0; for (const j of jobs.values()) if (j.pri < 2) n++; return n; };
  Ly.jobCount = () => jobs.size;
  Ly._dbg = { tile, bakeG, bakeO, bakeE, genG, genO, genE, keys, setDeadline: (d) => { jobDeadline = d; } };      // tests / perf probes
  function runNow(j) { const d = jobDeadline; jobDeadline = Infinity; try { while (!stepJob(j)); } finally { jobDeadline = d; } }
  /* fallback picture for a far layer that is not baked yet: four finer tiles if all are there, else the crop of the
     nearest coarser cached tile, else whatever finer tiles exist; false = nothing cached for this area */
  function fallback(ctx, which, S, tx, ty, span) {
    const ok = (t) => t && layerDone(t, which), cv = (t) => layerCanvas(t, which), f = SP.frameNo || 0;
    const kids = [];
    for (let i = 0; i < 4; i++) { const c = tiles.get(S * 2 + ":" + (tx * 2 + (i & 1)) + ":" + (ty * 2 + (i >> 1))); if (ok(c)) kids.push(c); }
    const drawKids = () => { const h = span / 2; for (const c of kids) { c.used = f; const v = cv(c); if (v) ctx.drawImage(v, PAD, PAD, TS, TS, c.tx * h, c.ty * h, h, h); } return true; };
    if (kids.length === 4) return drawKids();
    for (let d = 1, s = S / 2; d <= 6 && s >= 1 / 128; d++, s /= 2) {
      const n = 1 << d, px = Math.floor(tx / n), py = Math.floor(ty / n), pt = tiles.get(s + ":" + px + ":" + py);
      if (!ok(pt)) continue;
      pt.used = f; const v = cv(pt), q = TS / n;
      if (v) ctx.drawImage(v, PAD + (tx - px * n) * q, PAD + (ty - py * n) * q, q, q, tx * span, ty * span, span, span);
      return true;
    }
    const cxw = (tx + 0.5) * span, cyw = (ty + 0.5) * span;
    let best = null, bestD = 1.4;
    for (const pt of tiles.values()) {
      if (!ok(pt) || pt.S === S) continue;
      const ts = TS / pt.S, x0 = pt.tx * ts, y0 = pt.ty * ts;
      if (tx * span < x0 - 0.5 || ty * span < y0 - 0.5 || (tx + 1) * span > x0 + ts + 0.5 || (ty + 1) * span > y0 + ts + 0.5) continue;
      const d = Math.abs(Math.log(pt.S / S));
      if (d < bestD && cxw >= x0 && cxw < x0 + ts && cyw >= y0 && cyw < y0 + ts) { best = pt; bestD = d; }
    }
    if (best) {
      best.used = f; const v = cv(best), ts = TS / best.S;
      if (v) ctx.drawImage(v, PAD + (tx * span - best.tx * ts) * best.S, PAD + (ty * span - best.ty * ts) * best.S, span * best.S, span * best.S, tx * span, ty * span, span, span);
      return true;
    }
    return kids.length ? drawKids() : false;
  }
  function drawFar(ctx, which, t, K, span, tx, ty) {
    const done = layerDone(t, which);
    const stale = done && (which === "g" ? t.gd || t.gk !== K.g : which === "o" ? t.od || t.ok !== K.o : t.ek !== K.o);
    if (!done || (stale && performance.now() - (t["at" + which] || 0) >= Ly.FAR_REBAKE_MS)) want(t, which, K, done ? 1 : 0);
    if (!done && !fallback(ctx, which, t.S, tx, ty, span)) {
      // far tiles never bake inside the frame: one full far tile is the zoom hitch. Near tiles may take one sync bake.
      // exact (non power-of-two) scales stay on the job queue; one sync bake of that grid is the post-gesture hitch
      if (t.S >= Ly.FAR && isPot(t.S) && takeSync(which === "g" ? "g" : "o")) runNow(want(t, which, K, 0));
      else want(t, which, K, 0);
      // coarse stand-in so a fresh pan / pinch is not a pure black hole while the queue catches up
      if (which === "g" && !layerDone(t, "g")) {
        ctx.fillStyle = "#5a5c60"; ctx.fillRect(tx * span, ty * span, span, span); Ly._drewG = true; Ly._usedPlaceholder = true;
      }
    }
    if (!layerDone(t, which)) return;
    const v = layerCanvas(t, which);
    if (v) { ctx.drawImage(v, PAD, PAD, TS, TS, tx * span, ty * span, span, span); if (which === "g") Ly._drewG = true; }
  }
  /** idle pre-bake: the whole map at PANO_S (pinned fallback) and the ZMIN view around the camera centre */
  let panoAt = 0;
  Ly.prebake = function (ccx, ccy, Wd, Hd) {
    if (W.interior || !W.groundRect || (SP.state && SP.state.manual)) return;
    // gesture: only enqueue a coarse ring when the view still has holes; idle path stays paced
    if (Ly._gest && !Ly._holeFill) return;
    if (!Ly._gest && (SP.frameNo || 0) - panoAt < 20) return;
    if (Ly._gest && (SP.frameNo || 0) - panoAt < 8) return;
    panoAt = SP.frameNo || 0; const K = keys();
    const add = (S, r, pin) => { const span = TS / S;
      let n = 0, cap = Ly._holeFill ? 20 : 14;
      for (let tx = Math.floor(r.x0 / span); tx <= Math.floor(r.x1 / span); tx++) for (let ty = Math.floor(r.y0 / span); ty <= Math.floor(r.y1 / span); ty++) {
        if (n++ > cap) return;                                         // never queue the whole expanded city
        const t = tile(S, tx, ty); if (pin) t.pin = true;
        for (const w of ["g", "o"]) if (!layerDone(t, w)) want(t, w, K, Ly._holeFill ? 1 : 2);          // hole-fill bumps priority
      } };
    // one coarser power-of-two around the camera (biased ahead of motion), so a pinch-out has a fallback
    const z = (SP.cam && SP.cam.zoom) || 0.5, coarse = potScale(Math.max(Ly.FAR, z)) / 2;
    const S = Math.max(Ly.PANO_S, coarse), vw = Wd / Math.max(z, 0.28), vh = Hd / Math.max(z, 0.28);
    const mx = Ly._moveX || 0, my = Ly._moveY || 0;
    add(S, { x0: ccx - vw + mx * vw * 0.35, y0: ccy - vh + my * vh * 0.35, x1: ccx + vw + mx * vw * 0.35, y1: ccy + vh + my * vh * 0.35 }, false);
  };
  /** draw one tile layer for the view (world px rect) at level L; bakes what is missing / stale */
  function drawTiles(ctx, which, view, L, K, emitOn) {
    const span = TS / L;
    for (let tx = Math.floor(view.x0 / span); tx <= Math.floor(view.x1 / span); tx++)
      for (let ty = Math.floor(view.y0 / span); ty <= Math.floor(view.y1 / span); ty++) {
        const t = tile(L, tx, ty);
        if (deferTile(t) || (which !== "e" && farDefer(t))) { drawFar(ctx, which === "e" ? "e" : which, t, K, span, tx, ty); if (which === "e" && layerDone(t, "e")) Ly._eN += t.eN || 0; continue; }
        if (which === "g") {
          if (!t.g || t.gd) { if (takeSync("g")) bakeG(t, K); else { want(t, "g", K, 0); fallback(ctx, "g", t.S, tx, ty, span); if (t.g) { ctx.drawImage(t.g, PAD, PAD, TS, TS, tx * span, ty * span, span, span); Ly._drewG = true; } continue; } }
          else if (t.gk !== K.g && Ly._budget-- > 0 && takeSync("g")) bakeG(t, K);
          if (t.g) { ctx.drawImage(t.g, PAD, PAD, TS, TS, tx * span, ty * span, span, span); Ly._drewG = true; }
        } else if (which === "o") {
          if (t.ok == null || t.od) { if (takeSync("o")) bakeO(t, K, emitOn); else { want(t, "o", K, 0); fallback(ctx, "o", t.S, tx, ty, span); if (!t.oEmpty && t.o) ctx.drawImage(t.o, PAD, PAD, TS, TS, tx * span, ty * span, span, span); continue; } }
          else if (t.ok !== K.o && Ly._budget-- > 0 && takeSync("o")) bakeO(t, K, emitOn);
          if (!t.oEmpty && t.o) ctx.drawImage(t.o, PAD, PAD, TS, TS, tx * span, ty * span, span, span);
        } else {
          if (t.outside == null) t.outside = Ly.viewOutside(t.r);
          if (farDefer(t) || deferTile(t)) {                         // far / gesture: time-sliced like g / o (lit windows keep switching)
            if (t.ok == null) { if (layerDone(t, "e")) { Ly._eN += t.eN || 0; const v = layerCanvas(t, "e"); if (v) ctx.drawImage(v, PAD, PAD, TS, TS, tx * span, ty * span, span, span); } continue; }
            if (t.oEmpty && !t.outside) continue;
            if (layerDone(t, "e")) { drawFar(ctx, "e", t, K, span, tx, ty); Ly._eN += t.eN || 0; }
            else { want(t, "e", K, 0); fallback(ctx, "e", t.S, tx, ty, span); }
            continue;
          }
          if (t.oEmpty && !t.outside) continue;
          if (!t.e || t.ek == null || (t.ek !== K.o && Ly._budget-- > 0)) bakeE(t, K);
          Ly._eN += t.eN || 0;
          if (!t.eEmpty) ctx.drawImage(t.e, PAD, PAD, TS, TS, tx * span, ty * span, span, span);
        }
      }
  }

  // ---------------- distant city backdrop (placeholder silhouettes; later: shared-rules CBD tower table) ----------------
  let city = null;
  function buildCity() {
    const [X0, Y0, X1, Y1] = W.groundRect, out = [];
    const rnd = (i, k) => SP.hash(i * 7919 + 13, k);
    const towers = (SP.rules && SP.rules.cbd && SP.rules.cbd.towers) || null;      // real data later (shared-rules)
    const CBD = [X1 + 190, Y1 + 150];                                              // north-east = up-right on screen
    let i = 0;
    for (let gx = X0 - 330; gx < X1 + 330; gx += 24) for (let gy = Y0 - 330; gy < Y1 + 330; gy += 24) {
      i++;
      const w = 9 + rnd(i, 3) * 9, d = 9 + rnd(i, 4) * 9, x = gx + 2 + rnd(i, 1) * (20 - w), y = gy + 2 + rnd(i, 2) * (20 - d);
      if (x + w > X0 - 10 && x < X1 + 10 && y + d > Y0 - 10 && y < Y1 + 10) continue;          // the loaded map + ring road
      if (rnd(i, 9) < 0.12) continue;                                                       // parks / plazas
      const dist = Math.max(X0 - (x + w), x - X1, Y0 - (y + d), y - Y1, 0);
      const cbd = Math.hypot(x - CBD[0], y - CBD[1]) < 110;
      let h = cbd ? 70 + rnd(i, 5) ** 2 * 360 : 10 + rnd(i, 5) * (12 + dist * 0.18) + (rnd(i, 6) < 0.08 ? 30 : 0);
      // in front of the map (south / west = lower on screen): low enough not to hide the street
      const front = x + w < X0 || y + d < Y0;
      if (front && !cbd) h = Math.min(h, 4 + dist * 0.45);
      out.push({ x, y, w, d, h, cbd, s: rnd(i, 7), haze: SP.clamp(dist / 320, 0, 0.75) });
    }
    if (towers) for (const t of towers) out.push({ x: t.x, y: t.y, w: t.w || 30, d: t.d || 30, h: t.h, cbd: true, s: 0.5, haze: 0.3 });
    out.sort((a, b) => (b.x + b.y) - (a.x + a.y));
    city = out;
  }
  const inMap = (wx, wy) => { const [X0, Y0, X1, Y1] = W.groundRect; return wx >= X0 && wx <= X1 && wy >= Y0 && wy <= Y1; };
  const unproj = (X, Y) => { const a = X / SP.KX, b = -Y / SP.KY; return [(a + b) / 2, (b - a) / 2]; };
  /** true when part of the rect is beyond the loaded map */
  Ly.viewOutside = (v) => !W.interior && ![[v.x0, v.y0], [v.x1, v.y0], [v.x0, v.y1], [v.x1, v.y1]].every(([X, Y]) => { const [x, y] = unproj(X, Y); return inMap(x, y); });
  const HAZE = [170, 176, 186];
  const hz = (c, k) => `rgb(${Math.round(SP.lerp(c[0], HAZE[0], k))},${Math.round(SP.lerp(c[1], HAZE[1], k))},${Math.round(SP.lerp(c[2], HAZE[2], k))})`;
  /** placeholder distant city (flat-shaded prisms + street grid); emit = lit-window speckle for the emissive layer */
  function drawBackdrop(x, r, sc, emit) {
    if (!city) buildCity();
    const [X0, Y0, X1, Y1] = W.groundRect;
    if (!emit) {
      x.fillStyle = "#6a6c70"; x.fillRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
      x.strokeStyle = "#8a8a88"; x.lineWidth = 7 * 32 / 20;
      x.beginPath();
      for (let g = X0 - 334; g < X1 + 334; g += 24) { x.moveTo(SP.sx(g, Y0 - 334), SP.sy(g, Y0 - 334, 0)); x.lineTo(SP.sx(g, Y1 + 334), SP.sy(g, Y1 + 334, 0)); }
      for (let g = Y0 - 334; g < Y1 + 334; g += 24) { x.moveTo(SP.sx(X0 - 334, g), SP.sy(X0 - 334, g, 0)); x.lineTo(SP.sx(X1 + 334, g), SP.sy(X1 + 334, g, 0)); }
      x.stroke();
    }
    let any = false;
    for (const b of city) {
      const { x: bx, y: by, w, d, h } = b;
      const A = SP.scr(bx, by + d, 0), B = SP.scr(bx + w, by + d, 0), Cc = SP.scr(bx + w, by, 0), D = SP.scr(bx, by, 0);
      const ht = h * SP.PZ;
      if (B[0] < r.x0 || D[0] > r.x1 && A[0] > r.x1 || B[1] - ht > r.y1 || Math.max(A[1], D[1], Cc[1]) < r.y0) { if (Math.max(A[0], B[0], Cc[0], D[0]) < r.x0 || Math.min(A[0], B[0], Cc[0], D[0]) > r.x1 || Math.min(A[1], B[1], Cc[1], D[1]) - ht > r.y1 || Math.max(A[1], D[1], Cc[1]) < r.y0) continue; }
      if (emit) {
        const rows = Math.min(90, Math.floor(h / 3.2)), cols = Math.max(2, Math.round(w / 3));
        for (const [P0, P1, side] of [[D, Cc, 0], [A, D, 1]]) for (let rr = 1; rr < rows; rr++) for (let c = 0; c < cols; c++) {
          if (SP.hash(rr * 31 + c * 7 + side * 977 + Math.floor(b.s * 1e4), 3) > (b.cbd ? 0.5 : 0.32)) continue;
          const t = (c + 0.5) / cols, px = SP.lerp(P0[0], P1[0], t), py = SP.lerp(P0[1], P1[1], t) - rr * 3.2 * SP.PZ;
          x.fillStyle = b.cbd ? "rgba(214,232,255,0.8)" : "rgba(255,206,138,0.75)"; x.fillRect(px - 9, py - 12, 18, 14); any = true;
        }
        continue;
      }
      const k = b.haze, base = b.cbd ? [[150, 178, 206], [104, 128, 160], [196, 214, 230]] : [[150, 138, 128], [112, 104, 100], [178, 170, 160]];
      x.fillStyle = hz(base[0], k); x.beginPath(); x.moveTo(A[0], A[1]); x.lineTo(D[0], D[1]); x.lineTo(D[0], D[1] - ht); x.lineTo(A[0], A[1] - ht); x.fill();
      x.fillStyle = hz(base[1], k); x.beginPath(); x.moveTo(D[0], D[1]); x.lineTo(Cc[0], Cc[1]); x.lineTo(Cc[0], Cc[1] - ht); x.lineTo(D[0], D[1] - ht); x.fill();
      x.fillStyle = hz(base[2], k); x.beginPath(); x.moveTo(A[0], A[1] - ht); x.lineTo(B[0], B[1] - ht); x.lineTo(Cc[0], Cc[1] - ht); x.lineTo(D[0], D[1] - ht); x.fill();
      if (b.cbd && sc > 0.05) {        // glass towers: vertical mullion bands
        x.fillStyle = hz([84, 104, 134], k);
        for (let c = 1; c < 6; c++) { const t = c / 6, px = SP.lerp(D[0], Cc[0], t), py = SP.lerp(D[1], Cc[1], t); x.fillRect(px - 2, py - ht, 4, ht); }
      }
    }
    return any;
  }

  // ---------------- per-frame render ----------------
  const bg = document.createElement("canvas"), bx = bg.getContext("2d");
  const sc = document.createElement("canvas"), sx = sc.getContext("2d");
  const em = document.createElement("canvas"), ex = em.getContext("2d");
  Ly.FAR = 0.3;        // below: vehicles / NPCs / animals are not drawn at all (still simulated), no occlusion regions; the player is a marker (main.js)
  Ly.FADE_TO = 0.38;   // FAR..FADE_TO: the dynamic regions cross-fade to the static picture (no pop at the threshold)
  /** 1 = dynamics fully drawn, 0 = hidden */
  Ly.dynVis = (z) => (z >= Ly.FADE_TO ? 1 : z <= Ly.FAR ? 0 : (z - Ly.FAR) / (Ly.FADE_TO - Ly.FAR));
  const fadeC = document.createElement("canvas"), fadeX = fadeC.getContext("2d");
  /** dynamic drawables (everything that moves or animates) overlapping view */
  Ly.dynamics = function (view, actorDrawable) {
    const all = [];
    if (!W.interior) SP.traffic.drawables(all);            // indoors: the street's cars / bus are never drawn (they keep their street coords)
    SP.fx.drawables(all); SP.env.drawables(all);
    if (SP.households) SP.households.fanDrawables(all,view);
    for (const o of W.overlayObjs()) if (o.overlays.length) { const tmp = []; W.overlayDrawables(o, tmp); for (const d of tmp) all.push(d); }
    for (const a of SP.actors.list) if (!a.hidden) all.push(actorDrawable(a));
    return all.filter((d) => SP.rectsOverlap(d.rect, view));
  };
  function clusters(dyn) {
    const R = dyn.map((d) => {const focus=d.actor?.isPlayer&&d.actor.bodyRect&&(W.seeThroughOn?.()&&W.seeRect?W.seeRect(d.actor.bodyRect()):W.fadeFocus?.(d.actor.bodyRect()).rect),r=focus?{x0:Math.min(d.rect.x0,focus.x0),x1:Math.max(d.rect.x1,focus.x1),y0:Math.min(d.rect.y0,focus.y0),y1:Math.max(d.rect.y1,focus.y1)}:d.rect;return { x0: Math.floor(r.x0) - 2, y0: Math.floor(r.y0) - 2, x1: Math.ceil(r.x1) + 2, y1: Math.ceil(r.y1) + 2, items: [d] };});
    let merged = true;
    while (merged) {
      merged = false;
      for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
        const a = R[i], b = R[j];
        if (a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1) {
          a.x0 = Math.min(a.x0, b.x0); a.y0 = Math.min(a.y0, b.y0); a.x1 = Math.max(a.x1, b.x1); a.y1 = Math.max(a.y1, b.y1);
          a.items.push(...b.items); R.splice(j, 1); j--; merged = true;
        }
      }
    }
    return R;
  }
  function drawDyn(ctx, d) {
    const CK = SP.clock, snow = CK.snow;
    if (d.kind === "obj") { if (SP.seeThrough && SP.seeThrough.holed(d)) SP.seeThrough.drawObj(ctx, d, drawStatic); else drawStatic(ctx, d); }
    else if (d.kind === "overlay") SP.drawFrame(ctx, d.key, d.X, d.Y, d.alpha);
    else if (d.kind === "car") { if (!SP.npcConflict?.drawCar(ctx,d)) SP.drawFrame(ctx, d.key, d.X, d.Y); if (snow > 0.01) SP.drawSnow(ctx, d.key, d.X, d.Y, snow * (d.car && d.car.v > 0.5 ? 0.5 : 1)); }
    else if (d.kind === "animalSign") SP.animals?.drawSign(ctx,d);
    else if (d.kind === "weaponPickup") SP.npcConflict?.drawPickup(ctx,d);
    else if (d.kind === "part") SP.fx.drawPart(ctx, d.p);
    else if (d.kind === "fire") SP.fx.drawFire(ctx, d.o, d.ov);
    else if (d.kind === "laundry") SP.env.drawLaundry(ctx, d);
    else if (d.kind === "facadeFan") SP.households.drawFan(ctx,d);
    else if (d.kind === "actor") d.actor.draw(ctx);
  }
  Ly.drawDyn = drawDyn;
  Ly.viewReady = () => !!Ly._viewReady;
  /* Zoom-bucket composites. A settled frame stores the static picture (ground + object tiles, before HUD / light)
     in the nearest power-of-two zoom bucket. While a pinch or drag is in flight, that picture is blitted scaled
     and shifted instead of resampling every tile; a few rim tiles are drawn and the rest are queued so the rebake
     spreads across later frames. On settle the normal tile path runs and a clean frame replaces the bucket. */
  const ZSHOTS = [1, 0.5, 0.25, 0.125, 0.0625];
  const zoomShots = new Map();
  function zoomKey(z) {
    let best = ZSHOTS[0], bd = Infinity;
    const lz = Math.log(Math.max(z, 0.02));
    for (const s of ZSHOTS) { const d = Math.abs(Math.log(s) - lz); if (d < bd) { bd = d; best = s; } }
    return best;
  }
  function shotCover(b, cx, cy, z, Wd, Hd) {
    const vx0 = cx, vy0 = cy, vx1 = cx + Wd / z, vy1 = cy + Hd / z;
    const bx1 = b.cx + b.w / b.z, by1 = b.cy + b.h / b.z;
    const ox = Math.max(0, Math.min(vx1, bx1) - Math.max(vx0, b.cx));
    const oy = Math.max(0, Math.min(vy1, by1) - Math.max(vy0, b.cy));
    const a = (vx1 - vx0) * (vy1 - vy0);
    return a > 0 ? (ox * oy) / a : 0;
  }
  function pickZoomShot(z, cx, cy, Wd, Hd) {
    let best = null, bestC = 0;
    for (const b of zoomShots.values()) {
      const scale = z / Math.max(b.z, 1e-3);
      if (scale < 0.16 || scale > 6) continue;
      const c = shotCover(b, cx, cy, z, Wd, Hd);
      if (c > bestC) { best = b; bestC = c; }
    }
    return best && bestC >= 0.02 ? best : null;
  }
  function blitZoomShot(ctx, b, cx, cy, z) {
    const dx = (b.cx - cx) * z, dy = (b.cy - cy) * z, dw = b.w * z / b.z, dh = b.h * z / b.z;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "low";
    ctx.drawImage(b.canvas, dx, dy, dw, dh);
    ctx.restore();
  }
  function captureZoomShot(canvas, z, cx, cy) {
    if (manualMode() || Ly._gest || W.interior || Ly._usedPlaceholder || !Ly._drewG) return;
    const key = zoomKey(z);
    let shot = zoomShots.get(key);
    const vw = canvas.width / Math.max(z, 0.02);
    if (shot && shot.w === canvas.width && Math.abs(shot.z - z) / z < 0.06 && Math.hypot(shot.cx - cx, shot.cy - cy) < vw * 0.1) return;
    if (!shot) {
      const c = document.createElement("canvas");
      shot = { canvas: c, g: c.getContext("2d") };
      zoomShots.set(key, shot);
    }
    if (shot.canvas.width !== canvas.width || shot.canvas.height !== canvas.height) {
      shot.canvas.width = canvas.width; shot.canvas.height = canvas.height;
    }
    shot.g.setTransform(1, 0, 0, 1, 0, 0);
    shot.g.drawImage(canvas, 0, 0);
    shot.z = z; shot.cx = cx; shot.cy = cy; shot.w = canvas.width; shot.h = canvas.height;
    Ly.stats.zoomShots = (Ly.stats.zoomShots || 0) + 1;
  }
  /** draw at most `cap` tiles outside the baked shot, and queue the rest so bake work stays spread across frames */
  function spreadRim(gctx, view, L, K, shot, cap) {
    if (!view || !shot) return;
    const span = TS / L;
    const world = { x0: shot.cx, y0: shot.cy, x1: shot.cx + shot.w / shot.z, y1: shot.cy + shot.h / shot.z };
    let drawn = 0;
    for (let tx = Math.floor(view.x0 / span); tx <= Math.floor(view.x1 / span); tx++)
      for (let ty = Math.floor(view.y0 / span); ty <= Math.floor(view.y1 / span); ty++) {
        const x0 = tx * span, y0 = ty * span, x1 = x0 + span, y1 = y0 + span;
        if (x0 >= world.x0 && y0 >= world.y0 && x1 <= world.x1 && y1 <= world.y1) continue;
        const t = tile(L, tx, ty);
        if (drawn < cap && gctx) {
          if (layerDone(t, "g")) {
            const v = layerCanvas(t, "g");
            if (v) gctx.drawImage(v, PAD, PAD, TS, TS, x0, y0, span, span);
          } else fallback(gctx, "g", t.S, tx, ty, span);
          drawn++;
        }
        if (!layerDone(t, "g")) want(t, "g", K, 0);
        if (!layerDone(t, "o")) want(t, "o", K, 1);
      }
  }
  /** enqueue the visible grid while a zoom shot is on screen, so the rebake is already sliced before the shot drops */
  function queueView(view, L, K) {
    if (!view || !K) return;
    const span = TS / L;
    let n = 0;
    for (let tx = Math.floor(view.x0 / span); tx <= Math.floor(view.x1 / span); tx++)
      for (let ty = Math.floor(view.y0 / span); ty <= Math.floor(view.y1 / span); ty++) {
        if (n++ > 24) return;
        const t = tile(L, tx, ty);
        if (!layerDone(t, "g")) want(t, "g", K, 0);
        if (!layerDone(t, "o")) want(t, "o", K, 1);
      }
  }
  /** full frame. o = {canvas, ctx, z, cx, cy, view, player, actorDrawable, dt, shadowDyn(sctx)} -> {list for player region, pi} */
  Ly.render = function (o) {
    const { canvas, ctx, z, cx, cy, view } = o, Wd = canvas.width, Hd = canvas.height, E = SP.env;
    const manual = manualMode();
    const gestNow = Ly.inGesture();
    if (!manual && Ly._gest && !gestNow) {
      Ly._settleLeft = 14; Ly._releaseLeft = 12;
      // bake the power-of-two grid for the zoom we landed on. Keeping the pre-pinch scale
      // queues a close-in grid over the whole zoomed-out view and the hole queue never drains.
      const pot = potScale(z);
      if (!(Ly._freezeScale > 0) || Math.abs(Math.log(Ly._freezeScale / pot)) > 0.2) Ly._freezeScale = pot;
      for (const j of jobs.values()) if (Math.abs(j.t.S - pot) > 1e-4 && j.pri < 2) j.pri = 2;
    }
    if (gestNow) { Ly._settleLeft = 0; Ly._releaseLeft = 0; }
    Ly._gest = gestNow;
    const settling = Ly._settleLeft > 0;
    const release = Ly._releaseLeft > 0;
    Ly.frameCycles = 0; Ly._drewG = false; Ly._usedPlaceholder = false;
    trackCamMove(view);
    const warm = !manual && !Ly._viewReady;
    const holes = !manual && Ly.holeJobs() > 0;
    const expandingSoon = !manual && view && !contains(Ly._covered, z < Ly.FAR ? indexView(view, z) : leadView(view));
    Ly._holeFill = !manual && (holes || expandingSoon || warm);
    // gesture and the frames just after release: no sync bake. One full tile on that frame is the ~70ms hitch.
    const paced = Ly._gest || release;
    Ly._budget = manual ? 1e9 : (paced ? 0 : (Ly._holeFill ? Math.max(Ly.budget, 3) : Ly.budget));
    Ly._syncG = manual ? 1e9 : (paced ? 0 : (warm ? 6 : (Ly._holeFill ? 2 : 2)));
    Ly._syncO = manual ? 1e9 : (paced ? 0 : (warm ? 4 : (Ly._holeFill ? 1 : 1)));
    if (!manual && W.coverGround && view) {
      const base = leadView(view);
      const gv = z < Ly.FAR ? indexView(base, z) : base;
      const expanding = !contains(Ly._covered, gv);
      let bud;
      if (Ly._gest) bud = expanding ? 160 : 80;                  // keep the gesture frame for blits, not a ground walk
      else if (release) bud = expanding ? 220 : 120;
      else if (warm) bud = 5000;
      else if (expanding || Ly._holeFill) bud = 2800;
      else bud = 1800;
      const rects = W.coverGround(gv, bud);
      if (rects && rects.length) Ly._streamRects = rects;
    }
    if (Ly.groundNeed) rebuildGround();
    else if (!manual) syncGroundTail();
    if (Ly._streamRects) { for (const r of Ly._streamRects) dirty(r, "g", 8); Ly._streamRects = null; }
    if (!Ly.need && litQ.size) { if (litQ.size > 64) Ly.need = true; else refreshObjs(); }
    if ((Ly._gest || release) && built) {
      // gesture and the frames just after it: only expand the static index — no full rebuild hitch
      if (!manual && view) {
        const iv = indexView(leadView(view), z);
        if (!contains(Ly._covered, iv)) {
          const cap = Ly._gest ? (Ly._holeFill ? 60 : 40) : 90;
          const done = expand(iv, cap);
          if (done) { const pad = 520; Ly._covered = { x0: iv.x0 - pad, y0: iv.y0 - pad, x1: iv.x1 + pad, y1: iv.y1 + pad }; }
        }
      }
    } else {
      if (!manual && view) {
        const iv = indexView(leadView(view), z);
        if (!contains(Ly._covered, iv)) { Ly.need = true; Ly._pendingView = iv; }
      }
      if (Ly.need) {
        const v = manual ? null : (Ly._pendingView || (view ? indexView(leadView(view), z) : null));
        if (!manual && v && built && !shDiff && litQ.size === 0 && statics.length < 16000) {
          const done = expand(v, Ly._holeFill || warm ? 420 : 260);
          Ly._pendingView = done ? null : v;
          if (done) { const pad = 520; Ly._covered = { x0: v.x0 - pad, y0: v.y0 - pad, x1: v.x1 + pad, y1: v.y1 + pad }; }
        } else {
          rebuild(v);
          Ly._pendingView = null;
          if (!manual && v) { const pad = 520; Ly._covered = { x0: v.x0 - pad, y0: v.y0 - pad, x1: v.x1 + pad, y1: v.y1 + pad }; }
          else Ly._covered = null;
        }
      }
    }
    // decals changed? (pushed / filtered anywhere) -> dirty their ground tiles
    // cheap no-allocation check first: same decal objects with the same key / position as last frame -> signature unchanged
    let dSame = W.decals.length === decalSnap.length / 3;
    for (let i = 0; dSame && i < W.decals.length; i++) { const d = W.decals[i]; if (d.key !== decalSnap[i * 3] || d.x !== decalSnap[i * 3 + 1] || d.y !== decalSnap[i * 3 + 2]) dSame = false; }
    const ds = dSame ? decalSig : W.decals.length + ":" + W.decals.map((d) => d.key + d.x + "," + d.y).join(";");
    if (!dSame) { decalSnap = []; for (const d of W.decals) decalSnap.push(d.key, d.x, d.y); }
    if (ds !== decalSig) {
      const nr = W.decals.map((d) => { const X = SP.sx(d.x, d.y), Y = SP.sy(d.x, d.y, 0); return SP.frameRect(d.key, X, Y); }).filter(Boolean);
      for (const r of decalRects.concat(nr)) dirty(r, "g", 4);
      decalSig = ds; decalRects = nr;
    }
    const K = (Ly._K = keys()), L = Ly.scaleFor(z), far = z < Ly.FAR, smooth = z < 0.999;
    if (bg.width !== Wd || bg.height !== Hd) { bg.width = Wd; bg.height = Hd; sc.width = Wd; sc.height = Hd; }
    // dynamic drawables + regions first (the player's region decides occluder fading before tiles are drawn)
    W.seeZoom = z;
    const dyn = far ? [] : Ly.dynamics(view, o.actorDrawable);      // far: nothing dynamic is drawn -> not even collected
    const regs = far ? [] : clusters(dyn);
    let plist = [], pi = -1;
    for (const R of regs) {
      const list = gquery(sgrid, R, []).concat(R.items);
      if (Ly._gest && W.sortKey) R.list = W.sortKey(list);
      else {
        const q = 16;
        let sig = staticGen + ":" + list.length;
        for (const d of R.items) sig += "|" + (d.sid || d.kind) + ":" + ((d.rect.x0 / q) | 0) + ":" + ((d.rect.y0 / q) | 0);
        const prev = regionOrder.get(sig);
        let reused = null;
        if (prev && prev.length === list.length) {
          const by = new Map();
          for (const d of list) if (!by.has(d.sid)) by.set(d.sid, d);
          if (by.size === list.length) {
            const out = []; let ok = true;
            for (const sid of prev) { const d = by.get(sid); if (!d) { ok = false; break; } out.push(d); }
            if (ok) reused = out;
          }
        }
        if (reused) R.list = reused;
        else {
          R.list = W.sortDrawables(list); Ly.frameCycles += W.sortCycles;
          regionOrder.set(sig, R.list.map((d) => d.sid));
          if (regionOrder.size > 32) regionOrder.clear();
        }
      }
      const k = R.list.findIndex((d) => d.kind === "actor" && d.actor === o.player);
      if (k >= 0) { plist = R.list; pi = k; }
    }
    W.updateFade(plist, pi, o.player.bodyRect(), o.dt);
    for (const sid of W.fadeChanged || []) { const d = bySid.get(sid); if (d) dirty(d.rect, "o", 1); }
    if (SP.openInterior) SP.openInterior.update(o.player, o.dt, z);       // open/close street interiors: dirties only their own rect
    // ---- bg: backdrop, ground tiles, ground fx, reflections, dynamic shadows
    bx.setTransform(1, 0, 0, 1, 0, 0); bx.imageSmoothingEnabled = false;
    bx.fillStyle = "#17181d"; bx.fillRect(0, 0, Wd, Hd);
    const zoomShot = !manual && !W.interior ? pickZoomShot(z, cx, cy, Wd, Hd) : null;
    const zoomFast = !!(zoomShot && (Ly._gest || settling));
    if (settling) Ly._settleLeft = zoomFast ? Ly._settleLeft - 1 : Math.max(0, Ly._settleLeft - 2);
    const lights = E.lights(view, z);
    if (zoomFast) {
      blitZoomShot(bx, zoomShot, cx, cy, z);
      bx.setTransform(z, 0, 0, z, -cx * z, -cy * z);
      bx.imageSmoothingEnabled = smooth; bx.imageSmoothingQuality = "low";
      const cover = shotCover(zoomShot, cx, cy, z, Wd, Hd);
      spreadRim(bx, view, L, K, zoomShot, cover < 0.45 ? 4 : 2);
      queueView(view, L, K);
      Ly._drewG = true;
      Ly.stats.fastFrames = (Ly.stats.fastFrames || 0) + 1;
    } else {
      bx.setTransform(z, 0, 0, z, -cx * z, -cy * z);
      bx.imageSmoothingEnabled = smooth; bx.imageSmoothingQuality = "low";
      drawTiles(bx, "g", view, L, K);
      if (SP.place && W.interior) SP.place.drawBehind(bx, view);        // live outside view behind the window holes (floor seen there lies behind the wall)
      E.drawGround(bx, view, z);
      E.drawReflections(bx, lights, view);
      if (!far) {
        sx.setTransform(1, 0, 0, 1, 0, 0); sx.clearRect(0, 0, Wd, Hd); sx.imageSmoothingEnabled = smooth;
        sx.setTransform(z, 0, 0, z, -cx * z, -cy * z);
        o.shadowDyn(sx);
        bx.save(); bx.setTransform(1, 0, 0, 1, 0, 0); bx.globalAlpha = Ly.shadowA; bx.drawImage(sc, 0, 0); bx.restore();
      }
    }
    // ---- main: bg + object tiles + regions
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(bg, 0, 0);
    ctx.setTransform(z, 0, 0, z, -cx * z, -cy * z);
    ctx.imageSmoothingEnabled = smooth; ctx.imageSmoothingQuality = "low";
    const emitOn = E.night > 0.02;
    if (!zoomFast) {
      drawTiles(ctx, "o", view, L, K, emitOn);
      captureZoomShot(canvas, z, cx, cy);
    }
    let items = 0;
    const vis = Ly.dynVis(z);
    if (vis < 1 && regs.length) {            // snapshot of the static picture (bg + object tiles) for the cross-fade
      if (fadeC.width !== Wd || fadeC.height !== Hd) { fadeC.width = Wd; fadeC.height = Hd; }
      fadeX.setTransform(1, 0, 0, 1, 0, 0); fadeX.clearRect(0, 0, Wd, Hd); fadeX.drawImage(canvas, 0, 0);
    }
    for (const R of regs) {
      ctx.save(); ctx.beginPath(); ctx.rect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0); ctx.clip();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const X0 = Math.floor((R.x0 - cx) * z), Y0 = Math.floor((R.y0 - cy) * z), X1 = Math.ceil((R.x1 - cx) * z), Y1 = Math.ceil((R.y1 - cy) * z);
      const a0 = Math.max(0, X0), b0 = Math.max(0, Y0), a1 = Math.min(Wd, X1), b1 = Math.min(Hd, Y1);
      if (a1 > a0 && b1 > b0) ctx.drawImage(bg, a0, b0, a1 - a0, b1 - b0, a0, b0, a1 - a0, b1 - b0);
      ctx.setTransform(z, 0, 0, z, -cx * z, -cy * z);
      const see = SP.seeThrough && R.list === plist && SP.seeThrough.active();
      if (see) SP.seeThrough.drawGround(ctx);                 // A10: footprint outline + soft shadow + brighter street in the circle
      for (const d of R.list) drawDyn(ctx, d);
      if (see) SP.seeThrough.drawOutlines(ctx, R.list);       // A10: thin outline on occluded player / NPCs
      items += R.list.length;
      if (vis < 1) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - vis; if (a1 > a0 && b1 > b0) ctx.drawImage(fadeC, a0, b0, a1 - a0, b1 - b0, a0, b0, a1 - a0, b1 - b0); ctx.globalAlpha = 1; }
      ctx.restore();
    }
    if (SP.place && W.interior) SP.place.drawGlass(ctx, view);       // enclosed balcony glass over everything behind it
    Ly.stats.regions = regs.length; Ly.stats.regionItems = items;
    // ---- emissive layer
    E.emitOn = emitOn; Ly._eN = 0;
    if (emitOn) {
      if (em.width !== Wd || em.height !== Hd) { em.width = Wd; em.height = Hd; }
      ex.setTransform(1, 0, 0, 1, 0, 0); ex.clearRect(0, 0, Wd, Hd);
      ex.setTransform(z, 0, 0, z, -cx * z, -cy * z); ex.imageSmoothingEnabled = smooth;
      if (!zoomFast) drawTiles(ex, "e", view, L, K);
      for (const R of regs) {
        ex.save(); ex.beginPath(); ex.rect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0); ex.clip();
        ex.clearRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0);
        Ly.emitSeq(ex, R.list, R.list === plist); ex.restore();
      }
      if (SP.openInterior) Ly._eN += SP.openInterior.drawEmit(ex, view);
      E.emitCanvas = em;
    }
    E.emitRects = { length: Ly._eN };      // emitters on screen (tests / HUD)
    // far jobs: visible holes get JOB_MS (boosted while filling); gesture still runs a short slice so the screen does not stay empty
    if (Ly._drewG) Ly._viewReady = true;
    Ly.prebake(cx + Wd / z / 2, cy + Hd / z / 2, Wd, Hd);
    let jobVis = false; for (const j of jobs.values()) if (j.pri < 2) { jobVis = true; break; }
    Ly._holeFill = Ly._holeFill || jobVis || Ly._usedPlaceholder;
    const out = z < 0.6 && z < (Ly._lastZ || z) - 1e-6; Ly._lastZ = z;
    let jobMs;
    if (Ly._gest) jobMs = jobVis ? 4 : 0;
    else if (Ly._releaseLeft > 0) jobMs = 8;
    else if (jobVis || Ly._holeFill) jobMs = 7;
    else if (out) jobMs = Ly.JOB_MS * 0.8;
    else jobMs = Ly.IDLE_MS;
    if (!Ly._gest && Ly._releaseLeft > 0) {
      Ly._releaseLeft--;
      if (Ly._releaseLeft <= 0) Ly._freezeScale = null;
    }
    if (jobMs > 0) Ly.runJobs(jobMs);
    evict();
    W.sortCycles = Ly.frameCycles;
    return { plist, pi, lights, dyn, regs };
  };
  Ly.tileCount = () => tiles.size;
  /** once per game minute: lit windows switch on / off -> those objects re-bake */
  Ly.checkLit = function () {
    for (const o of W.objects) {
      const balcony = o.type === "f_balcony" && SP.households && Object.values(SP.households.facades).some(f => f.balcony === o.id);
      if (!balcony && (o.type !== "f_window" || !(o.night_lit || o._unit || (SP.households && SP.households.unitOf(o))))) continue;
      const s = W.shownState(o) + (balcony ? ":" + !!SP.households.paneFacade(o) : "");
      if (o._ls !== s) { if (o._ls !== undefined) Ly.refreshObj(o); o._ls = s; }
    }
  };
  Ly.flush = function () { for (const t of tiles.values()) { t.gd = true; t.od = true; t.ek = null; } };
})(window.SP);
