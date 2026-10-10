/* NPC runtime: schedule-driven (js/schedule.js + js/npcbrain.js) 3D-rendered sprites (art-pack/sprites3d).
   The brain gives the exact scheduled state for the clock; this module only *displays* it smoothly:
   - display position follows the scheduled one with a speed/accel limit (no snapping; time skips > 3 min re-sync)
   - facing from the velocity with hysteresis + a hold time, turning one 45 deg step at a time (no flicker)
   - walk / ride animation advanced by distance actually travelled (feet / wheels don't slide)
   - pedestrians wait for, then step aside around, the player instead of pushing into him */
(function (FW) {
  "use strict";
  const ORDER = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"];
  const ANG = { E: 0, SE: 45, S: 90, SW: 135, W: 180, NW: -135, N: -90, NE: -45 };
  const angDiff = (a, b) => { let d = ((a - b) % 360 + 540) % 360 - 180; return d; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  FW.NPC_SPRITES = {
    vendor: { box: [144, 204], foot: [72, 189], stride: 93.62, clips: { idle: 4, walk: 12, cook: 8, serve: 6, cart: 1 } },
    uncle: { box: [144, 204], foot: [72, 189], stride: 88.94, clips: { idle: 4, walk: 12, chat: 8 } },
    office: { box: [144, 204], foot: [72, 189], stride: 117.08, clips: { idle: 4, walk: 12 } },
    student: { box: [144, 204], foot: [72, 189], stride: 99.73, clips: { idle: 4, walk: 12 } },
    rider: { box: [160, 224], foot: [80, 189], stride: 80.5, clips: { ride: 8, stop: 1 } },  // stride = one wheel turn
  };
  // register frames with the loader (config.js has already built FW.ASSETS)
  for (const id in FW.NPC_SPRITES)
    for (const c in FW.NPC_SPRITES[id].clips)
      for (const d of ORDER)
        for (let i = 0; i < FW.NPC_SPRITES[id].clips[c]; i++) FW.ASSETS[`${id}.${c}_${d}_${i}`] = `img/sprites/npc3d/${id}/${c}_${d}_${i}.png`;

  function NPC(id, def) {
    this.id = id; this.def = def; this.spr = FW.NPC_SPRITES[def.sprite];
    this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.ready = false;
    this.dir = "S"; this.target = "S"; this.turnT = 0; this.holdT = 0;
    this.phase = 0; this.t = 0; this.alpha = 0; this.moving = false; this.stillT = 0;
    this.act = "inside"; this.actT = 0; this.serve = 0;
    this.off = [0, 0]; this.blockT = 0; this.dirChanges = 0;
  }
  FW.NPC = NPC;

  FW.NPCs = function () {
    const S = FW.SCHEDULE;
    this.list = Object.keys(S.npcs).map((id) => new NPC(id, S.npcs[id]));
    this.by = {}; for (const n of this.list) this.by[n.id] = n;
    this.vendor = this.by.vendor; this.uncle = this.by.uncle; this.rider = this.by.rider;
    this.plans = {}; this.lastClock = null; this.cartA = 0;
  };
  FW.NPCs.prototype.planFor = function (n, clock, weather) {
    const day = FW.dayIndex(clock), key = day + "|" + weather;
    if (!this.plans[n.id] || this.plans[n.id].key !== key) {
      this.plans[n.id] = FW.NPCBrain.planDay(n.def, FW.SCHEDULE.graph, { weather }, day);
      this.plans[n.id].key = key;
    }
    return this.plans[n.id];
  };
  /** schedule state for a given clock (also used by the playtest) */
  FW.NPCs.prototype.scheduled = function (id, clock, weather) {
    return FW.NPCBrain.sample(this.planFor(this.by[id], clock, weather || FW.state.weather), clock);
  };

  FW.NPCs.prototype.update = function (dt, mins, fx) {
    const st = FW.state, weather = st.weather, P = FW.player;
    const jump = this.lastClock == null || Math.abs(mins - this.lastClock) > 3;   // sleep / T-key skip / boot: re-sync
    this.lastClock = mins;
    for (const n of this.list) {
      const s = FW.NPCBrain.sample(this.planFor(n, mins, weather), mins);
      n.sched = s;
      // ---- position: follow the schedule (with the avoidance offset), speed + accel limited ----
      const ped = !n.def.trips;
      let tx = s.x, ty = s.y;
      if (ped && !s.hidden && P && st.scene === "exterior") {
        // player in the way? wait, then step aside perpendicular to the walking direction
        const vx = s.vx, vy = s.vy, sp = Math.hypot(vx, vy);
        const px = P.x - n.x, py = (P.y - n.y) * 1.6, pd = Math.hypot(px, py);
        const ahead = sp > 1 ? (px * vx + py * vy * 1.6) / (sp * (pd || 1)) : -1;
        const blocked = pd < 34 && ahead > 0.2;
        n.blockT = blocked ? n.blockT + dt : Math.max(0, n.blockT - dt * 2);
        let ox = 0, oy = 0;
        if (n.blockT > 0.5 && sp > 1) { const side = (vx * py - vy * px) > 0 ? 1 : -1; ox = (-vy / sp) * 26 * side; oy = (vx / sp) * 26 * side * 0.55; }
        n.off[0] += (ox - n.off[0]) * Math.min(1, dt * 2.5); n.off[1] += (oy - n.off[1]) * Math.min(1, dt * 2.5);
        tx += n.off[0]; ty += n.off[1];
        if (blocked && n.blockT < 0.5) { tx = n.x; ty = n.y; }   // wait a moment first
      } else { n.off[0] = n.off[1] = 0; n.blockT = 0; }
      const ox0 = n.x, oy0 = n.y;
      if (jump || !n.ready) { n.x = tx; n.y = ty; n.vx = n.vy = 0; n.ready = true; n.alpha = s.hidden ? 0 : 1; }
      else {
        const vmax = n.def.speed * (ped ? 1.35 : 1.1) + 4, acc = vmax * 4;       // px/s, px/s^2 (1 game min = 1 s)
        const dx = tx - n.x, dy = ty - n.y, d = Math.hypot(dx, dy);
        // desired velocity: reach the target, braking smoothly near it
        const want = Math.min(vmax, Math.sqrt(2 * acc * d), d / Math.max(dt, 1e-3));
        const wx = d > 1e-3 ? dx / d * want : 0, wy = d > 1e-3 ? dy / d * want : 0;
        const ax = wx - n.vx, ay = wy - n.vy, am = Math.hypot(ax, ay), lim = acc * dt;
        if (am > lim) { n.vx += ax / am * lim; n.vy += ay / am * lim; } else { n.vx = wx; n.vy = wy; }
        n.x += n.vx * dt; n.y += n.vy * dt;
        if (Math.hypot(tx - n.x, ty - n.y) < 0.05) { n.x = tx; n.y = ty; }
      }
      const mx = n.x - ox0, my = n.y - oy0, msp = dt > 0 ? Math.hypot(mx, my) / dt : 0;
      // ---- moving state with hysteresis ----
      if (msp > 6) { n.moving = true; n.stillT = 0; } else if (msp < 2) { n.stillT += dt; if (n.stillT > 0.15) n.moving = false; }
      // ---- facing: from the velocity (in input space, undoing the ground foreshortening) with hysteresis ----
      if (n.moving && msp > 3) {
        const a = Math.atan2(my / FW.WALK_Y, mx) * 180 / Math.PI;
        const cur = ANG[n.target];
        if (Math.abs(angDiff(a, cur)) > 22.5 + 14) {                       // beyond the sector + margin
          n.holdT += dt;
          if (n.holdT > 0.12 || jump) { n.target = ORDER[(Math.round(a / 45) + 8) % 8]; n.holdT = 0; }
        } else n.holdT = 0;
      } else if (!n.moving && s.face && n.serve <= 0) n.target = s.face;
      if (n.serve > 0 && n.faceTo) n.target = n.faceTo;
      if (jump) { n.dir = n.target; }
      else if (n.dir !== n.target) {
        n.turnT -= dt;
        if (n.turnT <= 0) {
          const a = ORDER.indexOf(n.dir), b = ORDER.indexOf(n.target), diff = (b - a + 8) % 8;
          const sgn = diff === 4 ? (a >= 1 && a <= 3 ? -1 : 1) : diff < 4 ? 1 : -1;
          n.dir = ORDER[(a + sgn + 8) % 8]; n.turnT = 0.07; n.dirChanges++;
        }
      }
      // ---- animation by distance ----
      const sc = FW.SCENES.exterior.actorScale;
      const g = Math.hypot(mx / sc, my / sc / FW.LIMO.groundY);
      if (n.moving) n.phase = (n.phase + g / n.spr.stride) % 1;
      n.t += dt;
      n.serve = Math.max(0, n.serve - dt);
      if (s.act !== n.act) { n.act = s.act; n.actT = 0; } else n.actT += dt;
      // ---- visibility fade (entering / leaving buildings, off-screen ends) ----
      const vis = s.hidden && !n.moving ? 0 : 1;
      n.alpha = jump ? vis : clamp(n.alpha + (vis - n.alpha) * Math.min(1, dt * 4), 0, 1);
      if (n.alpha < 0.01 && vis === 0) n.alpha = 0;
    }
    // vendor's cart: visible during the stall hours, fading in/out during setup / pack-up
    const v = this.vendor, cartDef = v.def.cart;
    const cm = FW.NPCBrain.dayMin(mins), [c0, c1] = [FW.NPCBrain.dayMin(FW.NPCBrain.hm(cartDef.from)), FW.NPCBrain.dayMin(FW.NPCBrain.hm(cartDef.to))];
    const inHours = cm >= c0 && cm < c1;
    let ca = inHours ? 1 : 0;
    if (v.sched && v.sched.act === "setup") ca = clamp(v.actT / 20, 0, 1);                // takes ~20 s to set up
    if (v.sched && v.sched.act === "packup") ca = 1 - clamp(v.actT / 15, 0, 1);
    if (v.sched && v.sched.act === "walk" && !inHours) ca = 0;
    this.cartA = jump ? ca : this.cartA + (ca - this.cartA) * Math.min(1, dt * 3);
    // vendor wok steam while cooking
    fx.extraSteam = fx.extraSteam.filter((e) => !e.vendor);
    if (this.cartA > 0.5 && v.alpha > 0.5) {
      const N = FW.SCHEDULE.graph.nodes[cartDef.at];
      fx.extraSteam.push({ x: N[0] - 8, y: N[1] - 22, rate: v.serve > 0 ? 12 : 6, spread: 12, ttl: 1, vendor: true, scale: 0.9 });
      fx.extraSteam.push({ x: N[0] + 14, y: N[1] - 28, rate: 4, spread: 8, ttl: 1, vendor: true, scale: 0.8 });
    }
  };

  /** which frame to draw for an NPC right now */
  FW.NPCs.prototype.frameOf = function (n) {
    const C = n.spr.clips, d = n.dir, id = n.def.sprite;
    let clip, i;
    if (n.def.trips) {
      if (n.moving || n.sched.act === "ride") { clip = "ride"; i = Math.floor(n.phase * C.ride) % C.ride; }
      else { clip = "stop"; i = 0; }
    } else if (n.moving) { clip = "walk"; i = Math.round(n.phase * C.walk) % C.walk; }
    else if (n.serve > 0 && C.serve) { clip = "serve"; i = Math.min(C.serve - 1, Math.floor((2.6 - n.serve) / 2.6 * C.serve)); }
    else if ((n.act === "cook" || n.act === "setup" || n.act === "packup") && C.cook) { clip = "cook"; i = Math.floor(n.t * (n.act === "cook" ? 7 : 4)) % C.cook; }
    else if (n.act === "chat" && C.chat) { clip = "chat"; i = Math.floor(n.t * 3) % C.chat; }
    else { clip = "idle"; i = Math.floor(n.t * 2.4) % (C.idle || 1); }
    return FW.img[`${id}.${clip}_${d}_${i}`];
  };

  /** draw items {y, draw()} for depth sorting with the player */
  FW.NPCs.prototype.items = function (scale, light, mins) {
    const out = [], n8 = FW.nightFactor(mins);
    for (const n of this.list) {
      if (n.alpha <= 0.01) continue;
      const im = this.frameOf(n);
      out.push({ y: n.y, npc: n.id, draw: (ctx) => {
        const X = Math.round(n.x), Y = Math.round(n.y);
        const rider = !!n.def.trips;
        FW.drawShadow(ctx, X, Y - 1, (rider ? 40 : 24) * scale, (rider ? 11 : 7.5) * scale, 0.42 * n.alpha);
        if (rider && n8 > 0.2) { // headlight
          const a = ANG[n.dir] * Math.PI / 180, hx = Math.cos(a), hy = Math.sin(a);
          ctx.save(); ctx.globalCompositeOperation = "lighter";
          FW.glow(ctx, X + hx * 26, Y - 40 * scale * 2 + hy * 8, 46, "255,235,180", 0.32 * n8 * n.alpha);
          FW.glow(ctx, X + hx * 90, Y + hy * 40, 80, "255,225,170", 0.12 * n8 * n.alpha);
          ctx.restore();
        }
        FW.drawFrame(ctx, im, X, Y, { scale, fx: n.spr.foot[0], fy: n.spr.foot[1], light, alpha: n.alpha,
          warm: n.id === "vendor" ? n8 * 0.25 : 0 });
      } });
    }
    // the cart stands in front of the vendor's spot (drawn just after her in depth order)
    if (this.cartA > 0.01) {
      const N = FW.SCHEDULE.graph.nodes[this.vendor.def.cart.at], im = FW.img["vendor.cart_S_0"], a = this.cartA;
      out.push({ y: N[1] + 2, npc: "cart", draw: (ctx) => {
        FW.drawShadow(ctx, N[0], N[1] + 10, 26 * scale, 7 * scale, 0.35 * a);
        FW.drawFrame(ctx, im, N[0], N[1], { scale, fx: 72, fy: 189, light, alpha: a, warm: n8 * 0.3 });
      } });
    }
    return out;
  };

  /** foot ellipses the player collides with (x, y, r with y scaled x1.6 in game.js) */
  FW.NPCs.prototype.blockers = function () {
    const b = [];
    for (const n of this.list) if (n.alpha > 0.5 && !n.def.trips) b.push({ x: n.x, y: n.y, r: 15 });
    if (this.cartA > 0.5) { const N = FW.SCHEDULE.graph.nodes[this.vendor.def.cart.at]; b.push({ x: N[0], y: N[1] + 8, r: 26 }); }
    return b;
  };
  /** vendor turns to the customer and hands the bag over */
  FW.NPCs.prototype.serveTo = function (x, y) {
    const v = this.vendor; v.serve = 2.6;
    v.faceTo = FW.dirFromVec(x - v.x, (y - v.y) / FW.WALK_Y);
  };
})(window.FW);
