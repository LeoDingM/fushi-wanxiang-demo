/* Procedural pixel props for P0 A1 (槐东剪艺 barber interior) and the P1 open-interior demo roof.
 * Same 45° projection as the kit (32 px/m across, 16 px/m deep, 39.19 px/m up), S faces lit, W faces in shade, 1 px
 * dark outlines, alpha thresholded to hard pixel edges. Frames are appended to the interior atlas at compose time on
 * their own cleared band (below every frame already registered), the same way the stair labels are placed (A7). */
(function (root) {
  'use strict';
  const KX = 32, KY = 16, PZ = 39.1918;
  function shade(hex, f) { const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(f >= 1 ? v + (255 - v) * (f - 1) : v * f)))); return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join(''); }
  /** painter for one sprite: local coords (metres, piece frame) -> rotated world offset -> sprite pixels */
  function painter(g, ox, oy, rot) {
    const R = (x, y) => (rot === 6 ? [y, -x] : rot === 2 ? [-y, x] : rot === 4 ? [-x, -y] : [x, y]);
    const P = (x, y, z) => { const [a, b] = R(x, y); return [ox + (a - b) * KX, oy - (a + b) * KY - z * PZ]; };
    const W = (a, b, z) => [ox + (a - b) * KX, oy - (a + b) * KY - z * PZ];       // already-world offsets
    function quad(pts, fill, line) { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.strokeStyle = line; g.lineWidth = 1; g.stroke(); } }
    const face = (pts, fill, line) => quad(pts.map((p) => P(...p)), fill, line);
    /** axis-aligned box given in local coords (rotated to world first) */
    function box(x0, y0, z0, x1, y1, z1, col, o = {}) {
      const a = R(x0, y0), b = R(x1, y1), X0 = Math.min(a[0], b[0]), X1 = Math.max(a[0], b[0]), Y0 = Math.min(a[1], b[1]), Y1 = Math.max(a[1], b[1]);
      const line = o.line === false ? null : o.line || shade(col, 0.55);
      quad([W(X0, Y0, z0), W(X0, Y1, z0), W(X0, Y1, z1), W(X0, Y0, z1)], o.west || shade(col, 0.78), line);
      quad([W(X0, Y0, z0), W(X1, Y0, z0), W(X1, Y0, z1), W(X0, Y0, z1)], o.south || col, line);
      quad([W(X0, Y0, z1), W(X1, Y0, z1), W(X1, Y1, z1), W(X0, Y1, z1)], o.top || shade(col, 1.14), line);
    }
    function disc(x, y, z, r, fill, line) { const c = P(x, y, z); g.beginPath(); g.ellipse(c[0], c[1], r * KX * 1.414, r * KY * 1.414, 0, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); if (line) { g.strokeStyle = line; g.lineWidth = 1; g.stroke(); } }
    function text(s, x, y, z, size, col, skew) { const c = P(x, y, z); g.save(); g.setTransform(1, skew == null ? -0.5 : skew, 0, 1, Math.round(c[0]), Math.round(c[1])); g.fillStyle = col; g.font = `bold ${size}px sans-serif`; g.textBaseline = 'alphabetic'; g.fillText(s, 0, 0); g.restore(); }
    return { P, face, box, disc, text, quad, g };
  }
  // ---------------- sprite definitions (local geometry: x across the face, -y out of the wall / toward the room) ----
  const LEATHER = '#4a3438', CHROME = '#c3cad0', WOOD = '#9a6a43', WHITE = '#e9e5dc', STONE = '#c9c4ba';
  const bottles = ['#3f7fb5', '#d4a03a', '#5c9a5a', '#c45a4f', '#8a6bb0', '#e8e3d0', '#2f6670'];
  const SPRITES = {
    bb_station: { name: '理发镜台', geo: [-0.6, -0.46, 0, 0.6, 0, 2.2], fp: [[-0.6, -0.46, 0.6, 0]], rots: [0], draw(d) {
      // mirror on the wall first (it lies behind the cabinet)
      d.face([[-0.5, -0.01, 0.95], [0.5, -0.01, 0.95], [0.5, -0.01, 2.08], [-0.5, -0.01, 2.08]], '#5b3f2a', '#3a281b');
      d.face([[-0.44, -0.02, 1.0], [0.44, -0.02, 1.0], [0.44, -0.02, 2.02], [-0.44, -0.02, 2.02]], '#a9c6d3');
      d.face([[-0.44, -0.025, 1.6], [0.44, -0.025, 1.6], [0.44, -0.025, 2.02], [-0.44, -0.025, 2.02]], '#c3dbe4');
      for (const t of [-0.3, 0.05]) d.face([[t, -0.03, 1.15], [t + 0.07, -0.03, 1.15], [t + 0.26, -0.03, 1.85], [t + 0.19, -0.03, 1.85]], '#e6f2f5');
      d.box(-0.5, -0.12, 2.1, 0.5, 0, 2.18, '#f4ead0', { line: '#8d846f' });                    // light bar
      for (let i = 0; i < 4; i++) d.face([[-0.4 + i * 0.26, -0.125, 2.11], [-0.3 + i * 0.26, -0.125, 2.11], [-0.3 + i * 0.26, -0.125, 2.17], [-0.4 + i * 0.26, -0.125, 2.17]], '#fffbe8');
      d.box(-0.56, -0.42, 0, 0.56, 0, 0.8, WOOD, { top: '#b48256' });                               // cabinet
      for (const x of [-0.53, 0.02]) d.face([[x, -0.425, 0.08], [x + 0.5, -0.425, 0.08], [x + 0.5, -0.425, 0.72], [x, -0.425, 0.72]], '#a8754b', '#6d4a2f');
      for (const x of [-0.06, 0.1]) d.face([[x, -0.43, 0.42], [x + 0.04, -0.43, 0.42], [x + 0.04, -0.43, 0.5], [x, -0.43, 0.5]], CHROME);
      d.box(-0.6, -0.46, 0.8, 0.6, 0, 0.86, STONE, { top: '#dcd7cc' });                               // counter top
      [[-0.45, '#3f7fb5', 0.2], [-0.36, '#e8e3d0', 0.15], [-0.28, '#5c9a5a', 0.22], [0.32, '#d4a03a', 0.16], [0.4, '#c45a4f', 0.2]].forEach(([x, c, h]) => d.box(x, -0.2, 0.86, x + 0.06, -0.14, 0.86 + h, c));
      d.box(0.05, -0.36, 0.86, 0.25, -0.22, 0.9, '#3a3e44');                                          // comb tray
      d.box(0.08, -0.33, 0.9, 0.22, -0.3, 0.92, '#1f2226');
    } },
    bb_chair: { name: '液压理发椅', geo: [-0.3, -0.36, 0, 0.3, 0.44, 1.42], fp: [[-0.28, -0.28, 0.28, 0.28]], rots: [0], draw(d) {
      d.box(-0.16, 0.3, 0.1, 0.16, 0.44, 0.15, CHROME, { line: '#7b8288' });                          // footrest (north)
      d.box(-0.03, 0.12, 0.1, 0.03, 0.3, 0.14, '#8d949a');
      d.disc(0, 0, 0.02, 0.26, '#9aa2a8', '#5d6469'); d.disc(0, 0, 0.05, 0.24, CHROME, '#6f777c');      // pedestal
      d.box(-0.05, -0.05, 0.05, 0.05, 0.05, 0.42, '#d5dadd', { line: '#6f777c' });                    // hydraulic column
      d.box(-0.26, -0.26, 0.42, 0.26, 0.28, 0.58, LEATHER, { top: '#5d4247' });                       // seat
      for (const x of [-0.3, 0.24]) { d.box(x, -0.2, 0.62, x + 0.06, 0.24, 0.7, LEATHER); d.box(x + 0.01, 0.16, 0.42, x + 0.05, 0.22, 0.62, CHROME, { line: '#6f777c' }); }
      d.box(-0.25, -0.34, 0.5, 0.25, -0.2, 1.16, LEATHER, { south: '#53393e', top: '#634a4f' });     // backrest (toward camera)
      for (let z = 0.62; z < 1.1; z += 0.14) d.face([[-0.2, -0.345, z], [0.2, -0.345, z]], null, '#3a2629');
      d.box(-0.03, -0.3, 1.16, 0.03, -0.25, 1.24, CHROME, { line: '#6f777c' });
      d.box(-0.13, -0.33, 1.24, 0.13, -0.22, 1.4, LEATHER, { top: '#634a4f' });                       // headrest
    } },
    bb_shampoo: { name: '洗头床', geo: [-0.38, -1.72, 0, 0.38, 0, 1.08], fp: [[-0.38, -1.72, 0.38, 0]], rots: [0], draw(d) {
      d.box(-0.36, -0.5, 0, 0.36, 0, 0.88, WHITE, { top: '#f6f3ec' });                                 // ceramic basin cabinet
      d.disc(0, -0.25, 0.885, 0.2, '#cfd7da', '#8d989c'); d.disc(0, -0.24, 0.885, 0.13, '#9fb0b6');
      d.box(-0.03, -0.06, 0.88, 0.03, 0, 1.06, CHROME, { line: '#6f777c' }); d.box(-0.03, -0.18, 1.0, 0.03, -0.04, 1.05, CHROME, { line: '#6f777c' });
      d.box(-0.3, -1.7, 0, 0.3, -0.5, 0.3, '#3a3e44');                                                  // lounge base
      d.box(-0.33, -1.72, 0.3, 0.33, -1.38, 0.42, LEATHER, { top: '#5d4247' });                       // leg rest
      d.box(-0.33, -1.38, 0.3, 0.33, -0.86, 0.5, LEATHER, { top: '#5d4247' });                        // seat
      d.face([[-0.33, -0.86, 0.5], [0.33, -0.86, 0.5], [0.33, -0.52, 0.86], [-0.33, -0.52, 0.86]], '#634a4f', '#2f2023');   // reclined back
      d.face([[-0.33, -0.86, 0.5], [-0.33, -0.52, 0.86], [-0.33, -0.52, 0.7], [-0.33, -0.86, 0.34]], '#3d2a2e', '#2f2023');
      d.box(-0.12, -0.56, 0.82, 0.12, -0.46, 0.92, '#e9e1d2');                                        // neck towel
    } },
    bb_shelf: { name: '洗护产品货架', geo: [-0.5, -0.34, 0, 0.5, 0, 1.82], fp: [[-0.5, -0.34, 0.5, 0]], rots: [0, 6], draw(d) {
      d.box(-0.5, -0.32, 0, 0.5, 0, 0.08, '#6d4a2f');
      d.face([[-0.5, -0.01, 0], [0.5, -0.01, 0], [0.5, -0.01, 1.74], [-0.5, -0.01, 1.74]], '#efe8da', '#8b7f6b');      // back board
      d.box(-0.5, -0.32, 0, -0.46, 0, 1.74, WOOD); d.box(0.46, -0.32, 0, 0.5, 0, 1.74, WOOD);
      [0.08, 0.5, 0.92, 1.34].forEach((z, row) => {
        d.box(-0.46, -0.3, z, 0.46, 0, z + 0.04, '#b48256');
        for (let i = 0; i < 7; i++) { const x = -0.42 + i * 0.12, c = bottles[(i * 3 + row * 5) % bottles.length], h = 0.16 + ((i + row) % 3) * 0.05; d.box(x, -0.2, z + 0.04, x + 0.08, -0.12, z + 0.04 + h, c); d.box(x + 0.025, -0.175, z + 0.04 + h, x + 0.055, -0.145, z + 0.08 + h, shade(c, 0.6)); }
      });
      d.box(-0.5, -0.33, 1.74, 0.5, 0, 1.82, '#2e5a55');                                             // header strip
      d.text('洗护', -0.16, -0.335, 1.75, 6, '#f4e8b2', 0.5);
    } },
    bb_trolley: { name: '理发工具车', geo: [-0.22, -0.2, 0, 0.22, 0.2, 1.02], fp: [[-0.2, -0.18, 0.2, 0.18]], rots: [0], draw(d) {
      for (const [x, y] of [[-0.18, -0.16], [0.16, -0.16], [-0.18, 0.14], [0.16, 0.14]]) { d.box(x, y, 0.06, x + 0.02, y + 0.02, 0.86, '#7c858c', { line: '#4c5358' }); d.disc(x + 0.01, y + 0.01, 0.03, 0.03, '#2b2e31'); }
      [0.2, 0.5, 0.82].forEach((z, k) => { d.box(-0.2, -0.18, z, 0.2, 0.18, z + 0.04, '#d9dde0', { line: '#6f777c' }); if (k === 1) { d.box(-0.12, -0.08, z + 0.04, 0.0, 0.06, z + 0.08, '#c45a4f'); d.box(0.04, -0.1, z + 0.04, 0.12, 0.04, z + 0.12, '#3f7fb5'); } });
      d.box(-0.14, -0.06, 0.86, 0.06, 0.04, 0.96, '#2f3236'); d.box(0.0, -0.04, 0.9, 0.16, 0.02, 0.95, '#2f3236'); d.box(0.06, 0.06, 0.86, 0.14, 0.12, 0.92, '#e6e1d4');   // dryer, clipper, towels
    } },
    bb_lightbox: { name: '价目灯箱', geo: [-0.45, -0.07, 1.32, 0.45, 0, 2.0], fp: [], rots: [0], draw(d) {
      d.box(-0.45, -0.07, 1.32, 0.45, 0, 2.0, '#f6f2e4', { south: '#fbf7ea', line: '#5f6a68' });
      d.face([[-0.41, -0.075, 1.86], [0.41, -0.075, 1.86], [0.41, -0.075, 1.96], [-0.41, -0.075, 1.96]], '#2e5a55');
      d.text('槐东剪艺', -0.36, -0.08, 1.87, 6, '#f4e8b2');
      d.text('剪发 ¥25', -0.36, -0.08, 1.68, 7, '#3b3a36'); d.text('洗吹 含', -0.36, -0.08, 1.5, 6, '#7a4a3a'); d.text('25分钟', 0.02, -0.08, 1.5, 6, '#3b3a36');
    } },
    bb_bench: { name: '等候长凳', geo: [-0.78, -0.3, 0, 0.78, 0.3, 0.92], fp: [[-0.78, -0.28, 0.78, 0.28]], rots: [0], draw(d) {
      for (const x of [-0.72, 0.66]) d.box(x, -0.24, 0, x + 0.06, 0.24, 0.42, '#5d646a');
      d.box(-0.76, 0.12, 0.42, 0.76, 0.3, 0.92, '#7a5a3c', { top: '#8d6a48' });                       // backrest (north)
      d.box(-0.78, -0.28, 0.4, 0.78, 0.14, 0.5, '#2f5e5a', { top: '#3d726d' });                        // cushion
      for (const x of [-0.26, 0.26]) d.face([[x, -0.285, 0.41], [x, -0.285, 0.49]], null, '#204340');
    } },
    oi_roof_9: { name: '示范楼屋顶', geo: [-0.02, -0.02, 3.0, 9.17, 6.17, 3.42], fp: [], rots: [0], draw(d) {
      d.box(0, 0, 3.0, 9.15, 6.15, 3.12, '#8f8a80', { top: '#a7a296' });                                // slab
      for (let x = 0.5; x < 9.1; x += 0.5) d.face([[x, 0.15, 3.121], [x, 6.0, 3.121]], null, '#9b968a');
      d.box(0, 5.95, 3.12, 9.15, 6.15, 3.42, '#b9b1a1'); d.box(8.95, 0, 3.12, 9.15, 5.95, 3.42, '#b9b1a1');   // parapets (far first)
      d.box(6.2, 3.6, 3.12, 7.4, 4.5, 3.75, '#cfd3d4'); d.face([[6.3, 3.595, 3.25], [7.3, 3.595, 3.25], [7.3, 3.595, 3.65], [6.3, 3.595, 3.65]], '#9aa2a6', '#6f777c');   // AC unit
      d.disc(6.8, 4.05, 3.76, 0.32, '#3f4447');
      d.box(1.6, 3.2, 3.12, 2.4, 4.0, 3.5, '#7c776d');                                                  // roof hatch
      d.box(0, 0, 3.12, 0.2, 5.95, 3.42, '#c4bcac'); d.box(0, 0, 3.12, 9.15, 0.2, 3.42, '#cbc3b3');      // near parapets
      d.text('井槐里 · 开放室内示范', 3.0, -0.01, 3.17, 7, '#4b463d');
    } },
  };
  function boundsOf(geo) {
    const [x0, y0, z0, x1, y1, z1] = geo, xs = [], ys = [];
    for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) { xs.push((x - y) * KX); ys.push(-(x + y) * KY - z * PZ); }
    return [Math.floor(Math.min(...xs)) - 4, Math.floor(Math.min(...ys)) - 4, Math.ceil(Math.max(...xs)) + 4, Math.ceil(Math.max(...ys)) + 4];
  }
  function rotGeo(g, rot) { if (rot !== 6) return g; return [g[1], -g[3], g[2], g[4], -g[0], g[5]]; }     // local (x,y) -> world (y,-x)
  function threshold(g, x, y, w, h) { const im = g.getImageData(x, y, w, h), a = im.data; for (let i = 3; i < a.length; i += 4) a[i] = a[i] >= 110 ? 255 : 0; g.putImageData(im, x, y); }
  function mask(g, x, y, w, h) { const cols = Math.ceil(w / 4), rows = Math.ceil(h / 4), a = g.getImageData(x, y, w, h).data, bytes = new Uint8Array(Math.ceil(cols * rows / 8)); for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { let hit = false; for (let dy = 0; dy < 4 && !hit; dy++) for (let dx = 0; dx < 4; dx++) { const xx = c * 4 + dx, yy = r * 4 + dy; if (xx < w && yy < h && a[(yy * w + xx) * 4 + 3] > 0) { hit = true; break; } } if (hit) { const i = r * cols + c; bytes[i >> 3] |= 1 << (7 - (i & 7)); } } let s = ''; for (const b of bytes) s += String.fromCharCode(b); return [cols, rows, (typeof btoa === 'function' ? btoa : root.btoa || ((t) => Buffer.from(t, 'binary').toString('base64')))(s)]; }
  /** paint every sprite into one sheet; returns {sheet, frames:[{key,x,y,w,h,ox,oy}], pieces, masks} */
  function paint(makeCanvas) {
    const items = [];
    for (const [type, S] of Object.entries(SPRITES)) for (const rot of S.rots) { const b = boundsOf(rotGeo(S.geo, rot)); items.push({ type, rot, S, w: b[2] - b[0], h: b[3] - b[1], ox: -b[0], oy: -b[1] }); }
    const WIDTH = 1024; let x = 0, y = 0, rowH = 0;
    for (const it of items) { if (x + it.w > WIDTH) { x = 0; y += rowH + 2; rowH = 0; } it.x = x; it.y = y; x += it.w + 2; rowH = Math.max(rowH, it.h); }
    const sheet = makeCanvas(WIDTH, y + rowH + 2), g = sheet.getContext('2d'), frames = [], masks = {}, pieces = {};
    for (const it of items) {
      g.save(); g.beginPath(); g.rect(it.x, it.y, it.w, it.h); g.clip(); it.S.draw(painter(g, it.x + it.ox, it.y + it.oy, it.rot)); g.restore();
      threshold(g, it.x, it.y, it.w, it.h);
      const key = `${it.type}/base/main/default/${it.rot}`; frames.push({ key, x: it.x, y: it.y, w: it.w, h: it.h, ox: it.ox, oy: it.oy }); masks[key] = mask(g, it.x, it.y, it.w, it.h);
    }
    for (const [type, S] of Object.entries(SPRITES)) { const g6 = S.geo; pieces[type] = { layer: 'sorted', origin: 'center', states: ['default'], rots: S.rots.slice(), parts: ['main'], variants: ['base'], footprint: S.fp.map((r) => r.slice()), fadeable: type === 'oi_roof_9', geo: { default: { main: g6.slice() } }, name: S.name }; }
    return { sheet, frames, masks, pieces };
  }
  const api = { SPRITES, paint, shade, boundsOf, rotGeo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.OpenInteriorArt = api;
  const SP = root.SP; if (!SP || !SP.K || !root.document) return;
  const out = paint((w, h) => { const c = root.document.createElement('canvas'); c.width = w; c.height = h; return c; });
  Object.assign(SP.K.pieces, out.pieces); Object.assign(SP.K.masks, out.masks);
  const mine = new Set(out.frames.map((f) => f.key));
  let off = Math.max(4, ...Object.entries(SP.K.frames).filter(([k, f]) => f[6] && !mine.has(k)).map(([, f]) => f[1] + f[3])) + 4;
  const place = () => { for (const f of out.frames) SP.K.frames[f.key] = [f.x, off + f.y, f.w, f.h, f.ox, f.oy, 1]; };
  place();
  const compose = () => {                     // runs last in the load chain: relocate below everything already composed
    const F = SP.K.frames, base = SP.img.int_atlas;
    off = Math.max(off, (base && base.height) || 0, ...Object.entries(F).filter(([k, f]) => f[6] && !mine.has(k) && !k.startsWith('stair_label_')).map(([, f]) => f[1] + f[3])) + 4; place();
    for (const k of ['int_atlas', 'int_emit']) { const old = SP.img[k]; if (!old) continue; const a = root.document.createElement('canvas'); a.width = Math.max(old.width || 0, out.sheet.width); a.height = Math.max(old.height || 0, off + out.sheet.height); const g = a.getContext('2d'); g.drawImage(old, 0, 0); g.clearRect(0, off, out.sheet.width, out.sheet.height); if (k === 'int_atlas') g.drawImage(out.sheet, 0, off); SP.img[k] = a; }
    SP.openInteriorArt = { off, frames: out.frames.length, keys: [...mine] };
  };
  const load0 = SP.load; if (typeof load0 === 'function') SP.load = function () { return Promise.resolve(load0.apply(this, arguments)).then((r) => { compose(); return r; }); };
  else if (SP.img && SP.img.int_atlas) compose();
})(typeof window !== 'undefined' ? window : globalThis);
