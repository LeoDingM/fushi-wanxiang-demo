/* scene-proto · game: the gameplay layer between the engine-agnostic rules (../shared-rules/rules.js: needs, money,
   items, rent, timed actions) and this renderer: scene portals + fade transitions (street <-> stairwell <-> 2F-02),
   furniture actions (menu when a place offers several), timed activities that fast-forward the clock (sleep, cook,
   shower ...) with visual object states, auto stairwell lights, needs HUD, rent / need events -> toasts + log. */
(function (SP) {
  "use strict";
  const G = (SP.game = { ps: null, activity: null, trans: null, menu: null, armed: true });
  const R = (G.rules = window.FushiRules.create(window.FUSHI_RULES_DATA));
  const W = SP.world, C = SP.clock;
  // interact kind -> rules place
  const PLACE = { bed: "bed", stove: "stove", fridge: "fridge", shower: "shower", basin: "basin", toilet: "toilet", wardrobe: "wardrobe", pc: "pc", window_in: "window", shelf: "shelf", stall: "stall" };
  // what the room looks like while / after an action runs (object ids in interiors.json)
  const VIS = {
    cook_noodles: { obj: "kitchen", during: "cooking", after: "off", then: { table: "meal" } },
    cook_veg: { obj: "kitchen", during: "cooking", after: "off", then: { table: "meal" } },
    snack: { obj: "fridge", during: "open", after: "closed" }, drink_fridge: { obj: "fridge", during: "open", after: "closed" },
    shower: { obj: "shower", during: "running", after: "dry", hide: true },
    browse: { obj: "desk", during: "on", after: "off" },
    change: { obj: "wardrobe", during: "open", after: "closed" },
    make_bed: { obj: "bed", after: "made" },
    sleep: { obj: "bed", during: "made", after: "messy", hide: true, dark: true }, nap: { obj: "bed", during: "made", after: "messy", hide: true, dark: true },
  };
  const NEED_TXT = { hunger: ["有点饿了", "饿得前胸贴后背"], energy: ["有点困了", "困得睁不开眼"], hygiene: ["身上有点黏", "该洗澡了，有味了"], mood: ["心情有点低落", "心情很糟"] };

  G.init = function () {
    G.spawnAt = [0, 0]; G.moving = false;
    G.ps = R.newState(C.abs()); G.activity = null; G.trans = null; G.closeMenu(); G.armed = true; G.speedMul = 1;
  };
  G.flags = function () {
    const v = SP.actors.byId && SP.actors.byId("vendor"), bed = W.byId.bed;
    return { vendor_open: !!(v && !v.hidden && v.act === "cook"), bed_messy: !!(bed && bed.state === "messy") };
  };
  G.ctx = function () {
    return { abs: C.abs(), flags: G.flags(), outdoors: !W.interior, weather: C.intensity > 0.15 ? C.weather : "clear", umbrella: SP.player.umbrella() };
  };
  G.busy = () => !!(G.activity || G.trans);

  // ---------- interactions offered by the gameplay layer (world.actionFor asks here first) ----------
  G.actionFor = function (o, kind) {
    const k = o.interact, place = PLACE[k];
    if (place) {
      if (kind !== "use") return null;
      const opts = R.actionsAt(G.ps, place, G.ctx()).filter((a) => a.ok || a.reason !== "not here");
      if (!opts.length) return null;
      const ok = opts.filter((a) => a.ok);
      if (opts.length === 1) return { label: opts[0].ok ? opts[0].label : `${opts[0].label}（${opts[0].reason}）`, do: "game" };
      return { label: ok.length ? `${ok[0].label}…（${ok.length} 项）` : `${opts[0].label}（${opts[0].reason}）`, do: "game" };
    }
    switch (k) {
      case "portal": return kind === "use" ? { label: o.label || "进门", do: "game" } : null;
      case "light": return kind === "use" ? { label: o.state === "on" ? "关灯" : "开灯", do: "game" } : null;
      case "hall_light": return kind === "use" ? { label: "跺跺脚（声控灯）", do: "game" } : null;
      case "neighbor_door": return kind === "use" ? { label: "敲门", do: "game" } : null;
      case "mailbox": return kind === "use" ? { label: "看信箱", do: "game" } : null;
      case "notice": return kind === "use" ? { label: "看公告", do: "game" } : null;
      case "stairs": return kind === "use" ? { label: (o.go === "up" ? (o.to === "roof" ? "上天台" : "上楼") : "下楼") + " · 选楼层", do: "game" } : null;
      case "table": return kind === "use" ? (o.state === "meal" ? { label: "收拾碗筷", do: "game" } : { label: "看看", do: "game" }) : null;
    }
    return undefined;
  };
  G.use = function (o) {
    const k = o.interact, place = PLACE[k];
    if (place) {
      const opts = R.actionsAt(G.ps, place, G.ctx()).filter((a) => a.ok || a.reason !== "not here");
      if (opts.length === 1) return G.start(opts[0].id, o);
      G.openMenu(o, opts); return null;
    }
    switch (k) {
      case "portal": G.go({ to: o.to, spawn: o.spawn, door: o.id }); return null;
      case "light": {
        const on = o.state !== "on";
        for (const x of W.objects) if (x.interact === "light") W.setState(x, on ? "on" : "off");
        W.logEvent(on ? "李默开了灯" : "李默关了灯"); return on ? "开灯" : "关灯";
      }
      case "hall_light": o.wake = C.abs(); W.setState(o, "on"); return "咚！声控灯亮了";
      case "neighbor_door": return o.note ? `咚咚咚……${o.name}：${o.note}` : `咚咚咚……${o.name || "邻居家"} 没人应`;
      case "mailbox": return G.ps.owed > 0 ? `信箱里有张纸条：「2F-02 房租 ¥${G.ps.owed} 请尽快交 —— ${R.data.rent.landlord}」` : "2F-02 的信箱：一张水费单、两张小广告";
      case "notice": if (o.note) return o.note; return `楼道公告：每周日 20:00 交房租（¥${R.data.rent.amount}）· 楼道禁止停放电动车`;
      case "stairs": G.openFloorMenu(o); return null;
      case "table": if (o.state === "meal") { W.setState(o, "default"); W.logEvent("李默收拾了碗筷"); return "碗筷洗干净了"; } return "一张折叠小饭桌";
    }
    return null;
  };
  /** run a rules action immediately-or-timed; o = the object it was started from (for the visual state) */
  G.perform = function (id) { const r = R.perform(G.ps, id, G.ctx()); if (r.ok) after(r, null); return r; };
  G.start = function (id, o) {
    G.closeMenu();
    const r = R.perform(G.ps, id, G.ctx());
    if (!r.ok) return `${R.data.actions[id].label}：${r.reason}`;
    after(r, o);
    return null;
  };
  function after(r, o) {
    const vis = VIS[r.id] || {}, obj = vis.obj ? W.byId[vis.obj] : null;
    if (obj && vis.during) W.setState(obj, vis.during);
    const P = SP.player, sleep = !!vis.dark;
    if (r.minutes > 0) {
      const dur = sleep ? 3.2 : SP.clamp(r.minutes / 60 * 1.1, 0.45, 2.4);
      C.skipTo((C.min + r.minutes) % 1440, dur);
      G.activity = { id: r.id, label: r.label, text: r.text, vis, obj, t: 0, dur, sleep, minutes: r.minutes };
      if (vis.hide) P.hidden = true;
    } else finish({ vis, obj, text: r.text, id: r.id });
    W.logEvent(`李默：${r.label}`);
  }
  function finish(a) {
    if (a.obj && a.vis.after) W.setState(a.obj, a.vis.after);
    for (const [id, st] of Object.entries(a.vis.then || {})) if (W.byId[id]) W.setState(W.byId[id], st);
    SP.player.hidden = false;
    if (a.text) SP.toast(a.text);
    G.activity = null;
  }

  // ---------- action menu (several actions at one place) ----------
  const menuEl = document.getElementById("amenu");
  G.openMenu = function (o, opts) {
    G.menu = { o, opts };
    if (!menuEl) return;
    const name = o._name || (W.defs[o.interact] && W.defs[o.interact].name) || o.name || "";
    menuEl.innerHTML = `<div class="t">${name}</div>` + opts.map((a, i) =>
      `<button data-i="${i}" ${a.ok ? "" : "disabled"}><b>${i + 1}</b> ${a.label}${a.ok ? (a.minutes ? ` <i>${a.minutes >= 60 ? (a.minutes / 60).toFixed(a.minutes % 60 ? 1 : 0) + "小时" : a.minutes + "分钟"}</i>` : "") : ` <i>${a.reason}</i>`}</button>`).join("") +
      `<button data-i="x" class="x">取消</button>`;
    menuEl.classList.remove("hidden");
    menuEl.querySelectorAll("button").forEach((b) => b.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); G.pick(b.dataset.i === "x" ? -1 : +b.dataset.i); }));
  };
  G.closeMenu = function () { G.menu = null; if (menuEl) { menuEl.classList.add("hidden"); menuEl.innerHTML = ""; } };
  /** stair floor-select menu (a shortcut; walking onto a flight is the normal way). First entry = this flight's own way. */
  G.floors = function () {
    return Object.keys(SP.scenes).filter((k) => SP.scenes[k].floor != null).sort((a, b) => SP.scenes[a].floor - SP.scenes[b].floor);
  };
  G.openFloorMenu = function (o) {
    const cur = W.data.floor, up = W.portals.find((q) => q.id.startsWith("up_")), dn = W.portals.find((q) => q.id.startsWith("down_"));
    const label = (id) => { const f = SP.scenes[id].floor; return id === "roof" ? "天台" : `${f}F`; };
    const opts = G.floors().filter((id) => id !== W.sceneId).map((id) => {
      const f = SP.scenes[id].floor, above = f > cur, via = above ? up : dn;
      const spawn = id === "roof" ? (up && up.to === "roof" ? up.spawn : SP.scenes.roof.spawn) : above ? (up && up.spawn) : (dn && dn.spawn);
      return { id: "go_" + id, ok: !!spawn, reason: "走不过去", label: `${above ? "↑" : "↓"} ${label(id)}${id === "stair_2f" ? "（2F-02 家）" : ""}`, go: { to: id, spawn, door: id === "roof" ? "roof_hut" : null }, f };
    });
    // order: the flight's own neighbour floor first, then nearest-first in that direction, then the other way
    const dir = o.go === "down" ? -1 : 1;
    opts.sort((a, b) => { const da = (a.f - cur) * dir, db = (b.f - cur) * dir; return (da > 0 ? 0 : 100) + Math.abs(da) - ((db > 0 ? 0 : 100) + Math.abs(db)); });
    G.openMenu(Object.assign({}, o, { _name: `楼梯 · 现在 ${cur > 6 ? "天台" : cur + "F"}` }), opts);
    G.menu.o = o;
  };
  /** choose menu entry i (-1 closes; null = first available) */
  G.pick = function (i) {
    const m = G.menu; if (!m) return;
    if (i === -1) { G.closeMenu(); return; }
    const a = i == null ? m.opts.find((x) => x.ok) : m.opts[i];
    if (!a || !a.ok) return;
    if (a.go) { G.closeMenu(); G.go(a.go); return; }
    const msg = G.start(a.id, m.o); if (msg) SP.toast(msg);
  };

  // ---------- portals + transitions ----------
  G.go = function (p) {
    if (G.trans || G.activity) return;
    if (SP.player.carry) { SP.toast("先把单车停好再进楼"); G.armed = false; return; }
    G.closeMenu();
    G.trans = { t: 0, to: p.to, spawn: p.spawn, door: p.door, done: false };
    G.armed = false;
    const d = p.door && W.byId[p.door];
    if (d && (d.type === "i_door" || d.type === "i_roofhut")) { W.setState(d, "open"); }
    if (d && d.id === "unit_door") W.pulseDoor();
  };
  G.switchScene = function (to, spawn, door) {
    const P = SP.player;
    W.enter(to);
    SP.traffic.reset(); SP.fx.reset && SP.fx.reset();
    P.x = P.px = spawn[0]; P.y = P.py = spawn[1]; if (spawn[2]) P.setDir(spawn[2]);
    SP.render.build(); SP.actors.init(W.data); SP.cam.ready = false; G.armed = false; G.spawnAt = [P.x, P.y]; G.trans && (G.trans.done = true);
    for (const o of W.objects) if ((o.type === "i_door" || o.type === "i_roofhut") && o.state === "open") W.setState(o, "closed");
    const d = door && W.byId[door];
    if (d && (d.type === "i_door" || d.type === "i_roofhut")) { W.setState(d, "open"); d.closeAt = SP.now + 0.9; }
    if (d && d.id === "unit_door") W.pulseDoor();
    G.updateLights(true);
  };
  function inRect(r, x, y) { return x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3]; }

  // ---------- per fixed step ----------
  G.update = function (dt, gm) {
    const P = SP.player, ctx = G.ctx();
    if (G.activity) ctx.activity = G.activity.sleep ? G.activity.id : null;
    const evs = R.tick(G.ps, gm, ctx);
    for (const e of evs) {
      if (e.type === "need_low") { const t = NEED_TXT[e.need][e.level === "critical" ? 1 : 0]; SP.toast(t, 2600); W.logEvent(t); }
      else if (e.type === "rent_paid") { W.logEvent(`${e.late ? "补交" : "自动交了"}房租 ¥${e.amount}`); SP.toast(`交房租 ¥${e.amount}`, 2600); }
      else if (e.type === "rent_owed") { W.logEvent(`房租没交上！欠 ¥${e.owed}`); SP.toast(`钱不够交房租，欠 ¥${e.owed}`, 3200); }
    }
    G.speedMul = R.status(G.ps, ctx).speedMul;
    if (G.activity) { G.activity.t += dt; if (!C.ff) finish(G.activity); }
    if (G.trans) {
      const T = G.trans; T.t += dt;
      if (!T.done && T.t >= 0.24) { T.done = true; G.switchScene(T.to, T.spawn, T.door); }
      if (T.t >= 0.5) G.trans = null;
    }
    for (const o of W.objects) if (o.closeAt && SP.now > o.closeAt) { o.closeAt = 0; W.setState(o, "closed"); }
    // walk-in portals (armed again once 李默 has stepped out of every portal rect)
    if (!G.trans && !G.activity) {
      let inside = false;
      for (const p of W.portals) {
        if (!inRect(p.rect, P.x, P.y)) continue;
        inside = true;
        const want = p.dir === "N" ? G.vy > 0 : p.dir === "S" ? G.vy < 0 : true;
        // dwell: still pushing into the stair mouth with the stick held over from the last flight for a full second
        // is a deliberate "take this flight" -> fires anyway (never stuck pressing into a dead trigger), while a
        // stick merely carried through the fade can't bounce 李默 straight back (needs >= 1 s of pushing)
        G.dwell = want ? (G.dwell || 0) + dt : 0;
        if (want && (G.armed || G.dwell > 1.0)) { G.dwell = 0; G.go(p); break; }
      }
      // arrival latch: spawns are always outside the trigger rects, so only a stick still held from the previous
      // flight can carry 李默 back in. Re-arm as soon as the stick is released (anywhere — also while standing in a
      // rect), or it stops pushing north / outward, or he has walked 0.6 m from the arrival spot.
      // (The old rule needed "outside every rect" too: stopping inside a rect then locked the trigger for good.)
      if (!inside) G.dwell = 0;
      if (!G.armed) {
        const away = Math.hypot(P.x - G.spawnAt[0], P.y - G.spawnAt[1]) > 0.6;
        if (!G.moving || (!inside && (away || G.vy <= 0))) G.armed = true;
      }
    }
    if (G.menu && SP.state.near !== G.menu.o) G.closeMenu();
    G.updateLights(false);
  };
  /** stairwell sound-activated lights: on when it is dim and somebody is near / stamped, off after a while */
  G.updateLights = function (force) {
    for (const o of W.objects) if (o.auto_light) {
      const near = Math.hypot(SP.player.x - o.x, SP.player.y - o.y) < 5;
      const want = C.dark > 0.08 && (near || (o.wake && C.abs() - o.wake < 2)) ? "on" : "off";
      if (o.state !== want) W.setState(o, want);
    }
  };

  // ---------- overlay: transition fade, sleep darkness, activity caption ----------
  G.drawOverlay = function (ctx, cw, ch) {
    let a = 0;
    if (G.trans) { const t = G.trans.t; a = t < 0.24 ? t / 0.24 : 1 - (t - 0.24) / 0.26; }
    const A = G.activity;
    if (A && A.sleep) a = Math.max(a, Math.min(0.88, A.t / 0.5, (A.dur - A.t) / 0.4 + 0.1));
    if (a > 0.003) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = SP.clamp(a, 0, 1); ctx.fillStyle = "#07080c"; ctx.fillRect(0, 0, cw, ch); ctx.globalAlpha = 1; }
    if (A) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const k = SP.clamp(A.t / A.dur, 0, 1), w = Math.min(260, cw * 0.6), x = Math.round((cw - w) / 2), y = Math.round(ch * (A.sleep ? 0.46 : 0.2));
      ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#f4ead2";
      ctx.fillText(A.sleep ? `💤 ${A.label}…  ${C.clockLabel()}` : `${A.label}…  ${C.clockLabel()}`, Math.round(cw / 2), y - 8);
      ctx.fillStyle = "rgba(20,22,30,.8)"; ctx.fillRect(x, y, w, 6); ctx.fillStyle = "#e8b860"; ctx.fillRect(x, y, Math.round(w * k), 6);
    }
  };

  // ---------- needs HUD (DOM) ----------
  const hudEl = document.getElementById("needs");
  let hk = "";
  G.hud = function (force) {
    if (!hudEl) return;
    // cheap change key straight from the state; the status view (allocating) is only built when something changed
    const ps = G.ps, nd = ps.needs, ab = C.abs();
    const key = ((nd.hunger | 0) + ((nd.energy | 0) << 7) + ((nd.hygiene | 0) << 14) + ((nd.mood | 0) << 21)) + "|" + (ps.money | 0) + "|" + ps.owed + "|" + ((ab / 60) | 0) + "|" + (G.speedMul < 1) + "|" + (SP.world.interior ? 1 : 0);
    if (!force && key === hk) return; hk = key;
    const s = R.status(ps, G.ctx());
    const due = Math.max(0, G.ps.rentDue - C.abs()), dd = Math.floor(due / 1440), dh = Math.floor((due % 1440) / 60);
    hudEl.innerHTML = s.needs.map((n) => `<span class="nd ${n.level}" title="${n.label}"><em>${n.icon}</em><u><b style="width:${Math.round(n.value)}%"></b></u></span>`).join("") +
      `<span class="money">¥${Math.floor(s.money)}</span>` +
      `<span class="rent">${s.owed > 0 ? `欠租 ¥${s.owed}` : `房租 ${dd ? dd + "天" : ""}${dh}小时后`}</span>` +
      (s.conditions.length ? `<span class="cond">${s.conditions.join(" · ")}</span>` : "");
  };
})(window.SP);
