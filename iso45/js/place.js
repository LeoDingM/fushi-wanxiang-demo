/* scene-proto-45 · place (Stage 3): which scene 李默 is in. The street world (scene.json) is snapshotted while he is
   inside the 12号 stairwell / corridors (1F-6F) or the 2F-02 flat (interiors45.json) and restored on the way out —
   states, damage, laundry, NPCs and parked bikes persist. The ROOFTOP is a level of the street world (z = 18 m on top of
   12号): real street view below, live weather / season / night, NPCs and traffic keep running.
   Also draws the live outside view behind interior window holes (sky by time of day, weather, the block opposite). */
(function (SP) {
  "use strict";
  const W = SP.world;
  const PL = (SP.place = { street: null, npcs: null });
  SP.scenes = Object.assign({}, window.INTERIORS45 || {});
  SP.scenes.roof = { id: "roof", floor: 7, roof: true, name: "12号天台" };
  const KEEP = ["data", "objects", "byId", "decals", "timers", "defs", "hazards", "puddles", "leafPiles", "laundry", "colliders", "cgrid",
                "groundItems", "groundIdx", "groundRect", "groundTiles", "lastRuleMin", "chunkCols", "chunksIn"];
  const ZS = [0.67, 1, 1.5, 2, 3];
  function fitZoom() {
    const c = document.getElementById("game");
    return ZS.filter((z) => PL.centerIf(c.width / z, c.height / z)).pop() || ZS[0];
  }
  /** interior framing: screen-px bbox of the room (floor + 2.7 m walls); centre if it fits the view */
  PL.centerIf = function (vw, vh) {
    const B = W.data.bounds, xs = [], ys = [];
    for (const [x, y] of [[B.x0 - 0.2, B.y0 - 0.2], [B.x1 + 0.2, B.y0 - 0.2], [B.x0 - 0.2, B.y1 + 0.3], [B.x1 + 0.2, B.y1 + 0.3]]) { xs.push(SP.sx(x, y)); ys.push(SP.sy(x, y, 0), SP.sy(x, y, 2.75)); }
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    return x1 - x0 <= vw && y1 - y0 <= vh ? [(x0 + x1) / 2, (y0 + y1) / 2 + (SP.camOffsetY || 0) / SP.cam.zoom * 0.5] : null;
  };
  PL.where = () => (W.interior ? W.sceneId : SP.player.level === "roof" ? "roof" : "street");
  /** switch scene: to = interior id | "street" | "roof"; spawn = [x, y, dir] (always outside every trigger rect) */
  PL.enter = function (to, spawn) {
    const P = SP.player, cam = SP.cam, from = PL.where();
    const toInt = !!(SP.scenes[to] && SP.scenes[to].interior);
    if (toInt) {
      if (!W.interior) { PL.street = {}; for (const k of KEEP) PL.street[k] = W[k]; PL.npcs = SP.actors.list.filter((a) => a !== P); PL.streetZoom = cam.zt == null ? cam.zoom : cam.zt; }
      W.interior = true; W.sceneId = to; W.groundTiles = new Map();
      W.load(SP.scenes[to]);
      W.portals = W.data.portals || [];
      SP.actors.list = [P]; P.level = ""; P.z = 0;
      if (from === "street" || from === "roof" || !PL.intZoom) PL.intZoom = fitZoom();
      cam.zoom = cam.zt = PL.intZoom;
    } else {
      if (W.interior) {
        for (const k of KEEP) W[k] = PL.street[k];
        SP.actors.list = [P].concat(PL.npcs || []); W.interior = false;
        W.rebuildColliders(); W.bakeGround();
        cam.zoom = cam.zt = PL.streetZoom || SP.defaultZoom;
      }
      W.interior = false; W.sceneId = "street";
      const roof = to === "roof";
      P.level = roof ? "roof" : ""; P.z = roof ? W.data.roof.z : 0;
      W.portals = roof ? W.data.roof.portals : [];
      if (roof && !spawn) spawn = W.data.roof.spawn;
    }
    if (spawn) { P.x = spawn[0]; P.y = spawn[1]; if (spawn[2]) P.setDir(spawn[2]); }
    P.carry = null;
    SP.layers.reset(); SP.env.invalidateLights(); if (SP.fx.reset) SP.fx.reset();
    cam.ready = false; cam.pan = [0, 0]; cam.cx = null;
    SP.actors.resolve(8);
    W.logEvent(`李默 → ${to === "street" ? "街上" : to === "roof" ? "12号天台" : SP.scenes[to].name}`);
  };
  SP.scenes.roof.spawn = null;          // filled from scene.json at boot (place.init)
  PL.init = function () { SP.scenes.roof.spawn = window.SCENE_DATA.roof.spawn; W.interior = false; W.sceneId = "street"; W.portals = []; };

  // ---------- glass of the enclosed balcony (piece.glass = [x0, x1, z0, z1] local): translucent tint + two glints ----------
  PL.drawGlass = function (ctx, view) {
    if (!W.interior) return;
    const C = SP.clock, amb = C.ambient, n = SP.env.night;
    for (const o of W.objects) {
      const G = W.piece(o).glass; if (!G || o.state !== "glass") continue;
      const [x0, x1, z0, z1] = G, q = (u, v) => { const p = W.local(o, x0 + (x1 - x0) * u, 0.07, z0 + (z1 - z0) * v); return SP.scr(p[0], p[1], p[2]); };
      const a = q(0, 0); if (a[0] < view.x0 - 80 || a[0] > view.x1 + 80) continue;
      const poly = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
      poly([q(0, 0), q(1, 0), q(1, 1), q(0, 1)]);
      ctx.fillStyle = n > 0.5 ? "rgba(40,52,78,0.30)" : `rgba(${amb[0] * 0.7 | 0},${amb[1] * 0.82 | 0},${amb[2] * 0.9 | 0},0.20)`; ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      poly([q(0.12, 0.08), q(0.2, 0.08), q(0.42, 0.92), q(0.34, 0.92)]); ctx.fill();
      poly([q(0.58, 0.2), q(0.62, 0.2), q(0.78, 0.8), q(0.74, 0.8)]); ctx.fill();
    }
  };
  // ---------- live outside view behind window holes ----------
  const SKY = { clear: [[150, 190, 232], [196, 218, 240]], rain: [[120, 130, 146], [150, 158, 170]], snow: [[184, 192, 204], [214, 220, 228]], fog: [[176, 180, 186], [198, 200, 204]] };
  PL.drawBehind = function (ctx, view) {
    const C = SP.clock, amb = C.ambient, n = SP.env.night, w = C.intensity > 0.2 ? C.weather : "clear", sky = SKY[w] || SKY.clear;
    const mul = (c, k) => `rgb(${Math.round(c[0] * amb[0] / 255 * k)},${Math.round(c[1] * amb[1] / 255 * k)},${Math.round(c[2] * amb[2] / 255 * k)})`;
    for (const o of W.objects) {
      const V = W.piece(o).view || (o.state === "glass" && W.piece(o).glass); if (!V || !o.view) continue;   // far-side balcony glass: live outside behind it too
      const [x0, x1, z0, z1] = V, q = (u, v) => { const p = W.local(o, x0 + (x1 - x0) * u, 0.16, z0 + (z1 - z0) * v); return SP.scr(p[0], p[1], p[2]); };
      const quad = (u0, v0, u1, v1) => { const a = q(u0, v0), b = q(u1, v0), c = q(u1, v1), d = q(u0, v1); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); };
      const r = SP.frameRect(SP.frameKey(o.type, o.variant, "main", o.state, o.rot) || "", SP.sx(o.x, o.y), SP.sy(o.x, o.y, o.z)); if (r && !SP.rectsOverlap(r, view)) continue;
      quad(0, 0, 1, 1); ctx.fillStyle = mul(sky[0], 1); ctx.fill();
      quad(0, 0.55, 1, 1); ctx.fillStyle = mul(sky[1], 1); ctx.fill();
      // the block opposite (+ lit windows at night), a tree in season colours
      quad(0.05, 0, 0.62, 0.52); ctx.fillStyle = mul([150, 128, 112], 0.85); ctx.fill();
      quad(0.62, 0, 1.0, 0.36); ctx.fillStyle = mul([170, 160, 150], 0.8); ctx.fill();
      for (let i = 0; i < 6; i++) { const u = 0.1 + (i % 3) * 0.16, v = 0.12 + Math.floor(i / 3) * 0.2; quad(u, v, u + 0.07, v + 0.09);
        ctx.fillStyle = n > 0.35 && SP.hash(i, C.day + SP.strHash(o.id)) > 0.35 ? "rgb(255,214,140)" : mul([70, 76, 90], 0.9); ctx.fill(); }
      const se = C.season, leaf = se === "autumn" ? [196, 120, 50] : se === "winter" ? [120, 104, 90] : se === "spring" ? [236, 170, 190] : [78, 132, 66];
      quad(0.7, 0, 0.74, 0.3); ctx.fillStyle = mul([80, 60, 44], 0.9); ctx.fill();
      if (se !== "winter" || C.snow > 0.2) { quad(0.56, 0.22, 0.92, 0.5); ctx.fillStyle = C.snow > 0.3 ? mul([236, 240, 246], 1) : mul(leaf, 0.95); ctx.fill(); }
      // weather in the pane
      if (w === "rain" || w === "snow") {
        ctx.save(); quad(0, 0, 1, 1); ctx.clip();
        const a = q(0, 1), b = q(1, 0), X0 = Math.min(a[0], b[0]), X1 = Math.max(a[0], b[0]), Y0 = Math.min(a[1], b[1]) - 30, Y1 = Math.max(a[1], b[1]) + 30;
        ctx.fillStyle = w === "rain" ? "rgba(210,222,240,0.55)" : "rgba(255,255,255,0.9)";
        for (let i = 0; i < 26; i++) { const t = SP.now * (w === "rain" ? 1.6 : 0.25) + i * 0.137, X = X0 + ((i * 37.7) % (X1 - X0 + 1)), Y = Y0 + ((t * (Y1 - Y0)) % (Y1 - Y0)); ctx.fillRect(Math.round(X), Math.round(Y), 1, w === "rain" ? 4 : 1); }
        ctx.restore();
      }
    }
  };
})(window.SP);
