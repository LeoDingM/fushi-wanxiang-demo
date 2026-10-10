/* 浮世万象 · scene-proto-45 · Amenities-Market: 井槐里菜市场 + 惠民小超市 (old-block first, stubs slide east).
   NEW file — does not touch stageS/stageR/charB/npc_schedule/appearance/civic atlases.
   - Registers SP.scenes.market_jhl / smkt_jhl (simple interiors: stalls / aisles)
   - Injects street exterior placeholders (p_stall clusters) on the OLD block
   - Buy 1–2 goods into bag/items (eggs/veg · noodles/bread)
   - Preview: market_preview.html ; capture: tools/capture_market.py */
(function (root) {
  "use strict";
  if (!root.SP) return;
  const SP = root.SP;
  const AM = (SP.amenities = SP.amenities || {});
  const MKT = "market_jhl", SMKT = "smkt_jhl";
  /** future midtown slide: add these deltas to street stub xy (old block → east) */
  AM.SLIDE_EAST = { market: [55, 0], supermarket: [55, 0], _note: "井槐里老街 → 向东挪到中环/次中心时套用" };

  // ---------- tiny room builder (kit_int walls + furniture; no roomlayout.py needed) ----------
  function tiles(W, D) {
    const g = { origin: [0, 0], chunk: 2, cols: Math.ceil(W / 2), rows: Math.ceil(D / 2), legend: { T: "g_tile" }, data_south_to_north: [] };
    for (let r = 0; r < g.rows; r++) g.data_south_to_north.push("T".repeat(g.cols));
    return g;
  }
  function walls(W, D, gap) {
    // gap = { side:'S', at, w } opening for exit
    const objs = [], cols = [];
    const pushW = (id, x, y, rot, state) => objs.push({ id, type: "i_wall", x, y, z: 0, rot, state: state || "tile" });
    // North
    for (let x = 0; x < W; x++) pushW("wn_" + x, x, D, 0);
    cols.push({ id: "cN", rect: [0, D, W, D + 0.55] });
    // West
    for (let y = 0; y < D; y++) pushW("ww_" + y, 0, y, 6);
    cols.push({ id: "cW", rect: [-0.55, 0, 0.15, D] });
    // East
    for (let y = 0; y < D; y++) pushW("we_" + y, W, y, 6);
    cols.push({ id: "cE", rect: [W - 0.15, 0, W + 0.55, D] });
    // South with gap
    const g0 = gap.at, g1 = gap.at + gap.w;
    for (let x = 0; x < W; x++) {
      if (x + 0.99 > g0 && x < g1) continue;
      pushW("ws_" + x, x, 0, 0);
    }
    if (g0 > 0.1) cols.push({ id: "cS0", rect: [0, -0.55, g0, 0.15] });
    if (g1 < W - 0.1) cols.push({ id: "cS1", rect: [g1, -0.55, W, 0.15] });
    return { objects: objs, colliders: cols };
  }
  function sceneBase(id, name, W, D, streetSpawn, furniture) {
    const gap = { side: "S", at: W / 2 - 0.6, w: 1.2 };
    const w = walls(W, D, gap);
    const objects = w.objects.concat(furniture || []);
    return {
      id, name, interior: true, format: "fushi-scene", version: 1,
      bounds: { x0: 0.15, y0: 0.15, x1: W - 0.15, y1: D - 0.15 },
      ground: tiles(W, D),
      objects, colliders: w.colliders,
      spawn: [W / 2, 1.0, "N"],
      portals: [{ id: "exit_street", rect: [gap.at, 0.1, gap.at + gap.w, 0.55], dir: "S", to: "street", spawn: streetSpawn, label: "出门（回到街上）" }],
      _amenity: true, _doc: "Amenities-Market stub (old block); slide east via SP.amenities.SLIDE_EAST",
    };
  }

  function buildMarket() {
    // 8×6 hall: three produce stalls (s_counter) + one cooler for eggs
    const furn = [
      { id: "stall_veg", type: "s_counter", x: 2.2, y: 4.2, rot: 0, state: "default", interact: "mkt_stall", name: "青菜摊", goods: "veg" },
      { id: "stall_egg", type: "s_counter", x: 5.0, y: 4.2, rot: 0, state: "default", interact: "mkt_stall", name: "禽蛋摊", goods: "egg" },
      { id: "stall_mix", type: "s_cooler", x: 7.0, y: 3.2, rot: 6, state: "full", interact: "mkt_stall", name: "冷冻柜", goods: "egg" },
      { id: "stall_root", type: "s_counter", x: 3.5, y: 2.4, rot: 4, state: "default", interact: "mkt_stall", name: "根茎摊", goods: "veg" },
    ];
    return sceneBase(MKT, "井槐里菜市场", 8, 6, [-12.5, 0.95, "S"], furn);
  }
  function buildSmkt() {
    // 7×5 mini mart: gondola aisle + cooler + counter
    const furn = [
      { id: "aisle_a", type: "s_gondola", x: 2.4, y: 3.2, rot: 0, state: "full", interact: "smkt_shelf", name: "货架 · 方便面", goods: "noodles" },
      { id: "aisle_b", type: "s_gondola", x: 4.8, y: 3.2, rot: 0, state: "full", interact: "smkt_shelf", name: "货架 · 面包零食", goods: "bread" },
      { id: "cool", type: "s_cooler", x: 6.4, y: 2.6, rot: 6, state: "full", interact: "smkt_shelf", name: "冷柜", goods: "bread" },
      { id: "counter", type: "s_counter", x: 3.5, y: 1.5, rot: 0, state: "default", interact: "smkt_counter", name: "收银台" },
    ];
    return sceneBase(SMKT, "惠民小超市 · 井槐里店", 7, 5, [15.2, 0.95, "S"], furn);
  }

  // ---------- goods (reuse shared-rules items; bag mirror for HUD) ----------
  const GOODS = {
    egg: { item: "egg", label: "鸡蛋", price: 1, where: "market" },
    veg: { item: "veg", label: "青菜", price: 4.5, where: "market" },
    noodles: { item: "noodles", label: "方便面", price: 5, where: "smkt" },
    bread: { item: "bread", label: "面包", price: 9, where: "smkt" },
  };
  function bag(ps) { ps.amenity = ps.amenity || { bag: {}, visits: 0 }; return ps.amenity; }
  function buy(ps, key, abs) {
    const g = GOODS[key]; if (!g) return { ok: false, reason: "没有这个" };
    if (ps.money < g.price) return { ok: false, reason: `钱不够（要 ¥${g.price}）` };
    ps.money = Math.round((ps.money - g.price) * 100) / 100;
    ps.stats.spent = (ps.stats.spent || 0) + g.price;
    if (SP.game && SP.game.rules && SP.game.rules.addItem) SP.game.rules.addItem(ps, g.item, 1);
    else ps.items[g.item] = (ps.items[g.item] || 0) + 1;
    const st = bag(ps); st.bag[key] = (st.bag[key] || 0) + 1; st.visits++;
    if (SP.game && SP.game.rules && SP.game.rules._note) SP.game.rules._note(ps, { type: "amenity_buy", key, label: g.label, price: g.price, where: g.where }, abs || 0);
    return { ok: true, label: g.label, price: g.price };
  }
  AM.buy = buy; AM.GOODS = GOODS;

  // ---------- street exterior stubs (old block) ----------
  const STREET_STUBS = [
    // 菜市场 cluster west of 12号 (near shared bikes)
    { id: "mkt_jhl_a", type: "p_stall", x: -13.8, y: 1.85, z: 0, rot: 0, state: "default", name: "青菜摊" },
    { id: "mkt_jhl_gate", type: "p_stall", x: -11.6, y: 1.85, z: 0, rot: 0, state: "default", interact: "market", name: "井槐里菜市场", to: MKT },
    { id: "mkt_jhl_b", type: "p_stall", x: -9.6, y: 1.9, z: 0, rot: 6, state: "default", name: "禽蛋摊" },
    // 小超市 stub east of community gate (still old-block; slide +55 for midtown)
    { id: "smkt_jhl_gate", type: "p_stall", x: 15.2, y: 1.85, z: 0, rot: 0, state: "default", interact: "supermarket", name: "惠民小超市", to: SMKT },
  ];
  AM.streetStubs = STREET_STUBS;

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
      try { if (W.data && W.rebuildColliders) W.rebuildColliders(); } catch (e) {}
    }
  }
  AM.injectStreet = injectStreet;
  /** apply midtown slide (dev): move stub xy by SLIDE_EAST */
  AM.slideEast = function () {
    for (const o of STREET_STUBS) {
      const key = o.interact === "supermarket" || o.id.indexOf("smkt") === 0 ? "supermarket" : "market";
      const d = AM.SLIDE_EAST[key] || [0, 0];
      o.x += d[0]; o.y += d[1];
      const live = SP.world && SP.world.byId[o.id];
      if (live) { live.x = o.x; live.y = o.y; }
    }
    if (SP.world && SP.world.rebuildColliders) SP.world.rebuildColliders();
    return STREET_STUBS.map((o) => ({ id: o.id, x: o.x, y: o.y }));
  };

  // ---------- install ----------
  AM.installed = false;
  AM.install = function () {
    if (AM.installed) return;
    const G = SP.game, W = SP.world, C = SP.clock;
    if (!G || !W) { console.warn("amenities_market: need game+world"); return; }
    const R = G.rules;
    SP.scenes[MKT] = buildMarket();
    SP.scenes[SMKT] = buildSmkt();
    injectStreet();

    const yuan = (v) => "¥" + (Math.round(v * 100) / 100);
    const toast = (t, ms) => SP.toast && SP.toast(t, ms);
    const ps = () => G.ps, abs = () => C.abs();
    const inM = () => W.interior && (W.sceneId === MKT || W.sceneId === SMKT);
    const opt = (label, fn, ok, reason) => ({ label, fn, ok: ok !== false, reason: reason || "" });

    function enter(id, spawnStreet) {
      const sc = SP.scenes[id]; if (!sc) return "还在布置中";
      G.go({ to: id, spawn: sc.spawn, door: null });
      toast(id === MKT ? "进了菜市场 · 摊位买菜" : "进了小超市 · 货架拿货", 2200);
      return null;
    }
    AM.enterMarket = () => enter(MKT);
    AM.enterSmkt = () => enter(SMKT);

    SP.places = SP.places || {};
    SP.places[MKT] = { enter: () => enter(MKT) };
    SP.places[SMKT] = { enter: () => enter(SMKT) };

    const A0 = G.actionFor, U0 = G.use, P0 = G.pick, UP0 = G.update;
    G.actionFor = function (o, kind) {
      if (!o) return A0.call(G, o, kind);
      if (o.interact === "market") return kind === "use" ? { label: "进 井槐里菜市场", do: "game" } : undefined;
      if (o.interact === "supermarket") return kind === "use" ? { label: "进 惠民小超市", do: "game" } : undefined;
      if (o.interact === "mkt_stall") return kind === "use" ? { label: (o.name || "摊位") + " · 买菜", do: "game" } : null;
      if (o.interact === "smkt_shelf") return kind === "use" ? { label: (o.name || "货架") + " · 拿货", do: "game" } : null;
      if (o.interact === "smkt_counter") return kind === "use" ? { label: "收银台 · 问问店员", do: "game" } : null;
      return A0.call(G, o, kind);
    };
    G.use = function (o) {
      if (!o) return U0.call(G, o);
      if (o.interact === "market") return enter(MKT);
      if (o.interact === "supermarket") return enter(SMKT);
      if (o.interact === "mkt_stall") {
        const key = o.goods || "veg", g = GOODS[key];
        const other = key === "veg" ? "egg" : "veg";
        G.openMenu(Object.assign({}, o, { _name: o.name || "摊位" }), [
          opt(`买${g.label}（${yuan(g.price)}）`, () => {
            const r = buy(ps(), key, abs()); if (!r.ok) return r.reason;
            G.payCard && G.payCard({ amount: r.price, method: R.payLabel(ps()), to: "井槐里菜市场", what: r.label });
            toast(`🛍 ${r.label} ×1 · 放进背包`, 2200); return null;
          }, ps().money >= g.price, "钱不够"),
          opt(`再买${GOODS[other].label}（${yuan(GOODS[other].price)}）`, () => {
            const r = buy(ps(), other, abs()); if (!r.ok) return r.reason;
            G.payCard && G.payCard({ amount: r.price, method: R.payLabel(ps()), to: "井槐里菜市场", what: r.label });
            toast(`🛍 ${r.label} ×1 · 放进背包`, 2200); return null;
          }, ps().money >= GOODS[other].price, "钱不够"),
        ]);
        G.menu.amenity = true; return null;
      }
      if (o.interact === "smkt_shelf") {
        const key = o.goods || "noodles", g = GOODS[key];
        const other = key === "noodles" ? "bread" : "noodles";
        G.openMenu(Object.assign({}, o, { _name: o.name || "货架" }), [
          opt(`拿${g.label}（${yuan(g.price)}）`, () => {
            const r = buy(ps(), key, abs()); if (!r.ok) return r.reason;
            G.payCard && G.payCard({ amount: r.price, method: R.payLabel(ps()), to: "惠民小超市", what: r.label });
            toast(`🛍 ${r.label} ×1 · 放进背包`, 2200); return null;
          }, ps().money >= g.price, "钱不够"),
          opt(`拿${GOODS[other].label}（${yuan(GOODS[other].price)}）`, () => {
            const r = buy(ps(), other, abs()); if (!r.ok) return r.reason;
            G.payCard && G.payCard({ amount: r.price, method: R.payLabel(ps()), to: "惠民小超市", what: r.label });
            toast(`🛍 ${r.label} ×1 · 放进背包`, 2200); return null;
          }, ps().money >= GOODS[other].price, "钱不够"),
        ]);
        G.menu.amenity = true; return null;
      }
      if (o.interact === "smkt_counter") {
        const st = bag(ps());
        const n = Object.values(st.bag).reduce((a, b) => a + b, 0);
        return n ? `店员：今天拿了 ${n} 样，慢走啊` : "店员：货架上的都能直接拿，扫码付款就行";
      }
      return U0.call(G, o);
    };
    G.pick = function (i) {
      const m = G.menu;
      if (m && m.amenity) {
        if (i === -1) { G.closeMenu(); return; }
        const a = i == null ? m.opts.find((x) => x.ok) : m.opts[i];
        if (!a || !a.ok) return; G.closeMenu(); const r = a.fn(); if (r) toast(r); return;
      }
      return P0.call(G, i);
    };

    // lightweight HUD when inside amenity (browser only)
    let hud = null, hk = "";
    if (typeof document !== "undefined") {
      hud = document.getElementById("amenityhud");
      if (!hud) {
        hud = document.createElement("div"); hud.id = "amenityhud";
        (document.getElementById("wrap") || document.body).appendChild(hud);
        const css = document.createElement("style");
        css.textContent = `#amenityhud{position:absolute;left:10px;top:44px;z-index:30;pointer-events:none;background:rgba(10,14,20,.78);color:#e8f2ea;border-left:3px solid #e07a2f;border-radius:6px;padding:5px 9px;font-size:12px;line-height:1.5;max-width:58%;display:none}
body.mobile #amenityhud{top:calc(env(safe-area-inset-top,0px) + 112px);left:64px;font-size:11px;max-width:calc(100vw - 76px)}
body:not(.mobile) #amenityhud{top:64px}`;
        document.head.appendChild(css);
      }
    }
    function drawHud() {
      if (!hud) return;
      if (!inM()) { if (hk) { hk = ""; hud.style.display = "none"; } return; }
      const st = bag(ps());
      const parts = W.sceneId === MKT
        ? ["🥬 井槐里菜市场", "摊位：青菜 / 鸡蛋"]
        : ["🛒 惠民小超市", "货架：方便面 / 面包"];
      const bagL = Object.entries(st.bag).filter(([, n]) => n > 0).map(([k, n]) => (GOODS[k] ? GOODS[k].label : k) + "×" + n);
      if (bagL.length) parts.push("🛍 " + bagL.join("、"));
      else parts.push("🛍 背包还空着 · 去摊位/货架买");
      const html = parts.join("<br>");
      if (html !== hk) { hk = html; hud.innerHTML = html; hud.style.display = "block"; }
    }
    G.update = function (dt, gm) {
      UP0.call(G, dt, gm);
      // re-inject if street reloaded wiped stubs
      if (!W.interior && STREET_STUBS.some((s) => !W.byId[s.id])) injectStreet();
      drawHud();
    };

    AM.devGoto = function (which) {
      if (which === "smkt" || which === SMKT) return enter(SMKT);
      return enter(MKT);
    };
    AM.installed = true;
  };

  if (SP.game && SP.world) AM.install();
  else {
    // late boot: try a few times after main.js
    let n = 0; const t = setInterval(() => {
      n++; if (SP.game && SP.world) { clearInterval(t); AM.install(); }
      else if (n > 80) clearInterval(t);
    }, 50);
  }
})(typeof window !== "undefined" ? window : globalThis);
