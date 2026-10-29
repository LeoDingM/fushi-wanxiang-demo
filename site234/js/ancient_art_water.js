/* 鹰山宋城水体地面与岸线小品（Site194 + Site195 动态波）。只服务古城 U/V/W 之外的 D/E/I 图例，不改 rq_gwater（月河/石驳岸）。
 * 分层：近岸浅青绿+土黄过渡 → 中带青绿 → 中心深蓝绿；Site195 在 env.drawGround 上叠时间驱动流动波纹/高光。
 * 名称与色值未经 Leo 确认。 */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A) return;
  const shade = A.shade, mix = A.mix;

  /* shallow / mid / deep — Song-era canal palette (teal → deep blue-green, muddy near bank) */
  const SHALLOW = '#6e9a7a';
  const SHALLOW_MUD = '#8a7a52';
  const MID = '#3f7f86';
  const DEEP = '#2a5c6e';
  const DEEP2 = '#1e4a5c';
  const RIPPLE_DAY = 'rgba(210,235,230,0.72)';
  const RIPPLE_SOFT = 'rgba(170,215,214,0.55)';
  const GLINT = 'rgba(245,240,220,0.78)';   /* warm-white so dusk still reads */
  const GLINT_COOL = 'rgba(200,230,235,0.65)';

  function ripples(d, n, y0, y1, cols) {
    for (let k = 0; k < n; k++) {
      const x = d.R() * 1.65, y = y0 + d.R() * (y1 - y0), w = 0.22 + d.R() * 0.55;
      const col = cols[k % cols.length];
      d.seg([x, y, 0], [x + w, y + (d.R() - 0.5) * 0.08, 0], col);
    }
  }

  A.define('aq_gwater', {
    name: '宋城水面',
    layer: 'ground',
    states: ['a', 'b', 'c'],
    geo: [0, 0, 0, 2, 2, 0],
    draw(d, st) {
      const R = d.R;
      if (st === 'a') {
        /* near-shore: shallow teal-green with muddy ochre patches */
        d.flat(0, 0, 2, 2, 0, SHALLOW);
        d.flat(0, 0, 2, 0.35 + R() * 0.25, 0, mix(SHALLOW, SHALLOW_MUD, 0.45 + R() * 0.25));
        for (let k = 0; k < 4; k++) {
          const x = R() * 1.4, y = R() * 1.6, w = 0.35 + R() * 0.5, h = 0.2 + R() * 0.35;
          d.flat(x, y, x + w, y + h, 0, mix(SHALLOW, SHALLOW_MUD, 0.3 + R() * 0.5));
        }
        /* lighter foam / wet-edge streak */
        if (R() < 0.7) d.seg([R() * 0.4, 0.15 + R() * 0.3, 0], [0.8 + R() * 1.0, 0.2 + R() * 0.25, 0], 'rgba(230,225,200,0.55)');
        ripples(d, 4, 0.4, 1.85, [RIPPLE_SOFT, shade(SHALLOW, 1.22), GLINT]);
      } else if (st === 'b') {
        /* mid canal */
        d.flat(0, 0, 2, 2, 0, MID);
        d.flat(0, 0, 2, 0.2, 0, shade(MID, 0.88));
        for (let k = 0; k < 3; k++) {
          const x = R() * 1.5, y = 0.3 + R() * 1.4;
          d.flat(x, y, x + 0.4 + R() * 0.5, y + 0.15 + R() * 0.2, 0, mix(MID, DEEP, 0.35 + R() * 0.3));
        }
        ripples(d, 6, 0.25, 1.8, [RIPPLE_DAY, RIPPLE_SOFT, GLINT_COOL, shade(MID, 1.2)]);
        if (R() < 0.55) {
          const x = R() * 1.2, y = 0.5 + R() * 1.0;
          d.seg([x, y, 0], [x + 0.7 + R() * 0.4, y, 0], GLINT);
        }
      } else {
        /* deep center */
        d.flat(0, 0, 2, 2, 0, DEEP);
        d.flat(0.2 + R() * 0.3, 0.3 + R() * 0.4, 1.5 + R() * 0.4, 1.5 + R() * 0.4, 0, DEEP2);
        ripples(d, 5, 0.2, 1.85, [RIPPLE_SOFT, GLINT_COOL, 'rgba(160,200,210,0.45)']);
        /* longer highlight streak — readable under dusk warm wash */
        const x = R() * 0.9, y = 0.45 + R() * 1.1;
        d.seg([x, y, 0], [x + 0.9 + R() * 0.5, y + (R() - 0.5) * 0.06, 0], GLINT);
        if (R() < 0.4) d.seg([R() * 1.2, 0.3 + R() * 1.4, 0], [R() * 0.5 + 1.0, 0.3 + R() * 1.4, 0], RIPPLE_DAY);
      }
    },
  });

  /* Songcheng reed clumps — same silhouette language as rq_x_reed, Songcheng-only placements */
  A.define('aq_reed', {
    name: '宋城芦苇',
    variants: ['reed', 'iris'],
    geo: [-0.6, -0.4, 0, 0.6, 0.4, 1.7],
    fp: [],
    noShadow: true,
    draw(d, st, v) {
      const R = d.R;
      for (let k = 0; k < 28; k++) {
        const x = (R() - 0.5) * 1.15, y = (R() - 0.5) * 0.75, h = 0.85 + R() * 0.85, lean = (R() - 0.5) * 0.35;
        d.seg([x, y, 0], [x + lean, y, h], shade(v === 'iris' ? '#4d8a3c' : '#8a9a4a', 0.78 + R() * 0.45));
        if (v === 'reed' && k % 3 === 0) d.px(x + lean, y, h + 0.05, '#c9b98a', 2, 3);
      }
      if (v === 'iris') for (let k = 0; k < 5; k++) d.px((R() - 0.5) * 0.9, (R() - 0.5) * 0.5, 0.9 + R() * 0.3, '#7d5ac2', 3, 3);
    },
  });

  /* small mud/stone bank nibs along irregular shore */
  A.define('aq_bank', {
    name: '宋城泥石岸',
    variants: ['mud', 'stone'],
    geo: [-0.8, -0.35, 0, 0.8, 0.35, 0.35],
    fp: [],
    noShadow: true,
    draw(d, st, v) {
      const R = d.R;
      if (v === 'stone') {
        for (let k = 0; k < 5; k++) {
          const x = (R() - 0.5) * 1.3, y = (R() - 0.5) * 0.45, w = 0.18 + R() * 0.28, h = 0.12 + R() * 0.2;
          d.box(x - w, y - w * 0.6, 0, x + w, y + w * 0.6, h, shade('#9a9688', 0.85 + R() * 0.25), { line: '#5c5a52' });
        }
      } else {
        d.flat(-0.7, -0.28, 0.7, 0.28, 0.02, mix('#7a6a48', '#5a6a4a', R() * 0.4));
        for (let k = 0; k < 4; k++) {
          const x = (R() - 0.5) * 1.2, y = (R() - 0.5) * 0.4;
          d.disc(x, y, 0.02, 0.12 + R() * 0.1, shade('#6a5a40', 0.9 + R() * 0.2));
        }
      }
    },
  });

  /* -------- Site195: animated Songcheng water (flow + waves), canvas overlay on env.drawGround --------
   * time-driven sine crests + flowing highlight streaks over D/E/I water inside 鹰山宋城 only.
   * Shoreline strips (aq_reed / aq_bank) stay as-is. No 月河 U/V/W, no school/fishing village. */
  (function installAqWaves() {
    const SP = root.SP;
    if (!SP || !SP.env || SP.env._aqWaveHook) return;
    SP.env._aqWaveHook = true;
    const prev = SP.env.drawGround;
    const STEP = 2.2;           /* world metres between crest samples */
    const BUF = 40;             /* screen pad */

    function district() {
      const N = root.RONGQIAO_NORTH || (SP.world && SP.world.notes) || root.SCENE_NOTES || {};
      const sc = N.expansionSongcheng;
      return sc && sc.district ? sc.district : null;
    }
    function isSongWater(x, y, dist) {
      if (x < dist[0] || y < dist[1] || x > dist[2] || y > dist[3]) return false;
      const MW = SP.mapWorld;
      if (MW && typeof MW.inWater === 'function') return !!MW.inWater(x, y);
      /* fallback: Songcheng D/E/I ground letters (not 月河 U/V/W) */
      const G = (root.SCENE_DATA && root.SCENE_DATA.ground) || (SP.world && SP.world.data && SP.world.data.ground);
      if (!G || !G.data_south_to_north) return false;
      const cell = G.chunk || 2;
      const c = Math.floor((x - G.origin[0]) / cell);
      const r = Math.floor((y - G.origin[1]) / cell);
      if (r < 0 || c < 0 || r >= G.rows || c >= G.cols) return false;
      const ch = (G.data_south_to_north[r] || '')[c];
      return ch === 'D' || ch === 'E' || ch === 'I';
    }
    function viewWorldAABB(view) {
      /* view is screen/iso space; unproject corners → world metres */
      if (typeof SP.unproject !== 'function') {
        const p = SP.player || {};
        const px = p.x || 0, py = p.y || 0;
        return [px - 70, py - 70, px + 70, py + 70];
      }
      const corners = [
        SP.unproject(view.x0, view.y0),
        SP.unproject(view.x1, view.y0),
        SP.unproject(view.x0, view.y1),
        SP.unproject(view.x1, view.y1),
        SP.unproject((view.x0 + view.x1) / 2, view.y0),
        SP.unproject((view.x0 + view.x1) / 2, view.y1),
        SP.unproject(view.x0, (view.y0 + view.y1) / 2),
        SP.unproject(view.x1, (view.y0 + view.y1) / 2),
      ];
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const [x, y] of corners) {
        x0 = Math.min(x0, x); y0 = Math.min(y0, y);
        x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      }
      const pad = 12;
      return [x0 - pad, y0 - pad, x1 + pad, y1 + pad];
    }
    function drawWaves(ctx, view) {
      const dist = district();
      if (!dist || !view || !SP.sx) return;
      /* skip when camera far from Songcheng */
      const p = SP.player || {};
      const px = p.x != null ? p.x : 0, py = p.y != null ? p.y : 0;
      if (px < dist[0] - 40 || px > dist[2] + 40 || py < dist[1] - 40 || py > dist[3] + 40) return;

      const t = (typeof SP.now === 'number' ? SP.now : 0) * 1.15;
      const aabb = viewWorldAABB(view);
      const x0 = Math.max(dist[0], aabb[0]), x1 = Math.min(dist[2], aabb[2]);
      const y0 = Math.max(dist[1], aabb[1]), y1 = Math.min(dist[3], aabb[3]);
      if (x1 - x0 < 1 || y1 - y0 < 1) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.globalCompositeOperation = 'source-over';

      /* soft caustic / trough patches (three.js-like moving normals, canvas approx) */
      for (let y = y0; y < y1; y += STEP * 1.6) {
        for (let x = x0; x < x1; x += STEP * 1.6) {
          if (!isSongWater(x + 0.5, y + 0.5, dist)) continue;
          const ph = t * 1.7 + x * 0.19 + y * 0.31;
          const elev = Math.sin(ph) * Math.cos(ph * 0.73 + y * 0.11);
          if (Math.abs(elev) < 0.22) continue;
          const rx = 1.1 + 0.55 * Math.abs(elev);
          const ry = 0.55 + 0.25 * Math.abs(elev);
          const cx = x + 0.5 + Math.sin(ph * 0.9) * 0.45;
          const cy = y + 0.5 + Math.cos(ph * 0.7) * 0.28;
          const Sx = SP.sx(cx, cy), Sy = SP.sy(cx, cy, 0);
          if (Sx < view.x0 - BUF || Sx > view.x1 + BUF || Sy < view.y0 - BUF || Sy > view.y1 + BUF) continue;
          /* iso stretch: world metres → screen ellipse */
          const ex = Math.max(4, (SP.sx(cx + rx, cy) - SP.sx(cx - rx, cy)) * 0.5);
          const ey = Math.max(3, Math.abs(SP.sy(cx, cy + ry, 0) - SP.sy(cx, cy - ry, 0)) * 0.5);
          ctx.beginPath();
          ctx.ellipse(Math.round(Sx) + 0.5, Math.round(Sy) + 0.5, ex, ey, -0.55, 0, Math.PI * 2);
          if (elev > 0) {
            ctx.fillStyle = 'rgba(220,240,236,' + (0.10 + 0.14 * elev).toFixed(3) + ')';
          } else {
            ctx.fillStyle = 'rgba(20,55,70,' + (0.08 + 0.12 * (-elev)).toFixed(3) + ')';
          }
          ctx.fill();
        }
      }

      /* flowing long highlight bands (UV-like scroll along canal) */
      const spanY = Math.max(1, y1 - y0);
      for (let band = 0; band < 8; band++) {
        const by = y0 + ((band * 2.4 + (t * 1.85 + band * 0.9) % 6.5) % spanY);
        for (let x = x0; x < x1; x += STEP * 1.4) {
          const y = by + Math.sin(x * 0.22 + t * 1.9 + band) * 0.55;
          if (!isSongWater(x, y, dist)) continue;
          const x2 = x + 2.6 + 0.7 * Math.sin(t * 1.4 + x * 0.1);
          const y2 = y + 0.14 * Math.sin(t * 2.2 + x * 0.3);
          if (!isSongWater(x2, y2, dist) && !isSongWater((x + x2) / 2, (y + y2) / 2, dist)) continue;
          const A = SP.sx(x, y), Ay = SP.sy(x, y, 0);
          const B = SP.sx(x2, y2), By = SP.sy(x2, y2, 0);
          if (A < view.x0 - BUF || A > view.x1 + BUF || Ay < view.y0 - BUF || Ay > view.y1 + BUF) continue;
          const a = 0.38 + 0.28 * (0.5 + 0.5 * Math.sin(t * 2.1 + band + x * 0.05));
          ctx.strokeStyle = 'rgba(245,252,250,' + a.toFixed(3) + ')';
          ctx.lineWidth = 2.4 + (band % 2) * 1.2;
          ctx.beginPath();
          ctx.moveTo(Math.round(A) + 0.5, Math.round(Ay) + 0.5);
          ctx.lineTo(Math.round(B) + 0.5, Math.round(By) + 0.5);
          ctx.stroke();
        }
      }

      /* short sine crests / ripples — phase scrolls with time */
      for (let y = y0; y < y1; y += STEP) {
        for (let x = x0; x < x1; x += STEP) {
          if (!isSongWater(x + 0.6, y + 0.6, dist)) continue;
          const ph = t * 2.6 + x * 0.41 + y * 0.27;
          const ox = Math.sin(ph) * 0.5;
          const oy = Math.cos(ph * 0.85) * 0.24;
          const xA = x + 0.4 + ox, yA = y + 0.5 + oy;
          const xB = xA + 1.15 + 0.4 * Math.sin(ph + 1.2);
          const yB = yA + 0.12 * Math.sin(ph * 1.4);
          const X0 = SP.sx(xA, yA), Y0 = SP.sy(xA, yA, 0);
          const X1 = SP.sx(xB, yB), Y1 = SP.sy(xB, yB, 0);
          if (X0 < view.x0 - BUF || X0 > view.x1 + BUF || Y0 < view.y0 - BUF || Y0 > view.y1 + BUF) continue;
          const bright = 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(ph * 1.7));
          ctx.strokeStyle = ((x + y) | 0) % 5 === 0
            ? 'rgba(255,250,230,' + (bright * 0.95).toFixed(3) + ')'
            : 'rgba(200,235,240,' + bright.toFixed(3) + ')';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(Math.round(X0) + 0.5, Math.round(Y0) + 0.5);
          ctx.lineTo(Math.round(X1) + 0.5, Math.round(Y1) + 0.5);
          ctx.stroke();
          if (((x * 3 + y) | 0) % 3 === 0) {
            const ph2 = ph + 2.1;
            const xC = x + 1.2 + Math.sin(ph2) * 0.35, yC = y + 1.1 + Math.cos(ph2) * 0.18;
            const xD = xC + 0.85, yD = yC + 0.06 * Math.sin(ph2);
            const U0 = SP.sx(xC, yC), V0 = SP.sy(xC, yC, 0);
            const U1 = SP.sx(xD, yD), V1 = SP.sy(xD, yD, 0);
            ctx.strokeStyle = 'rgba(165,210,215,' + (bright * 0.6).toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(Math.round(U0) + 0.5, Math.round(V0) + 0.5);
            ctx.lineTo(Math.round(U1) + 0.5, Math.round(V1) + 0.5);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    SP.env.drawGround = function (ctx, view) {
      const result = prev.apply(this, arguments);
      try { drawWaves(ctx, view); } catch (e) { /* keep ground fx alive */ }
      return result;
    };
  })();
})(typeof window !== 'undefined' ? window : globalThis);
