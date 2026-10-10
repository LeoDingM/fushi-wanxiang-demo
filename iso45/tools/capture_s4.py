"""Stage-4 captures (phone 844x390, deterministic ?manual=1): python3 tools/capture_s4.py
   -> screenshots/99-home-poses.png (cook / eat on the stool / shower silhouette), 99b-knock-light.png, 99c-pay-caption.png, 99d-busstop-sign.png"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import cdp
from PIL import Image, ImageDraw
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
R = "for (let k=0;k<30;k++) window.__proto.render();"
ROOM = "SP.actions.go('room_2f02'); const G=SP.game, W=SP.world, P=SP.player; G.ps.items.noodles=2; G.ps.items.egg=4;"
jobs = [
 ("/tmp/s45/p_cook.png", "?touch=1&manual=1&time=dusk", 1500, ROOM + "P.x=1.1; P.y=1.25; SP.actions.idle(0.1); G.start('cook_noodles', W.byId.kitchen); SP.actions.idle(0.8);" + R),
 ("/tmp/s45/p_eat.png", "?touch=1&manual=1&time=dusk", 1500, ROOM + "W.setState(W.byId.table,'meal'); P.x=2.0; P.y=0.5; SP.actions.idle(0.1); G.start('eat_home', W.byId.table); SP.actions.idle(1.0);" + R),
 ("/tmp/s45/p_shower.png", "?touch=1&manual=1&time=dusk", 1500, ROOM + "W.setState(W.byId.bath_door,'open'); W.rebuildColliders(); P.x=5.3; P.y=2.7; SP.actions.idle(0.1); G.start('shower', W.byId.shower); SP.actions.idle(1.0);" + R),
 (S + "99b-knock-light.png", "?touch=1&manual=1&time=night", 1500, "SP.actions.go('stair_3f'); const P=SP.player; P.x=2.1; P.y=3.5; P.setDir('N'); SP.actions.idle(0.2); SP.game.knock(SP.world.byId.door_3f01); SP.actions.idle(1.6);" + R),
 (S + "99c-pay-caption.png", "?touch=1&manual=1&time=night", 1500, ROOM + "P.x=3.24; P.y=2.6; SP.actions.idle(0.1); G.start('order_hmj', W.byId.desk); SP.actions.idle(0.3);" + R),
 (S + "99d-busstop-sign.png", "?touch=1&manual=1&time=afternoon", 1500, "SP.player.x=-17.6; SP.player.y=1.4; SP.player.setDir('W'); SP.actions.idle(0.6);" + R),
]
cdp.shoot(jobs, w=844, h=390)
ims = [Image.open(f"/tmp/s45/p_{k}.png").convert("RGB") for k in ("cook", "eat", "shower")]
W_, H_ = ims[0].size; sheet = Image.new("RGB", (W_ * 3 + 40, H_ + 50), (18, 19, 24)); d = ImageDraw.Draw(sheet)
from capture import font
for i, (im, t) in enumerate(zip(ims, ("灶台炒菜（cook）", "小圆凳上吃饭（eat）", "磨砂淋浴屏后的剪影（shower）"))):
    sheet.paste(im, (10 + i * (W_ + 10), 40)); d.text((14 + i * (W_ + 10), 8), t, fill=(236, 226, 204), font=font(22))
sheet.save(S + "99-home-poses.png"); print("saved 99-home-poses.png")
