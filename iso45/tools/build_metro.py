"""地铁 metro areas: tools/layouts/metro_*.json -> metro45.json + metro45.js (window.METRO45 = {areas, rules, kit}).
Layout data is expanded here (wall runs -> mt_wall / mt_cut bays, fence / stanchion runs, fare-gate banks, platform screen door
rows) with the kit_metro footprints, then VALIDATED (build fails on problems unless LAYOUT_LENIENT=1):
  * furniture footprints must not overlap each other (zero clipping)
  * every interactable approach point, portal and gate aisle must be reachable on foot from the spawn (0.1 m grid flood fill,
    player radius 0.22 m; gate flaps count as open — the player pays to open them)
  * every NPC route segment keeps >= 0.24 m clearance from colliders, footprints and staff (symbolic legs gate_in / gate_out /
    exit_join / exit_any are expanded for every aisle / exit)
Also copies the rules.metro section in as a fallback for pages that do not load shared-rules."""
import json, math, os, glob
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
KIT = json.load(open(os.path.join(ROOT, "kit_metro", "kit_manifest.json")))
R_PLAYER, R_NPC = 0.22, 0.24
def piece(t): return KIT["pieces"][t]
def rot_pt(x, y, rot):
    a = (rot or 0) * math.pi / 4; c, s = round(math.cos(a), 9), round(math.sin(a), 9)
    return x * c - y * s, x * s + y * c
def foot_rects(o):
    P = piece(o["type"]); out = []
    for r in P.get("footprint") or []:
        pts = [rot_pt(x, y, o.get("rot", 0)) for x, y in ((r[0], r[1]), (r[2], r[3]))]
        out.append([round(o["x"] + min(p[0] for p in pts), 3), round(o["y"] + min(p[1] for p in pts), 3), round(o["x"] + max(p[0] for p in pts), 3), round(o["y"] + max(p[1] for p in pts), 3)])
    return out
def overlap(a, b, eps=0.005): return a[0] < b[2] - eps and b[0] < a[2] - eps and a[1] < b[3] - eps and b[1] < a[3] - eps
def rect_dist(x, y, b): dx = max(b[0] - x, 0, x - b[2]); dy = max(b[1] - y, 0, y - b[3]); return math.hypot(dx, dy)
def bays(a, b, w=1.0):
    xs, x = [], a
    while x + w < b - 1e-6: xs.append(round(x, 3)); x += w
    xs.append(round(max(a, b - w), 3)); return xs

def build(spec):
    A = {k: v for k, v in spec.items() if k not in ("walls", "objects")}
    objs, cols, gates, psd = [], [{"id": f"c{i}", "rect": c["rect"]} for i, c in enumerate(spec.get("colliders", []))], [], []
    def add(t, x, y, **kw):
        o = {"id": kw.pop("id", None) or f"{t}_{len(objs):03d}", "type": t, "x": round(x, 3), "y": round(y, 3)}; o.update(kw); objs.append(o); return o
    for wi, W in enumerate(spec.get("walls", [])):
        side, line, a, b = W["side"], W["line"], W["from"], W["to"]; full = side in "NE"; t = "mt_wall" if full else "mt_cut"
        st = W.get("state", "old") if full else ("old" if W.get("state", "old").startswith("old") else "cbd")
        for p in bays(a, b):
            s = (W.get("bays") or {}).get(str(int(round(p))), st) if full else st
            if side in "NS": add(t, p, line, rot=0, state=s, wall=side)
            else: add(t, line, p + 1.0, rot=6, state=s, wall=side)
        r = {"N": [a, line, b, line + 0.6], "E": [line, a, line + 0.6, b], "S": [a, line - 0.6, b, line + 0.2], "W": [line - 0.6, a, line + 0.2, b]}[side]
        cols.append({"id": f"wall{wi}", "rect": r})
    for O in spec.get("objects", []):
        if "run" in O:
            step = O.get("step", 1)
            for p in bays(O["from"], O["to"], step):
                if O["axis"] == "x": add(O["run"], p, O["line"], rot=0, state=O.get("state", "default"))
                else: add(O["run"], O["line"], p + step, rot=6, state=O.get("state", "default"))
        elif "gates" in O:
            g = O["gates"]
            for i in range(g["n"]):
                m = g["x0"] + i * 0.9
                add("mt_gate", m, g["y"], rot=0, state=g["skin"] + "_closed", id=f"{g['id']}{i}", gate=i)
                gates.append({"i": i, "obj": f"{g['id']}{i}", "x0": round(m + 0.26, 3), "x1": round(m + 0.9, 3), "y": g["y"], "flap": [round(m + 0.26, 3), g["y"] - 0.06, round(m + 0.9, 3), g["y"] + 0.06]})
            add("mt_gate_end", g["x0"] + g["n"] * 0.9, g["y"], rot=0, state=g["skin"], id=f"{g['id']}_end")
        elif "psd" in O:
            P = O["psd"]; x = P["x0"]; k = 0
            while x < P["x1"] - 1e-6:
                door = any(abs(x - d) < 1e-6 for d in P["doors"]); ox = x + (2 if P["rot"] == 4 else 0)
                if door:
                    o = add("mt_psd", ox, P["y"], rot=P["rot"], state=P["skin"] + "_closed", id=f"psd{P['track']}_{k}", psd=P["track"])
                    psd.append({"track": P["track"], "obj": o["id"], "x0": x, "x1": x + 2, "y": P["y"]})
                else: add("mt_psd_fix", ox, P["y"], rot=P["rot"], state=P["skin"], id=f"psdf{P['track']}_{k}")
                x += 2; k += 1
        else:
            o = dict(O); t = o.pop("type"); x = o.pop("x"); y = o.pop("y"); add(t, x, y, **o)
    for o in objs:
        if o.get("nocol") or piece(o["type"]).get("layer") != "sorted": continue
        if o["type"].startswith("mt_wall") or o["type"] == "mt_cut": continue          # covered by the wall run collider
        for r in foot_rects(o): cols.append({"id": o["id"], "rect": r})
    A["objects"] = objs; A["colliders"] = cols; A["gates"] = gates; A["psd"] = psd
    return A

