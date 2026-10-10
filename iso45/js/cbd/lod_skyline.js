/* 云汇CBD · LOD + skyline: lit-window layers (occupancy by hour and use), tower impostors for far zoom (whole tower
   pre-rendered lazily at 1/32 or 1/64 into a day canvas + a lit-window canvas, budget 8 per frame, re-lit hourly at
   night), crown lighting (天枢塔 colour-cycling lantern + beam), aviation red lights, far-zoom name labels, debug overlay. */
(function (SP) {
  "use strict";
  const C = SP.cbd, X = C._; if (!X) return; C._mods.lod_skyline = true;
  const { D, K, TEX, W, IMP, SX, SY, KX, KY, PZ, clamp, hash, shash, partPoly } = X;
  /** lit-window tile: 4 modules x 6 floors of the style's emit module, each cell on with probability dens; mip level m */
  function litTile(style, dens, m) {
    const key = style + "|" + dens + "|" + m; let t = TEX.lit.get(key); if (t) return t;
    const E = TEX.facE[style]; if (!E) return null;
    const NX = 4, NY = 6, c = document.createElement("canvas"); c.width = E.width * NX; c.height = E.height * NY;
    const x = c.getContext("2d"), seed = shash(style);
    for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) {
      const h = hash(seed + i * 31, j * 17 + 5);
      if (h < dens) { x.globalAlpha = 0.7 + 0.3 * hash(i, j + seed); x.drawImage(E, i * E.width, j * E.height); }
      else if (h < dens + 0.08) { x.globalAlpha = 0.25; x.drawImage(E, i * E.width, j * E.height); }
    }
    let o = c; for (let i = 0; i < m; i++) o = X.half(o);
    TEX.lit.set(key, o); return o;
  }
  const mipEC = new Map();
  function mipE(style, m) { const k = style + m; let c = mipEC.get(k); if (!c) { c = TEX.facE[style]; for (let i = 0; i < m; i++) c = X.half(c); mipEC.set(k, c); } return c; }
  function litDensity(t) {
    const h = ((SP.clock ? SP.clock.min : 720) / 60) % 24, home = /公寓|酒店|住宅/.test(t.use || "") || t.style === "apt";
    if (home) return h < 6 ? 0.15 : h < 17 ? 0.2 : h < 23 ? 0.75 : 0.35;
    return h < 6 ? 0.12 : h < 8 ? 0.3 : h < 18 ? 0.6 : h < 21 ? 0.7 : h < 23.5 ? 0.42 : 0.2;
  }
  /** emissive layer of one part (night): lit windows / shop fronts / crown + spire lighting. returns true if it emitted */
  X.emitPart = function (ex, d, z, nk) {
    const p = d.p, style = p.style; if (style === "canopy") return false;
    if (p.crown === "lantern" || p.crown === "ring" || p.crown === "fin" || p.spire) {
      const hue = ((C.t || 0) * 18 + shash(d.b.id) % 360) % 360, col = d.b.id === "tianshu" ? `hsl(${hue},85%,66%)` : p.spire ? "#fff4d8" : "#bfe8ff";
      for (const f of d.faces) { X.facePath(ex, f, d.z0, d.z1); ex.globalAlpha = nk * (p.crown === "lantern" ? 0.85 : 0.6); ex.fillStyle = col; ex.fill(); }
      ex.globalAlpha = 1; return true;
    }
    const S = K.facades[style]; if (!S || !S.emit || !TEX.facE[style]) return false;
    const M = ex.getTransform(), mip = X.mipFor(z), shop = style.startsWith("shop") || style === "mall_stone" || style === "lobby";
    let src, dens = 1;
    if (shop) src = mip ? mipE(style, mip) : TEX.facE[style];
    else { const o = d.tower ? litDensity(d.b) : 0.55; dens = o > 0.55 ? 0.65 : o > 0.25 ? 0.4 : 0.18; src = litTile(style, dens, mip); }
    if (!src) return false;
    const pat = X.pattern(ex, src, "e:" + style + ":" + dens + ":" + mip), sc = 1 << mip;
    for (const f of d.faces) {
      ex.setTransform(M.multiply(new DOMMatrix([(f.ex - f.ey) * KX, -(f.ex + f.ey) * KY, 0, -PZ, SX(f.a[0], f.a[1]), SY(f.a[0], f.a[1], 0)])));
      pat.setTransform(new DOMMatrix([sc / 32, 0, 0, -sc / PZ, (d.uoff || 0) % (S.w * 4), S.h * 600]));
      ex.fillStyle = pat; ex.globalAlpha = nk * (f.shade < 0.8 ? 0.85 : 1); ex.fillRect(0, d.z0, f.L, d.z1 - d.z0);
    }
    ex.globalAlpha = 1; ex.setTransform(M); return true;
  };
  let impBudget = 0;
  function impostor(t, s) {
    const k = t.id + "|" + s; let I = IMP.get(k); if (I) return I;
    if (impBudget <= 0) return null; impBudget--;
    let r = null; for (const d of t.drawables) r = r ? { x0: Math.min(r.x0, d.rect.x0), y0: Math.min(r.y0, d.rect.y0), x1: Math.max(r.x1, d.rect.x1), y1: Math.max(r.y1, d.rect.y1) } : Object.assign({}, d.rect);
    const w = Math.ceil((r.x1 - r.x0) * s) + 2, h = Math.ceil((r.y1 - r.y0) * s) + 2;
    const mk = () => { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); x.setTransform(s, 0, 0, s, -r.x0 * s + 1, -r.y0 * s + 1); x.imageSmoothingEnabled = true; return [c, x]; };
    const [c, x] = mk(), [ce, xe] = mk();
    const sorted = t.drawables.slice().sort((a, b) => a.z0 - b.z0);
    for (const d of sorted) { const a = d.alpha; d.alpha = 1; X.drawPart(x, d, s); d.alpha = a; }
    for (const d of sorted) { X.erasePart(xe, d); X.emitPart(xe, d, s, 1); }
    I = { c, e: ce, x0: r.x0 - 1 / s, y0: r.y0 - 1 / s, w: w / s, h: h / s, hour: Math.floor((SP.clock ? SP.clock.min : 720) / 60) };
    IMP.set(k, I); C.stats.imps = IMP.size; return I;
  }
  /** far-zoom painter list: one impostor per tower (falls back to its parts while the impostor is still queued) */
  X.impostorList = function (L0, z, n) {
    const s = z < 0.02 ? 1 / 64 : 1 / 32, seen = new Set(), list = [], hr = Math.floor((SP.clock ? SP.clock.min : 720) / 60);
    impBudget = C.testMode ? 999 : 8;
    for (const d of L0) {
      if (d.kind === "prop") continue;
      if (!d.tower) { list.push(d); continue; }
      if (seen.has(d.b)) continue; seen.add(d.b);
      let I = IMP.get(d.b.id + "|" + s);
      if (I && I.hour !== hr && n > 0.1 && impBudget > 0) { IMP.delete(d.b.id + "|" + s); I = null; }
      I = I || impostor(d.b, s);
      if (I) list.push({ kind: "imp", t: d.b, I, depth: d.b.depth, z0: 0, rect: { x0: I.x0, y0: I.y0, x1: I.x0 + I.w, y1: I.y0 + I.h } });
      else for (const q of d.b.drawables) list.push(q);
    }
    return list;
  };
  X.halos = function (ctx, view, z, nk) {
    if (nk < 0.1) return;
    ctx.globalCompositeOperation = "lighter";
    if (z >= 0.12) for (const L of W.lights) {
      if (L.shop) continue; const Xs = SX(L.x, L.y), Ys = SY(L.x, L.y, L.z); if (Xs < view.x0 || Xs > view.x1 || Ys < view.y0 || Ys > view.y1) continue;
      const r = L.z > 5 ? 26 : 16; ctx.globalAlpha = nk * 0.55; ctx.drawImage(X.lightSprite(L.c), Xs - r, Ys - r, r * 2, r * 2);
    }
    const T = W.towers.find((t) => t.id === "tianshu");
    if (T) {   // landmark crown: colour-cycling glow + vertical beam
      const sp = T.parts[T.parts.length - 1], cx = sp.cx != null ? sp.cx : (sp.x0 + sp.x1) / 2, cy = sp.cy != null ? sp.cy : (sp.y0 + sp.y1) / 2;
      const Xs = SX(cx, cy), Ys = SY(cx, cy, sp.z1), hue = ((C.t || 0) * 18) % 360, h = 9000;
      const g = ctx.createLinearGradient(Xs, Ys, Xs, Ys - h); g.addColorStop(0, `hsla(${hue},90%,72%,${0.5 * nk})`); g.addColorStop(1, `hsla(${hue},90%,72%,0)`);
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(Xs - 20, Ys); ctx.lineTo(Xs + 20, Ys); ctx.lineTo(Xs + 170, Ys - h); ctx.lineTo(Xs - 170, Ys - h); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = nk * 0.9; const r = Math.max(300, 30 / z); ctx.drawImage(X.lightSprite(X.hueRgb(hue)), Xs - r, Ys - r * 0.5 - 900, r * 2, r * 2.4);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  };
  /** static occlusion of obstruction lights by nearer towers (geometry never moves -> computed once per light) */
  function avlHidden(T, x, y, zz) {
    const Xs = SX(x, y), Ys = SY(x, y, zz);
    for (const U of W.towers) {
      if (U === T || U.depth >= T.depth) continue;
      for (const d of U.drawables) if (Xs > d.rect.x0 && Xs < d.rect.x1 && Ys > d.rect.y0 && Ys < d.rect.y1 && X.inPoly(Xs, Ys, d.hull)) return true;
    }
    return false;
  }
  X.aviation = function (ctx, view, z, nk) {
    const s = Math.max(1.3, 1.6 / z), t = C.t || 0;
    for (const T of W.towers) {
      if (!T.avl || (T.h || 0) < 150) continue;
      if (SX(T.box[2], T.box[1]) < view.x0 || SX(T.box[0], T.box[3]) > view.x1) continue;
      const on = ((t + T.blink * 2) % 2) < 0.9;
      if (!T.avlVis) T.avlVis = T.avl.map(([x, y, zz]) => !avlHidden(T, x, y, zz));
      for (let i = 0; i < T.avl.length; i++) {
        if (!T.avlVis[i]) continue;
        const [x, y, zz, kind] = T.avl[i];
        if ((kind > 0 && !on) || (kind === 0 && T.h < 400)) continue;   // mid-height pairs only on supertall towers
        const Xs = SX(x, y), Ys = SY(x, y, zz); if (Ys < view.y0 - 50 || Ys > view.y1 + 50) continue;
        ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "#ff2a22"; ctx.fillRect(Xs - s / 2, Ys - s / 2, s, s);
        if (nk > 0.1) { ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = nk * 0.6; const r = Math.max(8, 3.5 / z); ctx.drawImage(X.lightSprite([255, 40, 30]), Xs - r, Ys - r, r * 2, r * 2); ctx.globalAlpha = 1; }
      }
    }
    ctx.globalCompositeOperation = "source-over";
  };
  const FONT = "'PingFang SC','Microsoft YaHei','Noto Sans CJK SC',sans-serif";
  X.labels = function (ctx, z, ox, oy) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const S = (x, y, zz) => [SX(x, y) * z + ox, SY(x, y, zz) * z + oy], cw = C.canvas.width, chh = C.canvas.height, nt = X.night() > 0.4;
    ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    if (z < 0.06 && C.showNames !== false) {   // skyline names, tallest first, greedy declutter (no overlapping boxes)
      ctx.font = "12px " + FONT;
      const placed = [], cand = W.towers.filter((t) => !t.fab && (t.h || 0) >= (z < 0.03 ? 400 : 300)).sort((a, b) => b.h - a.h);
      for (const t of cand) {
        const [Xs, Ys0] = S((t.box[0] + t.box[2]) / 2, (t.box[1] + t.box[3]) / 2, t.top + 12), Ys = Math.max(Ys0, 34);
        if (Xs < 0 || Xs > cw || Ys > chh) continue;
        const big = t.id === "tianshu", txt = `${t.name} ${t.height_m}m`;
        ctx.font = (big ? "bold 14px " : "12px ") + FONT;
        const w = ctx.measureText(txt).width + 10, h = big ? 19 : 16, Xc = clamp(Xs, w / 2 + 4, cw - w / 2 - 4), r = { x0: Xc - w / 2, y0: Ys - h, x1: Xc + w / 2, y1: Ys };
        if (placed.some((q) => r.x0 < q.x1 + 3 && q.x0 < r.x1 + 3 && r.y0 < q.y1 + 2 && q.y0 < r.y1 + 2)) continue;
        placed.push(r);
        ctx.fillStyle = big ? "rgba(60,36,6,0.72)" : "rgba(10,14,24,0.55)"; ctx.fillRect(r.x0, r.y0, w, h);
        ctx.fillStyle = big ? "#ffe08a" : "#e8eef8"; ctx.fillText(txt, Xc, Ys - 2);
      }
    }
    if (z >= 0.2) {
      for (const e of D.exits) {   // red metro roundels with the exit letter
        const [Xs, Ys] = S(e.x, e.y, 4.2), r = clamp(9 * z * 2, 7, 18); if (Xs < -20 || Xs > cw + 20 || Ys < -20 || Ys > chh + 40) continue;
        ctx.fillStyle = "#c8283a"; ctx.beginPath(); ctx.arc(Xs, Ys - r, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = `bold ${Math.round(r * 1.3)}px sans-serif`; ctx.textBaseline = "middle"; ctx.fillText(e.id, Xs, Ys - r + 1); ctx.textBaseline = "bottom";
      }
      if (z >= 0.35) {
        ctx.font = `${Math.round(clamp(11 * z * 1.6, 9, 18))}px ` + FONT;
        for (const b of D.buildings) if (b.sign) { const [Xs, Ys] = S(b.sign.x, b.sign.y, b.sign.z); if (Xs < -100 || Xs > cw + 100 || Ys < 0 || Ys > chh + 30) continue; ctx.fillStyle = nt ? "#fff6dc" : b.kind === "boutique" ? "#fbf6ea" : "#2a3040"; ctx.fillText(b.sign.text, Xs, Ys); }
        for (const t of W.towers) if (t.walk) { const [Xs, Ys] = S((t.box[0] + t.box[2]) / 2, t.box[1], 11.5); if (Xs < -100 || Xs > cw + 100 || Ys < 0 || Ys > chh + 30) continue; ctx.fillStyle = nt ? "#fff6dc" : "#1d2430"; ctx.fillText(t.name, Xs, Ys); }
      }
    }
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  };
  X.debugDraw = function (ctx) {
    const NN = D.nav.nodes; ctx.lineWidth = 1;
    for (const c of W.colliders) { ctx.strokeStyle = c.water ? "#3af" : "rgba(255,60,60,0.8)"; X.polyPath(ctx, c.poly, 0); ctx.stroke(); }
    ctx.strokeStyle = "rgba(255,230,0,0.7)"; ctx.beginPath();
    for (const [i, j] of D.nav.edges) { ctx.moveTo(SX(NN[i][0], NN[i][1]), SY(NN[i][0], NN[i][1], 0)); ctx.lineTo(SX(NN[j][0], NN[j][1]), SY(NN[j][0], NN[j][1], 0)); }
    ctx.stroke();
    for (const e of D.exits) { const [x0, y0, x1, y1] = e.trigger; ctx.strokeStyle = "#0f0"; X.polyPath(ctx, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 0); ctx.stroke(); }
  };
})(window.SP = window.SP || {});
