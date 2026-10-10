/* scene-proto-45 · Amenities-Props: 快递驿站 / 药店 / 充电桩 / 垃圾分类 (old block, slide-ready east).
   NEW file — does not touch npc_schedule / midtown* / amenities_sport / market.js / store / charB / stage* / appearance.
   No street NPC spawns here (Char-C owns gender/hair); interiors are interact-furniture only. */
(function (root) {
  "use strict";
  if (!root.SP) return;
  const SP = root.SP;
  const AM = (SP.amenities = SP.amenities || {});
  const AP = (SP.amenityProps = SP.amenityProps || {});
  const PHARM = "pharm_jhl";

  // midtown slide deltas (merge; do not clobber market keys)
  AM.SLIDE_EAST = Object.assign({
    parcel: [55, 0],
    pharmacy: [55, 0],
    charger: [55, 0],
    recycle: [55, 0],
    _propsNote: "老街 props → 中环/次中心时套用"
  }, AM.SLIDE_EAST || {});

  // ---------- tiny pharmacy room (kit_int; no NPC actors) ----------
  function tiles(W, D) {
    const g = { origin: [0, 0], chunk: 2, cols: Math.ceil(W / 2), rows: Math.ceil(D / 2), legend: { T: "g_tile" }, data_south_to_north: [] };
    for (let r = 0; r < g.rows; r++) g.data_south_to_north.push("T".repeat(g.cols));
    return g;
  }
  function walls(W, D, gap) {
    const objs = [], cols = [];
    const pushW = (id, x, y, rot, state) => objs.push({ id, type: "i_wall", x, y, z: 0, rot, state: state || "tile" });
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
  function buildPharmacy() {
    const W = 6, D = 4.5;
    const gap = { side: "S", at: W / 2 - 0.6, w: 1.2 };
    const w = walls(W, D, gap);
    const furn = [
      { id: "ph_shelf_a", type: "s_gondola", x: 1.8, y: 3.0, rot: 0, state: "full", interact: "prop_pharm_shelf", name: "OTC 货架", goods: "band" },
      { id: "ph_shelf_b", type: "s_gondola", x: 4.2, y: 3.0, rot: 0, state: "full", interact: "prop_pharm_shelf", name: "常备药", goods: "band" },
      { id: "ph_counter", type: "s_counter", x: 3.0, y: 1.6, rot: 0, state: "default", interact: "prop_pharm_counter", name: "药柜台" }
    ];
    return {
      id: PHARM, name: "井槐药店", interior: true, format: "fushi-scene", version: 1,
      bounds: { x0: 0.15, y0: 0.15, x1: W - 0.15, y1: D - 0.15 },
      ground: tiles(W, D),
      objects: w.objects.concat(furn),
      colliders: w.colliders,
      spawn: [W / 2, 1.0, "N"],
      portals: [{ id: "exit_street", rect: [gap.at, 0.1, gap.at + gap.w, 0.55], dir: "S", to: "street", spawn: [-16.8, 0.95, "S"], label: "出门（回到街上）" }],
      _amenity: true, _props: true, _doc: "Amenities-Props pharmacy; slide via SP.amenities.SLIDE_EAST.pharmacy"
    };
  }

  // ---------- old-block street stubs (kit pieces + custom interact; no NPC spawns) ----------
  // Clear of market stubs (−13.8…−9.6 / 15.2) and courtyard clutter.
  const STREET_STUBS = [
    { id: "prop_parcel", type: "p_locker", x: 10.2, y: 3.55, z: 0, rot: 0, state: "default",
      interact: "prop_parcel", name: "井槐快递驿站", _prop: "parcel" },
    { id: "prop_pharm_gate", type: "p_stall", x: -16.8, y: 1.9, z: 0, rot: 0, state: "default",
      interact: "prop_pharmacy", name: "井槐药店", to: PHARM, _prop: "pharmacy" },
    { id: "prop_charger", type: "p_ebike", x: 4.8, y: 3.45, z: 0, rot: 0, state: "default",
      interact: "prop_charger", name: "社区充电桩", _prop: "charger" },
    { id: "prop_recycle", type: "p_bins", x: -5.6, y: 3.5, z: 0, rot: 0, state: "default",
      interact: "prop_recycle", name: "垃圾分类点", _prop: "recycle" }
  ];
  AP.streetStubs = STREET_STUBS;
  AP.PHARM = PHARM;

  const SIGNS = [
    { id: "parcel", x: 10.2, y: 3.55, z: 2.35, img: "img/amenities/props/parcel_sign.png" },
    { id: "pharmacy", x: -16.8, y: 1.9, z: 2.4, img: "img/amenities/props/pharmacy_sign.png" },
    { id: "charger", x: 4.8, y: 3.45, z: 2.2, img: "img/amenities/props/charger_sign.png" },
    { id: "recycle", x: -5.6, y: 3.5, z: 2.2, img: "img/amenities/props/recycle_sign.png" }
  ];
  AP.SIGNS = SIGNS;
  AP._signImgs = {};

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
      // skip rebuildColliders — props are decorative interactables; avoids boot races with world.data
    }
  }
  AP.injectStreet = injectStreet;

  AP.slideEast = function () {
    for (const o of STREET_STUBS) {
      const key = o._prop || "parcel";
      const d = (AM.SLIDE_EAST && AM.SLIDE_EAST[key]) || [55, 0];
      o.x += d[0]; o.y += d[1];
      const live = SP.world && SP.world.byId[o.id];
      if (live) { live.x = o.x; live.y = o.y; }
      const sg = SIGNS.find((s) => s.id === key);
      if (sg) { sg.x = o.x; sg.y = o.y; }
    }
    return STREET_STUBS.map((o) => ({ id: o.id, x: o.x, y: o.y }));
  };

  function loadSigns() {
    for (const s of SIGNS) {
      if (AP._signImgs[s.id]) continue;
      const im = new Image();
      im.src = s.img;
      AP._signImgs[s.id] = im;
    }
  }
  function drawSigns(ctx) {
    if (!ctx || !SP.sx || !SP.world || SP.world.interior) return;
    const z = (SP.cam && SP.cam.zoom) || 1;
    if (z < 0.28) return;
    for (const s of SIGNS) {
      const im = AP._signImgs[s.id];
      if (!im || !im.complete || !im.naturalWidth) continue;
      const X = SP.sx(s.x, s.y), Y = SP.sy(s.x, s.y, s.z || 2.3);
      const sc = Math.max(0.5, Math.min(1.15, z));
      const w = im.naturalWidth * sc * 0.55, h = im.naturalHeight * sc * 0.55;
      ctx.save();
      ctx.globalAlpha = 0.94;
      ctx.drawImage(im, X - w / 2, Y - h, w, h);
      ctx.restore();
    }
  }
  AP.drawSigns = drawSigns;

  function bagGive(id, label, emoji, note) {
    // Prefer Stage-E bag without editing stageE ITEM_META
    try {
      if (SP.stageE && SP.stageE.ensureBag) {
        const bag = SP.stageE.ensureBag();
        const existing = bag.find((x) => x.id === id);
        if (existing) {
          existing.qty = (existing.qty || 1) + 1;
          existing.note = note || existing.note;
          existing.t = SP.stageE.stamp ? SP.stageE.stamp() : "";
          return existing;
        }
        const it = { id, label, emoji: emoji || "📦", kind: "misc", note: note || "", t: SP.stageE.stamp ? SP.stageE.stamp() : "", qty: 1 };
        bag.unshift(it);
        if (bag.length > 24) bag.length = 24;
        return it;
      }
    } catch (e) {}
    // fallback: rules items
    try {
      const ps = SP.game && SP.game.ps;
      if (ps) {
        if (SP.game.rules && SP.game.rules.addItem) SP.game.rules.addItem(ps, id, 1);
        else { ps.items = ps.items || {}; ps.items[id] = (ps.items[id] || 0) + 1; }
      }
    } catch (e) {}
    return { id, label };
  }

  function buyBandage(ps) {
    const price = 6;
    const label = "创可贴";
    if (!ps) return { ok: false, reason: "无存档" };
    if (ps.money < price) return { ok: false, reason: `钱不够（要 ¥${price}）` };
    ps.money = Math.round((ps.money - price) * 100) / 100;
    ps.stats = ps.stats || {};
    ps.stats.spent = (ps.stats.spent || 0) + price;
    try {
      if (SP.game.rules && SP.game.rules.addItem) SP.game.rules.addItem(ps, "med_band", 1);
      else { ps.items = ps.items || {}; ps.items.med_band = (ps.items.med_band || 0) + 1; }
    } catch (e) {}
    bagGive("med_band", label, "🩹", "井槐药店购买");
    ps.amenityProps = ps.amenityProps || { buys: 0, parcels: 0, charges: 0, sorts: 0 };
    ps.amenityProps.buys = (ps.amenityProps.buys || 0) + 1;
    return { ok: true, label, price };
  }
  AP.buyBandage = buyBandage;

  AP.pickParcel = function () {
    const ps = SP.game && SP.game.ps;
    if (!ps) return { ok: false, reason: "无存档" };
    ps.amenityProps = ps.amenityProps || { buys: 0, parcels: 0, charges: 0, sorts: 0 };
    if ((ps.amenityProps.parcels || 0) >= 3) return { ok: false, reason: "今天的件都取完了（演示上限 3）" };
    ps.amenityProps.parcels = (ps.amenityProps.parcels || 0) + 1;
    const n = ps.amenityProps.parcels;
    bagGive("parcel_jhl_" + n, "快递包裹", "📦", "井槐驿站取件 #" + n);
    return { ok: true, label: "快递包裹", n };
  };

  AP.chargeOnce = function () {
    const ps = SP.game && SP.game.ps;
    if (!ps) return { ok: false, reason: "无存档" };
    const price = 1;
    if (ps.money < price) return { ok: false, reason: "钱不够（¥1/时）" };
    ps.money = Math.round((ps.money - price) * 100) / 100;
    ps.amenityProps = ps.amenityProps || {};
    ps.amenityProps.charges = (ps.amenityProps.charges || 0) + 1;
    return { ok: true, price, n: ps.amenityProps.charges };
  };

  AP.sortTrash = function (kind) {
    const ps = SP.game && SP.game.ps;
    if (!ps) return { ok: false, reason: "无存档" };
    ps.amenityProps = ps.amenityProps || {};
    ps.amenityProps.sorts = (ps.amenityProps.sorts || 0) + 1;
    ps.amenityProps.lastSort = kind || "recyclable";
    return { ok: true, kind: kind || "recyclable", n: ps.amenityProps.sorts };
  };

  AP.installed = false;
  AP.install = function () {
    if (AP.installed) return;
    const G = SP.game, W = SP.world;
    if (!G || !W) return;
    const toast = (t, ms) => SP.toast && SP.toast(t, ms || 2400);
    const ps = () => G.ps;
    const yuan = (v) => "¥" + (Math.round(v * 100) / 100);
    const opt = (label, fn, ok, reason) => ({ label, fn, ok: ok !== false, reason: reason || "" });

    function enterPharm() {
      const sc = SP.scenes[PHARM]; if (!sc) return "药店还在布置";
      // switchScene = immediate (tests/capture); G.go fades when player walks in
      try {
        if (G.switchScene) G.switchScene(PHARM, sc.spawn);
        else if (SP.place && SP.place.enter) SP.place.enter(PHARM, sc.spawn);
        else G.go({ to: PHARM, spawn: sc.spawn, door: null });
      } catch (e) { return "进店失败"; }
      toast("进了井槐药店 · 货架可买创可贴", 2200);
      return null;
    }
    AP.enterPharmacy = enterPharm;
    AP.status = function () {
      return STREET_STUBS.map((s) => {
        const live = W.byId && W.byId[s.id];
        return { id: s.id, name: s.name, x: live ? live.x : s.x, y: live ? live.y : s.y, interact: s.interact };
      });
    };
    SP.places = SP.places || {};
    SP.places[PHARM] = { enter: enterPharm };

    try { SP.scenes[PHARM] = buildPharmacy(); } catch (e) { console.warn("pharm scene", e); }
    try { injectStreet(); } catch (e) { console.warn("props inject", e); }
    try { loadSigns(); } catch (e) {}

    const A0 = G.actionFor, U0 = G.use, P0 = G.pick, UP0 = G.update;
    G.actionFor = function (o, kind) {
      if (!o) return A0.call(G, o, kind);
      if (o.interact === "prop_parcel") return kind === "use" ? { label: "快递驿站 · 取件", do: "game" } : undefined;
      if (o.interact === "prop_pharmacy") return kind === "use" ? { label: "进 井槐药店", do: "game" } : undefined;
      if (o.interact === "prop_charger") return kind === "use" ? { label: "充电桩 · 扫码充电", do: "game" } : undefined;
      if (o.interact === "prop_recycle") return kind === "use" ? { label: "垃圾分类点", do: "game" } : undefined;
      if (o.interact === "prop_pharm_shelf") return kind === "use" ? { label: (o.name || "货架") + " · 买药", do: "game" } : null;
      if (o.interact === "prop_pharm_counter") return kind === "use" ? { label: "药柜台 · 问问", do: "game" } : null;
      return A0.call(G, o, kind);
    };

    G.use = function (o) {
      if (!o) return U0.call(G, o);
      if (o.interact === "prop_parcel") {
        G.openMenu(Object.assign({}, o, { _name: "井槐快递驿站" }), [
          opt("取件（演示包裹 → 背包）", () => {
            const r = AP.pickParcel(); if (!r.ok) return r.reason;
            toast(`📦 取到包裹 #${r.n} · 已放进背包`, 2600); return null;
          }),
          opt("查看取件码", () => "驿站屏：取件码 8821（演示）")
        ]);
        G.menu.amenityProps = true; return null;
      }
      if (o.interact === "prop_pharmacy") return enterPharm();
      if (o.interact === "prop_charger") {
        G.openMenu(Object.assign({}, o, { _name: "社区充电桩" }), [
          opt(`慢充 1 小时（${yuan(1)}）`, () => {
            const r = AP.chargeOnce(); if (!r.ok) return r.reason;
            if (G.payCard) G.payCard({ amount: r.price, method: "零钱", to: "社区充电桩", what: "慢充1时" });
            toast(`🔌 已开始充电（第 ${r.n} 次）`, 2400); return null;
          }, ps().money >= 1, "钱不够"),
          opt("看看空位", () => "两桩空闲 · 一桩占用（演示）")
        ]);
        G.menu.amenityProps = true; return null;
      }
      if (o.interact === "prop_recycle") {
        G.openMenu(Object.assign({}, o, { _name: "垃圾分类点" }), [
          opt("投 可回收物", () => {
            AP.sortTrash("recyclable"); toast("♻️ 可回收 · 谢谢分类", 2200); return null;
          }),
          opt("投 其他垃圾", () => {
            AP.sortTrash("other"); toast("🗑 其他垃圾已投", 2000); return null;
          }),
          opt("看看指引", () => "可回收 / 有害 / 厨余 / 其他 · 井槐社区")
        ]);
        G.menu.amenityProps = true; return null;
      }
      if (o.interact === "prop_pharm_shelf") {
        G.openMenu(Object.assign({}, o, { _name: o.name || "药店货架" }), [
          opt(`买创可贴（${yuan(6)}）`, () => {
            const r = buyBandage(ps()); if (!r.ok) return r.reason;
            if (G.payCard) G.payCard({ amount: r.price, method: (G.rules && G.rules.payLabel && G.rules.payLabel(ps())) || "零钱", to: "井槐药店", what: r.label });
            toast(`🩹 ${r.label} ×1 · 放进背包`, 2400); return null;
          }, ps().money >= 6, "钱不够")
        ]);
        G.menu.amenityProps = true; return null;
      }
      if (o.interact === "prop_pharm_counter") {
        const st = (ps() && ps().amenityProps) || {};
        return st.buys ? `店员：创可贴带好了就行，记得保持伤口干爽（已购 ${st.buys} 次）` : "店员：货架上有创可贴 OTC，自取付款就好";
      }
      return U0.call(G, o);
    };

    G.pick = function (i) {
      const m = G.menu;
      if (m && m.amenityProps) {
        if (i === -1) { G.closeMenu(); return; }
        const a = i == null ? m.opts.find((x) => x.ok) : m.opts[i];
        if (!a || !a.ok) return;
        G.closeMenu();
        const r = a.fn(); if (r) toast(r);
        return;
      }
      return P0.call(G, i);
    };

    // sign overlay via __proto.render wrap (same pattern as charB; no NPC)
    const iv = setInterval(() => {
      const P = root.__proto;
      if (P && P.render && !P._amenityPropsSign) {
        const prev = P.render.bind(P);
        P.render = function () {
          const r = prev();
          try { if (!SP.world.interior) drawSigns(document.getElementById("c").getContext("2d")); } catch (e) {}
          return r;
        };
        P._amenityPropsSign = true;
        clearInterval(iv);
      }
    }, 250);

    G.update = function (dt, gm) {
      UP0.call(G, dt, gm);
      if (!W.interior && STREET_STUBS.some((s) => !W.byId[s.id])) injectStreet();
    };

    AP.devGoto = function (which) {
      if (which === "pharm" || which === PHARM) return enterPharm();
      const map = { parcel: "prop_parcel", charger: "prop_charger", recycle: "prop_recycle", pharmacy: "prop_pharm_gate" };
      const id = map[which] || which;
      const o = W.byId[id];
      if (o && SP.player) { SP.player.x = o.x + 0.5; SP.player.y = o.y; }
      return id;
    };

    AP.status = function () {
      return STREET_STUBS.map((s) => {
        const live = W.byId && W.byId[s.id];
        return { id: s.id, name: s.name, x: live ? live.x : s.x, y: live ? live.y : s.y, interact: s.interact };
      });
    };
    AP.installed = true;
  };

  function tryInstall() {
    if (AP.installed) return;
    if (!(SP.game && SP.world && (root.__protoReady || (SP.world.data && SP.world.objects)))) return false;
    try { AP.install(); } catch (e) { console.warn("amenityProps install", e); AP.installed = false; return false; }
    return !!AP.installed;
  }
  if (!tryInstall()) {
    let n = 0;
    const t = setInterval(() => {
      n++;
      if (tryInstall() || n > 120) clearInterval(t);
    }, 50);
  }
})(typeof window !== "undefined" ? window : globalThis);
