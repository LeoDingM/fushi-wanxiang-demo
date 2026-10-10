/* 云汇CBD · lighting + fx + weather: sky gradient (time / weather tinted, stars at night), half-res lightmap (SP.clock
   ambient multiply + additive light sprites: street / park lamps, shop fronts, lobbies, headlight pools; far zoom = road
   glow), car head / tail lights, fountain spray (07:00-22:30, coloured at night), busker notes, lake shimmer,
   screen-space rain / snow / fog (+ distance haze at skyline zoom). */
(function (SP) {
  "use strict";
  const C = SP.cbd, X = C._; if (!X) return; C._mods.lighting = true;
  const { D, W, TR, FX, SX, SY, hash, rectPoly, partPoly } = X;
  X.drawSky = function (ctx, Wd, Hd) {
    const ck = SP.clock, amb = ck ? ck.ambient : [255, 255, 255], n = X.night(), w = ck && ck.intensity > 0.2 ? ck.weather : "clear";
    const top = w === "rain" ? [96, 110, 128] : w === "snow" ? [176, 186, 200] : w === "fog" ? [184, 188, 194] : [70, 146, 226], bot = w === "clear" ? [200, 228, 248] : [206, 210, 216];
    const m = (c, k) => `rgb(${Math.min(255, c[0] * amb[0] / 255 * k) | 0},${Math.min(255, c[1] * amb[1] / 255 * k) | 0},${Math.min(255, c[2] * amb[2] / 255 * k) | 0})`;
    const [s0, s1] = n > 0.6 ? ["#070d26", "#22305e"] : [m(top, 1), m(bot, 1.05)];
    const city = n > 0.6 ? "#1c2238" : m([150, 160, 172], 1);
    const gr = ctx.createLinearGradient(0, 0, 0, Hd); gr.addColorStop(0, s0); gr.addColorStop(0.5, s1); gr.addColorStop(1, city); ctx.fillStyle = gr; ctx.fillRect(0, 0, Wd, Hd);
    if (n > 0.5) { ctx.fillStyle = "rgba(255,255,255,0.8)"; for (let i = 0; i < 60; i++) ctx.fillRect(hash(i, 1) * Wd, hash(i, 2) * Hd * 0.6, 1, 1); }
  };
  const lsCache = new Map();
  X.lightSprite = function (c) {
    const k = c.join(","); let s = lsCache.get(k); if (s) return s;
    s = document.createElement("canvas"); s.width = s.height = 64; const x = s.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, `rgba(${c},1)`); g.addColorStop(0.45, `rgba(${c},0.4)`); g.addColorStop(1, `rgba(${c},0)`); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    lsCache.set(k, s); return s;
  };
  X.hueRgb = function (h) { const k = (n) => (n + h / 30) % 12, f = (n) => Math.round(255 * (0.66 - 0.3 * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))); return [f(0), f(8), f(4)]; };
  let lightC = null;
  X.applyLight = function (ctx, view, z, ox, oy, Wd, Hd, nk) {
    const ck = SP.clock; if (!ck) return;
    const amb = ck.ambient.map((v) => Math.min(255, v * 1.05));
    if (amb[0] > 252 && amb[1] > 252 && amb[2] > 250 && !nk) return;
    const hw = Math.ceil(Wd / 2), hh = Math.ceil(Hd / 2);
    if (!lightC) lightC = document.createElement("canvas"); if (lightC.width !== hw || lightC.height !== hh) { lightC.width = hw; lightC.height = hh; }
    const lx = lightC.getContext("2d"); lx.setTransform(1, 0, 0, 1, 0, 0); lx.globalCompositeOperation = "source-over";
    lx.fillStyle = `rgb(${amb[0] | 0},${amb[1] | 0},${amb[2] | 0})`; lx.fillRect(0, 0, hw, hh);
    if (nk > 0.05) {
      lx.setTransform(z / 2, 0, 0, z / 2, ox / 2, oy / 2); lx.globalCompositeOperation = "lighter";
      if (z >= 0.1) {
        for (const L of W.lights) {
          const Xs = SX(L.x, L.y), Ys = SY(L.x, L.y, 0); if (Xs < view.x0 - 600 || Xs > view.x1 + 600 || Ys < view.y0 - 400 || Ys > view.y1 + 400) continue;
          const rr = L.r * 32; lx.globalAlpha = Math.min(1, nk * L.k * 0.85); lx.drawImage(X.lightSprite(L.c), Xs - rr, Ys - rr * 0.5, rr * 2, rr);
        }
        lx.globalAlpha = nk * 0.5;
        for (const c of TR.cars) {
          const q = c.hl + 5, Xs = SX(c.x + c.hx * q, c.y + c.hy * q), Ys = SY(c.x + c.hx * q, c.y + c.hy * q, 0);
          if (Xs < view.x0 - 300 || Xs > view.x1 + 300 || Ys < view.y0 - 300 || Ys > view.y1 + 300) continue;
          lx.drawImage(X.lightSprite([255, 240, 210]), Xs - 140, Ys - 70, 280, 140);
        }
        lx.globalAlpha = 1;
      } else {   // far: sodium glow along the roads
        lx.globalAlpha = nk * 0.55; lx.fillStyle = "rgb(150,112,64)";
        for (const zn of D.zones) if (zn.m === "asphalt" || zn.m === "intersection" || zn.m === "brt") { lx.beginPath(); zn.p.forEach(([a, b], i) => (i ? lx.lineTo(SX(a, b), SY(a, b, 0)) : lx.moveTo(SX(a, b), SY(a, b, 0)))); lx.closePath(); lx.fill(); }
        lx.globalAlpha = 1;
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "multiply"; ctx.imageSmoothingEnabled = true; ctx.drawImage(lightC, 0, 0, Wd, Hd); ctx.globalCompositeOperation = "source-over";
  };
  X.carLights = function (ex, c, z) {
    const fx = c.x + c.hx * c.hl, fy = c.y + c.hy * c.hl, bx = c.x - c.hx * c.hl, by = c.y - c.hy * c.hl, px = -c.hy * c.hw * 0.7, py = c.hx * c.hw * 0.7, s = Math.max(1.5, 1.6 / z);
    ex.fillStyle = "#fff6d8"; for (const k of [-1, 1]) { const Xs = SX(fx + px * k, fy + py * k), Ys = SY(fx + px * k, fy + py * k, 0.65); ex.fillRect(Xs - s, Ys - s, s * 2, s * 2); }
    ex.fillStyle = "#ff3a30"; for (const k of [-1, 1]) { const Xs = SX(bx + px * k, by + py * k), Ys = SY(bx + px * k, by + py * k, 0.8); ex.fillRect(Xs - s * 0.8, Ys - s * 0.8, s * 1.6, s * 1.6); }
  };
  // ---------------------------------------------------------------- fx
  X.fxStep = function (dt) {
    FX.t += dt; FX.list = [];
    const h = ((SP.clock ? SP.clock.min : 720) / 60) % 24, [fx0, fy0] = D.fountain;
    if (h > 7 && h < 22.5) {
      if (!FX.fountain) { const Xs = SX(fx0, fy0), Ys = SY(fx0, fy0, 0); FX.fountain = { kind: "fx", depth: fx0 + fy0 - 0.1, sh: [{ p: rectPoly([-1, -1, 1, 1], fx0, fy0, 0) }], z0: 1.7, z1: 8, alpha: 1, rect: { x0: Xs - 110, y0: Ys - 360, x1: Xs + 110, y1: Ys + 20 }, draw: drawFountain }; }
      FX.list.push(FX.fountain);
    }
    for (const b of D.buskers) if (b.actor) {
      if (!b.notes) { const Xs = SX(b.x, b.y), Ys = SY(b.x, b.y, 0); b.notes = { kind: "fx", depth: b.x + b.y - 0.6, sh: [{ p: rectPoly([-0.3, -0.3, 0.3, 0.3], b.x, b.y, 0) }], z0: 1.9, z1: 4, alpha: 1, rect: { x0: Xs - 30, y0: Ys - 170, x1: Xs + 50, y1: Ys - 70 }, draw: (ctx) => notes(ctx, b) }; }
      FX.list.push(b.notes);
    }
  };
  function drawFountain(ctx) {
    const [fx0, fy0] = D.fountain, Xs = SX(fx0, fy0), Ys = SY(fx0, fy0, 1.7), t = FX.t, n = X.night();
    for (let i = 0; i < 80; i++) {
      const ph = (t * 0.9 + i * 0.137) % 1, a = i * 2.4, big = i % 3 === 0, r = ph * (big ? 50 : 85), h = Math.sin(ph * Math.PI) * (big ? 300 : 150);
      ctx.fillStyle = n > 0.4 ? `rgba(${170 + 60 * Math.sin(t + i) | 0},210,255,0.85)` : "rgba(236,246,255,0.85)";
      ctx.fillRect(Math.round(Xs + Math.cos(a) * r), Math.round(Ys - h + Math.sin(a) * r * 0.5), 2, 3);
    }
    ctx.fillStyle = "rgba(240,248,255,0.55)"; ctx.fillRect(Xs - 3, Ys - 300, 6, 300);
  }
  function notes(ctx, b) {
    const Xs = SX(b.x, b.y), Ys = SY(b.x, b.y, 1.9); ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center";
    for (let i = 0; i < 3; i++) { const ph = (FX.t * 0.5 + i / 3) % 1; ctx.globalAlpha = 1 - ph; ctx.fillStyle = ["#ffd25c", "#ff8fb0", "#9fd8ff"][i]; ctx.fillText(i % 2 ? "♪" : "♫", Xs + Math.sin((ph + i) * 6) * 10 + 8, Ys - ph * 60); }
    ctx.globalAlpha = 1; ctx.textAlign = "left";
  }
  X.waterFx = function (ctx) {
    const c = D.lake.c, r = D.lake.r, t = FX.t;
    ctx.save(); X.polyPath(ctx, partPoly({ shape: "ell", cx: c[0], cy: c[1], rx: r[0], ry: r[1], n: 28 }), 0); ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    for (let i = 0; i < 70; i++) { const x = c[0] - r[0] + ((i * 37.3 + t * 0.6) % (2 * r[0])), y = c[1] - r[1] + ((i * 17.9) % (2 * r[1])); ctx.fillRect(Math.round(SX(x, y)), Math.round(SY(x, y, 0)), 10 + (i % 3) * 6, 2); }
    ctx.restore();
  };
  X.weather = function (ctx, Wd, Hd, z) {
    const ck = SP.clock; if (!ck) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const I = ck.intensity, w = ck.weather, t = C.t || 0;
    if (w === "rain" && I > 0.05) { ctx.strokeStyle = "rgba(200,214,236,0.5)"; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i < 260 * I; i++) { const x = (hash(i, 7) * Wd + t * 60 * (0.5 + hash(i, 3))) % Wd, y = (hash(i, 9) * Hd + t * 900 * (0.8 + hash(i, 5) * 0.4)) % Hd; ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 14); } ctx.stroke(); }
    if (w === "snow" && I > 0.05) { ctx.fillStyle = "rgba(255,255,255,0.9)"; for (let i = 0; i < 220 * I; i++) { const x = (hash(i, 7) * Wd + Math.sin(t * 0.7 + i) * 20 + t * 12) % Wd, y = (hash(i, 9) * Hd + t * 50 * (0.6 + hash(i, 5) * 0.8)) % Hd, s = 1 + (i % 3); ctx.fillRect(x, y, s, s); } }
    const fog = (ck.fog || 0) * 0.9 + (z < 0.06 ? 0.1 * (1 - z / 0.06) : 0);
    if (fog > 0.02) { const g = ctx.createLinearGradient(0, 0, 0, Hd), c = X.night() > 0.5 ? "30,40,70" : "214,222,232"; g.addColorStop(0, `rgba(${c},${fog * 0.7})`); g.addColorStop(1, `rgba(${c},${fog * 0.3})`); ctx.fillStyle = g; ctx.fillRect(0, 0, Wd, Hd); }
  };
})(window.SP = window.SP || {});
