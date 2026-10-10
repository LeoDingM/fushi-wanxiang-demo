"""浮世万象 · 云汇CBD (place 'cbd') builder:  python3 tools/build_cbd.py [--no-kit] [--rules]
 1. tower data table  -> shared-rules 'cbd' section (rules.json keys ADDED only, canonical ../shared-rules + synced copy)
 2. layout            -> cbd_scene.json + cbd_scene.js (window.CBD_SCENE): zones, roads/lanes/signals, buildings, towers,
                         props, metro exits A-D (-> place 'metro_cbd'), stops, walk graph, crowd schedule
 3. kit               -> kit_cbd/kit_atlas.png + kit_emit.png + kit_manifest.json/.js (window.KIT_CBD_MANIFEST):
                         props rendered by tools/cbd_raster.py at the kit camera, ground textures, facade module textures
Everything is deterministic (seeded)."""
import json, math, os, random, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import cbd_raster as R

# ============================================================== 1. towers (ORIGINAL names / designs)
TOWERS = [  # id, name, use, floors, height_m — Leo density: 1≥600, 2×500-600, 5×400-500, 7×300-400; rest ≤200 (~150 avg)
 ("tianshu", "天枢塔", "超甲级办公 · 酒店 · 观光层", 128, 648),
 ("kunpeng", "鲲鹏金融中心", "金融总部办公", 116, 568),
 ("xinglan", "星澜国际中心", "办公 · 五星酒店", 108, 532),
 ("yuheng", "玉衡大厦", "超甲级办公", 98, 488), ("huichao", "汇潮塔", "办公 · 空中大堂", 95, 466),
 ("yunfan", "云帆中心", "媒体 · 办公", 92, 442), ("liuli", "琉璃之塔", "酒店 · 服务式公寓", 88, 418),
 ("hongtu", "鸿图国际", "办公 · 交易大厅", 84, 402),
 ("lanting", "澜庭中心", "办公", 78, 386), ("lingxiao", "凌霄大厦", "办公", 76, 364), ("yaoshi", "曜石塔", "办公", 74, 348),
 ("haitang", "海棠金融大厦", "金融办公", 72, 332), ("xinghewan", "星河湾国际", "办公 · 公寓", 70, 318),
 ("yunjin", "云锦大厦", "办公", 68, 308), ("qinglan", "青岚中心", "办公", 66, 301),
 # mid / low CBD fabric — all ≤200 m, average ~150 m (sparse count so the skyline isn't a packed wall)
 ("huijin", "汇金大厦", "办公", 42, 188), ("jingxing", "景行中心", "办公", 40, 176), ("boya", "博雅大厦", "办公", 38, 168),
 ("zhiyuan", "致远国际", "办公", 36, 162), ("guangqi", "光启大厦", "办公", 35, 158), ("hejing", "和璟中心", "办公 · 酒店", 40, 172),
 ("dongan", "东岸国际", "办公", 34, 154), ("xinggang", "星港大厦", "办公", 33, 150), ("jiahe", "嘉禾中心", "办公", 32, 146),
 ("chenxi", "晨曦公寓", "公寓", 44, 156), ("hengyue", "恒岳大厦", "办公", 34, 152), ("jincheng", "锦程中心", "办公", 36, 160),
 ("yunhui_a", "云汇写字楼A座", "办公", 38, 170), ("guanlan", "观澜公寓", "公寓", 48, 168), ("qiyun", "栖云酒店", "酒店", 42, 158),
 ("huifeng", "惠风大厦", "办公", 31, 140), ("ganwan", "港湾大厦", "办公", 32, 145), ("fenglin", "枫林公寓", "公寓", 42, 148),
 ("wenhui", "文汇大厦", "办公", 27, 128), ("songtao", "松涛大厦", "办公", 28, 130),
]
def tclass(h): return "landmark" if h >= 620 else "supertall" if h >= 500 else "400s" if h >= 400 else "300s" if h >= 300 else "200s" if h >= 200 else "filler"

# ============================================================== materials (bright, glassy CBD palette)
MATS = {
 "granite": dict(c="#c9c6c0", var=0.35), "granite_dk": dict(c="#8e8b88", var=1), "stone_w": dict(c="#e6e2da", var=0.35, hi=1),
 "steel": dict(c="#c3c8cc", hi=1), "steel_dk": dict(c="#6d737a"), "ink": dict(c="#2a2d33"), "black": dict(c="#25272c"),
 "wood": dict(c="#b07a4a", var=2, grain=8), "wood_dk": dict(c="#7a5232"), "glass": dict(c="#8fc4dc", hi=1), "glass_dk": dict(c="#4f7f98", hi=1),
 "bark": dict(c="#6e5646", var=1), "leaf": dict(c="#5c8a3a", hi=1, var=1.5, noline=1), "leaf_b": dict(c="#4a7430", var=1.5, noline=1),
 "leaf_sp": dict(c="#86b84e", hi=1, var=1.5, noline=1), "blossom": dict(c="#f2b8c8", hi=1, var=1, noline=1),
 "leaf_au": dict(c="#d8902e", hi=1, var=1.5, noline=1), "leaf_au2": dict(c="#b85a28", var=1.5, noline=1), "ginkgo_au": dict(c="#f0c838", hi=1, var=1.2, noline=1),
 "shrub": dict(c="#4f7f3a", var=1.5, noline=1), "flower_r": dict(c="#e05a6a", noline=1), "flower_y": dict(c="#f3d050", noline=1), "soil": dict(c="#5a4636"),
 "lamp_w": dict(c="#f4efe0", e="#ffe7b0"), "lamp_c": dict(c="#eef4ff", e="#e8f2ff"), "water": dict(c="#5aa8d0", hi=1, nosnow=1),
 "red": dict(c="#d8443a"), "blue": dict(c="#2f6db8"), "metro_red": dict(c="#c8283a"), "sign_lit": dict(c="#f6f6f2", e="#fffbe8"),
 "brt_red": dict(c="#c83a30"), "brt_body": dict(c="#e8eaee", hi=1, var=0.35), "brt_band": dict(c="#1f8a5a"), "tire": dict(c="#222326"), "headl": dict(c="#f0f0e8", e="#fff8d8"),
 "parasol_a": dict(c="#f2efe6"), "parasol_b": dict(c="#2e6a5a"), "cafe_chair": dict(c="#3a3d44"), "amp": dict(c="#30302e"), "guitar": dict(c="#b8783a"),
 "dog_a": dict(c="#c89a62", var=1), "dog_b": dict(c="#f0ece4", var=1), "brass": dict(c="#d8b45a", hi=1), "screen": dict(c="#3a6aa0", e="#9ad0ff"),
 "kiosk": dict(c="#2f7a68"), "kiosk_lit": dict(c="#f6e9c8", e="#ffe2a0"), "chrome": dict(c="#e4e8ec", hi=1), "rubber": dict(c="#3c3f44"),
 "bin_g": dict(c="#4a8a5a"), "bin_b": dict(c="#3a6ab0"), "hedge": dict(c="#3f7034", var=1.6, noline=1), "pole": dict(c="#5d646c"),
}
SEASONS = ["spring", "summer", "autumn", "winter"]

# ============================================================== 2. pieces (props)
PIECES = {}
def piece(name, rots=(0,), states=("default",), seasons=False, foot=None, emit=False, vars_=("base",)):
    def deco(fn): PIECES[name] = dict(fn=fn, rots=list(rots), states=list(states), seasons=seasons, foot=foot, vars=list(vars_)); return fn
    return deco

def canopy(m, mats_, cz, rx, rz, seed, n=7):
    rnd = random.Random(seed)
    m.ell(mats_[0], (0, 0, cz), (rx, rx, rz), blob=True, seed=seed)
    for i in range(n):
        a = rnd.uniform(0, 6.283); d = rnd.uniform(0.35, 0.75) * rx; s = rnd.uniform(0.45, 0.65) * rx
        m.ell(mats_[i % len(mats_)], (math.cos(a) * d, math.sin(a) * d, cz + rnd.uniform(-0.25, 0.35) * rz), (s, s, s * 0.85), blob=True, seed=seed + i)
def branches(m, z0, h, seed, n=6, spread=1.8):
    rnd = random.Random(seed)
    m.cyl("bark", (0, 0), 0.1, z0 - 0.4, z0 + h * 0.75, segs=6)
    for i in range(n):
        a = rnd.uniform(0, 6.283) + i * 1.1; L = rnd.uniform(0.6, 1.0) * spread; z = z0 + rnd.uniform(0, h * 0.4); K = 9
        for k in range(K):
            f = (k + 0.5) / K; w = 0.07 * (1.2 - f * 0.6)
            m.box("bark", (math.cos(a) * L * f - w, math.sin(a) * L * f - w, z + f * h * 0.55), (math.cos(a) * L * f + w, math.sin(a) * L * f + w, z + f * h * 0.55 + h * 0.55 / K + 0.12))
@piece("tree_a", seasons=True, foot=[-0.3, -0.3, 0.3, 0.3], vars_=("base", "t2"))
def _(m, st, se, v):       # broad park tree (樟/梧桐 type): wide faceted canopy, blossoms in spring, gold in autumn, bare in winter
    seed = 5 if v == "base" else 17; s = 1.0 if v == "base" else 0.85
    m.cyl("bark", (0, 0), 0.22 * s, 0, 3.2 * s, segs=8)
    if se == "winter": branches(m, 2.4 * s, 3.4 * s, seed, 7, 2.2 * s); return
    pal = {"spring": ("leaf_sp", "blossom", "leaf"), "summer": ("leaf", "leaf_b", "leaf"), "autumn": ("leaf_au", "leaf_au2", "ginkgo_au")}[se]
    canopy(m, pal, 4.9 * s, 2.5 * s, 1.75 * s, seed)
@piece("tree_b", seasons=True, foot=[-0.25, -0.25, 0.25, 0.25])
def _(m, st, se, v):       # street ginkgo: columnar, brilliant yellow in autumn
    m.cyl("bark", (0, 0), 0.16, 0, 2.6, segs=8)
    if se == "winter": branches(m, 2.0, 4.6, 9, 6, 0.9); return
    pal = {"spring": ("leaf_sp", "leaf_sp", "leaf"), "summer": ("leaf", "leaf_b"), "autumn": ("ginkgo_au", "ginkgo_au", "leaf_au")}[se]
    m.ell(pal[0], (0, 0, 4.6), (1.25, 1.25, 2.3), blob=True, seed=3); m.ell(pal[1], (0.2, -0.3, 5.6), (0.9, 0.9, 1.4), blob=True, seed=4)
    m.ell(pal[-1], (-0.3, 0.2, 3.7), (1.0, 1.0, 1.0), blob=True, seed=6)
@piece("bench", rots=(0, 2, 4, 6), foot=[-0.9, -0.3, 0.9, 0.3])
def _(m, st, se, v):
    for x in (-0.75, 0.75): m.box("steel_dk", (x - 0.04, -0.28, 0), (x + 0.04, 0.28, 0.44)); m.box("steel_dk", (x - 0.04, 0.2, 0.44), (x + 0.04, 0.28, 0.85))
    for i in range(4): m.box("wood", (-0.9, -0.28 + i * 0.12, 0.4), (0.9, -0.18 + i * 0.12, 0.45))
    for i in range(2): m.box("wood", (-0.9, 0.23, 0.55 + i * 0.14), (0.9, 0.29, 0.65 + i * 0.14))
@piece("lamp_park", foot=[-0.15, -0.15, 0.15, 0.15])
def _(m, st, se, v):
    m.cyl("pole", (0, 0), 0.2, 0, 0.25, segs=8); m.cyl("pole", (0, 0), 0.06, 0, 3.6, segs=6)
    m.cyl("lamp_w", (0, 0), 0.2, 3.6, 4.05, segs=8); m.cyl("pole", (0, 0), 0.26, 4.05, 4.12, segs=8)
@piece("lamp_street", rots=(0, 2), foot=[-0.2, -0.2, 0.2, 0.2])
def _(m, st, se, v):
    m.cyl("pole", (0, 0), 0.14, 0, 9.5, segs=8); m.box("pole", (-0.2, -0.2, 0), (0.2, 0.2, 0.6))
    for sgn in (-1, 1):
        m.box("pole", (0, -0.05, 9.2), (sgn * 1.9, 0.05, 9.32)) if sgn > 0 else m.box("pole", (-1.9, -0.05, 9.2), (0, 0.05, 9.32))
        m.box("lamp_c", (sgn * 1.9 - 0.45, -0.16, 9.06), (sgn * 1.9 + 0.45, 0.16, 9.2))
@piece("bollard", foot=[-0.12, -0.12, 0.12, 0.12])
def _(m, st, se, v): m.cyl("chrome", (0, 0), 0.11, 0, 0.85, segs=8); m.cyl("ink", (0, 0), 0.115, 0.7, 0.75, segs=8)
@piece("planter", rots=(0, 2), seasons=True, foot=[-1.2, -0.6, 1.2, 0.6])
def _(m, st, se, v):
    m.box("granite", (-1.2, -0.6, 0), (1.2, 0.6, 0.55)); m.box("soil", (-1.1, -0.5, 0.5), (1.1, 0.5, 0.56))
    rnd = random.Random(2)
    for i in range(9):
        x = -0.9 + i * 0.225; m.ell("shrub" if se != "winter" else "hedge", (x, rnd.uniform(-0.2, 0.2), 0.75), (0.32, 0.32, 0.3), blob=True, seed=i)
    if se in ("spring", "summer"):
        for i in range(7): m.ell("flower_r" if i % 2 else "flower_y", (-0.8 + i * 0.27, -0.35, 0.92), (0.1, 0.1, 0.08))
@piece("hedge", rots=(0, 2), seasons=True, foot=[-1.0, -0.35, 1.0, 0.35])
def _(m, st, se, v): m.box("hedge", (-1.0, -0.35, 0), (1.0, 0.35, 0.9)); m.box("granite_dk", (-1.0, -0.38, 0), (1.0, 0.38, 0.12))
@piece("bin", foot=[-0.45, -0.22, 0.45, 0.22])
def _(m, st, se, v):
    m.box("steel_dk", (-0.45, -0.22, 0), (0.45, 0.22, 0.05))
    m.box("bin_g", (-0.42, -0.2, 0.05), (-0.02, 0.2, 0.9)); m.box("bin_b", (0.02, -0.2, 0.05), (0.42, 0.2, 0.9)); m.box("steel", (-0.44, -0.21, 0.88), (0.44, 0.21, 0.95))
