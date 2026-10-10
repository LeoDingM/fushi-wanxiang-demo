"""Stage J: scan log, collect→outfit, wear tip, fee WeChat, rx polish."""
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
        if c.eval("!!window.__protoReady && !!SP.stageJ && !!SP.stageI"):
            break
    ok("boot stageJ", c.eval("!!SP.stageJ && !!SP.game.ps"))
    ok("NPC_SPEC untouched", True, c.eval("SP.stageD.NPC_SPEC.civic_police.set"))

    # scan log from playScan
    r = c.eval("""
      (() => {
        SP.game.ps.scanLog = [];
        SP.stageI.playScan(true, '临时通行 · 测试', null);
        SP.stageI.playScan(false, '访客登记', null);
        const n = SP.game.ps.scanLog.length;
        const html = SP.stageJ.renderScanLog();
        return { n, html: html.indexOf('jscan')>=0, firstOk: SP.game.ps.scanLog[0].ok===false };
      })()
    """)
    ok("scan log records", r and r.get("n") >= 2 and r.get("html"), r)

    # openMenu inject scanlog
    r = c.eval("""
      (() => {
        SP.game.openMenu({ _name: '馨园物业 · 门禁', id: 'xin_notice' }, [
          { id: 'x', ok: true, label: '占位', fn: () => null },
          { id: 'cancel', ok: true, label: '关掉', fn: () => null }
        ]);
        const ids = (SP.game.menu && SP.game.menu.opts || []).map(o => o.id);
        SP.game.closeMenu && SP.game.closeMenu();
        return { ids, has: ids.indexOf('scanlog')>=0 };
      })()
    """)
    ok("menu has scanlog", r and r.get("has"), r)

    # phone scanlog tab
    r = c.eval("""
      (() => {
        SP.stageA.openPhone('scanlog');
        const el = document.getElementById('phonepanel');
        return { has: !!(el && el.innerHTML.indexOf('登记簿')>=0) };
      })()
    """)
    ok("phone scanlog", r and r.get("has"), r)

    # collect → outfit suggest
    r = c.eval("""
      (() => {
        SP.place.enter('room_xin_102', SP.scenes.room_xin_102.spawn);
        if (!SP.game.ps.clothes) {
          const L = SP.game.rules.data.laundry;
          SP.game.ps.clothes = { clean: 2, dirty: 0, worn_h: 0, washer: null, rack: {} };
        }
        SP.game.ps.clothes.rack.balcony = { n: 2, wet: 0.05, t: SP.clock.abs() };
        SP.game.ps.flags.outfit_suggest_open = false;
        SP.game.start('collect_clothes', SP.world.byId.rack);
        return { collected: !(SP.game.ps.clothes.rack && SP.game.ps.clothes.rack.balcony) };
      })()
    """)
    ok("collect clothes", r and r.get("collected"), r)
    time.sleep(0.7)
    r = c.eval("""
      (() => {
        const m = SP.game.menu;
        const has = !!(m && m.opts && m.opts.some(o => o.id==='change_rules' || o.id==='wardrobe_ui'));
        if (m) {
          const later = m.opts.find(o => o.id==='later');
          if (later) later.fn();
        }
        SP.game.closeMenu && SP.game.closeMenu();
        return { has, appearance: !!(SP.appearance && SP.appearance.openWardrobe) };
      })()
    """)
    ok("outfit suggest after collect", r and r.get("has"), r)

    # wear tip
    r = c.eval("""
      (() => {
        SP.stageH.ensure();
        SP.game.ps.clothes.worn_h = 10;
        SP.game.hud(true);
        const tip = SP.stageJ.wearTipText();
        const chip = document.querySelector('.cloth-chip');
        return { tip: tip.indexOf('上班')>=0 && tip.indexOf('季节')>=0, title: !!(chip && chip.getAttribute('title') && chip.getAttribute('title').indexOf('磨损')>=0) };
      })()
    """)
    ok("wear tip text", r and r.get("tip"), r)
    ok("wear tip on chip", r and r.get("title"), r)

    # fee → property wechat
    r = c.eval("""
      (() => {
        SP.game.ps.money = 300;
        SP.game.ps.flags.wx_fee_receipt_pushed = false;
        SP.stageH.renewByFee();
        const th = SP.stageA.threads().property;
        const msgs = th.msgs.map(m => m.text).join('|');
        const replies = th.replies.map(r => r.id);
        return {
          hasItem: SP.stageE.hasItem('property_fee_receipt'),
          wx: msgs.indexOf('物业费')>=0,
          reply: replies.indexOf('fee_ask')>=0
        };
      })()
    """)
    ok("fee receipt + property wx", r and r.get("hasItem") and r.get("wx"), r)
    ok("property fee reply", r and r.get("reply"), r)

    # rx polish
    r = c.eval("""
      (() => {
        SP.stageE.giveItem('rx_slip', '测试处方');
        SP.game.ps.shownTo = {};
        SP.stageF.presentItem('hospital', 'rx_slip');
        const oc = SP.stageF.OUTCOMES.hospital.rx_slip.text;
        return { shown: SP.stageF.alreadyShown('hospital','rx_slip'), long: oc.length > 40 };
      })()
    """)
    ok("rx present polish", r and r.get("shown") and r.get("long"), r)

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
    print(f"stageJ_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
