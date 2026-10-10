/* scene-proto-45 · Stage Char-A: appearance schema, random NPC looks, player wardrobe stub.
   Uses SP.outfitHooks. Child = adult atlas at drawScale ~0.72 until dedicated meshes exist. */
(function (SP) {
  "use strict";

  const AP = (SP.appearance = SP.appearance || {});

  AP.AGE_BANDS = ["child", "teen", "adult", "elder"];
  AP.GENDERS = ["male", "female"];
  AP.BODY_TYPES = ["slim", "avg", "heavy"];
  AP.HEIGHTS = ["short", "avg", "tall"];
  AP.HAIR_IDS = ["short_black", "short_brown", "bob", "ponytail", "bald", "grey"]; // barbershop later
  AP.JOBS = [
    "civilian", "office", "student", "vendor", "rider", "uncle",
    "police", "firefighter", "nurse", "teacher", "guard"
  ];

  // outfitSet fallbacks that currently exist as atlases
  AP.JOB_ATLAS = {
    police: "police",
    firefighter: "firefighter",
    nurse: "nurse",
    office: "office",
    student: "student",
    vendor: "vendor",
    uncle: "uncle",
    rider: "rider",
    teacher: "office",
    guard: "uncle",
    civilian: "office"
  };

  AP.LAYER_TOP = ["tee_short", "tee_long", "shirt", "polo", "uniform_top"];
  AP.LAYER_BOTTOM = ["shorts", "pants", "skirt"];
  AP.LAYER_OUTER = ["none", "thin_jacket", "thick_coat"];
  AP.LAYER_SHOES = ["sneakers", "loafers", "boots", "flats"];

  AP.PLAYER_LOOKS = [
    { id: "casual", label: "日常便装", set: "li_mo" },
    { id: "uniform", label: "便利店店服", set: "li_mo_uniform" },
    { id: "winter", label: "冬装厚外套", set: "li_mo_w" }
  ];

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length) % arr.length]; }

  AP.schema = function (partial) {
    const p = partial || {};
    return {
      gender: p.gender || "male",
      ageBand: p.ageBand || "adult",
      height: p.height || "avg",
      bodyType: p.bodyType || "avg",
      hairId: p.hairId || "short_black",
      job: p.job || "civilian",
      layers: Object.assign({
        top: "tee_short",
        bottom: "pants",
        outer: "none",
        shoes: "sneakers"
      }, p.layers || {}),
      outfitSet: p.outfitSet || null
    };
  };

  /** Deterministic random appearance. jobHints may be a string job or {job, ageBand, gender}. */
  AP.randomNpc = function (seed, jobHints) {
    const s = (typeof seed === "number" ? seed : String(seed || "npc").split("").reduce((a, c) => a + c.charCodeAt(0), 0)) >>> 0;
    const rng = mulberry32(s || 1);
    const hints = typeof jobHints === "string" ? { job: jobHints } : (jobHints || {});
    const job = hints.job || pick(rng, ["civilian", "office", "student", "vendor", "uncle"]);
    const gender = hints.gender || pick(rng, AP.GENDERS);
    let ageBand = hints.ageBand || pick(rng, ["adult", "adult", "adult", "teen", "elder", "child"]);
    if (job === "police" || job === "firefighter" || job === "nurse" || job === "teacher" || job === "guard") {
      ageBand = hints.ageBand || (rng() < 0.15 ? "elder" : "adult");
    }
    const height = hints.height || (ageBand === "child" ? "short" : pick(rng, AP.HEIGHTS));
    const bodyType = hints.bodyType || pick(rng, AP.BODY_TYPES);
    const hairId = hints.hairId || pick(rng, ageBand === "elder" ? ["grey", "bald", "short_black"] : AP.HAIR_IDS);
    const layers = {
      top: pick(rng, AP.LAYER_TOP),
      bottom: gender === "female" && rng() < 0.45 ? "skirt" : pick(rng, ["shorts", "pants", "pants"]),
      outer: pick(rng, AP.LAYER_OUTER),
      shoes: pick(rng, AP.LAYER_SHOES)
    };
    if (job === "police" || job === "firefighter" || job === "nurse") {
      layers.top = "uniform_top";
      layers.bottom = "pants";
      layers.outer = job === "firefighter" ? "thick_coat" : "none";
    }
    const outfitSet = AP.JOB_ATLAS[job] || "office";
    return AP.schema({ gender, ageBand, height, bodyType, hairId, job, layers, outfitSet });
  };

  /** Map appearance → atlas set name (existing packs only for now). */
  AP.resolveAtlas = function (npc) {
    if (!npc) return "office";
    const ap = npc.appearance || (typeof npc === "object" && npc.job ? npc : null);
    if (!ap) return npc.set || npc.sprite || "office";
    if (ap.outfitSet && window.ACTORS && window.ACTORS[ap.outfitSet]) return ap.outfitSet;
    const job = ap.job || "civilian";
    const want = AP.JOB_ATLAS[job] || "office";
    if (window.ACTORS && window.ACTORS[want]) return want;
    // fallbacks if civic atlases not loaded yet
    if (job === "police") return "uncle";
    if (job === "firefighter") return "office";
    if (job === "nurse") return "student";
    return want;
  };

  AP.applyToActor = function (actor, appearance) {
    if (!actor || !appearance) return actor;
    actor.appearance = appearance;
    const set = AP.resolveAtlas(appearance);
    actor.set = set;
    actor.sprite = set;
    if (SP.ensureActor) SP.ensureActor(set);
    // interim child scale
    const child = appearance.ageBand === "child";
    const teen = appearance.ageBand === "teen";
    actor.drawScale = child ? 0.72 : teen ? 0.88 : appearance.ageBand === "elder" ? 0.96 : 1;
    if (appearance.height === "short" && !child) actor.drawScale *= 0.94;
    if (appearance.height === "tall" && !child) actor.drawScale *= 1.04;
    actor.radius = (child ? 0.16 : 0.22) * (actor.drawScale < 1 ? 0.95 : 1);
    actor.height = child ? 1.35 : teen ? 1.65 : 1.8;
    return actor;
  };

  // ---------- player wardrobe ----------
  AP.getOutfitId = function () {
    const ps = SP.game && SP.game.ps;
    if (!ps) return "casual";
    ps.flags = ps.flags || {};
    return ps.flags.outfitId || ps.outfitId || "casual";
  };

  AP.setOutfitId = function (id) {
    const look = AP.PLAYER_LOOKS.find((l) => l.id === id);
    if (!look) return false;
    const ps = SP.game && SP.game.ps;
    if (ps) {
      ps.flags = ps.flags || {};
      ps.flags.outfitId = id;
      ps.outfitId = id;
    }
    const p = SP.player;
    if (p) {
      if (p.baseSet == null) p.baseSet = "li_mo";
      // store module may override while on shift; wardrobe still records preference
      if (!(ps && ps.job && SP.store && SP.store._uniformOn && SP.store._uniformOn())) {
        p.set = look.set;
        if (SP.ensureActor) SP.ensureActor(look.set);
      }
    }
    return true;
  };

  AP.cycleOutfit = function () {
    const cur = AP.getOutfitId();
    const i = Math.max(0, AP.PLAYER_LOOKS.findIndex((l) => l.id === cur));
    const next = AP.PLAYER_LOOKS[(i + 1) % AP.PLAYER_LOOKS.length];
    AP.setOutfitId(next.id);
    return next;
  };

  AP.openWardrobe = function () {
    const G = SP.game;
    if (!G || !G.openMenu) return;
    const cur = AP.getOutfitId();
    const opts = AP.PLAYER_LOOKS.map((l) => ({
      id: "outfit_" + l.id,
      label: (l.id === cur ? "✓ " : "") + l.label,
      ok: true,
      fn: () => {
        if (!window.ACTORS || !window.ACTORS[l.set]) {
          if (SP.ensureActor) SP.ensureActor(l.set);
          if (!window.ACTORS[l.set]) return "这套衣服还没准备好（资源未加载）";
        }
        AP.setOutfitId(l.id);
        return "换上了「" + l.label + "」";
      }
    }));
    opts.push({
      id: "outfit_hint",
      label: "理发店换发型（未开放）",
      ok: false,
      reason: "外观系统预留：后续由街区理发店改 hairId"
    });
    G.openMenu({ _name: "衣柜 · 换装", interact: "wardrobe" }, opts);
  };

  // outfitHooks: player wardrobe preference (store uniform hook should run first if it pushes later — we push early,
  // store sets p.set directly; our hook respects flags when not forced)
  SP.outfitHooks = SP.outfitHooks || [];
  SP.outfitHooks.push(function (actor) {
    if (!actor || !actor.isPlayer) return null;
    // store / home / bar poses set actor.set directly — do not override
    if (actor.set === "li_mo_uniform" || actor.set === "li_mo_bar" || actor.set === "li_mo_home") return null;
    const sid = SP.world && SP.world.sceneId;
    if (sid && (sid.indexOf("store_") === 0)) return null;
    const id = AP.getOutfitId();
    const look = AP.PLAYER_LOOKS.find((l) => l.id === id);
    if (!look) return null;
    if (look.set === "li_mo_w" && !(window.ACTORS && window.ACTORS.li_mo_w)) return "li_mo";
    if (look.set === "li_mo_uniform" && !(window.ACTORS && window.ACTORS.li_mo_uniform)) return "li_mo";
    return look.set;
  });

  // patch draw for child/teen scale (feet-anchored)
  function patchDrawScale() {
    if (!SP.Actor || SP.Actor.prototype._charADraw) return;
    const prev = SP.Actor.prototype.draw;
    SP.Actor.prototype.draw = function (ctx, raw, erase) {
      const s = this.drawScale || 1;
      if (s === 1 || !ctx) return prev.call(this, ctx, raw, erase);
      const [X, Y] = this.screen();
      ctx.save();
      ctx.translate(X, Y);
      ctx.scale(s, s);
      ctx.translate(-X, -Y);
      prev.call(this, ctx, raw, erase);
      ctx.restore();
    };
    SP.Actor.prototype._charADraw = true;
  }

  // wardrobe interact: when player uses wardrobe furniture, open our menu after/instead of rules change
  function patchWardrobeUse() {
    const G = SP.game;
    if (!G || G._charAWardrobe) return;
    const prevUse = G.use;
    if (typeof prevUse !== "function") return;
    G.use = function (o) {
      if (o && o.interact === "wardrobe") {
        AP.openWardrobe();
        return null;
      }
      return prevUse.apply(this, arguments);
    };
    G._charAWardrobe = true;
  }

  function injectUi() {
    // God panel + phone home: 换装
    const tryGod = () => {
      const el = document.getElementById("godpanel");
      if (!el || el.querySelector("[data-char-wardrobe]")) return;
      const row = document.createElement("div");
      row.className = "god-row";
      row.innerHTML = `<button data-char-wardrobe type="button">衣柜换装</button>
        <button data-char-cycle type="button">下一套衣服</button>`;
      const body = el.querySelector(".body") || el;
      body.appendChild(row);
      row.querySelector("[data-char-wardrobe]").onclick = () => AP.openWardrobe();
      row.querySelector("[data-char-cycle]").onclick = () => {
        const n = AP.cycleOutfit();
        const toast = (SP.game && SP.game.toast) || (window.toast) || ((m) => console.log(m));
        toast("已换「" + n.label + "」");
      };
    };
    const tryPhone = () => {
      const el = document.getElementById("phonepanel");
      if (!el || el.querySelector("[data-app=wardrobe]")) return;
      const home = el.querySelector(".phone-home, .apps, .iphone-home");
      // Stage A uses .app tiles
      const apps = el.querySelector(".apps") || el.querySelector("[data-phone-home]");
      const host = apps || el.querySelector(".body");
      if (!host) return;
      const tile = document.createElement("div");
      tile.className = "app";
      tile.setAttribute("data-app", "wardrobe");
      tile.innerHTML = "👔 换装";
      tile.onclick = () => { AP.openWardrobe(); };
      host.appendChild(tile);
    };
    setInterval(() => { tryGod(); tryPhone(); }, 800);
  }

  AP.boot = function () {
    patchDrawScale();
    patchWardrobeUse();
    injectUi();
    // restore outfit on boot
    const id = AP.getOutfitId();
    if (id && id !== "casual") AP.setOutfitId(id);
  };

  // late bind after game/actors exist
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(AP.boot, 0));
  } else {
    setTimeout(AP.boot, 0);
  }
})(window.SP = window.SP || {});
