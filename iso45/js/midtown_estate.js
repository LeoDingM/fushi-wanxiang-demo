/* 浮世万象 · scene-proto-45 · Midtown-B estate
   Outdoor courtyard is ON the street chunk (continuous walk-in). Interiors: lobby / club / A-101.
   Ownership: midtown_estate.js, estate45*, chunks/estate.js, layouts/estate_*, room_midtown_*, img/estate/.
   Does NOT touch Midtown-A / amenities_infra / charC / barber. */
(function () {
  "use strict";
  const SP = window.SP || (window.SP = {});
  const ES = (SP.estate = SP.estate || { installed: false });
  const IDS = ["estate_lobby", "estate_club", "room_midtown_a101"];
  const STREET_MARK = "estate_gate_mark";
  // Outdoor courtyard spawn (street world — NOT an interior scene)
  const COURT_SPAWN = [151.8, 4.0, "N"];
  const STREET_SPAWN = [151.8, 1.4, "N"];
  const CHUNK_META = {
    id: "estate",
    name: "云栖里外立面组+庭院",
    rect: [146.0, -40.0, 210.0, 64.0],
    src: "chunks/estate.js",
    load_m: 40,
    unload_m: 65,
  };

  ES.RENT = {
    _doc: "Midtown / 云栖里 — single ~¥1200; 一室一厅精装 higher.",
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
    // legacy void compound no longer registered as playable
    if (SP.scenes.estate_compound) delete SP.scenes.estate_compound;
  }

  function ensureChunkMeta() {
    const scene = window.SCENE || (SP.world && SP.world.data);
    if (!scene) return;
    scene.chunks = scene.chunks || [];
    if (!scene.chunks.some((c) => c.id === "estate")) scene.chunks.push(Object.assign({}, CHUNK_META));
    if (scene.bounds && scene.bounds.x1 < 212) scene.bounds.x1 = 212;
    if (scene.bounds && scene.bounds.y1 < 22) scene.bounds.y1 = 22;
    if (SP.world && SP.world.data) {
      SP.world.data.chunks = scene.chunks;
      if (SP.world.data.bounds) {
        if (SP.world.data.bounds.x1 < 212) SP.world.data.bounds.x1 = 212;
        if (SP.world.data.bounds.y1 < 22) SP.world.data.bounds.y1 = 22;
      }
    }
  }

  /** Pad ground east + courtyard north pocket (grass / sidewalk). */
  function ensureGroundEast() {
    const scene = window.SCENE || (SP.world && SP.world.data);
    const g = scene && scene.ground;
    if (!g || !g.data_south_to_north) return false;
    const ox = g.origin[0], ch = g.chunk || 2, oy = g.origin[1];
    const needX = Math.ceil((212 - ox) / ch);
    const add = needX - g.cols;
    if (add > 0) {
      g.cols = needX;
      g.data_south_to_north = g.data_south_to_north.map((row, j) => {
        const y = oy + j * ch;
        let pad;
        if (y >= -7 && y <= -1) pad = "A".repeat(add);
        else if (y > -1 && y <= 3) pad = "S".repeat(add);
        else pad = "G".repeat(add);
        return row + pad;
      });
    }
    // paint courtyard pocket cells: x 147–158, y 3–16 → sidewalk path + grass + court strip
    const rows = g.data_south_to_north;
    const setCell = (wx, wy, ch2) => {
      const col = Math.floor((wx - ox) / ch);
      const row = Math.floor((wy - oy) / ch);
      if (row < 0 || row >= rows.length || col < 0 || col >= g.cols) return;
      const r = rows[row].split("");
      while (r.length < g.cols) r.push("G");
      r[col] = ch2;
      rows[row] = r.join("");
    };
    for (let x = 148; x <= 157; x += 2) {
      for (let y = 2; y <= 16; y += 2) {
        let c = "G";
        if (x >= 150 && x <= 153 && y <= 15) c = "S"; // path
        if (x >= 154 && y >= 10 && y <= 15) c = "C"; // sports pad
        if (y >= 14 && x >= 148 && x <= 156) c = "K"; // lobby apron
        setCell(x, y, c);
      }
    }
    g.data_south_to_north = rows;
    if (SP.world && SP.world.data) SP.world.data.ground = g;
    if (SP.world && SP.world.bakeGround) SP.world.bakeGround();
    if (SP.layers && SP.layers.reset) SP.layers.reset();
    return true;
  }

  function ensureStreetMark() {
    const scene = window.SCENE || (SP.world && SP.world.data);
    if (!scene || !scene.objects) return;
    if (scene.objects.some((o) => o.id === STREET_MARK)) return;
    scene.objects.push({
      id: STREET_MARK,
      type: "p_notice",
      x: STREET_SPAWN[0],
      y: STREET_SPAWN[1] + 0.2,
      z: 0,
      interact: "notice",
      name: "云栖里",
      note: "云栖里 · 连续庭院（请进门）",
      reach: STREET_SPAWN.slice(0, 2),
      estate: true,
    });
  }

  function loadEstateChunk() {
    ensureChunkMeta();
    if (!(window.SCENE_CHUNKS && window.SCENE_CHUNKS.estate)) {
      if (!document.querySelector('script[src="chunks/estate.js"]')) {
        const s = document.createElement("script");
        s.src = "chunks/estate.js";
        document.head.appendChild(s);
      }
    }
    const tryApply = () => {
      const list = (SP.chunks && SP.chunks.list && SP.chunks.list()) || [];
      let c = list.find((x) => x.id === "estate");
      if (!c) {
        ensureChunkMeta();
        c = ((SP.chunks && SP.chunks.list && SP.chunks.list()) || []).find((x) => x.id === "estate");
      }
      if (c && SP.chunks && SP.chunks.apply) {
        try { SP.chunks.apply(c); } catch (e) {}
      }
      return !!(SP.world && SP.world.chunksIn && SP.world.chunksIn.estate);
    };
    if (tryApply()) return true;
    let n = 0;
    const iv = setInterval(function () {
      n++;
      if (tryApply() || n > 40) clearInterval(iv);
    }, 50);
    return false;
  }

  /** Walk into outdoor courtyard (same street world — no interior load). */
  ES.enterCourtyard = function () {
    ensureChunkMeta();
    ensureGroundEast();
    loadEstateChunk();
    const sp = COURT_SPAWN;
    if (SP.actions && SP.actions.go) SP.actions.go("street", sp);
    else if (SP.game && SP.game.switchScene) SP.game.switchScene("street", sp);
    if (SP.player) {
      SP.player.x = sp[0]; SP.player.y = sp[1];
      if (SP.player.setDir) SP.player.setDir(sp[2] || "N");
    }
    if (SP.toast) SP.toast("云栖里 · 庭院");
  };

  ES.enter = function (opt) {
    opt = opt || {};
    registerScenes();
    const to = opt.to || "estate_lobby";
    if (to === "estate_compound" || to === "courtyard") {
      ES.enterCourtyard();
      return;
    }
    const sc = SP.scenes[to];
    if (!sc) { SP.toast && SP.toast("云栖里场景未加载"); return; }
    const sp = opt.spawn || sc.spawn;
    if (SP.actions && SP.actions.go) SP.actions.go(to, sp);
    else if (SP.game && SP.game.switchScene) SP.game.switchScene(to, sp);
    else if (SP.game && SP.game.go) SP.game.go({ to: to, spawn: sp, door: null });
  };
  ES.enterLobby = function () { ES.enter({ to: "estate_lobby" }); };
  ES.enterClub = function () { ES.enter({ to: "estate_club" }); };
  ES.enterUnit = function () { ES.enter({ to: "room_midtown_a101" }); };
  ES.inEstate = function () {
    const W = SP.world;
    return !!(W && W.interior && IDS.indexOf(W.sceneId) >= 0);
  };
  ES.warpOuter = function (x, y, dir) {
    x = x != null ? x : COURT_SPAWN[0];
    y = y != null ? y : COURT_SPAWN[1];
    dir = dir || "N";
    if (SP.actions && SP.actions.go) SP.actions.go("street", [x, y, dir]);
    else if (SP.game && SP.game.switchScene) SP.game.switchScene("street", [x, y, dir]);
    if (SP.player) {
      SP.player.x = x; SP.player.y = y;
      if (SP.player.setDir) SP.player.setDir(dir);
    }
    ensureGroundEast();
    loadEstateChunk();
  };

  function doorTarget(o) {
    if (!o) return null;
    if (o.interact === "estate_lobby" || o.to === "estate_lobby" || o.id === "es_lobby_door") return "estate_lobby";
    if (o.interact === "estate_club" || o.to === "estate_club" || o.id === "es_club_door" || (o.id && o.id.indexOf("es_yq_club_door") === 0)) return "estate_club";
    return null;
  }

  ES.install = function () {
    if (ES.installed) return;
    ES.installed = true;
    registerScenes();
    const G = SP.game, W = SP.world;
    if (!G || !W) { console.warn("estate: need SP.game + SP.world"); return; }

    SP.places = SP.places || {};
    SP.places.estate_lobby = { enter: function () { ES.enterLobby(); } };
    SP.places.estate_club = { enter: function () { ES.enterClub(); } };
    SP.places.room_midtown_a101 = { enter: function () { ES.enterUnit(); } };
    SP.places.estate_compound = { enter: function () { ES.enterCourtyard(); } };
    SP.places.estate_courtyard = { enter: function () { ES.enterCourtyard(); } };

    ensureChunkMeta();
    ensureGroundEast();
    ensureStreetMark();
    loadEstateChunk();

    if (G.switchScene) {
      const prev = G.switchScene.bind(G);
      G.switchScene = function (to, spawn, door) {
        const r = prev(to, spawn, door);
        if (to === "street" || (!W.interior && W.sceneId === "street")) {
          ensureChunkMeta(); ensureGroundEast(); ensureStreetMark(); loadEstateChunk();
        }
        return r;
      };
    }

    const A0 = G.actionFor, U0 = G.use;
    G.actionFor = function (o, kind) {
      const tgt = doorTarget(o);
      if (tgt && !W.interior) {
        const label = tgt === "estate_club" ? "进 会所" : "进 大堂";
        return kind === "use" ? { label: label, do: "game" } : undefined;
      }
      // gate notice: suggest walk in (no scene load)
      if (o && (o.id === "es_yunqi_gate" || o.id === STREET_MARK) && !W.interior)
        return kind === "use" ? { label: "进 庭院", do: "game" } : undefined;
      return A0.call(G, o, kind);
    };
    G.use = function (o) {
      const tgt = doorTarget(o);
      if (tgt && !W.interior) {
        ES.enter({ to: tgt });
        return null;
      }
      if (o && (o.id === "es_yunqi_gate" || o.id === STREET_MARK) && !W.interior) {
        ES.enterCourtyard();
        return null;
      }
      return U0.call(G, o);
    };

    if (SP.env && SP.env.ambient) {
      const prevAmb = SP.env.ambient.bind(SP.env);
      SP.env.ambient = function () {
        const a = prevAmb();
        if (!ES.inEstate()) return a;
        // bright modern interiors
        const id = W.sceneId;
        const boost = id === "estate_lobby" ? 0.10 : 0.06;
        return {
          r: Math.min(1, a.r * 1.14 + boost),
          g: Math.min(1, a.g * 1.14 + boost),
          b: Math.min(1, a.b * 1.12 + boost * 0.8),
        };
      };
    }

    try {
      const R = G.rules && G.rules.data;
      if (R && R.rent_table && R.rent_table.units && !R.rent_table.units["A101-yunqi"]) {
        R.rent_table.units["A101-yunqi"] = {
          district: "inner", rent: ES.RENT.unit_a101_1ldk, type: "一室一厅精装 ~48㎡",
          scene: "room_midtown_a101", door: "estate_lobby", label: "云栖里 A-101", stair: "street",
        };
      }
    } catch (e) {}

    console.info("[Midtown-B] estate installed · outdoor courtyard +", IDS.join(", "));
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
