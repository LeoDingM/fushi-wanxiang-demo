"""Boot smoke test: the real rAF loop (no ?manual) must render 60+ frames with no exception, on desktop and phone
viewports, street + after entering the store / an interior. Catches data bugs that kill the render loop on frame 1.
python3 tools/smoke_test.py"""
import sys, time, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import cdp

def boot(c, query, w, h, mobile):
    c.call("Emulation.setDeviceMetricsOverride", width=w, height=h, deviceScaleFactor=1, mobile=mobile)
    c.logs.clear() if hasattr(c.logs, "clear") else None
    c.call("Page.navigate", url=cdp.BASE + query)
    for _ in range(100):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady"): break
    f0 = c.eval("SP.frameNo || 0"); time.sleep(2.5); f1 = c.eval("SP.frameNo || 0")
    return f0, f1

def run(c, log):
    def ok(name, cond, info=""):
        log.append(("PASS " if cond else "FAIL ") + name + (" — " + str(info) if info != "" else "")); return cond
    for name, q, w, h, m in (("desktop", "", 1280, 720, False), ("phone", "?touch=1", 390, 844, True), ("night", "?time=night", 1280, 720, False)):
        n0 = len([l for l in c.logs if l.get("method") == "Runtime.exceptionThrown"])
        f0, f1 = boot(c, q, w, h, m)
        errs = [l for l in c.logs if l.get("method") == "Runtime.exceptionThrown"][n0:]
        ok(f"smoke {name}: rAF loop renders 60+ frames, no exception", f1 - f0 >= 60 and not errs, [f1 - f0, json.dumps(errs[0])[:300] if errs else ""])
    n0 = len([l for l in c.logs if l.get("method") == "Runtime.exceptionThrown"])
    a = c.eval("SP.place.enter('store_24', SP.scenes.store_24 && SP.scenes.store_24.spawn); SP.frameNo"); time.sleep(1.5); b = c.eval("SP.frameNo")
    c.eval("SP.place.enter('room_2f02', [5.25, 0.8, 'W'])"); time.sleep(1.0); d = c.eval("SP.frameNo")
    c.eval("SP.place.enter('street', [40, 2, 'S'])"); time.sleep(1.5); e = c.eval("SP.frameNo")
    errs = [l for l in c.logs if l.get("method") == "Runtime.exceptionThrown"][n0:]
    ok("smoke: store → room → street east (chunk streams) keeps rendering", b - a > 30 and d - b > 20 and e - d > 30 and not errs, [b - a, d - b, e - d, json.dumps(errs[0])[:300] if errs else ""])

if __name__ == "__main__":
    p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable"); log = []
    try: run(c, log)
    finally: print("\n".join(log)); p.kill()
