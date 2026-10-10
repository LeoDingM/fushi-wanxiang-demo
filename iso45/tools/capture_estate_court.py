"""Capture outdoor courtyard continuity + modern lobby."""
import os, sys, time, base64, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
from PIL import Image, ImageDraw, ImageFont

S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
FONT = next((f for f in [
  "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
  "/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc",
] if os.path.exists(f)), None)
def font(sz):
  return ImageFont.truetype(FONT, sz) if FONT else ImageFont.load_default()

SHOTS = [
  ("mt-b-court1-gate.png", "street", 151.8, 1.2, 0.9, "mt-b-court1 · 街道进门（连续庭院 · 非独立黑场）"),
  ("mt-b-court2-inside.png", "street", 151.8, 8.0, 0.75, "mt-b-court2 · 庭院内望大堂立面"),
  ("mt-b-sport1.png", "street", 156.0, 12.5, 0.85, "mt-b-sport1 · 庭院运动垫（户外）"),
  ("mt-b-lobby1-modern.png", "estate_lobby", None, None, 1.0, "mt-b-lobby1 · 现代大堂 · 水磨石/磁砖/LED/信报墙"),
  ("mt-b-club1.png", "estate_club", None, None, 1.0, "mt-b-club1 · 会所休闲健身（可选室内）"),
]

p, prof, ws = cdp.start(); c = cdp.CDP(ws)
c.call("Runtime.enable"); c.call("Page.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def ev(js):
  r = c.call("Runtime.evaluate", expression=js, awaitPromise=False, returnByValue=True)
  if r.get("exceptionDetails"):
    print("EXC", str(r["exceptionDetails"])[:280])
  return (r.get("result") or {}).get("value")

def boot():
  c.call("Page.navigate", url=cdp.BASE + "?manual=1")
  for _ in range(200):
    time.sleep(0.1)
    if ev("!!(window.__protoReady && SP.estate && SCENE_CHUNKS && SCENE_CHUNKS.estate)"):
      break
  ev("SP.estate.install()")
  for _ in range(25):
    ok = ev("""(function(){
      SP.estate.warpOuter(151.8, 1.5, 'N');
      const c=(SP.chunks.list()||[]).find(x=>x.id==='estate');
      if(c) SP.chunks.apply(c);
      return !!(SP.world.chunksIn&&SP.world.chunksIn.estate);
    })()""")
    if ok: break
    time.sleep(0.1)
  for _ in range(20):
    ev("__proto.render()")
  print("boot", ev("JSON.stringify({estate:!!SP.world.chunksIn.estate,courtyard:SP.world.objects.filter(o=>String(o.id||'').indexOf('es_cy')===0||o.id==='es_lobby_door').map(o=>o.id).slice(0,12),noCompound:!(SP.scenes&&SP.scenes.estate_compound),lobby:!!(SP.scenes&&SP.scenes.estate_lobby)})"))

def label_save(name, label):
  data = base64.b64decode(c.call("Page.captureScreenshot", format="png")["data"])
  path = S + name
  open(path, "wb").write(data)
  im = Image.open(path).convert("RGB")
  d = ImageDraw.Draw(im)
  d.rectangle([0, 0, 1280, 36], fill=(16, 22, 32))
  d.text((12, 8), label, fill=(235, 215, 175), font=font(16))
  im.save(path)
  print("saved", name)

for name, scene, x, y, zoom, label in SHOTS:
  boot()
  if scene == "street":
    ev(f"SP.estate.warpOuter({x},{y},'N'); __proto.place({x},{y},'N'); __proto.zoom({zoom}); __proto.lock(null);")
  else:
    ev(f"SP.estate.enter({{to:'{scene}'}});")
    time.sleep(0.2)
    ev(f"__proto.zoom({zoom});")
  for _ in range(40):
    ev("__proto.render()")
  time.sleep(0.35)
  label_save(name, label)

c.ws.close(); p.terminate(); shutil.rmtree(prof, ignore_errors=True)
print("DONE")
