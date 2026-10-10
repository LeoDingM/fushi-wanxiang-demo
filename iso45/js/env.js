/* scene-proto-45 · env.js: weather + light, the 45-degree port of the front-view line (scene-proto/js/render.js +
   fx.js weather parts; same clock / scene.json data, so both lines show the same day, weather and season).
   - lightmap: a half-resolution canvas filled with the clock's ambient colour, every light source added ('lighter',
     pre-rendered radial sprites: 2:1 ellipses for ground pools, discs for bulbs / windows), multiplied over the frame
     once. Emissive atlas pixels (lit windows, signs, vending machine, head/tail lights) are collected in a separate
     layer during the painter pass (erased again where something nearer is drawn over them) and added after the
     multiply, so they glow at night without leaking through occluders. Then small additive halos (bloom).
   - ground: wet darkening, puddles (rain rings, light reflections), snow cover baked into the ground tiles in 3 steps
     (world.js asks E.snowFill), footprints + tyre tracks (ring buffer of 1500 stamps, a few fillRects per frame),
     leaf piles (autumn), hydrant pool.
   - air: screen-space rain streaks / snow flakes (one stroke / batched rects), fog wash; falling petals / leaves and
     breath puffs are world particles in fx.js (depth sorted like everything else).
   - laundry line: its own sorted drawable (rope + clothes swaying in the wind, taken in when it rains). */
