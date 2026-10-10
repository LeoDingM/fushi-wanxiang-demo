/* scene-proto-45 · Stage K: scan day filter + missed-scan quiz, outfit mood, rain/OT chip tint,
   rx expiry↔pharmacy, 门禁↔日程待办合并. Avoids appearance.js / civic shell rewrites. */
(function (SP) {
  "use strict";
  const K = (SP.stageK = {});
  const G = () => SP.game, R = () => G() && G().rules, C = () => SP.clock;
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 3000);
  const log = (t) => SP.world && SP.world.logEvent(t);
  const ps = () => G() && G().ps;
  const A = () => SP.stageA;
  const E = () => SP.stageE;
  const F = () => SP.stageF;
  const SJ = () => SP.stageJ;
  const SH = () => SP.stageH;
  const D = () => SP.stageD;

  const RX_VALID_DAYS = 3;
  const OUTFIT_MOOD = 4;

  K.ensure = function () {
    const p = ps(); if (!p) return null;
    p.flags = p.flags || {};
    if (!p.scanLog) p.scanLog = [];
    if (p.scanFilterDay == null) p.scanFilterDay = "all";
    return p;
  };

  K.dayKey = function () {
    try { return F() ? F().dayKey() : (C().day != null ? C().day : 0); } catch (e) { return 0; }
  };

  // ---------- 1) Scan log day filter + overnight missed-scan quiz ----------
  K.scanDays = function () {
    K.ensure();
    const set = {};
    (ps().scanLog || []).forEach((r) => { set[r.day] = true; });
    return Object.keys(set).map(Number).sort((a, b) => b - a);
  };

  K.filteredScans = function () {
    K.ensure();
    const f = ps().scanFilterDay;
    const rows = ps().scanLog || [];
    if (f === "all" || f == null) return rows;
    return rows.filter((r) => r.day === +f);
  };

  K.renderScanLogFiltered = function () {
    K.ensure();
    const days = K.scanDays();
    const cur = ps().scanFilterDay;
    const filters = [`<button type="button" class="kfilt ${cur === "all" ? "on" : ""}" data-kday="all">全部</button>`]
      .concat(days.slice(0, 6).map((d) =>
        `<button type="button" class="kfilt ${+cur === d ? "on" : ""}" data-kday="${d}">D${d}</button>`
      )).join("");
    const rows = K.filteredScans();
    const body = !rows.length
      ? `<p class="hint">该筛选下暂无记录。</p>`
      : rows.slice(0, 16).map((r) => `
        <div class="jscan-row ${r.ok ? "ok" : "vis"}">
          <b>${r.ok ? "通行" : "访客"}</b>
          <span>D${r.day} ${r.t || ""}</span>
          <p>${r.detail || "—"}</p>
        </div>`).join("");
    const miss = ps().flags.missed_scan_pending
      ? `<p class="hint" style="color:#ff9f0a">⚠ 昨夜至今晨未见进门扫码，门岗可能盘问。</p>` : "";
    return `<div class="jscan"><div class="kfilt-row">${filters}</div>${miss}${body}</div>`;
  };

  K.bindScanFilters = function (body) {
    if (!body) return;
    body.querySelectorAll("[data-kday]").forEach((b) => {
      b.onclick = () => {
        ps().scanFilterDay = b.dataset.kday === "all" ? "all" : +b.dataset.kday;
        if (A()) A().openPhone("scanlog");
      };
    });
  };

  K.wrapScanLogUI = function () {
    const sj = SJ(); if (!sj || sj._kFilter) return;
    sj._kFilter = true;
    sj.renderScanLog = function () { return K.renderScanLogFiltered(); };
    const SA = A();
    if (SA && !SA._kScanPhone) {
      SA._kScanPhone = true;
      const prev = SA.openPhone.bind(SA);
      SA.openPhone = function (tab, threadId) {
        prev(tab, threadId);
        if (tab === "scanlog") {
          const el = document.getElementById("phonepanel");
          const body = el && el.querySelector(".pbd");
          if (body) {
            // merge todos into scanlog (goal 5)
            const todos = (SH() && SH().renderTodos) ? SH().renderTodos() : "";
            body.innerHTML = todos + K.renderScanLogFiltered() +
              `<p class="hint">可按日筛选。日程页也可跳转门禁登记。</p>`;
            K.bindScanFilters(body);
            if (SH() && SH().bindCalendar) {
              // bind todo jumps
              body.querySelectorAll("[data-todo-jump]").forEach((b) => {
                b.onclick = () => {
                  const place = b.dataset.todoJump;
                  if (place === "housing" && A()) { A().openPhone("housing"); return; }
                  if (place === "scanlog") { A().openPhone("scanlog"); return; }
                  if (SP.stageG && SP.stageG.jumpTo) SP.stageG.jumpTo(place);
                };
              });
            }
          }
        }
      };
    }
  };

  K.trackMissedScan = function () {
    // on day change: if previous calendar day had no successful evening/morning scan window
    K._lastDay = K.dayKey();
    setInterval(() => {
      try {
        K.ensure();
        const d = K.dayKey();
        if (d !== K._lastDay) {
          const prevDay = K._lastDay;
          K._lastDay = d;
          // any pass scan on prevDay?
          const had = (ps().scanLog || []).some((r) => r.day === prevDay && r.ok);
          if (!had && prevDay >= 0) {
            ps().flags.missed_scan_pending = true;
            ps().flags.missed_scan_day = d;
            if (F()) F().pushLog("missed_scan", "昨夜未见馨园进门扫码", { place: "gate" });
          }
        }
      } catch (e) {}
    }, 1600);
  };

  K.maybeGateScanQuiz = function () {
    K.ensure();
    const fl = ps().flags;
    if (!fl.missed_scan_pending || fl.missed_scan_quiz_done) return;
    if (G().menu || (E() && E().busRiding)) return;
    const onStreet = SP.world && !SP.world.interior;
    if (!onStreet) return;
    const m = ((C().abs() % 1440) + 1440) % 1440;
    if (m < 7 * 60 || m > 21 * 60) return;
    let near = false;
    try {
      near = (SP.world.objects || []).some((o) => o.interact === "gate" && Math.hypot(SP.player.x - o.x, SP.player.y - o.y) < 9);
    } catch (e) {}
    if (!near && !fl.missed_scan_force) return;
    fl.missed_scan_pending = false;
    fl.missed_scan_quiz_done = true;
    toast("门岗：登记簿上昨晚到今早没你的进门记录啊？");
    const opts = [
      {
        id: "explain", ok: true, label: "解释：住外面 / 忘了扫",
        fn: () => {
          toast("门岗：下次进出记得扫一下，我给你补备注了。");
          K.pushMakeupNote();
          if (F()) F().pushLog("scan_quiz", "门岗盘问：补登记（解释）", { place: "gate" });
          return null;
        }
      },
      {
        id: "show_log", ok: true, label: "打开手机门禁登记簿给门岗看",
        fn: () => {
          toast("门岗凑近看了眼……行吧，手机里有记录就行。");
          if (A()) A().openPhone("scanlog");
          if (F()) F().pushLog("scan_quiz", "门岗盘问：出示登记簿", { place: "gate" });
          return null;
        }
      },
      {
        id: "shrug", ok: true, label: "含糊过去",
        fn: () => {
          toast("门岗：……下次注意。");
          if (ps().needs) {
            ps().needs.mood = Math.max(0, (ps().needs.mood || 50) - 3);
            G().hud && G().hud(true);
          }
          if (F()) F().pushLog("scan_quiz", "门岗盘问被敷衍", { place: "gate" });
          return null;
        }
      }
    ];
    G().openMenu({ _name: "门岗 · 扫码盘问", interact: "gate" }, opts);
  };

  K.pushMakeupNote = function () {
    K.ensure();
    ps().scanLog.unshift({
      t: (E() && E().stamp()) || "",
      abs: C().abs(),
      day: K.dayKey(),
      ok: true,
      detail: "门岗补登记（口述）",
      kind: "makeup"
    });
  };

  K.watchGateQuiz = function () {
    setInterval(() => { try { K.maybeGateScanQuiz(); } catch (e) {} }, 2200);
  };

  // ---------- 2) Outfit change → clear wear toasts + mood ----------
  K.onOutfitFresh = function (src) {
    K.ensure();
    ps().wearNotices = {};
    ps().flags.clothes_dirty_toasted = false;
    if (ps().clothes) ps().clothes.worn_h = 0;
    const n = ps().needs;
    if (n) {
      n.mood = Math.max(0, Math.min(100, (n.mood || 50) + OUTFIT_MOOD));
      G().hud && G().hud(true);
    }
    toast(`换上干净衣服了 · 心情+${OUTFIT_MOOD}${src ? "（" + src + "）" : ""}`, 2800);
    if (F()) F().pushLog("outfit_fresh", `换装清爽（${src || "换装"}）`, { place: "room_xin_102" });
  };

  K.wrapOutfit = function () {
    // rules change_clothes
    const g = G(); if (!g || g._kOutfit) return; g._kOutfit = true;
    const prevStart = g.start.bind(g);
    g.start = function (id, o) {
      const r = prevStart(id, o);
      // G.start returns null on success, a reason string on failure
      if (id === "change_clothes" && r == null) K.onOutfitFresh("洗衣换装");
      return r;
    };
    // appearance setOutfitId — wrap without editing appearance.js source permanently: runtime wrap
    if (SP.appearance && SP.appearance.setOutfitId && !SP.appearance._kSet) {
      SP.appearance._kSet = true;
      const prev = SP.appearance.setOutfitId.bind(SP.appearance);
      SP.appearance.setOutfitId = function (id) {
        const before = SP.appearance.getOutfitId && SP.appearance.getOutfitId();
        const ok = prev(id);
        if (ok && id !== before) K.onOutfitFresh("衣柜外观");
        return ok;
      };
    }
  };

  // ---------- 3) Rain / overtime tint on clothes chip ----------
  K.chipTintClass = function () {
    let cls = "";
    try {
      if (C().weather === "rain" || C().weather === "snow") cls += " wet";
      if (ps().shift || (ps().job && ps().job.onShift) || (ps().flags && ps().flags.on_shift)) cls += " ot";
      // also if worn high
      const cl = ps().clothes;
      const thr = (R().data.laundry && R().data.laundry.wear_dirty_h) || 20;
      if (cl && (cl.worn_h || 0) >= thr * 0.75) cls += " worn";
    } catch (e) {}
    return cls;
  };

  K.polishChipTint = function () {
    const sh = SH(); if (!sh || sh._kTint) return;
    sh._kTint = true;
    const prev = sh.clothesChip.bind(sh);
    sh.clothesChip = function () {
      let html = prev();
      const tint = K.chipTintClass();
      if (tint) html = html.replace('class="cloth-chip', `class="cloth-chip${tint}`);
      // annotate tip with rain/OT
      try {
        if (tint.indexOf("wet") >= 0 || tint.indexOf("ot") >= 0) {
          const extra = [];
          if (tint.indexOf("wet") >= 0) extra.push("雨天穿着更易脏感");
          if (tint.indexOf("ot") >= 0) extra.push("加班磨损↑");
          html = html.replace('title="', `title="${extra.join(" · ")} · `);
        }
      } catch (e) {}
      return html;
    };
    if (!document.getElementById("stageK-chip-css")) {
      const st = document.createElement("style"); st.id = "stageK-chip-css";
      st.textContent = `
        .cloth-chip.wet{background:#0a3d62;color:#7ec8ff}
        .cloth-chip.ot{box-shadow:0 0 0 1px #ff9f0a inset}
        .cloth-chip.worn{background:#5c3a00;color:#ffd60a}
        .cloth-chip.wet.worn{background:#3d2a10;color:#ffd60a}
        .kfilt-row{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}
        .kfilt{background:#2c2c2e;color:#f5f5f7;border:0;border-radius:8px;padding:5px 10px;cursor:pointer;font-size:12px}
        .kfilt.on{background:#0a84ff}
        .k-merge-link{margin:8px 0;padding:8px 10px;background:#2c2c2e;border-radius:8px;color:#0a84ff;cursor:pointer;font-size:13px}
      `;
      document.head.appendChild(st);
    }
  };

  // ---------- 4) Rx expiry ↔ pharmacy ----------
  K.stampRx = function (it) {
    if (!it) return;
    it.issuedDay = K.dayKey();
    it.expiresDay = it.issuedDay + RX_VALID_DAYS;
    it.note = (it.note || "") + ` · 有效至 D${it.expiresDay}`;
  };

  K.rxExpired = function (it) {
    if (!it) return true;
    if (it.expiresDay == null) return false;
    return K.dayKey() > it.expiresDay;
  };

  K.wrapRxExpiry = function () {
    const SE = E(); if (!SE || SE._kRx) return;
    SE._kRx = true;
    const prevGive = SE.giveItem.bind(SE);
    SE.giveItem = function (id, note) {
      const it = prevGive(id, note);
      if (id === "rx_slip" && it) K.stampRx(it);
      return it;
    };

    // present: reject if expired at hospital
    const SF = F();
    if (SF && !SF._kRxPresent) {
      SF._kRxPresent = true;
      const prev = SF.presentItem.bind(SF);
      SF.presentItem = function (target, itemId) {
        if (itemId === "rx_slip" && target === "hospital") {
          const it = SE.ensureBag().find((x) => x.id === "rx_slip");
          if (it && K.rxExpired(it)) {
            toast(`护士小周：这张处方已过期（D${it.expiresDay} 止）。请重新挂号开方。`);
            if (F()) F().pushLog("rx_expired", "处方过期，需重开", { place: "civic_hospital" });
            return;
          }
        }
        return prev(target, itemId);
      };
    }

    // pharmacy menu: additive wrap on stageD
    const SD = D();
    if (SD && SD.pharmacyMenu && !SD._kRxPharm) {
      SD._kRxPharm = true;
      const prevPh = SD.pharmacyMenu.bind(SD);
      SD.pharmacyMenu = function (o) {
        const ret = prevPh(o);
        const m = G().menu;
        if (!m || !m.opts) return ret;
        const it = SE.hasItem("rx_slip") && SE.ensureBag().find((x) => x.id === "rx_slip");
        if (it) {
          const expired = K.rxExpired(it);
          // patch rx option if present
          m.opts.forEach((opt) => {
            if (opt.id === "rx" && expired) {
              opt.ok = false;
              opt.label = `处方已过期（D${it.expiresDay} 止）· 请重开`;
              const raw = opt.fn;
              opt.fn = function () {
                toast("药剂师：过期处方不能取药，回诊室重开吧。");
                return null;
              };
            }
            if (opt.id === "rx" && !expired && it.expiresDay != null) {
              opt.label = (opt.label || "凭处方取药") + `（有效至 D${it.expiresDay}）`;
            }
          });
          if (!m.opts.some((x) => x.id === "rx_status")) {
            m.opts.unshift({
              id: "rx_status", ok: true,
              label: expired
                ? `查看处方：已过期（D${it.expiresDay}）`
                : `查看处方：有效至 D${it.expiresDay}（还剩 ${Math.max(0, it.expiresDay - K.dayKey())} 天）`,
              fn: () => {
                toast(expired
                  ? `处方已于 D${it.expiresDay} 过期`
                  : `处方有效至 D${it.expiresDay} · ${it.note || ""}`);
                return null;
              }
            });
          }
          G().openMenu(m.o || o, m.opts);
        }
        return ret;
      };
    }
  };

  // ---------- 5) Merge 门禁 entry with day-log todos ----------
  K.polishMergedTodos = function () {
    const sh = SH(); if (!sh || sh._kMerge) return;
    sh._kMerge = true;
    const prevList = sh.listTodos.bind(sh);
    sh.listTodos = function () {
      const todos = prevList();
      K.ensure();
      if (ps().flags.missed_scan_pending) {
        todos.unshift({ id: "missed_scan", text: "门岗可能盘问：昨夜未扫码进门", place: "gate" });
      }
      if ((ps().scanLog || []).length) {
        todos.push({ id: "scanlog", text: "查看门禁登记簿", place: "scanlog" });
      }
      // rx expiry todo
      try {
        const it = E() && E().hasItem("rx_slip") && E().ensureBag().find((x) => x.id === "rx_slip");
        if (it && it.expiresDay != null) {
          const left = it.expiresDay - K.dayKey();
          if (left < 0) todos.push({ id: "rx", text: "处方已过期，去医院重开", place: "civic_hospital" });
          else if (left <= 1) todos.push({ id: "rx", text: `处方即将过期（D${it.expiresDay}），尽快取药`, place: "civic_hospital" });
        }
      } catch (e) {}
      return todos;
    };

    // daylog: add link to scanlog
    const prevRender = sh.renderTodos.bind(sh);
    sh.renderTodos = function () {
      let html = prevRender();
      html += `<div class="k-merge-link" data-open-scanlog>🛂 打开门禁登记簿（可按日筛选）</div>`;
      return html;
    };

    // when daylog opens, bind merge link — wrap stageG bind via stageH polish already; add openPhone wrap
    const SA = A();
    if (SA && !SA._kDayMerge) {
      SA._kDayMerge = true;
      const prev = SA.openPhone.bind(SA);
      SA.openPhone = function (tab, threadId) {
        prev(tab, threadId);
        if (tab === "daylog") {
          const el = document.getElementById("phonepanel");
          const body = el && el.querySelector(".pbd");
          if (body) {
            const link = body.querySelector("[data-open-scanlog]");
            if (link) link.onclick = () => SA.openPhone("scanlog");
            // also re-bind todo jump for scanlog place
            body.querySelectorAll('[data-todo-jump="scanlog"]').forEach((b) => {
              b.onclick = () => SA.openPhone("scanlog");
            });
            body.querySelectorAll('[data-todo-jump="civic_hospital"]').forEach((b) => {
              b.onclick = () => {
                el.classList.add("hidden");
                if (A().spawnAt) A().spawnAt("hospital");
              };
            });
          }
        }
      };
    }

    // jumpTo scanlog
    if (SP.stageG && !SP.stageG.POI.scanlog) {
      SP.stageG.POI.scanlog = { label: "门禁登记", phone: "scanlog" };
    }
  };

  // ---------- install ----------
  K.install = function () {
    const g = G(); if (!g || g._stageK) return; g._stageK = true;
    K.ensure();
    K.wrapScanLogUI();
    K.trackMissedScan();
    K.watchGateQuiz();
    K.wrapOutfit();
    K.polishChipTint();
    K.wrapRxExpiry();
    K.polishMergedTodos();
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageJ && SP.stageH) K.install();
    else setTimeout(boot, 130);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.SP || (window.SP = {}));
