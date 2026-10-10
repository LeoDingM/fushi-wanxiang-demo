"""Texture slots for AI-painted modules: one slot per kit frame (piece/variant/part/state/rot).
   python3 tools/export_slots.py [--templates DIR]
writes kit/texture_slots.json (size, anchor, override path, emissive?) and kit/TEXTURE_SLOTS.md (the per-module table
quoted in README); --templates DIR also dumps every current frame as a PNG template (same size, anchor marked in the
JSON) to paint over. To use a painted texture: save it at the slot's `override` path (exact w x h, transparent
background, anchor pixel = the piece origin) and list it in kit/overrides/index.js; no rebuild needed."""
import json, os, sys
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
K = json.load(open(os.path.join(ROOT, "kit", "kit_manifest.json")))
tpl = sys.argv[sys.argv.index("--templates") + 1] if "--templates" in sys.argv else None
slots = {}
for key, (x, y, w, h, ax, ay) in sorted(K["frames"].items()):
    if "#shadow" in key or key.startswith("fx/"): continue
    piece = key.split("/")[0]; P = K["pieces"][piece]
    if P.get("layer") in ("decal",): continue
    slots[key] = {"w": w, "h": h, "anchor": [ax, ay], "override": f"kit/overrides/{key}.png", "emissive": key in K["emit"], "layer": P.get("layer")}
json.dump({"doc": "one slot per kit frame; PNG must be exactly w x h (RGBA, transparent background, hard pixel edges, no AA "
                  "against the background); anchor = pixel of the piece origin (ground pieces: bottom vertex of the 2 m diamond; "
                  "facade modules: bay bottom-left on the facade face; props: footprint centre at z = 0). Emissive slots may also get a "
                  "'<path>.emit.png' night layer (planned). Register in kit/overrides/index.js.",
           "projection": K["projection"], "slots": slots}, open(os.path.join(ROOT, "kit", "texture_slots.json"), "w"), indent=0)
# per-module summary table
rows = {}
for key, s in slots.items():
    piece, var, part, st, rot = key.split("/")
    r = rows.setdefault(piece, {"vars": set(), "states": set(), "rots": set(), "parts": set(), "n": 0, "wmax": 0, "hmax": 0, "layer": s["layer"]})
    r["vars"].add(var); r["states"].add(st); r["rots"].add(rot); r["parts"].add(part); r["n"] += 1
    r["wmax"] = max(r["wmax"], s["w"]); r["hmax"] = max(r["hmax"], s["h"])
md = ["| module | layer | variants | states | rots | parts | slots | max size px |", "|---|---|---|---|---|---|---|---|"]
for piece, r in sorted(rows.items()):
    md.append(f"| `{piece}` | {r['layer']} | {', '.join(sorted(r['vars']))} | {', '.join(sorted(r['states']))} | {', '.join(sorted(r['rots']))} | "
              f"{', '.join(sorted(r['parts']))} | {r['n']} | {r['wmax']}×{r['hmax']} |")
open(os.path.join(ROOT, "kit", "TEXTURE_SLOTS.md"), "w").write("\n".join(md) + "\n")
if tpl:
    A = Image.open(os.path.join(ROOT, "kit", "kit_atlas.png"))
    for key, s in slots.items():
        x, y, w, h, ax, ay = K["frames"][key]; p = os.path.join(tpl, key + ".png"); os.makedirs(os.path.dirname(p), exist_ok=True)
        A.crop((x, y, x + w, y + h)).save(p)
print(len(slots), "slots,", len(rows), "modules")
