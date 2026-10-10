"""Stage E: inventory, bus anim/skip, xin_102, night events."""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

def enter(c, scene):
    c.eval(f"""
      (() => {{
        const sp = (SP.scenes['{scene}'] && SP.scenes['{scene}'].spawn) || [2,1,'N'];
        SP.place.enter('{scene}', sp);
        if (SP.stageD) SP.stageD.syncCivicNpcs();
        return SP.world.sceneId;
      }})()
    """)
    time.sleep(0.12)

def run(c, log):
    def ok(name, cond, info=""):
        log.append(("PASS " if cond else "FAIL ") + name + ((" — " + str(info)) if info != "" else ""))
        return cond
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(100):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.stageE && !!SP.stageD"):
            break
    ok("boot stageE", c.eval("!!SP.stageE && !!SP.game.ps"))
    c.eval("SP.clock.setTimeName && SP.clock.setTimeName('day', true)")
    # inventory via civic
    enter(c, "civic_police")
    r = c.eval("""
      (() => {
        SP.game.ps.money = 800;
        SP.stageE.ensureBag();
        SP.stageD.ensure().police = {filed:false,stamped:false,finePaid:false,helped:false};
        SP.game.use(SP.world.byId.report_desk);
        const m = SP.game.menu;
        const a = m && m.opts.find(x => x.id==='report');
        if (a) a.fn();
        SP.game.closeMenu && SP.game.closeMenu();
        SP.game.use(SP.world.byId.filing2);
        const b = SP.game.menu && SP.game.menu.opts.find(x => x.id==='stamp');
        if (b) b.fn();
        SP.game.closeMenu && SP.game.closeMenu();
        return {
          receipt: SP.stageE.hasItem('police_receipt'),
          stamp: SP.stageE.hasItem('police_stamp'),
          bagN: SP.game.ps.bag.length
        };
      })()
    """)
    ok("bag police receipt", r and r.get("receipt"), r)
    ok("bag police stamp", r and r.get("stamp"))

    enter(c, "civic_hospital")
    r = c.eval("""
      (() => {
        SP.stageD.ensure().hospital = {registered:false,seen:false,script:null,bought:false};
        SP.game.use(SP.world.byId.nurse);
        const reg = SP.game.menu && SP.game.menu.opts.find(x => x.id==='reg'); if (reg) reg.fn();
        SP.game.closeMenu && SP.game.closeMenu();
        SP.game.use(SP.world.byId.doc_desk);
        const see = SP.game.menu && SP.game.menu.opts.find(x => x.id==='see'); if (see) see.fn();
        SP.game.closeMenu && SP.game.closeMenu();
        SP.game.use(SP.world.byId.pharm_c);
        const rx = SP.game.menu && SP.game.menu.opts.find(x => x.id==='rx'); if (rx) rx.fn();
        SP.game.closeMenu && SP.game.closeMenu();
        return { rx: SP.stageE.hasItem('rx_slip'), med: SP.stageE.hasItem('med_cold') };
      })()
    """)
    ok("bag rx slip", r and r.get("rx"), r)
    ok("bag medicine", r and r.get("med"))

    # xin_102 present + rent unit
    r = c.eval("""
      (() => {
        const sc = !!SP.scenes.room_xin_102;
        const U = SP.stageA.units();
        const u = U['1F-xin-b'];
        return { sc, rent: u && u.rent, scene: u && u.scene, label: u && u.label };
      })()
    """)
    ok("xin_102 scene", r and r.get("sc"), r)
    ok("rent 1F-xin-b", r and r.get("rent") == 1180 and r.get("scene") == "room_xin_102")

    enter(c, "room_xin_102")
    r = c.eval("""
      (() => ({
        scene: SP.world.sceneId,
        bay: !!(SP.world.byId.bay_glass_0 || SP.world.byId.bay_glass || SP.world.byId.bay_note),
        rack: !!SP.world.byId.rack
      }))()
    """)
    ok("xin_102 enter", r and r.get("scene") == "room_xin_102", r)
    ok("xin_102 balcony props", r and (r.get("bay") or r.get("rack")))

    # bus skip + anim API
    r = c.eval("""
      (() => {
        SP.place.enter('street', [-18, 3.5, 'S']);
        const fare = SP.stageA.busFare();
        const dest = SP.stageA.busStops.find(s => s.id === 'bus_stop_e');
        const money0 = SP.game.ps.money;
        SP.stageE.rideBus(dest, fare, SP.stageA.busRideMin(), 'skip');
        return {
          fare,
          paid: SP.game.ps.money === money0 - fare,
          at: Math.abs(SP.player.x - (dest.x+1.2)) < 0.2,
          hasAnim: typeof SP.stageE.rideBus === 'function'
        };
      })()
    """)
    ok("bus fare pay skip", r and r.get("paid"), r)
    ok("bus skip arrive", r and r.get("at"))

    # night event offer
    r = c.eval("""
      (() => {
        SP.clock.setTimeName && SP.clock.setTimeName('night', true);
        // force minute to :10 pattern via abs
        const abs = SP.clock.abs();
        const m = abs % 1440;
        // set to 22:10
        const target = Math.floor(abs / 1440) * 1440 + 22*60 + 10;
        if (SP.clock.skipTo) SP.clock.skipTo(target, 0.01);
        else SP.clock.min = 22*60+10;
        SP.stageE._nightDay = -1; SP.stageE._nightShown = {};
        SP.stageE.offerNightEvent('police');
        const menu = !!(SP.game.menu && SP.game.menu.opts && SP.game.menu.opts.some(o => o.id==='skip'));
        SP.game.closeMenu && SP.game.closeMenu();
        SP.stageE.offerNightEvent('clinic');
        const clinic = !!(SP.game.menu && SP.game.menu.opts && SP.game.menu.opts.some(o => o.id==='go'));
        SP.game.closeMenu && SP.game.closeMenu();
        return { menu, clinic, night: SP.stageD ? !SP.stageD.onDuty('police') : true };
      })()
    """)
    ok("night police event", r and r.get("menu"), r)
    ok("night clinic event", r and r.get("clinic"))

    # phone bag tab
    r = c.eval("""
      (() => {
        SP.stageA.openPhone('bag');
        const el = document.getElementById('phonepanel');
        const has = !!(el && el.innerHTML.indexOf('背包') >= 0);
        return { has, n: (SP.game.ps.bag||[]).length };
      })()
    """)
    ok("phone bag UI", r and r.get("has"), r)

    errs = [l for l in c.logs if l.get("method") == "Runtime.exceptionThrown"]
    ok("no JS exceptions", len(errs) == 0, errs[0] if errs else "")
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
    print(f"stageE_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
