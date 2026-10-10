"""Outdoor scene integrity screenshots after fade/POI/plate fixes."""
import os, sys, time, base64, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
os.makedirs(S, exist_ok=True)
DAY = "SP.clock.setTimeName&&SP.clock.setTimeName('day',true);"
R = """
SP.cam.ready=false; SP.cam.cx=null; SP.cam.pan=[0,0]; SP.cam.recenter=true;
for (let k=0;k<80;k++) __proto.render();
"""
BOOT = """
if (SP.amenities && SP.amenities.install) SP.amenities.install();
if (SP.amenities && SP.amenities.injectSportStreet) SP.amenities.injectSportStreet();
if (SP.amenities && SP.amenities.loadArt) SP.amenities.loadArt();
if (SP.amenityInfra && SP.amenityInfra.install) SP.amenityInfra.install();
if (SP.amenityInfra && SP.amenityInfra.injectStreet) SP.amenityInfra.injectStreet();
if (SP.amenityInfra && SP.amenityInfra.loadArt) SP.amenityInfra.loadArt();
if (SP.chunks && SP.chunks.ensure) { try { SP.chunks.ensure(110, 2); SP.chunks.ensure(120, 5); } catch(e){} }
"""

p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def nav():
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(160):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.game"): break
    time.sleep(0.7)
    c.eval(BOOT)

def shot(name, js, wait=0.6):
    nav()
    c.eval(DAY + BOOT + js + R)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    info = c.eval("""({
      px:SP.player&&+SP.player.x.toFixed(2), py:SP.player&&+SP.player.y.toFixed(2),
      z:SP.cam&&+SP.cam.zoom.toFixed(2),
      fading:(SP.world.fadeHit||[]).slice(0,8),
      park:!!(SP.world.byId&&SP.world.byId.am_park_bench),
      court:!!(SP.world.byId&&SP.world.byId.am_court),
      elev:!!(SP.world.byId&&SP.world.byId.infra_elev_board),
      garage:!!(SP.world.byId&&SP.world.byId.infra_garage),
      animal:!!(SP.world.byId&&SP.world.byId.infra_animal),
      seam:SP.world.byId&&SP.world.byId.mt_seam_sign&&SP.world.byId.mt_seam_sign.type,
      unitPlate:SP.world.byId&&SP.world.byId.unit_door&&SP.world.byId.unit_door.plate,
      efg: (function(){const o=SP.world.byId&&SP.world.byId.wall_e12; return o&&o.fade_group;})(),
      pois: SP.amenities&&SP.amenities.POIS
    })""")
    print("saved", name, info)
    return info

# 1 park/court area — player IN north courtyard (should not ghost street fencing)
shot("integrity1-park-court.png", """
SP.player.x=6.0; SP.player.y=31.0; SP.player.setDir('S');
SP.cam.zoom=SP.cam.zt=1.15;
""")

# 2 elev notice near 12号 — clear of garage stack
shot("integrity2-elev-12.png", """
SP.player.x=8.5; SP.player.y=1.6; SP.player.setDir('N');
SP.cam.zoom=SP.cam.zt=1.35;
""")

# 3 garage alone east of courtyard
shot("integrity3-garage.png", """
SP.player.x=23.5; SP.player.y=6.5; SP.player.setDir('N');
SP.cam.zoom=SP.cam.zt=1.3;
""")

# 4 building 12 south face — plate only here
shot("integrity4-b12-plate.png", """
SP.player.x=1.5; SP.player.y=10.5; SP.player.setDir('N');
SP.cam.zoom=SP.cam.zt=1.4;
""")

# 5 midtown seam — must NOT show 井槐里12号 f_sign
shot("integrity5-midtown-seam.png", """
if (SP.chunks && SP.chunks.ensure) SP.chunks.ensure(110, 2);
SP.player.x=108; SP.player.y=1.5; SP.player.setDir('E');
SP.cam.zoom=SP.cam.zt=1.05;
""")

# 6 walk east overview
shot("integrity6-east-walk.png", """
if (SP.chunks && SP.chunks.ensure) SP.chunks.ensure(50, 0);
SP.player.x=42; SP.player.y=2.2; SP.player.setDir('E');
SP.cam.zoom=SP.cam.zt=0.85;
""")

# 7 old block overview (south of 12)
shot("integrity7-oldblock.png", """
SP.player.x=2; SP.player.y=2.5; SP.player.setDir('N');
SP.cam.zoom=SP.cam.zt=0.75;
""")

# 8 animal / love house near park
shot("integrity8-animal.png", """
SP.player.x=7.5; SP.player.y=32.2; SP.player.setDir('N');
SP.cam.zoom=SP.cam.zt=1.25;
""")

errs = [x for x in c.logs if x.get('method')=='Runtime.exceptionThrown']
print("exceptions", len(errs))
for e in errs[-3:]:
    print(json.dumps(e.get('params',{}))[:300])
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
