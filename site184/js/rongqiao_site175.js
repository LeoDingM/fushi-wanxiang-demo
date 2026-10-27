/* 南埠 / 月河区 Site175：十七栋仍单色矮住宅立面拉开（第二色玻璃）。
 * 不补楼，不进月河、不进山，不动渔村老街和山前小学。没有 438 m 塔。
 * 目标：Site174 之后仍单色的高可见度矮住宅（F=3，玻璃≥5）。
 * 招牌玻璃留着。跳过学校与过薄玻璃。
 * 立面节奏：collar / collarbeam / colonnette / cordon / cortile / cove / cradle /
 * crenel / crest / crib / crossbeam / crossbrace / cupola / curb / curtain /
 * dais / dripstone。 */
(function () {
  'use strict';
  var D = window.SCENE_DATA, N = window.RONGQIAO_NORTH;
  if (!D || !N || !D.rongqiaoExpandP10aq || D.rongqiaoExpandP10ar) return;
  D.rongqiaoExpandP10ar = 1;
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
        var nLen = g.length <= 1 ? groups.length : g.length;
        if (rhythm === 'collar') {
          if (idx % 4 === 2) toStone(o);
          else if (idx % 4 === 0) toGlass(o, alt);
        } else if (rhythm === 'collarbeam') {
          if (idx === 1 || idx === nLen - 2) toStone(o);
          else if (idx % 3 === 0) toGlass(o, alt);
        } else if (rhythm === 'colonnette') {
          if (idx % 5 === 2) toStone(o);
          else if (idx % 5 === 0) toGlass(o, alt);
        } else if (rhythm === 'cordon') {
          if (idx % 3 === 2) toStone(o);
          else if (idx % 3 === 0) toGlass(o, alt);
        } else if (rhythm === 'cortile') {
          if (idx < 1 || idx >= nLen - 1) toStone(o);
          else if (idx % 2 === 0) toGlass(o, alt);
        } else if (rhythm === 'cove') {
          if (idx % 4 === 1) toStone(o);
          else if (idx % 4 === 3) toGlass(o, warm);
        } else if (rhythm === 'cradle') {
          if (idx % 4 === 0 || idx % 4 === 2) toStone(o);
          else toGlass(o, alt);
        } else if (rhythm === 'crenel') {
          if (idx % 5 === 3) toStone(o);
          else if (idx % 5 === 1) toGlass(o, alt);
        } else if (rhythm === 'crest') {
          if (idx === Math.floor(nLen / 3)) toStone(o);
          else if (idx % 3 === 1) toGlass(o, alt);
        } else if (rhythm === 'crib') {
          if (idx % 6 === 2) toStone(o);
          else if (idx % 6 === 4) toGlass(o, alt);
        } else if (rhythm === 'crossbeam') {
          if (idx % 4 === 3) toStone(o);
          else if (idx % 4 === 1) toGlass(o, alt);
        } else if (rhythm === 'crossbrace') {
          if ((idx % 2 === 0) === (i % 2 === 0)) toStone(o);
          else if (idx % 3 === 1) toGlass(o, alt);
        } else if (rhythm === 'cupola') {
          if (idx % 5 === 0) toStone(o);
          else if (idx % 5 === 2) toGlass(o, alt);
        } else if (rhythm === 'curb') {
          if (idx >= nLen - 1) toStone(o);
          else if (idx % 4 === 2) toGlass(o, alt);
        } else if (rhythm === 'curtain') {
          if (idx % 3 === 0) toStone(o);
          else if (idx % 3 === 1) toGlass(o, warm);
        } else if (rhythm === 'dais') {
          if (idx % 5 === 4) toStone(o);
          else if (idx % 5 === 1) toGlass(o, alt);
        } else if (rhythm === 'dripstone') {
          if (idx % 3 === 1) toStone(o);
          else if (idx % 3 === 0) toGlass(o, alt);
        }
      }
    }
  }

  /* Site174 之后仍单色：高可见度矮住宅（跳过学校、过薄玻璃） */
  var AMENITIES = [
    { id: 'rqe_p10m_h84', name: '岸湾居', rhythm: 'collar', glass: 'hd_g_yl2' },
    { id: 'rqe_p10p_h23', name: '柏津居', rhythm: 'collarbeam', glass: 'hd_g_yh' },
    { id: 'rqe_p10o_h168', name: '潮南居', rhythm: 'colonnette', glass: 'hd_g_qp' },
    { id: 'rqe_p10o_h47', name: '橙西居', rhythm: 'cordon', glass: 'hd_g_qp' },
    { id: 'rqe_p10m_h102', name: '荻北居', rhythm: 'cortile', glass: 'hd_g_yl2' },
    { id: 'rqe_p10o_h251', name: '荻口居', rhythm: 'cove', glass: 'hd_g_wm' },
    { id: 'rqe_p10p_h17', name: '桂津居', rhythm: 'cradle', glass: 'hd_g_yl' },
    { id: 'rqe_p10m_h118', name: '海口居', rhythm: 'crenel', glass: 'hd_g_sl' },
    { id: 'rqe_p10o_h83', name: '荷湾居', rhythm: 'crest', glass: 'hd_g_wm' },
    { id: 'rqe_p10o_h228', name: '槐南居', rhythm: 'crib', glass: 'hd_g_yx' },
    { id: 'rqe_p10m_h54', name: '霁口居', rhythm: 'crossbeam', glass: 'hd_g_yl2' },
    { id: 'rqe_p10o_h252', name: '津北居', rhythm: 'crossbrace', glass: 'hd_g_yx' },
    { id: 'rqe_p10q_h23', name: '菁津居', rhythm: 'cupola', glass: 'hd_g_dl' },
    { id: 'rqe_p10p_h29', name: '葵津居', rhythm: 'curb', glass: 'hd_g_hd' },
    { id: 'rqe_p10o_h263', name: '兰南居', rhythm: 'curtain', glass: 'hd_g_qp' },
    { id: 'rqe_p10o_h227', name: '岚南居', rhythm: 'dais', glass: 'hd_g_wm' },
    { id: 'rqe_p10o_h276', name: '苓口居', rhythm: 'dripstone', glass: 'hd_g_yx' }
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
    /* 矮立面节奏命中过稀时再补一拍，保证 changed≥2 */
    (function () {
      var ch = 0, ii, alt3, still;
      for (ii = 0; ii < before.length; ii++) if (before[ii] !== walls[ii].variant) ch++;
      if (ch >= 2) return;
      alt3 = altOf(origin, spec.glass || origin);
      for (ii = glassWalls.length - 1; ii >= 0 && ch < 2; ii--) {
        if (glassWalls[ii].variant === origin) {
          still = 0;
          glassWalls.forEach(function (o) { if (o.variant === origin) still++; });
          if (still <= minKept) break;
          toGlass(glassWalls[ii], alt3);
          ch++;
        }
      }
      if (ch < 2) {
        for (ii = 0; ii < walls.length && ch < 2; ii++) {
          if (walls[ii].variant === 'hd_stone' && before[ii] && String(before[ii]).indexOf('hd_g_') === 0) {
            toGlass(walls[ii], alt3);
            ch++;
          }
        }
      }
    })();
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
      throw new Error('site175 rhythm ' + spec.id + ' ' + spec.rhythm + ' ' + changed + ' ' + kept + ' ' + Object.keys(glassVars).length + ' ' + Object.keys(variants).join(','));
    }
    notes.push({
      id: spec.id, name: b.name || spec.name, rhythm: spec.rhythm, glass: spec.glass || origin,
      F: b.F, x: x, y: y, changed: changed, kept: kept,
      variants: Object.keys(variants).length, glassVars: Object.keys(glassVars).length
    });
  }

  P.site175 = {
    unconfirmed: true,
    choice: 'quality',
    amenities: notes,
    skipped: skipped,
    rhythms: notes.map(function (n) { return n.rhythm; }),
    counts: { amenities: notes.length, skipped: skipped.length }
  };
  P.reasons = P.reasons || {};
  P.reasons.site175 = 'Site175：十七栋仍单色矮住宅立面拉开（第二色玻璃）。岸湾居、柏津居、潮南居、橙西居、荻北居、荻口居、桂津居、海口居、荷湾居、槐南居、霁口居、津北居、菁津居、葵津居、兰南居、岚南居、苓口居。Site174 之后继续拆剩余矮住宅；玻璃面≥5，过薄跳过（含柳口居）；学校不动。不补楼，不进月河、不进山，南界仍约 -1540，北界 432。渔村老街、石驳岸、山前小学、东月小学、月津小学、山麓小学不动。没有 438 m 塔。地名未经确认。';
  window.SITE175 = P.site175;
})();
