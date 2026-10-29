/* 浮世万象 · scene-proto-45 · core: 2:1 dimetric projection, kit atlas (manifest + emit + snow atlas), light sprites, masks, geometry.
   World = metres (x east, y north, z up). Camera: orthographic, yaw 45 (looks north-east), pitch 30 -> screen px (y down):
     sx = (x - y) * 32        sy = -((x + y) * 16 + z * 39.19)
   0.5 m grid cell = 16 x 8 px diamond, 2 m ground chunk = 128 x 64 px diamond. World east = screen up-right,
   north = up-left, south = down-right, west = down-left; the camera-facing direction is SW. */
(function (SP) {
  "use strict";
  const K = window.KIT_MANIFEST;
  const PJ = K.projection;
  /* interior kit (Stage 3, kit_int/): its own atlas; frames are merged into the one frame table with a 7th field = 1
     (drawFrame / drawEmit / eraseFrame pick the interior atlas), pieces / masks / emit lists merged (street keys win) */
  const KI = window.KIT_INT_MANIFEST;
  if (KI) {
    for (const [k, f] of Object.entries(KI.frames)) if (!K.frames[k]) K.frames[k] = f.slice(0, 6).concat([1]);
    for (const [k, v] of Object.entries(KI.pieces)) if (!K.pieces[k]) K.pieces[k] = v;
    for (const [k, v] of Object.entries(KI.masks || {})) if (!K.masks[k]) K.masks[k] = v;
    K.emit = (K.emit || []).concat((KI.emit || []).filter((k) => K.frames[k] && K.frames[k][6]));
  }
  /* atlas slot 2 (f[6] === 2): procedural district art (rongqiao_art.js) on its own canvas, so the large interior atlas does not grow */
  const extPage = (f, em) => (f[6] === 2 ? (em ? SP.img.ext_emit : SP.img.ext_atlas) : ((em ? SP.img.ext_emits : SP.img.ext_pages) || [])[f[6] - 2]);   // slot 2+: rongqiao art pages
  const srcOf = (f, raw) => (f[6] >= 2 ? extPage(f) : f[6] ? SP.img.int_atlas : raw ? (SP.baseAtlas || SP.img.atlas) : SP.tinted);
  SP.KX = PJ.px_x_per_m; SP.KY = PJ.px_y_per_m; SP.PZ = PJ.px_z_per_m;      // 32, 16, 39.19
  SP.sx = (x, y) => (x - y) * SP.KX;
  SP.sy = (x, y, z) => -((x + y) * SP.KY + (z || 0) * SP.PZ);
  SP.scr = (x, y, z) => [SP.sx(x, y), SP.sy(x, y, z)];
  /** screen -> ground (z = 0) */
  SP.unproject = (X, Y) => { const a = X / SP.KX, b = -Y / SP.KY; return [(a + b) / 2, (b - a) / 2]; };
  /** screen-direction vector (y down) -> unit world vector on the ground that moves along it on screen */
  SP.screenToWorldDir = function (dx, dy) {
    // screen right (1,0) = world (1,-1)/sqrt2 ; screen up (0,-1) = world (1,1)/sqrt2
    const wx = (dx - dy), wy = (-dx - dy), L = Math.hypot(wx, wy) || 1;
    return [wx / L, wy / L];
  };
  SP.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  SP.lerp = (a, b, t) => a + (b - a) * t;
  SP.smooth = (t) => t * t * (3 - 2 * t);
  SP.K = K;
  SP.rng = function (seed) {
    let a = seed >>> 0;
    return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  SP.rand = SP.rng(20261010);
  // 8 world directions, counter-clockwise from east; vector -> name
  SP.DIRS = ["E", "NE", "N", "NW", "W", "SW", "S", "SE"];
  SP.dirVec = { E: [1, 0], NE: [Math.SQRT1_2, Math.SQRT1_2], N: [0, 1], NW: [-Math.SQRT1_2, Math.SQRT1_2], W: [-1, 0], SW: [-Math.SQRT1_2, -Math.SQRT1_2], S: [0, -1], SE: [Math.SQRT1_2, -Math.SQRT1_2] };
  SP.dirFromWorld = function (vx, vy) { const a = Math.atan2(vy, vx); return SP.DIRS[(Math.round(a / (Math.PI / 4)) + 8) % 8]; };

  // ---------- images ----------
  SP.img = {};
  SP.load = function (list, onProgress) {
    let n = 0; const total = list.length;
    const boot = window.__BOOT || {}, images = boot.images || {};
    return Promise.all(list.map(([k, src]) => new Promise((res) => {
      const done = () => { n++; if (onProgress) onProgress(n, total, src); res(); };
      let im = images[src];
      if (!im) im = new Image();
      SP.img[k] = im;
      if (!im.src) im.src = src;
      if (im._bootErr || (im.complete && im.naturalWidth && im.src)) { done(); return; }
      im.onload = done;
      im.onerror = () => { console.error("missing", src); done(); };
    })));
  };

  // ---------- kit frames ----------
  const F = K.frames;
  SP.frame = (key) => F[key];
  SP.frameKey = function (piece, variant, part, state, rot) {
    const P = K.pieces[piece];
    if (!P) return null;
    const st = P.states.includes(state) ? state : P.states[0];
    const r = P.rots.includes(rot) ? rot : P.rots[0];
    // variant fallback: "t2.autumn" -> "t2" -> "base" (weathering / shape variants exist only for some states)
    const v = variant || "base";
    let k = `${piece}/${v}/${part}/${st}/${r}`;
    if (!F[k] && v.includes(".")) k = `${piece}/${v.split(".")[0]}/${part}/${st}/${r}`;
    if (!F[k]) k = `${piece}/base/${part}/${st}/${r}`;
    return F[k] ? k : null;
  };
  const maskCache = {};
  SP.mask = function (key) {
    if (maskCache[key] !== undefined) return maskCache[key];
    const m = K.masks[key];
    if (!m) return (maskCache[key] = null);
    const [cols, rows, b64] = m, bin = atob(b64), bits = new Uint8Array(cols * rows);
    for (let i = 0; i < cols * rows; i++) bits[i] = (bin.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
    return (maskCache[key] = { cols, rows, bits });
  };
  SP.maskHits = function (key, dx, dy, r) {
    const m = SP.mask(key), C = K.mask_cell;
    if (!m) return 0;
    const c0 = Math.max(0, Math.floor((r.x0 - dx) / C)), c1 = Math.min(m.cols - 1, Math.floor((r.x1 - dx) / C));
    const r0 = Math.max(0, Math.floor((r.y0 - dy) / C)), r1 = Math.min(m.rows - 1, Math.floor((r.y1 - dy) / C));
    let n = 0;
    for (let y = r0; y <= r1; y++) for (let x = c0; x <= c1; x++) n += m.bits[y * m.cols + x];
    return n;
  };

  // ---------- time-of-day tint ----------
  SP.tinted = null; SP.tintKey = "";
  SP.tint = { r: 255, g: 255, b: 255, night: 0 };
  function multiplyCopy(c, src, w, h, r, g, b, emit, night) {
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    const x = c.getContext("2d");
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = "source-over";
    x.clearRect(0, 0, w, h); x.drawImage(src, 0, 0);
    if (r < 255 || g < 255 || b < 255) {
      x.globalCompositeOperation = "multiply"; x.fillStyle = `rgb(${r},${g},${b})`; x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = "destination-in"; x.drawImage(src, 0, 0);
    }
    if (emit && night > 0.01) { x.globalCompositeOperation = "source-over"; x.globalAlpha = Math.min(1, night * 1.15); x.drawImage(emit, 0, 0); }
    x.globalAlpha = 1; x.globalCompositeOperation = "source-over";
    return c;
  }
  /* texture slots: AI-painted (or hand-painted) replacements for any kit frame. kit/overrides/index.js sets
     window.KIT_OVERRIDES = { "<piece>/<variant>/<part>/<state>/<rot>": "kit/overrides/<same path>.png", ... };
     each PNG must have exactly the frame's size (kit/texture_slots.json) and is pasted over that frame's atlas rect
     before tinting, so it sorts / fades / lights exactly like the generated sprite. */
  SP.baseAtlas = null;
  SP.applyOverrides = function () {
    const A = SP.img.atlas, c = document.createElement("canvas"); c.width = A.naturalWidth; c.height = A.naturalHeight;
    const x = c.getContext("2d"); x.drawImage(A, 0, 0); SP.overridden = [];
    for (const [key, src] of Object.entries(window.KIT_OVERRIDES || {})) {
      const f = F[key], im = SP.img["ovr:" + key];
      const iw = im && (im.naturalWidth || im.width), ih = im && (im.naturalHeight || im.height);
      if (!f || !iw) continue;
      if (iw !== f[2] || ih !== f[3]) { console.warn("override size mismatch", key, iw, ih, "expected", f[2], f[3]); continue; }
      x.clearRect(f[0], f[1], f[2], f[3]); x.drawImage(im, f[0], f[1]); SP.overridden.push(key);
    }
    SP.baseAtlas = c;
  };
  SP.overrideAssets = () => Object.entries(window.KIT_OVERRIDES || {}).map(([k, src]) => ["ovr:" + k, src]);
  /* lighting (ported from the front-view line): the atlas is drawn UNTINTED; the time-of-day / weather ambient colour
     and every light source are applied once per frame by the lightmap (js/env.js: multiply), emissive pixels are
     composited after it. So there is no per-time-of-day atlas copy any more (less memory on phones, continuous clock). */
  SP.updateTint = function () {
    if (!SP.baseAtlas) SP.applyOverrides();
    SP.tinted = SP.baseAtlas; SP.tintKey = "lit";
    for (const name in window.ACTORS) SP.tintedActors[name] = SP.img["actor_" + name];
    return false;
  };
  SP.tintedActors = {};
  // ---------- emit + snow frames ----------
  const EMITSET = new Set(K.emit || []), SNOW = K.snow || {};
  SP.hasEmit = (key) => EMITSET.has(key);
  SP.addEmit = (keys) => { for (const k of keys || []) EMITSET.add(k); };
  /** snow frame of a kit frame (recolour variants share the geometry variant's snow: "t2.autumn" -> "t2") */
  const snowKeyCache = new Map();
  SP.snowKey = function (key) {
    let k = snowKeyCache.get(key); if (k !== undefined) return k;
    k = null;
    const same = (q) => SNOW[q] && F[q] && F[key] && F[q][2] === F[key][2] && F[q][3] === F[key][3] && F[q][4] === F[key][4] && F[q][5] === F[key][5];
    if (SNOW[key]) k = key;
    else {                                   // piece/variant/part/state/rot: try base geometry variant, then the default state
      const p = key.split("/"), piece = K.pieces[p[0]], vs = [p[1]];
      if (p[1].includes(".")) vs.push(p[1].split(".")[0]);
      if (!vs.includes("base")) vs.push("base");
      const sts = [p[3]]; if (piece && piece.states && !sts.includes(piece.states[0])) sts.push(piece.states[0]);
      outer: for (const st of sts) for (const v of vs) { const q = [p[0], v, p[2], st, p[4]].join("/"); if (same(q)) { k = q; break outer; } }
    }
    snowKeyCache.set(key, k); return k;
  };
  /** snow cover over a frame: amount 0..1 crossfades the 3 cumulative levels of kit_snow.png (loaded on first snow) */
  SP.drawSnow = function (ctx, key, x, y, amount, alpha) {
    if (amount <= 0.01) return;
    const L = SP.img.snow;
    if (!L) { if (!SP._snowLoading) { SP._snowLoading = true; const im = new Image(); im.onload = () => (SP.img.snow = im); im.src = "kit/" + (K.snow_atlas || "kit_snow.png"); } return; }
    const sk = SP.snowKey(key); if (!sk) return;
    const f = F[key], s = SNOW[sk], [sx, sy, ox, oy, w, h, vert] = s;
    const a3 = Math.min(3, amount * 3), k = Math.floor(a3), fr = a3 - k, A = alpha == null ? 1 : alpha;
    const X = Math.round(x) - f[4] + ox, Y = Math.round(y) - f[5] + oy;
    const lv = (i) => (vert ? [sx, sy + i * (h + 1)] : [sx + i * (w + 1), sy]);
    if (k >= 1) { const [u, v] = lv(k - 1); ctx.globalAlpha = A; ctx.drawImage(L, u, v, w, h, X, Y, w, h); }
    if (k < 3 && fr > 0.02) { const [u, v] = lv(k); ctx.globalAlpha = A * fr; ctx.drawImage(L, u, v, w, h, X, Y, w, h); }
    ctx.globalAlpha = 1;
  };
  SP.drawEmit = function (ctx, key, x, y, alpha) {
    const f = F[key]; if (!f || !EMITSET.has(key)) return;
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    const em = f[6] >= 2 ? extPage(f, true) : f[6] ? SP.img.int_emit : SP.img.emit; if (!em) return;
    ctx.drawImage(em, f[0], f[1], f[2], f[3], Math.round(x) - f[4], Math.round(y) - f[5], f[2], f[3]);
    ctx.globalAlpha = 1;
  };
  /** erase a frame's silhouette from a layer (emissive pixels hidden behind something drawn later) */
  SP.eraseFrame = function (ctx, key, x, y) {
    const f = F[key]; if (!f) return;
    const src = f[6] >= 2 ? extPage(f) : f[6] ? SP.img.int_atlas : SP.tinted || SP.img.atlas; if (!src) return;
    ctx.drawImage(src, f[0], f[1], f[2], f[3], Math.round(x) - f[4], Math.round(y) - f[5], f[2], f[3]);
  };
  // ---------- light sprites (pre-rendered once per colour; drawn with 'lighter' into the lightmap) ----------
  const lightCache = new Map();
  SP.lightSprite = function (r, g, b, kind) {
    r |= 0; g |= 0; b |= 0;
    const key = (r << 16) | (g << 8) | b | (kind === "streak" ? 1 << 24 : 0);
    let c = lightCache.get(key);
    if (c) return c;
    c = document.createElement("canvas");
    if (kind === "streak") {                              // vertical reflection streak on wet ground
      c.width = 16; c.height = 64; const x = c.getContext("2d");
      const gr = x.createLinearGradient(0, 0, 0, 64);
      gr.addColorStop(0, `rgba(${r},${g},${b},0.9)`); gr.addColorStop(0.35, `rgba(${r},${g},${b},0.45)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      x.fillStyle = gr; x.beginPath(); x.ellipse(8, 22, 5, 42, 0, 0, Math.PI * 2); x.fill();
    } else {
      c.width = c.height = 64; const x = c.getContext("2d");
      const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(0.4, `rgba(${r},${g},${b},0.42)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    }
    lightCache.set(key, c);
    return c;
  };
  /** integer hash -> 0..1 (deterministic per id/day: lit windows, flicker, weather roll) */
  SP.hash = function (a, b) { let h = Math.imul((a | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(((b | 0) + 0x27d4eb2f) | 0, 0xc2b2ae35); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; return (h >>> 0) / 4294967296; };
  SP.strHash = function (s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  SP.drawFrame = function (ctx, key, x, y, alpha, raw) {
    const f = F[key]; if (!f) return;
    const src = srcOf(f, raw); if (!src) return;
    if (alpha != null && alpha < 0.999) ctx.globalAlpha = alpha;
    ctx.drawImage(src, f[0], f[1], f[2], f[3], Math.round(x) - f[4], Math.round(y) - f[5], f[2], f[3]);
    if (alpha != null && alpha < 0.999) ctx.globalAlpha = 1;
  };
  /** screen rect of a kit frame drawn with its anchor at (x, y) */
  SP.frameRect = function (key, x, y) { const f = F[key]; if (!f) return null; const X = Math.round(x) - f[4], Y = Math.round(y) - f[5]; return { x0: X, y0: Y, x1: X + f[2], y1: Y + f[3] }; };

  // ---------- geometry ----------
  SP.footPoly = function (rect, rot, ox, oy) {
    const a = (rot || 0) * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
    const pts = [[rect[0], rect[1]], [rect[2], rect[1]], [rect[2], rect[3]], [rect[0], rect[3]]];
    return pts.map(([x, y]) => [ox + x * c - y * s, oy + x * s + y * c]);
  };
  SP.rotPt = function (p, rot) {
    const a = (rot || 0) * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
    return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2] || 0];
  };
  /** signed distance from point to convex polygon (negative inside) + closest point */
  SP.polyDist = function (px, py, poly) {
    let inside = true, best = 1e9, bx = 0, by = 0;
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length];
      const ex = x2 - x1, ey = y2 - y1, L = ex * ex + ey * ey;
      const t = SP.clamp(((px - x1) * ex + (py - y1) * ey) / L, 0, 1);
      const qx = x1 + ex * t, qy = y1 + ey * t, d = Math.hypot(px - qx, py - qy);
      if (d < best) { best = d; bx = qx; by = qy; }
      if ((ex * (py - y1) - ey * (px - x1)) < 0) inside = false;
    }
    return { d: inside ? -best : best, x: bx, y: by };
  };
  SP.circlePoly = (cx, cy, r, poly) => SP.polyDist(cx, cy, poly).d < r;
  SP.polyBox = (poly) => {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [x, y] of poly) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    return [x0, y0, x1, y1];
  };
  /** Occlusion order of two vertical prisms on the ground (foot circles / convex footprints) as seen by this camera.
      Screen x depends only on u = x - y, depth only on t = x + y. Prisms whose u-intervals do not overlap can never
      cover each other (returns 0). Otherwise compare their t-ranges on the line u = middle of the overlap: the smaller
      t is nearer the camera. Returns +1 if shape set A is in front, -1 if B is, 0 if no occlusion / touching. */
  function uRange(sh) { if (sh.c) { const u = sh.c[0] - sh.c[1], h = sh.c[2] * Math.SQRT2; return [u - h, u + h]; }
                        let a = 1e9, b = -1e9; for (const [x, y] of sh.p) { a = Math.min(a, x - y); b = Math.max(b, x - y); } return [a, b]; }
  function tRange(sh, u) {
    if (sh.c) { const [cx, cy, r] = sh.c, du = u - (cx - cy), q = 2 * r * r - du * du; if (q < 0) return null; const t = cx + cy, h = Math.sqrt(q); return [t - h, t + h]; }
    let a = 1e9, b = -1e9; const P = sh.p;
    for (let i = 0; i < P.length; i++) {
      const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length], u1 = x1 - y1, u2 = x2 - y2;
      if ((u1 - u) * (u2 - u) > 0) continue;
      const k = Math.abs(u2 - u1) < 1e-9 ? 0 : (u - u1) / (u2 - u1), t1 = x1 + y1, t2 = x2 + y2;
      if (Math.abs(u2 - u1) < 1e-9) { a = Math.min(a, t1, t2); b = Math.max(b, t1, t2); } else { const t = t1 + (t2 - t1) * k; a = Math.min(a, t); b = Math.max(b, t); }
    }
    return a <= b ? [a, b] : null;
  }
  SP.prismOrder = function (A, B) {
    let best = 0, bestOv = 0;
    for (const sa of A) for (const sb of B) {
      const ra = uRange(sa), rb = uRange(sb), lo = Math.max(ra[0], rb[0]), hi = Math.min(ra[1], rb[1]);
      if (hi - lo <= 1e-4) continue;
      const u = (lo + hi) / 2, ta = tRange(sa, u), tb = tRange(sb, u);
      if (!ta || !tb) continue;
      let r = 0;
      if (ta[1] <= tb[0] + 1e-3) r = 1; else if (tb[1] <= ta[0] + 1e-3) r = -1;
      else r = (ta[0] + ta[1]) < (tb[0] + tb[1]) ? 1 : -1;          // interpenetrating (never for audited pairs)
      if (hi - lo > bestOv) { bestOv = hi - lo; best = r; }
    }
    return best;
  };
  SP.rectsOverlap = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
})((window.SP = window.SP || {}));
