/* B3 槐溪口西巷 (2026-10-24). P9 drew three 4–7F kit blocks just outside the fence as a silhouette.
 * The written playable edge was about x -160. Those blocks are the same 榕桥 sheet, not another district,
 * so this opens only the band in front of them: x -178…-160, y 141…182, with a sidewalk, lamps and
 * the existing street-tree rotation. x < -178 and everything south of y 141 stay closed.
 * y < -80 is 南埠 / P11 and is not opened. The bus stays static: each live line allows exactly two stops.
 * The lane name is 未经Leo确认. No new interiors. 月河区 is not built here. */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH;
  if (!D || !N || !D.rongqiaoExpandB2 || D.rongqiaoExpandB3) return;
  D.rongqiaoExpandB3 = 1;
  const G = D.ground, root = window, BX0 = -178, GX0 = -198;
  const addC = Math.max(0, Math.round((G.origin[0] - GX0) / G.chunk));
  if (addC) {
    G.data_south_to_north = G.data_south_to_north.map((row) => 'K'.repeat(addC) + row);
    G.cols += addC;
    G.origin = [G.origin[0] - addC * G.chunk, G.origin[1]];
  }
  D.bounds = Object.assign({}, D.bounds, { x0: Math.min(D.bounds.x0, BX0) });
  function paint(rect, tile) {
    const [ox, oy] = G.origin, ch = G.chunk;
    const c0 = Math.max(0, Math.floor((rect[0] - ox) / ch)), c1 = Math.min(G.cols, Math.ceil((rect[2] - ox) / ch));
    const r0 = Math.max(0, Math.floor((rect[1] - oy) / ch)), r1 = Math.min(G.rows, Math.ceil((rect[3] - oy) / ch));
    for (let r = r0; r < r1; r++) {
      const a = G.data_south_to_north[r].split('');
      for (let c = c0; c < c1; c++) {
        const x = ox + (c + 0.5) * ch, y = oy + (r + 0.5) * ch;
        if (x >= rect[0] && x < rect[2] && y >= rect[1] && y < rect[3]) a[c] = tile;
      }
      G.data_south_to_north[r] = a.join('');
    }
  }
  const OLD = [-180, 141, -160.35, 272.3];
  const same = (r, a) => r && Math.abs(r[0] - a[0]) < 0.2 && Math.abs(r[1] - a[1]) < 0.2 && Math.abs(r[2] - a[2]) < 0.2 && Math.abs(r[3] - a[3]) < 0.2;
  N.solids = (N.solids || []).filter((r) => !same(r, OLD));
  D.colliders = (D.colliders || []).filter((c) => c.id !== 'rqe_p9_margin' && !same(c.rect, OLD));
  const solids = [], colliders = [];
  const block = (id, rect) => { solids.push(rect.slice()); colliders.push({ id, rect: rect.slice() }); };
  block('rqe_b3_margin_far', [-198, 141, -178.35, 272.3]);
  block('rqe_b3_margin_mid', [-178.35, 182, -160.35, 272.3]);
  block('rqe_b3_margin_sw', [-198, -80, -178.35, 141.15]);
  block('rqe_b3_margin_nw', [-198, 272.3, -180, 460]);
  paint([-178.2, 141.2, -174.35, 181.6], 'S');
  paint([-162.15, 141.2, -159.2, 181.6], 'S');
  paint([-178.2, 141.2, -159.2, 143.85], 'S');
  paint([-174.4, 153.1, -162.1, 155.6], 'S');
  paint([-174.4, 165.1, -162.1, 167.6], 'S');
  paint([-178.2, 177.1, -159.2, 181.6], 'S');
  for (const ch of Object.values(root.SCENE_CHUNKS || {})) {
    if (ch && ch.objects) ch.objects = ch.objects.filter((o) => !(o.type === 'p_hedge' && o.x < -160 && o.x > -161.6 && o.y >= 140 && o.y < 183));
  }
  const p9 = root.SCENE_CHUNKS && root.SCENE_CHUNKS.rqe_p9_w;
  const STREET = ['rong', 'kapok', 'flame', 'camphor'];
  if (p9) {
    for (let y = 142; y < 182; y += 2) p9.objects.push({ id: 'rqb3_hedge_' + y, type: 'p_hedge', x: -179.15, y, rot: 6 });
    STREET.forEach((variant, i) => p9.objects.push({ id: 'rqb3_t_' + i, type: 'rq_x_tree', x: -176.55, y: [146, 151, 160, 172][i], variant }));
    for (const y of [148, 168]) p9.objects.push({ id: 'rqb3_lamp_' + y, type: 'p_lamp', x: -177.35, y, interact: 'lamp' });
  }
  for (const r of solids) N.solids.push(r.slice());
  D.colliders = D.colliders.concat(colliders);
  const reason = '井槐里线和南关路线各只允许两站，再加一站会被公交模块整段丢掉。万家桥路没有行车车道，候车亭保持静态。';
  N.expansionB3 = {
    phase: 'B3', unconfirmed: true,
    names: { lane: '槐溪口西巷' },
    lane: [-178.2, 141.2, -159.2, 181.6],
    buildings: [[-174, 144], [-174, 156], [-174, 168]],
    south: 'nanbu-p11',
    bus: { live: false, reason },
    sheet: 'gap-table',
  };
  if (N.expansionB2 && N.expansionB2.bus) N.expansionB2.bus.reason = reason;
  N.mapPois = (N.mapPois || []).concat([
    { id: 'b3_lane', name: '槐溪口西巷', x: -176.55, y: 160, desc: '围挡外三栋旧楼前的人行道。名字未经确认', cat: 'life' },
  ]);
})();
