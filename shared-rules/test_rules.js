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
// ---------------- v2: shops, job, social, damage, quests, economy
t("store: buy catalog items into the inventory; refuses without money / unknown items", () => {
  const s = R.newState(0); const m = s.money;
  const r = R.buy(s, "store", "egg", 6, 0); assert(r.ok); assert.equal(s.items.egg, 10); assert.equal(s.money, m - 6);
  assert.equal(R.buy(s, "store", "rocket", 1, 0).ok, false); s.money = 1; assert.equal(R.buy(s, "store", "bento", 1, 0).reason, "钱不够");
});
t("job: hire, check-in window, seeded task loop, pay with late cut + perf bonus + staff meal", () => {
  const s = R.newState(0); const day = 2 * D;
  assert.equal(R.job.canStart(s, day + 17 * 60).ok, false);                     // not hired
  assert(R.job.hire(s, day).ok);
  assert(/不是上班时间/.test(R.job.canStart(s, day + 14 * 60).reason));
  const st = R.job.start(s, day + 17 * 60 + 25); assert(st.ok); assert.equal(st.shift.late, 25);
  let abs = day + 17 * 60 + 25; const kinds = new Set();
  while (s.shift) { abs += 5; R.tick(s, 5, { abs }); for (const t of R.job.open(s)) { kinds.add(t.kind); if (abs - t.at > 6) R.job.complete(s, t.id, 1, abs); } }
  const ev = s.log.filter((e) => e.type === "shift_paid").pop();
  assert(ev && ev.pay > 80, JSON.stringify(ev)); assert(ev.cut > 0); assert(ev.bonus > 20); assert(kinds.has("checkout"));
  assert.equal(s.items.bento, 1); assert.equal(R.job.canStart(s, day + 22 * 60).ok, false);   // one shift a day
  // determinism: the same shift for the same state yields the same task list
  const a = R.newState(0), b = R.newState(0); R.job.hire(a, 0); R.job.hire(b, 0);
  R.job.start(a, day + 17 * 60); R.job.start(b, day + 17 * 60); R.tick(a, 120, { abs: day + 19 * 60 }); R.tick(b, 120, { abs: day + 19 * 60 });
  assert.deepEqual(a.shift.tasks, b.shift.tasks); assert(a.shift.tasks.length >= 4);
});
t("job: missed tasks fail; leaving early halves the pay and skips the bonus", () => {
  const s = R.newState(0); R.job.hire(s, 0); const day = D; R.job.start(s, day + 7 * 60);
  R.tick(s, 90, { abs: day + 8 * 60 + 30 }); assert(s.shift.failed > 0);
  const r = R.job.finish(s, day + 9 * 60, "left"); assert(r.ok); const ev = s.log.find((e) => e.type === "shift_paid");
  assert.equal(ev.bonus, 0); assert(ev.pay <= 28 * 2 * 0.5 + 1); assert(!s.items.bento);
});
t("social: greet once a day, chat gains capped per day, gifts by taste, perk at a threshold", () => {
  const s = R.newState(0);
  const a0 = R.social.aff(s, "vendor"); assert(R.social.greet(s, "vendor", 100).ok); assert.equal(R.social.greet(s, "vendor", 200).ok, false);
  for (let i = 0; i < 5; i++) R.social.chat(s, "vendor", 300 + i);
  assert.equal(R.social.aff(s, "vendor"), a0 + R.data.social.daily_cap);                    // greet 2 + chats capped at 10 total
  R.addItem(s, "fruit", 3); R.addItem(s, "cigs", 1);
  assert.equal(R.social.gift(s, "vendor", "fruit", 400).reaction, "like"); assert.equal(R.social.gift(s, "vendor", "cigs", 400).reaction, "dislike");
  while (R.social.aff(s, "vendor") < 40 && s.items.fruit > 0) R.social.gift(s, "vendor", "fruit", 500);
  R.addItem(s, "fruit", 5); while (R.social.aff(s, "vendor") < 40) R.social.gift(s, "vendor", "fruit", 500);
  assert(s.perks.vendor_discount); assert.equal(R.costOf(s, "buy_breakfast"), 3);
  assert(typeof R.social.line(s, "vendor", 600) === "string");
});
t("damage: billed only with witnesses (they like you less), paid at the board, overdue costs mood", () => {
  const s = R.newState(0); const m0 = s.needs.mood;
  assert.equal(R.damage(s, "trashbin", [], 10).billed, false); assert(s.needs.mood < m0);
  const a = R.social.aff(s, "uncle"), r = R.damage(s, "window", ["uncle"], 20);
  assert(r.billed); assert.equal(R.billsTotal(s), 120); assert(R.social.aff(s, "uncle") < a || a === 0);
  const mm = s.needs.mood; R.tick(s, 60, { abs: 20 + 4 * D }); assert(s.needs.mood < mm);
  s.money = 50; assert.equal(R.payBills(s, 0).ok, false); s.money = 500; assert(R.payBills(s, 0).ok); assert.equal(R.billsTotal(s), 0);
});
t("quests: job chain via engine events, neighbours via distinct greets + affinity, amends after a bill", () => {
  const s = R.newState(0);
  assert.equal(s.quests.q_job.state, "active"); assert(!s.quests.q_amends);
  R.notify(s, { type: "enter", scene: "store" }, 10); assert.equal(s.quests.q_job.step, 1);
  R.job.hire(s, 20); assert.equal(s.quests.q_job.step, 2);
  R.job.start(s, D + 7 * 60); R.job.finish(s, D + 11 * 60, "done"); assert.equal(s.quests.q_job.state, "done");
  for (const id of ["vendor", "uncle", "student", "student", "rider"]) R.social.greet(s, id, 2 * D + 100);
  assert.equal(s.quests.q_neighbors.step, 1);
  s.aff.vendor = 40; s.aff.uncle = 36; R.tick(s, 1, { abs: 2 * D + 101 }); assert.equal(s.quests.q_neighbors.state, "done");
  assert(s.quests.q_eggs);                                             // vendor affinity >= 20 started 王阿姨的鸡蛋
  R.addItem(s, "egg", 6); R.social.gift(s, "vendor", "egg", 2 * D + 200, 6); assert.equal(s.quests.q_eggs.state, "done");
  R.damage(s, "pot", ["student"], 2 * D + 300); assert(s.quests.q_amends); R.payBills(s, 2 * D + 301); assert.equal(s.quests.q_amends.state, "done");
  assert(R.questLog(s).length >= 5);
});
t("economy: 7 simulated days - daily shifts save money, part-time ~breaks even, broke start recovers w/o soft-lock", () => {
  const { run } = require("./sim_week.js");
  const w = run("worker"), p = run("parttime"), b = run("broke", { start: { money: 0, owed: 450, items: {} } }), z = run("slacker");
  assert(w.s.money > 820 + 150, "worker " + w.s.money); assert.equal(w.s.owed, 0);
  assert(Math.abs(p.s.money - 820) < 200, "parttime " + p.s.money);
  for (const r of [w, p, b]) { assert(r.minNeed.hunger > 10 && r.minNeed.energy > 10 && r.minNeed.mood > 30, JSON.stringify(r.minNeed)); for (const row of r.rows) assert(row.money >= 0); }
  assert(b.s.money + 0 - b.s.owed > -450, "broke start must improve: " + b.s.money + " owed " + b.s.owed);
  assert(z.s.money < 820 - 400);                                      // not working is a choice that runs the money down
});
console.log(`RULES ${n}/${n} PASS`);
