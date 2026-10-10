
#!/usr/bin/env python3
"""Build Midtown-A + A2 livable units."""
from __future__ import annotations
import json, math, copy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHUNK_OUT = ROOT / "chunks" / "midtown.js"
SCENES_OUT = ROOT / "js" / "midtown_scenes.js"
LAYOUT_DIR = ROOT / "tools" / "layouts"

X0, X1 = 104.0, 146.0
N_CURB_Y, S_CURB_Y = 0.1, -6.1

BUILDINGS = [
    {"key": "jx", "name": "景秀苑", "floors": 8, "door_x": 110.0, "face_y": 4.5, "bays": 4, "depth": 9.0, "mixed": False, "style": "transitional"},
    {"key": "yj", "name": "云阶公馆", "floors": 12, "door_x": 124.0, "face_y": 5.2, "bays": 5, "depth": 8.0, "mixed": True, "style": "glass"},
    {"key": "cn", "name": "城南一号", "floors": 16, "door_x": 138.5, "face_y": 3.8, "bays": 5, "depth": 11.0, "mixed": True, "style": "tower"},
]

STYLES = {
    "transitional": {
        "wall_cycle": ["p1", "w1", "p1", "w2"], "win_var": "w2", "win_lit_odds": 0.35,
        "balcony_odds": 0.55, "balcony_vars": ["b1", "base", "b1"], "laundry_odds": 0.65,
        "ac_odds": 0.55, "ac_vars": ["base", "a1", "a2"], "pipe_every": 1,
        "roof": "b_roof_b", "roof_var": None, "shop_state": None, "setback_top": 0, "skip_bay_top": [],
    },
    "glass": {
        "wall_cycle": ["w2", "w2", "p1", "w2"], "win_var": "w1", "win_lit_odds": 0.85,
        "balcony_odds": 0.22, "balcony_vars": ["b2", "b2"], "laundry_odds": 0.05,
        "ac_odds": 0.12, "ac_vars": ["a1"], "pipe_every": 6,
        "roof": "b_roof_a", "roof_var": None, "shop_state": "door", "setback_top": 0, "skip_bay_top": [],
    },
    "tower": {
        "wall_cycle": ["w1", "p1", "w1", "w2"], "win_var": "w2", "win_lit_odds": 0.55,
        "balcony_odds": 0.28, "balcony_vars": ["b1", "b2", "base"], "laundry_odds": 0.2,
        "ac_odds": 0.3, "ac_vars": ["a2", "a1"], "pipe_every": 2,
        "roof": "b_roof_b", "roof_var": "c", "shop_state": "window", "setback_top": 2, "skip_bay_top": [0, 4],
    },
}

# Featured rent rows (housing UI). All units still enterable.
RENT_FEATURED = [
    # id, key, fl, slot, rent, type
    ("mt-jx-101", "jx", 1, 1, 1350, "转型简装一房一厅 ~36㎡"),
    ("mt-jx-502", "jx", 5, 2, 1450, "转型简装 · 景秀中层"),
    ("mt-yj-601", "yj", 6, 1, 1680, "玻璃幕精装一房一厅"),
    ("mt-yj-1201", "yj", 12, 1, 1850, "玻璃幕精装 · 高层段"),
    ("mt-cn-801", "cn", 8, 1, 1750, "高层塔配一房一厅"),
    ("mt-cn-1601", "cn", 16, 1, 2100, "高层塔配 · 城南顶段"),
]


def bay_xs(door_x: float, bays: int) -> list[float]:
    start = door_x - 3.0
    return [start + i * 3.0 for i in range(bays)]


