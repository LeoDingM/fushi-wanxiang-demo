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
  const Ly = (SP.layers = { stats: { bakes: 0, regions: 0, regionItems: 0 }, budget: 3 });
  const W = SP.world, TS = 512, PAD = 2, CELL = 256, CAP = 56;
  const tiles = new Map();
  let statics = [], sgrid = new Map(), bySid = new Map(), shadows = [], shgrid = new Map(), gitems = [], ggrid = new Map();
  let sigs = new Map(), qid = 1, built = false, decalSig = "", decalRects = [];
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
  function rebuild() {
    const all = []; W.drawables(all, null);
    statics = []; sgrid = new Map(); bySid = new Map();
    const objRect = new Map();
    for (const d of all) {
      if (d.kind !== "obj") continue;
      d.static = true; statics.push(d); gadd(sgrid, d, d.rect); bySid.set(d.sid, d);
      objRect.set(d.o, union(objRect.get(d.o), d.rect));
    }
    shadows = []; shgrid = new Map();
    for (const o of W.objects) {
      const P = W.piece(o); if (P.catcher !== "ground" || o.carried) continue;
      const k = SP.frameKey(o.type, o.variant, P.parts[0], o.state, o.rot) + "#shadow"; if (!SP.frame(k)) continue;
      const X = SP.sx(o.x, o.y), Y = SP.sy(o.x, o.y, o.z), it = { key: k, X, Y, rect: SP.frameRect(k, X, Y), o };
      shadows.push(it); gadd(shgrid, it, it.rect);
    }
    // signature diff -> dirty only what changed
    const ns = new Map();
    for (const o of W.objects) {
      const P = W.piece(o); if (P.layer !== "sorted" && P.catcher !== "ground") continue;
      const r = objRect.get(o) || null;
      const sig = o.carried ? "c" : `${o.state}|${W.shownState(o)}|${W.variant(o)}|${o.x}|${o.y}|${o.rot}|${SP.season === "winter" ? "w" : ""}`;
      ns.set(o.id, { sig, r });
      if (!built) continue;
      const old = sigs.get(o.id);
      if (!old || old.sig !== sig) { if (old && old.r) dirty(old.r, "og", 40); if (r) dirty(r, "og", 40); }
    }
    if (built) for (const [id, old] of sigs) if (!ns.has(id) && old.r) dirty(old.r, "og", 40);
    sigs = ns; built = true; Ly.need = false; Ly.stats.rebuilds = (Ly.stats.rebuilds || 0) + 1;
  }
  function rebuildGround() {
    gitems = (W.groundItems || []).slice(); ggrid = new Map();
    gitems.forEach((it, i) => { it.n = i; gadd(ggrid, it, it.rect); });
    Ly.groundNeed = false; Ly.groundVer = (Ly.groundVer || 0) + 1;
  }
  Ly.invalidate = function () { Ly.need = true; };
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
  Ly.reset = function () { for (const t of tiles.values()) for (const c of [t.g, t.o, t.e]) if (c) c.width = c.height = 0; tiles.clear(); built = false; Ly.need = true; Ly.groundNeed = true; sigs = new Map(); };

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
    t.gk = K.g; t.gd = false; Ly.stats.bakes++;
  }
  function staticsSorted(t) {
    const list = gquery(sgrid, t.r, []);
    if (!list.length) return list;
    const out = W.sortDrawables(list); Ly.frameCycles += W.sortCycles; return out;
  }
  function drawStatic(x, d) {
    const a = aq(d); SP.drawFrame(x, d.key, d.X, d.Y, a);
    if (Ly.snowQ > 0.01) SP.drawSnow(x, d.key, d.X, d.Y, Ly.snowQ, a);
  }
  function bakeO(t, K, emitOn) {
    const list = staticsSorted(t);
    t.ok = K.o; t.od = false; Ly.stats.bakes++;
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
  Ly.emitSeq = function (ex, list) {
    const R = [];
    for (const d of list) {
      let hit = false;
      for (let i = 0; i < R.length; i++) if (SP.rectsOverlap(R[i], d.rect)) { hit = true; break; }
      const a = d.kind === "obj" ? aq(d) : 1;
      if (hit) {
        ex.globalCompositeOperation = "destination-out";
        if (d.kind === "obj" || d.kind === "car") { ex.globalAlpha = a; SP.eraseFrame(ex, d.key, d.X, d.Y); ex.globalAlpha = 1; }
        else if (d.kind === "actor") d.actor.draw(ex);
        ex.globalCompositeOperation = "source-over";
      }
      if ((d.kind === "obj" || d.kind === "car") && SP.hasEmit(d.key)) { SP.drawEmit(ex, d.key, d.X, d.Y, a); R.push(d.rect); }
    }
    return R.length;
  };
  function evict() {
    if (tiles.size <= CAP) return;
    const old = [...tiles.values()].sort((a, b) => a.used - b.used).slice(0, tiles.size - CAP);
    const f = SP.frameNo || 0;
    for (const t of old) { if (t.used >= f) continue; for (const c of [t.g, t.o, t.e]) if (c) c.width = c.height = 0; tiles.delete(t.k); }
  }
  /* tile scale (tile px per world px): 1 at zoom >= 1 (nearest-neighbour upscale: crisp pixel art); below 1, while
     the zoom is moving: the next power of two above (cheap, never upscaled); once it settled: exactly the zoom, so
     tiles blit 1:1 without resampling */
  Ly.level = (z) => Math.max(0, Math.min(6, Math.floor(Math.log2(1 / z) + 1e-6)));
  let lastZ = 0, still = 0;
  Ly.scaleFor = function (z) {
    if (Math.abs(z - lastZ) > 1e-4) { lastZ = z; still = 0; } else still++;
    if (z >= 0.999) return 1;
    if (still >= 8) return Math.round(z * 1000) / 1000;
    return 1 / (1 << Ly.level(z));
  };
  /** draw one tile layer for the view (world px rect) at level L; bakes what is missing / stale */
  function drawTiles(ctx, which, view, L, K, emitOn) {
    const span = TS / L;
    for (let tx = Math.floor(view.x0 / span); tx <= Math.floor(view.x1 / span); tx++)
      for (let ty = Math.floor(view.y0 / span); ty <= Math.floor(view.y1 / span); ty++) {
        const t = tile(L, tx, ty);
        if (which === "g") {
          if (!t.g || t.gd) bakeG(t, K); else if (t.gk !== K.g && Ly._budget-- > 0) bakeG(t, K);
          ctx.drawImage(t.g, PAD, PAD, TS, TS, tx * span, ty * span, span, span);
        } else if (which === "o") {
          if (t.ok == null || t.od) bakeO(t, K, emitOn); else if (t.ok !== K.o && Ly._budget-- > 0) bakeO(t, K, emitOn);
          if (!t.oEmpty) ctx.drawImage(t.o, PAD, PAD, TS, TS, tx * span, ty * span, span, span);
        } else {
          if (t.outside == null) t.outside = Ly.viewOutside(t.r);
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
  Ly.FAR = 0.3;        // below: characters / cars become dots, no occlusion regions
  /** dynamic drawables (everything that moves or animates) overlapping view */
  Ly.dynamics = function (view, actorDrawable) {
    const all = [];
    SP.traffic.drawables(all); SP.fx.drawables(all); SP.env.drawables(all);
    for (const o of W.objects) if (o.overlays.length) { const tmp = []; W.overlayDrawables(o, tmp); for (const d of tmp) all.push(d); }
    for (const a of SP.actors.list) if (!a.hidden) all.push(actorDrawable(a));
    return all.filter((d) => SP.rectsOverlap(d.rect, view));
  };
  function clusters(dyn) {
    const R = dyn.map((d) => ({ x0: Math.floor(d.rect.x0) - 2, y0: Math.floor(d.rect.y0) - 2, x1: Math.ceil(d.rect.x1) + 2, y1: Math.ceil(d.rect.y1) + 2, items: [d] }));
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
    if (d.kind === "obj") drawStatic(ctx, d);
    else if (d.kind === "overlay") SP.drawFrame(ctx, d.key, d.X, d.Y, d.alpha);
    else if (d.kind === "car") { SP.drawFrame(ctx, d.key, d.X, d.Y); if (snow > 0.01) SP.drawSnow(ctx, d.key, d.X, d.Y, snow * (d.car && d.car.v > 0.5 ? 0.5 : 1)); }
    else if (d.kind === "part") SP.fx.drawPart(ctx, d.p);
    else if (d.kind === "fire") SP.fx.drawFire(ctx, d.o, d.ov);
    else if (d.kind === "laundry") SP.env.drawLaundry(ctx, d);
    else if (d.kind === "actor") d.actor.draw(ctx);
  }
  Ly.drawDyn = drawDyn;
  /** far LOD: characters = dots, cars = flat footprint quads */
  function drawSimple(ctx, dyn, z) {
    const s = 1 / z;
    for (const d of dyn) {
      if (d.kind === "actor") { const [X, Y] = d.actor.screen(); ctx.fillStyle = d.actor.isPlayer ? "#ffd84a" : "#e8e2d8"; ctx.fillRect(X - 1.5 * s, Y - 4 * s, 3 * s, 4 * s); }
      else if (d.kind === "car" && d.car && d.car.poly) {
        ctx.fillStyle = d.car.kind === "bus" ? "#3c8a5a" : "#c8ccd4"; ctx.beginPath();
        d.car.poly.forEach(([x, y], i) => (i ? ctx.lineTo(SP.sx(x, y), SP.sy(x, y, 1.2)) : ctx.moveTo(SP.sx(x, y), SP.sy(x, y, 1.2)))); ctx.fill();
      }
    }
  }
  /** full frame. o = {canvas, ctx, z, cx, cy, view, player, actorDrawable, dt, shadowDyn(sctx)} -> {list for player region, pi} */
  Ly.render = function (o) {
    const { canvas, ctx, z, cx, cy, view } = o, Wd = canvas.width, Hd = canvas.height, E = SP.env;
    Ly.frameCycles = 0; Ly._budget = SP.state && SP.state.manual ? 1e9 : Ly.budget;
    if (Ly.groundNeed) { rebuildGround(); }
    if (Ly.need) rebuild();
    // decals changed? (pushed / filtered anywhere) -> dirty their ground tiles
    const ds = W.decals.length + ":" + W.decals.map((d) => d.key + d.x + "," + d.y).join(";");
    if (ds !== decalSig) {
      const nr = W.decals.map((d) => { const X = SP.sx(d.x, d.y), Y = SP.sy(d.x, d.y, 0); return SP.frameRect(d.key, X, Y); }).filter(Boolean);
      for (const r of decalRects.concat(nr)) dirty(r, "g", 4);
      decalSig = ds; decalRects = nr;
    }
    const K = keys(), L = Ly.scaleFor(z), far = z < Ly.FAR, smooth = z < 0.999;
    if (bg.width !== Wd || bg.height !== Hd) { bg.width = Wd; bg.height = Hd; sc.width = Wd; sc.height = Hd; }
    // dynamic drawables + regions first (the player's region decides occluder fading before tiles are drawn)
    const dyn = Ly.dynamics(view, o.actorDrawable);
    const regs = far ? [] : clusters(dyn);
    let plist = [], pi = -1;
    for (const R of regs) {
      const list = gquery(sgrid, R, []).concat(R.items);
      R.list = W.sortDrawables(list); Ly.frameCycles += W.sortCycles;
      const k = R.list.findIndex((d) => d.kind === "actor" && d.actor === o.player);
      if (k >= 0) { plist = R.list; pi = k; }
    }
    W.updateFade(plist, pi, o.player.bodyRect(), o.dt);
    for (const sid of W.fadeChanged || []) { const d = bySid.get(sid); if (d) dirty(d.rect, "o", 1); }
    // ---- bg: backdrop, ground tiles, ground fx, reflections, dynamic shadows
    bx.setTransform(1, 0, 0, 1, 0, 0); bx.imageSmoothingEnabled = false;
    bx.fillStyle = "#17181d"; bx.fillRect(0, 0, Wd, Hd);
    bx.setTransform(z, 0, 0, z, -cx * z, -cy * z);
    bx.imageSmoothingEnabled = smooth; bx.imageSmoothingQuality = "low";
    drawTiles(bx, "g", view, L, K);
    if (SP.place && W.interior) SP.place.drawBehind(bx, view);        // live outside view behind the window holes (floor seen there lies behind the wall)
    E.drawGround(bx, view, z);
    const lights = E.lights(view, z);
    E.drawReflections(bx, lights, view);
    if (!far) {
      sx.setTransform(1, 0, 0, 1, 0, 0); sx.clearRect(0, 0, Wd, Hd); sx.imageSmoothingEnabled = smooth;
      sx.setTransform(z, 0, 0, z, -cx * z, -cy * z);
      o.shadowDyn(sx);
      bx.save(); bx.setTransform(1, 0, 0, 1, 0, 0); bx.globalAlpha = Ly.shadowA; bx.drawImage(sc, 0, 0); bx.restore();
    }
    // ---- main: bg + object tiles + regions
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(bg, 0, 0);
    ctx.setTransform(z, 0, 0, z, -cx * z, -cy * z);
    ctx.imageSmoothingEnabled = smooth; ctx.imageSmoothingQuality = "low";
    const emitOn = E.night > 0.02;
    drawTiles(ctx, "o", view, L, K, emitOn);
    let items = 0;
    for (const R of regs) {
      ctx.save(); ctx.beginPath(); ctx.rect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0); ctx.clip();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const X0 = Math.floor((R.x0 - cx) * z), Y0 = Math.floor((R.y0 - cy) * z), X1 = Math.ceil((R.x1 - cx) * z), Y1 = Math.ceil((R.y1 - cy) * z);
      const a0 = Math.max(0, X0), b0 = Math.max(0, Y0), a1 = Math.min(Wd, X1), b1 = Math.min(Hd, Y1);
      if (a1 > a0 && b1 > b0) ctx.drawImage(bg, a0, b0, a1 - a0, b1 - b0, a0, b0, a1 - a0, b1 - b0);
      ctx.setTransform(z, 0, 0, z, -cx * z, -cy * z);
      for (const d of R.list) drawDyn(ctx, d);
      items += R.list.length;
      ctx.restore();
    }
    if (far) drawSimple(ctx, dyn, z);
    if (SP.place && W.interior) SP.place.drawGlass(ctx, view);       // enclosed balcony glass over everything behind it
    Ly.stats.regions = regs.length; Ly.stats.regionItems = items;
    // ---- emissive layer
    E.emitOn = emitOn; Ly._eN = 0;
    if (emitOn) {
      if (em.width !== Wd || em.height !== Hd) { em.width = Wd; em.height = Hd; }
      ex.setTransform(1, 0, 0, 1, 0, 0); ex.clearRect(0, 0, Wd, Hd);
      ex.setTransform(z, 0, 0, z, -cx * z, -cy * z); ex.imageSmoothingEnabled = smooth;
      drawTiles(ex, "e", view, L, K);
      for (const R of regs) {
        ex.save(); ex.beginPath(); ex.rect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0); ex.clip();
        ex.clearRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0);
        Ly.emitSeq(ex, R.list); ex.restore();
      }
      E.emitCanvas = em;
    }
    E.emitRects = { length: Ly._eN };      // emitters on screen (tests / HUD)
    evict();
    W.sortCycles = Ly.frameCycles;
    return { plist, pi, lights, dyn, regs };
  };
  Ly.tileCount = () => tiles.size;
  /** once per game minute: lit windows switch on / off -> those objects re-bake */
  Ly.checkLit = function () {
    for (const o of W.objects) { if (o.type !== "f_window" || !o.night_lit) continue; const s = W.shownState(o); if (o._ls !== s) { if (o._ls !== undefined) Ly.need = true; o._ls = s; } }
  };
  Ly.flush = function () { for (const t of tiles.values()) { t.gd = true; t.od = true; t.ek = null; } };
})(window.SP);
