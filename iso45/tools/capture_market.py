"""Amenities-Market screenshots: market1–4 (菜市场) + smkt1–2 (小超市). Phone 390×844.
   python3 tools/capture_market.py [outdir]"""
import sys, os, time, json, base64
sys.path.insert(0, os.path.dirname(__file__)); import cdp
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "screenshots")
URL = "file://" + os.path.join(ROOT, "market_preview.html")
os.makedirs(OUT, exist_ok=True)

def run(query, steps, tag):
    p, prof, ws = cdp.start(); c = cdp.CDP(ws)
    try:
        c.call("Runtime.enable"); c.call("Page.enable")
        c.call("Emulation.setDeviceMetricsOverride", width=390, height=844, deviceScaleFactor=2, mobile=True,
               screenOrientation={"type": "portraitPrimary", "angle": 0})
        c.call("Emulation.setTouchEmulationEnabled", enabled=True, maxTouchPoints=5)
        c.call("Page.navigate", url=URL + query)
        for _ in range(180):
            time.sleep(0.1)
            if c.eval("!!(window.__protoReady && SP.amenities && SP.amenities.installed)"): break
        time.sleep(2.0)
        def ev(js):
            r = c.call("Runtime.evaluate", expression=js, awaitPromise=True, returnByValue=True)
            if r.get("exceptionDetails"): print("EXC", json.dumps(r["exceptionDetails"])[:500])
            return r.get("result", {}).get("value")
        def shot(name):
            d = c.call("Page.captureScreenshot", format="png")["data"]
            open(os.path.join(OUT, name), "wb").write(base64.b64decode(d)); print("shot", name)
        print("===", tag, "scene", ev("SP.world.sceneId"), "amenity", ev("!!SP.amenities.installed"))
        steps(ev, shot)
    finally:
        p.kill()

def market_shots(ev, shot):
    # ensure inside market
    ev("SP.amenities.devGoto('market')"); time.sleep(1.2)
    print("in", ev("SP.world.sceneId"), "objs", ev("SP.world.objects.length"))
    ev("__proto.place(4.0, 2.8, 'N'); __proto.zoom(1.5); __proto.sim(0.4)"); time.sleep(1.0)
    shot("market1-hall.png")
    # buy veg at stall
    ev("__proto.place(2.2, 3.5, 'N'); __proto.sim(0.2); SP.game.use(SP.world.byId.stall_veg); const m=SP.game.menu; if(m) SP.game.pick(0)"); time.sleep(1.2)
    print("bag", ev("JSON.stringify(SP.game.ps.amenity && SP.game.ps.amenity.bag)"))
    shot("market2-buy-veg.png")
    # egg stall
    ev("__proto.place(5.0, 3.5, 'N'); __proto.sim(0.2); SP.game.use(SP.world.byId.stall_egg); const m=SP.game.menu; if(m) SP.game.pick(0)"); time.sleep(1.0)
    shot("market3-buy-egg.png")
    # exterior street stubs
    ev("SP.game.go({to:'street', spawn:[-12.5, 0.95, 'N'], door:null})"); time.sleep(1.4)
    ev("__proto.place(-12.5, 0.95, 'N'); __proto.zoom(1.4); __proto.sim(0.5)"); time.sleep(1.0)
    print("stubs", ev("JSON.stringify(['mkt_jhl_gate','mkt_jhl_a','smkt_jhl_gate'].map(id=>({id, ok:!!SP.world.byId[id], x:SP.world.byId[id]&&SP.world.byId[id].x})))"))
    shot("market4-exterior.png")

def smkt_shots(ev, shot):
    ev("SP.amenities.devGoto('smkt')"); time.sleep(1.2)
    print("in", ev("SP.world.sceneId"))
    ev("__proto.place(3.5, 2.6, 'N'); __proto.zoom(1.55); __proto.sim(0.4)"); time.sleep(1.0)
    shot("smkt1-aisles.png")
    ev("__proto.place(2.4, 2.6, 'N'); __proto.sim(0.2); SP.game.use(SP.world.byId.aisle_a); const m=SP.game.menu; if(m) SP.game.pick(0)"); time.sleep(1.2)
    print("bag", ev("JSON.stringify({amenity: SP.game.ps.amenity && SP.game.ps.amenity.bag, noodles: SP.game.ps.items.noodles, bread: SP.game.ps.items.bread})"))
    shot("smkt2-buy.png")

run("?time=09:30&touch=1&market=1", market_shots, "market")
run("?time=18:00&touch=1&smkt=1", smkt_shots, "smkt")
print("MARKET capture done")
