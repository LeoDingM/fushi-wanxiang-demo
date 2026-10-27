/* Site99 (2026-10-24): 月湾汇 and one E5 office use the original scene switch (F / portal → switchScene).
 * Leo 2026-10-17: only wet markets stay seamless open-interior. These rooms reuse the modern lobby shell,
 * stair flight, lift and shop kit — no new renderer. Names 月湾汇 / 月湾中心 stay 未经Leo确认.
 * The kit has no escalator frame; the mall flight is the existing stair, labelled 扶梯/楼梯. */
(function (SP) {
  'use strict';
  const A = SP && SP.modernResidence, G = SP && SP.game, W = SP && SP.world;
  if (!A || !G || !W || !A.opening || !SP.scenes || SP.rongqiaoE5Interiors) return;
  const MALL_STREET = [128.5, 314.7, 'S'], OFFICE_STREET = [114.5, 408.7, 'S'];
  const MALL = { 1: 'ywh_l1', 2: 'ywh_l2', 3: 'ywh_l3' };
  const MALL_NAME = { 1: '1F 中庭', 2: '2F 零售', 3: '3F 美食广场' };
  const OFF = { 1: 'ywz_lobby', 12: 'ywz_f12' };
  const OFF_NAME = { 1: '1F 大堂', 12: '12F 样板办公' };
  const at = (id, type, x, y, more) => Object.assign({ id, type, x, y, z: 0, state: 'default' }, more);
  function shell(id, name, w, h) {
    const s = { format: 'fushi-scene', version: 2, id, name, interior: true, units: 'm', grid_m: 0.5,
      bounds: { x0: 0, y0: 0, x1: w, y1: h }, spawn: [w / 2, 1.7, 'N'],
      objects: [], colliders: [], portals: [], laundry: [], puddles: [], leaf_piles: [], wires: [], npcs: [], events: {}, interactions: {} };
    s.ground = { origin: [0, 0], chunk: 1, cols: w, rows: h, legend: { T: 'g_terrazzo:default' }, data_south_to_north: Array(h).fill('T'.repeat(w)) };
    s.colliders.push({ id: id + '_edge_s', rect: [0, -0.3, w, 0.1] }, { id: id + '_edge_n', rect: [0, h - 0.1, w, h + 0.3] }, { id: id + '_edge_w', rect: [-0.3, 0, 0.1, h] }, { id: id + '_edge_e', rect: [w - 0.1, 0, w + 0.3, h] });
    for (let x = 0; x < w; x++) { s.objects.push(at(id + '_n_' + x, 'modern_intwall', x, h - 0.02, { state: 'plain' }), at(id + '_s_' + x, 'modern_intwall', x, 0, { state: 'cut' })); }
    for (let y = 0; y < h; y++) { s.objects.push(at(id + '_w_' + y, 'modern_intwall', 0, y + 1, { rot: 6, state: 'cut' }), at(id + '_e_' + y, 'modern_intwall', w - 0.02, y + 1, { rot: 6, state: 'plain' })); }
    return s;
  }
  function wall(s, id, x0, y0, x1, y1) {
    const vertical = Math.abs(x1 - x0) < 0.01, len = vertical ? y1 - y0 : x1 - x0;
    s.colliders.push({ id, rect: vertical ? [x0 - 0.065, y0, x0 + 0.065, y1] : [x0, y0 - 0.065, x1, y0 + 0.065] });
    for (let t = 0; t < len - 0.001; t += 1) s.objects.push(at(id + '_' + t, 'modern_intwall', x0 + (vertical ? 0 : t), y0 + (vertical ? t + 1 : 0), { state: 'plain', rot: vertical ? 6 : 0 }));
  }
  function add(s, id, type, x, y, more) { s.objects.push(at(id, type, x, y, more)); }
  function exitDoor(s, id, x, street, label) {
    A.opening(s, 'south', x, x + 1.2);
    add(s, id, 'modern_intdoor', x, 0.02, { state: 'closed', interact: 'portal', to: 'street', spawn: street, reach: [x + 0.6, 1.15], label, name: label });
    s.portals.push({ id: id + '_walk', rect: [x - 0.1, 0.15, x + 1.3, 0.7], dir: 'S', to: 'street', spawn: street, label });
  }
  function shopRow(s, id, xWall, shops) {
    wall(s, id + '_a', xWall, 0.5, xWall, 2.5);
    wall(s, id + '_b', xWall, 3.5, xWall, 6.5);
    wall(s, id + '_c', xWall, 7.5, xWall, 11.5);
    const west = xWall < 9, shelfX = west ? 0.55 : 17.15, counterX = west ? 2.3 : 15.5;
    shops.forEach((shop, i) => {
      const y = i === 0 ? 1.7 : 8.6, gapY = i === 0 ? 3.0 : 7.0;
      add(s, id + '_shelf_' + i, 'f_shelf', shelfX, y, { rot: west ? 0 : 2, name: shop[0] });
      add(s, id + '_counter_' + i, 's_counter', counterX, y + 0.4, { rot: west ? 6 : 2, interact: 'ywh_look', reach: [west ? 3.2 : 14.6, gapY], name: shop[0], blurb: shop[1] });
      add(s, id + '_lamp_' + i, 'i_pendant', counterX, y + 0.2, { state: 'on' });
    });
  }
  function mallFloor(n) {
    const id = MALL[n], s = shell(id, '月湾汇 · ' + MALL_NAME[n], 18, 12);
    s.ywhFloor = n; s.spawn = [9.2, 1.7, 'N'];
    exitDoor(s, id + '_exit', 8.4, MALL_STREET, '出门 · 回到月湾路（月湾汇）');
    if (n < 3) {
      const pair = n === 1 ? [['潮玩社', '潮玩社在营业：手办和盲盒摆到门口，可以进去看看。'], ['湾边书店', '湾边书店在营业：新书和杂志，收银台在里面。']] : [['着装', '着装在营业：当季成衣，试衣间在店内左侧。'], ['数码港', '数码港在营业：手机和配件，可以让店员开一台样机。']];
      const pairE = n === 1 ? [['橙叶茶饮', '橙叶茶饮在营业：现做茶饮，小食在柜台上。'], ['月湾烘焙', '月湾烘焙在营业：面包和蛋糕，可以店内坐一会。']] : [['花间', '花间在营业：鲜花和绿植，包装在柜台后面。'], ['明视眼镜', '明视眼镜在营业：验光和镜框，样片在抽屉里。']];
      shopRow(s, id + '_w', 4, pair); shopRow(s, id + '_e', 14, pairE);
      add(s, id + '_sofa_w', 'modern_sofa', 6.1, 5.3, { name: '中庭休息沙发' });
      add(s, id + '_sofa_e', 'modern_sofa', 11.4, 5.3, { name: '中庭休息沙发' });
      add(s, id + '_tea', 'f_table', 8.8, 5.0); add(s, id + '_chair', 'f_chair', 8.8, 4.3);
      add(s, id + '_pot_w', 'p_planter', 5.4, 3.8); add(s, id + '_pot_e', 'p_planter', 12.6, 3.8);
    } else {
      [['兰州拉面', '档口在出餐：牛肉面，座位在中庭。'], ['麻辣香锅', '档口在出餐：香锅称重，米饭在保温柜。'], ['果汁吧', '档口在出餐：鲜榨果汁和冰沙。']].forEach((shop, i) => {
        const x = 2.2 + i * 5.2;
        add(s, id + '_stall_' + i, 's_counter', x, 9.2, { rot: 4, interact: 'ywh_look', reach: [x, 8.3], name: shop[0], blurb: shop[1] });
        add(s, id + '_stall_lamp_' + i, 'i_pendant', x, 8.6, { state: 'on' });
      });
      for (const [x, y] of [[5.2, 4.2], [5.2, 6.4], [12.2, 4.2], [12.2, 6.4]]) {
        add(s, id + '_table_' + x + '_' + y, 'f_table', x, y);
        add(s, id + '_seat_' + x + '_' + y, 'f_chair', x, y - 0.7);
      }
      add(s, id + '_pot', 'p_planter', 9.0, 3.4);
    }
    add(s, id + '_dir', 'i_notice', 6.0, 2.35, { z: 1.15, interact: 'notice', reach: [6.9, 2.0], name: '月湾汇楼层导览', note: '月湾汇 · 1F 中庭（潮玩社、湾边书店、橙叶茶饮、月湾烘焙）· 2F 零售（着装、数码港、花间、明视眼镜）· 3F 美食广场。扶梯和电梯在中庭北侧。4–5层是玻璃退台和屋顶乐园，从室外屋顶进。' });
    add(s, id + '_stair', 'modern_stairflight', 6.6, 9.7, { interact: 'ywh_stairs', reach: [7.8, 8.8], name: '扶梯 / 楼梯' });
    add(s, id + '_lift', 'modern_lift', 11.3, 9.9, { state: 'closed', interact: 'ywh_lift_door', reach: [12.3, 8.9], name: '商场电梯' });
    add(s, id + '_lamp_a', 'i_pendant', 9.0, 3.6, { state: 'on' }); add(s, id + '_lamp_b', 'i_pendant', 9.0, 7.2, { state: 'on' });
    return s;
  }
  function officeLobby() {
    const id = OFF[1], s = shell(id, '月湾中心 · 首层大堂', 16, 8);
    s.ywzFloor = 1; s.spawn = [8.2, 1.55, 'N'];
    exitDoor(s, id + '_exit', 7.4, OFFICE_STREET, '出门 · 回到月湾北路（月湾中心）');
    add(s, id + '_desk', 's_counter', 8.4, 4.0, { rot: 4, interact: 'ywz_look', reach: [8.4, 3.2], name: '前台', blurb: '月湾中心前台：访客在此登记。电梯在西侧，楼梯在东侧，12F 是开放的样板办公层，其余楼层要门禁。' });
    add(s, id + '_sofa', 'modern_sofa', 3.2, 2.8, { name: '大堂沙发' });
    add(s, id + '_chair', 'f_chair', 5.4, 2.6); add(s, id + '_pot', 'p_planter', 13.2, 2.2);
    add(s, id + '_dir', 'i_notice', 12.2, 4.6, { z: 1.15, interact: 'notice', reach: [12.2, 3.7], name: '大堂指南', note: '月湾中心 · 1F 大堂 · 12F 样板办公层可乘电梯或走楼梯。2–11F、13–24F 为入驻企业，门禁未开。' });
    add(s, id + '_stair', 'modern_stairflight', 11.0, 5.9, { interact: 'ywz_stairs', reach: [12.0, 5.0], name: '消防楼梯' });
    add(s, id + '_lift', 'modern_lift', 3.8, 6.0, { state: 'closed', interact: 'ywz_lift_door', reach: [5.0, 5.1], name: '月湾中心电梯' });
    add(s, id + '_lamp', 'i_pendant', 8.2, 3.0, { state: 'on' }); add(s, id + '_lamp2', 'i_pendant', 8.2, 5.4, { state: 'on' });
    return s;
  }
  function officeFloor() {
    const id = OFF[12], s = shell(id, '月湾中心 · 12F 样板办公', 16, 10);
    s.ywzFloor = 12; s.spawn = [6.2, 6.4, 'S'];
    add(s, id + '_sign', 'i_notice', 8.2, 5.6, { z: 1.15, interact: 'notice', reach: [8.2, 4.8], name: '12F 门牌', note: '12F 样板层：开放办公位和一间会议桌。电梯回 1F 大堂。其他楼层门禁未开。' });
    for (const [x, y] of [[2.2, 2.2], [2.2, 4.2], [10.2, 2.2], [10.2, 4.2]]) {
      add(s, id + '_desk_' + x + '_' + y, 'f_desk', x, y, { state: 'off', name: '办公桌' });
      add(s, id + '_chair_' + x + '_' + y, 'f_chair', x + 0.9, y - 0.15);
    }
    add(s, id + '_meet', 'f_table', 6.4, 3.2, { name: '会议桌' }); add(s, id + '_meet_c', 'f_chair', 6.4, 2.5);
    add(s, id + '_shelf', 'f_shelf', 14.4, 2.4, { rot: 2, name: '文件柜' });
    add(s, id + '_pot', 'p_planter', 14.2, 5.2);
    add(s, id + '_stair', 'modern_stairflight', 11.0, 7.8, { interact: 'ywz_stairs', reach: [12.0, 6.9], name: '消防楼梯' });
    add(s, id + '_lift', 'modern_lift', 3.8, 8.0, { state: 'closed', interact: 'ywz_lift_door', reach: [5.0, 7.1], name: '月湾中心电梯 · 12楼' });
    add(s, id + '_lamp', 'i_pendant', 6.0, 3.4, { state: 'on' }); add(s, id + '_lamp2', 'i_pendant', 11.0, 3.6, { state: 'on' });
    return s;
  }
  const mallSpawn = () => [7.8, 8.15, 'S'];
  const offSpawn = (n) => (n === 1 ? [6.4, 4.6, 'S'] : [6.2, 6.4, 'S']);
  for (const n of [1, 2, 3]) SP.scenes[MALL[n]] = mallFloor(n);
  SP.scenes[OFF[1]] = officeLobby(); SP.scenes[OFF[12]] = officeFloor();
  let riding = null;
  const busy0 = G.busy, use0 = G.use, action0 = G.actionFor;
  G.busy = function () { return busy0.call(G) || !!riding; };
  const mallHere = () => (W.interior && W.data && W.data.ywhFloor) || 0;
  const offHere = () => (W.interior && W.data && W.data.ywzFloor) || 0;
  function choices(table, names, here) {
    return Object.keys(table).map(Number).filter((n) => n !== here).map((n) => ({ n, id: 'e5fl_' + table[n], label: names[n], ok: true }));
  }
  G.actionFor = function (o, kind) {
    if (o && kind === 'use') {
      if (o.interact === 'ywh_stairs' && mallHere()) return { label: '扶梯 / 楼梯 · 换层', do: 'game' };
      if (o.interact === 'ywh_lift_door' && mallHere()) return { label: '乘电梯 · 选楼层', do: 'game' };
      if (o.interact === 'ywh_look' && mallHere()) return { label: o.name, do: 'game' };
      if (o.interact === 'ywz_stairs' && offHere()) return { label: '走楼梯 · 换层', do: 'game' };
      if (o.interact === 'ywz_lift_door' && offHere()) return { label: '乘电梯 · 选楼层', do: 'game' };
      if (o.interact === 'ywz_look' && offHere()) return { label: o.name, do: 'game' };
    }
    return action0.call(G, o, kind);
  };
  G.use = function (o) {
    if (!o) return use0.call(G, o);
    const k = o.interact;
    if (k === 'ywh_look' && mallHere()) return o.blurb;
    if (k === 'ywz_look' && offHere()) return o.blurb;
    if ((k === 'ywh_stairs' || k === 'ywh_lift_door') && mallHere()) {
      const here = mallHere(), wait = k === 'ywh_lift_door';
      G.openMenu(Object.assign({}, o, { _name: wait ? '商场电梯' : '扶梯 / 楼梯' }), choices(MALL, MALL_NAME, here).map((c) => Object.assign(c, { fn: () => {
        const go = () => G.go({ to: MALL[c.n], spawn: mallSpawn(), door: o.id });
        if (!wait) { go(); return null; }
        riding = MALL[c.n]; G.later(0.65, () => { riding = null; go(); }); return '电梯已呼叫';
      } })));
      return null;
    }
    if ((k === 'ywz_stairs' || k === 'ywz_lift_door') && offHere()) {
      const here = offHere(), wait = k === 'ywz_lift_door';
      G.openMenu(Object.assign({}, o, { _name: wait ? '月湾中心电梯' : '消防楼梯' }), choices(OFF, OFF_NAME, here).map((c) => Object.assign(c, { fn: () => {
        const go = () => G.go({ to: OFF[c.n], spawn: offSpawn(c.n), door: o.id });
        if (!wait) { go(); return null; }
        riding = OFF[c.n]; G.later(0.7 + Math.abs(c.n - here) * 0.03, () => { riding = null; go(); }); return '电梯已呼叫';
      } })));
      return null;
    }
    return use0.call(G, o);
  };
  SP.rongqiaoE5Interiors = { MALL, OFF, MALL_STREET, OFFICE_STREET, mallSpawn, offSpawn, riding: () => riding };
})(typeof window !== 'undefined' ? window.SP : undefined);
