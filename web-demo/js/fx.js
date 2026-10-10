/* Dynamic FX: steam, rain + splashes, window/lamp glow flicker, interior light.
   All procedural canvas (FX sheet frames were full-scene tiles, not overlays; used as reference). */
(function (FW) {
  "use strict";
  const rnd = (a, b) => a + Math.random() * (b - a);
  // pre-rendered soft puff
  const puff = document.createElement("canvas");
  puff.width = puff.height = 64;
  (function () {
    const c = puff.getContext("2d");
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(0.45, "rgba(245,245,250,0.45)");
    g.addColorStop(1, "rgba(240,240,250,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
  })();

  FW.FX = function () {
    this.steam = [];
    this.rain = [];
    this.splash = [];
    this.acc = {};
    this.time = 0;
    this.extraSteam = []; // temporary emitters (cooking)
    this.winDrops = [];   // interior: rain running down the window glass (only drawn while it rains)
    this.winBeads = [];
    this.winLast = -1;
  };

  // ---- interior window rain: rivulets + beads on the glass, clipped to the panes by the clear-window patch alpha ----
  let winCv = null;
  FW.FX.prototype.drawWindowRain = function (ctx, amt) {
    if (amt <= 0.01) { this.winDrops.length = 0; this.winBeads.length = 0; return; }
    const mask = FW.img["bg.int_night_clear_win"];
    if (!FW.ok(mask)) return;
    const Wp = mask.naturalWidth, Hp = mask.naturalHeight;
    if (!winCv) { winCv = document.createElement("canvas"); winCv.width = Wp; winCv.height = Hp; }
    const dt = this.winLast < 0 ? 0 : Math.min(0.05, Math.max(0, this.time - this.winLast));
    this.winLast = this.time;
    // spawn / update
    const wantD = Math.round(10 * amt), wantB = Math.round(70 * amt);
    while (this.winDrops.length < wantD) this.winDrops.push({ x: rnd(0, Wp), y: rnd(-30, Hp), v: rnd(18, 55), len: rnd(6, 16), a: rnd(0.35, 0.7), ph: rnd(0, 6) });
    while (this.winBeads.length < wantB) this.winBeads.push({ x: Math.round(rnd(0, Wp)), y: Math.round(rnd(0, Hp)), a: rnd(0.25, 0.6), life: rnd(0, 6), max: rnd(3, 8) });
    for (const d of this.winDrops) {
      d.y += d.v * dt * (0.7 + 0.3 * Math.sin(this.time * 3 + d.ph)); // stick-slip
      d.x += Math.sin(this.time * 1.3 + d.ph) * 3 * dt;
      if (d.y - d.len > Hp) Object.assign(d, { x: rnd(0, Wp), y: rnd(-20, 0), v: rnd(18, 55) });
    }
    for (const b of this.winBeads) if ((b.life += dt) > b.max) Object.assign(b, { x: Math.round(rnd(0, Wp)), y: Math.round(rnd(0, Hp)), life: 0 });
    // draw into the pane-sized buffer
    const c = winCv.getContext("2d");
    c.globalCompositeOperation = "source-over";
    c.clearRect(0, 0, Wp, Hp);
    c.fillStyle = "rgba(120,140,175,0.10)"; // wet glass haze
    c.fillRect(0, 0, Wp, Hp);
    for (const b of this.winBeads) {
      const f = Math.min(1, b.life / 0.4) * Math.min(1, (b.max - b.life) / 0.6);
      c.fillStyle = `rgba(185,205,235,${(b.a * f).toFixed(3)})`;
      c.fillRect(b.x, b.y, 1, 1);
    }
    c.lineCap = "round";
    for (const d of this.winDrops) {
      const g = c.createLinearGradient(d.x, d.y - d.len, d.x, d.y);
      g.addColorStop(0, "rgba(170,195,230,0)");
      g.addColorStop(1, `rgba(200,220,245,${d.a})`);
      c.strokeStyle = g; c.lineWidth = 1;
      c.beginPath(); c.moveTo(d.x - 0.6, d.y - d.len); c.lineTo(d.x, d.y); c.stroke();
      c.fillStyle = `rgba(215,230,250,${d.a})`;
      c.fillRect(Math.round(d.x - 0.5), Math.round(d.y - 0.5), 2, 2);
    }
    c.globalCompositeOperation = "destination-in"; // keep only the glass
    c.drawImage(mask, 0, 0);
    const [px, py] = FW.SCENES.interior.windowPatch;
    ctx.save();
    ctx.globalAlpha = Math.min(1, amt);
    ctx.drawImage(winCv, px, py);
    ctx.restore();
  };

  FW.FX.prototype.update = function (dt, scene, mins) {
    this.time += dt;
    const S = FW.SCENES[scene];
    const w = FW.extWeights(mins);
    // ---- steam ----
    const morning = FW.wrapMin(mins) > 300 && FW.wrapMin(mins) < 660 ? 1.4 : 1.0;
    const emitters = (S.steam || []).concat(this.extraSteam);
    emitters.forEach((e, i) => {
      const key = scene + i;
      this.acc[key] = (this.acc[key] || 0) + dt * e.rate * morning;
      while (this.acc[key] > 1) {
        this.acc[key] -= 1;
        this.steam.push({
          x: e.x + rnd(-e.spread / 2, e.spread / 2), y: e.y, vx: rnd(-4, 6), vy: rnd(-26, -16),
          r: rnd(5, 9) * (e.scale || 1), life: 0, max: rnd(1.8, 3.0), seed: Math.random() * 6, scale: e.scale || 1,
        });
      }
    });
    this.extraSteam = this.extraSteam.filter((e) => (e.ttl -= dt) > 0);
    for (const p of this.steam) {
      p.life += dt;
      p.x += (p.vx + Math.sin(this.time * 1.7 + p.seed) * 6) * dt;
      p.y += p.vy * dt;
      p.vy *= 0.995;
      p.r += dt * 9 * p.scale;
    }
    this.steam = this.steam.filter((p) => p.life < p.max);

    // ---- rain ----
    const rainAmt = scene === "exterior" ? w.rain : 0;
    const want = Math.floor(rainAmt * 420);
    while (this.rain.length < want) this.rain.push(this.newDrop(true));
    if (this.rain.length > want) this.rain.length = want;
    for (const d of this.rain) {
      d.x += d.vx * dt; d.y += d.vy * dt;
      if (d.y > d.ground) {
        if (Math.random() < 0.5) this.splash.push({ x: d.x, y: d.ground, life: 0, max: rnd(0.25, 0.45) });
        Object.assign(d, this.newDrop(false));
      }
    }
    for (const s of this.splash) s.life += dt;
    this.splash = this.splash.filter((s) => s.life < s.max);
  };
  FW.FX.prototype.newDrop = function (anywhere) {
    const gy = FW.SCENES.exterior.groundY;
    return {
      x: rnd(-80, FW.W), y: anywhere ? rnd(-40, FW.H) : rnd(-60, -10), vx: rnd(110, 150), vy: rnd(780, 980),
      len: rnd(10, 20), a: rnd(0.18, 0.45), ground: rnd(gy, FW.H + 30), z: Math.random(),
    };
  };

  FW.FX.prototype.drawSteam = function (ctx, mins) {
    const n = FW.nightFactor(mins);
    ctx.save();
    for (const p of this.steam) {
      const t = p.life / p.max;
      const a = (t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85) * (0.32 + n * 0.12);
      ctx.globalAlpha = Math.max(0, a);
      ctx.drawImage(puff, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }
    ctx.restore();
  };

  FW.FX.prototype.drawRain = function (ctx) {
    if (!this.rain.length && !this.splash.length) return;
    ctx.save();
    ctx.lineCap = "round";
    for (const d of this.rain) {
      ctx.strokeStyle = `rgba(190,210,240,${d.a * (0.6 + d.z * 0.4)})`;
      ctx.lineWidth = d.z > 0.7 ? 1.6 : 1;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.vx * 0.018 * (d.len / 14), d.y - d.len);
      ctx.stroke();
    }
    for (const s of this.splash) {
      const t = s.life / s.max;
      ctx.strokeStyle = `rgba(200,220,250,${0.45 * (1 - t)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, 2 + t * 7, 0.8 + t * 2.2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  };

  function glow(ctx, x, y, r, color, a) {
    if (a <= 0.003) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${color},${a})`);
    g.addColorStop(0.4, `rgba(${color},${a * 0.45})`);
    g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  FW.glow = glow;
  // cheap smooth noise for flicker
  const flick = (t, s) => 0.5 + 0.25 * Math.sin(t * 2.3 + s) + 0.15 * Math.sin(t * 7.1 + s * 3.1) + 0.1 * Math.sin(t * 17.0 + s * 1.7);

  FW.FX.prototype.drawLights = function (ctx, scene, mins) {
    const S = FW.SCENES[scene];
    const n = FW.nightFactor(mins);
    const w = FW.extWeights(mins);
    const t = this.time;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (scene === "exterior") {
      (S.windows || []).forEach(([x, y, r], i) => {
        const f = flick(t, i * 1.9);
        // one window "TV flicker" stronger and colder
        if (i === 4) glow(ctx, x, y, r * 1.4, "140,170,255", n * 0.22 * (0.4 + 0.6 * Math.abs(Math.sin(t * 5 + Math.sin(t * 13)))));
        else glow(ctx, x, y, r * 1.6, "255,170,80", n * (0.16 + 0.12 * f));
      });
      (S.lamps || []).forEach(([x, y, r], i) => {
        const f = 0.92 + 0.08 * Math.sin(t * 9 + i) * (i === 2 ? 3 : 1); // lamp 2 slightly faulty
        glow(ctx, x, y, r, "255,200,120", (w.dusk * 0.18 + w.night * 0.24 + w.rain * 0.30) * f);
        // pool of light on ground
        glow(ctx, x + 10, y + r * 0.9, r * 0.9, "255,190,110", (w.dusk * 0.06 + w.night * 0.10 + w.rain * 0.12) * f);
      });
      // stall bulb warm pool (always on when dark)
      glow(ctx, 512, 610, 70, "255,180,90", n * 0.22 * (0.9 + 0.1 * flick(t, 9)));
    } else {
      // interior: day window beam, night desk lamp + monitor flicker
      const d = 1 - n;
      const [bx, by] = S.windowBeam;
      if (d > 0.02) {
        ctx.save();
        const g = ctx.createLinearGradient(bx, by, bx + 260, by + 330);
        g.addColorStop(0, `rgba(255,220,150,${0.16 * d})`);
        g.addColorStop(1, "rgba(255,220,150,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(bx - 70, by - 50); ctx.lineTo(bx + 70, by - 70);
        ctx.lineTo(bx + 330, by + 330); ctx.lineTo(bx + 60, by + 360);
        ctx.closePath(); ctx.fill();
        ctx.restore();
        // dust motes
        for (let i = 0; i < 24; i++) {
          const px = bx + ((i * 53 + t * 6) % 220), py = by + 40 + ((i * 97 + t * (4 + (i % 3))) % 260);
          ctx.fillStyle = `rgba(255,235,190,${0.25 * d * (0.5 + 0.5 * Math.sin(t * 2 + i))})`;
          ctx.fillRect(px, py, 2, 2);
        }
      }
      const [lx, ly] = S.lampDesk;
      glow(ctx, lx, ly, 150, "255,190,110", n * (0.26 + 0.04 * flick(t, 2)));
      const [mx, my] = S.monitor;
      glow(ctx, mx, my, 90, "120,170,255", (0.10 + n * 0.16) * (0.75 + 0.25 * flick(t * 2.5, 5)));
    }
    ctx.restore();
  };
})(window.FW);
