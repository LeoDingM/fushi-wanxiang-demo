/* 南埠 / 月河区 Site162：十七栋仍单色 F=5 住宅立面拉开（第二色玻璃）。
 * 不补楼，不进月河、不进山，不动渔村老街和山前小学。没有 438 m 塔。
 * 目标：Site161 之后仍单色的高可见度 F=5（港三排 / 山前 / 北岸 / 南堤）。
 * 立面节奏：lattice / ribbon / panel / lintel / cascade / mullion / frieze / plinth /
 * bay / oriel / spandrel / fascia / cornice / quoin / dado / trellis / lantern。 */
(function () {
  'use strict';
  var D = window.SCENE_DATA, N = window.RONGQIAO_NORTH;
  if (!D || !N || !D.rongqiaoExpandP10ad || D.rongqiaoExpandP10ae) return;
  D.rongqiaoExpandP10ae = 1;
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
    var groups = groupsOf(walls), g, i, j, o, alt = altOf(origin, glass), warm = WARM[origin] || 'hd_g_hd';
    for (i = 0; i < groups.length; i++) {
      g = groups[i];
      for (j = 0; j < g.length; j++) {
        o = g[j];
        if (typeof o.variant !== 'string' || o.variant.indexOf('hd_g_') !== 0) continue;
        if (rhythm === 'lattice') {
          if (j % 4 === 0) toStone(o);
          else if (j % 4 === 2) toGlass(o, alt);
        } else if (rhythm === 'ribbon') {
          if (j % 5 === 0 || j % 5 === 1) toStone(o);
          else if (j % 5 === 3) toGlass(o, alt);
        } else if (rhythm === 'panel') {
          if (j === 0 || j === g.length - 1) toStone(o);
          else if (j % 2 === 0) toGlass(o, alt);
        } else if (rhythm === 'lintel') {
          if (j < 1 || j >= g.length - 1) toStone(o);
          else if (j % 3 === 0) toGlass(o, alt);
        } else if (rhythm === 'cascade') {
          if (j < Math.floor(g.length / 4)) toStone(o);
          else if (j % 3 === 1) toGlass(o, alt);
        } else if (rhythm === 'mullion') {
          if (j % 3 === 1) toStone(o);
          else if (j % 3 === 0) toGlass(o, alt);
        } else if (rhythm === 'frieze') {
          if (j % 6 === 0 || j % 6 === 5) toStone(o);
          else if (j % 6 === 2) toGlass(o, alt);
        } else if (rhythm === 'plinth') {
          if (j < 3) toStone(o);
          else if (j % 2 === 1) toGlass(o, alt);
        } else if (rhythm === 'bay') {
          if (j % 4 === 1 || j % 4 === 2) toStone(o);
          else if (j % 4 === 0) toGlass(o, alt);
        } else if (rhythm === 'oriel') {
          if (j === Math.floor(g.length / 3) || j === Math.floor((2 * g.length) / 3)) toStone(o);
          else if (j % 2 === 0) toGlass(o, alt);
        } else if (rhythm === 'spandrel') {
          if (j % 5 === 2) toStone(o);
          else if (j % 5 === 4) toGlass(o, warm);
        } else if (rhythm === 'fascia') {
          if (j % 2 === 1) toStone(o);
          else toGlass(o, alt);
        } else if (rhythm === 'cornice') {
          if (j >= g.length - 2) toStone(o);
          else if (j % 3 === 2) toGlass(o, alt);
        } else if (rhythm === 'quoin') {
          if (j === 0 || j === 1 || j === g.length - 1 || j === g.length - 2) toStone(o);
          else if (j % 3 === 0) toGlass(o, alt);
        } else if (rhythm === 'dado') {
          if (j % 4 === 3) toStone(o);
          else if (j % 4 === 1) toGlass(o, warm);
        } else if (rhythm === 'trellis') {
          if ((j % 3 === 0) !== (i % 2 === 0)) toStone(o);
          else if (j % 2 === 0) toGlass(o, alt);
        } else if (rhythm === 'lantern') {
          if (j % 7 === 0 || j % 7 === 3) toStone(o);
          else if (j % 7 === 5) toGlass(o, alt);
        }
      }
    }
  }

  /* Site161 之后仍单色的高可见度 F=5：港三排 / 山前 / 北岸 / 南堤 */
  var HOMES = [
    { id: 'rqe_p10m_h67', name: '芹北居', rhythm: 'lattice', glass: 'hd_g_yh' },
    { id: 'rqe_p10m_h31', name: '柏北居', rhythm: 'ribbon', glass: 'hd_g_qp' },
    { id: 'rqe_p10k_h13', name: '棠西居', rhythm: 'panel', glass: 'hd_g_sl' },
    { id: 'rqe_p10m_h63', name: '银口居', rhythm: 'lintel', glass: 'hd_g_yl2' },
    { id: 'rqe_p10m_h107', name: '菱北居', rhythm: 'cascade', glass: 'hd_g_yx' },
    { id: 'rqe_p10m_h27', name: '菁北居', rhythm: 'mullion', glass: 'hd_g_yl2' },
    { id: 'rqe_p10m_h51', name: '桃北居', rhythm: 'frieze', glass: 'hd_g_yl2' },
    { id: 'rqe_p10m_h83', name: '泉口居', rhythm: 'plinth', glass: 'hd_g_yx' },
    { id: 'rqe_p10k_h9', name: '藕西居', rhythm: 'bay', glass: 'hd_g_yx' },
    { id: 'rqe_p10m_h39', name: '霞口居', rhythm: 'oriel', glass: 'hd_g_yl2' },
    { id: 'rqe_p10m_h87', name: '苇北居', rhythm: 'spandrel', glass: 'hd_g_yl2' },
    { id: 'rqe_p10m_h43', name: '澜口居', rhythm: 'fascia', glass: 'hd_g_yh' },
    { id: 'rqe_p10o_h62', name: '芦西居', rhythm: 'cornice', glass: 'hd_g_yl2' },
    { id: 'rqe_p10o_h74', name: '荻湾居', rhythm: 'quoin', glass: 'hd_g_dl' },
    { id: 'rqe_p10o_h86', name: '樱西居', rhythm: 'dado', glass: 'hd_g_yl2' },
    { id: 'rqe_p10o_h98', name: '棠湾居', rhythm: 'trellis', glass: 'hd_g_dl' },
    { id: 'rqe_p10o_h122', name: '苇南居', rhythm: 'lantern', glass: 'hd_g_dl' }
  ];

  var notes = [], skipped = [], i, spec, b, walls, glassWalls, origin, before, after, changed, kept, variants, glassVars, x, y;
  for (i = 0; i < HOMES.length; i++) {
    spec = HOMES[i];
    b = byId(spec.id);
    if (!b) { skipped.push({ id: spec.id, reason: 'missing' }); continue; }
    walls = wallsOf(spec.id);
    glassWalls = walls.filter(function (o) { return typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0; });
    if (glassWalls.length < 8) { skipped.push({ id: spec.id, reason: 'glass-too-thin', n: glassWalls.length }); continue; }
    origin = glassWalls[0].variant;
    before = walls.map(function (o) { return o.variant; });
    applyRhythm(walls, spec.rhythm, origin, spec.glass || origin);
    /* 保证至少保留 4 面原色玻璃 */
    kept = 0;
    glassWalls.forEach(function (o) { if (o.variant === origin) kept++; });
    if (kept < 4) {
      for (var gi = 0; gi < glassWalls.length && kept < 4; gi++) {
        if (glassWalls[gi].variant !== origin && before[walls.indexOf(glassWalls[gi])] === origin) {
          toGlass(glassWalls[gi], origin);
          kept++;
        }
      }
    }
    /* 保证第二色玻璃：优先把刚改成石材的原玻璃改成第二色，保住原色面数 */
    glassVars = {};
    glassWalls.forEach(function (o) {
      if (typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0) glassVars[o.variant] = 1;
    });
    if (Object.keys(glassVars).length < 2) {
      var alt2 = altOf(origin, spec.glass || origin), flipped = 0, wi, fj, stillKeep, kk;
      for (wi = 0; wi < walls.length && flipped < 4; wi++) {
        if (walls[wi].variant === 'hd_stone' && before[wi] && String(before[wi]).indexOf('hd_g_') === 0) {
          toGlass(walls[wi], alt2);
          flipped++;
        }
      }
      if (flipped < 2) {
        for (fj = glassWalls.length - 1; fj >= 0 && flipped < 4; fj--) {
          if (glassWalls[fj].variant === origin) {
            stillKeep = 0;
            for (kk = 0; kk < glassWalls.length; kk++) if (glassWalls[kk].variant === origin) stillKeep++;
            if (stillKeep <= 4 && flipped >= 2) break;
            if (stillKeep <= 2) break;
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
    if (changed < 4 || kept < 4 || Object.keys(glassVars).length < 2 || Object.keys(variants).length < 3) {
      throw new Error('site162 rhythm ' + spec.id + ' ' + spec.rhythm + ' ' + changed + ' ' + kept + ' ' + Object.keys(glassVars).length + ' ' + Object.keys(variants).join(','));
    }
    notes.push({
      id: spec.id, name: b.name || spec.name, rhythm: spec.rhythm, glass: spec.glass || origin,
      F: b.F, x: x, y: y, changed: changed, kept: kept,
      variants: Object.keys(variants).length, glassVars: Object.keys(glassVars).length
    });
  }

  P.site162 = {
    unconfirmed: true,
    choice: 'quality',
    homes: notes,
    skipped: skipped,
    rhythms: notes.map(function (n) { return n.rhythm; }),
    counts: { homes: notes.length, skipped: skipped.length }
  };
  P.reasons = P.reasons || {};
  P.reasons.site162 = 'Site162：十七栋仍单色 F=5 住宅拉开立面（第二色玻璃）。港三排（芹北居、柏北居、银口居、菱北居、菁北居、桃北居、泉口居、霞口居、苇北居、澜口居）+ 山前（棠西居、藕西居）+ 北岸（芦西居、荻湾居、樱西居、棠湾居）+ 南堤（苇南居）。不补楼，不进月河、不进山，南界仍约 -1540，北界 432。渔村老街、石驳岸、山前小学、柳口居（玻璃面过薄）不动。没有 438 m 塔。地名未经确认。';
  window.SITE162 = P.site162;
})();
