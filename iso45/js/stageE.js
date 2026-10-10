/* scene-proto-45 · Stage E: inventory (civic docs/meds), bus ride anim, night mini-events, xin_102 wiring. */
(function (SP) {
  "use strict";
  const E = (SP.stageE = {});
  const G = () => SP.game, R = () => G() && G().rules, C = () => SP.clock;
  const prices = () => (R() && R().data.prices) || {};
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 2600);
  const log = (t) => SP.world && SP.world.logEvent(t);
  const ps = () => G() && G().ps;
  const A = () => SP.stageA;
  const D = () => SP.stageD;

  const ITEM_META = {
    police_receipt: { label: "派出所报案回执", emoji: "📄", kind: "doc" },
    police_stamp: { label: "派出所业务章证明", emoji: "🔏", kind: "doc" },
    fine_receipt: { label: "罚款缴纳凭证", emoji: "🧾", kind: "doc" },
    rx_slip: { label: "门诊处方笺", emoji: "📋", kind: "doc" },
    med_cold: { label: "感冒药", emoji: "💊", kind: "med" },
    med_band: { label: "创可贴", emoji: "🩹", kind: "med" },
    med_vitamins: { label: "维生素C", emoji: "🍊", kind: "med" },
    fire_card: { label: "灭火器四字诀卡片", emoji: "🧯", kind: "doc" }
  };

  E.ensureBag = function () {
    const p = ps(); if (!p) return [];
    if (!p.bag) p.bag = [];
    return p.bag;
  };
  E.hasItem = function (id) { return E.ensureBag().some((x) => x.id === id); };
  E.giveItem = function (id, note) {
    const meta = ITEM_META[id] || { label: id, emoji: "📦", kind: "misc" };
    const bag = E.ensureBag();
    if (meta.kind === "doc" && bag.some((x) => x.id === id)) {
      const it = bag.find((x) => x.id === id);
      it.note = note || it.note; it.t = E.stamp();
      return it;
    }
    const it = { id, label: meta.label, emoji: meta.emoji, kind: meta.kind, note: note || "", t: E.stamp(), qty: 1 };
    bag.unshift(it);
    if (bag.length > 24) bag.length = 24;
    toast(`入手 ${meta.emoji} ${meta.label}`);
    log(`获得 ${meta.label}`);
    return it;
  };
  E.removeItem = function (id) {
    const bag = E.ensureBag();
    const i = bag.findIndex((x) => x.id === id);
    if (i >= 0) bag.splice(i, 1);
  };
  E.stamp = function () {
    try { return (A() && A().clockStamp && A().clockStamp()) || (C().clockLabel && C().clockLabel()) || ""; } catch (e) { return ""; }
  };
  E.wxPush = function (tid, text, fromThem) {
    try {
      if (!A() || !A().threads) return;
      const chat = A().threads(), th = chat[tid]; if (!th) return;
      th.msgs.push({ who: fromThem ? "them" : "me", text });
    } catch (e) {}
  };

  // ---------- hook Stage D civic outcomes → bag + WeChat ----------
  E.hookCivic = function () {
    const SD = D(); if (!SD || SD._invHooked) return;
    SD._invHooked = true;
    const wrap = (name, after) => {
      const prev = SD[name] && SD[name].bind(SD);
      if (!prev) return;
      // wrap menu builders by patching give sites inside use paths via monkey on ensure after actions
    };
    // Patch give points by wrapping the ensure civic state setters used in menus —
    // intercept via Object.define on police filed etc. is messy; instead wrap openMenu opts after policeMenu runs.
    const patchMenuFns = (fnName) => {
      const prev = SD[fnName].bind(SD);
      SD[fnName] = function (o) {
        const ret = prev(o);
        const m = G().menu;
        if (!m || !m.opts) return ret;
        m.opts.forEach((opt) => {
          if (!opt.fn || opt._eWrapped) return;
          const raw = opt.fn;
          opt._eWrapped = true;
          opt.fn = function () {
            const before = JSON.stringify((ps().civic) || {});
            const r = raw();
            E.afterCivicAction(fnName, opt.id, before);
            return r;
          };
        });
        return ret;
      };
    };
    ["policeMenu", "policeStamp", "hospitalNurse", "hospitalDoctor", "pharmacyMenu", "fireDuty", "fireGear"].forEach(patchMenuFns);
  };
  E.afterCivicAction = function (src, optId) {
    const cv = (ps().civic) || {};
    if (src === "policeMenu" && optId === "report" && cv.police && cv.police.filed) {
      E.giveItem("police_receipt", "井槐报警字〔演示〕回执 · 可给物业/房东查阅");
      E.wxPush("property", "（系统）租户已在派出所报案，回执在手机背包。", true);
      E.wxPush("landlord", "刘姐，我去派出所备了案，回执在手机里。", false);
      E.wxPush("landlord", "好的，有进展跟我说一声。", true);
    }
    if (src === "policeStamp" && optId === "stamp" && cv.police && cv.police.stamped) {
      E.giveItem("police_stamp", "已盖「井槐里派出所」业务章");
    }
    if (src === "policeMenu" && optId === "fine" && cv.police && cv.police.finePaid) {
      E.giveItem("fine_receipt", "乱扔垃圾罚款已缴清");
      E.wxPush("property", "（系统）收到环卫罚款凭证，感谢配合。", true);
    }
    if (src === "hospitalDoctor" && optId === "see" && cv.hospital && cv.hospital.script) {
      E.giveItem("rx_slip", "处方：" + cv.hospital.script);
      E.wxPush("aunt", "阿姨，我刚看完病，医生开了点药。", false);
      E.wxPush("aunt", "多喝热水啊！别熬夜。", true);
    }
    if (src === "pharmacyMenu") {
      if (optId === "rx" && cv.hospital && cv.hospital.bought) {
        E.giveItem("med_cold", "按疗程服用 · 处方药");
        E.wxPush("roommate", "默子吃药了记得设个闹钟哈哈。", true);
      }
      if (optId === "cold") E.giveItem("med_cold", "自购感冒药");
      if (optId === "band") E.giveItem("med_band", "外伤备用");
      if (optId === "vit") E.giveItem("med_vitamins", "日常补充");
    }
    if ((src === "fireDuty" && (optId === "drill" || optId === "tour")) || (src === "fireGear" && optId === "ext")) {
      if (ps().flags && ps().flags.knowledge_extinguisher) {
        E.giveItem("fire_card", "提拔握压 · 消防站小陈讲解");
        E.wxPush("property", "（系统）欢迎参加消防宣传，卡片已放入背包。", true);
      }
    }
  };

  E.useBagItem = function (id) {
    const bag = E.ensureBag();
    const it = bag.find((x) => x.id === id); if (!it) return toast("背包里没有这件");
    if (it.kind === "med") {
      const n = ps().needs || {};
      if (id === "med_cold") { n.energy = Math.min(100, (n.energy || 0) + 12); n.mood = Math.min(100, (n.mood || 0) + 6); toast("吃了感冒药，好受点了"); }
      else if (id === "med_band") { n.hygiene = Math.min(100, (n.hygiene || 0) + 5); n.mood = Math.min(100, (n.mood || 0) + 3); toast("贴上创可贴"); }
      else if (id === "med_vitamins") { n.energy = Math.min(100, (n.energy || 0) + 8); n.mood = Math.min(100, (n.mood || 0) + 4); toast("嚼了维生素"); }
      it.qty = (it.qty || 1) - 1;
      if (it.qty <= 0) E.removeItem(id);
      G().hud && G().hud();
      if (A() && A().openPhone) A().openPhone("bag");
      return;
    }
    // docs: show detail + optional share to wechat
    toast(`${it.emoji} ${it.label}${it.note ? " · " + it.note : ""}`);
  };

  E.renderBag = function () {
    const bag = E.ensureBag();
    if (!bag.length) return `<div class="pbag"><p class="hint">背包空空的。去派出所/医院/消防站办事会收到回执与药品。</p></div>`;
    return `<div class="pbag">${bag.map((it) => `
      <div class="pbag-row">
        <span class="em">${it.emoji || "📦"}</span>
        <span class="info"><b>${it.label}${it.qty > 1 ? " ×" + it.qty : ""}</b>
        <i>${it.note || it.kind}${it.t ? " · " + it.t : ""}</i></span>
        <button type="button" data-bag="${it.id}">${it.kind === "med" ? "使用" : "查看"}</button>
      </div>`).join("")}</div>`;
  };

  // ---------- bus ride animation ----------
  E.busRiding = false;
  E.rideBus = function (dest, fare, mins, mode) {
    // mode: 'anim' | 'skip'
    const SA = A(); if (!SA) return;
    SA.closeMenus && SA.closeMenus();
    if (ps().money < fare) return toast("钱不够坐公交");
    ps().money -= fare; ps().stats = ps().stats || {}; ps().stats.spent = (ps().stats.spent || 0) + fare;
    if (G().payCard) G().payCard({ amount: fare, method: "公交卡/微信", to: "公交集团", what: `公交 → ${dest.name}` });
    const from = { x: SP.player.x, y: SP.player.y };
    const to = { x: dest.x + 1.2, y: dest.y + 1.5 };
    if (SP.world.interior) {
      G().switchScene("street", [from.x, from.y, "E"]);
    }
    if (mode === "skip") {
      const abs0 = C().abs();
      if (C().skipTo) C().skipTo(abs0 + mins, 1.0); else C().min = (C().min || 0) + mins;
      SP.player.x = to.x; SP.player.y = to.y;
      if (SP.player.setDir) SP.player.setDir(dest.x < 0 ? "E" : "W");
      toast(`到站 · ${dest.name}（跳过车程 ${mins} 分钟）`); log(`公交到达 ${dest.name}`);
      return;
    }
    // animated ride
    E.busRiding = true;
    const dur = prices().bus_ride_anim_sec != null ? prices().bus_ride_anim_sec : 2.8;
    const overlay = E.ensureBusOverlay();
    overlay.classList.remove("hidden");
    overlay.querySelector(".bus-cap").textContent = `行驶中 → ${dest.name}（车程约 ${mins} 分钟）`;
    const skipBtn = overlay.querySelector("[data-bus-skip]");
    let done = false;
    const finish = (skipped) => {
      if (done) return; done = true;
      E.busRiding = false;
      overlay.classList.add("hidden");
      const abs0 = C().abs();
      if (C().skipTo) C().skipTo(abs0 + mins, skipped ? 0.6 : 0.9); else C().min = (C().min || 0) + mins;
      SP.player.x = to.x; SP.player.y = to.y;
      if (SP.player.setDir) SP.player.setDir(dest.x < 0 ? "E" : "W");
      SP.player.hidden = false;
      toast(`到站 · ${dest.name}`); log(`公交到达 ${dest.name}`);
    };
    skipBtn.onclick = () => finish(true);
    SP.player.hidden = true;
    const t0 = performance.now();
    const tick = (now) => {
      if (done) return;
      const u = Math.min(1, (now - t0) / (dur * 1000));
      const ease = u * u * (3 - 2 * u);
      SP.player.x = from.x + (to.x - from.x) * ease;
      SP.player.y = from.y + (to.y - from.y) * ease;
      // slight camera follow via player (cam tracks player)
      if (u < 1) requestAnimationFrame(tick);
      else finish(false);
    };
    // if manual mode, step frames instead
    if (SP.state && SP.state.manual && window.__proto) {
      const steps = Math.max(20, Math.round(dur * 30));
      let i = 0;
      const stepAnim = () => {
        if (done) return;
        i++;
        const u = Math.min(1, i / steps);
        const ease = u * u * (3 - 2 * u);
        SP.player.x = from.x + (to.x - from.x) * ease;
        SP.player.y = from.y + (to.y - from.y) * ease;
        SP.player.hidden = false; // show as moving for capture; or keep hidden
        SP.player.hidden = true;
        __proto.render();
        if (u < 1) setTimeout(stepAnim, 16);
        else finish(false);
      };
      stepAnim();
    } else {
      requestAnimationFrame(tick);
    }
  };
  E.ensureBusOverlay = function () {
    let el = document.getElementById("busride");
    if (!el) {
      el = document.createElement("div");
      el.id = "busride";
      el.className = "busride hidden";
      el.innerHTML = `<div class="bus-card"><div class="bus-cap">行驶中…</div>
        <button type="button" data-bus-skip>跳过车程</button></div>`;
      (document.getElementById("wrap") || document.body).appendChild(el);
    }
    return el;
  };
  E.polishBus = function () {
    const SA = A(); if (!SA || SA._busE) return;
    SA._busE = true;
    // replace Stage D boardBus with anim+skip options
    SA.boardBus = function (fromObj) {
      if (E.busRiding) return toast("已经在车上了");
      const here = fromObj && fromObj.id, fare = SA.busFare(), mins = SA.busRideMin();
      const dests = SA.busStops.filter((s) => s.id !== here);
      if (!dests.length) return toast("本线暂无其他站");
      const opts = [];
      dests.forEach((s) => {
        opts.push({
          id: "ride_" + s.id, ok: true,
          label: `坐公交 → ${s.name}（¥${fare} · 看车程动画）`,
          fn: () => { E.rideBus(s, fare, mins, "anim"); return null; }
        });
        opts.push({
          id: "skip_" + s.id, ok: true,
          label: `跳过车程 → ${s.name}（¥${fare} · ${mins}分钟）`,
          fn: () => { E.rideBus(s, fare, mins, "skip"); return null; }
        });
      });
      opts.push({
        id: "wait_next", ok: true, label: "等下一班（推进到发车时刻）",
        fn: () => {
          const m = ((C().abs() % 1440) + 1440) % 1440;
          let next = ((Math.floor(m / 20) + 1) * 20);
          if (next >= 23 * 60) { toast("已过末班，明早再来"); return null; }
          const wait = Math.max(1, next - m);
          if (C().skipTo) C().skipTo(C().abs() + wait, 1.0); else C().min = (C().min || 0) + wait;
          toast(`等了 ${wait} 分钟，车来了`); return null;
        }
      });
      opts.push({
        id: "timetable", ok: true, label: "看手机公交时刻表",
        fn: () => { SA.openPhone("bus"); return null; }
      });
      G().openMenu(Object.assign({}, fromObj, { _name: fromObj.name || "公交站" }), opts);
    };
  };

  // ---------- night mini-events (skippable) ----------
  E._nightDay = -1;
  E._nightShown = {};
  E.nightTick = function () {
    if (!ps() || !C()) return;
    if (E.busRiding || (G() && G().busy && G().busy())) return;
    if (G().menu) return;
    const m = ((C().abs() % 1440) + 1440) % 1440;
    const night = m >= 22 * 60 || m < 6 * 60;
    if (!night) return;
    const day = C().day != null ? C().day : Math.floor(C().abs() / 1440);
    if (E._nightDay !== day) { E._nightDay = day; E._nightShown = {}; }
    // one of each per night max, light chance when minute hits :10 or :40
    const slot = Math.floor(m / 30);
    if (E._nightShown[slot]) return;
    // deterministic-ish: only fire at specific minutes
    if (m % 30 !== 10) return;
    E._nightShown[slot] = true;
    if (m >= 22 * 60 && m < 24 * 60 && !E._nightShown.police) {
      E._nightShown.police = true;
      E.offerNightEvent("police");
    } else if ((m < 6 * 60 || m >= 23 * 60) && !E._nightShown.clinic) {
      E._nightShown.clinic = true;
      E.offerNightEvent("clinic");
    }
  };
  E.offerNightEvent = function (kind) {
    const opts = [];
    if (kind === "police") {
      toast("手机震动：派出所夜间值班电话");
      opts.push({
        id: "answer", ok: true, label: "接听：简单说明情况（约 5 分钟）",
        fn: () => {
          if (C().skipTo) C().skipTo(C().abs() + 5, 0.8);
          toast("民警：收到，夜间先记录，白天带证件来补材料。");
          E.wxPush("landlord", "（语音转文字）夜里派出所打来电话备了案。", false);
          log("夜间接警电话");
          return null;
        }
      });
      opts.push({
        id: "report_phone", ok: true, label: "电话补报案（无回执，白天再盖章）",
        fn: () => {
          if (D()) { D().ensure().police.filed = true; ps().flags = ps().flags || {}; ps().flags.police_filed = true; }
          if (C().skipTo) C().skipTo(C().abs() + 8, 0.9);
          toast("电话报案已记录。回执请白天来窗口领取。");
          E.wxPush("property", "（夜间）租户电话报案已登记。", true);
          return null;
        }
      });
      opts.push({ id: "skip", ok: true, label: "忽略来电", fn: () => { toast("你划掉了来电"); return null; } });
      G().openMenu({ _name: "夜间来电 · 派出所", interact: "notice" }, opts);
    } else {
      toast("社区医院：夜间急诊窗口有人值班");
      opts.push({
        id: "go", ok: true, label: "去卫生中心急诊窗口看看",
        fn: () => {
          if (A() && A().spawnAt) A().spawnAt("hospital");
          toast("夜间急诊：可简易处理，正式挂号请白天。");
          return null;
        }
      });
      opts.push({
        id: "call120", ok: true, label: "拨打 120 咨询（不扣费演示）",
        fn: () => { toast("120：非急症建议明早挂号，注意休息。"); return null; }
      });
      opts.push({ id: "skip", ok: true, label: "先睡，明天再说", fn: () => { toast("你决定明天再去"); return null; } });
      G().openMenu({ _name: "夜间 · 社区卫生中心", interact: "notice" }, opts);
    }
  };

  // ---------- phone: bag app ----------
  E.polishPhone = function () {
    const SA = A(); if (!SA || SA._bagPhone) return;
    SA._bagPhone = true;
    const prev = SA.openPhone.bind(SA);
    SA.openPhone = function (tab, threadId) {
      // inject bag into home apps by temporarily patching after render
      prev(tab, threadId);
      const el = document.getElementById("phonepanel"); if (!el) return;
      if (tab === "home" || !tab) {
        const grid = el.querySelector(".app-grid");
        if (grid && !grid.querySelector('[data-tab="bag"]')) {
          const btn = document.createElement("button");
          btn.className = "app-ico"; btn.dataset.tab = "bag";
          btn.innerHTML = `<span class="ic" style="background:#af52de">🎒</span><span class="nm">背包</span>`;
          btn.onclick = () => SA.openPhone("bag");
          grid.appendChild(btn);
        }
      } else if (tab === "bag") {
        const head = el.querySelector(".phd b"); if (head) head.textContent = "背包";
        const body = el.querySelector(".pbd");
        if (body) {
          body.innerHTML = E.renderBag();
          body.querySelectorAll("[data-bag]").forEach((b) => b.onclick = () => E.useBagItem(b.dataset.bag));
        }
      }
    };
  };

  E.install = function () {
    const g = G(); if (!g || g._stageE) return; g._stageE = true;
    E.ensureBag();
    E.hookCivic();
    E.polishBus();
    E.polishPhone();
    if (!document.getElementById("stageE-css")) {
      const st = document.createElement("style"); st.id = "stageE-css";
      st.textContent = `
        .pbag{color:#f5f5f7}
        .pbag-row{display:flex;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #2c2c2e}
        .pbag-row .em{font-size:22px;flex:none}
        .pbag-row .info{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}
        .pbag-row .info i{font-style:normal;font-size:11px;color:#8e8e93}
        .pbag-row button{background:#5856d6;color:#fff;border:0;border-radius:8px;padding:6px 10px;cursor:pointer;flex:none}
        .busride{position:absolute;inset:0;z-index:50;display:flex;align-items:flex-end;justify-content:center;padding:24px;background:linear-gradient(transparent 40%,#000a);pointer-events:none}
        .busride.hidden{display:none}
        .busride .bus-card{pointer-events:auto;background:#1c1c1ee6;color:#f5f5f7;border-radius:14px;padding:14px 18px;display:flex;gap:12px;align-items:center;backdrop-filter:blur(8px)}
        .busride button{background:#ff9500;color:#111;border:0;border-radius:8px;padding:8px 12px;font-weight:700;cursor:pointer}
      `;
      document.head.appendChild(st);
    }
    setInterval(() => { try { E.nightTick(); } catch (e) {} }, 2000);
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageA && SP.stageD) E.install();
    else setTimeout(boot, 80);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})(window.SP || (window.SP = {}));
