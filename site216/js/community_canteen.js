/* A small canteen order-to-meal loop using the game's shared rules and timed-action flow. */
(function (root) {
  "use strict";
  const ROOM = "community_canteen_room";
  const COUNTER = "community_canteen_counter";
  const PACK = "community_canteen_pack";
  const SEAT = "community_canteen_seat";
  const ACTION = "community_canteen_eat";
  const DURATION = 20;
  const OPEN_FROM = 7 * 60;
  const OPEN_TO = 20 * 60;
  const MEALS = Object.freeze({
    lunch_set: Object.freeze({ label: "青菜鸡蛋饭", price: 18, hunger: 38, energy: 4, mood: 2 }),
    daily_set: Object.freeze({ label: "家常荤素套餐", price: 26, hunger: 55, energy: 7, mood: 3 })
  });

  function createState() { return { meal: null, mealsEaten: 0, mealsOrdered: 0 }; }
  function openAt(minute) { return Number.isFinite(minute) && minute >= OPEN_FROM && minute < OPEN_TO; }

  const api = { ROOM, COUNTER, PACK, SEAT, ACTION, DURATION, OPEN_FROM, OPEN_TO, MEALS, createState, openAt };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (!root.SP) return;
  const SP = root.SP, G = SP.game, W = SP.world, C = SP.clock;
  if (!G || !W || !C || SP._communityCanteenInstalled) return;
  const R = G.rules;
  if (!R || !R.data || !R.data.actions || !R.data.items) return;
  SP._communityCanteenInstalled = true;
  for (const [id, meal] of Object.entries(MEALS)) {
    const itemId = `canteen_box_${id}`;
    if (!R.data.items[itemId]) R.data.items[itemId] = { label: `槐东食堂·${meal.label}餐盒`, price: meal.price, gift: false };
  }
  R.data.actions[ACTION] = { label: "吃一份餐盒", place: "any", minutes: DURATION,
    effects: {}, text: "吃完了一份热饭，胃里踏实多了。" };

  function state() { return G.ps.communityCanteen || (G.ps.communityCanteen = createState()); }
  function supply() {
    const at = C.abs();
    const s = G.ps.canteenSupply || (G.ps.canteenSupply = root.CanteenSupply.fresh(at));
    if (at >= s.at) root.CanteenSupply.advance(s, at);
    return s;
  }
  function mealItemCount(id) { return Number(G.ps.items[`canteen_box_${id}`]) || 0; }
  function carriedMeal() {
    const s = state(), m = s.meal;
    if (!m || !MEALS[m.id]) return null;
    return mealItemCount(m.id) === 1 ? m : null;
  }
  function currentMealId() {
    return Object.keys(MEALS).find((id) => mealItemCount(id) > 0) || null;
  }
  function hoursText() { return "槐东食堂营业时间为 07:00–20:00。"; }
  function diningRoom() { return W.interior && W.sceneId === ROOM; }
  function inHome() { return W.interior && W.sceneId === "room_2f02"; }
  function adjustNeeds(effects) {
    const needs = G.ps.needs;
    for (const [key, delta] of Object.entries(effects))
      if (Number.isFinite(needs[key])) needs[key] = Math.max(0, Math.min(100, needs[key] + delta));
  }
  function order(id) {
    const info = MEALS[id], s = state();
    if (!info) return "这份套餐暂时没有供应。";
    if (!diningRoom() || !openAt(C.min)) return hoursText();
    if (G.busy()) return "先结束手头的事，再来点餐。";
    if (s.meal || currentMealId()) return "先吃完或带走手上的餐盒，一次只能点一份。";
    const stock = supply();
    if (C.abs() < stock.at) return "调试时间已倒退，请恢复到原时间或读取之前的存档再点餐。";
    const payment = root.CanteenSupply.sale(stock, G.ps, id, C.abs());
    if (!payment.ok) return payment.reason;
    R._note(G.ps, { type: "spend", amount: info.price, why: `槐东食堂·${info.label}` }, C.abs());
    s.meal = { id, paid: info.price, orderedAt: C.abs(), packed: false };
    s.mealsOrdered = (s.mealsOrdered || 0) + 1;
    R.addItem(G.ps, `canteen_box_${id}`, 1);
    if (G.payCard) G.payCard({ amount: info.price, method: R.payLabel ? R.payLabel(G.ps) : "微信支付",
      to: "槐东食堂", what: `${info.label}餐盒` });
    W.logEvent(`槐东食堂 · 买下${info.label}餐盒 ¥${info.price}`);
    G.hud && G.hud();
    return `付款成功：${info.label}餐盒已放进背包。可以在食堂用餐，也可以到打包台封好后带回家。`;
  }
  function pack() {
    if (!diningRoom() || !openAt(C.min)) return hoursText();
    if (G.busy()) return "先结束手头的事，再整理餐盒。";
    const m = carriedMeal();
    if (!m) return "背包里没有食堂餐盒。";
    if (m.packed) return "餐盒已经封好，可以带回家了。";
    m.packed = true;
    W.logEvent("槐东食堂 · 将餐盒封好带走");
    G.hud && G.hud();
    return "餐盒已封好，可以带回家或在餐桌旁吃。";
  }
  let eating = null;
  function canEat(where) {
    if (G.busy() || eating) return "先结束手头的事。";
    const m = carriedMeal();
    if (!m) return state().meal ? "餐盒与背包记录不一致，请先检查背包。" : "没有食堂餐盒，先到槐东食堂点餐。";
    if (where === "canteen") {
      if (!diningRoom() || !openAt(C.min)) return hoursText();
      if (C.min + DURATION > OPEN_TO) return "快到打烊时间了，剩余用餐时间不够。";
    } else if (where === "home" && (!inHome() || !m.packed)) {
      return "带回家的食堂餐盒需要先在食堂打包台封好。";
    }
    return null;
  }
  function startEating(o, where) {
    const reason = canEat(where);
    if (reason) return reason;
    const m = carriedMeal(), itemId = `canteen_box_${m.id}`;
    const result = G.start(ACTION, o);
    if (result) return result;
    if (!G.activity || G.activity.id !== ACTION) return "用餐没有开始，请稍后再试。";
    eating = { owner: G.ps, meal: m, itemId, scene: W.sceneId, finishAt: C.abs() + DURATION, activity: G.activity };
    return null;
  }
  function cancelEating() {
    if (!eating) return;
    if (G.activity === eating.activity) {
      G.activity = null;
      C.ff = null;
    }
    eating = null;
  }
  function completeEating(pending) {
    if (!pending || pending.owner !== G.ps || pending.meal !== state().meal ||
        G.ps.items[pending.itemId] !== 1 || C.abs() < pending.finishAt - 0.02) return false;
    const info = MEALS[pending.meal.id];
    if (!info) return false;
    delete G.ps.items[pending.itemId];
    state().meal = null;
    state().mealsEaten = (state().mealsEaten || 0) + 1;
    adjustNeeds({ hunger: info.hunger, energy: info.energy, mood: info.mood });
    W.logEvent(`槐东食堂 · 吃完${info.label}，餐盒已回收`);
    SP.toast(`${info.label}吃完了 · 饱腹 +${info.hunger} · 精力 +${info.energy}`);
    G.hud && G.hud();
    return true;
  }
  function orderMenu(o) {
    if (!openAt(C.min)) return hoursText();
    if (G.busy()) return "先结束手头的事，再来点餐。";
    const s = state(), m = carriedMeal();
    if (m) return `你已经买了${MEALS[m.id].label}餐盒。${m.packed ? "已打包，可带回家。" : "可在餐桌用餐，或到打包台封好。"}`;
    const stock = supply();
    const options = Object.entries(MEALS).map(([id, meal]) => ({
      id: `canteen_order_${id}`, label: `${meal.label}套餐 · ¥${meal.price} · 余 ${stock.inventory[id]} 份`,
      ok: !s.meal && G.ps.money >= meal.price && stock.inventory[id] > 0,
      reason: s.meal ? "背包里还有一份未吃完的餐盒" : stock.inventory[id] <= 0 ? "已售罄，次日 09:00 尝试供货" : G.ps.money < meal.price ? "余额不足" : "",
      fn: () => order(id)
    }));
    options.push({ id: "canteen_supply_info", label: "询问今日供应", ok: true, fn: () => {
      const q = supply();
      return `青菜鸡蛋饭剩 ${q.inventory.lunch_set} 份，荤素套餐剩 ${q.inventory.daily_set} 份。每天 09:00 由外部供货商尝试送货，每种最多 10 份；库存、预算不足时不会凭空补齐。`;
    } });
    G.openMenu(o, options);
    return null;
  }
  function eatMenu(o, where) {
    const m = carriedMeal();
    if (!m) return canEat(where) || "没有餐盒。";
    const info = MEALS[m.id], reason = canEat(where);
    const options = [{ id: "canteen_eat_now", label: `吃${info.label} · ${DURATION} 分钟`, ok: !reason,
      reason: reason || "", minutes: DURATION, fn: () => startEating(o, where) }];
    if (where === "home" && W.byId.table.state === "meal") {
      options.push({ id: "home_cooked_meal", label: "吃家里做好的饭", ok: true, fn: () => use0.call(G, W.byId.table) });
    }
    G.openMenu(o, options);
    return null;
  }
  function packMenu(o) {
    const m = carriedMeal();
    if (!m) return "背包里没有食堂餐盒。";
    G.openMenu(o, [{ id: "canteen_pack", label: m.packed ? "餐盒已封好" : "封好餐盒 · 带回家", ok: !m.packed && openAt(C.min),
      reason: !openAt(C.min) ? "打包台 07:00–20:00 开放" : "餐盒已经打包", fn: pack }]);
    return null;
  }

  const action0 = G.actionFor, use0 = G.use, update0 = G.update, switch0 = G.switchScene;
  G.actionFor = function (o, kind) {
    if (o && kind === "use") {
      if (diningRoom() && o.id === COUNTER) return { label: "槐东食堂 · 点餐", do: "game" };
      if (diningRoom() && o.id === PACK) return { label: "打包餐盒带走", do: "game" };
      if (diningRoom() && o.id === SEAT) return { label: "在餐桌旁用餐", do: "game" };
      if (inHome() && o.id === "table" && carriedMeal()) return { label: "用餐桌吃外带餐盒", do: "game" };
    }
    return action0.call(G, o, kind);
  };
  G.use = function (o) {
    if (o && diningRoom()) {
      if (o.id === COUNTER) return orderMenu(o);
      if (o.id === PACK) return packMenu(o);
      if (o.id === SEAT) return eatMenu(o, "canteen");
    }
    if (o && inHome() && o.id === "table" && carriedMeal()) return eatMenu(o, "home");
    return use0.call(G, o);
  };
  G.update = function () {
    const result = update0.apply(G, arguments), pending = eating;
    if (G.ps) supply();
    if (pending && G.activity !== pending.activity) {
      eating = null;
      completeEating(pending);
    }
    return result;
  };
  G.switchScene = function (to) {
    if (eating && to !== eating.scene) cancelEating();
    return switch0.apply(G, arguments);
  };
  SP.communityCanteen = { id: ROOM, openAt, state, mealCatalog: MEALS, order, pack, canEat, startEating, cancelEating };
})(typeof window !== "undefined" ? window : globalThis);
