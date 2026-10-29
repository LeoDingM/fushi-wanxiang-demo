/* 鹰山宋城 · 城墙段（南薰门同色灰砖垛口）。名称与尺寸未经Leo确认。 */
(function (root) {
  'use strict';
  const AC = root.AncientCore; if (!AC) return;
  const { A, shade, C, H } = AC;
  const { TILE, WOOD_D } = C;
  const WB = '#8a8680', WB_W = '#6e6a64', STONE = '#b3aea3', STONE_W = '#968f84';

  A.define('aq_city_wall', {
    name: '城墙段', variants: ['ew', 'ns'], prune: true,
    geo: [-0.4, -0.4, 0, 24.4, 8.4, 11.2],
    geoOf: (st, v) => v === 'ns' ? [-0.4, -0.4, 0, 8.4, 24.4, 11.2] : null,
    fp: [[0, 0, 24, 8]],
    fpStates: null,
    draw(d, st, v) {
      const h = H(d), Z = 9, ns = v === 'ns';
      const L = ns ? 8 : 24, D = ns ? 24 : 8;
      if (ns) {
        d.box(0, 0, 0, 8, 24, Z, WB, { line: shade(WB, 0.5), west: WB_W, south: WB, top: shade(WB, 1.1) });
        d.coursesW(0.02, 0, 24, 0, Z, 0.22, shade(WB, 0.86), 0.55);
        d.coursesS(0, 8, 0.02, 0, Z, 0.22, shade(WB, 0.86), 0.55);
        d.flat(0, 0, 8, 24, Z, '#a29e95', shade(WB, 0.5));
        d.box(0, 0, Z, 8, 0.55, Z + 1.7, WB, { line: shade(WB, 0.45), west: WB_W, top: shade(WB, 1.18) });
        d.box(0, 23.45, Z, 8, 24, Z + 1.1, WB, { line: shade(WB, 0.45), west: WB_W, top: shade(WB, 1.15) });
        for (let y = 0; y < 24; y += 1.6) {
          d.box(0, y, Z, 0.55, y + 1.05, Z + 1.7, WB, { line: shade(WB, 0.45), west: WB_W, top: shade(WB, 1.18) });
          if (y + 1.6 < 24) d.box(0, y + 1.05, Z, 0.55, y + 1.6, Z + 1.0, WB, { line: shade(WB, 0.45), west: WB_W, top: shade(WB, 1.18) });
        }
      } else {
        h.QS(0, 0, 0, 24, Z, WB, shade(WB, 0.5));
        d.coursesS(0, 24, 0, 0, Z, 0.22, shade(WB, 0.86), 0.55);
        h.QW(-0.01, 0, 0, 8, Z, WB_W, shade(WB_W, 0.5));
        d.coursesW(-0.01, 0, 8, 0, Z, 0.22, shade(WB_W, 0.86), 0.55);
        h.QS(-0.01, 0, 0, 24, 1.2, STONE, shade(STONE, 0.5));
        d.coursesS(0, 24, -0.01, 0, 1.2, 0.4, shade(STONE, 0.8), 1.2);
        for (let i = 0; i < 18; i++) {
          const x = d.R() * 24, z = 1.4 + d.R() * 6;
          h.line([x, -0.01, z], [x, -0.01, z - 0.5 - d.R()], shade(WB, 0.8));
        }
        d.flat(0, 0, 24, 8, Z, '#a29e95', shade(WB, 0.5));
        d.box(0, 7.4, Z, 24, 8, Z + 1.1, WB, { line: shade(WB, 0.5), west: WB_W, top: shade(WB, 1.15) });
        for (let x = 0; x < 24; x += 1.6) {
          d.box(x, 0, Z, x + 1.05, 0.55, Z + 1.7, WB, { line: shade(WB, 0.45), west: WB_W, top: shade(WB, 1.18) });
          d.px(x + 0.45, 0, Z + 1.05, '#2a2622', 3, 4);
          if (x + 1.6 < 24) d.box(x + 1.05, 0, Z, x + 1.6, 0.55, Z + 1.0, WB, { line: shade(WB, 0.45), west: WB_W, top: shade(WB, 1.18) });
        }
      }
    },
  });

  /* 角楼：缩小版城楼，标出墙角 */
  A.define('aq_corner_tower', {
    name: '城墙角楼', prune: true,
    geo: [-0.6, -0.6, 0, 10.6, 10.6, 16],
    fp: [[0, 0, 10, 10]],
    draw(d) {
      const h = H(d), Z = 9, RED = C.RED, RED_W = C.RED_W;
      d.box(0, 0, 0, 10, 10, Z, WB, { line: shade(WB, 0.5), west: WB_W, top: shade(WB, 1.1) });
      d.coursesS(0, 10, 0, 0, Z, 0.22, shade(WB, 0.86), 0.55);
      d.coursesW(0, 0, 10, 0, Z, 0.22, shade(WB_W, 0.86), 0.55);
      d.flat(0, 0, 10, 10, Z, '#a29e95', shade(WB, 0.5));
      const b = Z + 0.35;
      d.box(-0.3, -0.3, Z, 10.3, 10.3, b, STONE, { line: shade(STONE, 0.5), west: STONE_W });
      d.box(1.2, 1.2, b, 8.8, 8.8, b + 3.6, '#d8cfbf', { line: shade('#d8cfbf', 0.55), west: shade('#d8cfbf', 0.78), south: '#e6dfcf' });
      for (const x of [2.2, 5, 7.8]) {
        d.box(x - 0.14, 1.15, b, x + 0.14, 1.35, b + 3.4, RED, { line: RED_W, west: RED_W });
      }
      h.QS(1.12, 1.2, b + 1.2, 8.8, b + 2.8, '#c8bfae', shade('#c8bfae', 0.6));
      for (let x = 1.8; x < 8.5; x += 1.6) {
        d.face([[x, 1.1, b + 1.4], [x + 1.1, 1.1, b + 1.4], [x + 1.1, 1.1, b + 2.6], [x, 1.1, b + 2.6]], C.PAPER, '#4a3020');
        for (let i = 0; i < 3; i++) h.line([x + 0.15 + i * 0.35, 1.08, b + 1.4], [x + 0.15 + i * 0.35, 1.08, b + 2.6], '#4a3020');
      }
      const X = root.AncientParts;
      if (X && X.roof) X.roof(d, { x0: -0.6, x1: 10.6, y0: -0.6, y1: 10.6, z: b + 4.2, rise: 2.4, type: 'xieshan', lift: 0.45, beasts: 2, gable: 0.4, ridgeH: 0.35 });
      else d.box(-0.4, -0.4, b + 3.6, 10.4, 10.4, b + 5.8, TILE, { line: shade(TILE, 0.55), west: shade(TILE, 0.75), top: shade(TILE, 1.15) });
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
