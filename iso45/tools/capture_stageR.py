"""Stage R screenshots r1–r6."""
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
        if c.eval("!!window.__protoReady && !!SP.stageR && !!SP.game._stageR"): break
    c.eval("if(SP.stageR&&SP.stageR.install)SP.stageR.install()")

def shot(name, js, wait=0.32):
    nav()
    c.eval(js)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world && SP.world.sceneId"))

shot("r1-visit-manage.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.propertyRating=3.8;
SP.game.ps.gateTickets=[{id:'GT-R',status:'待跟进',day:0,dueDay:0}];
SP.stageQ.bookVisitSlot('am1','GT-R');
SP.stageR.openVisitManage();
""")

shot("r2-weekly-med.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.rxDoseLog=[{day:SP.stageR.dayKey(),ok:true},{day:SP.stageR.dayKey()-1,ok:true},{day:SP.stageR.dayKey()-2,ok:false}];
SP.stageL.startRxCourse('周报演示');
SP.stageA.openPhone('health');
""", wait=0.4)

shot("r3-wardrobe-favs.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=3; SP.player.y=2.6; SP.player.setDir('W');
SP.actions.idle(0.2); """ + R + """
SP.stageH.ensure();
SP.game.ps.wardrobeFavs=['casual','winter'];
SP.appearance.setOutfitId&&SP.appearance.setOutfitId('winter');
SP.game.hud(true);
SP.stageA.openPhone('health');
""", wait=0.4)

shot("r4-commute-tpl.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.itinReplay=[];
SP.stageP.logItinStep('bus','公交站');
SP.stageP.logItinStep('store','24便利店');
SP.stageP.logItinStep('tea','茶语奶茶');
SP.stageR.saveCommuteTemplate('周常通勤');
SP.game.ps.daylogView='week';
SP.stageA.openPhone('daylog');
""", wait=0.45)

shot("r5-notif-bar.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.15); """ + R + """
SP.stageR.ensureNotifBar();
SP.stageR.pushNotif('工单待处理 · 点我', 'fushi://app/ticket');
""")

shot("r6-deeplink-health.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.stageR.routeDeepLink('fushi://app/health');
""", wait=0.4)

print("stageR", c.eval("!!SP.stageR"), "npc", c.eval("SP.stageD.NPC_SPEC.civic_police.set"))
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("done")
