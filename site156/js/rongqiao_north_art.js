/* P2 art: 施工围挡 (construction hoarding) panels around the unbuilt plots of the 榕桥区 north expansion.
 * 3 m panels, 2.35 m high, painted steel frame on a concrete kerb; four printed variants (city-renewal slogan, skyline
 * graphic, plain green mesh, safety slogan). rq_hoard_s runs along +x (south face visible), rq_hoard_w along +y (west face). */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A) return;
  const GREEN = '#2f7d4f', DGREEN = '#215c3a', WHITE = '#eef0ea', CAP = '#4a5257';
  /** draw one panel on a vertical face; at(u, z) -> world point, u along the reading direction 0..3 */
  function panel(d, at, v, west) {
    const F = (u0, z0, u1, z1, fill, line) => d.face([at(u0, z0), at(u1, z0), at(u1, z1), at(u0, z1)], fill, line);
    F(0, 0, 3, 0.18, '#9c9a92', '#6c6a64');                                          // concrete kerb
    if (v === 'c') {
      F(0.04, 0.18, 2.96, 2.2, GREEN, DGREEN);
      for (let u = 0.25; u < 2.9; u += 0.25) d.seg(at(u, 0.22), at(u, 2.16), '#3d9461');
      for (let z = 0.4; z < 2.15; z += 0.3) d.seg(at(0.08, z), at(2.92, z), '#3d9461');
      F(0.8, 1.15, 2.2, 1.5, WHITE, DGREEN); d.text('文明施工', ...at(0.88, 1.21), 9, DGREEN, { west });
    } else if (v === 'b') {
      F(0.04, 0.18, 2.96, 2.2, '#cfe4f0', '#5d7f8f');
      F(0.04, 1.6, 2.96, 2.2, '#a9d1ea'); F(0.04, 1.95, 2.96, 2.2, '#93c3e3');
      const sky = [[0.2, 0.9, 1.55], [0.65, 0.9, 1.25], [0.95, 1.3, 1.9], [1.25, 1.55, 1.4], [1.6, 1.95, 1.75], [2.05, 2.3, 1.35], [2.35, 2.8, 1.6]];
      for (const [a, b, h] of sky) { F(a, 0.7, b, h, '#e9f2f6', '#9fb9c6'); for (let z = 0.85; z < h - 0.1; z += 0.18) for (let u = a + 0.07; u < b - 0.06; u += 0.12) d.face([at(u, z), at(u + 0.05, z), at(u + 0.05, z + 0.08), at(u, z + 0.08)], '#8fb7cc'); }
      F(0.04, 0.18, 2.96, 0.75, '#5fae5a', '#3e7f3c'); d.face([at(0.04, 0.75), at(0.9, 0.95), at(1.7, 0.78), at(2.4, 0.98), at(2.96, 0.8), at(2.96, 0.75), at(0.04, 0.75)], '#79c06c');
      F(0.25, 0.28, 2.75, 0.62, GREEN, DGREEN); d.text('建设美丽榕桥', ...at(0.4, 0.35), 10, '#f4f1e2', { west });
    } else if (v === 'd') {
      F(0.04, 0.18, 2.96, 2.2, WHITE, '#9aa29c');
      F(0.04, 0.18, 2.96, 0.55, '#2c5d9a', '#1d3f6b'); F(0.04, 1.75, 2.96, 2.08, '#c8372d', '#8e241d');
      d.text('安全第一  文明施工', ...at(0.18, 1.81), 9, '#fff6e0', { west });
      d.text('榕桥区住房和城乡建设局', ...at(0.22, 1.2), 8, '#2c5d9a', { west });
      d.text('施工单位：榕建集团', ...at(0.22, 0.95), 7, '#555', { west });
    } else {
      F(0.04, 0.18, 2.96, 2.2, WHITE, '#9aa29c');
      F(0.04, 0.18, 2.96, 0.62, GREEN, DGREEN); d.seg(at(0.04, 0.66), at(2.96, 0.66), GREEN, 2);
      d.text('榕桥区城市更新', ...at(0.32, 1.25), 11, DGREEN, { west });
      d.text('老城焕新  共建共享', ...at(0.5, 0.95), 8, '#5b6b60', { west });
    }
    for (const u of [0, 2.94]) F(u, 0.12, u + 0.06, 2.3, '#3a6b4c', '#22402e');              // posts
    F(0, 2.2, 3, 2.35, CAP, '#2c3135');                                                       // cap rail
  }
  A.define('rq_hoard_s', { name: '施工围挡', variants: ['a', 'b', 'c', 'd'], geo: [0, -0.05, 0, 3, 0.05, 2.35], fp: [[0, -0.07, 3, 0.07]], noShadow: false,
    draw(d, st, v) { d.box(0, -0.05, 2.2, 3, 0.05, 2.35, CAP, { line: '#2c3135' }); panel(d, (u, z) => [u, -0.05, z], v, false); } });
  A.define('rq_hoard_w', { name: '施工围挡', variants: ['a', 'b', 'c', 'd'], geo: [-0.05, 0, 0, 0.05, 3, 2.35], fp: [[-0.07, 0, 0.07, 3]],
    draw(d, st, v) { d.box(-0.05, 0, 2.2, 0.05, 3, 2.35, CAP, { line: '#2c3135' }); panel(d, (u, z) => [-0.05, 3 - u, z], v, true); } });
})(typeof window !== 'undefined' ? window : globalThis);
