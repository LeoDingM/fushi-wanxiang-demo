/* scene-proto · world: scene objects from scene.json, footprint colliders, sort lines + ordering, occluder fading,
   static/dynamic split (facade modules are 'bg' = cached in render chunks; everything an actor can walk behind is
   'dyn' = drawn each frame), runtime states + overlays, data-driven events, interactions (use / kick), repair-over-
   time rules, hazards NPCs avoid, puddles, leaf piles, the event/state log, and the baked ground layer. */
(function (SP) {
  "use strict";
  const K = SP.K;
  const W = (SP.world = { objects: [], byId: {}, decals: [], colliders: [], log: [], hazards: [], timers: [], stash: {}, sceneId: null });
  const FADE_ALPHA = 0.35, FADE_RATE = 7;
  let BG_Y = 17.9;
  function piece(o) { return K.pieces[o.type]; }
  W.piece = piece;
  W.shownState = function (o) {
    if (o.type === "f_window" && o.state === "intact" && W.windowLit(o)) return "lit";
    return o.state;
  };
  /** night_lit windows switch on after dark (and off late at night), deterministic per window + day */
  W.windowLit = function (o) {
    if (!o.night_lit) return false;
    const C = SP.clock;
    if (!C.lampsOn) return false;
    const h = SP.hash(SP.strHash(o.id), C.day), m = C.min, off = 1380 + h * 150;     // lights out 23:00 .. 01:30
    const evening = m >= 900 ? m < off : m < off - 1440;
    const morning = m > 330 + h * 120 && m < 480;
    return evening || morning;
  };
  /** load a scene's data fresh (keepLog: multi-scene switch keeps the global event log) */
  W.load = function (data, keepLog) {
    W.data = data; W.objects = []; W.byId = {}; W.decals = []; W.timers = []; W.hazards = [];
    if (!keepLog) W.log = [];
    W.sceneId = data.id || "street"; W.interior = !!data.interior; BG_Y = data.bg_y != null ? data.bg_y : 17.9;
    W.defs = Object.assign({}, (SP.scenes && SP.scenes.street && SP.scenes.street.interactions) || {}, data.interactions || {});
    snowBlobs = decor = flatSorted = null;
    for (const src of data.objects) {
      const o = Object.assign({ z: 0, rot: 0, variant: "base" }, src);
      const P = piece(o);
      if (!P) { console.warn("unknown piece", o.type); continue; }
      if (!o.state) o.state = P.states[0];
      o.overlays = []; o.alpha = {}; o.since = 0; o.init = { state: o.state, variant: o.variant, x: o.x, y: o.y, rot: o.rot };
      W.objects.push(o); W.byId[o.id] = o;
    }
    W.puddles = (data.puddles || []).map((p) => Object.assign({ splashT: 0 }, p));
    W.leafPiles = (data.leaf_piles || []).map((p) => Object.assign({ state: "pile", since: 0 }, p));
    W.laundry = data.laundry || [];
    classify();
    W.rebuildColliders();
    W.applySeason(true);
  };
  // ---------- multi-scene: street <-> stairwell <-> rooms. Leaving a scene stashes its runtime state; coming back
  // restores it and lets the repair rules catch up on the elapsed game time (everything keys on absolute minutes).
  const STASH = ["data", "objects", "byId", "decals", "timers", "hazards", "puddles", "leafPiles", "laundry", "defs", "bg", "dyn", "bgSorted", "colliders", "interior"];
  W.enter = function (id) {
    const S = SP.scenes[id]; if (!S) return false;
    if (W.sceneId && W.data) { const st = {}; for (const k of STASH) st[k] = W[k]; st.left = SP.clock.abs(); W.stash[W.sceneId] = st; }
    const st = W.stash[id];
    if (st) {
      for (const k of STASH) W[k] = st[k];
      // portals belong to the scene: a stashed scene must bring its own back (they used to stay those of the
      // last freshly-loaded scene -> walk-in triggers / stair E silently pointed at the wrong floor or nowhere)
      W.sceneId = id; W.portals = W.data.portals || []; BG_Y = W.data.bg_y != null ? W.data.bg_y : 17.9; snowBlobs = decor = flatSorted = null;
      for (const o of W.objects) { o.alpha = {}; o._dr = null; }
      W.applySeason(true); W.updateRules();
    } else W.load(S, true);
    return true;
  };
  function classify() {
    W.bg = []; W.dyn = [];
    for (const o of W.objects) {
      if (piece(o).layer !== "sorted") continue;
      o._line = W.sortLine(o);
      o.bg = Math.min(o._line[1], o._line[3]) >= BG_Y && !o.interact_dyn;
      (o.bg ? W.bg : W.dyn).push(o);
      o._dr = null;
    }
    W.bgSorted = W.bg.map((o, i) => ({ o, line: o._line, zo: piece(o).z_order || 0, seq: i })).sort(W.compare).map((d) => d.o);
    W.dyn.forEach((o, i) => (o.seq = i * 4));
  }
  /** season presentation: trees (variant + full/bare), seasonal ground decor -> rebake */
  W.applySeason = function (quiet) {
    const s = SP.clock.season;
    for (const o of W.objects) if (o.type === "p_tree") {
      o.variant = s === "spring" ? "spring" : s === "autumn" ? "autumn" : "base";
      o.state = s === "winter" ? "bare" : "full";
      W.touch(o);
    }
    if (!quiet) W.logEvent(`换季：${SP.clock.seasonName()}`);
  };

  // ---------- footprints / colliders ----------
  W.footprints = function (o) {
    const P = piece(o);
    const rects = (P.footprint_states && o.state in P.footprint_states ? P.footprint_states[o.state] : P.footprint) || [];
    return rects.map((r) => SP.footPoly(r, o.rot, o.x, o.y));
  };
  W.rebuildColliders = function () {
    const C = [];
    for (const o of W.objects) {
      if (piece(o).layer !== "sorted" || o.carried) continue;
      for (const poly of W.footprints(o)) C.push({ poly, box: SP.polyBox(poly), id: o.id });
    }
    for (const c of W.data.colliders || []) {
      const [x0, y0, x1, y1] = c.rect, poly = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
      C.push({ poly, box: c.rect, id: c.id });
    }
    W.colliders = C;
    W.portals = W.data.portals || [];
  };
  /** static footprints, cars and slice bounds. opts: {hazards: NPCs also avoid broken glass} */
  W.blocked = function (x, y, r, ignoreCars, hazards) {
    const B = W.data.bounds;
    if (x - r < B.x0 || x + r > B.x1 || y - r < B.y0 || y + r > B.y1) return "bounds";
    const C = W.colliders;
    for (let i = 0; i < C.length; i++) {
      const b = C[i].box;
      if (x + r < b[0] || x - r > b[2] || y + r < b[1] || y - r > b[3]) continue;
      if (SP.circlePoly(x, y, r, C[i].poly)) return C[i].id;
    }
    if (!ignoreCars && SP.traffic) { const cs = SP.traffic.cars; for (let i = 0; i < cs.length; i++) if (SP.circlePoly(x, y, r + 0.03, cs[i].poly)) return cs[i].id; }
    if (hazards) for (const h of W.hazards) { const dx = x - h.x, dy = (y - h.y) * 1.4; if (dx * dx + dy * dy < (h.r + r) * (h.r + r)) return "hazard"; }
    return null;
  };

  // ---------- ground layer: chunks + decals + low pieces + seasonal decor + snow cover, baked into one canvas ----------
  let snowBlobs = null, decor = null;
  function buildScatter() {
    const R = SP.rng(777), G = W.data.ground, x0 = G.origin[0], y0 = G.origin[1], x1 = x0 + G.cols * 2, y1 = y0 + G.rows * 2;
    snowBlobs = [];
    for (let i = 0; i < 4200; i++) {
      const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0), road = !!W.data.traffic && y > 0 && y < 8;
      const lane = road && (Math.abs(Math.abs(y - 2) - 0.74) < 0.3 || Math.abs(Math.abs(y - 6) - 0.74) < 0.3);
      const thr = R() * 0.8 + (road ? 0.12 : 0) + (lane ? 0.5 : 0);
      snowBlobs.push({ x, y, rx: 0.12 + R() * 0.42, ry: 0.06 + R() * 0.2, thr, c: R() < 0.3 ? 1 : 0 });
    }
    decor = { autumn: [], spring: [] };
    const okSpot = W.data.traffic ? (x, y) => (y < 0 || y > 8.3) && y < 17.6 : (x, y) => x > x0 + 0.4 && x < x1 - 0.4 && y > y0 + 0.4 && y < y1 - 0.5;
    for (let i = 0; i < 70; i++) { const x = W.data.traffic ? 0.5 + R() * 31 : x0 + R() * (x1 - x0), y = W.data.traffic ? -3.4 + R() * 21 : y0 + R() * (y1 - y0); if (okSpot(x, y)) decor.autumn.push({ x, y, k: `fx/leaves/${i % 3}` }); }
    for (const o of W.objects) if (o.type === "p_tree") for (let i = 0; i < 9; i++) {
      const x = o.x + (R() - 0.5) * 5, y = o.y + (R() - 0.5) * 3.2; if (okSpot(x, y)) { decor.spring.push({ x, y, k: `fx/petals/${i % 2}` }); decor.autumn.push({ x, y, k: `fx/leaves/${i % 3}` }); }
    }
  }
  W.groundSnowLevel = () => Math.round(SP.clock.snow * 20) / 20;
  /** ground extent in screen px (chunks cover it) */
  W.groundRect = function () {
    const G = W.data.ground, [X0, Y0] = G.origin;
    const ox = SP.sx(X0), oy = SP.sy(Y0 + G.rows * G.chunk);
    return [ox, oy, G.cols * 96, G.rows * 45];
  };
  let flatSorted = null, snowTmp = null;
  /** draw the ground layer for one screen-px rect (a render chunk): ground tiles, markings, seasonal decor,
      snow cover (low-res blobs, nearest-upscaled -> chunky pixel edges, slush tyre tracks), curbs / steps */
  W.drawGround = function (x, rx, ry, rw, rh, season, sl) {
    if (W.interior) { season = "-"; sl = 0; }
    else if (!snowBlobs) buildScatter();
    const G = W.data.ground, [X0, Y0] = G.origin, ch = G.chunk;
    const hit = (X, Y, f) => f && !(X - f[4] > rx + rw || X - f[4] + f[2] < rx || Y - f[5] > ry + rh || Y - f[5] + f[3] < ry);
    G.data_south_to_north.forEach((row, r) => {
      const Y = SP.sy(Y0 + r * ch); if (Y < ry || Y - 45 > ry + rh) return;
      for (let col = 0; col < row.length; col++) {
        const X = SP.sx(X0 + col * ch); if (X > rx + rw || X + 96 < rx) continue;
        const [pc, st] = G.legend[row[col]].split(":");
        SP.drawFrame(x, SP.frameKey(pc, "base", "main", st || "default", 0), X, Y);
      }
    });
    if (!flatSorted) {
      flatSorted = W.objects.filter((o) => { const L = piece(o).layer; return L === "decal" || L === "low"; });
      flatSorted.sort((a, b) => (piece(a).layer === "low") - (piece(b).layer === "low") || b.y - a.y);
    }
    for (const d of (decor && decor[season]) || []) { const X = SP.sx(d.x), Y = SP.sy(d.y); if (hit(X, Y, SP.frame(d.k))) SP.drawFrame(x, d.k, X, Y, season === "spring" ? 0.85 : 1); }
    const drawFlat = (low) => { for (const o of flatSorted) if ((piece(o).layer === "low") === low) {
      const k = SP.frameKey(o.type, o.variant, "main", o.state, o.rot), X = SP.sx(o.x), Y = SP.sy(o.y, o.z);
      if (!hit(X, Y, SP.frame(k))) continue;
      SP.drawFrame(x, k, X, Y); if (low) SP.drawSnow(x, k, X, Y, sl); } };
    drawFlat(false);
    if (sl > 0.01) {
      const sw = Math.ceil(rw / 2), shh = Math.ceil(rh / 2);
      snowTmp = snowTmp || document.createElement("canvas");
      if (snowTmp.width !== sw || snowTmp.height !== shh) { snowTmp.width = sw; snowTmp.height = shh; }
      const s = snowTmp.getContext("2d");
      s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, sw, shh); s.setTransform(0.5, 0, 0, 0.5, -rx / 2, -ry / 2);
      const [gx, gy, gw, gh] = W.groundRect(), roadTop = SP.sy(8), roadBot = SP.sy(0);
      if (sl > 0.45) {                                  // continuous cover once it's deep
        s.globalAlpha = Math.min(1, (sl - 0.45) * 2.4); s.fillStyle = "#e4eaf3";
        if (!W.data.traffic) s.fillRect(gx, gy, gw, gh);
        else {
          s.fillRect(gx, gy, gw, SP.sy(8.2) - gy); s.fillRect(gx, roadBot, gw, gy + gh - roadBot);
          s.globalAlpha = Math.min(0.9, (sl - 0.45) * 1.9); s.fillStyle = "#d7dde8"; s.fillRect(gx, roadTop, gw, roadBot - roadTop);
        }
        s.globalAlpha = 1;
      }
      for (let i = 0; i < 2; i++) {
        s.fillStyle = i ? "#f2f5fa" : "#dfe5ef"; s.beginPath();
        for (const b of snowBlobs) if (b.thr < sl && b.c === i) {
          const X = SP.sx(b.x), Y = SP.sy(b.y), ex = b.rx * 48, ey = b.ry * 22.5;
          if (X + ex < rx || X - ex > rx + rw || Y + ey < ry || Y - ey > ry + rh) continue;
          s.moveTo(X + ex, Y); s.ellipse(X, Y, ex, ey, 0, 0, 6.283);
        }
        s.fill();
      }
      if (sl > 0.2 && W.data.traffic) {                 // traffic keeps grey slush tyre tracks in both lanes
        s.fillStyle = `rgba(128,134,148,${Math.min(0.85, (sl - 0.2) * 1.6)})`;
        for (const ly of [2, 6]) for (const o of [-0.74, 0.74]) { const y = SP.sy(ly + o); s.fillRect(gx, Math.round(y - 3), gw, 6); }
      }
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(snowTmp, 0, 0, sw * 2, shh * 2); x.restore();
    }
    drawFlat(true);
  };
  // ---------- sorting ----------
  W.sortLine = function (o) {
    const P = piece(o);
    if (P.sort_line) {
      const a = SP.rotPt(P.sort_line[0], o.rot), b = SP.rotPt(P.sort_line[1], o.rot);
      const p = [o.x + a[0], o.y + a[1]], q = [o.x + b[0], o.y + b[1]];
      return p[0] <= q[0] ? [p[0], p[1], q[0], q[1]] : [q[0], q[1], p[0], p[1]];
    }
    const fpr = (P.footprint_states && P.footprint_states[o.state]) || P.footprint;
    if (!fpr || !fpr.length) return [o.x, o.y, o.x, o.y];
    const poly = SP.footPoly(fpr[0], o.rot, o.x, o.y);
    if (o.rot % 2 === 0) { const b = SP.polyBox(poly); return [b[0], b[1], b[2], b[1]]; }
    const r = fpr[0], cx = (r[0] + r[2]) / 2, cy = (r[1] + r[3]) / 2;
    const long = r[3] - r[1] > r[2] - r[0];
    const a = SP.rotPt(long ? [cx, r[1]] : [r[0], cy], o.rot), b = SP.rotPt(long ? [cx, r[3]] : [r[2], cy], o.rot);
    const p = [o.x + a[0], o.y + a[1]], q = [o.x + b[0], o.y + b[1]];
    return p[0] <= q[0] ? [p[0], p[1], q[0], q[1]] : [q[0], q[1], p[0], p[1]];
  };
  const yAt = (l, x) => (l[2] - l[0] < 1e-6 ? (l[1] + l[3]) / 2 : l[1] + (l[3] - l[1]) * SP.clamp((x - l[0]) / (l[2] - l[0]), 0, 1));
  /** painter order: farther (north, larger y) first; ties -> z_order, then a STABLE per-entity seq */
  W.compare = function (a, b) {
    const la = a.line, lb = b.line;
    const o0 = Math.max(la[0], lb[0]), o1 = Math.min(la[2], lb[2]);
    let ya, yb;
    if (o1 >= o0 - 1e-6) { const m = (o0 + o1) / 2; ya = yAt(la, m); yb = yAt(lb, m); }
    else { ya = yAt(la, (lb[0] + lb[2]) / 2); yb = yAt(lb, (la[0] + la[2]) / 2); }
    if (Math.abs(ya - yb) > 1e-4) return yb - ya;
    return (a.zo || 0) - (b.zo || 0) || a.seq - b.seq;
  };
  /** per-object cached drawable records (rebuilt only when state / variant / position changes) */
  function buildDrawables(o) {
    const P = piece(o), st = W.shownState(o), X = SP.sx(o.x), Y = SP.sy(o.y, o.z);
    o._line = W.sortLine(o);
    const out = [];
    P.parts.forEach((part, pi) => {
      const key = SP.frameKey(o.type, o.variant, part, st, o.rot);
      if (!key) return;
      const fadeable = !!(P.fadeable || (P.fade_parts && P.fade_parts.includes(part)));
      out.push({ kind: "obj", o, part, key, X, Y, line: o._line, zo: (P.z_order || 0) + pi * 0.01, seq: o.seq + pi, fadeable, emit: SP.hasEmit(key) });
    });
    o._dr = out; o._st = st;
    return out;
  }
  W.touch = function (o) {
    if (o.bg) { SP.render && SP.render.invalidateObj(o); return; }
    o._dr = null;
    SP.render && SP.render.invalidateShadow(o);
  };
  /** collect y-sorted drawables of dynamic objects (+ soot overlays) */
  W.collect = function (out) {
    for (const o of W.dyn) {
      if (o.hidden) continue;
      if (!o._dr || o._st !== W.shownState(o) || o.carried) buildDrawables(o);
      for (const d of o._dr) out.push(d);
    }
    for (const o of W.objects) for (const ov of o.overlays) if (ov.type === "soot" && ov.active && !o.bg) {
      out.push({ kind: "overlay", o, key: "fx/soot", X: SP.sx(o.x + 1.5), Y: SP.sy(o.y, o.z + 2.42), line: o._line, zo: (piece(o).z_order || 0) + 0.5, seq: o.seq + 3, alpha: Math.min(1, ov.t / 3) });
    }
    return out;
  };
  /** occluder fading: anything drawn after the player whose opaque cells cover his body fades (by fade_group) */
  const hit = new Set();
  W.updateFade = function (list, playerIdx, body, dt) {
    hit.clear(); W.fading = [];
    for (let i = playerIdx + 1; i < list.length; i++) {
      const d = list[i];
      if (!d.fadeable) continue;
      const f = SP.frame(d.key);
      const dx = Math.round(d.X) - f[4], dy = Math.round(d.Y) - f[5];
      if (body.x1 < dx || body.x0 > dx + f[2] || body.y1 < dy || body.y0 > dy + f[3]) continue;
      if (SP.maskHits(d.key, dx, dy, body) >= 3) { hit.add(d.o.fade_group || d.o.id + "/" + d.part); W.fading.push(d.o.id + "/" + d.part); }
    }
    const k = Math.min(1, dt * FADE_RATE);
    for (const o of W.dyn) {
      const P = piece(o);
      if (!(P.fadeable || P.fade_parts)) continue;
      for (const part of P.parts) {
        const on = hit.has(o.fade_group) || hit.has(o.id + "/" + part);
        const fadeable = P.fadeable || (P.fade_parts && P.fade_parts.includes(part));
        const target = on && fadeable ? FADE_ALPHA : 1;
        const a = o.alpha[part] == null ? 1 : o.alpha[part];
        o.alpha[part] = Math.abs(target - a) < 0.005 ? target : a + (target - a) * k;
      }
    }
    W.fadeHit = [...hit];
  };

  // ---------- state changes, log, repair-over-time ----------
  W.logEvent = function (text) {
    const C = SP.clock;
    W.log.push({ t: C.abs(), day: C.day, clock: C.clockLabel(), text });
    if (W.log.length > 80) W.log.shift();
  };
  W.setState = function (o, state, quiet) {
    if (!o || o.state === state) return;
    o.state = state; o.since = SP.clock.abs();
    W.rebuildColliders(); W.touch(o);
  };
  W.def = (o) => W.defs[o.interact] || null;
  /** every game minute: repairs (state -> state after N in-game hours), growth, shop hours, leaf piles */
  W.updateRules = function () {
    const C = SP.clock, now = C.abs(), scale = W.data.repair_hours_scale || 1;
    for (const o of W.objects) {
      if (!o.interact) continue;
      const d = W.defs[o.interact];
      if (o.interact === "shop") {
        const [a, b] = o.hours.map(SP.hm), open = C.min >= a && C.min < b;
        const want = open ? "open" : "closed";
        if (o.state !== want) { W.setState(o, want); W.logEvent(want === "open" ? "便利店开门营业" : "便利店拉下卷帘门打烊"); }
        continue;
      }
      if (!d) continue;
      const rep = d.repair && d.repair[o.state];
      if (rep && now - o.since >= rep.after_h * 60 * scale) {
        const name = o.name || d.name;
        if (rep.clear_decals) W.clearDecals(o.id);
        if (rep.clear_hazard || rep.clear_decals) W.clearHazards(o.id);
        W.setState(o, rep.to);
        if (o.interact === "hydrant") o.spray = 0;
        if (rep.log) W.logEvent(rep.log.replace("{name}", name));
      }
      const gr = d.grow && d.grow[o.state];
      if (gr && o.watered != null && now - o.watered >= gr.after_h * 60) { o.watered = null; W.setState(o, gr.to); W.logEvent(`${d.name}浇过水，长大了一圈`); }
    }
    for (const p of W.leafPiles) if (p.state === "scattered" && now - p.since > 180) { p.state = "pile"; W.logEvent("清洁工把落叶又扫成了一堆"); }
    for (const h of W.hazards) if (h.until && now > h.until) h.dead = true;
    W.hazards = W.hazards.filter((h) => !h.dead);
  };
  W.clearDecals = (owner) => { W.decals = W.decals.filter((d) => d.owner !== owner); };
  W.clearHazards = (owner) => { W.hazards = W.hazards.filter((h) => h.owner !== owner); };
  W.addHazard = (x, y, r, owner, hours) => W.hazards.push({ x, y, r, owner, until: hours ? SP.clock.abs() + hours * 60 : 0 });

  // ---------- interactions ----------
  /** nearest interactable in reach of (x, y): objects with `interact`, puddles (rain), leaf piles (autumn) */
  W.nearest = function (x, y) {
    let best = null, bd = 1.7;
    for (const o of W.objects) {
      if (!o.interact || o.hidden || o.carried) continue;
      let d;
      if (o.interact === "gate" && W.byId.gate_l) { const g = W.byId.gate_l, h = W.byId.gate_r; d = Math.hypot(SP.clamp(x, g.x + 0.9, h.x - 0.9) - x, Math.max(0, o.y - 0.45 - y) + Math.max(0, y - (o.y + 0.45))); }
      else if (piece(o).sort_line && piece(o).sort_line[1][0] >= 2.9) d = Math.hypot(SP.clamp(x, o.x + 0.3, o.x + 2.7) - x, (o.y - 0.3) - y);
      else { const l = o._line || W.sortLine(o); d = Math.hypot(SP.clamp(x, l[0], l[2]) - x, Math.max(0, l[1] - 0.15 - y) + Math.max(0, y - (o.y + 0.5))); }
      if (o.interact === "window" && (y > o.y || d > 1.5)) continue;
      if (d < bd) { bd = d; best = o; }
    }
    if (SP.clock.wet > 0.3 && !W.interior) for (const p of W.puddles) { const d = Math.hypot((x - p.x) / Math.max(1, p.rx), (y - p.y) / Math.max(0.6, p.ry * 2)); if (d < 1.0 && d < bd) { bd = d; best = { interact: "puddle", p }; } }
    return best;
  };
  W.actionFor = function (o, kind) {
    if (!o) return null;
    if (o.interact === "puddle") return kind === "use" ? { label: "踩水" } : { label: "跺脚溅水" };
    const d = W.defs[o.interact];
    if (o.interact === "gate") return kind === "use" ? { label: o.state === "open" ? "关上铁门" : "推开铁门" } : null;
    if (o.interact === "door") return kind === "use" ? { label: "进单元门（回家）" } : null;
    if (o.interact === "locker") return kind === "use" ? { label: "快递柜" } : null;
    if (SP.game) { const g = SP.game.actionFor(o, kind); if (g !== undefined) return g; }
    return d && d[kind] && d[kind][o.state] || null;
  };
  /** run the use/kick action of an interactable; returns a toast string (or null) */
  W.act = function (o, kind, actor) {
    const a = W.actionFor(o, kind);
    if (!a) return null;
    const C = SP.clock, name = o.name || (W.defs[o.interact] && W.defs[o.interact].name) || "";
    if (o.interact === "puddle") { SP.fx.splash(o.p.x, o.p.y, 26); W.logEvent("李默在水坑里踩了一脚，水花四溅"); return "啪嗒！水花四溅"; }
    if (a.do) {
      const r = W.doSpecial(a.do, o, actor);
      if (r !== undefined) return r;
    }
    if (a.to) W.setState(o, a.to);
    if (a.fx) W.objFx(o, a.fx);
    if (a.decal) W.decals.push({ key: a.decal, x: o.x + (a.decal_dx || 0), y: o.y + (a.decal_dy || 0), owner: o.id });
    if (a.clear_decals) { W.clearDecals(o.id); W.clearHazards(o.id); }
    if (a.hazard) { const hp = a.hazard_at || [0, -0.8]; W.addHazard(o.x + hp[0], o.y + hp[1], a.hazard, o.id); }
    if (a.log) W.logEvent(a.log.replace("{name}", name));
    if (kind === "kick") { SP.fx.shake = 0.18; SP.actors && SP.actors.alarm(o.x, o.y, 9); }
    return a.toast || (a.log ? a.log.replace("{name}", name) : null);
  };
  W.objFx = function (o, fx) {
    if (fx === "glass") SP.fx.glassBurst(o.x, o.y - 0.5, o.type === "p_lamp" ? 4.1 : 1.3, 26, 0.6);
    else if (fx === "glass_window") { SP.fx.glassBurst(o.x + 1.5, o.y - 0.15, o.z + 1.6, 34); W.timers.push({ at: SP.now + 1.0, a: { do: "decal", frame: "fx/glass_decal", x: o.x + 1.5, y: o.y - 0.85, owner: o.id } }); }
    else if (fx === "pot") { SP.fx.debris(o.x, o.y, 0.4, 16, [[61, 111, 134], [93, 143, 166], [90, 70, 54]]); }
    else if (fx === "paper") { SP.fx.debris(o.x - 0.3, o.y - 0.2, 1.3, 14, [[233, 225, 204], [192, 70, 58]]); }
  };
  W.doSpecial = function (what, o, actor) {
    const C = SP.clock;
    switch (what) {
      case "push_bike":
        if (SP.player.carry) return "手上已经推着一辆车了";
        SP.player.carry = o; o.carried = true; W.rebuildColliders(); o._dr = null; SP.render && SP.render.invalidateShadow(o);
        W.logEvent("李默扫码解锁了一辆共享单车"); return "扫码成功：推着走（再按 互动 停车）";
      case "buy_drink": {
        const r = SP.game ? SP.game.perform("buy_drink", o) : { ok: true };
        if (!r.ok) return `买不了：${r.reason}`;
        SP.fx.pickup(o.x + 0.1, o.y - 0.45, 0.35); W.logEvent("李默在售货机买了一瓶冰红茶"); return undefined;
      }
      case "game": return SP.game.use(o, actor);
      case "water":
        SP.fx.water(o.x, o.y - 0.1, 0.9); if (o.state === "small") o.watered = C.abs(); W.logEvent("李默给盆栽浇了水"); return undefined;
      case "toggle_spray":
        o.spray = o.spray ? 0 : C.abs() + 20; W.logEvent(o.spray ? "李默拧开了消防栓，水哗哗地流" : "消防栓的阀门被关上了");
        return o.spray ? "拧开阀门：水流了出来" : "关上了阀门";
      case "honk":
        o.honkT = SP.now + 0.6; SP.actors && SP.actors.alarm(o.x, o.y, 7); W.logEvent("李默按了一下停着的车的喇叭"); return "嘀——！";
      case "alarm":
        o.alarmUntil = SP.now + 6; SP.actors && SP.actors.alarm(o.x, o.y, 12); return undefined;
    }
    return undefined;
  };
  /** park the bike 李默 is pushing at a free spot next to him (returns ok) */
  W.parkBike = function (p) {
    const o = p.carry; if (!o) return false;
    const rot = p.dirVec[0] < 0 ? 6 : 2;
    const cand = [[0, -0.75], [0, 0.75], [0.9, 0], [-0.9, 0], [0, -1.2]];
    for (const [dx, dy] of cand) {
      const save = [o.x, o.y, o.rot]; o.x = p.x + dx; o.y = p.y + dy; o.rot = rot; o.carried = false;
      const polys = W.footprints(o);
      const ok = polys.every((poly) => {
        const b = SP.polyBox(poly), B = W.data.bounds;
        if (b[0] < B.x0 || b[2] > B.x1 || b[1] < B.y0 || b[3] > B.y1) return false;
        for (const c of W.colliders) if (c.id !== o.id && !(b[2] < c.box[0] || b[0] > c.box[2] || b[3] < c.box[1] || b[1] > c.box[3])) return false;
        for (const a of SP.actors.all()) if (!a.hidden && a.x > b[0] - a.r && a.x < b[2] + a.r && a.y > b[1] - a.r && a.y < b[3] + a.r) return false;
        if (SP.traffic.cars.some((c) => { const q = SP.polyBox(c.poly); return !(b[2] < q[0] || b[0] > q[2] || b[3] < q[1] || b[1] > q[3]); })) return false;
        return true;
      });
      if (ok) { p.carry = null; W.rebuildColliders(); o._dr = null; o.since = SP.clock.abs(); SP.render && SP.render.invalidateShadow(o); W.logEvent("李默把共享单车停好、锁车"); return true; }
      o.x = save[0]; o.y = save[1]; o.rot = save[2]; o.carried = true;
    }
    return false;
  };

  // ---------- events (data-driven: scene.json "events") ----------
  W.trigger = function (name) {
    const ev = W.data.events[name];
    if (!ev) return false;
    W.logEvent(`事件：${ev.label}`);
    for (const a of ev.actions) W.timers.push({ at: SP.now + (a.after || 0), a, ev: name });
    return true;
  };
  W.updateEvents = function (dt) {
    if (W.timers.length) {
      for (let i = W.timers.length - 1; i >= 0; i--) { const t = W.timers[i]; if (t.at <= SP.now) { W.timers.splice(i, 1); W.run(t.a); } }
    }
    for (const o of W.objects) for (const ov of o.overlays) { ov.t += dt; ov.active = ov.dur == null || ov.t < ov.dur; }
  };
  W.run = function (a) {
    const o = a.target && W.byId[a.target];
    switch (a.do) {
      case "set_state": if (o) W.setState(o, a.state); break;
      case "overlay": if (o) o.overlays.push({ type: a.overlay, t: 0, dur: a.duration, active: true }); break;
      case "decal": W.decals.push({ key: a.frame, x: a.x, y: a.y, owner: a.owner || a.target || "event" });
        if (a.frame === "fx/glass_decal") W.addHazard(a.x, a.y, 0.9, a.owner || a.target || "event", 3);
        break;
      case "fx": if (a.fx === "glass_burst" && o) { SP.fx.glassBurst(o.x + 1.5, o.y - 0.15, o.z + 1.6, a.n || 24); SP.actors && SP.actors.alarm(o.x + 1.5, o.y, 10); } break;
      case "traffic_crash": SP.traffic.crash(a); break;
      case "weather": SP.clock.setWeather(a.weather, a.intensity, true); break;
    }
  };
})(window.SP);
