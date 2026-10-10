/* scene-proto-45 · NPC day/night schedules + greet affinity.
   Owns schedule steering for neighborhood NPCs (office / student / vendor / uncle):
   home → commute/work|school → evening home, tied to SP.clock; night prefers indoor (hidden).
   Greet/chat (E near NPC, or SP.npcSchedule.greet) raises affinity with toast + HUD.
   Does not edit npc.js / stageR / charB / appearance — wraps SP.npcs.update + SP.actions.interact. */
(function (SP) {
  "use strict";
  const NS = (SP.npcSchedule = SP.npcSchedule || {});
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 2600);
  const log = (t) => SP.world && SP.world.logEvent && SP.world.logEvent(t);

  // School street waypoints (Char-B signs / spawnAt); fallback generic sidewalk
  /** Future midtown / near-downtown approach: east sidewalk just before chunks/east (rect x≥46.5). */
  NS.midtownEdge = function () {
    return [46.0, 2.2];
  };
  /** Metro 井槐里站 street mouth — commute hop toward midtown. */
  NS.metroEdge = function () {
    return [41.2, -6.8];
  };
  NS.schoolWaypoint = function () {
    try {
      if (SP.charB && SP.charB.SIGNS) {
        // prefer high school (east) then mid — path leans midtown/east
        const high = SP.charB.SIGNS.find((x) => x.id === "school_high");
        const mid = SP.charB.SIGNS.find((x) => x.id === "school_mid");
        const s = high || mid || SP.charB.SIGNS.find((x) => String(x.id).indexOf("school") === 0);
        if (s) return [s.x, -6.5];
      }
    } catch (e) {}
    return [37.0, -6.5]; // school_high street fallback (east of courtyard)
  };
  NS.workWaypoint = function () {
    // Near-downtown pivot: office workers head to midtown/east edge (not local alley)
    return NS.midtownEdge();
  };

  /** Schedule profiles for ≥4 neighborhood NPCs (minutes-of-day slots). */
  NS.PROFILES = {
    office: {
      name: "上班族小陈",
      home: [-10.5, 3.6],
      role: "work",
      // night home → morning commute → day work → evening stroll/home → night home
      slots: [
        { until: 450, at: "home", hidden: true },          // 00:00–07:30
        { until: 540, at: "commute" },                     // 07:30–09:00
        { until: 1080, at: "work" },                       // 09:00–18:00
        { until: 1260, at: "home" },                       // 18:00–21:00 evening home
        { until: 1440, at: "home", hidden: true }          // 21:00+
      ]
    },
    student: {
      name: "学生小林",
      home: [1.5, 11.9],
      role: "school",
      slots: [
        { until: 420, at: "home", hidden: true },
        { until: 510, at: "commute" },                     // leave for school
        { until: 960, at: "school" },                      // in/near school
        { until: 1140, at: "home" },                       // afternoon home
        { until: 1320, at: "stroll" },                     // evening courtyard
        { until: 1440, at: "home", hidden: true }
      ]
    },
    vendor: {
      name: "王阿姨",
      home: [1.5, 11.9],
      stall: [-0.4, 3.6],
      role: "stall",
      slots: [
        { until: 330, at: "home", hidden: true },          // before dawn
        { until: 420, at: "commute" },
        { until: 1140, at: "stall" },                      // breakfast stall hours
        { until: 1260, at: "home" },
        { until: 1440, at: "home", hidden: true }
      ]
    },
    uncle: {
      name: "张大爷",
      home: [12.4, 11.6],
      role: "stroll",
      slots: [
        { until: 390, at: "home", hidden: true },
        { until: 600, at: "stroll" },                      // morning courtyard loop
        { until: 780, at: "park" },                        // midday sit area
        { until: 1080, at: "stroll" },
        { until: 1260, at: "home" },
        { until: 1440, at: "home", hidden: true }
      ]
    },
    // East-bound white-collar: days path toward midtown/east edge (future downtown)
    walker_e: {
      name: "东街白领",
      home: [44.6, 2.0],
      role: "work",
      slots: [
        { until: 420, at: "home", hidden: true },
        { until: 540, at: "commute" },
        { until: 1080, at: "work" },
        { until: 1260, at: "commute" },
        { until: 1440, at: "home", hidden: true }
      ]
    }
  };

  NS.NAMES = { office: "上班族小陈", student: "学生小林", vendor: "王阿姨", uncle: "张大爷", walker_e: "东街白领" };

  NS.affinity = Object.create(null);
  NS._lastSlot = Object.create(null);
  NS._origRoute = Object.create(null);
  NS._cd = Object.create(null); // greet cooldown (real seconds)
  NS._hudT = 0;
  NS._installed = false;

  NS.getAffinity = function (id) {
    if (NS.affinity[id] == null) NS.affinity[id] = 0;
    return NS.affinity[id];
  };
  NS.setAffinity = function (id, v) {
    NS.affinity[id] = Math.max(0, Math.min(100, v | 0));
    try {
      if (SP.game && SP.game.ps) {
        SP.game.ps.npcAffinity = SP.game.ps.npcAffinity || {};
        SP.game.ps.npcAffinity[id] = NS.affinity[id];
      }
    } catch (e) {}
    return NS.affinity[id];
  };

  NS.slotOf = function (min, profile) {
    const m = ((min % 1440) + 1440) % 1440;
    for (const s of profile.slots) if (m < s.until) return s;
    return profile.slots[profile.slots.length - 1];
  };

  NS.goalFor = function (id, slot) {
    const P = NS.PROFILES[id]; if (!P) return null;
    const at = slot.at;
    if (at === "home") return P.home.slice();
    if (at === "stall") return (P.stall || P.home).slice();
    if (at === "work") return NS.workWaypoint();
    if (at === "school") return NS.schoolWaypoint();
    if (at === "commute") {
      // lean toward midtown/east: office via metro mouth; student toward east school; others mid-home
      if (P.role === "work") return NS.metroEdge();
      if (P.role === "school") {
        const dest = NS.schoolWaypoint();
        return [(P.home[0] + dest[0]) * 0.55, (P.home[1] + dest[1]) * 0.55];
      }
      const dest = P.role === "stall" ? (P.stall || NS.workWaypoint()) : NS.workWaypoint();
      return [(P.home[0] + dest[0]) * 0.5, (P.home[1] + dest[1]) * 0.5];
    }
    if (at === "park") return [14.5, 8.5];
    if (at === "stroll") return [12.4, 5.6];
    return P.home.slice();
  };

  NS.phaseLabel = function (slot) {
    if (!slot) return "—";
    if (slot.hidden) return "在家休息";
    const m = { home: "在家", commute: "通勤中", work: "上班", school: "上学", stall: "摆摊", stroll: "遛弯", park: "歇脚" };
    return m[slot.at] || slot.at;
  };

  NS.ensureOrig = function (a) {
    if (!a || !a.brain || !a.brain.spec) return;
    if (!NS._origRoute[a.id]) {
      NS._origRoute[a.id] = a.brain.spec.route.map((p) => p.slice());
    }
  };

  /** Apply schedule: retarget route toward slot goal; hide at home at night. */
  NS.applyOne = function (a) {
    const P = NS.PROFILES[a.id];
    if (!P || !a.brain || !a.brain.spec) return;
    NS.ensureOrig(a);
    const C = SP.clock; if (!C) return;
    const slot = NS.slotOf(C.min, P);
    const key = slot.at + (slot.hidden ? ":H" : "");
    const goal = NS.goalFor(a.id, slot);
    a.schedSlot = slot;
    a.schedLabel = NS.phaseLabel(slot);
    a.schedName = P.name;

    // Night / indoor preference: arrive home then hide
    if (slot.hidden) {
      const dHome = Math.hypot(a.x - P.home[0], a.y - P.home[1]);
      if (dHome < 0.55 || a.hidden) {
        a.hidden = true;
        a.x = P.home[0]; a.y = P.home[1];
        a.umbrella = false;
        if (NS._lastSlot[a.id] !== key) {
          NS._lastSlot[a.id] = key;
          log(`${P.name}回家休息了`);
        }
        return;
      }
      // walk home via short synthetic route
      a.hidden = false;
      a.brain.spec.route = [[a.x, a.y], P.home.slice()];
      a.brain.spec.mode = "pingpong";
      a.brain.idx = 1;
      a.brain.step = 1;
      a.brain.dwell = 0;
      a.brain.goHome = false;
      if (NS._lastSlot[a.id] !== key) { NS._lastSlot[a.id] = key; log(`${P.name}往家走`); }
      return;
    }

    // Come back out
    if (a.hidden) {
      a.hidden = false;
      a.x = P.home[0]; a.y = P.home[1];
      log(`${P.name}出门了（${NS.phaseLabel(slot)}）`);
    }

    // Retarget when slot changes or far from goal
    const dist = Math.hypot(a.x - goal[0], a.y - goal[1]);
    if (NS._lastSlot[a.id] !== key || dist > 1.2) {
      if (NS._lastSlot[a.id] !== key) {
        NS._lastSlot[a.id] = key;
        log(`${P.name}：${NS.phaseLabel(slot)}`);
      }
      // Short seek route; stay pingpong so npc.js brain keeps working
      if (dist > 0.35) {
        a.brain.spec.route = [[a.x, a.y], goal.slice()];
        a.brain.spec.mode = "pingpong";
        a.brain.idx = 1;
        a.brain.step = 1;
        a.brain.dwell = 0;
        a.brain.pendingCross = null;
        a.crossing = null;
      } else {
        // At destination: light dwell / local micro-route from original if available
        const orig = NS._origRoute[a.id];
        if (slot.at === "stroll" && orig && orig.length >= 2) {
          a.brain.spec.route = orig.map((p) => p.slice());
          a.brain.spec.mode = "loop";
          a.brain.idx = Math.min(a.brain.idx || 1, orig.length - 1);
        } else if (slot.at === "stall" && orig) {
          a.brain.spec.route = orig.map((p) => p.slice());
          a.brain.spec.mode = "pingpong";
          // prefer stall end of vendor route (idx 0)
          a.brain.idx = 0; a.brain.step = 1;
        } else {
          a.brain.spec.route = [goal.slice(), goal.slice()];
          a.brain.spec.mode = "pingpong";
          a.brain.idx = 0;
          a.brain.dwell = Math.max(a.brain.dwell || 0, 2.5);
        }
      }
    }
  };

  NS.applyAll = function () {
    if (!SP.npcs || !SP.npcs.list) return;
    // street only
    if (SP.world && SP.world.interior) return;
    for (const a of SP.npcs.list) {
      if (NS.PROFILES[a.id]) NS.applyOne(a);
    }
    // Night: thin other street wanderers (walker_e) — indoor preference
    const night = SP.clock && (SP.clock.min >= 1320 || SP.clock.min < 420);
    for (const a of SP.npcs.list) {
      if (NS.PROFILES[a.id]) continue;
      if (a.id === "rider") {
        if (night) {
          if (!a._schNight) { a._schNight = true; a._schWasHidden = !!a.hidden; }
          a.hidden = true;
        } else if (a._schNight) {
          a.hidden = !!a._schWasHidden;
          a._schNight = false;
        }
      }
    }
  };

  NS.nearestNpc = function (maxDist) {
    maxDist = maxDist == null ? 1.85 : maxDist;
    const p = SP.player; if (!p || !SP.npcs) return null;
    let best = null, bd = maxDist;
    for (const a of SP.npcs.list) {
      if (!a || a.hidden || a.vehicle) continue;
      if (a.isPlayer) continue;
      const d = Math.hypot(a.x - p.x, a.y - p.y);
      if (d < bd) { bd = d; best = a; }
    }
    return best;
  };

  NS.LINES = {
    greet: [
      "嗨，你好呀。",
      "早啊——今天天气不错。",
      "嘿，又见面了。",
      "嗯？找我有事？"
    ],
    chat: [
      "最近井槐里挺热闹的。",
      "听说东街新开了家奶茶。",
      "忙完这阵子就好了。",
      "记得按时吃饭啊。"
    ],
    warm: [
      "你这人还挺有意思。",
      "熟了就好说话了。",
      "下次一起喝杯茶？"
    ]
  };

  NS.pickLine = function (pool, seed) {
    const i = Math.abs((seed | 0) + Math.floor((SP.now || 0) * 7)) % pool.length;
    return pool[i];
  };

  /** Greet or chat; raises affinity. kind: 'greet' | 'chat' */
  NS.interact = function (a, kind) {
    if (!a) a = NS.nearestNpc();
    if (!a) { toast("附近没有可打招呼的人"); return null; }
    const id = a.id;
    const name = (a.schedName || NS.NAMES[id] || a.civicName || id);
    const now = SP.now || performance.now() / 1000;
    const cd = NS._cd[id] || 0;
    if (now < cd) { toast(`${name}：刚聊过，稍后再说`); return null; }
    NS._cd[id] = now + 2.2;

    kind = kind || "greet";
    const aff0 = NS.getAffinity(id);
    let delta = kind === "chat" ? 8 : 5;
    if (aff0 >= 40) delta = Math.max(2, delta - 2);
    if (aff0 >= 70) delta = Math.max(1, delta - 3);
    // bonus if talking during their active outdoor slot
    if (a.schedSlot && !a.schedSlot.hidden) delta += 1;

    const aff = NS.setAffinity(id, aff0 + delta);
    const pool = aff >= 35 ? NS.LINES.warm.concat(NS.LINES.chat) : kind === "chat" ? NS.LINES.chat : NS.LINES.greet;
    const line = NS.pickLine(pool, (aff * 13) ^ (id.length * 17));

    if (a.bubble !== undefined) a.bubble = { t: 2.4, text: "…" };
    try { a.brain && (a.brain.alert = Math.max(a.brain.alert || 0, 1.2)); } catch (e) {}
    // face player
    try {
      if (SP.player && a.setDir && SP.dirFromWorld) {
        a.setDir(SP.dirFromWorld(SP.player.x - a.x, SP.player.y - a.y));
      }
    } catch (e) {}

    const msg = `${name}「${line}」  好感 +${delta} → ${aff}`;
    toast(msg, 3200);
    log(`${name} 好感 ${aff0}→${aff}`);
    NS.showHud(name, aff, delta, a.schedLabel);
    NS._hudT = 4.5;
    return { id, name, affinity: aff, delta, line };
  };

  NS.greet = function (a) { return NS.interact(a, "greet"); };
  NS.chat = function (a) { return NS.interact(a, "chat"); };

  NS.ensureHud = function () {
    if (document.getElementById("npc-aff-hud")) return;
    const el = document.createElement("div");
    el.id = "npc-aff-hud";
    el.style.cssText = "position:absolute;left:50%;bottom:52px;transform:translateX(-50%);background:rgba(14,16,22,.88);color:#f0dcae;padding:6px 12px;border-radius:8px;font-size:12px;pointer-events:none;z-index:7;display:none;border:1px solid rgba(232,200,138,.35);text-align:center;min-width:180px";
    const wrap = document.getElementById("wrap") || document.body;
    wrap.appendChild(el);
    if (!document.getElementById("npc-sch-css")) {
      const st = document.createElement("style");
      st.id = "npc-sch-css";
      st.textContent = `#npc-aff-hud b{color:#8fd07a} #npc-aff-hud .delta{color:#ffe08a} #npc-aff-hud .phase{color:#9fb4d8;font-size:11px}`;
      document.head.appendChild(st);
    }
  };

  NS.showHud = function (name, aff, delta, phase) {
    NS.ensureHud();
    const el = document.getElementById("npc-aff-hud");
    if (!el) return;
    el.innerHTML = `<div><b>${name}</b> · 好感 <b>${aff}</b> <span class="delta">(+${delta})</span></div>` +
      (phase ? `<div class="phase">日程：${phase}</div>` : "");
    el.style.display = "block";
  };

  NS.tickHud = function (dt) {
    if (NS._hudT > 0) {
      NS._hudT -= dt;
      if (NS._hudT <= 0) {
        const el = document.getElementById("npc-aff-hud");
        if (el) el.style.display = "none";
      }
    }
    // proximity prompt hint
    const near = NS.nearestNpc(1.7);
    if (near && SP.state) {
      const name = near.schedName || NS.NAMES[near.id] || near.id;
      const aff = NS.getAffinity(near.id);
      const phase = near.schedLabel ? ` · ${near.schedLabel}` : "";
      // soft prompt via existing prompt el if empty-ish
      const pe = document.getElementById("prompt");
      if (pe && (!SP.state.near || !SP.state.near.id)) {
        pe.textContent = `E 打招呼 · ${name}（好感 ${aff}）${phase}`;
      }
    }
  };

  NS.wrapUpdate = function () {
    if (!SP.npcs || NS._wrapU) return;
    NS._wrapU = true;
    const prev = SP.npcs.update.bind(SP.npcs);
    SP.npcs.update = function (dt) {
      try { NS.applyAll(); } catch (e) {}
      prev(dt);
      try { NS.tickHud(dt); } catch (e) {}
    };
  };

  NS.wrapInteract = function () {
    if (NS._wrapI) return;
    const tryWrap = () => {
      if (!SP.actions || !SP.actions.interact) return false;
      if (NS._wrapI) return true;
      NS._wrapI = true;
      const prev = SP.actions.interact;
      SP.actions.interact = function () {
        const npc = NS.nearestNpc(1.7);
        const p = SP.player;
        let objNear = false;
        try {
          const n = SP.actions.near && SP.actions.near();
          objNear = !!(n && n.id);
        } catch (e) {}
        // Prefer NPC greet when close and no stronger object, or always if very close
        if (npc && p) {
          const d = Math.hypot(npc.x - p.x, npc.y - p.y);
          if (d < 1.35 || (d < 1.7 && !objNear)) {
            return NS.greet(npc);
          }
        }
        return prev.apply(this, arguments);
      };
      // also expose on __proto
      if (window.__proto) {
        window.__proto.greetNpc = (id) => {
          const a = id ? (SP.npcs.list.find((x) => x.id === id) || null) : NS.nearestNpc();
          return NS.greet(a);
        };
        window.__proto.npcAffinity = (id) => NS.getAffinity(id);
        window.__proto.npcSched = () => {
          const out = {};
          for (const a of (SP.npcs.list || [])) {
            if (!NS.PROFILES[a.id]) continue;
            out[a.id] = { slot: a.schedLabel, hidden: !!a.hidden, x: a.x, y: a.y, aff: NS.getAffinity(a.id) };
          }
          return out;
        };
      }
      return true;
    };
    if (!tryWrap()) {
      const iv = setInterval(() => { if (tryWrap()) clearInterval(iv); }, 200);
    }
  };

  /** Force clock-driven teleport-to-slot for tests / capture (optional soft snap). */
  NS.snapToSchedule = function () {
    NS.applyAll();
    for (const a of SP.npcs.list || []) {
      const P = NS.PROFILES[a.id]; if (!P || !a.schedSlot) continue;
      const g = NS.goalFor(a.id, a.schedSlot);
      if (a.schedSlot.hidden) { a.hidden = true; a.x = P.home[0]; a.y = P.home[1]; }
      else { a.hidden = false; a.x = g[0]; a.y = g[1]; }
    }
  };

  NS.status = function () {
    const rows = [];
    for (const id of Object.keys(NS.PROFILES)) {
      const a = SP.npcs && SP.npcs.list && SP.npcs.list.find((x) => x.id === id);
      rows.push({
        id,
        name: NS.PROFILES[id].name,
        aff: NS.getAffinity(id),
        slot: a && a.schedLabel,
        hidden: !!(a && a.hidden),
        xy: a ? [+(a.x.toFixed(2)), +(a.y.toFixed(2))] : null
      });
    }
    return rows;
  };

  NS.install = function () {
    if (NS._installed) return;
    NS._installed = true;
    NS.wrapUpdate();
    NS.wrapInteract();
    NS.ensureHud();
    // hydrate affinity from save bag if present
    try {
      const bag = SP.game && SP.game.ps && SP.game.ps.npcAffinity;
      if (bag) for (const k of Object.keys(bag)) NS.affinity[k] = bag[k] | 0;
    } catch (e) {}
    // first apply after actors spawn
    const boot = setInterval(() => {
      if (SP.npcs && SP.npcs.list && SP.npcs.list.length) {
        try { NS.applyAll(); } catch (e) {}
        clearInterval(boot);
      }
    }, 150);
  };

  // auto-install when DOM ready / after main
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(NS.install, 0));
  } else {
    setTimeout(NS.install, 0);
  }
  // also when __protoReady
  const readyIv = setInterval(() => {
    if (window.__protoReady) { NS.install(); clearInterval(readyIv); }
  }, 100);
})(window.SP || (window.SP = {}));
