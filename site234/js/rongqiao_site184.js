/* 南埠 / 月河区 Site184：山前路人行道补树灯椅（质量修补）。
 * 仍单色玻璃≥5 矮/中层库存已耗尽（仅余学校）；可盖空档只剩路、步行缝、公园、学校和别墅院。
 * Site181 已补南堤与港东；Site182 已补滨海 y−160 / y−190；Site183 已补港西与港岸东延 y−110 / y−130。
 * 这一刀补山前路 y320 / y350（西段 x580–980、中段 x1060–1220、东段 x1280–1660）原先几乎没有树的铺装。
 * 不补楼，不进月河、不进山，不动渔村老街和山前小学。没有 438 m 塔。
 * 树种银杏/樟/樱，灯和长椅让开楼、路、水面、学校和老街。地名未经确认。 */
(function () {
  'use strict';
  var D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10az || D.rongqiaoExpandP10ba || !N.expansionP10) return;
  D.rongqiaoExpandP10ba = 1;
  var P = N.expansionP10;
  var CH = root.SCENE_CHUNKS || {};

  function pickChunk(x, y) {
    var best = null, area = Infinity, i, c, r, a;
    for (i = 0; i < (D.chunks || []).length; i++) {
      c = D.chunks[i];
      r = c.rect;
      if (!r || x < r[0] || x >= r[2] || y < r[1] || y >= r[3]) continue;
      a = (r[2] - r[0]) * (r[3] - r[1]);
      if (a < area && CH[c.id]) { area = a; best = c.id; }
    }
    if (best) return best;
    throw new Error('site184 no chunk ' + x + ',' + y);
  }
  var bags = {}, added = {};
  function put(id, type, x, y, more) {
    var o = Object.assign({ id: 'rqp10ba_' + id, type: type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    var key = pickChunk(o.x, o.y);
    (bags[key] || (bags[key] = [])).push(o);
    added[key] = (added[key] || 0) + 1;
    return o;
  }

  var feet = [];
  for (var ci = 0; ci < (D.colliders || []).length; ci++) {
    if (D.colliders[ci] && D.colliders[ci].rect) feet.push(D.colliders[ci].rect);
  }
  function insideFoot(x, y, pad) {
    var i, r;
    for (i = 0; i < feet.length; i++) {
      r = feet[i];
      if (x > r[0] - pad && x < r[2] + pad && y > r[1] - pad && y < r[3] + pad) return true;
    }
    return false;
  }
  function inWater(x, y) {
    var i, w;
    for (i = 0; i < (N.water || []).length; i++) {
      w = N.water[i];
      if (w && x > w[0] && x < w[2] && y > w[1] && y < w[3]) return true;
    }
    return false;
  }
  var G = D.ground;
  function tileAt(x, y) {
    var c = Math.floor((x - G.origin[0]) / G.chunk), r = Math.floor((y - G.origin[1]) / G.chunk);
    var row = G.data_south_to_north[r];
    return row && row[c];
  }
  /* 山前路南北向路口（东月路 / 澜东路 / 港东路及西段支路） */
  var ROADS = [
    [408, 300, 424, 370],
    [464, 300, 480, 370],
    [600, 300, 616, 370],
    [856, 300, 872, 370],
    [1020, 300, 1040, 370],
    [1240, 300, 1280, 370],
    [1368, 300, 1384, 370],
    [1518, 300, 1538, 370],
    [1688, 300, 1704, 370]
  ];
  function onRoad(x, y) {
    var i, r;
    for (i = 0; i < ROADS.length; i++) {
      r = ROADS[i];
      if (x > r[0] && x < r[2] && y > r[1] && y < r[3]) return true;
    }
    return false;
  }
  function inOldStreet(x, y) {
    return x < 560 && y > -230 && y < -110;
  }
  function inSchool(x, y) {
    /* 山前小学与体育馆；山麓小学北界。不进校园。 */
    if (x > 470 && x < 580 && y > 250 && y < 300) return true;
    if (x > 1540 && x < 1620 && y > 380 && y < 420) return true;
    return false;
  }

  var treesNear = [], lampsNear = [];
  var chId, arr, oi, o;
  for (chId in CH) {
    if (!Object.prototype.hasOwnProperty.call(CH, chId)) continue;
    arr = (CH[chId] && CH[chId].objects) || [];
    for (oi = 0; oi < arr.length; oi++) {
      o = arr[oi];
      if (!o) continue;
      if (o.type === 'rq_x_tree') treesNear.push(o);
      if (o.type === 'p_lamp') lampsNear.push(o);
    }
  }
  function nearTree(x, y) {
    var i;
    for (i = 0; i < treesNear.length; i++) {
      if (Math.abs(treesNear[i].x - x) < 9 && Math.abs(treesNear[i].y - y) < 8) return true;
    }
    return false;
  }
  function nearLamp(x, y) {
    var i;
    for (i = 0; i < lampsNear.length; i++) {
      if (Math.abs(lampsNear[i].x - x) < 12 && Math.abs(lampsNear[i].y - y) < 10) return true;
    }
    return false;
  }

  var TREES = ['ginkgo', 'camphor', 'sakura'];
  var trees = 0, lamps = 0, benches = 0;
  var bands = { sw: 0, ss: 0, se: 0, ses: 0, sx: 0 };
  var FG = 'rqe_p10ba_walk';

  function tryTree(tag, x, y) {
    if (onRoad(x, y) || inOldStreet(x, y) || inSchool(x, y) || inWater(x, y) || insideFoot(x, y, 1.8)) return false;
    if (nearTree(x, y) || tileAt(x, y) !== 'S') return false;
    var o2 = put('tr_' + tag + '_' + Math.round(x) + '_' + Math.round(y), 'rq_x_tree', x, y, {
      variant: TREES[trees % TREES.length], fade_group: FG
    });
    treesNear.push(o2);
    trees++;
    bands[tag]++;
    return true;
  }
  function tryLamp(tag, x, y) {
    if (onRoad(x, y) || inOldStreet(x, y) || inSchool(x, y) || inWater(x, y) || insideFoot(x, y, 0.8)) return;
    if (nearLamp(x, y) || tileAt(x, y) !== 'S') return;
    var o2 = put('lamp_' + tag + '_' + Math.round(x) + '_' + Math.round(y), 'p_lamp', x, y, {
      interact: 'lamp', fade_group: FG
    });
    lampsNear.push(o2);
    lamps++;
  }
  function tryBench(tag, x, y) {
    if (onRoad(x, y) || inOldStreet(x, y) || inSchool(x, y) || inWater(x, y) || insideFoot(x, y, 0.8)) return;
    if (tileAt(x, y) !== 'S') return;
    put('bench_' + tag + '_' + Math.round(x) + '_' + Math.round(y), 'community_bench', x, y, {
      rot: 0, fade_group: FG
    });
    benches++;
  }

  /* 山前西：山前路 y320 / y350，东月路以西。 */
  var x, planted;
  for (x = 580; x <= 980; x += 32) {
    planted = tryTree('sw', x, 320);
    if (planted) tryBench('sw', x + 14, 320);
  }
  for (x = 580; x <= 980; x += 40) {
    planted = tryTree('ss', x, 350);
    if (planted) tryLamp('ss', x + 14, 350);
  }
  /* 山前东：港东路以东到澜海前。 */
  for (x = 1280; x <= 1660; x += 32) {
    planted = tryTree('se', x, 320);
    if (planted) tryBench('se', x + 14, 320);
  }
  for (x = 1280; x <= 1660; x += 40) {
    planted = tryTree('ses', x, 350);
    if (planted) tryLamp('ses', x + 14, 350);
  }
  /* 山前中：东月路与港东路之间的山前路段。 */
  for (x = 1060; x <= 1220; x += 32) {
    planted = tryTree('sx', x, 320);
    if (planted) {
      tryLamp('sx', x + 14, 320);
      if ((x / 32) % 2 < 1) tryBench('sx', x + 22, 320);
    }
  }

  if (trees < 16 || bands.sw < 4 || bands.ss < 4 || bands.se < 3 || bands.ses < 3 || bands.sx < 1 || lamps < 6 || benches < 4) {
    throw new Error('site184 walk ' + trees + ' ' + JSON.stringify(bands) + ' ' + lamps + ' ' + benches);
  }

  var id, list, next;
  for (id in bags) {
    if (!Object.prototype.hasOwnProperty.call(bags, id)) continue;
    list = bags[id];
    if (!CH[id]) throw new Error('site184 missing chunk ' + id);
    next = (CH[id].objects || []).concat(list);
    if (next.length > 2600) throw new Error('site184 chunk cap ' + id + ' ' + next.length);
    CH[id].objects = next;
  }

  var wet = [], li, wi, w;
  for (id in bags) {
    if (!Object.prototype.hasOwnProperty.call(bags, id)) continue;
    list = bags[id];
    for (li = 0; li < list.length; li++) {
      for (wi = 0; wi < (N.water || []).length; wi++) {
        w = N.water[wi];
        if (w && list[li].x > w[0] && list[li].x < w[2] && list[li].y > w[1] && list[li].y < w[3]) wet.push(list[li].id);
      }
    }
  }
  if (wet.length) throw new Error('site184 water ' + wet.join(','));
  if (tileAt(1200, 400) !== 'K') throw new Error('site184 concrete');
  if (tileAt(1328, 422) !== 'G' || tileAt(1460, 418) !== 'G' || tileAt(600, 370) !== 'G') throw new Error('site184 grass');
  if (tileAt(700, 320) !== 'S' || tileAt(800, 350) !== 'S' || tileAt(1500, 320) !== 'S') throw new Error('site184 sidewalk');

  var counts = {}, nAdd;
  for (id in added) {
    if (!Object.prototype.hasOwnProperty.call(added, id)) continue;
    nAdd = added[id];
    counts[id] = { added: nAdd, total: CH[id].objects.length };
  }

  P.site184 = {
    unconfirmed: true,
    choice: 'quality',
    walk: {
      trees: trees,
      lamps: lamps,
      benches: benches,
      bands: bands,
      fronts: [
        [560, 316, 1000, 324],
        [560, 346, 1000, 354],
        [1260, 316, 1680, 324],
        [1260, 346, 1680, 354],
        [1040, 316, 1240, 324]
      ]
    },
    counts: counts,
    cap: 120
  };
  P.reasons = P.reasons || {};
  P.reasons.site184 = 'Site184：山前路人行道补树灯椅。仍单色玻璃≥5 矮/中层库存已耗尽（仅余学校）；扫过空档，剩下的是路、步行缝、公园、学校和别墅院，没有能再放下几栋的配套地，所以不补楼。Site181 已补南堤与港东，Site182 已补滨海，Site183 已补港西与港岸东延；这一刀改补山前路 y320 / y350（西段 x580–980、中段 x1060–1220、东段 x1280–1660）原先几乎没有树的铺装，补了银杏、樟和樱，灯和长椅让开楼、路、水面、学校和渔村老街。不进月河、不进山、不进澜海，不把南埠往 y-1540 以南推。北界仍是 y432。山前小学、东月小学、月津小学、山麓小学、渔村老街、石驳岸、柳口居不动。没有 438 m 塔。地名未经确认。';
  root.SITE184 = P.site184;
})();
