/* 井槐 / 槐东 Site189：社区书屋·工作站底商店招补齐（质量修补）。
 * 仍单色玻璃≥5 矮/中层库存已耗尽（仅余学校）；可盖空档只剩路、步行缝、公园、学校和别墅院。
 * Site181–186 已补人行道树灯椅；Site187 已补井槐南沿 y4.5 驿站/食堂/修车/邻里餐饮；Site188 已补山前南·河东北夹缝。
 * 扫过剩余缺南向 rq_x_sign_s 的门脸：西侧楼多已有西向招牌；真正缺的是槐东书屋与邻里共创工作站一带（y19 x96–122）。
 * 复用已有 rq_x_sign_s 与 expand_art SIGNS 变体（hb/sh），不新发明 interact 类型。
 * 不补楼，不进学校、渔村老街、柳口居，不改 Site146 月河石驳岸。没有 438 m 塔。地名未经确认。 */
(function () {
  'use strict';
  var D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10be || D.rongqiaoExpandP10bf || !N.expansionP10) return;
  D.rongqiaoExpandP10bf = 1;
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
    throw new Error('site189 no chunk ' + x + ',' + y);
  }
  var bags = {}, added = {};
  function put(id, type, x, y, more) {
    var o = Object.assign({ id: 'rqp10bf_' + id, type: type, x: +(+x).toFixed(2), y: +(+y).toFixed(2) }, more || {});
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

  var FG = 'rqe_p10bf_sign';
  var signs = 0;
  var bands = { library: 0, workspace: 0 };

  function trySign(band, id, x, y, variant) {
    if (nearSign(x, y)) return false;
    put(id, 'rq_x_sign_s', x, y, { z: 2.42, variant: variant, fade_group: FG });
    signsNear.push({ x: x, y: y, type: 'rq_x_sign_s' });
    signs++;
    bands[band]++;
    return true;
  }

  /* 槐东书屋门脸 — hb 杭本（街景书香；室内名仍是槐东书屋） */
  trySign('library', 'l_hb_0', 96, 19, 'hb');
  trySign('library', 'l_hb_1', 99, 19, 'hb');
  trySign('library', 'l_hb_2', 102, 19, 'hb');
  trySign('library', 'l_hb_3', 105, 19, 'hb');

  /* 邻里共创社区工作站门脸 — sh 居委会（街景社区公共服务感） */
  trySign('workspace', 'w_sh_0', 113, 19, 'sh');
  trySign('workspace', 'w_sh_1', 116, 19, 'sh');
  trySign('workspace', 'w_sh_2', 119, 19, 'sh');
  trySign('workspace', 'w_sh_3', 122, 19, 'sh');

  if (signs < 6 || bands.library < 3 || bands.workspace < 3) {
    throw new Error('site189 signs ' + signs + ' ' + JSON.stringify(bands));
  }

  var id, list, next;
  for (id in bags) {
    if (!Object.prototype.hasOwnProperty.call(bags, id)) continue;
    list = bags[id];
    if (!CH[id]) throw new Error('site189 missing chunk ' + id);
    next = (CH[id].objects || []).concat(list);
    if (next.length > 2600) throw new Error('site189 chunk cap ' + id + ' ' + next.length);
    CH[id].objects = next;
  }

  var G = D.ground;
  function tileAt(x, y) {
    var c = Math.floor((x - G.origin[0]) / G.chunk), r = Math.floor((y - G.origin[1]) / G.chunk);
    var row = G.data_south_to_north[r];
    return row && row[c];
  }
  if (tileAt(1200, 400) !== 'K') throw new Error('site189 concrete');
  if (tileAt(1328, 422) !== 'G' || tileAt(1460, 418) !== 'G' || tileAt(600, 370) !== 'G') throw new Error('site189 grass');
  if (tileAt(1120, -48) !== 'S' || tileAt(500, -48) !== 'S' || tileAt(1120, -160) !== 'S') throw new Error('site189 sidewalk');
  if (tileAt(700, 260) !== 'S' || tileAt(1120, 260) !== 'S') throw new Error('site189 site188 walk');

  var counts = {}, nAdd;
  for (id in added) {
    if (!Object.prototype.hasOwnProperty.call(added, id)) continue;
    nAdd = added[id];
    counts[id] = { added: nAdd, total: CH[id].objects.length };
  }

  P.site189 = {
    unconfirmed: true,
    choice: 'quality',
    signs: {
      total: signs,
      bands: bands,
      fronts: [
        [96, 19, 105, 19],
        [113, 19, 122, 19]
      ],
      variants: ['hb', 'sh']
    },
    counts: counts,
    cap: 120
  };
  P.reasons = P.reasons || {};
  P.reasons.site189 = 'Site189：井槐东社区书屋·工作站底商店招补齐。仍单色玻璃≥5 矮/中层库存已耗尽（仅余学校）；扫过空档，剩下的是路、步行缝、公园、学校和别墅院，没有能再放下几栋的配套地，所以不补楼。Site181–188 已补人行道与井槐南沿 y4.5 招牌。扫过剩余缺南向 rq_x_sign_s 的门脸：西侧楼多已有西向招牌；真正缺的是槐东书屋与邻里共创工作站一带（y19 x96–122）。复用已有 rq_x_sign_s 与 expand_art SIGNS 变体（hb/sh），不新发明 interact。不加新碰撞。不进月河水面、不进山、不进澜海，不把南埠往 y-1540 以南推。北界仍是 y432。山前小学、东月小学、月津小学、山麓小学、渔村老街、石驳岸、柳口居不动。不改 Site146 月河石驳岸整面。没有 438 m 塔。地名未经确认。';
  root.SITE189 = P.site189;
})();
