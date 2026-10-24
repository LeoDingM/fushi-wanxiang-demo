/* 云汇CBD · controls: camera (follow + free pan, smooth log-zoom 0.018..3 around a screen anchor, snap presets),
   keyboard / wheel / mouse-drag input, touch joystick (SP.touchInput from js/mobile.js), 李默 movement + interactions
   (metro exits A-D, lobbies, mall / stadium doors, BRT station, taxi rank, buskers). */
(function (SP) {
  "use strict";
  const C = SP.cbd, X = C._; if (!X) return; C._mods.controls = true;
  const { D, W, cam, keys, SX, SY, clamp, lerp, dirOf } = X;
  const ZMIN = 0.016, ZMAX = 3, ZOOMS = [0.02, 0.028, 0.04, 0.06, 0.09, 0.13, 0.18, 0.25, 0.35, 0.5, 0.67, 1, 1.5, 2, 3], SNAPS = [0.5, 1, 2, 3];
  X.ZMIN = ZMIN;
  let sky = null;
  /** screen-space centre of the district skyline: x = middle of the CBD, y = halfway between the front ground corner and
      the top of the tallest tower (+ crown beam margin) */
  X.skyFrame = function () {
    if (sky) return sky;
    const B = D.bounds; let top = -Infinity, lo = Infinity, hi = -Infinity;
    for (const t of W.towers) if (!t.fab && t.h >= 300) for (const d of t.drawables) { top = Math.max(top, -d.rect.y0); lo = Math.min(lo, d.rect.x0); hi = Math.max(hi, d.rect.x1); }
    for (const [x, y] of [[B[0], B[1]], [B[2], B[1]], [B[0], B[3]], [B[2], B[3]]]) { lo = Math.min(lo, SX(x, y)); hi = Math.max(hi, SX(x, y)); }
    const yb = SY(B[0], B[1], 0) + 400, yt = -top - 1600;
    return (sky = [(lo + hi) / 2, (yb + yt) / 2, yb - yt]);
  };
  C.zoomTo = (z, ax, ay, instant) => { z = clamp(z, ZMIN, ZMAX); cam.zt = z; cam.anchor = ax == null ? null : [ax, ay]; SP.userZoom = z; if (instant) applyZoom(z); return z; };
  C.zoomBy = (f, ax, ay, instant) => C.zoomTo((cam.zt == null ? cam.zoom : cam.zt) * f, ax, ay, instant);
  C.zoomStep = (d) => {
    const cur = cam.zt == null ? cam.zoom : cam.zt;
    let z = d > 0 ? ZOOMS.find((q) => q > cur * 1.02) : [...ZOOMS].reverse().find((q) => q < cur / 1.02);
    if (z == null) z = d > 0 ? ZMAX : ZMIN; return C.zoomTo(z);
  };
  C.zoomEnd = () => { const z = cam.zt == null ? cam.zoom : cam.zt, s = SNAPS.find((q) => Math.abs(z / q - 1) < 0.07); if (s) C.zoomTo(s, cam.anchor && cam.anchor[0], cam.anchor && cam.anchor[1]); };
  C.panBy = (dx, dy) => { cam.pan[0] += dx / cam.zoom; cam.pan[1] += dy / cam.zoom; cam.x += dx / cam.zoom; cam.y += dy / cam.zoom; cam.panHold = 1.5; cam.recenter = false; };
  /** zoom keeping the world point under the anchor (screen px) fixed */
  function applyZoom(z1) {
    const z0 = cam.zoom; if (Math.abs(z1 - z0) < 1e-9 || !C.canvas) { cam.zoom = z1; return; }
    const ax = cam.anchor ? cam.anchor[0] - C.canvas.width / 2 : 0, ay = cam.anchor ? cam.anchor[1] - C.canvas.height / 2 : 0, k = 1 / z0 - 1 / z1;
    cam.pan[0] += ax * k; cam.pan[1] += ay * k; cam.x += ax * k; cam.y += ay * k; cam.zoom = z1;
  }
  function onKey(e) {
    if (!C.active || SP.keyboardBlocked?.(e)) return;
    const k = SP.keybindings?.resolve(e.key) ?? e.key.toLowerCase(); keys[k] = true;
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    if (e.repeat || C.ownKeys === false) return;
    const A = C.actions;
    if (k === "=" || k === "+") C.zoomStep(1); if (k === "-" || k === "_") C.zoomStep(-1);
    if (k === "f") A.interact(); if (k === "e") { if (["exit","door","compound","lobby"].includes(C.near?.kind)) X.toast("进出门请按 F"); else A.interact(); } if (k === "]") A.time(); if (k === "r") A.weather(); if (k === "y") A.season(); if (k === "u") A.umbrella();
    if (k === "`") A.debug(); if (k === "c" || k === "home") A.recenter(); if (k === "capslock") SP.runToggle = !SP.runToggle; if (k === "k") A.skyline();
    if (k === "n" && SP.clock) SP.clock.nextDay(); if (k === "l") A.log();
  }
  function bindInput(cv) {
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));
    window.addEventListener("blur", () => { for (const k in keys) keys[k] = false; });
    cv.addEventListener("wheel", (e) => {
      if (!C.active) return; e.preventDefault();
      const r = cv.getBoundingClientRect(), sx = cv.width / r.width, sy = cv.height / r.height;
      C.zoomBy(Math.exp(-clamp(e.deltaY * (e.deltaMode === 1 ? 33 : 1), -240, 240) * 0.0022), (e.clientX - r.left) * sx, (e.clientY - r.top) * sy);
      clearTimeout(C._wt); C._wt = setTimeout(C.zoomEnd, 260);
    }, { passive: false });
    let drag = null;
    cv.addEventListener("mousedown", (e) => { if (C.active && (e.button === 0 || e.button === 1)) drag = [e.clientX, e.clientY]; });
    window.addEventListener("mousemove", (e) => { if (!drag) return; const r = cv.getBoundingClientRect(); C.panBy(-(e.clientX - drag[0]) * cv.width / r.width, -(e.clientY - drag[1]) * cv.height / r.height); drag = [e.clientX, e.clientY]; });
    window.addEventListener("mouseup", () => (drag = null));
  }
  C.attach = function (cv) { C.canvas = cv; C.ctx = cv.getContext("2d"); if (!C._bound) { bindInput(cv); C._bound = true; } };
  /** screen-space input (keys / joystick / autoWalk) -> unit world vector + magnitude */
  function inputDir() {
    const down = (...k) => k.some((x) => keys[x]);
    let dx = 0, dy = 0;
    if (down("a", "arrowleft")) dx -= 1; if (down("d", "arrowright")) dx += 1; if (down("w", "arrowup")) dy -= 1; if (down("s", "arrowdown")) dy += 1;
    let m = dx || dy ? 1 : 0;
    const T = SP.touchInput; if (T && T.active && T.m > 0) { dx = T.x; dy = T.y; m = T.m; }
    if (C.autoWalk) { dx = C.autoWalk[0]; dy = C.autoWalk[1]; m = 1; }
    if (!m) return null;
    const wx = dx - dy, wy = -dx - dy, L = Math.hypot(wx, wy) || 1;
    return [wx / L, wy / L, m];
  }
  X.playerStep = function (dt) {
    const P = C.player, I = inputDir(), run = !!(SP.runToggle || keys["shift"]);
    P.runK = run ? 1 : 0;
    if (I) {
      const sp = (run ? 3.6 : 1.7) * (0.35 + 0.65 * I[2]);
      const moved = X.moveActor(P, I[0] * sp * dt, I[1] * sp * dt, P.umbrella ? 0.55 : 0.22);
      P.update(dt, moved > 1e-4, dirOf(I[0], I[1]), moved);
      const hit = moved < sp * dt * 0.5 ? X.blocked(P.x + I[0] * 0.3, P.y + I[1] * 0.3, 0.22, P) : null;
      if (hit && hit.exit) {                        // pushing into a metro exit's stair opening for 0.4 s = go down
        const e = D.exits.find((q) => q.id === hit.exit), [x0, y0, x1, y1] = e.trigger;
        if (P.x > x0 - 0.8 && P.x < x1 + 0.8 && P.y > y0 - 0.8 && P.y < y1 + 0.8) { C._push = (C._push || 0) + dt; if (C._push > 0.4) { C._push = 0; X.useExit(e); } }
      } else C._push = 0;
    } else P.update(dt, false, P.dir, 0);
    C.near = null;
    for (const e of D.exits) if (Math.hypot(P.x - e.spawn[0], P.y - e.spawn[1]) < 3.2) C.near = { kind: "exit", e, label: `互动：进入地铁 ${e.name}` };
    if (!C.near) {
      for (const b of D.buildings) if (b.door && Math.hypot(P.x - b.door[0], P.y - b.door[1]) < 3.2) {
        const open = b.kind === "compound" ? `${b.name}（业主门禁 · 刷脸）` : `${b.name}（室内稍后开放）`;
        C.near = { kind: b.kind === "compound" ? "compound" : "door", b, label: open };
      }
      for (const t of W.towers) if (t.walk) for (const p of [[(t.box[0] + t.box[2]) / 2, t.box[1] - 1.5], [t.box[0] - 1.5, (t.box[1] + t.box[3]) / 2]])
        if (Math.hypot(P.x - p[0], P.y - p[1]) < 3.4) C.near = { kind: "lobby", t, label: `${t.name} 大堂 · ${t.use}（${t.height_m} m · ${t.floors} 层）` };
      const st = D.traffic.lanes.find((l) => l.station);
      if (st && Math.abs(P.y - (st.c + D.traffic.lanes.find((l) => l.station && l !== st).c) / 2) < 1.8 && P.x > st.station[0] - 4 && P.x < st.station[1] + 4) C.near = { kind: "brt", label: "云汇中心 BRT 站 · B1 线（¥2）" };
      const tl = D.traffic.lanes.find((l) => l.taxi);
      if (tl && Math.abs(P.x - (tl.c + 3)) < 2.5 && P.y > tl.taxi[0] - 2 && P.y < tl.taxi[1] + 2) C.near = { kind: "taxi", label: "出租车上落客点 · 云汇天地" };
      for (const b of D.buskers) if (b.actor && Math.hypot(P.x - b.x, P.y - b.y) < 3) C.near = { kind: "busk", label: "街头艺人 · 打赏 ¥5（扫码）" };
    }
    SP.promptActions = { use: !!C.near };
  };
  X.useExit = function (e) { C.lastExit = e; X.logEv(`李默 → 地铁 ${e.name}（${e.to}）`); if (C.onExit) C.onExit(e); else X.toast(`${e.name}：地铁模块未接入（${e.to} · ${e.link}）`); };
  X.updateCam = function (dt) {
    if (cam.zt == null) cam.zt = cam.zoom;
    if (Math.abs(Math.log(cam.zt / cam.zoom)) > 0.004) applyZoom(Math.exp(lerp(Math.log(cam.zoom), Math.log(cam.zt), Math.min(1, dt * 14)))); else applyZoom(cam.zt);
    const P = C.player, z = cam.zoom;
    cam.panHold = Math.max(0, (cam.panHold || 0) - dt);
    if (cam.recenter || (P.moving && cam.panHold <= 0)) {
      const k = Math.exp(-dt * (cam.recenter ? 7 : 1.6)); cam.pan[0] *= k; cam.pan[1] *= k;
      if (Math.hypot(cam.pan[0], cam.pan[1]) * z < 1) { cam.pan[0] = cam.pan[1] = 0; cam.recenter = false; }
    }
    // skyline zoom: the camera blends from 李默 to a fixed framing of the whole district (front ground corner .. landmark
    // crown), so at max zoom-out the full skyline incl. the 天枢塔 crown fits a 720 px desktop / 844 px phone screen
    const k = clamp((0.08 - z) / 0.05, 0, 1), SKY = X.skyFrame();
    if (P.moving) cam.focus = null;
    const tx = (cam.focus ? SX(cam.focus[0], cam.focus[1]) : lerp(SX(P.x, P.y), SKY[0], k)) + cam.pan[0], ty = (cam.focus ? SY(cam.focus[0], cam.focus[1], cam.focus[2] || 0) : lerp(SY(P.x, P.y, 0) - 40 + (SP.camOffsetY || 0) / z, SKY[1], k)) + cam.pan[1];
    const E = D.extent, cx0 = SX(E[0], E[3]), cx1 = SX(E[2], E[1]), cy0 = SY(E[2], E[3], 0) - 26000, cy1 = SY(E[0], E[1], 0);
    const nx = clamp(tx, cx0, cx1), ny = clamp(ty, cy0, cy1);
    cam.pan[0] += nx - tx; cam.pan[1] += ny - ty;
    if (!cam.ready) { cam.x = nx; cam.y = ny; cam.ready = true; } else { const k = Math.min(1, dt * 5); cam.x += (nx - cam.x) * k; cam.y += (ny - cam.y) * k; }
  };
})(window.SP = window.SP || {});
