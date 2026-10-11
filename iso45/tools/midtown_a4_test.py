"""Midtown light polish: occupied→facade night glow / laundry + street door labels."""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

NIGHT = """
  SP.clock.setTimeName && SP.clock.setTimeName('night', true);
  SP.clock.computeAmbient && SP.clock.computeAmbient();
  if (SP.tint) SP.tint.night = Math.max(0.8, SP.clamp((SP.clock.dark - 0.2) / 0.4, 0, 1));
"""

def run(c, log):
    def ok(name, cond, info=""):
        log.append(("PASS " if cond else "FAIL ") + name + ((" — " + str(info)) if info != "" else ""))
        return cond
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(180):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.midtown && !!SP.midtown.ready"):
            break
    c.eval("SP.midtown.install(); SP.midtown.wrapHouseholds(); SP.midtown.wrapRentHooks(); SP.midtown.wireRent(); SP.midtown.wrapUnits();")

    ok("boot polish APIs", c.eval("!!SP.midtown.syncFacadeOccupied && !!SP.midtown.labelStreetDoors"))
    ok("SCENE_CHUNKS midtown preloaded", c.eval("!!(window.SCENE_CHUNKS && window.SCENE_CHUNKS.midtown)"))

    r = c.eval("""
      (() => {
        SP.actions.go('street',[110,2,'N']);
        SP.player.x=110; SP.player.y=2;
        SP.midtown.loadChunk();
        if (SP.chunks && SP.chunks.loadAll) SP.chunks.loadAll();
        SP.midtown.loadChunk();
        SP.midtown.labelStreetDoors();
        const d = SP.world.byId.mt_jx_door;
        return {
          mid: !!(SP.world.chunksIn && SP.world.chunksIn.midtown),
          plate: d && d.plate,
          has: d && String(d.plate).indexOf('精选在租')>=0,
          nMt: (SP.world.objects||[]).filter(o=>(o.fade_group||'').indexOf('mt_')===0).length
        };
      })()
    """)
    ok("street door featured label", r and r.get("has") and r.get("mid"), r)

    r = c.eval(f"""
      (() => {{
        SP.game.ps.money = 20000;
        const H = SP.stageA.ensureHousing();
        H.owned = H.owned.filter(id => !SP.midtown.isMidtownRentId(id));
        SP.stageA.rentUnit('mt-jx-502');
        SP.midtown.syncFacadeOccupied();
        {NIGHT}
        const wins = (SP.world.objects||[]).filter(o => o.type==='f_window' && o.fade_group==='mt_jx' && /S5F_/.test(o.id));
        const litShow = wins.filter(o => SP.world.shownState(o)==='lit').length;
        const balc = (SP.world.objects||[]).filter(o => o.type==='f_balcony' && o.fade_group==='mt_jx' && /S5F_/.test(o.id));
        const laundry = balc.filter(o => o.state==='laundry').length;
        const sample = wins.slice(0,2).map(o => ({{ id:o.id, unit:SP.households.unitOf(o), wLit:SP.households.windowLit(o), shown:SP.world.shownState(o), night:SP.tint.night }}));
        return {{ litShow, laundry, balcN: balc.length, nWin: wins.length, sample, dark: SP.clock.dark }};
      }})()
    """)
    ok("jx occupied → night glow", r and r.get("litShow") > 0, r)
    ok("jx transitional laundry hint", r and r.get("laundry") > 0, r)

    r = c.eval(f"""
      (() => {{
        SP.stageA.rentUnit('mt-yj-601');
        SP.midtown.syncFacadeOccupied();
        {NIGHT}
        const wins = (SP.world.objects||[]).filter(o => o.type==='f_window' && o.fade_group==='mt_yj' && /S6F_/.test(o.id));
        const litShow = wins.filter(o => SP.world.shownState(o)==='lit').length;
        const balc = (SP.world.objects||[]).filter(o => o.type==='f_balcony' && o.fade_group==='mt_yj' && /S6F_/.test(o.id));
        const laundry = balc.filter(o => o.state==='laundry').length;
        return {{ litShow, laundry, balcN: balc.length }};
      }})()
    """)
    ok("yj glass glow without laundry", r and r.get("litShow") > 0 and r.get("laundry")==0, r)

    r = c.eval(f"""
      (() => {{
        SP.stageA.leaveUnit('mt-jx-502');
        SP.midtown.syncFacadeOccupied();
        {NIGHT}
        const wins = (SP.world.objects||[]).filter(o => o.type==='f_window' && o.fade_group==='mt_jx' && /S5F_/.test(o.id));
        const litShow = wins.filter(o => SP.world.shownState(o)==='lit').length;
        return {{ litShow }};
      }})()
    """)
    ok("leave clears jx glow", r and r.get("litShow")==0, r)

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
