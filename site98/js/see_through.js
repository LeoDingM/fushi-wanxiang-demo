/* 【Leo已定】 A10 street occlusion drawing (state lives in world.js W.updateFade -> W.seeThrough):
 *   (1) occluders between camera and player get a circular, feather-edged fully transparent hole; outside it they stay intact
 *   (2) inside the hole, the occluding building's ground footprint is outlined over a faint shadow (no wireframe ghost)
 *   (3) the street seen through the hole is lifted slightly, and occluded player / NPCs get a thin outline.
 * Only the player's region is repainted per frame, so the hole costs no tile rebake at all. */
(function (root) {
  'use strict';
  const SP = root.SP; if (!SP || !SP.world) return;
  const W = SP.world, doc = root.document;
  const scratch = doc.createElement('canvas'), sx = scratch.getContext('2d');
  const ring = doc.createElement('canvas'), rx = ring.getContext('2d');
  const stats = { holed: 0, outlines: 0, footprints: 0 };
  const ST = () => W.seeThrough;
  const active = () => { const s = ST(); return !!(s && s.k > 0 && W.seeThroughOn && W.seeThroughOn()); };
  const holed = (d) => { const s = ST(); return !!(s && s.k > 0 && s.after && s.after.has(d)); };
  function fit(c, w, h) { if (c.width < w) c.width = w; if (c.height < h) c.height = h; }
  function punch(x, s, ox, oy) {
    x.globalCompositeOperation = 'destination-out';
    for (const c of s.circles) {
      const g = x.createRadialGradient(c.x - ox, c.y - oy, Math.max(0, c.r - c.f), c.x - ox, c.y - oy, c.r);
      g.addColorStop(0, `rgba(0,0,0,${s.k})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.beginPath(); x.arc(c.x - ox, c.y - oy, c.r, 0, Math.PI * 2); x.fill();
    }
    x.globalCompositeOperation = 'source-over';
  }
  /** draw fn(ctx) for drawable d with the see-through hole punched out (circle bbox only; rest drawn untouched) */
  function withHole(ctx, d, fn, op, alpha) {
    const s = ST(), r = s.rect, b = { x0: Math.floor(Math.max(r.x0, d.rect.x0)), y0: Math.floor(Math.max(r.y0, d.rect.y0)), x1: Math.ceil(Math.min(r.x1, d.rect.x1)), y1: Math.ceil(Math.min(r.y1, d.rect.y1)) };
    const prevOp = ctx.globalCompositeOperation;
    ctx.save(); ctx.beginPath(); ctx.rect(d.rect.x0 - 1, d.rect.y0 - 1, d.rect.x1 - d.rect.x0 + 2, d.rect.y1 - d.rect.y0 + 2);
    if (b.x1 > b.x0 && b.y1 > b.y0) ctx.rect(b.x1, b.y0, b.x0 - b.x1, b.y1 - b.y0);      // reversed winding = hole
    ctx.clip('evenodd'); ctx.globalCompositeOperation = op; ctx.globalAlpha = alpha == null ? 1 : alpha; fn(ctx); ctx.restore();
    if (b.x1 <= b.x0 || b.y1 <= b.y0) return;
    const w = b.x1 - b.x0, h = b.y1 - b.y0; fit(scratch, w, h);
    sx.setTransform(1, 0, 0, 1, 0, 0); sx.globalAlpha = 1; sx.globalCompositeOperation = 'source-over'; sx.clearRect(0, 0, w, h);
    sx.setTransform(1, 0, 0, 1, -b.x0, -b.y0); fn(sx); sx.setTransform(1, 0, 0, 1, 0, 0); punch(sx, s, b.x0, b.y0);
    ctx.save(); ctx.globalCompositeOperation = op; ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.drawImage(scratch, 0, 0, w, h, b.x0, b.y0, w, h); ctx.restore();
    ctx.globalCompositeOperation = prevOp; stats.holed++;
  }
  function drawObj(ctx, d, drawStatic) { withHole(ctx, d, (c) => drawStatic(c, d), 'source-over', 1); }
  // ---- footprints: union of a fade group's sort boxes (roof pieces give the whole plan); cached per object list
  let fpCache = new Map(), fpLen = -1, fpRef = null;
  function footprint(key, d) {
    if (fpRef !== W.objects || fpLen !== W.objects.length) { fpCache = new Map(); fpRef = W.objects; fpLen = W.objects.length; }
    if (fpCache.has(key)) return fpCache.get(key);
    let r = null; const members = d.o.fade_group ? W.objects.filter((o) => o.fade_group === d.o.fade_group) : [d.o];
    for (const o of members) { const P = W.piece(o); if (!P || P.layer !== 'sorted') continue; const b = W.sortBox(o, P.parts[0]); if (!b || b.z0 > 1.5) { if (!b || !/roof/.test(o.type)) continue; } r = r ? [Math.min(r[0], b.x0), Math.min(r[1], b.y0), Math.max(r[2], b.x1), Math.max(r[3], b.y1)] : [b.x0, b.y0, b.x1, b.y1]; }
    fpCache.set(key, r); return r;
  }
  function drawGround(ctx) {
    const s = ST(); if (!s || s.k <= 0) return; const k = s.k;
    ctx.save();
    ctx.beginPath(); for (const c of s.circles) { ctx.moveTo(c.x + c.r, c.y); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); } ctx.clip();
    for (const c of s.circles) {            // (3) slightly brighter road / sidewalk seen through the hole
      const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
      g.addColorStop(0, `rgba(255,248,228,${0.13 * k})`); g.addColorStop(0.75, `rgba(255,248,228,${0.08 * k})`); g.addColorStop(1, 'rgba(255,248,228,0)');
      ctx.fillStyle = g; ctx.fillRect(c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);
    }
    const seen = new Set(); stats.footprints = 0;
    for (const d of s.after) {               // (2) footprint outline + faint shadow of each occluding building
      const key = d.o.fade_group || d.o.id; if (seen.has(key)) continue; seen.add(key);
      const r = footprint(key, d); if (!r) continue;
      const P = [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]].map(([x, y]) => [SP.sx(x, y), SP.sy(x, y, 0)]);
      ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
      ctx.fillStyle = `rgba(22,24,36,${0.17 * k})`; ctx.fill();
      ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5; ctx.strokeStyle = `rgba(250,242,220,${0.62 * k})`; ctx.stroke(); ctx.setLineDash([]);
      stats.footprints++;
    }
    ctx.restore();
  }
  /** (3) outline: dilated silhouette minus the silhouette, drawn over the occluders for actors covered by a holed object */
  function drawOutlines(ctx, list) {
    const s = ST(); if (!s || s.k <= 0) return; stats.outlines = 0;
    let last = -1; const idx = new Map(); list.forEach((d, i) => { if (s.after.has(d)) { last = i; idx.set(d, i); } });
    if (last < 0) return;
    for (let i = 0; i < last; i++) {
      const d = list[i]; if (d.kind !== 'actor' || !d.actor || d.actor.hidden) continue;
      const r = d.rect; let covered = false;
      for (const [o, j] of idx) if (j > i && o.rect.x1 > r.x0 && o.rect.x0 < r.x1 && o.rect.y1 > r.y0 && o.rect.y0 < r.y1) { covered = true; break; }
      if (!covered) continue;
      const x0 = Math.floor(r.x0) - 2, y0 = Math.floor(r.y0) - 2, w = Math.ceil(r.x1 - r.x0) + 4, h = Math.ceil(r.y1 - r.y0) + 4; fit(scratch, w, h); fit(ring, w, h);
      sx.setTransform(1, 0, 0, 1, 0, 0); sx.globalCompositeOperation = 'source-over'; sx.globalAlpha = 1; sx.clearRect(0, 0, w, h);
      sx.setTransform(1, 0, 0, 1, -x0, -y0); d.actor.draw(sx); sx.setTransform(1, 0, 0, 1, 0, 0);
      sx.globalCompositeOperation = 'source-in'; sx.fillStyle = d.actor.isPlayer ? '#ffe7a3' : '#dce8f2'; sx.fillRect(0, 0, w, h); sx.globalCompositeOperation = 'source-over';
      rx.setTransform(1, 0, 0, 1, 0, 0); rx.globalCompositeOperation = 'source-over'; rx.clearRect(0, 0, w, h);
      for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) rx.drawImage(scratch, 0, 0, w, h, ox, oy, w, h);
      rx.globalCompositeOperation = 'destination-out'; rx.drawImage(scratch, 0, 0, w, h, 0, 0, w, h); rx.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.globalAlpha = 0.9 * s.k; ctx.drawImage(ring, 0, 0, w, h, x0, y0, w, h); ctx.restore(); stats.outlines++;
    }
  }
  SP.seeThrough = { active, holed, withHole, drawObj, drawGround, drawOutlines, footprint, stats };
})(typeof window !== 'undefined' ? window : globalThis);
