/* P1 proof: a small single-storey building with FOUR doors (S, W, N, E) built from existing kit pieces plus the
 * procedural roof, wired into SP.openInterior. Off by default; enable with ?oidemo=1 or SP.openInteriorDemo.build().
 * The demo only adds objects / colliders on the street; the open/close state itself never touches colliders. */
(function (root) {
  'use strict';
  const SP = root.SP; if (!SP || !SP.world || !SP.openInterior) return;
  const W = SP.world, OI = SP.openInterior, ID = 'oi_demo';
  const DEFAULT = { x0: 179, y0: -22.5 };     // E1: the reserved paved lot by the 南关小街 public toilet (x 67 is now a shop block)
  const WD = 9, DP = 6, T = 0.35;
  function alias() {
    const K = SP.K; if (K.pieces.oi_shopdoor || !K.pieces.f_shop) return;
    const P = K.pieces.f_shop; K.pieces.oi_shopdoor = Object.assign({}, P, { states: ['door'], footprint: [], footprint_states: null, name: '示范楼玻璃门' });
    for (const k of Object.keys(K.frames)) { const m = /^f_shop\/([^/]+)\/([^/]+)\/door\/(\d)(#shadow)?$/.exec(k); if (m) { const nk = `oi_shopdoor/${m[1]}/${m[2]}/door/${m[3]}${m[4] || ''}`; K.frames[nk] = K.frames[k]; if (K.masks[k]) K.masks[nk] = K.masks[k]; } }
  }
  /** pure layout (also used by the node tests): objects, colliders, doors, lights, rect */
  function layout(x0, y0) {
    const x1 = x0 + WD, y1 = y0 + DP, objs = [], cols = [];
    const add = (id, type, x, y, rot, role, more) => objs.push(Object.assign({ id: ID + '_' + id, type, x, y, z: 0, rot: rot || 0, fade_group: ID, cutaway: { b: ID, role } }, more || {}));
    add('s0', 'f_wall', x0, y0, 0, 'near', { state: 'ground' }); add('sdoor', 'oi_shopdoor', x0 + 3, y0, 0, 'near', { state: 'door' }); add('s2', 'f_wall', x0 + 6, y0, 0, 'near', { state: 'ground' });
    add('wdoor', 'oi_shopdoor', x0, y0 + 3, 6, 'near', { state: 'door' }); add('w1', 'f_wall', x0, y0 + 6, 6, 'near', { state: 'ground' });
    [0, 1, 2, 3, 5.2, 6.2, 7.2, 8].forEach((dx, i) => add('n' + i, 'i_wall', x0 + dx, y1, 0, 'far', { state: 'plain' }));
    add('ndoor', 'i_door', x0 + 4, y1, 0, 'far', { state: 'open' });
    [1, 2, 2.4, 4.6, 5.6, 6].forEach((dy, i) => add('e' + i, 'i_wall', x1, y0 + dy, 6, 'far', { state: 'plain' }));
    add('edoor', 'i_door', x1, y0 + 3.6, 6, 'far', { state: 'open' });
    add('roof', 'oi_roof_9', x0, y0, 0, 'roof');
    add('gondola_a', 's_gondola', x0 + 2.6, y0 + 2.6, 0, 'interior', { state: 'full' }); add('gondola_b', 's_gondola', x0 + 2.6, y0 + 4.2, 0, 'interior', { state: 'full' });
    add('counter', 's_counter', x0 + 6.6, y0 + 1.5, 0, 'interior'); add('bench', 'bb_bench', x0 + 6.6, y0 + 4.6, 0, 'interior'); add('shelf', 'bb_shelf', x1, y0 + 5.2, 6, 'interior');
    add('lamp_a', 'i_pendant', x0 + 2.6, y0 + 3.4, 0, 'light', { state: 'on' }); add('lamp_b', 'i_pendant', x0 + 6.6, y0 + 3.2, 0, 'light', { state: 'on' });
    const R = (id, a, b, c, d) => cols.push({ id: ID + '_c_' + id, rect: [a, b, c, d] });
    R('s_a', x0, y0, x0 + 3.9, y0 + T); R('s_b', x0 + 5.1, y0, x1 + 0.15, y0 + T);
    R('w_a', x0, y0, x0 + T, y0 + 0.9); R('w_b', x0, y0 + 2.1, x0 + T, y1 + 0.15);
    R('n_a', x0, y1, x0 + 4, y1 + 0.15); R('n_b', x0 + 5.2, y1, x1 + 0.15, y1 + 0.15);
    R('e_a', x1, y0, x1 + 0.15, y0 + 2.4); R('e_b', x1, y0 + 3.6, x1 + 0.15, y1 + 0.15);
    const doors = [{ id: 'S', x: x0 + 4.5, y: y0, out: [x0 + 4.5, y0 - 0.8], in: [x0 + 4.5, y0 + 0.9] }, { id: 'W', x: x0, y: y0 + 1.5, out: [x0 - 0.8, y0 + 1.5], in: [x0 + 0.9, y0 + 1.5] },
      { id: 'N', x: x0 + 4.6, y: y1, out: [x0 + 4.6, y1 + 0.9], in: [x0 + 4.6, y1 - 0.8] }, { id: 'E', x: x1, y: y0 + 3, out: [x1 + 0.9, y0 + 3], in: [x1 - 0.8, y0 + 3] }];
    const floor = []; for (const fx of [0.2, 2.2, 4.2, 6.2, 7.0]) for (const fy of [0.2, 2.2, 4.0]) floor.push({ key: 'g_terrazzo/base/main/default/0', x: x0 + fx, y: y0 + fy, t: 0, shear: 0, oiDemo: true });
    return { id: ID, rect: [x0, y0, x1 + 0.15, y1 + 0.15], objects: objs, colliders: cols, doors, floor, lights: [[x0 + 2.6, y0 + 3.4, 2.3, 3.4], [x0 + 6.6, y0 + 3.2, 2.3, 3.4]] };
  }
  let built = null, built0 = null;
  function build(at) {
    if (W.interior) return null; alias();
    const o = Object.assign({}, DEFAULT, at || {}), L = layout(o.x0, o.y0);
    remove(true);
    for (const src of L.objects) { const P = W.piece(src); if (!P) continue; const ob = Object.assign({ variant: 'base' }, src); if (!ob.state) ob.state = P.states[0]; ob.overlays = []; ob.alpha = {}; W.objects.push(ob); W.byId[ob.id] = ob; }
    W.data.colliders = (W.data.colliders || []).concat(L.colliders);
    W.decals.push(...L.floor);
    const bd = W.data.bounds; if (bd && bd.y0 > L.rect[1] - 3) { built0 = built0 || { y0: bd.y0 }; bd.y0 = L.rect[1] - 3; }
    W.rebuildColliders();
    const B = OI.register({ id: ID, rect: L.rect, doors: L.doors, lights: L.lights, wallH: 3.0, name: '开放室内示范楼' });
    built = { layout: L, B }; return built;
  }
  function remove(silent) {
    if (!built && silent) return;
    W.objects = W.objects.filter((o) => !(o.cutaway && o.cutaway.b === ID)); for (const k of Object.keys(W.byId)) if (k.startsWith(ID + '_')) delete W.byId[k];
    W.data.colliders = (W.data.colliders || []).filter((c) => !String(c.id).startsWith(ID + '_c_')); W.decals = W.decals.filter((d) => !d.oiDemo);
    if (built0 && W.data.bounds) W.data.bounds.y0 = built0.y0; built0 = null;
    OI.unregister(ID); W.rebuildColliders(); built = null;
  }
  const flag = /[?&]oidemo=1/.test((root.location && root.location.search) || '');
  const load0 = W.load; W.load = function (data) { const r = load0.apply(this, arguments); if (data && data.interior) return r; built = null; built0 = null; if (flag) setTimeout(() => { if (!built && !W.interior && W.data === data) try { build(); } catch (e) { console.warn('oi demo', e); } }, 0); return r; };
  if (flag && W.data && !W.interior) try { build(); } catch (e) { console.warn('oi demo', e); }
  SP.openInteriorDemo = { build, remove, layout, get: () => built, ID };
  if (typeof module !== 'undefined' && module.exports) module.exports = { layout };
})(typeof window !== 'undefined' ? window : globalThis);
