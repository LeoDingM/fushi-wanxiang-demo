/* scene-proto-45 · Stage Char-B: schools + barbershop + layer variants + civic sign panels.
   Parallel to Stage J — does not touch stageJ.js APIs. */
(function (SP) {
  "use strict";
  const B = (SP.charB = SP.charB || {});
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 2800);
  const ps = () => SP.game && SP.game.ps;
  const AP = () => SP.appearance;

  B.SCHOOLS = {
    school_pri: {
      label: "井槐小学",
      studentHints: { job: "student", ageBand: "child", gender: "male" },
      teacherHints: { job: "teacher", ageBand: "adult", gender: "female" },
      studentPos: [2.4, 2.8, "E"],
      teacherPos: [4.6, 2.6, "W"]
    },
    school_mid: {
      label: "井槐中学·初中部",
      studentHints: { job: "student", ageBand: "teen", gender: "female" },
      teacherHints: { job: "teacher", ageBand: "adult", gender: "male" },
      studentPos: [2.2, 2.8, "E"],
      teacherPos: [4.8, 2.6, "W"]
    },
    school_high: {
      label: "井槐中学·高中部",
      studentHints: { job: "student", ageBand: "teen", gender: "male" },
      teacherHints: { job: "teacher", ageBand: "adult", gender: "female" },
      studentPos: [2.3, 2.8, "E"],
      teacherPos: [4.7, 2.6, "W"]
    }
  };

  // Modular sign panels (img/signs/*.png) — replace Char-A text-only overlays
  B.SIGNS = [
    { id: "police", x: -36.0, y: -10.0, z: 2.6, img: "img/signs/police.png" },
    { id: "hospital", x: 22.0, y: -10.0, z: 2.6, img: "img/signs/hospital.png" },
    { id: "fire", x: 58.0, y: -10.0, z: 2.6, img: "img/signs/fire.png" },
    { id: "school_pri", x: -19.0, y: -10.0, z: 2.6, img: "img/signs/school_pri.png" },
    { id: "school_mid", x: 5.0, y: -10.0, z: 2.6, img: "img/signs/school_mid.png" },
    { id: "school_high", x: 37.0, y: -10.0, z: 2.6, img: "img/signs/school_high.png" },
    { id: "barber", x: 49.5, y: 10.0, z: 2.4, img: "img/signs/barber.png" }
  ];
  B._signImgs = {};

  B.loadSigns = function () {
    for (const s of B.SIGNS) {
      if (B._signImgs[s.id]) continue;
      const im = new Image();
      im.src = s.img;
      B._signImgs[s.id] = im;
    }
  };

  B.drawSigns = function (ctx) {
    if (!ctx || !SP.sx || !SP.world || SP.world.interior) return;
    const z = (SP.cam && SP.cam.zoom) || 1;
    if (z < 0.3) return;
    for (const s of B.SIGNS) {
      const im = B._signImgs[s.id];
      if (!im || !im.complete || !im.naturalWidth) continue;
      const X = SP.sx(s.x, s.y), Y = SP.sy(s.x, s.y, s.z || 2.5);
      const sc = Math.max(0.55, Math.min(1.2, z));
      const w = im.naturalWidth * sc, h = im.naturalHeight * sc;
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.drawImage(im, X - w / 2, Y - h / 2, w, h);
      ctx.restore();
    }
  };

  // Disable Char-A text overlays once panels load (avoid double labels)
  B.suppressTextSigns = function () {
    const CL = SP.civicLook;
    if (!CL || CL._charBSigns) return;
    CL._charBSigns = true;
    const prev = CL.drawSignLabels;
    CL.drawSignLabels = function (ctx) {
      // keep civic text only if panel image missing
      if (!prev) return;
      const missing = B.SIGNS.filter((s) => {
        const im = B._signImgs[s.id];
        return !im || !im.complete || !im.naturalWidth;
      });
      if (!missing.length) return;
      // temporarily filter SIGNS — fall back to text for civic only
      prev.call(CL, ctx);
    };
  };

  B.wrapRender = function () {
    if (B._render) return;
    B._render = true;
    B.loadSigns();
    setInterval(() => {
      if (SP.world && !SP.world.interior && SP.frameNo) {
        const c = document.getElementById("c");
        if (c) try { B.drawSigns(c.getContext("2d")); } catch (e) {}
      }
    }, 200);
    const iv = setInterval(() => {
      const P = window.__proto;
      if (P && P.render && !P._charBSign) {
        const prev = P.render.bind(P);
        P.render = function () {
          const r = prev();
          try { B.drawSigns(document.getElementById("c").getContext("2d")); } catch (e) {}
          return r;
        };
        P._charBSign = true;
        clearInterval(iv);
      }
    }, 400);
  };

  // ---------- School NPC sync ----------
  B.clearSchoolNpcs = function () {
    if (!SP.actors) return;
    SP.actors.list = SP.actors.list.filter((a) => !(a && a.id && String(a.id).indexOf("schoolnpc_") === 0));
  };

  B.syncSchoolNpcs = function () {
    B.clearSchoolNpcs();
    if (!SP.world || !SP.world.interior || !AP()) return;
    const sid = SP.world.sceneId;
    const spec = B.SCHOOLS[sid];
    if (!spec) return;
    const make = (suffix, hints, pos, seed) => {
      const ap = AP().randomNpc(seed, hints);
      // prefer layer variants for visible diversity
      if (hints.ageBand === "child") ap.outfitSet = "child_cue";
      else if (hints.gender === "female" && hints.job === "student") ap.outfitSet = "student_skirt";
      else if (hints.job === "student" && hints.ageBand === "teen") ap.outfitSet = Math.random() < 0.5 ? "student_long" : "student";
      else if (hints.job === "teacher") ap.outfitSet = hints.gender === "female" ? "office_short" : "office";
      const set = AP().resolveAtlas(ap);
      if (!window.ACTORS || !window.ACTORS[set]) return;
      const a = new SP.Actor({
        id: "schoolnpc_" + suffix,
        set,
        x: pos[0],
        y: pos[1],
        radius: 0.18,
        speed: 0,
        height: hints.ageBand === "child" ? 1.3 : 1.7
      });
      a.setDir(pos[2]);
      a.schoolNpc = true;
      a.civicName = hints.job === "teacher" ? "老师" : "同学";
      AP().applyToActor(a, ap);
      SP.actors.list.push(a);
    };
    make("stu", spec.studentHints, spec.studentPos, 1100 + sid.length * 17);
    make("tch", spec.teacherHints, spec.teacherPos, 2200 + sid.length * 31);
  };

  // Street layer-variant extras (visible clothing diversity)
  B.LAYER_EXTRAS = [
    { id: "extra_skirt", seed: 1201, hints: { job: "student", gender: "female", ageBand: "teen" }, outfitSet: "student_skirt", x: 8.5, y: 3.6, dir: "W" },
    { id: "extra_long", seed: 1202, hints: { job: "student", gender: "male", ageBand: "teen" }, outfitSet: "student_long", x: -4.5, y: 4.0, dir: "E" },
    { id: "extra_short", seed: 1203, hints: { job: "office", gender: "male", ageBand: "adult" }, outfitSet: "office_short", x: 18.0, y: 3.2, dir: "W" },
    { id: "extra_child", seed: 1204, hints: { job: "student", gender: "female", ageBand: "child" }, outfitSet: "child_cue", x: -12.0, y: 3.8, dir: "E" }
  ];

  B.spawnLayerExtras = function () {
    if (!SP.Actor || !SP.actors || !AP()) return;
    if (!SP.world || SP.world.interior) return;
    SP.actors.list = SP.actors.list.filter((a) => !(a && a.id && String(a.id).indexOf("extra_") === 0 && a.layerExtra));
    for (const s of B.LAYER_EXTRAS) {
      if (SP.actors.list.some((a) => a.id === s.id)) continue;
      const ap = AP().randomNpc(s.seed, s.hints);
      ap.outfitSet = s.outfitSet;
      const set = AP().resolveAtlas(ap);
      if (!window.ACTORS || !window.ACTORS[set]) continue;
      const a = new SP.Actor({ id: s.id, set, x: s.x, y: s.y, radius: 0.18, speed: 0, height: 1.6 });
      a.setDir(s.dir);
      a.extraNpc = true;
      a.layerExtra = true;
      AP().applyToActor(a, ap);
      SP.actors.list.push(a);
    }
  };

  // ---------- Barbershop hairId UI ----------
  B.HAIR_OPTS = [
    { id: "short_black", label: "短黑发" },
    { id: "short_brown", label: "短棕发" },
    { id: "bob", label: "波波头" },
    { id: "ponytail", label: "马尾" },
    { id: "bald", label: "寸头/光头" },
    { id: "grey", label: "灰白发" }
  ];

  B.getHairId = function () {
    const p = ps();
    if (!p) return "short_black";
    p.flags = p.flags || {};
    return p.flags.hairId || p.hairId || "short_black";
  };

  B.setHairId = function (id) {
    const opt = B.HAIR_OPTS.find((h) => h.id === id);
    if (!opt) return false;
    const p = ps();
    if (p) {
      p.flags = p.flags || {};
      p.flags.hairId = id;
      p.hairId = id;
    }
    if (SP.player) {
      SP.player.appearance = SP.player.appearance || (AP() && AP().schema({})) || {};
      SP.player.appearance.hairId = id;
      SP.player.hairId = id;
      // tint cue until real hair meshes exist
      SP.player.hairTint = B.hairTint(id);
    }
    return true;
  };

  B.hairTint = function (id) {
    return ({
      short_black: [30, 28, 32],
      short_brown: [90, 60, 40],
      bob: [40, 35, 50],
      ponytail: [55, 40, 30],
      bald: [200, 170, 140],
      grey: [140, 140, 145]
    })[id] || [30, 28, 32];
  };

  B.openBarber = function (o) {
    const G = SP.game;
    if (!G || !G.openMenu) return;
    const cur = B.getHairId();
    const opts = B.HAIR_OPTS.map((h) => ({
      id: "hair_" + h.id,
      label: (h.id === cur ? "✓ " : "") + h.label + (h.id === cur ? "（当前）" : " · ¥25"),
      ok: true,
      fn: () => {
        const money = ps() && ps().money;
        if (h.id !== cur && typeof money === "number" && money < 25) return "钱不够（剪发 ¥25）";
        if (h.id !== cur && ps()) {
          ps().money -= 25;
          if (SP.world && SP.world.logEvent) SP.world.logEvent("李默在剪艺理发换了发型：「" + h.label + "」");
        }
        B.setHairId(h.id);
        return h.id === cur ? "还是这个发型" : "剪好了：「" + h.label + "」（已写入存档；立绘发型美术后续接入）";
      }
    }));
    opts.push({ id: "cancel", ok: true, label: "改天再来", fn: () => null });
    G.openMenu(Object.assign({}, o || {}, { _name: "剪艺理发 · 选发型" }), opts);
  };

  B.patchBarberUse = function () {
    const G = SP.game;
    if (!G || G._charBBarber) return;
    const prev = G.use;
    if (typeof prev !== "function") return;
    G.use = function (o) {
      if (o && (o.interact === "barber" || (o.id && String(o.id).indexOf("cut_") === 0))) {
        B.openBarber(o);
        return null;
      }
      return prev.apply(this, arguments);
    };
    // also near-label
    const prevNear = G.near;
    // prompt via stageA/interact path uses interact kind from action()
    if (G.action) {
      const prevAct = G.action;
      G.action = function (o, kind) {
        if (o && o.interact === "barber" && kind === "use") {
          return { label: "选发型 / 理发", do: "game" };
        }
        return prevAct.apply(this, arguments);
      };
    }
    G._charBBarber = true;
  };

  // Hair tint draw cue on player (small head rectangle)
  B.patchHairDraw = function () {
    if (!SP.Actor || SP.Actor.prototype._charBHair) return;
    const prev = SP.Actor.prototype.draw;
    SP.Actor.prototype.draw = function (ctx, raw, erase) {
      prev.call(this, ctx, raw, erase);
      if (!this.isPlayer || erase || !ctx) return;
      const id = this.hairId || (this.appearance && this.appearance.hairId) || B.getHairId();
      const tint = this.hairTint || B.hairTint(id);
      const [X, Y] = this.screen();
      const s = this.drawScale || 1;
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = "rgb(" + tint.join(",") + ")";
      // small hair cue above head
      const hy = Y - Math.round(72 * s);
      ctx.fillRect(X - Math.round(6 * s), hy, Math.round(12 * s), Math.round(5 * s));
      ctx.restore();
    };
    SP.Actor.prototype._charBHair = true;
  };

  B.wrapPlace = function () {
    if (!SP.place || SP.place._charBEnter) return;
    const prev = SP.place.enter;
    if (typeof prev !== "function") return;
    SP.place.enter = function (to, spawn) {
      const r = prev.apply(this, arguments);
      try {
        if (to === "street" || (SP.world && !SP.world.interior)) {
          B.spawnLayerExtras();
          B.clearSchoolNpcs();
        } else if (B.SCHOOLS[to]) {
          B.syncSchoolNpcs();
        } else {
          B.clearSchoolNpcs();
        }
      } catch (e) {}
      return r;
    };
    SP.place._charBEnter = true;
  };

  // God / phone spawn shortcuts for schools
  B.patchSpawnAt = function () {
    const A = SP.stageA;
    if (!A || !A.spawnAt || A._charBSpawn) return;
    const prev = A.spawnAt.bind(A);
    A.spawnAt = function (key) {
      const map = {
        school_pri: { to: "school_pri", street: [-19, -6.5, "N"] },
        school_mid: { to: "school_mid", street: [5, -6.5, "N"] },
        school_high: { to: "school_high", street: [37, -6.5, "N"] },
        barber: { to: "shop_barber", street: [49.5, 9.0, "S"] }
      };
      if (map[key]) {
        const m = map[key];
        if (document.getElementById("phonepanel")) document.getElementById("phonepanel").classList.add("hidden");
        if (SP.game && SP.game.switchScene) SP.game.switchScene(m.to, SP.scenes[m.to] && SP.scenes[m.to].spawn);
        else if (SP.place) SP.place.enter(m.to, SP.scenes[m.to] && SP.scenes[m.to].spawn);
        return;
      }
      return prev(key);
    };
    A._charBSpawn = true;
  };

  B.boot = function () {
    B.wrapRender();
    B.suppressTextSigns();
    B.patchBarberUse();
    B.patchHairDraw();
    B.wrapPlace();
    B.patchSpawnAt();
    // restore hair
    const hid = B.getHairId();
    if (hid) B.setHairId(hid);
    const t = setInterval(() => {
      if (SP.player && SP.actors && SP.world && !SP.world.interior) {
        B.spawnLayerExtras();
        clearInterval(t);
      }
    }, 350);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(B.boot, 0));
  } else {
    setTimeout(B.boot, 0);
  }
})(window.SP = window.SP || {});
