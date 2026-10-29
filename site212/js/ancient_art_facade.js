/* 鹰山宋城 · 宋代主题 facade atlas 模块（井槐里式多件拼装）。
 * 复用 RongqiaoArt define→ext_atlas 管线：每件是独立贴图模块，街铺由多件拼成，
 * 不再用整栋线条式 aq_shop 当主视觉。细节密度对标 variety / kit f_wall+f_window。
 * Site197：披檐条纹油布、竖招、门前货箱、双灯笼；facade-detail 再加斗拱/雕刻隔扇/万字窗/脊瓦门槛。
 * Site198：硬山瓦顶启用鸱吻 + 更密脊瓦/瓦当/滴水。
 * Site200：披檐/幌子/竖招黄昏夜景灯笼光晕与幌子暖色叠层。
 * Site201：匾额/竖招/幌子边框与文字细化（plaque_wood/vsign_board/banner_cream）。
 * Site203：格扇门窗/花窗/隔扇/槛窗 atlas 细化（lattice_geshan/window_huachuang/door_geshan_bubujin/sill_kanchuang）。
 * Site214：落地罩/隔断/月洞门框 meta（与格扇互补）。
 * Site205：瓦当/滴水/瓦垄/檐口 atlas 细化（tile_wadang/tile_dishui/tile_walong/eave_yankou）。
 * Site206：山墙/清水砖/墀头/墙帽 atlas 细化（wall_shangqiang/brick_qingshui/ornament_chitou/wall_cap）；aq_f_gable/aq_f_wall stamp。
 * Site207：栏杆寻杖/雀替/挂落/小柱 atlas 细化（rail_xunzhang/ornament_queti/hanging_gualuo/baluster_xiaozhu）；立面柱梁交角 densify。
 * Site208：彩绘梁枋/额枋/斗拱色块 atlas（beam_efang/caihua_band/dougong_block/eave_board）；檐下 stamp。
 * Site209：门钉/铺首衔环/门槛/抱鼓石 atlas 细化；大门 densify。
 * Site210：旗幡/帷幔/流苏/挂饰 atlas（banner_qifan/curtain_weiman/tassel_liusu/hang_ornament）；与幌子互补。
 * Site211：台基/阶条石/垂带踏垛 atlas 细化；基座 densify。
 * 全部名称/尺寸未经 Leo 确认。 */
