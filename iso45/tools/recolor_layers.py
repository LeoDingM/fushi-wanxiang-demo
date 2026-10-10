"""Char-B clothing-layer atlas variants (quota: recolor, no Blender).
Writes img/actors/{student_skirt,student_long,office_short}.png and merges into js/actors_layers.js.
Also improves child cue sheet child_cue (scaled-looking recolor of student with brighter top).
python3 tools/recolor_layers.py"""
from __future__ import annotations
import json, os, re, colorsys
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ACT = os.path.join(ROOT, "img", "actors")
DATA_JS = os.path.join(ROOT, "js", "actors_data.js")
OUT_JS = os.path.join(ROOT, "js", "actors_layers.js")
SIGN_DIR = os.path.join(ROOT, "img", "signs")


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


def remap(rgba, mode):
    r0, g0, b0, a = (int(x) for x in rgba)
    if a < 8:
        return (r0, g0, b0, a)
    r, g, b = r0 / 255.0, g0 / 255.0, b0 / 255.0
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    if is_skin(h, s, v) or is_hair(h, s, v):
        return (r0, g0, b0, a)
    if s < 0.08 and v > 0.85:
        return (r0, g0, b0, a)

    if mode == "skirt":
        # keep blue top-ish; push lower/mid clothing toward magenta skirt cue
        if v < 0.55 or (0.5 < h < 0.75 and s > 0.3 and v < 0.7):
            nr, ng, nb = colorsys.hsv_to_rgb(0.92, 0.45 + s * 0.2, 0.55 + v * 0.35)
            return (int(nr * 255), int(ng * 255), int(nb * 255), a)
        # brighten top slightly (blouse)
        nr, ng, nb = colorsys.hsv_to_rgb(0.58, max(0.15, s * 0.5), min(0.98, v + 0.12))
        return (int(nr * 255), int(ng * 255), int(nb * 255), a)

    if mode == "long":
        # darker long-sleeve sweater blues/greys
        target_h = 0.58 if s > 0.1 else 0.62
        nv = 0.22 + v * 0.4
        ns = 0.4 + min(0.4, s * 0.5)
        nr, ng, nb = colorsys.hsv_to_rgb(target_h, min(0.85, ns), min(0.75, nv))
        return (int(nr * 255), int(ng * 255), int(nb * 255), a)

    if mode == "short":
        # light short-sleeve / summer shirt (cream + teal pants cue)
        if v < 0.4:
            nr, ng, nb = colorsys.hsv_to_rgb(0.52, 0.35, 0.35 + v * 0.4)
        else:
            nr, ng, nb = colorsys.hsv_to_rgb(0.12, 0.12 + s * 0.15, min(0.98, 0.75 + v * 0.2))
        return (int(nr * 255), int(ng * 255), int(nb * 255), a)

    if mode == "child":
        # brighter kid clothes (yellow/cyan), keep skin
        if 0.5 < h < 0.75 and s > 0.25:
            nr, ng, nb = colorsys.hsv_to_rgb(0.52, 0.55, min(0.95, v + 0.15))
        else:
            nr, ng, nb = colorsys.hsv_to_rgb(0.14, 0.55, min(0.95, 0.6 + v * 0.35))
        return (int(nr * 255), int(ng * 255), int(nb * 255), a)

    return (r0, g0, b0, a)


