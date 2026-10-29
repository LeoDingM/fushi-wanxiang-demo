/* E5b: inside a gated compound, on the CBD plaza band, or in the 月湾汇 car park, the see-through circle around the
 * player grows so the garden / plaza behind the 15–18F rows stays readable. Outside those rects the radius is unchanged.
 * Rects come from RONGQIAO_NORTH.expansionE5.reveal (written by rongqiao_expand_e5.js). Cap 420 screen px. */
(function (root) {
  'use strict';
  const SP = root.SP; if (!SP || !SP.world || typeof SP.world.seeRadius !== 'function' || SP.world.seeRadius.e5) return;
  const W = SP.world, base = W.seeRadius;
  function seeRadius() {
    const r = base();
    const p = SP.player, zones = root.RONGQIAO_NORTH && root.RONGQIAO_NORTH.expansionE5 && root.RONGQIAO_NORTH.expansionE5.reveal;
    if (!p || !zones || W.interior) return r;
    let hit = false;
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i];
      if (p.x >= z[0] && p.x <= z[2] && p.y >= z[1] && p.y <= z[3]) { hit = true; break; }
    }
    if (!hit) return r;
    return { r: Math.min(420, r.r * 2.2), f: r.f };
  }
  seeRadius.e5 = true;
  W.seeRadius = seeRadius;
})(typeof window !== 'undefined' ? window : globalThis);
