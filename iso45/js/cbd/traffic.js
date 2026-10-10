/* 云汇CBD · traffic: fixed-cycle signals (EW / NS + yellow + all-red), 14 lanes (6 + 6 car lanes, 2 BRT), simple
   car-following (stop lines, queue spill-back check, pedestrians ahead), taxis pull in at the 云汇天地 rank, buses at the
   curb stop, BRT buses dwell at the 云汇中心 station. Density follows the rules schedule 'traffic' (rush hours). */
(function (SP) {
  "use strict";
  const C = SP.cbd, X = C._; if (!X) return; C._mods.traffic = true;
  const { D, F, SX, SY, TR, NPC, rnd, clamp } = X;
  const TD = D.traffic, SG = TD.signal, CYC = SG.EW + SG.Y + SG.AR + SG.NS + SG.Y + SG.AR;
  TR.lanes = TD.lanes.map((l) => Object.assign({ cars: [], acc: 0 }, l));
  function phase(t) {
    const m = ((t % CYC) + CYC) % CYC;
    if (m < SG.EW) return { EW: "G", NS: "R", left: SG.EW - m };
    if (m < SG.EW + SG.Y) return { EW: "Y", NS: "R", left: 0 };
    if (m < SG.EW + SG.Y + SG.AR) return { EW: "R", NS: "R", left: 0 };
    const n = m - SG.EW - SG.Y - SG.AR;
    if (n < SG.NS) return { EW: "R", NS: "G", left: SG.NS - n };
    if (n < SG.NS + SG.Y) return { EW: "R", NS: "Y", left: 0 };
    return { EW: "R", NS: "R", left: 0 };
  }
  C.phase = () => phase(TR.t);
  /** pedestrians may start crossing leg 'leg' only with >= minLeft s of their green left */
  X.pedGreen = (leg, minLeft) => { const ph = phase(TR.t), P = TD.cw_phase[leg]; return ph[P] === "G" && ph.left >= (minLeft || 0); };
  const VARS = ["base", "red", "base", "base", "red"];
  function place(c) {
    const L = c.L;
    if (L.ax === "x") { c.x = c.s; c.y = L.c; c.hx = L.dir; c.hy = 0; } else { c.x = L.c; c.y = c.s; c.hx = 0; c.hy = L.dir; }
    c.rot = L.ax === "x" ? (L.dir > 0 ? 2 : 6) : (L.dir > 0 ? 4 : 0);
  }
  function spawnCar(L, s) {
    const brt = !!L.brt, bus = !brt && !!L.bus && rnd() < 0.08, taxi = !brt && !bus && rnd() < 0.32;
    const len = brt || bus ? 18 : 4.6;
    const c = { L, s, v: 0, vmax: brt ? 13 : bus ? 10 : 11 + rnd() * 4, len, hl: len / 2, hw: brt || bus ? 1.3 : 1.02, kind: brt ? "brt" : bus ? "bus" : taxi ? "taxi" : "car",
                variant: taxi ? "taxi" : VARS[Math.floor(rnd() * VARS.length)], dwell: 0, served: false, id: ++TR.n };
    c.v = c.vmax * 0.8;
    if (taxi && L.taxi && rnd() < 0.6) c.pull = true;
    if (bus) c.busStop = true;
    place(c); L.cars.push(c); TR.cars.push(c); return c;
  }
  X.trafficInit = function () {
    const span = TD.span;
    for (const L of TR.lanes) {
      const dens = 0.35 + 0.65 * X.schedule("traffic");
      for (let s = span[0] + 10 + rnd() * 20; s < span[1] - 10; s += (L.brt ? 160 : 26 / dens) * (0.7 + rnd() * 0.6)) {
        const c = spawnCar(L, L.dir > 0 ? s : span[1] + span[0] - s); c.v = c.vmax * 0.6;
      }
    }
  };
  X.trafficStep = function (dt) {
    TR.t += dt;
    const ph = phase(TR.t), span = TD.span, dens = 0.25 + 0.75 * X.schedule("traffic"), P = C.player;
    const walkers = NPC.list.concat(P ? [P] : []);
    for (const L of TR.lanes) {
      L.cars.sort((a, b) => (b.s - a.s) * L.dir);
      const sig = ph[L.sig];
      for (let i = 0; i < L.cars.length; i++) {
        const c = L.cars[i], lead = L.cars[i - 1], front = c.s + L.dir * c.hl;
        let gap = 1e9;
        if (lead) gap = (lead.s - L.dir * lead.hl - front) * L.dir;
        const dl = (L.stop - front) * L.dir;
        if (sig !== "G" && dl > -0.5 && (sig === "R" || dl > c.v * c.v / 8 + 1)) gap = Math.min(gap, dl - 0.3);
        if (sig === "G" && dl > 0 && dl < 6 && lead) {                      // don't block the box
          const after = (lead.s - L.dir * lead.hl - (L.stop + L.dir * 40)) * L.dir; if (after < c.len + 1) gap = Math.min(gap, dl - 0.3);
        }
        const stopAt = (a0, a1, kind) => {
          const d = ((a0 + a1) / 2 - c.s) * L.dir;
          if (!c.served && d > -0.5 && d < 40) {
            gap = Math.min(gap, d + 0.5);
            if (Math.abs(d) < 0.9 && c.v < 0.4) { c.dwell += dt; if (c.dwell > (kind === "brt" ? 9 : 6)) { c.served = true; c.dwell = 0; } }
          }
        };
        if (c.kind === "brt" && L.station) stopAt(L.station[0], L.station[1], "brt");
        if (c.pull && L.taxi) stopAt(L.taxi[0], L.taxi[1], "taxi");
        if (c.busStop && L.bus) stopAt(L.bus[0], L.bus[1], "bus");
        for (const a of walkers) {
          if (a.hidden || a.gone) continue;
          const ax = L.ax === "x" ? a.x : a.y, ay = L.ax === "x" ? a.y : a.x;
          if (Math.abs(ay - L.c) > c.hw + 0.6) continue;
          const d = (ax - front) * L.dir; if (d > -0.3 && d < 14) gap = Math.min(gap, d - 1.2);
        }
        const want = gap < 1e8 ? clamp((gap - 1.5) / 1.4, 0, c.vmax) : c.vmax;
        c.v = want < c.v ? Math.max(want, c.v - 9 * dt) : Math.min(want, c.v + 2.2 * dt);
        if (gap < 0.3) c.v = 0;
        c.s += L.dir * c.v * dt; place(c);
      }
      for (let i = L.cars.length - 1; i >= 0; i--) {
        const c = L.cars[i];
        if ((L.dir > 0 && c.s > span[1]) || (L.dir < 0 && c.s < span[0])) { L.cars.splice(i, 1); TR.cars.splice(TR.cars.indexOf(c), 1); }
      }
      L.acc += dt * (L.brt ? 1 / 60 : dens * 0.42);
      if (L.acc >= 1) {
        const s0 = L.dir > 0 ? span[0] : span[1]; let near = 1e9;
        for (const c of L.cars) near = Math.min(near, Math.abs(c.s - s0) - c.hl);
        if (near > 8) { spawnCar(L, s0); L.acc -= 1; } else L.acc = Math.min(L.acc, 1.5);
      }
    }
  };
  function carPoly(c) { const ux = c.hx * c.hl, uy = c.hy * c.hl, vx = -c.hy * c.hw, vy = c.hx * c.hw; return [[c.x - ux - vx, c.y - uy - vy], [c.x + ux - vx, c.y + uy - vy], [c.x + ux + vx, c.y + uy + vy], [c.x - ux + vx, c.y - uy + vy]]; }
  /** cars use the street kit (p_car incl. taxi variant); BRT / city buses use kit_cbd brt_bus */
  X.carDrawable = function (c) {
    const Xs = Math.round(SX(c.x, c.y)), Ys = Math.round(SY(c.x, c.y, 0));
    let key, f, atlas;
    if (c.kind === "brt" || c.kind === "bus") { key = `brt_bus/base/default/-/${c.rot}`; f = F[key]; atlas = "cbd"; }
    else { const K0 = SP.K || window.KIT_MANIFEST; if (!K0) return null; key = `p_car/${c.variant}/main/normal/${c.rot}`; f = K0.frames[key] || K0.frames[`p_car/base/main/normal/${c.rot}`]; atlas = "core"; }
    if (!f) return null;
    return { kind: "car", c, key, f, X: Xs, Y: Ys, atlas, rect: { x0: Xs - f[4], y0: Ys - f[5], x1: Xs - f[4] + f[2], y1: Ys - f[5] + f[3] }, sh: [{ p: carPoly(c) }], z0: 0, z1: atlas === "cbd" ? 3.3 : 1.5, depth: c.x + c.y, alpha: 1 };
  };
})(window.SP = window.SP || {});
