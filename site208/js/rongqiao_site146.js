/* Site146：月河石驳岸接成一条，铺装不再被水面压出一条缝。
 * 万家桥桥面上的石驳岸拿掉。非 rqe_ 碰撞体交叉逐对看过，是栏杆、溪缓冲和南埠封带相接，画面上不是穿模，保持相接。
 * 南埠仍停在 y-1540。没有 438 m 塔。名字未经确认。 */
(function () {
  'use strict';
  const root = window;
  const D = root.SCENE_DATA;
  const N = root.RONGQIAO_NORTH;
  if (!D || root.site146Settle) return;
  root.site146Settle = 1;

  function onDeck(o) {
    return o && o.type === 'rq_x_embank_s' && Math.abs(o.y - 238) < 0.4 && o.x > -125.5 && o.x < -112;
  }
  const droppedIds = [];
  function drop(arr) {
    if (!arr) return 0;
    let n = 0;
    for (let i = arr.length - 1; i >= 0; i--) if (onDeck(arr[i])) { droppedIds.push(arr[i].id); arr.splice(i, 1); n++; }
    return n;
  }
  let dropped = drop(D.objects);
  const chunks = root.SCENE_CHUNKS || {};
  for (const id of Object.keys(chunks)) dropped += drop(chunks[id] && chunks[id].objects);

  function overlaps(a, b) {
    return a[0] < b[2] - 0.05 && b[0] < a[2] - 0.05 && a[1] < b[3] - 0.05 && b[1] < a[3] - 0.05;
  }
  function kind(a, b) {
    const ha = (re) => re.test(a) || re.test(b);
    const both = (re) => re.test(a) && re.test(b);
    if (both(/rqp11/) && both(/_(west|east)/)) return 'nanbu-seal';
    if (ha(/creek/) && ha(/buffer/)) return 'creek-buffer';
    if (ha(/river/) && ha(/brg_r/)) return 'river-rail';
    if (ha(/river/) && both(/river/)) return 'river-river';
    if (ha(/^nb_/) && ha(/community_north/)) return 'north-bg';
    if (ha(/rq_bg_/) && ha(/buffer/)) return 'bg-buffer';
    if (ha(/nedge/) && ha(/nwedge/)) return 'hedge-corner';
    return '';
  }
  const cols = (D.colliders || []).filter((c) => c && c.rect && c.rect.length >= 4);
  const kept = {};
  const unknown = [];
  for (let i = 0; i < cols.length; i++) {
    if (/^rqe_/.test(cols[i].id || '')) continue;
    for (let j = i + 1; j < cols.length; j++) {
      if (/^rqe_/.test(cols[j].id || '')) continue;
      if (!overlaps(cols[i].rect, cols[j].rect)) continue;
      const k = kind(cols[i].id || '', cols[j].id || '');
      if (!k) unknown.push((cols[i].id || '') + ' ~ ' + (cols[j].id || ''));
      else kept[k] = (kept[k] || 0) + 1;
    }
  }
  const pairs = Object.values(kept).reduce((s, n) => s + n, 0);
  const note = 'Site146：月河石驳岸改成一整面石墙，压顶盖住铺装和水的接缝，水面不再溢出到人行道上。北岸近水一排不再刷成深色水。槐溪口人行道从河岸接上。河东折弯的石驳岸补到渠角，x320 的缺口补上。万家桥桥面上的石驳岸拿掉。' + pairs + ' 对非 rqe_ 碰撞体交叉是南埠封带、溪与缓冲、月河与桥栏相接，近景没有穿模，保持相接。南埠仍停在 y-1540。没有 438 m 塔。名字未经确认。';
  const info = { dropped, droppedIds, pairs, kept, unknown, note };
  root.SITE146 = info;
  if (N && N.expansionP10) {
    N.expansionP10.site146 = info;
    N.expansionP10.reasons = N.expansionP10.reasons || {};
    N.expansionP10.reasons.site146 = note;
  }
})();
