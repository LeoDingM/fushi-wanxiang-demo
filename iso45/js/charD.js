/* scene-proto-45 · Stage Char-D: wire Blender hair atlases (actors_hair.js) + office_skirt +
   extra colorways. Prefer real woman_/man_ hair sprites over Char-C silhouettes. Civic untouched. */
(function (SP) {
  "use strict";
  const D = (SP.charD = SP.charD || {});
  const AP = () => SP.appearance;
  const C = () => SP.charC;

  // hairId (Char-C + legacy + doc suggestions) → real atlas
  D.HAIR_ATLAS = {
    // legacy Char-A/B
    bob: "woman_bob", ponytail: "woman_pony", short_black: "man_short",
    short_brown: "man_sidepart", bald: "man_bald", grey: "man_grey",
    // doc extensions
    long: "woman_long", pixie: "woman_pixie", twin_tails: "woman_twin",
    wave: "woman_wave", bun: "woman_bun", braid: "woman_braid",
    undercut: "man_undercut", buzz: "man_buzz", messy: "man_messy", mullet: "man_mullet",
    // Char-C gendered ids
    f_bob: "woman_bob", f_pony: "woman_pony", f_long: "woman_long", f_twin: "woman_twin",
    f_wave: "woman_wave", f_bun: "woman_bun", f_hime: "woman_braid", f_air: "woman_pixie",
    f_lob: "woman_wave", f_brown_long: "woman_long", f_grey_bob: "woman_bob",
    m_buzz: "man_buzz", m_short: "man_short", m_sidepart: "man_sidepart",
    m_undercut: "man_undercut", m_bald: "man_bald", m_grey: "man_grey",
    m_spiky: "man_messy", m_mid: "man_short", m_bowl: "man_buzz", m_crew: "man_buzz",
    m_brown: "man_sidepart"
  };

  D.FEMALE_ATLASES = ["woman_bob","woman_pony","woman_long","woman_pixie","woman_twin","woman_wave","woman_bun","woman_braid"];
  D.MALE_ATLASES = ["man_undercut","man_buzz","man_short","man_messy","man_sidepart","man_mullet","man_bald","man_grey"];

  D.hasAtlas = function (name) {
    return !!(name && window.ACTORS && window.ACTORS[name] && window.ACTORS[name].hair_extra);
  };

  D.atlasForHair = function (hairId, gender) {
    const CC = C();
    const nid = CC && CC.normalize ? CC.normalize(hairId) : hairId;
    let atlas = D.HAIR_ATLAS[nid] || D.HAIR_ATLAS[hairId];
    if (!atlas && gender === "female") atlas = "woman_bob";
    if (!atlas && gender === "male") atlas = "man_short";
    // gender mismatch fallback
    if (gender === "female" && atlas && atlas.indexOf("man_") === 0) atlas = "woman_pixie";
    if (gender === "male" && atlas && atlas.indexOf("woman_") === 0) atlas = "man_short";
    if (D.hasAtlas(atlas)) return atlas;
    return null;
  };

  D.isHairAtlas = function (set) {
    return !!(set && window.ACTORS && window.ACTORS[set] && window.ACTORS[set].hair_extra);
  };

  // Prefer hair atlas as full body set (hair+outfit baked). Skip silhouette when so.
  D.applyHairAtlas = function (actor, hairId, gender) {
    if (!actor) return false;
    if (actor.civicKind || (actor.set && /^(police|firefighter|nurse)$/.test(actor.set))) return false;
    const atlas = D.atlasForHair(hairId, gender || (actor.appearance && actor.appearance.gender) || "male");
    if (!atlas) return false;
    actor.set = atlas;
    actor.sprite = atlas;
    if (actor.isPlayer || actor === SP.player) actor.baseSet = atlas;
    actor.hairId = hairId;
    actor.useHairAtlas = true;
    actor.hairShape = null; // suppress silhouette
    if (SP.ensureActor) SP.ensureActor(atlas);
    if (actor.appearance) {
      actor.appearance.outfitSet = atlas;
      actor.appearance.hairId = hairId;
    }
    return true;
  };

  D.patchResolve = function () {
    const A = AP();
    if (!A || A._charDResolve) return;
    const prev = A.resolveAtlas.bind(A);
    A.resolveAtlas = function (npc) {
      const ap = npc && (npc.appearance || (npc.job ? npc : null));
      if (ap && ap.job !== "police" && ap.job !== "firefighter" && ap.job !== "nurse") {
        // explicit hair-atlas outfitSet wins
        if (ap.outfitSet && D.isHairAtlas(ap.outfitSet)) return ap.outfitSet;
        // keep any explicit non-hair outfit (fit_*, office_skirt, student_*, …)
        if (ap.outfitSet && !D.isHairAtlas(ap.outfitSet) && !ap.forceHairAtlas) {
          return prev(npc);
        }
        // no outfit / forceHairAtlas → real hair atlas
        const atlas = D.atlasForHair(ap.hairId, ap.gender);
        if (atlas && (ap.forceHairAtlas || !ap.outfitSet) && ap.preferHairAtlas !== false) {
          return atlas;
        }
      }
      return prev(npc);
    };
    // office_skirt + new colorways in JOB_ATLAS
    ["office_skirt","fit_hoodie_lime","fit_tee_sky","fit_dress_mint","fit_skirt_coral",
     "fit_knit_purple","fit_jacket_olive","fit_jeans_black"].forEach((s) => {
      A.JOB_ATLAS[s] = s;
    });
    D.FEMALE_ATLASES.concat(D.MALE_ATLASES).forEach((s) => { A.JOB_ATLAS[s] = s; });
    A._charDResolve = true;
  };

  D.patchRandomNpc = function () {
    const A = AP();
    if (!A || A._charDRandom) return;
    const prev = A.randomNpc.bind(A);
    A.randomNpc = function (seed, jobHints) {
      const ap = prev(seed, jobHints);
      if (ap.job === "police" || ap.job === "firefighter" || ap.job === "nurse") return ap;
      let t = (typeof seed === "number" ? seed : 9) * 374761393 >>> 0;
      const rnd = () => { t = Math.imul(t ^ (t >>> 11), 2246822519); return ((t >>> 0) / 4294967296); };
      // ~65% street NPCs use real hair atlas (baked hair+colorful casual)
      if (rnd() < 0.65) {
        const pool = ap.gender === "female" ? D.FEMALE_ATLASES : D.MALE_ATLASES;
        const atlas = pool[Math.floor(rnd() * pool.length) % pool.length];
        if (D.hasAtlas(atlas)) {
          ap.outfitSet = atlas;
          ap.forceHairAtlas = true;
          // sync hairId to matching style
          const hid = Object.keys(D.HAIR_ATLAS).find((k) => D.HAIR_ATLAS[k] === atlas && (ap.gender === "female" ? k.indexOf("f_") === 0 || ["bob","ponytail","long","pixie","twin_tails","wave","bun","braid"].indexOf(k) >= 0 : k.indexOf("m_") === 0 || k.indexOf("f_") < 0));
          if (hid) ap.hairId = hid;
          else if (ap.gender === "female") ap.hairId = "f_bob";
          else ap.hairId = "m_short";
        }
      } else if (ap.gender === "female" && rnd() < 0.35) {
        // office_skirt / coral / mint among remaining
        const opts = ["office_skirt","fit_skirt_coral","fit_dress_mint","fit_skirt_teal","fit_dress"].filter((s) => window.ACTORS && window.ACTORS[s]);
        if (opts.length) ap.outfitSet = opts[Math.floor(rnd() * opts.length) % opts.length];
      } else if (ap.gender === "male" && rnd() < 0.3) {
        const opts = ["fit_hoodie_lime","fit_tee_sky","fit_jeans_black","fit_jacket_olive","fit_knit_purple"].filter((s) => window.ACTORS && window.ACTORS[s]);
        if (opts.length) ap.outfitSet = opts[Math.floor(rnd() * opts.length) % opts.length];
      }
      return ap;
    };
    A._charDRandom = true;
  };

  // Street crowd: bias toward hair atlases
  D.HAIR_EXTRAS = [
    { id: "hx_wbob", seed: 1301, hints: { gender: "female", ageBand: "adult", job: "civilian", hairId: "f_bob" }, outfitSet: "woman_bob", x: 7.2, y: 3.8, dir: "E" },
    { id: "hx_wpony", seed: 1302, hints: { gender: "female", ageBand: "teen", job: "student", hairId: "f_pony" }, outfitSet: "woman_pony", x: 9.8, y: 4.5, dir: "W" },
    { id: "hx_wlong", seed: 1303, hints: { gender: "female", ageBand: "adult", job: "office", hairId: "f_long" }, outfitSet: "woman_long", x: 13.0, y: 3.2, dir: "S" },
    { id: "hx_wtwin", seed: 1304, hints: { gender: "female", ageBand: "teen", job: "student", hairId: "f_twin" }, outfitSet: "woman_twin", x: -3.5, y: 4.8, dir: "E" },
    { id: "hx_wwave", seed: 1305, hints: { gender: "female", ageBand: "adult", job: "civilian", hairId: "f_wave" }, outfitSet: "woman_wave", x: 19.5, y: 3.5, dir: "W" },
    { id: "hx_wbun", seed: 1306, hints: { gender: "female", ageBand: "adult", job: "office", hairId: "f_bun" }, outfitSet: "woman_bun", x: 1.5, y: 5.5, dir: "S" },
    { id: "hx_oskirt", seed: 1307, hints: { gender: "female", ageBand: "adult", job: "office", hairId: "f_lob" }, outfitSet: "office_skirt", x: 15.5, y: 4.0, dir: "E" },
    { id: "hx_mund", seed: 1310, hints: { gender: "male", ageBand: "adult", job: "civilian", hairId: "m_undercut" }, outfitSet: "man_undercut", x: 5.5, y: 3.0, dir: "W" },
    { id: "hx_mbuzz", seed: 1311, hints: { gender: "male", ageBand: "adult", job: "civilian", hairId: "m_buzz" }, outfitSet: "man_buzz", x: -7.5, y: 3.6, dir: "E" },
    { id: "hx_mmessy", seed: 1312, hints: { gender: "male", ageBand: "teen", job: "student", hairId: "m_spiky" }, outfitSet: "man_messy", x: 11.0, y: 5.8, dir: "S" },
    { id: "hx_mside", seed: 1313, hints: { gender: "male", ageBand: "adult", job: "office", hairId: "m_sidepart" }, outfitSet: "man_sidepart", x: 21.0, y: 2.8, dir: "W" },
    { id: "hx_mmullet", seed: 1314, hints: { gender: "male", ageBand: "adult", job: "civilian", hairId: "mullet" }, outfitSet: "man_mullet", x: -10.5, y: 4.2, dir: "E" }
  ];

  D.patchCrowd = function () {
    const CC = C();
    if (!CC || CC._charDCrowd) return;
    const prev = CC.spawnStreetCrowd.bind(CC);
    CC.spawnStreetCrowd = function () {
      // merge hair extras into EXTRA_SPECS once
      if (!CC._charDExtrasMerged) {
        const ids = new Set((CC.EXTRA_SPECS || []).map((s) => s.id));
        D.HAIR_EXTRAS.forEach((s) => { if (!ids.has(s.id)) CC.EXTRA_SPECS.push(s); });
        CC._charDExtrasMerged = true;
      }
      prev();
      if (!SP.actors) return;
      for (const a of SP.actors.list) {
        if (!a || !(a.extraNpc || a.layerExtra)) continue;
        if (D.isHairAtlas(a.set) || (a.appearance && D.isHairAtlas(a.appearance.outfitSet))) {
          if (a.appearance && D.isHairAtlas(a.appearance.outfitSet)) {
            a.set = a.appearance.outfitSet;
            a.sprite = a.set;
          }
          a.useHairAtlas = true;
          a.hairShape = null;
          if (SP.ensureActor) SP.ensureActor(a.set);
        }
      }
    };
    CC._charDCrowd = true;
  };

  // Suppress Char-C silhouette when using real hair atlas
  D.patchHairDraw = function () {
    const CC = C();
    if (!CC || !CC.drawHairSilhouette || CC._charDSil) return;
    const prev = CC.drawHairSilhouette.bind(CC);
    CC.drawHairSilhouette = function (ctx, actor) {
      if (actor && (actor.useHairAtlas || D.isHairAtlas(actor.set))) return; // real hair in sprite
      return prev(ctx, actor);
    };
    CC._charDSil = true;
  };

  // Barber: applying hairId switches to hair atlas when available
  D.patchBarber = function () {
    const B = SP.charB;
    if (!B || B._charDBarber) return;
    const prevSet = B.setHairId.bind(B);
    B.setHairId = function (id) {
      const ok = prevSet(id);
      const CC = C();
      const nid = CC && CC.normalize ? CC.normalize(id) : id;
      const FEM = ["bob","ponytail","long","pixie","twin_tails","wave","bun","braid"];
      const MAL = ["short_black","short_brown","bald","grey","undercut","buzz","messy","mullet"];
      let gender;
      if (String(nid).indexOf("f_") === 0 || FEM.indexOf(nid) >= 0) gender = "female";
      else if (String(nid).indexOf("m_") === 0 || MAL.indexOf(nid) >= 0) gender = "male";
      else gender = (SP.player && SP.player.appearance && SP.player.appearance.gender) || "male";
      if (SP.player) {
        const atlas = D.atlasForHair(nid, gender);
        if (atlas) {
          SP.player.appearance = SP.player.appearance || {};
          SP.player.appearance.gender = gender;
          SP.player.appearance.hairId = nid;
          SP.player.appearance.outfitSet = atlas;
          SP.player.appearance.forceHairAtlas = true;
          D.applyHairAtlas(SP.player, nid, gender);
          if (SP.toast) SP.toast("发型/造型：「" + ((CC && CC.spec && CC.spec(nid).label) || nid) + "」· 真图集", 2200);
        } else {
          SP.player.useHairAtlas = false;
        }
      }
      return ok;
    };
    B._charDBarber = true;
  };

  D.patchWardrobe = function () {
    const A = AP();
    if (!A || A._charDWardrobe) return;
    const hairLooks = [
      { id: "hair_woman_bob", label: "造型 · 波波头便装", set: "woman_bob" },
      { id: "hair_woman_pony", label: "造型 · 马尾开衫", set: "woman_pony" },
      { id: "hair_woman_long", label: "造型 · 长发针织", set: "woman_long" },
      { id: "hair_woman_twin", label: "造型 · 双马尾牛仔", set: "woman_twin" },
      { id: "hair_woman_wave", label: "造型 · 波浪夹克", set: "woman_wave" },
      { id: "hair_office_skirt", label: "造型 · 办公裙装", set: "office_skirt" },
      { id: "hair_man_undercut", label: "造型 · 侧铲钴蓝", set: "man_undercut" },
      { id: "hair_man_buzz", label: "造型 · 寸头运动", set: "man_buzz" },
      { id: "hair_man_side", label: "造型 · 偏分夹克", set: "man_sidepart" },
      { id: "hair_man_messy", label: "造型 · 凌乱砖红", set: "man_messy" },
      { id: "hair_man_mullet", label: "造型 · 狼尾锈橙", set: "man_mullet" },
      { id: "street_lime", label: "街头 · 荧光绿帽衫", set: "fit_hoodie_lime" },
      { id: "street_coral_skirt", label: "街头 · 珊瑚裙", set: "fit_skirt_coral" },
      { id: "street_mint_dress", label: "街头 · 薄荷裙", set: "fit_dress_mint" }
    ];
    hairLooks.forEach((l) => {
      if (!A.PLAYER_LOOKS.some((x) => x.id === l.id) && window.ACTORS && window.ACTORS[l.set]) {
        A.PLAYER_LOOKS.push(l);
      }
    });
    // when setting a hair atlas look, mark useHairAtlas
    const prevSet = A.setOutfitId.bind(A);
    A.setOutfitId = function (id) {
      const r = prevSet(id);
      const look = A.PLAYER_LOOKS.find((l) => l.id === id);
      if (r && SP.player && look) {
        if (D.isHairAtlas(look.set) || look.set === "office_skirt" || String(look.set).indexOf("fit_") === 0) {
          SP.player.set = look.set;
          SP.player.sprite = look.set;
          SP.player.baseSet = look.set;
          SP.player.useHairAtlas = D.isHairAtlas(look.set);
          if (D.isHairAtlas(look.set)) SP.player.hairShape = null;
          if (SP.ensureActor) SP.ensureActor(look.set);
        } else if (!D.isHairAtlas(look.set)) {
          SP.player.useHairAtlas = false;
        }
      }
      return r;
    };
    A._charDWardrobe = true;
  };

  D.boot = function () {
    D.patchResolve();
    D.patchRandomNpc();
    D.patchCrowd();
    D.patchHairDraw();
    D.patchBarber();
    D.patchWardrobe();
    // ensure sheets requested
    D.FEMALE_ATLASES.concat(D.MALE_ATLASES).forEach((n) => { if (SP.ensureActor) SP.ensureActor(n); });
    if (SP.ensureActor) SP.ensureActor("office_skirt");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(D.boot, 0));
  } else {
    setTimeout(D.boot, 0);
  }
})(window.SP = window.SP || {});
