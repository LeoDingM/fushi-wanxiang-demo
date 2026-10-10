/* scene-proto-45 · Stage H: access renew, landlord coupon WeChat, dirty-clothes HUD, daylog todos.
   Avoids Char-A appearance / NPC_SPEC / civic exteriors. */
(function (SP) {
  "use strict";
  const H = (SP.stageH = {});
  const G = () => SP.game, R = () => G() && G().rules, C = () => SP.clock;
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 3000);
  const log = (t) => SP.world && SP.world.logEvent(t);
  const ps = () => G() && G().ps;
  const A = () => SP.stageA;
  const E = () => SP.stageE;
  const F = () => SP.stageF;
  const SG = () => SP.stageG;

  const ACCESS_HOURS = 24;
  const WARN_MIN = 120; // remind when < 2 game-hours left
  const PROP_FEE = () => {
    try {
      const p = R().data.utilities && R().data.utilities.fixed && R().data.utilities.fixed.property;
      return (p && p.amount) || 45;
    } catch (e) { return 45; }
  };

  H.ensure = function () {
    const p = ps(); if (!p) return null;
    p.flags = p.flags || {};
    if (!p.clothes) {
      try {
        const L = R() && R().data.laundry;
        if (L) p.clothes = { clean: L.start.clean, dirty: L.start.dirty, worn_h: 0, washer: null, rack: {} };
      } catch (e) {}
    }
    return p;
  };

  // ---------- 1) Access expiry reminder + renew ----------
  H.accessLeftMin = function () {
    H.ensure();
    const fl = ps().flags;
    if (!fl.xin_access_until) return null;
    return fl.xin_access_until - C().abs();
  };

  H.extendAccess = function (hours, reason) {
    H.ensure();
    const fl = ps().flags;
    const abs = C().abs();
    const base = Math.max(abs, fl.xin_access_until || abs);
    fl.xin_access_until = base + (hours || ACCESS_HOURS) * 60;
    fl.xin_access = true;
    fl.access_expired_notified = false;
    fl.access_warn_notified = false;
    toast(`馨园门禁已续期 +${hours || ACCESS_HOURS} 游戏时（${reason || "续期"}）`, 3400);
    if (F()) F().pushLog("access_renew", `门禁续期 +${hours || ACCESS_HOURS}h · ${reason || ""}`, { place: "xin" });
    if (E()) E().wxPush("property", `（系统）临时门禁已续期（${reason || "办理完成"}）。`, true);
  };

  H.renewByStamp = function () {
    H.ensure();
    if (!E() || !E().hasItem("police_stamp")) {
      toast("背包没有派出所业务章证明，可去派出所盖章后再出示物业");
      return false;
    }
    // mark shown to property if not already
    if (F() && !F().alreadyShown("property", "police_stamp")) {
      F().presentItem("property", "police_stamp");
    }
    H.extendAccess(ACCESS_HOURS, "出示业务章");
    return true;
  };

  H.renewByFee = function () {
    H.ensure();
    const fee = PROP_FEE();
    if (ps().money < fee) { toast(`钱不够交物业费（¥${fee}）`); return false; }
    ps().money -= fee;
    ps().stats = ps().stats || {};
    ps().stats.spent = (ps().stats.spent || 0) + fee;
    if (G().payCard) G().payCard({ amount: fee, method: "微信", to: "馨园物业", what: "临时门禁续期·物业费" });
    H.extendAccess(ACCESS_HOURS, `缴纳物业费 ¥${fee}`);
    return true;
  };

  H.openRenewMenu = function () {
    const left = H.accessLeftMin();
    const leftH = left == null ? "未开通" : (left <= 0 ? "已过期" : `约剩 ${Math.max(0, Math.round(left / 60))} 时`);
    const fee = PROP_FEE();
    const opts = [
      { id: "status", ok: true, label: `查看门禁状态（${leftH}）`,
        fn: () => { toast(`馨园临时门禁：${leftH}`); return null; } },
      { id: "stamp", ok: true, label: "出示业务章续期（+24 游戏时）",
        fn: () => { H.renewByStamp(); return null; } },
      { id: "fee", ok: true, label: `缴纳物业费 ¥${fee} 续期（+24 游戏时）`,
        fn: () => { H.renewByFee(); return null; } },
      { id: "cancel", ok: true, label: "关掉", fn: () => null }
    ];
    G().openMenu({ _name: "馨园门禁续期", interact: "notice" }, opts);
  };

  H.watchAccess = function () {
    setInterval(() => {
      try {
        H.ensure();
        const fl = ps().flags;
        if (!fl.xin_access_until) return;
        const left = fl.xin_access_until - C().abs();
        if (left > 0 && left <= WARN_MIN && !fl.access_warn_notified) {
          fl.access_warn_notified = true;
          toast("提醒：馨园临时门禁快到期了，可出示业务章或交物业费续期", 4000);
          if (F()) F().pushLog("access_warn", "门禁即将到期提醒", { place: "xin" });
          if (E()) E().wxPush("property", "（系统）您的临时门禁即将到期，请续期。", true);
        }
        if (left <= 0 && fl.xin_access && !fl.access_expired_notified) {
          fl.xin_access = false;
          fl.access_expired_notified = true;
          toast("馨园临时门禁已过期。找物业续期（章/物业费）", 4000);
          if (F()) F().pushLog("access_expired", "门禁已过期", { place: "xin" });
        }
      } catch (e) {}
    }, 2000);
  };

  H.polishAccessUI = function () {
    const g = G(); if (!g || g._hAccess) return; g._hAccess = true;
    const prev = g.use.bind(g);
    g.use = function (o) {
      if (o && (o.id === "xin_notice" || o.id === "xin_mail" || o.id === "xin_dir")) {
        H.ensure();
        const fl = ps().flags;
        if (fl.xin_access_until || fl.property_receipt_filed) {
          // offer renew alongside normal / present (stageF may already menu)
          const left = H.accessLeftMin();
          if (left != null && (left < WARN_MIN || left <= 0 || !SG().accessOk())) {
            const opts = [
              { id: "renew", ok: true, label: "办理门禁续期…", fn: () => { H.openRenewMenu(); return null; } },
              { id: "normal", ok: true, label: "看公告/信箱", fn: () => { o._skipPresent = true; const t = prev(o); o._skipPresent = false; return t; } }
            ];
            if (F() && F().docsInBag && F().docsInBag().length) {
              opts.splice(1, 0, {
                id: "present", ok: true, label: "出示背包证件…",
                fn: () => { F().openPresentMenu("property", o); return null; }
              });
            }
            g.openMenu(Object.assign({}, o, { _name: "馨园物业 · 门禁" }), opts);
            return null;
          }
        }
      }
      return prev(o);
    };
  };

  // stamp present to property also renews if access exists/expired
  H.wrapPresentRewards = function () {
    const sg = SG(); if (!sg || sg._hReward) return;
    sg._hReward = true;
    const prev = sg.applyReceiptRewards.bind(sg);
    sg.applyReceiptRewards = function (target, itemId) {
      prev(target, itemId);
      if (target === "property" && itemId === "police_stamp") {
        H.ensure();
        // renew/extend whenever stamp accepted by property
        H.extendAccess(ACCESS_HOURS, "出示业务章");
      }
    };
  };

  // ---------- 2) Landlord WeChat deposit coupon branch ----------
  H.injectLandlordCouponChat = function () {
    H.ensure();
    const fl = ps().flags;
    if (!fl.deposit_discount || fl.deposit_discount_used || fl.wx_coupon_pushed) return;
    fl.wx_coupon_pushed = true;
    if (E()) {
      E().wxPush("landlord", `材料我看过了。你下次租馨园那套，押金我给你少收 ¥${fl.deposit_discount}，微信说一声就行。`, true);
    }
    if (F()) F().pushLog("wx_coupon", `房东微信：押金优惠 ¥${fl.deposit_discount}`, { place: "housing" });
  };

  H.polishWechat = function () {
    const SA = A(); if (!SA || SA._hWx) return;
    SA._hWx = true;
    const prevThreads = SA.threads.bind(SA);
    SA.threads = function () {
      const chat = prevThreads();
      H.ensure();
      const fl = ps().flags;
      const th = chat.landlord;
      if (th && fl.deposit_discount && !fl.deposit_discount_used) {
        // ensure coupon reply exists
        th.replies = (th.replies || []).slice();
        if (!th.replies.some((r) => r.id === "coupon")) {
          th.replies.unshift({
            id: "coupon",
            label: "刘姐，押金优惠还作数吗？",
            them: [
              `作数呀，馨园押金少 ¥${fl.deposit_discount}，手机租房页也能看到。`,
              `当然，出示回执那天我就记上了，抵 ¥${fl.deposit_discount}。`,
              `嗯，优惠还在，你租的时候直接扣就行。`
            ]
          });
        }
        if (!th.replies.some((r) => r.id === "thanks_coupon")) {
          th.replies.push({
            id: "thanks_coupon",
            label: "谢谢刘姐，我记着优惠了",
            them: [
              "客气，好租客应该的。",
              "嗯嗯，有合适的早点定。",
              "好，签约有问题再问我。"
            ]
          });
        }
      }
      return chat;
    };
    // when discount first granted, push chat
    const sg = SG();
    if (sg && !sg._hWxReward) {
      sg._hWxReward = true;
      const prev = sg.applyReceiptRewards.bind(sg);
      sg.applyReceiptRewards = function (target, itemId) {
        prev(target, itemId);
        if (target === "landlord" && (itemId === "police_receipt" || itemId === "police_stamp")) {
          H.injectLandlordCouponChat();
        }
      };
    }
  };

  // ---------- 3) Dirty-clothes HUD ----------
  H.clothesChip = function () {
    H.ensure();
    const cl = ps().clothes; if (!cl) return "";
    let dirtyWear = false;
    try { dirtyWear = !!(R().clothes && R().clothes.isDirty(ps())); } catch (e) {
      const thr = (R().data.laundry && R().data.laundry.wear_dirty_h) || 20;
      dirtyWear = (cl.worn_h || 0) >= thr;
    }
    const rack = cl.rack && cl.rack.balcony;
    const parts = [];
    if (dirtyWear) parts.push("衣臭");
    if (cl.dirty > 0) parts.push(`脏${cl.dirty}`);
    if (cl.washer) parts.push(C().abs() >= cl.washer.done ? "洗好" : "在洗");
    if (rack) {
      const ready = rack.wet <= ((R().data.laundry && R().data.laundry.collect_max_wet) || 0.15);
      parts.push(ready ? "可收衣" : "晾着");
    }
    if (!parts.length && cl.clean >= 0) parts.push(`净${cl.clean}`);
    const cls = dirtyWear || cl.dirty >= 3 ? "warn" : "";
    return `<span class="cloth-chip ${cls}" title="洗衣状态">👕 ${parts.join("·")}</span>`;
  };

  H.polishHud = function () {
    const g = G(); if (!g || g._hHud) return; g._hHud = true;
    const prev = g.hud.bind(g);
    g.hud = function (force) {
      prev(force);
      const el = document.getElementById("needs");
      if (!el) return;
      if (!el.querySelector(".cloth-chip")) {
        el.insertAdjacentHTML("beforeend", H.clothesChip());
      } else {
        const chip = el.querySelector(".cloth-chip");
        const tmp = document.createElement("div");
        tmp.innerHTML = H.clothesChip();
        if (tmp.firstChild) chip.replaceWith(tmp.firstChild);
      }
    };
    if (!document.getElementById("stageH-css")) {
      const st = document.createElement("style"); st.id = "stageH-css";
      st.textContent = `
        .cloth-chip{margin-left:8px;padding:2px 8px;border-radius:8px;background:#2c2c2e;color:#f5f5f7;font-size:12px}
        .cloth-chip.warn{background:#5c3a00;color:#ffd60a}
        .ptodo{margin:0 0 12px;padding:10px;border-radius:10px;background:#1c1c1e}
        .ptodo h4{margin:0 0 8px;color:#ffd60a;font-size:13px}
        .ptodo-row{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #2c2c2e;color:#f5f5f7;font-size:13px}
        .ptodo-row button{background:#0a84ff;color:#fff;border:0;border-radius:8px;padding:5px 8px;cursor:pointer;flex:none}
      `;
      document.head.appendChild(st);
    }
    // wear nudge: after work / time, toast once when becomes dirty
    setInterval(() => {
      try {
        H.ensure();
        const cl = ps().clothes; if (!cl || !R().clothes) return;
        const dirty = R().clothes.isDirty(ps());
        if (dirty && !ps().flags.clothes_dirty_toasted) {
          ps().flags.clothes_dirty_toasted = true;
          toast("身上这件穿太久了，有味儿了——换洗吧（馨园1-02 有洗衣机）", 3600);
          if (F()) F().pushLog("clothes_dirty", "衣服穿脏了，该洗", { place: "room_xin_102" });
        }
        if (!dirty) ps().flags.clothes_dirty_toasted = false;
        // light wear from being awake (rules also tick; this nudges demo)
      } catch (e) {}
    }, 4000);
  };

  // after change_clothes, clear dirty toast flag appropriately — via wrapping start
  H.polishLaundryFeed = function () {
    const g = G(); if (!g || g._hLaundryFeed) return; g._hLaundryFeed = true;
    const prev = g.start.bind(g);
    g.start = function (id, o) {
      const r = prev(id, o);
      if (id === "change_clothes" || id === "wash_clothes") {
        ps().flags = ps().flags || {};
        if (id === "change_clothes") ps().flags.clothes_dirty_toasted = false;
        g.hud && g.hud(true);
        if (F() && id === "wash_clothes") F().pushLog("laundry", "开始洗衣服", { place: "room_xin_102" });
      }
      if (id === "collect_clothes" && F()) F().pushLog("laundry", "收好干衣服", { place: "room_xin_102" });
      return r;
    };
  };

  // ---------- 4) Day-log todos ----------
  H.listTodos = function () {
    H.ensure();
    const fl = ps().flags;
    const todos = [];
    if (fl.gate_followup_pending && !fl.gate_followup_done) {
      todos.push({ id: "gate", text: "门岗还要找你登记（夜间来电未接）", place: "gate" });
    }
    const cl = ps().clothes;
    if (cl && cl.rack && cl.rack.balcony) {
      const ready = cl.rack.balcony.wet <= ((R().data.laundry && R().data.laundry.collect_max_wet) || 0.15);
      todos.push({
        id: "laundry",
        text: ready ? "阳台衣服干了，去收" : "阳台还晾着衣服",
        place: "room_xin_102"
      });
    }
    try {
      if (cl && R().clothes && R().clothes.isDirty(ps())) {
        todos.push({ id: "dirty", text: "衣服穿脏了，去馨园洗衣", place: "room_xin_102" });
      }
    } catch (e) {}
    const left = H.accessLeftMin();
    if (left != null && left <= WARN_MIN) {
      todos.push({
        id: "access",
        text: left <= 0 ? "馨园门禁已过期，去续期" : "馨园门禁快到期，去续期",
        place: "xin"
      });
    }
    if (fl.deposit_discount && !fl.deposit_discount_used) {
      todos.push({ id: "coupon", text: `房东押金优惠 ¥${fl.deposit_discount} 未使用`, place: "housing" });
    }
    return todos;
  };

  H.renderTodos = function () {
    const todos = H.listTodos();
    if (!todos.length) return "";
    return `<div class="ptodo"><h4>待办 ${todos.length}</h4>${todos.map((t) => `
      <div class="ptodo-row"><span>${t.text}</span>
      <button type="button" data-todo-jump="${t.place}">前往</button></div>`).join("")}</div>`;
  };

  H.polishTodos = function () {
    const sg = SG(); if (!sg || sg._hTodo) return;
    sg._hTodo = true;
    const prev = sg.renderCalendar.bind(sg);
    sg.renderCalendar = function () {
      return H.renderTodos() + prev();
    };
    const prevBind = sg.bindCalendar.bind(sg);
    sg.bindCalendar = function (body) {
      prevBind(body);
      if (!body) return;
      body.querySelectorAll("[data-todo-jump]").forEach((b) => {
        b.onclick = () => {
          const place = b.dataset.todoJump;
          if (place === "housing" && A()) {
            const el = document.getElementById("phonepanel");
            if (el) { /* stay in phone */ }
            A().openPhone("housing");
            return;
          }
          sg.jumpTo(place);
        };
      });
    };
  };

  // ---------- 5) optional civic shot helper (no rewrite) ----------
  H.civicSetsReady = function () {
    try {
      const spec = SP.stageD && SP.stageD.NPC_SPEC;
      if (!spec) return false;
      const sets = [spec.civic_police && spec.civic_police.set, spec.civic_fire && spec.civic_fire.set, spec.civic_hospital && spec.civic_hospital.set];
      return sets.every((s) => s && window.ACTORS && window.ACTORS[s]);
    } catch (e) { return false; }
  };

  // ---------- install ----------
  H.install = function () {
    const g = G(); if (!g || g._stageH) return; g._stageH = true;
    H.ensure();
    H.wrapPresentRewards();
    H.polishWechat();
    H.polishAccessUI();
    H.watchAccess();
    H.polishHud();
    H.polishLaundryFeed();
    H.polishTodos();
    // housing renew tip
    const SA = A();
    if (SA && !SA._hPhoneRenew) {
      SA._hPhoneRenew = true;
      const prev = SA.openPhone.bind(SA);
      SA.openPhone = function (tab, threadId) {
        prev(tab, threadId);
        if (tab === "housing" || tab === "daylog") {
          const el = document.getElementById("phonepanel");
          const body = el && el.querySelector(".pbd");
          if (body && tab === "housing") {
            const left = H.accessLeftMin();
            if (left != null) {
              const tip = document.createElement("p");
              tip.className = "hint";
              tip.style.color = left <= 0 ? "#ff6b6b" : (left < WARN_MIN ? "#ffd60a" : "#8e8e93");
              tip.textContent = left <= 0
                ? "馨园门禁已过期 — 到物业公告处续期（章/物业费）"
                : `馨园门禁约剩 ${Math.round(left / 60)} 游戏时`;
              tip.style.cursor = "pointer";
              tip.onclick = () => { el.classList.add("hidden"); H.openRenewMenu(); };
              body.insertBefore(tip, body.firstChild);
            }
          }
        }
        if (tab === "wechat" && threadId === "landlord") {
          H.injectLandlordCouponChat();
        }
      };
    }
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageG && SP.stageF) H.install();
    else setTimeout(boot, 110);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.SP || (window.SP = {}));