@piece("fountain", foot=[-4.2, -4.2, 4.2, 4.2])
def _(m, st, se, v):
    m.cyl("stone_w", (0, 0), 4.2, -0.2, 0.45, segs=16); m.cyl("water", (0, 0), 3.8, -0.2, 0.47, segs=16)
    m.cyl("stone_w", (0, 0), 1.6, 0, 0.9, segs=12); m.cyl("water", (0, 0), 1.4, 0, 0.92, segs=12)
    m.cyl("steel", (0, 0), 0.25, 0.9, 1.6, segs=8); m.cyl("chrome", (0, 0), 0.5, 1.6, 1.7, segs=10)
@piece("metro_exit", rots=(0, 6), foot=[-3.0, -1.8, 3.0, 2.2])
def _(m, st, se, v):      # glass canopy over the escalator, opening on the -y side (rot 0 faces south, rot 6 faces west)
    m.box("granite_dk", (-3.0, -1.8, 0), (3.0, 2.2, 0.25))
    for x in (-2.9, 2.75): m.box("steel", (x, -1.8, 0.25), (x + 0.15, 2.2, 3.2))
    m.box("glass", (-2.9, 2.05, 0.25), (2.9, 2.2, 3.1)); m.box("glass", (-3.0, -1.8, 0.25), (-2.85, 2.2, 3.1)); m.box("glass", (2.85, -1.8, 0.25), (3.0, 2.2, 3.1))
    m.box("steel", (-3.1, -1.95, 3.15), (3.1, 2.35, 3.45)); m.box("glass_dk", (-2.9, -1.8, 3.45), (2.9, 2.2, 3.6))
    m.box("metro_red", (-3.12, -1.98, 3.2), (3.12, -1.9, 3.42)); m.box("sign_lit", (-0.9, -2.0, 3.22), (0.9, -1.96, 3.4))
    m.box("black", (-2.6, -0.2, 0.0), (2.6, 2.0, 0.27))
    for i in range(6): m.box("steel_dk", (-2.4, 1.7 - i * 0.3, 0.27 - i * 0.04), (2.4, 2.0 - i * 0.3, 0.29 - i * 0.04))
    m.box("metro_red", (2.2, -1.75, 0.25), (2.5, -1.55, 2.4)); m.box("sign_lit", (2.18, -1.79, 1.9), (2.52, -1.75, 2.35))
@piece("brt_shelter", foot=[-12.0, -0.3, 12.0, 0.3])
def _(m, st, se, v):      # median BRT station canopy, 24 m along x
    for x in (-11.5, -5.75, 0, 5.75, 11.5): m.box("steel", (x - 0.12, -0.12, 0), (x + 0.12, 0.12, 3.4))
    m.box("steel", (-12.2, -1.6, 3.4), (12.2, 1.6, 3.6)); m.box("glass", (-12.0, -1.5, 3.6), (12.0, 1.5, 3.7))
    m.box("brt_red", (-12.25, -1.65, 3.38), (12.25, -1.55, 3.62))
    for x in (-8.6, 2.9): m.box("glass", (x, -0.05, 0.3), (x + 5.0, 0.05, 2.5))
    m.box("sign_lit", (-1.2, -1.7, 3.0), (1.2, -1.62, 3.38)); m.box("screen", (6.2, -0.1, 1.8), (7.4, 0.1, 2.5))
    for x in (-10, -4, 4, 9): m.box("wood", (x - 0.8, 0.15, 0.42), (x + 0.8, 0.5, 0.48)); m.box("steel_dk", (x - 0.05, 0.2, 0), (x + 0.05, 0.45, 0.42))
@piece("bus_shelter", rots=(0, 6), foot=[-3.0, 0.4, 3.0, 0.8])
def _(m, st, se, v):      # curbside shelter, back panel on +y, open to -y (the road side after rotation)
    for x in (-2.9, 2.75): m.box("steel", (x, 0.5, 0), (x + 0.15, 0.7, 2.7))
    m.box("glass", (-2.9, 0.62, 0.15), (2.9, 0.7, 2.5)); m.box("steel", (-3.2, -0.7, 2.7), (3.2, 0.9, 2.85)); m.box("glass", (-3.1, -0.6, 2.85), (3.1, 0.8, 2.9))
    m.box("sign_lit", (2.0, 0.55, 0.3), (2.9, 0.6, 2.0)); m.box("wood", (-2.0, 0.25, 0.42), (1.2, 0.6, 0.48))
    m.cyl("steel", (-3.4, -0.4), 0.05, 0, 3.0, segs=6); m.box("sign_lit", (-3.8, -0.45, 2.4), (-3.0, -0.35, 3.1))
@piece("cafe_set", vars_=("base", "b"), foot=[-0.9, -0.9, 0.9, 0.9])
def _(m, st, se, v):
    m.cyl("steel_dk", (0, 0), 0.05, 0, 0.72, segs=6); m.cyl("stone_w", (0, 0), 0.38, 0.72, 0.76, segs=10)
    for a in (0.6, 3.7):
        x, y = math.cos(a) * 0.62, math.sin(a) * 0.62; m.box("cafe_chair", (x - 0.2, y - 0.2, 0.42), (x + 0.2, y + 0.2, 0.46))
        for dx in (-0.17, 0.17):
            for dy in (-0.17, 0.17): m.box("cafe_chair", (x + dx - 0.02, y + dy - 0.02, 0), (x + dx + 0.02, y + dy + 0.02, 0.42))
        m.box("cafe_chair", (x - 0.2, y + 0.16 * (1 if y > 0 else -1) - 0.02, 0.46), (x + 0.2, y + 0.16 * (1 if y > 0 else -1) + 0.02, 0.85))
    m.cyl("steel", (0, 0), 0.03, 0.76, 2.3, segs=6)
    pm = "parasol_a" if v == "base" else "parasol_b"
    m.cyl(pm, (0, 0), 1.35, 2.2, 2.3, segs=8); m.cyl(pm, (0, 0), 0.9, 2.3, 2.42, segs=8); m.cyl(pm, (0, 0), 0.4, 2.42, 2.52, segs=8)
@piece("kiosk", rots=(0, 6), foot=[-1.6, -1.1, 1.6, 1.1])
def _(m, st, se, v):      # coffee / newsstand kiosk, counter on -y
    m.box("kiosk", (-1.6, -1.1, 0), (1.6, 1.1, 2.6)); m.box("kiosk_lit", (-1.4, -1.12, 1.0), (1.4, -1.1, 2.1)); m.box("stone_w", (-1.5, -1.35, 0.95), (1.5, -1.1, 1.02))
    m.box("stone_w", (-1.75, -1.25, 2.6), (1.75, 1.25, 2.8)); m.box("sign_lit", (-1.2, -1.27, 2.62), (1.2, -1.25, 2.78))
@piece("sculpture", foot=[-1.6, -0.8, 1.6, 0.8])
def _(m, st, se, v):      # 「云汇之环」 polished stainless ring on a granite plinth
    m.box("granite_dk", (-1.6, -0.8, 0), (1.6, 0.8, 0.6))
    for i in range(20):
        a = i / 20 * 6.283; x = math.cos(a) * 1.55; z = 2.35 + math.sin(a) * 1.55
        m.box("chrome", (x - 0.24, -0.22, z - 0.24), (x + 0.24, 0.22, z + 0.24), yaw=0)
@piece("busker", foot=[-0.6, -0.4, 0.6, 0.4])
def _(m, st, se, v):      # busker kit: amp, open guitar case, mic stand
    m.box("amp", (-0.6, -0.2, 0), (-0.15, 0.2, 0.55)); m.box("black", (-0.55, -0.205, 0.08), (-0.2, -0.2, 0.45))
    m.box("black", (0.0, -0.4, 0), (0.6, -0.05, 0.08)); m.box("red", (0.05, -0.36, 0.06), (0.55, -0.09, 0.085))
    m.cyl("steel_dk", (0.35, 0.25), 0.02, 0, 1.5, segs=4); m.cyl("ink", (0.35, 0.25), 0.04, 1.5, 1.6, segs=6)
@piece("signal", rots=(0, 2, 4, 6), foot=[-0.2, -0.2, 0.2, 0.2])
def _(m, st, se, v):      # traffic signal mast: pole + arm along +x (lamps are drawn live by js/cbd.js)
    m.cyl("pole", (0, 0), 0.15, 0, 6.2, segs=8); m.box("pole", (0, -0.06, 5.9), (6.5, 0.06, 6.05))
    for x in (3.2, 6.0): m.box("black", (x - 0.2, -0.25, 5.2), (x + 0.2, -0.05, 6.0))
    m.box("black", (-0.18, -0.36, 2.3), (0.18, -0.15, 3.0))
@piece("totem", rots=(0, 6), foot=[-0.4, -0.15, 0.4, 0.15])
def _(m, st, se, v): m.box("steel_dk", (-0.4, -0.15, 0), (0.4, 0.15, 2.4)); m.box("sign_lit", (-0.34, -0.16, 0.8), (0.34, -0.15, 2.2)); m.box("blue", (-0.4, -0.16, 2.2), (0.4, 0.15, 2.4))
@piece("taxi_sign", foot=[-0.1, -0.1, 0.1, 0.1])
def _(m, st, se, v): m.cyl("steel", (0, 0), 0.05, 0, 2.6, segs=6); m.box("brass", (-0.45, -0.05, 2.2), (0.45, 0.05, 2.8)); m.box("sign_lit", (-0.4, -0.06, 2.25), (0.4, -0.05, 2.75))
@piece("flowerbed", rots=(0,), seasons=True, foot=[-2.0, -2.0, 2.0, 2.0])
def _(m, st, se, v):
    m.cyl("granite", (0, 0), 2.0, 0, 0.45, segs=12); m.cyl("soil", (0, 0), 1.85, 0, 0.47, segs=12)
    rnd = random.Random(7)
    for i in range(16):
        a = rnd.uniform(0, 6.283); d = rnd.uniform(0, 1.5)
        k = ("flower_r", "flower_y", "shrub")[i % 3] if se in ("spring", "summer") else ("shrub" if se == "autumn" else "hedge")
        m.ell(k, (math.cos(a) * d, math.sin(a) * d, 0.62), (0.3, 0.3, 0.22), blob=True, seed=i)
@piece("brt_bus", rots=(0, 2, 4, 6), foot=[-9.0, -1.3, 9.0, 1.3])
def _(m, st, se, v):      # 18 m articulated BRT bus along +x (front at +x)
    for (a, b) in ((-9.0, -0.4), (0.4, 9.0)):
        m.box("brt_body", (a, -1.25, 0.35), (b, 1.25, 3.05)); m.box("glass_dk", (a + 0.2, -1.27, 1.25), (b - 0.2, 1.27, 2.55))
        m.box("brt_band", (a, -1.27, 0.75), (b, 1.27, 1.05)); m.box("steel", (a + 0.3, -1.0, 3.05), (b - 0.3, 1.0, 3.3))
    m.box("rubber", (-0.4, -1.15, 0.4), (0.4, 1.15, 2.9)); m.box("glass_dk", (8.98, -1.15, 1.0), (9.05, 1.15, 2.8)); m.box("headl", (8.98, -1.1, 0.5), (9.04, -0.7, 0.75)); m.box("headl", (8.98, 0.7, 0.5), (9.04, 1.1, 0.75))
    m.box("sign_lit", (8.9, -0.8, 2.82), (9.05, 0.8, 3.0))
    for x in (-7.0, -1.8, 6.6):
        for y in (-1.2, 1.0): m.cyl("tire", (x, y + 0.1), 0.48, 0, 0.0001, segs=0) if False else m.box("tire", (x - 0.48, y, 0), (x + 0.48, y + 0.2, 0.75))
@piece("dog", rots=tuple(range(8)), states=("w0", "w1"), foot=[-0.3, -0.12, 0.3, 0.12], vars_=("base", "w"))
def _(m, st, se, v):      # small dog (柯基 / 比熊) facing +x, two walk frames
    c = "dog_a" if v == "base" else "dog_b"; ph = 1 if st == "w1" else -1
    m.box(c, (-0.28, -0.11, 0.18), (0.22, 0.11, 0.38)); m.box(c, (0.16, -0.1, 0.3), (0.38, 0.1, 0.5)); m.box("ink", (0.37, -0.03, 0.38), (0.41, 0.03, 0.43))
    m.box(c, (0.2, -0.1, 0.48), (0.26, -0.04, 0.56)); m.box(c, (0.2, 0.04, 0.48), (0.26, 0.1, 0.56)); m.box(c, (-0.34, -0.03, 0.32), (-0.26, 0.03, 0.42))
    for x, y, s in ((0.14, -0.08, 1), (0.14, 0.04, -1), (-0.22, -0.08, -1), (-0.22, 0.04, 1)):
        dx = 0.05 * ph * s; m.box(c, (x + dx - 0.03, y, 0), (x + dx + 0.03, y + 0.05, 0.2))

def build_kit(scene_props_seasonal=True):
    out = []        # (key, render)
    for name, P in PIECES.items():
        for v in P["vars"]:
            for st in P["states"]:
                for se in (SEASONS if P["seasons"] else [None]):
                    for rot in P["rots"]:
                        m = R.Model(rot); P["fn"](m, st, se or "summer", v)
                        r = R.render(m, MATS, shadow=name not in ("dog",))
                        geo = [min(c[i] for p in m.prims for c in p.corners()) for i in range(3)] + [max(c[i] for p in m.prims for c in p.corners()) for i in range(3)]
                        key = f"{name}/{v}/{st}/{se or '-'}/{rot}"; r["geo"] = [round(g, 2) for g in geo]; out.append((key, r))
    return out

