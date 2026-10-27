/* 南关路 live traffic (Leo 2026-10-18 02:38): the traffic model now supports several intersections, so the four-lane avenue
 * gets real lanes — eastbound / westbound on the inner lanes (the kerb lanes keep the parking bays) — and the 槐北街
 * junction becomes a fixed-time signalised box 'ix_ng' (槐北街 green 16 s, amber 3, all-red 2, 南关路 green 20 s, amber 3,
 * all-red 2). Zebras across 南关路 at x -67 / 12 / 38 get stop lines and yield like every other zebra; signal heads on
 * mast arms at the four corners (lit lamp drawn by SP.traffic). Cars still spawn only at the lane ends off the walkable
 * area and never teleport. Pure data; loaded after rongqiao_expand_e3.js. Timings / layout 未经Leo确认. */
(function () {
  'use strict';
  const D = window.SCENE_DATA; if (!D || !D.rongqiaoExpandE3 || D.rongqiaoTrafficNg) return; D.rongqiaoTrafficNg = 1;
  const T = D.traffic, X0 = -128, X1 = 302, EB = -71.5, WB = -68.5, IX = { id: 'ix_ng', x0: 22, x1: 28, y0: -76, y1: -64 };
  T.intersections = T.intersections || [Object.assign({ id: 'ix' }, T.intersection)];
  if (!T.intersections.some((b) => b.id === IX.id)) T.intersections.push(IX);
  T.signals = Object.assign({}, T.signals, { ix_ng: { cycle: [['y', 16], ['y_amber', 3], ['all', 2], ['x', 20], ['x_amber', 3], ['all', 2]], offset: 0 } });
  const CWS = [{ id: 'cw_ng_lj', x0: -69, x1: -65 }, { id: 'cw_ng_w', x0: 10, x1: 14 }, { id: 'cw_ng_e', x0: 36, x1: 40 }].map((c) => Object.assign(c, { y0: -76, y1: -64, road: 'x' }));
  for (const c of CWS) if (!T.crosswalks.some((w) => w.id === c.id)) T.crosswalks.push(c);
  const eb = { id: 'eb_ng', axis: 'x', c: EB, dir: 1, rot: 2, range: [X0, X1], stops: [] }, wb = { id: 'wb_ng', axis: 'x', c: WB, dir: -1, rot: 6, range: [X0, X1], stops: [] };
  for (const c of CWS) { eb.stops.push({ at: c.x0 - 0.4, cw: c.id }); wb.stops.push({ at: c.x1 + 0.4, cw: c.id }); }
  eb.stops.push({ at: IX.x0 - 0.4, box: IX.id }); wb.stops.push({ at: IX.x1 + 0.4, box: IX.id });
  eb.stops.sort((a, b) => a.at - b.at); wb.stops.sort((a, b) => b.at - a.at);
  if (!T.lanes.some((l) => l.id === eb.id)) T.lanes.push(eb, wb);
  for (const l of T.lanes) {
    if (l.id === 'nb' && !l.stops.some((s) => s.box === IX.id)) { l.stops.push({ at: IX.y0 - 0.4, box: IX.id, also: ['cw_ng'] }); l.stops.sort((a, b) => a.at - b.at); }
    if (l.id === 'sb' && !l.stops.some((s) => s.box === IX.id)) { l.stops.push({ at: -59.6, box: IX.id }); l.stops.sort((a, b) => b.at - a.at); }
  }
  eb.max = 4; wb.max = 4;   // own caps: the old streets keep max_cars (11) to themselves
  // signal heads: { id, box, axis (the approach it controls), x, y, z (head centre), face (the lamp face), pole }
  const HEADS = [['nb', 28.8, -77.0, 'y'], ['sb', 21.2, -59.0, 'y'], ['eb', 21.2, -76.9, 'x'], ['wb', 28.8, -63.1, 'x']];
  const ARM = { nb: [-2.3, 0, 's'], sb: [2.3, 0, 'n'], eb: [0, 5.3, 'w'], wb: [0, -5.3, 'e'] };
  T.signalHeads = HEADS.map(([v, x, y, axis]) => ({ id: 'sig_ng_' + v, box: IX.id, axis, x: +(x + ARM[v][0]).toFixed(2), y: +(y + ARM[v][1]).toFixed(2), z: 5.4, face: ARM[v][2], pole: [x, y], variant: v }));
  // chunk content (outside the save contract): poles + stop lines
  const CH = window.SCENE_CHUNKS || {}, chunkOf = (x, y) => (x < -42 ? 'rqe_e3_sw' : x < 58 ? 'rqe_e3_s_w' : 'rqe_e3_s_e');
  const add = (id, type, x, y, more) => { const c = CH[chunkOf(x, y)]; if (c && !c.objects.some((o) => o.id === id)) c.objects.push(Object.assign({ id, type, x: +x.toFixed(2), y: +y.toFixed(2) }, more || {})); };
  for (const h of T.signalHeads) add('rqtn_' + h.id, 'rq_x_signal_' + h.variant, h.pole[0], h.pole[1]);
  const lines = [];
  for (const c of CWS) { for (const y of [EB, EB - 3]) lines.push([c.id + '_eb' + y, c.x0 - 0.2, y]); for (const y of [WB, WB + 3]) lines.push([c.id + '_wb' + y, c.x1 + 0.2, y]); }
  for (const y of [EB, EB - 3]) lines.push(['ix_eb' + y, IX.x0 - 0.2, y]); for (const y of [WB, WB + 3]) lines.push(['ix_wb' + y, IX.x1 + 0.2, y]);
  lines.forEach(([k, x, y]) => add('rqtn_stop_' + k, 'd_stopline', x, y));
  add('rqtn_stop_ix_nb', 'd_stopline', 26.5, IX.y0 - 0.2, { rot: 2 });
  D.rongqiaoTrafficNgInfo = { lanes: [eb.id, wb.id], box: IX.id, crosswalks: CWS.map((c) => c.id), heads: T.signalHeads.length, unconfirmed: true };
})();
