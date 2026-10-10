"""Stage D screenshots d1–d6 (manual mode + stepped render)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
os.makedirs(S, exist_ok=True)
R = "for (let k=0;k<45;k++) { if (window.__proto && __proto.render) __proto.render(); else if (SP.actions && SP.actions.idle) SP.actions.idle(1/60); }"
DAY = "SP.clock.setTimeName && SP.clock.setTimeName('day', true);"

def go(scene, px, py, dir_, extra=""):
    return (DAY +
            f"SP.actions.go('{scene}'); SP.stageD.syncCivicNpcs && SP.stageD.syncCivicNpcs();"
            f"const P=SP.player; P.x={px}; P.y={py}; P.setDir('{dir_}');"
            f"SP.game.ps.money=Math.max(SP.game.ps.money|0,400);"
            f"SP.actions.idle(0.35); {extra} {R}")

jobs = [
  (S+"d1-police-report.png", "?manual=1", 400,
   go("civic_police", 3.2, 2.8, "W", "SP.game.use(SP.world.byId.report_desk); SP.actions.idle(0.15);")),
  (S+"d2-hospital-loop.png", "?manual=1", 400,
   go("civic_hospital", 5.6, 3.2, "N", "SP.game.use(SP.world.byId.nurse); SP.actions.idle(0.15);")),
  (S+"d3-fire-drill.png", "?manual=1", 400,
   go("civic_fire", 2.2, 5.0, "N", "SP.game.use(SP.world.byId.duty); SP.actions.idle(0.15);")),
  (S+"d4-phone-map.png", "?manual=1", 400,
   DAY + "SP.actions.idle(0.2); SP.stageA.openPhone('map'); SP.stageD.markPoi('police');" + R),
  (S+"d5-bus-board.png", "?manual=1", 400,
   DAY + "SP.actions.go('street', [-18, 3.5, 'S']); SP.actions.idle(0.4);"
   "const stop=(SP.world.byId&&SP.world.byId.bus_stop)||SP.world.objects.find(o=>o.interact==='bus_stop');"
   "if(stop) SP.game.use(stop); SP.actions.idle(0.15);" + R),
  (S+"d6-xin-corridor.png", "?manual=1", 400,
   go("stair_xin_1f", 1.3, 2.6, "N",
      "const o=SP.world.byId.xin_mail||SP.world.byId.xin_dir||SP.world.byId.xin_notice; if(o) SP.game.use(o); SP.actions.idle(0.15);")),
]
cdp.shoot(jobs, w=1280, h=720)
print("done")
