"""Stage K: scan day filter + missed quiz, outfit mood, chip tint, rx expiry, 门禁↔todos."""
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
        if c.eval("!!window.__protoReady && !!SP.stageK && !!SP.stageJ"):
            break
    ok("boot stageK", c.eval("!!SP.stageK && !!SP.game.ps && !!SP.game._stageK"))
    ok("NPC_SPEC untouched", True, c.eval("SP.stageD.NPC_SPEC.civic_police.set"))

    # 1 day filter
    r = c.eval("""
      (() => {
        SP.game.ps.scanLog = [
          {day:0,t:'08:00',ok:true,detail:'D0 进'},
          {day:1,t:'09:00',ok:true,detail:'D1 进'},
          {day:1,t:'18:00',ok:false,detail:'D1 访'}
        ];
        SP.game.ps.scanFilterDay = 1;
        const rows = SP.stageK.filteredScans();
        const html = SP.stageK.renderScanLogFiltered();
        return { n: rows.length, allD1: rows.every(x=>x.day===1), filt: html.indexOf('kfilt')>=0, d1on: html.indexOf('data-kday="1"')>=0 };
      })()
    """)
    ok("scan day filter", r and r.get("n")==2 and r.get("allD1") and r.get("filt"), r)

    # phone scanlog merges todos + filter
    r = c.eval("""
      (() => {
        SP.game.ps.flags.missed_scan_pending = true;
        SP.stageA.openPhone('scanlog');
        const el = document.getElementById('phonepanel');
        const h = el && el.innerHTML || '';
        return { filt: h.indexOf('kfilt')>=0, todo: h.indexOf('待办')>=0 || h.indexOf('未扫码')>=0 };
      })()
    """)
    ok("phone scanlog filter+todos", r and r.get("filt") and r.get("todo"), r)

    # missed scan quiz force
    r = c.eval("""
      (() => {
        SP.game.closeMenu && SP.game.closeMenu();
        SP.game.ps.flags.missed_scan_pending = true;
        SP.game.ps.flags.missed_scan_quiz_done = false;
        SP.game.ps.flags.missed_scan_force = true;
        SP.place.enter('street', [ -2, 11, 'S' ]);
        SP.player.x = -2; SP.player.y = 11;
        SP.clock.setTimeName && SP.clock.setTimeName('day', true);
        SP.stageK.maybeGateScanQuiz();
        const m = SP.game.menu;
        const ids = (m && m.opts || []).map(o => o.id);
        if (m) SP.game.closeMenu();
        return { has: ids.indexOf('explain')>=0 && ids.indexOf('show_log')>=0, ids };
      })()
    """)
    ok("missed-scan gate quiz", r and r.get("has"), r)

    # 2 outfit → clear wear + mood
    r = c.eval("""
      (() => {
        SP.stageH.ensure();
        SP.game.ps.clothes.worn_h = 15;
        SP.game.ps.wearNotices = { a: 1, b: 2 };
        const mood0 = SP.game.ps.needs.mood;
        const looks = SP.appearance.PLAYER_LOOKS || [];
        const cur = SP.appearance.getOutfitId();
        const next = looks.find(l => l.id !== cur) || looks[0];
        SP.appearance.setOutfitId(next.id);
        return {
          worn: SP.game.ps.clothes.worn_h,
          notices: Object.keys(SP.game.ps.wearNotices||{}).length,
          mood: SP.game.ps.needs.mood - mood0,
          id: SP.appearance.getOutfitId()
        };
      })()
    """)
    ok("outfit clears wear + mood", r and r.get("worn")==0 and r.get("notices")==0 and r.get("mood")>=3.5, r)

    # 3 rain/OT chip tint
    r = c.eval("""
      (() => {
        SP.stageH.ensure();
        SP.clock.setWeather && SP.clock.setWeather('rain', 0.8, true, true);
        SP.game.ps.flags.on_shift = true;
        SP.game.hud(true);
        const chip = document.querySelector('.cloth-chip');
        const cls = chip ? chip.className : '';
        return { wet: cls.indexOf('wet')>=0, ot: cls.indexOf('ot')>=0, cls };
      })()
    """)
    ok("chip rain/OT tint", r and r.get("wet") and r.get("ot"), r)

    # 4 rx expiry
    r = c.eval("""
      (() => {
        SP.stageE.ensureBag().length = 0;
        const it = SP.stageE.giveItem('rx_slip', '测试处方');
        const stamped = it && it.expiresDay != null;
        const day = SP.stageF.dayKey();
        it.expiresDay = day - 1;
        SP.game.ps.shownTo = {};
        SP.stageF.presentItem('hospital', 'rx_slip');
        const blocked = !SP.stageF.alreadyShown('hospital','rx_slip');
        // fresh valid
        it.expiresDay = day + 2;
        SP.game.ps.shownTo = {};
        SP.stageF.presentItem('hospital', 'rx_slip');
        const okPresent = SP.stageF.alreadyShown('hospital','rx_slip');
        return { stamped, blocked, okPresent, expires: it.expiresDay };
      })()
    """)
    ok("rx stamp + expiry block", r and r.get("stamped") and r.get("blocked") and r.get("okPresent"), r)

    # pharmacy status on menu
    r = c.eval("""
      (() => {
        const it = SP.stageE.ensureBag().find(x => x.id==='rx_slip');
        if (it) it.expiresDay = SP.stageF.dayKey() + 1;
        SP.stageD.ensure().hospital.seen = true;
        SP.stageD.ensure().hospital.script = '测试药';
        SP.stageD.ensure().hospital.bought = false;
        SP.stageD.pharmacyMenu({ interact: 'pharmacy', _name: '药房' });
        const ids = (SP.game.menu && SP.game.menu.opts || []).map(o => o.id);
        const labels = (SP.game.menu && SP.game.menu.opts || []).map(o => o.label).join('|');
        SP.game.closeMenu && SP.game.closeMenu();
        return { status: ids.indexOf('rx_status')>=0, until: labels.indexOf('有效至')>=0 };
      })()
    """)
    ok("pharmacy rx status", r and r.get("status") and r.get("until"), r)

    # 5 merge todos
    r = c.eval("""
      (() => {
        SP.game.ps.flags.missed_scan_pending = true;
        SP.game.ps.scanLog = [{day:0,ok:true,detail:'x'}];
        const todos = SP.stageH.listTodos();
        const ids = todos.map(t => t.id);
        const html = SP.stageH.renderTodos();
        return {
          miss: ids.indexOf('missed_scan')>=0,
          scan: ids.indexOf('scanlog')>=0,
          link: html.indexOf('data-open-scanlog')>=0
        };
      })()
    """)
    ok("todos merge 门禁", r and r.get("miss") and r.get("scan") and r.get("link"), r)

    r = c.eval("""
      (() => {
        SP.stageA.openPhone('daylog');
        const el = document.getElementById('phonepanel');
        const h = el && el.innerHTML || '';
        return { link: h.indexOf('门禁登记')>=0 || h.indexOf('data-open-scanlog')>=0 };
      })()
    """)
    ok("daylog has 门禁 link", r and r.get("link"), r)

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
    print(f"stageK_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
