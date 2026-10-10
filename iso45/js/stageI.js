/* scene-proto-45 · Stage I: 馨园扫码门禁反馈, todo完成心情, wear反馈, 物业费回执.
   Leaves Char-A appearance / NPC_SPEC alone. */
(function (SP) {
  "use strict";
  const I = (SP.stageI = {});
  const G = () => SP.game, R = () => G() && G().rules, C = () => SP.clock;
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 3000);
  const log = (t) => SP.world && SP.world.logEvent(t);
  const ps = () => G() && G().ps;
  const A = () => SP.stageA;
  const E = () => SP.stageE;
  const F = () => SP.stageF;
  const SG = () => SP.stageG;
  const SH = () => SP.stageH;

  const MOOD_BUFF = 3;
  const RECEIPT_ID = "property_fee_receipt";

  I.ensure = function () {
    const p = ps(); if (!p) return null;
    p.flags = p.flags || {};
    if (!p.todoDone) p.todoDone = {};
    if (!p.wearNotices) p.wearNotices = {};
    return p;
  };

  // ---------- 1) Light 门禁扫码 at 馨园 entrance ----------
  I.ensureScanOverlay = function () {
    let el = document.getElementById("xinscan");
    if (!el) {
      el = document.createElement("div");
      el.id = "xinscan";
      el.className = "xinscan hidden";
      el.innerHTML = `<div class="xinscan-card">
        <div class="xinscan-ico">📱</div>
        <div class="xinscan-title">馨园门禁 · 扫码</div>
        <div class="xinscan-sub"></div>
        <div class="xinscan-bar"><i></i></div>
      </div>`;
      (document.getElementById("wrap") || document.body).appendChild(el);
    }
    return el;
  };

  I.playScan = function (ok, detail, thenFn) {
    const el = I.ensureScanOverlay();
    const sub = el.querySelector(".xinscan-sub");
    const bar = el.querySelector(".xinscan-bar i");
    el.classList.remove("hidden", "ok", "bad");
    el.classList.add(ok ? "ok" : "bad");
    sub.textContent = detail || (ok ? "通行有效" : "未授权 / 已过期");
    bar.style.width = "0%";
    bar.style.transition = "none";
    requestAnimationFrame(() => {
      bar.style.transition = "width 0.7s ease";
      bar.style.width = "100%";
    });
    toast(ok ? `门铃「嘀」——扫码通过 · ${detail || ""}` : `扫码失败 · ${detail || "请续期"}`, 2800);
    if (F()) F().pushLog("scan", ok ? `馨园扫码通过：${detail || ""}` : `馨园扫码失败：${detail || ""}`, { place: "xin" });
    setTimeout(() => {
      el.classList.add("hidden");
      if (typeof thenFn === "function") thenFn();
    }, 850);
  };

  I.xinAccessDetail = function () {
    const sg = SG();
    if (sg && sg.accessOk()) {
      const left = SH() && SH().accessLeftMin ? SH().accessLeftMin() : null;
      if (left != null) return `临时通行 · 约剩 ${Math.max(0, Math.round(left / 60))} 时`;
      return "临时通行有效";
    }
    // owned xin unit also counts as resident
    try {
      const H = A() && A().ensureHousing();
      if (H && H.owned && H.owned.some((id) => String(id).indexOf("xin") >= 0)) return "住户门禁卡";
    } catch (e) {}
    return null;
  };

  I.wrapXinEnter = function () {
    const g = G(); if (!g || g._iScan) return; g._iScan = true;
    const prevGo = g.go.bind(g);
    g.go = function (p) {
      if (!p || !p.to || String(p.to).indexOf("stair_xin") !== 0) return prevGo(p);
      if (I._scanning) return;
      const detail = I.xinAccessDetail();
      const ok = !!detail;
      // hard block only when flag set
      if (!ok && ps().flags && ps().flags.block_xin_without_access) {
        I.playScan(false, "未授权，请先到物业续期", null);
        toast("门禁未开通，请先到物业续期");
        return;
      }
      I._scanning = true;
      I.playScan(ok, detail || "访客登记（演示仍可进入）", () => {
        I._scanning = false;
        prevGo(p);
      });
    };
    // spawnAt('xin') uses go or place.enter — wrap stageA.spawnAt
    const SA = A();
    if (SA && !SA._iScanSpawn) {
      SA._iScanSpawn = true;
      const prev = SA.spawnAt.bind(SA);
      SA.spawnAt = function (key) {
        if (key === "xin") {
          const detail = I.xinAccessDetail();
          I.playScan(!!detail, detail || "访客登记（演示）", () => prev(key));
          return;
        }
        return prev(key);
      };
    }
  };

  // ---------- 2) Todos auto-clear + mood buff ----------
  I.todoSnapshot = function () {
    const sh = SH();
    if (!sh || !sh.listTodos) return [];
    return sh.listTodos().map((t) => t.id);
  };

  I.applyTodoComplete = function (id) {
    I.ensure();
    if (ps().todoDone[id]) return;
    ps().todoDone[id] = { t: C().abs(), day: F() ? F().dayKey() : 0 };
    const n = ps().needs;
    if (n) {
      n.mood = Math.max(0, Math.min(100, (n.mood || 50) + MOOD_BUFF));
      G().hud && G().hud(true);
    }
    const labels = {
      gate: "门岗登记", laundry: "收好衣服", dirty: "换洗衣物",
      access: "门禁续期", coupon: "使用押金优惠"
    };
    toast(`待办完成：${labels[id] || id} · 心情+${MOOD_BUFF}`, 2800);
    if (F()) F().pushLog("todo_done", `完成待办：${labels[id] || id}`, { place: id === "gate" ? "gate" : id === "access" || id === "coupon" ? "xin" : "room_xin_102" });
  };

  I.watchTodos = function () {
    I._prevTodos = I.todoSnapshot();
    setInterval(() => {
      try {
        I.ensure();
        const now = I.todoSnapshot();
        const prev = I._prevTodos || [];
        prev.forEach((id) => {
          if (now.indexOf(id) < 0) I.applyTodoComplete(id);
        });
        // reset todoDone when todo reappears (e.g. new laundry)
        now.forEach((id) => {
          if (prev.indexOf(id) < 0) delete ps().todoDone[id];
        });
        I._prevTodos = now;
      } catch (e) {}
    }, 1800);
  };

  // mark coupon used / gate done etc. already clears todos via listTodos logic

  // ---------- 3) Clearer wear / worn_h feedback ----------
  I.wearThresholds = function () {
    const thr = (R().data.laundry && R().data.laundry.wear_dirty_h) || 20;
    return [
      { k: "q1", at: thr * 0.35, msg: "衣服穿了一阵，还算清爽。" },
      { k: "q2", at: thr * 0.6, msg: "领口有点味儿了，改天该洗。" },
      { k: "q3", at: thr * 0.85, msg: "这件穿太久了，尽快换洗（馨园有洗衣机）。" },
      { k: "full", at: thr, msg: "衣服已经脏了——换下来洗吧。" }
    ];
  };

  I.watchWear = function () {
    setInterval(() => {
      try {
        I.ensure();
        const cl = ps().clothes; if (!cl) return;
        const wh = cl.worn_h || 0;
        const notices = ps().wearNotices;
        I.wearThresholds().forEach((t) => {
          if (wh >= t.at && !notices[t.k]) {
            notices[t.k] = true;
            toast(t.msg, 3200);
            if (F() && (t.k === "q3" || t.k === "full")) {
              F().pushLog("wear", t.msg, { place: "room_xin_102" });
            }
            G().hud && G().hud(true);
          }
        });
        // reset notices after change_clothes (worn_h→0)
        if (wh < 1) ps().wearNotices = {};
      } catch (e) {}
    }, 2200);
  };

  I.polishClothChip = function () {
    // enrich chip with worn % when stageH chip exists
    const sh = SH(); if (!sh || sh._iChip) return;
    sh._iChip = true;
    const prev = sh.clothesChip.bind(sh);
    sh.clothesChip = function () {
      let html = prev();
      try {
        const cl = ps().clothes;
        const thr = (R().data.laundry && R().data.laundry.wear_dirty_h) || 20;
        if (cl && thr) {
          const pct = Math.min(100, Math.round((cl.worn_h || 0) / thr * 100));
          html = html.replace("</span>", ` · 穿${pct}%</span>`);
        }
      } catch (e) {}
      return html;
    };
  };

  I.nudgeWearOnShift = function () {
    // when rules fire shift_paid / sleep, worn already ticks; add toast on shift end via onRuleEvents
    const g = G(); if (!g || g._iWearEv) return; g._iWearEv = true;
    const prev = g.onRuleEvents && g.onRuleEvents.bind(g);
    if (!prev) return;
    g.onRuleEvents = function (evs) {
      prev(evs);
      try {
        (evs || []).forEach((e) => {
          if (e.type === "shift_paid") {
            toast("下班了，工装也更脏了些（穿着磨损↑）", 2600);
          }
          if (e.type === "clothes_dirty") {
            toast("衣服穿脏了——打开手机日程或去馨园1-02洗衣", 3200);
          }
        });
      } catch (err) {}
    };
  };

  // ---------- 4) 物业费 receipt item ----------
  I.installReceiptItem = function () {
    const SE = E(); if (!SE || SE._iPropReceipt) return;
    SE._iPropReceipt = true;
    // patch giveItem meta for our id
    const prevGive = SE.giveItem.bind(SE);
    SE.giveItem = function (id, note) {
      if (id === RECEIPT_ID) {
        const bag = SE.ensureBag();
        const existing = bag.find((x) => x.id === id);
        if (existing) {
          existing.note = note || existing.note;
          existing.t = SE.stamp();
          existing.label = "物业费缴纳凭证";
          existing.emoji = "🏢";
          existing.kind = "doc";
          toast(`入手 🏢 物业费缴纳凭证`);
          return existing;
        }
        const it = {
          id, label: "物业费缴纳凭证", emoji: "🏢", kind: "doc",
          note: note || "", t: SE.stamp(), qty: 1
        };
        bag.unshift(it);
        if (bag.length > 24) bag.length = 24;
        toast(`入手 🏢 物业费缴纳凭证`);
        log("获得 物业费缴纳凭证");
        return it;
      }
      return prevGive(id, note);
    };

    const SF = F();
    if (SF) {
      if (SF.DOC_IDS.indexOf(RECEIPT_ID) < 0) SF.DOC_IDS.push(RECEIPT_ID);
      const O = SF.OUTCOMES;
      if (O) {
        O.property = O.property || {};
        O.property[RECEIPT_ID] = { ok: true, text: "物业小吴：物业费凭证收到，账上平了。门禁可按此续。" };
        O.landlord = O.landlord || {};
        O.landlord[RECEIPT_ID] = { ok: true, text: "刘姐：物业费交了就好，省得他们催我。" };
        O.guard = O.guard || {};
        O.guard[RECEIPT_ID] = { ok: true, text: "门岗：有缴费凭证，进出我给你放行备注。" };
        O.police = O.police || {};
        O.police[RECEIPT_ID] = { ok: false, text: "小张：物业费单留给物业，派出所用不上。" };
        O.hospital = O.hospital || {};
        O.hospital[RECEIPT_ID] = { ok: false, text: "小周：这不是医保材料哦。" };
        O.fire = O.fire || {};
        O.fire[RECEIPT_ID] = { ok: false, text: "小陈：缴费单请找物业办公室。" };
        O.aunt = O.aunt || {};
        O.aunt[RECEIPT_ID] = { ok: true, text: "王阿姨：交物业费啦？年轻人真懂事。" };
      }
    }

    // wrap renewByFee to grant receipt
    const sh = SH();
    if (sh && !sh._iFeeReceipt) {
      sh._iFeeReceipt = true;
      const prev = sh.renewByFee.bind(sh);
      sh.renewByFee = function () {
        const before = ps().money;
        const ok = prev();
        if (ok) {
          const fee = before - ps().money;
          SE.giveItem(RECEIPT_ID, `馨园物业费 ¥${fee || 45} · 可用于续期证明`);
          // presenting receipt to property can also renew — handled if they present
        }
        return ok;
      };
    }

    // presenting property fee receipt to property extends access
    const sg = SG();
    if (sg && !sg._iFeeReward) {
      sg._iFeeReward = true;
      const prev = sg.applyReceiptRewards.bind(sg);
      sg.applyReceiptRewards = function (target, itemId) {
        prev(target, itemId);
        if (target === "property" && itemId === RECEIPT_ID && SH()) {
          SH().extendAccess(24, "出示物业费凭证");
        }
      };
    }
  };

  // ---------- 5) civic sets helper ----------
  I.civicSetsReady = function () {
    try {
      if (SH() && SH().civicSetsReady) return SH().civicSetsReady();
      const spec = SP.stageD && SP.stageD.NPC_SPEC;
      return !!(spec && window.ACTORS && window.ACTORS[spec.civic_police.set] && window.ACTORS[spec.civic_fire.set] && window.ACTORS[spec.civic_hospital.set]);
    } catch (e) { return false; }
  };

  // ---------- CSS + install ----------
  I.install = function () {
    const g = G(); if (!g || g._stageI) return; g._stageI = true;
    I.ensure();
    I.wrapXinEnter();
    I.watchTodos();
    I.watchWear();
    I.polishClothChip();
    I.nudgeWearOnShift();
    I.installReceiptItem();
    if (!document.getElementById("stageI-css")) {
      const st = document.createElement("style"); st.id = "stageI-css";
      st.textContent = `
        .xinscan{position:absolute;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;
          background:rgba(0,0,0,.35);pointer-events:none}
        .xinscan.hidden{display:none}
        .xinscan-card{background:#1c1c1e;color:#f5f5f7;border-radius:16px;padding:22px 28px;min-width:220px;text-align:center;
          box-shadow:0 12px 40px rgba(0,0,0,.45)}
        .xinscan-ico{font-size:36px;margin-bottom:6px}
        .xinscan-title{font-weight:700;margin-bottom:4px}
        .xinscan-sub{font-size:13px;color:#8e8e93;margin-bottom:14px;min-height:1.2em}
        .xinscan.ok .xinscan-sub{color:#30d158}
        .xinscan.bad .xinscan-sub{color:#ff9f0a}
        .xinscan-bar{height:4px;background:#2c2c2e;border-radius:2px;overflow:hidden}
        .xinscan-bar i{display:block;height:100%;width:0;background:#0a84ff;border-radius:2px}
        .xinscan.ok .xinscan-bar i{background:#30d158}
        .xinscan.bad .xinscan-bar i{background:#ff9f0a}
      `;
      document.head.appendChild(st);
    }
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageH && SP.stageG && SP.stageE) I.install();
    else setTimeout(boot, 120);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.SP || (window.SP = {}));
