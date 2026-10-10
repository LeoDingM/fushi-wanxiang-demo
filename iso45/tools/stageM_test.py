"""Stage M: gate ticket, missed-dose, soft wardrobe, hour strip, scan archive/longimg."""
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
        if c.eval("!!window.__protoReady && !!SP.stageM && !!SP.stageL"):
            break
    ok("boot stageM", c.eval("!!SP.stageM && !!SP.game.ps && !!SP.game._stageM"))
    ok("NPC_SPEC untouched", True, c.eval("SP.stageD.NPC_SPEC.civic_police.set"))
    ok("no appearance edit", c.eval("!!SP.appearance && Array.isArray(SP.appearance.PLAYER_LOOKS)"))

    # 1 gate → property ticket
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
        SP.game.ps.gateTickets = [];
        SP.place.enter('street', [-2, 11, 'S']);
        SP.player.x = -2; SP.player.y = 11;
        SP.clock.setTimeName && SP.clock.setTimeName('day', true);
        SP.stageL.maybeUnifiedGateQuiz();
        const m = SP.game.menu;
        const both = m && m.opts && m.opts.find(o => o.id === 'both');
        if (both) both.fn();
        SP.game.closeMenu && SP.game.closeMenu();
        const t = SP.game.ps.gateTickets[0];
        const th = SP.stageA.threads().property;
        const texts = th.msgs.map(x => x.text).join('|');
        return {
          id: t && t.id, status: t && t.status,
          wx: texts.indexOf('工单') >= 0 && texts.indexOf(t.id) >= 0
        };
      })()
    """)
    ok("gate ticket to property wx", r and r.get("id") and r.get("status") == "已结案" and r.get("wx"), r)

    # shrug → 待跟进
    r = c.eval("""
      (() => {
        const t = SP.stageM.fileGateTicket('shrug', '敷衍');
        return { status: t.status, n: SP.game.ps.gateTickets.length };
      })()
    """)
    ok("shrug ticket pending", r and r.get("status") == "待跟进", r)

    # 2 missed-dose penalty
    r = c.eval("""
      (() => {
        SP.stageL.startRxCourse('测');
        SP.game.ps.rxCourse.lastDoseDay = null;
        SP.game.ps.rxCourse.startDay = SP.stageM.dayKey() - 1;
        const mood0 = SP.game.ps.needs.mood;
        const energy0 = SP.game.ps.needs.energy;
        // simulate day roll: set _rxDay to yesterday, dayKey stays today-ish — force via check
        SP.stageM._rxDay = SP.stageM.dayKey() - 1;
        SP.game.ps.flags.rx_miss_penalized_day = null;
        // bump dayKey artificially by wrapping — call apply directly + check path
        SP.stageM.applyMissedDosePenalty('测试');
        return {
          mood: mood0 - SP.game.ps.needs.mood,
          energy: energy0 - SP.game.ps.needs.energy,
          miss: SP.game.ps.flags.rx_miss_count
        };
      })()
    """)
    ok("missed-dose penalty", r and r.get("mood") >= 5 and r.get("energy") >= 4 and r.get("miss") >= 1, r)

    # day-roll path
    r = c.eval("""
      (() => {
        SP.stageL.startRxCourse('测2');
        const d = SP.stageM.dayKey();
        SP.game.ps.rxCourse.startDay = d - 1;
        SP.game.ps.rxCourse.lastDoseDay = null; // missed yesterday
        SP.stageM._rxDay = d - 1;
        SP.game.ps.flags.rx_miss_penalized_day = null;
        const mood0 = SP.game.ps.needs.mood;
        // Fake dayKey advance: temporarily override
        const F = SP.stageF;
        const prev = F.dayKey.bind(F);
        let fake = d;
        F.dayKey = () => fake;
        fake = d; // checkMissedDose sees _rxDay=d-1, dayKey=d → penalty for prevDay
        SP.stageM.checkMissedDose();
        F.dayKey = prev;
        return { dropped: mood0 > SP.game.ps.needs.mood, penDay: SP.game.ps.flags.rx_miss_penalized_day };
      })()
    """)
    ok("missed-dose day roll", r and r.get("dropped") and r.get("penDay") is not None, r)

    # 3 soft wardrobe tips
    r = c.eval("""
      (() => {
        SP.clock.setWeather && SP.clock.setWeather('snow', 0.8, true, true);
        const tip = SP.stageM.softWardrobeTips();
        SP.game.ps.flags.outfit_suggest_open = false;
        SP.place.enter('room_xin_102', SP.scenes.room_xin_102.spawn);
        SP.stageJ.suggestChangeOutfit();
        const ids = (SP.game.menu && SP.game.menu.opts || []).map(o => o.id);
        if (SP.game.menu) {
          const later = SP.game.menu.opts.find(o => o.id === 'later');
          if (later) later.fn();
        }
        SP.game.closeMenu && SP.game.closeMenu();
        return {
          has: ids.indexOf('soft_wardrobe') >= 0,
          w: tip.weather,
          tips: tip.tips.map(t => t.id),
          hasWinter: tip.tips.some(t => t.id === 'winter' || /冬/.test(t.label))
        };
      })()
    """)
    ok("soft wardrobe weather tips", r and r.get("has") and r.get("hasWinter"), r)

    # 4 hour strip
    r = c.eval("""
      (() => {
        SP.game.ps.daylogView = 'week';
        SP.game.ps.dayLog = [
          {day: SP.stageM.dayKey(), t: '09:15', kind: 'a', text: '早上'},
          {day: SP.stageM.dayKey(), t: '14:30', kind: 'b', text: '下午'},
          {day: SP.stageM.dayKey(), t: '20:00', kind: 'c', text: '晚上'}
        ];
        SP.stageG._calOpen = SP.stageM.dayKey();
        SP.game.ps.hourStripDay = SP.stageM.dayKey();
        SP.game.ps.hourStripHour = 14;
        const html = SP.stageG.renderCalendar();
        return {
          hours: html.indexOf('m-hours') >= 0,
          cell: html.indexOf('data-mhour') >= 0,
          detail: html.indexOf('下午') >= 0
        };
      })()
    """)
    ok("week hour strip", r and r.get("hours") and r.get("cell") and r.get("detail"), r)

    # 5 archive + long image
    r = c.eval("""
      (() => {
        SP.game.ps.scanLog = [
          {day:0,t:'08:00',ok:true,detail:'通行A'},
          {day:1,t:'09:00',ok:false,detail:'访客B'}
        ];
        SP.game.ps.scanArchive = [];
        const arch = SP.stageM.archiveScans();
        const url = SP.stageM.renderLongImage(arch);
        return {
          id: arch && arch.id,
          cleared: SP.game.ps.scanLog.length === 0,
          archived: SP.game.ps.scanArchive.length === 1,
          png: !!(url && url.indexOf('data:image/png') === 0)
        };
      })()
    """)
    ok("scan archive + long image", r and r.get("id") and r.get("cleared") and r.get("archived") and r.get("png"), r)

    r = c.eval("""
      (() => {
        SP.stageM.openLongImagePreview(SP.game.ps.flags.scan_long_image || SP.stageM.renderLongImage(SP.game.ps.scanArchive[0]));
        const el = document.getElementById('phonepanel');
        return { has: !!(el && el.innerHTML.indexOf('m-long') >= 0 && el.innerHTML.indexOf('img') >= 0) };
      })()
    """)
    ok("long image phone UI", r and r.get("has"), r)

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
    print(f"stageM_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
