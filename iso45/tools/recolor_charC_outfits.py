"""Char-C trendy urban outfit recolors (no Blender). Appends to js/actors_outfits.js.
python3 tools/recolor_charC_outfits.py"""
from __future__ import annotations
import json, os, re, colorsys
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ACT = os.path.join(ROOT, "img", "actors")
DATA_JS = os.path.join(ROOT, "js", "actors_data.js")
OUT_JS = os.path.join(ROOT, "js", "actors_outfits.js")


def load_actors():
    text = open(DATA_JS, encoding="utf-8").read()
    m = re.search(r"window\.ACTORS=(\{.*\})\s*;\s*$", text, re.S)
    return json.loads(m.group(1))


def is_skin(h, s, v):
    return (0.02 <= h <= 0.12 and s >= 0.18 and 0.25 <= v <= 1.0) or (
        0.0 <= h <= 0.08 and s >= 0.12 and v >= 0.35
    )


def is_hair(h, s, v):
    return v < 0.28 and s < 0.45


def paint_cues(arr, frames, mode, accent):
    a = arr.copy()
    im = Image.fromarray(a)
    dr = ImageDraw.Draw(im)
    keys = [k for k in frames if k.startswith("idle_S_") or k.startswith("idle_SW_")]
    ar, ag, ab = accent
    for k in keys[:4]:
        x, y, w, h, ax, ay = frames[k]
        if mode in ("hoodie", "jacket", "knit"):
            cy = y + int(h * 0.28)
            dr.rectangle([x + 4, cy, x + w - 4, y + int(h * 0.55)], fill=(ar, ag, ab, 160))
        elif mode in ("oversized", "tee"):
            cy = y + int(h * 0.32)
            dr.rectangle([x + 3, cy, x + w - 3, y + int(h * 0.5)], fill=(ar, ag, ab, 180))
        elif mode == "dress":
            cy0 = y + int(h * 0.42)
            dr.polygon([(x + w // 2, cy0), (x + 1, y + h - 1), (x + w - 1, y + h - 1)], fill=(ar, ag, ab, 200))
        elif mode == "skirt":
            cy0 = y + int(h * 0.55)
            dr.polygon([(x + w // 2, cy0), (x + 2, y + h - 2), (x + w - 2, y + h - 2)], fill=(ar, ag, ab, 210))
        elif mode in ("jeans", "cargo", "athletic"):
            cy = y + int(h * 0.55)
            dr.rectangle([x + 5, cy, x + w - 5, y + h - 3], fill=(ar, ag, ab, 150))
        elif mode == "shirt":
            cy = y + int(h * 0.3)
            dr.rectangle([x + 4, cy, x + w - 4, y + int(h * 0.52)], fill=(ar, ag, ab, 140))
    return np.asarray(im)


def remap(rgba, top_hsv, bot_hsv):
    r0, g0, b0, a = (int(x) for x in rgba)
    if a < 8:
        return (r0, g0, b0, a)
    r, g, b = r0 / 255.0, g0 / 255.0, b0 / 255.0
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    if is_skin(h, s, v) or is_hair(h, s, v):
        return (r0, g0, b0, a)
    if s < 0.08 and v > 0.88:
        return (r0, g0, b0, a)
    # lower half of value → pants/skirt; upper mid → top
    th, ts, tv = top_hsv
    bh, bs, bv = bot_hsv
    if v < 0.42:
        nr, ng, nb = colorsys.hsv_to_rgb(bh, min(0.9, bs + s * 0.2), min(0.85, bv * (0.6 + v)))
    else:
        nr, ng, nb = colorsys.hsv_to_rgb(th, min(0.9, ts + s * 0.15), min(0.98, tv * (0.55 + v * 0.5)))
    return (int(nr * 255), int(ng * 255), int(nb * 255), a)


# name, base, mode, top_hsv(h,s,v), bot_hsv, accent RGB, gender hint
JOBS = [
    ("fit_hoodie", "student", "hoodie", (0.78, 0.55, 0.55), (0.62, 0.25, 0.35), (140, 80, 200)),
    ("fit_oversized", "student", "oversized", (0.14, 0.65, 0.85), (0.58, 0.35, 0.40), (255, 210, 60)),
    ("fit_athletic", "student", "athletic", (0.48, 0.7, 0.7), (0.55, 0.2, 0.3), (40, 220, 180)),
    ("fit_tee_red", "student", "tee", (0.0, 0.7, 0.75), (0.6, 0.2, 0.35), (220, 60, 70)),
    ("fit_dress", "student", "dress", (0.9, 0.45, 0.75), (0.9, 0.5, 0.55), (230, 120, 170)),
    ("fit_skirt_teal", "student", "skirt", (0.55, 0.2, 0.9), (0.48, 0.55, 0.55), (40, 160, 150)),
    ("fit_shirt", "office", "shirt", (0.58, 0.15, 0.95), (0.62, 0.35, 0.35), (230, 240, 255)),
    ("fit_knit", "office", "knit", (0.06, 0.55, 0.7), (0.1, 0.35, 0.35), (200, 110, 70)),
    ("fit_jacket", "office", "jacket", (0.62, 0.45, 0.35), (0.6, 0.2, 0.3), (30, 50, 90)),
    ("fit_jeans", "office", "jeans", (0.1, 0.2, 0.85), (0.6, 0.55, 0.45), (50, 90, 160)),
    ("fit_cargo", "office", "cargo", (0.12, 0.35, 0.55), (0.18, 0.45, 0.4), (110, 120, 60)),
    ("fit_work", "office", "shirt", (0.1, 0.25, 0.8), (0.12, 0.4, 0.45), (180, 160, 120)),
]


def main():
    actors = load_actors()
    out = {}
    for name, base, mode, top, bot, accent in JOBS:
        src = actors[base]
        im = Image.open(os.path.join(ROOT, src["img"])).convert("RGBA")
        a = np.asarray(im).copy()
        flat = a.reshape(-1, 4)
        for i in range(flat.shape[0]):
            if flat[i, 3] < 8:
                continue
            flat[i] = remap(tuple(int(x) for x in flat[i]), top, bot)
        a = flat.reshape(a.shape)
        a = paint_cues(a, src["frames"], mode, accent)
        out_path = os.path.join(ACT, f"{name}.png")
        Image.fromarray(a).save(out_path, optimize=True)
        out[name] = {
            "img": f"img/actors/{name}.png",
            "frames": src["frames"],
            "clips": src["clips"],
            "stride_m": src.get("stride_m", 1.0),
            "logical": src.get("logical", [72, 102]),
            "layer_variant": mode,
            "from_base": base,
            "charC_outfit": True,
        }
        print(name, os.path.getsize(out_path))
    open(OUT_JS, "w", encoding="utf-8").write(
        "/* generated by tools/recolor_charC_outfits.py — Char-C trendy urban outfits */\n"
        "window.ACTORS=Object.assign(window.ACTORS||{},"
        + json.dumps(out, separators=(",", ":"), ensure_ascii=False)
        + ");\n"
    )
    print("wrote", OUT_JS, "n=", len(out))


if __name__ == "__main__":
    main()
