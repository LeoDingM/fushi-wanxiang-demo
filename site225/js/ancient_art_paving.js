/* Site202：鹰山宋城御街/广场铺地砖纹、排水沟、路牙（atlas kitbash）。
 * aq_gpave 地面图例替换现代 g_sidewalk；aq_drain / aq_curb 贴御街与南广场边线。
 * 只古城；不改勾栏/宝相寺大布局；不进学校/渔村/石驳岸。名称与色值未经确认。 */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A) return;
  const { shade, C, H } = root.AncientCore || {};
  if (!C) return;
  const STONE = C.STONE, STONE_W = C.STONE_W;
  const PAVE = '#a8a296';
  const PAVE_D = '#8e887c';
  const PAVE_L = '#c4beb0';
  const MORTAR = '#7a7468';
  const DRAIN = '#5a554c';
  const DRAIN_WET = '#3a4a52';
  const CURB = '#9a9488';

  /* —— 地面砖纹（方砖 / 条石 / 席纹） —— */
  A.define('aq_gpave', {
    name: '宋城铺地',
    layer: 'ground',
    states: ['a', 'b', 'c'],
    geo: [0, 0, 0, 2, 2, 0],
    draw(d, st) {
      const R = d.R;
      const base = st === 'b' ? PAVE_D : (st === 'c' ? mixPave(PAVE, PAVE_L, 0.35) : PAVE);
      d.flat(0, 0, 2, 2, 0, base);
      if (st === 'a') {
        /* 方砖：约 0.5 m 网格 + 错缝污渍 */
        for (let x = 0; x <= 2.01; x += 0.5) d.seg([x, 0.02, 0], [x, 1.98, 0], shade(MORTAR, 0.95));
        for (let y = 0; y <= 2.01; y += 0.5) d.seg([0.02, y, 0], [1.98, y, 0], shade(MORTAR, 1.05));
        for (let k = 0; k < 7; k++) {
          const x = R() * 1.7, y = R() * 1.7;
          d.flat(x, y, x + 0.18 + R() * 0.2, y + 0.12 + R() * 0.15, 0, shade(base, 0.88 + R() * 0.2));
        }
      } else if (st === 'b') {
        /* 条石：纵向长条（御街中线） */
        for (let x = 0.35; x < 2; x += 0.7) d.seg([x, 0.02, 0], [x, 1.98, 0], shade(MORTAR, 0.9));
        for (let y = 0; y <= 2.01; y += 1.0) d.seg([0.02, y, 0], [1.98, y, 0], shade(MORTAR, 1.08));
        /* 轻微磨损高光 */
        for (let k = 0; k < 4; k++) {
          const x = 0.1 + R() * 1.6, y = 0.15 + R() * 1.6;
          d.seg([x, y, 0], [x + 0.4 + R() * 0.3, y + (R() - 0.5) * 0.05, 0], 'rgba(220,210,190,0.35)');
        }
      } else {
        /* 席纹 / 人字斜铺（广场装饰带） */
        for (let i = -2; i < 6; i++) {
          const x0 = i * 0.55;
          d.seg([x0, 0.05, 0], [x0 + 1.9, 1.95, 0], shade(MORTAR, 0.92));
          d.seg([x0 + 1.9, 0.05, 0], [x0, 1.95, 0], shade(MORTAR, 0.88));
        }
        for (let k = 0; k < 6; k++) {
          const x = R() * 1.6, y = R() * 1.6;
          d.flat(x, y, x + 0.25, y + 0.18, 0, shade(base, k % 2 ? 0.92 : 1.08));
        }
      }
      /* 共用微尘 / 苔点 */
      for (let k = 0; k < 5; k++) {
        const x = R() * 1.9, y = R() * 1.9;
        d.flat(x, y, x + 0.06, y + 0.05, 0, shade(base, 0.75));
      }
    },
  });

  function mixPave(a, b, t) {
    /* tiny local mix without depending on A.mix availability order */
    const parse = (h) => {
      const s = h.replace('#', '');
      return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
    };
    const A0 = parse(a), B0 = parse(b);
    const r = Math.round(A0[0] + (B0[0] - A0[0]) * t);
    const g = Math.round(A0[1] + (B0[1] - A0[1]) * t);
    const bl = Math.round(A0[2] + (B0[2] - A0[2]) * t);
    return '#' + [r, g, bl].map((n) => n.toString(16).padStart(2, '0')).join('');
  }

  /* —— 排水沟（贴街边浅槽 + 石盖板缝） —— */
  A.define('aq_drain', {
    name: '宋城排水沟',
    variants: ['ns', 'ew'],
    geo: [-0.35, -1.1, -0.08, 0.35, 1.1, 0.22],
    fp: [[-0.3, -1.0, 0.3, 1.0]],
    layer: 'sorted',
    noShadow: true,
    draw(d, st, v) {
      const AT = root.AncientAtlas;
      const ew = v === 'ew';
      if (AT && typeof AT.stamp === 'function') {
        /* atlas kitbash：排水沟模块沿长轴 stamp，禁纯线稿 */
        const n = 3;
        for (let i = 0; i < n; i++) {
          const t = (i - (n - 1) / 2) * 0.72;
          if (ew) AT.stamp(d, 'drain_gutter', t - 0.35, -0.15, 0, { sx: 1, sy: 1 });
          else AT.stamp(d, 'drain_gutter', -0.15, t - 0.35, 0, { sx: 1, sy: 1 });
        }
        return;
      }
      /* fallback（atlas 未就绪时） */
      if (ew) {
        d.box(-1.05, -0.28, -0.06, 1.05, 0.28, 0.04, DRAIN, { line: shade(DRAIN, 0.5), top: DRAIN_WET, west: shade(DRAIN, 0.75) });
        d.box(-1.05, -0.32, 0.04, 1.05, -0.18, 0.14, CURB, { line: shade(CURB, 0.5), top: shade(CURB, 1.1) });
        d.box(-1.05, 0.18, 0.04, 1.05, 0.32, 0.14, CURB, { line: shade(CURB, 0.5), top: shade(CURB, 1.1) });
      } else {
        d.box(-0.28, -1.05, -0.06, 0.28, 1.05, 0.04, DRAIN, { line: shade(DRAIN, 0.5), top: DRAIN_WET, west: shade(DRAIN, 0.75) });
        d.box(-0.32, -1.05, 0.04, -0.18, 1.05, 0.14, CURB, { line: shade(CURB, 0.5), top: shade(CURB, 1.1) });
        d.box(0.18, -1.05, 0.04, 0.32, 1.05, 0.14, CURB, { line: shade(CURB, 0.5), top: shade(CURB, 1.1) });
      }
    },
  });

  /* —— 路牙（石条路缘） —— */
  A.define('aq_curb', {
    name: '宋城路牙',
    variants: ['ns', 'ew'],
    geo: [-0.22, -0.9, 0, 0.22, 0.9, 0.28],
    fp: [[-0.18, -0.85, 0.18, 0.85]],
    layer: 'sorted',
    noShadow: true,
    draw(d, st, v) {
      const AT = root.AncientAtlas;
      const ew = v === 'ew';
      if (AT && typeof AT.stamp === 'function') {
        const n = 2;
        for (let i = 0; i < n; i++) {
          const t = (i - (n - 1) / 2) * 0.95;
          if (ew) AT.stamp(d, 'curb_stone', t - 0.45, -0.12, 0, { sx: 1, sy: 1 });
          else AT.stamp(d, 'curb_stone', -0.12, t - 0.45, 0, { sx: 1, sy: 1 });
        }
        return;
      }
      if (ew) {
        d.box(-0.95, -0.16, 0, 0.95, 0.16, 0.22, CURB, { line: shade(CURB, 0.48), west: shade(CURB, 0.78), top: shade(CURB, 1.12), south: shade(CURB, 0.95) });
        for (let x = -0.6; x < 0.9; x += 0.55) d.seg([x, -0.17, 0.02], [x, -0.17, 0.2], shade(CURB, 0.7));
      } else {
        d.box(-0.16, -0.95, 0, 0.16, 0.95, 0.22, CURB, { line: shade(CURB, 0.48), west: shade(CURB, 0.78), top: shade(CURB, 1.12), south: shade(CURB, 0.95) });
        for (let y = -0.6; y < 0.9; y += 0.55) d.seg([-0.17, y, 0.02], [-0.17, y, 0.2], shade(CURB, 0.7));
      }
    },
  });

  root.SongchengPaving = {
    site202: {
      paving: true,
      fangzhuan: true,
      tiaoshi: true,
      xiewen: true,
      drain: true,
      curb: true,
      kitbash: true,
      unconfirmed: true,
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
