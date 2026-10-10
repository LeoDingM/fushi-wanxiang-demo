"""Households + electricity + metro integration playtest: per-unit window lights follow the household simulation, knock
answers follow the same unit's state, 2F-02 keeps its switches when left (its facade window stays lit, kWh keep
accruing), the bill / meter view, and the 井槐里站 metro module (enter, CBD placeholder, ride back, touch no-op)."""
import sys, time, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import cdp

def run(c, log):
    E = c.eval; J = lambda s: json.loads(E(s))
    def ok(name, cond, info=""):
        log.append(("PASS " if cond else "FAIL ") + name + (" — " + str(info) if info != "" else "")); return cond
    E("SP.actions.reset(); SP.clock.setTimeName('night', true); SP.actions.idle(0.5)")
    w = J("""(() => { const W = SP.world, H = SP.households, res = W.objects.filter(o => o.type === 'f_window' && H.unitOf(o));
      const lit = (m) => { SP.clock.min = m; SP.clock.computeAmbient(); H.invalidate(); return res.filter(o => W.shownState(o) === 'lit').map(o => o.id); };
      const a = lit(21 * 60), b = lit(3 * 60); const units = new Set(res.map(o => H.unitOf(o)));
      // every window of one unit agrees
      SP.clock.min = 21 * 60; H.invalidate(); let agree = true; const by = {}; for (const o of res) { const u = H.unitOf(o), s = W.shownState(o) === 'lit'; if (s && !H.unit(u).lit) agree = false; }
      const ratios = []; for (let d = 0; d < 6; d++) { SP.clock.day += 1; SP.clock.min = 21 * 60; H.invalidate(); ratios.push(+(res.filter(o => W.shownState(o) === 'lit').length / res.length).toFixed(2)); }
      const byB = {}; for (const o of res) { const b = H.unitOf(o).split('_').slice(0, -1).join('_'); (byB[b] = byB[b] || [0, 0])[1]++; if (W.shownState(o) === 'lit') byB[b][0]++; }
      const bs = Object.values(byB).filter(v => v[1] > 12).map(v => v[0] / v[1]); SP.clock.day -= 6;
      return JSON.stringify({ n: res.length, units: units.size, eve: a.length, late: b.length, agree, ratios, bmin: +Math.min(...bs).toFixed(2), bmax: +Math.max(...bs).toFixed(2) }); })()""")
    ok("households: residential windows map to units; lights follow schedules (21:00 ~55-65% over 6 days, varies by building; 3 am few)",
       w["units"] > 30 and 0 < w["late"] < w["eve"] < w["n"] and w["agree"] and all(0.5 <= r <= 0.7 for r in w["ratios"]) and w["bmax"] - w["bmin"] > 0.15, w)
    # 2F-02: light on, leave, facade lit, kWh accrue 8 h
    p = J("""(() => { const G = SP.game; SP.clock.min = 20 * 60; G.go({ to: 'room_2f02', spawn: SP.scenes.room_2f02.spawn }); SP.actions.idle(0.8);
      const W = SP.world, L = W.byId.room_light; W.setState(L, 'on'); W.setState(W.byId.desk, 'off'); W.setState(W.byId.nightstand, 'off'); G.syncPower();
      G.switchScene('street'); SP.actions.idle(0.5); SP.households.invalidate();
      const facade = W.shownState(W.byId.win_S2F_3), k0 = (G.ps.power.kwh.ceiling_light || 0), on = Object.keys(G.ps.power.on);
      return JSON.stringify({ facade, k0, on, scene: W.sceneId }); })()""")
    ok("2F-02: ceiling light left on -> street facade window win_S2F_3 lit, meter still running", p["facade"] == "lit" and "ceiling_light" in p["on"], p)
    E("SP.clock.skipTo((SP.clock.min + 480) % 1440, 1.5)"); E("SP.actions.idle(2.2)")
    k = J("JSON.stringify({ k: SP.game.ps.power.kwh.ceiling_light, ff: !!SP.clock.ff })")
    ok("power: light left on 8 h adds ~0.12 kWh (15 W)", abs(k["k"] - p["k0"] - 0.12) < 0.012 and not k["ff"], {"dk": k["k"] - p["k0"]})
    b = J("""(() => { const pv = SP.game.rules.utilities.preview(SP.game.ps), P = pv.lines.find(l => l.id === 'power');
      SP.game.meterCard(); const card = [...document.querySelectorAll('#paystack .pay')].pop();
      return JSON.stringify({ qty: P.qty, amt: P.amount, by: P.by.ceiling_light, card: card ? card.textContent.slice(0, 160) : '' }); })()""")
    ok("bill: power line from metered kWh (incl. the light), meter card shows it", b["by"] >= 0.12 and b["amt"] > 0 and "度" in b["card"], b)
    s = J("""(() => { SP.game.go({ to: 'room_2f02', spawn: SP.scenes.room_2f02.spawn }); SP.actions.idle(0.8); const W = SP.world;
      const kept = W.byId.room_light.state; W.setState(W.byId.room_light, 'off'); SP.game.syncPower(); SP.game.switchScene('street'); SP.actions.idle(0.3); SP.households.invalidate();
      SP.clock.min = 21 * 60; SP.clock.computeAmbient(); return JSON.stringify({ kept, facade: W.shownState(W.byId.win_S2F_3), on: Object.keys(SP.game.ps.power.on) }); })()""")
    ok("2F-02: switch state kept across visits; light off -> facade dark, meter stops", s["kept"] == "on" and s["facade"] != "lit" and "ceiling_light" not in s["on"], s)
    # knock answers follow the unit's state
    kn = J("""(() => { const G = SP.game, H = SP.households, real = H.state, out = {};
      G.go({ to: 'stair_2f', spawn: SP.scenes.stair_2f.spawn }); SP.actions.idle(0.8);
      const d = SP.world.objects.find(o => o.interact === 'neighbor_door' && o.name === '2F-01');
      for (const st of ['home', 'out', 'asleep']) { H.state = () => ({ st }); const n0 = SP.world.log.length; G.knock(d); SP.actions.idle(2.2); out[st] = SP.world.log.slice(n0).map(e => e.text || e.msg || String(e)).join(' | ').slice(0, 90); }
      H.state = real; const u = 'b12_' + d.name, real_st = real(u).st; G.knock(d); SP.actions.idle(0.1);
      return JSON.stringify(Object.assign(out, { door: d.name, real: real_st, last: G.lastKnock.st })); })()""")
    ok("knock: answer follows the unit (home answers, out silent, asleep mostly silent / grumpy)",
       kn["home"] and "没人应" not in kn["home"] and ("没人" in kn["out"] or "不在" in kn["out"] or kn["out"]) and kn["last"] == kn["real"], kn)
    # metro
    E("SP.game.switchScene('street'); SP.clock.setTimeName('afternoon', true); SP.actions.idle(0.5)")
    m = J("""(() => { const W = SP.world, o = W.byId.metro_jhl; const hrs = o.hours.join('-'); SP.game.use(o); SP.actions.idle(0.3);
      const a = SP.metroActive, vis = document.getElementById('metro').style.display;
      window.FushiMetro.core.leave('cbd', { exit: 'B' }); return JSON.stringify({ hrs, a, vis }); })()""")
    time.sleep(0.3)
    for _ in range(80):
        if E("!!(SP.cbd && SP.cbd.active && SP.cbd.ready)"): break
        time.sleep(0.25)
    for _ in range(3): E("window.__proto.step(1/60, 10)")
    q = J("""(() => { const C = SP.cbd, P = SP.player; const e = C.player === P, at = [+P.x.toFixed(1), +P.y.toFixed(1)], spB = (window.CBD_SCENE.exits.find(x => x.id === 'B') || {}).spawn;
      return JSON.stringify({ active: C.active, metro: !!SP.metroActive, shared: e, at, spB: spB && spB.slice(0, 2), zoom: +C.cam.zoom.toFixed(2), act: SP.actions.skyline ? 1 : 0, fb: document.getElementById('floorbadge').textContent, frames: C.stats.drawn, stub: !!(SP.places.cbd && SP.places.cbd._stub) }); })()""")
    ok("cbd: metro exit B -> 云汇CBD at exit B spawn (shared 李默, no stub)",
       q["active"] and not q["metro"] and q["shared"] and not q["stub"] and q["spB"] and abs(q["at"][0] - q["spB"][0]) < 1.5 and abs(q["at"][1] - q["spB"][1]) < 1.5 and q["act"] and "CBD" in q["fb"] and q["frames"], q)
    t = J("""(() => { const m0 = SP.clock.abs(); window.__proto.step(1/60, 120); return JSON.stringify({ dm: +(SP.clock.abs() - m0).toFixed(2) }); })()""")
    ok("cbd: core clock keeps running inside the CBD", t["dm"] > 0, t)
    E("SP.cbd.zoomTo(0.026, null, null, true); window.__proto.step(1/60, 30)")
    sk = J("JSON.stringify({ z: SP.cbd.cam.zoom, drawn: SP.cbd.stats.drawn })")
    ok("cbd: skyline zoom-out renders (LOD)", sk["z"] < 0.05 and sk["drawn"] > 0, sk)
    E("SP.cbd.zoomTo(0.5, null, null, true); window.__proto.step(1/60, 5)")
    r = J("""(() => { const C = SP.cbd, e = window.CBD_SCENE.exits.find(x => x.id === 'C'); C._.useExit(e); return JSON.stringify({ cbd: C.active, metro: !!SP.metroActive, actsRestored: !SP.actions.skyline }); })()""")
    ok("cbd: exit C -> metro, core hooks restored", not r["cbd"] and r["metro"] and r["actsRestored"], r)
    m.update(J("""(() => { const o = SP.world.byId.metro_jhl;
      window.FushiMetro.core.leave('street', {}); SP.actions.idle(0.3); const P = SP.player;
      return JSON.stringify({ after: SP.metroActive, d: Math.hypot(P.x - o.reach[0], P.y - o.reach[1]), scene: SP.world.sceneId }); })()"""))
    ok("metro: street return at entrance, metro inactive", not m["after"] and m["d"] < 0.05 and m["scene"] == "street", m)

if __name__ == "__main__":
    p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(100):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady"): break
    log = []
    try: run(c, log)
    finally:
        errs = [l for l in c.logs if l.get("method") == "Runtime.exceptionThrown"]
        log.append(("PASS" if not errs else "FAIL") + " stage6: no JS errors " + (json.dumps(errs[0])[:600] if errs else ""))
        print("\n".join(log)); p.kill()
