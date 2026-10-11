"""Stage M screenshots m1–m6."""
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
        if c.eval("!!window.__protoReady && !!SP.stageM"): break

def shot(name, js, wait=0.32):
    nav()
    c.eval(js)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world && SP.world.sceneId"))

shot("m1-gate-ticket-wx.png", DAY + """
SP.actions.go('street',[-2,11,'S']); SP.actions.idle(0.15); """ + R + """
SP.game.ps.flags.gate_followup_pending=true;
SP.game.ps.flags.gate_followup_done=false;
SP.game.ps.flags.gate_followup_day=0;
SP.game.ps.flags.missed_scan_pending=true;
SP.game.ps.flags.missed_scan_quiz_done=false;
SP.game.ps.flags.gate_unified_force=true;
SP.game.ps.flags.gate_unified_done_today=-1;
SP.game.ps.gateTickets=[];
SP.stageL.maybeUnifiedGateQuiz();
const both=(SP.game.menu.opts||[]).find(o=>o.id==='both');
if(both) both.fn();
SP.game.closeMenu&&SP.game.closeMenu();
SP.stageA.openPhone('wechat','property');
""", wait=0.45)

shot("m2-missed-dose.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=3; SP.player.y=2.6; SP.player.setDir('W');
SP.actions.idle(0.2); """ + R + """
SP.stageL.startRxCourse('感冒药');
SP.stageM.applyMissedDosePenalty('昨日未打卡');
SP.toast('漏服惩罚演示', 4500);
""")

shot("m3-soft-wardrobe.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=1.8; SP.player.y=1.4; SP.player.setDir('S');
SP.actions.idle(0.25); """ + R + """
SP.clock.setWeather('snow',0.85,true,true);
SP.game.ps.flags.outfit_suggest_open=false;
SP.stageJ.suggestChangeOutfit();
""")

shot("m4-hour-strip.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.daylogView='week';
const d=SP.stageM.dayKey();
SP.stageG._calOpen=d;
SP.game.ps.hourStripDay=d;
SP.game.ps.hourStripHour=14;
SP.game.ps.dayLog=[
  {day:d,t:'09:10',kind:'scan',text:'进门扫码',place:'xin'},
  {day:d,t:'14:20',kind:'bus',text:'公交出行',place:'bus'},
  {day:d,t:'19:40',kind:'gate',text:'门岗核验',place:'gate'}
];
SP.stageA.openPhone('daylog');
""", wait=0.45)

shot("m5-scan-archive.png", DAY + """
SP.actions.go('stair_xin_1f'); SP.actions.idle(0.15); """ + R + """
SP.game.ps.scanLog=[
  {day:0,t:'08:00',ok:true,detail:'通行'},
  {day:1,t:'12:00',ok:false,detail:'访客'}
];
SP.game.ps.scanArchive=[];
SP.stageM.archiveScans();
SP.stageA.openPhone('scanlog');
""", wait=0.4)

shot("m6-long-image.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
if(!(SP.game.ps.scanArchive&&SP.game.ps.scanArchive.length)){
  SP.game.ps.scanLog=[{day:0,t:'08:00',ok:true,detail:'通行'},{day:0,t:'18:00',ok:true,detail:'出门'}];
  SP.stageM.archiveScans();
}
const url=SP.stageM.renderLongImage(SP.game.ps.scanArchive[0]);
SP.stageM.openLongImagePreview(url);
""", wait=0.45)

print("stageM", c.eval("!!SP.stageM"), "npc", c.eval("SP.stageD.NPC_SPEC.civic_police.set"))
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("done")