def expand_routes(A):
    """concrete point lists for validation (symbolic legs expanded for every aisle / exit)"""
    out = []; G = A.get("gates", []); ap = A.get("gate_approach", 1.2)
    for name, R in (A.get("routes") or {}).items():
        variants = [[]]
        for leg in R:
            if leg == "gate_in" or leg == "gate_out":
                nv = []
                for v in variants:
                    for g in G:
                        cx = (g["x0"] + g["x1"]) / 2; a, b = [cx, g["y"] - ap], [cx, g["y"] + ap]
                        nv.append(v + ([a, b] if leg == "gate_in" else [b, a]))
                variants = nv
            elif leg in ("exit_join", "exit_any"):
                src = A.get("exit_joins" if leg == "exit_join" else "exit_routes", {})
                variants = [v + [list(p) for p in pts] for v in variants for pts in src.values()]
            elif leg == "exit_spawn": pass
            else: variants = [v + [leg] for v in variants]
        for v in variants: out.append((name, v))
    return out

def validate(A):
    probs = []; B = A["bounds"]; objs = A["objects"]; cols = [c["rect"] for c in A["colliders"]]
    furn = [(o, r) for o in objs if piece(o["type"]).get("layer") == "sorted" and not o["type"] in ("mt_wall", "mt_cut", "mt_adwall") for r in foot_rects(o)]
    for i in range(len(furn)):
        for j in range(i + 1, len(furn)):
            THIN = ("mt_fence", "mt_rail")
            if furn[i][0]["type"] in THIN and furn[j][0]["type"] in THIN: continue      # run bays overlap at ends / corners by design
            if furn[i][0] is not furn[j][0] and overlap(furn[i][1], furn[j][1]): probs.append(f"overlap {furn[i][0]['id']} x {furn[j][0]['id']}")
    staff = [s["at"] for s in A.get("staff", [])]
    cell = 0.1; nx, ny = int((B[2] - B[0]) / cell) + 1, int((B[3] - B[1]) / cell) + 1
    def free(x, y, r=R_PLAYER):
        if x - r < B[0] - 1e-6 or x + r > B[2] + 1e-6 or y - r < B[1] - 1e-6 or y + r > B[3] + 1e-6: return False
        return all(rect_dist(x, y, c) >= r for c in cols) and all(math.hypot(x - s[0], y - s[1]) >= r + 0.22 for s in staff)
    F = [[free(B[0] + i * cell, B[1] + j * cell) for j in range(ny)] for i in range(nx)]
    sx, sy = A["spawn"][0], A["spawn"][1]; si, sj = round((sx - B[0]) / cell), round((sy - B[1]) / cell)
    if not F[si][sj]: probs.append(f"spawn {A['spawn']} not free"); return probs, 0
    seen = {(si, sj)}; st = [(si, sj)]
    while st:
        i, j = st.pop()
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            k = (i + di, j + dj)
            if 0 <= k[0] < nx and 0 <= k[1] < ny and k not in seen and F[k[0]][k[1]]: seen.add(k); st.append(k)
    pts = [(B[0] + i * cell, B[1] + j * cell) for i, j in seen]
    def reach(x, y, d=0.35): return any((px - x) ** 2 + (py - y) ** 2 <= d * d for px, py in pts)
    n = 0
    for o in objs:
        if o.get("interact"):
            n += 1; q = o.get("reach") or [o["x"], o["y"]]
            if not reach(q[0], q[1]): probs.append(f"interactable {o['id']} approach {q} not reachable")
    for P in A.get("portals", []):
        n += 1; r = P["rect"]
        if not any(r[0] <= px <= r[2] and r[1] <= py <= r[3] for px, py in pts): probs.append(f"portal {P['id']} not reachable")
        sp = P.get("spawn")
        if isinstance(sp, list) and P["to"] in AREAS_SEEN and not AREAS_SEEN[P["to"]](sp[0], sp[1]): probs.append(f"portal {P['id']} spawn {sp} in {P['to']} not free ({AREAS_WHY[P['to']](sp[0], sp[1])})")
    for g in A.get("gates", []):
        n += 1; cx = (g["x0"] + g["x1"]) / 2
        if not (reach(cx, g["y"] - 1.1, 0.3) and reach(cx, g["y"] + 1.1, 0.3)): probs.append(f"gate aisle {g['i']} not reachable on both sides")
        if not free(cx, g["y"]): probs.append(f"gate aisle {g['i']} too narrow")
    for w in A.get("waits", []):
        n += 1
        if not free(w[0], w[1], R_NPC): probs.append(f"wait spot {w} not free")
    minc = 9
    for name, R in expand_routes(A):
        for (a, b) in zip(R, R[1:]):
            L = math.hypot(b[0] - a[0], b[1] - a[1]); k = max(1, int(L / 0.1))
            for i in range(k + 1):
                x, y = a[0] + (b[0] - a[0]) * i / k, a[1] + (b[1] - a[1]) * i / k
                c = min([rect_dist(x, y, cc) for cc in cols] + [math.hypot(x - s[0], y - s[1]) - 0.22 for s in staff] + [9])
                minc = min(minc, c)
                if c < R_NPC: probs.append(f"route {name} segment {a[:2]}->{b[:2]} clearance {c:.2f} at ({x:.2f},{y:.2f})"); break
        n += 1
    return probs, n, minc

