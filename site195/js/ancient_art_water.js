/* 鹰山宋城水体地面与岸线小品（Site194）。只服务古城 U/V/W 之外的 D/E/I 图例，不改 rq_gwater（月河/石驳岸）。
 * 分层：近岸浅青绿+土黄过渡 → 中带青绿 → 中心深蓝绿；轻微波纹与高光条，白天/黄昏都可读。
 * 名称与色值未经 Leo 确认。 */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A) return;
  const shade = A.shade, mix = A.mix;

  /* shallow / mid / deep — Song-era canal palette (teal → deep blue-green, muddy near bank) */
  const SHALLOW = '#6e9a7a';
  const SHALLOW_MUD = '#8a7a52';
  const MID = '#3f7f86';
  const DEEP = '#2a5c6e';
  const DEEP2 = '#1e4a5c';
  const RIPPLE_DAY = 'rgba(210,235,230,0.72)';
  const RIPPLE_SOFT = 'rgba(170,215,214,0.55)';
  const GLINT = 'rgba(245,240,220,0.78)';   /* warm-white so dusk still reads */
  const GLINT_COOL = 'rgba(200,230,235,0.65)';

  function ripples(d, n, y0, y1, cols) {
    for (let k = 0; k < n; k++) {
      const x = d.R() * 1.65, y = y0 + d.R() * (y1 - y0), w = 0.22 + d.R() * 0.55;
      const col = cols[k % cols.length];
      d.seg([x, y, 0], [x + w, y + (d.R() - 0.5) * 0.08, 0], col);
    }
  }

  A.define('aq_gwater', {
    name: '宋城水面',
    layer: 'ground',
    states: ['a', 'b', 'c'],
    geo: [0, 0, 0, 2, 2, 0],
    draw(d, st) {
      const R = d.R;
      if (st === 'a') {
        /* near-shore: shallow teal-green with muddy ochre patches */
        d.flat(0, 0, 2, 2, 0, SHALLOW);
        d.flat(0, 0, 2, 0.35 + R() * 0.25, 0, mix(SHALLOW, SHALLOW_MUD, 0.45 + R() * 0.25));
        for (let k = 0; k < 4; k++) {
          const x = R() * 1.4, y = R() * 1.6, w = 0.35 + R() * 0.5, h = 0.2 + R() * 0.35;
          d.flat(x, y, x + w, y + h, 0, mix(SHALLOW, SHALLOW_MUD, 0.3 + R() * 0.5));
        }
        /* lighter foam / wet-edge streak */
        if (R() < 0.7) d.seg([R() * 0.4, 0.15 + R() * 0.3, 0], [0.8 + R() * 1.0, 0.2 + R() * 0.25, 0], 'rgba(230,225,200,0.55)');
        ripples(d, 4, 0.4, 1.85, [RIPPLE_SOFT, shade(SHALLOW, 1.22), GLINT]);
      } else if (st === 'b') {
        /* mid canal */
        d.flat(0, 0, 2, 2, 0, MID);
        d.flat(0, 0, 2, 0.2, 0, shade(MID, 0.88));
        for (let k = 0; k < 3; k++) {
          const x = R() * 1.5, y = 0.3 + R() * 1.4;
          d.flat(x, y, x + 0.4 + R() * 0.5, y + 0.15 + R() * 0.2, 0, mix(MID, DEEP, 0.35 + R() * 0.3));
        }
        ripples(d, 6, 0.25, 1.8, [RIPPLE_DAY, RIPPLE_SOFT, GLINT_COOL, shade(MID, 1.2)]);
        if (R() < 0.55) {
          const x = R() * 1.2, y = 0.5 + R() * 1.0;
          d.seg([x, y, 0], [x + 0.7 + R() * 0.4, y, 0], GLINT);
        }
      } else {
        /* deep center */
        d.flat(0, 0, 2, 2, 0, DEEP);
        d.flat(0.2 + R() * 0.3, 0.3 + R() * 0.4, 1.5 + R() * 0.4, 1.5 + R() * 0.4, 0, DEEP2);
        ripples(d, 5, 0.2, 1.85, [RIPPLE_SOFT, GLINT_COOL, 'rgba(160,200,210,0.45)']);
        /* longer highlight streak — readable under dusk warm wash */
        const x = R() * 0.9, y = 0.45 + R() * 1.1;
        d.seg([x, y, 0], [x + 0.9 + R() * 0.5, y + (R() - 0.5) * 0.06, 0], GLINT);
        if (R() < 0.4) d.seg([R() * 1.2, 0.3 + R() * 1.4, 0], [R() * 0.5 + 1.0, 0.3 + R() * 1.4, 0], RIPPLE_DAY);
      }
    },
  });

  /* Songcheng reed clumps — same silhouette language as rq_x_reed, Songcheng-only placements */
  A.define('aq_reed', {
    name: '宋城芦苇',
    variants: ['reed', 'iris'],
    geo: [-0.6, -0.4, 0, 0.6, 0.4, 1.7],
    fp: [],
    noShadow: true,
    draw(d, st, v) {
      const R = d.R;
      for (let k = 0; k < 28; k++) {
        const x = (R() - 0.5) * 1.15, y = (R() - 0.5) * 0.75, h = 0.85 + R() * 0.85, lean = (R() - 0.5) * 0.35;
        d.seg([x, y, 0], [x + lean, y, h], shade(v === 'iris' ? '#4d8a3c' : '#8a9a4a', 0.78 + R() * 0.45));
        if (v === 'reed' && k % 3 === 0) d.px(x + lean, y, h + 0.05, '#c9b98a', 2, 3);
      }
      if (v === 'iris') for (let k = 0; k < 5; k++) d.px((R() - 0.5) * 0.9, (R() - 0.5) * 0.5, 0.9 + R() * 0.3, '#7d5ac2', 3, 3);
    },
  });

  /* small mud/stone bank nibs along irregular shore */
  A.define('aq_bank', {
    name: '宋城泥石岸',
    variants: ['mud', 'stone'],
    geo: [-0.8, -0.35, 0, 0.8, 0.35, 0.35],
    fp: [],
    noShadow: true,
    draw(d, st, v) {
      const R = d.R;
      if (v === 'stone') {
        for (let k = 0; k < 5; k++) {
          const x = (R() - 0.5) * 1.3, y = (R() - 0.5) * 0.45, w = 0.18 + R() * 0.28, h = 0.12 + R() * 0.2;
          d.box(x - w, y - w * 0.6, 0, x + w, y + w * 0.6, h, shade('#9a9688', 0.85 + R() * 0.25), { line: '#5c5a52' });
        }
      } else {
        d.flat(-0.7, -0.28, 0.7, 0.28, 0.02, mix('#7a6a48', '#5a6a4a', R() * 0.4));
        for (let k = 0; k < 4; k++) {
          const x = (R() - 0.5) * 1.2, y = (R() - 0.5) * 0.4;
          d.disc(x, y, 0.02, 0.12 + R() * 0.1, shade('#6a5a40', 0.9 + R() * 0.2));
        }
      }
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
