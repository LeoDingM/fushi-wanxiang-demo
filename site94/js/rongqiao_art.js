/* 榕桥区 procedural district art (P2 north expansion + P3 榕桥菜市场). Same 45° projection as the kit (32 px/m across,
 * 16 px/m deep, 39.19 px/m up); S faces lit, W faces in shade, 1 px dark outlines, alpha thresholded to hard pixel edges.
 * Sprites are defined in WORLD orientation (rot 0 only; west-facing parts are their own types), painted once at load into
 * atlas slot 2 (SP.img.ext_atlas / ext_emit, frame field [6] = 2) so the big interior atlas does not grow (mobile canvas limits).
 * Pieces are registered at script time (W.load / chunk data need them); frames + masks + shadows appear when SP.load resolves.
 * Usage: RongqiaoArt.define(type, { name, layer, states, variants, geo | geoOf(state), fp, draw(d, state, variant), emit(d, ...) }). */
(function (root) {
  'use strict';
  const KX = 32, KY = 16, PZ = 39.1918, FONT = '"Noto Sans CJK SC","Source Han Sans SC","PingFang SC","Microsoft YaHei","WenQuanYi Zen Hei",sans-serif';
  function rgb(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function shade(hex, f) { const c = rgb(hex).map((v) => Math.max(0, Math.min(255, Math.round(f >= 1 ? v + (255 - v) * (f - 1) : v * f)))); return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join(''); }
  function mix(a, b, t) { const A = rgb(a), B = rgb(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
  /** deterministic rng per sprite */
  function rng(seed) { let a = seed >>> 0 || 1; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  /** painter in world metres relative to the sprite origin */
  function painter(g, ox, oy, seed) {
    const P = (x, y, z) => [ox + (x - y) * KX, oy - (x + y) * KY - (z || 0) * PZ];
    const R = rng(seed || 7);
    function poly(pts, fill, line, lw) { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.strokeStyle = line; g.lineWidth = lw || 1; g.stroke(); } }
    const face = (pts, fill, line, lw) => poly(pts.map((p) => P(p[0], p[1], p[2])), fill, line, lw);
    /** axis-aligned box: W face (x = x0), S face (y = y0), top */
    function box(x0, y0, z0, x1, y1, z1, col, o = {}) {
      const line = o.line === false ? null : o.line || shade(col, 0.55);
      if (!o.noW) face([[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]], o.west || shade(col, 0.8), line);
      if (!o.noS) face([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], o.south || col, line);
      if (!o.noTop) face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], o.top || shade(col, 1.12), line);
    }
    /** filled ground-plane quad at height z */
    const flat = (x0, y0, x1, y1, z, fill, line) => face([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], fill, line);
    function seg(a, b, col, lw) { const p = P(...a), q = P(...b); g.strokeStyle = col; g.lineWidth = lw || 1; g.beginPath(); g.moveTo(Math.round(p[0]) + 0.5, Math.round(p[1]) + 0.5); g.lineTo(Math.round(q[0]) + 0.5, Math.round(q[1]) + 0.5); g.stroke(); }
    function px(x, y, z, col, w, h) { const p = P(x, y, z); g.fillStyle = col; g.fillRect(Math.round(p[0]), Math.round(p[1]), w || 1, h || 1); }
    function disc(x, y, z, r, fill, line) { const c = P(x, y, z); g.beginPath(); g.ellipse(c[0], c[1], r * KX * 1.414, r * KY * 1.414, 0, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); if (line) { g.strokeStyle = line; g.lineWidth = 1; g.stroke(); } }
    /** text painted on a south face (plane y = const, reads toward +x) or a west face (plane x = const, reads toward -y) */
    function text(s, x, y, z, size, col, o = {}) {
      const c = P(x, y, z), skew = o.west ? 0.5 : -0.5; g.save(); g.setTransform(1, skew, 0, 1, Math.round(c[0]), Math.round(c[1]));
      g.font = `${o.weight || 'bold'} ${size}px ${FONT}`; g.textBaseline = 'alphabetic'; g.textAlign = o.align || 'left';
      if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = 2; g.strokeText(s, 0, 0); }
      g.fillStyle = col; g.fillText(s, 0, 0); g.restore();
    }
    /** text width in metres along a face (for centring) */
    function textW(s, size) { g.save(); g.font = `bold ${size}px ${FONT}`; const w = g.measureText(s).width; g.restore(); return w / KX; }
    /** horizontal course lines (bricks / tiles) on a south face */
    function coursesS(x0, x1, y, z0, z1, step, col, bond) {
      for (let z = z0 + step, k = 0; z < z1 - 0.01; z += step, k++) {
        seg([x0, y, z], [x1, y, z], col);
        if (bond) for (let x = x0 + (k % 2 ? bond / 2 : 0); x < x1 - 0.05; x += bond) seg([x, y, z], [x, y, Math.min(z1, z + step)], col);
      }
    }
    function coursesW(x, y0, y1, z0, z1, step, col, bond) {
      for (let z = z0 + step, k = 0; z < z1 - 0.01; z += step, k++) {
        seg([x, y0, z], [x, y1, z], col);
        if (bond) for (let y = y0 + (k % 2 ? bond / 2 : 0); y < y1 - 0.05; y += bond) seg([x, y, z], [x, y, Math.min(z1, z + step)], col);
      }
    }
    /** a heap of small produce pieces filling a tray top (x0..x1, y0..y1 at height z), pal = colours, fill 0..1 */
    function heap(x0, y0, x1, y1, z, pal, fill, opt = {}) {
      const dz = (opt.mound == null ? 0.12 : opt.mound) * fill, step = opt.step || 0.07, sz = opt.size || 2;
      flat(x0, y0, x1, y1, z, shade(pal[0], 0.45));
      const pts = [];
      for (let x = x0 + step / 2; x < x1; x += step) for (let y = y0 + step / 2; y < y1; y += step) {
        if (R() > fill * 1.05) continue;
        const cx = (x - x0) / (x1 - x0) - 0.5, cy = (y - y0) / (y1 - y0) - 0.5, h = dz * (1 - Math.min(1, (cx * cx + cy * cy) * 3));
        pts.push([x + (R() - 0.5) * step * 0.6, y + (R() - 0.5) * step * 0.6, z + 0.02 + Math.max(0, h) + R() * 0.03]);
      }
      pts.sort((a, b) => (b[0] + b[1]) - (a[0] + a[1]));
      for (const [x, y, zz] of pts) { const c = pal[(R() * pal.length) | 0], p = P(x, y, zz), X = Math.round(p[0]), Y = Math.round(p[1]); g.fillStyle = shade(c, 0.62); g.fillRect(X - 1, Y, sz + 1, sz); g.fillStyle = c; g.fillRect(X - 1, Y - 1, sz + 1, sz); if (R() < 0.35) { g.fillStyle = shade(c, 1.35); g.fillRect(X, Y - 1, 1, 1); } }
    }
    /** price tag on a stick / card stuck on a tray front (south face) */
    function tag(x, y, z, col) { box(x, y, z, x + 0.16, y + 0.01, z + 0.09, col || '#f6f1e2', { line: '#5a5242' }); px(x + 0.04, y, z + 0.06, '#c33', 2, 1); px(x + 0.03, y, z + 0.035, '#333', 3, 1); }
    return { P, R, g, poly, face, box, flat, seg, px, disc, text, textW, coursesS, coursesW, heap, tag, shade, mix };
  }
  // ---------------- registry ----------------
  const DEFS = new Map(); let composed = null;
  function geoOf(def, state, variant) { return (def.geoOf ? def.geoOf(state, variant) : null) || def.geo; }
  function boundsOf(geo, pad) {
    const [x0, y0, z0, x1, y1, z1] = geo, xs = [], ys = []; pad = pad == null ? 4 : pad;
    for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) { xs.push((x - y) * KX); ys.push(-(x + y) * KY - z * PZ); }
    return [Math.floor(Math.min(...xs)) - pad, Math.floor(Math.min(...ys)) - pad, Math.ceil(Math.max(...xs)) + pad, Math.ceil(Math.max(...ys)) + pad];
  }
  function pieceOf(type, def) {
    const states = def.states || ['default'], variants = def.variants || ['base'], layer = def.layer || 'sorted', geo = {};
    for (const s of states) geo[s] = { main: geoOf(def, s, 'base').slice() };
    const P = { layer, origin: def.origin || 'center', states: states.slice(), rots: [0], parts: ['main'], variants: variants.slice(), geo, name: def.name || type, rq: 1 };
    if (layer === 'sorted') { P.catcher = def.shadow === false ? null : 'ground'; P.footprint = (def.fp || []).map((r) => r.slice()); P.fadeable = def.fadeable !== false; if (def.fpStates) P.footprint_states = def.fpStates; if (def.noline) P.noline = true; }
    else P.catcher = null;
    if (def.light) P.light = def.light.slice();
    if (def.piece) Object.assign(P, JSON.parse(JSON.stringify(def.piece)));   // E1v: kit-style sort hints (z_order, sort_box, sort_line, ...)
    return P;
  }
  function define(type, def) {
    DEFS.set(type, def);
    const K = root.SP && root.SP.K; if (K) K.pieces[type] = pieceOf(type, def);
    return type;
  }
  function threshold(g, x, y, w, h, keepSoft) { const im = g.getImageData(x, y, w, h), a = im.data; if (!a || !a.length) return; for (let i = 3; i < a.length; i += 4) a[i] = keepSoft ? (a[i] < 24 ? 0 : a[i]) : a[i] >= 110 ? 255 : 0; g.putImageData(im, x, y); }
  function mask(g, x, y, w, h) {
    const cols = Math.ceil(w / 4), rows = Math.ceil(h / 4), a = g.getImageData(x, y, w, h).data, bytes = new Uint8Array(Math.ceil(cols * rows / 8));
    if (a && a.length >= w * h * 4) for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { let hit = false; for (let dy = 0; dy < 4 && !hit; dy++) for (let dx = 0; dx < 4; dx++) { const xx = c * 4 + dx, yy = r * 4 + dy; if (xx < w && yy < h && a[(yy * w + xx) * 4 + 3] > 0) { hit = true; break; } } if (hit) { const i = r * cols + c; bytes[i >> 3] |= 1 << (7 - (i & 7)); } }
    let s = ''; for (const b of bytes) s += String.fromCharCode(b); return [cols, rows, (typeof btoa === 'function' ? btoa : root.btoa)(s)];
  }
  /** ground shadow: the footprint box swept north-east by its height */
  const SUN = [0.11, 1.06];          // kit sun_world (-0.08,-0.72,0.69): shadows fall north, a little east
  function shadowPoly(geo) {
    const [x0, y0, , x1, y1, z1] = geo, h = Math.min(z1, 6), dx = SUN[0] * h, dy = SUN[1] * h, pts = [];
    for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) { pts.push([x, y]); pts.push([x + dx, y + dy]); }
    const hull = (p) => { p = p.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = []; for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); } for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); } up.pop(); lo.pop(); return lo.concat(up); };
    return hull(pts);
  }
  /* variety pass (E1v): extra VARIANTS painted for an existing kit piece (f_wall, f_window, f_balcony, f_ac, b_roof_*).
   * The object keeps its kit type (save identity is [id,type,x,y,state]; the variant is not part of it), so old base blocks can
   * be re-skinned without touching the world contract. def: { variants, states, rots, geo(rot, state) -> paint box, draw(d, st, v, rot) } */
  const SKINS = new Map();
  function skin(type, def) { SKINS.set(type + '#' + SKINS.size, Object.assign({ type }, def)); addSkinVariants(); return type; }
  function addSkinVariants() {
    const K = root.SP && root.SP.K; if (!K) return;
    for (const d of SKINS.values()) { const P = K.pieces[d.type]; if (!P) continue; P.variants = P.variants || ['base']; for (const v of d.variants) if (!P.variants.includes(v)) P.variants.push(v); }
  }
  /** shadow frame item: one ground polygon or (def.shadowOf) a list of polygons, world metres relative to the origin */
  function shadowItem(sp, base) {
    const polys = Array.isArray(sp[0] && sp[0][0]) ? sp : [sp], all = [].concat(...polys);
    const xs = all.map(([x, y]) => (x - y) * KX), ys = all.map(([x, y]) => -(x + y) * KY), sb = [Math.floor(Math.min(...xs)) - 2, Math.floor(Math.min(...ys)) - 2, Math.ceil(Math.max(...xs)) + 2, Math.ceil(Math.max(...ys)) + 2];
    return Object.assign({ shadow: polys, w: sb[2] - sb[0], h: sb[3] - sb[1], ox: -sb[0], oy: -sb[1] }, base);
  }
  /* atlas budget (E4e, 2026-10-18): purely static pieces — a def / skin with prune: true, or a type in PRUNE — get frames only for
   * the variants some world / chunk / scene object actually uses (all states and rots of a used variant are kept, so runtime state
   * changes still find their frame). Pieces that can be spawned at runtime are never pruned. */
  const PRUNE = /^rq_(v_roof|x_cgate|mk_wall_|roof_b|m3_)/;
  function usedVariants() {
    const D = root.SCENE_DATA, SPx = root.SP, used = new Set(), add = (o) => { if (o && o.type) used.add(o.type + '/' + (o.variant || 'base')); };
    if (!D) return null;
    (D.objects || []).forEach(add); for (const c of Object.values(root.SCENE_CHUNKS || {})) (c && c.objects || []).forEach(add);
    if (SPx && SPx.scenes) for (const sc of Object.values(SPx.scenes)) (sc && sc.objects || []).forEach(add);
    return used;
  }
  function items(used) {
    const out = [], keep = (type, v, def) => !used || !(def.prune || PRUNE.test(type)) || used.has(type + '/' + v);
    for (const d of SKINS.values()) for (const st of d.states) for (const v of d.variants) for (const rot of d.rots) {
      if (!keep(d.type, v, d)) continue;
      const geo = d.geo(rot, st, v), b = boundsOf(geo, d.pad == null ? 6 : d.pad), def = { draw: (p) => d.draw(p, st, v, rot), emit: d.emit && ((p) => d.emit(p, st, v, rot)), soft: d.soft };
      out.push({ type: d.type, def, st, v, geo, w: b[2] - b[0], h: b[3] - b[1], ox: -b[0], oy: -b[1], key: `${d.type}/${v}/main/${st}/${rot}` });
      if (d.shadowOf) out.push(shadowItem(d.shadowOf(rot, st, v), { type: d.type, def, st, v, key: `${d.type}/${v}/main/${st}/${rot}#shadow` }));   // e-bikes: custom silhouettes
    }
    for (const [type, def] of DEFS) for (const st of def.states || ['default']) for (const v of def.variants || ['base']) {
      if (!keep(type, v, def)) continue;
      const geo = geoOf(def, st, v), b = boundsOf(def.paintBox || geo, def.pad);
      out.push({ type, def, st, v, geo, w: b[2] - b[0], h: b[3] - b[1], ox: -b[0], oy: -b[1], key: `${type}/${v}/main/${st}/0` });
      if ((def.layer || 'sorted') === 'sorted' && def.shadow !== false && !def.noShadow) {
        out.push(shadowItem(def.shadowOf ? def.shadowOf(st, v) : shadowPoly(geo), { type, def, st, v, key: `${type}/${v}/main/${st}/0#shadow` }));
      }
    }
    return out;
  }
  /** paint every registered sprite; returns { sheet, emitSheet, frames, masks, emit } */
  function paint(makeCanvas, only, used) {
    /* P3b: 2560 wide; E1: sprites pack into pages of at most MAXH px (mobile canvas limit 4096) -> slot 2 = page 0, slot 3+ = page 1+ */
    const list = items(used).filter((it) => !only || only.includes(it.type)), WIDTH = 2560, MAXH = 4000; let x = 0, y = 0, rowH = 0, page = 0;
    const heights = [];
    list.sort((a, b) => (!!b.def.emit - !!a.def.emit) || b.h - a.h);   // E1v: emitting sprites pack first, so only the first page(s) need an emit sheet
    for (const it of list) {
      if (x + it.w > WIDTH) { x = 0; y += rowH + 2; rowH = 0; }
      if (y + it.h + 2 > MAXH) { heights[page] = y; page++; x = 0; y = 0; rowH = 0; }
      it.x = x; it.y = y; it.page = page; x += it.w + 2; rowH = Math.max(rowH, it.h);
    }
    heights[page] = y + rowH + 2;
    const sheets = heights.map((h) => makeCanvas(WIDTH, h)), gs = sheets.map((c) => c.getContext('2d')), emitSheets = [], egs = [], frames = [], masks = {}, emit = [];
    for (const it of list) {
      const g = gs[it.page];
      g.save(); g.beginPath(); g.rect(it.x, it.y, it.w, it.h); g.clip();
      if (it.shadow) {
        g.fillStyle = 'rgba(0,0,0,1)'; for (const sp of it.shadow) { g.beginPath(); sp.forEach(([sx, sy], i) => { const X = it.x + it.ox + (sx - sy) * KX, Y = it.y + it.oy - (sx + sy) * KY; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath(); g.fill(); } g.restore();
        frames.push({ key: it.key, x: it.x, y: it.y, w: it.w, h: it.h, ox: it.ox, oy: it.oy, page: it.page }); continue;
      }
      const d = painter(g, it.x + it.ox, it.y + it.oy, hashStr(it.key));
      it.def.draw(d, it.st, it.v); g.restore();
      threshold(g, it.x, it.y, it.w, it.h, it.def.soft);
      if (it.def.emit) {
        if (!emitSheets[it.page]) { emitSheets[it.page] = makeCanvas(WIDTH, heights[it.page]); egs[it.page] = emitSheets[it.page].getContext('2d'); }
        const eg = egs[it.page];
        eg.save(); eg.beginPath(); eg.rect(it.x, it.y, it.w, it.h); eg.clip(); const e = painter(eg, it.x + it.ox, it.y + it.oy, hashStr(it.key) ^ 99);
        if (it.def.emit(e, it.st, it.v) !== false) emit.push(it.key); eg.restore();
      }
      frames.push({ key: it.key, x: it.x, y: it.y, w: it.w, h: it.h, ox: it.ox, oy: it.oy, page: it.page }); masks[it.key] = mask(g, it.x, it.y, it.w, it.h);
    }
    return { sheet: sheets[0], emitSheet: emitSheets[0] || null, sheets, emitSheets, frames, masks, emit, height: Math.max(...heights), heights, pages: sheets.length };
  }
  const api = { define, skin, SKINS, DEFS, painter, paint, shade, mix, rng, hashStr, boundsOf, shadowPoly, items, usedVariants, PRUNE, KX, KY, PZ, FONT, get composed() { return composed; } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RongqiaoArt = api;
  const SP = root.SP; if (!SP || !SP.K) return;
  for (const [type, def] of DEFS) SP.K.pieces[type] = pieceOf(type, def);
  addSkinVariants();
  /** called from the SP.load chain (after every other atlas composer); safe with stub canvases (node VM tests) */
  function compose() {
    const doc = root.document; if (!doc || !doc.createElement) return null;
    const t0 = (root.performance && root.performance.now && root.performance.now()) || 0;
    const out = paint((w, h) => { const c = doc.createElement('canvas'); c.width = w; c.height = h; return c; }, null, usedVariants());
    const F = SP.K.frames; addSkinVariants();
    for (const f of out.frames) F[f.key] = [f.x, f.y, f.w, f.h, f.ox, f.oy, 2 + (f.page || 0)];
    Object.assign(SP.K.masks, out.masks);
    SP.img.ext_atlas = out.sheet; SP.img.ext_emit = out.emitSheet || doc.createElement('canvas');
    SP.img.ext_pages = out.sheets; SP.img.ext_emits = out.sheets.map((c, i) => (i ? out.emitSheets[i] || doc.createElement('canvas') : SP.img.ext_emit));
    if (SP.addEmit) SP.addEmit(out.emit);
    composed = { frames: out.frames.length, pages: out.pages, heights: out.heights, emit: out.emit.length, height: out.height, ms: Math.round((((root.performance && root.performance.now && root.performance.now()) || 0) - t0)) };
    SP.rongqiaoArt = composed; return composed;
  }
  api.compose = compose;
  const load0 = SP.load;
  if (typeof load0 === 'function') SP.load = function () { return Promise.resolve(load0.apply(this, arguments)).then((r) => { try { compose(); } catch (e) { console.warn('rongqiao art', e); } return r; }); };
})(typeof window !== 'undefined' ? window : globalThis);
