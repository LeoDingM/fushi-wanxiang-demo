/* scene-proto · simple lane traffic: cars spawn at both ends, keep distance, stop at the stop line while 李默 is on
   the crosswalk (or brake for him anywhere in their lane), and the scripted 'crash at the curb' event. */
(function (SP) {
  "use strict";
  const T = (SP.traffic = { cars: [], timers: {}, crashed: null, n: 0 });
  const RECT = [-0.86, -2.2, 0.86, 2.2], HALF = 2.2, ACC = 2.6, DEC = 6.5;
  const head = (rot) => SP.rotPt([0, -1], rot);
  T.reset = function () {
    T.cars = []; T.crashed = null; T.timers = {}; T.n = 0;
    const tr = SP.world.data.traffic;
    T.parked = SP.world.objects.filter((o) => o.type === "p_car");
    if (!tr) return;
    tr.lanes.forEach((l, i) => (T.timers[l.id] = 0.6 + i * 1.7));
    // a parked car is part of the static scene (objects); moving cars live here
    T.parked = SP.world.objects.filter((o) => o.type === "p_car");
  };
  T.allCars = () => T.cars;
  function spawn(lane, crash) {
    const tr = SP.world.data.traffic, R = SP.rand;
    const x = lane.dir > 0 ? tr.x_range[0] : tr.x_range[1];
    const car = { id: "car" + T.n++, lane: lane.id, dir: lane.dir, x, y: lane.y, rot: lane.rot, v: 0, state: "normal",
                  vmax: SP.lerp(tr.speed[0], tr.speed[1], R()), variant: tr.variants[Math.floor(R() * tr.variants.length)], crash: crash || null };
    car.v = car.vmax * 0.9; car.px = car.x; car.py = car.y; car.snow = SP.clock ? SP.clock.snow * 0.85 : 0;
    car.poly = SP.footPoly(RECT, car.rot, car.x, car.y);
    T.cars.push(car);
    return car;
  }
  T.front = (c) => { const h = head(c.rot); return [c.x + h[0] * HALF, c.y + h[1] * HALF]; };
  /** distance (m) from this car's front to the nearest obstacle ahead in its lane (Infinity if clear) */
  function gapAhead(c) {
    const tr = SP.world.data.traffic, lane = tr.lanes.find((l) => l.id === c.lane), f = T.front(c)[0];
    let gap = Infinity;
    for (const o of T.cars) {
      if (o === c) continue;
      const b = SP.polyBox(o.poly);
      if (b[3] < c.y - 1.2 || b[1] > c.y + 1.2) continue;               // not in my lane band
      const rear = c.dir > 0 ? b[0] : b[2];
      const d = (rear - f) * c.dir;
      if (d > -1.5 && (o.x - c.x) * c.dir > 0) gap = Math.min(gap, d);
    }
    const cw = tr.crosswalk, toStop = (lane.stop_x - f) * c.dir;
    const L = SP.actors && SP.actors.list.length ? SP.actors.list : (SP.player ? [SP.player] : []);
    c.yieldTo = null;
    for (const P of L) {                                                 // 李默 + NPCs: crosswalk + anyone in the lane ahead
      if (P.hidden) continue;
      const onCross = P.x > cw.x0 - 0.6 && P.x < cw.x1 + 0.6 && P.y > cw.y0 - 0.5 && P.y < cw.y1 + 0.3;
      if (onCross && toStop > -0.4 && toStop + 0.2 < gap) { gap = toStop + 0.2; c.yieldTo = P; }
      if (Math.abs(P.y - c.y) < 0.86 + (P.r || 0.3) - 0.03) {          // actually in the car's path (touching the side is not)
        const d = (P.x - f) * c.dir;
        if (d > -0.5 && d < 9 && d - 0.6 < gap) { gap = d - 0.6; c.yieldTo = P; }
      }
    }
    return gap;
  }
  T.update = function (dt) {
    if (!SP.world.data.traffic) return;
    const tr = SP.world.data.traffic;
    for (const l of tr.lanes) {
      T.timers[l.id] -= dt;
      if (T.timers[l.id] <= 0) {
        const x = l.dir > 0 ? tr.x_range[0] : tr.x_range[1];
        const clear = !T.cars.some((c) => c.lane === l.id && Math.abs(c.x - x) < 8);
        if (clear && T.cars.length < 7) spawn(l);
        T.timers[l.id] = SP.lerp(tr.spawn_every[0], tr.spawn_every[1], SP.rand());
      }
    }
    for (const c of T.cars) {
      c.px = c.x; c.py = c.y; c.prot = c.rot;
      if (c.state === "crashed") { c.v = 0; c.t = (c.t || 0) + dt; if (c.t < 9 && SP.rand() < dt * 6) SP.fx.smoke(T.front(c)[0], T.front(c)[1], 0.9, 0, 0); continue; }
      if (c.crash && c.crash.phase === "veer") {
        const h = head(c.rot);
        c.v = Math.max(3.2, c.v - 2 * dt);
        c.x += h[0] * c.v * dt; c.y += h[1] * c.v * dt;
        if (c.y >= c.crash.stop_y) T.impact(c);
      } else {
        const gap = gapAhead(c);
        const allowed = Math.sqrt(2 * DEC * Math.max(0, gap - 1.2));
        c.v = Math.max(0, Math.min(c.v + ACC * dt, c.vmax, allowed));
        if (gap < 1.0) c.v = 0;
        // waiting for someone standing in the road -> honk after a while
        if (c.v < 0.05 && c.yieldTo && Math.abs(c.yieldTo.y - c.y) < 1.5) { c.waitT = (c.waitT || 0) + dt; if (c.waitT > 2.5 && !c.honked) { c.honked = true; c.honkT = SP.now + 0.7; SP.actors && SP.actors.alarm(c.x, c.y, 6); } }
        else { c.waitT = 0; c.honked = false; }
        c.x += c.dir * c.v * dt;
        if (c.crash && c.crash.phase === "approach" && (c.x - c.crash.veer_x) * c.dir >= 0) { c.crash.phase = "veer"; c.rot = c.crash.rot; }
      }
      c.poly = SP.footPoly(RECT, c.rot, c.x, c.y);
      c.waiting = c.v < 0.05;
    }
    T.cars = T.cars.filter((c) => c.state === "crashed" || (c.x >= tr.x_range[0] - 1 && c.x <= tr.x_range[1] + 1));
  };
  /** scene event 'traffic_crash': the next car in the lane veers into the curb by the pole */
  T.crash = function (a) {
    if (T.crashed || T.cars.some((c) => c.crash)) return;
    const lane = SP.world.data.traffic.lanes.find((l) => l.id === a.lane);
    let car = T.cars.filter((c) => c.lane === lane.id && (c.x - a.veer_x) * -lane.dir > 2).sort((p, q) => (p.x - q.x) * -lane.dir)[0];
    // choose the car closest to the veer point that has not passed it; otherwise send a new one in
    if (!car) car = spawn(lane);
    car.crash = { phase: "approach", veer_x: a.veer_x, rot: a.rot, stop_y: a.stop_y };
    car.vmax = Math.max(car.vmax, 6.5);
  };
  T.impact = function (c) {
    c.state = "crashed"; c.v = 0; c.crash.phase = "done"; c.t = 0; T.crashed = c;
    const f = T.front(c);
    SP.fx.crashBurst(f[0], f[1], 34);
    SP.world.decals.push({ key: "fx/crash_decal", x: f[0] + 0.3, y: f[1] - 0.5, t: 0 });
    SP.world.decals.push({ key: "fx/skid", x: c.x + 0.6, y: c.y - 1.2, t: 0 });
    SP.world.timers.push({ at: SP.now + 2.5, a: { do: "decal", frame: "fx/triangle", x: c.x + 5.2, y: 6.2 } });
    SP.world.logEvent("车祸：一辆车冲上路沿撞上了电线杆旁");
    for (const o of SP.world.objects) if (o.type === "p_hydrant" && o.state === "ok" && Math.hypot(o.x - f[0], o.y - f[1]) < 2.8) {
      SP.world.setState(o, "broken"); SP.world.logEvent("消防栓被撞断，水柱喷涌而出！");
    }
    for (const o of SP.world.objects) if ((o.type === "p_bike" && o.state === "parked" || o.type === "p_trashbin" && o.state === "upright") && Math.hypot(o.x - f[0], o.y - f[1]) < 2.2) SP.world.setState(o, "knocked");
    SP.actors && SP.actors.alarm(f[0], f[1], 16);
  };
  T.frameKey = (c) => SP.frameKey("p_car", c.variant, "main", c.state, c.rot);
  /** drawables at the render interpolation factor `al` (fixed-step sim, smooth 60+ fps motion) */
  T.drawables = function (out, al) {
    for (const c of T.cars) {
      const x = c.px + (c.x - c.px) * al, y = c.py + (c.y - c.py) * al;
      const d = c._d || (c._d = { kind: "car", car: c, zo: 0, seq: 50000 + (parseInt(c.id.slice(3)) || 0) });
      d.key = T.frameKey(c); d.X = SP.sx(x); d.Y = SP.sy(y);
      d.line = SP.world.sortLine({ type: "p_car", x, y, rot: c.rot, state: c.state });
      out.push(d);
    }
    return out;
  };
  T.shadowKeys = function (al) {
    return T.cars.map((c) => [SP.frameKey("p_car", "base", "main", c.state, c.rot) + "#shadow", SP.sx(c.px + (c.x - c.px) * al), SP.sy(c.py + (c.y - c.py) * al)]);
  };
  T.glows = function () {
    const night = SP.clock ? SP.clamp((SP.clock.dark - 0.15) / 0.5, 0, 1) : 0, out = [];
    for (const c of T.cars) {
      const h = head(c.rot), side = [-h[1], h[0]], f = T.front(c);
      if ((night > 0.05 || (SP.clock && SP.clock.weather !== "clear" && SP.clock.intensity > 0.3)) && c.state !== "crashed") {
        const nl = Math.max(night, 0.35);                                   // headlight beam: near + far pool on the road
        out.push({ x: f[0] + h[0] * 1.5, y: f[1] + h[1] * 1.5, z: 0, r: 1.9, c: [255, 244, 214], a: 0.75 * nl, flat: true });
        out.push({ x: f[0] + h[0] * 3.9, y: f[1] + h[1] * 3.9, z: 0, r: 3.0, c: [255, 240, 200], a: 0.55 * nl, flat: true });
        for (const s of [-0.6, 0.6]) out.push({ x: f[0] + side[0] * s, y: f[1] + side[1] * s, z: 0.62, r: 0.7, c: [255, 245, 220], a: 0.55 * night });
      }
      const blink = c.state === "crashed" && Math.floor(SP.now * 1.6) % 2 === 0;
      for (const s of [-0.66, 0.66]) {
        const rx = c.x - h[0] * HALF + side[0] * s, ry = c.y - h[1] * HALF + side[1] * s;
        if (blink) {
          out.push({ x: rx, y: ry, z: 0.66, r: 1.2, c: [255, 170, 40], a: 0.8 });
          out.push({ x: f[0] + side[0] * s, y: f[1] + side[1] * s, z: 0.62, r: 1.0, c: [255, 170, 40], a: 0.7 });
        } else if (night > 0.05 || c.waiting) out.push({ x: rx, y: ry, z: 0.66, r: c.waiting ? 0.9 : 0.6, c: [255, 60, 40], a: (c.waiting ? 0.55 : 0.3) * Math.max(night, c.waiting ? 0.6 : 0) });
      }
    }
    return out;
  };
})(window.SP);
