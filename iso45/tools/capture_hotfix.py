"""Hotfix captures (phone 844x390, ?manual=1): python3 tools/capture_hotfix.py [names...]
   -> screenshots/h1-room-declutter.png, h2-bed-prompt.png, h3-roof-night.png, h4-night-entrances.png, h5-night-winter-vs-summer.png"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import cdp
from PIL import Image, ImageDraw
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
R = "for (let k=0;k<30;k++) window.__proto.render();"
ROOM = "SP.actions.go('room_2f02'); const G=SP.game, W=SP.world, P=SP.player;"
J = {
 "h1": (S + "h1-room-declutter.png", "?touch=1&manual=1&time=afternoon", 1500, ROOM + "P.x=2.6; P.y=2.2; P.setDir('S'); SP.actions.idle(0.3);" + R),
 "h2": (S + "h2-bed-prompt.png", "?touch=1&manual=1&time=night", 1500, ROOM + "P.x=0.8; P.y=2.62; P.setDir('N'); SP.actions.idle(0.3);" + R),
 "h3": (S + "h3-roof-night.png", "?touch=1&manual=1&time=night", 1500, "SP.actions.go('roof'); SP.actions.idle(3);" + R),
 "h4": (S + "h4-night-entrances.png", "?manual=1&time=night&zoom=1.1", 1500, "SP.player.x=1.5; SP.player.y=10.2; SP.player.setDir('S'); SP.actions.idle(1);" + R),
 "w": ("/tmp/s45/h_w.png", "?manual=1&time=night&season=winter&weather=snow", 1500, "SP.player.x=1.5; SP.player.y=10.2; SP.cam.zoom=1.2; SP.actions.idle(1);" + R),
 "s": ("/tmp/s45/h_s.png", "?manual=1&time=night&season=summer&weather=clear", 1500, "SP.player.x=1.5; SP.player.y=10.2; SP.cam.zoom=1.2; SP.actions.idle(1);" + R),
}
names = sys.argv[1:] or list(J)
cdp.shoot([J[n] for n in names], w=844 if "h1" in names or "h2" in names or "h3" in names else 1280, h=390 if "h1" in names or "h2" in names or "h3" in names else 720)
if "w" in names and "s" in names:
    from capture import font
    ims = [Image.open(f"/tmp/s45/h_{k}.png").convert("RGB").resize((640, 360)) for k in "ws"]
    sheet = Image.new("RGB", (1300, 410), (18, 19, 24)); d = ImageDraw.Draw(sheet)
    for i, (im, t) in enumerate(zip(ims, ("冬夜·雪（冷蓝调）", "夏夜·晴（暖调）"))):
        sheet.paste(im, (10 + i * 650, 44)); d.text((14 + i * 650, 8), t, fill=(236, 226, 204), font=font(24))
    sheet.save(S + "h5-night-winter-vs-summer.png"); print("saved h5")
