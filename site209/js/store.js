/* 浮世万象 · scene-proto-45 · 24便利店 (store_24) module: shop + window bar + store NPCs + the clerk shift job.
   Two layers:
   1) FushiStore.create(R) — engine-free store rules on top of shared-rules (R = FushiRules.create(data)): prices from
      rules.prices (store section rules.store), basket + checkout (微信支付 / 支付宝), hot food via the existing actions
      buy_oden / buy_coffee, microwave = existing heat_bento_store, window-bar meal = existing eat_bar (flag bar_meal), other
      goods eaten at the bar with rules.store.goods[*].eat; shift job = rules R.job (hire, book 排班, clock in/out, task loop,
      late cut, no-show strikes, pay). Also runs in node (tools/test_store.js).
   2) SP.store (browser) — install(): registers the scene (window.STORE45.store_24), stacks the kit_store atlas (js/store_kit.js),
      hooks into SP.game (actionFor / use / pick / update / flags) and SP.env (cool LED lights + bright ambient in the store),
      the street door of the 24便利店 (scene.json shop24_S1F_1_shop) → store_24, store NPCs (staff on schedule + shoppers),
      shift HUD. The core needs no code change: load the scripts (see STORE_READY.md). */
(function (root) {
  "use strict";
  const DAY = 1440;
  function create(R) {
    const D = R.data, S = D.store || {}, goods = S.goods || {};
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const F = {};
    /** price of a key: rules.prices groups first (single source), then items / actions */
    F.price = function (key) {
      for (const [g, tab] of Object.entries(D.prices || {})) if (g[0] !== "_" && tab && typeof tab === "object" && tab[key] != null) return tab[key];
      if (D.items[key]) return D.items[key].price;
      if (D.actions[key]) return D.actions[key].cost || 0;
      return null;
    };
    F.goods = (where) => Object.entries(goods).filter(([, g]) => !where || g.where === where).map(([id, g]) => Object.assign({ id, price: F.price(g.price_key || id) }, g));
    F.state = (ps) => (ps.store = ps.store || { basket: [], bag: {}, hot: 0, visits: 0 });
    const effects = (ps, eff, k) => { for (const [n, v] of Object.entries(eff || {})) ps.needs[n] = clamp(ps.needs[n] + v * (k == null ? 1 : k), 0, 100); };
    F.basketTotal = (ps) => Math.round(F.state(ps).basket.reduce((t, id) => t + F.price(goods[id].price_key || id), 0) * 100) / 100;
    F.pick = function (ps, id) {
      const g = goods[id]; if (!g) return { ok: false, reason: "店里没有这个" };
      const st = F.state(ps); if (st.basket.length >= 8) return { ok: false, reason: "篮子满了，先去结账" };
      st.basket.push(id); return { ok: true, label: g.label, total: F.basketTotal(ps) };
    };
    F.unpick = (ps) => { F.state(ps).basket = []; return { ok: true }; };
    /** pay the basket at the counter: method wechat | alipay; inventory goods -> ps.items, the rest -> the store bag (eat here) */
    F.checkout = function (ps, method, abs) {
      const st = F.state(ps); if (!st.basket.length) return { ok: false, reason: "篮子是空的" };
      const total = F.basketTotal(ps); if (ps.money < total) return { ok: false, reason: `钱不够（要 ¥${total}）`, total };
      if (method) ps.pay = method;
      ps.money = Math.round((ps.money - total) * 100) / 100; ps.stats.spent += total;
      const items = st.basket.slice(); st.basket = [];
      for (const id of items) { const g = goods[id]; if (g.item) R.addItem(ps, g.item, 1); else st.bag[id] = (st.bag[id] || 0) + 1; }
      st.visits++;
      R._note(ps, { type: "store_checkout", total, items, method: R.payLabel(ps) }, abs || 0);
      return { ok: true, total, items, method: R.payLabel(ps), labels: items.map((i) => goods[i].label) };
    };
    /** hot food / coffee paid on the spot (oden -> buy_oden, americano -> buy_coffee, latte = store-only) */
    F.buyHot = function (ps, id, abs, method) {
      const h = (S.hot || {})[id]; if (!h) return { ok: false, reason: "没有这个" };
      if (method) ps.pay = method;
      if (h.action) { const r = R.perform(ps, h.action, { abs }); return r.ok ? Object.assign(r, { hot: id }) : r; }
      const cost = F.price(h.price_key); if (ps.money < cost) return { ok: false, reason: "钱不够" };
      ps.money -= cost; ps.stats.spent += cost; effects(ps, h.effects);
      return { ok: true, id, label: h.label, minutes: h.minutes, text: `${h.label}，热乎的`, paid: { amount: cost, method: R.payLabel(ps) }, hot: id };
    };
    /** microwave: the existing heat_bento_store action (consumes a bento from the inventory) -> a hot bento for the bar */
    F.heat = function (ps, abs) {
      const r = R.perform(ps, "heat_bento_store", { abs }); if (!r.ok) return r;
      F.state(ps).hot++; return r;
    };
    F.flags = (ps) => ({ bar_meal: F.state(ps).hot > 0 });
    /** what you can eat at the bar: the hot bento (eat_bar), bag goods, cold inventory goods that are store goods */
    F.edible = function (ps) {
      const st = F.state(ps), out = [];
      if (st.hot > 0) out.push({ id: "eat_bar", label: "热便当", minutes: D.actions.eat_bar.minutes });
      for (const [id, n] of Object.entries(st.bag)) if (n > 0 && goods[id] && goods[id].eat) out.push({ id, label: goods[id].label, minutes: goods[id].eat_min, n });
      for (const id of ["bread", "drink", "milk", "bento"]) if ((ps.items[id] || 0) > 0 && goods[id].eat) out.push({ id: "inv:" + id, label: goods[id].label + (id === "bento" ? "（凉的）" : ""), minutes: goods[id].eat_min, n: ps.items[id] });
      return out;
    };
    F.eat = function (ps, id, abs) {
      const st = F.state(ps);
      if (id === "eat_bar") { const r = R.perform(ps, "eat_bar", { abs, flags: F.flags(ps) }); if (r.ok) st.hot--; return r; }
      if (id.startsWith("inv:")) {
        const k = id.slice(4), g = goods[k]; if (!(ps.items[k] > 0)) return { ok: false, reason: "没有了" };
        ps.items[k]--; effects(ps, g.eat, g.needs_heat ? 0.8 : 1); if (g.needs_heat) effects(ps, { mood: -2 });
        return { ok: true, id, label: `吃${g.label}`, minutes: g.eat_min, text: g.needs_heat ? "凉便当，硬邦邦的……下次该热一下" : `吃完了${g.label}` };
      }
      const g = goods[id]; if (!g || !(st.bag[id] > 0)) return { ok: false, reason: "没有了" };
      st.bag[id]--; effects(ps, g.eat);
      return { ok: true, id, label: `吃${g.label}`, minutes: g.eat_min, text: `${g.label}，吃完了` };
    };
    // ---------------- shift job (rules R.job) ----------------
    const SH = S.shift || {};
    F.apply = (ps, abs) => R.job.hire(ps, abs);
    F.slots = (ps, abs) => R.job.slots(ps, abs);
    F.book = (ps, abs, id, start) => R.job.book(ps, abs, id, start);
    F.canClockIn = (ps, abs) => R.job.canStart(ps, abs);
    F.clockIn = function (ps, abs) {
      const r = R.job.start(ps, abs); if (!r.ok) return r;
      const J = R.job.def(), lateMin = Math.max(0, r.shift.late - J.late_grace_min);
      return Object.assign(r, { lateMin, cut: Math.round(lateMin * J.late_cut_per_min * 100) / 100 });
    };
    /** clock out: at / after the end = full pay, earlier = 早退 (early_leave_mul, no bonus / staff meal) */
    F.clockOut = function (ps, abs) {
      if (!ps.shift) return { ok: false, reason: "没在上班" };
      const why = abs >= ps.shift.end ? "done" : "left"; const r = R.job.finish(ps, abs, why); return Object.assign(r, { why });
    };
    F.openTasks = (ps) => R.job.open(ps);
    /** do a task: kind (+ target for restock); quality 1.0 if done within half its deadline, else 0.7 */
    F.doTask = function (ps, kind, target, abs) {
      const t = R.job.open(ps).find((x) => x.kind === kind && (!target || !x.target || x.target === target));
      if (!t) return { ok: false, reason: "现在没有这个活" };
      const q = abs - t.at <= (t.deadline - t.at) / 2 ? (SH.quality_fast || 1) : (SH.quality_slow || 0.7);
      const r = R.job.complete(ps, t.id, q, abs);
      return Object.assign(r, { task: t, quality: q, minutes: kind === "restock" ? SH.restock_min : kind === "mop" ? SH.mop_min : kind === "oden" ? SH.oden_min : 0,
                                seconds: kind === "checkout" ? (t.items || 1) * (SH.scan_s || 0.6) : 0 });
    };
    F.shiftText = function (ps, abs) {
      const s = ps.shift; if (!s) return null;
      const left = Math.max(0, s.end - abs), hh = (m) => `${String(Math.floor((m % DAY) / 60)).padStart(2, "0")}:${String(Math.floor(m % 60)).padStart(2, "0")}`;
      return { title: `${s.label} ${hh(s.start)}–${hh(s.end)} · 还剩 ${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, "0")}${s.late > (R.job.def().late_grace_min || 0) ? ` · 迟到${Math.round(s.late)}分` : ""}`,
               tasks: R.job.open(ps).map((t) => ({ id: t.id, kind: t.kind, label: t.kind === "restock" ? `补货 · ${(SH.targets || {})[t.target] || t.target}` : t.kind === "checkout" ? `收银（${t.items}件）` : t.label, mins: Math.max(0, Math.round(t.deadline - abs)) })),
               done: s.done, failed: s.failed };
    };
    return F;
  }
  const FushiStore = { create };
  if (typeof module !== "undefined" && module.exports) module.exports = FushiStore;
  root.FushiStore = FushiStore;
  if (!root.SP) return;

  // =====================================================================================================================
  // browser glue
  const SP = root.SP, ST = (SP.store = { installed: false, npcs: [], seen: 0 });
  const SID = "store_24", SID2 = "store_24_staff";
  const STREET_DOOR_ID = "shop24_S1F_1_shop";
  ST.install = function () {
    if (ST.installed) return; ST.installed = true;
    const G = SP.game, W = SP.world, C = SP.clock, R = G.rules, F = (ST.F = create(R));
    ST.scene = window.STORE45 && window.STORE45[SID];
    if (!ST.scene) { console.warn("store: store45.js not loaded"); return; }
    SP.scenes[SID] = ST.scene;
    ST.back = window.STORE45[SID2]; if (ST.back) SP.scenes[SID2] = ST.back;      // 员工室 back room (lockers / uniform / schedule board)
    // atlas: stack kit_store under kit_int only after the interior sheets exist.
    // The street first frame does not download kit_int; composing before that throws on a missing image and blocks the first paint.
    if (window.STORE_KIT && SP.load) {
      const L0 = SP.load;
      SP.load = (list) => L0(list).then(() => {
        if (!SP.img.int_atlas || !SP.img.int_emit) return;
        return window.STORE_KIT.compose(SP);
      });
    }
    const inStore = () => W.interior && W.sceneId === SID;
    ST.inStore = inStore;
    const inBack = () => W.interior && W.sceneId === SID2;
    ST.inBack = inBack;
    const hasActor = (n) => !!(window.ACTORS && window.ACTORS[n]);
    const sheet = (spec) => (spec.sprite && hasActor(spec.sprite) ? spec.sprite : spec.sprite_fallback || spec.sprite);
    const ps = () => G.ps, abs = () => C.abs();
    const P = () => SP.player;
    const toast = (t, ms) => SP.toast && SP.toast(t, ms);
    const log = (t) => W.logEvent && W.logEvent(t);
    const staffSide = () => P().x > 6.75 && P().y < 3.4;
    const SEAT_LIFT = 0.33;                 // st_stool seat 0.78 m - li_mo_home "eat" clip seat 0.45 m
    const PAYEE = (R.data.store && R.data.store.payee) || "邻里便利 24h";
    const methodLabel = (m) => (R.data.payment.methods[m] || {}).label || m;
    const yuan = (v) => "¥" + (Math.round(v * 100) / 100);

    // ---------- timed store activity through the core's activity runner (clock skip + caption) ----------
    function activity(label, minutes, opt) {
      opt = opt || {};
      const dur = SP.clamp(opt.dur || minutes / 60 * 1.1, opt.pose ? 2.4 : 0.6, 3.2);       // posed (bar stool) holds long enough to read, like the core
      if (minutes > 0) C.skipTo((C.min + minutes) % 1440, dur);
      const obj = opt.obj ? W.byId[opt.obj] : null;
      if (obj && opt.during) W.setState(obj, opt.during);
      G.activity = { id: "store:" + label, label, text: opt.text, vis: { after: opt.after }, obj, t: 0, dur, minutes };
      if (opt.pose) {
        const q = opt.pose; G.activity.back = [P().x, P().y, P().dir]; P().x = q.at[0]; P().y = q.at[1]; P().dir = P().target = q.dir; P().posed = true;
        if (q.z) { P().z = q.z; P().storeZ = true; }                       // sit ON the bar stool (seat 0.78 m vs the 0.45 m chair the clip was made for)
        if (q.z && hasActor("li_mo_bar")) { P().clip = q.clip; P().clipIntro = 0; P().clipHold = false; P().t = 0; P().frame = 0; }   // li_mo_bar: eat facing the window (S/SW/SE)
        else if (q.clip && SP.img.actor_li_mo_home) { P().homeClip = P().clip = q.clip; P().clipIntro = 0; P().clipHold = false; P().t = 0; P().frame = 0; }
      }
      if (opt.done) ST.pendingDone = { act: G.activity, fn: opt.done };
    }
    function pay(r, to, what) { if (r && r.paid) G.payCard({ amount: r.paid.amount, method: r.paid.method, to: to || PAYEE, what }); }
    function menu(o, title, opts) { G.openMenu(Object.assign({}, o, { _name: title }), opts); G.menu.o = o; G.menu.store = true; }

    // ---------- store NPCs ----------
    const NS = ST.scene.store_npcs;
    function mkActor(id, sprite, x, y, dir, name) {
      const a = new SP.Actor({ id, set: sprite, x, y, radius: 0.22, speed: 1.15, height: 1.8 }); a.setDir(dir || "S"); a.name = name; a.storeNpc = true;
      if (SP.ensureActor && !SP.img["actor_" + sprite]) SP.ensureActor(sprite);
      return a;
    }
    function staffOnDuty(min) { const h = min / 60; return NS.staff.find((s) => s.hours.some(([a, b]) => h >= a && h < b)) || NS.staff[0]; }
    ST.shoppers = {};               // id -> {next: abs minute of the next visit}
    function spawnShopper(spec, forTask) {
      const a = mkActor(spec.id + (forTask ? "_q" + forTask : ""), sheet(spec), spec.route[0][0], spec.route[0][1], "N", spec.name);
      a.brain = { route: forTask ? [spec.route[0], [5.55, 1.75], [5.55, 2.3]] : spec.route, i: 1, dwell: 0, spec, task: forTask || null, stuck: 0 };
      if (!SP.actors.shapeClear(a, a.x, a.y)) return null;
      ST.npcs.push(a); SP.actors.list.push(a); return a;
    }
    function despawn(a) { ST.npcs = ST.npcs.filter((x) => x !== a); SP.actors.list = SP.actors.list.filter((x) => x !== a); }
    function ensureStaff() {
      const want = ps().shift ? null : staffOnDuty(C.min);           // while 李默 works the counter, the boss steps back
      let s = ST.npcs.find((a) => a.staff);
      const spec = staffOnDuty(C.min);
      if (s && s.specId !== spec.id) { despawn(s); s = null; }
      if (!s) { s = mkActor(spec.id, sheet(spec), spec.home[0], spec.home[1], spec.home[2], spec.name); s.staff = true; s.specId = spec.id; s.spec = spec; ST.npcs.push(s); SP.actors.list.push(s); }
      s.goal = want ? "home" : "back";
    }
    function walkTo(a, pts, dt) {          // simple waypoint follower with the core's collision-safe move
      const b = a.brain || (a.brain = {});
      const t = pts[0]; if (!t) { a.update(dt, false, a.dir, 0); return true; }
      const dx = t[0] - a.x, dy = t[1] - a.y, d = Math.hypot(dx, dy);
      if (d < 0.12) { pts.shift(); a.update(dt, false, a.dir, 0); return !pts.length; }
      const step = Math.min(a.speed * dt, d), vx = dx / d * step, vy = dy / d * step;
      const m = SP.actors.move(a, vx, vy);
      if (m > 1e-5) { b.stuck = 0; a.update(dt, true, SP.dirFromWorld(vx, vy), m); } else { b.stuck = (b.stuck || 0) + dt; a.update(dt, false, a.dir, 0); }
      return false;
    }
    function updateNpcs(dt) {
      ensureStaff();
      const now = abs(), h = C.min / 60;
      // staff: home <-> back via the lane north of the counter
      for (const a of ST.npcs) if (a.staff) {
        const sp = a.spec, at = a.goal === "back" ? sp.back : sp.home;
        if (!a.path || a.pathGoal !== a.goal) { a.pathGoal = a.goal; a.path = Math.hypot(a.x - at[0], a.y - at[1]) < 0.2 ? [] : [sp.via.slice(), at.slice(0, 2)]; }
        if (walkTo(a, a.path, dt) && !a.moving) a.target = at[2];
      }
      // shoppers on their schedules
      for (const spec of NS.shoppers) {
        const S0 = ST.shoppers[spec.id] || (ST.shoppers[spec.id] = { next: now + 2 + Math.random() * 10 });
        const open = spec.hours.some(([a, b]) => h >= a && h < b);
        if (open && now >= S0.next && !ST.npcs.some((a) => a.brain && a.brain.spec === spec && !a.brain.task)) {
          if (spawnShopper(spec)) S0.next = now + spec.every_min[0] + Math.random() * (spec.every_min[1] - spec.every_min[0]);
          else S0.next = now + 1;
        }
      }
      // checkout tasks of 李默's shift -> a customer walks up to the counter and waits
      const sh = ps().shift;
      if (sh) for (const t of sh.tasks) if (t.kind === "checkout" && !t.done && !t.failed && !ST.npcs.some((a) => a.brain && a.brain.task === t.id)) {
        if (!ST.npcs.some((a) => a.brain && a.brain.task)) spawnShopper(NS.shoppers[(+t.id.slice(1)) % NS.shoppers.length], t.id);
      }
      for (const a of ST.npcs.slice()) {
        if (a.staff) continue;
        const b = a.brain;
        if (b.dwell > 0) { b.dwell -= dt; a.update(dt, false, a.dir, 0); if (b.dwell <= 0 && b.atCounter) { b.atCounter = false; } continue; }
        if (b.task) {          // waits at the counter until served (or the task expires)
          const t = sh && sh.tasks.find((x) => x.id === b.task);
          if (!t || t.done || t.failed) { if (!b.leaving) { b.leaving = true; b.route = [[5.55, 1.75], [4.5, 1.05], [4.5, 0.35]]; b.i = 0; if (t && t.failed) { a.bubble = { t: 2, text: "…" }; log(`${a.name}等不及走了`); } } }
          else if (b.i >= b.route.length) { a.target = "E"; a.update(dt, false, a.dir, 0); continue; }
        }
        if (b.i >= b.route.length) { despawn(a); continue; }
        const tg = b.route[b.i], d = Math.hypot(tg[0] - a.x, tg[1] - a.y);
        if (d < 0.14) {
          const dw = b.spec.dwell && !b.task && !b.leaving ? b.spec.dwell[String(b.i)] : 0;
          if (dw) { b.dwell = dw; if (Math.abs(tg[0] - 5.55) < 0.01) { a.target = "E"; b.atCounter = true; const st = ST.npcs.find((q) => q.staff); if (st && !sh) { st.bubble = { t: 1.4, text: "¥" }; } } }
          b.i++; if (!b.task && !b.leaving && b.i >= b.route.length) { b.route = b.route.concat([[4.5, 0.35]]); }
          continue;
        }
        const step = Math.min(a.speed * dt, d), vx = (tg[0] - a.x) / d * step, vy = (tg[1] - a.y) / d * step;
        const m = SP.actors.move(a, vx, vy);
        if (m > 1e-5) { b.stuck = 0; a.update(dt, true, SP.dirFromWorld(vx, vy), m); }
        else { b.stuck += dt; a.update(dt, false, a.dir, 0); if (b.stuck > 4) { b.i++; b.stuck = 0; } }
      }
    }

    // ---------- shift <-> store objects ----------
    const TARGET_OBJ = { shelf_a: "shelf_a", shelf_b: "shelf_b", cooler: "cooler" };
    function syncShiftWorld() {
      const sh = ps().shift, open = sh ? R.job.open(ps()) : [];
      const want = { shelf_a: "full", shelf_b: "full", cooler: "full", oden: "full", bins: "clean" };
      for (const t of open) { if (t.kind === "restock") want[TARGET_OBJ[t.target]] = "low"; if (t.kind === "oden") want.oden = "low"; if (t.kind === "mop") want.bins = "messy"; }
      for (const [id, s] of Object.entries(want)) { const o = W.byId[id]; if (o && o.state !== s) W.setState(o, s); }
    }
    // rules events (shared state log) -> toasts / pay cards; the core already shows shift_paid
    const EV = {
      hired: () => "🎉 赵姐：行，明天就能来。先去排个班！",
      shift_start: (e) => e.late > (R.job.def().late_grace_min || 0) ? `上班打卡 · 迟到 ${Math.round(e.late)} 分钟（会扣工资）` : "上班打卡 ✓ 换上店服",
      task_new: (e) => `🛒 新任务：${e.label}`,
      task_failed: (e) => `⚠ ${e.label}没做完，店长皱了皱眉`,
      shift_booked: (e) => `排班成功：${e.date} ${e.label}`,
      shift_missed: (e) => `⚠ 旷工！排了 ${e.label} 没去（第 ${e.strikes} 次）`,
      fired: () => "❌ 赵姐：你被辞退了。想回来就重新应聘吧。",
      store_checkout: null,
    };
    function scanLog() {
      const L = ps().log; if (!ST.lastLog) ST.lastLog = L[L.length - 1] || null;
      let i = L.lastIndexOf(ST.lastLog); const fresh = L.slice(i + 1); ST.lastLog = L[L.length - 1] || ST.lastLog;
      for (const e of fresh) { const f = EV[e.type]; if (f) { const t = f(e); if (t) { toast(t, 2800); log(t); } } }
    }

    // ---------- hooks into the core gameplay layer ----------
    const A0 = G.actionFor, U0 = G.use, P0 = G.pick, UP0 = G.update, FL0 = G.flags;
    G.flags = function () { return Object.assign(FL0.call(G), F.flags(ps())); };
    const LABEL = {
      store_fridge: () => "饮料冷柜", store_shelf: (o) => o.name || "货架", store_coffee: () => "自助咖啡机", store_micro: () => "微波炉",
      store_bar: () => "窗边吧台", store_oden: () => "关东煮", store_bins: () => "垃圾分类 · 拖把", store_staff: () => "员工室", store_locker: () => "更衣柜", store_board: () => "排班表 · 打卡机", store_backdoor: () => "回店里",
      store_counter: () => (ps().shift && staffSide() ? "收银台（店员）" : "收银台"),
    };
    G.actionFor = function (o, kind) {
      if (o && o.id === STREET_DOOR_ID && !W.interior) return kind === "use" ? { label: "进 24便利店", do: "game" } : undefined;
      if (o && o.interact && LABEL[o.interact]) {
        if (kind !== "use") return null;
        const sh = ps().shift, low = sh && R.job.open(ps()).some((t) => (t.kind === "restock" && TARGET_OBJ[t.target] === o.id) || (t.kind === "oden" && o.id === "oden") || (t.kind === "mop" && o.id === "bins"));
        return { label: LABEL[o.interact](o) + (low ? " · ⚠ 待处理" : ""), do: "game" };
      }
      return A0.call(G, o, kind);
    };
    G.use = function (o) {
      if (o.id === STREET_DOOR_ID && !W.interior) { G.go({ to: SID, spawn: ST.scene.spawn, door: null }); return null; }
      const h = USE[o.interact]; if (h) return h(o);
      return U0.call(G, o);
    };
    G.pick = function (i) {
      const m = G.menu;
      if (m && m.store) { if (i === -1) { G.closeMenu(); return; } const a = i == null ? m.opts.find((x) => x.ok) : m.opts[i]; if (!a || !a.ok) return; G.closeMenu(); const r = a.fn(); if (r) toast(r); return; }
      return P0.call(G, i);
    };
    G.update = function (dt, gm) {
      UP0.call(G, dt, gm);
      scanLog();
      if (P().storeZ && !G.activity) { P().z = 0; P().storeZ = false; if (P().set === "li_mo_bar") P().clip = null; }
      syncUniform();
      if (ST.pendingDone && G.activity !== ST.pendingDone.act) { const f = ST.pendingDone.fn; ST.pendingDone = null; f(); }
      if (inStore()) {
        if (!ST.wasIn) { ST.wasIn = true; const sp = staffOnDuty(C.min); if (!ps().shift) G.later(0.7, () => { if (inStore()) toast(`${sp.name}：${sp.lines[Math.floor(Math.random() * sp.lines.length)]}`, 2400); }); }
        updateNpcs(dt); syncShiftWorld();
      } else { ST.wasIn = false; if (ST.npcs.length) ST.npcs = []; }
      ST.hud();
    };
    // ---------- interactions ----------
    const opt = (label, fn, ok, reason, minutes) => ({ label, fn, ok: ok !== false, reason: reason || "", minutes: minutes || 0 });
    function shiftTask(kind, target, o, label, after) {
      const r = F.doTask(ps(), kind, target, abs()); if (!r.ok) return r.reason;
      activity(label, r.minutes || 1, { obj: o && o.id, after, dur: r.seconds || undefined, text: `${label} ✓${r.quality < 1 ? "（有点晚了）" : ""}` });
      return null;
    }
    function pickMenu(o, where, title) {
      const st = F.state(ps()), tasks = ps().shift ? R.job.open(ps()) : [];
      const rs = tasks.find((t) => t.kind === "restock" && TARGET_OBJ[t.target] === o.id);
      const opts = [];
      if (rs) opts.push(opt(`补货（${R.data.store.shift.restock_min}分钟）`, () => shiftTask("restock", rs.target, o, "补货", "full")));
      for (const g of F.goods(where)) opts.push(opt(`拿${g.label}（${yuan(g.price)}）`, () => { const r = F.pick(ps(), g.id); return r.ok ? `🧺 ${g.label} 放进篮子 · 共 ${st.basket.length} 件 ${yuan(r.total)} · 去收银台结账` : r.reason; }));
      menu(o, title + (st.basket.length ? ` · 篮子 ${st.basket.length} 件 ${yuan(F.basketTotal(ps()))}` : ""), opts);
      return null;
    }
    function payMenu(o) {
      const total = F.basketTotal(ps()), n = F.state(ps()).basket.length;
      const go = (m) => () => {
        const r = F.checkout(ps(), m, abs()); if (!r.ok) return r.reason;
        activity("扫码结账", 1, { obj: "counter", during: "goods", after: "default", dur: 0.6 + n * 0.35, text: `买了：${r.labels.join("、")}` });
        G.payCard({ amount: r.total, method: r.method, to: PAYEE, what: r.labels.length > 2 ? r.labels.slice(0, 2).join("、") + "等" : r.labels.join("、") });
        const s = ST.npcs.find((q) => q.staff); if (s) s.bubble = { t: 1.2, text: "滴" };
        log(`李默在便利店结账 ${yuan(r.total)}（${r.method}）`); return null;
      };
      menu(o, `结账 · ${n} 件 ${yuan(total)}`, [opt("微信支付（扫码）", go("wechat"), ps().money >= total, "钱不够"), opt("支付宝（扫码）", go("alipay"), ps().money >= total, "钱不够"), opt("清空篮子，不买了", () => { F.unpick(ps()); return "把东西放回去了"; })]);
    }
    function bookMenu(o) {
      const sl = F.slots(ps(), abs()).slice(0, 9);
      menu(o, "排班 · 赵姐（店长）", sl.map((s) => opt(`${s.date} ${s.label} ${s.from}–${s.to}${s.booked ? " ✓已排" : ""}`, () => { const r = F.book(ps(), abs(), s.id, s.start); return r.ok ? null : r.reason; }, !s.booked, "已排")));
    }
    const USE = {
      store_fridge: (o) => pickMenu(o, "fridge", "饮料冷柜"),
      store_shelf: (o) => pickMenu(o, "shelf", o.name || "货架"),
      store_coffee: (o) => {
        const hot = R.data.store.hot, f = (id, m) => () => { const r = F.buyHot(ps(), id, abs(), m); if (!r.ok) return r.reason; pay(r, PAYEE + " · 自助咖啡", r.label.replace(/（¥[\d.]+）/, "")); activity("等咖啡", hot[id].minutes, { obj: "coffee", during: "brewing", after: "idle", text: r.text }); return null; };
        const cA = F.price("buy_coffee"), cL = F.price("st_latte");
        menu(o, "自助咖啡机 · 扫机身二维码付款", [opt(`美式 ${yuan(cA)} · 微信`, f("americano", "wechat"), ps().money >= cA, "钱不够"), opt(`美式 ${yuan(cA)} · 支付宝`, f("americano", "alipay"), ps().money >= cA, "钱不够"),
          opt(`拿铁 ${yuan(cL)} · 微信`, f("latte", "wechat"), ps().money >= cL, "钱不够"), opt(`拿铁 ${yuan(cL)} · 支付宝`, f("latte", "alipay"), ps().money >= cL, "钱不够")]);
        return null;
      },
      store_micro: (o) => {
        const c = R.check(ps(), "heat_bento_store", { abs: abs() });
        menu(o, "微波炉（自助，免费）", [opt("热便当（3分钟）", () => { const r = F.heat(ps(), abs()); if (!r.ok) return r.reason; activity("热便当", r.minutes, { obj: "micro", during: "on", after: "off", text: "「叮」——便当热好了，拿去窗边吧台吃" }); return null; }, c.ok, c.ok ? "" : (/便当/.test(c.reason) ? "没有便当（冷柜里拿一份）" : c.reason))]);
        return null;
      },
      store_bar: (o) => {
        const ed = F.edible(ps());
        const stool = ["stool_1", "stool_2", "stool_3"].map((id) => W.byId[id]).find((s) => s && !SP.actors.list.some((a) => a !== P() && Math.hypot(a.x - s.x, a.y - s.y) < 0.4));
        if (!ed.length) return "吧台：先买点吃的（便当可以用微波炉热）";
        if (!stool) return "吧台坐满了，等一下";
        menu(o, "窗边吧台 · 坐下吃", ed.map((e) => opt(`吃${e.label}${e.n > 1 ? ` ×${e.n}` : ""}`, () => {
          const r = F.eat(ps(), e.id, abs()); if (!r.ok) return r.reason;
          activity(e.id === "eat_bar" ? "坐在窗边吃便当" : r.label, r.minutes, { obj: e.id === "eat_bar" ? "bar" : null, during: "bento", after: "default", text: r.text, pose: { at: [stool.x, stool.y + 0.02], dir: "S", clip: "eat", z: SEAT_LIFT } });
          return null;
        }, true, "", e.minutes)));
        return null;
      },
      store_oden: (o) => {
        const tk = ps().shift && R.job.open(ps()).find((t) => t.kind === "oden"), c = F.price("buy_oden");
        const buy = (m) => () => { const r = F.buyHot(ps(), "oden", abs(), m); if (!r.ok) return r.reason; pay(r, PAYEE, "关东煮"); activity("吃关东煮", r.minutes, { text: r.text }); return null; };
        const opts = [];
        if (tk) opts.push(opt(`加关东煮（${R.data.store.shift.oden_min}分钟）`, () => shiftTask("oden", null, o, "加关东煮", "full")));
        opts.push(opt(`来一份关东煮 ${yuan(c)} · 微信`, buy("wechat"), ps().money >= c, "钱不够"), opt(`来一份关东煮 ${yuan(c)} · 支付宝`, buy("alipay"), ps().money >= c, "钱不够"));
        menu(o, "关东煮 · 萝卜 海带结 鱼丸", opts); return null;
      },
      store_bins: (o) => {
        const tk = ps().shift && R.job.open(ps()).find((t) => t.kind === "mop");
        if (tk) return shiftTask("mop", null, o, "倒垃圾 + 拖地", "clean");
        return "其他垃圾 / 可回收物，分好类再扔";
      },
      store_staff: (o) => {
        if (!ps().job) return "员工通道 · 闲人免进";
        if (!ST.back) { const c = F.canClockIn(ps(), abs()); if (ps().shift) return "员工室：歇了口气，喝了口水"; return c.ok ? clockIn() : `员工室：${c.reason}`; }
        G.go({ to: SID2, spawn: ST.back.spawn, door: o.id }); return null;
      },
      store_backdoor: (o) => { G.go({ to: SID, spawn: ST.back.exit_spawn, door: null }); return null; },
      store_locker: (o) => {
        const st = F.state(ps());
        const opts = [st.uniform
          ? opt("换回便服", () => { change(o, false); return null; }, !ps().shift, "当班中不能脱店服")
          : opt("换上店服（绿围裙）", () => { change(o, true); return null; })];
        opts.push(opt("看看手机再走", () => "储物柜里只有一把伞和半包纸巾"));
        menu(o, "更衣柜 · 李默", opts); return null;
      },
      store_board: (o) => {
        const s = ps(), opts = [];
        const bk = (s.job && s.job.booked) || [];
        for (const b of bk.slice(0, 3)) { const d = R.date(b.start); opts.push(opt(`📅 ${d.label || ""} ${b.label} ${hm(b.start)}`, () => null, false, "已排")); }
        if (!bk.length) opts.push(opt("（还没排班）", () => null, false, ""));
        if (s.shift) opts.push(opt("下班打卡", () => clockOut()));
        else {
          const c = F.canClockIn(s, abs());
          opts.push(opt(c.ok ? `上班打卡（${c.shift.label} ${c.shift.from}–${c.shift.to}）` : "上班打卡", () => clockIn(), c.ok, c.reason));
          opts.push(opt("排班…", () => { bookMenu(o); return null; }));
        }
        menu(o, "排班表 · 打卡机", opts); return null;
      },
      store_counter: (o) => {
        const s = ps(), opts = [], st = F.state(s);
        if (s.shift) {
          const ck = R.job.open(s).find((t) => t.kind === "checkout");
          const waiting = ck && ST.npcs.some((a) => a.brain && a.brain.task === ck.id && a.brain.i >= a.brain.route.length);
          if (ck) opts.push(opt(`收银：扫码 ${ck.items} 件`, () => shiftTask("checkout", null, o, `扫码收银（${ck.items}件）`, "default"), staffSide() && waiting, !staffSide() ? "先绕到柜台里面（店员通道）" : "顾客还没走到柜台"));
          const left = s.shift.end - abs();
          opts.push(opt(left > 0 ? `下班打卡（提前 ${Math.ceil(left / 60)} 小时 = 早退，工资减半）` : "下班打卡", () => clockOut()));
        } else {
          if (st.basket.length) opts.push(opt(`结账（${st.basket.length} 件 ${yuan(F.basketTotal(s))}）`, () => { payMenu(o); return null; }));
          for (const g of F.goods("counter")) opts.push(opt(`${g.label}（${yuan(g.price)}）放进篮子`, () => { const r = F.pick(s, g.id); return r.ok ? `🧺 ${g.label} · 共 ${st.basket.length} 件 ${yuan(r.total)}` : r.reason; }));
          if (!s.job) opts.push(opt(`应聘店员（时薪 ¥${R.job.def().pay_per_h}）`, () => { const r = F.apply(s, abs()); return r.ok ? null : r.reason; }));
          else {
            opts.push(opt("找店长排班…", () => { bookMenu(o); return null; }));
            const c = F.canClockIn(s, abs());
            opts.push(opt(c.ok ? `上班打卡（${c.shift.label} ${c.shift.from}–${c.shift.to}）` : "上班打卡", () => clockIn(), c.ok, c.reason));
          }
        }
        menu(o, s.shift ? "收银台 · 当班中" : "收银台 · 赵姐（店长）", opts); return null;
      },
    };
    function clockIn() {
      const r = F.clockIn(ps(), abs()); if (!r.ok) return r.reason;
      log(`李默上班打卡：${r.shift.label}${r.lateMin ? `，迟到${Math.round(r.lateMin)}分钟` : ""}`);
      F.state(ps()).uniform = true;                                      // 打卡 = 换上店服
      const sp = [ST.scene.staff_spot[0], ST.scene.staff_spot[1], "W"];
      if (inStore()) { P().x = sp[0]; P().y = sp[1]; P().setDir("W"); SP.actors.resolve(4); }
      else G.go({ to: SID, spawn: sp, door: null });                     // from the back room: out to the counter
      return null;
    }
    function change(o, on) {
      activity(on ? "换店服" : "换便服", 3, { obj: "lockers", during: "open", after: "closed", done: () => { F.state(ps()).uniform = on; toast(on ? "换上了绿围裙店服" : "换回了自己的衣服"); } });
    }
    const hm = (t) => `${String(Math.floor((t % DAY) / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
    // Li Mo wears the store uniform (img/actors/li_mo_uniform.png) inside the store / back room while uniform is on
    function syncUniform() {
      const p = P(); if (!p) return;
      if (p.baseSet == null) p.baseSet = p.set;
      const want = p.storeZ && p.clip && hasActor("li_mo_bar") ? "li_mo_bar"
        : F.state(ps()).uniform && (inStore() || inBack()) && hasActor("li_mo_uniform") ? "li_mo_uniform" : p.baseSet;
      if (p.set !== want) { p.set = want; if (SP.ensureActor && !SP.img["actor_" + want]) SP.ensureActor(want); }
      if (inBack()) { const b = W.byId.board; if (b) { const st = ps().job && ps().job.booked && ps().job.booked.length ? "mine" : "default"; if (b.state !== st) W.setState(b, st); } }
      const d = inStore() && W.byId.front_door;                          // automatic door: opens for anyone within 1.3 m
      if (d) { const near = [p].concat(ST.npcs).some((a) => Math.abs(a.x - 4.5) < 1.0 && a.y < 1.3); const st = near ? "open" : "glass"; if (d.state !== st) W.setState(d, st); }
    }
    function clockOut() {
      const r = F.clockOut(ps(), abs()); if (!r.ok) return r.reason;
      log(`李默下班打卡（${r.why === "left" ? "早退" : "正常下班"}）`);
      return r.payrollText || (r.why === "left" ? "早退了……这班工资减半" : "下班了，辛苦！领了一份员工便当");
    }
    ST.clockIn = clockIn; ST.clockOut = clockOut;

    // ---------- lighting: cool white LED panels + fridge glow, bright clean ambient ----------
    const LED = [228, 240, 255], FRIDGE = [214, 236, 255];
    const L0 = SP.env.lights, AM0 = SP.env.ambient;
    SP.env.lights = function (view, zoom) {
      const out = L0.call(SP.env, view, zoom);
      if (inBack()) { out.push({ x: 1.7, y: 1.5, z: 2.5, r: 3.0, c: LED, a: 0.5 }); out.push({ x: 1.7, y: 1.5, z: 0, r: 3.2, c: LED, a: 0.45, flat: true }); return out; }
      if (!inStore()) return out;
      for (const [x, y] of [[1.5, 1.6], [4.0, 1.6], [6.6, 1.6], [1.5, 4.2], [4.0, 4.2], [6.6, 4.2]]) { out.push({ x, y, z: 2.6, r: 3.6, c: LED, a: 0.55 }); out.push({ x, y, z: 0, r: 4.2, c: LED, a: 0.5, flat: true }); }
      for (const id of ["cooler", "cooler_b"]) { const o = W.byId[id]; if (o) out.push({ x: o.x, y: o.y - 0.5, z: 1.2, r: 2.2, c: FRIDGE, a: 0.5 }); }
      const m = W.byId.micro; if (m && m.state === "on") out.push({ x: m.x, y: m.y - 0.3, z: 1.0, r: 0.9, c: [255, 230, 170], a: 0.7 });
      const od = W.byId.oden; if (od) out.push({ x: od.x - 0.3, y: od.y, z: 1.0, r: 1.0, c: [255, 200, 130], a: 0.45 });
      return out;
    };
    SP.env.ambient = function () {
      const a = AM0.call(SP.env); if (!inStore() && !inBack()) return a;
      const n = SP.env.night || 0, base = [220, 228, 240];            // 24h LED: bright day and night, a touch cooler at night
      return base.map((v, i) => Math.round(v * (1 - 0.08 * n) * 0.8 + a[i] * 0.2));
    };

    // ---------- shift HUD (DOM, below the needs row) ----------
    let hudEl = document.getElementById("storehud"), hk = "";
    if (!hudEl) { hudEl = document.createElement("div"); hudEl.id = "storehud"; (document.getElementById("wrap") || document.body).appendChild(hudEl); }
    const css = document.createElement("style");
    css.textContent = `#storehud{position:absolute;left:10px;top:44px;z-index:30;pointer-events:none;background:rgba(10,14,20,.78);color:#e8f2ea;border-left:3px solid #2fbf6a;border-radius:6px;padding:5px 9px;font-size:12px;line-height:1.5;max-width:58%;display:none}
#storehud b{color:#7ff0a8} #storehud .t{color:#ffd88a} #storehud .bk{color:#bcd}
body.mobile #storehud{top:calc(env(safe-area-inset-top,0px) + 112px);left:64px;font-size:11px;max-width:calc(100vw - 76px)}
body:not(.mobile) #storehud{top:64px}`;
    document.head.appendChild(css);
    ST.hud = function () {
      const s = ps(), sh = F.shiftText(s, abs()), st = F.state(s);
      let html = "";
      if (sh) html = `<b>🏪 ${sh.title}</b><br>` + (sh.tasks.length ? sh.tasks.map((t) => `<span class="t">· ${t.label}</span> <i>${t.mins}分内</i>`).join("<br>") : "· 暂时没活，站好柜台") + `<br><span class="bk">完成 ${sh.done} · 失败 ${sh.failed}</span>`;
      else if (inStore()) {
        const parts = [];
        if (st.basket.length) parts.push(`🧺 篮子 ${st.basket.length} 件 ${yuan(F.basketTotal(s))}`);
        if (st.hot > 0) parts.push(`🍱 热便当 ×${st.hot}`);
        const bag = Object.entries(st.bag).filter(([, n]) => n > 0).map(([id, n]) => R.data.store.goods[id].label + (n > 1 ? "×" + n : ""));
        if (bag.length) parts.push("🛍 " + bag.join("、"));
        if (s.job && s.job.booked && s.job.booked.length) { const b = s.job.booked[0], d = R.date(b.start); parts.push(`📅 下个班：${d.label || ""} ${b.label} ${String(Math.floor((b.start % DAY) / 60)).padStart(2, "0")}:${String(b.start % 60).padStart(2, "0")}`); }
        html = parts.join("<br>");
      }
      if (html !== hk) { hk = html; hudEl.innerHTML = html; hudEl.style.display = html ? "block" : "none"; }
    };

    /** preview / tests: jump into the store (spawn = layout spawn) */
    ST.enter = () => G.switchScene(SID, ST.scene.spawn, null);
    /** dev: hire + book the shift whose check-in window is open now (or the next one, and jump the clock there) */
    ST.devShift = function () {
      const s = ps(); if (!s.job) F.apply(s, abs());
      if (!R.job.windowAt(abs())) { const n = R.job.next(abs()); const m = (n.start - 5) % DAY; C.min = m; if (C.computeAmbient) C.computeAmbient(); }
      R.job.bookAt(s, abs()); return clockIn() || "上班打卡 ✓（测试：已自动应聘 + 排班）";
    };
  };
  // auto-install once the core gameplay layer exists (store.js is loaded after game.js)
  if (SP.game && SP.world) ST.install();
})(typeof window !== "undefined" ? window : globalThis);
