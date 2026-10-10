"""Stage O screenshots o1–o6."""
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
        if c.eval("!!window.__protoReady && !!SP.stageO"): break

def shot(name, js, wait=0.32):
    nav()
    c.eval(js)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world && SP.world.sceneId"))

shot("o1-second-gate.png", DAY + """
SP.actions.go('street',[-2,11,'S']); SP.actions.idle(0.15); """ + R + """
SP.game.ps.gateTickets=[{id:'GT-SLA-1',status:'待跟进',day:0,dueDay:SP.stageO.dayKey()-1,reasons:['漏扫码']}];
SP.game.ps.flags.second_gate_force=true;
SP.game.ps.flags.second_gate_day=-1;
SP.stageO.maybeSecondGateCheck();
""")

shot("o2-sla-todo.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.gateTickets=[{id:'GT-SLA-2',status:'待跟进',day:0,dueDay:SP.stageO.dayKey()-1,reasons:['夜间来电未接']}];
SP.game.ps.daylogView='week';
SP.stageA.openPhone('daylog');
""", wait=0.4)

shot("o3-revisit-rx.png", DAY + """
SP.actions.go('civic_hospital'); SP.stageD.syncCivicNpcs&&SP.stageD.syncCivicNpcs();
SP.player.x=5.8; SP.player.y=3.0; SP.player.setDir('W');
SP.actions.idle(0.25); """ + R + """
SP.game.ps.rxCourse=null;
SP.game.ps.flags.rx_course_reopened=false;
SP.stageO.onHospitalRevisit();
SP.toast('复诊续疗程已开启', 4000);
""")

shot("o4-tryon-badge.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=3; SP.player.y=2.6; SP.player.setDir('W');
SP.actions.idle(0.2); """ + R + """
SP.stageH.ensure();
SP.appearance.setOutfitId&&SP.appearance.setOutfitId('casual');
SP.stageN.tryOnLook('winter');
SP.game.hud(true);
SP.toast('试穿对比徽章', 4000);
""")

shot("o5-itinerary.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.stageO.ensureSoftPoi();
SP.game.ps.daylogView='week';
SP.game.ps.hourStripDay=SP.stageO.dayKey();
SP.game.ps.hourStripHour=8;
SP.stageG._calOpen=SP.stageO.dayKey();
SP.game.ps.dayLog=[{day:SP.stageO.dayKey(),t:'08:15',kind:'bus',text:'准备出门',place:'bus'}];
SP.stageA.openPhone('daylog');
""", wait=0.45)

shot("o6-watermark-qr.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.scanLog=[{day:0,t:'08:00',ok:true,detail:'通行'},{day:0,t:'18:00',ok:true,detail:'出门'}];
SP.game.ps.scanArchive=[];
SP.stageM.archiveScans();
const url=SP.stageM.renderLongImage(SP.game.ps.scanArchive[0]);
SP.stageM.openLongImagePreview(url);
""", wait=0.45)

print("stageO", c.eval("!!SP.stageO"), "npc", c.eval("SP.stageD.NPC_SPEC.civic_police.set"))
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("done")
