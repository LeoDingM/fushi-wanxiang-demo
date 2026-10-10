"""24便利店 preview screenshots (phone portrait 390x844, touch): S1 interior, S2 checkout (pay card), S3 shift (HUD + tasks).
   python3 tools/capture_store.py [outdir]   (uses tools/cdp.py; page = store_preview.html)"""
import sys, os, time, json, base64
sys.path.insert(0, os.path.dirname(__file__)); import cdp
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "screenshots")
URL = "file://" + os.path.join(ROOT, "store_preview.html")
def shot(c, name):
    d = c.call("Page.captureScreenshot", format="png")["data"]; open(os.path.join(OUT, name), "wb").write(base64.b64decode(d)); print("shot", name)
def main():
    p, prof, ws = cdp.start(); c = cdp.CDP(ws)
    try:
        c.call("Runtime.enable"); c.call("Page.enable")
        c.call("Emulation.setDeviceMetricsOverride", width=390, height=844, deviceScaleFactor=2, mobile=True, screenOrientation={"type": "portraitPrimary", "angle": 0})
        c.call("Emulation.setTouchEmulationEnabled", enabled=True, maxTouchPoints=5)
        c.call("Page.navigate", url=URL + "?time=" + os.environ.get("T", "06:50") + "&touch=1")
        for _ in range(150):
            time.sleep(0.1)
            if c.eval("!!(window.__protoReady && SP.store && SP.store.inStore && SP.store.inStore())"): break
        time.sleep(2.5)
        def ev(js):
            r = c.call("Runtime.evaluate", expression=js, awaitPromise=True, returnByValue=True)
            if r.get("exceptionDetails"): print("EXC", json.dumps(r["exceptionDetails"])[:500])
            return r.get("result", {}).get("value")
        print("state", ev("JSON.stringify({scene: SP.world.sceneId, n: SP.world.objects.length, npcs: SP.store.npcs.map(a=>a.id), atlas: SP.img.int_atlas.height, problems: SP.scenes.store_24.layout_check.problems.length})"))
        ev("__proto.place(3.9, 2.6, 'N'); __proto.zoom(1.2)"); time.sleep(1.5); shot(c, "S1-store-interior.png")
        # buy: fridge -> bento + cola, shelf -> onigiri, then pay at the counter with WeChat
        out = ev("""(function(){const S=SP.store.F, ps=SP.game.ps; S.pick(ps,'bento'); S.pick(ps,'st_cola'); S.pick(ps,'st_onigiri');
           __proto.place(5.78, 2.3, 'E'); __proto.sim(0.3); const o=SP.world.byId.counter; SP.game.use(o); const m=SP.game.menu; const i=m.opts.findIndex(x=>/结账/.test(x.label)); SP.game.pick(i);
           const m2=SP.game.menu; SP.game.pick(0); return JSON.stringify({money: ps.money, items: ps.items.bento, bag: ps.store.bag, act: SP.game.activity && SP.game.activity.label});})()""")
        print("checkout", out); time.sleep(0.9); shot(c, "S2-store-checkout.png")
        time.sleep(3.5)
        # shift: dev hire + book + clock in; let tasks spawn
        print("shift", ev("SP.store.devShift()"))
        ev("__proto.zoom(1.5)")
        # the first checkout customer walks up; do a restock on the way, then open the counter menu from the staff lane
        for _ in range(40):
            ev("__proto.skip(3)")
            if ev("(function(){const t=SP.store.F.openTasks(SP.game.ps).find(t=>t.kind==='checkout');return !!(t&&SP.store.npcs.some(a=>a.brain&&a.brain.task===t.id&&a.brain.i>=a.brain.route.length));})()"): break
        print("restock", ev("(function(){const t=SP.store.F.openTasks(SP.game.ps).find(t=>t.kind==='restock'); if(!t) return 'none'; const r=SP.store.F.doTask(SP.game.ps,'restock',t.target,SP.clock.abs()); return JSON.stringify(r.quality);})()"))
        ev("__proto.place(7.12, 2.3, 'W'); __proto.sim(0.2); SP.game.use(SP.world.byId.counter)")
        time.sleep(0.6); shot(c, "S3b-shift-counter-menu.png")
        print("scan", ev("SP.game.pick(0); JSON.stringify(SP.game.activity && SP.game.activity.label)")); time.sleep(0.5)
        print("tasks", ev("JSON.stringify(SP.store.F.shiftText(SP.game.ps, SP.clock.abs()))"))
        shot(c, "S3-shift.png")
        errs = [m for m in c.logs if m.get("method") == "Runtime.exceptionThrown" or (m.get("params", {}).get("type") == "error")]
        print("errors", len(errs)); [print(json.dumps(e)[:600]) for e in errs[:5]]
    finally:
        p.kill()
main()
