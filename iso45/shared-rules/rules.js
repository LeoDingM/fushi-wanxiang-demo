/* 浮世万象 · shared-rules/rules.js — engine-agnostic gameplay rules: needs, money, inventory, calendar + holidays, lease /
   rent / utilities, laundry + clothes, timed actions, shops, jobs, social, damage, quests (v3; v1/v2 data still works).
   Pure data + pure functions over a plain JSON state (no DOM, no engine). Works in the browser (window.FushiRules),
   node (require), and is written to port 1:1 to GDScript (WorldCore). API: see README.md.
   Time = absolute game minutes (day * 1440 + minute of day). */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FushiRules = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const DAY = 1440;

  /** copy the single editable price table (data.prices) onto actions / items / job / fixed fees; rewrite （¥N） in labels */
  function applyPrices(D) {
    const P = D.prices; if (!P || P._applied) return; P._applied = true;
    const fmt = (v) => (Math.round(v * 100) / 100).toString();
    for (const [grp, tab] of Object.entries(P)) if (grp[0] !== "_" && tab && typeof tab === "object") for (const [k, v] of Object.entries(tab)) {
      if (D.actions[k]) { D.actions[k].cost = v; D.actions[k].label = D.actions[k].label.replace(/（¥[\d.]+）/, `（¥${fmt(v)}）`); }
      else if (D.items[k]) D.items[k].price = v;
      else if (k === "wage_per_h" && D.jobs && D.jobs.store_clerk) D.jobs.store_clerk.pay_per_h = v;
      else if (k === "staff_meal" && D.jobs && D.jobs.store_clerk) D.jobs.store_clerk.staff_meal_price = v;
      else if (D.utilities && D.utilities.fixed && D.utilities.fixed[k]) D.utilities.fixed[k].amount = v;
    }
  }
  function create(data) {
    applyPrices(data);
    const D = data, NEEDS = Object.keys(D.needs);
    const R = { data: D, needs: NEEDS };

    // ---------------------------------------------------------------- calendar: real dates + CN holidays (v3)
    const CAL = D.calendar || {}, DMS = 86400000;
    const BASE = CAL.start_date ? Date.UTC(CAL.start_date[0], CAL.start_date[1] - 1, CAL.start_date[2]) : null;
    const pad = (n) => (n < 10 ? "0" : "") + n, keyOf = (dt) => `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
    const HOL = {}, WORK = new Set(CAL.makeup_workdays || []);
    for (const h of CAL.holidays || []) {
      const [a, b] = [h.from, h.to].map((k) => Date.UTC(+k.slice(0, 4), +k.slice(5, 7) - 1, +k.slice(8, 10)));
      for (let t = a; t <= b; t += DMS) { const k = keyOf(new Date(t)); HOL[k] = { name: h.name, statutory: (h.statutory || []).includes(k) }; }
    }
    /** weekday 0=Sun..6 of an absolute minute */
    R.weekday = BASE != null ? (abs) => new Date(BASE + Math.floor(abs / DAY) * DMS).getUTCDay() : (abs) => (D.calendar.start_weekday + Math.floor(abs / DAY)) % 7;
    /** calendar date of an absolute minute: {day, y, m, d, wd, key, label, holiday, statutory, makeup, weekend, off} */
    R.date = function (abs) {
      const day = Math.floor(abs / DAY), wd = R.weekday(abs), names = CAL.weekday_names || "日一二三四五六".split("");
      if (BASE == null) return { day, wd, label: `第${day + 1}天 周${names[wd]}`, off: wd === 0 || wd === 6, weekend: wd === 0 || wd === 6 };
      const dt = new Date(BASE + day * DMS), k = keyOf(dt), h = HOL[k], weekend = wd === 0 || wd === 6, makeup = WORK.has(k);
      return { day, y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), wd, key: k, label: `${dt.getUTCMonth() + 1}月${dt.getUTCDate()}日 周${names[wd]}`,
               holiday: h ? h.name : null, statutory: !!(h && h.statutory), makeup, weekend, off: h ? true : makeup ? false : weekend };
    };
    /** game day index of a calendar date */
    R.dayOf = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - BASE) / DMS);
    /** season of a date (by month) — engines with a compressed demo calendar may ignore it */
    R.season = (abs) => { const dt = R.date(abs); return CAL.season_by_month && dt.m ? CAL.season_by_month[dt.m] : null; };
    /** the day index `k` months after day index `day`, on day-of-month `anchor` (clamped to the month's length) */
    R.addMonths = function (day, k, anchor) {
      const dt = new Date(BASE + day * DMS); let y = dt.getUTCFullYear(), m = dt.getUTCMonth() + k;
      y += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
      const len = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      return R.dayOf(y, m + 1, Math.min(anchor || dt.getUTCDate(), len));
    };
    /** first rent due time strictly after abs (legacy weekly rent; with a lease see R.lease) */
    R.nextRentDue = function (abs) {
      const r = D.rent; let day = Math.floor(abs / DAY);
      for (let i = 0; i < 8 * r.every_days; i++, day++) {
        const t = day * DAY + r.due_min;
        if (t > abs && R.weekday(t) === r.due_weekday) return t;
      }
      return abs + r.every_days * DAY;
    };
    /** fresh player state (plain JSON) */
    R.newState = function (abs, over) {
      const s = { v: 3, needs: {}, money: D.money.start, items: Object.assign({}, D.start_items), owed: 0,
                  rentDue: D.lease ? 0 : R.nextRentDue(abs || 0), rentPaid: 0, flags: {}, log: [], stats: { actions: {}, spent: 0, earned: 0, shifts: 0, fines: 0 },
                  aff: {}, met: {}, job: null, shift: null, bills: [], quests: null, perks: {} };
      for (const n of NEEDS) s.needs[n] = D.needs[n].start;
      for (const [id, n] of Object.entries((D.social && D.social.npcs) || {})) s.aff[id] = n.start || 0;
      if (D.payment) s.pay = D.payment.default;
      if (D.lease) R.lease.init(s, abs || 0, (over && over.plan) || D.lease.plan);
      if (D.utilities) { s.meter = { water: 0, power: 0, gas: 0 }; s.utilNext = R.utilities.nextBill(abs || 0); }
      if (D.appliances) s.power = { on: {}, kwh: {} };
      if (D.laundry) s.clothes = { clean: D.laundry.start.clean, dirty: D.laundry.start.dirty, worn_h: 0, washer: null, rack: {} };
      Object.assign(s, over || {}); delete s.plan;
      if (D.quests) { s.quests = {}; questStarts(s, null, abs || 0); }
      return s;
    };
    function add(s, need, v) { s.needs[need] = clamp(s.needs[need] + v, 0, 100); }
    function note(s, ev, abs) {
      ev.t = abs; s.log.push(ev); if (s.log.length > 60) s.log.shift();
      if (s.quests && ev.type.slice(0, 6) !== "quest_") questEvent(s, ev, abs);
      return ev;
    }
    R._note = note;
    /** active conditions for ctx {outdoors, weather, umbrella} */
    R.conditions = function (s, ctx) {
      ctx = ctx || {};
      return D.conditions.filter((c) => {
        const w = c.when;
        if (w.need && !(s.needs[w.need] < w.below)) return false;
        if (w.weather && !(ctx.weather === w.weather && (!w.outdoors || ctx.outdoors) && (!w.no_umbrella || !ctx.umbrella))) return false;
        if (w.owing && !(s.owed > 0)) return false;
        if (w.clothes_dirty && !R.clothes.isDirty(s)) return false;
        if (w.running && !ctx.running) return false;                 // ctx.running: the engine's player is running
        return true;
      });
    };
    /** advance `minutes` of game time. ctx: {abs (time AFTER the step), outdoors, weather, umbrella, activity}
        activity = id of a running sleep action (its per_h replaces normal decay). Returns events [{type,...}] */
    R.tick = function (s, minutes, ctx) {
      ctx = ctx || {}; const h = minutes / 60, evs = [];
      if (h <= 0) return evs;
      const act = ctx.activity && D.actions[ctx.activity], sleeping = act && act.kind === "sleep";
      const before = {}; for (const n of NEEDS) before[n] = s.needs[n];
      for (const n of NEEDS) add(s, n, -(sleeping ? D.needs[n].sleep_decay_per_h : D.needs[n].decay_per_h) * h);
      if (act && act.per_h) for (const [n, v] of Object.entries(act.per_h)) add(s, n, v * h);
      if (!sleeping) for (const c of R.conditions(s, ctx)) if (c.per_h) for (const [n, v] of Object.entries(c.per_h)) add(s, n, v * h);
      for (const n of NEEDS) {
        const L = D.needs[n];
        if (before[n] >= L.warn && s.needs[n] < L.warn) evs.push(note(s, { type: "need_low", need: n, level: "warn" }, ctx.abs));
        if (before[n] >= L.critical && s.needs[n] < L.critical) evs.push(note(s, { type: "need_low", need: n, level: "critical" }, ctx.abs));
      }
      if (s.shift && D.jobs) { const J = D.jobs[s.shift.job]; for (const [n, v] of Object.entries(J.per_h || {})) add(s, n, v * h); }
      const abs = ctx.abs == null ? 0 : ctx.abs;
      if (s.clothes) evs.push(...R.clothes.tick(s, h, ctx, sleeping));
      if (s.meter && D.appliances) R.power.tick(s, h);
      if (s.meter) evs.push(...R.utilities.tick(s, h, abs));
      if (s.lease) evs.push(...R.lease.tick(s, abs));
      // legacy weekly rent: due every N days at due_min; pay automatically if the money is there, otherwise it is owed
      else while (abs >= s.rentDue) {
        const r = D.rent;
        if (s.money >= r.amount + s.owed) { s.money -= r.amount + s.owed; s.stats.spent += r.amount + s.owed; s.rentPaid++; evs.push(note(s, { type: "rent_paid", amount: r.amount + s.owed }, s.rentDue)); s.owed = 0; }
        else { s.owed += r.amount; add(s, "mood", r.late_mood); evs.push(note(s, { type: "rent_owed", amount: r.amount, owed: s.owed }, s.rentDue)); }
        s.rentDue = R.nextRentDue(s.rentDue);
      }
      if (s.shift) evs.push(...R.job.tick(s, abs));
      if (s.job && s.job.booked && s.job.booked.length) evs.push(...R.job.noShows(s, abs));
      // unpaid bills past due: mood penalty once per day
      if (s.bills && s.bills.length && D.damage) {
        const day = Math.floor(abs / DAY);
        for (const b of s.bills) if (abs > b.due && b.pen !== day) { b.pen = day; add(s, "mood", D.damage.late_mood_per_day); evs.push(note(s, { type: "bill_overdue", id: b.id, amount: b.amount }, abs)); }
      }
      if (s.quests) evs.push(...questConds(s, abs));
      return evs;
    };
    function inWindow(m, from, to) { return from <= to ? m >= from && m < to : m >= from || m < to; }
    /** minutes an action takes when started at abs */
    R.minutes = function (id, abs) {
      const a = D.actions[id]; if (!a) return 0;
      if (a.kind === "sleep" && a.wake_min != null) { const m = abs % DAY; let d = a.wake_min - m; if (d <= 0) d += DAY; return d; }
      return a.minutes || 0;
    };
    /** can the action run now? ctx {abs, place, flags{}} -> {ok, reason, label, minutes, cost} */
    R.check = function (s, id, ctx) {
      const a = D.actions[id]; ctx = ctx || {};
      if (!a) return { ok: false, reason: "unknown action" };
      const out = { ok: true, label: a.label, minutes: R.minutes(id, ctx.abs || 0), cost: a.cost || 0 };
      const fail = (r) => Object.assign(out, { ok: false, reason: r });
      if (a.place !== "any" && ctx.place && ctx.place !== a.place) return fail("not here");
      if (a.allowed_from != null && !inWindow((ctx.abs || 0) % DAY, a.allowed_from, a.allowed_to)) {
        // night-shift / exhausted: full sleep any time when energy is in the "tired" band (keep nap as the short option)
        const bypass = a.kind === "sleep" && a.wake_min != null && s.needs.energy < (a.tired_below != null ? a.tired_below : 30);
        if (!bypass) return fail("还不到睡觉的时候");
      }
      const q = a.requires || {};
      if (q.energy_below != null && !(s.needs.energy < q.energy_below)) return fail("现在不困");
      if (q.flag && !(ctx.flags && ctx.flags[q.flag])) return fail(q.reason || "现在没开");
      if (q.off_day && BASE != null && !R.date(ctx.abs || 0).off) return fail("今天要上班");
      out.cost = R.costOf(s, id);
      if (out.cost && s.money < out.cost) return fail("钱不够");
      for (const [it, n] of Object.entries(a.consume || {})) if ((s.items[it] || 0) < n) return fail(`没有${D.items[it].label}了`);
      if (a.kind === "pay_rent" && !(s.owed > 0)) return fail("不欠房租");
      if (a.kind === "pay_rent" && s.money < s.owed) return fail("钱不够");
      if (a.kind && a.kind.slice(0, 7) === "laundry" || a.kind === "change_clothes") { const why = R.clothes.check(s, a, ctx); if (why) return fail(why); }
      return out;
    };
    /** list the actions offered at a place: [{id, label, ok, reason}] */
    R.actionsAt = function (s, place, ctx) {
      return Object.keys(D.actions).filter((id) => D.actions[id].place === place).map((id) => Object.assign({ id }, R.check(s, id, Object.assign({}, ctx, { place }))));
    };
    /** start an action: pays / consumes / applies instant effects now; returns {ok, minutes, activity, text, events}.
        The engine then advances the clock by `minutes` calling tick(..., {activity}) (sleep gains energy per hour). */
    R.perform = function (s, id, ctx) {
      const c = R.check(s, id, ctx); if (!c.ok) return c;
      const a = D.actions[id], abs = (ctx && ctx.abs) || 0, evs = [];
      if (a.kind === "pay_rent") { const amt = s.owed; s.money -= amt; s.stats.spent += amt; s.owed = 0; s.rentPaid++; evs.push(note(s, { type: "rent_paid", amount: amt, late: true }, abs)); }
      if (a.kind === "pay_rent" && s.lease) { s.lease.late = null; evs.push(note(s, { type: "landlord_msg", kind: "paid", text: R.lease.msg("paid", {}) }, abs)); }
      const cost = R.costOf(s, id);
      if (cost) { s.money -= cost; s.stats.spent += cost; }
      for (const [it, n] of Object.entries(a.consume || {})) s.items[it] -= n;
      if (a.use && s.meter) for (const [k, v] of Object.entries(a.use)) s.meter[k] += v;
      if (s.meter && D.appliances) R.power.perform(s, a, c.minutes);
      if (a.kind && a.kind.slice(0, 7) === "laundry" || a.kind === "change_clothes") evs.push(...R.clothes.perform(s, a, abs));
      for (const [n, v] of Object.entries(a.set || {})) s.needs[n] = clamp(v, 0, 100);
      for (const [n, v] of Object.entries(a.effects || {})) add(s, n, v);
      s.stats.actions[id] = (s.stats.actions[id] || 0) + 1;
      evs.push(note(s, { type: "action", id }, abs));
      return { ok: true, id, label: a.label, minutes: c.minutes, activity: a.kind === "sleep" ? id : null, text: a.text || a.label, events: evs,
               paid: cost ? { amount: cost, method: R.payLabel(s) } : null };
    };
    /** price of an action for this player (perks: 王阿姨 half-price breakfast) */
    R.costOf = function (s, id) {
      const a = D.actions[id]; if (!a || !a.cost) return 0;
      if (a.place === "stall" && s.perks && s.perks.vendor_discount) return Math.ceil(a.cost / 2);
      return a.cost;
    };
    R.payLabel = (s) => (D.payment && D.payment.methods[s.pay || D.payment.default] || { label: "付款" }).label;
    R.addItem = (s, it, n) => { s.items[it] = (s.items[it] || 0) + (n == null ? 1 : n); };
    R.earn = (s, amt, why, abs) => { s.money += amt; s.stats.earned += amt; return note(s, { type: "earn", amount: amt, why }, abs || 0); };
    R.spend = (s, amt, why, abs) => { if (s.money < amt) return null; s.money -= amt; s.stats.spent += amt; return note(s, { type: "spend", amount: amt, why }, abs || 0); };
    /** derived view for HUDs */
    R.status = function (s, ctx) {
      const conds = R.conditions(s, ctx);
      const needs = NEEDS.map((n) => { const L = D.needs[n], v = s.needs[n]; return { id: n, label: L.label, icon: L.icon, value: v, level: v < L.critical ? "critical" : v < L.warn ? "warn" : "ok" }; });
      let speed = 1; for (const c of conds) if (c.speed_mul) speed = Math.min(speed, c.speed_mul);
      const m = s.needs.mood;
      return { needs, money: s.money, owed: s.owed, rentDue: s.rentDue, conditions: conds.map((c) => c.label), speedMul: speed,
               bills: (s.bills || []).reduce((t, b) => t + b.amount, 0), shift: s.shift ? { id: s.shift.id, end: s.shift.end, open: s.shift.tasks.filter((t) => !t.done && !t.failed).length } : null,
               moodLabel: m > 80 ? "心情很好" : m > 55 ? "还行" : m > 30 ? "有点低落" : "很沮丧",
               date: ctx && ctx.abs != null ? R.date(ctx.abs) : null, pay: s.pay ? R.payLabel(s) : null,
               lease: s.lease ? R.lease.status(s, (ctx && ctx.abs) || 0) : null,
               clothes: s.clothes ? R.clothes.status(s, (ctx && ctx.abs) || 0) : null,
               utilities: s.meter ? R.utilities.preview(s) : null };
    };
    // =====================================================================================================
    // shops: buy catalog items into the inventory
    R.buy = function (s, shop, item, n, abs) {
      const S = D.shops && D.shops[shop], it = D.items[item]; n = n || 1;
      if (!S || !it || !S.catalog.includes(item)) return { ok: false, reason: "这里不卖" };
      const cost = Math.round(it.price * n * 100) / 100;
      if (s.money < cost) return { ok: false, reason: "钱不够", cost };
      s.money -= cost; s.stats.spent += cost; R.addItem(s, item, n);
      return { ok: true, cost, events: [note(s, { type: "buy", shop, item, n, cost }, abs || 0)] };
    };
    R.catalog = (shop) => ((D.shops && D.shops[shop] && D.shops[shop].catalog) || []).map((id) => ({ id, label: D.items[id].label, price: D.items[id].price, n: (D.shops[shop].bundle || {})[id] || 1 }));

    // =====================================================================================================
    // job: hire -> check in to a shift window -> task loop (seeded, deterministic) -> pay
    const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const hm = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const JOB = { id: "store_clerk" };
    R.job = {
      def: () => D.jobs && D.jobs[JOB.id],
      hire: function (s, abs) { if (s.job) return { ok: false, reason: "已经是店员了" }; s.job = { id: JOB.id, hired: abs, shifts: 0, last: {}, raise: 0 }; return { ok: true, events: [note(s, { type: "hired", job: JOB.id }, abs)] }; },
      /** the shift window you could check in to at abs: {shift, start, end, late} or null */
      windowAt: function (abs) {
        const J = R.job.def(); if (!J) return null;
        const day = Math.floor(abs / DAY);
        for (const dd of [0, -1]) for (const sh of J.shifts) {
          const st = (day + dd) * DAY + hm(sh.from); let en = (day + dd) * DAY + hm(sh.to); if (en <= st) en += DAY;
          if (abs >= st - J.checkin_before_min && abs <= st + J.checkin_after_min) return { shift: sh, start: st, end: en, late: Math.max(0, abs - st) };
        }
        return null;
      },
      /** next shift start after abs (for "come back at ..." hints) */
      next: function (abs) {
        const J = R.job.def(), day = Math.floor(abs / DAY); let best = null;
        for (const dd of [0, 1]) for (const sh of J.shifts) { const st = (day + dd) * DAY + hm(sh.from); if (st - J.checkin_before_min > abs && (!best || st < best.start)) best = { shift: sh, start: st }; }
        return best;
      },
      canStart: function (s, abs) {
        const J = R.job.def();
        if (!J) return { ok: false, reason: "没有工作" };
        if (!s.job) return { ok: false, reason: "还没被录用" };
        if (s.shift) return { ok: false, reason: "正在上班" };
        const w = R.job.windowAt(abs);
        if (!w) { const n = R.job.next(abs); return { ok: false, reason: `现在不是上班时间（下个班 ${n.shift.label} ${n.shift.from}）` }; }
        if (s.job.last[w.shift.id + "@" + w.start]) return { ok: false, reason: "这个班已经上过了" };
        if (J.booking && J.booking.required && !(s.job.booked || []).some((b) => b.start === w.start && b.id === w.shift.id)) return { ok: false, reason: `这个班没排你（先找店长排班）` };
        const today = Math.floor(abs / DAY), n = Object.values(s.job.last).filter((d) => d === today).length;
        if (n >= J.max_per_day) return { ok: false, reason: "今天已经上过班了，歇歇吧" };
        return Object.assign({ ok: true }, w);
      },
      start: function (s, abs) {
        const c = R.job.canStart(s, abs); if (!c.ok) return c;
        const J = R.job.def(), T = J.tasks, r = rng(Math.floor(c.start / 7) + 9173 * (s.job.shifts + 1));
        s.job.last[c.shift.id + "@" + c.start] = Math.floor(abs / DAY);
        if (s.job.booked) s.job.booked = s.job.booked.filter((b) => !(b.start === c.start && b.id === c.shift.id));
        s.shift = { job: JOB.id, id: c.shift.id, label: c.shift.label, start: c.start, end: c.end, checkin: abs, late: c.late, mul: c.shift.pay_mul || 1,
                    tasks: [], seq: 0, next: abs + T.first_after_min, done: 0, failed: 0, q: 0, seed: Math.floor(r() * 1e9) };
        return { ok: true, shift: s.shift, events: [note(s, { type: "shift_start", id: c.shift.id, late: c.late }, abs)] };
      },
      /** spawn tasks on schedule, expire missed ones, end the shift at its end time */
      tick: function (s, abs) {
        const sh = s.shift, J = R.job.def(), T = J.tasks, evs = [];
        if (!sh) return evs;
        const r = rng(sh.seed + sh.seq * 7919);
        while (sh.next <= abs && sh.next < sh.end - T.stop_before_end_min) {
          const types = Object.entries(T.types), tot = types.reduce((a, [, v]) => a + v.weight, 0);
          let x = r() * tot, kind = types[0][0];
          for (const [k, v] of types) { if (x < v.weight) { kind = k; break; } x -= v.weight; }
          const def = T.types[kind], open = sh.tasks.filter((t) => !t.done && !t.failed);
          if (kind !== "checkout" && open.some((t) => t.kind === kind)) kind = "checkout";        // one of each chore at a time
          const td = T.types[kind], task = { id: "t" + ++sh.seq, kind, label: td.label, at: sh.next, deadline: sh.next + td.deadline_min, done: false, failed: false };
          if (kind === "checkout") task.items = td.items[0] + Math.floor(r() * (td.items[1] - td.items[0] + 1));
          if (kind === "restock") task.target = td.targets[Math.floor(r() * td.targets.length)];
          if (kind === "restock" && open.some((t) => t.kind === "restock" && t.target === task.target)) task.target = td.targets.find((g) => !open.some((t) => t.target === g)) || task.target;
          sh.tasks.push(task); evs.push(note(s, { type: "task_new", task: task.id, kind, label: task.label }, sh.next));
          sh.next += T.every_min[0] + r() * (T.every_min[1] - T.every_min[0]);
          void def;
        }
        for (const t of sh.tasks) if (!t.done && !t.failed && abs >= t.deadline) { t.failed = true; sh.failed++; evs.push(note(s, { type: "task_failed", task: t.id, kind: t.kind, label: t.label }, abs)); }
        if (abs >= sh.end) evs.push(...R.job.finish(s, sh.end, "done").events);
        return evs;
      },
      open: (s) => (s.shift ? s.shift.tasks.filter((t) => !t.done && !t.failed) : []),
      /** shifts you could book (排班) from abs: today's not-yet-started ones + the next max_ahead_days days */
      slots: function (s, abs) {
        const J = R.job.def(), B = J.booking || {}, day = Math.floor(abs / DAY), out = [];
        for (let dd = 0; dd <= (B.max_ahead_days || 2); dd++) for (const sh of J.shifts) {
          const st = (day + dd) * DAY + hm(sh.from); if (st <= abs + 30) continue;
          const booked = (s.job && s.job.booked || []).some((b) => b.start === st && b.id === sh.id);
          out.push({ id: sh.id, label: sh.label, from: sh.from, to: sh.to, start: st, day: day + dd, booked, date: R.date(st).label });
        }
        return out;
      },
      book: function (s, abs, id, start) {
        const J = R.job.def(), B = J.booking || {};
        if (!s.job) return { ok: false, reason: "还没被录用" };
        const sl = R.job.slots(s, abs).find((x) => x.id === id && x.start === start); if (!sl) return { ok: false, reason: "排不了这个班" };
        if (sl.booked) return { ok: false, reason: "已经排了" };
        s.job.booked = s.job.booked || [];
        if (s.job.booked.length >= (B.max_booked || 6)) return { ok: false, reason: "排太多班了" };
        if (s.job.booked.some((b) => Math.floor(b.start / DAY) === sl.day && (J.max_per_day || 1) <= 1)) return { ok: false, reason: "这天已经排了一个班" };
        s.job.booked.push({ id, start, label: sl.label }); s.job.booked.sort((a, b) => a.start - b.start);
        return { ok: true, slot: sl, events: [note(s, { type: "shift_booked", id, start, label: sl.label, date: sl.date }, abs)] };
      },
      /** book whatever shift's check-in window contains abs (dev / tests / "顶班" when the manager asks you on the spot) */
      bookAt: function (s, abs) { const w = R.job.windowAt(abs); if (!w || !s.job) return { ok: false }; s.job.booked = s.job.booked || []; if (!s.job.booked.some((b) => b.start === w.start)) s.job.booked.push({ id: w.shift.id, start: w.start, label: w.shift.label }); return { ok: true }; },
      unbook: function (s, abs, start) { if (!s.job || !s.job.booked) return { ok: false }; const n = s.job.booked.length; s.job.booked = s.job.booked.filter((b) => b.start !== start || b.start - abs < 120); return { ok: s.job.booked.length < n }; },
      /** booked shifts whose check-in window closed without you: 旷工 -> mood hit + strike (3 strikes -> fired) */
      noShows: function (s, abs) {
        const J = R.job.def(), B = J.booking || {}, evs = [];
        for (const b of s.job.booked.slice()) if (abs > b.start + J.checkin_after_min && !(s.shift && s.shift.start === b.start)) {
          s.job.booked = s.job.booked.filter((x) => x !== b); s.job.strikes = (s.job.strikes || 0) + 1;
          s.needs.mood = clamp(s.needs.mood + (B.no_show_mood || -6), 0, 100);
          evs.push(note(s, { type: "shift_missed", id: b.id, label: b.label, strikes: s.job.strikes }, abs));
          if (B.fire_after && s.job.strikes >= B.fire_after) { evs.push(note(s, { type: "fired", strikes: s.job.strikes }, abs)); s.job = null; break; }
        }
        return evs;
      },
      complete: function (s, taskId, quality, abs) {
        const sh = s.shift; if (!sh) return { ok: false, reason: "没在上班" };
        const t = sh.tasks.find((x) => x.id === taskId); if (!t || t.done || t.failed) return { ok: false, reason: "没有这个活" };
        t.done = true; t.quality = clamp(quality == null ? 1 : quality, 0, 1); sh.done++; sh.q += t.quality;
        return { ok: true, events: [note(s, { type: "task_done", task: t.id, kind: t.kind, quality: t.quality }, abs)] };
      },
      /** pay: worked hours x rate (x night bonus), late cut, early-leave cut, performance bonus; staff meal */
      finish: function (s, abs, why) {
        const sh = s.shift, J = R.job.def(); if (!sh) return { ok: false, events: [] };
        const t1 = Math.min(abs, sh.end), t0 = Math.max(sh.checkin, sh.start), hours = Math.max(0, (t1 - t0) / 60);
        let base = hours * (J.pay_per_h + (s.job.raise || 0)) * sh.mul;
        const lateMin = Math.max(0, sh.late - J.late_grace_min), cut = lateMin * J.late_cut_per_min;
        if (why === "left") base *= J.early_leave_mul;
        const hol = BASE != null && R.date(sh.start).statutory && J.holiday_mul ? J.holiday_mul : 1;
        base *= hol;
        const total = sh.done + sh.failed, perf = total ? clamp((sh.q - sh.failed * 0.6) / total, 0, 1) : 0.5;
        const bonus = why === "left" ? 0 : Math.round(perf * (J.perf_bonus_per_h != null ? J.perf_bonus_per_h * (sh.end - sh.start) / 60 : J.perf_bonus));
        const pay = Math.max(0, Math.round(base - cut + bonus));
        s.money += pay; s.stats.earned += pay; s.stats.shifts++; s.job.shifts++;
        if (why !== "left") for (const [it, n] of Object.entries(J.staff_meal || {})) R.addItem(s, it, n);
        if (why !== "left" && J.staff_meal_price) { s.money -= J.staff_meal_price; s.stats.spent += J.staff_meal_price; }   // 员工价便当，从工资里扣
        const ev = note(s, { type: "shift_paid", id: sh.id, pay, base: Math.round(base), cut: Math.round(cut), bonus, perf: Math.round(perf * 100) / 100, done: sh.done, failed: sh.failed, hours: Math.round(hours * 10) / 10, why, holiday: hol > 1 }, abs);
        s.shift = null;
        return { ok: true, pay, events: [ev] };
      },
    };

    // =====================================================================================================
    // social: affinity 0..100 per NPC; greet once a day, chat (capped per day), gifts by taste, witnesses
    const SO = () => D.social;
    R.social = {
      aff: (s, id) => (s.aff[id] || 0),
      tier: function (s, id) { let t = SO().tiers[0]; for (const x of SO().tiers) if (R.social.aff(s, id) >= x[0]) t = x; return { at: t[0], label: t[1] }; },
      name: (id) => (SO().npcs[id] ? SO().npcs[id].name : id),
      raise: function (s, id, v, abs, why) {
        const before = R.social.aff(s, id); s.aff[id] = clamp(before + v, 0, 100);
        const evs = [], np = SO().npcs[id];
        if (np && np.perk && before < np.perk.at && s.aff[id] >= np.perk.at && !s.perks[np.perk.id]) {
          s.perks[np.perk.id] = true; if (np.perk.id === "manager_raise" && s.job) s.job.raise = 4;
          evs.push(note(s, { type: "perk", npc: id, perk: np.perk.id, label: np.perk.label }, abs));
        }
        return evs;
      },
      day: (abs) => Math.floor(abs / DAY),
      /** greet / chat gains: halved while wearing dirty clothes */
      mul: (s) => (s.clothes && R.clothes.isDirty(s) && SO().dirty_clothes_mul != null ? SO().dirty_clothes_mul : 1),
      met: function (s, id, abs) { const k = id + "@" + R.social.day(abs); s.met[k] = s.met[k] || { greet: false, gain: 0 }; return s.met[k]; },
      line: function (s, id, abs) {
        const np = SO().npcs[id]; if (!np) return "……";
        const keys = Object.keys(np.lines).map(Number).sort((a, b) => a - b); let k = keys[0];
        for (const x of keys) if (R.social.aff(s, id) >= x) k = x;
        const L = np.lines[k]; return L[(R.social.day(abs) + Math.floor(abs / 37)) % L.length];
      },
      greet: function (s, id, abs) {
        const m = R.social.met(s, id, abs);
        if (m.greet) return { ok: false, reason: "今天打过招呼了" };
        const gv = SO().greet * R.social.mul(s);
        m.greet = true; m.gain += gv; add(s, "mood", 1);
        const evs = [note(s, { type: "greet", npc: id }, abs), ...R.social.raise(s, id, gv, abs)];
        return { ok: true, line: R.social.line(s, id, abs), events: evs };
      },
      chat: function (s, id, abs) {
        const m = R.social.met(s, id, abs), room = Math.max(0, SO().daily_cap - m.gain), g = Math.min(room, SO().chat * R.social.mul(s));
        m.gain += g; add(s, "mood", SO().chat_mood);
        const evs = [note(s, { type: "chat", npc: id, gain: g }, abs), ...R.social.raise(s, id, g, abs)];
        return { ok: true, minutes: SO().chat_minutes, gain: g, line: R.social.line(s, id, abs), capped: g < SO().chat, events: evs };
      },
      giftValue: function (id, item) { const np = SO().npcs[id]; return !np ? 0 : np.likes.includes(item) ? SO().gift_like : np.dislikes.includes(item) ? SO().gift_dislike : SO().gift_ok; },
      gifts: (s) => Object.keys(s.items).filter((it) => s.items[it] > 0 && (D.items[it].gift || ["egg", "drink", "milk", "bun", "bread"].includes(it))),
      gift: function (s, id, item, abs, n) {
        n = n || 1; if ((s.items[item] || 0) < n) return { ok: false, reason: `没有${D.items[item].label}` };
        s.items[item] -= n; const v = R.social.giftValue(id, item);
        const evs = [note(s, { type: "gift", npc: id, item, n, value: v }, abs), ...R.social.raise(s, id, v, abs)];
        return { ok: true, value: v, reaction: v >= SO().gift_like ? "like" : v < 0 ? "dislike" : "ok", events: evs };
      },
    };

    // =====================================================================================================
    // damage: a bill when somebody saw it (witness NPCs lose affinity); bills are paid at the property notice board
    R.damage = function (s, kind, witnesses, abs) {
      const K = D.damage && D.damage.kinds[kind]; if (!K) return { ok: false, events: [] };
      const evs = []; witnesses = witnesses || [];
      if (!witnesses.length) { add(s, "mood", D.damage.unwitnessed_mood); evs.push(note(s, { type: "damage", kind, billed: false }, abs)); return { ok: true, billed: false, events: evs }; }
      let amount = K.bill; if (s.perks.uncle_tip) amount = Math.ceil(amount / 2);
      const b = { id: "b" + (s.stats.fines + 1), kind, label: K.label, amount, t: abs, due: abs + D.damage.due_days * DAY, by: witnesses.slice() };
      s.stats.fines++;
      if (amount > 0) s.bills.push(b);
      for (const w of witnesses) if (SO().npcs[w]) evs.push(...R.social.raise(s, w, SO().witness, abs));
      evs.push(note(s, { type: "damage", kind, billed: amount > 0, amount, witnesses }, abs));
      if (amount > 0) evs.push(note(s, { type: "billed", id: b.id, amount, label: K.label }, abs));
      return { ok: true, billed: amount > 0, bill: b, events: evs };
    };
    R.billsTotal = (s) => s.bills.reduce((t, b) => t + b.amount, 0);
    R.payBills = function (s, abs) {
      const evs = []; let paid = 0;
      for (const b of s.bills.slice()) { if (s.money < b.amount) break; s.money -= b.amount; s.stats.spent += b.amount; paid += b.amount; s.bills.splice(s.bills.indexOf(b), 1); evs.push(note(s, { type: "bill_paid", id: b.id, amount: b.amount }, abs)); }
      return { ok: paid > 0, paid, left: R.billsTotal(s), reason: paid ? null : s.bills.length ? "钱不够" : "没有欠款", events: evs };
    };

    // =====================================================================================================
    // quests: data-driven steps advanced by events (every note()) or state conditions (every tick)
    function match(on, ev) {
      if (on.type !== ev.type) return false;
      for (const [k, v] of Object.entries(on)) {
        if (k === "type") continue;
        if (v === null) { if (ev[k]) return false; continue; }
        if (Array.isArray(v) ? !v.includes(ev[k]) : ev[k] !== v) return false;
      }
      return true;
    }
    function condOk(s, c) {
      if (c.affinity) return R.social.aff(s, c.affinity.npc) >= c.affinity.gte;
      if (c.affinity_count) return Object.keys(s.aff).filter((k) => s.aff[k] >= c.affinity_count.gte).length >= c.affinity_count.n;
      if (c.money_gte != null) return s.money >= c.money_gte;
      return false;
    }
    function questStarts(s, ev, abs) {
      const evs = [];
      for (const q of D.quests) {
        if (s.quests[q.id]) continue;
        const st = q.start || {};
        const go = st.auto || (st.after && s.quests[st.after] && s.quests[st.after].state === "done") || (st.cond && condOk(s, st.cond)) || (st.on && ev && match(st.on, ev));
        if (go) { s.quests[q.id] = { state: "active", step: 0, n: 0, seen: {} }; evs.push(note(s, { type: "quest_started", quest: q.id, title: q.title }, abs)); }
      }
      return evs;
    }
    function advance(s, q, Q, abs) {
      const evs = []; Q.step++; Q.n = 0; Q.seen = {};
      if (Q.step >= q.steps.length) {
        Q.state = "done"; const rw = q.reward || {};
        if (rw.money) { s.money += rw.money; s.stats.earned += rw.money; }
        if (rw.mood) add(s, "mood", rw.mood);
        for (const [id, v] of Object.entries(rw.affinity || {})) evs.push(...R.social.raise(s, id, v, abs));
        evs.push(note(s, { type: "quest_done", quest: q.id, title: q.title, reward: rw }, abs));
      } else evs.push(note(s, { type: "quest_step", quest: q.id, step: Q.step, text: q.steps[Q.step].text }, abs));
      return evs;
    }
    function questEvent(s, ev, abs) {
      questStarts(s, ev, abs);
      for (const q of D.quests) {
        const Q = s.quests[q.id]; if (!Q || Q.state !== "active") continue;
        const step = q.steps[Q.step];
        if (step.fail_on && match(step.fail_on, ev)) { Q.state = "failed"; note(s, { type: "quest_failed", quest: q.id, title: q.title }, abs); continue; }
        if (!step.on || !match(step.on, ev)) continue;
        if (step.distinct) { Q.seen[ev[step.distinct]] = 1; Q.n = Object.keys(Q.seen).length; }
        else Q.n += step.sum ? ev[step.sum] || 1 : 1;
        if (Q.n >= (step.n || 1)) advance(s, q, Q, abs);
      }
    }
    function questConds(s, abs) {
      const evs = questStarts(s, null, abs);
      for (const q of D.quests) {
        const Q = s.quests[q.id]; if (!Q || Q.state !== "active") continue;
        const step = q.steps[Q.step];
        if (step.cond && condOk(s, step.cond)) evs.push(...advance(s, q, Q, abs));
      }
      return evs;
    }
    /** engine-reported events (enter a scene, talk to someone ...) */
    R.notify = (s, ev, abs) => note(s, ev, abs || 0);
    /** quest list for a journal UI: [{id, title, state, step text, progress}] */
    R.questLog = function (s) {
      return (D.quests || []).filter((q) => s.quests[q.id]).map((q) => {
        const Q = s.quests[q.id], st = q.steps[Math.min(Q.step, q.steps.length - 1)];
        return { id: q.id, title: q.title, state: Q.state, step: Q.step, steps: q.steps.length, text: Q.state === "done" ? "完成" : st.text, progress: st.n ? `${Q.n}/${st.n}` : "" };
      });
    };

    // =====================================================================================================
    // lease: monthly (or quarterly 押一付三) rent on the move-in date, reminders, grace, late fees, eviction warning
    const LS = () => D.lease;
    const fmt = (t, v) => t.replace(/\{(\w+)\}/g, (_, k) => (v[k] != null ? v[k] : ""));
    R.lease = {
      months: (plan) => LS().plans[plan].months,
      amount: (s) => s.lease.rent * R.lease.months(s.lease.plan),
      dueAbs: (day) => day * DAY + LS().due_min,
      msg: (k, v) => { const m = LS().msgs[k]; return fmt(Array.isArray(m) ? m[Math.min(m.length - 1, v.i || 0)] : m, v); },
      /** move-in: deposit + first period are already paid (by the agent's contract); next due = move-in date + period */
      init: function (s, abs, plan) {
        const L = LS(), day = Math.floor(abs / DAY), anchor = R.date(abs).d;
        s.lease = { plan, rent: L.rent, deposit: L.rent * L.deposit_months, anchor, start: day, periods: 1, late: null, check: 0, fees: 0, warned: false, final: false, reminded: false };
        s.rentDue = R.lease.dueAbs(R.addMonths(day, R.lease.months(plan), anchor));
      },
      /** switch payment plan; applies from the next due date */
      setPlan: (s, plan) => { if (!LS().plans[plan]) return false; s.lease.plan = plan; return true; },
      status: function (s, abs) {
        const L = s.lease, due = s.rentDue, dd = R.date(due);
        return { plan: L.plan, planLabel: LS().plans[L.plan].label, rent: L.rent, amount: R.lease.amount(s), due, dueLabel: dd.label,
                 days: Math.max(0, Math.ceil((due - abs) / DAY)), hours: Math.max(0, Math.round((due - abs) / 60)), owed: s.owed,
                 lateDays: L.late != null ? Math.floor((abs - L.late) / DAY) : 0, fees: L.fees, deposit: L.deposit, landlord: LS().landlord };
      },
      pay: function (s, abs, late) {
        const amt = s.owed; s.money -= amt; s.stats.spent += amt; s.owed = 0; s.rentPaid++; s.lease.late = null;
        return [note(s, { type: "rent_paid", amount: amt, late: !!late, method: D.payment ? D.payment.transfer : "转账" }, abs),
                note(s, { type: "landlord_msg", kind: "paid", text: R.lease.msg("paid", {}) }, abs)];
      },
      tick: function (s, abs) {
        const L = LS(), S = s.lease, evs = [];
        if (!S.reminded && s.rentDue - abs <= L.remind_before_days * DAY) {
          S.reminded = true; evs.push(note(s, { type: "landlord_msg", kind: "before", text: R.lease.msg("before", { date: R.date(s.rentDue).label, amount: R.lease.amount(s) }) }, abs));
        }
        while (abs >= s.rentDue) {
          const amt = R.lease.amount(s), due = s.rentDue, day = Math.floor(due / DAY);
          s.owed += amt; S.periods++;
          if (s.money >= s.owed) evs.push(...R.lease.pay(s, due, false));
          else { add(s, "mood", L.late_mood); if (S.late == null) { S.late = due; S.check = due + DAY; } evs.push(note(s, { type: "rent_owed", amount: amt, owed: s.owed }, due)); }
          s.rentDue = R.lease.dueAbs(R.addMonths(day, R.lease.months(S.plan), S.anchor)); S.reminded = false;
        }
        // overdue: a daily check at due_min — retry the transfer, remind (grace), late fee, warning, final notice
        while (S.late != null && abs >= S.check) {
          const t = S.check, n = Math.round((t - S.late) / DAY); S.check += DAY;
          if (s.money >= s.owed) { evs.push(...R.lease.pay(s, t, true)); break; }
          if (n <= L.grace_days) { evs.push(note(s, { type: "landlord_msg", kind: "grace", days: n, text: R.lease.msg("grace", { i: n - 1 }) }, t)); continue; }
          const fee = Math.round(S.rent * L.late_fee_pct_per_day / 100); s.owed += fee; S.fees += fee;
          evs.push(note(s, { type: "late_fee", days: n, fee, owed: s.owed, text: R.lease.msg("late", { days: n, fee }) }, t));
          if (n >= L.evict_warn_days && !S.warned) { S.warned = true; add(s, "mood", L.late_mood); evs.push(note(s, { type: "evict_warning", days: n, text: R.lease.msg("warn", {}) }, t)); }
          if (n >= L.evict_final_days && !S.final) {
            S.final = true; const use = Math.min(S.deposit, s.owed); S.deposit -= use; s.owed -= use; add(s, "mood", L.final_mood);
            evs.push(note(s, { type: "evict_final", days: n, deposit_used: use, owed: s.owed, text: R.lease.msg("final", {}) }, t));
            if (!(s.owed > 0)) { S.late = null; break; }
          }
        }
        return evs;
      },
    };

    // =====================================================================================================
    // power: per-appliance metering (D.appliances, watts). s.power.on = switched-on appliances (lights, PC, AC ...),
    // `always` ones (fridge, router) draw 24 h; actions add what they `run` (induction, water heater, washer) and the
    // extra `busy` draw (PC while browsing). kWh land in s.meter.power and per appliance in s.power.kwh (this month).
    R.power = {
      ensure: (s) => (s.power = s.power || { on: {}, kwh: {} }),
      set: function (s, id, on) { const P = R.power.ensure(s); if (!D.appliances[id]) return false; if (on) P.on[id] = 1; else delete P.on[id]; return true; },
      isOn: (s, id) => !!(s.power && s.power.on[id]),
      add: function (s, id, kwh) { if (!(kwh > 0)) return; const P = R.power.ensure(s); s.meter.power += kwh; P.kwh[id] = (P.kwh[id] || 0) + kwh; },
      /** current draw in W (always-on + switched on) */
      watts: function (s) { let w = 0; for (const [id, A] of Object.entries(D.appliances)) if (id[0] !== "_" && (A.always || R.power.isOn(s, id))) w += A.w; return w; },
      tick: function (s, h) { for (const [id, A] of Object.entries(D.appliances)) if (id[0] !== "_" && (A.always || R.power.isOn(s, id))) R.power.add(s, id, A.w * h / 1000); },
      perform: function (s, a, minutes) {
        for (const r of a.runs || []) { const [id, m] = Array.isArray(r) ? r : [r, minutes]; const A = D.appliances[id]; if (A && !R.power.isOn(s, id)) R.power.add(s, id, A.w * (m || 0) / 60 / 1000); }
        for (const id of a.busy || []) { const A = D.appliances[id]; if (A) R.power.add(s, id, ((A.w_busy || A.w) - (R.power.isOn(s, id) ? A.w : 0)) * (minutes || 0) / 60 / 1000); }
      },
    };

    // households: occupancy per residential unit (D.households). state(id, abs, ctx) -> { st: home|out|asleep|vacant|player, tv, profile }
    const fnv = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 100000) / 100000; };
    R.households = {
      profile: function (id) {
        const H = D.households; if (!H) return "vacant";
        if (H.fixed && H.fixed[id]) return H.fixed[id];
        let u = fnv(id + "|p"), acc = 0;
        for (const [k, w] of Object.entries(H.weights)) { acc += w; if (u < acc) return k; }
        return "office";
      },
      state: function (id, abs, ctx) {
        const H = D.households, prof = R.households.profile(id);
        if (prof === "player" || prof === "vacant" || !H) return { st: prof === "player" ? "player" : "vacant", tv: false, profile: prof };
        const P = H.profiles[prof], day = Math.floor(abs / DAY), m = abs - day * DAY, off = R.date(abs).off;
        const sch = off ? P.off : P.work, j = (fnv(id + "|" + day) - 0.5) * 2 * (H.jitter_min || 0);
        let st = sch[0][1];
        for (const [t0, k] of sch) if (m >= t0 + (t0 ? j : 0)) st = k;
        const bad = ctx && (ctx.weather === "rain" || ctx.weather === "snow") && (ctx.intensity == null || ctx.intensity > 0.3);
        if (st === "out" && bad && off && m > 480 && m < 1200 && fnv(id + "|w" + day) < (H.p_weather_home || 0)) st = "home";
        const tv = st === "home" && m >= 1110 && m < 1380 && fnv(id + "|tv" + day) < (P.tv || 0);
        return { st, tv, profile: prof, label: P.label };
      },
      /** window light: home -> lit; a few leave a light on when out, a few sleep with a night light */
      lit: function (id, abs, ctx) {
        const H = D.households, r = R.households.state(id, abs, ctx), day = Math.floor(abs / DAY);
        if (r.st === "home") {
          // not every home shows a lit facade room: base chance + per-building / per-floor character (some blocks are mostly elderly / early sleepers)
          const m = /^(.*)_(\d+)F-/.exec(id), b = m ? m[1] : id, f = m ? m[2] : "0";
          const pd = (H.p_home_dark || 0) + ((fnv(b + "|bd") - 0.5) * (H.var_building || 0)) + ((fnv(b + f + "|fd") - 0.5) * (H.var_floor || 0));
          if (fnv(id + "|hd" + day + "|" + Math.floor((abs - day * DAY) / 90)) < pd) return { lit: false, tv: false, st: r.st, dark: true };
          return { lit: true, tv: r.tv, st: r.st };
        }
        if (r.st === "out") return { lit: fnv(id + "|on" + day) < (H.p_left_on || 0), tv: false, st: r.st };
        if (r.st === "asleep") return { lit: fnv(id + "|nl" + day) < (H.p_nightlight || 0), dim: true, tv: false, st: r.st };
        return { lit: false, tv: false, st: r.st };
      },
    };

    // utilities: meters (water 吨 / power 度 / gas 立方) from actions + base load; monthly bill with 物业费 + 宽带, 代扣
    const UT = () => D.utilities;
    R.utilities = {
      nextBill: function (abs) {
        const U = UT(); if (BASE == null) return Infinity;
        const dt = R.date(abs); let day = R.dayOf(dt.y, dt.m, U.bill_day);
        if (day * DAY + U.bill_min <= abs) day = R.addMonths(day, 1, U.bill_day);
        return day * DAY + U.bill_min;
      },
      lines: function (s) {
        const U = UT(), L = [];
        for (const [k, r] of Object.entries(U.rates)) L.push({ id: k, label: r.label, qty: Math.round(s.meter[k] * 100) / 100, unit: r.unit, amount: Math.round(R.utilities.cost(r, s.meter[k]) * 100) / 100,
                                                          by: k === "power" && s.power ? Object.assign({}, s.power.kwh) : undefined });
        for (const [k, f] of Object.entries(U.fixed || {})) L.push({ id: k, label: f.label, amount: f.amount });
        return L;
      },
      /** tiered price (rates.x.tiers = [[up to qty, price], ..., [null, price]]) or flat price */
      cost: function (r, q) {
        if (!r.tiers) return q * r.price;
        let left = q, prev = 0, sum = 0;
        for (const [cap, pr] of r.tiers) { const band = cap == null ? left : Math.min(left, cap - prev); sum += Math.max(0, band) * pr; left -= Math.max(0, band); prev = cap; if (left <= 0) break; }
        return sum;
      },
      preview: (s) => { const L = R.utilities.lines(s); return { lines: L, total: Math.round(L.reduce((t, x) => t + x.amount, 0)), next: s.utilNext }; },
      tick: function (s, h, abs) {
        const U = UT(), evs = [];
        for (const [k, v] of Object.entries(U.base_per_day || {})) s.meter[k] += v * h / 24;
        while (abs >= s.utilNext) {
          const t = s.utilNext, dt = R.date(t - DAY), L = R.utilities.lines(s), total = Math.round(L.reduce((a, x) => a + x.amount, 0));
          const label = `${dt.m}月水电燃气物业`;
          if (s.money >= total) { s.money -= total; s.stats.spent += total; evs.push(note(s, { type: "util_paid", amount: total, label, lines: L }, t)); }
          else { s.bills.push({ id: "util-" + dt.y + "-" + dt.m, kind: "utilities", label, amount: total, t, due: t + U.due_days * DAY, by: [] }); evs.push(note(s, { type: "billed", id: "util-" + dt.y + "-" + dt.m, amount: total, label }, t)); }
          s.meter = { water: 0, power: 0, gas: 0 }; if (s.power) s.power.kwh = {}; s.utilNext = R.utilities.nextBill(t + 1);
        }
        return evs;
      },
    };

    // =====================================================================================================
    // clothes + laundry: wear -> dirty basket -> washer (background) -> hang (balcony / roof) -> dries by weather -> wardrobe
    const LA = () => D.laundry;
    R.clothes = {
      isDirty: (s) => !!s.clothes && s.clothes.worn_h >= LA().wear_dirty_h,
      /** hours for a full dry now: weather / daylight / season (ctx.weather, ctx.sun 0..1, ctx.season, ctx.intensity) */
      dryHours: function (ctx, outdoor) {
        const L = LA(), w = ctx.weather || "clear", sun = ctx.sun == null ? 1 : ctx.sun;
        let hrs = w === "rain" && (ctx.intensity == null || ctx.intensity > 0.15) ? L.dry_h.rain : w === "snow" ? L.dry_h.snow : w === "fog" ? L.dry_h.fog : sun > 0.5 ? L.dry_h.sun : L.dry_h.clear_night;
        hrs *= (L.season_mul && L.season_mul[ctx.season]) || 1;
        if (outdoor && w === "clear" && sun > 0.5) hrs *= L.outdoor_mul;
        return hrs;
      },
      raining: (ctx) => (ctx.weather === "rain" || ctx.weather === "snow") && (ctx.intensity == null || ctx.intensity > 0.15),
      tick: function (s, h, ctx, sleeping) {
        const L = LA(), C = s.clothes, evs = [], abs = ctx.abs || 0;
        const was = R.clothes.isDirty(s);
        C.worn_h += h * (sleeping ? L.sleep_wear_mul : s.shift ? L.work_wear_mul : 1);
        if (!was && R.clothes.isDirty(s)) evs.push(note(s, { type: "clothes_dirty" }, abs));
        if (C.washer && !C.washer.told && abs >= C.washer.done) { C.washer.told = true; evs.push(note(s, { type: "wash_done", n: C.washer.n }, C.washer.done)); }
        for (const [where, r] of Object.entries(C.rack)) {
          if (!r) continue;
          const out = where !== "balcony";
          if (out && R.clothes.raining(ctx)) { if (r.wet < 0.99 || !r.soaked) { r.wet = 1; r.soaked = true; add(s, "mood", L.soak_mood); evs.push(note(s, { type: "laundry_soaked", where, n: r.n }, abs)); } continue; }
          r.soaked = false;
          const before = r.wet; r.wet = Math.max(0, r.wet - h / R.clothes.dryHours(ctx, out));
          if (before > L.collect_max_wet && r.wet <= L.collect_max_wet) evs.push(note(s, { type: "laundry_dry", where, n: r.n }, abs));
        }
        return evs;
      },
      check: function (s, a, ctx) {
        const C = s.clothes, L = LA(), abs = (ctx && ctx.abs) || 0; if (!C) return "没有衣服系统";
        if (a.kind === "change_clothes") return C.clean > 0 ? null : "没有干净衣服了，先洗衣服";
        if (a.kind === "laundry_wash") {
          if (C.washer) return abs >= C.washer.done ? "先把洗好的衣服晾起来" : `洗衣机正在转（还剩${Math.ceil((C.washer.done - abs))}分钟）`;
          if (!(C.dirty > 0)) return "脏衣篮是空的";
          if (!(s.items.detergent > 0) && s.money < (D.items.detergent ? D.items.detergent.price : 0)) return "洗衣液用完了，也没钱买";
          return null;
        }
        if (a.kind === "laundry_hang") {
          if (!C.washer) return "洗衣机里没有衣服";
          if (abs < C.washer.done) return `还没洗完（还剩${Math.ceil(C.washer.done - abs)}分钟）`;
          if (C.rack[a.rack]) return "晾衣杆上还挂着衣服";
          if (a.rack !== "balcony" && ctx && R.clothes.raining(ctx)) return "在下雨，天台晾不了";
          return null;
        }
        if (a.kind === "laundry_collect") {
          const r = C.rack[a.rack]; if (!r) return "这里没有你晾的衣服";
          if (r.wet > L.collect_max_wet) return `还没干（大概还要${Math.max(1, Math.round(r.wet * R.clothes.dryHours(ctx || {}, a.rack !== "balcony")))}小时）`;
          return null;
        }
        return null;
      },
      perform: function (s, a, abs) {
        const C = s.clothes, L = LA(), evs = [];
        if (a.kind === "change_clothes") { C.clean--; C.dirty++; C.worn_h = 0; }
        else if (a.kind === "laundry_wash") {
          // one dose per load: uses a 洗衣液 bottle's dose (a bottle = 20 loads), buying one if none is left
          if (!(s.items.detergent > 0)) { const p = D.items.detergent.price; s.money -= p; s.stats.spent += p; R.addItem(s, "detergent", 1); evs.push(note(s, { type: "spend", amount: p, why: "detergent" }, abs)); C.doses = 20; }
          C.doses = (C.doses == null ? 20 : C.doses) - 1; if (C.doses <= 0) { s.items.detergent--; C.doses = 20; }
          const n = Math.min(C.dirty, L.washer.load_max); C.dirty -= n; C.washer = { n, start: abs, done: abs + L.washer.minutes };
          for (const [k, v] of Object.entries(L.washer.use)) if (s.meter) s.meter[k] += v;
          evs.push(note(s, { type: "wash_start", n, done: C.washer.done }, abs));
        } else if (a.kind === "laundry_hang") { C.rack[a.rack] = { n: C.washer.n, wet: 1, t: abs }; C.washer = null; evs.push(note(s, { type: "laundry_hung", where: a.rack }, abs)); }
        else if (a.kind === "laundry_collect") { const r = C.rack[a.rack]; C.clean += r.n; C.rack[a.rack] = null; evs.push(note(s, { type: "laundry_collected", where: a.rack, n: r.n }, abs)); }
        return evs;
      },
      status: function (s, abs) {
        const C = s.clothes;
        return { clean: C.clean, dirty: C.dirty, worn_h: Math.round(C.worn_h * 10) / 10, isDirty: R.clothes.isDirty(s),
                 washer: C.washer ? { n: C.washer.n, left: Math.max(0, Math.ceil(C.washer.done - abs)), done: abs >= C.washer.done } : null,
                 rack: Object.fromEntries(Object.entries(C.rack).filter(([, r]) => r).map(([k, r]) => [k, { n: r.n, wet: Math.round(r.wet * 100) / 100, soaked: !!r.soaked }])) };
      },
    };
    /** shared bike: ¥1.5 per started 30 min; bus flat fare */
    R.fare = function (kind, minutes) {
      const T = D.transport || {};
      if (kind === "shared_bike") return Math.max(1, Math.ceil((minutes || 1) / 30)) * T.shared_bike.per_30min;
      if (kind === "bus") return T.bus.fare;
      return 0;
    };

    R.serialize = (s) => JSON.stringify(s);
    R.load = (str) => JSON.parse(str);
    return R;
  }
  return { create, version: 3 };
});
