/* node tools/test_store.js — rule tests for the 24便利店 module (js/store.js FushiStore.create(R) on shared-rules, no engine) */
const assert = require("assert"), path = require("path"), fs = require("fs");
const ROOT = path.join(__dirname, "..");
const data = () => JSON.parse(fs.readFileSync(path.join(ROOT, "shared-rules/rules.json"), "utf8"));
const mk = () => { const R = require(path.join(ROOT, "shared-rules/rules.js")).create(data()); delete require.cache[require.resolve(path.join(ROOT, "js/store.js"))]; return { R, F: require(path.join(ROOT, "js/store.js")).create(R) }; };
let n = 0, fail = 0; const t = (name, fn) => { try { fn(); n++; console.log("PASS", name); } catch (e) { fail++; console.log("FAIL", name, "\n  ", e.message); } };
const DAY = 1440, H = (h, m) => h * 60 + (m || 0);

t("prices: existing table values untouched (keys only added), store goods read the shared table", () => {
  const P = data().prices;
  const want = { "convenience store · 便利店": { bento: 15, buy_oden: 8, bread: 6, milk: 5, bun: 2, drink: 4, buy_drink: 4, buy_coffee: 9 }, "job · 工资与员工餐": { wage_per_h: 15, staff_meal: 8 },
                 "breakfast · 早点 ¥4–8": { buy_breakfast: 6 }, "gifts / household": { fruit: 20, tea: 48, candy: 6, cigs: 20, detergent: 18 } };
  for (const [g, tab] of Object.entries(want)) for (const [k, v] of Object.entries(tab)) assert.strictEqual(P[g][k], v, `${g}.${k}`);
  const { F } = mk(); assert.equal(F.price("bento"), 15); assert.equal(F.price("buy_oden"), 8); assert.equal(F.price("drink"), 4); assert.equal(F.price("st_cola"), 3.5); assert.equal(F.price("cigs"), 20);
  for (const g of F.goods()) assert(g.price > 0, g.id + " has a price");
});
t("rules.store section + wage note (¥15/h default, real tier-1 minimum higher)", () => {
  const { R } = mk(); assert(R.data.store && R.data.store.goods.bento); assert.equal(R.job.def().pay_per_h, 15);
  assert(/最低/.test(R.data.store._wage_note) && /¥24/.test(R.data.store._wage_note));
  for (const id of ["heat_bento_store", "eat_bar", "buy_oden", "buy_coffee"]) assert(R.data.actions[id], "reuses existing action " + id);
});
t("basket + checkout: WeChat pays the total, inventory goods -> items, the rest -> bag; Alipay label", () => {
  const { R, F } = mk(); const s = R.newState(H(8)), m0 = s.money, b0 = s.items.bento || 0;
  F.pick(s, "bento"); F.pick(s, "st_cola"); F.pick(s, "st_onigiri"); assert.equal(F.basketTotal(s), 24.5);
  const r = F.checkout(s, "wechat", H(8)); assert(r.ok); assert.equal(r.method, "微信支付"); assert.equal(s.money, m0 - 24.5);
  assert.equal(s.items.bento, b0 + 1); assert.deepEqual(s.store.bag, { st_cola: 1, st_onigiri: 1 }); assert.equal(s.store.basket.length, 0);
  F.pick(s, "drink"); const r2 = F.checkout(s, "alipay", H(8)); assert.equal(r2.method, "支付宝"); assert.equal(s.pay, "alipay");
});
t("checkout refused when broke or empty; basket limit 8", () => {
  const { R, F } = mk(); const s = R.newState(0); assert.equal(F.checkout(s, "wechat", 0).ok, false);
  s.money = 3; F.pick(s, "bento"); const r = F.checkout(s, "wechat", 0); assert.equal(r.ok, false); assert(/钱不够/.test(r.reason)); assert.equal(s.money, 3);
  for (let i = 0; i < 7; i++) F.pick(s, "bun"); assert.equal(F.pick(s, "bun").ok, false);
});
t("microwave (heat_bento_store) needs a bento, makes a hot one; eat_bar needs it (bar_meal flag), +60 hunger", () => {
  const { R, F } = mk(); const s = R.newState(0); s.items.bento = 0; assert.equal(F.heat(s, 0).ok, false);
  s.items.bento = 1; assert(F.heat(s, 0).ok); assert.equal(s.items.bento, 0); assert.equal(s.store.hot, 1); assert(F.flags(s).bar_meal);
  s.needs.hunger = 20; const r = F.eat(s, "eat_bar", 0); assert(r.ok); assert.equal(s.needs.hunger, 80); assert.equal(s.store.hot, 0); assert.equal(F.eat(s, "eat_bar", 0).ok, false);
});
t("eat at the bar: bag goods by rules.store.goods.eat; a cold bento is worse than a hot one", () => {
  const { R, F } = mk(); const s = R.newState(0); s.store = { basket: [], bag: { st_onigiri: 1 }, hot: 0, visits: 0 }; s.needs.hunger = 30;
  assert(F.edible(s).some((e) => e.id === "st_onigiri")); assert(F.eat(s, "st_onigiri", 0).ok); assert.equal(s.needs.hunger, 58); assert.equal(F.eat(s, "st_onigiri", 0).ok, false);
  s.items.bento = 1; s.needs.hunger = 20; assert(F.eat(s, "inv:bento", 0).ok); assert.equal(s.needs.hunger, 68);
});
t("hot food: oden = buy_oden ¥8 (pays, effects), latte ¥12 (store-only), refused without money", () => {
  const { R, F } = mk(); const s = R.newState(0), m = s.money;
  const r = F.buyHot(s, "oden", 0, "wechat"); assert(r.ok); assert.equal(r.paid.amount, 8); assert.equal(s.money, m - 8);
  const l = F.buyHot(s, "latte", 0, "alipay"); assert(l.ok); assert.equal(l.paid.amount, 12); assert.equal(l.paid.method, "支付宝");
  s.money = 1; assert.equal(F.buyHot(s, "americano", 0).ok, false);
});
t("shift: must be hired + booked; on-time morning shift, task loop, full shift pays 8h x ¥15 + bonus - staff meal", () => {
  const { R, F } = mk(); const s = R.newState(H(6)); s.utilNext = Infinity; s.lease = null; s.rentDue = 1e9;
  assert.equal(F.canClockIn(s, H(6, 50)).ok, false);
  assert(F.apply(s, H(6)).ok); assert(/排班/.test(F.canClockIn(s, H(6, 50)).reason));
  const slot = F.slots(s, H(6)).find((x) => x.id === "morning" && x.day === 0); assert(F.book(s, H(6), "morning", slot.start).ok);
  const r = F.clockIn(s, H(6, 55)); assert(r.ok); assert.equal(r.lateMin, 0);
  let done = 0, m0 = s.money;
  for (let m = H(6, 55); m < H(15, 1); m += 5) { R.tick(s, 5, { abs: m + 5 }); for (const tk of F.openTasks(s)) { const d = F.doTask(s, tk.kind, tk.target, m + 5); if (d.ok) { done++; assert.equal(d.quality, 1); } } }
  assert(!s.shift, "shift ended by itself at 15:00"); assert(done >= 10, "tasks done " + done);
  const ev = s.log.filter((e) => e.type === "shift_paid").pop(); assert(ev); assert.equal(ev.base, 120); assert(ev.bonus > 0);
  assert.equal(s.money - m0, ev.pay - R.job.def().staff_meal_price);
});
t("lateness: 40 min late = (40 - grace 10) x ¥0.5 cut; early clock-out halves the pay", () => {
  const { R, F } = mk(); const s = R.newState(H(6)); s.lease = null; s.rentDue = 1e9; s.utilNext = Infinity; F.apply(s, 0);
  const sl = F.slots(s, H(6)).find((x) => x.id === "morning" && x.day === 0); F.book(s, H(6), "morning", sl.start);
  const r = F.clockIn(s, H(7, 40)); assert(r.ok); assert.equal(r.lateMin, 30); assert.equal(r.cut, 15);
  R.tick(s, 140, { abs: H(10) }); const o = F.clockOut(s, H(10)); assert(o.ok); assert.equal(o.why, "left");
  const ev = s.log.filter((e) => e.type === "shift_paid").pop(); assert.equal(ev.cut, 15); assert.equal(ev.base, Math.round(140 / 60 * 15 * 0.5)); assert.equal(ev.bonus, 0);
});
t("absence: booked shift never clocked in = 旷工 (strike, mood -6); 3 strikes -> fired", () => {
  const { R, F } = mk(); const s = R.newState(H(6)); s.lease = null; s.rentDue = 1e9; s.utilNext = Infinity; F.apply(s, 0);
  for (let d = 0; d < 3; d++) {
    const sl = F.slots(s, d * DAY + H(6)).find((x) => x.id === "morning" && x.day === d); assert(F.book(s, d * DAY + H(6), "morning", sl.start).ok);
    const mood = s.needs.mood; R.tick(s, 1, { abs: d * DAY + H(8, 30) });
    if (d < 2) { assert.equal(s.job.strikes, d + 1); assert(s.needs.mood <= mood - 5.9); }
  }
  assert.equal(s.job, null); assert(s.log.some((e) => e.type === "fired"));
});
t("doTask: wrong / missing task refused; late completion = quality 0.7", () => {
  const { R, F } = mk(); const s = R.newState(H(6)); s.lease = null; s.rentDue = 1e9; s.utilNext = Infinity; F.apply(s, 0); R.job.bookAt(s, H(6, 50)); F.clockIn(s, H(6, 50));
  assert.equal(F.doTask(s, "mop", null, H(6, 51)).ok, false);
  R.tick(s, 15, { abs: H(7, 5) }); const tk = F.openTasks(s)[0]; assert(tk);
  const late = tk.at + (tk.deadline - tk.at) * 0.8; const d = F.doTask(s, tk.kind, tk.target, late); assert(d.ok); assert.equal(d.quality, 0.7);
});
t("layout store_24: build check 0 problems, every interactable kind is handled by store.js, routes clear", () => {
  const S = JSON.parse(fs.readFileSync(path.join(ROOT, "store45.json"), "utf8")).store_24, src = fs.readFileSync(path.join(ROOT, "js/store.js"), "utf8");
  assert.equal(S.layout_check.problems.length, 0); assert(S.layout_check.min_route_clearance >= 0.27);
  const kinds = new Set(S.objects.filter((o) => o.interact).map((o) => o.interact));
  for (const k of kinds) assert(new RegExp(`\\b${k}:`).test(src), "handler for " + k);
  for (const id of ["cooler", "cooler_b", "shelf_a", "shelf_b", "counter", "oden", "coffee", "micro", "bar", "bins", "staff_door"]) assert(S.objects.some((o) => o.id === id), id);
  const K = JSON.parse(fs.readFileSync(path.join(ROOT, "kit_store/kit_manifest.json"), "utf8"));
  for (const o of S.objects.filter((o) => o.type.startsWith("st_"))) assert(K.pieces[o.type], "kit_store piece " + o.type);
});
t("staff room + storefront + uniforms: back room 0 problems, lockers/board handled, portal back to the store; glass front replaces the S stubs; uniform sheets 8 dirs idle+walk", () => {
  const all = JSON.parse(fs.readFileSync(path.join(ROOT, "store45.json"), "utf8")), S = all.store_24, B = all.store_24_staff, src = fs.readFileSync(path.join(ROOT, "js/store.js"), "utf8");
  assert(B && B.layout_check.problems.length === 0);
  for (const k of new Set(B.objects.filter((o) => o.interact).map((o) => o.interact))) assert(new RegExp(`\\b${k}:`).test(src), "handler for " + k);
  assert(B.portals.some((p) => p.to === "store_24")); assert(B.objects.some((o) => o.id === "lockers") && B.objects.some((o) => o.id === "board"));
  assert(!S.objects.some((o) => o.type === "i_cut" && o.rot === 0 && o.y === 0), "S stubs replaced");
  assert(S.objects.filter((o) => o.fade_group === "storefront").length === 6 && S.objects.some((o) => o.id === "front_door"));
  global.window = global.window || {}; require(path.join(ROOT, "js/actors_store.js"));
  for (const n of ["clerk_zhao", "clerk_zhou", "li_mo_uniform"]) {
    const A = window.ACTORS[n]; assert(A && fs.existsSync(path.join(ROOT, A.img)), n);
    for (const d of ["S", "SE", "E", "NE", "N", "NW", "W", "SW"]) { assert(A.frames[`walk_${d}_0`], n + " walk " + d); assert(A.frames[`idle_${d}_0`] || A.frames[`idle_${d}_1`], n + " idle " + d); }
  }
  const L = JSON.parse(fs.readFileSync(path.join(ROOT, "tools/layouts/store_24.json"), "utf8"));
  assert.deepEqual(L.npcs.staff.map((s) => s.sprite), ["clerk_zhao", "clerk_zhou"]);
});
console.log(`STORE ${n}/${n + fail} ${fail ? "FAIL" : "PASS"}`); process.exit(fail ? 1 : 0);
