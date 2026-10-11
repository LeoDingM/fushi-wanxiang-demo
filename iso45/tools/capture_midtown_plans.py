"""Compare Midtown plans A–D + balcony. Screenshots mt-plan-*.png"""
import os, sys, time, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
R = "for (let k=0;k<50;k++) __proto.render();"
DAY = "SP.clock.setTimeName&&SP.clock.setTimeName('day',true);"
p,prof,ws=cdp.start(); c=cdp.CDP(ws); c.call("Runtime.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def nav():
    c.call("Page.navigate", url=cdp.BASE+"?manual=1")
    for _ in range(160):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.midtown && !!SP.midtown.ready"): break
    c.eval("SP.midtown.install();")

def shot(name, js, wait=0.5):
    nav(); c.eval(DAY+js); time.sleep(wait)
    open(S+name,"wb").write(base64.b64decode(c.call("Page.captureScreenshot", format="png")["data"]))
    print("saved", name, c.eval("SP.world&&SP.world.sceneId"), c.eval("SP.world&&SP.world.data&&SP.world.data.mt_plan"))

shot("mt-plan-a-jx101.png", "SP.midtown.enterUnit('jx',1,1);SP.player.x=2.8;SP.player.y=2.0;SP.player.setDir('N');"+R)
shot("mt-plan-b-cn801.png", "SP.midtown.enterUnit('cn',8,1);SP.player.x=3.2;SP.player.y=1.8;SP.player.setDir('E');"+R)
shot("mt-plan-c-yj601.png", "SP.midtown.enterUnit('yj',6,1);SP.player.x=4.0;SP.player.y=2.2;SP.player.setDir('S');"+R)
shot("mt-plan-d-jx502.png", "SP.midtown.enterUnit('jx',5,2);SP.player.x=2.8;SP.player.y=1.8;SP.player.setDir('N');"+R)
shot("mt-plan-c-balcony.png", """
SP.midtown.enterUnit('yj',6,1);
SP.player.x=3.2; SP.player.y=0.95; SP.player.setDir('S');
"""+R, wait=0.55)
shot("mt-plan-housing-sizes.png", """
SP.actions.go('street',[110,2,'E']);
SP.midtown.wireRent(); SP.midtown.wrapUnits(); SP.midtown.wrapHousing();
SP.stageA.openPhone('housing');
""", wait=0.55)

try: cdp.stop(p,prof)
except Exception: pass
print("done")
