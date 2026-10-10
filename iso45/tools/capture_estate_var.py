"""Midtown-B facade variety shots mt-b-var1…4."""
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
  ("mt-b-var1-club.png", 156.0, 2.4, 0.95, "mt-b-var1 · 云栖会所 4F · 玻璃门厅+粉刷 · 平屋顶"),
  ("mt-b-var2-cream.png", 168.0, 2.4, 0.78, "mt-b-var2 · 云栖暖石 11F · 象牙白粉刷 · 疏阳台"),
  ("mt-b-var3-mason.png", 182.0, 2.4, 0.72, "mt-b-var3 · 云栖砖影 14F · 暖砖条带 · 晾衣阳台"),
  ("mt-b-var4-glass.png", 196.0, 2.4, 0.58, "mt-b-var4 · 云栖璃湾 18F · 玻璃竖条 · 密阳台"),
]

p, prof, ws = cdp.start(); c = cdp.CDP(ws)
c.call("Runtime.enable"); c.call("Page.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def ev(js):
  r = c.call("Runtime.evaluate", expression=js, awaitPromise=False, returnByValue=True)
  if r.get("exceptionDetails"):
    print("EXC", str(r["exceptionDetails"])[:300])
  return (r.get("result") or {}).get("value")

def boot():
  c.call("Page.navigate", url=cdp.BASE + "?manual=1")
  for _ in range(200):
    time.sleep(0.1)
    if ev("!!(window.__protoReady && SP.estate && window.SCENE_CHUNKS && SCENE_CHUNKS.estate)"):
      break
  ev("SP.estate.install()")
  # force apply
  for _ in range(30):
    ok = ev("""(function(){
      SP.estate.warpOuter(152,2.2,'N');
      const list=(SP.chunks&&SP.chunks.list&&SP.chunks.list())||[];
      const c=list.find(x=>x.id==='estate');
      if(c) SP.chunks.apply(c);
      return !!(SP.world.chunksIn&&SP.world.chunksIn.estate);
    })()""")
    if ok: break
    time.sleep(0.1)
  for _ in range(24):
    ev("__proto.render()")
  print("boot", ev("JSON.stringify({estateChunk:!!(SCENE_CHUNKS&&SCENE_CHUNKS.estate), loaded:SP.chunks&&SP.chunks.loaded(), nEs:SP.world.objects.filter(o=>String(o.id||'').indexOf('es_yq')===0).length, meta:(SP.world.data.chunks||[]).map(c=>c.id)})"))

def shot(name, x, y, zoom, label):
  boot()
  ev(f"SP.estate.warpOuter({x},{y},'N'); __proto.place({x},{y},'N'); __proto.zoom({zoom});")
  for _ in range(40):
    ev("__proto.render()")
  time.sleep(0.4)
  data = base64.b64decode(c.call("Page.captureScreenshot", format="png")["data"])
  path = S + name
  open(path, "wb").write(data)
  im = Image.open(path).convert("RGB")
  d = ImageDraw.Draw(im)
  d.rectangle([0, 0, 1280, 36], fill=(16, 22, 32))
  d.text((12, 8), label, fill=(235, 215, 175), font=font(17))
  im.save(path)
  print("saved", name, "objs", ev("SP.world.objects.filter(o=>String(o.id||'').indexOf('es_yq')===0).length"))

for args in SHOTS:
  shot(*args)

c.ws.close(); p.terminate(); shutil.rmtree(prof, ignore_errors=True)
print("DONE")
