/* scene-proto · render: the per-frame compositor.
   Static content is cached in 256 px CHUNKS (offscreen canvases): ground bake + facade modules (+ their snow), and a
   separate shadow-chunk layer (union of static ground shadows, drawn with one alpha so it can fade with weather /
   time). Chunks re-render only when something inside changes (state change, lit window, snow step), a few per frame.
   Per frame: chunks -> ground dynamics (decals, puddles, snow footprints, wet darkening, light reflections) ->
   shadows -> y-sorted dynamic objects / cars / actors / particles (+ snow + emissive) -> air (leaves) -> wires ->
   LIGHTMAP (ambient colour + additive light sprites + emissive frames, half-res, multiplied) -> halos -> weather
   particles -> fog -> debug. Everything is drawn at integer pixels; the camera is an integer offset. */
(function (SP) {
  "use strict";
  const R = (SP.render = { stats: { chunks: 0, redraw: 0, drawn: 0, lights: 0 } });
  const CH = 256;
  let ctx, canvas, lmap, lctx, trail, tctx, chunks = [], gx0 = 0, gy0 = 0, gcols = 0, grows = 0, fogGrad = null, fogKey = "";
  const W = () => SP.world, C = () => SP.clock;
  R.init = function (cv) {
    canvas = cv; ctx = cv.getContext("2d");
    lmap = document.createElement("canvas"); lctx = lmap.getContext("2d");
    R.ctx = ctx;
  };
  // ---------- chunk grid ----------
  const rectCache = new Map();
  function frameRect(key, X, Y) { const f = SP.frame(key); return f ? [Math.round(X) - f[4], Math.round(Y) - f[5], Math.round(X) - f[4] + f[2], Math.round(Y) - f[5] + f[3]] : null; }
  /** union screen rect of an object over ALL its states / parts (so a state change invalidates enough) */
  function objRect(o, shadow) {
    const P = W().piece(o), k = o.type + "|" + o.rot + "|" + o.variant + (shadow ? "#s" : "");
    let rel = rectCache.get(k);
    if (!rel) {
      rel = [1e9, 1e9, -1e9, -1e9];
      for (const st of P.states.concat(["lit"])) for (const part of P.parts) {
        let key = SP.frameKey(o.type, o.variant, part, st, o.rot); if (!key) continue;
        if (shadow) { key = SP.frameKey(o.type, "base", P.parts[0], st, o.rot) + "#shadow"; }
        const f = SP.frame(key); if (!f) continue;
        rel[0] = Math.min(rel[0], -f[4]); rel[1] = Math.min(rel[1], -f[5]); rel[2] = Math.max(rel[2], f[2] - f[4]); rel[3] = Math.max(rel[3], f[3] - f[5]);
      }
      rectCache.set(k, rel);
    }
    const X = Math.round(SP.sx(o.x)), Y = Math.round(SP.sy(o.y, o.z));
    return [X + rel[0], Y + rel[1], X + rel[2], Y + rel[3]];
  }
  R.build = function () {
    const w = W(), g = w.groundRect();
    let x0 = g[0], y0 = g[1], x1 = g[0] + g[2], y1 = g[1] + g[3];
    for (const ob of w.bg) { const r = objRect(ob); x0 = Math.min(x0, r[0]); y0 = Math.min(y0, r[1]); x1 = Math.max(x1, r[2]); y1 = Math.max(y1, r[3]); }
    gx0 = Math.floor(x0 / CH) * CH; gy0 = Math.floor(y0 / CH) * CH;
    gcols = Math.ceil((x1 - gx0) / CH); grows = Math.ceil((y1 - gy0) / CH);
    for (const ch of chunks) if (ch.cv) spare.push(ch.cv);
    chunks = [];
    for (let r = 0; r < grows; r++) for (let c = 0; c < gcols; c++) chunks.push({ x: gx0 + c * CH, y: gy0 + r * CH, cv: null, key: "", urgent: true });
    // static shadow casters: every ground-catcher object that is not a moving thing
    R.casters = w.objects.filter((ob) => W().piece(ob).catcher === "ground");
    R.bgByChunk = chunks.map((ch) => w.bgSorted.filter((ob) => { const r = objRect(ob); return !(r[2] < ch.x || r[0] > ch.x + CH || r[3] < ch.y || r[1] > ch.y + CH); }));
    trail = trail || document.createElement("canvas");
    if (trail.width !== g[2] || trail.height !== g[3]) { trail.width = g[2]; trail.height = g[3]; }
    tctx = trail.getContext("2d"); tctx.clearRect(0, 0, trail.width, trail.height);
    R.trailOrigin = [g[0], g[1]];
    for (const ob of w.bg) ob._shown = W().shownState(ob);
    R._wires = null;
  };
  const spare = [];
  function mark(r) { for (const ch of chunks) if (!(r[2] < ch.x || r[0] > ch.x + CH || r[3] < ch.y || r[1] > ch.y + CH)) ch.urgent = true; }
  R.invalidateObj = (o) => { if (chunks.length) mark(objRect(o)); };
  R.invalidateShadow = (o) => {
    if (!chunks.length) return;
    const r = objRect(o, true); mark(r);
    if (o._srect) mark(o._srect);
    o._srect = r;
  };
  R.invalidateAll = () => { for (const ch of chunks) ch.urgent = true; };
  const chunkKey = () => C().season + "|" + W().groundSnowLevel() + "|" + Math.round(C().shadow * 20);
  let stmp = null;
  function renderChunk(ch, i, key) {
    if (!ch.cv) { ch.cv = spare.pop() || document.createElement("canvas"); ch.cv.width = ch.cv.height = CH; }
    const x = ch.cv.getContext("2d"), w = W(), c = C(), sl = w.groundSnowLevel();
    x.setTransform(1, 0, 0, 1, 0, 0); x.imageSmoothingEnabled = false; x.globalAlpha = 1; x.clearRect(0, 0, CH, CH);
    x.translate(-ch.x, -ch.y);
    w.drawGround(x, ch.x, ch.y, CH, CH, c.season, sl);
    // static ground shadows: union into a scratch canvas, composited once at the (quantised) weather/time strength
    if (!stmp) { stmp = document.createElement("canvas"); stmp.width = stmp.height = CH; }
    const s = stmp.getContext("2d"); s.setTransform(1, 0, 0, 1, 0, 0); s.imageSmoothingEnabled = false; s.clearRect(0, 0, CH, CH); s.translate(-ch.x, -ch.y);
    let any = false;
    for (const o of R.casters) {
      if (o.carried || o.hidden) continue;
      const r = objRect(o, true);
      if (r[2] < ch.x || r[0] > ch.x + CH || r[3] < ch.y || r[1] > ch.y + CH) continue;
      SP.drawFrame(s, SP.frameKey(o.type, "base", w.piece(o).parts[0], o.state, o.rot) + "#shadow", SP.sx(o.x), SP.sy(o.y, o.z)); any = true;
    }
    if (any) { x.globalAlpha = Math.round(c.shadow * 20) / 20; x.drawImage(stmp, ch.x, ch.y); x.globalAlpha = 1; }
    for (const o of R.bgByChunk[i]) {
      if (o.hidden) continue;
      const st = (o._shown = w.shownState(o)), X = SP.sx(o.x), Y = SP.sy(o.y, o.z);
      for (const part of w.piece(o).parts) { const k = SP.frameKey(o.type, o.variant, part, st, o.rot); SP.drawFrame(x, k, X, Y); SP.drawSnow(x, k, X, Y, sl); }
    }
    ch.key = key; ch.urgent = false; R.stats.redraw++;
  }
  // ---------- footprints in snow ----------
  let trailFadeT = 0;
  R.stamp = function (x, y, kind) {
    R.stamps = (R.stamps || 0) + 1;
    if (!tctx) return;
    const X = Math.round(SP.sx(x) - R.trailOrigin[0]), Y = Math.round(SP.sy(y) - R.trailOrigin[1]);
    if (kind === 2) { tctx.fillStyle = "rgba(112,126,158,0.7)"; tctx.fillRect(X, Y - 2, 2, 4); return; }
    // a pressed boot print: light rim + darker 3x2 core (reads at 1x on phones)
    tctx.fillStyle = "rgba(150,164,194,0.75)"; tctx.fillRect(X - 2, Y - 1, 4, 3);
    tctx.fillStyle = "rgba(104,118,152,0.85)"; tctx.fillRect(X - 1, Y - 1, 3, 2);
  };
  function fadeTrail(dt) {
    trailFadeT += dt * Math.max(1, C().scale);
    if (trailFadeT > 1.5) { trailFadeT = 0; tctx.globalCompositeOperation = "destination-out"; tctx.fillStyle = `rgba(0,0,0,${C().weather === "snow" ? 0.05 * C().intensity + 0.01 : 0.012})`; tctx.fillRect(0, 0, trail.width, trail.height); tctx.globalCompositeOperation = "source-over"; }
    if (C().snow < 0.08 && trail.dirtyMelt !== true) { tctx.clearRect(0, 0, trail.width, trail.height); trail.dirtyMelt = true; }
    if (C().snow >= 0.08) trail.dirtyMelt = false;
  }
  // ---------- puddle / ripple sprites ----------
  const pudCache = new Map();
  function puddleSprite(p) {
    let c = pudCache.get(p.id); if (c) return c;
    const w = Math.ceil(p.rx * 2 * 48) + 4, h = Math.ceil(p.ry * 2 * 22.5) + 4; c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d"), r = SP.rng(SP.strHash(p.id));
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      const dx = (xx - w / 2) / (w / 2 - 2), dy = (yy - h / 2) / (h / 2 - 2), d = Math.hypot(dx, dy) + (r() - 0.5) * 0.12 + 0.12 * Math.sin(xx * 0.4 + yy);
      if (d < 0.86) { x.fillStyle = d > 0.74 ? "rgba(40,44,56,0.55)" : yy < h * 0.4 ? "rgba(120,134,160,0.85)" : "rgba(78,88,110,0.85)"; x.fillRect(xx, yy, 1, 1); }
    }
    pudCache.set(p.id, c); return c;
  }
  // ---------- lights ----------
  const LP = []; let nL = 0;
  function L(x, y, z, r, cr, cg, cb, a, flat, halo, reflect) {
    const l = LP[nL] || (LP[nL] = {}); nL++;
    l.x = x; l.y = y; l.z = z; l.r = r; l.cr = cr; l.cg = cg; l.cb = cb; l.a = a; l.flat = flat; l.halo = halo; l.reflect = reflect;
  }
  function collectLights() {
    nL = 0;
    const c = C(), w = W(), dark = c.dark, on = c.lampsOn, nk = SP.clamp((dark - 0.12) / 0.45, 0, 1);
    if (nk > 0.01) for (const o of w.objects) {
      switch (o.type) {
        case "p_lamp": {
          if (!on) break;
          const lit = o.state === "ok" || SP.hash(Math.floor(SP.now * 9), SP.strHash(o.id)) > 0.45 && SP.hash(Math.floor(SP.now * 1.3), 7) > 0.25;
          o._lit = lit; if (!lit) break;
          L(o.x, o.y - 0.95, 0, 3.6, 255, 214, 150, 0.95 * nk, true, false, true);
          L(o.x, o.y - 0.95, 4.05, 1.3, 255, 226, 170, 0.8 * nk, false, true, false); break;
        }
        case "p_pole": {
          if (!on) break;
          const p = SP.rotPt([0, -1.45, 6.8], o.rot);
          L(o.x + p[0], o.y + p[1], 0, 4.4, 255, 206, 140, 0.85 * nk, true, false, true);
          L(o.x + p[0], o.y + p[1], 6.8, 1.6, 255, 222, 160, 0.75 * nk, false, true, false); break;
        }
        case "f_window": if (o._shown === "lit" || w.shownState(o) === "lit") { if (o.z < 1) L(o.x + 1.5, o.y - 0.8, 0, 1.8, 255, 190, 120, 0.5 * nk, true, false, true); L(o.x + 1.5, o.y - 0.3, o.z + 1.6, 1.5, 255, 196, 120, 0.35 * nk, false, false, false); } break;
        case "f_shop": if (o.state === "open") { L(o.x + 1.5, o.y - 1.3, 0, 3.4, 255, 236, 196, 0.9 * nk, true, false, true); L(o.x + 1.5, o.y - 0.3, 1.4, 2.0, 255, 240, 210, 0.5 * nk, false, false, false); } break;
        case "p_vending": if (o.state === "ok") { L(o.x, o.y - 0.8, 0, 1.8, 200, 226, 255, 0.75 * nk, true, false, true); L(o.x, o.y - 0.4, 1.4, 1.2, 210, 232, 255, 0.5 * nk, false, true, false); } break;
        case "p_locker": L(o.x, o.y - 0.4, 1.3, 1.4, 120, 200, 255, 0.45 * nk, false, false, false); break;
        case "p_stall": { const v = SP.actors.byId("vendor"); if (v && !v.hidden && v.act === "cook") { L(o.x, o.y - 0.4, 1.95, 2.4, 255, 200, 120, 0.8 * nk, false, true, false); L(o.x, o.y - 0.6, 0, 2.6, 255, 196, 120, 0.6 * nk, true, false, true); } break; }
        case "p_car": if (o.alarmUntil > SP.now && Math.floor(SP.now * 3) % 2 === 0) { L(o.x - 2.1, o.y, 0.65, 1.4, 255, 170, 40, 0.8, false, true, false); L(o.x + 2.1, o.y, 0.65, 1.4, 255, 170, 40, 0.8, false, true, false); } break;
      }
    }
    for (const g of SP.traffic.glows()) L(g.x, g.y, g.z, g.r, g.c[0], g.c[1], g.c[2], g.a, !!g.flat || g.z < 0.1, !g.flat && g.r < 1.5, !!g.flat);
    for (const g of SP.fx.glows) L(g.x, g.y, g.z, g.r, g.c[0], g.c[1], g.c[2], g.a, !!g.flat, false, !!g.flat);
    R.stats.lights = nL;
  }
  function drawLight(x, l, scale) {
    const spr = SP.lightSprite(l.cr, l.cg, l.cb), X = SP.sx(l.x), Y = SP.sy(l.y, l.z), r = l.r * 48, ry = l.flat ? r * 0.47 : r;
    x.globalAlpha = Math.min(1, l.a); x.drawImage(spr, X - r, Y - ry, r * 2, ry * 2);
  }

  // ---------- frame ----------
  const list = [];
  const pdraw = { kind: "player", line: [0, 0, 0, 0], zo: 0, seq: 100000 };
  R.draw = function (al, dt) {
    const w = W(), c = C(), cam = SP.cam, z = cam.zoom, cw = canvas.width, chh = canvas.height, vw = cw / z, vh = chh / z;
    const cx = cam.ix, cy = cam.iy;
    R.stats.redraw = 0;
    for (const o of w.bg) if (o.night_lit && o._shown !== w.shownState(o)) R.invalidateObj(o);
    // chunk upkeep: urgent (state change / never drawn) visible chunks now; slow drifts (snow step, shadow
    // strength, season) a couple per frame, visible first -> no frame spikes while snow accumulates
    const key = chunkKey();
    let budget = 2;
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < chunks.length; i++) {
      const ch = chunks[i], vis = !(ch.x + CH <= cx || ch.x >= cx + vw || ch.y + CH <= cy || ch.y >= cy + vh);
      if (pass === 0 && vis && (ch.urgent || !ch.cv)) renderChunk(ch, i, key);
      else if (ch.key !== key || (ch.urgent && !vis)) { if (pass === (vis ? 0 : 1) && budget > 0) { budget--; renderChunk(ch, i, key); } }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#17181d"; ctx.fillRect(0, 0, cw, chh);
    const sh = SP.fx.shake > 0 ? Math.round(Math.sin(SP.now * 90) * 2) : 0;
    ctx.setTransform(z, 0, 0, z, (-cx + sh) * z, -cy * z);
    let nch = 0;
    for (const ch of chunks) if (!(ch.x + CH <= cx || ch.x >= cx + vw || ch.y + CH <= cy || ch.y >= cy + vh)) { if (ch.cv) ctx.drawImage(ch.cv, ch.x, ch.y); nch++; }
    R.stats.chunks = nch;
    // bg overlays (soot above the burnt window)
    for (const o of w.bg) for (const ov of o.overlays) if (ov.type === "soot" && ov.active) SP.drawFrame(ctx, "fx/soot", SP.sx(o.x + 1.5), SP.sy(o.y, o.z + 2.42), Math.min(1, ov.t / 3));
    // ---- ground dynamics ----
    const gTop = SP.sy(17.95);
    if (c.snow > 0.08) {
      fadeTrail(dt);
      const sx0 = Math.max(0, cx - R.trailOrigin[0]), sy0 = Math.max(0, cy - R.trailOrigin[1]);
      const sw = Math.min(trail.width - sx0, vw), shh = Math.min(trail.height - sy0, vh);
      if (sw > 0 && shh > 0) ctx.drawImage(trail, sx0, sy0, sw, shh, R.trailOrigin[0] + sx0, R.trailOrigin[1] + sy0, sw, shh);
    }
    for (const d of w.decals) SP.drawFrame(ctx, d.key, SP.sx(d.x), SP.sy(d.y));
    if (c.season === "autumn") for (const p of w.leafPiles) if (p.state === "pile") SP.drawFrame(ctx, `fx/leafpile/${SP.strHash(p.id) % 2}`, SP.sx(p.x), SP.sy(p.y));
    const wet = c.wet;
    if (wet > 0.02) {
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = `rgb(${255 - 70 * wet | 0},${255 - 64 * wet | 0},${255 - 46 * wet | 0})`;
      ctx.fillRect(cx, Math.max(cy, gTop), vw, cy + vh - Math.max(cy, gTop));
      ctx.globalCompositeOperation = "source-over";
    }
    const pf = SP.clamp((wet - 0.25) / 0.5, 0, 1);
    for (const p of w.puddles) {
      let f = pf;
      if (f <= 0.02) continue;
      const s = puddleSprite(p), X = SP.sx(p.x), Y = SP.sy(p.y);
      ctx.globalAlpha = 0.85 * f; ctx.drawImage(s, Math.round(X - s.width / 2), Math.round(Y - s.height / 2)); ctx.globalAlpha = 1;
      if (c.weather === "rain" && c.intensity > 0.1) {            // rain rings
        ctx.strokeStyle = "rgba(190,205,225,0.55)"; ctx.lineWidth = 1;
        for (let k = 0; k < 3; k++) {
          const ph = (SP.now * 1.6 + k * 0.33 + SP.hash(SP.strHash(p.id), k)) % 1, seed = Math.floor(SP.now * 1.6 + k * 0.33 + SP.hash(SP.strHash(p.id), k));
          const rx = X + (SP.hash(seed, k) - 0.5) * s.width * 0.6, ry = Y + (SP.hash(k, seed) - 0.5) * s.height * 0.5, rr = 1 + ph * 6;
          ctx.globalAlpha = (1 - ph) * f; ctx.strokeRect(Math.round(rx - rr) + 0.5, Math.round(ry - rr * 0.45) + 0.5, Math.round(rr * 2), Math.max(1, Math.round(rr * 0.9)));
        }
        ctx.globalAlpha = 1;
      }
    }
    for (const o of w.objects) if (o.type === "p_hydrant" && (o.state === "broken" || o.spray)) {   // water pooling around a broken hydrant
      const k = Math.min(1, (c.abs() - o.since) / 6 + 0.3), s = puddleSprite({ id: "hyd", rx: 1.3, ry: 0.5 });
      ctx.globalAlpha = 0.8 * k; ctx.drawImage(s, Math.round(SP.sx(o.x + 0.3) - s.width / 2), Math.round(SP.sy(o.y - 0.7) - s.height / 2)); ctx.globalAlpha = 1;
    }
    collectLights();
    const refl = Math.max(wet, 0) * SP.clamp((c.dark - 0.1) / 0.4, 0, 1);
    if (refl > 0.03) {                                              // reflections of lights on the wet ground
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < nL; i++) {
        const l = LP[i]; if (!l.reflect) continue;
        const spr = SP.lightSprite(l.cr, l.cg, l.cb, "streak"), X = SP.sx(l.x), Y = SP.sy(l.y), hh = 30 + l.r * 14;
        ctx.globalAlpha = Math.min(1, refl * l.a * 0.8); ctx.drawImage(spr, X - 7, Y - 6, 14, hh);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    }
    // ---- moving shadows (static ones are baked into the chunks) ----
    ctx.globalAlpha = c.shadow;
    for (const [k, X, Y] of SP.traffic.shadowKeys(al)) SP.drawFrame(ctx, k, X, Y);
    ctx.fillStyle = "#1a1828";
    for (const a of SP.actors.list) {
      if (a.hidden) continue;
      const [X, Y] = a.screenAt(al);
      ctx.beginPath(); ctx.ellipse(X + 2, Y, a.def && a.def.trips ? 20 : 13, 5, 0, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // ---- y-sorted ----
    list.length = 0;
    w.collect(list); SP.traffic.drawables(list, al); SP.fx.drawables(list);
    const P = SP.player, [PX, PY] = P.screenAt(al);
    const ppx = P.px + (P.x - P.px) * al, ppy = P.py + (P.y - P.py) * al;
    pdraw.line[0] = ppx - 0.2; pdraw.line[2] = ppx + 0.2; pdraw.line[1] = pdraw.line[3] = ppy; list.push(pdraw);
    for (const a of SP.actors.npcs) {
      if (a.hidden) continue;
      const d = a._d || (a._d = { kind: "npc", a, line: [0, 0, 0, 0], zo: 0, seq: a.seq });
      const x = a.px + (a.x - a.px) * al, y = a.py + (a.y - a.py) * al;
      d.line[0] = x - 0.2; d.line[2] = x + 0.2; d.line[1] = d.line[3] = y; list.push(d);
    }
    if (P.carry) {
      const o = P.carry; o.rot = P.dirVec[0] < 0 ? 6 : 2; o.x = ppx + (P.dirVec[0] < 0 ? -0.05 : 0.05); o.y = ppy - 0.32; o._dr = null;
    }
    for (const L_ of w.laundry) { const a = w.byId[L_.from], b = w.byId[L_.to]; list.push(L_._d || (L_._d = { kind: "laundry", L: L_, a, b, line: [Math.min(a.x, b.x), a.y - 0.01, Math.max(a.x, b.x), b.y - 0.01], zo: 1, seq: 90000 })); }
    list.sort(w.compare);
    const pi = list.indexOf(pdraw);
    w.updateFade(list, pi, P.bodyRect(al), dt);
    const snow = SP.snowAmt, nk = SP.clamp((c.dark - 0.12) / 0.45, 0, 1);
    let drawn = 0;
    const vx0 = cx - 8, vx1 = cx + vw + 8, vy0 = cy - 8, vy1 = cy + vh + 8;
    for (let i = 0; i < list.length; i++) {
      const d = list[i];
      if (d.kind === "obj") {
        const f = SP.frame(d.key), X = Math.round(d.X), Y = Math.round(d.Y);
        if (X - f[4] > vx1 || X - f[4] + f[2] < vx0 || Y - f[5] > vy1 || Y - f[5] + f[3] < vy0) continue;
        const a = d.o.alpha[d.part] == null ? 1 : d.o.alpha[d.part];
        SP.drawFrame(ctx, d.key, X, Y, a);
        if (snow > 0.01) SP.drawSnow(ctx, d.key, X, Y, snow, a);
        if (d.emit && nk > 0.01 && emitOn(d.o)) SP.drawEmit(ctx, d.key, X, Y, nk * a);
        drawn++;
      } else if (d.kind === "car") {
        SP.drawFrame(ctx, d.key, d.X, d.Y);
        if (d.car.snow > 0.01) SP.drawSnow(ctx, d.key, d.X, d.Y, d.car.snow);
        if (nk > 0.05 && d.car.state !== "crashed") SP.drawEmit(ctx, d.key, d.X, d.Y, nk);
        drawn++;
      } else if (d.kind === "player") { P.draw(ctx, PX, PY); drawn++; }
      else if (d.kind === "npc") { const [X, Y] = d.a.screenAt(al); d.a.draw(ctx, X, Y); drawn++; }
      else if (d.kind === "overlay") SP.drawFrame(ctx, d.key, d.X, d.Y, d.alpha);
      else if (d.kind === "part") SP.fx.drawPart(ctx, d.p);
      else if (d.kind === "fire") SP.fx.drawFire(ctx, d.o, d.ov);
      else if (d.kind === "laundry") drawLaundry(d);
    }
    R.stats.drawn = drawn; R.lastList = list; R.playerIndex = pi;
    SP.fx.drawAir(ctx);
    drawWires(c);
    for (const a of SP.actors.npcs) if (!a.hidden && a.bubble) { const [X, Y] = a.screenAt(al); a.drawBubble(ctx, X, Y); }
    for (const o of w.objects) if (o.honkT > SP.now) bubble(SP.sx(o.x), SP.sy(o.y, 1.8), "嘀！");
    for (const car of SP.traffic.cars) if (car.honkT > SP.now) bubble(SP.sx(car.x), SP.sy(car.y, 1.8), "嘀嘀！");
    // ---- lightmap (multiply) ----
    const amb = c.ambient, tinted = amb[0] < 253 || amb[1] < 253 || amb[2] < 253, needL = tinted && (c.dark > 0.06 || nk > 0.01);
    R.stats.lightmap = needL;
    if (tinted && !needL) {         // daylight colour grade only: one multiply fill, no lightmap
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = `rgb(${amb[0]},${amb[1]},${amb[2]})`;
      ctx.fillRect(0, 0, cw, chh); ctx.globalCompositeOperation = "source-over";
    }
    if (needL) {
      const lw = Math.ceil(cw / 2), lh = Math.ceil(chh / 2);
      if (lmap.width !== lw || lmap.height !== lh) { lmap.width = lw; lmap.height = lh; }
      lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.globalCompositeOperation = "source-over"; lctx.globalAlpha = 1;
      lctx.fillStyle = `rgb(${amb[0]},${amb[1]},${amb[2]})`; lctx.fillRect(0, 0, lw, lh);
      lctx.globalCompositeOperation = "lighter";
      lctx.setTransform(z / 2, 0, 0, z / 2, (-cx + sh) * z / 2, -cy * z / 2);
      for (let i = 0; i < nL; i++) drawLight(lctx, LP[i]);
      if (nk > 0.01) {
        for (const o of w.bg) if (o._shown === "lit" || (o.type === "f_shop" && o.state === "open")) {
          const X = SP.sx(o.x), Y = SP.sy(o.y, o.z); if (X > cx + vw || X + 160 < cx || Y < cy || Y - 160 > cy + vh) continue;
          SP.drawEmit(lctx, SP.frameKey(o.type, o.variant, "main", o._shown || o.state, o.rot), X, Y, nk);
        }
        for (let i = 0; i < list.length; i++) { const d = list[i]; if (d.kind === "obj" && d.emit && emitOn(d.o)) SP.drawEmit(lctx, d.key, d.X, d.Y, nk); else if (d.kind === "car" && d.car.state !== "crashed") SP.drawEmit(lctx, d.key, d.X, d.Y, nk); }
      }
      lctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "multiply";   // nearest 2x upscale: 2 px light steps read as pixel art, and it is much cheaper than bilinear
      ctx.drawImage(lmap, 0, 0, cw, chh);
      ctx.imageSmoothingEnabled = false; ctx.globalCompositeOperation = "source-over";
      // emissive pixels of the cached facade (lit windows / shop) on top, then halos
      ctx.setTransform(z, 0, 0, z, (-cx + sh) * z, -cy * z);
      if (nk > 0.01) for (const o of w.bg) if (o._shown === "lit" || (o.type === "f_shop" && o.state === "open")) {
        const X = SP.sx(o.x), Y = SP.sy(o.y, o.z); if (X > cx + vw || X + 160 < cx || Y < cy || Y - 160 > cy + vh) continue;
        SP.drawEmit(ctx, SP.frameKey(o.type, o.variant, "main", o._shown || o.state, o.rot), X, Y, nk * 0.9);
      }
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < nL; i++) { const l = LP[i]; if (!l.halo) continue; const spr = SP.lightSprite(l.cr, l.cg, l.cb), X = SP.sx(l.x), Y = SP.sy(l.y, l.z), r = 10 + l.r * 8 * (1 + c.fog); ctx.globalAlpha = Math.min(1, l.a * 0.55); ctx.drawImage(spr, X - r, Y - r, r * 2, r * 2); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    }
    // ---- weather + fog (screen space) ----
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    SP.fx.updateWeather(dt, cx, cy, cw, chh);
    if (z !== 1) ctx.setTransform(z, 0, 0, z, 0, 0);
    SP.fx.drawWeather(ctx, vw, vh);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (c.fog > 0.02) {
      const key = (amb[0] >> 3) + "," + (amb[1] >> 3) + "," + (amb[2] >> 3) + "," + chh;
      if (key !== fogKey) {
        fogKey = key; fogGrad = ctx.createLinearGradient(0, 0, 0, chh);
        const r = Math.min(255, amb[0] * 0.82 + 30) | 0, g = Math.min(255, amb[1] * 0.83 + 30) | 0, b = Math.min(255, amb[2] * 0.85 + 34) | 0;
        fogGrad.addColorStop(0, `rgba(${r},${g},${b},0.92)`); fogGrad.addColorStop(0.45, `rgba(${r},${g},${b},0.55)`); fogGrad.addColorStop(1, `rgba(${r},${g},${b},0.3)`);
      }
      ctx.globalAlpha = c.fog * 0.8; ctx.fillStyle = fogGrad; ctx.fillRect(0, 0, cw, chh); ctx.globalAlpha = 1;
    }
  };
  function emitOn(o) {
    const c = C();
    switch (o.type) {
      case "p_lamp": return c.lampsOn && o._lit !== false && (o.state === "ok" || o._lit);
      case "p_vending": return o.state === "ok";
      case "p_locker": return true;
      default: return true;
    }
  }
  function bubble(X, Y, t) {
    ctx.font = "bold 11px sans-serif"; const w = ctx.measureText(t).width + 8;
    ctx.fillStyle = "rgba(250,248,240,0.95)"; ctx.fillRect(Math.round(X - w / 2), Math.round(Y - 14), Math.round(w), 14);
    ctx.fillStyle = "#c0392b"; ctx.textAlign = "center"; ctx.fillText(t, Math.round(X), Math.round(Y - 3));
  }
  function drawLaundry(d) {
    const c = C(), a = d.a, b = d.b, z = d.L.z, ax = SP.sx(a.x), ay = SP.sy(a.y, z), bx = SP.sx(b.x), by = SP.sy(b.y, z);
    const sag = 7, len = b.x - a.x;
    ctx.strokeStyle = "rgba(60,60,64,0.95)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 + sag * 2, bx, by); ctx.stroke();
    const t = SP.now, wind = c.wind;
    d.L.items.forEach(([u, wm, hm, col], i) => {
      const f = u / len, x = SP.lerp(ax, bx, f), y = SP.lerp(ay, by, f) + sag * 4 * f * (1 - f) + 1;
      const w = wm * 48, h = hm * 42.4, sw = (Math.sin(t * (1.6 + wind * 2) + i * 1.7) * 0.5 + 0.6) * wind * 9;
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(Math.round(x - w / 2), Math.round(y)); ctx.lineTo(Math.round(x + w / 2), Math.round(y));
      ctx.lineTo(Math.round(x + w / 2 + sw), Math.round(y + h)); ctx.lineTo(Math.round(x - w / 2 + sw * 1.1), Math.round(y + h - 1)); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(Math.round(x - w / 2 + sw), Math.round(y + h - 2), Math.round(w), 2);
      ctx.fillStyle = "#3a3a40"; ctx.fillRect(Math.round(x - w / 2 + 1), Math.round(y - 1), 1, 2); ctx.fillRect(Math.round(x + w / 2 - 2), Math.round(y - 1), 1, 2);
      if (SP.snowAmt > 0.3) { ctx.fillStyle = "#eef2f8"; ctx.fillRect(Math.round(x - w / 2), Math.round(y), Math.round(w), 1); }
    });
  }
  function anchorPt(spec) {
    if (typeof spec[0] === "number") return [SP.sx(spec[0]), SP.sy(spec[1], spec[2])];
    const o = W().byId[spec[0]], a = W().piece(o).wire_anchors[spec[1]], p = SP.rotPt(a, o.rot);
    return [SP.sx(o.x + p[0]), SP.sy(o.y + p[1], p[2])];
  }
  function drawWires(c) {
    ctx.strokeStyle = "rgba(34,32,36,0.85)"; ctx.lineWidth = 1;
    const wires = W().data.wires || [];
    if (!R._wires) R._wires = wires.map((wi) => { const a = anchorPt(wi.from), b = anchorPt(wi.to); return [a, b, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.06]; });
    ctx.beginPath();
    for (const [a, b, mx, my] of R._wires) { ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(mx, my, b[0], b[1]); }
    ctx.stroke();
    if (SP.snowAmt > 0.4) { ctx.strokeStyle = "rgba(236,240,248,0.7)"; ctx.beginPath(); for (const [a, b, mx, my] of R._wires) { ctx.moveTo(a[0], a[1] - 1); ctx.quadraticCurveTo(mx, my - 1, b[0], b[1] - 1); } ctx.stroke(); }
  }
})(window.SP);
