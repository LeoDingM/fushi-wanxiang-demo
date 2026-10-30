/* Procedural small trucks drawn at the kit car's detail level (Leo 2026-10-18 00:09: the shared-bike rebalancing truck was two
 * crude boxes). Vehicle-local metres (x forward, y left, z up), any heading; faces are back-face culled against the 45° camera
 * (visible: facing world -x / -y / up), parts sorted far-to-near, flat shading by face orientation, wheels as true projected
 * discs with tyres, rims and hubs. Used by mobility_operations.js (共享单车调度车: 轻卡 with a cage rack of stacked shared e-bikes)
 * and store_supply.js (门店补货车: box van). Unbranded liveries; design 未经Leo确认. */
(function (root) {
  'use strict';
  const SP = root.SP; if (!SP) return;
  function rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function shade(h, f) { if (h[0] !== '#') return h; return '#' + rgb(h).map((v) => Math.max(0, Math.min(255, Math.round(f >= 1 ? v + (255 - v) * (f - 1) : v * f))).toString(16).padStart(2, '0')).join(''); }
  const LIVERY = {
    bike: { body: '#3fae8c', body2: '#f2f4ef', stripe: '#f2c230', cab: '#f2f4ef', bed: '#5d666a' },       // mint + white + yellow (unbranded shared-mobility colours)
    supply: { body: '#e9ecea', body2: '#e9ecea', stripe: '#2f7f6a', cab: '#3f8f78', bed: '#5d666a' },
    ambulance: { body: '#f1f3f0', body2: '#f1f3f0', stripe: '#c8372f', cab: '#f1f3f0', bed: '#5d666a' },
  };
  function make(ctx, v) {
    const c = Math.cos(v.heading), s = Math.sin(v.heading);
    const W = (x, y) => [v.x + x * c - y * s, v.y + x * s + y * c];
    const P = (x, y, z) => { const w = W(x, y); return [SP.sx(w[0], w[1]), SP.sy(w[0], w[1], z || 0)]; };
    const parts = [];                 // {d: depth (world x+y, larger = farther), fn}
    const add = (lx, ly, fn, bias) => { const w = W(lx, ly); parts.push({ d: w[0] + w[1] + (bias || 0), fn }); };
    /** world normal of a local horizontal direction (nx, ny) */
    const nW = (nx, ny) => [nx * c - ny * s, nx * s + ny * c];
    const vis = (nx, ny) => { const n = nW(nx, ny); return n[0] + n[1] < -0.02; };
    const lit = (nx, ny) => { const n = nW(nx, ny); return 0.8 + 0.2 * Math.max(0, -n[1]) - 0.06 * Math.max(0, -n[0]); };
    function poly(pts, fill, line, lw) { ctx.beginPath(); pts.forEach((p, i) => { const q = P(...p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (line) { ctx.strokeStyle = line; ctx.lineWidth = lw || 1; ctx.stroke(); } }
    function seg(a, b, col, lw) { const p = P(...a), q = P(...b); ctx.strokeStyle = col; ctx.lineWidth = lw || 1; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
    /** box with per-face colours (top / sides) and culling; o.faces: { top, front(+x), back(-x), left(+y), right(-y) } */
    function box(x0, y0, z0, x1, y1, z1, col, o = {}) {
      const L = o.line || shade(col, 0.55), F = o.faces || {};
      const sides = [[1, 0, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], F.front], [-1, 0, [[x0, y1, z0], [x0, y0, z0], [x0, y0, z1], [x0, y1, z1]], F.back],
        [0, 1, [[x1, y1, z0], [x0, y1, z0], [x0, y1, z1], [x1, y1, z1]], F.left], [0, -1, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], F.right]];
      for (const [nx, ny, pts, fc] of sides) if (vis(nx, ny)) { poly(pts, shade(fc || col, lit(nx, ny)), L); if (o.decal) o.decal(nx, ny); }
      if (!o.noTop) poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], shade(F.top || col, 1.08), L);
    }
    /** a disc in the local x-z plane at side y (wheel) */
    function wheelDisc(x, y, z, r, fill, line) { ctx.beginPath(); for (let k = 0; k <= 20; k++) { const a = k / 20 * Math.PI * 2, q = P(x + Math.cos(a) * r, y, z + Math.sin(a) * r); k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (line) { ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.stroke(); } }
    function wheel(x, side) {
      const y0 = side * 0.72, y1 = side * 0.9, r = 0.34, z = 0.34, outer = vis(0, side);
      const ys = outer ? [y0, y1] : [y1, y0];
      wheelDisc(x, ys[0], z, r, '#1d1f22');
      // tread band between the two faces (silhouette fill)
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, b = (k + 1) / 12 * Math.PI * 2; poly([[x + Math.cos(a) * r, y0, z + Math.sin(a) * r], [x + Math.cos(b) * r, y0, z + Math.sin(b) * r], [x + Math.cos(b) * r, y1, z + Math.sin(b) * r], [x + Math.cos(a) * r, y1, z + Math.sin(a) * r]], '#24272a'); }
      wheelDisc(x, ys[1], z, r, '#2a2d31', '#111');
      if (outer) { wheelDisc(x, y1 + side * 0.005, z, r * 0.6, '#b8bec2', '#6a7074'); wheelDisc(x, y1 + side * 0.01, z, r * 0.22, '#7c8387'); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 + 0.3; const p = [x + Math.cos(a) * r * 0.42, y1 + side * 0.012, z + Math.sin(a) * r * 0.42]; const q = P(...p); ctx.fillStyle = '#5d6367'; ctx.fillRect(Math.round(q[0]), Math.round(q[1]), 1, 1); } }
    }
    return { P, W, add, parts, vis, lit, poly, seg, box, wheel, wheelDisc, shade };
  }
  /** a standing shared e-bike seen in the truck bed, wheels in the local y-z plane (bike crosswise), at (x, yc), base z */
  function ebike(g, x, yc, z, col, flip) {
    const { P, seg, poly } = g, wr = 0.24, fy = flip ? -1 : 1, yA = yc - 0.5 * fy, yB = yc + 0.5 * fy;
    const ring = (y) => { const pts = []; for (let k = 0; k <= 16; k++) { const a = k / 16 * Math.PI * 2; pts.push([x, y + Math.cos(a) * wr, z + wr + Math.sin(a) * wr]); } return pts; };
    poly(ring(yA), null, '#1f2224', 2); poly(ring(yB), null, '#1f2224', 2);
    seg([x, yA, z + wr], [x, yB, z + wr], '#9aa1a5');
    poly([[x - 0.06, yc - 0.18 * fy, z + 0.38], [x + 0.06, yc - 0.18 * fy, z + 0.38], [x + 0.06, yc + 0.22 * fy, z + 0.5], [x - 0.06, yc + 0.22 * fy, z + 0.5]], col, shade(col, 0.55));   // step-through body
    poly([[x - 0.07, yc + 0.05 * fy, z + 0.42], [x + 0.07, yc + 0.05 * fy, z + 0.42], [x + 0.07, yc - 0.15 * fy, z + 0.42], [x - 0.07, yc - 0.15 * fy, z + 0.42]], '#33393c');                          // battery deck
    seg([x, yB - 0.08 * fy, z + 0.48], [x, yB - 0.02 * fy, z + 0.92], col, 2);                                              // fork / head tube
    seg([x - 0.24, yB - 0.02 * fy, z + 0.92], [x + 0.24, yB - 0.02 * fy, z + 0.92], '#2c3134', 2);                         // handlebar
    poly([[x - 0.1, yB + 0.04 * fy, z + 0.66], [x + 0.1, yB + 0.04 * fy, z + 0.66], [x + 0.1, yB + 0.2 * fy, z + 0.7], [x - 0.1, yB + 0.2 * fy, z + 0.7]], '#2c3134');   // basket
    poly([[x - 0.08, yc - 0.32 * fy, z + 0.62], [x + 0.08, yc - 0.32 * fy, z + 0.62], [x + 0.08, yc - 0.06 * fy, z + 0.64], [x - 0.08, yc - 0.06 * fy, z + 0.64]], '#262a2c');   // saddle
    seg([x, yc - 0.18 * fy, z + 0.5], [x, yc - 0.18 * fy, z + 0.62], '#555');
    poly([[x - 0.05, yA - 0.05 * fy, z + 0.5], [x + 0.05, yA - 0.05 * fy, z + 0.5], [x + 0.05, yA + 0.12 * fy, z + 0.5], [x - 0.05, yA + 0.12 * fy, z + 0.5]], '#f2c230');      // yellow rear fender accent
  }
  /** opts: { kind: 'bike' | 'supply', cargo: number of bikes, len: 4.3 } */
  function drawTruck(ctx, v, opts = {}) {
    const g = make(ctx, v), { box, poly, seg, vis, lit, add, wheel } = g, Lv = LIVERY[opts.kind] || LIVERY.bike;
    const half = opts.half || 2.1, X0 = -half, X1 = half, HW = opts.hw || 0.85, cabX = X1 - 1.38, box_ = opts.kind === 'supply' || opts.kind === 'ambulance';
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.lineJoin = 'round';
    // wheels + chassis first (always beneath)
    const wheels = [[X0 + 0.75, 1], [X0 + 0.75, -1], [X1 - 0.72, 1], [X1 - 0.72, -1]].sort((a, b) => { const A = g.W(a[0], a[1]), B = g.W(b[0], b[1]); return (B[0] + B[1]) - (A[0] + A[1]); });
    const farW = wheels.filter(([, sd]) => !vis(0, sd)), nearW = wheels.filter(([, sd]) => vis(0, sd));
    for (const [x, sd] of farW) wheel(x, sd);
    box(X0 + 0.1, -0.7, 0.28, X1 - 0.1, 0.7, 0.48, '#2a2d30', { noTop: true });
    // ---- cargo body ----
    const bedTop = 0.62;
    const drawBody = () => {
    if (!vis(-1, 0)) box(X0 - 0.08, -HW + 0.05, 0.36, X0, HW - 0.05, 0.5, '#3a3f43');
    if (box_) {
      box(X0, -HW, 0.48, cabX - 0.05, HW, 2.05, Lv.body, { faces: { back: '#d9ddd9' }, decal: (nx, ny) => {
        if (ny !== 0) { const y = ny * HW + ny * 0.003; poly([[X0 + 0.2, y, 1.1], [cabX - 0.25, y, 1.1], [cabX - 0.25, y, 1.28], [X0 + 0.2, y, 1.28]], Lv.stripe); poly([[X0 + 0.2, y, 0.62], [cabX - 0.25, y, 0.62], [cabX - 0.25, y, 0.7], [X0 + 0.2, y, 0.7]], shade(Lv.stripe, 0.8)); }
        if (opts.kind === 'ambulance' && ny !== 0) { const y = ny * HW + ny * 0.006, cx = (X0 + cabX) / 2 + 0.2; poly([[cx - 0.09, y, 1.42], [cx + 0.09, y, 1.42], [cx + 0.09, y, 1.86], [cx - 0.09, y, 1.86]], '#c8372f'); poly([[cx - 0.25, y, 1.55], [cx + 0.25, y, 1.55], [cx + 0.25, y, 1.73], [cx - 0.25, y, 1.73]], '#c8372f'); poly([[X0 + 0.3, y, 1.42], [X0 + 0.9, y, 1.42], [X0 + 0.9, y, 1.86], [X0 + 0.3, y, 1.86]], '#6f8d97', '#4c5d63'); }
        if (nx < 0) { const x = X0 - 0.003; seg([x, 0, 0.55], [x, 0, 2.0], '#9aa0a0'); for (const y of [-0.6, 0.6]) poly([[x, y - 0.12, 0.58], [x, y + 0.12, 0.58], [x, y + 0.12, 0.72], [x, y - 0.12, 0.72]], '#c8302a'); poly([[x, -0.22, 0.5], [x, 0.22, 0.5], [x, 0.22, 0.62], [x, -0.22, 0.62]], '#2a5bd7', '#ddd'); }
      } });
    } else {
      // flatbed + low dropsides
      box(X0, -HW, 0.48, cabX - 0.05, HW, bedTop, Lv.bed, { faces: { top: '#6c7478' } });
      const n = Math.max(0, Math.min(8, opts.cargo == null ? 6 : opts.cargo));
      const bikes = []; for (let i = 0; i < n; i++) bikes.push([X0 + 0.3 + i * 0.34, 0, i % 2]);
      // rack sides: far sides first, then bikes (far to near), then near sides
      const side = (sd) => { const y = sd * (HW - 0.02); poly([[X0, y, bedTop], [cabX - 0.05, y, bedTop], [cabX - 0.05, y, 0.92], [X0, y, 0.92]], shade(Lv.body2, lit(0, sd)), '#7d8487'); poly([[X0, y, 0.74], [cabX - 0.05, y, 0.74], [cabX - 0.05, y, 0.8], [X0, y, 0.8]], Lv.stripe);
        for (let x = X0; x <= cabX - 0.04; x += 0.35) seg([x, y, 0.92], [x, y, 1.82], '#4b5357'); for (const z of [1.3, 1.82]) seg([X0, y, z], [cabX - 0.05, y, z], '#4b5357', 2); };
      const end = () => { const x = X0 + 0.01; if (vis(-1, 0)) { poly([[x, -HW, bedTop], [x, HW, bedTop], [x, HW, 0.92], [x, -HW, 0.92]], shade(Lv.body2, lit(-1, 0)), '#7d8487'); for (let y = -HW; y <= HW; y += 0.28) seg([x, y, 0.92], [x, y, 1.82], '#4b5357'); seg([x, -HW, 1.82], [x, HW, 1.82], '#4b5357', 2);
        for (const y of [-0.62, 0.62]) poly([[x - 0.004, y - 0.13, 0.55], [x - 0.004, y + 0.13, 0.55], [x - 0.004, y + 0.13, 0.7], [x - 0.004, y - 0.13, 0.7]], '#c8302a', '#7a1a14'); poly([[x - 0.004, -0.22, 0.42], [x - 0.004, 0.22, 0.42], [x - 0.004, 0.22, 0.54], [x - 0.004, -0.22, 0.54]], '#2a5bd7', '#e8e8e8'); } };
      const far = [1, -1].filter((sd) => !vis(0, sd)), near = [1, -1].filter((sd) => vis(0, sd));
      if (!vis(-1, 0)) { const x = X0 + 0.01; for (let y = -HW; y <= HW; y += 0.28) seg([x, y, 0.92], [x, y, 1.82], '#4b5357'); }
      for (const sd of far) side(sd);
      bikes.sort((a, b) => { const A = g.W(a[0], a[1]), B = g.W(b[0], b[1]); return (B[0] + B[1]) - (A[0] + A[1]); });
      const EB = root.EBikeArt, WP = (X, Y, Z) => [SP.sx(X, Y), SP.sy(X, Y, Z)];   // 2026-10-18: the same realistic shared e-bike as on the street
      for (const [x, y, col] of bikes) { if (EB) { const w = g.W(x, y); EB.draw(ctx, WP, { x: w[0], y: w[1], a: v.heading + (col ? Math.PI / 2 : -Math.PI / 2), style: 'shared', col: '#f4f4ef', acc: col ? '#3fae8c' : '#f2c230', z: bedTop, seed: x * 10 | 0 }); } else ebike(g, x, y, bedTop, col ? '#3fae8c' : '#eef1ec', col); }
      end(); for (const sd of near) side(sd);
      seg([cabX - 0.05, -HW, 1.82], [cabX - 0.05, HW, 1.82], '#4b5357', 2);
    }
      if (vis(-1, 0)) box(X0 - 0.08, -HW + 0.05, 0.36, X0, HW - 0.05, 0.5, '#3a3f43');
    };
    // ---- cab ----
    const cx0 = cabX, cx1 = X1, zb = 0.48, zw = 1.12, zt = 1.9, xr = X1 - 0.48;                // xr: roof front edge (windshield slope)
    const cabCol = box_ ? Lv.cab : Lv.body;
    const drawCab = () => {
      if (!vis(1, 0)) box(cx1, -HW + 0.02, 0.4, cx1 + 0.1, HW - 0.02, 0.6, '#3a3f43', { noTop: false });   // hidden bumper first (else it paints over the cab)
      // lower body
      box(cx0, -HW, zb, cx1, HW, zw, cabCol, { noTop: true, decal: (nx, ny) => {
        if (ny !== 0) { const y = ny * (HW + 0.004); poly([[cx0 + 0.12, y, zb + 0.06], [cx0 + 0.12, y, zw - 0.04], [cx1 - 0.55, y, zw - 0.04], [cx1 - 0.55, y, zb + 0.06]], null, shade(cabCol, 0.55)); seg([cx0 + 0.28, y, zw - 0.22], [cx0 + 0.42, y, zw - 0.22], '#333', 2);
          poly([[cx0, y, 0.82], [cx1, y, 0.82], [cx1, y, 0.9], [cx0, y, 0.9]], Lv.stripe);
          // wheel arch
          const ax = X1 - 0.72, pts = []; for (let k = 0; k <= 10; k++) { const a = k / 10 * Math.PI; pts.push([ax + Math.cos(a) * 0.44, y, zb - 0.14 + Math.sin(a) * 0.44]); } poly(pts, '#1b1d20'); }
        if (nx > 0) { const x = cx1 + 0.004; poly([[x, -0.55, 0.62], [x, 0.55, 0.62], [x, 0.55, 0.92], [x, -0.55, 0.92]], '#2b3134'); for (let z = 0.66; z < 0.9; z += 0.07) seg([x, -0.52, z], [x, 0.52, z], '#4a5257');
          for (const y of [-0.68, 0.68]) { poly([[x, y - 0.13, 0.72], [x, y + 0.13, 0.72], [x, y + 0.13, 0.92], [x, y - 0.13, 0.92]], '#f4f1d6', '#7d7a62'); poly([[x, y - 0.13, 0.62], [x, y + 0.13, 0.62], [x, y + 0.13, 0.68], [x, y - 0.13, 0.68]], '#f0a63a'); } }
      } });
      const mirror = sd => { const y = sd * (HW + 0.13); seg([cx1 - 0.3, sd * HW, 1.14], [cx1 - 0.32, y, 1.2], '#222', 2); poly([[cx1 - 0.36, y - 0.03 * sd, 1.1], [cx1 - 0.29, y - 0.03 * sd, 1.1], [cx1 - 0.29, y + 0.03 * sd, 1.34], [cx1 - 0.36, y + 0.03 * sd, 1.34]], '#26292c'); };
      for (const sd of [-1, 1]) if (!vis(0, sd)) mirror(sd);
      // greenhouse (glass) with slanted windshield, B-pillar
      const up = [[cx0, -HW + 0.04, zw], [cx1 - 0.05, -HW + 0.04, zw], [xr, -HW + 0.08, zt], [cx0, -HW + 0.08, zt]];
      const sides = [-1, 1];
      for (const sd of sides) if (vis(0, sd)) { const y0 = sd * (HW - 0.04), y1 = sd * (HW - 0.08), L = lit(0, sd);
        poly([[cx0, y0, zw], [cx1 - 0.05, y0, zw], [xr, y1, zt], [cx0, y1, zt]], shade(cabCol, L), shade(cabCol, 0.5));
        poly([[cx0 + 0.12, y0, zw + 0.06], [cx1 - 0.16, y0, zw + 0.06], [xr - 0.06, y1, zt - 0.1], [cx0 + 0.12, y1, zt - 0.1]], shade('#8fbcc8', L), '#2e3a3f');
        seg([cx0 + 0.62, y0, zw + 0.06], [cx0 + 0.62, y1, zt - 0.1], shade(cabCol, 0.8), 2);
        seg([cx0 + 0.2, y0, zt - 0.16], [cx0 + 0.5, y0, zw + 0.2], 'rgba(235,245,248,0.7)'); }
      if (vis(-1, 0)) poly([[cx0, HW - 0.04, zw], [cx0, -HW + 0.04, zw], [cx0, -HW + 0.08, zt], [cx0, HW - 0.08, zt]], shade(cabCol, lit(-1, 0)), shade(cabCol, 0.5));
      if (vis(1, 0) || true) { const ws = [[cx1 - 0.05, -HW + 0.04, zw], [cx1 - 0.05, HW - 0.04, zw], [xr, HW - 0.08, zt], [xr, -HW + 0.08, zt]];
        const n = [zt - zw, 0], visF = vis(n[0], 0); if (visF) { poly(ws, '#3d5862', '#1f2b30'); seg([cx1 - 0.1, -0.3, zw + 0.1], [xr + 0.02, 0.2, zt - 0.1], 'rgba(220,235,240,0.6)'); } }
      poly([[cx0, -HW + 0.08, zt], [xr, -HW + 0.08, zt], [xr, HW - 0.08, zt], [cx0, HW - 0.08, zt]], shade(cabCol, 1.12), shade(cabCol, 0.5));
      for (const sd of sides) if (vis(0, sd)) mirror(sd);
      if (opts.kind === 'ambulance') { const on = !!opts.siren && Math.floor((SP.now || 0) * 7) % 2 === 1;
        box(cx0 + 0.25, -0.62, zt, cx0 + 0.55, 0.62, zt + 0.14, '#d9dde0', { faces: { left: on ? '#ff5a4f' : '#b8332c', right: on ? '#6cbeff' : '#2f5f9a', front: on ? '#6cbeff' : '#2f5f9a', back: on ? '#ff5a4f' : '#b8332c', top: on ? '#bfe3ff' : '#e6e9ea' } }); }
      // front bumper + plate (drawn even when the front faces away, they stick out below)
      if (vis(1, 0)) box(cx1, -HW + 0.02, 0.4, cx1 + 0.1, HW - 0.02, 0.6, '#3a3f43', { noTop: false });
      if (vis(1, 0)) poly([[cx1 + 0.104, -0.22, 0.43], [cx1 + 0.104, 0.22, 0.43], [cx1 + 0.104, 0.22, 0.56], [cx1 + 0.104, -0.22, 0.56]], '#2a5bd7', '#e8e8e8');
    };
    // cab vs cargo order: whichever is farther draws first
    const cabW = g.W((cx0 + cx1) / 2, 0), bedW = g.W((X0 + cabX) / 2, 0);
    if (cabW[0] + cabW[1] > bedW[0] + bedW[1]) { drawCab(); drawBody(); } else { drawBody(); drawCab(); }
    for (const [x, sd] of nearW) wheel(x, sd);
    ctx.restore(); return true;
  }
  /** soft ground shadow polygon (world) for the shadow pass: footprint swept toward the sun shadow direction (north, a bit east) */
  function shadowPoly(v, h, half) {
    const c = Math.cos(v.heading), s = Math.sin(v.heading), L = (half || 2.1) + 0.1, Wd = 0.9, dx = 0.11 * (h || 1.9) * 0.6, dy = 1.06 * (h || 1.9) * 0.6, pts = [];
    for (const [x, y] of [[-L, -Wd], [L, -Wd], [L, Wd], [-L, Wd]]) { const wx = v.x + x * c - y * s, wy = v.y + x * s + y * c; pts.push([wx, wy], [wx + dx, wy + dy]); }
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  SP.vehicleArt = { drawTruck, shadowPoly, LIVERY, shade };
})(typeof window !== 'undefined' ? window : globalThis);