def add_facade(objs: list, b: dict) -> None:
    key, name, nf = b["key"], b["name"], b["floors"]
    st = STYLES[b["style"]]
    xs = bay_xs(b["door_x"], b["bays"])
    fy = b["face_y"]
    fg = f"mt_{key}"
    walls = st["wall_cycle"]
    for fl in range(nf):
        z = 3.0 * fl
        setback = fl >= nf - st["setback_top"] if st["setback_top"] else False
        for i, x in enumerate(xs):
            if setback and i in st["skip_bay_top"]:
                continue
            tag = f"{fg}_S{fl+1}F_{i}"
            wall_st = "ground" if fl == 0 else "upper"
            objs.append({
                "id": f"{tag}_wall", "type": "f_wall", "x": x, "y": fy, "z": z,
                "state": wall_st, "fade_group": fg, "variant": walls[(i + fl) % len(walls)],
            })
            if fl == 0 and abs(x - b["door_x"]) < 0.15:
                objs.append({
                    "id": f"{fg}_door", "type": "f_door", "x": x, "y": fy, "z": z,
                    "state": "closed", "fade_group": fg, "interact": "civic",
                    "name": name, "to": f"mt_{key}_1f", "plate": name,
                })
                objs.append({
                    "id": f"{fg}_steps", "type": "f_steps", "x": x, "y": fy - 0.35, "z": 0,
                    "fade_group": fg, "state": "default",
                })
                continue
            if fl == 0 and b.get("mixed") and i == 0:
                objs.append({
                    "id": f"{tag}_shop", "type": "f_shop", "x": x, "y": fy, "z": z,
                    "state": st["shop_state"] or "window", "fade_group": fg,
                })
                continue
            if fl == 0 and b.get("mixed") and i == b["bays"] - 1 and key == "cn":
                objs.append({
                    "id": f"{tag}_shop2", "type": "f_shop", "x": x, "y": fy, "z": z,
                    "state": "shut", "fade_group": fg,
                })
                continue
            want_balc = fl > 0 and ((i * 3 + fl * 5 + hash(key) % 7) % 10) / 10.0 < st["balcony_odds"]
            if want_balc:
                laundry = ((i + fl) % 3 == 0) and ((i * 2 + fl) % 10) / 10.0 < st["laundry_odds"]
                bvar = st["balcony_vars"][(i + fl) % len(st["balcony_vars"])]
                objs.append({
                    "id": f"{tag}_balc", "type": "f_balcony", "x": x, "y": fy, "z": z,
                    "state": "laundry" if laundry else "default", "fade_group": fg, "variant": bvar,
                })
            else:
                lit = ((i * 7 + fl * 11 + ord(key[0])) % 10) / 10.0 < st["win_lit_odds"]
                win = {
                    "id": f"{tag}_win", "type": "f_window", "x": x, "y": fy, "z": z,
                    "state": "intact", "fade_group": fg, "variant": st["win_var"],
                }
                if lit:
                    win["night_lit"] = True
                if b["style"] == "transitional" and fl > 2 and (i + fl) % 11 == 0:
                    win["state"] = "boarded"
                    win.pop("night_lit", None)
                objs.append(win)
            if fl > 0 and ((i * 5 + fl * 3) % 10) / 10.0 < st["ac_odds"]:
                objs.append({
                    "id": f"{tag}_ac", "type": "f_ac", "x": x + 1.35, "y": fy, "z": z + 0.15,
                    "fade_group": fg, "variant": st["ac_vars"][(i + fl) % len(st["ac_vars"])],
                })
        if st["pipe_every"] and fl % st["pipe_every"] == 0:
            objs.append({
                "id": f"{fg}_pipe_e_{fl}", "type": "f_pipe",
                "x": xs[-1] + 2.85, "y": fy, "z": z, "fade_group": fg,
            })
            if b["style"] == "transitional":
                objs.append({
                    "id": f"{fg}_pipe_w_{fl}", "type": "f_pipe",
                    "x": xs[0] - 0.1, "y": fy, "z": z, "fade_group": fg,
                })
    rz = 3.0 * nf
    roof = {"id": f"{fg}_roof", "type": st["roof"], "x": xs[0], "y": fy, "z": rz, "fade_group": fg}
    if st["roof_var"]:
        roof["variant"] = st["roof_var"]
    objs.append(roof)
    if b["style"] == "tower":
        objs.append({
            "id": f"{fg}_roof_deck", "type": "b_roof_deck",
            "x": xs[1], "y": fy + 1.0, "z": rz + 0.15, "fade_group": fg,
        })
    objs.append({
        "id": f"{fg}_sign", "type": "f_shopsign", "x": b["door_x"], "y": fy - 0.05,
        "z": 2.6, "fade_group": fg, "state": "default", "name": name,
    })


