"""scene-proto-45: author the concept-art block (井槐里12号 corner) as data -> scene.json (+ scene.js for file://).
   python3 tools/build_scene.py        (fails if an NPC route is not clear of every footprint by its radius + margin)
World: metres, x east, y north, z up. The camera looks north-east (yaw 45, pitch 30, 2:1 dimetric):
   screen_x = (x - y) * 32, screen_up = (x + y) * 16 + z * 39.19  -> world east = screen up-right, north = up-left.
Layout (like web-demo/img/bg/ext_day.jpg): 6-storey 12号 on the block corner (x -6..9, y 13..25, main facade = south
face, screen right), courtyard in front behind a brick wall with an iron gate, sidewalk, main road (E-W, y -6..0)
crossing the side road (N-S, x 22..28) with two zebra crossings, parked car, breakfast stall, locker, trees, poles, a
3-storey neighbour across the side road."""
import json, os, random, math
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
KIT = json.load(open(os.path.join(ROOT, "kit", "kit_manifest.json")))
for _k, _v in json.load(open(os.path.join(ROOT, "kit_int", "kit_manifest.json")))["pieces"].items(): KIT["pieces"].setdefault(_k, _v)   # Stage 5: eateries live in the int kit
rnd = random.Random(45)
objs = []
def add(type_, x, y, z=0.0, rot=0, state=None, id_=None, **kw):
    assert type_ in KIT["pieces"], type_
    o = {"id": id_ or f"{type_}_{len(objs):03d}", "type": type_, "x": round(x, 3), "y": round(y, 3)}
    if z: o["z"] = z
    if rot: o["rot"] = rot
    if state: o["state"] = state
    o.update(kw); objs.append(o); return o

# ---------------- ground: 2 m chunks, SW corner origin, rows south -> north
# Stage 2: the ground covers 104 x 104 m (x -44..60, y -40..64) so the camera (clamped to it) never shows void, even at
# zoom 0.5 on a desktop; the walkable block (bounds) stays the inner ~70 x 45 m.
X0, Y0, COLS, ROWS = -44, -40, 70, 52          # Stage 5: ground runs east to x = 96 (the streamed east chunk)
X1, Y1 = X0 + 2 * COLS, Y0 + 2 * ROWS
ROAD_Y = (-6, 0); ROAD_X = (22, 28)
grng = random.Random(7)
TREEPITS = {(-8, 0), (12, 0), (18, 14), (30, 10), (-30, 0), (-38, 0), (40, 0), (52, 0), (-34, -10), (-18, -10), (-2, -10), (14, -10), (34, -10), (50, -10),
            (18, 26), (30, 24)}
def ground_at(x, y):
    on_main = ROAD_Y[0] <= y < ROAD_Y[1]; on_side = ROAD_X[0] <= x < ROAD_X[1]
    if on_main or on_side: return rnd.choice("AAAB")
    if (x, y) in TREEPITS: return "T"
    if 62 <= x < 64 and 4 <= y < 32: return "S"                       # Stage 5: the alley around the corner (east chunk)
    if -10 <= y < -6 or 28 <= x < 32 or 0 <= y < 4 or 16 <= x < 22: return "S"
    if -12 <= x < 16 and 4 <= y < 34: return "C"                       # the 12号 courtyard
    if -16 <= x < -12 and 4 <= y < 34: return "S"                      # alley west of the courtyard wall
    if x < -12 and 4 <= y < 6: return "S"
    if 39.0 <= x < 44.0 and -10.5 <= y < -6.0: return "A"              # dark asphalt pit under the metro stair mouth
    if 36 <= x < 48 and -14 <= y < -5: return "S"                      # plaza around 井槐里站 glass pavilion
    if -16 <= y < -10: return "G" if grng.random() < 0.8 else "K"      # green belt south of the main road
    return "G" if grng.random() < 0.18 else "K"                        # back yards / concrete lots
rows = ["".join(ground_at(X0 + 2 * c, Y0 + 2 * r) for c in range(COLS)) for r in range(ROWS)]
ground = {"origin": [X0, Y0], "chunk": 2, "cols": COLS, "rows": ROWS,
          "legend": {"A": "g_asphalt:a", "B": "g_asphalt:b", "S": "g_sidewalk", "C": "g_court", "T": "g_treepit", "G": "g_grass", "K": "g_concrete"},
          "data_south_to_north": rows}

# ---------------- curbs + road markings (baked into the ground layer)
for x in range(X0 + 1, X1, 2):
    if not (ROAD_X[0] - 0.1 < x < ROAD_X[1] + 0.1):
        add("p_curb", x, 0.1, id_=f"curb_n{x}"); add("p_curb", x, -6.1, id_=f"curb_s{x}")
for y in range(Y0 + 1, Y1, 2):
    if not (ROAD_Y[0] - 0.1 < y < ROAD_Y[1] + 0.1):
        add("p_curb", 21.9, y, rot=2, id_=f"curb_w{y}"); add("p_curb", 28.1, y, rot=2, id_=f"curb_e{y}")
CW_MAIN = {"id": "cw_main", "x0": 10.0, "x1": 14.0, "y0": -6.0, "y1": 0.0, "road": "x"}       # across the main road
CW_SIDE = {"id": "cw_side", "x0": 22.0, "x1": 28.0, "y0": 6.0, "y1": 9.6, "road": "y"}        # across the side road
for i in range(35):
    x = X0 + 1.5 + 3 * i
    if not (CW_MAIN["x0"] - 1.5 < x < CW_MAIN["x1"] + 1.5) and not (ROAD_X[0] - 1.5 < x < ROAD_X[1] + 1.5): add("d_center_dash", x, -3.0, id_=f"dash_m{i}")
for i in range(35):
    y = Y0 + 1.5 + 3 * i
    if not (CW_SIDE["y0"] - 1.5 < y < CW_SIDE["y1"] + 1.5) and not (ROAD_Y[0] - 1.5 < y < ROAD_Y[1] + 1.5): add("d_center_dash", 25.0, y, rot=2, id_=f"dash_s{i}")
for x in range(X0 + 1, X1, 2):
    if not (CW_MAIN["x0"] - 1 < x < CW_MAIN["x1"] + 1) and not (ROAD_X[0] - 1 < x < ROAD_X[1] + 1):
        add("d_edge_line", x, -0.35, id_=f"edge_n{x}"); add("d_edge_line", x, -5.65, id_=f"edge_s{x}")
for y in range(Y0 + 1, Y1, 2):
    if not (CW_SIDE["y0"] - 1 < y < CW_SIDE["y1"] + 1) and not (ROAD_Y[0] - 1 < y < ROAD_Y[1] + 1):
        add("d_edge_line", 22.35, y, rot=2, id_=f"edge_w{y}"); add("d_edge_line", 27.65, y, rot=2, id_=f"edge_e{y}")
