// Inlined by prepare.py (not bundled): shows a percentage + MB progress bar while the game bundle streams in.
(function () {
  var B = window.__BOOT, bar = document.getElementById("boot-bar"), st = document.getElementById("boot-status"), MB = 1048576;
  if (st) st.classList.add("big");
  window.__bootBar = function (f, got, all, label) {
    f = Math.max(0, Math.min(1, f || 0));
    if (bar && bar.firstChild) bar.firstChild.style.width = (f * 100).toFixed(1) + "%";
    if (st && !st.classList.contains("done")) st.textContent = "正在载入 " + Math.round(f * 100) + "%" + (all ? " · " + (got / MB).toFixed(1) + " / " + (all / MB).toFixed(1) + " MB" : "") + (label ? " · " + label : "");
  };
  var all = B.jsBytes + B.bootImg, run = function (text) {
    var s = document.createElement("script");
    if (text == null) { s.src = B.js; document.body.appendChild(s); return; }
    // the bundle was written to run while the page is still parsing (modules defer to DOMContentLoaded): replay that order
    var late = document.readyState !== "loading";
    if (late) Object.defineProperty(document, "readyState", { configurable: true, get: function () { return "loading"; } });
    s.textContent = text; document.body.appendChild(s);
    if (late) { delete document.readyState; document.dispatchEvent(new Event("DOMContentLoaded")); }
  };
  window.__bootBar(0, 0, all, "程序");
  if (!window.fetch || !window.TextDecoder) return run(null);
  fetch(B.js).then(function (r) {
    if (!r.ok || !r.body || !r.body.getReader) return r.text();
    var rd = r.body.getReader(), parts = [], got = 0;
    return (function pump() { return rd.read().then(function (x) {
      if (x.done) { var u = new Uint8Array(got), o = 0; parts.forEach(function (p) { u.set(p, o); o += p.length; }); return new TextDecoder().decode(u); }
      parts.push(x.value); got += x.value.length; window.__bootBar(got / all, got, all, "程序"); return pump(); }); })();
  }).then(run, function () { run(null); });
})();
