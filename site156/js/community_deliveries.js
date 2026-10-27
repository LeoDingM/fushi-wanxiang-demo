/* Small street courier jobs. The parcel is a normal serializable rules item; the
 * active slip and daily cap live in G.ps, so interior/metro transitions retain it. */
(function (SP) {
  "use strict";
  if (!SP || !SP.game || !SP.world || !SP.clock) return;
  const G = SP.game, W = SP.world, C = SP.clock;
  const CD = (SP.communityDeliveries = SP.communityDeliveries || {});
  const PARCEL_COUNTER = "svc_parcel_locker";
  const ITEM = "courier-parcel";
  const JOBS = Object.freeze([
    { id: "building_12", target: "unit_door", destination: "井槐里12号单元门", reward: 36 },
    { id: "night_store", target: "shop24_S1F_1_shop", destination: "邻里便利24h门口", reward: 28 }
  ]);
  const sourceIds = new Set([PARCEL_COUNTER, "community_parcel_counter"]);
  CD.jobs = JOBS;
  CD.registerSource = (id) => sourceIds.add(String(id));
  const job = (id) => JOBS.find((x) => x.id === id);
  const state = () => {
    if (!G.ps) return null;
    return (G.ps.communityDeliveries = G.ps.communityDeliveries || { active: null, usedDay: -1, completed: 0, earned: 0 });
  };
  const isSource = (o) => !!(o && (sourceIds.has(o.id) || o.deliverySource === true || o.serviceKind === "courier"));
  const sourceHere = (id) => {
    const o = W.byId[id];
    if (!o || !isSource(o)) return false;
    if (id === PARCEL_COUNTER) return W.sceneId === "neighborhood_services";
    return W.sceneId === "street";
  };
  const note = (msg) => { if (W.logEvent) W.logEvent(msg); return msg; };
  function hud() {
    let el = document.getElementById("community-delivery-slip");
    if (!el) {
      const wrap = document.getElementById("wrap"); if (!wrap) return;
      el = document.createElement("div"); el.id = "community-delivery-slip";
      Object.assign(el.style, { position: "absolute", left: "50%", top: "48px", transform: "translateX(-50%)",
        maxWidth: "min(56%, 360px)", padding: "3px 9px", borderRadius: "5px", background: "rgba(18,24,32,.84)",
        color: "#ffe2a0", font: "12px/1.4 sans-serif", textAlign: "center", pointerEvents: "none", zIndex: "4", display: "none" });
      wrap.appendChild(el);
    }
    const s = state(), a = s && s.active, j = a && job(a.id);
    el.style.top = document.body.classList.contains("mobile") ? "34px" : "48px";
    el.style.display = j ? "block" : "none";
    const text = j ? `📦 配送中 · 交给${j.destination} · 完成得 ¥${j.reward}` : "";
    if (el.textContent !== text) el.textContent = text;
  }
  CD.refresh = hud;
  CD.status = () => {
    const s = state(), a = s && s.active, j = a && job(a.id);
    return j ? `包裹在身上，去${j.destination}按 E 交付；报酬 ¥${j.reward}。` :
      s && s.usedDay === C.day ? "今日配送单已领取，明天再来。" : "今日可接一单街坊配送。";
  };
  CD.accept = function (id, sourceId) {
    const s = state(), j = job(id);
    if (!s || !j) return "没有这张配送单。";
    if (!sourceHere(sourceId)) return "请到社区快递柜或配送站接单。";
    if (s.active) return `还有一件待送：${job(s.active.id)?.destination || "请查看配送单"}。`;
    if (s.usedDay === C.day) return "今天已经接过一单，明天再来。";
    if ((G.ps.items[ITEM] || 0) > 0) return "背包里还有未结算的配送包裹。";
    s.active = { id: j.id, target: j.target, acceptedDay: C.day };
    s.usedDay = C.day;
    G.rules.addItem(G.ps, ITEM, 1);
    hud();
    return note(`已接单：把包裹送到${j.destination}（¥${j.reward}）。`);
  };
  CD.deliver = function (targetId) {
    const s = state(), a = s && s.active, j = a && job(a.id);
    if (!j) return "现在没有待送的包裹。";
    if (W.sceneId !== "street") return "请到街上的收件入口交付。";
    if (targetId !== j.target) return `地址不对，请送到${j.destination}。`;
    const o = W.byId[targetId], p = o && W.reachPt(o, SP.player.x, SP.player.y);
    if (!p || Math.hypot(SP.player.x - p[0], SP.player.y - p[1]) > 1.3) return "请走到收件入口再交付。";
    if ((G.ps.items[ITEM] || 0) < 1) return "包裹不在背包里，无法交付。";
    // Clear the slip before awarding money; a second E cannot pay twice.
    G.ps.items[ITEM]--; if (!G.ps.items[ITEM]) delete G.ps.items[ITEM];
    s.active = null; s.completed++; s.earned += j.reward;
    G.rules.earn(G.ps, j.reward, `街坊配送 · ${j.destination}`, C.abs());
    if (G.payCard) G.payCard({ amount: j.reward, income: true, from: "街坊配送 · 报酬" });
    hud();
    return note(`包裹已送达${j.destination}，配送费 ¥${j.reward} 到账。`);
  };
  CD.cancel = function () {
    const s = state(); if (!s || !s.active) return "没有进行中的配送单。";
    G.ps.items[ITEM] = Math.max(0, (G.ps.items[ITEM] || 0) - 1);
    if (!G.ps.items[ITEM]) delete G.ps.items[ITEM];
    s.active = null; hud();
    return note("已放弃本次配送，今天不能再接单。");
  };
  function options(sourceId) {
    const s = state(); if (!s) return [];
    if (s.active) return [
      { id: "delivery_status", label: "查看配送单", ok: true, fn: CD.status },
      { id: "delivery_cancel", label: "放弃本单（今日不可再接）", ok: true, fn: CD.cancel }
    ];
    return JOBS.map((j) => ({ id: "delivery_accept_" + j.id, label: `接单 · 送${j.destination}（¥${j.reward}）`,
      ok: s.usedDay !== C.day && (G.ps.items[ITEM] || 0) < 1,
      reason: s.usedDay === C.day ? "今日已接过单" : "背包里还有包裹", fn: () => CD.accept(j.id, sourceId) }));
  }
  function openSource(o, previous) {
    let original = [];
    if (previous) { previous.call(G, o); if (G.menu) original = G.menu.opts.slice(); }
    G.openMenu(Object.assign({}, o, { _name: o.name || "街坊配送站" }), original.concat(options(o.id)));
    if (G.menu) G.menu.o = o;
    return null;
  }
  const action0 = G.actionFor, use0 = G.use, init0 = G.init, update0 = G.update;
  G.actionFor = function (o, kind) {
    if (o && W.sceneId === "street" && state()?.active?.target === o.id) return kind === "use" ? { label: "交付街坊配送包裹", do: "game" } : null;
    if (isSource(o) && o.id !== PARCEL_COUNTER) return kind === "use" ? { label: "查看街坊配送单", do: "game" } : null;
    return action0.call(G, o, kind);
  };
  G.use = function (o) {
    if (o && W.sceneId === "street" && state()?.active?.target === o.id) return CD.deliver(o.id);
    if (isSource(o)) return openSource(o, o.id === PARCEL_COUNTER ? use0 : null);
    return use0.call(G, o);
  };
  G.init = function () { const r = init0.apply(G, arguments); hud(); return r; };
  G.update = function () { const r = update0.apply(G, arguments); if (G.ps) hud(); return r; };
  const items = G.rules && G.rules.data && G.rules.data.items;
  if (items && !items[ITEM]) items[ITEM] = { label: "待送包裹", price: 0, gift: false };
})(window.SP = window.SP || {});
