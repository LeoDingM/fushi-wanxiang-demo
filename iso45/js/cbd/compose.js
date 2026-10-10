/* 云汇CBD · compose: painter list + topological depth sort, occluder fade, frame compositor.
   Order of a frame: sky -> ground tiles -> sorted drawables (props, parts / impostors, cars, people, fx) with the emissive
   layer built alongside (erased under nearer drawables) -> lightmap multiply -> emissive add -> halos, crown beam,
   aviation lights -> weather -> labels. */
(function (SP) {
  "use strict";
  const C = SP.cbd, X = C._; if (!X) return; C._mods.compose = true;
  const { F, EF, SF, IMG, W, TR, NPC, FX, cam, IMP, SX, SY, overlap, inPoly } = X;
  function uR(sh) { if (sh._u && sh._uv === sh.p) return sh._u; let a = 1e9, b = -1e9; for (const [x, y] of sh.p) { a = Math.min(a, x - y); b = Math.max(b, x - y); } sh._uv = sh.p; return (sh._u = [a, b]); }
  function tR(sh, u) {   // extent along the view depth axis (x+y) of a footprint at screen column u = x-y
    let a = 1e9, b = -1e9; const P = sh.p;
    for (let i = 0; i < P.length; i++) {
      const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length], u1 = x1 - y1, u2 = x2 - y2;
      if ((u1 - u) * (u2 - u) > 0) continue;
      const t1 = x1 + y1, t2 = x2 + y2;
      if (Math.abs(u2 - u1) < 1e-9) { a = Math.min(a, t1, t2); b = Math.max(b, t1, t2); } else { const t = t1 + (t2 - t1) * (u - u1) / (u2 - u1); a = Math.min(a, t); b = Math.max(b, t); }
    }
    return a <= b ? [a, b] : null;
  }
  /** +1: A in front of B (drawn after), -1: B in front, 0: unrelated. Footprint prisms along the view; stacked -> z */
  function order(A, B) {
    let best = 0, bestOv = 0, inter = false;
    for (const sa of A.sh) for (const sb of B.sh) {
      const ra = uR(sa), rb = uR(sb), lo = Math.max(ra[0], rb[0]), hi = Math.min(ra[1], rb[1]);
      if (hi - lo <= 1e-4) continue;
      const u = (lo + hi) / 2, ta = tR(sa, u), tb = tR(sb, u); if (!ta || !tb) continue;
      let r = 0; if (ta[1] <= tb[0] + 1e-3) r = 1; else if (tb[1] <= ta[0] + 1e-3) r = -1; else inter = true;
      if (r && hi - lo > bestOv) { bestOv = hi - lo; best = r; }
    }
    if (inter) { if (A.z0 >= B.z1 - 1e-3) return 1; if (B.z0 >= A.z1 - 1e-3) return -1; if (!best) return A.depth < B.depth ? 1 : -1; }
    return best;
  }
  C.order = order;
  function sortList(list) {
    const n = list.length; if (n < 2) return list;
    list.sort((a, b) => b.depth - a.depth || a.z0 - b.z0);
    const CS = 256, cells = new Map(), adj = Array.from({ length: n }, () => []), indeg = new Int32Array(n);
    list.forEach((d, i) => { const r = d.rect; for (let gx = Math.floor(r.x0 / CS); gx <= Math.floor(r.x1 / CS); gx++) for (let gy = Math.floor(r.y0 / CS); gy <= Math.floor(r.y1 / CS); gy++) { const k = gx * 100003 + gy; let l = cells.get(k); if (!l) cells.set(k, (l = [])); l.push(i); } });
    const seen = new Set(); let pairs = 0;
    for (const l of cells.values()) for (let p = 0; p < l.length; p++) for (let q = p + 1; q < l.length; q++) {
      const i = l[p], j = l[q], key = i * n + j; if (seen.has(key)) continue; seen.add(key);
      const A = list[i], B = list[j]; if (!overlap(A.rect, B.rect)) continue;
      if (A.kind === "prop" && B.kind === "prop" && !A.tree && !B.tree && A.z1 < 1.2 && B.z1 < 1.2) continue;
      pairs++;
      const o = order(A, B); if (o > 0) { adj[j].push(i); indeg[i]++; } else if (o < 0) { adj[i].push(j); indeg[j]++; }
    }
    // Kahn; among ready items keep the far-to-near index order (min-heap by index); cycles broken at the farthest item
    const out = [], done = new Uint8Array(n), heap = []; let cyc = 0, scan = 0;
    const push = (v) => { heap.push(v); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p] <= heap[i]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l] < heap[m]) m = l; if (r < heap.length && heap[r] < heap[m]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    for (let i = 0; i < n; i++) if (!indeg[i]) push(i);
    while (out.length < n) {
      if (!heap.length) { while (done[scan]) scan++; push(scan); cyc++; }
      const i = pop(); if (done[i]) continue; done[i] = 1; out.push(list[i]);
      for (const j of adj[i]) if (!done[j] && --indeg[j] <= 0) push(j);
    }
    C.stats.cycles = cyc; C.stats.pairs = pairs; return out;
  }
  function actorDrawable(a) { const r = a.spriteRect(); return { kind: "actor", a, rect: r, sh: [{ p: [[a.x - 0.22, a.y - 0.22], [a.x + 0.22, a.y - 0.22], [a.x + 0.22, a.y + 0.22], [a.x - 0.22, a.y + 0.22]] }], z0: 0, z1: 1.8, depth: a.x + a.y, alpha: 1 }; }
  function dogDrawable(a) {
    const g = a.dog, key = `dog/${g.v}/${Math.floor(g.ph) % 2 ? "w1" : "w0"}/-/${g.dir}`, f = F[key]; if (!f) return null;
    const Xs = Math.round(SX(g.x, g.y)), Ys = Math.round(SY(g.x, g.y, 0));
    return { kind: "dog", key, X: Xs, Y: Ys, a, rect: { x0: Xs - f[4], y0: Ys - f[5], x1: Xs - f[4] + f[2], y1: Ys - f[5] + f[3] }, sh: [{ p: [[g.x - 0.3, g.y - 0.15], [g.x + 0.3, g.y - 0.15], [g.x + 0.3, g.y + 0.15], [g.x - 0.3, g.y + 0.15]] }], z0: 0, z1: 0.6, depth: g.x + g.y, alpha: 1 };
  }
  /** occluder fade: static drawables painted after 李默 whose silhouette covers his body ease to 35 % */
  function fade(list) {
    const P = C.player, br = P.bodyRect(), cx = (br.x0 + br.x1) / 2, pts = [[cx, br.y0 + 8], [cx, (br.y0 + br.y1) / 2], [cx, br.y1 - 6]];
    let after = false;
    for (const d of list) {
      if (d.kind === "actor" && d.a === P) { after = true; continue; }
      if (!d.static) continue;
      let cover = false;
      if (after && overlap(d.rect, br)) {
        if (d.kind === "part") cover = pts.some(([x, y]) => inPoly(x, y, d.hull));
        else if (d.tree) cover = pts.some(([x, y]) => y < d.Y - 70 && x > d.rect.x0 + 24 && x < d.rect.x1 - 24);
        else cover = d.z1 > 1.9;
      }
      const tgt = cover ? 0.35 : 1; d.alpha += (tgt - d.alpha) * Math.min(1, (C.dt || 0.016) * 8); if (Math.abs(d.alpha - tgt) < 0.01) d.alpha = tgt;
    }
  }
  function leash(ctx, a) { const g = a.dog, [Xs, Ys] = a.screen(); ctx.strokeStyle = "rgba(40,40,40,0.8)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Xs + 6, Ys - 38); ctx.lineTo(Math.round(SX(g.x, g.y)) + 4, Math.round(SY(g.x, g.y, 0.45))); ctx.stroke(); }
  let emitC = null;
  function render() {
    const cv = C.canvas, ctx = C.ctx, Wd = cv.width, Hd = cv.height, z = cam.zoom, ck = SP.clock;
    C.frameNo = (C.frameNo || 0) + 1;
    const n = X.night();
    if (C.seasonNow !== X.season()) X.applySeason();
    if (ck && ck.snow > 0.05) X.loadSnow();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    X.drawSky(ctx, Wd, Hd);
    const ox = Wd / 2 - cam.x * z, oy = Hd / 2 - cam.y * z;
    const view = { x0: cam.x - Wd / 2 / z, y0: cam.y - Hd / 2 / z, x1: cam.x + Wd / 2 / z, y1: cam.y + Hd / 2 / z };
    ctx.setTransform(z, 0, 0, z, ox, oy);
    X.drawGround(ctx, view, z);
    if (ck && ck.wet > 0.02) { ctx.fillStyle = `rgba(10,20,40,${ck.wet * 0.2})`; ctx.fillRect(view.x0, view.y0, view.x1 - view.x0, view.y1 - view.y0); }
    if (z >= 0.2) X.waterFx(ctx);
    const far = z < 0.125, useImp = z < 0.04, pad = 120 / z;
    const L0 = X.gquery({ x0: view.x0 - pad, y0: view.y0 - pad, x1: view.x1 + pad, y1: view.y1 + pad }, []);
    let list = [];
    if (useImp) list = X.impostorList(L0, z, n);
    else for (const d of L0) { if (far && d.kind === "prop") continue; d.static = true; list.push(d); }
    for (const c of TR.cars) { const dd = X.carDrawable(c); if (dd && overlap(dd.rect, view)) list.push(dd); }
    if (!far) {
      for (const a of [C.player].concat(NPC.list)) {
        if (a.hidden || a.gone) continue;
        const d = actorDrawable(a); if (overlap(d.rect, view)) list.push(d);
        if (a.dog) { const g = dogDrawable(a); if (g) list.push(g); }
      }
      for (const p of FX.list) if (overlap(p.rect, view)) list.push(p);
    }
    list = far ? list.sort((a, b) => b.depth - a.depth || (a.z0 || 0) - (b.z0 || 0)) : sortList(list);
    if (!far) fade(list);
    ctx.imageSmoothingEnabled = z < 0.999;
    const nk = n > 0.02 ? n : 0;
    if (nk) { if (!emitC) emitC = document.createElement("canvas"); if (emitC.width !== Wd || emitC.height !== Hd) { emitC.width = Wd; emitC.height = Hd; } }
    const ex = nk ? emitC.getContext("2d") : null;
    if (ex) { ex.setTransform(1, 0, 0, 1, 0, 0); ex.clearRect(0, 0, Wd, Hd); ex.setTransform(z, 0, 0, z, ox, oy); ex.imageSmoothingEnabled = z < 0.999; }
    const ER = [], core = SP.tinted || (SP.img && SP.img.atlas) || IMG.coreRaw, snowK = ck && ck.snow > 0.05 && IMG.snow ? Math.min(1, ck.snow * 1.3) : 0;
    const cut = (src, f, Xs, Ys, k) => { ex.globalCompositeOperation = "destination-out"; ex.globalAlpha = k == null ? 1 : k; ex.drawImage(src, f[0], f[1], f[2], f[3], Xs - f[4], Ys - f[5], f[2], f[3]); ex.globalAlpha = 1; ex.globalCompositeOperation = "source-over"; };
    for (const d of list) {
      const hit = ex && ER.length && ER.some((r) => overlap(r, d.rect));
      if (d.kind === "prop" || d.kind === "dog") {
        const f = F[d.key]; if (d.alpha < 0.999) ctx.globalAlpha = d.alpha;
        ctx.drawImage(IMG.atlas, f[0], f[1], f[2], f[3], d.X - f[4], d.Y - f[5], f[2], f[3]);
        if (snowK && SF[d.key]) { const s = SF[d.key]; ctx.globalAlpha = snowK * d.alpha; ctx.drawImage(IMG.snow, s[0], s[1], s[2], s[3], d.X - s[4], d.Y - s[5], s[2], s[3]); }
        ctx.globalAlpha = 1;
        if (ex) {
          if (hit) cut(IMG.atlas, f, d.X, d.Y, d.alpha);
          const e = EF[d.key]; if (e) { ex.globalAlpha = d.alpha; ex.drawImage(IMG.emit, e[0], e[1], e[2], e[3], d.X - e[4], d.Y - e[5], e[2], e[3]); ex.globalAlpha = 1; ER.push(d.rect); }
        }
      } else if (d.kind === "part") {
        X.drawPart(ctx, d, z);
        if (ex) { if (hit) X.erasePart(ex, d); if (X.emitPart(ex, d, z, nk)) ER.push(d.rect); }
      } else if (d.kind === "imp") {
        ctx.drawImage(d.I.c, d.I.x0, d.I.y0, d.I.w, d.I.h);
        if (ex) {
          if (hit) { ex.globalCompositeOperation = "destination-out"; ex.drawImage(d.I.c, d.I.x0, d.I.y0, d.I.w, d.I.h); ex.globalCompositeOperation = "source-over"; }
          ex.globalAlpha = nk; ex.drawImage(d.I.e, d.I.x0, d.I.y0, d.I.w, d.I.h); ex.globalAlpha = 1; ER.push(d.rect);
        }
      } else if (d.kind === "car") {
        const f = d.f, src = d.atlas === "cbd" ? IMG.atlas : core;
        if (src) {
          if (far) { const k = Math.min(2.2, Math.max(1, 0.05 / z)); ctx.drawImage(src, f[0], f[1], f[2], f[3], d.X - f[4] * k, d.Y - f[5] * k, f[2] * k, f[3] * k); }
          else ctx.drawImage(src, f[0], f[1], f[2], f[3], d.X - f[4], d.Y - f[5], f[2], f[3]);
        }
        if (ex) { if (hit && src && !far) cut(src, f, d.X, d.Y); X.carLights(ex, d.c, z); ER.push(d.rect); }
      } else if (d.kind === "actor") {
        d.a.draw(ctx);
        if (ex && hit) { ex.globalCompositeOperation = "destination-out"; d.a.draw(ex, true, true); ex.globalCompositeOperation = "source-over"; }
        if (d.a.dog) leash(ctx, d.a);
      } else if (d.kind === "fx") d.draw(ctx, z);
    }
    C.stats.drawn = list.length;
    if (C.debug && !far) X.debugDraw(ctx);
    X.applyLight(ctx, view, z, ox, oy, Wd, Hd, nk);
    if (ex) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "lighter"; ctx.drawImage(emitC, 0, 0); ctx.globalCompositeOperation = "source-over"; }
    ctx.setTransform(z, 0, 0, z, ox, oy);
    X.halos(ctx, view, z, nk);
    X.aviation(ctx, view, z, nk);
    X.weather(ctx, Wd, Hd, z);
    X.labels(ctx, z, ox, oy);
  }
  C.render = X.render = render;
})(window.SP = window.SP || {});
