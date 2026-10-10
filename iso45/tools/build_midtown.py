#!/usr/bin/env python3
"""Build Midtown-A: east-axis mid-rise strip + interiors + extend street ground/bounds.

Axis: EAST of old block (past chunks/east / school_high), toward near-downtown.
Buildings (W→E, rising): 景秀苑 8F, 云阶公馆 12F, 城南一号 16F — all >7F have elevators.
"""
from __future__ import annotations
import json, math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHUNK_OUT = ROOT / "chunks" / "midtown.js"
SCENES_OUT = ROOT / "js" / "midtown_scenes.js"
LAYOUT_DIR = ROOT / "tools" / "layouts"

# --- street geometry (east axis) ---
# Old east chunk curb ends ~103; midtown continues 104→146
X0, X1 = 104.0, 146.0
ROAD_Y0, ROAD_Y1 = -6.0, 0.0  # asphalt band (matches old block)
N_CURB_Y, S_CURB_Y = 0.1, -6.1

BUILDINGS = [
    # Transitional mid-rise: plaster/brick mix, laundry balconies, busy AC — bridge from old block
    {
        "key": "jx",
        "name": "景秀苑",
        "name_en": "Jingxiu Court",
        "floors": 8,
        "door_x": 110.0,
        "face_y": 4.5,
        "bays": 4,
        "depth": 9.0,
        "mixed": False,
        "style": "transitional",
    },
    # Modern glass slab: clean plaster, glass balconies, sparse AC, commercial podium
    {
        "key": "yj",
        "name": "云阶公馆",
        "name_en": "Yunjie Mansion",
        "floors": 12,
        "door_x": 124.0,
        "face_y": 5.2,  # slight setback silhouette
        "bays": 5,
        "depth": 8.0,
        "mixed": True,
        "style": "glass",
    },
    # Mixed-use tower: taller, stepped top, shop strip, vertical pipes, fewer balconies
    {
        "key": "cn",
        "name": "城南一号",
        "name_en": "Chengnan One",
        "floors": 16,
        "door_x": 138.5,
        "face_y": 3.8,
        "bays": 5,
        "depth": 11.0,
        "mixed": True,
        "style": "tower",
    },
]

# Per-building facade recipes — avoid identical rows
STYLES = {
    "transitional": {
        "wall_cycle": ["p1", "w1", "p1", "w2"],  # brick/plaster mottled
        "win_var": "w2",
        "win_lit_odds": 0.35,
        "balcony_odds": 0.55,  # cluttered
        "balcony_vars": ["b1", "base", "b1"],
        "laundry_odds": 0.65,
        "ac_odds": 0.55,
        "ac_vars": ["base", "a1", "a2"],
        "pipe_every": 1,  # every floor edge pipe — older feel
        "roof": "b_roof_b",
        "roof_var": None,
        "shop_state": None,
        "setback_top": 0,  # no setback
        "skip_bay_top": [],
    },
    "glass": {
        "wall_cycle": ["w2", "w2", "p1", "w2"],  # clean modern plaster
        "win_var": "w1",
        "win_lit_odds": 0.85,
        "balcony_odds": 0.22,  # sparse glass protrusions
        "balcony_vars": ["b2", "b2"],
        "laundry_odds": 0.05,
        "ac_odds": 0.12,
        "ac_vars": ["a1"],
        "pipe_every": 6,
        "roof": "b_roof_a",
        "roof_var": None,
        "shop_state": "door",
        "setback_top": 0,
        "skip_bay_top": [],
    },
    "tower": {
        "wall_cycle": ["w1", "p1", "w1", "w2"],
        "win_var": "w2",
        "win_lit_odds": 0.55,
        "balcony_odds": 0.28,
        "balcony_vars": ["b1", "b2", "base"],
        "laundry_odds": 0.2,
        "ac_odds": 0.3,
        "ac_vars": ["a2", "a1"],
        "pipe_every": 2,
        "roof": "b_roof_b",
        "roof_var": "c",
        "shop_state": "window",
        "setback_top": 2,  # top 2 floors drop end bays → silhouette
        "skip_bay_top": [0, 4],  # drop corners on setback floors
    },
}



