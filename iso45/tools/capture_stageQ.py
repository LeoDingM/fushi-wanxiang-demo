"""Stage Q screenshots q1–q6."""
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
    for _ in range(100):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.stageQ"): break

def shot(name, js, wait=0.32):
    nav()
    c.eval(js)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world && SP.world.sceneId"))

shot("q1-visit-slots.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.gateTickets=[{id:'GT-Q-1',status:'待跟进',day:0,dueDay:SP.stageQ.dayKey()-1,reasons:['漏扫码']}];
SP.stageQ.openVisitBooking('GT-Q-1');
""")

shot("q2-health-page.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.stageP.setCarePhase('course',{script:'感冒药'});
SP.stageL.startRxCourse('演示疗程');
SP.stageA.openPhone('health');
""", wait=0.4)

shot("q3-tryon-stack.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=3; SP.player.y=2.6; SP.player.setDir('W');
SP.actions.idle(0.2); """ + R + """
SP.stageH.ensure();
SP.game.ps.tryOnStack=[];
SP.appearance.setOutfitId&&SP.appearance.setOutfitId('casual');
SP.stageN.tryOnLook('winter');
SP.stageN.tryOnLook('uniform');
SP.game.hud(true);
SP.toast('试穿撤销栈 ↩×n', 4000);
""")

shot("q4-route-wx.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.itinReplay=[];
SP.stageP.logItinStep('bus','公交站');
SP.stageP.logItinStep('noodles','兰州牛肉面');
SP.stageP.logItinStep('tea','茶语奶茶');
SP.stageQ.shareRouteSummary('roommate');
SP.stageA.openPhone('wechat','roommate');
""", wait=0.45)

shot("q5-deeplink-daylog.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.stageQ.handleDeepLink('fushi://app/daylog');
""", wait=0.4)

shot("q6-deeplink-ticket.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.scanLog=[{day:0,t:'08:00',ok:true,detail:'通行'}];
SP.game.ps.scanArchive=[];
SP.stageM.archiveScans();
SP.stageM.openLongImagePreview(SP.stageM.renderLongImage(SP.game.ps.scanArchive[0]));
""", wait=0.45)

print("stageQ", c.eval("!!SP.stageQ"), "npc", c.eval("SP.stageD.NPC_SPEC.civic_police.set"))
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("done")
