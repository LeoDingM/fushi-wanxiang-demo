/* scene-proto-45 · Stage S: rating→续期折扣/押金, med heatmap, seasonal fav pin,
   commute morning alarm, collapsible notif + custom shortcut order.
   No appearance/NPC_SPEC/civic/school/store/npc_schedule/charB edits. */
(function (SP) {
  "use strict";
  const S = (SP.stageS = {});
  const G = () => SP.game, C = () => SP.clock;
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 3000);
  const ps = () => G() && G().ps;
  const A = () => SP.stageA;
  const E = () => SP.stageE;
  const F = () => SP.stageF;
  const SH = () => SP.stageH;
  const SR = () => SP.stageR;
  const SQ = () => SP.stageQ;

  const DEFAULT_SHORTCUTS = [
    { id: "daylog", url: "fushi://app/daylog", label: "日程" },
    { id: "scanlog", url: "fushi://app/scanlog", label: "门禁" },
    { id: "ticket", url: "fushi://app/ticket", label: "工单" },
    { id: "health", url: "fushi://app/health", label: "健康" }
  ];

  // season → preferred look ids for pin
  const SEASON_PIN = {
    spring: ["casual"],
    summer: ["casual", "uniform"],
    autumn: ["casual", "winter"],
    winter: ["winter"]
  };

  S.ensure = function () {
    const p = ps(); if (!p) return null;
    p.flags = p.flags || {};
    if (p.propertyRating == null) p.propertyRating = 4;
    if (!p.wardrobeFavs) p.wardrobeFavs = [];
    if (!p.commuteTemplates) p.commuteTemplates = [];
    if (!p.rxDoseLog) p.rxDoseLog = [];
    if (!p.notifShortcuts) p.notifShortcuts = DEFAULT_SHORTCUTS.map((x) => x.id);
    if (p.notifCollapsed == null) p.notifCollapsed = false;
    if (!p.commuteAlarms) p.commuteAlarms = [];
    return p;
  };

  S.dayKey = function () {
    try { return F() ? F().dayKey() : (C().day != null ? C().day : 0); } catch (e) { return 0; }
  };

  // ========== 1) propertyRating → 续期折扣 / 押金 ==========
  S.renewFeeDiscount = function () {
    S.ensure();
    const rating = ps().propertyRating || 4;
    // >=4.5: 20% off; >=4.0: 10%; >=3.5: 5%; else 0. Low rating may surcharge.
    if (rating >= 4.5) return { pct: 0.2, label: "信用优待 −20%" };
    if (rating >= 4.0) return { pct: 0.1, label: "信用良好 −10%" };
    if (rating >= 3.5) return { pct: 0.05, label: "信用一般 −5%" };
    if (rating < 2.5) return { pct: -0.1, label: "信用偏低 +10% 加价" };
    return { pct: 0, label: "无折扣" };
  };

  S.depositBonusFromRating = function () {
    S.ensure();
    const rating = ps().propertyRating || 4;
    if (rating >= 4.5) return 50;
    if (rating >= 4.0) return 30;
    if (rating >= 3.5) return 10;
    return 0;
  };

  S.syncDepositFromRating = function () {
    S.ensure();
    const bonus = S.depositBonusFromRating();
    const fl = ps().flags;
    if (bonus > 0) {
      const cur = fl.deposit_discount || 0;
      if (!fl.deposit_discount_used && bonus > cur) {
        fl.deposit_discount = bonus;
        fl.rating_deposit_bonus = bonus;
        if (F()) F().pushLog("rating_deposit", `评分押金优惠 ¥${bonus}`, { place: "housing" });
      }
    }
    return bonus;
  };

  S.wrapRatingPerks = function () {
    const sh = SH(); if (!sh || sh._sRating) return;
    sh._sRating = true;

    const prevFee = sh.renewByFee.bind(sh);
    sh.renewByFee = function () {
      S.ensure();
      const disc = S.renewFeeDiscount();
      const base = (() => {
        try {
          const p = G().rules.data.utilities.fixed.property;
          return (p && p.amount) || 45;
        } catch (e) { return 45; }
      })();
      const fee = Math.max(1, Math.round(base * (1 - disc.pct)));
      if (ps().money < fee) {
        toast(`钱不够交物业费（¥${fee}${disc.pct ? " · " + disc.label : ""}）`);
        return false;
      }
      ps().money -= fee;
      ps().stats = ps().stats || {};
      ps().stats.spent = (ps().stats.spent || 0) + fee;
      if (G().payCard) {
        G().payCard({
          amount: fee, method: "微信", to: "馨园物业",
          what: `临时门禁续期·物业费${disc.pct ? "（" + disc.label + "）" : ""}`
        });
      }
      sh.extendAccess(24, `缴纳物业费 ¥${fee}${disc.pct ? " · " + disc.label : ""}`);
      if (F()) F().pushLog("access_fee_disc", `续期费 ¥${fee}（${disc.label}）`, { place: "xin" });
      return true;
    };

    const prevMenu = sh.openRenewMenu.bind(sh);
    sh.openRenewMenu = function () {
      prevMenu();
      const m = G().menu;
      if (!m || !m.opts) return;
      const disc = S.renewFeeDiscount();
      const bonus = S.syncDepositFromRating();
      if (!m.opts.some((o) => o.id === "rating_perk")) {
        m.opts.unshift({
          id: "rating_perk", ok: true,
          label: `信用评分 ${ps().propertyRating.toFixed(1)} · ${disc.label}` +
            (bonus ? ` · 押金优惠¥${bonus}` : ""),
          fn: () => {
            toast(`评分 ${ps().propertyRating.toFixed(1)}：续期 ${disc.label}` +
              (bonus ? `；押金可少 ¥${bonus}` : ""));
            return null;
          }
        });
        // patch fee label
        m.opts.forEach((o) => {
          if (o.id === "fee") {
            const base = 45;
            const fee = Math.max(1, Math.round(base * (1 - disc.pct)));
            o.label = `缴纳物业费 ¥${fee} 续期（+24 时 · ${disc.label}）`;
          }
        });
        G().openMenu(m.o || { _name: "馨园门禁续期" }, m.opts);
      }
    };

    // when rating changes, sync deposit
    const sr = SR();
    if (sr && sr.adjustRating && !sr._sSync) {
      sr._sSync = true;
      const prev = sr.adjustRating.bind(sr);
      sr.adjustRating = function (delta, why) {
        const r = prev(delta, why);
        S.syncDepositFromRating();
        return r;
      };
    }
  };

  // ========== 2) Med weekly → per-day heatmap ==========
  S.medHeatmapDays = function () {
    S.ensure();
    const d = S.dayKey();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const day = d - i;
      const logs = (ps().rxDoseLog || []).filter((x) => x.day === day);
      const dayLogs = (ps().dayLog || []).filter((r) =>
        r.day === day && (r.kind === "rx_dose" || r.kind === "rx_miss"));
      let status = "empty"; // empty | taken | missed | mixed
      const hasOk = logs.some((x) => x.ok) || dayLogs.some((r) => r.kind === "rx_dose");
      const hasMiss = logs.some((x) => !x.ok) || dayLogs.some((r) => r.kind === "rx_miss");
      if (hasOk && hasMiss) status = "mixed";
      else if (hasOk) status = "taken";
      else if (hasMiss) status = "missed";
      days.push({ day, status });
    }
    return days;
  };

  S.renderHeatmap = function () {
    const days = S.medHeatmapDays();
    return `<div class="s-heat">
      <div class="s-heat-label">近7日热力</div>
      <div class="s-heat-row">${days.map((d) =>
        `<span class="s-heat-cell ${d.status}" title="D${d.day} ${d.status}">D${d.day}</span>`
      ).join("")}</div>
      <div class="s-heat-legend"><i class="taken"></i>已服 <i class="missed"></i>漏服 <i class="mixed"></i>混合 <i class="empty"></i>无记录</div>
    </div>`;
  };

  S.wrapHeatmap = function () {
    const sr = SR(); if (!sr || sr._sHeat) return;
    sr._sHeat = true;
    const prev = sr.weeklyMedReport.bind(sr);
    sr.weeklyMedReport = function () {
      const rep = prev();
      rep.heatmap = S.medHeatmapDays();
      return rep;
    };
    // inject into health via stageQ renderHealthPage chain — wrap R's wrap already added r-week
    const sq = SQ();
    if (sq && !sq._sHeat) {
      sq._sHeat = true;
      const prevH = sq.renderHealthPage.bind(sq);
      sq.renderHealthPage = function () {
        let html = prevH();
        // insert heatmap after 服药周报 card if present
        if (html.indexOf("r-week") >= 0) {
          html = html.replace(
            /(<div class="q-health-card r-week">[\s\S]*?<\/div>)/,
            `$1${S.renderHeatmap()}`
          );
        } else {
          html += S.renderHeatmap();
        }
        return html;
      };
    }
  };

  // ========== 3) Wardrobe favorites seasonal pin ==========
  S.seasonNow = function () {
    try { return C().season || "spring"; } catch (e) { return "spring"; }
  };

  S.sortedFavorites = function () {
    S.ensure();
    const season = S.seasonNow();
    const prefer = SEASON_PIN[season] || [];
    const favs = (ps().wardrobeFavs || []).slice();
    favs.sort((a, b) => {
      const pa = prefer.indexOf(a);
      const pb = prefer.indexOf(b);
      const sa = pa >= 0 ? pa : 100;
      const sb = pb >= 0 ? pb : 100;
      if (sa !== sb) return sa - sb;
      return String(a).localeCompare(String(b));
    });
    return { season, prefer, favs, pinned: favs.filter((id) => prefer.indexOf(id) >= 0) };
  };

  S.wrapSeasonalFavs = function () {
    const sr = SR(); if (!sr || sr._sSeason) return;
    sr._sSeason = true;
    const prev = sr.renderFavs.bind(sr);
    sr.renderFavs = function () {
      S.ensure();
      const sorted = S.sortedFavorites();
      const looks = (SP.appearance && SP.appearance.PLAYER_LOOKS) || [];
      if (!sorted.favs.length) return prev();
      const seasonName = (C().seasonName && C().seasonName(sorted.season)) || sorted.season;
      return `<div class="r-favs s-favs">
        <b>衣柜收藏 · ${seasonName}置顶</b>
        ${sorted.favs.map((id) => {
          const lab = (looks.find((l) => l.id === id) || {}).label || id;
          const pin = sorted.prefer.indexOf(id) >= 0;
          return `<div class="r-fav-row ${pin ? "s-pinned" : ""}">
            <span>${pin ? "📌 " : ""}${lab}</span>
            <button type="button" data-fav-wear="${id}">穿上</button>
            <button type="button" data-fav-del="${id}">取消</button></div>`;
        }).join("")}
      </div>`;
    };
  };

  // ========== 4) Commute template → morning alarm ==========
  S.setCommuteAlarm = function (tplId, hour) {
    S.ensure();
    const tpl = (ps().commuteTemplates || []).find((t) => t.id === tplId) || ps().commuteTemplates[0];
    if (!tpl) { toast("没有通勤模板"); return null; }
    const h = hour != null ? hour : 7;
    const alarm = {
      id: "CA-" + tpl.id,
      tplId: tpl.id, name: tpl.name,
      hour: h, enabled: true,
      lastFiredDay: null
    };
    ps().commuteAlarms = (ps().commuteAlarms || []).filter((a) => a.tplId !== tpl.id);
    ps().commuteAlarms.push(alarm);
    toast(`已设通勤闹钟：每天 ${h}:00 · ${tpl.name}`, 3200);
    if (F()) F().pushLog("commute_alarm", `闹钟 ${h}:00 ${tpl.name}`, { place: "street" });
    if (E()) E().wxPush("roommate", `我设了 ${h}:00 通勤闹钟（${tpl.name}）`, false);
    return alarm;
  };

  S.maybeCommuteAlarm = function () {
    S.ensure();
    const alarms = ps().commuteAlarms || [];
    if (!alarms.length) return;
    const d = S.dayKey();
    let h = 7;
    try { h = Math.floor((((C().abs() % 1440) + 1440) % 1440) / 60); } catch (e) {}
    alarms.forEach((a) => {
      if (!a.enabled) return;
      if (a.lastFiredDay === d) return;
      if (h === a.hour || ps().flags.commute_alarm_force) {
        a.lastFiredDay = d;
        ps().flags.commute_alarm_force = false;
        toast(`⏰ 通勤闹钟：${a.name}（${a.hour}:00）`, 4000);
        if (SR() && SR().pushNotif) {
          SR().pushNotif(`通勤提醒 · ${a.name}`, "fushi://app/daylog");
        }
        if (E()) E().wxPush("roommate", `闹钟：该出发了（${a.name}）`, true);
        if (F()) F().pushLog("commute_ring", `闹钟响起 ${a.name}`, { place: "street" });
        // optionally apply template
        if (ps().flags.commute_alarm_auto_apply && SR() && SR().applyCommuteTemplate) {
          SR().applyCommuteTemplate(a.tplId);
        }
      }
    });
  };

  S.wrapCommuteAlarm = function () {
    setInterval(() => { try { S.maybeCommuteAlarm(); } catch (e) {} }, 2200);

    const sr = SR(); if (!sr || sr._sAlarm) return;
    sr._sAlarm = true;
    // add buttons on itinerary render via stageP chain
    const sp = SP.stageP;
    if (sp && !sp._sAlarmRender) {
      sp._sAlarmRender = true;
      const prev = sp.renderItinReplay.bind(sp);
      sp.renderItinReplay = function () {
        let html = prev();
        const tpls = ps().commuteTemplates || [];
        if (tpls.length) {
          html += `<div class="s-alarm">
            ${tpls.slice(0, 2).map((t) =>
              `<button type="button" data-commute-alarm="${t.id}">设闹钟 7:00 · ${t.name}</button>`
            ).join("")}
          </div>`;
        }
        return html;
      };
      const sg = SP.stageG;
      if (sg && !sg._sAlarmBind) {
        sg._sAlarmBind = true;
        const prevB = sg.bindCalendar.bind(sg);
        sg.bindCalendar = function (body) {
          prevB(body);
          if (!body) return;
          body.querySelectorAll("[data-commute-alarm]").forEach((b) => {
            b.onclick = () => S.setCommuteAlarm(b.dataset.commuteAlarm, 7);
          });
        };
      }
    }
  };

  // ========== 5) Notif bar collapsible + custom order ==========
  S.shortcutList = function () {
    S.ensure();
    const order = ps().notifShortcuts || DEFAULT_SHORTCUTS.map((x) => x.id);
    return order.map((id) => DEFAULT_SHORTCUTS.find((x) => x.id === id)).filter(Boolean);
  };

  S.setShortcutOrder = function (ids) {
    S.ensure();
    const valid = DEFAULT_SHORTCUTS.map((x) => x.id);
    const next = (ids || []).filter((id) => valid.indexOf(id) >= 0);
    valid.forEach((id) => { if (next.indexOf(id) < 0) next.push(id); });
    ps().notifShortcuts = next;
    S.renderNotifBar();
    if (F()) F().pushLog("notif_order", `捷径顺序 ${next.join(",")}`, { place: "street" });
    return next;
  };

  S.moveShortcut = function (id, dir) {
    S.ensure();
    const arr = (ps().notifShortcuts || DEFAULT_SHORTCUTS.map((x) => x.id)).slice();
    const i = arr.indexOf(id);
    if (i < 0) return arr;
    const j = dir < 0 ? i - 1 : i + 1;
    if (j < 0 || j >= arr.length) return arr;
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    return S.setShortcutOrder(arr);
  };

  S.toggleNotifCollapse = function () {
    S.ensure();
    ps().notifCollapsed = !ps().notifCollapsed;
    S.renderNotifBar();
    return ps().notifCollapsed;
  };

  S.renderNotifBar = function () {
    S.ensure();
    const sr = SR();
    let bar = document.getElementById("stageR-notif");
    if (!bar && sr && sr.ensureNotifBar) bar = sr.ensureNotifBar();
    if (!bar) return null;
    const collapsed = !!ps().notifCollapsed;
    bar.classList.toggle("s-collapsed", collapsed);
    bar.classList.remove("hidden");
    const shorts = S.shortcutList();
    const msg = bar.querySelector(".r-notif-msg");
    const msgHtml = msg ? msg.outerHTML : "";
    bar.innerHTML = `
      <button type="button" class="s-collapse" data-s-collapse title="折叠/展开">${collapsed ? "▸ 捷径" : "▾ 捷径"}</button>
      <div class="s-notif-body ${collapsed ? "hidden" : ""}">
        ${msgHtml}
        ${shorts.map((s) =>
          `<button type="button" data-r-short="${s.url}">${s.label}</button>
           <button type="button" class="s-ord" data-s-up="${s.id}" title="前移">‹</button>
           <button type="button" class="s-ord" data-s-down="${s.id}" title="后移">›</button>`
        ).join("")}
      </div>`;
    // re-bind
    const col = bar.querySelector("[data-s-collapse]");
    if (col) col.onclick = () => S.toggleNotifCollapse();
    bar.querySelectorAll("[data-r-short]").forEach((b) => {
      b.onclick = () => {
        if (sr && sr.routeDeepLink) sr.routeDeepLink(b.dataset.rShort);
        else if (SQ() && SQ().handleDeepLink) SQ().handleDeepLink(b.dataset.rShort);
      };
    });
    bar.querySelectorAll("[data-s-up]").forEach((b) => {
      b.onclick = (ev) => { ev.stopPropagation(); S.moveShortcut(b.dataset.sUp, -1); };
    });
    bar.querySelectorAll("[data-s-down]").forEach((b) => {
      b.onclick = (ev) => { ev.stopPropagation(); S.moveShortcut(b.dataset.sDown, 1); };
    });
    const m = bar.querySelector(".r-notif-msg");
    if (m && m.dataset && !m.onclick && ps().flags.last_notif_link) {
      m.style.cursor = "pointer";
      m.onclick = () => sr && sr.routeDeepLink(ps().flags.last_notif_link);
    }
    return bar;
  };

  S.wrapNotifBar = function () {
    const sr = SR(); if (!sr || sr._sNotif) return;
    sr._sNotif = true;
    const prevEnsure = sr.ensureNotifBar.bind(sr);
    sr.ensureNotifBar = function () {
      const bar = prevEnsure();
      S.renderNotifBar();
      return document.getElementById("stageR-notif") || bar;
    };
    const prevPush = sr.pushNotif.bind(sr);
    sr.pushNotif = function (text, link) {
      if (link) ps().flags.last_notif_link = link;
      const r = prevPush(text, link);
      S.renderNotifBar();
      // restore message after re-render
      const bar = document.getElementById("stageR-notif");
      if (bar && text) {
        let msg = bar.querySelector(".r-notif-msg");
        if (!msg) {
          const body = bar.querySelector(".s-notif-body");
          msg = document.createElement("span");
          msg.className = "r-notif-msg";
          if (body) body.insertBefore(msg, body.firstChild);
        }
        if (msg) {
          msg.textContent = text;
          if (link) {
            msg.style.cursor = "pointer";
            msg.onclick = () => sr.routeDeepLink(link);
          }
        }
      }
      return r;
    };
  };

  S.injectCss = function () {
    if (document.getElementById("stageS-css")) return;
    const st = document.createElement("style");
    st.id = "stageS-css";
    st.textContent = `
      .s-heat{margin:8px 0;padding:8px;background:#1c1c1e;border-radius:10px}
      .s-heat-label{font-size:12px;color:#8e8e93;margin-bottom:6px}
      .s-heat-row{display:flex;gap:4px;flex-wrap:wrap}
      .s-heat-cell{flex:1;min-width:36px;text-align:center;padding:8px 4px;border-radius:8px;
        font-size:10px;background:#2c2c2e;color:#8e8e93}
      .s-heat-cell.taken{background:#0b3d1f;color:#30d158}
      .s-heat-cell.missed{background:#3d1010;color:#ff453a}
      .s-heat-cell.mixed{background:#3d3000;color:#ffd60a}
      .s-heat-legend{margin-top:6px;font-size:10px;color:#8e8e93}
      .s-heat-legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin:0 4px 0 8px;vertical-align:middle}
      .s-heat-legend i.taken{background:#30d158}
      .s-heat-legend i.missed{background:#ff453a}
      .s-heat-legend i.mixed{background:#ffd60a}
      .s-heat-legend i.empty{background:#2c2c2e}
      .s-favs .s-pinned{background:#243044;border-radius:8px;padding:4px 6px}
      .s-alarm{display:flex;flex-direction:column;gap:6px;margin-top:8px}
      .s-alarm button{border:0;border-radius:10px;padding:10px;background:#ff9f0a;color:#111;cursor:pointer;font-size:13px}
      .s-collapse{border:0;border-radius:8px;padding:4px 8px;background:#2c2c2e;color:#f5f5f7;cursor:pointer;font-size:11px}
      .s-notif-body{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
      .s-notif-body.hidden{display:none}
      .r-notif.s-collapsed{padding:4px 8px}
      .s-ord{padding:2px 4px!important;background:#3a3a3c!important;min-width:auto}
    `;
    document.head.appendChild(st);
  };

  S.install = function () {
    const g = G(); if (!g || g._stageS) return; g._stageS = true;
    S.ensure();
    S.injectCss();
    S.wrapRatingPerks();
    S.syncDepositFromRating();
    S.wrapHeatmap();
    S.wrapSeasonalFavs();
    S.wrapCommuteAlarm();
    S.wrapNotifBar();
    S.renderNotifBar();
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageR) S.install();
    else setTimeout(boot, 170);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.SP || (window.SP = {}));