# ============================================================== ground textures (seamless 128 x 64 screen tiles)
def hash2(a, b): return ((a * 73856093) ^ (b * 19349663)) % 1000 / 1000.0
def gtex():
    T = {}
    def cells(x, y, s):           # lattice-periodic cell ids (period 2 m on both diagonals)
        cx = np.floor(x / s).astype(int); cy = np.floor(y / s).astype(int); n = int(round(4 / s))
        return ((cx + cy) % n + n) % n, ((cx - cy) % n + n) % n
    def noise(x, y, s, k):
        a, b = cells(x, y, s); return (((a * 7919 + b * 104729 + k * 31) * 2654435761) % 1000) / 1000.0
    def grid(x, y, s, w):
        fx = np.abs(((x / s) % 1) - 0.5); fy = np.abs(((y / s) % 1) - 0.5); return (fx > 0.5 - w) | (fy > 0.5 - w)
    def mix(c, n, amp): c = np.array(c, float); return c[None, None, :] * (1 + (n[..., None] - 0.5) * amp)
    def paver(base, joint, s, amp=0.08):
        def f(x, y):
            col = mix(base, noise(x, y, s, 1), amp); g = grid(x, y, s, 0.035 / s * 1.0)
            return np.where(g[..., None], np.array(joint, float)[None, None], col)
        return f
    T["paver"] = paver((214, 210, 202), (176, 172, 166), 0.5)          # light granite sidewalk
    T["plaza"] = paver((228, 222, 210), (190, 184, 172), 1.0, 0.06)    # cream limestone plaza, 1 m slabs
    T["plaza_dk"] = paver((150, 154, 160), (120, 124, 130), 1.0, 0.07)  # dark granite bands
    T["street"] = paver((206, 196, 184), (168, 158, 148), 0.5, 0.1)    # pedestrian street warm stone
    def asphalt(c):
        def f(x, y):
            n = noise(x, y, 0.25, 3) * 0.6 + noise(x, y, 0.5, 5) * 0.4; return mix(c, n, 0.10)
        return f
    T["asphalt"] = asphalt((70, 72, 78)); T["brt"] = asphalt((150, 62, 56)); T["intersection"] = asphalt((76, 78, 84))
    def grass(c, stripe=False):
        def f(x, y):
            n = noise(x, y, 0.25, 7) * 0.7 + noise(x, y, 1.0, 2) * 0.3; col = mix(c, n, 0.16)
            if stripe: col = np.where(((np.floor((x + y) / 2.0) % 2) == 0)[..., None], col * 1.06, col * 0.96)
            return col
        return f
    for se, c in (("spring", (110, 168, 74)), ("summer", (88, 150, 62)), ("autumn", (148, 150, 70)), ("winter", (150, 146, 112))):
        T["grass_" + se] = grass(c, True); T["lawn_" + se] = grass(tuple(int(v * 1.04) for v in c), False)
    T["path"] = lambda x, y: mix((196, 132, 102), noise(x, y, 0.25, 9), 0.1)                 # park path: red rubber/gravel
    T["deck"] = lambda x, y: np.where((((x * 4) % 1) < 0.1)[..., None], np.array((120, 84, 58.))[None, None], mix((170, 124, 84), noise(x, y, 0.25, 4), 0.12))
    T["water"] = lambda x, y: mix((70, 150, 196), noise(x, y, 0.5, 11), 0.08)
    T["track"] = lambda x, y: mix((190, 90, 72), noise(x, y, 0.25, 12), 0.08)
    T["soil"] = lambda x, y: mix((112, 90, 70), noise(x, y, 0.25, 13), 0.15)
    T["roof"] = lambda x, y: mix((170, 174, 178), noise(x, y, 0.5, 14), 0.06)
    T["city"] = paver((168, 168, 170), (150, 150, 152), 2.0, 0.05)   # far city blocks
    return {k: R.ground_tile(f) for k, f in T.items()}

# ============================================================== facade module textures (u x z texels: 32 / m along the face, 39.19 / m up)
FAC = {
 # style: module w m, floor h m, glass top/bottom colours, frame colour, spandrel (h fraction, colour), mullion step m, fin
 "glass_blue":   dict(w=3.0, h=4.2, g0=(120, 190, 226), g1=(70, 130, 176), fr=(214, 224, 232), sp=(0.16, (92, 112, 134)), mul=1.5),
 "glass_teal":   dict(w=3.0, h=4.2, g0=(130, 210, 214), g1=(64, 140, 156), fr=(226, 232, 234), sp=(0.12, (70, 102, 112)), mul=1.0),
 "glass_silver": dict(w=3.0, h=4.2, g0=(196, 214, 228), g1=(126, 146, 168), fr=(236, 238, 240), sp=(0.22, (160, 168, 178)), mul=1.5),
 "glass_gold":   dict(w=3.0, h=4.2, g0=(232, 214, 168), g1=(150, 126, 90), fr=(214, 188, 128), sp=(0.14, (120, 100, 70)), mul=1.0, fin=(196, 168, 108)),
 "glass_green":  dict(w=3.0, h=4.2, g0=(150, 214, 190), g1=(66, 136, 120), fr=(224, 232, 228), sp=(0.15, (64, 96, 90)), mul=1.5, fin=(236, 240, 238)),
 "stone_grid":   dict(w=3.0, h=4.0, g0=(150, 186, 210), g1=(80, 112, 140), fr=(232, 226, 214), sp=(0.34, (232, 226, 214)), mul=3.0, pier=0.5),
 "dark_glass":   dict(w=3.0, h=4.2, g0=(92, 120, 150), g1=(40, 54, 76), fr=(120, 130, 142), sp=(0.1, (48, 56, 70)), mul=1.5),
 "diagrid":      dict(w=4.5, h=4.5, g0=(150, 206, 236), g1=(86, 146, 196), fr=(236, 240, 244), sp=(0.08, (110, 140, 170)), mul=1.5, diag=(238, 242, 246)),
 "lobby":        dict(w=3.0, h=10.0, g0=(170, 214, 236), g1=(110, 160, 196), fr=(200, 206, 212), sp=(0.06, (60, 66, 76)), mul=1.5, lobby=1),
 "mall_glass":   dict(w=6.0, h=6.0, g0=(176, 220, 240), g1=(120, 170, 206), fr=(236, 232, 224), sp=(0.2, (238, 232, 220)), mul=2.0),
 "mall_stone":   dict(w=6.0, h=6.0, g0=(236, 230, 218), g1=(220, 212, 198), fr=(236, 230, 218), sp=(1.0, (232, 226, 214)), mul=6.0, led=1),
 "stadium":      dict(w=3.0, h=6.0, g0=(70, 96, 130), g1=(40, 56, 80), fr=(246, 248, 250), sp=(0.0, (0, 0, 0)), mul=3.0, rib=1),
 "shop_a": dict(w=6.0, h=5.0, shop=((230, 226, 218), (30, 30, 34), (226, 190, 120))),
 "shop_b": dict(w=6.0, h=5.0, shop=((40, 42, 48), (232, 210, 160), (250, 236, 200))),
 "shop_c": dict(w=6.0, h=5.0, shop=((214, 196, 176), (120, 60, 50), (255, 220, 170))),
 "shop_d": dict(w=6.0, h=5.0, shop=((242, 242, 244), (40, 90, 140), (200, 230, 255))),
 "shop_e": dict(w=6.0, h=5.0, shop=((196, 170, 132), (40, 40, 40), (255, 200, 140))),
 "apt":    dict(w=3.0, h=3.2, g0=(176, 206, 222), g1=(110, 140, 160), fr=(238, 236, 230), sp=(0.3, (238, 236, 230)), mul=3.0, pier=0.8, balc=1),
}
def facade(name, S):
    W = int(round(S["w"] * 32)); H = int(round(S["h"] * R.PZ)); img = np.zeros((H, W, 4)); em = np.zeros((H, W, 4))
    yy, xx = np.mgrid[0:H, 0:W]; u = (xx + 0.5) / 32.0; v = (H - yy - 0.5) / R.PZ        # metres, v up from floor
    if "shop" in S:                                   # boutique storefront: stone frame, tall display glass, lit window display, sign band
        st, ac, lit = [np.array(c, float) for c in S["shop"]]
        img[..., :3] = st; img[..., 3] = 255
        win = (u > 0.35) & (u < S["w"] - 0.35) & (v > 0.25) & (v < 3.6)
        gl = np.array((150, 190, 210.)) * (0.75 + 0.25 * (v / 3.6))[..., None]
        img[win, :3] = gl[win]
        disp = win & (v < 2.4)
        img[disp, :3] = img[disp, :3] * 0.6 + np.array((250, 240, 220.)) * 0.4
        mull = win & (np.abs(u - S["w"] / 2) < 0.06); img[mull, :3] = ac
        band = (v > 3.85) & (v < 4.6) & (u > 0.5) & (u < S["w"] - 0.5); img[band, :3] = ac
        em[disp, :3] = lit; em[disp, 3] = 230; em[band & (np.abs(u - S["w"] / 2) < 1.6) & (v > 4.0) & (v < 4.45), :3] = (255, 252, 236); em[band & (np.abs(u - S["w"] / 2) < 1.6) & (v > 4.0) & (v < 4.45), 3] = 255
        door = (np.abs(u - S["w"] / 2) < 0.7) & (v < 2.6) & (v > 0.0); img[door, :3] = img[door, :3] * 0.8
        refl = win & ((((u * 0.7 + v * 0.35) % 2.2) < 0.18)); img[refl, :3] = np.minimum(255, img[refl, :3] + 40)
        return img.astype(np.uint8), em.astype(np.uint8), [0.35, 0.25, S["w"] - 0.35, 3.6]
    g0, g1, fr = [np.array(c, float) for c in (S["g0"], S["g1"], S["fr"])]
    t = (v / S["h"])[..., None]; glass = g1 * (1 - t) + g0 * t
    refl = ((u * 0.5 + v * 0.22) % 3.1) < 0.35; glass = np.where(refl[..., None], np.minimum(255, glass + 26), glass)
    img[..., :3] = glass; img[..., 3] = 255
    spf, spc = S["sp"]; spand = v < spf * S["h"]; img[spand, :3] = np.array(spc, float) * (0.92 + 0.08 * (u[spand] % 1.5) / 1.5)[..., None]
    winmask = ~spand
    mul = (u % S["mul"]) < 0.09; img[mul, :3] = fr; winmask &= ~mul
    edge = (v % S["h"]) > S["h"] - 0.08; img[edge, :3] = fr * 0.9; winmask &= ~edge
    if S.get("pier"):
        p = (u % S["mul"]) < S["pier"]; img[p, :3] = fr * (0.96 + 0.04 * ((v[p] * 3) % 1))[..., None]; winmask &= ~p
    if S.get("fin"):
        f = ((u % S["mul"]) < 0.16); img[f, :3] = np.array(S["fin"], float); winmask &= ~f
    if S.get("diag"):
        d1 = np.abs(((u - v) % S["w"]) - S["w"] / 2) > S["w"] / 2 - 0.16; d2 = np.abs(((u + v) % S["w"]) - S["w"] / 2) > S["w"] / 2 - 0.16
        d = d1 | d2; img[d, :3] = np.array(S["diag"], float); winmask &= ~d
    if S.get("rib"):
        r = (u % S["mul"]) < 0.55; img[r, :3] = fr * (0.9 + 0.1 * (u[r] % 0.55) / 0.55)[..., None]; winmask &= ~r
    if S.get("led"):
        strip = (v > 5.2) & (v < 5.4); img[strip, :3] = (250, 250, 246); em[strip, :3] = (180, 220, 255); em[strip, 3] = 255; winmask[:] = False
        slot = (v > 1.0) & (v < 4.6) & ((u % 6.0) > 0.6) & ((u % 6.0) < 1.0); img[slot, :3] = (120, 150, 170); winmask |= slot
    if S.get("lobby"):
        door = (v < 3.0) & ((u % 3.0) > 0.7) & ((u % 3.0) < 2.3); img[door, :3] = img[door, :3] * 0.85
        tr = (v > 3.3) & (v < 3.45); img[tr, :3] = fr; winmask &= ~tr
    if S.get("balc"):
        b = (v > 0.0) & (v < 1.0) & ((u % 3.0) > 0.9); img[b, :3] = img[b, :3] * 0.6 + np.array((230, 236, 240.)) * 0.4
    em[winmask, :3] = (255, 226, 160); em[winmask, 3] = 255
    return img.astype(np.uint8), em.astype(np.uint8), None

# ============================================================== atlas packing
def pack(items, W=2048):
    """items: list of (key, rgba array) -> positions dict, height"""
    order = sorted(items, key=lambda kv: -kv[1].shape[0]); pos = {}; x = y = rowh = 0
    for k, a in order:
        h, w = a.shape[:2]
        if x + w > W: x = 0; y += rowh + 1; rowh = 0
        pos[k] = (x, y); x += w + 1; rowh = max(rowh, h)
    return pos, y + rowh + 1


# ============================================================== 3. layout (metres: x east, y north; camera looks NE)
B = [0, 0, 360, 360]                     # walkable bounds
EXT = [-120, -120, 800, 800]             # rendered city extent (far zoom / skyline)
def rect(x0, y0, x1, y1): return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]
def ellipse(cx, cy, rx, ry, n=24, a0=0.0): return [[round(cx + rx * math.cos(a0 + i / n * 6.2832), 2), round(cy + ry * math.sin(a0 + i / n * 6.2832), 2)] for i in range(n)]
def strip(pts, w):
    out = []
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        dx, dy = x1 - x0, y1 - y0; L = math.hypot(dx, dy) or 1; nx, ny = -dy / L * w / 2, dx / L * w / 2; ex, ey = dx / L * w / 2, dy / L * w / 2
        out.append([[x0 - ex + nx, y0 - ey + ny], [x1 + ex + nx, y1 + ey + ny], [x1 + ex - nx, y1 + ey - ny], [x0 - ex - nx, y0 - ey - ny]])
    return out
def segdist(px, py, a, b):
    (x0, y0), (x1, y1) = a, b; dx, dy = x1 - x0, y1 - y0; L = dx * dx + dy * dy or 1
    t = max(0, min(1, ((px - x0) * dx + (py - y0) * dy) / L)); return math.hypot(px - x0 - dx * t, py - y0 - dy * t)

