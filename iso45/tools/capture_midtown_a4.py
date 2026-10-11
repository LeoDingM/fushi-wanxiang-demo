"""Midtown polish screenshots mt-a4-1…mt-a4-4."""
import os, sys, time, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
R = "for (let k=0;k<50;k++) __proto.render();"
NIGHT = """
SP.clock.setTimeName&&SP.clock.setTimeName('night',true);
SP.clock.computeAmbient&&SP.clock.computeAmbient();
if(SP.tint) SP.tint.night=Math.max(0.85, SP.clamp((SP.clock.dark-0.2)/0.4,0,1));
"""
p,prof,ws=cdp.start(); c=cdp.CDP(ws); c.call("Runtime.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def nav():
    c.call("Page.navigate", url=cdp.BASE+"?manual=1")
    for _ in range(160):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.midtown && !!SP.midtown.ready"): break
    c.eval("SP.midtown.install();SP.midtown.wrapHouseholds();SP.midtown.wrapRentHooks();SP.midtown.wireRent();SP.midtown.wrapUnits();")

def shot(name, js, wait=0.5):
    nav(); c.eval(js); time.sleep(wait)
    open(S+name,"wb").write(base64.b64decode(c.call("Page.captureScreenshot", format="png")["data"]))
    print("saved", name, c.eval("SP.world&&SP.world.sceneId"))

shot("mt-a4-1-door-label.png", """
SP.actions.go('street',[110,1.6,'N']); SP.player.x=110; SP.player.y=1.5;
SP.midtown.loadChunk(); SP.midtown.labelStreetDoors();
if(SP.cam&&SP.cam.zoomTo) SP.cam.zoomTo(1.05,null,null,true);
"""+R)

shot("mt-a4-2-jx-night-glow.png", NIGHT+"""
SP.actions.go('street',[110,1.6,'N']); SP.player.x=110; SP.player.y=1.5;
SP.midtown.loadChunk();
SP.game.ps.money=20000;
const H=SP.stageA.ensureHousing();
H.owned=H.owned.filter(id=>!SP.midtown.isMidtownRentId(id));
SP.stageA.rentUnit('mt-jx-502');
SP.midtown.syncFacadeOccupied();
if(SP.cam&&SP.cam.zoomTo) SP.cam.zoomTo(0.95,null,null,true);
"""+R, wait=0.6)

shot("mt-a4-3-yj-glass-night.png", NIGHT+"""
SP.actions.go('street',[124,1.5,'N']); SP.player.x=124; SP.player.y=1.4;
SP.midtown.loadChunk();
SP.game.ps.money=20000;
SP.stageA.ensureHousing();
SP.stageA.rentUnit('mt-yj-601');
SP.midtown.syncFacadeOccupied();
if(SP.cam&&SP.cam.zoomTo) SP.cam.zoomTo(0.9,null,null,true);
"""+R, wait=0.6)

shot("mt-a4-4-housing-still-grouped.png", """
SP.actions.go('street',[110,2,'E']);
SP.midtown.wireRent(); SP.midtown.wrapHousing();
SP.stageA.openPhone('housing');
""", wait=0.55)

try: cdp.stop(p,prof)
except Exception: pass
print("done")
