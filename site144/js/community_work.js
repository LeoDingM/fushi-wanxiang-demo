/*
 * Small freelance assignment loop for the eastern community workspace.
 * Design references in the donor project (C:/Users/DM/Documents/fushi-wanxiang-demo-main (1)/fushi-wanxiang-demo-main):
 *   iso45/js/stageA.js:614-620 lists a courier micro-gig with a quoted duration and payout; its handler at 661-673
 *     pays immediately, so this adaptation delays payment until the work period and counter submission are complete.
 *   iso45/js/stageD.js:67-78 provides the shared clock-skip and need-effect patterns used by civic interactions.
 * State lives on G.ps for the existing serializer; no donor stage wrapper or scene coordinates are imported.
 */
(function (root) {
  "use strict";
  const ROOM = "community_workspace_room";
  const DESK = "community_work_desk";
  const COUNTER = "community_work_counter";
  const NOTICE = "community_work_notice";
  const STAFF = "community_workspace_staff";
  const ACTION = "community_freelance_work";
  const DURATION = 120;
  const REWARD = 80;
  const OPEN_FROM = 9 * 60;
  const OPEN_TO = 20 * 60;
  const MIN_ENERGY = 30;

  function dayAt(abs) { return Math.floor(abs / 1440); }
  function clockMin(abs) { return ((abs % 1440) + 1440) % 1440; }
  function createState() {
    return { status: "idle", acceptedDay: null, acceptedAt: null, startedAt: null, finishAt: null, completed: 0, earnedTotal: 0 };
  }
  function normalize(s, abs) {
    const today = dayAt(abs);
    if ((s.status === "completed" || s.status === "cancelled") && s.acceptedDay !== today) {
      s.status = "idle"; s.acceptedDay = null; s.acceptedAt = null; s.startedAt = null; s.finishAt = null;
    }
    return s;
  }
  function canStart(abs, energy, remaining) {
    const m = clockMin(abs), minutes = remaining || DURATION;
    if (m < OPEN_FROM || m >= OPEN_TO) return { ok: false, reason: "共享办公区开放时间为 09:00–20:00。" };
    if (m + minutes > OPEN_TO) return { ok: false, reason: "剩余工时会超过 20:00 闭馆时间，请下次开放时继续。" };
    if (energy < MIN_ENERGY) return { ok: false, reason: `精力不足（至少需要 ${MIN_ENERGY}），先休息或吃点东西再来。` };
    return { ok: true, minutes };
  }
  function canAccept(abs, s) {
    if (clockMin(abs) < OPEN_FROM || clockMin(abs) >= OPEN_TO) return { ok: false, reason: "共享办公区开放时间为 09:00–20:00。" };
    if (s.status === "completed" && s.acceptedDay === dayAt(abs)) return { ok: false, reason: "今天的项目已经结算，明天再来看看。" };
    if (s.status === "cancelled" && s.acceptedDay === dayAt(abs)) return { ok: false, reason: "今天的接单名额已经用完，明天再来。" };
    if (s.status !== "idle") return { ok: false, reason: "先完成或取消手头的任务。" };
    if (s.acceptedDay === dayAt(abs)) return { ok: false, reason: "今天已经接过一项任务，明天再来看看。" };
    return { ok: true };
  }
  function adjustNeeds(needs, effects) {
    if (!needs) return;
    for (const [key, delta] of Object.entries(effects || {})) {
      if (needs[key] == null || !Number.isFinite(delta)) continue;
      needs[key] = Math.max(0, Math.min(100, Number(needs[key]) + delta));
    }
  }
  const api = { ROOM, DESK, COUNTER, NOTICE, STAFF, ACTION, DURATION, REWARD, OPEN_FROM, OPEN_TO, MIN_ENERGY,
    createState, normalize, canStart, canAccept };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (!root.SP) return;
  const SP = root.SP, G = SP.game, W = SP.world, C = SP.clock;
  if (!G || !W || !C || SP._communityWorkInstalled) return;
  const R = G.rules;
  if (!R || !R.data || !R.data.actions) return;
  SP._communityWorkInstalled = true;
  R.data.actions[ACTION] = { label: "整理街坊商户电子价目表", place: "any", minutes: DURATION,
    text: "两小时核对完了门店电子价目表和活动报名表，肩颈有些发酸。" };

  function state() {
    if (!G.ps) return null;
    return (G.ps.communityWork = G.ps.communityWork || createState());
  }
  function liveRoom() { return W.interior && W.sceneId === ROOM; }
  function currentDay() { return dayAt(C.abs()); }
  function openHours() { return C.min >= OPEN_FROM && C.min < OPEN_TO; }
  function menu(o, title, options) {
    G.openMenu(Object.assign({}, o, { _name: title }), options);
    // The action menu is retained only while its source is the current nearby object.
    if (G.menu) G.menu.o = o;
  }
  function option(id, label, ok, reason, fn) { return { id, label, ok: !!ok, reason: reason || "暂不可用", fn }; }
  function acceptedToday(s) { return s.acceptedDay === currentDay(); }
  function statusText(s) {
    if (s.status === "accepted") return "已接下任务：整理街坊商户电子价目表（¥80）。到电脑桌完成 2 小时工作，再回前台提交。";
    if (s.status === "working") return "任务处理中：请到电脑桌继续完成剩余工时。";
    if (s.status === "ready") return "价目表已整理好，请回前台提交，核验后结算 ¥80。";
    if (s.status === "completed") return "今天的项目已经结算。小周说明天会有新的小任务。";
    if (s.status === "cancelled") return acceptedToday(s) ? "任务已取消；今天的接单名额已经用完，明天再来。" : "任务已取消。";
    return "前台登记一项小型数字整理任务：核对街坊商户电子价目表和活动报名表，预计 2 小时，完成后结算 ¥80。";
  }
  function accept(s) {
    const check = canAccept(C.abs(), s);
    if (!check.ok) return check.reason;
    s.status = "accepted"; s.acceptedDay = currentDay(); s.acceptedAt = C.abs(); s.startedAt = null; s.finishAt = null;
    SP.world.logEvent("共享办公 · 接下街坊商户电子价目表整理任务");
    return "小周：收到，价目表放到共享盘了。整理两小时后回来提交，验收通过结算 ¥80。";
  }
  function cancel(s) {
    if (s.status !== "accepted") return "任务开始后不能取消；已完成的任务请回前台提交。";
    s.status = "cancelled"; s.startedAt = null; s.finishAt = null;
    SP.world.logEvent("共享办公 · 取消未开始的任务");
    return "已取消未开始的任务。今天的接单名额仍计入一次。";
  }
  function start(s, o) {
    if (s.status !== "accepted" && s.status !== "working") return s.status === "ready" ? "工作已经完成，请回前台提交。" : "先到前台接一项任务。";
    const remaining = s.status === "working" ? Math.max(0, Math.ceil(s.finishAt - C.abs())) : DURATION;
    if (remaining <= 0) { s.status = "ready"; return "任务已经完成，请回前台提交。"; }
    const check = canStart(C.abs(), Number(G.ps.needs.energy) || 0, remaining);
    if (!check.ok) return check.reason;
    const previous = { status: s.status, startedAt: s.startedAt, finishAt: s.finishAt };
    s.status = "working"; s.startedAt = C.abs(); s.finishAt = C.abs() + remaining;
    R.data.actions[ACTION].minutes = remaining;
    const err = G.start(ACTION, o);
    if (err) { Object.assign(s, previous); return err; }
    SP.world.logEvent(`共享办公 · 开始整理电子价目表（${remaining} 分钟）`);
    return null;
  }
  function submit(s) {
    if (!openHours()) return "前台 09:00–20:00 开放，请在开放时间回来提交。";
    if (s.status !== "ready" || C.abs() < s.finishAt) return "先完成电脑桌上的两小时整理工作，再回来提交。";
    // Set status before recording income so repeated E presses or saves cannot pay twice.
    s.status = "completed"; s.completed = (s.completed || 0) + 1; s.earnedTotal = (s.earnedTotal || 0) + REWARD;
    R.earn(G.ps, REWARD, "共享办公·电子价目表整理", C.abs());
    adjustNeeds(G.ps.needs, { energy: -8, mood: 3 });
    if (G.payCard) G.payCard({ amount: REWARD, income: true, from: "槐东共享办公 · 项目结算", what: "街坊商户电子价目表整理" });
    SP.world.logEvent("共享办公 · 任务验收通过，结算 ¥80");
    G.hud && G.hud();
    return "验收通过，项目款 ¥80 已到账。辛苦了。";
  }
  function counter(G0, o) {
    const s = normalize(state(), C.abs());
    if (!openHours()) return "共享办公区前台 09:00–20:00 开放，明天再来办理。";
    const can = canAccept(C.abs(), s);
    const opts = [
      option("work_accept", s.status === "idle" ? "接下街坊商户价目表整理 · 2 小时 / ¥80" : "查看今日任务状态", s.status === "idle" && can.ok, can.reason,
        () => s.status === "idle" ? accept(s) : statusText(s)),
      option("work_submit", "提交已整理的价目表并领取 ¥80", openHours() && s.status === "ready" && C.abs() >= s.finishAt,
        !openHours() ? "前台 09:00–20:00 开放" : s.status !== "ready" ? "请先完成电脑桌上的工作" : "还未完成两小时工时", () => submit(s)),
      option("work_cancel", "取消尚未开始的任务", s.status === "accepted", "任务已开始或当前没有待开始任务", () => cancel(s)),
      option("work_staff", "问小周：今天的工作安排", openHours(), "小周已下班", () => `小周：${statusText(s)}`)
    ];
    menu(o, "槐东共享办公 · 前台", opts);
    return null;
  }
  function desk(G0, o) {
    if (!openHours()) return "共享办公区工位 09:00–20:00 开放；任务进度会保留到下次开放。";
    const s = normalize(state(), C.abs());
    if (s.status === "accepted" || s.status === "working") {
      const remaining = s.status === "working" ? Math.max(0, Math.ceil(s.finishAt - C.abs())) : DURATION;
      const check = canStart(C.abs(), Number(G.ps.needs.energy) || 0, remaining);
      const label = s.status === "working" ? `继续工作 · 剩余 ${remaining} 分钟` : "开始整理电子价目表 · 120 分钟";
      menu(o, "共享电脑桌", [option("work_begin", label, check.ok, check.reason, () => start(s, o)),
        option("work_status", "查看任务要求", true, "", () => statusText(s))]);
      return null;
    }
    if (s.status === "ready") return "价目表已经整理完成，请回前台提交。";
    return s.status === "completed" ? "今天的项目已提交完成。" : "电脑桌暂时空着，先到前台接一个整理任务。";
  }
  function notice(G0, o) {
    const s = normalize(state(), C.abs());
    return `共享办公区 09:00–20:00 · ${statusText(s)}`;
  }
  const actionFor0 = G.actionFor, use0 = G.use, update0 = G.update;
  G.actionFor = function (o, kind) {
    if (liveRoom() && kind === "use" && o) {
      if (o.id === COUNTER) return { label: "共享办公前台 · 小任务 / 结算", do: "game" };
      if (o.id === DESK) return { label: "共享电脑 · 开始 / 继续任务", do: "game" };
      if (o.id === NOTICE) return { label: "查看共享办公须知与任务进度", do: "game" };
      if (o.id === STAFF) return { label: "和小周聊聊工作安排", do: "game" };
    }
    return actionFor0.call(G, o, kind);
  };
  G.use = function (o) {
    if (liveRoom() && o) {
      if (o.id === COUNTER) return counter(G, o);
      if (o.id === DESK) return desk(G, o);
      if (o.id === NOTICE) return notice(G, o);
      if (o.id === STAFF) return `小周：${statusText(normalize(state(), C.abs()))}`;
    }
    return use0.call(G, o);
  };
  G.update = function () {
    const result = update0.apply(G, arguments), s = state();
    if (s && s.status === "working" && !G.activity) {
      if (C.abs() >= s.finishAt) {
        s.status = "ready";
        adjustNeeds(G.ps.needs, { mood: 2 });
        SP.world.logEvent("共享办公 · 电子价目表整理完成，等待前台验收");
        SP.toast("工作完成了，回前台提交即可结算 ¥80。", 3200);
      } else {
        // A save/reload does not preserve G.activity; the remaining minutes can be resumed at the desk.
        s.status = "working";
      }
    }
    return result;
  };
  SP.communityWork = { id: ROOM, state, canAccept, canStart, statusText };
})(typeof window !== "undefined" ? window : globalThis);
