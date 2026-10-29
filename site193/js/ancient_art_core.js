/* 影视城古镇（鹰山宋城）procedural building / prop art — ART PREVIEW ONLY, not wired into the game.
 * Core helpers. Uses the project's RongqiaoArt painter + registry (same 45° projection: 32 px/m across, 16 px/m deep, 39.19 px/m up;
 * S faces lit, W faces in shade, 1 px dark outlines, alpha thresholded hard pixel edges, atlas pages + 4px masks + ground shadows).
 * Pieces are in WORLD orientation (rot 0): facade = S face. Northern-Song vocabulary: grey 筒瓦 roofs with upturned eaves
 * (歇山 / 悬山 / 庑殿 / 硬山), 斗拱, red columns, 额枋彩画, lattice windows, 隔扇门, stone 台基, plaques, banners, lanterns.
 * All names / colours / sizes 未经Leo确认. */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A) throw new Error('RongqiaoArt first');
  const shade = A.shade;
  const C = {
    TILE: '#6e7377', TILE_W: '#575b60', RIDGE: '#3d4145', RED: '#9a2f24', RED_W: '#7a251d', WOOD: '#6e4428', WOOD_D: '#4a2c1a',
    PAPER: '#e9dcbc', BRICK: '#8c8a86', BRICK_W: '#73716d', STONE: '#b3aea3', STONE_W: '#968f84', PLASTER: '#e6dfcf', PLASTER_W: '#c9c1b0',
    CAI_G: '#3f7a6a', CAI_B: '#2f5a86', GOLD: '#d8b45a',
  };
  const FONT_SERIF = '"Noto Serif CJK SC","Noto Sans CJK SC",serif';
  function H(d) {
    const { P, g } = d;
    const poly = (pts, fill, line, lw) => d.face(pts, fill, line, lw);
    const QS = (y, x0, z0, x1, z1, fill, line) => d.face([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], fill, line);
    const QW = (x, y0, z0, y1, z1, fill, line) => d.face([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]], fill, line);
    const line = (a, b, col, lw) => d.seg(a, b, col, lw);
    function pline(pts, col, lw) { g.strokeStyle = col; g.lineWidth = lw || 1; g.beginPath(); pts.forEach((p, i) => { const q = P(...p); i ? g.lineTo(Math.round(q[0]) + .5, Math.round(q[1]) + .5) : g.moveTo(Math.round(q[0]) + .5, Math.round(q[1]) + .5); }); g.stroke(); g.lineWidth = 1; }
    function stext(s, x, y, z, size, col, o = {}) { const P0 = P(x, y, z); g.save(); g.setTransform(1, o.west ? 0.5 : -0.5, 0, 1, Math.round(P0[0]), Math.round(P0[1])); g.font = `${o.weight || 'bold'} ${size}px ${o.font || FONT_SERIF}`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = o.sw || 2; g.strokeText(s, 0, 0); } g.fillStyle = col; g.fillText(s, 0, 0); g.restore(); }
    function vtext(s, x, y, z, size, col, o = {}) { for (let i = 0; i < s.length; i++) stext(s[i], x, y, z - i * (size / 39.19) * 1.08, size, col, o); }
    function blob(x, y, z, rx, ry, fill, line) { const c = P(x, y, z); g.beginPath(); g.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.strokeStyle = line; g.lineWidth = 1; g.stroke(); } }
    function column(x, y, z0, z1, r, col, o = {}) {
      const a = P(x, y, z0), b = P(x, y, z1), w = r * 45.25, L = Math.round(a[0] - w), R = Math.round(a[0] + w), T = Math.round(b[1]), Hh = Math.round(a[1] - b[1]);
      g.fillStyle = shade(col, 0.72); g.fillRect(L, T, R - L, Hh);
      g.fillStyle = col; g.fillRect(L, T, Math.max(1, Math.round((R - L) * 0.62)), Hh);
      if (w > 1.6) { g.fillStyle = shade(col, 1.25); g.fillRect(L + 1, T, 1, Hh); }
      if (o.line !== false) { g.fillStyle = shade(col, 0.45); g.fillRect(L - 1, T, 1, Hh); g.fillRect(R, T, 1, Hh); }
      if (o.base) blob(x, y, z0 + 0.04, w + 2, (w + 2) * 0.5, o.base, shade(o.base, 0.6));
    }
    return { P, g, poly, QS, QW, line, pline, vtext, stext, blob, column };
  }
  root.AncientCore = { A, shade, C, FONT_SERIF, H };
})(typeof window !== 'undefined' ? window : globalThis);
