/* scene-proto-45 · phone / touch play (ported from web-demo/js/mobile.js):
   - full-screen canvas in portrait and landscape (backing store = CSS px, pixel-art upscale by the browser), camera
     follows 李默 (portrait: he sits a bit above centre so the thumbs don't cover him)
   - floating analog joystick (left half): its SCREEN direction is mapped to a world vector exactly like WASD
     (SP.screenToWorldDir), so pushing up walks up the screen
   - 互动 button (E, pulses when something is in reach), 时间 (T), 伞 (U), event buttons 破窗/起火/撞车, 重置, 调试
   - no page scroll / pinch / double-tap zoom. Desktop keyboard play is unchanged (controls only on touch devices,
     or with ?touch=1; ?touch=0 hides them). */
(function (SP) {
  "use strict";
  const Q = new URLSearchParams(location.search), body = document.body, force = Q.get("touch");
  const hasTouch = (navigator.maxTouchPoints || 0) > 0 || "ontouchstart" in window || (window.matchMedia && matchMedia("(pointer: coarse)").matches);
  const touch = force === "1" || (force !== "0" && hasTouch);
  SP.isTouch = touch;
  const TI = (SP.touchInput = { x: 0, y: 0, m: 0, active: false, id: null });
  const $ = (id) => document.getElementById(id);
  const canvas = $("game"), wrap = $("wrap");
  const DESK = [canvas.width, canvas.height];

  function layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const mobile = touch || vw < 760 || vh < 520;
    body.classList.toggle("mobile", mobile); body.classList.toggle("touch", touch);
    if (!mobile) {
      body.classList.remove("portrait", "landscape"); wrap.style.cssText = ""; canvas.style.cssText = "";
      if (canvas.width !== DESK[0] || canvas.height !== DESK[1]) { canvas.width = DESK[0]; canvas.height = DESK[1]; }
      SP.camOffsetY = 0; if (SP.cam) SP.cam.zoom = SP.userZoom || +(Q.get("zoom") || SP.defaultZoom || 0.5);
      return;
    }
    const portrait = vh > vw * 1.1;
    body.classList.toggle("portrait", portrait); body.classList.toggle("landscape", !portrait);
    Object.assign(wrap.style, { position: "fixed", left: "0px", top: "0px", width: vw + "px", height: vh + "px" });
    Object.assign(canvas.style, { width: vw + "px", height: vh + "px" });
    if (canvas.width !== vw || canvas.height !== vh) { canvas.width = vw; canvas.height = vh; }
    // world scale: ~1 logical px per CSS px; very small landscape heights zoom out a little to keep the street readable
    if (SP.cam) SP.cam.zoom = SP.userZoom || +(Q.get("zoom") || (portrait ? 1 : vh < 360 ? 0.67 : 1));
    SP.camOffsetY = portrait && touch ? Math.round(vh * 0.12) : 0;
    window.scrollTo(0, 0);
  }
  SP.layout = layout;
  layout();
  window.addEventListener("resize", layout);
  window.addEventListener("orientationchange", () => setTimeout(layout, 120));
  if (window.visualViewport) visualViewport.addEventListener("resize", layout);
  setTimeout(layout, 0);

  // ---------- no page scroll / pinch / double-tap zoom ----------
  document.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("dblclick", (e) => e.preventDefault());
  document.addEventListener("contextmenu", (e) => { if (touch) e.preventDefault(); });
  let lastTouchEnd = 0;
  document.addEventListener("touchend", (e) => { const now = Date.now(); if (now - lastTouchEnd < 320 && !e.target.closest("button")) e.preventDefault(); lastTouchEnd = now; }, { passive: false });

  if (!touch) return;

  // ---------- controls ----------
  const root = document.createElement("div");
  root.id = "touch";
  root.innerHTML =
    '<div id="joy-zone"><div id="joy-base"><div id="joy-knob"></div></div></div>' +
    '<button type="button" id="btn-act" class="tbtn">互动</button>' +
    '<button type="button" id="btn-time" class="tbtn small" aria-label="切换时段">◐<i>时间</i></button>' +
    '<button type="button" id="btn-umb" class="tbtn small" aria-label="撑伞">☂<i>伞</i></button>' +
    '<button type="button" id="btn-kick" class="tbtn">踢</button>' +
    '<div id="zoombar"><button type="button" id="btn-zin" class="zbtn" aria-label="放大">＋</button><button type="button" id="btn-zout" class="zbtn" aria-label="缩小">－</button></div>' +
    '<div id="evbar">' +
    '<button type="button" class="ebtn" data-tev="broken_window">破窗</button><button type="button" class="ebtn" data-tev="fire">起火</button>' +
    '<button type="button" class="ebtn" data-tev="crash">撞车</button><button type="button" class="ebtn" data-tev="reset">重置</button>' +
    '<button type="button" class="ebtn" data-tev="weather">天气</button><button type="button" class="ebtn" data-tev="season">季节</button>' +
    '<button type="button" class="ebtn" data-tev="log">日志</button><button type="button" class="ebtn" data-tev="debug">调试</button></div>';
  body.appendChild(root);
  const zone = $("joy-zone"), base = $("joy-base"), knob = $("joy-knob");
  const R = 52, DEAD = 0.18;
  function baseCentre() { const r = base.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  function setKnob(dx, dy) { knob.style.transform = `translate(${dx}px, ${dy}px)`; }
  function moveTo(cx, cy) {
    const [bx, by] = TI.c; let dx = cx - bx, dy = cy - by; const d = Math.hypot(dx, dy);
    if (d > R) { dx *= R / d; dy *= R / d; }
    setKnob(dx, dy);
    const m = Math.min(1, d / R);
    TI.m = m < DEAD ? 0 : (m - DEAD) / (1 - DEAD);
    TI.x = d > 0 ? dx / Math.min(d, R) : 0; TI.y = d > 0 ? dy / Math.min(d, R) : 0;
    if (Math.hypot(TI.x, TI.y) > 0) { const L = Math.hypot(TI.x, TI.y); TI.x /= L; TI.y /= L; }
  }
  function release() { TI.active = false; TI.id = null; TI.m = 0; TI.x = TI.y = 0; setKnob(0, 0); base.style.transform = ""; base.classList.remove("on"); }
  SP.touchRelease = release;
  zone.addEventListener("pointerdown", (e) => {
    if (TI.active) return;
    e.preventDefault();
    try { zone.setPointerCapture(e.pointerId); } catch (_) {}
    TI.active = true; TI.id = e.pointerId;
    const [hx, hy] = baseCentre();                       // floating: the base jumps to the thumb
    base.style.transform = `translate(${e.clientX - hx}px, ${e.clientY - hy}px)`;
    TI.c = [e.clientX, e.clientY]; base.classList.add("on"); moveTo(e.clientX, e.clientY);
  });
  zone.addEventListener("pointermove", (e) => { if (TI.active && e.pointerId === TI.id) { e.preventDefault(); moveTo(e.clientX, e.clientY); } });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => zone.addEventListener(t, (e) => { if (e.pointerId === TI.id) release(); }));
  window.addEventListener("blur", release);
  function tap(el, fn) {
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); el.classList.add("down"); if (SP.actions) fn(); });
    ["pointerup", "pointercancel", "pointerleave"].forEach((t) => el.addEventListener(t, () => el.classList.remove("down")));
    el.addEventListener("click", (e) => e.preventDefault());
  }
  tap($("btn-act"), () => SP.actions.interact());
  tap($("btn-time"), () => SP.actions.time());
  tap($("btn-umb"), () => SP.actions.umbrella());
  tap($("btn-kick"), () => SP.actions.kick());
  tap($("btn-zin"), () => SP.actions.zoom(1));               // pinch-free zoom (pinch is disabled page-wide)
  tap($("btn-zout"), () => SP.actions.zoom(-1));
  root.querySelectorAll("[data-tev]").forEach((b) => tap(b, () => { const v = b.dataset.tev; if (v === "reset") SP.actions.reset(); else if (v === "debug") SP.actions.debug(); else if (v === "weather") SP.actions.weather(); else if (v === "season") SP.actions.season(); else if (v === "nextday") SP.actions.nextDay(); else if (v === "log") SP.actions.log(); else SP.actions.event(v); }));
  if (force !== "1") window.addEventListener("keydown", () => body.classList.add("kbd"), { once: true });
  const act = $("btn-act"), umb = $("btn-umb"), kickB = $("btn-kick");
  (function tick() {
    if (SP.actions) { act.classList.toggle("ready", !!(SP.promptActions && SP.promptActions.use)); kickB.classList.toggle("ready", !!(SP.promptActions && SP.promptActions.kick)); umb.classList.toggle("on", !!(SP.player && SP.player.umbrella)); }
    requestAnimationFrame(tick);
  })();
})(window.SP);
