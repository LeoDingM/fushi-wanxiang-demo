/* DOM HUD / prompt / toast / panels */
(function (FW) {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const UI = (FW.UI = {});
  let toastT = 0;
  UI.el = {};
  UI.init = function () {
    ["loc", "clock", "phase", "stamina", "mood", "hunger", "money", "prompt", "toast", "lease-panel",
     "lease-close", "order-panel", "order-ok", "order-cancel", "order-title", "fade", "fade-caption", "weather"].forEach((k) => (UI.el[k] = $(k)));
    UI.el.qstatus = $("q-status");
    UI.el.qitems = Array.from(document.querySelectorAll("#q-list li"));
  };
  UI.hud = function (st) {
    const e = UI.el;
    e.clock.textContent = FW.fmtClock(st.time);
    e.phase.textContent = FW.phaseName(st.time);
    const w = FW.extWeights(st.time);
    const wx = w.rain > 0.5 ? "🌧 小雨" : w.dark > 0.5 ? "🌙 晴" : w.dusk > 0.5 ? (st.weather === "rain" ? "🌇 转阴" : "🌇 晴") : st.weather === "rain" ? "⛅ 夜有雨" : "☀ 晴 18°C";
    if (e.weather.textContent !== wx) e.weather.textContent = wx;
    e.stamina.textContent = Math.round(st.stamina);
    e.mood.textContent = Math.round(st.mood);
    e.hunger.textContent = Math.round(st.hunger);
    e.money.textContent = "¥" + st.money;
    e.loc.textContent = FW.SCENES[st.scene].name;
    // portrait dock: status line + today's list (cheap: only touches the DOM when something changed)
    const night = FW.nightFactor(st.time) > 0.6;
    const status = st.hunger < 30 ? ["有点饿了", 1] : st.stamina < 25 ? ["困得睁不开眼", 1] : st.mood < 30 ? ["心情低落", 1]
      : night ? ["夜深了，该睡了", 0] : st.stamina > 70 && st.mood > 55 ? ["精神不错", 0] : ["精神还行", 0];
    const key = status[0] + JSON.stringify(st.quest);
    if (UI._dockKey !== key && e.qstatus) {
      UI._dockKey = key;
      e.qstatus.textContent = status[0];
      e.qstatus.classList.toggle("warn", !!status[1]);
      let next = true;
      e.qitems.forEach((li) => {
        const done = !!st.quest[li.dataset.q];
        li.classList.toggle("done", done);
        li.classList.toggle("next", !done && next);
        if (!done) next = false;
      });
    }
  };
  UI.prompt = function (text, x, y) {
    const p = UI.el.prompt;
    if (!text) { p.classList.add("hidden"); return; }
    if (x != null) { // anchor above the player's head (canvas px -> %)
      const cv = document.getElementById("game");
      p.style.left = (x / cv.width) * 100 + "%";
      p.style.top = `max(2px, calc(${((y / cv.height) * 100).toFixed(2)}% - 14px))`;
    }
    if (FW.isTouch) text = text.replace(/^按 ?E ?/, "点「互动」");
    if (p.textContent !== text) p.textContent = text;
    p.classList.remove("hidden");
  };
  UI.toast = function (text, ms) {
    UI.el.toast.textContent = text;
    UI.el.toast.classList.remove("hidden");
    toastT = ms || 2400;
  };
  UI.tick = function (dt) {
    if (toastT > 0 && (toastT -= dt * 1000) <= 0) UI.el.toast.classList.add("hidden");
  };
  UI.show = (id, on) => UI.el[id].classList.toggle("hidden", !on);
  UI.fade = function (alpha, caption) {
    UI.el.fade.style.opacity = alpha;
    UI.el.fade.style.display = alpha > 0.001 ? "flex" : "none";
    if (caption != null) UI.el["fade-caption"].textContent = caption;
  };
})(window.FW);
