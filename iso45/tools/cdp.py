"""Headless Chrome (CDP) helper for scene-proto-45 (file://, no server). Used by capture.py and playtest.py.
usage: python3 tools/cdp.py out.png "?debug=1" [wait_ms] [js]"""
import json, subprocess, sys, time, base64, urllib.request, os, tempfile, shutil
import websocket

BASE = os.environ.get("BASE", "file://" + os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "index.html")))
def start():
    """Own, isolated headless Chrome: port 0 + private profile, the real port is read from DevToolsActivePort,
    so we never attach to another worker's browser (a fixed port did exactly that once)."""
    prof = tempfile.mkdtemp(prefix="scene-proto-45-cdp-")
    p = subprocess.Popen(["google-chrome", "--headless=new", "--remote-debugging-port=0", "--no-sandbox",
                          "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", "--remote-allow-origins=*", f"--user-data-dir={prof}", "--window-size=1280,720",
                          "about:blank"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    portfile = os.path.join(prof, "DevToolsActivePort")
    for _ in range(100):
        try:
            port = int(open(portfile).read().split()[0])
            tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json"))
            page = [t for t in tabs if t["type"] == "page"][0]
            return p, prof, page["webSocketDebuggerUrl"]
        except Exception:
            time.sleep(0.2)
    p.kill()
    raise SystemExit("chrome did not start")

class CDP:
    def __init__(self, url):
        self.ws = websocket.create_connection(url, max_size=None, suppress_origin=True)
        self.i = 0
        self.logs = []
    def call(self, method, **params):
        self.i += 1
        self.ws.send(json.dumps({"id": self.i, "method": method, "params": params}))
        while True:
            m = json.loads(self.ws.recv())
            if m.get("method") in ("Runtime.consoleAPICalled", "Runtime.exceptionThrown"):
                self.logs.append(m)
            if m.get("id") == self.i:
                return m.get("result", m)
    def eval(self, expr):
        r = self.call("Runtime.evaluate", expression=expr, awaitPromise=True, returnByValue=True)
        return r.get("result", {}).get("value")

def shoot(jobs, w=1280, h=720):
    p, prof, ws = start()
    try:
        c = CDP(ws)
        c.call("Runtime.enable")
        c.call("Emulation.setDeviceMetricsOverride", width=w, height=h, deviceScaleFactor=1, mobile=False)
        for out, query, wait, script in jobs:
            c.call("Page.navigate", url=BASE + query)
            for _ in range(100):
                time.sleep(0.1)
                if c.eval("!!window.__protoReady"):
                    break
            if script:
                c.eval(script)
            time.sleep(wait / 1000)
            data = c.call("Page.captureScreenshot", format="png")["data"]
            open(out, "wb").write(base64.b64decode(data))
            print("saved", out)
        errs = [l for l in c.logs if l.get("method") == "Runtime.exceptionThrown" or
                l["params"].get("type") == "error"]
        for e in errs:
            print("JSERR", json.dumps(e["params"])[:400])
        return c
    finally:
        p.kill()
        shutil.rmtree(prof, ignore_errors=True)

if __name__ == "__main__":
    out, q = sys.argv[1], sys.argv[2]
    wait = int(sys.argv[3]) if len(sys.argv) > 3 else 1200
    script = sys.argv[4] if len(sys.argv) > 4 else None
    shoot([(out, q, wait, script)])
