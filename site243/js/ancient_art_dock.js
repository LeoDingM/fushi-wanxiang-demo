/* Site197 · 鹰山宋城汴河码头/船只/货箱点景（漕船旁小舫 + 岸边货堆 + densify place）。
 * Site201：小舫/货堆船灯渔火复用 lanternGlow（水面倒影）；不改 densify 布局。
 * 只服务古城 aq_*；不进学校/渔村/石驳岸；不改艮岳主体布局；动态水 installAqWaves 保留。
 * 参照 layout refs：岸边泊船、带篷小船、粮堆/货筐、独轮推车贴岸。名称未经 Leo 确认。 */
(function (root) {
  'use strict';
  const Core = root.AncientCore;
  if (!Core || !Core.A) return;
  const { A, shade, C, H } = Core;
  const X = root.AncientParts;
  if (!X) return;
  const { WOOD, WOOD_D, STONE, STONE_W, GOLD } = C;

  /* —— 小舫/舢板：比 aq_boat 短一档，便于河面加密 —— */
  A.define('aq_skiff', {
    name: '小舫',
    variants: ['a', 'b'],
    geo: [-3.6, -1.2, -0.35, 3.8, 1.2, 3.6],
    fp: [[-3.2, -1.0, 3.4, 1.0]],
    prune: true,
    layer: 'sorted',
    shadow: false,
    draw(d, st, v) {
      const h = H(d), z0 = -0.25, canopy = v !== 'b';
      const hull = (y) => {
        const pts = [];
        for (let i = 0; i <= 10; i++) {
          const x = -3.2 + i * 0.64, t = Math.abs(x) / 3.2;
          pts.push([x, y * (1 - t ** 4 * 0.9), z0 + 0.72 + t ** 2 * 0.4]);
        }
        return pts;
      };
      const top = hull(1.05), bot = hull(-1.05);
      d.face([...top, ...bot.slice().reverse()], '#7a5a3a', '#2a1a0a');
      for (let x = -2.8; x < 3.0; x += 0.45) {
        const t = Math.abs(x) / 3.2;
        h.line([x, -0.95 * (1 - t ** 4 * 0.9), z0 + 0.72 + t ** 2 * 0.4],
          [x, 0.95 * (1 - t ** 4 * 0.9), z0 + 0.72 + t ** 2 * 0.4], '#6a4a2c');
      }
      d.face([...bot, ...bot.slice().reverse().map(([x, y]) => [x, y + 0.22 * (1 - (x / 3.2) ** 2), z0 + 0.04 + (x / 3.2) ** 2 * 0.3])],
        '#6a4a2c', '#2a1a0a');
      h.pline(bot, '#8a6440', 2);
      /* 短桅 / 橹 */
      h.line([1.6, 0, z0 + 0.9], [1.6, 0, z0 + 3.2], '#4a3020', 3);
      h.line([1.6, 0, z0 + 3.0], [-2.8, 0, z0 + 1.2], '#3a2a1a');
      h.line([-2.9, 0.15, z0 + 1.0], [-3.5, 0.35, z0 - 0.15], '#4a3020', 2);
      if (canopy) {
        const ar = (x) => {
          const pts = [];
          for (let i = 0; i <= 8; i++) {
            const a = Math.PI * i / 8;
            pts.push([x, -Math.cos(a) * 0.85, z0 + 0.85 + Math.sin(a) * 0.95]);
          }
          return pts;
        };
        const A0 = ar(-0.8), A1 = ar(1.2);
        for (let i = 0; i < 8; i++) d.face([A0[i], A1[i], A1[i + 1], A0[i + 1]], i < 4 ? '#8a7448' : '#a08a58', '#4a3a20');
        for (let x = -0.6; x < 1.2; x += 0.4) h.pline(ar(x).slice(0, 5), '#5a4a28');
      } else {
        /* 敞舱货箱 */
        X.crateMod(d, -0.6, -0.45, z0 + 0.85, 0.1, 0.45, '#a08050', 0.32);
        X.crateMod(d, 0.2, -0.4, z0 + 0.85, 0.9, 0.35, '#8a6a3a', 0.28);
        d.box(0.3, -0.35, z0 + 1.17, 0.75, 0.05, z0 + 1.42, '#c8b27a', { line: '#6a5a3a' });
      }
      for (let k = 0; k < 2; k++) h.line([-2.4 + k * 2.8, -1.15, z0 + 0.02], [-1.6 + k * 2.8, -1.15, z0 + 0.02], '#9ac0c8');
      /* Site201：小舫船灯 */
      X.lantern(d, 1.55, 0.35, z0 + 2.55, { r: 0.1, cord: 0.14, col: canopy ? '#c8322c' : '#e07030' });
      if (!canopy) X.lantern(d, -0.5, -0.55, z0 + 1.55, { r: 0.09, cord: 0.1, col: '#d04028' });
    },
    emit(d, st, v) {
      const z0 = -0.25, canopy = v !== 'b';
      X.lanternGlow(d, 1.55, 0.35, z0 + 2.55, { r: 0.11, cord: 0.14, boost: 1.55, col: '#ffc878', water: true, waterY: -1.05 });
      if (!canopy) X.lanternGlow(d, -0.5, -0.55, z0 + 1.55, { r: 0.1, cord: 0.1, boost: 1.65, col: '#ffb060', water: true, waterY: -1.0 });
    },
  });

  /* —— 岸边货堆：木箱叠码 + 粮袋丘 + 偶尔遮阳草棚 —— */
  A.define('aq_cargo', {
    name: '岸边货堆',
    variants: ['crates', 'sacks', 'mixed'],
    geo: [-1.8, -1.4, 0, 1.8, 1.4, 2.4],
    fp: [[-1.5, -1.1, 1.5, 1.1]],
    prune: true,
    draw(d, st, v) {
      const h = H(d), kind = v || 'mixed';
      const cols = ['#a08050', '#8a6a3a', '#c8b27a', '#6a4a2a', '#b8a26a', '#7a5a3a'];
      /* 浅台泥地垫脚 */
      d.box(-1.55, -1.15, -0.02, 1.55, 1.15, 0.06, '#8a7a5a', { line: shade(STONE, 0.55), top: '#9a8a68', west: STONE_W });
      if (kind === 'crates' || kind === 'mixed') {
        const stack = [
          [-1.3, -0.9, 0.08, -0.55, -0.25, 0.48],
          [-0.5, -0.95, 0.08, 0.2, -0.3, 0.42],
          [0.35, -0.85, 0.08, 1.15, -0.2, 0.5],
          [-1.15, -0.85, 0.48, -0.65, -0.35, 0.88],
          [0.45, -0.75, 0.5, 1.0, -0.25, 0.92],
          [-0.35, 0.15, 0.08, 0.45, 0.95, 0.46],
          [0.55, 0.2, 0.08, 1.25, 0.9, 0.44],
        ];
        stack.forEach(([x0, y0, z0, x1, y1, z1], i) => {
          if (kind === 'mixed' && i >= 5) return;
          X.crateMod(d, x0, y0, z0, x1, y1, cols[i % cols.length], z1 - z0);
          if (i < 3) d.box(x0 + 0.08, y0 + 0.08, z1, x1 - 0.08, y1 - 0.08, z1 + 0.02, shade(cols[i % cols.length], 0.7));
        });
      }
      if (kind === 'sacks' || kind === 'mixed') {
        const pals = [['#c8b27a', '#b8a26a', '#d4c08a'], ['#a89060', '#988050', '#b8a070'], ['#d4c08a', '#c8b27a', '#e0d09a']];
        const heaps = kind === 'sacks'
          ? [[-1.2, -0.85, 1.2, 0.85, 0.1], [-0.9, -0.55, 0.9, 0.55, 0.55]]
          : [[-0.2, 0.1, 1.35, 1.05, 0.1], [0.1, 0.25, 1.1, 0.9, 0.42]];
        heaps.forEach(([x0, y0, x1, y1, z], i) => {
          d.heap(x0, y0, x1, y1, z, pals[i % pals.length], 0.9, { size: 3, step: 0.09, mound: 0.22 });
        });
        /* 立袋口绳结 */
        for (const [x, y] of [[-0.7, -0.4], [0.6, 0.5], [0.2, -0.2]]) {
          d.box(x - 0.18, y - 0.14, 0.08, x + 0.18, y + 0.14, 0.55, '#c8b27a', { line: '#6a5a3a', top: '#d4c08a' });
          h.line([x, y, 0.55], [x, y, 0.72], '#5a4a2a', 2);
          h.blob(x, y, 0.74, 2, 2, '#6a5a3a', '#3a2a1a');
        }
      }
      if (kind === 'mixed') {
        /* 矮草棚遮阳（参照茅檐摊） */
        for (const [x, y] of [[-1.35, 1.0], [1.35, 1.0], [-1.35, -0.2], [1.35, -0.2]]) {
          d.box(x - 0.05, y - 0.05, 0.06, x + 0.05, y + 0.05, 1.55, WOOD_D, { line: '#2a1a0a' });
        }
        X.awningStripe(d,
          [[-1.5, -0.35, 1.45], [1.5, -0.35, 1.45], [1.5, 1.15, 1.75], [-1.5, 1.15, 1.75]],
          ['#8a7448', '#c8b890', '#8a7448', '#c8b890', '#8a7448', '#c8b890'],
          { valance: false });
      }
      /* 角落小灯笼提示河市 */
      if (kind !== 'sacks') X.lantern(d, 1.25, 0.95, 1.35, { r: 0.1, cord: 0.12, col: '#c8322c' });
      if (kind === 'mixed') X.lantern(d, -1.2, -0.85, 1.65, { r: 0.09, cord: 0.1, col: '#d04028' });
    },
    emit(d, st, v) {
      /* Site201：岸边货堆码头灯 — lanternGlow（贴岸，地面落光为主） */
      const kind = v || 'mixed';
      if (kind !== 'sacks') X.lanternGlow(d, 1.25, 0.95, 1.35, { r: 0.11, cord: 0.12, boost: 1.45, col: '#ffc878' });
      if (kind === 'mixed') X.lanternGlow(d, -1.2, -0.85, 1.65, { r: 0.1, cord: 0.1, boost: 1.4, col: '#ffd090' });
    },
  });

  /* —— densify place：码头/船/货堆/岸边推车（保留既有 zhou_deck / dock_* / boat*） —— */
  const Dock = {
    place(put, ctx) {
      const CX = (ctx && ctx.CX) || 150;
      const counts = { dock: 0, boat: 0, skiff: 0, cargo: 0, cart: 0 };

      /* 南岸码头（平台向南，put 点贴水线 y≈96–100）与北岸（y≈112–116） */
      const docks = [
        [18, 100], [90, 98], [130, 100], [170, 98], [210, 100], [270, 98],
        [60, 114], [110, 116], [150, 114], [190, 116], [260, 114],
        [CX - 28, 100], [CX + 16, 114],
      ];
      docks.forEach(([x, y], i) => {
        put('dock_d_' + i, 'aq_dock', x, y);
        counts.dock++;
      });

      /* 漕船加密：错开既有 boat1/2/3，贴航道两侧 */
      const boats = [
        [30, 104], [50, 106], [95, 103], [120, 105], [145, 104],
        [175, 106], [220, 103], [275, 105],
        [80, 108], [160, 108], [235, 107],
      ];
      boats.forEach(([x, y], i) => {
        put('boat_d_' + i, 'aq_boat', x, y);
        counts.boat++;
      });

      /* 小舫：更密一档，填漕船空档 */
      const skiffs = [
        [42, 102], [62, 107], [85, 101], [108, 106], [135, 102],
        [155, 107], [185, 101], [205, 106], [230, 102], [255, 107],
        [288, 103], [22, 107], [CX - 2, 105], [CX + 28, 103],
        [72, 110], [168, 110], [248, 109],
      ];
      skiffs.forEach(([x, y], i) => {
        put('skiff_d_' + i, 'aq_skiff', x, y, { variant: i % 3 === 0 ? 'b' : 'a' });
        counts.skiff++;
      });

      /* 岸边货堆：贴码头外侧（南岸 y≈90–94，北岸 y≈118–122），避开虹桥落点 */
      const cargos = [
        [22, 92, 'crates'], [48, 90, 'sacks'], [85, 92, 'mixed'], [115, 90, 'crates'],
        [155, 92, 'sacks'], [185, 90, 'mixed'], [215, 92, 'crates'], [255, 90, 'sacks'],
        [278, 92, 'mixed'], [35, 118, 'crates'], [75, 120, 'mixed'], [105, 118, 'sacks'],
        [145, 120, 'crates'], [175, 118, 'mixed'], [205, 120, 'sacks'], [245, 118, 'crates'],
        [268, 120, 'mixed'], [CX - 18, 90, 'mixed'], [CX + 20, 90, 'crates'],
        [CX - 22, 120, 'sacks'], [CX + 24, 118, 'mixed'],
        [58, 94, 'crates'], [198, 94, 'sacks'], [128, 122, 'crates'],
      ];
      cargos.forEach(([x, y, v], i) => {
        put('cargo_d_' + i, 'aq_cargo', x, y, { variant: v });
        counts.cargo++;
      });

      /* 独轮推车贴货堆（参照粮堆旁推车） */
      const carts = [
        [50, 88], [90, 94], [160, 88], [220, 94], [260, 88],
        [40, 122], [100, 116], [180, 122], [240, 116],
        [CX - 14, 94], [CX + 14, 88],
      ];
      carts.forEach(([x, y], i) => {
        put('cart_d_' + i, 'aq_cart', x, y);
        counts.cart++;
      });

      return counts;
    },
  };

  Dock.site201 = { riverLamps: true, boatLampGlow: true, dockLampGlow: true, waterReflect: true, reuseLanternGlow: true };
  root.SongchengDock = Dock;
})(typeof window !== 'undefined' ? window : globalThis);
