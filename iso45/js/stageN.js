/* scene-proto-45 · Stage N: ticket follow-up↔access, miss-dose streak→hospital,
   one-tap soft try-on, hour-strip POI jump, long-image WeChat share.
   No appearance/NPC_SPEC/civic atlas edits — may call setOutfitId/openWardrobe. */
(function (SP) {
  "use strict";
  const N = (SP.stageN = {});
  const G = () => SP.game, C = () => SP.clock;
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 3000);
  const ps = () => G() && G().ps;
  const A = () => SP.stageA;
  const E = () => SP.stageE;
  const F = () => SP.stageF;
  const SH = () => SP.stageH;
  const SM = () => SP.stageM;
  const SG = () => SP.stageG;
  const SJ = () => SP.stageJ;

  const MISS_STREAK_HOSPITAL = 2;
  const TICKET_RENEW_H = 6; // bonus hours when closing ticket with renew

  N.ensure = function () {
    const p = ps(); if (!p) return null;
    p.flags = p.flags || {};
    if (!p.gateTickets) p.gateTickets = [];
    if (!p.scanArchive) p.scanArchive = [];
    if (p.flags.rx_miss_streak == null) p.flags.rx_miss_streak = 0;
    return p;
  };

  N.dayKey = function () {
    try { return F() ? F().dayKey() : (C().day != null ? C().day : 0); } catch (e) { return 0; }
  };

  // ========== 1) Property ticket follow-up (待跟进→结案) ↔ access renew ==========
  N.pendingTickets = function () {
    N.ensure();
    return (ps().gateTickets || []).filter((t) => t.status === "待跟进");
  };

  N.closeTicket = function (ticketId, withRenew) {
    N.ensure();
    const t = (ps().gateTickets || []).find((x) => x.id === ticketId);
    if (!t) { toast("找不到工单"); return null; }
    if (t.status === "已结案") { toast("工单已结案"); return t; }
    t.status = "已结案";
    t.closedDay = N.dayKey();
    t.closedHow = withRenew ? "结案并续期" : "物业回访结案";
    if (E()) {
      E().wxPush("property", `（工单 ${t.id}）回访完成，状态：已结案`, true);
      E().wxPush("property", withRenew
        ? `麻烦帮我结案，顺便续一下临时门禁呗。`
        : `好的，那这单就结了，谢谢小吴。`, false);
      E().wxPush("property", withRenew
        ? `已结案，并按核验记录帮你续了门禁。`
        : `已结案归档，有事再找物业。`, true);
    }
    if (withRenew && SH() && SH().extendAccess) {
      SH().extendAccess(TICKET_RENEW_H, `工单 ${t.id} 结案赠续`);
    } else {
      toast(`工单 ${t.id} 已结案`, 2800);
    }
    if (F()) F().pushLog("ticket_close", `工单结案 ${t.id}${withRenew ? " +门禁" : ""}`, { place: "xin" });
    ps().flags.last_ticket_closed = t.id;
    return t;
  };

  N.openTicketFollowupMenu = function () {
    N.ensure();
    const pending = N.pendingTickets();
    if (!pending.length) {
      toast("没有待跟进工单");
      return;
    }
    const opts = [];
    pending.slice(0, 5).forEach((t) => {
      opts.push({
        id: "close_" + t.id, ok: true,
        label: `结案 ${t.id}（${(t.reasons || []).join("、") || t.label}）`,
        fn: () => { N.closeTicket(t.id, false); return null; }
      });
      opts.push({
        id: "renew_" + t.id, ok: true,
        label: `结案并续门禁 +${TICKET_RENEW_H}h · ${t.id}`,
        fn: () => { N.closeTicket(t.id, true); return null; }
      });
    });
    opts.push({ id: "cancel", ok: true, label: "关掉", fn: () => null });
    G().openMenu({ _name: "物业工单 · 回访结案", interact: "notice" }, opts);
  };

  N.wrapPropertyTicketUI = function () {
    const SA = A(); if (!SA || SA._nTicket) return;
    SA._nTicket = true;
    // threads() resets replies from seed each call — re-inject after
    if (!SA._nTicketThreads) {
      SA._nTicketThreads = true;
      const prevTh = SA.threads.bind(SA);
      SA.threads = function () {
        const chat = prevTh();
        try {
          const th = chat.property;
          if (th && Array.isArray(th.replies) && !th.replies.some((r) => r.id === "ticket_follow")) {
            th.replies = th.replies.concat([{
              id: "ticket_follow",
              label: "有待跟进工单，帮我回访结案",
              them: ["好的，我调登记——你选一下结案方式。", "收到，打开工单菜单处理吧。"]
            }]);
          }
        } catch (e) {}
        return chat;
      };
    }
    const prev = SA.openPhone.bind(SA);
    SA.openPhone = function (tab, threadId) {
      prev(tab, threadId);
      if (tab === "wechat" && (threadId === "property" || !threadId)) {
        const el = document.getElementById("phonepanel");
        const body = el && el.querySelector(".pbd");
        if (body && N.pendingTickets().length && !body.querySelector("[data-ticket-follow]")) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "n-ticket-btn";
          btn.dataset.ticketFollow = "1";
          btn.textContent = `📋 待跟进工单 ${N.pendingTickets().length} · 回访结案`;
          btn.onclick = () => N.openTicketFollowupMenu();
          body.insertBefore(btn, body.firstChild);
        }
      }
    };

    if (SA.replyChat && !SA._nTicketReply) {
      SA._nTicketReply = true;
      const prevR = SA.replyChat.bind(SA);
      SA.replyChat = function (tid, rid) {
        const r = prevR(tid, rid);
        if (tid === "property" && rid === "ticket_follow") {
          setTimeout(() => N.openTicketFollowupMenu(), 200);
        }
        return r;
      };
    }

    // todos
    const sh = SH();
    if (sh && !sh._nTicketTodo) {
      sh._nTicketTodo = true;
      const prevList = sh.listTodos.bind(sh);
      sh.listTodos = function () {
        const todos = prevList();
        if (N.pendingTickets().length) {
          if (!todos.some((t) => t.id === "ticket_follow")) {
            todos.unshift({
              id: "ticket_follow",
              text: `物业工单待跟进（${N.pendingTickets().length}）`,
              place: "housing",
              priority: 9
            });
          }
        }
        return todos;
      };
    }
  };

  // ========== 2) Streak missed-dose → hospital revisit ==========
  N.wrapMissStreak = function () {
    const sm = SM(); if (!sm || sm._nStreak) return;
    sm._nStreak = true;
    const prev = sm.applyMissedDosePenalty.bind(sm);
    sm.applyMissedDosePenalty = function (why) {
      N.ensure();
      ps().flags.rx_miss_streak = (ps().flags.rx_miss_streak || 0) + 1;
      const r = prev(why);
      const streak = ps().flags.rx_miss_streak;
      if (streak >= MISS_STREAK_HOSPITAL && !ps().flags.hospital_revisit_pending) {
        ps().flags.hospital_revisit_pending = true;
        ps().flags.hospital_revisit_streak = streak;
        toast(`连续漏服 ${streak} 次——建议回医院复诊`, 4200);
        if (E()) {
          E().wxPush("aunt", `连续 ${streak} 天没好好吃药？快去医院看看！`, true);
          E().wxPush("aunt", "好的阿姨，我去挂个号。", false);
        }
        if (F()) F().pushLog("rx_revisit", `漏服连续 ${streak} 次→复诊待办`, { place: "civic_hospital" });
      }
      return r;
    };

    // reset streak on successful dose
    const sl = SP.stageL;
    if (sl && sl.takeRxDose && !sl._nStreakReset) {
      sl._nStreakReset = true;
      const prevDose = sl.takeRxDose.bind(sl);
      sl.takeRxDose = function () {
        const ok = prevDose();
        if (ok) {
          ps().flags.rx_miss_streak = 0;
          // keep revisit until player goes / clears
        }
        return ok;
      };
    }

    const sh = SH();
    if (sh && !sh._nRevisitTodo) {
      sh._nRevisitTodo = true;
      const prevList = sh.listTodos.bind(sh);
      sh.listTodos = function () {
        const todos = prevList();
        if (ps().flags.hospital_revisit_pending) {
          if (!todos.some((t) => t.id === "hospital_revisit")) {
            todos.unshift({
              id: "hospital_revisit",
              text: "漏服多次，去医院复诊",
              place: "civic_hospital",
              priority: 9
            });
          }
        }
        return todos;
      };
    }

    // clear revisit when visiting hospital pharmacy/doctor menu
    const SD = SP.stageD;
    if (SD && SD.hospitalNurse && !SD._nRevisitClear) {
      SD._nRevisitClear = true;
      ["hospitalNurse", "hospitalDoctor", "pharmacyMenu"].forEach((fn) => {
        if (!SD[fn]) return;
        const raw = SD[fn].bind(SD);
        SD[fn] = function (o) {
          if (ps().flags.hospital_revisit_pending) {
            ps().flags.hospital_revisit_pending = false;
            ps().flags.hospital_revisit_done = true;
            toast("复诊登记：医生会再看看用药");
            if (F()) F().pushLog("rx_revisit_done", "医院复诊", { place: "civic_hospital" });
          }
          return raw(o);
        };
      });
    }
  };

  // ========== 3) One-tap soft try-on via setOutfitId ==========
  N.tryOnLook = function (lookId) {
    if (!SP.appearance || !SP.appearance.setOutfitId) {
      toast("外观衣柜未接入，无法试穿");
      return false;
    }
    const looks = SP.appearance.PLAYER_LOOKS || [];
    const look = looks.find((l) => l.id === lookId);
    if (!look) { toast("没有这套外观"); return false; }
    const ok = SP.appearance.setOutfitId(lookId);
    if (ok) {
      toast(`已试穿：${look.label}`, 2800);
      if (F()) F().pushLog("try_on", `试穿 ${look.label}`, { place: "room_xin_102" });
    } else toast("试穿失败");
    return !!ok;
  };

  N.wrapTryOn = function () {
    const sj = SJ(); if (!sj || sj._nTry) return;
    sj._nTry = true;
    const prev = sj.suggestChangeOutfit.bind(sj);
    sj.suggestChangeOutfit = function () {
      prev();
      const sm = SM();
      const info = sm && sm.softWardrobeTips ? sm.softWardrobeTips() : { tips: [], name: "" };
      const m = G().menu;
      if (!m || !m.opts) return;
      const can = !!(SP.appearance && SP.appearance.setOutfitId);
      (info.tips || []).forEach((tip, i) => {
        const id = "try_" + tip.id;
        if (m.opts.some((o) => o.id === id)) return;
        m.opts.splice(Math.max(0, m.opts.length - 1), 0, {
          id, ok: can,
          label: can ? `一键试穿：${tip.label}` : `试穿 ${tip.label}（外观未接入）`,
          fn: () => { N.tryOnLook(tip.id); return null; }
        });
      });
      G().openMenu(m.o || { _name: "收衣完成 · 换装建议" }, m.opts);
    };
  };

  // ========== 4) Hour-strip → POI jump ==========
  N.wrapHourPoi = function () {
    const sm = SM(); if (!sm || sm._nPoi) return;
    sm._nPoi = true;
    const prevRender = sm.renderHourStrip.bind(sm);
    sm.renderHourStrip = function (day) {
      let html = prevRender(day);
      N.ensure();
      const d = day != null ? day : (ps().hourStripDay != null ? ps().hourStripDay : N.dayKey());
      const hSel = ps().hourStripHour;
      if (hSel == null) return html;
      const logs = (ps().dayLog || []).filter((r) => (r.day != null ? r.day : 0) === d);
      const atH = logs.filter((r) => sm.parseHour(r.t) === hSel);
      if (!atH.length) return html;
      const sg = SG();
      const detail = atH.map((r, i) => {
        const place = r.place || "";
        const can = !!(place && sg && sg.POI && sg.POI[place]);
        return `<div class="m-hour-row n-poi-row">
          <b>${r.t || ""}</b> ${r.text || ""}
          ${can ? `<button type="button" data-n-jump="${place}">前往 ${sg.POI[place].label}</button>` : ""}
        </div>`;
      }).join("");
      const idx = html.indexOf('class="m-hours-detail"');
      if (idx < 0) return html + `<div class="m-hours-detail">${detail}</div>`;
      const start = html.indexOf(">", idx) + 1;
      const end = html.indexOf("</div>", start);
      if (end < 0) return html;
      return html.slice(0, start) + detail + html.slice(end);
    };

    const sg = SG();
    if (sg && !sg._nPoiBind) {
      sg._nPoiBind = true;
      const prevBind = sg.bindCalendar.bind(sg);
      sg.bindCalendar = function (body) {
        prevBind(body);
        if (!body) return;
        body.querySelectorAll("[data-n-jump]").forEach((b) => {
          b.onclick = () => {
            if (sg.jumpTo) sg.jumpTo(b.dataset.nJump);
          };
        });
      };
    }
  };

  // ========== 5) Long-image share to WeChat friend ==========
  N.shareLongImage = function (friendId) {
    N.ensure();
    const sm = SM();
    const arch = (ps().scanArchive && ps().scanArchive[0]) || null;
    let url = ps().flags.scan_long_image;
    if (!url && sm && sm.renderLongImage) {
      url = sm.renderLongImage(arch);
      ps().flags.scan_long_image = url;
    }
    if (!url) { toast("请先生成长图"); return false; }
    const tid = friendId || "roommate";
    const names = { roommate: "阿凯", aunt: "王阿姨", landlord: "刘姐" };
    const name = names[tid] || tid;
    if (E()) {
      E().wxPush(tid, "（演示）发来一张门禁登记长图", false);
      E().wxPush(tid, `[图片] 馨园门禁登记长图${arch ? " · " + arch.id : ""}`, false);
      E().wxPush(tid, tid === "aunt"
        ? "哟，还挺正式，进出记得扫码啊。"
        : tid === "landlord"
          ? "收到，有需要再发我。"
          : "收到！你这小区登记还挺全哈哈。", true);
    }
    toast(`已分享长图给${name}（演示）`, 3200);
    if (F()) F().pushLog("scan_share", `长图分享→${name}`, { place: "xin" });
    ps().flags.scan_shared_to = tid;
    return true;
  };

  N.wrapLongShare = function () {
    const sm = SM(); if (!sm || sm._nShare) return;
    sm._nShare = true;
    const prevOpen = sm.openLongImagePreview.bind(sm);
    sm.openLongImagePreview = function (dataUrl) {
      prevOpen(dataUrl);
      const el = document.getElementById("phonepanel");
      const body = el && el.querySelector(".pbd");
      if (!body || !body.querySelector(".m-long")) return;
      if (body.querySelector("[data-share-long]")) return;
      const bar = document.createElement("div");
      bar.className = "n-share-bar";
      bar.innerHTML = `
        <button type="button" data-share-long="roommate">分享给阿凯</button>
        <button type="button" data-share-long="aunt">分享给王阿姨</button>
        <button type="button" data-share-long="landlord">分享给房东</button>`;
      body.querySelector(".m-long").appendChild(bar);
      bar.querySelectorAll("[data-share-long]").forEach((b) => {
        b.onclick = () => {
          N.shareLongImage(b.dataset.shareLong);
          if (A()) A().openPhone("wechat", b.dataset.shareLong);
        };
      });
    };
  };

  N.injectCss = function () {
    if (document.getElementById("stageN-css")) return;
    const st = document.createElement("style");
    st.id = "stageN-css";
    st.textContent = `
      .n-ticket-btn{display:block;width:100%;margin:0 0 10px;padding:10px;border:0;border-radius:10px;
        background:#ff9f0a;color:#111;font-size:13px;cursor:pointer}
      .n-share-bar{display:flex;flex-direction:column;gap:6px;margin-top:10px}
      .n-share-bar button{border:0;border-radius:10px;padding:10px;background:#30d158;color:#111;cursor:pointer;font-size:13px}
      .n-poi-row button{margin-left:8px;border:0;border-radius:8px;padding:4px 8px;background:#0a84ff;color:#fff;cursor:pointer;font-size:11px}
    `;
    document.head.appendChild(st);
  };

  N.install = function () {
    const g = G(); if (!g || g._stageN) return; g._stageN = true;
    N.ensure();
    N.injectCss();
    N.wrapPropertyTicketUI();
    N.wrapMissStreak();
    N.wrapTryOn();
    N.wrapHourPoi();
    N.wrapLongShare();
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageM && SP.stageH) N.install();
    else setTimeout(boot, 150);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.SP || (window.SP = {}));
