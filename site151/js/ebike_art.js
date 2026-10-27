/* 电动车 / 电单车 renderer (Leo 2026-10-18 00:08: the parked e-bikes were crude blocks — "做得一点都不像真的").
 * One parametric model drawn in true 3D for any heading: two real wheels (tyre faces + tread + rim + hub, spokes on bicycle
 * types), mudguards, footboard, leg shield, seat, handlebar with grips + mirrors, headlight, tail light, rear rack, plate,
 * kickstand. Styles: 'scooter' (踏板电动车), 'delivery' (+外卖箱), 'quilt' (+挡风被), 'canopy' (+遮阳雨棚), 'bicycle'
 * (自行车式电动车: pedals, battery, basket), 'shared' (共享电单车, unbranded). All liveries unbranded; 未经Leo确认.
 * API: EBikeArt.draw(g, P, o) — g a 2D context, P(x, y, z) -> [sx, sy] the world projection (sprite-local or screen),
 *      o = { x, y, a (heading rad, world; 0 = +x), style, col, acc (accessory colour), z (base height), lean, seed }.
 *      EBikeArt.shadow(o) -> world ground polygon (soft shadow, sun falls north a little east).
 *      EBikeArt.parcel(g, P, o) — a taped cardboard parcel box { x, y, z, a, w, d, h }.
 * Parts are depth-sorted (world x + y, far first) and faces culled against the 45° camera (visible: facing -x, -y, up). */
