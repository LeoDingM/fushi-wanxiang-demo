"""Stage S screenshots s1–s6."""
import os, sys, time, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
DAY = "SP.clock.setTimeName&&SP.clock.setTimeName('day',true);"
R = "for (let k=0;k<40;k++) __proto.render();"

p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def nav():
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(120):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.stageS && !!SP.game._stageS"): break
    c.eval("if(SP.stageS&&SP.stageS.install)SP.stageS.install()")

def shot(name, js, wait=0.32):
    nav()
    c.eval(js)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world && SP.world.sceneId"))

shot("s1-rating-renew.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.propertyRating=4.6;
SP.stageS.syncDepositFromRating();
SP.stageH.openRenewMenu();
""")

shot("s2-med-heatmap.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
const d=SP.stageS.dayKey();
SP.game.ps.rxDoseLog=[{day:d,ok:true},{day:d-1,ok:true},{day:d-2,ok:false},{day:d-3,ok:true},{day:d-4,ok:false}];
SP.stageL.startRxCourse('热力演示');
SP.stageA.openPhone('health');
""", wait=0.45)

shot("s3-seasonal-favs.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=3; SP.player.y=2.6; SP.player.setDir('W');
SP.actions.idle(0.2); """ + R + """
SP.clock.season='winter';
SP.game.ps.wardrobeFavs=['casual','uniform','winter'];
SP.stageA.openPhone('health');
""", wait=0.4)

shot("s4-commute-alarm.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.itinReplay=[];
SP.stageP.logItinStep('bus','公交站');
SP.stageP.logItinStep('store','24便利店');
SP.stageP.logItinStep('gate','门岗');
const tpl=SP.stageR.saveCommuteTemplate('早班通勤');
SP.stageS.setCommuteAlarm(tpl.id,7);
SP.game.ps.daylogView='week';
SP.stageA.openPhone('daylog');
""", wait=0.45)

shot("s5-notif-collapsed.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.15); """ + R + """
SP.game.ps.notifCollapsed=false;
SP.stageS.renderNotifBar();
SP.stageR.pushNotif('可折叠捷径栏', 'fushi://app/daylog');
SP.stageS.toggleNotifCollapse();
""")

shot("s6-notif-order.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.15); """ + R + """
SP.game.ps.notifCollapsed=false;
SP.game.ps.notifShortcuts=['health','ticket','scanlog','daylog'];
SP.stageS.renderNotifBar();
SP.stageR.pushNotif('自定义顺序：健康优先', 'fushi://app/health');
""")

print("stageS", c.eval("!!SP.stageS"), "npc", c.eval("SP.stageD.NPC_SPEC.civic_police.set"))
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("done")
