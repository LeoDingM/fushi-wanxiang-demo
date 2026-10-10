/* scene-proto-45 · Stage L: unified gate quiz, weather outfit tips, rx dose check-in,
   scan→物业微信导出, day-log week + todo priority. No appearance/NPC_SPEC/civic atlas edits. */
(function (SP) {
  "use strict";
  const L = (SP.stageL = {});
  const G = () => SP.game, R = () => G() && G().rules, C = () => SP.clock;
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 3000);
  const log = (t) => SP.world && SP.world.logEvent(t);
  const ps = () => G() && G().ps;
  const A = () => SP.stageA;
  const E = () => SP.stageE;
  const F = () => SP.stageF;
  const SJ = () => SP.stageJ;
  const SK = () => SP.stageK;
  const SH = () => SP.stageH;
  const SG = () => SP.stageG;
  const D = () => SP.stageD;

  const RX_COURSE_DAYS = 3;
  const TODO_PRI = {
    gate: 10, missed_scan: 10, gate_unified: 10,
    access: 9, rx_dose: 8, rx: 7,
    dirty: 6, laundry: 5, coupon: 4, scanlog: 3
  };

  L.ensure = function () {
    const p = ps(); if (!p) return null;
    p.flags = p.flags || {};
    if (!p.scanLog) p.scanLog = [];
    if (!p.rxCourse) p.rxCourse = null;
    if (p.daylogView == null) p.daylogView = "week"; // week | day
    return p;
  };

  L.dayKey = function () {
    try { return F() ? F().dayKey() : (C().day != null ? C().day : 0); } catch (e) { return 0; }
  };

  // ========== 1) Unified gate quiz (G follow-up + K missed-scan) ==========
  L.gateReasons = function () {
    L.ensure();
    const fl = ps().flags;
    const reasons = [];
    const day = L.dayKey();
    if (fl.gate_followup_pending && !fl.gate_followup_done) {
      if (fl.gate_followup_day == null || day >= fl.gate_followup_day) reasons.push("night");
    }
    if (fl.missed_scan_pending && !fl.missed_scan_quiz_done) reasons.push("scan");
    return reasons;
  };

  L.suppressSplitQuizzes = function () {
    const sg = SG();
    if (sg && !sg._lGateOff) {
      sg._lGateOff = true;
      sg.maybeGateFollowup = function () { /* Stage L unified */ };
    }
    const sk = SK();
    if (sk && !sk._lGateOff) {
      sk._lGateOff = true;
      sk.maybeGateScanQuiz = function () { /* Stage L unified */ };
    }
  };

  L.maybeUnifiedGateQuiz = function () {
    L.ensure();
    const fl = ps().flags;
    if (fl.gate_unified_done_today === L.dayKey() && !fl.gate_unified_force) return;
    const reasons = L.gateReasons();
    if (!reasons.length && !fl.gate_unified_force) return;
    if (G().menu || (E() && E().busRiding)) return;
    const onStreet = SP.world && !SP.world.interior;
    if (!onStreet) return;
    const m = ((C().abs() % 1440) + 1440) % 1440;
    if (m < 7 * 60 || m > 21 * 60) return;
    let near = false;
    try {
      near = (SP.world.objects || []).some((o) =>
        o.interact === "gate" && Math.hypot(SP.player.x - o.x, SP.player.y - o.y) < 9);
    } catch (e) {}
    const force = !!(fl.gate_unified_force || fl.gate_followup_force || fl.missed_scan_force);
    if (!near && !force && m % 60 > 8) return;

    const rs = reasons.length ? reasons.slice() : ["night", "scan"];
    // clear split pendings so G/K don't race if somehow re-enabled
    fl.gate_followup_pending = false;
    fl.gate_followup_done = true;
    fl.missed_scan_pending = false;
    fl.missed_scan_quiz_done = true;
    fl.gate_unified_force = false;
    fl.gate_unified_done_today = L.dayKey();

    const hasNight = rs.indexOf("night") >= 0;
    const hasScan = rs.indexOf("scan") >= 0;
    let title = "门岗 · 登记核验";
    let hello = "门岗招手：过来登记一下。";
    if (hasNight && hasScan) {
      title = "门岗 · 夜间来电 + 扫码";
      hello = "门岗：昨晚电话没接，登记簿上也没你进门记录——一起说清楚？";
    } else if (hasNight) {
      title = "门岗 · 夜间来电跟进";
      hello = "门岗招手：昨晚派出所电话你没接？过来登记一下。";
    } else if (hasScan) {
      title = "门岗 · 扫码盘问";
      hello = "门岗：登记簿上昨晚到今早没你的进门记录啊？";
    }
    toast(hello, 3500);

    const opts = [];
    if (hasNight) {
      opts.push({
        id: "receipt", ok: true, label: "解释夜间来电并出示回执（若有）",
        fn: () => {
          if (E() && E().hasItem("police_receipt")) {
            toast("门岗：有回执就行，下次电话记得接。给你备注了。");
            fl.gate_note = true;
            if (F()) F().pushLog("gate_unified", "门岗核验：出示回执", { place: "gate" });
          } else {
            toast("门岗：没回执也先记一笔，白天去派出所补材料。");
            if (ps().needs) {
              ps().needs.mood = Math.max(0, (ps().needs.mood || 50) - 3);
              G().hud && G().hud(true);
            }
            if (F()) F().pushLog("gate_unified", "门岗核验：无回执说明", { place: "gate" });
          }
          return null;
        }
      });
    }
    if (hasScan) {
      opts.push({
        id: "scan_explain", ok: true, label: "解释未扫码：住外面 / 忘了扫",
        fn: () => {
          toast("门岗：下次进出记得扫一下，我给你补备注了。");
          if (SK() && SK().pushMakeupNote) SK().pushMakeupNote();
          else L.pushMakeupNote();
          if (F()) F().pushLog("gate_unified", "门岗核验：补扫码登记", { place: "gate" });
          return null;
        }
      });
      opts.push({
        id: "show_log", ok: true, label: "打开手机门禁登记簿给门岗看",
        fn: () => {
          toast("门岗凑近看了眼……行吧，手机里有记录就行。");
          if (A()) A().openPhone("scanlog");
          if (F()) F().pushLog("gate_unified", "门岗核验：出示登记簿", { place: "gate" });
          return null;
        }
      });
    }
    if (hasNight && hasScan) {
      opts.unshift({
        id: "both", ok: true, label: "一并说明：昨夜在外 + 已补材料",
        fn: () => {
          toast("门岗：行，两件事我都记上了。进出记得扫码，电话记得接。");
          fl.gate_note = true;
          if (SK() && SK().pushMakeupNote) SK().pushMakeupNote();
          else L.pushMakeupNote();
          if (F()) F().pushLog("gate_unified", "门岗核验：一并说明", { place: "gate" });
          return null;
        }
      });
    }
    opts.push({
      id: "shrug", ok: true, label: "敷衍两句走开",
      fn: () => {
        toast("门岗：……下次注意。");
        if (ps().needs) {
          const pen = (hasNight && hasScan) ? 6 : hasNight ? 5 : 3;
          ps().needs.mood = Math.max(0, (ps().needs.mood || 50) - pen);
          G().hud && G().hud(true);
        }
        if (F()) F().pushLog("gate_unified", "门岗核验被敷衍", { place: "gate" });
        return null;
      }
    });
    G().openMenu({ _name: title, interact: "gate" }, opts);
  };

  L.pushMakeupNote = function () {
    L.ensure();
    ps().scanLog.unshift({
      t: (E() && E().stamp()) || "",
      abs: C().abs(),
      day: L.dayKey(),
      ok: true,
      detail: "门岗补登记（口述）",
      kind: "makeup"
    });
  };

  L.watchUnifiedGate = function () {
    L.suppressSplitQuizzes();
    setInterval(() => {
      try {
        L.suppressSplitQuizzes();
        L.maybeUnifiedGateQuiz();
      } catch (e) {}
    }, 2000);
  };

  // ========== 2) Weather-aware outfit tips after laundry/collect ==========
  L.weatherOutfitTip = function () {
    let w = "clear", name = "晴";
    try {
      w = C().weather || "clear";
      name = (C().weatherName && C().weatherName()) || w;
    } catch (e) {}
    const tips = {
      rain: "外面在下雨——收好的衣服建议换防水外套或带伞，少穿浅色易脏衣。",
      snow: "下雪天：厚外套/羽绒服更合适，注意鞋子防滑。",
      fog: "有雾：浅色外套更醒目，通勤注意保暖。",
      clear: "天气还行：换上干净常服即可，注意季节薄厚。"
    };
    const tip = tips[w] || tips.clear;
    return { weather: w, name, tip };
  };

  L.wrapWeatherOutfit = function () {
    const sj = SJ(); if (!sj || sj._lWeather) return;
    sj._lWeather = true;
    const prev = sj.suggestChangeOutfit.bind(sj);
    sj.suggestChangeOutfit = function () {
      const info = L.weatherOutfitTip();
      toast(`天气·${info.name}：${info.tip}`, 4200);
      // call original but inject weather option into menu after it opens
      prev();
      const m = G().menu;
      if (!m || !m.opts) return;
      if (!m.opts.some((o) => o.id === "weather_tip")) {
        m.opts.splice(Math.max(0, m.opts.length - 1), 0, {
          id: "weather_tip", ok: true,
          label: `听天气穿衣建议（${info.name}）`,
          fn: () => {
            toast(info.tip, 5000);
            if (F()) F().pushLog("outfit_weather", `天气穿衣：${info.name}`, { place: "room_xin_102" });
            return null;
          }
        });
        G().openMenu(m.o || { _name: "收衣完成 · 换装建议" }, m.opts);
      }
    };
  };

  // ========== 3) Rx daily dose check-in ==========
  L.startRxCourse = function (note) {
    L.ensure();
    ps().rxCourse = {
      startDay: L.dayKey(),
      days: RX_COURSE_DAYS,
      lastDoseDay: null,
      dosesTaken: 0,
      note: note || "按疗程服药"
    };
    ps().flags.rx_dose_reminded_day = null;
    toast(`已开始服药疗程（${RX_COURSE_DAYS} 天）· 每日提醒`, 3200);
    if (F()) F().pushLog("rx_course", `开始服药疗程 ${RX_COURSE_DAYS} 天`, { place: "civic_hospital" });
  };

  L.rxNeedsDose = function () {
    L.ensure();
    const c = ps().rxCourse;
    if (!c) return false;
    const d = L.dayKey();
    if (d > c.startDay + c.days - 1) return false; // course over
    return c.lastDoseDay !== d;
  };

  L.takeRxDose = function () {
    L.ensure();
    const c = ps().rxCourse;
    if (!c) { toast("没有进行中的疗程"); return false; }
    const d = L.dayKey();
    if (c.lastDoseDay === d) { toast("今天已经吃过了"); return false; }
    if (d > c.startDay + c.days - 1) {
      toast("疗程已结束");
      ps().rxCourse = null;
      return false;
    }
    c.lastDoseDay = d;
    c.dosesTaken = (c.dosesTaken || 0) + 1;
    if (ps().needs) {
      ps().needs.mood = Math.min(100, (ps().needs.mood || 50) + 2);
      ps().needs.energy = Math.min(100, (ps().needs.energy || 50) + 3);
      G().hud && G().hud(true);
    }
    toast(`今日服药 ✓（${c.dosesTaken}/${c.days}）`, 2800);
    if (F()) F().pushLog("rx_dose", `服药打卡 D${d}`, { place: "room_xin_102" });
    if (c.dosesTaken >= c.days) {
      setTimeout(() => {
        toast("疗程完成，感觉好多了");
        ps().rxCourse = null;
        if (F()) F().pushLog("rx_done", "服药疗程完成", { place: "civic_hospital" });
      }, 600);
    }
    return true;
  };

  L.wrapPharmacyDose = function () {
    const SD = D(); if (!SD || !SD.pharmacyMenu || SD._lDose) return;
    SD._lDose = true;
    const prev = SD.pharmacyMenu.bind(SD);
    SD.pharmacyMenu = function (o) {
      const ret = prev(o);
      const m = G().menu;
      if (!m || !m.opts) return ret;
      m.opts.forEach((opt) => {
        if (opt.id === "rx" || opt.id === "cold") {
          const raw = opt.fn;
          opt.fn = function () {
            const r = raw && raw();
            // start course when meds obtained
            if (ps().flags.hospital_meds || opt.id === "cold") {
              if (!ps().rxCourse) L.startRxCourse(opt.id === "rx" ? "处方药" : "感冒药");
            }
            return r;
          };
        }
      });
      if (L.rxNeedsDose() && !m.opts.some((x) => x.id === "dose_now")) {
        m.opts.unshift({
          id: "dose_now", ok: true, label: "现在服药打卡（今日）",
          fn: () => { L.takeRxDose(); return null; }
        });
      }
      G().openMenu(m.o || o, m.opts);
      return ret;
    };
  };

  L.watchRxReminder = function () {
    setInterval(() => {
      try {
        L.ensure();
        if (!L.rxNeedsDose()) return;
        const d = L.dayKey();
        if (ps().flags.rx_dose_reminded_day === d) return;
        const m = ((C().abs() % 1440) + 1440) % 1440;
        // remind mid-morning or when opening phone later
        if (m < 8 * 60 || m > 21 * 60) return;
        ps().flags.rx_dose_reminded_day = d;
        toast("服药提醒：今天的药还没吃", 4000);
        if (E()) E().wxPush("aunt", "（提醒）记得按时吃药哦。", true);
        if (F()) F().pushLog("rx_remind", "每日服药提醒", { place: "room_xin_102" });
      } catch (e) {}
    }, 2800);
  };

  L.polishRxPhone = function () {
    const SA = A(); if (!SA || SA._lRxPhone) return;
    SA._lRxPhone = true;
    const prev = SA.openPhone.bind(SA);
    SA.openPhone = function (tab, threadId) {
      prev(tab, threadId);
      if (tab === "daylog" || tab === "bag" || tab === "home") {
        const el = document.getElementById("phonepanel");
        const body = el && el.querySelector(".pbd");
        if (!body) return;
        if (L.rxNeedsDose() && !body.querySelector("[data-rx-dose]")) {
          const bar = document.createElement("div");
          bar.className = "l-rx-bar";
          bar.innerHTML = `<button type="button" data-rx-dose>💊 今日服药打卡</button>`;
          body.insertBefore(bar, body.firstChild);
          bar.querySelector("[data-rx-dose]").onclick = () => {
            L.takeRxDose();
            SA.openPhone(tab, threadId);
          };
        }
      }
    };
  };

  // ========== 4) Scan log → property WeChat export ==========
  L.exportScanSummary = function () {
    L.ensure();
    const rows = (ps().scanLog || []).slice(0, 8);
    if (!rows.length) {
      toast("登记簿为空，无法导出");
      return false;
    }
    const lines = rows.map((r) =>
      `${r.ok ? "通行" : "访客"} D${r.day} ${r.t || ""} ${r.detail || ""}`.trim()
    );
    const summary = `门禁登记摘要（近 ${rows.length} 条）：\n` + lines.join("\n");
    if (E()) {
      E().wxPush("property", `（系统）租户导出了门禁登记摘要。`, true);
      E().wxPush("property", summary, false);
      E().wxPush("property", "收到，已存档备查。进出记得继续扫码。", true);
    }
    toast("已发送门禁摘要到物业微信", 3200);
    if (F()) F().pushLog("scan_export", "导出登记簿到物业微信", { place: "xin" });
    ps().flags.scan_exported = true;
    return true;
  };

  L.wrapScanExport = function () {
    const sj = SJ(); if (!sj || sj._lExport) return;
    sj._lExport = true;
    const prevOpen = sj.openScanLogMenu && sj.openScanLogMenu.bind(sj);
    if (prevOpen) {
      sj.openScanLogMenu = function (from) {
        prevOpen(from);
        const m = G().menu;
        if (!m || !m.opts) return;
        if (!m.opts.some((o) => o.id === "export_wx")) {
          m.opts.splice(1, 0, {
            id: "export_wx", ok: (ps().scanLog || []).length > 0,
            label: "导出摘要到物业微信…",
            fn: () => { L.exportScanSummary(); return null; }
          });
          G().openMenu(m.o || { _name: "门禁登记簿" }, m.opts);
        }
      };
    }
    // phone scanlog button
    const SA = A();
    if (SA && !SA._lExportPhone) {
      SA._lExportPhone = true;
      const prev = SA.openPhone.bind(SA);
      SA.openPhone = function (tab, threadId) {
        prev(tab, threadId);
        if (tab !== "scanlog") return;
        const el = document.getElementById("phonepanel");
        const body = el && el.querySelector(".pbd");
        if (!body || body.querySelector("[data-scan-export]")) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "l-export-btn";
        btn.dataset.scanExport = "1";
        btn.textContent = "📤 导出摘要到物业微信";
        btn.onclick = () => {
          L.exportScanSummary();
          SA.openPhone("wechat", "property");
        };
        body.insertBefore(btn, body.firstChild);
      };
    }
  };

  // ========== 5) Day-log week view + todo priority ==========
  L.sortTodos = function (todos) {
    return (todos || []).slice().sort((a, b) => {
      const pa = TODO_PRI[a.id] != null ? TODO_PRI[a.id] : 1;
      const pb = TODO_PRI[b.id] != null ? TODO_PRI[b.id] : 1;
      if (pb !== pa) return pb - pa;
      return String(a.text || "").localeCompare(String(b.text || ""), "zh");
    }).map((t, i) => Object.assign({}, t, {
      priority: TODO_PRI[t.id] != null ? TODO_PRI[t.id] : 1,
      rank: i + 1
    }));
  };

  L.weekDays = function () {
    const cur = L.dayKey();
    const start = Math.max(0, cur - (cur % 7));
    return [0, 1, 2, 3, 4, 5, 6].map((i) => start + i);
  };

  L.renderWeekStrip = function () {
    L.ensure();
    const cur = L.dayKey();
    const days = L.weekDays();
    const view = ps().daylogView || "week";
    const logs = ps().dayLog || [];
    const byDay = {};
    logs.forEach((r) => {
      const d = r.day != null ? r.day : 0;
      byDay[d] = (byDay[d] || 0) + 1;
    });
    const cells = days.map((d) => {
      const n = byDay[d] || 0;
      const on = d === cur ? "today" : "";
      const has = n ? "has" : "";
      return `<button type="button" class="l-week-cell ${on} ${has}" data-lweek="${d}">D${d}<small>${n || "·"}</small></button>`;
    }).join("");
    return `<div class="l-week">
      <div class="l-week-tabs">
        <button type="button" class="l-tab ${view === "week" ? "on" : ""}" data-lview="week">本周</button>
        <button type="button" class="l-tab ${view === "day" ? "on" : ""}" data-lview="day">按日</button>
      </div>
      <div class="l-week-row">${cells}</div>
    </div>`;
  };

  L.polishDaylogWeek = function () {
    const sg = SG(); if (!sg || sg._lWeek) return;
    sg._lWeek = true;
    const prevRender = sg.renderCalendar.bind(sg);
    sg.renderCalendar = function () {
      L.ensure();
      const strip = L.renderWeekStrip();
      if (ps().daylogView === "week") {
        // show only this week's days folded
        const days = L.weekDays();
        const SF = F(); SF && SF.ensure();
        const rows = (ps().dayLog || []).filter((r) => days.indexOf(r.day != null ? r.day : 0) >= 0);
        const byDay = {};
        rows.forEach((r) => {
          const d = r.day != null ? r.day : 0;
          if (!byDay[d]) byDay[d] = [];
          byDay[d].push(r);
        });
        const open = sg._calOpen != null ? sg._calOpen : L.dayKey();
        const body = days.map((d) => {
          const list = byDay[d] || [];
          const openCls = d === open ? "open" : "";
          return `<div class="pcal-day ${openCls}" data-day="${d}">
            <button type="button" class="pcal-fold" data-fold="${d}">D${d} · ${list.length} 条 ${d === open ? "▾" : "▸"}</button>
            <div class="pcal-body">${d === open ? list.map((r) => {
              const place = r.place || "";
              const can = !!(place && sg.POI && sg.POI[place]);
              return `<div class="plog-row">
                <span>${r.t || ""}</span> <i class="pk">${r.kind || ""}</i>
                <p>${r.text}</p>
                ${can ? `<button type="button" data-jump="${place}">前往 ${sg.POI[place].label}</button>` : ""}
              </div>`;
            }).join("") : (list.length ? "" : `<p class="hint">这一天暂无记录</p>`)}</div>
          </div>`;
        }).join("");
        return strip + `<div class="plog pcal">${body}</div>`;
      }
      return strip + prevRender();
    };

    const prevBind = sg.bindCalendar.bind(sg);
    sg.bindCalendar = function (body) {
      prevBind(body);
      if (!body) return;
      body.querySelectorAll("[data-lview]").forEach((b) => {
        b.onclick = () => {
          ps().daylogView = b.dataset.lview;
          if (A()) A().openPhone("daylog");
        };
      });
      body.querySelectorAll("[data-lweek]").forEach((b) => {
        b.onclick = () => {
          sg._calOpen = +b.dataset.lweek;
          ps().daylogView = "week";
          if (A()) A().openPhone("daylog");
        };
      });
    };
  };

  L.polishTodoPriority = function () {
    const sh = SH(); if (!sh || sh._lPri) return;
    sh._lPri = true;
    const prevList = sh.listTodos.bind(sh);
    sh.listTodos = function () {
      L.ensure();
      let todos = prevList();
      // unified gate todo replaces split ones when both
      const reasons = L.gateReasons();
      if (reasons.length >= 1) {
        todos = todos.filter((t) => t.id !== "gate" && t.id !== "missed_scan");
        const text = reasons.indexOf("night") >= 0 && reasons.indexOf("scan") >= 0
          ? "门岗核验：夜间来电 + 漏扫码"
          : reasons.indexOf("night") >= 0
            ? "门岗核验：夜间来电未接"
            : "门岗核验：昨夜未扫码";
        todos.unshift({ id: "gate_unified", text, place: "gate" });
      }
      if (L.rxNeedsDose()) {
        if (!todos.some((t) => t.id === "rx_dose")) {
          todos.unshift({ id: "rx_dose", text: "今日服药打卡", place: "room_xin_102" });
        }
      }
      return L.sortTodos(todos);
    };

    const prevRender = sh.renderTodos.bind(sh);
    sh.renderTodos = function () {
      const todos = sh.listTodos();
      if (!todos.length) {
        // still keep merge link from K if any
        const extra = prevRender();
        return extra.indexOf("k-merge") >= 0 || extra.indexOf("data-open-scanlog") >= 0 ? extra : "";
      }
      const rows = todos.map((t) => `
        <div class="ptodo-row"><span class="l-pri">P${t.priority || 1}</span>
        <span>${t.text}</span>
        <button type="button" data-todo-jump="${t.place}">前往</button></div>`).join("");
      let html = `<div class="ptodo"><h4>待办 ${todos.length}（已按优先级）</h4>${rows}</div>`;
      // append K merge link if present in prev
      const prev = prevRender();
      const m = prev.match(/<div class="k-merge-link"[^>]*>[\s\S]*?<\/div>/);
      if (m) html += m[0];
      else html += `<div class="k-merge-link" data-open-scanlog>🛂 打开门禁登记簿（可按日筛选）</div>`;
      return html;
    };
  };

  L.injectCss = function () {
    if (document.getElementById("stageL-css")) return;
    const st = document.createElement("style");
    st.id = "stageL-css";
    st.textContent = `
      .l-week{margin:0 0 10px}
      .l-week-tabs{display:flex;gap:6px;margin-bottom:8px}
      .l-tab{background:#2c2c2e;color:#f5f5f7;border:0;border-radius:8px;padding:5px 12px;cursor:pointer;font-size:12px}
      .l-tab.on{background:#0a84ff}
      .l-week-row{display:flex;gap:4px;flex-wrap:wrap}
      .l-week-cell{flex:1;min-width:36px;background:#1c1c1e;color:#f5f5f7;border:0;border-radius:8px;padding:6px 4px;cursor:pointer;font-size:11px}
      .l-week-cell small{display:block;opacity:.7}
      .l-week-cell.today{outline:1px solid #0a84ff}
      .l-week-cell.has{background:#243044}
      .l-pri{display:inline-block;min-width:28px;color:#ff9f0a;font-size:11px;margin-right:4px}
      .l-export-btn,.l-rx-bar button{display:block;width:100%;margin:0 0 10px;padding:10px;border:0;border-radius:10px;
        background:#0a84ff;color:#fff;font-size:13px;cursor:pointer}
      .l-rx-bar button{background:#30d158;color:#111}
    `;
    document.head.appendChild(st);
  };

  // ========== install ==========
  L.install = function () {
    const g = G(); if (!g || g._stageL) return; g._stageL = true;
    L.ensure();
    L.injectCss();
    L.watchUnifiedGate();
    L.wrapWeatherOutfit();
    L.wrapPharmacyDose();
    L.watchRxReminder();
    L.polishRxPhone();
    L.wrapScanExport();
    L.polishDaylogWeek();
    L.polishTodoPriority();
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageK && SP.stageG && SP.stageH) L.install();
    else setTimeout(boot, 140);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.SP || (window.SP = {}));