# ---------------- tower geometry (ORIGINAL distinctive silhouettes for the top 15) ----------------
def tower_geom(t, rnd):
    """parts: shape rect | oct | circ (+ optional cx/cy shift for twist/lean); z0,z1,style; crown/spire/cutout flags."""
    x, y, h, s = t["x"], t["y"], t["h"], t["size"]; P = []; asp = t.get("asp", 1.0)
    def add(shape, half, z0, z1, style, cx=None, cy=None, **k):
        hx, hy = half if isinstance(half, tuple) else (half, half)
        ox, oy = (cx if cx is not None else x), (cy if cy is not None else y)
        p = {"shape": shape, "z0": round(z0, 1), "z1": round(z1, 1), "style": style}
        if shape == "circ": p.update(cx=round(ox, 2), cy=round(oy, 2), r=round(hx, 2), n=k.pop("n", 20))
        else: p.update(x0=round(ox - hx, 2), y0=round(oy - hy, 2), x1=round(ox + hx, 2), y1=round(oy + hy, 2))
        if shape == "oct": p["c"] = round(k.pop("c", min(hx, hy) * 0.28), 2)
        p.update(k); P.append(p)
    st = t["style"]; lob = 10.0 if t.get("walk") else 0
    if lob: add(t.get("shape", "rect"), (s / 2 - 1.0, s * asp / 2 - 1.0), 0, lob, "lobby", lobby=True)
    kind = t["id"]
    # ---- landmark + 14 unique skyline towers ----
    if kind == "tianshu":                       # 天枢: chamfered square, 5 setbacks, colour lantern, needle spire 648 m
        for z0, z1, k in ((lob, 180, 1.0), (180, 320, 0.86), (320, 440, 0.72), (440, 540, 0.58), (540, 590, 0.44)):
            add("oct", s / 2 * k, z0, z1, st, c=s / 2 * k * 0.32)
        add("oct", s / 2 * 0.36, 590, 612, "glass_teal", c=4, crown="lantern")
        add("circ", 1.6, 612, 648, "glass_silver", n=8, spire=True)
    elif kind == "kunpeng":                     # 鲲鹏: asymmetric stepped sail + twin crown fins
        a = s / 2
        add("rect", (a, a), lob, 210, st); add("rect", (a, a * 0.55), 210, 360, st, cy=y - a * 0.2)
        add("rect", (a * 0.75, a * 0.4), 360, 470, st, cy=y - a * 0.35); add("rect", (a * 0.5, a * 0.28), 470, 530, "glass_silver", cy=y - a * 0.45, crown="lantern")
        add("rect", (a * 0.08, a * 0.28), 530, 568, "glass_silver", cx=x - a * 0.35, cy=y - a * 0.45, crown="fin")
        add("rect", (a * 0.08, a * 0.28), 530, 556, "glass_silver", cx=x + a * 0.18, cy=y - a * 0.45, crown="fin")
    elif kind == "xinglan":                     # 星澜: stacked cylinders, flared ring, mast
        for z0, z1, k in ((lob, 180, 1.0), (180, 320, 0.86), (320, 430, 0.7), (430, 500, 0.55)):
            add("circ", s / 2 * k, z0, z1, st, n=22)
        add("circ", s / 2 * 0.7, 500, 510, "glass_teal", n=22, crown="ring"); add("circ", 1.2, 510, 532, "glass_silver", n=8, spire=True)
    elif kind == "yuheng":                      # 玉衡: twisted stack (centre drifts each tier) + diamond crown
        for i, (z0, z1, k) in enumerate(((lob, 160, 1.0), (160, 280, 0.9), (280, 380, 0.78), (380, 450, 0.64))):
            dx = (i - 1.5) * s * 0.06; dy = (i - 1.5) * s * 0.04
            add("rect", (s / 2 * k, s / 2 * k * 0.72), z0, z1, st, cx=x + dx, cy=y + dy)
        add("oct", s / 2 * 0.42, 450, 488, "glass_gold", c=5, crown="lantern")
    elif kind == "huichao":                     # 汇潮: deep setbacks + glowing atrium slot through the core
        a = s / 2
        add("rect", (a, a * 0.9), lob, 140, st)
        add("rect", (a * 0.35, a * 0.9), 140, 320, st, cx=x - a * 0.55)   # west wing
        add("rect", (a * 0.35, a * 0.9), 140, 320, st, cx=x + a * 0.55)   # east wing (slot between)
        add("rect", (a * 0.85, a * 0.75), 320, 420, st)
        add("rect", (a * 0.55, a * 0.5), 420, 466, "glass_teal", crown="lantern")
    elif kind == "yunfan":                      # 云帆: leaning blade (offset taper) + knife-edge crown
        for i, (z0, z1, k) in enumerate(((lob, 150, 1.0), (150, 280, 0.82), (280, 380, 0.62), (380, 420, 0.4))):
            add("rect", (s / 2 * k * 0.55, s / 2 * k), z0, z1, st, cx=x + i * s * 0.05)
        add("rect", (s / 2 * 0.18, s / 2 * 0.28), 420, 442, "dark_glass", cx=x + s * 0.2, crown="fin")
    elif kind == "liuli":                       # 琉璃: crystal octagon taper + prism apex
        for z0, z1, k in ((lob, 140, 1.0), (140, 260, 0.85), (260, 360, 0.68), (360, 400, 0.5)):
            add("oct", s / 2 * k, z0, z1, "glass_gold", c=s / 2 * k * 0.35)
        add("oct", s / 2 * 0.32, 400, 418, "glass_gold", c=3, crown="lantern")
    elif kind == "hongtu":                      # 鸿图: wide podium + twin towers linked by skybridge
        a = s / 2
        add("rect", (a * 1.15, a * 0.7), lob, 40, "lobby")
        add("rect", (a * 0.4, a * 0.55), 40, 280, st, cx=x - a * 0.55)
        add("rect", (a * 0.4, a * 0.55), 40, 280, st, cx=x + a * 0.55)
        add("rect", (a * 1.05, a * 0.2), 210, 225, "glass_silver")       # skybridge
        add("rect", (a * 0.32, a * 0.4), 280, 402, "glass_teal", cx=x - a * 0.55, crown="lantern")
        add("rect", (a * 0.32, a * 0.4), 280, 380, st, cx=x + a * 0.55)
    elif kind == "lanting":                     # 澜庭: soft cylinder with mid-belly flare + ring crown
        for z0, z1, k in ((lob, 120, 0.85), (120, 220, 1.0), (220, 320, 0.8), (320, 370, 0.55)):
            add("circ", s / 2 * k, z0, z1, st, n=20)
        add("circ", s / 2 * 0.62, 370, 386, "glass_teal", n=18, crown="ring")
    elif kind == "lingxiao":                    # 凌霄: sharp triangular feel (narrow asp) + spire
        for z0, z1, k in ((lob, 140, 1.0), (140, 250, 0.78), (250, 330, 0.55)):
            add("rect", (s / 2 * k * 0.55, s / 2 * k), z0, z1, "dark_glass")
        add("circ", 1.0, 330, 364, "glass_silver", n=6, spire=True)
    elif kind == "yaoshi":                      # 曜石: dark stacked cubes with cantilevered upper block
        a = s / 2
        add("rect", (a, a), lob, 160, "dark_glass")
        add("rect", (a * 0.85, a * 0.85), 160, 260, "dark_glass", cx=x + a * 0.12)
        add("rect", (a * 0.7, a * 0.55), 260, 330, "dark_glass", cx=x - a * 0.15)
        add("rect", (a * 0.45, a * 0.4), 330, 348, "glass_gold", crown="lantern")
    elif kind == "haitang":                     # 海棠: petal plan (elongated oct) + petal crown
        for z0, z1, k in ((lob, 150, 1.0), (150, 260, 0.82), (260, 310, 0.62)):
            add("oct", (s / 2 * k, s / 2 * k * 0.7), z0, z1, "glass_green", c=s / 2 * k * 0.4)
        add("oct", (s / 2 * 0.4, s / 2 * 0.28), 310, 332, "glass_green", c=3, crown="lantern")
    elif kind == "xinghewan":                   # 星河湾: residential-like terraces (deep setbacks) + garden crown
        for z0, z1, k in ((lob, 80, 1.0), (80, 160, 0.9), (160, 230, 0.78), (230, 280, 0.64), (280, 310, 0.5)):
            add("rect", (s / 2 * k, s / 2 * k * 0.85), z0, z1, "apt")
        add("rect", (s / 2 * 0.35, s / 2 * 0.3), 310, 318, "stone_grid", roofbox=True, crown="mech")
    elif kind == "yunjin":                      # 云锦: woven diagrid-ish oct + lattice crown
        for z0, z1, k in ((lob, 140, 1.0), (140, 240, 0.88), (240, 290, 0.7)):
            add("oct", s / 2 * k, z0, z1, "diagrid", c=s / 2 * k * 0.25)
        add("oct", s / 2 * 0.45, 290, 308, "glass_silver", c=4, crown="lantern")
    elif kind == "qinglan":                     # 青岚: slim twin blades sharing a podium
        a = s / 2
        add("rect", (a * 1.05, a * 0.55), lob, 28, "lobby")
        add("rect", (a * 0.28, a * 0.5), 28, 260, "glass_teal", cx=x - a * 0.4)
        add("rect", (a * 0.28, a * 0.5), 28, 301, "glass_teal", cx=x + a * 0.4, crown="lantern")
    else:
        # mid/low ≤200 m — varied simple silhouettes
        shape = t.get("shape", "rect"); zc = lob
        silhouette = t.get("sil", "box")
        if silhouette == "taper":
            for i, k in enumerate((1.0, 0.82, 0.64)):
                z1 = h * (0.4 if i == 0 else 0.75 if i == 1 else 0.98)
                add(shape, (s / 2 * k, s / 2 * k * asp), zc, z1, st); zc = z1
        elif silhouette == "L":
            add("rect", (s / 2, s / 2 * asp), zc, h * 0.55, st)
            add("rect", (s / 2 * 0.45, s / 2 * asp), h * 0.55, h * 0.98, st, cx=x - s * 0.25)
        elif silhouette == "cyl":
            add("circ", s / 2 * 0.92, zc, h * 0.96, st, n=16)
        elif silhouette == "steps":
            for i, k in enumerate((1.0, 0.78, 0.55)):
                z1 = h * (0.45 if i == 0 else 0.75 if i == 1 else 0.97)
                add("rect", (s / 2 * k, s / 2 * k * asp), zc, z1, st); zc = z1
        else:
            add(shape, (s / 2, s / 2 * asp), zc, h * 0.97, st); zc = h * 0.97
        if t.get("crown") == "mech":
            add("rect", (s / 2 * 0.28, s / 2 * 0.22), zc, min(h, zc + 5), "stone_grid", roofbox=True)
        elif t.get("crown") == "lantern":
            add(shape, (s / 2 * 0.4, s / 2 * 0.4 * asp), zc, h, "glass_teal", crown="lantern")
    return P

def towers_table():
    return [dict(id=tid, name=name, use=use, floors=fl, height_m=h, cls=tclass(h)) for tid, name, use, fl, h in TOWERS]

def place_towers(table, rnd):
    """Space the skyline out: walkable-map anchors + sparse outer sites with plaza corridors between clusters."""
    by = {t["id"]: dict(t) for t in table}
    # four map anchors (kept walkable for lobbies)
    inmap = {
        "tianshu": (310, 360, 56, "oct", "diagrid"),
        "kunpeng": (216, 330, 48, "rect", "glass_silver"),
        "xinglan": (430, 260, 46, "circ", "glass_teal"),
        "huichao": (200, 250, 38, "rect", "glass_blue"),
    }
    out = []
    for tid, (x, y, sz, shape, style) in inmap.items():
        t = by.pop(tid); t.update(x=x, y=y, size=sz, shape=shape, style=style, walk=True, h=t["height_m"], asp=0.9 if tid == "huichao" else 1.0)
        out.append(t)
    # remaining top-15 hand-placed on sparse skyline sites (low screen-base first so landmark stays dominant)
    hand = {   # sparse ring — wide gaps between towers so the skyline isn't a packed wall
        "yuheng": (480, -80, 52, "rect", "glass_gold", 0.75),
        "yunfan": (-80, 480, 44, "rect", "dark_glass", 0.7),
        "liuli": (580, 80, 46, "oct", "glass_gold", 1.0),
        "hongtu": (80, 580, 50, "rect", "glass_blue", 0.85),
        "lanting": (580, 320, 44, "circ", "glass_teal", 1.0),
        "lingxiao": (320, 580, 40, "rect", "dark_glass", 0.55),
        "yaoshi": (560, 540, 42, "rect", "dark_glass", 1.0),
        "haitang": (-80, 200, 42, "oct", "glass_green", 0.75),
        "xinghewan": (200, -80, 44, "rect", "apt", 0.9),
        "yunjin": (440, 580, 42, "oct", "diagrid", 1.0),
        "qinglan": (600, 200, 40, "rect", "glass_teal", 0.8),
    }
    for tid, (x, y, sz, shape, style, asp) in hand.items():
        if tid not in by: continue
        t = by.pop(tid); t.update(x=x, y=y, size=sz, shape=shape, style=style, h=t["height_m"], asp=asp, walk=False)
        out.append(t)
    # fillers ≤200 m on a sparse grid (skip sites near anchors / plazas)
    sites = []
    for cx in range(-60, 740, 130):
        for cy in range(-60, 740, 130):
            if -20 <= cx <= 380 and -20 <= cy <= 380: continue       # keep a wide plaza corridor around the walkable map
            if any(abs(cx - t["x"]) < 100 and abs(cy - t["y"]) < 100 for t in out): continue
            sites.append((cx + rnd.uniform(-18, 18), cy + rnd.uniform(-18, 18)))
    sites.sort(key=lambda p: (p[0] + p[1]) + rnd.uniform(0, 40))
    rest = sorted(by.values(), key=lambda t: -t["height_m"])
    sils = ["box", "taper", "L", "cyl", "steps", "box", "taper"]
    styles = ["glass_blue", "glass_teal", "glass_silver", "glass_gold", "glass_green", "stone_grid", "dark_glass", "apt"]
    for i, t in enumerate(rest):
        if i >= len(sites): break
        x, y = sites[i]; h = t["height_m"]; sz = 28 + (h - 120) * 0.08
        shape = rnd.choice(["rect", "rect", "oct", "circ"])
        st = "apt" if "公寓" in t["use"] else rnd.choice(styles)
        t.update(x=round(x, 1), y=round(y, 1), size=round(sz, 1), shape=shape, style=st, h=h,
                 asp=round(rnd.uniform(0.65, 1.0), 2), sil=sils[i % len(sils)],
                 crown=rnd.choice(["mech", "mech", "lantern", None]), walk=False)
        out.append(t)
    fab = []   # sparse unnamed fabric 80-140 m, far corners only
    for i, (x, y) in enumerate(sites[len(rest):len(rest) + 8]):
        if abs(x - 300) + abs(y - 300) < 360: continue
        h = rnd.uniform(90, 140); sz = rnd.uniform(22, 30)
        fab.append(dict(id=f"fab{i}", x=round(x, 1), y=round(y, 1), size=round(sz, 1), shape=rnd.choice(["rect", "oct"]),
                        h=round(h, 1), style=rnd.choice(["apt", "stone_grid", "glass_silver", "dark_glass"]),
                        asp=round(rnd.uniform(0.65, 1.0), 2), sil=rnd.choice(["box", "taper", "steps"]), crown="mech", fab=True))
    for t in out + fab: t["parts"] = tower_geom(t, rnd)
    return out, fab

