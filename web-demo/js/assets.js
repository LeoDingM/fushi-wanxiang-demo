/* Asset loader (plain <img>, works from file:// and http) */
(function (FW) {
  "use strict";
  FW.img = {};
  FW.loadAssets = function (onProgress) {
    const list = [];
    const walk = (obj, prefix) => {
      for (const k in obj) {
        if (typeof obj[k] === "string") list.push([prefix + k, obj[k]]);
        else walk(obj[k], prefix + k + ".");
      }
    };
    walk(FW.ASSETS, "");
    let done = 0;
    return new Promise((resolve) => {
      for (const [key, src] of list) {
        const im = new Image();
        im.onload = im.onerror = () => {
          done++;
          onProgress && onProgress(done, list.length);
          if (done === list.length) resolve();
        };
        im.src = src;
        FW.img[key] = im;
      }
    });
  };
  FW.ok = (im) => !!im && (im instanceof HTMLCanvasElement ? im.width > 0 : im.complete && im.naturalWidth > 0);
  /** derived plates built after loading: clear-night interior = rain-night plate + clear window panes */
  FW.buildDerived = function () {
    const base = FW.img["bg.int_night"], win = FW.img["bg.int_night_clear_win"];
    if (!FW.ok(base)) return;
    const c = document.createElement("canvas");
    c.width = base.naturalWidth; c.height = base.naturalHeight;
    const x = c.getContext("2d");
    x.drawImage(base, 0, 0);
    if (FW.ok(win)) { const [px, py] = FW.SCENES.interior.windowPatch; x.drawImage(win, px, py); }
    FW.img["bg.int_night_clear"] = c;
  };
})(window.FW);
