"""Screenshots civ1–civ4."""
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
R = "for (let k=0;k=20;k++) __proto.render();"

def nav():
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(140):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.amenityCivic"): break
    c.eval("SP.amenityCivic.install&&SP.amenityCivic.install()")

def shot(name, js, label, wait=0.4):
    nav(); c.eval(js); time.sleep(wait)
    for _ in range(8): c.eval("__proto.render()")
    data = base64.b64decode(c.call("Page.captureScreenshot", format="png")["data"])
    path = S + name; open(path, "wb").write(data)
    im = Image.open(path).convert("RGB"); d = ImageDraw.Draw(im)
    d.rectangle([0,0,1280,36], fill=(18,19,24))
    d.text((12,8), label, fill=(240,220,180), font=font(18))
    im.save(path); print("saved", name)

shot("civ1.png", """
SP.clock.setTimeName('day', true);
SP.actions.go('street',[22,1.6,'N']);
SP.amenityCivic.devGoto('canteen_gate');
SP.player.x=22; SP.player.y=1.5; SP.player.setDir('N');
__proto.lock(22, 1.95);
""" + R, "civ1 · 社区食堂门脸（stall+planter+notice 组合）")

shot("civ2.png", """
SP.amenityCivic.enterCanteen();
SP.player.x=4; SP.player.y=1.8; SP.player.setDir('N');
""" + R, "civ2 · 食堂内部 · 堂食/打包（无店员NPC）")

shot("civ3.png", """
SP.actions.go('street',[26.5,1.5,'N']);
SP.amenityCivic.devGoto('kinder');
SP.player.x=26.5; SP.player.y=1.5; SP.player.setDir('N');
__proto.lock(26.5, 1.9);
""" + R, "civ3 · 幼儿园接送点（hedge 门脸 · 无幼儿NPC）")

shot("civ4.png", """
SP.amenityCivic.enterProperty();
SP.player.x=2.7; SP.player.y=1.5; SP.player.setDir('N');
""" + R, "civ4 · 物业中心柜台 · 缴费/报修")

print("done", c.eval("SP.amenityCivic.status().map(x=>x.id)"))
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
