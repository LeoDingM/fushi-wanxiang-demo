/* 井槐 / 槐东 Site192：警务站·宠物店前广场街家具簇（质量修补）。
 * 仍单色玻璃≥5 矮/中层库存已耗尽（仅余学校）；可盖空档只剩路、步行缝、公园、学校和别墅院。
 * Site181–186 / 188 / 190 / 191 已把主要 S 人行道树灯椅条带补齐（南堤/港东/滨海/港西/港岸/山前/河东/夹缝/东月南/山前北沿）；
 * Site187 / 189 已补井槐南沿与书屋·工作站底商店招。主要条带人行道树灯椅库存已基本耗尽。
 * 扫过剩余缺招牌门脸：警务站与宠物店立面已有 civic_public_sign / plaque（不叠 rq_x_sign_*）；
 * HD 社康已有烘烤字；西向门脸多已有西向招牌。真正空的是槐东社区警务站与喵汪小屋南沿广场
 * （y31–33 · x96–126）：仅两盆 civic_public_planter，几乎无长椅/灯/桶/灌木。
 * 复用已有 community_bench / p_lamp / p_trashbin / rq_x_shrub / rq_x_bed / p_bikes，不新发明 interact。
 * 不补楼，不铺新的整条人行道树带，不进学校、渔村老街、柳口居，不改 Site146 月河石驳岸。没有 438 m 塔。地名未经确认。 */
