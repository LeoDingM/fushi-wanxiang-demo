/* 鹰山宋城 — Song module atlas (井槐里-style kitbash).
 * Pre-bakes textured isometric modules (瓦 / 柱 / 匾 / 窗 / 招幌 / 隔扇 / 斗拱 / 墙板 / 屋脊 / 城砖垛口女墙) into an atlas,
 * then AncientParts stamps them instead of live polyline描线. Aligns with community atlas pipeline
 * (kit_ancient/kit_atlas.png + kit_manifest.json).
 * Site197 facade-detail：门/窗/隔扇/斗拱/屋脊瓦再细化 + 新模块（万字窗、板门、雕刻隔扇、大斗拱、脊瓦、门槛）。
 * Site198 wall-merlon：南薰门/城墙 城砖·垛口·女墙 atlas 模块（禁纯线稿）。
 * Site198 roof-ridge：屋脊线/瓦当/鸱吻/屋檐滴水 atlas 细节增强；店铺与公建屋顶更密。禁纯线稿。
 * Site201 signboards：店招/牌匾/幌子文字与边框 atlas 细化（匾额金边如意、竖招板、幌子织纹/奶油布）。禁纯线稿。
 * Site202 paving：御街/广场方砖·条石·席纹铺地 + 排水沟 + 路牙 atlas 模块。禁纯线稿。
 * Site203 lattice：格扇门窗/花窗/隔扇/槛窗 atlas 细化（lattice_geshan / window_huachuang / door_geshan_bubujin / sill_kanchuang）。禁纯线稿。
 * Site204：街具点景 atlas 模块 prop_shideng/prop_shiteng/prop_huagang/prop_lamp_pole（石灯笼·石凳·花缸·挂灯杆）。禁纯线稿。
 * Site205 roof-tiles：瓦当/滴水/瓦垄/檐口 atlas 细化（tile_wadang / tile_dishui / tile_walong / eave_yankou）；比 Site198 更密；禁纯线稿。
 * Site206：山墙/清水砖/墀头/墙帽 atlas 细化（wall_shangqiang / brick_qingshui / ornament_chitou / wall_cap）。禁纯线稿。
 * Site207 rail-queti：栏杆寻杖/雀替/挂落/小柱 atlas 细化（rail_xunzhang / ornament_queti / hanging_gualuo / baluster_xiaozhu）；廊道·临河·庭院·桥侧 densify；禁纯线稿。
 * Site208：彩绘梁枋/额枋/斗拱色块 atlas 细化（beam_efang / caihua_band / dougong_block / eave_board）；宋画青绿+朱红点缀，勿霓虹。禁纯线稿。
 * Site209 door-hardware：门钉/铺首衔环/门槛/抱鼓石 atlas 细化（door_mending / knocker_pushou / sill_menkan / stone_baogu）；城门·衙署·豪宅·店铺大门 densify；禁纯线稿。
 * Site210：旗幡/帷幔/流苏/檐下挂饰 atlas 细化（banner_qifan / curtain_weiman / tassel_liusu / hang_ornament）；与 site201 幌子互补，勿重复堆叠。禁纯线稿。
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
    } else if (style === 'bubujin') {
      const bs = 0.1;
      for (let x = X0 + bs; x < X1; x += bs) d.seg([x, -0.012, Z0], [x, -0.012, Z1], lc);
      for (let z = Z0 + bs; z < Z1; z += bs) d.seg([X0, -0.012, z], [X1, -0.012, z], lc);
      const cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2;
      d.QS(-0.014, cx - (X1 - X0) * 0.22, cz - (Z1 - Z0) * 0.22, cx + (X1 - X0) * 0.22, cz + (Z1 - Z0) * 0.22, PAPER, lc);
      d.QS(-0.016, cx - (X1 - X0) * 0.1, cz - (Z1 - Z0) * 0.1, cx + (X1 - X0) * 0.1, cz + (Z1 - Z0) * 0.1, shade(PAPER, 1.05), shade(GOLD, 0.7));
      /* Site203：步步锦加中挺与边框金钉 */
      d.QS(-0.013, cx - 0.025, Z0, cx + 0.025, Z1, shade(fr, 0.95), shade(fr, 0.5));
      for (const [sx, sz] of [[X0 + 0.04, Z0 + 0.04], [X1 - 0.04, Z0 + 0.04], [X0 + 0.04, Z1 - 0.04], [X1 - 0.04, Z1 - 0.04]]) {
        d.QS(-0.015, sx - 0.025, sz - 0.025, sx + 0.025, sz + 0.025, GOLD);
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
  /* Site201：宋风匾额边框 — 多层金边 + 如意角花 + 漆面/木面底（禁纯线稿） */
  function paintPlaqueFrame(d, w, ht, o = {}) {
    const style = o.style || 'dark';
    const fr = GOLD;
    const bg = style === 'wood' ? '#5a3a22' : '#1a2840';
    const bgLite = style === 'wood' ? shade(bg, 1.22) : shade(bg, 1.18);
    const bgDark = shade(bg, 0.55);
    /* outer dark rail */
    d.QS(0, -w / 2 - 0.12, -ht / 2 - 0.12, w / 2 + 0.12, ht / 2 + 0.12, shade(fr, 0.55), shade(fr, 0.32));
    /* mid gold frame */
    d.QS(-0.004, -w / 2 - 0.08, -ht / 2 - 0.08, w / 2 + 0.08, ht / 2 + 0.08, shade(fr, 0.85), shade(fr, 0.42));
    d.QS(-0.008, -w / 2 - 0.055, -ht / 2 - 0.055, w / 2 + 0.055, ht / 2 + 0.055, fr, shade(fr, 0.48));
    /* bright inner fillet */
    d.QS(-0.012, -w / 2 - 0.03, -ht / 2 - 0.03, w / 2 + 0.03, ht / 2 + 0.03, shade(fr, 1.28));
    /* lacquer / wood panel */
    d.QS(-0.016, -w / 2, -ht / 2, w / 2, ht / 2, bg, bgDark);
    /* subtle panel grain / sheen strips (atlas texture, not line art) */
    for (let i = 0; i < 5; i++) {
      const zx = -ht / 2 + 0.08 + i * (ht - 0.16) / 4;
      d.QS(-0.018, -w / 2 + 0.06, zx, w / 2 - 0.06, zx + 0.035, i % 2 ? bgLite : shade(bg, 0.92));
    }
    /* 如意角花 bosses */
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const px = sx * (w / 2 + 0.01), pz = sz * (ht / 2 + 0.01);
      d.QS(-0.01, px - 0.08, pz - 0.055, px + 0.08, pz + 0.055, shade(fr, 1.05), shade(fr, 0.5));
      d.QS(-0.014, px - 0.045, pz - 0.03, px + 0.045, pz + 0.03, shade(fr, 1.32));
      d.QS(-0.016, px - 0.02, pz - 0.015, px + 0.02, pz + 0.015, '#e8c868');
    }
    /* top rail jewels */
    for (const sx of [-0.35, 0, 0.35]) {
      const px = sx * w;
      d.QS(-0.01, px - 0.05, ht / 2 + 0.02, px + 0.05, ht / 2 + 0.09, shade(fr, 1.15));
      d.QS(-0.014, px - 0.025, ht / 2 + 0.04, px + 0.025, ht / 2 + 0.075, '#c8322c', shade('#c8322c', 0.5));
    }
    /* tassels */
    for (const s of [-1, 1]) {
      d.seg([s * (w / 2 + 0.09), -0.02, -ht / 2], [s * (w / 2 + 0.09), -0.02, -ht / 2 - 0.38], fr);
      d.QS(-0.01, s * (w / 2 + 0.04), -ht / 2 - 0.5, s * (w / 2 + 0.14), -ht / 2 - 0.36, '#c8322c', shade('#c8322c', 0.5));
      d.QS(-0.012, s * (w / 2 + 0.06), -ht / 2 - 0.46, s * (w / 2 + 0.12), -ht / 2 - 0.4, shade('#c8322c', 1.2));
    }
  }
  /* Site201：竖招木板边框 atlas（金边+木纹底） */
  function paintVsignBoard(d, w, ht) {
    const fr = GOLD, bg = '#2a1e16', wood = '#6a4a2a';
    d.QS(0, -w / 2 - 0.08, -ht / 2 - 0.08, w / 2 + 0.08, ht / 2 + 0.08, shade(fr, 0.65), shade(fr, 0.35));
    d.QS(-0.005, -w / 2 - 0.05, -ht / 2 - 0.05, w / 2 + 0.05, ht / 2 + 0.05, fr, shade(fr, 0.45));
    d.QS(-0.01, -w / 2 - 0.02, -ht / 2 - 0.02, w / 2 + 0.02, ht / 2 + 0.02, shade(fr, 1.22));
    d.QS(-0.014, -w / 2, -ht / 2, w / 2, ht / 2, bg, shade(bg, 0.45));
    /* vertical wood grain */
    for (let i = 0; i < 4; i++) {
      const x = -w / 2 + 0.06 + i * (w - 0.12) / 3;
      d.QS(-0.016, x, -ht / 2 + 0.06, x + 0.04, ht / 2 - 0.06, i % 2 ? wood : shade(wood, 0.85));
    }
    /* corner studs */
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const px = sx * (w / 2 - 0.02), pz = sz * (ht / 2 - 0.02);
      d.QS(-0.012, px - 0.04, pz - 0.03, px + 0.04, pz + 0.03, shade(fr, 1.18));
    }
    /* top hanging ring */
    d.QS(-0.008, -0.06, ht / 2 + 0.02, 0.06, ht / 2 + 0.1, shade(fr, 0.9));
    d.QS(-0.012, -0.03, ht / 2 + 0.04, 0.03, ht / 2 + 0.08, shade(fr, 1.25));
  }
  function paintBanner(d, w, L, col) {
    col = col || '#c8322c';
    /* cloth body with soft tip */
    d.face([[-w / 2, 0, 0], [w / 2, 0, 0], [w / 2 + 0.03, 0, -L], [w * 0.12, 0, -L - 0.22], [-w / 2 - 0.02, 0, -L]], col, shade(col, 0.48));
    /* weave / stripe texture */
    for (let i = 0; i < 6; i++) {
      const z0 = -0.14 - i * (L - 0.28) / 5;
      d.QS(-0.008, -w / 2 + 0.04, z0, w / 2 - 0.04, z0 - 0.05, i % 2 ? shade(col, 1.12) : shade(col, 0.88));
    }
    /* top hanging bar */
    d.QS(-0.01, -w / 2 - 0.02, -0.14, w / 2 + 0.02, 0.02, shade('#3a2a1a', 0.9), shade('#3a2a1a', 0.5));
    d.QS(-0.014, -w / 2 + 0.02, -0.11, w / 2 - 0.02, -0.01, GOLD);
    d.QS(-0.016, -w / 2 + 0.05, -0.09, w / 2 - 0.05, -0.03, shade(GOLD, 1.25));
    /* side gold piping */
    d.seg([-w / 2 + 0.02, -0.01, -0.12], [-w / 2 + 0.01, -0.01, -L + 0.08], shade(GOLD, 0.85));
    d.seg([w / 2 - 0.02, -0.01, -0.12], [w / 2 + 0.01, -0.01, -L + 0.08], shade(GOLD, 0.85));
    /* inner gold border */
    d.QS(-0.012, -w / 2 + 0.06, -L + 0.08, w / 2 - 0.06, -0.18, null, GOLD);
    /* fringe tassels denser */
    for (let k = 0; k < 6; k++) {
      const tx = -w / 2 + 0.05 + k * w * 0.18;
      d.seg([tx, 0, -L + 0.02], [tx, 0, -L - 0.2 - (k % 2) * 0.07], shade(col, 0.62));
      d.QS(-0.005, tx - 0.035, -L - 0.26 - (k % 2) * 0.07, tx + 0.035, -L - 0.18 - (k % 2) * 0.07, GOLD);
      d.QS(-0.008, tx - 0.018, -L - 0.24 - (k % 2) * 0.07, tx + 0.018, -L - 0.2 - (k % 2) * 0.07, shade(GOLD, 1.2));
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

  /** Site205：更密瓦当（宝相/兽面金饰 + 重圈当缘；禁纯线稿）— 强化既有 tile_wadang_S */
  function paintWadangDenseS(d, w) {
    const col = TILE, dark = shade(col, 0.38), lite = shade(col, 1.35);
    d.QS(0, 0, 0, w, 0.24, col, dark);
    for (let x = 0.08; x < w; x += 0.22) {
      d.QS(-0.004, x - 0.02, 0.02, x + 0.14, 0.2, shade(col, 0.92), dark);
      const q = d.P(x + 0.05, -0.045, 0.1);
      const cx = Math.round(q[0]), cy = Math.round(q[1]);
      d.g.fillStyle = dark; d.g.beginPath(); d.g.ellipse(cx, cy, 6.0, 6.6, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(col, 0.55); d.g.beginPath(); d.g.ellipse(cx, cy, 4.8, 5.2, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = lite; d.g.beginPath(); d.g.ellipse(cx, cy, 3.2, 3.4, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(GOLD, 0.95); d.g.beginPath(); d.g.ellipse(cx, cy, 1.9, 2.0, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(GOLD, 1.2); d.g.fillRect(cx - 1, cy - 1, 3, 3);
      d.g.fillStyle = shade(GOLD, 0.75);
      for (const a of [0, 30, 60, 90, 120, 150]) {
        const rad = a * Math.PI / 180, rr = 3.8;
        d.g.fillRect(cx + Math.round(Math.cos(rad) * rr) - 1, cy + Math.round(Math.sin(rad) * rr) - 1, 2, 2);
      }
      /* petal beads */
      for (const a of [15, 75, 135]) {
        const rad = a * Math.PI / 180, rr = 2.4;
        d.g.fillStyle = shade(GOLD, 1.05);
        d.g.fillRect(cx + Math.round(Math.cos(rad) * rr), cy + Math.round(Math.sin(rad) * rr), 1, 1);
      }
    }
  }
  /** Site205：滴水（如意尖头 + 筒瓦接缝 + 金点；比 tile_drip 更密） */
  function paintDishuiS(d, w) {
    const col = TILE, lite = shade(col, 1.3), dark = shade(col, 0.42);
    d.QS(0, 0, 0.04, w, 0.3, col, dark);
    for (let x = 0.04; x < w; x += 0.14) {
      d.QS(-0.006, x, 0.06, x + 0.09, 0.28, lite, dark);
      d.seg([x + 0.045, -0.012, 0.06], [x + 0.045, -0.012, 0.28], shade(col, 0.68));
    }
    for (let x = 0.07; x < w; x += 0.14) {
      const q = d.P(x, -0.07, -0.04);
      const cx = Math.round(q[0]), cy = Math.round(q[1]);
      d.g.fillStyle = dark;
      d.g.beginPath(); d.g.moveTo(cx - 3.5, cy); d.g.lineTo(cx + 3.5, cy); d.g.lineTo(cx + 1.2, cy + 5); d.g.lineTo(cx, cy + 8); d.g.lineTo(cx - 1.2, cy + 5); d.g.closePath(); d.g.fill();
      d.g.fillStyle = lite;
      d.g.beginPath(); d.g.moveTo(cx - 2.2, cy + 0.5); d.g.lineTo(cx + 2.2, cy + 0.5); d.g.lineTo(cx, cy + 6); d.g.closePath(); d.g.fill();
      d.g.fillStyle = shade(GOLD, 0.7); d.g.fillRect(cx - 1, cy + 1, 2, 3);
      d.g.fillStyle = shade(GOLD, 1.05); d.g.fillRect(cx, cy + 4, 1, 2);
    }
  }
  /** Site205：瓦垄（筒瓦垄脊 + 板瓦凹槽交替，屋顶坡面） */
  function paintWalongS(d, w) {
    const col = TILE, lite = shade(col, 1.32), dark = shade(col, 0.48), mid = shade(col, 0.78);
    d.QS(0, 0, 0, w, 0.26, col, dark);
    for (let x = 0.03; x < w; x += 0.13) {
      /* 筒瓦垄 */
      d.QS(-0.008, x, 0.01, x + 0.075, 0.25, lite, dark);
      d.QS(-0.01, x + 0.012, 0.04, x + 0.063, 0.22, shade(col, 1.45));
      d.seg([x + 0.038, -0.014, 0.02], [x + 0.038, -0.014, 0.24], shade(col, 0.7));
      /* 板瓦凹 */
      const bx = x + 0.075;
      if (bx + 0.05 < w) {
        d.QS(-0.003, bx, 0.03, bx + 0.05, 0.22, mid);
        d.QS(-0.004, bx + 0.01, 0.05, bx + 0.04, 0.2, shade(col, 0.62));
      }
    }
    /* 金边接缝点 */
    for (let x = 0.1; x < w; x += 0.26) {
      d.QS(-0.012, x - 0.02, 0.11, x + 0.02, 0.15, shade(GOLD, 0.5));
    }
  }
  /** Site205：檐口（木檐楣 + 瓦口线 + 滴水座） */
  function paintYankouS(d, w) {
    const wood = WOOD_D, lite = shade(wood, 1.35), dark = shade(wood, 0.45);
    const col = TILE;
    /* timber fascia */
    d.QS(0, 0, 0.08, w, 0.28, wood, dark);
    d.QS(-0.004, 0.02, 0.1, w - 0.02, 0.26, shade(wood, 1.08), dark);
    for (let x = 0.08; x < w; x += 0.22) {
      d.seg([x, -0.01, 0.1], [x, -0.01, 0.26], shade(wood, 0.7));
      d.QS(-0.008, x - 0.03, 0.14, x + 0.03, 0.22, lite);
    }
    /* tile mouth / 瓦口 */
    d.QS(-0.02, 0, 0.0, w, 0.1, col, shade(col, 0.5));
    for (let x = 0.05; x < w; x += 0.12) {
      d.QS(-0.025, x, 0.01, x + 0.07, 0.09, shade(col, 1.2), shade(col, 0.55));
    }
    /* gold trim beads along eave lip */
    for (let x = 0.1; x < w; x += 0.18) {
      d.QS(-0.03, x - 0.015, 0.02, x + 0.015, 0.05, shade(GOLD, 0.65));
    }
    /* small drip seats */
    for (let x = 0.14; x < w; x += 0.24) {
      const q = d.P(x, -0.05, -0.02);
      const cx = Math.round(q[0]), cy = Math.round(q[1]);
      d.g.fillStyle = shade(col, 0.45);
      d.g.beginPath(); d.g.moveTo(cx - 2, cy); d.g.lineTo(cx + 2, cy); d.g.lineTo(cx, cy + 4); d.g.closePath(); d.g.fill();
    }
  }

  /* Site203：密格隔心/横披 — 多重棂条 + 纸面颗粒（禁纯线稿） */
  function paintLatticeGeshan(d, w, h, o = {}) {
    const fr = RED_W, paper = PAPER, m = 0.06;
    d.QS(0, 0, 0, w, h, fr, shade(fr, 0.4));
    d.QS(-0.004, 0.025, 0.025, w - 0.025, h - 0.025, shade(fr, 0.92), shade(fr, 0.5));
    d.QS(-0.008, m, m, w - m, h - m, paper, shade(fr, 0.55));
    for (let i = 0; i < 16; i++) {
      const x = m + 0.03 + (i * 0.27) % (w - 2 * m - 0.08);
      const z = m + 0.04 + ((i * 0.43) % (h - 2 * m - 0.1));
      d.QS(-0.009, x, z, x + 0.045, z + 0.035, shade(paper, i % 2 ? 0.94 : 1.06));
    }
    const X0 = m + 0.02, X1 = w - m - 0.02, Z0 = m + 0.02, Z1 = h - m - 0.02;
    const lc = shade(fr, 0.78), s = 0.085;
    /* dense grid + mid stile/rail */
    for (let x = X0 + s; x < X1; x += s) d.seg([x, -0.012, Z0], [x, -0.012, Z1], lc);
    for (let z = Z0 + s; z < Z1; z += s) d.seg([X0, -0.012, z], [X1, -0.012, z], lc);
    d.QS(-0.011, (X0 + X1) / 2 - 0.03, Z0, (X0 + X1) / 2 + 0.03, Z1, shade(fr, 0.95), shade(fr, 0.5));
    d.QS(-0.011, X0, (Z0 + Z1) / 2 - 0.03, X1, (Z0 + Z1) / 2 + 0.03, shade(fr, 0.95), shade(fr, 0.5));
    /* gold corner pins */
    for (const [sx, sz] of [[m, m], [w - m, m], [m, h - m], [w - m, h - m]]) {
      d.QS(-0.014, sx - 0.03, sz - 0.03, sx + 0.03, sz + 0.03, GOLD);
      d.QS(-0.015, sx - 0.012, sz - 0.012, sx + 0.012, sz + 0.012, shade(GOLD, 1.25));
    }
  }
  /* Site203：花窗 — 外框雕刻如意/卷草 + 冰裂纹隔心 */
  function paintHuachuang(d, w, h) {
    const fr = RED_W, paper = PAPER, m = 0.09;
    d.QS(0, 0, 0, w, h, fr, shade(fr, 0.38));
    d.QS(-0.004, 0.03, 0.03, w - 0.03, h - 0.03, shade(fr, 0.9), shade(fr, 0.48));
    /* carved outer border bosses */
    for (let i = 0; i < 8; i++) {
      const t = i / 8, x = 0.08 + t * (w - 0.16), z = 0.05;
      d.QS(-0.01, x - 0.04, z, x + 0.04, z + 0.06, shade(GOLD, 0.7));
      d.QS(-0.01, x - 0.04, h - z - 0.06, x + 0.04, h - z, shade(GOLD, 0.7));
    }
    for (let i = 0; i < 5; i++) {
      const t = i / 5, z = 0.12 + t * (h - 0.24);
      d.QS(-0.01, 0.04, z - 0.035, 0.1, z + 0.035, shade(GOLD, 0.65));
      d.QS(-0.01, w - 0.1, z - 0.035, w - 0.04, z + 0.035, shade(GOLD, 0.65));
    }
    d.QS(-0.008, m, m, w - m, h - m, paper, shade(fr, 0.55));
    for (let i = 0; i < 12; i++) {
      const x = m + 0.04 + (i * 0.31) % (w - 2 * m - 0.1);
      const z = m + 0.05 + ((i * 0.49) % (h - 2 * m - 0.12));
      d.QS(-0.009, x, z, x + 0.05, z + 0.04, shade(paper, i % 2 ? 0.93 : 1.05));
    }
    /* 冰裂纹：不规则斜交棂（atlas 填面，非稀疏线稿） */
    const X0 = m + 0.04, X1 = w - m - 0.04, Z0 = m + 0.04, Z1 = h - m - 0.04, lc = shade(fr, 0.8);
    const segs = [
      [0.05, 0.08, 0.55, 0.22], [0.55, 0.22, 0.95, 0.1], [0.2, 0.08, 0.35, 0.45],
      [0.35, 0.45, 0.7, 0.35], [0.7, 0.35, 0.85, 0.7], [0.1, 0.4, 0.45, 0.55],
      [0.45, 0.55, 0.3, 0.9], [0.3, 0.9, 0.65, 0.85], [0.65, 0.85, 0.9, 0.55],
      [0.15, 0.65, 0.5, 0.75], [0.55, 0.1, 0.6, 0.5], [0.75, 0.15, 0.55, 0.55],
      [0.05, 0.5, 0.25, 0.75], [0.8, 0.4, 0.95, 0.8], [0.4, 0.7, 0.75, 0.95],
    ];
    const Ww = X1 - X0, Hh = Z1 - Z0;
    for (const [ax, az, bx, bz] of segs) {
      d.seg([X0 + ax * Ww, -0.012, Z0 + az * Hh], [X0 + bx * Ww, -0.012, Z0 + bz * Hh], lc);
    }
    /* thickened timber ribs as filled strips */
    d.QS(-0.011, X0 + Ww * 0.32, Z0, X0 + Ww * 0.38, Z1, shade(fr, 0.92), shade(fr, 0.5));
    d.QS(-0.011, X0, Z0 + Hh * 0.42, X1, Z0 + Hh * 0.48, shade(fr, 0.92), shade(fr, 0.5));
    /* corner peony suggestion */
    for (const [sx, sz] of [[m + 0.08, m + 0.08], [w - m - 0.08, m + 0.08], [m + 0.08, h - m - 0.08], [w - m - 0.08, h - m - 0.08]]) {
      d.QS(-0.014, sx - 0.05, sz - 0.05, sx + 0.05, sz + 0.05, shade(GOLD, 0.75));
      d.QS(-0.015, sx - 0.022, sz - 0.022, sx + 0.022, sz + 0.022, shade(GOLD, 1.2));
    }
  }
  /* Site203：槛窗 — 石槛 + 矮窗格 + 上披 */
  function paintKanchuang(d, w, h) {
    const fr = RED_W, paper = PAPER, sillH = Math.min(0.28, h * 0.22);
    /* stone sill base */
    d.QS(0, 0, 0, w, sillH, STONE, shade(STONE, 0.5));
    d.QS(-0.005, 0.04, 0.04, w - 0.04, sillH - 0.04, shade(STONE, 1.08));
    for (let x = 0.12; x < w; x += 0.28) d.seg([x, -0.008, 0.03], [x, -0.008, sillH - 0.03], shade(STONE, 0.72));
    d.QS(-0.008, 0, sillH - 0.04, w, sillH, shade(WOOD, 0.75));
    /* window frame above sill */
    const z0 = sillH, hh = h - sillH;
    d.QS(-0.002, 0, z0, w, h, fr, shade(fr, 0.4));
    d.QS(-0.006, 0.04, z0 + 0.04, w - 0.04, h - 0.04, shade(fr, 0.92), shade(fr, 0.5));
    const m = 0.08;
    d.QS(-0.01, m, z0 + m, w - m, h - m, paper, shade(fr, 0.55));
    for (let i = 0; i < 10; i++) {
      const x = m + 0.03 + (i * 0.33) % (w - 2 * m - 0.08);
      const z = z0 + m + 0.04 + ((i * 0.41) % (hh - 2 * m - 0.1));
      d.QS(-0.011, x, z, x + 0.045, z + 0.03, shade(paper, i % 2 ? 0.94 : 1.05));
    }
    const X0 = m + 0.02, X1 = w - m - 0.02, Z0 = z0 + m + 0.02, Z1 = h - m - 0.02, lc = shade(fr, 0.78);
    const s = 0.1;
    for (let x = X0 + s; x < X1; x += s) d.seg([x, -0.013, Z0], [x, -0.013, Z1], lc);
    for (let z = Z0 + s; z < Z1; z += s) d.seg([X0, -0.013, z], [X1, -0.013, z], lc);
    /* mid stile */
    d.QS(-0.012, (X0 + X1) / 2 - 0.025, Z0, (X0 + X1) / 2 + 0.025, Z1, shade(fr, 0.95), shade(fr, 0.5));
    /* top drip + gold pins */
    d.QS(-0.01, 0, h - 0.05, w, h, shade(fr, 0.7));
    for (const sx of [m, w / 2, w - m]) {
      d.QS(-0.014, sx - 0.03, h - 0.04, sx + 0.03, h - 0.01, GOLD);
    }
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
  /* Site202 paving atlas kitbash — 方砖 / 条石 / 席纹 / 排水沟 / 路牙（禁纯线稿） */
  function paintPaveFangzhuan(d, w, dpth) {
    const col = '#a8a296', m = '#7a7468';
    d.box(0, 0, 0, w, dpth, 0.05, col, { line: shade(col, 0.5), west: shade(col, 0.82), top: shade(col, 1.1), south: shade(col, 0.95) });
    for (let x = 0.4; x < w; x += 0.5) d.seg([x, 0.02, 0.06], [x, dpth - 0.02, 0.06], shade(m, 0.95));
    for (let y = 0.4; y < dpth; y += 0.5) d.seg([0.02, y, 0.06], [w - 0.02, y, 0.06], shade(m, 1.05));
    for (let i = 0; i < 8; i++) {
      const x = 0.1 + (i * 0.37) % (w - 0.3), y = 0.12 + ((i * 0.53) % (dpth - 0.25));
      d.box(x, y, 0.05, x + 0.12, y + 0.09, 0.055, shade(col, i % 2 ? 0.9 : 1.08), { line: false, noW: true, noS: true });
    }
  }
  function paintPaveTiaoshi(d, w, dpth) {
    const col = '#8e887c', m = '#6a6458';
    d.box(0, 0, 0, w, dpth, 0.05, col, { line: shade(col, 0.48), west: shade(col, 0.8), top: shade(col, 1.08), south: shade(col, 0.94) });
    for (let x = 0.55; x < w; x += 0.7) d.seg([x, 0.02, 0.06], [x, dpth - 0.02, 0.06], shade(m, 0.9));
    for (let y = 0.9; y < dpth; y += 1.0) d.seg([0.02, y, 0.06], [w - 0.02, y, 0.06], shade(m, 1.05));
    d.QS(-0.01, 0.15, 0.055, w - 0.15, 0.06, 'rgba(220,210,190,0.28)');
  }
  function paintPaveXiewen(d, w, dpth) {
    const col = '#b0aa9c', m = '#7a7468';
    d.box(0, 0, 0, w, dpth, 0.05, col, { line: shade(col, 0.5), west: shade(col, 0.82), top: shade(col, 1.1), south: shade(col, 0.95) });
    for (let i = -2; i < 5; i++) {
      const x0 = i * 0.45;
      d.seg([x0, 0.05, 0.06], [x0 + dpth, dpth - 0.05, 0.06], shade(m, 0.92));
      d.seg([x0 + dpth, 0.05, 0.06], [x0, dpth - 0.05, 0.06], shade(m, 0.88));
    }
  }
  function paintDrainGutter(d) {
    const w = 0.7, dpth = 0.7;
    const ditch = '#5a554c', wet = '#3a4a52', curb = '#9a9488';
    d.box(0.08, 0.12, -0.05, w - 0.08, dpth - 0.12, 0.02, ditch, { line: shade(ditch, 0.5), top: wet, west: shade(ditch, 0.75), south: shade(ditch, 0.85) });
    d.box(0, 0.08, 0.02, 0.14, dpth - 0.08, 0.16, curb, { line: shade(curb, 0.48), west: shade(curb, 0.78), top: shade(curb, 1.12), south: shade(curb, 0.95) });
    d.box(w - 0.14, 0.08, 0.02, w, dpth - 0.08, 0.16, curb, { line: shade(curb, 0.48), west: shade(curb, 0.78), top: shade(curb, 1.12), south: shade(curb, 0.95) });
    for (let y = 0.22; y < dpth - 0.1; y += 0.28) {
      d.seg([0.02, y, 0.04], [0.02, y, 0.14], shade(curb, 0.7));
      d.seg([w - 0.02, y, 0.04], [w - 0.02, y, 0.14], shade(curb, 0.7));
    }
    /* wet glints — textured, not line-only */
    d.QS(-0.02, 0.18, 0.025, w - 0.18, 0.03, 'rgba(120,150,160,0.35)');
    d.box(0.2, 0.25, 0.02, 0.5, 0.45, 0.035, shade(wet, 1.15), { line: false, noW: true, noS: true });
  }
  function paintCurbStone(d) {
    const w = 0.95, dpth = 0.32, h = 0.22;
    const curb = '#9a9488';
    d.box(0, 0, 0, w, dpth, h, curb, { line: shade(curb, 0.48), west: shade(curb, 0.78), top: shade(curb, 1.14), south: shade(curb, 0.95) });
    for (let x = 0.28; x < w; x += 0.45) d.seg([x, -0.01, 0.02], [x, -0.01, h - 0.02], shade(curb, 0.68));
    d.box(0.05, -0.02, h - 0.04, w - 0.05, dpth + 0.02, h + 0.03, shade(curb, 1.08), { line: shade(curb, 0.5), top: shade(curb, 1.2), west: shade(curb, 0.85), south: shade(curb, 1.02) });
    for (let i = 0; i < 5; i++) {
      const x = 0.1 + i * 0.16;
      d.box(x, 0.04, h + 0.01, x + 0.08, 0.14, h + 0.025, shade(curb, i % 2 ? 0.92 : 1.1), { line: false, noW: true, noS: true });
    }
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


  /* ---- Site204：宋风街具 atlas 模块（石灯笼/石凳/花缸/挂灯杆）禁纯线稿 ---- */
  function paintPropShideng(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', GOLD = '#c8a040';
    // 基座
    d.box(-0.42, -0.42, 0, 0.42, 0.42, 0.28, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.9) });
    for (let z = 0.1; z < 0.26; z += 0.1) {
      d.seg([-0.4, -0.425, z], [0.4, -0.425, z], shade(ST, 0.7));
      d.seg([-0.425, -0.4, z], [-0.425, 0.4, z], shade(STW, 0.7));
    }
    // 中柱
    d.box(-0.16, -0.16, 0.28, 0.16, 0.16, 0.95, shade(ST, 0.95), { line: shade(ST, 0.5), west: STW, top: TOP });
    for (let z = 0.4; z < 0.9; z += 0.14) d.seg([-0.17, -0.17, z], [0.17, -0.17, z], shade(ST, 0.75));
    // 灯室六角（贴图块 + 格栅）
    d.box(-0.34, -0.34, 0.95, 0.34, 0.34, 1.55, shade(ST, 1.02), { line: shade(ST, 0.48), west: STW, top: TOP });
    d.QS(-0.35, -0.22, 1.05, 0.22, 1.45, '#e8d090', shade(ST, 0.55));
    d.QS(-0.36, -0.16, 1.12, 0.16, 1.38, '#fff0b8');
    for (const x of [-0.14, 0, 0.14]) d.seg([x, -0.355, 1.05], [x, -0.355, 1.45], shade(ST, 0.55));
    for (const z of [1.18, 1.32]) d.seg([-0.22, -0.355, z], [0.22, -0.355, z], shade(ST, 0.55));
    // 宝顶屋顶
    d.box(-0.48, -0.48, 1.55, 0.48, 0.48, 1.68, shade(ST, 1.08), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.2) });
    d.box(-0.22, -0.22, 1.68, 0.22, 0.22, 1.88, shade(ST, 1.05), { line: shade(ST, 0.5), west: STW, top: TOP });
    d.box(-0.08, -0.08, 1.88, 0.08, 0.08, 2.12, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.8), top: '#e8c868' });
    // 隅石装饰
    for (const [x, y] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) {
      d.box(x - 0.08, y - 0.08, 0.28, x + 0.08, y + 0.08, 0.42, shade(ST, 0.9), { line: shade(ST, 0.5), west: STW, top: TOP });
    }
  }
  function paintPropShiteng(d) {
    const ST = '#8a8070', STW = '#6a6258';
    // 两条石腿
    d.box(-0.55, -0.22, 0, -0.32, 0.22, 0.38, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.88) });
    d.box(0.32, -0.22, 0, 0.55, 0.22, 0.38, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.88) });
    for (let z = 0.12; z < 0.36; z += 0.12) {
      d.seg([-0.54, -0.225, z], [-0.33, -0.225, z], shade(ST, 0.7));
      d.seg([0.33, -0.225, z], [0.54, -0.225, z], shade(ST, 0.7));
    }
    // 坐面厚板
    d.box(-0.72, -0.32, 0.38, 0.72, 0.32, 0.52, shade(ST, 1.02), { line: shade(ST, 0.48), west: STW, top: shade(ST, 1.15) });
    for (let x = -0.5; x < 0.55; x += 0.28) d.seg([x, -0.325, 0.52], [x, 0.325, 0.52], shade(ST, 0.78));
    d.seg([-0.7, -0.325, 0.45], [0.7, -0.325, 0.45], shade(ST, 0.72));
    // 端面装饰线
    d.QS(-0.73, -0.28, 0.4, 0.28, 0.5, shade(ST, 1.08), shade(ST, 0.55));
    d.QS(0.73, -0.28, 0.4, 0.28, 0.5, shade(STW, 1.05), shade(ST, 0.55));
  }
  function paintPropHuagang(d) {
    const CER = '#8a5a3a', CERW = '#6a4028', GLAZE = '#6a8a58', RIM = '#c8a878';
    // 缸身（略收腰）
    d.box(-0.38, -0.38, 0, 0.38, 0.38, 0.22, shade(CER, 0.9), { line: shade(CER, 0.5), west: CERW, top: shade(CER, 0.85) });
    d.box(-0.42, -0.42, 0.22, 0.42, 0.42, 0.72, CER, { line: shade(CER, 0.48), west: CERW, top: shade(CER, 0.95) });
    d.box(-0.36, -0.36, 0.72, 0.36, 0.36, 0.88, shade(CER, 1.05), { line: shade(CER, 0.5), west: CERW, top: RIM });
    // 釉带与浮雕环
    d.QS(-0.425, -0.35, 0.38, 0.35, 0.52, GLAZE, shade(CER, 0.55));
    d.QS(-0.425, -0.32, 0.58, 0.32, 0.66, shade(RIM, 0.95), shade(CER, 0.55));
    for (let z = 0.28; z < 0.7; z += 0.12) d.seg([-0.43, -0.43, z], [0.43, -0.43, z], shade(CER, 0.72));
    // 泥土 + 花叶簇
    d.box(-0.3, -0.3, 0.88, 0.3, 0.3, 0.96, '#4a3a28', { line: '#2a1a10', top: '#3a2a18', west: '#3a2a18' });
    for (const [dx, dy, zz, r, c1, c2] of [
      [-0.12, -0.08, 1.15, 0.18, '#6f9e46', '#466e30'],
      [0.14, 0.06, 1.28, 0.16, '#8ab850', '#5f8e3c'],
      [0.02, -0.14, 1.08, 0.14, '#c8322c', '#8a2010'],
      [-0.05, 0.12, 1.22, 0.12, '#e85a3a', '#a03018'],
      [0.18, -0.1, 1.18, 0.1, '#f0c850', '#a07020'],
    ]) {
      const g = d.g, p = d.P(dx, dy, zz);
      g.fillStyle = c1; g.beginPath(); g.ellipse(p[0], p[1], r * 28, r * 20, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = c2; g.beginPath(); g.ellipse(p[0] - 3, p[1] + 2, r * 14, r * 10, 0, 0, Math.PI * 2); g.fill();
    }
  }
  function paintPropLampPole(d) {
    const WOOD = '#5a2a1c', WOOD_D = '#2a0e08', ST = '#8a8070', STW = '#6a6258', GOLD = '#c8a040';
    // 石座
    d.box(-0.28, -0.28, 0, 0.28, 0.28, 0.36, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.9) });
    for (let z = 0.12; z < 0.34; z += 0.12) d.seg([-0.26, -0.285, z], [0.26, -0.285, z], shade(ST, 0.7));
    // 木杆
    d.box(-0.09, -0.09, 0.36, 0.09, 0.09, 3.55, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    for (let z = 0.7; z < 3.4; z += 0.35) d.seg([-0.1, -0.1, z], [0.1, -0.1, z], shade(WOOD, 1.15));
    // 横挑臂
    d.box(-0.08, -0.95, 3.25, 0.08, 0.12, 3.42, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.08) });
    d.box(-0.12, -0.12, 3.5, 0.12, 0.12, 3.7, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.8), top: '#e8c868' });
    // 吊绳 + 挂灯（贴图块，非纯线）
    d.seg([0, -0.78, 3.28], [0, -0.78, 2.95], WOOD_D, 2);
    const g = d.g, c = d.P(0, -0.78, 2.55);
    g.fillStyle = '#5a2a1c'; g.fillRect(Math.round(c[0] - 2), Math.round(c[1] - 22), 4, 8);
    g.fillStyle = '#c8322c'; g.beginPath(); g.ellipse(c[0], c[1], 14, 18, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e85840'; g.beginPath(); g.ellipse(c[0] - 3, c[1] - 2, 8, 12, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#c8a040'; g.fillRect(Math.round(c[0] - 12), Math.round(c[1] - 20), 24, 3);
    g.fillRect(Math.round(c[0] - 12), Math.round(c[1] + 16), 24, 3);
    g.fillStyle = '#c8322c'; g.fillRect(Math.round(c[0] - 1), Math.round(c[1] + 19), 2, 10);
  }


  /* ---- Site206：山墙 / 清水砖 / 墀头 / 墙帽（民居店铺侧墙；禁纯线稿） ---- */
  const QS_BRICK = '#9a9690', QS_BRICK_W = '#7e7a74', QS_MORTAR = '#b8b2a6';
  /** 硬山山墙面：密实清水砖 + 屋脊三角收分感（体积块，非描线） */
  function paintShangqiang(d, w, h) {
    d.QS(0, 0, 0, w, h, QS_BRICK, shade(QS_BRICK, 0.48));
    // dense running-bond brick courses
    for (let z = 0.12, k = 0; z < h - 0.02; z += 0.12, k++) {
      d.QS(-0.004, 0.01, z - 0.015, w - 0.01, z, shade(QS_MORTAR, 0.92));
      const ox = (k % 2) * 0.18;
      for (let x = ox; x < w - 0.03; x += 0.36) {
        d.seg([x, -0.006, z - 0.12], [x, -0.006, z], shade(QS_BRICK, 0.62));
        d.QS(-0.007, x + 0.04, z - 0.09, x + 0.18, z - 0.04, shade(QS_BRICK, k % 3 ? 0.94 : 1.1));
      }
    }
    // triangular gable taper hint (upper third denser coping bands)
    const peak = h * 0.72;
    for (let i = 0; i < 5; i++) {
      const t = i / 5, z0 = peak + t * (h - peak) * 0.85;
      const inset = t * w * 0.28;
      d.QS(-0.008, inset, z0, w - inset, Math.min(h - 0.02, z0 + 0.1), shade(QS_BRICK, 1.08), shade(QS_BRICK, 0.55));
    }
    // rain streaks / soot
    for (let i = 0; i < 5; i++) {
      const x = 0.15 + i * (w / 5.2);
      d.seg([x, -0.009, h * 0.12], [x, -0.009, h * (0.5 + (i % 2) * 0.18)], shade(QS_BRICK, 0.78));
    }
    // stone plinth strip
    d.QS(-0.01, 0, 0, w, 0.28, STONE, shade(STONE, 0.5));
    d.QS(-0.012, 0.05, 0.08, w - 0.05, 0.2, shade(STONE, 1.08));
  }
  /** 清水砖：比 wall_brick 更密更细的灰砖贴面 */
  function paintQingshuiBrick(d, w, h) {
    d.QS(0, 0, 0, w, h, QS_BRICK, shade(QS_BRICK, 0.5));
    for (let z = 0.11, k = 0; z < h - 0.01; z += 0.11, k++) {
      d.QS(-0.004, 0.01, z - 0.012, w - 0.01, z, shade(QS_MORTAR, 0.95));
      const ox = (k % 2) * 0.16;
      for (let x = ox; x < w - 0.02; x += 0.32) {
        d.seg([x, -0.006, z - 0.11], [x, -0.006, z], shade(QS_BRICK, 0.64));
        // brick face fleck (volume, not line-only)
        d.QS(-0.007, x + 0.03, z - 0.08, x + 0.14, z - 0.03, shade(QS_BRICK, (k + Math.floor(x * 10)) % 2 ? 0.92 : 1.08));
      }
    }
    for (let i = 0; i < 6; i++) {
      const x = 0.1 + (i * 0.41) % (w - 0.2), z = 0.15 + ((i * 0.53) % (h - 0.3));
      d.QS(-0.008, x, z, x + 0.08, z + 0.05, shade(QS_BRICK, i % 2 ? 0.85 : 1.12));
    }
  }
  /** 墀头：硬山端头砖叠涩饰（立体体积） */
  function paintChitou(d, o = {}) {
    const w = o.w || 0.7, dpth = o.d || 0.55, h = o.h || 0.95;
    const cap = '#a8a49c', body = QS_BRICK;
    // stepped corbel stack (dense boxes)
    d.box(0, 0, 0, w, dpth, h * 0.35, body, { line: shade(body, 0.45), west: QS_BRICK_W, top: shade(body, 1.08), south: shade(body, 0.98) });
    d.box(-0.04, -0.04, h * 0.32, w + 0.04, dpth + 0.04, h * 0.55, shade(body, 1.02), { line: shade(body, 0.48), west: QS_BRICK_W, top: shade(body, 1.12) });
    d.box(-0.08, -0.08, h * 0.52, w + 0.08, dpth + 0.08, h * 0.72, shade(body, 1.05), { line: shade(body, 0.5), west: QS_BRICK_W, top: shade(body, 1.15) });
    // ornamental brick tooth band
    for (let x = 0.05; x < w - 0.05; x += 0.12) {
      d.box(x, -0.02, h * 0.58, x + 0.08, 0.08, h * 0.68, shade(body, 0.88), { line: shade(body, 0.5), west: QS_BRICK_W, top: shade(body, 1.1) });
    }
    // stone/tile cap
    d.box(-0.1, -0.1, h * 0.7, w + 0.1, dpth + 0.1, h + 0.05, cap, { line: '#5a5650', west: shade(cap, 0.82), top: shade(cap, 1.18), south: shade(cap, 1.05) });
    d.QS(-0.12, 0.05, h + 0.02, w - 0.05, h + 0.06, shade(cap, 1.22));
    // side brick grit
    for (let z = 0.08; z < h * 0.5; z += 0.11) {
      d.seg([0.03, -0.01, z], [w - 0.03, -0.01, z], shade(body, 0.7));
      d.seg([-0.01, 0.05, z], [-0.01, dpth - 0.05, z], shade(QS_BRICK_W, 0.7));
    }
  }
  /** 墙帽：墙顶压顶石/瓦垄帽 */
  function paintWallCap(d, w, dpth) {
    const cap = '#a29e95', tile = '#6e6a64';
    d.box(0, 0, 0, w, dpth, 0.18, cap, { line: shade(cap, 0.5), west: shade(cap, 0.82), top: shade(cap, 1.12), south: shade(cap, 0.96) });
    // tile ridge bumps along length
    for (let x = 0.08; x < w - 0.05; x += 0.22) {
      d.box(x, -0.02, 0.14, x + 0.16, dpth + 0.02, 0.28, tile, { line: shade(tile, 0.55), west: shade(tile, 0.75), top: shade(tile, 1.15), south: shade(tile, 0.95) });
    }
    d.QS(-0.01, 0.06, 0.2, w - 0.06, 0.26, shade(cap, 1.2));
    // end stops
    d.box(-0.04, -0.04, 0.05, 0.1, dpth + 0.04, 0.32, shade(tile, 0.9), { line: shade(tile, 0.5), west: shade(tile, 0.7), top: shade(tile, 1.1) });
    d.box(w - 0.1, -0.04, 0.05, w + 0.04, dpth + 0.04, 0.32, shade(tile, 0.9), { line: shade(tile, 0.5), west: shade(tile, 0.7), top: shade(tile, 1.1) });
  }

  /* ---- Site207：栏杆寻杖 / 雀替 / 挂落 / 小柱（宋风木作；禁纯线稿） ---- */
  /** 寻杖栏杆段：望柱座 + 密排小柱 + 寻杖圆木顶 + 中枋（体积块，非描线） */
  function paintRailXunzhang(d, w) {
    const wood = WOOD, dark = shade(wood, 0.42), lite = shade(wood, 1.28), mid = shade(wood, 0.88);
    const red = RED_W, gold = shade(GOLD, 0.75);
    /* deck sill / 地栿 */
    d.QS(0, 0, 0, w, 0.14, shade(wood, 0.78), dark);
    d.QS(-0.004, 0.02, 0.04, w - 0.02, 0.12, lite);
    /* mid rail 中枋 */
    d.QS(-0.01, 0.02, 0.42, w - 0.02, 0.55, mid, dark);
    d.QS(-0.012, 0.04, 0.46, w - 0.04, 0.52, shade(wood, 1.12));
    for (let x = 0.1; x < w; x += 0.28) d.seg([x, -0.014, 0.44], [x, -0.014, 0.54], shade(wood, 0.65));
    /* dense baluster posts 望柱/小柱 */
    for (let x = 0.08; x < w - 0.05; x += 0.18) {
      d.QS(-0.008, x, 0.12, x + 0.07, 0.95, shade(wood, 0.95), dark);
      d.QS(-0.01, x + 0.015, 0.18, x + 0.055, 0.9, lite);
      /* grain flecks */
      d.QS(-0.011, x + 0.02, 0.35, x + 0.05, 0.42, shade(wood, 1.15));
      d.QS(-0.011, x + 0.02, 0.68, x + 0.05, 0.74, shade(wood, 0.8));
    }
    /* 寻杖 top rail — round timber feel via stacked strips + gold trim beads */
    d.QS(-0.02, 0, 0.92, w, 1.12, wood, dark);
    d.QS(-0.024, 0.02, 0.98, w - 0.02, 1.1, lite);
    d.QS(-0.026, 0.04, 1.02, w - 0.04, 1.08, shade(wood, 1.35));
    for (let x = 0.12; x < w; x += 0.22) {
      d.QS(-0.03, x - 0.03, 1.0, x + 0.03, 1.08, gold);
      d.QS(-0.032, x - 0.012, 1.02, x + 0.012, 1.06, shade(GOLD, 1.15));
    }
    /* end 望柱 caps */
    for (const x of [0.04, w - 0.14]) {
      d.QS(-0.015, x, 0.1, x + 0.1, 1.15, red, shade(red, 0.45));
      d.QS(-0.018, x + 0.015, 1.1, x + 0.085, 1.22, shade(red, 1.15));
      d.QS(-0.02, x + 0.03, 1.18, x + 0.07, 1.26, gold);
    }
  }
  /** 雀替：柱梁交角如意卷草/云头立体饰（贴图体积，非线稿） */
  function paintOrnamentQueti(d) {
    const c = '#7a4a2c', g1 = CAI_G, g2 = CAI_B, L = shade(c, 0.48);
    /* seat against column */
    d.box(0, -0.08, 0.35, 0.22, 0.28, 0.72, c, { line: L, south: shade(c, 1.05), top: shade(c, 1.15), west: shade(c, 0.85) });
    /* curved brace body stepping out */
    d.box(0.05, -0.14, 0.15, 0.55, 0.22, 0.48, c, { line: L, south: g1, top: shade(c, 1.12) });
    d.box(0.18, -0.18, 0.02, 0.85, 0.16, 0.32, c, { line: L, south: g2, top: shade(c, 1.18) });
    /* cloud / ruyi head tip */
    d.box(0.7, -0.2, 0.0, 1.05, 0.12, 0.22, c, { line: L, south: shade(c, 1.2), top: shade(c, 1.25) });
    d.QS(-0.21, 0.78, 0.06, 1.0, 0.18, shade(GOLD, 0.8));
    d.QS(-0.22, 0.85, 0.1, 0.96, 0.16, shade(GOLD, 1.15));
    /* carved volute beads */
    for (let i = 0; i < 5; i++) {
      const x = 0.25 + i * 0.12, z = 0.2 + (i % 2) * 0.08;
      d.QS(-0.16, x, z, x + 0.08, z + 0.08, shade(g1, 1.1 + (i % 2) * 0.1));
      d.QS(-0.165, x + 0.02, z + 0.02, x + 0.06, z + 0.06, shade(GOLD, 0.7));
    }
    /* upper tenon into beam */
    d.box(0.02, -0.1, 0.65, 0.35, 0.26, 0.78, c, { line: L, south: g1, top: shade(c, 1.2) });
    d.QS(-0.11, 0.05, 0.7, 0.32, 0.76, GOLD);
    /* underside shadow volume */
    d.QS(-0.05, 0.15, 0.05, 0.7, 0.12, shade(c, 0.7));
  }
  /** 挂落：柱间挂落透空棂格 + 花心 + 边框（密实贴图） */
  function paintHangingGualuo(d, w, h) {
    const fr = RED_W, paper = '#3a2a20', dark = shade(fr, 0.42), lite = shade(fr, 1.2);
    /* outer frame */
    d.QS(0, 0, 0, w, h, fr, dark);
    d.QS(-0.004, 0.04, 0.04, w - 0.04, h - 0.04, shade(fr, 0.92), dark);
    /* dark openwork ground */
    d.QS(-0.008, 0.08, 0.08, w - 0.08, h - 0.08, paper, shade(fr, 0.55));
    /* dense lattice / 万字节奏 */
    const step = 0.14;
    for (let x = 0.12; x < w - 0.1; x += step) {
      d.QS(-0.01, x, 0.1, x + 0.035, h - 0.1, lite);
      d.QS(-0.011, x + 0.008, 0.14, x + 0.027, h - 0.14, shade(fr, 1.05));
    }
    for (let z = 0.14; z < h - 0.1; z += step) {
      d.QS(-0.01, 0.1, z, w - 0.1, z + 0.035, lite);
    }
    /* diamond / flower centers */
    for (let xi = 0; xi < 3; xi++) {
      for (let zi = 0; zi < 2; zi++) {
        const cx = w * (0.22 + xi * 0.28), cz = h * (0.28 + zi * 0.38);
        d.QS(-0.014, cx - 0.08, cz - 0.08, cx + 0.08, cz + 0.08, shade(CAI_G, 1.05), shade(fr, 0.5));
        d.QS(-0.016, cx - 0.04, cz - 0.04, cx + 0.04, cz + 0.04, shade(GOLD, 0.85));
        d.QS(-0.017, cx - 0.015, cz - 0.015, cx + 0.015, cz + 0.015, shade(GOLD, 1.2));
      }
    }
    /* bottom apron scallops */
    for (let x = 0.15; x < w - 0.1; x += 0.2) {
      const q = d.P(x, -0.02, -0.02);
      const px = Math.round(q[0]), py = Math.round(q[1]);
      d.g.fillStyle = dark;
      d.g.beginPath(); d.g.moveTo(px - 4, py); d.g.lineTo(px + 4, py); d.g.lineTo(px, py + 6); d.g.closePath(); d.g.fill();
      d.g.fillStyle = lite;
      d.g.beginPath(); d.g.moveTo(px - 2, py); d.g.lineTo(px + 2, py); d.g.lineTo(px, py + 4); d.g.closePath(); d.g.fill();
    }
    /* gold edge beads */
    for (let x = 0.1; x < w; x += 0.24) {
      d.QS(-0.018, x - 0.02, h - 0.06, x + 0.02, h - 0.02, shade(GOLD, 0.7));
      d.QS(-0.018, x - 0.02, 0.02, x + 0.02, 0.06, shade(GOLD, 0.7));
    }
  }
  /** 小柱/望柱：栏杆端柱 + 莲瓣柱头（立体） */
  function paintBalusterXiaozhu(d) {
    const wood = WOOD, dark = shade(wood, 0.45), lite = shade(wood, 1.25), red = RED;
    /* base stone plinth */
    d.box(-0.14, -0.14, 0, 0.14, 0.14, 0.18, STONE, { line: shade(STONE, 0.5), top: shade(STONE, 1.12), west: shade(STONE, 0.82) });
    /* shaft */
    d.box(-0.09, -0.09, 0.16, 0.09, 0.09, 1.05, red, { line: shade(red, 0.45), south: shade(red, 1.05), top: shade(red, 1.15), west: shade(red, 0.85) });
    for (let z = 0.25; z < 1.0; z += 0.18) {
      d.QS(-0.1, -0.06, z, 0.06, z + 0.04, shade(red, 1.18));
      d.QS(-0.1, -0.04, z + 0.06, 0.04, z + 0.09, shade(red, 0.8));
    }
    /* neck ring */
    d.box(-0.12, -0.12, 1.0, 0.12, 0.12, 1.12, wood, { line: dark, top: lite, south: shade(wood, 1.05) });
    d.QS(-0.13, -0.08, 1.04, 0.08, 1.1, shade(GOLD, 0.7));
    /* lotus / 莲瓣 cap */
    d.box(-0.16, -0.16, 1.1, 0.16, 0.16, 1.22, wood, { line: dark, top: shade(wood, 1.3), south: lite });
    for (let a = 0; a < 8; a++) {
      const ang = a * Math.PI / 4;
      const dx = Math.cos(ang) * 0.1, dy = Math.sin(ang) * 0.06;
      d.QS(-0.17, dx - 0.03, 1.14, dx + 0.03, 1.2, shade(GOLD, 0.85));
    }
    /* finial bead */
    d.box(-0.05, -0.05, 1.2, 0.05, 0.05, 1.38, shade(GOLD, 0.95), { line: shade(GOLD, 0.55), top: shade(GOLD, 1.25), south: shade(GOLD, 1.1) });
    d.QS(-0.06, -0.03, 1.32, 0.03, 1.36, shade(GOLD, 1.3));
  }

  /* ---- Site208：彩绘梁枋 / 额枋带 / 斗拱色块 / 檐板（望川楼·茶坊·店铺檐下；禁纯线稿；青绿朱红克制） ---- */
  const CAIHUA_RED = '#a8342a', CAIHUA_CREAM = '#e8d6a0', CAIHUA_WOOD = '#6a4428';
  /** 梁底/额枋彩绘单元：密实青绿面板 + 朱红点缀如意（体积块） */
  function paintBeamEfang(d, w) {
    const b = CAI_B, g = CAI_G, z0 = 0, z1 = 0.42;
    d.box(0, -0.06, z0, w, 0.22, z1, b, { line: shade(b, 0.45), west: shade(g, 0.82), top: shade(b, 0.85), south: shade(b, 0.98) });
    // dense panel courses
    for (let x = 0.04; x < w - 0.04; x += 0.55) {
      const x1 = Math.min(w - 0.04, x + 0.48);
      d.QS(-0.05, x, z0 + 0.05, x1, z1 - 0.05, g, shade(g, 0.55));
      d.QS(-0.052, x + 0.06, z0 + 0.1, x1 - 0.06, z1 - 0.1, shade(g, 1.08));
      // 如意中心小块 + 朱红点缀
      const m = (x + x1) / 2, zh = (z0 + z1) / 2;
      d.QS(-0.054, m - 0.1, zh - 0.07, m + 0.1, zh + 0.07, CAIHUA_CREAM, shade(GOLD, 0.55));
      d.QS(-0.056, m - 0.04, zh - 0.03, m + 0.04, zh + 0.03, CAIHUA_RED);
      d.QS(-0.057, m - 0.018, zh - 0.015, m + 0.018, zh + 0.015, shade(GOLD, 1.15));
    }
    // gold edge rails
    d.QS(-0.048, 0.02, z1 - 0.035, w - 0.02, z1, GOLD);
    d.QS(-0.048, 0.02, z0, w - 0.02, z0 + 0.035, shade(GOLD, 0.85));
    // wood soffit strip under beam
    d.box(0.02, -0.02, z0 - 0.06, w - 0.02, 0.18, z0, CAIHUA_WOOD, { line: shade(CAIHUA_WOOD, 0.5), top: shade(CAIHUA_WOOD, 1.1), south: shade(CAIHUA_WOOD, 0.95) });
  }
  /** 彩画水平色带：青绿叠层 + 朱红分隔（檐下密实色块） */
  function paintCaihuaBand(d, w) {
    const z0 = 0, z1 = 0.28;
    d.box(0, -0.05, z0, w, 0.18, z1, CAI_G, { line: shade(CAI_G, 0.48), west: shade(CAI_B, 0.85), top: shade(CAI_G, 1.1), south: shade(CAI_G, 0.98) });
    // three-band Song palette
    d.QS(-0.05, 0.02, z0 + 0.02, w - 0.02, z0 + 0.09, CAI_B, shade(CAI_B, 0.55));
    d.QS(-0.05, 0.02, z0 + 0.1, w - 0.02, z0 + 0.18, CAI_G, shade(CAI_G, 0.55));
    d.QS(-0.05, 0.02, z0 + 0.19, w - 0.02, z1 - 0.02, shade(CAI_B, 0.92), shade(CAI_B, 0.5));
    // vermillion divider ticks (dense, not neon)
    for (let x = 0.12; x < w - 0.08; x += 0.42) {
      d.QS(-0.052, x, z0 + 0.04, x + 0.08, z1 - 0.04, CAIHUA_RED);
      d.QS(-0.053, x + 0.02, z0 + 0.08, x + 0.06, z0 + 0.16, GOLD);
    }
    d.QS(-0.048, 0.01, z1 - 0.03, w - 0.01, z1, shade(GOLD, 0.9));
  }
  /** 斗拱色块：坐斗/栱身青绿面 + 朱红散斗（立体体积，非描线） */
  function paintDougongBlock(d, o = {}) {
    const s = (o && o.large) ? 1.25 : 1;
    const wood = CAIHUA_WOOD, g1 = CAI_G, g2 = CAI_B, L = shade(wood, 0.48);
    // 坐斗 body
    d.box(-0.2 * s, -0.08, 0, 0.2 * s, 0.3, 0.18 * s, wood, { line: L, south: g1, top: shade(wood, 1.12), west: shade(wood, 0.85) });
    d.QS(-0.09, -0.12 * s, 0.1 * s, 0.12 * s, 0.16 * s, GOLD);
    // 华栱
    d.box(-0.52 * s, -0.16, 0.16 * s, 0.52 * s, 0.26, 0.3 * s, wood, { line: L, south: g2, top: shade(wood, 1.08) });
    d.QS(-0.17, -0.45 * s, 0.18 * s, 0.45 * s, 0.22 * s, shade(g1, 1.12));
    // 散斗 trio with 朱红 face
    for (const k of [-1, 0, 1]) {
      d.box(k * 0.42 * s - 0.1 * s, -0.18 - (k === 0 ? 0.22 * s : 0), 0.28 * s, k * 0.42 * s + 0.1 * s, 0.2, 0.42 * s, wood, { line: L, south: g1, top: shade(wood, 1.1) });
      d.QS(-0.19 - (k === 0 ? 0.22 * s : 0), k * 0.42 * s - 0.07 * s, 0.34 * s, k * 0.42 * s + 0.07 * s, 0.4 * s, CAIHUA_RED);
      d.QS(-0.2 - (k === 0 ? 0.22 * s : 0), k * 0.42 * s - 0.035 * s, 0.36 * s, k * 0.42 * s + 0.035 * s, 0.385 * s, GOLD);
    }
    // upper 枋
    d.box(-0.72 * s, -0.22, 0.4 * s, 0.72 * s, 0.2, 0.52 * s, wood, { line: L, south: g2, top: shade(wood, 1.15) });
    d.QS(-0.23, -0.65 * s, 0.46 * s, 0.65 * s, 0.52 * s, GOLD);
    // side caihua panels
    d.QS(-0.24, -0.35 * s, 0.42 * s, -0.12 * s, 0.5 * s, g1);
    d.QS(-0.24, 0.12 * s, 0.42 * s, 0.35 * s, 0.5 * s, g1);
  }
  /** 檐板/挑檐枋：木色底 + 青绿边 + 朱红端头 */
  function paintEaveBoard(d, w) {
    const z0 = 0, z1 = 0.32;
    d.box(0, -0.08, z0, w, 0.2, z1, CAIHUA_WOOD, { line: shade(CAIHUA_WOOD, 0.5), west: shade(CAIHUA_WOOD, 0.8), top: shade(CAIHUA_WOOD, 1.12), south: shade(CAIHUA_WOOD, 0.96) });
    // grain flecks (volume)
    for (let x = 0.08; x < w - 0.08; x += 0.28) {
      d.QS(-0.09, x, z0 + 0.06, x + 0.18, z1 - 0.06, shade(CAIHUA_WOOD, (Math.floor(x * 10) % 2) ? 0.9 : 1.08));
    }
    // 青绿边条
    d.QS(-0.095, 0.04, z1 - 0.08, w - 0.04, z1 - 0.02, CAI_G, shade(CAI_G, 0.55));
    d.QS(-0.095, 0.04, z0 + 0.02, w - 0.04, z0 + 0.07, CAI_B, shade(CAI_B, 0.55));
    // 朱红端头块
    d.box(0.02, -0.1, z0 + 0.04, 0.22, 0.05, z1 - 0.04, CAIHUA_RED, { line: shade(CAIHUA_RED, 0.55), top: shade(CAIHUA_RED, 1.1), south: shade(CAIHUA_RED, 0.95) });
    d.box(w - 0.22, -0.1, z0 + 0.04, w - 0.02, 0.05, z1 - 0.04, CAIHUA_RED, { line: shade(CAIHUA_RED, 0.55), top: shade(CAIHUA_RED, 1.1), south: shade(CAIHUA_RED, 0.95) });
    d.QS(-0.1, 0.06, z1 - 0.04, w - 0.06, z1, shade(GOLD, 0.85));
  }



  /* ---- Site209：门钉 / 铺首衔环 / 门槛 / 抱鼓石（宋风大门；禁纯线稿） ---- */
  /** 门钉面板：朱漆板门 + 密排铜钉（体积块，非描线） */
  function paintDoorMending(d, w, h) {
    const fr = '#6a1e16', dark = shade(fr, 0.42), lite = shade(fr, 1.18), stud = GOLD, studD = shade(GOLD, 0.55);
    d.QS(0, 0, 0, w, h, fr, dark);
    /* vertical planks denser */
    for (let x = 0.04; x < w - 0.03; x += 0.13) {
      d.QS(-0.004, x, 0.03, x + 0.115, h - 0.03, shade(fr, 0.92 + ((x * 17) % 3) * 0.05), shade(fr, 0.55));
      d.QS(-0.006, x + 0.02, 0.06, x + 0.04, h - 0.06, lite);
    }
    /* horizontal battens */
    for (const z of [0.14, h * 0.33, h * 0.66, h - 0.16]) {
      d.QS(-0.01, 0.03, z - 0.045, w - 0.03, z + 0.045, shade(fr, 0.72), dark);
      d.QS(-0.012, 0.05, z - 0.02, w - 0.05, z + 0.02, shade(fr, 1.05));
    }
    /* dense 门钉 grid 7x9 */
    const cols = 7, rows = 9;
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const x = 0.12 + col * ((w - 0.24) / (cols - 1));
      const z = 0.22 + row * ((h - 0.44) / (rows - 1));
      d.QS(-0.014, x - 0.035, z - 0.035, x + 0.035, z + 0.035, studD);
      d.QS(-0.016, x - 0.022, z - 0.022, x + 0.022, z + 0.022, stud);
      d.QS(-0.018, x - 0.01, z - 0.01, x + 0.01, z + 0.01, shade(stud, 1.35));
    }
    /* edge rail beads */
    for (let z = 0.18; z < h - 0.1; z += 0.22) {
      d.QS(-0.02, 0.02, z, 0.08, z + 0.06, shade(stud, 0.85));
      d.QS(-0.02, w - 0.08, z, w - 0.02, z + 0.06, shade(stud, 0.85));
    }
  }
  /** 铺首衔环：兽面铺首 + 圆环（立体贴图） */
  function paintKnockerPushou(d) {
    const br = '#8a6a28', dark = shade(br, 0.4), gold = GOLD, red = '#5a1810';
    /* back plate */
    d.box(-0.28, -0.08, -0.05, 0.28, 0.12, 0.55, shade(br, 0.85), { line: dark, south: shade(br, 1.05), top: shade(br, 1.2), west: shade(br, 0.75) });
    d.QS(-0.09, -0.22, 0.02, 0.22, 0.5, shade(gold, 0.7));
    /* beast face forehead / brows */
    d.box(-0.22, -0.1, 0.32, 0.22, 0.1, 0.52, shade(br, 1.05), { line: dark, south: shade(gold, 0.9), top: shade(gold, 1.15) });
    d.QS(-0.11, -0.12, 0.4, 0.12, 0.48, shade(gold, 1.25));
    /* eyes */
    for (const sx of [-1, 1]) {
      d.QS(-0.12, sx * 0.12 - 0.06, 0.28, sx * 0.12 + 0.06, 0.38, shade(red, 0.9), dark);
      d.QS(-0.13, sx * 0.12 - 0.03, 0.3, sx * 0.12 + 0.03, 0.36, shade(gold, 1.2));
    }
    /* snout / nose boss */
    d.box(-0.1, -0.12, 0.12, 0.1, 0.1, 0.3, shade(br, 1.1), { line: dark, south: shade(gold, 0.95), top: shade(gold, 1.2) });
    d.QS(-0.13, -0.05, 0.18, 0.05, 0.26, shade(gold, 1.3));
    /* fangs */
    for (const sx of [-1, 1]) {
      d.box(sx * 0.12 - 0.03, -0.1, 0.02, sx * 0.12 + 0.03, 0.06, 0.14, shade(gold, 1.05), { line: dark, south: shade(gold, 1.2) });
    }
    /* ring 衔环 — stacked torus feel */
    d.box(-0.18, -0.14, -0.22, 0.18, 0.08, 0.08, shade(gold, 0.85), { line: dark, south: shade(gold, 1.05), top: shade(gold, 1.15) });
    d.QS(-0.15, -0.14, -0.18, 0.14, 0.02, shade(gold, 1.2));
    d.QS(-0.16, -0.1, -0.14, 0.1, -0.04, shade(gold, 0.7));
    /* ring lower arc beads */
    for (let i = 0; i < 7; i++) {
      const t = i / 6, x = -0.14 + t * 0.28, z = -0.2 + Math.sin(t * Math.PI) * 0.12;
      d.QS(-0.15, x - 0.025, z - 0.025, x + 0.025, z + 0.025, shade(gold, 0.95 + (i % 2) * 0.15));
    }
    /* side ear flanges */
    for (const sx of [-1, 1]) {
      d.box(sx * 0.22 - 0.05, -0.06, 0.15, sx * 0.22 + 0.05, 0.1, 0.42, shade(br, 0.95), { line: dark, south: shade(gold, 0.8), top: shade(gold, 1.1) });
    }
  }
  /** 门槛：石质门槛 + 木槛面 + 铜角包（密实） */
  function paintSillMenkan(d, w) {
    const stone = STONE, wood = WOOD, dark = shade(stone, 0.48), lite = shade(stone, 1.15), gold = shade(GOLD, 0.8);
    /* stone body */
    d.box(0, -0.18, 0, w, 0.22, 0.28, stone, { line: dark, south: shade(stone, 1.05), top: lite, west: shade(stone, 0.82) });
    d.QS(-0.01, 0.04, 0.04, w - 0.04, 0.22, shade(stone, 1.12));
    /* wood tread strip */
    d.QS(-0.02, 0.06, 0.18, w - 0.06, 0.26, shade(wood, 0.95), shade(wood, 0.5));
    d.QS(-0.022, 0.1, 0.2, w - 0.1, 0.24, shade(wood, 1.18));
    /* joint seams */
    for (let x = 0.2; x < w; x += 0.28) {
      d.seg([x, -0.19, 0.02], [x, -0.19, 0.26], shade(stone, 0.65));
      d.QS(-0.015, x - 0.02, 0.08, x + 0.02, 0.14, shade(stone, 0.85));
    }
    /* brass corner wraps */
    for (const x of [0.02, w - 0.18]) {
      d.QS(-0.025, x, 0.02, x + 0.16, 0.26, gold);
      d.QS(-0.027, x + 0.03, 0.06, x + 0.13, 0.22, shade(GOLD, 1.2));
      d.QS(-0.028, x + 0.06, 0.1, x + 0.1, 0.18, shade(GOLD, 1.35));
    }
    /* front lip shadow */
    d.QS(-0.005, 0, 0, w, 0.04, shade(stone, 0.7));
  }
  /** 抱鼓石：门枕石鼓面 + 须弥座 + 兽纹（立体） */
  function paintStoneBaogu(d) {
    const stone = STONE, dark = shade(stone, 0.45), lite = shade(stone, 1.18), gold = shade(GOLD, 0.75);
    /* 须弥座 base */
    d.box(-0.42, -0.32, 0, 0.42, 0.32, 0.28, stone, { line: dark, south: shade(stone, 1.02), top: lite, west: shade(stone, 0.8) });
    d.QS(-0.02, -0.35, 0.08, 0.35, 0.22, shade(stone, 1.12));
    /* waist ring */
    d.box(-0.36, -0.28, 0.24, 0.36, 0.28, 0.38, shade(stone, 0.92), { line: dark, south: shade(stone, 1.08), top: lite });
    d.QS(-0.03, -0.3, 0.28, 0.3, 0.34, gold);
    /* drum body */
    d.box(-0.38, -0.3, 0.36, 0.38, 0.3, 1.05, stone, { line: dark, south: shade(stone, 1.05), top: shade(stone, 1.2), west: shade(stone, 0.85) });
    /* concentric drum face rings */
    for (const r of [0.32, 0.22, 0.12]) {
      d.QS(-0.32, -r, 0.55 - r * 0.15, r, 0.85 + r * 0.1, shade(stone, 1.08 + (0.32 - r)));
    }
    d.QS(-0.33, -0.08, 0.62, 0.08, 0.78, shade(stone, 1.25));
    d.QS(-0.34, -0.035, 0.66, 0.035, 0.74, gold);
    /* side bosses / 兽纹 beads */
    for (let i = 0; i < 8; i++) {
      const ang = i * Math.PI / 4;
      const dx = Math.cos(ang) * 0.28, dz = 0.7 + Math.sin(ang) * 0.22;
      d.QS(-0.31, dx - 0.04, dz - 0.04, dx + 0.04, dz + 0.04, shade(stone, 1.15));
      if (i % 2 === 0) d.QS(-0.32, dx - 0.02, dz - 0.02, dx + 0.02, dz + 0.02, gold);
    }
    /* top lotus / 莲瓣 cap */
    d.box(-0.34, -0.26, 1.0, 0.34, 0.26, 1.18, stone, { line: dark, south: lite, top: shade(stone, 1.28) });
    for (let a = 0; a < 6; a++) {
      const x = -0.26 + a * 0.1;
      d.QS(-0.27, x, 1.05, x + 0.07, 1.14, shade(stone, 1.2));
    }
    d.QS(-0.28, -0.12, 1.1, 0.12, 1.16, gold);
    /* pillow stone stub behind */
    d.box(-0.2, 0.2, 0.2, 0.2, 0.45, 0.55, shade(stone, 0.9), { line: dark, south: shade(stone, 1.0), top: lite });
  }


  /* ---- Site210：旗幡 / 帷幔 / 流苏 / 檐下挂饰（御街·酒楼·茶坊·南广场；与幌子/灯笼互补；禁纯线稿；色调克制） ---- */
  const QIFAN_RED = '#a8342a', QIFAN_CREAM = '#e8d6a0', QIFAN_TEAL = '#3a6a58', QIFAN_INK = '#2a3a48', QIFAN_WOOD = '#6a4428';
  /** 旗幡：燕尾锦幡体积（非店招幌子文字布）；密实布面叠层 + 金边 */
  function paintBannerQifan(d, o = {}) {
    const L = 1.55, w = 0.48;
    const col = o.col || QIFAN_RED, alt = o.alt || QIFAN_CREAM;
    // pole tip / hanging ring (volume)
    d.box(-0.04, -0.05, -0.02, 0.04, 0.05, 0.08, QIFAN_WOOD, { line: shade(QIFAN_WOOD, 0.5), top: shade(QIFAN_WOOD, 1.12) });
    d.QS(-0.06, -0.06, 0.02, 0.06, 0.07, GOLD);
    // cloth body (dense face + west depth)
    d.box(-w / 2, -0.04, -L + 0.15, w / 2, 0.06, 0.02, col, { line: shade(col, 0.48), west: shade(col, 0.78), top: shade(col, 1.08), south: shade(col, 0.96) });
    // weave courses
    for (let i = 0; i < 7; i++) {
      const z0 = -0.08 - i * (L - 0.35) / 6;
      d.QS(-0.05, -w / 2 + 0.04, z0, w / 2 - 0.04, z0 - 0.06, i % 2 ? shade(col, 1.1) : shade(col, 0.88));
    }
    // cream diagonal panel + teal tip band
    d.QS(-0.052, -w / 2 + 0.08, -0.35, w / 2 - 0.08, -0.55, alt, shade(alt, 0.55));
    d.QS(-0.054, -w / 2 + 0.1, -0.4, w / 2 - 0.1, -0.5, shade(GOLD, 0.95));
    d.QS(-0.052, -w / 2 + 0.06, -L + 0.35, w / 2 - 0.06, -L + 0.5, QIFAN_TEAL, shade(QIFAN_TEAL, 0.5));
    // swallowtail fork (volume wedges)
    d.box(-w / 2, -0.03, -L, -0.04, 0.04, -L + 0.22, shade(col, 0.92), { line: shade(col, 0.45), south: shade(col, 0.9) });
    d.box(0.04, -0.03, -L, w / 2, 0.04, -L + 0.22, shade(col, 0.92), { line: shade(col, 0.45), south: shade(col, 0.9) });
    d.QS(-0.055, -w / 2 + 0.02, -L - 0.02, -0.06, -L + 0.12, shade(col, 0.75));
    d.QS(-0.055, 0.06, -L - 0.02, w / 2 - 0.02, -L + 0.12, shade(col, 0.75));
    // gold piping + tip beads
    d.QS(-0.048, -w / 2 + 0.02, -0.02, -w / 2 + 0.06, -L + 0.25, shade(GOLD, 0.85));
    d.QS(-0.048, w / 2 - 0.06, -0.02, w / 2 - 0.02, -L + 0.25, shade(GOLD, 0.85));
    for (const sx of [-0.18, 0.18]) {
      d.QS(-0.056, sx - 0.04, -L - 0.08, sx + 0.04, -L - 0.02, GOLD);
      d.QS(-0.058, sx - 0.02, -L - 0.06, sx + 0.02, -L - 0.03, shade(GOLD, 1.2));
    }
  }
  /** 帷幔：檐下软幔叠层（褶皱体积块，非描线） */
  function paintCurtainWeiman(d, w) {
    const z0 = 0, z1 = 0.95;
    const cloth = '#c8a878', deep = '#8a6848', cream = QIFAN_CREAM;
    d.box(0, -0.06, z0 - 0.05, w, 0.14, z0 + 0.08, QIFAN_WOOD, { line: shade(QIFAN_WOOD, 0.5), top: shade(QIFAN_WOOD, 1.1), south: shade(QIFAN_WOOD, 0.95) });
    d.QS(-0.07, 0.02, z0 - 0.02, w - 0.02, z0 + 0.06, shade(GOLD, 0.9));
    // hanging folds as vertical volumes
    const n = Math.max(4, Math.round(w / 0.42));
    for (let i = 0; i < n; i++) {
      const x0 = 0.04 + i * (w - 0.08) / n;
      const x1 = x0 + (w - 0.08) / n - 0.04;
      const mid = (x0 + x1) / 2;
      const col = i % 2 ? cloth : shade(cloth, 0.9);
      d.box(x0, -0.08, z0 + 0.05, x1, 0.1, z1 - 0.08, col, { line: shade(deep, 0.55), west: shade(col, 0.78), top: shade(col, 1.05), south: shade(col, 0.96) });
      // fold ridge highlight
      d.QS(-0.09, mid - 0.04, z0 + 0.1, mid + 0.04, z1 - 0.12, shade(cream, 0.95));
      d.QS(-0.092, mid - 0.02, z0 + 0.18, mid + 0.02, z1 - 0.2, shade(cloth, 1.15));
      // bottom scallop volume
      d.box(x0 + 0.02, -0.09, z1 - 0.14, x1 - 0.02, 0.06, z1, shade(deep, 1.05), { line: shade(deep, 0.5), south: shade(cloth, 0.85), top: shade(cream, 0.9) });
      d.QS(-0.095, mid - 0.06, z1 - 0.06, mid + 0.06, z1 + 0.02, QIFAN_RED);
      d.QS(-0.096, mid - 0.03, z1 - 0.04, mid + 0.03, z1, GOLD);
    }
    // teal header band
    d.QS(-0.085, 0.04, z0 + 0.08, w - 0.04, z0 + 0.18, QIFAN_TEAL, shade(QIFAN_TEAL, 0.5));
    d.QS(-0.086, 0.08, z0 + 0.1, w - 0.08, z0 + 0.15, shade(GOLD, 0.9));
  }
  /** 流苏：密排穗球/穗绳体积（檐下点缀，非幌子底穗） */
  function paintTasselLiusu(d) {
    const cord = QIFAN_WOOD, ball = QIFAN_RED, tip = QIFAN_CREAM;
    d.box(-0.12, -0.05, 0.85, 0.12, 0.05, 0.95, cord, { line: shade(cord, 0.5), top: shade(GOLD, 0.95) });
    d.QS(-0.06, -0.1, 0.88, 0.1, 0.94, GOLD);
    // three hanging strands
    for (const sx of [-0.14, 0, 0.14]) {
      d.box(sx - 0.025, -0.04, 0.08, sx + 0.025, 0.04, 0.88, shade(cord, 0.92), { line: shade(cord, 0.5), south: shade(cord, 0.85) });
      // bead stack
      for (let k = 0; k < 4; k++) {
        const z = 0.72 - k * 0.12;
        const c = k % 2 ? ball : tip;
        d.box(sx - 0.05, -0.05, z, sx + 0.05, 0.05, z + 0.08, c, { line: shade(c, 0.5), top: shade(c, 1.15), south: shade(c, 0.95) });
        d.QS(-0.055, sx - 0.025, z + 0.02, sx + 0.025, z + 0.06, shade(GOLD, 1.1));
      }
      // fringe brush volume at tip
      d.box(sx - 0.07, -0.04, -0.02, sx + 0.07, 0.04, 0.12, shade(ball, 0.9), { line: shade(ball, 0.48), south: shade(ball, 0.85), top: shade(tip, 0.95) });
      for (let f = -2; f <= 2; f++) {
        d.QS(-0.05, sx + f * 0.022 - 0.012, -0.12, sx + f * 0.022 + 0.012, -0.02, shade(tip, 0.9 + (f & 1) * 0.1));
      }
      d.QS(-0.052, sx - 0.03, -0.08, sx + 0.03, -0.04, GOLD);
    }
  }
  /** 檐下挂饰：木环+玉璧/铃铎体积（非灯笼） */
  function paintHangOrnament(d) {
    const wood = QIFAN_WOOD, jade = '#7a9a78', bronze = '#8a6a3a';
    // hanging cord + ring
    d.box(-0.02, -0.02, 0.95, 0.02, 0.02, 1.15, wood, { line: shade(wood, 0.5) });
    d.box(-0.1, -0.05, 0.88, 0.1, 0.05, 0.98, bronze, { line: shade(bronze, 0.5), top: shade(GOLD, 0.9), south: shade(bronze, 0.95) });
    d.QS(-0.06, -0.06, 0.9, 0.06, 0.96, shade(GOLD, 1.15));
    // jade bi disc (volume ring via stacked boxes)
    d.box(-0.16, -0.06, 0.55, 0.16, 0.06, 0.85, jade, { line: shade(jade, 0.5), west: shade(jade, 0.78), top: shade(jade, 1.12), south: shade(jade, 0.96) });
    d.QS(-0.07, -0.08, 0.62, 0.08, 0.78, shade(jade, 1.15));
    d.box(-0.05, -0.04, 0.64, 0.05, 0.04, 0.76, shade(jade, 0.75), { line: shade(jade, 0.45), top: shade('#c8d8c0', 0.95) });
    // lower bronze bell / pendant
    d.box(-0.1, -0.05, 0.28, 0.1, 0.05, 0.55, bronze, { line: shade(bronze, 0.5), south: shade(bronze, 0.92), top: shade(bronze, 1.1) });
    d.QS(-0.06, -0.07, 0.4, 0.07, 0.5, shade(GOLD, 0.95));
    d.box(-0.07, -0.04, 0.12, 0.07, 0.04, 0.3, shade(bronze, 0.85), { line: shade(bronze, 0.48), south: shade(QIFAN_RED, 0.9), top: shade(bronze, 1.05) });
    d.QS(-0.055, -0.04, 0.18, 0.04, 0.26, GOLD);
    // tip bead
    d.box(-0.04, -0.03, 0.02, 0.04, 0.03, 0.12, QIFAN_RED, { line: shade(QIFAN_RED, 0.5), top: shade(QIFAN_RED, 1.12) });
    d.QS(-0.05, -0.02, 0.05, 0.02, 0.1, shade(GOLD, 1.15));
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
    /* Site203 lattice densify */
    { key: 'lattice_geshan_S', geo: [0, -0.05, 0, 1.1, 0.1, 1.0], paint: (d) => paintLatticeGeshan(d, 1.1, 1.0), mw: 1.1, mh: 1.0, face: 'S' },
    { key: 'window_huachuang_S', geo: [0, -0.05, 0, 1.1, 0.1, 1.5], paint: (d) => paintHuachuang(d, 1.1, 1.5), mw: 1.1, mh: 1.5, face: 'S' },
    { key: 'door_geshan_bubujin_S', geo: [0, -0.05, 0, 0.7, 0.1, 2.5], paint: (d) => paintGeshanLeaf(d, 0.7, 2.5, { style: 'bubujin' }), mw: 0.7, mh: 2.5, face: 'S' },
    { key: 'sill_kanchuang_S', geo: [0, -0.05, 0, 1.2, 0.1, 1.6], paint: (d) => paintKanchuang(d, 1.2, 1.6), mw: 1.2, mh: 1.6, face: 'S' },
    { key: 'column_red', geo: [-0.2, -0.2, 0, 0.2, 0.2, 3.5], paint: (d) => paintColumn(d, 3.5, 0.15), mw: 0.4, mh: 3.5, face: 'C', origin: 'center' },
    { key: 'plaque_frame', geo: [-1.2, -0.1, -0.55, 1.2, 0.1, 0.55], paint: (d) => paintPlaqueFrame(d, 2.0, 0.7, { style: 'dark' }), mw: 2.0, mh: 0.7, face: 'S', origin: 'center' },
    { key: 'plaque_wood', geo: [-1.2, -0.1, -0.55, 1.2, 0.1, 0.55], paint: (d) => paintPlaqueFrame(d, 2.0, 0.7, { style: 'wood' }), mw: 2.0, mh: 0.7, face: 'S', origin: 'center' },
    { key: 'vsign_board', geo: [-0.35, -0.08, -1.1, 0.35, 0.08, 0.15], paint: (d) => paintVsignBoard(d, 0.5, 1.9), mw: 0.5, mh: 2.0, face: 'S', origin: 'top' },
    { key: 'banner_red', geo: [-0.3, -0.05, -1.7, 0.3, 0.05, 0.1], paint: (d) => paintBanner(d, 0.55, 1.5, '#c8322c'), mw: 0.55, mh: 1.7, face: 'S', origin: 'top' },
    { key: 'banner_green', geo: [-0.3, -0.05, -1.7, 0.3, 0.05, 0.1], paint: (d) => paintBanner(d, 0.55, 1.5, '#2f6a58'), mw: 0.55, mh: 1.7, face: 'S', origin: 'top' },
    { key: 'banner_blue', geo: [-0.3, -0.05, -1.7, 0.3, 0.05, 0.1], paint: (d) => paintBanner(d, 0.55, 1.5, '#2f4f86'), mw: 0.55, mh: 1.7, face: 'S', origin: 'top' },
    { key: 'banner_cream', geo: [-0.3, -0.05, -1.7, 0.3, 0.05, 0.1], paint: (d) => paintBanner(d, 0.55, 1.5, '#e8dcc0'), mw: 0.55, mh: 1.7, face: 'S', origin: 'top' },
    { key: 'lantern', geo: [-0.35, -0.35, -0.9, 0.35, 0.35, 0.1], paint: (d) => paintLantern(d, 0.22), mw: 0.7, mh: 1.0, face: 'C', origin: 'top' },
    { key: 'tile_eave_S', geo: [0, -0.08, -0.12, 1.0, 0.05, 0.38], paint: (d) => paintTileStripS(d, 1.0), mw: 1.0, mh: 0.38, face: 'S' },
    { key: 'tile_course_S', geo: [0, -0.05, 0, 1.0, 0.05, 0.22], paint: (d) => paintTileCourseS(d, 1.0), mw: 1.0, mh: 0.22, face: 'S' },
    { key: 'tile_ridge_S', geo: [0, -0.12, 0, 1.0, 0.12, 0.28], paint: (d) => paintTileRidgeS(d, 1.0), mw: 1.0, mh: 0.28, face: 'S' },
    { key: 'tile_wadang_S', geo: [0, -0.08, -0.05, 0.9, 0.05, 0.28], paint: (d) => paintWadangS(d, 0.9), mw: 0.9, mh: 0.28, face: 'S' },
    { key: 'tile_drip_S', geo: [0, -0.1, -0.12, 0.9, 0.05, 0.32], paint: (d) => paintDripS(d, 0.9), mw: 0.9, mh: 0.32, face: 'S' },
    { key: 'chiwen_S', geo: [0, -0.2, 0, 0.85, 0.15, 1.1], paint: (d) => paintChiwenS(d, 0.85), mw: 0.85, mh: 1.1, face: 'S' },
    { key: 'chiwen_flip_S', geo: [0, -0.2, 0, 0.85, 0.15, 1.1], paint: (d) => paintChiwenS(d, 0.85, { flip: true }), mw: 0.85, mh: 1.1, face: 'S' },
    /* Site205 roof-tiles densify */
    { key: 'tile_wadang', geo: [0, -0.08, -0.05, 0.95, 0.05, 0.3], paint: (d) => paintWadangDenseS(d, 0.95), mw: 0.95, mh: 0.3, face: 'S' },
    { key: 'tile_dishui', geo: [0, -0.1, -0.14, 0.95, 0.05, 0.34], paint: (d) => paintDishuiS(d, 0.95), mw: 0.95, mh: 0.34, face: 'S' },
    { key: 'tile_walong', geo: [0, -0.06, 0, 1.0, 0.05, 0.28], paint: (d) => paintWalongS(d, 1.0), mw: 1.0, mh: 0.28, face: 'S' },
    { key: 'eave_yankou', geo: [0, -0.1, -0.1, 1.05, 0.06, 0.32], paint: (d) => paintYankouS(d, 1.05), mw: 1.05, mh: 0.32, face: 'S' },
    /* Site207 rail/queti/gualuo/baluster */
    { key: 'rail_xunzhang', geo: [0, -0.08, 0, 1.4, 0.12, 1.3], paint: (d) => paintRailXunzhang(d, 1.4), mw: 1.4, mh: 1.3, face: 'S' },
    { key: 'ornament_queti', geo: [0, -0.22, 0, 1.1, 0.3, 0.82], paint: (d) => paintOrnamentQueti(d), mw: 1.1, mh: 0.82, face: 'S' },
    { key: 'hanging_gualuo', geo: [0, -0.08, 0, 1.6, 0.12, 0.85], paint: (d) => paintHangingGualuo(d, 1.6, 0.85), mw: 1.6, mh: 0.85, face: 'S' },
    { key: 'baluster_xiaozhu', geo: [-0.18, -0.18, 0, 0.18, 0.18, 1.42], paint: (d) => paintBalusterXiaozhu(d), mw: 0.36, mh: 1.42, face: 'C', origin: 'center' },
    /* Site209 door hardware */
    { key: 'door_mending', geo: [0, -0.08, 0, 1.0, 0.12, 2.2], paint: (d) => paintDoorMending(d, 1.0, 2.2), mw: 1.0, mh: 2.2, face: 'S' },
    { key: 'knocker_pushou', geo: [-0.32, -0.16, -0.25, 0.32, 0.14, 0.58], paint: (d) => paintKnockerPushou(d), mw: 0.64, mh: 0.83, face: 'S', origin: 'center' },
    { key: 'sill_menkan', geo: [0, -0.2, 0, 1.4, 0.24, 0.3], paint: (d) => paintSillMenkan(d, 1.4), mw: 1.4, mh: 0.3, face: 'S' },
    { key: 'stone_baogu', geo: [-0.45, -0.35, 0, 0.45, 0.48, 1.22], paint: (d) => paintStoneBaogu(d), mw: 0.9, mh: 1.22, face: 'C', origin: 'center' },
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
    /* Site202 paving */
    { key: 'pave_fangzhuan', geo: [0, 0, 0, 1.6, 1.6, 0.06], paint: (d) => paintPaveFangzhuan(d, 1.6, 1.6), mw: 1.6, mh: 1.6, face: 'C' },
    { key: 'pave_tiaoshi', geo: [0, 0, 0, 1.6, 1.6, 0.06], paint: (d) => paintPaveTiaoshi(d, 1.6, 1.6), mw: 1.6, mh: 1.6, face: 'C' },
    { key: 'pave_xiewen', geo: [0, 0, 0, 1.6, 1.6, 0.06], paint: (d) => paintPaveXiewen(d, 1.6, 1.6), mw: 1.6, mh: 1.6, face: 'C' },
    { key: 'drain_gutter', geo: [0, 0, -0.05, 0.7, 0.7, 0.18], paint: (d) => paintDrainGutter(d), mw: 0.7, mh: 0.7, face: 'C' },
    { key: 'curb_stone', geo: [0, 0, 0, 0.95, 0.32, 0.25], paint: (d) => paintCurbStone(d), mw: 0.95, mh: 0.32, face: 'C' },
    /* Site204 street props */
    { key: 'prop_shideng', geo: [-0.55, -0.55, 0, 0.55, 0.55, 2.2], paint: (d) => paintPropShideng(d), mw: 1.1, mh: 2.2, face: 'C', origin: 'center' },
    { key: 'prop_shiteng', geo: [-0.8, -0.4, 0, 0.8, 0.4, 0.6], paint: (d) => paintPropShiteng(d), mw: 1.6, mh: 0.6, face: 'C', origin: 'center' },
    { key: 'prop_huagang', geo: [-0.5, -0.5, 0, 0.5, 0.5, 1.4], paint: (d) => paintPropHuagang(d), mw: 1.0, mh: 1.4, face: 'C', origin: 'center' },
    { key: 'prop_lamp_pole', geo: [-0.35, -1.1, 0, 0.35, 0.35, 3.8], paint: (d) => paintPropLampPole(d), mw: 0.7, mh: 3.8, face: 'C', origin: 'center' },
    /* Site206 gable/brick/chitou/cap */
    { key: 'wall_shangqiang', geo: [0, -0.05, 0, 1.2, 0.1, 2.6], paint: (d) => paintShangqiang(d, 1.2, 2.6), mw: 1.2, mh: 2.6, face: 'S' },
    { key: 'brick_qingshui', geo: [0, -0.05, 0, 1.2, 0.1, 1.4], paint: (d) => paintQingshuiBrick(d, 1.2, 1.4), mw: 1.2, mh: 1.4, face: 'S' },
    { key: 'ornament_chitou', geo: [0, -0.05, 0, 0.7, 0.55, 1.0], paint: (d) => paintChitou(d, { w: 0.7, d: 0.55, h: 0.95 }), mw: 0.7, mh: 0.95, face: 'S' },
    { key: 'wall_cap', geo: [0, 0, 0, 1.2, 0.45, 0.32], paint: (d) => paintWallCap(d, 1.2, 0.45), mw: 1.2, mh: 0.45, face: 'C' },
    /* Site210 soft decor: qifan/weiman/liusu/hang */
    { key: 'banner_qifan', geo: [-0.3, -0.08, -1.7, 0.3, 0.08, 0.12], paint: (d) => paintBannerQifan(d), mw: 0.55, mh: 1.75, face: 'S', origin: 'top' },
    { key: 'curtain_weiman', geo: [0, -0.1, 0, 2.2, 0.2, 1.0], paint: (d) => paintCurtainWeiman(d, 2.2), mw: 2.2, mh: 1.0, face: 'S' },
    { key: 'tassel_liusu', geo: [-0.28, -0.12, -0.15, 0.28, 0.12, 1.0], paint: (d) => paintTasselLiusu(d), mw: 0.56, mh: 1.15, face: 'S', origin: 'top' },
    { key: 'hang_ornament', geo: [-0.22, -0.1, 0, 0.22, 0.1, 1.2], paint: (d) => paintHangOrnament(d), mw: 0.44, mh: 1.2, face: 'S', origin: 'top' },
    /* Site208 caihua beam/efang/dougong/eave */
    { key: 'beam_efang', geo: [0, -0.1, 0, 2.6, 0.25, 0.45], paint: (d) => paintBeamEfang(d, 2.6), mw: 2.6, mh: 0.45, face: 'S' },
    { key: 'caihua_band', geo: [0, -0.08, 0, 2.4, 0.2, 0.3], paint: (d) => paintCaihuaBand(d, 2.4), mw: 2.4, mh: 0.3, face: 'S' },
    { key: 'dougong_block', geo: [-0.8, -0.65, 0, 0.8, 0.32, 0.55], paint: (d) => paintDougongBlock(d), mw: 1.6, mh: 0.55, face: 'S', origin: 'center' },
    { key: 'eave_board', geo: [0, -0.1, 0, 2.2, 0.22, 0.35], paint: (d) => paintEaveBoard(d, 2.2), mw: 2.2, mh: 0.35, face: 'S' },
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

  /** Stamp tile eave modules along a polyline of world points (S-eave).
   * Site198 denser + 瓦当/滴水；Site205 再加密瓦当/滴水/檐口. */
  function stampEaveTiles(d, pts, o = {}) {
    ensure();
    if (!pts || pts.length < 2) return;
    const site205 = o.site205 !== false;
    const pitch = site205 ? ((o && o.dense) ? 0.48 : 0.58) : ((o && o.dense) ? 0.65 : 0.78);
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
        if (site205) {
          /* 檐口 fascia every step */
          stamp(d, 'eave_yankou', px, py + 0.01, pz + 0.02, { sx: Math.min(1.1, len / steps), sy: 0.95 });
          if (s % 2 === 0) stamp(d, 'tile_wadang', px, py - 0.025, pz - 0.05, { sx: 0.9, sy: 0.95 });
          else stamp(d, 'tile_dishui', px, py - 0.035, pz - 0.08, { sx: 0.9, sy: 1.0 });
          /* denser: also overlay Site198 modules every 3rd */
          if (s % 3 === 0) stamp(d, 'tile_wadang_S', px + 0.08, py - 0.015, pz - 0.03, { sx: 0.7, sy: 0.8 });
          if (s % 3 === 1) stamp(d, 'tile_drip_S', px + 0.06, py - 0.02, pz - 0.05, { sx: 0.7, sy: 0.85 });
        } else {
          if (s % 2 === 0) stamp(d, 'tile_wadang_S', px, py - 0.02, pz - 0.04, { sx: 0.85, sy: 0.9 });
          else stamp(d, 'tile_drip_S', px, py - 0.03, pz - 0.06, { sx: 0.85, sy: 0.95 });
        }
      }
      acc += len;
    }
  }
  /** Site205：沿屋面坡 stamp 瓦垄 modules. */
  function stampWalong(d, pts, o = {}) {
    ensure();
    if (!pts || pts.length < 2) return;
    const pitch = (o && o.dense) ? 0.55 : 0.7;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
      const len = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const steps = Math.max(1, Math.round(len / pitch));
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        stamp(d, 'tile_walong', a[0] + dx * t, a[1] + dy * t, a[2] + dz * t, {
          sx: (o.sx || (len / steps)), sy: o.sy || 0.9,
        });
      }
    }
  }
  /** Stamp 鸱吻 at ridge ends (atlas kitbash). */
  function stampChiwen(d, x, y, z, o = {}) {
    ensure();
    const key = o.flip ? 'chiwen_flip_S' : 'chiwen_S';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  /** Site207：沿栏杆 polyline stamp 寻杖 + 小柱；可选雀替/挂落。少改宏观布局. */
  function stampRailQueti(d, pts, o = {}) {
    ensure();
    if (!pts || pts.length < 2) return;
    const pitch = (o && o.dense) ? 0.7 : 0.95;
    const zOff = o.zOff || 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = (b[2] || 0) - (a[2] || 0);
      const len = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const steps = Math.max(1, Math.round(len / pitch));
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const px = a[0] + dx * t, py = a[1] + dy * t, pz = (a[2] || 0) + dz * t + zOff;
        stamp(d, 'rail_xunzhang', px, py, pz, { sx: Math.min(1.15, (len / steps) / 1.4 * (o.sx || 1.05)), sy: o.sy || 0.95 });
        if (s % 2 === 0) stamp(d, 'baluster_xiaozhu', px, py - 0.02, pz, { sx: 0.85, sy: 0.9 });
      }
      /* 雀替 at segment ends (column joints) */
      if (o.queti !== false) {
        stamp(d, 'ornament_queti', a[0], a[1] - 0.04, (a[2] || 0) + (o.quetiZ || 0.85), { sx: 0.75, sy: 0.8 });
        stamp(d, 'ornament_queti', b[0], b[1] - 0.04, (b[2] || 0) + (o.quetiZ || 0.85), { sx: 0.75, sy: 0.8 });
      }
    }
  }
  /** Site207：柱间挂落 stamp（水平带） */
  function stampGualuo(d, x0, y, z, x1, o = {}) {
    ensure();
    const span = Math.abs(x1 - x0);
    const n = Math.max(1, Math.round(span / 1.5));
    const tw = span / n;
    const xStart = Math.min(x0, x1);
    for (let i = 0; i < n; i++) {
      stamp(d, 'hanging_gualuo', xStart + i * tw, y, z, { sx: tw / 1.6, sy: o.sy || 0.95 });
    }
  }


  /** Site209：大门门钉/铺首/门槛/抱鼓 stamp（少改宏观布局） */
  function stampDoorHardware(d, x0, y, z0, x1, z1, o = {}) {
    ensure();
    const w = Math.abs(x1 - x0) || 1;
    const h = Math.max(0.8, Math.abs(z1 - z0) || 2);
    const xMid = (x0 + x1) / 2;
    const dense = o.dense !== false;
    /* 门钉面板 densify */
    if (o.mending !== false) {
      const n = dense ? Math.max(2, Math.round(w / 0.55)) : Math.max(1, Math.round(w / 0.85));
      const tw = w / n;
      const xStart = Math.min(x0, x1);
      for (let i = 0; i < n; i++) {
        stamp(d, 'door_mending', xStart + i * tw, y, z0, { sx: tw / 1.0, sy: h / 2.2 });
      }
    }
    /* 铺首衔环 center (or dual for wide) */
    if (o.pushou !== false) {
      const pz = z0 + h * (o.pushouT || 0.52);
      stamp(d, 'knocker_pushou', xMid, y - 0.04, pz, { sx: o.pushouSx || 0.95, sy: o.pushouSy || 0.95 });
      if (dense && w > 2.2) {
        stamp(d, 'knocker_pushou', x0 + w * 0.28, y - 0.04, pz, { sx: 0.75, sy: 0.8 });
        stamp(d, 'knocker_pushou', x0 + w * 0.72, y - 0.04, pz, { sx: 0.75, sy: 0.8 });
      }
    }
    /* 门槛 */
    if (o.menkan !== false) {
      stamp(d, 'sill_menkan', Math.min(x0, x1), y - 0.02, z0 - 0.02, { sx: w / 1.4, sy: o.menkanSy || 1.05 });
    }
    /* 抱鼓石 pair */
    if (o.baogu !== false) {
      const bz = o.baoguZ != null ? o.baoguZ : Math.max(0, z0 - 0.05);
      const inset = o.baoguInset != null ? o.baoguInset : 0.15;
      stamp(d, 'stone_baogu', Math.min(x0, x1) - inset, y - 0.08, bz, { sx: o.baoguSx || 0.85, sy: o.baoguSy || 0.9 });
      stamp(d, 'stone_baogu', Math.max(x0, x1) + inset, y - 0.08, bz, { sx: o.baoguSx || 0.85, sy: o.baoguSy || 0.9 });
    }
  }

  /** Site210：旗幡/帷幔/流苏/挂饰 stamp（檐下点缀；与幌子/灯笼错位） */
  function stampSoftDecor(d, x0, y, z, x1, o = {}) {
    ensure();
    const span = Math.abs(x1 - x0);
    const xStart = Math.min(x0, x1);
    if (o.weiman !== false) {
      const n = Math.max(1, Math.round(span / 2.0));
      const tw = span / n;
      for (let i = 0; i < n; i++) {
        stamp(d, 'curtain_weiman', xStart + i * tw, y, z, { sx: tw / 2.2, sy: o.weimanSy || 0.85 });
      }
    }
    if (o.tassel !== false) {
      const step = o.tasselStep || 1.15;
      for (let x = xStart + 0.35; x < xStart + span - 0.2; x += step) {
        stamp(d, 'tassel_liusu', x, y - 0.02, z + (o.tasselZ || 0.05), { sx: o.tsx || 0.75, sy: o.tsy || 0.8 });
      }
    }
    if (o.hang !== false) {
      const step = o.hangStep || 1.6;
      for (let x = xStart + 0.7; x < xStart + span - 0.3; x += step) {
        stamp(d, 'hang_ornament', x, y - 0.04, z + (o.hangZ || 0.15), { sx: o.hsx || 0.7, sy: o.hsy || 0.75 });
      }
    }
    if (o.qifan) {
      const qx = o.qifanX != null ? o.qifanX : xStart + span * 0.5;
      stamp(d, 'banner_qifan', qx, y - 0.08, z + (o.qifanZ || 0.55), { sx: o.qsx || 0.85, sy: o.qsy || 0.9 });
    }
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
    ensure, stamp, fillS, fillW, stampEaveTiles, stampChiwen, stampWalong, stampRailQueti, stampGualuo, stampDoorHardware, stampSoftDecor, getAtlas, getFrames, getModules, MODULES,
    site201: { signboards: true, plaqueWood: true, vsignBoard: true, bannerCream: true, kitbash: true },
    site202: { paving: true, fangzhuan: true, tiaoshi: true, xiewen: true, drain: true, curb: true, kitbash: true },
    site203: { lattice: true, latticeGeshan: true, huachuang: true, geshanBubujin: true, kanchuang: true, kitbash: true },
    site204: { streetProps: true, shideng: true, shiteng: true, huagang: true, lampPole: true, kitbash: true },
    site205: { roofTiles: true, wadang: true, dishui: true, walong: true, yankou: true, kitbash: true },
    site206: { gableBrick: true, shangqiang: true, qingshui: true, chitou: true, wallCap: true, kitbash: true },
    site207: { railQueti: true, xunzhang: true, queti: true, gualuo: true, xiaozhu: true, kitbash: true },
    site208: { caihua: true, beamEfang: true, caihuaBand: true, dougongBlock: true, eaveBoard: true, kitbash: true },
    site209: { doorHardware: true, mending: true, pushou: true, menkan: true, baogu: true, kitbash: true },
    site210: { banners: true, qifan: true, weiman: true, liusu: true, hangOrnament: true, kitbash: true },
    get _makeCanvas() { return _makeCanvas; },
    set _makeCanvas(v) { _makeCanvas = v; },
  };
  root.AncientAtlas = AncientAtlas;
})(typeof window !== 'undefined' ? window : globalThis);
