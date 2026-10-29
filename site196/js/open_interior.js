/* Seamless open interiors (district plan §11, P1). Presentation-only cutaway for street buildings:
 *   - cutaway groups: each object may carry o.cutaway = { b: buildingId, role } with role one of
 *       roof | near | far | sign | interior | light
 *   - roof hide: roof pieces fade out in 4 quantised steps and are skipped once fully open
 *   - near walls drop to a ~1.1 m cut frame (sprite clipped to the truncated sort box + a wall-top cap)
 *   - partial rebake: a state change marks only the building's own screen rect dirty (Ly.dirty), never Ly.reset
 *   - roof rain mask: screen-space rain is clipped out of an open building's prism; no splashes / puddles indoors
 *   - night interior lights: warm point lights (lightmap) + lamp glow drawn into the emissive layer
 * Colliders, footprints, doors and pathing are never touched; no save fields are added (old saves load unchanged).
 * Storefront glass in interior scenes reuses the same cut frame while the fade group is faded (audit A11). */
(function (root) {
  'use strict';
  const CUT = 1.1, STEPS = 4, RATE = 1 / 0.28, ENTER = 0.45, LEAVE = 0.75, LOD_ZOOM = 0.3;
  const LIMIT = { objectsPerBuilding: 600, actorsInside: 40, rebakesPerTransition: STEPS + 1, buildings: 64 };
  const ROLES = ['roof', 'near', 'far', 'sign', 'interior', 'light'];
  // ---------------- pure geometry (unit-tested in node) ----------------
  function hull(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (p.length < 3) return p;
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    up.pop(); lo.pop(); return lo.concat(up);
  }
  const scr = (x, y, z) => [(x - y) * 32, -((x + y) * 16 + (z || 0) * 39.1918)];
  /** screen polygon that keeps the part of a sprite below z = cut inside its (slightly padded) sort box */
  function cutClip(box, cut, pad, drop) {
    pad = pad == null ? 0.05 : pad; drop = drop == null ? 24 : drop;
    const zc = Math.min(box.z1, (box.z0 || 0) + cut), x0 = box.x0 - pad, x1 = box.x1 + pad, y0 = box.y0 - pad, y1 = box.y1 + pad, P = [];
    for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) { P.push(scr(x, y, zc)); const b = scr(x, y, box.z0 || 0); P.push([b[0], b[1] + drop]); }
    return hull(P);
  }
  /** wall-top cap (top face of the truncated box), thin walls get a readable minimum thickness */
  function capPoly(box, cut, min) {
    min = min || 0.12; const zc = Math.min(box.z1, (box.z0 || 0) + cut); let { x0, x1, y0, y1 } = box;
    if (x1 - x0 >= y1 - y0) { if (y1 - y0 < min) y1 = y0 + min; } else if (x1 - x0 < min) x1 = x0 + min;
    return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => scr(x, y, zc));
  }
  const inRect = (r, x, y, m) => x >= r[0] - m && x <= r[2] + m && y >= r[1] - m && y <= r[3] + m;
  const quant = (v) => Math.round(Math.max(0, Math.min(1, v)) * STEPS) / STEPS;
  /** one tick of a building's open level: hysteresis on the foot point, quantised level, zoom LOD */
  function step(B, px, py, dt, zoom) {
    const was = B.inside; B.inside = px != null && inRect(B.rect, px, py, was ? LEAVE : ENTER);
    const target = B.inside && !(zoom != null && zoom < LOD_ZOOM) ? 1 : 0;
    B.raw = B.raw == null ? 0 : B.raw; B.raw += Math.sign(target - B.raw) * Math.min(Math.abs(target - B.raw), RATE * (dt || 0));
    const q = quant(B.raw), changed = q !== B.level; B.level = q; return changed;
  }
  function validateSpec(s, objects) {
    const err = [];
    if (!s || typeof s.id !== 'string' || !s.id) err.push('id');
    if (!Array.isArray(s?.rect) || s.rect.length !== 4 || !(s.rect[2] > s.rect[0] && s.rect[3] > s.rect[1])) err.push('rect');
    if (!Array.isArray(s?.doors) || !s.doors.length) err.push('doors');
    const mine = (objects || []).filter((o) => o.cutaway && o.cutaway.b === s?.id);
    if (mine.some((o) => !ROLES.includes(o.cutaway.role))) err.push('role');
    if (mine.length > LIMIT.objectsPerBuilding) err.push('budget:objects');
    if (!mine.some((o) => o.cutaway.role === 'roof')) err.push('roof');
    return err;
  }
  const api = { CUT, STEPS, LIMIT, ROLES, LOD_ZOOM, ENTER, LEAVE, hull, scr, cutClip, capPoly, inRect, quant, step, validateSpec };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.OpenInteriorCore = api;
  const SP = root.SP; if (!SP || !SP.world) return;
  const W = SP.world, buildings = new Map(), stats = { dirty: 0, dirtyRects: [], transitions: 0, lastRect: null, emitLamps: 0 };
  const FADE = '@fade';           // pseudo building: interior-scene storefront glass, cut while its fade group is faded
  function path(ctx, P) { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); }
  function capColour(o) { return /front|glass/.test(o.type) ? ['#cfd8d4', '#53625f'] : /^i_|modern_int/.test(o.type) ? ['#ddd6c8', '#5d5850'] : ['#c9bfae', '#4e4840']; }
  /** a wall's cut box: its sort box limited to a band around the wall plane (shop modules carry deep awning / bay boxes) */
  function cutBox(d) {
    const b0 = d.box || W.sortBox(d.o, d.part); if (!b0) return null; const o = d.o, b = { ...b0 };
    if ((o.rot || 0) % 4 === 0) { b.y0 = Math.max(b.y0, o.y - 0.35); b.y1 = Math.min(b.y1, o.y + 0.4); }
    else { b.x0 = Math.max(b.x0, o.x - 0.4); b.x1 = Math.min(b.x1, o.x + 0.35); }
    if (b.x1 <= b.x0 || b.y1 <= b.y0) return b0; return b;
  }
  function drawCut(ctx, d) {
    const b = cutBox(d); if (!b) return false;
    ctx.save(); path(ctx, cutClip(b, CUT)); ctx.clip(); SP.drawFrame(ctx, d.key, d.X, d.Y, 1); ctx.restore();
    if (b.z1 - (b.z0 || 0) > CUT + 0.05) {             // cap only where something was actually cut away
      const [fill, edge] = capColour(d.o), P = capPoly(b, CUT);
      ctx.save(); ctx.globalAlpha = 1; ctx.fillStyle = fill; path(ctx, P); ctx.fill();
      ctx.strokeStyle = edge; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); ctx.lineTo(P[1][0], P[1][1]); ctx.moveTo(P[0][0], P[0][1]); ctx.lineTo(P[3][0], P[3][1]); ctx.stroke(); ctx.restore();
    }
    return true;
  }
  function levelOf(o) {
    const c = o.cutaway; if (!c) return 0;
    if (c.b === FADE) return null;
    const B = buildings.get(c.b); return B ? B.level : 0;
  }
  /** layers.js drawStatic hook: return true when the object was drawn (or deliberately skipped) here */
  function drawStatic(ctx, d, a) {
    const c = d.o.cutaway; if (!c) return false;
    if (c.b === FADE) return a < 1 ? drawCut(ctx, d) : false;
    const L = levelOf(d.o);
    switch (c.role) {
      case 'roof': if (L <= 0) return false; if (L < 1) SP.drawFrame(ctx, d.key, d.X, d.Y, a * (1 - L)); return true;
      case 'near': if (L <= 0) return false; drawCut(ctx, d); if (L < 1) SP.drawFrame(ctx, d.key, d.X, d.Y, a * (1 - L)); return true;
      case 'sign': if (L <= 0) return false; SP.drawFrame(ctx, d.key, d.X, d.Y, a * (1 - 0.6 * L)); return true;
      case 'interior': case 'light': return L <= 0;          // LOD: furniture is not baked while the roof is closed
      default: return false;
    }
  }
  /** layers.js emitSeq hook: 0 draw normally, 1 skip (hidden), 2 clip to the cut frame */
  function emitMode(d) {
    const c = d.o.cutaway; if (!c) return 0;
    if (c.b === FADE) return Layers().alpha(d) < 1 ? 2 : 0;
    const L = levelOf(d.o);
    if (c.role === 'roof') return L >= 1 ? 1 : 0;
    if (c.role === 'near') return L > 0 ? 2 : 0;
    if (c.role === 'interior' || c.role === 'light') return L <= 0 ? 1 : 0;
    return 0;
  }
  function clip(ctx, d) { const b = cutBox(d); if (b) { path(ctx, cutClip(b, CUT)); ctx.clip(); } }
  const Layers = () => SP.layers;
  function screenRect(B) {
    let r = null;
    for (const o of W.objects) {
      if (!o.cutaway || o.cutaway.b !== B.id) continue;
      for (const part of W.piece(o).parts) {
        const k = SP.frameKey(o.type, W.variant(o), part, W.shownState(o), o.rot), q = SP.frameRect(k, SP.sx(o.x, o.y), SP.sy(o.x, o.y, o.z || 0)); if (!q) continue;
        r = r ? { x0: Math.min(r.x0, q.x0), y0: Math.min(r.y0, q.y0), x1: Math.max(r.x1, q.x1), y1: Math.max(r.y1, q.y1) } : { ...q };
      }
    }
    return r;
  }
  function register(spec) {
    const err = validateSpec(spec, W.objects); if (err.length) throw Error('open interior ' + (spec && spec.id) + ': ' + err.join(','));
    if (buildings.size >= LIMIT.buildings && !buildings.has(spec.id)) throw Error('open interior budget: buildings');
    const B = { id: spec.id, rect: spec.rect.slice(), doors: spec.doors.map((d) => ({ ...d })), wallH: spec.wallH || 2.8, lights: (spec.lights || []).map((l) => l.slice()), level: 0, raw: 0, inside: false, rebakes: 0, name: spec.name || spec.id };
    buildings.set(B.id, B);
    if (Array.isArray(W.puddles)) W.puddles = W.puddles.filter((p) => !inRect(B.rect, p.x, p.y, 0.2));     // roofed: no puddles indoors
    B.rectPx = screenRect(B); return B;
  }
  function covered(x, y) { for (const B of buildings.values()) if (inRect(B.rect, x, y, 0)) return B; return null; }
  function update(player, dt, zoom) {
    if (W.interior || !buildings.size) return;
    for (const B of buildings.values()) {
      const before = B.level;
      if (!step(B, player ? player.x : null, player ? player.y : null, dt, zoom)) continue;
      if ((before === 0) !== (B.level === 0) || B.level === 1 || before === 1) stats.transitions++;
      B.rectPx = B.rectPx || screenRect(B); if (!B.rectPx) continue;
      Layers().dirty(B.rectPx, 'o', 2); B.rebakes++; stats.dirty++; stats.lastRect = B.rectPx; stats.dirtyRects.push(B.rectPx); if (stats.dirtyRects.length > 32) stats.dirtyRects.shift();
    }
  }
  function openList() { return [...buildings.values()].filter((B) => B.level > 0); }
  function lampPos(l) { return [l[0], l[1], l[2] == null ? 2.5 : l[2]]; }
  // ---- night interior lights: warm point lights for the lightmap
  const E = SP.env, WARM = [255, 214, 150];
  if (E && E.lights) {
    const lights0 = E.lights; E.lights = function (view, zoom) {
      const out = lights0.apply(this, arguments); if (W.interior) return out;
      const n = E.night || 0; if (n <= 0.01) return out;
      for (const B of openList()) for (const l of B.lights) { const [x, y, z] = lampPos(l); out.push({ x, y, z, r: l[3] || 3.2, c: WARM, a: 0.9 * n * B.level, flat: false, refl: false }); out.push({ x, y, z: 0, r: (l[3] || 3.2) * 0.8, c: WARM, a: 0.55 * n * B.level, flat: true }); }
      return out;
    };
  }
  /** emissive layer: lamp glow for open buildings (layers.js calls this after the emit sequence) */
  function drawEmit(ex, view) {
    let n = 0; if (W.interior) return 0;
    for (const B of openList()) for (const l of B.lights) {
      const [x, y, z] = lampPos(l), X = SP.sx(x, y), Y = SP.sy(x, y, z);
      if (view && (X < view.x0 - 40 || X > view.x1 + 40 || Y < view.y0 - 40 || Y > view.y1 + 40)) continue;
      ex.save(); ex.globalAlpha = B.level; ex.globalCompositeOperation = 'lighter';
      const s = SP.lightSprite ? SP.lightSprite(255, 220, 160) : null; if (s) ex.drawImage(s, X - 14, Y - 14, 28, 28);
      ex.fillStyle = '#fff3d0'; ex.fillRect(Math.round(X) - 3, Math.round(Y) - 1, 6, 2); ex.restore(); n++;
    }
    stats.emitLamps = n; return n;
  }
  // ---- roof rain mask: screen-space rain clipped out of open buildings (closed roofs are rained on, as outdoors)
  function prismScreen(B, cx, cy, z) {
    const [x0, y0, x1, y1] = B.rect, P = [];
    for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) for (const h of [0, B.wallH]) { const s = scr(x, y, h); P.push([(s[0] - cx) * z, (s[1] - cy) * z]); }
    return hull(P);
  }
  if (E && E.drawWeather) {
    const weather0 = E.drawWeather; E.drawWeather = function (ctx, w, h, camX, camY, zoom) {
      const open = W.interior ? [] : openList(); if (!open.length) return weather0.apply(this, arguments);
      const cx = Math.round(camX * zoom) / zoom, cy = Math.round(camY * zoom) / zoom;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.rect(0, 0, w, h);
      for (const B of open) { const P = prismScreen(B, cx, cy, zoom); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); }
      ctx.clip('evenodd'); try { return weather0.apply(this, arguments); } finally { ctx.restore(); }
    };
  }
  // ---- A11: interior-scene storefront glass uses the cut frame while faded (no translucent header strip)
  const STOREFRONT = /^(st_front13|st_front145|st_frontdoor|community_front13|community_front145|community_frontdoor)$/;
  function tagStorefronts() {
    if (!W.interior) return 0; let n = 0; const fronts = [];
    for (const o of W.objects) if (!o.cutaway && (o.fade_group === 'storefront' || STOREFRONT.test(o.type))) { o.cutaway = { b: FADE, role: 'near' }; fronts.push(o); n++; }
    // a plain door standing in the storefront line (e.g. the barber exit) is cut with it, never left full height
    if (fronts.length) { const y = Math.min(...fronts.map((o) => o.y)); for (const o of W.objects) if (!o.cutaway && o.type === 'i_door' && !(o.rot % 4) && Math.abs(o.y - y) < 0.1) { o.cutaway = { b: FADE, role: 'near' }; if (!o.fade_group) o.fade_group = fronts[0].fade_group || null; n++; } }
    return n;
  }
  const load0 = W.load; W.load = function (data) { if (!(data && data.interior)) buildings.clear(); const r = load0.apply(this, arguments); tagStorefronts(); return r; };
  function budget() {
    let objects = 0, max = 0; const per = {};
    for (const o of W.objects) if (o.cutaway && o.cutaway.b !== FADE) { objects++; per[o.cutaway.b] = (per[o.cutaway.b] || 0) + 1; }
    for (const k in per) max = Math.max(max, per[k]);
    const actorsInside = (SP.actors?.list || []).filter((a) => !a.hidden && covered(a.x, a.y)).length;
    const maxRebakes = Math.max(0, ...[...buildings.values()].map((B) => B.rebakes));
    return { buildings: buildings.size, objects, maxPerBuilding: max, actorsInside, open: openList().length, ok: max <= LIMIT.objectsPerBuilding && actorsInside <= LIMIT.actorsInside && buildings.size <= LIMIT.buildings, limit: LIMIT, maxRebakes };
  }
  SP.openInterior = Object.assign(Object.create(api), { buildings, stats, register, update, drawStatic, emitMode, clip, cutBox, drawEmit, levelOf, covered, budget, tagStorefronts, screenRect, FADE,
    get: (id) => buildings.get(id), unregister: (id) => buildings.delete(id) });
})(typeof window !== 'undefined' ? window : globalThis);