def build_chunk() -> dict:
    objs: list = []
    cols: list = []
    x = X0
    while x <= X1:
        objs.append({"id": f"mt_curb_n{int(x)}", "type": "p_curb", "x": x, "y": N_CURB_Y})
        objs.append({"id": f"mt_curb_s{int(x)}", "type": "p_curb", "x": x, "y": S_CURB_Y})
        objs.append({"id": f"mt_edge_n{int(x)}", "type": "d_edge_line", "x": x, "y": -0.35})
        objs.append({"id": f"mt_edge_s{int(x)}", "type": "d_edge_line", "x": x, "y": -5.65})
        if int(x) % 6 == 0:
            objs.append({"id": f"mt_dash{int(x)}", "type": "d_center_dash", "x": x, "y": -3.0})
        x += 2.0
    for tx in (108, 118, 130, 142):
        objs.append({"id": f"mt_tree_{tx}", "type": "p_tree", "x": tx, "y": 1.2})
    objs.append({"id": "mt_pole_112", "type": "p_pole", "x": 112, "y": -0.2})
    objs.append({"id": "mt_pole_132", "type": "p_pole", "x": 132, "y": -0.2})
    objs.append({"id": "mt_bins_116", "type": "p_bins", "x": 116, "y": 1.0})
    objs.append({"id": "mt_seam_sign", "type": "f_sign", "x": 105.0, "y": 1.5, "z": 0, "state": "default", "name": "往城南 / 近市中心 →"})
    for b in BUILDINGS:
        add_facade(objs, b)
        xs = bay_xs(b["door_x"], b["bays"])
        cols.append({"id": f"mt_{b['key']}", "rect": [xs[0] - 0.3, b["face_y"] - 0.3, xs[-1] + 3.3, b["face_y"] + b["depth"]]})
    return {"id": "midtown", "rect": [X0 - 0.5, -40.0, X1 + 2.0, 64.0], "objects": objs, "colliders": cols}


def load_xin_template() -> dict:
    raw = (ROOT / "interiors45.js").read_text(encoding="utf-8")
    data = json.loads(raw[raw.find("{"): raw.rfind("}") + 1])
    return data["room_xin_101"]


def unit_scene_id(key: str, fl: int, slot: int) -> str:
    return f"room_mt_{key}_{fl}0{slot}"


# Interior flavor by tower style (kit states only — no new atlases / no estate courtyard)
UNIT_FLAVOR = {
    "transitional": {
        "suffix": "转型简装",
        "blurb": "转型装修 · 墙贴小广告 · 木地板旧纹 · 适合过渡落脚",
        "wall": "dado_ads",
        "window": "dado",
        "bed": "messy",
        "ground": {
            "origin": [0, 0], "chunk": 2, "cols": 4, "rows": 3,
            "legend": {"W": "g_wood:a", "T": "g_tile"},
            "data_south_to_north": ["WWWT", "WWWT", "WTTT"],
        },
        "drop_ids": [],  # keep lived-in clutter
        "extra": "clutter",
    },
    "glass": {
        "suffix": "玻璃幕精装",
        "blurb": "玻璃幕精装 · 素墙水磨石 · 隔音较好 · 物业费略高",
        "wall": "plain",
        "window": "plain",
        "bed": "made",
        "ground": {
            "origin": [0, 0], "chunk": 2, "cols": 4, "rows": 3,
            "legend": {"T": "g_terrazzo", "W": "g_wood:b"},
            "data_south_to_north": ["TTTT", "TWWW", "TWWW"],
        },
        "drop_ids": ["pouf", "tv_stand"],  # lean modern
        "extra": "plant",
    },
    "tower": {
        "suffix": "高层塔配",
        "blurb": "高层塔配 · 瓷砖墙裙 · 楼风略大 · 电梯直达",
        "wall": "tile",
        "window": "tile",
        "bed": "made",
        "ground": {
            "origin": [0, 0], "chunk": 2, "cols": 4, "rows": 3,
            "legend": {"W": "g_wood:b", "T": "g_tile"},
            "data_south_to_north": ["WWWW", "WWWT", "WTTT"],
        },
        "drop_ids": ["coffee"],  # slightly sparser living room
        "extra": "meter",
    },
}


