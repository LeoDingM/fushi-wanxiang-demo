/* scene-proto-45 · game (ported from the front-view line, same shared-rules): the gameplay layer between the engine-agnostic rules (../shared-rules/rules.js: needs, money,
   items, rent, timed actions) and this renderer: scene portals + fade transitions (street <-> stairwell <-> 2F-02),
   furniture actions (menu when a place offers several), timed activities that fast-forward the clock (sleep, cook,
   shower ...) with visual object states, auto stairwell lights, needs HUD, rent / need events -> toasts + log. */
(function (SP) {
  "use strict";
  const G = (SP.game = { ps: null, activity: null, trans: null, menu: null, armed: true });
  const R = (G.rules = window.FushiRules.create(window.FUSHI_RULES_DATA));
  const W = SP.world, C = SP.clock;
  // interact kind -> rules place
  const PLACE = { bed: "bed", stove: "stove", fridge: "fridge", shower: "shower", basin: "basin", toilet: "toilet", wardrobe: "wardrobe", pc: "pc", window_in: "window", shelf: "shelf", stall: "stall",
    washer: "washer", rack: "rack", roof_line: "roof_line" };
  // what the room looks like while / after an action runs (object ids in interiors.json)
  const VIS = {
    cook_noodles: { obj: "kitchen", during: "cooking", after: "off", then: { table: "meal" }, pose: { clip: "cook", dir: "W", at: [1.02, 1.25] } },
    cook_veg: { obj: "kitchen", during: "cooking", after: "off", then: { table: "meal" }, pose: { clip: "cook", dir: "W", at: [1.02, 1.25] } },
    snack: { obj: "fridge", during: "open", after: "closed" }, drink_fridge: { obj: "fridge", during: "open", after: "closed" },
    shower: { obj: "shower", during: "running", after: "dry", frosted: true, close: "bath_door", pose: { idle: true, dir: "S", at: [5.6, 3.5] } },
    eat_home: { obj: "table", after: "default", pose: { clip: "eat", dir: "N", at: "stool" } },
    browse: { obj: "desk", during: "on", after: "on", pose: { clip: "sit", dir: "S", at: "chair", intro: 1 } },
    change: { obj: "wardrobe", during: "open", after: "closed" },
    make_bed: { obj: "bed", after: "made" },
    wash_clothes: { obj: "washer", during: "running", after: "running" },
    sleep: { obj: "bed", during: "made", after: "messy", dark: true, pose: { clip: "lie", dir: "E", at: [1.3, 3.42], intro: 3, hold: true } },
    nap: { obj: "bed", during: "made", after: "messy", dark: true, pose: { clip: "lie", dir: "E", at: [1.3, 3.42], intro: 3, hold: true } },
  };
  const DOORS = { i_door: 1, i_roofhut: 1, i_baldoor: 1 };
  const NEED_TXT = { hunger: ["有点饿了", "饿得前胸贴后背"], energy: ["有点困了", "困得睁不开眼"], hygiene: ["身上有点黏", "该洗澡了，有味了"], mood: ["心情有点低落", "心情很糟"] };

  G.init = function () {
    G.spawnAt = [0, 0]; G.moving = false;
    G.ps = R.newState(C.abs()); G.activity = null; if (window.ACTORS.li_mo_home) SP.ensureActor("li_mo_home");
    // story start: last night's wash is still hanging on the 2F-02 balcony rack (collect it when dry)
    { const cl = G.ps.clothes; if (cl && !cl.rack.balcony) { const n = Math.min(4, cl.dirty || 0) || 3; cl.dirty = Math.max(0, (cl.dirty || 0) - n); cl.rack.balcony = { n, wet: 0.35, t: C.abs() }; } } G.trans = null; G.closeMenu(); G.armed = true; G.speedMul = 1;
  };
  G.flags = function () {
    const v = (SP.place.npcs || SP.actors.list).find((a) => a.id === "vendor"), bed = W.byId.bed;
    const tb = W.byId.table;
    return { vendor_open: !!(v && !v.hidden && v.act === "cook"), bed_messy: !!(bed && bed.state === "messy"), meal_ready: !!(tb && tb.state === "meal") };
  };
  G.ctx = function () {
    return { abs: C.abs(), flags: G.flags(), outdoors: !W.interior || !!W.data.outdoor, weather: C.intensity > 0.15 ? C.weather : "clear", intensity: C.intensity,
             sun: C.sun != null ? C.sun : 1 - (C.dark || 0), season: C.season, umbrella: !!SP.player.umbrella, running: !!SP.player.running };
  };
  G.busy = () => !!(G.activity || G.trans);
  // rules events -> toast + log line (WeChat-style messages from the landlord, bills, laundry)
  const EVT = {
    landlord_msg: (e) => `💬 ${R.data.lease.landlord}：${e.text}`,
    late_fee: (e) => e.days % 3 === 1 ? `房租逾期第${e.days}天，滞纳金 +¥${e.fee}` : null,
    evict_warning: (e) => `⚠ 房东：再不交房租就要收房了（逾期${e.days}天）`,
    evict_final: () => "⚠ 押金已被扣作房租，房东下了最后通牒",
    util_paid: (e) => `${R.payLabel(e.method)}代扣：水电燃气+物业 ¥${e.amount}`,
    util_billed: (e) => `水电燃气账单 ¥${e.amount}，余额不足，请尽快缴费`,
    shift_paid: (e) => `工资到账 ¥${e.pay}${e.holiday ? "（节假日三倍）" : ""}`,
    wash_done: () => "🧺 洗衣机「嘀嘀嘀」——衣服洗好了，记得晾",
    laundry_dry: (e) => e.where === "roof" ? "楼顶的衣服晒干了" : "阳台的衣服干了，可以收了",
    laundry_soaked: () => "下雨了！楼顶晾的衣服全淋湿了",
    clothes_dirty: () => "身上这件穿太久了，有股味儿，该换洗了",
  };
  /** dev time jumps (season switch): re-schedule rent/bills from the new date instead of charging months at once */
  G.onTimeJump = function () {
    const ps = G.ps, abs = C.abs(); if (!ps.lease) return;
    R.lease.init(ps, abs, ps.lease.plan); ps.owed = 0; if (ps.meter) ps.utilNext = R.utilities.nextBill(abs);
    if (ps.clothes) { ps.clothes.washer = null; for (const k in ps.clothes.rack) ps.clothes.rack[k].t = abs; }
  };
  // ---------- shared laundry state -> scene objects (washer, balcony pole, roof line, the building facade) ----------
  const CLOTH = [[214, 92, 70], [70, 96, 150], [236, 232, 220], [92, 128, 92], [60, 64, 74], [212, 180, 92]];
  const CLOTH_K = ["shirt", "pants", "shirt", "towel", "pants", "shirt"];
  const CLOTH_WH = { shirt: [0.5, 0.55], pants: [0.36, 0.85], towel: [0.42, 0.62] };
  /** rules rack {n, wet} -> laundry items [u along the line, w, h, colour, wet] (wet clothes are darker and drip) */
  function rackItems(L, r, n, byId) {
    const a = L.pts ? { x: L.pts[0], y: L.pts[1] } : byId[L.from], b = L.pts ? { x: L.pts[2], y: L.pts[3] } : byId[L.to];
    const len = a && b ? Math.hypot(b.x - a.x, b.y - a.y) : 2, out = [];
    for (let i = 0; i < n; i++) {
      const c = CLOTH[i % CLOTH.length], wk = 1 - 0.3 * r.wet, k = CLOTH_K[i % CLOTH_K.length], wh = CLOTH_WH[k];
      out.push([len * (i + 0.5) / n, wh[0], wh[1], `rgb(${c[0] * wk | 0},${c[1] * wk | 0},${c[2] * wk | 0})`, r.wet]);
    }
    return out;
  }
  G.syncLaundry = function () {
    const cl = G.ps.clothes; if (!cl) return;
    const abs = C.abs(), wo = W.byId.washer;
    if (wo) { const st = cl.washer ? (abs >= cl.washer.done ? "done" : "running") : "idle"; if (wo.state !== st) W.setState(wo, st); }
    const st0 = SP.place.street, worlds = [[W.laundry, W.byId]].concat(W.interior && st0 ? [[st0.laundry, st0.byId]] : []);
    for (const [list, byId] of worlds) for (const L of list || []) {
      if (!L.rack) continue;
      const r = cl.rack[L.rack], key = r ? r.n + ":" + Math.round(r.wet * 10) : "0";
      if (L._k !== key) {
        L._k = key;
        const n = r ? (L.half == null ? Math.min(r.n, L.max || 6) : Math.min(L.max || 3, Math.ceil((r.n - L.half) / 2))) : 0;
        L.items = n > 0 ? rackItems(L, r, n, byId) : [];
      }
    }
    // street facade twin of 2F-02's balcony (balc_S2F_3, enclosed glass b2): laundry when the room rack has clothes
    const sb = W.interior ? st0 && st0.byId : W.byId, bo = sb && sb.balc_S2F_3;
    if (bo) { const st = cl.rack.balcony ? "laundry" : "default"; if (bo.state !== st) { if (W.interior) bo.state = st; else W.setState(bo, st); } }
  };

  // ---------- interactions offered by the gameplay layer (world.actionFor asks here first) ----------
  const shutMsg = (o) => `${o.name}打烊了（营业 ${o.hours.join("–")}）`;
  /** Stage 5 integration hook: modules (store / metro / cbd) register SP.places[id] = { enter(o) } or an interior scene SP.scenes[id] */
  SP.places = SP.places || {};
  const placeReady = (id) => !!(id && (SP.places[id] || (SP.scenes[id] && SP.scenes[id].interior)));
  G.actionFor = function (o, kind) {
    const k = o.interact, place = PLACE[k] || (k === "eatery" ? o.place : null);
    if (k === "eatery" && o.state === "shut") return kind === "use" ? { label: shutMsg(o), do: "game" } : null;
    if (k === "metro") return kind !== "use" ? null : o.state === "shut" ? { label: `${o.name}：已收车（运营 ${o.hours.join("–")}）`, do: "game" } : { label: placeReady(o.to) ? `进站 · ${o.name}` : `${o.name}（地铁 · 即将开通）`, do: "game" };
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
      case "door": return kind === "use" && o.id === "unit_door" ? { label: "进单元楼（12号）", do: "game" } : undefined;
      case "idoor": return kind === "use" ? { label: (o.state === "open" ? "关上" : "打开") + (o.name || "门"), do: "game" } : null;
      case "bedlamp": return kind === "use" ? { label: o.state === "on" ? "关台灯" : "开台灯", do: "game" } : null;
      case "ac": return kind === "use" ? { label: o.state === "on" ? "关空调" : "开空调（1 kW）", do: "game" } : null;
      case "meter": return kind === "use" ? { label: "看电表 · 本月水电", do: "game" } : null;
      case "stairs": return kind === "use" ? { label: (o.go === "up" ? (o.to === "roof" ? "上天台" : "上楼") : "下楼") + " · 选楼层", do: "game" } : null;
      case "table": return kind === "use" ? (o.state === "meal" ? { label: "坐下吃饭", do: "game" } : { label: "看看", do: "game" }) : null;
    }
    return undefined;
  };
  G.use = function (o) {
    const k = o.interact, place = PLACE[k] || (k === "eatery" ? o.place : null);
    if (k === "eatery" && o.state === "shut") return shutMsg(o);
    if (k === "metro") {
      if (o.state === "shut") return `${o.name}已收车，明早 ${o.hours[0]} 首班`;
      if (SP.places[o.to]) return SP.places[o.to].enter(o) || null;
      if (placeReady(o.to)) { G.go({ to: o.to, spawn: SP.scenes[o.to].spawn, door: o.id }); return null; }
      return "井槐里站还在做最后的调试，围挡上写着「即将开通」";
    }
    if (place) {
      const opts = R.actionsAt(G.ps, place, G.ctx()).filter((a) => a.ok || a.reason !== "not here");
      if (k === "pc") {
        if (o.state === "on") opts.push({ id: "_pc_off", label: "关电脑（待机也耗电）", ok: true, fn: () => { W.setState(o, "off"); G.syncPower(); return "电脑关了，风扇声停了"; } });
        opts.push({ id: "_bill", label: "手机上看本月水电", ok: true, fn: () => { G.meterCard(); return null; } });
      }
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
      case "hall_light": G.noise(P0().x, P0().y, "stomp"); return "咚！（跺了一下脚）";
      case "neighbor_door": return G.knock(o);
      case "mailbox": {
        const L = R.data.lease, ub = G.ps.bills && G.ps.bills.find((b) => b.kind === "utilities");
        if (G.ps.owed > 0) return `信箱里塞了张纸条：「2F-02 房租 ¥${G.ps.owed} 已逾期，请尽快转账 —— ${L ? L.landlord : R.data.rent.landlord}」`;
        if (ub) return `信箱里有张缴费通知：${ub.label} ¥${ub.amount}，请在 APP 上缴清`;
        return L ? "2F-02 的信箱：一张社区核酸旧通知、两张宽带和搬家的小广告" : "2F-02 的信箱：一张水费单、两张小广告";
      }
      case "notice": if (o.note) return o.note;
        return R.data.lease ? `楼道公告：物业费 ¥${R.data.utilities.fixed.property.amount}/月 · 每月1日出水电燃气账单（APP 代扣）· 楼道禁止停放电动车、禁止飞线充电`
                            : `楼道公告：每周日 20:00 交房租（¥${R.data.rent.amount}）· 楼道禁止停放电动车`;
      case "stairs": G.openFloorMenu(o); return null;
      case "idoor": {                          // a real door: state + collision; never shut onto 李默
        const open = o.state !== "open", P = SP.player;
        if (!open && o.block && P.circles().some(([x, y, r]) => x + r > o.block[0] && x - r < o.block[2] && y + r > o.block[1] && y - r < o.block[3])) return "站在门口，关不上";
        W.setState(o, open ? "open" : "closed"); W.rebuildColliders(); W.logEvent(`李默${open ? "打开" : "关上"}了${o.name || "门"}`);
        return open ? "吱呀——门开了" : "门关上了";
      }
      case "bedlamp": W.setState(o, o.state === "on" ? "off" : "on"); G.syncPower(); return o.state === "on" ? "台灯亮了" : "台灯关了";
      case "ac": W.setState(o, o.state === "on" ? "off" : "on"); G.syncPower(); return o.state === "on" ? "空调「嘀」一声开了，出风口慢慢吹出风" : "空调关了";
      case "meter": G.meterCard(); return null;
      case "door": G.go({ to: "stair_1f", spawn: SP.scenes.stair_1f.spawn, door: "unit_door" }); return null;
      case "table": if (o.state === "meal") return G.start("eat_home", o); return "一张折叠小饭桌，旁边一张红色小圆凳";
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
  const q0 = (q) => !q.clip || !!SP.img.actor_li_mo_home;
  function after(r, o) {
    const vis = VIS[r.id] || {}, obj = vis.obj ? W.byId[vis.obj] : null;
    if (obj && vis.during) W.setState(obj, vis.during);
    const P = SP.player, sleep = !!vis.dark;
    if (r.minutes > 0) {
      const dur = sleep ? 3.2 : SP.clamp(r.minutes / 60 * 1.1, vis.pose ? 2.4 : 0.45, vis.pose ? 3.2 : 2.4);   // posed activities hold long enough to read
      C.skipTo((C.min + r.minutes) % 1440, dur);
      G.activity = { id: r.id, label: r.label, text: r.text, vis, obj, t: 0, dur, sleep, minutes: r.minutes };
      if (vis.hide) P.hidden = true;
      if (vis.pose && (q0(vis.pose) || vis.pose.idle) && (typeof vis.pose.at !== "string" || W.byId[vis.pose.at])) {   // sit / lie / cook / eat pose at the furniture
        const q = vis.pose, at = typeof q.at === "string" ? [W.byId[q.at].x, W.byId[q.at].y] : q.at;
        G.activity.back = [P.x, P.y, P.dir]; P.x = at[0]; P.y = at[1]; P.dir = P.target = q.dir; P.posed = true;
        if (q.clip) { P.homeClip = P.clip = q.clip; P.clipIntro = q.intro || 0; P.clipHold = !!q.hold; P.t = 0; P.frame = 0; }
      }
      if (vis.frosted) P.frosted = true;                                   // silhouette behind the frosted shower screen
      if (vis.close && W.byId[vis.close] && W.byId[vis.close].state === "open") { G.activity.reopen = vis.close; W.setState(W.byId[vis.close], "closed"); W.rebuildColliders(); }
    } else finish({ vis, obj, text: r.text, id: r.id });
    W.logEvent(`李默：${r.label}${r.paid ? `（${r.paid.method} ¥${r.paid.amount}）` : ""}`);
    if (r.paid) G.payCard({ amount: r.paid.amount, method: r.paid.method, to: PAYEE[R.data.actions[r.id].place] || PAYEE[R.data.actions[r.id].kind] || "商家", what: r.label.replace(/（¥\d+）/, "") });
  }
  const PAYEE = { stall: "王姐早点摊", store_hot: "邻里便利 24h", pc: "外卖平台", takeout: "外卖平台", street: "商场 · 烤鱼店", treat: "奶茶店" };
  const P0 = () => SP.player;
  /** WeChat / Alipay-style payment + message cards (DOM, top-centre, stack of 3) */
  const payEl = document.getElementById("paystack");
  G.payCard = function (c) {
    if (!payEl) return;
    const ali = /支付宝/.test(c.method || ""), el = document.createElement("div");
    el.className = "pay " + (c.msg ? "msg" : ali ? "ali" : "wx");
    if (c.msg) el.innerHTML = `<div class="hd"><i>微信</i>${c.from}</div><div class="bd">${c.msg}</div>`;
    else el.innerHTML = `<div class="hd"><i>${c.income ? "微信收款" : c.method || "微信支付"}</i>${c.income ? "到账" : "支付成功 ✓"}</div><div class="amt">${c.income ? "+" : "-"}¥${(+c.amount).toFixed(c.amount % 1 ? 2 : 0)}</div><div class="bd">${c.income ? c.from : "付款给 " + c.to}${c.what ? " · " + c.what : ""}</div>`;
    payEl.prepend(el); while (payEl.children.length > 3) payEl.lastChild.remove();
    setTimeout(() => el.classList.add("out"), c.ms || (c.msg ? 4200 : 2600)); setTimeout(() => el.remove(), (c.ms || (c.msg ? 4200 : 2600)) + 600);
  };
  /** noise -> the stairwell's sound-activated lights (声控灯): stomp, knock, a slammed door, running feet */
  G.t = 0; G.queue = [];
  G.later = (sec, fn) => G.queue.push([G.t + sec, fn]);              // game-time delays (deterministic in tests)
  G.noise = function (x, y, kind) {
    for (const o of W.objects) if (o.auto_light && Math.hypot(x - o.x, y - o.y) < 7) { o.wakeT = G.t; if (o.state !== "on" && G.lightWanted(o)) W.setState(o, "on"); }
    G.lastNoise = kind;
  };
  /** knocking on a neighbour door: who is home, time of day, knocked again -> reply after a beat (data: interiors45 knock) */
  G.knock = function (o) {
    G.noise(o.x, o.y - 0.4, "knock");
    const K = o.knock, m = C.min, late = m >= 22.5 * 60 || m < 7 * 60, key = o.id;
    G.knocks = G.knocks || {}; const prev = G.knocks[key]; G.knocks[key] = C.abs();
    W.logEvent(`李默敲了 ${o.name} 的门`);
    // occupancy from the household simulation (the same unit lights the facade window): home -> answers; asleep -> mostly
    // silence, sometimes a sleepy grumble; out / vacant -> nobody
    const hs = SP.households ? SP.households.state("b12_" + o.name) : { st: "home" }, say = (t, d) => G.later(d || 1.1, () => { SP.toast(t, 2600); W.logEvent(t); });
    G.lastKnock = { id: o.id, st: hs.st };
    if (!K || !K.who || hs.st === "vacant") { say((K && K.empty) || o.note || "没人应", 0.9); return "咚咚咚……"; }
    if (K.pet && hs.st !== "home") { const pl = K.day; G.later(1.2, () => { const l = pl[Math.floor(Math.random() * pl.length)]; SP.toast(`${o.name} ${K.who}：${l}`, 3000); W.logEvent(`${K.who}：${l}`); }); return "咚咚咚……"; }
    if (hs.st === "out") { say(K.away || "没人应。"); return "咚咚咚……"; }
    if (hs.st === "asleep") {
      if (Math.random() < 0.7) { say("没人应。门后黑着，大概睡了。"); return "咚咚咚……"; }
      const l = (K.night && K.night[0]) || "（迷迷糊糊）……谁啊？明天再说吧。";
      if (R.applyEffects) R.applyEffects(G.ps, { mood: -2 });
      G.later(1.6, () => { SP.toast(`${o.name} ${K.who}（被吵醒）：${l}`, 3200); W.logEvent(`${K.who}（被吵醒）：${l}`); }); return "咚咚咚……";
    }
    const again = prev != null && C.abs() - prev < 60, pool = again ? K.again : late ? K.night : K.day;
    const line = pool[Math.floor(Math.random() * pool.length)];
    if (late || again) R.applyEffects ? R.applyEffects(G.ps, { mood: -2 }) : (G.ps.needs.mood = Math.max(0, G.ps.needs.mood - 2));
    G.later(1.2, () => {
      if (K.opens && !again && W.byId[o.id] === o) { W.setState(o, "open"); o.closeAt = SP.now + 3.2; }
      SP.toast(`${o.name} ${K.who}：${line}`, 3400); W.logEvent(`${K.who}：${line}`);
    });
    return "咚咚咚……";
  };
  function finish(a) {
    if (a.obj && a.vis.after) W.setState(a.obj, a.vis.after);
    for (const [id, st] of Object.entries(a.vis.then || {})) if (W.byId[id]) W.setState(W.byId[id], st);
    SP.player.hidden = false;
    const P = SP.player;
    if (P.homeClip) { P.homeClip = P.clip = null; P.clipIntro = 0; P.clipHold = false; }
    if (P.posed) { P.posed = false; if (a.back) { P.x = a.back[0]; P.y = a.back[1]; P.dir = P.target = a.back[2]; } }
    P.frosted = false;
    if (a.reopen && W.byId[a.reopen]) { W.setState(W.byId[a.reopen], "open"); W.rebuildColliders(); }
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
    const cur = W.interior ? W.data.floor : 7, up = W.portals.find((q) => q.id.startsWith("up_")), dn = W.portals.find((q) => q.id.startsWith("down_"));
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
    if (a.fn) { G.closeMenu(); const t = a.fn(); if (t) SP.toast(t); return; }
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
    if (d && DOORS[d.type]) { W.setState(d, "open"); }
    if (d && d.id === "unit_door") { W.setState(d, "open"); d.closeAt = SP.now + 1.2; }
  };
  /** 2F-02's switchable appliances (from its live or saved object states) -> shared-rules power state */
  const PWR = { room_light: ["ceiling_light"], nightstand: ["desk_lamp"], desk: ["pc", "monitor"], ac: ["ac"] };
  G.syncPower = function () {
    if (!G.ps || !R.power) return;
    const st = SP.place.stateOf("room_2f02");
    for (const [id, aps] of Object.entries(PWR)) for (const a of aps) if (R.power.isOn(G.ps, a) !== (st[id] === "on")) R.power.set(G.ps, a, st[id] === "on");
  };
  /** meter / bill card: this month's kWh by appliance, water, gas, the estimate with tiered power price */
  G.meterCard = function () {
    const pv = R.utilities.preview(G.ps), P = pv.lines.find((l) => l.id === "power"), AP = R.data.appliances;
    const by = Object.entries((P && P.by) || {}).filter(([, v]) => v > 0.005).sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([k, v]) => `${(AP[k] && AP[k].label) || k} ${v.toFixed(2)}度`).join(" · ");
    const L = pv.lines.filter((l) => l.unit).map((l) => `${l.label} ${l.qty}${l.unit} ¥${l.amount.toFixed(2)}`).join("　");
    const nx = R.date(pv.next), now = R.power.watts(G.ps);
    const msg = `本月 ${L}<br>用电构成：${by || "—"}<br>当前功率 ${now} W · 下次扣费 ${nx.m}月${nx.d}日（含物业/宽带等固定费，预计合计 ¥${pv.total}）`;
    G.payCard({ msg, from: "国网电力 · 电费账单", ms: 7000 }); W.logEvent(`查看电表：本月用电 ${P ? P.qty : 0} 度，预计 ¥${P ? P.amount.toFixed(2) : 0}`);
  };
  /** shared-rules tick events -> toasts / log / pay cards (also used by the CBD host loop in main.js) */
  G.onRuleEvents = function (evs) {
    for (const e of evs) {
      if (e.type === "need_low") { const t = NEED_TXT[e.need][e.level === "critical" ? 1 : 0]; SP.toast(t, 2600); W.logEvent(t); }
      else if (e.type === "rent_paid") { W.logEvent(`${e.late ? "补交" : "自动交了"}房租 ¥${e.amount}`); SP.toast(`交房租 ¥${e.amount}`, 2600); }
      else if (e.type === "rent_owed") { W.logEvent(`房租没交上！欠 ¥${e.owed}`); SP.toast(`钱不够交房租，欠 ¥${e.owed}`, 3200); }
      else if (e.type === "landlord_msg") { G.payCard({ msg: e.text, from: R.data.lease.landlord }); W.logEvent(EVT.landlord_msg(e)); }
      else if (EVT[e.type]) { const t = EVT[e.type](e); if (t) { SP.toast(t, 3000); W.logEvent(t); } }
      if (e.type === "rent_paid") G.payCard({ amount: e.amount, method: R.data.payment.transfer || "微信转账", to: R.data.lease.landlord, what: "房租" });
      if (e.type === "util_paid") G.payCard({ amount: e.amount, method: R.payLabel(G.ps) + "代扣", to: "物业 / 水电燃气", what: e.label });
      if (e.type === "shift_paid") G.payCard({ amount: e.pay, income: true, from: "邻里便利 · 工资" });
    }
  };
  G.switchScene = function (to, spawn, door) {
    const P = SP.player;
    if (W.sceneId === "room_2f02" && to !== "room_2f02") {     // leaving the flat: a low-key reminder if things stay on
      const on = Object.keys(G.ps.power ? G.ps.power.on : {}).filter((k) => R.data.appliances[k] && !R.data.appliances[k].always);
      if (on.length) { const w = on.reduce((t, k) => t + R.data.appliances[k].w, 0); G.later(1.0, () => SP.toast(`家里${on.map((k) => R.data.appliances[k].label.replace(/（.*）/, "")).join("、")}还开着（约 ${w} W，每小时 ${(w / 1000).toFixed(2)} 度）`, 2600)); }
    }
    SP.place.enter(to, spawn);
    G.armed = false; G.spawnAt = [P.x, P.y]; G.trans && (G.trans.done = true); G.lastXY = [P.x, P.y];
    G.lastGo = { to, t: SP.now }; G.transits = (G.transits || 0) + 1;
    if (W.interior) G.noise(P.x, P.y, "door");                         // the door bangs shut behind him: hall light wakes
    for (const o of W.objects) if (DOORS[o.type] && o.state === "open") W.setState(o, "closed");
    const d = door && W.byId[door];
    if (d && DOORS[d.type]) { W.setState(d, "open"); d.closeAt = SP.now + 0.9; }
    G.updateLights(true);
  };
  // "pushing into" a trigger = the stick / keys point that way (not the velocity: pressed against the flight's end it is 0)
  const push = (p) => {
    const w = SP.state.inputW; if (!w) return false;
    return p.dir === "N" ? w[1] > 0.3 : p.dir === "S" ? w[1] < -0.3 : p.dir === "E" ? w[0] > 0.3 : p.dir === "W" ? w[0] < -0.3 : true;
  };
  function inRect(r, x, y) { return x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3]; }

  // ---------- per fixed step ----------
  G.update = function (dt, gm) {
    const P = SP.player, ctx = G.ctx();
    G.t += dt;
    if (G.queue.length) { const due = G.queue.filter((q) => q[0] <= G.t); G.queue = G.queue.filter((q) => q[0] > G.t); for (const q of due) q[1](); }
    if (W.interior && P.running && P.moving && (G._runN = (G._runN || 0) + dt) > 0.4) { G._runN = 0; G.noise(P.x, P.y, "run"); }
    // velocity for the directional walk-in triggers (N / S / E / W)
    const L0 = G.lastXY || [P.x, P.y]; G.vx = (P.x - L0[0]) / Math.max(dt, 1e-3); G.vy = (P.y - L0[1]) / Math.max(dt, 1e-3); G.lastXY = [P.x, P.y];
    G.moving = !!P.moving || Math.hypot(G.vx, G.vy) > 0.05;
    // walk speed on the stair flights (no running into a stair mouth)
    SP.state.slowZone = !!(W.interior && W.sceneId.startsWith("stair") && P.x > 4.9 && P.y > 0.2);
    if (G.activity) ctx.activity = G.activity.sleep ? G.activity.id : null;
    G.syncPower();
    G.onRuleEvents(R.tick(G.ps, gm, ctx));
    G.speedMul = R.status(G.ps, ctx).speedMul;
    G.syncLaundry();
    if (G.activity) { G.activity.t += dt; if (!C.ff) finish(G.activity); }
    if (G.trans) {
      const T = G.trans; T.t += dt;
      if (!T.done && T.t >= 0.24) { T.done = true; G.switchScene(T.to, T.spawn, T.door); }
      if (T.t >= 0.5) G.trans = null;
    }
    for (const o of W.objects) if (o.closeAt && SP.now > o.closeAt) { o.closeAt = 0; W.setState(o, "closed"); }
    // walk-in portals (armed again once 李默 has stepped out of every portal rect)
    if (!G.trans && !G.activity && !SP.state.auditLock) {
      let inside = false;
      for (const p of W.portals) {
        if (!inRect(p.rect, P.x, P.y)) continue;
        inside = true;
        const want = push(p);
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
        // (frozen during the fade != released: only a real release of the stick / keys counts as "not moving")
        if (!SP.state.inputOn || (!inside && G.moving && (away || !W.portals.some(push)))) G.armed = true;
      }
    }
    if (G.menu && SP.state.near !== G.menu.o) G.closeMenu();
    G.updateLights(false);
  };
  /** stairwell sound-activated lights: on when it is dim and somebody is near / stamped, off after a while */
  /** 声控灯: dark enough (windowless 1F hall: always) AND a noise in the last 25 s (stomp / knock / door / running feet) */
  G.lightWanted = (o) => C.dark > 0.08 || W.sceneId === "stair_1f";
  G.updateLights = function (force) {
    for (const o of W.objects) if (o.auto_light) {
      const want = G.lightWanted(o) && o.wakeT != null && G.t - o.wakeT < 25 ? "on" : "off";
      if (o.state !== want) W.setState(o, want);
    }
  };

  // ---------- overlay: transition fade, sleep darkness, activity caption ----------
  G.drawOverlay = function (ctx, cw, ch) {
    let a = 0;
    if (G.trans) { const t = G.trans.t; a = t < 0.24 ? t / 0.24 : 1 - (t - 0.24) / 0.26; }
    const A = G.activity;
    if (A && A.sleep) a = Math.max(a, Math.min(SP.player.homeClip ? 0.5 : 0.88, A.t / 0.5, (A.dur - A.t) / 0.4 + 0.1));
    if (a > 0.003) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = SP.clamp(a, 0, 1); ctx.fillStyle = "#07080c"; ctx.fillRect(0, 0, cw, ch); ctx.globalAlpha = 1; }
    if (A) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const k = SP.clamp(A.t / A.dur, 0, 1), w = Math.min(260, cw * 0.6), x = Math.round((cw - w) / 2), y = Math.round(A.sleep ? ch * 0.46 : ch * 0.84);   // bottom centre: clear of the needs / rent HUD rows and of the room
      ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#f4ead2";
      ctx.fillText(A.sleep ? `💤 ${A.label}…  ${C.clockLabel()}` : `${A.label}…  ${C.clockLabel()}`, Math.round(cw / 2), y - 8);
      ctx.fillStyle = "rgba(20,22,30,.8)"; ctx.fillRect(x, y, w, 6); ctx.fillStyle = "#e8b860"; ctx.fillRect(x, y, Math.round(w * k), 6);
    }
  };

  // ---------- needs HUD (DOM) ----------
  const hudEl = document.getElementById("needs");
  let hk = "";
  function rentTxt(s, dd, dh) {
    if (!s.lease) return s.owed > 0 ? `欠租 ¥${s.owed}` : `房租 ${dd ? dd + "天" : ""}${dh}小时后`;
    const L = s.lease;
    if (s.owed > 0) return `欠租 ¥${s.owed}${L.lateDays ? `·逾期${L.lateDays}天` : ""}`;
    return dd >= 1 ? `房租 ¥${L.amount} · ${dd}天后` : `今天交房租 ¥${L.amount}`;
  }
  G.hud = function (force) {
    if (!hudEl) return;
    // cheap change key straight from the state; the status view (allocating) is only built when something changed
    const ps = G.ps, nd = ps.needs, ab = C.abs();
    const key = ((nd.hunger | 0) + ((nd.energy | 0) << 7) + ((nd.hygiene | 0) << 14) + ((nd.mood | 0) << 21)) + "|" + (ps.money | 0) + "|" + ps.owed + "|" + ((ab / 60) | 0) + "|" + (G.speedMul < 1) + "|" + (SP.world.interior ? 1 : 0) +
      "|" + (ps.clothes ? ps.clothes.clean + ":" + ps.clothes.dirty + ":" + (ps.clothes.worn_h | 0) : "");
    if (!force && key === hk) return; hk = key;
    const s = R.status(ps, G.ctx());
    const due = Math.max(0, G.ps.rentDue - C.abs()), dd = Math.floor(due / 1440), dh = Math.floor((due % 1440) / 60);
    hudEl.innerHTML = s.needs.map((n) => `<span class="nd ${n.level}" title="${n.label}"><em>${n.icon}</em><u><b style="width:${Math.round(n.value)}%"></b></u></span>`).join("") +
      `<span class="money">¥${Math.floor(s.money)}</span>` +
      `<span class="rent">${rentTxt(s, dd, dh)}</span>` +
      (s.conditions.length ? `<span class="cond">${s.conditions.join(" · ")}</span>` : "");
  };
})(window.SP);
