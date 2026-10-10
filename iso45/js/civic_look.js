/* scene-proto-45 · Stage Char-A / Civic-look: modern civic facades cues, duty NPC atlases,
   street extras with random appearance. Prefer new file — does not rewrite Stage D/E/F APIs. */
(function (SP) {
  "use strict";
  const CL = (SP.civicLook = SP.civicLook || {});

  // ---------- 1) Fix civic duty NPC atlases (警察 / 消防员 / 医护) ----------
  CL.patchNpcSpec = function () {
    const D = SP.stageD;
    if (!D || !D.NPC_SPEC) return;
    if (D.NPC_SPEC.civic_police) D.NPC_SPEC.civic_police.set = "police";
    if (D.NPC_SPEC.civic_fire) D.NPC_SPEC.civic_fire.set = "firefighter";
    if (D.NPC_SPEC.civic_hospital) D.NPC_SPEC.civic_hospital.set = "nurse";
    // ensure sheets are requested
    ["police", "firefighter", "nurse"].forEach((n) => { if (SP.ensureActor) SP.ensureActor(n); });
  };

  // wrap syncCivicNpcs to attach appearance + ensure atlas after spawn
  CL.wrapSync = function () {
    const D = SP.stageD;
    if (!D || D._charASync || typeof D.syncCivicNpcs !== "function") return;
    const prev = D.syncCivicNpcs.bind(D);
    D.syncCivicNpcs = function () {
      CL.patchNpcSpec();
      prev();
      if (!SP.actors || !SP.actors.list) return;
      const AP = SP.appearance;
      for (const a of SP.actors.list) {
        if (!a || !a.civicKind) continue;
        const job = a.civicKind === "hospital" ? "nurse" : a.civicKind === "fire" ? "firefighter" : "police";
        if (AP) {
          const ap = AP.schema({
            gender: job === "nurse" ? "female" : "male",
            ageBand: "adult",
            job,
            outfitSet: job,
            layers: { top: "uniform_top", bottom: "pants", outer: job === "firefighter" ? "thick_coat" : "none", shoes: "boots" }
          });
          AP.applyToActor(a, ap);
        } else {
          a.set = job;
        }
      }
    };
    D._charASync = true;
  };

  // ---------- 2) Modernize civic exteriors (runtime — glass shop GF already rebuilt; add sign overlays) ----------
  CL.SIGNS = [
    { group: "civic_police", label: "井槐里派出所", sub: "POLICE STATION", color: "#1a4a9c", x: -36.0, y: -10.0, z: 2.55 },
    { group: "civic_hospital", label: "井槐社区医院", sub: "COMMUNITY HOSPITAL", color: "#0d8a6a", x: 22.0, y: -10.0, z: 2.55 },
    { group: "civic_fire", label: "井槐消防站", sub: "FIRE STATION", color: "#c43c12", x: 58.0, y: -10.0, z: 2.55 }
  ];

  CL.patchSceneData = function () {
    const data = window.SCENE_DATA;
    if (!data || !data.objects || data._charACivic) return;
    // Ensure door/shop portals keep civic interact (shop rebuild uses *_shop ids)
    const map = {
      civic_police_S1F_1_shop: ["civic_police", "井槐里派出所", [-36.0, -6.5, "N"], ["09:00", "17:00"]],
      civic_police_S1F_1_door: ["civic_police", "井槐里派出所", [-36.0, -6.5, "N"], ["09:00", "17:00"]],
      civic_hospital_S1F_1_shop: ["civic_hospital", "井槐社区卫生中心", [22.0, -6.5, "N"], ["08:00", "20:00"]],
      civic_hospital_S1F_1_door: ["civic_hospital", "井槐社区卫生中心", [22.0, -6.5, "N"], ["08:00", "20:00"]],
      civic_fire_S1F_1_shop: ["civic_fire", "井槐消防站", [58.0, -6.5, "N"], ["00:00", "24:00"]],
      civic_fire_S1F_1_door: ["civic_fire", "井槐消防站", [58.0, -6.5, "N"], ["00:00", "24:00"]]
    };
    for (const o of data.objects) {
      const m = map[o.id];
      if (m) {
        o.interact = "civic";
        o.to = m[0];
        o.name = m[1];
        o.spawn = m[2];
        o.hours = m[3];
      }
      // brighter upper plaster cue: force p1 on civic walls
      if (o.fade_group && String(o.fade_group).indexOf("civic_") === 0 && o.type === "f_wall") {
        o.variant = "p1";
      }
    }
    // add sign props if missing (reuse f_shopsign modular kit)
    for (const s of CL.SIGNS) {
      const id = s.group + "_signboard";
      if (data.objects.some((o) => o.id === id)) continue;
      data.objects.push({
        id,
        type: "f_shopsign",
        x: s.x,
        y: s.y,
        z: s.z,
        fade_group: s.group,
        civic_sign: true,
        name: s.label
      });
    }
    data._charACivic = true;
    // east chunk holds civic_fire (x>=46.5)
    const chunks = window.SCENE_CHUNKS || {};
    for (const k of Object.keys(chunks)) {
      const ch = chunks[k];
      if (!ch || !ch.objects || ch._charACivic) continue;
      for (const o of ch.objects) {
        const m = map[o.id];
        if (m) {
          o.interact = "civic"; o.to = m[0]; o.name = m[1]; o.spawn = m[2]; o.hours = m[3];
        }
        if (o.fade_group && String(o.fade_group).indexOf("civic_") === 0 && o.type === "f_wall") o.variant = "p1";
      }
      ch._charACivic = true;
    }
  };

  CL.drawSignLabels = function (ctx) {
    if (!ctx || !SP.sx || !SP.world || SP.world.interior) return;
    const z = (SP.cam && SP.cam.zoom) || 1;
    if (z < 0.35) return;
    for (const s of CL.SIGNS) {
      const X = SP.sx(s.x, s.y), Y = SP.sy(s.x, s.y, s.z || 2.5);
      ctx.save();
      ctx.globalAlpha = 0.92;
      const tw = Math.max(72, s.label.length * 11);
      ctx.fillStyle = s.color;
      ctx.fillRect(X - tw / 2, Y - 14, tw, 18);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.label, X, Y - 1);
      ctx.font = "8px sans-serif";
      ctx.globalAlpha = 0.85;
      ctx.fillText(s.sub, X, Y + 16);
      ctx.restore();
    }
  };

  CL.wrapRender = function () {
    if (SP._charASignDraw) return;
    // hook after world draw via main's post frame if available
    const hook = () => {
      const c = document.getElementById("c") || document.querySelector("canvas");
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      // only when street
      if (SP.world && !SP.world.interior) CL.drawSignLabels(ctx);
    };
    // Prefer SP.onAfterRender if exists; else wrap requestAnimationFrame lightly via SP.hooks
    SP.afterRender = SP.afterRender || [];
    SP.afterRender.push(hook);
    if (typeof SP.actions !== "undefined" && SP.actions && !SP.actions._charAAfter) {
      // main often exposes __proto.render in manual mode; also tap into env end
    }
    // Patch: if main sets window.__proto.render, wrap once when ready
    const iv = setInterval(() => {
      const P = window.__proto;
      if (P && P.render && !P._charASign) {
        const prev = P.render.bind(P);
        P.render = function () {
          const r = prev();
          try { CL.drawSignLabels(document.getElementById("c").getContext("2d")); } catch (e) {}
          return r;
        };
        P._charASign = true;
        clearInterval(iv);
      }
    }, 400);
    // also try continuous overlay via setInterval for non-manual
    setInterval(() => {
      if (SP.world && !SP.world.interior && SP.frameNo) {
        const c = document.getElementById("c");
        if (c) try { CL.drawSignLabels(c.getContext("2d")); } catch (e) {}
      }
    }, 250);
    SP._charASignDraw = true;
  };

  // Lobby cues: brighter ambient when inside civic
  CL.wrapEnv = function () {
    if (!SP.env || SP.env._charACivicLight) return;
    const prev = SP.env.lights;
    if (typeof prev !== "function") return;
    SP.env.lights = function (view, zoom) {
      const out = prev.call(SP.env, view, zoom);
      const sid = SP.world && SP.world.sceneId;
      if (sid === "civic_police" || sid === "civic_hospital" || sid === "civic_fire") {
        const cool = sid === "civic_fire" ? [255, 230, 210] : sid === "civic_hospital" ? [230, 245, 255] : [220, 230, 255];
        out.push({ x: 4.5, y: 3.5, z: 2.6, r: 5.5, c: cool, a: 0.42 });
        out.push({ x: 4.5, y: 3.5, z: 0, r: 6.0, c: cool, a: 0.35, flat: true });
      }
      return out;
    };
    SP.env._charACivicLight = true;
  };

  // ---------- 3) Street extras with random appearance ----------
  CL.EXTRA_SPECS = [
    { id: "extra_kid", seed: 901, hints: { ageBand: "child", job: "civilian", gender: "male" }, x: -8.5, y: 4.2, dir: "E" },
    { id: "extra_office_f", seed: 902, hints: { ageBand: "adult", job: "office", gender: "female" }, x: 14.5, y: 3.4, dir: "W" },
    { id: "extra_teen", seed: 903, hints: { ageBand: "teen", job: "student", gender: "female" }, x: 6.5, y: 8.5, dir: "S" },
    { id: "extra_elder", seed: 904, hints: { ageBand: "elder", job: "uncle", gender: "male" }, x: -15.0, y: 3.8, dir: "E" }
  ];

  CL.spawnExtras = function () {
    if (!SP.Actor || !SP.actors || !SP.appearance) return;
    if (!SP.world || SP.world.interior) return;
    // remove old extras then re-add (street only)
    SP.actors.list = SP.actors.list.filter((a) => !(a && a.id && String(a.id).indexOf("extra_") === 0));
    for (const s of CL.EXTRA_SPECS) {
      if (SP.actors.list.some((a) => a.id === s.id)) continue;
      const ap = SP.appearance.randomNpc(s.seed, s.hints);
      const set = SP.appearance.resolveAtlas(ap);
      if (!window.ACTORS || !window.ACTORS[set]) continue;
      const a = new SP.Actor({
        id: s.id,
        set,
        x: s.x,
        y: s.y,
        radius: 0.2,
        speed: 0,
        height: 1.7
      });
      a.setDir(s.dir);
      a.extraNpc = true;
      SP.appearance.applyToActor(a, ap);
      SP.actors.list.push(a);
    }
  };

  CL.wrapPlaceEnter = function () {
    if (!SP.place || SP.place._charAEnter) return;
    const prev = SP.place.enter;
    if (typeof prev !== "function") return;
    SP.place.enter = function (to, spawn) {
      const r = prev.apply(this, arguments);
      try {
        if (to === "street" || (SP.world && !SP.world.interior)) CL.spawnExtras();
        else {
          // drop street extras indoors
          if (SP.actors) SP.actors.list = SP.actors.list.filter((a) => !(a && a.extraNpc));
        }
        if (SP.stageD && SP.stageD.syncCivicNpcs) SP.stageD.syncCivicNpcs();
      } catch (e) {}
      return r;
    };
    SP.place._charAEnter = true;
  };

  CL.boot = function () {
    CL.patchSceneData();
    CL.patchNpcSpec();
    CL.wrapSync();
    CL.wrapEnv();
    CL.wrapRender();
    CL.wrapPlaceEnter();
    // delayed spawn once world ready
    const t = setInterval(() => {
      if (SP.player && SP.actors && SP.world && !SP.world.interior) {
        CL.spawnExtras();
        clearInterval(t);
      }
    }, 300);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(CL.boot, 0));
  } else {
    setTimeout(CL.boot, 0);
  }
})(window.SP = window.SP || {});
