/* scene-proto-45 · Midtown elevator + floor-menu scoping.
   Buildings >7F expose interact:"elevator" panels; floor select mirrors stairs UX.
   Scopes G.floors() so midtown towers do not cross-list with 井槐里/馨园. */
(function (SP) {
  "use strict";
  const E = (SP.midtownElev = {});

  E.buildingKey = function (sceneId) {
    if (!sceneId) return null;
    if (sceneId.indexOf("stair_xin") === 0 || sceneId.indexOf("room_xin") === 0) return "xin";
    if (sceneId === "roof" || sceneId.indexOf("stair_") === 0 || sceneId === "room_2f02") return "jh12";
    const m = String(sceneId).match(/^(mt_[a-z]+)/);
    return m ? m[1] : null;
  };

  E.floorsFor = function (bkey) {
    const scenes = SP.scenes || {};
    return Object.keys(scenes)
      .filter((k) => {
        const s = scenes[k];
        if (!s || s.floor == null) return false;
        if (s.kind === "fire") return false;
        return E.buildingKey(k) === bkey;
      })
      .sort((a, b) => scenes[a].floor - scenes[b].floor);
  };

  E.install = function () {
    if (E._in || !SP.game) return;
    const G = SP.game;
    E._in = true;

    const _floors = G.floors.bind(G);
    G.floors = function () {
      const W = SP.world;
      const bkey = E.buildingKey(W && W.sceneId);
      if (bkey && String(bkey).indexOf("mt_") === 0) return E.floorsFor(bkey);
      return _floors().filter((k) => String(k).indexOf("mt_") !== 0);
    };

    const _actionFor = G.actionFor.bind(G);
    G.actionFor = function (o, kind) {
      if (o && o.interact === "elevator") {
        if (kind === "use") return { label: o.label || "乘电梯 · 选楼层", do: "game" };
        return null;
      }
      return _actionFor(o, kind);
    };

    const _use = G.use.bind(G);
    G.use = function (o) {
      if (o && o.interact === "elevator") {
        E.openElevMenu(o);
        return null;
      }
      return _use(o);
    };

    const _openFloor = G.openFloorMenu.bind(G);
    G.openFloorMenu = function (o) {
      const W = SP.world;
      const bkey = E.buildingKey(W && W.sceneId);
      if (bkey && String(bkey).indexOf("mt_") === 0) return E.openFloorMenuScoped(o, bkey);
      return _openFloor(o);
    };
  };

  E.openElevMenu = function (o) {
    const G = SP.game, W = SP.world;
    const bkey = o.building || E.buildingKey(W.sceneId);
    const cur = (W.interior && W.data && W.data.floor) || o.floor || 1;
    const opts = E.floorsFor(bkey)
      .filter((id) => id !== W.sceneId)
      .map((id) => {
        const f = SP.scenes[id].floor;
        const above = f > cur;
        const spawn = SP.scenes[id].spawn || [3.5, 1.0, "N"];
        return {
          id: "elev_" + id,
          ok: true,
          label: (above ? "↑ " : "↓ ") + f + "F" + (f === 1 ? "（大堂）" : ""),
          go: { to: id, spawn: spawn, door: null },
          f: f,
        };
      });
    opts.sort((a, b) => a.f - b.f);
    G.openMenu(Object.assign({}, o, { _name: "电梯 · 现在 " + cur + "F" }), opts);
    G.menu.o = o;
  };

  E.openFloorMenuScoped = function (o, bkey) {
    const G = SP.game, W = SP.world;
    const cur = (W.interior && W.data && W.data.floor) || 1;
    const up = (W.portals || []).find((q) => q.id && q.id.indexOf("up_") === 0);
    const dn = (W.portals || []).find((q) => q.id && q.id.indexOf("down_") === 0);
    const opts = E.floorsFor(bkey)
      .filter((id) => id !== W.sceneId)
      .map((id) => {
        const f = SP.scenes[id].floor;
        const above = f > cur;
        const spawn = above
          ? (up && up.spawn) || SP.scenes[id].spawn
          : (dn && dn.spawn) || SP.scenes[id].spawn;
        return {
          id: "go_" + id,
          ok: !!spawn,
          reason: "走不过去",
          label: (above ? "↑ " : "↓ ") + f + "F",
          go: { to: id, spawn: spawn, door: null },
          f: f,
        };
      });
    const dir = o && o.go === "down" ? -1 : 1;
    opts.sort((a, b) => {
      const da = (a.f - cur) * dir, db = (b.f - cur) * dir;
      return (da > 0 ? 0 : 100) + Math.abs(da) - ((db > 0 ? 0 : 100) + Math.abs(db));
    });
    G.openMenu(Object.assign({}, o || {}, { _name: "步梯 · 现在 " + cur + "F" }), opts);
    if (G.menu) G.menu.o = o;
  };

  function boot() {
    if (SP.game) E.install();
    else setTimeout(boot, 40);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.SP = window.SP || {});
