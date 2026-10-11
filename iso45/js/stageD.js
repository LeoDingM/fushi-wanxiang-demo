/* scene-proto-45 · Stage D: civic gameplay loops, phone map polish, bus/housing UX, civic NPC schedules. */
(function (SP) {
  "use strict";
  const D = (SP.stageD = {});
  const G = () => SP.game, R = () => G() && G().rules, C = () => SP.clock;
  const prices = () => (R() && R().data.prices) || {};
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 2600);
  const log = (t) => SP.world && SP.world.logEvent(t);
  const ps = () => G() && G().ps;
  const needs = () => (ps() && ps().needs) || {};
  const A = () => SP.stageA;

  D.ensure = function () {
    const p = ps(); if (!p) return null;
    if (!p.civic) {
      p.civic = {
        police: { filed: false, stamped: false, finePaid: false, helped: false },
        hospital: { registered: false, seen: false, script: null, bought: false },
        fire: { toured: false, drilled: false, safety: false },
        flags: {}
      };
    }
    if (!p.flags) p.flags = {};
    if (!p.mapMarks) p.mapMarks = [];
    return p.civic;
  };

  // ---------- day/night civic NPC duty ----------
  // Police daytime 09–17; hospital 08–11:30 & 14–17:30; fire daytime 08–18 (night skeleton crew message).
  D.minOfDay = function () {
    try { return (C().abs() % 1440 + 1440) % 1440; } catch (e) { return 12 * 60; }
  };
  D.inRange = function (m, a, b) { return a <= b ? m >= a && m < b : m >= a || m < b; };
  D.hm = (h, m) => h * 60 + (m || 0);
  D.onDuty = function (kind) {
    const m = D.minOfDay();
    // Daytime windows (night = off / skeleton). Hospital keeps a soft midday lull in copy only.
    if (kind === "police") return D.inRange(m, D.hm(9), D.hm(17));
    if (kind === "hospital") return D.inRange(m, D.hm(8), D.hm(17, 30));
    if (kind === "fire") return D.inRange(m, D.hm(8), D.hm(18));
    return true;
  };
  D.npcName = { police: "民警小张", hospital: "护士小周", fire: "消防员小陈" };
  D.npcOffMsg = {
    police: "窗口贴着纸条：「夜间仅接报警电话，办事请白天 09:00–17:00 来。」",
    hospital: "分诊台熄着灯：「非急诊请白天挂号。急诊请拨 120。」",
    fire: "执勤室门虚掩：「夜间备勤中，参观讲解请白天再来。」"
  };

  D.pay = function (key, label) {
    const p = ps(), cost = prices()[key];
    if (cost == null) return { ok: true, amount: 0 };
    if (cost > 0 && p.money < cost) { toast(`钱不够（需要 ¥${cost}）`); return { ok: false }; }
    if (cost > 0) {
      p.money -= cost; p.stats = p.stats || {}; p.stats.spent = (p.stats.spent || 0) + cost;
      if (G().payCard) G().payCard({ amount: cost, method: "微信/现金", to: label || "收款方", what: label || key });
    }
    return { ok: true, amount: cost || 0 };
  };
  D.bumpNeeds = function (fx) {
    const n = needs();
    for (const k of Object.keys(fx || {})) {
      if (n[k] == null) continue;
      n[k] = Math.max(0, Math.min(100, n[k] + fx[k]));
    }
    G().hud && G().hud();
  };
  D.skipMin = function (mins, dur) {
    const abs0 = C().abs();
    if (C().skipTo) C().skipTo(abs0 + mins, dur != null ? dur : 1.0);
    else C().min = (C().min || 0) + mins;
  };

  // ---------- police loop ----------
  D.policeMenu = function (o) {
    D.ensure();
    if (!D.onDuty("police")) return D.npcOffMsg.police;
    const cv = D.ensure().police;
    const opts = [
      {
        id: "report", ok: true, label: cv.filed ? "已立案（查看回执）" : "填写报案登记（丢手机／噪音）",
        fn: () => {
          if (cv.filed) { toast("回执号：井槐报警字〔演示〕00" + ((ps().day || 1) % 90 + 10)); return null; }
          cv.filed = true; ps().flags.police_filed = true;
          D.skipMin(12, 1.1);
          toast("已受理报案 · 回执已开 · 约 12 分钟"); log("派出所立案");
          D.bumpNeeds({ mood: 4 });
          return null;
        }
      },
      {
        id: "help", ok: true, label: "求助：楼道飞线充电怎么处理？",
        fn: () => {
          cv.helped = true; ps().flags.police_tip_wire = true;
          toast("民警小张：先拍照留证，别私自剪线；我们会联系物业巡查。"); log("派出所求助·飞线");
          D.bumpNeeds({ mood: 3 });
          return null;
        }
      },
      {
        id: "fine", ok: !cv.finePaid, label: cv.finePaid ? "罚款已缴" : `主动认缴：乱扔垃圾罚款（¥${prices().police_fine_litter || 50}）`,
        fn: () => {
          if (cv.finePaid) { toast("这笔罚款已结清"); return null; }
          const r = D.pay("police_fine_litter", "井槐里派出所·罚款");
          if (!r.ok) return null;
          cv.finePaid = true; ps().flags.police_fine_clear = true;
          toast(`已缴罚款 ¥${r.amount} · 民警提醒下次注意`); log("缴罚款");
          D.bumpNeeds({ mood: -2, energy: -2 });
          return null;
        }
      },
      {
        id: "chat", ok: true, label: "跟民警小张闲聊几句",
        fn: () => {
          const lines = [
            "小张：最近电动车充电规范宣传做了一轮，楼道好多了。",
            "小张：丢了东西先挂失，再来补报案材料。",
            "小张：夜里吵闹可以打我们电话，别冲动上门。"
          ];
          toast(lines[(Math.random() * lines.length) | 0]); D.bumpNeeds({ mood: 2 });
          return null;
        }
      }
    ];
    G().openMenu(Object.assign({}, o, { _name: o.name || "报案窗口" }), opts.map((x) => ({
      id: x.id, ok: x.ok !== false, label: x.label, fn: x.fn
    })));
    return null;
  };
  D.policeStamp = function (o) {
    D.ensure();
    const cv = D.ensure().police;
    if (!D.onDuty("police")) return D.npcOffMsg.police;
    if (!cv.filed && !cv.finePaid) return "请先在窗口办结业务，再来盖章。";
    if (cv.stamped) return "回执上已经盖过「井槐里派出所」业务章了。";
    const opts = [{
      id: "stamp", ok: true, label: "盖业务章（免费）",
      fn: () => {
        cv.stamped = true; ps().flags.police_stamp = true;
        D.skipMin(3, 0.7);
        toast("咔——盖好章了。证明/回执有效。"); log("派出所盖章");
        D.bumpNeeds({ mood: 3 });
        return null;
      }
    }];
    G().openMenu(Object.assign({}, o, { _name: "印章柜" }), opts);
    return null;
  };
  D.policeInterview = function (o) {
    D.ensure();
    const cv = D.ensure().police;
    if (!cv.filed) return "询问室空着。需要先到窗口立案。";
    if (!D.onDuty("police")) return "询问室门锁着（夜间不办询问）。";
    const opts = [{
      id: "iv", ok: true, label: "配合简单询问（约 15 分钟）",
      fn: () => {
        D.skipMin(15, 1.2);
        toast("询问结束：笔录已签名。小张说有进展会微信联系。"); log("派出所询问");
        D.bumpNeeds({ energy: -6, mood: 2 });
        ps().flags.police_interview = true;
        return null;
      }
    }];
    G().openMenu(Object.assign({}, o, { _name: "询问室" }), opts);
    return null;
  };
  D.policeFile = function () {
    const cv = D.ensure().police;
    if (cv.filed) return `档案柜夹层里有你的回执复印件（已立案${cv.stamped ? "·已盖章" : ""}）。`;
    return "档案柜上了锁，里面是户籍卷宗。";
  };

  // ---------- hospital loop: register → doctor → pharmacy ----------
  D.hospitalNurse = function (o) {
    D.ensure();
    if (!D.onDuty("hospital")) return D.npcOffMsg.hospital;
    const cv = D.ensure().hospital;
    const opts = [
      {
        id: "reg", ok: true, label: cv.registered ? "已挂号（等待就诊）" : `挂号（普通诊 ¥${prices().clinic_register || 8}）`,
        fn: () => {
          if (cv.registered) { toast("号码牌：A-" + (12 + ((ps().day || 1) % 20)) + " · 请去诊室"); return null; }
          const r = D.pay("clinic_register", "社区卫生中心·挂号");
          if (!r.ok) return null;
          cv.registered = true; cv.seen = false; cv.script = null; cv.bought = false;
          ps().flags.hospital_registered = true;
          D.skipMin(5, 0.8);
          toast(`挂号成功 · 号牌 A-${12 + ((ps().day || 1) % 20)} · ¥${r.amount}`); log("医院挂号");
          D.bumpNeeds({ mood: -1 });
          return null;
        }
      },
      {
        id: "vitals", ok: true, label: "测体温／血压（免费）",
        fn: () => {
          D.skipMin(4, 0.7);
          toast("小周：体温 36.6℃，血压正常。注意休息多喝水。"); D.bumpNeeds({ mood: 2 });
          return null;
        }
      },
      {
        id: "chat", ok: true, label: "跟护士小周打招呼",
        fn: () => {
          toast(D.onDuty("hospital")
            ? "小周：今天号源还行，诊室在里面左手边。"
            : D.npcOffMsg.hospital);
          return null;
        }
      }
    ];
    G().openMenu(Object.assign({}, o, { _name: "分诊台" }), opts);
    return null;
  };
  D.hospitalDoctor = function (o) {
    D.ensure();
    const cv = D.ensure().hospital;
    if (!D.onDuty("hospital")) return "诊室门关着，灯灭了。";
    if (!cv.registered) return "请先去分诊台挂号。";
    if (cv.seen && cv.script) return `张医生：处方还在——「${cv.script}」。去药房取药吧。`;
    const fee = prices().clinic_consult || 25;
    const opts = [{
      id: "see", ok: true, label: `问诊开方（诊金 ¥${fee}）`,
      fn: () => {
        const r = D.pay("clinic_consult", "社区卫生中心·诊金");
        if (!r.ok) return null;
        cv.seen = true;
        const scripts = ["感冒冲剂+维生素C", "创可贴+碘伏棉棒", "胃药+口服补液盐"];
        cv.script = scripts[(Math.random() * scripts.length) | 0];
        ps().flags.hospital_seen = true;
        D.skipMin(18, 1.3);
        toast(`张医生：先观察两天。处方：${cv.script}。去药房取药。`); log("医院就诊");
        D.bumpNeeds({ mood: 4, energy: -4 });
        return null;
      }
    }];
    G().openMenu(Object.assign({}, o, { _name: "诊室" }), opts);
    return null;
  };
  D.pharmacyMenu = function (o) {
    D.ensure();
    const cv = D.ensure().hospital;
    const opts = [];
    if (cv.seen && cv.script && !cv.bought) {
      opts.push({
        id: "rx", ok: true, label: `凭处方取药（约 ¥${prices().medicine_cold || 18}）`,
        fn: () => {
          const r = D.pay("medicine_cold", "社区药房");
          if (!r.ok) return null;
          cv.bought = true; ps().flags.hospital_meds = true;
          D.skipMin(6, 0.8);
          toast(`药剂师：按疗程吃。已取「${cv.script}」`); log("取药");
          D.bumpNeeds({ hunger: 4, energy: 10, mood: 8, hygiene: 2 });
          return null;
        }
      });
    }
    opts.push({
      id: "cold", ok: true, label: `自购感冒药（¥${prices().medicine_cold || 18}）`,
      fn: () => {
        const r = D.pay("medicine_cold", "社区药房");
        if (!r.ok) return null;
        D.skipMin(3, 0.5);
        toast("买了一盒感冒药，吞了两粒，舒服点了"); log("买感冒药");
        D.bumpNeeds({ energy: 8, mood: 5, hunger: 2 });
        return null;
      }
    });
    opts.push({
      id: "band", ok: true, label: `创可贴（¥${prices().medicine_band || 6}）`,
      fn: () => {
        const r = D.pay("medicine_band", "社区药房");
        if (!r.ok) return null;
        toast("贴上创可贴，手指不那么刺痛了"); D.bumpNeeds({ mood: 3, hygiene: 4 });
        return null;
      }
    });
    opts.push({
      id: "vit", ok: true, label: `维生素C（¥${prices().medicine_vitamins || 22}）`,
      fn: () => {
        const r = D.pay("medicine_vitamins", "社区药房");
        if (!r.ok) return null;
        toast("嚼了片维生素，精神好一点"); D.bumpNeeds({ energy: 6, mood: 4 });
        return null;
      }
    });
    G().openMenu(Object.assign({}, o, { _name: o.name || "药房" }), opts);
    return null;
  };

  // ---------- fire loop ----------
  D.fireDuty = function (o) {
    D.ensure();
    if (!D.onDuty("fire")) return D.npcOffMsg.fire;
    const cv = D.ensure().fire;
    const opts = [
      {
        id: "tour", ok: true, label: cv.toured ? "已参观登记" : "登记短途参观（免费）",
        fn: () => {
          if (cv.toured) { toast("小陈：欢迎再来，记得关注消防通道。"); return null; }
          cv.toured = true; ps().flags.fire_tour = true;
          D.skipMin(10, 1.1);
          toast("小陈带你看了车库与执勤室，嘱咐楼道勿堆物。"); log("消防站参观");
          D.bumpNeeds({ mood: 5, energy: -3 });
          return null;
        }
      },
      {
        id: "drill", ok: true, label: "参加 5 分钟灭火器讲解／小演练",
        fn: () => {
          cv.drilled = true; cv.safety = true;
          ps().flags.fire_safety = true; ps().flags.knowledge_extinguisher = true;
          D.skipMin(8, 1.0);
          toast("学会了「提拔握压」四字诀 · 获得安全知识（小增益）"); log("消防演练");
          D.bumpNeeds({ mood: 6, energy: -5 });
          // small lasting buff flag checked elsewhere lightly
          return null;
        }
      },
      {
        id: "chat", ok: true, label: "跟消防员小陈聊天",
        fn: () => {
          toast("小陈：家里最好备个灭火器，过期了要换。厨房油锅起火先盖盖。");
          D.bumpNeeds({ mood: 2 });
          return null;
        }
      }
    ];
    G().openMenu(Object.assign({}, o, { _name: "执勤台" }), opts);
    return null;
  };
  D.fireGear = function (o) {
    D.ensure();
    const cv = D.ensure().fire;
    if (!D.onDuty("fire") && !cv.safety) return "装备柜上着锁。白天可找值班员讲解。";
    const opts = [{
      id: "ext", ok: true, label: cv.safety ? "复习灭火器要领" : "体验灭火器演示（解锁安全知识）",
      fn: () => {
        cv.drilled = true; cv.safety = true;
        ps().flags.fire_safety = true; ps().flags.knowledge_extinguisher = true;
        D.skipMin(5, 0.8);
        toast(cv.toured
          ? "又练了一遍，手法更熟了（安全知识）"
          : "演示结束：记住「提拔握压」· 已解锁安全知识");
        log("灭火器演示");
        D.bumpNeeds({ mood: 4, energy: -3 });
        return null;
      }
    }];
    G().openMenu(Object.assign({}, o, { _name: o.name || "装备" }), opts);
    return null;
  };
  D.fireTruck = function (o) {
    D.ensure();
    if (!D.onDuty("fire")) return "消防车静静停着，夜间备勤勿攀爬。";
    const opts = [{
      id: "look", ok: true, label: "听讲解：消防车装备一览（约 6 分钟）",
      fn: () => {
        D.ensure().fire.toured = true; ps().flags.fire_tour = true;
        D.skipMin(6, 0.9);
        toast("水炮、水带接口、破拆工具……小陈讲得很细。"); log("参观消防车");
        D.bumpNeeds({ mood: 5, energy: -2 });
        return null;
      }
    }];
    G().openMenu(Object.assign({}, o, { _name: "消防车" }), opts);
    return null;
  };

  // ---------- sit (waiting stools) ----------
  D.sit = function (o) {
    const opts = [{
      id: "sit", ok: true, label: "坐下歇一会儿（约 8 分钟）",
      fn: () => {
        D.skipMin(8, 0.9);
        toast("坐着缓了缓，腿没那么酸了"); D.bumpNeeds({ energy: 6, mood: 2 });
        return null;
      }
    }];
    G().openMenu(Object.assign({}, o, { _name: o.name || "座位" }), opts);
    return null;
  };

  // ---------- safety buff: tiny mood floor when flag set (applied on civic enter toast once/day) ----------
  D.maybeSafetyTip = function () {
    const p = ps(); if (!p || !p.flags || !p.flags.knowledge_extinguisher) return;
    const day = (C().day != null ? C().day : 0);
    if (p._safetyTipDay === day) return;
    p._safetyTipDay = day;
    // quiet: no spam; only bump once lightly if mood low
    if (needs().mood < 40) D.bumpNeeds({ mood: 2 });
  };

  // ---------- actionFor / use hooks ----------
  const CIVIC_KINDS = {
    police_desk: 1, police_stamp: 1, police_interview: 1, police_file: 1,
    hospital_nurse: 1, hospital_doctor: 1, pharmacy: 1,
    fire_duty: 1, fire_gear: 1, fire_truck: 1, sit: 1
  };
  D.actionFor = function (o, kind) {
    if (kind !== "use") return null;
    const k = o.interact;
    if (!CIVIC_KINDS[k]) return undefined;
    const labels = {
      police_desk: "报案／办事",
      police_stamp: "盖章／取印",
      police_interview: "进入询问",
      police_file: "查档案",
      hospital_nurse: "分诊／挂号",
      hospital_doctor: "看医生",
      pharmacy: "药房取药／购药",
      fire_duty: "执勤登记／讲解",
      fire_gear: "装备／灭火器",
      fire_truck: "看消防车",
      sit: "坐下休息"
    };
    return { label: labels[k] || "互动", do: "game" };
  };
  D.use = function (o) {
    const k = o.interact;
    switch (k) {
      case "police_desk": return D.policeMenu(o);
      case "police_stamp": return D.policeStamp(o);
      case "police_interview": return D.policeInterview(o);
      case "police_file": return D.policeFile(o);
      case "hospital_nurse": return D.hospitalNurse(o);
      case "hospital_doctor": return D.hospitalDoctor(o);
      case "pharmacy": return D.pharmacyMenu(o);
      case "fire_duty": return D.fireDuty(o);
      case "fire_gear": return D.fireGear(o);
      case "fire_truck": return D.fireTruck(o);
      case "sit": return D.sit(o);
    }
    return undefined;
  };

  // ---------- civic NPC actors inside interiors (day/night) ----------
  D.NPC_SPEC = {
    civic_police: { id: "civic_cop", set: "police", x: 1.4, y: 2.8, dir: "E", kind: "police", name: "民警小张" },
    civic_hospital: { id: "civic_nurse", set: "nurse", x: 6.0, y: 3.0, dir: "W", kind: "hospital", name: "护士小周" },
    civic_fire: { id: "civic_firefighter", set: "firefighter", x: 2.4, y: 5.3, dir: "S", kind: "fire", name: "消防员小陈" }
  };
  D.syncCivicNpcs = function () {
    if (!SP.world || !SP.world.interior) return;
    const sid = SP.world.sceneId, spec = D.NPC_SPEC[sid];
    SP.actors.list = SP.actors.list.filter((a) => a === SP.player || !(a.id && String(a.id).indexOf("civic_") === 0));
    if (!spec) return;
    if (!D.onDuty(spec.kind)) return;
    if (!window.ACTORS || !window.ACTORS[spec.set]) return;
    let a = SP.actors.list.find((x) => x.id === spec.id);
    if (!a) {
      a = new SP.Actor({ id: spec.id, set: spec.set, x: spec.x, y: spec.y, radius: 0.22, speed: 0, height: 1.8 });
      a.setDir(spec.dir);
      a.civicKind = spec.kind; a.civicName = spec.name;
      SP.actors.list.push(a);
    } else {
      a.x = spec.x; a.y = spec.y; a.hidden = false;
    }
  };
  D.talkCivicNpc = function (actor) {
    if (!actor || !actor.civicKind) return null;
    const kind = actor.civicKind;
    if (!D.onDuty(kind)) return D.npcOffMsg[kind];
    if (kind === "police") return D.policeMenu({ id: "npc_cop", name: actor.civicName, interact: "police_desk" });
    if (kind === "hospital") return D.hospitalNurse({ id: "npc_nurse", name: actor.civicName, interact: "hospital_nurse" });
    if (kind === "fire") return D.fireDuty({ id: "npc_ff", name: actor.civicName, interact: "fire_duty" });
    return null;
  };

  // ---------- phone map polish (tap-to-mark) ----------
  D.pois = function () {
    return [
      { id: "xin", name: "馨园公寓", mark: "馨", x: 82, y: 15.5, cat: "住", walk: 18 },
      { id: "home12", name: "井槐里12号", mark: "12", x: 1.5, y: 12, cat: "住", walk: 3 },
      { id: "store", name: "24便利店", mark: "店", x: 48, y: -4, cat: "购", walk: 10 },
      { id: "metro", name: "地铁·井槐里", mark: "轨", x: 41.2, y: -10.6, cat: "交", walk: 8 },
      { id: "bus_j", name: "公交·井槐里", mark: "公交", x: -20, y: 2.4, cat: "交", walk: 4, bus: true },
      { id: "bus_h", name: "公交·卫生中心", mark: "公交", x: -46, y: 2.4, cat: "交", walk: 9, bus: true },
      { id: "bus_e", name: "公交·东街", mark: "公交", x: 74.5, y: 2.4, cat: "交", walk: 16, bus: true },
      { id: "police", name: "派出所", mark: "警", x: -36, y: -6.5, cat: "公", walk: 7 },
      { id: "hospital", name: "社区医院", mark: "医", x: 22, y: -6.5, cat: "公", walk: 9 },
      { id: "fire", name: "消防站", mark: "消", x: 58, y: -6.5, cat: "公", walk: 12 }
    ];
  };
  D.markPoi = function (id) {
    const p = ps(); D.ensure();
    const poi = D.pois().find((q) => q.id === id); if (!poi) return;
    p.mapMarks = p.mapMarks.filter((m) => m.id !== id);
    p.mapMarks.unshift({ id, name: poi.name, x: poi.x, y: poi.y, t: (A() && A().clockStamp && A().clockStamp()) || "" });
    if (p.mapMarks.length > 8) p.mapMarks.length = 8;
    p.navTarget = { x: poi.x, y: poi.y, name: poi.name };
    toast(`已标记「${poi.name}」· 地图钉已更新`);
    if (A() && A().openPhone) A().openPhone("map");
  };
  D.clearMarks = function () {
    const p = ps(); if (!p) return;
    p.mapMarks = []; p.navTarget = null; toast("已清除地图标记");
    if (A() && A().openPhone) A().openPhone("map");
  };
  D.gotoMarked = function () {
    const p = ps(), t = p && p.navTarget; if (!t) return toast("还没有标记地点");
    // Prefer known spawn keys
    const key = (D.pois().find((q) => q.name === t.name) || {}).id;
    if (key && A() && A().spawnAt && ["police", "hospital", "fire", "xin", "home12"].includes(key)) {
      if (document.getElementById("phonepanel")) document.getElementById("phonepanel").classList.add("hidden");
      A().spawnAt(key); return;
    }
    // street teleport near mark (god-lite navigation for demo)
    if (SP.world && SP.world.interior) G().switchScene("street", [t.x, t.y + 1.2, "N"]);
    else { SP.player.x = t.x; SP.player.y = t.y + 1.2; }
    if (document.getElementById("phonepanel")) document.getElementById("phonepanel").classList.add("hidden");
    toast(`已导航至「${t.name}」附近`);
  };

  D.renderMapApp = function () {
    D.ensure();
    const marks = (ps().mapMarks || []).map((m) => m.id);
    const nav = ps().navTarget;
    const fare = (A() && A().busFare && A().busFare()) || prices().bus_fare || 2;
    const ride = (A() && A().busRideMin && A().busRideMin()) || prices().bus_ride_min || 6;
    const rows = D.pois().map((p) => {
      const on = marks.includes(p.id) || (nav && nav.name === p.name);
      const bus = p.bus ? ` · 公交约 ${ride} 分（¥${fare}）` : "";
      return `<button type="button" class="pmap-poi${on ? " on" : ""}" data-mark="${p.id}">
        <span class="mk">${p.mark}</span>
        <span class="info"><b>${p.name}</b><i>${p.cat} · 步行约 ${p.walk} 分${bus}</i></span>
        <span class="pin">${on ? "📍" : "＋"}</span>
      </button>`;
    }).join("");
    const navLine = nav ? `<div class="pmap-nav">当前标记：<b>${nav.name}</b>
      <button type="button" data-navgo>前往</button>
      <button type="button" data-navclr class="ghost">清除</button></div>` : `<div class="pmap-nav hint">点地点可标记；标记后可「前往」。</div>`;
    return `<div class="pmap pmap-rich">
      <div class="pmap-head">井槐里街区 · 导航</div>
      ${navLine}
      <div class="pmap-list">${rows}</div>
    </div>`;
  };

  // ---------- bank polish (status chips) ----------
  D.bankExtra = function () {
    D.ensure();
    const cv = D.ensure();
    const bits = [];
    if (cv.police.stamped) bits.push("派出所章✓");
    if (cv.hospital.bought) bits.push("近期取药✓");
    if (cv.fire.safety) bits.push("消防知识✓");
    if (!bits.length) return "";
    return `<p class="hint">市民档案：${bits.join(" · ")}</p>`;
  };

  // ---------- bus polish: explicit skip-ride + timetable wait ----------
  D.polishBus = function () {
    const SA = A(); if (!SA || SA._busPolished) return;
    SA._busPolished = true;
    const prev = SA.boardBus.bind(SA);
    SA.boardBus = function (fromObj) {
      const here = fromObj && fromObj.id, fare = SA.busFare(), mins = SA.busRideMin();
      const dests = SA.busStops.filter((s) => s.id !== here);
      if (!dests.length) return toast("本线暂无其他站");
      const opts = [];
      dests.forEach((s) => {
        opts.push({
          id: "bus_" + s.id, ok: true,
          label: `坐公交 → ${s.name}（¥${fare} · ${mins}分钟 · 跳过车程）`,
          fn: () => { SA.doBusRide(s, fare, mins); return null; }
        });
      });
      opts.push({
        id: "wait_next", ok: true, label: "等下一班（推进到发车时刻）",
        fn: () => {
          const m = D.minOfDay();
          // buses at :00/:20/:40
          let next = ((Math.floor(m / 20) + 1) * 20);
          if (next >= 23 * 60) { toast("已过末班，明早再来"); return null; }
          const wait = Math.max(1, next - m);
          D.skipMin(wait, 1.0);
          toast(`等了 ${wait} 分钟，车来了`); return null;
        }
      });
      opts.push({
        id: "timetable", ok: true, label: "看手机公交时刻表",
        fn: () => { if (SA.openPhone) SA.openPhone("bus"); return null; }
      });
      G().openMenu(Object.assign({}, fromObj, { _name: fromObj.name || "公交站" }), opts);
    };
  };

  // ---------- phone openPhone patch for map / bank ----------
  D.polishPhone = function () {
    const SA = A(); if (!SA || SA._phonePolished) return;
    SA._phonePolished = true;
    const prev = SA.openPhone.bind(SA);
    SA.openPhone = function (tab, threadId) {
      prev(tab, threadId);
      const el = document.getElementById("phonepanel"); if (!el) return;
      if (tab === "map") {
        const body = el.querySelector(".pbd");
        if (body) {
          body.innerHTML = D.renderMapApp();
          body.querySelectorAll("[data-mark]").forEach((b) => b.onclick = () => D.markPoi(b.dataset.mark));
          const go = body.querySelector("[data-navgo]"); if (go) go.onclick = () => D.gotoMarked();
          const clr = body.querySelector("[data-navclr]"); if (clr) clr.onclick = () => D.clearMarks();
        }
      } else if (tab === "bank") {
        const body = el.querySelector(".pbd");
        if (body && !body.querySelector(".civic-chips")) {
          const extra = D.bankExtra();
          if (extra) {
            const div = document.createElement("div");
            div.className = "civic-chips";
            div.innerHTML = extra;
            body.appendChild(div);
          }
        }
      }
    };
  };

  // ---------- xin mailbox / stairs UX via notice overrides ----------
  D.xinMailboxNote = function () {
    const H = A() && A().ensureHousing && A().ensureHousing();
    const owned = (H && H.owned) || [];
    const xin = owned.filter((id) => String(id).indexOf("xin") >= 0 || String(id).indexOf("F-xin") >= 0);
    if (xin.length) return `馨园信报箱：你名下 ${xin.length} 套房有格口。快递柜在一层门外；物业费账单也会塞这里。楼梯在走廊东侧（无电梯）。`;
    return "馨园公寓信报箱 · 快递柜在一层门外 · 本楼无电梯，请走楼梯（1–4F）";
  };

  // ---------- install ----------
  D.install = function () {
    const g = G(); if (!g || g._stageD) return; g._stageD = true;
    D.ensure();
    D.polishBus();
    D.polishPhone();

    const prevAF = g.actionFor.bind(g);
    g.actionFor = function (o, kind) {
      // talk to civic NPC actors
      if (o && o.civicKind && kind === "use") return { label: `与${o.civicName || "值班人员"}对话`, do: "game" };
      const hit = D.actionFor(o, kind);
      if (hit !== undefined) return hit;
      return prevAF(o, kind);
    };
    const prevUse = g.use.bind(g);
    g.use = function (o) {
      if (o && o.civicKind) return D.talkCivicNpc(o);
      const hit = D.use(o);
      if (hit !== undefined) return hit;
      // xin mailbox richer copy
      if (o && o.id === "xin_mail" && o.interact === "notice") return D.xinMailboxNote();
      if (o && o.id === "xin_notice") {
        return "馨园公寓：1–4F 一房一厅在租 · 链居中介 · 本楼无电梯，请走东侧楼梯 · 看房请预约";
      }
      return prevUse(o);
    };

    // Hook place.enter to sync civic NPCs
    if (SP.place && SP.place.enter && !SP.place._stageDEnter) {
      const prevEnter = SP.place.enter.bind(SP.place);
      SP.place._stageDEnter = true;
      SP.place.enter = function (to, spawn) {
        prevEnter(to, spawn);
        try { D.syncCivicNpcs(); D.maybeSafetyTip(); } catch (e) {}
      };
    }

    // Near-target: allow E on civic NPC if closest actor
    // Interact list already covers furniture; NPCs need to be in near list — patch main near if possible
    if (SP.world && !SP.world._civicNpcNear) {
      SP.world._civicNpcNear = true;
      const prevNear = SP.world.nearAll || SP.world.near;
      // interact.js nearAll returns interactables; also expose civic actors via a light wrap on game near in main — skip if complex
    }

    // Periodic duty sync while inside civic
    setInterval(() => {
      try {
        if (SP.world && SP.world.interior && D.NPC_SPEC[SP.world.sceneId]) D.syncCivicNpcs();
      } catch (e) {}
    }, 4000);

    // CSS for map app
    if (!document.getElementById("stageD-css")) {
      const st = document.createElement("style"); st.id = "stageD-css";
      st.textContent = `
        .pmap-rich .pmap-head{font-weight:700;margin:4px 0 8px;color:#f5f5f7}
        .pmap-rich .pmap-nav{font-size:12px;color:#c7c7cc;margin-bottom:10px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
        .pmap-rich .pmap-nav button{background:#0a84ff;color:#fff;border:0;border-radius:8px;padding:5px 10px;cursor:pointer;font-size:12px}
        .pmap-rich .pmap-nav button.ghost{background:#2c2c2e}
        .pmap-rich .pmap-nav.hint{opacity:.75}
        .pmap-poi{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:#1c1c1e;border:1px solid #2c2c2e;border-radius:12px;padding:10px;margin:0 0 8px;color:#f5f5f7;cursor:pointer}
        .pmap-poi.on{border-color:#0a84ff;background:#152238}
        .pmap-poi .mk{width:36px;height:36px;border-radius:10px;background:#4cd964;color:#041;display:grid;place-items:center;font-weight:700;font-size:12px;flex:none}
        .pmap-poi .info{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}
        .pmap-poi .info b{font-size:14px}
        .pmap-poi .info i{font-style:normal;font-size:11px;color:#8e8e93}
        .pmap-poi .pin{font-size:16px;flex:none}
        .civic-chips{margin-top:12px;color:#8e8e93;font-size:12px}
      `;
      document.head.appendChild(st);
    }
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageA) D.install();
    else setTimeout(boot, 60);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})(window.SP || (window.SP = {}));
