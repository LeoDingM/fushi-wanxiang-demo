/* 浮世万象 · scene-proto-45 · 云汇CBD — entry / streaming loader for place 'cbd'.
   The only script tag a host page needs. SP.cbd.load() fetches the scene data, the kit manifest and the module files
   (js/cbd/*.js, in order), then the atlases; nothing CBD-related is downloaded before that (streamable place).
   Modules (all extend SP.cbd, share internals through SP.cbd._):
     core.js       constants, helpers, assets, textures, world build, collision, schedule
     world.js      world build (props, buildings, tower parts, lights, walk graph), seasons, collision
     traffic.js    signals, lanes, cars / taxis / BRT
     crowd.js      office workers, lunch crowd, joggers, dog walkers, buskers (walk graph + A*)
     controls.js   camera + free zoom, keyboard / mouse / touch, player, interactions
     render.js     ground tiles (LOD), building / tower part drawing
     lod_skyline.js tower impostors, lit windows, crown light, aviation lights, labels
     lighting.js   sky, lightmap, car lights, fountain / water fx, weather
     compose.js    painter list, prism-order topological sort, occluder fade, frame compositor
     lifecycle.js  update / frame / enter / leave / actions; registers SP.places.cbd for the metro glue
   Already-loaded globals (CBD_SCENE, KIT_CBD_MANIFEST, modules) are not fetched twice. */
(function (SP) {
  "use strict";
  const C = (SP.cbd = SP.cbd || {});
  const me = document.currentScript && document.currentScript.src;
  C.base = C.base || (me ? me.replace(/js\/cbd\.js.*$/, "") : "");
  C.MODULES = ["core", "world", "traffic", "crowd", "controls", "render", "lod_skyline", "lighting", "compose", "lifecycle"];
  function script(src) {
    return new Promise((res, rej) => { const s = document.createElement("script"); s.src = C.base + src; s.async = false; s.onload = res; s.onerror = () => rej(new Error("cbd: failed to load " + src)); document.head.appendChild(s); });
  }
  /** place registry (js/game.js G.use -> SP.places[o.to].enter(o); js/metro.js toCbd -> SP.places.cbd.enter({exit, from})).
      The host (core) owns the screen switch: set SP.cbd.host = { enter(o) } to hide the street, attach the canvas and drive
      SP.cbd.frame(dt); without a host the CBD just loads and enters (preview page drives its own loop). */
  SP.places = SP.places || {};
  SP.places.cbd = SP.places.cbd || { _cbd: true, enter: (o) => { if (C.host && C.host.enter) return C.host.enter(o) || null; C.load().then(() => C.enter(o)); return null; } };
  C.load = function () {
    if (C._loadP) return C._loadP;
    const v = C.version ? "?v=" + C.version : "";
    const jobs = [];
    if (!window.CBD_SCENE) jobs.push(script("cbd_scene.js" + v));
    if (!window.KIT_CBD_MANIFEST) jobs.push(script("kit_cbd/kit_manifest.js" + v));
    C._loadP = Promise.all(jobs)
      .then(() => C.MODULES.reduce((p, m) => p.then(() => (C._mods && C._mods[m] ? null : script("js/cbd/" + m + ".js" + v))), Promise.resolve()))
      .then(() => C._loadAssets());
    return C._loadP;
  };
})(window.SP = window.SP || {});
