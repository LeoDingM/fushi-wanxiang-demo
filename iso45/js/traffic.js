/* scene-proto-45 · lane traffic on two crossing roads (both directions each): cars spawn at the lane ends, keep
   distance, stop at the zebra while any character is on / entering it, yield at the intersection (main road has
   priority), brake for characters in their lane, and never move into a character or another car (hard check of the
   next footprint). Scripted crash: a westbound car swerves into the north curb. */
(function (SP) {
  "use strict";
  const T = (SP.traffic = { cars: [], timers: {}, crashed: null, n: 0 });
  const RECT = [-0.98, -2.3, 0.98, 2.3], HALF = 2.3, HW = 0.98, ACC = 2.6, DEC = 6.5;
  // vehicle types: car (p_car, 4.6 x 1.96 m) and the city bus (p_bus, 10.4 x 2.5 m) that stops at the bus stop
  const VT = { car: { rect: RECT, half: HALF, hw: HW, piece: "p_car", z1: 1.45 }, bus: { rect: [-1.25, -5.2, 1.25, 5.2], half: 5.2, hw: 1.25, piece: "p_bus", z1: 3.25 } };
  const head = (rot) => SP.rotPt([0, -1], rot);
  const TR = () => SP.world.data.traffic;
  T.reset = function () {
    T.cars = []; T.crashed = null; T.timers = {}; T.n = 0;
    TR().lanes.forEach((l, i) => (T.timers[l.id] = 0.5 + i * 1.3));
    const B = TR().bus; T.busTimer = B ? B.first || 4 : Infinity;
  };
  T.allCars = () => T.cars;
  const xyOf = (lane, s) => (lane.axis === "x" ? [s, lane.c] : [lane.c, s]);
  function place(c) { const [x, y] = c.crash && c.crash.phase !== "approach" ? [c.x, c.y] : xyOf(c.L, c.s); c.x = x; c.y = y; c.poly = SP.footPoly(c.rect, c.rot, c.x, c.y); }
  // convex polygon overlap (SAT)
  function polyOverlap(P, Q) {
    for (const S of [P, Q]) for (let i = 0; i < S.length; i++) {
      const [x1, y1] = S[i], [x2, y2] = S[(i + 1) % S.length], nx = y1 - y2, ny = x2 - x1;
      let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9;
      for (const [x, y] of P) { const d = x * nx + y * ny; a0 = Math.min(a0, d); a1 = Math.max(a1, d); }
      for (const [x, y] of Q) { const d = x * nx + y * ny; b0 = Math.min(b0, d); b1 = Math.max(b1, d); }
      if (a1 <= b0 || b1 <= a0) return false;
    }
    return true;
  }
  T.polyOverlap = polyOverlap;
  function hitsActorOrCar(c, poly) {
    for (const a of SP.actors.list) for (const [x, y, r] of a.circles()) if (SP.circlePoly(x, y, r + 0.02, poly)) return a.id;
    for (const o of T.cars) if (o !== c && polyOverlap(poly, o.poly)) return o.id;
    return null;
  }
  function spawn(lane, crash, type) {
    const tr = TR(), R = SP.rand, V = VT[type || "car"];
    const s = lane.dir > 0 ? lane.range[0] : lane.range[1];
    const car = { id: (type === "bus" ? "bus" : "car") + T.n++, type: type || "car", rect: V.rect, half: V.half, hw: V.hw, z1: V.z1, piece: V.piece,
                  lane: lane.id, L: lane, dir: lane.dir, s, rot: lane.rot, v: 0, state: "normal",
                  vmax: type === "bus" ? tr.bus.speed || 4.6 : SP.lerp(tr.speed[0], tr.speed[1], R()),
                  variant: type === "bus" ? "base" : tr.variants[Math.floor(R() * tr.variants.length)], crash: crash || null };
    place(car);
    if (hitsActorOrCar(car, car.poly)) return null;
    car.v = car.vmax * 0.9;
    T.cars.push(car);
    return car;
  }
  T.front = (c) => { const h = head(c.rot); return [c.x + h[0] * c.half, c.y + h[1] * c.half]; };
  const cwById = (id) => TR().crosswalks.find((w) => w.id === id);
  function inZone(x, y, z, m) { return x > z.x0 - m && x < z.x1 + m && y > z.y0 - m && y < z.y1 + m; }
  /** characters on a zebra (or about to step on it: NPCs waiting with approval) */
  function crossingBusy(cw) {
    for (const a of SP.actors.list) {
      if (a.crossing === cw.id) return true;
      for (const [x, y, r] of a.circles()) if (inZone(x, y, cw, 0.5 + r)) return true;
    }
    return false;
  }
  const ixBox = () => TR().intersection;
  function inBox(c, m) { const b = ixBox(), p = SP.polyBox(c.poly); return p[0] < b.x1 + m && p[2] > b.x0 - m && p[1] < b.y1 + m && p[3] > b.y0 - m; }
  /** metres from this car's front to the nearest reason to stop (Infinity if clear) */
  function gapAhead(c) {
    const L = c.L, f = c.s + c.dir * c.half;
    let gap = Infinity;
    for (const o of T.cars) {
      if (o === c || o.lane !== c.lane || o.state === "crashed") continue;
      const rear = o.s - o.dir * o.half, d = (rear - f) * c.dir;
      if ((o.s - c.s) * c.dir > 0 && d > -2) gap = Math.min(gap, d);
    }
    // nearest car ahead in this lane (for "don't stop on the zebra / in the box": only enter if there is room beyond)
    let ahead = null, claimed = null;
    for (const o of T.cars) if (o !== c && o.lane === c.lane && (o.s - c.s) * c.dir > 0 && (!ahead || (o.s - ahead.s) * c.dir < 0)) ahead = o;
    for (const st of L.stops) {
      const toStop = (st.at - f) * c.dir;
      if (toStop < -0.3) continue;
      const zone = st.cw ? cwById(st.cw) : ixBox();
      const far = L.axis === "x" ? (c.dir > 0 ? zone.x1 : zone.x0) : (c.dir > 0 ? zone.y1 : zone.y0);
      if (ahead && ((ahead.s - ahead.dir * ahead.half) - far) * c.dir < 2 * c.half + 0.8 && ahead.v < 1.0) gap = Math.min(gap, toStop);
      if (st.cw && crossingBusy(cwById(st.cw))) gap = Math.min(gap, toStop);
      if (st.box && !c.inBox) {
        const other = T.cars.filter((o) => o.L.axis !== L.axis && o.state !== "crashed");
        const occupied = other.some((o) => o.inBox || inBox(o, 0.3));         // claimed by cross traffic, or physically inside
        const prio = L.axis === "y" && other.some((o) => { const ff = o.s + o.dir * o.half, s2 = o.L.stops.find((q) => q.box), t = (s2.at - ff) * o.dir; return t > -0.3 && t < 5 && o.v > 0.5; });
        if (occupied || prio) gap = Math.min(gap, toStop);
        else if (toStop < 0.6) { c.inBox = true; claimed = toStop; }
      }
    }
    // characters in the lane band ahead (incl. umbrella / scooter circles)
    for (const a of SP.actors.list) for (const [x, y, r] of a.circles()) {
      const lat = L.axis === "x" ? y : x, lon = L.axis === "x" ? x : y;
      if (Math.abs(lat - L.c) > c.hw + r + 0.25) continue;
      const d = (lon - f) * c.dir;
      if (d > -0.2 && d < 14) gap = Math.min(gap, d - r - 0.35);       // only ahead of the bumper: someone beside the car does not freeze it
    }
    // claimed the intersection this step but something else makes it stop before / at the line: release the claim,
    // otherwise cross traffic would see a stopped car and enter while this one still believes it owns the box
    if (claimed != null && gap < claimed + 2 * c.half + 0.5) c.inBox = false;
    // the bus pulls up at its stop (front at bus.stop_at) and dwells there
    const B = TR().bus;
    if (c.type === "bus" && B && !c.served) { const d = (B.stop_at - f) * c.dir; if (d > -0.3) gap = Math.min(gap, d + 0.45); }
    return gap;
  }
  T.update = function (dt) {
    const tr = TR();
    for (const l of tr.lanes) {
      T.timers[l.id] -= dt;
      if (T.timers[l.id] <= 0) {
        const s = l.dir > 0 ? l.range[0] : l.range[1];
        const clear = !T.cars.some((c) => c.lane === l.id && Math.abs(c.s - s) < 9);
        if (clear && T.cars.length < tr.max_cars) spawn(l);
        T.timers[l.id] = SP.lerp(tr.spawn_every[0], tr.spawn_every[1], SP.rand());
      }
    }
    if (tr.bus && (T.busTimer -= dt) <= 0) {
      const l = tr.lanes.find((q) => q.id === tr.bus.lane), s = l.dir > 0 ? l.range[0] : l.range[1];
      const clear = !T.cars.some((c) => c.lane === l.id && Math.abs(c.s - s) < 14);
      if (clear && !T.cars.some((c) => c.type === "bus") && spawn(l, null, "bus")) T.busTimer = SP.lerp(tr.bus.every[0], tr.bus.every[1], SP.rand());
      else T.busTimer = 2;
    }
    for (const c of T.cars) {
      if (c.state === "crashed") { c.v = 0; c.t = (c.t || 0) + dt; if (c.t < 9 && SP.rand() < dt * 6) { const f = T.front(c); SP.fx.smoke(f[0], f[1], 0.9, 0, 0); } continue; }
      if (c.crash && c.crash.phase === "veer") {
        const h = head(c.rot); c.v = Math.max(3.0, c.v - 2 * dt);
        const nx = c.x + h[0] * c.v * dt, ny = c.y + h[1] * c.v * dt, np = SP.footPoly(c.rect, c.rot, nx, ny);
        if (hitsActorOrCar(c, np)) { T.impact(c); continue; }          // never into a character: the swerve ends early
        c.x = nx; c.y = ny; c.poly = np;
        if (T.front(c)[1] >= c.crash.stop_front_y) T.impact(c);
        continue;
      }
      const gap = gapAhead(c);
      const allowed = Math.sqrt(2 * DEC * Math.max(0, gap - 0.4));
      c.v = Math.max(0, Math.min(c.v + ACC * dt, c.vmax, allowed));
      if (gap < 0.5) c.v = 0;
      if (c.type === "bus" && !c.served && c.v < 0.05 && tr.bus) {
        const d = (tr.bus.stop_at - (c.s + c.dir * c.half)) * c.dir;
        if (d < 1.0) { c.dwell = (c.dwell || 0) + dt; c.atStop = true; if (c.dwell >= tr.bus.dwell) { c.served = true; c.atStop = false; T.busStops = (T.busStops || 0) + 1; } }
      }
      if (c.v > 0) {
        const ns = c.s + c.dir * c.v * dt, [nx, ny] = xyOf(c.L, ns), np = SP.footPoly(c.rect, c.rot, nx, ny);
        if (hitsActorOrCar(c, np)) c.v = 0; else { c.s = ns; c.x = nx; c.y = ny; c.poly = np; }
      }
      if (c.inBox && !inBox(c, 0.5) && (c.s - (c.L.stops.find((q) => q.box).at)) * c.dir > 0) c.inBox = false;
      if (c.crash && c.crash.phase === "approach" && (c.s - c.crash.veer_at) * c.dir >= 0) { c.crash.phase = "veer"; c.rot = c.crash.rot; c.poly = SP.footPoly(c.rect, c.rot, c.x, c.y); if (hitsActorOrCar(c, c.poly)) { c.rot = c.L.rot; c.poly = SP.footPoly(c.rect, c.rot, c.x, c.y); c.crash.phase = "approach"; c.crash.veer_at -= c.dir * 2; } }
      c.waiting = c.v < 0.05;
    }
    T.cars = T.cars.filter((c) => c.state === "crashed" || (c.s >= c.L.range[0] - 1 && c.s <= c.L.range[1] + 1));
  };
  /** is it safe for a pedestrian to step onto zebra `id` (no car on it, every approaching car can still stop) */
  T.crossingSafe = function (id) {
    const cw = cwById(id);
    for (const c of T.cars) {
      const b = SP.polyBox(c.poly), st = c.L.stops.find((q) => q.cw === id);
      const toStop = st ? (st.at - (c.s + c.dir * c.half)) * c.dir : -9;
      if (st && toStop >= -0.3 && c.state !== "crashed" && !c.crash) {           // still before its stop line
        if (c.v < 0.3) continue;                                                 // already yielding
        if (c.v * c.v / (2 * DEC) > toStop - 1.0) return false;                  // could not stop in time
        continue;
      }
      if (b[0] < cw.x1 + 0.8 && b[2] > cw.x0 - 0.8 && b[1] < cw.y1 + 0.8 && b[3] > cw.y0 - 0.8) return false;   // on / just past it
    }
    return true;
  };
  T.crash = function (a) {
    if (T.crashed || T.cars.some((c) => c.crash)) return;
    const lane = TR().lanes.find((l) => l.id === a.lane);
    let car = T.cars.filter((c) => c.type === "car" && c.lane === lane.id && (c.s - a.veer_at) * -lane.dir > 3).sort((p, q) => (p.s - q.s) * -lane.dir)[0];
    if (!car) car = spawn(lane);
    if (!car) return;
    car.crash = { phase: "approach", veer_at: a.veer_at, rot: a.rot, stop_front_y: a.stop_front_y };
    car.vmax = Math.max(car.vmax, 6.5);
  };
  T.impact = function (c) {
    c.state = "crashed"; c.v = 0; c.crash.phase = "done"; c.t = 0; T.crashed = c;
    const np = SP.footPoly([-0.98, -1.95, 0.98, 2.3], c.rot, c.x, c.y); c.poly = np;
    const f = T.front(c);
    SP.fx.crashBurst(f[0], f[1], 34);
    SP.world.decals.push({ key: "fx/crash_decal", x: f[0] + 0.2, y: f[1] - 0.4, t: 0 });
    SP.world.decals.push({ key: "fx/skid", x: c.x + 2.0, y: c.y - 0.8, t: 0, shear: -0.5 });
    SP.world.timers.push({ at: SP.now + 2.5, a: { do: "decal", frame: "fx/triangle", x: c.x + 5.0, y: -1.2 } });
    SP.world.log.push({ name: "crash_impact", t: SP.now, car: c.id });
  };
  T.frameKey = (c) => SP.frameKey(c.piece, c.variant, "main", c.state, c.rot);
  T.drawables = function (out, view) {
    for (const c of T.cars) {
      const key = T.frameKey(c), X = SP.sx(c.x, c.y), Y = SP.sy(c.x, c.y, 0), rect = SP.frameRect(key, X, Y);
      if (view && !SP.rectsOverlap(rect, view)) continue;
      const b = SP.polyBox(c.poly);
      const box = { x0: b[0], y0: b[1], x1: b[2], y1: b[3], z0: 0, z1: c.z1, polys: c.rot % 2 ? [c.poly] : null };
      out.push({ kind: "car", car: c, key, X, Y, rect, box, depth: (b[0] + b[1] + b[2] + b[3]) / 2, zo: 0, sid: "car/" + c.id });
    }
    return out;
  };
  T.shadowKeys = () => T.cars.map((c) => [SP.frameKey(c.piece, "base", "main", c.state, c.rot) + "#shadow", SP.sx(c.x, c.y), SP.sy(c.x, c.y, 0)]);
  T.glows = function () {
    const night = SP.tint.night, out = [];
    for (const c of T.cars) {
      const h = head(c.rot), side = [-h[1], h[0]], f = T.front(c);
      if (night > 0.05 && c.state !== "crashed") {
        out.push({ x: f[0] + h[0] * 2.8, y: f[1] + h[1] * 2.8, z: 0, r: 3.0, c: [255, 240, 200], a: 0.3 * night, flat: true });
        for (const s of [-0.6, 0.6]) out.push({ x: f[0] + side[0] * s, y: f[1] + side[1] * s, z: 0.62, r: 0.7, c: [255, 245, 220], a: 0.55 * night });
        if (c.type === "bus") for (let k = -3.5; k <= 3.6; k += 1.75) out.push({ x: c.x + h[0] * k + side[0] * 1.3, y: c.y + h[1] * k + side[1] * 1.3, z: 1.9, r: 1.3, c: [255, 226, 160], a: 0.22 * night });
      }
      const blink = c.state === "crashed" && Math.floor(SP.now * 1.6) % 2 === 0;
      for (const s of [-0.66, 0.66]) {
        const rx = c.x - h[0] * c.half + side[0] * s, ry = c.y - h[1] * c.half + side[1] * s;
        if (blink) { out.push({ x: rx, y: ry, z: 0.66, r: 1.2, c: [255, 170, 40], a: 0.8 }); out.push({ x: f[0] + side[0] * s, y: f[1] + side[1] * s, z: 0.62, r: 1.0, c: [255, 170, 40], a: 0.7 }); }
        else if (night > 0.05 || c.waiting) out.push({ x: rx, y: ry, z: 0.66, r: c.waiting ? 0.9 : 0.6, c: [255, 60, 40], a: (c.waiting ? 0.55 : 0.3) * Math.max(night, c.waiting ? 0.6 : 0) });
      }
    }
    return out;
  };
})(window.SP);
