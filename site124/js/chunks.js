/* scene-proto-45 · chunk streaming (Stage 5). scene.json lists chunks [{id, rect, src, load_m, unload_m}]; each chunk file
   (chunks/<id>.js, file:// friendly) sets window.SCENE_CHUNKS[id] = {objects, colliders}. A chunk is streamed in when 李默
   is within load_m of its rect or the camera view touches it (far zoom), and dropped beyond unload_m when off-screen.
   Object states (broken windows, shutters ...) are remembered across unload / reload. Integrators: SP.chunks.loadAll()
   forces everything in (tests / audits); SP.chunks.loaded() lists ids. Chunks never exist indoors (W.load resets them). */
(function () {
  const W = SP.world, CH = (SP.chunks = {}), injected = {}, memo = {};
  let acc = 0;
  const dist = (r, x, y) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - y, 0, y - r[3]));
  function viewTouches(r) {
    const V = SP.state && SP.state.view; if (!V || SP.now - (SP.state.viewT || 0) > 0.5) return false;   // only a view actually rendered just now counts
    // world rect -> screen bbox (2:1 dimetric), padded for tall buildings
    const xs = [], ys = []; for (const [x, y] of [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]]) { xs.push(SP.sx(x, y)); ys.push(SP.sy(x, y, 0), SP.sy(x, y, 20)); }
    return Math.max(...xs) > V.x0 - 64 && Math.min(...xs) < V.x1 + 64 && Math.max(...ys) > V.y0 - 64 && Math.min(...ys) < V.y1 + 64;
  }
  function inject(c) {
    if (injected[c.id]) return; injected[c.id] = true;
    const s = document.createElement("script"); s.src = c.src; s.onerror = () => console.warn("chunk failed to load", c.src); document.head.appendChild(s);
  }
  /* perf: colliders / lights / layer caches were rebuilt (and every cached tile thrown away by SP.layers.reset) once
     per chunk; loadAll + the next tick's unload swap ~25 chunks at a time (every couple of game minutes while residents
     walk the street), which cost a multi-second hitch even at normal zoom. Within one loop nothing reads colliders between
     chunks, so the rebuild is done once at the end (same state afterwards), and the layer cache is refreshed by its
     signature diff (only tiles whose objects / shadows changed are re-baked) instead of a full reset. */
  let pend = false, depth = 0, quiet = false;       // depth > 0: inside a loadAll / tick loop (other modules wrap apply / drop, so no extra argument)
  function flush() { if (!pend) return; pend = false; W.rebuildColliders(); SP.env.invalidateLights(); if (SP.layers.chunksChanged) SP.layers.chunksChanged(); else SP.layers.reset(); }
  function changed() { pend = true; if (!depth) flush(); }
  function batch(fn) { depth++; try { return fn(); } finally { if (--depth === 0) flush(); } }
  CH.batch = batch;
  /** wrappers that would rebuild colliders / reset the layer cache after a chunk swap: inside a batch, defer to its single flush */
  CH.deferRebuild = () => { if (!depth) return false; pend = true; return true; };
  CH.apply = function (c) {
    const D = window.SCENE_CHUNKS && window.SCENE_CHUNKS[c.id];
    if (!D || W.interior || W.chunksIn[c.id]) return false;
    const now = SP.clock ? SP.clock.abs() : 0, M = memo[c.id] || {};
    for (const src of D.objects) {
      const o = Object.assign({ z: 0, rot: 0, variant: "base" }, src), P = SP.piece(o);
      if (!P) continue;
      if (!o.state) o.state = P.states[0];
      o.overlays = []; o.alpha = {}; o.since = now; o._chunk = c.id;
      if (o.interact === "shop" || o.interact === "eatery") o.open_state = o.open_state || o.state;
      if (M[o.id]) o.state = M[o.id];
      W.objects.push(o); W.byId[o.id] = o;
    }
    W.chunkCols.push(...D.colliders.map((k) => Object.assign({ _chunk: c.id }, k)));
    W.chunksIn[c.id] = true; changed();
    if (!quiet) W.logEvent && W.logEvent(`（载入街区：${c.name || c.id}）`);     // background loadAll: no per-chunk log lines (W.log keeps only 80)
    return true;
  };
  CH.drop = function (c) {
    if (!W.chunksIn[c.id]) return;
    const M = (memo[c.id] = {});
    for (const o of W.objects) if (o._chunk === c.id) { if (o.state !== o.open_state && o.interact !== "shop" && o.interact !== "eatery") M[o.id] = o.state; delete W.byId[o.id]; }
    W.objects = W.objects.filter((o) => o._chunk !== c.id); W.chunkCols = W.chunkCols.filter((k) => k._chunk !== c.id);
    delete W.chunksIn[c.id]; changed();
  };
  CH.list = () => (!W.interior && W.data && W.data.chunks) || [];
  CH.prefetchStreet = function () { const data=W.interior?SP.place?.street?.data:W.data,list=data?.chunks||[];for(const c of list)inject(c);return list.every(c=>!!window.SCENE_CHUNKS?.[c.id]); };
  CH.loaded = () => Object.keys(W.chunksIn || {});
  CH.loadAll = function () { const q = quiet; quiet = true; try { batch(() => { for (const c of CH.list()) { inject(c); CH.apply(c); } }); } finally { quiet = q; } return CH.loaded(); };
  /** some street scheduler (conflict, incidents, residents' / neighbour's / vendor's day) needs every street chunk present:
      the same test chunks.tick uses before unloading. Schedulers load with loadAll only while this holds, so what they
      load is not dropped again on the next tick (that load / unload cycle repeated every ~2 game minutes). */
  CH.streetNeeded = () => !!(SP.npcConflict?.needsStreetChunks?.() || SP.cityIncidents?.needsStreetChunks?.() || SP.npcDailyLife?.needsStreetChunks?.() || SP.neighborDay?.needsStreetChunks?.() || SP.vendorDay?.needsStreetChunks?.());
  /** every 0.25 s (main loop) */
  CH.tick = function (dt) {
    for (const c of CH.list()) inject(c);          // prefetch the (small) chunk scripts once; applying them stays proximity-driven
    acc += dt; if (acc < 0.25) return; acc = 0;
    const P = SP.player; if (!P) return;
    batch(() => { for (const c of CH.list()) {
      const d = dist(c.rect, P.x, P.y), vis = viewTouches(c.rect);
      if (!W.chunksIn[c.id] && (d < c.load_m || vis)) { inject(c); CH.apply(c); }
      else if (W.chunksIn[c.id] && d > c.unload_m && !vis && !CH.streetNeeded()) CH.drop(c);
    } });
  };
})();
