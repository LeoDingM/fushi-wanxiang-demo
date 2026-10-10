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
def street_shot(outd):
    """Capture M1b from core street showing glass pavilion + stairs."""
    S = Sess(); 
    url = "file://" + os.path.join(ROOT, "index.html") + "?touch=1&time=08:10&npcs=0&px=41.2&py=-11.2&dir=N&zoom=1.5&w=390&h=844"
    S.c.call("Page.navigate", url=url)
    for _ in range(120):
        time.sleep(0.1)
        if S.c.eval("!!(window.SP && SP.W && SP.player)"): break
    time.sleep(1.0)
    # nudge camera toward entrance
    S.c.eval("(()=>{ try{ const p=SP.player; if(p){ p.x=41.2; p.y=-11.0; p.dir='N'; } if(SP.cam){ SP.cam.x=41.2; SP.cam.y=-9.5; } }catch(e){ return String(e);} return 1; })()")
    time.sleep(0.8)
    S.shot(os.path.join(outd, "M1b-street-stairs.png"))
    for e in S.errors(): print("JSERR", e)
    S.close()

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
            ("M1-entrance.png", "?touch=1&time=08:10", "D.go('jhl_concourse',4.0,2.5,'N'); step(1.2);"),
            ("M1b-street-stairs.png", "STREET", ""),
            ("M2-security.png", "?touch=1&time=08:12", "D.go('jhl_concourse',4.6,4.3,'N'); step(0.8); M.interact(); step(0.9);"),
            ("M3-gates.png", "?touch=1&time=08:14", "D.go('jhl_concourse',5.98,8.0,'N'); D.secure(); step(0.8); M.interact(); step(0.1);"),
            ("M4-platform.png", "?touch=1&time=08:16", "D.go('jhl_platform',12.5,6.0,'N'); D.secure(); step(1); for(let i=0;i<800&&!(S.trains.N&&S.trains.N.doors&&S.trains.N.rel>0.15&&(!S.trains.S||S.trains.S.phase==='none'));i++) step(0.2); step(0.5);"),
            ("M5-cbd-station.png", "?touch=1&time=08:42&start=cbd", "D.go('cbd_concourse',18.0,8.0,'S'); step(1.5);"),
        ]
        only = sys.argv[3].split(",") if len(sys.argv) > 3 else None
        for name, q, js in shots:
            if only and name[:2] not in only and name.split("-")[0] not in (only or []): continue
            if name.startswith("M1b"):
                street_shot(outd); continue
            S = Sess(); S.open(q); S.js("(()=>{" + PRE + js + "D.manual(false); return 1;})()"); time.sleep(0.35); S.shot(os.path.join(outd, name))
            for e in S.errors(): print("JSERR", e)
            S.close()
    if sys.argv[1] == "flow":
        S = Sess(); S.open("?touch=1&time=08:10&crowd=0")
        r = S.js("""(()=>{
          const M=window.__metro,D=M.debug,S=D.S,MS=D.MS,R=[];
          const step=(n)=>D.step(Math.round(n*30),1/30);
          D.manual(true); S.overlay=null; S.npcs.length=0; S.menu=null;
          // 1) enter lands in concourse (no street facade place)
          D.go('jhl_concourse',4.0,2.2,'N'); step(0.3);
          R.push(['area_concourse', S.W.A.id, S.W.A.id==='jhl_concourse']);
          R.push(['kind_concourse', S.W.A.kind, S.W.A.kind==='concourse']);
          // 2) security
          D.secure(); R.push(['secured', true, !!S.secured]);
          // 3) counter reachable at reach point
          const ctr=(S.W.A.objects||[]).find(o=>o.id==='counter');
          R.push(['counter_exists', !!ctr, !!ctr]);
          if(ctr){ D.go('jhl_concourse', ctr.reach[0], ctr.reach[1], 'E'); step(0.2);
            R.push(['counter_near', Math.hypot(S.player.x-ctr.x,S.player.y-ctr.y)<3.5, Math.hypot(S.player.x-ctr.x,S.player.y-ctr.y)<3.5]); }
          // 4) separate IN/OUT banks
          const gin=(S.W.A.gates||[]).filter(g=>g.kind==='in');
          const gout=(S.W.A.gates||[]).filter(g=>g.kind==='out');
          R.push(['in_gates', gin.length, gin.length>=3]);
          R.push(['out_gates', gout.length, gout.length>=3]);
          R.push(['banks_apart', Math.abs(((gin[0].x0+gin[0].x1)/2)-((gout[0].x0+gout[0].x1)/2)), Math.abs(((gin[0].x0+gin[0].x1)/2)-((gout[0].x0+gout[0].x1)/2))>4]);
          // 5) pass IN gate with QR
          MS.tokens=[]; MS.entry=null; MS.card=50;
          const g=gin[2]; D.go('jhl_concourse', (g.x0+g.x1)/2, g.y-0.85, 'N'); D.secure(); step(0.2);
          M.interact(); step(0.15);
          R.push(['in_menu', !!S.menu, !!S.menu]);
          if(S.menu){ const it=S.menu.items.find(i=>/乘车码|二维码|QR/i.test(i.label))||S.menu.items[0]; it.act(); step(0.6); }
          R.push(['entered', !!MS.entry, !!MS.entry]);
          D.at((g.x0+g.x1)/2, g.y+0.5, 'N'); step(0.3);
          R.push(['past_in_gate', S.player.y>g.y, S.player.y>g.y]);
          // 6) platform
          D.go('jhl_platform',12.5,6.0,'N'); step(0.2);
          R.push(['on_platform', S.W.A.id, S.W.A.id==='jhl_platform']);
          // 7) ride to CBD (fade skip)
          M.ride('cbd', S.W.A.tracks.find(t=>t.id==='N'));
          for(let i=0;i<200 && S.ride;i++) step(0.05);
          step(0.3);
          R.push(['at_cbd', S.W.A.station, S.W.A.station==='cbd']);
          // 8) OUT gate on CBD concourse
          D.go('cbd_concourse',22.0,11.2,'S'); step(0.2);
          const gout2=(S.W.A.gates||[]).filter(g=>g.kind==='out');
          R.push(['cbd_out', gout2.length, gout2.length>=3]);
          const go=gout2[Math.min(2,gout2.length-1)];
          MS.entry={station:'jinghuaili',method:'qr',rode:true,to:'cbd',fare:5,t:0};
          D.go('cbd_concourse', (go.x0+go.x1)/2, go.y+0.85, 'S'); step(0.2);
          M.interact(); step(0.8);
          D.at((go.x0+go.x1)/2, go.y-0.5, 'S'); step(0.3);
          R.push(['exited_paid', !MS.entry, !MS.entry]);
          R.push(['past_out_gate', S.player.y<go.y, S.player.y<go.y]);
          D.manual(false);
          return R;
        })()""")
        print("FLOW", r)
        fails=[x for x in (r or []) if len(x)>2 and not x[2]]
        print("FAILS", fails)
        print("PASS" if not fails else "FAIL")
        for e in S.errors(): print("JSERR", e)
        S.close(); raise SystemExit(0 if not fails else 1)
