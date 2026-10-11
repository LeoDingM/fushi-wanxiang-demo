"""Stage-3 interior walk: python3 tools/capture_s3.py -> screenshots/95-interior-walk.mp4 (30 fps, deterministic ?manual=1)"""
import os, sys, subprocess, shutil, tempfile
sys.path.insert(0, os.path.dirname(__file__))
from capture import page, step, snap, OUT, P
from cdp import start, CDP
p, prof, ws = start()
try:
    c = CDP(ws); c.call("Runtime.enable"); g = c.eval
    tmp = tempfile.mkdtemp(); n = 0
    page(c, "time=afternoon&zoom=1", 960, 540)
    g("SP.actions.go('room_2f02')"); step(c, 0.5)
    g("SP.world.setState(SP.world.byId.bath_door,'open'); SP.world.rebuildColliders()")
    g(f"{P}.autopilot([[4.5,0.9],[5.45,1.3],[5.45,2.6],[4.9,2.7],[5.45,2.6],[5.45,1.3],[3.0,1.0],[1.7,0.4],[1.7,-0.7],[3.0,-0.6],[1.7,-0.6],[1.7,0.8],[2.8,0.8],[3.0,2.5]])")
    for i in range(900):
        step(c, 1 / 30, 1 / 60); snap(c, None, 960, 540).save(os.path.join(tmp, f"f{n:04d}.png")); n += 1
        if g(f"{P}.autoDone()"): break
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "30", "-i", os.path.join(tmp, "f%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "22", os.path.join(OUT, "95-interior-walk.mp4")], check=True)
    shutil.rmtree(tmp); print("saved 95-interior-walk.mp4", n, "frames", g("JSON.stringify([SP.player.x,SP.player.y])"), flush=True)
    # 98: walk to the desk, sit down, type (monitor on, night), get up
    tmp = tempfile.mkdtemp(); n = 0
    page(c, "time=night&zoom=1.5", 960, 540); g("SP.actions.go('room_2f02')"); step(c, 0.3)
    g("SP.player.x=2.6; SP.player.y=2.4"); g(f"{P}.autopilot([[3.24,2.62]])")
    started = False
    for i in range(300):
        step(c, 1 / 30, 1 / 60); snap(c, None, 960, 540).save(os.path.join(tmp, f"f{n:04d}.png")); n += 1
        if not started and g(f"{P}.autoDone()"): g("SP.player.setDir('N'); SP.game.start('browse', SP.world.byId.desk)"); started = True
        elif started and not g("!!SP.game.activity") and n > 60: break
    for i in range(20): step(c, 1 / 30, 1 / 60); snap(c, None, 960, 540).save(os.path.join(tmp, f"f{n:04d}.png")); n += 1
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "30", "-i", os.path.join(tmp, "f%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "22", os.path.join(OUT, "98-pc-sit.mp4")], check=True)
    shutil.rmtree(tmp); print("saved 98-pc-sit.mp4", n, "frames", flush=True)
finally:
    p.kill()
