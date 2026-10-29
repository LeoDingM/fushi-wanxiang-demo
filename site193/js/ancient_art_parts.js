/* 影视城古镇 art preview — architectural parts: roof (歇山/庑殿/悬山/硬山 with upturned eaves), 台基, lattice windows, 隔扇门,
 * 斗拱, 额枋彩画, plaques, signs, banners, lanterns, timber hall fronts. 未经Leo确认. */
(function (root) {
  'use strict';
  const { shade, C, FONT_SERIF, H } = root.AncientCore;
  const { TILE, RIDGE, RED, RED_W, WOOD, WOOD_D, PAPER, BRICK, STONE, STONE_W, PLASTER, PLASTER_W, CAI_G, CAI_B, GOLD } = C;

  function roof(d, o) {
    const h = H(d), { x0, x1, y0, y1, z } = o, ym = (y0 + y1) / 2, D = (y1 - y0) / 2, Ht = z + o.rise;
    const type = o.type || 'xieshan', lift = o.lift == null ? 0.42 : o.lift;
    const hin = type === 'wudian' ? D : type === 'xieshan' ? D * (o.gable || 0.5) : 0;
    const zg = z + o.rise * (hin / D);
    const col = o.col || TILE, colW = o.colW || shade(col, 0.8), dark = shade(col, 0.6), lite = shade(col, 1.28);
    const cx = (x0 + x1) / 2, hx = (x1 - x0) / 2;
    const ez = (x) => z + lift * Math.pow(Math.min(1, Math.abs((x - cx) / hx)), 3.2);
    const ezW = (y) => z + (hin > 0 ? lift : lift * 0.15) * Math.pow(Math.min(1, Math.abs((y - ym) / D)), 3.2);
    const fl = lift * 0.55;
    const N = Math.max(8, Math.round((x1 - x0) * 3)), M = Math.max(6, Math.round((y1 - y0) * 3));
    const eaveS = [], eaveW = [];
    for (let i = 0; i <= N; i++) { const x = x0 + (x1 - x0) * i / N, e = Math.pow(Math.abs((x - cx) / hx), 3); eaveS.push([x - (i === 0 ? fl : 0) + (i === N ? fl : 0), y0 - fl * e * (hin > 0 ? 1 : 0.3), ez(x)]); }
    for (let i = 0; i <= M; i++) { const y = y0 + (y1 - y0) * i / M, e = Math.pow(Math.abs((y - ym) / D), 3); eaveW.push([x0 - fl * e * (hin > 0 ? 1 : 0.2), y, ezW(y)]); }
    eaveW[0] = eaveS[0].slice();
    const th = o.thick || 0.22, soff = o.soffit || '#4a3022';
    // eave soffit + rafter ends
    h.poly([...eaveS, ...eaveS.slice().reverse().map((p) => [p[0], p[1] + 0.3, p[2] - th])], soff, null);
    for (let i = 1; i < N; i++) { const p = eaveS[i]; h.line([p[0], p[1] + 0.05, p[2] - 0.02], [p[0], p[1] + 0.32, p[2] - th - 0.02], shade(soff, 0.6)); }
    if (hin > 0) {
      h.poly([...eaveW, [x0 + hin, y1 - hin, zg], [x0 + hin, y0 + hin, zg]], colW, shade(colW, 0.6));
      for (let y = y0 + 0.2; y < y1 - 0.1; y += 0.3) {
        const e = eaveW[Math.round((y - y0) / (y1 - y0) * M)];
        let top; if (y < y0 + hin) top = [x0 + (y - y0), y, z + o.rise * ((y - y0) / D)]; else if (y > y1 - hin) top = [x0 + (y1 - y), y, z + o.rise * ((y1 - y) / D)]; else top = [x0 + hin, y, zg];
        h.line(e, top, shade(colW, 0.72)); h.line([e[0], e[1] + 0.08, e[2]], [top[0], top[1] + 0.08, top[2]], shade(colW, 1.14));
      }
      if (type === 'xieshan') {
        const gc = o.gableCol || RED_W;
        h.poly([[x0 + hin, y0 + hin, zg], [x0 + hin, ym, Ht], [x0 + hin, y1 - hin, zg]], gc, shade(gc, 0.55));
        for (let k = 1; k < 4; k++) { const zz = zg + (Ht - zg) * k / 4.2, w = (1 - (zz - zg) / (Ht - zg)) * (D - hin); h.line([x0 + hin, ym - w, zz], [x0 + hin, ym + w, zz], shade(gc, 0.7)); }
        h.pline([[x0 + hin - 0.05, y0 + hin - 0.1, zg - 0.05], [x0 + hin - 0.05, ym, Ht + 0.08], [x0 + hin - 0.05, y1 - hin + 0.1, zg - 0.05]], shade(gc, 0.45), 3);
        h.poly([[x0 + hin - 0.06, ym - 0.12, Ht - 0.15], [x0 + hin - 0.06, ym + 0.12, Ht - 0.15], [x0 + hin - 0.06, ym, Ht - 0.75]], GOLD, shade(GOLD, 0.6));
      }
    } else {
      const gx = x0 + (type === 'xuanshan' ? (o.over || 0.45) : 0.02), gc = o.gableCol || PLASTER_W;
      h.poly([[gx, y0 + 0.3, z - 0.1], [gx, ym, Ht - 0.12], [gx, y1 - 0.3, z - 0.1]], gc, shade(gc, 0.6));
      if (o.gableBrick) for (let zz = z; zz < Ht - 0.2; zz += 0.16) { const w = (1 - (zz - z) / (Ht - z)) * (D - 0.3); h.line([gx - 0.005, ym - w, zz], [gx - 0.005, ym + w, zz], shade(gc, 0.82)); }
      if (type === 'xuanshan') { for (let k = 0; k < 4; k++) { const yy = ym + (k - 1.5) * D * 0.35; h.line([gx, yy, z], [gx, yy, z + o.rise * (1 - Math.abs(yy - ym) / D) - 0.1], shade(WOOD, 0.9)); } h.line([gx, y0 + 0.4, z + 0.15], [gx, y1 - 0.4, z + 0.15], shade(WOOD, 0.9), 2); }
      h.poly([[x0, y0, ezW(y0)], [x0, ym, Ht], [x0 - 0.02, ym, Ht + 0.12], [x0 - 0.02, y0 - 0.05, ezW(y0) + 0.12]], shade(colW, 0.85), shade(colW, 0.55));
      h.pline([[x0 - 0.03, y0 - 0.02, ezW(y0) + 0.06], [x0 - 0.03, ym, Ht + 0.06], [x0 - 0.03, y1, ezW(y1) + 0.06]], o.barge || WOOD_D, 2);
    }
    let topS = [[x1 - hin, y0 + hin, zg], [x1 - hin, ym, Ht], [x0 + hin, ym, Ht], [x0 + hin, y0 + hin, zg]];
    if (hin === 0) topS = [[x1, ym, Ht], [x0, ym, Ht]];
    h.poly([...eaveS, ...topS], col, shade(col, 0.55));
    for (let x = x0 + 0.15; x < x1 - 0.05; x += 0.3) {
      const e = eaveS[Math.round((x - x0) / (x1 - x0) * N)];
      let top; if (hin === 0) top = [x, ym, Ht]; else if (x < x0 + hin) top = [x, y0 + (x - x0), z + o.rise * ((x - x0) / D)]; else if (x > x1 - hin) top = [x, y0 + (x1 - x), z + o.rise * ((x1 - x) / D)]; else top = [x, ym, Ht];
      h.line(e, top, dark); h.line([e[0] + 0.08, e[1], e[2]], [top[0] + 0.08, top[1], top[2]], lite);
    }
    for (let k = 1; k < 6; k++) { const f = k / 6, pts = []; for (let i = 0; i <= N; i++) { const x = x0 + (x1 - x0) * i / N; let lim = hin === 0 ? 1 : x < x0 + hin ? (x - x0) / D : x > x1 - hin ? (x1 - x) / D : 1; if (f > lim) continue; const e = eaveS[i]; pts.push([e[0], e[1] + (ym - e[1]) * f, e[2] + (Ht - e[2]) * f]); } if (pts.length > 1) h.pline(pts, shade(col, 0.88)); }
    h.pline(eaveS, shade(col, 0.5), 2);
    for (let i = 0; i <= N * 2; i++) { const p = eaveS[Math.min(N, Math.round(i / 2))], q = h.P(...p); d.g.fillStyle = i % 2 ? shade(col, 0.45) : lite; d.g.fillRect(Math.round(q[0]), Math.round(q[1]), 1, 2); }
    h.pline(eaveW, shade(colW, 0.5), 2);
    const rcol = o.ridge || RIDGE;
    const hipLine = (a, b) => { h.line(a, b, rcol, 3); h.line([a[0], a[1], a[2] + 0.06], [b[0], b[1], b[2] + 0.06], shade(rcol, 1.4)); };
    if (hin > 0) {
      hipLine(eaveS[0], [x0 + hin, y0 + hin, zg]); hipLine(eaveS[N], [x1 - hin, y0 + hin, zg]);
      if (type === 'xieshan') { hipLine([x0 + hin, y0 + hin, zg], [x0 + hin, ym, Ht]); hipLine([x1 - hin, y0 + hin, zg], [x1 - hin, ym, Ht]); }
      for (const [c, s] of [[eaveS[0], -1], [eaveS[N], 1]]) {
        h.line(c, [c[0] + s * 0.25, c[1] - 0.2, c[2] + 0.4], rcol, 3);
        for (let k = 1; k <= (o.beasts || 0); k++) { const q = h.P(c[0] - s * k * 0.28, c[1] + k * 0.28, c[2] + k * 0.17 + 0.12); d.g.fillStyle = shade(rcol, 1.25); d.g.fillRect(Math.round(q[0]) - 1, Math.round(q[1]) - 2, 2, 3); }
      }
    }
    const rx0 = hin > 0 ? x0 + hin : x0, rx1 = hin > 0 ? x1 - hin : x1, rh = o.ridgeH == null ? 0.38 : o.ridgeH;
    if (rh > 0) {
      d.box(rx0, ym - 0.12, Ht - 0.05, rx1, ym + 0.12, Ht + rh, rcol, { line: shade(rcol, 0.6), top: shade(rcol, 1.3) });
      h.QS(ym - 0.12, rx0, Ht + rh * 0.45, rx1, Ht + rh * 0.62, shade(rcol, 1.25));
      if (o.chiwen !== false) for (const [x, s] of [[rx0, -1], [rx1, 1]]) {
        const b = rh + 0.1;
        h.poly([[x, ym - 0.13, Ht], [x + s * 0.12, ym - 0.13, Ht + b + 0.55], [x - s * 0.35, ym - 0.13, Ht + b + 0.35], [x - s * 0.15, ym - 0.13, Ht + b], [x - s * 0.35, ym - 0.13, Ht + b - 0.05], [x - s * 0.35, ym - 0.13, Ht]], shade(rcol, 1.05), shade(rcol, 0.5));
        h.line([x - s * 0.05, ym - 0.14, Ht + b + 0.4], [x - s * 0.25, ym - 0.14, Ht + b + 0.32], shade(rcol, 1.5));
      }
    }
  }
  function platform(d, x0, y0, x1, y1, z1, o = {}) {
    const h = H(d), col = o.col || STONE, colW = o.colW || STONE_W;
    d.box(x0, y0, 0, x1, y1, z1, col, { line: shade(col, 0.55), west: colW, top: shade(col, 1.08) });
    for (let x = x0 + 0.9; x < x1; x += 0.9) h.line([x, y0, 0.02], [x, y0, z1 - 0.06], shade(col, 0.75));
    h.line([x0, y0, z1 - 0.08], [x1, y0, z1 - 0.08], shade(col, 0.7));
    for (let y = y0 + 0.9; y < y1; y += 0.9) h.line([x0, y, 0.02], [x0, y, z1 - 0.06], shade(colW, 0.78));
    for (const st of o.steps || []) {
      const n = Math.max(2, Math.round(z1 / 0.16)), dz = z1 / n;
      for (let k = 0; k < n; k++) d.box(st[0] - st[1] / 2, y0 - (n - k) * 0.3, 0, st[0] + st[1] / 2, y0 - (n - k - 1) * 0.3, dz * (k + 1), col, { line: shade(col, 0.5), west: colW });
      d.box(st[0] - st[1] / 2 - 0.25, y0 - n * 0.3, 0, st[0] - st[1] / 2, y0, z1, shade(col, 0.95), { line: shade(col, 0.5) });
      d.box(st[0] + st[1] / 2, y0 - n * 0.3, 0, st[0] + st[1] / 2 + 0.25, y0, z1, shade(col, 0.95), { line: shade(col, 0.5) });
    }
  }
  function lattice(d, y, x0, z0, x1, z1, o = {}) {
    const h = H(d), fr = o.frame || WOOD, paper = o.paper || PAPER, st = o.style || 'grid', lc = o.lc || shade(fr, 0.85);
    h.QS(y, x0, z0, x1, z1, fr, shade(fr, 0.5));
    const m = 0.07, X0 = x0 + m, X1 = x1 - m, Z0 = z0 + m, Z1 = z1 - m;
    h.QS(y - 0.005, X0, Z0, X1, Z1, paper, shade(fr, 0.6));
    if (st === 'grid' || st === 'bubujin') {
      const s = o.step || 0.13;
      for (let x = X0 + s; x < X1 - 0.02; x += s) h.line([x, y - 0.01, Z0], [x, y - 0.01, Z1], lc);
      for (let z = Z0 + s; z < Z1 - 0.02; z += s) h.line([X0, y - 0.01, z], [X1, y - 0.01, z], lc);
      if (st === 'bubujin') { const cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2; h.QS(y - 0.012, cx - (X1 - X0) * 0.18, cz - (Z1 - Z0) * 0.18, cx + (X1 - X0) * 0.18, cz + (Z1 - Z0) * 0.18, paper, lc); }
    } else if (st === 'diamond') {
      const s = o.step || 0.16, Hh = Z1 - Z0;
      for (let a = X0 - Hh; a < X1; a += s) {
        const p0 = [Math.max(X0, a), Z0 + Math.max(0, X0 - a)], p1 = [Math.min(X1, a + Hh), Z0 + Math.min(Hh, X1 - a)];
        if (p1[0] > p0[0]) { h.line([p0[0], y - 0.01, p0[1]], [p1[0], y - 0.01, p1[1]], lc); h.line([p0[0], y - 0.01, Z1 - (p0[1] - Z0)], [p1[0], y - 0.01, Z1 - (p1[1] - Z0)], lc); }
      }
    } else if (st === 'vbars') { for (let x = X0 + 0.07; x < X1; x += 0.09) h.line([x, y - 0.01, Z0], [x, y - 0.01, Z1], lc); }
    h.line([x0, y - 0.01, z0], [x1, y - 0.01, z0], shade(fr, 0.5), 2);
  }
  function latticeW(d, x, y0, z0, y1, z1, o = {}) {
    const h = H(d), fr = shade(o.frame || WOOD, 0.85), paper = shade(o.paper || PAPER, 0.85), m = 0.07, s = o.step || 0.13;
    h.QW(x, y0, z0, y1, z1, fr, shade(fr, 0.5)); h.QW(x - 0.005, y0 + m, z0 + m, y1 - m, z1 - m, paper, shade(fr, 0.6));
    for (let y = y0 + m + s; y < y1 - m; y += s) h.line([x - 0.01, y, z0 + m], [x - 0.01, y, z1 - m], shade(fr, 0.9));
    for (let z = z0 + m + s; z < z1 - m; z += s) h.line([x - 0.01, y0 + m, z], [x - 0.01, y1 - m, z], shade(fr, 0.9));
  }
  function geshan(d, y, x0, z0, x1, z1, n, o = {}) {
    const h = H(d), fr = o.frame || WOOD, w = (x1 - x0) / n;
    for (let i = 0; i < n; i++) {
      const a = x0 + i * w, b = a + w;
      if (o.open && o.open.includes(i)) { h.QS(y, a, z0, b, z1, o.inside || '#2a1e18', shade(fr, 0.5)); continue; }
      h.QS(y, a, z0, b, z1, fr, shade(fr, 0.45));
      lattice(d, y - 0.004, a + 0.05, z0 + (z1 - z0) * 0.42, b - 0.05, z1 - 0.07, { frame: fr, paper: o.paper, style: o.style || 'grid', step: 0.11 });
      h.QS(y - 0.006, a + 0.08, z0 + 0.12, b - 0.08, z0 + (z1 - z0) * 0.34, shade(fr, 0.85), shade(fr, 0.55));
      h.QS(y - 0.008, a + 0.14, z0 + 0.2, b - 0.14, z0 + (z1 - z0) * 0.28, shade(fr, 1.08));
    }
  }
  function dougong(d, y, xs, z, o = {}) {
    const c = o.col || '#7a4a2c', g1 = o.paint || CAI_G, g2 = o.paint2 || CAI_B, s = o.size || 1, L = shade(c, 0.5);
    for (const x of xs) {
      d.box(x - 0.16 * s, y - 0.05, z, x + 0.16 * s, y + 0.3, z + 0.14 * s, c, { line: L, south: g1 });
      d.box(x - 0.5 * s, y - 0.12, z + 0.14 * s, x + 0.5 * s, y + 0.25, z + 0.24 * s, c, { line: L, south: g2 });
      d.box(x - 0.1 * s, y - 0.4 * s, z + 0.14 * s, x + 0.1 * s, y + 0.1, z + 0.3 * s, c, { line: L, south: shade(c, 1.1) });
      for (const k of [-1, 0, 1]) d.box(x + k * 0.42 * s - 0.09 * s, y - 0.14 - (k === 0 ? 0.3 * s : 0), z + 0.24 * s, x + k * 0.42 * s + 0.09 * s, y + 0.2, z + 0.34 * s, c, { line: L, south: g1 });
      d.box(x - 0.72 * s, y - 0.18, z + 0.34 * s, x + 0.72 * s, y + 0.2, z + 0.44 * s, c, { line: L, south: g2 });
      d.box(x - 0.08 * s, y - 0.62 * s, z + 0.3 * s, x + 0.08 * s, y - 0.2, z + 0.44 * s, c, { line: L, south: shade(c, 1.15) });
    }
  }
  function efang(d, y, x0, x1, z0, z1, o = {}) {
    const h = H(d), b = o.base || CAI_B, g = o.alt || CAI_G;
    d.box(x0, y - 0.04, z0, x1, y + 0.2, z1, b, { line: shade(b, 0.45), west: shade(g, 0.8), top: shade(b, 0.8) });
    if (o.plain) return;
    const L = x1 - x0, n = Math.max(1, Math.round(L / 3.5));
    for (let i = 0; i < n; i++) {
      const a = x0 + L * i / n, c = a + L / n;
      h.QS(y - 0.045, a + 0.08, z0 + 0.04, a + (c - a) * 0.22, z1 - 0.04, g); h.QS(y - 0.045, c - (c - a) * 0.22, z0 + 0.04, c - 0.08, z1 - 0.04, g);
      h.QS(y - 0.05, a + (c - a) * 0.3, z0 + (z1 - z0) * 0.25, c - (c - a) * 0.3, z1 - (z1 - z0) * 0.25, o.mid || '#d8c7a0', shade(GOLD, 0.6));
      h.line([a + (c - a) * 0.22, y - 0.05, z0], [a + (c - a) * 0.22, y - 0.05, z1], GOLD); h.line([c - (c - a) * 0.22, y - 0.05, z0], [c - (c - a) * 0.22, y - 0.05, z1], GOLD);
    }
  }
  function plaque(d, y, xc, z, text, o = {}) {
    const h = H(d), size = o.size || 15, w = o.w || Math.max(1.2, text.length * size / 32 * 1.15 + 0.4), ht = o.h || size / 39.19 * 1.5;
    h.QS(y - 0.02, xc - w / 2 - 0.06, z - ht / 2 - 0.06, xc + w / 2 + 0.06, z + ht / 2 + 0.06, o.frame || GOLD, shade(o.frame || GOLD, 0.45));
    h.QS(y - 0.03, xc - w / 2, z - ht / 2, xc + w / 2, z + ht / 2, o.bg || '#1f2f4a', shade(o.bg || '#1f2f4a', 0.5));
    h.stext(text, xc, y - 0.04, z, size, o.col || '#f0cf6a', { font: o.font || FONT_SERIF });
  }
  function vsign(d, y, xc, ztop, text, o = {}) {
    const h = H(d), size = o.size || 12, w = o.w || 0.5, ht = text.length * size / 39.19 * 1.08 + 0.3;
    h.QS(y - 0.02, xc - w / 2, ztop - ht, xc + w / 2, ztop, o.bg || '#2a1e16', shade(o.bg || '#2a1e16', 0.4));
    h.QS(y - 0.025, xc - w / 2 + 0.05, ztop - ht + 0.05, xc + w / 2 - 0.05, ztop - 0.05, null, o.frame || GOLD);
    h.vtext(text, xc, y - 0.03, ztop - 0.15 - size / 39.19 * 0.5, size, o.col || '#f0cf6a');
  }
  function banner(d, x, y, ztop, text, o = {}) {
    const h = H(d), col = o.col || '#c8322c', w = o.w || 0.55, L = o.len || 1.5, size = o.size || 13;
    if (o.pole !== false) h.line([x, y + 0.6, ztop + 0.08], [x, y - 0.25, ztop + 0.08], WOOD_D, 2);
    d.face([[x - w / 2, y - 0.1, ztop], [x + w / 2, y - 0.1, ztop], [x + w / 2 + 0.03, y - 0.1, ztop - L], [x + w * 0.12, y - 0.1, ztop - L - 0.2], [x - w / 2 - 0.02, y - 0.1, ztop - L]], col, shade(col, 0.5));
    h.QS(y - 0.11, x - w / 2, ztop - 0.12, x + w / 2, ztop, o.trim || shade(col, 0.6));
    if (o.border) h.QS(y - 0.11, x - w / 2 + 0.05, ztop - L + 0.06, x + w / 2 - 0.05, ztop - 0.17, null, o.border);
    h.vtext(text, x, y - 0.12, ztop - 0.2 - size / 39.19 * 0.55, size, o.tc || '#f6efd8');
    for (let k = 0; k < 3; k++) h.line([x - w / 2 + 0.1 + k * w * 0.3, y - 0.1, ztop - L + 0.02], [x - w / 2 + 0.1 + k * w * 0.3, y - 0.1, ztop - L - 0.12], shade(col, 0.7));
  }
  function lantern(d, x, y, z, o = {}) {
    const h = H(d), col = o.col || '#d0302a', r = (o.r || 0.2) * 45.25 * 0.8, cord = o.cord == null ? 0.25 : o.cord, g = d.g;
    h.line([x, y, z], [x, y, z - cord], '#2a1a12');
    const c = h.P(x, y, z - cord - (o.r || 0.2) * 1.2);
    g.fillStyle = '#3a2a1a'; g.fillRect(Math.round(c[0] - r * 0.5), Math.round(c[1] - r * 1.15), Math.max(2, Math.round(r)), 2); g.fillRect(Math.round(c[0] - r * 0.5), Math.round(c[1] + r * 1.0), Math.max(2, Math.round(r)), 2);
    g.beginPath(); g.ellipse(c[0], c[1], r, r * 1.05, 0, 0, Math.PI * 2); g.fillStyle = col; g.fill(); g.strokeStyle = shade(col, 0.5); g.lineWidth = 1; g.stroke();
    g.fillStyle = shade(col, 0.72); for (const f of [-0.55, 0.55]) g.fillRect(Math.round(c[0] + f * r), Math.round(c[1] - r * 0.8), 1, Math.round(r * 1.6));
    g.fillStyle = shade(col, 1.35); g.fillRect(Math.round(c[0] - r * 0.35), Math.round(c[1] - r * 0.6), 1, Math.max(1, Math.round(r * 0.9)));
    if (o.text) { g.fillStyle = '#1a1210'; g.font = `bold ${Math.max(7, Math.round(r * 1.1))}px ${FONT_SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.text, c[0] + 1, c[1] + 1); }
    g.fillStyle = '#e8c050'; g.fillRect(Math.round(c[0]), Math.round(c[1] + r * 1.05) + 2, 1, 3);
  }
  function lanternGlow(d, x, y, z, o = {}) {
    const h = H(d), cord = o.cord == null ? 0.25 : o.cord, r = (o.r || 0.2) * 45.25 * 0.8, c = h.P(x, y, z - cord - (o.r || 0.2) * 1.2), g = d.g;
    g.beginPath(); g.ellipse(c[0], c[1], r * 0.95, r, 0, 0, Math.PI * 2); g.fillStyle = o.col || '#ffb050'; g.fill();
    g.fillStyle = '#fff2c0'; g.fillRect(Math.round(c[0] - r * 0.3), Math.round(c[1] - r * 0.5), Math.max(1, Math.round(r * 0.6)), Math.max(1, Math.round(r)));
  }
  function hallFront(d, y, x0, z0, ztop, bays, o = {}) {
    const h = H(d), colR = o.colR || 0.15, colC = o.colC || RED; let x = x0;
    for (const b of bays) {
      const a = x + colR, c = x + b.w - colR;
      if (b.fill === 'door') geshan(d, y + 0.25, a, z0, c, ztop - 0.05, b.n || 4, { frame: o.frame || RED_W, style: b.style || o.style, open: b.open, inside: b.inside });
      else if (b.fill === 'win') {
        const sc = o.sillCol || BRICK, sill = b.sill || 0.9;
        h.QS(y + 0.25, a, z0, c, z0 + sill, sc, shade(sc, 0.55));
        if (sc !== PLASTER) for (let zz = z0 + 0.18; zz < z0 + sill; zz += 0.18) h.line([a, y + 0.24, zz], [c, y + 0.24, zz], shade(sc, 0.82));
        lattice(d, y + 0.24, a, z0 + sill, c, ztop - 0.05, { frame: o.frame || RED_W, style: b.style || o.style || 'grid', step: b.step });
      } else if (b.fill === 'open') h.QS(y + 0.3, a, z0, c, ztop, b.inside || '#2e2219', null);
      else if (b.fill === 'skip') {} else if (b.fill === 'wall') h.QS(y + 0.25, a, z0, c, ztop, o.wall || PLASTER, shade(o.wall || PLASTER, 0.6));
      x += b.w;
    }
    const xs = [x0]; x = x0; for (const b of bays) { x += b.w; xs.push(x); }
    for (const xc of xs) h.column(xc, y + 0.15, z0, ztop, colR, colC, { base: STONE });
    return xs;
  }
  /** lean-to eave strip on the W side (slope rising toward +x) */
  function leanW(d, x0, x1, y0, y1, z0, z1, o = {}) {
    const h = H(d), col = shade(o.col || TILE, 0.8);
    h.poly([[x0, y0, z0], [x0, y1, z0], [x1, y1, z1], [x1, y0 + (x1 - x0), z1]], col, shade(col, 0.55));
    for (let y = y0 + 0.3; y < y1; y += 0.3) { const ys = Math.max(y, y0 + (x1 - x0)); h.line([x0, y, z0], [x1, ys, z1], shade(col, 0.75)); h.line([x0, y + 0.08, z0], [x1, ys + 0.08, z1], shade(col, 1.12)); }
    h.line([x0, y0, z0], [x1, y0 + (x1 - x0), z1], o.ridge || RIDGE, 3);
    h.pline([[x0, y0, z0], [x0, y1, z0]], shade(col, 0.5), 2);
  }
  root.AncientParts = { leanW, roof, platform, lattice, latticeW, geshan, dougong, efang, plaque, vsign, banner, lantern, lanternGlow, hallFront };
})(typeof window !== 'undefined' ? window : globalThis);
