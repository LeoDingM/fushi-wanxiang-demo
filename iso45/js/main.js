/* scene-proto-45 · main loop: input (WASD = SCREEN directions mapped to world vectors), 李默 + 5 NPCs with
   collision-safe movement, camera, layered render (diamond ground bake -> decals -> shadow layer -> iso-sorted
   objects / cars / characters / FX with occluder fade -> wires -> light glows), time of day, events, debug overlay
   (?debug=1 / G), test hooks (window.__proto) incl. the clipping audit. */
(function (SP) {
  "use strict";
  const Q = new URLSearchParams(location.search);
  const canvas = document.getElementById("game");
  if (Q.get("w")) canvas.width = +Q.get("w");
  if (Q.get("h")) canvas.height = +Q.get("h");
  const mainCtx = canvas.getContext("2d");
  let ctx = mainCtx;                                   // current render target (offscreen when zoomed out)
  const ssCanvas = document.createElement("canvas");   // zoom < 1: world drawn 1:1 here, then smoothly downscaled
  SP.season = Q.get("season") || "summer";
  const shadowCanvas = document.createElement("canvas"), sctx = shadowCanvas.getContext("2d");
  const W = SP.world, keys = Object.create(null);
  const st = (SP.state = { debug: Q.get("debug") === "1", time: "day", timeAnim: null, toast: null, manual: Q.get("manual") === "1", fps: 60, near: null,
                           npcs: Q.get("npcs") !== "0", autoWalk: null, grade: Q.get("grade") !== "0" });
  SP.now = 0;
  const player = (SP.player = new SP.Actor({ id: "limo", set: "li_mo", isPlayer: true, radius: 0.22, speed: 1.7, height: 1.85 }));
  // framing: desktop default 0.5 (≈ the concept art: the 6-storey building is ~1/2 screen high); phone default 1
  // (characters ~69 px); +/- buttons or = / - keys step through ZOOMS. zoom < 1 is rendered 1:1 offscreen and
  // downscaled with smoothing (no dropped pixel rows), zoom >= 1 is nearest-neighbour.
  const ZOOMS = (SP.ZOOMS = [0.5, 0.67, 1, 1.5, 2]);
  SP.defaultZoom = 0.5;
  const cam = (SP.cam = { x: 0, y: 0, zoom: +(Q.get("zoom") || SP.defaultZoom), ready: false, lock: null });
  SP.zoomStep = function (d) {
    let i = ZOOMS.findIndex((z) => z >= cam.zoom - 1e-3); if (i < 0) i = ZOOMS.length - 1;
    i = SP.clamp(i + d, 0, ZOOMS.length - 1); SP.userZoom = cam.zoom = ZOOMS[i]; cam.ready = false; return cam.zoom;
  };

  // ---------- time of day / calendar / weather: js/clock.js (shared with the front-view line) ----------
  // continuous clock (1 real s = 1 game min), T = fast-forward to the next of morning / day / afternoon / dusk / night,
  // N = next day, Y = next season, R = next weather. The lightmap (js/env.js) does all the lighting.
  const CK = SP.clock;
  SP.tint = SP.tint || {}; SP.tint.night = 0;
  function setTime(name, instant) { if (name === "next") CK.cycleTime(); else CK.setTimeName(name, instant); syncLight(); }
  function syncLight() { SP.tint.night = SP.env.night = SP.clamp((CK.dark - 0.2) / 0.4, 0, 1); }
  Object.defineProperty(st, "time", { get: () => CK.timeName(), configurable: true });

  // ---------- input ----------
  const down = (...k) => k.some((x) => keys[x] || (SP.input && SP.input[x]));
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    keys[k] = true;
    if (e.repeat) return;
    for (const [name, ev] of Object.entries(W.data.events)) if (ev.key === k) fireEvent(name);
    if (k === "0") resetScene();
    if (k === "t") { CK.cycleTime(); toast("时间快进"); }
    if (k === "n") { CK.nextDay(); toast("快进到第二天早上"); }
    if (k === "r") { CK.cycleWeather(); toast("天气：" + CK.weatherName(CK.target)); }
    if (k === "f") kick();
    if (k === "g") st.debug = !st.debug;
    if (k === "e") interact();
    if (k === "u") toggleUmbrella();
    if (k === "=" || k === "+") SP.zoomStep(1);
    if (k === "-" || k === "_") SP.zoomStep(-1);
    if (k === "y") setSeason(SEASONS[(SEASONS.indexOf(SP.season) + 1) % SEASONS.length]);
    if (k === "l") st.showLog = !st.showLog;
  });
  window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));
  window.addEventListener("blur", () => { for (const k in keys) keys[k] = false; });
  const SEASONS = ["summer", "autumn", "winter", "spring"];
  function setSeason(se) { CK.setSeason(se); SP.season = CK.season; W.bakeGround(); toast(`${CK.seasonName()} · ${CK.dateLabel()} · 今日${CK.weatherName(CK.target)}`); }
  function fireEvent(name) { if (W.trigger(name)) toast(`事件：${W.data.events[name].label}`); }
  function toast(msg, ms) { st.toast = { msg, t: (ms || 1800) / 1000 }; }
  function toggleUmbrella() {
    player.umbrella = !player.umbrella;
    if (player.umbrella && !SP.actors.shapeClear(player, player.x, player.y)) { player.umbrella = false; toast("太挤了，伞撑不开"); return false; }
    toast(player.umbrella ? "撑伞（伞面半径 0.55 m 参与碰撞）" : "收伞"); return true;
  }
  function spawnActors() {
    const sp = W.data.spawn;
    player.x = Q.get("px") ? +Q.get("px") : sp.x; player.y = Q.get("py") ? +Q.get("py") : sp.y; player.setDir(Q.get("dir") || sp.dir);
    player.umbrella = false;
    SP.actors.list = [player].concat(st.npcs ? SP.npcs.init(W.data.npcs) : []);
    SP.actors.resolve(12);                       // never start interpenetrating
  }
  function resetScene() { player.carry = null; W.load(window.SCENE_DATA); SP.fx.reset(); SP.traffic.reset(); SP.env.clearStamps(); spawnActors(); toast("场景已重置"); }
  function nearest() { return player.carry ? null : W.nearest(player.x, player.y); }
  /** F / 踢: a short kick pose; kicks the nearest kickable thing (lamp, bin, bike, vending machine, pot, poster, window,
      parked car, laundry line, puddle, leaf pile) */
  function kick() {
    if (player.kickT > 0 || player.carry) return;
    player.kickT = 0.38;
    const o = W.nearest(player.x, player.y), a = o && W.actionFor(o, "kick");
    if (!a) { toast("踢了一脚空气"); return; }
    const r = W.act(o, "kick", player); if (r) toast(r);
  }
  function interact() {
    if (player.carry) { if (W.parkBike(player)) toast("停好车、锁上"); else toast("这里停不下（会挡路或压到东西）"); return; }
    const o = st.near; if (!o) return;
    if (o.interact === "gate") {
      const open = o.state !== "open", gates = W.objects.filter((g) => g.interact === "gate");
      gates.forEach((g) => (g.state = open ? "open" : "closed")); W.rebuildColliders();
      // a gate leaf may never swing into a character
      if (SP.actors.list.some((a) => a.circles().some(([x, y, r]) => W.blockedStatic(x, y, r)))) { gates.forEach((g) => (g.state = open ? "closed" : "open")); W.rebuildColliders(); toast("有人挡着门"); return; }
      toast(open ? "推开铁门" : "关上铁门（院子被封住）");
    } else if (o.interact === "door") {
      o.state = o.state === "open" ? "closed" : "open"; W.rebuildColliders(); toast(o.state === "open" ? "单元门开了（原型不做室内）" : "单元门关上");
    } else if (o.interact === "stall") toast("王阿姨早点摊 · 豆浆油条 ¥8");
    else if (o.interact === "locker") toast("快递柜：没有你的件");
    else { const r = W.act(o, "use", player); if (r) toast(r); }
  }

  // ---------- simulation ----------
  function inputVec() {
    if (st.autoWalk) return st.autoWalk(st.dtNow, !!player.blockedBy);
    let dx = 0, dy = 0;
    if (down("w", "arrowup")) dy -= 1;
    if (down("s", "arrowdown")) dy += 1;
    if (down("a", "arrowleft")) dx -= 1;
    if (down("d", "arrowright")) dx += 1;
    if (dx || dy) return [dx, dy];
    const T = SP.touchInput;                      // floating joystick (js/mobile.js): unit screen direction x magnitude
    if (T && T.active && T.m > 0) return [T.x * T.m, T.y * T.m, "touch"];
    return null;
  }
  function movePlayer(dt) {
    const v = inputVec();
    let dist = 0, dir = null;
    if (v) {
      const [wx, wy] = SP.screenToWorldDir(v[0], v[1]), step = player.speed * dt * (v[2] === "touch" ? Math.max(0.35, Math.min(1, Math.hypot(v[0], v[1]))) : 1);
      dist = SP.actors.move(player, wx * step, wy * step);
      if (dist > 0) SP.env.stepFx(player, dist);
      dir = SP.dirFromWorld(wx, wy);
      st.blockedBy = player.blockedBy || st.blockedBy;
      // keep a diagonal facing for a moment when one of two keys is released first (no 1-frame snap)
      const diag = v[2] !== "touch" && v[0] && v[1];
      if (diag) { st.lastDiag = dir; st.lastDiagT = 0; } else st.lastDiagT = (st.lastDiagT || 0) + dt;
    } else if (player.moving && st.lastDiag && st.lastDiagT < 0.12) dir = st.lastDiag;
    if (!v) st.lastDiagT = 9;
    player.update(dt, !!v, dir, dist);
  }
  function update(dt) {
    SP.now += dt; st.dtNow = dt;
    CK.update(dt); syncLight();
    if (SP.season !== CK.season) W.applySeason();
    const gmin = Math.floor(CK.abs());
    if (gmin !== W.lastRuleMin) { W.lastRuleMin = gmin; W.updateRules(); }
    if (player.kickT > 0) player.kickT = Math.max(0, player.kickT - dt);
    movePlayer(dt);
    SP.npcs.update(dt);
    W.updateEvents(dt);
    SP.traffic.update(dt);
    SP.actors.resolve(4);
    SP.fx.update(dt);
    SP.env.update(dt);
    st.near = nearest();
    if (st.toast) { st.toast.t -= dt; if (st.toast.t <= 0) st.toast = null; }
  }

  // ---------- camera ----------
  /* camera clamp: every corner of the view must lie over the ground rectangle (no void at any edge). For the 2:1
     projection the four corner constraints are two independent intervals in p = u - v and q = u + v
     (u = cam.x / 64, v = cam.y / 32), i.e. a rotated box: clamp p and q, convert back. */
  function clampCam(tx, ty, vw, vh) {
    const [X0, Y0, X1, Y1] = W.groundRect, m = 0.6;
    let p = tx / 64 - ty / 32, q = tx / 64 + ty / 32;
    const p0 = X0 + m + vh / 32, p1 = X1 - m - vw / 64, q0 = -(Y1 - m), q1 = -(Y0 + m + vh / 32 + vw / 64);
    p = p0 <= p1 ? SP.clamp(p, p0, p1) : (p0 + p1) / 2; q = q0 <= q1 ? SP.clamp(q, q0, q1) : (q0 + q1) / 2;
    return [(p + q) / 2 * 64, (q - p) / 2 * 32];
  }
  SP.clampCam = clampCam;
  function updateCam(dt) {
    // big screens: never zoom out further than the map can fill (else void at the corners) -> next zoom step up
    if (W.groundRect && !cam.free) {
      const [X0, Y0, X1, Y1] = W.groundRect, zmin = (canvas.height / 32 + canvas.width / 64) / (Math.min(X1 - X0, Y1 - Y0) - 1.2);
      if (cam.zoom < zmin - 1e-6) { cam.zoom = ZOOMS.find((q) => q >= zmin) || ZOOMS[ZOOMS.length - 1]; cam.ready = false; }
    }
    const z = cam.zoom, vw = canvas.width / z, vh = canvas.height / z;
    let tx, ty;
    if (cam.lock) { [tx, ty] = [SP.sx(cam.lock[0], cam.lock[1]) - vw / 2, SP.sy(cam.lock[0], cam.lock[1], 0) - vh / 2]; }
    else { const [X, Y] = player.screen(); tx = X - vw / 2; ty = Y - 40 - vh / 2 + (SP.camOffsetY || 0) / z; }
    if (!cam.free) [tx, ty] = clampCam(tx, ty, vw, vh);
    const k = cam.ready ? Math.min(1, dt * 4) : 1;
    cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k; cam.ready = true;
  }

  // ---------- painter list ----------
  function actorDrawable(a) {
    const box = W.actorBox(a);
    return { kind: "actor", actor: a, rect: a.spriteRect(), box, depth: a.x + a.y, zo: 0, sid: "actor/" + a.id };
  }
  /** all drawables overlapping `view` (a rect, an array of rects, or null = everything), in painter order */
  function buildList(view) {
    const all = [];
    W.drawables(all); SP.traffic.drawables(all); SP.fx.drawables(all); SP.env.drawables(all);
    for (const a of SP.actors.list) if (!a.hidden) all.push(actorDrawable(a));
    const vs = view == null ? null : Array.isArray(view) ? view : [view];
    const list = vs ? all.filter((d) => vs.some((v) => SP.rectsOverlap(d.rect, v))) : all;
    return W.sortDrawables(list);
  }

  // ---------- render ----------
  let lastList = [];
  function render() {
    SP.updateTint(); SP.frameNo = (SP.frameNo || 0) + 1;
    const ss = cam.zoom < 0.999, tgt = ss ? ssCanvas : canvas;
    if (ss) { const w = Math.round(canvas.width / cam.zoom), h = Math.round(canvas.height / cam.zoom); if (ssCanvas.width !== w || ssCanvas.height !== h) { ssCanvas.width = w; ssCanvas.height = h; } }
    ctx = ss ? ssCanvas.getContext("2d") : mainCtx;
    const z = ss ? 1 : cam.zoom, cx = Math.round(cam.x * z) / z, cy = Math.round(cam.y * z) / z;
    const view = { x0: cx - 8, y0: cy - 8, x1: cx + tgt.width / z + 8, y1: cy + tgt.height / z + 8 };
    st.view = view;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#17181d"; ctx.fillRect(0, 0, tgt.width, tgt.height);
    ctx.setTransform(z, 0, 0, z, -cx * z, -cy * z);
    W.drawGround(ctx, view);
    for (const d of W.decals) SP.drawFrame(ctx, d.key, SP.sx(d.x, d.y), SP.sy(d.x, d.y, 0));
    SP.env.drawGround(ctx, view);
    // shadow layer: union of opaque shadow frames, composited once (no double-darkening)
    if (shadowCanvas.width !== tgt.width || shadowCanvas.height !== tgt.height) { shadowCanvas.width = tgt.width; shadowCanvas.height = tgt.height; }
    sctx.setTransform(1, 0, 0, 1, 0, 0); sctx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
    sctx.imageSmoothingEnabled = false;
    sctx.setTransform(z, 0, 0, z, -cx * z, -cy * z);
    for (const o of W.objects) {
      const P = W.piece(o); if (P.catcher !== "ground" || o.carried) continue;
      const X = SP.sx(o.x, o.y), Y = SP.sy(o.x, o.y, o.z);
      if (X < view.x0 - 500 || X > view.x1 + 500 || Y < view.y0 - 300 || Y > view.y1 + 400) continue;
      SP.drawFrame(sctx, SP.frameKey(o.type, o.variant, P.parts[0], o.state, o.rot) + "#shadow", X, Y, 1, true);
    }
    for (const [k, X, Y] of SP.traffic.shadowKeys()) SP.drawFrame(sctx, k, X, Y, 1, true);
    sctx.fillStyle = "#1a1828";
    for (const a of SP.actors.list) {
      if (a.hidden) continue;
      if (a.vehicle) { for (const [x, y] of a.circles()) { sctx.beginPath(); sctx.ellipse(SP.sx(x, y) - 2, SP.sy(x, y, 0), 15, 7.5, 0, 0, Math.PI * 2); sctx.fill(); } continue; }
      const [X, Y] = a.screen(), r = a.umbrella ? 22 : 12; sctx.beginPath(); sctx.ellipse(X - 2, Y, r, r / 2, 0, 0, Math.PI * 2); sctx.fill();
    }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = CK.shadow * (1 - 0.6 * SP.tint.night); ctx.drawImage(shadowCanvas, 0, 0); ctx.restore();
    // iso-sorted: object parts + cars + particles/fire + characters
    const list = buildList(view);
    const pi = list.findIndex((d) => d.kind === "actor" && d.actor === player);
    W.updateFade(list, pi, player.bodyRect(), st.lastDt || 1 / 60);
    const E = SP.env, snow = CK.snow, lights = E.lights(view);
    E.drawReflections(ctx, lights, view);
    E.emitBegin(tgt, z, cx, cy);
    for (const d of list) {
      if (d.kind === "obj") { const a = d.o.alpha[d.part] == null ? 1 : d.o.alpha[d.part]; SP.drawFrame(ctx, d.key, d.X, d.Y, a); if (snow > 0.01) SP.drawSnow(ctx, d.key, d.X, d.Y, snow, a); }
      else if (d.kind === "overlay") SP.drawFrame(ctx, d.key, d.X, d.Y, d.alpha);
      else if (d.kind === "car") { SP.drawFrame(ctx, d.key, d.X, d.Y); if (snow > 0.01) SP.drawSnow(ctx, d.key, d.X, d.Y, snow * (d.car && d.car.v > 0.5 ? 0.5 : 1)); }
      else if (d.kind === "part") SP.fx.drawPart(ctx, d.p);
      else if (d.kind === "fire") SP.fx.drawFire(ctx, d.o, d.ov);
      else if (d.kind === "laundry") E.drawLaundry(ctx, d);
      else if (d.kind === "actor") d.actor.draw(ctx);
      E.emitAfter(d);
    }
    lastList = list; st.playerIndex = pi;
    drawWires();
    E.applyLight(ctx, tgt, z, cx, cy, lights);
    E.emitComposite(ctx);
    E.drawHalos(ctx, lights);
    E.drawCarFx(ctx);
    if (st.debug) drawDebug(list, pi);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (ss) { ctx = mainCtx; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high"; ctx.drawImage(ssCanvas, 0, 0, canvas.width, canvas.height); ctx.imageSmoothingEnabled = false; }
    grade();
    SP.env.drawFog(ctx, canvas.width, canvas.height);
    SP.env.drawWeather(ctx, canvas.width, canvas.height, cam.x, cam.y, cam.zoom, st.lastDt || 1 / 60);
    if (st.debug) drawDebugText(list, pi);
    hud();
  }
  /* colour grade (screen space): late-afternoon / dusk sun from the upper right (warm soft-light wash), cooler shade
     towards the lower left; night = blue vignette. Cheap: two gradient fills per frame. */
  function grade() {
    // (the clock's ambient colour already tints the frame; this only adds the directional sun wash, clear days only)
    const w = canvas.width, h = canvas.height, t = SP.tint, n = t.night, tn = st.time, clear = CK.weather === "clear" ? 1 : 1 - CK.intensity;
    const warm = (tn === "afternoon" ? 0.55 : tn === "dusk" ? 0.45 : 0) * clear;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (st.grade && warm > 0) {
      ctx.save(); ctx.globalCompositeOperation = "soft-light";
      const g = ctx.createLinearGradient(w, 0, w * 0.25, h);
      g.addColorStop(0, `rgba(255,196,120,${0.55 * warm})`); g.addColorStop(0.55, `rgba(255,214,160,${0.18 * warm})`); g.addColorStop(1, `rgba(70,80,130,${0.35 * warm})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
    }
    if (n > 0.02) {
      const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.95);
      g.addColorStop(0, "rgba(10,12,30,0)"); g.addColorStop(1, `rgba(10,12,30,${0.45 * n})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
  }
  function anchorPt(spec) {
    if (typeof spec[0] === "number") return SP.scr(spec[0], spec[1], spec[2]);
    const o = W.byId[spec[0]], a = W.piece(o).wire_anchors[spec[1]], p = SP.rotPt(a, o.rot);
    return SP.scr(o.x + p[0], o.y + p[1], p[2]);
  }
  function drawWires() {
    ctx.save(); ctx.strokeStyle = SP.tint.night > 0.5 ? "rgba(20,20,30,0.9)" : "rgba(34,32,36,0.85)"; ctx.lineWidth = 1;
    const V = st.view;
    for (const w of W.data.wires || []) {
      const a = anchorPt(w.from), b = anchorPt(w.to);
      if (V && (Math.max(a[0], b[0]) < V.x0 || Math.min(a[0], b[0]) > V.x1 || Math.min(a[1], b[1]) > V.y1 + 200 || Math.max(a[1], b[1]) < V.y0)) continue;
      const n = w.n || 1, sag = w.sag || 0.06;              // bundles: n wires, each a little lower / slacker
      for (let i = 0; i < n; i++) {
        ctx.beginPath(); ctx.moveTo(a[0], a[1] + i * 2);
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + i * 2 + Math.hypot(b[0] - a[0], b[1] - a[1]) * (sag + i * 0.012);
        ctx.quadraticCurveTo(mx, my, b[0], b[1] + i * 2); ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ---------- debug overlay ----------
  function poly(pts, stroke, fill, z) {
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(SP.sx(x, y), SP.sy(x, y, z || 0)) : ctx.moveTo(SP.sx(x, y), SP.sy(x, y, z || 0)))); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
  }
  function line(x0, y0, x1, y1, z) { ctx.beginPath(); ctx.moveTo(SP.sx(x0, y0), SP.sy(x0, y0, z || 0)); ctx.lineTo(SP.sx(x1, y1), SP.sy(x1, y1, z || 0)); ctx.stroke(); }
  function circle(x, y, r, stroke, fill) {
    ctx.beginPath(); ctx.ellipse(SP.sx(x, y), SP.sy(x, y, 0), r * SP.KX * Math.SQRT2, r * SP.KY * Math.SQRT2, 0, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.strokeStyle = stroke; ctx.stroke();
  }
  function drawDebug(list, pi) {
    ctx.save(); ctx.lineWidth = 1;
    const G = W.data.ground, [X0, Y0] = G.origin, X1 = X0 + G.cols * 2, Y1 = Y0 + G.rows * 2;
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    for (let c = 0; c <= G.cols; c++) line(X0 + c * 2, Y0, X0 + c * 2, Y1);
    for (let r = 0; r <= G.rows; r++) line(X0, Y0 + r * 2, X1, Y0 + r * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.22)";            // 0.5 m logic grid (16 x 8 px diamonds) around 李默
    const gx = Math.round(player.x * 2) / 2, gy = Math.round(player.y * 2) / 2;
    for (let i = -8; i <= 8; i++) { line(gx + i * 0.5, gy - 4, gx + i * 0.5, gy + 4); line(gx - 4, gy + i * 0.5, gx + 4, gy + i * 0.5); }
    const tr = W.data.traffic;
    ctx.setLineDash([4, 3]);
    for (const cw of tr.crosswalks) poly([[cw.x0, cw.y0], [cw.x1, cw.y0], [cw.x1, cw.y1], [cw.x0, cw.y1]], "rgba(80,220,255,0.9)");
    { const b = tr.intersection; poly([[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]], "rgba(255,255,120,0.6)"); }
    for (const l of tr.lanes) {
      ctx.strokeStyle = "rgba(80,220,255,0.45)";
      if (l.axis === "x") line(l.range[0], l.c, l.range[1], l.c); else line(l.c, l.range[0], l.c, l.range[1]);
      ctx.strokeStyle = "rgba(255,80,80,0.95)";
      for (const s of l.stops) { if (l.axis === "x") line(s.at, l.c - 1.6, s.at, l.c + 1.6); else line(l.c - 1.6, s.at, l.c + 1.6, s.at); }
    }
    ctx.strokeStyle = "rgba(120,255,140,0.55)";            // NPC routes
    for (const n of W.data.npcs || []) { const R = n.route; for (let i = 0; i + 1 < R.length + (n.mode === "loop" ? 1 : 0); i++) { const a = R[i], b = R[(i + 1) % R.length]; line(a[0], a[1], b[0], b[1]); } }
    ctx.setLineDash([]);
    for (const c of W.colliders) poly(c.poly, "rgba(255,70,70,0.95)", "rgba(255,60,60,0.16)");
    for (const c of SP.traffic.cars) poly(c.poly, "rgba(255,170,40,0.95)", "rgba(255,170,40,0.18)");
    // sort boxes (ground rect of the 3D box) + painter index
    ctx.font = "9px monospace"; ctx.textAlign = "center";
    list.forEach((d, i) => {
      if (d.kind === "part" || d.kind === "fire" || d.kind === "overlay") return;
      const b = d.box;
      if (d.kind === "actor") { for (const [x, y, r] of b.circles) circle(x, y, r, d.actor === player ? "#00ffd0" : "#7dff8a", d.actor === player ? "rgba(0,255,208,0.15)" : "rgba(125,255,138,0.15)"); }
      else { ctx.strokeStyle = d.kind === "car" ? "#ffb030" : "rgba(255,60,220,0.75)"; poly([[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]], ctx.strokeStyle, null, b.z0); }
      if (d.kind !== "obj" || (d.o.z || 0) < 0.01) {
        const mx = (b.x0 + b.x1) / 2, my = (b.y0 + b.y1) / 2;
        ctx.fillStyle = d.kind === "actor" ? "#00ffd0" : i > pi ? "#ffe060" : "#c8c8ff";
        ctx.fillText(String(i), SP.sx(mx, my), SP.sy(mx, my, b.z0) + 10);
      }
    });
    ctx.strokeStyle = "#ffe060";
    for (const d of list) if (d.kind === "obj" && d.o.alpha[d.part] < 0.99) { const f = SP.frame(d.key); ctx.strokeRect(Math.round(d.X) - f[4] + 0.5, Math.round(d.Y) - f[5] + 0.5, f[2], f[3]); }
    const b = player.bodyRect(); ctx.strokeStyle = "#00ffd0"; ctx.strokeRect(b.x0 + 0.5, b.y0 + 0.5, b.x1 - b.x0, b.y1 - b.y0);
    ctx.restore();
  }
  function drawDebugText(list, pi) {
    const lines = [
      `DEBUG  fps ${st.fps.toFixed(0)}  drawables ${list.length}  sort edges ${W.sortEdges ? W.sortEdges.reduce((s, e) => s + e.length, 0) : 0}  cycles ${W.sortCycles}  李默 #${pi}`,
      `李默 (${player.x.toFixed(2)}, ${player.y.toFixed(2)}) m  dir ${player.dir}${player.umbrella ? " 伞" : ""}  blocked:${st.blockedBy || "-"}`,
      `NPC: ${SP.npcs.list.map((a) => `${a.id}(${a.x.toFixed(1)},${a.y.toFixed(1)})${a.crossing ? "⇄" : ""}`).join(" ")}`,
      `fading: ${(W.fadeHit || []).join(", ") || "-"}`,
      `cars: ${SP.traffic.cars.map((c) => `${c.id}${c.state === "crashed" ? "✕" : ""}[${c.lane}] v${c.v.toFixed(1)}`).join("  ")}`,
      `magenta = object sort box (ground rect)  cyan/green = foot circles  orange = car  red = footprint  green dash = NPC route  yellow # = drawn after 李默`,
    ];
    ctx.save(); ctx.font = "12px monospace"; ctx.fillStyle = "rgba(10,10,16,0.72)"; ctx.fillRect(8, 8, 820, lines.length * 16 + 10);
    ctx.fillStyle = "#e8f0ff"; lines.forEach((t, i) => ctx.fillText(t, 16, 25 + i * 16)); ctx.restore();
    st.blockedBy = null;
  }
  const hudEl = document.getElementById("status"), toastEl = document.getElementById("toast"), promptEl = document.getElementById("prompt"), logEl = document.getElementById("log");
  function hud() {
    const fade = (W.fadeHit || []).length ? " · 遮挡淡出：" + W.fadeHit.join(",") : "";
    const wx = CK.weather !== "clear" && CK.intensity > 0.05 ? CK.weatherName() : CK.target !== "clear" ? CK.weatherName(CK.target) : "晴";
    const extra = (CK.snow > 0.12 ? ` · 积雪${["", "薄", "中", "厚"][SP.env.snowLevel()]}` : "") + (CK.wet > 0.3 && CK.snow < 0.12 ? " · 路面湿" : "");
    const txt = `${CK.dateLabel()} ${CK.clockLabel()} · ${CK.seasonName()} · ${wx}${extra} · ×${cam.zoom}${st.debug ? ` · (${player.x.toFixed(1)}, ${player.y.toFixed(1)})` + fade : ""}`;
    if (hudEl.textContent !== txt) hudEl.textContent = txt;
    const tm = st.toast ? st.toast.msg : ""; if (toastEl.textContent !== tm) { toastEl.textContent = tm; toastEl.style.opacity = st.toast ? 1 : 0; }
    let pr = "";
    if (player.carry) pr = "E 停车锁车";
    else if (st.near) { const u = W.actionFor(st.near, "use"), k = W.actionFor(st.near, "kick"); pr = [u && "E " + u.label, k && "F " + k.label].filter(Boolean).join("  ·  "); }
    if (promptEl.textContent !== pr) promptEl.textContent = pr;
    SP.promptActions = { use: !!(player.carry || (st.near && W.actionFor(st.near, "use"))), kick: !!(st.near && W.actionFor(st.near, "kick")) };
    if (logEl) { const on = !!st.showLog; logEl.style.display = on ? "block" : "none"; if (on) { const L = W.log.slice(-8).map((e) => `${e.clock || ""} ${e.text}`).join("\n"); if (logEl.textContent !== L) logEl.textContent = L; } }
  }

  // ---------- loop ----------
  let last = 0;
  function frame(ts) {
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 1 / 60; last = ts;
    st.fps = st.fps * 0.95 + (1 / Math.max(dt, 1e-3)) * 0.05;
    step(dt);
    requestAnimationFrame(frame);
  }
  function simulate(dt) { const n = Math.max(1, Math.ceil(dt / (1 / 60) - 1e-6)); for (let i = 0; i < n; i++) update(dt / n); }
  function step(dt) { simulate(dt); st.lastDt = dt; updateCam(dt); render(); }

  // ---------- audit runner (no rendering; chunked so CDP calls stay short) ----------
  const AUD = { C: null, walker: null, i: 0 };
  function auditRun(o) {
    o = Object.assign({ seconds: 60, dt: 1 / 30, sortEvery: 10, pixelEvery: 240, seed: 7, reset: false }, o || {});
    if (o.reset || !AUD.C) { AUD.C = SP.audit.counts(); AUD.walker = SP.audit.randomWalker(o.seed); AUD.i = 0; }
    const C = AUD.C; st.autoWalk = AUD.walker;
    const n = Math.round(o.seconds / o.dt), t0 = performance.now();
    for (let k = 0; k < n; k++) {
      const prev = SP.actors.list.map((q) => [q.x, q.y]);
      update(o.dt); AUD.i++; C.steps++;
      C.travel = C.travel || {};
      SP.actors.list.forEach((q, i) => { C.travel[q.id] = (C.travel[q.id] || 0) + Math.hypot(q.x - prev[i][0], q.y - prev[i][1]); });
      const [ov, it] = SP.audit.checkCollisions(C); C.overlaps += ov; C.intrusions += it;
      let crowd = 0; const L = SP.actors.list;
      for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) if (Math.hypot(L[i].x - L[j].x, L[i].y - L[j].y) < 1.3) crowd++;
      if (crowd) C.crowdFrames++;
      if (AUD.i % o.sortEvery === 0 || crowd) {
        const rects = L.map((a) => a.spriteRect()), list = buildList(rects);
        SP.audit.checkSort(list, C);
        if (AUD.i % o.pixelEvery === 0 || (crowd && AUD.i % 15 === 0)) SP.audit.checkPixels(list, C);
      }
    }
    st.autoWalk = null;
    C.simSeconds = +(C.steps * o.dt).toFixed(1); C.ms = (C.ms || 0) + Math.round(performance.now() - t0);
    const travel = {}; for (const k in C.travel) travel[k] = Math.round(C.travel[k]);
    const amb = Object.entries(C.ambiguous || {}).sort((p, q) => q[1] - p[1]).slice(0, 12);
    return Object.assign({}, C, { travel, ambiguous: amb, samples: C.samples.slice(0, 8) });
  }

  // ---------- boot ----------
  const assets = [["atlas", "kit/kit_atlas.png"], ["emit", "kit/kit_emit.png"]].concat(Object.entries(window.ACTORS).map(([k, v]) => ["actor_" + k, v.img]), SP.overrideAssets());
  SP.load(assets).then(() => {
    SP.applyOverrides();
    CK.init(window.SCENE_DATA, Q); SP.season = CK.season; syncLight();
    SP.updateTint(true);
    W.load(window.SCENE_DATA);
    SP.traffic.reset();
    spawnActors();
    SP.updateTint(true); W.bakeGround();
    SP.actions = { interact: () => { st.near = nearest(); interact(); }, kick, time: () => { CK.cycleTime(); toast("时间快进"); }, weather: () => { CK.cycleWeather(); toast("天气：" + CK.weatherName(CK.target)); },
                   nextDay: () => CK.nextDay(), log: () => (st.showLog = !st.showLog), zoom: (d) => SP.zoomStep(d), season: (se) => setSeason(se || SEASONS[(SEASONS.indexOf(SP.season) + 1) % SEASONS.length]),
                   event: fireEvent, umbrella: toggleUmbrella, reset: resetScene, debug: () => (st.debug = !st.debug), near: () => st.near };
    document.querySelectorAll("[data-ev]").forEach((b) => b.addEventListener("click", () => { const e = b.dataset.ev; if (e === "reset") resetScene(); else if (e === "time") CK.cycleTime(); else if (e === "weather") CK.cycleWeather(); else if (e === "kick") kick(); else if (e === "debug") st.debug = !st.debug; else if (e === "umbrella") toggleUmbrella(); else if (e === "zoomin") SP.zoomStep(1); else if (e === "zoomout") SP.zoomStep(-1);
      else if (e === "season") setSeason(SEASONS[(SEASONS.indexOf(SP.season) + 1) % SEASONS.length]); else fireEvent(e); b.blur(); }));
    window.__proto = {
      SP, player, world: W, traffic: SP.traffic, state: st, cam,
      step: (dt, n) => { for (let i = 0; i < (n || 1); i++) step(dt); return true; },
      sim: (seconds, dt) => { dt = dt || 1 / 30; for (let t = 0; t < seconds; t += dt) update(dt); return true; },
      skip: (seconds) => { for (let t = 0; t < seconds; t += 1 / 30) update(1 / 30); SP.actors.resolve(12); return true; },
      render: () => { updateCam(1); render(); return true; },
      trigger: fireEvent, setTime: (n, inst) => setTime(n, inst !== false), setSeason, clock: CK, env: SP.env, kick, act: (id, kind) => { const o = W.byId[id]; return o ? W.act(o, kind || "use", player) : null; },
      setWeather: (w, i) => { CK.setWeather(w, i == null ? 0.8 : i, true, true); syncLight(); return true; }, zoom: (z) => { if (z) { cam.zoom = z; cam.ready = false; } return cam.zoom; }, reset: resetScene, umbrella: toggleUmbrella, interact: () => { st.near = nearest(); interact(); return st.near && st.near.id; },
      order: () => lastList.map((d) => (d.kind === "obj" ? d.o.id + "/" + d.part : d.kind === "actor" ? (d.actor === player ? "PLAYER" : "NPC:" + d.actor.id) : d.kind === "car" ? d.car.id : d.kind)),
      buildList: (view) => buildList(view),
      alpha: (id, part) => { const o = W.byId[id]; return o ? (o.alpha[part || W.piece(o).parts[0]] ?? 1) : null; },
      place: (x, y, dir) => { player.x = x; player.y = y; if (dir) player.setDir(dir); cam.ready = false; },
      npc: (id) => SP.npcs.list.find((a) => a.id === id),
      /** camera: centre on world point (x, y), or put world point (x, y) at screen offset (ox, oy) px from the centre */
      lock: (x, y, ox, oy) => { if (x == null) { cam.lock = null; return true; } const s0 = SP.scr(x, y, 0); cam.lock = SP.unproject(s0[0] - (ox || 0), s0[1] - (oy || 0)); cam.ready = false; return true; },
      autopilot: (pts, speedK) => {      // walk 李默 through world waypoints by feeding screen-direction input (like a thumb on the stick)
        let i = 0;
        st.autoWalk = () => { if (i >= pts.length) return null; const [tx, ty] = pts[i]; const wx = tx - player.x, wy = ty - player.y;
          if (Math.hypot(wx, wy) < 0.15) { i++; return null; } return [(wx - wy) / 2, -(wx + wy) / 2]; };
        st.autoDone = () => i >= pts.length; return true; },
      stopAuto: () => { st.autoWalk = null; return true; },
      autoDone: () => !st.autoDone || st.autoDone(),
      audit: { run: auditRun, collisions: () => SP.audit.checkCollisions(null), sort: () => SP.audit.checkSort(buildList(SP.actors.list.map((a) => a.spriteRect())), null),
               pixels: () => SP.audit.checkPixels(buildList(SP.actors.list.map((a) => a.spriteRect())), null) },
    };
    window.__protoReady = true;
    if (!st.manual) requestAnimationFrame(frame); else step(1 / 60);
  });
})(window.SP);