def bay_xs(door_x: float, bays: int) -> list[float]:
    # door on bay index 1 (second bay); wall bays 3m
    start = door_x - 3.0  # bay0 left of door
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
                "state": wall_st, "fade_group": fg,
                "variant": walls[(i + fl) % len(walls)],
            })
            # entrance
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
            # ground shop / colored shopfront
            if fl == 0 and b.get("mixed") and i == 0:
                shop = {
                    "id": f"{tag}_shop", "type": "f_shop", "x": x, "y": fy, "z": z,
                    "state": st["shop_state"] or "window", "fade_group": fg,
                }
                objs.append(shop)
                continue
            if fl == 0 and b.get("mixed") and i == b["bays"] - 1 and key == "cn":
                # second shopfront color/state contrast on tower
                objs.append({
                    "id": f"{tag}_shop2", "type": "f_shop", "x": x, "y": fy, "z": z,
                    "state": "shut", "fade_group": fg,
                })
                continue
            # balcony vs window
            want_balc = fl > 0 and ((i * 3 + fl * 5 + hash(key) % 7) % 10) / 10.0 < st["balcony_odds"]
            if want_balc:
                laundry = ((i + fl) % 3 == 0) and ((i * 2 + fl) % 10) / 10.0 < st["laundry_odds"]
                bvar = st["balcony_vars"][(i + fl) % len(st["balcony_vars"])]
                objs.append({
                    "id": f"{tag}_balc", "type": "f_balcony", "x": x, "y": fy, "z": z,
                    "state": "laundry" if laundry else "default",
                    "fade_group": fg, "variant": bvar,
                })
            else:
                lit = ((i * 7 + fl * 11 + ord(key[0])) % 10) / 10.0 < st["win_lit_odds"]
                win = {
                    "id": f"{tag}_win", "type": "f_window", "x": x, "y": fy, "z": z,
                    "state": "intact", "fade_group": fg, "variant": st["win_var"],
                }
                if lit:
                    win["night_lit"] = True
                # rare boarded on transitional only (lived-in)
                if b["style"] == "transitional" and fl > 2 and (i + fl) % 11 == 0:
                    win["state"] = "boarded"
                    win.pop("night_lit", None)
                objs.append(win)
            # AC clutter
            if fl > 0 and ((i * 5 + fl * 3) % 10) / 10.0 < st["ac_odds"]:
                objs.append({
                    "id": f"{tag}_ac", "type": "f_ac",
                    "x": x + 1.35, "y": fy, "z": z + 0.15,
                    "fade_group": fg,
                    "variant": st["ac_vars"][(i + fl) % len(st["ac_vars"])],
                })
        # vertical pipes — density by style
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
    # roof — type differs per building
    rz = 3.0 * nf
    roof = {"id": f"{fg}_roof", "type": st["roof"], "x": xs[0], "y": fy, "z": rz, "fade_group": fg}
    if st["roof_var"]:
        roof["variant"] = st["roof_var"]
    objs.append(roof)
    # tower gets a small deck cap offset for silhouette
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
    # road markings / curbs continuing east
    x = X0
    while x <= X1:
        objs.append({"id": f"mt_curb_n{int(x)}", "type": "p_curb", "x": x, "y": N_CURB_Y})
        objs.append({"id": f"mt_curb_s{int(x)}", "type": "p_curb", "x": x, "y": S_CURB_Y})
        objs.append({"id": f"mt_edge_n{int(x)}", "type": "d_edge_line", "x": x, "y": -0.35})
        objs.append({"id": f"mt_edge_s{int(x)}", "type": "d_edge_line", "x": x, "y": -5.65})
        if int(x) % 6 == 0:
            objs.append({"id": f"mt_dash{int(x)}", "type": "d_center_dash", "x": x, "y": -3.0})
        x += 2.0
    # trees / poles sparse modern streetscape
    for tx in (108, 118, 130, 142):
        objs.append({"id": f"mt_tree_{tx}", "type": "p_tree", "x": tx, "y": 1.2})
    objs.append({"id": "mt_pole_112", "type": "p_pole", "x": 112, "y": -0.2})
    objs.append({"id": "mt_pole_132", "type": "p_pole", "x": 132, "y": -0.2})
    objs.append({"id": "mt_bins_116", "type": "p_bins", "x": 116, "y": 1.0})
    # connection marker at seam with east chunk
    objs.append({
        "id": "mt_seam_sign", "type": "f_sign", "x": 105.0, "y": 1.5, "z": 0,
        "state": "default", "name": "往城南 / 近市中心 →",
    })

    for b in BUILDINGS:
        add_facade(objs, b)
        xs = bay_xs(b["door_x"], b["bays"])
        # collider footprint (building body north of S face)
        cols.append({
            "id": f"mt_{b['key']}",
            "rect": [xs[0] - 0.3, b["face_y"] - 0.3, xs[-1] + 3.3, b["face_y"] + b["depth"]],
        })

    return {
        "id": "midtown",
        "rect": [X0 - 0.5, -40.0, X1 + 2.0, 64.0],
        "objects": objs,
        "colliders": cols,
    }


