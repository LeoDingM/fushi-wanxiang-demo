"""Midtown-A screenshots mt-a1…mt-a6."""
import os, sys, time, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
os.makedirs(S, exist_ok=True)
DAY = "SP.clock.setTimeName&&SP.clock.setTimeName('day',true);"
R = "for (let k=0;k<50;k++) __proto.render();"

p, prof, ws = cdp.start()
c = cdp.CDP(ws)
c.call("Runtime.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def nav():
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(160):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.midtown && !!SP.midtown.ready"):
            break
    c.eval("if(SP.midtown&&SP.midtown.install)SP.midtown.install();if(SP.midtownElev&&SP.midtownElev.install)SP.midtownElev.install();")

def shot(name, js, wait=0.4):
    nav()
    c.eval(DAY + js)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world && SP.world.sceneId"))

shot("mt-a1-seam-east.png", """
SP.actions.go('street',[108,1.8,'E']);
SP.midtown.loadChunk();
SP.player.x=108; SP.player.y=1.6; SP.player.setDir('N');
if (SP.cam && SP.cam.zoomTo) SP.cam.zoomTo(1.0, null, null, true);
""" + R)

shot("mt-a2-three-towers.png", """
SP.actions.go('street',[118,1.8,'E']);
SP.midtown.loadChunk();
SP.player.x=116; SP.player.y=1.6; SP.player.setDir('E');
if (SP.cam && SP.cam.zoomTo) SP.cam.zoomTo(0.85, null, null, true);
""" + R, wait=0.55)

shot("mt-a3-jx-lobby-elev.png", """
SP.midtown.enterBuilding('jx',1);
SP.player.x=3.5; SP.player.y=2.8; SP.player.setDir('N');
""" + R + """
const elev=(SP.world.objects||[]).find(o=>o.interact==='elevator');
if(elev) SP.game.use(elev);
""", wait=0.5)

shot("mt-a4-elev-8f.png", """
SP.midtown.enterBuilding('jx',8);
SP.player.x=3.5; SP.player.y=2.5; SP.player.setDir('W');
""" + R + """
const elev=(SP.world.objects||[]).find(o=>o.interact==='elevator');
if(elev) SP.game.use(elev);
""", wait=0.55)

shot("mt-a5-fire-stair.png", """
SP.midtown.enterBuilding('cn',5);
const fire=(SP.world.objects||[]).find(o=>o.name==='消防通道');
if(fire && fire.to) SP.game.switchScene(fire.to, fire.spawn);
SP.player.x=2.5; SP.player.y=1.8; SP.player.setDir('N');
""" + R, wait=0.5)

shot("mt-a6-cn-skyline.png", """
SP.actions.go('street',[134,1.5,'E']);
SP.midtown.loadChunk();
SP.player.x=132; SP.player.y=1.4; SP.player.setDir('E');
if (SP.cam && SP.cam.zoomTo) SP.cam.zoomTo(0.75, null, null, true);
""" + R, wait=0.6)

try: cdp.stop(p, prof)
except Exception: pass
print("done")
