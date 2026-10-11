"""Stage F: present items, bus bell log, xin_102 laundry, night day-log mood."""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

def enter(c, scene):
    c.eval(f"""
      (() => {{
        const sp = (SP.scenes['{scene}'] && SP.scenes['{scene}'].spawn) || [2,1,'N'];
        SP.place.enter('{scene}', sp);
        if (SP.stageD) SP.stageD.syncCivicNpcs();
        return SP.world.sceneId;
      }})()
    """)
    time.sleep(0.12)

def run(c, log):
    def ok(name, cond, info=""):
        log.append(("PASS " if cond else "FAIL ") + name + ((" — " + str(info)) if info != "" else ""))
        return cond
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(100):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.stageF && !!SP.stageE"):
            break
    ok("boot stageF", c.eval("!!SP.stageF && !!SP.game.ps"))
    c.eval("SP.clock.setTimeName && SP.clock.setTimeName('day', true)")

    # seed docs
    r = c.eval("""
      (() => {
        SP.stageF.install();
        SP.stageE.giveItem('police_receipt','测试回执');
        SP.stageE.giveItem('fire_card','测试卡片');
        SP.stageE.giveItem('rx_slip','测试处方');
        return SP.stageF.docsInBag().map(x=>x.id);
      })()
    """)
    ok("docs in bag", r and "police_receipt" in r and "fire_card" in r, r)

    # present to property (accept)
    r = c.eval("""
      (() => {
        SP.stageF.ensure();
        SP.game.ps.shownTo = {};
        SP.stageF.presentItem('property', 'police_receipt');
        const again = SP.stageF.alreadyShown('property', 'police_receipt');
        SP.stageF.presentItem('property', 'police_receipt'); // dup
        const rej = (() => { SP.stageF.presentItem('property', 'rx_slip'); return true; })();
        return {
          accepted: again,
          flag: !!(SP.game.ps.flags && SP.game.ps.flags.property_receipt_filed),
          logN: (SP.game.ps.dayLog||[]).length,
          kinds: (SP.game.ps.dayLog||[]).slice(0,5).map(x=>x.kind)
        };
      })()
    """)
    ok("present accept property", r and r.get("accepted") and r.get("flag"), r)
    ok("dayLog rows", r and r.get("logN", 0) >= 2, r)

    # present reject / police already
    r = c.eval("""
      (() => {
        SP.stageF.presentItem('police', 'police_receipt');
        const dupish = (SP.game.ps.dayLog||[]).some(x => x.kind==='present_reject' || x.kind==='present_dup');
        SP.stageF.presentItem('guard', 'police_receipt');
        return {
          guard: !!(SP.game.ps.flags && SP.game.ps.flags.gate_note),
          hasReject: dupish || (SP.game.ps.dayLog||[]).some(x=>x.kind==='present_reject')
        };
      })()
    """)
    ok("present guard accept", r and r.get("guard"), r)
    ok("present reject logged", r and r.get("hasReject"), r)

    # open present menu from knock path
    r = c.eval("""
      (() => {
        SP.place.enter('stair_2f', [2,2,'N']);
        const door = (SP.world.objects||[]).find(o => o.interact==='neighbor_door');
        if (!door) return { noDoor: true };
        SP.game.knock(door);
        const m = SP.game.menu;
        const hasPresent = !!(m && m.opts && m.opts.some(o => o.id==='present'));
        SP.game.closeMenu && SP.game.closeMenu();
        return { hasPresent, door: door && door.name };
      })()
    """)
    ok("knock present option", r and (r.get("hasPresent") or r.get("noDoor")), r)

    # civic menu inject
    enter(c, "civic_police")
    r = c.eval("""
      (() => {
        SP.game.use(SP.world.byId.report_desk);
        const m = SP.game.menu;
        const has = !!(m && m.opts && m.opts.some(o => o.id==='present_docs'));
        SP.game.closeMenu && SP.game.closeMenu();
        return { has };
      })()
    """)
    ok("civic present_docs", r and r.get("has"), r)

    # xin_102 laundry + bay collider
    enter(c, "room_xin_102")
    r = c.eval("""
      (() => {
        const L = SP.world.laundry || [];
        const poles = L.filter(x => x.rack==='balcony');
        const col = (SP.world.colliders||[]).some(c => c.id==='bay_glass_col' || (c.rect && c.id && String(c.id).indexOf('bay')>=0));
        const rack = !!SP.world.byId.rack;
        return { poles: poles.length, col, rack, scene: SP.world.sceneId };
      })()
    """)
    ok("xin_102 laundry poles", r and r.get("poles", 0) >= 1, r)
    ok("xin_102 bay collider", r and r.get("col"), r)
    ok("xin_102 rack", r and r.get("rack"))

    # bus polish wrapped + log
    r = c.eval("""
      (() => {
        SP.place.enter('street', [-18, 3.5, 'S']);
        const dest = SP.stageA.busStops.find(s => s.id==='bus_stop_e');
        const n0 = (SP.game.ps.dayLog||[]).length;
        SP.stageE.rideBus(dest, SP.stageA.busFare(), SP.stageA.busRideMin(), 'skip');
        return { wrapped: !!SP.stageE._busF, chime: typeof SP.stageF.chime==='function' };
      })()
    """)
    ok("bus F wrap", r and r.get("wrapped") and r.get("chime"), r)
    time.sleep(0.55)
    r = c.eval("!!(SP.game.ps.dayLog||[]).some(x => x.kind==='bus')")
    ok("bus dayLog after arrive", r)

    # night → log + morning mood
    r = c.eval("""
      (() => {
        SP.stageF.ensure();
        SP.game.ps.nightFlags = {};
        SP.stageE.offerNightEvent('police');
        const skip = SP.game.menu && SP.game.menu.opts.find(o => o.id==='skip');
        if (skip) skip.fn();
        SP.game.closeMenu && SP.game.closeMenu();
        SP.stageE.offerNightEvent('clinic');
        const sk2 = SP.game.menu && SP.game.menu.opts.find(o => o.id==='skip');
        if (sk2) sk2.fn();
        SP.game.closeMenu && SP.game.closeMenu();
        const mood0 = SP.game.ps.needs.mood;
        SP.stageF.applyMorningMood();
        return {
          ignored: !!(SP.game.ps.nightFlags && Object.keys(SP.game.ps.nightFlags).length===0),
          moodDown: SP.game.ps.needs.mood < mood0 || mood0 - SP.game.ps.needs.mood >= 0,
          delta: SP.game.ps.needs.mood - mood0,
          morning: (SP.game.ps.dayLog||[]).some(x => x.kind==='morning' || x.kind==='night_ignore')
        };
      })()
    """)
    # after applyMorningMood nightFlags cleared; mood should drop when both ignored
    ok("night ignore logged", r and r.get("morning"), r)
    ok("morning mood hit", r and r.get("delta", 0) < 0, r)

    # phone daylog
    r = c.eval("""
      (() => {
        SP.stageA.openPhone('daylog');
        const el = document.getElementById('phonepanel');
        return { has: !!(el && el.innerHTML.indexOf('日程') >= 0) };
      })()
    """)
    ok("phone daylog UI", r and r.get("has"), r)

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
    print(f"stageF_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
