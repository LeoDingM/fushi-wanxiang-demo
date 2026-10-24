/* Community reading room for the east pocket neighborhood. Uses the baseline modular interior kit. */
(function (root) {
  "use strict";
  const ID = "community_reading_room", ENTRY = "community_reading_door";
  const clone = (v) => JSON.parse(JSON.stringify(v));

  function createScene(source) {
    if (!source) throw new Error("community_room: store_24 shell is not available");
    const s = clone(source);
    s.id = ID;
    s.name = "街坊阅览室";
    s.spawn = [4.5, 0.95, "N"];
    // Keep the room's existing walls, floor and glazed storefront; replace every shop fixture.
    s.objects = (s.objects || []).filter((o) => ["i_wall", "i_cut", "i_side", "i_window", "st_front13", "st_front145", "st_frontdoor"].includes(o.type))
      .map((o) => {
        if (o.type === "i_wall") o.state = "plain"; // warm plaster replaces the shop's blue-white tile finish
        if (o.type === "st_front13") o.type = "community_front13";
        if (o.type === "st_front145") o.type = "community_front145";
        if (o.type === "st_frontdoor") o.type = "community_frontdoor";
        return o;
      });
    s.ground.legend = { T: "g_wood:a", U: "g_wood:b" };
    s.ground.data_south_to_north = ["TUTU", "UTUT", "TUTU"];
    s.objects.push(
      // Small, wooden bookcases from the home-interior kit line the back and east walls.
      { id: "reading_shelf_north_1", type: "f_shelf", x: 1.1, y: 5.45, z: 0, rot: 0, state: "default" },
      { id: "reading_shelf_north_2", type: "f_shelf", x: 2.05, y: 5.45, z: 0, rot: 0, state: "default" },
      { id: "reading_shelf_north_3", type: "f_shelf", x: 3.0, y: 5.45, z: 0, rot: 0, state: "default" },
      { id: "reading_shelf_north_4", type: "f_shelf", x: 4.0, y: 5.45, z: 0, rot: 0, state: "default" },
      { id: "reading_shelf_north_5", type: "f_shelf", x: 5.0, y: 5.45, z: 0, rot: 0, state: "default" },
      { id: "reading_shelf_north_6", type: "f_shelf", x: 6.0, y: 5.45, z: 0, rot: 0, state: "default" },
      { id: "reading_shelf_east_1", type: "f_shelf", x: 7.4, y: 4.55, z: 0, rot: 2, state: "default" },
      { id: "reading_shelf_east_2", type: "f_shelf", x: 7.4, y: 3.55, z: 0, rot: 2, state: "default" },
      { id: "reading_table_1", type: "f_table", x: 3.2, y: 3.0, z: 0, rot: 0 },
      { id: "reading_chair_1", type: "f_chair", x: 2.65, y: 2.55, z: 0, rot: 0 },
      { id: "reading_chair_2", type: "f_chair", x: 3.72, y: 2.55, z: 0, rot: 4 },
      { id: "reading_table_2", type: "f_table", x: 5.35, y: 3.0, z: 0, rot: 0 },
      { id: "reading_chair_3", type: "f_chair", x: 4.8, y: 2.55, z: 0, rot: 0 },
      { id: "reading_chair_4", type: "f_chair", x: 5.88, y: 2.55, z: 0, rot: 4 },
      { id: "reading_desk", type: "f_desk", x: 5.9, y: 1.55, z: 0, rot: 4,
        interact: "community_reading", name: "阅览桌", reach: [5.9, 0.95] },
      { id: "reading_rest_spot", type: "f_chair", x: 1.55, y: 1.65, z: 0, rot: 0,
        interact: "community_rest", name: "靠窗休息椅", reach: [1.55, 1.15] },
      { id: "reading_notice", type: "i_notice", x: 4.0, y: 5.96, z: 1.45, rot: 0,
        interact: "community_notice", name: "阅览室公告", note: "街坊阅览室 · 请轻声交谈 · 书刊阅后放回原处 · 开放 08:00–21:00" },
      { id: "reading_lamp_1", type: "i_pendant", x: 2.5, y: 2.45, z: 0, state: "on" },
      { id: "reading_lamp_2", type: "i_pendant", x: 5.55, y: 2.45, z: 0, state: "on" },
      { id: "reading_lamp_3", type: "i_pendant", x: 4.0, y: 4.4, z: 0, state: "on" },
      { id: "reading_librarian_spot", type: "f_desk", x: 7.0, y: 2.65, z: 0, rot: 4,
        interact: "community_librarian", name: "顾老师", reach: [7.0, 2.0] }
    );
    s.portals = [{ id: "community_reading_exit", rect: [3.95, 0.15, 5.05, 0.5], dir: "S", to: "street",
      spawn: [100.5, 17.9, "N"], label: "出门 · 回到街坊阅览室外" }];
    s.npcs = [];
    delete s.store_npcs; delete s.staff_spot; delete s.layout_check;
    return s;
  }

  const api = { ID, ENTRY, createScene };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (!root.SP) return;
  const SP = root.SP, G = SP.game, W = SP.world, C = SP.clock;
  if (!G || !W || !SP.scenes || SP._communityRoomInstalled) return;
  const source = root.STORE45 && root.STORE45.store_24;
  if (!source) { console.warn("community_room: store_24 shell is not available"); return; }
  SP._communityRoomInstalled = true;
  const K = SP.K || root.KIT_MANIFEST;
  const frontParts = [
    ["st_front13", "community_front13", ["glass"]],
    ["st_front145", "community_front145", ["glass"]],
    ["st_frontdoor", "community_frontdoor", ["glass", "open"]]
  ];
  // Give this storefront its own neutral stone lintel while preserving the kit's glass, mullions and door geometry.
  if (K && K.pieces && K.frames) for (const [from, to] of frontParts) {
    if (K.pieces[from] && !K.pieces[to]) {
      K.pieces[to] = JSON.parse(JSON.stringify(K.pieces[from]));
      delete K.pieces[to].store;
    }
  }
  let frontsReady = false;
  function appendNeutralFronts() {
    if (frontsReady || !K || !K.frames || !SP.img || !SP.img.int_atlas || !root.document) return;
    const A = SP.img.int_atlas, aw = A.width || A.naturalWidth, ah = A.height || A.naturalHeight;
    if (!aw || !ah) return;
    const frames = [];
    for (const [from, to, states] of frontParts) for (const state of states) {
      const key = `${from}/base/main/${state}/0`, f = K.frames[key];
      if (f) {
        const nextKey = `${to}/base/main/${state}/0`;
        if (K.masks && K.masks[key]) K.masks[nextKey] = K.masks[key];
        if (K.snow && K.snow[key]) K.snow[nextKey] = K.snow[key];
        frames.push({ key: nextKey, f });
      }
    }
    if (!frames.length) return;
    const prepared = frames.map(({ key, f }) => {
      const c = root.document.createElement("canvas"); c.width = f[2]; c.height = f[3];
      const x = c.getContext("2d", { willReadFrequently: true }); x.imageSmoothingEnabled = false;
      x.drawImage(A, f[0], f[1], f[2], f[3], 0, 0, f[2], f[3]);
      try {
        // Pixel-level desaturation keeps the glazing and mullions crisp on normal HTTP origins.
        const im = x.getImageData(0, 0, f[2], f[3]);
        for (let i = 0; i < im.data.length; i += 4) {
          const r = im.data[i], g = im.data[i + 1], b = im.data[i + 2];
          if (g - r > 24 && g - b > 25 && g > 70) {
            const l = (r + g + b) / 3;
            im.data[i] = l > 135 ? 196 : 135;
            im.data[i + 1] = l > 135 ? 185 : 125;
            im.data[i + 2] = l > 135 ? 164 : 101;
          }
        }
        x.putImageData(im, 0, 0);
      } catch (err) {
        // file:// images taint canvases in Chromium. Keep boot working and soften the green fascia
        // with a draw-only composite; compositing is permitted on a tainted canvas, readback is not.
        if (!root.location || root.location.protocol !== "file:" || !String(err && err.name).includes("Security")) throw err;
        x.globalCompositeOperation = "source-atop";
        x.fillStyle = "rgba(184, 176, 158, 0.84)";
        x.fillRect(0, 0, f[2], f[3]);
        x.globalCompositeOperation = "source-over";
      }
      return { key, f, c };
    });
    const gap = 2, height = ah + prepared.reduce((n, q) => n + q.f[3] + gap, 0);
    const atlas = root.document.createElement("canvas"); atlas.width = aw; atlas.height = height;
    const ctx = atlas.getContext("2d"); ctx.imageSmoothingEnabled = false; ctx.drawImage(A, 0, 0);
    let y = ah;
    for (const q of prepared) {
      ctx.drawImage(q.c, 0, y);
      // Storefront frames originate in kit_store, which the core maps into the interior atlas (atlas index 1).
      // Preserve the source frame's atlas selector when relocating its pixels; without it the street atlas is sampled.
      K.frames[q.key] = [0, y, q.f[2], q.f[3], q.f[4], q.f[5], q.f[6]];
      y += q.f[3] + gap;
    }
    SP.img.int_atlas = atlas; frontsReady = true;
  }
  if (SP.load) {
    const load0 = SP.load;
    SP.load = function (list) { return load0.call(SP, list).then(() => { appendNeutralFronts(); }); };
  }
  appendNeutralFronts();
  const scene = createScene(source);
  SP.scenes[ID] = scene;

  // Keep timed activities inside the shared rules engine: normal decay, event logging and time skip still apply.
  const D = G.rules.data;
  if (!D.actions.community_rest) D.actions.community_rest = {
    label: "在阅览室歇一会", place: "any", minutes: 30, effects: { energy: 9, mood: 2 },
    text: "在窗边安静坐了一会，精神恢复了一些"
  };
  const action0 = G.actionFor, use0 = G.use, update0 = G.update;
  const openHours = () => C.min >= 480 && C.min < 1260;
  G.actionFor = function (o, kind) {
    if (!W.interior && o && o.id === ENTRY && kind === "use") return { label: openHours() ? "进街坊阅览室" : "阅览室已闭馆（08:00–21:00）", do: "game" };
    if (W.interior && W.sceneId === ID && kind === "use") {
      if (o.interact === "community_reading") return { label: "坐下读书", do: "game" };
      if (o.interact === "community_rest") return { label: "在靠窗椅休息", do: "game" };
      if (o.interact === "community_librarian") return { label: "和顾老师说话", do: "game" };
      if (o.interact === "community_notice") return { label: "看阅览室公告", do: "game" };
    }
    return action0.call(G, o, kind);
  };
  G.use = function (o) {
    if (!W.interior && o && o.id === ENTRY) {
      if (!openHours()) return "阅览室 08:00–21:00 开放，现在已经闭馆";
      G.go({ to: ID, spawn: scene.spawn, door: o.id }); return null;
    }
    if (W.interior && W.sceneId === ID) {
      if (o.interact === "community_reading") {
        if (!openHours()) return "阅览室 08:00–21:00 开放，今天已经闭馆了";
        return G.start("read", o);
      }
      if (o.interact === "community_rest") {
        if (!openHours()) return "阅览室已经闭馆";
        return G.start("community_rest", o);
      }
      if (o.interact === "community_librarian") return openHours() ? "顾老师：书在后面的架子上，靠窗的位置也可以坐坐。" : "顾老师已经下班了，明天 08:00 再来吧。";
      if (o.interact === "community_notice") return o.note;
    }
    return use0.call(G, o);
  };

  // The caretaker is an actual actor sprite and exists only while the room is open.
  let caretaker = null;
  function syncCaretaker() {
    if (!W.interior || W.sceneId !== ID || !openHours()) {
      if (caretaker) SP.actors.list = SP.actors.list.filter((a) => a !== caretaker);
      caretaker = null;
      return;
    }
    if (!caretaker) {
      caretaker = new SP.Actor({ id: "community_librarian", set: "vendor", x: 7.15, y: 3.45,
        radius: 0.22, speed: 0, height: 1.8, name: "顾老师", staff: true });
      caretaker.setDir("W");
      if (SP.ensureActor && !SP.img.actor_vendor) SP.ensureActor("vendor");
      SP.actors.list.push(caretaker);
    }
  }
  G.update = function (dt, gm) { update0.call(G, dt, gm); syncCaretaker(); };
  SP.communityRoom = { id: ID, entryId: ENTRY, scene, caretaker: () => caretaker,
    enter: () => G.switchScene(ID, scene.spawn, null) };
})(typeof window !== "undefined" ? window : globalThis);
