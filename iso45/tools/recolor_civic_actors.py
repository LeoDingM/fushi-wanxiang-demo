"""Recolor adult base atlases into civic duty looks (police / firefighter / nurse).
Quota-conscious: no Blender re-render — hue-shift clothing, keep skin/hair, paint
simple cap/collar cues. Writes img/actors/{police,firefighter,nurse}.png and
js/actors_civic.js (Object.assign into window.ACTORS).
python3 tools/recolor_civic_actors.py"""
from __future__ import annotations
import json, os, re, colorsys
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ACT = os.path.join(ROOT, "img", "actors")
DATA_JS = os.path.join(ROOT, "js", "actors_data.js")
OUT_JS = os.path.join(ROOT, "js", "actors_civic.js")

# (out_name, base_set, clothing_target_hsv_fn, cue)
# clothing: non-skin, non-hair mid/high-sat pixels get remapped


def is_skin(h, s, v):
    # warm orange skin band
    return (0.02 <= h <= 0.12 and s >= 0.18 and 0.25 <= v <= 1.0) or (
        0.0 <= h <= 0.08 and s >= 0.12 and v >= 0.35
    )


def is_hair(h, s, v):
    return v < 0.28 and s < 0.45


def is_shoe_dark(h, s, v):
    return v < 0.22


def remap_clothing(rgba, mode):
    r0, g0, b0, a = (int(x) for x in rgba)
    if a < 8:
        return (r0, g0, b0, a)
    r, g, b = r0 / 255.0, g0 / 255.0, b0 / 255.0
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    if is_skin(h, s, v) or is_hair(h, s, v):
        return (r0, g0, b0, a)
    if s < 0.08 and v > 0.85:
        return (r0, g0, b0, a)
    # low-sat greys still count as clothing for uniform jobs
    if mode in ("police", "firefighter", "nurse") and s < 0.15 and 0.2 < v < 0.85:
        s = max(s, 0.25)
    if is_shoe_dark(h, s, v) and mode != "nurse":
        nr, ng, nb = colorsys.hsv_to_rgb(h, min(0.35, s + 0.05), v * 0.85)
        return (int(nr * 255), int(ng * 255), int(nb * 255), a)

    if mode == "police":
        target_h = 0.61
        if v < 0.45 and s < 0.35:
            nv = 0.12 + v * 0.28
            ns = 0.55 + s * 0.25
        else:
            nv = 0.22 + v * 0.38
            ns = 0.62 + min(0.3, s * 0.4)
        nr, ng, nb = colorsys.hsv_to_rgb(target_h, min(0.92, ns), min(0.85, nv))
        return (int(nr * 255), int(ng * 255), int(nb * 255), a)

    if mode == "firefighter":
        if v < 0.42 and s < 0.4:
            nr, ng, nb = colorsys.hsv_to_rgb(0.05, 0.35, 0.18 + v * 0.3)
        else:
            nv = 0.45 + v * 0.5
            ns = 0.75 + min(0.2, s * 0.3)
            nr, ng, nb = colorsys.hsv_to_rgb(0.055, min(0.95, ns), min(0.98, nv))
        return (int(nr * 255), int(ng * 255), int(nb * 255), a)

    if mode == "nurse":
        if s > 0.25 and 0.5 < h < 0.75:
            nr, ng, nb = colorsys.hsv_to_rgb(0.55, 0.35 + s * 0.2, 0.75 + v * 0.2)
        elif s < 0.35 and v > 0.35:
            nr, ng, nb = colorsys.hsv_to_rgb(0.58, 0.08 + s * 0.15, min(0.98, 0.82 + v * 0.15))
        else:
            nr, ng, nb = colorsys.hsv_to_rgb(0.55, 0.22, 0.7 + v * 0.25)
        return (int(nr * 255), int(ng * 255), int(nb * 255), a)

    return (r0, g0, b0, a)


