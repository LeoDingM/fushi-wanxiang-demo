"""Midtown distinct 1LDK plans + balcony."""
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
    c.eval("SP.midtown.install(); SP.midtown.wireRent(); SP.midtown.wrapUnits();")

    r = c.eval("""
      (() => {
        const ids = ['room_mt_jx_101','room_mt_jx_502','room_mt_yj_601','room_mt_cn_801'];
        const plans = ids.map(id => SP.scenes[id] && SP.scenes[id].mt_plan);
        const uniq = [...new Set(plans)];
        const balc = ids.map(id => (SP.scenes[id].objects||[]).filter(o=>o.type==='i_balfront').length);
        const wash = ids.every(id => (SP.scenes[id].objects||[]).some(o=>o.type==='f_washer'));
        const rack = ids.every(id => (SP.scenes[id].objects||[]).some(o=>o.type==='i_dryrack'));
        // spatial: C larger bounds
        const c = SP.scenes.room_mt_yj_601;
        const b = c.bounds;
        const wide = Array.isArray(b) ? b[2] > 7.5 : (b && b.x1 > 7.5);
        // D has no dining
        const d = SP.scenes.room_mt_jx_502;
        const noDining = !(d.objects||[]).some(o => (o.id||'').endsWith('_dining') || o.id==='dining');
        return { plans, uniq, balc, wash, rack, wide, noDining, nUniq: uniq.length };
      })()
    """)
    ok("≥3 distinct plans in samples", r and r.get("nUniq") >= 3, r)
    ok("all samples have balcony glass", r and all(n >= 2 for n in (r.get("balc") or [])), r)
    ok("washer+rack on samples", r and r.get("wash") and r.get("rack"), r)
    ok("plan C larger footprint", r and r.get("wide"), r)
    ok("plan D no dining", r and r.get("noDining"), r)

    r = c.eval("""
      (() => {
        SP.midtown.enterUnit('yj',6,1);
        const balc=(SP.world.objects||[]).filter(o=>o.type==='i_balfront').length;
        const wash=(SP.world.objects||[]).some(o=>o.type==='f_washer');
        return { scene: SP.world.sceneId, plan: SP.world.data && SP.world.data.mt_plan, balc, wash, interior: !!SP.world.interior };
      })()
    """)
    ok("enter plan C unit live", r and r.get("scene")=="room_mt_yj_601" and r.get("balc")>=3 and r.get("wash"), r)

    r = c.eval("""
      (() => {
        const U = SP.stageA.units();
        return {
          jx: U['mt-jx-101'] && U['mt-jx-101'].type,
          yj: U['mt-yj-601'] && U['mt-yj-601'].type,
          rentC: U['mt-yj-601'] && U['mt-yj-601'].rent
        };
      })()
    """)
    ok("rent notes mention 方案", r and r.get("jx") and "方案" in r["jx"] and r.get("yj") and "方案C" in r["yj"], r)

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
