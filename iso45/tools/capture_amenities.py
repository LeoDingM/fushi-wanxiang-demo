"""Amenities-Sport screenshots am1–am6."""
import os, sys, time, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
DAY = "SP.clock.setTimeName&&SP.clock.setTimeName('day',true);"
R = """
SP.cam.ready=false; SP.cam.cx=null; SP.cam.pan=[0,0]; SP.cam.recenter=true;
for (let k=0;k<60;k++) __proto.render();
"""
BOOT = """
if (SP.amenities && SP.amenities.installSport) SP.amenities.installSport();
if (SP.amenities && SP.amenities._chainMarketInject) SP.amenities._chainMarketInject();
if (SP.amenities && SP.amenities.injectSportStreet) SP.amenities.injectSportStreet();
if (SP.amenities && SP.amenities.loadArt) SP.amenities.loadArt();
"""

p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def nav():
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(140):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.game"): break
    time.sleep(0.7)
    c.eval(BOOT)
    for _ in range(30):
        time.sleep(0.1)
        if c.eval("SP.amenities && SP.amenities._imgs && SP.amenities._imgs.clinic && SP.amenities._imgs.clinic.complete"):
            break

def shot(name, js, wait=0.5):
    nav()
    c.eval(DAY + BOOT + js + R)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("({sid:SP.world&&SP.world.sceneId, door:!!(SP.world.byId&&SP.world.byId.am_clinic_door), court:!!(SP.world.byId&&SP.world.byId.am_court), px:SP.player.x, py:SP.player.y, z:SP.cam.zoom})"))

shot("am1-court.png", """
SP.amenities.injectSportStreet();
SP.player.x=13.1; SP.player.y=16.6; SP.player.setDir('N');
SP.cam.zoom=SP.cam.zt=1.35;
""")

shot("am2-park.png", """
SP.amenities.injectSportStreet();
SP.player.x=6.0; SP.player.y=27.2; SP.player.setDir('N');
SP.cam.zoom=SP.cam.zt=1.25;
""")

shot("am3-stadium.png", """
SP.chunks && SP.chunks.loadAll && SP.chunks.loadAll();
SP.amenities.injectSportStreet();
SP.player.x=73; SP.player.y=-24.6; SP.player.setDir('S');
SP.cam.zoom=SP.cam.zt=0.95;
""")

shot("am4-clinic-ext.png", """
SP.amenities.injectSportStreet();
SP.player.x=31.5; SP.player.y=-6.7; SP.player.setDir('S');
SP.cam.zoom=SP.cam.zt=1.2;
""")

shot("am5-clinic-wait.png", """
SP.game.switchScene('amenity_clinic', SP.scenes.amenity_clinic.spawn);
SP.player.x=5.5; SP.player.y=2.4; SP.player.setDir('N');
""")

shot("am6-overview-east.png", """
SP.chunks && SP.chunks.loadAll && SP.chunks.loadAll();
SP.amenities.injectSportStreet();
SP.player.x=42; SP.player.y=-7; SP.player.setDir('E');
SP.cam.zoom=SP.cam.zt=0.5;
""")

print("added", c.eval("SP.amenities.listAdded().map(x=>x.id)"))
print("missing", c.eval("SP.amenities.listMissingProposed().filter(x=>x.status==='missing').map(x=>x.name)"))
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
