/* 浮世万象 · scene-proto-45 · Midtown-B estate (compound + unit + outer facade variety).
   Ownership: js/midtown_estate.js, estate45*, tools/layouts/estate_*, room_midtown_*,
   chunks/estate.js, img/estate/. Does NOT touch Midtown-A / barber / charB / store / stages. */
(function () {
  "use strict";
  const SP = window.SP || (window.SP = {});
  const ES = (SP.estate = SP.estate || { installed: false });
  const IDS = ["estate_compound", "estate_lobby", "room_midtown_a101"];
  const STREET_MARK = "estate_gate_mark";
  const STREET_SPAWN = [152.1, 1.5, "N"]; // seam 云栖里 outer block (east of Midtown-A)
  const CHUNK_META = {
    id: "estate",
    name: "云栖里外立面组",
    rect: [147.0, -40.0, 210.0, 64.0],
    src: "chunks/estate.js",
    load_m: 36,
    unload_m: 60,
  };

  ES.RENT = {
    _doc: "Midtown / 云栖里 — closer-to-center single ~¥1200; 一室一厅精装 higher.",
    single_closer_center: 1200,
    unit_a101_1ldk: 1980,
    lobby_fee_note: "物业费另计演示 ¥2.2/㎡",
  };

  ES.scenes = function () { return window.ESTATE45 || {}; };

  ES.variety = function () {
    const s = ES.scenes();
    return (s._street && s._street.variety) || null;
  };

  function registerScenes() {
    const data = ES.scenes();
    for (const id of IDS) if (data[id]) SP.scenes[id] = data[id];
  }

  function ensureChunkMeta() {
    const scene = window.SCENE || (SP.world && SP.world.data);
    if (!scene) return;
    scene.chunks = scene.chunks || [];
    if (!scene.chunks.some((c) => c.id === "estate")) scene.chunks.push(Object.assign({}, CHUNK_META));
    if (scene.bounds && scene.bounds.x1 < 212) scene.bounds.x1 = 212;
    if (SP.world && SP.world.data) {
      SP.world.data.chunks = scene.chunks;
      if (SP.world.data.bounds && SP.world.data.bounds.x1 < 212) SP.world.data.bounds.x1 = 212;
    }
  }

  function ensureStreetMark() {
    const scene = window.SCENE || (SP.world && SP.world.data);
    if (!scene || !scene.objects) return;
    if (scene.objects.some((o) => o.id === STREET_MARK)) return;
    scene.objects.push({
      id: STREET_MARK,
      type: "p_notice",
      x: STREET_SPAWN[0],
      y: STREET_SPAWN[1] + 0.4,
      z: 0,
      rot: 0,
      interact: "estate_gate",
      name: "云栖里",
      note: "云栖里 · 门禁小区外立面组（Midtown-B）",
      reach: [STREET_SPAWN[0], STREET_SPAWN[1]],
      estate: true,
    });
  }

  function loadEstateChunk() {
    ensureChunkMeta();
    // chunks/estate.js is also tagged in index.html; fall back to dynamic inject
    if (!(window.SCENE_CHUNKS && window.SCENE_CHUNKS.estate)) {
      if (!document.querySelector('script[src="chunks/estate.js"]')) {
        const s = document.createElement("script"); s.src = "chunks/estate.js"; document.head.appendChild(s);
      }
    }
    const tryApply = () => {
      const list = (SP.chunks && SP.chunks.list && SP.chunks.list()) || [];
      let c = list.find((x) => x.id === "estate");
      if (!c) { ensureChunkMeta(); c = ((SP.chunks && SP.chunks.list && SP.chunks.list()) || []).find((x) => x.id === "estate"); }
      if (c && SP.chunks && SP.chunks.apply) {
        try { SP.chunks.apply(c); } catch (e) {}
      }
      return !!(SP.world && SP.world.chunksIn && SP.world.chunksIn.estate);
    };
    if (tryApply()) return true;
    // wait briefly for script parse
    let n = 0;
    const iv = setInterval(function () {
      n++;
      if (tryApply() || n > 40) clearInterval(iv);
    }, 50);
    return false;
  }

  ES.enter = function (opt) {
    opt = opt || {};
    registerScenes();
    const to = opt.to || "estate_compound";
    const sc = SP.scenes[to];
    if (!sc) { SP.toast && SP.toast("云栖里场景未加载"); return; }
    const sp = opt.spawn || sc.spawn;
    if (SP.actions && SP.actions.go) SP.actions.go(to, sp);
    else if (SP.game && SP.game.switchScene) SP.game.switchScene(to, sp);
    else if (SP.game && SP.game.go) SP.game.go({ to: to, spawn: sp, door: null });
  };
  ES.enterLobby = function () { ES.enter({ to: "estate_lobby" }); };
  ES.enterUnit = function () { ES.enter({ to: "room_midtown_a101" }); };
  ES.inEstate = function () {
    const W = SP.world;
    return !!(W && W.interior && IDS.indexOf(W.sceneId) >= 0);
  };
  ES.warpOuter = function (x, y, dir) {
    x = x != null ? x : 170; y = y != null ? y : 2.5; dir = dir || "N";
    if (SP.actions && SP.actions.go) SP.actions.go("street", [x, y, dir]);
    else if (SP.game && SP.game.switchScene) SP.game.switchScene("street", [x, y, dir]);
    if (SP.player) { SP.player.x = x; SP.player.y = y; if (SP.player.setDir) SP.player.setDir(dir); }
    loadEstateChunk();
  };

  function isEstateGate(o) {
    return o && (o.id === STREET_MARK || o.interact === "estate_gate" || (o.estate && o.interact === "estate_gate"));
  }

  ES.install = function () {
    if (ES.installed) return;
    ES.installed = true;
    registerScenes();
    const G = SP.game, W = SP.world;
    if (!G || !W) { console.warn("estate: need SP.game + SP.world"); return; }

    SP.places = SP.places || {};
    SP.places.estate_compound = { enter: function () { ES.enter({ to: "estate_compound" }); } };
    SP.places.estate_lobby = { enter: function () { ES.enter({ to: "estate_lobby" }); } };
    SP.places.room_midtown_a101 = { enter: function () { ES.enter({ to: "room_midtown_a101" }); } };

    ensureChunkMeta();
    ensureStreetMark();
    loadEstateChunk();

    if (G.switchScene) {
      const prev = G.switchScene.bind(G);
      G.switchScene = function (to, spawn, door) {
        const r = prev(to, spawn, door);
        if (to === "street" || (!W.interior && W.sceneId === "street")) {
          ensureChunkMeta(); ensureStreetMark(); loadEstateChunk();
        }
        return r;
      };
    }

    const A0 = G.actionFor, U0 = G.use;
    G.actionFor = function (o, kind) {
      if (isEstateGate(o) && !W.interior)
        return kind === "use" ? { label: "进 云栖里", do: "game" } : undefined;
      return A0.call(G, o, kind);
    };
    G.use = function (o) {
      if (isEstateGate(o) && !W.interior) {
        ES.enter({ to: "estate_compound", spawn: SP.scenes.estate_compound && SP.scenes.estate_compound.spawn });
        return null;
      }
      return U0.call(G, o);
    };

    if (SP.env && SP.env.ambient) {
      const prevAmb = SP.env.ambient.bind(SP.env);
      SP.env.ambient = function () {
        const a = prevAmb();
        if (!ES.inEstate()) return a;
        const id = W.sceneId;
        if (id === "room_midtown_a101" || id === "estate_lobby") {
          return { r: Math.min(1, a.r * 1.08 + 0.04), g: Math.min(1, a.g * 1.08 + 0.04), b: Math.min(1, a.b * 1.06 + 0.03) };
        }
        return a;
      };
    }

    try {
      const R = G.rules && G.rules.data;
      if (R && R.rent_table && R.rent_table.units && !R.rent_table.units["A101-yunqi"]) {
        R.rent_table.units["A101-yunqi"] = {
          district: "inner", rent: ES.RENT.unit_a101_1ldk, type: "一室一厅精装 ~48㎡",
          scene: "room_midtown_a101", door: "estate_lobby", label: "云栖里 A-101", stair: "estate_compound",
        };
      }
    } catch (e) {}

    const v = ES.variety();
    console.info("[Midtown-B] estate installed · facades", v && v.buildings ? v.buildings.map((b) => b.key).join(",") : "n/a");
  };

  if (SP.game && SP.world) ES.install();
  else document.addEventListener("DOMContentLoaded", function () {
    const t0 = Date.now();
    const iv = setInterval(function () {
      if (SP.game && SP.world) { clearInterval(iv); ES.install(); }
      else if (Date.now() - t0 > 15000) clearInterval(iv);
    }, 50);
  });
})();
