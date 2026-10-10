/* 浮世万象 · scene-proto-45 · 地铁 metro module (self-contained: no edits to the core). Two enterable stations of 3号线 —
   井槐里站 (peripheral, older) and 中央商务区站 (CBD, grand) — each = street entrance + concourse (security, ticket machines,
   service counter, fare gates) + island platform (screen doors, countdown boards, trains). Ride = fade + time skip + fare.
   Data: metro45.js (tools/build_metro.py from tools/layouts/metro_*.json), kit_metro/ (Blender 45° kit, own atlas),
   rules: FUSHI_RULES_DATA.metro (shared-rules/rules.json "metro"; metro45.js carries a fallback copy).
   Rendering uses the same 2:1 dimetric projection as js/core.js (sx = (x-y)*32, sy = -((x+y)*16 + z*39.19)), its own
   box-sort + occluder fade, own canvas + HUD + touch controls, so the core loop simply pauses while the metro is active.
   API:  const m = FushiMetro.create({ canvas, host, base, onExit });  m.enter("jinghuaili" | "cbd" | areaId, { exit: "A" });
         onExit(target, info): target "street" (井槐里路, back to the core street) or "cbd" (CBD module stub), info = {station, exit}
   host (optional, defaults to a standalone mock): now() abs game min · advance(min) · money() · spend(amt, label, method) -> bool ·
         state() -> persistent object for card / tokens · isWorkday() · season() · toast(msg) · log(msg) */