def paint_cues(arr, frames, mode):
    """Paint small hat/collar cues onto idle_S frames (visible from street camera)."""
    a = arr.copy()
    draw_im = Image.fromarray(a)
    dr = ImageDraw.Draw(draw_im)
    # pick a few idle frames facing camera-ish
    keys = [k for k in frames if k.startswith("idle_S_") or k.startswith("idle_SW_") or k.startswith("idle_SE_")]
    for k in keys[:8]:
        x, y, w, h, ax, ay = frames[k]
        # head band near top of sprite
        hx0 = x + max(2, int(w * 0.25))
        hx1 = x + max(hx0 + 2, int(w * 0.75))
        hy0 = y + max(1, int(h * 0.04))
        hy1 = y + max(hy0 + 2, int(h * 0.14))
        if mode == "police":
            # navy cap brim + light badge
            dr.rectangle([hx0, hy0, hx1, hy1], fill=(25, 45, 95, 255))
            cx = (hx0 + hx1) // 2
            dr.rectangle([cx - 1, hy0 + 1, cx + 2, hy1 - 1], fill=(220, 190, 70, 255))
            # collar strip
            cy = y + int(h * 0.28)
            dr.rectangle([x + int(w * 0.3), cy, x + int(w * 0.7), cy + 2], fill=(40, 70, 130, 230))
        elif mode == "firefighter":
            # helmet crest orange/yellow
            dr.rectangle([hx0, hy0, hx1, hy1 + 1], fill=(230, 90, 20, 255))
            dr.rectangle([hx0 + 1, hy0 + 1, hx1 - 1, hy1], fill=(255, 200, 60, 255))
            # reflective stripe mid torso
            cy = y + int(h * 0.42)
            dr.rectangle([x + int(w * 0.22), cy, x + int(w * 0.78), cy + 2], fill=(255, 230, 120, 230))
        elif mode == "nurse":
            # nurse cap white + red cross
            dr.rectangle([hx0, hy0, hx1, hy1], fill=(245, 248, 252, 255))
            cx = (hx0 + hx1) // 2
            cy = (hy0 + hy1) // 2
            dr.rectangle([cx - 1, hy0 + 1, cx + 1, hy1 - 1], fill=(200, 50, 50, 255))
            dr.rectangle([hx0 + 2, cy - 1, hx1 - 2, cy + 1], fill=(200, 50, 50, 255))
    return np.asarray(draw_im)


def load_actors():
    text = open(DATA_JS, encoding="utf-8").read()
    m = re.search(r"window\.ACTORS=(\{.*\})\s*;\s*$", text, re.S)
    if not m:
        raise SystemExit("cannot parse actors_data.js")
    return json.loads(m.group(1))


JOBS = [
    ("police", "uncle", "police"),
    ("firefighter", "office", "firefighter"),
    ("nurse", "student", "nurse"),
]


def main():
    actors = load_actors()
    out = {}
    for name, base, mode in JOBS:
        if base not in actors:
            raise SystemExit(f"missing base {base}")
        src = actors[base]
        im = Image.open(os.path.join(ROOT, src["img"])).convert("RGBA")
        a = np.asarray(im).copy()
        h, w = a.shape[:2]
        flat = a.reshape(-1, 4)
        for i in range(flat.shape[0]):
            if flat[i, 3] < 8:
                continue
            flat[i] = remap_clothing(tuple(int(x) for x in flat[i]), mode)
        a = flat.reshape(h, w, 4)
        a = paint_cues(a, src["frames"], mode)
        out_path = os.path.join(ACT, f"{name}.png")
        Image.fromarray(a).save(out_path, optimize=True)
        entry = {
            "img": f"img/actors/{name}.png",
            "frames": src["frames"],
            "clips": src["clips"],
            "stride_m": src.get("stride_m", 1.0),
            "logical": src.get("logical", [72, 102]),
            "civic": True,
            "from_base": base,
        }
        out[name] = entry
        print(name, "from", base, "->", out_path, Image.open(out_path).size)

    js = (
        "/* generated by tools/recolor_civic_actors.py — civic duty atlases (recolor, no Blender) */\n"
        "window.ACTORS=Object.assign(window.ACTORS||{},"
        + json.dumps(out, separators=(",", ":"), ensure_ascii=False)
        + ");\n"
    )
    open(OUT_JS, "w", encoding="utf-8").write(js)
    print("wrote", OUT_JS)


if __name__ == "__main__":
    main()
