"""云汇CBD preview: smoke test + screenshots.  python3 tools/cbd_capture.py [smoke|shots|all]
   smoke: desktop 1280x720, loads cbd_preview.html, runs >= 60 frames at several zooms (default / far / skyline / night),
          walks 李默, checks JS errors + module state.  shots: C1..C6 into screenshots/ (phone portrait 390x844, touch;
          C5 desktop 1280x720 far-zoom skyline)."""
import sys, os, time, json, base64
sys.path.insert(0, os.path.dirname(__file__)); import cdp
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "screenshots"); os.makedirs(OUT, exist_ok=True)
URL = "file://" + os.path.join(ROOT, "cbd_preview.html")

class Page:
    def __init__(self):
        self.p, self.prof, ws = cdp.start(); self.c = cdp.CDP(ws); self.c.call("Runtime.enable"); self.c.call("Page.enable")
    def ev(self, js):
        r = self.c.call("Runtime.evaluate", expression=js, awaitPromise=True, returnByValue=True)
        if r.get("exceptionDetails"): print("EXC", json.dumps(r["exceptionDetails"])[:600])
        return r.get("result", {}).get("value")
    def open(self, q, phone=False):
        if phone:
            self.c.call("Emulation.setDeviceMetricsOverride", width=390, height=844, deviceScaleFactor=2, mobile=True, screenOrientation={"type": "portraitPrimary", "angle": 0})
            self.c.call("Emulation.setTouchEmulationEnabled", enabled=True, maxTouchPoints=5)
        else:
            self.c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)
            self.c.call("Emulation.setTouchEmulationEnabled", enabled=False)
        self.c.call("Page.navigate", url=URL + "?" + q)
        for _ in range(200):
            time.sleep(0.1)
            if self.ev("!!window.__ready") or self.ev("(window.__errs||[]).length"): break
        return self.ev("JSON.stringify(window.__errs||[])")
    def frames(self, n, timeout=30):
        f0 = self.ev("window.__frames||0"); t0 = time.time()
        while time.time() - t0 < timeout:
            time.sleep(0.2)
            if (self.ev("window.__frames||0") or 0) - f0 >= n: break
        return (self.ev("window.__frames||0") or 0) - f0
    def shot(self, name):
        d = self.c.call("Page.captureScreenshot", format="png")["data"]; open(os.path.join(OUT, name), "wb").write(base64.b64decode(d)); print("shot", name)
    def close(self):
        try: self.p.kill()
        except Exception: pass

STATE = "JSON.stringify({errs: window.__errs, ready: SP.cbd.ready, mods: Object.keys(SP.cbd._mods), z: +SP.cbd.cam.zoom.toFixed(3), st: SP.cbd.stats, p: [+SP.cbd.player.x.toFixed(1), +SP.cbd.player.y.toFixed(1)], near: SP.cbd.near && SP.cbd.near.label})"

def smoke(P):
    print("load errs", P.open("time=day&test=1"))
    print("frames default", P.frames(60)); print(P.ev(STATE))
    P.ev("SP.cbd.autoWalk=[1,0]"); P.frames(60); P.ev("SP.cbd.autoWalk=null"); print("walked", P.ev(STATE))
    for z in (0.09, 0.03, 0.019):
        P.ev(f"SP.cbd.zoomTo({z},null,null,true)"); n = P.frames(60); print("zoom", z, "frames", n, P.ev(STATE))
    P.ev("SP.clock.setTimeName('night',true)"); P.frames(60); print("night far", P.ev(STATE))
    P.ev("SP.cbd.zoomTo(0.5,null,null,true)"); P.frames(60); print("night near", P.ev(STATE))
    P.ev("SP.cbd.enter('B')"); P.frames(20); print("exit B", P.ev(STATE))
    # timing without test mode budgets
    print("perf", P.ev("(function(){const t=[];for(let i=0;i<30;i++){const a=performance.now();SP.cbd.frame(1/60);t.push(performance.now()-a);}t.sort((a,b)=>a-b);return JSON.stringify({median:+t[15].toFixed(2),p90:+t[27].toFixed(2)});})()"))
    errs = P.ev("JSON.stringify(window.__errs)"); print("ERRORS", errs); return errs == "[]"

def pan(p, t):
    sx = lambda x, y: (x - y) * 32; sy = lambda x, y, z=0: -((x + y) * 16 + z * 39.19)
    return f"{sx(t[0], t[1]) - sx(*p):.0f},{sy(*t) - sy(*p):.0f}"

def shots(P):
    # C1 park (morning joggers / dog walkers), C2 pedestrian street (evening, buskers), C4 tower bases (lunch crowd)
    jobs = [("C1-park.png", "time=08:10&x=90&y=95&dir=W&zoom=0.22&pan=0,-100"),
            ("C2-pedestrian-street.png", "time=18:40&x=247&y=120&dir=W&zoom=0.6"),
            ("C4-towers-base.png", "time=12:10&x=222&y=294&dir=S&zoom=0.4&pan=0,-240")]
    for name, q in jobs:
        print(name, P.open(q + "&touch=1&shot=1&test=1", phone=True)); P.frames(90); time.sleep(0.6); P.shot(name)
    # C3: the mall grand entrance and the stadium are ~430 m apart on screen -> two phone frames stacked (upper / lower half)
    from PIL import Image
    halves = []
    for tag, q in (("mall", "time=15:00&x=186&y=48&dir=E&zoom=0.18&pan=" + pan((186, 48), (260, 48, 18))), ("stadium", "time=15:00&x=74&y=226&dir=N&zoom=0.11&pan=" + pan((74, 226), (74, 280, 14)))):
        print("C3", tag, P.open(q + "&touch=1&shot=1&test=1", phone=True)); P.frames(90); time.sleep(0.6); P.shot("_c3_" + tag + ".png")
        im = Image.open(os.path.join(OUT, "_c3_" + tag + ".png")); w, h = im.size; halves.append(im.crop((0, h // 4, w, h // 4 + h // 2)))
        os.remove(os.path.join(OUT, "_c3_" + tag + ".png"))
    w, h = halves[0].size; out = Image.new("RGB", (w, h * 2)); out.paste(halves[0], (0, 0)); out.paste(halves[1], (0, h)); out.save(os.path.join(OUT, "C3-mall-stadium.png")); print("shot C3-mall-stadium.png (2 frames)")
    print("C5", P.open("time=day&x=186&y=186&zoom=0.016&shot=1&test=1")); P.frames(90); time.sleep(0.5); P.shot("C5-skyline-far.png")
    print("C6", P.open("time=21:30&x=186&y=186&zoom=0.016&touch=1&shot=1&test=1", phone=True)); P.frames(90); time.sleep(0.5); P.shot("C6-night-skyline.png")
    print("C7", P.open("time=16:40&x=310&y=232&dir=S&zoom=0.2&pan=-30,-120&touch=1&shot=1&test=1", phone=True)); P.frames(100); time.sleep(0.5); P.shot("C7-wealthy-compound.png")
    print(P.ev(STATE))

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"; P = Page(); ok = True
    try:
        if mode in ("smoke", "all"): ok = smoke(P)
        if mode in ("shots", "all"): shots(P)
    finally: P.close()
    sys.exit(0 if ok else 1)
