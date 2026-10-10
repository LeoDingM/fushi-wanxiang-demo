/* scene-proto · main: boot, input (keyboard + touch joystick via mobile.js), fixed-timestep simulation (60 Hz) with
   render interpolation, integer-pixel camera with smooth lag, interactions (E use / F kick), HUD + event log,
   debug overlay with fps / cpu (?debug=1 or G), test hooks (window.__proto). */
(function (SP) {
  "use strict";
  const Q = new URLSearchParams(location.search);
  const canvas = document.getElementById("game");
  if (Q.get("w")) canvas.width = +Q.get("w");
  if (Q.get("h")) canvas.height = +Q.get("h");
  const W = SP.world, keys = Object.create(null), DT = 1 / 60;
  const st = (SP.state = { debug: Q.get("debug") === "1", toast: null, manual: Q.get("manual") === "1", fps: 60, cpu: 0, near: null, showLog: Q.get("log") !== "0", steps: 0, ft: new Float32Array(240), fti: 0 });
  SP.now = 0; SP.rand = SP.rng(20260321);
  const player = (SP.player = new SP.LiMo());
  const cam = (SP.cam = { fx: 0, fy: 0, ix: 0, iy: 0, zoom: +(Q.get("zoom") || 1), base: +(Q.get("zoom") || 1), ready: false });
  SP.render.init(canvas);
  const ctx = canvas.getContext("2d");

  // ---------- input ----------
  const down = (...k) => k.some((x) => keys[x] || (SP.input && SP.input[x]));
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    keys[k] = true;
    if (e.repeat || !window.__protoReady) return;
    const G = SP.game;
    if (G.menu) {                                   // action menu: 1-9 choose, E = first available, Esc / Q closes
      if (/^[1-9]$/.test(k)) { G.pick(+k - 1); return; }
      if (k === "e") { G.pick(null); return; }
      if (k === "escape" || k === "q") { G.closeMenu(); return; }
    }
    for (const [name, ev] of Object.entries(W.data.events || {})) if (ev.key === k) fireEvent(name);
    if (k === "0") resetScene();
    else if (k === "t") SP.clock.cycleTime();
    else if (k === "r") { SP.clock.cycleWeather(); toast(`天气：${SP.clock.weatherName(SP.clock.target)}`); }
    else if (k === "y") { SP.clock.cycleSeason(); toast(`季节：${SP.clock.seasonName()}`); }
    else if (k === "n") { SP.clock.nextDay(); toast("跳到第二天清晨"); }
    else if (k === "l") st.showLog = !st.showLog;
    else if (k === "g") st.debug = !st.debug;
    else if (k === "e") interact("use");
    else if (k === "f") interact("kick");
    else if (k === "]" || k === "[") { const s = [1, 10, 60], i = s.indexOf(SP.clock.scale); SP.clock.scale = s[SP.clamp(i + (k === "]" ? 1 : -1), 0, 2)]; toast(`时间流速 ×${SP.clock.scale}`); }
  });
  window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));
  window.addEventListener("blur", () => { for (const k in keys) keys[k] = false; });
  function fireEvent(name) { if (W.trigger(name)) toast(`事件：${W.data.events[name].label}`); }
  function toast(msg, ms) { st.toast = { msg, t: (ms || 2000) / 1000 }; }
  SP.toast = toast;
  function resetScene() {
    SP.rand = SP.rng(20260321); SP.now = 0;
    W.stash = {}; W.sceneId = null;
    SP.clock.init(window.SCENE_DATA, Q); W.load(window.SCENE_DATA); SP.fx.reset(); SP.traffic.reset();
    const sp = W.data.spawn; player.x = player.px = sp.x; player.y = player.py = sp.y; player.setDir(sp.dir); player.hidden = false; cam.ready = false;
    player.carry = null; SP.render.build(); SP.actors.init(W.data); SP.game.init(); toast("场景已重置");
  }
  W.pulseDoor = function () {
    const d = W.byId.unit_door; if (!d || d.state === "open" && !d.pulse) return;
    if (d.state !== "open") { W.setState(d, "open"); d.pulse = true; }
    d.pulseUntil = SP.now + 2.2;
  };
  function interact(kind) {
    if (kind === "use" && player.carry) { if (!W.parkBike(player)) toast("这里停不下，换个地方"); else toast("单车停好了"); return; }
    const o = st.near; if (!o) return;
    if (kind === "use" && o.interact === "gate") {
      const open = o.state !== "open";
      for (const g of W.objects) if (g.interact === "gate") g.state = open ? "open" : "closed";
      W.rebuildColliders();
      if (!open && SP.actors.list.some((a) => !a.hidden && W.blocked(a.x, a.y, a.r, true))) { for (const g of W.objects) if (g.interact === "gate") g.state = "open"; W.rebuildColliders(); toast("有人挡着门，关不上"); return; }
      for (const g of W.objects) if (g.interact === "gate") W.touch(g);
      W.logEvent(open ? "李默推开了院门" : "李默关上了院门"); toast(open ? "推开铁门" : "关上铁门（院子被封住）"); return;
    }
    if (kind === "use" && o.interact === "door") { SP.game.go({ to: o.to, spawn: o.spawn, door: o.id }); return; }
    if (kind === "use" && o.interact === "locker") { toast("快递柜：没有你的件"); return; }
    const msg = W.act(o, kind, player);
    if (msg) toast(msg);
  }
  SP.interact = interact;

  // ---------- simulation (fixed 60 Hz) ----------
  function movePlayer(dt) {
    let dx = 0, dy = 0, mag = 1;
    if (down("w", "arrowup")) dy -= 1;
    if (down("s", "arrowdown")) dy += 1;
    if (down("a", "arrowleft")) dx -= 1;
    if (down("d", "arrowright")) dx += 1;
    const T = SP.touchInput;
    if (!dx && !dy && T && T.m > 0) { dx = T.x; dy = T.y; mag = Math.min(1, 0.35 + T.m * 0.65); }
    SP.game.moving = !!(dx || dy);              // raw stick intent (portal re-arming), even while frozen
    if (SP.game.busy()) { dx = dy = 0; }
    SP.game.vy = -dy;
    const moving = !!(dx || dy), r = player.r;
    let dist = 0;
    if (moving) {
      const len = Math.hypot(dx, dy), step = SP.LIMO.speed * mag * (SP.game.speedMul || 1) * dt;
      const vx = (dx / len) * step, vy = (-dy / len) * step;
      const x0 = player.x, y0 = player.y, A = SP.actors;
      if (Math.abs(vx) > 0.01) player.dirVec[0] = Math.sign(vx);
      if (A.free(player, player.x + vx, player.y + vy)) { player.x += vx; player.y += vy; }
      else if (Math.abs(vx) > 1e-6 && A.free(player, player.x + vx, player.y)) player.x += vx;
      else if (Math.abs(vy) > 1e-6 && A.free(player, player.x, player.y + vy)) player.y += vy;
      else st.blockedBy = W.blocked(player.x + vx, player.y + vy, r) || "actor";
      dist = Math.hypot(player.x - x0, player.y - y0);
    }
    let dir = moving ? SP.dirFromVec(dx, dy) : null;
    if (dir) { if (dir.length === 2) { st.lastDiag = dir; st.lastDiagT = 0; } else st.lastDiagT = (st.lastDiagT || 0) + dt; }
    else if (player.moving && st.lastDiag && st.lastDiagT < 0.12 && st.lastDiag.includes(player.target)) dir = st.lastDiag;
    if (!moving) st.lastDiagT = 9;
    player.update(dt, moving, dir, dist);
    SP.actors.groundEffects(player, dist);
  }
  let lastRule = -1;
  function update(dt) {
    SP.now += dt; st.steps++;
    player.px = player.x; player.py = player.y;
    const wasFF = !!SP.clock.ff;
    const gm = SP.clock.update(dt);
    movePlayer(dt);
    W.updateEvents(dt);
    const m = Math.floor(SP.clock.abs());
    if (m !== lastRule) { lastRule = m; W.updateRules(); }
    if (wasFF && !SP.clock.ff) SP.actors.settle();
    SP.game.update(dt, gm);
    SP.actors.update(dt, gm);
    SP.traffic.update(dt);
    SP.fx.update(dt);
    const d = W.byId.unit_door; if (d && d.pulse && SP.now > d.pulseUntil) { d.pulse = false; W.setState(d, "closed"); }
    st.near = player.carry ? null : W.nearest(player.x, player.y);
    if (st.toast) { st.toast.t -= dt; if (st.toast.t <= 0) st.toast = null; }
  }

  // ---------- camera: smooth float follow, integer offset that keeps 李默's screen position constant while walking ----------
  function updateCam(dt, al) {
    const B = W.data.bounds, cd = W.data.camera;
    const xmin = SP.sx(B.x0 - (cd.fit ? 0.3 : 0)), xmax = SP.sx(B.x1 + (cd.fit ? 0.3 : 0));
    const ytop = cd.top_y != null ? SP.sy(cd.top_y, cd.top_z) : SP.sy(cd.facade_y, cd.top_z_at_facade), ybot = SP.sy(cd.bottom_y != null ? cd.bottom_y : B.y0 - 0.4);
    // interiors fit the room: largest integer zoom that shows it (x2 on desktop, x1 on phones)
    // (phone portrait: x2 and the camera pans with 李默 - half the room at a time, but furniture reads at thumb size)
    cam.zoom = cd.fit && !Q.get("zoom") ? (SP.mobile && SP.mobile.portrait && canvas.width >= 340 ? 2 : SP.clamp(Math.floor(Math.min(canvas.width / (xmax - xmin + 24), canvas.height / (ybot - ytop + 60))), 1, 3)) : cam.base;
    const z = cam.zoom, vw = canvas.width / z, vh = canvas.height / z;
    const x = player.px + (player.x - player.px) * al, y = player.py + (player.y - player.py) * al;
    const X = SP.sx(x), Y = SP.sy(y), lift = vh > vw ? 50 : Math.min(120, vh * 0.17);
    let tx = X - Math.floor(vw / 2), ty = Y - lift - Math.floor(vh / 2);
    const clampX = (v) => (vw >= xmax - xmin ? (xmin + xmax - vw) / 2 : SP.clamp(v, xmin, xmax - vw));
    const clampY = (v) => (vh >= ybot - ytop ? (ytop + ybot - vh) / 2 : SP.clamp(v, ytop, ybot - vh));
    tx = clampX(tx); ty = clampY(ty);
    if (!cam.ready) { cam.fx = tx; cam.fy = ty; cam.ready = true; }
    const k = 1 - Math.exp(-dt * 5);
    cam.fx += (tx - cam.fx) * k; cam.fy += (ty - cam.fy) * k;
    cam.ix = Math.round(clampX(Math.round(tx) - Math.round(tx - cam.fx)));
    cam.iy = Math.round(clampY(Math.round(ty) - Math.round(ty - cam.fy)));
  }

  // ---------- render ----------
  function render(al, dt) {
    updateCam(dt, al);
    SP.render.draw(al, dt);
    if (st.debug) { const z = cam.zoom; ctx.setTransform(z, 0, 0, z, -cam.ix * z, -cam.iy * z); drawDebug(SP.render.lastList, SP.render.playerIndex, al); ctx.setTransform(1, 0, 0, 1, 0, 0); drawDebugText(SP.render.lastList, SP.render.playerIndex); }
    hud();
  }
  function poly(pts, stroke, fill) {
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(SP.sx(x), SP.sy(y)) : ctx.moveTo(SP.sx(x), SP.sy(y)))); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
  }
  function drawDebug(list, pi, al) {
    ctx.save(); ctx.lineWidth = 1;
    const tr = W.data.traffic || { lanes: [] }, cw = tr.crosswalk;
    ctx.setLineDash([4, 3]);
    if (cw) poly([[cw.x0, cw.y0], [cw.x1, cw.y0], [cw.x1, cw.y1], [cw.x0, cw.y1]], "rgba(80,220,255,0.9)");
    for (const p of W.portals || []) { const r = p.rect; poly([[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]], "rgba(255,230,80,0.95)", "rgba(255,230,80,0.12)"); }
    for (const l of tr.lanes) { ctx.strokeStyle = "rgba(255,80,80,0.95)"; ctx.beginPath(); ctx.moveTo(SP.sx(l.stop_x), SP.sy(l.y - 1.8)); ctx.lineTo(SP.sx(l.stop_x), SP.sy(l.y + 1.8)); ctx.stroke(); }
    ctx.setLineDash([]);
    for (const c of W.colliders) poly(c.poly, "rgba(255,70,70,0.95)", "rgba(255,60,60,0.15)");
    for (const c of SP.traffic.cars) poly(c.poly, "rgba(255,170,40,0.95)", "rgba(255,170,40,0.18)");
    for (const h of W.hazards) { ctx.strokeStyle = "#ff5af0"; ctx.beginPath(); ctx.ellipse(SP.sx(h.x), SP.sy(h.y), h.r * 48, h.r * 22.5 / 1.4, 0, 0, 6.28); ctx.stroke(); }
    // NPC graph + paths
    const N = W.data.npcs ? W.data.npcs.graph.nodes : {};
    ctx.strokeStyle = "rgba(120,255,140,0.35)";
    for (const [u, v] of W.data.npcs ? W.data.npcs.graph.edges : []) { ctx.beginPath(); ctx.moveTo(SP.sx(N[u][0]), SP.sy(N[u][1])); ctx.lineTo(SP.sx(N[v][0]), SP.sy(N[v][1])); ctx.stroke(); }
    ctx.font = "9px monospace"; ctx.textAlign = "center";
    for (const a of SP.actors.list) {
      if (a.hidden) continue;
      ctx.strokeStyle = a === player ? "#00ffd0" : "#8cff8c";
      ctx.beginPath(); ctx.ellipse(SP.sx(a.x), SP.sy(a.y), a.r * SP.PX, a.r * SP.PY, 0, 0, 6.2832); ctx.stroke();
      if (a.path && a.path.length) { ctx.beginPath(); ctx.moveTo(SP.sx(a.x), SP.sy(a.y)); for (const n of a.path) ctx.lineTo(SP.sx(N[n][0]), SP.sy(N[n][1])); ctx.stroke(); }
      if (a !== player) { ctx.fillStyle = "#c8ffc8"; ctx.fillText(`${a.id}:${a.act || ""}`, SP.sx(a.x), SP.sy(a.y) + 12); }
    }
    list.forEach((d, i) => {
      const l = d.line; if (!l || d.kind === "part") return;
      ctx.strokeStyle = d.kind === "player" ? "#00ffd0" : d.kind === "car" ? "#ffb030" : d.kind === "npc" ? "#8cff8c" : "rgba(255,60,220,0.9)";
      ctx.beginPath(); ctx.moveTo(SP.sx(l[0]) - (l[2] === l[0] ? 3 : 0), SP.sy(l[1])); ctx.lineTo(SP.sx(l[2]) + (l[2] === l[0] ? 3 : 0), SP.sy(l[3])); ctx.stroke();
    });
    ctx.strokeStyle = "#ffe060";
    for (const d of list) if (d.kind === "obj" && d.o.alpha[d.part] < 0.99) { const f = SP.frame(d.key); ctx.strokeRect(Math.round(d.X) - f[4] + 0.5, Math.round(d.Y) - f[5] + 0.5, f[2], f[3]); }
    const b = player.bodyRect(al); ctx.strokeStyle = "#00ffd0"; ctx.strokeRect(b.x0 + 0.5, b.y0 + 0.5, b.x1 - b.x0, b.y1 - b.y0);
    ctx.restore();
  }
  function drawDebugText(list, pi) {
    const C = SP.clock, Rs = SP.render.stats, small = canvas.width < 700;
    const lines = [
      `FPS ${st.fps.toFixed(1)}  frame cpu ${st.cpu.toFixed(2)} ms  sim ${st.simSteps} step/frame  drawables ${list.length} (drawn ${Rs.drawn})`,
      `chunks ${Rs.chunks} on screen, ${Rs.redraw} re-rendered  lights ${Rs.lights}  lightmap ${Rs.lightmap ? "on" : "off"}  canvas ${canvas.width}x${canvas.height}`,
      `${C.dateLabel()} ${C.clockLabel()} ×${C.scale}  ${C.season} ${C.weather} ${C.intensity.toFixed(2)}  wet ${C.wet.toFixed(2)} snow ${C.snow.toFixed(2)} fog ${C.fog.toFixed(2)}  amb ${C.ambient.join(",")}`,
      `李默 (${player.x.toFixed(2)}, ${player.y.toFixed(2)}) ${player.dir} #${pi} blocked:${st.blockedBy || "-"}  fading: ${(W.fadeHit || []).join(",") || "-"}`,
      `NPC: ${SP.actors.npcs.map((a) => `${a.id}${a.hidden ? "(内)" : ""}:${a.act || "-"}`).join(" ")}`,
    ];
    ctx.save(); ctx.font = small ? "10px monospace" : "12px monospace";
    const lh = small ? 13 : 16, wpx = Math.min(canvas.width - 16, small ? 380 : 760);
    ctx.fillStyle = "rgba(10,10,16,0.72)"; ctx.fillRect(8, 8, wpx, lines.length * lh + 10);
    ctx.fillStyle = "#e8f0ff"; ctx.textAlign = "left";
    lines.forEach((t, i) => ctx.fillText(t, 14, 8 + lh + i * lh, wpx - 10));
    ctx.fillStyle = st.fps > 57 ? "#7dff9a" : st.fps > 45 ? "#ffd166" : "#ff6b6b"; ctx.font = "bold 14px monospace"; ctx.fillText(`${st.fps.toFixed(0)} fps`, 14, lines.length * lh + 36);
    ctx.restore(); st.blockedBy = null;
  }
  const hudEl = document.getElementById("status"), toastEl = document.getElementById("toast"), promptEl = document.getElementById("prompt"), logEl = document.getElementById("log");
  let hudKey = "", logKey = "", promptKey = "", toastKey = null;
  function hud() {
    const C = SP.clock;
    const s = `${W.interior ? W.data.name + " · " : ""}${C.dateLabel()} · ${C.clockLabel()} ${C.phaseName()} · ${C.seasonName()} · ${C.weatherName()}${C.scale > 1 ? " ×" + C.scale : ""}`;
    SP.game.hud();
    if (s !== hudKey) { hudKey = s; hudEl.textContent = s; }
    const tm = st.toast ? st.toast.msg : "";
    if (tm !== toastKey) { toastKey = tm; toastEl.textContent = tm; toastEl.style.opacity = tm ? 1 : 0; }
    let p = "";
    if (player.carry) p = (SP.isTouch ? "互动" : "E") + " 停车";
    else if (st.near) {
      const u = W.actionFor(st.near, "use"), k = W.actionFor(st.near, "kick");
      p = [u && `${SP.isTouch ? "互动" : "E"} ${u.label}`, k && `${SP.isTouch ? "踢" : "F"} ${k.label}`].filter(Boolean).join("   ");
    }
    if (p !== promptKey) { promptKey = p; promptEl.textContent = p; }
    st.prompt = p;
    const lk = st.showLog + "|" + W.log.length + "|" + (W.log.length && W.log[W.log.length - 1].text);
    if (lk !== logKey && logEl) {
      logKey = lk; logEl.style.display = st.showLog ? "" : "none";
      logEl.innerHTML = W.log.slice(-5).map((e) => `<div><i>D${e.day + 1} ${e.clock}</i> ${e.text}</div>`).join("");
    }
  }

  // ---------- loop ----------
  let last = 0, acc = 0;
  function frame(ts) {
    const t0 = performance.now();
    const dt = last ? Math.min(0.1, (ts - last) / 1000) : DT; last = ts;
    st.fps = st.fps * 0.93 + (1 / Math.max(dt, 1e-3)) * 0.07;
    st.ft[st.fti++ % st.ft.length] = dt * 1000;
    advance(dt);
    st.cpu = st.cpu * 0.93 + (performance.now() - t0) * 0.07;
    requestAnimationFrame(frame);
  }
  function advance(dt) {
    acc += dt; let n = 0;
    while (acc >= DT - 1e-9 && n < 8) { update(DT); acc -= DT; n++; }
    if (n === 8) acc = 0;
    st.simSteps = n;
    render(SP.clamp(acc / DT, 0, 1), dt);
  }

  // ---------- boot ----------
  const assets = [["atlas", "kit/kit_atlas.png"], ["emit", "kit/kit_emit.png"], ...(SP.K.snow_atlases || []).map((f, i) => ["snow" + i, "kit/" + f]), ...SP.spriteAssets()];
  SP.load(assets).then(() => {
    SP.img.snow = (SP.K.snow_atlases || []).map((f, i) => SP.img["snow" + i]);
    SP.scenes = Object.assign({ street: window.SCENE_DATA }, window.INTERIOR_SCENES || {});
    SP.clock.init(window.SCENE_DATA, Q);
    W.load(window.SCENE_DATA);
    SP.game.init();
    const start = Q.get("scene");
    if (start && start !== "street" && SP.scenes[start]) W.enter(start);
    SP.traffic.reset();
    const sp = W.data.spawn, spx = Array.isArray(sp) ? sp[0] : sp.x, spy = Array.isArray(sp) ? sp[1] : sp.y, spd = Array.isArray(sp) ? sp[2] : sp.dir;
    player.x = player.px = Q.get("px") ? +Q.get("px") : spx; player.y = player.py = Q.get("py") ? +Q.get("py") : spy; player.setDir(Q.get("dir") || spd);
    SP.render.build();
    SP.actors.init(W.data);
    SP.game.updateLights(true);
    if (Q.get("npcs") === "0") for (const a of SP.actors.npcs) { a.def = Object.assign({}, a.def, { blocks: [{ from: "00:00", to: "23:59", act: "inside", at: a.def.start }], trips: null }); a.hide(a.def.start); }
    W.logEvent("李默出门，开始新的一天");
    const btn = (e) => {
      if (e === "reset") resetScene(); else if (e === "time") SP.clock.cycleTime(); else if (e === "debug") st.debug = !st.debug;
      else if (e === "weather") { SP.clock.cycleWeather(); toast(`天气：${SP.clock.weatherName(SP.clock.target)}`); }
      else if (e === "season") { SP.clock.cycleSeason(); toast(`季节：${SP.clock.seasonName()}`); }
      else if (e === "day") SP.clock.nextDay(); else if (e === "log") st.showLog = !st.showLog;
      else if (e === "use" || e === "kick") interact(e); else fireEvent(e);
    };
    SP.button = btn;
    document.querySelectorAll("[data-ev]").forEach((b) => b.addEventListener("click", () => { btn(b.dataset.ev); b.blur(); }));
    const setTime = (name) => { const m = { morning: 450, day: 720, dusk: 1120, night: 1350 }[name]; if (m == null) return; SP.clock.min = m; SP.clock.ff = null; SP.clock.computeAmbient(); SP.actors.settle(); };
    // test hooks
    window.__proto = {
      SP, player, world: W, traffic: SP.traffic, state: st, clock: SP.clock, actors: SP.actors, render: SP.render,
      step: (dt, n) => { for (let i = 0; i < (n || 1); i++) { acc += dt; while (acc >= DT - 1e-9) { update(DT); acc -= DT; } render(SP.clamp(acc / DT, 0, 1), dt); } return true; },
      sim: (seconds) => { const n = Math.round(seconds / DT); for (let i = 0; i < n; i++) update(DT); return true; },
      trigger: fireEvent, setTime, reset: resetScene, interact, toast: () => st.toast && st.toast.msg, game: SP.game,
      /** jump straight into a scene (tests / captures): same path as a portal, without the fade */
      enter: (id, x, y, dir) => { const S = SP.scenes[id], sp = S.spawn; SP.game.switchScene(id, [x != null ? x : (sp.x != null ? sp.x : sp[0]), y != null ? y : (sp.y != null ? sp.y : sp[1]), dir || (sp.dir || sp[2])]); return W.sceneId; },
      order: () => SP.render.lastList.map((d) => (d.kind === "obj" ? d.o.id + "/" + d.part : d.kind === "player" ? "PLAYER" : d.kind === "car" ? d.car.id : d.kind === "npc" ? "NPC:" + d.a.id : d.kind)),
      alpha: (id, part) => { const o = W.byId[id]; return o ? (o.alpha[part || W.piece(o).parts[0]] ?? 1) : null; },
      place: (x, y, dir) => { player.x = player.px = x; player.y = player.py = y; if (dir) player.setDir(dir); cam.ready = false; },
      /** clipping audit: n fixed steps without rendering; accumulates overlaps / intrusions every step */
      audit: (n) => { const A = SP.actors, r = { steps: 0, pair: 0, stat: 0, car: 0, detail: [] };
        for (let i = 0; i < n; i++) { update(DT); const c = A.check(); r.steps++; r.pair += c.pair; r.stat += c.stat; r.car += c.car; if (c.detail.length && r.detail.length < 12) r.detail.push(SP.clock.clockLabel() + " " + c.detail.join(";")); }
        r.maxStuck = Math.max(...A.npcs.map((a) => a.maxStuck)); r.clock = SP.clock.clockLabel(); r.day = SP.clock.day; r.visible = A.npcs.filter((a) => !a.hidden).map((a) => a.id); return r; },
      perf: () => { const a = Array.from(st.ft).filter((v) => v > 0).sort((x, y) => x - y); return { fps: st.fps, cpu: st.cpu, p50: a[a.length >> 1], p95: a[Math.floor(a.length * 0.95)], max: a[a.length - 1] }; },
    };
    window.__protoReady = true;
    if (!st.manual) requestAnimationFrame(frame); else { render(1, DT); }
  });
})(window.SP);
