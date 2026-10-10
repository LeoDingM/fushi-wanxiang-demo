/* 浮世万象 · scene-proto · core: projection, kit atlas (manifest + emit + 3 snow atlases), masks, light sprites, helpers.
   World units are metres (x east, y north, z up). Screen px (y down) = the fixed sprite camera of 李默 / the kit:
     sx = x * 48        sy = -(y * 22.5 + z * 42.39)        (2 m ground chunk = 96 x 45 px) */
(function (SP) {
  "use strict";
  const K = window.KIT_MANIFEST;
  const PJ = K.projection;
  SP.PX = PJ.px_per_m_x; SP.PY = PJ.px_per_m_y; SP.PZ = PJ.px_per_m_z;
  SP.sx = (x) => x * SP.PX;
  SP.sy = (y, z) => -(y * SP.PY + (z || 0) * SP.PZ);
  SP.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  SP.lerp = (a, b, t) => a + (b - a) * t;
  SP.smooth = (t) => t * t * (3 - 2 * t);
  SP.K = K;
  // deterministic RNG (mulberry32) so playtests / GIF captures repeat
  SP.rng = function (seed) {
    let a = seed >>> 0;
    return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  SP.rand = SP.rng(20261010);

  // ---------- images ----------
  SP.img = {};
  SP.load = function (list) {
    return Promise.all(list.map(([k, src]) => new Promise((res) => {
      const im = new Image(); im.onload = () => res(); im.onerror = () => { console.error("missing", src); res(); }; im.src = src; SP.img[k] = im;
    })));
  };

  // ---------- frames ----------
  const F = K.frames;
  SP.frame = (key) => F[key];
  /** piece frame key: piece/variant/part/state/rot (falls back to base variant / first state / rot 0) */
  SP.frameKey = function (piece, variant, part, state, rot) {
    const P = K.pieces[piece];
    if (!P) return null;
    const st = P.states.includes(state) ? state : P.states[0];
    const r = P.rots.includes(rot) ? rot : P.rots[0];
    let k = `${piece}/${variant || "base"}/${part}/${st}/${r}`;
    if (!F[k]) k = `${piece}/base/${part}/${st}/${r}`;
    return F[k] ? k : null;
  };
  // fade masks: [cols, rows, base64 packbits] of opaque 4 px cells
  const maskCache = {};
  SP.mask = function (key) {
    if (maskCache[key] !== undefined) return maskCache[key];
    const m = K.masks[key];
    if (!m) return (maskCache[key] = null);
    const [cols, rows, b64] = m, bin = atob(b64), bits = new Uint8Array(cols * rows);
    for (let i = 0; i < cols * rows; i++) bits[i] = (bin.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
    return (maskCache[key] = { cols, rows, bits });
  };
  /** number of opaque mask cells of frame `key` drawn at top-left (dx,dy) inside screen rect r */
  SP.maskHits = function (key, dx, dy, r) {
    const m = SP.mask(key), C = K.mask_cell;
    if (!m) return 0;
    const c0 = Math.max(0, Math.floor((r.x0 - dx) / C)), c1 = Math.min(m.cols - 1, Math.floor((r.x1 - dx) / C));
    const r0 = Math.max(0, Math.floor((r.y0 - dy) / C)), r1 = Math.min(m.rows - 1, Math.floor((r.y1 - dy) / C));
    let n = 0;
    for (let y = r0; y <= r1; y++) for (let x = c0; x <= c1; x++) n += m.bits[y * m.cols + x];
    return n;
  };

  // ---------- drawing: the kit atlas is drawn untinted; light comes from the lightmap (render.js) ----------
  SP.snowAmt = 0;                                           // 0..1 object snow cover (clock.js)
  const SNOWSET = new Set(K.snow || []), EMITSET = new Set(K.emit || []);
  SP.hasSnow = (key) => SNOWSET.has(key);
  SP.hasEmit = (key) => EMITSET.has(key);
  /** draw a kit frame with its anchor at screen (x, y) (rounded to whole pixels) */
  SP.drawFrame = function (ctx, key, x, y, alpha) {
    const f = F[key]; if (!f) return;
    const a = alpha != null && alpha < 0.999;
    if (a) ctx.globalAlpha = alpha;
    ctx.drawImage(SP.img.atlas, f[0], f[1], f[2], f[3], Math.round(x) - f[4], Math.round(y) - f[5], f[2], f[3]);
    if (a) ctx.globalAlpha = 1;
  };
  /** snow overlay of a frame: 3 cumulative coverage atlases, crossfaded by amount (0..1) */
  const SR = K.snow_rects || {};
  SP.drawSnow = function (ctx, key, x, y, amount, alpha) {
    if (amount <= 0.01 || !SNOWSET.has(key)) return;
    const f = F[key], r = SR[key] || [0, 0, f[2], f[3]], L = SP.img.snow, a3 = Math.min(3, amount * 3), k = Math.floor(a3), fr = a3 - k, A = alpha == null ? 1 : alpha;
    const X = Math.round(x) - f[4] + r[0], Y = Math.round(y) - f[5] + r[1], sx = f[0] + r[0], sy = f[1] + r[1];   // only the snowy sub-rect
    if (k >= 1) { ctx.globalAlpha = A; ctx.drawImage(L[k - 1], sx, sy, r[2], r[3], X, Y, r[2], r[3]); }
    if (k < 3 && fr > 0.02) { ctx.globalAlpha = A * fr; ctx.drawImage(L[k], sx, sy, r[2], r[3], X, Y, r[2], r[3]); }
    ctx.globalAlpha = 1;
  };
  /** emissive pixels of a frame (lit windows, lamp glass, vending panel...) */
  SP.drawEmit = function (ctx, key, x, y, alpha, scale, ox, oy) {
    const f = F[key]; if (!f || !EMITSET.has(key)) return;
    const s = scale || 1;
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.drawImage(SP.img.emit, f[0], f[1], f[2], f[3], (Math.round(x) - f[4]) * s - (ox || 0), (Math.round(y) - f[5]) * s - (oy || 0), f[2] * s, f[3] * s);
    ctx.globalAlpha = 1;
  };
  // ---------- light sprites (pre-rendered once per colour; drawn with 'lighter' into the lightmap) ----------
  const lightCache = new Map();
  SP.lightSprite = function (r, g, b, kind) {
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
  /** integer hash -> 0..1 (deterministic per id/day: lit windows, flicker, trip jitter) */
  SP.hash = function (a, b) { let h = Math.imul((a | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(((b | 0) + 0x27d4eb2f) | 0, 0xc2b2ae35); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; return (h >>> 0) / 4294967296; };
  SP.strHash = function (s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  // ---------- geometry ----------
  /** rect [x0,y0,x1,y1] in piece space rotated by rot*45deg about the origin, then translated -> polygon */
  SP.footPoly = function (rect, rot, ox, oy) {
    const a = (rot || 0) * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
    const pts = [[rect[0], rect[1]], [rect[2], rect[1]], [rect[2], rect[3]], [rect[0], rect[3]]];
    return pts.map(([x, y]) => [ox + x * c - y * s, oy + x * s + y * c]);
  };
  SP.rotPt = function (p, rot) {
    const a = (rot || 0) * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
    return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2] || 0];
  };
  /** circle (cx,cy,r) vs convex polygon */
  SP.circlePoly = function (cx, cy, r, poly) {
    let inside = true;
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length];
      const ex = x2 - x1, ey = y2 - y1, L = ex * ex + ey * ey;
      let t = ((cx - x1) * ex + (cy - y1) * ey) / L; t = SP.clamp(t, 0, 1);
      const dx = cx - (x1 + ex * t), dy = cy - (y1 + ey * t);
      if (dx * dx + dy * dy < r * r) return true;
      if ((ex * (cy - y1) - ey * (cx - x1)) < 0) inside = false;
    }
    // polygon wound CCW (y north): inside when every cross product >= 0
    return inside;
  };
  SP.polyBox = (poly) => {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [x, y] of poly) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    return [x0, y0, x1, y1];
  };
})((window.SP = window.SP || {}));
