/* scene-proto-45 · lane traffic on crossing roads (both directions each): cars spawn at the lane ends, keep
   distance, stop at the zebra while any character is on / entering it, yield at an intersection (main road has
   priority) or obey its signal, brake for characters in their lane, and never move into a character or another car
   (hard check of the next footprint). Scripted crash: a westbound car swerves into the north curb.
   Several intersections (2026-10-18, Leo 02:38: 南关路 needs real traffic): traffic.intersections lists boxes by id, a
   lane stop { at, box: id } refers to one; traffic.signals[id] = { cycle: [[phase, seconds], ...] } makes that box a
   fixed-time signalised junction (phases 'x' / 'y' = that axis green, 'x_amber' / 'y_amber', 'all' = all red).
   The legacy single traffic.intersection is the box 'ix'. */
(function (SP) {
  "use strict";
  const T = (SP.traffic = { cars: [], timers: {}, crashed: null, n: 0 });
  const RECT = [-0.98, -2.3, 0.98, 2.3], HALF = 2.3, HW = 0.98, ACC = 2.6, DEC = 6.5;
  // vehicle types: car (p_car, 4.6 x 1.96 m) and the city bus (p_bus, 10.4 x 2.5 m) that stops at the bus stop
  const VT = { car: { rect: RECT, half: HALF, hw: HW, piece: "p_car", z1: 1.45 }, bus: { rect: [-1.25, -5.2, 1.25, 5.2], half: 5.2, hw: 1.25, piece: "p_bus", z1: 3.25 } };
  const head = (rot) => SP.rotPt([0, -1], rot);
  const TR = () => SP.world.data.traffic;
  T.reset = function () {
    T.cars = []; T.crashed = null; T.timers = {}; T.n = 0; T.sigT = 0;
    TR().lanes.forEach((l, i) => (T.timers[l.id] = 0.5 + i * 1.3));
    const B = TR().bus; T.busTimer = B && !T.serviceBusManaged ? B.first || 4 : Infinity;
  };
  T.allCars = () => T.cars;
  const xyOf = (lane, s) => (lane.axis === "x" ? [s, lane.c] : [lane.c, s]);
  function place(c) { const [x, y] = c.crash && c.crash.phase !== "approach" ? [c.x, c.y] : xyOf(c.L, c.s); c.x = x; c.y = y; c.poly = SP.footPoly(c.rect, c.rot, c.x, c.y); }
  // convex polygon overlap (SAT)
  /* perf: strict bounding-box reject first (boxes apart by a gap -> convex shapes apart -> SAT says false as well);
     the SAT below is unchanged */
  function polyOverlap(P, Q) {
    let px0 = Infinity, px1 = -Infinity, py0 = Infinity, py1 = -Infinity, qx0 = Infinity, qx1 = -Infinity, qy0 = Infinity, qy1 = -Infinity;
    for (let i = 0; i < P.length; i++) { const x = P[i][0], y = P[i][1]; px0 = Math.min(px0, x); px1 = Math.max(px1, x); py0 = Math.min(py0, y); py1 = Math.max(py1, y); }   // Math.min/max: a NaN vertex disables the reject (SAT decides, as before)
    for (let i = 0; i < Q.length; i++) { const x = Q[i][0], y = Q[i][1]; qx0 = Math.min(qx0, x); qx1 = Math.max(qx1, x); qy0 = Math.min(qy0, y); qy1 = Math.max(qy1, y); }
    if (px1 < qx0 || qx1 < px0 || py1 < qy0 || qy1 < py0) return false;
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
    // broad phase first (perf budget with the 南关路 lanes): actors / cars farther than 9 m (Manhattan) cannot touch this body
    const far = (o) => Number.isFinite(o.x) && Number.isFinite(o.y) && Math.abs(o.x - c.x) + Math.abs(o.y - c.y) > 9;
    for (const a of SP.actors.list) { if (far(a)) continue; for (const [x, y, r] of a.circles()) if (SP.circlePoly(x, y, r + 0.02, poly)) return a.id; }
    for (const o of T._frameCars || T.allCars()) if (o !== c && !far(o) && polyOverlap(poly, o.poly)) return o.id;
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
  /** A street-service bus is the same physical vehicle as other traffic, with two authored stops. */
  T.spawnServiceBus = function (laneId, stops) {
    const lane = TR().lanes.find((l) => l.id === laneId);
    if (!lane || !Array.isArray(stops) || stops.length < 2) return null;
    const bus = spawn(lane, null, "bus");
    if (bus) { bus.service = { stops, next: 0 }; bus.serviceLine = laneId; }
    return bus;
  };
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
  /** intersection box by id ('ix' / true = the legacy single box) */
  const ixBox = (id) => { const tr = TR(); if (!id || id === true || id === "ix") return tr.intersection; return (tr.intersections || []).find((b) => b.id === id) || tr.intersection; };
  T.boxes = () => { const tr = TR(), out = [tr.intersection]; for (const b of tr.intersections || []) if (b.id !== "ix") out.push(b); return out.filter(Boolean); };
  function inBox(c, m, id) { const b = ixBox(id), p = SP.polyBox(c.poly); return p[0] < b.x1 + m && p[2] > b.x0 - m && p[1] < b.y1 + m && p[3] > b.y0 - m; }
  const boxId = (st) => (st.box === true ? "ix" : st.box);
  /** current phase of a signalised box (null if unsignalised): { phase, green: 'x' | 'y' | null, amber: 'x' | 'y' | null, left } */
  T.signal = function (id) {
    const S = TR().signals && TR().signals[id]; if (!S) return null;
    const total = S.cycle.reduce((a, q) => a + q[1], 0); let t = ((T.sigT || 0) + (S.offset || 0)) % total;
    for (const [ph, d] of S.cycle) { if (t < d) return { phase: ph, green: ph === "x" || ph === "y" ? ph : null, amber: /_amber$/.test(ph) ? ph[0] : null, left: d - t }; t -= d; }
    return { phase: "all", green: null, amber: null, left: 0 };
  };
  /** metres from this car's front to the nearest reason to stop (Infinity if clear) */
  function gapAhead(c) {
    const ALL = T._frameCars || T.allCars();   // one snapshot per update step (several modules wrap allCars)
    const L = c.L, f = c.s + c.dir * c.half;
    let gap = Infinity;
    for (const o of ALL) {
      if (o === c || o.lane !== c.lane || o.state === "crashed") continue;
      const rear = o.s - o.dir * o.half, d = (rear - f) * c.dir;
      if ((o.s - c.s) * c.dir > 0 && d > -2) gap = Math.min(gap, d);
    }
    // nearest car ahead in this lane (for "don't stop on the zebra / in the box": only enter if there is room beyond)
    let ahead = null, claimed = null;
    for (const o of ALL) if (o !== c && o.lane === c.lane && (o.s - c.s) * c.dir > 0 && (!ahead || (o.s - ahead.s) * c.dir < 0)) ahead = o;
    for (const st of L.stops) {
      const toStop = (st.at - f) * c.dir;
      if (toStop < -0.3) continue;
      const zone = st.cw ? cwById(st.cw) : ixBox(st.box);
      const far = L.axis === "x" ? (c.dir > 0 ? zone.x1 : zone.x0) : (c.dir > 0 ? zone.y1 : zone.y0);
      if (ahead && ((ahead.s - ahead.dir * ahead.half) - far) * c.dir < 2 * c.half + 0.8 && ahead.v < 1.0) gap = Math.min(gap, toStop);
      // A bus about to dwell beyond a zebra has a predictable final rear edge. Keep
      // following cars before the stop line while that edge cannot leave room for
      // their whole body beyond the crossing, even while the bus is still moving.
      if (st.cw && ahead?.service) {
        const target = ahead.service.stops[ahead.service.next];
        if (target) {
          const rearAtStop = target.frontAt - c.dir * ahead.half * 2;
          const room = (rearAtStop - far) * c.dir;
          if (room > 0 && room < 2 * c.half + 0.8) gap = Math.min(gap, toStop);
        }
      }
      if (st.cw && crossingBusy(cwById(st.cw))) gap = Math.min(gap, toStop);
      if (st.box && c.inBox !== boxId(st)) {
        const id = boxId(st), sig = T.signal(id);
        const other = ALL.filter((o) => o.L && o.L.axis !== L.axis && o.state !== "crashed");
        const occupied = other.some((o) => o.inBox === id || (o.inBox === true && id === "ix") || inBox(o, 0.3, id));   // claimed by cross traffic, or physically inside
        // a signalised box: red / all-red holds the line; amber only lets through a car that could not stop comfortably
        let red = false;
        if (sig) red = !(sig.green === L.axis || (sig.amber === L.axis && c.v * c.v / (2 * DEC) > toStop - 0.3));
        // the next zebra just beyond the box (st.also) must be clear before entering, so nobody waits inside the box
        const beyondBusy = (st.also || []).some((cid) => { const w = cwById(cid); return w && crossingBusy(w); });
        const prio = L.axis === "y" && other.some((o) => {
          if (sig) return false;   // a signal decides instead of the unsignalised N-S priority rule
          const ff = o.s + o.dir * o.half, s2 = o.L.stops?.find((q) => q.box && boxId(q) === id);
          let line = s2?.at;
          if (!Number.isFinite(line)) {
            // Service vehicles use physical routes rather than authored stop lines.
            // Only a lane that actually crosses the junction may claim priority.
            const b = ixBox(id), lo = o.L.axis === "x" ? b.y0 : b.x0, hi = o.L.axis === "x" ? b.y1 : b.x1;
            if (o.L.c + o.hw <= lo || o.L.c - o.hw >= hi) return false;
            line = o.L.axis === "x" ? (o.dir > 0 ? b.x0 : b.x1) : (o.dir > 0 ? b.y0 : b.y1);
          }
          const t = (line - ff) * o.dir;
          return t > -0.3 && t < 5 && o.v > 0.5;
        });
        if (occupied || prio) gap = Math.min(gap, toStop);
        else if (red || beyondBusy) gap = Math.min(gap, toStop);
        else if (toStop < 0.6) { c.inBox = id; claimed = toStop; }
      }
    }
    // characters in the lane band ahead (incl. umbrella / scooter circles)
    for (const a of SP.actors.list) {
      if (Number.isFinite(a.x) && Number.isFinite(a.y)) { const la = L.axis === "x" ? a.y : a.x, lo = (L.axis === "x" ? a.x : a.y) - f; if (Math.abs(la - L.c) > c.hw + 4 || lo * c.dir < -4 || lo * c.dir > 18) continue; }   // broad phase
      for (const [x, y, r] of a.circles()) {
      const lat = L.axis === "x" ? y : x, lon = L.axis === "x" ? x : y;
      if (Math.abs(lat - L.c) > c.hw + r + 0.25) continue;
      const d = (lon - f) * c.dir;
      if (d > -0.2 && d < 14) gap = Math.min(gap, d - r - 0.35);       // only ahead of the bumper: someone beside the car does not freeze it
      }
    }
    // claimed the intersection this step but something else makes it stop before / at the line: release the claim,
    // otherwise cross traffic would see a stopped car and enter while this one still believes it owns the box
    if (claimed != null && gap < claimed + 2 * c.half + 0.5) c.inBox = false;
    // the bus pulls up at its stop (front at bus.stop_at) and dwells there
    const B = TR().bus, serviceStop = c.service && c.service.stops[c.service.next];
    if (serviceStop) { const d = (serviceStop.frontAt - f) * c.dir; if (d > -0.3) gap = Math.min(gap, d + 0.45); }
    else if (c.type === "bus" && !c.service && B && !c.served) { const d = (B.stop_at - f) * c.dir; if (d > -0.3) gap = Math.min(gap, d + 0.45); }
    return gap;
  }
  const capped = (id) => { const l = TR().lanes.find((q) => q.id === id); return !!(l && l.max); };
  T.update = function (dt) {
    const tr = TR(); T.sigT = (T.sigT || 0) + dt;
    for (const l of tr.lanes) {
      if (T.timers[l.id] == null) T.timers[l.id] = 1;
      T.timers[l.id] -= dt;
      if (T.timers[l.id] <= 0) {
        const s = l.dir > 0 ? l.range[0] : l.range[1];
        const clear = !T.cars.some((c) => c.lane === l.id && Math.abs(c.s - s) < 9);
        // a lane with its own cap (l.max, e.g. 南关路) counts only its own cars; the legacy lanes keep sharing max_cars
        // with everything else in T.cars (buses, service cars), so adding capped lanes never thins the old streets
        const room = l.max ? T.cars.filter((c) => c.lane === l.id).length < l.max : T.cars.filter((c) => !capped(c.lane)).length < tr.max_cars;
        if (clear && room) spawn(l);
        T.timers[l.id] = SP.lerp(tr.spawn_every[0], tr.spawn_every[1], SP.rand());
      }
    }
    if (tr.bus && !T.serviceBusManaged && (T.busTimer -= dt) <= 0) {
      const l = tr.lanes.find((q) => q.id === tr.bus.lane), s = l.dir > 0 ? l.range[0] : l.range[1];
      const clear = !T.cars.some((c) => c.lane === l.id && Math.abs(c.s - s) < 14);
      if (clear && !T.cars.some((c) => c.type === "bus") && spawn(l, null, "bus")) T.busTimer = SP.lerp(tr.bus.every[0], tr.bus.every[1], SP.rand());
      else T.busTimer = 2;
    }
    T._frameCars = T.allCars();
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
      const serviceStop = c.service && c.service.stops[c.service.next];
      if (serviceStop && c.v < 0.05) {
        const d = (serviceStop.frontAt - (c.s + c.dir * c.half)) * c.dir;
        if (d > -0.5 && d < 0.4) {
          c.atStop = true; c.stopId = serviceStop.id; c.dwell = (c.dwell || 0) + dt;
          if (c.dwell >= (serviceStop.dwell || 12) && !(c.holdForRider && c.riderDestination === serviceStop.id)) {
            c.service.next++; c.atStop = false; c.stopId = null; c.dwell = 0;
            T.busStops = (T.busStops || 0) + 1;
          }
        }
      } else if (c.type === "bus" && !c.service && !c.served && c.v < 0.05 && tr.bus) {
        const d = (tr.bus.stop_at - (c.s + c.dir * c.half)) * c.dir;
        if (d < 1.0) { c.dwell = (c.dwell || 0) + dt; c.atStop = true; if (c.dwell >= tr.bus.dwell) { c.served = true; c.atStop = false; T.busStops = (T.busStops || 0) + 1; } }
      }
      if (c.v > 0) {
        const ns = c.s + c.dir * c.v * dt, [nx, ny] = xyOf(c.L, ns), np = SP.footPoly(c.rect, c.rot, nx, ny);
        if (hitsActorOrCar(c, np)) c.v = 0; else { c.s = ns; c.x = nx; c.y = ny; c.poly = np; }
      }
      if (c.inBox) { const bid = c.inBox === true ? "ix" : c.inBox, bs = c.L.stops.find((q) => q.box && boxId(q) === bid); if (!inBox(c, 0.5, bid) && (!bs || (c.s - bs.at) * c.dir > 0)) c.inBox = false; }
      if (c.crash && c.crash.phase === "approach" && (c.s - c.crash.veer_at) * c.dir >= 0) { c.crash.phase = "veer"; c.rot = c.crash.rot; c.poly = SP.footPoly(c.rect, c.rot, c.x, c.y); if (hitsActorOrCar(c, c.poly)) { c.rot = c.L.rot; c.poly = SP.footPoly(c.rect, c.rot, c.x, c.y); c.crash.phase = "approach"; c.crash.veer_at -= c.dir * 2; } }
      c.waiting = c.v < 0.05;
    }
    T._frameCars = null;
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
    // lit lamps of the signal heads (housing + pole are static art; only the faces the camera sees carry a lamp frame)
    for (const h of TR().signalHeads || []) {
      if (h.face !== "s" && h.face !== "w") continue;
      const st = T.headState(h), key = SP.frameKey("rq_x_siglamp", h.face, "main", st, 0); if (!SP.frame || !SP.frame(key)) continue;
      const X = SP.sx(h.x, h.y), Y = SP.sy(h.x, h.y, 0), rect = SP.frameRect(key, X, Y);
      if (view && !SP.rectsOverlap(rect, view)) continue;
      // sorted just in front (south-west) of the signal pole, so the lit lamp always lands on top of its own housing
      const px = h.pole ? h.pole[0] : h.x, py = h.pole ? h.pole[1] : h.y;
      const box = { x0: px - 0.42, y0: py - 0.42, x1: px - 0.34, y1: py - 0.34, z0: h.z - 0.5, z1: h.z + 0.5 };
      out.push({ kind: "overlay", key, X, Y, rect, box, depth: (box.x0 + box.y0 + box.x1 + box.y1) / 2, zo: 0, sid: "sig/" + h.id, alpha: 1 });
    }
    return out;
  };
  /** 'r' | 'y' | 'g' for a signal head (its box's phase seen from its approach axis) */
  T.headState = function (h) { const sg = T.signal(h.box); if (!sg) return "r"; return sg.green === h.axis ? "g" : sg.amber === h.axis ? "y" : "r"; };
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
    // signal lamps glow at night (all heads, also those whose lit face looks away from the camera: the glow spills)
    if (night > 0.05) for (const h of TR().signalHeads || []) { const st = T.headState(h), c = st === "g" ? [90, 255, 150] : st === "y" ? [255, 200, 60] : [255, 70, 50];
      out.push({ x: h.x, y: h.y, z: h.z, r: 0.9, c, a: 0.75 * night }); }
    return out;
  };
})(window.SP);
