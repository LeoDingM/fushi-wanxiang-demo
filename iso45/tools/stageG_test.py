"""Stage G: receipt access/discount, laundry UI, daylog calendar, gate follow-up."""
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
    time.sleep(0.1)

def run(c, log):
    def ok(name, cond, info=""):
        log.append(("PASS " if cond else "FAIL ") + name + ((" — " + str(info)) if info != "" else ""))
        return cond
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(100):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.stageG && !!SP.stageF"):
            break
    ok("boot stageG", c.eval("!!SP.stageG && !!SP.game.ps"))
    # NPC_SPEC not overwritten by G
    r = c.eval("!!SP.stageD && !!SP.stageD.NPC_SPEC && SP.stageD.NPC_SPEC.civic_police.set")
    ok("NPC_SPEC left alone", bool(r), r)
    c.eval("SP.clock.setTimeName && SP.clock.setTimeName('day', true)")

    # receipt → access + discount
    r = c.eval("""
      (() => {
        SP.stageG.ensure();
        SP.game.ps.shownTo = {};
        SP.game.ps.flags = {};
        SP.stageE.giveItem('police_receipt','测');
        SP.stageF.presentItem('property','police_receipt');
        const access = SP.stageG.accessOk();
        SP.stageF.presentItem('landlord','police_receipt');
        return {
          access,
          until: !!SP.game.ps.flags.xin_access_until,
          disc: SP.game.ps.flags.deposit_discount,
          logs: (SP.game.ps.dayLog||[]).some(x => x.kind==='access' || x.kind==='discount')
        };
      })()
    """)
    ok("property access unlock", r and r.get("access") and r.get("until"), r)
    ok("landlord deposit discount", r and r.get("disc") == 100, r)
    ok("reward dayLog", r and r.get("logs"), r)

    # discounted rent
    r = c.eval("""
      (() => {
        const H = SP.stageA.ensureHousing();
        H.owned = ['2F-02']; H.home = '2F-02'; H.deposits = {'2F-02': 850};
        SP.game.ps.money = 5000;
        SP.game.ps.flags.deposit_discount = 100;
        SP.game.ps.flags.deposit_discount_used = false;
        const m0 = SP.game.ps.money;
        SP.stageA.rentUnit('1F-xin-b');
        const U = SP.stageA.units()['1F-xin-b'];
        const full = U.rent + U.rent; // deposit_months 1
        const paid = m0 - SP.game.ps.money;
        return {
          owned: H.owned.includes('1F-xin-b'),
          paid,
          expect: full - 100,
          used: !!SP.game.ps.flags.deposit_discount_used,
          dep: H.deposits['1F-xin-b']
        };
      })()
    """)
    ok("rent with discount", r and r.get("owned") and r.get("paid") == r.get("expect"), r)

    # laundry menu on xin_102
    enter(c, "room_xin_102")
    r = c.eval("""
      (() => {
        if (!SP.game.ps.clothes) {
          const L = SP.game.rules.data.laundry;
          SP.game.ps.clothes = { clean: L.start.clean, dirty: Math.max(2, L.start.dirty), worn_h: 0, washer: null, rack: {} };
        }
        const w = SP.world.byId.washer;
        SP.game.use(w);
        const m = SP.game.menu;
        const ids = m && m.opts ? m.opts.map(o => o.id) : [];
        SP.game.closeMenu && SP.game.closeMenu();
        const hint = SP.stageG.laundryHint();
        return { ids, hint, poles: (SP.world.laundry||[]).length };
      })()
    """)
    ok("laundry menu", r and r.get("ids") and "hang" in r["ids"] and "collect" in r["ids"], r)
    ok("laundry poles", r and r.get("poles", 0) >= 2, r)

    # wash → hang → fast dry → collect
    r = c.eval("""
      (() => {
        const cl = SP.game.ps.clothes;
        cl.dirty = Math.max(2, cl.dirty||0);
        cl.washer = null; cl.rack = {};
        // start wash via rules
        const r1 = SP.game.start('wash_clothes', SP.world.byId.washer);
        // force washer done
        if (cl.washer) cl.washer.done = SP.clock.abs() - 1;
        SP.game.start('hang_clothes', SP.world.byId.washer);
        const hung = !!(cl.rack && cl.rack.balcony);
        // fast dry
        if (cl.rack.balcony) cl.rack.balcony.wet = 0.05;
        SP.game.syncLaundry && SP.game.syncLaundry();
        const r3 = SP.game.start('collect_clothes', SP.world.byId.rack);
        return {
          hung,
          collected: !(cl.rack && cl.rack.balcony),
          clean: cl.clean,
          okCollect: !r3 || r3.ok !== false
        };
      })()
    """)
    ok("laundry hang", r and r.get("hung"), r)
    ok("laundry collect", r and r.get("collected"), r)

    # daylog calendar fold + jump API
    r = c.eval("""
      (() => {
        SP.stageF.pushLog('bus', '公交到站测试', { place: 'bus' });
        SP.stageF.pushLog('access', '门禁测试', { place: 'xin' });
        const html = SP.stageG.renderCalendar();
        const hasFold = html.indexOf('pcal-fold') >= 0;
        SP.stageA.openPhone('daylog');
        const el = document.getElementById('phonepanel');
        const ui = !!(el && el.innerHTML.indexOf('pcal') >= 0);
        return { hasFold, ui, poi: !!SP.stageG.POI.bus };
      })()
    """)
    ok("calendar fold HTML", r and r.get("hasFold") and r.get("ui"), r)

    # gate follow-up after ignore
    r = c.eval("""
      (() => {
        SP.stageG.ensure();
        SP.game.ps.flags.gate_followup_pending = true;
        SP.game.ps.flags.gate_followup_done = false;
        SP.game.ps.flags.gate_followup_day = 0;
        SP.game.ps.flags.gate_followup_force = true;
        SP.place.enter('street', [-2, 11, 'S']);
        SP.clock.setTimeName && SP.clock.setTimeName('day', true);
        SP.stageG.maybeGateFollowup();
        const menu = !!(SP.game.menu && SP.game.menu.opts && SP.game.menu.opts.some(o => o.id==='explain'));
        if (SP.game.menu) {
          const ex = SP.game.menu.opts.find(o => o.id==='explain');
          if (ex) ex.fn();
        }
        SP.game.closeMenu && SP.game.closeMenu();
        return { menu, done: !!SP.game.ps.flags.gate_followup_done,
          log: (SP.game.ps.dayLog||[]).some(x => x.kind==='gate_followup') };
      })()
    """)
    ok("gate follow-up menu", r and r.get("menu"), r)
    ok("gate follow-up log", r and r.get("log"), r)

    # morning persists pending
    r = c.eval("""
      (() => {
        SP.game.ps.nightFlags = { ignoredPolice: true };
        SP.game.ps.flags.gate_followup_pending = false;
        SP.game.ps.flags.gate_followup_done = false;
        SP.stageF.applyMorningMood();
        return { pending: !!SP.game.ps.flags.gate_followup_pending };
      })()
    """)
    ok("morning sets gate pending", r and r.get("pending"), r)

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
    print(f"stageG_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
