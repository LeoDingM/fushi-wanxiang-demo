/* 南埠中高层的小构件 (Leo 2026-10-24 22:45；2026-10-26 腰收).
 * 临涌五栋的玻璃幕墙不新开图集页，白天盖在已有墙框上，夜窗按开间点亮。见 rongqiao_skyline.js。
 * 菱格斜撑和夜间灯冠仍不画。压顶不发光。名字未经 Leo 确认。 */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A || !A.define) return;
  const BRONZE = '#c4a574', INK = '#3a2e24', WHITE = '#f7f4ee', PALE = '#e7f4ee', CORAL = '#e07a5f';
  const prop = (type, name, geo, draw, emit) => A.define(type, {
    name, geo, shadow: false, noShadow: true, fp: [], prune: true, pad: 1, draw, emit,
  });
  prop('rq_nb_fin', '南埠玻璃竖挺', [0, -0.2, 0.15, 0.48, 0.06, 2.55], (d) => {
    d.box(0.02, -0.18, 0.18, 0.44, 0.0, 2.5, BRONZE, { line: '#8a6a3e' });
  });
  prop('rq_nb_balc', '南埠阳台', [0, -0.62, 0.02, 2.85, -0.02, 0.95], (d) => {
    d.box(0.12, -0.56, 0.06, 2.72, -0.04, 0.22, WHITE, { line: '#e7e0d4' });
    d.box(0.12, -0.56, 0.22, 2.72, -0.42, 0.32, BRONZE);
    d.seg([0.2, -0.56, 0.32], [0.2, -0.56, 0.9], INK, 2);
    d.seg([2.64, -0.56, 0.32], [2.64, -0.56, 0.9], INK, 2);
    d.seg([0.2, -0.56, 0.9], [2.64, -0.56, 0.9], INK, 2);
  });
  prop('rq_nb_cap', '南埠收进压边', [0, -0.22, 0, 3, 0.28, 0.48], (d) => {
    d.box(0, -0.16, 0, 3, 0.22, 0.28, WHITE, { line: '#e7e0d4' });
    d.box(0, -0.2, 0.22, 3, 0.16, 0.4, BRONZE);
  });
  prop('rq_nb_canopy', '南埠中心雨棚', [0, -1.15, 0, 4.4, 0.06, 0.42], (d) => {
    d.box(0.2, -1.05, 0, 0.36, -0.9, 0.28, INK);
    d.box(4.04, -1.05, 0, 4.2, -0.9, 0.28, INK);
    d.box(0.05, -1.12, 0.26, 4.35, 0.04, 0.4, BRONZE, { line: '#8a6a3e' });
    d.face([[0.15, -1.05, 0.34], [4.25, -1.05, 0.34], [4.25, 0, 0.4], [0.15, 0, 0.4]], PALE, BRONZE);
  });
  prop('rq_nb_crown', '南埠中心珊瑚压顶', [0, -0.34, 0, 3, 0.08, 0.46], (d) => {
    d.box(0, -0.28, 0.02, 3, 0.02, 0.24, CORAL, { line: '#b85a42' });
    d.box(0, -0.32, 0.2, 3, 0.04, 0.4, BRONZE, { line: '#8a6a3e' });
  });
})(typeof window !== 'undefined' ? window : globalThis);
