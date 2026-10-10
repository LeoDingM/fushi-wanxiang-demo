"""Stage 5 street-extension playtest: chunk streaming (east chunk in / out, states remembered, colliders), the small
eateries (面馆 / 快餐 / 奶茶: open hours, buy via shared-rules prices), the 井槐里站 metro entrance (prompt, hours, hook)."""
import sys, time, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import cdp

def run(c, log):
    E = c.eval; J = lambda s: json.loads(E(s))
    def ok(name, cond, info=""):
        log.append(("PASS " if cond else "FAIL ") + name + (" — " + str(info) if info != "" else "")); return cond
    E("SP.actions.reset(); SP.clock.setTimeName('afternoon', true); SP.actions.idle(0.5)")
    a = J("JSON.stringify({ chunks: SP.chunks.loaded(), n: SP.world.objects.length })")
    ok("chunks: east chunk not loaded at the 12号 door", a["chunks"] == [], a)
    E("SP.player.x = 40.0; SP.player.y = 2.0; SP.actions.idle(1.2)"); time.sleep(0.6); E("SP.actions.idle(0.3)")   # the chunk script loads asynchronously
    b = J("JSON.stringify({ chunks: SP.chunks.loaded(), n: SP.world.objects.length, eat: !!SP.world.byId['nb_e1_S1F_0_eat'], cols: SP.world.chunkCols.length })")
    ok("chunks: walking east streams the east chunk in (objects + colliders)", b["chunks"] == ["east"] and b["eat"] and b["n"] > a["n"] + 300 and b["cols"] > 0, b)
    # eateries
    r = J("""(() => { const W = SP.world, o = W.byId['nb_e1_S1F_0_eat'], P = SP.player, p = W.reachPt(o); P.x = p[0]; P.y = p[1]; P.setDir('N'); SP.actions.idle(0.2);
      const lab = W.actionFor(o, 'use'), m0 = SP.game.ps.money, h0 = SP.game.ps.needs.hunger; SP.game.ps.needs.hunger = 30;
      let k = 0; while (SP.state.near !== o && k++ < 6) { SP.cycleTarget(); SP.actions.idle(0.02); }
      SP.actions.interact(); SP.actions.idle(0.1); if (SP.game.menu) SP.game.pick(SP.game.menu.opts.findIndex(x => x.ok));
      SP.actions.idle(4); return JSON.stringify({ near: SP.state.near && SP.state.near.id, lab: lab && lab.label, spent: m0 - SP.game.ps.money, hunger: SP.game.ps.needs.hunger }); })()""")
    ok("eatery: 兰州牛肉面 counter order (shared-rules price, hunger up)", r["spent"] > 0 and r["hunger"] > 50, r)
    t = J("""(() => { const W = SP.world, o = W.byId['nb_e4_S1F_1_eat'] || null; if (!o) return JSON.stringify({ missing: true });
      SP.clock.setTimeName('night', true); SP.actions.idle(0.3); SP.clock.skipTo(23 * 60 + 40, 0.1); SP.actions.idle(0.6); const shut = o.state; const lab = W.actionFor(o, 'use');
      return JSON.stringify({ shut, lab: lab && lab.label }); })()""")
    ok("eatery: 茶语奶茶 is shut after hours with a clear prompt", t.get("shut") == "shut" and "打烊" in (t.get("lab") or ""), t)
    # metro entrance
    m = J("""(() => { SP.clock.setTimeName('afternoon', true); SP.actions.idle(0.5); const W = SP.world, o = W.byId.metro_jhl, P = SP.player;
      P.x = o.reach[0]; P.y = o.reach[1]; P.setDir('E'); SP.actions.idle(0.3); const lab = W.actionFor(o, 'use');
      let k = 0; while (SP.state.near !== o && k++ < 6) { SP.cycleTarget(); SP.actions.idle(0.02); }
      return JSON.stringify({ near: SP.state.near && SP.state.near.id, lab: lab && lab.label, state: o.state }); })()""")
    ok("metro: 井槐里站 entrance targetable from its mouth, prompt shown", m["near"] == "metro_jhl" and "井槐里站" in (m["lab"] or ""), m)
    # unload + remember state
    u = J("""(() => { const W = SP.world, w = W.objects.find(o => o._chunk === 'east' && o.type === 'f_window' && o.state === 'intact');
      W.setState(w, 'broken'); const id = w.id; SP.player.x = -20; SP.player.y = 2; SP.cam.zoom = SP.cam.zt = 1; SP.actions.idle(1.5); const gone = SP.chunks.loaded().length === 0 && !W.byId[id];
      SP.player.x = 44; SP.player.y = 2; SP.actions.idle(1.2); return JSON.stringify({ gone, back: W.byId[id] && W.byId[id].state }); })()""")
    ok("chunks: leaving drops the chunk, returning restores it with remembered damage", u["gone"] and u["back"] == "broken", u)
    E("SP.actions.reset(); SP.actions.idle(0.5)")
    ok("chunks: reset clears streamed chunks", E("SP.chunks.loaded().length") == 0)

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
        log.append(("PASS" if not errs else "FAIL") + " stage5: no JS errors " + (json.dumps(errs[0])[:600] if errs else ""))
        print("\n".join(log)); p.kill()
