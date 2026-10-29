/* 影视城古镇 art — architectural parts assembled from AncientAtlas modules (瓦/柱/匾/窗/招幌/隔扇/斗拱/脊瓦),
 * 井槐里-style kitbash: stamp pre-baked textured modules rather than live polyline描线.
 * Site197：招幌流苏 + facade-detail（万字窗/雕刻隔扇/板门/大斗拱/脊瓦/门槛）。
 * Site198：城墙垛口/女墙/城砖 atlas helpers（merlonsS/parapetS/cityBrick*）+ 屋脊/瓦当/鸱吻/滴水 atlas 加密拼装。
 * Site200：灯笼/幌子黄昏夜景光晕与暖色叠层（lanternGlow/bannerGlow）。
 * Site201：汴河码头/船灯渔火复用 lanternGlow（water）；店招/牌匾/幌子边框细化（plaque_wood/vsign_board/banner_cream）。
 * Site203：格扇/花窗/隔扇/槛窗 atlas 细化（lattice_geshan/window_huachuang/door_geshan_bubujin/sill_kanchuang）。
 * Site214：落地罩/隔断屏/月洞门框（screen_luodizhao/partition_geshan/moon_yuedong/frame_menkuang）。
 * Site204：街具点景（prop_shideng/shiteng/huagang/lamp_pole）。
 * Site205：瓦当/滴水/瓦垄/檐口 atlas 细化（tile_wadang/tile_dishui/tile_walong/eave_yankou）。
 * Site206：山墙/清水砖/墀头/墙帽 atlas helpers（shangqiang/qingshui/chitou/wallCap）。
 * Site207：栏杆寻杖/雀替/挂落/小柱 atlas 细化（rail_xunzhang/ornament_queti/hanging_gualuo/baluster_xiaozhu）。
 * Site208：彩绘梁枋/额枋/斗拱色块 atlas helpers（beamEfang/caihuaBand/dougongBlock/eaveBoard）。
 * Site225：宫灯/纱灯/立灯 atlas 点景（lantern_gong/lantern_sha/lantern_stand）。
 * Site226：竹篱/花篱/柴扉 atlas 点景（fence_zhuli/fence_huali/gate_chaifei）。
 * Site228：石桌/石凳/棋枰 atlas 点景（seat_shizhuo/seat_shideng/seat_qiping）。
 * Site230：香炉/烛台/小供案 atlas 点景（prop_xianglu/prop_zhutai/prop_gongan_s）。
 * Site224：石狮/小蹲兽门兽 atlas 点景（stone_shishi/stone_shishi_s）。
 * Site209：门钉/铺首衔环/门槛/抱鼓石 atlas 细化（door_mending/knocker_pushou/sill_menkan/stone_baogu）。
 * Site210：旗幡/帷幔/流苏/挂饰 atlas helpers（bannerQifan/curtainWeiman/tasselLiusu/hangOrnament/softDecorStamp）。
 * Site211：台基/阶条石/垂带/踏垛 atlas 细化（base_taiji/step_tiaotiao/ramp_chuidai/stair_taduo）。
 * Site213：屋脊鸱吻/垂脊走兽/正脊饰/垂脊 atlas 细化（ridge_chiwen/beast_zoushou/ridge_ornament/hip_chuiji）。
 * Site215：拴马桩/上马石/石敢当/路牙石标 atlas 细化（post_shuanma/stone_shangma/stone_ganddang/curb_marker）。
 * Site217：井亭/路亭/小牌坊/亭顶 atlas 细化（pavilion_jingting/pavilion_luting/gate_paifang_s/roof_ting）。
 * Site219：太湖石/叠石假山/小峰石/石附苔 atlas 细化（rock_taihu/rock_dieshi/rock_peak_s/plant_rock_moss）。未经Leo确认. */
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
    if (style === 'huachuang' || style === 'flower') return 'window_huachuang_S';
    if (style === 'kanchuang' || style === 'sill') return 'sill_kanchuang_S';
    if (style === 'lattice_geshan' || style === 'geshan_panel') return 'lattice_geshan_S';
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
    // 瓦 courses — stamp tile_course / Site205 tile_walong along slope (atlas kitbash, not描线)
    // Site198：店铺/公建更密；Site205：瓦垄再加密（dense 默认开；可 o.dense===false 关闭）
    {
      const dense = o.dense !== false;
      const site205 = o.site205 !== false;
      const rows = site205 ? (dense ? 16 : 12) : (dense ? 12 : 9);
      const stepX = site205 ? (dense ? 0.55 : 0.7) : (dense ? 0.78 : 1.0);
      for (let k = 1; k < rows; k++) {
        const f = k / rows;
        for (let x = x0 + 0.05; x < x1 - 0.05; x += stepX) {
          let lim = hin === 0 ? 1 : x < x0 + hin ? (x - x0) / D : x > x1 - hin ? (x1 - x) / D : 1;
          if (f > lim) continue;
          const e = eaveS[Math.min(N, Math.round((x - x0) / (x1 - x0) * N))];
          const px = e[0], py = e[1] + (ym - e[1]) * f, pz = e[2] + (Ht - e[2]) * f;
          if (site205 && (k % 2 === 0)) {
            AT.stamp(d, 'tile_walong', px, py, pz, { sx: stepX, sy: 0.9 });
          } else {
            AT.stamp(d, 'tile_course_S', px, py, pz, { sx: stepX, sy: 0.85 });
          }
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
    // 瓦当 / 滴水 / 檐口 — stamp eave tile modules along S eave（Site198 denser；Site205 瓦当滴水瓦垄檐口再密）
    AT.stampEaveTiles(d, eaveS, { dense: o.dense !== false, site205: o.site205 !== false });
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
      /* Site213：鸱吻 densify + 正脊饰 + 垂脊走兽/垂脊（少改宏观；与瓦当衔接） */
      if (AT.stampRidgeBeasts && o.site213 !== false) {
        const hips = [];
        if (hin > 0) {
          /* hip rays: ridge end → eave corner (reuse outer zg) */
          hips.push([[rx0, ym, Ht], eaveS[0]]);
          hips.push([[rx1, ym, Ht], eaveS[N]]);
          if (type === 'xieshan') {
            hips.push([[rx0, ym, Ht], [x0 + hin, y0 + hin, zg]]);
            hips.push([[rx1, ym, Ht], [x1 - hin, y0 + hin, zg]]);
          }
        }
        AT.stampRidgeBeasts(d, {
          ym, Ht, rh, rx0, rx1,
          dense: o.dense !== false,
          chiwen: o.chiwen !== false,
          beasts: o.beasts || (hin > 0 ? 3 : 0),
          hips,
          ornament: rh > 0.12,
          chuiji: hin > 0,
          zoushou: (o.beasts || 0) > 0 || hin > 0,
        });
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
    /* Site211：台基/阶条石/垂带踏垛 atlas densify（不改 footprint；不碰铺地） */
    if (AT && AT.stampPlatform && o.site211 !== false) {
      AT.stampPlatform(d, x0, y0, x1, y1, z1, Object.assign({ dense: true }, o));
    }
  }
  /** Lattice window — stamp atlas win_* / Site203 huachuang·kanchuang·lattice_geshan (not live grid lines). */
  function lattice(d, y, x0, z0, x1, z1, o = {}) {
    let key = winKey(o.style || 'grid');
    if (o.huachuang) key = 'window_huachuang_S';
    if (o.kanchuang) key = 'sill_kanchuang_S';
    if (o.latticeGeshan) key = 'lattice_geshan_S';
    const fw = AT.getFrames()[key] || AT.getFrames()[winKey('grid')];
    if (!fw) return;
    // scale one module to fill the bay (or tile if wider than ~1.2 m)
    const bw = x1 - x0, bh = z1 - z0;
    if (bw <= 1.35) {
      AT.stamp(d, key, x0, y, z0, { sx: bw / fw.mw, sy: bh / fw.mh });
    } else {
      AT.fillS(d, key, y, x0, z0, x1, z1);
    }
    /* Site203：槛石 thrreshold strip under sill windows */
    if ((o.sill || o.kanchuang || o.style === 'kanchuang') && AT.getFrames().threshold_S && o.threshold !== false) {
      const tf = AT.getFrames().threshold_S;
      AT.stamp(d, 'threshold_S', x0, y - 0.01, z0 - 0.02, { sx: bw / tf.mw, sy: 0.85 });
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
  /** 隔扇 — stamp door_geshan_S / carved / bubujin / 板门 leaves（Site203 + bubujin）。 */
  function geshan(d, y, x0, z0, x1, z1, n, o = {}) {
    const h = H(d), fr = o.frame || WOOD, w = (x1 - x0) / n;
    let key = 'door_geshan_S';
    if (o.ban) key = 'door_ban_S';
    else if (o.bubujin || o.style === 'bubujin') key = 'door_geshan_bubujin_S';
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
    /* Site208：优先 dougong_block 密实彩绘斗拱色块 */
    let key = 'dougong';
    if (AT.getFrames()['dougong_block'] && !o.legacy) key = 'dougong_block';
    else if (o.large || s > 1.15) key = AT.getFrames()['dougong_large'] ? 'dougong_large' : 'dougong';
    for (const x of xs) AT.stamp(d, key, x, y, z, { sx: s, sy: s });
  }
  /** 额枋彩画 — Site208 优先 beam_efang + caihua_band；否则 efang_unit. */
  function efang(d, y, x0, x1, z0, z1, o = {}) {
    const h = H(d);
    if (o.plain) {
      const b = o.base || CAI_B;
      d.box(x0, y - 0.04, z0, x1, y + 0.2, z1, b, { line: shade(b, 0.45), west: shade(o.alt || CAI_G, 0.8), top: shade(b, 0.8) });
      return;
    }
    const frames = AT.getFrames();
    const key = o.band ? 'caihua_band' : (frames.beam_efang ? 'beam_efang' : 'efang_unit');
    const fw = frames[key] || frames.efang_unit;
    const L = x1 - x0, n = Math.max(1, Math.round(L / (fw ? fw.mw : 2.8)));
    const tw = L / n, th = z1 - z0;
    for (let i = 0; i < n; i++) {
      AT.stamp(d, key, x0 + i * tw, y, z0, { sx: tw / (fw ? fw.mw : 2.8), sy: th / (fw ? fw.mh : 0.4) });
    }
    /* Site208：额枋下再叠一道彩画色带 */
    if (!o.band && frames.caihua_band && th > 0.18) {
      const bf = frames.caihua_band;
      const bz = z0 - bf.mh * 0.55;
      const bn = Math.max(1, Math.round(L / bf.mw));
      const btw = L / bn;
      for (let i = 0; i < bn; i++) {
        AT.stamp(d, 'caihua_band', x0 + i * btw, y - 0.01, bz, { sx: btw / bf.mw, sy: 0.7 });
      }
    }
  }
  /** 匾额 — stamp plaque_frame/plaque_wood then overlay text（Site201 边框细化）。 */
  function plaque(d, y, xc, z, text, o = {}) {
    const h = H(d), size = o.size || 15;
    const w = o.w || Math.max(1.2, text.length * size / 32 * 1.15 + 0.4);
    const ht = o.h || size / 39.19 * 1.5;
    const style = o.style || (o.wood ? 'wood' : 'dark');
    const key = style === 'wood' ? 'plaque_wood' : 'plaque_frame';
    const fw = AT.getFrames()[key] || AT.getFrames().plaque_frame;
    const stampKey = (AT.getFrames()[key] ? key : 'plaque_frame');
    if (fw) AT.stamp(d, stampKey, xc, y, z, { sx: w / fw.mw, sy: ht / fw.mh });
    else {
      h.QS(y - 0.03, xc - w / 2, z - ht / 2, xc + w / 2, z + ht / 2, o.bg || (style === 'wood' ? '#5a3a22' : '#1a2840'), shade(GOLD, 0.5));
    }
    const bg = o.bg || (style === 'wood' ? '#5a3a22' : '#1a2840');
    /* Site201：字描边加粗，金字更可读 */
    h.stext(text, xc, y - 0.04, z, size, o.col || '#f5d878', {
      font: o.font || FONT_SERIF, stroke: shade(bg, 0.28), sw: o.sw || 2.6,
    });
  }
  /** 竖招 — stamp vsign_board atlas then overlay vertical text（Site201）。 */
  function vsign(d, y, xc, ztop, text, o = {}) {
    const h = H(d), size = o.size || 12, w = o.w || 0.5;
    const ht = text.length * size / 39.19 * 1.08 + 0.35;
    const fw = AT.getFrames().vsign_board;
    if (fw && o.atlas !== false) {
      AT.stamp(d, 'vsign_board', xc, y, ztop, { sx: w / fw.mw, sy: ht / fw.mh });
    } else {
      h.QS(y - 0.02, xc - w / 2, ztop - ht, xc + w / 2, ztop, o.bg || '#2a1e16', shade(o.bg || '#2a1e16', 0.4));
      h.QS(y - 0.025, xc - w / 2 + 0.05, ztop - ht + 0.05, xc + w / 2 - 0.05, ztop - 0.05, null, o.frame || GOLD);
    }
    h.vtext(text, xc, y - 0.04, ztop - 0.18 - size / 39.19 * 0.5, size, o.col || '#f0cf6a', {
      stroke: shade(o.bg || '#2a1e16', 0.3), sw: 2.2,
    });
  }
  /** 招幌 — stamp banner_* module then overlay text (+ Site197 fringe；Site201 cream atlas)。 */
  function banner(d, x, y, ztop, text, o = {}) {
    const h = H(d), col = o.col || '#c8322c', w = o.w || 0.55, L = o.len || 1.5, size = o.size || 13;
    if (o.pole !== false) h.line([x, y + 0.6, ztop + 0.08], [x, y - 0.25, ztop + 0.08], WOOD_D, 2);
    let key = 'banner_red';
    if (/#2f6a58|#3f7a6a|#2a6/i.test(col)) key = 'banner_green';
    else if (/#2f4f86|#2f5a86|#245a98/i.test(col)) key = 'banner_blue';
    else if (/#e8dcc0|#f0efd8|#d8c8a0|#c8b080/i.test(col)) key = 'banner_cream';
    const fw = AT.getFrames()[key];
    if (fw) AT.stamp(d, key, x, y - 0.1, ztop, { sx: w / fw.mw, sy: (L + 0.2) / fw.mh });
    else {
      d.face([[x - w / 2, y - 0.1, ztop], [x + w / 2, y - 0.1, ztop], [x + w / 2 + 0.03, y - 0.1, ztop - L], [x + w * 0.12, y - 0.1, ztop - L - 0.2], [x - w / 2 - 0.02, y - 0.1, ztop - L]], col, shade(col, 0.5));
    }
    const tc = o.tc || (/#e8dcc0|#f0efd8|#d8c8a0|#c8b080/i.test(col) ? '#a01e18' : '#f6efd8');
    h.vtext(text, x, y - 0.12, ztop - 0.22 - size / 39.19 * 0.55, size, tc, {
      stroke: shade(col, 0.35), sw: 2.2,
    });
    /* fringe tassels（街巷招幌更华丽；atlas 已带底穗，此处再叠一层金穗） */
    if (o.fringe !== false) {
      const zf = ztop - L - 0.05;
      for (let i = -2; i <= 2; i++) {
        const fx = x + i * (w * 0.16);
        h.line([fx, y - 0.12, zf], [fx, y - 0.12, zf - 0.2 - (i & 1) * 0.06], o.border || GOLD, 1);
        h.px(fx, y - 0.13, zf - 0.22 - (i & 1) * 0.06, shade(col, 1.1), 1, 1);
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


  /* ---- Site206：山墙/清水砖/墀头/墙帽 atlas kitbash ---- */
  function shangqiangS(d, y, x0, z0, x1, z1) {
    const AT = root.AncientAtlas; if (!AT) return;
    AT.fillS(d, 'wall_shangqiang', y, x0, z0, x1, z1);
  }
  function qingshuiS(d, y, x0, z0, x1, z1) {
    const AT = root.AncientAtlas; if (!AT) return;
    AT.fillS(d, 'brick_qingshui', y, x0, z0, x1, z1);
  }
  function qingshuiW(d, x, y0, z0, y1, z1) {
    const AT = root.AncientAtlas; if (!AT) return;
    // reuse S module on W via fillW scale (kitbash; no dedicated W qingshui yet)
    AT.fillW(d, 'brick_qingshui', x, y0, z0, y1, z1);
  }
  /** Stamp 墀头 ornament near wall top corner. */
  function chitou(d, x, y, z, o = {}) {
    const AT = root.AncientAtlas; if (!AT) return;
    AT.ensure();
    const f = AT.getFrames()['ornament_chitou'];
    if (f) AT.stamp(d, 'ornament_chitou', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    else d.box(x, y, z, x + 0.7, y + 0.55, z + 0.95, '#9a9690');
  }
  /** Stamp 墙帽 along top of a wall run (tile along Y at fixed top Z). */
  function wallCap(d, x, y0, y1, z, o = {}) {
    const AT = root.AncientAtlas; if (!AT) {
      d.box(x, y0, z, x + 0.45, y1, z + 0.28, '#a29e95'); return;
    }
    AT.ensure();
    const f = AT.getFrames()['wall_cap'];
    if (!f) { d.box(x, y0, z, x + 0.45, y1, z + 0.28, '#a29e95'); return; }
    const run = Math.abs(y1 - y0);
    const n = Math.max(1, Math.round(run / f.mw));
    const tw = run / n;
    const yStart = Math.min(y0, y1);
    for (let i = 0; i < n; i++) {
      AT.stamp(d, 'wall_cap', x, yStart + i * tw, z, { sx: tw / f.mw, sy: o.sy || 1 });
    }
  }


  /* Site208：彩绘梁枋 / 色带 / 斗拱块 / 檐板 helpers */
  function beamEfang(d, y, x0, x1, z, o = {}) {
    const frames = AT.getFrames();
    if (!frames.beam_efang) { efang(d, y, x0, x1, z, z + (o.h || 0.4), o); return; }
    const fw = frames.beam_efang;
    const L = x1 - x0, n = Math.max(1, Math.round(L / fw.mw));
    const tw = L / n, th = o.h || fw.mh;
    for (let i = 0; i < n; i++) AT.stamp(d, 'beam_efang', x0 + i * tw, y, z, { sx: tw / fw.mw, sy: th / fw.mh });
  }
  function caihuaBand(d, y, x0, x1, z, o = {}) {
    const fw = AT.getFrames().caihua_band; if (!fw) return;
    const L = x1 - x0, n = Math.max(1, Math.round(L / fw.mw));
    const tw = L / n, th = o.h || fw.mh;
    for (let i = 0; i < n; i++) AT.stamp(d, 'caihua_band', x0 + i * tw, y, z, { sx: tw / fw.mw, sy: th / fw.mh });
  }
  function dougongBlock(d, y, xs, z, o = {}) {
    dougong(d, y, xs, z, Object.assign({}, o, { legacy: false }));
  }
  function eaveBoard(d, y, x0, x1, z, o = {}) {
    const fw = AT.getFrames().eave_board; if (!fw) return;
    const L = x1 - x0, n = Math.max(1, Math.round(L / fw.mw));
    const tw = L / n, th = o.h || fw.mh;
    for (let i = 0; i < n; i++) AT.stamp(d, 'eave_board', x0 + i * tw, y, z, { sx: tw / fw.mw, sy: th / fw.mh });
  }

    /** lean-to eave strip on the W side (slope rising toward +x) */
  function leanW(d, x0, x1, y0, y1, z0, z1, o = {}) {
    const h = H(d), col = shade(o.col || TILE, 0.8);
    h.poly([[x0, y0, z0], [x0, y1, z0], [x1, y1, z1], [x1, y0 + (x1 - x0), z1]], col, shade(col, 0.55));
    for (let y = y0 + 0.3; y < y1; y += 0.3) { const ys = Math.max(y, y0 + (x1 - x0)); h.line([x0, y, z0], [x1, ys, z1], shade(col, 0.75)); h.line([x0, y + 0.08, z0], [x1, ys + 0.08, z1], shade(col, 1.12)); }
    h.line([x0, y0, z0], [x1, y0 + (x1 - x0), z1], o.ridge || RIDGE, 3);
    h.pline([[x0, y0, z0], [x0, y1, z0]], shade(col, 0.5), 2);
  }


  /* Site210：旗幡 / 帷幔 / 流苏 / 挂饰 helpers（与幌子 banner 区分） */
  function bannerQifan(d, x, y, z, o = {}) {
    if (AT && AT.stamp) AT.stamp(d, 'banner_qifan', x, y, z, { sx: o.sx || 0.9, sy: o.sy || 0.95 });
  }
  function curtainWeiman(d, y, x0, x1, z, o = {}) {
    const fw = AT.getFrames().curtain_weiman; if (!fw) return;
    const L = x1 - x0, n = Math.max(1, Math.round(L / fw.mw));
    const tw = L / n, th = o.h || fw.mh * (o.sy || 0.85);
    for (let i = 0; i < n; i++) AT.stamp(d, 'curtain_weiman', x0 + i * tw, y, z, { sx: tw / fw.mw, sy: th / fw.mh });
  }
  function tasselLiusu(d, x, y, z, o = {}) {
    if (AT && AT.stamp) AT.stamp(d, 'tassel_liusu', x, y, z, { sx: o.sx || 0.8, sy: o.sy || 0.85 });
  }
  function hangOrnament(d, x, y, z, o = {}) {
    if (AT && AT.stamp) AT.stamp(d, 'hang_ornament', x, y, z, { sx: o.sx || 0.75, sy: o.sy || 0.8 });
  }
  function softDecorStamp(d, x0, y, z, x1, o = {}) {
    if (AT && AT.stampSoftDecor) AT.stampSoftDecor(d, x0, y, z, x1, o);
  }



  /* Site214：落地罩 / 隔扇屏 / 月洞 / 门框 helpers */
  function screenLuodizhao(d, x, y, z, o = {}) {
    if (AT && AT.stampScreens) AT.stampScreens(d, x, y, z, Object.assign({ kind: 'luodizhao' }, o));
    else if (AT && AT.stamp) AT.stamp(d, 'screen_luodizhao', x - 1.3, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }
  function partitionGeshan(d, x, y, z, o = {}) {
    if (AT && AT.stampScreens) AT.stampScreens(d, x, y, z, Object.assign({ kind: 'geshan' }, o));
    else if (AT && AT.stamp) AT.stamp(d, 'partition_geshan', x - 1.2, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }
  function moonYuedong(d, x, y, z, o = {}) {
    if (AT && AT.stampScreens) AT.stampScreens(d, x, y, z, Object.assign({ kind: 'yuedong' }, o));
    else if (AT && AT.stamp) AT.stamp(d, 'moon_yuedong', x - 1.4, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }
  function frameMenkuang(d, x, y, z, o = {}) {
    if (AT && AT.stampScreens) AT.stampScreens(d, x, y, z, Object.assign({ kind: 'menkuang' }, o));
    else if (AT && AT.stamp) AT.stamp(d, 'frame_menkuang', x - 1.1, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }
  function screensStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampScreens) AT.stampScreens(d, x, y, z, o);
  }

  /* Site212：影壁 / 照壁 / 砖雕花心 / 基座 helpers */
  function wallYingbi(d, x, y, z, o = {}) {
    if (AT && AT.stampYingbi) AT.stampYingbi(d, x, y, z, Object.assign({ kind: 'yingbi' }, o));
    else if (AT && AT.stamp) AT.stamp(d, 'wall_yingbi', x - 1.2, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }
  function wallZhaobi(d, x, y, z, o = {}) {
    if (AT && AT.stampYingbi) AT.stampYingbi(d, x, y, z, Object.assign({ kind: 'zhaobi' }, o));
    else if (AT && AT.stamp) AT.stamp(d, 'wall_zhaobi', x - 1.4, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }
  function brickHuaxin(d, x, y, z, o = {}) {
    if (AT && AT.stamp) AT.stamp(d, 'brick_huaxin', x, y, z, { sx: o.sx || 0.9, sy: o.sy || 0.9 });
  }
  function screenBase(d, x, y, z, o = {}) {
    if (AT && AT.stamp) AT.stamp(d, 'screen_base', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }
  function yingbiStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampYingbi) AT.stampYingbi(d, x, y, z, o);
  }

  /* Site207：寻杖栏杆 / 雀替 / 挂落 stamp 辅助（沿用 Atlas kitbash） */
  function railXunzhang(d, pts, o = {}) {
    if (AT && AT.stampRailQueti) AT.stampRailQueti(d, pts, o);
  }
  function quetiStamp(d, x, y, z, o = {}) {
    if (AT && AT.stamp) AT.stamp(d, 'ornament_queti', x, y, z, { sx: o.sx || 0.85, sy: o.sy || 0.85 });
  }
  function gualuoStamp(d, x0, y, z, x1, o = {}) {
    if (AT && AT.stampGualuo) AT.stampGualuo(d, x0, y, z, x1, o);
  }
  function balusterStamp(d, x, y, z, o = {}) {
    if (AT && AT.stamp) AT.stamp(d, 'baluster_xiaozhu', x, y, z, { sx: o.sx || 0.9, sy: o.sy || 0.9 });
  }

  /* Site209：门钉/铺首/门槛/抱鼓 stamp 辅助 */
  function doorMendingStamp(d, x0, y, z0, x1, z1, o = {}) {
    if (AT && AT.stampDoorHardware) AT.stampDoorHardware(d, x0, y, z0, x1, z1, Object.assign({ pushou: false, menkan: false, baogu: false }, o));
  }
  function pushouStamp(d, x, y, z, o = {}) {
    if (AT && AT.stamp) AT.stamp(d, 'knocker_pushou', x, y, z, { sx: o.sx || 0.95, sy: o.sy || 0.95 });
  }
  function menkanStamp(d, x, y, z, o = {}) {
    if (AT && AT.stamp) AT.stamp(d, 'sill_menkan', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }
  function baoguStamp(d, x, y, z, o = {}) {
    if (AT && AT.stamp) AT.stamp(d, 'stone_baogu', x, y, z, { sx: o.sx || 0.9, sy: o.sy || 0.9 });
  }
  function doorHardwareStamp(d, x0, y, z0, x1, z1, o = {}) {
    if (AT && AT.stampDoorHardware) AT.stampDoorHardware(d, x0, y, z0, x1, z1, o);
  }

  /* Site211：台基/阶条石/垂带/踏垛 stamp 辅助 */
  function platformStamp(d, x0, y0, x1, y1, z1, o = {}) {
    if (AT && AT.stampPlatform) AT.stampPlatform(d, x0, y0, x1, y1, z1, o);
  }

  /* Site213：鸱吻/走兽/正脊饰/垂脊 stamp 辅助 */
  function ridgeBeastStamp(d, o = {}) {
    if (AT && AT.stampRidgeBeasts) AT.stampRidgeBeasts(d, o);
  }


  /* Site215：拴马桩/上马石/石敢当/路牙石标 stamp 辅助 */
  function hitchingStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampHitching) AT.stampHitching(d, x, y, z, o);
    else if (AT && AT.stamp) {
      const map = { shuanma: 'post_shuanma', shangma: 'stone_shangma', ganddang: 'stone_ganddang', curb: 'curb_marker' };
      AT.stamp(d, map[o.kind || 'shuanma'] || 'post_shuanma', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }

  /* Site217：井亭/路亭/小牌坊/亭顶 stamp 辅助 */
  function windowLou(d, x, y, z, o = {}) {
    if (AT && AT.stampLouwindow) AT.stampLouwindow(d, x, y, z, Object.assign({ kind: 'lou' }, o));
    else if (AT && AT.stamp) AT.stamp(d, 'window_lou', x - 0.9, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  function wallHuaziang(d, x, y, z, o = {}) {
    if (AT && AT.stampLouwindow) AT.stampLouwindow(d, x, y, z, Object.assign({ kind: 'huaziang' }, o));
    else if (AT && AT.stamp) AT.stamp(d, 'wall_huaziang', x - 1.6, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  function brickToukong(d, x, y, z, o = {}) {
    if (AT && AT.stampLouwindow) AT.stampLouwindow(d, x, y, z, Object.assign({ kind: 'toukong' }, o));
    else if (AT && AT.stamp) AT.stamp(d, 'brick_toukong', x, y, z, { sx: o.sx || 0.9, sy: o.sy || 0.9 });
  }

  function latticeWall(d, x, y, z, o = {}) {
    if (AT && AT.stampLouwindow) AT.stampLouwindow(d, x, y, z, Object.assign({ kind: 'lattice' }, o));
    else if (AT && AT.stamp) AT.stamp(d, 'lattice_wall', x - 1.2, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  function louwindowStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampLouwindow) AT.stampLouwindow(d, x, y, z, o);
  }


  function rockeryStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampRockery) AT.stampRockery(d, x, y, z, o);
    else if (AT && AT.stamp) {
      const map = { taihu: 'rock_taihu', dieshi: 'rock_dieshi', peak: 'rock_peak_s', peak_s: 'rock_peak_s', moss: 'plant_rock_moss', rock_moss: 'plant_rock_moss' };
      AT.stamp(d, map[o.kind || 'taihu'] || 'rock_taihu', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }

  function pavilionStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampPavilions) AT.stampPavilions(d, x, y, z, o);
    else if (AT && AT.stamp) {
      const map = { jingting: 'pavilion_jingting', luting: 'pavilion_luting', paifang: 'gate_paifang_s', paifang_s: 'gate_paifang_s', roof: 'roof_ting' };
      AT.stamp(d, map[o.kind || 'jingting'] || 'pavilion_jingting', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }



  function bianeStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampBiane) AT.stampBiane(d, x, y, z, o);
    else if (AT && AT.stamp) {
      const map = { biane: 'sign_biane', duilian: 'sign_duilian', zhaopai: 'sign_zhaopai_s', zhaopai_s: 'sign_zhaopai_s', hanging: 'sign_hanging', hang: 'sign_hanging' };
      AT.stamp(d, map[o.kind || 'biane'] || 'sign_biane', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }

  function meirenkaoStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampMeirenkao) AT.stampMeirenkao(d, x, y, z, o);
    else if (AT && AT.stamp) {
      const map = { meirenkao: 'seat_meirenkao', feilaichi: 'seat_feilaichi', zuokan: 'rail_zuokan', lang: 'bench_lang', bench_lang: 'bench_lang' };
      AT.stamp(d, map[o.kind || 'meirenkao'] || 'seat_meirenkao', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }

  function baoguGateStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampBaogu) AT.stampBaogu(d, x, y, z, o);
    else if (AT && AT.stamp) {
      const map = { baogu: 'stone_baogu', stone_baogu: 'stone_baogu', mendun: 'stone_mendun', stone_mendun: 'stone_mendun', lu: 'stone_lu', stone_lu: 'stone_lu' };
      AT.stamp(d, map[o.kind || 'baogu'] || 'stone_baogu', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }

  function chuihuamenStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampChuihuamen) AT.stampChuihuamen(d, x, y, z, o);
    else if (AT && AT.stamp) {
      const map = { chuihua: 'gate_chuihua', menlou: 'gate_menlou_s', menlou_s: 'gate_menlou_s', menzhao: 'eave_menzhao', menzhu: 'post_menzhu' };
      AT.stamp(d, map[o.kind || 'chuihua'] || 'gate_chuihua', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }


  function penjingStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampPenjing) {
      AT.stampPenjing(d, x, y, z, o);
    } else if (AT && AT.stamp) {
      const map = { penjing: 'pot_penjing', pot: 'pot_penjing', pot_penjing: 'pot_penjing', huatan: 'bed_huatan', bed: 'bed_huatan', bed_huatan: 'bed_huatan', shitai: 'stone_shitai', stone: 'stone_shitai', stone_shitai: 'stone_shitai' };
      AT.stamp(d, map[o.kind || 'penjing'] || 'pot_penjing', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }

  function gongdengStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampGongdeng) {
      AT.stampGongdeng(d, x, y, z, o);
    } else if (AT && AT.stamp) {
      const map = { gong: 'lantern_gong', lantern_gong: 'lantern_gong', gongdeng: 'lantern_gong', sha: 'lantern_sha', lantern_sha: 'lantern_sha', stand: 'lantern_stand', lantern_stand: 'lantern_stand', lideng: 'lantern_stand' };
      AT.stamp(d, map[o.kind || 'gong'] || 'lantern_gong', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }





  function chaiduiStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampChaidui) {
      AT.stampChaidui(d, x, y, z, o);
    } else if (AT && AT.stamp) {
      const map = { chaidui: 'prop_chaidui', prop_chaidui: 'prop_chaidui', wood: 'prop_chaidui', firewood: 'prop_chaidui', caoduo: 'prop_caoduo', prop_caoduo: 'prop_caoduo', hay: 'prop_caoduo', straw: 'prop_caoduo', liangdai: 'prop_liangdai', prop_liangdai: 'prop_liangdai', sack: 'prop_liangdai', grain: 'prop_liangdai' };
      AT.stamp(d, map[o.kind || 'chaidui'] || 'prop_chaidui', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }

  function shuigangStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampShuigang) {
      AT.stampShuigang(d, x, y, z, o);
    } else if (AT && AT.stamp) {
      const map = { shuigang: 'prop_shuigang', prop_shuigang: 'prop_shuigang', jar: 'prop_shuigang', jinglan: 'prop_jinglan', prop_jinglan: 'prop_jinglan', well: 'prop_jinglan', shuitong: 'prop_shuitong', prop_shuitong: 'prop_shuitong', bucket: 'prop_shuitong' };
      AT.stamp(d, map[o.kind || 'shuigang'] || 'prop_shuigang', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }

  function huotanStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampHuotan) {
      AT.stampHuotan(d, x, y, z, o);
    } else if (AT && AT.stamp) {
      const map = { huotan: 'stall_huotan', stall: 'stall_huotan', stall_huotan: 'stall_huotan', huojia: 'rack_huojia', rack: 'rack_huojia', rack_huojia: 'rack_huojia', liangshai: 'pole_liangshai', pole: 'pole_liangshai', pole_liangshai: 'pole_liangshai' };
      AT.stamp(d, map[o.kind || 'huotan'] || 'stall_huotan', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }

  function zhuliStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampZhuli) {
      AT.stampZhuli(d, x, y, z, o);
    } else if (AT && AT.stamp) {
      const map = { zhuli: 'fence_zhuli', fence_zhuli: 'fence_zhuli', bamboo: 'fence_zhuli', huali: 'fence_huali', fence_huali: 'fence_huali', flower: 'fence_huali', chaifei: 'gate_chaifei', gate_chaifei: 'gate_chaifei', gate: 'gate_chaifei' };
      AT.stamp(d, map[o.kind || 'zhuli'] || 'fence_zhuli', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }


  function shishiStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampShishi) AT.stampShishi(d, x, y, z, o);
    else if (AT && AT.stamp) {
      const map = { shishi: 'stone_shishi', stone_shishi: 'stone_shishi', shishi_s: 'stone_shishi_s', stone_shishi_s: 'stone_shishi_s', s: 'stone_shishi_s' };
      AT.stamp(d, map[o.kind || 'shishi'] || 'stone_shishi', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }



  function xiangluStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampXianglu) {
      AT.stampXianglu(d, x, y, z, o);
    } else if (AT && AT.stamp) {
      const map = { xianglu: 'prop_xianglu', prop_xianglu: 'prop_xianglu', incense: 'prop_xianglu', zhutai: 'prop_zhutai', prop_zhutai: 'prop_zhutai', candle: 'prop_zhutai', gongan: 'prop_gongan_s', gongan_s: 'prop_gongan_s', prop_gongan_s: 'prop_gongan_s', altar: 'prop_gongan_s' };
      AT.stamp(d, map[o.kind || 'xianglu'] || 'prop_xianglu', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }

  function shizhuoStamp(d, x, y, z, o = {}) {
    if (AT && AT.stampShizhuo) {
      AT.stampShizhuo(d, x, y, z, o);
    } else if (AT && AT.stamp) {
      const map = { shizhuo: 'seat_shizhuo', seat_shizhuo: 'seat_shizhuo', table: 'seat_shizhuo', shideng: 'seat_shideng', seat_shideng: 'seat_shideng', stool: 'seat_shideng', qiping: 'seat_qiping', seat_qiping: 'seat_qiping', chess: 'seat_qiping' };
      AT.stamp(d, map[o.kind || 'shizhuo'] || 'seat_shizhuo', x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
    }
  }

  root.AncientParts = { leanW, roof, platform, lattice, latticeW, geshan, dougong, efang, beamEfang, caihuaBand, dougongBlock, eaveBoard, plaque, vsign, banner, lantern, lanternGlow, bannerGlow, hallFront, woodPlanks, stoneCoursing, awningStripe, crateMod, cityBrickS, cityBrickW, cityStoneS, merlonsS, merlonsW, parapetS, walkTop, shangqiangS, qingshuiS, qingshuiW, chitou, wallCap,
    bannerQifan, curtainWeiman, tasselLiusu, hangOrnament, softDecorStamp,
    wallYingbi, wallZhaobi, brickHuaxin, screenBase, yingbiStamp,
    screenLuodizhao, partitionGeshan, moonYuedong, frameMenkuang, screensStamp,
    railXunzhang, quetiStamp, gualuoStamp, balusterStamp,
    doorMendingStamp, pushouStamp, menkanStamp, baoguStamp, doorHardwareStamp, platformStamp, ridgeBeastStamp, hitchingStamp, pavilionStamp, chuihuamenStamp, rockeryStamp, meirenkaoStamp, bianeStamp, baoguGateStamp, penjingStamp, shishiStamp, gongdengStamp, zhuliStamp, huotanStamp, shizhuoStamp, shuigangStamp, xiangluStamp, chaiduiStamp, windowLou, wallHuaziang, brickToukong, latticeWall, louwindowStamp,
    site200: { lanternGlow: true, bannerGlow: true, warmHalo: true, groundWash: true },
    site201: { riverLamps: true, boatLampGlow: true, dockLampGlow: true, waterReflect: true, reuseLanternGlow: true,
      signboards: true, plaqueWood: true, vsignBoard: true, bannerCream: true, kitbash: true },
    site203: { lattice: true, latticeGeshan: true, huachuang: true, geshanBubujin: true, kanchuang: true, kitbash: true },
    site204: { streetProps: true, shideng: true, shiteng: true, huagang: true, lampPole: true, kitbash: true },
    site205: { roofTiles: true, wadang: true, dishui: true, walong: true, yankou: true, kitbash: true },
    site206: { gableBrick: true, shangqiang: true, qingshui: true, chitou: true, wallCap: true, kitbash: true },
    site207: { railQueti: true, xunzhang: true, queti: true, gualuo: true, xiaozhu: true, kitbash: true },
    site208: { caihua: true, beamEfang: true, caihuaBand: true, dougongBlock: true, eaveBoard: true, kitbash: true },
    site209: { doorHardware: true, mending: true, pushou: true, menkan: true, baogu: true, kitbash: true },
    site210: { banners: true, qifan: true, weiman: true, liusu: true, hangOrnament: true, kitbash: true },
    site211: { platform: true, taiji: true, tiaotiao: true, chuidai: true, taduo: true, kitbash: true },
    site212: { yingbi: true, zhaobi: true, huaxin: true, screenBase: true, kitbash: true },
    site213: { ridgeBeasts: true, chiwen: true, zoushou: true, ornament: true, chuiji: true, kitbash: true },
    site214: { screens: true, luodizhao: true, partitionGeshan: true, yuedong: true, menkuang: true, kitbash: true },
    site215: { hitching: true, shuanma: true, shangma: true, ganddang: true, curbMarker: true, kitbash: true },
    site216: { louwindow: true, windowLou: true, wallHuaziang: true, brickToukong: true, latticeWall: true, kitbash: true },
    site217: { pavilions: true, jingting: true, luting: true, paifangS: true, roofTing: true, kitbash: true },
    site218: { chuihuamen: true, chuihua: true, menlouS: true, menzhao: true, menzhu: true, kitbash: true },
    site219: { rockery: true, rockTaihu: true, rockDieshi: true, rockPeakS: true, plantRockMoss: true, kitbash: true },
    site220: { meirenkao: true, feilaichi: true, zuokan: true, benchLang: true, kitbash: true },
    site221: { biane: true, duilian: true, zhaopaiS: true, hanging: true, kitbash: true },
    site222: { baogu: true, stoneBaogu: true, stoneMendun: true, stoneLu: true, kitbash: true },
    site223: { penjing: true, potPenjing: true, bedHuatan: true, stoneShitai: true, kitbash: true },
    site224: { shishi: true, stoneShishi: true, stoneShishiS: true, kitbash: true },
    site225: { gongdeng: true, lanternGong: true, lanternSha: true, lanternStand: true, kitbash: true },
    site226: { zhuli: true, fenceZhuli: true, fenceHuali: true, gateChaifei: true, kitbash: true },
    site227: { huotan: true, stallHuotan: true, rackHuojia: true, poleLiangshai: true, kitbash: true },
    site228: { shizhuo: true, seatShizhuo: true, seatShideng: true, seatQiping: true, kitbash: true },
    site229: { shuigang: true, propShuigang: true, propJinglan: true, propShuitong: true, kitbash: true },
    site230: { xianglu: true, propXianglu: true, propZhutai: true, propGonganS: true, kitbash: true },
    site231: { chaidui: true, propChaidui: true, propCaoduo: true, propLiangdai: true, kitbash: true } };
})(typeof window !== 'undefined' ? window : globalThis);
