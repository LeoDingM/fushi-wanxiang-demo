/* 南埠 / 月河区 Site169：十七栋仍单色配套与矮立面拉开（第二色玻璃）。
 * 不补楼，不进月河、不进山，不动渔村老街和山前小学。没有 438 m 塔。
 * 目标：Site168 之后仍单色的高可见度配套（菜场/幼儿园/杂货/面铺/茶铺/社康/文具/阅览）
 * 与玻璃≥5 的矮立面（邻里生鲜/干货/天街/叠院）。招牌玻璃留着。跳过山前小学体育馆与过薄玻璃。
 * 立面节奏：ashlar / bullnose / dogtooth / english / flemish / honeycomb / inlay / joggle /
 * knapped / laced / mosaic / offset / pierced / recessed / rusticated / sawtooth / tessera。 */
(function () {
  'use strict';
  var D = window.SCENE_DATA, N = window.RONGQIAO_NORTH;
  if (!D || !N || !D.rongqiaoExpandP10ak || D.rongqiaoExpandP10al) return;
  D.rongqiaoExpandP10al = 1;
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
        if (rhythm === 'ashlar') {
          if (idx % 4 === 0) toStone(o);
          else if (idx % 4 === 2) toGlass(o, alt);
        } else if (rhythm === 'bullnose') {
          if (idx % 5 === 0 || idx % 5 === 1) toStone(o);
          else if (idx % 5 === 3) toGlass(o, alt);
        } else if (rhythm === 'dogtooth') {
          if (idx === 0 || idx === (g.length <= 1 ? groups.length : g.length) - 1) toStone(o);
          else if (idx % 2 === 0) toGlass(o, alt);
        } else if (rhythm === 'english') {
          if (idx < 1 || idx >= (g.length <= 1 ? groups.length : g.length) - 1) toStone(o);
          else if (idx % 3 === 0) toGlass(o, alt);
        } else if (rhythm === 'flemish') {
          if (idx < Math.floor((g.length <= 1 ? groups.length : g.length) / 4)) toStone(o);
          else if (idx % 3 === 1) toGlass(o, alt);
        } else if (rhythm === 'honeycomb') {
          if (idx % 3 === 1) toStone(o);
          else if (idx % 3 === 0) toGlass(o, alt);
        } else if (rhythm === 'inlay') {
          if (idx % 6 === 0 || idx % 6 === 5) toStone(o);
          else if (idx % 6 === 2) toGlass(o, alt);
        } else if (rhythm === 'joggle') {
          if (idx < 3) toStone(o);
          else if (idx % 2 === 1) toGlass(o, alt);
        } else if (rhythm === 'knapped') {
          if (idx % 4 === 1 || idx % 4 === 2) toStone(o);
          else if (idx % 4 === 0) toGlass(o, alt);
        } else if (rhythm === 'laced') {
          if (idx === Math.floor((g.length <= 1 ? groups.length : g.length) / 3) || idx === Math.floor((2 * (g.length <= 1 ? groups.length : g.length)) / 3)) toStone(o);
          else if (idx % 2 === 0) toGlass(o, alt);
        } else if (rhythm === 'mosaic') {
          if (idx % 5 === 2) toStone(o);
          else if (idx % 5 === 4) toGlass(o, warm);
        } else if (rhythm === 'offset') {
          if (idx % 2 === 1) toStone(o);
          else toGlass(o, alt);
        } else if (rhythm === 'pierced') {
          var nSt = g.length <= 1 ? groups.length : g.length;
          if (idx >= nSt - 2) toStone(o);
          else if (idx % 3 === 2) toGlass(o, alt);
        } else if (rhythm === 'recessed') {
          var nSo = g.length <= 1 ? groups.length : g.length;
          if (idx === 0 || idx === 1 || idx === nSo - 1 || idx === nSo - 2) toStone(o);
          else if (idx % 3 === 0) toGlass(o, alt);
        } else if (rhythm === 'rusticated') {
          if (idx % 4 === 3) toStone(o);
          else if (idx % 4 === 1) toGlass(o, warm);
        } else if (rhythm === 'sawtooth') {
          if ((idx % 3 === 0) !== (i % 2 === 0)) toStone(o);
          else if (idx % 2 === 0) toGlass(o, alt);
        } else if (rhythm === 'tessera') {
          if (idx % 7 === 0 || idx % 7 === 3) toStone(o);
          else if (idx % 7 === 5) toGlass(o, alt);
        }
      }
    }
  }

  /* Site168 之后仍单色：沿街配套 + 玻璃≥5 的矮立面（跳过山前小学体育馆、过薄玻璃） */
  var AMENITIES = [
    { id: 'rqe_p10k_mk', name: '山前菜场', rhythm: 'ashlar', glass: 'hd_g_yh' },
    { id: 'rqe_p10j_hk', name: '滨海幼儿园', rhythm: 'bullnose', glass: 'hd_g_wm' },
    { id: 'rqe_p10k_kg', name: '山前幼儿园', rhythm: 'dogtooth', glass: 'hd_g_wm' },
    { id: 'rqe_hdg_mk', name: '石澜菜场', rhythm: 'english', glass: 'hd_g_cj' },
    { id: 'rqe_p10m_h5', name: '网寮杂货', rhythm: 'flemish', glass: 'hd_g_yx' },
    { id: 'rqe_p10m_h95', name: '潮西面铺', rhythm: 'honeycomb', glass: 'hd_g_yx' },
    { id: 'rqe_p10r_h15', name: '错缝茶铺', rhythm: 'inlay', glass: 'hd_g_hd' },
    { id: 'rqe_hdg_kg', name: '石澜幼儿园', rhythm: 'joggle', glass: 'hd_g_sl' },
    { id: 'rqe_p10j_sk', name: '滨海社康', rhythm: 'knapped', glass: 'hd_g_qp' },
    { id: 'rqe_p10r_sk', name: '港东社康', rhythm: 'laced', glass: 'hd_g_sl' },
    { id: 'rqe_p10h_st', name: '岸口文具', rhythm: 'mosaic', glass: 'hd_g_yx' },
    { id: 'rqe_p10s_sk', name: '山麓社康', rhythm: 'offset', glass: 'hd_g_hd' },
    { id: 'rqe_p10u_read', name: '台地阅览', rhythm: 'pierced', glass: 'hd_g_cj' },
    { id: 'rqe_p10a_fresh', name: '邻里生鲜', rhythm: 'recessed', glass: 'hd_g_yh' },
    { id: 'rqe_p10m_h20', name: '网口干货', rhythm: 'rusticated', glass: 'hd_g_qp' },
    { id: 'rqe_p10a_tj', name: '月河天街', rhythm: 'sawtooth', glass: 'hd_g_hd' },
    { id: 'rqe_p10t_uh2', name: '叠院', rhythm: 'tessera', glass: 'hd_g_hd' }
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
      throw new Error('site169 rhythm ' + spec.id + ' ' + spec.rhythm + ' ' + changed + ' ' + kept + ' ' + Object.keys(glassVars).length + ' ' + Object.keys(variants).join(','));
    }
    notes.push({
      id: spec.id, name: b.name || spec.name, rhythm: spec.rhythm, glass: spec.glass || origin,
      F: b.F, x: x, y: y, changed: changed, kept: kept,
      variants: Object.keys(variants).length, glassVars: Object.keys(glassVars).length
    });
  }

  P.site169 = {
    unconfirmed: true,
    choice: 'quality',
    amenities: notes,
    skipped: skipped,
    rhythms: notes.map(function (n) { return n.rhythm; }),
    counts: { amenities: notes.length, skipped: skipped.length }
  };
  P.reasons = P.reasons || {};
  P.reasons.site169 = 'Site169：十七栋仍单色配套与矮立面拉开（第二色玻璃）。沿街配套（山前菜场、滨海幼儿园、山前幼儿园、石澜菜场、网寮杂货、潮西面铺、错缝茶铺、石澜幼儿园、滨海社康、港东社康、岸口文具、山麓社康、台地阅览）+ 邻里生鲜 / 网口干货 / 月河天街 / 叠院。Site168 之后继续拆高可见度配套与矮立面；玻璃面≥5，过薄跳过（含柳口居）；山前小学体育馆不动。不补楼，不进月河、不进山，南界仍约 -1540，北界 432。渔村老街、石驳岸、山前小学、东月小学、月津小学、山麓小学不动。没有 438 m 塔。地名未经确认。';
  window.SITE169 = P.site169;
})();
