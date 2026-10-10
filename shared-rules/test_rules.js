/* node test_rules.js — unit tests for rules.js (no engine) */
const assert = require("assert");
const R = require("./rules.js").create(require("./rules.json"));
let n = 0; const t = (name, fn) => { fn(); n++; console.log("PASS", name); };
const D = 1440;
t("new state has needs, money, items, first rent due on a Sunday 20:00", () => {
  const s = R.newState(465);
  assert.equal(s.money, 820); assert.equal(s.items.noodles, 2);
  assert.equal(R.weekday(s.rentDue), 0); assert.equal(s.rentDue % D, 1200); assert(s.rentDue > 465);
});
t("needs decay per hour", () => { const s = R.newState(0); R.tick(s, 60, { abs: 60 }); assert(Math.abs(s.needs.hunger - 66.5) < 1e-6); });
t("sleep: allowed only at night, wakes at 07:00, gains energy", () => {
  const s = R.newState(0); s.needs.energy = 20;
  assert.equal(R.check(s, "sleep", { abs: 15 * 60, place: "bed" }).ok, false);
  const r = R.perform(s, "sleep", { abs: 23 * 60, place: "bed" }); assert(r.ok); assert.equal(r.minutes, 8 * 60); assert.equal(r.activity, "sleep");
  R.tick(s, r.minutes, { abs: 23 * 60 + r.minutes, activity: "sleep" }); assert(s.needs.energy > 99); assert(s.needs.hunger < 70);
});
t("cooking consumes ingredients; fails when missing", () => {
  const s = R.newState(0); const h = s.needs.hunger;
  assert(R.perform(s, "cook_noodles", { abs: 0 }).ok); assert.equal(s.items.noodles, 1); assert.equal(s.items.egg, 3); assert(s.needs.hunger > h);
  s.items.noodles = 0; const c = R.check(s, "cook_noodles", {}); assert.equal(c.ok, false); assert(/方便面/.test(c.reason));
});
t("shower sets hygiene to 100", () => { const s = R.newState(0); s.needs.hygiene = 10; R.perform(s, "shower", {}); assert.equal(s.needs.hygiene, 100); });
t("buying costs money; refused without money or when the stall is closed", () => {
  const s = R.newState(0); assert.equal(R.check(s, "buy_breakfast", { flags: {} }).ok, false);
  assert(R.perform(s, "buy_breakfast", { flags: { vendor_open: true } }).ok); assert.equal(s.money, 814);
  s.money = 2; assert.equal(R.check(s, "buy_drink", {}).reason, "钱不够");
});
t("rent paid automatically when due; owed (+ mood hit, condition) when broke; pay_rent later", () => {
  const s = R.newState(0); const due = s.rentDue;
  R.tick(s, 1, { abs: due }); assert.equal(s.money, 370); assert.equal(s.rentPaid, 1); assert(s.rentDue === due + 7 * D);
  s.money = 100; const m = s.needs.mood; R.tick(s, 1, { abs: s.rentDue });
  assert.equal(s.owed, 450); assert(s.needs.mood < m); assert(R.status(s, {}).conditions.includes("欠着房租"));
  s.money = 500; assert(R.perform(s, "pay_rent", {}).ok); assert.equal(s.owed, 0); assert.equal(s.money, 50);
});
t("conditions: starving drains mood, sleepy slows walking", () => {
  const s = R.newState(0); s.needs.hunger = 5; s.needs.energy = 10; const m = s.needs.mood;
  R.tick(s, 60, { abs: 60 }); assert(s.needs.mood < m - 3); assert.equal(R.status(s, {}).speedMul, 0.72);
});
t("rain outdoors without umbrella hurts mood/hygiene, umbrella prevents it", () => {
  const a = R.newState(0), b = R.newState(0);
  R.tick(a, 60, { abs: 60, outdoors: true, weather: "rain" }); R.tick(b, 60, { abs: 60, outdoors: true, weather: "rain", umbrella: true });
  assert(a.needs.mood < b.needs.mood && a.needs.hygiene < b.needs.hygiene);
});
t("a week of sensible routine stays solvent and needs stay > 0", () => {
  const s = R.newState(420); let abs = 420;
  const step = (m, act) => { abs += m; R.tick(s, m, { abs, activity: act }); };
  for (let d = 0; d < 7; d++) {
    for (const id of ["wash", "buy_breakfast"]) { const r = R.perform(s, id, { abs, flags: { vendor_open: true } }); if (r.ok) step(r.minutes); }
    step(5 * 60); if (!R.perform(s, "cook_noodles", { abs }).ok) { R.addItem(s, "noodles", 3); R.addItem(s, "egg", 6); assert(R.perform(s, "cook_noodles", { abs }).ok); } step(20);
    step(6 * 60); R.perform(s, "shower", { abs }); step(15); R.perform(s, "browse", { abs }); step(60);
    const sl = R.perform(s, "sleep", { abs: Math.floor(abs / D) * D + 23 * 60, place: "bed" }); step(Math.floor(abs / D) * D + 23 * 60 - abs); step(sl.minutes, "sleep");
  }
  for (const k of R.needs) assert(s.needs[k] > 0, k + " " + s.needs[k]);
  assert.equal(s.rentPaid, 1); assert(s.money > 0);
});
t("serialize round-trip", () => { const s = R.newState(0); assert.deepEqual(R.load(R.serialize(s)), s); });
console.log(`RULES ${n}/${n} PASS`);
