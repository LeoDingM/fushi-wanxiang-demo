"""Char-B screenshots char-b1 … char-b6."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
os.makedirs(S, exist_ok=True)
R = "for (let k=0;k<55;k++) { if (window.__proto && __proto.render) __proto.render(); else if (SP.actions && SP.actions.idle) SP.actions.idle(1/60); }"
DAY = "SP.clock.setTimeName && SP.clock.setTimeName('day', true);"
ZOOM = "if (SP.cam) { SP.cam.zoom = 1.35; SP.cam.ready = false; }"

def go_int(scene, px, py, dir_, extra=""):
    return (DAY + ZOOM +
            f"SP.place.enter('{scene}', [{px},{py},'{dir_}']);"
            f"SP.charB && SP.charB.syncSchoolNpcs && SP.charB.syncSchoolNpcs();"
            f"const P=SP.player; P.x={px}; P.y={py}; P.setDir('{dir_}');"
            f"SP.actions && SP.actions.idle && SP.actions.idle(0.4); {extra} {R}")

jobs = [
  (S+"char-b1-school-pri-street.png", "?manual=1", 700,
   DAY + ZOOM +
   "SP.place.enter('street', [68.0, -6.8, 'S']); if(SP.chunks&&SP.chunks.loadAll) SP.chunks.loadAll();"
   "SP.player.x=68; SP.player.y=-6.8; SP.player.setDir('S');"
   "SP.charB && SP.charB.loadSigns && SP.charB.loadSigns(); SP.actions.idle(0.5);" + R),
  (S+"char-b2-school-mid-npc.png", "?manual=1", 700,
   go_int("school_mid", 3.2, 2.6, "E",
          "SP.ensureActor && ['student','student_skirt','office'].forEach(n=>SP.ensureActor(n));"
          "SP.charB.syncSchoolNpcs();")),
  (S+"char-b3-school-pri-child.png", "?manual=1", 700,
   go_int("school_pri", 3.0, 2.6, "E",
          "SP.ensureActor && SP.ensureActor('child_cue'); SP.charB.syncSchoolNpcs();"
          "const n=SP.actors.list.find(a=>a.id==='schoolnpc_stu'); if(n){n.x=2.2;n.y=2.7;n.setDir('E');}")),
  (S+"char-b4-school-high-street.png", "?manual=1", 700,
   DAY + ZOOM +
   "SP.place.enter('street', [92.0, -6.8, 'S']); if(SP.chunks&&SP.chunks.loadAll) SP.chunks.loadAll();"
   "SP.player.x=92; SP.player.y=-6.8; SP.player.setDir('S');"
   "SP.actions.idle(0.5);" + R),
  (S+"char-b5-barber-street.png", "?manual=1", 750,
   DAY + ZOOM +
   "SP.place.enter('street', [48.5, 3.0, 'N']); if(SP.chunks&&SP.chunks.loadAll) SP.chunks.loadAll();"
   "SP.player.x=48.5; SP.player.y=3.0; SP.player.setDir('N'); SP.actions.idle(0.6);" + R),
  (S+"char-b6-barber-hair.png", "?manual=1", 700,
   DAY + ZOOM +
   "SP.place.enter('shop_barber', [3.0, 1.5, 'N']); SP.player.x=2.8; SP.player.y=2.0; SP.player.setDir('E');"
   "SP.game.ps.money=200; SP.charB.setHairId('ponytail'); SP.charB.openBarber({id:'cut_chair',interact:'barber'});"
   "SP.actions.idle(0.3);" + R),
]
cdp.shoot(jobs, w=1280, h=720)
print("char-b captures done")
