/* 浮世万象 · scene-proto-45 · 24便利店 kit loader (kit_store/, st_* pieces). Zero-change integration with the core's 2-atlas
   renderer: load AFTER kit_int/kit_manifest.js + kit_store/kit_manifest.js and BEFORE js/core.js. It appends the store frames
   to the interior manifest (y shifted below the interior atlas), and SP.storeKit.compose() — called once the assets are loaded
   (js/store.js wraps SP.load for that) — stacks kit_store/kit_atlas.png under kit_int/kit_atlas.png (same for the emit atlas)
   into one canvas each, so every st_* frame draws through the existing int_atlas / int_emit path.
   (A core that grows a 3rd atlas slot can instead map f[6] = 2 -> SP.img.store_atlas and skip compose().) */
(function () {
  "use strict";
  const KI = window.KIT_INT_MANIFEST, KS = window.KIT_STORE_MANIFEST;
  const SK = (window.STORE_KIT = { ok: false, off: 0, keys: [] });
  if (!KI || !KS) { console.warn("store_kit: kit_int or kit_store manifest missing"); return; }
  const off = KI.atlas_size[1] + 2;
  for (const [k, f] of Object.entries(KS.frames)) {
    if (!k.startsWith("st_")) continue;                      // the store atlas also carries the shared fx frames: skip them
    KI.frames[k] = [f[0], f[1] + off].concat(f.slice(2, 6)); SK.keys.push(k);
  }
  for (const [k, v] of Object.entries(KS.pieces)) if (k.startsWith("st_")) KI.pieces[k] = v;
  for (const [k, v] of Object.entries(KS.masks || {})) if (k.startsWith("st_")) (KI.masks = KI.masks || {})[k] = v;
  KI.emit = (KI.emit || []).concat((KS.emit || []).filter((k) => k.startsWith("st_")));
  SK.ok = true; SK.off = off; SK.size = [Math.max(KI.atlas_size[0], KS.atlas_size[0]), off + KS.atlas_size[1]];
  SK.base = (document.currentScript && document.currentScript.src || "").replace(/js\/store_kit\.js.*$/, "");
  /** stack the store atlas (and emit atlas) under the interior ones; resolves when done */
  SK.compose = function (SP) {
    if (!SK.ok || SK.done) return Promise.resolve();
    const load = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => { console.error("store_kit: missing", src); res(null); }; im.src = src; });
    return Promise.all([load(SK.base + "kit_store/kit_atlas.png"), load(SK.base + "kit_store/kit_emit.png")]).then(([A, E]) => {
      const stack = (top, bot) => {
        if (!top || !bot) return top;
        const c = document.createElement("canvas"); c.width = SK.size[0]; c.height = SK.size[1];
        const x = c.getContext("2d"); x.drawImage(top, 0, 0); x.drawImage(bot, 0, off); c.naturalWidth = c.width; c.naturalHeight = c.height; return c;
      };
      SP.img.int_atlas = stack(SP.img.int_atlas, A); SP.img.int_emit = stack(SP.img.int_emit, E); SK.done = true;
    });
  };
})();
