/* Site141: reserve district chunks before register. The generators themselves sit in the deferred
 * bundle, so a save's chunk-id prefix still matches a full boot. If they already ran (tests), every id
 * is present and this is a no-op. The overview rect is the coast-to-hill band even before that bundle. */
(function () {
  'use strict';
  const root = window, D = root.SCENE_DATA, N = root.RONGQIAO_NORTH;
  if (!D) return;
  const SOUTH = 'js/far_nanbu.js';
  const file = (name) => 'js/' + name;
  const east = [
    { id: 'rqe_p10_e5', name: '河东新城望月', rect: [960, 8, 1200, 260], src: file('rongqiao_expand_p10c.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e6', name: '河东生活街', rect: [1100, 8, 1360, 280], src: file('rongqiao_expand_p10e.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e7', name: '河东东澄', rect: [1240, 8, 1520, 280], src: file('rongqiao_expand_p10g.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e8', name: '河东澜东', rect: [1400, 8, 1680, 280], src: file('rongqiao_expand_p10h.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e9', name: '河东滨海', rect: [1560, 8, 1820, 280], src: file('rongqiao_expand_p10i.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e10', name: '河东望山', rect: [280, 180, 1860, 460], src: file('rongqiao_expand_p10j.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e11', name: '河东南堤', rect: [280, -140, 1860, 100], src: file('rongqiao_expand_p10k.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e12', name: '河东渔港', rect: [280, -280, 1860, -40], src: file('rongqiao_expand_p10l.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e13', name: '河东山径', rect: [280, 300, 1860, 420], src: file('rongqiao_expand_p10m.js'), load_m: 40, unload_m: 80 },
  ];
  const south = [
    { id: 'rqe_p11_s4', name: '南埠槐南', rect: [-16, -470, 200, -328], src: SOUTH, load_m: 40, unload_m: 80 },
    { id: 'rqe_p11_s5', name: '南埠南环', rect: [-16, -550, 200, -400], src: SOUTH, load_m: 50, unload_m: 100 },
    { id: 'rqe_p11_s6', name: '南埠南津', rect: [-16, -630, 200, -480], src: SOUTH, load_m: 50, unload_m: 100 },
    { id: 'rqe_p11_s7', name: '南埠南浦', rect: [-16, -710, 200, -560], src: SOUTH, load_m: 50, unload_m: 100 },
    { id: 'rqe_p11_s8', name: '南埠南洲', rect: [-16, -790, 200, -640], src: SOUTH, load_m: 50, unload_m: 100 },
    { id: 'rqe_p11_s9', name: '南埠南湾', rect: [-16, -870, 200, -720], src: SOUTH, load_m: 50, unload_m: 100 },
    { id: 'rqe_p11_s10', name: '南埠南汀', rect: [-16, -950, 200, -800], src: SOUTH, load_m: 50, unload_m: 100 },
    { id: 'rqe_p11_s11', name: '南埠南渚', rect: [-16, -1030, 200, -880], src: SOUTH, load_m: 50, unload_m: 100 },
    { id: 'rqe_p11_s12', name: '南埠南湄', rect: [-16, -1110, 200, -960], src: SOUTH, load_m: 50, unload_m: 100 },
    { id: 'rqe_p11_s13', name: '南埠南矶', rect: [-16, -1190, 200, -1040], src: SOUTH, load_m: 50, unload_m: 100 },
    { id: 'rqe_p11_s14', name: '南埠南汐', rect: [-16, -1270, 200, -1120], src: SOUTH, load_m: 50, unload_m: 100 },
    { id: 'rqe_p11_s15', name: '南埠南滩', rect: [-16, -1350, 200, -1200], src: SOUTH, load_m: 50, unload_m: 100 },
    { id: 'rqe_p11_s16', name: '南埠南泓', rect: [-16, -1430, 200, -1280], src: SOUTH, load_m: 50, unload_m: 100 },
    { id: 'rqe_p11_s17', name: '南埠南泊', rect: [-16, -1510, 200, -1360], src: SOUTH, load_m: 50, unload_m: 100 },
    { id: 'rqe_p11_s18', name: '南埠南滨', rect: [-16, -1590, 200, -1440], src: SOUTH, load_m: 50, unload_m: 100 },
  ];
  const known = new Set((D.chunks || []).map((c) => c.id));
  for (const key of ['RONGQIAO_PENDING_CHUNKS', 'RONGQIAO_LATE_CHUNKS', 'RONGQIAO_TAIL_CHUNKS']) {
    for (const c of root[key] || []) known.add(c.id);
  }
  const TAIL = (root.RONGQIAO_TAIL_CHUNKS = root.RONGQIAO_TAIL_CHUNKS || []);
  function spliceAfter(anchor, entries) {
    const missing = entries.filter((e) => !known.has(e.id));
    if (!missing.length) return;
    for (const e of missing) known.add(e.id);
    const i = TAIL.findIndex((c) => c.id === anchor);
    if (i < 0) TAIL.push.apply(TAIL, missing);
    else TAIL.splice.apply(TAIL, [i + 1, 0].concat(missing));
  }
  spliceAfter('rqe_e5_cbde', [
    { id: 'rqe_p9_w', name: '槐溪·万家桥路', rect: [-180, 141, -106, 192], src: file('rongqiao_expand_p9.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p9_n', name: '万家桥·槐溪口北岸', rect: [-180, 192, -64, 276], src: file('rongqiao_expand_p9.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_b2_s', name: '南关西·万家西巷', rect: [-180, -80, -106, 36], src: file('rongqiao_expand_b2.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_b2_n', name: '城中村西缘', rect: [-180, 36, -106, 142], src: file('rongqiao_expand_b2.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_hd', name: '河东新城', rect: [300, 8, 500, 260], src: file('rongqiao_expand_p10.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e2', name: '河东新城东', rect: [460, 8, 680, 260], src: file('rongqiao_expand_p10.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e3', name: '河东新城石澜', rect: [600, 8, 880, 260], src: file('rongqiao_expand_p10.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e4', name: '河东新城银杏', rect: [820, 8, 1040, 260], src: file('rongqiao_expand_p10b.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p11_s', name: '南埠', rect: [-16, -210, 200, -60], src: file('rongqiao_expand_p11.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p11_s2', name: '南埠南片', rect: [-16, -290, 200, -168], src: file('rongqiao_expand_p11b.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p11_s3', name: '南埠埠南', rect: [-16, -370, 200, -248], src: file('rongqiao_expand_p11c.js'), load_m: 40, unload_m: 80 },
    { id: 'rqe_p11_sky', name: '南埠天际线', rect: [-16, -300, 200, -100], src: file('rongqiao_skyline.js'), load_m: 70, unload_m: 120 },
    { id: 'rqe_rq_sky', name: '榕桥点状高层', rect: [20, -16, 230, 150], src: file('rongqiao_skyline.js'), load_m: 70, unload_m: 120 },
  ]);
  spliceAfter('rqe_rq_sky', south);
  spliceAfter('rqe_p11_s18', east);

  const G = D.ground;
  if (G && G.chunk && G.origin) {
    const GX1 = 1770, GY0 = -1580;
    const addE = Math.max(0, Math.round((GX1 - (G.origin[0] + G.cols * G.chunk)) / G.chunk));
    if (addE) {
      G.data_south_to_north = G.data_south_to_north.map((row) => row + 'K'.repeat(addE));
      G.cols += addE;
    }
    const addR = Math.max(0, Math.round((G.origin[1] - GY0) / G.chunk));
    if (addR) {
      const rows = [];
      for (let r = 0; r < addR; r++) rows.push('K'.repeat(G.cols));
      G.data_south_to_north = rows.concat(G.data_south_to_north);
      G.rows = G.data_south_to_north.length;
      G.origin = [G.origin[0], G.origin[1] - addR * G.chunk];
    }
    if (D.bounds) {
      D.bounds = Object.assign({}, D.bounds, {
        x1: Math.max(D.bounds.x1, 1750),
        y0: Math.min(D.bounds.y0, -1540),
      });
    }
  }
  if (N && !N.expansionP10) N.expansionP10 = { unconfirmed: true, names: { district: '月河区 · 河东新城' }, district: [356, -220, 1750, 378] };
  if (N && !N.expansionP11) N.expansionP11 = { unconfirmed: true, names: { district: '南埠' }, district: [8, -1540, 176, -104] };
  const P = N && N.expansionP10;
  if (P && P.district) {
    const d = P.district;
    P.district = [d[0], Math.min(d[1], -220), Math.max(d[2], 1750), Math.max(d[3], 378)];
  }
  if (P && P.amenities && P.amenities.park && P.amenities.park[2] < 1750) {
    const r = P.amenities.park;
    P.amenities.park = [r[0], r[1], 1750, r[3]];
  }
  const S = N && N.expansionP11;
  if (S && S.district && S.district[1] > -1540) S.district = [S.district[0], -1540, S.district[2], S.district[3]];
})();
