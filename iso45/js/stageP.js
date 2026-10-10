/* scene-proto-45 · Stage P: SLA 物业上门对话, revisit+pharmacy SM, try-on restore,
   itinerary dayLog replay, QR deep-link→门禁 App.
   No appearance/NPC_SPEC/civic atlas/school scene edits. */
(function (SP) {
  "use strict";
  const P = (SP.stageP = {});
  const G = () => SP.game, C = () => SP.clock;
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 3000);
  const ps = () => G() && G().ps;
  const A = () => SP.stageA;
  const E = () => SP.stageE;
  const F = () => SP.stageF;
  const SH = () => SP.stageH;
  const SO = () => SP.stageO;
  const SN = () => SP.stageN;
  const SL = () => SP.stageL;
  const SM = () => SP.stageM;
  const D = () => SP.stageD;

  const DEEP = "fushi://app/scanlog";

  P.ensure = function () {
    const p = ps(); if (!p) return null;
    p.flags = p.flags || {};
    if (!p.tryOn) p.tryOn = { prevId: null, curId: null, active: false };
    if (!p.careSM) p.careSM = { phase: "idle" };
    if (!p.itinReplay) p.itinReplay = [];
    return p;
  };

  P.dayKey = function () {
    try { return F() ? F().dayKey() : (C().day != null ? C().day : 0); } catch (e) { return 0; }
  };

  // ========== 1) SLA → property 上门对话 (text/menu) ==========
  P.openPropertyVisit = function (ticketId) {
    P.ensure();
    const so = SO();
    const list = so ? so.overdueTickets() : [];
    const open = so ? so.openPendingTickets() : (ps().gateTickets || []).filter((t) => t.status === "待跟进");
    const t = ticketId
      ? (ps().gateTickets || []).find((x) => x.id === ticketId)
      : (list[0] || open[0]);
    if (!t) { toast("没有待处理工单"); return; }

    toast("物业小吴上门：「关于你那张门岗工单，当面说一下。」", 4000);
    const opts = [
      {
        id: "explain", ok: true, label: "解释情况，请帮忙结案",
        fn: () => {
          toast("小吴：行，我这边把工单结了，下次进出扫码、电话记得接。");
          if (SN() && SN().closeTicket) SN().closeTicket(t.id, false);
          else { t.status = "已结案"; t.closedHow = "物业上门结案"; }
          ps().flags.property_visit_done = t.id;
          if (F()) F().pushLog("prop_visit", `物业上门结案 ${t.id}`, { place: "xin" });
          return null;
        }
      },
      {
        id: "renew", ok: true, label: "结案并请帮忙续一下门禁",
        fn: () => {
          toast("小吴：结案，门禁也帮你续一点。");
          if (SN() && SN().closeTicket) SN().closeTicket(t.id, true);
          else {
            t.status = "已结案";
            if (SH() && SH().extendAccess) SH().extendAccess(6, "上门结案赠续");
          }
          ps().flags.property_visit_done = t.id;
          if (F()) F().pushLog("prop_visit", `物业上门结案+续期 ${t.id}`, { place: "xin" });
          return null;
        }
      },
      {
        id: "later", ok: true, label: "现在不方便，稍后再说",
        fn: () => {
          toast("小吴：那我微信再催你一次，SLA 别拖太久。");
          if (E()) E().wxPush("property", `（上门未遇）工单 ${t.id} 请尽快在手机里结案。`, true);
          if (F()) F().pushLog("prop_visit", `物业上门改约 ${t.id}`, { place: "xin" });
          return null;
        }
      }
    ];
    G().openMenu({ _name: "物业上门 · 工单 " + t.id, interact: "notice" }, opts);
  };

  P.maybePropertyVisit = function () {
    P.ensure();
    const so = SO(); if (!so || !so.overdueTickets) return;
    const od = so.overdueTickets();
    if (!od.length) return;
    if (G().menu || (E() && E().busRiding)) return;
    if (ps().flags.property_visit_day === P.dayKey() && !ps().flags.property_visit_force) return;
    const m = ((C().abs() % 1440) + 1440) % 1440;
    if (m < 9 * 60 || m > 19 * 60) return;
    // near xin stair / street near xin or forced
    let near = !!ps().flags.property_visit_force;
    try {
      const sid = SP.world && SP.world.sceneId;
      if (sid && String(sid).indexOf("stair_xin") === 0) near = true;
      if (sid === "street" && SP.player) {
        near = near || Math.hypot(SP.player.x - 82, SP.player.y - 15.5) < 14;
      }
    } catch (e) {}
    if (!near) return;
    ps().flags.property_visit_force = false;
    ps().flags.property_visit_day = P.dayKey();
    P.openPropertyVisit(od[0].id);
  };

  P.wrapPropertyVisit = function () {
    setInterval(() => { try { P.maybePropertyVisit(); } catch (e) {} }, 2400);

    const SA = A();
    if (SA && !SA._pVisitPhone) {
      SA._pVisitPhone = true;
      const prev = SA.openPhone.bind(SA);
      SA.openPhone = function (tab, threadId) {
        prev(tab, threadId);
        if (tab === "wechat" && threadId === "property") {
          const el = document.getElementById("phonepanel");
          const body = el && el.querySelector(".pbd");
          const so = SO();
          const n = so && so.overdueTickets ? so.overdueTickets().length : 0;
          if (body && n && !body.querySelector("[data-prop-visit]")) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "p-visit-btn";
            btn.dataset.propVisit = "1";
            btn.textContent = `🚪 物业上门对话（逾期工单 ${n}）`;
            btn.onclick = () => P.openPropertyVisit();
            body.insertBefore(btn, body.firstChild);
          }
        }
      };
    }

    // property thread reply
    if (SA && !SA._pVisitTh) {
      SA._pVisitTh = true;
      const prevTh = SA.threads.bind(SA);
      SA.threads = function () {
        const chat = prevTh();
        try {
          const th = chat.property;
          if (th && Array.isArray(th.replies) && !th.replies.some((r) => r.id === "prop_visit")) {
            th.replies = th.replies.concat([{
              id: "prop_visit",
              label: "方便上门当面结案吗？",
              them: ["我现在就往馨园走，你在一楼附近等我。", "好，当面把工单销了。"]
            }]);
          }
        } catch (e) {}
        return chat;
      };
      if (SA.replyChat && !SA._pVisitReply) {
        SA._pVisitReply = true;
        const prevR = SA.replyChat.bind(SA);
        SA.replyChat = function (tid, rid) {
          const r = prevR(tid, rid);
          if (tid === "property" && rid === "prop_visit") {
            setTimeout(() => {
              ps().flags.property_visit_force = true;
              P.openPropertyVisit();
            }, 250);
          }
          return r;
        };
      }
    }
  };

  // ========== 2) Revisit + pharmacy unified state machine ==========
  // phases: idle | revisit_needed | registering | consulting | pharmacy | course | done
  P.carePhase = function () {
    P.ensure();
    return (ps().careSM && ps().careSM.phase) || "idle";
  };

  P.setCarePhase = function (phase, extra) {
    P.ensure();
    ps().careSM.phase = phase;
    ps().careSM.updatedDay = P.dayKey();
    if (extra) Object.assign(ps().careSM, extra);
    if (F()) F().pushLog("care_sm", `医护状态→${phase}`, { place: "civic_hospital" });
  };

  P.syncCareFromFlags = function () {
    P.ensure();
    const fl = ps().flags;
    const cv = D() && D().ensure && D().ensure().hospital;
    if (fl.hospital_revisit_pending) P.setCarePhase("revisit_needed");
    else if (cv && cv.registered && !cv.seen) P.setCarePhase("registering");
    else if (cv && cv.seen && !cv.bought) P.setCarePhase("pharmacy");
    else if (ps().rxCourse) P.setCarePhase("course");
    else if (fl.hospital_revisit_done && fl.rx_course_reopened) P.setCarePhase("done");
  };

  P.wrapCareSM = function () {
    const SD = D(); if (!SD || SD._pCare) return;
    SD._pCare = true;

    const wrapOne = (name, after) => {
      if (!SD[name]) return;
      const raw = SD[name].bind(SD);
      SD[name] = function (o) {
        P.ensure();
        if (ps().flags.hospital_revisit_pending && name === "hospitalNurse") {
          P.setCarePhase("registering", { reason: "revisit" });
        }
        const r = raw(o);
        try { after && after(); } catch (e) {}
        // enrich pharmacy menu with SM status
        if (name === "pharmacyMenu") {
          const m = G().menu;
          if (m && m.opts && !m.opts.some((x) => x.id === "care_sm")) {
            const ph = P.carePhase();
            m.opts.unshift({
              id: "care_sm", ok: true,
              label: `医护进度：${ph}`,
              fn: () => { toast(`当前医护状态机：${P.carePhase()}`); return null; }
            });
            // if revisit path and course not started after buy — handled below
            G().openMenu(m.o || o, m.opts);
          }
        }
        return r;
      };
    };

    wrapOne("hospitalNurse", () => {
      const cv = SD.ensure().hospital;
      if (cv.registered) P.setCarePhase("consulting");
    });
    wrapOne("hospitalDoctor", () => {
      const cv = SD.ensure().hospital;
      if (cv.seen) {
        P.setCarePhase("pharmacy", { script: cv.script });
        // reset bought so pharmacy can refill on revisit
        if (ps().careSM.reason === "revisit" || ps().flags.hospital_revisit_done) {
          cv.bought = false;
        }
      }
    });
    wrapOne("pharmacyMenu", () => {
      const m = G().menu;
      if (m && m.opts) {
        m.opts.forEach((opt) => {
          if (opt.id !== "rx" && opt.id !== "cold") return;
          const rawFn = opt.fn;
          opt.fn = function () {
            const r = rawFn && rawFn();
            const cv = SD.ensure().hospital;
            if (cv.bought || ps().flags.hospital_meds || opt.id === "cold") {
              const sl = SL();
              if (sl && sl.startRxCourse && !ps().rxCourse) {
                sl.startRxCourse(ps().careSM.script ? "复诊处方药" : "药房取药");
              }
              P.setCarePhase("course");
              ps().flags.rx_course_reopened = true;
            }
            return r;
          };
        });
      }
      const cv = SD.ensure().hospital;
      if (cv.bought || ps().flags.hospital_meds) {
        const sl = SL();
        if (sl && sl.startRxCourse) {
          if (!ps().rxCourse) sl.startRxCourse(ps().careSM.script ? "复诊处方药" : "药房取药");
        }
        P.setCarePhase("course");
        ps().flags.rx_course_reopened = true;
      }
    });

    // unify onHospitalRevisit
    const so = SO();
    if (so && so.onHospitalRevisit && !so._pCareHook) {
      so._pCareHook = true;
      const prev = so.onHospitalRevisit.bind(so);
      so.onHospitalRevisit = function () {
        P.setCarePhase("registering", { reason: "revisit" });
        // reset hospital civic for refill path
        try {
          const cv = D().ensure().hospital;
          cv.registered = false;
          cv.seen = false;
          cv.bought = false;
          cv.script = null;
        } catch (e) {}
        const course = prev();
        P.setCarePhase("course", { auto: true });
        return course;
      };
    }
  };

  P.careStatusText = function () {
    const map = {
      idle: "无就诊",
      revisit_needed: "需复诊",
      registering: "挂号中",
      consulting: "候诊/问诊",
      pharmacy: "待取药",
      course: "服药疗程中",
      done: "已完成"
    };
    return map[P.carePhase()] || P.carePhase();
  };

  // ========== 3) Try-on badge one-tap restore ==========
  P.restoreTryOn = function () {
    P.ensure();
    const t = ps().tryOn;
    if (!t || !t.active || !t.prevId) {
      toast("没有可还原的试穿");
      return false;
    }
    if (!SP.appearance || !SP.appearance.setOutfitId) {
      toast("外观未接入");
      return false;
    }
    const prev = t.prevId;
    const ok = SP.appearance.setOutfitId(prev);
    if (ok) {
      toast(`已还原：${prev}`, 2800);
      t.curId = prev;
      t.active = false;
      t.prevId = null;
      if (SO() && SO().clearTryOnBadge) SO().clearTryOnBadge();
      else { t.active = false; G().hud && G().hud(true); }
      if (F()) F().pushLog("try_restore", `还原试穿→${prev}`, { place: "room_xin_102" });
    }
    return !!ok;
  };

  P.wrapTryOnRestore = function () {
    const sh = SH(); if (!sh || sh._pRestore) return;
    sh._pRestore = true;
    const prevChip = sh.clothesChip.bind(sh);
    sh.clothesChip = function () {
      let html = prevChip();
      // make badge clickable hint
      html = html.replace(
        /class="o-try-badge"/g,
        'class="o-try-badge p-try-restore" data-try-restore="1" title="点击还原上一套"'
      );
      if (ps().tryOn && ps().tryOn.active && html.indexOf("data-try-restore") < 0) {
        html += `<span class="o-try-badge p-try-restore" data-try-restore="1" title="点击还原">还原试穿</span>`;
      }
      return html;
    };

    // bind click after hud
    const g = G();
    if (g && !g._pRestoreHud) {
      g._pRestoreHud = true;
      const prevHud = g.hud.bind(g);
      g.hud = function (force) {
        prevHud(force);
        document.querySelectorAll("[data-try-restore]").forEach((el) => {
          el.style.cursor = "pointer";
          el.onclick = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            P.restoreTryOn();
          };
        });
      };
    }
  };

  // ========== 4) Itinerary → dayLog replay ==========
  P.logItinStep = function (id, label) {
    P.ensure();
    const row = {
      day: P.dayKey(),
      t: (E() && E().stamp && E().stamp().slice(-5)) || "",
      id, label: label || id,
      abs: C().abs && C().abs()
    };
    // stamp() may be full string — try clock time
    try {
      const m = ((C().abs() % 1440) + 1440) % 1440;
      const hh = String((m / 60) | 0).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      row.t = hh + ":" + mm;
    } catch (e) {}
    ps().itinReplay.push(row);
    if (ps().itinReplay.length > 40) ps().itinReplay.shift();
    if (F()) F().pushLog("itin_replay", `路线·${row.label}`, { place: id });
  };

  P.renderItinReplay = function () {
    P.ensure();
    const d = P.dayKey();
    const rows = (ps().itinReplay || []).filter((r) => r.day === d);
    if (!rows.length) return `<p class="hint">今日还没有行程回放。点软行程链会记入。</p>`;
    return `<div class="p-replay"><h4>今日路线回放</h4>${rows.map((r, i) =>
      `<div class="p-replay-row"><span>${i + 1}. ${r.t}</span> ${r.label}
        <button type="button" data-p-replay-jump="${r.id}">再去</button></div>`
    ).join("")}</div>`;
  };

  P.wrapItinReplay = function () {
    const so = SO(); if (!so || so._pReplay) return;
    so._pReplay = true;
    // wrap bind on stageG to also log
    const sg = SP.stageG;
    if (sg && !sg._pReplayBind) {
      sg._pReplayBind = true;
      const prevBind = sg.bindCalendar.bind(sg);
      sg.bindCalendar = function (body) {
        prevBind(body);
        if (!body) return;
        body.querySelectorAll("[data-o-itin]").forEach((b) => {
          const prev = b.onclick;
          b.onclick = (ev) => {
            const id = b.dataset.oItin;
            const lab = (sg.POI[id] && sg.POI[id].label) || id;
            P.logItinStep(id, lab);
            if (prev) prev(ev);
          };
        });
        body.querySelectorAll("[data-p-replay-jump]").forEach((b) => {
          b.onclick = () => {
            const id = b.dataset.pReplayJump;
            if (sg.jumpTo) sg.jumpTo(id);
          };
        });
      };
    }

    // inject replay block into daylog via renderCalendar wrap
    if (sg && !sg._pReplayRender) {
      sg._pReplayRender = true;
      const prev = sg.renderCalendar.bind(sg);
      sg.renderCalendar = function () {
        return P.renderItinReplay() + prev();
      };
    }
  };

  // ========== 5) Long-image QR deep-link → 门禁 App ==========
  P.openScanDeepLink = function () {
    toast("演示深链：打开门禁登记簿", 2500);
    if (F()) F().pushLog("deeplink", "QR→门禁 App", { place: "xin" });
    ps().flags.scan_deeplink_used = true;
    if (A()) A().openPhone("scanlog");
  };

  P.wrapQrDeepLink = function () {
    const so = SO(); if (!so || so._pDeep) return;
    so._pDeep = true;
    // annotate QR caption with deep link
    const prevDraw = so.drawWatermarkQr.bind(so);
    so.drawWatermarkQr = function (ctx, W, H) {
      prevDraw(ctx, W, H);
      ctx.fillStyle = "#0a84ff";
      ctx.font = "10px sans-serif";
      ctx.fillText(DEEP, 16, H - 8);
      ps().flags.scan_deeplink = DEEP;
    };

    const sm = SM();
    if (sm && sm.openLongImagePreview && !sm._pDeepOpen) {
      sm._pDeepOpen = true;
      const prevOpen = sm.openLongImagePreview.bind(sm);
      sm.openLongImagePreview = function (dataUrl) {
        prevOpen(dataUrl);
        const el = document.getElementById("phonepanel");
        const body = el && el.querySelector(".pbd");
        if (!body || !body.querySelector(".m-long")) return;
        if (body.querySelector("[data-qr-deep]")) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "p-deep-btn";
        btn.dataset.qrDeep = "1";
        btn.textContent = "📷 扫描演示二维码 → 打开门禁";
        btn.onclick = () => P.openScanDeepLink();
        body.querySelector(".m-long").appendChild(btn);
        const hint = document.createElement("p");
        hint.className = "hint";
        hint.textContent = `深链演示：${DEEP}`;
        body.querySelector(".m-long").appendChild(hint);
      };
    }
  };

  P.injectCss = function () {
    if (document.getElementById("stageP-css")) return;
    const st = document.createElement("style");
    st.id = "stageP-css";
    st.textContent = `
      .p-visit-btn,.p-deep-btn{display:block;width:100%;margin:0 0 10px;padding:10px;border:0;border-radius:10px;
        background:#ff9f0a;color:#111;font-size:13px;cursor:pointer}
      .p-deep-btn{background:#5e5ce6;color:#fff}
      .p-try-restore{outline:1px dashed #fff;cursor:pointer!important}
      .p-replay{margin:0 0 10px;padding:8px;background:#1c1c1e;border-radius:10px}
      .p-replay h4{margin:0 0 6px;font-size:13px}
      .p-replay-row{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px;border-bottom:1px solid #2c2c2e}
      .p-replay-row button{margin-left:auto;border:0;border-radius:6px;padding:4px 8px;background:#0a84ff;color:#fff;cursor:pointer;font-size:11px}
    `;
    document.head.appendChild(st);
  };

  P.install = function () {
    const g = G(); if (!g || g._stageP) return; g._stageP = true;
    P.ensure();
    P.injectCss();
    P.wrapPropertyVisit();
    P.wrapCareSM();
    P.wrapTryOnRestore();
    P.wrapItinReplay();
    P.wrapQrDeepLink();
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageO && SP.stageN) P.install();
    else setTimeout(boot, 160);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.SP || (window.SP = {}));
