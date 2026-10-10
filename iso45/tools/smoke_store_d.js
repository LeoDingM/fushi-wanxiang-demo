/* Store-D smoke: node tools/smoke_store_d.js — rules + layout + store.js deepens (no browser) */
const assert = require("assert"), path = require("path"), fs = require("fs");
const ROOT = path.join(__dirname, "..");
const data = () => JSON.parse(fs.readFileSync(path.join(ROOT, "shared-rules/rules.json"), "utf8"));
const R = require(path.join(ROOT, "shared-rules/rules.js")).create(data());
const F = require(path.join(ROOT, "js/store.js")).create(R);
const DAY = 1440, H = (h, m) => h * 60 + (m || 0);
let n = 0; const ok = (name) => { n++; console.log("PASS", name); };

const s = R.newState(H(6)); s.lease = null; s.rentDue = 1e9; s.utilNext = Infinity;
assert.equal(F.phase(s, H(6)).id, "hire");
assert(F.apply(s, H(6)).ok);
const sl = F.slots(s, H(6)).find((x) => x.id === "morning" && x.day === 0);
assert(F.book(s, H(6), "morning", sl.start).ok);
assert(F.clockIn(s, H(6, 55)).ok);
ok("clock-in");

s.shift.tasks.push({ id: "tR", kind: "restock", label: "补货", target: "shelf_a", at: H(7), deadline: H(8), done: false, failed: false });
s.shift.tasks.push({ id: "tM", kind: "mop", label: "拖地", at: H(7), deadline: H(8), done: false, failed: false });
assert.equal(F.propWant(s).shelf_a, "low");
assert.equal(F.propWant(s).floor, "dirty");
ok("props empty-shelf + dirty-floor");

assert(F.doTask(s, "restock", "shelf_a", H(7, 2)).ok);
assert(F.doTask(s, "mop", null, H(7, 2)).ok);
assert.equal(F.propWant(s).shelf_a, "full");
assert.equal(F.propWant(s).floor, "clean");
ok("restock + mop → restocked / mopped");

R.tick(s, 60, { abs: H(8) });
const o = F.clockOut(s, H(9));
assert(o.ok && o.slip && o.slip.pay >= 0);
assert(s.store.bag.wage_slip >= 1);
assert(s.store.bank.some((b) => b.type === "wage"));
ok("clock-out wage slip in bag/bank");

const src = fs.readFileSync(path.join(ROOT, "js/store.js"), "utf8");
assert(/LED_NIGHT/.test(src) && /lightSnap/.test(src) && /storeDirty/.test(src));
ok("night lighting + floor litter hooks present");

assert(fs.existsSync(path.join(ROOT, "STORE_READY.md")));
ok("STORE_READY present");

console.log(`STORE-D smoke ${n}/${n} PASS`);
process.exit(0);
