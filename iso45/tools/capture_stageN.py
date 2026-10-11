"""Stage N screenshots n1–n6."""
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
        if c.eval("!!window.__protoReady && !!SP.stageN"): break

def shot(name, js, wait=0.32):
    nav()
    c.eval(js)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world && SP.world.sceneId"))

shot("n1-ticket-follow.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.gateTickets=[{id:'GT-DEMO-1',status:'待跟进',reasons:['漏扫码','夜间来电未接'],label:'敷衍'}];
SP.stageN.openTicketFollowupMenu();
""")

shot("n2-ticket-renew-wx.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.stageH.ensure();
SP.game.ps.flags.xin_access_until=SP.clock.abs()+30;
SP.game.ps.gateTickets=[{id:'GT-DEMO-2',status:'待跟进',reasons:['漏扫码']}];
SP.stageN.closeTicket('GT-DEMO-2', true);
SP.stageA.openPhone('wechat','property');
""", wait=0.45)

shot("n3-miss-streak-hospital.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.flags.rx_miss_streak=0;
SP.game.ps.flags.hospital_revisit_pending=false;
SP.stageM.applyMissedDosePenalty('1');
SP.stageM.applyMissedDosePenalty('2');
SP.game.ps.daylogView='week';
SP.stageA.openPhone('daylog');
""", wait=0.4)

shot("n4-try-on.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=1.8; SP.player.y=1.4; SP.player.setDir('S');
SP.actions.idle(0.25); """ + R + """
SP.clock.setWeather('snow',0.85,true,true);
SP.game.ps.flags.outfit_suggest_open=false;
SP.stageJ.suggestChangeOutfit();
""")

shot("n5-hour-poi.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
const d=SP.stageN.dayKey();
SP.game.ps.daylogView='week';
SP.stageG._calOpen=d;
SP.game.ps.hourStripDay=d;
SP.game.ps.hourStripHour=14;
SP.game.ps.dayLog=[
  {day:d,t:'14:10',kind:'bus',text:'公交出行',place:'bus'},
  {day:d,t:'14:40',kind:'gate',text:'门岗核验',place:'gate'}
];
SP.stageA.openPhone('daylog');
""", wait=0.45)

shot("n6-long-share.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.1); """ + R + """
SP.game.ps.scanLog=[{day:0,t:'08:00',ok:true,detail:'通行'},{day:0,t:'18:00',ok:true,detail:'出门'}];
SP.game.ps.scanArchive=[];
SP.stageM.archiveScans();
const url=SP.stageM.renderLongImage(SP.game.ps.scanArchive[0]);
SP.stageM.openLongImagePreview(url);
SP.stageN.shareLongImage('roommate');
SP.stageA.openPhone('wechat','roommate');
""", wait=0.45)

print("stageN", c.eval("!!SP.stageN"), "npc", c.eval("SP.stageD.NPC_SPEC.civic_police.set"))
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("done")
