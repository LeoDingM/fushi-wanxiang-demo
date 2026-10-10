"""Stage G screenshots g1–g6."""
import os, sys, time, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
R = "for (let k=0;k<40;k++) __proto.render();"
DAY = "SP.clock.setTimeName&&SP.clock.setTimeName('day',true);"

p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def nav():
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(100):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.stageG"): break

def shot(name, js):
    nav()
    c.eval(js)
    time.sleep(0.2)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world.sceneId"))

shot("g1-access-discount.png", DAY + """
SP.actions.go('stair_xin_1f');
SP.player.x=2.2; SP.player.y=2.5; SP.player.setDir('N');
SP.actions.idle(0.3); """ + R + """
SP.stageE.giveItem('police_receipt','回执');
SP.game.ps.shownTo={}; SP.game.ps.flags={};
SP.stageF.presentItem('property','police_receipt');
SP.stageA.openPhone('housing');
""")

shot("g2-laundry-menu.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=4.2; SP.player.y=3.2; SP.player.setDir('W');
SP.actions.idle(0.35); """ + R + """
if(!SP.game.ps.clothes){ const L=SP.game.rules.data.laundry; SP.game.ps.clothes={clean:L.start.clean,dirty:3,worn_h:0,washer:null,rack:{}}; }
SP.game.use(SP.world.byId.washer);
""")

shot("g3-laundry-hang.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=1.5; SP.player.y=1.3; SP.player.setDir('S');
SP.actions.idle(0.3); """ + R + """
if(!SP.game.ps.clothes){ const L=SP.game.rules.data.laundry; SP.game.ps.clothes={clean:2,dirty:0,worn_h:0,washer:null,rack:{}}; }
SP.game.ps.clothes.rack.balcony={n:3,wet:0.7,t:SP.clock.abs()};
SP.game.syncLaundry&&SP.game.syncLaundry();
for(let k=0;k<20;k++) __proto.render();
""")

shot("g4-daylog-calendar.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.2); """ + R + """
SP.stageF.pushLog('access','物业开通馨园临时门禁',{place:'xin'});
SP.stageF.pushLog('bus','公交到站 卫生中心',{place:'bus'});
SP.stageF.pushLog('discount','房东押金优惠券 ¥100',{place:'housing'});
SP.stageA.openPhone('daylog');
""")

shot("g5-gate-followup.png", DAY + """
SP.actions.go('street',[-2,11,'S']); SP.actions.idle(0.3); """ + R + """
SP.stageG.ensure();
SP.game.ps.flags.gate_followup_pending=true;
SP.game.ps.flags.gate_followup_done=false;
SP.game.ps.flags.gate_followup_day=0;
SP.game.ps.flags.gate_followup_force=true;
SP.stageG.maybeGateFollowup();
""")

shot("g6-deposit-rent.png", DAY + """
SP.actions.go('street',[80,12,'E']); SP.actions.idle(0.25); """ + R + """
SP.game.ps.flags.deposit_discount=100; SP.game.ps.flags.deposit_discount_used=false;
SP.game.ps.flags.xin_access=true; SP.game.ps.flags.xin_access_until=SP.clock.abs()+1000;
SP.stageA.openPhone('housing');
""")

p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("done captures")
