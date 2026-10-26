/* scene-proto-45 · clipping audit (穿模审计). Used by tools/playtest.py; also callable from the console:
     __proto.audit.run({seconds: 10800, dt: 1/30})
   Simulates the street at high speed (no rendering) with every NPC on its route and 李默 doing a random walk, and
   checks EVERY step:
     overlaps    - two characters' foot circles intersect (scooter = 3 circles, umbrella = 0.55 m canopy)
     intrusions  - a character circle intersects any object footprint, collider, bounds or car
   and every `sortEvery` steps (on the real painter list the renderer would build):
     sortViolations  - a pair whose screen sprites overlap where geometry says A is in front of B but A is drawn first
                       (geometry = independent separating-axis test on the world boxes / foot circles)
   and every `pixelEvery` steps a PIXEL test: silhouettes of all drawables overlapping each character are painted in
   the final order into an id buffer; at each pixel where the character is opaque, the visible owner must not be
     (a) the character while an object/character that is geometrically in front of it is also opaque there, or
     (b) an object/character that is geometrically behind the character.
   Needs canvas readback: Chrome must run with --allow-file-access-from-files under file:// (the playtest does). */
(function (SP) {
  "use strict";
  const AU = (SP.audit = {});
  const EPS = 1e-3;
  AU.counts = () => ({ steps: 0, overlaps: 0, intrusions: 0, sortChecks: 0, sortPairs: 0, sortViolations: 0, pixelChecks: 0, pixelsTested: 0, pixelViolations: 0,
                       minGap: 9, closePasses: 0, crowdFrames: 0, samples: [] });
  /** per-step collision check; returns [overlaps, intrusions] */
  AU.checkCollisions = function (C) {
    const L = SP.actors.list; let ov = 0, intr = 0;
    for (let i = 0; i < L.length; i++) {
      const ca = L[i].circles();
      for (let j = i + 1; j < L.length; j++) for (const [ax, ay, ar] of ca) for (const [bx, by, br] of L[j].circles()) {
        const g = Math.hypot(ax - bx, ay - by) - ar - br;
        if (C) { C.minGap = Math.min(C.minGap, g); if (g < 0.25) C.closePasses++; }
        if (g < -EPS) { ov++; if (C && C.samples.length < 20) C.samples.push({ t: SP.now, type: "overlap", a: L[i].id, b: L[j].id, g }); }
      }
      for (const [cx, cy, r] of ca) {
        const hit = SP.world.blocked(cx, cy, r - EPS);
        if (hit) { intr++; if (C && C.samples.length < 20) C.samples.push({ t: SP.now, type: "intrusion", a: L[i].id, b: hit, x: cx, y: cy }); }
      }
    }
    return [ov, intr];
  };
  // ---- independent geometric truth: is P in front of Q? (+1 / -1 / 0 = no strict relation)
  function truth(P, Q) {
    const A = P.box, B = Q.box;
    const pf = A.x1 <= B.x0 + EPS || A.y1 <= B.y0 + EPS, qf = B.x1 <= A.x0 + EPS || B.y1 <= A.y0 + EPS;
    if (pf !== qf) return pf ? 1 : -1;
    if (pf && qf) return 0;
    if (A.z0 >= B.z1 - EPS) return 1;
    if (B.z0 >= A.z1 - EPS) return -1;
    // overlapping ground boxes, same height band: occlusion order of the solid prisms (foot circles / footprints)
    if (A.circles || B.circles || A.polys || B.polys) return SP.prismOrder(SP.world.shapes(P), SP.world.shapes(Q));
    return 0;
  }
  AU.truth = truth;
  /** order check on a painter list (from __proto.buildList) */
  AU.checkSort = function (list, C) {
    const idx = new Map(); list.forEach((d, i) => idx.set(d, i));
    let viol = 0, pairs = 0;
    for (const a of list) {
      if (a.kind !== "actor") continue;
      const ra = a.actor.spriteRect();
      for (const d of list) {
        if (d === a || d.kind === "part" || d.kind === "fire" || d.kind === "overlay") continue;
        const rd = d.kind === "actor" ? d.actor.spriteRect() : d.rect;
        if (!SP.rectsOverlap(ra, rd)) continue;
        if (d.kind === "obj" && !maskOverlap(d, ra)) continue;          // only pairs that really overlap on screen
        pairs++;
        const t = truth(d, a);
        if ((t > 0 && idx.get(d) < idx.get(a)) || (t < 0 && idx.get(d) > idx.get(a))) {
          viol++; if (C && C.samples.length < 20) C.samples.push({ t: SP.now, type: "sort", actor: a.actor.id, other: d.sid, truth: t, cycles: SP.world.sortCycles, ax: a.actor.x, ay: a.actor.y,
            front: SP.world.front(d, a), ia: idx.get(a), id: idx.get(d), list: list.map((q) => q.sid).slice(Math.min(idx.get(a), idx.get(d)), Math.max(idx.get(a), idx.get(d)) + 1) });
        }
      }
    }
    if (C) { C.sortChecks++; C.sortPairs += pairs; C.sortViolations += viol; }
    return viol;
  };
  function maskOverlap(d, r) { const f = SP.frame(d.key); return SP.maskHits(d.key, Math.round(d.X) - f[4], Math.round(d.Y) - f[5], r) > 0; }
  // ---- pixel test with an id buffer
  const cv = document.createElement("canvas"), cx = cv.getContext("2d", { willReadFrequently: true });
  const tmp = document.createElement("canvas"), tx = tmp.getContext("2d", { willReadFrequently: true });
  function silhouette(d, rect, color) {        // draw d's opaque pixels in `color` into tmp (rect-local), return alpha array
    const w = rect.x1 - rect.x0, h = rect.y1 - rect.y0;
    if (tmp.width !== w || tmp.height !== h) { tmp.width = w; tmp.height = h; }
    tx.setTransform(1, 0, 0, 1, 0, 0); tx.globalCompositeOperation = "source-over"; tx.clearRect(0, 0, w, h);
    tx.setTransform(1, 0, 0, 1, -rect.x0, -rect.y0);
    if (d.kind === "actor") d.actor.draw(tx, true);
    else SP.drawFrame(tx, d.key, d.X, d.Y, 1, true);
    tx.setTransform(1, 0, 0, 1, 0, 0);
    const img = tx.getImageData(0, 0, w, h), px = img.data, al = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {               // binary silhouette: exact ids, no edge blending
      al[i] = px[i * 4 + 3] > 127 ? 1 : 0;
      px[i * 4] = color; px[i * 4 + 1] = 0; px[i * 4 + 2] = 0; px[i * 4 + 3] = al[i] ? 255 : 0;
    }
    tx.putImageData(img, 0, 0);
    return al;
  }
  AU.checkPixels = function (list, C) {
    let viol = 0, tested = 0;
    for (const a of list) {
      if (a.kind !== "actor") continue;
      const r = a.actor.spriteRect(), w = r.x1 - r.x0, h = r.y1 - r.y0;
      const others = list.filter((d) => d !== a && d.kind !== "part" && d.kind !== "fire" && d.kind !== "overlay" &&
                                       SP.rectsOverlap(r, d.kind === "actor" ? d.actor.spriteRect() : d.rect));
      if (!others.length) continue;
      const order = list.filter((d) => d === a || others.includes(d));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      cx.clearRect(0, 0, w, h);
      const sil = new Map();
      order.forEach((d, k) => {                 // id colour = (k + 1) in the red channel, painted in final order
        const al = silhouette(d, r, k + 1); sil.set(d, al); cx.drawImage(tmp, 0, 0);
      });
      const id = cx.getImageData(0, 0, w, h).data, me = sil.get(a), rel = order.map((d) => (d === a ? 0 : truth(d, a)));
      for (let i = 0; i < w * h; i++) {
        if (!me[i]) continue;
        tested++;
        const owner = id[i * 4] - 1; if (owner < 0) continue;
        const frontHere = order.some((d, k) => rel[k] > 0 && sil.get(d)[i]);
        if (C) order.forEach((d, k) => { if (d !== a && rel[k] === 0 && sil.get(d)[i]) { C.ambiguousPixels = (C.ambiguousPixels || 0) + 1; const key = a.actor.id + "|" + d.sid; C.ambiguous = C.ambiguous || {}; C.ambiguous[key] = (C.ambiguous[key] || 0) + 1;
          C.ambSamples = C.ambSamples || []; if (C.ambSamples.length < 6 && !C.ambSamples.some((q) => q.key === key)) C.ambSamples.push({ key, t: +SP.now.toFixed(2), ax: +a.actor.x.toFixed(2), ay: +a.actor.y.toFixed(2), box: d.box && [d.box.x0, d.box.y0, d.box.x1, d.box.y1, d.box.z0, d.box.z1].map((v) => +v.toFixed(2)) }); } });
        if (order[owner] === a ? frontHere : rel[owner] < 0) {
          viol++; if (C && C.samples.length < 20) C.samples.push({ t: SP.now, type: "pixel", actor: a.actor.id, owner: order[owner].sid, front: order.filter((d, k) => rel[k] > 0 && sil.get(d)[i]).map((d) => d.sid + "#" + order.indexOf(d)), ownerIdx: owner, me: order.indexOf(a), x: r.x0 + (i % w), y: r.y0 + Math.floor(i / w) });
        }
      }
    }
    if (C) { C.pixelChecks++; C.pixelsTested += tested; C.pixelViolations += viol; }
    return viol;
  };
  /** random walk for 李默 (screen-direction input like a player) */
  AU.randomWalker = function (seed) {
    const R = SP.rng(seed || 7); let t = 0, dir = null;
    const DIRS = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], null];
    return function (dt, blocked) {
      t -= dt;
      if (t <= 0 || (blocked && R() < 0.2)) { dir = DIRS[Math.floor(R() * DIRS.length)]; t = 0.6 + R() * 2.4; }
      return dir;
    };
  };
})(window.SP);
