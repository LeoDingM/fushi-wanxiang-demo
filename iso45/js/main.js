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
  SP.season = Q.get("season") || "summer";
  const W = SP.world, keys = Object.create(null);
  const st = (SP.state = { debug: Q.get("debug") === "1", time: "day", timeAnim: null, toast: null, manual: Q.get("manual") === "1", fps: 60, near: null,
                           npcs: Q.get("npcs") !== "0", autoWalk: null, grade: Q.get("grade") !== "0" });
  SP.now = 0;
  const player = (SP.player = new SP.Actor({ id: "limo", set: "li_mo", isPlayer: true, radius: 0.22, speed: 1.7, height: 1.85 }));
  // framing: desktop default 0.5 (≈ the concept art: the 6-storey building is ~1/2 screen high); phone default 1
  // (characters ~69 px); +/- buttons or = / - keys step through ZOOMS. zoom < 1 is rendered 1:1 offscreen and
  // downscaled with smoothing (no dropped pixel rows), zoom >= 1 is nearest-neighbour.
  // free zoom (Stage 3): continuous 0.06 .. 3, phone pinch (centred on the pinch point, two-finger drag pans),
  // PC mouse wheel (around the cursor) + = / - keys, +/- buttons step through ZOOMS; C / 回 = recenter. The pan offset
  // stays while 李默 stands, eases back once he walks. Near 0.5 / 1 / 2 / 3 a released zoom snaps (crisp pixels).
  const ZOOMS = (SP.ZOOMS = [0.06, 0.09, 0.13, 0.18, 0.25, 0.35, 0.5, 0.67, 1, 1.5, 2, 3]), ZMIN = 0.06, ZMAX = 3, SNAPS = [0.5, 1, 2, 3];
  SP.defaultZoom = 0.5;
  const cam = (SP.cam = { x: 0, y: 0, zoom: +(Q.get("zoom") || SP.defaultZoom), zt: null, pan: [0, 0], anchor: null, ready: false, lock: null, recenter: false });
  SP.zoomTo = function (z, ax, ay, instant) {
    z = SP.clamp(z, ZMIN, ZMAX); cam.zt = z; SP.userZoom = z;
    cam.anchor = ax == null ? null : [ax, ay];
    if (instant) applyZoom(z);
    return z;
  };
  SP.zoomStep = function (d) {
    const cur = cam.zt == null ? cam.zoom : cam.zt;
    let z = d > 0 ? ZOOMS.find((q) => q > cur * 1.02) : [...ZOOMS].reverse().find((q) => q < cur / 1.02);
    if (z == null) z = d > 0 ? ZMAX : ZMIN;
    return SP.zoomTo(z);
  };
  SP.zoomBy = (f, ax, ay, instant) => SP.zoomTo((cam.zt == null ? cam.zoom : cam.zt) * f, ax, ay, instant);
  /** gesture released: snap to a crisp scale when close */
  SP.zoomEnd = function () { const z = cam.zt == null ? cam.zoom : cam.zt, s = SNAPS.find((q) => Math.abs(z / q - 1) < 0.07); if (s) SP.zoomTo(s, cam.anchor && cam.anchor[0], cam.anchor && cam.anchor[1]); };
  SP.panBy = (dx, dy) => { cam.pan[0] += dx / cam.zoom; cam.pan[1] += dy / cam.zoom; cam.cx += dx / cam.zoom; cam.cy += dy / cam.zoom; cam.recenter = false; cam.panHold = 1.2; };
  SP.recenter = () => { cam.recenter = true; if (Math.abs(cam.zoom - (SP.homeZoom || SP.defaultZoom)) > 0.6 * cam.zoom) {} };
  function applyZoom(z1) {
    const z0 = cam.zoom; if (Math.abs(z1 - z0) < 1e-9) return;
    // keep the world point under the anchor (screen px) fixed
    const ax = cam.anchor ? cam.anchor[0] - canvas.width / 2 : 0, ay = cam.anchor ? cam.anchor[1] - canvas.height / 2 : 0, k = 1 / z0 - 1 / z1;
    cam.pan[0] += ax * k; cam.pan[1] += ay * k;
    if (cam.cx != null) { cam.cx += ax * k; cam.cy += ay * k; }
    cam.zoom = z1;
  }
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
    if (e.repeat || (SP.cbd && SP.cbd.active)) return;        // the CBD place handles its own keys (js/cbd/controls.js)
    const G = SP.game;
    if (G && G.menu) {                                      // action / floor menu: 1-9 pick, Esc / Q close
      if (/^[1-9]$/.test(k)) { G.pick(+k - 1); return; }
      if (k === "escape" || k === "q") { G.closeMenu(); return; }
    }
    if (W.interior && /^[0-9]$/.test(k)) return;              // street event hotkeys only on the street
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
    if (k === "c" || k === "home") SP.recenter();
    if (k === "capslock") SP.runToggle = !SP.runToggle;
    if (k === "y") setSeason(SEASONS[(SEASONS.indexOf(SP.season) + 1) % SEASONS.length]);
    if (k === "l") st.showLog = !st.showLog;
    if (k === "tab" || k === "q") { e.preventDefault && e.preventDefault(); SP.cycleTarget(); }
  });
  canvas.addEventListener("wheel", (e) => {
    if (SP.cbd && SP.cbd.active) return;
    e.preventDefault(); const r = canvas.getBoundingClientRect(), sx = canvas.width / r.width;
    const f = Math.exp(-SP.clamp(e.deltaY * (e.deltaMode === 1 ? 33 : 1), -240, 240) * 0.0022);
    SP.zoomBy(f, (e.clientX - r.left) * sx, (e.clientY - r.top) * sy(r));
    clearTimeout(st.wheelT); st.wheelT = setTimeout(() => SP.zoomEnd(), 260);
  }, { passive: false });
  const sy = (r) => canvas.height / r.height;
  let drag = null;
  canvas.addEventListener("mousedown", (e) => { if (SP.cbd && SP.cbd.active) return; if (e.button === 0 || e.button === 1) drag = [e.clientX, e.clientY]; });
  window.addEventListener("mousemove", (e) => { if (!drag) return; const r = canvas.getBoundingClientRect(); SP.panBy(-(e.clientX - drag[0]) * canvas.width / r.width, -(e.clientY - drag[1]) * sy(r)); drag = [e.clientX, e.clientY]; });
  window.addEventListener("mouseup", () => (drag = null));
  window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));
  window.addEventListener("blur", () => { for (const k in keys) keys[k] = false; });
  const SEASONS = ["summer", "autumn", "winter", "spring"];
  function setSeason(se) { CK.setSeason(se); SP.season = CK.season; W.bakeGround(); toast(`${CK.seasonName()} · ${CK.dateLabel()} · 今日${CK.weatherName(CK.target)}`); }
  function fireEvent(name) { if (W.trigger(name)) toast(`事件：${W.data.events[name].label}`); }
  function toast(msg, ms) { st.toast = { msg, t: (ms || 1800) / 1000 }; }
  SP.toast = toast;
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
  function resetScene() { if (W.interior || player.level) SP.place.enter("street"); SP.place.istate = {}; player.carry = null; W.load(window.SCENE_DATA); SP.fx.reset(); SP.traffic.reset(); SP.env.clearStamps(); spawnActors(); toast("场景已重置"); }
  function nearest() {
    if (player.carry) return null;
    const best = W.nearest(player.x, player.y, player.dir), L = (W.nearList || []).filter((o) => W.actionFor(o, "use") || W.actionFor(o, "kick"));
    const sig = L.map((o) => o.id).join("|"); if (sig !== st.nearSig) { st.nearSig = sig; st.pickIdx = 0; }
    st.nearN = L.length;
    if (!L.length) return best;
    return L[st.pickIdx % L.length];
  }
  /** several interactables in reach: Tab / Q / phone ⇄ cycles the target */
  SP.cycleTarget = function () { if ((st.nearN || 0) > 1) { st.pickIdx = (st.pickIdx || 0) + 1; st.near = nearest(); st.pickHold = SP.now; } };
  /** F / 踢: a short kick pose; kicks the nearest kickable thing (lamp, bin, bike, vending machine, pot, poster, window,
      parked car, laundry line, puddle, leaf pile) */
  /** readable bus-stop plate: crisp screen-space lettering anchored on the stop's sign pole (the 0.6 m pixel board
      itself is only ~20 px wide), shown when 李默 is within 10 m, fading out with distance */
  function drawStopSign(z, cx, cy) {
    if (W.interior || z < 0.35) return;
    const o = W.byId.bus_stop; if (!o) return;
    const px = o.x - 2.5, py = o.y, d = Math.hypot(player.x - px, player.y - py); if (d > 10) return;
    const X = Math.round((SP.sx(px, py) - cx) * z), Y = Math.round((SP.sy(px, py, 3.15) - cy) * z);
    const k = Math.max(1, Math.min(2, z * 1.6)) * (canvas.width / Math.max(1, canvas.getBoundingClientRect().width || canvas.width));
    ctx.save(); ctx.globalAlpha = Math.min(1, (10 - d) / 3);
    const w = Math.round(150 * k), h = Math.round(38 * k), x0 = X - w / 2, y0 = Y - h;
    ctx.fillStyle = "#1d4f91"; ctx.fillRect(x0, y0, w, h); ctx.fillStyle = "#f2f4f8"; ctx.fillRect(x0 + k, y0 + k, w - 2 * k, Math.round(4 * k));
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.font = `bold ${Math.round(14 * k)}px sans-serif`; ctx.fillText("井槐里 站", X, y0 + Math.round(21 * k));
    ctx.font = `${Math.round(9 * k)}px sans-serif`; ctx.fillText("12路 · 35路 · 夜2路  6:00–23:00", X, y0 + Math.round(33 * k));
    ctx.fillStyle = "#1d4f91"; ctx.fillRect(X - k, Y, 2 * k, Math.round(5 * k));
    ctx.restore();
  }
  /** lit blue doorplates (门牌) over building entrances: crisp, glow at night, within 14 m (12号 always a bit larger) */
  const PLATE_NO = { unit_door: "井槐里 12号", nb_n1: "井槐里 14号", nb_e1: "井槐里 16号", nb_w1: "井槐里 8号", nb_e4: "井槐里 20号" };
  /** 2F-02's AC: outdoor unit fan spins on the street facade while it runs; indoors a faint cool-air flow under the flap */
  function drawAcFx(z, cx, cy) {
    const G = SP.game, on = G && G.ps && G.ps.power && G.ps.power.on.ac; if (!on || z < 0.3) return;
    const scr = (q) => [(SP.sx(q[0], q[1]) - cx) * z, (SP.sy(q[0], q[1], q[2]) - cy) * z];
    if (!W.interior) {
      const o = W.byId.ac_S2F_3; if (!o || player.level === "roof") return;
      ctx.save(); ctx.strokeStyle = "rgba(40,44,50,0.85)"; ctx.lineWidth = Math.max(1, 1.6 * z);
      const a0 = SP.now * 14;
      for (let i = 0; i < 3; i++) { const a = a0 + i * 2.094, c = W.local(o, -0.12, -0.44, 0.28), e = W.local(o, -0.12 + 0.17 * Math.cos(a), -0.44, 0.28 + 0.17 * Math.sin(a));
        const [x0, y0] = scr(c), [x1, y1] = scr(e); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
      ctx.restore(); return;
    }
    const o = W.sceneId === "room_2f02" && W.byId.ac; if (!o) return;
    ctx.save(); ctx.strokeStyle = "rgba(200,230,255,0.45)"; ctx.lineWidth = Math.max(1, 1.4 * z);
    // rot 6: face points +x into the room; rot 0: face points -y (south). Soft cool-air streaks leave the flap.
    const east = (o.rot || 0) === 6;
    for (let i = 0; i < 5; i++) {
      const t = (SP.now * 0.7 + i / 5) % 1, u = -0.35 + i * 0.175;
      const a = east ? scr([o.x + 0.35 + t * 0.7, o.y + u, 2.15 - t * 0.4]) : scr([o.x + u, o.y - 0.35 - t * 0.7, 2.15 - t * 0.4]);
      const b = east ? scr([o.x + 0.5 + t * 0.7, o.y + u, 2.05 - t * 0.4]) : scr([o.x + u, o.y - 0.5 - t * 0.7, 2.05 - t * 0.4]);
      ctx.globalAlpha = Math.sin(t * Math.PI) * 0.9; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    ctx.restore();
  }
  function drawDoorPlates(z, cx, cy) {
    if (W.interior || z < 0.35 || player.level === "roof") return;
    const n = SP.tint.night || 0, kk = canvas.width / Math.max(1, canvas.getBoundingClientRect().width || canvas.width);
    for (const o of W.objects) {
      if (o.type !== "f_door") continue;
      const tag = o.id === "unit_door" ? "unit_door" : o.id.split("_").slice(0, 2).join("_"), txt = o.plate || PLATE_NO[tag]; if (!txt) continue;
      const p = W.local(o, 1.5, -0.1, 2.75), d = Math.hypot(player.x - p[0], player.y - p[1]); if (d > 14) continue;
      const X = Math.round((SP.sx(p[0], p[1]) - cx) * z), Y = Math.round((SP.sy(p[0], p[1], p[2]) - cy) * z);
      const main = tag === "unit_door", k = Math.max(0.8, Math.min(1.6, z * 1.3)) * kk * (main ? 1.15 : 0.9);
      const w = Math.round(78 * k), h = Math.round(20 * k);
      ctx.save(); ctx.globalAlpha = Math.min(1, (14 - d) / 4);
      if (n > 0.2) { ctx.shadowColor = "rgba(160,200,255,0.9)"; ctx.shadowBlur = 10 * k * n; }
      ctx.fillStyle = n > 0.2 ? "#2f6fd0" : "#1d4f91"; ctx.fillRect(X - w / 2, Y - h, w, h); ctx.shadowBlur = 0;
      ctx.strokeStyle = "#e8eef8"; ctx.lineWidth = Math.max(1, k); ctx.strokeRect(X - w / 2 + 1.5 * k, Y - h + 1.5 * k, w - 3 * k, h - 3 * k);
      ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = `bold ${Math.round(11 * k)}px sans-serif`; ctx.fillText(txt, X, Y - Math.round(6 * k));
      if (n > 0.2) {   // the entrance wall lamp itself: a bright fixture just above the door
        const L = W.local(o, 1.5, -0.25, 2.45), lx = Math.round((SP.sx(L[0], L[1]) - cx) * z), ly = Math.round((SP.sy(L[0], L[1], L[2]) - cy) * z);
        ctx.globalCompositeOperation = "lighter"; const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 18 * k);
        g.addColorStop(0, `rgba(255,236,190,${0.95 * n})`); g.addColorStop(0.25, `rgba(255,200,130,${0.45 * n})`); g.addColorStop(1, "rgba(255,180,100,0)");
        ctx.fillStyle = g; ctx.fillRect(lx - 18 * k, ly - 18 * k, 36 * k, 36 * k); ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#fff6dc"; ctx.fillRect(lx - 3 * k, ly - 1.5 * k, 6 * k, 3 * k);
      }
      ctx.restore();
    }
  }
  function kick() {
    if (player.kickT > 0 || player.carry) return;
    player.kickT = 0.38;
    const o = W.nearest(player.x, player.y), a = o && W.actionFor(o, "kick");
    if (!a) { if (W.interior && SP.game) { SP.game.noise(player.x, player.y, "stomp"); toast("咚！（跺了一下脚）"); return; } toast("踢了一脚空气"); return; }
    const r = W.act(o, "kick", player); if (r) toast(r);
  }
  function interact() {
    const G = SP.game;
    if (G && G.busy()) return;
    if (G && G.menu) { G.pick(null); return; }
    if (player.carry) { if (W.parkBike(player)) toast("停好车、锁上"); else toast("这里停不下（会挡路或压到东西）"); return; }
    const o = st.near; if (!o) return;
    if (o.interact === "gate") {
      const open = o.state !== "open", gates = W.objects.filter((g) => g.interact === "gate");
      gates.forEach((g) => (g.state = open ? "open" : "closed")); W.rebuildColliders();
      // a gate leaf may never swing into a character
      if (SP.actors.list.some((a) => a.circles().some(([x, y, r]) => W.blockedStatic(x, y, r)))) { gates.forEach((g) => (g.state = open ? "closed" : "open")); W.rebuildColliders(); toast("有人挡着门"); return; }
      toast(open ? "推开铁门" : "关上铁门（院子被封住）");
    } else if (o.interact === "door" && o.id === "unit_door") { const r = W.act(o, "use", player); if (r) toast(r);
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
  /* running (Stage 3): PC hold Shift; phone: stick pushed past ~85 % or the 跑 toggle. ~2.2x walk speed, eased in/out
     (runK 0..1 also picks the run clip); never with an open umbrella / a pushed bike / on stair flights / exhausted */
  const RUN_MUL = 2.2;
  SP.canRun = () => !player.umbrella && !player.carry && !(player.kickT > 0) && !st.slowZone && !(SP.game && SP.game.exhausted && SP.game.exhausted());
  function wantRun(v) {
    if (!v || !SP.canRun()) return false;
    if (st.autoRun) return true;                                    // clipping audit at running speed
    if (v[2] === "touch") return SP.runToggle || (SP.touchInput && SP.touchInput.m > 0.85);
    return !!(keys.shift || SP.runToggle || (SP.input && SP.input.shift));
  }
  function movePlayer(dt) {
    const v = inputVec();
    let dist = 0, dir = null;
    const run = wantRun(v);
    player.runK = SP.clamp((player.runK || 0) + (run ? dt * 4 : -dt * 5), 0, 1);
    player.running = player.runK > 0.5;
    if (v) {
      const sp = player.speed * (1 + (RUN_MUL - 1) * player.runK) * (SP.game && SP.game.speedMul ? SP.game.speedMul : 1);
      const [wx, wy] = SP.screenToWorldDir(v[0], v[1]), step = sp * dt * (v[2] === "touch" ? Math.max(0.35, Math.min(1, Math.hypot(v[0], v[1]))) : 1);
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
    const gm = CK.update(dt); syncLight();
    const G = SP.game, inside = W.interior;
    SP.winterWear = CK.season === "winter" || CK.snow > 0.05 || (CK.weather === "snow" && CK.intensity > 0.2);
    if (SP.season !== CK.season) W.applySeason();
    const gmin = Math.floor(CK.abs());
    if (gmin !== W.lastRuleMin) { W.lastRuleMin = gmin; W.updateRules(); SP.layers.checkLit(); }
    if (player.kickT > 0) player.kickT = Math.max(0, player.kickT - dt);
    { const v = inputVec(); st.inputOn = !!v; st.inputW = v ? SP.screenToWorldDir(v[0], v[1]) : null; }                                   // stick / keys held (trigger re-arm needs a real release)
    if (!(G && G.busy())) movePlayer(dt); else { player.moving = false; player.runK = 0; player.running = false; }
    if (!inside) { SP.npcs.update(dt); W.updateEvents(dt); SP.traffic.update(dt); if (SP.chunks) SP.chunks.tick(dt); }        // the street pauses while 李默 is indoors
    if (G) G.update(dt, gm);
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
    // view smaller than the map: every corner over ground; larger (far zoom): the map may not leave the view
    p = p0 <= p1 ? SP.clamp(p, p0, p1) : SP.clamp(p, p1, p0); q = q0 <= q1 ? SP.clamp(q, q0, q1) : SP.clamp(q, q1, q0);
    return [(p + q) / 2 * 64, (q - p) / 2 * 32];
  }
  SP.clampCam = clampCam;
  function updateCam(dt) {
    if (cam.zt == null) cam.zt = cam.zoom;
    if (Math.abs(Math.log(cam.zt / cam.zoom)) > 0.004) applyZoom(Math.exp(SP.lerp(Math.log(cam.zoom), Math.log(cam.zt), Math.min(1, dt * 18))));
    else applyZoom(cam.zt);
    // pan offset eases back while 李默 walks (or on recenter)
    cam.panHold = Math.max(0, (cam.panHold || 0) - dt);
    if (cam.recenter || (player.moving && cam.panHold <= 0)) {
      const k = Math.exp(-dt * (cam.recenter ? 7 : 1.6)); cam.pan[0] *= k; cam.pan[1] *= k;
      if (Math.hypot(cam.pan[0], cam.pan[1]) * cam.zoom < 1) { cam.pan[0] = cam.pan[1] = 0; cam.recenter = false; }
    }
    const z = cam.zoom, vw = canvas.width / z, vh = canvas.height / z;
    let tx, ty;
    const ic = W.interior && SP.place.centerIf(vw, vh);       // a room that fits the view: framed, still
    if (ic) { tx = ic[0] - vw / 2; ty = ic[1] - vh / 2; }
    else if (cam.lock) { [tx, ty] = [SP.sx(cam.lock[0], cam.lock[1]) - vw / 2, SP.sy(cam.lock[0], cam.lock[1], 0) - vh / 2]; }
    else { const [X, Y] = player.screen(); tx = X - vw / 2 + cam.pan[0]; ty = Y - 40 - vh / 2 + (SP.camOffsetY || 0) / z + cam.pan[1]; }
    if (!cam.free && !ic && W.groundRect && player.level !== "roof") {
      const [ux, uy] = clampCam(tx, ty, vw, vh);
      if (!cam.lock) { cam.pan[0] += ux - tx; cam.pan[1] += uy - ty; }      // never accumulate pan beyond the clamp
      tx = ux; ty = uy;
    }
    // smoothing in centre space (zoom changes keep the anchor fixed exactly)
    const ncx = tx + vw / 2, ncy = ty + vh / 2;
    if (!cam.ready || cam.cx == null) { cam.cx = ncx; cam.cy = ncy; }
    else { const k = Math.min(1, dt * 4); cam.cx += (ncx - cam.cx) * k; cam.cy += (ncy - cam.cy) * k; }
    if (!cam.free && !ic && W.groundRect && player.level !== "roof") { const [ux, uy] = clampCam(cam.cx - vw / 2, cam.cy - vh / 2, vw, vh); cam.cx = ux + vw / 2; cam.cy = uy + vh / 2; }
    cam.x = cam.cx - vw / 2; cam.y = cam.cy - vh / 2; cam.ready = true;
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
  // (js/layers.js: cached static tiles per zoom level + repainted dynamic regions; the full painter list is only
  //  built on demand for tests / the debug overlay)
  function shadowDyn(sx) {
    for (const [k, X, Y] of SP.traffic.shadowKeys()) SP.drawFrame(sx, k, X, Y, 1, true);
    sx.fillStyle = "#1a1828";
    for (const a of SP.actors.list) {
      if (a.hidden) continue;
      if (a.vehicle) { for (const [x, y] of a.circles()) { sx.beginPath(); sx.ellipse(SP.sx(x, y) - 2, SP.sy(x, y, 0), 15, 7.5, 0, 0, Math.PI * 2); sx.fill(); } continue; }
      const [X, Y] = a.screen(), r = a.umbrella ? 22 : 12; sx.beginPath(); sx.ellipse(X - 2, Y, r, r / 2, 0, 0, Math.PI * 2); sx.fill();
    }
    if (SP.drawCarriedShadows) SP.drawCarriedShadows(sx);
  }
  function render() {
    SP.updateTint(); SP.frameNo = (SP.frameNo || 0) + 1;
    ctx = mainCtx;
    const z = cam.zoom, cx = Math.round(cam.x * z) / z, cy = Math.round(cam.y * z) / z;
    const view = { x0: cx - 8, y0: cy - 8, x1: cx + canvas.width / z + 8, y1: cy + canvas.height / z + 8 };
    st.view = view; st.viewT = SP.now;
    const E = SP.env;
    const R = SP.layers.render({ canvas, ctx, z, cx, cy, view, player, actorDrawable, dt: st.lastDt || 1 / 60, shadowDyn });
    st.playerIndex = R.pi; st.dynCount = R.dyn.length;
    { const K = {}; for (const d of R.dyn) K[d.kind === "actor" && !d.actor.isPlayer ? "npc" : d.kind] = (K[d.kind === "actor" && !d.actor.isPlayer ? "npc" : d.kind] || 0) + 1; st.dynKinds = K; }
    ctx.setTransform(z, 0, 0, z, -cx * z, -cy * z);
    if (z >= 0.2) drawWires();
    E.applyLight(ctx, canvas, z, cx, cy, R.lights);
    E.emitComposite(ctx);
    E.drawHalos(ctx, R.lights);
    if (z >= SP.layers.FAR) E.drawCarFx(ctx);
    let list = null, pi = -1;
    if (st.debug) { list = buildList(view); pi = list.findIndex((d) => d.kind === "actor" && d.actor === player); drawDebug(list, pi); }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
    grade();
    SP.env.drawFog(ctx, canvas.width, canvas.height);
    SP.env.drawWeather(ctx, canvas.width, canvas.height, cam.x, cam.y, cam.zoom, st.lastDt || 1 / 60);
    if (st.debug) drawDebugText(list, pi);
    drawStopSign(z, cx, cy); drawDoorPlates(z, cx, cy); drawAcFx(z, cx, cy);
    if (SP.game) { SP.game.drawOverlay(ctx, canvas.width, canvas.height); SP.game.hud(); }
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
    // global colour grade by season / weather / time (hotfix): winter + snow cooler blue, summer warmer, rain desaturated cool,
    // dusk warm orange (above), deep night blue. Cheap full-screen composites only.
    if (st.grade && !W.interior) {
      const se = CK.season, wet = CK.weather === "rain" ? CK.intensity : 0, sn = Math.max(CK.snow || 0, CK.weather === "snow" ? CK.intensity : 0);
      const cold = se === "winter" ? 0.55 : se === "autumn" ? 0.15 : 0, hot = se === "summer" ? 0.5 : 0;
      ctx.save();
      if (wet > 0.05) { ctx.globalCompositeOperation = "saturation"; ctx.fillStyle = `rgba(128,128,128,${0.35 * wet})`; ctx.fillRect(0, 0, w, h); }
      ctx.globalCompositeOperation = "soft-light";
      const cool = Math.min(0.45, cold * 0.8 + sn * 0.35 + wet * 0.3) * (0.5 + 0.5 * n);
      if (cool > 0.02) { ctx.fillStyle = `rgba(90,130,210,${cool})`; ctx.fillRect(0, 0, w, h); }
      if (hot > 0.02) { ctx.fillStyle = `rgba(255,170,90,${hot * (0.45 + 0.35 * n)})`; ctx.fillRect(0, 0, w, h); }
      if (n > 0.6 && tn === "night") { ctx.fillStyle = `rgba(40,70,170,${0.3 * (n - 0.6) / 0.4})`; ctx.fillRect(0, 0, w, h); }
      ctx.restore();
    }
    if (n > 0.02) {
      const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.95);
      g.addColorStop(0, "rgba(10,12,30,0)"); g.addColorStop(1, `rgba(10,12,30,${0.45 * n})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
  }
  function anchorPt(spec) {
    if (typeof spec[0] === "number") return SP.scr(spec[0], spec[1], spec[2]);
    const o = W.byId[spec[0]], P = o && W.piece(o), a = P && P.wire_anchors && P.wire_anchors[spec[1]];
    if (!a) { if (!anchorPt.warned) { anchorPt.warned = true; console.warn("wire anchor missing", spec); } return null; }
    const p = SP.rotPt(a, o.rot);
    return SP.scr(o.x + p[0], o.y + p[1], p[2]);
  }
  function drawWires() {
    ctx.save(); ctx.strokeStyle = SP.tint.night > 0.5 ? "rgba(20,20,30,0.9)" : "rgba(34,32,36,0.85)"; ctx.lineWidth = 1;
    const V = st.view;
    for (const w of W.data.wires || []) {
      if (w.chunk && !(W.chunksIn && W.chunksIn[w.chunk])) continue;          // anchored to a pole in a chunk that is not streamed in
      const a = anchorPt(w.from), b = anchorPt(w.to); if (!a || !b) continue;
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
    const tr = W.data.traffic || { crosswalks: [], intersection: { x0: 0, y0: 0, x1: 0, y1: 0 }, lanes: [] };
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
  const hudEl = document.getElementById("status"), toastEl = document.getElementById("toast"), promptEl = document.getElementById("prompt"), logEl = document.getElementById("log"), fbEl = document.getElementById("floorbadge");
  function hud() {
    const fade = (W.fadeHit || []).length ? " · 遮挡淡出：" + W.fadeHit.join(",") : "";
    const wx = CK.weather !== "clear" && CK.intensity > 0.05 ? CK.weatherName() : CK.target !== "clear" ? CK.weatherName(CK.target) : "晴";
    const extra = (CK.snow > 0.12 ? ` · 积雪${["", "薄", "中", "厚"][SP.env.snowLevel()]}` : "") + (CK.wet > 0.3 && CK.snow < 0.12 ? " · 路面湿" : "");
    const txt = `${CK.dateLabel()} ${CK.clockLabel()} · ${CK.seasonName()} · ${wx}${extra} · ×${cam.zoom < 1 ? cam.zoom.toFixed(2) : cam.zoom.toFixed(1)}${st.debug ? ` · (${player.x.toFixed(1)}, ${player.y.toFixed(1)})` + fade : ""}`;
    if (hudEl.textContent !== txt) hudEl.textContent = txt;
    const fb = W.interior ? W.data.name : player.level === "roof" ? "12号天台 · 屋顶（下楼：楼梯间门口）" : "";
    if (fbEl && fbEl.textContent !== fb) fbEl.textContent = fb;
    const tm = st.toast ? st.toast.msg : ""; if (toastEl.textContent !== tm) { toastEl.textContent = tm; toastEl.style.opacity = st.toast ? 1 : 0; }
    let pr = "";
    if (player.carry) pr = "E 停车锁车";
    else if (st.near) { const u = W.actionFor(st.near, "use"), k = W.actionFor(st.near, "kick"); pr = [u && "E " + u.label, k && "F " + k.label].filter(Boolean).join("  ·  ") + (st.nearN > 1 ? `   ⇄ ${(st.pickIdx % st.nearN) + 1}/${st.nearN}（Tab 换）` : ""); }
    { const cy = document.getElementById("btn-cycle"); if (cy) cy.style.display = st.nearN > 1 && !player.carry ? "" : "none"; }
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
  function step(dt) { if (SP.cbd && SP.cbd.active) return cbdStep(dt); simulate(dt); st.lastDt = dt; updateCam(dt); render(); }

  // ---------- CBD place host (js/cbd.js, CBD_READY.md): the core #game canvas + loop are handed to SP.cbd while it is active ----------
  // metro exit A-D -> SP.places.cbd.enter({exit}) -> here; going down a CBD metro exit -> back into the metro (SP.places.metro_cbd).
  // The core clock keeps running (externalClock) and shared-rules keep ticking (needs, rent, 2F-02's meter).
  const CBDH = { saved: null };
  function cbdStep(dt) {
    const C = SP.cbd, G = SP.game, n = Math.max(1, Math.ceil(dt / (1 / 60) - 1e-6));
    let gm = 0; for (let i = 0; i < n; i++) { SP.now += dt / n; gm += CK.update(dt / n) || 0; }
    if (G && G.ps) G.onRuleEvents(G.rules.tick(G.ps, gm, G.ctx()));
    if (st.toast) { st.toast.t -= dt; if (st.toast.t <= 0) st.toast = null; }
    st.lastDt = dt; C.frame(dt); st.near = null; hud();
    const pr = C.near ? (SP.isTouch ? "" : "E ") + C.near.label : ""; if (promptEl.textContent !== pr) promptEl.textContent = pr;
    if (fbEl) { const fb = "云汇CBD · 中央商务区" + (C.cam.zoom < 0.04 ? " · 天际线" : ""); if (fbEl.textContent !== fb) fbEl.textContent = fb; }
    hudEl.textContent = `${CK.dateLabel()} ${CK.clockLabel()} · ${CK.seasonName()} · ${CK.weatherName()} · ×${C.cam.zoom < 0.1 ? C.cam.zoom.toFixed(3) : C.cam.zoom.toFixed(2)}`;
    SP.promptActions = { use: !!C.near, kick: false };
  }
  function cbdEnter(o) {
    const C = SP.cbd; toast("云汇CBD 加载中…");
    C.load().then(() => {
      if (!CBDH.saved) CBDH.saved = { actions: SP.actions, zoomBy: SP.zoomBy, zoomEnd: SP.zoomEnd, panBy: SP.panBy, zoomStep: SP.zoomStep, recenter: SP.recenter, cam: SP.cam,
                                      pos: [player.x, player.y, player.dir, player.level, player.hidden] };
      C.player = player; player.level = null; player.hidden = false; player.carry = null;
      C.attach(canvas); C.externalClock = true; C.onToast = (m) => toast(m); C.onExit = cbdLeave;
      Object.assign(SP, { actions: Object.assign({}, CBDH.saved.actions, C.actions), zoomBy: C.zoomBy, zoomEnd: C.zoomEnd, panBy: C.panBy, cam: C.cam,
                          zoomStep: C.zoomStep || CBDH.saved.zoomStep, recenter: () => C.actions.recenter() });
      C.enter(o && typeof o === "object" ? { exit: o.exit || o.link || "A", from: o.from } : o);
      if (C.zoomTo) C.zoomTo(SP.clamp(cam.zoom, 0.25, 3), null, null, true);     // same framing as the street on arrival (core zoom presets)
      W.logEvent("到达 云汇CBD（" + ((o && (o.exit || o.link)) || "A") + " 出口）");
    }).catch((e) => { console.error(e); toast("云汇CBD 加载失败"); if (SP.places.metro_cbd) SP.places.metro_cbd.enter({ link: (o && o.exit) || "A" }); });
    return null;
  }
  function cbdLeave(e) {
    const C = SP.cbd; C.leave();
    const s = CBDH.saved; CBDH.saved = null;
    if (s) { Object.assign(SP, { actions: s.actions, zoomBy: s.zoomBy, zoomEnd: s.zoomEnd, panBy: s.panBy, zoomStep: s.zoomStep, recenter: s.recenter, cam: s.cam });
             [player.x, player.y] = s.pos; player.setDir(s.pos[2]); player.level = s.pos[3]; player.hidden = s.pos[4]; }
    cam.ready = false; promptEl.textContent = "";
    if (SP.places.metro_cbd) SP.places.metro_cbd.enter({ link: (e && (e.link || e.id)) || "A" });
  }
  SP.cbdHost = { enter: cbdEnter, leave: cbdLeave, active: () => !!(SP.cbd && SP.cbd.active) };
  if (SP.cbd) {
    SP.cbd.host = { enter: cbdEnter };
    // overwrite the stub once the real module is on the page (cbd.js uses `SP.places.cbd = SP.places.cbd || …`)
    SP.places = SP.places || {};
    SP.places.cbd = { _cbd: true, enter: (o) => cbdEnter(o) };
  }

  // ---------- audit runner (no rendering; chunked so CDP calls stay short) ----------
  const AUD = { C: null, walker: null, i: 0 };
  function auditRun(o) {
    o = Object.assign({ seconds: 60, dt: 1 / 30, sortEvery: 10, pixelEvery: 240, seed: 7, reset: false }, o || {});
    if (o.reset || !AUD.C) { AUD.C = SP.audit.counts(); AUD.walker = SP.audit.randomWalker(o.seed); AUD.i = 0; }
    const C = AUD.C; st.autoWalk = AUD.walker; st.autoRun = !!o.run; st.auditLock = !!o.lock;
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
    st.autoWalk = null; st.autoRun = false; st.auditLock = false;
    C.simSeconds = +(C.steps * o.dt).toFixed(1); C.ms = (C.ms || 0) + Math.round(performance.now() - t0);
    const travel = {}; for (const k in C.travel) travel[k] = Math.round(C.travel[k]);
    const amb = Object.entries(C.ambiguous || {}).sort((p, q) => q[1] - p[1]).slice(0, 12);
    return Object.assign({}, C, { travel, ambiguous: amb, samples: C.samples.slice(0, 8) });
  }

  // ---------- boot ----------
  const assets = [["atlas", "kit/kit_atlas.png"], ["emit", "kit/kit_emit.png"], ["int_atlas", "kit_int/kit_atlas.png"], ["int_emit", "kit_int/kit_emit.png"]].concat(Object.entries(window.ACTORS).map(([k, v]) => ["actor_" + k, v.img]), SP.overrideAssets());
  SP.load(assets).then(() => {
    SP.applyOverrides();
    CK.init(window.SCENE_DATA, Q); SP.season = CK.season; syncLight();
    SP.updateTint(true);
    W.load(window.SCENE_DATA);
    SP.traffic.reset();
    spawnActors();
    SP.updateTint(true); W.bakeGround();
    SP.place.init(); SP.game.init();
    SP.actions = { interact: () => { st.near = nearest(); interact(); }, kick, time: () => { CK.cycleTime(); toast("时间快进"); }, weather: () => { CK.cycleWeather(); toast("天气：" + CK.weatherName(CK.target)); },
                   nextDay: () => CK.nextDay(), log: () => (st.showLog = !st.showLog), zoom: (d) => SP.zoomStep(d), recenter: () => SP.recenter(), season: (se) => setSeason(se || SEASONS[(SEASONS.indexOf(SP.season) + 1) % SEASONS.length]),
                   event: fireEvent, umbrella: toggleUmbrella, reset: resetScene, debug: () => (st.debug = !st.debug), near: () => st.near,
                   /** deterministic walk for tests: world direction (wx, wy) for `sec` seconds of fixed 1/60 steps; run = Shift */
                   walk: (wx, wy, sec, run) => { const L = Math.hypot(wx, wy) || 1; let best = [1, 0], bd = -9;
                     for (let k = 0; k < 720; k++) { const t = k * Math.PI / 360, d = SP.screenToWorldDir(Math.cos(t), Math.sin(t)), q = (d[0] * wx + d[1] * wy) / L / (Math.hypot(d[0], d[1]) || 1); if (q > bd) { bd = q; best = [Math.cos(t), Math.sin(t)]; } }
                     st.autoWalk = () => best; keys.shift = !!run; const n = Math.round(sec * 60); for (let i = 0; i < n; i++) update(1 / 60); st.autoWalk = null; keys.shift = false; return SP.place.where(); },
                   idle: (sec) => { const n = Math.round(sec * 60); for (let i = 0; i < n; i++) update(1 / 60); return SP.place.where(); },
                   go: (to, sp) => SP.game.switchScene(to, sp || (SP.scenes[to] && SP.scenes[to].spawn) || (to === "street" ? [W.data.spawn.x, W.data.spawn.y, W.data.spawn.dir] : null)) };
    document.querySelectorAll("[data-ev]").forEach((b) => b.addEventListener("click", () => { const e = b.dataset.ev; if (e === "reset") resetScene(); else if (e === "time") CK.cycleTime(); else if (e === "weather") CK.cycleWeather(); else if (e === "kick") kick(); else if (e === "debug") st.debug = !st.debug; else if (e === "umbrella") toggleUmbrella(); else if (e === "zoomin") SP.zoomStep(1); else if (e === "zoomout") SP.zoomStep(-1); else if (e === "recenter") SP.recenter();
      else if (e === "season") setSeason(SEASONS[(SEASONS.indexOf(SP.season) + 1) % SEASONS.length]); else fireEvent(e); b.blur(); }));
    window.__proto = {
      SP, player, world: W, traffic: SP.traffic, state: st, cam,
      step: (dt, n) => { for (let i = 0; i < (n || 1); i++) step(dt); return true; },
      sim: (seconds, dt) => { dt = dt || 1 / 30; for (let t = 0; t < seconds; t += dt) update(dt); return true; },
      skip: (seconds) => { for (let t = 0; t < seconds; t += 1 / 30) update(1 / 30); SP.actors.resolve(12); return true; },
      render: () => { updateCam(1); render(); return true; },
      trigger: fireEvent, setTime: (n, inst) => setTime(n, inst !== false), setSeason, clock: CK, env: SP.env, kick, act: (id, kind) => { const o = W.byId[id]; return o ? W.act(o, kind || "use", player) : null; },
      setWeather: (w, i) => { CK.setWeather(w, i == null ? 0.8 : i, true, true); syncLight(); return true; }, zoom: (z) => { if (z) { cam.zoom = cam.zt = z; cam.pan = [0, 0]; cam.ready = false; } return cam.zoom; }, reset: resetScene, umbrella: toggleUmbrella, interact: () => { st.near = nearest(); interact(); return st.near && st.near.id; },
      order: () => buildList(st.view).map((d) => (d.kind === "obj" ? d.o.id + "/" + d.part : d.kind === "actor" ? (d.actor === player ? "PLAYER" : "NPC:" + d.actor.id) : d.kind === "car" ? d.car.id : d.kind)),
      buildList: (view) => buildList(view),
      alpha: (id, part) => { const o = W.byId[id]; return o ? (o.alpha[part || W.piece(o).parts[0]] ?? 1) : null; },
      place: (x, y, dir) => { player.x = x; player.y = y; if (dir) player.setDir(dir); cam.pan = [0, 0]; cam.ready = false; },
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
    // lazy module sprites (store uniforms / clerks): fetched after boot so the first frame is not delayed
    if (!window.ACTORS.li_mo_uniform && !document.querySelector('script[src="js/actors_store.js"]')) { const sc = document.createElement("script"); sc.src = "js/actors_store.js"; document.head.appendChild(sc); }
    if (!st.manual) requestAnimationFrame(frame); else step(1 / 60);
  });
})(window.SP);
