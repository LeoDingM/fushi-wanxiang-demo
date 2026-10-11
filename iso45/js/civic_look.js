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
    { group: "civic_police", label: "井槐里派出所", sub: "POLICE STATION", color: "#1a4a9c", x: -36.0, y: -19.0, z: 3.15, badge: "警" },
    { group: "civic_hospital", label: "井槐社区卫生中心", sub: "COMMUNITY CLINIC", color: "#0d8a6a", x: -49.0, y: -19.0, z: 3.15, badge: "医" },
    { group: "civic_fire", label: "井槐消防站", sub: "FIRE STATION", color: "#c43c12", x: 56.5, y: -19.0, z: 3.35, badge: "消", emphasize: true }
  ];

  CL.patchSceneData = function () {
    const data = window.SCENE_DATA;
    if (!data || !data.objects || data._charACivic) return;
    // Ensure door/shop portals keep civic interact (shop rebuild uses *_shop ids)
    const map = {
      civic_police_S1F_1_shop: ["civic_police", "井槐里派出所", [-36.0, -6.5, "N"], ["09:00", "17:00"]],
      civic_police_S1F_1_door: ["civic_police", "井槐里派出所", [-36.0, -6.5, "N"], ["09:00", "17:00"]],
      civic_hospital_S1F_1_shop: ["civic_hospital", "井槐社区卫生中心", [-49.0, -6.5, "N"], ["08:00", "20:00"]],
      civic_hospital_S1F_1_door: ["civic_hospital", "井槐社区卫生中心", [-49.0, -6.5, "N"], ["08:00", "20:00"]],
      civic_fire_S1F_1_shop: ["civic_fire", "井槐消防站", [58.0, -6.5, "N"], ["00:00", "24:00"]],
      civic_fire_S1F_1_door: ["civic_fire", "井槐消防站", [58.0, -6.5, "N"], ["00:00", "24:00"]],
      school_pri_S1F_1_shop: ["school_pri", "井槐社区小学", [68.0, -6.5, "N"], ["07:30", "17:30"]],
      school_mid_S1F_1_shop: ["school_mid", "井槐社区初中", [80.0, -6.5, "N"], ["07:30", "17:30"]],
      school_high_S1F_1_shop: ["school_high", "井槐社区高中", [92.0, -6.5, "N"], ["07:30", "17:30"]],
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
    // Do NOT inject f_shopsign (atlas is 24便利店 green box). Labels drawn by CL.drawSignLabels.
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
    const px = (SP.player && SP.player.x) || 0, py = (SP.player && SP.player.y) || 0;
    for (const s of CL.SIGNS) {
      const dist = Math.hypot((s.x || 0) - px, (s.y || 0) - py);
      if (dist > 42) continue;  // only local civic — avoid off-screen ghosts
      const X = SP.sx(s.x, s.y), Y = SP.sy(s.x, s.y, s.z || 2.5);
      const big = !!s.emphasize || dist < 22;
      const fs = big ? 14 : 12;
      const tw = Math.max(big ? 110 : 88, s.label.length * (big ? 13 : 11) + 8);
      const th = big ? 22 : 18;
      ctx.save();
      ctx.globalAlpha = dist < 28 ? 0.96 : 0.88;
      // role badge (警/医/消)
      if (s.badge) {
        const br = big ? 12 : 10;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(X - tw / 2 - br - 4, Y - th / 2 + 2, br, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold " + (big ? 12 : 10) + "px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.badge, X - tw / 2 - br - 4, Y - th / 2 + 2);
        ctx.textBaseline = "alphabetic";
      }
      ctx.fillStyle = s.color;
      ctx.fillRect(X - tw / 2, Y - th + 4, tw, th);
      // fire: thin gold under-bar so it never reads as plain brick shop
      if (s.group === "civic_fire") {
        ctx.fillStyle = "#f0c040";
        ctx.fillRect(X - tw / 2, Y + 4, tw, 3);
      }
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold " + fs + "px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.label, X, Y - 2);
      ctx.font = (big ? 9 : 8) + "px sans-serif";
      ctx.globalAlpha = 0.9;
      ctx.fillText(s.sub, X, Y + 16);
      ctx.restore();
    }
    // Live shop portals (chunk-loaded): guarantee 派出所/卫生中心/消防站 read even if SIGNS miss
    const objs = SP.world.objects || [];
    for (let i = 0; i < objs.length; i++) {
      const o = objs[i];
      if (!o || o.interact !== "civic" || !o.name) continue;
      if (String(o.to || o.fade_group || "").indexOf("civic_") < 0 && String(o.id || "").indexOf("civic_") < 0) continue;
      const dist = Math.hypot((o.x || 0) - px, (o.y || 0) - py);
      if (dist > 36) continue;
      const X = SP.sx(o.x, o.y), Y = SP.sy(o.x, o.y, 3.2);
      const isFire = /消防/.test(o.name);
      const col = isFire ? "#c43c12" : /卫生|医院/.test(o.name) ? "#0d8a6a" : "#1a4a9c";
      const tw = Math.max(100, o.name.length * 13);
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = col;
      ctx.fillRect(X - tw / 2, Y - 18, tw, 20);
      if (isFire) { ctx.fillStyle = "#f0c040"; ctx.fillRect(X - tw / 2, Y + 2, tw, 3); }
      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(o.name, X, Y - 3);
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
