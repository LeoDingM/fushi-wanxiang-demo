/* scene-proto-45 · Stage A: civic enter, bus rides, multi-home rent, god mode, phone apps (Chinese UI). */
(function (SP) {
  "use strict";
  const A = (SP.stageA = {});
  const G = () => SP.game, R = () => G() && G().rules, C = () => SP.clock;
  const prices = () => (R() && R().data.prices) || {};
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 2400);
  const log = (t) => SP.world && SP.world.logEvent(t);

  // ---------- housing (multi-unit rent) ----------
  A.ensureHousing = function () {
    const ps = G().ps; if (!ps) return;
    if (!ps.housing) {
      ps.housing = {
        home: "2F-02",
        owned: ["2F-02"],           // rented units 李默 currently holds
        deposits: { "2F-02": (R().data.lease && R().data.lease.rent) || 850 }
      };
    }
    return ps.housing;
  };
  A.units = function () {
    const rt = R().data.rent_table || {}, u = Object.assign({}, rt.units || {});
    // Stage A catalog extras
    u["3F-xin"] = u["3F-xin"] || { district: "inner", rent: 1200, type: "一房一厅 ~35㎡（馨园公寓）", scene: "room_xin_301", door: "stair_xin_1f", label: "馨园 3-01" };
    u["2F-02"] = u["2F-02"] || { district: "peripheral", rent: 850, type: "小单间", scene: "room_2f02", door: "stair_2f", label: "井槐里12号 2F-02" };
    if (!u["2F-02"].scene) { u["2F-02"].scene = "room_2f02"; u["2F-02"].door = "stair_2f"; u["2F-02"].label = "井槐里12号 2F-02"; }
    return u;
  };
  A.rentUnit = function (id) {
    const H = A.ensureHousing(), U = A.units()[id]; if (!U) return toast("没有这个房源");
    if (H.owned.includes(id)) return toast("你已经租了这套");
    const rent = U.rent, deposit = rent * ((R().data.lease && R().data.lease.deposit_months) || 1);
    const cost = rent + deposit;
    if (G().ps.money < cost) return toast(`钱不够（需押一付一 ¥${cost}）`);
    G().ps.money -= cost; G().ps.stats.spent = (G().ps.stats.spent || 0) + cost;
    H.owned.push(id); H.deposits[id] = deposit;
    if (G().payCard) G().payCard({ amount: cost, method: "微信转账", to: (R().data.lease && R().data.lease.agent) || "链居中介", what: `租 ${U.label || id}` });
    toast(`已租下 ${U.label || id} · 押金¥${deposit}+首月¥${rent}`); log(`租下 ${U.label || id}`);
    A.refreshPhone && A.refreshPhone();
  };
  A.setHome = function (id) {
    const H = A.ensureHousing(); if (!H.owned.includes(id)) return toast("你还没租这套");
    H.home = id; toast(`已切换住所 → ${A.units()[id].label || id}`); log(`切换住所 ${id}`);
    A.refreshPhone && A.refreshPhone();
  };
  A.leaveUnit = function (id) {
    const H = A.ensureHousing(); if (id === "2F-02" && H.owned.length === 1) return toast("至少保留一套住所");
    if (!H.owned.includes(id)) return toast("未租此房");
    const dep = H.deposits[id] || 0;
    H.owned = H.owned.filter((x) => x !== id); delete H.deposits[id];
    if (H.home === id) H.home = H.owned[0];
    G().ps.money += dep; toast(`退租 ${A.units()[id].label || id} · 退还押金 ¥${dep}`);
    log(`退租 ${id} 退押金 ¥${dep}`);
  };
  A.goHome = function () {
    const H = A.ensureHousing(), U = A.units()[H.home]; if (!U) return;
    const to = U.scene || "room_2f02";
    const spawn = (SP.scenes[to] && SP.scenes[to].spawn) || [2, 1, "N"];
    if (G().go) G().go({ to, spawn });
    else G().switchScene(to, spawn);
  };

  // ---------- bus ----------
  A.busStops = [
    { id: "bus_stop", name: "井槐里", x: -20, y: 2.4 },
    { id: "bus_stop_e", name: "东街", x: 74.5, y: 1.0 }
  ];
  A.busFare = () => prices().bus_fare != null ? prices().bus_fare : 2;
  A.busRideMin = () => prices().bus_ride_min != null ? prices().bus_ride_min : 8;
  A.boardBus = function (fromObj) {
    const here = fromObj && fromObj.id, fare = A.busFare(), mins = A.busRideMin();
    const dests = A.busStops.filter((s) => s.id !== here);
    if (!dests.length) return toast("本线暂无其他站");
    const opts = dests.map((s) => ({
      id: "bus_" + s.id, ok: true,
      label: `坐公交 → ${s.name}（¥${fare} · ${mins}分钟）`,
      fn: () => { A.doBusRide(s, fare, mins); return null; }
    }));
    G().openMenu(Object.assign({}, fromObj, { _name: fromObj.name || "公交站" }), opts);
  };
  A.doBusRide = function (dest, fare, mins) {
    A.closeMenus();
    if (G().ps.money < fare) return toast("钱不够坐公交");
    G().ps.money -= fare; G().ps.stats.spent = (G().ps.stats.spent || 0) + fare;
    if (G().payCard) G().payCard({ amount: fare, method: "公交卡/微信", to: "公交集团", what: `公交 → ${dest.name}` });
    // skip ride: advance clock + fade teleport
    const abs0 = C().abs();
    if (C().skipTo) C().skipTo(abs0 + mins, 1.2);
    else C().min = (C().min || 0) + mins;
    const sp = [dest.x + 1.2, dest.y + 1.5, dest.x < 0 ? "E" : "W"];
    if (SP.world.interior) G().switchScene("street", sp);
    else { SP.player.x = sp[0]; SP.player.y = sp[1]; if (SP.player.setDir) SP.player.setDir(sp[2]); }
    toast(`到站 · ${dest.name}（车程 ${mins} 分钟）`); log(`公交到达 ${dest.name}`);
  };

  // ---------- god mode ----------
  A.openGod = function () {
    A.ensureHousing();
    let el = document.getElementById("godpanel");
    if (!el) {
      el = document.createElement("div"); el.id = "godpanel"; el.className = "stageA-panel";
      document.getElementById("wrap").appendChild(el);
    }
    const ps = G().ps, n = ps.needs;
    el.innerHTML = `<div class="hd">🛠 上帝模式 <button class="x" data-x>关闭</button></div>
      <div class="bd">
        <label>金钱 ¥ <input type="number" id="god_money" value="${ps.money|0}" step="100"></label>
        <label>精力 <input type="range" id="god_energy" min="0" max="100" value="${n.energy|0}"><span id="god_energy_v">${n.energy|0}</span></label>
        <label>饱腹 <input type="range" id="god_hunger" min="0" max="100" value="${n.hunger|0}"><span id="god_hunger_v">${n.hunger|0}</span></label>
        <label>清洁 <input type="range" id="god_hygiene" min="0" max="100" value="${n.hygiene|0}"><span id="god_hygiene_v">${n.hygiene|0}</span></label>
        <label>心情 <input type="range" id="god_mood" min="0" max="100" value="${n.mood|0}"><span id="god_mood_v">${n.mood|0}</span></label>
        <label>时刻 <select id="god_time">
          <option value="dawn">清晨</option><option value="day">白天</option><option value="afternoon">下午</option>
          <option value="dusk">黄昏</option><option value="night">夜晚</option>
        </select></label>
        <div class="row">
          <button data-act="apply">应用数值</button>
          <button data-act="unlock">解锁全部</button>
          <button data-act="rich">发钱 +5000</button>
          <button data-act="home">传送回家</button>
        </div>
      </div>`;
    el.classList.remove("hidden");
    el.querySelector("[data-x]").onclick = () => el.classList.add("hidden");
    el.querySelectorAll("input[type=range]").forEach((inp) => {
      inp.oninput = () => { const v = el.querySelector("#" + inp.id + "_v"); if (v) v.textContent = inp.value; };
    });
    el.querySelector("[data-act=apply]").onclick = () => {
      ps.money = +el.querySelector("#god_money").value;
      ["energy","hunger","hygiene","mood"].forEach((k) => { n[k] = +el.querySelector("#god_" + k).value; });
      const tn = el.querySelector("#god_time").value; if (C().setTimeName) C().setTimeName(tn, true);
      toast("已应用上帝模式数值"); G().hud && G().hud();
    };
    el.querySelector("[data-act=unlock]").onclick = () => {
      ps.flags = Object.assign(ps.flags || {}, { unlock_all: true, metro: true, cbd: true, store_job: true });
      // rent all listed units for free
      const H = A.ensureHousing();
      Object.keys(A.units()).forEach((id) => { if (!H.owned.includes(id)) { H.owned.push(id); H.deposits[id] = A.units()[id].rent; } });
      toast("已解锁全部（房源/标志位）");
    };
    el.querySelector("[data-act=rich]").onclick = () => { ps.money += 5000; el.querySelector("#god_money").value = ps.money; toast("¥+5000"); G().hud && G().hud(); };
    el.querySelector("[data-act=home]").onclick = () => { el.classList.add("hidden"); A.goHome(); };
  };

  // ---------- phone ----------
  A.msgs = function () {
    const L = R().data.lease || {}, name = L.landlord || "房东刘姐";
    const base = [
      { from: name, text: "房租记得按时转哦～有事微信说。", t: "房东" },
      { from: "王阿姨", text: "小李啊，今晚包了饺子，下来拿一碗！", t: "邻居" },
      { from: "链居中介", text: "馨园公寓一房一厅在租，月租¥1200，有意向随时约看房。", t: "中介" },
      { from: "公交集团", text: "本线路井槐里↔东街区间运营中，票价见站牌。", t: "通知" }
    ];
    const inbox = (G().ps.inbox || []).slice().reverse();
    return base.concat(inbox.map((m) => ({ from: m.from || "系统", text: m.text, t: m.t || "消息" })));
  };
  A.openPhone = function (tab) {
    A.ensureHousing();
    let el = document.getElementById("phonepanel");
    if (!el) {
      el = document.createElement("div"); el.id = "phonepanel"; el.className = "stageA-phone";
      document.getElementById("wrap").appendChild(el);
    }
    const tabs = [
      { id: "wechat", label: "微信" },
      { id: "bank", label: "银行" },
      { id: "map", label: "地图" },
      { id: "housing", label: "租房" },
      { id: "more", label: "更多" }
    ];
    tab = tab || A._phoneTab || "wechat"; A._phoneTab = tab;
    const head = `<div class="phd"><b>手机</b><span>${C().clockLabel ? C().clockLabel() : ""}</span><button class="x" data-x>关闭</button></div>
      <div class="ptabs">${tabs.map((t) => `<button data-tab="${t.id}" class="${t.id===tab?"on":""}">${t.label}</button>`).join("")}</div>`;
    let body = "";
    if (tab === "wechat") {
      body = `<div class="plist">${A.msgs().map((m) => `<div class="pmsg"><i>${m.t}</i><b>${m.from}</b><p>${m.text}</p></div>`).join("")}</div>`;
    } else if (tab === "bank") {
      const ps = G().ps;
      body = `<div class="pbank"><div class="bal">余额 <b>¥${ps.money|0}</b></div>
        <button data-tx="landlord">转账房租给房东</button>
        <button data-tx="self">充值演示 +¥200</button>
        <p class="hint">流水仅演示；正式代扣仍走租约/账单系统。</p></div>`;
    } else if (tab === "map") {
      const places = [
        { name: "井槐里12号", x: 1.5, y: 12 },
        { name: "24便利店", x: 34, y: 6 },
        { name: "地铁井槐里站", x: 41.2, y: -8.2 },
        { name: "公交·井槐里", x: -20, y: 2.4 },
        { name: "公交·东街", x: 74.5, y: 1 },
        { name: "派出所", x: -36, y: -6.5 },
        { name: "社区医院", x: 22, y: -6.5 },
        { name: "消防站", x: 58, y: -6.5 },
        { name: "馨园公寓", x: 82, y: 15.5 }
      ];
      const px = SP.player.x, py = SP.player.y;
      body = `<div class="pmap">${places.map((p) => {
        const d = Math.hypot(p.x - px, p.y - py), walk = Math.max(1, Math.round(d / 1.35));
        const bus = (p.name.includes("公交") || p.name.includes("东街") || p.name.includes("馨园")) ? Math.max(1, A.busRideMin()) : null;
        return `<div class="prow"><b>${p.name}</b><span>步行约 ${walk} 分钟${bus != null ? ` · 公交约 ${bus} 分钟` : ""}</span></div>`;
      }).join("")}</div>`;
    } else if (tab === "housing") {
      const H = A.ensureHousing(), U = A.units();
      body = `<div class="phouse"><p>当前住所：<b>${(U[H.home]&&U[H.home].label)||H.home}</b></p>
        ${Object.keys(U).map((id) => {
          const u = U[id], own = H.owned.includes(id), home = H.home === id;
          return `<div class="prow"><b>${u.label||id}</b><span>${u.type||""} · ¥${u.rent}/月</span>
            <div class="row">${own?"":`<button data-rent="${id}">租下</button>`}
            ${own&&!home?`<button data-home="${id}">设为住所</button>`:""}
            ${own&&id!=="2F-02"?`<button data-leave="${id}">退租</button>`:""}
            ${home?"<i>当前</i>":""}</div></div>`;
        }).join("")}
        <button data-gohome>传送回住所</button></div>`;
    } else {
      body = `<div class="pmore">
        <div class="app stub">外卖（即将开放）</div>
        <div class="app stub">打车（即将开放）</div>
        <div class="app stub">招聘（即将开放）</div>
        <div class="app stub">相册（即将开放）</div>
        <div class="app" data-god>🛠 上帝模式</div>
      </div>`;
    }
    el.innerHTML = head + `<div class="pbd">${body}</div>`;
    el.classList.remove("hidden");
    el.querySelector("[data-x]").onclick = () => el.classList.add("hidden");
    el.querySelectorAll("[data-tab]").forEach((b) => b.onclick = () => A.openPhone(b.dataset.tab));
    el.querySelectorAll("[data-rent]").forEach((b) => b.onclick = () => { A.rentUnit(b.dataset.rent); A.openPhone("housing"); });
    el.querySelectorAll("[data-home]").forEach((b) => b.onclick = () => { A.setHome(b.dataset.home); A.openPhone("housing"); });
    el.querySelectorAll("[data-leave]").forEach((b) => b.onclick = () => { A.leaveUnit(b.dataset.leave); A.openPhone("housing"); });
    const gh = el.querySelector("[data-gohome]"); if (gh) gh.onclick = () => { el.classList.add("hidden"); A.goHome(); };
    const god = el.querySelector("[data-god]"); if (god) god.onclick = () => { el.classList.add("hidden"); A.openGod(); };
    el.querySelectorAll("[data-tx]").forEach((b) => b.onclick = () => {
      if (b.dataset.tx === "self") { G().ps.money += 200; toast("演示充值 +¥200"); A.openPhone("bank"); }
      else {
        const owed = G().ps.owed || 0; if (!owed) return toast("当前不欠房租");
        if (G().ps.money < owed) return toast("余额不足");
        const r = R().perform(G().ps, "pay_rent", G().ctx()); if (r.ok) toast(`已付房租 ¥${owed}`);
        A.openPhone("bank");
      }
    });
  };
  A.refreshPhone = function () { const el = document.getElementById("phonepanel"); if (el && !el.classList.contains("hidden")) A.openPhone(A._phoneTab); };

  A.openMenu = function (title, items) {
    const el = document.getElementById("amenu"); if (!el) return;
    el.classList.remove("hidden");
    el.innerHTML = `<div class="amenu-hd">${title}</div>` + items.map((it, i) =>
      `<button data-i="${i}" ${it.ok===false?"disabled":""}>${it.label}${it.right?` <span>${it.right}</span>`:""}</button>`).join("");
    el.querySelectorAll("button[data-i]").forEach((b) => b.onclick = () => { const it = items[+b.dataset.i]; if (it && it.do) it.do(); });
  };
  A.closeMenus = function () {
    const el = document.getElementById("amenu"); if (el) el.classList.add("hidden");
  };

  // ---------- wire into game action layer ----------
  A.install = function () {
    A.ensureHousing();
    const g = G(); if (!g || g._stageA) return; g._stageA = true;
    // expose openMenu alias used by bus
    if (!g.showMenu && g.openMenu) A._menuVia = true;
    window.addEventListener("keydown", (e) => {
      if (e.repeat || (SP.cbd && SP.cbd.active) || SP.metroActive) return;
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === "p" || e.key === "P") { e.preventDefault(); A.openPhone(); }
      if (e.key === "F1") { e.preventDefault(); A.openGod(); }
    });
    const bar = document.getElementById("bar");
    if (bar && !document.getElementById("btnPhone")) {
      const b1 = document.createElement("button"); b1.id = "btnPhone"; b1.textContent = "P 手机"; b1.onclick = () => A.openPhone();
      const b2 = document.createElement("button"); b2.id = "btnGod"; b2.textContent = "上帝"; b2.onclick = () => A.openGod();
      bar.appendChild(b1); bar.appendChild(b2);
    }
  };

  // boot after game ready
  const boot = () => { if (SP.game && SP.game.ps) A.install(); else setTimeout(boot, 50); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})(window.SP || (window.SP = {}));
