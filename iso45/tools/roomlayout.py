"""Reusable room-layout system for scene-proto-45 interiors (Stage 3).

A unit (单间 / 一室一厅 / shared flat ...) is described as DATA (tools/layouts/*.json):
  bounds      walkable interior rect [x0, y0, x1, y1] (the exterior walls' inner faces)
  ground      floor chunks (2 m), legend + rows south->north ("." = no floor)
  walls       straight wall runs. side N / E = full-height exterior (behind, never cut), S / W = cut-away stubs
              (camera side), P = full-height PARTITION (interior wall, fades when it hides 李默 like any wall).
              axis "x" runs along x at y = line (rot 0), axis "y" runs along y at x = line (rot 6).
              openings: window (1.5 m), door (1.2 m, a real i_door: open / closed state, collision when closed,
              swing zone kept clear), gap (no wall). Wall bays fill the rest (1 m modules, last one end-aligned).
  furniture   kit pieces at x, y (+ rot / state / interact / id); footprints come from the kit manifest
  colliders / laundry / portals / spawn / extra objects pass through
build(spec)    -> scene dict (objects + colliders) in the engine's interior format
validate(scene)-> problems: furniture overlapping furniture / walls / door swings, interactables or doors or portals
                  not reachable on foot from the spawn (grid flood fill, 李默's radius 0.22 m), short wall segments."""
import json, math, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
KITS = [json.load(open(os.path.join(ROOT, d, "kit_manifest.json"))) for d in ("kit_int", "kit")]
def piece(t):
    for K in KITS:
        if t in K["pieces"]: return K["pieces"][t]
    raise KeyError(t)
R_PLAYER, DOOR_W, WIN_W = 0.22, 1.2, 1.5

def rot_pt(x, y, rot):
    a = (rot or 0) * math.pi / 4; c, s = round(math.cos(a), 9), round(math.sin(a), 9)
    return x * c - y * s, x * s + y * c
def foot_rects(o, state=None):
    """axis-aligned world rects of an object's footprint (rots are multiples of 90° here)"""
    P = piece(o["type"]); st = state or o.get("state")
    rects = (P.get("footprint_states") or {}).get(st) or P.get("footprint") or []
    out = []
    for r in rects:
        pts = [rot_pt(x, y, o.get("rot", 0)) for x, y in ((r[0], r[1]), (r[2], r[3]))]
        out.append([o["x"] + min(p[0] for p in pts), o["y"] + min(p[1] for p in pts), o["x"] + max(p[0] for p in pts), o["y"] + max(p[1] for p in pts)])
    return out
def overlap(a, b, eps=0.005): return a[0] < b[2] - eps and b[0] < a[2] - eps and a[1] < b[3] - eps and b[1] < a[3] - eps
def circle_rect(x, y, r, b): dx = max(b[0] - x, 0, x - b[2]); dy = max(b[1] - y, 0, y - b[3]); return dx * dx + dy * dy < r * r

def _bays(a, b, w=1.0):
    """module origins filling [a, b] with w-wide bays, last one end-aligned (overlapping its neighbour)"""
    if b - a < 1e-6: return []
    xs, x = [], a
    while x + w < b - 1e-6: xs.append(round(x, 3)); x += w
    xs.append(round(max(a, b - w), 3)); return xs

def build(spec):
    S = {k: v for k, v in spec.items() if k not in ("walls", "furniture")}
    S.setdefault("objects", []); S.setdefault("colliders", []); S["swing"] = []; S["_short"] = []
    objs, cols = S["objects"], S["colliders"]
    def add(t, x, y, **kw):
        o = {"id": kw.pop("id", f"{t}_{len(objs):03d}"), "type": t, "x": round(x, 3), "y": round(y, 3), "z": kw.pop("z", 0)}; o.update(kw); objs.append(o); return o
    for wi, W in enumerate(spec.get("walls", [])):
        side, ax, line, a, b = W["side"], W.get("axis", "x" if W["side"] in "NS" else "y"), W["line"], W["from"], W["to"]
        full = side in "NEP"; piece_t = "i_wall" if full else "i_cut"; fin = W.get("finish", "plain")
        rot = 0 if ax == "x" else 6
        ops = sorted(W.get("openings", []), key=lambda o: o["at"])
        cur, segs = a, []
        for op in ops:
            w = op.get("w", WIN_W if op["kind"] == "window" else DOOR_W if op["kind"] == "door" else 1.0)
            segs.append((cur, op["at"])); cur = op["at"] + w
            fields = {k: v for k, v in op.items() if k not in ("kind", "at", "w")}
            if op["kind"] in ("window", "door"):
                t = "i_window" if op["kind"] == "window" else "i_door"
                if t == "i_door": fields.setdefault("state", "closed")
                else: fields.setdefault("state", fin if fin in ("plain", "dado", "tile") else "plain")
                o = add(t, op["at"], line, rot=0, **fields) if ax == "x" else add(t, line, op["at"] + w, rot=6, **fields)
                if t == "i_door":
                    bay = [op["at"], line, op["at"] + w, line + 0.15] if ax == "x" else [line, op["at"], line + 0.15, op["at"] + w]
                    if op.get("block", side == "P"): o["block"] = bay                 # collision while closed
                    sw = [op["at"], line - 0.86, op["at"] + w, line] if ax == "x" else [line - 0.86, op["at"], line, op["at"] + w]
                    back = [op["at"] + w / 2, line + 0.5] if ax == "x" else [line + 0.5, op["at"] + w / 2]
                    S["swing"].append({"door": o["id"], "rect": [round(v, 3) for v in sw], "back": back if side == "P" else None})
                    o.setdefault("reach", [round(op["at"] + w / 2, 3), round(line - 0.45, 3)] if ax == "x" else [round(line - 0.45, 3), round(op["at"] + w / 2, 3)])
        segs.append((cur, b))
        for s0, s1 in segs:
            if s1 - s0 < 1e-6: continue
            if s1 - s0 < 0.25: pass                               # sliver: collider only, no bay
            elif s1 - s0 < 0.999: S["_short"].append(f"wall {wi} ({side}) segment {s0:.2f}-{s1:.2f} shorter than a 1 m bay (overhangs a neighbour)")
            for p in (_bays(s0, s1) if s1 - s0 >= 0.25 else []):
                if ax == "x": add(piece_t, p, line, rot=0, state=fin)
                else: add(piece_t, line, p + 1.0, rot=6, state=fin)
            # collider of the wall body (exterior ones extend outwards)
            th0, th1 = W.get("th") or ((0.0, 0.6) if side in "NE" else (-0.6, 0.15) if side in "SW" else (0.0, 0.15))
            r = [s0, line + th0, s1, line + th1] if ax == "x" else [line + th0, s0, line + th1, s1]
            cols.append({"id": f"wall{wi}_{len(cols)}", "rect": [round(v, 3) for v in r]})
    for f in spec.get("furniture", []):
        f = dict(f); t = f.pop("type"); add(t, f.pop("x"), f.pop("y"), **f)
    return S

