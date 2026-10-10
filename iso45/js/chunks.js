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
    W.chunksIn[c.id] = true; W.rebuildColliders(); SP.env.invalidateLights(); SP.layers.reset();
    W.logEvent && W.logEvent(`（载入街区：${c.name || c.id}）`);
    return true;
  };
  CH.drop = function (c) {
    if (!W.chunksIn[c.id]) return;
    const M = (memo[c.id] = {});
    for (const o of W.objects) if (o._chunk === c.id) { if (o.state !== o.open_state && o.interact !== "shop" && o.interact !== "eatery") M[o.id] = o.state; delete W.byId[o.id]; }
    W.objects = W.objects.filter((o) => o._chunk !== c.id); W.chunkCols = W.chunkCols.filter((k) => k._chunk !== c.id);
    delete W.chunksIn[c.id]; W.rebuildColliders(); SP.env.invalidateLights(); SP.layers.reset();
  };
  CH.list = () => (!W.interior && W.data && W.data.chunks) || [];
  CH.loaded = () => Object.keys(W.chunksIn || {});
  CH.loadAll = function () { for (const c of CH.list()) { inject(c); CH.apply(c); } return CH.loaded(); };
  /** every 0.25 s (main loop) */
  CH.tick = function (dt) {
    for (const c of CH.list()) inject(c);          // prefetch the (small) chunk scripts once; applying them stays proximity-driven
    acc += dt; if (acc < 0.25) return; acc = 0;
    const P = SP.player; if (!P) return;
    for (const c of CH.list()) {
      const d = dist(c.rect, P.x, P.y), vis = viewTouches(c.rect);
      if (!W.chunksIn[c.id] && (d < c.load_m || vis)) { inject(c); CH.apply(c); }
      else if (W.chunksIn[c.id] && d > c.unload_m && !vis) CH.drop(c);
    }
  };
})();
