"""Stage Char-A appearance / civic-look smoke checks (CDP).
python3 tools/appearance_test.py"""
import os, sys, time, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

def ok(log, name, cond, info=""):
    log.append(("PASS " if cond else "FAIL ") + name + ((" — " + str(info)) if info != "" else ""))
    return cond

def run(c, log):
    c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(100):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady || !!(window.SP && SP.player)"):
            break
    time.sleep(0.8)
    c.eval("SP.clock && SP.clock.setTimeName && SP.clock.setTimeName('day', true)")

    ok(log, "appearance API present", c.eval("!!(SP.appearance && SP.appearance.randomNpc && SP.appearance.resolveAtlas)"))
    ok(log, "civic atlases registered", c.eval("!!(window.ACTORS && ACTORS.police && ACTORS.firefighter && ACTORS.nurse)"))

    # randomNpc + child scale
    r = c.eval("""
      (() => {
        const a = SP.appearance.randomNpc(42, { job: 'police' });
        const b = SP.appearance.randomNpc(7, { ageBand: 'child', job: 'civilian' });
        return { job: a.job, atlas: SP.appearance.resolveAtlas(a), childScale: (SP.appearance.applyToActor({set:'office'}, b) || {}).drawScale };
      })()
    """)
    ok(log, "randomNpc police atlas", r and r.get("job") == "police" and r.get("atlas") == "police", r)
    ok(log, "child drawScale ~0.62", r and abs((r.get("childScale") or 0) - 0.62) < 0.05, r)

    # wardrobe persist
    w = c.eval("""
      (() => {
        SP.appearance.setOutfitId('uniform');
        const id = SP.appearance.getOutfitId();
        const set = SP.player && SP.player.atlasName && SP.player.atlasName();
        return { id, flag: SP.game.ps.flags && SP.game.ps.flags.outfitId, set };
      })()
    """)
    ok(log, "wardrobe uniform flag", w and w.get("id") == "uniform" and w.get("flag") == "uniform", w)
    c.eval("SP.appearance.setOutfitId('casual')")

    # civic NPC sets
    c.eval("SP.place.enter('civic_police', (SP.scenes.civic_police&&SP.scenes.civic_police.spawn)||[3,3,'W']); SP.stageD.syncCivicNpcs && SP.stageD.syncCivicNpcs();")
    time.sleep(0.4)
    cop = c.eval("(() => { const a=SP.actors.list.find(x=>x.id==='civic_cop'); return a && { set:a.set, atlas:a.atlasName && a.atlasName(), kind:a.civicKind }; })()")
    ok(log, "police NPC uses police atlas", cop and (cop.get("set") == "police" or cop.get("atlas") == "police"), cop)

    c.eval("SP.place.enter('civic_fire', (SP.scenes.civic_fire&&SP.scenes.civic_fire.spawn)||[2,5,'S']); SP.stageD.syncCivicNpcs && SP.stageD.syncCivicNpcs();")
    time.sleep(0.4)
    ff = c.eval("(() => { const a=SP.actors.list.find(x=>x.id==='civic_firefighter'); return a && { set:a.set, atlas:a.atlasName && a.atlasName() }; })()")
    ok(log, "firefighter NPC uses firefighter atlas", ff and (ff.get("set") == "firefighter" or ff.get("atlas") == "firefighter"), ff)

    c.eval("SP.place.enter('civic_hospital', (SP.scenes.civic_hospital&&SP.scenes.civic_hospital.spawn)||[5,3,'W']); SP.stageD.syncCivicNpcs && SP.stageD.syncCivicNpcs();")
    time.sleep(0.4)
    nu = c.eval("(() => { const a=SP.actors.list.find(x=>x.id==='civic_nurse'); return a && { set:a.set, atlas:a.atlasName && a.atlasName() }; })()")
    ok(log, "nurse NPC uses nurse atlas", nu and (nu.get("set") == "nurse" or nu.get("atlas") == "nurse"), nu)

    # street extras + modern facade portal
    c.eval("SP.place.enter('street', [-36, -5, 'N']); if(SP.charC){SP.charC._forceRespawn=true;SP.charC.spawnStreetCrowd();} else if(SP.civicLook&&SP.civicLook.spawnExtras) SP.civicLook.spawnExtras();")
    time.sleep(0.5)
    ex = c.eval("SP.actors.list.filter(a=>a.extraNpc).length")
    ok(log, "street extras spawned (2+)", isinstance(ex, int) and ex >= 2, ex)  # Char-C expands female crowd

    shop = c.eval("""
      (() => {
        const o = (SP.world.byId && SP.world.byId.civic_police_S1F_1_shop)
          || (SP.world.objects||[]).find(x => x.id==='civic_police_S1F_1_shop');
        return o && { type:o.type, interact:o.interact, name:o.name };
      })()
    """)
    ok(log, "police facade is glass shop portal", shop and shop.get("type") == "f_shop" and shop.get("interact") == "civic", shop)

    # stage D API still present
    ok(log, "stageD policeMenu still present", c.eval("!!(SP.stageD && SP.stageD.policeMenu && SP.stageD.NPC_SPEC)"))
    ok(log, "stageF presentItem still present", c.eval("!!(SP.stageF && SP.stageF.presentItem)"))

if __name__ == "__main__":
    p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable"); log = []
    try:
        run(c, log)
    finally:
        print("\n".join(log)); p.kill()
    failed = [l for l in log if l.startswith("FAIL")]
    sys.exit(1 if failed else 0)
