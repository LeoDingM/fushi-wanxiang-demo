/* 鹰山宋城 — Song module atlas (井槐里-style kitbash).
 * Pre-bakes textured isometric modules (瓦 / 柱 / 匾 / 窗 / 招幌 / 隔扇 / 斗拱 / 墙板 / 屋脊 / 城砖垛口女墙) into an atlas,
 * then AncientParts stamps them instead of live polyline描线. Aligns with community atlas pipeline
 * (kit_ancient/kit_atlas.png + kit_manifest.json).
 * Site197 facade-detail：门/窗/隔扇/斗拱/屋脊瓦再细化 + 新模块（万字窗、板门、雕刻隔扇、大斗拱、脊瓦、门槛）。
 * Site198 wall-merlon：南薰门/城墙 城砖·垛口·女墙 atlas 模块（禁纯线稿）。
 * Site198 roof-ridge：屋脊线/瓦当/鸱吻/屋檐滴水 atlas 细节增强；店铺与公建屋顶更密。禁纯线稿。
 * 未经Leo确认. */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A) throw new Error('RongqiaoArt first');
  const { shade, C, FONT_SERIF } = root.AncientCore;
  const KX = 32, KY = 16, PZ = 39.1918;
  const TILE = C.TILE, RED = C.RED, RED_W = C.RED_W, WOOD = C.WOOD, WOOD_D = C.WOOD_D;
  const PAPER = C.PAPER, BRICK = C.BRICK, STONE = C.STONE, PLASTER = C.PLASTER, PLASTER_W = C.PLASTER_W;
  const CAI_G = C.CAI_G, CAI_B = C.CAI_B, GOLD = C.GOLD, RIDGE = C.RIDGE;

  let atlas = null, ag = null, frames = {}, ready = false;

  let _makeCanvas = null;
  function defaultMake(w, h) {
    if (_makeCanvas) return _makeCanvas(w, h);
    if (typeof document !== 'undefined' && document.createElement) {
      const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
    }
    throw new Error('AncientAtlas: no makeCanvas (set AncientAtlas._makeCanvas for node)');
  }

  function painter(g, ox, oy) {
    const P = (x, y, z) => [ox + (x - y) * KX, oy - (x + y) * KY - (z || 0) * PZ];
    function poly(pts, fill, line, lw) {
      g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath();
      if (fill) { g.fillStyle = fill; g.fill(); }
      if (line) { g.strokeStyle = line; g.lineWidth = lw || 1; g.stroke(); }
    }
    const face = (pts, fill, line, lw) => poly(pts.map((p) => P(p[0], p[1], p[2])), fill, line, lw);
    function box(x0, y0, z0, x1, y1, z1, col, o = {}) {
      const line = o.line === false ? null : o.line || shade(col, 0.55);
      if (!o.noW) face([[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]], o.west || shade(col, 0.8), line);
      if (!o.noS) face([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], o.south || col, line);
      if (!o.noTop) face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], o.top || shade(col, 1.12), line);
    }
    function seg(a, b, col, lw) {
      const p = P(...a), q = P(...b);
      g.strokeStyle = col; g.lineWidth = lw || 1; g.beginPath();
      g.moveTo(Math.round(p[0]) + 0.5, Math.round(p[1]) + 0.5); g.lineTo(Math.round(q[0]) + 0.5, Math.round(q[1]) + 0.5); g.stroke();
    }
    function QS(y, x0, z0, x1, z1, fill, line) { face([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], fill, line); }
    function QW(x, y0, z0, y1, z1, fill, line) { face([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]], fill, line); }
    return { P, g, poly, face, box, seg, QS, QW };
  }

  function boundsOf(geo, pad) {
    const [x0, y0, z0, x1, y1, z1] = geo, xs = [], ys = []; pad = pad == null ? 4 : pad;
    for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) {
      xs.push((x - y) * KX); ys.push(-(x + y) * KY - z * PZ);
    }
    return [Math.floor(Math.min(...xs)) - pad, Math.floor(Math.min(...ys)) - pad, Math.ceil(Math.max(...xs)) + pad, Math.ceil(Math.max(...ys)) + pad];
  }

  /* ---- module painters (local metres; origin at bay bottom-left on S face unless noted) ---- */
  function paintWallPlasterS(d, w, h, o = {}) {
    const fr = o.frame || WOOD, pl = o.col || PLASTER;
    d.QS(0, 0, 0, w, h, pl, shade(pl, 0.55));
    // timber posts + mid rail + top plate (textured, not sparse lines)
    d.QS(0 - 0.01, 0, 0, 0.08, h, shade(fr, 0.95), shade(fr, 0.5));
    d.QS(0 - 0.01, w - 0.08, 0, w, h, shade(fr, 0.95), shade(fr, 0.5));
    d.QS(0 - 0.01, 0, h - 0.12, w, h, shade(fr, 0.9), shade(fr, 0.5));
    d.QS(0 - 0.01, 0, h * 0.48, w, h * 0.48 + 0.1, shade(fr, 0.92));
    // subtle plaster grit
    for (let i = 0; i < 18; i++) {
      const x = 0.12 + (i * 0.37) % (w - 0.24), z = 0.2 + ((i * 0.61) % (h - 0.4));
      d.QS(0 - 0.005, x, z, x + 0.04, z + 0.03, shade(pl, i % 2 ? 0.94 : 1.06));
    }
  }
  function paintWallBrickS(d, w, h) {
    d.QS(0, 0, 0, w, h, BRICK, shade(BRICK, 0.5));
    for (let z = 0.16, k = 0; z < h - 0.02; z += 0.16, k++) {
      d.seg([0.02, 0 - 0.005, z], [w - 0.02, 0 - 0.005, z], shade(BRICK, 0.78));
      for (let x = (k % 2) * 0.2; x < w - 0.05; x += 0.4) d.seg([x, 0 - 0.005, z], [x, 0 - 0.005, Math.min(h, z + 0.16)], shade(BRICK, 0.72));
    }
  }
  function paintWin(d, w, h, style) {
    const fr = RED_W, paper = PAPER, m = 0.07;
    // outer timber frame (thick, weathered)
    d.QS(0, 0, 0, w, h, fr, shade(fr, 0.42));
    d.QS(-0.004, 0.02, 0.02, w - 0.02, h - 0.02, shade(fr, 0.92), shade(fr, 0.5));
    // paper pane with soft grit (not flat fill)
    d.QS(-0.008, m, m, w - m, h - m, paper, shade(fr, 0.55));
    for (let i = 0; i < 14; i++) {
      const x = m + 0.04 + (i * 0.29) % (w - 2 * m - 0.1);
      const z = m + 0.05 + ((i * 0.47) % (h - 2 * m - 0.12));
      d.QS(-0.009, x, z, x + 0.05, z + 0.04, shade(paper, i % 2 ? 0.94 : 1.06));
    }
    const X0 = m + 0.03, X1 = w - m - 0.03, Z0 = m + 0.03, Z1 = h - m - 0.03, lc = shade(fr, 0.78);
    // inner bead/rebate
    d.QS(-0.01, X0 - 0.015, Z0 - 0.015, X1 + 0.015, Z1 + 0.015, null, shade(fr, 0.55));
    if (style === 'diamond') {
      const s = 0.13, Hh = Z1 - Z0;
      for (let a = X0 - Hh; a < X1; a += s) {
        const p0x = Math.max(X0, a), p0z = Z0 + Math.max(0, X0 - a);
        const p1x = Math.min(X1, a + Hh), p1z = Z0 + Math.min(Hh, X1 - a);
        if (p1x > p0x) {
          d.seg([p0x, -0.012, p0z], [p1x, -0.012, p1z], lc);
          d.seg([p0x, -0.012, Z1 - (p0z - Z0)], [p1x, -0.012, Z1 - (p1z - Z0)], lc);
        }
      }
    } else if (style === 'bubujin') {
      const s = 0.11;
      for (let x = X0 + s; x < X1; x += s) d.seg([x, -0.012, Z0], [x, -0.012, Z1], lc);
      for (let z = Z0 + s; z < Z1; z += s) d.seg([X0, -0.012, z], [X1, -0.012, z], lc);
      const cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2;
      d.QS(-0.014, cx - (X1 - X0) * 0.2, cz - (Z1 - Z0) * 0.2, cx + (X1 - X0) * 0.2, cz + (Z1 - Z0) * 0.2, paper, lc);
      d.QS(-0.016, cx - (X1 - X0) * 0.1, cz - (Z1 - Z0) * 0.1, cx + (X1 - X0) * 0.1, cz + (Z1 - Z0) * 0.1, shade(paper, 1.05), shade(GOLD, 0.7));
    } else if (style === 'wanzi') {
      // 万字纹：田字 + 角拐
      const cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2, s = Math.min(X1 - X0, Z1 - Z0) * 0.18;
      d.seg([cx, -0.012, Z0], [cx, -0.012, Z1], lc);
      d.seg([X0, -0.012, cz], [X1, -0.012, cz], lc);
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const ox = cx + sx * s * 0.9, oz = cz + sz * s * 0.9;
        d.seg([ox, -0.012, oz], [ox + sx * s, -0.012, oz], lc);
        d.seg([ox + sx * s, -0.012, oz], [ox + sx * s, -0.012, oz + sz * s], lc);
        d.seg([ox, -0.012, oz], [ox, -0.012, oz + sz * s], lc);
        d.seg([ox, -0.012, oz + sz * s], [ox + sx * s * 0.55, -0.012, oz + sz * s], lc);
      }
      // fine grid fill
      const g = 0.14;
      for (let x = X0 + g; x < X1; x += g) d.seg([x, -0.011, Z0], [x, -0.011, Z1], shade(fr, 0.88));
      for (let z = Z0 + g; z < Z1; z += g) d.seg([X0, -0.011, z], [X1, -0.011, z], shade(fr, 0.88));
    } else if (style === 'vbars') {
      for (let x = X0 + 0.06; x < X1; x += 0.08) {
        d.QS(-0.012, x - 0.012, Z0, x + 0.012, Z1, shade(fr, 0.95), shade(fr, 0.55));
      }
    } else {
      const s = 0.1;
      for (let x = X0 + s; x < X1; x += s) d.seg([x, -0.012, Z0], [x, -0.012, Z1], lc);
      for (let z = Z0 + s; z < Z1; z += s) d.seg([X0, -0.012, z], [X1, -0.012, z], lc);
    }
    // carved sill + drip edge
    d.QS(-0.01, 0, 0, w, 0.07, shade(fr, 0.65));
    d.QS(-0.012, 0.04, 0.02, w - 0.04, 0.055, shade(GOLD, 0.55));
    d.QS(-0.01, 0, h - 0.06, w, h, shade(fr, 0.7));
    // gold corner pins + mid stile bosses
    for (const [sx, sz] of [[m, m], [w - m, m], [m, h - m], [w - m, h - m], [w / 2, m], [w / 2, h - m]]) {
      d.QS(-0.014, sx - 0.035, sz - 0.035, sx + 0.035, sz + 0.035, GOLD);
      d.QS(-0.015, sx - 0.015, sz - 0.015, sx + 0.015, sz + 0.015, shade(GOLD, 1.25));
    }
  }
  function paintGeshanLeaf(d, w, h, o = {}) {
    const fr = RED_W, m = 0.05, carved = !!(o && o.carved);
    const style = (o && o.style) || 'grid';
    d.QS(0, 0, 0, w, h, fr, shade(fr, 0.38));
    // stile / rail timber with grain
    d.QS(-0.006, 0, 0, 0.05, h, shade(fr, 0.72));
    d.QS(-0.006, w - 0.05, 0, w, h, shade(fr, 0.72));
    d.QS(-0.006, 0, 0, w, 0.06, shade(fr, 0.68));
    d.QS(-0.006, 0, h - 0.06, w, h, shade(fr, 0.68));
    d.QS(-0.008, 0, h * 0.38, w, h * 0.38 + 0.08, shade(fr, 0.78)); // mid rail
    for (let z = 0.1; z < h - 0.08; z += 0.22) {
      d.seg([0.02, -0.01, z], [0.045, -0.01, z], shade(fr, 1.15));
      d.seg([w - 0.045, -0.01, z], [w - 0.02, -0.01, z], shade(fr, 1.15));
    }
    // upper lattice pane
    d.QS(-0.007, m, h * 0.42, w - m, h - m, PAPER, shade(fr, 0.55));
    const s = style === 'diamond' ? 0.11 : 0.09;
    const X0 = m + 0.02, X1 = w - m - 0.02, Z0 = h * 0.42 + 0.02, Z1 = h - m - 0.02, lc = shade(fr, 0.8);
    if (style === 'diamond') {
      const Hh = Z1 - Z0;
      for (let a = X0 - Hh; a < X1; a += s) {
        const p0x = Math.max(X0, a), p0z = Z0 + Math.max(0, X0 - a);
        const p1x = Math.min(X1, a + Hh), p1z = Z0 + Math.min(Hh, X1 - a);
        if (p1x > p0x) {
          d.seg([p0x, -0.012, p0z], [p1x, -0.012, p1z], lc);
          d.seg([p0x, -0.012, Z1 - (p0z - Z0)], [p1x, -0.012, Z1 - (p1z - Z0)], lc);
        }
      }
    } else {
      for (let x = X0 + s; x < X1; x += s) d.seg([x, -0.012, Z0], [x, -0.012, Z1], lc);
      for (let z = Z0 + s; z < Z1; z += s) d.seg([X0, -0.012, z], [X1, -0.012, z], lc);
    }
    // lower carved apron panel
    d.QS(-0.008, m + 0.02, m, w - m - 0.02, h * 0.36, shade(fr, 0.88), shade(fr, 0.48));
    d.QS(-0.01, m + 0.08, m + 0.06, w - m - 0.08, h * 0.32, shade(fr, 1.05));
    if (carved) {
      // relief cloud / peony suggestion
      d.QS(-0.012, m + 0.14, m + 0.12, w - m - 0.14, h * 0.28, shade(GOLD, 0.55));
      d.QS(-0.013, w * 0.35, m + 0.16, w * 0.65, h * 0.26, shade(GOLD, 0.85));
      d.QS(-0.014, w * 0.42, m + 0.2, w * 0.58, h * 0.24, shade(fr, 0.95));
      for (const dx of [-0.12, 0.12]) {
        d.QS(-0.013, w * 0.5 + dx - 0.05, m + 0.18, w * 0.5 + dx + 0.05, h * 0.22, shade(GOLD, 0.7));
      }
    } else {
      d.QS(-0.012, m + 0.14, m + 0.12, w - m - 0.14, h * 0.26, shade(GOLD, 0.65));
      d.QS(-0.013, m + 0.22, m + 0.18, w - m - 0.22, h * 0.22, shade(fr, 1.08));
    }
    // copper door pull / 门环
    const px = w * 0.72, pz = h * 0.28;
    d.QS(-0.015, px - 0.04, pz - 0.04, px + 0.04, pz + 0.04, shade(GOLD, 0.9));
    d.QS(-0.016, px - 0.02, pz - 0.08, px + 0.02, pz - 0.02, shade(GOLD, 1.1));
    // bottom threshold lip
    d.QS(-0.011, 0, 0, w, 0.04, shade(STONE, 0.95), shade(STONE, 0.55));
  }
  function paintBanDoor(d, w, h) {
    const fr = '#3a2a20', stud = GOLD;
    d.QS(0, 0, 0, w, h, fr, shade(fr, 0.4));
    // vertical planks
    for (let x = 0.05; x < w - 0.04; x += 0.16) {
      d.QS(-0.005, x, 0.04, x + 0.14, h - 0.04, shade(fr, 0.95 + ((x * 10) % 3) * 0.04), shade(fr, 0.55));
      d.seg([x + 0.02, -0.008, 0.08], [x + 0.02, -0.008, h - 0.08], shade(fr, 1.15));
    }
    // horizontal battens
    for (const z of [0.18, h * 0.5, h - 0.22]) {
      d.QS(-0.01, 0.04, z - 0.05, w - 0.04, z + 0.05, shade(fr, 0.75), shade(fr, 0.45));
    }
    // metal studs
    for (let row = 0; row < 4; row++) for (let col = 0; col < 3; col++) {
      const x = 0.18 + col * ((w - 0.36) / 2), z = 0.35 + row * ((h - 0.7) / 3);
      d.QS(-0.014, x - 0.03, z - 0.03, x + 0.03, z + 0.03, stud);
      d.QS(-0.015, x - 0.012, z - 0.012, x + 0.012, z + 0.012, shade(stud, 1.3));
    }
    // knocker
    d.QS(-0.016, w * 0.55 - 0.05, h * 0.55 - 0.05, w * 0.55 + 0.05, h * 0.55 + 0.05, shade(stud, 0.85));
    d.QS(-0.017, w * 0.55 - 0.02, h * 0.48, w * 0.55 + 0.02, h * 0.55, shade(stud, 1.1));
    d.QS(-0.01, 0, 0, w, 0.05, STONE, shade(STONE, 0.55));
  }
  function paintColumn(d, h, r) {
    const col = RED, gold = GOLD;
    const a = d.P(0, 0, 0), b = d.P(0, 0, h);
    const w = r * 45.25, L = Math.round(a[0] - w), R = Math.round(a[0] + w), T = Math.round(b[1]), Hh = Math.round(a[1] - b[1]);
    d.g.fillStyle = shade(col, 0.72); d.g.fillRect(L, T, R - L, Hh);
    d.g.fillStyle = col; d.g.fillRect(L, T, Math.max(1, Math.round((R - L) * 0.62)), Hh);
    d.g.fillStyle = shade(col, 1.28); d.g.fillRect(L + 1, T, 1, Hh);
    d.g.fillStyle = shade(col, 0.45); d.g.fillRect(L - 1, T, 1, Hh); d.g.fillRect(R, T, 1, Hh);
    // 金箍 bands
    for (const t of [0.12, 0.5, 0.88]) {
      const yy = Math.round(T + Hh * t);
      d.g.fillStyle = shade(gold, 0.85); d.g.fillRect(L, yy, R - L, 2);
      d.g.fillStyle = shade(gold, 1.35); d.g.fillRect(L + 1, yy, Math.max(1, R - L - 2), 1);
    }
    d.g.fillStyle = shade(gold, 1.1); d.g.fillRect(L - 1, T, R - L + 2, 2);
    d.g.fillStyle = CAI_B; d.g.fillRect(L, T + 2, R - L, 2);
    // stone base disc
    d.g.fillStyle = STONE; d.g.beginPath(); d.g.ellipse(a[0], a[1] - 2, w + 3, (w + 3) * 0.5, 0, 0, Math.PI * 2); d.g.fill();
    d.g.strokeStyle = shade(STONE, 0.6); d.g.lineWidth = 1; d.g.stroke();
  }
  function paintPlaqueFrame(d, w, ht) {
    const fr = GOLD, bg = '#1a2840';
    d.QS(0, -w / 2 - 0.1, -ht / 2 - 0.1, w / 2 + 0.1, ht / 2 + 0.1, shade(fr, 0.7), shade(fr, 0.4));
    d.QS(-0.005, -w / 2 - 0.06, -ht / 2 - 0.06, w / 2 + 0.06, ht / 2 + 0.06, fr, shade(fr, 0.45));
    d.QS(-0.01, -w / 2 - 0.03, -ht / 2 - 0.03, w / 2 + 0.03, ht / 2 + 0.03, shade(fr, 1.25));
    d.QS(-0.015, -w / 2, -ht / 2, w / 2, ht / 2, bg, shade(bg, 0.5));
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const px = sx * (w / 2 + 0.02), pz = sz * (ht / 2 + 0.02);
      d.QS(-0.008, px - 0.06, pz - 0.04, px + 0.06, pz + 0.04, shade(fr, 1.15));
    }
    // tassels
    for (const s of [-1, 1]) {
      d.seg([s * (w / 2 + 0.08), -0.02, -ht / 2], [s * (w / 2 + 0.08), -0.02, -ht / 2 - 0.35], fr);
      d.QS(-0.01, s * (w / 2 + 0.04), -ht / 2 - 0.45, s * (w / 2 + 0.12), -ht / 2 - 0.35, '#c8322c', shade('#c8322c', 0.5));
    }
  }
  function paintBanner(d, w, L, col) {
    col = col || '#c8322c';
    d.face([[-w / 2, 0, 0], [w / 2, 0, 0], [w / 2 + 0.03, 0, -L], [w * 0.12, 0, -L - 0.2], [-w / 2 - 0.02, 0, -L]], col, shade(col, 0.5));
    d.QS(-0.01, -w / 2, -0.12, w / 2, 0, shade(col, 0.6));
    d.QS(-0.012, -w / 2 + 0.02, -0.1, w / 2 - 0.02, -0.02, GOLD);
    d.QS(-0.01, -w / 2 + 0.05, -L + 0.06, w / 2 - 0.05, -0.17, null, GOLD);
    for (let k = 0; k < 5; k++) {
      const tx = -w / 2 + 0.06 + k * w * 0.22;
      d.seg([tx, 0, -L + 0.02], [tx, 0, -L - 0.18 - (k % 2) * 0.06], shade(col, 0.65));
      d.QS(-0.005, tx - 0.03, -L - 0.22 - (k % 2) * 0.06, tx + 0.03, -L - 0.16 - (k % 2) * 0.06, GOLD);
    }
  }
  function paintLantern(d, r) {
    /* Site200：灯笼本体略增暖纸透光高光（白天可读，夜景 emit 叠层更贴） */
    const col = '#d83028', cord = 0.25;
    d.seg([0, 0, 0], [0, 0, -cord], '#2a1a12');
    const c = d.P(0, 0, -cord - r * 1.2), g = d.g;
    const cx = Math.round(c[0]), cy = Math.round(c[1]), rr = r * 45.25 * 0.8;
    g.fillStyle = '#3a2a1a'; g.fillRect(cx - Math.round(rr * 0.55), cy - Math.round(rr * 1.2), Math.max(3, Math.round(rr * 1.1)), 2);
    g.fillStyle = GOLD; g.fillRect(cx - Math.round(rr * 0.45), cy - Math.round(rr * 1.15), Math.max(2, Math.round(rr * 0.9)), 1);
    g.beginPath(); g.ellipse(c[0], c[1], rr, rr * 1.08, 0, 0, Math.PI * 2); g.fillStyle = col; g.fill();
    g.strokeStyle = shade(col, 0.45); g.lineWidth = 1; g.stroke();
    g.fillStyle = shade(col, 1.55); g.beginPath(); g.ellipse(c[0] - rr * 0.15, c[1] - rr * 0.1, rr * 0.5, rr * 0.58, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,220,150,0.35)'; g.beginPath(); g.ellipse(c[0], c[1], rr * 0.55, rr * 0.62, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = shade(col, 0.7);
    for (const f of [-0.6, -0.2, 0.2, 0.6]) g.fillRect(Math.round(c[0] + f * rr), Math.round(c[1] - rr * 0.85), 1, Math.round(rr * 1.7));
    g.fillStyle = '#3a2a1a'; g.fillRect(cx - Math.round(rr * 0.55), cy + Math.round(rr * 1.0), Math.max(3, Math.round(rr * 1.1)), 2);
    g.fillStyle = GOLD; g.fillRect(cx - Math.round(rr * 0.45), cy + Math.round(rr * 1.05), Math.max(2, Math.round(rr * 0.9)), 1);
    g.fillStyle = '#e8c050'; g.fillRect(cx, cy + Math.round(rr * 1.1) + 2, 1, 4);
    g.fillStyle = '#c8322c'; g.fillRect(cx - 1, cy + Math.round(rr * 1.1) + 6, 3, 2);
  }
  function paintTileStripS(d, w) {
    // one eave-course of 筒瓦 + 瓦当 + 滴水 — textured module ~1 m wide (Site198 denser motif)
    const col = TILE, lite = shade(col, 1.28), dark = shade(col, 0.5);
    d.QS(0, 0, 0, w, 0.34, col, dark);
    for (let x = 0.04; x < w; x += 0.16) {
      d.QS(-0.008, x, 0.02, x + 0.09, 0.32, lite, dark);
      d.QS(-0.01, x + 0.015, 0.04, x + 0.075, 0.3, shade(col, 1.42));
      d.seg([x + 0.045, -0.012, 0.02], [x + 0.045, -0.012, 0.32], shade(col, 0.72));
    }
    for (let x = 0.12; x < w; x += 0.16) d.QS(-0.004, x, 0.03, x + 0.07, 0.28, shade(col, 0.76));
    // 瓦当 discs denser + floral motif
    for (let x = 0.08; x < w; x += 0.16) {
      const q = d.P(x, -0.035, -0.02);
      const cx = Math.round(q[0]), cy = Math.round(q[1]) + 1;
      d.g.fillStyle = shade(col, 0.32); d.g.beginPath();
      d.g.ellipse(cx, cy, 3.6, 4.0, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(col, 0.55); d.g.beginPath();
      d.g.ellipse(cx, cy, 2.5, 2.8, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(GOLD, 0.85); d.g.beginPath();
      d.g.ellipse(cx, cy, 1.4, 1.5, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(GOLD, 1.1); d.g.fillRect(cx - 1, cy - 1, 2, 2);
      d.g.fillStyle = shade(GOLD, 0.65); d.g.fillRect(cx, cy - 3, 1, 6); d.g.fillRect(cx - 3, cy, 6, 1);
    }
    // 滴水 denser
    for (let x = 0.16; x < w; x += 0.16) {
      const q = d.P(x, -0.055, -0.1);
      const cx = Math.round(q[0]), cy = Math.round(q[1]);
      d.g.fillStyle = shade(col, 0.48);
      d.g.beginPath(); d.g.moveTo(cx - 2.5, cy); d.g.lineTo(cx + 2.5, cy); d.g.lineTo(cx, cy + 5); d.g.closePath(); d.g.fill();
      d.g.fillStyle = lite; d.g.fillRect(cx - 1, cy, 2, 1);
      d.g.fillStyle = shade(GOLD, 0.55); d.g.fillRect(cx, cy + 1, 1, 2);
    }
  }
  function paintTileCourseS(d, w) {
    const col = TILE, lite = shade(col, 1.22), dark = shade(col, 0.58);
    d.QS(0, 0, 0, w, 0.2, col, dark);
    for (let x = 0.04; x < w; x += 0.16) {
      d.QS(-0.006, x, 0.015, x + 0.09, 0.185, lite, dark);
      d.seg([x + 0.045, -0.01, 0.015], [x + 0.045, -0.01, 0.185], shade(col, 0.7));
    }
    for (let x = 0.12; x < w; x += 0.16) d.QS(-0.003, x, 0.03, x + 0.07, 0.17, shade(col, 0.78));
  }
  function paintTileRidgeS(d, w) {
    const col = RIDGE, lite = shade(col, 1.28), dark = shade(col, 0.52);
    d.box(0, -0.1, 0, w, 0.1, 0.26, col, { line: dark, top: lite, south: shade(col, 0.95) });
    for (let x = 0.08; x < w; x += 0.22) {
      d.QS(-0.105, x - 0.07, 0.03, x + 0.07, 0.24, lite, dark);
      d.QS(-0.11, x - 0.04, 0.07, x + 0.04, 0.22, shade(GOLD, 0.55));
      d.QS(-0.112, x - 0.015, 0.1, x + 0.015, 0.2, shade(GOLD, 0.85));
    }
    d.QS(-0.115, 0, 0.2, w, 0.26, shade(col, 1.38));
    d.QS(-0.12, 0.05, 0.22, w - 0.05, 0.245, shade(GOLD, 0.45));
  }
  /** Site198：独立瓦当模块（圆当 + 兽面/宝相花纹） */
  function paintWadangS(d, w) {
    const col = TILE, dark = shade(col, 0.42), lite = shade(col, 1.3);
    d.QS(0, 0, 0, w, 0.22, col, dark);
    for (let x = 0.12; x < w; x += 0.28) {
      const q = d.P(x, -0.04, 0.08);
      const cx = Math.round(q[0]), cy = Math.round(q[1]);
      d.g.fillStyle = dark; d.g.beginPath(); d.g.ellipse(cx, cy, 5.2, 5.8, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(col, 0.62); d.g.beginPath(); d.g.ellipse(cx, cy, 4.0, 4.4, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = lite; d.g.beginPath(); d.g.ellipse(cx, cy, 2.6, 2.8, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(GOLD, 0.9); d.g.beginPath(); d.g.ellipse(cx, cy, 1.5, 1.6, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(GOLD, 1.15); d.g.fillRect(cx - 1, cy - 1, 2, 2);
      d.g.fillStyle = shade(GOLD, 0.7);
      for (const a of [0, 45, 90, 135]) {
        const rad = a * Math.PI / 180, rr = 3.2;
        d.g.fillRect(cx + Math.round(Math.cos(rad) * rr) - 1, cy + Math.round(Math.sin(rad) * rr) - 1, 2, 2);
      }
    }
  }
  /** Site198：屋檐滴水模块（三角滴水 + 筒瓦接缝） */
  function paintDripS(d, w) {
    const col = TILE, lite = shade(col, 1.25), dark = shade(col, 0.48);
    d.QS(0, 0, 0.06, w, 0.28, col, dark);
    for (let x = 0.06; x < w; x += 0.18) {
      d.QS(-0.006, x, 0.08, x + 0.1, 0.26, lite, dark);
    }
    for (let x = 0.1; x < w; x += 0.18) {
      const q = d.P(x, -0.06, -0.02);
      const cx = Math.round(q[0]), cy = Math.round(q[1]);
      d.g.fillStyle = dark;
      d.g.beginPath(); d.g.moveTo(cx - 3, cy); d.g.lineTo(cx + 3, cy); d.g.lineTo(cx, cy + 7); d.g.closePath(); d.g.fill();
      d.g.fillStyle = lite; d.g.beginPath(); d.g.moveTo(cx - 2, cy); d.g.lineTo(cx + 2, cy); d.g.lineTo(cx, cy + 5); d.g.closePath(); d.g.fill();
      d.g.fillStyle = shade(GOLD, 0.55); d.g.fillRect(cx, cy + 1, 1, 3);
    }
  }
  /** Site198：鸱吻/正脊兽 atlas 模块（贴图拼装，非纯线稿） */
  function paintChiwenS(d, w, o = {}) {
    const flip = !!(o && o.flip);
    const col = RIDGE, lite = shade(col, 1.28), dark = shade(col, 0.48), gold = shade(GOLD, 0.85);
    const s = flip ? -1 : 1;
    // base seat
    d.box(0.05, -0.12, 0, w - 0.05, 0.12, 0.18, col, { line: dark, top: lite, south: shade(col, 0.95) });
    // rising body (fish-dragon silhouette as textured boxes)
    d.box(0.15, -0.14, 0.15, w * 0.55, 0.1, 0.55, col, { line: dark, top: lite, south: shade(col, 1.05) });
    d.box(w * 0.35, -0.16, 0.4, w * 0.72, 0.08, 0.85, col, { line: dark, top: shade(col, 1.2), south: lite });
    // snout / open mouth
    d.box(w * 0.55, -0.18, 0.7, w * 0.95, 0.06, 1.05, col, { line: dark, south: shade(col, 1.12), top: lite });
    d.QS(-0.18, w * 0.62, 0.78, w * 0.9, 0.98, shade(col, 0.7));
    d.QS(-0.185, w * 0.68, 0.82, w * 0.86, 0.94, shade('#1a120e', 0.9));
    // crest / fin
    d.QS(-0.2, w * 0.25, 0.55, w * 0.48, 0.95, gold);
    d.QS(-0.205, w * 0.3, 0.7, w * 0.42, 1.05, shade(GOLD, 1.1));
    // eye
    const eq = d.P(w * 0.48, -0.17, 0.72);
    d.g.fillStyle = '#f0e8c8'; d.g.beginPath();
    d.g.ellipse(Math.round(eq[0]), Math.round(eq[1]), 2.2, 2.4, 0, 0, Math.PI * 2); d.g.fill();
    d.g.fillStyle = '#1a120e'; d.g.fillRect(Math.round(eq[0]), Math.round(eq[1]), 1, 1);
    // scale beads
    for (let z = 0.22; z < 0.7; z += 0.1) {
      for (let x = 0.2; x < w * 0.5; x += 0.12) {
        d.QS(-0.15, x, z, x + 0.06, z + 0.05, shade(col, 1.15 + (z % 0.2) * 0.3));
      }
    }
    // tail curl toward ridge
    d.box(0.02, -0.1, 0.05, 0.22, 0.1, 0.35, col, { line: dark, south: shade(col, 0.9) });
    d.QS(-0.16, 0.04, 0.28, 0.18, 0.42, gold);
    void s;
  }
  function paintThreshold(d, w) {
    d.QS(0, 0, 0, w, 0.18, STONE, shade(STONE, 0.5));
    d.QS(-0.005, 0.04, 0.04, w - 0.04, 0.14, shade(STONE, 1.08));
    for (let x = 0.15; x < w; x += 0.35) d.seg([x, -0.008, 0.02], [x, -0.008, 0.16], shade(STONE, 0.72));
    d.QS(-0.008, 0, 0, w, 0.03, shade(STONE, 0.7));
    d.QS(-0.008, 0, 0.15, w, 0.18, shade(WOOD, 0.75));
  }
  function paintDougong(d, o = {}) {
    const large = !!(o && o.large);
    const s = large ? 1.35 : 1;
    const c = '#7a4a2c', g1 = CAI_G, g2 = CAI_B, L = shade(c, 0.48);
    // 坐斗
    d.box(-0.18 * s, -0.06, 0, 0.18 * s, 0.32, 0.16 * s, c, { line: L, south: g1, top: shade(c, 1.15) });
    d.QS(-0.07, -0.14 * s, 0.12 * s, 0.14 * s, 0.15 * s, GOLD);
    // 华栱 / 横栱 layer 1
    d.box(-0.55 * s, -0.14, 0.16 * s, 0.55 * s, 0.28, 0.28 * s, c, { line: L, south: g2, top: shade(c, 1.1) });
    d.QS(-0.15, -0.5 * s, 0.18 * s, 0.5 * s, 0.2 * s, shade(g1, 1.15));
    // 昂 / 出跳
    d.box(-0.1 * s, -0.48 * s, 0.16 * s, 0.1 * s, 0.12, 0.34 * s, c, { line: L, south: shade(c, 1.12), top: shade(c, 1.2) });
    d.QS(-0.49 * s, -0.06 * s, 0.28 * s, -0.42 * s, 0.32 * s, shade(GOLD, 0.75)); // tip
    // 散斗 trio
    for (const k of [-1, 0, 1]) {
      d.box(k * 0.45 * s - 0.1 * s, -0.16 - (k === 0 ? 0.28 * s : 0), 0.28 * s, k * 0.45 * s + 0.1 * s, 0.22, 0.4 * s, c, { line: L, south: g1, top: shade(c, 1.12) });
      d.QS(-0.17 - (k === 0 ? 0.28 * s : 0), k * 0.45 * s - 0.06 * s, 0.36 * s, k * 0.45 * s + 0.06 * s, 0.38 * s, GOLD);
    }
    // upper 枋 / 挑檐枋
    d.box(-0.78 * s, -0.2, 0.4 * s, 0.78 * s, 0.22, 0.52 * s, c, { line: L, south: g2, top: shade(c, 1.18) });
    d.QS(-0.21, -0.72 * s, 0.48 * s, 0.72 * s, 0.52 * s, GOLD);
    d.QS(-0.21, -0.72 * s, 0.4 * s, 0.72 * s, 0.43 * s, shade(GOLD, 0.8));
    // second 昂 for large
    if (large) {
      d.box(-0.08 * s, -0.72 * s, 0.34 * s, 0.08 * s, -0.2, 0.52 * s, c, { line: L, south: shade(c, 1.18) });
      d.box(-0.95 * s, -0.24, 0.52 * s, 0.95 * s, 0.2, 0.62 * s, c, { line: L, south: g1, top: shade(c, 1.2) });
      d.QS(-0.25, -0.9 * s, 0.58 * s, 0.9 * s, 0.62 * s, GOLD);
      // caihua face panels
      d.QS(-0.22, -0.4 * s, 0.44 * s, -0.15 * s, 0.5 * s, g1);
      d.QS(-0.22, 0.15 * s, 0.44 * s, 0.4 * s, 0.5 * s, g1);
    } else {
      d.box(-0.08 * s, -0.62 * s, 0.34 * s, 0.08 * s, -0.18, 0.5 * s, c, { line: L, south: shade(c, 1.15) });
    }
    d.QS(-0.15, -0.48 * s, 0.16 * s, 0.48 * s, 0.18 * s, shade(g1, 1.2));
  }
  function paintEfangUnit(d, w) {
    const b = CAI_B, g = CAI_G, z0 = 0, z1 = 0.35;
    d.box(0, -0.04, z0, w, 0.2, z1, b, { line: shade(b, 0.45), west: shade(g, 0.8), top: shade(b, 0.8) });
    d.QS(-0.045, 0, z1 - 0.03, w, z1, GOLD);
    d.QS(-0.045, 0, z0, w, z0 + 0.03, shade(GOLD, 0.85));
    const m = w / 2, zh = (z0 + z1) / 2;
    d.QS(-0.045, 0.06, z0 + 0.04, w * 0.2, z1 - 0.04, g);
    d.QS(-0.045, w - w * 0.2, z0 + 0.04, w - 0.06, z1 - 0.04, g);
    d.QS(-0.05, w * 0.28, z0 + (z1 - z0) * 0.22, w - w * 0.28, z1 - (z1 - z0) * 0.22, '#e8d6a0', shade(GOLD, 0.55));
    d.QS(-0.052, m - 0.12, zh - 0.06, m + 0.12, zh + 0.06, g);
    d.QS(-0.054, m - 0.05, zh - 0.03, m + 0.05, zh + 0.03, GOLD);
  }
  /* ---- Site198：城墙灰砖 / 垛口 / 女墙（南薰门同色；禁纯线稿） ---- */
  const CITY = '#8a8680', CITY_W = '#6e6a64', CITY_TOP = '#a29e95';
  function paintCityBrickS(d, w, h) {
    d.QS(0, 0, 0, w, h, CITY, shade(CITY, 0.48));
    // thick mortar courses + running bond (城砖 atlas, not sparse coursesS lines)
    for (let z = 0.22, k = 0; z < h - 0.02; z += 0.22, k++) {
      d.QS(-0.004, 0.01, z - 0.02, w - 0.01, z, shade(CITY, 0.72));
      const ox = (k % 2) * 0.28;
      for (let x = ox; x < w - 0.04; x += 0.55) {
        d.seg([x, -0.006, z - 0.22], [x, -0.006, z], shade(CITY, 0.62));
        // brick face grit / weathering flecks
        d.QS(-0.007, x + 0.06, z - 0.16, x + 0.22, z - 0.08, shade(CITY, k % 3 ? 0.94 : 1.08));
      }
    }
    // occasional dark streak (雨渍)
    for (let i = 0; i < 4; i++) {
      const x = 0.18 + i * (w / 4.2);
      d.seg([x, -0.008, h * 0.15], [x, -0.008, h * (0.55 + (i % 2) * 0.2)], shade(CITY, 0.78));
    }
  }
  function paintCityBrickW(d, dpth, h) {
    d.QW(0, 0, 0, dpth, h, CITY_W, shade(CITY_W, 0.48));
    for (let z = 0.22, k = 0; z < h - 0.02; z += 0.22, k++) {
      d.seg([ -0.005, 0.02, z], [ -0.005, dpth - 0.02, z], shade(CITY_W, 0.72));
      for (let y = (k % 2) * 0.28; y < dpth - 0.04; y += 0.55) {
        d.seg([ -0.005, y, z - 0.22], [ -0.005, y, z], shade(CITY_W, 0.62));
      }
    }
  }
  function paintCityStoneS(d, w, h) {
    d.QS(0, 0, 0, w, h, STONE, shade(STONE, 0.5));
    for (let z = 0.4, k = 0; z < h - 0.02; z += 0.4, k++) {
      d.QS(-0.004, 0.02, z - 0.03, w - 0.02, z, shade(STONE, 0.78));
      for (let x = (k % 2) * 0.55; x < w - 0.05; x += 1.1) {
        d.seg([x, -0.006, z - 0.4], [x, -0.006, z], shade(STONE, 0.68));
        d.QS(-0.007, x + 0.12, z - 0.28, x + 0.55, z - 0.12, shade(STONE, 1.06));
      }
    }
  }
  /** 垛口（crenel tooth）：带射击孔的城垛块 */
  function paintMerlon(d, o = {}) {
    const w = o.w || 1.05, dpth = o.d || 0.55, h = o.h || 1.7;
    const slit = o.slit !== false;
    d.box(0, 0, 0, w, dpth, h, CITY, { line: shade(CITY, 0.45), west: CITY_W, top: shade(CITY, 1.18), south: shade(CITY, 0.98) });
    // brick courses on S + W
    for (let z = 0.22; z < h - 0.05; z += 0.22) {
      d.seg([0.04, -0.008, z], [w - 0.04, -0.008, z], shade(CITY, 0.7));
      d.seg([-0.008, 0.04, z], [-0.008, dpth - 0.04, z], shade(CITY_W, 0.7));
    }
    for (let x = 0.28; x < w - 0.05; x += 0.28) d.seg([x, -0.01, 0.05], [x, -0.01, h - 0.08], shade(CITY, 0.62));
    // coping cap
    d.box(-0.04, -0.04, h - 0.08, w + 0.04, dpth + 0.04, h + 0.06, shade(CITY, 1.12), { line: shade(CITY, 0.5), west: CITY_W, top: shade(CITY, 1.25) });
    // 射击孔
    if (slit) {
      const sx = w * 0.42, sz = h * 0.55;
      d.QS(-0.012, sx, sz, sx + 0.18, sz + 0.42, '#2a2622', shade(CITY, 0.4));
      d.QS(-0.014, sx + 0.03, sz + 0.06, sx + 0.15, sz + 0.36, '#1a1814');
    }
    // corner highlight
    d.QS(-0.006, 0.02, h - 0.18, 0.12, h - 0.04, shade(CITY, 1.15));
  }
  /** 垛口缺口（crenel / embrasure）矮段 */
  function paintCrenel(d, o = {}) {
    const w = o.w || 0.55, dpth = o.d || 0.55, h = o.h || 1.0;
    d.box(0, 0, 0, w, dpth, h, CITY, { line: shade(CITY, 0.45), west: CITY_W, top: shade(CITY, 1.15), south: shade(CITY, 0.95) });
    for (let z = 0.22; z < h - 0.04; z += 0.22) {
      d.seg([0.03, -0.008, z], [w - 0.03, -0.008, z], shade(CITY, 0.7));
    }
    d.box(-0.03, -0.03, h - 0.06, w + 0.03, dpth + 0.03, h + 0.04, shade(CITY, 1.1), { line: shade(CITY, 0.5), west: CITY_W, top: shade(CITY, 1.22) });
  }
  /** 女墙（parapet）：连续低墙段 */
  function paintParapet(d, o = {}) {
    const w = o.w || 1.6, dpth = o.d || 0.6, h = o.h || 1.1;
    d.box(0, 0, 0, w, dpth, h, CITY, { line: shade(CITY, 0.48), west: CITY_W, top: shade(CITY, 1.15), south: shade(CITY, 0.96) });
    for (let z = 0.22; z < h - 0.04; z += 0.22) {
      d.seg([0.04, -0.008, z], [w - 0.04, -0.008, z], shade(CITY, 0.7));
      const k = Math.round(z / 0.22);
      for (let x = (k % 2) * 0.28; x < w - 0.04; x += 0.55) d.seg([x, -0.01, z - 0.22], [x, -0.01, z], shade(CITY, 0.62));
    }
    // tile-ish coping
    d.box(-0.05, -0.05, h - 0.05, w + 0.05, dpth + 0.05, h + 0.1, shade(CITY, 1.08), { line: shade(CITY, 0.5), west: CITY_W, top: shade(CITY, 1.22) });
    d.QS(-0.06, 0.1, h + 0.02, w - 0.1, h + 0.08, shade(CITY, 1.28));
  }
  /** 城墙走道顶面砖 */
  function paintWalkTop(d, w, dpth) {
    d.box(0, 0, 0, w, dpth, 0.06, CITY_TOP, { line: shade(CITY, 0.5), west: shade(CITY_TOP, 0.85), top: shade(CITY_TOP, 1.08), south: shade(CITY_TOP, 0.95) });
    for (let x = 0.35; x < w; x += 0.7) d.seg([x, 0.02, 0.07], [x, dpth - 0.02, 0.07], shade(CITY, 0.78));
    for (let y = 0.35; y < dpth; y += 0.7) d.seg([0.02, y, 0.07], [w - 0.02, y, 0.07], shade(CITY, 0.82));
  }
  function paintWallW(d, dpth, h, brick) {

    const col = brick ? shade(BRICK, 0.85) : PLASTER_W, fr = shade(WOOD, 0.85);
    d.QW(0, 0, 0, dpth, h, col, shade(col, 0.55));
    if (brick) {
      for (let z = 0.16, k = 0; z < h; z += 0.16, k++) {
        d.seg([0 - 0.005, 0.02, z], [0 - 0.005, dpth - 0.02, z], shade(col, 0.78));
        for (let y = (k % 2) * 0.2; y < dpth; y += 0.4) d.seg([0 - 0.005, y, z], [0 - 0.005, y, Math.min(h, z + 0.16)], shade(col, 0.72));
      }
    } else {
      d.QW(-0.01, 0, 0, 0.08, h, fr);
      d.QW(-0.01, dpth - 0.08, 0, dpth, h, fr);
      d.QW(-0.01, 0, h - 0.12, dpth, h, fr);
      d.QW(-0.01, 0, h * 0.48, dpth, h * 0.48 + 0.1, fr);
    }
  }

  const MODULES = [
    { key: 'wall_plaster_S', geo: [0, -0.05, 0, 1.5, 0.1, 2.4], paint: (d) => paintWallPlasterS(d, 1.5, 2.4), mw: 1.5, mh: 2.4, face: 'S' },
    { key: 'wall_brick_S', geo: [0, -0.05, 0, 1.5, 0.1, 1.2], paint: (d) => paintWallBrickS(d, 1.5, 1.2), mw: 1.5, mh: 1.2, face: 'S' },
    { key: 'wall_plaster_W', geo: [-0.05, 0, 0, 0.1, 1.5, 2.4], paint: (d) => paintWallW(d, 1.5, 2.4, false), mw: 1.5, mh: 2.4, face: 'W' },
    { key: 'wall_brick_W', geo: [-0.05, 0, 0, 0.1, 1.5, 1.2], paint: (d) => paintWallW(d, 1.5, 1.2, true), mw: 1.5, mh: 1.2, face: 'W' },
    { key: 'win_grid_S', geo: [0, -0.05, 0, 1.0, 0.1, 1.4], paint: (d) => paintWin(d, 1.0, 1.4, 'grid'), mw: 1.0, mh: 1.4, face: 'S' },
    { key: 'win_diamond_S', geo: [0, -0.05, 0, 1.0, 0.1, 1.4], paint: (d) => paintWin(d, 1.0, 1.4, 'diamond'), mw: 1.0, mh: 1.4, face: 'S' },
    { key: 'win_bubujin_S', geo: [0, -0.05, 0, 1.0, 0.1, 1.4], paint: (d) => paintWin(d, 1.0, 1.4, 'bubujin'), mw: 1.0, mh: 1.4, face: 'S' },
    { key: 'win_wanzi_S', geo: [0, -0.05, 0, 1.0, 0.1, 1.4], paint: (d) => paintWin(d, 1.0, 1.4, 'wanzi'), mw: 1.0, mh: 1.4, face: 'S' },
    { key: 'win_vbars_S', geo: [0, -0.05, 0, 1.0, 0.1, 0.6], paint: (d) => paintWin(d, 1.0, 0.6, 'vbars'), mw: 1.0, mh: 0.6, face: 'S' },
    { key: 'door_geshan_S', geo: [0, -0.05, 0, 0.7, 0.1, 2.5], paint: (d) => paintGeshanLeaf(d, 0.7, 2.5, { style: 'grid' }), mw: 0.7, mh: 2.5, face: 'S' },
    { key: 'door_geshan_carved_S', geo: [0, -0.05, 0, 0.7, 0.1, 2.5], paint: (d) => paintGeshanLeaf(d, 0.7, 2.5, { carved: true, style: 'diamond' }), mw: 0.7, mh: 2.5, face: 'S' },
    { key: 'door_ban_S', geo: [0, -0.05, 0, 0.85, 0.1, 2.5], paint: (d) => paintBanDoor(d, 0.85, 2.5), mw: 0.85, mh: 2.5, face: 'S' },
    { key: 'threshold_S', geo: [0, -0.05, 0, 1.0, 0.1, 0.2], paint: (d) => paintThreshold(d, 1.0), mw: 1.0, mh: 0.2, face: 'S' },
    { key: 'column_red', geo: [-0.2, -0.2, 0, 0.2, 0.2, 3.5], paint: (d) => paintColumn(d, 3.5, 0.15), mw: 0.4, mh: 3.5, face: 'C', origin: 'center' },
    { key: 'plaque_frame', geo: [-1.2, -0.1, -0.55, 1.2, 0.1, 0.55], paint: (d) => paintPlaqueFrame(d, 2.0, 0.7), mw: 2.0, mh: 0.7, face: 'S', origin: 'center' },
    { key: 'banner_red', geo: [-0.3, -0.05, -1.7, 0.3, 0.05, 0.1], paint: (d) => paintBanner(d, 0.55, 1.5, '#c8322c'), mw: 0.55, mh: 1.7, face: 'S', origin: 'top' },
    { key: 'banner_green', geo: [-0.3, -0.05, -1.7, 0.3, 0.05, 0.1], paint: (d) => paintBanner(d, 0.55, 1.5, '#2f6a58'), mw: 0.55, mh: 1.7, face: 'S', origin: 'top' },
    { key: 'banner_blue', geo: [-0.3, -0.05, -1.7, 0.3, 0.05, 0.1], paint: (d) => paintBanner(d, 0.55, 1.5, '#2f4f86'), mw: 0.55, mh: 1.7, face: 'S', origin: 'top' },
    { key: 'lantern', geo: [-0.35, -0.35, -0.9, 0.35, 0.35, 0.1], paint: (d) => paintLantern(d, 0.22), mw: 0.7, mh: 1.0, face: 'C', origin: 'top' },
    { key: 'tile_eave_S', geo: [0, -0.08, -0.12, 1.0, 0.05, 0.38], paint: (d) => paintTileStripS(d, 1.0), mw: 1.0, mh: 0.38, face: 'S' },
    { key: 'tile_course_S', geo: [0, -0.05, 0, 1.0, 0.05, 0.22], paint: (d) => paintTileCourseS(d, 1.0), mw: 1.0, mh: 0.22, face: 'S' },
    { key: 'tile_ridge_S', geo: [0, -0.12, 0, 1.0, 0.12, 0.28], paint: (d) => paintTileRidgeS(d, 1.0), mw: 1.0, mh: 0.28, face: 'S' },
    { key: 'tile_wadang_S', geo: [0, -0.08, -0.05, 0.9, 0.05, 0.28], paint: (d) => paintWadangS(d, 0.9), mw: 0.9, mh: 0.28, face: 'S' },
    { key: 'tile_drip_S', geo: [0, -0.1, -0.12, 0.9, 0.05, 0.32], paint: (d) => paintDripS(d, 0.9), mw: 0.9, mh: 0.32, face: 'S' },
    { key: 'chiwen_S', geo: [0, -0.2, 0, 0.85, 0.15, 1.1], paint: (d) => paintChiwenS(d, 0.85), mw: 0.85, mh: 1.1, face: 'S' },
    { key: 'chiwen_flip_S', geo: [0, -0.2, 0, 0.85, 0.15, 1.1], paint: (d) => paintChiwenS(d, 0.85, { flip: true }), mw: 0.85, mh: 1.1, face: 'S' },
    { key: 'dougong', geo: [-0.85, -0.7, 0, 0.85, 0.35, 0.55], paint: (d) => paintDougong(d), mw: 1.7, mh: 0.55, face: 'S', origin: 'center' },
    { key: 'dougong_large', geo: [-1.1, -0.85, 0, 1.1, 0.35, 0.7], paint: (d) => paintDougong(d, { large: true }), mw: 2.2, mh: 0.7, face: 'S', origin: 'center' },
    { key: 'efang_unit', geo: [0, -0.1, 0, 2.8, 0.25, 0.4], paint: (d) => paintEfangUnit(d, 2.8), mw: 2.8, mh: 0.4, face: 'S' },
    /* Site198 wall-merlon */
    { key: 'city_brick_S', geo: [0, -0.05, 0, 1.6, 0.1, 1.8], paint: (d) => paintCityBrickS(d, 1.6, 1.8), mw: 1.6, mh: 1.8, face: 'S' },
    { key: 'city_brick_W', geo: [-0.05, 0, 0, 0.1, 1.6, 1.8], paint: (d) => paintCityBrickW(d, 1.6, 1.8), mw: 1.6, mh: 1.8, face: 'W' },
    { key: 'city_stone_S', geo: [0, -0.05, 0, 1.6, 0.1, 1.2], paint: (d) => paintCityStoneS(d, 1.6, 1.2), mw: 1.6, mh: 1.2, face: 'S' },
    { key: 'merlon_S', geo: [0, -0.02, 0, 1.05, 0.55, 1.76], paint: (d) => paintMerlon(d, { w: 1.05, d: 0.55, h: 1.7 }), mw: 1.05, mh: 1.7, face: 'S' },
    { key: 'crenel_S', geo: [0, -0.02, 0, 0.55, 0.55, 1.04], paint: (d) => paintCrenel(d, { w: 0.55, d: 0.55, h: 1.0 }), mw: 0.55, mh: 1.0, face: 'S' },
    { key: 'parapet_S', geo: [0, -0.02, 0, 1.6, 0.6, 1.2], paint: (d) => paintParapet(d, { w: 1.6, d: 0.6, h: 1.1 }), mw: 1.6, mh: 1.1, face: 'S' },
    { key: 'walk_top', geo: [0, 0, 0, 1.6, 1.6, 0.08], paint: (d) => paintWalkTop(d, 1.6, 1.6), mw: 1.6, mh: 1.6, face: 'C' },
  ];

  function ensure(makeCanvas) {
    if (ready) return;
    makeCanvas = makeCanvas || defaultMake;
    const pack = [];
    for (const m of MODULES) {
      const b = boundsOf(m.geo, 6);
      pack.push({ m, w: b[2] - b[0], h: b[3] - b[1], ox: -b[0], oy: -b[1], bx: b });
    }
    const WIDTH = 2048;
    let x = 2, y = 2, rowH = 0, totalH = 0;
    const placed = [];
    for (const it of pack) {
      if (x + it.w + 2 > WIDTH) { y += rowH + 2; x = 2; rowH = 0; }
      it.x = x; it.y = y;
      x += it.w + 2; rowH = Math.max(rowH, it.h);
      totalH = Math.max(totalH, y + rowH + 2);
      placed.push(it);
    }
    atlas = makeCanvas(WIDTH, Math.max(64, totalH));
    ag = atlas.getContext('2d');
    ag.clearRect(0, 0, WIDTH, totalH);
    frames = {};
    for (const it of placed) {
      ag.save(); ag.beginPath(); ag.rect(it.x, it.y, it.w, it.h); ag.clip();
      const d = painter(ag, it.x + it.ox, it.y + it.oy);
      it.m.paint(d);
      ag.restore();
      // hard edges
      try {
        const im = ag.getImageData(it.x, it.y, it.w, it.h), a = im.data;
        for (let i = 3; i < a.length; i += 4) a[i] = a[i] >= 110 ? 255 : 0;
        ag.putImageData(im, it.x, it.y);
      } catch (_) {}
      frames[it.m.key] = {
        x: it.x, y: it.y, w: it.w, h: it.h, ox: it.ox, oy: it.oy,
        mw: it.m.mw, mh: it.m.mh, face: it.m.face, origin: it.m.origin || 'bay',
        geo: it.m.geo.slice(),
      };
    }
    ready = true;
  }

  /** Blit one module so its local origin lands at world (x,y,z). */
  function stamp(d, key, x, y, z, o = {}) {
    ensure();
    const f = frames[key]; if (!f) return;
    const p = d.P(x, y, z);
    const g = d.g;
    const sx = o.sx || 1, sy = o.sy || 1;
    const dw = Math.round(f.w * sx), dh = Math.round(f.h * sy);
    g.save();
    if (o.alpha != null) g.globalAlpha = o.alpha;
    g.imageSmoothingEnabled = false;
    g.drawImage(atlas, f.x, f.y, f.w, f.h, Math.round(p[0] - f.ox * sx), Math.round(p[1] - f.oy * sy), dw, dh);
    g.restore();
  }

  /** Tile-fill a south-face rectangle with repeating modules (like jinghuaili wall bays). */
  function fillS(d, key, y, x0, z0, x1, z1, o = {}) {
    ensure();
    const f = frames[key]; if (!f) return;
    const mw = o.mw || f.mw, mh = o.mh || f.mh;
    const sx = (x1 - x0) > 0 ? Math.min(1.25, Math.max(0.55, (x1 - x0) / Math.max(1, Math.ceil((x1 - x0) / mw)) / mw)) : 1;
    // prefer integer tiles along x; scale slightly to fit
    const n = Math.max(1, Math.round((x1 - x0) / mw));
    const tw = (x1 - x0) / n;
    const m = Math.max(1, Math.round((z1 - z0) / mh));
    const th = (z1 - z0) / m;
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      stamp(d, key, x0 + i * tw, y, z0 + j * th, { sx: tw / mw, sy: th / mh });
    }
  }

  function fillW(d, key, x, y0, z0, y1, z1, o = {}) {
    ensure();
    const f = frames[key]; if (!f) return;
    const mw = o.mw || f.mw, mh = o.mh || f.mh;
    const n = Math.max(1, Math.round((y1 - y0) / mw));
    const tw = (y1 - y0) / n;
    const m = Math.max(1, Math.round((z1 - z0) / mh));
    const th = (z1 - z0) / m;
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      stamp(d, key, x, y0 + i * tw, z0 + j * th, { sx: tw / mw, sy: th / mh });
    }
  }

  /** Stamp tile eave modules along a polyline of world points (S-eave). Site198 denser + 瓦当/滴水. */
  function stampEaveTiles(d, pts, o = {}) {
    ensure();
    if (!pts || pts.length < 2) return;
    const pitch = (o && o.dense) ? 0.65 : 0.78;
    let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
      const len = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const steps = Math.max(1, Math.round(len / pitch));
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const px = a[0] + dx * t, py = a[1] + dy * t, pz = a[2] + dz * t;
        stamp(d, 'tile_eave_S', px, py, pz, { sx: len / steps, sy: 1 });
        if (s % 2 === 0) stamp(d, 'tile_wadang_S', px, py - 0.02, pz - 0.04, { sx: 0.85, sy: 0.9 });
        else stamp(d, 'tile_drip_S', px, py - 0.03, pz - 0.06, { sx: 0.85, sy: 0.95 });
      }
      acc += len;
    }
  }
  /** Stamp 鸱吻 at ridge ends (atlas kitbash). */
  function stampChiwen(d, x, y, z, o = {}) {
    ensure();
    const key = o.flip ? 'chiwen_flip_S' : 'chiwen_S';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  function getAtlas() { ensure(); return atlas; }
  function getFrames() { ensure(); return frames; }
  function getModules() { return MODULES.map((m) => m.key); }

  // Hook paint so atlas is ready before any ancient draw
  if (A && A.paint && !A._ancientAtlasHooked) {
    const _paint = A.paint.bind(A);
    A.paint = function (makeCanvas, only, used) {
      _makeCanvas = makeCanvas;
      ensure(makeCanvas);
      return _paint(makeCanvas, only, used);
    };
    A._ancientAtlasHooked = true;
  }

  const AncientAtlas = {
    ensure, stamp, fillS, fillW, stampEaveTiles, stampChiwen, getAtlas, getFrames, getModules, MODULES,
    get _makeCanvas() { return _makeCanvas; },
    set _makeCanvas(v) { _makeCanvas = v; },
  };
  root.AncientAtlas = AncientAtlas;
})(typeof window !== 'undefined' ? window : globalThis);
