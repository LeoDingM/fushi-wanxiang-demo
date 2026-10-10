/* Amenities-Market smoke (no browser): scene builders + goods vs shared-rules + file presence */
const assert = require("assert"), path = require("path"), fs = require("fs"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const rules = JSON.parse(fs.readFileSync(path.join(ROOT, "shared-rules/rules.json"), "utf8"));
let n = 0; const ok = (m) => { n++; console.log("PASS", m); };

// Mock minimal SP so amenities_market.js installs scene builders without canvas
const SP = { scenes: {}, places: {}, game: null, world: null, toast: () => {} };
global.window = global; global.SP = SP; global.SCENE_DATA = { objects: [] };
const code = fs.readFileSync(path.join(ROOT, "js/amenities_market.js"), "utf8");
vm.runInThisContext(code);
assert(SP.amenities, "SP.amenities");
ok("module loads");

// Manually call builders via install with stubs
SP.game = {
  ps: { money: 100, items: {}, stats: { spent: 0 }, amenity: { bag: {}, visits: 0 } },
  rules: {
    addItem: (s, it, k) => { s.items[it] = (s.items[it] || 0) + (k || 1); },
    payLabel: () => "微信支付",
    _note: () => {},
  },
  actionFor() {}, use() {}, pick() {}, update() {},
  go() {}, openMenu() {}, closeMenu() {}, payCard() {},
};
SP.world = { interior: false, sceneId: "street", objects: [], byId: {}, rebuildColliders() {} };
SP.clock = { abs: () => 600 };
SP.amenities.installed = false;
SP.amenities.install();
assert(SP.scenes.market_jhl && SP.scenes.smkt_jhl);
assert(SP.scenes.market_jhl.interior && SP.scenes.smkt_jhl.interior);
ok("scenes registered");

const M = SP.scenes.market_jhl, S = SP.scenes.smkt_jhl;
assert(M.objects.some((o) => o.interact === "mkt_stall"));
assert(S.objects.some((o) => o.interact === "smkt_shelf"));
assert(M.portals.some((p) => p.to === "street"));
assert(S.portals.some((p) => p.to === "street"));
ok("stalls / aisles / exit portals");

const stubs = SCENE_DATA.objects.filter((o) => /mkt_jhl|smkt_jhl/.test(o.id));
assert(stubs.length >= 4, "street stubs " + stubs.length);
assert(stubs.some((o) => o.interact === "market"));
assert(stubs.some((o) => o.interact === "supermarket"));
ok("old-block street stubs injected");

// buy 1–2 items
const buy = SP.amenities.buy;
const r1 = buy(SP.game.ps, "veg", 600); assert(r1.ok); assert.equal(SP.game.ps.items.veg, 1);
const r2 = buy(SP.game.ps, "egg", 600); assert(r2.ok); assert.equal(SP.game.ps.items.egg, 1);
const r3 = buy(SP.game.ps, "noodles", 600); assert(r3.ok);
assert(SP.game.ps.amenity.bag.veg >= 1 && SP.game.ps.amenity.bag.noodles >= 1);
ok("buy veg+egg+noodles into bag/items");

// prices match shared-rules items
assert.equal(rules.items.egg.price, SP.amenities.GOODS.egg.price);
assert.equal(rules.items.veg.price, SP.amenities.GOODS.veg.price);
ok("prices align with shared-rules");

assert(SP.amenities.SLIDE_EAST.market[0] > 0);
ok("midtown slide stub constant");

for (const f of ["img/amenities/market_sign.png", "img/amenities/supermarket_sign.png", "market_preview.html", "js/amenities_market.js"]) {
  assert(fs.existsSync(path.join(ROOT, f)), f);
}
ok("art + preview present");

console.log(`MARKET smoke ${n}/${n} PASS`);
process.exit(0);
