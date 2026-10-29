/* I16: finite external-market transfers, merchant cash and traceable meal sales.
   Pure model; clock integration remains in community_canteen.js. Money is cents. */
(function (root) {
  'use strict';
  const IDS = ['lunch_set', 'daily_set'];
  const COST = { lunch_set: 800, daily_set: 1400 };
  const PRICE = { lunch_set: 1800, daily_set: 2600 };
  const LIMIT = 20, BATCH = 10, SUPPLIER_CAPACITY = 100000, OPENING_CASH = 200000;
  const copy = value => JSON.parse(JSON.stringify(value));
  const integer = v => Number.isSafeInteger(v) && v >= 0;
  function fresh(at) {
    if (!Number.isFinite(at) || at < 0) throw Error('食堂初始化时间无效');
    return { version: 1, openedAt: at, at, nextDelivery: (Math.floor(at / 1440) + 1) * 1440 + 540,
      inventory: { lunch_set: 10, daily_set: 10 },
      supplied: { lunch_set: 10, daily_set: 10 }, sold: { lunch_set: 0, daily_set: 0 },
      supplierStock: { lunch_set: SUPPLIER_CAPACITY - 10, daily_set: SUPPLIER_CAPACITY - 10 },
      cash: OPENING_CASH - 22000, supplierCash: 22000, revenue: 0, procurement: 22000,
      sequence: 1, ledger: [{ id: 1, at, kind: 'opening_supply', from: 'canteen', to: 'external_supplier',
        amount: 22000, quantities: { lunch_set: 10, daily_set: 10 } }] };
  }
  function post(s, at, kind, from, to, amount, quantities) {
    s.ledger.push({ id: ++s.sequence, at, kind, from, to, amount, quantities });
  }
  function advance(s, at) {
    if (!Number.isFinite(at) || at < s.at) throw Error('食堂时间不能倒退');
    // Event cadence, not rendered frames. The same clock interval has the same result off-screen.
    while (s.nextDelivery <= at) {
      const t = s.nextDelivery;
      for (const id of IDS) {
        const n = Math.min(BATCH, LIMIT - s.inventory[id], s.supplierStock[id], Math.floor(s.cash / COST[id]));
        if (n > 0) {
          const cost = n * COST[id];
          s.inventory[id] += n; s.supplied[id] += n; s.supplierStock[id] -= n;
          s.cash -= cost; s.supplierCash += cost; s.procurement += cost;
          post(s, t, 'delivery', 'canteen', 'external_supplier', cost, { [id]: n });
        }
      }
      s.nextDelivery += 1440;
    }
    s.at = at;
    return s;
  }
  function sale(s, ps, id, at) {
    advance(s, at);
    if (!IDS.includes(id)) return { ok: false, reason: '套餐不存在。' };
    if (s.inventory[id] <= 0) return { ok: false, reason: '这份套餐已售罄，请等待供货。' };
    const cents = Math.round(ps.money * 100), price = PRICE[id];
    if (!integer(cents) || cents < price) return { ok: false, reason: '余额不足。' };
    // No async side effects: both money entries and the goods transfer commit together.
    ps.money = (cents - price) / 100; ps.stats.spent += price / 100;
    s.cash += price; s.revenue += price; s.inventory[id]--; s.sold[id]++;
    post(s, at, 'sale', 'player', 'canteen', price, { [id]: 1 });
    return { ok: true };
  }
  function validate(s, now) {
    try {
      if (!s || s.version !== 1 || !Number.isFinite(s.openedAt) || s.openedAt < 0 ||
          !Number.isFinite(s.at) || s.at < s.openedAt || s.at > now ||
          !integer(s.nextDelivery) || s.nextDelivery <= s.at || s.nextDelivery % 1440 !== 540 ||
          !['cash','supplierCash','revenue','procurement','sequence'].every(k => integer(s[k])) ||
          !Array.isArray(s.ledger) || s.ledger.length > 100000 || s.ledger.length !== s.sequence) return false;
      const supplied = { lunch_set: 0, daily_set: 0 }, sold = { lunch_set: 0, daily_set: 0 };
      let cost = 0, income = 0, last = s.openedAt;
      for (let i = 0; i < s.ledger.length; i++) {
        const e = s.ledger[i];
        if (e.id !== i + 1 || !Number.isFinite(e.at) || e.at < last || e.at > s.at || !integer(e.amount) ||
            !e.quantities || !Object.keys(e.quantities).length ||
            Object.keys(e.quantities).some(id => !IDS.includes(id) || !integer(e.quantities[id]) || e.quantities[id] === 0)) return false;
        last = e.at;
        if (e.kind === 'sale') {
          const keys = Object.keys(e.quantities);
          if (e.from !== 'player' || e.to !== 'canteen' || keys.length !== 1 || e.quantities[keys[0]] !== 1 || e.amount !== PRICE[keys[0]]) return false;
          sold[keys[0]]++; income += e.amount;
        } else if (e.kind === 'delivery' || (i === 0 && e.kind === 'opening_supply')) {
          if (e.from !== 'canteen' || e.to !== 'external_supplier' ||
              e.amount !== IDS.reduce((n,id) => n + (e.quantities[id] || 0) * COST[id],0)) return false;
          if (e.kind === 'opening_supply' && (e.at !== s.openedAt || IDS.some(id => e.quantities[id] !== 10))) return false;
          if (e.kind === 'delivery' && (e.at % 1440 !== 540 || Object.values(e.quantities).some(n => n > BATCH))) return false;
          for (const id of IDS) supplied[id] += e.quantities[id] || 0;
          cost += e.amount;
        } else return false;
      }
      return s.ledger[0]?.kind === 'opening_supply' && cost === s.procurement && income === s.revenue &&
        s.cash === OPENING_CASH + income - cost && s.supplierCash === cost && IDS.every(id =>
          integer(s.inventory[id]) && s.inventory[id] <= LIMIT && s.inventory[id] === supplied[id] - sold[id] &&
          s.supplied[id] === supplied[id] && s.sold[id] === sold[id] &&
          integer(s.supplierStock[id]) && s.supplierStock[id] === SUPPLIER_CAPACITY - supplied[id]);
    } catch (_) { return false; }
  }
  const api = { fresh, advance, sale, validate, copy, PRICE, COST, LIMIT };
  root.CanteenSupply = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
