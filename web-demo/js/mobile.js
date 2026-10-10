/* Mobile / touch play: fit-to-screen layout, virtual analog joystick, 互动 (E) / 时间 (T) / 天气 (R) buttons.
   Touch controls show on touch devices (pointer: coarse / maxTouchPoints) or with ?touch=1 (?touch=0 hides).
   Keyboard play is untouched: the joystick only feeds FW.touchInput, read by game.js when no key is held. */
(function (FW) {
  "use strict";
  const params = new URLSearchParams(location.search);
  const body = document.body;
  const force = params.get("touch");
  const hasTouch = (navigator.maxTouchPoints || 0) > 0 || "ontouchstart" in window ||
    (window.matchMedia && matchMedia("(pointer: coarse)").matches);
  const touch = force === "1" || (force !== "0" && hasTouch);
  FW.isTouch = touch;
  const TI = (FW.touchInput = { x: 0, y: 0, m: 0, active: false, id: null });
  const D = () => window.__fushiDemo;
  const $ = (id) => document.getElementById(id);

  // ---------- layout: canvas fits the screen at 16:9 in portrait and landscape ----------
  const wrap = $("stage-wrap");
  const canvas = $("game");
  /** backing-store size of the game canvas (screen px). Desktop / landscape: the 1280x720 plate. */
  function setCanvas(cw, ch) {
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
  }
  let portraitDpr = 1;
  function layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const mobile = touch || vw < 760 || vh < 520;
    body.classList.toggle("mobile", mobile);
    body.classList.toggle("touch", touch);
    const stats = document.querySelector(".hud-stats"), dock = $("dock");
    if (!mobile) {
      ["position", "left", "top", "width", "height"].forEach((k) => (wrap.style[k] = ""));
      body.classList.remove("portrait", "landscape");
      if (stats && stats.parentNode !== $("hud")) $("hud").appendChild(stats);
      if (dock) dock.classList.add("hidden");
      setCanvas(FW.W, FW.H);
      return;
    }
    const portrait = vh > vw * 1.1;
    body.classList.toggle("portrait", portrait);
    body.classList.toggle("landscape", !portrait);
    // stats live in the dock below the canvas in portrait, on the canvas HUD otherwise
    if (portrait && stats && dock && stats.parentNode !== $("dock-stats")) $("dock-stats").appendChild(stats);
    if (!portrait && stats && stats.parentNode !== $("hud")) $("hud").appendChild(stats);
    if (dock) dock.classList.toggle("hidden", !portrait);
    let w, h, x, y;
    if (portrait) {
      // tall viewport: full width, from under the HUD row down to the dock; the dock sits above the touch controls.
      // The canvas backing store matches the CSS box x DPR (sharp, no CSS rescale); the camera crops a taller
      // window of the plate around Li Mo (game.js updateCam).
      const hud = $("hud");
      const top = 36 + (hud ? hud.offsetHeight : 40) + 6;
      const controls = touch ? 208 : 24;                  // joystick / 互动 band at the bottom
      const dockH = dock ? dock.offsetHeight || 112 : 0;
      w = vw;
      h = Math.max(Math.round(vw * 9 / 16), vh - top - controls - dockH - 14);
      h = Math.min(h, Math.round(vw * 1.6));              // very tall phones: don't go beyond ~10:16
      x = 0; y = top;
      portraitDpr = Math.min(2, window.devicePixelRatio || 1);
      document.documentElement.style.setProperty("--dock-top", y + h + 8 + "px");
    } else {
      h = vh; w = Math.round(h * 16 / 9);
      if (w > vw) { w = vw; h = Math.round(w * 9 / 16); }
      x = Math.round((vw - w) / 2); y = Math.round((vh - h) / 2);
      setCanvas(FW.W, FW.H);
    }
    Object.assign(wrap.style, { position: "fixed", left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
    // portrait: backing store = the canvas' CSS box (inside the borders) x DPR -> 1:1 device pixels, sharp
    if (portrait) setCanvas(Math.round(canvas.clientWidth * portraitDpr), Math.round(canvas.clientHeight * portraitDpr));
    document.documentElement.style.setProperty("--stage-bottom", y + h + "px");
    document.documentElement.style.setProperty("--stage-top", y + "px");
    document.documentElement.style.setProperty("--vh", vh + "px");
    window.scrollTo(0, 0);
  }
  FW.layout = layout;
  layout();
  window.addEventListener("resize", layout);
  window.addEventListener("orientationchange", () => setTimeout(layout, 120));
  if (window.visualViewport) visualViewport.addEventListener("resize", layout);
  setTimeout(layout, 0); // after fonts/HUD sizes settle

  // ---------- no page scroll / pinch / double-tap zoom ----------
  const scrollable = (el) => el && el.closest && el.closest(".panel");
  document.addEventListener("touchmove", (e) => { if (!scrollable(e.target) || e.touches.length > 1) e.preventDefault(); }, { passive: false });
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("dblclick", (e) => e.preventDefault());
  document.addEventListener("contextmenu", (e) => { if (touch) e.preventDefault(); });
  let lastTouchEnd = 0;
  document.addEventListener("touchend", (e) => {
    const now = Date.now();
    if (now - lastTouchEnd < 320 && !e.target.closest("button")) e.preventDefault(); // iOS double-tap zoom
    lastTouchEnd = now;
  }, { passive: false });

  if (!touch) return;

  // ---------- controls DOM ----------
  const root = document.createElement("div");
  root.id = "touch";
  root.innerHTML =
    '<div id="joy-zone"><div id="joy-base"><div id="joy-knob"></div></div></div>' +
    '<button type="button" id="btn-act" class="tbtn">互动</button>' +
    '<button type="button" id="btn-time" class="tbtn small" aria-label="切换时段">⏩<i>时间</i></button>' +
    '<button type="button" id="btn-wx" class="tbtn small" aria-label="切换天气">☂<i>天气</i></button>';
  body.appendChild(root);
  const zone = $("joy-zone"), base = $("joy-base"), knob = $("joy-knob");
  const R = 52;           // knob travel (css px)
  const DEAD = 0.18;
  function baseCentre() { const r = base.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  function setKnob(dx, dy) { knob.style.transform = `translate(${dx}px, ${dy}px)`; }
  function moveTo(cx, cy) {
    const [bx, by] = TI.c;
    let dx = cx - bx, dy = cy - by;
    const d = Math.hypot(dx, dy);
    if (d > R) { dx *= R / d; dy *= R / d; }
    setKnob(dx, dy);
    const m = Math.min(1, d / R);
    TI.m = m < DEAD ? 0 : (m - DEAD) / (1 - DEAD);
    TI.x = d > 0 ? dx / Math.min(d, R) : 0; TI.y = d > 0 ? dy / Math.min(d, R) : 0; // unit direction
  }
  function release() {
    TI.active = false; TI.id = null; TI.m = 0; TI.x = TI.y = 0;
    setKnob(0, 0); base.style.transform = ""; base.classList.remove("on");
  }
  zone.addEventListener("pointerdown", (e) => {
    if (TI.active) return;
    e.preventDefault();
    try { zone.setPointerCapture(e.pointerId); } catch (_) {}
    TI.active = true; TI.id = e.pointerId;
    // floating joystick: the base jumps to the thumb (within the zone), springs back on release
    const [hx, hy] = baseCentre();
    base.style.transform = `translate(${e.clientX - hx}px, ${e.clientY - hy}px)`;
    TI.c = [e.clientX, e.clientY];
    base.classList.add("on");
    moveTo(e.clientX, e.clientY);
  });
  zone.addEventListener("pointermove", (e) => { if (TI.active && e.pointerId === TI.id) { e.preventDefault(); moveTo(e.clientX, e.clientY); } });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) =>
    zone.addEventListener(t, (e) => { if (e.pointerId === TI.id) release(); }));
  window.addEventListener("blur", release);

  function tapBtn(id, fn) {
    const b = $(id);
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault(); e.stopPropagation();
      b.classList.add("down");
      if (D() && window.__fushiReady) fn();
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach((t) => b.addEventListener(t, () => b.classList.remove("down")));
    b.addEventListener("click", (e) => e.preventDefault());
  }
  tapBtn("btn-act", () => D().pressE());
  tapBtn("btn-time", () => D().cycleTime());
  tapBtn("btn-wx", () => D().toggleWeather());

  // panel buttons: drop keyboard hints
  const lbl = { "order-ok": "来一份", "order-cancel": "算了", "lease-close": "关闭" };
  for (const k in lbl) if ($(k)) $(k).textContent = lbl[k];

  // keyboard on a touch laptop: hide the on-screen controls (unless forced with ?touch=1)
  if (force !== "1") window.addEventListener("keydown", () => body.classList.add("kbd"), { once: true });

  // highlight 互动 when something is in reach
  const act = $("btn-act");
  (function tick() {
    const d = D();
    if (d) {
      act.classList.toggle("ready", !!(d.state.near || d.state.panel === "order"));
      const open = !!d.state.panel;
      if (open !== body.classList.contains("panel-open")) { body.classList.toggle("panel-open", open); if (open) release(); }
    }
    requestAnimationFrame(tick);
  })();
})(window.FW);
