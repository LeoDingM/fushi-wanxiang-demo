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
  FX.update = function (dt) {
    for (const p of FX.parts) {
      if (p.kind === "smoke") { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz *= 1 - 0.15 * dt; continue; }
      if (p.rest) { p.life -= dt; continue; }
      p.vz -= 9.8 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.z <= 0) { p.z = 0; if (Math.abs(p.vz) > 1.5) { p.vz *= -0.25; p.vx *= 0.4; p.vy *= 0.4; } else p.rest = true; }
    }
    FX.parts = FX.parts.filter((p) => (p.kind === "smoke" ? p.t < p.life : p.life > 0));
    FX.glows = [];
    const night = SP.tint.night, W = SP.world;
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
    if (night > 0.05) {
      for (const o of W.objects) {
        if (o.type === "p_pole") { const p = SP.rotPt([0, -1.45, 6.8], o.rot); FX.glows.push({ x: o.x + p[0], y: o.y + p[1], z: p[2], r: 3.2, c: [255, 225, 160], a: 0.4 * night });
                                   FX.glows.push({ x: o.x + p[0], y: o.y + p[1], z: 0, r: 3.6, c: [255, 210, 140], a: 0.28 * night, flat: true }); }
        if (o.type === "p_stall") { const p = SP.rotPt([0, -0.6, 1.86], o.rot); FX.glows.push({ x: o.x + p[0], y: o.y + p[1], z: p[2], r: 2.2, c: [255, 200, 120], a: 0.45 * night }); }
        if (o.type === "p_locker") { const p = SP.rotPt([0, -0.35, 1.3], o.rot); FX.glows.push({ x: o.x + p[0], y: o.y + p[1], z: p[2], r: 1.3, c: [120, 200, 255], a: 0.35 * night }); }
        if (o.type === "f_window" && W.shownState(o) === "lit") { const p = W.local(o, 1.5, -0.2, 1.65); FX.glows.push({ x: p[0], y: p[1], z: p[2], r: 1.7, c: [255, 200, 120], a: 0.2 * night }); }
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
