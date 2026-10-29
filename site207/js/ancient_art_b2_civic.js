/* 影视城古镇 art preview — civic: 南薰门 city wall + gate tower, 梦华府 衙门 gate with 八字墙, 鸣冤鼓, 公堂.
 * Site198：南薰门墙身/垛口/女墙改 atlas kitbash（city_brick/merlon/parapet）。
 * Site209：南薰门/衙署大门 门钉铺首/门槛/抱鼓 densify。未经Leo确认. */
(function (root) {
  'use strict';
  const { A, shade, C, H } = root.AncientCore;
  const X = root.AncientParts, ST = root.AncientStreet;
  const { RED, RED_W, WOOD, WOOD_D, PLASTER, PLASTER_W, STONE, STONE_W, GOLD } = C;
  const WB = '#8e8b84', WB_W = '#75726b';   // city-wall brick
  function arch(cx, w, zs, zt, n) { const pts = [], r = w / 2; for (let i = 0; i <= n; i++) { const a = Math.PI * i / n; pts.push([cx + Math.cos(a) * r, zs + Math.sin(a) * (zt - zs)]); } return pts; }
  function studdedDoor(d, y, x0, x1, z0, z1, col) {
    const h = H(d); col = col || '#8a2a1e';
    h.QS(y, x0, z0, x1, z1, col, shade(col, 0.45));
    for (let x = x0 + 0.18; x < x1 - 0.1; x += 0.24) for (let z = z0 + 0.3; z < z1 - 0.2; z += 0.3) d.px(x, y - 0.01, z, '#e0b85a', 2, 2);
    h.line([(x0 + x1) / 2, y - 0.01, z0], [(x0 + x1) / 2, y - 0.01, z1], shade(col, 0.4));
  }

  // ---------------- 南薰门 city wall segment (30 m, 9 m high, 8 m thick) + gate arch + 2-storey gate tower ----------------
  A.define('aq_wall_gate', {
    name: '南薰门 城墙+城楼', geo: [-0.6, -1.6, 0, 30.6, 8.6, 24.5], fp: [[0, 0, 13, 8], [17, 0, 30, 8]], prune: true,
    draw(d) {
      const h = H(d), Z = 9;
      // wall body — Site198 atlas city_brick / city_stone kitbash (keep mass box for depth)
      d.box(0, 0, 0, 30, 8, Z, WB, { line: shade(WB, 0.5), west: WB_W, south: WB, top: shade(WB, 1.08) });
      if (X.cityBrickW) X.cityBrickW(d, 0, 0, 1.2, 8, Z); else { h.QW(0, 0, 0, 8, Z, WB_W, shade(WB_W, 0.5)); d.coursesW(0, 0, 8, 0, Z, 0.22, shade(WB_W, 0.85), 0.6); }
      if (X.cityBrickS) X.cityBrickS(d, 0, 0, 1.2, 30, Z); else { h.QS(0, 0, 0, 30, Z, WB, shade(WB, 0.5)); d.coursesS(0, 30, 0, 0, Z, 0.22, shade(WB, 0.86), 0.55); }
      if (X.cityStoneS) X.cityStoneS(d, -0.01, 0, 0, 30, 1.2); else { h.QS(-0.01, 0, 0, 30, 1.2, STONE, shade(STONE, 0.5)); d.coursesS(0, 30, -0.01, 0, 1.2, 0.4, shade(STONE, 0.8), 1.2); }
      h.QW(-0.01, 0, 0, 8, 1.2, STONE_W, shade(STONE_W, 0.5));
      // weathering streaks
      for (let i = 0; i < 26; i++) { const x = d.R() * 30, z = 1.4 + d.R() * 6; if (Math.abs(x - 15) < 3.4) continue; h.line([x, -0.01, z], [x, -0.01, z - 0.6 - d.R()], shade(WB, 0.8)); }
      const AR = arch(15, 5.2, 4.2, 6.9, 18).map(([x, z]) => [x, -0.02, z]);
      d.face([[12.4, -0.02, 0], [17.6, -0.02, 0], ...AR], '#1c1814', '#3a332c');
      // tunnel interior clipped to the arch: side wall, half-open studded door leaves, threshold
      { const g = d.g; g.save(); g.beginPath(); [[12.4, -0.02, 0], [17.6, -0.02, 0], ...AR].forEach((p, i) => { const q = d.P(...p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); g.clip();
        d.face([[12.4, 0, 0], [12.4, 8, 0], [12.4, 8, 6.9], [12.4, 0, 6.9]], '#3a332c', null);
        for (let y = 0.4; y < 8; y += 0.5) d.seg([12.4, y, 0], [12.4, y, 6.9], '#2c2620');
        d.face([[12.4, 0, 0], [17.6, 0, 0], [17.6, 8, 0], [12.4, 8, 0]], '#2a2420', null);
        studdedDoor(d, 2.2, 12.4, 14.9, 0, 5.4, '#7a2418'); d.face([[15.1, 2.2, 0], [16.7, 3.3, 0], [16.7, 3.3, 5.4], [15.1, 2.2, 5.4]], '#5e1a12', '#3a0e08');
        for (let z = 0.4; z < 5.2; z += 0.3) for (const t of [0.25, 0.55, 0.85]) d.px(15.1 + 1.6 * t, 2.2 + 1.1 * t, z, '#c8a050', 1, 1);
        d.face([[14.9, 2.2, 0], [15.1, 2.2, 0], [15.1, 2.2, 5.4], [14.9, 2.2, 5.4]], '#e8d8a0', null);
        /* Site209：瓮城门钉/铺首/门槛 densify（夹于洞口） */
        if (X.doorHardwareStamp) {
          X.doorHardwareStamp(d, 12.5, 2.15, 0.05, 14.85, 5.3, { dense: true, baogu: false, baoguInset: 0.1 });
          X.doorHardwareStamp(d, 15.15, 2.15, 0.05, 16.6, 5.3, { dense: true, baogu: false, mending: true });
        }
        g.restore(); }
      /* Site209：南薰门外抱鼓石 + 门槛（洞口外，不改城墙 footprint） */
      if (X.doorHardwareStamp) {
        X.doorHardwareStamp(d, 12.6, -0.15, 0, 17.4, 0.35, {
          dense: false, mending: false, pushou: false, menkan: true, baogu: true, baoguSx: 1.05, baoguSy: 1.1, baoguInset: 0.35,
        });
      }
      const AR2 = arch(15, 5.9, 4.2, 7.4, 18);
      for (let i = 0; i < AR2.length - 1; i++) { const [a, b] = [AR2[i], AR2[i + 1]], [c, e] = [AR[i], AR[i + 1]]; d.face([[a[0], -0.03, a[1]], [b[0], -0.03, b[1]], [e[0], -0.03, e[2]], [c[0], -0.03, c[2]]], i % 2 ? '#c2bcb0' : '#aca69a', '#6a645a'); }
      X.plaque(d, -0.06, 15, 8.15, '南薰門', { size: 18, w: 3.2, bg: '#1e2c44' });
      // wall top: walkway + 女墙 parapet + 垛口 battlements (Site198 atlas)
      if (X.walkTop) X.walkTop(d, 0, 0, 30, 8, Z); else d.flat(0, 0, 30, 8, Z, '#a29e95', shade(WB, 0.5));
      for (let x = 0.6; x < 30; x += 1.5) h.line([x, 0.3, Z], [x, 7.8, Z], '#96928a');
      if (X.parapetS) X.parapetS(d, 7.4, 0, 30, Z); else d.box(0, 7.4, Z, 30, 8, Z + 1.1, WB, { line: shade(WB, 0.5), west: WB_W, top: shade(WB, 1.15) });
      // gate tower (5 bays 18 x 6.4 m) on a low stone 台基 on the wall top
      const tx0 = 6, tx1 = 24, ty0 = 0.9, ty1 = 7.2, b = Z + 0.4;
      d.box(tx0 - 0.4, ty0 - 0.3, Z, tx1 + 0.4, ty1 + 0.2, b, STONE, { line: shade(STONE, 0.5), west: STONE_W });
      ST.sideWall(d, tx0 + 0.05, ty0 + 0.5, ty1, b, b + 4.0, { col: '#d8cfbf' });
      X.hallFront(d, ty0 + 0.05, tx0, b, b + 4.0, [{ w: 3.6, fill: 'win', sill: 1.0, style: 'grid' }, { w: 3.6, fill: 'door', n: 4 }, { w: 3.6, fill: 'door', n: 4, style: 'bubujin' }, { w: 3.6, fill: 'door', n: 4 }, { w: 3.6, fill: 'win', sill: 1.0, style: 'grid' }], { colC: RED, frame: RED_W, sillCol: RED_W });
      X.efang(d, ty0 + 0.12, tx0 - 0.05, tx1 + 0.05, b + 3.65, b + 4.0, {});
      X.dougong(d, ty0 - 0.05, [7.8, 11.4, 15, 18.6, 22.2], b + 4.0, { size: 0.85 });
      X.roof(d, { x0: tx0 - 1.4, x1: tx1 + 1.4, y0: ty0 - 1.2, y1: ty0 + 1.2, z: b + 4.85, rise: 0.6, type: 'xuanshan', lift: 0.35, ridgeH: 0, chiwen: false, over: 0.01 });
      X.leanW(d, tx0 - 1.4, tx0 + 0.4, ty0 - 1.2, ty1 + 1.0, b + 4.85, b + 5.45);
      // upper storey + 平座 railing
      const u0 = b + 5.4, u1 = u0 + 3.4, uy = ty0 + 1.4;
      d.box(tx0 - 0.2, uy - 0.5, u0 - 0.3, tx1 + 0.2, uy + 0.2, u0, '#7a4a2c', { line: '#3a2014', top: '#8a5634' });
      ST.sideWall(d, tx0 + 0.65, uy + 0.4, ty1 - 0.2, u0, u1, { col: '#d8cfbf' });
      X.hallFront(d, uy - 0.05, tx0 + 0.6, u0, u1, [{ w: 3.36, fill: 'win', sill: 0.6 }, { w: 3.36, fill: 'win', sill: 0.6, style: 'diamond' }, { w: 3.36, fill: 'door', n: 4 }, { w: 3.36, fill: 'win', sill: 0.6, style: 'diamond' }, { w: 3.36, fill: 'win', sill: 0.6 }], { colC: RED, frame: RED_W, sillCol: RED_W, colR: 0.14 });
      X.efang(d, uy + 0.02, tx0 + 0.55, tx1 - 0.55, u1 - 0.3, u1, {});
      X.dougong(d, uy - 0.15, [8.3, 11.7, 15, 18.3, 21.7], u1, { size: 0.9 });
      const ry = uy - 0.5; h.QS(ry, tx0 - 0.2, u0, tx1 + 0.2, u0 + 0.08, '#8a2a1c', '#4a140c'); h.QS(ry, tx0 - 0.2, u0 + 0.8, tx1 + 0.2, u0 + 0.9, '#a0342a', '#4a140c');
      for (let x = tx0 - 0.2; x <= tx1 + 0.25; x += 0.6) h.line([x, ry, u0], [x, ry, u0 + 0.8], '#7a2418');
      X.roof(d, { x0: tx0 - 0.9, x1: tx1 + 0.9, y0: uy - 1.0, y1: ty1 + 1.2, z: u1 + 1.25, rise: 3.0, type: 'xieshan', lift: 0.7, beasts: 4, gable: 0.42, ridgeH: 0.45, dense: true });
      for (const x of [7.5, 22.5]) X.lantern(d, x, ty0 - 0.9, b + 4.3, { r: 0.3, cord: 0.2 });
      if (X.merlonsS) X.merlonsS(d, 0, 0, 30, Z);
      else {
        for (let x = 0; x < 30; x += 1.6) {
          d.box(x, 0, Z, x + 1.05, 0.55, Z + 1.7, WB, { line: shade(WB, 0.45), west: WB_W, top: shade(WB, 1.18) });
          d.px(x + 0.45, 0, Z + 1.05, '#2a2622', 3, 4);
          if (x + 1.6 < 30) d.box(x + 1.05, 0, Z, x + 1.6, 0.55, Z + 1.0, WB, { line: shade(WB, 0.45), west: WB_W, top: shade(WB, 1.18) });
        }
      }
      // flags on the battlements
      for (const x of [1.5, 28.5]) { h.line([x, 0.3, Z + 1.7], [x, 0.3, Z + 5.2], WOOD_D, 2); d.face([[x, 0.3, Z + 5.2], [x + 1.3, 0.3, Z + 4.9], [x + 1.25, 0.3, Z + 4.0], [x, 0.3, Z + 4.1]], '#c8322c', '#6a1410'); h.stext('宋', x + 0.6, 0.29, Z + 4.6, 13, '#f0d890'); }
    },
    emit(d) { for (const x of [7.5, 22.5]) X.lanternGlow(d, x, 0.0, 13.7, { r: 0.3, cord: 0.2 }); const h = H(d); h.QS(1.0, 6.3, 9.6, 23.7, 12.8, 'rgba(255,190,100,0.35)'); },
  });

  // ---------------- 梦华府 yamen gate: 3 bays 12 x 6 m on a high 台基, 八字墙 splayed screen walls, red studded doors ----------------
  A.define('aq_yamen_gate', {
    name: '梦华府 衙门大门', geo: [-5.2, -2, 0, 17.2, 7, 9.6], fp: [[0, 0, 12, 6], [-5, -1.6, 0, 0.5], [12, -1.6, 17, 0.5]], prune: true,
    draw(d) {
      const h = H(d), zf = 0.8;
      // 八字墙: two walls splaying forward from the gate corners (drawn as stepped boxes toward the front)
      const splay = (xa, s) => slab(d, [xa + s * 0.1, 0.4], [xa + s * 4.8, -1.3], 3.7, 0.45);
      X.platform(d, 0, 0, 12, 6, zf, { steps: [[6, 4.6]] });
      ST.sideWall(d, 0.05, 1.4, 6, zf, 4.6, { col: '#c8bfae' });
      X.hallFront(d, 1.1, 0, zf, 4.6, [{ w: 3.5, fill: 'wall' }, { w: 5, fill: 'skip' }, { w: 3.5, fill: 'wall' }], { colC: RED, wall: '#a8352a' });
      studdedDoor(d, 1.35, 3.6, 6, zf, 4.0); studdedDoor(d, 1.35, 6, 8.4, zf, 4.0);
      for (const x of [5.0, 7.0]) h.blob(x + (x < 6 ? 0.85 : -0.85), 1.33, 2.4, 3, 3, '#e0b85a', '#6a4a10');
      d.box(3.6, 1.0, zf, 8.4, 1.36, zf + 0.5, '#6a4a2a', { line: '#2a1a0a' });   // 门槛 threshold
      /* Site209：衙署大门门钉/铺首/门槛/抱鼓 densify */
      if (X.doorHardwareStamp) {
        X.doorHardwareStamp(d, 3.6, 1.32, zf, 6.0, zf + 4.0, { dense: true, baogu: false });
        X.doorHardwareStamp(d, 6.0, 1.32, zf, 8.4, zf + 4.0, { dense: true, baogu: false });
        X.doorHardwareStamp(d, 3.5, 0.95, zf, 8.5, zf + 0.4, {
          dense: false, mending: false, pushou: false, menkan: true, baogu: true, baoguSx: 0.95, baoguSy: 1.0, baoguInset: 0.25,
        });
      }
      X.lattice(d, 1.3, 3.6, 4.0, 8.4, 4.55, { frame: RED_W, style: 'vbars', paper: '#3a2a20' });
      X.efang(d, 1.2, -0.05, 12.05, 4.25, 4.6, {});
      X.dougong(d, 1.0, [1.75, 6, 10.25], 4.6, { size: 0.8 });
      X.plaque(d, 0.98, 6, 3.6, '夢華府', { size: 17, w: 2.6, bg: '#1a1a1a', col: '#e8c050' });
      X.roof(d, { x0: -0.8, x1: 12.8, y0: -0.2, y1: 6.8, z: 5.6, rise: 2.4, type: 'xuanshan', over: 0.75, lift: 0.3, ridgeH: 0.42, beasts: 0, gableCol: '#c8bfae', dense: true, chiwen: true });
      splay(0, -1); splay(12, 1);
      // vertical couplet boards on the front columns
      for (const x of [3.5, 8.5]) X.vsign(d, 0.95, x, 3.4, x < 6 ? '公生明' : '廉生威', { size: 11, w: 0.42, bg: '#1a1a1a' });
    },
  });
  /** thin free-standing wall between ground points a..b (any angle): visible long face, end, top, tiled coping */
  function slab(d, a, b, Ht, t) {
    const h = H(d), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L * t / 2, ny = dx / L * t / 2;
    const vis = (-nx - ny) > 0 ? 1 : -1, n = [nx * vis, ny * vis], A0 = [a[0] + n[0], a[1] + n[1]], B0 = [b[0] + n[0], b[1] + n[1]], A1 = [a[0] - n[0], a[1] - n[1]], B1 = [b[0] - n[0], b[1] - n[1]];
    const end = (a[0] + a[1]) < (b[0] + b[1]) ? [A0, A1] : [B0, B1];
    d.face([[end[0][0], end[0][1], 0], [end[1][0], end[1][1], 0], [end[1][0], end[1][1], Ht], [end[0][0], end[0][1], Ht]], '#7a2418', '#4a140c');
    const lit = n[1] < 0 ? '#a8352a' : '#8a2a20';
    d.face([[A0[0], A0[1], 0], [B0[0], B0[1], 0], [B0[0], B0[1], Ht], [A0[0], A0[1], Ht]], lit, '#4a140c');
    d.face([[A0[0], A0[1], 0], [B0[0], B0[1], 0], [B0[0], B0[1], 0.7], [A0[0], A0[1], 0.7]], STONE, shade(STONE, 0.5));
    for (let k = 1; k < 4; k++) { const f = k / 4; d.seg([A0[0] + dx * f, A0[1] + dy * f, 0.7], [A0[0] + dx * f, A0[1] + dy * f, Ht - 0.4], shade(lit, 0.8)); }
    d.face([[A0[0] + dx * 0.2, A0[1] + dy * 0.2, 1.4], [A0[0] + dx * 0.8, A0[1] + dy * 0.8, 1.4], [A0[0] + dx * 0.8, A0[1] + dy * 0.8, 3.0], [A0[0] + dx * 0.2, A0[1] + dy * 0.2, 3.0]], null, '#d8b45a');
    const m = 0.25, C0 = [A0[0] + n[0] * 1.2, A0[1] + n[1] * 1.2], C1 = [B0[0] + n[0] * 1.2, B0[1] + n[1] * 1.2];
    d.face([[C0[0], C0[1], Ht], [C1[0], C1[1], Ht], [b[0], b[1], Ht + 0.45], [a[0], a[1], Ht + 0.45]], C.TILE, shade(C.TILE, 0.5));
    d.seg([a[0], a[1], Ht + 0.5], [b[0], b[1], Ht + 0.5], C.RIDGE, 3); void m;
  }
  // ---------------- 鸣冤鼓 drum on a timber frame with a small roof ----------------
  A.define('aq_drum', {
    name: '鸣冤鼓', geo: [-1.2, -0.8, 0, 1.4, 1.2, 3.6], fp: [[-1, -0.4, 1.1, 0.8]], prune: true,
    draw(d) {
      const h = H(d);
      for (const x of [-0.9, 0.9]) { h.column(x, 0.6, 0, 2.7, 0.06, '#7a2418'); }
      d.box(-1.1, 0.5, 0, 1.1, 0.75, 0.18, STONE, { line: shade(STONE, 0.5) });
      for (const x of [-0.9, 0.9]) h.column(x, 0.0, 0, 2.7, 0.07, '#9a2f24');
      h.line([-0.9, 0.0, 2.3], [0.9, 0.0, 2.3], '#5a1a10', 2);
      // drum body (barrel seen at an angle): ellipse face + barrel
      const c = h.P(0, 0.2, 1.55), g = d.g; g.fillStyle = '#9a2f24'; g.fillRect(Math.round(c[0] - 14), Math.round(c[1] - 22), 28, 40); g.strokeStyle = '#4a1410'; g.strokeRect(Math.round(c[0] - 14) + 0.5, Math.round(c[1] - 22) + 0.5, 27, 39);
      g.beginPath(); g.ellipse(c[0] - 14, c[1] - 2, 9, 20, 0, 0, Math.PI * 2); g.fillStyle = '#d8c7a0'; g.fill(); g.strokeStyle = '#6a5030'; g.stroke();
      g.beginPath(); g.ellipse(c[0] - 14, c[1] - 2, 5, 12, 0, 0, Math.PI * 2); g.strokeStyle = '#a8946a'; g.stroke();
      for (let k = -18; k <= 16; k += 5) { g.fillStyle = '#e0b85a'; g.fillRect(Math.round(c[0] - 10), Math.round(c[1] + k), 1, 1); g.fillRect(Math.round(c[0] + 10), Math.round(c[1] + k), 1, 1); }
      g.fillStyle = '#c84a3a'; g.fillRect(Math.round(c[0] - 13), Math.round(c[1] - 21), 26, 2);
      // drumsticks hanging
      h.line([-0.5, -0.02, 2.25], [-0.62, -0.02, 1.55], '#4a2a1a', 2); h.line([-0.3, -0.02, 2.25], [-0.36, -0.02, 1.5], '#4a2a1a', 2);
      X.roof(d, { x0: -1.25, x1: 1.35, y0: -0.4, y1: 1.0, z: 2.75, rise: 0.55, type: 'xuanshan', lift: 0.2, ridgeH: 0.12, chiwen: false, over: 0.3 });
    },
  });
  // ---------------- 公堂 main hall: 5 bays 18 x 10 m, 歇山, open front with 公案, 明镜高悬, 肃静/回避 boards ----------------
  A.define('aq_gongtang', {
    name: '公堂(明镜高悬)', geo: [-1.6, -3.2, 0, 19.6, 11.2, 12], fp: [[0, 0, 18, 10]], prune: true,
    draw(d) {
      const h = H(d), zf = 0.9, z1 = 5.0;
      X.platform(d, -0.6, -0.8, 18.6, 10, zf, { steps: [[9, 5]] });
      ST.sideWall(d, 0.05, 1.6, 10, zf, z1, { col: '#c8bfae' });
      // interior back wall with 海水朝日 screen, 明镜高悬 plaque, 公案 desk with red cloth
      const iy = 6.6; d.flat(3.6, 1.0, 14.4, iy, zf + 0.005, '#4a3a2c'); for (let y = 1.6; y < iy; y += 0.6) h.line([3.6, y, zf + 0.01], [14.4, y, zf + 0.01], '#3e3024'); h.QS(iy, 3.6, zf, 14.4, z1, '#2e221a'); h.QW(14.4, 1.0, zf, iy, z1, '#3a2c22');
      h.QS(iy - 0.02, 6.4, zf + 0.6, 11.6, z1 - 0.4, '#2c4a6a', '#1a2a3a');
      for (let k = 0; k < 5; k++) h.pline([[6.5, iy - 0.03, zf + 0.8 + k * 0.18], [7.5, iy - 0.03, zf + 0.95 + k * 0.18], [8.5, iy - 0.03, zf + 0.8 + k * 0.18], [9.5, iy - 0.03, zf + 0.95 + k * 0.18], [10.5, iy - 0.03, zf + 0.8 + k * 0.18], [11.5, iy - 0.03, zf + 0.95 + k * 0.18]], '#6a9ab8');
      h.blob(9, iy - 0.03, zf + 2.6, 8, 8, '#c8322c', '#7a1a10');
      X.plaque(d, iy - 0.06, 9, z1 - 0.15, '明鏡高懸', { size: 13, w: 3.4, bg: '#1a1a1a' });
      d.box(7.0, 3.9, zf, 11.0, 5.0, zf + 1.0, '#c8322c', { line: '#5a1410', top: '#d8b45a' });
      h.QS(3.89, 7.1, zf + 0.15, 10.9, zf + 0.9, '#b02a20', '#5a1410'); h.QS(3.88, 7.6, zf + 0.3, 10.4, zf + 0.75, null, '#e0b85a'); h.stext('公', 9, 3.87, zf + 0.52, 12, '#e8c050');
      d.box(7.6, 4.2, zf + 1.0, 8.2, 4.6, zf + 1.18, '#3a2a1a'); d.box(9.9, 4.3, zf + 1.0, 10.2, 4.6, zf + 1.45, '#6a4a2a', { top: '#c8322c' }); d.box(8.8, 4.3, zf + 1.0, 9.3, 4.6, zf + 1.06, '#e8e0c8');   // 签筒 / 惊堂木
      d.box(8.5, 5.4, zf, 9.5, 6.2, zf + 2.0, '#6a3a20', { line: '#2a1a0a', south: '#7a4428' });   // chair
      X.hallFront(d, 1.0, 0, zf, z1, [{ w: 3.6, fill: 'win', sill: 1.1, style: 'grid' }, { w: 3.6, fill: 'skip' }, { w: 3.6, fill: 'skip' }, { w: 3.6, fill: 'skip' }, { w: 3.6, fill: 'win', sill: 1.1, style: 'grid' }], { colC: RED, frame: RED_W, sillCol: '#8a8a84' });
      X.efang(d, 1.07, -0.05, 18.05, z1 - 0.4, z1, {});
      X.dougong(d, 0.9, [1.8, 5.4, 9, 12.6, 16.2], z1, { size: 0.9 });
      X.roof(d, { x0: -1.4, x1: 19.4, y0: -0.6, y1: 11.0, z: z1 + 1.15, rise: 3.6, type: 'xieshan', lift: 0.65, beasts: 4, gable: 0.42, ridgeH: 0.45, dense: true });
      // 肃静 / 回避 boards on stands, 衙役 rack of 水火棍
      for (const [x, t] of [[2.2, '肅靜'], [15.8, '迴避']]) { h.line([x, -1.6, zf], [x, -1.6, zf + 2.6], '#3a2a1a', 2); d.face([[x - 0.4, -1.62, zf + 2.6], [x + 0.4, -1.62, zf + 2.6], [x + 0.4, -1.62, zf + 1.3], [x - 0.4, -1.62, zf + 1.3]], '#2a2a2a', '#c8322c'); h.vtext(t, x, -1.64, zf + 2.25, 13, '#e8c050'); }
      for (const x of [4.2, 13.8]) { d.box(x - 0.6, -0.6, zf, x + 0.6, -0.4, zf + 0.15, '#5a3a20'); for (let k = 0; k < 5; k++) { const xx = x - 0.5 + k * 0.25; h.line([xx, -0.5, zf + 0.1], [xx, -0.5, zf + 2.2], '#1a1a1a', 2); h.line([xx, -0.51, zf + 1.5], [xx, -0.51, zf + 2.2], '#c8322c', 2); } }
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
