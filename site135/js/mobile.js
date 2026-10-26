/* scene-proto-45 · phone / touch play (ported from web-demo/js/mobile.js):
   - full-screen canvas in portrait and landscape (backing store = CSS px, pixel-art upscale by the browser), camera
     follows 李默 (portrait: he sits a bit above centre so the thumbs don't cover him)
   - floating analog joystick (left half): its SCREEN direction is mapped to a world vector exactly like WASD
     (SP.screenToWorldDir), so pushing up walks up the screen
   - 互动 button (E, pulses when something is in reach), 时间 (T), 伞 (U), event buttons 破窗/起火/撞车, 重置, 调试
   - two-finger pinch = GAME zoom around the pinch point (+ two-finger drag pans, ⌖ recenters); no page scroll /
     page pinch / double-tap zoom. Desktop keyboard play is unchanged (controls only on touch devices,
     or with ?touch=1; ?touch=0 hides them). */
(function (SP) {
  "use strict";
  const Q = new URLSearchParams(location.search), body = document.body, force = Q.get("touch");
  const hasTouch = (navigator.maxTouchPoints || 0) > 0 || "ontouchstart" in window || (window.matchMedia && matchMedia("(pointer: coarse)").matches);
  // Site95: a PC with a touch screen (Windows touch laptop: maxTouchPoints > 0 and ontouchstart, but a fine hover pointer)
  // is a keyboard + mouse PC — it used to get the phone layout, which disabled the PC HUD and hid every key prompt.
  const mq = (q) => !!(window.matchMedia && matchMedia(q).matches);
  const finePointer = mq("(any-pointer: fine)") && mq("(any-hover: hover)");
  const touch = force === "1" || (force !== "0" && hasTouch && !finePointer);
  SP.isTouch = touch;
  SP.pixelRatioCap = 2;   // phone-map backing store; the game canvas stays CSS pixels (see layout())
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
      // PC HUD (js/hud.js): the canvas fills the whole window and the HUD overlays it. The backing store keeps the
      // desktop height (720 logical px) and only widens/narrows with the window aspect, so world scale and pixel
      // cost stay those of the 1280x720 desktop view. ?shot=1, ?w= / ?h= and ?hud=0 keep the classic fixed canvas.
      if (!body.classList.contains("shot") && !Q.get("w") && !Q.get("h") && Q.get("hud") !== "0") {
        const bw = Math.max(480, Math.min(2560, Math.round(DESK[1] * vw / Math.max(1, vh))));
        Object.assign(wrap.style, { position: "fixed", left: "0px", top: "0px", width: "100vw", height: "100vh", overflow: "hidden" });
        Object.assign(canvas.style, { width: "100vw", height: "100vh" });
        if (canvas.width !== bw || canvas.height !== DESK[1]) { canvas.width = bw; canvas.height = DESK[1]; }
        body.classList.add("hud-fill");
      } else { body.classList.remove("hud-fill"); if (canvas.width !== DESK[0] || canvas.height !== DESK[1]) { canvas.width = DESK[0]; canvas.height = DESK[1]; } }
      SP.camOffsetY = 0; if (SP.cam) SP.cam.zoom = SP.userZoom || +(Q.get("zoom") || SP.defaultZoom || 0.5);
      return;
    }
    body.classList.remove("hud-fill");
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
  const editing = (el) => !!el?.closest?.('#life-phone, #amenu, input, textarea, select, [contenteditable="true"]');
  document.addEventListener("touchmove", (e) => { if (!SP.metroActive && !editing(e.target)) e.preventDefault(); }, { passive: false });
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("dblclick", (e) => { if (!SP.metroActive) e.preventDefault(); });
  document.addEventListener("contextmenu", (e) => { if (touch) e.preventDefault(); });
  let lastTouchEnd = 0;
  document.addEventListener("touchend", (e) => { if (SP.metroActive) return; const now = Date.now(); if (now - lastTouchEnd < 320 && !e.target.closest("button")) e.preventDefault(); lastTouchEnd = now; }, { passive: false });

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
    '<button type="button" id="btn-run" class="tbtn" aria-label="跑步开关">跑</button>' +
    '<button type="button" id="btn-cycle" class="tbtn small" aria-label="选择附近对象" style="display:none">☷<i>选择</i></button>' +
    '<div id="zoombar"><button type="button" id="btn-zin" class="zbtn" aria-label="放大">＋</button><button type="button" id="btn-zout" class="zbtn" aria-label="缩小">－</button><button type="button" id="btn-zc" class="zbtn" aria-label="回到李默">⌖</button></div>' +
    '<div id="evbar"><button type="button" class="ebtn" id="ev-tog" aria-label="调试菜单">☰</button>' +
    '<button type="button" class="ebtn" data-tev="broken_window">破窗</button><button type="button" class="ebtn" data-tev="fire">起火</button>' +
    '<button type="button" class="ebtn" data-tev="crash">撞车</button><button type="button" class="ebtn" data-tev="reset">重置</button>' +
    '<button type="button" class="ebtn" data-tev="weather">天气</button><button type="button" class="ebtn" data-tev="season">季节</button>' +
    '<button type="button" class="ebtn" data-tev="log">日志</button><button type="button" class="ebtn" data-tev="debug">调试</button></div>';
  body.appendChild(root);
  const mobileStyle = document.createElement('style');
  mobileStyle.textContent = `
    body.mobile #joy-base{width:116px;height:116px;left:16px;bottom:22px}
    body.mobile #btn-act{width:76px;height:76px;right:18px;bottom:24px}
    body.mobile #btn-run{width:48px;height:48px;right:110px;bottom:22px}
    body.mobile #btn-kick{width:48px;height:48px;right:110px;bottom:82px}
    body.mobile #btn-time{width:44px;height:44px;right:170px;bottom:24px}
    body.mobile #btn-umb{width:44px;height:44px;right:30px;bottom:118px}
    body.mobile #btn-cycle{width:44px;height:44px;right:112px;bottom:142px}
    body.mobile.phone-open #touch{visibility:hidden}
    body.mobile.phone-open #phone-launch-mobile{display:none!important}
    body.mobile.external-scene #phone-launch-mobile{display:none!important}
    body.touch #amenu:not(.hidden){position:fixed;z-index:140;top:calc(64px + env(safe-area-inset-top,0px));bottom:calc(174px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);width:min(360px,calc(100vw - 28px));min-width:0;max-height:none;overflow:auto;overscroll-behavior:contain;touch-action:none;box-sizing:border-box}
    body.touch #amenu button{min-height:44px;flex-shrink:0}
    body.touch.landscape #amenu:not(.hidden){top:50px;bottom:84px;width:min(440px,calc(100vw - 260px))}
    #phone-app-main{touch-action:pan-y}
    #life-phone input,#life-phone textarea{touch-action:auto;user-select:text;-webkit-user-select:text;font-size:16px}
  `;
  document.head.appendChild(mobileStyle);
  // Menus inside the fixed game wrapper cannot rise over sibling touch controls.
  // Use one body-level menu and delay activation until finger-up so swipes scroll.
  const actionMenu=document.getElementById('amenu');let menuDrag=null,menuTap=null;
  if(actionMenu){
    actionMenu.addEventListener('pointerdown',e=>{
      if(e.pointerType!=='touch')return;e.stopImmediatePropagation();menuTap=null;
      const b=e.target.closest('button'),scrollNode=actionMenu.querySelector('.modern-menu-options')||actionMenu;menuDrag={id:e.pointerId,x:e.clientX,y:e.clientY,scrollNode,menu:SP.game.menu,scroll:scrollNode.scrollTop,index:b&&!b.disabled?b.dataset.i:null,moved:false};
      actionMenu.setPointerCapture(e.pointerId);SP.touchRelease?.();
    },true);
    actionMenu.addEventListener('pointermove',e=>{if(!menuDrag||e.pointerId!==menuDrag.id)return;e.preventDefault();e.stopImmediatePropagation();if(Math.hypot(e.clientX-menuDrag.x,e.clientY-menuDrag.y)>8)menuDrag.moved=true;menuDrag.scrollNode.scrollTop=menuDrag.scroll+menuDrag.y-e.clientY;},true);
    actionMenu.addEventListener('pointerup',e=>{if(!menuDrag||e.pointerId!==menuDrag.id)return;e.stopImmediatePropagation();const d=menuDrag;menuDrag=null;menuTap={index:d.index,moved:d.moved,menu:d.menu,at:Date.now()};},true);
    actionMenu.addEventListener('pointercancel',()=>{menuDrag=null;menuTap=null;},true);
    actionMenu.addEventListener('click',e=>{const d=menuTap;menuTap=null;if(!d||Date.now()-d.at>1000)return;e.preventDefault();e.stopImmediatePropagation();if(!d.moved&&d.index!=null&&d.menu===SP.game.menu)SP.game.pick(d.index==='x'?-1:+d.index);},true);
    SP.mobileMenuManaged=true;
  }
  // ---------- two-finger pinch zoom (page zoom stays disabled; the GAME zooms around the pinch point) ----------
  const PZ = (SP.pinch = { on: false, d: 0, mx: 0, my: 0 });
  const free = (t) => !(t.target && t.target.closest && t.target.closest("button")) && !editing(t.target);
  const pts = (e) => [...e.touches].filter(free);
  function pinchState(T) { const a = T[0], b = T[1]; return [Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), (a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2]; }
  const cs = () => canvas.width / Math.max(1, canvas.getBoundingClientRect().width);
  document.addEventListener("touchstart", (e) => {
    if (SP.metroActive || SP.phone?.isOpen()) return;
    const T = pts(e); if (T.length < 2) return;
    if (SP.touchRelease) SP.touchRelease();
    const [d, mx, my] = pinchState(T); Object.assign(PZ, { on: true, d, mx, my });
  }, { passive: true });
  document.addEventListener("touchmove", (e) => {
    if (!PZ.on || SP.metroActive || SP.phone?.isOpen()) return; const T = pts(e); if (T.length < 2) return;
    const [d, mx, my] = pinchState(T), k = cs(), r = canvas.getBoundingClientRect();
    if (SP.panBy) SP.panBy(-(mx - PZ.mx) * k, -(my - PZ.my) * k);            // two-finger drag pans
    if (PZ.d > 4 && SP.zoomBy) SP.zoomBy(d / PZ.d, (mx - r.left) * k, (my - r.top) * k, true);
    Object.assign(PZ, { d, mx, my });
  }, { passive: true });
  const pinchEnd = (e) => { if (PZ.on && pts(e).length < 2) { PZ.on = false; if (SP.zoomEnd) SP.zoomEnd(); } };
  document.addEventListener("touchend", pinchEnd, { passive: true }); document.addEventListener("touchcancel", pinchEnd, { passive: true });
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
    if (TI.active || PZ.on || SP.metroActive || SP.phone?.isOpen()) return;
    e.preventDefault();
    try { zone.setPointerCapture(e.pointerId); } catch (_) {}
    TI.active = true; TI.id = e.pointerId;
    const [hx, hy] = baseCentre();                       // floating: the base jumps to the thumb
    base.style.transform = `translate(${e.clientX - hx}px, ${e.clientY - hy}px)`;
    TI.c = [e.clientX, e.clientY]; base.classList.add("on"); moveTo(e.clientX, e.clientY);
  });
  zone.addEventListener("pointermove", (e) => { if (PZ.on) return; if (TI.active && e.pointerId === TI.id) { e.preventDefault(); moveTo(e.clientX, e.clientY); } });
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
  tap($("btn-run"), () => { SP.runToggle = !SP.runToggle; });
  tap($("btn-cycle"), () => SP.cycleTarget && SP.cycleTarget());
  tap($("btn-zin"), () => SP.actions.zoom(1));               // + / - step through the zoom presets
  tap($("btn-zout"), () => SP.actions.zoom(-1));
  tap($("btn-zc"), () => SP.actions.recenter());
  const evbar = root.querySelector("#evbar"), evtog = root.querySelector("#ev-tog");
  tap(evtog, () => { evbar.classList.toggle("open"); evtog.textContent = evbar.classList.contains("open") ? "✕" : "☰"; });
  root.querySelectorAll("[data-tev]").forEach((b) => tap(b, () => { const v = b.dataset.tev; if (v === "reset") SP.actions.reset(); else if (v === "debug") SP.actions.debug(); else if (v === "weather") SP.actions.weather(); else if (v === "season") SP.actions.season(); else if (v === "nextday") SP.actions.nextDay(); else if (v === "log") SP.actions.log(); else SP.actions.event(v); }));
  if (force !== "1") window.addEventListener("keydown", () => body.classList.add("kbd"), { once: true });
  const act = $("btn-act"), umb = $("btn-umb"), kickB = $("btn-kick"), runB = $("btn-run");
  (function tick() {
    if(actionMenu&&!actionMenu.classList.contains('hidden')&&actionMenu.parentNode!==body)body.appendChild(actionMenu);
    body.classList.toggle('phone-open',!!SP.phone?.isOpen());
    body.classList.toggle('external-scene',!!(SP.metroActive || SP.cbd?.active));
    if (SP.actions) { act.classList.toggle("ready", !!(SP.promptActions && SP.promptActions.use)); kickB.classList.toggle("ready", !!(SP.promptActions && SP.promptActions.kick)); umb.classList.toggle("on", !!(SP.player && SP.player.umbrella)); runB.classList.toggle("on", !!SP.runToggle); }
    requestAnimationFrame(tick);
  })();
})(window.SP);
