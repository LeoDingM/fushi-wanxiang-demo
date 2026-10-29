/*
 * Data-driven neighborhood service counters for scene-proto-45.
 * Selective design references from the donor project (C:/Users/DM/Documents/fushi-wanxiang-demo-main (1)/fushi-wanxiang-demo-main):
 *   iso45/js/stageD.js hospitalNurse -> hospitalDoctor -> pharmacyMenu established the registered / consult / fill sequence;
 *   iso45/js/amenities_props.js pickParcel established persistent parcel claims and item delivery.
 * This implementation uses the baseline game's G.ps, G.openMenu, G.payCard and shared-rules item API;
 * it intentionally does not import donor stage wrappers, global scene patches, or coordinates.
 */
(function (SP) {
  "use strict";
  const NS = (SP.neighborhoodServices = SP.neighborhoodServices || {});

  function state(G) {
    const ps = G && G.ps;
    if (!ps) return null;
    return (ps.neighborhoodServices = ps.neighborhoodServices || { clinics: {}, mail: {}, bank: { balance: 0 } });
  }
  function serviceId(o) { return String(o.serviceId || o.id || "service"); }
  function data(o) { return o.serviceData || {}; }
  function round(n) { return Math.round((Number(n) || 0) * 100) / 100; }
  const today = () => SP.clock ? SP.clock.day : 0;
  function registerItem(G, id, label) {
    const items = G.rules && G.rules.data && G.rules.data.items;
    if (items && !items[id]) items[id] = { label, price: 0, gift: false };
  }
  function price(o, key, fallback) {
    const n = Number(data(o)[key]);
    return Number.isFinite(n) && n >= 0 ? round(n) : fallback;
  }
  function spend(G, amount, to, what, method) {
    const ps = G.ps, n = round(amount);
    if (!ps || !Number.isFinite(n) || n < 0) return { ok: false, reason: "服务暂不可用" };
    if ((Number(ps.money) || 0) < n) return { ok: false, reason: `余额不足（需要 ¥${n}）` };
    ps.money = round(ps.money - n);
    ps.stats = ps.stats || {};
    ps.stats.spent = round((ps.stats.spent || 0) + n);
    if (G.payCard && n > 0) G.payCard({ amount: n, method: method || "微信支付", to, what });
    return { ok: true };
  }
  function option(id, label, ok, reason, fn) {
    return { id, label, ok: !!ok, reason: reason || "暂不可用", fn };
  }
  function openServiceMenu(G, o, title, options) {
    G.openMenu(Object.assign({}, o, { _name: title }), options);
    // Game.update keeps a menu open only while its source is the live nearby object.
    if (G.menu) G.menu.o = o;
  }
  function clinic(G, o) {
    const all = state(G), id = serviceId(o), c = all.clinics[id] || (all.clinics[id] = { registered: false, prescription: null });
    const d = data(o), registerFee = price(o, "registrationFee", 8), consultFee = price(o, "consultationFee", 25);
    const finished = !!(c.prescription && c.prescription.filled);
    // Older saves did not date completed visits; record their first observed day without discarding pending prescriptions.
    if (finished && c.completedDay == null) c.completedDay = today();
    const repeat = finished && c.completedDay < today();
    const options = [option("clinic_register", repeat ? `新一日复诊挂号（¥${registerFee}）` : finished ? "今日就诊已完成" : c.registered ? "已挂号 · 等候叫号" : `普通挂号（¥${registerFee}）`, (!c.registered || repeat) && G.ps.money >= registerFee, finished && !repeat ? "今天已经完成就诊，可在次日复诊" : "已挂号或余额不足", () => {
      const canRepeat = c.prescription && c.prescription.filled && c.completedDay < today();
      if (c.registered && !canRepeat) return "本次就诊尚未结束，或今天已完成就诊。";
      const r = spend(G, registerFee, d.payee || "社区卫生服务中心", "普通挂号"); if (!r.ok) return r.reason;
      c.registered = true; c.consulted = false; c.prescription = null; c.visitDay = today(); return "挂号完成，请前往诊室问诊。";
    }), option("clinic_consult", finished ? "问诊及取药已完成" : c.consulted ? "已完成问诊 · 处方待取" : `诊室问诊并开方（¥${consultFee}）`, c.registered && !c.consulted && G.ps.money >= consultFee, !c.registered ? "请先挂号" : c.consulted ? "本次问诊已完成" : "余额不足", () => {
      if (!c.registered) return "请先挂号。";
      if (c.consulted) return "本次问诊已完成。";
      const r = spend(G, consultFee, d.payee || "社区卫生服务中心", "诊金"); if (!r.ok) return r.reason;
      const prescriptions = Array.isArray(d.prescriptions) && d.prescriptions.length ? d.prescriptions : [{ id: "basic-medicine", label: "常用药" }];
      const chosen = prescriptions[0];
      c.consulted = true;
      c.prescription = { id: String(chosen.id || "prescription"), label: String(chosen.label || "处方药"), filled: false };
      return `问诊完成，已开具「${c.prescription.label}」处方；请到药房取药。`;
    })];
    openServiceMenu(G, o, o.name || "社区卫生服务中心", options);
    return null;
  }
  function pharmacy(G, o) {
    const all = state(G), d = data(o), requested = d.clinicId == null ? null : String(d.clinicId);
    const clinics = Object.entries(all.clinics).filter(([id, c]) => (!requested || requested === id) && c.prescription && !c.prescription.filled);
    const fee = price(o, "medicineFee", 18), available = clinics.length > 0 && G.ps.money >= fee;
    const options = [option("pharmacy_fill", `凭处方取药（¥${fee}）`, available, clinics.length ? "余额不足" : "暂无待取处方", () => {
      const c = clinics[0] && clinics[0][1];
      if (!c || !c.prescription || c.prescription.filled) return "暂无待取处方。";
      const r = spend(G, fee, d.payee || "社区药房", c.prescription.label); if (!r.ok) return r.reason;
      c.prescription.filled = true;
      c.completedDay = today();
      const ps = G.ps;
      registerItem(G, c.prescription.id, c.prescription.label);
      if (G.rules && G.rules.addItem) G.rules.addItem(ps, c.prescription.id, 1);
      else { ps.items = ps.items || {}; ps.items[c.prescription.id] = (ps.items[c.prescription.id] || 0) + 1; }
      return `已取药：「${c.prescription.label}」。`;
    })];
    openServiceMenu(G, o, o.name || "社区药房", options);
    return null;
  }
  function mail(G, o) {
    const all = state(G), id = serviceId(o), m = all.mail[id] || (all.mail[id] = { collected: {} }), d = data(o);
    const parcels = Array.isArray(d.parcels) && d.parcels.length ? d.parcels : [{ id: "parcel-1", label: "社区包裹", pickupFee: 3 }];
    const options = parcels.map((p, i) => {
      const pid = String(p.id || `parcel-${i + 1}`), fee = round(p.pickupFee == null ? 3 : p.pickupFee), claimed = !!m.collected[pid];
      return option("parcel_" + pid, claimed ? `已领取 · ${p.label || "包裹"}` : `领取「${p.label || "包裹"}」（服务费 ¥${fee}）`, !claimed && G.ps.money >= fee, claimed ? "已领取" : "余额不足", () => {
        if (m.collected[pid]) return "此包裹已领取。";
        const r = spend(G, fee, d.payee || "社区快递驿站", "包裹保管服务费"); if (!r.ok) return r.reason;
        m.collected[pid] = true;
        const itemId = String(p.itemId || "parcel");
        registerItem(G, itemId, String(p.label || "社区包裹"));
        if (G.rules && G.rules.addItem) G.rules.addItem(G.ps, itemId, 1);
        else { G.ps.items = G.ps.items || {}; G.ps.items[itemId] = (G.ps.items[itemId] || 0) + 1; }
        return `已领取「${p.label || "包裹"}」，请在背包查看。`;
      });
    });
    if (d.allowMailing) {
      const fee = price(o, "postage", 2);
      options.push(option("send_mail", `寄出信件（邮资 ¥${fee}）`, G.ps.money >= fee, "余额不足", () => {
        const r = spend(G, fee, d.payee || "社区邮政服务点", "平信邮资"); if (!r.ok) return r.reason;
        m.sent = (m.sent || 0) + 1; return "信件已收寄。";
      }));
    }
    openServiceMenu(G, o, o.name || "社区邮政服务点", options);
    return null;
  }
  function atm(G, o) {
    const all = state(G), bank = all.bank, d = data(o), limit = price(o, "maxTransaction", 5000);
    const amount = round(Number(d.amount) > 0 ? Number(d.amount) : 100);
    const options = [option("atm_balance", `查询余额 · 银行 ¥${round(bank.balance)}`, true, "", () => `活期余额：¥${round(bank.balance)}；零钱：¥${round(G.ps.money || 0)}。`),
      option("atm_deposit", `存入零钱 ¥${amount}`, amount <= limit && G.ps.money >= amount, amount > limit ? `单笔上限 ¥${limit}` : "零钱不足", () => {
        if (amount > limit) return `单笔上限 ¥${limit}`;
        if ((Number(G.ps.money) || 0) < amount) return "零钱不足";
        G.ps.money = round(G.ps.money - amount); bank.balance = round(bank.balance + amount);
        if (G.payCard) G.payCard({ msg: `已存入 ¥${amount}；活期余额 ¥${bank.balance}。`, from: "银行自助终端" });
        return `已存入 ¥${amount}，活期余额 ¥${bank.balance}。`;
      }), option("atm_withdraw", `取出现金 ¥${amount}`, amount <= limit && bank.balance >= amount, amount > limit ? `单笔上限 ¥${limit}` : "银行余额不足", () => {
        if (amount > limit) return `单笔上限 ¥${limit}`;
        if (bank.balance < amount) return "银行余额不足";
        bank.balance = round(bank.balance - amount); G.ps.money = round((Number(G.ps.money) || 0) + amount);
        if (G.payCard) G.payCard({ msg: `已取出 ¥${amount}；现金余额 ¥${G.ps.money}。`, from: "银行自助终端" });
        return `已取出 ¥${amount}，活期余额 ¥${bank.balance}。`;
      })];
    openServiceMenu(G, o, o.name || "ATM 自动柜员机", options);
    return null;
  }
  const handlers = { clinic, pharmacy, mail, atm };
  NS.install = function (G) {
    if (!G || G._neighborhoodServicesInstalled) return false;
    // Known service rewards must exist before a saved bag is opened after reload.
    registerItem(G, "basic-medicine", "常用药");
    registerItem(G, "parcel", "社区健康手册");
    const actionFor = G.actionFor, use = G.use;
    G.actionFor = function (o, kind) {
      if (o && handlers[o.serviceKind] && o.serviceId != null) {
        if (kind !== "use") return null;
        const labels = { clinic: "社区卫生服务中心 · 挂号 / 问诊", pharmacy: "社区药房 · 处方取药", mail: "邮政服务 · 取件 / 寄信", atm: "ATM · 存取款" };
        return { label: o.serviceLabel || labels[o.serviceKind], do: "game" };
      }
      return actionFor.call(G, o, kind);
    };
    G.use = function (o) {
      if (o && handlers[o.serviceKind] && o.serviceId != null) return handlers[o.serviceKind](G, o);
      return use.call(G, o);
    };
    G._neighborhoodServicesInstalled = true;
    return true;
  };
  if (SP.game) NS.install(SP.game);
})(window.SP = window.SP || {});
