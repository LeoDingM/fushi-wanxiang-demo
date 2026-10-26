/* P10：月河中心、澄江中心、东澜大厦大堂。沿用场景切换（portal → switchScene）。
 * 菜市场仍是唯一的无缝室内。上层门禁未开，没有样板层。名字未经Leo确认。 */
(function (SP) {
  'use strict';
  const A = SP && SP.modernResidence;
  if (!A || !A.opening || !SP.scenes || SP.rongqiaoP10Interior) return;
  const STREET = [391, 159.2, 'S'];
  const at = (id, type, x, y, more) => Object.assign({ id, type, x, y, z: 0, state: 'default' }, more);
  const id = 'yh_lobby';
  const w = 16, h = 8;
  const s = {
    format: 'fushi-scene', version: 2, id, name: '月河中心 · 首层大堂', interior: true, units: 'm', grid_m: 0.5,
    bounds: { x0: 0, y0: 0, x1: w, y1: h }, spawn: [8.2, 1.55, 'N'],
    objects: [], colliders: [], portals: [], laundry: [], puddles: [], leaf_piles: [], wires: [], npcs: [], events: {}, interactions: {},
  };
  s.ground = { origin: [0, 0], chunk: 1, cols: w, rows: h, legend: { T: 'g_terrazzo:default' }, data_south_to_north: Array(h).fill('T'.repeat(w)) };
  s.colliders.push(
    { id: id + '_edge_s', rect: [0, -0.3, w, 0.1] },
    { id: id + '_edge_n', rect: [0, h - 0.1, w, h + 0.3] },
    { id: id + '_edge_w', rect: [-0.3, 0, 0.1, h] },
    { id: id + '_edge_e', rect: [w - 0.1, 0, w + 0.3, h] },
  );
  for (let x = 0; x < w; x++) {
    s.objects.push(at(id + '_n_' + x, 'modern_intwall', x, h - 0.02, { state: 'plain' }));
    s.objects.push(at(id + '_s_' + x, 'modern_intwall', x, 0, { state: 'cut' }));
  }
  for (let y = 0; y < h; y++) {
    s.objects.push(at(id + '_w_' + y, 'modern_intwall', 0, y + 1, { rot: 6, state: 'cut' }));
    s.objects.push(at(id + '_e_' + y, 'modern_intwall', w - 0.02, y + 1, { rot: 6, state: 'plain' }));
  }
  A.opening(s, 'south', 7.4, 8.6);
  s.objects.push(at(id + '_exit', 'modern_intdoor', 7.4, 0.02, { state: 'closed', interact: 'portal', to: 'street', spawn: STREET, reach: [8.0, 1.15], label: '出门 · 回到河东大道（月河中心）', name: '出门' }));
  s.portals.push({ id: id + '_walk', rect: [7.3, 0.15, 8.7, 0.7], dir: 'S', to: 'street', spawn: STREET, label: '出门 · 回到河东大道（月河中心）' });
  s.objects.push(at(id + '_desk', 's_counter', 8.4, 4.0, { rot: 4, interact: 'notice', reach: [8.4, 3.2], name: '前台', note: '月河中心前台。访客在此登记。电梯和楼梯的上层门禁未开，这一批只有大堂。' }));
  s.objects.push(at(id + '_sofa', 'modern_sofa', 3.2, 2.8, { name: '大堂沙发' }));
  s.objects.push(at(id + '_chair', 'f_chair', 5.4, 2.6));
  s.objects.push(at(id + '_pot', 'p_planter', 13.2, 2.2));
  s.objects.push(at(id + '_dir', 'i_notice', 12.2, 4.6, { z: 1.15, interact: 'notice', reach: [12.2, 3.7], name: '大堂指南', note: '月河中心 · 1F 大堂。2F 及以上门禁未开。' }));
  s.objects.push(at(id + '_lift', 'modern_lift', 3.8, 6.0, { state: 'closed', interact: 'notice', reach: [5.0, 5.1], name: '电梯', note: '电梯门禁未开。上层不在这一批。' }));
  s.objects.push(at(id + '_lamp', 'i_pendant', 8.2, 3.0, { state: 'on' }));
  s.objects.push(at(id + '_lamp2', 'i_pendant', 8.2, 5.4, { state: 'on' }));
  SP.scenes[id] = s;
  const cjStreet = [511, 159.2, 'S'];
  const cid = 'cj_lobby';
  const cs = {
    format: 'fushi-scene', version: 2, id: cid, name: '澄江中心 · 首层大堂', interior: true, units: 'm', grid_m: 0.5,
    bounds: { x0: 0, y0: 0, x1: w, y1: h }, spawn: [8.2, 1.55, 'N'],
    objects: [], colliders: [], portals: [], laundry: [], puddles: [], leaf_piles: [], wires: [], npcs: [], events: {}, interactions: {},
  };
  cs.ground = { origin: [0, 0], chunk: 1, cols: w, rows: h, legend: { T: 'g_terrazzo:default' }, data_south_to_north: Array(h).fill('T'.repeat(w)) };
  cs.colliders.push(
    { id: cid + '_edge_s', rect: [0, -0.3, w, 0.1] },
    { id: cid + '_edge_n', rect: [0, h - 0.1, w, h + 0.3] },
    { id: cid + '_edge_w', rect: [-0.3, 0, 0.1, h] },
    { id: cid + '_edge_e', rect: [w - 0.1, 0, w + 0.3, h] },
  );
  for (let x = 0; x < w; x++) {
    cs.objects.push(at(cid + '_n_' + x, 'modern_intwall', x, h - 0.02, { state: 'plain' }));
    cs.objects.push(at(cid + '_s_' + x, 'modern_intwall', x, 0, { state: 'cut' }));
  }
  for (let y = 0; y < h; y++) {
    cs.objects.push(at(cid + '_w_' + y, 'modern_intwall', 0, y + 1, { rot: 6, state: 'cut' }));
    cs.objects.push(at(cid + '_e_' + y, 'modern_intwall', w - 0.02, y + 1, { rot: 6, state: 'plain' }));
  }
  A.opening(cs, 'south', 7.4, 8.6);
  cs.objects.push(at(cid + '_exit', 'modern_intdoor', 7.4, 0.02, { state: 'closed', interact: 'portal', to: 'street', spawn: cjStreet, reach: [8.0, 1.15], label: '出门 · 回到河东大道（澄江中心）', name: '出门' }));
  cs.portals.push({ id: cid + '_walk', rect: [7.3, 0.15, 8.7, 0.7], dir: 'S', to: 'street', spawn: cjStreet, label: '出门 · 回到河东大道（澄江中心）' });
  cs.objects.push(at(cid + '_desk', 's_counter', 4.2, 4.2, { rot: 4, interact: 'notice', reach: [4.2, 3.3], name: '前台', note: '澄江中心前台。访客在此登记。上层门禁未开，这一批只有大堂。' }));
  cs.objects.push(at(cid + '_sofa', 'modern_sofa', 11.4, 2.6, { name: '大堂沙发' }));
  cs.objects.push(at(cid + '_chair', 'f_chair', 10.2, 3.4));
  cs.objects.push(at(cid + '_pot', 'p_planter', 13.4, 5.2));
  cs.objects.push(at(cid + '_dir', 'i_notice', 12.4, 4.4, { z: 1.15, interact: 'notice', reach: [12.4, 3.5], name: '大堂指南', note: '澄江中心 · 1F 大堂。2F 及以上门禁未开。' }));
  cs.objects.push(at(cid + '_lift', 'modern_lift', 13.2, 6.2, { state: 'closed', interact: 'notice', reach: [12.2, 5.2], name: '电梯', note: '电梯门禁未开。上层不在这一批。' }));
  cs.objects.push(at(cid + '_lamp', 'i_pendant', 6.2, 3.2, { state: 'on' }));
  cs.objects.push(at(cid + '_lamp2', 'i_pendant', 9.4, 5.2, { state: 'on' }));
  SP.scenes[cid] = cs;
  const dlStreet = [705, 80.8, 'S'];
  const did = 'dl_lobby';
  const ds = {
    format: 'fushi-scene', version: 2, id: did, name: '东澜大厦 · 首层大堂', interior: true, units: 'm', grid_m: 0.5,
    bounds: { x0: 0, y0: 0, x1: w, y1: h }, spawn: [8.2, 1.55, 'N'],
    objects: [], colliders: [], portals: [], laundry: [], puddles: [], leaf_piles: [], wires: [], npcs: [], events: {}, interactions: {},
  };
  ds.ground = { origin: [0, 0], chunk: 1, cols: w, rows: h, legend: { T: 'g_terrazzo:default' }, data_south_to_north: Array(h).fill('T'.repeat(w)) };
  ds.colliders.push(
    { id: did + '_edge_s', rect: [0, -0.3, w, 0.1] },
    { id: did + '_edge_n', rect: [0, h - 0.1, w, h + 0.3] },
    { id: did + '_edge_w', rect: [-0.3, 0, 0.1, h] },
    { id: did + '_edge_e', rect: [w - 0.1, 0, w + 0.3, h] },
  );
  for (let x = 0; x < w; x++) {
    ds.objects.push(at(did + '_n_' + x, 'modern_intwall', x, h - 0.02, { state: 'plain' }));
    ds.objects.push(at(did + '_s_' + x, 'modern_intwall', x, 0, { state: 'cut' }));
  }
  for (let y = 0; y < h; y++) {
    ds.objects.push(at(did + '_w_' + y, 'modern_intwall', 0, y + 1, { rot: 6, state: 'cut' }));
    ds.objects.push(at(did + '_e_' + y, 'modern_intwall', w - 0.02, y + 1, { rot: 6, state: 'plain' }));
  }
  A.opening(ds, 'south', 7.4, 8.6);
  ds.objects.push(at(did + '_exit', 'modern_intdoor', 7.4, 0.02, { state: 'closed', interact: 'portal', to: 'street', spawn: dlStreet, reach: [8.0, 1.15], label: '出门 · 回到澜石南街（东澜大厦）', name: '出门' }));
  ds.portals.push({ id: did + '_walk', rect: [7.3, 0.15, 8.7, 0.7], dir: 'S', to: 'street', spawn: dlStreet, label: '出门 · 回到澜石南街（东澜大厦）' });
  ds.objects.push(at(did + '_desk', 's_counter', 3.4, 4.6, { rot: 4, interact: 'notice', reach: [4.6, 4.6], name: '前台', note: '东澜大厦前台。访客在此登记。上层门禁未开，这一批只有大堂。' }));
  ds.objects.push(at(did + '_sofa', 'modern_sofa', 9.2, 5.4, { name: '大堂沙发' }));
  ds.objects.push(at(did + '_chair', 'f_chair', 8.0, 4.2));
  ds.objects.push(at(did + '_pot', 'p_planter', 2.4, 2.2));
  ds.objects.push(at(did + '_pot2', 'p_planter', 14.2, 6.2));
  ds.objects.push(at(did + '_dir', 'i_notice', 12.6, 2.4, { z: 1.15, interact: 'notice', reach: [12.6, 1.8], name: '大堂指南', note: '东澜大厦 · 1F 大堂。2F 及以上门禁未开。' }));
  ds.objects.push(at(did + '_lift', 'modern_lift', 14.0, 5.4, { state: 'closed', interact: 'notice', reach: [12.6, 5.0], name: '电梯', note: '电梯门禁未开。上层不在这一批。' }));
  ds.objects.push(at(did + '_lamp', 'i_pendant', 5.2, 3.6, { state: 'on' }));
  ds.objects.push(at(did + '_lamp2', 'i_pendant', 10.4, 3.0, { state: 'on' }));
  SP.scenes[did] = ds;
  SP.rongqiaoP10Interior = { id, also: cid, and: did, street: STREET.slice(), cjStreet: cjStreet.slice(), dlStreet: dlStreet.slice() };
})(typeof window !== 'undefined' ? window.SP : globalThis.SP);
