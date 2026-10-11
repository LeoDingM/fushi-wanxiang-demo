"""Stage N: ticket close↔access, miss streak hospital, try-on, hour POI, long share."""
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
        if c.eval("!!window.__protoReady && !!SP.stageN && !!SP.stageM"):
            break
    ok("boot stageN", c.eval("!!SP.stageN && !!SP.game.ps && !!SP.game._stageN"))
    ok("NPC_SPEC untouched", True, c.eval("SP.stageD.NPC_SPEC.civic_police.set"))

    # 1 ticket follow-up + renew
    r = c.eval("""
      (() => {
        SP.game.ps.gateTickets = [{
          id: 'GT-TEST-1', day: 0, status: '待跟进', reasons: ['漏扫码'], label: '敷衍'
        }];
        SP.stageH.ensure();
        const abs = SP.clock.abs();
        SP.game.ps.flags.xin_access_until = abs + 60;
        const before = SP.game.ps.flags.xin_access_until;
        const t = SP.stageN.closeTicket('GT-TEST-1', true);
        const th = SP.stageA.threads().property;
        const texts = th.msgs.map(m => m.text).join('|');
        return {
          status: t && t.status,
          renewed: SP.game.ps.flags.xin_access_until > before,
          wx: texts.indexOf('已结案') >= 0 && texts.indexOf('GT-TEST-1') >= 0
        };
      })()
    """)
    ok("ticket close + access renew", r and r.get("status") == "已结案" and r.get("renewed") and r.get("wx"), r)

    r = c.eval("""
      (() => {
        SP.game.ps.gateTickets = [{ id: 'GT-P', status: '待跟进', reasons: ['夜间来电未接'] }];
        SP.stageN.openTicketFollowupMenu();
        const ids = (SP.game.menu && SP.game.menu.opts || []).map(o => o.id);
        SP.game.closeMenu && SP.game.closeMenu();
        const replies = SP.stageA.threads().property.replies.map(r => r.id);
        return { menu: ids.indexOf('close_GT-P') >= 0 && ids.indexOf('renew_GT-P') >= 0, reply: replies.indexOf('ticket_follow') >= 0 };
      })()
    """)
    ok("ticket follow menu + reply", r and r.get("menu") and r.get("reply"), r)

    # 2 miss streak → hospital
    r = c.eval("""
      (() => {
        SP.game.ps.flags.rx_miss_streak = 0;
        SP.game.ps.flags.hospital_revisit_pending = false;
        SP.stageM.applyMissedDosePenalty('s1');
        const s1 = SP.game.ps.flags.rx_miss_streak;
        const p1 = !!SP.game.ps.flags.hospital_revisit_pending;
        SP.stageM.applyMissedDosePenalty('s2');
        const s2 = SP.game.ps.flags.rx_miss_streak;
        const p2 = !!SP.game.ps.flags.hospital_revisit_pending;
        const todos = SP.stageH.listTodos().map(t => t.id);
        return { s1, p1, s2, p2, todo: todos.indexOf('hospital_revisit') >= 0 };
      })()
    """)
    ok("miss streak hospital todo", r and r.get("s1") == 1 and not r.get("p1") and r.get("s2") >= 2 and r.get("p2") and r.get("todo"), r)

    # clear on hospital
    r = c.eval("""
      (() => {
        SP.game.ps.flags.hospital_revisit_pending = true;
        SP.stageD.hospitalNurse({ interact: 'hospital_nurse' });
        return { cleared: !SP.game.ps.flags.hospital_revisit_pending, done: !!SP.game.ps.flags.hospital_revisit_done };
      })()
    """)
    ok("hospital clears revisit", r and r.get("cleared") and r.get("done"), r)

    # 3 try-on
    r = c.eval("""
      (() => {
        SP.clock.setWeather && SP.clock.setWeather('snow', 0.8, true, true);
        SP.game.ps.flags.outfit_suggest_open = false;
        SP.place.enter('room_xin_102', SP.scenes.room_xin_102.spawn);
        SP.stageJ.suggestChangeOutfit();
        const ids = (SP.game.menu && SP.game.menu.opts || []).map(o => o.id);
        const tryId = ids.find(id => id && id.indexOf('try_') === 0);
        let worn = null;
        if (tryId) {
          const opt = SP.game.menu.opts.find(o => o.id === tryId);
          opt.fn();
          worn = SP.appearance.getOutfitId();
        }
        SP.game.closeMenu && SP.game.closeMenu();
        const direct = SP.stageN.tryOnLook('casual');
        return { hasTry: !!tryId, worn, direct, cur: SP.appearance.getOutfitId() };
      })()
    """)
    ok("one-tap soft try-on", r and r.get("hasTry") and r.get("direct") and r.get("cur") == "casual", r)

    # 4 hour strip POI
    r = c.eval("""
      (() => {
        SP.game.ps.daylogView = 'week';
        const d = SP.stageN.dayKey();
        SP.stageG._calOpen = d;
        SP.game.ps.hourStripDay = d;
        SP.game.ps.hourStripHour = 14;
        SP.game.ps.dayLog = [
          { day: d, t: '14:20', kind: 'bus', text: '公交', place: 'bus' },
          { day: d, t: '14:50', kind: 'gate', text: '门岗', place: 'gate' }
        ];
        const html = SP.stageG.renderCalendar();
        return { jump: html.indexOf('data-n-jump') >= 0, bus: html.indexOf('data-n-jump="bus"') >= 0 };
      })()
    """)
    ok("hour strip POI jump", r and r.get("jump") and r.get("bus"), r)

    # 5 long image share
    r = c.eval("""
      (() => {
        SP.game.ps.scanLog = [{ day: 0, t: '08:00', ok: true, detail: '通行' }];
        SP.game.ps.scanArchive = [];
        SP.stageM.archiveScans();
        const url = SP.stageM.renderLongImage(SP.game.ps.scanArchive[0]);
        SP.stageM.openLongImagePreview(url);
        const el = document.getElementById('phonepanel');
        const hasShare = !!(el && el.innerHTML.indexOf('data-share-long') >= 0);
        const ok = SP.stageN.shareLongImage('roommate');
        const th = SP.stageA.threads().roommate;
        const texts = th.msgs.map(m => m.text).join('|');
        return { hasShare, ok, wx: texts.indexOf('长图') >= 0, to: SP.game.ps.flags.scan_shared_to };
      })()
    """)
    ok("long-image WeChat share", r and r.get("hasShare") and r.get("ok") and r.get("wx") and r.get("to") == "roommate", r)

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
    print(f"stageN_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
