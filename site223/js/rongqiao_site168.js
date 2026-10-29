/* 南埠 / 月河区 Site168：十七栋仍单色配套与矮立面拉开（第二色玻璃）。
 * 不补楼，不进月河、不进山，不动渔村老街和山前小学。没有 438 m 塔。
 * 目标：Site167 之后厚玻璃仍单色住宅已尽；下一刀做高可见度配套（诊所/菜场/花店/茶铺/超市/面馆/社康）
 * 与玻璃≥5 的台地别墅矮立面。招牌玻璃留着。
 * 立面节奏：flute / chamfer / splay / keel / talon / beak / wave / ripple /
 * hatch / chevron / herringbone / diaper / stretcher / soldier / rowlock / header / stack。 */
(function () {
  'use strict';
  var D = window.SCENE_DATA, N = window.RONGQIAO_NORTH;
  if (!D || !N || !D.rongqiaoExpandP10aj || D.rongqiaoExpandP10ak) return;
  D.rongqiaoExpandP10ak = 1;
  var P = N.expansionP10;
  if (!P) return;
  var CH = window.SCENE_CHUNKS || {};
  var ALT = {
    hd_g_yh: 'hd_g_hd', hd_g_hd: 'hd_g_yh',
    hd_g_qp: 'hd_g_ls', hd_g_ls: 'hd_g_qp',
    hd_g_wm: 'hd_g_yx', hd_g_yx: 'hd_g_wm',
    hd_g_sl: 'hd_g_cj', hd_g_cj: 'hd_g_sl',
    hd_g_dl: 'hd_g_yl2', hd_g_yl2: 'hd_g_dl',
    hd_g_yl: 'hd_g_wm'
  };
  var WARM = {
    hd_g_yh: 'hd_g_hd', hd_g_qp: 'hd_g_hd', hd_g_ls: 'hd_g_hd', hd_g_wm: 'hd_g_hd',
    hd_g_yx: 'hd_g_hd', hd_g_sl: 'hd_g_hd', hd_g_cj: 'hd_g_hd', hd_g_hd: 'hd_g_yh',
    hd_g_dl: 'hd_g_yl', hd_g_yl2: 'hd_g_dl', hd_g_yl: 'hd_g_dl'
  };

  function byId(id) {
    var i, b, k, list;
    list = (N.buildings || []).concat(N.modernBuildings || []);
    for (i = 0; i < list.length; i++) { b = list[i]; if (b && b.id === id) return b; }
    for (k in P) {
      if (!Object.prototype.hasOwnProperty.call(P, k)) continue;
      b = P[k];
      if (!b || typeof b !== 'object') continue;
      if (b.id === id) return b;
      if (Array.isArray(b.buildings)) for (i = 0; i < b.buildings.length; i++) if (b.buildings[i] && b.buildings[i].id === id) return b.buildings[i];
      if (Array.isArray(b.towers)) for (i = 0; i < b.towers.length; i++) if (b.towers[i] && b.towers[i].id === id) return b.towers[i];
      if (Array.isArray(b.homes)) for (i = 0; i < b.homes.length; i++) if (b.homes[i] && b.homes[i].id === id) return b.homes[i];
      if (Array.isArray(b.shops)) for (i = 0; i < b.shops.length; i++) if (b.shops[i] && b.shops[i].id === id) return b.shops[i];
      if (Array.isArray(b.amenities)) for (i = 0; i < b.amenities.length; i++) if (b.amenities[i] && b.amenities[i].id === id) return b.amenities[i];
      if (Array.isArray(b)) for (i = 0; i < b.length; i++) if (b[i] && b[i].id === id) return b[i];
    }
    return null;
  }
  function wallsOf(id) {
    var out = [], k, o, arr, i;
    for (k in CH) {
      if (!Object.prototype.hasOwnProperty.call(CH, k)) continue;
      arr = (CH[k] && CH[k].objects) || [];
      for (i = 0; i < arr.length; i++) {
        o = arr[i];
        if (o && o.fade_group === id && o.type === 'f_wall' && o.state === 'upper' && o.variant !== 'hd_g_sign') out.push(o);
      }
    }
    return out;
  }
  function groupsOf(walls) {
    var m = Object.create(null), i, o, k, out = [], keys;
    for (i = 0; i < walls.length; i++) {
      o = walls[i];
      k = (o.face || '') + '|' + (o.side || '') + '|' + (typeof o.x === 'number' ? o.x.toFixed(1) : '') + '|' + (typeof o.y === 'number' ? o.y.toFixed(1) : '');
      if (!m[k]) m[k] = [];
      m[k].push(o);
    }
    keys = Object.keys(m);
    for (i = 0; i < keys.length; i++) out.push(m[keys[i]]);
    return out;
  }
  function toStone(o) { o.variant = 'hd_stone'; if (o.mat) o.mat = 'hd_stone'; }
  function toGlass(o, v) { o.variant = v; if (o.mat) o.mat = v; }
  function altOf(origin, glass) { return ALT[origin] || ALT[glass] || WARM[origin] || 'hd_g_hd'; }

  function applyRhythm(walls, rhythm, origin, glass) {
    var groups = groupsOf(walls), g, i, j, o, idx, alt = altOf(origin, glass), warm = WARM[origin] || 'hd_g_hd';
    for (i = 0; i < groups.length; i++) {
      g = groups[i];
      for (j = 0; j < g.length; j++) {
        o = g[j];
        if (typeof o.variant !== 'string' || o.variant.indexOf('hd_g_') !== 0) continue;
        /* 单格组用组序号，多格组用层序号，矮配套也能拉开 */
        idx = g.length <= 1 ? i : j;
        if (rhythm === 'flute') {
          if (idx % 4 === 0) toStone(o);
          else if (idx % 4 === 2) toGlass(o, alt);
        } else if (rhythm === 'chamfer') {
          if (idx % 5 === 0 || idx % 5 === 1) toStone(o);
          else if (idx % 5 === 3) toGlass(o, alt);
        } else if (rhythm === 'splay') {
          if (idx === 0 || idx === (g.length <= 1 ? groups.length : g.length) - 1) toStone(o);
          else if (idx % 2 === 0) toGlass(o, alt);
        } else if (rhythm === 'keel') {
          if (idx < 1 || idx >= (g.length <= 1 ? groups.length : g.length) - 1) toStone(o);
          else if (idx % 3 === 0) toGlass(o, alt);
        } else if (rhythm === 'talon') {
          if (idx < Math.floor((g.length <= 1 ? groups.length : g.length) / 4)) toStone(o);
          else if (idx % 3 === 1) toGlass(o, alt);
        } else if (rhythm === 'beak') {
          if (idx % 3 === 1) toStone(o);
          else if (idx % 3 === 0) toGlass(o, alt);
        } else if (rhythm === 'wave') {
          if (idx % 6 === 0 || idx % 6 === 5) toStone(o);
          else if (idx % 6 === 2) toGlass(o, alt);
        } else if (rhythm === 'ripple') {
          if (idx < 3) toStone(o);
          else if (idx % 2 === 1) toGlass(o, alt);
        } else if (rhythm === 'hatch') {
          if (idx % 4 === 1 || idx % 4 === 2) toStone(o);
          else if (idx % 4 === 0) toGlass(o, alt);
        } else if (rhythm === 'chevron') {
          if (idx === Math.floor((g.length <= 1 ? groups.length : g.length) / 3) || idx === Math.floor((2 * (g.length <= 1 ? groups.length : g.length)) / 3)) toStone(o);
          else if (idx % 2 === 0) toGlass(o, alt);
        } else if (rhythm === 'herringbone') {
          if (idx % 5 === 2) toStone(o);
          else if (idx % 5 === 4) toGlass(o, warm);
        } else if (rhythm === 'diaper') {
          if (idx % 2 === 1) toStone(o);
          else toGlass(o, alt);
        } else if (rhythm === 'stretcher') {
          var nSt = g.length <= 1 ? groups.length : g.length;
          if (idx >= nSt - 2) toStone(o);
          else if (idx % 3 === 2) toGlass(o, alt);
        } else if (rhythm === 'soldier') {
          var nSo = g.length <= 1 ? groups.length : g.length;
          if (idx === 0 || idx === 1 || idx === nSo - 1 || idx === nSo - 2) toStone(o);
          else if (idx % 3 === 0) toGlass(o, alt);
        } else if (rhythm === 'rowlock') {
          if (idx % 4 === 3) toStone(o);
          else if (idx % 4 === 1) toGlass(o, warm);
        } else if (rhythm === 'header') {
          if ((idx % 3 === 0) !== (i % 2 === 0)) toStone(o);
          else if (idx % 2 === 0) toGlass(o, alt);
        } else if (rhythm === 'stack') {
          if (idx % 7 === 0 || idx % 7 === 3) toStone(o);
          else if (idx % 7 === 5) toGlass(o, alt);
        }
      }
    }
  }

  /* Site167 之后仍单色：沿街配套 + 玻璃≥5 的台地矮立面（厚玻璃住宅已尽） */
  var AMENITIES = [
    { id: 'rqe_p10p_sk3', name: '岸南诊所', rhythm: 'flute', glass: 'hd_g_dl' },
    { id: 'rqe_p10p_h4', name: '海口菜店', rhythm: 'chamfer', glass: 'hd_g_yx' },
    { id: 'rqe_p10p_h32', name: '银湾花店', rhythm: 'splay', glass: 'hd_g_hd' },
    { id: 'rqe_p10p_m1', name: '津口菜场', rhythm: 'keel', glass: 'hd_g_wm' },
    { id: 'rqe_p10p_h8', name: '堤南茶铺', rhythm: 'talon', glass: 'hd_g_dl' },
    { id: 'rqe_p10p_h44', name: '风铃菜店', rhythm: 'beak', glass: 'hd_g_sl' },
    { id: 'rqe_p10p_mk', name: '澜东菜场', rhythm: 'wave', glass: 'hd_g_wm' },
    { id: 'rqe_p10p_sm', name: '岸南超市', rhythm: 'ripple', glass: 'hd_g_ls' },
    { id: 'rqe_p10o_h110', name: '月津面馆', rhythm: 'hatch', glass: 'hd_g_dl' },
    { id: 'rqe_p10a_clinic', name: '河东社康', rhythm: 'chevron', glass: 'hd_g_cj' },
    { id: 'rqe_p10p_h2', name: '月湾居', rhythm: 'herringbone', glass: 'hd_g_wm' },
    { id: 'rqe_p10o_h4', name: '台地居', rhythm: 'diaper', glass: 'hd_g_cj' },
    { id: 'rqe_p10n_v2', name: '山径二号', rhythm: 'stretcher', glass: 'hd_g_qp' },
    { id: 'rqe_p10o_tv3', name: '台地4号', rhythm: 'soldier', glass: 'hd_g_yl2' },
    { id: 'rqe_p10o_tv33', name: '台地34号', rhythm: 'rowlock', glass: 'hd_g_yl2' },
    { id: 'rqe_p10n_v4', name: '听澜别墅', rhythm: 'header', glass: 'hd_g_yl2' },
    { id: 'rqe_p10p_tv2', name: '台地错院', rhythm: 'stack', glass: 'hd_g_yh' }
  ];

  var notes = [], skipped = [], i, spec, b, walls, glassWalls, origin, before, after, changed, kept, variants, glassVars, x, y, minKept;
  for (i = 0; i < AMENITIES.length; i++) {
    spec = AMENITIES[i];
    b = byId(spec.id);
    if (!b) { skipped.push({ id: spec.id, reason: 'missing' }); continue; }
    walls = wallsOf(spec.id);
    glassWalls = walls.filter(function (o) { return typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0; });
    if (glassWalls.length < 5) { skipped.push({ id: spec.id, reason: 'glass-too-thin', n: glassWalls.length }); continue; }
    origin = glassWalls[0].variant;
    before = walls.map(function (o) { return o.variant; });
    applyRhythm(walls, spec.rhythm, origin, spec.glass || origin);
    minKept = glassWalls.length >= 8 ? 4 : 2;
    kept = 0;
    glassWalls.forEach(function (o) { if (o.variant === origin) kept++; });
    if (kept < minKept) {
      for (var gi = 0; gi < glassWalls.length && kept < minKept; gi++) {
        if (glassWalls[gi].variant !== origin && before[walls.indexOf(glassWalls[gi])] === origin) {
          toGlass(glassWalls[gi], origin);
          kept++;
        }
      }
    }
    glassVars = {};
    glassWalls.forEach(function (o) {
      if (typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0) glassVars[o.variant] = 1;
    });
    if (Object.keys(glassVars).length < 2) {
      var alt2 = altOf(origin, spec.glass || origin), flipped = 0, wi, fj, stillKeep, kk, stoneLeft;
      for (wi = 0; wi < walls.length && flipped < 4; wi++) {
        if (walls[wi].variant === 'hd_stone' && before[wi] && String(before[wi]).indexOf('hd_g_') === 0) {
          /* 至少留一面石材，保证 variants≥3 */
          stoneLeft = 0;
          for (kk = 0; kk < walls.length; kk++) if (walls[kk].variant === 'hd_stone') stoneLeft++;
          if (stoneLeft <= 1 && flipped >= 1) break;
          toGlass(walls[wi], alt2);
          flipped++;
        }
      }
      if (flipped < 1) {
        for (fj = glassWalls.length - 1; fj >= 0 && flipped < 2; fj--) {
          if (glassWalls[fj].variant === origin) {
            stillKeep = 0;
            for (kk = 0; kk < glassWalls.length; kk++) if (glassWalls[kk].variant === origin) stillKeep++;
            if (stillKeep <= minKept) break;
            toGlass(glassWalls[fj], alt2);
            flipped++;
          }
        }
      }
    }
    after = walls.map(function (o) { return o.variant; });
    changed = 0;
    for (var ci = 0; ci < before.length; ci++) if (before[ci] !== after[ci]) changed++;
    kept = 0;
    glassWalls.forEach(function (o) { if (o.variant === origin) kept++; });
    variants = {};
    walls.forEach(function (o) { variants[o.variant] = 1; });
    glassVars = {};
    glassWalls.forEach(function (o) {
      if (typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0) glassVars[o.variant] = 1;
    });
    x = typeof b.x0 === 'number' ? b.x0 : b.x;
    y = typeof b.y0 === 'number' ? b.y0 : b.y;
    if (changed < 2 || kept < minKept || Object.keys(glassVars).length < 2 || Object.keys(variants).length < 3) {
      throw new Error('site168 rhythm ' + spec.id + ' ' + spec.rhythm + ' ' + changed + ' ' + kept + ' ' + Object.keys(glassVars).length + ' ' + Object.keys(variants).join(','));
    }
    notes.push({
      id: spec.id, name: b.name || spec.name, rhythm: spec.rhythm, glass: spec.glass || origin,
      F: b.F, x: x, y: y, changed: changed, kept: kept,
      variants: Object.keys(variants).length, glassVars: Object.keys(glassVars).length
    });
  }

  P.site168 = {
    unconfirmed: true,
    choice: 'quality',
    amenities: notes,
    skipped: skipped,
    rhythms: notes.map(function (n) { return n.rhythm; }),
    counts: { amenities: notes.length, skipped: skipped.length }
  };
  P.reasons = P.reasons || {};
  P.reasons.site168 = 'Site168：十七栋仍单色配套与矮立面拉开（第二色玻璃）。沿街配套（岸南诊所、海口菜店、银湾花店、津口菜场、堤南茶铺、风铃菜店、澜东菜场、岸南超市、月津面馆、河东社康）+ 月湾居 / 台地居 + 山径台地矮立面（山径二号、台地4号、台地34号、听澜别墅、台地错院）。Site167 之后厚玻璃仍单色住宅已尽；玻璃面≥5，过薄跳过。不补楼，不进月河、不进山，南界仍约 -1540，北界 432。渔村老街、石驳岸、山前小学、东月小学、月津小学、山麓小学不动。没有 438 m 塔。地名未经确认。';
  window.SITE168 = P.site168;
})();