def layout(rules_cbd):
    rnd = random.Random(20261010)
    Z = []
    def zone(mat, poly): Z.append({"m": mat, "p": [[round(a, 2), round(b, 2)] for a, b in poly]})
    zone("city", rect(*EXT))
    for v in (-20, 360, 460, 560, 660, 760):
        zone("asphalt", rect(v, EXT[1], v + 20, EXT[3])); zone("asphalt", rect(EXT[0], v, EXT[2], v + 20))
    zone("plaza", rect(*B))
    zone("plaza", rect(-40, -40, 0, 400)); zone("plaza", rect(360, -40, 400, 400))
    zone("plaza", rect(-40, -40, 400, 0)); zone("plaza", rect(-40, 360, 400, 400))
    # ---- 中央公园 (SW) — inspired by Central Park / 人才公园 / 花城广场 (original layout)
    # large lake with island + bridges, lawn amphitheatre, tree alleys, flower beds, jogging loop, boardwalk, café kiosks, landmark plaza
    zone("grass", rect(0, 3, 146, 146))
    zone("plaza", rect(108, 108, 148, 148))                                       # SE landmark plaza
    zone("plaza", ellipse(64, 68, 50, 42, 36))                                    # stone shoreline ring
    zone("water", ellipse(64, 68, 46, 38, 40))                                    # large central lake
    zone("grass", ellipse(58, 62, 10, 7, 16))                                     # island A
    zone("grass", ellipse(78, 78, 7, 5.5, 14))                                    # island B
    zone("deck", rect(52, 58, 64, 62))                                            # bridge → island A
    zone("deck", rect(68, 70, 78, 74))                                            # bridge → island B
    zone("deck", rect(40, 28, 88, 36))                                            # north lakeside boardwalk
    zone("deck", rect(100, 52, 112, 88))                                          # east boardwalk
    zone("deck", rect(48, 100, 80, 108))                                          # south pier / pier café deck
    # lawn amphitheatre (terraced arcs on the west shore)
    zone("lawn", ellipse(28, 68, 18, 22, 20))
    zone("plaza_dk", ellipse(32, 68, 12, 14, 16))
    zone("lawn", ellipse(118, 28, 14, 11, 14)); zone("lawn", ellipse(20, 120, 12, 14, 14))
    # tree alleys (N–S and E–W through the park)
    for pl in ([[20, 40], [100, 40]], [[40, 20], [40, 110]], [[90, 30], [90, 100]]):
        for q in strip(pl, 5.5): zone("path", q)
    jog = ellipse(64, 68, 56, 48, 36)                                             # jogging / cycling loop
    loop = ellipse(64, 68, 50, 42, 32)                                            # lakeside promenade
    paths = [jog + [jog[0]], loop + [loop[0]],
             [(64, 116), (64, 148)], [(116, 68), (148, 68)], [(104, 104), (128, 128), (148, 148)],
             [(16, 68), (2, 68)], [(64, 20), (64, 3)]]
    for pl in paths:
        for q in strip(pl, 3.2): zone("path", q)
    # ---- avenues
    zone("paver", rect(0, 148, 360, 155)); zone("paver", rect(0, 187, 360, 194)); zone("paver", rect(148, 0, 155, 360)); zone("paver", rect(181, 0, 188, 360))
    zone("asphalt", rect(0, 155, 360, 187)); zone("asphalt", rect(155, 0, 181, 360))
    for x0, x1 in ((0, 155), (181, 360)):
        zone("brt", rect(x0, 166, x1, 169.5)); zone("brt", rect(x0, 172.5, x1, 176))
    zone("grass", rect(0, 169.5, 110, 172.5)); zone("plaza_dk", rect(110, 169.5, 149, 172.5)); zone("grass", rect(188, 169.5, 360, 172.5))
    zone("grass", rect(166, 0, 170, 143)); zone("grass", rect(166, 199, 170, 360))
    zone("intersection", rect(155, 155, 181, 187))
    # ---- SE 臻品街 + 云汇天地, NW stadium, NE towers
    zone("street", rect(188, 110, 360, 128)); zone("plaza_dk", rect(188, 118.6, 360, 119.4))
    zone("plaza_dk", ellipse(74, 280, 64, 56, 32)); zone("plaza", ellipse(74, 280, 61, 53, 32))
    for q in strip([(258, 194), (258, 360)], 4) + strip([(188, 262), (360, 262)], 4): zone("plaza_dk", q)
    # ---- markings: [kind, x0, y0, x1, y1]  (dash = lane line, stop, zebra stripes, edge)
    MK = []
    for y in (158.999, 162.5, 177.75 + 1.75, 181.25 + 1.75):
        MK.append(["dash", 0, y, 148, y]); MK.append(["dash", 188, y, 360, y])
    for y in (166, 169.5, 172.5, 176): MK.append(["edge", 0, y, 148, y]); MK.append(["edge", 188, y, 360, y])
    for x in (159, 162.5, 173.5, 177): MK.append(["dash", x, 0, x, 148]); MK.append(["dash", x, 194, x, 360])
    for x in (166, 170): MK.append(["edge", x, 0, x, 143]); MK.append(["edge", x, 199, x, 360])
    MK += [["stop", 148, 155.5, 148, 169.5], ["stop", 188, 172.5, 188, 186.5], ["stop", 170, 148, 180.5, 148], ["stop", 155.5, 194, 166, 194]]
    MK += [["zebra", 149, 155, 154, 187], ["zebra", 182, 155, 187, 187], ["zebra", 155, 149, 181, 154], ["zebra", 155, 188, 181, 193]]
    MK += [["text", 128, 167.75, "BRT"], ["text", 128, 174.25, "BRT"], ["text", 240, 167.75, "BRT"], ["text", 240, 174.25, "BRT"]]
    # ---- buildings (low / mid rise; towers come from the rules table)
    BL = []
    def bld(bid, name, kind, parts, **k): BL.append(dict(id=bid, name=name, kind=kind, parts=parts, **k))
    # mall 云汇天地 — modern atrium mall: curved glass curtain, LED canopy, outdoor plaza + LED screens, escalators visible through glass
    bld("mall", "云汇天地购物中心", "mall", [
        dict(shape="ell", cx=276, cy=48, rx=78, ry=38, n=36, z0=0, z1=8, style="mall_stone"),          # stone podium (curved)
        dict(shape="ell", cx=276, cy=48, rx=74, ry=34, n=36, z0=8, z1=34, style="mall_glass"),         # curved glass curtain
        dict(shape="ell", cx=276, cy=48, rx=48, ry=22, n=28, z0=34, z1=42, style="mall_glass"),        # glazed roof lantern
        dict(shape="rect", x0=188, y0=30, x1=204, y1=66, z0=0, z1=28, style="mall_glass", atrium=True),# west atrium hall (escalators)
        dict(shape="rect", x0=184, y0=36, x1=204, y1=60, z0=12, z1=13.2, style="canopy"),              # LED canopy blade
        dict(shape="rect", x0=186, y0=68, x1=210, y1=78, z0=4, z1=18, style="dark_glass"),             # outdoor LED screen slab
        dict(shape="rect", x0=210, y0=4, x1=250, y1=14, z0=4, z1=16, style="dark_glass")],             # plaza LED screen
        screen=dict(face="W", x=188.1, y0=68, y1=78, z0=4, z1=18),
        sign=dict(x=196, y=48, z=26, text="云汇天地 UNIVERSE MALL"),
        door=[186, 48], foot=[["ell", 276, 48, 78, 38, 36], [188, 30, 204, 66]])
    zone("plaza", ellipse(276, 48, 86, 46, 36))                                                       # outdoor plaza ring
    zone("plaza_dk", rect(182, 28, 190, 68))                                                          # atrium forecourt
    # boutiques: north row (fronts face south onto the street), south row
    names_n = ["LUMIÈRE 珠宝", "MAISON 云", "SORA 腕表", "青瓷茶室", "ATELIER 7", "星咖啡 Reserve"]
    names_s = ["白鹭画廊", "NOVA 香氛", "墨言书店", "KAI 眼镜", "小满甜品", "ORBIT 数码"]
    shops = ["shop_a", "shop_b", "shop_c", "shop_d", "shop_e"]; ups = ["glass_gold", "stone_grid", "mall_glass", "glass_silver", "dark_glass"]
    for i in range(6):
        x0 = 206 + i * 25; h = 10 + (i * 7) % 9
        bld(f"bq_n{i}", names_n[i], "boutique", [dict(shape="rect", x0=x0, y0=128, x1=x0 + 22, y1=146, z0=0, z1=5, style=shops[i % 5]),
            dict(shape="rect", x0=x0, y0=128, x1=x0 + 22, y1=146, z0=5, z1=h, style=ups[i % 5])], door=[x0 + 11, 126.6], front="S",
            sign=dict(x=x0 + 11, y=127.95, z=4.2, text=names_n[i]), foot=[[x0, 128, x0 + 22, 146]])
        hs = 6.5 + (i % 2) * 1.5                      # south row = low pavilions: it sits between the camera and the street
        bld(f"bq_s{i}", names_s[i], "boutique", [dict(shape="rect", x0=x0, y0=92, x1=x0 + 22, y1=110, z0=0, z1=5, style=shops[(i + 2) % 5]),
            dict(shape="rect", x0=x0, y0=92, x1=x0 + 22, y1=110, z0=5, z1=hs, style=ups[(i + 3) % 5])], door=[x0 + 11, 111.4], front="N",
            sign=dict(x=x0 + 11, y=91.95, z=4.2, text=names_s[i]), foot=[[x0, 92, x0 + 22, 110]])
    # stadium 云汇体育中心: faceted ellipse bowl, white ribs, membrane roof ring (pitch visible through the oculus)
    bld("stadium", "云汇体育中心", "stadium", [dict(shape="ell", cx=74, cy=280, rx=56, ry=48, n=32, z0=0, z1=32, style="stadium"),
        dict(shape="ell", cx=74, cy=280, rx=58, ry=50, n=32, z0=32, z1=36, style="canopy", ring=dict(rx=34, ry=27))],
        door=[74, 229.5], gates=[[74, 232, "S"], [18, 280, "W"]], sign=dict(x=74, y=231.9, z=27, text="云汇体育中心 YUNHUI ARENA"),
        foot=[["ell", 74, 280, 56, 48, 32]])
    # ---- 云麓花园 · concentric luxury gated community (outer high-rise → mid 四代住宅 → inner villas)
    # larger footprint, street-front facade, anti-climb perimeter, resort pool, kindergarten, gardens, promenade belts
    CX0, CY0, CX1, CY1 = 236, 192, 372, 296
    zone("plaza", rect(CX0, CY0, CX1, CY1))
    # promenade green belts (between rings)
    zone("lawn", rect(244, 210, 364, 218))                                       # south promenade belt
    zone("lawn", rect(244, 270, 364, 278))                                       # north promenade belt
    zone("lawn", rect(244, 218, 252, 270)); zone("lawn", rect(356, 218, 364, 270))  # side belts
    zone("path", rect(292, 200, 300, 288)); zone("path", rect(244, 248, 364, 254)) # cross axes
    zone("path", rect(268, 218, 336, 224)); zone("path", rect(268, 264, 336, 270))
    # inner park + villa gardens
    zone("lawn", rect(288, 230, 328, 262))                                       # central small park
    zone("plaza", ellipse(308, 246, 14, 10, 16))
    zone("asphalt", rect(240, 280, 272, 292))                                    # visitor parking N
    zone("asphalt", rect(240, 268, 258, 280))                                    # garage ramp
    zone("plaza_dk", rect(286, 192, 318, 202))                                   # gate forecourt
    # ---- perimeter: high wall + anti-climb fence + south street facade frontage
    for wi, (x0, y0, x1, y1) in enumerate((
        (236, 192, 284, 195.5), (320, 192, 372, 195.5),                          # south (gap = gate)
        (236, 195.5, 239.5, 292.5), (368.5, 195.5, 372, 292.5),                 # west / east
        (236, 292.5, 372, 296),                                                  # north
    )):
        bld(f"res_wall_{wi}", "云麓花园围墙", "compound", [
            dict(shape="rect", x0=x0, y0=y0, x1=x1, y1=y1, z0=0, z1=3.6, style="stone_grid"),
            dict(shape="rect", x0=x0, y0=y0, x1=x1, y1=y1, z0=3.6, z1=4.5, style="dark_glass")],  # anti-climb fence
            foot=[[x0, y0, x1, y1]])
    # south street facade frontage (continuous luxury frontage either side of gate)
    bld("res_front_w", "云麓花园 · 临街立面", "compound", [
        dict(shape="rect", x0=240, y0=193, x1=282, y1=199, z0=0, z1=5, style="stone_grid"),
        dict(shape="rect", x0=241, y0=193.5, x1=281, y1=198.5, z0=5, z1=11, style="glass_silver")],
        foot=[[240, 193, 282, 199]])
    bld("res_front_e", "云麓花园 · 临街立面", "compound", [
        dict(shape="rect", x0=322, y0=193, x1=368, y1=199, z0=0, z1=5, style="stone_grid"),
        dict(shape="rect", x0=323, y0=193.5, x1=367, y1=198.5, z0=5, z1=11, style="glass_gold")],
        foot=[[322, 193, 368, 199]])
    # grand gatehouse + guard + access control + cameras
    bld("res_gate_s", "云麓花园 · 南门", "compound", [
        dict(shape="rect", x0=284, y0=190.5, x1=292, y1=204, z0=0, z1=8.5, style="stone_grid"),
        dict(shape="rect", x0=312, y0=190.5, x1=320, y1=204, z0=0, z1=8.5, style="stone_grid"),
        dict(shape="rect", x0=284, y0=190.5, x1=320, y1=194, z0=6.5, z1=9.2, style="lobby"),
        dict(shape="rect", x0=293, y0=196, x1=311, y1=199, z0=3.5, z1=4.2, style="canopy"),
        dict(shape="rect", x0=295, y0=199.5, x1=303, y1=203.5, z0=0, z1=3.4, style="dark_glass"),  # guard booth
        dict(shape="rect", x0=286, y0=201, x1=288, y1=202.2, z0=5.5, z1=7.2, style="dark_glass"),  # CCTV
        dict(shape="rect", x0=316, y0=201, x1=318, y1=202.2, z0=5.5, z1=7.2, style="dark_glass")],
        door=[302, 195.2], sign=dict(x=302, y=191.5, z=9.8, text="云麓花园"),
        foot=[[284, 190.5, 320, 204]])
    bld("res_stone", "云麓花园 · 门牌石", "compound", [
        dict(shape="rect", x0=272, y0=193.5, x1=280, y1=197.5, z0=0, z1=1.8, style="stone_grid")],
        sign=dict(x=276, y=194, z=2.2, text="云麓花园"), foot=[[272, 193.5, 280, 197.5]])
    def gen4th(bid, name, x0, y0, w, d, h, st):
        """中式现代化 / 第四代住宅 inspired: stone podium, stepped terraces, sky-garden greenery bands (original)."""
        parts = [dict(shape="rect", x0=x0, y0=y0, x1=x0 + w, y1=y0 + d, z0=0, z1=4.2, style="stone_grid")]
        z, step, i = 4.2, 11.5, 0
        while z < h - 2:
            inset = min(2.4, 0.4 + i * 0.35)
            z1 = min(h, z + step)
            parts.append(dict(shape="rect", x0=x0 + inset, y0=y0 + inset, x1=x0 + w - inset, y1=y0 + d - inset,
                              z0=z, z1=z1, style=st))
            # sky garden terrace slab + green edge
            if i % 2 == 0 and z > 8:
                parts.append(dict(shape="rect", x0=x0 + inset - 1.2, y0=y0 + inset - 0.6,
                                  x1=x0 + w - inset + 1.2, y1=y0 + inset + 1.8, z0=z1 - 0.35, z1=z1 + 0.55, style="glass_green"))
                parts.append(dict(shape="rect", x0=x0 + inset - 0.4, y0=y0 + d - inset - 1.6,
                                  x1=x0 + w - inset + 0.4, y1=y0 + d - inset + 0.8, z0=z1 - 0.35, z1=z1 + 0.55, style="glass_green"))
            z, i = z1, i + 1
        parts.append(dict(shape="rect", x0=x0 + w * 0.28, y0=y0 + d * 0.28, x1=x0 + w * 0.72, y1=y0 + d * 0.72,
                          z0=h - 1.5, z1=h + 2.5, style="stone_grid", roofbox=True))
        bld(bid, name, "compound", parts, door=[x0 + w / 2, y0 - 0.5], foot=[[x0, y0, x0 + w, y0 + d]], home=True)

    # OUTER RING — high-rises (≈70–95 m) along perimeter inside walls
    outer = [
        (242, 204, 18, 16, 72, "glass_teal", "云麓 · 云阙苑"),
        (262, 200, 16, 14, 68, "glass_silver", "云麓 · 天青苑"),
        (348, 200, 18, 16, 74, "glass_gold", "云麓 · 鎏金苑"),
        (242, 268, 16, 18, 70, "glass_blue", "云麓 · 望川苑"),
        (350, 268, 18, 16, 72, "glass_teal", "云麓 · 叠翠苑"),
        (300, 278, 20, 14, 66, "glass_silver", "云麓 · 听澜苑"),
    ]
    for i, (x0, y0, w, d, h, st, name) in enumerate(outer):
        gen4th(f"res_o{i}", name, x0, y0, w, d, h, st)

    # MID RING — mid/high 四代住宅 (≈48–62 m)
    mid = [
        (256, 214, 14, 14, 52, "glass_green", "云麓 · 栖云阁"),
        (340, 214, 14, 14, 50, "apt", "云麓 · 清晖阁"),
        (256, 258, 14, 14, 48, "glass_silver", "云麓 · 碧梧阁"),
        (340, 258, 14, 14, 54, "glass_gold", "云麓 · 映月阁"),
    ]
    for i, (x0, y0, w, d, h, st, name) in enumerate(mid):
        gen4th(f"res_m{i}", name, x0, y0, w, d, h, st)

    def luxury_villa(bid, name, x0, y0, rot=0):
        """Modern Chinese luxury villa: stone podium, glass curtain, flat overhang, private courtyard."""
        # L / courtyard footprint ~16x14
        parts = [
            dict(shape="rect", x0=x0, y0=y0, x1=x0 + 16, y1=y0 + 4.5, z0=0, z1=3.4, style="stone_grid"),       # street wing
            dict(shape="rect", x0=x0, y0=y0 + 4.5, x1=x0 + 5, y1=y0 + 13, z0=0, z1=3.4, style="stone_grid"), # side wing
            dict(shape="rect", x0=x0 + 11, y0=y0 + 4.5, x1=x0 + 16, y1=y0 + 13, z0=0, z1=3.4, style="stone_grid"),
            dict(shape="rect", x0=x0 + 0.5, y0=y0 + 0.5, x1=x0 + 15.5, y1=y0 + 4, z0=3.4, z1=8.8, style="mall_glass"),
            dict(shape="rect", x0=x0 + 0.5, y0=y0 + 5, x1=x0 + 4.5, y1=y0 + 12.5, z0=3.4, z1=8.2, style="glass_gold"),
            dict(shape="rect", x0=x0 + 11.5, y0=y0 + 5, x1=x0 + 15.5, y1=y0 + 12.5, z0=3.4, z1=8.2, style="glass_silver"),
            # flat roof overhang / canopy blade
            dict(shape="rect", x0=x0 - 0.6, y0=y0 - 0.4, x1=x0 + 16.6, y1=y0 + 5.2, z0=8.8, z1=9.4, style="stone_grid"),
            dict(shape="rect", x0=x0 + 5.5, y0=y0 + 8, x1=x0 + 10.5, y1=y0 + 12, z0=0, z1=0.4, style="glass_green"),  # courtyard garden pad
        ]
        zone("lawn", rect(x0 + 5.2, y0 + 5, x0 + 10.8, y0 + 12.5))
        bld(bid, name, "compound", parts, door=[x0 + 8, y0 - 0.4], foot=[[x0, y0, x0 + 16, y0 + 13]], home=True)

    # INNERMOST — luxury villa cluster around central park
    for i, (x0, y0) in enumerate([(292, 226), (314, 226), (292, 250), (314, 250), (304, 262), (280, 238)]):
        luxury_villa(f"res_v{i}", f"云麓 · 云墅{i+1}号", x0, y0)

    # clubhouse + resort-quality pool area (clear L-shaped pool deck)
    bld("res_club", "云麓花园 · 会所", "compound", [
        dict(shape="rect", x0=248, y0=218, x1=266, y1=232, z0=0, z1=5.5, style="lobby"),
        dict(shape="rect", x0=249.5, y0=219.5, x1=264.5, y1=230.5, z0=5.5, z1=10, style="mall_glass"),
        dict(shape="rect", x0=266, y0=220, x1=276, y1=230, z0=0, z1=4.2, style="stone_grid")],
        door=[257, 217.4], sign=dict(x=257, y=218.2, z=10.5, text="会所"), foot=[[248, 218, 276, 232]])
    zone("deck", rect(248, 232, 286, 258))                                        # large resort pool deck
    zone("water", rect(252, 236, 282, 254))                                       # main resort pool (clear, large)
    zone("water", rect(254, 254, 266, 257))                                       # shallow kids shelf
    bld("res_pool_cab", "云麓花园 · 泳池更衣室", "compound", [
        dict(shape="rect", x0=276, y0=232, x1=286, y1=240, z0=0, z1=3.2, style="stone_grid")],
        foot=[[276, 232, 286, 240]])

    # private kindergarten (小幼儿园)
    bld("res_kg", "云麓花园 · 云麓幼儿园", "compound", [
        dict(shape="rect", x0=344, y0=230, x1=366, y1=250, z0=0, z1=4.5, style="lobby"),
        dict(shape="rect", x0=345, y0=231, x1=365, y1=249, z0=4.5, z1=8.5, style="glass_teal"),
        dict(shape="rect", x0=352, y0=232, x1=358, y1=238, z0=8.5, z1=11, style="glass_gold", crown="lantern")],
        door=[355, 229.4], sign=dict(x=355, y=230.2, z=9, text="云麓幼儿园"), foot=[[344, 230, 366, 250]])
    zone("lawn", rect(346, 250, 364, 262))
    zone("plaza", rect(350, 252, 360, 258))

    # underground garage ramp
    bld("res_garage", "云麓花园 · 地库入口", "compound", [
        dict(shape="rect", x0=240, y0=268, x1=258, y1=280, z0=0, z1=3.2, style="stone_grid"),
        dict(shape="rect", x0=242, y0=270, x1=256, y1=278, z0=0.3, z1=2.5, style="dark_glass")],
        door=[249, 267.4], sign=dict(x=249, y=268.2, z=3.6, text="地下车库"), foot=[[240, 268, 258, 280]])

    # CCTV poles along walls (anti-intrusion)
    for i, (cx, cy) in enumerate([(240, 220), (240, 260), (368, 220), (368, 260), (260, 194), (350, 194), (300, 294)]):
        bld(f"res_cam_{i}", "云麓花园 · 监控", "compound", [
            dict(shape="rect", x0=cx - 0.25, y0=cy - 0.25, x1=cx + 0.25, y1=cy + 0.25, z0=0, z1=5.5, style="dark_glass"),
            dict(shape="rect", x0=cx - 0.5, y0=cy - 0.35, x1=cx + 0.5, y1=cy + 0.35, z0=5.5, z1=6.2, style="glass_silver")],
            foot=[[cx - 0.5, cy - 0.5, cx + 0.5, cy + 0.5]])

    # ---- towers
    table = rules_cbd["towers"]
    towers, fabric = place_towers(table, random.Random(7))
    # ---- props
    PR = []
    def prop(t, x, y, rot=0, v="base", **k): PR.append(dict(t=t, x=round(x, 2), y=round(y, 2), r=rot, v=v, **k))
    def clear(x, y, r, polys=(), pts=()):
        for (a, b, c) in pts:
            if math.hypot(x - a, y - b) < r + c: return False
        return True
    taken = []
    def ok(x, y, r):
        for (a, b, c) in taken:
            if math.hypot(x - a, y - b) < r + c: return False
        return True
    def take(x, y, r): taken.append((x, y, r))
    # reserve paths / lake / plazas in the park
    def near_path(x, y, d):
        for pl in paths:
            for a, b in zip(pl, pl[1:]):
                if segdist(x, y, a, b) < d: return True
        return False
    def in_ell(x, y, cx, cy, rx, ry): return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1
    prop("fountain", 32, 68); take(32, 68, 4)   # amphitheatre fountain
    prop("sculpture", 22, 40, 0); take(22, 40, 2.5)
    prop("kiosk", 136, 124, 6); take(136, 124, 2.5)
    for i, (x, y) in enumerate(loop):
        a = math.atan2(y - 68, x - 64); ox, oy = math.cos(a) * 2.9, math.sin(a) * 2.9
        if i % 3 == 1:
            fx, fy = -math.cos(a), -math.sin(a)            # face the lake
            rot = min((0, 2, 4, 6), key=lambda r: -(fx * math.sin(r * math.pi / 4) + fy * -math.cos(r * math.pi / 4)))
            prop("bench", x + ox, y + oy, rot, bench=True, face=[round(fx, 2), round(fy, 2)]); take(x + ox, y + oy, 1.2)
        if i % 3 == 0: prop("lamp_park", x + ox * 0.8, y + oy * 0.8); take(x + ox * 0.8, y + oy * 0.8, 0.4)
    for x in (48, 64, 80): prop("lamp_park", x, 26.5); take(x, 26.5, 0.4)
    for x in range(4, 146, 2):
        if 61 <= x <= 67 or x > 110: continue
        prop("hedge", x + 1, 146.6, 0); 
    for y in range(4, 146, 2):
        if 63 <= y <= 69 or y > 110: continue
        prop("hedge", 146.6, y + 1, 2)
    for i in range(170):
        for _ in range(40):
            x, y = rnd.uniform(4, 143), rnd.uniform(5, 143)
            if in_ell(x, y, 64, 68, 52, 44) or in_ell(x, y, 58, 62, 12, 9) or in_ell(x, y, 78, 78, 9, 7) or near_path(x, y, 3.6) or (x > 108 and y > 108) or in_ell(x, y, 112, 28, 17, 13) or in_ell(x, y, 22, 118, 14, 17): continue
            if not ok(x, y, 3.0): continue
            prop("tree_a", x, y, 0, "t2" if rnd.random() < 0.4 else "base"); take(x, y, 2.2); break
    for (x, y) in ((112, 28), (22, 118)):
        prop("flowerbed", x, y); take(x, y, 2.4)
    # street trees / lamps / bollards along the avenues
    def row(axis, fixed, a0, a1, step, kind, rot=0, skip=()):
        a = a0
        while a <= a1:
            if not any(s0 <= a <= s1 for s0, s1 in skip):
                x, y = (a, fixed) if axis == "x" else (fixed, a)
                if ok(x, y, 0.6): prop(kind, x, y, rot); take(x, y, 0.8)
            a += step
    SK = ((140, 196),)
    row("x", 153.6, 4, 356, 9, "tree_b", skip=SK + ((96, 112),)); row("x", 188.4, 4, 356, 9, "tree_b", skip=SK)
    row("y", 153.6, 4, 356, 9, "tree_b", skip=SK + ((94, 106),)); row("y", 182.4, 4, 356, 9, "tree_b", skip=SK + ((40, 60), (94, 106)))
    row("x", 154.4, 8, 356, 36, "lamp_street", 0, skip=SK); row("x", 187.6, 8, 356, 36, "lamp_street", 0, skip=SK)
    row("y", 154.4, 8, 356, 36, "lamp_street", 2, skip=SK); row("y", 181.6, 8, 356, 36, "lamp_street", 2, skip=SK)
    row("x", 171, 20, 100, 30, "lamp_street", 0); row("x", 171, 200, 356, 30, "lamp_street", 0)
    for (x, y) in ((148.6, 148.6), (187.4, 148.6), (148.6, 193.4), (187.4, 193.4)):
        for d in (-1.2, 0, 1.2):
            pass
    for cx, cy, sx, sy in ((148.4, 148.4, 1, 1), (187.6, 148.4, -1, 1), (148.4, 193.6, 1, -1), (187.6, 193.6, -1, -1)):
        for k in (1.6, 3.2): prop("bollard", cx - sx * k * 0 + (k if sx < 0 else -k) * 0 + cx * 0 + cx - cx, cy, 0) if False else None
    # signals at the four corners (arms over the approach lanes)
    prop("signal", 154.4, 147.6, 0, sig="NB"); prop("signal", 181.6, 194.4, 4, sig="SB"); prop("signal", 147.6, 155.6, 2, sig="EB"); prop("signal", 188.4, 186.4, 6, sig="WB")
    # BRT station + bus stop + taxi stand
    prop("brt_shelter", 128, 171); take(128, 171, 1)
    prop("bus_shelter", 185.6, 100, 6); prop("taxi_sign", 183.4, 52); prop("totem", 186.6, 60, 6)
    # metro exits A-D (place metro_cbd)
    EX = [dict(id="A", name="A出口 · 中央公园", x=128, y=141, rot=0), dict(id="B", name="B出口 · 云汇天地 / 臻品街", x=196, y=138, rot=6),
          dict(id="C", name="C出口 · 天枢塔 / 金融城", x=196, y=202, rot=6), dict(id="D", name="D出口 · 云汇体育中心", x=138, y=202, rot=0)]
    for e in EX:
        prop("metro_exit", e["x"], e["y"], e["rot"], exit=e["id"]); take(e["x"], e["y"], 3.5)
        if e["rot"] == 0: e["spawn"] = [e["x"], e["y"] - 3.6, "S"]; e["trigger"] = [e["x"] - 2.4, e["y"] - 2.6, e["x"] + 2.4, e["y"] - 1.75]
        else: e["spawn"] = [e["x"] - 3.6, e["y"], "W"]; e["trigger"] = [e["x"] - 2.6, e["y"] - 2.4, e["x"] - 1.75, e["y"] + 2.4]
        e["to"] = "metro_cbd"; e["link"] = e["id"]
    # pedestrian street furniture
    for i in range(7):
        x = 205 + i * 25
        prop("lamp_park", x + 1, 112.6); prop("lamp_park", x + 1, 125.4)
        if i < 6:
            prop("planter", x + 12.5, 115.8 if i % 2 else 122.2, 0); prop("bench", x + 12.5, 114.0 if i % 2 else 124.0, 4 if i % 2 else 0, bench=True)
            prop("tree_b", x + 5, 116.2 if i % 2 == 0 else 121.8)
    for i in (0, 2, 4):
        x0 = 206 + i * 25
        for k, dx in enumerate((3.5, 18.5)): prop("cafe_set", x0 + dx, 125.9, 0, "b" if (i + k) % 2 else "base")
    for i in (1, 3, 5):
        x0 = 206 + i * 25
        for k, dx in enumerate((3.5, 18.5)): prop("cafe_set", x0 + dx, 112.2, 0, "base" if (i + k) % 2 else "b")
    BUSK = [dict(x=243.5, y=121.6, kit=[244.6, 122.3]), dict(x=318.5, y=116.6, kit=[319.6, 116.0])]
    for b in BUSK: prop("busker", b["kit"][0], b["kit"][1], 0)
    for x in (198, 226, 254, 282, 310, 338): prop("bin", x, 113.0 if x % 2 else 125.0) if False else None
    for x in (232, 290): prop("bin", x, 112.6); prop("bin", x + 25, 125.4)
    # mall + NE plazas
    for y in (8, 20, 74, 88, 100): prop("tree_b", 192, y)
    for x in range(210, 350, 14): prop("tree_b", x, 86.5); prop("planter", x + 7, 86.5, 0)
    for x, y in ((191, 38), (191, 58)): prop("planter", x, y, 2)
    for y in range(200, 356, 12):
        if not 256 < y < 268: prop("tree_b", 254.6, y); prop("tree_b", 261.4, y)
    for x in range(192, 356, 12):
        if not 252 < x < 264: prop("tree_b", x, 258.6); prop("tree_b", x, 265.4)
    for x, y in ((290, 262), (230, 262), (258, 210), (258, 300), (330, 262)): prop("sculpture" if (x + y) % 3 == 0 else "flowerbed", x + 0.0, y + (0 if (x + y) % 3 else 0))
    for x, y, r in ((292, 266.5, 0), (308, 266.5, 0), (214, 297.5, 0), (230, 297.5, 0), (316, 194.6, 0), (336, 194.6, 0), (216, 212.6, 0), (236, 212.6, 0)): prop("planter", x, y, r)
    for x, y in ((300, 266), (258, 330), (300, 258)): prop("lamp_park", x + 3, y) if False else None
    for y in range(204, 356, 18): prop("lamp_park", 256, y + 4)
    for x in range(194, 356, 18): prop("lamp_park", x + 4, 260)
    # stadium plaza ring of trees + lamps
    for i, (x, y) in enumerate(ellipse(74, 280, 66.5, 58.5, 36)):
        if x > 146 or y < 196: continue
        prop("tree_a" if i % 2 else "lamp_park", x, y, 0, "base")
    for (x, y) in ((60, 226), (88, 226), (14, 266), (14, 294)): prop("totem", x, y, 0)
    # park landmarks: original sculpture + plaza landmark device + cafés / kiosks + flower beds + amphitheatre benches
    prop("sculpture", 128, 128, 0); take(128, 128, 3)
    bld("park_landmark", "云汇之环", "park", [
        dict(shape="circ", cx=128, cy=128, r=6.5, n=20, z0=0, z1=1.2, style="stone_grid"),
        dict(shape="circ", cx=128, cy=128, r=4.2, n=16, z0=1.2, z1=9.5, style="glass_teal"),
        dict(shape="circ", cx=128, cy=128, r=2.0, n=12, z0=9.5, z1=14, style="glass_gold", crown="lantern")],
        sign=dict(x=128, y=118, z=3, text="云汇之环"), foot=[["ell", 128, 128, 6.5, 6.5, 16]])
    prop("kiosk", 88, 104, 0); take(88, 104, 2.5)
    prop("kiosk", 48, 104, 0); take(48, 104, 2.5)
    prop("cafe_set", 52, 102, 0); prop("cafe_set", 58, 102, 0, "b")
    prop("cafe_set", 102, 64, 2); prop("cafe_set", 102, 70, 2, "b")
    for (x, y) in ((30, 50), (30, 86), (100, 30), (20, 110), (110, 50), (50, 30)):
        prop("flowerbed", x, y); take(x, y, 2.2)
    for i, (x, y) in enumerate(ellipse(32, 68, 14, 16, 12)):
        if i % 2 == 0: prop("bench", x, y, 2 if x < 32 else 6, bench=True, face=[1 if x < 32 else -1, 0]); take(x, y, 1.1)
    for x in (48, 64, 80): prop("lamp_park", x, 30.5); take(x, 30.5, 0.4)
    for y in (56, 72, 88): prop("lamp_park", 104, y); take(104, y, 0.4)
    # compound landscaping — dense vegetation, promenade trees, pool umbrellas, park, kindergarten yard
    for x in range(244, 364, 6):
        if ok(x, 214, 0.9): prop("tree_b", x, 214); take(x, 214, 1.2)
        if ok(x, 274, 0.9): prop("tree_b", x, 274); take(x, 274, 1.2)
        if ok(x, 294, 0.8): prop("hedge", x, 294.5, 0)
    for y in range(210, 290, 7):
        if ok(248, y, 0.9): prop("tree_a", 248, y, 0, "t2" if y % 14 == 0 else "base"); take(248, y, 1.1)
        if ok(360, y, 0.9): prop("tree_a", 360, y); take(360, y, 1.1)
        if ok(242, y, 0.5): prop("lamp_park", 242.5, y)
        if ok(366, y, 0.5): prop("lamp_park", 365.5, y)
    for (x, y) in ((256, 244), (268, 252), (300, 236), (316, 252), (308, 246), (292, 256), (348, 252), (354, 254)):
        prop("flowerbed", x, y); take(x, y, 2)
    for (x, y) in ((300, 242), (316, 242), (292, 250), (308, 256), (348, 246)):
        prop("bench", x, y, 0, bench=True, face=[0, 1]); take(x, y, 1.1)
    for (x, y) in ((255, 245), (262, 245), (255, 255), (265, 255)):  # poolside
        prop("cafe_set", x, y, 0 if x < 260 else 2); take(x, y, 1.5)
    prop("sculpture", 308, 246, 0); take(308, 246, 2.5)   # central park sculpture
    prop("fountain", 308, 246); take(308, 246, 3)
    prop("kiosk", 280, 246, 0); take(280, 246, 2)
    prop("totem", 302, 206, 0); prop("bin", 310, 206); prop("planter", 286, 204, 0); prop("planter", 318, 204, 0)
    for x in (244, 252, 260): prop("bollard", x, 284)
    for (x, y) in ((250, 200), (260, 200), (340, 200), (350, 200), (250, 288), (350, 288)):
        prop("planter", x, y, 0); take(x, y, 1)
    # denser inner hedges / shrubs along promenade
    for x in range(268, 340, 3):
        if ok(x, 220, 0.4): prop("hedge", x, 220.5, 0)
        if ok(x, 266, 0.4): prop("hedge", x, 266.5, 0)
    # ---- nav graph (centre lines; crosswalk edges carry the signal leg)
    L = []
    def line(*pts, cw=None): L.append(([tuple(p) for p in pts], cw))
    line((0, 151.5), (151.5, 151.5)); line((184.5, 151.5), (356, 151.5)); line((0, 190.5), (151.5, 190.5)); line((184.5, 190.5), (356, 190.5))
    line((151.5, 2), (151.5, 151.5)); line((151.5, 190.5), (151.5, 356)); line((184.5, 2), (184.5, 151.5)); line((184.5, 190.5), (184.5, 356))
    line((151.5, 151.5), (151.5, 171), cw="W"); line((151.5, 171), (151.5, 190.5), cw="W"); line((184.5, 151.5), (184.5, 190.5), cw="E")
    line((151.5, 151.5), (184.5, 151.5), cw="S"); line((151.5, 190.5), (184.5, 190.5), cw="N")
    line((112, 171), (151.5, 171))
    for pl in paths: line(*pl)
    line((134, 134), (128, 137.2))
    line((184.5, 119), (356, 119)); line((184.5, 48), (193, 48)); line((184.5, 87), (350, 87))
    for i in range(6):
        x0 = 206 + i * 25; line((x0 + 11, 119), (x0 + 11, 126.6)); line((x0 + 11, 119), (x0 + 11, 111.4))
        line((x0 + 23.5, 87), (x0 + 23.5, 119))
    line((302, 186), (302, 200)); line((258, 296), (258, 356)); line((184.5, 262), (356, 262))
    line((302, 195.2), (302, 250)); line((250, 251), (360, 251)); line((255, 220), (255, 238)); line((249, 267.4), (249, 251))
    line((296, 230), (296, 262)); line((320, 230), (320, 262)); line((351, 227.4), (351, 251)); line((308, 246), (302, 251))
    line((260, 250), (274, 250))
    for a, b in (((300, 268.5), (300, 262)), ((268.5, 300), (258, 300)), ((222, 299.5), (222, 262)), ((195.5, 326), (184.5, 326)),
                 ((326, 196.5), (326, 190.5)), ((300.5, 222), (258, 222)), ((226, 216.5), (226, 190.5)), ((204.5, 236), (184.5, 236))): line(a, b)
    line((192.4, 202), (184.5, 202)); line((192.4, 138), (184.5, 138)); line((138, 198.4), (138, 190.5))
    sring = ellipse(74, 280, 64, 56, 28, -math.pi / 2); line(*(sring + [sring[0]]))
    line((74, 224), (74, 190.5)); line((74, 224), (74, 229.5)); line((138, 280), (151.5, 280)); line((10, 280), (14.5, 280))
    line((184.5, 100), (183.6, 100)); line((184.5, 52), (183.6, 52))
    nodes, edges = [], []
    def nid(p):
        for i, q in enumerate(nodes):
            if abs(q[0] - p[0]) < 0.6 and abs(q[1] - p[1]) < 0.6: return i
        nodes.append([round(p[0], 2), round(p[1], 2)]); return len(nodes) - 1
    # split every line at points of other lines that lie on it (T junctions), then sample every <= 8 m
    allpts = [p for pts, _ in L for p in pts]
    for pts, cw in L:
        for a, b in zip(pts, pts[1:]):
            ins = [p for p in allpts if segdist(p[0], p[1], a, b) < 0.3 and math.hypot(p[0] - a[0], p[1] - a[1]) > 0.5 and math.hypot(p[0] - b[0], p[1] - b[1]) > 0.5]
            L2 = math.hypot(b[0] - a[0], b[1] - a[1]) or 1
            ins.sort(key=lambda p: (p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1]))
            seq = [a] + ins + [b]; full = []
            for p, q in zip(seq, seq[1:]):
                n = max(1, int(math.hypot(q[0] - p[0], q[1] - p[1]) / 8))
                for k in range(n): full.append((p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n))
            full.append(seq[-1])
            for p, q in zip(full, full[1:]):
                i, j = nid(p), nid(q)
                if i != j: edges.append([i, j] + ([cw] if cw else []))
    def nearest(p): return min(range(len(nodes)), key=lambda i: math.hypot(nodes[i][0] - p[0], nodes[i][1] - p[1]))
    POI = {
        "metro": {e["id"]: nearest((e["spawn"][0], e["spawn"][1])) for e in EX},
        "lobby": [nearest(p) for p in ((300, 268.5), (268.5, 300), (216, 318), (204, 330), (330, 204), (318, 216), (220, 218), (208, 230))],
        "shop": [nearest((206 + i * 25 + 11, 126.6)) for i in range(6)] + [nearest((206 + i * 25 + 11, 111.4)) for i in range(6)],
        "mall": [nearest((186, 48))], "compound": [nearest((302, 195.2)), nearest((257, 217.4)), nearest((355, 229.4)), nearest((249, 267.4))], "stadium": [nearest((74, 229.5)), nearest((14.5, 280))], "brt": [nearest((120, 171)), nearest((136, 171))],
        "bus": [nearest((183.6, 100))], "taxi": [nearest((183.6, 52))],
        "park_loop": [nearest(p) for p in loop], "edge": [nearest(p) for p in ((2, 151.5), (356, 151.5), (2, 190.5), (356, 190.5), (151.5, 2), (184.5, 2), (151.5, 356), (184.5, 356))],
    }
    benches = [dict(x=p["x"], y=p["y"], face=p["face"], node=nearest((p["x"], p["y"]))) for p in PR if p.get("bench") and p.get("face")]
    for b in BUSK: b["node"] = nearest((b["x"], b["y"]))
    # ---- traffic
    lanes = []
    for i, y in enumerate((157.25, 160.75, 164.25)): lanes.append(dict(id=f"EB{i}", ax="x", dir=1, c=y, stop=147.6, sig="EW", curb=i == 0))
    for i, y in enumerate((184.75, 181.25, 177.75)): lanes.append(dict(id=f"WB{i}", ax="x", dir=-1, c=y, stop=188.4, sig="EW", curb=i == 0))
    for i, x in enumerate((178.75, 175.25, 171.75)): lanes.append(dict(id=f"NB{i}", ax="y", dir=1, c=x, stop=147.6, sig="NS", curb=i == 0, taxi=[46, 58] if i == 0 else None, bus=[96, 104] if i == 0 else None))
    for i, x in enumerate((157.25, 160.75, 164.25)): lanes.append(dict(id=f"SB{i}", ax="y", dir=-1, c=x, stop=194.4, sig="NS", curb=i == 0))
    lanes.append(dict(id="BRT_E", ax="x", dir=1, c=167.75, stop=147.6, sig="EW", brt=True, station=[116, 140]))
    lanes.append(dict(id="BRT_W", ax="x", dir=-1, c=174.25, stop=188.4, sig="EW", brt=True, station=[116, 140]))
    traffic = dict(lanes=lanes, span=[-70, 430], signal=dict(EW=26, Y=3, AR=2, NS=24), crosswalks=dict(W=[149, 155, 154, 187], E=[182, 155, 187, 187], S=[155, 149, 181, 154], N=[155, 188, 181, 193]),
                   cw_phase=dict(W="NS", E="NS", S="EW", N="EW"))
    return dict(zones=Z, marks=MK, buildings=BL, towers=towers, fabric=fabric, props=PR, exits=EX, nav=dict(nodes=nodes, edges=edges), poi=POI,
                benches=benches, buskers=BUSK, traffic=traffic, lake=dict(c=[64, 68], r=[46, 38], islands=[[58, 62, 10, 7], [78, 78, 7, 5.5]]), fountain=[32, 68], compound={"id":"yunlu","name":"云麓花园","door":[302,195.2],"pool":[267,245],"kg":[355,229.4]})