AREAS_SEEN = {}; AREAS_WHY = {}
if __name__ == "__main__":
    specs = [json.load(open(p)) for p in sorted(glob.glob(os.path.join(HERE, "layouts", "metro_*.json")))]
    areas = {}
    for s in specs:
        A = build(s); areas[A["id"]] = A
    # spawn checks across areas need each area's free() — quick version: bounds + colliders
    for A in areas.values():
        B = A["bounds"]; cols = [c["rect"] for c in A["colliders"]]
        AREAS_SEEN[A["id"]] = (lambda B, cols: lambda x, y: B[0] + R_PLAYER <= x <= B[2] - R_PLAYER and B[1] + R_PLAYER <= y <= B[3] - R_PLAYER and all(rect_dist(x, y, c) >= R_PLAYER for c in cols))(B, cols)
        AREAS_WHY[A["id"]] = (lambda B, cols: lambda x, y: [c for c in cols if rect_dist(x, y, c) < R_PLAYER] or B)(B, cols)
    bad = 0
    for A in areas.values():
        probs, n, minc = validate(A)
        A["layout_check"] = {"checked": n, "problems": probs, "min_route_clearance": round(minc, 3)}
        print(f"area {A['id']}: {len(A['objects'])} objects, {len(A['colliders'])} colliders, {n} checks, min route clearance {minc:.2f} m, problems {len(probs)}")
        for p in probs[:30]: print("  !", p)
        bad += len(probs)
    if bad and not os.environ.get("LAYOUT_LENIENT"): raise SystemExit("metro layout validation failed")
    rules = json.load(open(os.path.join(ROOT, "shared-rules", "rules.json"))).get("metro")
    out = {"areas": areas, "rules": rules}
    json.dump(out, open(os.path.join(ROOT, "metro45.json"), "w"), ensure_ascii=False, indent=1)
    open(os.path.join(ROOT, "metro45.js"), "w").write("/* generated by tools/build_metro.py from tools/layouts/metro_*.json */\nwindow.METRO45=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print("wrote metro45.json / metro45.js")
