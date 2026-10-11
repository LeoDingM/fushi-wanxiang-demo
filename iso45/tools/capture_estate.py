"""Midtown-B estate screenshots mt-b1…mt-b6.
   python3 tools/capture_estate.py"""
import os, sys, time, base64, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
from PIL import Image, ImageDraw, ImageFont

S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
os.makedirs(S, exist_ok=True)
FONT = next((f for f in [
  "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
  "/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc",
] if os.path.exists(f)), None)

def font(sz):
  return ImageFont.truetype(FONT, sz) if FONT else ImageFont.load_default()

R = "for (let k=0;k<28;k++) __proto.render();"
DAY = "SP.clock.setTimeName&&SP.clock.setTimeName('day',true);"

p, prof, ws = cdp.start(); c = cdp.CDP(ws)
c.call("Runtime.enable"); c.call("Page.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def nav():
  c.call("Page.navigate", url=cdp.BASE + "?manual=1")
  for _ in range(160):
    time.sleep(0.1)
    if c.eval("!!(window.__protoReady && SP.estate && SP.scenes && SP.scenes.estate_compound)"):
      break
  c.eval("SP.estate && SP.estate.install && SP.estate.install()")
  time.sleep(0.2)

def ev(js):
  r = c.call("Runtime.evaluate", expression=js, awaitPromise=False, returnByValue=True)
  if r.get("exceptionDetails"):
    print("EXC", str(r["exceptionDetails"])[:400])
  return (r.get("result") or {}).get("value")

def shot(name, js, label, wait=0.35):
  nav()
  print("state", ev("JSON.stringify({ready:!!SP.estate, scenes:Object.keys(SP.scenes||{}).filter(k=>k.indexOf('estate')>=0||k.indexOf('midtown_a')>=0), installed:SP.estate&&SP.estate.installed})"))
  ev(js)
  time.sleep(wait)
  for _ in range(12):
    ev("__proto.render()")
  data = base64.b64decode(c.call("Page.captureScreenshot", format="png")["data"])
  path = S + name
  open(path, "wb").write(data)
  im = Image.open(path).convert("RGB")
  d = ImageDraw.Draw(im)
  d.rectangle([0, 0, 1280, 34], fill=(18, 22, 30))
  d.text((12, 7), label, fill=(230, 210, 170), font=font(17))
  im.save(path)
  sid = ev("SP.world && SP.world.sceneId")
  print("saved", name, sid)

# mt-b1: gated compound overview (gate + garden path)
shot("mt-b1-compound-gate.png", DAY + """
SP.estate.enter({to:'estate_compound'});
__proto.place(10.0, 2.2, 'N'); __proto.zoom(0.85);
""" + R, "mt-b1 · 云栖里门禁庭院 · 南门+门岗", wait=0.45)

# mt-b2: garden path looking toward lobby
shot("mt-b2-garden-path.png", DAY + """
SP.estate.enter({to:'estate_compound'});
__proto.place(10.0, 8.0, 'N'); __proto.zoom(1.05);
""" + R, "mt-b2 · 内院步道 · 往大堂", wait=0.4)

# mt-b3: modern lobby
shot("mt-b3-lobby.png", DAY + """
SP.estate.enter({to:'estate_lobby'});
__proto.place(4.0, 2.0, 'N'); __proto.zoom(1.15);
""" + R, "mt-b3 · 现代大堂 · 前台/信报/电梯桩", wait=0.4)

# mt-b4: unit living (bright, larger)
shot("mt-b4-unit-living.png", DAY + """
SP.estate.enter({to:'room_midtown_a101'});
__proto.place(3.2, 1.6, 'N'); __proto.zoom(1.2);
""" + R, "mt-b4 · A-101 客厅/开放厨 · ~48㎡", wait=0.45)

# mt-b5: bedroom by window + bath door
shot("mt-b5-unit-bed-bath.png", DAY + """
SP.estate.enter({to:'room_midtown_a101'});
__proto.place(2.4, 4.6, 'N'); __proto.zoom(1.25);
""" + R, "mt-b5 · 卧室靠窗 + 独立卫浴门", wait=0.45)

# mt-b6: partition fade demo — stand so wall is behind player
shot("mt-b6-wall-fade.png", DAY + """
SP.estate.enter({to:'room_midtown_a101'});
__proto.place(2.0, 4.9, 'S'); __proto.zoom(1.35);
""" + R, "mt-b6 · 隔墙遮挡淡出（reuse world.js fade）", wait=0.5)

# also copy rent table art into screenshots as reference card
src = os.path.join(os.path.dirname(S), "img", "estate", "rent_table.png")
if os.path.exists(src):
  shutil.copy(src, S + "mt-b-rent-table.png")
  print("copied rent table card")

c.ws.close(); p.terminate(); shutil.rmtree(prof, ignore_errors=True)
print("DONE estate captures")
