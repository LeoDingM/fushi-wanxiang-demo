"""Stage D civic / phone / bus smoke checks."""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

def enter(c, scene):
    c.eval(f"""
      (() => {{
        const sp = (SP.scenes['{scene}'] && SP.scenes['{scene}'].spawn) || [2,1,'N'];
        SP.place.enter('{scene}', sp);
        if (SP.stageD && SP.stageD.syncCivicNpcs) SP.stageD.syncCivicNpcs();
        return SP.world.sceneId;
      }})()
    """)
    time.sleep(0.15)

def run(c, log):
    def ok(name, cond, info=""):
        log.append(("PASS " if cond else "FAIL ") + name + ((" — " + str(info)) if info != "" else ""))
        return cond
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(100):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.stageD && !!SP.stageA"):
            break
    ok("boot stageD", c.eval("!!SP.stageD && !!SP.game.ps"))
    c.eval("SP.clock.setTimeName && SP.clock.setTimeName('day', true)")
    enter(c, "civic_police")
    r = c.eval("""
      (() => {
        SP.game.ps.money = 500;
        SP.stageD.ensure();
        const o = SP.world.byId.report_desk;
        const af = SP.game.actionFor(o, 'use');
        SP.game.use(o);
        const m = SP.game.menu;
        const hasMenu = !!(m && m.opts && m.opts.length >= 3);
        if (m) { const a = m.opts.find(x => x.id==='report'); if (a && a.fn) a.fn(); }
        const filed = !!(SP.game.ps.civic && SP.game.ps.civic.police.filed);
        SP.game.closeMenu && SP.game.closeMenu();
        const st = SP.world.byId.filing2; SP.game.use(st);
        if (SP.game.menu) { const a = SP.game.menu.opts.find(x => x.id==='stamp'); if (a) a.fn(); }
        const stamped = !!(SP.game.ps.civic.police.stamped);
        SP.game.closeMenu && SP.game.closeMenu();
        SP.stageD.syncCivicNpcs();
        const npc = SP.actors.list.some(a => a.id === 'civic_cop');
        return { scene: SP.world.sceneId, interact: o && o.interact, af: af && af.label, hasMenu, filed, stamped, npc, onDuty: SP.stageD.onDuty('police'), min: SP.stageD.minOfDay() };
      })()
    """)
    ok("police scene", r and r.get("scene")=="civic_police", r)
    ok("police menu", r and r.get("hasMenu"))
    ok("police filed", r and r.get("filed"))
    ok("police stamp", r and r.get("stamped"))
    ok("police NPC daytime", r and r.get("npc"))

    enter(c, "civic_hospital")
    r = c.eval("""
      (() => {
        SP.game.ps.money = 500;
        SP.stageD.ensure().hospital = {registered:false,seen:false,script:null,bought:false};
        SP.game.use(SP.world.byId.nurse);
        if (SP.game.menu) { const a = SP.game.menu.opts.find(x => x.id==='reg'); if (a) a.fn(); }
        const reg = !!SP.game.ps.civic.hospital.registered;
        SP.game.closeMenu && SP.game.closeMenu();
        SP.game.use(SP.world.byId.doc_desk);
        if (SP.game.menu) { const a = SP.game.menu.opts.find(x => x.id==='see'); if (a) a.fn(); }
        const seen = !!SP.game.ps.civic.hospital.seen && !!SP.game.ps.civic.hospital.script;
        SP.game.closeMenu && SP.game.closeMenu();
        SP.game.use(SP.world.byId.pharm_c);
        if (SP.game.menu) { const a = SP.game.menu.opts.find(x => x.id==='rx'); if (a) a.fn(); }
        const med = !!SP.game.ps.civic.hospital.bought;
        SP.game.closeMenu && SP.game.closeMenu();
        return { scene: SP.world.sceneId, reg, seen, med };
      })()
    """)
    ok("hospital register", r and r.get("reg"), r)
    ok("hospital doctor", r and r.get("seen"))
    ok("hospital pharmacy", r and r.get("med"))

    enter(c, "civic_fire")
    r = c.eval("""
      (() => {
        SP.clock.setTimeName && SP.clock.setTimeName('day', true);
        SP.stageD.ensure().fire = {toured:false,drilled:false,safety:false};
        SP.game.use(SP.world.byId.duty);
        if (SP.game.menu) { const a = SP.game.menu.opts.find(x => x.id==='drill'); if (a) a.fn(); }
        const fire = !!SP.game.ps.flags.knowledge_extinguisher;
        SP.game.closeMenu && SP.game.closeMenu();
        SP.clock.setTimeName && SP.clock.setTimeName('night', true);
        const off = SP.stageD.onDuty('fire') === false;
        const msg = SP.game.use(SP.world.byId.duty);
        const offMsg = typeof msg === 'string' && msg.indexOf('夜间') >= 0;
        return { fire, off, offMsg, msg, min: SP.stageD.minOfDay() };
      })()
    """)
    ok("fire drill flag", r and r.get("fire"), r)
    ok("fire night off", r and r.get("off"))
    ok("fire night message", r and r.get("offMsg"))

    r = c.eval("""
      (() => {
        SP.clock.setTimeName && SP.clock.setTimeName('day', true);
        SP.stageA.openPhone('map');
        SP.stageD.markPoi('hospital');
        const map = !!(SP.game.ps.navTarget && SP.game.ps.navTarget.name.indexOf('医院')>=0);
        const fare = SP.stageA.busFare();
        const ride = SP.stageA.busRideMin();
        SP.stageA.boardBus({id:'bus_stop', name:'井槐里'});
        const busMenu = !!(SP.game.menu && SP.game.menu.opts.some(o => (o.label||'').indexOf('跳过车程')>=0));
        SP.game.closeMenu && SP.game.closeMenu();
        return { map, fare, ride, busMenu, god: typeof SP.stageA.openGod === 'function' };
      })()
    """)
    ok("phone map mark", r and r.get("map"), r)
    ok("bus fare=2", r and r.get("fare")==2, r and r.get("fare"))
    ok("bus ride min", r and r.get("ride")==6, r and r.get("ride"))
    ok("bus skip option", r and r.get("busMenu"))
    ok("god F1 still exposed", r and r.get("god"))

    errs = [l for l in c.logs if l.get("method") == "Runtime.exceptionThrown"]
    ok("no JS exceptions", len(errs) == 0, (errs[0] if errs else ""))
    return log

if __name__ == "__main__":
    p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
    log = []
    try:
        run(c, log)
    finally:
        p.kill()
        import shutil; shutil.rmtree(prof, ignore_errors=True)
    for line in log: print(line)
    fails = [l for l in log if l.startswith("FAIL")]
    print(f"stageD_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
