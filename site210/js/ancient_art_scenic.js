/* Site197 · 鹰山宋城植物/水系点景（松·假山·竹丛 + 放置/小池装饰 API）。
 * 只服务古城 aq_*；不进学校/渔村/石驳岸；岸线 aq_reed/aq_bank 长条保留。
 * 小池 paint D/E/I → 动态水 installAqWaves 自动覆盖。名称未经 Leo 确认。 */
(function (root) {
  'use strict';
  const Core = root.AncientCore;
  if (!Core || !Core.A) return;
  const { A, shade, C, H } = Core;
  const M = root.AncientMisc;
  const { STONE, STONE_W } = C;

  const ell = (cx, cy, rx, ry) => {
    const p = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
    return p;
  };

  /* —— 苍松：层叠伞盖 + 扭干（院内/寺门/假山旁点景） —— */
  A.define('aq_pine', {
    shadowOf: (st, v) => [ell(0.4, 3.6, v === 'b' ? 2.0 : 2.6, v === 'b' ? 1.7 : 2.2), [[-0.25, -0.25], [0.25, -0.25], [0.55, 3.2], [0.15, 3.2]]],
    name: '苍松',
    variants: ['a', 'b'],
    geo: [-3.0, -3.0, 0, 3.0, 3.0, 9.0],
    fp: [[-0.35, -0.35, 0.35, 0.35]],
    prune: true,
    draw(d, st, v) {
      const h = H(d), R = d.R, g = d.g;
      const tall = v !== 'b';
      const ht = tall ? 8.2 : 6.0;
      const bark = '#4a3a28', barkD = '#2e2418';
      /* twisted trunk */
      const k1 = [0.18, -0.05, ht * 0.28], k2 = [-0.35, 0.12, ht * 0.52], k3 = [0.22, -0.08, ht * 0.72], top = [0.05, 0, ht * 0.88];
      d.disc(0, 0, 0.04, 0.48, shade(bark, 0.9), barkD);
      for (const [a, b, w] of [[[0, 0, 0], k1, 8], [k1, k2, 7], [k2, k3, 6], [k3, top, 5]]) {
        d.seg(a, b, barkD, w + 2);
        d.seg(a, b, bark, w);
        d.seg([a[0] - 0.06, a[1] + 0.06, a[2]], [b[0] - 0.06, b[1] + 0.06, b[2]], shade(bark, 1.15), 2);
      }
      /* layered needle plates (dark → light) */
      const layers = tall
        ? [[0.15, 0.55, 2.4], [0.35, 0.68, 2.0], [0.55, 0.78, 1.55], [0.72, 0.88, 1.1], [0.88, 0.96, 0.65]]
        : [[0.2, 0.58, 1.9], [0.45, 0.72, 1.45], [0.68, 0.86, 1.0], [0.88, 0.96, 0.55]];
      for (const [t0, t1, rad] of layers) {
        const z = ht * t0, z2 = ht * t1;
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 + R() * 0.3;
          const rr = rad * (0.55 + R() * 0.5);
          const x = Math.cos(a) * rr, y = Math.sin(a) * rr * 0.7;
          const c = h.P(x, y, z + R() * (z2 - z) * 0.4);
          g.fillStyle = i % 3 === 0 ? '#3a5a28' : i % 2 ? '#4a6e30' : '#2e4a20';
          g.beginPath();
          g.ellipse(c[0], c[1], 10 + R() * 6, 6 + R() * 3, a * 0.3, 0, Math.PI * 2);
          g.fill();
        }
        /* needle fringe tips */
        for (let k = 0; k < 18; k++) {
          const a = R() * Math.PI * 2, rr = rad * (0.7 + R() * 0.35);
          const x = Math.cos(a) * rr, y = Math.sin(a) * rr * 0.65;
          h.line([x * 0.4, y * 0.4, z2 - 0.15], [x, y, z - 0.05 - R() * 0.25], shade('#5a7a38', 0.85 + R() * 0.3), 1);
        }
      }
      /* top tuft */
      h.blob(0.05, 0, ht * 0.98, 8, 7, '#5a7a38', '#2e4a20');
    },
  });

  /* —— 假山叠石（院内/池边点景；比 aq_bank 大一档） —— */
  A.define('aq_rock', {
    name: '假山',
    variants: ['a', 'b', 'c'],
    geo: [-1.6, -1.2, 0, 1.6, 1.2, 3.2],
    fp: [[-1.2, -0.9, 1.2, 0.9]],
    prune: true,
    draw(d, st, v) {
      const R = d.R, h = H(d);
      const peak = v === 'a' ? 2.9 : v === 'b' ? 2.1 : 1.45;
      const n = v === 'a' ? 7 : v === 'b' ? 5 : 4;
      for (let k = 0; k < n; k++) {
        const x = (R() - 0.5) * 2.2, y = (R() - 0.5) * 1.5;
        const w = 0.35 + R() * 0.55, hh = peak * (0.35 + R() * 0.65);
        const col = shade('#9a9688', 0.78 + R() * 0.35);
        d.box(x - w, y - w * 0.65, 0, x + w, y + w * 0.65, hh, col, { line: '#5c5a52', west: shade(col, 0.82), top: shade(col, 1.12) });
      }
      /* crevice dark + moss tufts */
      for (let k = 0; k < 8; k++) d.disc((R() - 0.5) * 1.8, (R() - 0.5) * 1.2, 0.2 + R() * (peak - 0.3), 0.06, '#4a4a44');
      for (let k = 0; k < 5; k++) {
        const x = (R() - 0.5) * 1.6, y = (R() - 0.5) * 1.0, z = 0.4 + R() * peak * 0.7;
        h.blob(x, y, z, 4, 3, '#4f8f3e', '#2f5f2a');
      }
      if (v === 'a') {
        /* small pine sprout on peak */
        h.line([0.15, 0.1, peak * 0.85], [0.2, 0.12, peak + 0.35], '#4a3a28', 2);
        h.blob(0.22, 0.14, peak + 0.45, 5, 4, '#3a5a28', '#2e4a20');
      }
    },
  });

  /* —— 竹丛（院角/廊侧点缀） —— */
  A.define('aq_bamboo', {
    name: '竹丛',
    variants: ['a', 'b'],
    geo: [-1.2, -1.0, 0, 1.2, 1.0, 4.2],
    fp: [[-0.4, -0.35, 0.4, 0.35]],
    prune: true,
    noShadow: false,
    draw(d, st, v) {
      const h = H(d), R = d.R;
      const n = v === 'b' ? 7 : 11;
      for (let k = 0; k < n; k++) {
        const x = (R() - 0.5) * 1.8, y = (R() - 0.5) * 1.4;
        const ht = 2.6 + R() * 1.5, lean = (R() - 0.5) * 0.25;
        h.line([x, y, 0], [x + lean, y, ht], shade('#4a7a3a', 0.85 + R() * 0.3), 2);
        for (let z = 0.5; z < ht; z += 0.45) d.px(x + lean * (z / ht), y, z, '#2a4a20', 2, 1);
        for (let j = 0; j < 4; j++) {
          const z = 1.2 + R() * (ht - 1.4);
          d.face([
            [x + lean * (z / ht), y, z],
            [x + lean * (z / ht) + 0.35, y, z - 0.1],
            [x + lean * (z / ht) + 0.1, y, z - 0.05],
          ], j % 2 ? '#5a9a46' : '#3e7a34', null);
        }
      }
    },
  });

  /* —— 放置 / 小池装饰 API（艮岳布局 Track 可复用，本 Track 只加植物水系点景） —— */
  const Scenic = {
    /* paint small courtyard / scenic ponds with D/E/I so Site195 waves apply */
    paintPonds(paint, paintSea, ctx) {
      const { OX, OY, W } = ctx;
      /* local-metre pond rects → world via OX/OY; keep clear of streets & major footprints */
      const ponds = [
        /* 西北风景口袋（艮岳苑占位，名称未经确认）— 避开既有 huai_n1(50,175)/公堂 */
        { rect: [OX + 18, OY + 170, OX + 40, OY + 186], pad: 0.8, id: 'genyue_main' },
        { rect: [OX + 58, OY + 176, OX + 72, OY + 188], pad: 0.5, id: 'genyue_side' },
        /* 宝相寺西侧小池（寺 put 230,140；西缘空地） */
        { rect: [OX + 204, OY + 150, OX + 216, OY + 160], pad: 0.5, id: 'siyuan_pond' },
        /* 西四合院外侧水景（院 36,155 footprint~16×20 → 东墙外） */
        { rect: [OX + 54, OY + 158, OX + 64, OY + 166], pad: 0.4, id: 'siheyuan_w_pond' },
        /* 东四合院外侧水景（院 248,158） */
        { rect: [OX + 266, OY + 162, OX + 276, OY + 170], pad: 0.4, id: 'siheyuan_e_pond' },
      ];
      const waterRects = [];
      for (const p of ponds) {
        if (typeof paintSea === 'function') paintSea(p.rect, { pad: p.pad });
        else {
          paint(p.rect, null, (x, y) => {
            const dx = Math.min(x - p.rect[0], p.rect[2] - x);
            const dy = Math.min(y - p.rect[1], p.rect[3] - y);
            const edge = Math.min(dx, dy);
            if (edge < 1.0) return 'D';
            if (edge < 2.2) return 'E';
            return 'I';
          });
        }
        waterRects.push(p.rect.slice());
      }
      return { ponds, waterRects };
    },

    /* densify plants / rockeries / reeds around shores + courtyard scenic pockets */
    place(put, ctx) {
      const { CX, CW, CN } = ctx;
      const counts = { pine: 0, rock: 0, bamboo: 0, willow: 0, reed: 0, bank: 0, planter: 0, huai: 0 };

      /* 苍松：门阙/衙署/寺观/假山旁 */
      const pines = [
        [CX - 22, -6], [CX + 22, -6],
        [40, 40], [260, 40],
        [78, 150], [100, 150],
        [218, 138], [248, 138],
        [36, 172], [70, 180], [100, 176],
        [240, 170], [20, 60], [280, 60],
        [CX - 8, 78], [CX + 28, 76],
      ];
      pines.forEach(([x, y], i) => {
        put('pine_' + i, 'aq_pine', x, y, { variant: i % 3 === 0 ? 'b' : 'a' });
        counts.pine++;
      });

      /* 假山：池边 + 汴河岸点景 + 院外 */
      const rocks = [
        [30, 176], [48, 184], [62, 170], [66, 180],
        [208, 152], [220, 156],
        [56, 162], [268, 166],
        [20, 100], [280, 100],
        [100, 94], [190, 94],
        [40, -50], [260, -50],
        [CX - 30, 120], [CX + 30, 120],
        [80, 170], [110, 168],
      ];
      rocks.forEach(([x, y], i) => {
        put('rock_' + i, 'aq_rock', x, y, { variant: i % 3 === 0 ? 'a' : i % 3 === 1 ? 'b' : 'c' });
        counts.rock++;
      });

      /* 竹丛：书塾/四合院角 */
      const bamboos = [
        [172, 148], [148, 160],
        [28, 155], [52, 170],
        [240, 158], [260, 170],
        [120, 170], [16, 130], [284, 130],
      ];
      bamboos.forEach(([x, y], i) => {
        put('bamboo_' + i, 'aq_bamboo', x, y, { variant: i % 2 ? 'b' : 'a' });
        counts.bamboo++;
      });

      /* 垂柳加密：汴河两岸 + 护城河 + 小池边（保留既有 willow_*，追加 densify 前缀） */
      const willows = [
        [16, 94], [40, 116], [64, 94], [80, 116], [108, 94], [140, 116],
        [168, 94], [196, 116], [220, 94], [256, 116], [284, 94],
        [44, 122], [76, 90], [148, 90], [232, 122],
        [20, -48], [100, -52], [180, -48], [240, -52], [280, -48],
        [16, CN + 6], [90, CN + 4], [170, CN + 6], [250, CN + 4],
        [34, 174], [54, 188], [64, 176], [214, 154], [58, 164], [270, 168],
      ];
      willows.forEach(([x, y], i) => {
        put('willow_d_' + i, 'aq_willow', x, y, { variant: (x + y + i) % 2 ? 'a' : 'b' });
        counts.willow++;
      });

      /* 芦苇/泥石岸加密（保留 Site194 既有 reed_/bank_；追加 densify） */
      const reeds = [
        [16, 96], [36, 114], [60, 96], [84, 114], [104, 96], [132, 114],
        [156, 96], [176, 114], [204, 96], [228, 114], [252, 96], [276, 114],
        [32, 174], [46, 186], [60, 178], [212, 150], [218, 158],
        [56, 160], [268, 164],
        [4, -52], [40, -56], [90, -52], [150, -56], [210, -52], [270, -56],
        [4, CN + 10], [100, CN + 6], [200, CN + 10], [280, CN + 6],
        [-6, 60], [-6, 120], [-6, 170],
        [CW + 6, 60], [CW + 6, 120], [CW + 6, 170],
      ];
      reeds.forEach(([x, y], i) => {
        put('reed_d_' + i, 'aq_reed', x, y, { variant: i % 6 === 0 ? 'iris' : 'reed' });
        counts.reed++;
      });
      const banks = [
        [22, 98], [70, 112], [150, 98], [230, 112],
        [36, 178], [56, 184], [214, 154],
        [50, -50], [200, -54],
        [-12, 90], [CW + 12, 90],
      ];
      banks.forEach(([x, y], i) => {
        put('bank_d_' + i, 'aq_bank', x, y, { variant: i % 2 ? 'stone' : 'mud' });
        counts.bank++;
      });

      /* 花坛补点：池边/寺前 */
      const planters = [
        [26, 168], [52, 168], [66, 186], [206, 146], [224, 146],
        [50, 156], [262, 160], [CX - 20, 100], [CX + 20, 100],
      ];
      planters.forEach(([x, y], i) => {
        put('pl_d_' + i, 'aq_planter', x, y, { variant: ['a', 'b', 'c'][i % 3] });
        counts.planter++;
      });

      /* 国槐补点：北口风景口袋外缘 */
      [[18, 180], [88, 188], [130, 180], [200, 178]].forEach(([x, y], i) => {
        put('huai_d_' + i, 'aq_huai', x, y);
        counts.huai++;
      });

      return counts;
    },
  };

  root.SongchengScenic = Scenic;
})(typeof window !== 'undefined' ? window : globalThis);
