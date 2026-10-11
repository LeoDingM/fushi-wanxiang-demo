"""Stage K screenshots k1–k6."""
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
        if c.eval("!!window.__protoReady && !!SP.stageK"): break

def shot(name, js, wait=0.28):
    nav()
    c.eval(js)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world && SP.world.sceneId"))

shot("k1-scan-day-filter.png", DAY + """
SP.actions.go('stair_xin_1f'); SP.actions.idle(0.2); """ + R + """
SP.game.ps.scanLog=[
  {day:0,t:'08:10',ok:true,detail:'临时通行'},
  {day:1,t:'09:02',ok:true,detail:'续期通行'},
  {day:1,t:'19:40',ok:false,detail:'访客登记'}
];
SP.game.ps.scanFilterDay=1;
SP.game.ps.flags.missed_scan_pending=true;
SP.stageA.openPhone('scanlog');
""", wait=0.4)

shot("k2-missed-scan-quiz.png", DAY + """
SP.actions.go('street',[-2,11,'S']); SP.actions.idle(0.2); """ + R + """
SP.game.ps.flags.missed_scan_pending=true;
SP.game.ps.flags.missed_scan_quiz_done=false;
SP.game.ps.flags.missed_scan_force=true;
SP.stageK.maybeGateScanQuiz();
""")

shot("k3-outfit-mood.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=1.8; SP.player.y=1.4; SP.player.setDir('S');
SP.actions.idle(0.25); """ + R + """
SP.stageH.ensure(); SP.game.ps.clothes.worn_h=14;
SP.game.ps.wearNotices={x:1};
SP.appearance.setOutfitId((SP.appearance.PLAYER_LOOKS.find(l=>l.id!==SP.appearance.getOutfitId())||SP.appearance.PLAYER_LOOKS[0]).id);
SP.toast('换装清爽·心情+4（演示）', 4500);
""")

shot("k4-chip-rain-ot.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=3; SP.player.y=2.6; SP.player.setDir('W');
SP.actions.idle(0.2); """ + R + """
SP.stageH.ensure();
SP.clock.setWeather('rain',0.9,true,true);
SP.game.ps.flags.on_shift=true;
SP.game.ps.clothes.worn_h=16;
SP.game.hud(true);
SP.toast('雨天·加班磨损提示（衣服芯片着色）', 4500);
""")

shot("k5-rx-expiry.png", DAY + """
SP.actions.go('civic_hospital'); SP.stageD.syncCivicNpcs();
SP.player.x=5.8; SP.player.y=3.0; SP.player.setDir('W');
SP.actions.idle(0.3); """ + R + """
SP.stageE.ensureBag().length=0;
const it=SP.stageE.giveItem('rx_slip','门诊处方');
it.expiresDay=SP.stageF.dayKey()-1;
SP.stageD.ensure().hospital.seen=true;
SP.stageD.ensure().hospital.script='感冒冲剂';
SP.stageD.ensure().hospital.bought=false;
SP.stageD.pharmacyMenu({interact:'pharmacy',_name:'药房'});
""")

shot("k6-daylog-merge.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.15); """ + R + """
SP.game.ps.flags.missed_scan_pending=true;
SP.game.ps.scanLog=[{day:0,ok:true,detail:'通行'}];
SP.stageA.openPhone('daylog');
""", wait=0.4)

print("stageK", c.eval("!!SP.stageK"), "npc", c.eval("SP.stageD.NPC_SPEC.civic_police.set"))
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("done")
