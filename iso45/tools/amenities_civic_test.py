"""Amenities-Civic: canteen / kindergarten / property."""
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
        if c.eval("!!window.__protoReady && !!SP.amenityCivic"): break
    c.eval("SP.amenityCivic.install && SP.amenityCivic.install()")
    ok("boot", c.eval("!!SP.amenityCivic && !!SP.amenityCivic.installed"))
    st = c.eval("SP.amenityCivic.status()")
    ok("three civic gates", isinstance(st, list) and len(st) >= 3, st)
    ok("no NPC spawn API", c.eval("!SP.amenityCivic.spawnNpcs && !SP.amenityCivic.NPC_SPEC"))

    # facade variety: different primary kit types on gates
    r = c.eval("""
      (() => {
        const ids = ['civic_canteen_gate','civic_kinder_gate','civic_prop_gate'];
        const types = ids.map(id => (SP.world.byId[id]||{}).type);
        return { types, uniq: new Set(types).size };
      })()
    """)
    ok("facade kit variety", r and r.get("uniq") >= 2, r)

    r = c.eval("""
      (() => {
        SP.game.ps.money = Math.max(SP.game.ps.money, 80);
        const dine = SP.amenityCivic.price('staff_meal', 8);
        const pack = SP.amenityCivic.price('bento', 14);
        SP.amenityCivic.enterCanteen();
        const sid = SP.world.sceneId;
        const a = SP.amenityCivic.buyMeal('dine');
        const b = SP.amenityCivic.buyMeal('pack');
        const bag = SP.stageE.ensureBag();
        const hit = bag.some(x => String(x.id).indexOf('canteen_')===0);
        const npcs = (SP.actors.list||[]).filter(a => a && a.id && String(a.id).indexOf('civicnpc_')===0);
        return { sid, dine, pack, aok: a.ok, bok: b.ok, hit, npcs: npcs.length };
      })()
    """)
    ok("canteen dine/pack → bag", r and r.get("sid")=="canteen_jhl" and r.get("aok") and r.get("bok") and r.get("hit") and r.get("npcs")==0, r)

    r = c.eval("""
      (() => {
        const k = SP.amenityCivic.kinderPickup();
        const actors = (SP.actors.list||[]).filter(a => a && !a.isPlayer);
        const kids = actors.filter(a => /child|kinder|幼儿|schoolnpc/i.test(String(a.id||'')+String(a.civicName||'')));
        return { ok: k.ok, kids: kids.length, note: k.note };
      })()
    """)
    ok("kinder pickup no NPC", r and r.get("ok") and r.get("kids")==0, r)

    r = c.eval("""
      (() => {
        SP.game.ps.money = Math.max(SP.game.ps.money, 100);
        SP.amenityCivic.enterProperty();
        const sid = SP.world.sceneId;
        const before = (SP.game.ps.gateTickets||[]).length;
        const fee = SP.amenityCivic.propertyFee();
        const rep = SP.amenityCivic.reportRepair('楼道灯');
        const after = (SP.game.ps.gateTickets||[]).length;
        return { sid, fee: !!(fee && fee.ok), rep: !!(rep && rep.ok), grew: after > before, tid: rep && rep.ticket && rep.ticket.id };
      })()
    """)
    ok("property fee + repair ticket", r and r.get("sid")=="propcenter_jhl" and r.get("fee") and r.get("rep") and r.get("grew"), r)
    return log

if __name__ == "__main__":
    p, prof, ws = cdp.start()
    try:
        c = cdp.CDP(ws); c.call("Runtime.enable")
        log = []; run(c, log)
        for line in log: print(line)
        fails = sum(1 for x in log if x.startswith("FAIL"))
        print(f"amenities_civic_test {len(log)-fails}/{len(log)}" + (" PASS" if not fails else " FAIL"))
        sys.exit(1 if fails else 0)
    finally:
        p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
