/* 浮世万象 · shared-rules/rules.js — engine-agnostic gameplay rules: needs, money, inventory, rent, timed actions.
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

  function create(data) {
    const D = data, NEEDS = Object.keys(D.needs);
    const R = { data: D, needs: NEEDS };

    /** weekday 0=Sun..6 of an absolute minute */
    R.weekday = (abs) => (D.calendar.start_weekday + Math.floor(abs / DAY)) % 7;
    /** first rent due time strictly after abs */
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
      const s = { v: 1, needs: {}, money: D.money.start, items: Object.assign({}, D.start_items), owed: 0,
                  rentDue: R.nextRentDue(abs || 0), rentPaid: 0, flags: {}, log: [], stats: { actions: {}, spent: 0, earned: 0 } };
      for (const n of NEEDS) s.needs[n] = D.needs[n].start;
      return Object.assign(s, over || {});
    };
    function add(s, need, v) { s.needs[need] = clamp(s.needs[need] + v, 0, 100); }
    function note(s, ev, abs) { ev.t = abs; s.log.push(ev); if (s.log.length > 60) s.log.shift(); return ev; }
    /** active conditions for ctx {outdoors, weather, umbrella} */
    R.conditions = function (s, ctx) {
      ctx = ctx || {};
      return D.conditions.filter((c) => {
        const w = c.when;
        if (w.need && !(s.needs[w.need] < w.below)) return false;
        if (w.weather && !(ctx.weather === w.weather && (!w.outdoors || ctx.outdoors) && (!w.no_umbrella || !ctx.umbrella))) return false;
        if (w.owing && !(s.owed > 0)) return false;
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
      // rent: due every N days at due_min; pay automatically if the money is there, otherwise it is owed
      const abs = ctx.abs == null ? 0 : ctx.abs;
      while (abs >= s.rentDue) {
        const r = D.rent;
        if (s.money >= r.amount + s.owed) { s.money -= r.amount + s.owed; s.stats.spent += r.amount + s.owed; s.rentPaid++; evs.push(note(s, { type: "rent_paid", amount: r.amount + s.owed }, s.rentDue)); s.owed = 0; }
        else { s.owed += r.amount; add(s, "mood", r.late_mood); evs.push(note(s, { type: "rent_owed", amount: r.amount, owed: s.owed }, s.rentDue)); }
        s.rentDue = R.nextRentDue(s.rentDue);
      }
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
      if (a.allowed_from != null && !inWindow((ctx.abs || 0) % DAY, a.allowed_from, a.allowed_to)) return fail("还不到睡觉的时候");
      const q = a.requires || {};
      if (q.energy_below != null && !(s.needs.energy < q.energy_below)) return fail("现在不困");
      if (q.flag && !(ctx.flags && ctx.flags[q.flag])) return fail("现在没开");
      if (a.cost && s.money < a.cost) return fail("钱不够");
      for (const [it, n] of Object.entries(a.consume || {})) if ((s.items[it] || 0) < n) return fail(`没有${D.items[it].label}了`);
      if (a.kind === "pay_rent" && !(s.owed > 0)) return fail("不欠房租");
      if (a.kind === "pay_rent" && s.money < s.owed) return fail("钱不够");
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
      if (a.cost) { s.money -= a.cost; s.stats.spent += a.cost; }
      for (const [it, n] of Object.entries(a.consume || {})) s.items[it] -= n;
      for (const [n, v] of Object.entries(a.set || {})) s.needs[n] = clamp(v, 0, 100);
      for (const [n, v] of Object.entries(a.effects || {})) add(s, n, v);
      s.stats.actions[id] = (s.stats.actions[id] || 0) + 1;
      evs.push(note(s, { type: "action", id }, abs));
      return { ok: true, id, label: a.label, minutes: c.minutes, activity: a.kind === "sleep" ? id : null, text: a.text || a.label, events: evs };
    };
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
               moodLabel: m > 80 ? "心情很好" : m > 55 ? "还行" : m > 30 ? "有点低落" : "很沮丧" };
    };
    R.serialize = (s) => JSON.stringify(s);
    R.load = (str) => JSON.parse(str);
    return R;
  }
  return { create, version: 1 };
});
