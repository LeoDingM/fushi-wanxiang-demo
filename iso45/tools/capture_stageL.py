"""Stage L screenshots l1–l6."""
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
        if c.eval("!!window.__protoReady && !!SP.stageL"): break

def shot(name, js, wait=0.3):
    nav()
    c.eval(js)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world && SP.world.sceneId"))

shot("l1-unified-gate.png", DAY + """
SP.actions.go('street',[-2,11,'S']); SP.actions.idle(0.2); """ + R + """
SP.game.ps.flags.gate_followup_pending=true;
SP.game.ps.flags.gate_followup_done=false;
SP.game.ps.flags.gate_followup_day=0;
SP.game.ps.flags.missed_scan_pending=true;
SP.game.ps.flags.missed_scan_quiz_done=false;
SP.game.ps.flags.gate_unified_force=true;
SP.game.ps.flags.gate_unified_done_today=-1;
SP.stageL.maybeUnifiedGateQuiz();
""")

shot("l2-weather-outfit.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=1.8; SP.player.y=1.4; SP.player.setDir('S');
SP.actions.idle(0.25); """ + R + """
SP.clock.setWeather('rain',0.9,true,true);
SP.game.ps.flags.outfit_suggest_open=false;
SP.stageJ.suggestChangeOutfit();
""")

shot("l3-rx-dose.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=3; SP.player.y=2.6; SP.player.setDir('W');
SP.actions.idle(0.2); """ + R + """
SP.stageL.startRxCourse('感冒冲剂');
SP.game.ps.rxCourse.lastDoseDay=null;
SP.stageA.openPhone('daylog');
""", wait=0.4)

shot("l4-scan-export-wx.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.15); """ + R + """
SP.game.ps.scanLog=[
  {day:0,t:'08:12',ok:true,detail:'临时通行'},
  {day:1,t:'19:01',ok:false,detail:'访客'}
];
SP.stageL.exportScanSummary();
SP.stageA.openPhone('wechat','property');
""", wait=0.4)

shot("l5-week-view.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.daylogView='week';
SP.game.ps.dayLog=[
  {day:SP.stageF.dayKey(),t:'09:00',kind:'scan',text:'进门扫码',place:'xin'},
  {day:SP.stageF.dayKey(),t:'12:00',kind:'bus',text:'公交到站',place:'bus'},
  {day:Math.max(0,SP.stageF.dayKey()-1),t:'21:00',kind:'night',text:'夜间事件',place:'gate'}
];
SP.stageA.openPhone('daylog');
""", wait=0.4)

shot("l6-todo-priority.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.flags.gate_followup_pending=true;
SP.game.ps.flags.gate_followup_done=false;
SP.game.ps.flags.gate_followup_day=0;
SP.game.ps.flags.missed_scan_pending=true;
SP.game.ps.flags.missed_scan_quiz_done=false;
SP.game.ps.flags.deposit_discount=100;
SP.game.ps.flags.deposit_discount_used=false;
SP.stageL.startRxCourse('药');
SP.game.ps.rxCourse.lastDoseDay=null;
SP.game.ps.daylogView='week';
SP.stageA.openPhone('daylog');
""", wait=0.4)

print("stageL", c.eval("!!SP.stageL"), "npc", c.eval("SP.stageD.NPC_SPEC.civic_police.set"))
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("done")
