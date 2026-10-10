/* scene-proto-45 · Stage Q: visit time slots, careSM 健康页, try-on undo stack,
   route replay WeChat summary, deeplink daylog/ticket.
   No appearance/NPC_SPEC/civic atlas/school edits. */
(function (SP) {
  "use strict";
  const Q = (SP.stageQ = {});
  const G = () => SP.game, C = () => SP.clock;
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 3000);
  const ps = () => G() && G().ps;
  const A = () => SP.stageA;
  const E = () => SP.stageE;
  const F = () => SP.stageF;
  const SP_ = () => SP.stageP;
  const SN = () => SP.stageN;
  const SO = () => SP.stageO;

  const SLOTS = [
    { id: "am1", label: "今天 10:00–11:00", hour: 10 },
    { id: "am2", label: "今天 14:00–15:00", hour: 14 },
    { id: "pm1", label: "今天 16:00–17:00", hour: 16 },
    { id: "tm1", label: "明天 10:00–11:00", hour: 10, nextDay: true }
  ];

  Q.ensure = function () {
    const p = ps(); if (!p) return null;
    p.flags = p.flags || {};
    if (!p.tryOn) p.tryOn = { prevId: null, curId: null, active: false };
    if (!p.tryOnStack) p.tryOnStack = [];
    if (!p.careSM) p.careSM = { phase: "idle" };
    if (!p.itinReplay) p.itinReplay = [];
    if (!p.visitAppt) p.visitAppt = null;
    return p;
  };

  Q.dayKey = function () {
    try { return F() ? F().dayKey() : (C().day != null ? C().day : 0); } catch (e) { return 0; }
  };

  Q.hourNow = function () {
    try { return Math.floor((((C().abs() % 1440) + 1440) % 1440) / 60); } catch (e) { return 12; }
  };

  // ========== 1) Property visit 预约时间槽 ==========
  Q.bookVisitSlot = function (slotId, ticketId) {
    Q.ensure();
    const slot = SLOTS.find((s) => s.id === slotId);
    if (!slot) { toast("无效时段"); return null; }
    const day = Q.dayKey() + (slot.nextDay ? 1 : 0);
    const appt = {
      slotId: slot.id, label: slot.label, hour: slot.hour,
      day, ticketId: ticketId || null,
      bookedAt: Q.dayKey()
    };
    ps().visitAppt = appt;
    toast(`已预约物业上门：${slot.label}`, 3200);
    if (E()) {
      E().wxPush("property", `好的，我约 ${slot.label} 上门当面结案。`, false);
      E().wxPush("property", `收到，${slot.label} 见。工单记得准备好。`, true);
    }
    if (F()) F().pushLog("visit_book", `预约上门 ${slot.label}`, { place: "xin" });
    return appt;
  };

  Q.openVisitBooking = function (ticketId) {
    Q.ensure();
    const sp = SP_();
    const so = SO();
    const list = so && so.overdueTickets ? so.overdueTickets() : [];
    const open = so && so.openPendingTickets ? so.openPendingTickets()
      : (ps().gateTickets || []).filter((t) => t.status === "待跟进");
    const t = ticketId
      ? (ps().gateTickets || []).find((x) => x.id === ticketId)
      : (list[0] || open[0]);
    if (!t) { toast("没有待处理工单"); return; }

    const opts = SLOTS.map((s) => ({
      id: "slot_" + s.id, ok: true, label: `预约 ${s.label}`,
      fn: () => { Q.bookVisitSlot(s.id, t.id); return null; }
    }));
    opts.push({
      id: "now", ok: true, label: "现在就上门（立刻对话）",
      fn: () => {
        ps().flags.property_visit_force = true;
        if (sp && sp.openPropertyVisit) sp.openPropertyVisit(t.id);
        return null;
      }
    });
    opts.push({ id: "cancel", ok: true, label: "取消", fn: () => null });
    G().openMenu({ _name: "预约物业上门 · " + t.id, interact: "notice" }, opts);
  };

  Q.maybeFulfillAppt = function () {
    Q.ensure();
    const appt = ps().visitAppt;
    if (!appt || appt.done) return;
    if (G().menu || (E() && E().busRiding)) return;
    if (appt.day !== Q.dayKey()) return;
    const h = Q.hourNow();
    if (h < appt.hour || h >= appt.hour + 1) {
      // allow force
      if (!ps().flags.visit_appt_force) return;
    }
    ps().flags.visit_appt_force = false;
    appt.done = true;
    toast(`预约时段到：物业上门（${appt.label}）`, 3500);
    const sp = SP_();
    if (sp && sp.openPropertyVisit) sp.openPropertyVisit(appt.ticketId);
  };

  Q.wrapVisitBooking = function () {
    const sp = SP_(); if (!sp || sp._qBook) return;
    sp._qBook = true;
    // change "later" path and default entry to booking
    const prevOpen = sp.openPropertyVisit.bind(sp);
    sp.openPropertyVisit = function (ticketId) {
      // if coming from booking fulfillment or force immediate, run real visit
      if (ps().flags._q_visit_immediate || (ps().visitAppt && ps().visitAppt.done && !ps().flags._q_skip_book)) {
        ps().flags._q_visit_immediate = false;
        return prevOpen(ticketId);
      }
      // default: offer booking first (unless force immediate visit)
      if (ps().flags.property_visit_force && !ps().flags._q_prefer_book) {
        ps().flags._q_visit_immediate = true;
        return prevOpen(ticketId);
      }
      return Q.openVisitBooking(ticketId);
    };

    // maybePropertyVisit should open booking instead of immediate — already goes through openPropertyVisit
    setInterval(() => { try { Q.maybeFulfillAppt(); } catch (e) {} }, 2000);

    // phone button → booking
    const SA = A();
    if (SA && !SA._qBookPhone) {
      SA._qBookPhone = true;
      const prev = SA.openPhone.bind(SA);
      SA.openPhone = function (tab, threadId) {
        prev(tab, threadId);
        if (tab === "wechat" && threadId === "property") {
          const el = document.getElementById("phonepanel");
          const body = el && el.querySelector(".pbd");
          if (!body) return;
          if (!body.querySelector("[data-visit-book]")) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "q-book-btn";
            btn.dataset.visitBook = "1";
            const appt = ps().visitAppt;
            btn.textContent = appt && !appt.done
              ? `📅 已预约：${appt.label}`
              : "📅 预约物业上门时段";
            btn.onclick = () => Q.openVisitBooking();
            body.insertBefore(btn, body.firstChild);
          }
        }
      };
    }
  };

  // ========== 2) careSM phone 健康页 ==========
  Q.renderHealthPage = function () {
    Q.ensure();
    const sp = SP_();
    const phase = sp && sp.carePhase ? sp.carePhase() : (ps().careSM.phase || "idle");
    const label = sp && sp.careStatusText ? sp.careStatusText() : phase;
    const course = ps().rxCourse;
    const streak = ps().flags.rx_miss_streak || 0;
    const revisit = !!ps().flags.hospital_revisit_pending;
    let courseHtml = "<p class='hint'>无进行中疗程</p>";
    if (course) {
      courseHtml = `<div class="q-health-card">
        <b>服药疗程</b>
        <p>${course.note || "疗程"} · 已服 ${course.dosesTaken || 0}/${course.days || "?"}
        · 上次 D${course.lastDoseDay != null ? course.lastDoseDay : "—"}</p>
      </div>`;
    }
    const steps = ["idle", "revisit_needed", "registering", "consulting", "pharmacy", "course", "done"];
    const stepHtml = steps.map((s) =>
      `<span class="q-step ${s === phase ? "on" : ""}">${s}</span>`
    ).join("<span class='q-arr'>→</span>");
    return `<div class="q-health">
      <h4>健康 · careSM</h4>
      <div class="q-health-card"><b>当前：${label}</b><p>phase = ${phase}</p></div>
      <div class="q-steps">${stepHtml}</div>
      ${courseHtml}
      <div class="q-health-card">
        <b>提醒</b>
        <p>漏服连续：${streak} 次 ${revisit ? "· 需复诊" : ""}</p>
      </div>
      <button type="button" data-health-hosp>前往医院</button>
      <button type="button" data-health-dose ${course ? "" : "disabled"}>今日服药打卡</button>
    </div>`;
  };

  Q.wrapHealthPage = function () {
    const SA = A(); if (!SA || SA._qHealth) return;
    SA._qHealth = true;
    const prev = SA.openPhone.bind(SA);
    SA.openPhone = function (tab, threadId) {
      if (tab === "health") {
        // render custom then still call prev for shell? build like scanlog inject
        prev("home", threadId);
        const el = document.getElementById("phonepanel");
        if (!el) return;
        const notch = el.querySelector(".notch");
        const closeBtn = `<button class="x" data-x>关闭</button>`;
        const head = `<div class="phd"><button class="back" data-back="home">‹ 返回</button><b>健康</b>${closeBtn}</div>`;
        const body = Q.renderHealthPage();
        const notchHtml = notch ? notch.outerHTML : "";
        el.innerHTML = notchHtml + head + `<div class="pbd">${body}</div><div class="home-bar" data-homebar title="回主屏幕"></div>`;
        el.classList.remove("hidden");
        SA._phoneTab = "health";
        el.querySelector("[data-x]").onclick = () => el.classList.add("hidden");
        const hb = el.querySelector("[data-homebar]"); if (hb) hb.onclick = () => SA.openPhone("home");
        el.querySelectorAll("[data-back]").forEach((b) => b.onclick = () => SA.openPhone(b.dataset.back || "home"));
        const hosp = el.querySelector("[data-health-hosp]");
        if (hosp) hosp.onclick = () => {
          el.classList.add("hidden");
          if (SA.spawnAt) SA.spawnAt("hospital");
        };
        const dose = el.querySelector("[data-health-dose]");
        if (dose) dose.onclick = () => {
          if (SP.stageL && SP.stageL.takeRxDose) SP.stageL.takeRxDose();
          SA.openPhone("health");
        };
        return;
      }
      prev(tab, threadId);
      if (tab === "home" || tab === "more") {
        const el = document.getElementById("phonepanel");
        if (!el) return;
        const grid = el.querySelector(".app-grid") || el.querySelector(".pmore");
        if (grid && !grid.querySelector('[data-tab="health"]') && !grid.querySelector("[data-open-health]")) {
          const btn = document.createElement("button");
          btn.className = tab === "home" ? "app-ico" : "app";
          if (tab === "home") {
            btn.dataset.tab = "health";
            btn.innerHTML = `<span class="ic" style="background:#30d158">💊</span><span class="nm">健康</span>`;
            btn.onclick = () => SA.openPhone("health");
          } else {
            btn.dataset.openHealth = "1";
            btn.textContent = "💊 健康（careSM）";
            btn.onclick = () => SA.openPhone("health");
          }
          grid.appendChild(btn);
        }
      }
    };
  };

  // ========== 3) Try-on multi-step undo stack ==========
  Q.pushTryOn = function (fromId, toId) {
    Q.ensure();
    if (fromId == null || toId == null || fromId === toId) return;
    ps().tryOnStack.push({ from: fromId, to: toId, day: Q.dayKey() });
    if (ps().tryOnStack.length > 12) ps().tryOnStack.shift();
  };

  Q.undoTryOn = function () {
    Q.ensure();
    const stack = ps().tryOnStack;
    if (!stack.length) {
      // fallback to stageP restore
      if (SP_() && SP_().restoreTryOn) return SP_().restoreTryOn();
      toast("没有可撤销的试穿");
      return false;
    }
    const last = stack.pop();
    if (!SP.appearance || !SP.appearance.setOutfitId) {
      toast("外观未接入");
      return false;
    }
    // prevent re-push while undoing
    ps().flags._q_undoing = true;
    const ok = SP.appearance.setOutfitId(last.from);
    ps().flags._q_undoing = false;
    if (ok) {
      ps().tryOn.prevId = stack.length ? stack[stack.length - 1].from : null;
      ps().tryOn.curId = last.from;
      ps().tryOn.active = stack.length > 0;
      G().hud && G().hud(true);
      toast(`撤销试穿 → ${last.from}（栈 ${stack.length}）`, 2800);
      if (F()) F().pushLog("try_undo", `撤销试穿→${last.from}`, { place: "room_xin_102" });
    }
    return !!ok;
  };

  Q.wrapTryOnStack = function () {
    const sn = SN(); if (!sn || sn._qStack) return;
    sn._qStack = true;
    const prev = sn.tryOnLook.bind(sn);
    sn.tryOnLook = function (lookId) {
      let from = null;
      try { from = SP.appearance && SP.appearance.getOutfitId && SP.appearance.getOutfitId(); } catch (e) {}
      const ok = prev(lookId);
      if (ok && !ps().flags._q_undoing) Q.pushTryOn(from, lookId);
      G().hud && G().hud(true);
      return ok;
    };

    // badge shows stack depth + undo
    const sh = SP.stageH;
    if (sh && !sh._qStackHud) {
      sh._qStackHud = true;
      const prevChip = sh.clothesChip.bind(sh);
      sh.clothesChip = function () {
        let html = prevChip();
        Q.ensure();
        const n = (ps().tryOnStack || []).length;
        if (n > 0) {
          html += `<span class="q-undo-badge" data-try-undo="1" title="撤销试穿">↩×${n}</span>`;
        }
        return html;
      };
      const g = G();
      if (g && !g._qUndoHud) {
        g._qUndoHud = true;
        const prevHud = g.hud.bind(g);
        g.hud = function (force) {
          prevHud(force);
          document.querySelectorAll("[data-try-undo]").forEach((el) => {
            el.style.cursor = "pointer";
            el.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); Q.undoTryOn(); };
          });
        };
      }
    }

    // also make P.restoreTryOn use stack when available
    const sp = SP_();
    if (sp && sp.restoreTryOn && !sp._qRestore) {
      sp._qRestore = true;
      const prevR = sp.restoreTryOn.bind(sp);
      sp.restoreTryOn = function () {
        if ((ps().tryOnStack || []).length) return Q.undoTryOn();
        return prevR();
      };
    }
  };

  // ========== 4) Route replay → WeChat summary ==========
  Q.shareRouteSummary = function (friendId) {
    Q.ensure();
    const d = Q.dayKey();
    const rows = (ps().itinReplay || []).filter((r) => r.day === d);
    if (!rows.length) {
      toast("今日还没有路线可分享");
      return false;
    }
    const tid = friendId || "roommate";
    const names = { roommate: "阿凯", aunt: "王阿姨", landlord: "刘姐" };
    const line = rows.map((r, i) => `${i + 1}. ${r.t || ""} ${r.label}`).join("\n");
    const summary = `今日路线小结（D${d} · ${rows.length} 站）：\n${line}`;
    if (E()) {
      E().wxPush(tid, summary, false);
      E().wxPush(tid, tid === "aunt"
        ? "跑这么多地方注意身体啊。"
        : tid === "landlord"
          ? "收到，出门记得锁门。"
          : "可以啊这行程，下次叫上我！", true);
    }
    toast(`已发送今日路线给${names[tid] || tid}`, 3200);
    if (F()) F().pushLog("itin_share", `路线小结→${names[tid] || tid}`, { place: "street" });
    ps().flags.itin_shared_to = tid;
    return true;
  };

  Q.wrapRouteShare = function () {
    const sp = SP_(); if (!sp || sp._qShare) return;
    sp._qShare = true;
    const prev = sp.renderItinReplay.bind(sp);
    sp.renderItinReplay = function () {
      let html = prev();
      html += `<div class="q-share-route">
        <button type="button" data-share-route="roommate">分享路线给阿凯</button>
        <button type="button" data-share-route="aunt">分享给王阿姨</button>
      </div>`;
      return html;
    };

    const sg = SP.stageG;
    if (sg && !sg._qShareBind) {
      sg._qShareBind = true;
      const prevBind = sg.bindCalendar.bind(sg);
      sg.bindCalendar = function (body) {
        prevBind(body);
        if (!body) return;
        body.querySelectorAll("[data-share-route]").forEach((b) => {
          b.onclick = () => {
            Q.shareRouteSummary(b.dataset.shareRoute);
            if (A()) A().openPhone("wechat", b.dataset.shareRoute);
          };
        });
      };
    }
  };

  // ========== 5) Deeplink extend daylog / ticket ==========
  Q.handleDeepLink = function (url) {
    Q.ensure();
    const u = String(url || ps().flags.scan_deeplink || "");
    toast(`深链：${u}`, 2200);
    ps().flags.last_deeplink = u;
    if (/daylog/i.test(u)) {
      if (F()) F().pushLog("deeplink", "QR→日程", { place: "xin" });
      if (A()) A().openPhone("daylog");
      return "daylog";
    }
    if (/ticket/i.test(u)) {
      if (F()) F().pushLog("deeplink", "QR→工单", { place: "xin" });
      // open property wechat + booking if overdue
      if (A()) A().openPhone("wechat", "property");
      setTimeout(() => {
        const so = SO();
        if (so && so.overdueTickets && so.overdueTickets().length) Q.openVisitBooking();
        else if (SN() && SN().openTicketFollowupMenu) SN().openTicketFollowupMenu();
      }, 200);
      return "ticket";
    }
    // default scanlog
    if (SP_() && SP_().openScanDeepLink) SP_().openScanDeepLink();
    else if (A()) A().openPhone("scanlog");
    return "scanlog";
  };

  Q.wrapDeeplinks = function () {
    const sp = SP_(); if (!sp || sp._qDeep) return;
    sp._qDeep = true;
    const prev = sp.openScanDeepLink.bind(sp);
    sp.openScanDeepLink = function () {
      // if multi-link flag set, use handler
      const u = ps().flags.scan_deeplink_choice || ps().flags.scan_deeplink || "fushi://app/scanlog";
      if (/daylog|ticket/i.test(u) && u.indexOf("scanlog") < 0) return Q.handleDeepLink(u);
      return prev();
    };

    // long image preview: offer 3 deep link buttons
    const sm = SP.stageM;
    if (sm && sm.openLongImagePreview && !sm._qDeepBtns) {
      sm._qDeepBtns = true;
      const prevOpen = sm.openLongImagePreview.bind(sm);
      sm.openLongImagePreview = function (dataUrl) {
        prevOpen(dataUrl);
        const el = document.getElementById("phonepanel");
        const body = el && el.querySelector(".pbd");
        if (!body || !body.querySelector(".m-long")) return;
        if (body.querySelector(".q-deep-row")) return;
        const row = document.createElement("div");
        row.className = "q-deep-row";
        row.innerHTML = `
          <button type="button" data-q-deep="fushi://app/scanlog">深链·门禁</button>
          <button type="button" data-q-deep="fushi://app/daylog">深链·日程</button>
          <button type="button" data-q-deep="fushi://app/ticket">深链·工单</button>`;
        body.querySelector(".m-long").appendChild(row);
        row.querySelectorAll("[data-q-deep]").forEach((b) => {
          b.onclick = () => {
            ps().flags.scan_deeplink = b.dataset.qDeep;
            ps().flags.scan_deeplink_choice = b.dataset.qDeep;
            Q.handleDeepLink(b.dataset.qDeep);
          };
        });
      };
    }
  };

  Q.injectCss = function () {
    if (document.getElementById("stageQ-css")) return;
    const st = document.createElement("style");
    st.id = "stageQ-css";
    st.textContent = `
      .q-book-btn{display:block;width:100%;margin:0 0 10px;padding:10px;border:0;border-radius:10px;
        background:#64d2ff;color:#111;font-size:13px;cursor:pointer}
      .q-health{padding:4px}
      .q-health-card{background:#1c1c1e;border-radius:10px;padding:10px;margin:0 0 8px}
      .q-health-card b{display:block;margin-bottom:4px}
      .q-steps{display:flex;flex-wrap:wrap;align-items:center;gap:2px;margin:0 0 10px;font-size:9px}
      .q-step{background:#2c2c2e;color:#8e8e93;padding:3px 5px;border-radius:4px}
      .q-step.on{background:#30d158;color:#111}
      .q-arr{color:#48484a}
      .q-health button{display:block;width:100%;margin:6px 0;padding:10px;border:0;border-radius:10px;
        background:#0a84ff;color:#fff;cursor:pointer}
      .q-health button[disabled]{opacity:.4}
      .q-undo-badge{display:inline-block;margin-left:6px;padding:2px 8px;border-radius:8px;
        background:#ff453a;color:#fff;font-size:11px;cursor:pointer}
      .q-share-route{display:flex;flex-direction:column;gap:6px;margin-top:8px}
      .q-share-route button,.q-deep-row button{border:0;border-radius:10px;padding:10px;background:#30d158;color:#111;cursor:pointer;font-size:13px}
      .q-deep-row{display:flex;flex-direction:column;gap:6px;margin-top:8px}
      .q-deep-row button{background:#5e5ce6;color:#fff}
    `;
    document.head.appendChild(st);
  };

  Q.install = function () {
    const g = G(); if (!g || g._stageQ) return; g._stageQ = true;
    Q.ensure();
    Q.injectCss();
    Q.wrapVisitBooking();
    Q.wrapHealthPage();
    Q.wrapTryOnStack();
    Q.wrapRouteShare();
    Q.wrapDeeplinks();
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageP) Q.install();
    else setTimeout(boot, 160);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.SP || (window.SP = {}));