def validate(S, extra_reach=1.0, cell=0.05):
    probs = list(S.get("_short", []))
    B = S["bounds"]; objs = S["objects"]
    STRUCT = ("i_wall", "i_cut", "i_window", "i_door", "i_balfront", "i_side")
    furn = [(o, r) for o in objs if piece(o["type"]).get("layer") == "sorted" and not o["type"].startswith(STRUCT) for r in foot_rects(o)]
    walls = [c["rect"] for c in S["colliders"]]
    for i in range(len(furn)):                                   # zero clipping: furniture vs furniture / walls / swings
        for j in range(i + 1, len(furn)):
            if furn[i][0] is not furn[j][0] and overlap(furn[i][1], furn[j][1]): probs.append(f"overlap {furn[i][0]['id']} x {furn[j][0]['id']}")
        for w in walls:
            if overlap(furn[i][1], w): probs.append(f"{furn[i][0]['id']} intersects wall/collider {w}")
        for sw in S.get("swing", []):
            if furn[i][0]["id"] != sw["door"] and overlap(furn[i][1], sw["rect"]): probs.append(f"{furn[i][0]['id']} blocks the swing of {sw['door']}")
        r = furn[i][1]
        if r[0] < B[0] - 0.01 or r[1] < B[1] - 0.01 or r[2] > B[2] + 0.01 or r[3] > B[3] + 0.01: probs.append(f"{furn[i][0]['id']} outside the room bounds")
    # walkability: flood fill over a grid (doors count as open: 李默 opens them)
    obst = [r for _, r in furn] + walls
    nx, ny = int((B[2] - B[0]) / cell) + 1, int((B[3] - B[1]) / cell) + 1
    free = [[False] * ny for _ in range(nx)]
    for i in range(nx):
        for j in range(ny):
            x, y = B[0] + i * cell, B[1] + j * cell
            if x - R_PLAYER < B[0] or x + R_PLAYER > B[2] or y - R_PLAYER < B[1] or y + R_PLAYER > B[3]: continue
            free[i][j] = not any(circle_rect(x, y, R_PLAYER, r) for r in obst)
    sx, sy = S["spawn"][0], S["spawn"][1]
    si, sj = round((sx - B[0]) / cell), round((sy - B[1]) / cell)
    if not (0 <= si < nx and 0 <= sj < ny and free[si][sj]): probs.append(f"spawn {S['spawn']} is not free"); return probs, 0
    seen = {(si, sj)}; st = [(si, sj)]
    while st:
        i, j = st.pop()
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            k = (i + di, j + dj)
            if 0 <= k[0] < nx and 0 <= k[1] < ny and k not in seen and free[k[0]][k[1]]: seen.add(k); st.append(k)
    pts = [(B[0] + i * cell, B[1] + j * cell) for i, j in seen]
    def reach(x, y, d): return any((px - x) ** 2 + (py - y) ** 2 <= d * d for px, py in pts)
    n = 0
    for o in objs:
        if not o.get("interact"): continue
        n += 1; p = o.get("reach") or [o["x"], o["y"]]
        ps = p if isinstance(p[0], list) else [p]                 # several approach spots: every one must be reachable
        for q in ps:
            if not reach(q[0], q[1], 0.35 if len(ps) > 1 or o.get("reach") else extra_reach): probs.append(f"interactable {o['id']} ({o['interact']}) approach {q} not reachable on foot")
    for P in S.get("portals", []):
        r = P["rect"]; n += 1
        if not any(r[0] <= px <= r[2] and r[1] <= py <= r[3] for px, py in pts): probs.append(f"portal {P['id']} not reachable")
    for sw in S.get("swing", []):                                # both sides of every door
        n += 1; r = sw["rect"]; cx, cy = (r[0] + r[2]) / 2, (r[1] + r[3]) / 2
        if not reach(cx, cy, 0.6): probs.append(f"door {sw['door']} not reachable")
        if sw.get("back") and not reach(sw["back"][0], sw["back"][1], 0.6): probs.append(f"door {sw['door']}: far side not reachable")
    return probs, n