def make_unit(tmpl: dict, b: dict, fl: int, slot: int) -> dict:
    """Clone 馨园一房一厅; flavor furniture/palette by tower style (Midtown-A3)."""
    key, name, style = b["key"], b["name"], b["style"]
    flav = UNIT_FLAVOR[style]
    sid = unit_scene_id(key, fl, slot)
    hall = f"mt_{key}_{fl}f"
    room = copy.deepcopy(tmpl)
    room["id"] = sid
    room["name"] = f"{name} {fl}-0{slot} · {flav['suffix']}"
    room["midtown"] = True
    room["building"] = f"mt_{key}"
    room["kind"] = "unit"
    room["mt_style"] = style
    room["mt_floor"] = fl
    room["mt_slot"] = slot
    if "floor" in room:
        del room["floor"]
    room["ground"] = copy.deepcopy(flav["ground"])

    drop = set(flav.get("drop_ids") or [])
    kept = []
    for o in room["objects"]:
        oid = o.get("id") or ""
        if oid in drop:
            continue
        # palette
        if o.get("type") == "i_wall" and o.get("state"):
            o["state"] = flav["wall"]
        if o.get("type") == "i_window":
            o["state"] = flav["window"]
        if o.get("type") == "f_bed":
            o["state"] = flav["bed"]
        # exit portal
        if oid == "room_door" or (o.get("interact") == "portal" and o.get("label") == "出门"):
            o["to"] = hall
            o["spawn"] = [1.9 if slot == 1 else 5.1, 3.55, "S"]
            o["label"] = "回走廊"
        if "id" in o:
            o["id"] = f"{key}{fl}0{slot}_" + o["id"]
        kept.append(o)
    room["objects"] = kept

    # style-specific extras (kit pieces only)
    pref = f"{key}{fl}0{slot}_"
    if flav["extra"] == "clutter":
        room["objects"].append({
            "id": pref + "box", "type": "i_clutter", "x": 5.6, "y": 2.4, "z": 0,
            "state": "default", "interact": "notice",
            "note": "纸箱还没拆完 · 转型入住常见", "reach": [5.6, 2.0],
        })
    elif flav["extra"] == "plant":
        room["objects"].append({
            "id": pref + "vase", "type": "f_shelf", "x": 3.5, "y": 2.55, "z": 0,
            "interact": "notice", "note": "云阶公馆交付绿植 · 请自行浇水", "reach": [3.5, 2.15],
        })
    elif flav["extra"] == "meter":
        room["objects"].append({
            "id": pref + "meter", "type": "i_meter", "x": 6.5, "y": 1.2, "z": 1.4,
            "interact": "meter", "reach": [6.1, 1.2],
        })

    room["objects"].append({
        "id": pref + "lease_note", "type": "i_notice",
        "x": 6.2, "y": 2.8, "z": 1.2, "interact": "notice",
        "note": f"{name} {fl}-0{slot} · {flav['blurb']} · Midtown-A3 风格样板",
        "reach": [5.8, 2.5],
    })
    room["spawn"] = [6.2, 0.85, "W"]
    return room


