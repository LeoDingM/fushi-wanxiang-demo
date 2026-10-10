/* scene-proto-45 · FX: particles (glass shards, crash bits, smoke), fire overlay flames, additive light glows.
   Everything lives in world metres; particles carry a tiny 3D sort box so they sort against walls and characters. */
(function (SP) {
  "use strict";
  const FX = (SP.fx = { parts: [], glows: [] });
  const R = () => SP.rand();
  FX.reset = function () { FX.parts = []; };
  /** n = outward wall normal (world), t = along the wall */
  FX.glassBurst = function (x, y, z, n, nrm, tan) {
    nrm = nrm || [0, -1]; tan = tan || [1, 0];
    for (let i = 0; i < n; i++) {
      const u = (R() - 0.5) * 1.4, out = 0.4 + R() * 1.6, side = (R() - 0.5) * 2.4;
      FX.parts.push({ kind: "shard", x: x + tan[0] * u, y: y + tan[1] * u, z: z + (R() - 0.5) * 1.0,
                      vx: nrm[0] * out + tan[0] * side, vy: nrm[1] * out + tan[1] * side, vz: R() * 2.2, key: `fx/shard/${i % 3}`, life: 30 });
    }
  };
  FX.crashBurst = function (x, y, n) {
    for (let i = 0; i < n; i++)
      FX.parts.push({ kind: "bit", x, y, z: 0.5 + R() * 0.4, vx: (R() - 0.5) * 5, vy: (R() - 0.5) * 3, vz: 1 + R() * 2.5, key: i % 2 ? `fx/bit/${i % 3}` : `fx/shard/${i % 3}`, life: 40 });
  };
  FX.smoke = function (x, y, z, dark, size) {
    FX.parts.push({ kind: "smoke", x: x + (R() - 0.5) * 0.6, y, z, vx: 0.2 + R() * 0.25, vy: 0.2 + R() * 0.2, vz: 0.7 + R() * 0.5, t: 0, life: 3.5 + R() * 1.5,
                    dark: dark, size: size == null ? 0 : size });
  };
  // ---- ported from scene-proto/js/fx.js: splashes, water, debris, pickups, leaves / petals, breath, hydrant spray
  const WATER = [[196, 222, 240], [150, 190, 220], [230, 242, 250]];
  const LEAF = [[226, 178, 60], [214, 140, 46], [190, 96, 40], [236, 204, 96]], PETAL = [[246, 200, 214], [252, 228, 236], [232, 170, 192]], GREEN = [[96, 140, 60], [120, 166, 74]];
  const push = (p) => { if (FX.parts.length < 700) FX.parts.push(p); return p; };
  FX.debris = function (x, y, z, n, cols) { for (let i = 0; i < n; i++) push({ kind: "pix", x: x + (R() - 0.5) * 0.4, y: y - 0.1, z, vx: (R() - 0.5) * 2.6, vy: -R() * 1.4, vz: 0.5 + R() * 2, col: cols[i % cols.length], size: 2, life: 25 }); };
  FX.splash = function (x, y, n) { for (let i = 0; i < n; i++) { const a = R() * 6.28, sp = 0.6 + R() * 1.4; push({ kind: "pix", x: x + (R() - 0.5) * 0.3, y, z: 0.02, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: 1.2 + R() * 1.8, col: WATER[i % 3], size: 1, life: 0.6, water: true }); } };
  FX.water = function (x, y, z) { for (let i = 0; i < 14; i++) push({ kind: "pix", x: x + (R() - 0.5) * 0.2, y, z: z + 0.3, vx: (R() - 0.5) * 0.4, vy: 0, vz: -0.5 - R(), col: WATER[i % 3], size: 1, life: 0.6, water: true }); };
  FX.pickup = function (x, y, z) { push({ kind: "can", x, y, z, vz: 0.9, t: 0, life: 1.4, key: "fx/can" }); };
  FX.leafBurst = function (x, y, n) { for (let i = 0; i < n; i++) push({ kind: "pix", x: x + (R() - 0.5) * 0.6, y: y + (R() - 0.5) * 0.3, z: 0.05, vx: (R() - 0.5) * 2.4, vy: (R() - 0.5) * 2.4, vz: 1 + R() * 1.6, col: LEAF[i % 4], size: 2, life: 8, leafy: true }); };
  const DUST = ["#b8ab98", "#a39784", "#c9bfae"], SNOWK = ["#f4f6fb", "#e2e8f2", "#ffffff"];
  /** running foot strike: a few low pixels kicked backwards (dust on dry ground, powder in snow) */
  FX.kick = function (x, y, kind) { const C = kind === "snow" ? SNOWK : DUST; for (let i = 0; i < (kind === "snow" ? 7 : 5); i++) { const a = R() * 6.28, sp = 0.3 + R() * 0.7; push({ kind: "pix", x: x + (R() - 0.5) * 0.2, y: y + (R() - 0.5) * 0.2, z: 0.03, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: 0.5 + R() * 0.9, col: C[i % 3], size: kind === "snow" ? 2 : 1, life: 0.5 }); } };
  FX.breath = function (x, y, z) { push({ kind: "breath", x, y, z, vx: (R() - 0.5) * 0.1, vy: 0, vz: 0.12, t: 0, life: 1.1 }); };
  FX.update = function (dt) {
    const C = SP.clock;
    for (const p of FX.parts) {
      if (p.kind === "smoke" || p.kind === "breath") { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz *= 1 - 0.15 * dt; continue; }
      if (p.kind === "can") { p.t += dt; p.z += p.vz * dt; p.vz *= 1 - 1.5 * dt; p.life -= dt; continue; }
      if (p.kind === "air") {          // falling petal / leaf: flutters down, then rests and fades
        p.t += dt;
        if (p.z > 0) { p.z += p.vz * dt; p.x += (C.wind * 0.6 + Math.sin(p.t * 2.3 + p.ph) * 0.4) * dt; p.y += (C.wind * 0.6 + Math.cos(p.t * 1.7 + p.ph) * 0.3) * dt; if (p.z <= 0) { p.z = 0; p.rest = true; p.life = 5; } }
        else p.life -= dt;
        continue;
      }
      if (p.rest) { p.life -= dt; continue; }
      if (p.leafy && p.z > 0.05) { p.vz = Math.max(p.vz - 9.8 * dt, -0.7); p.vx *= 1 - dt; p.vy *= 1 - dt; } else p.vz -= 9.8 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.z <= 0) {
        p.z = 0;
        if (p.water) { p.life = 0; continue; }
        if (Math.abs(p.vz) > 1.5 && !p.leafy) { p.vz *= -0.25; p.vx *= 0.4; p.vy *= 0.4; } else { p.rest = true; if (p.leafy) p.life = Math.min(p.life, 6); }
      }
    }
    FX.parts = FX.parts.filter((p) => (p.kind === "smoke" || p.kind === "breath" ? p.t < p.life : p.life > 0));
    // seasonal air: blossom petals (spring) / leaves (autumn) drifting down from canopies near the camera
    const se = C.season, rate = se === "autumn" ? 3.2 : se === "spring" ? 2.2 : se === "summer" ? 0.15 : 0;
    FX.leafAcc = (FX.leafAcc || 0) + rate * dt;
    if (FX.leafAcc > 1) {
      const P0 = SP.player, trees = (FX._trees = FX._trees || SP.world.objects.filter((o) => o.type === "p_tree")).filter((o) => Math.abs(o.x - P0.x) + Math.abs(o.y - P0.y) < 26);
      let nAir = 0; for (const p of FX.parts) if (p.kind === "air" && p.z > 0) nAir++;
      while (FX.leafAcc > 1) {
        FX.leafAcc -= 1;
        const o = trees[Math.floor(R() * trees.length)]; if (!o || nAir > 60) { FX.leafAcc = 0; break; }
        nAir++;
        // released just under the canopy rim (below the canopy box, outside the trunk/branch box): the depth sort stays acyclic
        const ang = R() * 6.28, rr = 1.75 + R() * 0.6;
        push({ kind: "air", x: o.x + Math.cos(ang) * rr, y: o.y + Math.sin(ang) * rr, z: 2.0 + R() * 0.25, vz: -0.4 - R() * 0.3, ph: R() * 6.28, t: 0, life: 99,
               col: se === "spring" ? PETAL[Math.floor(R() * 3)] : se === "summer" ? GREEN[Math.floor(R() * 2)] : LEAF[Math.floor(R() * 4)], size: se === "spring" ? 1 : 2 });
      }
    }
    FX.glows = [];
    const night = SP.tint.night, W = SP.world;
    for (const o of W.objects) {      // hydrant water: a fountain when broken, a gush along the kerb when the valve is open
      if (o.type !== "p_hydrant") continue;
      if (o.spray && C.abs() >= o.spray) o.spray = 0;
      if (!(o.state === "broken" || o.spray)) continue;
      const broken = o.state === "broken";
      o.sprayAcc = (o.sprayAcc || 0) + dt * (broken ? 60 : 26);
      while (o.sprayAcc > 1) { o.sprayAcc -= 1;
        const p = push({ kind: "pix", x: o.x + (R() - 0.5) * 0.08, y: o.y - 0.1, z: broken ? 0.75 : 0.42, col: WATER[Math.floor(R() * 3)], life: 2, water: true, size: R() < 0.3 ? 2 : 1 });
        if (broken) { p.vx = (R() - 0.5) * 0.9 + C.wind * 0.4; p.vy = (R() - 0.5) * 0.9; p.vz = 6.5 + R() * 2; } else { p.vx = 0.4 + R() * 0.4; p.vy = -1.2 - R() * 0.6; p.vz = 0.8 + R() * 0.6; } }
    }
    for (const o of W.objects) for (const ov of o.overlays) {
      if (!ov.active) continue;
      if (ov.type === "smoke") {
        const fire = o.overlays.find((q) => q.type === "fire" && q.active);
        const rate = fire ? 16 : Math.max(0, 6 * (1 - (ov.t - 14) / 10));
        ov.acc = (ov.acc || 0) + dt * rate;
        while (ov.acc > 1) { ov.acc -= 1; const p = W.local(o, 1.5, -0.45, 2.3); FX.smoke(p[0], p[1], p[2], fire ? 1 : 0.6, fire ? 1 : 0); }
      }
      if (ov.type === "fire") {
        const k = FX.fireLevel(ov), fl = 0.75 + 0.25 * Math.sin(SP.now * 23) * Math.sin(SP.now * 7.3 + 1.3);
        const p = W.local(o, 1.5, -0.5, 1.4), q = W.local(o, 1.5, -1.2, 0);
        FX.glows.push({ x: p[0], y: p[1], z: p[2], r: 4.6 * k, c: [255, 140, 60], a: 0.6 * k * fl * (0.7 + 0.3 * night) });
        FX.glows.push({ x: q[0], y: q[1], z: 0.05, r: 3.0 * k, c: [255, 120, 50], a: 0.35 * k * fl, flat: true });
      }
    }
  };
  FX.fireLevel = function (ov) { const t = ov.t, d = ov.dur || 14; return SP.clamp(Math.min(t / 2, 1) * Math.min(1, (d - t) / 3), 0, 1); };
  FX.drawables = function (out, view) {
    for (const p of FX.parts) {
      const X = SP.sx(p.x, p.y), Y = SP.sy(p.x, p.y, p.z), rect = { x0: X - 12, y0: Y - 12, x1: X + 12, y1: Y + 12 };
      if (view && !SP.rectsOverlap(rect, view)) continue;
      out.push({ kind: "part", p, X, Y, rect, box: { x0: p.x - 0.04, y0: p.y - 0.04, x1: p.x + 0.04, y1: p.y + 0.04, z0: p.z, z1: p.z + 0.08 }, depth: p.x + p.y, zo: 0, sid: "part" });
    }
    for (const o of SP.world.objects) for (const ov of o.overlays) {
      if (ov.type !== "fire" || !ov.active) continue;
      const box = SP.world.sortBox(o, "main"), c = SP.world.local(o, 1.5, -0.2, 1.0), X = SP.sx(c[0], c[1]), Y = SP.sy(c[0], c[1], c[2]);
      out.push({ kind: "fire", o, ov, X, Y, rect: { x0: X - 70, y0: Y - 90, x1: X + 70, y1: Y + 10 }, box: Object.assign({}, box, { y0: box.y0 - 0.05, x0: box.x0 - 0.05 }),
                 depth: (box.x0 + box.x1 + box.y0 + box.y1) / 2, zo: 5, sid: o.id + "/fire" });
    }
    return out;
  };
  FX.drawPart = function (ctx, p) {
    const X = SP.sx(p.x, p.y), Y = SP.sy(p.x, p.y, p.z);
    if (p.kind === "smoke") {
      const u = p.t / p.life, sz = Math.min(2, Math.floor(u * 3 + p.size)), a = (1 - u) * (u < 0.1 ? u / 0.1 : 1) * 0.75;
      SP.drawFrame(ctx, `fx/smoke/${sz}`, X, Y, a * (p.dark ? 1.15 : 0.6)); return;
    }
    if (p.kind === "pix" || p.kind === "air") {
      const a = p.kind === "air" ? (p.z > 0 ? 1 : Math.max(0, p.life / 5)) : p.rest ? Math.min(1, p.life / 2) : 1;
      if (a < 0.999) ctx.globalAlpha = a;
      ctx.fillStyle = `rgb(${p.col[0]},${p.col[1]},${p.col[2]})`;
      ctx.fillRect(Math.round(X), Math.round(Y), p.size, p.kind === "air" && p.size > 1 && Math.sin(p.t * 6 + p.ph) > 0 ? 1 : (p.size > 1 ? p.size - 1 : 1));
      ctx.globalAlpha = 1; return;
    }
    if (p.kind === "breath") { const u = p.t / p.life; ctx.globalAlpha = 0.5 * (1 - u); ctx.fillStyle = "#eef2f8"; const sz = 2 + Math.floor(u * 4); ctx.fillRect(Math.round(X) - (sz >> 1), Math.round(Y) - (sz >> 1), sz, sz - 1); ctx.globalAlpha = 1; return; }
    if (p.kind === "can") { SP.drawFrame(ctx, p.key, X, Y, Math.min(1, p.life * 2)); return; }
    SP.drawFrame(ctx, p.key, X, Y, p.rest ? Math.min(1, p.life / 3) : 1, true);
  };
  FX.drawFire = function (ctx, o, ov) {
    const k = FX.fireLevel(ov);
    if (k <= 0.02) return;
    const fr = SP.K.fx.fire_frames, fps = SP.K.fx.fire_fps;
    for (const [dx, ph, s] of [[0.85, 0, 1.0], [1.5, 2, 1.25], [2.15, 5, 0.95]]) {
      const i = (Math.floor(SP.now * fps) + ph) % fr, f = SP.frame(`fx/fire/${i}`);
      const p = SP.world.local(o, dx, -0.2, 0.98), X = SP.sx(p[0], p[1]), Y = SP.sy(p[0], p[1], p[2]);
      const h = Math.round(f[3] * k * s), w = Math.round(f[2] * (0.7 + 0.3 * k) * Math.min(1.1, s));
      ctx.drawImage(SP.img.atlas, f[0], f[1], f[2], f[3], Math.round(X - w / 2), Math.round(Y - h), w, h);
    }
  };
  FX.drawGlows = function (ctx) {
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    const S = SP.K.projection.px_per_m;
    for (const g of FX.glows) {
      if (g.a <= 0.01) continue;
      const X = SP.sx(g.x, g.y), Y = SP.sy(g.x, g.y, g.z), r = g.r * S * 0.75;
      ctx.save(); ctx.translate(X, Y);
      if (g.flat || g.z < 0.1) ctx.scale(1, 0.5);                       // ground pools: 2:1 ellipses
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      gr.addColorStop(0, `rgba(${g.c[0]},${g.c[1]},${g.c[2]},${g.a})`); gr.addColorStop(0.45, `rgba(${g.c[0]},${g.c[1]},${g.c[2]},${g.a * 0.35})`); gr.addColorStop(1, `rgba(${g.c[0]},${g.c[1]},${g.c[2]},0)`);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  };
})(window.SP);
