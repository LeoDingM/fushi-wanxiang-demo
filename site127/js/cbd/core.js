/* 云汇CBD · core: constants, helpers, shared state, assets, textures, world build, collision, schedule.
   Same conventions as the street: metres, 2:1 dimetric (sx = (x-y)*32, sy = -((x+y)*16 + z*39.19)), modular depth-sorted
   drawables (prism test on footprints, z for stacked parts), circle-vs-footprint collision with sliding.
   Uses from the core (read-only): SP.Actor + window.ACTORS, SP.clock, SP.dirFromWorld, street kit cars (p_car). */
(function (SP) {
  "use strict";
  const D = window.CBD_SCENE, K = window.KIT_CBD_MANIFEST, C = SP.cbd;
  if (!D || !K) { console.warn("cbd: CBD_SCENE / KIT_CBD_MANIFEST missing"); return; }
  const Q = new URLSearchParams(location.search);
  Object.assign(C, { data: D, kit: K, active: false, ready: false, stats: {}, exits: D.exits, debug: Q.get("debug") === "1", log: [] });
  C._mods = C._mods || {}; C._mods.core = true;
  const X = (C._ = {});
  const KX = 32, KY = 16, PZ = 39.1918, SUN = K.projection.sun_world;
  const SX = (x, y) => (x - y) * KX, SY = (x, y, z) => -((x + y) * KY + (z || 0) * PZ);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v), lerp = (a, b, t) => a + (b - a) * t;
  const hash = (a, b) => { let h = Math.imul((a | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(((b | 0) + 0x27d4eb2f) | 0, 0xc2b2ae35); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; return (h >>> 0) / 4294967296; };
  const shash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rnd = (function (s) { return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })(20261010);
  const DIR8 = ["E", "NE", "N", "NW", "W", "SW", "S", "SE"];
  const dirOf = (vx, vy) => (SP.dirFromWorld ? SP.dirFromWorld(vx, vy) : DIR8[(Math.round(Math.atan2(vy, vx) / (Math.PI / 4)) + 8) % 8]);
  const overlap = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
  const F = K.frames, EF = K.emitf, SF = K.snowf, HF = K.shadowf;

  // shared mutable state (other modules fill / use these objects)
  const IMG = {}, TEX = { g: {}, gavg: {}, fac: {}, facE: {}, lit: new Map() };
  const W = (C.world = { props: [], parts: [], towers: [], colliders: [], statics: [], grid: new Map() });
  const TR = (C.traffic = { cars: [], t: 0, n: 0, lanes: [] });
  const NPC = (C.npc = { list: [], t: 0 });
  const FX = (C.fx = { list: [], t: 0 });
  const cam = (C.cam = { x: 0, y: 0, zoom: +(Q.get("zoom") || 0.5), zt: null, pan: [0, 0], anchor: null });
  const tiles = new Map(), IMP = new Map(), keys = Object.create(null);
  Object.assign(X, { D, K, Q, KX, KY, PZ, SUN, SX, SY, clamp, lerp, hash, shash, rnd, dirOf, overlap, F, EF, SF, HF, IMG, TEX, W, TR, NPC, FX, cam, tiles, IMP, keys });

  // ---------------------------------------------------------------- assets
  function img(src) { return new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => { console.error("cbd: missing", src); res(null); }; im.src = /^(data:|blob:|https?:|file:)/.test(src) ? src : (C.base || "") + src; }); }
  C._loadAssets = function () {
    if (C._assetsP) return C._assetsP;
    SP.img = SP.img || {}; SP.tintedActors = SP.tintedActors || {};
    const acts = ["li_mo", "li_mo_umb", "office", "student", "uncle", "vendor"].filter((n) => window.ACTORS && window.ACTORS[n]);
    const jobs = [img("kit_cbd/kit_atlas.png"), img("kit_cbd/kit_emit.png"), img("kit_cbd/kit_shadow.png")];
    const needCore = !SP.img.atlas;
    jobs.push(needCore ? img("kit/kit_atlas.png") : Promise.resolve(SP.img.atlas));
    jobs.push(img("kit_cbd_bus/bus.png"));
    jobs.push(img("kit_cbd_bus/bus_emit.png"));
    for (const n of acts) if (!SP.img["actor_" + n]) jobs.push(img(window.ACTORS[n].img).then((im) => { SP.img["actor_" + n] = im; SP.tintedActors[n] = im; return im; }));
    C._assetsP = Promise.all(jobs).then((r) => {
      IMG.atlas = r[0]; IMG.emit = r[1]; IMG.shadow = r[2]; IMG.coreRaw = r[3];
      IMG.bus = r[4];
      IMG.busEmit = r[5];
      X.busFrames = {0:[0,0,423,311,208,218],2:[423,0,423,311,215,218],4:[0,311,423,311,208,218],6:[423,311,423,311,215,218]};
      if (needCore && r[3]) SP.img.atlas = r[3];
      build(); C.ready = true;
    });
    return C._assetsP;
  };
  X.loadSnow = function () { if (IMG.snow || IMG._snowing) return; IMG._snowing = true; img("kit_cbd/kit_snow.png").then((im) => { IMG.snow = im; }); };
  function sub(src, f) { const c = document.createElement("canvas"); c.width = f[2]; c.height = f[3]; c.getContext("2d").drawImage(src, f[0], f[1], f[2], f[3], 0, 0, f[2], f[3]); return c; }
  function half(c) { const w = Math.max(1, c.width >> 1), h = Math.max(1, c.height >> 1), o = document.createElement("canvas"); o.width = w; o.height = h; const x = o.getContext("2d"); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high"; x.drawImage(c, 0, 0, w, h); return o; }
  X.half = half;

  // ---------------------------------------------------------------- textures (ground + facade mip chains)
  // Local file pages have opaque origins in Chrome, so reading atlas pixels
  // from a canvas throws SecurityError. These are the current atlas averages;
  // the textured atlas itself still draws normally in file mode.
  const fileGroundAvg = {
    paver:"#cdc9c1", plaza:"#dfd9cd", plaza_dk:"#92969c", street:"#c5bbaf",
    asphalt:"#45474d", brt:"#953d37", intersection:"#4b4d53",
    grass_spring:"#6fa94a", lawn_spring:"#72ad4c", grass_summer:"#58973e", lawn_summer:"#5b9c40",
    grass_autumn:"#959746", lawn_autumn:"#999c48", grass_winter:"#979371", lawn_winter:"#9c9773",
    path:"#c38365", deck:"#a37650", water:"#4595c3", track:"#bd5948",
    soil:"#705a46", roof:"#aaaeb2", city:"#a7a7a9"
  };
  function texInit() {
    for (const k in F) {
      if (k.startsWith("g/")) {
        const name = k.slice(2), c = sub(IMG.atlas, F[k]); TEX.g[name] = c;
        if (location.protocol === "file:") TEX.gavg[name] = fileGroundAvg[name] || "#888";
        else {
          const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
          n = n || 1; TEX.gavg[name] = `rgb(${r / n | 0},${g / n | 0},${b / n | 0})`;
        }
      }
      if (k.startsWith("fac/")) { const m = [sub(IMG.atlas, F[k])]; for (let i = 1; i < 6; i++) m.push(half(m[i - 1])); TEX.fac[k.slice(4)] = m; }
    }
    for (const k in EF) if (k.startsWith("fac/")) TEX.facE[k.slice(4)] = sub(IMG.emit, EF[k]);
  }
  const patCache = new Map();
  X.patCache = patCache;
  X.pattern = function (ctx, canvas, key) { let p = patCache.get(key); if (!p) { p = ctx.createPattern(canvas, "repeat"); patCache.set(key, p); } return p; };
  X.mipFor = (z) => clamp(Math.floor(Math.log2(1 / Math.max(z, 1e-3)) + 0.25), 0, 5);

  // ---------------------------------------------------------------- geometry
  const CELL = 512, gk = (gx, gy) => (gx + 4096) * 8192 + (gy + 4096);
  let qn = 1;
  X.qn = () => ++qn;
  function gadd(it) { const r = it.rect; for (let gx = Math.floor(r.x0 / CELL); gx <= Math.floor(r.x1 / CELL); gx++) for (let gy = Math.floor(r.y0 / CELL); gy <= Math.floor(r.y1 / CELL); gy++) { const k = gk(gx, gy); let l = W.grid.get(k); if (!l) W.grid.set(k, (l = [])); l.push(it); } }
  X.gquery = function (r, out) { const q = ++qn; for (let gx = Math.floor(r.x0 / CELL); gx <= Math.floor(r.x1 / CELL); gx++) for (let gy = Math.floor(r.y0 / CELL); gy <= Math.floor(r.y1 / CELL); gy++) { const l = W.grid.get(gk(gx, gy)); if (!l) continue; for (const it of l) if (it._q !== q) { it._q = q; if (overlap(it.rect, r)) out.push(it); } } return out; };
  function rotPt(x, y, r) { const a = r * Math.PI / 4, c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; }
  function rectPoly(f, ox, oy, r) { return [[f[0], f[1]], [f[2], f[1]], [f[2], f[3]], [f[0], f[3]]].map(([x, y]) => { const p = rotPt(x, y, r || 0); return [ox + p[0], oy + p[1]]; }); }
  function partPoly(p) {
    if (p.shape === "rect") return [[p.x0, p.y0], [p.x1, p.y0], [p.x1, p.y1], [p.x0, p.y1]];
    if (p.shape === "oct") { const c = p.c; return [[p.x0 + c, p.y0], [p.x1 - c, p.y0], [p.x1, p.y0 + c], [p.x1, p.y1 - c], [p.x1 - c, p.y1], [p.x0 + c, p.y1], [p.x0, p.y1 - c], [p.x0, p.y0 + c]]; }
    const n = p.n || 20, rx = p.shape === "ell" ? p.rx : p.r, ry = p.shape === "ell" ? p.ry : p.r, out = [];
    for (let i = 0; i < n; i++) { const a = (i + 0.5) / n * Math.PI * 2; out.push([p.cx + rx * Math.cos(a), p.cy + ry * Math.sin(a)]); }
    return out;
  }
  function hull(pts) {
    pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = []; for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    up.pop(); lo.pop(); return lo.concat(up);
  }
  function inPoly(x, y, P) { let ins = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins; } return ins; }
  function scrRect(pts) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; } return { x0, y0, x1, y1 }; }
  function bbox(poly) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of poly) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; }
  X.facePath = function (ctx, f, z0, z1) { ctx.beginPath(); ctx.moveTo(SX(f.a[0], f.a[1]), SY(f.a[0], f.a[1], z0)); ctx.lineTo(SX(f.b[0], f.b[1]), SY(f.b[0], f.b[1], z0)); ctx.lineTo(SX(f.b[0], f.b[1]), SY(f.b[0], f.b[1], z1)); ctx.lineTo(SX(f.a[0], f.a[1]), SY(f.a[0], f.a[1], z1)); ctx.closePath(); };
  X.polyPath = function (ctx, poly, z) { ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(SX(x, y), SY(x, y, z)) : ctx.moveTo(SX(x, y), SY(x, y, z)))); ctx.closePath(); };
  Object.assign(X, { rotPt, rectPoly, partPoly, hull, inPoly, scrRect, bbox });
  function frameKey(t, v, st, se, r) {
    const P = K.pieces[t]; if (!P) return null;
    const vv = P.vars.includes(v) ? v : "base", s2 = P.seasons ? se : "-", rr = P.rots.includes(r) ? r : P.rots[0];
    const k = `${t}/${vv}/${st || P.states[0]}/${s2}/${rr}`; return F[k] ? k : null;
  }
  /** visible vertical faces of a convex polygon: outward normal towards the camera (n.x + n.y < 0); shade from the sun */
  function faces(poly) {
    const out = []; let area = 0; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; area += a[0] * b[1] - b[0] * a[1]; }
    const ccw = area > 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], ex = b[0] - a[0], ey = b[1] - a[1], L = Math.hypot(ex, ey); if (L < 1e-6) continue;
      let nx = ey / L, ny = -ex / L; if (!ccw) { nx = -nx; ny = -ny; }
      if (nx + ny < -1e-6) { const lam = Math.max(0, nx * SUN[0] + ny * SUN[1]) / 0.73; out.push({ a, b, L, ex: ex / L, ey: ey / L, nx, ny, shade: 0.62 + 0.38 * Math.min(1, lam) }); }
    }
    return out;
  }
  X.faces = faces;
  function mkPart(b, p, tower) {
    const poly = partPoly(p), z0 = p.z0, z1 = p.z1;
    const sp = []; for (const [x, y] of poly) sp.push([SX(x, y), SY(x, y, z0)], [SX(x, y), SY(x, y, z1)]);
    const H = hull(sp), rect = scrRect(H), bb = bbox(poly);
    const d = { kind: "part", b, p, poly, z0, z1, hull: H, rect, sh: [{ p: poly }], depth: (bb[0] + bb[2] + bb[1] + bb[3]) / 2, box: bb, tower, alpha: 1, id: (b.id || "t") + ":" + z0 };
    d.uoff = (shash(d.id) % 97) * 1.5; d.faces = faces(poly);
    return d;
  }
  function setPropRect(it) { const f = F[it.key]; it.rect = { x0: it.X - f[4], y0: it.Y - f[5], x1: it.X - f[4] + f[2], y1: it.Y - f[5] + f[3] }; }
  X.season = () => (SP.clock && SP.clock.season) || Q.get("season") || "summer";
  X.night = C.night = () => { const ck = SP.clock; return ck ? clamp((ck.dark - 0.2) / 0.4, 0, 1) : 0; };
  X.schedule = C.schedule = function (name) { const S = D.schedule[name]; if (!S) return 0; const h = ((SP.clock ? SP.clock.min : 720) / 60) % 24, i = Math.floor(h), f = h - i; return lerp(S[i], S[(i + 1) % 24], f); };
  X.logEv = function (s) { const ck = SP.clock; C.log.push(`${ck && ck.clockLabel ? ck.clockLabel() : ""} ${s}`); if (C.log.length > 40) C.log.shift(); };
  X.toast = C.toast = function (s) { if (C.onToast) C.onToast(s); else if (SP.toast) SP.toast(s); };
  X.frameKey = frameKey; X.mkPart = mkPart; X.setPropRect = setPropRect; X.gadd = gadd; X.gk = gk; X.texInit = texInit;
  function build() { X.texInit(); X.buildWorld(); }
})(window.SP = window.SP || {});
