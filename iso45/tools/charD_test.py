#!/usr/bin/env python3
"""Char-D smoke: actors_hair loaded, hair atlases resolve, office_skirt, civic safe, female weight."""
import json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def ok(m): print("PASS", m)
def fail(m): print("FAIL", m); sys.exit(1)

# 1) index load order
idx = (ROOT / "index.html").read_text()
i_data = idx.find("actors_data.js")
i_hair = idx.find("actors_hair.js")
i_civic = idx.find("actors_civic.js")
i_c = idx.find("charC.js")
i_d = idx.find("charD.js")
if not (0 <= i_data < i_hair < i_civic): fail("actors_hair must load after actors_data, before civic")
ok("index: actors_hair after actors_data")
if not (0 <= i_c < i_d): fail("charD after charC")
ok("index: charD after charC")

# 2) atlases exist
hair_js = (ROOT / "js/actors_hair.js").read_text()
need = ["woman_bob","woman_pony","woman_long","woman_pixie","woman_twin","woman_wave","woman_bun","woman_braid",
        "man_undercut","man_buzz","man_short","man_messy","man_sidepart","man_mullet","man_bald","man_grey"]
for n in need:
  if f'"{n}"' not in hair_js and f"'{n}'" not in hair_js:
    # JSON keys in assign
    if f'"{n}":' not in hair_js and f'"{n}" :' not in hair_js:
      # check via img path
      if f"{n}.png" not in hair_js: fail(f"missing atlas key {n}")
  png = ROOT / f"img/actors/{n}.png"
  if not png.exists(): fail(f"missing png {n}")
ok(f"16 hair atlases + png present")

# 3) charD maps
cd = (ROOT / "js/charD.js").read_text()
for k in ["f_bob","m_undercut","bob","ponytail","office_skirt","applyHairAtlas","HAIR_ATLAS"]:
  if k not in cd: fail(f"charD missing {k}")
ok("charD HAIR_ATLAS + applyHairAtlas")

# 4) office_skirt in actors_outfits
ao = (ROOT / "js/actors_outfits.js").read_text()
if "office_skirt" not in ao: fail("office_skirt not in actors_outfits")
if not (ROOT / "img/actors/office_skirt.png").exists(): fail("office_skirt.png missing")
ok("office_skirt outfit")

# 5) civic untouched in charD
for bad in ["police.png","firefighter.png","nurse.png"]:
  if bad in cd: fail(f"charD touches {bad}")
ok("charD does not rewrite civic atlas paths")

# 6) silhouette suppress
if "useHairAtlas" not in cd or "drawHairSilhouette" not in cd: fail("missing silhouette suppress")
ok("silhouette suppressed when hair atlas")

print("ALL PASS")
