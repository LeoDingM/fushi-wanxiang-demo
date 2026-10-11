"""Char-D screenshots char-d1…d6 — real hair atlases + office_skirt + female crowd.
Each job navigates fresh (cdp.shoot) so frames aren't stale."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
os.makedirs(S, exist_ok=True)
R = (
  "for (let k=0;k<80;k++) {"
  "  if (window.__proto && __proto.render) __proto.render();"
  "  else if (SP.actions && SP.actions.idle) SP.actions.idle(1/60);"
  "}"
)
DAY = "SP.clock.setTimeName && SP.clock.setTimeName('day', true);"
ZOOM = "if (SP.cam) { SP.cam.zoom = 2.35; SP.cam.ready = false; SP.cam.follow = null; }"
CROWD = "SP.charC._forceRespawn=true; SP.charC.spawnStreetCrowd();"
WAIT = (
  "(function(need){"
  "  need.forEach(function(n){ if(SP.ensureActor) SP.ensureActor(n); });"
  "  var t0=Date.now();"
  "  while(Date.now()-t0<3500){"
  "    if(need.every(function(n){ return SP.img['actor_'+n]; })) break;"
  "  }"
  "}) "
)

jobs = [
  (S+"char-d1-hair-atlases-f.png", "?manual=1", 1400,
   DAY + ZOOM +
   "SP.place.enter('street', [9.5, 4.4, 'S']);"
   "SP.player.x=9.5; SP.player.y=5.4; SP.player.setDir('N');"
   + WAIT + "(['woman_bob','woman_pony','woman_long','woman_twin','woman_wave','woman_bun','woman_pixie','woman_braid']);"
   + CROWD +
   "var sets=['woman_bob','woman_pony','woman_long','woman_twin','woman_wave','woman_bun','woman_pixie','woman_braid'];"
   "var fs=SP.actors.list.filter(function(a){return a.extraNpc||a.layerExtra;});"
   "sets.forEach(function(set,i){ var a=fs[i]; if(!a) return;"
   "  a.set=set; a.sprite=set; a.useHairAtlas=true; a.hairShape=null;"
   "  a.x=5.9+i*1.05; a.y=4.35; a.setDir('S');"
   "  a.vx=0; a.vy=0; a.state='idle'; a.route=null; a.path=null; a.frozen=true;"
   "  a.appearance=Object.assign({},a.appearance||{},{gender:'female',outfitSet:set,forceHairAtlas:true});"
   "});"
   "if(SP.cam){ SP.cam.x=9.5; SP.cam.y=4.5; SP.cam.targetX=9.5; SP.cam.targetY=4.5; }"
   + R),

  (S+"char-d2-hair-atlases-m.png", "?manual=1", 1400,
   DAY + ZOOM +
   "SP.place.enter('street', [9, 4.25, 'S']);"
   "SP.player.x=9; SP.player.y=5.25; SP.player.setDir('N');"
   + WAIT + "(['man_undercut','man_buzz','man_short','man_messy','man_sidepart','man_mullet','man_bald','man_grey']);"
   + CROWD +
   "var sets=['man_undercut','man_buzz','man_short','man_messy','man_sidepart','man_mullet','man_bald','man_grey'];"
   "var ms=SP.actors.list.filter(function(a){return a.extraNpc||a.layerExtra;});"
   "sets.forEach(function(set,i){ var a=ms[i]; if(!a) return;"
   "  a.set=set; a.sprite=set; a.useHairAtlas=true; a.hairShape=null;"
   "  a.x=5.5+i*1.05; a.y=4.2; a.setDir('S');"
   "  a.vx=0; a.vy=0; a.state='idle'; a.route=null; a.path=null; a.frozen=true;"
   "  a.appearance=Object.assign({},a.appearance||{},{gender:'male',outfitSet:set,forceHairAtlas:true});"
   "});"
   "if(SP.cam){ SP.cam.x=9; SP.cam.y=4.35; SP.cam.targetX=9; SP.cam.targetY=4.35; }"
   + R),

  (S+"char-d3-office-skirt.png", "?manual=1", 1300,
   DAY + ZOOM +
   "SP.place.enter('street', [14, 4.2, 'W']);"
   + WAIT + "(['office_skirt','woman_bob']);"
   "SP.appearance.setOutfitId('hair_office_skirt');"
   "SP.player.x=14; SP.player.y=4.2; SP.player.setDir('S');"
   + CROWD +
   "var a=SP.actors.list.find(function(x){return x.id==='hx_oskirt';})||SP.actors.list.filter(function(x){return x.extraNpc;})[0];"
   "if(a){ a.set='office_skirt'; a.sprite='office_skirt'; a.useHairAtlas=false;"
   "  a.x=13.2; a.y=4.3; a.setDir('S'); a.frozen=true; a.state='idle'; a.route=null;"
   "  a.appearance=Object.assign({},a.appearance||{},{outfitSet:'office_skirt',forceHairAtlas:false,gender:'female'}); }"
   "if(SP.cam){ SP.cam.zoom=2.4; SP.cam.x=13.6; SP.cam.y=4.35; SP.cam.targetX=13.6; SP.cam.targetY=4.35; SP.cam.follow=null; }"
   + R),

  (S+"char-d4-barber-hair-atlas.png", "?manual=1", 1400,
   DAY +
   "SP.chunks&&SP.chunks.loadAll&&SP.chunks.loadAll();"
   "SP.place.enter('shop_barber', [3, 1.5, 'N']);"
   "SP.player.x=2.8; SP.player.y=2; SP.player.setDir('E');"
   "SP.game.ps.money=300;"
   + WAIT + "(['woman_pony','woman_bob','man_undercut']);"
   "SP.charB.openBarber({interact:'barber'});"
   "SP.charB.setHairId('f_pony');"
   "SP.actions.idle(0.4);"
   + R),

  (S+"char-d5-wardrobe-hair.png", "?manual=1", 1300,
   DAY + ZOOM +
   "SP.place.enter('street', [3, 4.8, 'S']);"
   + WAIT + "(['woman_twin']);"
   "SP.appearance.setOutfitId('hair_woman_twin');"
   "SP.player.x=3; SP.player.y=4.8; SP.player.setDir('S');"
   + CROWD +
   "SP.appearance.openWardrobe();"
   "if(SP.cam){ SP.cam.zoom=2.15; SP.cam.x=3; SP.cam.y=4.8; SP.cam.follow=null; }"
   "SP.actions.idle(0.35);"
   + R),

  (S+"char-d6-mixed-crowd.png", "?manual=1", 1400,
   DAY + ZOOM +
   "SP.place.enter('street', [8, 4.2, 'E']);"
   + WAIT + "(['man_undercut','woman_bob','woman_pony','office_skirt']);"
   "SP.appearance.setOutfitId('hair_man_undercut');"
   "SP.player.x=8; SP.player.y=4.2; SP.player.setDir('E');"
   + CROWD +
   "if(SP.cam){ SP.cam.zoom=1.95; SP.cam.x=8; SP.cam.y=4.2; SP.cam.follow=null; }"
   "SP.actions.idle(0.5);"
   + R),
]
cdp.shoot(jobs, w=1280, h=720)
import hashlib
from pathlib import Path
hs={}
for p in sorted(Path(S).glob('char-d*.png')):
  h=hashlib.md5(p.read_bytes()).hexdigest()[:8]
  print(p.name, p.stat().st_size, h)
  hs[h]=hs.get(h,0)+1
print('unique', len(hs), 'of', sum(hs.values()))
print("char-d captures done")
