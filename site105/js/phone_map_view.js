/* 手机地图画布（phone-map-nav）：从 SP.mapWorld 的真实世界数据绘制道路、人行道、水面、公园、建筑、斑马线、桥、公交/地铁线、
 * 地点与玩家位置；支持拖动、双指缩放、滚轮缩放、双击放大、点选地点。
 * 性能：全图底图只烘焙一次（2 px/m，按世界签名缓存，扩张后自动重烘）；放大后只为视口附近的 256 px 瓦片烘焙细节（LRU 缓存），
 * 每帧最多新烘 3 块，其余下一帧补；标签、路线、玩家位置每帧现画。 */
(function (root) {
  'use strict';
  const SP = root.SP;
  if (!SP || SP.phoneMapView) return;
  const BASE_PPM = 2, TILE_PX = 256, LEVELS = [4, 8, 16, 32], TILE_CAP = 72, PER_FRAME = 3;
  const COLORS = { bg: '#ece8df', road: '#c3c8cf', carriage: '#aeb4bd', walk: '#f6f3ec', green: '#cfe5bf', court: '#ead7b4', water: '#9fcdec', waterEdge: '#7fb4d9', building: '#d8d0c3', buildingEdge: '#b4aa99', tall: '#c6bcad', block: '#dedad1', market: '#f0d3a4', fence: '#958e82', prop: '#bdb5a7', tree: '#9fca8b', bridge: '#e7dcc6', zebra: '#ffffff' };
  const CAT = {
    transit: { label: '交通', color: '#1c7ed6', glyph: '交' }, life: { label: '生活服务', color: '#2f9e44', glyph: '生' }, shop: { label: '购物', color: '#e8590c', glyph: '购' },
    school: { label: '学校', color: '#7048e8', glyph: '学' }, park: { label: '公园景点', color: '#37b24d', glyph: '园' }, work: { label: '办公', color: '#495057', glyph: '办' },
    home: { label: '住宅', color: '#c2255c', glyph: '住' }, parking: { label: '共享停放', color: '#0f9b8e', glyph: 'P' }, metro: { label: '地铁', color: '#9c36b5', glyph: '铁' }
  };
  let baseCache = null, tileCache = new Map(), worldSig = '';
  function shade(hex, k) { const n = parseInt(hex.slice(1), 16), f = (v) => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join(''); }
  function newCanvas(w, h) { const c = root.document?.createElement?.('canvas'); if (!c) return null; c.width = w; c.height = h; return c; }
  /** paint the world rect [x0,y0]-[x1,y1] into ctx at ppm px per metre (north up). detail adds props, fences, zebras, lane marks */
  function paintWorld(ctx, F, x0, y0, x1, y1, ppm, detail) {
    const H = (y1 - y0) * ppm, X = (x) => (x - x0) * ppm, Y = (y) => H - (y - y0) * ppm;
    ctx.fillStyle = COLORS.bg; ctx.fillRect(0, 0, (x1 - x0) * ppm, H);
    const G = F.ground, cs = G.cell, colors = [COLORS.bg, COLORS.road, COLORS.walk, COLORS.green, COLORS.court, COLORS.water];
    const c0 = Math.max(0, Math.floor((x0 - G.origin[0]) / cs)), c1 = Math.min(G.cols - 1, Math.ceil((x1 - G.origin[0]) / cs)), r0 = Math.max(0, Math.floor((y0 - G.origin[1]) / cs)), r1 = Math.min(G.rows - 1, Math.ceil((y1 - G.origin[1]) / cs));
    for (let r = r0; r <= r1; r++) {
      let run = -1, start = c0;
      for (let c = c0; c <= c1 + 1; c++) {
        const v = c <= c1 ? (F.carriage[r * G.cols + c] ? 6 : F.gcode[r * G.cols + c]) : -2;
        if (v !== run) { if (run >= 0 && run !== 0) { ctx.fillStyle = run === 6 ? COLORS.carriage : colors[run]; const gx = G.origin[0] + start * cs, gy = G.origin[1] + r * cs; ctx.fillRect(X(gx), Y(gy + cs), (c - start) * cs * ppm + 0.6, cs * ppm + 0.6); } run = v; start = c; }
      }
    }
    const inView = (b) => b[2] >= x0 - 2 && b[0] <= x1 + 2 && b[3] >= y0 - 2 && b[1] <= y1 + 2;
    const rect = (r, fill, stroke, lw) => { ctx.fillStyle = fill; ctx.fillRect(X(r[0]), Y(r[3]), (r[2] - r[0]) * ppm, (r[3] - r[1]) * ppm); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.strokeRect(X(r[0]), Y(r[3]), (r[2] - r[0]) * ppm, (r[3] - r[1]) * ppm); } };
    const poly = (p, fill, stroke) => { ctx.beginPath(); p.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); } };
    /* water edges + bridges */
    for (const w of F.water) if (inView(w)) rect(w, COLORS.water);
    for (const b of F.bridges) if (inView(b.rect)) { const r = b.rect, deck = /小桥/.test(b.name) ? r : [r[0], Math.max(r[1], 190), r[2], Math.min(r[3], 240)]; rect(deck, COLORS.bridge, '#b8a888', Math.max(1, ppm / 4)); }
    for (const p of F.green) if (inView(p.box)) (p.rect ? rect(p.rect, COLORS.green) : poly(p.poly, COLORS.green));
    for (const p of F.blocks) if (inView(p.box)) rect(p.rect || p.box, COLORS.block, detail ? '#cfc9bd' : null);
    for (const m of F.markets) if (inView(m.rect)) rect(m.rect, COLORS.market, '#c89a55', Math.max(1, ppm / 3));
    for (const b of F.buildings) {
      const box = b.rect || polyBox(b.poly); if (!inView(box)) continue;
      const fill = b.floors >= 12 ? shade(COLORS.tall, 0.92) : b.floors >= 7 ? COLORS.tall : COLORS.building;
      if (b.rect) rect(b.rect, fill, detail ? COLORS.buildingEdge : null, Math.max(1, ppm / 5)); else poly(b.poly, fill, detail ? COLORS.buildingEdge : null);
    }
    if (detail) {
      if (ppm >= 8) for (const p of F.props) if (inView(p.box)) (p.rect ? rect(p.rect, /tree|willow|banyan/.test(p.type || '') ? COLORS.tree : COLORS.prop) : poly(p.poly, COLORS.prop));
      ctx.strokeStyle = COLORS.fence; ctx.lineWidth = Math.max(1, ppm / 8);
      for (const p of F.fences) if (inView(p.box)) { const b = p.box; ctx.beginPath(); if (b[2] - b[0] >= b[3] - b[1]) { ctx.moveTo(X(b[0]), Y((b[1] + b[3]) / 2)); ctx.lineTo(X(b[2]), Y((b[1] + b[3]) / 2)); } else { ctx.moveTo(X((b[0] + b[2]) / 2), Y(b[1])); ctx.lineTo(X((b[0] + b[2]) / 2), Y(b[3])); } ctx.stroke(); }
      /* zebra stripes across the road direction */
      ctx.fillStyle = COLORS.zebra;
      for (const w of F.crosswalks) if (!w.implicit && inView(w.rect)) { const r = w.rect, step = 0.9; if (w.road === 'y') for (let y = r[1] + 0.3; y < r[3] - 0.2; y += step) ctx.fillRect(X(r[0]), Y(y + 0.45), (r[2] - r[0]) * ppm, 0.45 * ppm); else for (let x = r[0] + 0.3; x < r[2] - 0.2; x += step) ctx.fillRect(X(x), Y(r[3]), 0.45 * ppm, (r[3] - r[1]) * ppm); }
      if (ppm >= 8) { ctx.strokeStyle = '#f2f2ee'; ctx.lineWidth = Math.max(1, ppm / 10); if (ctx.setLineDash) ctx.setLineDash([ppm * 1.5, ppm * 1.5]);
        for (const l of F.lanes) { const a = Math.max(Math.min(...l.range), l.axis === 'x' ? x0 : y0), b = Math.min(Math.max(...l.range), l.axis === 'x' ? x1 : y1); if (a >= b) continue; ctx.beginPath(); if (l.axis === 'x') { ctx.moveTo(X(a), Y(l.c)); ctx.lineTo(X(b), Y(l.c)); } else { ctx.moveTo(X(l.c), Y(a)); ctx.lineTo(X(l.c), Y(b)); } ctx.stroke(); }
        if (ctx.setLineDash) ctx.setLineDash([]); }
    }
  }
  function polyBox(p) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of p) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; }
  function extent(F) { const G = F.ground, B = F.bounds; return [Math.max(G.origin[0], B.x0 - 14), Math.max(G.origin[1], B.y0 - 14), Math.min(G.origin[0] + G.cols * G.cell, B.x1 + 14), Math.min(G.origin[1] + G.rows * G.cell, B.y1 + 14)]; }
  function freshCaches() { const sig = SP.mapWorld?.signature?.() || ''; if (sig !== worldSig) { worldSig = sig; baseCache = null; tileCache = new Map(); } }
  function base(F) {
    freshCaches();
    if (baseCache) return baseCache;
    const E = extent(F), c = newCanvas(Math.ceil((E[2] - E[0]) * BASE_PPM), Math.ceil((E[3] - E[1]) * BASE_PPM)); if (!c) return null;
    const ctx = c.getContext('2d'); if (!ctx) return null;
    paintWorld(ctx, F, E[0], E[1], E[2], E[3], BASE_PPM, false);
    baseCache = { canvas: c, E, ppm: BASE_PPM, bakes: (baseCache?.bakes || 0) + 1 }; stats.baseBakes++;
    return baseCache;
  }
  function tile(F, level, tx, ty) {
    const key = level + ':' + tx + ':' + ty; let t = tileCache.get(key);
    if (t) { tileCache.delete(key); tileCache.set(key, t); return t; }
    return null;
  }
  function bakeTile(F, level, tx, ty) {
    const size = TILE_PX / level, x0 = tx * size, y0 = ty * size, c = newCanvas(TILE_PX, TILE_PX); if (!c) return null;
    const ctx = c.getContext('2d'); if (!ctx) return null;
    paintWorld(ctx, F, x0, y0, x0 + size, y0 + size, level, true);
    const t = { canvas: c, x0, y0, size }; tileCache.set(level + ':' + tx + ':' + ty, t); stats.tileBakes++;
    while (tileCache.size > TILE_CAP) tileCache.delete(tileCache.keys().next().value);
    return t;
  }
  const stats = { baseBakes: 0, tileBakes: 0, frames: 0 };

  function create(stage, opts = {}) {
    const doc = root.document, cv = doc.createElement('canvas');
    cv.className = 'phone-map-canvas amap-v2'; cv.setAttribute?.('aria-label', '社区地图：上北下南，可拖动和缩放；点按地点查看详情');
    cv.setAttribute?.('role', 'img'); if (cv.style) cv.style.touchAction = 'none';
    stage.appendChild(cv);
    const view = { canvas: cv, cam: null, pois: opts.pois || [], selected: opts.selected || null, target: opts.target || null, route: null, onSelect: opts.onSelect || (() => {}), onRegion: opts.onRegion || (() => {}), filter: null, labels: [], markers: [], raf: 0, destroyed: false };
    const dpr = () => Math.max(1, Math.min(3, root.devicePixelRatio || 1));
    function size() {
      const w = Math.round(cv.clientWidth || opts.width || 560), h = Math.round(cv.clientHeight || opts.height || 300), d = dpr();
      if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
      return { w, h, d };
    }
    function features() { try { return SP.mapWorld?.features?.() || null; } catch (e) { return null; } }
    function fit(rect) {
      const F = features(), { w, h } = size(), E = rect || (F ? [F.bounds.x0, F.bounds.y0, F.bounds.x1, F.bounds.y1] : null);
      const pts = view.pois.map((p) => [p[2], p[3]]);
      const R = E || [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
      /* keep the fitted rect clear of the search bar (top) and the zoom buttons (right) */
      const pl = 22, pr = w > 220 ? 62 : 22, pt = h > 260 ? 70 : 22, pb = 22, s = Math.min((w - pl - pr) / Math.max(1, R[2] - R[0]), (h - pt - pb) / Math.max(1, R[3] - R[1]));
      view.cam = { x: (R[0] + R[2]) / 2 - (pl - pr) / 2 / s, y: (R[1] + R[3]) / 2 + (pt - pb) / 2 / s, s }; view.minS = Math.min(s, 0.4); view.maxS = 14; clamp(); draw();
    }
    function clamp() {
      const c = view.cam, F = features(); c.s = Math.max(view.minS || 0.3, Math.min(view.maxS || 14, c.s));
      if (F) { const B = F.bounds; c.x = Math.max(B.x0 - 20, Math.min(B.x1 + 20, c.x)); c.y = Math.max(B.y0 - 20, Math.min(B.y1 + 20, c.y)); }
    }
    const toScreen = (x, y) => { const { w, h } = size(), c = view.cam; return [w / 2 + (x - c.x) * c.s, h / 2 - (y - c.y) * c.s]; };
    const toWorld = (sx, sy) => { const { w, h } = size(), c = view.cam; return [c.x + (sx - w / 2) / c.s, c.y - (sy - h / 2) / c.s]; };
    function centerOn(x, y, s) { if (!view.cam) fit(); view.cam.x = x; view.cam.y = y; if (s) view.cam.s = s; clamp(); schedule(); }
    function zoomAt(sx, sy, k) { const before = toWorld(sx, sy); view.cam.s *= k; clamp(); const after = toWorld(sx, sy); view.cam.x += before[0] - after[0]; view.cam.y += before[1] - after[1]; clamp(); schedule(); }
    function schedule() { if (view.destroyed) return; if (root.requestAnimationFrame) { if (!view.raf) view.raf = root.requestAnimationFrame(() => { view.raf = 0; draw(); }); } else draw(); }
    function draw() {
      if (view.destroyed) return; if (!view.cam) { fit(); return; }
      const { w, h, d } = size(), ctx = cv.getContext('2d'); if (!ctx) return; stats.frames++;
      ctx.setTransform?.(d, 0, 0, d, 0, 0); ctx.fillStyle = COLORS.bg; ctx.fillRect(0, 0, w, h);
      const F = features(), c = view.cam, [wx0, wy1] = toWorld(0, 0), [wx1, wy0] = toWorld(w, h);
      if (F) {
        const B = base(F);
        if (B) { const [sx, sy] = toScreen(B.E[0], B.E[3]); ctx.imageSmoothingEnabled = c.s * d < B.ppm * 1.5; ctx.drawImage(B.canvas, sx, sy, (B.E[2] - B.E[0]) * c.s, (B.E[3] - B.E[1]) * c.s); }
        const devPpm = c.s * d;
        if (devPpm > BASE_PPM * 1.6) {
          const level = LEVELS.find((L) => L >= devPpm * 0.9) || LEVELS[LEVELS.length - 1], size = TILE_PX / level;
          let baked = 0, pending = false;
          for (let ty = Math.floor(wy0 / size); ty <= Math.floor(wy1 / size); ty++) for (let tx = Math.floor(wx0 / size); tx <= Math.floor(wx1 / size); tx++) {
            let t = tile(F, level, tx, ty);
            if (!t && baked < PER_FRAME) { t = bakeTile(F, level, tx, ty); baked++; }
            if (!t) { pending = true; continue; }
            const [sx, sy] = toScreen(t.x0, t.y0 + t.size); ctx.imageSmoothingEnabled = true; ctx.drawImage(t.canvas, sx, sy, t.size * c.s + 0.5, t.size * c.s + 0.5);
          }
          if (pending) schedule();
        }
        overlays(ctx, F, w, h);
      }
      markers(ctx, w, h);
      if (opts.onDraw) opts.onDraw(view);
    }
    function overlays(ctx, F, w, h) {
      const c = view.cam, T = F.transit;
      /* bus lines (offset to their kerb side) and metro */
      if (c.s >= 0.5) for (const l of T.lines) {
        ctx.strokeStyle = l.color; ctx.globalAlpha = 0.75; ctx.lineWidth = Math.max(2, Math.min(5, c.s * 1.2)); ctx.beginPath();
        if (l.axis === 'x') { const [a, y] = toScreen(l.from, l.c), [b] = toScreen(l.to, l.c); ctx.moveTo(a, y); ctx.lineTo(b, y); } else { const [x, a] = toScreen(l.c, l.from), [, b] = toScreen(l.c, l.to); ctx.moveTo(x, a); ctx.lineTo(x, b); }
        ctx.stroke(); ctx.globalAlpha = 1;
      }
      for (const m of T.metro) { const [x, y] = toScreen(m.x, m.y); ctx.strokeStyle = CAT.metro.color; ctx.lineWidth = 3; if (ctx.setLineDash) ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.min(w, 80), y + 26); ctx.stroke(); if (ctx.setLineDash) ctx.setLineDash([]); label(ctx, '3号线 → CBD', x + 46, y + 26, { color: CAT.metro.color, size: 11, bold: true, halo: true, prio: 9 }); }
      /* route */
      if (view.route?.points?.length > 1) {
        const P = view.route.points.map((p) => toScreen(p[0], p[1]));
        for (const [lw, col] of [[Math.max(6, Math.min(10, c.s * 2.2)), '#ffffff'], [Math.max(3.5, Math.min(7, c.s * 1.5)), '#1971c2']]) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
        if (c.s >= 1.6) (view.route.steps || []).forEach((s, i) => { if (!s.at || s.kind === 'arrive' || !i) return; const [x, y] = toScreen(s.at[0], s.at[1]); ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1971c2'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
      }
      /* area / road / water labels with collision */
      view.labels = [];
      const R = F.regions, s = c.s;
      for (const r of R) {
        const [ax, ay] = toScreen(r.rect[0], r.rect[3]), [bx, by] = toScreen(r.rect[2], r.rect[1]);
        if (bx < 0 || ax > w || by < 0 || ay > h) continue;
        const cx = (Math.max(ax, 0) + Math.min(bx, w)) / 2, cy = (Math.max(ay, 0) + Math.min(by, h)) / 2;
        if (r.kind === 'district' && s < 4.5 && s >= 0.55) label(ctx, r.name, cx, cy, { color: '#6b6457', size: s < 1 ? 10 : 12, prio: 2, halo: true });
        else if (r.kind === 'campus' && s >= 0.6) label(ctx, r.name, cx, cy, { color: '#5f3dc4', size: 11, prio: 3, halo: true });
        else if (r.kind === 'market' && s >= 0.9) label(ctx, r.name, cx, cy, { color: '#a0611b', size: 11, prio: 4, halo: true, bold: true });
        else if (r.kind === 'water' && s >= 0.5) label(ctx, r.name, r.axis === 'y' ? Math.max(ax, Math.min(bx, cx)) : cx, cy, { color: '#1864ab', size: 12, prio: 6, halo: true, italic: true, vertical: r.axis === 'y' });
        else if (r.kind === 'park' && s >= 0.9) label(ctx, r.name, cx, cy, { color: '#2b8a3e', size: 11, prio: 3, halo: true });
        else if (r.kind === 'bridge' && s >= 1.4) label(ctx, r.name, cx, cy, { color: '#7a5c2e', size: 10, prio: 5, halo: true });
        else if (r.kind === 'road' && s >= 1.0) { const long = r.axis === 'y' ? by - ay : bx - ax; if (long > 60) label(ctx, r.name, cx, cy, { color: '#343a40', size: 11, prio: 5, halo: true, vertical: r.axis === 'y', bold: true }); }
      }
    }
    function label(ctx, text, x, y, o) {
      const size = o.size || 11; ctx.font = (o.italic ? 'italic ' : '') + (o.bold ? '600 ' : '') + size + 'px system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
      const m = ctx.measureText ? ctx.measureText(text) : null, tw = (m && m.width) || text.length * size, bw = o.vertical ? size + 4 : tw + 6, bh = o.vertical ? text.length * (size + 1) + 4 : size + 6;
      const box = [x - bw / 2, y - bh / 2, x + bw / 2, y + bh / 2];
      if (view.labels.some((b) => !(box[2] < b[0] || box[0] > b[2] || box[3] < b[1] || box[1] > b[3]))) return false;
      view.labels.push(box);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const chars = o.vertical ? [...text] : [text];
      chars.forEach((ch, i) => { const yy = o.vertical ? box[1] + 2 + (i + 0.5) * (size + 1) : y; if (o.halo) { ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.strokeText?.(ch, x, yy); } ctx.fillStyle = o.color || '#333'; ctx.fillText(ch, x, yy); });
      return true;
    }
    function markers(ctx, w, h) {
      const c = view.cam; view.markers = [];
      const list = view.pois.filter((p) => !p[5]?.via && (!view.filter || view.filter(p)));
      const order = list.slice().sort((a, b) => (a[0] === view.selected || a[0] === view.target) - (b[0] === view.selected || b[0] === view.target));
      for (const p of order) {
        const [x, y] = toScreen(p[2], p[3]); if (x < -20 || y < -20 || x > w + 20 || y > h + 20) continue;
        const sel = p[0] === view.selected, tgt = p[0] === view.target, cat = CAT[opts.category ? opts.category(p) : 'life'] || CAT.life, r = sel ? 12 : tgt ? 10.5 : c.s < 0.9 ? 6.5 : 8.5;
        ctx.fillStyle = sel ? '#f76707' : tgt ? '#fd7e14' : cat.color; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (r >= 8) { ctx.fillStyle = '#ffffff'; ctx.font = '600 ' + Math.round(r * 1.05) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(cat.glyph, x, y + 0.5); }
        view.markers.push({ id: p[0], x, y, r: Math.max(r, 14) });
        if (sel || tgt || c.s >= 2.4) label(ctx, p[1], x, y - r - 9, { color: sel ? '#d9480f' : '#212529', size: sel ? 12 : 10.5, bold: sel, halo: true, prio: sel ? 10 : 1 });
      }
      /* player */
      const P = SP.player, W = SP.world;
      if (P && !W?.interior && Number.isFinite(P.x) && Number.isFinite(P.y) && !opts.hidePlayer?.()) {
        const [x, y] = toScreen(P.x, P.y), v = SP.dirVec?.[P.dir];
        if (v) { const a = Math.atan2(-v[1], v[0]); ctx.fillStyle = 'rgba(28,126,214,0.28)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, 22, a - 0.5, a + 0.5); ctx.closePath(); ctx.fill(); }
        ctx.fillStyle = '#1c7ed6'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        view.player = [x, y];
      }
    }
    /* ---- input: drag, pinch, wheel, tap, double tap */
    const pts = new Map(); let gesture = null, lastTap = 0;
    const local = (e) => { const r = cv.getBoundingClientRect ? cv.getBoundingClientRect() : { left: 0, top: 0 }; return [e.clientX - r.left, e.clientY - r.top]; };
    cv.onpointerdown = (e) => { e.preventDefault?.(); cv.setPointerCapture?.(e.pointerId); pts.set(e.pointerId, local(e)); gesture = { start: Date.now(), moved: 0, cam: { ...view.cam }, pts: new Map([...pts].map(([k, v]) => [k, v.slice()])) }; };
    cv.onpointermove = (e) => {
      if (!pts.has(e.pointerId) || !gesture) return; pts.set(e.pointerId, local(e));
      const cur = [...pts.values()], st = [...gesture.pts.values()];
      if (cur.length >= 2 && st.length >= 2) {
        const d0 = Math.hypot(st[0][0] - st[1][0], st[0][1] - st[1][1]) || 1, d1 = Math.hypot(cur[0][0] - cur[1][0], cur[0][1] - cur[1][1]), m0 = [(st[0][0] + st[1][0]) / 2, (st[0][1] + st[1][1]) / 2], m1 = [(cur[0][0] + cur[1][0]) / 2, (cur[0][1] + cur[1][1]) / 2];
        view.cam = { ...gesture.cam }; const before = toWorld(...m0); view.cam.s = gesture.cam.s * d1 / d0; clamp(); const after = toWorld(...m1); view.cam.x += before[0] - after[0]; view.cam.y += before[1] - after[1]; gesture.moved = 99;
      } else { const a = st[0], b = cur[0]; gesture.moved = Math.max(gesture.moved, Math.hypot(b[0] - a[0], b[1] - a[1])); view.cam.x = gesture.cam.x - (b[0] - a[0]) / view.cam.s; view.cam.y = gesture.cam.y + (b[1] - a[1]) / view.cam.s; }
      clamp(); schedule();
    };
    cv.onpointerup = cv.onpointercancel = (e) => {
      const p = pts.get(e.pointerId); pts.delete(e.pointerId);
      if (gesture && p && gesture.moved < 7 && Date.now() - gesture.start < 450 && e.type !== 'pointercancel') {
        const now = Date.now(); if (now - lastTap < 320) { zoomAt(p[0], p[1], 2); lastTap = 0; } else { lastTap = now; tap(p[0], p[1]); }
      }
      if (pts.size) gesture = { start: Date.now(), moved: 99, cam: { ...view.cam }, pts: new Map([...pts].map(([k, v]) => [k, v.slice()])) }; else gesture = null;
    };
    cv.onwheel = (e) => { e.preventDefault?.(); const p = local(e); zoomAt(p[0], p[1], Math.exp(-Math.max(-60, Math.min(60, e.deltaY)) / 240)); };
    function tap(sx, sy) {
      let best = null, bd = Infinity; for (const m of view.markers) { const d = Math.hypot(m.x - sx, m.y - sy); if (d < m.r + 4 && d < bd) { bd = d; best = m; } }
      if (best) { view.onSelect(best.id); return best.id; }
      const [x, y] = toWorld(sx, sy), r = SP.mapWorld?.placeAt?.(x, y); view.onRegion(r ? r.name : null, x, y); return null;
    }
    Object.assign(view, {
      draw, schedule, fit, centerOn, zoomAt, tap, toScreen, toWorld,
      zoom: (k) => { const { w, h } = size(); zoomAt(w / 2, h / 2, k); },
      setPois(list) { view.pois = list; schedule(); }, select(id) { view.selected = id; schedule(); }, setTarget(id) { view.target = id; schedule(); },
      setRoute(r) { view.route = r && r.points ? { points: r.points.map((p) => p.slice()), steps: r.steps || [] } : null; schedule(); },
      setFilter(fn) { view.filter = fn; schedule(); },
      fitRoute() { const P = view.route?.points; if (!P?.length) return; const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]); fit([Math.min(...xs) - 8, Math.min(...ys) - 8, Math.max(...xs) + 8, Math.max(...ys) + 8]); view.cam.s = Math.min(view.cam.s, 6); clamp(); draw(); },
      destroy() { view.destroyed = true; if (view.raf && root.cancelAnimationFrame) root.cancelAnimationFrame(view.raf); },
    });
    if (opts.focus) { fit(); centerOn(opts.focus[0], opts.focus[1], opts.focusScale || 1.6); } else fit();
    return view;
  }
  SP.phoneMapView = { create, CAT, stats, cacheInfo: () => ({ base: !!baseCache, tiles: tileCache.size, signature: worldSig }), paintWorld, reset: () => { baseCache = null; tileCache = new Map(); worldSig = ''; } };
})(typeof window !== 'undefined' ? window : globalThis);