def corridor_scene(b: dict, fl: int, kind: str = "hall") -> dict:
    """kind: hall (elev+stairs+fire) or fire (fire shaft only)."""
    key, name, nf = b["key"], b["name"], b["floors"]
    sid = f"mt_{key}_{'fire_' if kind == 'fire' else ''}{fl}f"
    title = f"{name} · {'消防通道' if kind == 'fire' else '走廊'} {fl}F"
    objs = []
    # walls / cuts baseline (mirror xin-ish)
    for i, x in enumerate([0.5, 1.5, 2.5, 3.5, 4.5, 5.5]):
        objs.append({"id": f"w{i}", "type": "i_wall", "x": x, "y": 4.0, "z": 0, "state": "dado"})
    for i, x in enumerate([0.8, 2.0, 3.2, 4.4, 5.6]):
        objs.append({"id": f"c{i}", "type": "i_cut", "x": x, "y": 0.2, "z": 0})

    portals = []
    spawn = [3.5, 1.0, "N"]

    if kind == "hall":
        # directory / modern lobby notes
        elev_note = "电梯 · 按楼层直达（本楼设客梯）" if nf > 7 else "步梯"
        objs.append({
            "id": f"{key}_dir_{fl}", "type": "i_notice", "x": 2.2, "y": 3.98, "z": 1.15,
            "interact": "notice",
            "note": f"{name} {fl}F · {elev_note} · 东侧步梯 · 西侧消防通道 · 请勿堵塞",
        })
        # elevator panel (all floors on >7F buildings)
        if nf > 7:
            objs.append({
                "id": f"{key}_elev_{fl}", "type": "i_notice", "x": 3.5, "y": 3.98, "z": 1.25,
                "interact": "elevator", "name": "电梯",
                "label": "乘电梯 · 选楼层",
                "building": f"mt_{key}", "floor": fl,
                "reach": [3.5, 3.4],
            })
        # unit doors (placeholder rooms — Midtown-B)
        objs.append({
            "id": f"door_{key}_{fl}01", "type": "i_door", "x": 1.4, "y": 4.0, "z": 0,
            "state": "closed", "interact": "notice", "name": f"{fl}-01",
            "note": f"{fl}-01 尚在装修（Midtown-B 小区交付）", "reach": [1.9, 3.55],
        })
        objs.append({
            "id": f"door_{key}_{fl}02", "type": "i_door", "x": 4.6, "y": 4.0, "z": 0,
            "state": "closed", "interact": "notice", "name": f"{fl}-02",
            "note": f"{fl}-02 尚在装修（Midtown-B 小区交付）", "reach": [5.1, 3.55],
        })
        # stairs (步梯) east
        if fl < nf:
            to = f"mt_{key}_{fl+1}f"
            objs.append({
                "id": f"{key}_up_{fl}", "type": "i_flight", "x": 5.5, "y": 1.0, "z": 0,
                "state": "up", "interact": "stairs", "go": "up", "to": to,
                "reach": [5.9, 0.7],
            })
            portals.append({
                "id": f"up_{fl+1}", "rect": [5.2, 0.5, 6.5, 1.0], "dir": "N",
                "to": to, "spawn": [5.9, 0.4, "S"], "label": "上楼", "go": "up",
                "obj": f"{key}_up_{fl}",
            })
        if fl > 1:
            to = f"mt_{key}_{fl-1}f"
            objs.append({
                "id": f"{key}_dn_{fl}", "type": "i_flight", "x": 5.5, "y": 2.2, "z": 0,
                "state": "down", "interact": "stairs", "go": "down", "to": to,
                "reach": [5.9, 1.9],
            })
            portals.append({
                "id": f"down_{fl-1}", "rect": [5.2, 1.8, 6.5, 2.4], "dir": "S",
                "to": to, "spawn": [5.9, 1.5, "N"], "label": "下楼", "go": "down",
                "obj": f"{key}_dn_{fl}",
            })
        # fire exit west
        fire_to = f"mt_{key}_fire_{fl}f"
        objs.append({
            "id": f"{key}_firedoor_{fl}", "type": "i_door", "x": 0.6, "y": 2.5, "z": 0,
            "state": "closed", "interact": "portal", "name": "消防通道",
            "to": fire_to, "spawn": [2.0, 1.5, "E"], "label": "进消防通道",
            "reach": [1.2, 2.2],
        })
        # street exit on 1F
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
        # fire shaft — narrow, stairs only + exit
        objs.append({
            "id": f"{key}_fire_note_{fl}", "type": "i_notice", "x": 2.0, "y": 3.98, "z": 1.1,
            "interact": "notice",
            "note": f"{name} 消防通道 {fl}F · 保持畅通 · 禁止堆放杂物",
        })
        if fl < nf:
            to = f"mt_{key}_fire_{fl+1}f"
            objs.append({
                "id": f"{key}_fire_up_{fl}", "type": "i_flight", "x": 3.2, "y": 1.0, "z": 0,
                "state": "up", "interact": "stairs", "go": "up", "to": to,
                "reach": [3.5, 0.7],
            })
            portals.append({
                "id": f"up_{fl+1}", "rect": [2.8, 0.5, 4.0, 1.0], "dir": "N",
                "to": to, "spawn": [3.5, 0.4, "S"], "label": "消防上楼", "go": "up",
            })
        if fl > 1:
            to = f"mt_{key}_fire_{fl-1}f"
            objs.append({
                "id": f"{key}_fire_dn_{fl}", "type": "i_flight", "x": 3.2, "y": 2.2, "z": 0,
                "state": "down", "interact": "stairs", "go": "down", "to": to,
                "reach": [3.5, 1.9],
            })
            portals.append({
                "id": f"down_{fl-1}", "rect": [2.8, 1.8, 4.0, 2.4], "dir": "S",
                "to": to, "spawn": [3.5, 1.5, "N"], "label": "消防下楼", "go": "down",
            })
        # back to hall
        hall = f"mt_{key}_{fl}f"
        objs.append({
            "id": f"{key}_fire_back_{fl}", "type": "i_door", "x": 0.6, "y": 2.5, "z": 0,
            "state": "closed", "interact": "portal", "name": "回走廊",
            "to": hall, "spawn": [1.2, 2.2, "E"], "label": "回走廊",
            "reach": [1.2, 2.2],
        })
        if fl == 1:
            # emergency street exit (alley slightly west of door)
            portals.append({
                "id": "exit_street_fire", "rect": [1.5, 0.15, 3.0, 0.5], "dir": "S",
                "to": "street", "spawn": [b["door_x"] - 4.0, b["face_y"] - 1.2, "S"],
                "label": "紧急出口",
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
            "legend": {"T": "g_terrazzo"},
            "data_south_to_north": ["TTTT", "TTTT"],
        },
        "spawn": spawn,
        "bg_view": None,
    }


