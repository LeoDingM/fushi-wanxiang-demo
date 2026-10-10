/* scene-proto-45 · CBD placeholder (core). Until the CBD module registers SP.places.cbd for real, arriving at a 中央商务区站
   exit shows a graceful 「中央商务区 · 即将开放」 card above the metro canvas and puts 李默 back at that exit inside the metro
   (cbd_street), so he can walk down and ride home. The CBD module simply replaces SP.places.cbd (this stub is flagged _stub). */
(function () {
  if (!window.SP) return;
  SP.places = SP.places || {};
  if (SP.places.cbd && !SP.places.cbd._stub) return;
  function card(exit) {
    let el = document.getElementById("cbd-soon");
    if (!el) {
      el = document.createElement("div"); el.id = "cbd-soon";
      el.style.cssText = "position:fixed;left:50%;top:38%;transform:translate(-50%,-50%);z-index:60;background:rgba(14,18,28,.92);color:#eef2f8;" +
        "padding:16px 22px;border-radius:12px;border:1px solid #e07f2d;text-align:center;font:15px/1.6 sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.5);pointer-events:none;transition:opacity .4s";
      document.body.appendChild(el);
    }
    el.innerHTML = `<div style="font-size:19px;font-weight:bold;letter-spacing:2px">中央商务区 · 即将开放</div>` +
      `<div style="color:#c8d0e0;font-size:13px">${exit} 出口外的街区还在施工，可原路返回站内乘车回井槐里</div>`;
    el.style.opacity = "1"; clearTimeout(card.t); card.t = setTimeout(() => (el.style.opacity = "0"), 3600);
  }
  SP.places.cbd = {
    _stub: true,
    enter(o) {
      const L = (o && o.exit) || "A";
      card(L);
      if (SP.world && SP.world.logEvent) SP.world.logEvent("中央商务区 · 即将开放（" + L + " 出口）");
      if (SP.places.metro_cbd) setTimeout(() => SP.places.metro_cbd.enter({ link: L }), 0);   // back at that exit, inside the station area
      return null;
    },
  };
})();
