/* 井槐 / 槐东 Site187：沿街底商店招补齐（质量修补）。
 * 仍单色玻璃≥5 矮/中层库存已耗尽（仅余学校）；可盖空档只剩路、步行缝、公园、学校和别墅院。
 * Site181–186 已把南堤/港东/滨海/港西/港岸东延/山前路/河东岸/南堤·滨海余缝的人行道树灯椅补齐。
 * 这一刀改补井槐南沿缺招牌的底商门脸：community_courier / community_canteen / community_repair
 * （槐东快递驿站·社区食堂·修车铺一带，y4.5 x113–156）与邻里餐饮 nb_e1 / nb_e4（x47–67）。
 * 复用已有 rq_x_sign_s 与 expand_art SIGNS 变体（yz/cy/wj/mn/cf/cp），不新发明 interact 类型。
 * 不补楼，不进学校、渔村老街、柳口居，不改 Site146 月河石驳岸。没有 438 m 塔。地名未经确认。 */
(function () {
  'use strict';
  var D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10bc || D.rongqiaoExpandP10bd || !N.expansionP10) return;
  D.rongqiaoExpandP10bd = 1;
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
    throw new Error('site187 no chunk ' + x + ',' + y);
  }
  var bags = {}, added = {};
  function put(id, type, x, y, more) {
    var o = Object.assign({ id: 'rqp10bd_' + id, type: type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
    var key = pickChunk(o.x, o.y);
    (bags[key] || (bags[key] = [])).push(o);
    added[key] = (added[key] || 0) + 1;
    return o;
  }

  /* 已有招牌：同坐标附近不再叠第二块 */
  var signsNear = [], chId, arr, oi, o;
  for (chId in CH) {
    if (!Object.prototype.hasOwnProperty.call(CH, chId)) continue;
    arr = (CH[chId] && CH[chId].objects) || [];
    for (oi = 0; oi < arr.length; oi++) {
      o = arr[oi];
      if (!o) continue;
      if (o.type === 'rq_x_sign_s' || o.type === 'rq_x_sign_w') signsNear.push(o);
    }
  }
  function nearSign(x, y) {
    var i;
    for (i = 0; i < signsNear.length; i++) {
      if (Math.abs(signsNear[i].x - x) < 2.4 && Math.abs(signsNear[i].y - y) < 1.2) return true;
    }
    return false;
  }

  var FG = 'rqe_p10bd_sign';
  var signs = 0;
  var bands = { courier: 0, canteen: 0, repair: 0, eatery: 0 };

  function trySign(band, id, x, y, variant) {
    if (nearSign(x, y)) return false;
    put(id, 'rq_x_sign_s', x, y, { z: 2.42, variant: variant, fade_group: FG });
    signsNear.push({ x: x, y: y, type: 'rq_x_sign_s' });
    signs++;
    bands[band]++;
    return true;
  }

  /* 槐东社区快递驿站门脸 — yz 邻里驿站 */
  trySign('courier', 'c_yz_0', 113, 4.5, 'yz');
  trySign('courier', 'c_yz_1', 116, 4.5, 'yz');
  trySign('courier', 'c_yz_2', 119, 4.5, 'yz');
  trySign('courier', 'c_yz_3', 122, 4.5, 'yz');

  /* 槐东社区食堂门脸 — cy 茶餐厅（街景变体；室内名仍是社区食堂） */
  trySign('canteen', 'n_cy_0', 132, 4.5, 'cy');
  trySign('canteen', 'n_cy_1', 135, 4.5, 'cy');
  trySign('canteen', 'n_cy_2', 138, 4.5, 'cy');
  trySign('canteen', 'n_cy_3', 141, 4.5, 'cy');

  /* 老陈修车铺门脸 — wj 五金水电（街景修配感；室内名仍是修车铺） */
  trySign('repair', 'r_wj_0', 147, 4.5, 'wj');
  trySign('repair', 'r_wj_1', 150, 4.5, 'wj');
  trySign('repair', 'r_wj_2', 153, 4.5, 'wj');
  trySign('repair', 'r_wj_3', 156, 4.5, 'wj');

  /* 邻里餐饮 nb_e1 / nb_e4：按业态对号 */
  trySign('eatery', 'e_mn_47', 47, 4.5, 'mn');
  trySign('eatery', 'e_cf_50', 50, 4.5, 'cf');
  trySign('eatery', 'e_cp_67', 67, 4.5, 'cp');

  if (signs < 12 || bands.courier < 3 || bands.canteen < 3 || bands.repair < 3 || bands.eatery < 2) {
    throw new Error('site187 signs ' + signs + ' ' + JSON.stringify(bands));
  }

  var id, list, next;
  for (id in bags) {
    if (!Object.prototype.hasOwnProperty.call(bags, id)) continue;
    list = bags[id];
    if (!CH[id]) throw new Error('site187 missing chunk ' + id);
    next = (CH[id].objects || []).concat(list);
    if (next.length > 2600) throw new Error('site187 chunk cap ' + id + ' ' + next.length);
    CH[id].objects = next;
  }

  var G = D.ground;
  function tileAt(x, y) {
    var c = Math.floor((x - G.origin[0]) / G.chunk), r = Math.floor((y - G.origin[1]) / G.chunk);
    var row = G.data_south_to_north[r];
    return row && row[c];
  }
  if (tileAt(1200, 400) !== 'K') throw new Error('site187 concrete');
  if (tileAt(1328, 422) !== 'G' || tileAt(1460, 418) !== 'G' || tileAt(600, 370) !== 'G') throw new Error('site187 grass');
  if (tileAt(1120, -48) !== 'S' || tileAt(500, -48) !== 'S' || tileAt(1120, -160) !== 'S') throw new Error('site187 sidewalk');

  var counts = {}, nAdd;
  for (id in added) {
    if (!Object.prototype.hasOwnProperty.call(added, id)) continue;
    nAdd = added[id];
    counts[id] = { added: nAdd, total: CH[id].objects.length };
  }

  P.site187 = {
    unconfirmed: true,
    choice: 'quality',
    signs: {
      total: signs,
      bands: bands,
      fronts: [
        [113, 4.5, 122, 4.5],
        [132, 4.5, 141, 4.5],
        [147, 4.5, 156, 4.5],
        [47, 4.5, 67, 4.5]
      ],
      variants: ['yz', 'cy', 'wj', 'mn', 'cf', 'cp']
    },
    counts: counts,
    cap: 120
  };
  P.reasons = P.reasons || {};
  P.reasons.site187 = 'Site187：井槐南沿底商店招补齐。仍单色玻璃≥5 矮/中层库存已耗尽（仅余学校）；扫过空档，剩下的是路、步行缝、公园、学校和别墅院，没有能再放下几栋的配套地，所以不补楼。Site181–186 已补南堤/港东/滨海/港西/港岸东延/山前路/河东岸/南堤·滨海余缝人行道。这一刀改补井槐南沿缺招牌的底商门脸：槐东快递驿站、社区食堂、修车铺一带（y4.5 x113–156）与邻里餐饮 nb_e1 / nb_e4（x47–67）。复用已有 rq_x_sign_s 与 expand_art SIGNS 变体（yz/cy/wj/mn/cf/cp），不新发明 interact。不加新碰撞。不进月河水面、不进山、不进澜海，不把南埠往 y-1540 以南推。北界仍是 y432。山前小学、东月小学、月津小学、山麓小学、渔村老街、石驳岸、柳口居不动。不改 Site146 月河石驳岸整面。没有 438 m 塔。地名未经确认。';
  root.SITE187 = P.site187;
})();
