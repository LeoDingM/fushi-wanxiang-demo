"""Midtown-A: east strip connection + elevators + stairs/fire."""
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
    c.eval("if (SP.midtown && SP.midtown.install) SP.midtown.install(); if (SP.midtownElev && SP.midtownElev.install) SP.midtownElev.install();")

    ok("boot midtown", c.eval("!!SP.midtown && !!SP.midtown.ready && !!SP.midtownElev"))
    ok("axis east", c.eval("SP.midtown.AXIS") == "east")
    n = c.eval("SP.midtown._scenes || Object.keys(window.MIDTOWN_SCENES||{}).length")
    ok("scenes registered", isinstance(n, (int, float)) and n >= 72, n)

    # connection: warp to seam, load chunk
    r = c.eval("""
      (() => {
        SP.actions.go('street', [104, 2.2, 'E']);
        SP.midtown.loadChunk();
        const W = SP.world;
        return {
          scene: W.sceneId,
          x: SP.player.x,
          mid: !!(W.chunksIn && W.chunksIn.midtown),
          door: !!(W.byId && W.byId.mt_jx_door),
          bounds: W.data && W.data.bounds && W.data.bounds.x1
        };
      })()
    """)
    ok("east seam + chunk", r and r.get("mid") and r.get("x") >= 100 and r.get("bounds") >= 150, r)

    # enter 景秀苑 1F lobby, open elevator
    r = c.eval("""
      (() => {
        SP.midtown.enterBuilding('jx', 1);
        const W = SP.world;
        const elev = (W.objects || []).find(o => o.interact === 'elevator');
        if (elev) SP.game.use(elev);
        const menu = SP.game.menu;
        const labels = (menu && menu.opts || []).map(o => o.label).join('|');
        const floors = SP.midtownElev.floorsFor('mt_jx');
        return {
          scene: W.sceneId,
          floor: W.data && W.data.floor,
          elev: !!elev,
          menu: !!(menu && menu.opts && menu.opts.length >= 7),
          has8: labels.indexOf('8F') >= 0,
          nFloors: floors.length,
          title: menu && menu.o && (menu._name || (menu.o._name)) || (menu && menu.title) || ''
        };
      })()
    """)
    # menu title is on openMenu first arg._name — check opts
    ok("jx elevator lobby", r and r.get("scene") == "mt_jx_1f" and r.get("elev") and r.get("menu") and r.get("nFloors") == 8, r)

    # ride elev to 8F
    r = c.eval("""
      (() => {
        const opts = (SP.game.menu && SP.game.menu.opts) || [];
        const t = opts.find(o => o.label && o.label.indexOf('8F') >= 0);
        if (t) {
          if (t.go && SP.game.switchScene) SP.game.switchScene(t.go.to, t.go.spawn);
          else { SP.game.pick(opts.indexOf(t)); SP.midtown.flushGo(); }
        }
        return { scene: SP.world.sceneId, floor: SP.world.data && SP.world.data.floor };
      })()
    """)
    ok("elev to 8F", r and r.get("scene") == "mt_jx_8f" and r.get("floor") == 8, r)

    # stairs still work (8F has down flight)
    r = c.eval("""
      (() => {
        const stair = (SP.world.objects || []).find(o => o.interact === 'stairs');
        if (stair) SP.game.openFloorMenu(stair);
        const labels = ((SP.game.menu && SP.game.menu.opts) || []).map(o => o.label).join('|');
        if (SP.game.menu) SP.game.closeMenu();
        return { stair: !!stair, scoped: labels.indexOf('16F') < 0 && labels.indexOf('12F') < 0, has1: labels.indexOf('1F') >= 0, labels };
      })()
    """)
    ok("stairs scoped menu", r and r.get("stair") and r.get("scoped") and r.get("has1"), r)

    # fire exit
    r = c.eval("""
      (() => {
        SP.midtown.enterBuilding('jx', 3);
        const fire = (SP.world.objects || []).find(o => o.name === '消防通道' || (o.label && o.label.indexOf('消防') >= 0));
        if (fire) {
          if (fire.to && SP.game.switchScene) SP.game.switchScene(fire.to, fire.spawn);
          else { SP.game.use(fire); SP.midtown.flushGo(); }
        }
        return { scene: SP.world.sceneId, fire: !!fire };
      })()
    """)
    ok("fire shaft enter", r and r.get("scene") == "mt_jx_fire_3f", r)

    # taller buildings exist
    r = c.eval("""
      (() => {
        const a = !!SP.scenes.mt_yj_12f;
        const b = !!SP.scenes.mt_cn_16f;
        const e12 = (SP.scenes.mt_yj_1f.objects || []).some(o => o.interact === 'elevator');
        const e16 = (SP.scenes.mt_cn_1f.objects || []).some(o => o.interact === 'elevator');
        return { a, b, e12, e16 };
      })()
    """)
    ok("yj12 + cn16 elevators", r and r.get("a") and r.get("b") and r.get("e12") and r.get("e16"), r)

    # forbidden files untouched check (existence of midtown modules only)
    ok("ownership midtown modules", c.eval("!!SP.midtown && !!SP.midtownElev && typeof SP.midtown.enterBuilding === 'function'"))

    return log

if __name__ == "__main__":
    p, prof, ws = cdp.start()
    c = cdp.CDP(ws)
    c.call("Runtime.enable")
    log = []
    try:
        run(c, log)
    finally:
        try: cdp.stop(p, prof)
        except Exception: pass
    for line in log:
        print(line)
    fails = [x for x in log if x.startswith("FAIL")]
    print("RESULT", f"{len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
