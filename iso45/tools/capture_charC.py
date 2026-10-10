"""Char-C screenshots char-c1…c6 — male+female distinct hairs."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
os.makedirs(S, exist_ok=True)
R = "for (let k=0;k<50;k++) { if (window.__proto && __proto.render) __proto.render(); else if (SP.actions && SP.actions.idle) SP.actions.idle(1/60); }"
DAY = "SP.clock.setTimeName && SP.clock.setTimeName('day', true);"
ZOOM = "if (SP.cam) { SP.cam.zoom = 1.4; SP.cam.ready = false; }"

jobs = [
  (S+"char-c1-females-street.png", "?manual=1", 700,
   DAY + ZOOM +
   "SP.place.enter('street', [8, 4.2, 'E']); SP.player.x=8; SP.player.y=4.2; SP.player.setDir('E');"
   "SP.charC.spawnStreetCrowd(); SP.actions.idle(0.5);" + R),
  (S+"char-c2-male-hairs.png", "?manual=1", 700,
   DAY + ZOOM +
   "SP.place.enter('street', [4, 3.4, 'W']); SP.player.x=4; SP.player.y=3.4; SP.player.setDir('W');"
   "SP.charC.spawnStreetCrowd();"
   "['m_sidepart','m_undercut','m_buzz'].forEach((h,i)=>{const a=SP.actors.list.filter(x=>x.extraNpc)[i]; if(a){a.hairId=h;a.hairShape=SP.charC.spec(h).shape;a.hairTint=SP.charC.spec(h).tint;}});"
   "SP.actions.idle(0.4);" + R),
  (S+"char-c3-female-hairs.png", "?manual=1", 700,
   DAY + ZOOM +
   "SP.place.enter('street', [12, 4, 'S']); SP.player.x=12; SP.player.y=4; SP.player.setDir('S');"
   "SP.charC.spawnStreetCrowd();"
   "const fs=SP.actors.list.filter(a=>a.appearance&&a.appearance.gender==='female');"
   "['f_long','f_pony','f_twin','f_bun'].forEach((h,i)=>{const a=fs[i]; if(a){a.hairId=h;a.hairShape=SP.charC.spec(h).shape;a.hairTint=SP.charC.spec(h).tint; a.x=10+i*1.6; a.y=4.2; a.setDir('S');}});"
   "SP.actions.idle(0.4);" + R),
  (S+"char-c4-barber-menu.png", "?manual=1", 650,
   DAY + ZOOM +
   "SP.chunks&&SP.chunks.loadAll&&SP.chunks.loadAll();"
   "SP.place.enter('shop_barber', [3, 1.5, 'N']); SP.player.x=2.8; SP.player.y=2; SP.player.setDir('E');"
   "SP.game.ps.money=300; SP.charB.openBarber({interact:'barber'}); SP.actions.idle(0.3);" + R),
  (S+"char-c5-player-pony.png", "?manual=1", 650,
   DAY + ZOOM +
   "SP.place.enter('street', [2, 5, 'S']); SP.charB.setHairId('f_pony');"
   "SP.player.x=2; SP.player.y=5; SP.player.setDir('S'); SP.charC.spawnStreetCrowd(); SP.actions.idle(0.4);" + R),
  (S+"char-c6-mixed-crowd.png", "?manual=1", 700,
   DAY + ZOOM +
   "SP.place.enter('street', [0, 4, 'E']); SP.player.x=0; SP.player.y=4; SP.player.setDir('E');"
   "SP.charC.spawnStreetCrowd(); SP.actions.idle(0.5);" + R),
]
cdp.shoot(jobs, w=1280, h=720)
print("char-c captures done")
