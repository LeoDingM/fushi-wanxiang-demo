/* scene-proto-45 · households (core). Every residential facade window belongs to a unit / household (shared-rules
   R.households: profile + daily seeded schedule home / out / asleep / vacant, weekend + holiday + weather modifiers).
   Window lights and TV glow follow the household instead of a global pattern; 井槐里12号's corridor doors 2F–6F are the
   same units as its facade windows (F-01 = west half: W face + S bays 0–1, F-02 = east half: S bays 2–4), and 2F-02 is
   李默's own flat: its south window is lit exactly when his lamp / ceiling light / PC is on (also while he is out). */
(function () {
  const W = SP.world, H = (SP.households = {});
  const R = () => SP.game && SP.game.rules;
  H.PLAYER = "b12_2F-02";
  // A room/facade link is identified by authored object IDs, never by a screen position.
  // Later residential kits can register another room here without inheriting 12号's bay numbering.
  H.facades = {
    room_2f02: { room: "room_2f02", unit: H.PLAYER, lights: ["room_light", "nightstand"], pc: "desk", ac: "ac",
      windows: ["win_S2F_2", "win_S2F_4"], balcony: "balc_S2F_3", outdoorAc: "ac_S2F_3",
      indoorRack: "balcony", outdoorLine: "bal_2f02",
      // Sprite-local panes in f_balcony/b2, inset from the opaque parapet and metal mullions.
      glassPanes: [
        [[32,64],[50,55],[50,111],[32,120]],
        [[53,53],[74,42],[74,100],[53,110]],
        [[77,40],[97,30],[97,89],[77,99]],
        [[101,31],[113,36],[113,95],[101,89]]
      ],
      renderMount: { ac: [4.15,12.78], line: [3.5,12.76,5.6,12.76] } }
  };
  H.facade = (room) => H.facades[room] || null;
  /* perf: unit -> facade map, rebuilt when H.facades changes (registerFacade is the only writer and clears it;
     the identity check also catches a replaced H.facades); first match in key order, as Object.values().find did */
  let fuMap = null, fuSrc = null;
  H.facadeForUnit = (unit) => {
    if (!fuMap || fuSrc !== H.facades) { fuMap = new Map(); fuSrc = H.facades; for (const k of Object.keys(H.facades)) { const f = H.facades[k]; if (f && !fuMap.has(f.unit)) fuMap.set(f.unit, f); } }
    return fuMap.get(unit) || null;
  };
  H.registerFacade = function (room, contract) {
    if (!room || !contract || !contract.unit || !Array.isArray(contract.windows)) throw new Error("room facade needs room, unit and window IDs");
    H.facades[room] = Object.assign({room},contract); fuMap = null;
    for (const o of W.objects) if (contract.windows.includes(o.id)) delete o._unit;
    H.invalidate(); if (SP.layers) SP.layers.invalidate();
  };
  /** unit id of a facade window (null: not residential, e.g. shops) */
  H.unitOf = function (o) {
    if (o._unit !== undefined) return o._unit;
    let u = null, m;
    for (const f of Object.values(H.facades)) if (f.windows.includes(o.id)) { u = f.unit; break; }
    if (!u && (m = /^win_([SW])(\d)F_(\d)$/.exec(o.id))) u = `b12_${m[2]}F-0${m[1] === "W" || +m[3] <= 1 ? 1 : 2}`;
    if (!u && (m = /^(.+)_([SW])(\d)F_(\d)_win$/.exec(o.id))) u = `${m[1]}_${m[3]}F-0${m[2] === "W" || +m[4] < 2 ? 1 : 2}`;
    return (o._unit = u);
  };
  /** 李默's flat from its (possibly saved) object states */
  H.roomState = function (room) {
    const f = H.facade(room), s = f && SP.place ? SP.place.stateOf(room) : {};
    if (!f) return {lit:false,tv:false,pc:false,light:false,ac:false,st:"unknown"};
    const lights = (f.lights || []).filter(id=>id!==f.pc), light = lights.some(id=>s[id]==="on"), pc = !!(f.pc && s[f.pc]==="on");
    return {lit:light||pc,tv:pc&&!light,pc,light,ac:!!(f.ac&&s[f.ac]==="on"),st:"resident"};
  };
  H.player = () => H.roomState("room_2f02");
  let memoMin = -1; const memo = new Map();
  function ctx() { const C = SP.clock; return { weather: C.weather, intensity: C.intensity }; }
  /** {lit, tv, dim, st} of a unit now (memoised per game minute) */
  H.unit = function (u) {
    // The player's switches can change several times inside one game minute.
    const f = H.facadeForUnit(u); if (f) return H.roomState(f.room || Object.keys(H.facades).find(r=>H.facades[r]===f));
    const abs = Math.floor(SP.clock.abs()); if (abs !== memoMin) { memo.clear(); memoMin = abs; }
    let r = memo.get(u);
    if (!r) { r = R() && R().households ? R().households.lit(u, abs, ctx()) : { lit: false }; memo.set(u, r); }
    return r;
  };
  H.invalidate = () => { memoMin = -1; };
  H.state = (u) => (H.facadeForUnit(u) ? { st: "player" } : R().households.state(u, SP.clock.abs(), ctx()));
  /** null = no household (keep the old behaviour), else whether this window shows lit */
  H.windowLit = function (o) {
    const u = H.unitOf(o); if (!u) return null;
    const r = H.unit(u); if (!r.lit) return false; if (H.facadeForUnit(u)) return true;
    // a lit unit has 2–3 facade windows: the room nobody is in stays dark (stable per window + 2-hour slot)
    const D = R().data.households, slot = Math.floor(SP.clock.abs() / 120);
    return SP.hash(slot, SP.strHash(o.id)) >= (D.p_room_dark || 0);
  };
  H.windowTV = function (o) { const u = H.unitOf(o); return !!(u && H.unit(u).tv); };
  /** Rendering mounts do not change scene authoring, world identity, or a save's object contract. */
  H.mountStreet = function () {
    const street = W.interior ? SP.place && SP.place.street : W;
    if (!street || !street.byId) return;
    let moved = false;
    for (const f of Object.values(H.facades)) {
      const ac = street.byId[f.outdoorAc], L = (street.laundry || []).find(x => x.id === f.outdoorLine);
      if (ac) {
        // Only a registered balcony yields to its own exterior AC. Other
        // buildings' foreground walls keep the ordinary geometric order.
        if (f.balcony && ac._facadeFrontOf !== f.balcony) { ac._facadeFrontOf = f.balcony; moved = true; }
        if (f.renderMount && (ac.x !== f.renderMount.ac[0] || ac.y !== f.renderMount.ac[1])) {
          [ac.x,ac.y] = f.renderMount.ac; ac._box = null; moved = true;
        }
      }
      if (L && f.renderMount && (!L.pts || L.pts.some((v,i)=>v!==f.renderMount.line[i]))) { L.pts = f.renderMount.line.slice(); moved = true; }
    }
    if (moved && !W.interior && SP.layers) { SP.layers.invalidate(); SP.layers.flush(); }
  };
  /** The spinning fan is a dynamic drawable placed just in front of its own outdoor-unit body. */
  H.fanDrawables = function (out, view) {
    if (W.interior) return;
    for (const f of Object.values(H.facades)) {
      if (!H.unit(f.unit).ac) continue;
      const o = W.byId[f.outdoorAc]; if (!o) continue;
      const key = SP.frameKey(o.type,o.variant,"main",o.state,o.rot), X = SP.sx(o.x,o.y), Y = SP.sy(o.x,o.y,o.z);
      const rect = key && SP.frameRect(key,X,Y); if (!rect || view && !SP.rectsOverlap(rect,view)) continue;
      const box = W.sortBox(o,"main");
      out.push({kind:"facadeFan",o,key,X,Y,rect,box,depth:(box.x0+box.x1+box.y0+box.y1)/2,
        zo:(W.piece(o).z_order||0)+0.01,sid:o.id+"/fan"});
    }
  };
  H.drawFan = function (ctx,d) {
    const o = d.o, alpha = o.alpha.main == null ? 1 : o.alpha.main;
    ctx.save(); ctx.strokeStyle = `rgba(40,44,50,${0.85*alpha})`; ctx.lineWidth = 1.6;
    for (let i=0;i<3;i++) {
      const a=SP.now*14+i*2.094, p=W.local(o,-0.12,-0.44,0.28),q=W.local(o,-0.12+0.17*Math.cos(a),-0.44,0.28+0.17*Math.sin(a));
      ctx.beginPath();ctx.moveTo(SP.sx(p[0],p[1]),SP.sy(p[0],p[1],p[2]));ctx.lineTo(SP.sx(q[0],q[1]),SP.sy(q[0],q[1],q[2]));ctx.stroke();
    }
    ctx.restore();
  };
  H.paneFacade = function (o) {
    if (!o || W.interior || SP.tint.night <= 0.35) return null;
    for (const k in H.facades) { if (!Object.prototype.hasOwnProperty.call(H.facades, k)) continue; const f = H.facades[k]; if (f.balcony === o.id && f.glassPanes && H.unit(f.unit).lit) return f; }   // perf: no array per call
    return null;
  };
  /** Called at the balcony's own painter position for both colour and emissive passes. */
  H.drawPane = function (ctx, d, alpha, emission) {
    const f = H.paneFacade(d.o); if (!f) return false;
    const frame = SP.frame(d.key); if (!frame) return false;
    const X = d.X - frame[4], Y = d.Y - frame[5];
    ctx.save();
    ctx.fillStyle = emission ? `rgba(255,218,150,${0.58*alpha})` : `rgba(255,209,137,${Math.min(0.26,0.15+0.11*SP.tint.night)*alpha})`;
    for (const poly of f.glassPanes) {
      ctx.beginPath(); poly.forEach((v,j)=>j?ctx.lineTo(X+v[0],Y+v[1]):ctx.moveTo(X+v[0],Y+v[1])); ctx.closePath(); ctx.fill();
    }
    ctx.restore(); return true;
  };
})();
