/* E4e (2026-10-18): 万家花园 residents' lift + stair core of 万家菜市场综合楼 — the core's street door (west strip, beside the market's
 * W gate, never through the market) leads into separate interior scenes, the same scene switch and floor menu as the 云境 B tower
 * (geometry helpers from SP.modernResidence): 1F lobby, then the residential floors 4–12 (the core skips the 2–3F commercial podium,
 * which has its own stair door on the east service lane). Floors 4–9 also carry the corridor door to tower B across the 4F roof
 * garden; 10–12F are tower A only. Flats are private (locked). The lift is presentation only (no saved lift state: a ride is a short
 * scripted wait, G.busy while it runs); the scene the player stands in is saved by the native progress save like every interior.
 * Names 未经Leo确认. */
(function (SP) {
  'use strict';
  const A = SP && SP.modernResidence, G = SP && SP.game, W = SP && SP.world, MK = SP && SP.rongqiaoMarket3;
  if (!A || !G || !W || !MK || SP.rqM3Residence) return;
  const TOP = MK.data.floors, DOOR = MK.data.door, LOBBY = 'rqm3_lobby', floorId = (n) => (n === 1 ? LOBBY : `rqm3_floor_${String(n).padStart(2, '0')}`);
  const LEVELS = [1].concat(Array.from({ length: TOP - 3 }, (_, i) => i + 4)), B_TOP = (MK.data.towers || []).reduce((m, t) => (t.id === 'b' ? t.floors : m), 0);
  function scene(n) {
    const lobby = n === 1, id = floorId(n), h = lobby ? 7 : 5.4;
    const s = { format: 'fushi-scene', version: 2, id, name: `万家花园 · ${lobby ? '首层大堂（住户）' : n + '楼住户走廊' + (n <= B_TOP ? '（A座 · 通B座）' : '（A座）')}`, interior: true, units: 'm', grid_m: 0.5, rqm3Floor: n,
      bounds: { x0: 0, y0: 0, x1: 15, y1: h }, spawn: [7.15, lobby ? 4.3 : 1.9, 'S'], objects: [], colliders: [], portals: [], laundry: [], puddles: [], leaf_piles: [], wires: [], npcs: [], events: {}, interactions: {} };
    const north = lobby ? 5.4 : 2.8, add = (oid, type, x, y, more) => s.objects.push(Object.assign({ id: oid, type, x, y, z: 0, state: 'default' }, more));
    s.ground = { origin: [0, 0], chunk: 1, cols: 15, rows: Math.ceil(h), legend: { T: 'g_terrazzo:default' }, data_south_to_north: Array(Math.ceil(h)).fill('T'.repeat(15)) };
    for (const [edge, r] of [['s', [0, -0.3, 15, 0.1]], ['n', [0, h - 0.1, 15, h + 0.3]], ['w', [-0.3, 0, 0.1, h]], ['e', [14.9, 0, 15.3, h]]]) s.colliders.push({ id: id + '_' + edge, rect: r });
    for (let x = 0; x < 15; x++) { add(id + '_n_' + x, 'modern_intwall', x, h - 0.02, { state: 'plain' }); add(id + '_s_' + x, 'modern_intwall', x, 0, { state: 'cut' }); }
    for (let y = 0; y < h; y++) { const span = Math.min(1, h - y), type = span < 0.99 ? 'modern_wall_' + Math.round(span * 100) : 'modern_intwall'; add(id + '_w_' + y, type, 0, y + span, { rot: 6, state: 'cut' }); add(id + '_e_' + y, type, 14.98, y + span, { rot: 6, state: 'plain' }); }
    add(id + '_lift', 'modern_lift', 6.4, north, { state: 'closed', interact: 'rqm3_lift', reach: [7.15, north - 0.85], name: `万家花园电梯 · ${n}楼` });
    add(id + '_stairs', 'modern_stairflight', 12.25, north - 0.3, { interact: 'rqm3_stairs', reach: [13, north - 0.8], name: '万家花园楼梯' });
    A.circulationStructure(s, 6.4, 12.25, north, 15);
    if (lobby) {
      A.opening(s, 'south', 7, 8.1);
      add('rqm3_exit', 'modern_intdoor', 7, 0.02, { state: 'closed', interact: 'rqm3_portal', to: 'street', spawn: [DOOR[0], DOOR[1] - 1.2, 'S'], reach: [7.5, 1.15], name: '出门 · 万家菜市场综合楼西侧' });
      add('rqm3_mailboxes', 'i_mailbox', 2, 5.9); add('rqm3_notice', 'i_notice', 4, 5.9); add('rqm3_bench', 'modern_sofa', 2.9, 2.5); add('rqm3_lobby_light', 'i_pendant', 5, 3.8, { state: 'on' });
    } else {
      const doors = [[1.6, `A${n}01`], [4.4, `A${n}02`], [9.4, `A${n}03`]].concat(n <= B_TOP ? [[12.0, 'B']] : [[12.0, `A${n}04`]]);
      for (const [x, nm] of doors) { A.opening(s, 'south', x, x + 1.1); add(`${id}_door_${x}`, 'modern_intdoor', x, 0.02, { state: 'closed', interact: 'rqm3_door', reach: [x + 0.5, 1.0], name: nm === 'B' ? `B座 ${n}楼 · ${n === 4 ? '经屋顶花园' : '连廊'}（住户门禁）` : `万家花园 ${nm} · 私宅`, b: nm === 'B' }); }
      add(id + '_light', 'i_pendant', 5.5, 1.7, { state: 'on' });
    }
    return s;
  }
  for (const n of LEVELS) SP.scenes[floorId(n)] = scene(n);
  let ride = null;
  const busy0 = G.busy, use0 = G.use, action0 = G.actionFor;
  G.busy = function () { return busy0.call(G) || !!ride; };
  const here = () => (W.interior && W.data && W.data.rqm3Floor) || 0;
  G.actionFor = function (o, kind) {
    if (o && kind === 'use') {
      if (!W.interior && o.interact === 'rqm3_res_entry') return { label: '进入万家花园住户大堂（电梯 / 楼梯）', do: 'game' };
      if (!W.interior && o.interact === 'rqm3_com_entry') return { label: '看看 · ' + o.name, do: 'game' };
      if (here()) { if (o.interact === 'rqm3_lift') return { label: '乘电梯 · 选楼层', do: 'game' }; if (o.interact === 'rqm3_stairs') return { label: '走楼梯 · 上下一层', do: 'game' };
        if (o.interact === 'rqm3_portal') return { label: o.name, do: 'game' }; if (o.interact === 'rqm3_door') return { label: o.b ? '刷门禁 · ' + o.name : '敲门（住户私宅）', do: 'game' }; }
    }
    return action0.call(G, o, kind);
  };
  G.use = function (o) {
    if (!o) return use0.call(G, o); const k = o.interact;
    if (!W.interior && k === 'rqm3_res_entry') { G.go({ to: LOBBY, spawn: [7.5, 1.25, 'N'], door: o.id }); return null; }
    if (!W.interior && k === 'rqm3_com_entry') return '商业楼梯口贴着「2–3F 社区商业 · 装修中 · 敬请期待」：康贝口腔、万家大药房、万家茶楼、启航培优、活力健身、阿杰美发。';
    if (!here()) return use0.call(G, o);
    if (k === 'rqm3_portal') { G.go({ to: o.to, spawn: o.spawn, door: o.id }); return null; }
    if (k === 'rqm3_door') return o.b ? (here() === 4 ? '推门就是 4F 屋顶花园（住户专用 06:00–22:00）：草坪、樱花和桃树、凉亭长椅、儿童滑梯；东南角是云顶餐厅的玻璃楼。穿过花园才到B座——你没有B座门禁卡，只在门口看了看。' : `${o.name}：你没有B座门禁卡。`) : '住户私宅，房门锁闭。';
    if (k === 'rqm3_lift') { const n0 = here();
      G.openMenu(o, LEVELS.map((to) => ({ id: 'rqm3_lift_' + to, label: `${to}楼${to === 1 ? ' · 大堂' : ''}${to === n0 ? '（本层）' : ''}`, ok: to !== n0, reason: '本层',
        fn: () => { G.closeMenu(); ride = to; G.later(0.6 + Math.abs(to - n0) * 0.12, () => { ride = null; G.go({ to: floorId(to), spawn: [7.15, to === 1 ? 4.3 : 1.9, 'S'], door: o.id }); }); return '万家花园电梯已呼叫'; } })));
      return null; }
    if (k === 'rqm3_stairs') { const n0 = here();
      const k0 = LEVELS.indexOf(n0);   // the core stair runs past the podium floors without a door: 1F <-> 4F is one flight
      G.openMenu(o, [1, -1].filter((d) => LEVELS[k0 + d]).map((d) => { const to = LEVELS[k0 + d]; return { id: 'rqm3_stair_' + to, label: `${d > 0 ? '上' : '下'}楼 → ${to}楼`, ok: true,
        fn: () => { G.go({ to: floorId(to), spawn: [13, to === 1 ? 1.8 : 0.55, 'S'], door: o.id }); return null; } }; }));
      return null; }
    return use0.call(G, o);
  };
  SP.rqM3Residence = { LOBBY, TOP, LEVELS, B_TOP, floorId, scene, riding: () => ride };
})(window.SP);
