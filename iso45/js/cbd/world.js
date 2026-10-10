/* 云汇CBD · world: build drawables / colliders / lights / walk graph from CBD_SCENE, seasonal frame swap, collision. */
(function (SP) {
  "use strict";
  const C = SP.cbd, X = C._; if (!X) return; C._mods.world = true;
  const { D, K, F, SX, SY, SUN, W, TR, NPC, tiles, clamp, hash, shash, rotPt, rectPoly, partPoly, bbox, faces, frameKey, mkPart, setPropRect, gadd, gk } = X;

  X.buildWorld = function () {
    const se = X.season(); C.seasonNow = se;
    for (const o of D.props) {
      const P = K.pieces[o.t]; if (!P) continue;
      const it = { kind: "prop", o, t: o.t, x: o.x, y: o.y, r: o.r || 0, v: o.v || "base", X: Math.round(SX(o.x, o.y)), Y: Math.round(SY(o.x, o.y, 0)), alpha: 1, id: o.t + "@" + o.x + "," + o.y };
      it.key = frameKey(o.t, it.v, null, se, it.r); if (!it.key) continue;
      const g = K.geo[it.key] || [-0.3, -0.3, 0, 0.3, 0.3, 1];
      it.sh = [{ p: [[o.x + g[0], o.y + g[1]], [o.x + g[3], o.y + g[1]], [o.x + g[3], o.y + g[4]], [o.x + g[0], o.y + g[4]]] }];
      if (o.t === "tree_a" || o.t === "tree_b") { it.tree = true; it.sh = [{ p: rectPoly([-0.35, -0.35, 0.35, 0.35], o.x, o.y, 0) }]; }
      it.z0 = g[2]; it.z1 = g[5]; it.depth = o.x + o.y;
      setPropRect(it);
      if (P.foot) { const fp = rectPoly(P.foot, o.x, o.y, it.r); W.colliders.push({ poly: fp, box: bbox(fp), id: it.id, exit: o.exit }); }
      W.props.push(it); W.statics.push(it); gadd(it);
    }
    for (const b of D.buildings) {
      b.drawables = [];
      for (const p of b.parts) { const d = mkPart(b, p, false); b.drawables.push(d); W.parts.push(d); W.statics.push(d); gadd(d); }
      for (const f of b.foot || []) {
        const poly = f[0] === "ell" ? partPoly({ shape: "ell", cx: f[1], cy: f[2], rx: f[3], ry: f[4], n: f[5] }) : [[f[0], f[1]], [f[2], f[1]], [f[2], f[3]], [f[0], f[3]]];
        W.colliders.push({ poly, box: bbox(poly), id: b.id });
      }
    }
    for (const t of D.towers.concat(D.fabric)) {
      t.drawables = []; t.top = 0;
      for (const p of t.parts) { const d = mkPart(t, p, true); t.drawables.push(d); W.parts.push(d); W.statics.push(d); gadd(d); t.top = Math.max(t.top, p.z1); }
      const P0 = t.drawables[0]; t.box = P0.box; t.depth = P0.depth;
      if (t.walk) W.colliders.push({ poly: P0.poly, box: bbox(P0.poly), id: t.id });
      // aviation obstruction lights: roof corners (steady), spire tip (blinking), mid-height pairs every 150 m on tall towers
      const L = [], wide = t.parts.filter((p) => !p.spire && !p.roofbox), top = wide[wide.length - 1];
      if (top) { const poly = partPoly(top), n = poly.length, step = Math.max(1, Math.floor(n / 4)); for (let i = 0; i < n; i += step) L.push([poly[i][0], poly[i][1], top.z1 + 0.5, 1]); }
      const sp = t.parts.find((p) => p.spire); if (sp) L.push([sp.cx, sp.cy, sp.z1 + 1, 2]);
      if ((t.h || 0) >= 300) for (let z = 150; z < t.h - 60; z += 150) { const p0 = t.parts.find((p) => p.z0 <= z && p.z1 >= z && !p.spire); if (!p0) continue; const poly = partPoly(p0); L.push([poly[0][0], poly[0][1], z, 0], [poly[Math.floor(poly.length / 2)][0], poly[Math.floor(poly.length / 2)][1], z, 0]); }
      t.avl = L; t.blink = hash(shash(t.id), 3);
      W.towers.push(t);
    }
    const lake = partPoly({ shape: "ell", cx: D.lake.c[0], cy: D.lake.c[1], rx: D.lake.r[0] - 0.3, ry: D.lake.r[1] - 0.3, n: 28 });
    W.colliders.push({ poly: lake, box: bbox(lake), id: "lake", water: true });
    W.cgrid = new Map();
    for (const c of W.colliders) for (let gx = Math.floor(c.box[0] / 8); gx <= Math.floor(c.box[2] / 8); gx++) for (let gy = Math.floor(c.box[1] / 8); gy <= Math.floor(c.box[3] / 8); gy++) { const k = gk(gx, gy); let l = W.cgrid.get(k); if (!l) W.cgrid.set(k, (l = [])); l.push(c); }
    buildLights();
    const N = D.nav.nodes, adj = N.map(() => []);
    for (const e of D.nav.edges) { const [i, j, cw] = e, L = Math.hypot(N[i][0] - N[j][0], N[i][1] - N[j][1]); adj[i].push([j, L, cw]); adj[j].push([i, L, cw]); }
    W.adj = adj; C.stats.statics = W.statics.length;
  };
  function buildLights() {
    W.lights = [];
    for (const it of W.props) {
      const t = it.t;
      if (t === "lamp_park") W.lights.push({ x: it.x, y: it.y, z: 4, r: 7, c: [255, 214, 150], k: 1 });
      if (t === "lamp_street") for (const s of [-1, 1]) { const [dx, dy] = rotPt(s * 1.9, 0, it.r); W.lights.push({ x: it.x + dx, y: it.y + dy, z: 9, r: 12, c: [236, 240, 255], k: 1 }); }
      if (t === "metro_exit" || t === "brt_shelter" || t === "kiosk" || t === "bus_shelter") W.lights.push({ x: it.x, y: it.y, z: 2.5, r: t === "brt_shelter" ? 16 : 7, c: [230, 240, 255], k: 0.9 });
      if (t === "cafe_set") W.lights.push({ x: it.x, y: it.y, z: 2, r: 3.5, c: [255, 200, 130], k: 0.7, shop: true });
    }
    for (const b of D.buildings) {
      const p = b.parts[0]; if (!p) continue;
      if (b.kind === "boutique" && p.shape === "rect") { const s = b.front === "S" ? -1 : 1, y = s < 0 ? p.y0 - 2.5 : p.y1 + 2.5; for (let x = p.x0 + 5; x < p.x1 - 2; x += 6) W.lights.push({ x, y, z: 1, r: 5, c: [255, 214, 160], k: 0.5, shop: true }); }
      if (b.kind === "mall" || b.kind === "stadium" || b.kind === "office") {
        for (const f of faces(partPoly(p))) for (let u = 4; u < f.L - 2; u += 9) W.lights.push({ x: f.a[0] + f.ex * u + f.nx * 2.5, y: f.a[1] + f.ey * u + f.ny * 2.5, z: 1, r: 7, c: b.kind === "stadium" ? [210, 230, 255] : [255, 226, 180], k: 0.5, shop: true });
      }
    }
    for (const t of W.towers) if (t.walk) for (const f of faces(partPoly(t.parts[0]))) for (let u = 6; u < f.L - 3; u += 10) W.lights.push({ x: f.a[0] + f.ex * u + f.nx * 2, y: f.a[1] + f.ey * u + f.ny * 2, z: 1, r: 7, c: [255, 236, 200], k: 0.55, shop: true });
  }
  X.applySeason = function () {
    const se = X.season();
    for (const it of W.props) { const k = frameKey(it.t, it.v, null, se, it.r); if (k && k !== it.key) { it.key = k; setPropRect(it); } }
    for (const t of tiles.values()) t.key = null; C.seasonNow = se;
  };

  // ---------------------------------------------------------------- collision (circle vs footprint, other people, cars)
  function polyDist(px, py, poly) {
    let inside = true, best = 1e9, sgn = 0;
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length], ex = x2 - x1, ey = y2 - y1, L = ex * ex + ey * ey || 1;
      const t = clamp(((px - x1) * ex + (py - y1) * ey) / L, 0, 1), d = Math.hypot(px - x1 - ex * t, py - y1 - ey * t); if (d < best) best = d;
      const c = ex * (py - y1) - ey * (px - x1); if (c !== 0) { const s = c > 0 ? 1 : -1; if (!sgn) sgn = s; else if (s !== sgn) inside = false; }
    }
    return inside ? -best : best;
  }
  function inCar(c, x, y, r) { const dx = x - c.x, dy = y - c.y, u = dx * c.hx + dy * c.hy, v = -dx * c.hy + dy * c.hx; return Math.abs(u) < c.hl + r && Math.abs(v) < c.hw + r; }
  function blocked(x, y, r, self) {
    const B = D.bounds; if (x < B[0] + r || y < B[1] + r || x > B[2] - r || y > B[3] - r) return { id: "bounds" };
    const q = X.qn();
    for (let gx = Math.floor((x - r) / 8); gx <= Math.floor((x + r) / 8); gx++) for (let gy = Math.floor((y - r) / 8); gy <= Math.floor((y + r) / 8); gy++) {
      const l = W.cgrid.get(gk(gx, gy)); if (!l) continue;
      for (const c of l) { if (c._q === q) continue; c._q = q; if (x + r < c.box[0] || x - r > c.box[2] || y + r < c.box[1] || y - r > c.box[3]) continue; if (polyDist(x, y, c.poly) < r) return c; }
    }
    for (const a of NPC.list) if (a !== self && !a.hidden && !a.gone && Math.abs(a.x - x) < 0.6 && Math.abs(a.y - y) < 0.6 && Math.hypot(a.x - x, a.y - y) < r + 0.22) return a;
    for (const car of TR.cars) if (Math.abs(car.x - x) < car.hl + 1 && Math.abs(car.y - y) < car.hl + 1 && inCar(car, x, y, r)) return car;
    return null;
  }
  function moveActor(a, dx, dy, r) {
    if (!dx && !dy) return 0;
    const ok = (x, y) => !blocked(x, y, r, a), L = Math.hypot(dx, dy);
    if (ok(a.x + dx, a.y + dy)) { a.x += dx; a.y += dy; return L; }
    for (const [sx, sy] of [[dx, 0], [0, dy]]) { const m = Math.hypot(sx, sy); if (m > L * 0.25 && ok(a.x + sx, a.y + sy)) { a.x += sx; a.y += sy; return m; } }
    for (const ang of [0.6, -0.6, 1.1, -1.1]) { const c = Math.cos(ang), s = Math.sin(ang), nx = (dx * c - dy * s) * 0.7, ny = (dx * s + dy * c) * 0.7; if (ok(a.x + nx, a.y + ny)) { a.x += nx; a.y += ny; return L * 0.7; } }
    return 0;
  }
  X.blocked = C.blocked = blocked; X.moveActor = moveActor; X.polyDist = polyDist;
})(window.SP = window.SP || {});
