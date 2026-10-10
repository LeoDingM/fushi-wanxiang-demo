"""Midtown-B estate: interiors + street facade variety (outer block).
layouts estate_*/room_midtown_* -> estate45.js
street facades -> chunks/estate.js (SCENE_CHUNKS.estate)
Run: python3 tools/build_estate.py"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import roomlayout as RL

STREET = json.load(open(os.path.join(ROOT, "scene.json")))
STREET_SPAWN = [116.0, 3.0, "S"]
LAYOUTS = ["estate_lobby.json", "estate_club.json", "room_midtown_a101.json"]  # compound = outdoor chunk (no void interior)

# --- Facade variety (modern Chinese high-end compound, not cloned old-block) ---
# Kit levers: f_wall w1/w2/p1 · f_window w1/w2 · f_balcony b1/b2(+laundry) ·
#             b_roof_a / b_roof_b / b_roof_deck · f_shop · f_ac a1/a2 · f_pipe
VARIETY_RULES = {
  "_doc": "Each 云栖里 outer-block building must differ on ≥3 axes: height, wall finish, roof, balcony density. Lean CBD/云麓 cream–glass high-end, not identical brick boxes.",
  "axes": {
    "height": "floors (club 4 / cream 11 / masonry 14 / glass 18)",
    "wall": "plaster p1 · warm w2 masonry strip · glass_strip (window-dominant w1) · glass_podium (shop+glass G)",
    "roof": "b_roof_deck (flat modern) · b_roof_a (soft) · b_roof_b (slab)",
    "balcony": "none/sparse · mid every-2F · dense every-F · laundry_alt",
    "ac_pipes": "none · rare · mid — high-end prefers cleaner facades",
  },
  "avoid": "Same floors + same wall variant + same roof + same balcony rhythm as a neighbour within 30 m.",
}

BUILDINGS = [
  {
    "key": "yq_club", "name": "云栖会所", "look": "glass_podium",
    "floors": 4, "door_x": 156.0, "face_y": 4.5, "bays": 4, "depth": 10.0,
    "wall": "glass_podium", "roof": "b_roof_deck", "balcony": "sparse",
    "ac": "none", "pipe": False, "window_var": "w1",
    "blurb": "低层会所 · 玻璃门厅+粉刷上层 · 平屋顶",
  },
  {
    "key": "yq_cream", "name": "云栖暖石", "look": "plaster",
    "floors": 11, "door_x": 168.0, "face_y": 4.5, "bays": 5, "depth": 10.0,
    "wall": "plaster", "roof": "b_roof_a", "balcony": "mid",
    "ac": "sparse", "pipe": False, "window_var": "w1",
    "blurb": "中高层象牙白粉刷 · 疏阳台 · 软顶",
  },
  {
    "key": "yq_mason", "name": "云栖砖影", "look": "warm_masonry",
    "floors": 14, "door_x": 182.0, "face_y": 4.5, "bays": 4, "depth": 11.0,
    "wall": "warm_masonry", "roof": "b_roof_b", "balcony": "laundry_alt",
    "ac": "mid", "pipe": True, "window_var": "w2",
    "blurb": "暖色砖纹条带 · 晾衣阳台交错 · 板式屋顶",
  },
  {
    "key": "yq_glass", "name": "云栖璃湾", "look": "glass_strip",
    "floors": 18, "door_x": 196.0, "face_y": 4.5, "bays": 4, "depth": 10.0,
    "wall": "glass_strip", "roof": "b_roof_deck", "balcony": "dense",
    "ac": "none", "pipe": False, "window_var": "w1",
    "blurb": "高层玻璃竖条 · 密阳台 · 平屋顶 · 无外机噪音",
  },
]


def bay_xs(door_x, bays):
  start = door_x - 3.0
  return [start + i * 3.0 for i in range(bays)]


def wall_variant(mode, fl, i):
  if mode == "plaster":
    return "p1"
  if mode == "warm_masonry":
    return "w2" if (i + fl) % 3 else "w1"
  if mode == "glass_strip":
    return "w1"
  if mode == "glass_podium":
    return "p1" if fl > 0 else "w2"
  return "p1"


def want_balcony(mode, fl, i, nf):
  if fl == 0:
    return None
  if mode == "sparse":
    return "b1" if fl == nf - 1 and i % 2 == 0 else None
  if mode == "mid":
    return "b1" if fl % 2 == 0 and i % 2 == 1 else None
  if mode == "dense":
    return "b2" if i % 2 == 0 else None
  if mode == "laundry_alt":
    if fl % 2 == 1:
      return ("b2", "laundry") if i % 2 == 0 else None
    return "b1" if i == 0 else None
  return None


def want_ac(mode, fl, i):
  if mode == "none" or fl == 0:
    return False
  if mode == "sparse":
    return (i + fl) % 6 == 0
  if mode == "mid":
    return (i + fl) % 4 == 0
  return False


def add_facade(objs, cols, b):
  key, name, nf = b["key"], b["name"], b["floors"]
  xs = bay_xs(b["door_x"], b["bays"])
  fy, fg = b["face_y"], f"es_{key}"
  mode = b["wall"]
  for fl in range(nf):
    z = 3.0 * fl
    for i, x in enumerate(xs):
      tag = f"{fg}_S{fl+1}F_{i}"
      st = "ground" if fl == 0 else "upper"
      wv = wall_variant(mode, fl, i)

      # glass_strip: skip solid wall on even bays (window only = glassier read)
      solid = not (mode == "glass_strip" and i % 2 == 1 and fl > 0)
      if solid:
        objs.append({
          "id": f"{tag}_wall", "type": "f_wall", "x": x, "y": fy, "z": z,
          "state": st, "fade_group": fg, "variant": wv,
        })

      if fl == 0 and abs(x - b["door_x"]) < 0.1:
        objs.append({
          "id": f"{fg}_door", "type": "f_door", "x": x, "y": fy, "z": z,
          "state": "closed", "fade_group": fg, "interact": ("estate_club" if key == "yq_club" else "notice"),
          "name": name, "plate": name, "estate": True,
          "note": f"{name} · {b['blurb']}",
        })
      elif fl == 0 and mode == "glass_podium" and i != 1:
        objs.append({
          "id": f"{tag}_shop", "type": "f_shop", "x": x, "y": fy, "z": z,
          "state": "open", "fade_group": fg, "variant": "base",
        })
      elif fl == 0 and mode == "glass_strip" and i == 0:
        objs.append({
          "id": f"{tag}_shop", "type": "f_shop", "x": x, "y": fy, "z": z,
          "state": "window", "fade_group": fg, "variant": "base",
        })
      else:
        objs.append({
          "id": f"{tag}_win", "type": "f_window", "x": x, "y": fy, "z": z,
          "state": "intact", "fade_group": fg, "variant": b.get("window_var", "w1"),
          "night_lit": True,
        })

      bal = want_balcony(b["balcony"], fl, i, nf)
      if bal:
        if isinstance(bal, tuple):
          bv, bst = bal
        else:
          bv, bst = bal, "default"
        objs.append({
          "id": f"{tag}_bal", "type": "f_balcony", "x": x, "y": fy - 0.05, "z": z,
          "state": bst, "fade_group": fg, "variant": bv,
        })

      if want_ac(b["ac"], fl, i):
        objs.append({
          "id": f"{tag}_ac", "type": "f_ac", "x": x + 1.35, "y": fy,
          "z": z + 0.15, "fade_group": fg, "variant": "a2" if mode == "warm_masonry" else "a1",
        })

    if b.get("pipe") and fl % 5 == 0:
      objs.append({
        "id": f"{fg}_pipe_{fl}", "type": "f_pipe",
        "x": xs[-1] + 2.85, "y": fy, "z": z, "fade_group": fg,
      })

  rz = 3.0 * nf
  objs.append({
    "id": f"{fg}_roof", "type": b["roof"], "x": xs[0], "y": fy,
    "z": rz, "fade_group": fg, "variant": "c" if b["roof"] == "b_roof_b" else "base",
  })
  objs.append({
    "id": f"{fg}_sign", "type": "f_shopsign", "x": b["door_x"], "y": fy - 0.05,
    "z": 2.55, "fade_group": fg, "state": "default", "name": name,
  })
  # footprint collider
  cols.append({
    "id": fg,
    "rect": [xs[0] - 0.3, fy - 0.3, xs[-1] + 3.3, fy + b["depth"]],
  })



def add_outdoor_courtyard(objs, cols):
  """Continuous outdoor 云栖里 courtyard on the street chunk (no interior void).
  Pocket west of yq_club (x≈147–153), north of gate — walk in from sidewalk."""
  # --- gate (open, walkable) ---
  objs.append({"id": "es_gate_p_l", "type": "w_pillar", "x": 150.4, "y": 1.7})
  objs.append({"id": "es_gate_p_r", "type": "w_pillar", "x": 153.2, "y": 1.7})
  objs.append({"id": "es_gate_l", "type": "w_gate_l", "x": 150.7, "y": 1.85, "state": "open", "fade_group": "es_gate"})
  objs.append({"id": "es_gate_r", "type": "w_gate_r", "x": 152.9, "y": 1.85, "state": "open", "fade_group": "es_gate"})
  objs.append({
    "id": "es_yunqi_gate", "type": "p_notice", "x": 151.8, "y": 1.55, "z": 0,
    "interact": "notice", "name": "云栖里",
    "note": "云栖里 · 门禁小区（连续庭院 · 请进）",
    "reach": [151.8, 2.4], "estate": True,
  })
  # perimeter fence / walls along west of pocket
  for i, y in enumerate([3.5, 5.5, 7.5, 9.5, 11.5, 13.5]):
    objs.append({"id": f"es_cy_fence_w{i}", "type": "w_fence", "x": 147.6, "y": y})
  for i, x in enumerate([148.5, 150.5]):
    objs.append({"id": f"es_cy_fence_s{i}", "type": "w_fence", "x": x, "y": 1.9})
  # east soft edge toward club (planters, not full block)
  for i, y in enumerate([6.0, 9.0, 12.0]):
    objs.append({"id": f"es_cy_plant_e{i}", "type": "p_planter", "x": 154.2, "y": y})

  # landscaping (sparse — keep sightline to lobby facade)
  for i, (x, y) in enumerate([(148.6, 5.5), (148.6, 12.0)]):
    objs.append({"id": f"es_cy_tree{i}", "type": "p_tree", "x": x, "y": y})
  for i, (x, y) in enumerate([(150.2, 6.5), (150.2, 11.0), (152.5, 8.5)]):
    objs.append({"id": f"es_cy_hedge{i}", "type": "p_hedge", "x": x, "y": y})
  for i, (x, y) in enumerate([(149.5, 3.5), (152.5, 3.5), (149.5, 14.0), (152.5, 14.0)]):
    objs.append({"id": f"es_cy_lamp{i}", "type": "p_lamp", "x": x, "y": y, "state": "ok"})
  objs.append({"id": "es_cy_guard", "type": "p_locker", "x": 149.0, "y": 2.8,
               "interact": "notice", "note": "门岗 · 访客登记（演示）", "reach": [149.0, 3.5]})
  objs.append({"id": "es_cy_bins", "type": "p_bins", "x": 153.5, "y": 14.5})

  # small sports pad (NE of courtyard pocket, still outdoor)
  objs.append({"id": "es_sport_sign", "type": "p_notice", "x": 155.5, "y": 12.2,
               "interact": "notice", "note": "运动垫 / 羽毛球简易场 · 07:00–21:00", "reach": [155.5, 12.9]})
  objs.append({"id": "es_sport_locker", "type": "p_locker", "x": 157.5, "y": 11.5,
               "interact": "notice", "note": "外场器材柜", "reach": [156.9, 11.5]})
  objs.append({"id": "es_sport_bike1", "type": "p_bike", "x": 157.2, "y": 13.5, "state": "parked"})
  objs.append({"id": "es_sport_bike2", "type": "p_bike", "x": 157.8, "y": 14.0, "state": "parked"})
  objs.append({"id": "es_sport_pot", "type": "p_pot", "x": 155.2, "y": 14.5})
  objs.append({"id": "es_sport_lamp", "type": "p_lamp", "x": 156.5, "y": 10.8, "state": "ok"})

  # --- lobby pavilion facade (S-facing) at y=15.5 — doors enter interiors ---
  fy, fg = 15.5, "es_lobby_facade"
  for i, x in enumerate([148.5, 151.5, 154.5]):
    objs.append({"id": f"{fg}_w{i}", "type": "f_wall", "x": x, "y": fy, "z": 0,
                 "state": "ground", "variant": "p1", "fade_group": fg})
    objs.append({"id": f"{fg}_w{i}u", "type": "f_wall", "x": x, "y": fy, "z": 3,
                 "state": "upper", "variant": "p1", "fade_group": fg})
  # glass shopfront bays
  objs.append({"id": f"{fg}_glass_l", "type": "f_shop", "x": 148.5, "y": fy, "z": 0,
               "state": "window", "fade_group": fg})
  objs.append({"id": f"{fg}_glass_r", "type": "f_shop", "x": 154.5, "y": fy, "z": 0,
               "state": "window", "fade_group": fg})
  objs.append({
    "id": "es_lobby_door", "type": "f_door", "x": 151.5, "y": fy, "z": 0,
    "state": "closed", "fade_group": fg, "interact": "estate_lobby",
    "name": "现代大堂", "plate": "云栖里大堂", "estate": True,
    "to": "estate_lobby", "note": "进大堂 · 玻璃门",
  })
  objs.append({
    "id": "es_club_door", "type": "f_door", "x": 154.5, "y": fy, "z": 0,
    "state": "closed", "fade_group": fg, "interact": "estate_club",
    "name": "云栖会所", "plate": "会所", "estate": True,
    "to": "estate_club", "note": "进会所",
  })
  objs.append({"id": f"{fg}_sign", "type": "f_shopsign", "x": 151.5, "y": fy - 0.05, "z": 2.6,
               "state": "default", "name": "云栖里大堂", "fade_group": fg})
  objs.append({"id": f"{fg}_roof", "type": "b_roof_deck", "x": 148.5, "y": fy, "z": 6.0, "fade_group": fg})
  objs.append({"id": "es_lobby_steps", "type": "f_steps", "x": 151.5, "y": 15.1})
  cols.append({"id": fg, "rect": [148.0, 15.2, 157.5, 18.5]})
  # soft path collider none — walkable


def build_street_chunk():
  objs, cols = [], []
  # seam curb + trees between Midtown-A (~146) and estate outer block
  for x in range(148, 210, 2):
    objs.append({"id": f"es_curb_n{x}", "type": "p_curb", "x": float(x), "y": 0.1})
    objs.append({"id": f"es_curb_s{x}", "type": "p_curb", "x": float(x), "y": -6.1})
    objs.append({"id": f"es_edge_n{x}", "type": "d_edge_line", "x": float(x), "y": -0.35})
    objs.append({"id": f"es_edge_s{x}", "type": "d_edge_line", "x": float(x), "y": -5.65})
    if x % 6 == 0:
      objs.append({"id": f"es_dash{x}", "type": "d_center_dash", "x": float(x), "y": -3.0})
  for x in (152, 164, 176, 188, 200):
    objs.append({"id": f"es_tree_{x}", "type": "p_tree", "x": x, "y": 1.2})
  objs.append({
    "id": "es_seam_sign", "type": "f_sign", "x": 149.2, "y": 1.35, "z": 0,
    "state": "default", "name": "云栖里 →",
  })
  add_outdoor_courtyard(objs, cols)

  meta = []
  for b in BUILDINGS:
    add_facade(objs, cols, b)
    meta.append({
      "key": b["key"], "name": b["name"], "floors": b["floors"],
      "wall": b["wall"], "roof": b["roof"], "balcony": b["balcony"],
      "door_x": b["door_x"], "blurb": b["blurb"],
    })

  chunk = {
    "id": "estate",
    "name": "云栖里外立面组",
    "rect": [146.0, -40.0, 210.0, 64.0],
    "objects": objs,
    "colliders": cols,
    "variety": {"rules": VARIETY_RULES, "buildings": meta},
  }
  return chunk


def common(spec):
  return {
    "format": "fushi-scene", "version": 2,
    "id": spec["id"], "name": spec["name"],
    "interior": True, "units": "m", "grid_m": 0.5,
    "objects": [], "colliders": [], "portals": [], "laundry": [],
    "puddles": [], "leaf_piles": [], "wires": [], "npcs": [],
    "events": {}, "interactions": STREET["interactions"],
    "calendar": STREET.get("calendar"), "weather": STREET.get("weather"),
    "repair_hours_scale": STREET.get("repair_hours_scale", 1),
    "estate": True,
  }


def build_one(name):
  path = os.path.join(HERE, "layouts", name)
  spec = json.load(open(path, encoding="utf-8"))
  portals = spec.pop("portals", None)
  S = common(spec)
  S.update(RL.build(spec))
  if portals:
    S.setdefault("portals", []).extend(portals)
  for P in S.get("portals", []):
    if P.get("to") == "street" and not P.get("spawn"):
      P["spawn"] = STREET_SPAWN
  if spec["id"] == "estate_compound":
    for o in S["objects"]:
      if o["type"] in ("i_wall", "i_window", "i_door") and abs(o.get("y", -1) - 16.0) < 0.05:
        o["fade_group"] = "lobby_facade"
      if o.get("id") in ("gate_l", "gate_r"):
        o["fade_group"] = "gate"
  B = spec["bounds"]
  S["bounds"] = B
  probs, n = RL.validate(S)
  S["layout_check"] = {"problems": probs, "checks": n}
  area = (B[2] - B[0]) * (B[3] - B[1])
  S["bounds"] = {"x0": B[0], "y0": B[1], "x1": B[2], "y1": B[3]}
  S["_estate_meta"] = {
    "walkable_m2": round(area, 1), "source": name,
    "fade": "partitions + tagged fade_group reuse world.js occluder fade (read-only)",
  }
  return S, probs, n, area


def main():
  out = {}
  bad = []
  for name in LAYOUTS:
    S, probs, n, area = build_one(name)
    out[S["id"]] = S
    print(f"{S['id']}: area≈{area:.1f}㎡  checks={n}  problems={len(probs)}")
    for p in probs:
      print("  !", p); bad.append(f"{S['id']}: {p}")

  chunk = build_street_chunk()
  out["_street"] = {
    "chunk_id": "estate",
    "rect": chunk["rect"],
    "variety": chunk["variety"],
    "object_count": len(chunk["objects"]),
  }
  # write chunk file
  chunk_path = os.path.join(ROOT, "chunks", "estate.js")
  payload = {k: chunk[k] for k in ("id", "rect", "objects", "colliders")}
  open(chunk_path, "w", encoding="utf-8").write(
    "/* generated by tools/build_estate.py — Midtown-B outer facades */\n"
    "(window.SCENE_CHUNKS=window.SCENE_CHUNKS||{}).estate="
    + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n"
  )
  print(f"chunks/estate.js: {len(chunk['objects'])} objs, {len(BUILDINGS)} facade looks")

  path_js = os.path.join(ROOT, "estate45.js")
  path_json = os.path.join(ROOT, "estate45.json")
  open(path_json, "w", encoding="utf-8").write(json.dumps(out, ensure_ascii=False, indent=1))
  open(path_js, "w", encoding="utf-8").write(
    "/* generated by tools/build_estate.py — Midtown-B */\n"
    "window.ESTATE45=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n"
  )
  # variety card art note file
  rules_path = os.path.join(ROOT, "img", "estate", "VARIETY_RULES.json")
  open(rules_path, "w", encoding="utf-8").write(
    json.dumps({"rules": VARIETY_RULES, "buildings": chunk["variety"]["buildings"]},
               ensure_ascii=False, indent=2)
  )
  print("wrote", path_js, path_json, chunk_path, rules_path)
  if bad and os.environ.get("LAYOUT_LENIENT") != "1":
    print("FAIL", len(bad)); sys.exit(1)
  print("OK", len(out) - 1, "scenes + street chunk")


if __name__ == "__main__":
  main()
