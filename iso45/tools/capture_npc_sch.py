"""Screenshots npc-sch1…npc-sch4 for NPC schedule + affinity track."""
import os, sys, time, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
from PIL import Image, ImageDraw, ImageFont

S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
FONT = next((f for f in ["/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
                         "/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc"] if os.path.exists(f)), None)
def font(sz):
    return ImageFont.truetype(FONT, sz) if FONT else ImageFont.load_default()

p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def nav():
    c.call("Page.navigate", url=cdp.BASE + "?manual=1&npcs=1")
    for _ in range(140):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.npcSchedule"): break
    c.eval("if(SP.npcSchedule&&SP.npcSchedule.install)SP.npcSchedule.install()")

def shot(name, js, wait=0.35, label=None):
    nav()
    c.eval(js)
    time.sleep(wait)
    for _ in range(10):
        c.eval("__proto.render()")
    data = base64.b64decode(c.call("Page.captureScreenshot", format="png")["data"])
    path = S + name
    open(path, "wb").write(data)
    if label:
        im = Image.open(path).convert("RGB")
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 1280, 36], fill=(18, 19, 24))
        d.text((12, 8), label, fill=(240, 220, 180), font=font(18))
        im.save(path)
    print("saved", name, c.eval("SP.clock && SP.clock.clockLabel()"), c.eval("SP.npcSchedule && SP.npcSchedule.status().map(x=>x.id+':'+(x.hidden?'H':x.slot)).join(',')"))

R = "for (let k=0;k<24;k++) __proto.render();"

shot("npc-sch1.png", """
SP.clock.setTimeName('morning', true);
SP.actions.go('street',[6.2,5.5,'S']);
SP.npcSchedule.snapToSchedule();
SP.player.x=6.2; SP.player.y=5.5; SP.player.setDir('S');
""" + R, label="npc-sch1 · 清晨：学生/上班族出门通勤 · 日程槽位", wait=0.4)

shot("npc-sch2.png", """
SP.clock.min = 720; SP.clock.computeAmbient && SP.clock.computeAmbient();
SP.npcSchedule.snapToSchedule();
const g = SP.npcSchedule.schoolWaypoint();
SP.actions.go('street',[g[0], g[1]+1.2,'N']);
SP.player.x = g[0]; SP.player.y = g[1] + 1.5; SP.player.setDir('N');
__proto.lock(g[0], g[1]);
""" + R, label="npc-sch2 · 正午：学生前往学校路点（Char-B school_mid）", wait=0.45)

shot("npc-sch3.png", """
SP.clock.setTimeName('day', true);
SP.npcSchedule.snapToSchedule();
const v = SP.npcs.list.find(a => a.id === 'vendor');
v.hidden = false; v.x = -0.4; v.y = 3.6;
SP.player.x = 0.2; SP.player.y = 3.6; SP.player.setDir('W');
SP.npcSchedule._cd['vendor'] = 0;
SP.npcSchedule.greet(v);
__proto.lock(0, 3.6);
""" + R, label="npc-sch3 · 打招呼：王阿姨好感上升 + toast/HUD", wait=0.5)

shot("npc-sch4.png", """
SP.clock.min = 1380; SP.clock.computeAmbient && SP.clock.computeAmbient();
SP.npcSchedule.snapToSchedule();
SP.actions.go('street',[6.2,6.0,'S']);
SP.player.x=6.2; SP.player.y=6.0;
__proto.lock(6.2, 5.0);
""" + R, label="npc-sch4 · 夜晚：街坊回家/街面稀疏（室内偏好）", wait=0.45)

print("done", c.eval("!!SP.npcSchedule"))
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
