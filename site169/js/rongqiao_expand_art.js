/* 榕桥区 expansion E1 art: street-life details for the new north / south / west blocks.
 * Shop and venue signboards (S face rq_x_sign_s, W face rq_x_sign_w), planted green (shrubs and flowerbeds so planted ground never
 * reads as bare grass), a public toilet kiosk, a basketball hoop, a kindergarten play set, outdoor fitness bars, a bike shed and
 * the sanitation compactor truck at the transfer station. World orientation, rot 0 only (see rongqiao_art.js). */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A) return;
  const shade = A.shade;
  /* signboard variants: [text, board colour, text colour, second line] (all names 未经Leo确认) */
  const SIGNS = {
    yz: ['邻里驿站', '#1f8a4c', '#ffffff', '快递代收 · 寄件'], sk: ['社区卫生服务中心', '#f4f7f4', '#1d7a44', '井槐街道 · 社康'],
    yy: ['榕桥大药房', '#2b9a5a', '#ffffff', '医保定点'], ly: ['粮油副食', '#c8372d', '#fff3c8', ''], wj: ['五金水电', '#2a5ea8', '#ffffff', '配钥匙 · 修锁'],
    mn: ['云吞面', '#e2b628', '#8e1f16', '牛腩 · 猪脚'], cf: ['肠粉早餐', '#f0e6c8', '#a2271c', '豆浆 · 白粥'], sg: ['生果', '#e8792a', '#ffffff', '时令水果'],
    lf: ['阿强理发', '#3b3b44', '#f1f1f1', '剪发 15元'], bl: ['街坊便利店', '#d43b2f', '#ffffff', '24小时'], ts: ['糖水铺', '#f6d1d8', '#a8324a', '双皮奶 · 绿豆沙'],
    xs: ['手机维修', '#20304c', '#7fd0ff', '贴膜 · 换屏'], zy: ['中医推拿', '#7a3a1e', '#f6e2b0', '针灸 · 理疗'], ye: ['井槐里幼儿园', '#fff3d6', '#e0572a', '快乐成长'],
    wc: ['公共厕所', '#2f6db3', '#ffffff', 'WC'], lj: ['垃圾转运站', '#2f7d4f', '#ffffff', '榕桥区环卫'], cy: ['茶餐厅', '#a3242a', '#ffe7a6', '奶茶 · 菠萝包'],
    yj: ['烟酒茶', '#5b2a86', '#ffe28a', ''], xx: ['井槐第一小学', '#f7f2e4', '#b0241c', '校门'], hy: ['槐北花园', '#e9e3d2', '#7a5a2a', '小区入口'],
    sh: ['居委会', '#c8372d', '#fff3c8', '井槐北里社区'], gx: ['干洗', '#e9f1f7', '#2a5ea8', '洗衣 · 改衣'],
    // E4 school-gate shops (2026-10-18, 未经Leo确认)
    wd: ['学林文具', '#1f6fb8', '#ffffff', '文具 · 教辅'], zc: ['早餐包点', '#f2c230', '#8a2414', '包子 · 豆浆'], tg: ['小书虫托管', '#ff8a3d', '#ffffff', '午托 · 晚托'],
    yg: ['渔具', '#6b3a22', '#f6e2b0', '渔网 · 绳索'], hx: ['海鲜排档', '#a3242a', '#ffe7a6', '现捞 · 现煮'], cp: ['茶铺', '#1f6b4a', '#f4efe2', '老茶 · 盖碗'],
    hb: ['杭本', '#2a3f6b', '#f4efe2', '线装 · 旧书'], mz: ['妈祖庙', '#8e1f16', '#ffe7a6', ''],
  };
  const KEYS = Object.keys(SIGNS);
  const hashSeed = (d) => Math.floor(d.R() * 1e9);
  function ring(d, x, y, z, r, col) { const c = d.P(x, y, z), g = d.g; g.beginPath(); g.ellipse(c[0], c[1], r * A.KX * 1.414, r * A.KY * 1.414, 0, 0, Math.PI * 2); g.strokeStyle = col; g.lineWidth = 1; g.stroke(); }
  function board(d, at, v, west) {
    const [t, bg, fg, sub] = SIGNS[v] || SIGNS.ly, F = (u0, z0, u1, z1, fill, line) => d.face([at(u0, z0), at(u1, z0), at(u1, z1), at(u0, z1)], fill, line);
    F(0.08, 0, 2.92, 0.62, bg, shade(bg, 0.5)); F(0.08, 0, 2.92, 0.05, shade(bg, 0.7));
    const size = t.length > 6 ? 9 : t.length > 4 ? 11 : 13, w = d.textW(t, size), u = Math.max(0.12, 1.5 - w / 2 * (west ? 1 : 1));
    d.text(t, ...at(u, sub ? 0.27 : 0.18), size, fg, { west });
    if (sub) { const w2 = d.textW(sub, 7); d.text(sub, ...at(Math.max(0.15, 1.5 - w2 / 2), 0.08), 7, fg, { west, weight: 'normal' }); }
    if (v === 'sk' || v === 'yy') { F(0.18, 0.18, 0.42, 0.44, '#1d9a4a'); F(0.26, 0.12, 0.34, 0.5, '#1d9a4a'); F(0.22, 0.27, 0.38, 0.35, '#ffffff'); }
  }
  A.define('rq_x_sign_s', { name: '招牌', variants: KEYS, geo: [0, -0.58, 0, 3, -0.34, 0.62], fp: [], noShadow: true,
    draw(d, st, v) { d.box(0.08, -0.58, 0, 2.92, -0.34, 0.62, shade((SIGNS[v] || SIGNS.ly)[1], 0.8), { noS: true }); board(d, (u, z) => [u, -0.58, z], v, false); } });
  A.define('rq_x_sign_w', { name: '招牌', variants: KEYS, geo: [-0.58, 0, 0, -0.34, 3, 0.62], fp: [], noShadow: true, prune: true,
    draw(d, st, v) { d.box(-0.58, 0.08, 0, -0.34, 2.92, 0.62, shade((SIGNS[v] || SIGNS.ly)[1], 0.8), { noW: true }); board(d, (u, z) => [-0.58, 3 - u, z], v, true); } });
  /* shrubs: 杜鹃 (pink), 黄杨球 (box ball), 红叶石楠 (red-tipped photinia), 三角梅 (bougainvillea), 散尾葵 (areca palm clump), 龟背竹 */
  const SHRUB = { dj: ['#3f7a3a', '#e86aa0'], hy: ['#4f8f3a', null], hs: ['#3d6e34', '#c2382d'], sj: ['#3a6e35', '#c22d8f'], sw: ['#5e9a3c', null], gb: ['#2f6e3a', null] };
  A.define('rq_x_shrub', { name: '灌木', variants: Object.keys(SHRUB), geo: [-0.55, -0.55, 0, 0.55, 0.55, 1.1], fp: [[-0.4, -0.4, 0.4, 0.4]],
    draw(d, st, v) {
      const [leaf, fl] = SHRUB[v], R = d.R;
      if (v === 'sw') { for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; d.seg([0, 0, 0.1], [Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0.75 + R() * 0.35], shade(leaf, 0.7 + R() * 0.4), 2); } return; }
      const pal = [shade(leaf, 0.42), shade(leaf, 0.62), shade(leaf, 0.85), leaf, shade(leaf, 1.2), shade(leaf, 1.42)];
      A.leafCrown(d, { cz: v === 'gb' ? 0.48 : 0.52, rx: 0.44, rz: v === 'gb' ? 0.32 : 0.4, pal, lobes: v === 'gb' ? 5 : 4, n: 0.7 });
      if (fl) A.leafCrown(d, { cz: 0.7, rx: 0.3, rz: 0.16, pal: [shade(fl, 0.72), fl, shade(fl, 1.28)], lobes: 3, n: 0.28 });
    } });
  /* flowerbed 3 x 1.2 m with a granite kerb: a 长春花 + 马缨丹, b 鸡冠花 + 万寿菊, c 葱兰 + 美人蕉 */
  const BED = { a: ['#e85f9a', '#f0b229', '#ffffff'], b: ['#c8233a', '#f39a1e', '#f7d23a'], c: ['#f4f4f0', '#e2452c', '#f5c33a'] };
  A.define('rq_x_bed', { name: '花境', variants: ['a', 'b', 'c'], geo: [0, 0, 0, 3, 1.2, 0.75], fp: [[0, 0, 3, 1.2]],
    draw(d, st, v) {
      const pal = BED[v], R = d.R;
      d.box(0, 0, 0, 3, 1.2, 0.28, '#b9b4a8', { line: '#77736a' }); d.flat(0.12, 0.12, 2.88, 1.08, 0.28, '#5a4632');
      for (let x = 0.25; x < 2.85; x += 0.32) for (let y = 0.25; y < 1.05; y += 0.3) { d.disc(x, y, 0.32, 0.17, shade('#3f7f37', 0.75 + R() * 0.4)); }
      if (v === 'c') for (const x of [0.6, 1.5, 2.4]) { d.seg([x, 0.85, 0.3], [x, 0.85, 0.75], '#3d7a35', 2); d.px(x, 0.85, 0.75, '#e2452c', 3, 3); }
      for (let k = 0; k < 70; k++) d.px(0.2 + R() * 2.6, 0.2 + R() * 0.85, 0.38 + R() * 0.18, pal[(R() * pal.length) | 0], 2, 2);
    } });
  /* public toilet kiosk 6 x 4 m (S face doors 男/女/无障碍, blue tile band) */
  A.define('rq_x_toilet', { name: '公共厕所', geo: [0, 0, 0, 6, 4, 3.5], fp: [[0, 0, 6, 4]],
    draw(d) {
      d.box(0, 0, 0, 6, 4, 3.2, '#ece7dc', { line: '#8e877a' }); d.box(-0.15, -0.15, 3.2, 6.15, 4.1, 3.5, '#6e7a86', { line: '#3e464e' });
      d.face([[0, 0, 0], [6, 0, 0], [6, 0, 0.6], [0, 0, 0.6]], '#9aa2a8', '#62686c'); d.face([[0, 0, 2.55], [6, 0, 2.55], [6, 0, 3.1], [0, 0, 3.1]], '#2f6db3', '#1d477a');
      d.text('公共厕所 WC', 1.25, 0, 2.66, 12, '#ffffff');
      for (const [x, t, c] of [[0.5, '男', '#2f6db3'], [2.55, '女', '#c8372d'], [4.6, '♿', '#2f6db3']]) { d.face([[x, 0, 0], [x + 1, 0, 0], [x + 1, 0, 2.2], [x, 0, 2.2]], '#59636b', '#2f363b'); d.face([[x + 0.1, 0, 0.05], [x + 0.9, 0, 0.05], [x + 0.9, 0, 2.1], [x + 0.1, 0, 2.1]], '#7d8a92'); d.text(t, x + 0.3, 0, 1.6, 10, '#ffffff', { stroke: c }); }
      for (let y = 0.6; y < 3.6; y += 0.9) d.face([[0, y, 2.0], [0, y + 0.6, 2.0], [0, y + 0.6, 2.4], [0, y, 2.4]], '#a9c3d6', '#5e7484');
    } });
  A.define('rq_x_hoop', { name: '篮球架', variants: ['n', 's'], geo: [-0.5, -0.5, 0, 0.5, 1.6, 3.6], fp: [[-0.15, -0.15, 0.15, 0.15]],
    draw(d, st, v) {
      const by = v === 'n' ? 1.25 : -0.25;
      d.box(-0.12, -0.12, 0, 0.12, 0.12, 3.1, '#2f5d8a', { line: '#1b3550' }); d.box(-0.1, 0, 2.95, 0.1, by, 3.08, '#2f5d8a');
      d.box(-0.55, by - 0.04, 2.7, 0.55, by + 0.04, 3.45, '#f4f4f0', { line: '#777' }); d.face([[-0.2, by, 2.8], [0.2, by, 2.8], [0.2, by, 3.1], [-0.2, by, 3.1]], null, '#c8372d', 2);
      ring(d, 0, by + (v === 'n' ? -0.25 : 0.25), 2.8, 0.17, '#e8792a');
    } });
  A.define('rq_x_play', { name: '儿童滑梯', geo: [0, 0, 0, 3, 2, 2.4], fp: [[0, 0, 3, 2]],
    draw(d) {
      for (const [x, y] of [[0.2, 0.2], [1.4, 0.2], [0.2, 1.6], [1.4, 1.6]]) d.box(x, y, 0, x + 0.15, y + 0.15, 2.0, '#e8792a', { line: '#9a4a12' });
      d.box(0.15, 0.15, 1.2, 1.6, 1.8, 1.32, '#2f8ac8', { line: '#1d557a' }); d.box(0.1, 0.1, 2.0, 1.65, 1.85, 2.4, '#e2452c', { line: '#8e231a', top: '#f05a42' });
      d.face([[1.6, 0.5, 1.3], [3, 0.5, 0.05], [3, 1.3, 0.05], [1.6, 1.3, 1.3]], '#f5c33a', '#a07a12');
      for (let z = 0.3; z < 1.2; z += 0.3) d.seg([0.15, 0.4, z], [0.15, 1.4, z], '#2fb35a', 2);
    } });
  A.define('rq_x_fit', { name: '健身器材', geo: [0, 0, 0, 2.4, 0.8, 1.8], fp: [[0, 0.2, 2.4, 0.6]],
    draw(d) {
      for (const x of [0.1, 1.15, 2.2]) d.box(x, 0.3, 0, x + 0.12, 0.42, 1.75, '#f5c33a', { line: '#8f6f10' });
      d.box(0.1, 0.3, 1.6, 2.32, 0.42, 1.72, '#2f6db3', { line: '#1d3f6b' }); d.box(0.4, 0.1, 0.5, 0.9, 0.7, 0.6, '#2f6db3'); d.box(1.5, 0.1, 0.9, 1.9, 0.7, 1.0, '#e2452c');
    } });
  A.define('rq_x_shed', { name: '单车棚', geo: [0, 0, 0, 6, 2.6, 2.4], fp: [[0, 0.1, 6, 2.5]],
    draw(d) {
      const R = d.R;
      const EB = root.EBikeArt;   // 2026-10-18: realistic bikes (Leo 00:08); old ring-and-stick bikes kept only as a no-renderer fallback
      if (EB) { const bikes = EB.row(hashSeed(d), 7, { x0: 0.5, dx: 0.82, y: 1.3, nose: 1, styles: ['scooter', 'bicycle', 'scooter', 'delivery', 'bicycle', 'quilt', 'scooter'] }); bikes.sort((p, q) => (q.x + q.y) - (p.x + p.y)); for (const b of bikes) EB.draw(d.g, d.P, b); }
      else for (let x = 0.4; x < 5.8; x += 0.55) { const c = ['#2f6db3', '#c8372d', '#2a2a2a', '#e2b628', '#3b8f5a'][(R() * 5) | 0]; ring(d, x, 0.9, 0.35, 0.22, '#2a2a2a'); ring(d, x, 1.7, 0.35, 0.22, '#2a2a2a'); d.seg([x, 0.9, 0.4], [x, 1.7, 0.6], c, 2); d.seg([x, 1.6, 0.6], [x, 1.5, 0.95], c, 2); }
      for (const x of [0.1, 5.8]) for (const y of [0.15, 2.3]) d.box(x, y, 0, x + 0.1, y + 0.1, 2.25, '#6e7a86', { line: '#3e464e' });
      d.face([[0, 0, 2.25], [6, 0, 2.25], [6, 2.6, 2.4], [0, 2.6, 2.4]], 'rgba(120,170,200,0.9)', '#3e5a6e'); d.face([[0, 0, 2.12], [6, 0, 2.12], [6, 0, 2.25], [0, 0, 2.25]], '#4a6e86');
    } });
  A.define('rq_x_truck', { name: '压缩式垃圾车', geo: [0, 0, 0, 2.4, 7, 3.0], fp: [[0, 0, 2.4, 7]],
    draw(d) {
      for (const y of [0.9, 4.6, 5.8]) { d.disc(0, y, 0.45, 0.45, '#222', '#111'); }
      d.box(0, 0, 0.45, 2.4, 2.0, 2.6, '#2f7d4f', { line: '#1b4a2e', top: '#3d9461' }); d.face([[0, 0.2, 1.6], [0, 1.6, 1.6], [0, 1.6, 2.4], [0, 0.2, 2.4]], '#9fc6dc', '#4e6e80');
      d.face([[0.2, 0, 1.5], [2.2, 0, 1.5], [2.2, 0, 2.35], [0.2, 0, 2.35]], '#9fc6dc', '#4e6e80');
      d.box(0, 2.2, 0.55, 2.4, 7, 3.0, '#e9eee8', { line: '#7c847e', top: '#f4f7f2' }); d.face([[0, 2.2, 1.1], [0, 7, 1.1], [0, 7, 1.5], [0, 2.2, 1.5]], '#2f7d4f');
      d.text('榕桥环卫', -0.0, 6.2, 1.9, 11, '#2f7d4f', { west: true });
    } });
  A.SIGN_VARIANTS = KEYS;
})(typeof window !== 'undefined' ? window : globalThis);
