/* 月河区 · 河东新城 P10 第三套墙皮 (2026-10-24；2026-10-26 立面分化).
 * 浅石材裙楼 + 冷玻璃塔身。不用榕桥暖砖，不用月湾红瓦，不加早市雨棚，也不抄南埠白幕墙/珊瑚。
 * 九栋具名塔楼各有一套冷玻璃节奏（竖梃密度、横带、玻璃冷度、收顶），不新开图集页：
 * 玻璃变体帧别名到 hd_glass，白天盖绘在已有墙框上。名字、颜色未经 Leo 确认。
 * 接缝沿用 Site98：每跨 3 m 共用一条框，竖梃不画在 x=3，横线不压在 z=3。 */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A || !A.skin) return;
  const shade = A.shade;
  function L(d, rot) {
    const W = rot === 6, pt = (lx, ly, z) => (W ? [ly, -lx, z] : [lx, ly, z]), C = (c) => (W && c && c[0] === '#' ? shade(c, 0.84) : c);
    const face = (pts, fill, line, lw) => d.face(pts.map((p) => pt(...p)), C(fill), line, lw);
    const box = (lx0, ly0, z0, lx1, ly1, z1, col, o = {}) => {
      const o2 = Object.assign({}, o);
      if (o.skin) { lx0 -= 0.07; lx1 += 0.07; if (W) { o2.noS = true; o2.noW = false; } else { o2.noW = true; o2.noS = false; } o2.noTop = true; o2.line = false; delete o2.skin; }
      return W ? d.box(ly0, -lx1, z0, ly1, -lx0, z1, col, o2) : d.box(lx0, ly0, z0, lx1, ly1, z1, col, o2);
    };
    const Q = (ly, a0, z0, a1, z1, fill, line) => face([[a0, ly, z0], [a1, ly, z0], [a1, ly, z1], [a0, ly, z1]], fill, line);
    const seg = (a, b, col, lw) => d.seg(pt(...a), pt(...b), C(col), lw);
    const text = (s, lx, ly, z, size, col, o = {}) => d.text(s, ...pt(lx, ly, z), size, col, Object.assign({}, o, { west: W }));
    const textW = (s, size) => d.textW(s, size);
    return { W, pt, C, face, box, Q, seg, text, textW, R: d.R };
  }
  const geoL = (rot, g) => (rot === 6 ? [g[1], -g[3], g[2], g[4], -g[0], g[5]] : g);
  const F = -0.04;
  const STONE = '#d9d4c8', JOINT = '#b7b1a4', GLASS = '#8aa0ab', SHADE = '#5d6c74', SPANDREL = '#c5ccd0';
  function stone(l, st) {
    const Q = (a0, z0, a1, z1, f) => l.Q(F, a0, z0, a1, z1, f, null);
    l.box(0, F, 0, 3, 0.26, 3, STONE, { skin: true });
    Q(0, 0, 3, 0.18, '#c9c3b6');
    Q(0, 2.58, 3, 2.9, '#cfc9bc');
    for (const z of [0.72, 1.5, 2.28]) l.seg([0, F, z], [3, F, z], JOINT, 1);
    for (const x of [0, 1.5]) l.seg([x, F, 0.18], [x, F, 2.58], shade(JOINT, 1.05), 1);
    if (st === 'ground') Q(0.35, 0.85, 2.65, 1.15, shade(GLASS, 0.92));
  }
  function glass(l, st, lit) {
    const Q = (a0, z0, a1, z1, f) => l.Q(F, a0, z0, a1, z1, f, null);
    l.box(0, F, 0, 3, 0.22, 3, GLASS, { skin: true });
    const mull = [0, 0.75, 1.5, 2.25];
    if (st === 'ground') {
      Q(0, 0, 3, 0.22, '#3e474c');
      Q(0, 0.22, 3, 2.55, lit ? '#d5e4ee' : shade(GLASS, 1.08));
      Q(0, 2.55, 3, 2.9, SPANDREL);
      l.seg([0, F, 2.55], [3, F, 2.55], SHADE, 2);
      for (const x of mull) l.seg([x, F, 0.22], [x, F, 2.55], '#3a4448', x % 1.5 === 0 ? 2 : 1);
      if (!lit) l.seg([0.3, F, 2.2], [1.2, F, 0.55], 'rgba(230,240,246,0.55)');
      return;
    }
    Q(0, 0, 3, 0.28, SPANDREL);
    Q(0, 0.28, 3, 0.42, shade(SHADE, 1.15));
    Q(0, 0.42, 3, 2.55, lit ? '#d7e6f0' : GLASS);
    Q(0, 2.55, 3, 2.7, shade(SHADE, 1.1));
    Q(0, 2.7, 3, 2.92, SPANDREL);
    if (!lit) {
      l.seg([0.25, F, 2.15], [1.15, F, 0.7], 'rgba(232,242,248,0.5)');
      Q(0.08, 0.55, 2.92, 1.05, shade(GLASS, 1.12));
    }
    for (const x of mull) l.seg([x, F, 0.42], [x, F, 2.55], shade(SHADE, 0.85), (x === 0 || x === 1.5) ? 2 : 1);
  }
  A.skin('f_wall', {
    variants: ['hd_stone'], states: ['upper', 'ground'], rots: [0, 6], prune: true, pad: 2,
    geo: (rot) => geoL(rot, [0, -0.04, 0, 3, 0.32, 3]),
    draw(d, st, v, rot) { stone(L(d, rot), st); },
  });
  A.skin('f_wall', {
    variants: ['hd_glass'], states: ['upper', 'ground'], rots: [0, 6], prune: true, pad: 2,
    geo: (rot) => geoL(rot, [0, -0.04, 0, 3, 0.32, 3]),
    draw(d, st, v, rot) { glass(L(d, rot), st, false); },
    emit(d, st, v, rot) {
      const l = L(d, rot);
      if (st === 'ground') { l.Q(F, 0.3, 0.35, 2.7, 2.2, 'rgba(214,230,240,0.55)'); return; }
      l.Q(F, 0.55, 0.7, 2.85, 2.35, 'rgba(210,228,238,0.45)');
    },
  });
  const NAMES = { yh: '月河中心', hd: '河东广场', ls: '澜石大厦', cj: '澄江中心', yl: '月澜大厦', sl: '石澜中心', dl: '东澜大厦', yx: '银杏中心', yl2: '研澜大厦' };
  const PLATES = { yh: NAMES.yh, hd: NAMES.hd, ls: NAMES.ls, cj: NAMES.cj, yl: NAMES.yl, sl: NAMES.sl, dl: NAMES.dl, yx: NAMES.yx, yl2: NAMES.yl2 };
  A.define('rq_hd_name', {
    name: '河东楼名', variants: Object.keys(NAMES), shadow: false, noShadow: true, fp: [], prune: true,
    geo: [0, -0.06, 0, 5.2, 0.02, 1.35], pad: 1,
    draw(d, st, v) {
      const s = NAMES[v] || v, size = 32, w = d.textW(s, size), off = Math.max(0.15, (5.2 - w) / 2);
      d.face([[0.08, -0.05, 0.08], [5.12, -0.05, 0.08], [5.12, -0.05, 1.22], [0.08, -0.05, 1.22]], '#1c2830', '#0e1418');
      d.face([[0.08, -0.05, 0.08], [5.12, -0.05, 0.08], [5.12, -0.05, 0.18], [0.08, -0.05, 0.18]], '#8aa0ab');
      d.text(s, off, -0.07, 0.32, size, '#e7eef2', { stroke: 'rgba(8,14,18,0.45)' });
    },
  });
  A.define('rq_hd_plate', {
    name: '河东门厅铭牌', variants: Object.keys(PLATES), shadow: false, noShadow: true, fp: [], prune: true,
    geo: [0, -0.08, 0, 3.6, 0.02, 0.55], pad: 0,
    draw(d, st, v) {
      const s = PLATES[v] || v, size = 14, w = d.textW(s, size), off = Math.max(0.12, (3.6 - w) / 2);
      d.face([[0.06, -0.06, 0.04], [3.54, -0.06, 0.04], [3.54, -0.06, 0.5], [0.06, -0.06, 0.5]], '#243038', '#12181c');
      d.text(s, off, -0.08, 0.16, size, '#e7eef2');
    },
  });

  /* 九栋：色族 + 体量一起拉开。楼高／面宽／进深／剪影各不相同，
   * 避免一排同高同宽矩形板楼读成小区。仍是河东主城办公／科研，
   * 不回榕桥暖砖，不整片南埠白幕。mass 单位是 3 m 开间。
   * 真实参照见 docs/hedong-office-refs.md（沪深穗京／NYC／Chicago）。
   * podium / crownStone / setbackTop / beltEvery / mass 给装配；FACE 给白天盖绘。 */
  const STYLE = {
    /* 33F 方点塔 + L 型大裙楼：区标 */
    yh:  { glass: 'hd_g_yh',  podium: 3, crownStone: 1, setbackTop: 0, beltEvery: 0, family: '淡蓝高透', form: '方点塔+L裙',
           mass: { F: 33, podiumNS: 11, podiumNW: 5, towerNS: 4, towerNW: 4, towerOff: 0 },
           trait: '33 层方点塔，L 型石材裙；淡蓝高透密竖梃' },
    /* 22F 宽板：矮而宽的办公板楼 */
    hd:  { glass: 'hd_g_hd',  podium: 3, crownStone: 2, setbackTop: 0, beltEvery: 0, family: '淡灰中透', form: '宽板楼',
           mass: { F: 22, podiumNS: 10, podiumNW: 4, towerNS: 8, towerNW: 4, towerOff: 1 },
           trait: '22 层宽板，淡灰中透，厚腰档石材冠' },
    /* 29F 深进深科研块 */
    ls:  { glass: 'hd_g_ls',  podium: 4, crownStone: 1, setbackTop: 0, beltEvery: 0, family: '深蓝低透', form: '深进深块',
           mass: { F: 29, podiumNS: 8, podiumNW: 6, towerNS: 6, towerNW: 5, towerOff: 1 },
           trait: '29 层深进深科研块，深蓝低透，四层石材裙' },
    /* 28F 阶梯收顶 */
    cj:  { glass: 'hd_g_cj',  podium: 3, crownStone: 1, setbackTop: 3, beltEvery: 0, family: '蓝灰竖向渐变', form: '阶梯收顶',
           mass: { F: 28, podiumNS: 10, podiumNW: 4, towerNS: 6, towerNW: 4, towerOff: 0, midFromTop: 7, midNS: 4, midNW: 3, crownNS: 3, crownNW: 3 },
           trait: '28 层阶梯收顶，蓝灰竖向渐变幕墙' },
    /* 25F 薄进深淡金板 */
    yl:  { glass: 'hd_g_yl',  podium: 2, crownStone: 0, setbackTop: 0, beltEvery: 0, glassCrown: 1, family: '淡金高档', form: '薄板',
           mass: { F: 25, podiumNS: 9, podiumNW: 3, towerNS: 5, towerNW: 3, towerOff: 2 },
           trait: '25 层薄进深淡金板，玻璃收顶' },
    /* 32F 高板 + 中段微收 */
    sl:  { glass: 'hd_g_sl',  podium: 3, crownStone: 2, setbackTop: 0, beltEvery: 5, family: '淡灰高透', form: '高板微收',
           mass: { F: 32, podiumNS: 10, podiumNW: 4, towerNS: 5, towerNW: 4, towerOff: 0, midFromTop: 8, midNS: 4, midNW: 4 },
           trait: '32 层高板微收，淡灰高透密格' },
    /* 27F 装饰艺术宽塔 + 收冠 */
    dl:  { glass: 'hd_g_dl',  podium: 4, crownStone: 2, setbackTop: 2, beltEvery: 0, family: '装饰艺术石材', form: '帝国大厦式宽塔',
           mass: { F: 27, podiumNS: 10, podiumNW: 5, towerNS: 7, towerNW: 4, towerOff: 1, crownNS: 4, crownNW: 3 },
           trait: '27 层帝国大厦式宽塔，米色石灰岩开窗，顶两层收冠' },
    /* 31F 双道收进办公 */
    yx:  { glass: 'hd_g_yx',  podium: 3, crownStone: 1, setbackTop: 3, beltEvery: 4, family: '淡蓝中透', form: '双道收进',
           mass: { F: 31, podiumNS: 11, podiumNW: 4, towerNS: 5, towerNW: 4, towerOff: 0, midFromTop: 6, midNS: 4, midNW: 3, crownNS: 3, crownNW: 3 },
           trait: '31 层双道收进，淡蓝中透' },
    /* 23F 矮胖科研块：刻意不修长 */
    yl2: { glass: 'hd_g_yl2', podium: 4, crownStone: 2, setbackTop: 0, beltEvery: 6, family: '米黄石材开窗', form: '矮胖科研块',
           mass: { F: 23, podiumNS: 10, podiumNW: 5, towerNS: 8, towerNW: 5, towerOff: 1 },
           trait: '23 层矮胖科研块，米黄石材开窗' },
  };
  root.HEDONG_TOWER_STYLE = STYLE;

  const FACE = {
    /* 淡蓝高透 */
    hd_g_yh:  { mode: 'glass', g: '#8eb8d0', hi: '#e4f4fc', lo: '#4a7a94', mull: '#f2f8fc', band: '#6a90a4', mulls: [0, 0.5, 1, 1.5, 2, 2.5], sp: 0.22, rails: [1.48], railH: 0.06, mullW: 0.07, alpha: 0.92 },
    /* 淡灰中透 */
    hd_g_hd:  { mode: 'glass', g: '#b0b8c0', hi: '#e8ecef', lo: '#6a727a', mull: '#f4f6f8', band: '#8a929a', mulls: [0, 1.5], sp: 0.32, rails: [1.35], railH: 0.22, mullW: 0.12, alpha: 0.78 },
    /* 深蓝低透 */
    hd_g_ls:  { mode: 'glass', g: '#2a4e72', hi: '#6a9aba', lo: '#152838', mull: '#9ab8cc', band: '#1e3a52', mulls: [0, 0.75, 1.5, 2.25], sp: 0.48, rails: [], mullW: 0.11, cap: [2.55, 2.96], capCol: '#c5ccd0', alpha: 0.55 },
    /* 蓝灰竖向渐变（按楼层 z 从淡蓝收到深蓝） */
    hd_g_cj:  { mode: 'grad', g0: '#a8c8dc', g1: '#2a5070', hi: '#dceef6', lo: '#1e3850', mull: '#eef6fa', band: '#3a5870', mulls: [0, 0.5, 1, 1.5, 2, 2.5], sp: 0.24, rails: [0.95, 1.85], railH: 0.07, mullW: 0.07, alpha: 0.8 },
    /* 淡金高档 */
    hd_g_yl:  { mode: 'glass', g: '#c4a86e', hi: '#f0e2b8', lo: '#7a6238', mull: '#f6ecd4', band: '#a88850', mulls: [0, 1.5], sp: 0.2, rails: [0.88, 1.92], railH: 0.2, mullW: 0.1, cap: [2.62, 2.96], capCol: '#5a4830', alpha: 0.85 },
    /* 淡灰高透 */
    hd_g_sl:  { mode: 'glass', g: '#c8d0d6', hi: '#f4f7fa', lo: '#7a848c', mull: '#ffffff', band: '#a8b0b8', mulls: [0, 0.5, 1, 1.5, 2, 2.5], sp: 0.28, rails: [], mullW: 0.07, cap: [2.58, 2.96], capCol: '#d0d4d0', alpha: 0.95 },
    /* 装饰艺术石灰岩开窗 */
    hd_g_dl:  { mode: 'masonry', body: '#d4c4a8', bodyLo: '#b8a888', joint: '#9a8a6e', win: '#3a5a6e', winHi: '#7aa0b4', sill: '#c8b898', crown: '#e8dcc8', punch: [[0.35, 0.55, 1.25, 2.35], [1.75, 0.55, 2.65, 2.35]], pier: true },
    /* 淡蓝中透 */
    hd_g_yx:  { mode: 'glass', g: '#6a9ab8', hi: '#c4e0f0', lo: '#3a6080', mull: '#e0eef6', band: '#5080a0', mulls: [0, 0.6, 1.2, 1.8, 2.4], sp: 0.3, rails: [1.5], railH: 0.1, mullW: 0.09, alpha: 0.72 },
    /* 米黄石材开窗 + 淡陶土腰 */
    hd_g_yl2: { mode: 'masonry', body: '#e2d2b4', bodyLo: '#c8b490', joint: '#a89070', win: '#4a6880', winHi: '#8ab0c4', sill: '#d8c8a8', crown: '#f0e6d0', terra: '#c48860', punch: [[0.4, 0.6, 1.2, 2.2], [1.8, 0.6, 2.6, 2.2]], beltZ: [1.15, 1.55] },
  };
  const GLASS_VARS = Object.keys(FACE);

  function shadeHex(hex, f) {
    const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f))));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  }
  function fillPane(ctx, o, x0, z0, x1, z1) {
    const W = root.SP && root.SP.world; if (!W || !W.local) return;
    const y = -0.06, SP = root.SP;
    ctx.beginPath();
    [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]].forEach((p, i) => {
      const w = W.local(o, p[0], p[1], p[2]);
      const X = SP.sx(w[0], w[1]), Y = SP.sy(w[0], w[1], w[2]);
      i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
    });
    ctx.closePath();
    ctx.fill();
  }
  function lerpHex(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ca = [(pa >> 16) & 255, (pa >> 8) & 255, pa & 255], cb = [(pb >> 16) & 255, (pb >> 8) & 255, pb & 255];
    const c = ca.map((v, i) => Math.max(0, Math.min(255, Math.round(v + (cb[i] - v) * t))));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  }
  function paintFace(ctx, o, alpha) {
    const s = FACE[o.variant]; if (!s) return;
    const west = o.rot === 6, col = (c) => (west && c && c[0] === '#' ? shadeHex(c, 0.84) : c);
    const a0 = alpha == null ? 1 : alpha;
    ctx.save(); ctx.globalAlpha = a0 * (s.alpha != null ? s.alpha : 1);
    const Q = (x0, z0, x1, z1, c) => { ctx.fillStyle = col(c); fillPane(ctx, o, x0, z0, x1, z1); };
    if (s.mode === 'masonry') {
      ctx.globalAlpha = a0;
      Q(-0.04, 0, 3.04, 3, s.body);
      Q(-0.04, 0, 3.04, 0.2, s.bodyLo);
      for (const z of [0.9, 1.7, 2.5]) Q(-0.04, z, 3.04, z + 0.04, s.joint);
      for (const x of [0, 1.5, 3]) Q(x - 0.02, 0.2, x + 0.04, 2.9, s.joint);
      if (s.terra && s.beltZ) Q(-0.04, s.beltZ[0], 3.04, s.beltZ[1], s.terra);
      for (const [x0, z0, x1, z1] of s.punch || []) {
        Q(x0, z0, x1, z1, o.state === 'ground' ? s.winHi : s.win);
        Q(x0, z0, x1, z0 + 0.08, s.sill);
        Q(x0, z1 - 0.06, x1, z1, s.crown);
      }
      if (s.pier) {
        Q(1.35, 0.2, 1.65, 2.9, shadeHex(s.body, 0.92));
        Q(-0.04, 2.72, 3.04, 2.96, s.crown);
      } else {
        Q(-0.04, 2.7, 3.04, 2.96, s.crown);
      }
      ctx.restore();
      return;
    }
    let gCol = s.g;
    if (s.mode === 'grad') {
      const floor = Math.max(0, Math.min(1, (o.z || 0) / 90));
      gCol = lerpHex(s.g0, s.g1, floor);
    }
    const fine = (s.mulls || []).length > 3;
    const members = (z0, z1) => {
      for (const x of s.mulls || []) {
        const w = s.mullW != null ? s.mullW : (fine && Math.abs(x % 1.5) < 0.01 ? 0.13 : 0.08);
        Q(x, z0, Math.min(3, x + w), z1, s.mull);
      }
    };
    Q(-0.04, 0, 3.04, 3, gCol);
    if (s.mode === 'grad') {
      /* 单层内再画两道竖向色带，强化渐变可读性 */
      const mid = lerpHex(s.g0, s.g1, Math.max(0, Math.min(1, ((o.z || 0) + 1.5) / 90)));
      Q(-0.04, 1.0, 3.04, 2.0, mid);
      Q(-0.04, 2.0, 3.04, 2.96, lerpHex(s.g0, s.g1, Math.max(0, Math.min(1, ((o.z || 0) + 2.5) / 90))));
    }
    if (o.state === 'ground') {
      Q(-0.04, 0, 3.04, 0.22, s.lo);
      Q(-0.04, 2.7, 3.04, 2.96, s.band);
      Q(0, 1.7, 3, 2.68, s.hi);
      members(0.22, 2.7);
    } else {
      const z1 = s.cap ? s.cap[0] : 2.96;
      Q(-0.04, 0, 3.04, s.sp, s.band);
      if (!s.belt && z1 > 1.9) Q(0.08, 1.92, 2.92, z1, s.hi);
      if (s.belt) Q(-0.04, s.belt[0], 3.04, s.belt[1], s.beltCol);
      if (s.cap) Q(-0.04, s.cap[0], 3.04, 2.96, s.capCol);
      for (const z of s.rails || []) {
        const h = s.railH || 0.08;
        if (z + h < z1) Q(-0.04, z, 3.04, z + h, s.mull);
      }
      members(s.sp, z1);
    }
    ctx.restore();
  }
  function paintNight(ctx, o, alpha) {
    const s = FACE[o.variant] || FACE.hd_g_hd;
    const a = alpha == null ? 1 : alpha;
    if (s.mode === 'masonry') {
      const hot = 'rgba(255,220,160,' + (0.75 * a) + ')', dim = 'rgba(240,200,140,' + (0.5 * a) + ')';
      const pane = (x0, z0, x1, z1, c) => { ctx.fillStyle = c; fillPane(ctx, o, x0, z0, x1, z1); };
      for (const [x0, z0, x1, z1] of s.punch || []) pane(x0 + 0.05, z0 + 0.1, x1 - 0.05, z1 - 0.1, (x0 < 1.5) ? hot : dim);
      return;
    }
    const hot = 'rgba(214,230,240,' + (0.88 * a) + ')', dim = 'rgba(200,220,232,' + (0.7 * a) + ')';
    const pane = (x0, z0, x1, z1, c) => { ctx.fillStyle = c; fillPane(ctx, o, x0, z0, x1, z1); };
    if (o.state === 'ground') { pane(0.2, 0.35, 2.8, 2.4, 'rgba(214,230,240,' + (0.42 * a) + ')'); return; }
    const step = (s.mulls || []).length > 4 ? 0.5 : ((s.mulls || []).length > 2 ? 0.75 : 1.5);
    const phase = (root.SP.strHash(o.id) || 0) % 2;
    for (let i = 0; i < Math.floor(3 / step); i++) for (let j = 0; j < 3; j++) {
      if ((i + j + phase) % 2) continue;
      const x0 = i * step + 0.12, z0 = 0.5 + j * 0.7;
      pane(x0, z0, Math.min(2.88, x0 + step * 0.55), z0 + 0.42, (i + j) % 3 ? hot : dim);
    }
  }
  function glassOn(o) {
    const SP = root.SP, W = SP && SP.world;
    if (!o || !o.hdGlass || !SP || !SP.tint || SP.tint.night <= 0.35 || (W && W.interior)) return false;
    if (o.state === 'ground') return true;
    if (o.state !== 'upper' || !o.night_lit) return false;
    const c = SP.clock;
    return !c || SP.windowLitAt(o.id, c.day, c.min);
  }
  function installHooks() {
    const SP = root.SP; if (!SP) return;
    const W = SP.world;
    if (W && W.shownState && !W._hdGlassShown) {
      const shown0 = W.shownState;
      W.shownState = function (o) {
        if (o && o.hdGlass && o.state === 'upper' && glassOn(o)) return 'lit';
        return shown0.call(W, o);
      };
      W._hdGlassShown = 1;
    }
    const H = SP.households;
    if (H && H.paneFacade && H.drawPane && !H._hdGlassPane) {
      const pane0 = H.paneFacade, draw0 = H.drawPane;
      H.paneFacade = function (o) {
        const hit = pane0.apply(this, arguments);
        if (hit) return hit;
        return glassOn(o) ? { hdGlass: 1 } : null;
      };
      H.drawPane = function (ctx, d, alpha, emission) {
        if (d && d.o && d.o.hdGlass && FACE[d.o.variant]) {
          const a = alpha == null ? 1 : alpha;
          if (!emission) { paintFace(ctx, d.o, a); return true; }
          if (glassOn(d.o)) { paintNight(ctx, d.o, a); return true; }
          return false;
        }
        return draw0.apply(this, arguments);
      };
      H._hdGlassPane = 1;
    }
  }
  function aliasGlassFrames() {
    const SP = root.SP, K = SP && SP.K; if (!K || !K.frames) return;
    const piece = K.pieces && K.pieces.f_wall;
    if (piece) {
      piece.variants = piece.variants || ['base'];
      for (const v of GLASS_VARS) if (!piece.variants.includes(v)) piece.variants.push(v);
    }
    for (const v of GLASS_VARS) for (const st of ['upper', 'ground']) for (const rot of [0, 6]) {
      const src = 'f_wall/hd_glass/main/' + st + '/' + rot, dst = 'f_wall/' + v + '/main/' + st + '/' + rot;
      if (K.frames[src]) K.frames[dst] = K.frames[src];
      if (K.masks && K.masks[src]) K.masks[dst] = K.masks[src];
    }
  }
  installHooks();
  if (root.SP && root.SP.load && !root.SP._hdGlassAlias) {
    const load0 = root.SP.load;
    root.SP.load = function () {
      const ret = load0.apply(this, arguments);
      const done = () => { try { aliasGlassFrames(); installHooks(); } catch (e) { console.warn('hd glass', e); } };
      return ret && typeof ret.then === 'function' ? ret.then((r) => { done(); return r; }) : (done(), ret);
    };
    root.SP._hdGlassAlias = 1;
  }
  const Ly = root.SP && root.SP.layers;
  if (Ly && Ly.checkLit && !Ly._hdGlassLit) {
    const prev = Ly.checkLit;
    const cache = { objs: null, n: -1, list: [] };
    function checkGlass() {
      const W = root.SP && root.SP.world;
      if (!W || W.interior) return;
      if (cache.objs !== W.objects || cache.n !== W.objects.length) {
        cache.objs = W.objects; cache.n = W.objects.length;
        cache.list = W.objects.filter((o) => o.hdGlass);
      }
      for (const o of cache.list) {
        const s = W.shownState(o);
        if (o._hdLit !== s) {
          if (o._hdLit !== undefined) (Ly.refreshObj ? Ly.refreshObj(o) : Ly.invalidate());
          o._hdLit = s;
        }
      }
    }
    Ly.checkLit = function () { const r = prev.apply(Ly, arguments); checkGlass(); return r; };
    Ly._hdGlassLit = 1;
  }
})(typeof window !== 'undefined' ? window : globalThis);