(function () {
  'use strict';
  var D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10bh || D.rongqiaoExpandP10bi || !N.expansionP10) return;
  D.rongqiaoExpandP10bi = 1;
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
    throw new Error('site192 no chunk ' + x + ',' + y);
  }
  var bags = {}, added = {};
  function put(id, type, x, y, more) {
    var o = Object.assign({ id: 'rqp10bi_' + id, type: type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
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
  function inOldStreet(x, y) {
    return x < 560 && y > -230 && y < -110;
  }
  function inSchool(x, y) {
    if (x > 470 && x < 580 && y > 250 && y < 300) return true;
    if (x > 1340 && x < 1420 && y > 60 && y < 140) return true;
    if (x > 1540 && x < 1620 && y > 380 && y < 420) return true;
    return false;
  }
  /* 门口通道：警务站门 x99、宠物店门 x116，南北向留空 */
  function inDoorGap(x, y) {
    if (y > 33.6) return true;
    if (Math.abs(x - 99) < 1.6 && y > 33) return true;
    if (Math.abs(x - 116) < 1.6 && y > 33) return true;
    return false;
  }

  var lampsNear = [], priorFurn = [], placed = [];
  var chId, arr, oi, o;
  for (chId in CH) {
    if (!Object.prototype.hasOwnProperty.call(CH, chId)) continue;
    arr = (CH[chId] && CH[chId].objects) || [];
    for (oi = 0; oi < arr.length; oi++) {
      o = arr[oi];
      if (!o) continue;
      if (o.type === 'p_lamp') lampsNear.push(o);
      if (o.type === 'community_bench' || o.type === 'p_trashbin' || o.type === 'rq_x_shrub' ||
          o.type === 'rq_x_bed' || o.type === 'p_bikes' || o.type === 'civic_public_planter' ||
          o.type === 'p_planter') {
        priorFurn.push(o);
      }
    }
  }
  function nearLamp(x, y) {
    var i;
    for (i = 0; i < lampsNear.length; i++) {
      if (Math.abs(lampsNear[i].x - x) < 7 && Math.abs(lampsNear[i].y - y) < 4) return true;
    }
    return false;
  }
  function nearPrior(x, y, r) {
    var i;
    for (i = 0; i < priorFurn.length; i++) {
      if (Math.hypot(priorFurn[i].x - x, priorFurn[i].y - y) < (r || 1.6)) return true;
    }
    return false;
  }
  function nearPlaced(x, y, r) {
    var i;
    for (i = 0; i < placed.length; i++) {
      if (Math.hypot(placed[i].x - x, placed[i].y - y) < (r || 1.8)) return true;
    }
    return false;
  }

  var FG = 'rqe_p10bi_furn';
  var SHRUBS = ['dj', 'hy', 'hs', 'sj'];
  var benches = 0, lamps = 0, bins = 0, shrubs = 0, beds = 0, bikes = 0;
  var bands = { civic: 0, mid: 0, pet: 0 };

  function ok(x, y, pad) {
    if (inOldStreet(x, y) || inSchool(x, y) || inWater(x, y) || insideFoot(x, y, pad || 0.8)) return false;
    if (inDoorGap(x, y) || tileAt(x, y) !== 'S') return false;
    return true;
  }
  function tryBench(band, x, y) {
    if (!ok(x, y, 0.8) || nearPrior(x, y, 1.5)) return false;
    var o2 = put('bench_' + band + '_' + Math.round(x) + '_' + Math.round(y * 10), 'community_bench', x, y, {
      rot: 0, fade_group: FG
    });
    placed.push(o2);
    benches++;
    bands[band]++;
    return true;
  }
  function tryLamp(band, x, y) {
    if (!ok(x, y, 0.6) || nearLamp(x, y) || nearPrior(x, y, 1.2)) return false;
    var o2 = put('lamp_' + band + '_' + Math.round(x) + '_' + Math.round(y * 10), 'p_lamp', x, y, {
      interact: 'lamp', fade_group: FG
    });
    lampsNear.push(o2);
    placed.push(o2);
    lamps++;
    bands[band]++;
    return true;
  }
  function tryBin(band, x, y) {
    if (!ok(x, y, 0.6) || nearPrior(x, y, 1.2)) return false;
    var o2 = put('bin_' + band + '_' + Math.round(x) + '_' + Math.round(y * 10), 'p_trashbin', x, y, {
      fade_group: FG
    });
    placed.push(o2);
    bins++;
    bands[band]++;
    return true;
  }
  function tryShrub(band, x, y) {
    if (!ok(x, y, 0.5) || nearPrior(x, y, 1.2)) return false;
    var o2 = put('shrub_' + band + '_' + Math.round(x) + '_' + Math.round(y * 10), 'rq_x_shrub', x, y, {
      variant: SHRUBS[shrubs % SHRUBS.length], fade_group: FG
    });
    placed.push(o2);
    shrubs++;
    bands[band]++;
    return true;
  }
  function tryBed(band, x, y, variant) {
    /* rq_x_bed 占地约 3×1.2，锚点为西南角 */
    if (!ok(x + 1.5, y + 0.6, 0.5) || nearPrior(x + 1.5, y + 0.6, 1.5)) return false;
    if (tileAt(x + 2.5, y + 0.8) !== 'S') return false;
    var o2 = put('bed_' + band + '_' + Math.round(x) + '_' + Math.round(y * 10), 'rq_x_bed', x, y, {
      variant: variant || 'a', fade_group: FG
    });
    placed.push(o2);
    beds++;
    bands[band]++;
    return true;
  }
  function tryBikes(band, x, y) {
    if (!ok(x, y, 0.8) || nearPrior(x, y, 1.5)) return false;
    var o2 = put('bikes_' + band + '_' + Math.round(x) + '_' + Math.round(y * 10), 'p_bikes', x, y, {
      rot: 0, fade_group: FG
    });
    placed.push(o2);
    bikes++;
    bands[band]++;
    return true;
  }

  /* 手摆间距：躲开门缝 x99 / x116 与 y34 既有 planter；不铺整条树带 */
  tryBench('civic', 96.5, 32.0);
  tryLamp('civic', 100.5, 31.5);
  tryShrub('civic', 103.0, 32.5);
  tryBin('civic', 106.0, 31.7);
  tryBench('civic', 108.2, 32.0);
  tryShrub('civic', 97.5, 32.6);
  tryBed('civic', 101.5, 30.6, 'a');

  tryShrub('mid', 110.5, 32.5);
  tryLamp('mid', 112.5, 31.5);
  tryBench('mid', 114.0, 32.0);
  tryShrub('mid', 111.0, 31.2);

  tryBikes('pet', 124.0, 30.8);
  tryBench('pet', 118.0, 32.0);
  tryShrub('pet', 120.0, 32.5);
  tryLamp('pet', 122.0, 31.5);
  tryBench('pet', 125.8, 32.0);
  tryBin('pet', 126.4, 31.4);
  tryShrub('pet', 119.0, 31.2);
  tryBed('pet', 117.2, 30.6, 'b');

  var total = benches + lamps + bins + shrubs + beds + bikes;
  if (total < 12 || benches < 4 || lamps < 3 || bins < 2 || shrubs < 4 || beds < 1 || bikes < 1 ||
      bands.civic < 4 || bands.pet < 4) {
    throw new Error('site192 furn ' + total + ' ' + JSON.stringify({
      benches: benches, lamps: lamps, bins: bins, shrubs: shrubs, beds: beds, bikes: bikes, bands: bands
    }));
  }

  var id, list, next;
  for (id in bags) {
    if (!Object.prototype.hasOwnProperty.call(bags, id)) continue;
    list = bags[id];
    if (!CH[id]) throw new Error('site192 missing chunk ' + id);
    next = (CH[id].objects || []).concat(list);
    if (next.length > 2600) throw new Error('site192 chunk cap ' + id + ' ' + next.length);
    CH[id].objects = next;
  }

  if (tileAt(1200, 400) !== 'K') throw new Error('site192 concrete');
  if (tileAt(1328, 422) !== 'G' || tileAt(1460, 418) !== 'G' || tileAt(600, 370) !== 'G') throw new Error('site192 grass');
  if (tileAt(1120, -48) !== 'S' || tileAt(500, -48) !== 'S' || tileAt(1120, -160) !== 'S') throw new Error('site192 sidewalk');
  if (tileAt(100, 32) !== 'S' || tileAt(120, 32) !== 'S') throw new Error('site192 civic plaza');

  var counts = {}, nAdd;
  for (id in added) {
    if (!Object.prototype.hasOwnProperty.call(added, id)) continue;
    nAdd = added[id];
    counts[id] = { added: nAdd, total: CH[id].objects.length };
  }

  P.site192 = {
    unconfirmed: true,
    choice: 'quality',
    furn: {
      total: total,
      benches: benches,
      lamps: lamps,
      bins: bins,
      shrubs: shrubs,
      beds: beds,
      bikes: bikes,
      bands: bands,
      fronts: [
        [96, 30.5, 108, 33.2],
        [110, 30.5, 114, 33.2],
        [118, 30.5, 126.5, 33.2]
      ],
      types: ['community_bench', 'p_lamp', 'p_trashbin', 'rq_x_shrub', 'rq_x_bed', 'p_bikes']
    },
    counts: counts,
    cap: 120
  };
  P.reasons = P.reasons || {};
  P.reasons.site192 = 'Site192：槐东警务站·宠物店前广场街家具簇。仍单色玻璃≥5 矮/中层库存已耗尽（仅余学校）；扫过空档，剩下的是路、步行缝、公园、学校和别墅院，没有能再放下几栋的配套地，所以不补楼。Site181–191 已把主要 S 人行道树灯椅条带（南堤/港东/滨海/港西/港岸/山前/河东/夹缝/东月南/山前北沿）与井槐南沿·书屋·工作站招牌补齐；主要条带人行道树灯椅库存已基本耗尽。扫过剩余缺招牌门脸：警务站与宠物店立面已有 civic_public_sign / plaque，不叠 rq_x_sign_*；真正空的是警务站与喵汪小屋南沿广场（y31–33 x96–126）。复用已有 community_bench / p_lamp / p_trashbin / rq_x_shrub / rq_x_bed / p_bikes，不新发明 interact。不加新碰撞。不进月河水面、不进山、不进澜海，不把南埠往 y-1540 以南推。北界仍是 y432。山前小学、东月小学、月津小学、山麓小学、渔村老街、石驳岸、柳口居不动。不改 Site146 月河石驳岸整面。没有 438 m 塔。地名未经确认。';
  root.SITE192 = P.site192;
})();
