"""Amenities-Props: parcel / pharmacy bandage / charger / recycle."""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

def run(c, log):
    def ok(name, cond, info=""):
        log.append(("PASS " if cond else "FAIL ") + name + ((" — " + str(info)) if info != "" else ""))
        return cond
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(160):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.amenityProps"):
            break
    c.eval("if (SP.amenityProps && SP.amenityProps.install) SP.amenityProps.install()")
    ok("boot amenityProps", c.eval("!!SP.amenityProps && !!SP.amenityProps.installed"))
    r = c.eval("SP.amenityProps.status()")
    ok("four street stubs", isinstance(r, list) and len(r) >= 4, r)
    ok("no NPC spawn API", c.eval("!SP.amenityProps.spawnNpcs && !SP.amenityProps.NPC_SPEC"))

    r = c.eval("""
      (() => {
        SP.actions.go('street',[10.2,3.2,'N']);
        SP.player.x=10.2; SP.player.y=3.2;
        const before = (SP.stageE && SP.stageE.ensureBag) ? SP.stageE.ensureBag().length : 0;
        const p = SP.amenityProps.pickParcel();
        const after = SP.stageE.ensureBag();
        const hit = after.some(x => String(x.id).indexOf('parcel_jhl')===0);
        return { ok: p.ok, hit, before, after: after.length, label: p.label };
      })()
    """)
    ok("parcel → bag", r and r.get("ok") and r.get("hit"), r)

    r = c.eval("""
      (() => {
        SP.game.ps.money = Math.max(SP.game.ps.money, 50);
        SP.amenityProps.enterPharmacy();
        const sid = SP.world.sceneId;
        const r = SP.amenityProps.buyBandage(SP.game.ps);
        const bag = SP.stageE.ensureBag();
        const has = bag.some(x => x.id === 'med_band') || (SP.game.ps.items && SP.game.ps.items.med_band > 0);
        const actors = (SP.actors.list||[]).filter(a => a && !a.isPlayer);
        // pharmacy should not inject gendered street crowds
        const propNpcs = actors.filter(a => a.id && String(a.id).indexOf('propnpc_')===0);
        return { sid, buy: r.ok, has, propNpcs: propNpcs.length, money: SP.game.ps.money };
      })()
    """)
    ok("pharmacy buy bandage", r and r.get("sid")=="pharm_jhl" and r.get("buy") and r.get("has") and r.get("propNpcs")==0, r)

    r = c.eval("""
      (() => {
        SP.actions.go('street',[4.8,3.2,'N']);
        SP.game.ps.money = Math.max(SP.game.ps.money, 5);
        const c1 = SP.amenityProps.chargeOnce();
        const s1 = SP.amenityProps.sortTrash('recyclable');
        return { charge: c1.ok, sort: s1.ok, charges: SP.game.ps.amenityProps.charges, sorts: SP.game.ps.amenityProps.sorts };
      })()
    """)
    ok("charger + recycle stubs", r and r.get("charge") and r.get("sort"), r)

    ok("slideEast defined", c.eval("typeof SP.amenityProps.slideEast === 'function'"))
    return log

if __name__ == "__main__":
    p, prof, ws = cdp.start()
    try:
        c = cdp.CDP(ws); c.call("Runtime.enable")
        log = []; run(c, log)
        for line in log: print(line)
        fails = sum(1 for x in log if x.startswith("FAIL"))
        print(f"amenities_props_test {len(log)-fails}/{len(log)}" + (" PASS" if not fails else " FAIL"))
        sys.exit(1 if fails else 0)
    finally:
        p.kill()
        import shutil; shutil.rmtree(prof, ignore_errors=True)
