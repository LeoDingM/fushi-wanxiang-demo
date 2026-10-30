/* 南埠 / 月河区 Site183：港西与港岸东延人行道补树灯椅（质量修补）。
 * 仍单色玻璃≥5 矮/中层库存已耗尽（仅余学校）；可盖空档只剩路、步行缝、公园、学校和别墅院。
 * Site181 已补南堤与港东（y−110 x1060–1320）；Site182 已补滨海 y−160 / y−190。
 * 这一刀补港西 y−110 / y−130（x580–1000）与港岸东延 y−110 / y−130（x1280–1680）。
 * 不补楼，不进月河、不进山，不动渔村老街和山前小学。没有 438 m 塔。
 * 树种银杏/樟/樱，灯和长椅让开楼、路、水面和老街。地名未经确认。 */
(function () {
  'use strict';
  var D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10ay || D.rongqiaoExpandP10az || !N.expansionP10) return;
  D.rongqiaoExpandP10az = 1;
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
    throw new Error('site183 no chunk ' + x + ',' + y);
  }
  var bags = {}, added = {};
  function put(id, type, x, y, more) {
    var o = Object.assign({ id: 'rqp10az_' + id, type: type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
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
  /* 东月路 / 澜东路 / 港东路缝 */
  var ROADS = [
    [1000, -220, 1040, 40],
    [1240, -220, 1280, 40],
    [1368, -220, 1384, 40],
    [1518, -220, 1538, 40]
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
  var bands = { gw: 0, gs: 0, ge: 0, ges: 0, gx: 0 };
  var FG = 'rqe_p10az_walk';

  function tryTree(tag, x, y) {
    if (onRoad(x, y) || inOldStreet(x, y) || inWater(x, y) || insideFoot(x, y, 1.8)) return false;
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
    if (onRoad(x, y) || inOldStreet(x, y) || inWater(x, y) || insideFoot(x, y, 0.8)) return;
    if (nearLamp(x, y) || tileAt(x, y) !== 'S') return;
    var o2 = put('lamp_' + tag + '_' + Math.round(x) + '_' + Math.round(y), 'p_lamp', x, y, {
      interact: 'lamp', fade_group: FG
    });
    lampsNear.push(o2);
    lamps++;
  }
  function tryBench(tag, x, y) {
    if (onRoad(x, y) || inOldStreet(x, y) || inWater(x, y) || insideFoot(x, y, 0.8)) return;
    if (tileAt(x, y) !== 'S') return;
    put('bench_' + tag + '_' + Math.round(x) + '_' + Math.round(y), 'community_bench', x, y, {
      rot: 0, fade_group: FG
    });
    benches++;
  }

  /* 港西：Site181 港东（x1060–1320 @ y−110）以西；南堤与滨海之间的港岸铺装。 */
  var x, planted;
  for (x = 580; x <= 1000; x += 32) {
    planted = tryTree('gw', x, -110);
    if (planted) tryBench('gw', x + 14, -110);
  }
  for (x = 580; x <= 1000; x += 40) {
    planted = tryTree('gs', x, -130);
    if (planted) tryLamp('gs', x + 14, -130);
  }
  /* 港岸东延：港东带以东到澜海前，同 y−110 / y−130。 */
  for (x = 1340; x <= 1680; x += 32) {
    planted = tryTree('ge', x, -110);
    if (planted) tryBench('ge', x + 14, -110);
  }
  for (x = 1280; x <= 1680; x += 40) {
    planted = tryTree('ges', x, -130);
    if (planted) tryLamp('ges', x + 14, -130);
  }
  /* 港西 y−122 错位补密。 */
  for (x = 600; x <= 980; x += 48) {
    planted = tryTree('gx', x, -122);
    if (planted) {
      tryLamp('gx', x + 18, -122);
      if ((x / 48) % 2 < 1) tryBench('gx', x + 28, -122);
    }
  }

  if (trees < 16 || bands.gw < 4 || bands.gs < 5 || bands.ge < 3 || bands.ges < 5 || bands.gx < 1 || lamps < 6 || benches < 4) {
    throw new Error('site183 walk ' + trees + ' ' + JSON.stringify(bands) + ' ' + lamps + ' ' + benches);
  }

  var id, list, next;
  for (id in bags) {
    if (!Object.prototype.hasOwnProperty.call(bags, id)) continue;
    list = bags[id];
    if (!CH[id]) throw new Error('site183 missing chunk ' + id);
    next = (CH[id].objects || []).concat(list);
    if (next.length > 2600) throw new Error('site183 chunk cap ' + id + ' ' + next.length);
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
  if (wet.length) throw new Error('site183 water ' + wet.join(','));
  if (tileAt(1200, 400) !== 'K') throw new Error('site183 concrete');
  if (tileAt(1328, 422) !== 'G' || tileAt(1460, 418) !== 'G' || tileAt(600, 370) !== 'G') throw new Error('site183 grass');
  if (tileAt(700, -110) !== 'S' || tileAt(800, -130) !== 'S' || tileAt(1500, -110) !== 'S') throw new Error('site183 sidewalk');
  if (tileAt(400, 400) === 'G') { /* mountain seal stays non-grass buildable */ }

  var counts = {}, nAdd;
  for (id in added) {
    if (!Object.prototype.hasOwnProperty.call(added, id)) continue;
    nAdd = added[id];
    counts[id] = { added: nAdd, total: CH[id].objects.length };
  }

  P.site183 = {
    unconfirmed: true,
    choice: 'quality',
    walk: {
      trees: trees,
      lamps: lamps,
      benches: benches,
      bands: bands,
      fronts: [
        [560, -114, 1020, -106],
        [560, -134, 1020, -126],
        [1260, -114, 1700, -106],
        [1260, -134, 1700, -126],
        [580, -126, 1000, -118]
      ]
    },
    counts: counts,
    cap: 120
  };
  P.reasons = P.reasons || {};
  P.reasons.site183 = 'Site183：港西与港岸东延人行道补树灯椅。仍单色玻璃≥5 矮/中层库存已耗尽（仅余学校）；扫过空档，剩下的是路、步行缝、公园、学校和别墅院，没有能再放下几栋的配套地，所以不补楼。Site181 已补南堤与港东，Site182 已补滨海；这一刀改补港西 y−110 / y−130（x580–1000）与港岸东延 y−110 / y−130（x1280–1680）原先几乎没有树的铺装，补了银杏、樟和樱，灯和长椅让开楼、路、水面和渔村老街。不进月河、不进山、不进澜海，不把南埠往 y-1540 以南推。北界仍是 y432。山前小学、东月小学、月津小学、山麓小学、渔村老街、石驳岸、柳口居不动。没有 438 m 塔。地名未经确认。';
  root.SITE183 = P.site183;
})();
