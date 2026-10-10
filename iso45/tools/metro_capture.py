"""metro_preview.html smoke test + captures (phone portrait 390x844, emulated touch). usage:
  python3 tools/metro_capture.py shot out.png "?query" "js-before" [wait_ms]     (one shot)
  python3 tools/metro_capture.py all                                               (M1..M5 into screenshots/)"""
import sys, os, time, base64, json
sys.path.insert(0, os.path.dirname(__file__))
import cdp
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BASE = "file://" + os.path.join(ROOT, "metro_preview.html")
class Sess:
    def __init__(s, w=390, h=844, mobile=True):
        s.p, s.prof, ws = cdp.start(); s.c = cdp.CDP(ws); s.c.call("Runtime.enable")
        s.c.call("Emulation.setDeviceMetricsOverride", width=w, height=h, deviceScaleFactor=1, mobile=mobile)
        if mobile: s.c.call("Emulation.setTouchEmulationEnabled", enabled=True, maxTouchPoints=5)
    def open(s, q):
        s.c.call("Page.navigate", url=BASE + q)
        for _ in range(100):
            time.sleep(0.1)
            if s.c.eval("!!(window.__metro && window.__metro.debug && window.__metro.s && window.__metro.s.W)"): break
        time.sleep(0.4)
    def js(s, e): return s.c.eval(e)
    def shot(s, out):
        d = s.c.call("Page.captureScreenshot", format="png")["data"]; open(out, "wb").write(base64.b64decode(d)); print("saved", out)
    def errors(s):
        return [json.dumps(l["params"])[:500] for l in s.c.logs if l.get("method") == "Runtime.exceptionThrown" or l["params"].get("type") == "error"]
    def close(s):
        s.p.kill(); import shutil; shutil.rmtree(s.prof, ignore_errors=True)
if __name__ == "__main__":
    if sys.argv[1] == "shot":
        S = Sess(); S.open(sys.argv[3])
        if len(sys.argv) > 4 and sys.argv[4]: print(S.js(sys.argv[4]))
        time.sleep(int(sys.argv[5]) / 1000 if len(sys.argv) > 5 else 0.8); S.shot(sys.argv[2])
        for e in S.errors(): print("JSERR", e)
        S.close()
    if sys.argv[1] == "all":
        outd = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "screenshots")
        os.makedirs(outd, exist_ok=True)
        PRE = "const M=window.__metro,D=M.debug,S=D.S; D.manual(true); S.overlay=null; const step=(s)=>D.step(Math.round(s*30),1/30);"
        shots = [
            ("M1-entrance.png", "?touch=1&time=08:10", "D.at(7.0,2.4,'N'); step(1.5);"),
            ("M2-security.png", "?touch=1&time=08:12", "D.go('jhl_concourse',7.6,5.0,'E'); step(1.2); M.interact(); step(0.9);"),
            ("M3-gates.png", "?touch=1&time=08:14", "D.go('jhl_concourse',13.48,5.6,'N'); D.secure(); step(1.2); M.interact(); step(0.1);"),
            ("M4-platform.png", "?touch=1&time=08:16", "D.go('jhl_platform',12.4,6.9,'N'); D.secure(); step(1); for(let i=0;i<800&&!(S.trains.N&&S.trains.N.doors&&S.trains.N.rel>0.15&&(!S.trains.S||S.trains.S.phase==='none'));i++) step(0.2); step(0.6);"),
            ("M5-cbd-station.png", "?touch=1&time=08:42&start=cbd", "D.go('cbd_concourse',14.5,9.4,'S'); step(2.0);"),
        ]
        only = sys.argv[3].split(",") if len(sys.argv) > 3 else None
        for name, q, js in shots:
            if only and name[:2] not in only: continue
            S = Sess(); S.open(q); S.js("(()=>{" + PRE + js + "D.manual(false); return 1;})()"); time.sleep(0.35); S.shot(os.path.join(outd, name))
            for e in S.errors(): print("JSERR", e)
            S.close()
