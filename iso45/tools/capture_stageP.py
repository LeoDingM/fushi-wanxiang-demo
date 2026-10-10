"""Stage P screenshots p1–p6."""
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
        if c.eval("!!window.__protoReady && !!SP.stageP"): break

def shot(name, js, wait=0.32):
    nav()
    c.eval(js)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world && SP.world.sceneId"))

shot("p1-property-visit.png", DAY + """
SP.actions.go('street',[82,15,'S']); SP.actions.idle(0.15); """ + R + """
SP.game.ps.gateTickets=[{id:'GT-OV-1',status:'待跟进',day:0,dueDay:SP.stageP.dayKey()-1,reasons:['漏扫码']}];
SP.stageP.openPropertyVisit('GT-OV-1');
""")

shot("p2-care-sm.png", DAY + """
SP.actions.go('civic_hospital'); SP.stageD.syncCivicNpcs&&SP.stageD.syncCivicNpcs();
SP.player.x=5.8; SP.player.y=3.0; SP.player.setDir('W');
SP.actions.idle(0.25); """ + R + """
SP.stageD.ensure().hospital.seen=true;
SP.stageD.ensure().hospital.script='感冒冲剂';
SP.stageD.ensure().hospital.bought=false;
SP.stageP.setCarePhase('pharmacy',{script:'感冒冲剂'});
SP.stageD.pharmacyMenu({interact:'pharmacy',_name:'药房'});
""")

shot("p3-tryon-restore.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=3; SP.player.y=2.6; SP.player.setDir('W');
SP.actions.idle(0.2); """ + R + """
SP.stageH.ensure();
SP.appearance.setOutfitId&&SP.appearance.setOutfitId('casual');
SP.stageN.tryOnLook('winter');
SP.game.hud(true);
SP.toast('点击试穿徽章可还原', 4000);
""")

shot("p4-itin-replay.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.itinReplay=[];
SP.stageP.logItinStep('bus','公交站');
SP.stageP.logItinStep('store','24便利店');
SP.stageP.logItinStep('tea','茶语奶茶');
SP.game.ps.daylogView='week';
SP.stageA.openPhone('daylog');
""", wait=0.45)

shot("p5-qr-deeplink.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.scanLog=[{day:0,t:'08:00',ok:true,detail:'通行'}];
SP.game.ps.scanArchive=[];
SP.stageM.archiveScans();
const url=SP.stageM.renderLongImage(SP.game.ps.scanArchive[0]);
SP.stageM.openLongImagePreview(url);
""", wait=0.45)

shot("p6-deeplink-scanlog.png", DAY + """
SP.actions.go('stair_xin_1f'); SP.actions.idle(0.15); """ + R + """
SP.game.ps.scanLog=[{day:0,t:'08:00',ok:true,detail:'通行'},{day:1,t:'09:00',ok:false,detail:'访客'}];
SP.stageP.openScanDeepLink();
""", wait=0.4)

print("stageP", c.eval("!!SP.stageP"), "npc", c.eval("SP.stageD.NPC_SPEC.civic_police.set"))
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("done")
