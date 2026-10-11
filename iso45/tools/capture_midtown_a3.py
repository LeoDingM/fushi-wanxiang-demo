"""Midtown-A3 screenshots mt-a3-1…mt-a3-6."""
import os, sys, time, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
DAY = "SP.clock.setTimeName&&SP.clock.setTimeName('day',true);"
R = "for (let k=0;k<45;k++) __proto.render();"
p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def nav():
    c.call("Page.navigate", url=cdp.BASE+"?manual=1")
    for _ in range(160):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.midtown && !!SP.midtown.ready"): break
    c.eval("SP.midtown.install();SP.midtownElev.install();SP.midtown.wireRent();SP.midtown.wrapUnits();SP.midtown.wrapHousing();")

def shot(name, js, wait=0.45):
    nav(); c.eval(DAY+js); time.sleep(wait)
    open(S+name,"wb").write(base64.b64decode(c.call("Page.captureScreenshot", format="png")["data"]))
    print("saved", name, c.eval("SP.world&&SP.world.sceneId"))

shot("mt-a3-1-jx-transitional.png", "SP.midtown.enterUnit('jx',1,1);SP.player.x=2.6;SP.player.y=2.0;SP.player.setDir('N');"+R)
shot("mt-a3-2-yj-glass.png", "SP.midtown.enterUnit('yj',6,1);SP.player.x=3.0;SP.player.y=2.2;SP.player.setDir('W');"+R)
shot("mt-a3-3-cn-tower.png", "SP.midtown.enterUnit('cn',16,1);SP.player.x=2.4;SP.player.y=3.4;SP.player.setDir('N');"+R)
shot("mt-a3-4-housing-grouped.png", """
SP.actions.go('street',[110,2,'E']);
SP.midtown.wireRent(); SP.midtown.wrapHousing();
SP.stageA.openPhone('housing');
""", wait=0.55)
shot("mt-a3-5-jx-vs-yj-note.png", """
SP.midtown.enterUnit('jx',5,2);
SP.player.x=5.5;SP.player.y=2.5;SP.player.setDir('E');
"""+R)
shot("mt-a3-6-cn-meter.png", """
SP.midtown.enterUnit('cn',8,1);
SP.player.x=5.8;SP.player.y=1.4;SP.player.setDir('E');
"""+R)
try: cdp.stop(p,prof)
except Exception: pass
print("done")