(function (root) {
  'use strict';
  const { A, shade, C, H } = root.AncientCore;
  const X = root.AncientParts;
  if (!A || !X) return;
  const { RED, RED_W, WOOD, WOOD_D, PLASTER, PLASTER_W, STONE, STONE_W, BRICK, BRICK_W, PAPER, GOLD, TILE } = C;
  const BW = 3.5;   // bay width (m), 对齐 kit f_wall≈3m 的模块尺度，略宽以容纳隔扇
  const BD = 0.4;   // facade depth
  const BH = 3.9;   // wall height above 台基

  /** plaster / timber weathering: pixel stipple + timber posts + mid rail */
  function plasterFace(d, y, x0, x1, z0, z1, col) {
    const h = H(d), R = d.R, base = col || PLASTER;
    h.QS(y, x0, z0, x1, z1, base, shade(base, 0.55));
    for (let k = 0; k < 14; k++) {
      const x = x0 + R() * (x1 - x0), z = z0 + R() * (z1 - z0);
      h.QS(y - 0.002, x, z, Math.min(x1, x + 0.15 + R() * 0.35), Math.min(z1, z + 0.08 + R() * 0.2), shade(base, 0.9 + R() * 0.18), null);
    }
    for (let k = 0; k < 5; k++) {
      const x = x0 + 0.2 + R() * (x1 - x0 - 0.4);
      h.line([x, y - 0.003, z1 - 0.05], [x, y - 0.003, z1 - 0.4 - R() * 1.2], 'rgba(90,70,40,0.35)');
    }
    /* timber posts */
    const n = Math.max(1, Math.round((x1 - x0) / 1.75));
    for (let i = 0; i <= n; i++) {
      const x = x0 + (x1 - x0) * i / n;
      h.QS(y - 0.01, x - 0.07, z0, x + 0.07, z1, shade(WOOD, 0.9), shade(WOOD, 0.45));
      for (let zz = z0 + 0.2; zz < z1; zz += 0.35) h.px(x, y - 0.015, zz, shade(WOOD, 1.15), 1, 1);
    }
    h.QS(y - 0.01, x0, z0 + (z1 - z0) * 0.52, x1, z0 + (z1 - z0) * 0.52 + 0.12, shade(WOOD, 0.85), shade(WOOD, 0.5));
    h.QS(y - 0.01, x0, z1 - 0.16, x1, z1, shade(WOOD, 0.8), shade(WOOD, 0.45));
  }

  function brickSkirt(d, y, x0, x1, z0, z1) {
    const h = H(d);
    /* Site206：清水砖 atlas fill；回退 courses */
    if (X.qingshuiS) {
      X.qingshuiS(d, y - 0.01, x0, z0, x1, z1);
    } else {
      h.QS(y, x0, z0, x1, z1, BRICK, shade(BRICK, 0.5));
      d.coursesS(x0, x1, y, z0, z1, 0.14, shade(BRICK, 0.82), 0.28);
    }
  }

  function woodGrain(d, y, x0, x1, z0, z1, col) {
    const h = H(d), R = d.R, c = col || WOOD;
    h.QS(y, x0, z0, x1, z1, c, shade(c, 0.5));
    for (let x = x0 + 0.08; x < x1; x += 0.11) h.line([x, y - 0.002, z0 + 0.02], [x, y - 0.002, z1 - 0.02], shade(c, 0.78 + R() * 0.2));
    for (let k = 0; k < 4; k++) {
      const z = z0 + 0.15 + R() * (z1 - z0 - 0.3);
      h.line([x0 + 0.05, y - 0.003, z], [x1 - 0.05, y - 0.003, z], shade(c, 0.7));
    }
  }

  const SHOP_META = {
    dangpu: { name: '恒通当铺', plaque: '恒通當鋪', sign: '當', open: false, col: '#5a3a2a', banner: null },
    yaopu: { name: '济世堂', plaque: '濟世堂', sign: '藥', open: true, shelves: ['#8a6a3a', '#b08850', '#6a4a2a', '#c8b080'], banner: { t: '丸散膏丹', col: '#e8dcc0', tc: '#2a2a2a' } },
    buzhuang: { name: '锦绣布庄', plaque: '錦繡布莊', sign: '布', open: true, shelves: ['#b03a3a', '#3a5a9a', '#d8b050', '#3a7a5a', '#e8e0d0', '#8a3a7a'], banner: { t: '綾羅綢緞', col: '#2f4f86' } },
    gaobing: { name: '王记糕饼', plaque: '王記糕餅', sign: '餅', open: true, counter: true, banner: { t: '糕', col: '#c8322c' } },
    zahuo: { name: '万福杂货', plaque: '萬福雜貨', sign: '雜', open: true, shelves: ['#8a7a5a', '#6a8a9a', '#c8a060', '#5a5a4a', '#a8c8a8'], goods: true, banner: { t: '雜貨', col: '#7a5a2a' } },
  };

  /* —— 台基 strip（地面模块） —— */
  A.define('aq_f_base', {
    name: '宋城台基', variants: ['bay', 'wide'], geoOf(st, v) { return v === 'wide' ? [0, -0.15, 0, 7, 6.2, 0.38] : [0, -0.1, 0, BW, 0.55, 0.38]; },
    fp: [[0, 0, BW, 0.4]], layer: 'sorted',
    draw(d, st, v) {
      const w = v === 'wide' ? 7 : BW, dep = v === 'wide' ? 6.2 : 0.55;
      /* Site211：facade 台基阶条 densify（不碰铺地） */
      X.platform(d, 0, -0.1, w, dep, 0.35, { dense: true, taduo: false, chuidai: false });
      /* stone speckles */
      const h = H(d), R = d.R;
      for (let k = 0; k < 10; k++) h.px(R() * w, -0.05, 0.2 + R() * 0.1, shade(STONE, 0.85 + R() * 0.3), 1, 1);
    },
  });

  /* —— 硬山山墙端头（Site206：清水砖/山墙/墀头/墙帽 atlas kitbash） —— */
  A.define('aq_f_gable', {
    name: '宋城硬山墀头', geo: [-0.15, -0.35, 0, 0.55, 6.1, 4.6], fp: [[0, 0, 0.45, 6]],
    draw(d) {
      const F = 0.45;
      /* 体量底座 */
      d.box(0, F - 0.25, 0, 0.45, 6, 4.4, BRICK, { line: shade(BRICK, 0.5), west: BRICK_W, top: shade(BRICK, 1.1) });
      d.box(-0.02, F - 0.27, 0, 0.47, 6, 0.55, STONE, { line: shade(STONE, 0.5), west: STONE_W });
      /* Site206：W 面清水砖 + S 端山墙 atlas 密实贴面 */
      if (X.qingshuiW) X.qingshuiW(d, -0.01, F - 0.25, 0.55, 6, 4.35);
      else d.coursesW(0, F - 0.25, 6, 0.55, 4.4, 0.15, shade(BRICK_W, 0.82), 0.48);
      if (X.shangqiangS) X.shangqiangS(d, F - 0.26, 0, 0.55, 0.45, 4.35);
      else d.coursesS(0, 0.45, F - 0.25, 0.55, 4.4, 0.15, shade(BRICK, 0.82), 0.24);
      /* 墀头饰（上下两端 densify） */
      if (X.chitou) {
        X.chitou(d, -0.08, F - 0.38, 3.55, { sx: 0.95, sy: 1.05 });
        X.chitou(d, -0.06, 5.55, 3.55, { sx: 0.85, sy: 1.0 });
        X.chitou(d, -0.05, F + 2.6, 3.55, { sx: 0.8, sy: 0.95 });
      } else {
        d.box(-0.08, F - 0.35, 3.85, 0.53, F - 0.05, 4.45, '#a8a49c', { line: '#5a5650' });
        H(d).QS(F - 0.36, 0.0, 3.95, 0.45, 4.3, '#8a8a84', '#5a5650');
      }
      /* 墙帽压顶 */
      if (X.wallCap) X.wallCap(d, -0.05, F - 0.3, 6.05, 4.35);
      else d.box(-0.05, F - 0.3, 4.3, 0.5, 6.05, 4.55, '#a29e95', { line: shade('#a29e95', 0.5) });
      const h = H(d), R = d.R;
      for (let k = 0; k < 10; k++) h.px(0.1 + R() * 0.25, F - 0.26, 0.7 + R() * 3.2, shade(BRICK, 0.7), 1, 1);
    },
  });

  /* —— 粉墙模块（闭店 / 当铺墙 / 侧墙） —— */
  A.define('aq_f_wall', {
    name: '宋城粉墙', variants: ['plaster', 'closed', 'dang'], geo: [0, -0.15, 0, BW, BD, BH],
    draw(d, st, v) {
      const h = H(d), F = 0, zf = 0.35;
      brickSkirt(d, F, 0, BW, zf, zf + 0.55);
      plasterFace(d, F, 0, BW, zf + 0.55, BH - 0.15, v === 'dang' ? '#e8e2d2' : PLASTER);
      if (v === 'dang') {
        h.stext('當', BW * 0.45, F - 0.02, 2.05, 42, '#2a2a2a', { font: '"Noto Serif CJK SC"' });
        /* small high counter window */
        woodGrain(d, F - 0.02, 2.2, BW - 0.15, zf + 0.7, 1.55, '#3a2a20');
        X.lattice(d, F - 0.03, 2.3, zf + 0.85, BW - 0.25, 1.45, { frame: '#2a1a12', style: 'grid', step: 0.1, paper: '#1a120e' });
      } else if (v === 'closed') {
        /* 铺板 boarded */
        for (let x = 0.15; x < BW - 0.1; x += 0.22) woodGrain(d, F - 0.02, x, x + 0.18, zf + 0.55, BH - 0.35, shade(WOOD, 0.95));
      }
      X.efang(d, F - 0.05, 0.05, BW - 0.05, BH - 0.35, BH - 0.08, { plain: true, base: RED_W });
    },
  });

  /* —— 隔扇门模块（Site197 + Site203：雕刻/步步锦隔扇 + 密格横披 + 斗拱 + 彩画额枋） —— */
  A.define('aq_f_door', {
    name: '宋城隔扇门', variants: ['grid', 'bubujin', 'diamond', 'carved', 'ban'], geo: [0, -0.2, 0, BW, BD, BH],
    draw(d, st, v) {
      const F = 0, zf = 0.35, style = v || 'grid';
      brickSkirt(d, F, 0, BW, zf, zf + 0.5);
      plasterFace(d, F, 0, 0.35, zf + 0.5, BH - 0.15);
      plasterFace(d, F, BW - 0.35, BW, zf + 0.5, BH - 0.15);
      H(d).column(0.45, F - 0.05, zf, BH - 0.2, 0.11, RED, { base: STONE });
      H(d).column(BW - 0.45, F - 0.05, zf, BH - 0.2, 0.11, RED, { base: STONE });
      if (style === 'ban') {
        X.geshan(d, F - 0.02, 0.55, zf + 0.5, BW - 0.55, BH - 0.55, 2, { frame: RED_W, ban: true });
      } else {
        X.geshan(d, F - 0.02, 0.55, zf + 0.5, BW - 0.55, BH - 0.55, 2, {
          frame: RED_W,
          style: style === 'carved' ? 'diamond' : style,
          carved: style === 'carved' || style === 'diamond',
          bubujin: style === 'bubujin',
        });
      }
      /* Site203：上横披用密格 lattice_geshan，比单层万字更密 */
      X.lattice(d, F - 0.01, 0.55, BH - 0.55, BW - 0.55, BH - 0.2, {
        frame: RED_W, style: 'lattice_geshan', latticeGeshan: true, step: 0.1,
      });
      X.dougong(d, F - 0.08, [0.55, BW / 2, BW - 0.55], BH - 0.55, { size: 0.55 });
      X.efang(d, F - 0.05, 0.05, BW - 0.05, BH - 0.35, BH - 0.08, { plain: false, base: RED_W });
      /* Site207：雀替于柱头 + 挂落于额枋下 */
      if (X.quetiStamp) {
        X.quetiStamp(d, 0.55, F - 0.12, BH - 0.72, { sx: 0.7, sy: 0.75 });
        X.quetiStamp(d, BW - 0.55, F - 0.12, BH - 0.72, { sx: 0.7, sy: 0.75 });
      }
      if (X.gualuoStamp) X.gualuoStamp(d, 0.7, F - 0.1, BH - 0.95, BW - 0.7, { sy: 0.7 });
      /* Site208：门楣檐板 */
      if (X.eaveBoard) X.eaveBoard(d, F - 0.1, 0.1, BW - 0.1, BH - 0.02);
      /* Site209：门钉铺首/门槛/抱鼓 densify（板门更重；格扇轻铺首+门槛） */
      if (X.doorHardwareStamp) {
        if (style === 'ban') {
          X.doorHardwareStamp(d, 0.55, F - 0.06, zf + 0.5, BW - 0.55, BH - 0.55, { dense: true });
        } else {
          X.doorHardwareStamp(d, 0.55, F - 0.05, zf + 0.5, BW - 0.55, BH - 0.55, {
            dense: false, mending: false, pushou: true, menkan: true, baogu: true, pushouT: 0.48, baoguSx: 0.7, baoguSy: 0.75,
          });
        }
      }
      /* Site210：门楣流苏/挂饰点缀 */
      if (X.tasselLiusu) {
        X.tasselLiusu(d, 0.7, F - 0.15, BH - 0.12, { sx: 0.6, sy: 0.65 });
        X.tasselLiusu(d, BW - 0.7, F - 0.15, BH - 0.12, { sx: 0.6, sy: 0.65 });
      }
      if (X.hangOrnament) X.hangOrnament(d, BW / 2, F - 0.18, BH - 0.2, { sx: 0.55, sy: 0.6 });
    },
  });

  /* —— 格子窗模块（Site197 万字 + Site203 花窗/槛窗） —— */
  A.define('aq_f_window', {
    name: '宋城格子窗', variants: ['grid', 'bubujin', 'diamond', 'wanzi', 'blind', 'huachuang', 'kanchuang'], geo: [0, -0.2, 0, BW, BD, BH],
    draw(d, st, v) {
      const h = H(d), F = 0, zf = 0.35;
      const style = (v === 'blind' ? 'grid' : (v || 'grid'));
      brickSkirt(d, F, 0, BW, zf, zf + 0.5);
      plasterFace(d, F, 0, BW, zf + 0.5, zf + 0.95);
      plasterFace(d, F, 0, 0.3, zf + 0.95, BH - 0.15);
      plasterFace(d, F, BW - 0.3, BW, zf + 0.95, BH - 0.15);
      h.column(0.4, F - 0.05, zf, BH - 0.2, 0.1, RED, { base: STONE });
      h.column(BW - 0.4, F - 0.05, zf, BH - 0.2, 0.1, RED, { base: STONE });
      if (v === 'kanchuang') {
        X.lattice(d, F - 0.02, 0.4, zf + 0.85, BW - 0.4, BH - 0.4, {
          frame: RED_W, style: 'kanchuang', kanchuang: true, sill: true, step: 0.12,
        });
      } else if (v === 'huachuang') {
        X.lattice(d, F - 0.02, 0.4, zf + 0.95, BW - 0.4, BH - 0.4, {
          frame: RED_W, style: 'huachuang', huachuang: true, sill: true, step: 0.12,
        });
      } else {
        X.lattice(d, F - 0.02, 0.45, zf + 0.95, BW - 0.45, BH - 0.45, { frame: RED_W, style, step: 0.13, sill: true });
      }
      if (v === 'blind') {
        const c = '#c8ae6c';
        h.QS(F - 0.04, 0.5, 2.4, BW - 0.5, BH - 0.5, c, shade(c, 0.55));
        for (let z = 2.46; z < BH - 0.5; z += 0.06) h.line([0.5, F - 0.045, z], [BW - 0.5, F - 0.045, z], shade(c, 0.85));
      }
      /* Site203：窗上再贴一道密格横披 */
      if (v !== 'blind') {
        X.lattice(d, F - 0.005, 0.55, BH - 0.42, BW - 0.55, BH - 0.18, {
          frame: RED_W, style: 'lattice_geshan', latticeGeshan: true, step: 0.09,
        });
      }
      X.dougong(d, F - 0.08, [BW / 2], BH - 0.5, { size: 0.5 });
      X.efang(d, F - 0.05, 0.05, BW - 0.05, BH - 0.35, BH - 0.08, { plain: false, base: RED_W });
      /* Site207：雀替 + 挂落 */
      if (X.quetiStamp) {
        X.quetiStamp(d, 0.4, F - 0.12, BH - 0.68, { sx: 0.65, sy: 0.7 });
        X.quetiStamp(d, BW - 0.4, F - 0.12, BH - 0.68, { sx: 0.65, sy: 0.7 });
      }
      if (X.gualuoStamp) X.gualuoStamp(d, 0.55, F - 0.1, BH - 0.9, BW - 0.55, { sy: 0.65 });
      /* Site208：门楣檐板 */
      if (X.eaveBoard) X.eaveBoard(d, F - 0.1, 0.1, BW - 0.1, BH - 0.02);
    },
  });

  /* —— 开敞铺面模块（柜台 + 货架透视） —— */
  A.define('aq_f_shop', {
    name: '宋城开敞铺面', variants: Object.keys(SHOP_META), geo: [0, -1.4, 0, BW, 1.6, BH],
    fp: [[0, 0, BW, 0.5]],
    draw(d, st, v) {
      const S = SHOP_META[v] || SHOP_META.zahuo;
      const h = H(d), F = 0, zf = 0.35, R = d.R;
      brickSkirt(d, F, 0, BW, zf, zf + 0.45);
      /* dark interior depth */
      h.QS(F + 0.55, 0.15, zf, BW - 0.15, BH - 0.3, '#2a1e16');
      h.QS(F + 0.54, 0.15, zf, BW - 0.15, zf + 0.08, shade('#2a1e16', 0.7));
      if (S.shelves) {
        for (let z = zf + 0.7; z < BH - 0.6; z += 0.42) {
          h.QS(F + 0.5, 0.25, z, BW - 0.25, z + 0.05, shade(WOOD, 0.75));
          for (let x = 0.35; x < BW - 0.4; x += 0.18 + R() * 0.1) {
            h.QS(F + 0.48, x, z + 0.05, x + 0.12, z + 0.14 + R() * 0.12, S.shelves[(R() * S.shelves.length) | 0]);
          }
        }
      }
      if (S.counter || !S.shelves) {
        d.box(0.25, F - 0.4, zf, BW - 0.8, F - 0.05, zf + 1.0, WOOD, { line: shade(WOOD, 0.45), top: shade(WOOD, 1.2) });
        h.line([0.25, F - 0.4, zf + 0.5], [BW - 0.8, F - 0.4, zf + 0.5], shade(WOOD, 0.7));
        if (S.counter) {
          for (let x = 0.4; x < BW - 1.0; x += 0.4) {
            h.QS(F - 0.42, x, zf + 1.02, x + 0.28, zf + 1.12, '#e8d098', '#8a6a3a');
            h.QS(F - 0.42, x + 0.04, zf + 1.12, x + 0.24, zf + 1.2, '#c89850');
          }
        }
      }
      if (S.goods) {
        for (const [x, c] of [[0.5, '#9a7a4a'], [1.2, '#6a5a3a'], [1.9, '#a89a6a']]) {
          X.crateMod(d, x, F - 0.55, zf, x + 0.5, F - 0.1, c, 0.42);
        }
      }
      /* Site197：门槛货箱/筐（贴图模块） */
      X.crateMod(d, 0.35, F - 0.85, zf, 0.95, F - 0.35, '#a08050', 0.28);
      X.crateMod(d, BW - 1.0, F - 0.9, zf, BW - 0.35, F - 0.4, '#8a6a3a', 0.32);
      /* columns + 楣子 + upper 横披 */
      h.column(0.2, F - 0.05, zf, BH - 0.15, 0.12, RED, { base: STONE });
      h.column(BW - 0.2, F - 0.05, zf, BH - 0.15, 0.12, RED, { base: STONE });
      /* Site203：铺面楣子改密格隔心 + 花窗点缀节奏 */
      X.lattice(d, F + 0.02, 0.25, BH - 0.7, BW - 0.25, BH - 0.42, {
        frame: RED_W, style: 'lattice_geshan', latticeGeshan: true, step: 0.12, paper: '#33261d',
      });
      X.lattice(d, F + 0.015, BW * 0.28, BH - 0.42, BW * 0.72, BH - 0.18, {
        frame: RED_W, style: 'huachuang', huachuang: true, step: 0.12, paper: '#33261d',
      });
      X.dougong(d, F - 0.1, [0.6, BW / 2, BW - 0.6], BH - 0.72, { size: 0.5 });
      X.efang(d, F - 0.05, 0.05, BW - 0.05, BH - 0.35, BH - 0.08, { plain: false, base: RED_W });
      /* Site207：雀替于柱梁交角 + 挂落 */
      if (X.quetiStamp) {
        X.quetiStamp(d, 0.6, F - 0.14, BH - 0.88, { sx: 0.7, sy: 0.75 });
        X.quetiStamp(d, BW - 0.6, F - 0.14, BH - 0.88, { sx: 0.7, sy: 0.75 });
      }
      if (X.gualuoStamp) X.gualuoStamp(d, 0.75, F - 0.12, BH - 1.05, BW - 0.75, { sy: 0.7 });
      /* Site208：铺面檐板 */
      if (X.eaveBoard) X.eaveBoard(d, F - 0.12, 0.08, BW - 0.08, BH - 0.02);
      /* Site209：铺面门槛 + 抱鼓点缀（少门钉，保持开敞） */
      if (X.doorHardwareStamp) {
        X.doorHardwareStamp(d, 0.35, F - 0.55, zf, BW - 0.35, zf + 1.6, {
          dense: false, mending: false, pushou: false, menkan: true, baogu: true, baoguSx: 0.65, baoguSy: 0.7, baoguInset: 0.05,
        });
      }
      /* Site210：铺面檐下流苏/挂饰点缀（不加旗幡，避免与 aq_f_banner 幌子叠堆） */
      if (X.tasselLiusu) {
        X.tasselLiusu(d, 0.55, F - 0.18, BH - 0.15, { sx: 0.65, sy: 0.7 });
        X.tasselLiusu(d, BW - 0.55, F - 0.18, BH - 0.15, { sx: 0.65, sy: 0.7 });
      }
      if (X.hangOrnament) X.hangOrnament(d, BW / 2, F - 0.2, BH - 0.25, { sx: 0.6, sy: 0.65 });
      /* 铺板 stack at side */
      for (let x = BW - 0.55; x < BW - 0.1; x += 0.16) h.QS(F + 0.02, x, zf, x + 0.14, 2.7, shade(WOOD, 0.95), shade(WOOD, 0.5));
    },
    emit(d) {
      H(d).QS(0.05, 0.3, 0.4, BW - 0.3, 2.8, 'rgba(255,160,70,0.2)');
    },
  });

  /* —— 硬山屋面 bay —— */
  A.define('aq_f_roof', {
    name: '宋城硬山瓦顶', variants: ['bay', 'wide', 'public'],
    geoOf(st, v) { return v === 'wide' || v === 'public' ? [-0.3, -0.5, 3.6, 7.4, 6.4, 7.2] : [-0.2, -0.45, 3.6, BW + 0.3, 6.3, 7.0]; },
    shadow: false,
    draw(d, st, v) {
      const w = (v === 'wide' || v === 'public') ? 7.2 : BW + 0.2;
      const pub = v === 'public';
      X.roof(d, {
        x0: -0.15, x1: w, y0: -0.35, y1: 6.2, z: 4.35, rise: pub ? 2.35 : 2.15,
        type: 'yingshan', lift: 0.1, ridgeH: pub ? 0.38 : 0.32, chiwen: true, dense: true, site205: true, site213: pub !== false,
        gableCol: BRICK_W, gableBrick: true, barge: '#6e6a64',
        beasts: pub ? 2 : 0,
      });
    },
  });

  /* —— 披檐 / 幌杆挑梁（Site197：条纹油布 + 流苏） —— */
  A.define('aq_f_awning', {
    name: '宋城披檐', geo: [-0.1, -1.1, 3.3, BW + 0.1, 0.2, 4.5], shadow: false,
    draw(d) {
      X.roof(d, {
        x0: -0.15, x1: BW + 0.15, y0: -1.05, y1: 0.15, z: 3.85, rise: 0.4,
        type: 'xuanshan', lift: 0.18, ridgeH: 0, chiwen: false, over: 0.05, gableCol: RED_W,
      });
      const h = H(d);
      h.line([0.3, -0.1, 3.9], [0.3, -0.95, 3.9], WOOD_D, 2);
      h.line([BW - 0.3, -0.1, 3.9], [BW - 0.3, -0.95, 3.9], WOOD_D, 2);
      /* 条纹油布底（atlas 拼装，非纯线框） */
      const stripes = ['#c8322c', '#e8dcc0', '#c8322c', '#2f4f86', '#c8322c', '#e8dcc0'];
      X.awningStripe(d, [
        [0.1, -0.95, 3.72], [BW - 0.1, -0.95, 3.72],
        [BW - 0.15, -0.15, 3.95], [0.15, -0.15, 3.95],
      ], stripes, { valance: true, line: shade('#6a2a22', 0.55) });
      /* Site208：檐板 + 彩画色带（披檐下密实色块） */
      if (X.eaveBoard) X.eaveBoard(d, -0.12, 0.1, BW - 0.1, 3.78);
      if (X.caihuaBand) X.caihuaBand(d, -0.08, 0.2, BW - 0.2, 3.55);
      /* Site210：披檐下帷幔/流苏/挂饰（避开两侧灯笼与幌杆位置） */
      if (X.softDecorStamp) X.softDecorStamp(d, 0.85, -0.55, 3.45, BW - 0.85, { weiman: true, tassel: true, hang: true, qifan: false, weimanSy: 0.55, tasselStep: 1.35, hangStep: 1.9, tasselZ: -0.15, hangZ: -0.05 });
      /* 挑梁下双灯笼 */
      X.lantern(d, 0.55, -0.7, 3.55, { r: 0.14, cord: 0.08, text: '福', col: '#d8c8a0' });
      X.lantern(d, BW - 0.55, -0.7, 3.55, { r: 0.14, cord: 0.08, text: '禄', col: '#d8c8a0' });
    },
    emit(d) {
      /* Site200：披檐双灯笼增强光晕 + 地面落光 */
      X.lanternGlow(d, 0.55, -0.7, 3.55, { r: 0.14, cord: 0.08, col: '#ffd890', boost: 1.45 });
      X.lanternGlow(d, BW - 0.55, -0.7, 3.55, { r: 0.14, cord: 0.08, col: '#ffd890', boost: 1.45 });
    },
  });

  /* —— 匾额（Site201：漆木金边/如意角 plaque_wood + 深匾 plaque_frame） —— */
  A.define('aq_f_plaque', {
    name: '宋城匾额', variants: Object.keys(SHOP_META), geo: [-0.8, -0.25, 2.6, 0.8, 0.15, 3.5], shadow: false,
    draw(d, st, v) {
      const S = SHOP_META[v] || SHOP_META.zahuo;
      /* 当铺/糕饼用漆木匾，药/布/杂用深匾；占位字勿写死官方名 */
      const wood = v === 'dangpu' || v === 'gaobing';
      X.plaque(d, -0.08, 0, 3.15, S.plaque, {
        size: 11, w: Math.min(2.8, 0.55 * S.plaque.length),
        style: wood ? 'wood' : 'dark', wood, sw: 2.8,
      });
    },
  });

  /* —— 幌子（Site201：cream atlas + 织纹/流苏边框） —— */
  A.define('aq_f_banner', {
    name: '宋城幌子', variants: Object.keys(SHOP_META), geo: [-0.4, -1.2, 2.8, 0.4, 0.2, 4.3], shadow: false,
    draw(d, st, v) {
      const S = SHOP_META[v] || SHOP_META.zahuo;
      const h = H(d);
      h.line([0, 0, 4.0], [0, -0.9, 4.0], WOOD_D, 2);
      if (S.banner) {
        X.banner(d, 0, -0.7, 3.9, S.banner.t, {
          col: S.banner.col, tc: S.banner.tc, len: 0.5 + S.banner.t.length * 0.4,
          w: 0.48, size: 12, pole: false, border: GOLD, fringe: true,
        });
      } else {
        X.lantern(d, 0, -0.75, 3.9, { r: 0.22, cord: 0.12, text: S.sign || '當', col: '#d8c8a0' });
      }
    },
    emit(d, st, v) {
      const S = SHOP_META[v] || SHOP_META.zahuo;
      if (S.banner) {
        /* Site200：幌子布面暖色叠层 */
        X.bannerGlow(d, 0, -0.7, 3.9, {
          w: 0.48, len: 0.5 + S.banner.t.length * 0.4,
          col: 'rgba(255,195,110,0.5)', boost: 1.3,
        });
      } else {
        X.lanternGlow(d, 0, -0.75, 3.9, { r: 0.22, cord: 0.12, col: '#ffd890', boost: 1.5 });
      }
    },
  });

  /* —— 竖招（门侧挂牌，Site197 街巷；Site201 vsign_board atlas） —— */
  A.define('aq_f_vsign', {
    name: '宋城竖招', variants: Object.keys(SHOP_META), geo: [-0.35, -0.55, 1.6, 0.35, 0.15, 3.8], shadow: false,
    draw(d, st, v) {
      const S = SHOP_META[v] || SHOP_META.zahuo;
      const h = H(d);
      h.line([0, 0, 3.7], [0, -0.45, 3.7], WOOD_D, 2);
      X.vsign(d, -0.08, 0, 3.55, S.sign || '店', {
        size: 14, w: 0.42, bg: '#2a1e16',
        col: '#f0cf6a', frame: GOLD, atlas: true,
      });
      /* 竖招下挂小灯笼 */
      X.lantern(d, 0, -0.35, 2.0, { r: 0.12, cord: 0.1, col: '#d8c8a0' });
    },
    emit(d) {
      X.lanternGlow(d, 0, -0.35, 2.0, { r: 0.12, cord: 0.1, col: '#ffd890', boost: 1.5 });
    },
  });

  /* —— 斗拱装饰件（可单独挂檐下） —— */
  A.define('aq_f_dougong', {
    name: '宋城斗拱', variants: ['bay', 'large'], geo: [-0.9, -0.7, 3.2, 0.9, 0.35, 4.0], shadow: false,
    draw(d, st, v) {
      /* Site208：斗拱色块 + 两侧额枋/彩画带 */
      X.dougong(d, -0.05, [0], 3.35, { size: v === 'large' ? 1.2 : 0.85, large: v === 'large' });
      if (X.beamEfang) X.beamEfang(d, -0.02, -0.85, 0.85, 3.85, { h: 0.32 });
      if (X.caihuaBand) X.caihuaBand(d, -0.06, -0.7, 0.7, 3.28, { h: 0.22 });
    },
  });

  /* —— 立柱装饰件 —— */
  A.define('aq_f_column', {
    name: '宋城红柱', geo: [-0.2, -0.2, 0, 0.2, 0.2, BH],
    draw(d) {
      H(d).column(0, 0, 0.35, BH - 0.1, 0.13, RED, { base: STONE });
    },
  });

  root.AncientFacade = {
    BW, SHOP_META,
    site197: { vsign: true, awningStripe: true, crates: true, facadeDetail: true, dougong: true, wanzi: true, carvedGeshan: true, ridgeTile: true },
    site198: { roofRidge: true, wadang: true, chiwen: true, drip: true, denseRoof: true, kitbash: true },
    site200: { lanternGlow: true, bannerGlow: true, warmHalo: true, duskNightBoost: true },
    site201: { signboards: true, plaqueWood: true, vsignBoard: true, bannerCream: true, kitbash: true },
    site203: { lattice: true, latticeGeshan: true, huachuang: true, geshanBubujin: true, kanchuang: true, kitbash: true },
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
  };
})(typeof window !== 'undefined' ? window : globalThis);
