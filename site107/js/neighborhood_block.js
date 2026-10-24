/*
 * First civic-service room for the baseline 井槐里 block.
 * Uses the baseline's already loaded 24-hour shop room as a reusable architectural shell and its existing
 * st_* modular interior pieces; it does not change the store scene or any shared/global scene wrappers.
 * The one street hook is the existing `shop24_W1F_2_shop` frontage in scene.json (the west-facing
 * 街坊药房 bay at x=32.5, y=13.5, rot=6). Its outside return position is derived from that scene object,
 * rather than copied from the donor project.
 */
(function (root) {
  "use strict";
  const SP = root.SP;
  if (!SP || !SP.game || !SP.scenes) return;
  const ID = "neighborhood_services";
  const ENTRY = "shop24_W1F_2_shop";
  const SERVICE = "clinic-jinghuaili";
  const source = root.STORE45 && root.STORE45.store_24;
  if (!source) { console.warn("neighborhood_block: store interior shell not loaded"); return; }
  const K = SP.K || root.KIT_MANIFEST;
  if (!K || !K.pieces || !K.frames || !SP.load) { console.warn("neighborhood_block: core kit is not ready"); return; }

  // A tiny purpose-built sprite keeps the ATM visually distinct from the coffee unit it replaces.
  // It is appended to the interior atlas after the existing store-kit composition finishes.
  const ATM_FRAME = "civic_atm/base/main/default/0", ATM_W = 52, ATM_H = 78;
  K.pieces.civic_atm = { layer: "sorted", catcher: "ground", interior: true, origin: "center", states: ["default"], rots: [0],
    footprint: [[-0.33, -0.24, 0.33, 0.24]], fadeable: true,
    geo: { default: { main: [-0.34, -0.26, 0, 0.34, 0.26, 1.6] } }, parts: ["main"], variants: ["base"] };
  function atmSprite() {
    const c = document.createElement("canvas"); c.width = ATM_W; c.height = ATM_H;
    const x = c.getContext("2d"); x.imageSmoothingEnabled = false;
    const poly = (pts, color, edge) => {
      x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath();
      x.fillStyle = color; x.fill(); if (edge) { x.strokeStyle = edge; x.lineWidth = 1; x.stroke(); }
    };
    // contact shadow and raised pedestal
    poly([[4, 69], [24, 76], [49, 65], [29, 59]], "rgba(14,20,26,.38)");
    poly([[13, 59], [27, 64], [27, 71], [13, 66]], "#4e5f68", "#26343c");
    poly([[27, 64], [45, 56], [45, 63], [27, 71]], "#374852", "#26343c");
    // cabinet: two visible isometric planes, cold gray enamel and charcoal edge trim
    poly([[12, 17], [30, 8], [47, 16], [28, 25]], "#d2d8d8", "#26333c");
    poly([[12, 17], [28, 25], [28, 63], [12, 56]], "#aebbc0", "#26333c");
    poly([[28, 25], [47, 16], [47, 55], [28, 63]], "#647680", "#26333c");
    // slim teal bezel and an angled dark display on the user-facing plane
    poly([[14, 21], [27, 27], [27, 30], [14, 24]], "#344651");
    poly([[16, 29], [25, 33], [25, 43], [16, 39]], "#172b39", "#536a77");
    poly([[17, 30], [24, 33], [24, 40], [17, 37]], "#456b79");
    poly([[18, 32], [23, 34], [23, 35], [18, 33]], "#9cc6cc");
    // tactile keypad, card slot and receipt/cash slot in aligned pixel blocks
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
      const a = 16 + col * 2.5, b = 43 + row * 3 + col * 1.05;
      poly([[a, b], [a + 1.55, b + 0.72], [a + 1.55, b + 1.75], [a, b + 1.02]], "#d5d9d5", "#46545b");
    }
    poly([[18, 56], [25, 59], [25, 60.5], [18, 57.5]], "#25343b");
    poly([[18, 61], [26, 64], [26, 65.5], [18, 62.5]], "#26343a");
    poly([[13, 18], [15, 19], [15, 54], [13, 53]], "#e2e5df");
    poly([[29, 26], [31, 25], [31, 60], [29, 61]], "#8fa0a4");
    // small pixel-marked ATM header, readable at normal zoom
    const glyphs = { A: ["111", "101", "111", "101", "101"], T: ["111", "010", "010", "010", "010"], M: ["101", "111", "111", "101", "101"] };
    let ox = 17;
    for (const ch of "ATM") {
      glyphs[ch].forEach((line, r) => [...line].forEach((bit, q) => { if (bit === "1") x.fillStyle = "#eaf3ef", x.fillRect(ox + q * 1.35, 22 + r * 1.25 + q * 0.58, 1, 1); }));
      ox += 4.7;
    }
    return c;
  }
  let atmFrameAdded = false;
  function appendAtmFrame() {
    if (atmFrameAdded || !SP.img || !SP.img.int_atlas) return;
    const A = SP.img.int_atlas, w = A.width || A.naturalWidth, h = A.height || A.naturalHeight;
    if (!w || !h) return;
    const y = h + 2, c = document.createElement("canvas"); c.width = w; c.height = y + ATM_H + 2;
    const ctx = c.getContext("2d"); ctx.imageSmoothingEnabled = false; ctx.drawImage(A, 0, 0); ctx.drawImage(atmSprite(), 0, y);
    SP.img.int_atlas = c;
    K.frames[ATM_FRAME] = [0, y, ATM_W, ATM_H, 26, 74, 1];
    atmFrameAdded = true;
  }
  const load0 = SP.load;
  SP.load = function (list) { return load0.call(SP, list).then(() => { appendAtmFrame(); }); };
  appendAtmFrame();

  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function streetEntry() {
    const objects = (root.SCENE_DATA && root.SCENE_DATA.objects) || (SP.world && SP.world.objects) || [];
    return objects.find((o) => o.id === ENTRY) || null;
  }
  function returnSpawn() {
    const o = streetEntry();
    // rot=6 is the west-facing commercial frontage; step 1.15 m onto its outer sidewalk.
    if (!o) throw new Error(`neighborhood_block: missing baseline street object ${ENTRY}`);
    return [o.x - 1.15, o.y, "W"];
  }
  function makeScene() {
    const scene = clone(source);
    scene.id = ID;
    scene.name = "街坊药房 · 社区服务站";
    scene.store = false;
    scene.spawn = [4.5, 0.95, "N"];
    scene.objects = scene.objects.filter((o) =>
      o.type === "i_wall" || o.type === "i_cut" ||
      (o.type === "st_front13" || o.type === "st_front145" || o.type === "st_frontdoor"));

    // Existing modular furniture makes distinct, readable service points without adding a new texture kit.
    scene.objects.push(
      { id: "svc_waiting_1", type: "f_chair", x: 4.15, y: 2.75, z: 0, rot: 0, state: "default" },
      { id: "svc_waiting_2", type: "f_chair", x: 4.9, y: 2.75, z: 0, rot: 0, state: "default" },
      { id: "svc_clinic_counter", type: "st_counter", x: 6.45, y: 2.45, z: 0, rot: 0, state: "default",
        interact: "service", name: "社区卫生服务台", reach: [6.45, 3.18], serviceKind: "clinic", serviceId: SERVICE,
        serviceLabel: "社区卫生服务中心 · 挂号 / 问诊", serviceData: { registrationFee: 8, consultationFee: 25,
          payee: "井槐里社区卫生服务中心", prescriptions: [{ id: "basic-medicine", label: "常用药" }] } },
      { id: "svc_pharmacy_shelf", type: "st_shelf", x: 2.8, y: 4.0, z: 0, rot: 0, state: "full",
        interact: "service", name: "处方取药柜", reach: [2.8, 3.42], serviceKind: "pharmacy", serviceId: "pharmacy-jinghuaili",
        serviceLabel: "街坊药房 · 凭处方取药", serviceData: { clinicId: SERVICE, medicineFee: 18, payee: "街坊药房" } },
      { id: "svc_parcel_locker", type: "st_locker", x: 1.2, y: 3.7, z: 0, rot: 0, state: "closed",
        interact: "service", name: "快递自提柜", reach: [1.2, 3.05], serviceKind: "mail", serviceId: "parcel-locker-jinghuaili",
        serviceLabel: "社区快递柜 · 取件 / 寄信", serviceData: { payee: "井槐里快递柜", allowMailing: true, postage: 2,
          parcels: [{ id: "health-booklet-01", label: "社区健康手册", pickupFee: 3, itemId: "parcel" }] } },
      { id: "svc_atm", type: "civic_atm", x: 0.65, y: 5.35, z: 0, rot: 0, state: "default",
        interact: "service", name: "银行自助终端", reach: [0.65, 4.72], serviceKind: "atm", serviceId: "atm-jinghuaili",
        serviceLabel: "ATM · 存取款", serviceData: { amount: 100, maxTransaction: 5000 } },
      { id: "svc_notice", type: "i_notice", x: 4.65, y: 5.92, z: 1.25, rot: 0, state: "default" }
    );
    scene.portals = [{ id: "svc_exit_street", rect: [3.95, 0.15, 5.05, 0.5], dir: "S", to: "street",
      spawn: returnSpawn(), label: "出门 · 回到街坊药房外" }];
    delete scene.store_npcs;
    delete scene.staff_spot;
    delete scene.layout_check;
    return scene;
  }

  const scene = makeScene();
  SP.scenes[ID] = scene;
  const G = SP.game, W = SP.world;
  const action0 = G.actionFor, use0 = G.use;
  if (G._neighborhoodBlockInstalled) return;
  const openNow = () => !SP.clock || (SP.clock.min >= 480 && SP.clock.min < 1260);
  G.actionFor = function (o, kind) {
    if (o && o.id === ENTRY && !W.interior) return kind === "use" ? { label: openNow() ? "进街坊药房 · 社区服务站" : "街坊药房已打烊（08:00–21:00）", do: "game" } : null;
    return action0.call(G, o, kind);
  };
  G.use = function (o) {
    if (o && o.id === ENTRY && !W.interior) {
      if (!openNow()) return "街坊药房 08:00–21:00 开放，明天再来吧。";
      G.go({ to: ID, spawn: scene.spawn, door: null });
      return null;
    }
    return use0.call(G, o);
  };
  G._neighborhoodBlockInstalled = true;
  SP.neighborhoodBlock = { id: ID, entryId: ENTRY, scene, returnSpawn };
})(window);