def corridor_scene(b: dict, fl: int, kind: str = "hall") -> dict:
    key, name, nf = b["key"], b["name"], b["floors"]
    sid = f"mt_{key}_{'fire_' if kind == 'fire' else ''}{fl}f"
    title = f"{name} · {'消防通道' if kind == 'fire' else '走廊'} {fl}F"
    objs = []
    for i, x in enumerate([0.5, 1.5, 2.5, 3.5, 4.5, 5.5]):
        objs.append({"id": f"w{i}", "type": "i_wall", "x": x, "y": 4.0, "z": 0, "state": "dado"})
    for i, x in enumerate([0.8, 2.0, 3.2, 4.4, 5.6]):
        objs.append({"id": f"c{i}", "type": "i_cut", "x": x, "y": 0.2, "z": 0})
    portals = []
    spawn = [3.5, 1.0, "N"]

    if kind == "hall":
        elev_note = "电梯 · 按楼层直达（本楼设客梯）" if nf > 7 else "步梯"
        objs.append({
            "id": f"{key}_dir_{fl}", "type": "i_notice", "x": 2.2, "y": 3.98, "z": 1.15,
            "interact": "notice",
            "note": f"{name} {fl}F · {elev_note} · 东侧步梯 · 西侧消防通道 · 户门已开放",
        })
        if nf > 7:
            objs.append({
                "id": f"{key}_elev_{fl}", "type": "i_notice", "x": 3.5, "y": 3.98, "z": 1.25,
                "interact": "elevator", "name": "电梯", "label": "乘电梯 · 选楼层",
                "building": f"mt_{key}", "floor": fl, "reach": [3.5, 3.4],
            })
        # livable unit doors
        for slot, x, reach in ((1, 1.4, [2.2, 3.55]), (2, 4.6, [5.1, 3.55])):
            to = unit_scene_id(key, fl, slot)
            objs.append({
                "id": f"door_{key}_{fl}0{slot}", "type": "i_door", "x": x, "y": 4.0, "z": 0,
                "state": "closed", "interact": "portal", "name": f"{fl}-0{slot}",
                "to": to, "spawn": [6.2, 0.85, "W"],
                "label": f"进 {fl}-0{slot}", "reach": reach,
            })
        if fl < nf:
            to = f"mt_{key}_{fl+1}f"
            objs.append({
                "id": f"{key}_up_{fl}", "type": "i_flight", "x": 5.5, "y": 1.0, "z": 0,
                "state": "up", "interact": "stairs", "go": "up", "to": to, "reach": [5.9, 0.7],
            })
            portals.append({
                "id": f"up_{fl+1}", "rect": [5.2, 0.5, 6.5, 1.0], "dir": "N",
                "to": to, "spawn": [5.9, 0.4, "S"], "label": "上楼", "go": "up", "obj": f"{key}_up_{fl}",
            })
        if fl > 1:
            to = f"mt_{key}_{fl-1}f"
            objs.append({
                "id": f"{key}_dn_{fl}", "type": "i_flight", "x": 5.5, "y": 2.2, "z": 0,
                "state": "down", "interact": "stairs", "go": "down", "to": to, "reach": [5.9, 1.9],
            })
            portals.append({
                "id": f"down_{fl-1}", "rect": [5.2, 1.8, 6.5, 2.4], "dir": "S",
                "to": to, "spawn": [5.9, 1.5, "N"], "label": "下楼", "go": "down", "obj": f"{key}_dn_{fl}",
            })
        fire_to = f"mt_{key}_fire_{fl}f"
        objs.append({
            "id": f"{key}_firedoor_{fl}", "type": "i_door", "x": 0.6, "y": 2.5, "z": 0,
            "state": "closed", "interact": "portal", "name": "消防通道",
            "to": fire_to, "spawn": [2.0, 1.5, "E"], "label": "进消防通道", "reach": [1.2, 2.2],
        })
        if fl == 1:
            portals.append({
                "id": "exit_street", "rect": [2.8, 0.15, 4.2, 0.5], "dir": "S",
                "to": "street", "spawn": [b["door_x"], b["face_y"] - 1.5, "S"],
                "label": "出门", "door": f"mt_{key}_door",
            })
            objs.append({
                "id": f"{key}_exit_{fl}", "type": "i_door", "x": 3.5, "y": 0.3, "z": 0,
                "state": "open", "interact": "portal", "name": "大门",
                "to": "street", "spawn": [b["door_x"], b["face_y"] - 1.5, "S"],
                "label": "出门", "reach": [3.5, 0.9],
            })
    else:
        objs.append({
            "id": f"{key}_fire_note_{fl}", "type": "i_notice", "x": 2.0, "y": 3.98, "z": 1.1,
            "interact": "notice", "note": f"{name} 消防通道 {fl}F · 保持畅通 · 禁止堆放杂物",
        })
        if fl < nf:
            to = f"mt_{key}_fire_{fl+1}f"
            objs.append({
                "id": f"{key}_fire_up_{fl}", "type": "i_flight", "x": 3.2, "y": 1.0, "z": 0,
                "state": "up", "interact": "stairs", "go": "up", "to": to, "reach": [3.5, 0.7],
            })
            portals.append({
                "id": f"up_{fl+1}", "rect": [2.8, 0.5, 4.0, 1.0], "dir": "N",
                "to": to, "spawn": [3.5, 0.4, "S"], "label": "消防上楼", "go": "up",
            })
        if fl > 1:
            to = f"mt_{key}_fire_{fl-1}f"
            objs.append({
                "id": f"{key}_fire_dn_{fl}", "type": "i_flight", "x": 3.2, "y": 2.2, "z": 0,
                "state": "down", "interact": "stairs", "go": "down", "to": to, "reach": [3.5, 1.9],
            })
            portals.append({
                "id": f"down_{fl-1}", "rect": [2.8, 1.8, 4.0, 2.4], "dir": "S",
                "to": to, "spawn": [3.5, 1.5, "N"], "label": "消防下楼", "go": "down",
            })
        hall = f"mt_{key}_{fl}f"
        objs.append({
            "id": f"{key}_fire_back_{fl}", "type": "i_door", "x": 0.6, "y": 2.5, "z": 0,
            "state": "closed", "interact": "portal", "name": "回走廊",
            "to": hall, "spawn": [1.2, 2.2, "E"], "label": "回走廊", "reach": [1.2, 2.2],
        })
        if fl == 1:
            portals.append({
                "id": "exit_street_fire", "rect": [1.5, 0.15, 3.0, 0.5], "dir": "S",
                "to": "street", "spawn": [b["door_x"] - 4.0, b["face_y"] - 1.2, "S"], "label": "紧急出口",
            })
            objs.append({
                "id": f"{key}_fire_exit", "type": "i_door", "x": 2.2, "y": 0.3, "z": 0,
                "state": "open", "interact": "portal", "name": "紧急出口",
                "to": "street", "spawn": [b["door_x"] - 4.0, b["face_y"] - 1.2, "S"],
                "label": "紧急出口到街", "reach": [2.2, 0.9],
            })
        spawn = [2.5, 1.5, "N"]

    return {
        "format": "fushi-scene", "version": 2, "id": sid, "name": title,
        "interior": True, "units": "m", "grid_m": 0.5, "floor": fl,
        "building": f"mt_{key}", "midtown": True, "kind": kind,
        "objects": objs, "colliders": [], "portals": portals,
        "laundry": [], "puddles": [], "leaf_piles": [], "wires": [],
        "npcs": [], "events": [], "interactions": {}, "calendar": {},
        "weather": {}, "repair_hours_scale": 1,
        "bounds": {"x0": 0.15, "y0": 0.15, "x1": 6.9, "y1": 3.85},
        "ground": {
            "origin": [0, 0], "chunk": 2, "cols": 4, "rows": 2,
            "legend": {"T": "g_terrazzo"}, "data_south_to_north": ["TTTT", "TTTT"],
        },
        "spawn": spawn, "bg_view": None,
    }