(function (root) {
  'use strict';
  function rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function shade(h, f) { if (!h || h[0] !== '#') return h; return '#' + rgb(h).map((v) => Math.max(0, Math.min(255, Math.round(f >= 1 ? v + (255 - v) * (f - 1) : v * f))).toString(16).padStart(2, '0')).join(''); }
  const CAM = [-1, -1, 1.25];                       // toward the viewer
  const SUN = [0.11, 1.06];
  const COLS = ['#f1f1ec', '#c8312c', '#3d86c6', '#e88fae', '#2a2c30', '#5bbfa5', '#d9c49a', '#27406b', '#e8c13a', '#8a8f96', '#7a4fb0', '#f08a2a'];
  const BOX = ['#f2b705', '#2f7fd8', '#f07b1d', '#e9e9e4', '#3aa457'];
  const QUILT = [['#2b4f8a', '#d33c3c'], ['#3b3b3b', '#c9a227'], ['#8a2f4f', '#f0d8a8'], ['#2f6b4a', '#e8e1c9'], ['#4a4a72', '#a8c4e8']];
  function make(g, P, o) {
    const ca = Math.cos(o.a), sa = Math.sin(o.a), z0 = o.z || 0, lean = o.lean || 0;
    const W = (f, s) => [o.x + f * ca - s * sa, o.y + f * sa + s * ca];
    const L = (f, s, z) => { const zz = z + z0, ss = s + lean * z; const w = W(f, ss); return P(w[0], w[1], zz); };
    const nW = (nf, ns) => [nf * ca - ns * sa, nf * sa + ns * ca];
    const facing = (nf, ns, nz) => { const n = nW(nf, ns); return n[0] * CAM[0] + n[1] * CAM[1] + nz * CAM[2]; };
    const near = (facing(0, 1, 0) > 0) ? 1 : -1;                     // the side (s sign) toward the viewer
    const litS = (ns) => { const n = nW(0, ns); return 0.78 + 0.22 * Math.max(0, -n[1]) - 0.05 * Math.max(0, -n[0]); };
    function poly(pts, fill, line, lw) { g.beginPath(); pts.forEach((p, i) => { const q = L(p[0], p[1], p[2]); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.strokeStyle = line; g.lineWidth = lw || 1; g.stroke(); } }
    function seg(a, b, col, lw) { const p = L(...a), q = L(...b); g.strokeStyle = col; g.lineWidth = lw || 1; g.lineCap = 'round'; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }
    function path(pts, col, lw) { g.strokeStyle = col; g.lineWidth = lw || 1; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach((p, i) => { const q = L(...p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.stroke(); }
    /** profile [[f, z]] extruded across s0..s1 (s0 < s1): far face, visible edge strips, near face */
    function extrude(prof, s0, s1, col, opt = {}) {
      const sf = near > 0 ? s0 : s1, sn = near > 0 ? s1 : s0, line = opt.line === false ? null : (opt.line || shade(col, 0.5));
      poly(prof.map(([f, z]) => [f, sf, z]), shade(col, 0.62), line);
      const n = prof.length; let area = 0; for (let i = 0; i < n; i++) { const a = prof[i], b = prof[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
      const sgn = area > 0 ? 1 : -1;
      for (let i = 0; i < n; i++) { const a = prof[i], b = prof[(i + 1) % n], df = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(df, dz) || 1;
        const nf = sgn * dz / len, nz = -sgn * df / len; if (facing(nf, 0, nz) <= 0.02) continue;
        const k = nz > 0.5 ? (opt.top ? 1 : 1.12) : 0.86 + 0.1 * Math.max(0, -nW(nf, 0)[1]);
        const sc = opt.strip && opt.strip(nf, nz);
        poly([[a[0], s0, a[1]], [b[0], s0, b[1]], [b[0], s1, b[1]], [a[0], s1, a[1]]], sc ? shade(sc, k) : opt.top && nz > 0.5 ? opt.top : shade(col, k), line);
        if (sc && opt.strip.hook && nf < -0.5 && Math.abs(b[1] - a[1]) > 0.15) { const zm = (a[1] + b[1]) / 2, fm = (a[0] + b[0]) / 2 - 0.004; seg([fm, -0.03, zm], [fm, 0.03, zm], '#9aa0a4', 2); } }
      poly(prof.map(([f, z]) => [f, sn, z]), opt.side || shade(col, litS(near)), line);
    }
    /** axis box in local coords */
    function box(f0, s0, z0_, f1, s1, z1, col, opt = {}) { extrude([[f0, z0_], [f1, z0_], [f1, z1], [f0, z1]], s0, s1, col, opt); if (opt.decal) opt.decal(); }
    function ring(fc, zc, r, s, n = 18) { const pts = []; for (let k = 0; k < n; k++) { const t = k / n * Math.PI * 2; pts.push([fc + Math.cos(t) * r, s, zc + Math.sin(t) * r]); } return pts; }
    function wheel(fc, r, hw, opt = {}) {
      const zc = r, sf = -near * hw, sn = near * hw;
      poly(ring(fc, zc, r, sf), '#18191b');
      for (let k = 0; k < 14; k++) { const t0 = k / 14 * Math.PI * 2, t1 = (k + 1) / 14 * Math.PI * 2; const nf = Math.cos((t0 + t1) / 2), nz = Math.sin((t0 + t1) / 2); if (facing(nf, 0, nz) <= 0) continue;
        poly([[fc + Math.cos(t0) * r, sf, zc + Math.sin(t0) * r], [fc + Math.cos(t1) * r, sf, zc + Math.sin(t1) * r], [fc + Math.cos(t1) * r, sn, zc + Math.sin(t1) * r], [fc + Math.cos(t0) * r, sn, zc + Math.sin(t0) * r]], k % 2 ? '#26282b' : '#2c2e31'); }
      poly(ring(fc, zc, r, sn), '#222427', '#0e0f10');
      if (opt.spokes) { poly(ring(fc, zc, r * 0.86, sn * 1.02), null, '#9da4a9'); for (let k = 0; k < 8; k++) { const t = k / 8 * Math.PI; seg([fc + Math.cos(t) * r * 0.85, sn, zc + Math.sin(t) * r * 0.85], [fc - Math.cos(t) * r * 0.85, sn, zc - Math.sin(t) * r * 0.85], 'rgba(200,205,208,0.85)'); } poly(ring(fc, zc, r * 0.12, sn * 1.1, 10), '#8d9499'); }
      else { poly(ring(fc, zc, r * 0.62, sn * 1.02), opt.rim || '#aeb5ba', '#5e6468'); poly(ring(fc, zc, r * 0.42, sn * 1.04), '#6f767b'); for (let k = 0; k < 5; k++) { const t = k / 5 * Math.PI * 2 + 0.4; seg([fc + Math.cos(t) * r * 0.42, sn * 1.05, zc + Math.sin(t) * r * 0.42], [fc + Math.cos(t) * r * 0.6, sn * 1.05, zc + Math.sin(t) * r * 0.6], '#d4d9dc'); } poly(ring(fc, zc, r * 0.16, sn * 1.06, 10), '#3b3f42'); }
    }
    /** thin arc mudguard over a wheel (angles in rad, 0 = forward) */
    function guard(fc, r, a0, a1, hw, col) { const out = [], inn = []; for (let k = 0; k <= 8; k++) { const t = a0 + (a1 - a0) * k / 8; out.push([fc + Math.cos(t) * (r + 0.045), r + Math.sin(t) * (r + 0.045)]); inn.unshift([fc + Math.cos(t) * (r + 0.015), r + Math.sin(t) * (r + 0.015)]); } extrude(out.concat(inn), -hw, hw, col, { line: shade(col, 0.45) }); }
    const parts = []; const add = (f, fn, bias) => { const w = W(f, 0); parts.push({ d: w[0] + w[1] + (bias || 0), fn }); };
    const run = () => { parts.sort((a, b) => b.d - a.d); for (const p of parts) p.fn(); };
    const fwd = nW(1, 0); const along = fwd[0] + fwd[1];             // >0: front is farther than rear
    return { g, L, W, poly, seg, path, extrude, box, wheel, guard, add, run, near, facing, along };
  }
  function pick(a, i) { return a[((i % a.length) + a.length) % a.length]; }
  function draw(g, P, o) {
    const m = make(g, P, o), st = o.style || 'scooter', col = o.col || '#f1f1ec', dk = shade(col, 0.5), seed = o.seed | 0;
    const { seg, path, extrude, box, wheel, guard, add, poly, near } = m;
    g.save(); g.lineJoin = 'round';
    if (st === 'bicycle' || st === 'shared') {
      const r = st === 'shared' ? 0.27 : 0.3, fF = 0.56, fR = -0.56, tube = st === 'shared' ? '#f4f4ef' : col, acc = st === 'shared' ? (o.acc || '#f2c230') : (o.acc || '#2a2c30');
      add(fR, () => { wheel(fR, r, 0.035, { spokes: st !== 'shared', rim: '#c9ced2' }); guard(fR, r, Math.PI * 0.12, Math.PI * 0.95, 0.05, st === 'shared' ? acc : tube); });
      add(fF, () => { wheel(fF, r, 0.035, { spokes: st !== 'shared', rim: '#c9ced2' }); guard(fF, r, Math.PI * 0.08, Math.PI * 0.8, 0.05, tube); });
      add(0, () => {
        // step-through frame
        if (st === 'shared') extrude([[0.42, 0.9], [0.48, 0.82], [0.04, 0.3], [-0.2, 0.28], [-0.27, 0.66], [-0.17, 0.66], [-0.1, 0.42], [0.06, 0.41]], -0.06, 0.06, tube, { line: '#7b8285' });
        else { for (const s of [-0.012, 0.012]) { path([[0.42, s, 0.86], [0.02, s, 0.3], [-0.22, s, 0.72]], tube, 3); path([[0.02, s, 0.3], [fR, s, r], [-0.2, s, 0.66]], shade(tube, 0.8), 2); } }
        { const k = o.crank || 0, cf = Math.cos(k) * 0.16, cz = Math.sin(k) * 0.16; for (const sd of [-1, 1]) { seg([0, sd * 0.06, 0.3], [sd * cf, sd * 0.12, 0.3 + sd * cz], '#333', 2); seg([sd * cf - 0.05, sd * 0.13, 0.3 + sd * cz], [sd * cf + 0.05, sd * 0.13, 0.3 + sd * cz], '#222', 3); } }   // cranks + pedals
        if (!o.noMotor) box(-0.34, -0.07, 0.38, -0.14, 0.07, 0.68, '#2e3134', { line: '#151718' });                                  // battery
        if (st === 'shared' && !o.noMotor) { poly([[-0.33, near * 0.072, 0.48], [-0.16, near * 0.072, 0.48], [-0.16, near * 0.072, 0.56], [-0.33, near * 0.072, 0.56]], acc); box(-0.86, -0.12, 0.42, -0.6, 0.12, 0.62, acc, { line: shade(acc, 0.5) }); }
        seg([-0.22, 0, 0.7], [-0.25, 0, 0.88], '#555', 2); extrude([[-0.12, 0.9], [-0.38, 0.92], [-0.4, 0.97], [-0.1, 0.96]], -0.09, 0.09, '#232426', { line: '#0e0e0f' });   // seat
        if (st !== 'shared') { for (const s of [-0.1, 0.1]) path([[-0.3, s, 0.78], [-0.8, s, 0.8], [fR, s, r]], '#3c4144', 1); seg([-0.8, -0.1, 0.8], [-0.8, 0.1, 0.8], '#3c4144'); box(-0.86, -0.04, 0.68, -0.83, 0.04, 0.74, '#d0281f', { line: '#7a1612' }); }
      });
      add(fF - 0.05, () => {
        for (const s of [-0.04, 0.04]) seg([fF, s, r], [0.42, s, 0.92], '#4a5054', 2);
        seg([0.4, 0, 0.92], [0.38, 0, 1.06], '#3a3f42', 2); seg([0.36, -0.29, 1.06], [0.36, 0.29, 1.06], '#2b2f31', 2);
        for (const s of [-0.27, 0.27]) seg([0.36, s - 0.04, 1.06], [0.36, s + 0.04, 1.06], '#111', 3);
        // wire basket
        const bx0 = 0.48, bx1 = 0.76, bz0 = 0.8, bz1 = 1.02; box(bx0, -0.16, bz0, bx1, 0.16, bz1, st === 'shared' ? '#3b4246' : '#5a6064', { line: '#2a2e30', top: 'rgba(0,0,0,0)' });
        if (st === 'shared') { poly([[0.42, near * 0.05, 0.86], [0.46, near * 0.05, 0.86], [0.46, near * 0.05, 0.92], [0.42, near * 0.05, 0.92]], '#eee'); }
        box(0.44, -0.04, 0.88, 0.48, 0.04, 0.94, '#e8e6d8', { line: '#77746a' });                                                   // lamp
      }, -0.05);
      extra(m, o); m.run(); g.restore(); return;
    }
    // ---- scooter family ----
    const r = 0.2, fF = 0.62, fR = -0.6;
    add(fR, () => { wheel(fR, r, 0.055); for (const s of [-0.1, 0.1]) seg([-0.3, s, 0.26], [fR, s, 0.2], '#3b3e41', 2); });
    add(fF, () => { wheel(fF, r, 0.05); }, 0.0);
    add(-0.45, () => {
      // rear body / under-seat cowl (doubles as the rear mudguard), tail light, plate, rack
      extrude([[-0.2, 0.3], [-0.26, 0.6], [-0.8, 0.64], [-0.9, 0.56], [-0.84, 0.44], [-0.6, 0.41], [-0.44, 0.31]], -0.15, 0.15, col);
      extrude([[-0.84, 0.44], [-0.9, 0.56], [-0.92, 0.5], [-0.86, 0.4]], -0.11, 0.11, '#c62a22', { line: '#6d1410' });          // tail light
      poly([[-0.88, -0.07, 0.3], [-0.88, 0.07, 0.3], [-0.86, 0.07, 0.4], [-0.86, -0.07, 0.4]], '#e9eee6', '#466d4d');           // plate
      guard(fR, r, Math.PI * 0.35, Math.PI * 0.8, 0.06, '#2e3134');
      poly([[-0.42, near * 0.152, 0.4], [-0.72, near * 0.152, 0.48], [-0.72, near * 0.152, 0.52], [-0.42, near * 0.152, 0.44]], shade(col, 1.15));   // trim line
      extrude([[-0.16, 0.64], [-0.3, 0.71], [-0.78, 0.73], [-0.84, 0.67], [-0.76, 0.63]], -0.14, 0.14, '#252628', { line: '#0f1011', top: '#35373a' });   // seat
      if (st !== 'delivery') { for (const s of [-0.12, 0.12]) seg([-0.74, s, 0.7], [-0.98, s, 0.72], '#3a3e41', 2); seg([-0.98, -0.12, 0.72], [-0.98, 0.12, 0.72], '#3a3e41', 2); }
      if (!o.riding) seg([-0.2, near * 0.12, 0.2], [-0.12, near * 0.2, 0.02], '#2a2c2e', 2);                                                     // kickstand
    });
    add(0, () => { extrude([[-0.3, 0.22], [0.26, 0.22], [0.3, 0.29], [-0.28, 0.31]], -0.17, 0.17, '#34373a', { top: '#44484c', line: '#1d1f21' }); for (let f = -0.2; f < 0.22; f += 0.08) seg([f, -0.13, 0.305], [f, 0.13, 0.305], '#2a2c2e'); });
    add(0.4, () => {
      if (st === 'quilt') return;
      const inner = (nf) => (nf < -0.3 ? '#2d3033' : null); inner.hook = true;   // black inner leg-shield panel with the bag hook (seen from behind)
      extrude([[0.22, 0.24], [0.42, 0.26], [0.52, 0.42], [0.58, 0.66], [0.54, 0.9], [0.44, 0.95], [0.38, 0.64], [0.3, 0.36]], -0.19, 0.19, col, { strip: inner });
      poly([[0.52, near * 0.192, 0.5], [0.56, near * 0.192, 0.66], [0.53, near * 0.192, 0.82], [0.49, near * 0.192, 0.66]], shade(col, 1.18));    // highlight
    });
    add(fF - 0.04, () => {
      for (const s of [-0.07, 0.07]) seg([fF, s, r], [0.54, s, 0.62], '#55595c', 3);
      guard(fF, r, Math.PI * 0.12, Math.PI * 0.86, 0.065, col);
    }, -0.02);
    add(0.44, () => {
      seg([0.5, 0, 0.9], [0.47, 0, 1.03], '#3a3d40', 3);
      seg([0.45, -0.31, 1.04], [0.45, 0.31, 1.04], '#2b2e30', 2); for (const s of [-0.29, 0.29]) seg([0.45, s - 0.05, 1.04], [0.45, s + 0.05, 1.04], '#111', 3);
      box(0.4, -0.1, 0.96, 0.56, 0.1, 1.1, col, { line: dk });                                                                  // headlight cowl
      const fl = m.facing(1, 0, 0) > 0; if (fl) poly([[0.565, -0.06, 0.99], [0.565, 0.06, 0.99], [0.565, 0.06, 1.07], [0.565, -0.06, 1.07]], '#f6f3d8', '#8a866c');
      poly([[0.42, -0.08, 1.1], [0.54, -0.08, 1.1], [0.54, 0.08, 1.1], [0.42, 0.08, 1.1]], '#1c2024');                         // dash
      for (const s of [-0.22, 0.22]) { seg([0.45, s, 1.05], [0.41, s * 1.25, 1.27], '#2a2c2e'); poly([[0.38, s * 1.25 - 0.04, 1.25], [0.44, s * 1.25 + 0.04, 1.25], [0.44, s * 1.25 + 0.04, 1.33], [0.38, s * 1.25 - 0.04, 1.33]], '#1d1f21', '#0b0b0c'); }
      if (st === 'quilt') { const q = pick(QUILT, seed); extrude([[0.36, 0.3], [0.62, 0.3], [0.66, 0.62], [0.6, 0.98], [0.47, 1.03], [0.4, 0.7]], -0.3, 0.3, q[0], { line: shade(q[0], 0.45) });
        for (const z of [0.45, 0.62, 0.8]) seg([0.63, -0.29, z], [0.63, 0.29, z], q[1]); for (const s of [-0.2, 0, 0.2]) seg([0.62, s, 0.33], [0.6, s, 0.97], shade(q[1], 0.85));
        for (const s of [-0.31, 0.31]) box(0.38, s - 0.06, 0.98, 0.5, s + 0.06, 1.1, q[0], { line: shade(q[0], 0.4) }); }        // muffs
    }, -0.04);
    if (st === 'delivery') add(-0.85, () => { const c = o.acc || pick(BOX, seed); box(-1.1, -0.23, 0.7, -0.62, 0.23, 1.16, c, { line: shade(c, 0.45), top: shade(c, 1.15) }); box(-1.1, -0.23, 1.1, -0.62, 0.23, 1.16, shade(c, 0.92), { line: shade(c, 0.45) });
      poly([[-1.08, near * 0.232, 0.86], [-0.64, near * 0.232, 0.86], [-0.64, near * 0.232, 0.9], [-1.08, near * 0.232, 0.9]], '#e8eef0'); });
    if (st === 'canopy') add(0, () => { const c = o.acc || '#2f6fb3'; for (const s of [-0.27, 0.27]) { seg([0.46, s, 1.02], [0.52, s, 1.78], '#c9ced1', 2); seg([-0.86, s, 0.7], [-0.86, s, 1.78], '#c9ced1', 2); }
      poly([[0.52, -0.27, 1.05], [0.52, 0.27, 1.05], [0.56, 0.27, 1.76], [0.56, -0.27, 1.76]], 'rgba(200,225,235,0.35)', '#9fb4bd'); seg([0.53, -0.15, 1.2], [0.55, 0.05, 1.65], 'rgba(255,255,255,0.8)');
      extrude([[-0.98, 1.76], [-0.3, 1.86], [0.4, 1.86], [0.66, 1.78], [0.66, 1.73], [-0.98, 1.71]], -0.34, 0.34, c, { line: shade(c, 0.5), top: shade(c, 1.12) }); }, -50);
    extra(m, o); m.run(); g.restore();
  }
  /** o.extra = [{ f, fn(m), bias }]: extra parts (the rider's body) depth-sorted with the bike's own parts, same projection */
  function extra(m, o) { for (const e of o.extra || []) m.add(e.f, () => e.fn(m), e.bias); }
  function hull(pts) { pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); } return lo.slice(0, -1).concat(up.slice(0, -1)); }
  /** ground shadow (world polygon): the bike's silhouette points swept toward the sun shadow direction */
  function shadow(o) {
    const st = o.style || 'scooter', ca = Math.cos(o.a), sa = Math.sin(o.a), h = st === 'canopy' ? 1.8 : st === 'delivery' ? 1.16 : 1.05;
    const L = st === 'bicycle' || st === 'shared' ? 0.86 : st === 'delivery' ? 1.1 : 0.92, Wd = st === 'canopy' ? 0.34 : 0.2, pts = [];
    for (const [f, s, z] of [[-L, -Wd, 0], [0.82, -Wd, 0], [0.82, Wd, 0], [-L, Wd, 0], [0.45, -0.3, 1.05], [0.45, 0.3, 1.05], [-L + 0.1, 0, h], [-0.2, 0, h * 0.7], [0.5, 0, 0.6]]) {
      const wx = o.x + f * ca - s * sa, wy = o.y + f * sa + s * ca; pts.push([wx + SUN[0] * z, wy + SUN[1] * z]); }
    return hull(pts);
  }
  /** cardboard parcel box (world coords, any heading), taped, with a shipping label */
  function parcel(g, P, o) {
    const m = make(g, P, { x: o.x, y: o.y, a: o.a || 0, z: o.z || 0 }), w = o.w || 0.42, d = o.d || 0.32, h = o.h || 0.3, c = o.col || '#c49a62';
    m.box(-d / 2, -w / 2, 0, d / 2, w / 2, h, c, { line: '#6e5130', top: shade(c, 1.1) });
    m.seg([-d / 2, 0, h], [d / 2, 0, h], '#e3cf9d', 2); for (const f of [-d / 2 - 0.002, d / 2 + 0.002]) if (m.facing(Math.sign(f), 0, 0) > 0) m.seg([f, 0, h], [f, 0, h - 0.12], '#e3cf9d', 2);
    const sn = m.near * (w / 2 + 0.002); m.poly([[-0.08, sn, h * 0.35], [0.08, sn, h * 0.35], [0.08, sn, h * 0.7], [-0.08, sn, h * 0.7]], '#f4f3ee', '#9a9890');
  }
  /** a deterministic loose row of parked bikes for sprites: n bikes spaced along x from x0, nose toward +y or -y */
  function row(seed, n, opt = {}) {
    let a = (seed >>> 0) || 1; const R = () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const styles = opt.styles || ['scooter', 'scooter', 'delivery', 'quilt', 'scooter', 'bicycle', 'canopy', 'scooter'], out = [], nose = opt.nose == null ? (R() < 0.5 ? 1 : -1) : opt.nose;
    for (let i = 0; i < n; i++) { const st = styles[Math.floor(R() * styles.length)]; out.push({ x: (opt.x0 || 0) + i * (opt.dx || 0.82) + (R() - 0.5) * 0.12, y: (opt.y || 0) + (R() - 0.5) * 0.18, a: nose * Math.PI / 2 + (R() - 0.5) * 0.42 + (opt.skew || 0), style: st, col: COLS[Math.floor(R() * COLS.length)], seed: Math.floor(R() * 1000) }); }
    return out;
  }
  const api = { draw, shadow, parcel, row, COLS, BOX, STYLES: ['scooter', 'delivery', 'quilt', 'canopy', 'bicycle', 'shared'], shade };
  root.EBikeArt = api; if (root.SP) root.SP.ebikeArt = api;
})(typeof window !== 'undefined' ? window : globalThis);
