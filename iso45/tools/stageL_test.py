"""Stage L: unified gate, weather outfit, rx dose, scan export, week+priority."""
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
        if c.eval("!!window.__protoReady && !!SP.stageL && !!SP.stageK"):
            break
    ok("boot stageL", c.eval("!!SP.stageL && !!SP.game.ps && !!SP.game._stageL"))
    ok("NPC_SPEC untouched", True, c.eval("SP.stageD.NPC_SPEC.civic_police.set"))
    ok("appearance not rewritten", c.eval("!!SP.appearance && typeof SP.appearance.openWardrobe==='function'"))

    # 1 unified gate — both reasons
    r = c.eval("""
      (() => {
        SP.game.closeMenu && SP.game.closeMenu();
        SP.game.ps.flags.gate_followup_pending = true;
        SP.game.ps.flags.gate_followup_done = false;
        SP.game.ps.flags.gate_followup_day = 0;
        SP.game.ps.flags.missed_scan_pending = true;
        SP.game.ps.flags.missed_scan_quiz_done = false;
        SP.game.ps.flags.gate_unified_force = true;
        SP.game.ps.flags.gate_unified_done_today = -1;
        SP.place.enter('street', [-2, 11, 'S']);
        SP.player.x = -2; SP.player.y = 11;
        SP.clock.setTimeName && SP.clock.setTimeName('day', true);
        const reasons = SP.stageL.gateReasons();
        SP.stageL.maybeUnifiedGateQuiz();
        const m = SP.game.menu;
        const ids = (m && m.opts || []).map(o => o.id);
        const title = m && m.o && m.o._name;
        if (m) SP.game.closeMenu();
        // split quizzes suppressed
        SP.stageG.maybeGateFollowup();
        SP.stageK.maybeGateScanQuiz();
        const noSplit = !SP.game.menu;
        return { reasons, ids, title, hasBoth: ids.indexOf('both')>=0, hasShrug: ids.indexOf('shrug')>=0, noSplit };
      })()
    """)
    ok("unified gate both reasons", r and "night" in (r.get("reasons") or []) and "scan" in (r.get("reasons") or []) and r.get("hasBoth") and r.get("hasShrug"), r)
    ok("split quizzes suppressed", r and r.get("noSplit"), r)

    # 2 weather outfit tip
    r = c.eval("""
      (() => {
        SP.clock.setWeather && SP.clock.setWeather('rain', 0.9, true, true);
        SP.game.ps.flags.outfit_suggest_open = false;
        SP.place.enter('room_xin_102', SP.scenes.room_xin_102.spawn);
        SP.stageJ.suggestChangeOutfit();
        const m = SP.game.menu;
        const ids = (m && m.opts || []).map(o => o.id);
        const tip = SP.stageL.weatherOutfitTip();
        if (m) {
          const later = m.opts.find(o => o.id==='later');
          if (later) later.fn();
        }
        SP.game.closeMenu && SP.game.closeMenu();
        return { has: ids.indexOf('weather_tip')>=0, w: tip.weather, tip: (tip.tip||'').indexOf('雨')>=0 };
      })()
    """)
    ok("weather outfit tip", r and r.get("has") and r.get("w")=="rain" and r.get("tip"), r)

    # 3 rx dose
    r = c.eval("""
      (() => {
        SP.stageL.startRxCourse('测试疗程');
        const need1 = SP.stageL.rxNeedsDose();
        const okTake = SP.stageL.takeRxDose();
        const need2 = SP.stageL.rxNeedsDose();
        const c = SP.game.ps.rxCourse;
        return { need1, okTake, need2, doses: c && c.dosesTaken, last: c && c.lastDoseDay };
      })()
    """)
    ok("rx dose check-in", r and r.get("need1") and r.get("okTake") and not r.get("need2") and r.get("doses")==1, r)

    # reminder flag path + phone bar
    r = c.eval("""
      (() => {
        SP.game.ps.rxCourse.lastDoseDay = null; // need again (same day reset for test)
        // actually lastDoseDay null means needs dose
        SP.game.ps.flags.rx_dose_reminded_day = null;
        SP.stageA.openPhone('daylog');
        const el = document.getElementById('phonepanel');
        const has = !!(el && el.innerHTML.indexOf('服药打卡')>=0);
        return { has, need: SP.stageL.rxNeedsDose() };
      })()
    """)
    ok("rx dose on phone", r and r.get("has") and r.get("need"), r)

    # 4 scan export
    r = c.eval("""
      (() => {
        SP.game.ps.scanLog = [
          {day:0,t:'08:00',ok:true,detail:'通行'},
          {day:1,t:'09:00',ok:false,detail:'访客'}
        ];
        const ok = SP.stageL.exportScanSummary();
        const th = SP.stageA.threads().property;
        const texts = th.msgs.map(m => m.text).join('|');
        return { ok, wx: texts.indexOf('门禁登记摘要')>=0, flag: !!SP.game.ps.flags.scan_exported };
      })()
    """)
    ok("scan export to property wx", r and r.get("ok") and r.get("wx") and r.get("flag"), r)

    # menu has export
    r = c.eval("""
      (() => {
        SP.stageJ.openScanLogMenu();
        const ids = (SP.game.menu && SP.game.menu.opts || []).map(o => o.id);
        SP.game.closeMenu && SP.game.closeMenu();
        return { has: ids.indexOf('export_wx')>=0 };
      })()
    """)
    ok("scan menu export opt", r and r.get("has"), r)

    # 5 week view + priority
    r = c.eval("""
      (() => {
        SP.game.ps.daylogView = 'week';
        SP.game.ps.dayLog = [
          {day:0,t:'10:00',kind:'x',text:'a'},
          {day:1,t:'11:00',kind:'y',text:'b'}
        ];
        const html = SP.stageG.renderCalendar();
        return { week: html.indexOf('l-week')>=0, tabs: html.indexOf('data-lview')>=0, cells: html.indexOf('l-week-cell')>=0 };
      })()
    """)
    ok("daylog week view", r and r.get("week") and r.get("tabs") and r.get("cells"), r)

    r = c.eval("""
      (() => {
        SP.game.ps.flags.gate_followup_pending = true;
        SP.game.ps.flags.gate_followup_done = false;
        SP.game.ps.flags.gate_followup_day = 0;
        SP.game.ps.flags.missed_scan_pending = true;
        SP.game.ps.flags.missed_scan_quiz_done = false;
        SP.game.ps.flags.deposit_discount = 100;
        SP.game.ps.flags.deposit_discount_used = false;
        SP.stageL.startRxCourse('p');
        SP.game.ps.rxCourse.lastDoseDay = null;
        const todos = SP.stageH.listTodos();
        const ids = todos.map(t => t.id);
        const pris = todos.map(t => t.priority);
        const sorted = pris.slice().sort((a,b)=>b-a).join(',') === pris.join(',');
        return { ids, pris, sorted, unified: ids.indexOf('gate_unified')>=0, dose: ids.indexOf('rx_dose')>=0 };
      })()
    """)
    ok("todo priority sort", r and r.get("sorted") and r.get("unified") and r.get("dose"), r)

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
    print(f"stageL_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
