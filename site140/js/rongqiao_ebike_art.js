/* Realistic parked e-bikes (Leo 2026-10-18 00:08, "做得一点都不像真的"): replaces the block-built rq_ebikes rows and re-skins the
 * kit p_ebike scooter with js/ebike_art.js (step-through 电动车 with wheels, mudguards, footboard, seat, mirrors, lights, rack;
 * 外卖箱 / 挡风被 / 遮阳棚 / 自行车式 / 共享 variants). Rows stand in loose lines at slight angles; each bike casts its own
 * silhouette shadow (shadowOf). Variant choice per object: src/rongqiao_ebikes.js (variant only — save contract untouched).
 * Colours, styles and mixes 未经Leo确认. */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A) return;
  const E = () => root.EBikeArt;
  // rq_ebikes rows: 3 bikes in a 2.6 x 1.6 m bay (geo unchanged), nose toward +y (shop side) or -y (kerb side)
  const ROWS = {
    a: { seed: 11, styles: ['scooter', 'scooter', 'delivery', 'scooter'] },
    b: { seed: 23, styles: ['scooter', 'quilt', 'bicycle', 'scooter'] },
    c: { seed: 37, styles: ['delivery', 'delivery', 'scooter'] },
    d: { seed: 41, styles: ['canopy', 'scooter', 'quilt'] },
    e: { seed: 53, styles: ['bicycle', 'scooter', 'bicycle'] },
    f: { seed: 67, styles: ['scooter', 'canopy', 'delivery', 'scooter'], nose: -1 },
    g: { seed: 79, styles: ['quilt', 'scooter', 'scooter'], n: 2 },
    h: { seed: 83, styles: ['shared'], nose: 1 },
  };
  const VARS = Object.keys(ROWS);
  function rowFor(v) {
    const R = ROWS[v] || ROWS.a, e = E(); if (!e) return [];
    const n = R.n || 3, list = e.row(R.seed * 7919, n, { x0: n === 2 ? 0.7 : 0.45, dx: n === 2 ? 1.1 : 0.85, y: 0.8, styles: R.styles, nose: R.nose });
    if (v === 'h') list.forEach((b) => { b.col = '#f4f4ef'; b.acc = '#f2c230'; b.a = Math.PI / 2 + (b.a - Math.PI / 2) * 0.3; });
    return list.sort((p, q) => (q.x + q.y) - (p.x + p.y));
  }
  A.define('rq_ebikes', { name: '电动车', variants: VARS, geo: [0, 0, 0, 2.6, 1.6, 1.1], paintBox: [-0.4, -0.4, 0, 3.0, 2.0, 1.95], pad: 6,
    draw(d, st, v) { const e = E(); if (!e) return; for (const b of rowFor(v)) e.draw(d.g, d.P, b); },
    shadowOf(st, v) { const e = E(), rows = rowFor(v); return e && rows.length ? rows.map((b) => e.shadow(b)) : A.shadowPoly([0, 0, 0, 2.6, 1.6, 1.1]); } });
  // kit p_ebike re-skins (rots 0/2/4/6; heading = pi + rot * 45deg, i.e. rot 0 noses toward -x like the kit sprite)
  const SK = {
    eb_w: { style: 'scooter', col: '#f1f1ec' }, eb_r: { style: 'scooter', col: '#c8312c' }, eb_b: { style: 'scooter', col: '#3d86c6' },
    eb_k: { style: 'scooter', col: '#2a2c30' }, eb_p: { style: 'scooter', col: '#e88fae' }, eb_dl: { style: 'delivery', col: '#27406b', acc: '#f2b705' },
    eb_dl2: { style: 'delivery', col: '#f1f1ec', acc: '#2f7fd8' }, eb_qt: { style: 'quilt', col: '#d9c49a', seed: 2 }, eb_cn: { style: 'canopy', col: '#5bbfa5', acc: '#2f6fb3' },
    eb_bc: { style: 'bicycle', col: '#27406b' }, eb_sh: { style: 'shared', col: '#f4f4ef', acc: '#f2c230' },
  };
  const bikeOf = (v, rot) => Object.assign({ x: 0, y: 0, a: Math.PI + rot * Math.PI / 4 }, SK[v]);
  A.skin('p_ebike', { variants: Object.keys(SK), states: ['default'], rots: [0, 2, 4, 6], pad: 6,
    geo: () => [-1.15, -1.15, 0, 1.15, 1.15, 1.95],
    draw(d, st, v, rot) { const e = E(); if (e) e.draw(d.g, d.P, bikeOf(v, rot)); },
    shadowOf(rot, st, v) { const e = E(); return e ? e.shadow(bikeOf(v, rot)) : [[-0.8, -0.3], [0.8, -0.3], [0.9, 0.8], [-0.7, 0.8]]; } });
  /* objects still on the kit 'base' variant (lazily loaded chunks such as east.js) get the realistic white scooter too:
   * after the district atlas is composed, the base frames (+ shadows, masks) alias the eb_w skin. */
  function aliasBase() {
    const SP = root.SP, F = SP && SP.K && SP.K.frames; if (!F) return 0; let n = 0;
    for (const rot of [0, 2, 4, 6]) for (const sfx of ['', '#shadow']) { const src = `p_ebike/eb_w/main/default/${rot}${sfx}`, dst = `p_ebike/base/main/default/${rot}${sfx}`; if (F[src]) { F[dst] = F[src].slice(); if (SP.K.masks && SP.K.masks[src]) SP.K.masks[dst] = SP.K.masks[src]; n++; } }
    return n;
  }
  const SP = root.SP, load0 = SP && SP.load;
  if (typeof load0 === 'function') SP.load = function () { return Promise.resolve(load0.apply(this, arguments)).then((r) => { try { A.EBIKES.aliased = aliasBase(); } catch (e) { console.warn('ebike alias', e); } return r; }); };
  A.EBIKES = { ROWS, VARS, SKINS: Object.keys(SK), rowFor, aliasBase, aliased: 0 };
})(typeof window !== 'undefined' ? window : globalThis);
