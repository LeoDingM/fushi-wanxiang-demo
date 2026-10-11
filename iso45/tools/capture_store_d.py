"""Store-D screenshots (phone 390x844): store-d1 empty shelf, store-d2 dirty floor, store-d3 night lighting, store-d4 wage slip.
   python3 tools/capture_store_d.py [outdir]"""
import sys, os, time, json, base64
sys.path.insert(0, os.path.dirname(__file__)); import cdp
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "screenshots")
URL = "file://" + os.path.join(ROOT, "store_preview.html")
os.makedirs(OUT, exist_ok=True)

def run(T, steps, name):
    p, prof, ws = cdp.start(); c = cdp.CDP(ws)
    try:
        c.call("Runtime.enable"); c.call("Page.enable")
        c.call("Emulation.setDeviceMetricsOverride", width=390, height=844, deviceScaleFactor=2, mobile=True,
               screenOrientation={"type": "portraitPrimary", "angle": 0})
        c.call("Emulation.setTouchEmulationEnabled", enabled=True, maxTouchPoints=5)
        c.call("Page.navigate", url=URL + "?time=" + T + "&touch=1")
        for _ in range(150):
            time.sleep(0.1)
            if c.eval("!!(window.__protoReady && SP.store && SP.store.inStore && SP.store.inStore())"): break
        time.sleep(2.0)
        def ev(js):
            r = c.call("Runtime.evaluate", expression=js, awaitPromise=True, returnByValue=True)
            if r.get("exceptionDetails"): print("EXC", json.dumps(r["exceptionDetails"])[:500])
            return r.get("result", {}).get("value")
        def shot(fname):
            d = c.call("Page.captureScreenshot", format="png")["data"]
            open(os.path.join(OUT, fname), "wb").write(base64.b64decode(d)); print("shot", fname)
        print("===", name, "T="+T, "ready", ev("SP.world.sceneId"))
        steps(ev, shot)
        errs = [m for m in c.logs if m.get("method") == "Runtime.exceptionThrown"]
        print("errors", len(errs))
    finally:
        p.kill()

def d1(ev, shot):
    """day + on shift + empty shelf (low)"""
    print("shift", ev("SP.store.devShift()")); time.sleep(0.3)
    print("props", ev("SP.store.devInjectTasks(['restock','mop'])"))
    print("states", ev("JSON.stringify({shelf: SP.world.byId.shelf_a && SP.world.byId.shelf_a.state, bins: SP.world.byId.bins && SP.world.byId.bins.state, floor: SP.store.propState && SP.store.propState()})"))
    ev("__proto.place(2.6, 3.6, 'N'); __proto.zoom(2.0); __proto.sim(0.4)"); time.sleep(1.2)
    shot("store-d1-empty-shelf.png")

def d2(ev, shot):
    """messy bins + litter floor"""
    print("shift", ev("SP.store.devShift()")); time.sleep(0.3)
    print("props", ev("SP.store.devInjectTasks(['mop'])"))
    print("decals", ev("JSON.stringify({bins: SP.world.byId.bins.state, litter: SP.world.decals.filter(d=>d.storeDirty).length, floor: SP.store.propState()})"))
    ev("__proto.place(1.4, 5.0, 'N'); __proto.zoom(2.1); __proto.sim(0.4)"); time.sleep(1.2)
    shot("store-d2-dirty-floor.png")

def d3(ev, shot):
    """night lighting contrast"""
    print("shift", ev("SP.store.devShift()")); time.sleep(0.2)
    ev("__proto.place(4.2, 2.8, 'S'); __proto.zoom(1.35); __proto.sim(0.5)"); time.sleep(1.0)
    print("light", ev("JSON.stringify(SP.store.lightSnap())"))
    shot("store-d3-night-light.png")

def d4(ev, shot):
    """clock-out wage slip + pay card"""
    print("shift", ev("SP.store.devShift()")); time.sleep(0.3)
    # advance a bit so hours > 0, then clock out
    ev("__proto.skip(90)"); time.sleep(0.4)
    print("out", ev("SP.store.clockOut()"))
    print("slip", ev("JSON.stringify({bag: SP.game.ps.store.bag, slips: (SP.game.ps.store.slips||[]).map(s=>({pay:s.pay,label:s.label})), bank:(SP.game.ps.store.bank||[]).slice(-1)})"))
    ev("__proto.place(5.6, 2.4, 'E'); __proto.zoom(1.6); __proto.sim(0.3)"); time.sleep(1.4)
    shot("store-d4-wage-slip.png")

run(os.environ.get("TD1", "10:30"), d1, "d1")
run(os.environ.get("TD2", "11:00"), d2, "d2")
run(os.environ.get("TD3", "22:30"), d3, "d3")
run(os.environ.get("TD4", "10:00"), d4, "d4")
print("STORE-D capture done")
