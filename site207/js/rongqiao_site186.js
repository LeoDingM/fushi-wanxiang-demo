/* 南埠 / 月河区 Site186：南堤·滨海余缝人行道补树灯椅（质量修补）。
 * 仍单色玻璃≥5 矮/中层库存已耗尽（仅余学校）；可盖空档只剩路、步行缝、公园、学校和别墅院。
 * Site181 已补南堤西/东主段与港东；Site182 已补滨海西/东主段；Site183 港西与港岸东延；Site184 山前路；Site185 河东岸。
 * 这一刀补 181/182 跳过的余缝：南堤西余 y−48 / y−36（x420–580）、南堤中段月河口 y−48 / y−36（x1040–1220）、
 * 南堤东余 y−48 / y−36（x1580–1700）、滨海中段 y−160 / y−190（x1040–1220）。
 * 只落在 S 铺装上；不改 Site146 月河石驳岸整面，不补楼，不进月河水面、不进山，不动渔村老街和小学。没有 438 m 塔。
 * 树种银杏/樟/樱，灯和长椅让开楼、路、水面、学校和老街。地名未经确认。 */
(function () {
  'use strict';
  var D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10bb || D.rongqiaoExpandP10bc || !N.expansionP10) return;
  D.rongqiaoExpandP10bc = 1;
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
    throw new Error('site186 no chunk ' + x + ',' + y);
  }
  var bags = {}, added = {};
  function put(id, type, x, y, more) {
    var o = Object.assign({ id: 'rqp10bc_' + id, type: type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
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
  /* 南堤 / 滨海南北向路口（东月路 / 澜东路 / 港东路及西段支路） */
  var ROADS = [
    [408, -220, 424, 20],
    [464, -220, 480, 20],
    [600, -220, 616, 20],
    [856, -220, 872, 20],
    [1000, -220, 1040, 20],
    [1240, -220, 1280, 20],
    [1368, -220, 1384, 20],
    [1518, -220, 1538, 20],
    [1688, -220, 1704, 20]
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
    /* 山前小学与体育馆；东月小学；月津小学；山麓小学。不进校园。 */
    if (x > 470 && x < 580 && y > 250 && y < 300) return true;
    if (x > 1340 && x < 1420 && y > 60 && y < 140) return true;
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
  var bands = { tw: 0, tm: 0, te: 0, bm: 0, bn: 0 };
  var FG = 'rqe_p10bc_walk';

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

  var x, planted;
  /* 南堤西余：Site181 从 x600 起，这一刀补老街以东、东月路以西的 y−48 / y−36。 */
  for (x = 420; x <= 580; x += 40) {
    planted = tryTree('tw', x, -48);
    if (planted) {
      tryLamp('tw', x + 14, -48);
      if ((x / 40) % 2 < 1) tryBench('tw', x + 22, -48);
    }
  }
  for (x = 440; x <= 560; x += 80) {
    planted = tryTree('tw', x, -36);
    if (planted) tryBench('tw', x + 14, -36);
  }
  /* 南堤中段月河口：Site181 跳过 x960–1280；让开东月路缝，落在 x1040–1220。 */
  for (x = 1040; x <= 1220; x += 40) {
    planted = tryTree('tm', x, -48);
    if (planted) {
      tryLamp('tm', x + 14, -48);
      if ((x / 40) % 2 < 1) tryBench('tm', x + 22, -48);
    }
  }
  for (x = 1060; x <= 1200; x += 80) {
    planted = tryTree('tm', x, -36);
    if (planted) tryBench('tm', x + 14, -36);
  }
  /* 南堤东余：Site181 到 x1560，这一刀补到澜海前。 */
  for (x = 1580; x <= 1700; x += 40) {
    planted = tryTree('te', x, -48);
    if (planted) {
      tryLamp('te', x + 14, -48);
      if ((x / 40) % 2 < 1) tryBench('te', x + 22, -48);
    }
  }
  for (x = 1600; x <= 1680; x += 80) {
    planted = tryTree('te', x, -36);
    if (planted) tryBench('te', x + 14, -36);
  }
  /* 滨海中段：Site182 跳过月河口 x960–1280；落在 x1040–1220 的 y−160 / y−190。 */
  for (x = 1040; x <= 1220; x += 40) {
    planted = tryTree('bm', x, -160);
    if (planted) {
      tryLamp('bm', x + 14, -160);
      if ((x / 40) % 2 < 1) tryBench('bm', x + 22, -160);
    }
  }
  for (x = 1060; x <= 1200; x += 80) {
    planted = tryTree('bn', x, -190);
    if (planted) {
      tryLamp('bn', x + 14, -190);
      tryBench('bn', x + 22, -190);
    }
  }

  if (trees < 16 || bands.tw < 3 || bands.tm < 4 || bands.te < 3 || bands.bm < 3 || bands.bn < 2 || lamps < 6 || benches < 4) {
    throw new Error('site186 walk ' + trees + ' ' + JSON.stringify(bands) + ' ' + lamps + ' ' + benches);
  }

  var id, list, next;
  for (id in bags) {
    if (!Object.prototype.hasOwnProperty.call(bags, id)) continue;
    list = bags[id];
    if (!CH[id]) throw new Error('site186 missing chunk ' + id);
    next = (CH[id].objects || []).concat(list);
    if (next.length > 2600) throw new Error('site186 chunk cap ' + id + ' ' + next.length);
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
  if (wet.length) throw new Error('site186 water ' + wet.join(','));
  if (tileAt(1200, 400) !== 'K') throw new Error('site186 concrete');
  if (tileAt(1328, 422) !== 'G' || tileAt(1460, 418) !== 'G' || tileAt(600, 370) !== 'G') throw new Error('site186 grass');
  if (tileAt(1120, -48) !== 'S' || tileAt(500, -48) !== 'S' || tileAt(1120, -160) !== 'S') throw new Error('site186 sidewalk');

  var counts = {}, nAdd;
  for (id in added) {
    if (!Object.prototype.hasOwnProperty.call(added, id)) continue;
    nAdd = added[id];
    counts[id] = { added: nAdd, total: CH[id].objects.length };
  }

  P.site186 = {
    unconfirmed: true,
    choice: 'quality',
    walk: {
      trees: trees,
      lamps: lamps,
      benches: benches,
      bands: bands,
      fronts: [
        [420, -52, 580, -32],
        [1040, -52, 1220, -32],
        [1580, -52, 1700, -32],
        [1040, -164, 1220, -156],
        [1040, -194, 1220, -186]
      ]
    },
    counts: counts,
    cap: 120
  };
  P.reasons = P.reasons || {};
  P.reasons.site186 = 'Site186：南堤·滨海余缝人行道补树灯椅。仍单色玻璃≥5 矮/中层库存已耗尽（仅余学校）；扫过空档，剩下的是路、步行缝、公园、学校和别墅院，没有能再放下几栋的配套地，所以不补楼。Site181 已补南堤西/东主段与港东，Site182 已补滨海西/东主段，Site183 港西与港岸东延，Site184 山前路，Site185 河东岸；这一刀改补 181/182 跳过的余缝——南堤西余 y−48 / y−36（x420–580）、南堤中段月河口 y−48 / y−36（x1040–1220）、南堤东余 y−48 / y−36（x1580–1700）、滨海中段 y−160 / y−190（x1040–1220）原先几乎没有树的 S 铺装，补了银杏、樟和樱，灯和长椅让开楼、路、水面、学校和渔村老街。只落在人行道铺装上，不改 Site146 月河石驳岸整面。不进月河水面、不进山、不进澜海，不把南埠往 y-1540 以南推。北界仍是 y432。山前小学、东月小学、月津小学、山麓小学、渔村老街、石驳岸、柳口居不动。没有 438 m 塔。地名未经确认。';
  root.SITE186 = P.site186;
})();