def build_scenes() -> dict:
    tmpl = load_xin_template()
    scenes = {}
    LAYOUT_DIR.mkdir(parents=True, exist_ok=True)
    for b in BUILDINGS:
        for fl in range(1, b["floors"] + 1):
            s = corridor_scene(b, fl, "hall")
            scenes[s["id"]] = s
            (LAYOUT_DIR / f"midtown_{b['key']}_{fl}f.json").write_text(
                json.dumps(s, ensure_ascii=False, indent=2), encoding="utf-8")
            fs = corridor_scene(b, fl, "fire")
            scenes[fs["id"]] = fs
            (LAYOUT_DIR / f"midtown_{b['key']}_fire_{fl}f.json").write_text(
                json.dumps(fs, ensure_ascii=False, indent=2), encoding="utf-8")
            for slot in (1, 2):
                u = make_unit(tmpl, b, fl, slot)
                scenes[u["id"]] = u
                (LAYOUT_DIR / f"{u['id']}.json").write_text(
                    json.dumps({"id": u["id"], "name": u["name"], "building": u["building"],
                                "mt_floor": u["mt_floor"], "mt_slot": u["mt_slot"],
                                "spawn": u["spawn"], "nobj": len(u["objects"])},
                               ensure_ascii=False, indent=2), encoding="utf-8")
    return scenes


def rent_catalog() -> dict:
    cat = {}
    bmap = {b["key"]: b for b in BUILDINGS}
    for rid, key, fl, slot, rent, typ in RENT_FEATURED:
        b = bmap[key]
        scene = unit_scene_id(key, fl, slot)
        cat[rid] = {
            "district": "inner",
            "rent": rent,
            "type": typ,
            "scene": scene,
            "door": f"mt_{key}_1f",
            "stair": f"mt_{key}_1f",
            "label": f"{b['name']} {fl}-0{slot}",
            "midtown": True,
        }
    return cat


