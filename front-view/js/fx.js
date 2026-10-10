/* scene-proto · FX: pooled world particles (glass, debris, smoke, water spray, splashes, leaves/petals, breath,
   pickups), fire overlays, and screen-space weather particles (rain streaks + ground splashes, snow flakes) that are
   anchored to the world through the camera. No per-frame allocations in the hot paths (pools / typed arrays). */
(function (SP) {
  "use strict";
  const FX = (SP.fx = { parts: [], air: [], glows: [], shake: 0 });
  const R = () => SP.rand();
  const pool = [];
  function P(kind) { const p = pool.pop() || {}; p.kind = kind; p.rest = false; p.t = 0; p.size = 1; p.key = null; p.col = null; p.dark = 0; p.vx = p.vy = p.vz = 0; return p; }
  FX.reset = function () { for (const p of FX.parts) pool.push(p); for (const p of FX.air) pool.push(p); FX.parts.length = 0; FX.air.length = 0; };
  const push = (p) => { if (FX.parts.length < 900) FX.parts.push(p); else pool.push(p); return p; };
  FX.glassBurst = function (x, y, z, n, spread) {
    for (let i = 0; i < n; i++) { const p = push(P("shard")); p.x = x + (R() - 0.5) * (spread || 1.4); p.y = y; p.z = z + (R() - 0.5) * 0.6; p.vx = (R() - 0.5) * 2.4; p.vy = -0.4 - R() * 1.6; p.vz = R() * 2.2; p.key = `fx/shard/${i % 3}`; p.life = 30; }
  };
  FX.crashBurst = function (x, y, n) {
    for (let i = 0; i < n; i++) { const p = push(P("bit")); p.x = x; p.y = y; p.z = 0.5 + R() * 0.4; p.vx = (R() - 0.5) * 5; p.vy = (R() - 0.5) * 3; p.vz = 1 + R() * 2.5; p.key = i % 2 ? `fx/bit/${i % 3}` : `fx/shard/${i % 3}`; p.life = 40; }
  };
  FX.debris = function (x, y, z, n, cols) {
    for (let i = 0; i < n; i++) { const p = push(P("pix")); p.x = x + (R() - 0.5) * 0.4; p.y = y - 0.1; p.z = z; p.vx = (R() - 0.5) * 2.6; p.vy = -R() * 1.4; p.vz = 0.5 + R() * 2; p.col = cols[i % cols.length]; p.size = 2; p.life = 25; }
  };
  FX.smoke = function (x, y, z, dark, size) {
    const p = push(P("smoke")); p.x = x + (R() - 0.5) * 0.6; p.y = y; p.z = z; p.vx = 0.25 + R() * 0.3; p.vy = 0.05; p.vz = 0.7 + R() * 0.5; p.life = 3.5 + R() * 1.5; p.dark = dark; p.size = size == null ? 0 : size;
  };
  const WATER = [[196, 222, 240], [150, 190, 220], [230, 242, 250]];
  FX.splash = function (x, y, n) {
    for (let i = 0; i < n; i++) { const p = push(P("pix")); p.x = x + (R() - 0.5) * 0.3; p.y = y - 0.05; p.z = 0.02; const a = R() * 6.28, s = 0.6 + R() * 1.4; p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s * 0.5; p.vz = 1.2 + R() * 1.8; p.col = WATER[i % 3]; p.life = 0.6; p.water = true; }
  };
  FX.water = function (x, y, z) { for (let i = 0; i < 14; i++) { const p = push(P("pix")); p.x = x + (R() - 0.5) * 0.2; p.y = y; p.z = z + 0.3; p.vx = (R() - 0.5) * 0.4; p.vy = 0; p.vz = -0.5 - R(); p.col = WATER[i % 3]; p.life = 0.6; p.water = true; } };
  FX.pickup = function (x, y, z) { const p = push(P("can")); p.x = x; p.y = y; p.z = z; p.vz = 0.9; p.life = 1.4; p.key = "fx/can"; };
  const LEAF = [[226, 178, 60], [214, 140, 46], [190, 96, 40], [236, 204, 96]], PETAL = [[246, 200, 214], [252, 228, 236], [232, 170, 192]], GREEN = [[96, 140, 60], [120, 166, 74]];
  FX.leafBurst = function (x, y, n) {
    for (let i = 0; i < n; i++) { const p = push(P("pix")); p.x = x + (R() - 0.5) * 0.6; p.y = y; p.z = 0.05; p.vx = (R() - 0.5) * 2.4; p.vy = (R() - 0.5) * 1.2; p.vz = 1 + R() * 1.6; p.col = LEAF[i % 4]; p.size = 2; p.life = 8; p.leafy = true; }
  };
  FX.breath = function (x, y, z) { const p = push(P("breath")); p.x = x; p.y = y; p.z = z; p.vx = (R() - 0.5) * 0.1; p.vz = 0.12; p.life = 1.1; };
  FX.update = function (dt) {
    const C = SP.clock, Ps = FX.parts;
    for (let i = Ps.length - 1; i >= 0; i--) {
      const p = Ps[i];
      p.t += dt;
      if (p.kind === "smoke" || p.kind === "breath") { p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz *= 1 - 0.15 * dt; if (p.t >= p.life) { Ps[i] = Ps[Ps.length - 1]; Ps.pop(); pool.push(p); } continue; }
      if (p.kind === "can") { p.z += p.vz * dt; p.vz *= 1 - 1.5 * dt; if (p.t >= p.life) { Ps[i] = Ps[Ps.length - 1]; Ps.pop(); pool.push(p); } continue; }
      if (p.rest) { p.life -= dt; if (p.life <= 0) { Ps[i] = Ps[Ps.length - 1]; Ps.pop(); pool.push(p); } continue; }
      if (p.leafy && p.z > 0.05) { p.vz = Math.max(p.vz - 9.8 * dt, -0.7); p.vx *= 1 - dt; } else p.vz -= 9.8 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.z <= 0) {
        p.z = 0;
        if (p.water) { p.life = 0; p.rest = true; continue; }
        if (Math.abs(p.vz) > 1.5 && !p.leafy) { p.vz *= -0.25; p.vx *= 0.4; p.vy *= 0.4; } else { p.rest = true; p.life = Math.min(p.life, p.leafy ? 6 : p.life); }
      }
    }
    // seasonal air: blossom petals (spring) / leaves (autumn) drifting down from the canopies
    const s = C.season, rate = s === "autumn" ? 3.2 : s === "spring" ? 2.2 : s === "summer" ? 0.15 : 0;
    FX.leafAcc = (FX.leafAcc || 0) + rate * dt;
    while (FX.leafAcc > 1) {
      FX.leafAcc -= 1;
      const trees = SP.world.dyn.filter((o) => o.type === "p_tree"), o = trees[Math.floor(R() * trees.length)];
      if (!o || FX.air.length > 70) break;
      const p = P("air"); p.x = o.x + (R() - 0.5) * 3.4; p.y = o.y + (R() - 0.5) * 1.6 - 0.3; p.z = 3.2 + R() * 2.2; p.vz = -0.45 - R() * 0.35; p.ph = R() * 6.28;
      p.col = s === "spring" ? PETAL[Math.floor(R() * 3)] : s === "summer" ? GREEN[Math.floor(R() * 2)] : LEAF[Math.floor(R() * 4)]; p.size = s === "spring" ? 1 : 2; FX.air.push(p);
    }
    const A = FX.air;
    for (let i = A.length - 1; i >= 0; i--) {
      const p = A[i]; p.t += dt;
      if (p.z > 0) { p.z += p.vz * dt; p.x += (C.wind * 0.9 + Math.sin(p.t * 2.3 + p.ph) * 0.5) * dt; p.y += Math.cos(p.t * 1.7 + p.ph) * 0.12 * dt; if (p.z <= 0) { p.z = 0; p.t = 0; } }
      else if (p.t > 5) { A[i] = A[A.length - 1]; A.pop(); pool.push(p); }
    }
    // overlays: smoke + fire light; hydrant water
    FX.glows.length = 0;
    for (const o of SP.world.objects) {
      if (o.type === "p_hydrant" && (o.state === "broken" || (o.spray && C.abs() < o.spray))) {
        const broken = o.state === "broken";
        o.sprayAcc = (o.sprayAcc || 0) + dt * (broken ? 70 : 30);
        while (o.sprayAcc > 1) { o.sprayAcc -= 1; const p = push(P("pix")); p.x = o.x + (R() - 0.5) * 0.08; p.y = o.y - 0.05; p.z = broken ? 0.75 : 0.42;
          if (broken) { p.vx = (R() - 0.5) * 0.9 + C.wind * 0.4; p.vy = (R() - 0.5) * 0.5; p.vz = 6.5 + R() * 2; } else { p.vx = 0.2 + R() * 0.3; p.vy = -1.6 - R() * 0.6; p.vz = 0.8 + R() * 0.6; }
          p.col = WATER[Math.floor(R() * 3)]; p.life = 2; p.water = true; p.size = R() < 0.3 ? 2 : 1; }
      }
      if (o.spray && C.abs() >= o.spray) o.spray = 0;
      for (const ov of o.overlays) {
        if (!ov.active) continue;
        if (ov.type === "smoke") {
          const fire = o.overlays.find((q) => q.type === "fire" && q.active);
          const rate2 = fire ? 16 : Math.max(0, 6 * (1 - (ov.t - 14) / 10));
          ov.acc = (ov.acc || 0) + dt * rate2;
          while (ov.acc > 1) { ov.acc -= 1; FX.smoke(o.x + 1.5, o.y - 0.4, o.z + 2.3, fire ? 1 : 0.6, fire ? 1 : 0); }
        }
        if (ov.type === "fire") {
          const k = FX.fireLevel(ov), fl = 0.75 + 0.25 * Math.sin(SP.now * 23) * Math.sin(SP.now * 7.3 + 1.3);
          FX.glows.push({ x: o.x + 1.5, y: o.y - 0.5, z: o.z + 1.4, r: 4.6 * k, c: [255, 140, 60], a: 0.9 * k * fl });
          FX.glows.push({ x: o.x + 1.5, y: o.y - 1.2, z: 0.05, r: 3.0 * k, c: [255, 120, 50], a: 0.6 * k * fl, flat: true });
        }
      }
    }
    FX.shake = Math.max(0, FX.shake - dt);
  };
  FX.fireLevel = function (ov) { const t = ov.t, d = ov.dur || 14; return SP.clamp(Math.min(t / 2, 1) * Math.min(1, (d - t) / 3), 0, 1); };
  /** y-sorted drawables (particles + fire flames) */
  FX.drawables = function (out) {
    let seq = 200000;
    for (const p of FX.parts) { const d = p._d || (p._d = { kind: "part", p, line: [0, 0, 0, 0], zo: 0, seq: 0 }); d.line[0] = d.line[2] = p.x; d.line[1] = d.line[3] = p.y; d.seq = seq++; out.push(d); }
    for (const o of SP.world.objects) for (const ov of o.overlays) {
      if (ov.type !== "fire" || !ov.active) continue;
      out.push({ kind: "fire", o, ov, line: o._line || [o.x, o.y, o.x + 3, o.y], zo: 5, seq: seq++ });
    }
    return out;
  };
  const SMOKE_RGB = [[118, 112, 118], [70, 66, 74]];
  const colStr = new Map();
  const cs = (c) => { const k = (c[0] << 16) | (c[1] << 8) | c[2]; let s = colStr.get(k); if (!s) { s = `rgb(${c[0]},${c[1]},${c[2]})`; colStr.set(k, s); } return s; };
  FX.drawPart = function (ctx, p) {
    const X = Math.round(SP.sx(p.x)), Y = Math.round(SP.sy(p.y, p.z));
    if (p.kind === "smoke") { const u = p.t / p.life, sz = Math.min(2, Math.floor(u * 3 + p.size)), a = (1 - u) * (u < 0.1 ? u / 0.1 : 1) * 0.75; SP.drawFrame(ctx, `fx/smoke/${sz}`, X, Y, a * (p.dark ? 1.15 : 0.6)); return; }
    if (p.kind === "breath") { const u = p.t / p.life; ctx.globalAlpha = 0.5 * (1 - u); ctx.fillStyle = "#eef2f8"; const s = 2 + Math.floor(u * 4); ctx.fillRect(X - (s >> 1), Y - (s >> 1), s, s - 1); ctx.globalAlpha = 1; return; }
    if (p.kind === "can") { SP.drawFrame(ctx, p.key, X, Y, Math.min(1, (p.life - p.t) * 2)); return; }
    if (p.kind === "pix") { const a = p.rest ? Math.min(1, p.life / 2) : 1; if (a < 0.999) ctx.globalAlpha = a; ctx.fillStyle = cs(p.col); ctx.fillRect(X, Y, p.size, p.size > 1 ? p.size - 1 : 1); if (a < 0.999) ctx.globalAlpha = 1; return; }
    const a = p.rest ? Math.min(1, p.life / 3) : 1;
    SP.drawFrame(ctx, p.key, X, Y, a);
  };
  /** falling leaves / petals: drawn after the sorted pass (they are above everything while airborne) */
  FX.drawAir = function (ctx) {
    for (const p of FX.air) {
      const X = Math.round(SP.sx(p.x)), Y = Math.round(SP.sy(p.y, p.z)), a = p.z > 0 ? 1 : Math.max(0, 1 - p.t / 5);
      ctx.globalAlpha = a; ctx.fillStyle = cs(p.col); ctx.fillRect(X, Y, p.size, p.size > 1 && Math.sin(p.t * 6 + p.ph) > 0 ? 1 : p.size);
    }
    ctx.globalAlpha = 1;
  };
  FX.drawFire = function (ctx, o, ov) {
    const k = FX.fireLevel(ov); if (k <= 0.02) return;
    const fr = SP.K.fx.fire_frames, fps = SP.K.fx.fire_fps, base = [[0.85, 0.0, 1.0], [1.5, 2, 1.25], [2.15, 5, 0.95]];
    for (const [dx, ph, s] of base) {
      const i = (Math.floor(SP.now * fps) + ph) % fr, f = SP.frame(`fx/fire/${i}`);
      const X = SP.sx(o.x + dx), Y = SP.sy(o.y - 0.2, o.z + 0.98), h = Math.round(f[3] * k * s), w = Math.round(f[2] * (0.7 + 0.3 * k) * Math.min(1.1, s));
      ctx.drawImage(SP.img.atlas, f[0], f[1], f[2], f[3], Math.round(X - w / 2), Math.round(Y - h), w, h);
    }
  };

  // ---------------- screen-space weather (rain / snow), world-anchored through the camera ----------------
  const NR = 420, NS = 420;
  const rx = new Float32Array(NR), ry = new Float32Array(NR), rl = new Float32Array(NR), rv = new Float32Array(NR), rd = new Float32Array(NR);
  const sx_ = new Float32Array(NS), sy_ = new Float32Array(NS), sv = new Float32Array(NS), sp_ = new Float32Array(NS), ss = new Uint8Array(NS);
  const NSP = 64, spx = new Float32Array(NSP), spy = new Float32Array(NSP), spt = new Float32Array(NSP);
  let wInit = false, lastCx = 0, lastCy = 0, spI = 0, vw = 1280, vh = 720;
  function initW(w, h) {
    vw = w; vh = h;
    for (let i = 0; i < NR; i++) { rx[i] = R() * (w + 200) - 100; ry[i] = R() * h; rd[i] = R(); rl[i] = 6 + rd[i] * 12; rv[i] = 520 + rd[i] * 520; }
    for (let i = 0; i < NS; i++) { sx_[i] = R() * w; sy_[i] = R() * h; ss[i] = R() < 0.25 ? 2 : 1; sv[i] = (ss[i] === 2 ? 48 : 28) + R() * 26; sp_[i] = R() * 6.28; }
    wInit = true;
  }
  /** per rendered frame (real dt) -> smooth at any refresh rate; cx, cy = camera (screen px) */
  FX.updateWeather = function (dt, cx, cy, w, h) {
    if (!wInit || w !== vw || h !== vh) { initW(w, h); lastCx = cx; lastCy = cy; }
    const dcx = cx - lastCx, dcy = cy - lastCy; lastCx = cx; lastCy = cy;
    const C = SP.clock, wind = C.wind;
    if (C.weather === "rain") {
      const n = Math.round(NR * C.intensity);
      for (let i = 0; i < n; i++) {
        rx[i] += wind * 140 * dt - dcx * (0.7 + rd[i] * 0.3); ry[i] += rv[i] * dt - dcy * (0.7 + rd[i] * 0.3);
        if (ry[i] > h) { ry[i] -= h + rl[i]; rx[i] = R() * (w + 200) - 100; if (R() < 0.55) { spx[spI] = R() * w; spy[spI] = h * (0.25 + 0.75 * R()); spt[spI] = 0.18; spI = (spI + 1) % NSP; } }
        if (rx[i] < -100) rx[i] += w + 200; else if (rx[i] > w + 100) rx[i] -= w + 200;
        if (ry[i] < -40) ry[i] += h;
      }
      for (let i = 0; i < NSP; i++) if (spt[i] > 0) { spt[i] -= dt; spx[i] -= dcx; spy[i] -= dcy; }
    }
    if (C.weather === "snow") {
      const n = Math.round(NS * C.intensity), t = SP.now;
      for (let i = 0; i < n; i++) {
        const par = ss[i] === 2 ? 1 : 0.75;
        sx_[i] += (Math.sin(t * 1.3 + sp_[i]) * 14 + wind * 40) * dt - dcx * par; sy_[i] += sv[i] * dt - dcy * par;
        if (sy_[i] > h) { sy_[i] -= h + 4; sx_[i] = R() * w; } else if (sy_[i] < -6) sy_[i] += h + 4;
        if (sx_[i] < -4) sx_[i] += w + 8; else if (sx_[i] > w + 4) sx_[i] -= w + 8;
      }
    }
  };
  /** draw in screen space (after the lightmap): colours follow the ambient light */
  FX.drawWeather = function (ctx, w, h) {
    const C = SP.clock, a = C.ambient;
    if (C.weather === "rain" && C.intensity > 0.01) {
      const n = Math.round(NR * C.intensity), sl = C.wind * 0.22;
      const lr = Math.min(255, a[0] * 0.75 + 70), lg = Math.min(255, a[1] * 0.78 + 72), lb = Math.min(255, a[2] * 0.85 + 80);
      for (let pass = 0; pass < 2; pass++) {
        ctx.strokeStyle = `rgba(${lr | 0},${lg | 0},${lb | 0},${pass ? 0.55 : 0.28})`; ctx.lineWidth = 1; ctx.beginPath();
        for (let i = 0; i < n; i++) { if ((rd[i] > 0.5) !== !!pass) continue; const x = Math.round(rx[i]) + 0.5, y = Math.round(ry[i]); ctx.moveTo(x, y); ctx.lineTo(x + rl[i] * sl, y + rl[i]); }
        ctx.stroke();
      }
      ctx.fillStyle = `rgba(${lr | 0},${lg | 0},${lb | 0},0.7)`;
      for (let i = 0; i < NSP; i++) if (spt[i] > 0) { const x = Math.round(spx[i]), y = Math.round(spy[i]), k = spt[i] > 0.1 ? 1 : 2; ctx.fillRect(x - k, y - 1, 1, 1); ctx.fillRect(x + k, y - 1, 1, 1); ctx.fillRect(x, y - 2 + (k - 1), 1, 1); }
    }
    if (C.weather === "snow" && C.intensity > 0.01) {
      const n = Math.round(NS * C.intensity);
      const r = Math.min(255, a[0] * 0.5 + 135) | 0, g = Math.min(255, a[1] * 0.5 + 138) | 0, b = Math.min(255, a[2] * 0.5 + 145) | 0;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      for (let i = 0; i < n; i++) { const s = ss[i]; ctx.fillRect(Math.round(sx_[i]), Math.round(sy_[i]), s, s); }
    }
  };
})(window.SP);