for k in range(6):   # zebra bars run with the traffic (piano keys), stacked across the road
    add("d_stripe", 12.0, -5.45 + 1.0 * k, rot=2, id_=f"zebra_m{k}")
    add("d_stripe", 22.55 + 0.98 * k, 7.8, id_=f"zebra_s{k}")
add("d_stopline", 9.6, -4.5, id_="stop_eb"); add("d_stopline", 14.4, -1.5, id_="stop_wb")
add("d_stopline", 26.5, 5.6, rot=2, id_="stop_nb"); add("d_stopline", 23.5, 10.0, rot=2, id_="stop_sb")
add("d_manhole", 4.5, -2.0, id_="manhole1"); add("d_manhole", 24.0, 16.0, id_="manhole2"); add("d_manhole", 3.0, 8.5, id_="manhole3")

# ---------------- courtyard wall (south, y=4.3) with gate, fence + wall on the east (x=16.65), wall on the west
WY, EX, WX = 4.3, 16.65, -12.3
for i, cx in enumerate(range(-11, 4, 2)): add("w_wall", cx, WY, state="poster" if cx == -1 else "plain", id_=f"wall_s{i}", fade_group="front_wall", **({"interact": "poster"} if cx == -1 else {}))
add("w_pillar", 4.27, WY, id_="pillar_l", fade_group="front_wall")
add("w_gate_l", 4.54, WY, state="open", id_="gate_l", fade_group="front_wall", interact="gate")
add("w_gate_r", 7.84, WY, state="open", id_="gate_r", fade_group="front_wall", interact="gate")
add("w_pillar", 8.11, WY, id_="pillar_r", fade_group="front_wall")
for i, cx in enumerate((9.38, 11.38, 13.38, 15.38)): add("w_wall", cx, WY, state="poster" if i == 2 else "plain", id_=f"wall_se{i}", fade_group="front_wall", **({"interact": "poster"} if i == 2 else {}))
add("w_pillar", EX, WY, id_="pillar_c", fade_group="front_wall")
for i in range(13):
    cy = WY + 1.27 + 2 * i
    add("w_fence" if 1 <= i <= 6 else "w_wall", EX, cy, rot=6, id_=f"wall_e{i}", fade_group="east_wall")
for i in range(14):
    add("w_wall", WX, WY + 1.0 + 2 * i, rot=6, id_=f"wall_w{i}", fade_group="west_wall")

# ---------------- building 井槐里12号: x -6..9 (5 bays, south face y=13), y 13..25 (4 bays, west face x=-6), 6 floors
BX0, BX1, BY0, BY1, FLOORS = -6.0, 9.0, 13.0, 25.0, 6
S_BAYS = [BX0 + 3 * i for i in range(5)]; W_BAYS = [BY0 + 3 * (i + 1) for i in range(4)]   # rot 6 bays run -y from origin
DOOR_BAY = 0.0
vr = random.Random(1212)                     # weathering variants per module (seeded: stable, non-repetitive)
def pick(opts): return vr.choice(opts)
def facade(face, bx, fl, bay_i):
    z = 3.0 * fl; rot = 0 if face == "S" else 6
    x, y = (bx, BY0) if face == "S" else (BX0, bx)
    tag = f"{face}{fl + 1}F_{bay_i}"
    add("f_wall", x, y, z, rot=rot, state="ground" if fl == 0 else "upper", id_=f"wall_{tag}", fade_group="b12", variant=pick(["base", "w1", "w1", "w2"]))
    if face == "S" and fl == 0 and bx == DOOR_BAY:
        add("f_door", x, y, z, state="closed", id_="unit_door", fade_group="b12", interact="door", plate="井槐里 12号"); return
    # 2F-02 (fl 1, S bay 3): protruding enclosed glass balcony on the south facade (variant b2) so the street camera
    # matches neighbours; interior walkable balcony stays on the north (courtyard) side — facade is the street-visible twin.
    balcony = fl > 0 and ((face == "S" and (bay_i in (1, 3)) and fl != 3) or (face == "S" and fl == 3 and bay_i in (0, 4)) or (face == "W" and bay_i == 2 and fl in (2, 4)))
    if balcony:
        st = "laundry" if (fl + bay_i) % 2 else "default"
        var = "b2" if tag == "S2F_3" else pick(["base", "b1", "b2"])   # 2F-02: enclosed glass protrusion
        if tag == "S2F_3": st = "default"                             # laundry toggled live from the room rack
        o = add("f_balcony", x, y, z, rot=rot, state=st, id_=f"balc_{tag}", fade_group="b12", variant=var)
        if tag == "S2F_3": o["player_balcony"] = True
        if tag == "S2F_3" and not any(q["id"] == "ac_S2F_3" for q in objs):
            q = add("f_ac", x + 1.15, y - 0.02, z + 0.22, rot=rot, id_="ac_S2F_3", fade_group="b12", variant="base"); q["player_ac"] = True
    else:
        o = add("f_window", x, y, z, rot=rot, state="intact", id_=f"win_{tag}", fade_group="b12",
                variant="base" if tag in ("S2F_4", "S1F_3") else pick(["base", "w1", "w2"]))
        if rnd.random() < 0.55: o["night_lit"] = True
        if face == "S" and fl == 0: o["interact"] = "window"
        if fl > 0 and rnd.random() < 0.5:
            ax, ay = (x + 1.5 + rnd.choice((-0.9, 0.9)), y) if face == "S" else (x, y - 1.5 + rnd.choice((-0.9, 0.9)))
            add("f_ac", ax, ay, z + 0.15, rot=rot, id_=f"ac_{tag}", fade_group="b12", variant=pick(["base", "a1", "a2"]))
        if tag == "S2F_3" and not any(q["id"] == "ac_S2F_3" for q in objs):   # 2F-02's own outdoor unit (fan spins while 李默's AC runs)
            q = add("f_ac", x + 1.15, y - 0.02, z + 0.22, rot=rot, id_="ac_S2F_3", fade_group="b12", variant="base"); q["player_ac"] = True
for fl in range(FLOORS):
    for i, bx in enumerate(S_BAYS): facade("S", bx, fl, i)
    for i, by in enumerate(W_BAYS): facade("W", by, fl, i)
    add("f_pipe", BX1 - 0.15, BY0, 3.0 * fl, id_=f"pipe_s{fl}", fade_group="b12")
    add("f_pipe", BX0, BY1 - 0.15, 3.0 * fl, rot=6, id_=f"pipe_w{fl}", fade_group="b12")
