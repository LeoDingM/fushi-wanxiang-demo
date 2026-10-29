/* 南关路公交线 (E4d, Leo 08:08 brief): the existing two-stop street bus (js/community_bus.js) gains a 南关路 line on the live
 * eb_ng / wb_ng lanes — westbound 南关路东 → 南关路西 boarding at the E3 north shelters (x 270 / -15), eastbound 南关路西 →
 * 南关路东 at two new south-pavement stop signs (x -10 / 266). Same physical buses, fare ¥2, hours, curbside boarding and safe
 * alighting as the old line; no new save field (ps.communityBus keeps counting rides). Stop names / positions 未经Leo确认.
 * Pure data; loaded after rongqiao_traffic_ng.js and before js/community_bus.js. */
(function () {
  'use strict';
  const D = window.SCENE_DATA; if (!D || !D.rongqiaoTrafficNg || D.rongqiaoBusNg) return;
  const T = D.traffic; if (!T || !T.lanes.some((l) => l.id === 'eb_ng') || !T.lanes.some((l) => l.id === 'wb_ng')) return;
  const CH = window.SCENE_CHUNKS || {}, chunkOf = (x) => (x < -42 ? 'rqe_e3_sw' : x < 58 ? 'rqe_e3_s_w' : 'rqe_e3_s_e');
  const find = (id) => { for (const k of Object.keys(CH)) if (k.startsWith('rqe_e3')) { const o = CH[k].objects?.find((q) => q.id === id); if (o) return o; } return null; };
  // wb_ng: bus front stops 3 m past the stop (same offset as the old line), eb_ng likewise in its own direction
  const stops = [
    { id: 'rqe3_ng_bus_ee', name: '南关路东', reach: [270, -63.0], lane: 'wb_ng', frontStop: 267, side: 'north' },
    { id: 'rqe3_ng_bus_n', name: '南关路西', reach: [-15, -63.0], lane: 'wb_ng', frontStop: -18, side: 'north' },
    { id: 'rqbn_sign_w', name: '南关路西', reach: [-10, -77.2], lane: 'eb_ng', frontStop: -7, side: 'south', sign: [-10, -78.6, 'ngw'] },
    { id: 'rqbn_sign_e', name: '南关路东', reach: [266, -77.2], lane: 'eb_ng', frontStop: 269, side: 'south', sign: [266, -78.6, 'nge'] },
  ];
  for (const s of stops) {
    if (s.sign) { const c = CH[chunkOf(s.sign[0])]; if (c && !c.objects.some((o) => o.id === s.id)) c.objects.push({ id: s.id, type: 'rq_x_busstop', x: s.sign[0], y: s.sign[1], variant: s.sign[2] }); }
    const o = find(s.id); if (o) { o.interact = 'community_bus_stop'; o.reach = s.reach.slice(); o.name = s.name + '公交站'; }
  }
  D.rongqiaoBusNg = { stops, line: '南关路线', unconfirmed: true };
})();