# ============================================================== 4. rules section (keys ADDED only)
SCHEDULE = {   # hourly (0-23) crowd / traffic multipliers, 1 = busy
 "_doc": "CBD crowd schedule: office_in = arrivals metro/BRT -> lobbies, office_out = lobbies -> metro/BRT, lunch = lobbies <-> 臻品街/公园/商场, leisure = shopping / evening stroll, jog / dog = 公园跑步 / 遛狗, traffic = car density, busk = 街头艺人",
 "office_in":  [0, 0, 0, 0, 0, 0, .05, .4, 1, .8, .25, .1, .1, .3, .15, .1, .05, .05, 0, 0, 0, 0, 0, 0],
 "office_out": [.02, 0, 0, 0, 0, 0, 0, 0, 0, .05, .05, .1, .1, .1, .1, .1, .15, .5, 1, .8, .45, .3, .2, .08],
 "lunch":      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, .05, .6, 1, .6, .1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
 "leisure":    [.1, .03, 0, 0, 0, 0, .05, .1, .15, .2, .4, .5, .6, .6, .6, .6, .6, .7, .8, .9, 1, .8, .5, .25],
 "jog":        [0, 0, 0, 0, 0, .1, .8, 1, .6, .2, .05, 0, 0, 0, 0, 0, .05, .2, .5, .9, .8, .4, .1, 0],
 "dog":        [0, 0, 0, 0, 0, 0, .5, 1, .6, .2, .1, .05, .05, .05, .05, .1, .2, .4, .8, 1, .7, .3, .05, 0],
 "traffic":    [.15, .08, .05, .05, .05, .1, .3, .8, 1, .8, .5, .5, .6, .5, .5, .55, .7, .9, 1, .85, .6, .45, .35, .25],
 "busk":       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, .5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, .5, 0],
}
def rules_section():
    return {
        "_doc": "云汇CBD (place 'cbd'). towers skyline density (Leo): ONLY 1 tower ≥600 m (天枢), 2 at 500–600 m, 5 at 400–500 m, 7 at 300–400 m; ALL other buildings ≤200 m (avg ~150 m), spaced with plazas. Top 15 have unique original silhouettes. Also: 云麓花园 concentric gated compound (outer 四代住宅 high-rises, mid ring, luxury villas, resort pool, kindergarten, park), Central-Park-style lake, atrium mall 云汇天地. metro_exits A–D → place metro_cbd.",
        "district": {"name": "云汇CBD", "en": "Yunhui CBD", "rent_district": "cbd_adjacent", "landmark": "tianshu"},
        "towers": towers_table(),
        "metro_exits": {"place": "metro_cbd", "station": "云汇中心站", "exits": {"A": "中央公园", "B": "云汇天地 / 臻品街", "C": "天枢塔 / 金融城", "D": "云汇体育中心"}},
        "schedule": SCHEDULE,
        "transit": {"brt": {"label": "BRT 快速公交 B1 线", "fare": 2, "headway_s": 75, "station": "云汇中心 BRT 站"}, "bus": {"label": "公交 天枢路站", "lines": ["12路", "35路", "高峰快线 K8"]},
                    "taxi": {"label": "出租车上落客点 · 云汇天地", "flagfall": 10, "per_km": 2.7}},
        "pois": {"mall": "云汇天地购物中心", "street": "臻品街", "park": "中央公园", "stadium": "云汇体育中心", "compound": "云麓花园", "observation_deck": {"tower": "tianshu", "floor": 118, "height_m": 562, "ticket": 180}},
    }