def extend_scene_json(chunk_meta: dict) -> None:
    path = ROOT / "scene.json"
    sj = json.loads(path.read_text(encoding="utf-8"))
    sj["bounds"]["x1"] = max(sj["bounds"].get("x1", 104), 150.0)
    g = sj["ground"]
    old_cols = g["cols"]
    ox = g["origin"][0]
    need = int(math.ceil((150 - ox) / g["chunk"]))
    add = max(0, need - old_cols)
    if add:
        g["cols"] = old_cols + add
        oy = g["origin"][1]
        rows = g["data_south_to_north"]
        new_rows = []
        for j, row in enumerate(rows):
            y = oy + j * g["chunk"]
            if -7 <= y <= -1:
                pad = "A" * add
            elif -1 < y <= 3:
                pad = "S" * add
            else:
                pad = "C" * add
            new_rows.append(row + pad)
        g["data_south_to_north"] = new_rows
    chunks = [c for c in sj.setdefault("chunks", []) if c.get("id") != "midtown"]
    chunks.append({"id": "midtown", "rect": chunk_meta["rect"], "src": "chunks/midtown.js", "load_m": 30, "unload_m": 55})
    sj["chunks"] = chunks
    path.write_text(json.dumps(sj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    scene_js = ROOT / "scene.js"
    scene_js.write_text(
        "/* generated from scene.json by tools/build_midtown.py (file:// cannot fetch JSON) */\n"
        "window.SCENE_DATA=" + json.dumps(sj, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )


def patch_rules_rent(cat: dict) -> None:
    import subprocess
    paths = [ROOT.parent / "shared-rules" / "rules.json", ROOT / "shared-rules" / "rules.json"]
    for rules_path in paths:
        if not rules_path.exists():
            continue
        rules = json.loads(rules_path.read_text(encoding="utf-8"))
        units = rules.setdefault("rent_table", {}).setdefault("units", {})
        for k in list(units.keys()):
            if k.startswith("mt-jx-") or k.startswith("mt-yj-") or k.startswith("mt-cn-"):
                del units[k]
        units.update(cat)
        doc = rules["rent_table"].get("_doc", "")
        if "Midtown-A2" not in doc:
            rules["rent_table"]["_doc"] = doc + " Midtown-A2: 景秀/云阶/城南 featured units mt-*-* (inner district)."
        rules_path.write_text(json.dumps(rules, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    build = ROOT.parent / "shared-rules" / "build.py"
    if build.exists():
        subprocess.check_call(["python3", str(build)])
        data = ROOT.parent / "shared-rules" / "rules.data.js"
        if data.exists():
            (ROOT / "shared-rules" / "rules.data.js").write_text(data.read_text(encoding="utf-8"), encoding="utf-8")


def main() -> None:
    chunk = build_chunk()
    CHUNK_OUT.write_text(
        "/* generated by tools/build_midtown.py — Midtown-A/A2/A3 east strip */\n"
        "(window.SCENE_CHUNKS=window.SCENE_CHUNKS||{}).midtown="
        + json.dumps(chunk, ensure_ascii=False) + ";\n", encoding="utf-8")
    scenes = build_scenes()
    rent = rent_catalog()
    SCENES_OUT.write_text(
        "/* generated by tools/build_midtown.py — midtown halls/fire/units + rent catalog */\n"
        "window.MIDTOWN_SCENES=" + json.dumps(scenes, ensure_ascii=False) + ";\n"
        "window.MIDTOWN_RENT=" + json.dumps(rent, ensure_ascii=False) + ";\n",
        encoding="utf-8")
    extend_scene_json(chunk)
    patch_rules_rent(rent)
    (LAYOUT_DIR / "midtown_meta.json").write_text(json.dumps({
        "axis": "east", "phase": "A3",
        "buildings": [{"key": b["key"], "name": b["name"], "floors": b["floors"], "style": b["style"]} for b in BUILDINGS],
        "chunk_objects": len(chunk["objects"]),
        "scenes": len(scenes),
        "units": sum(1 for k in scenes if k.startswith("room_mt_")),
        "rent_featured": list(rent.keys()),
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print("chunk", len(chunk["objects"]), "scenes", len(scenes),
          "units", sum(1 for k in scenes if k.startswith("room_mt_")),
          "rent", len(rent))


if __name__ == "__main__":
    main()
