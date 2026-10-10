"""Stage S: rating discounts, med heatmap, seasonal favs, commute alarm, notif order."""
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
        if c.eval("!!window.__protoReady && !!SP.stageS && !!SP.game && !!SP.game._stageS"):
            break
    c.eval("if (SP.stageS && SP.stageS.install) SP.stageS.install()")
    ok("boot stageS", c.eval("!!SP.stageS && !!SP.game.ps && !!SP.game._stageS"))
    ok("NPC_SPEC untouched", True, c.eval("SP.stageD.NPC_SPEC.civic_police.set"))

    # 1 rating → fee discount + deposit
    r = c.eval("""
      (() => {
        SP.game.ps.propertyRating = 4.6;
        SP.game.ps.flags.deposit_discount_used = false;
        SP.game.ps.flags.deposit_discount = 0;
        const disc = SP.stageS.renewFeeDiscount();
        const bonus = SP.stageS.syncDepositFromRating();
        SP.game.ps.money = 500;
        SP.stageH.ensure();
        const money0 = SP.game.ps.money;
        SP.stageH.renewByFee();
        const paid = money0 - SP.game.ps.money;
        SP.stageH.openRenewMenu();
        const labels = (SP.game.menu && SP.game.menu.opts || []).map(o => o.label).join('|');
        if (SP.game.menu) SP.game.closeMenu();
        return {
          pct: disc.pct, bonus, paid,
          cheap: paid < 45 && paid > 0,
          menu: labels.indexOf('信用') >= 0 || labels.indexOf('优待') >= 0
        };
      })()
    """)
    ok("rating renew/deposit perks", r and r.get("pct") == 0.2 and r.get("bonus") == 50 and r.get("cheap") and r.get("menu"), r)

    # 2 heatmap
    r = c.eval("""
      (() => {
        const d = SP.stageS.dayKey();
        SP.game.ps.rxDoseLog = [
          { day: d, ok: true },
          { day: d - 1, ok: true },
          { day: d - 2, ok: false },
          { day: d - 3, ok: true }
        ];
        const days = SP.stageS.medHeatmapDays();
        const html = SP.stageS.renderHeatmap();
        SP.stageA.openPhone('health');
        const el = document.getElementById('phonepanel');
        const h = el && el.innerHTML || '';
        return {
          n: days.length === 7,
          taken: days.some(x => x.status === 'taken'),
          missed: days.some(x => x.status === 'missed'),
          ui: html.indexOf('s-heat') >= 0,
          inHealth: h.indexOf('s-heat-cell') >= 0
        };
      })()
    """)
    ok("med heatmap", r and r.get("n") and r.get("taken") and r.get("missed") and r.get("ui") and r.get("inHealth"), r)

    # 3 seasonal fav pin
    r = c.eval("""
      (() => {
        SP.clock.season = 'winter';
        SP.game.ps.wardrobeFavs = ['casual', 'winter', 'uniform'];
        const sorted = SP.stageS.sortedFavorites();
        const html = SP.stageR.renderFavs();
        return {
          season: sorted.season,
          first: sorted.favs[0],
          pinned: sorted.pinned.indexOf('winter') >= 0,
          html: html.indexOf('置顶') >= 0 && html.indexOf('s-pinned') >= 0
        };
      })()
    """)
    ok("seasonal fav pin", r and r.get("first") == "winter" and r.get("pinned") and r.get("html"), r)

    # 4 commute alarm
    r = c.eval("""
      (() => {
        SP.game.ps.itinReplay = [];
        SP.stageP.logItinStep('bus', '公交站');
        SP.stageP.logItinStep('store', '便利店');
        const tpl = SP.stageR.saveCommuteTemplate('早班通勤');
        SP.game.ps.commuteAlarms = [];
        const alarm = SP.stageS.setCommuteAlarm(tpl.id, 7);
        SP.game.ps.flags.commute_alarm_force = true;
        alarm.lastFiredDay = null;
        SP.stageS.maybeCommuteAlarm();
        const html = SP.stageP.renderItinReplay();
        return {
          alarm: !!(alarm && alarm.hour === 7),
          fired: alarm.lastFiredDay === SP.stageS.dayKey(),
          ui: html.indexOf('data-commute-alarm') >= 0
        };
      })()
    """)
    ok("commute morning alarm", r and r.get("alarm") and r.get("fired") and r.get("ui"), r)

    # 5 notif collapse + order
    r = c.eval("""
      (() => {
        SP.game.ps.notifCollapsed = false;
        SP.game.ps.notifShortcuts = ['daylog', 'scanlog', 'ticket', 'health'];
        SP.stageS.renderNotifBar();
        const before = SP.stageS.shortcutList().map(x => x.id);
        SP.stageS.moveShortcut('health', -1);
        const mid = SP.stageS.shortcutList().map(x => x.id);
        SP.stageS.toggleNotifCollapse();
        const bar = document.getElementById('stageR-notif');
        const collapsed = bar && bar.classList.contains('s-collapsed');
        const bodyHidden = !!(bar && bar.querySelector('.s-notif-body.hidden'));
        SP.stageS.toggleNotifCollapse();
        return {
          before, mid,
          moved: mid.indexOf('health') < mid.indexOf('ticket') || mid.indexOf('health') !== before.indexOf('health'),
          collapsed, bodyHidden,
          hasCollapse: !!(bar && bar.querySelector('[data-s-collapse]'))
        };
      })()
    """)
    ok("notif collapse + order", r and r.get("hasCollapse") and r.get("collapsed") and r.get("bodyHidden") and r.get("moved"), r)

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
    print(f"stageS_test {len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)
