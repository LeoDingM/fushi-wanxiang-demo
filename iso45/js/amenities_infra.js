/* scene-proto-45 · Amenities-Infra: 银行网点+ATM / 公厕 / 地下车库入口 / 干洗店外立面.
   NEW file — does not touch midtown* / estate / charB / store / market / props / civic-amen / stage* / appearance.
   Does NOT build 食堂/幼儿园/物业 (amenities_civic.js owns those).
   Facades deliberately DIVERSE (Leo hates clone rows): bank=glass+roof B cream, toilet=green service box,
   garage=ramp+posts (no building clone), dryclean=awning shop bay different from clinic/bank. */
(function (root) {
  "use strict";
  if (!root.SP) return;
  const SP = root.SP;
  const AM = (SP.amenities = SP.amenities || {});
  const AI = (SP.amenityInfra = SP.amenityInfra || {});
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 2600);
  const log = (t) => SP.world && SP.world.logEvent && SP.world.logEvent(t);

  AI.VERSION = "2026-10-11-amenities-infra";
  AM.SLIDE_EAST = Object.assign({
    bank: [48, 0], toilet: [48, 0], garage: [40, 0], dryclean: [48, 0],
    _infraNote: "老街 infra → 中环边缘时套用"
  }, AM.SLIDE_EAST || {});

  AI.POIS = {
    bank:     { x: -10.0, y: -10.0, label: "井槐银行网点" },
    toilet:   { x: 10.0,  y: -10.0, label: "公共卫生间" },
    garage:   { x: 18.5,  y: 14.2,  label: "地下车库入口" },
    dryclean: { x: 38.5,  y: 4.5,   label: "净衣坊·干洗" }
  };

  // ---------- art ----------
  AI._imgs = {};
  AI.loadArt = function () {
    const names = ["bank", "toilet", "garage", "dryclean", "atm", "garage_ramp"];
    for (const n of names) {
      if (AI._imgs[n]) continue;
      const im = new Image();
      im.src = "img/amenities/infra/" + n + ".png";
      AI._imgs[n] = im;
    }
  };

  AI._cam = function () {
    const cam = SP.cam || {};
    return { z: cam.zoom || 1, cx: cam.x || 0, cy: cam.y || 0 };
  };
  AI.scr = function (x, y, zw) {
    const { z, cx, cy } = AI._cam();
    return [(SP.sx(x, y) - cx) * z, (SP.sy(x, y, zw || 0) - cy) * z];
  };
  AI.drawImg = function (ctx, key, x, y, zw, sc, ox, oy) {
    const im = AI._imgs[key];
    if (!im || !im.complete || !im.naturalWidth) return;
    const [X, Y] = AI.scr(x, y, zw || 0);
    const zcam = AI._cam().z;
    const s = (sc || 1) * Math.max(0.45, Math.min(1.2, zcam));
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.drawImage(im, X - w / 2 + (ox || 0) * s, Y - h / 2 + (oy || 0) * s, w, h);
  };
  AI.mark = function (ctx, x, y, zw, text, bg) {
    const zcam = AI._cam().z;
    if (zcam < 0.32) return;
    const [X, Y] = AI.scr(x, y, zw || 2.3);
    ctx.save();
    ctx.globalAlpha = 0.93;
    ctx.font = "bold " + Math.round(11 * Math.min(1.15, zcam)) + "px sans-serif";
    ctx.textAlign = "center";
    const tw = Math.max(60, ctx.measureText(text).width + 12);
    ctx.fillStyle = bg || "#1e5aa0";
    ctx.fillRect(X - tw / 2, Y - 12, tw, 18);
    ctx.fillStyle = "#fff";
    ctx.fillText(text, X, Y + 1);
    ctx.restore();
  };

  // ---------- diverse street objects ----------
  AI.streetObjects = function () {
    const P = AI.POIS, objs = [];

    // === BANK: cream/glass civic bay (rot0 south) — NOT a clinic clone (clinic uses p1 + 3 shop bays east of hospital) ===
    const bx = P.bank.x - 3, by = P.bank.y, fg = "infra_bank";
    objs.push({ id: "infra_bank_S1F_0", type: "f_wall", x: bx, y: by, state: "ground", fade_group: fg, variant: "w1" });
    objs.push({ id: "infra_bank_S1F_0w", type: "f_window", x: bx, y: by, state: "intact", fade_group: fg, night_lit: true, variant: "w2" });
    objs.push({
      id: "infra_bank_door", type: "f_shop", x: bx + 3, y: by, state: "door", fade_group: fg,
      interact: "civic", to: "amenity_bank", spawn: [-8.5, -6.5, "N"],
      name: "井槐银行", hours: ["09:00", "17:00"]
    });
    objs.push({ id: "infra_bank_S1F_2", type: "f_wall", x: bx + 6, y: by, state: "ground", fade_group: fg, variant: "base" });
    objs.push({ id: "infra_bank_S1F_2w", type: "f_window", x: bx + 6, y: by, state: "intact", fade_group: fg, night_lit: true, variant: "base" });
    objs.push({ id: "infra_bank_W1F_0", type: "f_wall", x: bx, y: by + 3, rot: 6, state: "ground", fade_group: fg, variant: "w2" });
    objs.push({ id: "infra_bank_W1F_0w", type: "f_window", x: bx, y: by + 3, rot: 6, state: "intact", fade_group: fg, night_lit: false });
    objs.push({ id: "infra_bank_S2F_0", type: "f_wall", x: bx, y: by, z: 3, state: "upper", fade_group: fg, variant: "w1" });
    objs.push({ id: "infra_bank_S2F_0w", type: "f_window", x: bx, y: by, z: 3, state: "intact", fade_group: fg, night_lit: true });
    objs.push({ id: "infra_bank_S2F_1", type: "f_wall", x: bx + 3, y: by, z: 3, state: "upper", fade_group: fg, variant: "base" });
    objs.push({ id: "infra_bank_S2F_1w", type: "f_window", x: bx + 3, y: by, z: 3, state: "intact", fade_group: fg, night_lit: true, variant: "w2" });
    objs.push({ id: "infra_bank_S2F_2", type: "f_wall", x: bx + 6, y: by, z: 3, state: "upper", fade_group: fg, variant: "w2" });
    objs.push({ id: "infra_bank_roof", type: "b_roof_a", x: bx, y: by, z: 6, fade_group: fg }); // roof_a ≠ clinic roof_b
    objs.push({
      id: "infra_atm_street", type: "p_post", x: P.bank.x + 4.2, y: P.bank.y + 1.2,
      interact: "amenity_atm", name: "ATM 取款机"
    });
    objs.push({ id: "infra_bank_tree", type: "p_tree", x: P.bank.x - 5, y: P.bank.y + 2.5, variant: "t2" });

    // === TOILET: compact green service pavilion (2-bay, no upper clone of bank) ===
    const tx = P.toilet.x - 1.5, ty = P.toilet.y, tfg = "infra_toilet";
    objs.push({ id: "infra_toilet_S1F_0", type: "f_shop", x: tx, y: ty, state: "window", fade_group: tfg });
    objs.push({
      id: "infra_toilet_door", type: "f_shop", x: tx + 3, y: ty, state: "door", fade_group: tfg,
      interact: "civic", to: "amenity_toilet", spawn: [12.5, -6.5, "N"],
      name: "公共卫生间", hours: ["06:00", "22:00"]
    });
    objs.push({ id: "infra_toilet_pipe", type: "f_pipe", x: tx + 5.85, y: ty, fade_group: tfg });
    objs.push({ id: "infra_toilet_S2F_0", type: "f_wall", x: tx, y: ty, z: 3, state: "upper", fade_group: tfg, variant: "p1" });
    objs.push({ id: "infra_toilet_S2F_1", type: "f_wall", x: tx + 3, y: ty, z: 3, state: "upper", fade_group: tfg, variant: "p1" });
    objs.push({ id: "infra_toilet_roof", type: "b_roof_b", x: tx, y: ty, z: 6, fade_group: tfg, variant: "c" });
    objs.push({ id: "infra_toilet_hedge", type: "p_hedge", x: tx - 1.2, y: ty + 1.5 });
    objs.push({ id: "infra_toilet_pot", type: "p_pot", x: tx + 5.2, y: ty + 1.1, state: "grown" });

    // === GARAGE: ramp + posts + barrier — NOT a building facade row ===
    objs.push({ id: "infra_garage_post_l", type: "p_post", x: P.garage.x - 2.2, y: P.garage.y });
    objs.push({ id: "infra_garage_post_r", type: "p_post", x: P.garage.x + 2.2, y: P.garage.y });
    objs.push({ id: "infra_garage_barrier", type: "w_fence", x: P.garage.x, y: P.garage.y + 0.4, rot: 0 });
    objs.push({
      id: "infra_garage", type: "p_planter", x: P.garage.x, y: P.garage.y - 0.3,
      interact: "amenity_garage", name: "地下车库入口"
    });
    objs.push({ id: "infra_garage_lamp", type: "p_lamp", x: P.garage.x - 3.0, y: P.garage.y - 0.8 });

    // === DRY CLEAN: single awning shop bay (different state / props than bank|toilet|clinic) ===
    const dx = P.dryclean.x - 1.5, dy = P.dryclean.y, dfg = "infra_dry";
    objs.push({ id: "infra_dry_S1F_0", type: "f_eatery", x: dx, y: dy, state: "tea", fade_group: dfg }); // reuse eatery bay look ≠ bank
    objs.push({
      id: "infra_dry_door", type: "f_shop", x: dx + 3, y: dy, state: "door", fade_group: dfg,
      interact: "amenity_dryclean", name: "净衣坊·干洗", hours: ["09:00", "20:00"]
    });
    objs.push({ id: "infra_dry_S1F_2", type: "f_shop", x: dx + 6, y: dy, state: "window", fade_group: dfg });
    objs.push({ id: "infra_dry_S2F_0", type: "f_wall", x: dx, y: dy, z: 3, state: "upper", fade_group: dfg, variant: "w1" });
    objs.push({ id: "infra_dry_S2F_0b", type: "f_balcony", x: dx, y: dy, z: 3, state: "laundry", fade_group: dfg, variant: "b1" });
    objs.push({ id: "infra_dry_S2F_1", type: "f_wall", x: dx + 3, y: dy, z: 3, state: "upper", fade_group: dfg, variant: "w2" });
    objs.push({ id: "infra_dry_S2F_1w", type: "f_window", x: dx + 3, y: dy, z: 3, state: "intact", fade_group: dfg, night_lit: true });
    objs.push({ id: "infra_dry_S2F_2", type: "f_wall", x: dx + 6, y: dy, z: 3, state: "upper", fade_group: dfg, variant: "base" });
    objs.push({ id: "infra_dry_roof", type: "b_roof_b", x: dx, y: dy, z: 6, fade_group: dfg, variant: "base" });
    objs.push({ id: "infra_dry_bike", type: "p_ebike", x: dx + 7.2, y: dy - 1.6, rot: 2 });

    return objs;
  };

  AI.streetColliders = function () {
    return [
      { id: "infra_bank", rect: [-13.3, -10.3, -4.0, -1.0], _amenity: true, _infra: true },
      { id: "infra_toilet", rect: [8.2, -10.3, 14.5, -4.0], _amenity: true, _infra: true },
      { id: "infra_dry", rect: [36.7, 4.2, 45.0, 7.5], _amenity: true, _infra: true }
      // garage intentionally open (walkable ramp stub)
    ];
  };

  AI._injected = false;
  AI.injectStreet = function () {
    const W = SP.world;
    if (!W || !W.objects || W.interior) return false;
    if (AI._injected && W.byId && W.byId.infra_bank_door) return true;
    const now = SP.clock ? SP.clock.abs() : 0;
    for (const src of AI.streetObjects()) {
      if (W.byId && W.byId[src.id]) continue;
      const o = Object.assign({ z: 0, rot: 0, variant: "base" }, src);
      const P = SP.piece(o);
      if (!P) { console.warn("infra: missing piece", o.type, o.id); continue; }
      if (!o.state) o.state = (P.states && P.states[0]) || "default";
      o.overlays = []; o.alpha = {}; o.since = now; o._amenity = true; o._infra = true;
      W.objects.push(o);
      if (W.byId) W.byId[o.id] = o;
    }
    if (W.chunkCols) {
      for (const c of AI.streetColliders()) {
        if (!W.chunkCols.some((k) => k.id === c.id)) W.chunkCols.push(Object.assign({}, c));
      }
    }
    if (W.rebuildColliders) W.rebuildColliders();
    if (SP.env && SP.env.invalidateLights) SP.env.invalidateLights();
    if (SP.layers && SP.layers.reset) SP.layers.reset();
    AI._injected = true;
    return true;
  };

  // ---------- scenes ----------
  AI.registerScenes = function () {
    const D = window.AMENITIES45 || {};
    SP.scenes = SP.scenes || {};
    if (D.amenity_bank) SP.scenes.amenity_bank = D.amenity_bank;
    if (D.amenity_toilet) SP.scenes.amenity_toilet = D.amenity_toilet;
  };

  // ---------- ATM / bank play ----------
  AI.ensureBank = function () {
    const ps = SP.game && SP.game.ps; if (!ps) return null;
    if (!ps.bank) ps.bank = { balance: 3200, card: true }; // starting card balance (示意)
    return ps.bank;
  };
  AI.atmWithdraw = function (amount) {
    const ps = SP.game && SP.game.ps; if (!ps) return toast("无存档");
    const B = AI.ensureBank();
    amount = Math.floor(+amount || 0);
    if (!B.card) return toast("银行卡未绑定");
    if (amount < 100) return toast("单笔至少 ¥100");
    if (amount > 2000) return toast("ATM 单笔上限 ¥2000（示意）");
    if (B.balance < amount) return toast(`卡内余额不足（¥${B.balance}）`);
    B.balance -= amount;
    ps.money = Math.round((ps.money + amount) * 100) / 100;
    if (SP.game.payCard) SP.game.payCard({ amount, income: true, from: "井槐银行·ATM", method: "银行卡取现" });
    toast(`取出 ¥${amount} · 卡内余 ¥${B.balance}`);
    log(`ATM 取款 ¥${amount}`);
    return true;
  };
  AI.openAtmMenu = function (o) {
    const B = AI.ensureBank();
    const G = SP.game;
    const opts = [
      { id: "b100", ok: true, label: `取 ¥100（卡内 ¥${B.balance}）`, fn: () => AI.atmWithdraw(100) },
      { id: "b200", ok: true, label: "取 ¥200", fn: () => AI.atmWithdraw(200) },
      { id: "b500", ok: true, label: "取 ¥500", fn: () => AI.atmWithdraw(500) },
      { id: "bal", ok: true, label: "查询余额", fn: () => toast(`井槐银行 · 卡内余额 ¥${B.balance}`) }
    ];
    G.openMenu(Object.assign({}, o || {}, { _name: "ATM 取款机" }), opts);
  };

  // ---------- overlays ----------
  AI.drawOverlays = function (ctx) {
    if (!ctx || !SP.sx || !SP.world || SP.world.interior) return;
    const z = AI._cam().z; if (z < 0.28) return;
    const P = AI.POIS;
    ctx.save();
    AI.drawImg(ctx, "bank", P.bank.x, P.bank.y, 2.6, 0.9);
    AI.mark(ctx, P.bank.x, P.bank.y, 2.9, "银行网点", "#1450a0");
    AI.drawImg(ctx, "atm", P.bank.x + 4.2, P.bank.y + 1.2, 1.3, 0.85);
    AI.drawImg(ctx, "toilet", P.toilet.x, P.toilet.y, 2.4, 0.85);
    AI.mark(ctx, P.toilet.x, P.toilet.y, 2.7, "公厕", "#3a7a55");
    AI.drawImg(ctx, "garage_ramp", P.garage.x, P.garage.y, 0.05, 0.7, 0, 10);
    AI.drawImg(ctx, "garage", P.garage.x, P.garage.y, 2.2, 0.85);
    AI.mark(ctx, P.garage.x, P.garage.y, 2.5, "地下车库", "#5a5a66");
    AI.drawImg(ctx, "dryclean", P.dryclean.x, P.dryclean.y, 2.5, 0.88);
    AI.mark(ctx, P.dryclean.x, P.dryclean.y, 2.8, "干洗店", "#a05078");
    ctx.restore();
  };

  AI.wrapDraw = function () {
    if (AI._drawWrapped || !SP.game) return;
    const G = SP.game;
    const prev = G.drawOverlay && G.drawOverlay.bind(G);
    G.drawOverlay = function (ctx, cw, ch) {
      if (prev) prev(ctx, cw, ch);
      try { AI.drawOverlays(ctx); } catch (e) {}
    };
    AI._drawWrapped = true;
  };

  AI.wrapInteract = function () {
    if (AI._intWrapped || !SP.game) return;
    const G = SP.game;
    const A0 = G.actionFor.bind(G), U0 = G.use.bind(G);
    G.actionFor = function (o, kind) {
      const k = o && o.interact;
      if (k === "amenity_atm") return kind === "use" ? { label: "ATM 取款 / 查余额", do: "game" } : null;
      if (k === "amenity_bank_desk") return kind === "use" ? { label: "综合柜面 · 问问", do: "game" } : null;
      if (k === "amenity_bank_wait") return kind === "use" ? { label: "坐等候椅", do: "game" } : null;
      if (k === "amenity_wc") return kind === "use" ? { label: "使用厕位", do: "game" } : null;
      if (k === "amenity_garage") return kind === "use" ? { label: "地下车库入口", do: "game" } : null;
      if (k === "amenity_dryclean") return kind === "use" ? { label: "净衣坊·干洗（外立面）", do: "game" } : null;
      return A0(o, kind);
    };
    G.use = function (o) {
      const k = o && o.interact;
      if (k === "amenity_atm") { AI.openAtmMenu(o); return null; }
      if (k === "amenity_bank_desk") {
        toast("柜员：个人开户/转账请排号。急用现金走门口 ATM 更方便。");
        return null;
      }
      if (k === "amenity_bank_wait") { toast("坐在等候椅上刷了会儿手机。"); return null; }
      if (k === "amenity_wc") {
        toast("……（公厕占位）冲水声。");
        log("李默使用了公厕");
        if (SP.game.ps && SP.game.ps.needs) {
          SP.game.ps.needs.hygiene = Math.min(100, (SP.game.ps.needs.hygiene || 50) + 4);
        }
        return null;
      }
      if (k === "amenity_garage") {
        toast("地下车库入口：坡道+闸机占位。B1 施工围挡，车辆暂不可进。");
        log("李默看了看地下车库入口");
        return null;
      }
      if (k === "amenity_dryclean") {
        const h = o.hours || ["09:00", "20:00"];
        toast(`净衣坊·干洗：外立面占位。营业 ${h.join("–")} · 洗衣/熨烫示意。`);
        return null;
      }
      return U0(o);
    };
    AI._intWrapped = true;
  };

  AI.spawnAt = function (key) {
    const map = {
      bank: [-8.5, -6.6, "S"],
      bank_in: null,
      toilet: [12.5, -6.6, "S"],
      toilet_in: null,
      garage: [18.5, 12.8, "N"],
      dryclean: [38.5, 2.8, "N"]
    };
    if (key === "bank_in" && SP.scenes.amenity_bank) {
      return SP.game.switchScene("amenity_bank", SP.scenes.amenity_bank.spawn);
    }
    if (key === "toilet_in" && SP.scenes.amenity_toilet) {
      return SP.game.switchScene("amenity_toilet", SP.scenes.amenity_toilet.spawn);
    }
    const p = map[key]; if (!p) return;
    if (SP.world && SP.world.interior && SP.game.switchScene) SP.game.switchScene("street", p);
    else if (SP.player) {
      SP.player.x = p[0]; SP.player.y = p[1];
      if (p[2] && SP.player.setDir) SP.player.setDir(p[2]);
      if (SP.cam) SP.cam.ready = false;
      AI.injectStreet();
    }
  };

  AI.listAdded = function () {
    return [
      { id: "bank", name: "银行网点（外立面+ATM取款）", where: "南街西段 ≈(−10,−10)", status: "enterable+atm" },
      { id: "toilet", name: "公厕（可进厕位）", where: "南街中段 ≈(10,−10)", status: "enterable" },
      { id: "garage", name: "地下车库入口坡道", where: "12号院东侧 ≈(18.5,14)", status: "ramp_stub" },
      { id: "dryclean", name: "干洗店外立面", where: "东街便利店西侧 ≈(38.5,4.5)", status: "exterior" }
    ];
  };

  // ---------- install ----------
  AI.install = function () {
    if (AI.installed) return; AI.installed = true;
    AI.loadArt();
    AI.registerScenes();
    AI.wrapInteract();
    AI.wrapDraw();
    let tries = 0;
    const boot = () => {
      tries++;
      if (SP.world && SP.world.data && !SP.world.interior) {
        AI._injected = false;
        AI.injectStreet();
      }
      if (!AI._injected && tries < 50) setTimeout(boot, 220);
    };
    boot();
    if (SP.game && SP.game.switchScene && !SP.game._infraSwitch) {
      const S0 = SP.game.switchScene.bind(SP.game);
      SP.game.switchScene = function (to, spawn, door) {
        const r = S0(to, spawn, door);
        if (to === "street") setTimeout(() => { AI._injected = false; AI.injectStreet(); }, 0);
        return r;
      };
      SP.game._infraSwitch = true;
    }
    // chain shared injectStreet
    const prev = AM.injectStreet;
    if (!prev || !prev._infraChain) {
      AM.injectStreet = function () {
        let r;
        if (typeof prev === "function") try { r = prev.apply(AM, arguments); } catch (e) {}
        try { AI.injectStreet(); } catch (e) {}
        return r;
      };
      AM.injectStreet._infraChain = true;
    }
    console.info("[amenities-infra]", AI.VERSION, Object.keys(AI.POIS).join(","));
  };

  const boot = () => { if (!SP.game) return false; AI.install(); return true; };
  if (!boot()) {
    const iv = setInterval(() => { if (boot()) clearInterval(iv); }, 120);
    setTimeout(() => clearInterval(iv), 20000);
  }
  setTimeout(() => { try { AI.install(); } catch (e) {} }, 0);
})(window);
