/* scene-proto-45 · Stage F: present items to NPCs, bus bell/announce, xin_102 laundry, night day-log. */
(function (SP) {
  "use strict";
  const F = (SP.stageF = {});
  const G = () => SP.game, R = () => G() && G().rules, C = () => SP.clock;
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 2800);
  const log = (t) => SP.world && SP.world.logEvent(t);
  const ps = () => G() && G().ps;
  const A = () => SP.stageA;
  const D = () => SP.stageD;
  const E = () => SP.stageE;

  F.ensure = function () {
    const p = ps(); if (!p) return null;
    if (!p.shownTo) p.shownTo = {};
    if (!p.dayLog) p.dayLog = [];
    if (!p.nightFlags) p.nightFlags = {};
    return p;
  };
  F.dayKey = function () {
    try { return C().day != null ? C().day : Math.floor(C().abs() / 1440); } catch (e) { return 0; }
  };
  F.pushLog = function (kind, text, extra) {
    F.ensure();
    const row = Object.assign({
      day: F.dayKey(),
      t: (E() && E().stamp && E().stamp()) || "",
      kind, text
    }, extra || {});
    ps().dayLog.unshift(row);
    if (ps().dayLog.length > 40) ps().dayLog.length = 40;
    log(text);
    return row;
  };

  // ---------- present items ----------
  // target kinds: property | landlord | guard | police | hospital | fire | aunt | generic
  F.DOC_IDS = ["police_receipt", "police_stamp", "fine_receipt", "rx_slip", "fire_card"];
  F.docsInBag = function () {
    if (!E()) return [];
    return E().ensureBag().filter((it) => F.DOC_IDS.includes(it.id));
  };
  F.shownKey = function (target, itemId) {
    return `${target}::${itemId}`;
  };
  F.alreadyShown = function (target, itemId) {
    F.ensure();
    return !!(ps().shownTo[target] && ps().shownTo[target][itemId]);
  };
  F.markShown = function (target, itemId) {
    F.ensure();
    if (!ps().shownTo[target]) ps().shownTo[target] = {};
    ps().shownTo[target][itemId] = { t: E().stamp(), day: F.dayKey() };
  };

  F.OUTCOMES = {
    property: {
      police_receipt: { ok: true, text: "物业小吴：收到回执复印件，楼道纠纷我们备案了。谢谢配合。" },
      police_stamp: { ok: true, text: "物业小吴：盖章证明有效，门禁临时通行我给你开一天。" },
      fine_receipt: { ok: true, text: "物业小吴：环卫罚款凭证收到，这次就不另开整改单了。" },
      fire_card: { ok: true, text: "物业小吴：消防宣传卡不错，楼道灭火器位置我再给你指一下。" },
      rx_slip: { ok: false, text: "物业小吴：这个……处方我们留不了档，看病相关找医院吧。" }
    },
    landlord: {
      police_receipt: { ok: true, text: "房东刘姐：行，有派出所回执我就放心点。有事微信说。" },
      police_stamp: { ok: true, text: "刘姐：章也盖了？好好好，省得中介再催材料。" },
      fine_receipt: { ok: true, text: "刘姐：罚款交了就行，下次别往楼道扔垃圾哈。" },
      fire_card: { ok: true, text: "刘姐：消防课上过了？不错，厨房小心火烛。" },
      rx_slip: { ok: true, text: "刘姐：身体要紧，药按时吃。房租不急你这两天。" }
    },
    guard: {
      police_receipt: { ok: true, text: "门岗：看到回执了，今晚进出登记我给你备注「已备案」。" },
      police_stamp: { ok: true, text: "门岗：业务章齐全，访客我按证明放行。" },
      fine_receipt: { ok: false, text: "门岗：罚款单不用给我，找物业办公室。" },
      fire_card: { ok: true, text: "门岗：提拔握压我也背过，兄弟可以啊。" },
      rx_slip: { ok: false, text: "门岗：看病证明？门岗用不上，进门刷卡就行。" }
    },
    police: {
      police_receipt: { ok: false, text: "民警小张：回执是我们开的，你留着给物业/房东看就行。" },
      police_stamp: { ok: false, text: "小张：章已经盖过了，别重复交材料。" },
      fine_receipt: { ok: true, text: "小张：罚款到账凭证核对无误，这件事结了。" },
      fire_card: { ok: true, text: "小张：消防站发的？楼道安全意识不错。" },
      rx_slip: { ok: false, text: "小张：看病找医院，派出所不管开药。" }
    },
    hospital: {
      rx_slip: { ok: true, text: "护士小周：处方在有效期内，药房窗口取药即可。" },
      police_receipt: { ok: false, text: "小周：这个是派出所的，医院用不上。" },
      fire_card: { ok: true, text: "小周：灭火器要领？诊室灭火器在角落，别挡着。" },
      police_stamp: { ok: false, text: "小周：业务章证明请去行政窗口，这边是门诊。" },
      fine_receipt: { ok: false, text: "小周：罚款凭证不是医保材料哦。" }
    },
    fire: {
      fire_card: { ok: true, text: "消防员小陈：卡片还在就好，回去练一遍「提拔握压」。" },
      police_receipt: { ok: false, text: "小陈：报案回执我们留不了，消防通道别堵就行。" },
      rx_slip: { ok: false, text: "小陈：看病找医院。站里只有外伤急救包。" },
      police_stamp: { ok: false, text: "小陈：这个章跟消防验收无关。" },
      fine_receipt: { ok: false, text: "小陈：环卫罚款请找物业。" }
    },
    aunt: {
      rx_slip: { ok: true, text: "王阿姨：哎哟看完病啦？多喝热水，阿姨给你煮粥。" },
      police_receipt: { ok: true, text: "王阿姨：派出所都去了？小心点，有事喊阿姨。" },
      fire_card: { ok: true, text: "王阿姨：灭火器啊，我家厨房就有一个！" },
      fine_receipt: { ok: true, text: "王阿姨：罚款交了就改，年轻人别再扔了。" },
      police_stamp: { ok: true, text: "王阿姨：盖章了就好，办事真不容易。" }
    }
  };

  F.resolveTarget = function (hint) {
    if (hint) return hint;
    const sid = SP.world && SP.world.sceneId;
    if (sid === "civic_police") return "police";
    if (sid === "civic_hospital") return "hospital";
    if (sid === "civic_fire") return "fire";
    if (sid && String(sid).indexOf("stair_xin") === 0) return "property";
    if (sid && String(sid).indexOf("stair_") === 0) return "landlord";
    try {
      const px = SP.player.x, py = SP.player.y;
      const nearGate = (SP.world.objects || []).some((o) => o.interact === "gate" && Math.hypot(px - o.x, py - o.y) < 5);
      if (nearGate) return "guard";
    } catch (e) {}
    return "generic";
  };

  F.presentItem = function (target, itemId) {
    F.ensure();
    if (!E() || !E().hasItem(itemId)) return toast("背包里没有这件");
    const it = E().ensureBag().find((x) => x.id === itemId);
    if (F.alreadyShown(target, itemId)) {
      toast(`对方：这份「${it.label}」你已经给我看过了。`);
      F.pushLog("present_dup", `重复出示 ${it.label} → ${target}`);
      return;
    }
    const table = F.OUTCOMES[target] || {};
    const oc = table[itemId] || {
      ok: false,
      text: target === "generic"
        ? `对方看了一眼「${it.label}」，点点头，不太确定能帮什么。`
        : `对方：这个「${it.label}」我这边用不上。`
    };
    toast(oc.text, 3400);
    if (oc.ok) {
      F.markShown(target, itemId);
      F.pushLog("present_ok", `出示 ${it.label} → ${target}（接受）`);
      if (target === "property" && itemId === "police_receipt") {
        ps().flags = ps().flags || {}; ps().flags.property_receipt_filed = true;
        E().wxPush("property", "（系统）回执已当面核验。", true);
      }
      if (target === "landlord" && (itemId === "police_receipt" || itemId === "police_stamp")) {
        ps().flags = ps().flags || {}; ps().flags.landlord_saw_receipt = true;
        E().wxPush("landlord", "微信也同步了：材料我看到了。", true);
      }
      if (target === "guard" && oc.ok) {
        ps().flags = ps().flags || {}; ps().flags.gate_note = true;
      }
    } else {
      F.pushLog("present_reject", `出示 ${it.label} → ${target}（未收）`);
    }
  };

  F.openPresentMenu = function (target, fromObj) {
    const docs = F.docsInBag();
    if (!docs.length) return toast("背包里没有可出示的证件/回执（先去派出所/医院/消防站办事）");
    const t = F.resolveTarget(target);
    const names = { property: "物业", landlord: "房东/邻居", guard: "门岗", police: "民警", hospital: "医院", fire: "消防", aunt: "王阿姨", generic: "对方" };
    const opts = docs.map((it) => ({
      id: "show_" + it.id,
      ok: true,
      label: (F.alreadyShown(t, it.id) ? "（已出示过）" : "") + `出示 ${it.emoji || ""} ${it.label}`,
      fn: () => { F.presentItem(t, it.id); return null; }
    }));
    opts.push({ id: "cancel", ok: true, label: "算了", fn: () => null });
    G().openMenu(Object.assign({}, fromObj || {}, { _name: `出示证件 · ${names[t] || t}` }), opts);
    return null;
  };

  F.inferTargetFromObject = function (o) {
    if (!o) return F.resolveTarget();
    if (o.civicKind === "police" || o.interact === "police_desk" || o.interact === "police_stamp") return "police";
    if (o.interact === "hospital_nurse" || o.interact === "hospital_doctor" || o.interact === "pharmacy") return "hospital";
    if (o.interact === "fire_duty" || o.interact === "fire_gear" || o.interact === "fire_truck") return "fire";
    if (o.id === "xin_mail" || o.id === "xin_notice" || o.id === "xin_dir") return "property";
    if (o.interact === "mailbox") return "landlord";
    if (o.interact === "neighbor_door") {
      if (o.name && /王|阿姨|3F-01|2F-01/.test(o.name)) return "aunt";
      return "landlord";
    }
    if (o.interact === "gate" || o.id === "gate_present" || o.id === "guard_booth") return "guard";
    return F.resolveTarget();
  };

  // ---------- bus bell + announce ----------
  F.polishBus = function () {
    const SE = E(); if (!SE || SE._busF) return;
    SE._busF = true;
    const prevRide = SE.rideBus.bind(SE);
    SE.rideBus = function (dest, fare, mins, mode) {
      const SA = A();
      const fromStop = SA && SA.busStops && SA.busStops.find((s) => {
        return Math.hypot(SP.player.x - s.x, SP.player.y - s.y) < 8;
      });
      const fromName = (fromStop && fromStop.name) || "本站";
      toast(`🚌 下一站：${dest.name}（本站 ${fromName}）`, 2200);
      F.chime(false);
      if (mode !== "skip") {
        const overlay = SE.ensureBusOverlay();
        const cap = overlay.querySelector(".bus-cap");
        if (cap) cap.innerHTML = `行驶中 → <b>${dest.name}</b><br><small>叮——报站：下一站 ${dest.name}</small>`;
      }
      prevRide(dest, fare, mins, mode);
      const delay = mode === "skip" ? 350 : ((prices().bus_ride_anim_sec || 2.8) * 1000 + 120);
      setTimeout(() => {
        F.chime(true);
        toast(`叮——到站了：${dest.name}，请从后门下车`, 3000);
        F.pushLog("bus", `公交到站 ${dest.name}`);
        const ov = document.getElementById("busride");
        if (ov && !ov.classList.contains("hidden")) {
          const c = ov.querySelector(".bus-cap");
          if (c) c.innerHTML = `到站 · <b>${dest.name}</b>`;
        }
      }, Math.min(delay, mode === "skip" ? 450 : 3600));
    };
  };
  function prices() { return (R() && R().data.prices) || {}; }
  F.chime = function (arrive) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = F._ac || (F._ac = new AC());
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = arrive ? 880 : 660;
      g.gain.value = 0.04;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (arrive ? 0.35 : 0.2));
      o.stop(ctx.currentTime + (arrive ? 0.4 : 0.25));
      if (arrive) {
        setTimeout(() => {
          const o2 = ctx.createOscillator(), g2 = ctx.createGain();
          o2.frequency.value = 660; g2.gain.value = 0.035;
          o2.connect(g2); g2.connect(ctx.destination);
          o2.start(); g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          o2.stop(ctx.currentTime + 0.35);
        }, 180);
      }
    } catch (e) {}
  };

  // ---------- night events → day log + morning mood ----------
  F.polishNight = function () {
    const SE = E(); if (!SE || SE._nightF) return;
    SE._nightF = true;
    const prev = SE.offerNightEvent.bind(SE);
    SE.offerNightEvent = function (kind) {
      prev(kind);
      const m = G().menu;
      if (!m || !m.opts) return;
      m.opts.forEach((opt) => {
        if (!opt.fn || opt._fNight) return;
        const raw = opt.fn;
        opt._fNight = true;
        opt.fn = function () {
          const r = raw();
          F.onNightChoice(kind, opt.id);
          return r;
        };
      });
    };
  };
  F.onNightChoice = function (kind, choiceId) {
    F.ensure();
    const nf = ps().nightFlags;
    if (kind === "police") {
      if (choiceId === "skip") {
        nf.ignoredPolice = true;
        F.pushLog("night_ignore", "夜间忽略派出所来电", { choice: choiceId });
      } else {
        nf.handledPolice = true;
        nf.ignoredPolice = false;
        F.pushLog("night_handle", choiceId === "report_phone" ? "夜间电话补报案" : "夜间接听派出所来电", { choice: choiceId });
      }
    } else if (kind === "clinic") {
      if (choiceId === "skip") {
        nf.ignoredClinic = true;
        F.pushLog("night_ignore", "夜间忽略急诊提示", { choice: choiceId });
      } else {
        nf.handledClinic = true;
        nf.ignoredClinic = false;
        F.pushLog("night_handle", choiceId === "go" ? "夜间前往急诊窗口" : "夜间拨打120咨询", { choice: choiceId });
      }
    }
  };
  F.applyMorningMood = function () {
    F.ensure();
    const nf = ps().nightFlags || {};
    const n = ps().needs; if (!n) return;
    let msg = null, dMood = 0;
    if (nf.ignoredPolice && nf.ignoredClinic) {
      dMood = -8; msg = "昨晚电话都没理，心里有点发虚。";
    } else if (nf.ignoredPolice || nf.ignoredClinic) {
      dMood = -4; msg = "昨晚有事没处理完，心情一般。";
    } else if (nf.handledPolice || nf.handledClinic) {
      dMood = 5; msg = "昨晚把事办利落了，醒来踏实些。";
    }
    if (dMood) {
      n.mood = Math.max(0, Math.min(100, (n.mood || 50) + dMood));
      G().hud && G().hud();
      toast(`（晨间）${msg} 心情${dMood > 0 ? "+" : ""}${dMood}`, 3200);
      F.pushLog("morning", msg, { mood: dMood });
    }
    ps().nightFlags = {};
  };
  F.watchDays = function () {
    F._lastDay = F.dayKey();
    setInterval(() => {
      try {
        const d = F.dayKey();
        if (d !== F._lastDay) {
          F._lastDay = d;
          F.applyMorningMood();
        }
      } catch (e) {}
    }, 1500);
  };

  // ---------- day log phone page ----------
  F.renderLog = function () {
    F.ensure();
    const rows = ps().dayLog || [];
    if (!rows.length) return `<div class="plog"><p class="hint">还没有日程记录。夜间事件、出示证件、公交到站会出现在这里。</p></div>`;
    return `<div class="plog">${rows.slice(0, 16).map((r) => `
      <div class="plog-row"><b>D${r.day}</b> <span>${r.t || ""}</span>
      <p>${r.text}</p></div>`).join("")}</div>`;
  };

  // ---------- hook interactions: knock / use / civic menus ----------
  F.installHooks = function () {
    const g = G(); if (!g || g._stageFHooks) return; g._stageFHooks = true;

    // wrap knock → menu with present option
    if (g.knock && !g._fKnock) {
      g._fKnock = true;
      const prevKnock = g.knock.bind(g);
      g.knock = function (o) {
        const docs = F.docsInBag();
        if (!docs.length) return prevKnock(o);
        const target = F.inferTargetFromObject(o);
        const opts = [
          { id: "knock", ok: true, label: "敲门打招呼", fn: () => { prevKnock(o); return null; } },
          { id: "present", ok: true, label: "出示背包证件…", fn: () => { F.openPresentMenu(target, o); return null; } }
        ];
        g.openMenu(Object.assign({}, o, { _name: (o.name || "门") + " · 互动" }), opts);
        return null;
      };
    }

    // wrap use for notice/mailbox/gate/civic → inject present
    const prevUse = g.use.bind(g);
    g.use = function (o) {
      if (F._presenting) return prevUse(o);
      const k = o && o.interact;
      const presentable = k === "mailbox" || k === "notice" || k === "gate" ||
        k === "police_desk" || k === "hospital_nurse" || k === "fire_duty" ||
        (o && (o.id === "xin_mail" || o.id === "xin_notice" || o.id === "guard_booth"));
      if (presentable && F.docsInBag().length && !o._skipPresent) {
        // For civic desks, open present as extra via menu wrapper after default — 
        // Instead: if shift-like? Better: add parallel option by intercepting menus from stageD.
        // For mailbox/notice/gate: show choice menu
        if (k === "mailbox" || k === "notice" || k === "gate" || o.id === "xin_mail" || o.id === "xin_notice" || o.id === "guard_booth") {
          const target = F.inferTargetFromObject(o);
          const opts = [
            { id: "normal", ok: true, label: (k === "mailbox" ? "看信箱" : k === "gate" ? "推门/看门岗" : "看公告"),
              fn: () => { o._skipPresent = true; const t = prevUse(o); o._skipPresent = false; return t; } },
            { id: "present", ok: true, label: "出示背包证件…",
              fn: () => { F.openPresentMenu(target, o); return null; } }
          ];
          g.openMenu(Object.assign({}, o, { _name: o.name || o.id || "互动" }), opts);
          return null;
        }
      }
      return prevUse(o);
    };

    // Inject present into civic menus (stageD)
    const SD = D();
    if (SD && !SD._fPresent) {
      SD._fPresent = true;
      ["policeMenu", "hospitalNurse", "fireDuty"].forEach((fnName) => {
        if (!SD[fnName]) return;
        const prev = SD[fnName].bind(SD);
        SD[fnName] = function (o) {
          const ret = prev(o);
          const m = g.menu;
          if (m && m.opts && F.docsInBag().length) {
            const target = F.inferTargetFromObject(o);
            if (!m.opts.some((x) => x.id === "present_docs")) {
              m.opts.push({
                id: "present_docs", ok: true, label: "出示背包证件…",
                fn: () => { F.openPresentMenu(target, o); return null; }
              });
              // refresh menu DOM
              g.openMenu(m.o, m.opts);
            }
          }
          return ret;
        };
      });
    }

    // Gate/门岗: use existing street gates (interact:gate) — no injected objects (fade/alpha safety)
    F.ensureGuardBooth = function () {};
    F.hookStreetGate = function () {
      if (F._gateHooked || !SP.world) return; F._gateHooked = true;
      // Patch main-loop interact by wrapping toast-less gate open: store original on SP
      const prev = SP._gateInteract;
      SP.presentAtGate = function (o) {
        if (!F.docsInBag().length) return false;
        const g = G(); if (!g || !g.openMenu) return false;
        const open = o.state !== "open";
        g.openMenu(Object.assign({}, o, { _name: "铁门 / 门岗" }), [
          { id: "toggle", ok: true, label: open ? "推开铁门" : "关上铁门",
            fn: () => {
              const gates = SP.world.objects.filter((x) => x.interact === "gate");
              gates.forEach((x) => (x.state = open ? "open" : "closed"));
              SP.world.rebuildColliders && SP.world.rebuildColliders();
              toast(open ? "推开铁门" : "关上铁门（院子被封住）");
              return null;
            } },
          { id: "present", ok: true, label: "向门岗出示证件…",
            fn: () => { F.openPresentMenu("guard", o); return null; } }
        ]);
        return true;
      };
    };
  };

  F.polishPhone = function () {
    const SA = A(); if (!SA || SA._logPhone) return;
    SA._logPhone = true;
    const prev = SA.openPhone.bind(SA);
    SA.openPhone = function (tab, threadId) {
      prev(tab, threadId);
      const el = document.getElementById("phonepanel"); if (!el) return;
      if (tab === "home" || !tab) {
        const grid = el.querySelector(".app-grid");
        if (grid && !grid.querySelector('[data-tab="daylog"]')) {
          const btn = document.createElement("button");
          btn.className = "app-ico"; btn.dataset.tab = "daylog";
          btn.innerHTML = `<span class="ic" style="background:#34c759">📅</span><span class="nm">日程</span>`;
          btn.onclick = () => SA.openPhone("daylog");
          grid.appendChild(btn);
        }
        // bag: add 出示 nearby
      } else if (tab === "daylog") {
        const head = el.querySelector(".phd b"); if (head) head.textContent = "日程日志";
        const body = el.querySelector(".pbd");
        if (body) body.innerHTML = F.renderLog();
      } else if (tab === "bag") {
        const body = el.querySelector(".pbd");
        if (body && !body.querySelector("[data-present-near]")) {
          const bar = document.createElement("div");
          bar.style.cssText = "margin:0 0 10px";
          bar.innerHTML = `<button type="button" data-present-near style="background:#0a84ff;color:#fff;border:0;border-radius:8px;padding:8px 12px;width:100%;cursor:pointer">出示给附近的人…</button>`;
          body.insertBefore(bar, body.firstChild);
          bar.querySelector("[data-present-near]").onclick = () => {
            el.classList.add("hidden");
            F.openPresentMenu(F.resolveTarget(), { _name: "出示证件" });
          };
        }
      }
    };
  };

  F.install = function () {
    const g = G(); if (!g || g._stageF) return; g._stageF = true;
    F.ensure();
    F.installHooks();
    F.hookStreetGate && F.hookStreetGate();
    F.polishBus();
    F.polishNight();
    F.polishPhone();
    F.watchDays();
    // guard booth when on street
    setInterval(() => { try { F.ensureGuardBooth(); } catch (e) {} }, 3000);
    if (!document.getElementById("stageF-css")) {
      const st = document.createElement("style"); st.id = "stageF-css";
      st.textContent = `
        .plog{color:#f5f5f7;font-size:13px}
        .plog-row{padding:10px 0;border-bottom:1px solid #2c2c2e}
        .plog-row b{color:#0a84ff;margin-right:6px}
        .plog-row span{color:#8e8e93;font-size:11px}
        .plog-row p{margin:4px 0 0;line-height:1.35}
      `;
      document.head.appendChild(st);
    }
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageE && SP.stageD) F.install();
    else setTimeout(boot, 90);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})(window.SP || (window.SP = {}));
