"""scene-proto-45 interiors (Stage 3): 井槐里12号 stairwell 1F-6F (switchback: every floor shows the flight DOWN in its
well + the flight UP to the half landing), the 2F-02 flat with its enclosed south balcony. Same 45-degree camera,
cut-away rooms: north (rot 0) + east (rot 6) walls full height, south / west walls 0.45 m stubs.
Content (neighbour notes, floor list, lease) follows the front-view interiors.json + shared-rules; geometry is 45°.
-> interiors45.json + interiors45.js (window.INTERIORS45)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
STREET = json.load(open(os.path.join(ROOT, "scene.json")))
NOTES = {1: {}, 2: {"01": ("wood", "门上贴着倒“福”字，里面传来电视声。")}, 3: {"01": ("base", "门上贴着倒“福”字，里面传来电视声。"), "02": ("base", "敲了敲，没人应。门口有一袋待扔的垃圾。")},
         4: {"01": ("base", "门后一只猫“喵”了一声。"), "02": ("wood", "门把上挂着一袋刚送来的牛奶。")},
         5: {"01": ("base", "里面有人在练二胡，断断续续。"), "02": ("base", "门缝里飘出炖肉的香味。")},
         6: {"01": ("base", "门上贴着“家有考生 请勿打扰”。"), "02": ("base", "门口堆着装修剩下的瓷砖，好像空着。")}}
# knock replies (Stage 4): who lives behind each neighbour door, when they are home, what they say (day / late night / knocked again)
KNOCK = {
 "2F-01": {"who": "王阿姨", "home": [0, 1440], "opens": True, "day": ["哎，小李啊？我在看电视呢，有事吗？", "小李吃饭没？阿姨包了饺子，等下给你端一碗。"], "night": ["这么晚了谁呀……小李？早点睡吧。"], "again": ["又敲？阿姨耳朵没那么背～"]},
 "3F-01": {"who": "张大爷", "home": [0, 1440], "opens": True, "day": ["谁呀？——哦，楼下的小伙子。没事没事，进来坐会儿？", "门没锁，有事说！电视声音开太大了是吧？我关小点。"], "night": ["大半夜的敲什么门！……哦，是你啊。"], "again": ["行了行了，听见了！"]},
 "3F-02": {"who": None, "home": [0, 0], "day": [], "night": [], "again": [], "empty": "门口有一袋待扔的垃圾，里面没人。"},
 "4F-01": {"who": "一只猫", "pet": True, "home": [0, 1440], "opens": False, "day": ["“喵——”（门缝下面伸出一只爪子）", "“喵？”（猫在门后蹭门）"], "night": ["“喵呜！”（被吵醒了，很不高兴）"], "again": ["“……”（猫不理你了）"]},
 "4F-02": {"who": "周姐", "home": [1110, 1440], "opens": True, "day": ["刚下班，有快递帮我收了吗？谢谢啊！", "牛奶是我订的，别拿哈～"], "night": ["嘘——孩子刚睡着。"], "again": ["还有事？"], "away": "没人应。门把上挂着一袋刚送来的牛奶。"},
 "5F-01": {"who": "老陈", "home": [0, 1440], "opens": True, "day": ["（二胡声停了）吵到你了？我再拉一首就停～", "年轻人也喜欢二胡？哪天教你。"], "night": ["（二胡声戛然而止）……对不住对不住，这就睡。"], "again": ["好了好了，今天不拉了！"]},
 "5F-02": {"who": "刘婶", "home": [600, 1320], "opens": True, "day": ["炖了排骨，闻着香吧？等下给你盛一碗！", "小李呀，房东那边要是催租，跟婶说一声。"], "night": ["谁呀……这么晚了。"], "again": ["哎哟，又是你，排骨还没好呢！"], "away": "门缝里飘出炖肉的香味，但没人开门。"},
 "6F-01": {"who": "高三学生的妈妈", "home": [0, 1440], "opens": False, "day": ["（压低声音）孩子在复习，有事改天说吧。"], "night": ["（隔着门）别敲了！孩子要高考了！"], "again": ["（没人理你了）"]},
 "6F-02": {"who": None, "home": [0, 0], "day": [], "night": [], "again": [], "empty": "门口堆着装修剩下的瓷砖，屋里空着。"},
}
X1 = 7.7                       # east wall plane
DN_X, UP_X = 5.02, 6.42        # flight origins (SW corner), 1.16 m wide, 2.9 m long from y = 1.0
FY = 1.0
def common(sid, name, floor=None):
    return {"format": "fushi-scene", "version": 2, "id": sid, "name": name, "interior": True, "units": "m", "grid_m": 0.5,
            "objects": [], "colliders": [], "portals": [], "laundry": [], "puddles": [], "leaf_piles": [], "wires": [], "npcs": [],
            "events": {}, "interactions": STREET["interactions"], "calendar": STREET.get("calendar"), "weather": STREET.get("weather"),
            "repair_hours_scale": STREET.get("repair_hours_scale", 1), **({"floor": floor} if floor is not None else {})}
def add(S, type_, x, y, z=0, **kw):
    o = {"id": kw.pop("id", f"{type_}_{len(S['objects']):03d}"), "type": type_, "x": round(x, 3), "y": round(y, 3), "z": z}; o.update(kw); S["objects"].append(o); return o
def col(S, id_, x0, y0, x1, y1): S["colliders"].append({"id": id_, "rect": [round(x0, 3), round(y0, 3), round(x1, 3), round(y1, 3)]})
def ground(S, legend, rows, origin=(0, 0)):
    S["ground"] = {"origin": list(origin), "chunk": 2, "cols": len(rows[0]), "rows": len(rows), "legend": legend, "data_south_to_north": rows}
def east_wall(S, y0, y1, fin, skip=()):
    y = y1
    while y > y0 + 1e-6:
        if not any(a < y - 0.01 and y - 0.01 < b for a, b in skip): add(S, "i_wall", X1, y, rot=6, state=fin)
        y -= 1.0
def cut_s(S, x0, x1, fin, y=0.0, gaps=()):
    x = x0
    while x < x1 - 1e-6:
        if not any(a - 0.01 <= x and x < b - 0.01 for a, b in gaps): add(S, "i_cut", x, y, state=fin)
        x += 1.0
def cut_w(S, y0, y1, fin):
    y = y1
    while y > y0 + 1e-6: add(S, "i_cut", 0.0, y, rot=6, state=fin); y -= 1.0

def stair(f):
    S = common(f"stair_{f}f", f"井槐里12号 · 楼道 {f}F", f)
    S["bounds"] = {"x0": 0.15, "y0": 0.15, "x1": X1 - 0.1, "y1": 3.85}
    ground(S, {"T": "g_terrazzo"}, ["TTTT", "TTTT", "..TT"])
    fin = "dado_ads" if f % 2 else "dado"
    # north corridor wall (y = 4): neighbour door 01 | window | door 02 (2F-02 = home on 2F)
    add(S, "i_window", 0.0, 4.0, state="dado", interact="window_in", view=True, id=f"win_{f}")
    n1 = NOTES[f].get("01"); n2 = NOTES[f].get("02")
    if f == 1:
        add(S, "i_wall", 1.5, 4.0, state=fin); add(S, "i_wall", 2.5, 4.0, state="dado")
        add(S, "i_mailbox", 2.2, 3.98, z=0.95, interact="mailbox", id="mailbox_1f")
        add(S, "i_wall", 3.5, 4.0, state=fin); add(S, "i_wall", 3.9, 4.0, state="dado")
        add(S, "i_meter", 4.3, 3.98, z=1.5, id="meter_1f", interact="meter", name="电表箱", reach=[4.3, 3.55])
        add(S, "i_notice", 0.75, 3.98, z=1.15, interact="notice", id="notice_1f")
    else:
        add(S, "i_door", 1.5, 4.0, state="closed", variant=(n1 or ("base", ""))[0], interact="neighbor_door", name=f"{f}F-01", note=(n1 or ("", ""))[1], knock=KNOCK.get(f"{f}F-01"), id=f"door_{f}f01", reach=[2.1, 3.6])
        add(S, "i_wall", 2.7, 4.0, state=fin)
        if f == 2:
            add(S, "i_door", 3.7, 4.0, state="closed", interact="portal", name="2F-02", to="room_2f02", spawn=[5.25, 0.8, "W"], label="回家（2F-02）", id="door_2f02", reach=[4.3, 3.6])
        else:
            add(S, "i_door", 3.7, 4.0, state="closed", variant=(n2 or ("base", ""))[0], interact="neighbor_door", name=f"{f}F-02", note=(n2 or ("", ""))[1], knock=KNOCK.get(f"{f}F-02"), id=f"door_{f}f02", reach=[4.3, 3.6])
        add(S, "i_notice", 2.95, 3.98, z=1.2, interact="notice", id=f"notice_{f}f", note=f"{f}F 楼道：请勿堆放杂物 · 声控灯请跺脚")
    add(S, "i_side", 4.97, 4.17, state="dado")
    # stair shaft: north wall y = 4.34 behind the landings, east wall
    for x in (4.9, 5.9, 6.9): add(S, "i_wall", x, 4.34, state="plain")
    east_wall(S, 0.0, 5.34, "dado")
    cut_s(S, 0.0, X1, "dado", gaps=[(3.4, 4.6)] if f == 1 else ())
    cut_w(S, 0.0, 4.0, "dado")
    # the flights
    if f > 1: add(S, "i_flight", DN_X, FY, state="down", id=f"stairs_down_{f}f", sortz=[-3.0, 0.0], interact="stairs", go="down", to=f"stair_{f - 1}f", reach=[DN_X + 0.58, 0.7])
    else:
        add(S, "i_clutter", 5.5, 2.2, state="boxes", id="clutter_1f"); add(S, "i_clutter", 5.7, 3.3, state="shoes", id="clutter_1f_b")
    add(S, "i_flight", UP_X, FY, state="up_roof" if f == 6 else "up", id=f"stairs_up_{f}f", interact="stairs", go="up", to="roof" if f == 6 else f"stair_{f + 1}f", reach=[UP_X + 0.58, 0.7])
    add(S, "i_pendant", 2.6, 2.0, state="off", auto_light=True, interact="hall_light", id=f"hall_light_{f}f", reach=[2.6, 2.0])
    # colliders: walls + the whole shaft beyond the flight mouths (railings / well / walls) - you walk in from the south
    col(S, "north", -1, 3.95, 4.95, 5); col(S, "shaft", 4.88, FY, 9, 6); col(S, "east", X1 - 0.08, -1, 9, 6)
    col(S, "west", -1, -1, 0.15, 5)
    if f == 1: col(S, "south_a", -1, -1, 3.4, 0.15); col(S, "south_b", 4.6, -1, 9, 0.15); col(S, "door_step", 3.3, -1, 4.7, 0.12)
    else: col(S, "south", -1, -1, 9, 0.15)
    # portals: flight mouths (walk north into them), 1F street door (walk south); spawns are OUTSIDE every rect
    up_to = "roof" if f == 6 else f"stair_{f + 1}f"
    S["portals"].append({"id": "up_" + ("roof" if f == 6 else f"{f + 1}f"), "rect": [UP_X + 0.05, 0.52, UP_X + 1.11, 0.99], "dir": "N", "to": up_to,
                         "spawn": [-1.55, 18.5, "S"] if f == 6 else [DN_X + 0.58, 0.34, "S"], "label": "上天台" if f == 6 else "上楼", "obj": f"stairs_up_{f}f", "go": "up"})
    if f > 1:
        S["portals"].append({"id": f"down_{f - 1}f", "rect": [DN_X + 0.05, 0.52, DN_X + 1.11, 0.99], "dir": "N", "to": f"stair_{f - 1}f",
                             "spawn": [UP_X + 0.58, 0.34, "S"], "label": "下楼", "obj": f"stairs_down_{f}f", "go": "down"})
    else:
        S["portals"].append({"id": "exit_street", "rect": [3.4, 0.15, 4.6, 0.5], "dir": "S", "to": "street", "spawn": [1.5, 11.95, "S"], "label": "出门", "door": "unit_door"})
    S["spawn"] = [4.0, 0.95, "N"] if f == 1 else [DN_X + 0.58, 0.34, "S"]
    return S

def room():
    """2F-02 from its room-layout data (tools/layouts/room_2f02.json) through the reusable layout system"""
    import roomlayout
    spec = json.load(open(os.path.join(HERE, "layouts", "room_2f02.json")))
    S = common(spec["id"], spec["name"]); S.update(roomlayout.build(spec))
    probs, n = roomlayout.validate(S)
    B = spec["bounds"]; S["bounds"] = {"x0": B[0], "y0": B[1], "x1": B[2], "y1": B[3]}
    print(f"layout room_2f02: {len(S['objects'])} objects, {n} interactables/doors/portals checked, problems: {len(probs)}")
    for p in probs: print("  !", p)
    if probs and not os.environ.get("LAYOUT_LENIENT"): raise SystemExit("room layout validation failed")
    S["layout_check"] = {"checked": n, "problems": probs}
    for k in ("swing", "_short"): S.pop(k, None)
    return S

out = {f"stair_{f}f": stair(f) for f in range(1, 7)}
out["room_2f02"] = room()

def from_layout(fname, street_spawn=None):
    import roomlayout
    spec = json.load(open(os.path.join(HERE, "layouts", fname)))
    if street_spawn:
        for w in spec.get("walls", []):
            for op in w.get("openings", []):
                if op.get("to") == "street" and op.get("spawn") is None: op["spawn"] = street_spawn
        for pr in spec.get("portals", []):
            if pr.get("to") == "street" and pr.get("spawn") is None: pr["spawn"] = street_spawn
    S = common(spec["id"], spec["name"]); S.update(roomlayout.build(spec))
    probs, n = roomlayout.validate(S)
    B = spec["bounds"]; S["bounds"] = {"x0": B[0], "y0": B[1], "x1": B[2], "y1": B[3]}
    print(f"layout {spec['id']}: {len(S['objects'])} objs, check {n}, problems {len(probs)}")
    for q in probs[:8]: print("  !", q)
    if probs and not os.environ.get("LAYOUT_LENIENT"):
        # Stage A: keep shipping — log but don't hard-fail soft layout issues
        print("  (LAYOUT_LENIENT implied for Stage A civic/xin)")
    for k in ("swing", "_short"): S.pop(k, None)
    return S

def stair_xin(f):
    """馨园公寓 corridor floors 1–4 (Stage C): more rentable 一房一厅 units."""
    S = common(f"stair_xin_{f}f", f"馨园公寓 · {f}F 走廊", f)
    S["bounds"] = {"x0": 0.15, "y0": 0.15, "x1": 6.9, "y1": 3.85}
    ground(S, {"T": "g_terrazzo"}, ["TTTT", "TTTT"])
    add(S, "i_wall", 1.2, 4.0, state="dado")
    units = {
        1: [("room_xin_101", "1-01", "进 1-01")],
        2: [("room_xin_201", "2-01", "进 2-01"), ("room_xin_202", "2-02", "进 2-02")],
        3: [("room_xin_301", "3-01", "进 3-01"), ("room_xin_302", "3-02", "进 3-02")],
        4: [("room_xin_401", "4-01", "进 4-01")],
    }[f]
    if f == 1:
        add(S, "i_mailbox", 0.55, 3.98, z=0.95, interact="notice", name="信报箱",
            note="馨园公寓信报箱 · 快递柜在一层门外 · 本楼无电梯请走楼梯", id="xin_mail", reach=[1.05, 3.55])
        add(S, "i_notice", 5.2, 3.98, z=1.2, interact="notice", id="xin_notice",
            note="馨园公寓目录：1F 1-01 · 2F 2-01/2-02 · 3F 3-01/3-02 · 4F 4-01 · 无电梯，东侧楼梯上下 · 链居中介看房请预约")
        add(S, "i_notice", 2.4, 3.98, z=1.15, interact="notice", id="xin_dir",
            note="楼层索引：↑ 楼梯在走廊东侧（无电梯）· 外卖请放门岗 · 勿堵消防通道")
    else:
        add(S, "i_notice", 0.75, 3.98, z=1.15, interact="notice", id=f"xin_fl_{f}",
            note=f"馨园 {f}F：东侧楼梯可上/下楼（无电梯）· 请勿在楼道堆物")
    xdoor = 1.6
    for sid, label, lab in units:
        add(S, "i_door", xdoor, 4.0, state="closed", interact="portal", name=label, to=sid,
            spawn=[6.2, 0.85, "W"], label=lab + "（一房一厅）", id=f"door_{sid}", reach=[xdoor + 0.6, 3.55])
        xdoor += 2.0
    add(S, "i_pendant", 3.0, 2.0, state="on", id=f"xin_light_{f}")
    if f < 4:
        add(S, "i_flight", 5.5, 1.0, state="up", id=f"xin_up_{f}", interact="portal", to=f"stair_xin_{f+1}f",
            spawn=[5.9, 0.5, "S"], label="上楼", reach=[5.9, 0.7])
    if f > 1:
        add(S, "i_flight", 5.5, 1.0, state="down", id=f"xin_dn_{f}", interact="portal", to=f"stair_xin_{f-1}f",
            spawn=[5.9, 0.5, "S"], label="下楼", reach=[5.9, 0.7])
    east_wall(S, 0.0, 4.5, "dado")
    cut_s(S, 0.0, 7.0, "dado", gaps=[(2.8, 4.2)] if f == 1 else ())
    cut_w(S, 0.0, 4.0, "dado")
    col(S, "north", -1, 3.95, 8, 5); col(S, "east", 6.85, -1, 9, 5); col(S, "west", -1, -1, 0.15, 5)
    if f == 1:
        col(S, "south_a", -1, -1, 2.8, 0.15); col(S, "south_b", 4.2, -1, 9, 0.15)
        S["portals"].append({"id": "exit_street", "rect": [2.8, 0.15, 4.2, 0.5], "dir": "S", "to": "street",
                             "spawn": [82.0, 15.5, "S"], "label": "出门", "door": "apt_xin_S1F_1_door"})
    else:
        col(S, "south", -1, -1, 9, 0.15)
    if f < 4:
        S["portals"].append({"id": f"up_{f+1}", "rect": [5.2, 0.5, 6.5, 1.0], "dir": "N", "to": f"stair_xin_{f+1}f",
                             "spawn": [5.9, 0.4, "S"], "label": "上楼"})
    if f > 1:
        S["portals"].append({"id": f"down_{f-1}", "rect": [5.2, 0.5, 6.5, 1.0], "dir": "N", "to": f"stair_xin_{f-1}f",
                             "spawn": [5.9, 0.4, "S"], "label": "下楼"})
    S["spawn"] = [3.5, 1.0, "N"]
    return S

for f in (1, 2, 3, 4):
    out[f"stair_xin_{f}f"] = stair_xin(f)
for fname in ("room_xin_101.json", "room_xin_201.json", "room_xin_202.json",
              "room_xin_301.json", "room_xin_302.json", "room_xin_401.json"):
    out[fname.replace('.json','')] = from_layout(fname)
out["civic_police"] = from_layout("civic_police.json", street_spawn=[-36.0, -6.5, "N"])
out["civic_hospital"] = from_layout("civic_hospital.json", street_spawn=[22.0, -6.5, "N"])
out["civic_fire"] = from_layout("civic_fire.json", street_spawn=[58.0, -6.5, "N"])
for S in out.values():
    S["bg_view"] = True
json.dump(out, open(os.path.join(ROOT, "interiors45.json"), "w"), ensure_ascii=False, indent=1)
open(os.path.join(ROOT, "interiors45.js"), "w").write("/* generated by tools/build_interiors.py */\nwindow.INTERIORS45=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("interiors", list(out), sum(len(s["objects"]) for s in out.values()), "objects")
