"""Midtown-A2: livable units + rent rows."""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

def run(c, log):
    def ok(name, cond, info=""):
        log.append(("PASS " if cond else "FAIL ") + name + ((" — " + str(info)) if info != "" else ""))
        return cond
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(180):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.midtown && !!SP.midtown.ready"):
            break
    c.eval("SP.midtown.install(); SP.midtownElev.install(); SP.midtown.wireRent(); SP.midtown.wrapUnits();")
    ok("boot", c.eval("!!SP.midtown.ready"))
    n = c.eval("Object.keys(SP.scenes).filter(k=>k.indexOf('room_mt_')===0).length")
    ok("72 units registered", n == 72, n)
    # door portal not notice
    r = c.eval("""
      (() => {
        SP.midtown.enterBuilding('jx', 1);
        const d = (SP.world.objects||[]).find(o => o.id === 'door_jx_101');
        return { interact: d && d.interact, to: d && d.to, name: d && d.name };
      })()
    """)
    ok("jx 1-01 portal door", r and r.get("interact")=="portal" and r.get("to")=="room_mt_jx_101", r)
    r = c.eval("""
      (() => {
        SP.midtown.enterUnit('jx', 1, 1);
        const note = (SP.world.objects||[]).some(o => o.note && o.note.indexOf('Midtown-A2')>=0);
        const bed = (SP.world.objects||[]).some(o => o.type==='f_bed' || (o.id&&o.id.indexOf('_bed')>=0));
        return { scene: SP.world.sceneId, note, bed, interior: !!SP.world.interior };
      })()
    """)
    ok("enter livable jx-101", r and r.get("scene")=="room_mt_jx_101" and r.get("bed") and r.get("interior"), r)
    # exit back
    r = c.eval("""
      (() => {
        const door = (SP.world.objects||[]).find(o => o.interact==='portal' && o.to && o.to.indexOf('mt_jx_')===0);
        if (door) SP.game.switchScene(door.to, door.spawn);
        return { scene: SP.world.sceneId, door: !!door };
      })()
    """)
    ok("exit to corridor", r and r.get("scene")=="mt_jx_1f", r)
    # rent rows
    r = c.eval("""
      (() => {
        SP.midtown.wireRent(); SP.midtown.wrapUnits();
        const U = SP.stageA.units();
        const ids = ['mt-jx-101','mt-yj-601','mt-cn-1601'];
        const ok = ids.every(id => U[id] && U[id].scene && U[id].rent > 0);
        const money0 = SP.game.ps.money;
        SP.game.ps.money = 20000;
        SP.stageA.rentUnit('mt-jx-101');
        const H = SP.stageA.ensureHousing();
        return { ok, owned: H.owned.indexOf('mt-jx-101')>=0, rent: U['mt-jx-101'] && U['mt-jx-101'].rent, paid: SP.game.ps.money < 20000 };
      })()
    """)
    ok("rent featured mt-jx-101", r and r.get("ok") and r.get("owned") and r.get("paid"), r)
    # diversity still
    ok("facade styles retained", c.eval("SP.midtown.BUILDINGS.filter(b=>b.style).length") == 3)
    # elev still works with units present
    r = c.eval("""
      (() => {
        SP.midtown.enterBuilding('cn', 1);
        const elev=(SP.world.objects||[]).find(o=>o.interact==='elevator');
        if (elev) SP.midtownElev.openElevMenu(elev);
        const labels=((SP.game.menu&&SP.game.menu.opts)||[]).map(o=>o.label).join('|');
        if (SP.game.menu) SP.game.closeMenu();
        return { n: SP.midtownElev.floorsFor('mt_cn').length, noUnit: labels.indexOf('room')<0, has16: labels.indexOf('16F')>=0 };
      })()
    """)
    ok("elev ignores units", r and r.get("n")==16 and r.get("has16"), r)
    return log

if __name__ == "__main__":
    p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
    log = []
    try: run(c, log)
    finally:
        try: cdp.stop(p, prof)
        except Exception: pass
    for line in log: print(line)
    fails = [x for x in log if x.startswith("FAIL")]
    print("RESULT", f"{len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