def paint_layer_cues(arr, frames, mode):
    a = arr.copy()
    im = Image.fromarray(a)
    dr = ImageDraw.Draw(im)
    keys = [k for k in frames if k.startswith("idle_S_") or k.startswith("idle_SW_")]
    for k in keys[:6]:
        x, y, w, h, ax, ay = frames[k]
        if mode == "skirt":
            # skirt wedge near legs
            cy0 = y + int(h * 0.55)
            dr.polygon([(x + w // 2, cy0), (x + 2, y + h - 2), (x + w - 2, y + h - 2)], fill=(180, 70, 140, 210))
        elif mode == "long":
            # sleeve length bars
            cy = y + int(h * 0.38)
            dr.rectangle([x + 2, cy, x + 5, y + int(h * 0.62)], fill=(40, 60, 110, 200))
            dr.rectangle([x + w - 5, cy, x + w - 2, y + int(h * 0.62)], fill=(40, 60, 110, 200))
        elif mode == "short":
            cy = y + int(h * 0.36)
            dr.rectangle([x + 3, cy, x + 6, y + int(h * 0.48)], fill=(240, 220, 190, 200))
            dr.rectangle([x + w - 6, cy, x + w - 3, y + int(h * 0.48)], fill=(240, 220, 190, 200))
        elif mode == "child":
            # bigger head cue (cap)
            hx0, hx1 = x + int(w * 0.2), x + int(w * 0.8)
            hy0, hy1 = y + 1, y + int(h * 0.18)
            dr.ellipse([hx0, hy0, hx1, hy1], fill=(80, 160, 220, 230))
    return np.asarray(im)


JOBS = [
    ("student_skirt", "student", "skirt"),
    ("student_long", "student", "long"),
    ("office_short", "office", "short"),
    ("child_cue", "student", "child"),
]


def make_sign(path, bg, fg, title, sub, w=160, h=48):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    # metal/glass panel
    dr.rounded_rectangle([0, 0, w - 1, h - 1], radius=6, fill=bg + (240,))
    dr.rounded_rectangle([2, 2, w - 3, h - 3], radius=5, outline=fg + (255,), width=2)
    # accent bar
    dr.rectangle([0, 0, 8, h], fill=fg + (255,))
    # title (bitmap font)
    dr.text((16, 8), title, fill=(255, 255, 255, 255))
    dr.text((16, 28), sub, fill=(230, 230, 230, 220))
    im.save(path, optimize=True)


def main():
    actors = load_actors()
    out = {}
    for name, base, mode in JOBS:
        src = actors[base]
        im = Image.open(os.path.join(ROOT, src["img"])).convert("RGBA")
        a = np.asarray(im).copy()
        flat = a.reshape(-1, 4)
        for i in range(flat.shape[0]):
            if flat[i, 3] < 8:
                continue
            flat[i] = remap(tuple(int(x) for x in flat[i]), mode)
        a = flat.reshape(a.shape)
        a = paint_layer_cues(a, src["frames"], mode)
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
        }
        print(name, "from", base, Image.open(out_path).size)

    open(OUT_JS, "w", encoding="utf-8").write(
        "/* generated by tools/recolor_layers.py — Char-B clothing layer variants */\n"
        "window.ACTORS=Object.assign(window.ACTORS||{},"
        + json.dumps(out, separators=(",", ":"), ensure_ascii=False)
        + ");\n"
    )
    print("wrote", OUT_JS)

    os.makedirs(SIGN_DIR, exist_ok=True)
    signs = [
        ("police", (26, 58, 120), (255, 200, 60), "井槐里派出所", "POLICE"),
        ("hospital", (12, 120, 100), (200, 255, 230), "井槐社区医院", "HOSPITAL"),
        ("fire", (180, 48, 24), (255, 220, 80), "井槐消防站", "FIRE"),
        ("school_pri", (40, 90, 160), (255, 255, 255), "井槐小学", "PRIMARY"),
        ("school_mid", (50, 80, 140), (255, 255, 255), "井槐中学·初中", "MIDDLE"),
        ("school_high", (35, 55, 110), (255, 255, 255), "井槐中学·高中", "HIGH"),
        ("barber", (90, 40, 110), (255, 210, 240), "剪艺理发", "BARBER"),
    ]
    for name, bg, fg, title, sub in signs:
        make_sign(os.path.join(SIGN_DIR, f"{name}.png"), bg, fg, title, sub)
        print("sign", name)


if __name__ == "__main__":
    main()
