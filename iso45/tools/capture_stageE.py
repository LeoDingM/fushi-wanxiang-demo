"""Stage E screenshots e1–e6."""
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
        if c.eval("!!window.__protoReady && !!SP.stageE"): break

def shot(name, js):
    nav()
    c.eval(js)
    time.sleep(0.15)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world.sceneId"))

# e1 inventory bag after police
shot("e1-bag-receipt.png", DAY + """
SP.actions.go('civic_police'); SP.stageD.syncCivicNpcs();
SP.player.x=3.2; SP.player.y=2.8; SP.player.setDir('W');
SP.actions.idle(0.3); """ + R + """
SP.game.ps.money=500;
SP.stageD.ensure().police={filed:false,stamped:false,finePaid:false,helped:false};
SP.game.use(SP.world.byId.report_desk);
const a=SP.game.menu&&SP.game.menu.opts.find(x=>x.id==='report'); if(a)a.fn();
SP.game.closeMenu&&SP.game.closeMenu();
SP.game.use(SP.world.byId.filing2);
const b=SP.game.menu&&SP.game.menu.opts.find(x=>x.id==='stamp'); if(b)b.fn();
SP.game.closeMenu&&SP.game.closeMenu();
SP.stageA.openPhone('bag');
""")

# e2 bus ride overlay mid-anim (start anim then render a few frames)
shot("e2-bus-ride.png", DAY + """
SP.actions.go('street', [-18, 3.5, 'S']); SP.actions.idle(0.4); """ + R + """
const dest=SP.stageA.busStops.find(s=>s.id==='bus_stop_e');
SP.stageE.rideBus(dest, SP.stageA.busFare(), SP.stageA.busRideMin(), 'anim');
for(let i=0;i<25;i++){ if(window.__proto) __proto.render(); }
""")

# e3 xin_102 balcony
shot("e3-xin-102.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=2.5; SP.player.y=1.2; SP.player.setDir('S');
SP.actions.idle(0.4); """ + R)

# e4 night police call
shot("e4-night-call.png", """
SP.clock.setTimeName&&SP.clock.setTimeName('night',true);
SP.actions.go('street', [1.5, 10, 'S']); SP.actions.idle(0.3); """ + R + """
SP.stageE.offerNightEvent('police');
""")

# e5 wechat after civic (landlord msg)
shot("e5-wechat-link.png", DAY + """
SP.actions.go('street', [2, 8, 'S']); SP.actions.idle(0.2); """ + R + """
if(!SP.game.ps.bag||!SP.game.ps.bag.length){ SP.stageE.giveItem('police_receipt','演示回执'); SP.stageE.wxPush('landlord','刘姐，我去派出所备了案。',false); SP.stageE.wxPush('landlord','好的，有进展跟我说。',true); }
SP.stageA.openPhone('wechat','landlord');
""")

# e6 night clinic / hospital night
shot("e6-night-clinic.png", """
SP.clock.setTimeName&&SP.clock.setTimeName('night',true);
SP.actions.go('civic_hospital');
SP.player.x=5.5; SP.player.y=3.0; SP.player.setDir('N');
SP.actions.idle(0.35); """ + R + """
SP.stageE.offerNightEvent('clinic');
""")

p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("done captures")