(function () {
  "use strict";
  const KX = 32, KY = 16, PZ = 39.1918;
  const sx = (x, y) => (x - y) * KX, sy = (x, y, z) => -((x + y) * KY + (z || 0) * PZ);
  const DIRS = ["E", "NE", "N", "NW", "W", "SW", "S", "SE"];
  const dirFromWorld = (vx, vy) => DIRS[(Math.round(Math.atan2(vy, vx) / (Math.PI / 4)) + 8) % 8];
  const scr2world = (dx, dy) => { const wx = dx - dy, wy = -dx - dy, L = Math.hypot(wx, wy) || 1; return [wx / L, wy / L]; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = Math.random;
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const rotPt = (x, y, rot) => { const a = (rot || 0) * Math.PI / 4, c = Math.round(Math.cos(a) * 1e9) / 1e9, s = Math.round(Math.sin(a) * 1e9) / 1e9; return [x * c - y * s, x * s + y * c]; };
  const rectDist = (x, y, b) => Math.hypot(Math.max(b[0] - x, 0, x - b[2]), Math.max(b[1] - y, 0, y - b[3]));
  const inRect = (x, y, r) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3];
  const hhmm = (abs) => { const m = ((Math.floor(abs) % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
  const SCRIPT_BASE = ((document.currentScript && document.currentScript.src) || "").replace(/js\/metro\.js.*$/, "");

  const FM = (window.FushiMetro = {});
  FM.data = () => window.METRO45;
  FM.rules = () => (window.FUSHI_RULES_DATA && window.FUSHI_RULES_DATA.metro) || (window.METRO45 && window.METRO45.rules);

  // ------------------------------------------------------------------ standalone host (preview); the core passes its own
  FM.mockHost = function (opt) {
    opt = opt || {}; const RD = window.FUSHI_RULES_DATA || {}, cal = RD.calendar || { start_date: [2026, 3, 23], start_weekday: 1 };
    const d0 = Date.UTC(cal.start_date[0], cal.start_date[1] - 1, cal.start_date[2]);
    const dayOf = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - d0) / 864e5);
    const H = { abs: (opt.day != null ? opt.day : dayOf(2026, 10, 12)) * 1440 + (opt.min != null ? opt.min : 8 * 60 + 5), cash: opt.money != null ? opt.money : 1500, st: {}, msgs: [] };
    const iso = (day) => { const t = new Date(d0 + day * 864e5); return t.toISOString().slice(0, 10); };
    return {
      now: () => H.abs, advance: (m) => { H.abs += m; }, setNow: (a) => { H.abs = a; },
      money: () => H.cash, spend: (a, label) => { if (H.cash < a) return false; H.cash = Math.round((H.cash - a) * 100) / 100; H.msgs.push(label + " -¥" + a); return true; },
      state: () => H.st, season: () => opt.season || "autumn",
      isWorkday: () => {
        const day = Math.floor(H.abs / 1440), s = iso(day), wd = ((cal.start_weekday || 1) + day) % 7;
        if ((cal.makeup_workdays || []).includes(s)) return true;
        if ((cal.holidays || []).some((h) => s >= h.from && s <= h.to)) return false;
        return wd >= 1 && wd <= 5;
      },
      dateLabel: () => { const day = Math.floor(H.abs / 1440), t = new Date(d0 + day * 864e5), wd = ((cal.start_weekday || 1) + day) % 7;
        return `${t.getUTCMonth() + 1}月${t.getUTCDate()}日 周${"日一二三四五六"[wd]}`; },
    };
  };

  // ------------------------------------------------------------------ instance
  FM.create = function (opt) {
    const I = {}; FM.inst = I;
    const canvas = opt.canvas, ctx = canvas.getContext("2d");
    const host = opt.host || FM.mockHost(opt.mock);
    const base = opt.base != null ? opt.base : SCRIPT_BASE;
    const MAN = window.KIT_METRO_MANIFEST, DATA = window.METRO45, R = FM.rules();
    const EMIT = new Set(MAN.emit || []);
    const ST = host.state(); if (!ST.metro) ST.metro = { card: R.card.start_balance, tokens: [], entry: null };
    const MS = ST.metro;
    const img = {};
    const load = (k, src) => new Promise((res) => { const im = new Image(); im.onload = () => { img[k] = im; res(im); }; im.onerror = () => { console.error("metro: missing", src); res(null); }; im.src = src; });
    const ready = Promise.all([load("atlas", base + "kit_metro/kit_atlas.png"), load("emit", base + "kit_metro/kit_emit.png")]);
    const actorImg = (set) => { if (!img["a_" + set] && !img["l_" + set]) { img["l_" + set] = 1; load("a_" + set, base + window.ACTORS[set].img); } return img["a_" + set]; };
    I.ready = ready; I.active = false; I.host = host;
    const S = (I.s = { area: null, A: null, cam: { x: 0, y: 0, zoom: opt.zoom || 1 }, actors: [], npcs: [], player: null, toast: [], menu: null, fade: 0, fadeTo: null,
      secured: false, bag: null, exitLetter: "A", t: 0, trains: {}, override: null, lastPortal: null, overlay: null, flicker: 0, spawnT: 0, named: new Set(), hold: {} });
    const keys = Object.create(null), touch = { on: !!opt.touch, joy: null, vec: [0, 0], btn: null };

    // ---------------------------------------------------------------- stations / fares / schedule
    const stations = R.stations, stById = Object.fromEntries(stations.map((s) => [s.id, s]));
    const fareKm = (km) => { for (const [lim, y] of R.fare.bands) if (km <= lim) return y; return R.fare.bands[R.fare.bands.length - 1][1]; };
    I.fare = (a, b) => fareKm(Math.abs(stById[a].km - stById[b].km));
    I.rideMin = (a, b) => Math.abs(stById[a].min - stById[b].min);
    const minOfDay = () => ((host.now() % 1440) + 1440) % 1440;
    const isPeak = (m) => host.isWorkday() && R.peak.some(([a, b]) => m >= a && m < b);
    const headway = (m) => (m >= R.late_after ? R.headway_min.late : isPeak(m) ? R.headway_min.peak : R.headway_min.normal);
    const open = (m) => m >= R.hours.open && m < R.hours.close;
    /** next arrival (abs min) at station sid in direction dir ("east"|"west") at or after abs t (null after the last train) */
    function nextArrival(sid, dir, t) {
      const st = stById[sid], last = stations[stations.length - 1].min, off = dir === "east" ? st.min : last - st.min + (R.west_offset_min ?? 1.5);   // west trains phase-shifted so both tracks rarely dwell together
      const day = Math.floor(t / 1440) * 1440;
      for (let d = 0; d < 2; d++) {
        const D = day + d * 1440, first = D + R.hours.first_train + off, lastT = D + R.hours.last_train;
        if (t > lastT) continue;
        if (t <= first) return first;
        const h = headway(t - D), k = Math.ceil((t - first) / h - 1e-9); const a = first + k * h;
        if (a <= lastT) return a;
      }
      return null;
    }
    I.nextArrival = nextArrival;
    const dirLabel = (dir) => "往 " + stById[dir === "east" ? R.line.east_terminal : R.line.west_terminal].name;
    function crowdN(kind) {
      const m = minOfDay(), h = Math.floor(m / 60), C = R.crowd;
      let n = C.base * (C.by_hour[h] || 0) * (host.isWorkday() ? 1 : C.weekend_mul);
      if (!open(m)) n = 0;
      if (kind === "street") n *= 0.55; if (kind === "platform") n *= 1.1;
      return Math.min(C.max, Math.round(n * (S.crowdMul ?? 1)));
    }
    I.crowdN = crowdN;

    // ---------------------------------------------------------------- area build
    const P = (t) => MAN.pieces[t];
    const fkey = (o, part) => `${o.type}/base/${part}/${o.state}/${o.rot || 0}`;
    function boxOf(o, part, dx) {
      const g = ((P(o.type).geo || {})[o.state] || {})[part]; if (!g) return null;
      const xs = [], ys = [];
      for (const [x, y] of [[g[0], g[1]], [g[3], g[1]], [g[0], g[4]], [g[3], g[4]]]) { const p = rotPt(x, y, o.rot); xs.push(p[0]); ys.push(p[1]); }
      const X = o.x + (dx || 0);
      return [X + Math.min(...xs), o.y + Math.min(...ys), g[2], X + Math.max(...xs), o.y + Math.max(...ys), g[5]];
    }
    function drawFrame(c, key, X, Y, alpha, emit) {
      const f = MAN.frames[key]; if (!f) return null;
      if (alpha != null && alpha < 0.999) c.globalAlpha = alpha;
      c.drawImage(img.atlas, f[0], f[1], f[2], f[3], Math.round(X) - f[4], Math.round(Y) - f[5], f[2], f[3]);
      if (emit && EMIT.has(key) && img.emit) { c.globalCompositeOperation = "lighter"; c.globalAlpha = (alpha == null ? 1 : alpha) * emit; c.drawImage(img.emit, f[0], f[1], f[2], f[3], Math.round(X) - f[4], Math.round(Y) - f[5], f[2], f[3]); c.globalCompositeOperation = "source-over"; }
      c.globalAlpha = 1;
      return f;
    }
    function frameRect(key, X, Y) { const f = MAN.frames[key]; if (!f) return null; const x0 = Math.round(X) - f[4], y0 = Math.round(Y) - f[5]; return [x0, y0, x0 + f[2], y0 + f[3]]; }

    function buildArea(id) {
      const A = DATA.areas[id]; if (!A) throw new Error("metro: no area " + id);
      const W = { A, id, objs: [], byId: {}, statics: [], cols: [], gates: A.gates || [], psd: A.psd || [], signs: {} };
      for (const o0 of A.objects) { const o = Object.assign({ rot: 0, state: "default" }, o0); W.objs.push(o); W.byId[o.id] = o; }
      W.cols = A.colliders.map((c) => c.rect);
      for (const sg of A.signs || []) (W.signs[sg.obj + "/" + (sg.part || "main")] = W.signs[sg.obj + "/" + (sg.part || "main")] || []).push(sg);
      // sorted drawables (static objects, all parts)
      for (const o of W.objs) {
        const pc = P(o.type); if (!pc || pc.layer !== "sorted") continue;
        for (const part of pc.parts || ["main"]) {
          const d = { o, part, fade: 1, kind: "obj", fadeable: pc.fadeable !== false || o.type === "mt_psd" || o.type === "mt_psd_fix" };
          W.statics.push(d);
        }
      }
      // free-standing signs (station name on the far wall)
      for (const sg of A.signs || []) if (sg.obj.startsWith("_")) {
        const u = sg.axis === "x" ? [1, 0] : [0, -1];
        W.statics.push({ kind: "sign", sg, box: [Math.min(sg.at[0], sg.at[0] + u[0] * sg.w), Math.min(sg.at[1], sg.at[1] + u[1] * sg.w), sg.at[2], Math.max(sg.at[0], sg.at[0] + u[0] * sg.w), Math.max(sg.at[1], sg.at[1] + u[1] * sg.w) + 0.05, sg.at[2] + sg.h], fade: 1 });
      }
      // ground cache: chunks + track rails + low pieces + shadows
      const G = A.ground, ox = G.origin[0], oy = G.origin[1], rows = G.rows_south_to_north;
      const chunks = [];
      rows.forEach((row, j) => [...row].forEach((ch, i) => { const L = G.legend[ch]; if (L) chunks.push([ox + i * 2, oy + j * 2, L.split(":")[1]]); }));
      let X0 = 1e9, Y0 = 1e9, X1 = -1e9, Y1 = -1e9;
      const grow = (r) => { if (!r) return; X0 = Math.min(X0, r[0]); Y0 = Math.min(Y0, r[1]); X1 = Math.max(X1, r[2]); Y1 = Math.max(Y1, r[3]); };
      for (const [x, y, s] of chunks) grow(frameRect(`mg_floor/base/main/${s}/0`, sx(x, y), sy(x, y, 0)));
      const lows = W.objs.filter((o) => P(o.type) && P(o.type).layer === "low");
      for (const o of lows) grow(frameRect(fkey(o, "main"), sx(o.x, o.y), sy(o.x, o.y, 0)));
      for (const d of W.statics) if (d.o) grow(frameRect(fkey(d.o, d.part) + "#shadow", sx(d.o.x, d.o.y), sy(d.o.x, d.o.y, 0)));
      const gc = document.createElement("canvas"); gc.width = Math.ceil(X1 - X0) + 4; gc.height = Math.ceil(Y1 - Y0) + 4;
      const g = gc.getContext("2d"); g.translate(-X0 + 2, -Y0 + 2); g.imageSmoothingEnabled = false;
      for (const [x, y, s] of chunks) drawFrame(g, `mg_floor/base/main/${s}/0`, sx(x, y), sy(x, y, 0));
      for (const T of A.tracks || []) drawRails(g, T, A);
      for (const o of lows) drawFrame(g, fkey(o, "main"), sx(o.x, o.y), sy(o.x, o.y, 0), 1, 0.5);
      const sc = document.createElement("canvas"); sc.width = gc.width; sc.height = gc.height; const sg = sc.getContext("2d"); sg.translate(-X0 + 2, -Y0 + 2);
      for (const d of W.statics) if (d.o && !/^mt_(psd|gate)/.test(d.o.type)) drawFrame(sg, fkey(d.o, d.part) + "#shadow", sx(d.o.x, d.o.y), sy(d.o.x, d.o.y, 0));
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = A.kind === "street" ? 0.34 : 0.26; g.drawImage(sc, 0, 0); g.globalAlpha = 1;
      W.ground = { c: gc, x: X0 - 2, y: Y0 - 2 };
      W.lowSigns = lows;
      return W;
    }
    function drawRails(g, T, A) {
      const x0 = A.bounds[0] - 4, x1 = A.bounds[2] + 4;
      const quad = (pts, fill) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(sx(x, y), sy(x, y, 0)) : g.moveTo(sx(x, y), sy(x, y, 0)))); g.closePath(); g.fillStyle = fill; g.fill(); };
      const [ra, rb] = T.rails;
      for (let x = Math.floor(x0); x < x1; x += 0.6) quad([[x, ra - 0.35], [x + 0.24, ra - 0.35], [x + 0.24, rb + 0.35], [x, rb + 0.35]], "#3a3a40");
      for (const r of [ra, rb]) { quad([[x0, r - 0.04], [x1, r - 0.04], [x1, r + 0.04], [x0, r + 0.04]], "#9aa0a4"); quad([[x0, r - 0.015], [x1, r - 0.015], [x1, r + 0.0], [x0, r]], "#d8dde0"); }
    }

    // ---------------------------------------------------------------- actors
    function Actor(o) { Object.assign(this, { x: 0, y: 0, dir: "SW", set: "office", speed: 1.3, r: 0.22, phase: 0, t: 0, moving: false, alpha: 1 }, o); }
    Actor.prototype.atlas = function () { const w = (host.season && host.season() === "winter") && window.ACTORS[this.set + "_w"] ? this.set + "_w" : this.set; return w; };
    Actor.prototype.frame = function () {
      const set = this.atlas(), D = window.ACTORS[set]; if (!D) return null;
      const clip = this.moving ? "walk" : "idle", n = (D.clips && D.clips[clip]) || (this.moving ? 12 : 4);
      const i = this.moving ? Math.floor(this.phase * n) % n : Math.floor(this.t * 2.6) % n;
      return [set, D.frames[`${clip}_${this.dir}_${i}`] || D.frames[`idle_${this.dir}_0`] || D.frames[`idle_S_0`]];
    };
    Actor.prototype.step = function (dt, vx, vy) {
      const L = Math.hypot(vx, vy);
      if (L > 1e-4) { this.dir = dirFromWorld(vx, vy); this.moving = true; const D = window.ACTORS[this.atlas()]; this.phase = (this.phase + L * dt / ((D && D.stride_m) || 1.15)) % 1; }
      else { this.moving = false; this.t += dt; }
    };
    function blockedAt(a, x, y, ignoreActors) {
      const B = S.W.A.bounds, r = a.r;
      if (x - r < B[0] || x + r > B[2] || y - r < B[1] || y + r > B[3]) return true;
      for (const c of S.W.cols) if (rectDist(x, y, c) < r) return true;
      if (a === S.player) for (const g of S.W.gates) if (!g.open && rectDist(x, y, g.flap) < r) return true;
      if (!ignoreActors) for (const b of S.actors) if (b !== a && !b.ghost && Math.hypot(b.x - x, b.y - y) < r + b.r - 0.02) {
        const cur = Math.hypot(b.x - a.x, b.y - a.y), nxt = Math.hypot(b.x - x, b.y - y); if (nxt < cur) return true;   // allow separating moves
      }
      return false;
    }

    // ---------------------------------------------------------------- entering / leaving areas
    I.enter = function (where, o) {
      o = o || {};
      let id = where;
      if (stById[where]) { id = stById[where].area; if (where === "cbd" && o.exit) S.exitLetter = o.exit; }
      return ready.then(() => { I.active = true; S.running || startLoop(); goArea(id, o.spawn); if (o.exit) S.exitLetter = o.exit; });
    };
    function goArea(id, spawn) {
      const prevKind = S.W && S.W.A.kind;
      S.W = buildArea(id); const A = S.W.A;
      if (A.kind === "street") { S.secured = false; S.bag = null; }
      if (!S.player) S.player = new Actor({ id: "limo", set: "li_mo", speed: 1.75, r: 0.22, isPlayer: true });
      const p = S.player;
      let sp = spawn;
      if (sp === "exit" || (!sp && A.kind === "concourse" && A.exit_spawns && prevKind === "street")) sp = A.exit_spawns ? A.exit_spawns[S.exitLetter] : null;
      sp = sp || A.spawn; p.x = sp[0]; p.y = sp[1]; p.dir = sp[2] || "S"; p.moving = false;
      S.actors = [p]; S.npcs = []; S.staff = [];
      for (const s of A.staff || []) { const a = new Actor({ set: s.set || s.sprite, x: s.at[0], y: s.at[1], dir: s.dir, staff: true, name: s.name, id: s.id, r: 0.22 }); S.actors.push(a); S.staff.push(a); }
      S.trains = {}; S.portalArmed = false; S.camReady = false; S.spawnT = 0; S.lockT = 0.5;
      for (const g of S.W.gates) { g.open = 0; g.npcOpen = 0; }
      prefill();
      log(`李默 → ${A.name}`);
    }
    function leave(target, info) {
      I.active = false;
      if (opt.onExit) opt.onExit(target, Object.assign({ station: S.W && S.W.A.station }, info || {}));
    }
    I.leave = leave;

    // ---------------------------------------------------------------- NPCs
    const CROWD_SETS = ["office", "office", "student", "uncle", "vendor", "student", "office"];
    function routePts(name, extra) {
      const A = S.W.A, R0 = (A.routes || {})[name]; if (!R0) return null;
      const out = []; const ap = A.gate_approach || 1.15; let gate = null;
      const letter = extra && extra.letter || pick(["A", "B", "C", "D"]);
      for (const leg of R0) {
        if (leg === "gate_in" || leg === "gate_out") {
          gate = pick(S.W.gates); const cx = (gate.x0 + gate.x1) / 2 + (rnd() - 0.5) * 0.08;
          const a = [cx, gate.y - ap], b = [cx, gate.y + ap];
          if (leg === "gate_in") out.push(a, Object.assign([cx, gate.y], { gate }), b); else out.push(b, Object.assign([cx, gate.y], { gate }), a);
        } else if (leg === "exit_join") out.push(...A.exit_joins[letter].map((p) => p.slice()));
        else if (leg === "exit_any") out.push(...A.exit_routes[letter].map((p) => p.slice()));
        else if (leg === "exit_spawn") {}
        else out.push(leg.slice());
      }
      return out;
    }
    function spawnNpc(pts, o) {
      if (!pts || !pts.length) return null;
      const p0 = pts[0];
      if (S.actors.some((b) => Math.hypot(b.x - p0[0], b.y - p0[1]) < 0.6)) return null;
      const a = new Actor(Object.assign({ set: pick(CROWD_SETS), x: p0[0], y: p0[1], pts, i: 1, speed: 1.05 + rnd() * 0.45, npc: true, wait: 0, stuck: 0 }, o || {}));
      S.actors.push(a); S.npcs.push(a); return a;
    }
    function prefill() {
      const A = S.W.A, n = crowdN(A.kind);
      if (A.kind === "platform") {
        const spots = (A.waits || []).slice().sort(() => rnd() - 0.5).slice(0, n);
        for (const w of spots) { const a = spawnNpc([[w[0], w[1]]], { waitSpot: w, dir: w[2] === "N" ? "N" : "S" }); if (a) { a.pts = null; a.dir = w[2] === "N" ? pick(["N", "NE", "NW"]) : pick(["S", "SE", "SW"]); } }
      } else {
        const names = Object.keys(A.routes || {});
        for (let k = 0; k < Math.round(n * 0.6); k++) {
          const pts = routePts(pick(names)); if (!pts) continue;
          const j = 1 + Math.floor(rnd() * (pts.length - 2)); const p = pts[j - 1], q = pts[j];
          if (!Array.isArray(q) || typeof q[0] !== "number") continue;
          const t = rnd(), a = spawnNpc([[p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]].concat(pts.slice(j)));
          if (a && blockedAt(a, a.x, a.y, false)) { S.actors.splice(S.actors.indexOf(a), 1); S.npcs.splice(S.npcs.indexOf(a), 1); }
        }
      }
    }
    function spawnTick(dt) {
      const A = S.W.A, n = crowdN(A.kind); S.spawnT -= dt;
      const live = S.npcs.length;
      if (S.spawnT > 0) return;
      S.spawnT = 0.6 + rnd() * 1.2 * (n > 12 ? 0.6 : 1.4);
      if (A.kind === "platform") {
        // inflow from the stairs to a free waiting spot
        const free = (A.waits || []).filter((w) => !S.npcs.some((a) => a.waitSpot === w));
        if (live < n && free.length) {
          const w = pick(free), lane = w[1] > 6 ? 8.0 : 4.0;
          spawnNpc([[9.4, 6.0], [9.2, lane], [w[0], lane], [w[0], w[1], "spot"]], { waitSpot: w });
        }
        return;
      }
      if (live >= n) return;
      const names = Object.keys(A.routes || {}); let name = pick(names);
      if (A.kind === "concourse" && A.station === "cbd" && rnd() < 0.5) name = "out";
      spawnNpc(routePts(name));
      namedTick();
    }
    function namedTick() {
      const A = S.W.A, m = minOfDay(), day = Math.floor(host.now() / 1440);
      for (const c of R.commuters) {
        if (c.days === "workday" && !host.isWorkday()) continue;
        const ride = I.rideMin(c.home, c.work) + 6;
        const plans = [[c.home, c.leave, "in"], [c.work, c.leave + ride, "out"], [c.work, c.back, "in"], [c.home, c.back + ride, "out"]];
        for (const [sid, t, kind] of plans) {
          if (sid !== A.station || m < t - 4 || m > t + 12) continue;
          const key = day + c.id + A.id + t; if (S.named.has(key)) continue;
          let pts = null;
          if (A.kind === "concourse") pts = routePts(kind === "in" ? (A.routes.in ? "in" : null) : "out");
          else if (A.kind === "street") pts = routePts(kind === "in" ? "enter" : "leave");
          if (!pts) continue;
          const a = spawnNpc(pts, { set: c.sprite, name: c.name, named: true, speed: 1.35 });
          if (a) { S.named.add(key); log(`${c.name}${kind === "in" ? "进站了" : "出站了"}（${hhmm(host.now())}）`); }
        }
      }
    }
    function npcTick(a, dt) {
      if (a.staff) { a.step(dt, 0, 0); return; }
      if (a.wait > 0) { a.wait -= dt; a.step(dt, 0, 0); return; }
      if (!a.pts || a.i >= a.pts.length) {
        if (a.waitSpot && !a.pts) { a.step(dt, 0, 0); return; }
        a.dead = true; return;
      }
      const q = a.pts[a.i], dx = q[0] - a.x, dy = q[1] - a.y, L = Math.hypot(dx, dy);
      if (q.gate) { q.gate.npcOpen = 1.2; }
      const near = q.gate ? 0.12 : 0.18;
      if (L < near) {
        const tag = q[2]; a.i++;
        if (tag === "arch") { a.wait = 0.5; const ar = S.W.byId.arch; if (ar) { ar.state = "ok"; S.archT = 0.6; } }
        if (tag === "wait4") a.wait = 3 + rnd() * 2;
        if (tag === "end" || tag === "board") a.dead = true;
        if (tag === "spot") { a.pts = null; a.dir = a.waitSpot[2] === "N" ? pick(["N", "NE", "NW"]) : pick(["S", "SE", "SW"]); }
        return;
      }
      const sp = Math.min(a.speed * dt, L), vx = dx / L * sp, vy = dy / L * sp;
      if (!blockedAt(a, a.x + vx, a.y + vy, false)) { a.x += vx; a.y += vy; a.step(dt, vx / dt, vy / dt); a.stuck = 0; return; }
      a.stuck += dt; a.step(dt, 0, 0); a.dir = dirFromWorld(dx, dy);
      if (a.stuck > 1.2) {                                     // sidestep, then squeeze (crowded queue)
        const px = -dy / L, py = dx / L, s = (a.side = a.side || (rnd() < 0.5 ? 1 : -1)) * Math.min(a.speed * dt, 0.03);
        if (!blockedAt(a, a.x + px * s, a.y + py * s, true) && !S.actors.some((b) => b !== a && Math.hypot(b.x - a.x - px * s, b.y - a.y - py * s) < b.r + a.r - 0.1)) { a.x += px * s; a.y += py * s; }
      }
      if (a.stuck > 9 && !onScreen(a)) a.dead = true;
    }
    function onScreen(a) { const X = (sx(a.x, a.y) - S.cam.x) * S.cam.zoom + canvas.width / 2, Y = (sy(a.x, a.y, 0) - S.cam.y) * S.cam.zoom + canvas.height / 2; return X > -40 && X < canvas.width + 40 && Y > -100 && Y < canvas.height + 40; }

    // ---------------------------------------------------------------- trains (per track of the current platform area)
    const TRAIN_L = 42;
    function holdOf(T, ta) { const h = S.hold[T.id]; return h && h.ta === ta ? h.extra : 0; }
    function trainState(T) {
      const A = S.W.A, now = host.now(), D = R.dwell_min, AP = R.approach_min, DP = R.depart_min || 0.45;
      let ta = null; const ov = S.override;
      if (ov && ov.area === A.id && ov.track === T.id && now < ov.t + D + DP + holdOf(T, ov.t)) ta = ov.t;
      else ta = nextArrival(A.station, T.dir, now - D - DP - (S.hold[T.id] ? S.hold[T.id].extra : 0));
      if (ta == null) return { phase: "none", ta: null };
      const hd = holdOf(T, ta), rel = now - ta, sg = T.dir === "east" ? 1 : -1;
      if (rel < -AP) return { phase: "none", ta };
      if (rel < 0) { const k = 1 + rel / AP; return { phase: "approach", ta, off: -sg * TRAIN_L * (1 - k) * (1 - k) }; }
      if (rel < D + hd) return { phase: "dwell", ta, off: 0, doors: rel > 0.06 && rel < D + hd - 0.1, rel, hd };
      if (rel < D + hd + DP) { const k = (rel - D - hd) / DP; return { phase: "depart", ta, off: sg * TRAIN_L * k * k }; }
      return { phase: "none", ta: nextArrival(A.station, T.dir, ta + 0.01) };
    }
    function trainTick(dtGame) {
      const A = S.W.A; if (!A.tracks) return;
      for (const T of A.tracks) {
        const st = trainState(T), prev = S.trains[T.id]; S.trains[T.id] = st;
        // keep the doors open while 李默 stands in a doorway or is choosing a destination
        if (st.phase === "dwell" && st.rel > R.dwell_min + st.hd - 0.16 && (nearDoor(T, 0.6) || (S.menu && S.menu.track === T.id))) {
          const h = S.hold[T.id] && S.hold[T.id].ta === st.ta ? S.hold[T.id] : (S.hold[T.id] = { ta: st.ta, extra: 0 }); h.extra += dtGame;
        }
        const open = !!st.doors;
        for (const p of S.W.psd) if (p.track === T.id) { const o = S.W.byId[p.obj]; o.state = T.skin + (open ? "_open" : "_closed"); }
        if (prev && prev.phase === "none" && st.phase === "approach" && Math.abs(S.player.y - (T.id === "N" ? 8.5 : 3.5)) < 6) toast(`列车即将进站（${dirLabel(T.dir)}），请站在黄线后排队候车`, 2.2);
        if (prev && !prev.doors && open) { boardAlight(T); }
        if (prev && prev.doors && !open) toast("车门即将关闭，请勿上下车", 1.6);
      }
    }
    function doorPts(T) { return S.W.psd.filter((p) => p.track === T.id).map((p) => [(p.x0 + p.x1) / 2, T.door_y]); }
    function nearDoor(T, r) { const p = S.player; return doorPts(T).some((q) => Math.hypot(q[0] - p.x, q[1] - p.y) < r); }
    function boardAlight(T) {
      const pts = doorPts(T), n = Math.round(crowdN("platform") * 0.5 + 2);
      // waiting passengers on this side walk to the nearest door and board
      for (const a of S.npcs) if (a.waitSpot && !a.pts && (a.waitSpot[1] > 6) === (T.id === "N")) {
        const d = pts.reduce((b, q) => (Math.hypot(q[0] - a.x, q[1] - a.y) < Math.hypot(b[0] - a.x, b[1] - a.y) ? q : b));
        a.pts = [[d[0] + (rnd() - 0.5) * 0.3, d[1]], [d[0], T.id === "N" ? 9.3 : 2.7, "board"]]; a.i = 0; a.ghostNear = true; a.wait = 0.4 + rnd() * 1.5;
      }
      // alighting passengers come out and head for the stairs
      for (let k = 0; k < n; k++) {
        const d = pick(pts), lane = T.id === "N" ? 8.0 : 4.0;
        const a = spawnNpc([[d[0] + (rnd() - 0.5) * 0.4, T.id === "N" ? 8.75 : 3.25], [d[0], lane], [9.3, lane], [9.6, 6.0, "end"]], { wait: k * 0.35 });
        if (a) a.i = 1;
      }
    }
    function trainDrawables(out) {
      const A = S.W.A; if (!A.tracks) return;
      for (const T of A.tracks) {
        const st = S.trains[T.id]; if (!st || st.phase === "none") continue;
        const objs = T.cars.map((x) => ({ type: "mt_train", x, y: T.y, rot: T.rot, state: st.doors ? "open" : "closed" }));
        objs.push({ type: "mt_train_cab", x: T.cab_e[0], y: T.cab_e[1], rot: T.cab_e[2], state: "default" }, { type: "mt_train_cab", x: T.cab_w[0], y: T.cab_w[1], rot: T.cab_w[2], state: "default" });
        for (const o of objs) {
          const box = boxOf(o, "main", st.off); if (!box || box[3] < A.bounds[0] - 3 || box[0] > A.bounds[2] + 3) continue;
          const X = sx(o.x + st.off, o.y), Y = sy(o.x + st.off, o.y, 0), key = fkey(o, "main");
          out.push({ box, rect: frameRect(key, X, Y), fadeable: true, kind: "train", draw: (al) => drawFrame(ctx, key, X, Y, al, 0.6) });
        }
      }
    }

    // ---------------------------------------------------------------- interactions
    const isTouch = () => touch.on;
    function candidates() {
      const p = S.player, out = [], A = S.W.A;
      for (const o of S.W.objs) if (o.interact) { const q = o.reach || [o.x, o.y], d = Math.hypot(q[0] - p.x, q[1] - p.y); if (d < 0.95) out.push({ d, label: o.label, kind: o.interact, o }); }
      for (const g of S.W.gates) {
        if (p.x > g.x0 - 0.12 && p.x < g.x1 + 0.12 && Math.abs(p.y - g.y) < 1.3) {
          const inSide = p.y < g.y; out.push({ d: Math.abs(p.y - g.y) * 0.5, label: inSide ? "进站：扫码 / 刷单程票 / 刷交通卡" : "出站（刷卡/扫码/投票）", kind: "gate", g, inSide });
        }
      }
      for (const T of A.tracks || []) { const st = S.trains[T.id]; if (st && st.doors) for (const q of doorPts(T)) { const d = Math.hypot(q[0] - p.x, q[1] - p.y); if (d < 0.95) out.push({ d, label: `上车 · ${dirLabel(T.dir)}`, kind: "board", T }); } }
      if (A.kind === "platform" && !out.length) out.push({ d: 9, label: "等下一班车（快进）", kind: "wait" });
      out.sort((a, b) => a.d - b.d); return out[0] || null;
    }
    function interact() {
      if (S.overlay) { S.overlay = S.overlay.close ? (S.overlay.close(), null) : null; return; }
      if (S.menu || S.fadeTo || S.ride) return;
      const c = candidates(); if (!c) return;
      ({ xray: doXray, tvm: doTvm, counter: doCounter, map: () => (S.overlay = { kind: "linemap" }), gate: doGate, board: doBoard, wait: doWait })[c.kind](c);
    }
    I.interact = interact;
    function doXray(c) {
      if (S.secured) return toast("已经过完安检了");
      if (S.bag) return toast(S.bag.done ? "包已经过完机了，从安检门走过去取包" : "包正在过机……");
      S.bag = { t: 0, dur: 2.2, done: false, o: c.o }; c.o.state = "scan"; toast("把双肩包放上传送带……（安检机运转中）", 2);
    }
    function payMenu(title, amount, onPaid) {
      S.menu = { title: `${title} · ¥${amount}`, sub: `选择支付方式（零钱 ¥${host.money().toFixed(0)}）`, items: R.pay_methods_tvm.map((m) => ({ label: m === "现金" ? "现金（投币/纸币）" : m + "扫码支付", act: () => {
        if (!host.spend(amount, title, m)) { toast(`${m}：余额不足`); return; }
        S.menu = null; onPaid(m);
      } })).concat([{ label: "取消", act: () => (S.menu = null) }]) };
    }
    function doTvm() {
      const here = S.W.A.station;
      S.menu = { title: `自助售票机 · ${stById[here].name}站`, sub: "单程票：选择目的地（按里程计价）", items: stations.filter((s) => s.id !== here).map((s) => ({ label: `${s.name}`, right: `¥${I.fare(here, s.id)}`, act: () => {
        const f = I.fare(here, s.id);
        payMenu(`单程票 ${stById[here].name}→${s.name}`, f, (m) => { MS.tokens.push({ from: here, to: s.id, fare: f }); toast(`🪙 出票：单程票 ${stById[here].name}→${s.name} ¥${f}（${m}）`, 3); log(`地铁单程票 ¥${f}（${m}）`); });
      } })).concat([{ label: "取消", act: () => (S.menu = null) }]) };
    }
    function doCounter() {
      const items = R.card.topups.map((a) => ({ label: `交通卡充值 ¥${a}`, act: () => payMenu("交通卡充值", a, (m) => { MS.card += a; toast(`充值成功 · 交通卡余额 ¥${MS.card}（${m}）`, 3); log(`交通卡充值 ¥${a}（${m}）`); }) }));
      items.push({ label: "查询交通卡余额", act: () => { S.menu = null; toast(`客服：您的交通卡余额 ¥${MS.card}`); } });
      items.push({ label: "问询：首末班车", act: () => { S.menu = null; const s = stById[S.W.A.station]; toast(`客服：${R.line.name}运营 ${R.hours.label}，本站末班车约 ${hhmm(R.hours.last_train - (stations[stations.length - 1].min - s.min))}（往槐北新村）`, 3.5); } });
      items.push({ label: "离开", act: () => (S.menu = null) });
      S.menu = { title: "客服中心", sub: `交通卡余额 ¥${MS.card} · 零钱 ¥${host.money().toFixed(0)}`, items };
    }
    function openGate(g, t) { g.open = t || 3.2; const o = S.W.byId[g.obj]; o.state = S.W.A.skin + "_open"; }
    function doGate(c) {
      const g = c.g, here = S.W.A.station;
      if (c.inSide) {
        if (MS.entry && MS.entry.station && !MS.entry.done) { toast("已经刷过进站了"); openGate(g); return; }
        if (!S.secured) { toast("站务员：请先到安检口过安检"); return; }
        if (!open(minOfDay())) { toast(`已停止运营（${R.hours.label}）`); return; }
        const tok = MS.tokens.find((t) => t.from === here) || MS.tokens[0];
        S.menu = { title: "进站 · 选择乘车方式", sub: `交通卡余额 ¥${MS.card} · 单程票 ×${MS.tokens.length} · 零钱 ¥${host.money().toFixed(0)}`, items: [
          { label: "📱 扫码乘车（乘车码）", right: "出站按里程扣费", act: () => { if (host.money() < R.qr.min_money) return toast("乘车码：账户余额不足"); S.menu = null; MS.entry = { station: here, method: "qr", t: host.now() }; toast("嘀——乘车码验证通过", 2); openGate(g); } },
          { label: "🪙 刷单程票", right: tok ? `${stById[tok.from].name}→${stById[tok.to].name} ¥${tok.fare}` : "没有单程票", disabled: !tok, act: () => { S.menu = null; MS.tokens.splice(MS.tokens.indexOf(tok), 1); MS.entry = { station: here, method: "token", token: tok, t: host.now() }; toast("嘀——单程票有效，请通过", 2); openGate(g); } },
          { label: "💳 刷交通卡", right: `余额 ¥${MS.card}`, disabled: MS.card < R.card.min_to_enter, act: () => { S.menu = null; MS.entry = { station: here, method: "card", t: host.now() }; toast(`嘀——交通卡 余额 ¥${MS.card}`, 2); openGate(g); } },
          { label: "取消", act: () => (S.menu = null) }] };
      } else {
        const E = MS.entry;
        if (!E) toast("（无进站记录）站务员帮你开了闸，下次记得刷卡");
        else if (!E.rode) { toast(E.method === "token" ? "同站进出 · 单程票退回" : "同站进出 · 不扣费", 2.4); if (E.method === "token") MS.tokens.push(E.token); }
        else toast(E.method === "token" ? `单程票已回收 · 出站（${stById[E.station].name}→${stById[E.to].name}）` : `出站 · 本次 ¥${E.fare}（${E.method === "qr" ? "乘车码" : "交通卡 余额 ¥" + MS.card}）`, 2.8);
        MS.entry = null; openGate(g);
      }
    }
    function doBoard(c) {
      const T = c.T, here = S.W.A.station, idx = stations.findIndex((s) => s.id === here);
      if (!MS.entry) { toast("（你没有刷卡进站……先当作已扫码）"); MS.entry = { station: here, method: "qr", t: host.now() }; }
      const ahead = T.dir === "east" ? stations.slice(idx + 1) : stations.slice(0, idx).reverse();
      S.menu = { track: T.id, title: `3号线 · ${dirLabel(T.dir)} · 在哪站下车？`, sub: "车程 / 票价（按里程，出站扣费）", items: ahead.map((s) => ({ label: s.name + (s.area ? "" : "（原型未开放）"), right: `${I.rideMin(here, s.id)}分钟 · ¥${I.fare(here, s.id)}`, disabled: !s.area, act: () => ride(s.id, T) }))
        .concat([{ label: "不坐了", act: () => (S.menu = null) }]) };
    }
    function doWait() {
      const A = S.W.A; let best = null;
      if (A.tracks.some((T) => S.trains[T.id] && S.trains[T.id].phase !== "none")) return toast("列车正在进站 / 停靠中");
      for (const T of A.tracks) { const st = S.trains[T.id]; const ta = st ? st.ta : null; if (ta != null && (best == null || ta < best)) best = ta; }
      if (best == null) return toast("今日运营已结束");
      const skip = best - R.approach_min - 0.05 - host.now(); if (skip > 0) { host.advance(skip); toast(`等了 ${Math.max(1, Math.round(skip))} 分钟……`, 1.6); }
    }
    function platformOf(sid) { return Object.values(DATA.areas).find((a) => a.kind === "platform" && a.station === sid).id; }
    function ride(dest, T) {
      const here = S.W.A.station, E = MS.entry, fare = I.fare(here, dest), mins = I.rideMin(here, dest);
      S.menu = null; S.ride = { t: 0, dur: 3.2, from: here, to: dest, dir: T.dir, mins };
      fadeTo(() => {}, 0.35);
      S.ride.finish = () => {
        host.advance(mins);
        let msg;
        if (E.method === "qr") { if (!host.spend(fare, `地铁 ${stById[here].name}→${stById[dest].name}`, "乘车码")) { MS.debt = (MS.debt || 0) + fare; msg = `乘车码欠费 ¥${fare}`; } else msg = `乘车码扣费 ¥${fare}`; }
        else if (E.method === "card") { if (MS.card >= fare) { MS.card -= fare; msg = `交通卡扣费 ¥${fare} · 余额 ¥${MS.card}`; } else { const sh = fare - MS.card; MS.card = 0; host.spend(sh, "地铁补票"); msg = `交通卡余额不足，补票 ¥${sh}`; } }
        else { const d = fare - E.token.fare; if (d > 0) { host.spend(d, "地铁补票"); msg = `单程票超程，补票 ¥${d}`; } else msg = `单程票 ¥${E.token.fare}`; }
        E.rode = true; E.to = dest; E.fare = fare; log(`地铁 ${stById[here].name}→${stById[dest].name} ${mins}分钟 · ${msg}`);
        goArea(platformOf(dest), [15.0, T.id === "N" ? 8.2 : 3.8, T.id === "N" ? "S" : "N"]);
        S.override = { area: S.W.A.id, track: T.id, t: host.now() - 0.12 }; S.hold = {};
        trainTick(0);
        toast(`到达 ${stById[dest].name}站 · ${msg}`, 3.5);
      };
    }
    I.ride = ride;
    function fadeTo(fn, dur) { S.fadeTo = { fn, t: 0, dur: dur || 0.3, done: false }; }

    // ---------------------------------------------------------------- update
    let lastPortal = null;
    function update(dt) {
      S.t += dt; const p = S.player, A = S.W.A;
      // clock
      const dGame = S.menu || S.overlay || S.ride ? 0 : dt * R.clock_scale; if (dGame) host.advance(dGame);
      if (S.ride) { S.ride.t += dt; if (S.ride.t >= S.ride.dur) { const f = S.ride.finish; S.ride = null; f(); } }
      if (S.fadeTo) { const F = S.fadeTo; F.t += dt; if (!F.done && F.t >= F.dur) { F.done = true; F.fn(); } if (F.t >= F.dur * 2) S.fadeTo = null; }
      // player input
      let dx = 0, dy = 0;
      if (keys.a || keys.arrowleft) dx -= 1; if (keys.d || keys.arrowright) dx += 1; if (keys.w || keys.arrowup) dy -= 1; if (keys.s || keys.arrowdown) dy += 1;
      if (touch.joy) { dx = touch.vec[0]; dy = touch.vec[1]; }
      if (S.auto) { dx = S.auto[0]; dy = S.auto[1]; }
      if (S.lockT > 0) { S.lockT -= dt; dx = dy = 0; }
      const busy = S.menu || S.overlay || S.ride || (S.fadeTo && !S.fadeTo.done);
      let vx = 0, vy = 0;
      if (!busy && (dx || dy)) { const m = Math.min(1, Math.hypot(dx, dy)), w = scr2world(dx, dy); vx = w[0] * p.speed * m; vy = w[1] * p.speed * m; }
      const ox = p.x, oy = p.y;
      if (vx || vy) {
        const nx = p.x + vx * dt, ny = p.y + vy * dt;
        if (!blockedAt(p, nx, ny)) { p.x = nx; p.y = ny; } else if (!blockedAt(p, nx, p.y)) p.x = nx; else if (!blockedAt(p, p.x, ny)) p.y = ny;
      }
      p.step(dt, (p.x - ox) / dt, (p.y - oy) / dt); if (vx || vy) p.dir = dirFromWorld(vx, vy);
      // zones: security arch / exit lane
      for (const z of A.zones || []) {
        const inNow = inRect(p.x, p.y, z.rect), was = inRect(ox, oy, z.rect);
        if (!inNow || was) continue;
        if (z.kind === "arch" && ox < z.rect[0] + 0.05 && !S.secured) {
          const ar = S.W.byId.arch;
          if (S.bag && S.bag.done) { S.secured = true; S.bag = null; ar.state = "ok"; S.archT = 1.0; toast("安检门：绿灯 ✓ 安检通过，取回背包", 2.4); log("通过安检"); }
          else { ar.state = "alarm"; S.archT = 1.0; p.x = z.rect[0] - 0.3; toast("嘀嘀！安检员：请先把包放到安检机上过机", 2.6); }
        }
        if (z.kind === "exitlane" && ox < z.rect[0] + 0.05 && !S.secured) { p.x = z.rect[0] - 0.3; toast("安检员：这边是出站通道，进站请走安检口", 2.4); }
      }
      if (S.archT > 0) { S.archT -= dt; if (S.archT <= 0 && S.W.byId.arch) S.W.byId.arch.state = "idle"; }
      // bag on the belt
      if (S.bag && !S.bag.done) { S.bag.t += dt; if (S.bag.t >= S.bag.dur) { S.bag.done = true; S.bag.o.state = "idle"; toast("包过机完成 · 请从安检门通过", 1.8); } }
      // gates
      for (const g of S.W.gates) {
        if (g.open > 0) { const inF = rectDist(p.x, p.y, g.flap) < 0.45; if (!inF) g.open -= dt; }
        if (g.npcOpen > 0) g.npcOpen -= dt;
        const o = S.W.byId[g.obj], want = g.open > 0 || g.npcOpen > 0 ? "_open" : "_closed";
        if (want === "_closed" && rectDist(p.x, p.y, g.flap) < p.r) continue;
        o.state = A.skin + want;
      }
      // trains, NPCs
      trainTick(dGame);
      if (!S.ride) { spawnTick(dt); for (const a of S.npcs) npcTick(a, dt); }
      for (const a of S.staff) a.step(dt, 0, 0);
      if (S.npcs.some((a) => a.dead)) { S.npcs = S.npcs.filter((a) => !a.dead); S.actors = S.actors.filter((a) => !a.dead); }
      // portals
      let inP = null; for (const P0 of A.portals || []) if (inRect(p.x, p.y, P0.rect)) inP = P0;
      if (!inP) S.portalArmed = true;
      if (inP && S.portalArmed && !busy && !S.fadeTo) {
        S.portalArmed = false;
        if (inP.hours && !open(minOfDay())) { toast(`地铁已停运（运营时间 ${R.hours.label}）`, 2.4); p.y -= 0.4; }
        else if (inP.to === "exit:street") fadeTo(() => leave("street", {}), 0.3);
        else if (inP.to === "exit:cbd") fadeTo(() => leave("cbd", { exit: S.exitLetter }), 0.3);
        else { if (inP.exit) S.exitLetter = inP.exit; const sp = inP.spawn; fadeTo(() => goArea(inP.to, sp), 0.3); }
      }
      // toasts
      for (const t of S.toast) t.t -= dt; S.toast = S.toast.filter((t) => t.t > 0);
      // camera
      const tx = sx(p.x, p.y), ty = sy(p.x, p.y, 0.9) + (canvas.height > canvas.width ? 0.06 : 0) * canvas.height / S.cam.zoom;
      if (!S.camReady) { S.cam.x = tx; S.cam.y = ty; S.camReady = true; } else { const k = 1 - Math.exp(-dt * 6); S.cam.x += (tx - S.cam.x) * k; S.cam.y += (ty - S.cam.y) * k; }
    }

    // ---------------------------------------------------------------- render: sort
    function front(a, b) {          // +1: a in front of b (draw after) · -1: b in front · 0: no order
      const A = a.box, B = b.box, e = 0.01;
      const sxp = A[0] >= B[3] - e ? 1 : B[0] >= A[3] - e ? -1 : 0;     // +1: a east (farther)
      const syp = A[1] >= B[4] - e ? 1 : B[1] >= A[4] - e ? -1 : 0;
      if (sxp || syp) {
        if (sxp && syp && sxp !== syp) { const dx = sxp > 0 ? A[0] - B[3] : A[3] - B[0], dy = syp > 0 ? A[1] - B[4] : A[4] - B[1]; return dx + dy > 0 ? -1 : 1; }
        return (sxp || syp) > 0 ? -1 : 1;
      }
      if (A[2] >= B[5] - e) return 1; if (B[2] >= A[5] - e) return -1;
      const ca = A[0] + A[3] + A[1] + A[4], cb = B[0] + B[3] + B[1] + B[4];
      return ca < cb ? 1 : ca > cb ? -1 : 0;
    }
    const ovl = (r, q) => r && q && r[0] < q[2] && q[0] < r[2] && r[1] < q[3] && q[1] < r[3];
    function sortDraw(list) {
      const n = list.length, inE = new Array(n).fill(0), adj = list.map(() => []);
      list.forEach((d, i) => (d.k = -(d.box[0] + d.box[3] + d.box[1] + d.box[4]) + d.box[2] * 0.01 + i * 1e-6));
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        if (!ovl(list[i].rect, list[j].rect)) continue;
        const f = front(list[i], list[j]);
        if (f > 0) { adj[j].push(i); inE[i]++; } else if (f < 0) { adj[i].push(j); inE[j]++; }
      }
      const out = [], avail = [];
      for (let i = 0; i < n; i++) if (!inE[i]) avail.push(i);
      while (out.length < n) {
        if (!avail.length) {                          // cycle: break it at the farthest remaining
          let bi = -1; for (let i = 0; i < n; i++) if (inE[i] > 0 && (bi < 0 || list[i].k < list[bi].k)) bi = i; inE[bi] = 0; avail.push(bi);
        }
        let bi = 0; for (let q = 1; q < avail.length; q++) if (list[avail[q]].k < list[avail[bi]].k) bi = q;
        const i = avail.splice(bi, 1)[0]; if (inE[i] < 0) continue; inE[i] = -1; out.push(list[i]);
        for (const j of adj[i]) if (inE[j] > 0 && --inE[j] === 0) avail.push(j);
      }
      return out;
    }
    // ---------------------------------------------------------------- render: glass, signs, bag
    function quadW(pts, fill) { ctx.beginPath(); pts.forEach(([x, y, z], i) => (i ? ctx.lineTo(sx(x, y), sy(x, y, z)) : ctx.moveTo(sx(x, y), sy(x, y, z)))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
    function glass(o, ax, ay, bx, by, z0, z1, alpha) {
      const p = rotPt(ax, ay, o.rot), q = rotPt(bx, by, o.rot), X = o.x + (o.dx || 0), Y = o.y;
      const P1 = [X + p[0], Y + p[1]], Q1 = [X + q[0], Y + q[1]], under = S.W.A.kind !== "street";
      const a = alpha == null ? 1 : alpha;
      quadW([[P1[0], P1[1], z0], [Q1[0], Q1[1], z0], [Q1[0], Q1[1], z1], [P1[0], P1[1], z1]], `rgba(${under ? "170,205,222" : "150,190,215"},${0.17 * a})`);
      const L = (u) => [P1[0] + (Q1[0] - P1[0]) * u, P1[1] + (Q1[1] - P1[1]) * u];
      for (const [u0, w] of [[0.12, 0.06], [0.55, 0.03]]) { const A0 = L(u0), A1 = L(u0 + w), B0 = L(u0 + 0.18), B1 = L(u0 + 0.18 + w);
        quadW([[A0[0], A0[1], z0 + (z1 - z0) * 0.1], [A1[0], A1[1], z0 + (z1 - z0) * 0.1], [B1[0], B1[1], z0 + (z1 - z0) * 0.9], [B0[0], B0[1], z0 + (z1 - z0) * 0.9]], `rgba(255,255,255,${0.13 * a})`); }
    }
    function drawGlassFor(o, part, al) {
      if (o.type === "mt_psd") { if (o.state.endsWith("closed")) glass(o, 0.15, 0, 1.85, 0, 0.08, 2.22, al); }
      else if (o.type === "mt_psd_fix") { glass(o, 0.13, 0, 0.97, 0, 0.12, 2.2, al); glass(o, 1.03, 0, 1.87, 0, 0.12, 2.2, al); }
      else if (o.type === "mt_entrance" && part === "main") glass(o, 1.5, -3.0, 1.5, 2.95, 1.0, 2.62, al);
      else if (o.type === "mt_entrance" && part === "wallw") glass(o, -1.5, -3.0, -1.5, 2.95, 1.0, 2.62, al);
      else if (o.type === "mt_counter" && part === "main") glass(o, -1.45, -0.47, 1.45, -0.47, 1.1, 2.25, al);
    }
    const ADS = [["云图 X10 手机", "全城首发 · 影像旗舰", ["#1d3c8f", "#7b2ff7"]], ["云汇天地 秋季焕新", "满300减50 · B出口直达", ["#b0301e", "#f2a03d"]], ["天枢塔 · 金融城", "招聘季 · 一起改变这座城市", ["#0f5f5a", "#3fc1a5"]], ["咖啡 9.9", "早八续命 · 地铁站厅店", ["#5a3a22", "#d29b5b"]]];
    function drawSign(sg, al) {
      const [ox, oy, oz] = sg.at, U = sg.axis === "x" ? [KX, -KY] : [KX, KY], w = sg.w * 100, h = sg.h * 100;
      ctx.save(); ctx.globalAlpha = al == null ? 1 : al;
      ctx.transform(U[0] / 100, U[1] / 100, 0, PZ / 100, sx(ox, oy), sy(ox, oy, oz) - sg.h * PZ);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const fit = (txt, size, maxW, weight) => { let s = size; ctx.font = `${weight || "bold"} ${s}px "PingFang SC","Noto Sans CJK SC","Microsoft YaHei",sans-serif`; const m = ctx.measureText(txt).width; if (m > maxW) { s = s * maxW / m; ctx.font = `${weight || "bold"} ${s}px "PingFang SC","Noto Sans CJK SC","Microsoft YaHei",sans-serif`; } return s; };
      const sub = (t) => t.replace("{exit}", S.exitLetter);
      if (sg.kind === "countdown") {
        ctx.fillStyle = "#06090d"; ctx.fillRect(0, 0, w, h);
        const rows = boardRows();
        rows.forEach((r, i) => { const y = h * (0.28 + i * 0.46); ctx.textAlign = "left"; fit(r[0], h * 0.36, w * 0.62); ctx.fillStyle = "#ffb43a"; ctx.fillText(r[0], w * 0.04, y); ctx.textAlign = "right"; fit(r[1], h * 0.36, w * 0.34); ctx.fillStyle = r[2] ? "#7dff8a" : "#ffb43a"; ctx.fillText(r[1], w * 0.96, y); });
      } else if (sg.kind === "linemap") {
        ctx.fillStyle = "#f6f4ee"; ctx.fillRect(0, 0, w, h);
        fit("3号线 槐江线 线路图", h * 0.09, w * 0.9); ctx.fillStyle = "#2a2420"; ctx.fillText("3号线 槐江线 线路图", w / 2, h * 0.09);
        const y0 = h * 0.22, y1 = h * 0.94, n = stations.length; ctx.fillStyle = R.line.color; ctx.fillRect(w * 0.2, y0, w * 0.06, y1 - y0);
        stations.forEach((s, i) => { const y = y0 + (y1 - y0) * i / (n - 1), here = s.id === S.W.A.station; ctx.beginPath(); ctx.arc(w * 0.23, y, here ? w * 0.06 : w * 0.04, 0, 7); ctx.fillStyle = here ? "#d0302a" : "#fff"; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = R.line.color; ctx.stroke();
          ctx.textAlign = "left"; fit(s.name, h * 0.065, w * 0.66, here ? "bold" : "normal"); ctx.fillStyle = "#222"; ctx.fillText(s.name, w * 0.32, y); });
      } else if (sg.kind === "ad") {
        const k = Math.floor(S.t / 6 + (sg.ad || 0)) % ADS.length, ad = ADS[k], ph = (S.t % 6) / 6;
        const gr = ctx.createLinearGradient(0, 0, w, h); gr.addColorStop(0, ad[2][0]); gr.addColorStop(1, ad[2][1]); ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.beginPath(); ctx.arc(w * (0.2 + ph * 0.6), h * 0.5, h * 0.45, 0, 7); ctx.fill();
        fit(ad[0], h * 0.2, w * 0.86); ctx.fillStyle = "#fff"; ctx.fillText(ad[0], w / 2, h * 0.4);
        fit(ad[1], h * 0.1, w * 0.8, "normal"); ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fillText(ad[1], w / 2, h * 0.64);
      } else {
        if (sg.bg) { ctx.fillStyle = sg.bg; ctx.fillRect(0, 0, w, h); }
        const L = sg.lines.map(sub), n = L.length + (sg.sub ? 0.6 : 0);
        L.forEach((t, i) => { fit(t, h / n * 0.8, w * 0.92); ctx.fillStyle = sg.ink || "#222"; ctx.fillText(t, w / 2, h / n * (i + 0.5)); });
        if (sg.sub) { fit(sg.sub, h * 0.18, w * 0.9, "normal"); ctx.fillStyle = sg.ink; ctx.globalAlpha *= 0.75; ctx.fillText(sg.sub, w / 2, h * 0.86); }
      }
      ctx.restore();
    }
    function boardRows() {
      const A = S.W.A, rows = [], m = minOfDay();
      for (const dir of ["east", "west"]) {
        const T = (A.tracks || []).find((t) => t.dir === dir), st = T && S.trains[T.id];
        let txt, live = false;
        if (st && st.phase === "dwell") { txt = "列车已到站"; live = true; }
        else if (st && st.phase === "approach") { txt = "即将进站"; live = true; }
        else { const ta = nextArrival(A.station, dir, host.now()); if (ta == null || !open(m) && m > 600) txt = "今日运营结束"; else { const d = ta - host.now(); txt = d < 1 ? "即将进站" : d > 60 ? "首班 " + hhmm(ta) : `${Math.ceil(d)}分钟`; } }
        rows.push([dirLabel(dir), txt, live]);
      }
      return rows;
    }
    function bagDrawable(out) {
      if (!S.bag) return; const o = S.bag.o, k = Math.min(1, S.bag.t / S.bag.dur), x = o.x - 1.15 + 2.3 * k, y = o.y, z = 0.78;
      const box = [x - 0.18, y - 0.12, z, x + 0.18, y + 0.12, z + 0.3], X = sx(x, y), Y = sy(x, y, z);
      out.push({ box, rect: [X - 20, Y - 30, X + 20, Y + 10], kind: "bag", draw: () => {
        const b = box; quadW([[b[0], b[1], b[5]], [b[3], b[1], b[5]], [b[3], b[4], b[5]], [b[0], b[4], b[5]]], "#3e5a8c");
        quadW([[b[0], b[1], b[2]], [b[3], b[1], b[2]], [b[3], b[1], b[5]], [b[0], b[1], b[5]]], "#2c4370");
        quadW([[b[0], b[1], b[2]], [b[0], b[4], b[2]], [b[0], b[4], b[5]], [b[0], b[1], b[5]]], "#233759");
      } });
    }
    // ---------------------------------------------------------------- backdrop (street areas)
    function isoBox(x0, y0, x1, y1, h, col, win, lit) {
      const top = [[x0, y0, h], [x1, y0, h], [x1, y1, h], [x0, y1, h]];
      quadW([[x0, y0, 0], [x1, y0, 0], [x1, y0, h], [x0, y0, h]], col[0]);           // south face
      quadW([[x0, y0, 0], [x0, y1, 0], [x0, y1, h], [x0, y0, h]], col[1]);           // west face
      quadW(top, col[2]);
      if (win) for (let z = win[1]; z < h - 1; z += win[1]) {
        for (let x = x0 + 0.6; x < x1 - 0.8; x += win[0]) { const L = lit && ((x * 7 + z * 13) | 0) % 3 === 0; quadW([[x, y0 - 0.01, z], [x + win[2], y0 - 0.01, z], [x + win[2], y0 - 0.01, z + win[3]], [x, y0 - 0.01, z + win[3]]], L ? "#ffd58a" : col[3]); }
        for (let y = y0 + 0.6; y < y1 - 0.8; y += win[0]) { const L = lit && ((y * 5 + z * 11) | 0) % 3 === 0; quadW([[x0 - 0.01, y, z], [x0 - 0.01, y + win[2], z], [x0 - 0.01, y + win[2], z + win[3]], [x0 - 0.01, y, z + win[3]]], L ? "#ffcf7a" : col[4] || col[3]); }
      }
    }
    function drawBackdrop() {
      const A = S.W.A; if (A.kind !== "street") return;
      const night = darkness() > 0.5, cbd = A.backdrop === "cbd_towers";
      quadW([[-30, -14, 0], [50, -14, 0], [50, 0.3, 0], [-30, 0.3, 0]], cbd ? "#55585e" : "#4d4f53");                       // road
      for (let x = -30; x < 50; x += 3) quadW([[x, -3.6, 0], [x + 1.5, -3.6, 0], [x + 1.5, -3.45, 0], [x, -3.45, 0]], "#d8d6cc");
      quadW([[-30, -0.2, 0], [50, -0.2, 0], [50, 0.3, 0], [-30, 0.3, 0]], "#9a968c");                                         // kerb
      quadW([[-30, 0.3, 0], [0.3, 0.3, 0], [0.3, 30, 0], [-30, 30, 0]], cbd ? "#8e8a82" : "#857f74");
      quadW([[14, 0.3, 0], [50, 0.3, 0], [50, 30, 0], [14, 30, 0]], cbd ? "#8e8a82" : "#857f74");
      quadW([[0.3, 10, 0], [14, 10, 0], [14, 30, 0], [0.3, 30, 0]], cbd ? "#8e8a82" : "#857f74");
      if (cbd) {
        isoBox(-2, 13, 9, 24, 46, ["#6f8fa8", "#58758e", "#9fb6c6", "#3d5568", "#34495a"], [1.4, 3.2, 0.9, 2.4], night);
        isoBox(12, 12, 22, 22, 64, ["#7d97a6", "#647f90", "#aabdc8", "#3f586a", "#354b5b"], [1.2, 3.0, 0.8, 2.3], night);
        isoBox(17, -2, 27, 8, 38, ["#8aa0a2", "#6c8486", "#b2c2c2", "#46605f", "#3c5251"], [1.4, 3.4, 1.0, 2.6], night);
      } else {
        isoBox(-1, 12, 10, 19, 17, ["#b9a58e", "#9c8a76", "#8a7c6e", "#5c6670", "#56606a"], [1.5, 2.9, 0.8, 1.3], night);
        isoBox(11, 12, 19, 19, 11, ["#c4b49c", "#a49480", "#7d7066", "#5a646e", "#535d67"], [1.5, 2.9, 0.8, 1.3], night);
        isoBox(16, -1, 23, 9, 14, ["#ad9d8a", "#8f8170", "#827568", "#56606a", "#505a64"], [1.5, 2.9, 0.8, 1.3], night);
      }
    }
    // ---------------------------------------------------------------- lighting
    const lightSpr = {};
    function spr(rgb) {
      const k = rgb.join(","); if (lightSpr[k]) return lightSpr[k];
      const c = document.createElement("canvas"); c.width = 128; c.height = 64; const g = c.getContext("2d"), gr = g.createRadialGradient(64, 32, 0, 64, 32, 64);
      gr.addColorStop(0, `rgba(${k},1)`); gr.addColorStop(0.5, `rgba(${k},0.35)`); gr.addColorStop(1, `rgba(${k},0)`);
      g.setTransform(1, 0, 0, 0.5, 0, 16); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return (lightSpr[k] = c);
    }
    function darkness() { const m = minOfDay(); if (m < 330 || m > 1170) return 1; if (m < 420) return 1 - (m - 330) / 90; if (m > 1050) return (m - 1050) / 120; return 0; }
    function lighting(view) {
      const A = S.W.A, L = A.lights || {}, z = S.cam.zoom;
      let amb;
      if (A.kind === "street") { const d = darkness(); amb = [255 - 175 * d, 255 - 160 * d, 255 - 110 * d]; const m = minOfDay(); if (d > 0 && d < 1 && m > 900) amb = [255 - 120 * d, 230 - 140 * d, 200 - 80 * d]; }
      else amb = L.ambient || [240, 240, 240];
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = `rgb(${amb.map((v) => Math.round(v)).join(",")})`; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";
      const toS = (x, y, zz) => [(sx(x, y) - S.cam.x) * z + canvas.width / 2, (sy(x, y, zz || 0) - S.cam.y) * z + canvas.height / 2];
      if (A.kind !== "street") {
        const tint = L.tint || [255, 255, 255], old = A.skin === "old", sp = spr(tint);
        let k = 0;
        for (const [x0, y0, x1, y1] of L.tubes || []) {
          const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 2.5));
          for (let i = 0; i <= n; i++, k++) {
            const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n, [X, Y] = toS(x, y, 0);
            let a = old ? 0.13 : 0.16; if (old && k === 3) a *= S.flick > 0.5 ? 1 : 0.15;
            ctx.globalAlpha = a; ctx.drawImage(sp, X - 110 * z, Y - 55 * z, 220 * z, 110 * z);
          }
        }
      } else {
        const d = darkness(); if (d > 0.2) { const sp = spr([255, 214, 150]); for (const [x, y, zz, r] of L.lamps || []) { const [X, Y] = toS(x, y, 0); ctx.globalAlpha = 0.5 * d; ctx.drawImage(sp, X - 70 * r * z, Y - 35 * r * z, 140 * r * z, 70 * r * z); } }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    }

    // ---------------------------------------------------------------- render: frame
    function render() {
      const Wd = canvas.width, Hd = canvas.height, z = S.cam.zoom, A = S.W.A;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = A.kind === "street" ? "#6d7a86" : "#07080a"; ctx.fillRect(0, 0, Wd, Hd);
      ctx.setTransform(z, 0, 0, z, Math.round(Wd / 2 - S.cam.x * z), Math.round(Hd / 2 - S.cam.y * z));
      const view = [S.cam.x - Wd / 2 / z - 20, S.cam.y - Hd / 2 / z - 20, S.cam.x + Wd / 2 / z + 20, S.cam.y + Hd / 2 / z + 20];
      drawBackdrop();
      ctx.drawImage(S.W.ground.c, S.W.ground.x, S.W.ground.y);
      const emitK = A.kind === "street" ? 0.2 + 0.7 * darkness() : 0.55, list = [];
      for (const d of S.W.statics) {
        if (d.kind === "sign") {
          const sg = d.sg, u = sg.axis === "x" ? [1, 0] : [0, -1], pts = [[sg.at[0], sg.at[1], sg.at[2]], [sg.at[0] + u[0] * sg.w, sg.at[1] + u[1] * sg.w, sg.at[2] + sg.h]];
          const xs = pts.map((p) => sx(p[0], p[1])), ys = [sy(pts[0][0], pts[0][1], pts[0][2]), sy(pts[1][0], pts[1][1], pts[1][2]), sy(pts[0][0], pts[0][1], pts[1][2]), sy(pts[1][0], pts[1][1], pts[0][2])];
          list.push({ box: d.box, rect: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], rec: d, draw: (al) => drawSign(sg, al) }); continue;
        }
        const o = d.o, key = fkey(o, d.part), X = sx(o.x, o.y), Y = sy(o.x, o.y, o.z || 0), rect = frameRect(key, X, Y);
        if (!rect || !ovl(rect, view)) continue;
        if (d.bs !== o.state) { d.box = boxOf(o, d.part); d.bs = o.state; } if (!d.box) continue;
        const signs = S.W.signs[o.id + "/" + d.part];
        list.push({ box: d.box, rect, rec: d, fadeable: d.fadeable, draw: (al) => { drawFrame(ctx, key, X, Y, al, emitK); drawGlassFor(o, d.part, al); if (signs) for (const sg of signs) drawSign(sg, al); } });
      }
      let pd = null;
      for (const a of S.actors) {
        const fr = a.frame(); if (!fr) continue; const im = actorImg(fr[0]), f = fr[1]; if (!f) continue;
        const X = Math.round(sx(a.x, a.y)), Y = Math.round(sy(a.x, a.y, 0));
        const dr = { box: [a.x - a.r, a.y - a.r, 0, a.x + a.r, a.y + a.r, 1.75], rect: [X - f[4], Y - f[5], X - f[4] + f[2], Y - f[5] + f[3]], actor: a, draw: () => {
          ctx.fillStyle = "rgba(10,12,18,0.26)"; ctx.beginPath(); ctx.ellipse(X, Y, 10, 4.5, 0, 0, 7); ctx.fill();
          if (im) ctx.drawImage(im, f[0], f[1], f[2], f[3], X - f[4], Y - f[5], f[2], f[3]);
        } };
        list.push(dr); if (a === S.player) pd = dr;
      }
      trainDrawables(list); bagDrawable(list);
      const sorted = sortDraw(list);
      let after = false;
      for (const d of sorted) {
        if (d === pd) { after = true; d.draw(1); continue; }
        let tgt = 1;
        if (after && pd && d.rec && d.fadeable && d.box[5] > 0.7 && ovl(d.rect, [pd.rect[0] + 4, pd.rect[1] + 6, pd.rect[2] - 4, pd.rect[3] - 2])) tgt = 0.38;
        if (after && pd && d.kind === "train" && ovl(d.rect, pd.rect)) tgt = 0.45;
        const rec = d.rec || d; rec.fa = rec.fa == null ? tgt : rec.fa + (tgt - rec.fa) * 0.2;
        d.draw(d.rec ? rec.fa : tgt);
      }
      lighting(view);
      // names above heads (after lighting so they stay legible)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const toS = (x, y, zz) => [(sx(x, y) - S.cam.x) * z + Wd / 2, (sy(x, y, zz) - S.cam.y) * z + Hd / 2];
      ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.font = `${Math.round(11 * Math.max(1, z * 0.8))}px "PingFang SC","Noto Sans CJK SC",sans-serif`;
      for (const a of S.actors) if ((a.named || a.staff) && Math.hypot(a.x - S.player.x, a.y - S.player.y) < (a.named ? 5 : 2.6)) {
        const [X, Y] = toS(a.x, a.y, 2.0); const t = a.name; const w = ctx.measureText(t).width + 8;
        ctx.fillStyle = a.named ? "rgba(30,60,40,0.78)" : "rgba(20,24,32,0.7)"; ctx.fillRect(X - w / 2, Y - 15 * Math.max(1, z * 0.8), w, 15 * Math.max(1, z * 0.8)); ctx.fillStyle = "#fff"; ctx.fillText(t, X, Y - 1);
      }
      hud();
    }
    // ---------------------------------------------------------------- HUD
    const FONT = (s, w) => `${w || ""} ${Math.round(s)}px "PingFang SC","Noto Sans CJK SC","Microsoft YaHei",sans-serif`;
    function rrect(x, y, w, h, r, fill) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); ctx.fillStyle = fill; ctx.fill(); }
    function hud() {
      const Wd = canvas.width, Hd = canvas.height, u = clamp(Math.min(Wd, Hd) / 390, 1, 1.5), A = S.W.A, m = minOfDay();
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.textBaseline = "middle"; ctx.textAlign = "left";
      // top-left: place / time / money
      const lines = [[A.name, 13, "bold"], [`${host.dateLabel ? host.dateLabel() + " " : ""}${hhmm(host.now())}${isPeak(m) ? " · 高峰" : ""}${!open(m) ? " · 已停运" : ""}`, 12],
        [`¥${host.money().toFixed(0)} · 交通卡 ¥${MS.card} · 单程票 ×${MS.tokens.length}`, 12]];
      const flags = []; if (S.secured) flags.push("安检✓"); if (MS.entry) flags.push(MS.entry.rode ? "已乘车·待出站" : "已进站·" + ({ qr: "乘车码", card: "交通卡", token: "单程票" })[MS.entry.method]);
      if (flags.length) lines.push([flags.join(" · "), 12]);
      ctx.font = FONT(13 * u, "bold"); let w = 0; for (const [t, s, b] of lines) { ctx.font = FONT(s * u, b); w = Math.max(w, ctx.measureText(t).width); }
      rrect(8, 8, w + 30 * u, (lines.length * 18 + 10) * u, 8 * u, "rgba(14,18,26,0.72)");
      ctx.fillStyle = R.line.color; ctx.fillRect(14, 14 * u, 5 * u, 14 * u);
      lines.forEach(([t, s, b], i) => { ctx.font = FONT(s * u, b); ctx.fillStyle = i === 0 ? "#fff" : "#d7dde6"; ctx.fillText(t, 22 * u + 4, (8 + 9 + i * 18) * u + 4); });
      // top-right: next trains (platform / concourse)
      if (A.kind !== "street") {
        const rows = boardRows(); ctx.font = FONT(12 * u); const bw = 168 * u, bx = Wd - bw - 8;
        rrect(bx, 8, bw, 56 * u, 8 * u, "rgba(6,9,13,0.82)");
        ctx.fillStyle = R.line.color; ctx.font = FONT(11 * u, "bold"); ctx.fillText(`${R.line.name} ${R.line.alias}`, bx + 8 * u, 8 + 11 * u);
        rows.forEach((r, i) => { ctx.font = FONT(12 * u); ctx.fillStyle = "#ffb43a"; ctx.textAlign = "left"; ctx.fillText(r[0], bx + 8 * u, 8 + (27 + i * 17) * u); ctx.textAlign = "right"; ctx.fillStyle = r[2] ? "#7dff8a" : "#ffb43a"; ctx.fillText(r[1], bx + bw - 8 * u, 8 + (27 + i * 17) * u); ctx.textAlign = "left"; });
      }
      // prompt
      const c = !S.menu && !S.overlay && !S.ride && candidates();
      S.prompt = c ? c.label : null;
      if (c) {
        const t = (isTouch() ? "互动：" : "E  ") + c.label; ctx.font = FONT(14 * u, "bold"); const tw = ctx.measureText(t).width + 26 * u;
        const y = Hd - (isTouch() ? 150 : 56) * u; rrect(Wd / 2 - tw / 2, y, tw, 30 * u, 15 * u, "rgba(255,248,230,0.94)"); ctx.fillStyle = "#2a2018"; ctx.textAlign = "center"; ctx.fillText(t, Wd / 2, y + 15 * u); ctx.textAlign = "left";
      }
      // toasts
      S.toast.forEach((t, i) => { ctx.font = FONT(13 * u); const tw = Math.min(Wd - 24, ctx.measureText(t.msg).width + 24 * u), y = Hd * 0.26 + i * 34 * u; ctx.globalAlpha = Math.min(1, t.t * 3);
        rrect(Wd / 2 - tw / 2, y, tw, 28 * u, 14 * u, "rgba(16,20,28,0.86)"); ctx.fillStyle = "#fff"; ctx.textAlign = "center"; wrapText(t.msg, Wd / 2, y + 14 * u, tw - 16 * u); ctx.textAlign = "left"; ctx.globalAlpha = 1; });
      // touch controls
      S.btns = [];
      if (isTouch() && !S.ride) {
        const r = 36 * u, bx = Wd - r - 22 * u, by = Hd - r - 40 * u; S.btns.push({ x: bx, y: by, r, act: interact });
        ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fillStyle = c ? `rgba(255,214,120,${0.75 + 0.2 * Math.sin(S.t * 6)})` : "rgba(255,255,255,0.28)"; ctx.fill();
        ctx.fillStyle = "#1b1a14"; ctx.font = FONT(15 * u, "bold"); ctx.textAlign = "center"; ctx.fillText("互动", bx, by); ctx.textAlign = "left";
        const zr = 20 * u, zx = Wd - zr - 22 * u, zy = by - r - zr - 18 * u; S.btns.push({ x: zx, y: zy, r: zr, act: () => (S.cam.zoom = S.cam.zoom > 0.9 ? 0.67 : 1) });
        ctx.beginPath(); ctx.arc(zx, zy, zr, 0, 7); ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = FONT(11 * u); ctx.textAlign = "center"; ctx.fillText("视角", zx, zy); ctx.textAlign = "left";
        if (touch.joy) { const j = touch.joy; ctx.beginPath(); ctx.arc(j.x, j.y, 46 * u, 0, 7); ctx.fillStyle = "rgba(255,255,255,0.16)"; ctx.fill(); ctx.beginPath(); ctx.arc(j.x + touch.vec[0] * 40 * u, j.y + touch.vec[1] * 40 * u, 20 * u, 0, 7); ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.fill(); }
      }
      if (S.menu) drawMenu(u); else S.menuHit = null;
      if (S.overlay) drawOverlay(u);
      if (S.ride) drawRide(u);
      let fa = 0; if (S.fadeTo) { const F = S.fadeTo; fa = F.t < F.dur ? F.t / F.dur : Math.max(0, 2 - F.t / F.dur); }
      if (fa > 0) { ctx.fillStyle = `rgba(0,0,0,${fa})`; ctx.fillRect(0, 0, Wd, Hd); }
    }
    function wrapText(t, x, y, maxW) { if (ctx.measureText(t).width <= maxW) return ctx.fillText(t, x, y); const s = maxW / ctx.measureText(t).width; ctx.save(); ctx.translate(x, y); ctx.scale(s, 1); ctx.fillText(t, 0, 0); ctx.restore(); }
    function drawMenu(u) {
      const M0 = S.menu, Wd = canvas.width, Hd = canvas.height, w = Math.min(Wd - 20, 400 * u), ih = 36 * u, n = M0.items.length;
      const h = (58 + 4) * u + n * ih + 8 * u, x = (Wd - w) / 2, y = Math.max(8, Math.min(Hd - h - 8, Hd * 0.5 - h / 2));
      ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(0, 0, Wd, Hd);
      rrect(x, y, w, h, 12 * u, "rgba(250,248,242,0.97)");
      ctx.fillStyle = R.line.color; ctx.fillRect(x, y + 10 * u, 5 * u, 36 * u);
      ctx.fillStyle = "#1f1c18"; ctx.font = FONT(15 * u, "bold"); wrapText(M0.title, x + 16 * u + (w - 32 * u) / 2 - (w - 32 * u) / 2, y + 20 * u, w - 32 * u);
      ctx.fillStyle = "#6b6358"; ctx.font = FONT(12 * u); wrapText(M0.sub || "", x + 16 * u, y + 42 * u, w - 32 * u);
      S.menuHit = [];
      M0.items.forEach((it, i) => {
        const iy = y + (58 + 4) * u + i * ih; S.menuHit.push({ x, y: iy, w, h: ih, i });
        rrect(x + 8 * u, iy + 2, w - 16 * u, ih - 4, 8 * u, it.disabled ? "rgba(0,0,0,0.04)" : i === (S.menuSel || 0) ? "rgba(224,127,45,0.18)" : "rgba(0,0,0,0.06)");
        ctx.fillStyle = it.disabled ? "#a8a196" : "#2a241c"; ctx.font = FONT(14 * u); ctx.textAlign = "left"; wrapText(`${i < 9 ? i + 1 + ". " : ""}${it.label}`, x + 18 * u, iy + ih / 2, w * (it.right ? 0.56 : 0.86));
        if (it.right) { ctx.textAlign = "right"; ctx.fillStyle = it.disabled ? "#b8b0a4" : "#8a5a24"; ctx.font = FONT(12 * u); wrapText(it.right, x + w - 18 * u, iy + ih / 2, w * 0.36); ctx.textAlign = "left"; }
      });
    }
    function pickMenu(i) { const it = S.menu && S.menu.items[i]; if (!it) return; if (it.disabled) { toast("该项不可用"); return; } it.act(); }
    I.pick = pickMenu;
    function drawOverlay(u) {
      const O = S.overlay, Wd = canvas.width, Hd = canvas.height, here = S.W.A.station;
      ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, 0, Wd, Hd);
      const w = Math.min(Wd - 20, 420 * u), h = Math.min(Hd - 40, O.kind === "linemap" ? 470 * u : 220 * u), x = (Wd - w) / 2, y = (Hd - h) / 2;
      rrect(x, y, w, h, 12 * u, "rgba(250,248,242,0.98)");
      if (O.kind === "linemap") {
        ctx.fillStyle = "#1f1c18"; ctx.font = FONT(15 * u, "bold"); ctx.fillText(`${R.line.name}（${R.line.alias}）· 运营 ${R.hours.label}`, x + 16 * u, y + 22 * u);
        ctx.fillStyle = "#6b6358"; ctx.font = FONT(11 * u); ctx.fillText(`票价按里程：≤6km ¥3 · ≤12km ¥4 · ≤22km ¥5 · 更远 ¥6（从${stById[here].name}出发）`, x + 16 * u, y + 42 * u);
        const y0 = y + 66 * u, step = (h - 84 * u) / (stations.length - 1);
        ctx.fillStyle = R.line.color; ctx.fillRect(x + 30 * u, y0, 6 * u, step * (stations.length - 1));
        stations.forEach((s, i) => { const yy = y0 + i * step, hr = s.id === here; ctx.beginPath(); ctx.arc(x + 33 * u, yy, (hr ? 8 : 6) * u, 0, 7); ctx.fillStyle = hr ? "#d0302a" : "#fff"; ctx.fill(); ctx.lineWidth = 2 * u; ctx.strokeStyle = R.line.color; ctx.stroke();
          ctx.fillStyle = "#222"; ctx.font = FONT(14 * u, hr ? "bold" : ""); ctx.fillText(s.name + (hr ? "（本站）" : "") + (s.area ? "" : ""), x + 50 * u, yy);
          ctx.fillStyle = "#8a7c6c"; ctx.font = FONT(12 * u); ctx.textAlign = "right"; ctx.fillText(hr ? s.zone : `${I.rideMin(here, s.id)}分钟 · ¥${I.fare(here, s.id)}`, x + w - 16 * u, yy); ctx.textAlign = "left"; });
      } else {
        ctx.fillStyle = "#1f1c18"; ctx.font = FONT(16 * u, "bold"); ctx.fillText(O.title, x + 16 * u, y + 26 * u);
        ctx.fillStyle = "#5a5248"; ctx.font = FONT(12 * u); (O.sub || "").split("\n").forEach((t, i) => ctx.fillText(t, x + 16 * u, y + (52 + i * 18) * u));
        S.ovHit = []; (O.buttons || []).forEach((b, i) => { const bw = (w - 40 * u) / O.buttons.length, bx = x + 16 * u + i * (bw + 8 * u), by = y + h - 50 * u; rrect(bx, by, bw - 8 * u, 36 * u, 8 * u, i === 0 ? R.line.color : "rgba(0,0,0,0.1)"); ctx.fillStyle = i === 0 ? "#fff" : "#222"; ctx.font = FONT(14 * u, "bold"); ctx.textAlign = "center"; ctx.fillText(b.label, bx + (bw - 8 * u) / 2, by + 18 * u); ctx.textAlign = "left"; S.ovHit.push({ x: bx, y: by, w: bw - 8 * u, h: 36 * u, act: b.act }); });
      }
    }
    function drawRide(u) {
      const Rr = S.ride, Wd = canvas.width, Hd = canvas.height, k = clamp(Rr.t / Rr.dur, 0, 1);
      ctx.fillStyle = "#05070a"; ctx.globalAlpha = Math.min(1, Rr.t * 4); ctx.fillRect(0, 0, Wd, Hd); ctx.globalAlpha = 1;
      const i0 = stations.findIndex((s) => s.id === Rr.from), i1 = stations.findIndex((s) => s.id === Rr.to), lo = Math.min(i0, i1), hi = Math.max(i0, i1);
      ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.font = FONT(17 * u, "bold"); ctx.fillText(`${R.line.name} · ${dirLabel(Rr.dir)}`, Wd / 2, Hd * 0.3);
      ctx.fillStyle = "#c9d0da"; ctx.font = FONT(13 * u); ctx.fillText(`列车运行中…… 约 ${Rr.mins} 分钟 · ${hhmm(host.now() + Rr.mins * k)}`, Wd / 2, Hd * 0.3 + 26 * u);
      const x0 = Wd * 0.12, x1 = Wd * 0.88, yy = Hd * 0.5, n = hi - lo;
      ctx.fillStyle = R.line.color; ctx.fillRect(x0, yy - 3 * u, x1 - x0, 6 * u);
      for (let i = lo; i <= hi; i++) { const t = (i - lo) / n, X = Rr.dir === "east" ? x0 + (x1 - x0) * t : x1 - (x1 - x0) * t; ctx.beginPath(); ctx.arc(X, yy, 6 * u, 0, 7); ctx.fillStyle = "#fff"; ctx.fill();
        ctx.save(); ctx.translate(X, yy + 14 * u); ctx.rotate(0.6); ctx.textAlign = "left"; ctx.fillStyle = "#dfe5ec"; ctx.font = FONT(11 * u); ctx.fillText(stations[i].name, 0, 0); ctx.restore(); }
      const D = x0 + (x1 - x0) * k; ctx.beginPath(); ctx.arc(D, yy, 9 * u, 0, 7); ctx.fillStyle = "#ffcf5a"; ctx.fill();
      ctx.fillStyle = "#8b95a2"; ctx.font = FONT(12 * u); ctx.fillText("（跳过车厢内画面）", Wd / 2, Hd * 0.72); ctx.textAlign = "left";
    }

    // ---------------------------------------------------------------- toasts / log
    function toast(msg, t) { const old = S.toast.find((x) => x.msg === msg); if (old) { old.t = Math.max(old.t, t || 2.4); return; } S.toast.push({ msg, t: t || 2.4 }); if (S.toast.length > 3) S.toast.shift(); if (host.toast) host.toast(msg); }
    function log(msg) { (S.log = S.log || []).push(hhmm(host.now()) + " " + msg); if (host.log) host.log(msg); }
    I.toast = toast; I.stub = (title, sub, buttons) => { S.overlay = { kind: "stub", title, sub, buttons }; };

    // ---------------------------------------------------------------- input
    const onKey = (e, v) => {
      if (!I.active) return; const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
      keys[k] = v; if (!v || e.repeat) return;
      if (S.menu) {
        if (/^[1-9]$/.test(k)) pickMenu(+k - 1);
        else if (k === "escape" || k === "q") S.menu = null;
        else if (k === "arrowdown" || k === "s") S.menuSel = ((S.menuSel || 0) + 1) % S.menu.items.length;
        else if (k === "arrowup" || k === "w") S.menuSel = ((S.menuSel || 0) + S.menu.items.length - 1) % S.menu.items.length;
        else if (k === "enter" || k === "e" || k === " ") pickMenu(S.menuSel || 0);
        return;
      }
      if (S.overlay && S.overlay.buttons) { if (k === "enter" || k === "e" || k === " ") S.overlay.buttons[0].act(); return; }
      if (k === "e" || k === " " || k === "enter") interact();
      if (k === "escape") S.overlay = null;
      if (k === "=" || k === "+") S.cam.zoom = Math.min(3, S.cam.zoom * 1.25); if (k === "-") S.cam.zoom = Math.max(0.4, S.cam.zoom / 1.25);
      if (k === "t") { host.advance(30); toast("时间快进 30 分钟 → " + hhmm(host.now())); }
      if (k === "p") { S.crowdMul = S.crowdMul > 1 ? 1 : 2.2; toast(S.crowdMul > 1 ? "（调试）客流 ×2.2" : "（调试）客流恢复"); }
    };
    const kd = (e) => onKey(e, true), ku = (e) => onKey(e, false);
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku); I._kd = kd; I._ku = ku;
    const pos = (t) => { const r = canvas.getBoundingClientRect(); return [(t.clientX - r.left) * canvas.width / r.width, (t.clientY - r.top) * canvas.height / r.height]; };
    function tapAt(x, y) {
      if (S.menu) { const h = (S.menuHit || []).find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h); if (h) pickMenu(h.i); else if (S.menuHit && S.menuHit.length) { const l = S.menuHit[S.menuHit.length - 1]; if (y > l.y + l.h + 40 || y < S.menuHit[0].y - 120) S.menu = null; } return true; }
      if (S.overlay) { const h = (S.ovHit || []).find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h); if (h) h.act(); else if (!S.overlay.buttons) S.overlay = null; return true; }
      const b = (S.btns || []).find((b) => Math.hypot(x - b.x, y - b.y) < b.r + 6); if (b) { b.act(); return true; }
      return false;
    }
    canvas.addEventListener("touchstart", (e) => {
      if (!I.active) return; e.preventDefault(); touch.on = true;
      for (const t of e.changedTouches) { const [x, y] = pos(t); if (tapAt(x, y)) continue; if (!touch.joy && x < canvas.width * 0.62) { touch.joy = { id: t.identifier, x, y }; touch.vec = [0, 0]; } }
    }, { passive: false });
    canvas.addEventListener("touchmove", (e) => {
      if (!I.active) return; e.preventDefault();
      for (const t of e.changedTouches) if (touch.joy && t.identifier === touch.joy.id) { const [x, y] = pos(t), u = clamp(Math.min(canvas.width, canvas.height) / 390, 1, 1.5); let dx = (x - touch.joy.x) / (40 * u), dy = (y - touch.joy.y) / (40 * u); const L = Math.hypot(dx, dy); if (L > 1) { dx /= L; dy /= L; } touch.vec = L < 0.18 ? [0, 0] : [dx, dy]; }
    }, { passive: false });
    const tend = (e) => { for (const t of e.changedTouches) if (touch.joy && t.identifier === touch.joy.id) { touch.joy = null; touch.vec = [0, 0]; } };
    canvas.addEventListener("touchend", tend); canvas.addEventListener("touchcancel", tend);
    canvas.addEventListener("mousedown", (e) => { if (!I.active || touch.on) return; const [x, y] = pos(e); tapAt(x, y); });

    // ---------------------------------------------------------------- loop
    let lastT = 0;
    function frame(ts) {
      if (!S.running) return;
      requestAnimationFrame(frame);
      const dt = Math.min(0.05, Math.max(0.001, (ts - (lastT || ts)) / 1000)); lastT = ts;
      if (!I.active || !S.W || S.manual) return;
      S.flick = (S.flick || 0) + dt; if (S.flick > 1.6 + rnd()) S.flick = rnd() < 0.5 ? 0.45 : 0;
      update(dt); render();
    }
    function startLoop() { S.running = true; requestAnimationFrame(frame); }
    I.stop = () => { S.running = false; I.active = false; window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
    // ---------------------------------------------------------------- test hooks
    I.debug = {
      S, MS, host,
      go: (area, x, y, dir) => { goArea(area, x != null ? [x, y, dir || "S"] : null); S.camReady = false; },
      at: (x, y, dir) => { S.player.x = x; S.player.y = y; if (dir) S.player.dir = dir; S.camReady = false; },
      step: (n, dt) => { for (let i = 0; i < (n || 1); i++) update(dt || 1 / 30); render(); },
      render, candidates, trainState: (id) => trainState(S.W.A.tracks.find((t) => t.id === id)),
      manual: (v) => { S.manual = v; },
      walk: (dx, dy) => { S.auto = dx == null ? null : [dx, dy]; },
      secure: () => { S.secured = true; },
    };
    return I;
  };

  // ------------------------------------------------------------------ core glue (optional; call once after SP.game exists)
  /** FushiMetro.installCore(SP, opt) — registers SP.places.metro_jhl / SP.places.metro_cbd for the core's existing hooks:
   *  street object {interact:"metro", to:"metro_jhl"} -> G.use -> SP.places.metro_jhl.enter(o);
   *  CBD module exit {to:"metro_cbd", link:"A".."D"} -> SP.places.metro_cbd.enter({link}).
   *  The metro draws on its own full-screen canvas above the core canvas; the core clock is frozen (scale 0) while inside and
   *  advanced by the metro (walking at rules.metro.clock_scale + the ride skip). Keys are captured so the hidden street player stays put.
   *  opt.toStreet(info) / opt.toCbd(info) override where 李默 lands (defaults below). */
  FM.installCore = function (SP, opt) {
    if (!SP || !SP.game || (SP.places && SP.places.metro_jhl && SP.places.metro_jhl._fm)) return FM.core;
    opt = opt || {};
    const G = SP.game, C = SP.clock, R = G.rules, W = SP.world;
    const host = {
      now: () => C.abs(),
      advance: (m) => { C.min += m; while (C.min >= 1440) { C.min -= 1440; C.day++; } },
      money: () => G.ps.money,
      spend: (a, label, method) => {
        if (!(a > 0)) return true;
        if (R.spend(G.ps, a, label || "地铁", C.abs()) == null) return false;
        const m = method || (/支付宝/.test(label || "") ? "支付宝" : "微信支付");
        if (G.payCard && m !== "现金") G.payCard({ amount: a, method: m === "微信" ? "微信支付" : m, to: "城市地铁", what: (label || "地铁").replace(/（.*?）/g, "") });
        return true;
      },
      state: () => G.ps,                                    // MS lives at G.ps.metro (card balance, tokens, entry) -> saved with the game state
      season: () => C.season,
      isWorkday: () => { const d = R.date ? R.date(C.abs()) : null; return d ? !d.off : true; },
      dateLabel: () => (R.date ? R.date(C.abs()).label : ""),
      log: (msg) => { if (W && W.logEvent) W.logEvent("地铁：" + msg); },
    };
    const cv = document.createElement("canvas");
    cv.id = "metro"; cv.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:50;display:none;image-rendering:pixelated;touch-action:none";
    document.body.appendChild(cv);
    const fit = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    fit(); window.addEventListener("resize", fit);
    const touchy = ("ontouchstart" in window) && matchMedia("(pointer: coarse)").matches;
    let saved = null, fromObj = null;
    const show = () => { if (saved) return; saved = { scale: C.scale }; C.scale = 0; cv.style.display = "block"; SP.metroActive = true; };
    const hide = () => { if (!saved) return; C.scale = saved.scale; saved = null; cv.style.display = "none"; SP.metroActive = false; };
    let M = null;   // created lazily on first entry (G.ps only exists after G.init)
    const getM = () => M || (M = FM.core = FM.create({ canvas: cv, host, touch: touchy, zoom: Math.min(cv.width, cv.height) > 700 ? 1.5 : 1,
      onExit: (target, info) => {
        hide(); M.stop && (M.s.running = false);
        if (target === "street") (opt.toStreet || toStreet)(info); else (opt.toCbd || toCbd)(info);
      } }));
    function toStreet() {                                    // back on 井槐里路 next to the entrance (its reach point)
      if (W.sceneId && W.sceneId !== "street" && SP.place) SP.place.enter("street");
      const o = (W.byId && W.byId.metro_jhl) || fromObj, P = SP.player;
      if (o && o.reach) { P.x = o.reach[0]; P.y = o.reach[1]; P.dir = "W"; }
      if (G) { G.armed = false; G.lastXY = [P.x, P.y]; }
    }
    function toCbd(info) {                                   // CBD module id 'cbd': hand over the exit letter
      const L = (info && info.exit) || "A";
      if (SP.places.cbd && SP.places.cbd.enter) return SP.places.cbd.enter({ exit: L, from: "metro_cbd" });
      if (SP.scenes && SP.scenes.cbd) { const ex = (window.CBD_SCENE && window.CBD_SCENE.exits || []).find((e) => e.id === L); return G.switchScene("cbd", ex ? ex.spawn : SP.scenes.cbd.spawn); }
      SP.toast && SP.toast(`CBD 街区（${L} 出口）还没接入`);
    }
    window.addEventListener("keydown", (e) => { if (saved && M) { M._kd(e); e.stopImmediatePropagation(); } }, true);
    window.addEventListener("keyup", (e) => { if (saved && M) { M._ku(e); e.stopImmediatePropagation(); } }, true);
    SP.places = SP.places || {};
    SP.places.metro_jhl = { _fm: true, enter: (o) => { fromObj = o || null; show(); getM().enter("jinghuaili"); return null; } };
    SP.places.metro_cbd = { _fm: true, enter: (o) => { show(); getM().enter("cbd", { exit: (o && (o.link || o.exit)) || "A" }); return null; } };
    return SP.places.metro_jhl;
  };
  if (window.SP && window.SP.game) FM.installCore(window.SP);  // auto-install when loaded after game.js
})();
