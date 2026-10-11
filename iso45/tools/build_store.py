"""24便利店 interior: tools/layouts/store_24.json -> store45.json + store45.js (window.STORE45 = {store_24: scene}).
Same room-layout system as 2F-02 (tools/roomlayout.py: walls / door / furniture slots / zero-clipping + reachability flood
fill); the store pieces come from kit_store/ (st_*), appended to the layout system's kit list here (roomlayout.py untouched).
Extra checks: every multi-spot reach (counter: customer side + staff lane), the staff spot, and every store-NPC route
segment sampled every 5 cm against all footprints / walls (clearance >= foot radius 0.24 + 0.03 m).
Run: python3 tools/build_store.py   (fails with exit 1 on any problem; LAYOUT_LENIENT=1 to only warn)"""
import json, os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import roomlayout as RL
KS = json.load(open(os.path.join(ROOT, "kit_store", "kit_manifest.json")))
if not any("st_counter" in K["pieces"] for K in RL.KITS): RL.KITS.insert(0, KS)
STREET = json.load(open(os.path.join(ROOT, "scene.json")))
STREET_DOOR = [37.0, 3.55, "S"]          # outside the 24便利店 door bay (scene.json shop24_S1F_1_shop, x 35.5-38.5, y 4.5)
NPC_R, NPC_CLEAR = 0.24, 0.03

def build():
    spec = json.load(open(os.path.join(HERE, "layouts", "store_24.json"), encoding="utf-8"))
    S = {"format": "fushi-scene", "version": 2, "id": spec["id"], "name": spec["name"], "interior": True, "units": "m", "grid_m": 0.5,
         "objects": [], "colliders": [], "portals": [], "laundry": [], "puddles": [], "leaf_piles": [], "wires": [], "npcs": [],
         "events": {}, "interactions": STREET["interactions"], "calendar": STREET.get("calendar"), "weather": STREET.get("weather"),
         "repair_hours_scale": STREET.get("repair_hours_scale", 1), "store": True}
    store_npcs = spec.pop("npcs"); staff_spot = spec.pop("staff_spot"); front = spec.pop("storefront", None)
    S.update(RL.build(spec)); S["npcs"] = []
    if front:   # glass storefront instead of the S cut stubs (colliders unchanged); no footprint -> not furniture for the checks
        L = front["line"]
        S["objects"] = [o for o in S["objects"] if not (o["type"] == "i_cut" and o.get("rot", 0) == 0 and abs(o["y"] - L) < 1e-6)]
        for i, (x, t) in enumerate(front["bays"] + [front["door"]]):
            o = {"id": f"front_{i}" if t != front["door"][1] else "front_door", "type": t, "x": x, "y": L, "z": 0, "rot": 0, "state": "glass", "fade_group": "storefront"}
            S["objects"].append(o)
    for P in S["portals"]:
        if P["to"] == "street" and not P.get("spawn"): P["spawn"] = STREET_DOOR
    probs, n = RL.validate(S)
    # second approach spots (reach_staff) + the staff spot: flood-fill again from the spawn with each one as the reach point
    objs = S["objects"]
    for o in objs:
        if o.get("reach_staff"):
            keep = o["reach"]; o["reach"] = o["reach_staff"]; p2, _ = RL.validate(S); o["reach"] = keep
            probs += [p + " (staff side)" for p in p2 if o["id"] in p]; n += 1
            o["reach"] = [keep, o.pop("reach_staff")]
    # NPC routes: sample every 5 cm against furniture footprints + wall colliders + bounds
    STRUCT = ("i_wall", "i_cut", "i_window", "i_door")
    rects = [r for o in objs if RL.piece(o["type"]).get("layer") == "sorted" and not o["type"].startswith(STRUCT) for r in RL.foot_rects(o)]
    rects += [c["rect"] for c in S["colliders"]]
    rects += [o["block"] for o in objs if o.get("block")]
    B = spec["bounds"]; minc = 9.0
    def clearance(x, y):
        d = min(x - B[0], B[2] - x, y - B[1], B[3] - y)
        for r in rects: d = min(d, math.hypot(max(r[0] - x, 0, x - r[2]), max(r[1] - y, 0, y - r[3])))
        return d
    routes = [("staff " + s["id"], [s["home"][:2], s["via"], s["back"][:2], s["via"], s["home"][:2]]) for s in store_npcs["staff"]] + [(s["id"], s["route"]) for s in store_npcs["shoppers"]]
    routes.append(("staff_spot", [staff_spot[:2], staff_spot[:2]]))
    for name, R in routes:
        for (x0, y0), (x1, y1) in zip(R, R[1:]):
            L = math.hypot(x1 - x0, y1 - y0); k = max(1, int(L / 0.05))
            for i in range(k + 1):
                c = clearance(x0 + (x1 - x0) * i / k, y0 + (y1 - y0) * i / k); minc = min(minc, c)
                if c < NPC_R + NPC_CLEAR: probs.append(f"route {name} segment ({x0},{y0})->({x1},{y1}) clearance {c:.2f} m"); break
        n += 1
    B = spec["bounds"]; S["bounds"] = {"x0": B[0], "y0": B[1], "x1": B[2], "y1": B[3]}
    S["store_npcs"] = store_npcs; S["staff_spot"] = staff_spot; S["bg_view"] = True
    for k in ("swing", "_short"): S.pop(k, None)
    S["layout_check"] = {"checked": n, "problems": probs, "min_route_clearance": round(minc, 3)}
    return S, probs, n, minc

