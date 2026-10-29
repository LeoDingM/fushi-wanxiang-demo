/* 云汇CBD · LOD + skyline: lit-window layers (occupancy by time and use), tower impostors for far zoom (whole tower
   pre-rendered lazily at 1/32 or 1/64 into a day canvas + a lit-window canvas, budget 8 per frame, re-lit every 15 min at
   night), crown lighting (天枢塔 colour-cycling lantern + beam), aviation red lights, far-zoom name labels, debug overlay. */
(function (SP) {
  "use strict";
  const C = SP.cbd, X = C._; if (!X) return; C._mods.lod_skyline = true;
  const { D, K, TEX, W, IMP, SX, SY, KX, KY, PZ, clamp, hash, shash, partPoly } = X;
  /** LOD: near zoom only podium / lower floors; mid gradually reveals; full shaft only when zoomed far enough for impostors */
  X.towerPartVisible = function (d, z) {
    const POD = 40, H = (d.b && d.b.h) || d.z1 || 120;
    if (z >= 0.14) return d.z0 < POD;
    if (z >= 0.055) { const t = (0.14 - z) / (0.14 - 0.055); return d.z0 < POD + t * t * Math.max(0, H - POD); }
    return true;
  };
  /** lit-window tile fallback (shops / non-tower): dens-based mosaic */
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
  // Keep emissive texture coordinates identical to render.js's facade draw.
  // litTile is a 4x6 mosaic of those same modules, so scale the whole mosaic
  // to 4 facade bays by 6 floors while preserving each module's world size.
  function alignEmission(pat, src, S, d, style, nx = 1, ny = 1) {
    pat.setTransform(new DOMMatrix([S.w * nx / src.width, 0, 0, -S.h * ny / src.height,
      (d.uoff || 0) % S.w, style.startsWith("res_") ? d.z0 : 0]));
  }
  function isOffDay() {
    try {
      const GR = (SP.game && SP.game.rules) || (typeof FushiRules !== "undefined" && window.FUSHI_RULES_DATA && (C._rules || (C._rules = FushiRules.create(window.FUSHI_RULES_DATA))));
      if (GR && SP.clock && SP.clock.abs != null) return !!GR.date(SP.clock.abs()).off;
    } catch (e) {}
    const day = SP.clock ? SP.clock.day : 0; return day % 7 === 5 || day % 7 === 6;
  }
  function hourOfDay() { return ((SP.clock ? SP.clock.min : 720) / 60) % 24; }
  function smoothStep(a, b, x) { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function curve(points, h) {
    const x = h < points[0][0] ? h + 24 : h;
    for (let i = 0; i < points.length - 1; i++) {
      let [a, va] = points[i], [b, vb] = points[i + 1];
      if (x >= a && x <= b) { const t = smoothStep(a, b, x); return va + (vb - va) * t; }
    }
    return points[points.length - 1][1];
  }
  // Homes fill in around dinner, then lights fade over several hours with a
  // small stable set left on before dawn. The surrounding night factor still
  // controls when these windows become visible against the sky.
  function homeDensity(h) {
    return curve([[0, .50], [1.5, .31], [3, .16], [5.5, .08], [7, .04], [16.5, .05], [18, .28], [20.5, .78], [22, .76], [24, .50]], h);
  }
  const OVERTIME_TOWERS = new Set(["tianshu", "kunpeng", "yuheng"]);
  function officeDensity(t, h, off) {
    // Most offices empty after work; a few signature towers retain visible
    // late shifts. Smooth curves avoid a hard reset at each clock hour.
    const base = curve([[0, .025], [3, .022], [5.5, .025], [7.5, .17], [9, .50], [12, .47], [14, .50], [17, .42], [18.5, .22], [20, .095], [22, .045], [24, .025]], h);
    const late = OVERTIME_TOWERS.has(t.id) ? curve([[0, .025], [5.5, .025], [8, .10], [10, .19], [17, .18], [19, .145], [22, .125], [24, .03]], h) : base;
    return late * (off ? (OVERTIME_TOWERS.has(t.id) ? .48 : .18) : 1);
  }
  function residentialDensity(h, off) { return homeDensity(h) * (off ? 1.06 : 1); }
  function litDensity(t) {
    const h = hourOfDay(), off = isOffDay(), use = t.use || "";
    const office = /办公|金融|总部|交易|媒体/.test(use), apartment = /公寓|住宅/.test(use) || t.style === "apt", hotel = /酒店/.test(use);
    if (office) return officeDensity(t, h, off);
    if (apartment) return residentialDensity(h, off);
    if (hotel) return Math.min(.34, homeDensity(h) * .40) * (off ? 1.04 : 1);
    return officeDensity(t, h, off);
  }
  function occupancyAlpha(rank, density, width = .08) {
    return clamp((density + width * .5 - rank) / width, 0, 1);
  }
  /** Stable per-tower window ranks; time changes brightness without reseeding bays. */
  const occCache = new Map();
  function towerOcc(t, floorH) {
    const off = isOffDay() ? 1 : 0;
    const key = t.id + "|" + off + "|" + floorH; let O = occCache.get(key);
    if (!O) {
      const floors = Math.max(8, Math.ceil((t.h || 120) / floorH)), bays = 8;
      const seed = shash(t.id), rank = new Float32Array(floors * bays), floorBias = new Float32Array(floors);
      for (let f = 0; f < floors; f++) {
        // Three-floor groups create small stable vertical patches without
        // changing window positions as the clock advances.
        const group = Math.floor(f / 3);
        floorBias[f] = .60 + hash(seed + group * 47, 29) * .80;
        for (let b = 0; b < bays; b++) {
          const shared = hash(seed + group * 31, b * 17 + 7), variation = hash(seed + f * 131, b * 37 + 13);
          rank[f * bays + b] = clamp(shared * .78 + variation * .22, 0, 1);
        }
      }
      // The weighted random values above are clustered around the middle,
      // not uniformly distributed. A 4.5% threshold used to light far fewer
      // than 4.5% of windows, leaving whole office shafts black. Rank small,
      // irregular-height bands separately: keep the local office clusters,
      // but spread their sparse selection through lower/middle/upper floors.
      for (let first = 0; first < floors;) {
        const end = Math.min(floors, first + 9 + Math.floor(hash(seed, first + 83) * 5));
        const slots = [];
        for (let f = first; f < end; f++) for (let b = 0; b < bays; b++) slots.push(f * bays + b);
        slots.sort((a,b)=>rank[a]-rank[b]||a-b);
        slots.forEach((slot,i)=>{rank[slot]=(i+.5)/slots.length;});
        first = end;
      }
      O = { floors, bays, rank, floorBias }; occCache.set(key, O); if (occCache.size > 80) occCache.clear();
    }
    const use = t.use || "";
    O.dens = litDensity(t);
    O.mixedResidential = /办公|金融|总部|交易|媒体/.test(use) && /公寓|酒店|住宅/.test(use);
    O.residentialDens = Math.min(.25, residentialDensity(hourOfDay(), isOffDay()) * .32);
    return O;
  }
  /** Villa face geometry mirrors render.js: dark frame, broad pane, solid
      side strips, center mullion, and a lower horizontal rail stay unlit. */
  function emitVilla(ex, d, nk, partAlpha) {
    const M = ex.getTransform(), density = homeDensity(hourOfDay()) * (isOffDay() ? 1.06 : 1);
    const floor = Math.floor(d.z0 / 3.4), house = d.b && d.b.id || "villa";
    let any = false;
    for (let fi = 0; fi < d.faces.length; fi++) {
      const f = d.faces[fi];
      ex.setTransform(M.multiply(new DOMMatrix([(f.ex - f.ey) * KX, -(f.ex + f.ey) * KY, 0, -PZ, SX(f.a[0], f.a[1]), SY(f.a[0], f.a[1], 0)])));
      const bays = Math.max(1, Math.floor(f.L / 3.8)), step = f.L / bays;
      for (let i = 0; i < bays; i++) {
        const a = i * step + .34, width = step - .68, b = d.z0 + .38, height = d.z1 - d.z0 - .75;
        if (width <= .45 || height <= .55) continue;
        const rank = hash(shash(`${house}|villa|${floor}|${fi}|${i}`), 0x51a7);
        const lit = occupancyAlpha(rank, density, .12);
        if (lit < .01) continue;
        const shine = nk * partAlpha * lit * (f.shade < .8 ? .82 : 1);
        // Match villaFace's inset side strips, center mullion and lower rail.
        const paneL = a + .14 + width * .15 + .04, paneR = a + width * .79 - .04;
        const center = a + width * .5, paneTop = b + height * .78 - .06, paneBottom = b + .10;
        const paneH = paneTop - paneBottom;
        if (paneH <= .2) continue;
        ex.fillStyle = "#ffe5b5"; ex.globalAlpha = shine;
        ex.fillRect(paneL, paneBottom, center - .045 - paneL, paneH);
        ex.fillRect(center + .045, paneBottom, paneR - center - .045, paneH);
        any = true;
      }
    }
    ex.globalAlpha = 1; ex.setTransform(M); return any;
  }
  /** emissive layer of one part (night): lit windows / shop fronts / crown + spire lighting. returns true if it emitted */
  X.emitPart = function (ex, d, z, nk) {
    const p = d.p, style = p.style; if (style === "canopy" || p.roofType) return false;
    const partAlpha = d.alpha == null ? 1 : d.alpha;
    if (p.detail === "villa" && d.b && d.b.tier === "villa") return emitVilla(ex, d, nk, partAlpha);
    if (p.crown === "lantern" || p.crown === "ring" || p.crown === "fin" || p.spire) {
      const hue = ((C.t || 0) * 18 + shash(d.b.id) % 360) % 360, col = d.b.id === "tianshu" ? `hsl(${hue},85%,66%)` : p.spire ? "#fff4d8" : "#bfe8ff";
      for (const f of d.faces) { X.facePath(ex, f, d.z0, d.z1); ex.globalAlpha = nk * partAlpha * (p.crown === "lantern" ? 0.85 : 0.6); ex.fillStyle = col; ex.fill(); }
      ex.globalAlpha = 1; return true;
    }
    if (p.color) return false;
    const S = K.facades[style]; if (!S || !S.emit || !TEX.facE[style]) return false;
    const M = ex.getTransform(), mip = X.mipFor(z), shop = style.startsWith("shop") || style === "mall_stone" || style === "lobby";
    const home = d.b && (d.b.home || d.b.kind === "compound") && !shop && (style === "apt" || style.startsWith("res_") || style.startsWith("glass_") || style === "mall_glass" || style === "stone_grid");
    // 云麓花园 / residential: same household random logic as the old block (per-unit schedule, day seed, weekends/holidays)
    if (home && !d.tower) {
      let GR = null;
      try { GR = (SP.game && SP.game.rules) || (typeof FushiRules !== "undefined" && window.FUSHI_RULES_DATA && (C._rules || (C._rules = FushiRules.create(window.FUSHI_RULES_DATA)))); } catch (e) {}
      const E = mip ? mipE(style, mip) : TEX.facE[style]; if (!E) return false;
      const FH = S.h, abs = SP.clock ? Math.floor(SP.clock.abs()) : 720;
      const ctx = SP.clock ? { weather: SP.clock.weather, intensity: SP.clock.intensity } : {};
      const pat = X.pattern(ex, E, "eH:" + style + ":" + mip);
      let any = false;
      for (const f of d.faces) {
        ex.setTransform(M.multiply(new DOMMatrix([(f.ex - f.ey) * KX, -(f.ex + f.ey) * KY, 0, -PZ, SX(f.a[0], f.a[1]), SY(f.a[0], f.a[1], 0)])));
        alignEmission(pat, E, S, d, style);
        ex.fillStyle = pat;
        const floors = Math.max(0, Math.ceil((d.z1 - d.z0) / FH));
        const ubase = (d.uoff || 0) % S.w, bays = Math.ceil(f.L / S.w);
        for (let fi = 0; fi < floors; fi++) {
          const z0 = d.z0 + fi * FH, z1 = Math.min(d.z1, z0 + FH); if (z1 <= z0) continue;
          const floorNo = Math.max(1, Math.floor(d.z0 / FH) + fi);
          for (let bi = 0; bi < bays; bi++) {
            const x0 = ubase + bi * S.w, x1 = Math.min(f.L, x0 + S.w);
            const left = Math.max(0, x0), right = Math.min(f.L, x1); if (right <= left) continue;
            // Keep the established two-unit household schedule, while assigning
            // each visible facade bay its own stable occupancy rank.
            const uid = d.b.id + "_" + floorNo + "F-0" + ((bi % 2) + 1);
            let scheduled = true, dim = false;
            if (GR && GR.households) { const r = GR.households.lit(uid, abs, ctx); scheduled = !!r.lit; dim = !!r.dim; }
            const rank = hash(shash(d.b.id + "|home|" + floorNo), bi * 31 + 11);
            const occupied = occupancyAlpha(rank, homeDensity(hourOfDay()) * (isOffDay() ? 1.06 : 1), .10);
            if (!scheduled || occupied < .01) continue;
            // The facade emission atlas is a window-shaped alpha mask. Clipping
            // each floor/bay separately prevents blank spandrel bands glowing.
            ex.globalAlpha = nk * partAlpha * occupied * (dim ? 0.35 : f.shade < 0.8 ? 0.8 : 1);
            ex.fillRect(left, z0, right - left, z1 - z0); any = true;
          }
        }
      }
      ex.globalAlpha = 1; ex.setTransform(M); return any;
    }
    if (shop || !d.tower) {
      const dens = shop ? 1 : 0.55, src = shop ? (mip ? mipE(style, mip) : TEX.facE[style]) : litTile(style, dens > 0.55 ? 0.65 : 0.4, mip);
      if (!src) return false;
      const pat = X.pattern(ex, src, "e:" + style + ":" + dens + ":" + mip), tile = !shop;
      for (const f of d.faces) {
        ex.setTransform(M.multiply(new DOMMatrix([(f.ex - f.ey) * KX, -(f.ex + f.ey) * KY, 0, -PZ, SX(f.a[0], f.a[1]), SY(f.a[0], f.a[1], 0)])));
        alignEmission(pat, src, S, d, style, tile ? 4 : 1, tile ? 6 : 1);
        ex.fillStyle = pat; ex.globalAlpha = nk * partAlpha * (f.shade < 0.8 ? 0.85 : 1); ex.fillRect(0, d.z0, f.L, d.z1 - d.z0);
      }
      ex.globalAlpha = 1; ex.setTransform(M); return true;
    }
    // tower: per-floor / per-bay seeded occupancy
    const E = mip ? mipE(style, mip) : TEX.facE[style]; if (!E) return false;
    const FH = S.h, O = towerOcc(d.b, FH);
    const pat = X.pattern(ex, E, "e1:" + style + ":" + mip);
    for (const f of d.faces) {
      ex.setTransform(M.multiply(new DOMMatrix([(f.ex - f.ey) * KX, -(f.ex + f.ey) * KY, 0, -PZ, SX(f.a[0], f.a[1]), SY(f.a[0], f.a[1], 0)])));
      alignEmission(pat, E, S, d, style);
      ex.fillStyle = pat;
      const f0 = Math.max(0, Math.floor(d.z0 / FH)), f1 = Math.min(O.floors, Math.ceil(d.z1 / FH));
      for (let fi = f0; fi < f1; fi++) {
        const z0 = Math.max(d.z0, fi * FH), z1 = Math.min(d.z1, (fi + 1) * FH); if (z1 <= z0) continue;
        const bayW = f.L / O.bays;
        for (let bi = 0; bi < O.bays; bi++) {
          const ix = fi * O.bays + bi;
          const topHome = O.mixedResidential && fi >= Math.floor(O.floors * .75);
          const density = clamp((topHome ? O.residentialDens : O.dens) * O.floorBias[fi], 0, 1);
          // Low occupancy should mean a few readable lit offices, rather
          // than a haze of barely visible pixels at skyline scale.
          const lit = occupancyAlpha(O.rank[ix], density, Math.min(.04, Math.max(.008, density * .6)));
          if (lit < .01) continue;
          ex.globalAlpha = nk * partAlpha * lit * 0.60 * (f.shade < 0.8 ? 0.82 : 1);
          ex.fillRect(bi * bayW + 0.15, z0, bayW - 0.3, z1 - z0);
        }
      }
    }
    ex.globalAlpha = 1; ex.setTransform(M); return true;
  };
  let impBudget = 0;
  const cachedParts = new WeakMap();
  function cacheParts(t) {
    let parts=cachedParts.get(t);if(!parts){
      // Plot boundary walls must remain separate drawables: a pedestrian or
      // tree can stand between the house and the wall in the same private lot.
      parts=t.tier === "villa" ? t.drawables.filter(d=>d.z1>1.3) : t.drawables;
      cachedParts.set(t,parts);
    }
    return parts;
  }
  function bakeEmission(xe, parts, s, r, w, h) {
    xe.setTransform(1, 0, 0, 1, 0, 0); xe.clearRect(0, 0, w, h);
    xe.setTransform(s, 0, 0, s, -r.x0 * s + 1, -r.y0 * s + 1); xe.imageSmoothingEnabled = true;
    for (const d of parts) {
      const a = d.alpha; d.alpha = 1;
      try { X.erasePart(xe, d); X.emitPart(xe, d, s, 1); }
      finally { d.alpha = a; }
    }
  }
  function refreshEmission(I) {
    if (impBudget <= 0) return false;
    impBudget--;
    bakeEmission(I.e.getContext("2d"), I.parts, I.scale, I.bounds, I.pixelW, I.pixelH);
    I.timeSlice = Math.floor((SP.clock ? SP.clock.min : 720) / 15);
    I.day = SP.clock ? SP.clock.day : 0;
    return true;
  }
  function impostor(t, s) {
    const k = t.id + "|" + s; let I = IMP.get(k); if (I) return I;
    if (impBudget <= 0) return null; impBudget--;
    const parts=cacheParts(t);
    let r = null; for (const d of parts) r = r ? { x0: Math.min(r.x0, d.rect.x0), y0: Math.min(r.y0, d.rect.y0), x1: Math.max(r.x1, d.rect.x1), y1: Math.max(r.y1, d.rect.y1) } : Object.assign({}, d.rect);
    const w = Math.ceil((r.x1 - r.x0) * s) + 2, h = Math.ceil((r.y1 - r.y0) * s) + 2;
    const mk = () => { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); x.setTransform(s, 0, 0, s, -r.x0 * s + 1, -r.y0 * s + 1); x.imageSmoothingEnabled = true; return [c, x]; };
    const [c, x] = mk(), [ce, xe] = mk();
    const sorted = X.sortDrawables(parts.slice());
    for (const d of sorted) { const a = d.alpha; d.alpha = 1; X.drawPart(x, d, s); d.alpha = a; }
    bakeEmission(xe, sorted, s, r, w, h);
    // The composited image keeps a world footprint and full height.  Without
    // these, a cached tower cannot participate in the live prism sorter.
    const poly = X.hull(parts.flatMap(d => d.poly)), box = X.bbox(poly);
    I = { c, e: ce, parts: sorted, scale: s, bounds: r, pixelW: w, pixelH: h,
      x0: r.x0 - 1 / s, y0: r.y0 - 1 / s, w: w / s, h: h / s,
      sh: [{ p: poly }], z0: Math.min(...parts.map(d => d.z0)), z1: Math.max(...parts.map(d => d.z1)),
      depth: (box[0]+box[1]+box[2]+box[3])/2,
      timeSlice: Math.floor((SP.clock ? SP.clock.min : 720) / 15), day: SP.clock ? SP.clock.day : 0 };
    IMP.set(k, I); C.stats.imps = IMP.size; return I;
  }
  /** Overview: cache tall residential buildings as well as full skyline towers.
      At estate scale the 1/8 images retain the balconies and curtainwall, while
      eliminating hundreds of pattern transforms and garden draws per frame. */
  X.impostorList = function (L0, z, n) {
    const s = z < 0.025 ? 1 / 32 : z < 0.05 ? 1 / 16 : 1 / 8, seen = new Set(), list = [], timeSlice = Math.floor((SP.clock ? SP.clock.min : 720) / 15);
    impBudget = C.testMode ? 999 : 3;
    for (const d of L0) {
      if (d.kind === "prop") continue;
      const boundary = d.b && d.b.tier === "villa" && d.z1<=1.3;
      const cacheable = !boundary && d.kind === "part" && ((d.tower && z < 0.048) ||
        (!d.tower && d.b && d.b.home && d.b.drawables.length >= 6));
      if (!cacheable) {
        if (d.tower && !X.towerPartVisible(d,z)) continue;
        d.static = true; list.push(d); continue;
      }
      if (seen.has(d.b)) continue; seen.add(d.b);
      let I = IMP.get(d.b.id + "|" + s);
      const day = SP.clock ? SP.clock.day : 0;
      if (I && ((I.timeSlice !== timeSlice && n > 0.1) || I.day !== day)) refreshEmission(I);
      I = I || impostor(d.b, s);
      if (I) list.push({ kind: "imp", t: d.b, b:d.b, I, depth: I.depth, z0: I.z0, z1:I.z1, sh:I.sh, alpha:1, static:true, tower:!!d.tower,
        rect: { x0: I.x0, y0: I.y0, x1: I.x0 + I.w, y1: I.y0 + I.h } });
      else for (const q of cacheParts(d.b)) { q.static=true; list.push(q); }
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
