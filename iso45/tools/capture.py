"""Headless-Chrome captures for scene-proto-45 (deterministic: ?manual=1, the sim is stepped from here).
   python3 tools/capture.py   -> screenshots/60..65 *.png, 66-walk.gif, 67-compare.png, 68-clip-audit.gif (+ frames check)
   (69-mobile-*.png come from tools/mobile_test.py)"""
import os, sys, time, json, base64, io, shutil
sys.path.insert(0, os.path.dirname(__file__))
from cdp import start, CDP, BASE
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "screenshots"); os.makedirs(OUT, exist_ok=True)
CONCEPT = os.path.join(HERE, "..", "..", "web-demo", "img", "bg", "ext_day.jpg")
P = "window.__proto"
FONT = next((f for f in ["/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", "/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc"] if os.path.exists(f)), None)
def font(sz): return ImageFont.truetype(FONT, sz) if FONT else ImageFont.load_default()

def page(c, query, w=1280, h=720):
    c.call("Emulation.setDeviceMetricsOverride", width=w, height=h, deviceScaleFactor=1, mobile=False)
    c.call("Page.navigate", url=BASE + "?manual=1&shot=1&touch=0&w=%d&h=%d&" % (w, h) + query)
    for _ in range(150):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady"): return
    raise SystemExit("page not ready")
def step(c, secs, dt=1 / 30): c.eval(f"{P}.step({dt},{max(1, int(round(secs / dt)))})")
def snap(c, name=None, w=1280, h=720):
    assert c.eval("location.href.indexOf('scene-proto-45') >= 0 && !!window.__protoReady"), "not our page"
    data = base64.b64decode(c.call("Page.captureScreenshot", format="png", clip={"x": 0, "y": 0, "width": w, "height": h, "scale": 1})["data"])
    if name: open(os.path.join(OUT, name), "wb").write(data); print("saved", name, flush=True)
    return Image.open(io.BytesIO(data)).convert("RGB")
def wait_for(c, cond, secs, dt=0.1):
    for _ in range(int(secs / dt)):
        if c.eval(cond): return True
        step(c, dt)
    return False