def write_rules(sec):
    """add the 'cbd' key to the canonical ../shared-rules/rules.json and the synced copy (other keys untouched), regenerate rules.data.js"""
    for d in (os.path.join(ROOT, "..", "shared-rules"), os.path.join(ROOT, "shared-rules")):
        p = os.path.join(d, "rules.json")
        if not os.path.exists(p): continue
        J = json.load(open(p, encoding="utf-8"))
        J["cbd"] = sec
        tmp = p + ".tmp"; json.dump(J, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=1); os.replace(tmp, p)
        js = os.path.join(d, "rules.data.js")
        open(js + ".tmp", "w", encoding="utf-8").write("/* generated by shared-rules/build.py from rules.json - edit the JSON */\nwindow.FUSHI_RULES_DATA=" + json.dumps(J, ensure_ascii=False, separators=(",", ":")) + ";\n")
        os.replace(js + ".tmp", js); print("rules: cbd ->", os.path.relpath(p, ROOT))

# ============================================================== 5. main
def main():
    args = sys.argv[1:]
    sec = rules_section()
    if "--rules" in args: write_rules(sec)
    L = layout(sec)
    scene = json.load(open(os.path.join(ROOT, "scene.json"), encoding="utf-8"))
    out = dict(version=1, id="cbd", name="云汇CBD", doc="generated by tools/build_cbd.py - edit the builder", bounds=B, extent=EXT,
               spawn=dict(x=L["exits"][0]["spawn"][0], y=L["exits"][0]["spawn"][1], dir="S"), calendar=scene.get("calendar"), weather=scene.get("weather"),
               schedule=SCHEDULE, tower_table=sec["towers"], **L)
    if "--no-kit" not in args:
        out["kit"] = build_atlas()
    else:
        old = os.path.join(ROOT, "cbd_scene.json")
        if os.path.exists(old): out["kit"] = json.load(open(old)).get("kit")
    s = json.dumps(out, ensure_ascii=False, separators=(",", ":"))
    open(os.path.join(ROOT, "cbd_scene.json"), "w", encoding="utf-8").write(s)
    open(os.path.join(ROOT, "cbd_scene.js"), "w", encoding="utf-8").write("/* generated by tools/build_cbd.py */\nwindow.CBD_SCENE=" + s + ";\n")
    print("cbd_scene.json", len(s) // 1024, "KB ·", len(L["props"]), "props ·", len(L["buildings"]), "buildings ·", len(L["towers"]), "towers +", len(L["fabric"]), "fabric ·",
          len(L["nav"]["nodes"]), "nav nodes ·", len(L["nav"]["edges"]), "edges")

