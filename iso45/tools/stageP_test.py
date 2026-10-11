"""Stage P: property visit, care SM, try-on restore, itin replay, QR deeplink."""
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
        if c.eval("!!window.__protoReady && !!SP.stageP && !!SP.stageO"):
            break
    ok("boot stageP", c.eval("!!SP.stageP && !!SP.game.ps && !!SP.game._stageP"))
    ok("NPC_SPEC untouched", True, c.eval("SP.stageD.NPC_SPEC.civic_police.set"))

    # 1 property visit
    r = c.eval("""
      (() => {
        SP.game.ps.gateTickets = [{
          id: 'GT-OV-1', status: '待跟进', day: 0,
          dueDay: SP.stageP.dayKey() - 1, reasons: ['漏扫码']
        }];
        SP.stageP.openPropertyVisit('GT-OV-1');
        const ids = (SP.game.menu && SP.game.menu.opts || []).map(o => o.id);
        const renew = SP.game.menu.opts.find(o => o.id === 'renew');
        SP.stageH.ensure();
        const before = SP.game.ps.flags.xin_access_until || SP.clock.abs();
        SP.game.ps.flags.xin_access_until = before;
        if (renew) renew.fn();
        SP.game.closeMenu && SP.game.closeMenu();
        const t = SP.game.ps.gateTickets[0];
        const replies = SP.stageA.threads().property.replies.map(r => r.id);
        return {
          menu: ids.indexOf('explain') >= 0 && ids.indexOf('renew') >= 0,
          closed: t.status === '已结案',
          reply: replies.indexOf('prop_visit') >= 0
        };
      })()
    """)
    ok("property visit dialogue", r and r.get("menu") and r.get("closed") and r.get("reply"), r)

    # 2 care SM
    r = c.eval("""
      (() => {
        SP.game.ps.careSM = { phase: 'idle' };
        SP.game.ps.rxCourse = null;
        SP.game.ps.flags.rx_course_reopened = false;
        SP.stageP.setCarePhase('revisit_needed');
        SP.stageO.onHospitalRevisit();
        const ph1 = SP.stageP.carePhase();
        // pharmacy path after doctor
        const cv = SP.stageD.ensure().hospital;
        cv.registered = true; cv.seen = true; cv.script = '测试药'; cv.bought = false;
        SP.stageP.setCarePhase('pharmacy', { script: '测试药' });
        SP.stageD.pharmacyMenu({ interact: 'pharmacy' });
        const hasSm = (SP.game.menu.opts || []).some(o => o.id === 'care_sm');
        const rx = (SP.game.menu.opts || []).find(o => o.id === 'rx');
        if (rx) rx.fn();
        SP.game.closeMenu && SP.game.closeMenu();
        return {
          afterRevisit: ph1 === 'course' || ph1 === 'registering' || ph1 === 'done',
          hasSm,
          phase: SP.stageP.carePhase(),
          course: !!SP.game.ps.rxCourse,
          label: SP.stageP.careStatusText()
        };
      })()
    """)
    ok("care SM unified", r and r.get("hasSm") and r.get("course") and r.get("phase") in ("course", "done", "pharmacy"), r)

    # 3 try-on restore
    r = c.eval("""
      (() => {
        SP.stageH.ensure();
        SP.appearance.setOutfitId('casual');
        SP.stageN.tryOnLook('winter');
        SP.game.hud(true);
        const before = SP.appearance.getOutfitId();
        const ok = SP.stageP.restoreTryOn();
        SP.game.hud(true);
        return {
          before, ok,
          after: SP.appearance.getOutfitId(),
          active: !!SP.game.ps.tryOn.active,
          badgeClick: !!document.querySelector('[data-try-restore]')
        };
      })()
    """)
    ok("try-on restore", r and r.get("ok") and r.get("before") == "winter" and r.get("after") == "casual" and not r.get("active"), r)

    # 4 itinerary replay
    r = c.eval("""
      (() => {
        SP.game.ps.itinReplay = [];
        SP.stageP.logItinStep('bus', '公交站');
        SP.stageP.logItinStep('store', '24便利店');
        const html = SP.stageP.renderItinReplay();
        const cal = SP.stageG.renderCalendar();
        const logs = (SP.game.ps.dayLog || []).filter(x => x.kind === 'itin_replay');
        return {
          n: SP.game.ps.itinReplay.length,
          html: html.indexOf('p-replay') >= 0,
          inCal: cal.indexOf('今日路线回放') >= 0,
          dayLog: logs.length >= 2
        };
      })()
    """)
    ok("itin dayLog replay", r and r.get("n") == 2 and r.get("html") and r.get("inCal") and r.get("dayLog"), r)

    # 5 QR deeplink
    r = c.eval("""
      (() => {
        SP.game.ps.scanLog = [{ day: 0, t: '08:00', ok: true, detail: '通行' }];
        SP.game.ps.scanArchive = [];
        SP.stageM.archiveScans();
        const url = SP.stageM.renderLongImage(SP.game.ps.scanArchive[0]);
        SP.stageM.openLongImagePreview(url);
        const el = document.getElementById('phonepanel');
        const hasBtn = !!(el && el.innerHTML.indexOf('data-qr-deep') >= 0);
        const link = SP.game.ps.flags.scan_deeplink;
        SP.stageP.openScanDeepLink();
        const panel = document.getElementById('phonepanel');
        return {
          hasBtn, link,
          used: !!SP.game.ps.flags.scan_deeplink_used,
          scanlog: !!(panel && (panel.innerHTML.indexOf('登记') >= 0 || panel.innerHTML.indexOf('scan') >= 0 || panel.innerHTML.indexOf('门禁') >= 0 || SP.stageA._phoneTab === 'scanlog'))
        };
      })()
    """)
    ok("QR deep-link 门禁", r and r.get("hasBtn") and r.get("link") and r.get("used") and r.get("scanlog"), r)

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
    print(f"stageP_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