# walkable roof (Stage 3): deck slab + N/E parapets in one sprite; S/W parapets + every prop are separate sorted objects
RZ = 3.0 * FLOORS
add("b_roof_deck", BX0, BY0, RZ, id_="roof_12", fade_group="b12", sortz=[-0.4, 0.0])   # a floor: everything on the roof sorts above it
for i in range(8): add("p_parapet", BX0 + 1.0 + 2.0 * i - (0.0 if i < 7 else 1.0), BY0 + 0.12, RZ, id_=f"par_s{i}", on_roof="b12")
for i in range(6): add("p_parapet", BX0 + 0.12, BY0 + 1.0 + 2.0 * i, RZ, rot=2, id_=f"par_w{i}", on_roof="b12")
add("i_roofhut", -1.5, 19.9, RZ, state="closed", id_="roof_hut", on_roof="b12", interact="stairs", go="down", to="stair_6f", reach=[-1.1, 18.45])
add("p_tank", 6.6, 22.6, RZ, id_="roof_tank", on_roof="b12"); add("p_tank", 4.6, 23.3, RZ, id_="roof_tank2", on_roof="b12")
add("p_solar", 1.6, 23.4, RZ, id_="roof_solar", on_roof="b12")
add("p_antenna", 7.9, 15.0, RZ, id_="roof_ant1", on_roof="b12"); add("p_antenna", -4.6, 23.9, RZ, id_="roof_ant2", on_roof="b12")
for i, (px, py) in enumerate(((-4.4, 15.4), (1.2, 15.4), (-4.4, 17.0), (1.2, 17.0))):
    add("p_post", px, py, RZ, id_=f"rpost_{i + 1}", on_roof="b12", **({"interact": "roof_line"} if i == 3 else {}))
add("p_pot", 7.6, 13.9, RZ, state="grown", id_="roof_pot1", on_roof="b12"); add("p_pot", -5.2, 21.0, RZ, state="grown", id_="roof_pot2", on_roof="b12")
ROOF = {"id": "roof12", "z": RZ, "rect": [BX0 + 0.3, BY0 + 0.3, BX1 - 0.3, BY1 - 0.3], "spawn": [-1.1, 18.3, "S"],
        "portals": [{"id": "down_6f", "rect": [-1.6, 18.62, -0.6, 19.0], "dir": "N", "to": "stair_6f", "spawn": [6.42 + 0.58, 0.34, "S"], "label": "下楼（6F）", "door": "roof_hut"}]}
add("f_steps", DOOR_BAY + 1.5, BY0, id_="steps")
add("f_sign", DOOR_BAY + 1.5, BY0, 3.04, id_="sign_12", fade_group="b12")

# ---------------- generic residential block from the same modules (S face nx bays along x, W face ny bays along y)
colliders = [{"id": "building_12", "rect": [BX0 - 0.3, BY0 - 0.3, BX1, BY1]}]      # incl. the ground-floor window cages
PLATE = [0]
EATERY = {"noodle": ("兰州牛肉面", "noodle", ["06:30", "21:30"], "f_sign_noodle"), "kuaican": ("好味快餐", "kuaican", ["10:30", "20:30"], "f_sign_kc"),
          "tea": ("茶语奶茶", "tea", ["10:00", "23:00"], "f_sign_tea")}
