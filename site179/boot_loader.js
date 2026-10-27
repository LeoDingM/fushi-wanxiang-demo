// Inlined by prepare.py (not bundled): byte-accurate bar while the critical bundle streams in.
// First-frame kits start only after those bytes are in, so they share the pipe with JS parse, not with the JS download.
(function () {
  var B = window.__BOOT, bar = document.getElementById("boot-bar"), st = document.getElementById("boot-status"), MB = 1048576;
  if (st) st.classList.add("big");
  var ledger = { js: 0, img: {} };
  function paint(label) {
    var got = ledger.js, k, all = (B.jsBytes || 0) + (B.bootImg || 0);
    for (k in ledger.img) got += ledger.img[k];
    var f = all ? Math.max(0, Math.min(1, got / all)) : 0;
    if (bar && bar.firstChild) bar.firstChild.style.width = (f * 100).toFixed(1) + "%";
    if (st && !st.classList.contains("done")) st.textContent = "正在载入 " + Math.round(f * 100) + "%" + (all ? " · " + (got / MB).toFixed(1) + " / " + (all / MB).toFixed(1) + " MB" : "") + (label ? " · " + label : "");
  }
  window.__bootBar = function (f, got, all, label) {
    if (typeof got === "number" && all) { ledger.js = Math.min(got, B.jsBytes || got); paint(label || "程序"); return; }
    paint(label || "");
  };
  window.__bootAccount = function (kind, key, bytes) {
    if (kind === "js") ledger.js = bytes || 0;
    else if (key) ledger.img[key] = bytes || 0;
    paint(kind === "js" ? "程序" : "贴图");
  };
  var run = function (text) {
    var s = document.createElement("script");
    if (text == null) { s.src = B.js; document.body.appendChild(s); return; }
    var late = document.readyState !== "loading";
    if (late) Object.defineProperty(document, "readyState", { configurable: true, get: function () { return "loading"; } });
    s.textContent = text; document.body.appendChild(s);
    if (late) { delete document.readyState; document.dispatchEvent(new Event("DOMContentLoaded")); }
  };
  function startKits() {
    B.images = B.images || {};
    B.pending = B.pending || {};
    var kits = B.kits || [["atlas", "kit/kit_atlas.png"], ["emit", "kit/kit_emit.png"], ["actor_li_mo", "img/actors/li_mo.png"]];
    for (var i = 0; i < kits.length; i++) {
      (function (src) {
        if (!src || B.images[src]) return;
        var im = new Image();
        B.images[src] = im;
        B.pending[src] = 1;
        im.onload = function () {
          B.pending[src] = 0;
          window.__bootAccount("img", src, (B.img && B.img[src]) || 0);
        };
        im.onerror = function () { B.pending[src] = 0; im._bootErr = 1; };
        im.src = src;
      })(kits[i][1]);
    }
  }
  window.__bootAccount("js", "js", 0);
  if (!window.fetch || !window.TextDecoder) return run(null);
  fetch(B.js).then(function (r) {
    if (!r.ok || !r.body || !r.body.getReader) return r.text();
    var rd = r.body.getReader(), parts = [], got = 0;
    return (function pump() { return rd.read().then(function (x) {
      if (x.done) { var u = new Uint8Array(got), o = 0; parts.forEach(function (p) { u.set(p, o); o += p.length; }); window.__bootAccount("js", "js", got); return new TextDecoder().decode(u); }
      parts.push(x.value); got += x.value.length; window.__bootAccount("js", "js", got); return pump(); }); })();
  }).then(function (text) { startKits(); run(text); }, function () { run(null); });
})();
