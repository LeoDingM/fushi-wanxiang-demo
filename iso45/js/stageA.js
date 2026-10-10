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
    const defaults = {
      "2F-02": { district: "peripheral", rent: 850, type: "小单间 ~14㎡", scene: "room_2f02", door: "stair_2f", label: "井槐里12号 2F-02" },
      "1F-xin": { district: "inner", rent: 1050, type: "一房一厅 ~35㎡", scene: "room_xin_101", door: "stair_xin_1f", label: "馨园公寓 1-01", stair: "stair_xin_1f" },
      "1F-xin-b": { district: "inner", rent: 1180, type: "一房一厅带阳台 ~38㎡", scene: "room_xin_102", door: "stair_xin_1f", label: "馨园公寓 1-02（南厅北卧阳台）", stair: "stair_xin_1f" },
      "2F-xin": { district: "inner", rent: 1100, type: "一房一厅 ~35㎡", scene: "room_xin_201", door: "stair_xin_2f", label: "馨园公寓 2-01", stair: "stair_xin_1f" },
      "2F-xin-b": { district: "inner", rent: 1150, type: "一房一厅 ~35㎡", scene: "room_xin_202", door: "stair_xin_2f", label: "馨园公寓 2-02", stair: "stair_xin_1f" },
      "3F-xin": { district: "inner", rent: 1200, type: "一房一厅精装 ~35㎡", scene: "room_xin_301", door: "stair_xin_3f", label: "馨园公寓 3-01", stair: "stair_xin_1f" },
      "3F-xin-b": { district: "inner", rent: 1250, type: "一房一厅 ~35㎡", scene: "room_xin_302", door: "stair_xin_3f", label: "馨园公寓 3-02", stair: "stair_xin_1f" },
      "4F-xin": { district: "inner", rent: 1300, type: "一房一厅精装 ~35㎡", scene: "room_xin_401", door: "stair_xin_4f", label: "馨园公寓 4-01", stair: "stair_xin_1f" }
    };
    for (const id of Object.keys(defaults)) u[id] = Object.assign({}, defaults[id], u[id] || {});
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
    if (G().go) G().go({ to, spawn, door: U.door });
    else G().switchScene(to, spawn);
  };
  A.spawnAt = function (key) {
    const map = {
      police: { to: "civic_police", street: [-36, -6.5, "N"] },
      hospital: { to: "civic_hospital", street: [13, -6.5, "N"] },
      fire: { to: "civic_fire", street: [58, -6.5, "N"] },
      xin: { to: "stair_xin_1f", street: [82, 15.5, "N"] },
      home12: { to: "stair_1f", street: [1.5, 12, "N"] }
    };
    const m = map[key]; if (!m) return;
    if (SP.scenes[m.to]) G().go({ to: m.to, spawn: SP.scenes[m.to].spawn });
    else { G().switchScene("street", m.street); SP.player.x = m.street[0]; SP.player.y = m.street[1]; }
  };

  // ---------- bus ----------
  A.busStops = [
    { id: "bus_stop", name: "井槐里", x: -20, y: 2.4 },
    { id: "bus_stop_m", name: "卫生中心", x: 20.5, y: 1.0 },
    { id: "bus_stop_e", name: "东街", x: 74.5, y: 1.0 }
  ];
  A.busTimetable = function () {
    const mins = A.busRideMin(), names = A.busStops.map((s) => s.name);
    const rows = [];
    for (let h = 6; h <= 22; h++) {
      for (const m of [0, 20, 40]) {
        const lab = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
        rows.push({ t: lab, route: names.join(" → "), eta: mins });
      }
    }
    return rows;
  };
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

  // ---------- WeChat threads (diversified NPC copy) ----------
  // Pick one of many reply variants each time a choice is used (and rotate unused).
  A._pick = function (arr) {
    if (!arr || !arr.length) return "";
    if (typeof arr === "string") return arr;
    return arr[(Math.random() * arr.length) | 0];
  };
  A.threads = function () {
    const L = R().data.lease || {}, name = L.landlord || "房东刘姐";
    const H = A.ensureHousing();
    if (!G().ps.chat) G().ps.chat = {};
    const chat = G().ps.chat;
    const seed = {
      landlord: { title: name, tag: "房东", av: "刘", avClass: "", msgs: [
        { who: "them", text: A._pick([
          "小李，这个月房租还按微信转就行。",
          "提醒一下哈，房租月底前转到我就行～",
          "水电单我发群里了，房租照旧微信转。"
        ]) },
        { who: "them", text: H.owned.length > 1
          ? A._pick(["听说你又看了馨园的房子？记得跟中介签正规合同。", "多套房要管好钥匙，丢了找开锁贵着呢。", "馨园那边物业比这边严一点，进出扫码。"])
          : A._pick(["热水器要是不行跟我说，我叫人来修。", "楼道灯泡坏了跟物业说一声就行。", "冬天窗户记得关严，这边风大。"]) }
      ], replies: [
        { id: "pay", label: "好的，我这就转房租", act: "pay_rent" },
        { id: "ask", label: "刘姐，洗手间漏水能修吗？", them: [
          "行，明天上午我叫管道工过去看。",
          "收到，我让张师傅下午带工具过来。",
          "又漏啦？先拿盆接着，我今天联系维修。"
        ]},
        { id: "ok", label: "收到，谢谢刘姐", them: [
          "嗯嗯，有事微信说。",
          "客气啥，好租客难找。",
          "好，忙你的去吧～"
        ]},
        { id: "noise", label: "楼上有点吵，能帮忙说说吗？", them: [
          "我去敲一下 402，太晚了确实不妥。",
          "知道了，我跟他们对一下，你先忍一晚上。",
          "行，我把物业群里也提一句。"
        ]}
      ]},
      aunt: { title: "王阿姨", tag: "邻居", av: "王", avClass: "t2", msgs: [
        { who: "them", text: A._pick([
          "小李啊，今晚包了饺子，下来拿一碗！",
          "刚炸了排骨，你要不要端一碟？",
          "小区门口新开了家豆浆油条，早上来喊你。"
        ]) }
      ], replies: [
        { id: "yes", label: "好呀阿姨，我下来拿", them: [
          "门开着，自己盛！多吃点。",
          "好，我在厨房等你，别客气。",
          "来吧来吧，还热乎着呢。"
        ]},
        { id: "no", label: "谢谢阿姨，我今天有饭了", them: [
          "那明天再叫你～",
          "行，剩的我放冰箱，你饥饿了再说。",
          "好，有空来串门喝茶。"
        ]},
        { id: "chat", label: "阿姨，最近身体怎么样？", them: [
          "还行还行，就是膝盖阴天疼。你也别老熬夜。",
          "我挺好，你工作顺利不？别太拼。",
          "老头子催我去公园跳操，我懒得动哈哈。"
        ]}
      ]},
      agent: { title: "链居中介·小周", tag: "中介", av: "周", avClass: "t3", msgs: [
        { who: "them", text: A._pick([
          "馨园 2-01/3-01/3-02 一房一厅在租，¥1100–1250，要看房随时说。",
          "新上架：馨园南向一房一厅，采光不错，周末有空吗？",
          "井槐里这边一房一厅库存还行，预算一千出头能谈。"
        ]) }
      ], replies: [
        { id: "see", label: "想约今天下午看 3-01", them: [
          "OK，三点小区门口见。手机里租房页也能直接下定。",
          "成，我带钥匙，你到了微信我。",
          "下午三点半可以，电梯直达，很好找。"
        ]},
        { id: "price", label: "还能再便宜点吗？", them: [
          "押一付一已经友好了，季付能谈到小优惠～",
          "房东挺坚持价的，不过你可以先看再决定。",
          "如果签一年，我帮你问问能不能减 50。"
        ]},
        { id: "compare", label: "12号楼和馨园差在哪？", them: [
          "12号更便宜但老旧；馨园新、有门禁，适合想安静的。",
          "馨园物业费含在房租感观里，通勤到卫生中心更近。",
          "看你预算：省钱选 12 号，住得舒服选馨园。"
        ]}
      ]},
      bus: { title: "公交集团", tag: "通知", av: "公", avClass: "t4", msgs: [
        { who: "them", text: A._pick([
          "井槐里线：井槐里→卫生中心→东街，约每 20 分钟一班（06:00–22:40）。",
          "温馨提示：末班约 22:40，雨天可能晚点 5–10 分钟。",
          "电子票已开通，车上也可投币；请依次上下车。"
        ]) }
      ], replies: [
        { id: "ok", label: "知道了", them: ["祝乘车愉快。", "有并行线路变更会再通知。", "谢谢关注井槐里线。"] },
        { id: "late", label: "昨晚车晚点了吗？", them: [
          "昨晚东街拥堵，平均晚点约 8 分钟，抱歉。",
          "系统显示有一班在卫生中心多停了两分钟。",
          "雨天调度已加密，今天会更准时一些。"
        ]}
      ]},
      roommate: { title: "大学同学·阿凯", tag: "好友", av: "凯", avClass: "t2", msgs: [
        { who: "them", text: A._pick([
          "默子，周末来不来打球？老地方。",
          "看到你朋友圈搬新家了？恭喜啊。",
          "最近加班疯了，晚上要不要语音吐槽两句。",
          "听说井槐里开了家新面馆，敢不敢拼一顿。"
        ]) }
      ], replies: [
        { id: "ball", label: "来！几点？", them: [
          "周六下午四点，我占场。别迟到哈。",
          "周日上午十点，完事一起吃拉面。",
          "看天气，晴就下午，阴就改室内。",
          "周五晚七点 indor，我带球。"
        ]},
        { id: "busy", label: "这周太累了，下次吧", them: [
          "行，那你休息。别老熬夜打游戏。",
          "理解，等你缓过来喊我。",
          "那我找别人凑局，你欠我一顿。",
          "好，那房租交了记得请我喝奶茶哈哈。"
        ]},
        { id: "askjob", label: "你那边还在招人吗？", them: [
          "物流仓还能塞个临时工，要的话我内推。",
          "我们组暂时满了，我帮你问问隔壁。",
          "你可以先看手机里招聘页，有对口的我帮你留意。",
          "安保夜班听说馨园在招，你手机招聘页有。"
        ]}
      ]},
      property: { title: "馨园物业·小吴", tag: "物业", av: "物", avClass: "t4", msgs: [
        { who: "them", text: A._pick([
          "温馨提示：本周五上午清洗水箱，可能短暂停水。",
          "楼道堆物请尽快清理，消防通道不能堵。",
          "快递柜满了会短信提醒，超时件挪到门岗。"
        ]) }
      ], replies: [
        { id: "ok", label: "收到，谢谢", them: ["好的，有问题随时联系物业值班室。", "嗯，祝生活愉快。", "收到。停水公告也贴在一楼了。"] },
        { id: "water", label: "大概停多久？", them: [
          "计划 9:00–11:30，完成就恢复。",
          "一般两小时内，若延期会再通知。",
          "建议提前备一壶水，谢谢配合。"
        ]},
        { id: "card", label: "门禁卡丢了怎么补？", them: [
          "带身份证来物业办，工本费 ¥20。",
          "一楼值班室工作日都能办，现场拍照录入。",
          "先用临时通行证，补卡后旧卡自动作废。"
        ]}
      ]},
      clerk: { title: "便利店·赵姐", tag: "店长", av: "赵", avClass: "t3", msgs: [
        { who: "them", text: A._pick([
          "小李，晚班还缺人，有空来顶一会儿？时薪照旧。",
          "新到一批关东煮，下班来喝碗汤。",
          "你排班表我改了一下，手机里也能看。"
        ]) }
      ], replies: [
        { id: "shift", label: "今晚可以，几点到？", them: [
          "六点半来就行，换好工服打卡。",
          "七点到九点，人不太多。",
          "你过来我把货架也指给你。"
        ]},
        { id: "later", label: "这周先不了，下回说", them: [
          "行，那我再问问别人。",
          "没事，你忙你的。",
          "好，有固定班我再喊你。"
        ]},
        { id: "food", label: "关东煮留一碗！", them: [
          "好，萝卜＋鱼丸，晚点来取。",
          "辣汤还是清汤？我按清汤给你盛。",
          "行，放后厨保温，别太晚哈。"
        ]}
      ]},
      courier: { title: "快递站·小刘", tag: "快递", av: "递", avClass: "", msgs: [
        { who: "them", text: A._pick([
          "您的包裹到柜了：芳香柜 12门，取件码已短信。",
          "有一件生鲜到门岗了，请尽快来取。",
          "驿站今晚八点关门，超时件明日再取。"
        ]) }
      ], replies: [
        { id: "got", label: "好的，我一会去取", them: ["好，柜门有时会卡一下，多拍一次码。", "行，取到记得确认。", "生鲜那件别压太久哈。"] },
        { id: "delay", label: "今晚可能晚，能帮我留一下吗？", them: [
          "可以放到门岗，明天中午前都行。",
          "行，我备注一下「夜间自取」。",
          "最晚放冷藏到明天上午十点。"
        ]},
        { id: "addr", label: "下次改送到馨园门禁里吧", them: [
          "成，我改备注「馨园门岗代收」。",
          "行，你手机号还是这个？",
          "好，大件我电话你再上楼。"
        ]}
      ]}
    };
    for (const id of Object.keys(seed)) {
      if (!chat[id]) chat[id] = { msgs: seed[id].msgs.slice(), title: seed[id].title, tag: seed[id].tag, replies: seed[id].replies, av: seed[id].av, avClass: seed[id].avClass || "" };
      else {
        chat[id].title = seed[id].title; chat[id].tag = seed[id].tag; chat[id].replies = seed[id].replies;
        chat[id].av = seed[id].av; chat[id].avClass = seed[id].avClass || "";
      }
    }
    return chat;
  };

  /**
   * Optional LLM hook (stub). Wire a free local / future API here later.
   * Usage: SP.phone.aiChat({ threadId, userText, history }) -> Promise<string>|string|null
   * If unset / returns null, replyChat falls back to the scripted `them` variants.
   * Do not call external paid APIs from the default build.
   */
  SP.phone = SP.phone || {};
  if (typeof SP.phone.aiChat !== "function") {
    SP.phone.aiChat = function (/* ctx */) {
      // Stub: return null to keep scripted NPC lines. Replace with local model later.
      return null;
    };
  }

  A.replyChat = function (tid, rid) {
    const chat = A.threads(), th = chat[tid]; if (!th) return;
    const r = (th.replies || []).find((x) => x.id === rid); if (!r) return;
    th.msgs.push({ who: "me", text: r.label });
    const finish = (themText) => {
      if (themText) th.msgs.push({ who: "them", text: themText });
      A.openPhone("wechat", tid);
    };
    if (r.act === "pay_rent") {
      const owed = G().ps.owed || 0;
      if (!owed) { finish(A._pick(["这个月房租已经结清啦。", "不用转啦，本月已收。", "账上是平的，谢谢提醒。"])); return; }
      if (G().ps.money < owed) { finish(A._pick(["余额不够呀，先凑凑？", "还差一点，你看看银行卡。", "钱不太够，要不要我宽限两天？"])); return; }
      const res = A.payRentTransfer("微信");
      // payRentTransfer already appended mirror msgs; only add landlord ack if transfer failed path didn't
      if (!res.ok) finish(A._pick(["转账好像没成功，你查下余额。", "没收到款，是不是网络闪了一下？", "银行那边显示失败，再试一次？"]));
      else A.openPhone("wechat", tid);
      return;
    }
    const scripted = A._pick(r.them);
    let ai;
    try { ai = SP.phone.aiChat({ threadId: tid, userText: r.label, history: th.msgs.slice(), replyId: rid }); } catch (e) { ai = null; }
    if (ai && typeof ai.then === "function") {
      Promise.resolve(ai).then((t) => finish(t || scripted)).catch(() => finish(scripted));
    } else {
      finish(ai || scripted);
    }
  };

  // ---------- bank / rent transfer ----------
  A.ensureBank = function () {
    const ps = G().ps; if (!ps.bankLog) ps.bankLog = [];
    return ps.bankLog;
  };
  A.clockStamp = function () {
    try { return (C().clockLabel && C().clockLabel()) || ""; } catch (e) { return ""; }
  };
  A.payRentTransfer = function (src) {
    const ps = G().ps, owed = ps.owed || 0, log = A.ensureBank();
    const L = (R().data.lease || {}).landlord || "房东刘姐";
    if (!owed) { toast("当前不欠房租"); return { ok: false, reason: "clear" }; }
    if (ps.money < owed) { toast("余额不足，无法转账"); return { ok: false, reason: "funds" }; }
    const before = owed;
    const r = R().perform(ps, "pay_rent", G().ctx());
    if (r && r.ok) {
      log.unshift({ t: A.clockStamp(), kind: "rent", to: L, amount: before, via: src || "银行", ok: true });
      if (log.length > 20) log.length = 20;
      toast(`已转账房租 ¥${before} → ${L}`);
      // mirror into WeChat landlord thread
      try {
        const chat = A.threads(), th = chat.landlord;
        if (th) {
          th.msgs.push({ who: "me", text: `（通过${src || "银行"}转账房租 ¥${before}）` });
          th.msgs.push({ who: "them", text: A._pick([
            `收到 ¥${before}，谢谢～账上平了。`,
            `到账 ¥${before}，这个月清啦。`,
            `好的，微信也看到转账了，辛苦～`
          ]) });
        }
      } catch (e) {}
      return { ok: true, amount: before };
    }
    log.unshift({ t: A.clockStamp(), kind: "rent", to: L, amount: owed, via: src || "银行", ok: false });
    toast("转账失败，请稍后再试");
    return { ok: false, reason: "fail" };
  };

  // ---------- god mode ----------
  // ---------- bank / rent transfer ----------
  A.ensureBank = function () {
    const ps = G().ps; if (!ps.bankLog) ps.bankLog = [];
    return ps.bankLog;
  };
  A.clockStamp = function () {
    try { return (C().clockLabel && C().clockLabel()) || ""; } catch (e) { return ""; }
  };
  A.payRentTransfer = function (src) {
    const ps = G().ps, owed = ps.owed || 0, log = A.ensureBank();
    const L = (R().data.lease || {}).landlord || "房东刘姐";
    if (!owed) { toast("当前不欠房租"); return { ok: false, reason: "clear" }; }
    if (ps.money < owed) { toast("余额不足，无法转账"); return { ok: false, reason: "funds" }; }
    const before = owed;
    const r = R().perform(ps, "pay_rent", G().ctx());
    if (r && r.ok) {
      log.unshift({ t: A.clockStamp(), kind: "rent", to: L, amount: before, via: src || "银行", ok: true });
      if (log.length > 20) log.length = 20;
      toast(`已转账房租 ¥${before} → ${L}`);
      // mirror into WeChat landlord thread
      try {
        const chat = A.threads(), th = chat.landlord;
        if (th) {
          th.msgs.push({ who: "me", text: `（通过${src || "银行"}转账房租 ¥${before}）` });
          th.msgs.push({ who: "them", text: A._pick([
            `收到 ¥${before}，谢谢～账上平了。`,
            `到账 ¥${before}，这个月清啦。`,
            `好的，微信也看到转账了，辛苦～`
          ]) });
        }
      } catch (e) {}
      return { ok: true, amount: before };
    }
    log.unshift({ t: A.clockStamp(), kind: "rent", to: L, amount: owed, via: src || "银行", ok: false });
    toast("转账失败，请稍后再试");
    return { ok: false, reason: "fail" };
  };

  // ---------- god mode ----------
  A.openGod = function () {
    A.ensureHousing();
    let el = document.getElementById("godpanel");
    if (!el) { el = document.createElement("div"); el.id = "godpanel"; el.className = "stageA-panel"; document.getElementById("wrap").appendChild(el); }
    const ps = G().ps, n = ps.needs, H = A.ensureHousing(), U = A.units();
    const rentChecks = Object.keys(U).map((id) => {
      const on = H.owned.includes(id);
      return `<label class="chk"><input type="checkbox" data-own="${id}" ${on?"checked":""}> ${U[id].label||id}</label>`;
    }).join("");
    el.innerHTML = `<div class="hd">🛠 上帝模式 <button class="x" data-x>关闭</button></div>
      <div class="bd">
        <label>金钱 ¥ <input type="number" id="god_money" value="${ps.money|0}" step="100"></label>
        <label>精力 <input type="range" id="god_energy" min="0" max="100" value="${n.energy|0}"><span id="god_energy_v">${n.energy|0}</span></label>
        <label>饱腹 <input type="range" id="god_hunger" min="0" max="100" value="${n.hunger|0}"><span id="god_hunger_v">${n.hunger|0}</span></label>
        <label>清洁 <input type="range" id="god_hygiene" min="0" max="100" value="${n.hygiene|0}"><span id="god_hygiene_v">${n.hygiene|0}</span></label>
        <label>心情 <input type="range" id="god_mood" min="0" max="100" value="${n.mood|0}"><span id="god_mood_v">${n.mood|0}</span></label>
        <label>时刻 <select id="god_time"><option value="dawn">清晨</option><option value="day">白天</option><option value="afternoon">下午</option><option value="dusk">黄昏</option><option value="night">夜晚</option></select></label>
        <div class="sec">已租房源</div>${rentChecks}
        <div class="sec">传送</div>
        <div class="row">
          <button data-sp="police">派出所</button><button data-sp="hospital">医院</button>
          <button data-sp="fire">消防站</button><button data-sp="xin">馨园</button>
          <button data-sp="home12">12号楼</button><button data-act="home">当前住所</button>
        </div>
        <div class="row">
          <button data-act="apply">应用数值</button>
          <button data-act="unlock">解锁全部</button>
          <button data-act="rich">发钱 +5000</button>
          <button data-act="own">应用租约勾选</button>
        </div>
      </div>`;
    el.classList.remove("hidden");
    el.querySelector("[data-x]").onclick = () => el.classList.add("hidden");
    el.querySelectorAll("input[type=range]").forEach((inp) => { inp.oninput = () => { const v = el.querySelector("#"+inp.id+"_v"); if (v) v.textContent = inp.value; }; });
    el.querySelector("[data-act=apply]").onclick = () => {
      ps.money = +el.querySelector("#god_money").value;
      ["energy","hunger","hygiene","mood"].forEach((k) => { n[k] = +el.querySelector("#god_"+k).value; });
      const tn = el.querySelector("#god_time").value; if (C().setTimeName) C().setTimeName(tn, true);
      toast("已应用上帝模式数值"); G().hud && G().hud();
    };
    el.querySelector("[data-act=own]").onclick = () => {
      const want = [...el.querySelectorAll("[data-own]")].filter((c) => c.checked).map((c) => c.dataset.own);
      H.owned = want.length ? want : ["2F-02"];
      H.deposits = {}; want.forEach((id) => { H.deposits[id] = (U[id]&&U[id].rent)||850; });
      if (!H.owned.includes(H.home)) H.home = H.owned[0];
      toast("已更新租约："+H.owned.map((id)=>(U[id]&&U[id].label)||id).join("、"));
    };
    el.querySelector("[data-act=unlock]").onclick = () => {
      ps.flags = Object.assign(ps.flags || {}, { unlock_all: true, metro: true, cbd: true, store_job: true });
      Object.keys(U).forEach((id) => { if (!H.owned.includes(id)) { H.owned.push(id); H.deposits[id] = U[id].rent; } });
      toast("已解锁全部"); A.openGod();
    };
    el.querySelector("[data-act=rich]").onclick = () => { ps.money += 5000; el.querySelector("#god_money").value = ps.money; toast("¥+5000"); };
    el.querySelector("[data-act=home]").onclick = () => { el.classList.add("hidden"); A.goHome(); };
    el.querySelectorAll("[data-sp]").forEach((b) => b.onclick = () => { el.classList.add("hidden"); A.spawnAt(b.dataset.sp); });
  };

  A.openPhone = function (tab, threadId) {
    A.ensureHousing();
    let el = document.getElementById("phonepanel");
    if (!el) { el = document.createElement("div"); el.id = "phonepanel"; el.className = "stageA-phone"; document.getElementById("wrap").appendChild(el); }
    const apps = [
      { id: "wechat", label: "微信", emoji: "💬", color: "#1aad19" },
      { id: "bank", label: "银行", emoji: "🏦", color: "#e6a23c" },
      { id: "map", label: "地图", emoji: "🗺️", color: "#4cd964" },
      { id: "housing", label: "租房", emoji: "🏠", color: "#5856d6" },
      { id: "jobs", label: "招聘", emoji: "💼", color: "#007aff" },
      { id: "bus", label: "公交", emoji: "🚌", color: "#ff9500" },
      { id: "more", label: "更多", emoji: "⋯", color: "#8e8e93" }
    ];
    // tab undefined / "home" → home screen; else app
    if (tab == null && threadId == null && A._phoneTab && A._phoneTab !== "home") tab = A._phoneTab;
    if (!tab) tab = "home";
    A._phoneTab = tab;
    A._phoneThread = threadId || null;
    const clock = C().clockLabel ? C().clockLabel() : "";
    const notch = `<div class="notch"><span class="clk">${clock || "9:41"}</span><span class="pill"></span><span class="bat">▮▮▮</span></div>`;
    const closeBtn = `<button class="x" data-x>关闭</button>`;
    let head = "", body = "";

    if (tab === "home") {
      head = `<div class="phd"><b>李默的 iPhone</b>${closeBtn}</div>`;
      const icons = apps.map((a) =>
        `<button class="app-ico" data-tab="${a.id}"><span class="ic" style="background:${a.color}">${a.emoji}</span><span class="nm">${a.label}</span></button>`
      ).join("");
      const dock = ["wechat", "bank", "map", "more"].map((id) => {
        const a = apps.find((x) => x.id === id);
        return `<button class="app-ico" data-tab="${a.id}"><span class="ic" style="background:${a.color}">${a.emoji}</span></button>`;
      }).join("");
      body = `<div class="home-wallpaper"><div class="app-grid">${icons}</div><div class="dock">${dock}</div></div>`;
    } else {
      const titleMap = { wechat: "微信", bank: "银行", map: "地图", housing: "链居租房", jobs: "招聘", bus: "公交", more: "更多" };
      const backTo = (tab === "wechat" && threadId) ? "wechat" : "home";
      head = `<div class="phd"><button class="back" data-back="${backTo}">‹ 返回</button><b>${titleMap[tab] || tab}</b>${closeBtn}</div>`;

      if (tab === "wechat") {
        const chat = A.threads();
        if (threadId && chat[threadId]) {
          const th = chat[threadId];
          head = `<div class="phd"><button class="back" data-back="wechat">‹ 返回</button><b>${th.title}</b>${closeBtn}</div>`;
          const bubbles = th.msgs.map((m) => {
            const av = m.who === "me" ? "我" : (th.av || th.title.slice(0, 1));
            return `<div class="wx-b ${m.who}"><div class="av">${av}</div><div class="bubble">${m.text}</div></div>`;
          }).join("");
          const replies = (th.replies || []).map((r) =>
            `<button data-reply="${threadId}:${r.id}">${r.label}</button>`
          ).join("");
          body = `<div class="wx-chat"><div class="wx-bubbles">${bubbles}</div>
            <div class="wx-replies">${replies}<div class="wx-hint">脚本回复 · 可接 SP.phone.aiChat</div></div></div>`;
        } else {
          body = `<div class="wx-list">${Object.keys(chat).map((id) => {
            const th = chat[id], last = th.msgs[th.msgs.length - 1];
            return `<div class="wx-row" data-open="${id}"><div class="wx-av ${th.avClass || ""}">${th.av || th.title.slice(0, 1)}</div>
              <div class="wx-meta"><b>${th.title}</b><p>${last ? last.text : ""}</p></div></div>`;
          }).join("")}</div>`;
        }
      } else if (tab === "bank") {
        const ps = G().ps, owed = ps.owed || 0, L = (R().data.lease || {}).landlord || "房东刘姐";
        const log = A.ensureBank();
        const due = ps.rent_due_label || (owed ? "已到期／欠费中" : "本月已结清");
        const hist = log.slice(0, 6).map((e) =>
          `<div class="prow"><b>${e.ok ? "✓" : "✗"} ¥${e.amount}</b><span>${e.t || ""} · ${e.via} → ${e.to}</span></div>`
        ).join("") || `<p class="hint">暂无转账记录</p>`;
        body = `<div class="pbank">
          <div class="bal">¥${ps.money | 0}</div>
          <p>收款人：<b>${L}</b></p>
          <p>房租欠款：<b style="color:${owed ? "#ff6b6b" : "#6ddf8a"}">¥${owed}</b> · ${due}</p>
          <div class="row" style="gap:8px;margin:10px 0">
            <button data-tx="landlord" ${owed ? "" : "disabled"}>确认转账房租</button>
            <button data-tx="self">充值 +¥200</button>
            <button data-tx="wx">打开微信·房东</button>
          </div>
          <p class="hint">转账走 shared-rules <code>pay_rent</code>；成功后写入银行流水并同步微信会话。</p>
          <div class="sec" style="margin-top:12px;font-weight:700">最近流水</div>
          ${hist}
        </div>`;
      } else if (tab === "map") {
        const places = [
          { name: "井槐里12号", x: 1.5, y: 12, mark: "住" },
          { name: "派出所", x: -36, y: -6.5, mark: "警" },
          { name: "社区医院", x: 22, y: -6.5, mark: "医" },
          { name: "消防站", x: 58, y: -6.5, mark: "消" },
          { name: "馨园公寓", x: 82, y: 15.5, mark: "租" },
          { name: "24便利店", x: 34, y: 6, mark: "" },
          { name: "地铁井槐里站", x: 41.2, y: -8.2, mark: "轨" },
          { name: "公交·井槐里", x: -20, y: 2.4, mark: "公交" },
          { name: "公交·卫生中心", x: 22, y: 1, mark: "公交" },
          { name: "公交·东街", x: 74.5, y: 1, mark: "公交" }
        ];
        const px = SP.player.x, py = SP.player.y;
        body = `<div class="pmap">${places.map((p) => {
          const d = Math.hypot(p.x - px, p.y - py), walk = Math.max(1, Math.round(d / 1.35));
          const bus = p.mark === "公交" || p.name.includes("馨园") || p.name.includes("东街") ? Math.max(1, A.busRideMin()) : null;
          return `<div class="prow"><b>${p.mark ? `[${p.mark}] ` : ""}${p.name}</b><span>步行约 ${walk} 分钟${bus != null ? ` · 公交约 ${bus} 分钟` : ""}</span></div>`;
        }).join("")}</div>`;
      } else if (tab === "housing") {
        const H = A.ensureHousing(), U = A.units();
        body = `<div class="phouse"><p>当前住所：<b>${(U[H.home] && U[H.home].label) || H.home}</b></p>
          ${Object.keys(U).map((id) => {
            const u = U[id], own = H.owned.includes(id), home = H.home === id;
            return `<div class="prow"><b>${u.label || id}</b><span>${u.type || ""} · ¥${u.rent}/月</span>
              <div class="row">${own ? "" : `<button data-rent="${id}">租下</button>`}
              ${own && !home ? `<button data-home="${id}">设为住所</button>` : ""}
              ${own && id !== "2F-02" ? `<button data-leave="${id}">退租</button>` : ""}
              ${home ? "<i>当前</i>" : ""}</div></div>`;
          }).join("")}<button data-gohome>传送回住所</button></div>`;
      } else if (tab === "jobs") {
        const jobs = [
          { id: "store", title: "24便利店店员", pay: "¥15/时", where: "井槐里东街", note: "排班制，可在店内打卡（已有 job 系统）" },
          { id: "courier", title: "众包外卖骑手", pay: "按单结算", where: "井槐片区", note: "轻量演示：接一单 +¥18，耗时 25 分钟" },
          { id: "guard", title: "馨园安保夜班", pay: "¥180/班", where: "馨园公寓", note: "演示：接班 +¥180，耗精力" }
        ];
        body = `<div class="pjobs">${jobs.map((j) => `<div class="prow"><b>${j.title}</b><span>${j.pay} · ${j.where}</span><p class="hint">${j.note}</p>
          <button data-job="${j.id}">接单／了解</button></div>`).join("")}</div>`;
      } else if (tab === "bus") {
        const fare = A.busFare(), rows = A.busTimetable().slice(0, 12);
        body = `<div class="pbus"><p>井槐里线 · 票价 ¥${fare} · 站序：${A.busStops.map((s) => s.name).join(" → ")}</p>
          <div class="plist">${rows.map((r) => `<div class="prow"><b>${r.t}</b><span>${r.route} · 全程约 ${r.eta} 分钟</span></div>`).join("")}
          <p class="hint">…每日 06:00–22:40，约每 20 分钟一班</p></div></div>`;
      } else {
        body = `<div class="pmore">
          <div class="app stub">外卖（后续开放）</div>
          <div class="app stub">打车（后续开放）</div>
          <div class="app stub">相册（后续开放）</div>
          <div class="app" data-god>🛠 上帝模式</div>
        </div>`;
      }
    }

    el.innerHTML = notch + head + `<div class="pbd">${body}</div><div class="home-bar" data-homebar title="回主屏幕"></div>`;
    el.classList.remove("hidden");
    el.querySelector("[data-x]").onclick = () => el.classList.add("hidden");
    const hb = el.querySelector("[data-homebar]"); if (hb) hb.onclick = () => A.openPhone("home");
    el.querySelectorAll("[data-tab]").forEach((b) => b.onclick = () => A.openPhone(b.dataset.tab));
    el.querySelectorAll("[data-open]").forEach((b) => b.onclick = () => A.openPhone("wechat", b.dataset.open));
    el.querySelectorAll("[data-back]").forEach((b) => b.onclick = () => A.openPhone(b.dataset.back || "home"));
    el.querySelectorAll("[data-reply]").forEach((b) => b.onclick = () => { const [tid, rid] = b.dataset.reply.split(":"); A.replyChat(tid, rid); });
    el.querySelectorAll("[data-rent]").forEach((b) => b.onclick = () => { A.rentUnit(b.dataset.rent); A.openPhone("housing"); });
    el.querySelectorAll("[data-home]").forEach((b) => b.onclick = () => { A.setHome(b.dataset.home); A.openPhone("housing"); });
    el.querySelectorAll("[data-leave]").forEach((b) => b.onclick = () => { A.leaveUnit(b.dataset.leave); A.openPhone("housing"); });
    const gh = el.querySelector("[data-gohome]"); if (gh) gh.onclick = () => { el.classList.add("hidden"); A.goHome(); };
    const god = el.querySelector("[data-god]"); if (god) god.onclick = () => { el.classList.add("hidden"); A.openGod(); };
    el.querySelectorAll("[data-tx]").forEach((b) => b.onclick = () => {
      const kind = b.dataset.tx;
      if (kind === "self") {
        G().ps.money += 200; A.ensureBank().unshift({ t: A.clockStamp(), kind: "topup", to: "本人", amount: 200, via: "演示", ok: true });
        toast("演示充值 +¥200"); A.openPhone("bank");
      } else if (kind === "wx") {
        A.openPhone("wechat", "landlord");
      } else {
        A.payRentTransfer("银行 App");
        A.openPhone("bank");
      }
    });
    el.querySelectorAll("[data-job]").forEach((b) => b.onclick = () => {
      const id = b.dataset.job, ps = G().ps;
      if (id === "store") { toast("去东街 24便利店找店长打卡排班"); el.classList.add("hidden"); }
      else if (id === "courier") {
        if (ps.needs.energy < 15) return toast("太累了，接不了单");
        ps.money += 18; ps.needs.energy = Math.max(0, ps.needs.energy - 12); ps.needs.hunger = Math.max(0, ps.needs.hunger - 5);
        if (C().skipTo) C().skipTo(C().abs() + 25, 1.0); toast("外卖单完成 · +¥18 · 25 分钟");
        A.openPhone("jobs");
      } else if (id === "guard") {
        if (ps.needs.energy < 20) return toast("精力不够值夜班");
        ps.money += 180; ps.needs.energy = Math.max(0, ps.needs.energy - 25);
        if (C().skipTo) C().skipTo(C().abs() + 240, 1.2); toast("夜班结束 · +¥180");
        A.openPhone("jobs");
      }
    });
    // scroll chat to bottom
    const bub = el.querySelector(".wx-bubbles"); if (bub) bub.scrollTop = bub.scrollHeight;
  };

  A.refreshPhone = function () { const el = document.getElementById("phonepanel"); if (el && !el.classList.contains("hidden")) A.openPhone(A._phoneTab || "home", A._phoneThread); };
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