def build_scenes() -> dict:
    scenes = {}
    for b in BUILDINGS:
        for fl in range(1, b["floors"] + 1):
            s = corridor_scene(b, fl, "hall")
            scenes[s["id"]] = s
            # write layout json
            LAYOUT_DIR.mkdir(parents=True, exist_ok=True)
            (LAYOUT_DIR / f"midtown_{b['key']}_{fl}f.json").write_text(
                json.dumps(s, ensure_ascii=False, indent=2), encoding="utf-8"
            )
            fs = corridor_scene(b, fl, "fire")
            scenes[fs["id"]] = fs
            (LAYOUT_DIR / f"midtown_{b['key']}_fire_{fl}f.json").write_text(
                json.dumps(fs, ensure_ascii=False, indent=2), encoding="utf-8"
            )
    return scenes


def extend_scene_json(chunk_meta: dict) -> None:
    path = ROOT / "scene.json"
    sj = json.loads(path.read_text(encoding="utf-8"))
    # bounds
    sj["bounds"]["x1"] = max(sj["bounds"].get("x1", 104), 150.0)
    # ground: extend cols east with asphalt + sidewalks matching road band
    g = sj["ground"]
    old_cols = g["cols"]
    # need cover to x≈148: origin_x + cols*2 >= 148 → cols >= (148 - origin)/2
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
            # match road band: y -6,-4,-2 asphalt; y 0,2 sidewalk; else court/sidewalk
            if -7 <= y <= -1:
                pad = "A" * add
            elif -1 < y <= 3:
                pad = "S" * add
            else:
                pad = "C" * add
            new_rows.append(row + pad)
        g["data_south_to_north"] = new_rows
    # chunks registry
    chunks = sj.setdefault("chunks", [])
    chunks = [c for c in chunks if c.get("id") != "midtown"]
    chunks.append({
        "id": "midtown",
        "rect": chunk_meta["rect"],
        "src": "chunks/midtown.js",
        "load_m": 30,
        "unload_m": 55,
    })
    sj["chunks"] = chunks
    path.write_text(json.dumps(sj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    # also refresh scene.js if present (generated twin)
    scene_js = ROOT / "scene.js"
    if scene_js.exists():
        scene_js.write_text(
            "/* generated from scene.json by tools/build_midtown.py (file:// cannot fetch JSON) */\n"
            "window.SCENE_DATA=" + json.dumps(sj, ensure_ascii=False) + ";\n",
            encoding="utf-8",
        )


def main() -> None:
    chunk = build_chunk()
    CHUNK_OUT.parent.mkdir(parents=True, exist_ok=True)
    CHUNK_OUT.write_text(
        "/* generated by tools/build_midtown.py — Midtown-A east strip */\n"
        "(window.SCENE_CHUNKS=window.SCENE_CHUNKS||{}).midtown="
        + json.dumps(chunk, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    scenes = build_scenes()
    SCENES_OUT.write_text(
        "/* generated by tools/build_midtown.py — midtown interiors */\n"
        "window.MIDTOWN_SCENES="
        + json.dumps(scenes, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    extend_scene_json(chunk)
    meta = {
        "axis": "east",
        "buildings": [
            {"key": b["key"], "name": b["name"], "floors": b["floors"], "door_x": b["door_x"]}
            for b in BUILDINGS
        ],
        "chunk_objects": len(chunk["objects"]),
        "scenes": len(scenes),
    }
    (ROOT / "tools" / "layouts" / "midtown_meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("midtown chunk objects", len(chunk["objects"]))
    print("scenes", len(scenes))
    print("wrote", CHUNK_OUT)
    print("wrote", SCENES_OUT)
    print("patched scene.json bounds/ground/chunks")


if __name__ == "__main__":
    main()
