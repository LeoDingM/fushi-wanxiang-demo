"""Full-map road-footprint fix proof shots (B12 open road + south strip + side road)."""
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
if (SP.amenityCivic && SP.amenityCivic.install) SP.amenityCivic.install();
if (SP.chunks && SP.chunks.ensure) { try { SP.chunks.ensure(60, 0); SP.chunks.ensure(90, 0); } catch(e){} }
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

def shot(name, js, wait=0.7):
    nav()
    c.eval(DAY + BOOT + js + R)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    info = c.eval("""({
      px:SP.player&&+SP.player.x.toFixed(2), py:SP.player&&+SP.player.y.toFixed(2),
      z:SP.cam&&+SP.cam.zoom.toFixed(2),
      hospY: SP.world.byId&&SP.world.byId.civic_hospital_S1F_1_shop&&+SP.world.byId.civic_hospital_S1F_1_shop.y,
      hospX: SP.world.byId&&SP.world.byId.civic_hospital_S1F_1_shop&&+SP.world.byId.civic_hospital_S1F_1_shop.x,
      garageX: SP.world.byId&&SP.world.byId.infra_garage&&+SP.world.byId.infra_garage.x,
      busMX: SP.world.byId&&SP.world.byId.bus_stop_m&&+SP.world.byId.bus_stop_m.x,
      clinicY: SP.world.byId&&SP.world.byId.am_clinic_door&&+SP.world.byId.am_clinic_door.y,
      boundsY0: SP.world&&SP.world.bounds&&SP.world.bounds.y0
    })""")
    print("saved", name, info)
    return info

# 1 — B12 faces clear sidewalk + asphalt (match ref-b12-open-road framing)
shot("road1-b12-open.png", """
SP.player.x=6.5; SP.player.y=1.4; SP.player.setDir('N');
SP.cam.zoom=SP.cam.zt=0.92;
""")

# 2 — south strip: hospital/activity south of ROAD_Y (no walls on asphalt)
shot("road2-south-strip.png", """
SP.player.x=8.0; SP.player.y=-7.2; SP.player.setDir('S');
SP.cam.zoom=SP.cam.zt=0.85;
""")

# 3 — side road clear at intersection (no hospital/garage/canteen on asphalt)
shot("road3-side-road.png", """
SP.player.x=25.0; SP.player.y=-2.0; SP.player.setDir('N');
SP.cam.zoom=SP.cam.zt=0.9;
""")

# 4 — east civic/schools south of main road
shot("road4-east-civic.png", """
if (SP.chunks && SP.chunks.ensure) SP.chunks.ensure(70, -10);
SP.player.x=58; SP.player.y=-7.0; SP.player.setDir('S');
SP.cam.zoom=SP.cam.zt=0.75;
""")

# 5 — B12 close plate + road visible to the south
shot("road5-b12-plate-road.png", """
SP.player.x=1.5; SP.player.y=11.0; SP.player.setDir('S');
SP.cam.zoom=SP.cam.zt=1.25;
""")

# 6 — gate + 井槐里 bus (below gate) + elev notice (east sidewalk)
shot("roadfix-gate-bus-elev.png", """
SP.player.x=-8.0; SP.player.y=2.6; SP.player.setDir('W');
SP.cam.zoom=SP.cam.zt=1.05;
""")

# 7 — elev at east of 12号 (19.5,2.25) with gate in frame
shot("roadfix-elev-east.png", """
SP.player.x=14.0; SP.player.y=2.5; SP.player.setDir('E');
SP.cam.zoom=SP.cam.zt=1.1;
""")

errs = [x for x in c.logs if x.get('method')=='Runtime.exceptionThrown']
print("exceptions", len(errs))
for e in errs[-3:]:
    print(json.dumps(e.get('params',{}))[:300])

# automated collider check via eval of scene data
chk = c.eval("""
(function(){
  const ROAD_Y=[-6,0], ROAD_X=[22,28];
  const cols=(SP.world&&SP.world.colliders)||[];
  const bad=[];
  for (const c of cols){
    const r=c.rect; if(!r) continue;
    const main=r[2]>-60&&r[0]<120&&r[3]>-6&&r[1]<0;
    const side=r[3]>-45&&r[1]<75&&r[2]>22&&r[0]<28;
    if(main||side) bad.push([c.id,r,main?'main':'',side?'side':'']);
  }
  return {n:cols.length, bad:bad.slice(0,20), badN:bad.length,
    hosp:SP.world.byId&&SP.world.byId.civic_hospital_S1F_1_shop&&[SP.world.byId.civic_hospital_S1F_1_shop.x,SP.world.byId.civic_hospital_S1F_1_shop.y],
    garage:SP.world.byId&&SP.world.byId.infra_garage&&[SP.world.byId.infra_garage.x,SP.world.byId.infra_garage.y]};
})()
""")
print("runtime_collider_check", chk)
open(os.path.join(os.path.dirname(__file__), "roadfix_results.json"), "w").write(json.dumps({"chk": chk}, ensure_ascii=False, indent=1))

p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("DONE")
