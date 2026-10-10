/* scene-proto · mobile / touch (ported from web-demo js/mobile.js): full-screen canvas sized to the phone (integer
   device-pixel scale, crisp pixels) in portrait and landscape, floating analog joystick, 互动 / 踢 buttons, top bar with
   时间 / 天气 / 季节 / 事件 (event sheet: 1-5, 重置, 下一天, 日志, 调试), no page scroll / pinch / double-tap zoom.
   Touch UI shows on touch devices or with ?touch=1 (?touch=0 hides). Desktop keyboard play is unchanged. */
(function (SP) {
  "use strict";
  const Q = new URLSearchParams(location.search), body = document.body, force = Q.get("touch");
  const hasTouch = (navigator.maxTouchPoints || 0) > 0 || "ontouchstart" in window || (window.matchMedia && matchMedia("(pointer: coarse)").matches);
  const touch = force === "1" || (force !== "0" && hasTouch);
  SP.isTouch = touch;
  const TI = (SP.touchInput = { x: 0, y: 0, m: 0, active: false, id: null, c: [0, 0] });
  const $ = (id) => document.getElementById(id);
  const canvas = $("game"), wrap = $("wrap");
  // ---------- layout ----------
  function layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const mobile = touch || Q.get("mobile") === "1" || (vw < 760 && !Q.get("w"));
    body.classList.toggle("mobile", mobile); body.classList.toggle("touch", touch);
    if (!mobile) { SP.mobile = null; return; }
    const portrait = vh > vw;
    body.classList.toggle("portrait", portrait); body.classList.toggle("landscape", !portrait);
    const dpr = window.devicePixelRatio || 1;
    // integer device pixels per game pixel; the short side shows ~360-480 game px (8-10 m of street)
    const s = Math.max(1, Math.round(Math.min(vw, vh) * dpr / 400));
    const bw = Math.round(vw * dpr / s), bh = Math.round(vh * dpr / s);
    if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
    canvas.style.width = (bw * s / dpr) + "px"; canvas.style.height = (bh * s / dpr) + "px";
    SP.mobile = { portrait, scale: s, dpr, vw, vh };
    window.scrollTo(0, 0);
  }
  SP.layout = layout;
  layout();
  window.addEventListener("resize", layout);
  window.addEventListener("orientationchange", () => setTimeout(layout, 150));
  if (window.visualViewport) visualViewport.addEventListener("resize", layout);
  // ---------- no page scroll / pinch / double-tap zoom ----------
  const scrollable = (el) => el && el.closest && el.closest(".scroll");
  document.addEventListener("touchmove", (e) => { if (!scrollable(e.target) || e.touches.length > 1) e.preventDefault(); }, { passive: false });
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("dblclick", (e) => e.preventDefault());
  document.addEventListener("contextmenu", (e) => { if (touch) e.preventDefault(); });
  let lastTouchEnd = 0;
  document.addEventListener("touchend", (e) => { const now = Date.now(); if (now - lastTouchEnd < 320 && !e.target.closest("button")) e.preventDefault(); lastTouchEnd = now; }, { passive: false });
  if (!touch) return;
  // ---------- controls DOM ----------
  const root = document.createElement("div");
  root.id = "touch";
  root.innerHTML =
    '<div id="mtop"><div id="mstatus"></div><div id="mbtns">' +
    '<button type="button" class="tb" data-m="time">⏩<i>时间</i></button><button type="button" class="tb" data-m="weather">☂<i>天气</i></button>' +
    '<button type="button" class="tb" data-m="season">🍂<i>季节</i></button><button type="button" class="tb" data-m="sheet">⚡<i>事件</i></button></div></div>' +
    '<div id="msheet" class="hidden"><div class="grid">' +
    '<button data-m="broken_window">1 破窗</button><button data-m="fire">2 起火</button><button data-m="crash">3 撞车</button>' +
    '<button data-m="storm">4 暴雨</button><button data-m="blizzard">5 大雪</button><button data-m="day">下一天</button>' +
    '<button data-m="log">日志</button><button data-m="debug">调试</button><button data-m="reset">0 重置</button></div></div>' +
    '<div id="joy-zone"><div id="joy-base"><div id="joy-knob"></div></div></div>' +
    '<button type="button" id="btn-kick" class="tbtn small">踢</button>' +
    '<button type="button" id="btn-act" class="tbtn">互动</button>';
  body.appendChild(root);
  const zone = $("joy-zone"), base = $("joy-base"), knob = $("joy-knob"), R = 52, DEAD = 0.16;
  function baseCentre() { const r = base.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  function setKnob(dx, dy) { knob.style.transform = `translate(${dx}px, ${dy}px)`; }
  function moveTo(cx, cy) {
    const [bx, by] = TI.c; let dx = cx - bx, dy = cy - by; const d = Math.hypot(dx, dy);
    if (d > R) { dx *= R / d; dy *= R / d; }
    setKnob(dx, dy);
    const m = Math.min(1, d / R);
    TI.m = m < DEAD ? 0 : (m - DEAD) / (1 - DEAD);
    TI.x = d > 0 ? dx / Math.min(d, R) : 0; TI.y = d > 0 ? dy / Math.min(d, R) : 0;
  }
  function release() { TI.active = false; TI.id = null; TI.m = 0; TI.x = TI.y = 0; setKnob(0, 0); base.style.transform = ""; base.classList.remove("on"); }
  zone.addEventListener("pointerdown", (e) => {
    if (TI.active) return; e.preventDefault();
    try { zone.setPointerCapture(e.pointerId); } catch (_) {}
    TI.active = true; TI.id = e.pointerId;
    const [hx, hy] = baseCentre();
    base.style.transform = `translate(${e.clientX - hx}px, ${e.clientY - hy}px)`;
    TI.c = [e.clientX, e.clientY]; base.classList.add("on"); moveTo(e.clientX, e.clientY);
  });
  zone.addEventListener("pointermove", (e) => { if (TI.active && e.pointerId === TI.id) { e.preventDefault(); moveTo(e.clientX, e.clientY); } });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => zone.addEventListener(t, (e) => { if (e.pointerId === TI.id) release(); }));
  window.addEventListener("blur", release);
  function tap(el, fn) {
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); el.classList.add("down"); if (window.__protoReady) fn(); });
    ["pointerup", "pointercancel", "pointerleave"].forEach((t) => el.addEventListener(t, () => el.classList.remove("down")));
    el.addEventListener("click", (e) => e.preventDefault());
  }
  const sheet = $("msheet");
  tap($("btn-act"), () => SP.interact("use"));
  tap($("btn-kick"), () => SP.interact("kick"));
  root.querySelectorAll("[data-m]").forEach((b) => tap(b, () => {
    const m = b.dataset.m;
    if (m === "sheet") { sheet.classList.toggle("hidden"); return; }
    if (b.closest("#msheet")) sheet.classList.add("hidden");
    SP.button(m);
  }));
  if (force !== "1") window.addEventListener("keydown", () => body.classList.add("kbd"), { once: true });
  const act = $("btn-act"), kick = $("btn-kick"), status = $("mstatus");
  let sk = "";
  setInterval(function tick() {      // UI state only: a timer, not a 2nd rAF loop
    if (window.__protoReady && SP.state) {
      const s = SP.state, W = SP.world, n = s.near;
      act.classList.toggle("ready", !!(n || SP.player.carry));
      kick.classList.toggle("ready", !!(n && W.actionFor(n, "kick")));
      const C = SP.clock, t = `${C.clockLabel()} ${C.phaseName()} · ${C.seasonName()} · ${C.weatherName()}  <small>${C.dateLabel()}</small>`;
      if (t !== sk) { sk = t; status.innerHTML = t; }
    }
  }, 120);
})(window.SP);
