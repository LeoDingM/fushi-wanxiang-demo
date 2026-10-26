/* Site140: reserve far 河东 / 南埠 chunks before register, so a save's chunk-id prefix stays stable
 * even when those district scripts are fetched later. If the generators already ran (tests, full page),
 * every id is present and this is a no-op. Ground and the overview rect are extended up front so the
 * camera can frame the coast before the heavy chain arrives; the chain's own addE / addR then see zero. */
(function () {
  'use strict';
  const root = window, D = root.SCENE_DATA, N = root.RONGQIAO_NORTH;
  if (!D) return;
  const EAST = 'js/far_hedong.js', SOUTH = 'js/far_nanbu.js';
  const east = [
    { id: 'rqe_p10_e6', name: '河东生活街', rect: [1100, 8, 1360, 280], src: EAST, load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e7', name: '河东东澄', rect: [1240, 8, 1520, 280], src: EAST, load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e8', name: '河东澜东', rect: [1400, 8, 1680, 280], src: EAST, load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e9', name: '河东滨海', rect: [1560, 8, 1820, 280], src: EAST, load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e10', name: '河东望山', rect: [280, 180, 1860, 460], src: EAST, load_m: 40, unload_m: 80 },
    { id: 'rqe_p10_e11', name: '河东南堤', rect: [280, -140, 1860, 100], src: EAST, load_m: 40, unload_m: 80 },
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
  spliceAfter('rqe_rq_sky', south);
  spliceAfter('rqe_p10_e5', east);

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
  const P = N && N.expansionP10;
  if (P && P.district) {
    const d = P.district;
    P.district = [d[0], Math.min(d[1], -80), Math.max(d[2], 1750), Math.max(d[3], 378)];
  }
  if (P && P.amenities && P.amenities.park && P.amenities.park[2] < 1750) {
    const r = P.amenities.park;
    P.amenities.park = [r[0], r[1], 1750, r[3]];
  }
  const S = N && N.expansionP11;
  if (S && S.district && S.district[1] > -1540) S.district = [S.district[0], -1540, S.district[2], S.district[3]];
})();
