/* 云汇CBD · lifecycle: update / frame / enter / leave, actions (same names as SP.actions so js/mobile.js buttons work),
   (SP.places.cbd is registered by the entry js/cbd.js). */
(function (SP) {
  "use strict";
  const C = SP.cbd, X = C._; if (!X) return; C._mods.lifecycle = true;
  const { D, NPC, cam, tiles, IMP, TEX, patCache } = X;
  C.update = function (dt) {
    dt = Math.min(dt, 0.1); C.dt = dt; C.t = (C.t || 0) + dt;
    if (SP.clock && !C.externalClock) SP.clock.update(dt);
    const steps = Math.max(1, Math.ceil(dt / (1 / 60) - 1e-6));
    for (let i = 0; i < steps; i++) { const h = dt / steps; X.playerStep(h); X.trafficStep(h); X.npcStep(h); }
    X.npcSpawnStep(dt); X.fxStep(dt); X.updateCam(dt);
  };
  C.frame = function (dt) {
    if (!C.ready || !C.active) return;
    const t0 = performance.now(); C.update(dt); const t1 = performance.now(); X.render(); const t2 = performance.now();
    Object.assign(C.stats, { upd: t1 - t0, ren: t2 - t1, npcs: NPC.list.length, cars: X.TR.cars.length, zoom: cam.zoom });
  };
  /** enter(spawn): spawn = exit letter "A".."D" | {exit: "B", from} (metro glue) | [x, y, dir] | null (default spawn) */
  C.enter = function (spawn) {
    if (!C.player) C.player = new SP.Actor({ id: "limo", set: "li_mo", isPlayer: true, radius: 0.22, speed: 1.7, height: 1.85 });
    const P = C.player; P.z = 0; P.carry = null; P.hidden = false; P.vehicle = false;
    if (spawn && typeof spawn === "object" && !Array.isArray(spawn)) spawn = spawn.exit || spawn.link || null;
    let sp = spawn, label = "出生点";
    if (typeof spawn === "string") { const e = D.exits.find((q) => q.id === spawn.toUpperCase()); sp = e ? e.spawn : null; if (e) label = e.name; }
    if (!sp) sp = [D.spawn.x, D.spawn.y, D.spawn.dir];
    P.x = sp[0]; P.y = sp[1]; P.setDir(sp[2] || "S");
    C.active = true; cam.ready = false; cam.pan = [0, 0];
    if (!C._trafficInit) { X.trafficInit(); C._trafficInit = true; C._warm = true; X.npcSpawnStep(0.016); C._warm = false; }
    X.logEv(`李默 → 云汇CBD（${label}）`);
  };
  C.leave = function () {
    C.active = false;
    for (const t of tiles.values()) if (t.c) t.c.width = t.c.height = 0; tiles.clear();
    for (const I of IMP.values()) { I.c.width = I.c.height = 0; I.e.width = I.e.height = 0; } IMP.clear();
    TEX.lit.clear(); patCache.clear();
  };
  C.flushCaches = () => { for (const t of tiles.values()) t.key = null; IMP.clear(); };
  const toast = X.toast;
  C.actions = {
    interact: () => { const n = C.near; if (!n) return toast("附近没有可互动的东西"); if (n.kind === "exit") X.useExit(n.e); else toast(n.label.replace(/^互动：/, "")); },
    time: () => { if (SP.clock) { SP.clock.cycleTime(); toast("时间快进"); } },
    weather: () => { if (SP.clock) { SP.clock.cycleWeather(); toast("天气：" + SP.clock.weatherName(SP.clock.target)); } },
    season: () => { if (SP.clock) { SP.clock.cycleSeason(); toast(SP.clock.seasonName() + "天"); } },
    nextDay: () => { if (SP.clock) SP.clock.nextDay(); },
    umbrella: () => { const P = C.player; P.umbrella = !P.umbrella; if (P.umbrella && X.blocked(P.x, P.y, 0.55, P)) { P.umbrella = false; return toast("太挤了，伞撑不开"); } toast(P.umbrella ? "撑伞" : "收伞"); },
    kick: () => toast("这里是 CBD，还是文明一点"),
    event: () => toast("CBD 暂无该事件"),
    zoom: (d) => C.zoomStep(d),
    recenter: () => { cam.recenter = true; C.zoomTo(SP.isTouch ? 1 : 0.5); },
    debug: () => { C.debug = !C.debug; },
    reset: () => C.enter(null),
    log: () => { C.showLog = !C.showLog; },
    skyline: () => { C.zoomTo(cam.zoom > 0.06 ? 0.026 : SP.isTouch ? 1 : 0.5); },
  };
  C.tower = (id) => X.W.towers.find((t) => t.id === id);
})(window.SP = window.SP || {});
