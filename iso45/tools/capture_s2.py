"""Stage-2 captures (map + art + the features ported from the front-view line). Deterministic (?manual=1).
   python3 tools/capture_s2.py  -> screenshots/70-overview-v2 71-compare-v2 72-dusk 73-night 74-mobile 75-walk.mp4
                                   76-rain-night 77-snow-steps 78-seasons 79-fog 80-interactions 81-weather-mobile"""
import os, sys, io, subprocess, shutil, tempfile
sys.path.insert(0, os.path.dirname(__file__))
from capture import page, step, snap, font, OUT, CONCEPT, P
from cdp import start, CDP
from PIL import Image, ImageDraw

def label(im, text, sz=22):
    d = ImageDraw.Draw(im); w = d.textlength(text, font=font(sz))
    d.rectangle([8, 8, 8 + w + 16, 8 + sz + 14], fill=(14, 16, 22)); d.text((16, 13), text, fill=(236, 226, 204), font=font(sz)); return im
def sheet(ims, cols, name, pad=10):
    w, h = ims[0].size; rows = (len(ims) + cols - 1) // cols
    S = Image.new("RGB", (cols * w + (cols + 1) * pad, rows * h + (rows + 1) * pad), (18, 19, 24))
    for i, im in enumerate(ims): S.paste(im, (pad + (i % cols) * (w + pad), pad + (i // cols) * (h + pad)))
    S.save(os.path.join(OUT, name)); print("saved", name, flush=True)

def main(only=None):
    p, prof, ws = start()
    try:
        c = CDP(ws); c.call("Runtime.enable")
        g = c.eval
        # 70 overview (desktop default framing, zoom 0.5, late afternoon, summer)
        page(c, "px=6.2&py=8.5&dir=SW&time=afternoon&zoom=0.67", 1920, 1080); g(f"{P}.lock(12.0, 6.0)"); step(c, 10); snap(c, "70-overview-v2.png", 1920, 1080)
        # 71 concept vs prototype
        page(c, "px=7.5&py=9.0&dir=SW&time=afternoon&zoom=1", 2560, 1440); g(f"{P}.lock(1.5, 12.6, -180, 214)"); step(c, 10)
        proto = snap(c, None, 2560, 1440).resize((1280, 720), Image.LANCZOS); concept = Image.open(CONCEPT).convert("RGB").resize((1280, 720))
        cmp_ = Image.new("RGB", (2560 + 24, 720 + 44), (18, 19, 24)); cmp_.paste(concept, (0, 44)); cmp_.paste(proto, (1280 + 24, 44))
        d = ImageDraw.Draw(cmp_); d.text((12, 8), "概念图 web-demo/img/bg/ext_day.jpg", fill=(230, 220, 200), font=font(22))
        d.text((1280 + 36, 8), "scene-proto-45 Stage 2 实机（午后 16:50，夏，2560×1440 原生渲染缩至 50%）", fill=(230, 220, 200), font=font(22))
        cmp_.save(os.path.join(OUT, "71-compare-v2.png")); print("saved 71-compare-v2.png", flush=True)
        # 72 dusk / 73 night (real light sources: lightmap + emissive layer)
        page(c, "px=6.2&py=8.5&dir=SW&time=dusk&zoom=0.67", 1920, 1080); g(f"{P}.lock(12.0, 6.0)"); step(c, 6); snap(c, "72-dusk.png", 1920, 1080)
        page(c, "px=6.2&py=8.5&dir=SW&time=night&zoom=0.67", 1920, 1080); g(f"{P}.lock(12.0, 6.0)"); step(c, 6); snap(c, "73-night.png", 1920, 1080)
        # 76 rain at night, zoom 1 (wet road, puddles + rings, reflections, umbrellas)
        page(c, "px=8.0&py=3.0&dir=SW&time=night&weather=rain&zoom=1", 1280, 720); step(c, 10); snap(c, "76-rain-night.png")
        # 77 snow: the 3 accumulation steps + footprints / tyre tracks
        ims = []
        for sn, t in ((0.3, "积雪 1/3"), (0.6, "积雪 2/3"), (0.9, "积雪 3/3 + 脚印 / 车辙")):
            page(c, f"px=10.0&py=2.2&dir=W&season=winter&weather=snow&wi=0.6&snow={sn}&zoom=1", 960, 540)
            if sn > 0.8: g(f"{P}.autopilot([[4.0,2.2],[4.0,-0.2],[9.0,-0.2]])")
            step(c, 9); g(f"{P}.clock.snow={sn}"); step(c, 0.2); ims.append(label(snap(c, None, 960, 540), t))
        sheet(ims, 3, "77-snow-steps.png")
        # 78 seasons (same view): spring petals, summer, autumn leaves + piles, winter bare + snow
        ims = []
        for q, t in (("season=spring", "春：花瓣飘落"), ("season=summer", "夏"), ("season=autumn", "秋：落叶 + 落叶堆"), ("season=winter&weather=snow&snow=0.7", "冬：秃枝 + 积雪")):
            page(c, f"px=14.0&py=2.6&dir=SW&time=afternoon&zoom=1&{q}", 960, 540); step(c, 8); ims.append(label(snap(c, None, 960, 540), t))
        sheet(ims, 2, "78-seasons.png")
        # 79 fog
        page(c, "px=6.2&py=8.5&dir=SW&time=morning&weather=fog", 1280, 720); step(c, 6); snap(c, "79-fog.png")
        # 80 interactions: before / after kicks + auto-repair
        ims = []
        page(c, "px=7.6&py=2.4&dir=E&zoom=1.5&npcs=1", 960, 540); step(c, 1); ims.append(label(snap(c, None, 960, 540), "之前"))
        for i, k in (("lamp3", "kick"), ("hydrant", "use"), ("trashbin1", "kick"), ("pot1", "kick")): g(f"{P}.act('{i}','{k}')")
        step(c, 1.2); ims.append(label(snap(c, None, 960, 540), "踢坏路灯 / 拧开消防栓 / 踢翻垃圾桶 / 踢碎盆栽"))
        page(c, "px=-3.2&py=10.6&dir=W&zoom=1.5&time=morning&npcs=0", 960, 540); g(f"{P}.lock(-5.0, 11.4)"); g(f"{P}.act('win_S1F_0','kick')"); step(c, 1.5); ims.append(label(snap(c, None, 960, 540), "一楼窗户被砸"))
        g(f"{P}.clock.scale=60"); g(f"{P}.sim(2.5,1/30)"); g(f"{P}.clock.scale=1"); step(c, 0.2); ims.append(label(snap(c, None, 960, 540), "2 小时后：物业钉上木板"))
        sheet(ims, 2, "80-interactions.png")
        # 75 walk (dusk, light rain, umbrella): mp4
        tmp = tempfile.mkdtemp()
        page(c, "px=5.0&py=9.5&dir=S&time=dusk&weather=rain&wi=0.5&zoom=1", 960, 540); g(f"{P}.umbrella()")
        g(f"{P}.autopilot([[6.19,7.0],[6.19,3.2],[11.0,2.4],[12.0,0.8],[12.0,-7.6],[12.6,-8.2],[12.6,0.8],[11.0,2.6],[6.19,3.2],[6.19,7.0],[5.0,9.5]])")
        n = 0
        for i in range(900):
            step(c, 1 / 30, 1 / 60)
            snap(c, None, 960, 540).save(os.path.join(tmp, f"f{n:04d}.png")); n += 1
            if g(f"{P}.autoDone()"): break
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "30", "-i", os.path.join(tmp, "f%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "22", os.path.join(OUT, "75-walk.mp4")], check=True)
        shutil.rmtree(tmp); print("saved 75-walk.mp4", n, "frames", flush=True)
        # 74 phone portrait (touch UI, default zoom 1) + 81 phone in snow at night
        for q, name in (("time=afternoon", "74-mobile.png"), ("time=night&season=winter&weather=snow&snow=0.8", "81-weather-mobile.png")):
            c.call("Emulation.setDeviceMetricsOverride", width=390, height=844, deviceScaleFactor=1, mobile=True)
            c.call("Emulation.setTouchEmulationEnabled", enabled=True, maxTouchPoints=5)
            c.call("Page.navigate", url=__import__("cdp").BASE + f"?manual=1&touch=1&px=6.2&py=8.5&dir=SW&{q}")
            for _ in range(150):
                __import__("time").sleep(0.1)
                if g("!!window.__protoReady"): break
            step(c, 6); __import__("time").sleep(0.2)
            data = __import__("base64").b64decode(c.call("Page.captureScreenshot", format="png")["data"]); open(os.path.join(OUT, name), "wb").write(data); print("saved", name, flush=True)
    finally:
        p.kill(); shutil.rmtree(prof, ignore_errors=True)

if __name__ == "__main__":
    main()