(function (SP) {
  "use strict";
  const E = (SP.env = {});
  const C = () => SP.clock, W = SP.world;
  const PX = () => SP.K.projection.px_per_m;
  E.night = 0;
  // ---------------- footprints / tyre tracks ----------------
  const NST = 1500, ST = new Float32Array(NST * 5); let sti = 0;
  E.stamp = function (x, y, kind, dx, dy) { const i = (sti % NST) * 5; ST[i] = x; ST[i + 1] = y; ST[i + 2] = C().abs(); ST[i + 3] = kind; ST[i + 4] = Math.abs(dx) > Math.abs(dy) ? 0 : 1; sti++; };
  E.clearStamps = () => { ST.fill(0); sti = 0; };
  E.stampCount = (kind) => { let n = 0; for (let i = 0; i < NST; i++) if (ST[i * 5 + 3] === kind) n++; return n; };
  function inPuddle(x, y) { for (const p of W.puddles || []) if (((x - p.x) / p.rx) ** 2 + ((y - p.y) / (p.ry * 2)) ** 2 < 1) return p; return null; }
  E.inPuddle = inPuddle;
  /** called by movers every step with the distance walked: footprints in snow, splashes in puddles / heavy rain */
  E.stepFx = function (a, dist) {
    const c = C(); a._acc = (a._acc || 0) + dist;
    if (a._acc < (a.vehicle ? 0.5 : 0.36)) return;
    a._acc = 0; a._foot = a._foot ? 0 : 1;
    const dx = a.x - (a._lx ?? a.x), dy = a.y - (a._ly ?? a.y), n = Math.hypot(dx, dy) || 1; a._lx = a.x; a._ly = a.y;
    if (c.snow > 0.12) {
      if (a.vehicle) { for (const s of [-0.18, 0.18]) E.stamp(a.x - dy / n * s, a.y + dx / n * s, 2, dx, dy); }
      else { const s = a._foot ? 0.07 : -0.07; E.stamp(a.x - dy / n * s, a.y + dx / n * s, 1, dx, dy); }
    }
    if (c.wet > 0.3) {
      if (inPuddle(a.x, a.y)) SP.fx.splash(a.x, a.y, a.isPlayer ? 8 : 5);
      else if (c.weather === "rain" && c.intensity > 0.6 && SP.rand() < 0.25) SP.fx.splash(a.x, a.y, 2);
    }
  };
  // ---------------- per-step: tyre tracks, car splashes, breath ----------------
  E.update = function (dt) {
    const c = C(), cold = c.season === "winter" || c.snow > 0.2 || (c.min < 420 && c.season !== "summer");
    for (const car of SP.traffic.cars) {
      const v = Math.abs(car.v || 0); if (v < 0.05) continue;
      car._tr = (car._tr || 0) + v * dt;
      if (car._tr < 0.45) continue; car._tr = 0;
      const f = SP.rotPt([0, 1, 0], car.rot), sd = SP.rotPt([1, 0, 0], car.rot), wb = car.type === "bus" ? 1.05 : 0.78;
      if (c.snow > 0.12) for (const s of [-wb, wb]) E.stamp(car.x + sd[0] * s - f[0] * 0.8, car.y + sd[1] * s - f[1] * 0.8, 2, f[0], f[1]);
      if (c.wet > 0.3 && inPuddle(car.x, car.y)) { SP.fx.splash(car.x + sd[0] * wb, car.y + sd[1] * wb, 14); SP.fx.splash(car.x - sd[0] * wb, car.y - sd[1] * wb, 14); }
    }
    if (cold) {
      const P = SP.player;
      for (const a of SP.actors.list) {
        if (a.hidden || a.vehicle || Math.abs(a.x - P.x) + Math.abs(a.y - P.y) > 18) continue;
        a._br = (a._br || SP.rand() * 2) - dt;
        if (a._br <= 0) { a._br = 1.4 + SP.rand() * 1.2 - (a.moving ? 0.5 : 0); const v = SP.dirVec[a.dir] || [0, 0]; SP.fx.breath(a.x + v[0] * 0.22, a.y + v[1] * 0.22, (a.height || 1.7) - 0.12); }
      }
    }
  };

  // ---------------- ground snow (baked into ground tiles, 3 steps) ----------------
  E.snowLevel = () => { const s = C() ? C().snow : 0; return s < 0.12 ? 0 : s < 0.42 ? 1 : s < 0.72 ? 2 : 3; };
  const pats = {};
  function snowPattern(ctx, level, road) {
    const k = level + (road ? "r" : "s"); if (pats[k]) return pats[k];
    const N = 256, c = document.createElement("canvas"); c.width = c.height = N; const x = c.getContext("2d"), im = x.createImageData(N, N), d = im.data;
    // periodic value noise (period 256 px, 2 octaves) -> tiles seamlessly across ground chunks and tiles
    const lat = (g, s) => { const L = []; for (let i = 0; i < g * g; i++) L.push(SP.hash(i, s)); return (u, v) => { const fu = u * g / N, fv = v * g / N, i0 = Math.floor(fu), j0 = Math.floor(fv), tu = SP.smooth(fu - i0), tv = SP.smooth(fv - j0), at = (i, j) => L[((j % g) * g + (i % g))];
      return SP.lerp(SP.lerp(at(i0, j0), at(i0 + 1, j0), tu), SP.lerp(at(i0, j0 + 1), at(i0 + 1, j0 + 1), tu), tv); }; };
    const n1 = road ? lat(8, 31) : lat(16, 11), n2 = road ? lat(32, 37) : lat(64, 23), cover = road ? [0, 0.2, 0.5, 0.8][level] : [0, 0.45, 0.8, 0.985][level];
    for (let v = 0; v < N; v++) for (let u = 0; u < N; u++) {
      const n = 0.62 * n1(u, v) + 0.38 * n2(u, v), i = (v * N + u) * 4;
      if (n > cover) continue;
      const edge = cover - n < 0.05, tone = road ? (edge ? [176, 182, 192] : [204, 210, 220]) : edge ? [208, 218, 234] : n2(u, v) > 0.6 ? [226, 234, 246] : [240, 244, 250];
      d[i] = tone[0]; d[i + 1] = tone[1]; d[i + 2] = tone[2]; d[i + 3] = road && level < 3 ? 235 : 255;
    }
    x.putImageData(im, 0, 0);
    return (pats[k] = ctx.createPattern(c, "repeat"));
  }
  /** world.js groundTile: cover the tile with snow; road chunks (asphalt) get less, greyer slush */
  E.snowFill = function (x, items, level, rect) {
    if (!level) return;
    const road = new Path2D();
    for (const it of items) if (it.road) { const [gx, gy, ch] = it.g; road.moveTo(SP.sx(gx, gy), SP.sy(gx, gy, 0)); road.lineTo(SP.sx(gx + ch, gy), SP.sy(gx + ch, gy, 0)); road.lineTo(SP.sx(gx + ch, gy + ch), SP.sy(gx + ch, gy + ch, 0)); road.lineTo(SP.sx(gx, gy + ch), SP.sy(gx, gy + ch, 0)); road.closePath(); }
    const soft = new Path2D(); soft.rect(rect[0], rect[1], rect[2], rect[3]); soft.addPath(road);
    x.save(); x.fillStyle = snowPattern(x, level, false); x.fill(soft, "evenodd");
    x.fillStyle = snowPattern(x, level, true); x.fill(road); x.restore();
  };

  // ---------------- ground fx (per frame, under shadows / objects) ----------------
  const fxKey = (base, i) => { for (let k = i; k >= 0; k--) if (SP.frame(`fx/${base}/${k}`)) return `fx/${base}/${k}`; return null; };
  E.drawGround = function (ctx, view) {
    const c = C(), now = c.abs();
    // leaf piles (autumn)
    if (c.season === "autumn") (W.leafPiles || []).forEach((p, i) => {
      const X = SP.sx(p.x, p.y), Y = SP.sy(p.x, p.y, 0); if (X < view.x0 - 60 || X > view.x1 + 60 || Y < view.y0 - 40 || Y > view.y1 + 40) return;
      const k = p.state === "pile" ? fxKey("leafpile", i % 3) : fxKey("leaves", i % 3); if (k) SP.drawFrame(ctx, k, X, Y);
    });
    // footprints / tyre tracks in snow: fade as fresh snow covers them (or as it melts)
    if (c.snow > 0.08) {
      const fall = c.weather === "snow" ? 1 + 3 * c.intensity : 0.6, vis = Math.min(1, (c.snow - 0.08) * 4);
      ctx.fillStyle = "#8c96aa";
      for (let i = 0; i < NST; i++) {
        const o = i * 5, t = ST[o + 2]; if (!ST[o + 3]) continue;
        const age = (now - t) * fall; if (age > 300 || age < 0) continue;
        const X = SP.sx(ST[o], ST[o + 1]), Y = SP.sy(ST[o], ST[o + 1], 0);
        if (X < view.x0 || X > view.x1 || Y < view.y0 || Y > view.y1) continue;
        ctx.globalAlpha = vis * 0.75 * (1 - age / 300);
        if (ST[o + 3] === 1) ctx.fillRect(Math.round(X) - 1, Math.round(Y) - 1, 3, 2);
        else if (ST[o + 4]) ctx.fillRect(Math.round(X) - 2, Math.round(Y), 5, 1);       // along y: track runs up-left on screen
        else ctx.fillRect(Math.round(X) - 2, Math.round(Y), 5, 1);
      }
      ctx.globalAlpha = 1;
    }
    // wet ground: darker + slightly blue (multiply over the ground only)
    const wk = SP.clamp(c.wet, 0, 1) * (1 - Math.min(1, c.snow * 2));
    if (wk > 0.02) {
      ctx.save(); ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = `rgb(${Math.round(255 - 62 * wk)},${Math.round(255 - 56 * wk)},${Math.round(255 - 40 * wk)})`;
      ctx.fillRect(view.x0, view.y0, view.x1 - view.x0, view.y1 - view.y0); ctx.restore();
    }
    // puddles (+ hydrant pool): sky-tinted water, rain rings
    const pk = SP.clamp((c.wet - 0.3) / 0.4, 0, 1) * (1 - Math.min(1, c.snow * 3));
    const pools = [];
    if (pk > 0.02) for (const p of W.puddles || []) pools.push([p.x, p.y, p.rx, p.ry, pk, p]);
    for (const o of W.objects) if (o.type === "p_hydrant" && (o.state === "broken" || o.spray)) { o.pool = Math.min(1, (o.pool || 0) + 0.004); pools.push([o.x + 0.5, o.y - 0.9, 0.9 * o.pool + 0.2, 0.45 * o.pool + 0.1, 0.9, null]); }
    else if (o.type === "p_hydrant" && o.pool) { o.pool = Math.max(0, o.pool - 0.001); if (o.pool > 0.05) pools.push([o.x + 0.5, o.y - 0.9, 0.9 * o.pool + 0.2, 0.45 * o.pool + 0.1, o.pool, null]); }
    if (pools.length) {
      const amb = c.ambient, S = PX();
      for (const [x, y, rx, ry, k] of pools) {
        const X = SP.sx(x, y), Y = SP.sy(x, y, 0), RX = rx * S * 0.9, RY = ry * S * 0.9;
        if (X + RX < view.x0 || X - RX > view.x1 || Y + RY < view.y0 || Y - RY > view.y1) continue;
        ctx.globalAlpha = 0.62 * k; ctx.fillStyle = `rgb(${Math.round(amb[0] * 0.42)},${Math.round(amb[1] * 0.5)},${Math.round(amb[2] * 0.62)})`;
        ctx.beginPath(); ctx.ellipse(Math.round(X), Math.round(Y), RX, RY, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.35 * k; ctx.strokeStyle = "#c8d8ea"; ctx.beginPath(); ctx.ellipse(Math.round(X) - RX * 0.18, Math.round(Y) - RY * 0.3, RX * 0.55, RY * 0.35, 0, Math.PI * 1.05, Math.PI * 1.7); ctx.stroke();
        if (c.weather === "rain" && c.intensity > 0.1) {                   // rain rings: 3 per puddle, staggered phases
          ctx.strokeStyle = "#dfe8f4";
          for (let r = 0; r < 3; r++) {
            const ph = (((SP.now * 1.6 + r * 0.33 + x * 0.7) % 1) + 1) % 1, seed = Math.floor(SP.now * 1.6 + r * 0.33 + x * 0.7) * 3 + r;
            const ux = (SP.hash(seed, 5) - 0.5) * 1.4 * RX, uy = (SP.hash(seed, 9) - 0.5) * 1.4 * RY;
            ctx.globalAlpha = 0.5 * (1 - ph) * k; ctx.beginPath(); ctx.ellipse(Math.round(X + ux), Math.round(Y + uy), 1 + ph * 6, 0.5 + ph * 3, 0, 0, Math.PI * 2); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    }
    E.wetK = Math.max(wk, pk);
  };
  /** light reflections on the wet ground (vertical streaks under every light), added before the lightmap */
  E.drawReflections = function (ctx, lights, view) {
    const k = E.wetK || 0; if (k < 0.05 || !lights.length) return;
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (const L of lights) {
      if (L.flat || !L.refl || L.a < 0.03) continue;
      const X = SP.sx(L.x, L.y), Y = SP.sy(L.x, L.y, 0); if (X < view.x0 - 20 || X > view.x1 + 20 || Y < view.y0 - 10 || Y > view.y1 + 90) continue;
      const sp = SP.lightSprite(L.c[0], L.c[1], L.c[2], "streak"), w = 10 + L.r * 3, h = 30 + L.r * 14;
      ctx.globalAlpha = Math.min(1, L.a * 0.9 * k); ctx.drawImage(sp, Math.round(X - w / 2), Math.round(Y - 4), w, h);
    }
    ctx.restore();
  };

  // ---------------- light sources ----------------
  const WARM = [255, 214, 150], LAMP = [255, 224, 168], COOL = [210, 232, 255], WIN = [255, 202, 128], SIGN = [130, 255, 176];
  E.lights = function (view) {
    const c = C(), n = E.night, out = [], P = (x, y, z, r, col, a, flat, refl) => out.push({ x, y, z, r, c: col, a, flat, refl });
    if (n > 0.01) {
      const V = view, far = (x, y) => { const X = SP.sx(x, y), Y = SP.sy(x, y, 0); return X < V.x0 - 300 || X > V.x1 + 300 || Y < V.y0 - 200 || Y > V.y1 + 500; };
      const lamps = c.lampsOn ? 1 : 0;
      for (const o of W.objects) {
        if (!o.type.startsWith("p_") && !o.type.startsWith("f_")) continue;
        if (far(o.x, o.y)) continue;
        switch (o.type) {
          case "p_pole": if (lamps) { const h = W.local(o, 0, -1.45, 6.8); P(h[0], h[1], h[2], 2.4, LAMP, 0.85 * n, false, true); P(h[0], h[1], 0, 5.2, LAMP, 0.95 * n, true); } break;
          case "p_lamp": {
            if (!lamps) break;
            const on = o.state !== "broken" || SP.hash(Math.floor(SP.now * 9), SP.strHash(o.id)) > 0.55; if (!on) break;
            const h = W.local(o, 0, -0.9, 4.1); P(h[0], h[1], h[2], 2.0, LAMP, 0.85 * n, false, true); P(h[0], h[1], 0, 3.8, LAMP, (o.state === "broken" ? 0.45 : 0.78) * n, true); break;
          }
          case "p_stall": if (!SP.npcs.list.some((q) => q.id === "vendor" && q.hidden)) { const h = W.local(o, 0, -0.6, 1.86); P(h[0], h[1], h[2], 2.2, WARM, 0.8 * n, false, true); P(h[0], h[1], 0, 2.6, WARM, 0.5 * n, true); } break;
          case "p_locker": { const h = W.local(o, 0, -0.35, 1.3); P(h[0], h[1], h[2], 1.4, COOL, 0.55 * n, false, true); } break;
          case "p_vending": if (o.state === "ok") { const h = W.local(o, 0, -0.5, 1.2); P(h[0], h[1], h[2], 1.6, COOL, 0.7 * n, false, true); P(h[0], h[1], 0, 2.2, COOL, 0.5 * n, true); } break;
          case "p_busstop": { const h = W.local(o, 0, -0.3, 1.5); P(h[0], h[1], h[2], 2.0, COOL, 0.6 * n, false, true); P(h[0], h[1], 0, 2.4, COOL, 0.4 * n, true); } break;
          case "f_window": if (W.shownState(o) === "lit") { const h = W.local(o, 1.5, -0.25, 1.6); P(h[0], h[1], h[2], 1.6, WIN, 0.55 * n, false, (o.z || 0) < 0.5); if ((o.z || 0) < 0.5) { const g = W.local(o, 1.5, -1.0, 0); P(g[0], g[1], 0, 2.0, WIN, 0.45 * n, true); } } break;
          case "f_shop": if (o.state !== "shut") { const h = W.local(o, 1.5, -0.6, 1.4); P(h[0], h[1], h[2], 2.6, [255, 240, 214], 0.75 * n, false, true); const g = W.local(o, 1.5, -1.6, 0); P(g[0], g[1], 0, 3.2, [255, 236, 200], 0.65 * n, true); } break;
          case "f_shopsign": { const h = W.local(o, 1.5, -0.4, 0.3); P(h[0], h[1], h[2], 2.2, SIGN, 0.45 * n, false, true); } break;
          case "p_car": if (o.alarmUntil > SP.now && Math.floor(SP.now * 4) % 2 === 0) { const h = W.local(o, 0, 0, 0.7); P(h[0], h[1], h[2], 2.4, [255, 170, 40], 0.9, false, true); }
                        else if (o.honkT > SP.now) { const h = W.local(o, 0, -2.2, 0.6); P(h[0], h[1], 0, 3.0, [255, 240, 200], 0.6, true); } break;
        }
      }
    } else {           // daytime: only alarms / honks flash
      for (const o of W.objects) if (o.type === "p_car" && o.alarmUntil > SP.now && Math.floor(SP.now * 4) % 2 === 0) { const h = W.local(o, 0, 0, 0.7); P(h[0], h[1], h[2], 2.0, [255, 170, 40], 0.6, false, false); }
    }
    for (const g of SP.traffic.glows()) out.push(Object.assign({ refl: !g.flat }, g, { a: g.a * 1.6 }));
    for (const g of SP.fx.glows) out.push(Object.assign({ refl: true }, g, { a: g.a * 1.4 }));
    return out;
  };
  // ---------------- lightmap ----------------
  const lm = document.createElement("canvas"), lx = lm.getContext("2d"), LS = 0.5;
  E.applyLight = function (ctx, tgt, z, cx, cy, lights) {
    const amb = C().ambient;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "multiply";
    const vis = lights.filter((L) => L.a > 0.01);
    if (!vis.length) { if (amb[0] + amb[1] + amb[2] < 762) { ctx.fillStyle = `rgb(${amb[0]},${amb[1]},${amb[2]})`; ctx.fillRect(0, 0, tgt.width, tgt.height); } ctx.restore(); E.lightCount = 0; return; }
    const w = Math.ceil(tgt.width * LS), h = Math.ceil(tgt.height * LS);
    if (lm.width !== w || lm.height !== h) { lm.width = w; lm.height = h; }
    lx.setTransform(1, 0, 0, 1, 0, 0); lx.globalCompositeOperation = "source-over"; lx.globalAlpha = 1;
    lx.fillStyle = `rgb(${amb[0]},${amb[1]},${amb[2]})`; lx.fillRect(0, 0, w, h);
    lx.globalCompositeOperation = "lighter"; lx.setTransform(z * LS, 0, 0, z * LS, -cx * z * LS, -cy * z * LS);
    const S = PX();
    for (const L of vis) {
      const X = SP.sx(L.x, L.y), Y = SP.sy(L.x, L.y, L.z || 0), r = L.r * S, sp = SP.lightSprite(L.c[0], L.c[1], L.c[2]);
      lx.globalAlpha = Math.min(1, L.a);
      if (L.flat || (L.z || 0) < 0.1) lx.drawImage(sp, X - r, Y - r / 2, 2 * r, r); else lx.drawImage(sp, X - r, Y - r, 2 * r, 2 * r);
    }
    ctx.imageSmoothingEnabled = true; ctx.drawImage(lm, 0, 0, tgt.width, tgt.height); ctx.imageSmoothingEnabled = false;
    ctx.restore(); E.lightCount = vis.length;
  };
  /** additive halos around bulbs (after the emissive layer) */
  E.drawHalos = function (ctx, lights) {
    const n = E.night; ctx.save(); ctx.globalCompositeOperation = "lighter";
    const S = PX();
    for (const L of lights) {
      if (L.flat || (L.z || 0) < 0.1 || L.a < 0.05) continue;
      const X = SP.sx(L.x, L.y), Y = SP.sy(L.x, L.y, L.z), r = Math.max(6, L.r * S * 0.32), sp = SP.lightSprite(L.c[0], L.c[1], L.c[2]);
      ctx.globalAlpha = Math.min(0.8, L.a * 0.5 * (0.4 + 0.6 * n)); ctx.drawImage(sp, X - r, Y - r, 2 * r, 2 * r);
    }
    ctx.restore();
  };
  // ---------------- emissive layer (collected during the painter pass) ----------------
  const em = document.createElement("canvas"), ex = em.getContext("2d");
  E.emitBegin = function (tgt, z, cx, cy) {
    E.emitOn = E.night > 0.02; E.emitRects = [];
    if (!E.emitOn) return;
    if (em.width !== tgt.width || em.height !== tgt.height) { em.width = tgt.width; em.height = tgt.height; }
    ex.setTransform(1, 0, 0, 1, 0, 0); ex.clearRect(0, 0, em.width, em.height); ex.imageSmoothingEnabled = false;
    ex.setTransform(z, 0, 0, z, -cx * z, -cy * z);
  };
  /** after drawing drawable d: add its emissive pixels, or erase emissive pixels it covers */
  E.emitAfter = function (d) {
    if (!E.emitOn) return;
    const R = E.emitRects;
    let hit = false;
    for (let i = 0; i < R.length; i++) if (SP.rectsOverlap(R[i], d.rect)) { hit = true; break; }
    if (hit) {
      ex.globalCompositeOperation = "destination-out";
      if (d.kind === "obj" || d.kind === "car") { const a = d.kind === "obj" && d.o.alpha[d.part] != null ? d.o.alpha[d.part] : 1; ex.globalAlpha = a; SP.eraseFrame(ex, d.key, d.X, d.Y); ex.globalAlpha = 1; }
      else if (d.kind === "actor") d.actor.draw(ex);
      ex.globalCompositeOperation = "source-over";
    }
    if ((d.kind === "obj" || d.kind === "car") && SP.hasEmit(d.key)) {
      const a = d.kind === "obj" && d.o.alpha[d.part] != null ? d.o.alpha[d.part] : 1;
      SP.drawEmit(ex, d.key, d.X, d.Y, a); R.push(d.rect);
    }
  };
  E.emitComposite = function (ctx) {
    if (!E.emitOn || !E.emitRects.length) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = Math.min(1, E.night * 1.15);
    ctx.drawImage(em, 0, 0); ctx.restore();
  };

  // ---------------- laundry line (sorted drawable) ----------------
  E.drawables = function (out, view) {
    for (const L of W.laundry || []) {
      const a = W.byId[L.from], b = W.byId[L.to]; if (!a || !b) continue;
      const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
      const pts = [[a.x, a.y, L.z], [b.x, b.y, L.z], [a.x, a.y, L.z - 0.8], [b.x, b.y, L.z - 0.8]].map((p) => SP.scr(p[0], p[1], p[2]));
      const rect = { x0: Math.min(...pts.map((p) => p[0])) - 6, y0: Math.min(...pts.map((p) => p[1])) - 6, x1: Math.max(...pts.map((p) => p[0])) + 6, y1: Math.max(...pts.map((p) => p[1])) + 10 };
      if (view && !SP.rectsOverlap(rect, view)) continue;
      const box = { x0: x0 + (x1 - x0 > 0.3 ? 0.12 : -0.05), x1: x1 - (x1 - x0 > 0.3 ? 0.12 : -0.05), y0: y0 + (y1 - y0 > 0.3 ? 0.12 : -0.05), y1: y1 - (y1 - y0 > 0.3 ? 0.12 : -0.05), z0: L.z - 0.85, z1: L.z + 0.02 };
      out.push({ kind: "laundry", L, a, b, rect, box, depth: (box.x0 + box.x1 + box.y0 + box.y1) / 2, zo: 0, sid: L.id });
    }
    return out;
  };
  E.drawLaundry = function (ctx, d) {
    const { L, a, b } = d, c = C(), len = Math.hypot(b.x - a.x, b.y - a.y), ux = (b.x - a.x) / len, uy = (b.y - a.y) / len;
    const A = SP.scr(a.x, a.y, L.z), B = SP.scr(b.x, b.y, L.z), sag = 6;
    ctx.save(); ctx.strokeStyle = "#3a3632"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(A[0], A[1]);
    if (L.state !== "fallen") ctx.quadraticCurveTo((A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + sag * 2, B[0], B[1]);
    else ctx.quadraticCurveTo(A[0] + (B[0] - A[0]) * 0.25, A[1] + 30, A[0] + (B[0] - A[0]) * 0.3, A[1] + 40);
    ctx.stroke();
    if (L.state === "hung") {
      const wet = L.wet > 0.2 ? 0.75 : 1, wind = c.wind;
      for (const [t, w, h, col] of L.items) {
        if (t > len) continue;
        const k = t / len, X = SP.lerp(A[0], B[0], k), Y = SP.lerp(A[1], B[1], k) + sag * 4 * k * (1 - k), sw = Math.sin(SP.now * (2 + wind * 3) + t * 2.1) * (1 + wind * 3);
        const W2 = Math.max(4, w * PX() * 0.75 * Math.abs(ux - uy) / 1.414 + 3), H = h * PX() * 0.62;
        const r = parseInt(col.slice(1, 3), 16) * wet, g = parseInt(col.slice(3, 5), 16) * wet, bl = parseInt(col.slice(5, 7), 16) * wet;
        ctx.fillStyle = `rgb(${r | 0},${g | 0},${bl | 0})`;
        ctx.beginPath(); ctx.moveTo(Math.round(X - W2 / 2), Math.round(Y)); ctx.lineTo(Math.round(X + W2 / 2), Math.round(Y)); ctx.lineTo(Math.round(X + W2 / 2 + sw), Math.round(Y + H)); ctx.lineTo(Math.round(X - W2 / 2 + sw), Math.round(Y + H)); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(Math.round(X - W2 / 2 + sw), Math.round(Y + H) - 1, Math.round(W2), 1);
        ctx.fillStyle = "#d8d0bc"; ctx.fillRect(Math.round(X - W2 / 2) + 1, Math.round(Y) - 1, 1, 2); ctx.fillRect(Math.round(X + W2 / 2) - 2, Math.round(Y) - 1, 1, 2);
      }
    }
    ctx.restore();
  };

  // ---------------- screen-space weather + fog ----------------
  const drops = [], flakes = []; let lastCX = null, lastCY = 0;
  E.drawWeather = function (ctx, w, h, camX, camY, zoom, dt) {
    const c = C(), I = c.intensity, mob = w * h < 600000;
    const dX = lastCX == null ? 0 : (camX - lastCX) * zoom, dY = lastCX == null ? 0 : (camY - lastCY) * zoom; lastCX = camX; lastCY = camY;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const wantR = c.weather === "rain" ? Math.round(I * (mob ? 160 : 340) * Math.min(1.5, w * h / 900000 + 0.4)) : 0;
    while (drops.length < wantR) drops.push({ x: SP.rand() * w, y: SP.rand() * h, v: 0.8 + SP.rand() * 0.5, l: 9 + SP.rand() * 9 });
    if (drops.length > wantR) drops.length = wantR;
    if (drops.length) {
      const wx = c.wind * 260;
      ctx.strokeStyle = `rgba(196,212,236,${0.32 + 0.22 * I})`; ctx.lineWidth = 1; ctx.beginPath();
      for (const p of drops) {
        p.x += wx * p.v * dt - dX; p.y += 900 * p.v * dt - dY;
        if (p.y > h + 20) { p.y = -20 - SP.rand() * 40; p.x = SP.rand() * (w + 100) - 50; } if (p.y < -60) p.y += h + 60;
        if (p.x < -40) p.x += w + 80; else if (p.x > w + 40) p.x -= w + 80;
        const sx = wx * 0.018 * p.v, sy = p.l * p.v;
        ctx.moveTo(Math.round(p.x), Math.round(p.y)); ctx.lineTo(Math.round(p.x - sx), Math.round(p.y - sy));
      }
      ctx.stroke();
    }
    const wantS = c.weather === "snow" ? Math.round(I * (mob ? 120 : 260) * Math.min(1.5, w * h / 900000 + 0.4)) : 0;
    while (flakes.length < wantS) flakes.push({ x: SP.rand() * w, y: SP.rand() * h, v: 0.5 + SP.rand() * 0.8, ph: SP.rand() * 6.28, s: SP.rand() < 0.3 ? 3 : 2 });
    if (flakes.length > wantS) flakes.length = wantS;
    if (flakes.length) {
      ctx.fillStyle = "rgba(246,248,255,0.9)";
      for (const p of flakes) {
        p.x += (c.wind * 60 + Math.sin(SP.now * 1.3 + p.ph) * 18) * dt - dX; p.y += 46 * p.v * dt * (zoom > 1 ? 1.3 : 1) - dY;
        if (p.y > h + 6) { p.y = -6; p.x = SP.rand() * w; } if (p.y < -10) p.y += h + 10;
        if (p.x < -10) p.x += w + 20; else if (p.x > w + 10) p.x -= w + 20;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s - 1 || 1);
      }
    }
    ctx.restore();
  };
  E.drawFog = function (ctx, w, h) {
    const f = C().fog; if (f < 0.02) return;
    const a = C().ambient, col = [Math.round(a[0] * 0.75 + 50), Math.round(a[1] * 0.75 + 52), Math.round(a[2] * 0.75 + 58)].map((v) => Math.min(255, v));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, `rgba(${col},${0.72 * f})`); g.addColorStop(0.55, `rgba(${col},${0.42 * f})`); g.addColorStop(1, `rgba(${col},${0.28 * f})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
  };
  /** speech bubbles over parked cars (honk / alarm) */
  E.drawCarFx = function (ctx) {
    for (const o of W.objects) {
      if (o.type !== "p_car") continue;
      const txt = o.alarmUntil > SP.now ? "呜哇~呜哇~" : o.honkT > SP.now ? "嘀——！" : null; if (!txt) continue;
      const X = SP.sx(o.x, o.y), Y = SP.sy(o.x, o.y, 1.9);
      ctx.save(); ctx.font = "bold 12px sans-serif"; const tw = ctx.measureText(txt).width;
      ctx.fillStyle = "rgba(255,250,236,0.95)"; ctx.fillRect(Math.round(X - tw / 2 - 5), Math.round(Y - 26), Math.round(tw + 10), 18);
      ctx.fillStyle = "#2a2224"; ctx.textAlign = "center"; ctx.fillText(txt, Math.round(X), Math.round(Y - 13)); ctx.restore();
    }
  };
})(window.SP);
