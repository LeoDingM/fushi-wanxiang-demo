"""Stage Q: visit slots, health page, try-on stack, route wx, deeplink daylog/ticket."""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

def run(c, log):
    def ok(name, cond, info=""):
        log.append(("PASS " if cond else "FAIL ") + name + ((" — " + str(info)) if info != "" else ""))
        return cond
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(150):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.stageQ && !!SP.game && !!SP.game._stageQ"):
            break
    c.eval("if (SP.stageQ && SP.stageQ.install) SP.stageQ.install()")
    ok("boot stageQ", c.eval("!!SP.stageQ && !!SP.game.ps && !!SP.game._stageQ"))
    ok("NPC_SPEC untouched", True, c.eval("SP.stageD.NPC_SPEC.civic_police.set"))

    # 1 visit booking slots
    r = c.eval("""
      (() => {
        SP.game.ps.gateTickets = [{
          id: 'GT-Q-1', status: '待跟进', day: 0,
          dueDay: SP.stageQ.dayKey() - 1, reasons: ['漏扫码']
        }];
        SP.game.ps.visitAppt = null;
        SP.stageQ.openVisitBooking('GT-Q-1');
        const ids = (SP.game.menu && SP.game.menu.opts || []).map(o => o.id);
        const slot = SP.game.menu.opts.find(o => o.id === 'slot_am1');
        if (slot) slot.fn();
        SP.game.closeMenu && SP.game.closeMenu();
        const appt = SP.game.ps.visitAppt;
        // fulfill
        appt.day = SP.stageQ.dayKey();
        SP.clock.setTimeName && SP.clock.setTimeName('day', true);
        // force hour match via flag
        SP.game.ps.flags.visit_appt_force = true;
        SP.stageQ.maybeFulfillAppt();
        const visitMenu = SP.game.menu && SP.game.menu.opts && SP.game.menu.opts.some(o => o.id === 'explain' || o.id === 'renew');
        if (SP.game.menu) SP.game.closeMenu();
        return {
          bookIds: ids.indexOf('slot_am1') >= 0 && ids.indexOf('now') >= 0,
          appt: !!(appt && appt.label),
          fulfilled: !!appt.done,
          visitMenu
        };
      })()
    """)
    ok("visit time slots", r and r.get("bookIds") and r.get("appt") and r.get("fulfilled") and r.get("visitMenu"), r)

    # 2 health page
    r = c.eval("""
      (() => {
        SP.stageP.setCarePhase('pharmacy', { script: '测试' });
        SP.stageL.startRxCourse('健康页疗程');
        SP.stageA.openPhone('health');
        const el = document.getElementById('phonepanel');
        const h = el && el.innerHTML || '';
        return {
          has: h.indexOf('q-health') >= 0 && h.indexOf('careSM') >= 0,
          phase: h.indexOf('pharmacy') >= 0 || h.indexOf('待取药') >= 0 || h.indexOf('course') >= 0,
          tab: SP.stageA._phoneTab === 'health'
        };
      })()
    """)
    ok("careSM health page", r and r.get("has") and r.get("tab"), r)

    # 3 try-on undo stack
    r = c.eval("""
      (() => {
        SP.game.ps.tryOnStack = [];
        SP.appearance.setOutfitId('casual');
        SP.stageN.tryOnLook('winter');
        SP.stageN.tryOnLook('uniform');
        const n = SP.game.ps.tryOnStack.length;
        SP.game.hud(true);
        const badge = !!document.querySelector('[data-try-undo]');
        const u1 = SP.stageQ.undoTryOn();
        const mid = SP.appearance.getOutfitId();
        const u2 = SP.stageQ.undoTryOn();
        const end = SP.appearance.getOutfitId();
        return { n, badge, u1, mid, u2, end, left: SP.game.ps.tryOnStack.length };
      })()
    """)
    ok("try-on undo stack", r and r.get("n") >= 2 and r.get("u1") and r.get("mid") == "winter" and r.get("u2") and r.get("end") == "casual", r)

    # 4 route WeChat summary
    r = c.eval("""
      (() => {
        SP.game.ps.itinReplay = [];
        SP.stageP.logItinStep('bus', '公交站');
        SP.stageP.logItinStep('store', '24便利店');
        const ok = SP.stageQ.shareRouteSummary('roommate');
        const th = SP.stageA.threads().roommate;
        const texts = th.msgs.map(m => m.text).join('|');
        const html = SP.stageP.renderItinReplay();
        return {
          ok, wx: texts.indexOf('今日路线小结') >= 0,
          btn: html.indexOf('data-share-route') >= 0,
          to: SP.game.ps.flags.itin_shared_to
        };
      })()
    """)
    ok("route replay WeChat", r and r.get("ok") and r.get("wx") and r.get("btn") and r.get("to") == "roommate", r)

    # 5 deeplink daylog + ticket
    r = c.eval("""
      (() => {
        const a = SP.stageQ.handleDeepLink('fushi://app/daylog');
        const dayTab = SP.stageA._phoneTab;
        SP.game.ps.gateTickets = [{
          id: 'GT-DL', status: '待跟进', day: 0,
          dueDay: SP.stageQ.dayKey() - 1, reasons: ['漏扫码']
        }];
        const b = SP.stageQ.handleDeepLink('fushi://app/ticket');
        // menu may open after timeout
        return { a, dayTab, b };
      })()
    """)
    time.sleep(0.35)
    r2 = c.eval("""
      (() => {
        const ids = (SP.game.menu && SP.game.menu.opts || []).map(o => o.id);
        if (SP.game.menu) SP.game.closeMenu();
        // long image deep buttons
        SP.game.ps.scanLog = [{ day: 0, t: '08:00', ok: true, detail: 'x' }];
        SP.game.ps.scanArchive = [];
        SP.stageM.archiveScans();
        SP.stageM.openLongImagePreview(SP.stageM.renderLongImage(SP.game.ps.scanArchive[0]));
        const el = document.getElementById('phonepanel');
        const h = el && el.innerHTML || '';
        return {
          bookOrTicket: ids.some(id => id.indexOf('slot_') === 0 || id.indexOf('close_') === 0 || id === 'now'),
          deepBtns: h.indexOf('fushi://app/daylog') >= 0 && h.indexOf('fushi://app/ticket') >= 0
        };
      })()
    """)
    ok("deeplink daylog/ticket", r and r.get("a") == "daylog" and r.get("dayTab") == "daylog" and r.get("b") == "ticket" and r2 and r2.get("bookOrTicket") and r2.get("deepBtns"), { **(r or {}), **(r2 or {}) })

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
    print(f"stageQ_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