def block(tag, x0, y0, nx, ny, floors, style="brick", seed=0, door=None, shop=(), roofvar="base", eatery=None):
    r = random.Random(seed)
    if door is None and not shop: door = ("S", nx // 2)          # hotfix: every block has a street entrance (lamp + lit doorplate at night)
    PLATE[0] += 2; PLATE[0] += 2 if PLATE[0] == 12 else 0; plate = f"井槐里 {PLATE[0]}号"
    wv = {"brick": ["base", "w1", "w1", "w2"], "old": ["w1", "w2", "w2"], "plaster": ["p1"]}[style]
    for fl in range(floors):
        for face, n in (("S", nx), ("W", ny)):
            for i in range(n):
                rot = 0 if face == "S" else 6; x, y = (x0 + 3 * i, y0) if face == "S" else (x0, y0 + 3 * (i + 1)); z = 3.0 * fl
                t = f"{tag}_{face}{fl + 1}F_{i}"
                if fl == 0 and eatery and (face, i) in eatery:          # Stage 5: street-front eatery bay + its sign
                    kind = eatery[(face, i)]; nm, place, hrs, sign = EATERY[kind]
                    add("f_eatery", x, y, 0, rot=rot, state=kind, id_=f"{t}_eat", fade_group=tag, interact="eatery", place=place, name=nm, hours=hrs, open_state=kind)
                    sx, sy = (x + 1.5, y) if face == "S" else (x, y - 1.5)
                    add(sign, sx, sy, 2.47, rot=rot, id_=f"{t}_sign", fade_group=tag)
                    continue
                if fl == 0 and (face, i) in shop:
                    o = add("f_shop", x, y, 0, rot=rot, state="door" if (face, i) == shop[0] else "window", id_=f"{t}_shop", fade_group=tag)
                    if tag == "shop24": o.update({"interact": "shop", "hours": ["00:00", "24:00"], "name": "24便利店"} if (face, i) == shop[0] else {})
                    if tag == "shop24" and (face, i) == ("W", 2): o.update({"interact": "shop", "hours": ["08:00", "21:00"], "name": "街坊药房", "open_state": "window"})
                    continue
                add("f_wall", x, y, z, rot=rot, state="ground" if fl == 0 else "upper", id_=f"{t}_wall", fade_group=tag, variant=r.choice(wv))
                if fl == 0 and door == (face, i):
                    add("f_door", x, y, 0, rot=rot, state="closed", id_=f"{t}_door", fade_group=tag, plate=plate); continue
                if fl > 0 and r.random() < 0.22:
                    add("f_balcony", x, y, z, rot=rot, state="laundry" if r.random() < 0.6 else "default", id_=f"{t}_balc", fade_group=tag, variant=r.choice(["base", "b1", "b2"]))
                    continue
                add("f_window", x, y, z, rot=rot, state="intact", id_=f"{t}_win", fade_group=tag, night_lit=r.random() < 0.5, variant=r.choice(["base", "w1", "w2", "w1"]))
                if fl > 0 and r.random() < 0.4:
                    ax, ay = (x + 1.5 + r.choice((-0.9, 0.9)), y) if face == "S" else (x, y - 1.5 + r.choice((-0.9, 0.9)))
                    add("f_ac", ax, ay, z + 0.15, rot=rot, id_=f"{t}_ac", fade_group=tag, variant=r.choice(["base", "a1", "a2"]))
        add("f_pipe", x0 + 3 * nx - 0.15, y0, 3.0 * fl, id_=f"{tag}_pipe_s{fl}", fade_group=tag)
    if (nx, ny) == (4, 3): add("b_roof_b", x0, y0, 3.0 * floors, id_=f"{tag}_roof", fade_group=tag, variant=roofvar)
    else: assert (nx, ny) == (5, 4); add("b_roof_a", x0, y0, 3.0 * floors, id_=f"{tag}_roof", fade_group=tag)
    colliders.append({"id": tag, "rect": [x0 - 0.3, y0 - 0.3, x0 + 3 * nx, y0 + 3 * ny]})

# 24便利店: corner shop building across the side road (shop on the ground floor of both street faces, green lit sign)
SX0, SY0 = 32.5, 4.5
block("shop24", SX0, SY0, 4, 3, 4, "plaster", seed=24, shop=(("S", 1), ("S", 0), ("S", 2), ("S", 3), ("W", 0), ("W", 1), ("W", 2)), roofvar="c")
add("f_shopsign", SX0 + 3.0, SY0, 2.47, id_="shop24_sign_s", fade_group="shop24")
add("f_shopsign", SX0, SY0 + 4.5, 2.47, rot=6, id_="shop24_sign_w", fade_group="shop24")
# the rest of the block: neighbours north / east, a row north of the courtyard, a column west of the alley,
# low back-to-back houses south of the main road (2 storeys so they do not hide the street)
block("nb_n1", 32.5, 17.0, 4, 3, 5, "brick", seed=31, door=("S", 1))
block("nb_n2", 32.5, 30.0, 4, 3, 4, "old", seed=32, roofvar="c")
block("nb_e1", 47.0, 4.5, 4, 3, 3, "old", seed=33, door=("S", 2), roofvar="c", eatery={("S", 0): "noodle", ("S", 1): "kuaican"})
# Stage 5 street extension (east chunk): past the alley around the corner, another block with the milk-tea shop
block("nb_e4", 64.0, 4.5, 4, 3, 4, "brick", seed=36, door=("W", 1), eatery={("S", 1): "tea"})
block("nb_e5", 64.0, 17.0, 4, 3, 5, "old", seed=37, roofvar="c")
block("nb_e6", 79.0, 4.5, 4, 3, 3, "plaster", seed=38, roofvar="c")
block("nb_e2", 47.0, 17.0, 5, 4, 6, "brick", seed=34)
block("nb_e3", 47.0, 34.0, 4, 3, 5, "plaster", seed=35)
block("nb_c1", -10.0, 35.5, 5, 4, 6, "brick", seed=41)
block("nb_c2", 7.0, 36.5, 4, 3, 5, "plaster", seed=42, roofvar="c")
block("nb_w1", -28.0, 6.5, 4, 3, 3, "old", seed=51, door=("S", 1), roofvar="c")
block("nb_w2", -28.0, 20.0, 4, 3, 3, "brick", seed=52)
block("nb_w3", -31.0, 35.0, 5, 4, 5, "plaster", seed=53)
block("nb_w4", -43.0, 6.5, 4, 3, 4, "brick", seed=54)
block("nb_w5", -43.0, 20.0, 4, 3, 3, "old", seed=55, roofvar="c")
for i, x0 in enumerate((-42.0, -27.0, -10.0, 5.0, 31.0, 46.0)):
    block(f"nb_s{i}", x0, -29.0, 4, 3, 2, ("old", "brick", "plaster")[i % 3], seed=60 + i, roofvar="c" if i % 2 else "base")

# ---------------- props
add("p_tree", -7.0, 1.0, id_="tree_sw"); add("p_tree", 13.0, 1.0, id_="tree_se"); add("p_tree", 19.0, 15.0, id_="tree_side", variant="t2")
add("p_tree", -9.0, 9.0, id_="tree_west"); add("p_tree", 12.5, 19.5, id_="tree_court", variant="t2")
for (tx, ty) in TREEPITS:
    if (tx, ty) in ((-8, 0), (12, 0), (18, 14), (30, 10)): continue
    # main-road kerb trees (ty 0, over the bus lane) use the base shape: its canopy band starts below the bus roof, so the
    # bus / canopy / lamp-pole order is decided by the footprints (the taller t2 canopy made a bus-canopy-pole sort cycle)
    add("p_tree", tx + 1.0, ty + 1.0, id_=f"tree_{tx}_{ty}", variant="t2" if (tx + ty) % 4 and ty != 0 else "base")
add("p_tree", 31.0, 11.0, id_="tree_far", variant="t2")
for i, x in enumerate((-40.0, -31.0, -22.0, -13.0, -4.0, 5.0, 23.0, 35.0, 55.0)):            # green belt (skip 44 — sits on the metro entrance)
    add("p_tree", x, -14.0 + (i % 2) * 1.2, id_=f"tree_belt{i}", variant="base" if i % 3 else "t2")
add("p_pole", -3.0, 0.5, id_="pole_w"); add("p_pole", 17.5, 0.5, id_="pole_e"); add("p_pole", 21.5, 12.0, rot=2, id_="pole_n")
add("p_tree", 61.0, 13.0, id_="tree_alley", variant="t2"); add("p_tree", 78.0, 1.0, id_="tree_e4"); add("p_pole", 62.5, 0.5, id_="pole_e4")
add("p_metro_entry", 41.2, -8.2, rot=0, state="open", id_="metro_jhl", interact="metro", to="metro_jhl", name="井槐里站", hours=["06:00", "23:00"], reach=[41.2, -10.6])  # glass pavilion mouth faces N (sidewalk); READY 20:42   # (inside the walkable bounds y0 -11.5) Stage 5: metro entrance (mouth faces west)
add("p_bins", 60.4, 9.6, id_="bins_alley"); add("p_ebike", 72.5, 2.6, rot=2, id_="ebike_tea")
add("p_pole", -27.0, 0.5, id_="pole_w2"); add("p_pole", -41.0, 0.5, id_="pole_w3"); add("p_pole", 36.5, 0.5, id_="pole_e2"); add("p_pole", 54.0, 0.5, id_="pole_e3")
add("p_stall", 0.5, 2.2, id_="stall", interact="stall")
add("p_locker", 11.0, 14.6, id_="locker", interact="locker")
add("p_car", 14.6, 8.5, rot=0, state="normal", variant="base", id_="parked_car", interact="car")
add("p_car", 30.0, 20.5, rot=0, state="normal", variant="red", id_="parked_car2")
add("p_bins", -4.5, 12.0, id_="bins"); add("p_bins", 45.6, 3.5, id_="bins_shop")
add("p_notice", 10.5, 4.75, id_="notice")
add("p_ebike", 3.0, 6.2, id_="ebike"); add("p_ebike", 30.3, 3.0, rot=2, id_="ebike_shop")
add("p_bikes", -14.6, 9.0, rot=6, id_="bikes_alley"); add("p_bikes", 41.0, 2.9, id_="bikes_shop"); add("p_bikes", 14.0, 27.5, id_="bikes_court")
add("p_planter", -0.75, 12.25, id_="planter_l"); add("p_planter", 3.75, 12.25, id_="planter_r")
add("p_planter", -14.0, 15.5, rot=6, id_="planter_alley"); add("p_planter", 36.0, 3.9, id_="planter_shop")
add("p_hedge", -9.0, 14.0, rot=6, id_="hedge_w0"); add("p_hedge", -9.0, 16.0, rot=6, id_="hedge_w1")
add("p_hedge", 10.5, 23.0, id_="hedge_n0"); add("p_planter", 7.5, 1.0, id_="planter_sw")
for i, x in enumerate((-36.0, -26.0, -9.0, 9.0, 27.0, 33.5)): add("p_hedge", x, -11.3, id_=f"hedge_belt{i}")
# ---- interactive / destructible street furniture (ported from scene-proto: rules in "interactions" below)
for i, x in enumerate((-18.5, -11.0, 3.2, 8.4, 19.0)): add("p_lamp", x, 0.75, id_=f"lamp{i}", interact="lamp")
add("p_trashbin", -5.0, 1.0, id_="trashbin1", interact="trashbin"); add("p_trashbin", 30.2, 14.5, id_="trashbin2", interact="trashbin")
for i, y in enumerate((0.9, 2.1, 3.3)): add("p_bike", -15.6, y, rot=2 if i != 1 else 6, state="parked", id_=f"sbike{i}", interact="bike")
add("p_vending", 33.5, 3.7, id_="vending", interact="vending")
add("p_pot", 8.0, 11.6, state="small", id_="pot1", interact="pot"); add("p_pot", -3.0, 11.8, state="grown", id_="pot2", interact="pot")
add("p_hydrant", 9.6, 1.0, id_="hydrant", interact="hydrant")
add("p_post", -7.6, 7.0, id_="post_1"); add("p_post", -3.4, 7.0, id_="post_2")
colliders.append({"id": "laundry_1", "rect": [-7.5, 6.9, -3.5, 7.1]})            # the laundry line: no walking through the sheets
BUS_STOP_X = -20.0
add("p_busstop", BUS_STOP_X, 2.4, id_="bus_stop")

INTERACTIONS = json.loads(r'''{"_doc": "per interact kind (ported from scene-proto): use (E / 互动) and kick (F / 踢) actions by current state; repair / grow = state -> state after N in-game hours", "lamp": {"name": "路灯", "use": {"ok": {"label": "拍拍灯杆", "toast": "路灯：天黑自动亮"}, "broken": {"label": "拍拍灯杆", "toast": "灯泡一闪一闪的……"}}, "kick": {"ok": {"label": "踢灯杆", "to": "broken", "fx": "glass", "hazard": 0.8, "log": "{name}被踢坏，灯头歪了，一闪一闪"}}, "repair": {"broken": {"to": "ok", "after_h": 6, "log": "电工修好了{name}"}}}, "trashbin": {"name": "垃圾桶", "use": {"knocked": {"label": "扶起并收拾", "to": "upright", "clear_decals": true, "log": "李默扶起垃圾桶、把垃圾收拾干净"}, "upright": {"label": "看看", "toast": "可回收 / 其他垃圾"}}, "kick": {"upright": {"label": "踢翻", "to": "knocked", "decal": "fx/litter", "decal_dy": -0.55, "log": "垃圾桶被踢翻，垃圾撒了一地"}}, "repair": {"knocked": {"to": "upright", "after_h": 2, "clear_decals": true, "log": "环卫工把翻倒的垃圾桶收拾好了"}}}, "bike": {"name": "共享单车", "use": {"parked": {"label": "扫码推车", "do": "push_bike"}, "knocked": {"label": "扶起来", "to": "parked", "log": "李默把倒地的单车扶了起来"}}, "kick": {"parked": {"label": "推倒", "to": "knocked", "log": "一辆共享单车被推倒在人行道上"}}, "repair": {"knocked": {"to": "parked", "after_h": 3, "log": "单车调度员把倒地的单车扶正了"}}}, "vending": {"name": "自动售货机", "use": {"ok": {"label": "买饮料 ¥3", "do": "buy_drink", "toast": "咣当——买了一瓶冰红茶（¥3）"}, "broken": {"label": "看看", "toast": "暂停服务 · 维修中"}}, "kick": {"ok": {"label": "踹一脚", "to": "broken", "fx": "glass", "hazard": 0.9, "log": "售货机被踹坏，玻璃碎了，显示「暂停服务」"}}, "repair": {"broken": {"to": "ok", "after_h": 8, "log": "售货机维修完毕，恢复营业"}}}, "shop": {"name": "小店", "use": {"open": {"label": "进店看看", "toast": "{name}：营业中（{hours}）"}, "closed": {"label": "看看", "toast": "{name}已打烊，卷帘门拉下了（{hours}）"}}}, "poster": {"name": "墙上海报", "use": {"poster": {"label": "看海报", "toast": "寻猫启事：橘猫「大黄」，酬谢"}, "torn": {"label": "看看", "toast": "只剩几片纸屑和胶痕"}}, "kick": {"poster": {"label": "撕海报", "to": "torn", "fx": "paper", "log": "围墙上的海报被撕掉了"}}, "repair": {"torn": {"to": "poster", "after_h": 24, "log": "有人在围墙上贴了新海报"}}}, "window": {"name": "一楼窗户", "use": {"intact": {"label": "敲敲窗", "toast": "屋里没人应"}, "boarded": {"label": "看看", "toast": "木板临时钉住了"}}, "kick": {"intact": {"label": "砸窗", "to": "broken", "fx": "glass_window", "hazard_at": [1.5, -0.9], "hazard": 1.0, "log": "一楼窗户被砸碎，碎玻璃落了一地"}}, "repair": {"broken": {"to": "boarded", "after_h": 2, "clear_hazard": true, "log": "物业用木板把破窗钉上了"}, "boarded": {"to": "intact", "after_h": 10, "log": "玻璃师傅换好了新窗玻璃"}}}, "pot": {"name": "盆栽", "use": {"small": {"label": "浇水", "do": "water", "toast": "浇了水，过一会儿会长大"}, "grown": {"label": "浇水", "do": "water", "toast": "长得很茂盛"}, "broken": {"label": "看看", "toast": "花盆碎了，土撒了一地"}}, "kick": {"small": {"label": "踢翻", "to": "broken", "fx": "pot", "log": "盆栽被踢碎了"}, "grown": {"label": "踢翻", "to": "broken", "fx": "pot", "log": "盆栽被踢碎了"}}, "grow": {"small": {"to": "grown", "after_h": 1}}, "repair": {"broken": {"to": "small", "after_h": 12, "log": "邻居换了新花盆，重新种上小苗"}}}, "hydrant": {"name": "消防栓", "use": {"ok": {"label": "拧开 / 关上阀门", "do": "toggle_spray"}, "broken": {"label": "看看", "toast": "消防栓被撞断，水柱冲天！"}}, "repair": {"broken": {"to": "ok", "after_h": 3, "log": "市政抢修，消防栓修好了"}}}, "car": {"name": "停着的车", "use": {"normal": {"label": "按喇叭", "do": "honk"}}, "kick": {"normal": {"label": "踢轮胎", "do": "alarm", "log": "停着的车被踢了一脚，警报大作"}}}, "gate": {"name": "铁门"}, "door": {"name": "单元门"}, "stall": {"name": "早点摊"}, "locker": {"name": "快递柜"}, "laundry": {"name": "晾衣绳", "use": {"hung": {"label": "摸摸衣服", "toast": "{dry}"}, "fallen": {"label": "捡起来挂好", "to": "hung", "clear_decals": true, "log": "李默把掉在地上的衣服捡起来重新晾好"}, "taken": {"label": "看看", "toast": "下雨了，邻居把衣服收回家了"}}, "kick": {"hung": {"label": "扯晾衣绳", "to": "fallen", "fx": "cloth", "decal": "fx/litter", "decal_dy": -0.4, "log": "晾衣绳被扯断，衣服掉了一地"}}, "repair": {"fallen": {"to": "hung", "after_h": 2, "clear_decals": true, "log": "邻居把晾衣绳重新系好、衣服挂回去了"}}}, "puddle": {"name": "水坑"}, "leafpile": {"name": "落叶堆"}}''')
bounds = {"x0": -24.0, "y0": -11.5, "x1": 46.0, "y1": 34.0}
BOUNDS_EAST = {"x0": -24.0, "y0": -11.5, "x1": 92.0, "y1": 34.0}     # walkable once the east chunk is streamed in

# ---------------- NPC routes (waypoint loops / ping-pong) + build-time clearance check
NPCS = [
    {"id": "office", "sprite": "office", "speed": 1.35, "radius": 0.22, "mode": "pingpong", "umbrella": 2,
     "route": [[-10.5, 3.6], [18.2, 3.6], [19.6, 5.4], [19.6, 27.0]]},
    {"id": "student", "sprite": "student", "speed": 1.3, "radius": 0.22, "mode": "pingpong", "umbrella": 0,
     "route": [[1.5, 11.9], [6.2, 8.0], [6.19, 5.2], [6.19, 2.0], [12.0, 1.9], [12.0, 0.5, "cw_main"], [12.0, -6.6], [12.0, -8.0], [0.0, -8.0]]},
    {"id": "vendor", "sprite": "vendor", "speed": 1.05, "radius": 0.23, "mode": "pingpong", "home": 4, "unless": ["rain", "snow"],
     "route": [[-0.4, 3.6], [6.19, 3.6], [6.19, 6.4], [3.2, 10.5], [1.5, 11.9]]},
    {"id": "uncle", "sprite": "uncle", "speed": 0.9, "radius": 0.24, "mode": "loop", "umbrella": 1,
     "route": [[12.4, 5.6], [12.4, 11.6], [16.05, 11.6], [16.05, 5.6]]},
    {"id": "rider", "sprite": "rider", "speed": 2.6, "radius": 0.34, "mode": "loop", "vehicle": True,
     "route": [[18.1, 28.0], [18.1, 5.7], [20.4, 5.7], [20.4, 28.0]]},
]
NPCS += [
    {"id": "noodle_boss", "name": "牛肉面老板", "sprite": "uncle", "speed": 0.8, "radius": 0.24, "mode": "pingpong", "hours": ["06:30", "21:30"],
     "route": [[48.4, 3.25], [49.6, 3.25]], "dwell": {"0": {"t": 9.0, "dir": "S"}, "1": {"t": 6.0, "dir": "W"}}},
    {"id": "tea_girl", "name": "奶茶店员", "sprite": "student", "speed": 0.9, "radius": 0.22, "mode": "pingpong", "hours": ["10:00", "23:00"],
     "route": [[67.6, 3.0], [69.2, 3.0]], "dwell": {"0": {"t": 7.0, "dir": "S"}, "1": {"t": 7.0, "dir": "S"}}},
    {"id": "walker_e", "name": "下班的白领", "sprite": "office", "speed": 1.3, "radius": 0.22, "mode": "pingpong", "umbrella": 2, "hours": ["07:00", "22:30"],
     "route": [[44.6, 2.0], [62.9, 2.0], [63.0, 4.6], [63.0, 30.0]]},
]
VEH_HALF_LEN = 0.85      # rider + scooter: 3 circles r=0.34 at -0.55/0/+0.55 along the heading (real 1.7 x 0.68 m extent)
MARGIN = 0.08

def rot_pt(x, y, rot):
    a = rot * math.pi / 4; c, s = math.cos(a), math.sin(a); return x * c - y * s, x * s + y * c
def static_polys(gate_open=True):
    out = []
    for o in objs:
        P = KIT["pieces"][o["type"]]
        if P.get("layer") != "sorted": continue
        st = o.get("state", P["states"][0])
        rects = (P.get("footprint_states") or {}).get(st) or P.get("footprint") or []
        for r in rects:
            pts = [rot_pt(px, py, o.get("rot", 0)) for px, py in ((r[0], r[1]), (r[2], r[1]), (r[2], r[3]), (r[0], r[3]))]
            out.append((o["id"], [(o["x"] + px, o["y"] + py) for px, py in pts]))
    for c in colliders:
        x0, y0, x1, y1 = c["rect"]; out.append((c["id"], [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]))
    return out
def dist_pt_poly(px, py, poly):
    inside = True; best = 1e9
    for i in range(len(poly)):
        (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % len(poly)]
        ex, ey = x2 - x1, y2 - y1; L = ex * ex + ey * ey
        t = max(0, min(1, ((px - x1) * ex + (py - y1) * ey) / L)); dx, dy = px - (x1 + ex * t), py - (y1 + ey * t)
        best = min(best, math.hypot(dx, dy))
        if ex * (py - y1) - ey * (px - x1) < 0: inside = False
    return -best if inside else best
POLYS = static_polys()
def check_route(n):
    pts = n["route"]; segs = list(zip(pts, pts[1:])) + ([(pts[-1], pts[0])] if n["mode"] == "loop" else [])
    worst = (9, None, None)
    for a, b in segs:
        L = math.hypot(b[0] - a[0], b[1] - a[1]); k = max(2, int(L / 0.05))
        hx, hy = (b[0] - a[0]) / L, (b[1] - a[1]) / L
        for i in range(k + 1):
            t = i / k; x, y = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
            circles = [(x, y)] if not n.get("vehicle") else [(x + hx * d, y + hy * d) for d in (-0.55, 0, 0.55)]
            for cx, cy in circles:
                if not (bounds["x0"] + n["radius"] <= cx <= BOUNDS_EAST["x1"] - n["radius"] and bounds["y0"] + n["radius"] <= cy <= bounds["y1"] - n["radius"]):
                    worst = min(worst, (-1, "bounds", (round(cx, 2), round(cy, 2))))
                for pid, poly in POLYS:
                    d = dist_pt_poly(cx, cy, poly) - n["radius"]
                    if d < worst[0]: worst = (d, pid, (round(cx, 2), round(cy, 2)))
    # vehicle turning at a corner: sweep the full length circle
    if n.get("vehicle"):
        for x, y, *_ in pts:
            for pid, poly in POLYS:
                d = dist_pt_poly(x, y, poly) - (VEH_HALF_LEN + 0.0)
                if d < worst[0]: worst = (d, pid + "(turn)", (x, y))
    return worst
bad = []
for n in NPCS:
    w = check_route(n); n["clearance_m"] = round(w[0], 3)
    print(f"route {n['id']:8s} min clearance {w[0]:.3f} m  (nearest: {w[1]} at {w[2]})")
    if w[0] < MARGIN: bad.append((n["id"], w))
if bad: raise SystemExit(f"ROUTE CHECK FAILED: {bad}")

# ---------------- Stage 5 chunk streaming: everything east of x = 46.5 lives in chunks/east.json, loaded / unloaded at runtime
CHUNK_X = 46.5
east_objs = [o for o in objs if o["x"] >= CHUNK_X]; east_ids = {o["id"] for o in east_objs}
east_cols = [c for c in colliders if c["rect"][0] >= CHUNK_X - 0.6]
objs[:] = [o for o in objs if o["id"] not in east_ids]; colliders[:] = [c for c in colliders if c not in east_cols]
os.makedirs(os.path.join(ROOT, "chunks"), exist_ok=True)
CH = {"id": "east", "rect": [CHUNK_X, -40.0, 96.0, 64.0], "objects": east_objs, "colliders": east_cols}
json.dump(CH, open(os.path.join(ROOT, "chunks", "east.json"), "w"), ensure_ascii=False)
open(os.path.join(ROOT, "chunks", "east.js"), "w").write("/* generated by tools/build_scene.py */\n(window.SCENE_CHUNKS=window.SCENE_CHUNKS||{}).east=" + json.dumps(CH, ensure_ascii=False) + ";\n")
print(f"chunk east: {len(east_objs)} objects, {len(east_cols)} colliders")
bounds = BOUNDS_EAST

scene = {
    "format": "fushi-scene", "version": 2, "name": "井槐里12号 · 街角（45° 斜视原型）", "units": "m", "grid_m": 0.5, "kit": "kit/kit_manifest.json",
    "projection": KIT["projection"], "bounds": bounds, "ground": ground, "objects": objs, "colliders": colliders,
    "wires": [{"from": ["pole_w", 0], "to": ["pole_e", 0]}, {"from": ["pole_w", 1], "to": ["pole_e", 1]},
              {"from": ["pole_e", 0], "to": ["pole_n", 0]}, {"from": ["pole_e", 1], "to": ["pole_n", 1]},
              {"from": ["pole_n", 0], "to": [21.5, 40.0, 8.4], "n": 2},
              {"from": ["pole_w", 0], "to": ["pole_w2", 0], "n": 3}, {"from": ["pole_w", 1], "to": ["pole_w2", 1]},
              {"from": ["pole_w2", 0], "to": ["pole_w3", 0], "n": 3}, {"from": ["pole_w2", 1], "to": ["pole_w3", 1]},
              {"from": ["pole_w3", 0], "to": [-46.0, 0.5, 8.4], "n": 3},
              {"from": ["pole_e", 0], "to": ["pole_e2", 0], "n": 3, "sag": 0.05}, {"from": ["pole_e2", 0], "to": ["pole_e3", 0], "n": 3},
              {"from": ["pole_e3", 1], "to": [62.0, 0.5, 8.4], "n": 2},
              {"from": ["pole_e2", 1], "to": [32.5, 4.5, 9.2], "n": 2, "sag": 0.03}, {"from": ["pole_w", 1], "to": [-6.0, 13.0, 9.0], "n": 2, "sag": 0.03},
              {"from": ["pole_w2", 1], "to": [-16.0, 6.5, 8.6], "n": 2, "sag": 0.03}, {"from": ["pole_n", 1], "to": [32.5, 17.0, 11.5], "sag": 0.03}],
    "traffic": {
        "lanes": [
            {"id": "eb", "axis": "x", "c": -4.5, "dir": 1, "rot": 2, "range": [X0, X1], "stops": [{"at": 9.4, "cw": "cw_main"}, {"at": 21.6, "box": "ix"}]},
            {"id": "wb", "axis": "x", "c": -1.5, "dir": -1, "rot": 6, "range": [X0, X1], "stops": [{"at": 14.6, "cw": "cw_main"}, {"at": 28.4, "box": "ix"}]},
            {"id": "nb", "axis": "y", "c": 26.5, "dir": 1, "rot": 4, "range": [Y0, Y1], "stops": [{"at": -6.4, "box": "ix"}, {"at": 5.6, "cw": "cw_side"}]},
            {"id": "sb", "axis": "y", "c": 23.5, "dir": -1, "rot": 0, "range": [Y0, Y1], "stops": [{"at": 10.0, "cw": "cw_side"}, {"at": 0.4, "box": "ix"}]}],
        "crosswalks": [CW_MAIN, CW_SIDE], "intersection": {"id": "ix", "x0": 22.0, "x1": 28.0, "y0": -6.0, "y1": 0.0},
        "spawn_every": [3.0, 7.0], "speed": [4.5, 6.5], "variants": ["base", "taxi", "red"], "max_cars": 11,
        "bus": {"lane": "wb", "stop_at": BUS_STOP_X - 3.0, "dwell": 6.0, "every": [30, 45], "speed": 4.6, "first": 3.0}},
    "npcs": NPCS,
    "chunks": [{"id": "east", "rect": CH["rect"], "src": "chunks/east.js", "load_m": 26, "unload_m": 50}],
    # ---- ported from the front-view line (scene-proto/scene.json): calendar, weather, puddles, leaf piles, laundry, rules
    "calendar": {"start": [2026, 3, 21], "days_per_season": 5, "season_order": ["spring", "summer", "autumn", "winter"],
                 "season_start": {"spring": [3, 21], "summer": [6, 21], "autumn": [9, 23], "winter": [12, 21]}, "start_clock": "16:50", "start_day": 5},
    "weather": {"chances": {"spring": {"clear": 0.55, "rain": 0.3, "fog": 0.15}, "summer": {"clear": 0.55, "rain": 0.4, "fog": 0.05},
                            "autumn": {"clear": 0.6, "rain": 0.25, "fog": 0.15}, "winter": {"clear": 0.35, "snow": 0.5, "fog": 0.15}},
                "wet_rise_min": 12, "dry_min": 180, "snow_full_min": 45, "melt_min": {"spring": 60, "summer": 20, "autumn": 90, "winter": 900}, "start_weather": "clear"},
    "puddles": [{"id": "pud_road", "x": 4.5, "y": -2.6, "rx": 1.0, "ry": 0.5}, {"id": "pud_south", "x": 16.0, "y": -8.0, "rx": 0.9, "ry": 0.45},
                {"id": "pud_side", "x": 19.4, "y": 2.4, "rx": 0.7, "ry": 0.35}, {"id": "pud_court", "x": 2.0, "y": 8.0, "rx": 0.95, "ry": 0.45},
                {"id": "pud_sideroad", "x": 25.0, "y": 13.0, "rx": 1.0, "ry": 0.5}, {"id": "pud_sw", "x": -6.0, "y": -8.2, "rx": 0.8, "ry": 0.4},
                {"id": "pud_shop", "x": 38.0, "y": 2.2, "rx": 0.8, "ry": 0.4}],
    "leaf_piles": [{"id": "leaves_1", "x": -6.0, "y": 2.0}, {"id": "leaves_2", "x": 14.6, "y": 2.4}, {"id": "leaves_3", "x": -8.4, "y": 10.6},
                   {"id": "leaves_4", "x": 20.6, "y": 16.6}, {"id": "leaves_5", "x": 30.6, "y": 11.8}, {"id": "leaves_6", "x": -1.0, "y": -12.6}],
    "laundry": [{"id": "laundry_1", "from": "post_1", "to": "post_2", "z": 1.86, "interact": "laundry",
                 "items": [[0.5, 0.38, 0.55, "#d47878"], [1.0, 0.3, 0.7, "#7a9ed6"], [1.45, 0.45, 0.42, "#e6e0cf"], [2.05, 0.34, 0.62, "#e2b630"],
                           [2.6, 0.5, 0.5, "#e6e0cf"], [3.2, 0.3, 0.72, "#6fae7d"], [3.7, 0.4, 0.46, "#d47878"]]},
                {"id": "rline_1", "from": "rpost_1", "to": "rpost_2", "z": RZ + 1.86, "interact": "laundry",
                 "items": [[0.5, 0.42, 0.6, "#e6e0cf"], [1.2, 0.36, 0.7, "#7a9ed6"], [2.0, 0.5, 0.45, "#d47878"], [3.4, 0.6, 0.9, "#c9b98f"], [4.5, 0.34, 0.6, "#6fae7d"]]},
                {"id": "rline_me", "from": "rpost_3", "to": "rpost_4", "z": RZ + 1.86, "rack": "roof", "max": 6, "mine": True, "items": []},
                {"id": "bal_2f02", "pts": [3.5, 12.35, 5.6, 12.35], "z": 5.05, "rack": "balcony", "max": 5, "mine": True, "indoor": True, "items": []}],
    "repair_hours_scale": 1.0,
    "roof": ROOF,
    "interactions": INTERACTIONS,
    "spawn": {"x": 6.2, "y": 9.0, "dir": "SW"},
    "events": {
        "broken_window": {"label": "破窗", "key": "1", "actions": [
            {"do": "set_state", "target": "win_S2F_4", "state": "broken"},
            {"do": "fx", "fx": "glass_burst", "target": "win_S2F_4", "n": 50},
            {"do": "decal", "frame": "fx/glass_decal", "x": 7.5, "y": 12.25, "after": 1.1}]},
        "fire": {"label": "起火", "key": "2", "actions": [
            {"do": "overlay", "target": "win_S1F_3", "overlay": "fire", "duration": 14},
            {"do": "overlay", "target": "win_S1F_3", "overlay": "smoke", "duration": 24},
            {"do": "set_state", "target": "win_S1F_3", "state": "broken", "after": 2.5},
            {"do": "fx", "fx": "glass_burst", "target": "win_S1F_3", "n": 18, "after": 2.5},
            {"do": "overlay", "target": "win_S1F_3", "overlay": "soot", "after": 6},
            {"do": "set_state", "target": "win_S1F_3", "state": "scorched", "after": 12},
            {"do": "decal", "frame": "fx/scorch", "x": 4.5, "y": 12.35, "after": 12}]},
        "crash": {"label": "撞车", "key": "3", "actions": [
            {"do": "traffic_crash", "lane": "wb", "veer_at": 20.6, "rot": 5, "stop_front_y": 0.35}]}},
}
# events must target existing ids
ids = {o["id"] for o in objs}
for ev in scene["events"].values():
    for a in ev["actions"]: assert a.get("target") is None or a["target"] in ids, a
# wires anchored to a streamed object are tagged with its chunk (drawn only while that chunk is in); unknown anchors fail the build
_ids = {o["id"] for o in scene["objects"]}
for w in scene["wires"]:
    for end in (w["from"], w["to"]):
        if isinstance(end[0], str) and end[0] not in _ids:
            assert end[0] in east_ids, f"wire anchored to unknown object {end[0]}"
            w["chunk"] = "east"
json.dump(scene, open(os.path.join(ROOT, "scene.json"), "w"), ensure_ascii=False, indent=1)
open(os.path.join(ROOT, "scene.js"), "w").write("/* generated from scene.json by tools/build_scene.py (file:// cannot fetch JSON) */\nwindow.SCENE_DATA=" + json.dumps(scene, ensure_ascii=False) + ";\n")
print(len(objs), "objects")
