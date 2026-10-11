"""Amenities-Infra v2 screenshots: post / activity / bike+lock."""
import os, sys, time, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
os.makedirs(S, exist_ok=True)
DAY = "SP.clock.setTimeName&&SP.clock.setTimeName('day',true);"
R = "SP.cam.ready=false;SP.cam.cx=null;SP.cam.pan=[0,0];SP.cam.recenter=true;for(let k=0;k<60;k++)__proto.render();"
BOOT = """
if (SP.amenityInfra && SP.amenityInfra.install) SP.amenityInfra.install();
if (SP.amenityInfra) { SP.amenityInfra._injected=false; SP.amenityInfra.injectStreet(); SP.amenityInfra.loadArt(); SP.amenityInfra.registerScenes(); }
"""
p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def nav():
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(140):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.game"): break
    time.sleep(0.8); c.eval(BOOT)
    for _ in range(40):
        time.sleep(0.1)
        if c.eval("SP.amenityInfra && SP.amenityInfra._imgs && SP.amenityInfra._imgs.post && SP.amenityInfra._imgs.post.complete"):
            break

def shot(name, js, wait=0.55):
    nav()
    c.eval(DAY + BOOT + js + R); time.sleep(wait)
    open(S+name,"wb").write(base64.b64decode(c.call("Page.captureScreenshot", format="png")["data"]))
    print("saved", name, c.eval("""({
      sid:SP.world&&SP.world.sceneId,
      post:!!(SP.world.byId&&SP.world.byId.infra_post_door),
      act:!!(SP.world.byId&&SP.world.byId.infra_act_door),
      bike:!!(SP.world.byId&&SP.world.byId.infra_bike_stall),
      lock:!!(SP.world.byId&&SP.world.byId.infra_lock_stall),
      px:SP.player&&SP.player.x, py:SP.player&&SP.player.y
    })"""))

shot("infra5-post.png", """
SP.amenityInfra.injectStreet();
SP.player.x=-20.5; SP.player.y=-6.6; SP.player.setDir('S');
SP.cam.zoom=SP.cam.zt=1.25;
""")
shot("infra6-activity.png", """
SP.amenityInfra.injectStreet();
SP.player.x=4.0; SP.player.y=-6.6; SP.player.setDir('S');
SP.cam.zoom=SP.cam.zt=1.25;
""")
shot("infra7-bike-lock.png", """
SP.amenityInfra.injectStreet();
SP.player.x=-12.2; SP.player.y=1.15; SP.player.setDir('N');
SP.cam.zoom=SP.cam.zt=1.4;
""")
# interiors
shot("infra5b-post-int.png", """
SP.game.switchScene('amenity_post', SP.scenes.amenity_post.spawn);
SP.player.x=4.0; SP.player.y=2.0; SP.player.setDir('N'); SP.cam.zoom=SP.cam.zt=1.35;
""")
shot("infra6b-activity-int.png", """
SP.game.switchScene('amenity_activity', SP.scenes.amenity_activity.spawn);
SP.player.x=4.0; SP.player.y=2.2; SP.player.setDir('N'); SP.cam.zoom=SP.cam.zt=1.3;
""")
print("added", c.eval("SP.amenityInfra.listAdded().map(x=>x.id+':'+x.status)"))
print("exc", [x for x in c.logs if x.get('method')=='Runtime.exceptionThrown'][-2:])
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
