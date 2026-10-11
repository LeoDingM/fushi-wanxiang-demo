"""Stage H: access renew, landlord coupon wx, dirty HUD, daylog todos."""
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
        if c.eval("!!window.__protoReady && !!SP.stageH && !!SP.stageG"):
            break
    ok("boot stageH", c.eval("!!SP.stageH && !!SP.game.ps"))
    # did not clobber NPC_SPEC
    r = c.eval("SP.stageD.NPC_SPEC.civic_police.set")
    ok("NPC_SPEC untouched by H", r in ("police", "uncle"), r)

    c.eval("SP.clock.setTimeName && SP.clock.setTimeName('day', true)")

    # access warn + renew by fee
    r = c.eval("""
      (() => {
        SP.stageH.ensure();
        const abs = SP.clock.abs();
        SP.game.ps.flags.xin_access = true;
        SP.game.ps.flags.xin_access_until = abs + 60; // 1h left -> warn
        SP.game.ps.flags.access_warn_notified = false;
        SP.game.ps.flags.access_expired_notified = false;
        // force watch tick logic inline
        const left = SP.stageH.accessLeftMin();
        SP.game.ps.money = 200;
        const fee = 45;
        const okFee = SP.stageH.renewByFee();
        return {
          leftWas: left,
          renewed: okFee,
          until: SP.game.ps.flags.xin_access_until > abs + 20*60,
          access: SP.stageG.accessOk(),
          log: (SP.game.ps.dayLog||[]).some(x => x.kind==='access_renew')
        };
      })()
    """)
    ok("renew by property fee", r and r.get("renewed") and r.get("until") and r.get("access"), r)

    # renew by stamp
    r = c.eval("""
      (() => {
        SP.stageE.giveItem('police_stamp','章');
        SP.game.ps.shownTo = SP.game.ps.shownTo || {};
        delete (SP.game.ps.shownTo.property||{}).police_stamp;
        const abs0 = SP.game.ps.flags.xin_access_until;
        SP.stageH.renewByStamp();
        return {
          has: SP.stageE.hasItem('police_stamp'),
          extended: SP.game.ps.flags.xin_access_until > abs0
        };
      })()
    """)
    ok("renew by stamp", r and r.get("extended"), r)

    # expiry notify path
    r = c.eval("""
      (() => {
        SP.game.ps.flags.xin_access = true;
        SP.game.ps.flags.xin_access_until = SP.clock.abs() - 10;
        SP.game.ps.flags.access_expired_notified = false;
        // simulate watch branch
        const fl = SP.game.ps.flags;
        const left = fl.xin_access_until - SP.clock.abs();
        if (left <= 0 && fl.xin_access && !fl.access_expired_notified) {
          fl.xin_access = false; fl.access_expired_notified = true;
          SP.stageF.pushLog('access_expired','门禁已过期',{place:'xin'});
        }
        return { expired: !fl.xin_access, logged: (SP.game.ps.dayLog||[]).some(x=>x.kind==='access_expired') };
      })()
    """)
    ok("access expiry flag", r and r.get("expired") and r.get("logged"), r)

    # landlord coupon wechat
    r = c.eval("""
      (() => {
        SP.game.ps.flags.deposit_discount = 100;
        SP.game.ps.flags.deposit_discount_used = false;
        SP.game.ps.flags.wx_coupon_pushed = false;
        SP.stageH.injectLandlordCouponChat();
        const th = SP.stageA.threads().landlord;
        const hasReply = th.replies.some(x => x.id==='coupon');
        const hasMsg = th.msgs.some(m => m.text && m.text.indexOf('押金')>=0);
        return { hasReply, hasMsg, pushed: !!SP.game.ps.flags.wx_coupon_pushed };
      })()
    """)
    ok("landlord coupon replies", r and r.get("hasReply"), r)
    ok("landlord coupon message", r and r.get("hasMsg"), r)

    # dirty clothes HUD chip
    r = c.eval("""
      (() => {
        SP.stageH.ensure();
        const thr = (SP.game.rules.data.laundry && SP.game.rules.data.laundry.wear_dirty_h) || 20;
        SP.game.ps.clothes.worn_h = thr + 1;
        SP.game.ps.clothes.dirty = 2;
        SP.game.hud(true);
        const el = document.getElementById('needs');
        const html = el ? el.innerHTML : '';
        return { chip: html.indexOf('cloth-chip')>=0, warn: html.indexOf('衣臭')>=0 || html.indexOf('warn')>=0 };
      })()
    """)
    ok("dirty clothes HUD chip", r and r.get("chip") and r.get("warn"), r)

    # todos: gate + laundry + access
    r = c.eval("""
      (() => {
        SP.game.ps.flags.gate_followup_pending = true;
        SP.game.ps.flags.gate_followup_done = false;
        SP.game.ps.clothes.rack = { balcony: { n: 2, wet: 0.05, t: SP.clock.abs() } };
        SP.game.ps.flags.xin_access_until = SP.clock.abs() + 30;
        SP.game.ps.flags.deposit_discount = 100;
        SP.game.ps.flags.deposit_discount_used = false;
        const todos = SP.stageH.listTodos();
        const ids = todos.map(t => t.id);
        const html = SP.stageH.renderTodos();
        return { ids, html: html.indexOf('ptodo')>=0, n: todos.length };
      })()
    """)
    ok("todos gate+laundry", r and "gate" in r.get("ids",[]) and "laundry" in r.get("ids",[]), r)
    ok("todos access+coupon", r and "access" in r.get("ids",[]) and "coupon" in r.get("ids",[]), r)
    ok("todos HTML", r and r.get("html"), r)

    # calendar includes todos
    r = c.eval("""
      (() => {
        SP.stageA.openPhone('daylog');
        const el = document.getElementById('phonepanel');
        return { has: !!(el && el.innerHTML.indexOf('待办')>=0) };
      })()
    """)
    ok("daylog shows todos", r and r.get("has"), r)

    # civic sets ready (Char-A)
    r = c.eval("SP.stageH.civicSetsReady()")
    ok("civic sprite sets ready (info)", True, f"ready={r}")  # always pass, informational

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
    print(f"stageH_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
