/* scene-proto-45 · households (core). Every residential facade window belongs to a unit / household (shared-rules
   R.households: profile + daily seeded schedule home / out / asleep / vacant, weekend + holiday + weather modifiers).
   Window lights and TV glow follow the household instead of a global pattern; 井槐里12号's corridor doors 2F–6F are the
   same units as its facade windows (F-01 = west half: W face + S bays 0–1, F-02 = east half: S bays 2–4), and 2F-02 is
   李默's own flat: its south window is lit exactly when his lamp / ceiling light / PC is on (also while he is out). */
(function () {
  const W = SP.world, H = (SP.households = {});
  const R = () => SP.game && SP.game.rules;
  H.PLAYER = "b12_2F-02";
  /** unit id of a facade window (null: not residential, e.g. shops) */
  H.unitOf = function (o) {
    if (o._unit !== undefined) return o._unit;
    let u = null, m;
    if ((m = /^win_([SW])(\d)F_(\d)$/.exec(o.id))) u = `b12_${m[2]}F-0${m[1] === "W" || +m[3] <= 1 ? 1 : 2}`;
    else if ((m = /^(.+)_([SW])(\d)F_(\d)_win$/.exec(o.id))) u = `${m[1]}_${m[3]}F-0${m[2] === "W" || +m[4] < 2 ? 1 : 2}`;
    return (o._unit = u);
  };
  /** 李默's flat from its (possibly saved) object states */
  H.player = function () {
    const s = SP.place ? SP.place.stateOf("room_2f02") : {}, light = s.room_light === "on" || s.nightstand === "on", pc = s.desk === "on";
    return { lit: light || pc, tv: pc && !light, pc, light, ac: s.ac === "on", st: "player" };
  };
  let memoMin = -1; const memo = new Map();
  function ctx() { const C = SP.clock; return { weather: C.weather, intensity: C.intensity }; }
  /** {lit, tv, dim, st} of a unit now (memoised per game minute) */
  H.unit = function (u) {
    const abs = Math.floor(SP.clock.abs()); if (abs !== memoMin) { memo.clear(); memoMin = abs; }
    let r = memo.get(u);
    if (!r) { r = u === H.PLAYER ? H.player() : R() && R().households ? R().households.lit(u, abs, ctx()) : { lit: false }; memo.set(u, r); }
    return r;
  };
  H.invalidate = () => { memoMin = -1; };
  H.state = (u) => (u === H.PLAYER ? { st: "player" } : R().households.state(u, SP.clock.abs(), ctx()));
  /** null = no household (keep the old behaviour), else whether this window shows lit */
  H.windowLit = function (o) {
    const u = H.unitOf(o); if (!u) return null;
    const r = H.unit(u); if (!r.lit) return false; if (u === H.PLAYER) return true;
    // a lit unit has 2–3 facade windows: the room nobody is in stays dark (stable per window + 2-hour slot)
    const D = R().data.households, slot = Math.floor(SP.clock.abs() / 120);
    return SP.hash(slot, SP.strHash(o.id)) >= (D.p_room_dark || 0);
  };
  H.windowTV = function (o) { const u = H.unitOf(o); return !!(u && H.unit(u).tv); };
})();
