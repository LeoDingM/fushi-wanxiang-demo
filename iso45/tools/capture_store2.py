"""24便利店 polish screenshots (phone portrait 390x844): S4 uniform (Li Mo + 赵姐 in the green store apron on shift, + back room),
   S5 storefront (glass front + door + lit sign band, fading while it hides the player sitting on a bar stool; night).
   python3 tools/capture_store2.py [outdir]"""
import sys, os, time, json, base64
sys.path.insert(0, os.path.dirname(__file__)); import cdp
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "screenshots")
URL = "file://" + os.path.join(ROOT, "store_preview.html")
def run(T, steps):
    p, prof, ws = cdp.start(); c = cdp.CDP(ws)
    try:
        c.call("Runtime.enable"); c.call("Page.enable")
        c.call("Emulation.setDeviceMetricsOverride", width=390, height=844, deviceScaleFactor=2, mobile=True, screenOrientation={"type": "portraitPrimary", "angle": 0})
        c.call("Emulation.setTouchEmulationEnabled", enabled=True, maxTouchPoints=5)
        c.call("Page.navigate", url=URL + "?time=" + T + "&touch=1")
        for _ in range(150):
            time.sleep(0.1)
            if c.eval("!!(window.__protoReady && SP.store && SP.store.inStore && SP.store.inStore())"): break
        time.sleep(2.5)
        def ev(js):
            r = c.call("Runtime.evaluate", expression=js, awaitPromise=True, returnByValue=True)
            if r.get("exceptionDetails"): print("EXC", json.dumps(r["exceptionDetails"])[:500])
            return r.get("result", {}).get("value")
        def shot(name):
            d = c.call("Page.captureScreenshot", format="png")["data"]; open(os.path.join(OUT, name), "wb").write(base64.b64decode(d)); print("shot", name)
        steps(ev, shot)
        errs = [m for m in c.logs if m.get("method") == "Runtime.exceptionThrown" or (m.get("params", {}).get("type") == "error")]
        print("errors", len(errs)); [print(json.dumps(e)[:600]) for e in errs[:5]]
    finally:
        p.kill()
def s4(ev, shot):
    print("shift", ev("SP.store.devShift()")); time.sleep(0.4)
    ev("__proto.place(6.95, 3.0, 'SW'); __proto.zoom(2.2); __proto.sim(0.5)"); time.sleep(1.4)
    print("sets", ev("JSON.stringify({p: SP.player.set, staff: SP.store.npcs.filter(a=>a.staff).map(a=>a.set)})"))
    shot("S4-uniform.png")
    # back room: staff door -> 员工室, open the board
    ev("__proto.place(7.45, 5.4, 'E'); __proto.sim(0.2); SP.game.use(SP.world.byId.staff_door)"); time.sleep(1.6)
    print("back", ev("JSON.stringify({scene: SP.world.sceneId, set: SP.player.set})"))
    ev("__proto.place(2.5, 1.5, 'NE'); __proto.zoom(2.2); __proto.sim(0.3)"); time.sleep(1.0); shot("S4b-staffroom.png")
def s5(ev, shot):
    out = ev("""(function(){const S=SP.store.F, ps=SP.game.ps; ps.money=200; S.pick(ps,'st_onigiri'); __proto.place(5.78, 2.3, 'E'); __proto.sim(0.3);
       SP.game.use(SP.world.byId.counter); SP.game.pick(SP.game.menu.opts.findIndex(x=>/结账/.test(x.label))); SP.game.pick(0); return JSON.stringify(ps.store.bag);})()""")
    print("bought", out); time.sleep(3.2)
    ev("__proto.place(4.5, 1.05, 'S'); __proto.zoom(1.6); __proto.sim(0.6)"); time.sleep(1.2)
    print("door", ev("SP.world.byId.front_door.state")); shot("S5b-storefront-door.png")
    # deeper in the store: the glass front + door + lit sign band stand opaque in the foreground
    ev("__proto.place(3.6, 3.9, 'S'); __proto.zoom(1.3); __proto.sim(0.8)"); time.sleep(1.2)
    print("front", ev("JSON.stringify(SP.world.byId.front_1.alpha)")); shot("S5-storefront.png")
    # sit on a bar stool: the front fades while it hides him; pose lifted onto the 0.78 m seat
    ev("__proto.place(2.4, 1.15, 'S'); __proto.sim(0.2); SP.game.use(SP.world.byId.bar); const m=SP.game.menu; if (m) SP.game.pick(m.opts.findIndex(x=>x.ok))"); time.sleep(0.9)
    print("sit", ev("JSON.stringify({act: SP.game.activity && SP.game.activity.label, z: SP.player.z, clip: SP.player.clip, fade: SP.world.byId.front_1.alpha})"))
    ev("__proto.zoom(2.0)"); time.sleep(0.5); shot("S5c-bar-stool.png")
run(os.environ.get("T4", "07:30"), s4)
run(os.environ.get("T5", "20:40"), s5)