def crop(a, anc):
    al = a[..., 3] > 0
    if not al.any(): return None, None
    ys, xs = np.where(al); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    return a[y0:y1, x0:x1], (anc[0] - x0, anc[1] - y0)

def write_atlas(items, path):
    """items: [(key, rgba, anchor)] -> {key: [x, y, w, h, ax, ay]}, height"""
    pos, H = pack([(k, a) for k, a, _ in items]); A = np.zeros((H, 2048, 4), np.uint8); F = {}
    for k, a, anc in items:
        x, y = pos[k]; h, w = a.shape[:2]; A[y:y + h, x:x + w] = a; F[k] = [x, y, w, h] + [round(float(v), 1) for v in anc]
    Image.fromarray(A).save(path, optimize=True); return F, H

def build_atlas():
    frames = build_kit(); G = gtex(); main, emi, snow, shad = [], [], [], []
    for k, r in frames:
        img, anc = crop(r["img"], r["anchor"]); main.append((k, img, anc))
        if r.get("shadow_any"):
            sh, sa = crop(r["shadow"], r["shadow_anchor"])
            h2, w2 = (sh.shape[0] + 1) // 2, (sh.shape[1] + 1) // 2; pad = np.zeros((h2 * 2, w2 * 2, 4), np.uint8); pad[:sh.shape[0], :sh.shape[1]] = sh
            half = pad.reshape(h2, 2, w2, 2, 4).max(axis=(1, 3)); shad.append((k, half, (sa[0] / 2, sa[1] / 2)))
        if r.get("snow_any") and not k.startswith(("brt_bus", "dog")):
            sn, na = crop(r["snow"], r["anchor"]); snow.append((k, sn, na))
        if r["emit_any"]:
            em, ea = crop(r["emit"], r["anchor"]); emi.append((k, em, ea))
    for k, a in G.items(): main.append(("g/" + k, a, (0, 0)))
    fac = {}
    for name, S in FAC.items():
        img, em, _ = facade(name, S); main.append(("fac/" + name, img, (0, 0))); fac[name] = dict(w=S["w"], h=S["h"], emit=bool(em[..., 3].any()))
        if em[..., 3].any(): emi.append(("fac/" + name, em, (0, 0)))          # same size as the texture (uncropped: it tiles)
    D = os.path.join(ROOT, "kit_cbd"); os.makedirs(D, exist_ok=True)
    F, H = write_atlas(main, os.path.join(D, "kit_atlas.png"))
    EF, EH = write_atlas(emi, os.path.join(D, "kit_emit.png"))
    SF, SH = write_atlas(snow, os.path.join(D, "kit_snow.png"))
    HF, HH = write_atlas(shad, os.path.join(D, "kit_shadow.png"))
    pieces = {n: dict(rots=P["rots"], states=P["states"], seasons=P["seasons"], foot=P["foot"], vars=P["vars"]) for n, P in PIECES.items()}
    geo = {k: r["geo"] for k, r in frames}
    man = dict(version=2, doc="kit_cbd: frame key = piece/variant/state/season/rot (season '-' = all seasons) ; frames[key] = [x, y, w, h, anchorX, anchorY] in kit_atlas.png "
               "(anchor = pixel of the piece origin); shadowf[key] = ground shadow mask at HALF scale in kit_shadow.png (draw x2, smoothed); emitf[key] = same layout in kit_emit.png (night emissive, cropped); snowf[key] in kit_snow.png "
               "(up-facing snow cover, loaded lazily); g/<mat> = 128x64 seamless screen-space ground tiles (origin = world 0,0); fac/<style> = facade module texture "
               "(u = 32 texel/m along the face, z = 39.19 texel/m up), emitf['fac/<style>'] = its lit windows / displays. geo[key] = local AABB [x0,y0,z0,x1,y1,z1] m.",
               atlas="kit_atlas.png", emit_atlas="kit_emit.png", snow_atlas="kit_snow.png", atlas_size=[2048, H], emit_size=[2048, EH], snow_size=[2048, SH],
               frames=F, emitf=EF, snowf=SF, shadowf=HF, shadow_atlas="kit_shadow.png", shadow_size=[2048, HH], pieces=pieces, geo=geo, facades=fac,
               projection=dict(px_x_per_m=32, px_y_per_m=16, px_z_per_m=R.PZ, sun_world=[round(float(v), 4) for v in R.SUN]))
    s = json.dumps(man, separators=(",", ":"))
    open(os.path.join(D, "kit_manifest.json"), "w").write(s); open(os.path.join(D, "kit_manifest.js"), "w").write("/* generated by tools/build_cbd.py */\nwindow.KIT_CBD_MANIFEST=" + s + ";\n")
    print("kit_cbd:", len(F), "frames, atlas 2048 x", H, "· emit", len(EF), "x", EH, "· snow", len(SF), "x", SH)
    return dict(frames=len(F), atlas=[2048, H])

if __name__ == "__main__":
    main()
