/* Sprite drawing: foot-anchored frames, soft ground shadow, ambient tint so day-lit
   sprites sit in night art, and Li Mo 8-direction animator. */
(function (FW) {
  "use strict";
  const tint = document.createElement("canvas");
  const tctx = tint.getContext("2d");

  /**
   * draw image `im` with its foot point (fx,fy in image px) at world (x,y)
   * opts: scale, flip, alpha, light {r,g,b,a} multiply-ish darkening, warm {a} lamp rim
   */
  FW.drawFrame = function (ctx, im, x, y, opts) {
    if (!FW.ok(im)) return;
    const s = opts.scale || 1;
    const fx = opts.fx != null ? opts.fx : im.naturalWidth / 2;
    const fy = opts.fy != null ? opts.fy : im.naturalHeight - 4;
    const w = im.naturalWidth, h = im.naturalHeight;
    let src = im;
    const L = opts.light;
    if (L && L.a > 0.01) {
      if (tint.width !== w || tint.height !== h) { tint.width = w; tint.height = h; }
      tctx.globalCompositeOperation = "source-over";
      tctx.clearRect(0, 0, w, h);
      tctx.drawImage(im, 0, 0);
      tctx.globalCompositeOperation = "source-atop";
      tctx.globalAlpha = L.a;
      tctx.fillStyle = `rgb(${L.r},${L.g},${L.b})`;
      tctx.fillRect(0, 0, w, h);
      if (opts.warm && opts.warm > 0.01) {
        // lamp/stall rim light from the lower-left
        const g = tctx.createLinearGradient(0, h, w * 0.9, h * 0.2);
        g.addColorStop(0, "rgba(255,170,90,1)");
        g.addColorStop(1, "rgba(255,170,90,0)");
        tctx.globalAlpha = opts.warm;
        tctx.fillStyle = g;
        tctx.fillRect(0, 0, w, h);
      }
      tctx.globalAlpha = 1;
      tctx.globalCompositeOperation = "source-over";
      src = tint;
    }
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.globalAlpha = opts.alpha != null ? opts.alpha : 1;
    ctx.translate(x, y + (opts.dy || 0));
    if (opts.rot) ctx.rotate(opts.rot);
    ctx.scale(opts.flip ? -s : s, s * (opts.sy || 1));
    ctx.drawImage(src, -fx, -fy, w, h);
    ctx.restore();
  };

  FW.drawShadow = function (ctx, x, y, rx, ry, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(8,8,14,${alpha})`);
    g.addColorStop(0.6, `rgba(8,8,14,${alpha * 0.55})`);
    g.addColorStop(1, "rgba(8,8,14,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  /** ambient tint for actors from time of day + scene */
  FW.actorLight = function (mins, scene) {
    const n = FW.nightFactor(mins);
    const w = FW.extWeights(mins);
    if (scene === "interior") return { r: 30, g: 26, b: 46, a: 0.12 + n * 0.32 };
    return {
      r: Math.round(FW.lerp(60, 22, n)),
      g: Math.round(FW.lerp(40, 28, n)),
      b: Math.round(FW.lerp(30, 64, n)),
      a: 0.06 + w.dusk * 0.18 + w.night * 0.38 + w.rain * 0.42,
    };
  };

  // ---------- Li Mo ----------
  // 3D-rendered 8-direction sprites: 12-frame walk + 4-frame idle per direction.
  // Walk phase advances by ground distance actually travelled / stride, so planted feet don't skate;
  // facing turns through the in-between directions instead of popping.
  const ORDER = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"];

  FW.dirFromVec = function (dx, dy) {
    const a = Math.atan2(dy, dx); // screen coords, y down
    const idx = (Math.round(a / (Math.PI / 4)) + 8) % 8; // 0=E,1=SE,2=S,3=SW,4=W,5=NW,6=N,7=NE
    return ORDER[idx];
  };

  FW.LiMo = function () {
    this.x = 0; this.y = 0;
    this.dir = "S";        // facing currently drawn
    this.target = "S";     // facing requested by input
    this.moving = false;
    this.phase = 0;        // walk cycle 0..1
    this.t = 0;            // idle clock
    this.turnT = 0;
    this.frame = 0;
    this.fps = 0;          // effective walk frame rate (debug / playtest)
  };
  FW.LiMo.prototype.setDir = function (d) { this.dir = this.target = d; this.turnT = 0; };
  /**
   * dt: seconds; moving: input held; dir: requested facing (or null);
   * mx,my: screen px actually moved this tick; scale: actor scale of the scene
   */
  FW.LiMo.prototype.update = function (dt, moving, dir, mx, my, scale) {
    const L = FW.LIMO;
    if (dir && dir !== this.target) { this.target = dir; this.pendT = 0; }
    // smooth facing: step 45 deg at a time toward the target (first step immediately).
    // diagonal -> adjacent cardinal waits a moment: releasing two keys a few ms apart must not flick
    if (this.target !== this.dir) {
      this.turnT -= dt;
      this.pendT = (this.pendT || 0) + dt;
      const ai = ORDER.indexOf(this.dir), bi = ORDER.indexOf(this.target);
      const adjRelease = this.dir.length === 2 && this.target.length === 1 && ((bi - ai + 8) % 8 === 1 || (bi - ai + 8) % 8 === 7);
      if (this.turnT <= 0 && (!adjRelease || this.pendT >= 0.07)) {
        const a = ORDER.indexOf(this.dir), b = ORDER.indexOf(this.target);
        const diff = (b - a + 8) % 8;
        // shortest way round; a 180 deg turn goes through the camera-facing side (shows the face)
        const s = diff === 4 ? (a >= 3 && a <= 5 ? -1 : 1) : diff < 4 ? 1 : -1;
        this.dir = ORDER[(a + s + 8) % 8];
        this.turnT = this.target === this.dir ? 0 : L.turnStep;
      }
    } else this.turnT = 0;
    if (moving && !this.moving) {
      // resuming during a settle continues the stride from the frame on screen; from rest start at contact 0
      this.phase = this.settle && this.settle.walk != null ? this.settle.walk / L.walkFrames : 0.0;
      this.settle = null;
    }
    if (!moving && this.moving) { this.t = 0; this.settle = FW.LiMo.planSettle(this.frame); }
    this.moving = moving;
    if (moving) {
      const sc = scale || 0.5;
      // ground-plane distance in sprite px: undo actor scale and the ground foreshortening on y
      let g = Math.hypot(mx / sc, my / sc / L.groundY);
      if (g < 1e-3 && dt > 0) g = (this.nominal || 100) * dt / sc; // blocked / forced: walk in place
      this.phase = (this.phase + g / L.stride) % 1;
      this.fps = dt > 0 ? (g / L.stride) * L.walkFrames / dt : 0;
      this.frame = Math.round(this.phase * L.walkFrames) % L.walkFrames;
    } else if (this.settle) {
      // settle step: finish the stride to the nearest foot-contact frame, then blend into idle 0
      const S = this.settle;
      S.t += dt;
      const i = Math.floor(S.t / L.settleStep);
      if (i >= S.steps.length) { this.settle = null; this.t = 0; this.frame = 0; }
      else { Object.assign(S, S.steps[i]); this.frame = 0; }
    } else {
      this.t += dt;
      this.frame = Math.floor(this.t * L.idleFps) % L.idleFrames;
    }
  };
  /** steps of the stop transition from walk frame f: [{walk, blend}] where blend = idle-0 opacity over the walk frame.
      contact frames 0 / 6 = heel strike, both feet down (gait phase 0 / 0.5 in art-pack/sprites3d/gen_character.py);
      frames 1 / 7 are still double support, so they settle in place. Forward only (no back-stepping); 3-4 steps total. */
  FW.LiMo.planSettle = function (f) {
    const N = FW.LIMO.walkFrames, half = N / 2;
    const back = f % half;                    // frames since the last contact
    const steps = [];
    let c;
    if (back <= 1) c = f;                     // already planted
    else {
      const fwd = half - back;                // frames to the next contact
      // play on to the next contact in at most 2 drawn frames (skipping in-betweens: a quick, deliberate last step)
      const n = Math.min(2, fwd);
      for (let k = 1; k <= n; k++) steps.push({ walk: (f + Math.round((fwd * k) / n)) % N, blend: 0 });
      c = (f + fwd) % N;
    }
    steps.push({ walk: c, blend: 0.4 }, { walk: c, blend: 0.75 });
    while (steps.length < 3) steps.unshift({ walk: f, blend: 0 });
    return { t: 0, steps, walk: steps[0].walk, blend: steps[0].blend, from: f };
  };
  FW.LiMo.prototype.draw = function (ctx, scale, light, warm) {
    const d = this.dir, L = FW.LIMO;
    const S = !this.moving && this.settle;
    const u = this.set || "";   // "u" = holding the open umbrella (uwalk_/uidle_: same motion, right arm up)
    const im = this.moving ? FW.img[`${u}walk_${d}_${this.frame}`] : S ? FW.img[`${u}walk_${d}_${S.walk}`] : FW.img[`${u}idle_${d}_${this.frame}`];
    FW.drawShadow(ctx, this.x, this.y - 1, 26 * scale * 2 * 0.5, 8 * scale * 2 * 0.5, 0.42);
    // whole-pixel placement keeps the pixel art crisp (no sub-pixel shimmer while walking)
    const X = Math.round(this.x), Y = Math.round(this.y), o = { scale, fx: L.foot[0], fy: L.foot[1], light, warm };
    if (S && S.blend > 0) {
      // cross-dissolve: idle 0 solid underneath, the planted walk frame fading out on top
      FW.drawFrame(ctx, FW.img[`${u}idle_${d}_0`], X, Y, o);
      FW.drawFrame(ctx, im, X, Y, Object.assign({}, o, { alpha: 1 - S.blend }));
    } else FW.drawFrame(ctx, im, X, Y, o);
  };
})(window.FW);
