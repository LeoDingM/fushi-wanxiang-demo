"""Char-A screenshots char-a1 … char-a6 (close-ups on civic NPCs + modern facades)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
os.makedirs(S, exist_ok=True)
R = "for (let k=0;k<55;k++) { if (window.__proto && __proto.render) __proto.render(); else if (SP.actions && SP.actions.idle) SP.actions.idle(1/60); }"
DAY = "SP.clock.setTimeName && SP.clock.setTimeName('day', true);"
ZOOM = "if (SP.cam) { SP.cam.zoom = 1.35; SP.cam.ready = false; }"

def go(scene, px, py, dir_, extra=""):
    return (DAY + ZOOM +
            f"SP.place.enter('{scene}', [{px},{py},'{dir_}']);"
            f"SP.stageD && SP.stageD.syncCivicNpcs && SP.stageD.syncCivicNpcs();"
            f"const P=SP.player; P.x={px}; P.y={py}; P.setDir('{dir_}');"
            f"SP.actions && SP.actions.idle && SP.actions.idle(0.4); {extra} {R}")

jobs = [
  (S+"char-a1-police-npc.png", "?manual=1", 600,
   go("civic_police", 2.6, 2.8, "E",
      "SP.ensureActor && SP.ensureActor('police'); SP.stageD.syncCivicNpcs();"
      "const n=SP.actors.list.find(a=>a.id==='civic_cop'); if(n){n.x=1.6;n.y=2.8;n.setDir('E');}")),
  (S+"char-a2-fire-npc.png", "?manual=1", 600,
   go("civic_fire", 3.2, 4.2, "W",
      "SP.ensureActor && SP.ensureActor('firefighter'); SP.stageD.syncCivicNpcs();"
      "const n=SP.actors.list.find(a=>a.id==='civic_firefighter'); if(n){n.x=2.4;n.y=4.0;n.setDir('S');}")),
  (S+"char-a3-nurse-npc.png", "?manual=1", 600,
   go("civic_hospital", 5.0, 3.0, "E",
      "SP.ensureActor && SP.ensureActor('nurse'); SP.stageD.syncCivicNpcs();"
      "const n=SP.actors.list.find(a=>a.id==='civic_nurse'); if(n){n.x=6.0;n.y=3.0;n.setDir('W');}")),
  # face SOUTH toward civic facades on the south strip (y≈-10)
  (S+"char-a4-police-street.png", "?manual=1", 600,
   DAY + ZOOM +
   "SP.place.enter('street', [-36.5, -7.2, 'S']); SP.player.x=-36.5; SP.player.y=-7.2; SP.player.setDir('S');"
   "SP.civicLook && SP.civicLook.spawnExtras && SP.civicLook.spawnExtras(); SP.actions.idle(0.5);" + R),
  (S+"char-a5-hospital-street.png", "?manual=1", 600,
   DAY + ZOOM +
   "SP.place.enter('street', [20.5, -7.2, 'S']); SP.player.x=20.5; SP.player.y=-7.2; SP.player.setDir('S');"
   "SP.actions.idle(0.5);" + R),
  (S+"char-a6-fire-street.png", "?manual=1", 600,
   DAY + ZOOM +
   "SP.place.enter('street', [56.5, -7.2, 'S']); SP.player.x=56.5; SP.player.y=-7.2; SP.player.setDir('S');"
   # force east chunk if needed
   "if (SP.chunks && SP.chunks.ensure) SP.chunks.ensure(56, -8); SP.actions.idle(0.6);" + R),
  (S+"char-a7-wardrobe.png", "?manual=1", 500,
   DAY + "SP.place.enter('room_2f02', [3.2, 2.2, 'S']); SP.appearance && SP.appearance.openWardrobe();"
   "SP.actions.idle(0.25);" + R),
  (S+"char-a8-extras.png", "?manual=1", 500,
   DAY + ZOOM +
   "SP.place.enter('street', [2, 4, 'S']); SP.player.x=2; SP.player.y=4; SP.player.setDir('E');"
   "SP.civicLook.spawnExtras(); SP.actions.idle(0.5);" + R),
]
cdp.shoot(jobs, w=1280, h=720)
print("char-a captures done")