def build_back():
    """员工室 back room: plain room-layout build + validate (reachability of lockers / board, portal back to the store)"""
    spec = json.load(open(os.path.join(HERE, "layouts", "store_24_staff.json"), encoding="utf-8"))
    S = {"format": "fushi-scene", "version": 2, "id": spec["id"], "name": spec["name"], "interior": True, "units": "m", "grid_m": 0.5,
         "objects": [], "colliders": [], "portals": [], "laundry": [], "puddles": [], "leaf_piles": [], "wires": [], "npcs": [],
         "events": {}, "interactions": STREET["interactions"], "calendar": STREET.get("calendar"), "weather": STREET.get("weather"),
         "repair_hours_scale": STREET.get("repair_hours_scale", 1), "store": True}
    S.update(RL.build(spec)); probs, n = RL.validate(S)
    B = spec["bounds"]; S["bounds"] = {"x0": B[0], "y0": B[1], "x1": B[2], "y1": B[3]}; S["bg_view"] = True
    S["exit_spawn"] = spec["portals"][0]["spawn"]
    for k in ("swing", "_short"): S.pop(k, None)
    S["layout_check"] = {"checked": n, "problems": probs}
    return S, probs, n

if __name__ == "__main__":
    S, probs, n, minc = build()
    print(f"layout store_24: {len(S['objects'])} objects, {n} interactables/doors/portals/routes checked, min NPC route clearance {minc:.2f} m, problems: {len(probs)}")
    for p in probs: print("  !", p)
    if probs and not os.environ.get("LAYOUT_LENIENT"): raise SystemExit("store layout validation failed")
    SB, pb, nb = build_back()
    print(f"layout store_24_staff: {len(SB['objects'])} objects, {nb} checked, problems: {len(pb)}")
    for p in pb: print("  !", p)
    if pb and not os.environ.get("LAYOUT_LENIENT"): raise SystemExit("staff room layout validation failed")
    out = {"store_24": S, "store_24_staff": SB}
    json.dump(out, open(os.path.join(ROOT, "store45.json"), "w"), ensure_ascii=False, indent=1)
    open(os.path.join(ROOT, "store45.js"), "w").write("/* generated by tools/build_store.py */\nwindow.STORE45=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print("wrote store45.json / store45.js")
