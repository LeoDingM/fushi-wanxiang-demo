/* scene-proto-45 · Amenities-Civic: 社区食堂 / 幼儿园接送点 / 物业中心 (old→midtown edge).
   NEW file — no midtown-star / sport / market/charB/stage* /appearance/npc_schedule edits.
   Building variety: each facade uses a different kit mix (stall+planter / hedge+notice / notice+post), not cloned boxes.
   NO NPC spawns (Char-C owns gender/hair). */
(function (root) {
  "use strict";
  if (!root.SP) return;
  const SP = root.SP;
  const AM = (SP.amenities = SP.amenities || {});
  const AC = (SP.amenityCivic = SP.amenityCivic || {});
  const CANTEEN = "canteen_jhl", PROP = "propcenter_jhl";

  AM.SLIDE_EAST = Object.assign({
    canteen: [50, 0],
    kindergarten: [50, 0],
    property: [50, 0],
    _civicNote: "老街 civic amenities → 中环边缘时套用"
  }, AM.SLIDE_EAST || {});

  // ---------- peripheral price lookup (rules.data.prices + items) ----------
  AC.price = function (key, fallback) {
    try {
      const D = SP.game && SP.game.rules && SP.game.rules.data;
      if (!D) return fallback;
      if (D.items && D.items[key] && D.items[key].price != null) return +D.items[key].price;
      const P = D.prices || {};
      if (typeof P[key] === "number") return +P[key];
      for (const v of Object.values(P)) {
        if (v && typeof v === "object" && !Array.isArray(v) && typeof v[key] === "number") return +v[key];
      }
    } catch (e) {}
    return fallback;
  };

  function tiles(W, D, legend) {
    const leg = legend || { T: "g_tile" };
    const g = { origin: [0, 0], chunk: 2, cols: Math.ceil(W / 2), rows: Math.ceil(D / 2), legend: leg, data_south_to_north: [] };
    const ch = Object.keys(leg)[0] || "T";
    for (let r = 0; r < g.rows; r++) g.data_south_to_north.push(ch.repeat(g.cols));
    return g;
  }
  function walls(W, D, gap, wallState) {
    const objs = [], cols = [];
    const st = wallState || "tile";
    const pushW = (id, x, y, rot) => objs.push({ id, type: "i_wall", x, y, z: 0, rot, state: st });
    for (let x = 0; x < W; x++) pushW("wn_" + x, x, D, 0);
    cols.push({ id: "cN", rect: [0, D, W, D + 0.55] });
    for (let y = 0; y < D; y++) pushW("ww_" + y, 0, y, 6);
    cols.push({ id: "cW", rect: [-0.55, 0, 0.15, D] });
    for (let y = 0; y < D; y++) pushW("we_" + y, W, y, 6);
    cols.push({ id: "cE", rect: [W - 0.15, 0, W + 0.55, D] });
    const g0 = gap.at, g1 = gap.at + gap.w;
    for (let x = 0; x < W; x++) {
      if (x + 0.99 > g0 && x < g1) continue;
      pushW("ws_" + x, x, 0, 0);
    }
    if (g0 > 0.1) cols.push({ id: "cS0", rect: [0, -0.55, g0, 0.15] });
    if (g1 < W - 0.1) cols.push({ id: "cS1", rect: [g1, -0.55, W, 0.15] });
    return { objects: objs, colliders: cols };
  }

  /** 社区食堂 — wider hall, warm counters (not a clone of pharmacy box) */
  function buildCanteen() {
    const W = 8, D = 5.5;
    const gap = { side: "S", at: 3.2, w: 1.4 };
    const w = walls(W, D, gap, "tile");
    const furn = [
      { id: "ct_line", type: "s_counter", x: 2.0, y: 4.0, rot: 0, state: "default", interact: "civic_canteen_line", name: "打菜窗口", meal: "dine" },
      { id: "ct_pack", type: "s_counter", x: 5.2, y: 4.0, rot: 0, state: "default", interact: "civic_canteen_pack", name: "打包台", meal: "pack" },
      { id: "ct_table_a", type: "s_cooler", x: 1.6, y: 2.2, rot: 6, state: "empty", name: "餐柜" },
      { id: "ct_table_b", type: "s_counter", x: 6.2, y: 2.0, rot: 2, state: "default", interact: "civic_canteen_seat", name: "堂食座位" },
      { id: "ct_menu", type: "s_gondola", x: 3.8, y: 1.5, rot: 0, state: "full", interact: "civic_canteen_line", name: "今日菜牌", meal: "dine" }
    ];
    return {
      id: CANTEEN, name: "井槐社区食堂", interior: true, format: "fushi-scene", version: 1,
      bounds: { x0: 0.15, y0: 0.15, x1: W - 0.15, y1: D - 0.15 },
      ground: tiles(W, D),
      objects: w.objects.concat(furn), colliders: w.colliders,
      spawn: [4.0, 1.1, "N"],
      portals: [{ id: "exit_street", rect: [gap.at, 0.1, gap.at + gap.w, 0.55], dir: "S", to: "street", spawn: [35.5, 0.95, "S"], label: "出门" }],
      _amenity: true, _civic: true
    };
  }

  /** 物业中心 — compact office bay, cooler palette / different layout than canteen */
  function buildProperty() {
    const W = 5.5, D = 4.2;
    const gap = { side: "S", at: 2.0, w: 1.2 };
    const w = walls(W, D, gap, "plaster");
    const furn = [
      { id: "pc_desk", type: "s_counter", x: 2.7, y: 2.8, rot: 0, state: "default", interact: "civic_prop_desk", name: "物业柜台" },
      { id: "pc_board", type: "s_gondola", x: 1.2, y: 3.4, rot: 6, state: "full", interact: "civic_prop_board", name: "公告栏" },
      { id: "pc_seat", type: "s_cooler", x: 4.2, y: 1.8, rot: 0, state: "empty", name: "等候椅" }
    ];
    return {
      id: PROP, name: "井槐物业中心", interior: true, format: "fushi-scene", version: 1,
      bounds: { x0: 0.15, y0: 0.15, x1: W - 0.15, y1: D - 0.15 },
      ground: tiles(W, D, { F: "g_tile" }),
      objects: w.objects.concat(furn), colliders: w.colliders,
      spawn: [2.7, 1.0, "N"],
      portals: [{ id: "exit_street", rect: [gap.at, 0.1, gap.at + gap.w, 0.55], dir: "S", to: "street", spawn: [54.5, 4.6, "S"], label: "出门" }],
      _amenity: true, _civic: true
    };
  }

  // Street stubs — VARIETY: different kit mixes / spacing (not three identical stalls)
  // East old-block → midtown approach (clear of market −13..−9 / 15.2 and props 10.2 / −16.8 / 4.8 / −5.6)
  const STREET_STUBS = [
    // 食堂：北人行道、侧路以西（勿占 x22..28 侧路沥青）
    { id: "civic_canteen_a", type: "p_planter", x: 36.8, y: 1.55, z: 0, rot: 0, state: "default", name: "食堂花箱" },
    { id: "civic_canteen_gate", type: "p_stall", x: 35.5, y: 2.55, z: 0, rot: 0, state: "default",
      interact: "civic_canteen", name: "井槐社区食堂", to: CANTEEN, _civic: "canteen" },
    { id: "civic_canteen_b", type: "p_notice", x: 35.5, y: 5.25, z: 0, rot: 0, state: "default",
      interact: "civic_canteen_menu", name: "食堂菜牌" },
    // 幼儿园：侧路以东人行道（勿占侧路）
    { id: "civic_kinder_hedge", type: "p_hedge", x: 58.0, y: 1.5, z: 0, rot: 0, state: "default", name: "幼儿园绿篱" },
    { id: "civic_kinder_gate", type: "p_notice", x: 59.5, y: 5.1, z: 0, rot: 0, state: "default",
      interact: "civic_kinder", name: "井槐幼儿园·接送点", _civic: "kindergarten" },
    { id: "civic_kinder_pot", type: "p_planter", x: 60.5, y: 1.55, z: 0, rot: 6, state: "default", name: "接送区花坛" },
    // 物业：门柱感 post + 窄告示 + 东侧矮摊（办公门脸，非食堂摊）
    { id: "civic_prop_post", type: "p_post", x: 52.5, y: 5.25, z: 0, rot: 0, state: "default", name: "物业门牌柱" },
    { id: "civic_prop_gate", type: "p_notice", x: 54.5, y: 5.2, z: 0, rot: 0, state: "default",
      interact: "civic_property", name: "井槐物业中心", to: PROP, _civic: "property" },
    { id: "civic_prop_side", type: "p_stall", x: 53.5, y: 5.15, z: 0, rot: 0, state: "default", name: "物业侧厢" }
  ];
  AC.streetStubs = STREET_STUBS;
  AC.CANTEEN = CANTEEN;
  AC.PROP = PROP;

  const SIGNS = [
    { id: "canteen", x: 35.5, y: 2.55, z: 2.55, img: "img/amenities/civic/canteen_sign.png" },
    { id: "kindergarten", x: 59.5, y: 5.1, z: 2.45, img: "img/amenities/civic/kinder_sign.png" },
    { id: "property", x: 54.5, y: 5.2, z: 2.5, img: "img/amenities/civic/property_sign.png" }
  ];
  AC.SIGNS = SIGNS;
  AC._signImgs = {};

  function injectStreet() {
    const data = root.SCENE_DATA;
    if (data && Array.isArray(data.objects)) {
      for (const o of STREET_STUBS) {
        if (!data.objects.some((x) => x.id === o.id)) data.objects.push(Object.assign({}, o));
      }
    }
    const W = SP.world;
    if (W && !W.interior && W.objects) {
      for (const src of STREET_STUBS) {
        if (W.byId[src.id]) continue;
        const o = Object.assign({ z: 0, rot: 0, variant: "base", overlays: [], alpha: {} }, src);
        W.objects.push(o); W.byId[o.id] = o;
      }
    }
  }
  AC.injectStreet = injectStreet;

  AC.slideEast = function () {
    for (const o of STREET_STUBS) {
      const key = o._civic || (o.id.indexOf("canteen") >= 0 ? "canteen" : o.id.indexOf("kinder") >= 0 ? "kindergarten" : "property");
      const d = (AM.SLIDE_EAST && AM.SLIDE_EAST[key]) || [50, 0];
      if (!o._civic && !o.interact) {
        // decorative companions follow nearest civic anchor
        const anchor = STREET_STUBS.find((s) => s._civic === key) || o;
        // already applied via loop on interact ones; skip double for decor — apply delta once
      }
      if (o._slid) continue;
      o.x += d[0]; o.y += d[1]; o._slid = true;
      const live = SP.world && SP.world.byId && SP.world.byId[o.id];
      if (live) { live.x = o.x; live.y = o.y; }
    }
    for (const s of SIGNS) {
      const d = (AM.SLIDE_EAST && AM.SLIDE_EAST[s.id]) || [50, 0];
      if (!s._slid) { s.x += d[0]; s.y += d[1]; s._slid = true; }
    }
    for (const o of STREET_STUBS) delete o._slid;
    for (const s of SIGNS) delete s._slid;
    return STREET_STUBS.filter((o) => o.interact).map((o) => ({ id: o.id, x: o.x, y: o.y }));
  };

  function loadSigns() {
    for (const s of SIGNS) {
      if (AC._signImgs[s.id]) continue;
      const im = new Image(); im.src = s.img; AC._signImgs[s.id] = im;
    }
  }
  function drawSigns(ctx) {
    if (!ctx || !SP.sx || !SP.world || SP.world.interior) return;
    const z = (SP.cam && SP.cam.zoom) || 1;
    if (z < 0.28) return;
    for (const s of SIGNS) {
      const im = AC._signImgs[s.id];
      if (!im || !im.complete || !im.naturalWidth) continue;
      const X = SP.sx(s.x, s.y), Y = SP.sy(s.x, s.y, s.z || 2.4);
      const sc = Math.max(0.5, Math.min(1.15, z));
      const w = im.naturalWidth * sc * 0.52, h = im.naturalHeight * sc * 0.52;
      ctx.save(); ctx.globalAlpha = 0.94; ctx.drawImage(im, X - w / 2, Y - h, w, h); ctx.restore();
    }
  }
  AC.drawSigns = drawSigns;

  function bagGive(id, label, emoji, note) {
    try {
      if (SP.stageE && SP.stageE.ensureBag) {
        const bag = SP.stageE.ensureBag();
        const existing = bag.find((x) => x.id === id);
        if (existing) { existing.qty = (existing.qty || 1) + 1; existing.note = note || existing.note; return existing; }
        const it = { id, label, emoji: emoji || "🍱", kind: "misc", note: note || "", t: SP.stageE.stamp ? SP.stageE.stamp() : "", qty: 1 };
        bag.unshift(it); if (bag.length > 24) bag.length = 24; return it;
      }
    } catch (e) {}
    try {
      const ps = SP.game && SP.game.ps;
      if (ps) {
        if (SP.game.rules && SP.game.rules.addItem) SP.game.rules.addItem(ps, id, 1);
        else { ps.items = ps.items || {}; ps.items[id] = (ps.items[id] || 0) + 1; }
      }
    } catch (e) {}
    return { id, label };
  }

  /** 堂食：惠民套餐（staff_meal / cheap eat-out）；打包：便当进背包 */
  AC.buyMeal = function (mode) {
    const ps = SP.game && SP.game.ps; if (!ps) return { ok: false, reason: "无存档" };
    const dinePrice = AC.price("staff_meal", AC.price("buy_kc_cheap", 8));
    const packPrice = AC.price("bento", AC.price("buy_kuaican", 14));
    const price = mode === "pack" ? packPrice : dinePrice;
    const label = mode === "pack" ? "食堂打包便当" : "食堂堂食套餐";
    const item = mode === "pack" ? "bento" : "canteen_meal";
    if (ps.money < price) return { ok: false, reason: `钱不够（要 ¥${price}）` };
    ps.money = Math.round((ps.money - price) * 100) / 100;
    ps.stats = ps.stats || {}; ps.stats.spent = (ps.stats.spent || 0) + price;
    try {
      if (SP.game.rules && SP.game.rules.addItem) SP.game.rules.addItem(ps, item === "canteen_meal" ? "bento" : item, 1);
    } catch (e) {}
    bagGive(mode === "pack" ? "canteen_pack" : "canteen_dine", label, mode === "pack" ? "🥡" : "🍜", "井槐社区食堂");
    ps.amenityCivic = ps.amenityCivic || { meals: 0, pickups: 0, fees: 0, repairs: 0 };
    ps.amenityCivic.meals = (ps.amenityCivic.meals || 0) + 1;
    return { ok: true, label, price, mode };
  };

  AC.kinderPickup = function () {
    const ps = SP.game && SP.game.ps; if (!ps) return { ok: false, reason: "无存档" };
    ps.amenityCivic = ps.amenityCivic || {};
    ps.amenityCivic.pickups = (ps.amenityCivic.pickups || 0) + 1;
    // exterior only — no child NPC spawn
    return { ok: true, n: ps.amenityCivic.pickups, note: "接送点打卡（演示，不生成幼儿NPC）" };
  };

  AC.propertyFee = function () {
    // prefer Stage-H renew fee path when present; else peripheral fixed property
    try {
      if (SP.stageH && typeof SP.stageH.renewByFee === "function") {
        const ok = SP.stageH.renewByFee();
        if (ok) {
          const ps = SP.game.ps;
          ps.amenityCivic = ps.amenityCivic || {};
          ps.amenityCivic.fees = (ps.amenityCivic.fees || 0) + 1;
          return { ok: true, via: "stageH", label: "物业费续期" };
        }
        return { ok: false, reason: "缴费未成功（余额或门禁状态）" };
      }
    } catch (e) {}
    const ps = SP.game && SP.game.ps; if (!ps) return { ok: false, reason: "无存档" };
    const fee = AC.price("property", 40);
    if (ps.money < fee) return { ok: false, reason: `钱不够交物业费（¥${fee}）` };
    ps.money = Math.round((ps.money - fee) * 100) / 100;
    ps.stats = ps.stats || {}; ps.stats.spent = (ps.stats.spent || 0) + fee;
    if (SP.game.payCard) SP.game.payCard({ amount: fee, method: "微信", to: "井槐物业", what: "物业费" });
    ps.amenityCivic = ps.amenityCivic || {};
    ps.amenityCivic.fees = (ps.amenityCivic.fees || 0) + 1;
    return { ok: true, via: "direct", label: "物业费", price: fee };
  };

  AC.reportRepair = function (kind) {
    const ps = SP.game && SP.game.ps; if (!ps) return { ok: false, reason: "无存档" };
    kind = kind || "公区报修";
    ps.gateTickets = ps.gateTickets || [];
    let ticket;
    // Hook Stage-M filing when available (work-order pipeline)
    try {
      if (SP.stageM && typeof SP.stageM.fileGateTicket === "function") {
        const fl = ps.flags || (ps.flags = {});
        fl._gate_quiz_reasons = ["scan"]; // reuse reason slot lightly
        ticket = SP.stageM.fileGateTicket("repair", "物业中心报修·" + kind);
        if (ticket) {
          ticket.reasons = ticket.reasons || [];
          if (ticket.reasons.indexOf(kind) < 0) ticket.reasons.push(kind);
          ticket.from = "物业中心";
        }
      }
    } catch (e) {}
    if (!ticket) {
      const day = (SP.clock && Math.floor((SP.clock.abs ? SP.clock.abs() : 0) / 1440)) || 0;
      const id = "RP-" + day + "-" + (ps.gateTickets.length + 1);
      ticket = { id, day, t: "", choice: "repair", label: "报修·" + kind, reasons: [kind], status: "待跟进", from: "物业中心" };
      ps.gateTickets.unshift(ticket);
      if (ps.gateTickets.length > 20) ps.gateTickets.length = 20;
      try {
        if (SP.stageE && SP.stageE.wxPush) {
          SP.stageE.wxPush("property", `（工单 ${id}）物业中心报修已登记 · 待跟进`, true);
          SP.stageE.wxPush("property", `事由：${kind}`, false);
        }
      } catch (e) {}
    }
    ps.amenityCivic = ps.amenityCivic || {};
    ps.amenityCivic.repairs = (ps.amenityCivic.repairs || 0) + 1;
    return { ok: true, ticket };
  };

  AC.installed = false;
  AC.install = function () {
    if (AC.installed) return;
    const G = SP.game, W = SP.world;
    if (!G || !W) return;
    const toast = (t, ms) => SP.toast && SP.toast(t, ms || 2400);
    const ps = () => G.ps;
    const yuan = (v) => "¥" + (Math.round(v * 100) / 100);
    const opt = (label, fn, ok, reason) => ({ label, fn, ok: ok !== false, reason: reason || "" });

    function enter(id) {
      const sc = SP.scenes[id]; if (!sc) return "还在布置";
      try {
        if (G.switchScene) G.switchScene(id, sc.spawn);
        else if (SP.place && SP.place.enter) SP.place.enter(id, sc.spawn);
        else G.go({ to: id, spawn: sc.spawn, door: null });
      } catch (e) { return "进门失败"; }
      toast(id === CANTEEN ? "进了社区食堂 · 堂食/打包" : "进了物业中心 · 缴费/报修", 2200);
      return null;
    }
    AC.enterCanteen = () => enter(CANTEEN);
    AC.enterProperty = () => enter(PROP);
    AC.status = function () {
      return STREET_STUBS.filter((s) => s.interact).map((s) => {
        const live = W.byId && W.byId[s.id];
        return { id: s.id, name: s.name, x: live ? live.x : s.x, y: live ? live.y : s.y, interact: s.interact };
      });
    };

    SP.places = SP.places || {};
    SP.places[CANTEEN] = { enter: () => enter(CANTEEN) };
    SP.places[PROP] = { enter: () => enter(PROP) };

    try { SP.scenes[CANTEEN] = buildCanteen(); } catch (e) { console.warn("canteen", e); }
    try { SP.scenes[PROP] = buildProperty(); } catch (e) { console.warn("property", e); }
    try { injectStreet(); } catch (e) { console.warn("civic inject", e); }
    try { loadSigns(); } catch (e) {}

    const A0 = G.actionFor, U0 = G.use, P0 = G.pick, UP0 = G.update;
    G.actionFor = function (o, kind) {
      if (!o) return A0.call(G, o, kind);
      if (o.interact === "civic_canteen") return kind === "use" ? { label: "进 社区食堂", do: "game" } : undefined;
      if (o.interact === "civic_canteen_menu") return kind === "use" ? { label: "看 食堂菜牌", do: "game" } : undefined;
      if (o.interact === "civic_kinder") return kind === "use" ? { label: "幼儿园接送点", do: "game" } : undefined;
      if (o.interact === "civic_property") return kind === "use" ? { label: "进 物业中心", do: "game" } : undefined;
      if (o.interact === "civic_canteen_line" || o.interact === "civic_canteen_seat")
        return kind === "use" ? { label: "堂食打菜", do: "game" } : null;
      if (o.interact === "civic_canteen_pack") return kind === "use" ? { label: "打包带走", do: "game" } : null;
      if (o.interact === "civic_prop_desk") return kind === "use" ? { label: "物业柜台", do: "game" } : null;
      if (o.interact === "civic_prop_board") return kind === "use" ? { label: "物业公告", do: "game" } : null;
      return A0.call(G, o, kind);
    };

    G.use = function (o) {
      if (!o) return U0.call(G, o);
      if (o.interact === "civic_canteen") return enter(CANTEEN);
      if (o.interact === "civic_canteen_menu") {
        const d = AC.price("staff_meal", 8), p = AC.price("bento", 14);
        return `今日惠民价：堂食套餐 ${yuan(d)} · 打包便当 ${yuan(p)}（peripheral 价表）`;
      }
      if (o.interact === "civic_kinder") {
        G.openMenu(Object.assign({}, o, { _name: "井槐幼儿园 · 接送点" }), [
          opt("接送打卡（演示）", () => {
            const r = AC.kinderPickup();
            toast(`🎒 ${r.note} · 第 ${r.n} 次`, 2600); return null;
          }),
          opt("看看接送须知", () => "门外接送区 · 请勿进入园内（本版无幼儿NPC）")
        ]);
        G.menu.amenityCivic = true; return null;
      }
      if (o.interact === "civic_property") return enter(PROP);

      if (o.interact === "civic_canteen_line" || o.interact === "civic_canteen_seat") {
        const d = AC.price("staff_meal", 8);
        G.openMenu(Object.assign({}, o, { _name: "堂食窗口" }), [
          opt(`堂食套餐（${yuan(d)}）→ 背包`, () => {
            const r = AC.buyMeal("dine"); if (!r.ok) return r.reason;
            if (G.payCard) G.payCard({ amount: r.price, method: "零钱", to: "社区食堂", what: r.label });
            toast(`🍜 ${r.label} · ¥${r.price}`, 2400); return null;
          }, ps().money >= d, "钱不够")
        ]);
        G.menu.amenityCivic = true; return null;
      }
      if (o.interact === "civic_canteen_pack") {
        const p = AC.price("bento", 14);
        G.openMenu(Object.assign({}, o, { _name: "打包台" }), [
          opt(`打包便当（${yuan(p)}）→ 背包`, () => {
            const r = AC.buyMeal("pack"); if (!r.ok) return r.reason;
            if (G.payCard) G.payCard({ amount: r.price, method: "零钱", to: "社区食堂", what: r.label });
            toast(`🥡 ${r.label} · ¥${r.price}`, 2400); return null;
          }, ps().money >= p, "钱不够")
        ]);
        G.menu.amenityCivic = true; return null;
      }

      if (o.interact === "civic_prop_desk") {
        const fee = AC.price("property", 40);
        G.openMenu(Object.assign({}, o, { _name: "物业柜台" }), [
          opt(`缴纳物业费（约 ${yuan(fee)}）`, () => {
            const r = AC.propertyFee(); if (!r.ok) return r.reason || "未成功";
            toast(`🏢 已缴费（${r.via || "ok"}）`, 2600); return null;
          }),
          opt("报修：楼道灯不亮", () => {
            const r = AC.reportRepair("楼道灯"); if (!r.ok) return r.reason;
            toast(`🔧 已登记工单 ${r.ticket && r.ticket.id}`, 2800); return null;
          }),
          opt("报修：公区漏水", () => {
            const r = AC.reportRepair("公区漏水"); if (!r.ok) return r.reason;
            toast(`🔧 已登记工单 ${r.ticket && r.ticket.id}`, 2800); return null;
          })
        ]);
        G.menu.amenityCivic = true; return null;
      }
      if (o.interact === "civic_prop_board") {
        const open = (ps().gateTickets || []).filter((t) => t.status === "待跟进").length;
        return open ? `公告：你有 ${open} 条待跟进物业工单（手机/门岗可续办）` : "公告：本周公区消杀 · 垃圾分类检查 · 无待办工单";
      }
      return U0.call(G, o);
    };

    G.pick = function (i) {
      const m = G.menu;
      if (m && m.amenityCivic) {
        if (i === -1) { G.closeMenu(); return; }
        const a = i == null ? m.opts.find((x) => x.ok) : m.opts[i];
        if (!a || !a.ok) return;
        G.closeMenu(); const r = a.fn(); if (r) toast(r); return;
      }
      return P0.call(G, i);
    };

    const iv = setInterval(() => {
      const P = root.__proto;
      if (P && P.render && !P._amenityCivicSign) {
        const prev = P.render.bind(P);
        P.render = function () {
          const r = prev();
          try { if (!SP.world.interior) drawSigns(document.getElementById("c").getContext("2d")); } catch (e) {}
          return r;
        };
        P._amenityCivicSign = true; clearInterval(iv);
      }
    }, 250);

    G.update = function (dt, gm) {
      UP0.call(G, dt, gm);
      if (!W.interior && STREET_STUBS.some((s) => !W.byId[s.id])) injectStreet();
    };

    AC.devGoto = function (which) {
      if (which === "canteen" || which === CANTEEN) return enter(CANTEEN);
      if (which === "property" || which === PROP) return enter(PROP);
      const map = { kinder: "civic_kinder_gate", kindergarten: "civic_kinder_gate", canteen_gate: "civic_canteen_gate", property_gate: "civic_prop_gate" };
      const id = map[which] || which;
      const o = W.byId[id];
      if (o && SP.player) { SP.player.x = o.x + 0.4; SP.player.y = o.y; }
      return id;
    };

    AC.installed = true;
  };

  function tryInstall() {
    if (AC.installed) return true;
    if (!(SP.game && SP.world && (root.__protoReady || (SP.world.objects && SP.world.objects.length)))) return false;
    try { AC.install(); } catch (e) { console.warn("amenityCivic", e); AC.installed = false; return false; }
    return !!AC.installed;
  }
  if (!tryInstall()) {
    let n = 0;
    const t = setInterval(() => { n++; if (tryInstall() || n > 120) clearInterval(t); }, 50);
  }
})(typeof window !== "undefined" ? window : globalThis);
