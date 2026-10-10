/* scene-proto-45 · Stage R: visit reschedule/no-show + rating, health weekly report,
   try-on favorites, commute template, unified deeplink router + notif bar.
   No appearance/NPC_SPEC/civic atlas/school edits. */
(function (SP) {
  "use strict";
  const R = (SP.stageR = {});
  const G = () => SP.game, C = () => SP.clock;
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 3000);
  const ps = () => G() && G().ps;
  const A = () => SP.stageA;
  const E = () => SP.stageE;
  const F = () => SP.stageF;
  const SQ = () => SP.stageQ;
  const SP_ = () => SP.stageP;
  const SN = () => SP.stageN;

  const ROUTES = {
    "fushi://app/scanlog": { tab: "scanlog", label: "门禁" },
    "fushi://app/daylog": { tab: "daylog", label: "日程" },
    "fushi://app/ticket": { tab: "ticket", label: "工单" },
    "fushi://app/health": { tab: "health", label: "健康" },
    "fushi://app/housing": { tab: "housing", label: "租房" }
  };

  R.ensure = function () {
    const p = ps(); if (!p) return null;
    p.flags = p.flags || {};
    if (!p.tryOnStack) p.tryOnStack = [];
    if (!p.wardrobeFavs) p.wardrobeFavs = [];
    if (!p.visitAppt) p.visitAppt = null;
    if (p.propertyRating == null) p.propertyRating = 4;
    if (!p.rxDoseLog) p.rxDoseLog = [];
    if (!p.commuteTemplates) p.commuteTemplates = [];
    return p;
  };

  R.dayKey = function () {
    try { return F() ? F().dayKey() : (C().day != null ? C().day : 0); } catch (e) { return 0; }
  };

  // ========== 1) Visit 改期/爽约 + property rating ==========
  R.adjustRating = function (delta, why) {
    R.ensure();
    const before = ps().propertyRating;
    ps().propertyRating = Math.max(1, Math.min(5, before + delta));
    toast(`物业评价 ${before.toFixed(1)}→${ps().propertyRating.toFixed(1)}${why ? "（" + why + "）" : ""}`, 3200);
    if (F()) F().pushLog("prop_rating", `评价 ${ps().propertyRating}${why ? " · " + why : ""}`, { place: "xin" });
    if (E()) E().wxPush("property", `（系统）租户信用评分更新为 ${ps().propertyRating.toFixed(1)} / 5`, true);
    return ps().propertyRating;
  };

  // Fix reschedule to use proper slot labels from Q
  R.rescheduleVisit = function (slotId) {
    R.ensure();
    const sq = SQ();
    if (!ps().visitAppt) { toast("没有预约可改期"); return null; }
    if (ps().visitAppt.done) { toast("预约已完成，无法改期"); return null; }
    const old = ps().visitAppt.label;
    // map short ids
    const map = { am1: "am1", am2: "am2", pm1: "pm1", tm1: "tm1", re_am1: "am1", re_am2: "am2", re_pm1: "pm1", re_tm1: "tm1" };
    const sid = map[slotId] || slotId.replace(/^re_/, "");
    const appt = sq.bookVisitSlot(sid, ps().visitAppt.ticketId);
    if (appt) {
      appt.rescheduled = true;
      appt.prevLabel = old;
      R.adjustRating(-0.2, "改期");
      if (E()) E().wxPush("property", `改约到 ${appt.label}（原 ${old}）`, false);
      if (F()) F().pushLog("visit_resched", `改期 ${old}→${appt.label}`, { place: "xin" });
    }
    return appt;
  };

  R.markVisitNoShow = function () {
    R.ensure();
    const appt = ps().visitAppt;
    if (!appt) { toast("没有预约"); return false; }
    if (appt.done) { toast("预约已履约"); return false; }
    appt.noShow = true;
    appt.done = true;
    R.adjustRating(-0.8, "爽约");
    if (ps().needs) {
      ps().needs.mood = Math.max(0, (ps().needs.mood || 50) - 4);
      G().hud && G().hud(true);
    }
    toast("爽约：物业白跑一趟", 3200);
    if (E()) {
      E().wxPush("property", `（爽约）你预约的 ${appt.label} 我到了人呢？`, true);
      E().wxPush("property", "抱歉临时有事没赶上……", false);
    }
    if (F()) F().pushLog("visit_noshow", `爽约 ${appt.label}`, { place: "xin" });
    return true;
  };

  R.openVisitManage = function () {
    R.ensure();
    const appt = ps().visitAppt;
    const opts = [];
    if (appt && !appt.done) {
      opts.push({
        id: "info", ok: true,
        label: `当前预约：${appt.label}（评分 ${ps().propertyRating.toFixed(1)}）`,
        fn: () => null
      });
      const slotLabs = { am1: "今天 10:00–11:00", am2: "今天 14:00–15:00", pm1: "今天 16:00–17:00", tm1: "明天 10:00–11:00" };
      Object.keys(slotLabs).forEach((id) => {
        opts.push({
          id: "re_" + id, ok: id !== appt.slotId,
          label: "改期 → " + slotLabs[id],
          fn: () => { R.rescheduleVisit(id); return null; }
        });
      });
      // better labels from Q slots via bookVisitSlot ids
      opts.push({
        id: "noshow", ok: true, label: "标记爽约（扣评价）",
        fn: () => { R.markVisitNoShow(); return null; }
      });
      opts.push({
        id: "fulfill", ok: true, label: "立即履约上门…",
        fn: () => {
          ps().flags.visit_appt_force = true;
          if (SQ()) SQ().maybeFulfillAppt();
          return null;
        }
      });
    } else {
      opts.push({
        id: "book", ok: true, label: "去预约上门时段…",
        fn: () => { if (SQ()) SQ().openVisitBooking(); return null; }
      });
    }
    opts.push({
      id: "rating", ok: true,
      label: `查看物业评分 ${ps().propertyRating.toFixed(1)} / 5`,
      fn: () => { toast(`当前物业租户评分：${ps().propertyRating.toFixed(1)}`); return null; }
    });
    opts.push({ id: "cancel", ok: true, label: "关掉", fn: () => null });
    G().openMenu({ _name: "物业预约 · 改期/爽约", interact: "notice" }, opts);
  };

  R.wrapVisitManage = function () {
    // improve reschedule labels by wrapping openVisitBooking menu add-ons
    const sq = SQ(); if (!sq || sq._rManage) return;
    sq._rManage = true;
    const prevBook = sq.openVisitBooking.bind(sq);
    sq.openVisitBooking = function (ticketId) {
      prevBook(ticketId);
      const m = G().menu;
      if (!m || !m.opts) return;
      if (ps().visitAppt && !ps().visitAppt.done && !m.opts.some((o) => o.id === "manage")) {
        m.opts.splice(0, 0, {
          id: "manage", ok: true, label: "管理现有预约（改期/爽约）…",
          fn: () => { R.openVisitManage(); return null; }
        });
        G().openMenu(m.o || { _name: "预约物业上门" }, m.opts);
      }
    };

    // detect missed appointment when day/hour passed
    setInterval(() => {
      try {
        R.ensure();
        const appt = ps().visitAppt;
        if (!appt || appt.done || appt.noShow) return;
        const d = R.dayKey();
        const h = Math.floor((((C().abs() % 1440) + 1440) % 1440) / 60);
        if (d > appt.day || (d === appt.day && h >= appt.hour + 2)) {
          if (!appt.autoNoShow) {
            appt.autoNoShow = true;
            R.markVisitNoShow();
          }
        }
      } catch (e) {}
    }, 3000);

    const SA = A();
    if (SA && !SA._rVisitPhone) {
      SA._rVisitPhone = true;
      const prev = SA.openPhone.bind(SA);
      SA.openPhone = function (tab, threadId) {
        prev(tab, threadId);
        if (tab === "wechat" && threadId === "property") {
          const el = document.getElementById("phonepanel");
          const body = el && el.querySelector(".pbd");
          if (body && !body.querySelector("[data-visit-manage]")) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "r-manage-btn";
            btn.dataset.visitManage = "1";
            btn.textContent = `⭐ 预约管理 · 评分 ${ps().propertyRating.toFixed(1)}`;
            btn.onclick = () => R.openVisitManage();
            body.insertBefore(btn, body.firstChild);
          }
        }
      };
    }
  };

  // ========== 2) Health medication weekly report ==========
  R.trackDoseLog = function () {
    const sl = SP.stageL; if (!sl || sl._rDoseLog) return;
    sl._rDoseLog = true;
    const prev = sl.takeRxDose.bind(sl);
    sl.takeRxDose = function () {
      const ok = prev();
      if (ok) {
        R.ensure();
        ps().rxDoseLog.push({ day: R.dayKey(), ok: true, t: Date.now() });
        if (ps().rxDoseLog.length > 60) ps().rxDoseLog.shift();
      }
      return ok;
    };
    // miss penalties
    const sm = SP.stageM;
    if (sm && sm.applyMissedDosePenalty && !sm._rDoseLog) {
      sm._rDoseLog = true;
      const prevM = sm.applyMissedDosePenalty.bind(sm);
      sm.applyMissedDosePenalty = function (why) {
        R.ensure();
        ps().rxDoseLog.push({ day: R.dayKey() - 1, ok: false, why: why || "漏服" });
        return prevM(why);
      };
    }
  };

  R.weeklyMedReport = function () {
    R.ensure();
    const d = R.dayKey();
    const from = d - 6;
    const logs = (ps().rxDoseLog || []).filter((x) => x.day >= from && x.day <= d);
    // also dayLog kinds
    const dayLogs = (ps().dayLog || []).filter((r) =>
      r.day >= from && r.day <= d && (r.kind === "rx_dose" || r.kind === "rx_miss"));
    let taken = logs.filter((x) => x.ok).length;
    let missed = logs.filter((x) => !x.ok).length;
    dayLogs.forEach((r) => {
      if (r.kind === "rx_dose") taken++;
      if (r.kind === "rx_miss") missed++;
    });
    // dedupe roughly by preferring rxDoseLog; if empty use dayLog only
    if (!logs.length) {
      taken = dayLogs.filter((r) => r.kind === "rx_dose").length;
      missed = dayLogs.filter((r) => r.kind === "rx_miss").length;
    }
    const expected = 7;
    const rate = expected ? Math.round((taken / expected) * 100) : 0;
    return {
      from, to: d, taken, missed, expected, rate,
      text: `近7日服药：打卡 ${taken} / 预期 ${expected}（依从 ${rate}%）${missed ? " · 漏服 " + missed : ""}`
    };
  };

  R.wrapHealthReport = function () {
    const sq = SQ(); if (!sq || sq._rHealth) return;
    sq._rHealth = true;
    const prev = sq.renderHealthPage.bind(sq);
    sq.renderHealthPage = function () {
      let html = prev();
      const rep = R.weeklyMedReport();
      html += `<div class="q-health-card r-week">
        <b>服药周报</b>
        <p>${rep.text}</p>
        <div class="r-week-bar"><i style="width:${Math.min(100, rep.rate)}%"></i></div>
        <button type="button" data-health-week-wx>发给王阿姨</button>
      </div>`;
      return html;
    };
    // re-bind on health open — wrap openPhone health path after Q
    const SA = A();
    if (SA && !SA._rHealthBind) {
      SA._rHealthBind = true;
      const prevOpen = SA.openPhone.bind(SA);
      SA.openPhone = function (tab, threadId) {
        prevOpen(tab, threadId);
        if (tab !== "health") return;
        const el = document.getElementById("phonepanel");
        const wx = el && el.querySelector("[data-health-week-wx]");
        if (wx) {
          wx.onclick = () => {
            const rep = R.weeklyMedReport();
            if (E()) {
              E().wxPush("aunt", rep.text, false);
              E().wxPush("aunt", rateMsg(rep.rate), true);
            }
            toast("已发送服药周报给王阿姨", 2800);
            if (F()) F().pushLog("rx_week", rep.text, { place: "room_xin_102" });
            SA.openPhone("wechat", "aunt");
          };
        }
      };
    }
    function rateMsg(rate) {
      if (rate >= 80) return "不错，继续保持按时吃药。";
      if (rate >= 50) return "还有漏的，阿姨提醒你一声。";
      return "怎么吃这么少？该去医院看看了。";
    }
  };

  // ========== 3) Try-on stack + wardrobe favorites ==========
  R.toggleFavorite = function (lookId) {
    R.ensure();
    const id = lookId || (SP.appearance && SP.appearance.getOutfitId && SP.appearance.getOutfitId());
    if (!id) { toast("没有可收藏的外观"); return false; }
    const favs = ps().wardrobeFavs;
    const i = favs.indexOf(id);
    if (i >= 0) {
      favs.splice(i, 1);
      toast(`已取消收藏：${id}`, 2200);
    } else {
      favs.push(id);
      toast(`已收藏：${id}`, 2200);
    }
    if (F()) F().pushLog("ward_fav", `收藏夹 ${favs.join(",")}`, { place: "room_xin_102" });
    G().hud && G().hud(true);
    return true;
  };

  R.wearFavorite = function (lookId) {
    if (!SP.appearance || !SP.appearance.setOutfitId) {
      toast("外观未接入");
      return false;
    }
    if (SN() && SN().tryOnLook) return SN().tryOnLook(lookId);
    return !!SP.appearance.setOutfitId(lookId);
  };

  R.renderFavs = function () {
    R.ensure();
    const looks = (SP.appearance && SP.appearance.PLAYER_LOOKS) || [];
    const favs = ps().wardrobeFavs || [];
    if (!favs.length) return `<p class="hint">衣柜收藏为空。试穿后可收藏。</p>`;
    return `<div class="r-favs"><b>衣柜收藏</b>${favs.map((id) => {
      const lab = (looks.find((l) => l.id === id) || {}).label || id;
      return `<div class="r-fav-row"><span>${lab}</span>
        <button type="button" data-fav-wear="${id}">穿上</button>
        <button type="button" data-fav-del="${id}">取消</button></div>`;
    }).join("")}</div>`;
  };

  R.wrapFavorites = function () {
    // add fav badge on HUD when try-on active
    const sh = SP.stageH; if (!sh || sh._rFav) return;
    sh._rFav = true;
    const prev = sh.clothesChip.bind(sh);
    sh.clothesChip = function () {
      let html = prev();
      R.ensure();
      const cur = SP.appearance && SP.appearance.getOutfitId && SP.appearance.getOutfitId();
      const isFav = cur && (ps().wardrobeFavs || []).indexOf(cur) >= 0;
      html += `<span class="r-fav-badge" data-fav-toggle="1" title="收藏当前">${isFav ? "★" : "☆"}</span>`;
      return html;
    };
    const g = G();
    if (g && !g._rFavHud) {
      g._rFavHud = true;
      const prevHud = g.hud.bind(g);
      g.hud = function (force) {
        prevHud(force);
        document.querySelectorAll("[data-fav-toggle]").forEach((el) => {
          el.style.cursor = "pointer";
          el.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); R.toggleFavorite(); };
        });
      };
    }

    // inject favs into health page and wardrobe suggest
    const sq = SQ();
    if (sq && !sq._rFavHealth) {
      sq._rFavHealth = true;
      const prevH = sq.renderHealthPage.bind(sq);
      sq.renderHealthPage = function () {
        return prevH() + R.renderFavs();
      };
    }
    const SA = A();
    if (SA && !SA._rFavBind) {
      SA._rFavBind = true;
      const prevOpen = SA.openPhone.bind(SA);
      SA.openPhone = function (tab, threadId) {
        prevOpen(tab, threadId);
        if (tab !== "health") return;
        const el = document.getElementById("phonepanel");
        if (!el) return;
        el.querySelectorAll("[data-fav-wear]").forEach((b) => {
          b.onclick = () => { R.wearFavorite(b.dataset.favWear); SA.openPhone("health"); };
        });
        el.querySelectorAll("[data-fav-del]").forEach((b) => {
          b.onclick = () => { R.toggleFavorite(b.dataset.favDel); SA.openPhone("health"); };
        });
      };
    }

    // suggest menu: favorite current tips
    const sj = SP.stageJ;
    if (sj && !sj._rFavSuggest) {
      sj._rFavSuggest = true;
      const prevS = sj.suggestChangeOutfit.bind(sj);
      sj.suggestChangeOutfit = function () {
        prevS();
        const m = G().menu;
        if (!m || !m.opts) return;
        if (!m.opts.some((o) => o.id === "fav_cur")) {
          m.opts.splice(Math.max(0, m.opts.length - 1), 0, {
            id: "fav_cur", ok: !!(SP.appearance && SP.appearance.getOutfitId),
            label: "收藏当前外观 ★",
            fn: () => { R.toggleFavorite(); return null; }
          });
          G().openMenu(m.o || { _name: "换装建议" }, m.opts);
        }
      };
    }
  };

  // ========== 4) Route summary → weekly commute template ==========
  R.saveCommuteTemplate = function (name) {
    R.ensure();
    const d = R.dayKey();
    const rows = (ps().itinReplay || []).filter((r) => r.day === d);
    if (rows.length < 2) { toast("今日路线至少 2 站才能存模板"); return null; }
    const tpl = {
      id: "CT-" + d + "-" + (ps().commuteTemplates.length + 1),
      name: name || "周常通勤",
      day: d,
      stops: rows.map((r) => ({ id: r.id, label: r.label, t: r.t }))
    };
    ps().commuteTemplates.unshift(tpl);
    if (ps().commuteTemplates.length > 8) ps().commuteTemplates.length = 8;
    toast(`已保存通勤模板：${tpl.name}（${tpl.stops.length} 站）`, 3000);
    if (F()) F().pushLog("commute_tpl", `保存 ${tpl.name}`, { place: "street" });
    return tpl;
  };

  R.applyCommuteTemplate = function (tplId) {
    R.ensure();
    const tpl = (ps().commuteTemplates || []).find((t) => t.id === tplId) || ps().commuteTemplates[0];
    if (!tpl) { toast("没有通勤模板"); return false; }
    // write as today's planned replay + soft jump first stop
    tpl.stops.forEach((s) => {
      if (SP_() && SP_().logItinStep) SP_().logItinStep(s.id, s.label + "（模板）");
    });
    toast(`已套用「${tpl.name}」→ 今日路线`, 3000);
    if (F()) F().pushLog("commute_apply", `套用 ${tpl.name}`, { place: tpl.stops[0] && tpl.stops[0].id });
    if (SP.stageG && SP.stageG.jumpTo && tpl.stops[0]) SP.stageG.jumpTo(tpl.stops[0].id);
    return true;
  };

  R.wrapCommuteTemplate = function () {
    const sq = SQ(); if (!sq || sq._rCommute) return;
    sq._rCommute = true;
    const prev = sq.shareRouteSummary.bind(sq);
    sq.shareRouteSummary = function (friendId) {
      const ok = prev(friendId);
      // also offer save — auto-save a template when sharing
      if (ok) R.saveCommuteTemplate("周常通勤");
      return ok;
    };

    const sp = SP_();
    if (sp && !sp._rCommuteRender) {
      sp._rCommuteRender = true;
      const prevR = sp.renderItinReplay.bind(sp);
      sp.renderItinReplay = function () {
        let html = prevR();
        R.ensure();
        html += `<div class="r-commute">
          <button type="button" data-save-commute>保存为周常通勤模板</button>
          ${(ps().commuteTemplates || []).slice(0, 3).map((t) =>
            `<button type="button" data-apply-commute="${t.id}">套用：${t.name}（${t.stops.length}站）</button>`
          ).join("")}
        </div>`;
        return html;
      };
      const sg = SP.stageG;
      if (sg && !sg._rCommuteBind) {
        sg._rCommuteBind = true;
        const prevB = sg.bindCalendar.bind(sg);
        sg.bindCalendar = function (body) {
          prevB(body);
          if (!body) return;
          const save = body.querySelector("[data-save-commute]");
          if (save) save.onclick = () => R.saveCommuteTemplate("周常通勤");
          body.querySelectorAll("[data-apply-commute]").forEach((b) => {
            b.onclick = () => R.applyCommuteTemplate(b.dataset.applyCommute);
          });
        };
      }
    }
  };

  // ========== 5) Unified deeplink router + notification bar ==========
  R.routeDeepLink = function (url) {
    R.ensure();
    const u = String(url || "").trim();
    const meta = ROUTES[u] || null;
    ps().flags.last_deeplink = u;
    toast(`路由：${u}`, 2000);
    if (!meta) {
      // fallback to Q handler
      if (SQ() && SQ().handleDeepLink) return SQ().handleDeepLink(u);
      return null;
    }
    if (F()) F().pushLog("deeplink", `路由→${meta.label}`, { place: "xin" });
    if (meta.tab === "ticket") {
      if (A()) A().openPhone("wechat", "property");
      setTimeout(() => {
        if (SQ()) SQ().openVisitBooking();
        else if (SN() && SN().openTicketFollowupMenu) SN().openTicketFollowupMenu();
      }, 200);
      return "ticket";
    }
    if (meta.tab === "health") {
      if (A()) A().openPhone("health");
      return "health";
    }
    if (A()) A().openPhone(meta.tab);
    return meta.tab;
  };

  R.wrapRouter = function () {
    const sq = SQ(); if (!sq || sq._rRouter) return;
    sq._rRouter = true;
    const prev = sq.handleDeepLink.bind(sq);
    sq.handleDeepLink = function (url) {
      const u = String(url || "");
      if (ROUTES[u] || /^fushi:\/\/app\//i.test(u)) return R.routeDeepLink(u);
      return prev(url);
    };
  };

  R.ensureNotifBar = function () {
    let bar = document.getElementById("stageR-notif");
    if (bar) return bar;
    bar = document.createElement("div");
    bar.id = "stageR-notif";
    bar.className = "r-notif";
    bar.innerHTML = `
      <span class="r-notif-title">捷径</span>
      <button type="button" data-r-short="fushi://app/daylog">日程</button>
      <button type="button" data-r-short="fushi://app/scanlog">门禁</button>
      <button type="button" data-r-short="fushi://app/ticket">工单</button>
      <button type="button" data-r-short="fushi://app/health">健康</button>
      <button type="button" data-r-short-hide>×</button>`;
    const wrap = document.getElementById("wrap") || document.body;
    wrap.appendChild(bar);
    bar.querySelectorAll("[data-r-short]").forEach((b) => {
      b.onclick = () => R.routeDeepLink(b.dataset.rShort);
    });
    const hide = bar.querySelector("[data-r-short-hide]");
    if (hide) hide.onclick = () => bar.classList.add("hidden");
    return bar;
  };

  R.pushNotif = function (text, link) {
    R.ensure();
    const bar = R.ensureNotifBar();
    bar.classList.remove("hidden");
    let msg = bar.querySelector(".r-notif-msg");
    if (!msg) {
      msg = document.createElement("span");
      msg.className = "r-notif-msg";
      bar.insertBefore(msg, bar.children[1] || null);
    }
    msg.textContent = text || "";
    if (link) {
      msg.style.cursor = "pointer";
      msg.onclick = () => R.routeDeepLink(link);
    }
    if (F()) F().pushLog("notif", text || "通知", { place: "street" });
  };

  R.injectCss = function () {
    if (document.getElementById("stageR-css")) return;
    const st = document.createElement("style");
    st.id = "stageR-css";
    st.textContent = `
      .r-manage-btn{display:block;width:100%;margin:0 0 10px;padding:10px;border:0;border-radius:10px;
        background:#ffd60a;color:#111;font-size:13px;cursor:pointer}
      .r-week-bar{height:8px;background:#2c2c2e;border-radius:4px;overflow:hidden;margin:8px 0}
      .r-week-bar i{display:block;height:100%;background:#30d158}
      .r-fav-badge{display:inline-block;margin-left:6px;padding:2px 8px;border-radius:8px;
        background:#ffd60a;color:#111;font-size:12px;cursor:pointer}
      .r-favs{margin:8px 0;padding:8px;background:#1c1c1e;border-radius:10px}
      .r-fav-row{display:flex;align-items:center;gap:6px;padding:4px 0;font-size:12px}
      .r-fav-row button{border:0;border-radius:6px;padding:4px 8px;background:#0a84ff;color:#fff;cursor:pointer;font-size:11px}
      .r-commute{display:flex;flex-direction:column;gap:6px;margin-top:8px}
      .r-commute button{border:0;border-radius:10px;padding:10px;background:#64d2ff;color:#111;cursor:pointer;font-size:13px}
      .r-notif{position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:40;
        display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:12px;
        background:rgba(28,28,30,.92);color:#f5f5f7;font-size:12px;max-width:92%;flex-wrap:wrap}
      .r-notif button{border:0;border-radius:8px;padding:4px 8px;background:#0a84ff;color:#fff;cursor:pointer;font-size:11px}
      .r-notif-title{opacity:.7;margin-right:4px}
      .r-notif-msg{margin-right:6px}
      .r-notif.hidden{display:none}
    `;
    document.head.appendChild(st);
  };

  R.install = function () {
    const g = G(); if (!g || g._stageR) return; g._stageR = true;
    R.ensure();
    R.injectCss();
    R.wrapVisitManage();
    R.trackDoseLog();
    R.wrapHealthReport();
    R.wrapFavorites();
    R.wrapCommuteTemplate();
    R.wrapRouter();
    R.ensureNotifBar();
    R.pushNotif("捷径已就绪", "fushi://app/daylog");
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageQ) R.install();
    else setTimeout(boot, 170);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.SP || (window.SP = {}));
