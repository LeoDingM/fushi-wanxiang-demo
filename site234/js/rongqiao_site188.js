/* 南埠 / 月河区 Site188：山前南·河东北夹缝人行道补树灯椅（质量修补）。
 * 仍单色玻璃≥5 矮/中层库存已耗尽（仅余学校）；可盖空档只剩路、步行缝、公园、学校和别墅院。
 * Site181–186 已补南堤/港东/滨海/港西/港岸东延/山前路/河东岸/南堤·滨海余缝人行道；Site187 已补井槐南沿底商店招。
 * 扫过剩余缺招牌门脸后只剩社康/社区工作站等零星几扇，这一刀改补山前路（y320）与河东岸（y240）之间
 * 原先几乎没有树的夹缝铺装：y260 / y280（西段 x580–980、中段 x1060–1220、东段 x1280–1660）。
 * 只落在 S 铺装上；不改 Site146 月河石驳岸整面，不补楼，不进月河水面、不进山，不动渔村老街和小学。没有 438 m 塔。
 * 树种银杏/樟/樱，灯和长椅让开楼、路、水面、学校和老街。地名未经确认。 */
(function () {
  'use strict';
  var D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10bd || D.rongqiaoExpandP10be || !N.expansionP10) return;
  D.rongqiaoExpandP10be = 1;
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
    throw new Error('site188 no chunk ' + x + ',' + y);
  }
  var bags = {}, added = {};
  function put(id, type, x, y, more) {
    var o = Object.assign({ id: 'rqp10be_' + id, type: type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
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
  /* 山前南 / 河东北夹缝南北向路口（东月路 / 澜东路 / 望月路 / 港东路及西段支路） */
  var ROADS = [
    [408, 240, 424, 300],
    [464, 240, 480, 300],
    [600, 240, 616, 300],
    [856, 240, 872, 300],
    [1000, 240, 1040, 300],
    [1020, 240, 1040, 300],
    [1240, 240, 1280, 300],
    [1368, 240, 1384, 300],
    [1518, 240, 1538, 300],
    [1688, 240, 1704, 300]
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
  var bands = { nw: 0, ns: 0, nm: 0, nms: 0, ne: 0, nes: 0 };
  var FG = 'rqe_p10be_walk';

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
  /* 西段：山前南 / 河东北夹缝 y260 / y280，东月路以西。 */
  for (x = 580; x <= 980; x += 32) {
    planted = tryTree('nw', x, 260);
    if (planted) {
      tryLamp('nw', x + 14, 260);
      if ((x / 32) % 2 < 1) tryBench('nw', x + 22, 260);
    }
  }
  for (x = 580; x <= 980; x += 40) {
    planted = tryTree('ns', x, 280);
    if (planted) {
      tryLamp('ns', x + 14, 280);
      if ((x / 40) % 2 < 1) tryBench('ns', x + 22, 280);
    }
  }
  /* 中段：月河口南北向路缝以东，落在 x1060–1220。 */
  for (x = 1060; x <= 1220; x += 32) {
    planted = tryTree('nm', x, 260);
    if (planted) {
      tryLamp('nm', x + 14, 260);
      if ((x / 32) % 2 < 1) tryBench('nm', x + 22, 260);
    }
  }
  for (x = 1060; x <= 1220; x += 40) {
    planted = tryTree('nms', x, 280);
    if (planted) tryBench('nms', x + 14, 280);
  }
  /* 东段：港东路以东至澜海前。 */
  for (x = 1280; x <= 1660; x += 32) {
    planted = tryTree('ne', x, 260);
    if (planted) {
      tryLamp('ne', x + 14, 260);
      if ((x / 32) % 2 < 1) tryBench('ne', x + 22, 260);
    }
  }
  for (x = 1280; x <= 1660; x += 40) {
    planted = tryTree('nes', x, 280);
    if (planted) {
      tryLamp('nes', x + 14, 280);
      tryBench('nes', x + 22, 280);
    }
  }

  if (trees < 24 || bands.nw < 6 || bands.ns < 5 || bands.nm < 3 || bands.ne < 6 || bands.nes < 4 || lamps < 10 || benches < 8) {
    throw new Error('site188 walk ' + trees + ' ' + JSON.stringify(bands) + ' ' + lamps + ' ' + benches);
  }

  var id, list, next;
  for (id in bags) {
    if (!Object.prototype.hasOwnProperty.call(bags, id)) continue;
    list = bags[id];
    if (!CH[id]) throw new Error('site188 missing chunk ' + id);
    next = (CH[id].objects || []).concat(list);
    if (next.length > 2600) throw new Error('site188 chunk cap ' + id + ' ' + next.length);
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
  if (wet.length) throw new Error('site188 water ' + wet.join(','));
  if (tileAt(1200, 400) !== 'K') throw new Error('site188 concrete');
  if (tileAt(1328, 422) !== 'G' || tileAt(1460, 418) !== 'G' || tileAt(600, 370) !== 'G') throw new Error('site188 grass');
  if (tileAt(1120, -48) !== 'S' || tileAt(500, -48) !== 'S' || tileAt(1120, -160) !== 'S') throw new Error('site188 sidewalk');

  var counts = {}, nAdd;
  for (id in added) {
    if (!Object.prototype.hasOwnProperty.call(added, id)) continue;
    nAdd = added[id];
    counts[id] = { added: nAdd, total: CH[id].objects.length };
  }

  P.site188 = {
    unconfirmed: true,
    choice: 'quality',
    walk: {
      trees: trees,
      lamps: lamps,
      benches: benches,
      bands: bands,
      fronts: [
        [580, 256, 980, 284],
        [1060, 256, 1220, 284],
        [1280, 256, 1660, 284]
      ]
    },
    counts: counts,
    cap: 120
  };
  P.reasons = P.reasons || {};
  P.reasons.site188 = 'Site188：山前南·河东北夹缝人行道补树灯椅。仍单色玻璃≥5 矮/中层库存已耗尽（仅余学校）；扫过空档，剩下的是路、步行缝、公园、学校和别墅院，没有能再放下几栋的配套地，所以不补楼。Site181–186 已补南堤/港东/滨海/港西/港岸东延/山前路/河东岸/南堤·滨海余缝人行道；Site187 已补井槐南沿底商店招。扫过剩余缺招牌门脸后只剩社康/社区工作站等零星几扇，这一刀改补山前路（y320）与河东岸（y240）之间原先几乎没有树的夹缝铺装——y260 / y280（西段 x580–980、中段 x1060–1220、东段 x1280–1660），补了银杏、樟和樱，灯和长椅让开楼、路、水面、学校和渔村老街。只落在人行道铺装上，不改 Site146 月河石驳岸整面。不进月河水面、不进山、不进澜海，不把南埠往 y-1540 以南推。北界仍是 y432。山前小学、东月小学、月津小学、山麓小学、渔村老街、石驳岸、柳口居不动。没有 438 m 塔。地名未经确认。';
  root.SITE188 = P.site188;
})();
