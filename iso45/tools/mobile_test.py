"""Phone test: 390x844 portrait + 844x390 landscape with emulated touch (CDP). Drags the floating joystick, checks
   李默 walks in the SCREEN direction pushed, taps 互动 / 时间 / 撞车, checks no scroll / no JS errors, and captures
   screenshots/69-mobile-portrait.png + 69-mobile-landscape.png.   python3 tools/mobile_test.py"""
import sys, os, time, base64, json, shutil
sys.path.insert(0, os.path.dirname(__file__)); import cdp
OUT = os.path.join(os.path.dirname(__file__), "..", "screenshots")
def run(c, w, h, name):
    c.call("Emulation.setDeviceMetricsOverride", width=w, height=h, deviceScaleFactor=3, mobile=True, screenOrientation={"type": "portraitPrimary" if h > w else "landscapePrimary", "angle": 0 if h > w else 90})
    c.call("Emulation.setTouchEmulationEnabled", enabled=True, maxTouchPoints=5)
    c.call("Page.navigate", url=cdp.BASE + "?px=6.2&py=6.0&dir=SW")
    for _ in range(100):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady"): break
    time.sleep(0.6)
    R = {}
    R["layout"] = c.eval("JSON.stringify({cls: document.body.className, cw: document.getElementById('game').width, ch: document.getElementById('game').height, touchUI: !!document.getElementById('joy-zone'), sx: scrollX, sy: scrollY, iw: innerWidth, ih: innerHeight})")
    def touch(t, pts):
        c.call("Input.dispatchTouchEvent", type=t, touchPoints=[{"x": x, "y": y, "id": 1} for x, y in pts])
    jx, jy = (90, h - 100)
    results = {}
    for name_d, (dx, dy) in {"up": (0, -50), "right": (50, 0), "down-left": (-36, 36)}.items():
        p0 = json.loads(c.eval("JSON.stringify(__proto.player.screen())"))
        touch("touchStart", [(jx, jy)]); time.sleep(0.05)
        for k in range(1, 6): touch("touchMove", [(jx + dx * k / 5, jy + dy * k / 5)]); time.sleep(0.03)
        time.sleep(0.9); touch("touchEnd", []); time.sleep(0.25)
        p1 = json.loads(c.eval("JSON.stringify(__proto.player.screen())"))
        mv = [p1[0] - p0[0], p1[1] - p0[1]]; L = (mv[0] ** 2 + mv[1] ** 2) ** 0.5 or 1
        dot = (mv[0] * dx + mv[1] * dy) / L / ((dx * dx + dy * dy) ** 0.5)
        results[name_d] = {"moved_px": round(L, 1), "cos_to_push": round(dot, 3)}
    R["joystick"] = results
    # walk to the gate and tap 互动 (closes the gate), tap again (opens), tap 时间 and 撞车
    c.eval("__proto.place(6.2, 5.1, 'S'); true"); time.sleep(0.3)
    box = json.loads(c.eval("JSON.stringify(document.getElementById('btn-act').getBoundingClientRect())"))
    bx, by = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
    g0 = c.eval("__proto.world.byId.gate_l.state")
    touch("touchStart", [(bx, by)]); touch("touchEnd", []); time.sleep(0.3)
    g1 = c.eval("__proto.world.byId.gate_l.state")
    touch("touchStart", [(bx, by)]); touch("touchEnd", []); time.sleep(0.3)
    R["act"] = [g0, g1, c.eval("__proto.world.byId.gate_l.state")]
    tb = json.loads(c.eval("JSON.stringify(document.getElementById('btn-time').getBoundingClientRect())"))
    touch("touchStart", [(tb["x"] + 20, tb["y"] + 20)]); touch("touchEnd", []); time.sleep(1.5)
    R["time"] = c.eval("__proto.state.time")
    eb = json.loads(c.eval("JSON.stringify(document.querySelector('[data-tev=crash]').getBoundingClientRect())"))
    touch("touchStart", [(eb["x"] + 10, eb["y"] + 10)]); touch("touchEnd", []); time.sleep(0.3)
    R["crash_logged"] = c.eval("__proto.world.log.some(l => l.name === 'crash')")
    zs = [c.eval("__proto.cam.zoom")]
    for bid in ("btn-zout", "btn-zin", "btn-zin"):
        zb = json.loads(c.eval(f"JSON.stringify(document.getElementById('{bid}').getBoundingClientRect())"))
        touch("touchStart", [(zb["x"] + 15, zb["y"] + 15)]); touch("touchEnd", []); time.sleep(0.25); zs.append(c.eval("__proto.cam.zoom"))
    R["zoom"] = zs
    c.eval("window.SP.userZoom = null; window.SP.layout(); true")
    R["scroll_after"] = c.eval("[scrollX, scrollY, visualViewport ? visualViewport.scale : 1]")
    # screenshot: dusk, standing in the courtyard with NPCs around
    c.eval("__proto.setTime('afternoon', true); __proto.place(5.0, 7.5, 'SW'); __proto.step(1/60, 90); true"); time.sleep(0.5)
    open(os.path.join(OUT, name), "wb").write(base64.b64decode(c.call("Page.captureScreenshot", format="png")["data"]))
    return R
p, prof, ws = cdp.start()
try:
    c = cdp.CDP(ws); c.call("Runtime.enable")
    out = {"portrait": run(c, 390, 844, "69-mobile-portrait.png"), "landscape": run(c, 844, 390, "69-mobile-landscape.png")}
    errs = [m for m in c.logs if m.get("method") == "Runtime.exceptionThrown" or (m.get("method") == "Runtime.consoleAPICalled" and m["params"]["type"] == "error")]
    out["js_errors"] = len(errs)
    print(json.dumps(out, ensure_ascii=False, indent=1))
    for e in errs[:5]: print(json.dumps(e)[:600])
finally:
    p.kill(); shutil.rmtree(prof, ignore_errors=True)
