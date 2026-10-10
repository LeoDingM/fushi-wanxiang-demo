/* scene-proto-45 · Stage O: ticket SLA + second gate check, revisit→rx course,
   try-on vs current HUD badge, hour itinerary chain, long-image watermark/QR.
   No appearance/NPC_SPEC/civic atlas/school scene edits. */
(function (SP) {
  "use strict";
  const O = (SP.stageO = {});
  const G = () => SP.game, C = () => SP.clock;
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 3000);
  const ps = () => G() && G().ps;
  const A = () => SP.stageA;
  const E = () => SP.stageE;
  const F = () => SP.stageF;
  const SH = () => SP.stageH;
  const SM = () => SP.stageM;
  const SN = () => SP.stageN;
  const SL = () => SP.stageL;
  const SG = () => SP.stageG;

  const SLA_DAYS = 1; // due next game day
  const SECOND_CHECK_MOOD = 4;

  O.ensure = function () {
    const p = ps(); if (!p) return null;
    p.flags = p.flags || {};
    if (!p.gateTickets) p.gateTickets = [];
    if (!p.tryOn) p.tryOn = { prevId: null, curId: null, active: false };
    if (!p.itinerary) p.itinerary = [];
    return p;
  };

  O.dayKey = function () {
    try { return F() ? F().dayKey() : (C().day != null ? C().day : 0); } catch (e) { return 0; }
  };

  // ========== 1) Ticket SLA + second gate check ==========
  O.overdueTickets = function () {
    O.ensure();
    const d = O.dayKey();
    return (ps().gateTickets || []).filter((t) =>
      t.status === "待跟进" && t.dueDay != null && d > t.dueDay);
  };

  O.openPendingTickets = function () {
    O.ensure();
    return (ps().gateTickets || []).filter((t) => t.status === "待跟进");
  };

  O.wrapTicketSla = function () {
    const sm = SM(); if (!sm || sm._oSla) return;
    sm._oSla = true;
    const prev = sm.fileGateTicket.bind(sm);
    sm.fileGateTicket = function (choiceId, label) {
      const t = prev(choiceId, label);
      if (t && t.status === "待跟进") {
        t.dueDay = (t.day != null ? t.day : O.dayKey()) + SLA_DAYS;
        t.sla = "T+" + SLA_DAYS;
        if (E()) E().wxPush("property", `（工单 ${t.id}）SLA：请于 D${t.dueDay} 前结案，逾期门岗二次核验。`, true);
        if (F()) F().pushLog("ticket_sla", `工单 ${t.id} SLA→D${t.dueDay}`, { place: "xin" });
      }
      return t;
    };
  };

  O.maybeSecondGateCheck = function () {
    O.ensure();
    const open = O.openPendingTickets();
    if (!open.length) return;
    if (G().menu || (E() && E().busRiding)) return;
    const onStreet = SP.world && !SP.world.interior;
    if (!onStreet) return;
    const m = ((C().abs() % 1440) + 1440) % 1440;
    if (m < 8 * 60 || m > 20 * 60) return;
    let near = false;
    try {
      near = (SP.world.objects || []).some((o) =>
        o.interact === "gate" && Math.hypot(SP.player.x - o.x, SP.player.y - o.y) < 9);
    } catch (e) {}
    const force = !!ps().flags.second_gate_force;
    if (!near && !force) return;
    const overdue = O.overdueTickets();
    const d = O.dayKey();
    // one second-check per day unless force
    if (!force && ps().flags.second_gate_day === d) return;
    ps().flags.second_gate_force = false;
    ps().flags.second_gate_day = d;

    const focus = overdue[0] || open[0];
    const isOver = overdue.length > 0;
    toast(isOver
      ? `门岗二次核验：工单 ${focus.id} 已逾期（SLA D${focus.dueDay}）`
      : `门岗二次核验：还有待跟进工单 ${focus.id}`, 4000);

    const opts = [
      {
        id: "show_ticket", ok: true, label: `出示工单 ${focus.id} 进度`,
        fn: () => {
          toast(`门岗：看到了，状态「${focus.status}」${focus.dueDay != null ? " · 截止 D" + focus.dueDay : ""}。去催物业结案。`);
          if (A()) A().openPhone("wechat", "property");
          if (F()) F().pushLog("second_gate", `二次核验出示 ${focus.id}`, { place: "gate" });
          return null;
        }
      },
      {
        id: "urge", ok: true, label: "马上联系物业结案…",
        fn: () => {
          if (SN() && SN().openTicketFollowupMenu) SN().openTicketFollowupMenu();
          else toast("打开物业工单菜单");
          if (F()) F().pushLog("second_gate", "二次核验→催结案", { place: "gate" });
          return null;
        }
      },
      {
        id: "shrug", ok: true, label: "敷衍走开",
        fn: () => {
          toast("门岗：工单不结，下次还拦你。");
          if (ps().needs) {
            ps().needs.mood = Math.max(0, (ps().needs.mood || 50) - SECOND_CHECK_MOOD);
            G().hud && G().hud(true);
          }
          if (F()) F().pushLog("second_gate", "二次核验被敷衍", { place: "gate" });
          return null;
        }
      }
    ];
    G().openMenu({
      _name: isOver ? "门岗 · SLA 逾期二次核验" : "门岗 · 待跟进工单二次核验",
      interact: "gate"
    }, opts);
  };

  O.watchSla = function () {
    setInterval(() => {
      try {
        O.ensure();
        const od = O.overdueTickets();
        if (od.length && ps().flags.ticket_sla_warned_day !== O.dayKey()) {
          ps().flags.ticket_sla_warned_day = O.dayKey();
          toast(`物业催办：${od.length} 张工单已过 SLA`, 3500);
          if (E()) E().wxPush("property", `（催办）工单 ${od.map((t) => t.id).join("、")} 已逾期，请尽快结案。`, true);
        }
        O.maybeSecondGateCheck();
      } catch (e) {}
    }, 2200);
  };

  O.polishSlaTodos = function () {
    const sh = SH(); if (!sh || sh._oSlaTodo) return;
    sh._oSlaTodo = true;
    const prev = sh.listTodos.bind(sh);
    sh.listTodos = function () {
      const todos = prev();
      const od = O.overdueTickets();
      if (od.length && !todos.some((t) => t.id === "ticket_sla")) {
        todos.unshift({
          id: "ticket_sla",
          text: `工单 SLA 逾期 ×${od.length}（门岗可能二次核验）`,
          place: "gate",
          priority: 11
        });
      }
      return todos;
    };
  };

  // ========== 2) Hospital revisit → auto re-open rx course ==========
  O.wrapRevisitCourse = function () {
    const SD = SP.stageD; if (!SD || SD._oRx) return;
    SD._oRx = true;
    ["hospitalNurse", "hospitalDoctor", "pharmacyMenu"].forEach((fn) => {
      if (!SD[fn]) return;
      const raw = SD[fn].bind(SD);
      SD[fn] = function (o) {
        const was = !!ps().flags.hospital_revisit_pending || !!ps().flags.hospital_revisit_done;
        // N clears pending before calling raw in its wrap — order: N wraps first, then we wrap again after N install
        const pendingBefore = !!ps().flags.hospital_revisit_pending;
        const r = raw(o);
        // If N already cleared on this call, hospital_revisit_done just set
        if (pendingBefore || ps().flags.hospital_revisit_done) {
          if (!ps().flags.rx_course_reopened) {
            const sl = SL();
            if (sl && sl.startRxCourse) {
              sl.startRxCourse("复诊续疗程");
              ps().flags.rx_course_reopened = true;
              ps().flags.rx_miss_streak = 0;
              toast("复诊后续开服药疗程（自动）", 3200);
              if (F()) F().pushLog("rx_reopen", "复诊自动重开疗程", { place: "civic_hospital" });
            }
          }
        }
        return r;
      };
    });
  };

  // Also hook when hospital_revisit_done flips via N — poll flag
  O.watchRevisitCourse = function () {
    let last = false;
    setInterval(() => {
      try {
        const done = !!ps().flags.hospital_revisit_done;
        const pending = !!ps().flags.hospital_revisit_pending;
        // when pending goes true→false and done true, ensure course
        if (done && !pending && !ps().flags.rx_course_reopened) {
          const sl = SL();
          if (sl && sl.startRxCourse) {
            // only if no active course or course empty
            if (!ps().rxCourse) {
              sl.startRxCourse("复诊续疗程");
              ps().flags.rx_course_reopened = true;
              ps().flags.rx_miss_streak = 0;
            } else {
              ps().flags.rx_course_reopened = true;
            }
          }
        }
        if (!done && !pending) ps().flags.rx_course_reopened = false;
        last = done;
      } catch (e) {}
    }, 2000);
  };

  // Explicit API for tests / nurse path
  O.onHospitalRevisit = function () {
    O.ensure();
    ps().flags.hospital_revisit_pending = false;
    ps().flags.hospital_revisit_done = true;
    const sl = SL();
    if (sl && sl.startRxCourse) {
      sl.startRxCourse("复诊续疗程");
      ps().flags.rx_course_reopened = true;
      ps().flags.rx_miss_streak = 0;
    }
    toast("复诊完成 · 已重开服药疗程", 3200);
    if (F()) F().pushLog("rx_reopen", "复诊自动重开疗程", { place: "civic_hospital" });
    return ps().rxCourse;
  };

  // ========== 3) Try-on vs current HUD badge ==========
  O.wrapTryOnBadge = function () {
    const sn = SN(); if (!sn || sn._oBadge) return;
    sn._oBadge = true;
    const prev = sn.tryOnLook.bind(sn);
    sn.tryOnLook = function (lookId) {
      O.ensure();
      let prevId = null;
      try {
        prevId = SP.appearance && SP.appearance.getOutfitId && SP.appearance.getOutfitId();
      } catch (e) {}
      const ok = prev(lookId);
      if (ok) {
        ps().tryOn.prevId = prevId;
        ps().tryOn.curId = lookId;
        ps().tryOn.active = prevId != null && prevId !== lookId;
        G().hud && G().hud(true);
      }
      return ok;
    };

    const sh = SH();
    if (sh && !sh._oBadgeHud) {
      sh._oBadgeHud = true;
      const prevChip = sh.clothesChip.bind(sh);
      sh.clothesChip = function () {
        let html = prevChip();
        O.ensure();
        if (ps().tryOn && ps().tryOn.active) {
          const looks = (SP.appearance && SP.appearance.PLAYER_LOOKS) || [];
          const a = looks.find((l) => l.id === ps().tryOn.prevId);
          const b = looks.find((l) => l.id === ps().tryOn.curId);
          const al = (a && a.label) || ps().tryOn.prevId || "?";
          const bl = (b && b.label) || ps().tryOn.curId || "?";
          html += `<span class="o-try-badge" title="试穿对比">试穿 ${al}→${bl}</span>`;
        }
        return html;
      };
    }
  };

  O.clearTryOnBadge = function () {
    O.ensure();
    ps().tryOn.active = false;
    G().hud && G().hud(true);
  };

  // ========== 4) Hour itinerary chain (bus/shops soft links) ==========
  O.SOFT_POI = {
    bus: { label: "公交站", scene: "street", xy: [-18, 3.5] },
    store: { label: "24便利店", scene: "street", xy: [8, 2.5] },
    noodles: { label: "兰州牛肉面", scene: "street", xy: [68, 2.2] },
    tea: { label: "茶语奶茶", scene: "street", xy: [72, 2.2] },
    gate: { label: "铁门门岗", scene: "street", xy: [-2, 11] },
    hospital_stop: { label: "卫生中心站", scene: "street", xy: [22, 1.0] }
  };

  O.ensureSoftPoi = function () {
    const sg = SG(); if (!sg || !sg.POI) return;
    Object.keys(O.SOFT_POI).forEach((k) => {
      if (!sg.POI[k]) sg.POI[k] = O.SOFT_POI[k];
    });
  };

  O.itineraryForHour = function (hour) {
    // soft chain by time of day
    if (hour >= 7 && hour < 10) return ["bus", "store", "hospital_stop"];
    if (hour >= 11 && hour < 14) return ["noodles", "tea", "bus"];
    if (hour >= 17 && hour < 20) return ["store", "bus", "gate"];
    return ["bus", "store", "tea"];
  };

  O.renderItinerary = function (hour) {
    O.ensureSoftPoi();
    const chain = O.itineraryForHour(hour != null ? hour : 12);
    const sg = SG();
    return `<div class="o-itin">
      <div class="o-itin-label">软行程链 · ${hour != null ? hour + ":00" : "推荐"}</div>
      <div class="o-itin-row">${chain.map((id, i) => {
        const meta = (sg && sg.POI[id]) || O.SOFT_POI[id];
        const lab = meta ? meta.label : id;
        return `${i ? "<span class='o-itin-arr'>→</span>" : ""}
          <button type="button" class="o-itin-btn" data-o-itin="${id}">${lab}</button>`;
      }).join("")}</div>
    </div>`;
  };

  O.wrapItinerary = function () {
    O.ensureSoftPoi();
    const sm = SM(); if (!sm || sm._oItin) return;
    sm._oItin = true;
    const prev = sm.renderHourStrip.bind(sm);
    sm.renderHourStrip = function (day) {
      let html = prev(day);
      const h = ps().hourStripHour;
      html += O.renderItinerary(h != null ? h : 12);
      return html;
    };

    const sg = SG();
    if (sg && !sg._oItinBind) {
      sg._oItinBind = true;
      const prevBind = sg.bindCalendar.bind(sg);
      sg.bindCalendar = function (body) {
        prevBind(body);
        if (!body) return;
        body.querySelectorAll("[data-o-itin]").forEach((b) => {
          b.onclick = () => {
            O.ensureSoftPoi();
            const id = b.dataset.oItin;
            toast(`行程：前往 ${(sg.POI[id] && sg.POI[id].label) || id}`);
            if (F()) F().pushLog("itin", `软行程→${id}`, { place: id });
            if (sg.jumpTo) sg.jumpTo(id);
          };
        });
      };
    }
  };

  // ========== 5) Long-image watermark / QR demo ==========
  O.drawWatermarkQr = function (ctx, W, H) {
    // watermark text
    ctx.save();
    ctx.translate(W * 0.55, H * 0.55);
    ctx.rotate(-Math.PI / 6);
    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillText("浮世万象 · 演示", 0, 0);
    ctx.restore();

    // fake QR block (7x7 modules) bottom-right
    const qr = 56, margin = 12;
    const x0 = W - qr - margin, y0 = H - qr - margin - 18;
    ctx.fillStyle = "#fff";
    ctx.fillRect(x0 - 4, y0 - 4, qr + 8, qr + 8);
    ctx.fillStyle = "#111";
    // finder-ish pattern
    const mod = 7, cell = qr / mod;
    const bits = [
      1,1,1,1,1,1,1,
      1,0,0,0,0,0,1,
      1,0,1,1,1,0,1,
      1,0,1,1,1,0,1,
      1,0,1,1,1,0,1,
      1,0,0,0,0,0,1,
      1,1,1,1,1,1,1
    ];
    for (let i = 0; i < mod * mod; i++) {
      if (!bits[i]) continue;
      const x = i % mod, y = (i / mod) | 0;
      ctx.fillRect(x0 + x * cell, y0 + y * cell, cell - 0.5, cell - 0.5);
    }
    // data-ish noise
    ctx.fillStyle = "#333";
    for (let i = 0; i < 12; i++) {
      const x = 2 + (i % 3), y = 2 + ((i / 3) | 0);
      if (x < 5 && y < 5) ctx.fillRect(x0 + x * cell + 1, y0 + y * cell + 1, cell * 0.5, cell * 0.5);
    }
    ctx.fillStyle = "#8e8e93";
    ctx.font = "10px sans-serif";
    ctx.fillText("演示二维码 · 非真实链接", x0 - 4, y0 + qr + 14);
  };

  O.wrapLongWatermark = function () {
    const sm = SM(); if (!sm || sm._oWm) return;
    sm._oWm = true;
    const prev = sm.renderLongImage.bind(sm);
    sm.renderLongImage = function (arch) {
      // rebuild with extra footer space for QR
      O.ensure();
      const src = arch || (ps().scanArchive && ps().scanArchive[0]);
      const rows = src ? src.rows : (ps().scanLog || []).slice(0, 20);
      if (!rows.length) return null;
      const W = 420, lineH = 28, pad = 16;
      const H = pad * 2 + 48 + rows.length * lineH + 100;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#1c1c1e";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#0a84ff";
      ctx.fillRect(0, 0, W, 44);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("馨园门禁登记 · 长图导出（演示）", pad, 28);
      ctx.font = "13px sans-serif";
      ctx.fillStyle = "#f5f5f7";
      const head = src ? `${src.id} · ${src.count} 条 · ${src.t || ""}` : `实时 · ${rows.length} 条`;
      ctx.fillText(head, pad, 64);
      rows.forEach((r, i) => {
        const y = 88 + i * lineH;
        ctx.fillStyle = r.ok ? "#30d158" : "#ff9f0a";
        ctx.fillRect(pad, y - 12, 4, 18);
        ctx.fillStyle = "#f5f5f7";
        const line = `${r.ok ? "通行" : "访客"}  D${r.day}  ${r.t || ""}  ${r.detail || ""}`;
        ctx.fillText(line.slice(0, 42), pad + 12, y);
      });
      O.drawWatermarkQr(ctx, W, H);
      ctx.fillStyle = "#8e8e93";
      ctx.font = "11px sans-serif";
      ctx.fillText("浮世万象 · 水印/二维码演示 · 非官方凭证", pad, H - 8);
      const url = canvas.toDataURL("image/png");
      ps().flags.scan_long_has_wm = true;
      return url;
    };

    // preview note
    const prevOpen = sm.openLongImagePreview.bind(sm);
    sm.openLongImagePreview = function (dataUrl) {
      prevOpen(dataUrl);
      const el = document.getElementById("phonepanel");
      const body = el && el.querySelector(".pbd");
      if (!body || !body.querySelector(".m-long")) return;
      if (!body.querySelector(".o-wm-hint")) {
        const p = document.createElement("p");
        p.className = "hint o-wm-hint";
        p.textContent = "已加水印 + 演示二维码（非正式凭证）";
        body.querySelector(".m-long").appendChild(p);
      }
    };
  };

  O.injectCss = function () {
    if (document.getElementById("stageO-css")) return;
    const st = document.createElement("style");
    st.id = "stageO-css";
    st.textContent = `
      .o-try-badge{display:inline-block;margin-left:6px;padding:2px 8px;border-radius:8px;
        background:#5e5ce6;color:#fff;font-size:11px;vertical-align:middle}
      .o-itin{margin:8px 0;padding:8px;background:#1c1c1e;border-radius:10px}
      .o-itin-label{font-size:12px;color:#8e8e93;margin-bottom:6px}
      .o-itin-row{display:flex;flex-wrap:wrap;align-items:center;gap:4px}
      .o-itin-btn{border:0;border-radius:8px;padding:6px 10px;background:#0a84ff;color:#fff;cursor:pointer;font-size:12px}
      .o-itin-arr{color:#8e8e93;padding:0 2px}
      .o-wm-hint{color:#ffd60a!important}
    `;
    document.head.appendChild(st);
  };

  O.install = function () {
    const g = G(); if (!g || g._stageO) return; g._stageO = true;
    O.ensure();
    O.injectCss();
    O.wrapTicketSla();
    O.watchSla();
    O.polishSlaTodos();
    O.wrapRevisitCourse();
    O.watchRevisitCourse();
    O.wrapTryOnBadge();
    O.wrapItinerary();
    O.wrapLongWatermark();
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageN && SP.stageM) O.install();
    else setTimeout(boot, 160);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.SP || (window.SP = {}));
