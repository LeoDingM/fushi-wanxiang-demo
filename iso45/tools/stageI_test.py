"""Stage I: xin scan, todo mood, wear feedback, property fee receipt."""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

def run(c, log):
    def ok(name, cond, info=""):
        log.append(("PASS " if cond else "FAIL ") + name + ((" — " + str(info)) if info != "" else ""))
        return cond
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(100):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.stageI && !!SP.stageH"):
            break
    ok("boot stageI", c.eval("!!SP.stageI && !!SP.game.ps"))
    ok("NPC_SPEC untouched", c.eval("SP.stageD.NPC_SPEC.civic_police.set") in ("police", "uncle"))

    # scan overlay + go wrap
    r = c.eval("""
      (() => {
        SP.game.ps.flags.xin_access = true;
        SP.game.ps.flags.xin_access_until = SP.clock.abs() + 500;
        const d = SP.stageI.xinAccessDetail();
        SP.stageI.playScan(true, d, null);
        const el = document.getElementById('xinscan');
        const vis = el && !el.classList.contains('hidden');
        return { d, vis, okCls: el && el.classList.contains('ok') };
      })()
    """)
    ok("scan overlay shows", r and r.get("vis") and r.get("okCls"), r)
    time.sleep(0.95)
    r2 = c.eval("document.getElementById('xinscan').classList.contains('hidden')")
    ok("scan overlay hides", r2)

    # go to xin triggers scan (don't wait full — just check _scanning or log)
    r = c.eval("""
      (() => {
        SP.game.ps.flags.xin_access = true;
        SP.game.ps.flags.xin_access_until = SP.clock.abs() + 800;
        SP.game.trans = null; SP.game.activity = null;
        SP.stageI._scanning = false;
        const n0 = (SP.game.ps.dayLog||[]).filter(x=>x.kind==='scan').length;
        SP.game.go({ to: 'stair_xin_1f', spawn: [2,2,'N'] });
        const scanning = !!SP.stageI._scanning;
        const n1 = (SP.game.ps.dayLog||[]).filter(x=>x.kind==='scan').length;
        return { scanning, logged: n1 > n0 };
      })()
    """)
    ok("go xin starts scan", r and (r.get("scanning") or r.get("logged")), r)
    time.sleep(1.0)

    # todo complete mood
    r = c.eval("""
      (() => {
        SP.stageI.ensure();
        SP.game.ps.todoDone = {};
        SP.game.ps.needs.mood = 50;
        SP.stageI._prevTodos = ['gate','laundry'];
        // simulate clear
        SP.game.ps.flags.gate_followup_pending = false;
        SP.game.ps.flags.gate_followup_done = true;
        SP.game.ps.clothes.rack = {};
        SP.stageI.applyTodoComplete('gate');
        return { mood: SP.game.ps.needs.mood, done: !!SP.game.ps.todoDone.gate,
          log: (SP.game.ps.dayLog||[]).some(x=>x.kind==='todo_done') };
      })()
    """)
    ok("todo mood buff", r and r.get("mood") == 53 and r.get("done"), r)

    # wear thresholds
    r = c.eval("""
      (() => {
        SP.stageI.ensure();
        SP.game.ps.wearNotices = {};
        const thr = SP.game.rules.data.laundry.wear_dirty_h || 20;
        SP.game.ps.clothes.worn_h = thr * 0.9;
        // run one watch iteration manually
        const notices = SP.game.ps.wearNotices;
        SP.stageI.wearThresholds().forEach(t => {
          if (SP.game.ps.clothes.worn_h >= t.at && !notices[t.k]) notices[t.k] = true;
        });
        const chip = SP.stageH.clothesChip();
        return { q3: !!notices.q3, chipPct: chip.indexOf('穿')>=0 };
      })()
    """)
    ok("wear threshold notices", r and r.get("q3"), r)
    ok("cloth chip shows %", r and r.get("chipPct"), r)

    # property fee receipt
    r = c.eval("""
      (() => {
        SP.game.ps.money = 300;
        SP.game.ps.flags.xin_access_until = SP.clock.abs() + 10;
        SP.stageH.renewByFee();
        const has = SP.stageE.hasItem('property_fee_receipt');
        const docs = SP.stageF.docsInBag().map(x=>x.id);
        SP.game.ps.shownTo = {};
        SP.stageF.presentItem('property','property_fee_receipt');
        const shown = SP.stageF.alreadyShown('property','property_fee_receipt');
        return { has, inDocs: docs.indexOf('property_fee_receipt')>=0, shown,
          access: SP.stageG.accessOk() };
      })()
    """)
    ok("property fee receipt in bag", r and r.get("has") and r.get("inDocs"), r)
    ok("present fee receipt", r and r.get("shown") and r.get("access"), r)

    # civic ready
    r = c.eval("SP.stageI.civicSetsReady()")
    ok("civic atlases ready (info)", True, f"ready={r}")

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
    print(f"stageI_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
