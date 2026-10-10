/* scene-proto-45 · Amenities-Sport parallel track (old block → midtown/east edge).
   Owns: outdoor 运动场 stub · 社区小公园 · 社区体育场 exterior stub · 社区诊所 (enterable waiting room)
   + bonus 快递驿站 / 充电桩 / 垃圾分类点.
   NEW files only — does not touch midtown.js / midtown_estate / charB / store / market / stage* / appearance / civic.
   菜市场/小超市 owned elsewhere — not built here. */
(function (SP) {
  "use strict";
  const AM = (SP.amenities = SP.amenities || {});
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 2600);
  const log = (t) => SP.world && SP.world.logEvent && SP.world.logEvent(t);

  AM.VERSION = "2026-10-10-amenities-sport";
  AM.POIS = {
    court:   { x: 13.2, y: 18.6, label: "井槐里 · 运动场" },
    park:    { x: 6.0,  y: 28.5, label: "井槐社区小公园" },
    stadium: { x: 70.0, y: -28.0, label: "井槐社区体育场" },
    clinic:  { x: 31.0, y: -10.0, label: "井槐社区诊所" },
  };

  // ---------- art (img/amenities/) ----------
  AM._imgs = {};
  AM.loadArt = function () {
    const names = [
      "clinic", "stadium", "park", "court", "express", "charge", "recycle",
      "court_decal", "park_decal", "pingpong", "charger", "recycle_bins", "stadium_facade"
    ];
    for (const n of names) {
      if (AM._imgs[n]) continue;
      const im = new Image();
      im.src = "img/amenities/" + n + ".png";
      AM._imgs[n] = im;
    }
  };

  // ---------- street inject (reuse kit pieces + custom interact markers) ----------
  AM._injected = false;
  AM.streetObjects = function () {
    const P = AM.POIS;
    const objs = [];
    // --- 运动场 stub (courtyard NE strip): fence posts + interact marker ---
    objs.push({ id: "am_court_post_a", type: "p_post", x: 11.0, y: 17.2 });
    objs.push({ id: "am_court_post_b", type: "p_post", x: 15.2, y: 17.2 });
    objs.push({ id: "am_court_post_c", type: "p_post", x: 11.0, y: 20.6 });
    objs.push({ id: "am_court_post_d", type: "p_post", x: 15.2, y: 20.6 });
    objs.push({ id: "am_court_hedge", type: "p_hedge", x: 13.2, y: 21.2, rot: 0 });
    objs.push({
      id: "am_court", type: "p_planter", x: P.court.x, y: P.court.y,
      interact: "amenity_court", name: "运动场", fadeable: false
    });
    // --- 社区小公园 (north of 12号) ---
    objs.push({ id: "am_park_tree_a", type: "p_tree", x: 3.5, y: 27.5, variant: "t2" });
    objs.push({ id: "am_park_tree_b", type: "p_tree", x: 8.5, y: 29.5, variant: "base" });
    objs.push({ id: "am_park_planter_a", type: "p_planter", x: 4.5, y: 29.0 });
    objs.push({ id: "am_park_planter_b", type: "p_planter", x: 7.5, y: 27.8 });
    objs.push({ id: "am_park_pot", type: "p_pot", x: 5.5, y: 30.2, state: "grown" });
    objs.push({
      id: "am_park_bench", type: "p_planter", x: P.park.x, y: P.park.y,
      interact: "amenity_park", name: "社区小公园 · 长椅"
    });
    // --- 社区诊所 exterior (gap east of 卫生中心) ---
    const cx = 29.0, cy = -10.0, fg = "amenity_clinic";
    objs.push({ id: "am_clinic_S1F_0", type: "f_shop", x: cx, y: cy, state: "window", fade_group: fg });
    objs.push({
      id: "am_clinic_door", type: "f_shop", x: cx + 3.0, y: cy, state: "door", fade_group: fg,
      interact: "civic", to: "amenity_clinic", spawn: [31.5, -6.5, "N"],
      name: "井槐社区诊所", hours: ["08:00", "20:00"]
    });
    objs.push({ id: "am_clinic_S1F_2", type: "f_shop", x: cx + 6.0, y: cy, state: "window", fade_group: fg });
    objs.push({ id: "am_clinic_W1F_0", type: "f_wall", x: cx, y: cy + 3.0, rot: 6, state: "ground", fade_group: fg, variant: "p1" });
    objs.push({ id: "am_clinic_W1F_0w", type: "f_window", x: cx, y: cy + 3.0, rot: 6, state: "intact", fade_group: fg, night_lit: true });
    objs.push({ id: "am_clinic_W1F_1", type: "f_wall", x: cx, y: cy + 6.0, rot: 6, state: "ground", fade_group: fg, variant: "p1" });
    objs.push({ id: "am_clinic_W1F_1w", type: "f_window", x: cx, y: cy + 6.0, rot: 6, state: "intact", fade_group: fg, night_lit: false });
    objs.push({ id: "am_clinic_S2F_0", type: "f_wall", x: cx, y: cy, z: 3.0, state: "upper", fade_group: fg, variant: "p1" });
    objs.push({ id: "am_clinic_S2F_0w", type: "f_window", x: cx, y: cy, z: 3.0, state: "intact", fade_group: fg, night_lit: true });
    objs.push({ id: "am_clinic_S2F_1", type: "f_wall", x: cx + 3.0, y: cy, z: 3.0, state: "upper", fade_group: fg, variant: "p1" });
    objs.push({ id: "am_clinic_S2F_1w", type: "f_window", x: cx + 3.0, y: cy, z: 3.0, state: "intact", fade_group: fg, night_lit: true });
    objs.push({ id: "am_clinic_S2F_2", type: "f_wall", x: cx + 6.0, y: cy, z: 3.0, state: "upper", fade_group: fg, variant: "p1" });
    objs.push({ id: "am_clinic_S2F_2w", type: "f_window", x: cx + 6.0, y: cy, z: 3.0, state: "intact", fade_group: fg, night_lit: false });
    objs.push({ id: "am_clinic_roof", type: "b_roof_b", x: cx, y: cy, z: 6.0, fade_group: fg, variant: "c" });
    // --- 社区体育场 exterior stub (midtown/east · south fringe) ---
    const sx = 67.0, sy = -28.0, sfg = "amenity_stadium";
    for (let i = 0; i < 5; i++) {
      objs.push({
        id: "am_stad_S1F_" + i, type: i === 2 ? "f_shop" : "f_wall",
        x: sx + i * 3.0, y: sy, state: i === 2 ? "door" : "ground", fade_group: sfg, variant: "w1",
        ...(i === 2 ? { interact: "amenity_stadium", name: "井槐社区体育场", hours: ["06:00", "22:00"] } : {})
      });
      if (i !== 2) objs.push({
        id: "am_stad_S1F_" + i + "w", type: "f_window", x: sx + i * 3.0, y: sy,
        state: "intact", fade_group: sfg, night_lit: i % 2 === 0, variant: "w1"
      });
      objs.push({ id: "am_stad_S2F_" + i, type: "f_wall", x: sx + i * 3.0, y: sy, z: 3.0, state: "upper", fade_group: sfg, variant: "w1" });
      objs.push({ id: "am_stad_S2F_" + i + "w", type: "f_window", x: sx + i * 3.0, y: sy, z: 3.0, state: "intact", fade_group: sfg, night_lit: true });
      objs.push({ id: "am_stad_S3F_" + i, type: "f_wall", x: sx + i * 3.0, y: sy, z: 6.0, state: "upper", fade_group: sfg, variant: "w2" });
    }
    objs.push({ id: "am_stad_roof", type: "b_roof_b", x: sx, y: sy, z: 9.0, fade_group: sfg, variant: "base" });
    objs.push({ id: "am_stad_tree", type: "p_tree", x: sx - 2.5, y: sy + 3.5 });
    return objs;
  };
  AM.streetColliders = function () {
    return [
      { id: "amenity_clinic", rect: [28.7, -10.3, 38.0, -1.0], _amenity: true },
      { id: "amenity_stadium", rect: [66.7, -28.3, 82.0, -19.0], _amenity: true }
      // court pad intentionally open (walkable stub); posts/hedge use kit footprints
    ];
  };

  AM.injectSportStreet = function () {
    const W = SP.world;
    if (!W || !W.objects || W.interior) return false;
    if (AM._injected && W.byId && W.byId.am_clinic_door) return true;
    const now = SP.clock ? SP.clock.abs() : 0;
    for (const src of AM.streetObjects()) {
      if (W.byId && W.byId[src.id]) continue;
      const o = Object.assign({ z: 0, rot: 0, variant: "base" }, src);
      const P = SP.piece(o);
      if (!P) { console.warn("amenities: missing piece", o.type); continue; }
      if (!o.state) o.state = (P.states && P.states[0]) || "default";
      o.overlays = []; o.alpha = {}; o.since = now; o._amenity = true;
      W.objects.push(o);
      if (W.byId) W.byId[o.id] = o;
    }
    if (W.chunkCols) {
      for (const c of AM.streetColliders()) {
        if (!W.chunkCols.some((k) => k.id === c.id)) W.chunkCols.push(Object.assign({}, c));
      }
    }
    if (W.rebuildColliders) W.rebuildColliders();
    if (SP.env && SP.env.invalidateLights) SP.env.invalidateLights();
    if (SP.layers && SP.layers.reset) SP.layers.reset();
    AM._injected = true;
    return true;
  };

  // ---------- clinic interior scene ----------
  AM.registerClinic = function () {
    const data = window.AMENITIES45 && window.AMENITIES45.amenity_clinic;
    if (!data) { console.warn("amenities: amenities45.js missing amenity_clinic"); return; }
    SP.scenes = SP.scenes || {};
    SP.scenes.amenity_clinic = data;
  };

  // ---------- overlays (decals + signs + props) ----------
  AM._cam = function () {
    const cam = SP.cam || {};
    return { z: cam.zoom || 1, cx: cam.x || 0, cy: cam.y || 0 };
  };
  AM.scr = function (x, y, zw) {
    const { z, cx, cy } = AM._cam();
    return [(SP.sx(x, y) - cx) * z, (SP.sy(x, y, zw || 0) - cy) * z];
  };
  AM.drawWorldImg = function (ctx, key, x, y, zw, sc, ox, oy) {
    const im = AM._imgs[key];
    if (!im || !im.complete || !im.naturalWidth) return;
    const [X, Y] = AM.scr(x, y, zw || 0);
    const zcam = AM._cam().z;
    const s = (sc || 1) * Math.max(0.45, Math.min(1.25, zcam));
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.drawImage(im, X - w / 2 + (ox || 0) * s, Y - h / 2 + (oy || 0) * s, w, h);
  };

  AM.markLabel = function (ctx, x, y, zw, text, bg) {
    const zcam = AM._cam().z;
    if (zcam < 0.35) return;
    const [X, Y] = AM.scr(x, y, zw || 2.2);
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.font = "bold " + Math.round(11 * Math.min(1.2, zcam)) + "px sans-serif";
    ctx.textAlign = "center";
    const tw = Math.max(64, ctx.measureText(text).width + 14);
    ctx.fillStyle = bg || "#c86a28";
    ctx.fillRect(X - tw / 2, Y - 12, tw, 18);
    ctx.fillStyle = "#fff";
    ctx.fillText(text, X, Y + 1);
    ctx.restore();
  };

  AM.drawCourtFallback = function (ctx) {
    const pts = [[11.2, 17.4], [15.2, 17.4], [15.2, 20.5], [11.2, 20.5]];
    ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    pts.forEach((p, i) => {
      const [X, Y] = AM.scr(p[0], p[1], 0.02);
      if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
    });
    ctx.closePath(); ctx.stroke();
    const k = [[12.6, 17.5], [13.8, 17.5], [13.8, 18.8], [12.6, 18.8]];
    ctx.beginPath();
    k.forEach((p, i) => {
      const [X, Y] = AM.scr(p[0], p[1], 0.03);
      if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
    });
    ctx.closePath(); ctx.stroke();
    ctx.restore();
  };

  AM.drawOverlays = function (ctx) {
    if (!ctx || !SP.sx || !SP.world) return;
    const z = (SP.cam && SP.cam.zoom) || 1;
    if (z < 0.28) return;
    const interior = SP.world.interior;
    const sid = SP.world.sceneId;
    ctx.save();
    if (!interior) {
      AM.drawCourtFallback(ctx);
      AM.drawWorldImg(ctx, "court_decal", 13.2, 18.8, 0.02, 0.55, 0, 8);
      AM.drawWorldImg(ctx, "pingpong", 12.0, 17.6, 0.55, 0.7);
      AM.drawWorldImg(ctx, "court", 13.2, 18.6, 2.2, 0.85);
      AM.markLabel(ctx, 13.2, 18.6, 2.4, "运动场", "#c86a28");
      AM.drawWorldImg(ctx, "park_decal", 6.0, 28.6, 0.02, 0.6, 0, 6);
      AM.drawWorldImg(ctx, "park", 6.0, 28.5, 2.0, 0.85);
      AM.markLabel(ctx, 6.0, 28.5, 2.2, "社区小公园", "#32803c");
      AM.drawWorldImg(ctx, "clinic", 31.0, -10.0, 2.55, 0.9);
      AM.markLabel(ctx, 31.0, -10.0, 2.8, "社区诊所", "#288a72");
      AM.drawWorldImg(ctx, "stadium_facade", 73.0, -27.5, 4.5, 0.95, 0, -20);
      AM.drawWorldImg(ctx, "stadium", 73.0, -28.0, 3.2, 0.9);
      AM.markLabel(ctx, 73.0, -28.0, 3.5, "社区体育场", "#1e5aa0");
      // bonus props
    } else if (sid === "amenity_clinic") {
      // waiting-room cue banner
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = "#288a72";
      ctx.fillRect(ctx.canvas.width / 2 - 90, 18, 180, 28);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("井槐社区诊所 · 候诊区", ctx.canvas.width / 2, 37);
    }
    ctx.restore();
  };

  AM.wrapDraw = function () {
    if (AM._drawWrapped || !SP.game) return;
    const G = SP.game;
    const prev = G.drawOverlay && G.drawOverlay.bind(G);
    G.drawOverlay = function (ctx, cw, ch) {
      if (prev) prev(ctx, cw, ch);
      try { AM.drawOverlays(ctx); } catch (e) {}
    };
    // also wrap __proto.render when ready (manual capture path)
    const iv = setInterval(() => {
      const P = window.__proto;
      if (P && P.render && !P._amenityDraw) {
        const r0 = P.render.bind(P);
        P.render = function () {
          const r = r0();
          try {
            const c = document.getElementById("game");
            if (c) AM.drawOverlays(c.getContext("2d"));
          } catch (e) {}
          return r;
        };
        P._amenityDraw = true;
        clearInterval(iv);
      }
    }, 300);
    AM._drawWrapped = true;
  };

  // ---------- interactions ----------
  AM.wrapInteract = function () {
    if (AM._intWrapped || !SP.game) return;
    const G = SP.game;
    const A0 = G.actionFor.bind(G), U0 = G.use.bind(G);
    G.actionFor = function (o, kind) {
      const k = o && o.interact;
      if (k === "amenity_court") return kind === "use" ? { label: "运动场 · 打球 / 乒乓", do: "game" } : null;
      if (k === "amenity_park") return kind === "use" ? { label: "小公园 · 坐长椅", do: "game" } : null;
      if (k === "amenity_stadium") return kind === "use" ? { label: "社区体育场（外观占位）", do: "game" } : null;
      if (k === "amenity_desk") return kind === "use" ? { label: "挂号台 · 问问", do: "game" } : null;
      if (k === "amenity_wait") return kind === "use" ? { label: "坐候诊椅", do: "game" } : null;
      return A0(o, kind);
    };
    G.use = function (o) {
      const k = o && o.interact;
      if (k === "amenity_court") {
        toast("运动场：半场篮线 + 乒乓台（占位）。下午常有人投篮。");
        log("李默在井槐里运动场转了转");
        return null;
      }
      if (k === "amenity_park") {
        toast("坐在长椅上吹了会儿风。小公园有步道和花坛。");
        log("李默在社区小公园坐了一会儿");
        if (G.ps && G.ps.needs) {
          G.ps.needs.mood = Math.min(100, (G.ps.needs.mood || 50) + 2);
        }
        return null;
      }
      if (k === "amenity_stadium") {
        toast("井槐社区体育场 · 外立面占位（馆内尚未开放）。");
        log("李默看了看社区体育场大门");
        return null;
      }
      if (k === "amenity_desk") {
        toast("护士：挂号在这边。小病换药可以，要拍片子去对面卫生中心。");
        return null;
      }
      if (k === "amenity_wait") {
        toast("坐在候诊椅上翻了翻桌上的健康折页。");
        return null;
      }
      return U0(o);
    };
    AM._intWrapped = true;
  };

  // ---------- phone map / god-mode spawn helpers ----------
  AM.spawnAt = function (key) {
    const m = {
      court: [13.0, 16.8, "N"],
      park: [6.0, 27.2, "N"],
      stadium: [73.0, -24.8, "S"],
      clinic: [31.5, -6.8, "S"],
      clinic_in: null,
    };
    if (key === "clinic_in") {
      if (SP.scenes.amenity_clinic && SP.game && SP.game.switchScene) {
        SP.game.switchScene("amenity_clinic", SP.scenes.amenity_clinic.spawn);
      }
      return;
    }
    const p = m[key]; if (!p) return;
    if (SP.world && SP.world.interior && SP.game && SP.game.switchScene) {
      SP.game.switchScene("street", p);
    } else if (SP.player) {
      SP.player.x = p[0]; SP.player.y = p[1];
      if (p[2] && SP.player.setDir) SP.player.setDir(p[2]);
      if (SP.cam) { SP.cam.ready = false; }
      AM.injectSportStreet();
    }
  };

  AM.listAdded = function () {
    return [
      { id: "court", name: "运动场地（篮球半场+乒乓）", where: "旧区院子东侧", status: "stub" },
      { id: "park", name: "社区小公园（长椅/步道/花坛）", where: "12号楼北侧", status: "stub" },
      { id: "stadium", name: "社区体育场外立面", where: "东沿 / midtown edge", status: "exterior_placeholder" },
      { id: "clinic", name: "社区诊所（可进候诊室）", where: "卫生中心东侧空档", status: "enterable" },
      // express/charge/recycle → amenities_props.js (parallel track)
    ];
  };
  AM.listMissingProposed = function () {
    return [
      { id: "canteen", name: "社区食堂", status: "missing" },
      { id: "kindergarten", name: "幼儿园", status: "missing（CBD 云麓有示意，旧区未建）" },
      { id: "bank", name: "银行网点", status: "missing" },
      { id: "toilet", name: "公厕", status: "missing" },
      { id: "garage", name: "地下车库入口", status: "missing" },
      { id: "property", name: "物业中心", status: "missing（玩法有物业交互，无独立门脸）" },
      { id: "laundry_shop", name: "干洗店/洗衣店", status: "missing" },
      { id: "post", name: "邮政/通讯营业厅", status: "missing" },
      { id: "market", name: "菜市场", status: "owned_by_amenities_market" },
      { id: "smkt", name: "小超市", status: "owned_by_amenities_market" },
      { id: "express", name: "快递驿站", status: "owned_by_amenities_props" },
      { id: "charge", name: "充电桩", status: "owned_by_amenities_props" },
      { id: "recycle", name: "垃圾分类点", status: "owned_by_amenities_props" },
      { id: "pharmacy", name: "药店", status: "owned_by_amenities_props" }
    ];
  };


  // Chain market injectStreet (if it already replaced ours) so both packs land
  AM._chainMarketInject = function () {
    // Always ensure shared injectStreet also runs sport inject (market may overwrite later)
    const prev = AM.injectStreet;
    if (prev && prev._isSportChain) return; // already our wrapper
    AM.injectStreet = function () {
      let r;
      if (typeof prev === "function" && !prev._isSportChain) {
        try { r = prev.apply(AM, arguments); } catch (e) { console.warn("market injectStreet", e); }
      }
      try { AM.injectSportStreet(); } catch (e) { console.warn("sport inject", e); }
      return r;
    };
    AM.injectStreet._isSportChain = true;
  };

  // ---------- install (coexists with amenities_market.js on shared SP.amenities) ----------
  AM.installSport = function () {
    if (AM._sportInstalled) return; AM._sportInstalled = true;
    AM._chainMarketInject();
    AM.loadArt();
    AM.registerClinic();
    AM.wrapInteract();
    AM.wrapDraw();
    let tries = 0;
    const boot = () => {
      tries++;
      if (SP.world && SP.world.data && !SP.world.interior) {
        AM._injected = false; // allow re-try until door lands
        AM.injectSportStreet();
      }
      if (!AM._injected && tries < 60) setTimeout(boot, 200);
    };
    boot();
    if (SP.game && SP.game.switchScene && !SP.game._amenitySportSwitch) {
      const S0 = SP.game.switchScene.bind(SP.game);
      SP.game.switchScene = function (to, spawn, door) {
        const r = S0(to, spawn, door);
        if (to === "street") setTimeout(() => { AM._injected = false; AM.injectSportStreet(); }, 0);
        return r;
      };
      SP.game._amenitySportSwitch = true;
    }
    console.info("[amenities-sport]", AM.VERSION, "POIs", Object.keys(AM.POIS).join(","));
  };

  // Chain onto shared AM.install without wiping market's handler
  const _prevInstall = typeof AM.install === "function" ? AM.install.bind(AM) : null;
  AM.install = function () {
    AM.installSport();
    if (_prevInstall) try { _prevInstall(); } catch (e) { console.warn("amenities prev install", e); }
  };

  // auto: sport setup even if market later resets AM.installed
  const bootSport = () => {
    if (!SP.game) return false;
    AM.installSport();
    return true;
  };
  if (!bootSport()) {
    const iv = setInterval(() => { if (bootSport()) clearInterval(iv); }, 100);
    setTimeout(() => clearInterval(iv), 20000);
  }
  // late pass after market.js (loads after us) may have replaced install
  setTimeout(() => {
    AM._chainMarketInject();
    AM.installSport();
    if (typeof AM.install === "function") {
      // ensure our sportInstall still runs from shared install
      const cur = AM.install.bind(AM);
      if (!AM._sportChained) {
        AM.install = function () { AM.installSport(); try { cur(); } catch (e) {} };
        AM._sportChained = true;
      }
    }
  }, 0);

  // Re-chain for a couple seconds in case market.js loads after us and replaces injectStreet
  let _chainTries = 0;
  const _chainIv = setInterval(() => {
    _chainTries++;
    AM._chainMarketInject();
    AM.injectSportStreet();
    if (_chainTries > 25) clearInterval(_chainIv);
  }, 200);

})(window.SP || (window.SP = {}));
