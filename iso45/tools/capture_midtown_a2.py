"""Midtown-A2 screenshots mt-a2-1…mt-a2-6."""
import os, sys, time, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
os.makedirs(S, exist_ok=True)
DAY = "SP.clock.setTimeName&&SP.clock.setTimeName('day',true);"
R = "for (let k=0;k<45;k++) __proto.render();"
p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def nav():
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(160):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.midtown && !!SP.midtown.ready"): break
    c.eval("SP.midtown.install();SP.midtownElev.install();SP.midtown.wireRent();SP.midtown.wrapUnits();")

def shot(name, js, wait=0.45):
    nav(); c.eval(DAY + js); time.sleep(wait)
    open(S+name,"wb").write(base64.b64decode(c.call("Page.captureScreenshot", format="png")["data"]))
    print("saved", name, c.eval("SP.world&&SP.world.sceneId"))

shot("mt-a2-1-jx-corridor-doors.png", """
SP.midtown.enterBuilding('jx',1);
SP.player.x=2.0; SP.player.y=2.8; SP.player.setDir('N');
"""+R)

shot("mt-a2-2-jx-101-unit.png", """
SP.midtown.enterUnit('jx',1,1);
SP.player.x=2.8; SP.player.y=2.0; SP.player.setDir('N');
"""+R)

shot("mt-a2-3-yj-601-unit.png", """
SP.midtown.enterUnit('yj',6,1);
SP.player.x=3.2; SP.player.y=2.2; SP.player.setDir('W');
"""+R)

shot("mt-a2-4-cn-1601-unit.png", """
SP.midtown.enterUnit('cn',16,1);
SP.player.x=2.5; SP.player.y=3.5; SP.player.setDir('N');
"""+R)

shot("mt-a2-5-housing-rent.png", """
SP.actions.go('street',[110,2,'E']);
SP.game.ps.money=20000;
SP.midtown.wireRent(); SP.midtown.wrapUnits();
SP.stageA.openPhone('housing');
""", wait=0.55)

shot("mt-a2-6-elev-with-units.png", """
SP.midtown.enterBuilding('cn',1);
SP.player.x=3.5; SP.player.y=2.6; SP.player.setDir('N');
"""+R+"""
const elev=(SP.world.objects||[]).find(o=>o.interact==='elevator');
if(elev) SP.midtownElev.openElevMenu(elev);
""", wait=0.5)

try: cdp.stop(p,prof)
except Exception: pass
print("done")
