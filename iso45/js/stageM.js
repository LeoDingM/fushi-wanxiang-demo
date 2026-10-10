/* scene-proto-45 · Stage M: gate→物业工单, missed-dose penalty, soft wardrobe weather tips,
   week hour strip, scan archive/long-image demo. No appearance/NPC_SPEC/civic atlas edits. */
(function (SP) {
  "use strict";
  const M = (SP.stageM = {});
  const G = () => SP.game, C = () => SP.clock;
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 3000);
  const ps = () => G() && G().ps;
  const A = () => SP.stageA;
  const E = () => SP.stageE;
  const F = () => SP.stageF;
  const SL = () => SP.stageL;
  const SJ = () => SP.stageJ;
  const SG = () => SP.stageG;

  const DOSE_MOOD = 6;
  const DOSE_ENERGY = 5;
  const DOSE_HYGIENE = 2;

  // weather → preferred look ids (matched against appearance.PLAYER_LOOKS labels/ids, read-only)
  const WEATHER_LOOK = {
    rain: ["winter", "casual"],
    snow: ["winter"],
    fog: ["winter", "casual"],
    clear: ["casual", "uniform"]
  };

  M.ensure = function () {
    const p = ps(); if (!p) return null;
    p.flags = p.flags || {};
    if (!p.scanLog) p.scanLog = [];
    if (!p.scanArchive) p.scanArchive = [];
    if (!p.gateTickets) p.gateTickets = [];
    if (p.hourStripDay == null) p.hourStripDay = null;
    return p;
  };

  M.dayKey = function () {
    try { return F() ? F().dayKey() : (C().day != null ? C().day : 0); } catch (e) { return 0; }
  };

  // ========== 1) Gate quiz result → property WeChat ticket ==========
  M.ticketStatus = function (choiceId) {
    if (choiceId === "shrug") return "待跟进";
    if (choiceId === "both" || choiceId === "receipt" || choiceId === "scan_explain" || choiceId === "show_log")
      return "已结案";
    return "已登记";
  };

  M.fileGateTicket = function (choiceId, label) {
    M.ensure();
    const fl = ps().flags;
    const reasons = [];
    // reasons already cleared on open; use last quiz snapshot if any
    const snap = fl._gate_quiz_reasons || [];
    if (snap.indexOf("night") >= 0) reasons.push("夜间来电未接");
    if (snap.indexOf("scan") >= 0) reasons.push("漏扫码");
    if (!reasons.length) reasons.push("门岗核验");
    const status = M.ticketStatus(choiceId);
    const id = "GT-" + M.dayKey() + "-" + (ps().gateTickets.length + 1);
    const ticket = {
      id, day: M.dayKey(), t: (E() && E().stamp()) || "",
      choice: choiceId, label: label || choiceId,
      reasons, status,
      note: fl.gate_note ? "已备注" : ""
    };
    ps().gateTickets.unshift(ticket);
    if (ps().gateTickets.length > 20) ps().gateTickets.length = 20;
    fl.last_gate_ticket = id;

    if (E()) {
      E().wxPush("property", `（工单 ${id}）门岗核验已提交 · ${status}`, true);
      E().wxPush("property",
        `事由：${reasons.join("、")}\n处理：${label || choiceId}\n状态：${status}${ticket.note ? " · " + ticket.note : ""}`,
        false);
      if (status === "已结案") {
        E().wxPush("property", `工单 ${id} 已归档，无需再跟进。`, true);
      } else {
        E().wxPush("property", `工单 ${id} 标记待跟进，稍后物业回访。`, true);
      }
    }
    toast(`已生成物业工单 ${id}（${status}）`, 3200);
    if (F()) F().pushLog("gate_ticket", `物业工单 ${id} · ${status}`, { place: "xin" });
    return ticket;
  };

  M.wrapGateTicket = function () {
    const sl = SL(); if (!sl || sl._mTicket) return;
    sl._mTicket = true;
    const prev = sl.maybeUnifiedGateQuiz.bind(sl);
    sl.maybeUnifiedGateQuiz = function () {
      // snapshot reasons before L clears them
      const before = sl.gateReasons ? sl.gateReasons().slice() : [];
      ps().flags._gate_quiz_reasons = before.length ? before : (ps().flags.gate_unified_force ? ["night", "scan"] : before);
      prev();
      const m = G().menu;
      if (!m || !m.opts) return;
      m.opts.forEach((opt) => {
        if (!opt || !opt.fn) return;
        if (["both", "receipt", "scan_explain", "show_log", "shrug"].indexOf(opt.id) < 0) return;
        const raw = opt.fn;
        opt.fn = function () {
          const r = raw.apply(this, arguments);
          try { M.fileGateTicket(opt.id, opt.label); } catch (e) {}
          return r;
        };
      });
      G().openMenu(m.o, m.opts);
    };
  };

  // ========== 2) Missed-dose penalty ==========
  M.applyMissedDosePenalty = function (why) {
    M.ensure();
    const n = ps().needs; if (!n) return;
    n.mood = Math.max(0, (n.mood || 50) - DOSE_MOOD);
    n.energy = Math.max(0, (n.energy || 50) - DOSE_ENERGY);
    n.hygiene = Math.max(0, (n.hygiene || 50) - DOSE_HYGIENE);
    G().hud && G().hud(true);
    toast(`漏服惩罚：心情−${DOSE_MOOD} 精力−${DOSE_ENERGY}${why ? "（" + why + "）" : ""}`, 4000);
    if (F()) F().pushLog("rx_miss", `漏服惩罚${why ? " · " + why : ""}`, { place: "room_xin_102" });
    if (E()) E().wxPush("aunt", "怎么又忘吃药了？身体要紧啊。", true);
    ps().flags.rx_miss_count = (ps().flags.rx_miss_count || 0) + 1;
  };

  M.checkMissedDose = function () {
    M.ensure();
    const sl = SL(); if (!sl || !sl.rxNeedsDose) return;
    const c = ps().rxCourse;
    if (!c) return;
    const d = M.dayKey();
    // course over without finishing — clear quietly
    if (d > c.startDay + c.days - 1) {
      if (c.lastDoseDay !== d - 1 && c.lastDoseDay != null && d - 1 >= c.startDay) {
        // already handled on day roll
      }
      return;
    }
    // day rolled: if previous calendar day was in course and no dose that day
    if (M._rxDay == null) { M._rxDay = d; return; }
    if (d === M._rxDay) return;
    const prevDay = M._rxDay;
    M._rxDay = d;
    if (prevDay >= c.startDay && prevDay <= c.startDay + c.days - 1) {
      if (c.lastDoseDay !== prevDay) {
        if (ps().flags.rx_miss_penalized_day !== prevDay) {
          ps().flags.rx_miss_penalized_day = prevDay;
          M.applyMissedDosePenalty("昨日未打卡");
        }
      }
    }
  };

  M.watchMissedDose = function () {
    M._rxDay = M.dayKey();
    setInterval(() => { try { M.checkMissedDose(); } catch (e) {} }, 1800);
  };

  // also expose manual for tests
  M.forceMissedDosePenalty = function () {
    M.applyMissedDosePenalty("演示");
  };

  // ========== 3) Soft wardrobe tips by weather (read-only looks) ==========
  M.softWardrobeTips = function () {
    let w = "clear";
    try { w = (C().weather || "clear"); } catch (e) {}
    const prefer = WEATHER_LOOK[w] || WEATHER_LOOK.clear;
    const looks = (SP.appearance && SP.appearance.PLAYER_LOOKS) || [];
    const tips = [];
    prefer.forEach((id) => {
      const look = looks.find((l) => l.id === id);
      if (look) tips.push({ id: look.id, label: look.label });
    });
    // also fuzzy match labels containing 冬/厚 for snow/rain
    if ((w === "rain" || w === "snow") && !tips.some((t) => /冬|厚|外套/.test(t.label))) {
      looks.forEach((l) => {
        if (/冬|厚|外套/.test(l.label) && !tips.some((t) => t.id === l.id))
          tips.push({ id: l.id, label: l.label });
      });
    }
    const name = (C().weatherName && C().weatherName()) || w;
    return { weather: w, name, tips };
  };

  M.wrapSoftWardrobe = function () {
    const sj = SJ(); if (!sj || sj._mSoft) return;
    sj._mSoft = true;
    // wrap after L's weather wrap: re-wrap suggestChangeOutfit
    const prev = sj.suggestChangeOutfit.bind(sj);
    sj.suggestChangeOutfit = function () {
      prev();
      const info = M.softWardrobeTips();
      const m = G().menu;
      if (!m || !m.opts) return;
      if (!m.opts.some((o) => o.id === "soft_wardrobe")) {
        const labels = info.tips.map((t) => t.label).join(" / ") || "常服";
        m.opts.splice(Math.max(0, m.opts.length - 1), 0, {
          id: "soft_wardrobe", ok: true,
          label: `天气软推荐：${labels}`,
          fn: () => {
            toast(`今天·${info.name} 建议：${labels}`, 4500);
            if (F()) F().pushLog("wardrobe_soft", `软推荐 ${labels}`, { place: "room_xin_102" });
            if (SP.appearance && SP.appearance.openWardrobe) {
              setTimeout(() => {
                try { SP.appearance.openWardrobe(); } catch (e) {}
              }, 350);
            }
            return null;
          }
        });
        G().openMenu(m.o || { _name: "收衣完成 · 换装建议" }, m.opts);
      }
    };
  };

  // ========== 4) Hour strip on week view ==========
  M.parseHour = function (t) {
    if (!t) return null;
    const m = String(t).match(/(\d{1,2}):(\d{2})/);
    if (!m) return null;
    return Math.min(23, Math.max(0, +m[1]));
  };

  M.renderHourStrip = function (day) {
    M.ensure();
    const d = day != null ? day : (ps().hourStripDay != null ? ps().hourStripDay : M.dayKey());
    const logs = (ps().dayLog || []).filter((r) => (r.day != null ? r.day : 0) === d);
    const hours = {};
    logs.forEach((r) => {
      const h = M.parseHour(r.t);
      if (h == null) return;
      if (!hours[h]) hours[h] = [];
      hours[h].push(r);
    });
    // also mark current game hour if today
    let nowH = null;
    try {
      if (d === M.dayKey()) nowH = Math.floor((((C().abs() % 1440) + 1440) % 1440) / 60);
    } catch (e) {}
    const cells = [];
    for (let h = 6; h <= 22; h++) {
      const n = (hours[h] || []).length;
      const on = nowH === h ? "now" : "";
      const has = n ? "has" : "";
      cells.push(`<button type="button" class="m-hour ${on} ${has}" data-mhour="${h}" title="${h}:00 · ${n} 条">${h}<small>${n || ""}</small></button>`);
    }
    const detail = (ps().hourStripHour != null && hours[ps().hourStripHour])
      ? hours[ps().hourStripHour].map((r) =>
        `<div class="m-hour-row"><b>${r.t || ""}</b> ${r.text || ""}</div>`).join("")
      : `<p class="hint">点选小时查看 D${d} 该时段记录</p>`;
    return `<div class="m-hours">
      <div class="m-hours-label">D${d} 时段</div>
      <div class="m-hours-row">${cells.join("")}</div>
      <div class="m-hours-detail">${detail}</div>
    </div>`;
  };

  M.wrapHourStrip = function () {
    const sl = SL(); if (!sl || sl._mHour) return;
    sl._mHour = true;
    const prevStrip = sl.renderWeekStrip.bind(sl);
    sl.renderWeekStrip = function () {
      M.ensure();
      const base = prevStrip();
      const day = (SG() && SG()._calOpen != null) ? SG()._calOpen : M.dayKey();
      if (ps().hourStripDay == null) ps().hourStripDay = day;
      return base + M.renderHourStrip(ps().hourStripDay != null ? ps().hourStripDay : day);
    };

    const sg = SG();
    if (sg && !sg._mHourBind) {
      sg._mHourBind = true;
      const prevBind = sg.bindCalendar.bind(sg);
      sg.bindCalendar = function (body) {
        prevBind(body);
        if (!body) return;
        body.querySelectorAll("[data-mhour]").forEach((b) => {
          b.onclick = () => {
            ps().hourStripHour = +b.dataset.mhour;
            if (A()) A().openPhone("daylog");
          };
        });
        // sync hour strip day when picking week cell
        body.querySelectorAll("[data-lweek]").forEach((b) => {
          const prev = b.onclick;
          b.onclick = (ev) => {
            ps().hourStripDay = +b.dataset.lweek;
            ps().hourStripHour = null;
            if (prev) prev(ev);
            else {
              sg._calOpen = +b.dataset.lweek;
              if (A()) A().openPhone("daylog");
            }
          };
        });
      };
    }
  };

  // ========== 5) Scan archive + long-image export demo ==========
  M.archiveScans = function () {
    M.ensure();
    const rows = (ps().scanLog || []).slice();
    if (!rows.length) { toast("登记簿为空"); return null; }
    const arch = {
      id: "SA-" + M.dayKey() + "-" + (ps().scanArchive.length + 1),
      day: M.dayKey(),
      t: (E() && E().stamp()) || "",
      count: rows.length,
      rows: rows.slice(0, 40)
    };
    ps().scanArchive.unshift(arch);
    if (ps().scanArchive.length > 12) ps().scanArchive.length = 12;
    // clear live log into archive (demo)
    ps().scanLog = [];
    toast(`已归档 ${arch.count} 条 → ${arch.id}`, 3000);
    if (F()) F().pushLog("scan_archive", `门禁归档 ${arch.id}`, { place: "xin" });
    return arch;
  };

  M.renderLongImage = function (arch) {
    M.ensure();
    const src = arch || (ps().scanArchive && ps().scanArchive[0]);
    const rows = src ? src.rows : (ps().scanLog || []).slice(0, 20);
    if (!rows.length) return null;
    const W = 420, lineH = 28, pad = 16;
    const H = pad * 2 + 48 + rows.length * lineH + 40;
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
    ctx.fillStyle = "#8e8e93";
    ctx.font = "11px sans-serif";
    ctx.fillText("浮世万象 · 演示导出 · 非官方凭证", pad, H - 14);
    return canvas.toDataURL("image/png");
  };

  M.openLongImagePreview = function (dataUrl) {
    if (!dataUrl) { toast("没有可导出的记录"); return; }
    ps().flags.scan_long_image = dataUrl;
    if (A()) A().openPhone("scanlong");
  };

  M.wrapScanArchiveUI = function () {
    const SA = A(); if (!SA || SA._mArch) return;
    SA._mArch = true;
    const prev = SA.openPhone.bind(SA);
    SA.openPhone = function (tab, threadId) {
      if (tab === "scanlong") {
        // custom tab: long image preview
        prev("scanlog", threadId);
        const el = document.getElementById("phonepanel");
        const body = el && el.querySelector(".pbd");
        if (body) {
          const url = ps().flags.scan_long_image;
          body.innerHTML = `<div class="m-long">
            <h4>门禁长图导出</h4>
            ${url ? `<img class="m-long-img" src="${url}" alt="scan long"/>` : `<p class="hint">尚未生成</p>`}
            <p class="hint">演示：可截图保存。归档不会改 civic 外观。</p>
            <button type="button" data-back-scan>返回登记簿</button>
          </div>`;
          const b = body.querySelector("[data-back-scan]");
          if (b) b.onclick = () => SA.openPhone("scanlog");
        }
        return;
      }
      prev(tab, threadId);
      if (tab !== "scanlog") return;
      const el = document.getElementById("phonepanel");
      const body = el && el.querySelector(".pbd");
      if (!body) return;
      if (!body.querySelector("[data-scan-archive]")) {
        const wrap = document.createElement("div");
        wrap.className = "m-arch-btns";
        wrap.innerHTML = `
          <button type="button" data-scan-archive>📦 归档当前登记簿</button>
          <button type="button" data-scan-long>🖼️ 生成长图导出</button>
          <button type="button" data-scan-arch-list>🗂 查看归档（${(ps().scanArchive || []).length}）</button>`;
        body.insertBefore(wrap, body.firstChild);
        wrap.querySelector("[data-scan-archive]").onclick = () => {
          M.archiveScans();
          SA.openPhone("scanlog");
        };
        wrap.querySelector("[data-scan-long]").onclick = () => {
          const arch = (ps().scanArchive && ps().scanArchive[0]) || null;
          const url = M.renderLongImage(arch);
          M.openLongImagePreview(url);
        };
        wrap.querySelector("[data-scan-arch-list]").onclick = () => {
          const list = ps().scanArchive || [];
          if (!list.length) { toast("暂无归档"); return; }
          body.innerHTML = `<div class="m-arch-list"><h4>门禁归档</h4>${list.map((a) =>
            `<div class="m-arch-row"><b>${a.id}</b> D${a.day} · ${a.count} 条
              <button type="button" data-arch-long="${a.id}">长图</button></div>`
          ).join("")}<button type="button" data-back-scan>返回</button></div>`;
          body.querySelectorAll("[data-arch-long]").forEach((b) => {
            b.onclick = () => {
              const a = list.find((x) => x.id === b.dataset.archLong);
              M.openLongImagePreview(M.renderLongImage(a));
            };
          });
          const back = body.querySelector("[data-back-scan]");
          if (back) back.onclick = () => SA.openPhone("scanlog");
        };
      }
    };

    // also menu on openScanLogMenu
    const sj = SJ();
    if (sj && sj.openScanLogMenu && !sj._mArchMenu) {
      sj._mArchMenu = true;
      const prevOpen = sj.openScanLogMenu.bind(sj);
      sj.openScanLogMenu = function (from) {
        prevOpen(from);
        const m = G().menu;
        if (!m || !m.opts) return;
        if (!m.opts.some((o) => o.id === "archive")) {
          m.opts.splice(1, 0, {
            id: "archive", ok: (ps().scanLog || []).length > 0,
            label: "归档当前登记簿…",
            fn: () => { M.archiveScans(); return null; }
          });
          m.opts.splice(2, 0, {
            id: "longimg", ok: (ps().scanLog || []).length > 0 || (ps().scanArchive || []).length > 0,
            label: "生成长图导出（演示）…",
            fn: () => {
              const url = M.renderLongImage();
              M.openLongImagePreview(url);
              return null;
            }
          });
          G().openMenu(m.o || { _name: "门禁登记簿" }, m.opts);
        }
      };
    }
  };

  M.injectCss = function () {
    if (document.getElementById("stageM-css")) return;
    const st = document.createElement("style");
    st.id = "stageM-css";
    st.textContent = `
      .m-hours{margin:8px 0 12px;padding:8px;background:#1c1c1e;border-radius:10px}
      .m-hours-label{font-size:12px;color:#8e8e93;margin-bottom:6px}
      .m-hours-row{display:flex;flex-wrap:wrap;gap:3px}
      .m-hour{background:#2c2c2e;color:#f5f5f7;border:0;border-radius:6px;padding:4px 5px;font-size:10px;cursor:pointer;min-width:28px}
      .m-hour small{display:block;opacity:.65}
      .m-hour.has{background:#243044}
      .m-hour.now{outline:1px solid #0a84ff}
      .m-hours-detail{margin-top:8px;font-size:12px;color:#f5f5f7}
      .m-hour-row{padding:3px 0;border-bottom:1px solid #2c2c2e}
      .m-arch-btns{display:flex;flex-direction:column;gap:6px;margin:0 0 10px}
      .m-arch-btns button,.m-arch-list button,.m-long button{
        border:0;border-radius:10px;padding:10px;background:#2c2c2e;color:#f5f5f7;cursor:pointer;font-size:13px}
      .m-arch-btns button[data-scan-long]{background:#0a84ff;color:#fff}
      .m-long-img{width:100%;border-radius:8px;margin:8px 0;background:#000}
      .m-arch-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid #2c2c2e}
    `;
    document.head.appendChild(st);
  };

  M.install = function () {
    const g = G(); if (!g || g._stageM) return; g._stageM = true;
    M.ensure();
    M.injectCss();
    M.wrapGateTicket();
    M.watchMissedDose();
    M.wrapSoftWardrobe();
    M.wrapHourStrip();
    M.wrapScanArchiveUI();
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageL && SP.stageJ) M.install();
    else setTimeout(boot, 150);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.SP || (window.SP = {}));
