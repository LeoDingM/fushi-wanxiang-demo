"""Screenshots prop1–prop4."""
import os, sys, time, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
from PIL import Image, ImageDraw, ImageFont
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
FONT = next((f for f in ["/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
                         "/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc"] if os.path.exists(f)), None)
def font(sz): return ImageFont.truetype(FONT, sz) if FONT else ImageFont.load_default()

p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)
R = "for (let k=0;k<22;k++) __proto.render();"

def nav():
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(140):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.amenityProps"): break
    c.eval("SP.amenityProps.install && SP.amenityProps.install()")

def shot(name, js, label, wait=0.4):
    nav(); c.eval(js); time.sleep(wait)
    for _ in range(8): c.eval("__proto.render()")
    data = base64.b64decode(c.call("Page.captureScreenshot", format="png")["data"])
    path = S + name; open(path, "wb").write(data)
    im = Image.open(path).convert("RGB"); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 1280, 36], fill=(18, 19, 24))
    d.text((12, 8), label, fill=(240, 220, 180), font=font(18))
    im.save(path); print("saved", name)

shot("prop1.png", """
SP.clock.setTimeName('day', true);
SP.amenityProps.devGoto('parcel');
SP.player.x=10.2; SP.player.y=3.1; SP.player.setDir('N');
__proto.lock(10.2, 3.55);
""" + R, "prop1 · 快递驿站（取件→背包）")

shot("prop2.png", """
SP.clock.setTimeName('day', true);
SP.amenityProps.enterPharmacy();
SP.player.x=3; SP.player.y=1.8; SP.player.setDir('N');
""" + R, "prop2 · 井槐药店内部 · 货架买创可贴（无店员NPC）")

shot("prop3.png", """
SP.actions.go('street',[4.8,3.1,'N']);
SP.amenityProps.devGoto('charger');
SP.player.x=4.8; SP.player.y=3.1; SP.player.setDir('N');
__proto.lock(4.8, 3.45);
""" + R, "prop3 · 社区充电桩")

shot("prop4.png", """
SP.actions.go('street',[-5.6,3.2,'N']);
SP.amenityProps.devGoto('recycle');
SP.player.x=-5.6; SP.player.y=3.2; SP.player.setDir('N');
__proto.lock(-5.6, 3.5);
""" + R, "prop4 · 垃圾分类点")

print("done", c.eval("SP.amenityProps.status().map(x=>x.id)"))
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
