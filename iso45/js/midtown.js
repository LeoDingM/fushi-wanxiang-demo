/* scene-proto-45 · Midtown-A: east-axis near-downtown strip (景秀苑/云阶公馆/城南一号).
   Registers interiors, ensures chunk streaming, HUD chip. Does not edit Char-A / stageA–S sources. */
(function (SP) {
  "use strict";
  const M = (SP.midtown = {});
  M.AXIS = "east";
  M.BUILDINGS = [
    { key: "jx", name: "景秀苑", floors: 8, door: [110, 4.5], style: "transitional" },
    { key: "yj", name: "云阶公馆", floors: 12, door: [124, 5.2], style: "glass" },
    { key: "cn", name: "城南一号", floors: 16, door: [138.5, 3.8], style: "tower" },
  ];

  M.registerScenes = function () {
    const pack = window.MIDTOWN_SCENES || {};
    SP.scenes = SP.scenes || {};
    let n = 0;
    for (const id of Object.keys(pack)) {
      SP.scenes[id] = pack[id];
      n++;
    }
    M._scenes = n;
    return n;
  };

  M.ensureChunkMeta = function () {
    const W = SP.world;
    if (!W || !W.data) return false;
    W.data.chunks = W.data.chunks || [];
    if (!W.data.chunks.some((c) => c.id === "midtown")) {
      W.data.chunks.push({
        id: "midtown",
        rect: [103.5, -40.0, 148.0, 64.0],
        src: "chunks/midtown.js",
        load_m: 30,
        unload_m: 55,
      });
    }
    if (W.data.bounds && W.data.bounds.x1 < 150) W.data.bounds.x1 = 150;
    return true;
  };

  M.loadChunk = function () {
    M.ensureChunkMeta();
    if (SP.chunks && SP.chunks.loadAll) {
      try { SP.chunks.loadAll(); } catch (e) {}
    }
    const list = (SP.chunks && SP.chunks.list && SP.chunks.list()) || [];
    const c = list.find((x) => x.id === "midtown");
    if (c && SP.chunks.apply) {
      try { SP.chunks.apply(c); } catch (e) {}
    }
    // if script preloaded (index.html) but apply raced, retry once data is present
    if (!(SP.world && SP.world.chunksIn && SP.world.chunksIn.midtown) && window.SCENE_CHUNKS && window.SCENE_CHUNKS.midtown && c && SP.chunks.apply) {
      try { SP.chunks.apply(c); } catch (e) {}
    }
    return !!(SP.world && SP.world.chunksIn && SP.world.chunksIn.midtown);
  };

  M.warpStreet = function (x, y, dir) {
    const G = SP.game;
    if (SP.actions && SP.actions.go) {
      SP.actions.go("street", [x, y, dir || "E"]);
    } else if (G && G.go) {
      G.go({ to: "street", spawn: [x, y, dir || "E"] });
    }
    if (SP.player) {
      SP.player.x = x; SP.player.y = y;
      if (SP.player.setDir) SP.player.setDir(dir || "E");
    }
    M.loadChunk();
  };

  M.enterBuilding = function (key, floor) {
    floor = floor || 1;
    const id = "mt_" + key + "_" + floor + "f";
    if (!SP.scenes[id]) return "missing " + id;
    const sp = SP.scenes[id].spawn || [3.5, 1.0, "N"];
    if (SP.game && SP.game.switchScene) SP.game.switchScene(id, sp);
    else if (SP.actions && SP.actions.go) SP.actions.go(id, sp);
    return id;
  };

  /** Flush fade transition immediately (tests / elev pick). */
  M.flushGo = function () {
    const G = SP.game;
    if (G && G.trans && !G.trans.done) {
      G.switchScene(G.trans.to, G.trans.spawn, G.trans.door);
      G.trans = null;
    }
  };

  M.hud = function () {
    let el = document.getElementById("midtown-hud");
    if (!el) {
      el = document.createElement("div");
      el.id = "midtown-hud";
      el.style.cssText = "position:fixed;left:8px;bottom:48px;z-index:40;background:rgba(20,28,40,.78);color:#d8e8ff;font:12px/1.35 sans-serif;padding:6px 10px;border-radius:8px;pointer-events:none;max-width:240px;";
      document.body.appendChild(el);
    }
    const W = SP.world;
    const onMt = W && W.chunksIn && W.chunksIn.midtown;
    const inside = W && W.interior && W.sceneId && String(W.sceneId).indexOf("mt_") === 0;
    if (!onMt && !inside) { el.style.display = "none"; return; }
    el.style.display = "block";
    let line = "近市中心 · 东向 Midtown";
    if (inside) {
      const s = SP.scenes[W.sceneId];
      line = (s && s.name) || W.sceneId;
    } else if (SP.player) {
      line += " · x≈" + Math.round(SP.player.x);
    }
    el.textContent = line;
  };


  /** Inject featured Midtown-A2 rent rows into game.rules.rent_table (skip estate ids). */
  M.wireRent = function () {
    const cat = window.MIDTOWN_RENT || {};
    M.RENT = cat;
    const rules = SP.game && SP.game.rules;
    const rt = rules && rules.data && rules.data.rent_table;
    if (!rt) { M._rentPending = cat; return false; }
    rt.units = rt.units || {};
    for (const id of Object.keys(cat)) {
      rt.units[id] = Object.assign({}, cat[id]);
    }
    M._rentWired = true;
    return true;
  };

  M.enterUnit = function (key, fl, slot) {
    const id = "room_mt_" + key + "_" + fl + "0" + (slot || 1);
    if (!SP.scenes[id]) return "missing " + id;
    const sp = SP.scenes[id].spawn || [6.2, 0.85, "W"];
    if (SP.game && SP.game.switchScene) SP.game.switchScene(id, sp);
    else if (SP.actions && SP.actions.go) SP.actions.go(id, sp);
    return id;
  };


  M.isMidtownRentId = function (id) {
    return !!id && /^mt-(jx|yj|cn)-/.test(String(id));
  };

  M.doorUnitCount = function () {
    return Object.keys(SP.scenes || {}).filter((k) => k.indexOf("room_mt_") === 0).length;
  };

  M.housingRow = function (id, U, H) {
    const u = U[id], own = H.owned.includes(id), home = H.home === id;
    return `<div class="prow"><b>${u.label || id}</b><span>${u.type || ""} · ¥${u.rent}/月</span>
      <div class="row">${own ? "" : `<button data-rent="${id}">租下</button>`}
      ${own && !home ? `<button data-home="${id}">设为住所</button>` : ""}
      ${own && id !== "2F-02" ? `<button data-leave="${id}">退租</button>` : ""}
      ${home ? "<i>当前</i>" : ""}</div></div>`;
  };

  /** Group midtown featured rows + door count so 72样板 don't flood the list. */
  M.renderHousingGrouped = function () {
    const A = SP.stageA;
    const H = A.ensureHousing(), U = A.units();
    const mt = Object.keys(U).filter(M.isMidtownRentId);
    const other = Object.keys(U).filter((id) => !M.isMidtownRentId(id));
    const doors = M.doorUnitCount();
    const styleHint = "景秀转型 / 云阶玻璃幕 / 城南塔配";
    let html = `<div class="phouse"><p>当前住所：<b>${(U[H.home] && U[H.home].label) || H.home}</b></p>`;
    html += `<div class="mt-rent-block" style="border:1px solid #3a4a62;border-radius:8px;padding:8px;margin:8px 0;background:rgba(30,40,55,.55)">`;
    html += `<p style="margin:0 0 4px"><b>近市中心 Midtown · 精选在租</b></p>`;
    html += `<p class="hint" style="margin:0 0 8px;opacity:.85">三塔共 <b>${doors}</b> 户门可入样板（${styleHint}）；列表只展示 <b>${mt.length}</b> 套精选，避免 72 套刷屏</p>`;
    html += mt.map((id) => M.housingRow(id, U, H)).join("") || `<p class="hint">暂无 Midtown 精选</p>`;
    html += `</div>`;
    html += `<p style="margin:8px 0 4px"><b>其他房源</b></p>`;
    html += other.map((id) => M.housingRow(id, U, H)).join("");
    html += `<button data-gohome>传送回住所</button></div>`;
    return html;
  };

  M.bindHousingButtons = function (el) {
    if (!el || !SP.stageA) return;
    const A = SP.stageA;
    el.querySelectorAll("[data-rent]").forEach((b) => {
      b.onclick = () => { A.rentUnit(b.dataset.rent); A.openPhone("housing"); };
    });
    el.querySelectorAll("[data-home]").forEach((b) => {
      b.onclick = () => { A.setHome(b.dataset.home); A.openPhone("housing"); };
    });
    el.querySelectorAll("[data-leave]").forEach((b) => {
      b.onclick = () => { A.leaveUnit(b.dataset.leave); A.openPhone("housing"); };
    });
    const go = el.querySelector("[data-gohome]");
    if (go) go.onclick = () => A.goHome();
  };

  M.applyHousingGroup = function () {
    const el = document.getElementById("phonepanel") || document.querySelector("#phone .panel, .phone-panel, #phonepanel");
    // stageA phone root varies — find .phouse
    const ph = document.querySelector(".phouse");
    if (!ph) return false;
    const wrap = ph.parentElement;
    ph.outerHTML = M.renderHousingGrouped();
    M.bindHousingButtons(wrap || document.getElementById("phonepanel") || document.body);
    return true;
  };

  M.wrapHousing = function () {
    if (M._wrapHousing || !SP.stageA || !SP.stageA.openPhone) return;
    const A = SP.stageA;
    const _open = A.openPhone.bind(A);
    A.openPhone = function (tab, threadId) {
      const r = _open(tab, threadId);
      if (tab === "housing") {
        try { M.applyHousingGroup(); } catch (e) { console.warn("midtown housing group", e); }
      }
      return r;
    };
    M._wrapHousing = true;
  };

  M.wrapUnits = function () {
    if (M._wrapUnits || !SP.stageA || !SP.stageA.units) return;
    const A = SP.stageA;
    const _units = A.units.bind(A);
    A.units = function () {
      const u = _units();
      const cat = window.MIDTOWN_RENT || M.RENT || {};
      for (const id of Object.keys(cat)) {
        if (!u[id]) u[id] = Object.assign({}, cat[id]);
      }
      return u;
    };
    M._wrapUnits = true;
  };


  /** Parse featured rent id mt-jx-101 → {key, fl, slot, facadeUnit} */
  M.parseRentId = function (id) {
    const m = /^mt-(jx|yj|cn)-(\d+)0([12])$/.exec(String(id || ""));
    if (!m) return null;
    const key = m[1], fl = +m[2], slot = +m[3];
    return { key: key, fl: fl, slot: slot, facadeUnit: "mt_" + key + "_" + fl + "F-0" + slot, scene: "room_mt_" + key + "_" + fl + "0" + slot };
  };

  M.occupiedRentIds = function () {
    const H = SP.stageA && SP.stageA.ensureHousing && SP.stageA.ensureHousing();
    const owned = (H && H.owned) || [];
    return owned.filter(M.isMidtownRentId);
  };

  M.occupiedFacadeSet = function () {
    const set = {};
    M.occupiedRentIds().forEach((id) => {
      const p = M.parseRentId(id);
      if (p) set[p.facadeUnit] = p;
    });
    return set;
  };

  /** Per-style night glow odds when unit occupied (households.windowLit override). */
  M.styleGlow = { transitional: 0.55, glass: 0.9, tower: 0.7 };
  M.styleLaundry = { transitional: true, glass: false, tower: true };

  M.buildingStyle = function (key) {
    const b = (M.BUILDINGS || []).find((x) => x.key === key);
    return (b && b.style) || "transitional";
  };

  M.bayInSlot = function (bay, slot) {
    return slot === 1 ? bay < 2 : bay >= 2;
  };

  M.wrapHouseholds = function () {
    if (M._wrapHH || !SP.households || !SP.households.windowLit) return;
    const H = SP.households;
    const _lit = H.windowLit.bind(H);
    H.windowLit = function (o) {
      const u = H.unitOf(o);
      if (u && String(u).indexOf("mt_") === 0) {
        const occ = M.occupiedFacadeSet();
        if (!occ[u]) return false; // vacant midtown sample → dark at night via household path
        const key = u.split("_")[1];
        const style = M.buildingStyle(key);
        const p = M.styleGlow[style] || 0.6;
        const slot = Math.floor((SP.clock && SP.clock.abs ? SP.clock.abs() : 0) / 120);
        return SP.hash(slot, SP.strHash(o.id || u)) < p;
      }
      return _lit(o);
    };
    M._wrapHH = true;
  };

  /** Tag midtown windows with night_lit; sync balcony laundry from occupied featured units. */
  M.syncFacadeOccupied = function () {
    const W = SP.world;
    if (!W || !W.objects) return false;
    const occ = M.occupiedFacadeSet();
    const street = (!W.interior && W.byId) || (SP.place && SP.place.street && SP.place.street.byId);
    const worlds = [W.objects];
    if (W.interior && SP.place && SP.place.street && SP.place.street.objects) worlds.push(SP.place.street.objects);

    for (const objs of worlds) {
      for (const o of objs) {
        const fg = o.fade_group || "";
        if (fg.indexOf("mt_") !== 0 && String(o.id || "").indexOf("mt_") !== 0) continue;

        if (o.type === "f_window") {
          // ensure household unitOf pattern works; prefer explicit occupancy glow via night_lit fallback
          const u = SP.households && SP.households.unitOf(o);
          const owned = !!(u && occ[u]);
          o.night_lit = owned || !!o.night_lit; // keep style base lit; owned forces eligible
          if (owned) o._mt_occ = true;
          else delete o._mt_occ;
        }

        if (o.type === "f_balcony") {
          // id: mt_jx_S5F_2_balc
          const m = /^mt_(jx|yj|cn)_S(\d+)F_(\d+)_balc$/.exec(o.id || "");
          if (!m) continue;
          const key = m[1], fl = +m[2], bay = +m[3];
          let want = false;
          Object.keys(occ).forEach((uid) => {
            const p = occ[uid];
            if (p.key === key && p.fl === fl && M.bayInSlot(bay, p.slot)) {
              if (M.styleLaundry[M.buildingStyle(key)]) want = true;
            }
          });
          const st = want ? "laundry" : (o.state === "laundry" && o._mt_laundry ? "default" : o.state);
          if (want) {
            o._mt_laundry = true;
            if (o.state !== "laundry") {
              if (W.setState && objs === W.objects && !W.interior) W.setState(o, "laundry");
              else o.state = "laundry";
            }
          } else if (o._mt_laundry) {
            o._mt_laundry = false;
            if (o.state === "laundry") {
              if (W.setState && objs === W.objects && !W.interior) W.setState(o, "default");
              else o.state = "default";
            }
          }
        }
      }
    }
    if (SP.households && SP.households.invalidate) SP.households.invalidate();
    if (SP.layers && SP.layers.invalidate) SP.layers.invalidate();
    return true;
  };

  /** Street door plates: featured rental hint per tower (optional polish). */
  M.labelStreetDoors = function () {
    const cat = window.MIDTOWN_RENT || M.RENT || {};
    const byKey = { jx: [], yj: [], cn: [] };
    Object.keys(cat).forEach((id) => {
      const p = M.parseRentId(id);
      if (p && byKey[p.key]) byKey[p.key].push(cat[id].label || id);
    });
    const W = SP.world;
    const lists = [];
    if (W && W.byId) lists.push(W.byId);
    if (SP.place && SP.place.street && SP.place.street.byId) lists.push(SP.place.street.byId);
    // also chunk objects before byId ready
    if (W && W.objects) {
      for (const o of W.objects) {
        if (o.type === "f_door" && /^mt_(jx|yj|cn)_door$/.test(o.id || "")) {
          const key = o.id.split("_")[1];
          const labels = byKey[key] || [];
          const n = labels.length;
          o.plate = n ? (o.name || key) + " · 精选在租" + n + "套" : (o.name || key);
          o._mt_label = o.plate;
        }
      }
    }
    lists.forEach((byId) => {
      ["jx", "yj", "cn"].forEach((key) => {
        const o = byId["mt_" + key + "_door"];
        if (!o) return;
        const n = (byKey[key] || []).length;
        o.plate = n ? (o.name || key) + " · 精选在租" + n + "套" : (o.name || key);
      });
    });
  };

  M.wrapRentHooks = function () {
    if (M._wrapRent || !SP.stageA) return;
    const A = SP.stageA;
    ["rentUnit", "leaveUnit", "setHome"].forEach((fn) => {
      if (!A[fn] || A[fn]._mt) return;
      const orig = A[fn].bind(A);
      A[fn] = function () {
        const r = orig.apply(A, arguments);
        try { M.syncFacadeOccupied(); M.labelStreetDoors(); } catch (e) {}
        return r;
      };
      A[fn]._mt = true;
    });
    M._wrapRent = true;
  };

  M.install = function () {
    if (M._in) return;
    M._in = true;
    M.registerScenes();
    M.ensureChunkMeta();
    M.wireRent();
    M.wrapUnits();
    M.wrapHousing();
    M.wrapHouseholds();
    M.wrapRentHooks();
    M.labelStreetDoors();
    M.syncFacadeOccupied();
    if (SP.midtownElev && SP.midtownElev.install) SP.midtownElev.install();
    setTimeout(function () {
      M.wireRent(); M.wrapUnits(); M.wrapHousing();
      M.wrapHouseholds(); M.wrapRentHooks();
      M.labelStreetDoors(); M.syncFacadeOccupied();
    }, 400);
    setInterval(function () {
      try { if (!SP.world || SP.world.interior) return; M.syncFacadeOccupied(); } catch (e) {}
    }, 2000);

    // tick HUD
    const _raf = SP.main && SP.main.tick;
    // soft: poll via setInterval so we don't touch main.js
    setInterval(function () { try { M.hud(); } catch (e) {} }, 500);

    // expose debug helpers
    SP.actions = SP.actions || {};
    SP.actions.midtown = function (where) {
      if (where === "seam") return M.warpStreet(104, 2.2, "E");
      if (where === "jx") return M.warpStreet(110, 2.5, "N");
      if (where === "yj") return M.warpStreet(124, 2.5, "N");
      if (where === "cn") return M.warpStreet(138, 2.5, "N");
      return M.warpStreet(108, 2.2, "E");
    };

    if (SP.game) SP.game._midtown = true;
    M.ready = true;
  };

  function boot() {
    if (!window.__protoReady && !(SP.game && SP.world)) {
      setTimeout(boot, 60);
      return;
    }
    M.install();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.SP = window.SP || {});
