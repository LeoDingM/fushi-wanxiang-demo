/* scene-proto-45 · interactions, damage + auto-repair, hazards, event log (ported from scene-proto/js/world.js §11;
   same scene.json "interactions" table, so both lines share the rules):
   - every object with `interact: kind` uses the table by its current state: use (E / 互动) and kick (F / 踢) actions with
     fields to (state), fx, decal, hazard (radius, NPCs avoid it), toast, log, do (push_bike, buy_drink, water,
     toggle_spray, honk, alarm), repair / grow = state -> state after N in-game hours (W.updateRules, every game minute)
   - puddles (when wet), leaf piles (autumn) and the laundry line are interactable too
   - 45-degree specifics: a state change that grows a footprint (knocked bin / bike, pot) is refused while a character or
     a car stands in the new footprint (zero interpenetration holds for state changes too); the pushed shared bike adds
     its own foot circles to 李默 (it collides, sorts and turns like a vehicle). */
(function (SP) {
  "use strict";
  const W = SP.world;
  const C = () => SP.clock;
  W.initRules = function (data) {
    W.defs = data.interactions || {};
    W.hazards = []; W.log = W.log || [];
    W.puddles = (data.puddles || []).map((p) => Object.assign({}, p));
    W.leafPiles = (data.leaf_piles || []).map((p) => Object.assign({ state: "pile", since: -1e9 }, p));
    W.laundry = (data.laundry || []).map((L) => Object.assign({ state: "hung", since: 0, wet: 0 }, L));
    for (const o of W.objects) { o.since = 0; if (o.interact === "shop" || o.interact === "eatery" || o.interact === "metro") o.open_state = o.open_state || o.state; }
    W.lastRuleMin = -1;
  };
  W.logEvent = function (text) {
    const c = C();
    W.log.push(c ? { t: c.abs(), day: c.day, clock: c.clockLabel(), text } : { t: SP.now, text });
    if (W.log.length > 80) W.log.shift();
  };
  /** footprint polygons the object WOULD have in `state` */
  function footprintsIn(o, state) { const s = o.state; o.state = state; const f = W.footprints(o); o.state = s; return f; }
  /** characters / cars inside a set of polygons (for refusing unsafe state changes) */
  W.occupied = function (polys, ignore) {
    for (const a of SP.actors.list) {
      if (a.hidden || a === ignore) continue;
      for (const [x, y, r] of a.circles()) for (const p of polys) if (SP.circlePoly(x, y, r + 0.01, p)) return a.id;
    }
    for (const car of SP.traffic.allCars()) for (const p of polys) { const b = SP.polyBox(p), q = SP.polyBox(car.poly); if (!(b[2] < q[0] || b[0] > q[2] || b[3] < q[1] || b[1] > q[3])) return car.id; }
    return null;
  };
  /** state change through one door: refuses if the new footprint would swallow a character / car; returns ok */
  W.setState = function (o, state, force) {
    if (!o || o.state === state) return true;
    const P = W.piece(o);
    if (!force && P.layer === "sorted" && P.footprint_states) {
      const now = W.footprints(o), next = footprintsIn(o, state);
      const grows = JSON.stringify(now) !== JSON.stringify(next);
      if (grows && W.occupied(next)) return false;
    }
    o.state = state; o.since = C() ? C().abs() : 0; o._box = null; if (SP.env && SP.env.invalidateLights) SP.env.invalidateLights();
    W.rebuildColliders(); W.groundDirty = true;
    return true;
  };
  W.def = (o) => W.defs[o.interact] || null;
  const fmt = (s, o, d) => s.replace("{name}", (o && o.name) || (d && d.name) || "").replace("{hours}", o && o.hours ? o.hours.join("–") : "");
  /** every game minute: repairs, growth, shop hours, laundry vs rain, leaf piles, hazards expire */
  W.updateRules = function () {
    const c = C(), now = c.abs(), scale = W.data.repair_hours_scale || 1;
    for (const o of W.objects) {
      if (!o.interact) continue;
      const d = W.defs[o.interact];
      if (o.interact === "shop" || o.interact === "eatery" || (o.interact === "metro" && o.hours)) {
        const [a, b] = o.hours.map(SP.hm), open = c.min >= a && c.min < b;
        const want = open ? o.open_state : "shut";
        if (o.state !== want) { W.setState(o, want, true); W.logEvent(o.interact === "metro" ? (open ? `${o.name}开站` : `${o.name}末班车已过，拉上闸门`) : open ? `${o.name}开门营业` : `${o.name}拉下卷帘门打烊`); }
        continue;
      }
      if (!d) continue;
      const rep = d.repair && d.repair[o.state];
      if (rep && now - o.since >= rep.after_h * 60 * scale) {
        if (W.setState(o, rep.to)) {
          if (rep.clear_decals) W.clearDecals(o.id);
          if (rep.clear_hazard || rep.clear_decals) W.clearHazards(o.id);
          if (o.interact === "hydrant") o.spray = 0;
          if (rep.log) W.logEvent(fmt(rep.log, o, d));
        }
      }
      const gr = d.grow && d.grow[o.state];
      if (gr && o.watered != null && now - o.watered >= gr.after_h * 60) { if (W.setState(o, gr.to)) { o.watered = null; W.logEvent(`${d.name}浇过水，长大了一圈`); } }
    }
    const raining = c.weather === "rain" && c.intensity > 0.25;
    for (const L of W.laundry) {
      if (L.mine) continue;
      const d = W.defs[L.interact] || {};
      if (L.state === "hung" && raining) { L.state = "taken"; L.since = now; W.logEvent("下雨了，邻居赶紧把晾的衣服收回家"); }
      else if (L.state === "taken" && !raining && c.wet < 0.3 && c.min > 420 && c.min < 1080 && now - L.since > 30) { L.state = "hung"; L.since = now; L.wet = 0.6; W.logEvent("天晴了，邻居又把衣服晾了出来"); }
      const rep = d.repair && d.repair[L.state];
      if (rep && now - L.since >= rep.after_h * 60 * scale) { L.state = rep.to; L.since = now; W.clearDecals(L.id); if (rep.log) W.logEvent(rep.log); }
      if (L.state === "hung") L.wet = Math.max(0, L.wet - 1 / 240);
    }
    for (const p of W.leafPiles) if (p.state === "scattered" && now - p.since > 180) { p.state = "pile"; W.logEvent("清洁工把落叶又扫成了一堆"); }
    for (const h of W.hazards) if (h.until && now > h.until) h.dead = true;
    W.hazards = W.hazards.filter((h) => !h.dead);
  };
  W.clearDecals = (owner) => { W.decals = W.decals.filter((d) => d.owner !== owner); };
  W.clearHazards = (owner) => { W.hazards = W.hazards.filter((h) => h.owner !== owner); };
  W.addHazard = (x, y, r, owner, hours) => W.hazards.push({ x, y, r, owner, until: hours ? C().abs() + hours * 60 : 0 });
  /** NPCs keep out of hazard circles (broken glass): true if (x, y, r) is inside one it was not already inside */
  W.hazardBlocks = function (x0, y0, x, y, r) {
    for (const h of W.hazards) {
      const dn = Math.hypot(x - h.x, y - h.y), d0 = Math.hypot(x0 - h.x, y0 - h.y);
      if (dn < h.r + r && dn < d0 - 1e-6) return true;          // moving deeper into it (walking out is always allowed)
    }
    return false;
  };

  // ---------- interactions ----------
  /** anchor point of an interactable on the ground (where you stand to use it) */
  function reachPt(o, x, y) {
    if (o.reach && Array.isArray(o.reach[0])) {        // several approach spots (bed: its open long side): the nearest one
      if (x == null) return o.reach[0];
      return o.reach.reduce((b, p) => (Math.hypot(x - p[0], y - p[1]) < Math.hypot(x - b[0], y - b[1]) ? p : b));
    }
    if (o.reach) return o.reach;
    if (o.type === "f_door") return W.local(o, 1.5, -0.9, 0);
    if (o.interact === "gate") return W.local(o, o.type === "w_gate_l" ? 0.85 : -0.85, 0, 0);
    if (o.interact === "window" || o.interact === "shop" || o.interact === "eatery") return W.local(o, 1.5, -0.6, 0);
    if (o.interact === "poster") return W.local(o, -0.3, -0.45, 0);
    const fp = W.footprints(o); if (fp.length) { const b = SP.polyBox(fp[0]); return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]; }
    return [o.x, o.y];
  }
  W.reachPt = reachPt;
  /** nearest interactable in reach of (x, y): objects, laundry, puddles (wet), leaf piles (autumn) */
  /** every interactable in reach, best first: distance to its (nearest) approach spot, minus a bonus for the one 李默
      faces. W.nearList keeps the ranked list so the player can cycle (Tab / Q · phone ⇄) when several are in reach. */
  W.nearest = function (x, y, dir) {
    let best = null, bd = 1.6;
    const roof = SP.player && SP.player.level === "roof", cands = [];
    const fv = dir && SP.dirVec[dir] ? SP.dirVec[dir] : null, fl = fv ? Math.hypot(fv[0], fv[1]) || 1 : 1;
    for (const o of W.objects) {
      if (!o.interact || o.carried) continue;
      if (!W.interior && ((o.z || 0) >= 17) !== roof) continue;          // street things from the street, roof things on the roof
      if (SP.game && SP.game.actionFor && W.interior && SP.game.actionFor(o, "use") === null && !(W.defs[o.interact] && W.defs[o.interact].kick)) continue;   // nothing to do here
      const p = reachPt(o, x, y);
      let d = Math.hypot(x - p[0], y - p[1]) - (o.interact === "gate" ? 0.3 : o.interact === "car" ? 2.2 : o.interact === "window" || o.interact === "shop" ? 0.4 : 0.8);
      if ((o.interact === "window" || o.interact === "shop") && d > 0.9) continue;
      if (d >= 1.6) continue;
      let sc = d;
      if (fv) { const vx = o.x - x, vy = o.y - y, L = Math.hypot(vx, vy) || 1; sc -= 0.45 * Math.max(0, (vx * fv[0] + vy * fv[1]) / (L * fl)); }
      cands.push([sc, o]);
      if (d < bd) { bd = d; best = o; }
    }
    cands.sort((a, b) => a[0] - b[0]); W.nearList = cands.map((c) => c[1]);
    if (W.nearList.length) { best = W.nearList[0]; bd = Math.min(bd, 0.79); }
    for (const L of W.laundry) {
      if (L.mine || (!W.interior && (L.z >= 17) !== roof)) continue;       // 李默's own racks: via the washer / rack / roof post
      const a = W.byId[L.from], b = W.byId[L.to]; if (!a || !b) continue;
      const t = SP.clamp(((x - a.x) * (b.x - a.x) + (y - a.y) * (b.y - a.y)) / ((b.x - a.x) ** 2 + (b.y - a.y) ** 2), 0, 1);
      const d = Math.hypot(x - (a.x + (b.x - a.x) * t), y - (a.y + (b.y - a.y) * t)) - 0.55;
      if (d < bd) { bd = d; best = { interact: "laundry", L, id: L.id, x: a.x + (b.x - a.x) * t, y: a.y }; }
    }
    const c = C();
    if (c.wet > 0.3) for (const p of W.puddles) { const d = Math.hypot((x - p.x) / Math.max(1, p.rx), (y - p.y) / Math.max(0.6, p.ry * 2)) - 0.2; if (d < 0.8 && d < bd) { bd = d; best = { interact: "puddle", p, id: p.id, x: p.x, y: p.y }; } }
    if (c.season === "autumn") for (const p of W.leafPiles) { if (p.state !== "pile") continue; const d = Math.hypot(x - p.x, y - p.y) - 0.5; if (d < bd) { bd = d; best = { interact: "leafpile", p, id: p.id, x: p.x, y: p.y }; } }
    return best;
  };
  W.actionFor = function (o, kind) {
    if (!o) return null;
    if (SP.game) { const g = SP.game.actionFor(o, kind); if (g !== undefined) return g; }
    if (o.interact === "puddle") return kind === "use" ? { label: "踩水" } : { label: "跺脚溅水" };
    if (o.interact === "leafpile") return kind === "use" ? { label: "捧起落叶" } : { label: "踢散落叶" };
    if (o.interact === "laundry") { const d = W.defs.laundry; return d && d[kind] && d[kind][o.L.state] || null; }
    if (o.interact === "gate") return kind === "use" ? { label: o.state === "open" ? "关上铁门" : "推开铁门" } : null;
    if (o.interact === "door") return kind === "use" ? { label: o.state === "open" ? "关单元门" : "开单元门" } : null;
    if (o.interact === "stall") return kind === "use" ? { label: "早点摊" } : null;
    if (o.interact === "locker") return kind === "use" ? { label: "快递柜" } : null;
    const d = W.defs[o.interact];
    if (o.interact === "shop") return kind === "use" ? (d.use[o.state === "shut" ? "closed" : "open"]) : null;
    return d && d[kind] && d[kind][o.state] || null;
  };
  /** run the use / kick action of an interactable; returns a toast string (or null) */
  W.act = function (o, kind, actor) {
    const a = W.actionFor(o, kind);
    if (!a) return null;
    const d = W.defs[o.interact] || {};
    if (o.interact === "puddle") { SP.fx.splash(o.p.x, o.p.y, kind === "kick" ? 34 : 22); W.logEvent("李默在水坑里踩了一脚，水花四溅"); SP.actors.alarm(o.p.x, o.p.y, 3); return "啪嗒！水花四溅"; }
    if (o.interact === "leafpile") { o.p.state = "scattered"; o.p.since = C().abs(); SP.fx.leafBurst(o.p.x, o.p.y, 26); W.logEvent("李默踢散了一堆落叶"); return kind === "kick" ? "哗——落叶飞了一地" : "捧起一把落叶撒向空中"; }
    if (o.interact === "laundry") {
      const L = o.L;
      if (a.to) { L.state = a.to; L.since = C().abs(); }
      if (a.fx === "cloth") SP.fx.debris(o.x, o.y - 0.1, 1.6, 18, [[212, 120, 120], [122, 158, 214], [230, 224, 207], [226, 182, 48]]);
      if (a.decal) W.decals.push({ key: a.decal, x: o.x, y: o.y + (a.decal_dy || 0), owner: L.id });
      if (a.clear_decals) W.clearDecals(L.id);
      if (a.log) W.logEvent(a.log);
      if (kind === "kick") { SP.fx.shake = 0.18; SP.actors.alarm(o.x, o.y, 8); }
      return a.toast ? a.toast.replace("{dry}", L.wet > 0.2 ? "衣服还潮着呢" : "晒得干干的，有太阳的味道") : a.log || null;
    }
    if (a.do === "game") return SP.game.use(o);
    if (a.do) { const r = W.doSpecial(a.do, o, actor); if (r !== undefined) return r; }
    if (a.to && !W.setState(o, a.to)) return "有人挡着，先让开";
    if (a.fx) W.objFx(o, a.fx);
    if (a.decal) W.decals.push({ key: a.decal, x: o.x + (a.decal_dx || 0), y: o.y + (a.decal_dy || 0), owner: o.id });
    if (a.clear_decals) { W.clearDecals(o.id); W.clearHazards(o.id); }
    if (a.hazard) { const hp = a.hazard_at || [0, -0.8], q = W.local(o, hp[0], hp[1], 0); W.addHazard(q[0], q[1], a.hazard, o.id); }
    if (a.log) W.logEvent(fmt(a.log, o, d));
    if (kind === "kick") { SP.fx.shake = 0.18; SP.actors.alarm(o.x, o.y, 9); }
    return a.toast ? fmt(a.toast, o, d) : (a.log ? fmt(a.log, o, d) : null);
  };
  W.objFx = function (o, fx) {
    if (fx === "glass") { const q = o.type === "p_lamp" ? W.local(o, 0, -0.9, 4.1) : W.local(o, 0, -0.45, 1.3); SP.fx.glassBurst(q[0], q[1], q[2], 26); }
    else if (fx === "glass_window") {
      const p = W.local(o, 1.5, -0.15, (o.z || 0) + 1.6); SP.fx.glassBurst(p[0], p[1], p[2], 34, SP.rotPt([0, -1], o.rot), SP.rotPt([1, 0], o.rot));
      const q = W.local(o, 1.5, -0.85, 0); W.timers.push({ at: SP.now + 1.0, a: { do: "decal", frame: "fx/glass_decal", x: q[0], y: q[1], owner: o.id } });
    }
    else if (fx === "pot") SP.fx.debris(o.x, o.y, 0.4, 16, [[93, 143, 166], [180, 96, 60], [90, 70, 54]]);
    else if (fx === "paper") { const q = W.local(o, -0.3, -0.2, 0); SP.fx.debris(q[0], q[1], 1.3, 14, [[233, 225, 204], [192, 70, 58]]); }
  };
  W.doSpecial = function (what, o, actor) {
    const c = C(), P = SP.player;
    switch (what) {
      case "push_bike":
        if (P.carry) return "手上已经推着一辆车了";
        P.carry = o; o.carried = true; W.rebuildColliders();
        if (!SP.actors.shapeClear(P, P.x, P.y, P.dir)) { P.carry = null; o.carried = false; W.rebuildColliders(); return "这里太挤，推不出来"; }
        W.logEvent("李默扫码解锁了一辆共享单车"); return "扫码成功：推着走（再按 互动 停车）";
      case "buy_drink":
        SP.fx.pickup(o.x, o.y - 0.5, 0.35); W.logEvent("李默在售货机买了一瓶冰红茶"); return undefined;
      case "water":
        SP.fx.water(o.x, o.y, 0.9); if (o.state === "small") o.watered = c.abs(); W.logEvent("李默给盆栽浇了水"); return undefined;
      case "toggle_spray":
        o.spray = o.spray ? 0 : c.abs() + 20; W.logEvent(o.spray ? "李默拧开了消防栓，水哗哗地流" : "消防栓的阀门被关上了");
        return o.spray ? "拧开阀门：水流了出来" : "关上了阀门";
      case "honk":
        o.honkT = SP.now + 0.6; SP.actors.alarm(o.x, o.y, 7); W.logEvent("李默按了一下停着的车的喇叭"); return "嘀——！";
      case "alarm":
        o.alarmUntil = SP.now + 6; SP.actors.alarm(o.x, o.y, 12); return undefined;
    }
    return undefined;
  };
  /** park the bike 李默 is pushing exactly where it is (its foot circles are already clear) */
  W.parkBike = function (p) {
    const o = p.carry; if (!o) return false;
    const g = p.bikePose(p.x, p.y, p.dir);
    const save = [o.x, o.y, o.rot];
    o.x = g.x; o.y = g.y; o.rot = g.rot; o.carried = false; o.state = "parked";
    const polys = W.footprints(o), B = W.data.bounds;
    let ok = polys.every((poly) => { const b = SP.polyBox(poly); return b[0] >= B.x0 && b[2] <= B.x1 && b[1] >= B.y0 && b[3] <= B.y1; });
    if (ok) for (const poly of polys) for (const c of W.colliders) if (c.id !== o.id && polyOverlap(poly, c.poly)) { ok = false; break; }
    p.carry = null;
    if (ok && W.occupied(polys, p)) ok = false;
    if (ok) {      // 李默 himself must not end up inside the parked bike
      for (const poly of polys) if (SP.circlePoly(p.x, p.y, p.radius, poly)) ok = false;
    }
    if (!ok) { o.x = save[0]; o.y = save[1]; o.rot = save[2]; o.carried = true; p.carry = o; return false; }
    o.since = C().abs(); o._box = null; W.rebuildColliders(); W.logEvent("李默把共享单车停好、锁车");
    return true;
  };
  function polyOverlap(A, B) {        // convex SAT
    for (const P of [A, B]) for (let i = 0; i < P.length; i++) {
      const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length], nx = y2 - y1, ny = x1 - x2;
      let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9;
      for (const [x, y] of A) { const v = x * nx + y * ny; a0 = Math.min(a0, v); a1 = Math.max(a1, v); }
      for (const [x, y] of B) { const v = x * nx + y * ny; b0 = Math.min(b0, v); b1 = Math.max(b1, v); }
      if (a1 <= b0 + 1e-6 || b1 <= a0 + 1e-6) return false;
    }
    return true;
  }
  W.polyOverlap = polyOverlap;
})(window.SP);
