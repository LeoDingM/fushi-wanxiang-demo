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
    const pad = (SP.cam && SP.cam.zoom != null && SP.cam.zoom < 0.45) ? 160 : 96;
    return Math.max(...xs) > V.x0 - pad && Math.min(...xs) < V.x1 + pad && Math.max(...ys) > V.y0 - pad && Math.min(...ys) < V.y1 + pad;
  }
  const injectedSrc = {}, srcWait = {}, missed = {}, missedN = {}, seenAt = {}, tries = {};
  let geometry = false;
  const HUGE = 80000;
  function resident(id) {
    const D = window.SCENE_CHUNKS && window.SCENE_CHUNKS[id];
    return !!(D && Array.isArray(D.objects));
  }
  function areaOf(c) {
    const r = c.rect || [0, 0, 0, 0];
    return Math.max(0, r[2] - r[0]) * Math.max(0, r[3] - r[1]);
  }
  /* 1 = newly added, 2 = already in the world, 0 = piece manifest not ready yet */
  function placeObject(src, id, now, M) {
    const o = Object.assign({ z: 0, rot: 0, variant: "base" }, src), P = SP.piece(o);
    if (!P) return 0;
    if (W.byId[o.id]) return 2;
    if (!o.state) o.state = P.states[0];
    o.overlays = []; o.alpha = {}; o.since = now; o._chunk = id;
    if (o.interact === "shop" || o.interact === "eatery") o.open_state = o.open_state || o.state;
    if (M && M[o.id]) o.state = M[o.id];
    W.objects.push(o); W.byId[o.id] = o;
    return 1;
  }
  function wantNow(c, d, vis, boost) {
    if (d < (c.load_m || 24) * boost) return true;
    return !!(vis && areaOf(c) < HUGE);     // a city-sized rect must not spend the budget ahead of 井槐里
  }
  function inject(c) {
    if (!c) return;
    if (resident(c.id)) { injected[c.id] = true; return; }
    if (!c.src || srcWait[c.src] || injectedSrc[c.src]) { if (srcWait[c.src]) injected[c.id] = true; return; }
    if ((tries[c.src] || 0) >= 3) return;
    tries[c.src] = (tries[c.src] || 0) + 1;
    injected[c.id] = true; srcWait[c.src] = true; injectedSrc[c.src] = true;
    const s = document.createElement("script"); s.src = c.src;
    s.onload = () => {
      srcWait[c.src] = false;
      const P = SP.player, z = SP.cam && SP.cam.zoom, boost = z != null && z < 0.35 ? 2.4 : 1;
      let again = false;
      batch(() => {
        for (const x of CH.list()) if (x.src === c.src) {
          if (!resident(x.id)) { delete injected[x.id]; again = true; continue; }
          injected[x.id] = true;
          if (W.chunksIn[x.id] || W.interior || !P) continue;
          const d = dist(x.rect, P.x, P.y), vis = viewTouches(x.rect);
          if (wantNow(x, d, vis, boost)) CH.apply(x);
        }
      });
      if (again) delete injectedSrc[c.src];
    };
    s.onerror = () => { srcWait[c.src] = false; delete injectedSrc[c.src]; delete injected[c.id]; console.warn("chunk failed to load", c.src); };
    document.head.appendChild(s);
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
    if (!D || !Array.isArray(D.objects) || W.interior || W.chunksIn[c.id]) return false;
    const now = SP.clock ? SP.clock.abs() : 0, M = memo[c.id] || {}, skip = [];
    let n = 0;
    for (const src of D.objects) {
      const k = placeObject(src, c.id, now, M);
      if (k === 0) skip.push(src); else n++;
    }
    // pieces not installed yet (deferred art): leave the chunk unloaded so the block is not sealed as empty ground
    if (!n && skip.length) return false;
    W.chunkCols.push(...(D.colliders || []).map((k) => Object.assign({ _chunk: c.id }, k)));
    W.chunksIn[c.id] = true;
    if (skip.length) missed[c.id] = skip; else delete missed[c.id];
    changed();
    if (!quiet) W.logEvent && W.logEvent(`（载入街区：${c.name || c.id}）`);     // background loadAll: no per-chunk log lines (W.log keeps only 80)
    return true;
  };
  CH.drop = function (c) {
    if (!W.chunksIn[c.id]) return;
    const M = (memo[c.id] = {});
    for (const o of W.objects) if (o._chunk === c.id) { if (o.state !== o.open_state && o.interact !== "shop" && o.interact !== "eatery") M[o.id] = o.state; delete W.byId[o.id]; }
    W.objects = W.objects.filter((o) => o._chunk !== c.id); W.chunkCols = W.chunkCols.filter((k) => k._chunk !== c.id);
    delete W.chunksIn[c.id]; delete missed[c.id]; delete missedN[c.id]; delete seenAt[c.id]; changed();
  };
  CH.list = () => (!W.interior && W.data && W.data.chunks) || [];
  CH.prefetchStreet = function () { const data=W.interior?SP.place?.street?.data:W.data,list=data?.chunks||[];for(const c of list)inject(c);return list.every(c=>!!window.SCENE_CHUNKS?.[c.id]); };
  /** spawn neighbourhood only: do not pull the whole city onto the wire before the deferred bundle finishes */
  CH.prefetchNear = function () {
    const P = SP.player; if (!P || W.interior) return 0;
    let n = 0;
    for (const c of CH.list()) {
      if (resident(c.id) || injected[c.id] || srcWait[c.src]) continue;
      if (dist(c.rect, P.x, P.y) < 160 && areaOf(c) < HUGE) { inject(c); n++; }
    }
    return n;
  };
  /** every ready block touching the camera (or standing next to 李默) in one batch, so a district does not pop in piece by piece */
  CH.settleVisible = function () {
    const P = SP.player; if (!P || W.interior) return 0;
    const z = SP.cam && SP.cam.zoom, boost = z != null && z < 0.35 ? 2.4 : 1;
    let n = 0;
    batch(() => {
      const ordered = CH.list().slice().sort((a, b) => dist(a.rect, P.x, P.y) - dist(b.rect, P.x, P.y) || areaOf(a) - areaOf(b));
      for (const c of ordered) {
        if (W.chunksIn[c.id]) continue;
        inject(c);
        if (!resident(c.id)) continue;
        if (wantNow(c, dist(c.rect, P.x, P.y), viewTouches(c.rect), boost) && CH.apply(c)) n++;
      }
    });
    return n;
  };
  /** deferred bundle has the district generators. Prefetch the remaining chunk files and lay down everything already around the camera. */
  CH.armDistricts = function () { geometry = true; CH.prefetchStreet(); return CH.settleVisible(); };
  CH.loaded = () => Object.keys(W.chunksIn || {});
  CH.loadAll = function () { const q = quiet; quiet = true; try { batch(() => { for (const c of CH.list()) { inject(c); CH.apply(c); } }); } finally { quiet = q; } return CH.loaded(); };
  /** some street scheduler (conflict, incidents, residents' / neighbour's / vendor's day) needs every street chunk present:
      the same test chunks.tick uses before unloading. Schedulers load with loadAll only while this holds, so what they
      load is not dropped again on the next tick (that load / unload cycle repeated every ~2 game minutes). */
  CH.streetNeeded = () => !!(SP.npcConflict?.needsStreetChunks?.() || SP.cityIncidents?.needsStreetChunks?.() || SP.npcDailyLife?.needsStreetChunks?.() || SP.neighborDay?.needsStreetChunks?.() || SP.vendorDay?.needsStreetChunks?.());
  /** every 0.25 s (main loop) */
  CH.tick = function (dt) {
    acc += dt; if (acc < 0.25) return; acc = 0;
    const P = SP.player; if (!P) return;
    const z = SP.cam && SP.cam.zoom, gest = !!(SP.layers && SP.layers.inGesture && SP.layers.inGesture());
    const far = z != null && z < 0.35;
    // blocks the size of 井槐里 apply whenever they touch the view. City-sized rects (河东/南埠 bands) drip,
    // and not at all while dragging, so a pan does not load and drop them.
    const viewBudget = gest ? 0 : (far ? 3 : 4);
    let viewApplied = 0;
    const loadBoost = far ? 2.4 : (gest ? 1.4 : 1);
    batch(() => {
      const now = SP.clock ? SP.clock.abs() : 0;
      for (const id of Object.keys(missed)) {
        const rest = [], M = memo[id] || {};
        let added = 0;
        for (const src of missed[id]) { const k = placeObject(src, id, now, M); if (k === 0) rest.push(src); else if (k === 1) added++; }
        if (rest.length) { missed[id] = rest; if ((missedN[id] = (missedN[id] || 0) + 1) > 48) { delete missed[id]; delete missedN[id]; } }
        else { delete missed[id]; delete missedN[id]; if (added) changed(); }
      }
      const ordered = CH.list().slice().sort((a, b) => dist(a.rect, P.x, P.y) - dist(b.rect, P.x, P.y) || areaOf(a) - areaOf(b));
      for (const c of ordered) {
        const d = dist(c.rect, P.x, P.y), vis = viewTouches(c.rect);
        if (vis) seenAt[c.id] = SP.now || 0;
        if (!W.chunksIn[c.id]) {
          const local = wantNow(c, d, vis, loadBoost);
          if (local) { inject(c); CH.apply(c); }
          else if (vis && viewApplied < viewBudget) { inject(c); if (CH.apply(c)) viewApplied++; }
          else if (geometry) inject(c);
        } else {
          const seen = seenAt[c.id];
          const fresh = seen != null && (SP.now || 0) - seen < 0.75;   // a small pan must not unload and reload
          const farEnough = d > (c.unload_m || 48) * (far ? 1.5 : 1.25);
          if (!gest && farEnough && !vis && !fresh && !CH.streetNeeded()) CH.drop(c);
        }
      }
    });
  };
})();
