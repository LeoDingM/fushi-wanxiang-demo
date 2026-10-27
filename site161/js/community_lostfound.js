/*
 * Community police lost-property loop.
 * Concept reference: donor iso45/js/stageD.js (Stage D), especially D.onDuty('police'),
 * D.policeMenu and D.policeStamp: daytime service, case receipt, status lookup and a
 * one-time procedural closure reward. This module replaces the donor's static report
 * flags with a found-item inventory handoff and an absolute-clock pending case. It does
 * not import donor stage wrappers, coordinates, NPC scripts or identity requirements.
 */
(function (root) {
  "use strict";
  const SP = root.SP;
  const SPOT = "community_civic_found_item";
  const COUNTER = "community_civic_counter";
  const NOTICE = "community_civic_lost_notice";
  const ROOM = "community_civic_room";
  const ITEM = "lost_wallet";
  const OPEN = 9 * 60, CLOSE = 17 * 60, OWNER_DELAY = 1440;
  const emptyState = () => ({ found: false, foundAt: null, case: null, reputation: 0, closedCases: 0 });
  const api = { SPOT, COUNTER, NOTICE, ROOM, ITEM, OPEN, CLOSE, OWNER_DELAY, emptyState };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (!SP || !SP.game || !SP.world || !SP.clock || SP._communityLostFoundInstalled) return;
  const G = SP.game, W = SP.world, C = SP.clock, R = G.rules;
  if (!R || !R.data || !R.data.items) return;
  SP._communityLostFoundInstalled = true;

  if (!R.data.items[ITEM]) R.data.items[ITEM] = { label: "待归还的钱包", price: 0, gift: false };
  function state() {
    if (!G.ps) return null;
    const s = G.ps.communityLostFound || (G.ps.communityLostFound = emptyState());
    if (typeof s.found !== "boolean") s.found = false;
    if (!Number.isFinite(s.reputation)) s.reputation = 0;
    if (!Number.isFinite(s.closedCases)) s.closedCases = 0;
    return s;
  }
  const onDuty = () => C.min >= OPEN && C.min < CLOSE;
  const itemCount = () => G.ps && G.ps.items ? Number(G.ps.items[ITEM]) || 0 : 0;
  function log(text) { if (W.logEvent) W.logEvent(text); }
  function toast(text, ms) { if (SP.toast) SP.toast(text, ms || 3000); }
  function needs(delta) {
    const n = G.ps && G.ps.needs;
    if (!n) return;
    for (const [k, v] of Object.entries(delta)) if (Number.isFinite(n[k])) n[k] = Math.max(0, Math.min(100, n[k] + v));
    if (G.hud) G.hud();
  }
  function caseReceipt(abs) {
    const day = Math.floor(abs / 1440) + 1;
    return `HD-${String(day).padStart(2, "0")}-${String((Math.floor(abs) % 1440) + 1).padStart(4, "0")}`;
  }
  // Called from the global update loop and lazily from every case-facing interaction.
  // The case transition is committed before its one-time reward so load/re-entry cannot replay it.
  function settle() {
    const s = state(), c = s && s.case;
    if (!c || c.status !== "pending" || C.abs() < c.handoverAt) return false;
    c.status = "closed";
    c.closedAt = C.abs();
    c.rewarded = true;
    s.closedCases++;
    s.reputation++;
    G.ps.flags = G.ps.flags || {};
    G.ps.flags.community_returned_wallet = true;
    needs({ mood: 3 });
    log(`社区派出所 · 失物 ${c.receipt} 已由失主领取`);
    toast("失物已由失主凭特征认领，案件办结。街坊对你的信任增加了。", 3600);
    return true;
  }
  function hideFoundSpot(o) {
    if (!o || !state()?.found) return;
    const p = W.piece(o), parts = p && p.parts || [];
    for (const part of parts) o.alpha[part] = 0;
  }
  function pickup(o) {
    const s = state();
    if (s.found || itemCount() > 0) return "这个钱包已经收进了你的背包，交到派出所失物窗口即可。";
    s.found = true;
    s.foundAt = C.abs();
    R.addItem(G.ps, ITEM, 1);
    hideFoundSpot(o);
    log("发现遗落的钱包，准备送交派出所");
    if (G.hud) G.hud();
    return "你捡起长椅旁的棕色钱包。里面没有可辨认的身份信息，最好交到附近派出所。";
  }
  function statusText() {
    settle();
    const s = state(), c = s && s.case;
    if (itemCount() > 0) return "钱包还在你手上。请在派出所失物窗口开放时办理交接。";
    if (!c) return s && s.found ? "钱包已收好，但尚未登记交接。" : "暂时没有登记中的失物案件。";
    if (c.status === "pending") {
      const left = Math.max(0, Math.ceil(c.handoverAt - C.abs()));
      const hours = Math.floor(left / 60), mins = left % 60;
      return `回执 ${c.receipt}：钱包已登记，失主可凭物品特征认领；预计还需 ${hours} 小时 ${mins} 分钟。无需留在现场。`;
    }
    return `回执 ${c.receipt}：失主已凭特征领回，案件已办结。感谢你的帮助。`;
  }
  function handIn() {
    const s = state();
    if (!onDuty()) return "失物窗口办理时间为 09:00–17:00，请在开放时段来交接。";
    if (itemCount() < 1) return s.case ? statusText() : "背包里没有待交接的钱包。";
    if (s.case && s.case.status !== "closed") return `已有待办案件 ${s.case.receipt}，不能重复登记。`;
    // Consume the physical item and commit the pending case before returning to the UI.
    G.ps.items[ITEM]--;
    if (G.ps.items[ITEM] <= 0) delete G.ps.items[ITEM];
    const filedAt = C.abs();
    s.case = { receipt: caseReceipt(filedAt), status: "pending", filedAt, handoverAt: filedAt + OWNER_DELAY,
      claimChecked: false, rewarded: false };
    log(`社区派出所 · 登记钱包失物，回执 ${s.case.receipt}`);
    if (G.hud) G.hud();
    return `已登记失物交接，回执 ${s.case.receipt}。失主核对物品特征后可领取；约 24 小时后自动更新进度。`;
  }
  function checkClaimClue() {
    settle();
    const c = state().case;
    if (!c) return "尚无待处理案件。";
    if (c.status === "closed") return "失主已凭钱包内的物品特征完成认领，无需提供个人身份信息。";
    if (c.claimChecked) return "已注明钱包颜色与发现地点，登记中没有你的姓名或证件信息。";
    c.claimChecked = true;
    log(`社区派出所 · ${c.receipt} 补充物品特征（匿名）`);
    return "已补充核验线索：棕色钱包、街边长椅旁发现。只登记物品特征，不采集你的姓名或证件信息。";
  }
  function menu(o) {
    settle();
    const s = state(), c = s.case;
    const opts = [
      { id: "lostfound_handover", label: itemCount() ? "交接捡到的钱包 · 开具失物回执" : "办理失物交接", ok: onDuty() && itemCount() > 0 && (!c || c.status === "closed"),
        reason: !onDuty() ? "失物窗口 09:00–17:00 开放" : itemCount() < 1 ? "背包里没有待交接的钱包" : "案件已登记，不能重复交接", fn: handIn },
      { id: "lostfound_status", label: "查询回执与失物认领进度", ok: true, fn: statusText },
      { id: "lostfound_clue", label: "补充物品特征（匿名）", ok: !!c && c.status === "pending" && !c.claimChecked,
        reason: !c ? "尚无已登记案件" : c.status !== "pending" ? "案件已办结" : "线索已记录", fn: checkClaimClue }
    ];
    G.openMenu(Object.assign({}, o, { _name: "槐东派出所 · 失物窗口" }), opts);
    // G.update closes menus whose object is not the live nearby instance.
    if (G.menu) G.menu.o = o;
  }
  function notice() { return `社区派出所失物招领 · 窗口 09:00–17:00。${statusText()}`; }
  const action0 = G.actionFor, use0 = G.use, update0 = G.update;
  G.actionFor = function (o, kind) {
    if (kind === "use" && o) {
      if (!W.interior && o.id === SPOT) return { label: state()?.found ? "查看钱包状态" : "捡起长椅旁的钱包", do: "game" };
      if (W.interior && W.sceneId === ROOM && o.id === COUNTER) return { label: onDuty() ? "失物窗口 · 交接 / 查询" : "失物窗口已下班（09:00–17:00）", do: "game" };
      if (W.interior && W.sceneId === ROOM && o.id === NOTICE) return { label: "查看失物招领公告", do: "game" };
    }
    return action0.call(G, o, kind);
  };
  G.use = function (o) {
    if (o && !W.interior && o.id === SPOT) return pickup(o);
    if (o && W.interior && W.sceneId === ROOM && o.id === COUNTER) {
      if (!onDuty()) return "失物窗口办理时间为 09:00–17:00，请在开放时段来办理。";
      menu(o); return null;
    }
    if (o && W.interior && W.sceneId === ROOM && o.id === NOTICE) return notice();
    return use0.call(G, o);
  };
  G.update = function () {
    const result = update0.apply(G, arguments);
    settle();
    hideFoundSpot(W.byId[SPOT]);
    return result;
  };
  SP.communityLostFound = { id: ROOM, spotId: SPOT, counterId: COUNTER, state, statusText, settle };
})(typeof window !== "undefined" ? window : globalThis);
