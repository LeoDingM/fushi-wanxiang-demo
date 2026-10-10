/* scene-proto-45 · Stage Char-C: gendered hair variety + female street visibility.
   Additive — does not rewrite appearance schema or civic atlas paths. */
(function (SP) {
  "use strict";
  const C = (SP.charC = SP.charC || {});
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 2600);
  const AP = () => SP.appearance;

  // ---------- 1) Hair catalogs (Chinese urban street looks) ----------
  // Male-leaning
  C.HAIR_M = [
    { id: "m_buzz", label: "寸头", sex: "m", shape: "buzz", tint: [35, 32, 36] },
    { id: "m_short", label: "短碎发", sex: "m", shape: "short", tint: [28, 26, 30] },
    { id: "m_sidepart", label: "偏分", sex: "m", shape: "side", tint: [32, 28, 34] },
    { id: "m_bowl", label: "锅盖头", sex: "m", shape: "bowl", tint: [40, 36, 42] },
    { id: "m_undercut", label: "侧铲", sex: "m", shape: "undercut", tint: [25, 22, 28] },
    { id: "m_crew", label: "平头", sex: "m", shape: "crew", tint: [45, 42, 48] },
    { id: "m_spiky", label: "刺头", sex: "m", shape: "spiky", tint: [30, 28, 32] },
    { id: "m_mid", label: "中分短发", sex: "m", shape: "mid", tint: [34, 30, 36] },
    { id: "m_brown", label: "短棕发", sex: "m", shape: "short", tint: [95, 65, 42] },
    { id: "m_grey", label: "花白短发", sex: "m", shape: "short", tint: [150, 148, 152] },
    { id: "m_bald", label: "光头", sex: "m", shape: "bald", tint: [210, 180, 150] }
  ];
  // Female-leaning
  C.HAIR_F = [
    { id: "f_bob", label: "波波头", sex: "f", shape: "bob", tint: [35, 30, 40] },
    { id: "f_long", label: "长直发", sex: "f", shape: "long", tint: [28, 24, 32] },
    { id: "f_wave", label: "齐肩波浪", sex: "f", shape: "wave", tint: [50, 38, 45] },
    { id: "f_pony", label: "马尾", sex: "f", shape: "pony", tint: [40, 32, 38] },
    { id: "f_bun", label: "丸子头", sex: "f", shape: "bun", tint: [32, 28, 36] },
    { id: "f_twin", label: "双马尾", sex: "f", shape: "twin", tint: [45, 35, 42] },
    { id: "f_lob", label: "锁骨发", sex: "f", shape: "lob", tint: [38, 32, 40] },
    { id: "f_hime", label: "姬发式", sex: "f", shape: "hime", tint: [30, 26, 34] },
    { id: "f_air", label: "空气刘海短发", sex: "f", shape: "air", tint: [42, 36, 44] },
    { id: "f_brown_long", label: "棕长发", sex: "f", shape: "long", tint: [100, 70, 48] },
    { id: "f_grey_bob", label: "灰白波波", sex: "f", shape: "bob", tint: [155, 152, 158] }
  ];
  // Legacy Char-B ids → map onto new catalog (compat)
  C.LEGACY = {
    short_black: "m_short", short_brown: "m_brown", bob: "f_bob",
    ponytail: "f_pony", bald: "m_bald", grey: "m_grey"
  };

  C.ALL = C.HAIR_M.concat(C.HAIR_F);
  C.byId = {};
  C.ALL.forEach((h) => { C.byId[h.id] = h; });
  Object.keys(C.LEGACY).forEach((k) => {
    if (!C.byId[k] && C.byId[C.LEGACY[k]]) {
      const src = C.byId[C.LEGACY[k]];
      C.byId[k] = Object.assign({}, src, { id: k, label: src.label + "（旧）" });
    }
  });

  C.normalize = function (id) {
    if (!id) return "m_short";
    if (C.byId[id]) return id;
    return C.LEGACY[id] || "m_short";
  };

  C.spec = function (id) {
    return C.byId[C.normalize(id)] || C.byId.m_short;
  };

  C.pickHair = function (rng, gender, ageBand) {
    let pool = gender === "female" ? C.HAIR_F.slice() : C.HAIR_M.slice();
    if (ageBand === "elder") {
      pool = gender === "female"
        ? C.HAIR_F.filter((h) => /grey|bun|bob|lob|wave/.test(h.id) || h.id === "f_bun")
        : C.HAIR_M.filter((h) => /grey|bald|short|crew|buzz/.test(h.id));
      if (!pool.length) pool = gender === "female" ? C.HAIR_F : C.HAIR_M;
    }
    if (ageBand === "child") {
      pool = gender === "female"
        ? C.HAIR_F.filter((h) => /bob|twin|pony|air|lob/.test(h.id))
        : C.HAIR_M.filter((h) => /bowl|buzz|short|crew/.test(h.id));
      if (!pool.length) pool = gender === "female" ? C.HAIR_F : C.HAIR_M;
    }
    const r = typeof rng === "function" ? rng() : Math.random();
    return pool[Math.floor(r * pool.length) % pool.length].id;
  };


  // ---------- Outfit catalog (trendy urban, colorful) ----------
  C.OUTFITS_M = [
    { id: "fit_hoodie", label: "连帽卫衣", set: "fit_hoodie" },
    { id: "fit_oversized", label: "oversized 黄 Tee", set: "fit_oversized" },
    { id: "fit_athletic", label: "运动套装", set: "fit_athletic" },
    { id: "fit_tee_red", label: "红色短袖", set: "fit_tee_red" },
    { id: "fit_shirt", label: "白衬衫", set: "fit_shirt" },
    { id: "fit_knit", label: "针织毛衣", set: "fit_knit" },
    { id: "fit_jacket", label: "夹克外套", set: "fit_jacket" },
    { id: "fit_jeans", label: "牛仔裤休闲", set: "fit_jeans" },
    { id: "fit_cargo", label: "工装裤", set: "fit_cargo" },
    { id: "fit_work", label: "轻商务", set: "fit_work" },
    { id: "student_long", label: "长袖校服风", set: "student_long" },
    { id: "office_short", label: "短袖办公", set: "office_short" }
  ];
  C.OUTFITS_F = [
    { id: "fit_dress", label: "连衣裙", set: "fit_dress" },
    { id: "fit_skirt_teal", label: "青绿裙装", set: "fit_skirt_teal" },
    { id: "student_skirt", label: "百褶裙", set: "student_skirt" },
    { id: "fit_hoodie", label: "连帽卫衣", set: "fit_hoodie" },
    { id: "fit_oversized", label: "oversized Tee", set: "fit_oversized" },
    { id: "fit_athletic", label: "运动装", set: "fit_athletic" },
    { id: "fit_knit", label: "针织衫", set: "fit_knit" },
    { id: "fit_jeans", label: "牛仔裤", set: "fit_jeans" },
    { id: "fit_shirt", label: "衬衫", set: "fit_shirt" },
    { id: "fit_jacket", label: "短外套", set: "fit_jacket" },
    { id: "office_short", label: "夏日办公", set: "office_short" },
    { id: "fit_tee_red", label: "红色短袖", set: "fit_tee_red" }
  ];

  C.pickOutfit = function (rng, gender, job, ageBand) {
    if (job === "police" || job === "firefighter" || job === "nurse") return null; // civic untouched
    let pool = gender === "female" ? C.OUTFITS_F : C.OUTFITS_M;
    if (ageBand === "child") {
      return "child_cue";
    }
    if (ageBand === "elder") {
      pool = gender === "female"
        ? C.OUTFITS_F.filter((o) => /knit|shirt|jacket|skirt|work/.test(o.id))
        : C.OUTFITS_M.filter((o) => /knit|shirt|jacket|work|jeans/.test(o.id));
      if (!pool.length) pool = gender === "female" ? C.OUTFITS_F : C.OUTFITS_M;
    }
    const r = typeof rng === "function" ? rng() : Math.random();
    return pool[Math.floor(r * pool.length) % pool.length].set;
  };

  C.patchOutfitResolve = function () {
    const A = AP();
    if (!A || A._charCOutfit) return;
    // register in JOB_ATLAS so resolveAtlas finds them
    const all = C.OUTFITS_M.concat(C.OUTFITS_F);
    all.forEach((o) => { A.JOB_ATLAS[o.set] = o.set; });
    const prevLayer = A.layerAtlas.bind(A);
    A.layerAtlas = function (ap) {
      if (ap && ap.outfitSet && window.ACTORS && window.ACTORS[ap.outfitSet]) return ap.outfitSet;
      return prevLayer(ap);
    };
    // wardrobe: add street looks (keep li_mo casual/uniform/winter)
    const street = (gender) => (gender === "female" ? C.OUTFITS_F : C.OUTFITS_M).slice(0, 8).map((o) => ({
      id: "street_" + o.id,
      label: "街头 · " + o.label,
      set: o.set
    }));
    // extend PLAYER_LOOKS once
    if (!A.PLAYER_LOOKS.some((l) => String(l.id).indexOf("street_") === 0)) {
      A.PLAYER_LOOKS = A.PLAYER_LOOKS.concat([
        { id: "street_hoodie", label: "街头 · 连帽卫衣", set: "fit_hoodie" },
        { id: "street_oversized", label: "街头 · oversized 黄 Tee", set: "fit_oversized" },
        { id: "street_athletic", label: "街头 · 运动套装", set: "fit_athletic" },
        { id: "street_knit", label: "街头 · 针织毛衣", set: "fit_knit" },
        { id: "street_jacket", label: "街头 · 夹克", set: "fit_jacket" },
        { id: "street_jeans", label: "街头 · 牛仔裤", set: "fit_jeans" },
        { id: "street_dress", label: "街头 · 连衣裙", set: "fit_dress" },
        { id: "street_skirt", label: "街头 · 青绿裙", set: "fit_skirt_teal" },
        { id: "street_cargo", label: "街头 · 工装", set: "fit_cargo" },
        { id: "street_tee_red", label: "街头 · 红 Tee", set: "fit_tee_red" }
      ]);
    }
    A._charCOutfit = true;
  };

  // ---------- 2) Patch appearance.randomNpc: female weight + gendered hair + clothing ----------
  C.FEMALE_WEIGHT = 0.48; // ~48% when gender not forced

  C.patchRandomNpc = function () {
    const A = AP();
    if (!A || A._charCRandom) return;
    const prev = A.randomNpc.bind(A);
    A.randomNpc = function (seed, jobHints) {
      const hints = typeof jobHints === "string" ? { job: jobHints } : Object.assign({}, jobHints || {});
      // force gender distribution for street variety (civic jobs keep caller hints)
      const civic = ["police", "firefighter", "nurse"].indexOf(hints.job) >= 0;
      if (!hints.gender && !civic) {
        const s = (typeof seed === "number" ? seed : String(seed || "x").split("").reduce((a, c) => a + c.charCodeAt(0), 0)) >>> 0;
        // deterministic from seed
        const u = ((s * 2654435761) >>> 0) / 4294967296;
        hints.gender = u < C.FEMALE_WEIGHT ? "female" : "male";
      }
      if (!hints.hairId && !civic) {
        const s2 = ((typeof seed === "number" ? seed : 7) * 1597334677) >>> 0;
        const rng = () => { /* one-shot */ return ((s2 % 1000) / 1000); };
        // better rng from seed
        let t = s2 || 1;
        const rnd = () => { t = (Math.imul(t ^ (t >>> 15), t | 1)); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        hints.hairId = C.pickHair(rnd, hints.gender || "male", hints.ageBand);
      }
      const ap = prev(seed, hints);
      // gender → colorful trendy outfit (civic jobs skipped upstream)
      if (ap.job !== "police" && ap.job !== "firefighter" && ap.job !== "nurse") {
        let tseed = (typeof seed === "number" ? seed : 11) * 2246822519 >>> 0;
        const rnd2 = () => { tseed = Math.imul(tseed ^ (tseed >>> 13), 1274126177); return ((tseed >>> 0) / 4294967296); };
        const picked = C.pickOutfit(rnd2, ap.gender, ap.job, ap.ageBand);
        if (picked) ap.outfitSet = picked;
        ap.layers = ap.layers || {};
        if (ap.gender === "female" && /skirt|dress/.test(ap.outfitSet || "")) ap.layers.bottom = "skirt";
        if (/hoodie|jacket|knit/.test(ap.outfitSet || "")) ap.layers.outer = /jacket/.test(ap.outfitSet) ? "thin_jacket" : "none";
        if (/tee|oversized|athletic|short/.test(ap.outfitSet || "")) ap.layers.top = "tee_short";
        if (/long|knit|hoodie/.test(ap.outfitSet || "")) ap.layers.top = "tee_long";
      }
      if (!ap.hairId) ap.hairId = C.pickHair(() => Math.random(), ap.gender, ap.ageBand);
      else ap.hairId = C.normalize(ap.hairId);
      return ap;
    };
    // extend HAIR_IDS list for schema consumers
    A.HAIR_IDS = C.ALL.map((h) => h.id);
    A.HAIR_M = C.HAIR_M.map((h) => h.id);
    A.HAIR_F = C.HAIR_F.map((h) => h.id);
    A._charCRandom = true;
  };

  // ---------- 3) Female-heavy street extras (replace Char-A list + add more) ----------
  C.EXTRA_SPECS = [
    { id: "extra_kid", seed: 901, hints: { ageBand: "child", job: "student", gender: "female", hairId: "f_twin" }, outfitSet: "child_cue", x: -8.5, y: 4.2, dir: "E" },
    { id: "extra_dress", seed: 902, hints: { ageBand: "adult", job: "office", gender: "female", hairId: "f_lob" }, outfitSet: "fit_dress", x: 14.5, y: 3.4, dir: "W" },
    { id: "extra_teen", seed: 903, hints: { ageBand: "teen", job: "student", gender: "female", hairId: "f_pony" }, outfitSet: "fit_skirt_teal", x: 6.5, y: 8.5, dir: "S" },
    { id: "extra_elder", seed: 904, hints: { ageBand: "elder", job: "uncle", gender: "male", hairId: "m_grey" }, outfitSet: "fit_knit", x: -15.0, y: 3.8, dir: "E" },
    { id: "extra_auntie", seed: 905, hints: { ageBand: "adult", job: "vendor", gender: "female", hairId: "f_bun" }, outfitSet: "fit_knit", x: -2.0, y: 3.5, dir: "E" },
    { id: "extra_wave", seed: 906, hints: { ageBand: "adult", job: "office", gender: "female", hairId: "f_wave" }, outfitSet: "fit_jacket", x: 22.0, y: 3.6, dir: "W" },
    { id: "extra_longf", seed: 907, hints: { ageBand: "teen", job: "student", gender: "female", hairId: "f_long" }, outfitSet: "fit_hoodie", x: 10.0, y: 5.2, dir: "S" },
    { id: "extra_bobf", seed: 908, hints: { ageBand: "adult", job: "civilian", gender: "female", hairId: "f_bob" }, outfitSet: "fit_oversized", x: -18.0, y: 4.0, dir: "E" },
    { id: "extra_guy1", seed: 910, hints: { ageBand: "adult", job: "office", gender: "male", hairId: "m_sidepart" }, outfitSet: "fit_shirt", x: 4.0, y: 3.2, dir: "E" },
    { id: "extra_guy2", seed: 911, hints: { ageBand: "teen", job: "student", gender: "male", hairId: "m_undercut" }, outfitSet: "fit_tee_red", x: -6.0, y: 5.0, dir: "W" },
    { id: "extra_buzz", seed: 912, hints: { ageBand: "adult", job: "office", gender: "male", hairId: "m_buzz" }, outfitSet: "fit_cargo", x: 16.0, y: 8.0, dir: "S" },
    { id: "extra_ath", seed: 913, hints: { ageBand: "adult", job: "civilian", gender: "male", hairId: "m_spiky" }, outfitSet: "fit_athletic", x: 25.0, y: 4.0, dir: "W" }
  ];

  C.LAYER_EXTRAS = [
    { id: "layerx_skirt", seed: 1201, hints: { job: "student", gender: "female", ageBand: "teen", hairId: "f_pony" }, outfitSet: "student_skirt", x: 8.5, y: 3.6, dir: "W" },
    { id: "layerx_dress", seed: 1211, hints: { job: "civilian", gender: "female", ageBand: "adult", hairId: "f_wave" }, outfitSet: "fit_dress", x: 11.5, y: 4.4, dir: "E" },
    { id: "layerx_office_f", seed: 1212, hints: { job: "office", gender: "female", ageBand: "adult", hairId: "f_lob" }, outfitSet: "fit_skirt_teal", x: 20.5, y: 3.0, dir: "W" },
    { id: "layerx_long", seed: 1202, hints: { job: "student", gender: "male", ageBand: "teen", hairId: "m_mid" }, outfitSet: "fit_hoodie", x: -4.5, y: 4.0, dir: "E" },
    { id: "layerx_jeans", seed: 1203, hints: { job: "office", gender: "male", ageBand: "adult", hairId: "m_sidepart" }, outfitSet: "fit_jeans", x: 18.0, y: 3.2, dir: "W" },
    { id: "layerx_child", seed: 1204, hints: { job: "student", gender: "female", ageBand: "child", hairId: "f_bob" }, outfitSet: "child_cue", x: -12.0, y: 3.8, dir: "E" }
  ];

  C.spawnStreetCrowd = function () {
    if (!SP.Actor || !SP.actors || !AP()) return;
    if (!SP.world || SP.world.interior) return;
    // already populated this street visit?
    if (SP.actors.list.some((a) => a && (a.extraNpc || a.layerExtra)) && !C._forceRespawn) return;
    C._forceRespawn = false;
    // purge prior char extras / layerx
    SP.actors.list = SP.actors.list.filter((a) => !(a && (a.extraNpc || a.layerExtra)));
    const spawnOne = (s, layerExtra) => {
      if (SP.actors.list.some((a) => a.id === s.id)) return;
      const ap = AP().randomNpc(s.seed, s.hints);
      if (s.outfitSet) ap.outfitSet = s.outfitSet;
      if (s.hints && s.hints.hairId) ap.hairId = s.hints.hairId;
      const set = AP().resolveAtlas(ap);
      if (!window.ACTORS || !window.ACTORS[set]) return;
      const h = s.hints && s.hints.ageBand === "child" ? 1.15 : 1.65;
      const a = new SP.Actor({ id: s.id, set, x: s.x, y: s.y, radius: 0.18, speed: 0, height: h });
      a.setDir(s.dir);
      if (layerExtra) a.layerExtra = true; else a.extraNpc = true;
      AP().applyToActor(a, ap);
      a.hairId = ap.hairId;
      a.hairTint = C.spec(ap.hairId).tint;
      a.hairShape = C.spec(ap.hairId).shape;
      SP.actors.list.push(a);
    };
    C.EXTRA_SPECS.forEach((s) => spawnOne(s, false));
    C.LAYER_EXTRAS.forEach((s) => spawnOne(s, true));
  };

  C.scheduleCrowd = function () {
    if (C._spawnTimer) return;
    C._spawnTimer = setTimeout(() => {
      C._spawnTimer = null;
      try { C.spawnStreetCrowd(); } catch (e) {}
    }, 250); // short defer for first paint
  };

  C.patchCivicExtras = function () {
    const CL = SP.civicLook;
    if (!CL || CL._charCExtras) return;
    CL.EXTRA_SPECS = C.EXTRA_SPECS;
    CL.spawnExtras = function () { C.scheduleCrowd(); };
    CL._charCExtras = true;
    if (SP.charB) {
      SP.charB.LAYER_EXTRAS = C.LAYER_EXTRAS;
      SP.charB.spawnLayerExtras = function () { C.scheduleCrowd(); };
    }
  };

  // ---------- 4) Hair silhouette draw (all actors with hairId; skip civic uniforms) ----------
  C.drawHairSilhouette = function (ctx, actor) {
    if (!ctx || !actor || actor.erase || actor.hidden || actor.vehicle) return;
    const z = (SP.cam && SP.cam.zoom) || 1;
    if (z < 0.5) return; // far zoom: skip silhouettes
    const civic = actor.civicKind || (actor.set && /^(police|firefighter|nurse)$/.test(actor.set));
    if (civic) return; // never overlay civic hats
    const id = actor.hairId || (actor.appearance && actor.appearance.hairId);
    if (!id) return;
    const sp = C.spec(id);
    const [X, Y] = actor.screen();
    const s = (actor.drawScale || 1) * (actor.drawScaleY || 1);
    const tint = actor.hairTint || sp.tint;
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = "rgb(" + tint.join(",") + ")";
    const hy = Y - Math.round(70 * s);
    const hx = X;
    const shape = sp.shape;
    function oval(cx, cy, rx, ry) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    function rect(x, y, w, h) { ctx.fillRect(x, y, w, h); }
    switch (shape) {
      case "bald":
        oval(hx, hy + 4 * s, 5 * s, 3 * s);
        break;
      case "buzz":
      case "crew":
        oval(hx, hy + 2 * s, 7 * s, 3.5 * s);
        break;
      case "short":
      case "mid":
        oval(hx, hy, 8 * s, 5 * s);
        break;
      case "side":
        oval(hx - 2 * s, hy, 9 * s, 5 * s);
        rect(hx + 3 * s, hy - 2 * s, 4 * s, 6 * s);
        break;
      case "bowl":
        oval(hx, hy - 1 * s, 9 * s, 7 * s);
        break;
      case "undercut":
        rect(hx - 7 * s, hy - 2 * s, 14 * s, 5 * s);
        oval(hx, hy + 2 * s, 6 * s, 3 * s);
        break;
      case "spiky":
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(hx + i * 3 * s, hy + 4 * s);
          ctx.lineTo(hx + i * 3 * s + 1 * s, hy - 6 * s);
          ctx.lineTo(hx + i * 3 * s + 2.5 * s, hy + 4 * s);
          ctx.fill();
        }
        break;
      case "bob":
      case "air":
        oval(hx, hy, 9 * s, 6 * s);
        rect(hx - 9 * s, hy + 2 * s, 18 * s, 8 * s);
        break;
      case "lob":
        oval(hx, hy, 9 * s, 6 * s);
        rect(hx - 8 * s, hy + 2 * s, 16 * s, 12 * s);
        break;
      case "long":
      case "hime":
        oval(hx, hy, 9 * s, 6 * s);
        rect(hx - 8 * s, hy + 2 * s, 16 * s, 22 * s);
        if (shape === "hime") {
          rect(hx - 10 * s, hy + 4 * s, 4 * s, 10 * s);
          rect(hx + 6 * s, hy + 4 * s, 4 * s, 10 * s);
        }
        break;
      case "wave":
        oval(hx, hy, 9 * s, 6 * s);
        for (let i = 0; i < 3; i++) oval(hx - 6 * s + i * 6 * s, hy + 10 * s + (i % 2) * 3 * s, 5 * s, 6 * s);
        break;
      case "pony":
        oval(hx, hy, 8 * s, 5 * s);
        oval(hx + 6 * s, hy + 8 * s, 4 * s, 10 * s);
        break;
      case "bun":
        oval(hx, hy, 8 * s, 5 * s);
        oval(hx, hy - 7 * s, 5 * s, 5 * s);
        break;
      case "twin":
        oval(hx, hy, 8 * s, 5 * s);
        oval(hx - 9 * s, hy + 6 * s, 3.5 * s, 9 * s);
        oval(hx + 9 * s, hy + 6 * s, 3.5 * s, 9 * s);
        break;
      default:
        oval(hx, hy, 8 * s, 5 * s);
    }
    ctx.restore();
  };

  C.patchHairDraw = function () {
    if (!SP.Actor || SP.Actor.prototype._charCHair) return;
    // Replace Char-B player-only rect with silhouette for everyone
    const prev = SP.Actor.prototype.draw;
    SP.Actor.prototype.draw = function (ctx, raw, erase) {
      prev.call(this, ctx, raw, erase);
      if (erase || !ctx) return;
      try { C.drawHairSilhouette(ctx, this); } catch (e) {}
    };
    SP.Actor.prototype._charCHair = true;
    SP.Actor.prototype._charBHair = true; // prevent Char-B from double-wrapping later
  };

  // ---------- 5) Barbershop: gendered menus ----------
  C.patchBarber = function () {
    const B = SP.charB;
    if (!B || B._charCBarber) return;
    // extend opts
    B.HAIR_OPTS = C.ALL.map((h) => ({
      id: h.id,
      label: (h.sex === "f" ? "♀ " : "♂ ") + h.label,
      sex: h.sex
    }));
    // keep legacy setters working
    const prevSet = B.setHairId.bind(B);
    B.setHairId = function (id) {
      const nid = C.normalize(id);
      const sp = C.spec(nid);
      const p = SP.game && SP.game.ps;
      if (p) { p.flags = p.flags || {}; p.flags.hairId = nid; p.hairId = nid; }
      if (SP.player) {
        SP.player.appearance = SP.player.appearance || (AP() && AP().schema({})) || {};
        SP.player.appearance.hairId = nid;
        SP.player.hairId = nid;
        SP.player.hairTint = sp.tint;
        SP.player.hairShape = sp.shape;
      }
      // also accept if prev only knew old ids
      if (B.HAIR_OPTS.some((h) => h.id === nid)) return true;
      return prevSet(nid);
    };
    B.hairTint = function (id) { return C.spec(id).tint; };
    B.getHairId = function () {
      const p = SP.game && SP.game.ps;
      if (!p) return "m_short";
      p.flags = p.flags || {};
      return C.normalize(p.flags.hairId || p.hairId || "m_short");
    };
    const prevOpen = B.openBarber.bind(B);
    B.openBarber = function (o) {
      const G = SP.game;
      if (!G || !G.openMenu) return prevOpen(o);
      const cur = B.getHairId();
      const mk = (pool, title) => pool.map((h) => ({
        id: "hair_" + h.id,
        label: (h.id === cur ? "✓ " : "") + h.label + (h.id === cur ? "（当前）" : " · ¥25"),
        ok: true,
        fn: () => {
          const money = G.ps && G.ps.money;
          if (h.id !== cur && typeof money === "number" && money < 25) return "钱不够（剪发 ¥25）";
          if (h.id !== cur && G.ps) {
            G.ps.money -= 25;
            if (SP.world && SP.world.logEvent) SP.world.logEvent("李默在剪艺理发换了发型：「" + h.label + "」");
          }
          B.setHairId(h.id);
          toast("剪好了：「" + h.label + "」");
          return "发型已换成「" + h.label + "」（silhouette 预览；真·发型网格后续）";
        }
      }));
      const opts = [{ id: "sec_m", ok: true, label: "—— 男发 ——", fn: () => "选下面具体发型" }]
        .concat(mk(C.HAIR_M))
        .concat([{ id: "sec_f", ok: true, label: "—— 女发 ——", fn: () => "选下面具体发型" }])
        .concat(mk(C.HAIR_F))
        .concat([{ id: "cancel", ok: true, label: "改天再来", fn: () => null }]);
      G.openMenu(Object.assign({}, o || {}, { _name: "剪艺理发 · 男女发型" }), opts);
    };
    // wardrobe label
    if (AP() && AP().openWardrobe && !AP()._charCWardrobe) {
      const prevW = AP().openWardrobe.bind(AP());
      AP().openWardrobe = function () {
        prevW();
        const G = SP.game;
        if (G && G.menu && G.menu.opts) {
          const hair = B.getHairId();
          const sp = C.spec(hair);
          const row = G.menu.opts.find((o) => o.id === "outfit_hair");
          if (row) row.label = "发型：" + sp.label + " · 去剪艺改…";
          else G.menu.opts.splice(G.menu.opts.length - 1, 0, {
            id: "outfit_hair",
            label: "发型：" + sp.label + " · 去剪艺改…",
            ok: true,
            fn: () => { B.openBarber({ _name: "剪艺理发" }); return null; }
          });
        }
      };
      AP()._charCWardrobe = true;
    }
    B._charCBarber = true;
  };

  C.femaleRate = function () {
    if (!SP.actors || !SP.actors.list) return 0;
    const crowd = SP.actors.list.filter((a) => a && (a.extraNpc || a.layerExtra));
    if (!crowd.length) return 0;
    const f = crowd.filter((a) => a.appearance && a.appearance.gender === "female").length;
    return f / crowd.length;
  };


  // ---------- 6) Route NPCs from scene.json: assign gendered hair + female atlas ----------
  C.ROUTE_FEMALE_IDS = {
    tea_girl: { gender: "female", hairId: "f_pony", outfitSet: "student_skirt" },
    vendor: { gender: "female", hairId: "f_bun", outfitSet: "office_short" },
    student: { gender: "female", hairId: "f_long", outfitSet: "student_skirt" }, // 学生小林 → visible女学生
    walker_e: { gender: "female", hairId: "f_lob", outfitSet: "office_short" }
  };
  C.patchRouteNpcs = function () {
    const N = SP.npcs;
    if (!N || N._charCInit) return;
    const prev = N.init;
    if (typeof prev !== "function") return;
    N.init = function (specs) {
      const list = prev.apply(this, arguments);
      if (!AP()) return list;
      for (const a of list || []) {
        if (!a || a.vehicle) continue;
        const force = C.ROUTE_FEMALE_IDS[a.id];
        let hints;
        if (force) hints = { job: a.set === "student" ? "student" : a.set === "uncle" ? "uncle" : "office", gender: force.gender, hairId: force.hairId, ageBand: a.id === "student" ? "teen" : "adult" };
        else {
          // remaining male route NPCs still get distinct male hair
          const maleHair = { office: "m_sidepart", uncle: "m_grey", rider: "m_buzz", noodle_boss: "m_crew" };
          hints = { job: a.set || "office", gender: "male", hairId: maleHair[a.id] || "m_short", ageBand: a.id === "uncle" ? "elder" : "adult" };
        }
        const ap = AP().randomNpc((a.id || "n").length * 97 + 13, hints);
        if (force && force.outfitSet) ap.outfitSet = force.outfitSet;
        AP().applyToActor(a, ap);
        a.hairId = ap.hairId;
        a.hairTint = C.spec(ap.hairId).tint;
        a.hairShape = C.spec(ap.hairId).shape;
        // ensure atlas swap for female clothing
        if (force && force.outfitSet && window.ACTORS && window.ACTORS[force.outfitSet]) {
          a.set = force.outfitSet;
          if (SP.ensureActor) SP.ensureActor(force.outfitSet);
        }
      }
      return list;
    };
    N._charCInit = true;
    // if already inited, retrofit current list
    if (N.list && N.list.length && AP()) {
      for (const a of N.list) {
        if (!a || a.vehicle || a.appearance) continue;
        const force = C.ROUTE_FEMALE_IDS[a.id];
        if (!force) continue;
        const ap = AP().randomNpc(55, { gender: "female", hairId: force.hairId, job: "student", ageBand: "teen" });
        ap.outfitSet = force.outfitSet;
        AP().applyToActor(a, ap);
        a.hairId = force.hairId;
        a.set = force.outfitSet;
        if (SP.ensureActor) SP.ensureActor(force.outfitSet);
      }
    }
  };

  C.boot = function () {
    C.patchOutfitResolve();
    C.patchRandomNpc();
    C.patchCivicExtras();
    C.patchHairDraw();
    C.patchBarber();
    C.patchRouteNpcs();
    const t = setInterval(() => {
      if (SP.player && SP.actors && SP.world && !SP.world.interior) {
        C.scheduleCrowd();
        // restore player hair
        if (SP.charB && SP.charB.getHairId) SP.charB.setHairId(SP.charB.getHairId());
        clearInterval(t);
      }
    }, 350);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(C.boot, 0));
  } else {
    setTimeout(C.boot, 0);
  }
})(window.SP = window.SP || {});
