"""Stage F screenshots f1–f6."""
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
        if c.eval("!!window.__protoReady && !!SP.stageF"): break

def shot(name, js):
    nav()
    c.eval(js)
    time.sleep(0.18)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world.sceneId"))

# f1 present menu at property notice / xin
shot("f1-present-menu.png", DAY + """
SP.actions.go('stair_xin_1f');
SP.player.x=2.2; SP.player.y=2.5; SP.player.setDir('N');
SP.actions.idle(0.3); """ + R + """
SP.stageE.giveItem('police_receipt','演示回执');
SP.stageE.giveItem('fire_card','消防卡');
const o = SP.world.byId.xin_mail || SP.world.byId.xin_notice || (SP.world.objects||[]).find(x=>x.interact==='notice');
if (o) { SP.game.use(o); const p=SP.game.menu&&SP.game.menu.opts.find(x=>x.id==='present'); if(p)p.fn(); }
""")

# f2 bus announce overlay
shot("f2-bus-announce.png", DAY + """
SP.actions.go('street', [-18, 3.5, 'S']); SP.actions.idle(0.35); """ + R + """
const dest=SP.stageA.busStops.find(s=>s.id==='bus_stop_e');
SP.stageE.rideBus(dest, SP.stageA.busFare(), SP.stageA.busRideMin(), 'anim');
for(let i=0;i<18;i++){ if(window.__proto) __proto.render(); }
""")

# f3 xin_102 balcony laundry view
shot("f3-xin102-balcony.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=1.6; SP.player.y=1.4; SP.player.setDir('S');
SP.actions.idle(0.4); """ + R)

# f4 night ignore → daylog
shot("f4-daylog.png", """
SP.clock.setTimeName&&SP.clock.setTimeName('night',true);
SP.actions.go('street', [1.5, 10, 'S']); SP.actions.idle(0.25); """ + R + """
SP.stageF.ensure();
SP.stageE.offerNightEvent('police');
const sk=SP.game.menu&&SP.game.menu.opts.find(o=>o.id==='skip'); if(sk)sk.fn();
SP.game.closeMenu&&SP.game.closeMenu();
SP.stageA.openPhone('daylog');
""")

# f5 present at police (reject already-ours)
shot("f5-present-police.png", DAY + """
SP.actions.go('civic_police'); SP.stageD.syncCivicNpcs();
SP.player.x=3.0; SP.player.y=2.6; SP.player.setDir('W');
SP.actions.idle(0.3); """ + R + """
SP.stageE.giveItem('police_receipt','回执');
SP.game.use(SP.world.byId.report_desk);
const p=SP.game.menu&&SP.game.menu.opts.find(x=>x.id==='present_docs'); if(p)p.fn();
""")

# f6 morning mood toast after ignore (simulate)
shot("f6-morning-mood.png", DAY + """
SP.actions.go('room_2f02');
SP.player.x=3.2; SP.player.y=2.8; SP.player.setDir('S');
SP.actions.idle(0.3); """ + R + """
SP.stageF.ensure();
SP.game.ps.nightFlags={ignoredPolice:true,ignoredClinic:true};
SP.game.ps.needs.mood=60;
SP.stageF.applyMorningMood();
SP.stageA.openPhone('daylog');
""")

p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("done captures")
