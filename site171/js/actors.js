/* scene-proto-45 · characters: one Actor class for 李默 and the NPCs (sprites = art-pack/sprites3d/out45, packed by
   tools/pack_actors.py). Animator ported from scene-proto/js/limo.js (walk phase driven by ground distance / stride,
   gradual 8-direction turning, walk->idle settle). The 8 directions are WORLD directions (E = screen up-right,
   S = screen down-right, SW = facing the camera).
   Collision shape = world-space foot circles: a person is one circle (r 0.22-0.24 m; 0.55 m with an open umbrella,
   its real canopy radius), the delivery rider + scooter is three circles r 0.34 at -0.55/0/+0.55 m along the heading
   (1.7 x 0.68 m). Characters never overlap each other or any footprint: every move is tested before it is applied,
   and W.resolveActors() pushes apart anything that still overlaps (spawn, teleport, state changes). */
(function (SP) {
  "use strict";
  const ORDER = SP.DIRS;                       // CCW from east
  const TURN_STEP = 0.045, SETTLE_STEP = 0.05, IDLE_FPS = 2.6;
  const A = (SP.Actor = function (opt) {
    Object.assign(this, { id: "actor", set: "li_mo", x: 0, y: 0, dir: "SW", target: "SW", moving: false, phase: 0, t: 0, turnT: 0, frame: 0,
                          radius: 0.22, height: 1.85, speed: 1.7, vehicle: false, umbrella: false, clip: null, isPlayer: false }, opt);
    this.target = this.dir;
  });
  /** atlas set: umbrella (李默), + winter wear (puffer + scarf) when it is cold; winter atlases load lazily */
  A.prototype.atlasName = function () {
    if (this.homeClip && SP.img.actor_li_mo_home) return "li_mo_home";     // indoor poses (sit at the PC, lie in bed, cook)
    let b = this.umbrella && this.isPlayer ? "li_mo_umb" : this.set;
    for (const h of SP.outfitHooks) { const o = h(this); if (o) { b = o; break; } }      // modules (store uniform ...) pick an outfit here
    if (!SP.img["actor_" + b]) {                    // sheet not loaded yet (lazy module sprites): load it, draw the fallback meanwhile
      if (window.ACTORS[b]) SP.ensureActor(b);
      b = this.isPlayer ? (this.baseSet || "li_mo") : (this.sprite_fallback && SP.img["actor_" + this.sprite_fallback] ? this.sprite_fallback : this.sprite || b);
    }
    if (SP.winterWear && window.ACTORS[b + "_w"]) { if (SP.img["actor_" + b + "_w"]) return b + "_w"; SP.ensureActor(b + "_w"); }
    return b;
  };
  A.prototype.data = function () { return window.ACTORS[this.atlasName()]; };
  SP.outfitHooks = SP.outfitHooks || [];   // [(actor) => set name | null]: first non-null wins (core API for outfit modules)
  SP.ensureActor = function (name) {
    if (!window.ACTORS[name]) return;
    if (SP.img["actor_" + name] || (SP._actLoading || (SP._actLoading = {}))[name]) return;
    SP._actLoading[name] = true; const im = new Image(); im.onload = () => { SP.img["actor_" + name] = im; if (SP.tintedActors) SP.tintedActors[name] = im; }; im.src = window.ACTORS[name].img;
  };
  A.prototype.setDir = function (d) { this.dir = this.target = d; this.turnT = 0; };
  A.prototype.r = function () { return this.umbrella ? 0.55 : this.radius; };
  /** foot circles [x, y, r] (optionally for another position / facing) */
  A.prototype.circles = function (x, y, dir) {
    if (this.hidden) return [];                 // indoors (sheltering from the weather): no shape anywhere
    x = x == null ? this.x : x; y = y == null ? this.y : y;
    if (this.carry) {               // pushing a shared bike: its 3 wheel / frame circles beside him (js/interact.js)
      const g = this.bikePose(x, y, dir || this.dir), out = [[x, y, this.r()]];
      for (const d of [-0.6, 0, 0.6]) out.push([g.x + g.f[0] * d, g.y + g.f[1] * d, 0.25]);
      return out;
    }
    if (!this.vehicle) return [[x, y, this.r()]];
    const h = SP.dirVec[dir || this.dir];
    return [-0.55, 0, 0.55].map((d) => [x + h[0] * d, y + h[1] * d, this.radius]);
  };
  /** where the pushed bike is for a position / facing: axis-aligned (rot 0/2/4/6 frames), 0.47 m to his right */
  const BIKE_F = { 0: [0, -1], 2: [1, 0], 4: [0, 1], 6: [-1, 0] };
  A.prototype.bikePose = function (x, y, dir) {
    const h = SP.dirVec[dir || this.dir]; let best = 0, bd = -9;
    for (const r of [0, 2, 4, 6]) { const f = BIKE_F[r], d = f[0] * h[0] + f[1] * h[1] + (r === (this._bikeRot || 0) ? 0.05 : 0); if (d > bd) { bd = d; best = r; } }
    const f = BIKE_F[best]; return { x: x + f[1] * 0.47, y: y - f[0] * 0.47, rot: best, f };
  };
  // ---------- animation ----------
  function turnToward(from, to) {
    const a = ORDER.indexOf(from), b = ORDER.indexOf(to), diff = (b - a + 8) % 8;
    if (diff === 0) return from;
    let s = diff < 4 ? 1 : -1;
    if (diff === 4) {                          // 180 deg: turn through the camera-facing side (SW)
      const via1 = ORDER[(a + 2) % 8], d1 = Math.min((ORDER.indexOf(via1) - 5 + 8) % 8, (5 - ORDER.indexOf(via1) + 8) % 8);
      const via2 = ORDER[(a + 6) % 8], d2 = Math.min((ORDER.indexOf(via2) - 5 + 8) % 8, (5 - ORDER.indexOf(via2) + 8) % 8);
      s = d1 <= d2 ? 1 : -1;
    }
    return ORDER[(a + s + 8) % 8];
  }
  A.prototype.update = function (dt, moving, dir, dist) {
    if (dir && dir !== this.target) { this.target = dir; this.pendT = 0; }
    if (this.target !== this.dir) {
      this.turnT -= dt; this.pendT = (this.pendT || 0) + dt;
      if (this.turnT <= 0 && (this.pendT >= 0.06 || !moving || true)) {
        const nd = turnToward(this.dir, this.target);
        if (!(this.vehicle || this.carry) || SP.actors.shapeClear(this, this.x, this.y, nd)) { this.dir = nd; this.turnT = this.target === this.dir ? 0 : TURN_STEP; if (this.carry) this._bikeRot = this.bikePose(this.x, this.y, nd).rot; }
      }
    } else this.turnT = 0;
    const D = this.data(), walkN = this.walkClip() ? D.clips[this.walkClip()] : 1;
    if (moving && !this.moving) { this.phase = this.settle && this.settle.walk != null ? this.settle.walk / walkN : this.phase; this.settle = null; }
    if (!moving && this.moving && !this.vehicle) { this.t = 0; this.settle = A.planSettle(this.frame, walkN); }
    this.moving = moving;
    if (this.clip) {
      this.t += dt; const N = D.clips[this.clip] || 1, f = Math.floor(this.t * 6), I = this.clipIntro || 0;
      this.frame = f < I ? f : this.clipHold ? N - 1 : I + (f - I) % Math.max(1, N - I); return;
    }
    if (moving) {
      let g = dist; if (g < 1e-4 && dt > 0) g = this.speed * dt * 0.4;
      const stride = this.vehicle ? 1.6 : this.walkClip() === "run" ? 2.0 : (D.stride_m || 1.15);
      this.phase = (this.phase + g / stride) % 1;
      this.frame = Math.round(this.phase * walkN) % walkN;
    } else if (this.settle) {
      const S = this.settle; S.t += dt;
      const i = Math.floor(S.t / SETTLE_STEP);
      if (i >= S.steps.length) { this.settle = null; this.t = 0; this.frame = 0; } else { Object.assign(S, S.steps[i]); this.frame = 0; }
    } else { this.t += dt; this.frame = Math.floor(this.t * IDLE_FPS) % (D.clips[this.idleClip()] || 1); }
  };
  A.prototype.walkClip = function () { return this.vehicle ? "ride" : this.umbrella && this.isPlayer ? "uwalk" : (this.runK || 0) > 0.5 && this.data().clips.run ? "run" : "walk"; };
  A.prototype.idleClip = function () { return this.vehicle ? "stop" : this.umbrella && this.isPlayer ? "uidle" : "idle"; };
  A.planSettle = function (f, N) {
    const half = N / 2, back = f % half, steps = [];
    let c;
    if (back <= 1) c = f;
    else { const fwd = half - back, n = Math.min(2, fwd); for (let k = 1; k <= n; k++) steps.push({ walk: (f + Math.round((fwd * k) / n)) % N, blend: 0 }); c = (f + fwd) % N; }
    steps.push({ walk: c, blend: 0.4 }, { walk: c, blend: 0.75 });
    while (steps.length < 3) steps.unshift({ walk: f, blend: 0 });
    return { t: 0, steps, walk: steps[0].walk, blend: steps[0].blend, from: f };
  };
  /** frame keys to draw: [[key, alpha], ...] */
  A.prototype.frameKeys = function () {
    const d = this.dir, S = !this.moving && this.settle;
    if (this.clip) return [[`${this.clip}_${d}_${this.frame}`, 1]];
    if (this.kickT > 0) return [[`${this.walkClip()}_${d}_3`, 1]];          // kick: hold the widest stride for a beat
    if (this.moving) return [[`${this.walkClip()}_${d}_${this.frame}`, 1]];
    if (S) return S.blend > 0 ? [[`${this.idleClip()}_${d}_0`, 1], [`${this.walkClip()}_${d}_${S.walk}`, 1 - S.blend]] : [[`${this.walkClip()}_${d}_${S.walk}`, 1]];
    return [[`${this.idleClip()}_${d}_${this.frame}`, 1]];
  };
  A.prototype.screen = function () { return [Math.round(SP.sx(this.x, this.y)), Math.round(SP.sy(this.x, this.y, this.z || 0))]; };
  /** screen rect of the sprite (union of drawn frames) */
  A.prototype.spriteRect = function () {
    const [X, Y] = this.screen(), D = this.data(); let r = null;
    for (const [k] of this.frameKeys()) {
      const f = D.frames[k]; if (!f) continue;
      const x0 = X - Math.round(f[4]), y0 = Y - Math.round(f[5]), q = { x0, y0, x1: x0 + f[2], y1: y0 + f[3] };
      r = r ? { x0: Math.min(r.x0, q.x0), y0: Math.min(r.y0, q.y0), x1: Math.max(r.x1, q.x1), y1: Math.max(r.y1, q.y1) } : q;
    }
    r = r || { x0: X - 12, y0: Y - 80, x1: X + 12, y1: Y };
    if (this.umbrella && !this.isPlayer) { const f = SP.frame(this.umbKey()); if (f) { const ux = X + this.umbDX() - f[4], uy = Y - 36 - f[5]; r = { x0: Math.min(r.x0, ux), y0: Math.min(r.y0, uy), x1: Math.max(r.x1, ux + f[2]), y1: r.y1 }; } }
    if (this.carry) { const k = this.bikeKey(), g = this.bikePose(this.x, this.y, this.dir), q = SP.frameRect(k, SP.sx(g.x, g.y), SP.sy(g.x, g.y, 0)); if (q) r = { x0: Math.min(r.x0, q.x0), y0: Math.min(r.y0, q.y0), x1: Math.max(r.x1, q.x1), y1: Math.max(r.y1, q.y1) }; }
    if (this.bubble) r = { x0: Math.min(r.x0, X - 8), y0: Math.min(r.y0, Y - 100), x1: Math.max(r.x1, X + 8), y1: r.y1 };
    if(this.conflictSpeech?.until>SP.now)r={x0:Math.min(r.x0,X-88),x1:Math.max(r.x1,X+88),y0:Math.min(r.y0,Y-210),y1:r.y1};
    return r;
  };
  A.prototype.umbKey = function () { return `fx/umbrella/${(this.umbIdx || 0) % 4}`; };
  A.prototype.umbDX = function () { return this.dir.includes("W") || this.dir === "S" ? -3 : 3; };
  A.prototype.bikeKey = function () { const g = this.bikePose(this.x, this.y, this.dir); return SP.frameKey("p_bike", "base", "main", "parked", g.rot); };
  A.prototype.bodyRect = function () { const [X, Y] = this.screen(); return { x0: X - 12, x1: X + 12, y0: Y - 76, y1: Y - 4 }; };
  A.prototype.draw = function (ctx, raw, erase) {
    const [X0, Y] = this.screen(), D = this.data(), src = raw ? SP.img["actor_" + this.atlasName()] : (SP.tintedActors[this.atlasName()] || SP.img["actor_" + this.atlasName()]);
    if (!src || !D) return;                     // sheet still loading (lazy module sprite): skip this frame rather than throw
    let X = X0;
    if (this.kickT > 0) { const v = SP.dirVec[this.dir]; X += Math.round((v[0] - v[1]) * 2); }
    let bikeAfter = false, g = null;
    if (this.carry) { g = this.bikePose(this.x, this.y, this.dir); bikeAfter = g.x + g.y < this.x + this.y; if (!bikeAfter) drawBike(ctx, this, g); }
    const fr = this.frosted && !erase; if (fr) { ctx.save(); ctx.filter = "blur(1.1px) saturate(0.35) brightness(1.25)"; }
    for (const [k, a] of this.frameKeys()) {
      const f = D.frames[k]; if (!f) continue;
      if (a < 0.999 || fr) ctx.globalAlpha = fr ? 0.78 : a;
      ctx.drawImage(src, f[0], f[1], f[2], f[3], X - Math.round(f[4]), Y - Math.round(f[5]), f[2], f[3]);
      ctx.globalAlpha = 1;
    }
    if (fr) ctx.restore();
    if (this.umbrella && !this.isPlayer) SP.drawFrame(ctx, this.umbKey(), X + this.umbDX(), Y - 36);
    if (bikeAfter) drawBike(ctx, this, g);
    if (this.bubble && !erase && !(this.conflictSpeech?.until>SP.now)) {
      const top = Y - (this.umbrella ? 84 : 76);
      ctx.fillStyle = "rgba(250,248,240,0.95)"; ctx.fillRect(X - 6, top - 12, 12, 13); ctx.fillRect(X - 2, top + 1, 4, 3);
      ctx.fillStyle = "#c0392b"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center"; ctx.fillText(this.bubble.text, X, top - 2); ctx.textAlign = "left";
    }
    if(!erase)SP.conflictDialogue?.drawSpeech(ctx,this);
  };
  function drawBike(ctx, a, g) { const k = SP.frameKey("p_bike", "base", "main", "parked", g.rot); SP.drawFrame(ctx, k, SP.sx(g.x, g.y), SP.sy(g.x, g.y, 0)); if (SP.snowAmt > 0.01) SP.drawSnow(ctx, k, SP.sx(g.x, g.y), SP.sy(g.x, g.y, 0), SP.snowAmt); }

  // ---------- collision between characters, footprints and cars ----------
  const AC = (SP.actors = { list: [] });
  const GAP = 0.004;                            // tiny skin so float noise never reads as contact
  /** true if actor a with circles at (x, y, dir) touches nothing (static footprints, bounds, cars, other actors) */
  AC.shapeClear = function (a, x, y, dir, ignoreCars) {
    SP.world._mover = a;
    const W = SP.world, haz = !a.isPlayer && W.hazards && W.hazards.length;
    for (const [cx, cy, r] of a.circles(x, y, dir)) {
      if (W.blocked(cx, cy, r + GAP, ignoreCars)) return false;
      if (haz && W.hazardBlocks(a.x, a.y, cx, cy, r)) return false;     // NPCs keep out of broken glass
      for (const b of AC.list) {
        if (b === a || b.hidden || (b.level || "") !== (a.level || "")) continue;
        for (const [bx, by, br] of b.circles()) if (Math.hypot(cx - bx, cy - by) < r + br + GAP) return false;
      }
    }
    return true;
  };
  AC.whoBlocks = function (a, x, y, dir) {
    for (const [cx, cy, r] of a.circles(x, y, dir)) {
      const s = SP.world.blocked(cx, cy, r + GAP); if (s) return s;
      for (const b of AC.list) if (b !== a && !b.hidden && (b.level || "") === (a.level || "")) for (const [bx, by, br] of b.circles()) if (Math.hypot(cx - bx, cy - by) < r + br + GAP) return b.id;
    }
    return null;
  };
  /** move with sub-steps + sliding along world axes; returns distance actually travelled */
  AC.move = function (a, vx, vy) {
    SP.world._mover = a;
    const L = Math.hypot(vx, vy); if (L < 1e-9) return 0;
    const n = Math.max(1, Math.ceil(L / 0.04)), sx = vx / n, sy = vy / n, x0 = a.x, y0 = a.y;
    a.blockedBy = null;
    for (let i = 0; i < n; i++) {
      if (AC.shapeClear(a, a.x + sx, a.y + sy)) { a.x += sx; a.y += sy; continue; }
      a.blockedBy = AC.whoBlocks(a, a.x + sx, a.y + sy);
      if (Math.abs(sx) > 1e-7 && AC.shapeClear(a, a.x + sx, a.y)) a.x += sx;
      else if (Math.abs(sy) > 1e-7 && AC.shapeClear(a, a.x, a.y + sy)) a.y += sy;
    }
    return Math.hypot(a.x - x0, a.y - y0);
  };
  /** push-out pass: characters apart from each other (the player yields last), then out of footprints and cars */
  AC.resolve = function (iters) {
    let moved = 0;
    for (let it = 0; it < (iters || 6); it++) {
      let any = false;
      for (let i = 0; i < AC.list.length; i++) for (let j = i + 1; j < AC.list.length; j++) {
        const a = AC.list[i], b = AC.list[j];
        if (a.hidden || b.hidden || (a.level || "") !== (b.level || "")) continue;
        for (const [ax, ay, ar] of a.circles()) for (const [bx, by, br] of b.circles()) {
          let dx = ax - bx, dy = ay - by, d = Math.hypot(dx, dy); const need = ar + br + GAP * 2;
          if (d >= need) continue;
          if (d < 1e-6) { dx = 1; dy = 0.3; d = Math.hypot(dx, dy); }
          const push = need - d + 1e-4, ux = dx / d, uy = dy / d;
          // the NPC moves out of the player's way; two NPCs split the push
          const wa = a.isPlayer ? 0 : b.isPlayer ? 1 : (b.vehicle && !a.vehicle ? 1 : a.vehicle && !b.vehicle ? 0 : 0.5);
          a.x += ux * push * wa; a.y += uy * push * wa; b.x -= ux * push * (1 - wa); b.y -= uy * push * (1 - wa);
          any = true; moved++;
        }
      }
      for (const a of AC.list) {
        if (a.hidden || a.posed) continue;                 // posed on a chair / in the shower / in bed: placed there on purpose
        SP.world._mover = a; const onRoof = a.level === "roof";
        for (let k = 0; k < 3; k++) {
          let fixed = false;
          for (const [cx, cy, r] of a.circles()) {
            const polys = SP.world.nearColliders(cx, cy, r + 0.1).map((c) => c.poly).concat(SP.traffic && !onRoof ? SP.traffic.allCars().map((c) => c.poly) : []);
            for (const p of polys) {
              const q = SP.polyDist(cx, cy, p); if (q.d >= r + GAP) continue;
              let nx = cx - q.x, ny = cy - q.y, L = Math.hypot(nx, ny);
              if (q.d < 0) { nx = -nx; ny = -ny; }
              if (L < 1e-6) { nx = 0; ny = -1; L = 1; }
              const push = r + GAP * 2 - q.d; a.x += (nx / L) * push; a.y += (ny / L) * push; fixed = any = true; moved++;
            }
            const B = SP.world.data.bounds;
            if (cx - r < B.x0) { a.x += B.x0 - (cx - r) + GAP; fixed = true; } if (cx + r > B.x1) { a.x -= cx + r - B.x1 + GAP; fixed = true; }
            if (cy - r < B.y0) { a.y += B.y0 - (cy - r) + GAP; fixed = true; } if (cy + r > B.y1) { a.y -= cy + r - B.y1 + GAP; fixed = true; }
          }
          if (!fixed) break;
        }
      }
      if (!any) break;
    }
    return moved;
  };
  /** something broke / honked / splashed at (x, y): NPCs within r stop, turn to look, '!' bubble */
  AC.alarm = function (x, y, r) {
    for (const a of AC.list) {
      if (a.isPlayer || a.hidden || a.vehicle) continue;
      if (Math.hypot(a.x - x, a.y - y) < r) { a.bubble = { t: 1.6, text: "!" }; if (a.brain) a.brain.alert = 1.2; const d = SP.dirFromWorld(x - a.x, y - a.y); a.target = d; }
    }
  };
  AC.visible = () => AC.list.filter((a) => !a.hidden);
})(window.SP);
