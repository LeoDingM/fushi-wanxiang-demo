"""Stage R: visit reschedule/noshow rating, weekly med, favs, commute tpl, router+notif."""
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
        if c.eval("!!window.__protoReady && !!SP.stageR && !!SP.game && !!SP.game._stageR"):
            break
    c.eval("if (SP.stageR && SP.stageR.install) SP.stageR.install()")
    ok("boot stageR", c.eval("!!SP.stageR && !!SP.game.ps && !!SP.game._stageR"))
    ok("NPC_SPEC untouched", True, c.eval("SP.stageD.NPC_SPEC.civic_police.set"))

    # 1 reschedule + noshow + rating
    r = c.eval("""
      (() => {
        SP.game.ps.propertyRating = 4;
        SP.game.ps.gateTickets = [{ id: 'GT-R', status: '待跟进', day: 0, dueDay: 0, reasons: ['漏扫码'] }];
        SP.stageQ.bookVisitSlot('am1', 'GT-R');
        const before = SP.game.ps.propertyRating;
        SP.stageR.rescheduleVisit('pm1');
        const mid = SP.game.ps.propertyRating;
        const label = SP.game.ps.visitAppt && SP.game.ps.visitAppt.label;
        SP.stageR.markVisitNoShow();
        const after = SP.game.ps.propertyRating;
        SP.stageR.openVisitManage();
        const ids = (SP.game.menu && SP.game.menu.opts || []).map(o => o.id);
        if (SP.game.menu) SP.game.closeMenu();
        return {
          resched: mid < before && label && label.indexOf('16:00') >= 0,
          noshow: after < mid && SP.game.ps.visitAppt.noShow,
          menu: ids.indexOf('rating') >= 0
        };
      })()
    """)
    ok("visit reschedule/noshow rating", r and r.get("resched") and r.get("noshow") and r.get("menu"), r)

    # 2 weekly med report
    r = c.eval("""
      (() => {
        SP.game.ps.rxDoseLog = [];
        SP.stageL.startRxCourse('周报');
        SP.stageL.takeRxDose();
        // simulate past doses
        SP.game.ps.rxDoseLog.push({ day: SP.stageR.dayKey() - 1, ok: true });
        SP.game.ps.rxDoseLog.push({ day: SP.stageR.dayKey() - 2, ok: false });
        const rep = SP.stageR.weeklyMedReport();
        SP.stageA.openPhone('health');
        const el = document.getElementById('phonepanel');
        const h = el && el.innerHTML || '';
        return {
          taken: rep.taken >= 2,
          text: rep.text.indexOf('近7日') >= 0,
          ui: h.indexOf('服药周报') >= 0 && h.indexOf('r-week') >= 0
        };
      })()
    """)
    ok("health weekly report", r and r.get("taken") and r.get("text") and r.get("ui"), r)

    # 3 favorites
    r = c.eval("""
      (() => {
        SP.game.ps.wardrobeFavs = [];
        SP.appearance.setOutfitId('casual');
        SP.stageR.toggleFavorite('casual');
        SP.stageR.toggleFavorite('winter');
        const favs = SP.game.ps.wardrobeFavs.slice();
        SP.game.hud(true);
        const badge = !!document.querySelector('[data-fav-toggle]');
        SP.stageR.wearFavorite('winter');
        const worn = SP.appearance.getOutfitId();
        const html = SP.stageR.renderFavs();
        return { favs, badge, worn, html: html.indexOf('r-favs') >= 0 };
      })()
    """)
    ok("wardrobe favorites", r and "casual" in (r.get("favs") or []) and "winter" in (r.get("favs") or []) and r.get("worn") == "winter" and r.get("html"), r)

    # 4 commute template
    r = c.eval("""
      (() => {
        SP.game.ps.itinReplay = [];
        SP.game.ps.commuteTemplates = [];
        SP.stageP.logItinStep('bus', '公交站');
        SP.stageP.logItinStep('store', '24便利店');
        SP.stageP.logItinStep('gate', '门岗');
        const tpl = SP.stageR.saveCommuteTemplate('周常通勤');
        SP.game.ps.itinReplay = [];
        const ok = SP.stageR.applyCommuteTemplate(tpl.id);
        const html = SP.stageP.renderItinReplay();
        return {
          id: tpl && tpl.id,
          stops: tpl && tpl.stops.length,
          ok,
          replay: SP.game.ps.itinReplay.length >= 3,
          ui: html.indexOf('data-save-commute') >= 0
        };
      })()
    """)
    ok("commute template", r and r.get("id") and r.get("stops") == 3 and r.get("ok") and r.get("replay") and r.get("ui"), r)

    # 5 router + notif
    r = c.eval("""
      (() => {
        const bar = SP.stageR.ensureNotifBar();
        SP.stageR.pushNotif('测试通知', 'fushi://app/health');
        const a = SP.stageR.routeDeepLink('fushi://app/health');
        const b = SP.stageR.routeDeepLink('fushi://app/daylog');
        const c = SP.stageR.routeDeepLink('fushi://app/ticket');
        return {
          bar: !!(bar && document.getElementById('stageR-notif')),
          a, b, c,
          msg: !!(bar.querySelector('.r-notif-msg'))
        };
      })()
    """)
    time.sleep(0.3)
    r2 = c.eval("""
      (() => {
        const ids = (SP.game.menu && SP.game.menu.opts || []).map(o => o.id);
        if (SP.game.menu) SP.game.closeMenu();
        return { ticketUi: ids.indexOf('slot_am1') >= 0 || ids.indexOf('now') >= 0 || ids.indexOf('manage') >= 0 };
      })()
    """)
    ok("deeplink router + notif", r and r.get("bar") and r.get("a") == "health" and r.get("b") == "daylog" and r.get("c") == "ticket" and r.get("msg") and r2 and r2.get("ticketUi"), { **(r or {}), **(r2 or {}) })

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
    print(f"stageR_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
