"""Stage O: ticket SLA/2nd gate, revisit rx, try-on badge, itinerary, watermark QR."""
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
        if c.eval("!!window.__protoReady && !!SP.stageO && !!SP.stageN"):
            break
    ok("boot stageO", c.eval("!!SP.stageO && !!SP.game.ps && !!SP.game._stageO"))
    ok("NPC_SPEC untouched", True, c.eval("SP.stageD.NPC_SPEC.civic_police.set"))

    # 1 SLA + second gate
    r = c.eval("""
      (() => {
        SP.game.ps.gateTickets = [];
        const t = SP.stageM.fileGateTicket('shrug', '敷衍');
        const hasDue = t && t.status === '待跟进' && t.dueDay != null;
        // make overdue
        t.dueDay = SP.stageO.dayKey() - 1;
        const od = SP.stageO.overdueTickets();
        SP.game.closeMenu && SP.game.closeMenu();
        SP.place.enter('street', [-2, 11, 'S']);
        SP.player.x = -2; SP.player.y = 11;
        SP.clock.setTimeName && SP.clock.setTimeName('day', true);
        SP.game.ps.flags.second_gate_force = true;
        SP.game.ps.flags.second_gate_day = -1;
        SP.stageO.maybeSecondGateCheck();
        const m = SP.game.menu;
        const ids = (m && m.opts || []).map(o => o.id);
        if (m) SP.game.closeMenu();
        const todos = SP.stageH.listTodos().map(x => x.id);
        return { hasDue, overdue: od.length >= 1, menu: ids.indexOf('urge') >= 0 && ids.indexOf('show_ticket') >= 0, todo: todos.indexOf('ticket_sla') >= 0 };
      })()
    """)
    ok("ticket SLA + second gate", r and r.get("hasDue") and r.get("overdue") and r.get("menu") and r.get("todo"), r)

    # 2 revisit → rx course
    r = c.eval("""
      (() => {
        SP.game.ps.rxCourse = null;
        SP.game.ps.flags.hospital_revisit_pending = true;
        SP.game.ps.flags.hospital_revisit_done = false;
        SP.game.ps.flags.rx_course_reopened = false;
        const course = SP.stageO.onHospitalRevisit();
        return {
          done: !!SP.game.ps.flags.hospital_revisit_done,
          pending: !!SP.game.ps.flags.hospital_revisit_pending,
          course: !!(course && course.days),
          note: course && course.note
        };
      })()
    """)
    ok("revisit reopens rx course", r and r.get("done") and not r.get("pending") and r.get("course"), r)

    # also via hospital nurse wrap
    r = c.eval("""
      (() => {
        SP.game.ps.rxCourse = null;
        SP.game.ps.flags.hospital_revisit_pending = true;
        SP.game.ps.flags.hospital_revisit_done = false;
        SP.game.ps.flags.rx_course_reopened = false;
        SP.stageD.hospitalNurse({ interact: 'hospital_nurse' });
        return {
          reopened: !!SP.game.ps.flags.rx_course_reopened,
          course: !!SP.game.ps.rxCourse
        };
      })()
    """)
    ok("nurse path reopens course", r and r.get("reopened") and r.get("course"), r)

    # 3 try-on badge
    r = c.eval("""
      (() => {
        SP.stageH.ensure();
        if (SP.appearance.setOutfitId) SP.appearance.setOutfitId('casual');
        SP.game.ps.tryOn = { prevId: null, curId: null, active: false };
        SP.stageN.tryOnLook('winter');
        SP.game.hud(true);
        const badge = document.querySelector('.o-try-badge');
        const chip = document.querySelector('.cloth-chip');
        const html = (chip && chip.parentElement && chip.parentElement.innerHTML) || (badge && badge.outerHTML) || '';
        return {
          active: !!SP.game.ps.tryOn.active,
          prev: SP.game.ps.tryOn.prevId,
          cur: SP.game.ps.tryOn.curId,
          badge: !!(badge || html.indexOf('o-try-badge') >= 0 || html.indexOf('试穿') >= 0)
        };
      })()
    """)
    ok("try-on HUD badge", r and r.get("active") and r.get("cur") == "winter" and r.get("badge"), r)

    # 4 itinerary
    r = c.eval("""
      (() => {
        SP.stageO.ensureSoftPoi();
        SP.game.ps.daylogView = 'week';
        SP.game.ps.hourStripHour = 8;
        const html = SP.stageM.renderHourStrip(SP.stageO.dayKey());
        return {
          itin: html.indexOf('o-itin') >= 0,
          bus: html.indexOf('data-o-itin="bus"') >= 0,
          store: html.indexOf('data-o-itin="store"') >= 0,
          poi: !!(SP.stageG.POI.store && SP.stageG.POI.noodles)
        };
      })()
    """)
    ok("hour itinerary chain", r and r.get("itin") and r.get("bus") and r.get("store") and r.get("poi"), r)

    # 5 watermark QR
    r = c.eval("""
      (() => {
        SP.game.ps.scanLog = [{ day: 0, t: '08:00', ok: true, detail: '通行' }];
        SP.game.ps.scanArchive = [];
        SP.stageM.archiveScans();
        const url = SP.stageM.renderLongImage(SP.game.ps.scanArchive[0]);
        SP.stageM.openLongImagePreview(url);
        const el = document.getElementById('phonepanel');
        return {
          png: !!(url && url.indexOf('data:image/png') === 0),
          wm: !!SP.game.ps.flags.scan_long_has_wm,
          hint: !!(el && el.innerHTML.indexOf('水印') >= 0)
        };
      })()
    """)
    ok("long-image watermark QR", r and r.get("png") and r.get("wm") and r.get("hint"), r)

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
    print(f"stageO_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
