/* 影视城古镇 art — architectural parts assembled from AncientAtlas modules (瓦/柱/匾/窗/招幌/隔扇/斗拱/脊瓦),
 * 井槐里-style kitbash: stamp pre-baked textured modules rather than live polyline描线.
 * Site197：招幌流苏 + facade-detail（万字窗/雕刻隔扇/板门/大斗拱/脊瓦/门槛）。
 * Site198：城墙垛口/女墙/城砖 atlas helpers（merlonsS/parapetS/cityBrick*）+ 屋脊/瓦当/鸱吻/滴水 atlas 加密拼装。
 * Site200：灯笼/幌子黄昏夜景光晕与暖色叠层（lanternGlow/bannerGlow）。
 * Site201：汴河码头/船灯渔火复用 lanternGlow，可选水面倒影（water）。未经Leo确认. */
(function (root) {
  'use strict';
  const { shade, C, FONT_SERIF, H } = root.AncientCore;
  const AT = root.AncientAtlas;
  const { TILE, RIDGE, RED, RED_W, WOOD, WOOD_D, PAPER, BRICK, STONE, STONE_W, PLASTER, PLASTER_W, CAI_G, CAI_B, GOLD } = C;

  function winKey(style) {
    if (style === 'diamond') return 'win_diamond_S';
    if (style === 'bubujin') return 'win_bubujin_S';
    if (style === 'wanzi') return 'win_wanzi_S';
    if (style === 'vbars') return 'win_vbars_S';
    return 'win_grid_S';
  }

  function roof(d, o) {
    const h = H(d), { x0, x1, y0, y1, z } = o, ym = (y0 + y1) / 2, D = (y1 - y0) / 2, Ht = z + o.rise;
    const type = o.type || 'xieshan', lift = o.lift == null ? 0.52 : o.lift;
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
    h.poly([...eaveS, ...eaveS.slice().reverse().map((p) => [p[0], p[1] + 0.3, p[2] - th])], soff, null);
    for (let i = 1; i < N; i++) { const p = eaveS[i]; h.line([p[0], p[1] + 0.05, p[2] - 0.02], [p[0], p[1] + 0.32, p[2] - th - 0.02], shade(soff, 0.6)); }
    if (hin > 0) {
      h.poly([...eaveW, [x0 + hin, y1 - hin, zg], [x0 + hin, y0 + hin, zg]], colW, shade(colW, 0.6));
      for (let y = y0 + 0.15; y < y1 - 0.1; y += 0.22) {
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
    // base roof fill (under tile modules)
    h.poly([...eaveS, ...topS], col, shade(col, 0.55));
    // 瓦 courses — stamp tile_course modules along slope (atlas kitbash, not描线)
    // Site198：店铺/公建更密（dense 默认开；可 o.dense===false 关闭）
    {
      const dense = o.dense !== false;
      const rows = dense ? 12 : 9;
      const stepX = dense ? 0.78 : 1.0;
      for (let k = 1; k < rows; k++) {
        const f = k / rows;
        for (let x = x0 + 0.05; x < x1 - 0.05; x += stepX) {
          let lim = hin === 0 ? 1 : x < x0 + hin ? (x - x0) / D : x > x1 - hin ? (x1 - x) / D : 1;
          if (f > lim) continue;
          const e = eaveS[Math.min(N, Math.round((x - x0) / (x1 - x0) * N))];
          const px = e[0], py = e[1] + (ym - e[1]) * f, pz = e[2] + (Ht - e[2]) * f;
          AT.stamp(d, 'tile_course_S', px, py, pz, { sx: stepX, sy: 0.85 });
        }
      }
    }
    // ridge line hint under modules
    for (let x = x0 + 0.12; x < x1 - 0.05; x += 0.44) {
      const e = eaveS[Math.round((x - x0) / (x1 - x0) * N)];
      let top; if (hin === 0) top = [x, ym, Ht]; else if (x < x0 + hin) top = [x, y0 + (x - x0), z + o.rise * ((x - x0) / D)]; else if (x > x1 - hin) top = [x, y0 + (x1 - x), z + o.rise * ((x1 - x) / D)]; else top = [x, ym, Ht];
      h.line(e, top, dark);
    }
    h.pline(eaveS, shade(col, 0.5), 2);
    // 双层檐口
    {
      const eaveS2 = eaveS.map((p) => [p[0], p[1] + 0.12, p[2] + 0.08]);
      h.poly([...eaveS2, ...eaveS2.slice().reverse().map((p) => [p[0], p[1] + 0.18, p[2] - th * 0.55])], shade(soff, 1.08), null);
      h.pline(eaveS2, shade(col, 0.62), 1);
    }
    // 瓦当 / 滴水 — stamp eave tile modules along S eave（Site198 denser）
    AT.stampEaveTiles(d, eaveS, { dense: o.dense !== false });
    h.pline(eaveW, shade(colW, 0.5), 2);
    for (let i = 0; i <= M; i += 1) {
      const p = eaveW[i], q = h.P(p[0] - 0.02, p[1], p[2] - 0.02);
      d.g.fillStyle = i % 2 ? shade(colW, 0.42) : shade(colW, 1.15);
      d.g.fillRect(Math.round(q[0]), Math.round(q[1]), 2, 2);
    }
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
      /* Site197+198：脊瓦 atlas 模块沿正脊（更密） */
      {
        const rf = AT.getFrames().tile_ridge_S;
        if (rf) {
          const pitch = (o.dense !== false) ? rf.mw * 0.72 : rf.mw * 0.95;
          for (let x = rx0 + 0.05; x < rx1 - 0.05; x += pitch) {
            AT.stamp(d, 'tile_ridge_S', x, ym - 0.1, Ht + rh * 0.15, { sx: Math.min(1.05, pitch / rf.mw), sy: Math.max(0.75, rh / rf.mh) });
          }
        }
      }
      /* Site198：鸱吻 atlas kitbash（禁纯线稿；保留极淡座底） */
      if (o.chiwen !== false) for (const [x, s, flip] of [[rx0, -1, true], [rx1, 1, false]]) {
        const b = rh + 0.1;
        h.poly([[x, ym - 0.13, Ht], [x + s * 0.08, ym - 0.13, Ht + b * 0.35], [x - s * 0.2, ym - 0.13, Ht]], shade(rcol, 0.95), null);
        if (AT.stampChiwen) {
          AT.stampChiwen(d, x - (flip ? 0.05 : 0.75), ym - 0.16, Ht + rh * 0.05, {
            flip, sx: Math.max(0.85, Math.min(1.35, 0.55 + rh)), sy: Math.max(0.85, Math.min(1.4, 0.7 + rh)),
          });
        } else {
          h.poly([[x, ym - 0.13, Ht], [x + s * 0.12, ym - 0.13, Ht + b + 0.55], [x - s * 0.35, ym - 0.13, Ht + b + 0.35], [x - s * 0.15, ym - 0.13, Ht + b], [x - s * 0.35, ym - 0.13, Ht + b - 0.05], [x - s * 0.35, ym - 0.13, Ht]], shade(rcol, 1.05), shade(rcol, 0.5));
        }
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
  /** Lattice window — stamp atlas win_* modules (not live grid lines). */
  function lattice(d, y, x0, z0, x1, z1, o = {}) {
    const key = winKey(o.style || 'grid');
    const fw = AT.getFrames()[key];
    if (!fw) return;
    // scale one module to fill the bay (or tile if wider than ~1.2 m)
    const bw = x1 - x0, bh = z1 - z0;
    if (bw <= 1.25) {
      AT.stamp(d, key, x0, y, z0, { sx: bw / fw.mw, sy: bh / fw.mh });
    } else {
      AT.fillS(d, key, y, x0, z0, x1, z1);
    }
  }
  function latticeW(d, x, y0, z0, y1, z1, o = {}) {
    // W-face: use plaster wall module + overdrawn paper (no dedicated W win yet — fill with wall then simple bars via stamp scale)
    AT.fillW(d, 'wall_plaster_W', x, y0, z0, y1, z1);
    const h = H(d), fr = shade(o.frame || WOOD, 0.85), paper = shade(o.paper || PAPER, 0.85), m = 0.07, s = o.step || 0.13;
    h.QW(x - 0.005, y0 + m, z0 + m, y1 - m, z1 - m, paper, shade(fr, 0.6));
    for (let y = y0 + m + s; y < y1 - m; y += s) h.line([x - 0.01, y, z0 + m], [x - 0.01, y, z1 - m], shade(fr, 0.9));
    for (let z = z0 + m + s; z < z1 - m; z += s) h.line([x - 0.01, y0 + m, z], [x - 0.01, y1 - m, z], shade(fr, 0.9));
  }
  /** 隔扇 — stamp door_geshan_S / carved / 板门 leaves. */
  function geshan(d, y, x0, z0, x1, z1, n, o = {}) {
    const h = H(d), fr = o.frame || WOOD, w = (x1 - x0) / n;
    let key = 'door_geshan_S';
    if (o.ban) key = 'door_ban_S';
    else if (o.carved || o.style === 'carved' || o.style === 'diamond') key = 'door_geshan_carved_S';
    const fw = AT.getFrames()[key] || AT.getFrames().door_geshan_S;
    for (let i = 0; i < n; i++) {
      const a = x0 + i * w, b = a + w;
      if (o.open && o.open.includes(i)) { h.QS(y, a, z0, b, z1, o.inside || '#2a1e18', shade(fr, 0.5)); continue; }
      if (fw) AT.stamp(d, key, a, y, z0, { sx: w / fw.mw, sy: (z1 - z0) / fw.mh });
      else {
        h.QS(y, a, z0, b, z1, fr, shade(fr, 0.45));
        lattice(d, y - 0.004, a + 0.05, z0 + (z1 - z0) * 0.42, b - 0.05, z1 - 0.07, { frame: fr, paper: o.paper, style: o.style || 'grid' });
      }
    }
    /* 门槛 atlas */
    const tf = AT.getFrames().threshold_S;
    if (tf && o.threshold !== false) AT.stamp(d, 'threshold_S', x0, y - 0.01, z0 - 0.02, { sx: (x1 - x0) / tf.mw, sy: 0.9 });
  }
  /** 斗拱 — stamp dougong / dougong_large modules. */
  function dougong(d, y, xs, z, o = {}) {
    const s = o.size || 1;
    const key = (o.large || s > 1.15) ? 'dougong_large' : 'dougong';
    const fw = AT.getFrames()[key] || AT.getFrames().dougong;
    for (const x of xs) AT.stamp(d, key, x, y, z, { sx: s, sy: s });
  }
  /** 额枋彩画 — stamp efang_unit tiles. */
  function efang(d, y, x0, x1, z0, z1, o = {}) {
    const h = H(d);
    if (o.plain) {
      const b = o.base || CAI_B;
      d.box(x0, y - 0.04, z0, x1, y + 0.2, z1, b, { line: shade(b, 0.45), west: shade(o.alt || CAI_G, 0.8), top: shade(b, 0.8) });
      return;
    }
    const fw = AT.getFrames().efang_unit;
    const L = x1 - x0, n = Math.max(1, Math.round(L / (fw ? fw.mw : 2.8)));
    const tw = L / n, th = z1 - z0;
    for (let i = 0; i < n; i++) {
      AT.stamp(d, 'efang_unit', x0 + i * tw, y, z0, { sx: tw / (fw ? fw.mw : 2.8), sy: th / (fw ? fw.mh : 0.4) });
    }
  }
  /** 匾额 — stamp plaque_frame then overlay text. */
  function plaque(d, y, xc, z, text, o = {}) {
    const h = H(d), size = o.size || 15;
    const w = o.w || Math.max(1.2, text.length * size / 32 * 1.15 + 0.4);
    const ht = o.h || size / 39.19 * 1.5;
    const fw = AT.getFrames().plaque_frame;
    if (fw) AT.stamp(d, 'plaque_frame', xc, y, z, { sx: w / fw.mw, sy: ht / fw.mh });
    else {
      // fallback outline only
      h.QS(y - 0.03, xc - w / 2, z - ht / 2, xc + w / 2, z + ht / 2, o.bg || '#1a2840', shade(GOLD, 0.5));
    }
    h.stext(text, xc, y - 0.04, z, size, o.col || '#f5d878', { font: o.font || FONT_SERIF, stroke: shade(o.bg || '#1a2840', 0.35), sw: 2 });
  }
  function vsign(d, y, xc, ztop, text, o = {}) {
    const h = H(d), size = o.size || 12, w = o.w || 0.5, ht = text.length * size / 39.19 * 1.08 + 0.3;
    h.QS(y - 0.02, xc - w / 2, ztop - ht, xc + w / 2, ztop, o.bg || '#2a1e16', shade(o.bg || '#2a1e16', 0.4));
    h.QS(y - 0.025, xc - w / 2 + 0.05, ztop - ht + 0.05, xc + w / 2 - 0.05, ztop - 0.05, null, o.frame || GOLD);
    h.vtext(text, xc, y - 0.03, ztop - 0.15 - size / 39.19 * 0.5, size, o.col || '#f0cf6a');
  }
  /** 招幌 — stamp banner_* module then overlay text (+ Site197 fringe). */
  function banner(d, x, y, ztop, text, o = {}) {
    const h = H(d), col = o.col || '#c8322c', w = o.w || 0.55, L = o.len || 1.5, size = o.size || 13;
    if (o.pole !== false) h.line([x, y + 0.6, ztop + 0.08], [x, y - 0.25, ztop + 0.08], WOOD_D, 2);
    let key = 'banner_red';
    if (/#2f6a58|#3f7a6a|#2a6/i.test(col)) key = 'banner_green';
    else if (/#2f4f86|#2f5a86|#245a98/i.test(col)) key = 'banner_blue';
    else if (/#e8dcc0|#f0efd8|#d8c8a0|#c8b080/i.test(col)) key = 'banner_red'; // cream cloth → red atlas + light text
    const fw = AT.getFrames()[key];
    if (fw) AT.stamp(d, key, x, y - 0.1, ztop, { sx: w / fw.mw, sy: (L + 0.2) / fw.mh });
    else {
      d.face([[x - w / 2, y - 0.1, ztop], [x + w / 2, y - 0.1, ztop], [x + w / 2 + 0.03, y - 0.1, ztop - L], [x + w * 0.12, y - 0.1, ztop - L - 0.2], [x - w / 2 - 0.02, y - 0.1, ztop - L]], col, shade(col, 0.5));
    }
    /* cream override face when atlas is red but cloth is pale */
    if (/#e8dcc0|#f0efd8|#d8c8a0|#c8b080/i.test(col)) {
      d.face([[x - w / 2 + 0.02, y - 0.11, ztop - 0.05], [x + w / 2 - 0.02, y - 0.11, ztop - 0.05],
              [x + w / 2, y - 0.11, ztop - L + 0.08], [x - w / 2, y - 0.11, ztop - L + 0.08]], col, shade(col, 0.55));
    }
    h.vtext(text, x, y - 0.12, ztop - 0.2 - size / 39.19 * 0.55, size, o.tc || '#f6efd8');
    /* fringe tassels（街巷招幌更华丽） */
    if (o.fringe !== false) {
      const zf = ztop - L - 0.05;
      for (let i = -2; i <= 2; i++) {
        const fx = x + i * (w * 0.16);
        h.line([fx, y - 0.12, zf], [fx, y - 0.12, zf - 0.18 - (i & 1) * 0.06], o.border || GOLD, 1);
        h.px(fx, y - 0.13, zf - 0.2 - (i & 1) * 0.06, shade(col, 1.1), 1, 1);
      }
    }
  }
  /** 灯笼 — stamp lantern module (+ optional text overlay). */
  function lantern(d, x, y, z, o = {}) {
    const h = H(d), r = o.r || 0.2, cord = o.cord == null ? 0.25 : o.cord;
    AT.stamp(d, 'lantern', x, y, z, { sx: r / 0.22, sy: r / 0.22 });
    if (o.text) {
      const c = h.P(x, y, z - cord - r * 1.2), g = d.g;
      g.fillStyle = '#1a1210'; g.font = `bold ${Math.max(7, Math.round(r * 45.25 * 0.8 * 1.15))}px ${FONT_SERIF}`;
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.text, c[0] + 1, c[1] + 1);
    }
  }
  /** Site200：黄昏/夜景灯笼光晕 — 多层暖色叠层（外圈柔晕→中暖→芯白），可选地面落光。 */
  function lanternGlow(d, x, y, z, o = {}) {
    const h = H(d), cord = o.cord == null ? 0.25 : o.cord, rr = o.r || 0.2;
    const boost = o.boost == null ? 1.35 : o.boost;
    const r = rr * 45.25 * 0.8 * boost;
    const c = h.P(x, y, z - cord - rr * 1.2), g = d.g;
    const col = o.col || '#ffc878';
    g.save();
    g.globalCompositeOperation = 'lighter';
    /* 外圈大柔晕（黄昏可读） */
    g.beginPath(); g.ellipse(c[0], c[1], r * 3.4, r * 2.9, 0, 0, Math.PI * 2);
    g.fillStyle = 'rgba(255,140,50,0.22)'; g.fill();
    g.beginPath(); g.ellipse(c[0], c[1], r * 2.55, r * 2.2, 0, 0, Math.PI * 2);
    g.fillStyle = 'rgba(255,170,70,0.38)'; g.fill();
    /* 中暖环 */
    g.beginPath(); g.ellipse(c[0], c[1], r * 1.55, r * 1.35, 0, 0, Math.PI * 2);
    g.fillStyle = col; g.fill();
    /* 芯白 */
    g.beginPath(); g.ellipse(c[0], c[1], r * 0.85, r * 0.75, 0, 0, Math.PI * 2);
    g.fillStyle = '#fff6d0'; g.fill();
    g.beginPath(); g.ellipse(c[0], c[1], r * 0.4, r * 0.36, 0, 0, Math.PI * 2);
    g.fillStyle = '#ffffff'; g.fill();
    g.fillStyle = '#ffffff';
    g.fillRect(Math.round(c[0] - r * 0.18), Math.round(c[1] - r * 0.32), Math.max(1, Math.round(r * 0.36)), Math.max(1, Math.round(r * 0.64)));
    /* 地面暖色落光（可选，默认开） */
    if (o.ground !== false) {
      const gnd = h.P(x, y + 0.15, 0.02);
      g.beginPath(); g.ellipse(gnd[0], gnd[1], r * 2.8, r * 1.15, 0, 0, Math.PI * 2);
      g.fillStyle = 'rgba(255,150,60,0.28)'; g.fill();
    }
    /* Site201：汴河水面倒影/渔火涟漪（船灯·码头灯，拉长椭圆贴水） */
    if (o.water) {
      const wy = o.waterY == null ? (y - 0.85) : o.waterY;
      const wz = o.waterZ == null ? -0.12 : o.waterZ;
      const wat = h.P(x, wy, wz);
      g.beginPath(); g.ellipse(wat[0], wat[1], r * 3.6, r * 1.05, 0, 0, Math.PI * 2);
      g.fillStyle = 'rgba(255,130,40,0.22)'; g.fill();
      g.beginPath(); g.ellipse(wat[0], wat[1], r * 2.2, r * 0.55, 0, 0, Math.PI * 2);
      g.fillStyle = 'rgba(255,190,90,0.30)'; g.fill();
    }
    g.restore();
  }
  /** Site200：幌子暖色叠层光晕 — 布面边缘柔光，黄昏夜景可读。 */
  function bannerGlow(d, x, y, ztop, o = {}) {
    const h = H(d), w = o.w || 0.55, L = o.len || 1.5;
    const boost = o.boost == null ? 1.25 : o.boost;
    const g = d.g;
    const top = h.P(x, y - 0.12, ztop - 0.15);
    const mid = h.P(x, y - 0.12, ztop - L * 0.55);
    const bot = h.P(x, y - 0.12, ztop - L);
    const rx = Math.max(8, w * 45.25 * 0.55 * boost);
    const ry = Math.max(10, L * 39.19 * 0.42 * boost);
    g.save();
    g.globalCompositeOperation = 'lighter';
    g.beginPath(); g.ellipse(mid[0], mid[1], rx * 1.8, ry * 1.35, 0, 0, Math.PI * 2);
    g.fillStyle = 'rgba(255,150,70,0.20)'; g.fill();
    g.beginPath(); g.ellipse(mid[0], mid[1], rx * 1.15, ry * 0.95, 0, 0, Math.PI * 2);
    g.fillStyle = o.col || 'rgba(255,190,110,0.45)'; g.fill();
    g.beginPath(); g.ellipse(top[0], top[1], rx * 0.7, ry * 0.35, 0, 0, Math.PI * 2);
    g.fillStyle = 'rgba(255,230,170,0.35)'; g.fill();
    g.beginPath(); g.ellipse(bot[0], bot[1], rx * 0.55, ry * 0.28, 0, 0, Math.PI * 2);
    g.fillStyle = 'rgba(255,170,80,0.25)'; g.fill();
    g.restore();
  }
  /** Hall front — assemble wall/window/door atlas modules + column stamps (井槐里 bay kitbash). */
  function hallFront(d, y, x0, z0, ztop, bays, o = {}) {
    const h = H(d), colR = o.colR || 0.15, colC = o.colC || RED; let x = x0;
    for (const b of bays) {
      const a = x + colR, c = x + b.w - colR;
      if (b.fill === 'door') geshan(d, y + 0.25, a, z0, c, ztop - 0.05, b.n || 4, { frame: o.frame || RED_W, style: b.style || o.style, open: b.open, inside: b.inside });
      else if (b.fill === 'win') {
        const sc = o.sillCol || BRICK, sill = b.sill || 0.9;
        // brick sill from atlas modules
        AT.fillS(d, 'wall_brick_S', y + 0.25, a, z0, c, z0 + sill);
        lattice(d, y + 0.24, a, z0 + sill, c, ztop - 0.05, { frame: o.frame || RED_W, style: b.style || o.style || 'grid', step: b.step });
      } else if (b.fill === 'open') h.QS(y + 0.3, a, z0, c, ztop, b.inside || '#2e2219', null);
      else if (b.fill === 'skip') {}
      else if (b.fill === 'wall') AT.fillS(d, 'wall_plaster_S', y + 0.25, a, z0, c, ztop);
      x += b.w;
    }
    const xs = [x0]; x = x0; for (const b of bays) { x += b.w; xs.push(x); }
    // columns from atlas
    const cf = AT.getFrames().column_red;
    for (const xc of xs) {
      if (cf) AT.stamp(d, 'column_red', xc, y + 0.15, z0, { sx: (colR * 2) / 0.4, sy: (ztop - z0) / cf.mh });
      else h.column(xc, y + 0.15, z0, ztop, colR, colC, { base: STONE });
    }
    return xs;
  }

  /** 贴图模块：木板箱/桌面（拼缝，非纯色块） */
  function woodPlanks(d, x0, y0, z0, x1, y1, z1, o = {}) {
    const h = H(d), col = o.col || WOOD, top = o.top || shade(col, 1.22);
    d.box(x0, y0, z0, x1, y1, z1, col, { line: WOOD_D, west: shade(col, 0.72), top });
    const step = o.step || 0.22;
    for (let x = x0 + step; x < x1 - 0.05; x += step) {
      h.line([x, y0 - 0.005, z1], [x, y1 + 0.005, z1], shade(col, 0.78));
      h.line([x, y0 - 0.005, z0 + 0.02], [x, y0 - 0.005, z1 - 0.02], shade(col, 0.65));
    }
    for (let z = z0 + 0.12; z < z1 - 0.04; z += 0.14) h.line([x0 - 0.005, y0, z], [x1 + 0.005, y0, z], shade(col, 0.82));
    if (o.edge !== false) { d.box(x0 - 0.02, y0 - 0.02, z1 - 0.03, x1 + 0.02, y1 + 0.02, z1 + 0.02, shade(col, 0.9), { line: WOOD_D }); }
  }
  /** 贴图模块：石材台基/花坛（分层砌缝） */
  function stoneCoursing(d, x0, y0, z0, x1, y1, z1, o = {}) {
    const h = H(d), col = o.col || STONE;
    d.box(x0, y0, z0, x1, y1, z1, col, { line: shade(col, 0.5), west: STONE_W, top: o.top || shade(col, 0.85) });
    for (let z = z0 + 0.14, k = 0; z < z1 - 0.04; z += 0.14, k++) {
      h.line([x0, y0 - 0.005, z], [x1, y0 - 0.005, z], shade(col, 0.72));
      for (let x = x0 + (k % 2 ? 0.18 : 0.32); x < x1 - 0.08; x += 0.36) h.line([x, y0 - 0.005, z - 0.14], [x, y0 - 0.005, z], shade(col, 0.62));
    }
  }
  /** 贴图模块：条纹凉棚/油布篷 */
  function awningStripe(d, pts, cols, o = {}) {
    const n = cols.length;
    // pts: [[x0,y0,z0],[x1,y0,z0],[x1,y1,z1],[x0,y1,z1]] top face
    const [a, b, c, e] = pts;
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n;
      const p0 = [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0, a[2] + (b[2] - a[2]) * t0];
      const p1 = [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1, a[2] + (b[2] - a[2]) * t1];
      const p2 = [e[0] + (c[0] - e[0]) * t1, e[1] + (c[1] - e[1]) * t1, e[2] + (c[2] - e[2]) * t1];
      const p3 = [e[0] + (c[0] - e[0]) * t0, e[1] + (c[1] - e[1]) * t0, e[2] + (c[2] - e[2]) * t0];
      d.face([p0, p1, p2, p3], cols[i], o.line || shade(cols[i], 0.5));
    }
    if (o.valance) {
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, z = a[2] + (b[2] - a[2]) * t;
        d.face([[x - 0.08, y, z], [x + 0.08, y, z], [x, y, z - 0.16]], cols[i % n], shade(cols[i % n], 0.45));
      }
    }
  }
  /** 贴图模块：木箱/货筐 */
  function crateMod(d, x0, y0, z, x1, y1, col, h0) {
    const hh = h0 || 0.22;
    woodPlanks(d, x0, y0, z, x1, y1, z + hh, { col: col || '#a08050', step: 0.14, edge: true });
    d.flat(x0 + 0.03, y0 + 0.03, x1 - 0.03, y1 - 0.03, z + hh - 0.01, shade(col || '#a08050', 0.55));
  }

  /* ---- Site198：城墙垛口/女墙/城砖 atlas kitbash ---- */
  /** Fill S-face with city_brick_S modules (灰砖城墙). */
  function cityBrickS(d, y, x0, z0, x1, z1) {
    const AT = root.AncientAtlas; if (!AT) return;
    AT.fillS(d, 'city_brick_S', y, x0, z0, x1, z1);
  }
  function cityBrickW(d, x, y0, z0, y1, z1) {
    const AT = root.AncientAtlas; if (!AT) return;
    AT.fillW(d, 'city_brick_W', x, y0, z0, y1, z1);
  }
  function cityStoneS(d, y, x0, z0, x1, z1) {
    const AT = root.AncientAtlas; if (!AT) return;
    AT.fillS(d, 'city_stone_S', y, x0, z0, x1, z1);
  }
  /** Stamp 垛口 merlon + crenel along +x (S-facing battlement). */
  function merlonsS(d, y, x0, x1, z, o = {}) {
    const AT = root.AncientAtlas; if (!AT) return;
    const pitch = o.pitch || 1.6, mw = o.mw || 1.05, cw = o.cw || 0.55;
    const mf = AT.getFrames()['merlon_S'], cf = AT.getFrames()['crenel_S'];
    for (let x = x0; x + 0.2 < x1; x += pitch) {
      const wM = Math.min(mw, x1 - x);
      if (mf) AT.stamp(d, 'merlon_S', x, y, z, { sx: wM / mf.mw, sy: 1 });
      else d.box(x, y, z, x + wM, y + 0.55, z + 1.7, '#8a8680');
      if (o.slitPx !== false) d.px(x + wM * 0.42, y - 0.01, z + 1.05, '#2a2622', 3, 4);
      const cx = x + wM;
      if (cx + 0.15 < x1) {
        const wC = Math.min(cw, x1 - cx);
        if (cf) AT.stamp(d, 'crenel_S', cx, y, z, { sx: wC / cf.mw, sy: 1 });
        else d.box(cx, y, z, cx + wC, y + 0.55, z + 1.0, '#8a8680');
      }
    }
  }
  /** Stamp 垛口 along +y (W-facing / ns wall). */
  function merlonsW(d, x, y0, y1, z, o = {}) {
    const AT = root.AncientAtlas; if (!AT) return;
    const pitch = o.pitch || 1.6, mw = o.mw || 1.05, cw = o.cw || 0.55;
    // reuse S modules with slight y-offset stamp (visual kitbash; no dedicated W merlon yet)
    const mf = AT.getFrames()['merlon_S'], cf = AT.getFrames()['crenel_S'];
    for (let y = y0; y + 0.2 < y1; y += pitch) {
      const wM = Math.min(mw, y1 - y);
      if (mf) AT.stamp(d, 'merlon_S', x, y, z, { sx: 0.55 / mf.mw, sy: 1 });
      else d.box(x, y, z, x + 0.55, y + wM, z + 1.7, '#8a8680');
      const cy = y + wM;
      if (cy + 0.15 < y1) {
        if (cf) AT.stamp(d, 'crenel_S', x, cy, z, { sx: 0.55 / cf.mw, sy: (Math.min(cw, y1 - cy)) / cf.mh });
        else d.box(x, cy, z, x + 0.55, cy + Math.min(cw, y1 - cy), z + 1.0, '#8a8680');
      }
    }
  }
  /** Stamp 女墙 parapet along +x at back of walkway. */
  function parapetS(d, y, x0, x1, z, o = {}) {
    const AT = root.AncientAtlas; if (!AT) return;
    const pf = AT.getFrames()['parapet_S'];
    const mw = (pf && pf.mw) || 1.6;
    const n = Math.max(1, Math.round((x1 - x0) / mw));
    const tw = (x1 - x0) / n;
    for (let i = 0; i < n; i++) {
      if (pf) AT.stamp(d, 'parapet_S', x0 + i * tw, y, z, { sx: tw / pf.mw, sy: 1 });
      else d.box(x0 + i * tw, y, z, x0 + (i + 1) * tw, y + 0.6, z + 1.1, '#8a8680');
    }
  }
  function walkTop(d, x0, y0, x1, y1, z) {
    const AT = root.AncientAtlas; if (!AT) {
      d.flat(x0, y0, x1, y1, z, '#a29e95', '#6e6a64'); return;
    }
    AT.ensure();
    const f = AT.getFrames()['walk_top'];
    if (!f) { d.flat(x0, y0, x1, y1, z, '#a29e95', '#6e6a64'); return; }
    const n = Math.max(1, Math.round((x1 - x0) / f.mw));
    const m = Math.max(1, Math.round((y1 - y0) / f.mh));
    const tw = (x1 - x0) / n, th = (y1 - y0) / m;
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      AT.stamp(d, 'walk_top', x0 + i * tw, y0 + j * th, z, { sx: tw / f.mw, sy: th / f.mh });
    }
  }

    /** lean-to eave strip on the W side (slope rising toward +x) */
  function leanW(d, x0, x1, y0, y1, z0, z1, o = {}) {
    const h = H(d), col = shade(o.col || TILE, 0.8);
    h.poly([[x0, y0, z0], [x0, y1, z0], [x1, y1, z1], [x1, y0 + (x1 - x0), z1]], col, shade(col, 0.55));
    for (let y = y0 + 0.3; y < y1; y += 0.3) { const ys = Math.max(y, y0 + (x1 - x0)); h.line([x0, y, z0], [x1, ys, z1], shade(col, 0.75)); h.line([x0, y + 0.08, z0], [x1, ys + 0.08, z1], shade(col, 1.12)); }
    h.line([x0, y0, z0], [x1, y0 + (x1 - x0), z1], o.ridge || RIDGE, 3);
    h.pline([[x0, y0, z0], [x0, y1, z0]], shade(col, 0.5), 2);
  }
  root.AncientParts = { leanW, roof, platform, lattice, latticeW, geshan, dougong, efang, plaque, vsign, banner, lantern, lanternGlow, bannerGlow, hallFront, woodPlanks, stoneCoursing, awningStripe, crateMod, cityBrickS, cityBrickW, cityStoneS, merlonsS, merlonsW, parapetS, walkTop,
    site200: { lanternGlow: true, bannerGlow: true, warmHalo: true, groundWash: true },
    site201: { riverLamps: true, boatLampGlow: true, dockLampGlow: true, waterReflect: true, reuseLanternGlow: true } };
})(typeof window !== 'undefined' ? window : globalThis);
