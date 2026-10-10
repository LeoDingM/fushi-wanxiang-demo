/* scene-proto · actors: 李默 (player animator ported from web-demo) + the 5 schedule-driven NPCs.
   NPC logic = web-demo js/schedule.js + npcbrain.js re-authored in metres (scene.json "npcs"): blocks by clock pick a
   goal node + act; a graph path takes them there. Movement is a steering AGENT: every fixed step it may only move to
   a position where its foot circle overlaps no footprint, car, hazard or other actor (player included) -> zero
   overlap by construction; blocked agents side-step (rotated candidate directions) or wait. Reactions: umbrellas in
   rain, stay home in heavy snow / rain (per block), avoid broken glass, '!' when something breaks nearby. */
(function (SP) {
  "use strict";
  const SPR = window.NPC_SPRITES;
  SP.DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const ORDER = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"];
  SP.dirFromVec = function (dx, dy) { const a = Math.atan2(dy, dx); return ORDER[(Math.round(a / (Math.PI / 4)) + 8) % 8]; };   // screen-space (y down)
  const DIRV = { E: [1, 0], SE: [0.7, -0.7], S: [0, -1], SW: [-0.7, -0.7], W: [-1, 0], NW: [-0.7, 0.7], N: [0, 1], NE: [0.7, 0.7] };  // world (y north)
  const L = (SP.LIMO = { box: [72, 102], foot: [36, 95], walkFrames: 12, idleFrames: 4, idleFps: 2.6, strideM: 1.15, turnStep: 0.045, settleStep: 0.05, speed: 1.7, radius: 0.22 });
  SP.spriteAssets = () => Object.entries(SPR).map(([n, m]) => ["sheet_" + n, m.sheet]);
  function sheetDraw(ctx, name, clip, dir, frame, X, Y, alpha) {
    const m = SPR[name], im = SP.img["sheet_" + name]; if (!im || !m.rows[clip]) return;
    const row = m.rows[clip][dir]; if (row == null) return;
    if (alpha != null && alpha < 0.999) ctx.globalAlpha = alpha;
    ctx.drawImage(im, frame * m.box[0], row * m.box[1], m.box[0], m.box[1], X - m.foot[0], Y - m.foot[1], m.box[0], m.box[1]);
    if (alpha != null && alpha < 0.999) ctx.globalAlpha = 1;
  }
  SP.sheetDraw = sheetDraw;

  // ======================= 李默 =======================
  SP.LiMo = function () {
    this.id = "player"; this.x = 0; this.y = 0; this.px = 0; this.py = 0; this.r = L.radius; this.dir = "S"; this.target = "S"; this.moving = false;
    this.phase = 0; this.t = 0; this.turnT = 0; this.frame = 0; this.fps = 0; this.hidden = false; this.carry = null; this.dirVec = [1, 0];
    this.stepAcc = 0; this.foot = 0; this.seq = 100000;
  };
  const LP = SP.LiMo.prototype;
  LP.setDir = function (d) { this.dir = this.target = d; this.turnT = 0; };
  LP.update = function (dt, moving, dir, dist) {
    if (dir && dir !== this.target) { this.target = dir; this.pendT = 0; }
    if (this.target !== this.dir) {
      this.turnT -= dt; this.pendT = (this.pendT || 0) + dt;
      const ai = ORDER.indexOf(this.dir), bi = ORDER.indexOf(this.target);
      const adjRelease = this.dir.length === 2 && this.target.length === 1 && ((bi - ai + 8) % 8 === 1 || (bi - ai + 8) % 8 === 7);
      if (this.turnT <= 0 && (!adjRelease || this.pendT >= 0.07)) {
        const diff = (bi - ai + 8) % 8, s = diff === 4 ? (ai >= 3 && ai <= 5 ? -1 : 1) : diff < 4 ? 1 : -1;
        this.dir = ORDER[(ai + s + 8) % 8]; this.turnT = this.target === this.dir ? 0 : L.turnStep;
      }
    } else this.turnT = 0;
    if (moving && !this.moving) { this.phase = this.settle && this.settle.walk != null ? this.settle.walk / L.walkFrames : 0; this.settle = null; }
    if (!moving && this.moving) { this.t = 0; this.settle = SP.LiMo.planSettle(this.frame); }
    this.moving = moving;
    if (moving) {
      let g = dist; if (g < 1e-4 && dt > 0) g = L.speed * dt * 0.6;
      this.phase = (this.phase + g / L.strideM) % 1;
      this.frame = Math.round(this.phase * L.walkFrames) % L.walkFrames;
    } else if (this.settle) {
      const S = this.settle; S.t += dt; const i = Math.floor(S.t / L.settleStep);
      if (i >= S.steps.length) { this.settle = null; this.t = 0; this.frame = 0; } else { Object.assign(S, S.steps[i]); this.frame = 0; }
    } else { this.t += dt; this.frame = Math.floor(this.t * L.idleFps) % L.idleFrames; }
  };
  SP.LiMo.planSettle = function (f) {
    const N = L.walkFrames, half = N / 2, back = f % half, steps = [];
    let c;
    if (back <= 1) c = f;
    else { const fwd = half - back, n = Math.min(2, fwd); for (let k = 1; k <= n; k++) steps.push({ walk: (f + Math.round((fwd * k) / n)) % N, blend: 0 }); c = (f + fwd) % N; }
    steps.push({ walk: c, blend: 0.4 }, { walk: c, blend: 0.75 });
    while (steps.length < 3) steps.unshift({ walk: f, blend: 0 });
    return { t: 0, steps, walk: steps[0].walk, blend: steps[0].blend, from: f };
  };
  LP.umbrella = function () { const C = SP.clock; return !SP.world.interior && C.weather === "rain" && C.intensity > 0.12 && !this.carry; };
  /** interpolated screen px of the feet (alpha = render interpolation factor) */
  LP.screenAt = function (al) { const x = this.px + (this.x - this.px) * al, y = this.py + (this.y - this.py) * al; return [Math.round(SP.sx(x)), Math.round(SP.sy(y))]; };
  LP.screen = function () { return [Math.round(SP.sx(this.x)), Math.round(SP.sy(this.y))]; };
  LP.bodyRect = function (al) {
    const [X, Y] = this.screenAt(al == null ? 1 : al);
    return { x0: X - 12, x1: X + 12, y0: Y - (this.umbrella() ? 96 : 80), y1: Y - 4 };
  };
  LP.draw = function (ctx, X, Y) {
    const u = this.umbrella(), S = !this.moving && this.settle, w = u ? "uwalk" : "walk", id = u ? "uidle" : "idle";
    if (this.moving) sheetDraw(ctx, "li_mo", w, this.dir, this.frame, X, Y);
    else if (S) {
      if (S.blend > 0) { sheetDraw(ctx, "li_mo", id, this.dir, 0, X, Y); sheetDraw(ctx, "li_mo", w, this.dir, S.walk, X, Y, 1 - S.blend); }
      else sheetDraw(ctx, "li_mo", w, this.dir, S.walk, X, Y);
    } else sheetDraw(ctx, "li_mo", id, this.dir, this.frame, X, Y);
  };

  // ======================= NPC agents =======================
  const A = (SP.actors = { npcs: [], list: [] });
  let G = null, NODES = {}, ADJ = {};
  function path(a, b) {
    if (a === b) return [a];
    const dist = { [a]: 0 }, prev = {}, open = new Set([a]);
    while (open.size) {
      let u = null; for (const n of open) if (u === null || dist[n] < dist[u]) u = n;
      open.delete(u); if (u === b) break;
      for (const v of ADJ[u] || []) { const d = dist[u] + Math.hypot(NODES[u][0] - NODES[v][0], NODES[u][1] - NODES[v][1]); if (dist[v] == null || d < dist[v]) { dist[v] = d; prev[v] = u; open.add(v); } }
    }
    if (dist[b] == null) return [a, b];
    const out = [b]; while (out[0] !== a) out.unshift(prev[out[0]]);
    return out;
  }
  A.path = path;
  function inSpan(m, from, to) { const f = SP.hm(from), t = SP.hm(to); return f <= t ? m >= f && m < t : m >= f || m < t; }
  /** brain: current goal for an NPC from its blocks + weather (engine-agnostic: pure function of clock/weather) */
  function goalOf(a) {
    const C = SP.clock, def = a.def, m = C.min;
    const bad = (u) => u && ((u.includes("rain") && C.weather === "rain" && C.intensity > 0.3) || (u.includes("snow") && C.weather === "snow" && C.intensity > 0.6));
    if (def.trips) {
      if (bad(def.trips.unless)) return { node: def.start, act: "inside", hidden: true, why: "weather" };
      return a.trip || { node: def.start, act: "inside", hidden: true };
    }
    for (const b of def.blocks) if (inSpan(m, b.from, b.to)) {
      if (bad(b.unless)) return { node: def.start, act: "inside", hidden: true, block: b.from, why: "weather" };
      if (b.act === "route") return { route: b.route, wait: b.wait || 0, act: "route", block: b.from };
      return { node: b.at, act: b.act, hidden: b.act === "inside", face: b.face, block: b.from };
    }
    return { node: def.start, act: "inside", hidden: true };
  }
  A.goalOf = goalOf;
  function Agent(id, def, i) {
    this.id = id; this.def = def; this.name = def.name; this.spr = def.sprite; this.r = def.r || 0.24; this.speed = def.speed;
    this.node = def.start; this.hidden = true; const p = NODES[def.start]; this.x = this.px = p[0]; this.y = this.py = p[1];
    this.dir = "S"; this.moving = false; this.phase = 0; this.frame = 0; this.t = 0; this.path = []; this.goalKey = ""; this.wait = 0;
    this.stuck = 0; this.side = i % 2 ? 1 : -1; this.bubble = null; this.seq = 100010 + i * 4; this.stepAcc = 0; this.foot = 0; this.routeIdx = 0;
    this.umbrellaIdx = def.umbrella || 0; this.maxStuck = 0; this.breathT = SP.hash(i, 3) * 3;
  }
  A.init = function (data) {
    G = data.npcs || { graph: { nodes: {}, edges: [], hidden: [] }, agents: {} }; NODES = G.graph.nodes; ADJ = {};
    for (const [u, v] of G.graph.edges) { (ADJ[u] = ADJ[u] || []).push(v); (ADJ[v] = ADJ[v] || []).push(u); }
    A.hiddenNodes = new Set(G.graph.hidden); A.roadNodes = new Set(G.graph.road_nodes || []);
    A.npcs = Object.entries(G.agents).filter(([k]) => k[0] !== "_").map(([id, def], i) => new Agent(id, def, i));
    A.list = [SP.player, ...A.npcs];
    A.audit = { pair: 0, stat: 0, car: 0, checks: 0, worst: [] };
    A.settle(true);
  };
  A.all = () => A.list;
  A.byId = (id) => A.npcs.find((n) => n.id === id);
  /** true if actor `me` could stand at (x, y) */
  A.free = function (me, x, y, r) {
    r = r || me.r;
    if (SP.world.blocked(x, y, r, false, me !== SP.player)) return false;
    for (const o of A.list) {
      if (o === me || o.hidden) continue;
      const dx = o.x - x, dy = o.y - y, rr = o.r + r + 0.01;
      if (dx * dx + dy * dy < rr * rr) return false;
    }
    if (me === SP.player && me.carry) {         // the pushed bike must fit too
      for (const k of [-0.62, 0.62]) { const bx = x + k + me.dirVec[0] * 0.05, by = y - 0.32; if (SP.world.blocked(bx, by, 0.17, false, false)) return false;
        for (const o of A.list) if (o !== me && !o.hidden && Math.hypot(o.x - bx, o.y - by) < o.r + 0.18) return false; }
    }
    return true;
  };
  function planTo(a, goal) {
    a.goal = goal;
    if (goal.route) { a.routeIdx = 0; a.path = path(a.node, goal.route[0]).slice(1).concat([]); a.routeNext = 1; }
    else a.path = path(a.node, goal.node).slice(1);
  }
  const gkey = (g) => (g.route ? "R" + g.block : g.node + "|" + g.act + "|" + (g.hidden ? 1 : 0));
  /** time skip: put every NPC where its schedule says (hidden / at its stay node) */
  A.settle = function (force) {
    for (const a of A.npcs) {
      if (a.def.trips) { a.trip = null; a.hide(a.def.start); continue; }
      const g = goalOf(a); a.goalKey = gkey(g);
      if (g.hidden) { a.hide(g.node); a.goal = g; a.path = []; continue; }
      const n = g.route ? g.route[0] : g.node, p = NODES[n];
      if (A.free(a, p[0], p[1]) || !a.hidden) { a.hidden = false; a.node = n; a.x = a.px = p[0]; a.y = a.py = p[1]; a.goal = g; a.path = []; a.wait = g.route ? g.wait : 0; a.routeIdx = 0; if (g.face) a.dir = g.face; }
      else { a.hide(a.node); a.goalKey = ""; }
    }
  };
  Agent.prototype.hide = function (node) { this.hidden = true; this.node = node; const p = NODES[node]; this.x = this.px = p[0]; this.y = this.py = p[1]; this.moving = false; this.path = []; };
  function carsNear(x) {
    for (const c of SP.traffic.cars) { if (c.state === "crashed") continue; const ahead = (x - c.x) * c.dir; if (ahead > -2.6 && ahead < 3.5 + c.v * 1.6 && c.v > 0.3) return true; if (Math.abs(x - c.x) < 2.8) return true; }
    return false;
  }
  const CAND = [[0, 1], [0.45, 0.95], [-0.45, 0.95], [0.9, 0.8], [-0.9, 0.8], [1.35, 0.6], [-1.35, 0.6], [1.8, 0.4], [-1.8, 0.4], [2.6, 0.35], [-2.6, 0.35]];
  Agent.prototype.update = function (dt, gm) {
    const C = SP.clock, W = SP.world;
    this.px = this.x; this.py = this.y;
    if (this.bubble) { this.bubble.t -= dt; if (this.bubble.t <= 0) this.bubble = null; }
    // rider trips: deterministic per day + window
    if (this.def.trips && this.hidden && !this.trip) {
      const T = this.def.trips, m = C.min;
      for (const [f, t, every] of T.windows) if (inSpan(m, f, t)) {
        const slot = Math.floor((m - SP.hm(f) + 1440) % 1440 / every), start = SP.hm(f) + slot * every + SP.hash(C.day * 97 + slot, SP.strHash(f)) * every * 0.5;
        if (m >= start && m < start + 3 && this.lastSlot !== C.day + ":" + f + ":" + slot) { this.lastSlot = C.day + ":" + f + ":" + slot; this.trip = { node: T.stop_at, act: "stop", hidden: false, face: T.face, stopUntil: null }; }
        break;
      }
    }
    const g = goalOf(this), k = gkey(g);
    if (k !== this.goalKey) { this.goalKey = k; if (!this.hidden) planTo(this, g); else this.goal = g; }
    if (this.hidden) {
      if (g.hidden && g.node === this.node) return;
      const p = NODES[this.node];
      if (!A.free(this, p[0], p[1])) return;                       // wait until the spawn spot is free
      this.hidden = false; this.x = this.px = p[0]; this.y = this.py = p[1]; planTo(this, g);
      if (this.node === "door_in") W.pulseDoor && W.pulseDoor();
      return;
    }
    let tx, ty, final = false;
    if (this.path.length) { const n = this.path[0]; [tx, ty] = NODES[n]; }
    else {
      // arrived at the goal node
      const goal = this.goal || g;
      if (goal.hidden) { if (this.node === "door_in") W.pulseDoor && W.pulseDoor(); this.hide(goal.node); if (this.def.trips) this.trip = null; return; }
      if (goal.route) {
        this.wait -= gm; this.act = "idle"; this.moving = false; this.anim(dt, 0);
        if (this.wait <= 0) { const R = goal.route; this.routeNext = ((this.routeNext || 0) + 1) % R.length; this.path = path(this.node, R[this.routeNext]).slice(1); this.wait = goal.wait; }
        return;
      }
      if (this.def.trips && goal.act === "stop") {
        if (goal.stopUntil == null) goal.stopUntil = C.abs() + this.def.trips.stop_min;
        if (C.abs() >= goal.stopUntil) { this.trip = { node: this.def.start, act: "inside", hidden: true }; }
      }
      this.act = goal.act; this.moving = false; if (goal.face) this.dir = goal.face; this.anim(dt, 0); return;
    }
    // courtyard gate closed? NPCs push it open on their way through
    if ((this.node === "gate_in" && this.path[0] === "gate_out") || (this.node === "gate_out" && this.path[0] === "gate_in")) {
      const g = W.objects.filter((o) => o.interact === "gate");
      if (g.some((o) => o.state !== "open")) { for (const o of g) { o.state = "open"; W.touch(o); } W.rebuildColliders(); W.logEvent(`${this.name}推开了院门`); }
    }
    // road crossing: wait at the curb while cars approach
    if (A.roadNodes.has(this.node) && A.roadNodes.has(this.path[0]) && !this.onRoad) {
      if (carsNear(this.x)) { this.moving = false; this.act = "idle"; this.anim(dt, 0); return; }
      this.onRoad = true;
    }
    if (!A.roadNodes.has(this.path[0])) this.onRoad = false;
    const dx = tx - this.x, dy = ty - this.y, d = Math.hypot(dx, dy);
    // waypoint reached (or occupied by someone else and we're close: count it and go on -> no orbiting)
    if (d < 0.1 || (d < 0.95 && !A.free(this, tx, ty)) || (this.stuck > 3 && d < 0.7 && this.path.length === 1)) { this.node = this.path.shift(); this.stuck = 0; this.anim(dt, 0); return; }
    let sp = this.speed * (C.weather === "rain" && C.intensity > 0.5 ? 1.12 : 1) * (this.stuck > 1.5 ? 0.6 : 1);
    const step = Math.min(d, sp * dt), ux = dx / d, uy = dy / d;
    // pick the side to pass on from the nearest actor ahead
    let near = null, nd = 1.6;
    for (const o of A.list) { if (o === this || o.hidden) continue; const ox = o.x - this.x, oy = o.y - this.y, dd = Math.hypot(ox, oy); if (dd < nd && ox * ux + oy * uy > 0) { nd = dd; near = o; } }
    if (near) { const cr = ux * (near.y - this.y) - uy * (near.x - this.x); this.side = cr > 0 ? -1 : 1; }
    let moved = false;
    for (let i = 0; i < CAND.length; i++) {
      const [ang0, f] = CAND[i], ang = ang0 * (this.side || 1);
      if (i === 0 && near && nd < 0.9) continue;                 // someone right ahead: start veering
      const c = Math.cos(ang), s = Math.sin(ang), vx = ux * c - uy * s, vy = ux * s + uy * c, st = step * f;
      const nx = this.x + vx * st, ny = this.y + vy * st;
      if (A.free(this, nx, ny)) { this.x = nx; this.y = ny; moved = true; break; }
    }
    if (!moved && !(near && nd < 0.9)) { /* tried straight already */ }
    if (!moved) { this.stuck += dt; this.maxStuck = Math.max(this.maxStuck, this.stuck); if (this.stuck > 2.2 && Math.floor(this.stuck * 2) % 3 === 0) this.side = -this.side; }
    else this.stuck = Math.max(0, this.stuck - dt * 2);
    const dist = Math.hypot(this.x - this.px, this.y - this.py);
    this.moving = dist > 1e-5;
    if (this.moving) this.dir = SP.dirFromVec(this.x - this.px, -(this.y - this.py));
    this.act = this.def.trips ? "ride" : "walk";
    this.anim(dt, dist);
    A.groundEffects(this, dist);
  };
  Agent.prototype.anim = function (dt, dist) {
    const m = SPR[this.spr];
    this.t += dt;
    if (this.moving) {
      const clip = this.def.trips ? "ride" : "walk", n = m.clips[clip];
      this.phase = (this.phase + dist / m.stride_m) % 1; this.clip = clip; this.frame = Math.floor(this.phase * n) % n;
      return;
    }
    const act = this.act;
    let clip = "idle", fps = 2.6;
    if (this.def.trips) { clip = "stop"; fps = 1; }
    else if (act === "cook" && m.clips.cook) { const serve = m.clips.serve && Math.floor(this.t / 6) % 4 === 3; clip = serve ? "serve" : "cook"; fps = 7; }
    else if (act === "chat" && m.clips.chat) { clip = "chat"; fps = 5; }
    this.clip = clip; this.frame = Math.floor(this.t * fps) % m.clips[clip];
  };
  Agent.prototype.umbrella = function () { const C = SP.clock; return !this.def.trips && C.weather === "rain" && C.intensity > 0.12 && this.act !== "cook"; };
  Agent.prototype.screenAt = function (al) { const x = this.px + (this.x - this.px) * al, y = this.py + (this.y - this.py) * al; return [Math.round(SP.sx(x)), Math.round(SP.sy(y))]; };
  Agent.prototype.draw = function (ctx, X, Y) {
    sheetDraw(ctx, this.spr, this.clip || "idle", this.dir, this.frame || 0, X, Y);
    if (this.umbrella()) SP.drawFrame(ctx, `fx/umbrella/${this.umbrellaIdx % 4}`, X + (this.dir.includes("W") ? -4 : 4), Y - 46);
  };
  Agent.prototype.drawBubble = function (ctx, X, Y) {
    if (!this.bubble) return;
    const top = Y - (this.umbrella() ? 100 : 98);
    ctx.fillStyle = "rgba(250,248,240,0.95)"; ctx.fillRect(X - 6, top - 12, 12, 13); ctx.fillRect(X - 2, top + 1, 4, 3);
    ctx.fillStyle = "#c0392b"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center"; ctx.fillText(this.bubble.text, X, top - 2);
  };
  /** something broke / honked at (x, y): NPCs within r turn to look with a '!' */
  A.alarm = function (x, y, r) {
    for (const a of A.npcs) if (!a.hidden && Math.hypot(a.x - x, a.y - y) < r) { a.bubble = { t: 1.6, text: "!" }; if (!a.moving) a.dir = SP.dirFromVec(x - a.x, -(y - a.y)); }
  };
  /** footprints in snow, splashes in puddles, kicking through leaf piles, winter breath */
  A.groundEffects = function (a, dist) {
    const C = SP.clock, W = SP.world;
    if (W.interior) return;
    a.stepAcc += dist;
    if (a.stepAcc > 0.34) {
      a.stepAcc = 0; a.foot ^= 1;
      if (C.snow > 0.12 && !a.def?.trips) SP.render.stamp(a.x + (a.foot ? 0.09 : -0.09), a.y, a.def && a.def.trips ? 2 : 1);
      if (a.def && a.def.trips && C.snow > 0.12) SP.render.stamp(a.x, a.y, 2);
      if (C.wet > 0.35) for (const p of W.puddles) { const q = Math.hypot((a.x - p.x) / p.rx, (a.y - p.y) / p.ry); if (q < 1) { SP.fx.splash(a.x, a.y, 7); break; } }
    }
    if (C.season === "autumn") for (const p of W.leafPiles) if (p.state === "pile" && Math.abs(a.x - p.x) < 0.55 && Math.abs(a.y - p.y) < 0.35) {
      p.state = "scattered"; p.since = C.abs(); SP.fx.leafBurst(p.x, p.y, 22); W.logEvent(`${a.name || "李默"}踢散了一堆落叶`);
    }
    if ((C.season === "winter" || C.weather === "snow") && C.ambient[0] < 250 || C.season === "winter") {
      a.breathT = (a.breathT || 0) - 1 / 60;
      if (a.breathT <= 0) { a.breathT = 2.2 + Math.random() * 1.2; const dv = DIRV[a.dir] || [0, -1]; SP.fx.breath(a.x + dv[0] * 0.18, a.y + dv[1] * 0.1 - 0.02, 1.55); }
    }
  };
  /** per fixed step */
  A.update = function (dt, gm) { for (const a of A.npcs) a.update(dt, gm); };
  /** clipping audit of the current state: actor-actor overlaps, actors inside footprints / cars */
  A.check = function () {
    const out = { pair: 0, stat: 0, car: 0, detail: [] }, vis = A.list.filter((a) => !a.hidden);
    for (let i = 0; i < vis.length; i++) {
      const a = vis[i];
      for (let j = i + 1; j < vis.length; j++) { const b = vis[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < a.r + b.r - 0.005) { out.pair++; out.detail.push(`${a.id}~${b.id} d=${d.toFixed(3)}`); } }
      const s = SP.world.blocked(a.x, a.y, a.r - 0.005, true, false);
      if (s && s !== "bounds") { out.stat++; out.detail.push(`${a.id} in ${s}`); }
      for (const c of SP.traffic.cars) if (SP.circlePoly(a.x, a.y, a.r - 0.005, c.poly)) { out.car++; out.detail.push(`${a.id} in ${c.id}`); }
    }
    return out;
  };
  /** NPC graph validation: every edge sampled every 0.1 m must be clear of static footprints for the agent radius */
  A.validateRoutes = function () {
    const bad = [];
    for (const [u, v] of G.graph.edges) {
      const a = NODES[u], b = NODES[v], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.1);
      for (let i = 0; i <= n; i++) {
        const x = a[0] + (b[0] - a[0]) * i / n, y = a[1] + (b[1] - a[1]) * i / n;
        const hid = (i === 0 && A.hiddenNodes.has(u)) || (i === n && A.hiddenNodes.has(v));
        const r = 0.34, hit = SP.world.blocked(x, y, r, true, false);
        if (hit && !hid) { bad.push(`${u}-${v}@(${x.toFixed(2)},${y.toFixed(2)}):${hit}`); break; }
      }
    }
    return bad;
  };
})(window.SP);
