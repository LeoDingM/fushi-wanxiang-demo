"""Amenities-Market screenshots: market1–4 + smkt1–2. Phone 390×844.
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
        for _ in range(200):
            time.sleep(0.1)
            if c.eval("!!(window.__protoReady && window.SP && SP.amenities)"): break
        # force install
        c.eval("""(function(){ if (SP.amenities && !SP.amenities.installed) SP.amenities.install();
          if (SP.amenities && !SP.amenities.installed) { SP.amenities.installed=false; SP.amenities.install(); }
          return !!(SP.amenities && SP.amenities.installed && SP.scenes.market_jhl); })()""")
        time.sleep(1.5)
        def ev(js):
            r = c.call("Runtime.evaluate", expression=js, awaitPromise=True, returnByValue=True)
            if r.get("exceptionDetails"): print("EXC", json.dumps(r["exceptionDetails"])[:400])
            return r.get("result", {}).get("value")
        def shot(name):
            d = c.call("Page.captureScreenshot", format="png")["data"]
            open(os.path.join(OUT, name), "wb").write(base64.b64decode(d)); print("shot", name)
        print("===", tag, "ready", ev("JSON.stringify({inst:!!SP.amenities.installed, mkt:!!SP.scenes.market_jhl, smkt:!!SP.scenes.smkt_jhl, goto:typeof SP.amenities.devGoto, scene:SP.world&&SP.world.sceneId})"))
        steps(ev, shot)
    finally:
        p.kill()

GO_MKT = "SP.game.go({to:'market_jhl', spawn: SP.scenes.market_jhl.spawn, door:null})"
GO_SMKT = "SP.game.go({to:'smkt_jhl', spawn: SP.scenes.smkt_jhl.spawn, door:null})"

def market_shots(ev, shot):
    print("enter", ev(GO_MKT)); time.sleep(1.4)
    print("in", ev("SP.world.sceneId"), "n", ev("SP.world.objects.length"))
    ev("window.__proto.place(4.0, 2.8, 'N'); window.__proto.zoom(1.5); window.__proto.sim(0.4)"); time.sleep(1.0)
    shot("market1-hall.png")
    # buy veg
    print("buy veg", ev("""(function(){
      window.__proto.place(2.2, 3.5, 'N'); window.__proto.sim(0.2);
      const o=SP.world.byId.stall_veg; if(!o) return 'no stall';
      SP.game.use(o); const m=SP.game.menu; if(m){ const i=m.opts.findIndex(x=>x.ok); SP.game.pick(i>=0?i:0); }
      return JSON.stringify(SP.game.ps.amenity && SP.game.ps.amenity.bag);
    })()""")); time.sleep(1.2)
    shot("market2-buy-veg.png")
    print("buy egg", ev("""(function(){
      window.__proto.place(5.0, 3.5, 'N'); window.__proto.sim(0.2);
      const o=SP.world.byId.stall_egg; if(!o) return 'no stall';
      SP.game.use(o); const m=SP.game.menu; if(m){ const i=m.opts.findIndex(x=>x.ok); SP.game.pick(i>=0?i:0); }
      return JSON.stringify({bag:SP.game.ps.amenity&&SP.game.ps.amenity.bag, egg:SP.game.ps.items.egg, veg:SP.game.ps.items.veg});
    })()""")); time.sleep(1.0)
    shot("market3-buy-egg.png")
    print("street", ev("SP.game.go({to:'street', spawn:[-12.5, 0.95, 'N'], door:null})")); time.sleep(1.5)
    ev("window.__proto.place(-12.5, 0.95, 'N'); window.__proto.zoom(1.35); window.__proto.sim(0.5)"); time.sleep(1.0)
    print("stubs", ev("JSON.stringify(['mkt_jhl_gate','mkt_jhl_a','smkt_jhl_gate'].map(id=>({id, ok:!!SP.world.byId[id]})))"))
    shot("market4-exterior.png")

def smkt_shots(ev, shot):
    print("enter", ev(GO_SMKT)); time.sleep(1.4)
    print("in", ev("SP.world.sceneId"), "n", ev("SP.world.objects.length"))
    ev("window.__proto.place(3.5, 2.6, 'N'); window.__proto.zoom(1.55); window.__proto.sim(0.4)"); time.sleep(1.0)
    shot("smkt1-aisles.png")
    print("buy", ev("""(function(){
      window.__proto.place(2.4, 2.6, 'N'); window.__proto.sim(0.2);
      const o=SP.world.byId.aisle_a; if(!o) return 'no aisle';
      SP.game.use(o); const m=SP.game.menu; if(m){ const i=m.opts.findIndex(x=>x.ok); SP.game.pick(i>=0?i:0); }
      return JSON.stringify({bag:SP.game.ps.amenity&&SP.game.ps.amenity.bag, noodles:SP.game.ps.items.noodles});
    })()""")); time.sleep(1.2)
    shot("smkt2-buy.png")

run("?time=09:30&touch=1", market_shots, "market")
run("?time=18:00&touch=1", smkt_shots, "smkt")
print("MARKET capture done")
