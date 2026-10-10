/* scene-proto-45 · Amenities-Infra: 银行+ATM / 公厕 / 车库 / 干洗 / 邮政·通讯 / 活动中心·书屋 / 修车摊·修锁.
   NEW file — does not touch midtown* / estate / charB / store / market / props / civic-amen / stage* / appearance.
   Does NOT build 食堂/幼儿园/物业 (amenities_civic.js owns those).
   Facades deliberately DIVERSE (Leo hates clone rows): bank=roof_a/w1, toilet=pipe+hedge, garage=ramp,
   dryclean=shut+laundry balcony, post=green+shopsign, activity=warm shelves exterior, stalls=p_stall+locker, animal=park-side stall, elev=notice board. */
(function (root) {
  "use strict";
  if (!root.SP) return;
  const SP = root.SP;
  const AM = (SP.amenities = SP.amenities || {});
  const AI = (SP.amenityInfra = SP.amenityInfra || {});
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 2600);
  const log = (t) => SP.world && SP.world.logEvent && SP.world.logEvent(t);

  AI.VERSION = "2026-10-11-amenities-infra-integrity";
  AM.SLIDE_EAST = Object.assign({
    bank: [48, 0], toilet: [48, 0], garage: [40, 0], dryclean: [48, 0],
    post: [48, 0], activity: [48, 0], bike_repair: [40, 0], locksmith: [40, 0], animal_rescue: [40, 0], elev_notice: [40, 0],
    _infraNote: "老街 infra → 中环边缘时套用"
  }, AM.SLIDE_EAST || {});

  AI.POIS = {
    bank:        { x: -10.0, y: -19.0, label: "井槐银行网点" },
    toilet:      { x: 39.5,  y: -19.0, label: "公共卫生间" },
    garage:      { x: 29.8,  y: 8.2,   label: "地下车库入口" },
    dryclean:    { x: 42.0,  y: -19.0, label: "净衣坊·干洗" },
    post:        { x: -22.0, y: -19.0, label: "井槐邮政·通讯" },
    activity:    { x: 2.0,   y: -19.0, label: "社区活动中心·书屋" },
    bike_repair: { x: -13.5, y: 2.2,   label: "路边修车摊" },
    locksmith:   { x: -11.0, y: 2.35,  label: "修锁配钥匙" },
    animal_rescue: { x: 7.8, y: 33.0, label: "爱心屋·流浪救助" },
    elev_notice:   { x: 9.2,  y: 2.15, label: "电梯加装公示" }
  };

  // ---------- art ----------
  AI._imgs = {};
  AI.loadArt = function () {
    const names = ["bank", "toilet", "garage", "dryclean", "atm", "garage_ramp", "post", "activity", "bike_repair", "locksmith", "wrench", "animal", "elevator", "bowl"];
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
    const pl = SP.player; if (pl && Math.hypot((pl.x || 0) - x, (pl.y || 0) - y) > 12) return;
    const [X, Y] = AI.scr(x, y, zw || 0);
    const zcam = AI._cam().z;
    const s = (sc || 1) * Math.max(0.45, Math.min(1.2, zcam));
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.drawImage(im, X - w / 2 + (ox || 0) * s, Y - h / 2 + (oy || 0) * s, w, h);
  };
  AI.mark = function (ctx, x, y, zw, text, bg) {
    const zcam = AI._cam().z;
    if (zcam < 0.32) return;
    const pl = SP.player; if (pl && Math.hypot((pl.x || 0) - x, (pl.y || 0) - y) > 9) return;
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
      interact: "civic", to: "amenity_toilet", spawn: [41.0, -6.5, "N"],
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
    objs.push({ id: "infra_garage_barrier", type: "w_fence", x: P.garage.x, y: P.garage.y + 0.4, rot: 0, fade_group: "infra_garage" });
    objs.push({
      id: "infra_garage", type: "p_planter", x: P.garage.x, y: P.garage.y - 0.3,
      interact: "amenity_garage", name: "地下车库入口"
    });
    objs.push({ id: "infra_garage_lamp", type: "p_lamp", x: P.garage.x - 3.0, y: P.garage.y - 0.8 });

    // === DRY CLEAN: single awning shop bay (different state / props than bank|toilet|clinic) ===
    const dx = P.dryclean.x - 1.5, dy = P.dryclean.y, dfg = "infra_dry";
    objs.push({ id: "infra_dry_S1F_0", type: "f_shop", x: dx, y: dy, state: "shut", fade_group: dfg }); // shut bay + laundry balcony ≠ bank/clinic
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

    // === POST / TELECOM: green China-Post vibe — shopsign + roof_a (≠ bank cream / clinic p1 / dry shut) ===
    const px = P.post.x - 3, py = P.post.y, pfg = "infra_post";
    objs.push({ id: "infra_post_S1F_0", type: "f_shop", x: px, y: py, state: "window", fade_group: pfg });
    objs.push({
      id: "infra_post_door", type: "f_shop", x: px + 3, y: py, state: "door", fade_group: pfg,
      interact: "civic", to: "amenity_post", spawn: [-20.5, -6.5, "N"],
      name: "井槐邮政·通讯", hours: ["08:30", "18:00"]
    });
    objs.push({ id: "infra_post_S1F_2", type: "f_shop", x: px + 6, y: py, state: "window", fade_group: pfg });
    objs.push({ id: "infra_post_sign", type: "f_shopsign", x: px + 3, y: py, z: 3.2, fade_group: pfg });
    objs.push({ id: "infra_post_S2F_0", type: "f_wall", x: px, y: py, z: 3, state: "upper", fade_group: pfg, variant: "base" });
    objs.push({ id: "infra_post_S2F_0w", type: "f_window", x: px, y: py, z: 3, state: "intact", fade_group: pfg, night_lit: true });
    objs.push({ id: "infra_post_S2F_1", type: "f_wall", x: px + 3, y: py, z: 3, state: "upper", fade_group: pfg, variant: "base" });
    objs.push({ id: "infra_post_S2F_1w", type: "f_window", x: px + 3, y: py, z: 3, state: "intact", fade_group: pfg, night_lit: true });
    objs.push({ id: "infra_post_S2F_2", type: "f_wall", x: px + 6, y: py, z: 3, state: "upper", fade_group: pfg, variant: "w2" });
    objs.push({ id: "infra_post_roof", type: "b_roof_a", x: px, y: py, z: 6, fade_group: pfg });
    objs.push({ id: "infra_post_box", type: "p_locker", x: P.post.x + 4.5, y: P.post.y + 1.15, interact: "amenity_post_box", name: "邮筒/自助取件柜" });
    objs.push({ id: "infra_post_pot", type: "p_planter", x: px - 1.3, y: py + 1.4 });

    // === ACTIVITY / 书屋: warm wide bay, balcony default (NOT laundry), different from dryclean ===
    const ax = P.activity.x - 3, ay = P.activity.y, afg = "infra_act";
    objs.push({ id: "infra_act_S1F_0", type: "f_wall", x: ax, y: ay, state: "ground", fade_group: afg, variant: "w2" });
    objs.push({ id: "infra_act_S1F_0w", type: "f_window", x: ax, y: ay, state: "intact", fade_group: afg, night_lit: true, variant: "w2" });
    objs.push({
      id: "infra_act_door", type: "f_door", x: ax + 3, y: ay, state: "closed", fade_group: afg,
      interact: "civic", to: "amenity_activity", spawn: [4.0, -6.5, "N"],
      name: "社区活动中心·书屋", hours: ["09:00", "21:00"]
    });
    objs.push({ id: "infra_act_S1F_2", type: "f_wall", x: ax + 6, y: ay, state: "ground", fade_group: afg, variant: "w1" });
    objs.push({ id: "infra_act_S1F_2w", type: "f_window", x: ax + 6, y: ay, state: "intact", fade_group: afg, night_lit: true });
    objs.push({ id: "infra_act_S2F_0", type: "f_wall", x: ax, y: ay, z: 3, state: "upper", fade_group: afg, variant: "w2" });
    objs.push({ id: "infra_act_S2F_0b", type: "f_balcony", x: ax, y: ay, z: 3, state: "default", fade_group: afg, variant: "b2" });
    objs.push({ id: "infra_act_S2F_1", type: "f_wall", x: ax + 3, y: ay, z: 3, state: "upper", fade_group: afg, variant: "w1" });
    objs.push({ id: "infra_act_S2F_1w", type: "f_window", x: ax + 3, y: ay, z: 3, state: "intact", fade_group: afg, night_lit: true });
    objs.push({ id: "infra_act_S2F_2", type: "f_wall", x: ax + 6, y: ay, z: 3, state: "upper", fade_group: afg, variant: "base" });
    objs.push({ id: "infra_act_roof", type: "b_roof_b", x: ax, y: ay, z: 6, fade_group: afg, variant: "base" });
    objs.push({ id: "infra_act_notice", type: "p_notice", x: P.activity.x + 4.2, y: P.activity.y + 1.1,
      interact: "amenity_activity_board", name: "活动公示栏" });
    objs.push({ id: "infra_act_tree", type: "p_tree", x: ax - 2.2, y: ay + 2.0, variant: "t2" });

    // === 修车摊 + 修锁点: open stalls (NOT building facades) — kit mix stall/bike/locker/notice ===
    objs.push({
      id: "infra_bike_stall", type: "p_stall", x: P.bike_repair.x, y: P.bike_repair.y,
      interact: "amenity_bike_repair", name: "路边修车摊"
    });
    objs.push({ id: "infra_bike_a", type: "p_bike", x: P.bike_repair.x - 1.4, y: P.bike_repair.y + 0.4, state: "parked" });
    objs.push({ id: "infra_bike_b", type: "p_bike", x: P.bike_repair.x + 1.5, y: P.bike_repair.y - 0.2, state: "knocked" });
    objs.push({ id: "infra_bike_bins", type: "p_bins", x: P.bike_repair.x + 2.4, y: P.bike_repair.y + 0.6 });
    objs.push({
      id: "infra_lock_stall", type: "p_notice", x: P.locksmith.x, y: P.locksmith.y,
      interact: "amenity_locksmith", name: "修锁配钥匙"
    });
    objs.push({ id: "infra_lock_box", type: "p_locker", x: P.locksmith.x + 1.3, y: P.locksmith.y + 0.15,
      interact: "amenity_locksmith", name: "钥匙柜" });

    // === 爱心屋·流浪救助: tiny shelter near 小公园 (NOT a south-strip building clone; stall+pots+bowl) ===
    objs.push({
      id: "infra_animal", type: "p_stall", x: P.animal_rescue.x, y: P.animal_rescue.y,
      interact: "amenity_animal", name: "爱心屋·流浪救助"
    });
    objs.push({ id: "infra_animal_pot_a", type: "p_pot", x: P.animal_rescue.x - 1.3, y: P.animal_rescue.y + 0.5, state: "grown" });
    objs.push({ id: "infra_animal_pot_b", type: "p_pot", x: P.animal_rescue.x + 1.4, y: P.animal_rescue.y - 0.3, state: "small" });
    objs.push({ id: "infra_animal_bowl", type: "p_planter", x: P.animal_rescue.x + 0.2, y: P.animal_rescue.y + 1.1,
      interact: "amenity_animal_bowl", name: "饮水/食盆" });
    objs.push({ id: "infra_animal_hedge", type: "p_hedge", x: P.animal_rescue.x - 2.0, y: P.animal_rescue.y + 1.3 });

    // === 电梯加装公示: notice+post at 12号东侧北人行道 (board only, no facade) ===
    objs.push({ id: "infra_elev_post", type: "p_post", x: P.elev_notice.x - 0.9, y: P.elev_notice.y });
    objs.push({
      id: "infra_elev_board", type: "p_notice", x: P.elev_notice.x, y: P.elev_notice.y,
      interact: "amenity_elev_notice", name: "电梯加装公示",
      note: "井槐里12号电梯加装公示：业主表决通过 · 施工围挡预告 · 费用分摊方案见物业（示意）。异议期至本月末。"
    });
    objs.push({ id: "infra_elev_pot", type: "p_planter", x: P.elev_notice.x + 1.4, y: P.elev_notice.y + 0.35 });

    return objs;
  };

  AI.streetColliders = function () {
    return [
      { id: "infra_bank", rect: [-13.3, -19.3, -4.0, -10.0], _amenity: true, _infra: true },
      { id: "infra_toilet", rect: [37.7, -19.3, 44.0, -13.0], _amenity: true, _infra: true },
      { id: "infra_dry", rect: [40.2, -19.3, 48.5, -13.0], _amenity: true, _infra: true },
      { id: "infra_post", rect: [-25.3, -19.3, -16.0, -10.0], _amenity: true, _infra: true },
      { id: "infra_act", rect: [-1.3, -19.3, 8.0, -13.0], _amenity: true, _infra: true }
      // garage + stalls intentionally open (walkable)
    ];
  };

  AI._injected = false;
  AI.injectStreet = function () {
    const W = SP.world;
    if (!W || !W.objects || W.interior) return false;
    if (AI._injected && W.byId && W.byId.infra_bank_door && W.byId.infra_post_door && W.byId.infra_act_door && W.byId.infra_animal && W.byId.infra_elev_board) return true;
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
    if (D.amenity_post) SP.scenes.amenity_post = D.amenity_post;
    if (D.amenity_activity) SP.scenes.amenity_activity = D.amenity_activity;
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
    AI.drawImg(ctx, "post", P.post.x, P.post.y, 2.55, 0.9);
    AI.mark(ctx, P.post.x, P.post.y, 2.85, "邮政·通讯", "#0a7848");
    AI.drawImg(ctx, "activity", P.activity.x, P.activity.y, 2.5, 0.88);
    AI.mark(ctx, P.activity.x, P.activity.y, 2.8, "活动中心·书屋", "#8a5a28");
    AI.drawImg(ctx, "bike_repair", P.bike_repair.x, P.bike_repair.y, 2.0, 0.8);
    AI.mark(ctx, P.bike_repair.x, P.bike_repair.y, 2.3, "修车摊", "#4a6078");
    AI.drawImg(ctx, "locksmith", P.locksmith.x, P.locksmith.y, 2.0, 0.78);
    AI.mark(ctx, P.locksmith.x, P.locksmith.y, 2.3, "修锁点", "#6e5030");
    // animal + elev: world props only (HUD art floated through courtyard walls / stacked with garage)
    if (AI.canOverlay ? AI.canOverlay(P.animal_rescue.x, P.animal_rescue.y, 7) : true) {
      /* intentionally no floating mark — stall/pots are sorted world objects */
    }
    if (Math.hypot(((SP.player&&SP.player.x)||0)-P.elev_notice.x, ((SP.player&&SP.player.y)||0)-P.elev_notice.y) < 7) {
      AI.drawImg(ctx, "elevator", P.elev_notice.x, P.elev_notice.y, 2.15, 0.82);
      AI.mark(ctx, P.elev_notice.x, P.elev_notice.y, 2.45, "电梯公示", "#3a5080");
    }
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
      if (k === "amenity_post_mail") return kind === "use" ? { label: "寄件窗口", do: "game" } : null;
      if (k === "amenity_post_tel") return kind === "use" ? { label: "通讯/话费台", do: "game" } : null;
      if (k === "amenity_post_wait") return kind === "use" ? { label: "坐等候椅", do: "game" } : null;
      if (k === "amenity_post_box") return kind === "use" ? { label: "邮筒/自助取件柜", do: "game" } : null;
      if (k === "amenity_book") return kind === "use" ? { label: "翻书架", do: "game" } : null;
      if (k === "amenity_read") return kind === "use" ? { label: "坐下阅览", do: "game" } : null;
      if (k === "amenity_activity_desk") return kind === "use" ? { label: "活动报名台", do: "game" } : null;
      if (k === "amenity_activity_board") return kind === "use" ? { label: "看活动公示", do: "game" } : null;
      if (k === "amenity_bike_repair") return kind === "use" ? { label: "修车摊 · 问问", do: "game" } : null;
      if (k === "amenity_locksmith") return kind === "use" ? { label: "修锁配钥匙", do: "game" } : null;
      if (k === "amenity_animal") return kind === "use" ? { label: "爱心屋·流浪救助", do: "game" } : null;
      if (k === "amenity_animal_bowl") return kind === "use" ? { label: "添点水/猫粮", do: "game" } : null;
      if (k === "amenity_elev_notice") return kind === "use" ? { label: "看电梯加装公示", do: "game" } : null;
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
      if (k === "amenity_post_mail") {
        const fee = 5;
        const ps = SP.game && SP.game.ps;
        if (ps && ps.money >= fee) {
          ps.money = Math.round((ps.money - fee) * 100) / 100;
          toast(`寄出平信 · 邮资 ¥${fee}（示意收据）`);
          log("邮政寄件");
        } else toast(ps ? `钱不够寄件（要 ¥${fee}）` : "寄件窗口：平信 ¥5 起（示意）");
        return null;
      }
      if (k === "amenity_post_tel") {
        const fee = 30;
        const ps = SP.game && SP.game.ps;
        if (ps && ps.money >= fee) {
          ps.money = Math.round((ps.money - fee) * 100) / 100;
          toast(`话费充值 ¥${fee} · 到账示意`);
          log("通讯话费充值");
        } else toast(ps ? `钱不够充值（要 ¥${fee}）` : "通讯台：话费充值 ¥30 起");
        return null;
      }
      if (k === "amenity_post_wait") { toast("在邮政厅坐了会儿，看公告屏滚过取件码。"); return null; }
      if (k === "amenity_post_box") { toast("邮筒/自助柜：刷取件码（示意）。大件去驿站。"); return null; }
      if (k === "amenity_book") {
        toast("随手抽了一本社区报 / 旧小说翻了几页。");
        if (SP.game.ps && SP.game.ps.needs) {
          SP.game.ps.needs.mood = Math.min(100, (SP.game.ps.needs.mood || 50) + 3);
        }
        return null;
      }
      if (k === "amenity_read") {
        toast("在阅览桌安静坐了一会儿。");
        log("书屋阅览");
        if (SP.game.ps && SP.game.ps.needs) {
          SP.game.ps.needs.mood = Math.min(100, (SP.game.ps.needs.mood || 50) + 5);
          SP.game.ps.needs.energy = Math.min(100, (SP.game.ps.needs.energy || 50) + 2);
        }
        return null;
      }
      if (k === "amenity_activity_desk") {
        toast("工作人员：周三书法、周六亲子绘本，扫码报名（示意）。");
        return null;
      }
      if (k === "amenity_activity_board") {
        toast("公示栏：本周书法 / 绘本 / 免费阅览 · 请勿外带图书。");
        return null;
      }
      if (k === "amenity_bike_repair") {
        const G = SP.game;
        const fee = 15;
        G.openMenu(Object.assign({}, o || {}, { _name: "路边修车摊" }), [
          { id: "tire", ok: true, label: `补胎/打气 ¥${fee}`, fn: () => {
            const ps = SP.game && SP.game.ps; if (!ps) return;
            if (ps.money < fee) return toast(`钱不够（要 ¥${fee}）`);
            ps.money = Math.round((ps.money - fee) * 100) / 100;
            toast(`师傅补好了胎 · −¥${fee}`);
            log("修车摊补胎");
          }},
          { id: "chat", ok: true, label: "随便问问路", fn: () => toast("师傅：往东过斑马线是卫生中心，往西邮政能寄件。") }
        ]);
        return null;
      }
      if (k === "amenity_locksmith") {
        const fee = 25;
        const ps = SP.game && SP.game.ps;
        if (!ps) { toast("修锁点：换锁芯/配钥匙示意"); return null; }
        if (ps.money < fee) { toast(`钱不够配钥匙（要 ¥${fee}）`); return null; }
        ps.money = Math.round((ps.money - fee) * 100) / 100;
        toast(`配了一把备用钥匙 · −¥${fee}`);
        log("修锁配钥匙");
        return null;
      }
      if (k === "amenity_animal") {
        const G = SP.game;
        G.openMenu(Object.assign({}, o || {}, { _name: "爱心屋·流浪救助" }), [
          { id: "feed", ok: true, label: "放下猫粮/狗粮（示意）", fn: () => {
            toast("给流浪猫狗添了食。碗边趴着一只橘猫（示意）。");
            log("爱心屋投喂");
            if (SP.game.ps && SP.game.ps.needs)
              SP.game.ps.needs.mood = Math.min(100, (SP.game.ps.needs.mood || 50) + 4);
          }},
          { id: "water", ok: true, label: "换一碗清水", fn: () => toast("清水换好了。夏天记得常换。") },
          { id: "info", ok: true, label: "看救助告示", fn: () => toast("告示：发现受伤动物可联系社区志愿者（示意电话）。勿遗弃。") }
        ]);
        return null;
      }
      if (k === "amenity_animal_bowl") {
        toast("食盆还有半碗粮，旁边水碗满着。");
        return null;
      }
      if (k === "amenity_elev_notice") {
        const note = (o && o.note) || "井槐里12号电梯加装公示（示意）。";
        toast(note, 4200);
        log("阅读电梯加装公示");
        return null;
      }
      return U0(o);
    };
    AI._intWrapped = true;
  };

  AI.spawnAt = function (key) {
    const map = {
      bank: [-8.5, -6.6, "S"],
      toilet: [12.5, -6.6, "S"],
      garage: [20.0, 10.8, "N"],
      dryclean: [48.0, -6.6, "S"],
      post: [-20.5, -6.6, "S"],
      activity: [4.0, -6.6, "S"],
      bike_repair: [-13.5, 1.2, "N"],
      locksmith: [-11.0, 1.2, "N"],
      animal_rescue: [9.2, 27.8, "N"],
      elev_notice: [19.5, 1.2, "N"]
    };
    if (key === "bank_in" && SP.scenes.amenity_bank) {
      return SP.game.switchScene("amenity_bank", SP.scenes.amenity_bank.spawn);
    }
    if (key === "toilet_in" && SP.scenes.amenity_toilet) {
      return SP.game.switchScene("amenity_toilet", SP.scenes.amenity_toilet.spawn);
    }
    if (key === "post_in" && SP.scenes.amenity_post) {
      return SP.game.switchScene("amenity_post", SP.scenes.amenity_post.spawn);
    }
    if (key === "activity_in" && SP.scenes.amenity_activity) {
      return SP.game.switchScene("amenity_activity", SP.scenes.amenity_activity.spawn);
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
      { id: "garage", name: "地下车库入口坡道", where: "12号院东侧巷口 ≈(20,12)", status: "ramp_stub" },
      { id: "dryclean", name: "干洗店外立面", where: "东街南侧 ≈(48,−10)", status: "exterior" },
      { id: "post", name: "邮政·通讯营业厅", where: "南街更西 ≈(−22,−10)", status: "enterable" },
      { id: "activity", name: "社区活动中心·书屋", where: "南街中西 ≈(2,−10)", status: "enterable" },
      { id: "bike_repair", name: "路边修车摊", where: "北人行道西 ≈(−13.5,2.2)", status: "stall" },
      { id: "locksmith", name: "修锁配钥匙点", where: "北人行道西 ≈(−11,2.3)", status: "stall" },
      { id: "animal_rescue", name: "爱心屋·流浪救助", where: "小公园北侧 ≈(9.2,29)", status: "prop_stall" },
      { id: "elev_notice", name: "电梯加装公示点", where: "12号东侧北人行道 ≈(19.5,2.3)", status: "notice_board" }
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
