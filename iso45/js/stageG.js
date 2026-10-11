/* scene-proto-45 · Stage G: receipt→门禁/押金折扣, xin_102 laundry UI, daylog calendar+jump, gate follow-up.
   Does NOT touch stageD NPC_SPEC / appearance / civic exteriors (Char-A parallel track). */
(function (SP) {
  "use strict";
  const GG = (SP.stageG = {});
  const G = () => SP.game, R = () => G() && G().rules, C = () => SP.clock;
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 3000);
  const log = (t) => SP.world && SP.world.logEvent(t);
  const ps = () => G() && G().ps;
  const A = () => SP.stageA;
  const E = () => SP.stageE;
  const F = () => SP.stageF;

  const DEPOSIT_DISCOUNT = 100; // ¥ off deposit when landlord saw receipt
  const ACCESS_HOURS = 24; // game-hours of temp access after property files receipt

  GG.ensure = function () {
    const p = ps(); if (!p) return null;
    p.flags = p.flags || {};
    if (!p.gHooks) p.gHooks = {};
    return p;
  };

  // ---------- 1) Receipt → 物业门禁 / landlord deposit ----------
  GG.applyReceiptRewards = function (target, itemId) {
    GG.ensure();
    const fl = ps().flags;
    const SF = F();
    if (target === "property" && itemId === "police_receipt" && fl.property_receipt_filed) {
      if (!fl.xin_access_until) {
        const abs = C().abs();
        fl.xin_access_until = abs + ACCESS_HOURS * 60;
        fl.xin_access = true;
        toast("物业：馨园临时门禁已开通（演示 24 游戏时）", 3400);
        if (SF) SF.pushLog("access", "物业开通馨园临时门禁", { place: "xin" });
        if (E()) E().wxPush("property", "（系统）临时门禁卡已下发至租户权限。", true);
      }
    }
    if (target === "landlord" && (itemId === "police_receipt" || itemId === "police_stamp") && fl.landlord_saw_receipt) {
      if (!fl.deposit_discount) {
        fl.deposit_discount = DEPOSIT_DISCOUNT;
        toast(`房东：材料齐了，下套房租押金给你减 ¥${DEPOSIT_DISCOUNT}`, 3400);
        if (SF) SF.pushLog("discount", `房东押金优惠券 ¥${DEPOSIT_DISCOUNT}`, { place: "housing" });
        if (E()) E().wxPush("landlord", `（系统）押金优惠 ¥${DEPOSIT_DISCOUNT} 已记在租房页。`, true);
      }
    }
  };

  GG.wrapPresent = function () {
    const SF = F(); if (!SF || SF._gPresent) return;
    SF._gPresent = true;
    const prev = SF.presentItem.bind(SF);
    SF.presentItem = function (target, itemId) {
      const before = !!(ps() && ps().shownTo && ps().shownTo[target] && ps().shownTo[target][itemId]);
      prev(target, itemId);
      if (!before && ps() && ps().shownTo && ps().shownTo[target] && ps().shownTo[target][itemId]) {
        GG.applyReceiptRewards(target, itemId);
      }
    };
  };

  GG.wrapRent = function () {
    const SA = A(); if (!SA || SA._gRent) return;
    SA._gRent = true;
    const prev = SA.rentUnit.bind(SA);
    SA.rentUnit = function (id) {
      GG.ensure();
      const fl = ps().flags;
      const disc = fl.deposit_discount || 0;
      if (!disc || fl.deposit_discount_used) return prev(id);
      // patch money temporarily by giving discount as pre-credit
      const H = SA.ensureHousing(), U = SA.units()[id];
      if (!U || H.owned.includes(id)) return prev(id);
      const rent = U.rent;
      const deposit = rent * ((R().data.lease && R().data.lease.deposit_months) || 1);
      const cost = rent + deposit - disc;
      if (ps().money < cost) return toast(`钱不够（优惠后仍需 ¥${cost}）`);
      // perform discounted rent manually mirroring rentUnit
      ps().money -= cost;
      ps().stats = ps().stats || {};
      ps().stats.spent = (ps().stats.spent || 0) + cost;
      H.owned.push(id);
      H.deposits[id] = Math.max(0, deposit - disc);
      fl.deposit_discount_used = true;
      fl.deposit_discount = 0;
      if (G().payCard) G().payCard({
        amount: cost, method: "微信转账",
        to: (R().data.lease && R().data.lease.agent) || "链居中介",
        what: `租 ${U.label || id}（押金优惠−¥${disc}）`
      });
      toast(`已租下 ${U.label || id} · 押金优惠−¥${disc} · 实付¥${cost}`);
      log(`租下 ${U.label || id}（押金优惠¥${disc}）`);
      if (F()) F().pushLog("rent", `租下 ${U.label || id}（押金−¥${disc}）`, { place: U.scene || "housing" });
      SA.refreshPhone && SA.refreshPhone();
    };
  };

  GG.accessOk = function () {
    GG.ensure();
    const fl = ps().flags;
    if (!fl.xin_access && !fl.xin_access_until) return false;
    const abs = C().abs();
    if (fl.xin_access_until && abs > fl.xin_access_until) {
      fl.xin_access = false;
      return false;
    }
    return !!fl.xin_access || (fl.xin_access_until && abs <= fl.xin_access_until);
  };

  GG.polishXinAccessNote = function () {
    const g = G(); if (!g || g._gXinNote) return; g._gXinNote = true;
    const prev = g.use.bind(g);
    g.use = function (o) {
      if (o && (o.id === "xin_notice" || o.id === "xin_mail" || o.id === "xin_dir") && o.interact === "notice") {
        if (GG.accessOk()) {
          const left = Math.max(0, Math.round(((ps().flags.xin_access_until || 0) - C().abs()) / 60));
          toast(`馨园门禁：临时通行有效（约剩 ${left} 游戏时）`, 2800);
        }
      }
      return prev(o);
    };
  };

  // ---------- 2) Laundry UI loop on xin_102 ----------
  GG.clothesStatus = function () {
    const cl = ps() && ps().clothes;
    if (!cl) return null;
    const rack = cl.rack && cl.rack.balcony;
    let wash = null;
    if (cl.washer) {
      const left = Math.max(0, Math.round(cl.washer.done - C().abs()));
      wash = { n: cl.washer.n, left, done: left <= 0 };
    }
    let dry = null;
    if (rack) {
      const wet = rack.wet;
      let eta = 0;
      try {
        const dh = R().clothes && R().clothes.dryHours(G().ctx(), false);
        eta = Math.max(0, Math.round(wet * (dh || 8)));
      } catch (e) { eta = Math.max(0, Math.round(wet * 8)); }
      dry = { n: rack.n, wet: Math.round(wet * 100), eta, ready: wet <= ((R().data.laundry && R().data.laundry.collect_max_wet) || 0.15) };
    }
    return { clean: cl.clean, dirty: cl.dirty, wash, dry };
  };

  GG.laundryHint = function () {
    const st = GG.clothesStatus();
    if (!st) return "洗衣系统未初始化";
    const parts = [`净衣×${st.clean}`, `脏衣×${st.dirty}`];
    if (st.wash) parts.push(st.wash.done ? "洗衣机：洗好了，可晾" : `洗衣机：还要约 ${st.wash.left} 分钟`);
    if (st.dry) parts.push(st.dry.ready ? `阳台杆：已干×${st.dry.n}，可收` : `阳台杆：湿度${st.dry.wet}% · 约 ${st.dry.eta} 时干`);
    else parts.push("阳台杆：空");
    return parts.join(" · ");
  };

  GG.openLaundryMenu = function (o) {
    const place = o && o.interact;
    const st = GG.clothesStatus();
    const opts = [];
    opts.push({
      id: "status", ok: true, label: "查看洗衣/晾衣进度",
      fn: () => { toast(GG.laundryHint(), 4000); return null; }
    });
    if (place === "washer" || !place) {
      opts.push({
        id: "wash", ok: true, label: "开始洗衣服",
        fn: () => { G().start("wash_clothes", o || (SP.world.byId && SP.world.byId.washer)); return null; }
      });
      opts.push({
        id: "hang", ok: true, label: "把洗好的衣服晾到阳台杆",
        fn: () => { G().start("hang_clothes", o || SP.world.byId.washer); return null; }
      });
    }
    // collect available from washer or rack (unified loop)
    opts.push({
      id: "collect", ok: true, label: "收干衣服（阳台杆）",
      fn: () => { G().start("collect_clothes", (SP.world.byId && SP.world.byId.rack) || o); return null; }
    });
    opts.push({
      id: "fast_dry", ok: true, label: "演示：推进时间至衣服干透",
      fn: () => {
        const cl = ps().clothes;
        if (!cl || !cl.rack || !cl.rack.balcony) { toast("杆上没有衣服"); return null; }
        const wet = cl.rack.balcony.wet;
        let hours = 8;
        try { hours = Math.ceil(wet * (R().clothes.dryHours(G().ctx(), false) || 8)); } catch (e) {}
        hours = Math.max(1, Math.min(20, hours + 1));
        if (C().skipTo) C().skipTo(C().abs() + hours * 60, 1.2);
        else C().min = (C().min || 0) + hours * 60;
        G().syncLaundry && G().syncLaundry();
        toast(`推进约 ${hours} 小时…`);
        if (F()) F().pushLog("laundry", `等待晾干约 ${hours} 时`, { place: "room_xin_102" });
        return null;
      }
    });
    opts.push({ id: "cancel", ok: true, label: "关掉", fn: () => null });
    G().openMenu(Object.assign({}, o || {}, { _name: "馨园洗衣 · 阳台杆" }), opts);
    return null;
  };

  GG.polishLaundry = function () {
    const g = G(); if (!g || g._gLaundry) return; g._gLaundry = true;
    // After stageF may have wrapped use; wrap again for xin_102 washer/rack richer menu
    const prev = g.use.bind(g);
    g.use = function (o) {
      if (o && SP.world && SP.world.sceneId === "room_xin_102" &&
          (o.interact === "washer" || o.interact === "rack")) {
        GG.openLaundryMenu(o);
        return null;
      }
      return prev(o);
    };
    // seed clothes if missing when entering xin_102
    setInterval(() => {
      try {
        if (!ps() || !R()) return;
        if (SP.world && SP.world.sceneId === "room_xin_102" && !ps().clothes) {
          const L = R().data.laundry;
          if (L) ps().clothes = { clean: L.start.clean, dirty: L.start.dirty, worn_h: 0, washer: null, rack: {} };
        }
        G().syncLaundry && G().syncLaundry();
      } catch (e) {}
    }, 2000);
  };

  // ---------- 3) Day-log calendar fold + jump ----------
  GG.POI = {
    xin: { label: "馨园", spawn: "xin" },
    housing: { label: "租房", spawn: null, phone: "housing" },
    room_xin_102: { label: "馨园1-02", scene: "room_xin_102" },
    civic_police: { label: "派出所", spawn: "police" },
    civic_hospital: { label: "医院", spawn: "hospital" },
    civic_fire: { label: "消防站", spawn: "fire" },
    street: { label: "街道", scene: "street", xy: [1.5, 10] },
    bus: { label: "公交站", scene: "street", xy: [-20, 2.4] },
    gate: { label: "铁门门岗", scene: "street", xy: [-2, 11] }
  };

  GG.jumpTo = function (place) {
    const p = GG.POI[place] || (place && GG.POI[place]);
    const key = place;
    const meta = GG.POI[key];
    if (!meta) { toast("这条记录没有可跳转地点"); return; }
    const el = document.getElementById("phonepanel");
    if (el) el.classList.add("hidden");
    if (meta.phone && A()) { A().openPhone(meta.phone); return; }
    if (meta.spawn && A() && A().spawnAt) { A().spawnAt(meta.spawn); return; }
    if (meta.scene) {
      if (meta.xy) {
        if (G().go) G().go({ to: meta.scene, spawn: [meta.xy[0], meta.xy[1], "S"] });
        else if (SP.place && SP.place.enter) SP.place.enter(meta.scene, [meta.xy[0], meta.xy[1], "S"]);
      } else {
        const sp = (SP.scenes[meta.scene] && SP.scenes[meta.scene].spawn) || [2, 2, "N"];
        if (G().go) G().go({ to: meta.scene, spawn: sp });
        else if (SP.place) SP.place.enter(meta.scene, sp);
      }
      toast(`已前往 · ${meta.label}`);
    }
  };

  GG.renderCalendar = function () {
    const SF = F(); SF && SF.ensure();
    const rows = (ps().dayLog || []).slice(0, 30);
    if (!rows.length) {
      return `<div class="plog"><p class="hint">还没有日程。出示证件、公交、夜间事件、洗衣会出现在这里。</p></div>`;
    }
    const byDay = {};
    rows.forEach((r) => {
      const d = r.day != null ? r.day : 0;
      if (!byDay[d]) byDay[d] = [];
      byDay[d].push(r);
    });
    const days = Object.keys(byDay).map(Number).sort((a, b) => b - a);
    const open = GG._calOpen != null ? GG._calOpen : days[0];
    return `<div class="plog pcal">${days.map((d) => {
      const openCls = d === open ? "open" : "";
      const list = byDay[d];
      return `<div class="pcal-day ${openCls}" data-day="${d}">
        <button type="button" class="pcal-fold" data-fold="${d}">D${d} · ${list.length} 条 ${d === open ? "▾" : "▸"}</button>
        <div class="pcal-body">${d === open ? list.map((r, i) => {
          const place = r.place || "";
          const can = !!(place && GG.POI[place]);
          return `<div class="plog-row">
            <span>${r.t || ""}</span> <i class="pk">${r.kind || ""}</i>
            <p>${r.text}</p>
            ${can ? `<button type="button" data-jump="${place}">前往 ${GG.POI[place].label}</button>` : ""}
          </div>`;
        }).join("") : ""}</div>
      </div>`;
    }).join("")}</div>`;
  };

  GG.bindCalendar = function (body) {
    if (!body) return;
    body.querySelectorAll("[data-fold]").forEach((b) => {
      b.onclick = () => {
        const d = +b.dataset.fold;
        GG._calOpen = GG._calOpen === d ? -1 : d;
        if (A()) A().openPhone("daylog");
      };
    });
    body.querySelectorAll("[data-jump]").forEach((b) => {
      b.onclick = () => GG.jumpTo(b.dataset.jump);
    });
  };

  GG.polishDaylog = function () {
    const SF = F(); if (!SF || SF._gLog) return;
    SF._gLog = true;
    SF.renderLog = function () { return GG.renderCalendar(); };
    // enrich pushLog places for common kinds when missing
    const prevPush = SF.pushLog.bind(SF);
    SF.pushLog = function (kind, text, extra) {
      extra = extra || {};
      if (!extra.place) {
        if (kind === "bus") extra.place = "bus";
        if (kind === "night_ignore" || kind === "night_handle") extra.place = "street";
        if (kind === "present_ok" && /物业|property/.test(text)) extra.place = "xin";
        if (kind === "access") extra.place = "xin";
        if (kind === "laundry") extra.place = "room_xin_102";
        if (kind === "gate_followup") extra.place = "gate";
      }
      return prevPush(kind, text, extra);
    };
    const SA = A(); if (!SA || SA._gLogPhone) return;
    SA._gLogPhone = true;
    const prev = SA.openPhone.bind(SA);
    SA.openPhone = function (tab, threadId) {
      prev(tab, threadId);
      if (tab === "daylog") {
        const el = document.getElementById("phonepanel");
        const body = el && el.querySelector(".pbd");
        if (body) {
          body.innerHTML = GG.renderCalendar();
          GG.bindCalendar(body);
        }
        // housing tip for deposit coupon
      }
      if (tab === "housing") {
        GG.ensure();
        const fl = ps().flags;
        const el = document.getElementById("phonepanel");
        const body = el && el.querySelector(".pbd");
        if (body && fl.deposit_discount && !fl.deposit_discount_used) {
          const tip = document.createElement("p");
          tip.className = "hint";
          tip.style.color = "#34c759";
          tip.textContent = `房东优惠：下一套房源押金 −¥${fl.deposit_discount}（出示回执已生效）`;
          body.insertBefore(tip, body.firstChild);
        }
        if (body && GG.accessOk()) {
          const tip = document.createElement("p");
          tip.className = "hint";
          tip.textContent = "馨园临时门禁：有效中（物业已备案回执）";
          body.insertBefore(tip, body.firstChild);
        }
      }
    };
  };

  // ---------- 4) Gate follow-up after ignored police call ----------
  GG.wrapMorning = function () {
    const SF = F(); if (!SF || SF._gMorning) return;
    SF._gMorning = true;
    const prev = SF.applyMorningMood.bind(SF);
    SF.applyMorningMood = function () {
      GG.ensure();
      const nf = ps().nightFlags || {};
      if (nf.ignoredPolice) {
        ps().flags.gate_followup_pending = true;
        ps().flags.gate_followup_day = SF.dayKey() + 1;
      }
      prev();
    };
  };

  GG.maybeGateFollowup = function () {
    GG.ensure();
    const fl = ps().flags;
    if (!fl.gate_followup_pending || fl.gate_followup_done) return;
    if (G().menu || (E() && E().busRiding)) return;
    // offer once when on street near gate, or any daytime after pending day
    const day = F() ? F().dayKey() : 0;
    if (fl.gate_followup_day != null && day < fl.gate_followup_day) return;
    const onStreet = SP.world && !SP.world.interior;
    if (!onStreet) return;
    let near = false;
    try {
      near = (SP.world.objects || []).some((o) => o.interact === "gate" && Math.hypot(SP.player.x - o.x, SP.player.y - o.y) < 8);
    } catch (e) {}
    // also fire once mid-morning even if not near gate
    const m = ((C().abs() % 1440) + 1440) % 1440;
    const daytime = m >= 8 * 60 && m < 20 * 60;
    if (!daytime) return;
    if (!near && !fl.gate_followup_force && m % 60 > 5) return;
    fl.gate_followup_pending = false;
    fl.gate_followup_done = true;
    toast("门岗招手：昨晚派出所电话你没接？过来登记一下。");
    const opts = [
      {
        id: "explain", ok: true, label: "解释情况并出示回执（若有）",
        fn: () => {
          if (E() && E().hasItem("police_receipt")) {
            toast("门岗：有回执就行，下次电话记得接。给你备注了。");
            ps().flags.gate_note = true;
            if (F()) F().pushLog("gate_followup", "门岗补登记（出示回执）", { place: "gate" });
          } else {
            toast("门岗：没回执也先记一笔，白天去派出所补材料。");
            if (F()) F().pushLog("gate_followup", "门岗补登记（无回执）", { place: "gate" });
            if (ps().needs) {
              ps().needs.mood = Math.max(0, (ps().needs.mood || 50) - 3);
              G().hud && G().hud();
            }
          }
          return null;
        }
      },
      {
        id: "shrug", ok: true, label: "敷衍两句走开",
        fn: () => {
          toast("门岗：行吧……下次别让所里打电话找不到人。");
          if (F()) F().pushLog("gate_followup", "门岗盘问被敷衍", { place: "gate" });
          if (ps().needs) {
            ps().needs.mood = Math.max(0, (ps().needs.mood || 50) - 5);
            G().hud && G().hud();
          }
          return null;
        }
      }
    ];
    G().openMenu({ _name: "门岗 · 夜间来电跟进", interact: "gate" }, opts);
  };

  GG.watchGate = function () {
    setInterval(() => { try { GG.maybeGateFollowup(); } catch (e) {} }, 2500);
  };

  // ---------- install ----------
  GG.install = function () {
    const g = G(); if (!g || g._stageG) return; g._stageG = true;
    GG.ensure();
    GG.wrapPresent();
    GG.wrapRent();
    GG.polishXinAccessNote();
    GG.polishLaundry();
    GG.polishDaylog();
    GG.wrapMorning();
    GG.watchGate();
    if (!document.getElementById("stageG-css")) {
      const st = document.createElement("style"); st.id = "stageG-css";
      st.textContent = `
        .pcal-day{border-bottom:1px solid #2c2c2e;margin:0 0 6px}
        .pcal-fold{background:transparent;border:0;color:#f5f5f7;font-weight:700;padding:10px 0;width:100%;text-align:left;cursor:pointer}
        .pcal-body .plog-row{padding:8px 0}
        .pcal-body .pk{color:#8e8e93;font-style:normal;font-size:11px;margin-left:6px}
        .pcal-body button[data-jump]{margin-top:6px;background:#0a84ff;color:#fff;border:0;border-radius:8px;padding:6px 10px;cursor:pointer}
      `;
      document.head.appendChild(st);
    }
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageF && SP.stageE) GG.install();
    else setTimeout(boot, 100);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.SP || (window.SP = {}));
