/* 外卖骑手骑行 sprite (Leo 2026-10-18 02:38: redraw the delivery rider's riding sprite to match the new EBikeArt style).
 * Rebuilds the ACTORS.rider sheet at load time from the same parametric e-bike (style 'delivery', yellow box) that the
 * parked bikes use, with a rider figure (helmet, jacket, trousers, arms to the grips, feet on the footboard) depth-sorted
 * into the bike's parts via EBikeArt's o.extra hook. Same frame keys / clips as the old sheet (ride_{dir}_{0..7},
 * stop_{dir}_0), so actors.js, commerce_rider.js and old saves are untouched. Stop frames: left foot down, bike upright.
 * Ride frames: pedal-less scooter, so the 8 frames carry a small bob, jacket flutter and a wheel-tread shimmer.
 * If no real 2D canvas is available (headless test VM), the original PNG sheet stays in place. Colours 未经Leo确认. */
(function (root) {
  'use strict';
  const SP = root.SP, EB = root.EBikeArt, A = root.ACTORS && root.ACTORS.rider;
  if (!SP || !EB || !A) return;
  const DIRS = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];
  const VEC = { E: [1, 0], NE: [1, 1], N: [0, 1], NW: [-1, 1], W: [-1, 0], SW: [-1, -1], S: [0, -1], SE: [1, -1] };
  const CW = 112, CH = 100, AX = 56, AY = 78, NR = 8;
  const PAL = { jacket: '#f2c230', jacketDk: '#c9971c', trim: '#3a3d42', pants: '#2b2f3a', shoe: '#1b1c1f', glove: '#2a2b2e', skin: '#d9a77f', helmet: '#f2c230', visor: '#1f2a33', bike: '#3a3e44', box: '#f2b705' };
  function shade(h, f) { const n = parseInt(h.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; return '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(f >= 1 ? v + (255 - v) * (f - 1) : v * f))).toString(16).padStart(2, '0')).join(''); }
  /** rider parts for EBikeArt o.extra; k = frame (0..7), stop = one foot down */
  function riderParts(k, stop) {
    const bob = stop ? 0 : Math.sin(k / NR * Math.PI * 2) * 0.012, sway = stop ? 0 : Math.sin(k / NR * Math.PI * 2 + 1) * 0.015;
    const hip = [-0.4, 0, 0.8 + bob], sh = [-0.26, sway, 1.3 + bob], head = [-0.22, sway, 1.53 + bob];
    const legs = (m) => {
      for (const sd of [-1, 1]) {
        const s = sd * 0.12;
        if (stop && sd === m.near) { // the near-side foot is down on the road
          m.path([[hip[0], s, hip[2]], [-0.12, sd * 0.24, 0.5], [-0.1, sd * 0.32, 0.04]], PAL.pants, 4.2);
          m.seg([-0.12, sd * 0.32, 0.03], [0.0, sd * 0.32, 0.03], PAL.shoe, 3.4); continue;
        }
        m.path([[hip[0], s, hip[2]], [0.06, sd * 0.15, 0.74 + bob * 0.5], [0.1, sd * 0.13, 0.36]], PAL.pants, 4.2);
        m.seg([0.04, sd * 0.13, 0.33], [0.2, sd * 0.13, 0.33], PAL.shoe, 3.4);
      }
    };
    const torso = (m) => {
      const fl = stop ? 0 : 0.02 + 0.02 * Math.sin(k / NR * Math.PI * 4);
      m.extrude([[hip[0] - 0.06, hip[2] - 0.02], [hip[0] + 0.14, hip[2] - 0.02], [sh[0] + 0.1, sh[2] - 0.02], [sh[0] + 0.02, sh[2] + 0.04], [sh[0] - 0.12, sh[2]], [hip[0] - 0.1 - fl, hip[2] + 0.08]], -0.17 + sway, 0.17 + sway, PAL.jacket, { line: PAL.jacketDk });
      // reflective band across the back + collar
      m.seg([hip[0] - 0.09 - fl * 0.5, -0.17 + sway, hip[2] + 0.22], [hip[0] - 0.09 - fl * 0.5, 0.17 + sway, hip[2] + 0.22], '#e9eef0', 2);
      m.box(sh[0] - 0.06, -0.08 + sway, sh[2] - 0.01, sh[0] + 0.06, 0.08 + sway, sh[2] + 0.06, PAL.trim, { line: '#1d1f21' });
    };
    const arms = (m) => {
      for (const sd of [-1, 1]) {
        const s0 = sd * 0.18 + sway;
        if (stop && sd === m.near) { m.path([[sh[0], s0, sh[2] - 0.04], [0.02, sd * 0.24, 1.08], [0.45, sd * 0.29, 1.05]], PAL.jacket, 3.6); }
        else m.path([[sh[0], s0, sh[2] - 0.04], [0.04, sd * 0.25, 1.1 + bob], [0.45, sd * 0.29, 1.05]], PAL.jacket, 3.6);
        m.seg([0.43, sd * 0.29, 1.05], [0.47, sd * 0.29, 1.05], PAL.glove, 3.6);
      }
    };
    const headFn = (m) => {
      const c = m.L(head[0], head[1], head[2]), up = m.L(head[0], head[1], head[2] + 0.19), r = Math.max(4, Math.abs(c[1] - up[1]));
      const g = m.g; const fwd = m.L(head[0] + 0.1, head[1], head[2] - 0.02);
      const toward = m.facing(1, 0, 0) > -0.2;
      if (toward) { g.fillStyle = PAL.skin; g.beginPath(); g.arc(fwd[0], fwd[1] + r * 0.35, r * 0.62, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = PAL.helmet; g.strokeStyle = shade(PAL.helmet, 0.5); g.lineWidth = 1; g.beginPath(); g.arc(c[0], c[1], r, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = shade(PAL.helmet, 1.25); g.beginPath(); g.arc(c[0] - r * 0.3, c[1] - r * 0.35, r * 0.35, 0, Math.PI * 2); g.fill();
      if (toward) { g.fillStyle = PAL.visor; g.beginPath(); g.ellipse((c[0] * 0.45 + fwd[0] * 0.55), (c[1] * 0.45 + fwd[1] * 0.55) + r * 0.05, r * 0.62, r * 0.32, 0, 0, Math.PI * 2); g.fill(); }
      else { g.strokeStyle = PAL.trim; g.lineWidth = 1.2; g.beginPath(); g.arc(c[0], c[1], r * 0.7, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); }
    };
    return [{ f: 0.08, fn: legs, bias: 0.02 }, { f: -0.32, fn: torso, bias: -0.06 }, { f: 0.2, fn: arms, bias: -0.08 }, { f: -0.22, fn: headFn, bias: -0.12 }];
  }
  /** draw one rider frame into context g with ground anchor (ox, oy); dir in DIRS */
  function drawFrame(g, ox, oy, dir, k, stop) {
    const v = VEC[dir], a = Math.atan2(v[1], v[0]);
    const P = (x, y, z) => [ox + (x - y) * 32, oy - ((x + y) * 16 + (z || 0) * 39.19)];
    // (ground shadow comes from the engine's dynamic actor shadow)
    EB.draw(g, P, { x: 0, y: 0, a, style: 'delivery', col: PAL.bike, acc: PAL.box, seed: 1, riding: true, lean: stop ? 0 : 0.012 * Math.sin(k / NR * Math.PI * 2), extra: riderParts(k, stop) });
  }
  /** build the sheet canvas + frame table; returns null if no canvas */
  function build() {
    const doc = root.document; if (!doc || !doc.createElement) return null;
    const cv = doc.createElement('canvas'); if (!cv || !cv.getContext) return null;
    cv.width = CW * (NR + 1); cv.height = CH * DIRS.length;
    const g = cv.getContext('2d'); if (!g || typeof g.arc !== 'function') return null;
    const frames = {};
    DIRS.forEach((d, r) => {
      for (let k = 0; k <= NR; k++) {
        const stop = k === NR, x = k * CW, y = r * CH;
        drawFrame(g, x + AX, y + AY, d, k, stop);
        frames[stop ? 'stop_' + d + '_0' : 'ride_' + d + '_' + k] = [x, y, CW, CH, AX, AY];
      }
    });
    return { canvas: cv, frames };
  }
  let done = false;
  function install() {
    if (done) return true;
    let b = null; try { b = build(); } catch (e) { b = null; }
    if (!b) return false;
    // sanity: the canvas must actually hold pixels (a stub context leaves us on the PNG sheet)
    try { const px = b.canvas.getContext('2d').getImageData(AX, AY - 30, 1, 1); if (!px || !px.data || px.data.length < 4) return false; } catch (e) { return false; }
    const keys = Object.keys(A.frames);
    if (!keys.every((k) => b.frames[k])) return false;
    A.frames = Object.assign({}, A.frames, b.frames); A.logical = [CW, CH]; A.artV = 'ebike_rider_v1';
    SP.img.actor_rider = b.canvas; if (SP.tintedActors) SP.tintedActors.rider = b.canvas;
    done = true; return true;
  }
  const api = { DIRS, CELL: [CW, CH], ANCHOR: [AX, AY], PAL, riderParts, drawFrame, build, install, get installed() { return done; } };
  root.RiderArt = api; SP.riderArt = api;
  if (typeof SP.applyOverrides === 'function') { const orig = SP.applyOverrides; SP.applyOverrides = function () { const r = orig.apply(this, arguments); try { install(); } catch (e) { /* keep PNG sheet */ } return r; }; }
})(typeof window !== 'undefined' ? window : globalThis);