def main():
    p, prof, ws = start()
    try:
        c = CDP(ws); c.call("Runtime.enable")
        # 60 overview: the corner block at native pixels
        page(c, "px=6.2&py=8.5&dir=SW", 1920, 1080); c.eval(f"{P}.lock(9.0, 7.0)"); step(c, 12); snap(c, "60-overview.png", 1920, 1080)
        # 61 behind the courtyard wall: the front_wall group fades to 35 %
        page(c, "px=-1.0&py=4.75&dir=SW&npcs=0"); step(c, 1.2); snap(c, "61-fade-behind-wall.png")
        # 62 on the zebra: both main-road lanes stop
        page(c, "px=12.0&py=-9.0&dir=N"); c.eval(f"{P}.lock(12.0,-3.0)")
        wait_for(c, f"{P}.traffic.cars.some(k=>k.lane==='eb'&&k.x>-2&&k.x<6)&&{P}.traffic.cars.some(k=>k.lane==='wb'&&k.x>18&&k.x<28)", 40)
        c.eval(f"{P}.place(12.0,-3.2,'N')"); step(c, 2.5); snap(c, "62-traffic-cross.png")
        # 63 fire at the 1F window, dusk
        page(c, "px=7.0&py=9.0&dir=N&time=dusk"); c.eval(f"{P}.lock(4.5, 10.5)"); c.eval(f"{P}.trigger('fire')"); step(c, 4.0); snap(c, "63-fire.png")
        # 64 crash at the north curb
        page(c, "px=16.0&py=2.4&dir=S"); c.eval(f"{P}.lock(18.0,0.5)"); c.eval(f"{P}.trigger('crash')")
        wait_for(c, f"!!{P}.traffic.crashed", 40, 0.25); step(c, 3.2); snap(c, "64-crash.png")
        # 65 debug view: sort boxes, footprints, foot circles, painter index, NPC routes
        page(c, "px=6.4&py=6.6&dir=SW&debug=1"); step(c, 6); snap(c, "65-debug.png")
        # 66 walk loop: courtyard -> gate -> sidewalk -> zebra -> far side -> back through the gate
        page(c, "px=5.0&py=9.5&dir=S", 960, 540)
        c.eval(f"{P}.autopilot([[6.19,7.0],[6.19,3.2],[11.0,2.4],[12.0,0.8],[12.0,-7.6],[12.6,-8.2],[12.6,0.8],[11.0,2.6],[6.19,3.2],[6.19,7.0],[5.0,9.5]])")
        frames = []
        for i in range(600):
            step(c, 1 / 12, 1 / 60)
            if i % 2 == 0: frames.append(snap(c, None, 960, 540).quantize(colors=200, method=Image.Quantize.MEDIANCUT))
            if c.eval(f"{P}.autoDone()"): break
        frames[0].save(os.path.join(OUT, "66-walk.gif"), save_all=True, append_images=frames[1:], duration=166, loop=0, optimize=True)
        print("saved 66-walk.gif", len(frames), "frames", flush=True)
        # 67 concept art (left) vs prototype (right), same framing: 2560x1440 native render, downscaled 2x
        page(c, "px=7.5&py=9.0&dir=SW", 2560, 1440); c.eval(f"{P}.lock(1.5, 12.6, -180, 214)"); step(c, 10)
        proto = snap(c, None, 2560, 1440).resize((1280, 720), Image.LANCZOS)
        concept = Image.open(CONCEPT).convert("RGB").resize((1280, 720))
        cmp_ = Image.new("RGB", (2560 + 24, 720 + 44), (18, 19, 24)); cmp_.paste(concept, (0, 44)); cmp_.paste(proto, (1280 + 24, 44))
        d = ImageDraw.Draw(cmp_); d.text((12, 8), "概念图 web-demo/img/bg/ext_day.jpg", fill=(230, 220, 200), font=font(22))
        d.text((1280 + 36, 8), "scene-proto-45 实机（45° 2:1 等距，2560×1440 原生渲染缩至 50%）", fill=(230, 220, 200), font=font(22))
        cmp_.save(os.path.join(OUT, "67-compare.png")); print("saved 67-compare.png", flush=True)
        # 68 clip audit: crowded moments (head-on at the gate, the car/fence corridor, past the stall), debug circles on,
        #     every frame annotated with the live audit counters
        page(c, "px=8.6&py=6.2&dir=W&debug=1", 960, 540)
        scenes = [
            ("铁门：学生与王阿姨迎面错身", (6.19, 4.8), "(()=>{const P=__proto,s=P.npc('student'),v=P.npc('vendor');s.x=6.19;s.y=7.6;s.brain.idx=2;s.brain.step=1;v.x=6.0;v.y=3.6;v.brain.idx=2;v.brain.step=1;P.place(7.3,5.6,'W');P.autopilot([[5.2,5.6],[5.2,3.0],[7.6,3.0]]);return true})()"),
            ("停车与围墙间 0.94 m 窄道：大爷与李默", (15.2, 8.5), "(()=>{const P=__proto,u=P.npc('uncle');u.x=16.05;u.y=10.8;u.brain.idx=3;P.place(16.05,5.9,'N');P.autopilot([[16.05,9.0],[16.05,11.8],[12.6,11.8]]);return true})()"),
            ("早点摊：上班族经过做饭的王阿姨，外卖骑手在侧路", (1.5, 3.2), "(()=>{const P=__proto,o=P.npc('office'),v=P.npc('vendor');v.x=-0.4;v.y=3.6;v.brain.idx=0;v.brain.step=-1;o.x=4.6;o.y=3.6;o.brain.idx=0;o.brain.step=-1;P.place(-2.6,3.0,'E');P.autopilot([[2.0,2.6],[4.2,3.6]]);return true})()"),
        ]
        frames = []; worst = {"overlaps": 0, "intrusions": 0, "sort": 0, "pixel": 0}
        for label, lock, setup in scenes:
            c.eval(f"{P}.reset()"); c.eval(f"{P}.state.debug=true"); c.eval(f"{P}.lock({lock[0]},{lock[1]})"); c.eval(setup); step(c, 0.05)
            for i in range(60):
                step(c, 1 / 10, 1 / 60)
                a = c.eval(f"[{P}.audit.collisions(), {P}.audit.sort(), {P}.audit.pixels()]")
                worst["overlaps"] += a[0][0]; worst["intrusions"] += a[0][1]; worst["sort"] += a[1]; worst["pixel"] += a[2]
                im = snap(c, None, 960, 540); d = ImageDraw.Draw(im)
                d.rectangle((0, 500, 960, 540), fill=(12, 12, 18))
                d.text((10, 507), f"{label}   帧 {i:02d}   本帧: 重叠 {a[0][0]}  穿入 {a[0][1]}  排序违例 {a[1]}  像素违例 {a[2]}", fill=(240, 230, 190), font=font(17))
                frames.append(im.quantize(colors=220, method=Image.Quantize.MEDIANCUT))
            c.eval(f"{P}.stopAuto()")
        frames[0].save(os.path.join(OUT, "68-clip-audit.gif"), save_all=True, append_images=frames[1:], duration=110, loop=0, optimize=True)
        # contact sheet of every 6th frame for visual frame-by-frame review
        sheet = Image.new("RGB", (4 * 480, ((len(frames[::6]) + 3) // 4) * 270))
        for k, f in enumerate(frames[::6]): sheet.paste(f.convert("RGB").resize((480, 270)), ((k % 4) * 480, (k // 4) * 270))
        sheet.save(os.path.join(OUT, "68-clip-audit-sheet.png"))
        print("saved 68-clip-audit.gif", len(frames), "frames; per-frame audit totals", worst, flush=True)
        errs = [l for l in c.logs if l.get("method") == "Runtime.exceptionThrown" or l["params"].get("type") == "error"]
        print("JS errors:", len(errs), json.dumps([e["params"] for e in errs])[:500] if errs else "")
    finally:
        p.kill(); shutil.rmtree(prof, ignore_errors=True)

if __name__ == "__main__":
    main()
