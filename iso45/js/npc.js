/* scene-proto-45 · NPC brains: waypoint loops / ping-pong routes from scene.json (validated at build time against
   every footprint by tools/build_scene.py), local steering around other characters (pass on the right, try
   deflections of +-30..100 deg, otherwise wait), zebra crossings only when traffic allows, dwell poses at route ends.
   All movement goes through SP.actors.move(), which refuses any step that would overlap a character, a footprint or a car. */
(function (SP) {
  "use strict";
  const N = (SP.npcs = { list: [] });
  const DEG = Math.PI / 180;
  N.init = function (specs) {
    N.list = [];
    for (const s of specs || []) {
      const a = new SP.Actor({ id: s.id, set: s.sprite, x: s.route[0][0], y: s.route[0][1], radius: s.radius, speed: s.speed, vehicle: !!s.vehicle,
                               height: s.vehicle ? 1.75 : 1.8 });
      const p1 = s.route[1]; a.setDir(SP.dirFromWorld(p1[0] - a.x, p1[1] - a.y));
      a.brain = { spec: s, idx: 1, step: 1, wait: 0, stuck: 0, dwell: 0 };
      N.list.push(a);
    }
    return N.list;
  };
  function nextIdx(b) {
    const n = b.spec.route.length;
    if (b.spec.mode === "loop") return (b.idx + 1) % n;
    let i = b.idx + b.step;
    if (i < 0 || i >= n) { b.step = -b.step; i = b.idx + b.step; }
    return i;
  }
  /** the zebra id of the segment from waypoint i to j (flag stored on the lower index) */
  function segCrossing(route, i, j) { const k = Math.min(i, j); return Math.abs(i - j) === 1 ? route[k][2] || null : null; }
  N.update = function (dt) {
    for (const a of N.list) {
      const b = a.brain, R = b.spec.route;
      if (b.dwell > 0) {
        b.dwell -= dt; a.update(dt, false, a.dir, 0);
        if (b.dwell <= 0) a.clip = null;
        continue;
      }
      let tgt = R[b.idx];
      if (Math.hypot(tgt[0] - a.x, tgt[1] - a.y) < 0.18) {
        const dw = b.spec.dwell && b.spec.dwell[String(b.idx)];
        const from = b.idx; b.idx = nextIdx(b); tgt = R[b.idx];
        a.crossing = null; b.cleared = null;
        if (dw && b.lastDwell !== from) { b.lastDwell = from; b.dwell = dw.t; if (dw.clip && window.ACTORS[a.set].clips[dw.clip]) { a.clip = dw.clip; a.t = 0; } if (dw.dir) a.setDir(dw.dir); continue; }
        b.lastDwell = null;
        const cw = segCrossing(R, from, b.idx);
        b.pendingCross = cw;
      }
      // zebra: wait at the kerb until every approaching car can stop, then claim the crossing (cars yield)
      if (b.pendingCross) {
        if (!SP.traffic.crossingSafe(b.pendingCross)) {
          b.waitCross = (b.waitCross || 0) + dt; a.update(dt, false, a.dir, 0);
          // gave up waiting (jam on the zebra): turn back along the route instead of standing there forever
          if (b.waitCross > 25 && b.spec.mode === "pingpong") { b.pendingCross = null; b.waitCross = 0; b.step = -b.step; b.idx = nextIdx(b); }
          continue;
        }
        b.waitCross = 0;
        a.crossing = b.pendingCross; b.pendingCross = null;
      }
      let dx = tgt[0] - a.x, dy = tgt[1] - a.y; let d = Math.hypot(dx, dy); dx /= d; dy /= d;
      // back off: blocked by a character for a while (narrow gap, someone parked in the way) -> step away from them
      if (b.backoff > 0) { b.backoff -= dt; dx = b.away[0]; dy = b.away[1]; d = 9; }
      // look ahead for characters: deflect to the right early so two walkers pass instead of meeting head-on
      let bias = 0;
      for (const o of SP.actors.list) {
        if (o === a) continue;
        const rx = o.x - a.x, ry = o.y - a.y, dist = Math.hypot(rx, ry);
        if (dist > 2.2) continue;
        const ahead = (rx * dx + ry * dy) / dist, lat = rx * -dy + ry * dx;
        if (ahead > 0.35) bias = Math.min(bias, lat > 0.25 ? -0.25 : -0.6);   // right = clockwise
      }
      const step = Math.min(a.speed * dt, d);
      let moved = 0, mvx = 0, mvy = 0;
      const tries = [0, -30, 30, -60, 60, -95, 95];
      for (const t of tries) {
        const ang = Math.atan2(dy, dx) + bias + t * DEG, vx = Math.cos(ang) * step, vy = Math.sin(ang) * step;
        const dir = a.vehicle ? SP.dirFromWorld(vx, vy) : null;
        if (a.vehicle && dir !== a.dir) { if (!SP.actors.shapeClear(a, a.x + vx, a.y + vy, dir) || !SP.actors.shapeClear(a, a.x, a.y, dir)) continue; }
        else if (!SP.actors.shapeClear(a, a.x + vx, a.y + vy)) continue;
        if (Math.abs(t) > 60 && d < 0.6) continue;                // don't orbit a waypoint
        moved = SP.actors.move(a, vx, vy); mvx = vx; mvy = vy;
        if (moved > 1e-5) break;
      }
      if (moved > 1e-5) { if (!(b.backoff > 0)) b.stuck = 0; a.update(dt, true, SP.dirFromWorld(mvx, mvy), moved); }
      else {
        b.stuck += dt; a.update(dt, false, a.dir, 0);
        if (b.stuck > 1.2 && !(b.backoff > 0)) {
          let near = null, nd = 1.6;
          for (const o of SP.actors.list) { if (o === a) continue; const q = Math.hypot(o.x - a.x, o.y - a.y); if (q < nd) { nd = q; near = o; } }
          if (near) { const ang = Math.atan2(a.y - near.y, a.x - near.x) + (SP.rand() - 0.5) * 1.2; b.away = [Math.cos(ang), Math.sin(ang)]; b.backoff = 0.6 + SP.rand() * 0.9; }
        }
        // long block on a ping-pong route (e.g. the player parks in a doorway): turn around
        if (b.stuck > 6 && b.spec.mode === "pingpong" && !a.crossing) { b.step = -b.step; b.idx = nextIdx(b); b.stuck = 0; }
      }
    }
  };
})(window.SP);
