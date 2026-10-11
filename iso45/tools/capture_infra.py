"""Amenities-Infra screenshots infra1–4."""
import os, sys, time, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
os.makedirs(S, exist_ok=True)
DAY = "SP.clock.setTimeName&&SP.clock.setTimeName('day',true);"
R = """
SP.cam.ready=false; SP.cam.cx=null; SP.cam.pan=[0,0]; SP.cam.recenter=true;
for (let k=0;k<60;k++) __proto.render();
"""
BOOT = """
if (SP.amenityInfra && SP.amenityInfra.install) SP.amenityInfra.install();
if (SP.amenityInfra && SP.amenityInfra.injectStreet) SP.amenityInfra.injectStreet();
if (SP.amenityInfra && SP.amenityInfra.loadArt) SP.amenityInfra.loadArt();
if (SP.amenityInfra && SP.amenityInfra.registerScenes) SP.amenityInfra.registerScenes();
"""

p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def nav():
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(140):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.game"): break
    time.sleep(0.8)
    c.eval(BOOT)
    for _ in range(40):
        time.sleep(0.1)
        if c.eval("SP.amenityInfra && SP.amenityInfra._imgs && SP.amenityInfra._imgs.bank && SP.amenityInfra._imgs.bank.complete"):
            break

def shot(name, js, wait=0.55):
    nav()
    c.eval(DAY + BOOT + js + R)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("""({
      sid:SP.world&&SP.world.sceneId,
      bank:!!(SP.world.byId&&SP.world.byId.infra_bank_door),
      toilet:!!(SP.world.byId&&SP.world.byId.infra_toilet_door),
      garage:!!(SP.world.byId&&SP.world.byId.infra_garage),
      dry:!!(SP.world.byId&&SP.world.byId.infra_dry_door),
      px:SP.player&&SP.player.x, py:SP.player&&SP.player.y, z:SP.cam&&SP.cam.zoom,
      scenes:!!(SP.scenes&&SP.scenes.amenity_bank&&SP.scenes.amenity_toilet)
    })"""))

shot("infra1-bank.png", """
SP.amenityInfra.injectStreet();
SP.player.x=-8.5; SP.player.y=-6.6; SP.player.setDir('S');
SP.cam.zoom=SP.cam.zt=1.25;
""")

shot("infra2-toilet.png", """
SP.amenityInfra.injectStreet();
SP.player.x=12.5; SP.player.y=-6.6; SP.player.setDir('S');
SP.cam.zoom=SP.cam.zt=1.25;
""")

shot("infra3-garage.png", """
SP.amenityInfra.injectStreet();
SP.player.x=20.0; SP.player.y=10.6; SP.player.setDir('N');
SP.cam.zoom=SP.cam.zt=1.35;
""")

shot("infra4-dryclean.png", """
SP.amenityInfra.injectStreet();
SP.player.x=48.0; SP.player.y=-6.6; SP.player.setDir('S');
SP.cam.zoom=SP.cam.zt=1.2;
""")

# bonus interiors if time — also validate ATM menu exists
print("added", c.eval("SP.amenityInfra.listAdded().map(x=>x.id+':'+x.status)"))
print("atm", c.eval("typeof SP.amenityInfra.atmWithdraw"))
print("logs", [x for x in c.logs if x.get('method')=='Runtime.exceptionThrown'][-3:])
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
