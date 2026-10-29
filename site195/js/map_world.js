/* 手机地图 + 导航的世界模型（phone-map-nav）。
 * 全部从真实世界数据推导，不另写一份地图：
 *   - 地面：SCENE_DATA.ground（2 m 格，路面/人行道/绿地/球场/水面）
 *   - 建筑与障碍：SCENE_DATA.colliders + 每个已登记分块的 SCENE_CHUNKS[id].colliders + 所有 sorted 层构件的 footprint
 *     （与 W.rebuildColliders 同一来源，但不需要先把分块 apply 进世界）
 *   - 水面：RONGQIAO_NORTH.water（月河、榕溪）；桥是水面矩形之间的缺口
 *   - 车行道：traffic.lanes 沿车道垂直方向在沥青格上扩展；只有 traffic.crosswalks 的斑马线可以穿过；路口盒不可走
 * 以后的扩张只要照旧把数据写进 SCENE_DATA / SCENE_CHUNKS / RONGQIAO_NORTH，就会自动出现在地图、搜索和寻路里。
 * 步行网格 0.5 m，按 32 m 瓦片惰性计算（只有寻路实际经过的区域才会栅格化）。不写存档。 */
(function (root) {
  'use strict';
  const SP = root.SP;
  if (!SP || SP.mapWorld) return;
  const CELL = 0.5, TILE = 64, CLEAR = 0.32, BUCKET = 8;
  const GCLASS = { A: 1, B: 1, S: 2, K: 2, T: 2, Y: 2, G: 3, H: 3, C: 4, W: 5, U: 5, V: 5, D: 5, E: 5, I: 5 };
  /* walk cost per ground class (x10, stored in the grid): asphalt that is not a carriageway (alleys, compound roads) is allowed but avoided */
  const COST = [12, 17, 10, 12, 11, 0];
  const BLOCK = 1;
  let WEIGHT = 1.6;
  let model = null, grid = null, cacheSig = '', planCache = new Map();
  const street = () => root.SCENE_DATA || (!SP.world?.interior ? SP.world?.data : SP.place?.street?.data) || null;
  const north = () => root.RONGQIAO_NORTH || {};
  const rectArea = (r) => Math.abs((r[2] - r[0]) * (r[3] - r[1]));
  const inRect = (x, y, r, m = 0) => x >= r[0] - m && x <= r[2] + m && y >= r[1] - m && y <= r[3] + m;

  function pieceOf(o) { try { return (SP.piece ? SP.piece(o) : null) || SP.K?.pieces?.[o.type] || null; } catch (e) { return SP.K?.pieces?.[o.type] || null; } }
  function footPoly(rect, rot, ox, oy) {
    const a = (rot || 0) * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
    return [[rect[0], rect[1]], [rect[2], rect[1]], [rect[2], rect[3]], [rect[0], rect[3]]].map(([x, y]) => [ox + x * c - y * s, oy + x * s + y * c]);
  }
  function polyBox(p) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of p) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; }
  /** distance from a point to a convex polygon (negative inside) */
  function polyDist(px, py, poly) {
    let inside = true, sign = 0, best = 1e9;
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length], ex = x2 - x1, ey = y2 - y1, L = ex * ex + ey * ey;
      const t = L ? Math.max(0, Math.min(1, ((px - x1) * ex + (py - y1) * ey) / L)) : 0, qx = x1 + ex * t - px, qy = y1 + ey * t - py, d = Math.hypot(qx, qy);
      if (d < best) best = d;
      const cr = ex * (py - y1) - ey * (px - x1);
      if (cr !== 0) { const s = cr > 0 ? 1 : -1; if (!sign) sign = s; else if (s !== sign) inside = false; }
    }
    return inside && sign ? -best : best;
  }
  function rectDist(px, py, r) { const dx = Math.max(r[0] - px, 0, px - r[2]), dy = Math.max(r[1] - py, 0, py - r[3]); return dx || dy ? Math.hypot(dx, dy) : -1; }

  /* ---------------------------------------------------------------- sources */
  function sources(D) {
    const list = [{ id: 'base', objects: D.objects || [], colliders: D.colliders || [] }], missing = [];
    const C = root.SCENE_CHUNKS || {};
    for (const c of D.chunks || []) { const d = C[c.id]; if (d) list.push({ id: c.id, objects: d.objects || [], colliders: d.colliders || [], rect: c.rect, name: c.name }); else missing.push(c.id); }
    return { list, missing };
  }
  function signature(D) {
    const C = root.SCENE_CHUNKS || {};
    return [(D.objects || []).length, (D.colliders || []).length, (D.chunks || []).map((c) => c.id + (C[c.id] ? ':' + (C[c.id].objects || []).length : '-')).join(','), Object.keys(SP.K?.pieces || {}).length].join('|');
  }
  const BUILDING_SKIP = /river|creek|edge|wedge|buffer|brg_|_f[nsew]\d*$|_sch_f|laundry|booth/;
  const GREEN_T = /tree|willow|banyan|bamboo|shrub|hedge|bush|flower|plant|reed|lotus|iris|kapok|cherry|peach|palm|lawn|grass/;
  const FENCE_T = /fence|rail|bollard|chain|wall|gate|parapet|barrier/;
  function classifyCollider(c) {
    const id = String(c.id || '');
    if (/river|creek/.test(id)) return 'water';
    if (BUILDING_SKIP.test(id)) return /buffer/.test(id) ? 'green' : 'fence';
    if (/closed_background|_bg|bgw|bgn|bgr|nbg/.test(id)) return 'block';
    const w = Math.abs(c.rect[2] - c.rect[0]), h = Math.abs(c.rect[3] - c.rect[1]);
    if (Math.min(w, h) < 0.9) return 'fence';
    return rectArea(c.rect) >= 12 ? 'building' : 'prop';
  }

  function buildModel() {
    const D = street(); if (!D || !D.ground || !D.bounds) return null;
    const N = north(), src = sources(D), polys = [];
    const add = (p) => { p.box = p.rect || polyBox(p.poly); polys.push(p); };
    for (const s of src.list) {
      for (const c of s.colliders) if (Array.isArray(c.rect)) add({ id: c.id, rect: c.rect.slice(0, 4), kind: classifyCollider(c), src: s.id });
      for (const o of s.objects) {
        if (!o || o.on_roof || o.carried) continue;
        const P = pieceOf(o); if (!P || P.layer !== 'sorted') continue;
        const live = SP.world?.byId?.[o.id], state = live?.state || o.state || P.states?.[0];
        const rects = (P.footprint_states && state in P.footprint_states ? P.footprint_states[state] : P.footprint) || [];
        const t = String(o.type || '');
        for (const r of rects) {
          const poly = footPoly(r, o.rot, o.x, o.y), axis = !((o.rot || 0) % 2);
          const kind = GREEN_T.test(t) ? 'green' : FENCE_T.test(t) ? 'fence' : rectArea(r) >= 12 ? 'building' : 'prop';
          add(axis ? { id: o.id, rect: polyBox(poly), kind, type: t, src: s.id } : { id: o.id, poly, kind, type: t, src: s.id });
        }
        if (o.block && o.state !== 'open') add({ id: o.id, rect: o.block.slice(0, 4), kind: 'fence', src: s.id });
      }
    }
    const buckets = new Map();
    polys.forEach((p, i) => {
      for (let gx = Math.floor((p.box[0] - CLEAR) / BUCKET); gx <= Math.floor((p.box[2] + CLEAR) / BUCKET); gx++)
        for (let gy = Math.floor((p.box[1] - CLEAR) / BUCKET); gy <= Math.floor((p.box[3] + CLEAR) / BUCKET); gy++) {
          const k = (gx + 512) * 4096 + gy + 512; let l = buckets.get(k); if (!l) buckets.set(k, (l = [])); l.push(i);
        }
    });
    const water = (N.water || []).map((r) => r.slice(0, 4));
    const T = D.traffic || {}, crosswalks = (T.crosswalks || []).map((c) => ({ id: c.id, rect: [c.x0, c.y0, c.x1, c.y1], road: c.road,
      /* walkable band: a little past the kerbs in the crossing direction, strictly inside the stripes along the road */
      open: c.road === 'y' ? [c.x0 - 0.3, c.y0 + 0.15, c.x1 + 0.3, c.y1 - 0.15] : [c.x0 + 0.15, c.y0 - 0.3, c.x1 - 0.15, c.y1 + 0.3] }));
    /* 助手建议，未经Leo确认: the 槐北街 south leg (main road -> 南关路, added in E3) has no zebra near the main road; the legacy walker crossed
       it freely there. Keep one unmarked crossing band next to the intersection (not drawn as a zebra) until a real crosswalk is authored. */
    if (!crosswalks.some((c) => c.road === 'y' && c.rect[1] < -6 && c.rect[3] > -14) && (T.lanes || []).some((l) => l.id === 'nb' && l.range && l.range[0] < -20))
      crosswalks.push({ id: 'implicit_hb_south', rect: [22, -12, 28, -8.6], road: 'y', implicit: true, open: [21.7, -11.85, 28.3, -8.75] });
    const boxes = (T.intersections || (T.intersection ? [T.intersection] : [])).map((b) => ({ id: b.id, rect: [b.x0, b.y0, b.x1, b.y1] }));
    const G = D.ground, rows = G.data_south_to_north || [], gcols = G.cols, grows = G.rows, gch = G.chunk || 2, gcode = new Uint8Array(gcols * grows);
    for (let r = 0; r < grows; r++) { const line = rows[r] || ''; for (let c = 0; c < gcols; c++) gcode[r * gcols + c] = GCLASS[line[c]] || 0; }
    /* carriageway mask on the ground grid: march perpendicular from each lane centre across asphalt, clamped to the lane's
       typical half widths so side-street mouths (pedestrian crossings of minor roads) are not swallowed */
    const carriage = new Uint8Array(gcols * grows), gAt = (x, y) => { const c = Math.floor((x - G.origin[0]) / gch), r = Math.floor((y - G.origin[1]) / gch); return c < 0 || r < 0 || c >= gcols || r >= grows ? -1 : r * gcols + c; };
    const lanes = (T.lanes || []).filter((l) => Array.isArray(l.range) && Number.isFinite(l.c));
    for (const l of lanes) {
      const along = [], ext = [[], []];
      for (let s = Math.min(...l.range); s <= Math.max(...l.range); s += gch) {
        const e = [0, 0];
        for (const [k, d] of [[0, -1], [1, 1]]) { let off = 0; for (let n = 0; n < 12; n++) { const p = l.c + d * (n * gch + gch / 2) - d * gch / 2 + d * 0.01; const i = l.axis === 'x' ? gAt(s, p) : gAt(p, s); if (i < 0 || gcode[i] !== 1) break; off = Math.abs(p - l.c) + gch / 2; } e[k] = off; ext[k].push(off); }
        along.push([s, e]);
      }
      const med = ext.map((a) => { const b = a.filter((v) => v > 0).sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : 0; });
      for (const [s, e] of along) for (let k = 0; k < 2; k++) {
        const d = k ? 1 : -1, lim = Math.min(e[k], med[k] + 0.5);
        for (let off = 0.01; off < lim; off += gch / 2) { const p = l.c + d * off, i = l.axis === 'x' ? gAt(s, p) : gAt(p, s); if (i >= 0 && gcode[i] === 1) carriage[i] = 1; }
      }
    }
    return { D, N, polys, buckets, water, crosswalks, boxes, gcode, carriage, ground: { origin: G.origin.slice(), cols: gcols, rows: grows, cell: gch }, missing: src.missing, lanes, sig: signature(D) };
  }
  function ensure() {
    const D = street(); if (!D) return null;
    const sig = signature(D);
    if (!model || sig !== cacheSig) {
      if (SP.chunks?.prefetchStreet && !ensure.prefetched) { ensure.prefetched = true; try { SP.chunks.prefetchStreet(); } catch (e) { /* data only */ } }
      model = buildModel(); cacheSig = model ? model.sig : ''; grid = null; planCache = new Map(); labelsCache = null; poiCache = null; featureCache = null;
      if (model) {
        const B = D.bounds, gx0 = Math.floor(B.x0 / CELL), gy0 = Math.floor(B.y0 / CELL), W = Math.ceil(B.x1 / CELL) - gx0 + 1, H = Math.ceil(B.y1 / CELL) - gy0 + 1;
        grid = { gx0, gy0, W, H, v: new Uint8Array(W * H), tiles: new Uint8Array(Math.ceil(W / TILE) * Math.ceil(H / TILE)), tw: Math.ceil(W / TILE) };
      }
    }
    return model;
  }

  /* ---------------------------------------------------------------- walk grid */
  function legacyCrossing(x, y) { return x > 22 && x < 28 && y > 0 && y < 164 && (y < 6.3 || y > 9.3) && (y < 93.3 || y > 96.3) || y > -6 && y < 0 && x > -24 && x < 160 && !((x > 10.3 && x < 13.7) || (x > 128.3 && x < 131.7)); }
  /** pedestrians may not walk on a carriageway except on a zebra; never inside an intersection box */
  function roadBlocked(x, y) {
    const M = ensure(); if (!M) return false;
    for (const b of M.boxes) if (inRect(x, y, b.rect, 0.2)) return true;
    const G = M.ground, c = Math.floor((x - G.origin[0]) / G.cell), r = Math.floor((y - G.origin[1]) / G.cell);
    const onCarriage = c >= 0 && r >= 0 && c < G.cols && r < G.rows && M.carriage[r * G.cols + c];
    const legacy = legacyCrossing(x, y);
    if (!onCarriage && !legacy) return false;
    for (const w of M.crosswalks) if (inRect(x, y, w.open)) return false;
    return true;
  }
  function groundClass(x, y) { const M = ensure(); if (!M) return 0; const G = M.ground, c = Math.floor((x - G.origin[0]) / G.cell), r = Math.floor((y - G.origin[1]) / G.cell); return c < 0 || r < 0 || c >= G.cols || r >= G.rows ? 0 : M.gcode[r * G.cols + c]; }
  function inWater(x, y, m = 0) { const M = ensure(); return !!M && (M.water.some((r) => inRect(x, y, r, m)) || groundClass(x, y) === 5 && !onBridge(x, y)); }
  function onBridge(x, y) { return bridges().some((b) => inRect(x, y, b.rect)); }
  /** static obstacle test against every registered chunk (loaded or not) */
  function staticHit(x, y, r = CLEAR) {
    const M = ensure(); if (!M) return 'nodata';
    const B = M.D.bounds; if (x - r < B.x0 || x + r > B.x1 || y - r < B.y0 || y + r > B.y1) return 'bounds';
    const l = M.buckets.get((Math.floor(x / BUCKET) + 512) * 4096 + Math.floor(y / BUCKET) + 512); if (!l) return null;
    for (const i of l) { const p = M.polys[i], b = p.box; if (x + r <= b[0] || x - r >= b[2] || y + r <= b[1] || y - r >= b[3]) continue; if ((p.rect ? rectDist(x, y, p.rect) : polyDist(x, y, p.poly)) < r) return p.id || p.kind; }
    return null;
  }
  function computeTile(tx, ty) {
    const M = model, g = grid, x0 = tx * TILE, y0 = ty * TILE, x1 = Math.min(g.W, x0 + TILE), y1 = Math.min(g.H, y0 + TILE), B = M.D.bounds;
    for (let j = y0; j < y1; j++) for (let i = x0; i < x1; i++) {
      const x = (g.gx0 + i) * CELL, y = (g.gy0 + j) * CELL;
      let v;
      if (x - CLEAR < B.x0 || x + CLEAR > B.x1 || y - CLEAR < B.y0 || y + CLEAR > B.y1) v = BLOCK;
      else if (M.water.some((r) => inRect(x, y, r, CLEAR))) v = BLOCK;
      else { const gc = groundClass(x, y); v = gc === 5 && !onBridge(x, y) ? BLOCK : roadBlocked(x, y) ? BLOCK : COST[gc] || 12; }
      g.v[j * g.W + i] = v;
    }
    /* rasterise obstacles into the tile (cells whose circle of radius CLEAR touches a footprint) */
    const wx0 = (g.gx0 + x0) * CELL - CLEAR, wy0 = (g.gy0 + y0) * CELL - CLEAR, wx1 = (g.gx0 + x1) * CELL + CLEAR, wy1 = (g.gy0 + y1) * CELL + CLEAR, seen = new Set();
    for (let bx = Math.floor(wx0 / BUCKET); bx <= Math.floor(wx1 / BUCKET); bx++) for (let by = Math.floor(wy0 / BUCKET); by <= Math.floor(wy1 / BUCKET); by++) {
      const l = M.buckets.get((bx + 512) * 4096 + by + 512); if (!l) continue;
      for (const k of l) {
        if (seen.has(k)) continue; seen.add(k);
        const p = M.polys[k], b = p.box;
        const i0 = Math.max(x0, Math.ceil((b[0] - CLEAR) / CELL) - g.gx0), i1 = Math.min(x1 - 1, Math.floor((b[2] + CLEAR) / CELL) - g.gx0);
        const j0 = Math.max(y0, Math.ceil((b[1] - CLEAR) / CELL) - g.gy0), j1 = Math.min(y1 - 1, Math.floor((b[3] + CLEAR) / CELL) - g.gy0);
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const idx = j * g.W + i; if (g.v[idx] === BLOCK) continue;
          const x = (g.gx0 + i) * CELL, y = (g.gy0 + j) * CELL;
          if ((p.rect ? rectDist(x, y, p.rect) : polyDist(x, y, p.poly)) < CLEAR) g.v[idx] = BLOCK;
        }
      }
    }
    g.tiles[ty * g.tw + tx] = 1;
  }
  function cellValue(i, j) {
    const g = grid; if (i < 0 || j < 0 || i >= g.W || j >= g.H) return BLOCK;
    const t = Math.floor(j / TILE) * g.tw + Math.floor(i / TILE); if (!g.tiles[t]) computeTile(Math.floor(i / TILE), Math.floor(j / TILE));
    return g.v[j * g.W + i];
  }
  const toCell = (x, y) => [Math.round(x / CELL) - grid.gx0, Math.round(y / CELL) - grid.gy0];
  const toWorld = (i, j) => [(grid.gx0 + i) * CELL, (grid.gy0 + j) * CELL];
  function walkable(x, y) { if (!ensure() || !grid) return false; const [i, j] = toCell(x, y); return cellValue(i, j) > BLOCK; }
  /** nearest walkable cell centre within maxR metres (ring search) */
  function snap(x, y, maxR = 8) {
    if (!ensure() || !grid) return null;
    const [ci, cj] = toCell(x, y), R = Math.ceil(maxR / CELL);
    let best = null, bd = Infinity;
    for (let r = 0; r <= R; r++) {
      for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
        if (cellValue(ci + di, cj + dj) <= BLOCK) continue;
        const [wx, wy] = toWorld(ci + di, cj + dj), d = Math.hypot(wx - x, wy - y); if (d < bd) { bd = d; best = [wx, wy]; }
      }
      if (best && r * CELL > bd + CELL) break;
    }
    return best;
  }

  /* ---------------------------------------------------------------- A* */
  let heapI = new Int32Array(1 << 16), heapF = new Float64Array(1 << 16), gScore = null, parent = null, stamp = null, closedStamp = null, gen = 0;
  function search(si, sj, ti, tj, maxNodes, opts_w) {
    const g = grid, n = g.W * g.H;
    if (!gScore || gScore.length !== n) { gScore = new Float64Array(n); parent = new Int32Array(n); stamp = new Uint32Array(n); closedStamp = new Uint32Array(n); gen = 0; }
    gen++; let size = 0;
    const push = (idx, f) => { if (size >= heapI.length) { const a = new Int32Array(heapI.length * 2), b = new Float64Array(heapF.length * 2); a.set(heapI); b.set(heapF); heapI = a; heapF = b; } let i = size++; while (i) { const p = (i - 1) >> 1; if (heapF[p] <= f) break; heapI[i] = heapI[p]; heapF[i] = heapF[p]; i = p; } heapI[i] = idx; heapF[i] = f; };
    const pop = () => { const top = heapI[0], li = heapI[--size], lf = heapF[size]; let i = 0; while (true) { let c = 2 * i + 1; if (c >= size) break; if (c + 1 < size && heapF[c + 1] < heapF[c]) c++; if (heapF[c] >= lf) break; heapI[i] = heapI[c]; heapF[i] = heapF[c]; i = c; } heapI[i] = li; heapF[i] = lf; return top; };
    const H = (i, j) => { const dx = Math.abs(i - ti), dy = Math.abs(j - tj); return (Math.max(dx, dy) + 0.4142 * Math.min(dx, dy)); };
    const W8 = opts_w || 1.2, start = sj * g.W + si, goal = tj * g.W + ti;
    stamp[start] = gen; gScore[start] = 0; parent[start] = -1; push(start, H(si, sj) * W8);
    const DIRS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.4142], [-1, 1, 1.4142], [1, -1, 1.4142], [-1, -1, 1.4142]];
    let count = 0;
    while (size) {
      const cur = pop(); if (closedStamp[cur] === gen) continue; closedStamp[cur] = gen;
      if (cur === goal) { const out = []; for (let k = cur; k >= 0; k = parent[k]) out.push(k); return { cells: out.reverse(), expanded: count }; }
      if (++count > maxNodes) return { cells: null, expanded: count, reason: 'limit' };
      const ci = cur % g.W, cj = (cur - ci) / g.W, cv = g.v[cur];
      for (const [dx, dy, len] of DIRS) {
        const ni = ci + dx, nj = cj + dy, nv = cellValue(ni, nj); if (nv <= BLOCK) continue;
        if (dx && dy && (cellValue(ci + dx, cj) <= BLOCK || cellValue(ci, cj + dy) <= BLOCK)) continue;   // no corner cutting
        const idx = nj * g.W + ni; if (closedStamp[idx] === gen) continue;
        const ng = gScore[cur] + len * (cv + nv) / 20;
        if (stamp[idx] === gen && ng >= gScore[idx]) continue;
        stamp[idx] = gen; gScore[idx] = ng; parent[idx] = cur; push(idx, ng + H(ni, nj) * W8);
      }
    }
    return { cells: null, expanded: count, reason: 'unreachable' };
  }
  /** line of sight that never enters a dearer ground class than its end points, and never clips a live carriageway.
   *  Cell centres can sit on the kerb while the chord still crosses asphalt (主路斑马线西缘); the phone audit samples the polyline. */
  function los(a, b) {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(d / 0.2));
    const [ai, aj] = toCell(...a), [bi, bj] = toCell(...b), cap = Math.max(cellValue(ai, aj), cellValue(bi, bj));
    for (let k = 1; k < n; k++) {
      const x = a[0] + (b[0] - a[0]) * k / n, y = a[1] + (b[1] - a[1]) * k / n, [i, j] = toCell(x, y), v = cellValue(i, j);
      if (v <= BLOCK || v > cap || staticHit(x, y, 0.26) || roadBlocked(x, y)) return false;
    }
    return true;
  }
  function smooth(cells) {
    const g = grid, pts = [];
    let pd = null;
    for (let k = 0; k < cells.length; k++) {
      const i = cells[k] % g.W, j = (cells[k] - i) / g.W;
      if (k && k < cells.length - 1) { const ni = cells[k + 1] % g.W, nj = (cells[k + 1] - ni) / g.W, d = (ni - i) + ',' + (nj - j); if (d === pd) continue; pd = d; }
      else if (k === 0 && cells.length > 1) { const ni = cells[1] % g.W, nj = (cells[1] - ni) / g.W; pd = (ni - i) + ',' + (nj - j); }
      pts.push(toWorld(i, j));
    }
    const out = [pts[0]]; let a = 0;
    while (a < pts.length - 1) { let b = Math.min(pts.length - 1, a + 48); while (b > a + 1 && !los(pts[a], pts[b])) b--; out.push(pts[b]); a = b; }
    return out;
  }
  const pathLength = (pts) => { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; };
  /** plan(from, to): walking route [[x,y]...] from the real position to a walkable point near `to`; never through
   * buildings, props, water or a carriageway outside a zebra. Bounded; cached per (start cell, goal cell). */
  function plan(from, to, opts = {}) {
    const M = ensure(); if (!M || !grid) return { ok: false, reason: '地图数据尚未载入' };
    if (![from?.[0], from?.[1], to?.[0], to?.[1]].every(Number.isFinite)) return { ok: false, reason: '起点或终点无效' };
    const s = snap(from[0], from[1], opts.startSnap ?? 4), t = snap(to[0], to[1], opts.goalSnap ?? 12);
    if (!s) return { ok: false, reason: '当前位置附近没有可步行的路面' };
    if (!t) return { ok: false, reason: '目的地附近没有可步行的入口位置' };
    const [si, sj] = toCell(...s), [ti, tj] = toCell(...t), key = si + ',' + sj + '>' + ti + ',' + tj;
    let hit = planCache.get(key);
    if (!hit) {
      const r = search(si, sj, ti, tj, opts.maxNodes || 900000, opts.weight || WEIGHT);
      hit = r.cells ? { ok: true, points: smooth(r.cells), expanded: r.expanded } : { ok: false, reason: r.reason === 'limit' ? '路线过长，暂时无法规划' : '没有找到不穿越建筑和水面的步行路线', expanded: r.expanded };
      planCache.set(key, hit); if (planCache.size > 24) planCache.delete(planCache.keys().next().value);
    }
    if (!hit.ok) return { ok: false, reason: hit.reason, expanded: hit.expanded };
    const points = hit.points.map((p) => p.slice()); points[0] = [from[0], from[1]];
    if (Math.hypot(points[0][0] - s[0], points[0][1] - s[1]) > 0.05) points.splice(1, 0, s.slice());
    const route = { ok: true, points, goal: t, length: pathLength(points), expanded: hit.expanded, missing: M.missing.slice() };
    route.steps = steps(route.points, opts.destinationName);
    return route;
  }

  /* ---------------------------------------------------------------- names, labels, steps */
  let labelsCache = null, poiCache = null, featureCache = null;
  function bboxOf(rects) { if (!rects.length) return null; return [Math.min(...rects.map((r) => r[0])), Math.min(...rects.map((r) => r[1])), Math.max(...rects.map((r) => r[2])), Math.max(...rects.map((r) => r[3]))]; }
  function bridges() {
    const N = north(), out = [], E2 = N.expansionE2?.names || {}, E4 = N.expansionE4 || {};
    if (N.expansionE2) { out.push({ name: E2.roadBridge || '槐北桥', rect: [16, 186, 32, 244] }); out.push({ name: E2.oldBridge || '榕桥古桥', rect: [60, 186, 68, 244] }); }
    if (E4.river?.bridge) { const b = E4.river.bridge; out.push({ name: (E4.road?.name || '榕校路') + '桥', rect: [b[0], b[1] - 6, b[2], b[3] + 6] }); }
    for (const c of E4.creek?.crossings || []) if (c.kind === 'footbridge') out.push({ name: (E4.creek.name || '榕溪') + '小桥', rect: c.rect.slice() });
    const P9 = N.expansionP9; if (P9?.bridge) out.push({ name: P9.names.bridge, rect: P9.bridge.slice() }); if (P9?.footbridge) out.push({ name: P9.names.foot, rect: P9.footbridge.slice() });
    const P10 = N.expansionP10; if (P10?.bridge) out.push({ name: P10.names.bridge, rect: P10.bridge.slice() });
    const P11 = N.expansionP11; if (P11?.bridge) out.push({ name: P11.names.bridge, rect: P11.bridge.slice() });
    return out;
  }
  /** named areas for labels and step hints; data first, a few authored outlines (from the expansion docs) where the data only has a name */
  function regions() {
    if (labelsCache) return labelsCache;
    const M = ensure(), N = north(), D = street() || {}, out = [], E1 = N.expansion?.names || {}, E2 = N.expansionE2?.names || {}, E3 = N.expansionE3?.names || {}, E4 = N.expansionE4 || {};
    const add = (name, rect, kind, prio = 1, extra) => { if (name && rect) out.push(Object.assign({ name, rect, kind, prio }, extra || {})); };
    const B = D.bounds || { x0: -106, y0: -80, x1: 300, y1: 272 };
    const lanes = M ? M.lanes : [];
    const laneRect = (ids, pad) => { const ls = lanes.filter((l) => ids.includes(l.id)); if (!ls.length) return null; const cs = ls.map((l) => l.c), lo = Math.min(...ls.map((l) => Math.min(...l.range))), hi = Math.max(...ls.map((l) => Math.max(...l.range))); return ls[0].axis === 'x' ? [Math.max(lo, B.x0), Math.min(...cs) - pad[0], Math.min(hi, B.x1), Math.max(...cs) + pad[1]] : [Math.min(...cs) - pad[0], Math.max(lo, B.y0), Math.max(...cs) + pad[1], Math.min(hi, B.y1)]; };
    add('主路', laneRect(['eb', 'wb'], [4.5, 4.5]) && [Math.max(B.x0, -128), -9, 160, 3], 'road', 2, { axis: 'x' });
    if (N.street) add(N.street.name, [N.street.west[0], B.y0, N.street.east[1], B.y1], 'road', 2, { axis: 'y' });
    if (N.lane) add(N.lane.name, [N.lane.x[0], N.lane.south[0], N.lane.x[1], N.lane.north[1]], 'road', 2, { axis: 'x' });
    if (N.backLane) add(N.backLane.name, [N.backLane.x[0], N.backLane.y[0], N.backLane.x[1], N.backLane.y[1]], 'road', 1, { axis: 'x' });
    if (E3.avenue) add(E3.avenue, laneRect(['eb_ng', 'wb_ng'], [7.5, 7.5]), 'road', 2, { axis: 'x' });
    if (E4.road) { add(E4.road.name, E4.road.ew, 'road', 2, { axis: 'x' }); add(E4.road.name, [E4.road.ns[0] - 2, E4.road.ns[1], E4.road.ns[2] + 2, E4.road.ns[3]], 'road', 2, { axis: 'y' }); add(E4.road.name, [E4.road.nss[0] - 2, E4.road.nss[1], E4.road.nss[2] + 2, E4.road.nss[3]], 'road', 2, { axis: 'y' }); if (E4.road.lane) add('校前巷', [E4.road.lane[0], E4.road.lane[1] - 1, E4.road.lane[2], E4.road.lane[3] + 1], 'road', 2, { axis: 'x' }); }
    if (E3.oldStreet) add(E3.oldStreet, [-76, -64, -58, 142], 'road', 2, { axis: 'y' });
    if (N.expansionE2) { add(E2.promenade || '滨河南街', [-64, 154, 226, 164], 'road', 1, { axis: 'x' }); add(E2.northRoad || '滨河北路', [-64, 262, 226, 272], 'road', 1, { axis: 'x' }); }
    if (E1.south) add(E1.south, [56, -36, 176, -14], 'district', 0);
    if (E1.backLane) add(E1.backLane, [56, -40, 176, -34], 'road', 1, { axis: 'x' });
    /* water + parks */
    const river = (N.water || []).filter((r) => r[1] >= 190 && r[3] <= 240);
    if (river.length) add(E2.river || '月河', bboxOf(river), 'water', 3, { axis: 'x', parts: river });
    if (E4.creek) add(E4.creek.name, bboxOf(E4.creek.water), 'water', 3, { axis: 'y', parts: E4.creek.water });
    if (N.expansionP9) { const P = N.expansionP9; const road = N.expansionB2?.lane || P.road; add(P.names.creek, bboxOf(P.creek), 'water', 3, { axis: 'y', parts: P.creek }); add(P.names.road, road, 'road', 2, { axis: 'y' }); add(P.names.park, P.park, 'park', 1); add(P.names.canals, bboxOf(P.canals), 'water', 2, { axis: 'y', parts: P.canals }); }
    if (N.expansionB2) { const B = N.expansionB2; add(B.names.cross, B.cross, 'road', 1, { axis: 'x' }); add(B.names.village, B.village, 'district', 0); }
    if (N.expansionB3) { const B = N.expansionB3; add(B.names.lane, B.lane, 'road', 1, { axis: 'y' }); }
    if (N.expansionP10) { const P = N.expansionP10; add(P.names.district, P.district, 'district', 0); add(P.names.avenue, P.avenue, 'road', 2, { axis: 'x' }); add(P.names.secondary, P.secondary, 'road', 1, { axis: 'y' }); if (P.cross) add(P.names.cross, P.cross, 'road', 1, { axis: 'y' }); if (P.cross2) add(P.names.cross2, P.cross2, 'road', 1, { axis: 'y' }); if (P.cross3) add(P.names.cross3, P.cross3, 'road', 1, { axis: 'y' }); if (P.cross4) add(P.names.cross4, P.cross4, 'road', 1, { axis: 'y' }); if (P.cross5) add(P.names.cross5, P.cross5, 'road', 1, { axis: 'y' }); if (P.cross6) add(P.names.cross6, P.cross6, 'road', 1, { axis: 'y' }); if (P.cross7) add(P.names.cross7, P.cross7, 'road', 1, { axis: 'y' }); if (P.hillRoad) add(P.names.hill, P.hillRoad, 'road', 1, { axis: 'x' }); if (P.hillRoad2) add(P.names.hill2, P.hillRoad2, 'road', 1, { axis: 'x' }); if (P.hillPath) add(P.names.hillPath, P.hillPath, 'road', 1, { axis: 'x' }); if (P.estuary) add(P.names.estuary, P.estuary, 'road', 1, { axis: 'x' }); if (P.southCross) add(P.names.southCross, P.southCross, 'road', 1, { axis: 'x' }); if (P.levee) add(P.names.levee, P.levee, 'park', 1); add(P.names.south, P.south, 'road', 1, { axis: 'x' }); add(P.names.promenade, P.promenade, 'road', 1, { axis: 'y' }); if (P.terminus) add(P.names.terminus, P.terminus, 'park', 1); }
    if (N.expansionP11) { const P = N.expansionP11; add(P.names.district, P.district, 'district', 0); add(P.names.road, P.road, 'road', 1, { axis: 'x' }); if (P.road2) add(P.names.road2, P.road2, 'road', 1, { axis: 'x' }); if (P.road3) add(P.names.road3, P.road3, 'road', 1, { axis: 'x' }); if (P.road4) add(P.names.road4, P.road4, 'road', 1, { axis: 'x' }); if (P.road5) add(P.names.road5, P.road5, 'road', 1, { axis: 'x' }); if (P.road6) add(P.names.road6, P.road6, 'road', 1, { axis: 'x' }); if (P.road7) add(P.names.road7, P.road7, 'road', 1, { axis: 'x' }); if (P.road8) add(P.names.road8, P.road8, 'road', 1, { axis: 'x' }); if (P.road9) add(P.names.road9, P.road9, 'road', 1, { axis: 'x' }); if (P.road10) add(P.names.road10, P.road10, 'road', 1, { axis: 'x' }); if (P.road11) add(P.names.road11, P.road11, 'road', 1, { axis: 'x' }); if (P.road12) add(P.names.road12, P.road12, 'road', 1, { axis: 'x' }); if (P.road13) add(P.names.road13, P.road13, 'road', 1, { axis: 'x' }); if (P.road14) add(P.names.road14, P.road14, 'road', 1, { axis: 'x' }); if (P.road15) add(P.names.road15, P.road15, 'road', 1, { axis: 'x' }); if (P.road16) add(P.names.road16, P.road16, 'road', 1, { axis: 'x' }); if (P.road17) add(P.names.road17, P.road17, 'road', 1, { axis: 'x' }); if (P.road18) add(P.names.road18, P.road18, 'road', 1, { axis: 'x' }); add(P.names.canal, P.canal, 'water', 2); }
    if (N.expansionE2) { add(E2.southPark || '榕桥滨河公园', [-64, 164, 224, 192], 'park', 1); add(E2.northPark || '月河湾公园', [-64, 238, 224, 262], 'park', 1); }
    for (const [k, p] of (E4.river?.parks || []).entries()) add(k ? '榕溪滨河公园 · 北园' : '榕溪滨河公园 · 南园', p, 'park', 1);
    for (const b of bridges()) add(b.name, b.rect, 'bridge', 4);
    for (const c of M ? M.crosswalks : []) add(c.implicit ? '路口过街点' : '斑马线', c.rect, 'crosswalk', 5, c.implicit ? { implicit: true } : null);
    /* districts from building groups (ids published by the expansions) */
    const cols = D.colliders || [], grp = (re) => bboxOf(cols.filter((c) => re.test(c.id)).map((c) => c.rect));
    add(E1.compound, grp(/^rqe_c[12]_/), 'district', 0); add(E1.urbanVillage, grp(/^rqe_hw\d/), 'district', 0); add(E1.garden, grp(/^rqe_hy_/), 'district', 0);
    add(E1.east, grp(/^rqe_hd\d/), 'district', 0); add(E3.village, grp(/^rqe_e3_cv_/), 'district', 0);
    for (const c of E3.transition?.compounds || []) add(c.name, grp(/^rqe_e3_xqe\d/) || [c.x0, -56, c.x1, -20], 'district', 0);
    for (const s of E4.schools || []) add(s.name, s.rect, 'campus', 1);
    for (const mk of [root.RongqiaoMarket, root.RongqiaoMarket2?.info, root.RongqiaoMarket3?.info]) if (mk) add(mk.NAME || mk.name, (mk.RECT || mk.rect).slice(0, 4), 'market', 1);
    for (const extra of [].concat(D.mapLabels || [], N.mapLabels || [])) if (extra?.name && Array.isArray(extra.rect)) add(extra.name, extra.rect, extra.kind || 'district', extra.prio ?? 0, extra);
    labelsCache = out; return out;
  }
  function placeAt(x, y) { let best = null; for (const r of regions()) if (r.kind !== 'district' && r.kind !== 'campus' && inRect(x, y, r.rect) && (!best || r.prio > best.prio)) best = r; return best; }
  const DIR8 = ['东', '东北', '北', '西北', '西', '西南', '南', '东南'];
  const heading = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
  const dirName = (h) => DIR8[(Math.round(h / (Math.PI / 4)) + 8) % 8];
  /** turn-by-turn steps: legs merged by heading (<32°) and by named place (bridges / zebras always get their own step) */
  function steps(points, destinationName) {
    if (!points || points.length < 2) return [{ kind: 'arrive', text: '已在目的地附近', distance: 0, at: points?.[0] || null }];
    const segs = [];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i], len = Math.hypot(b[0] - a[0], b[1] - a[1]); if (len < 0.05) continue;
      const n = Math.max(1, Math.ceil(len / 4));
      for (let k = 0; k < n; k++) { const p = [a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n], q = [a[0] + (b[0] - a[0]) * (k + 1) / n, a[1] + (b[1] - a[1]) * (k + 1) / n], m = placeAt((p[0] + q[0]) / 2, (p[1] + q[1]) / 2); segs.push({ a: p, b: q, len: len / n, h: heading(a, b), place: m }); }
    }
    const legs = [];
    for (const s of segs) {
      const L = legs[legs.length - 1], special = (r) => r && (r.kind === 'bridge' || r.kind === 'crosswalk');
      let dh = L ? Math.abs(((s.h - L.h1 + Math.PI * 3) % (Math.PI * 2)) - Math.PI) : 0;
      const samePlace = L && (L.place?.name || '') === (s.place?.name || ''), bothPlain = L && !special(L.place) && !special(s.place);
      if (L && dh < 0.56 && (samePlace || bothPlain && L.len < 6)) { L.len += s.len; L.b = s.b; L.h1 = s.h; L.place = L.place || s.place; if (!samePlace && s.place && (!L.place || s.len > 0)) L.places.add(s.place.name); }
      else legs.push({ a: s.a, b: s.b, len: s.len, h0: s.h, h1: s.h, place: s.place, places: new Set(s.place ? [s.place.name] : []) });
    }
    /* fold short plain jogs (<6 m: grid stair-steps, kerb dodges) into a plain neighbour and re-derive the heading from the merged
       chord, then join consecutive plain legs that now point the same way, so hints read like 向东沿槐北街步行 120 米 */
    const isSpecial = (L) => !!(L && L.place && /bridge|crosswalk/.test(L.place.kind));
    const join = (A, B) => { A.len += B.len; A.b = B.b; A.h0 = A.h1 = heading(A.a, A.b); if (!A.place || A.place.kind === 'water') A.place = B.place; for (const n of B.places) A.places.add(n); };
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < legs.length && legs.length > 1; i++) {
        const L = legs[i]; if (isSpecial(L) || L.len >= 6) continue;
        const P = legs[i - 1], Q = legs[i + 1];
        if (P && !isSpecial(P) && (!Q || isSpecial(Q) || P.len >= Q.len || pass)) { join(P, L); legs.splice(i, 1); i--; }
        else if (Q && !isSpecial(Q)) { const M = { a: L.a, b: L.a, len: 0, h0: 0, h1: 0, place: L.place, places: L.places }; join(M, L); join(M, Q); M.place = Q.place || L.place; legs.splice(i, 2, M); }
      }
      for (let i = legs.length - 1; i >= 1; i--) { const A = legs[i - 1], B = legs[i]; if (isSpecial(A) || isSpecial(B)) continue; const dh = Math.abs(((B.h0 - A.h1 + Math.PI * 3) % (Math.PI * 2)) - Math.PI); if (dh < 0.45 && ((A.place?.name || '') === (B.place?.name || '') || !B.place || !A.place)) { join(A, B); legs.splice(i, 1); } }
    }
    const out = [];
    legs.forEach((L, i) => {
      const where = L.place ? L.place : null, dist = Math.max(1, Math.round(L.len));
      let turn = '';
      if (i) { const d = ((L.h0 - legs[i - 1].h1 + Math.PI * 3) % (Math.PI * 2)) - Math.PI, a = Math.abs(d); turn = a < 0.35 ? '继续' : a > 2.6 ? '掉头' : d > 0 ? (a < 0.9 ? '稍向左' : '左转') : (a < 0.9 ? '稍向右' : '右转'); }
      let text;
      if (where?.kind === 'crosswalk') { const road = regions().filter((r) => r.kind === 'road' && inRect((L.a[0] + L.b[0]) / 2, (L.a[1] + L.b[1]) / 2, r.rect, 1)).sort((a, b) => b.prio - a.prio)[0]; text = (turn && turn !== '继续' ? turn + '，' : '') + (where.implicit ? '在路口过' + (road ? road.name : '马路') + '（无斑马线，注意来车，' + dist + ' 米）' : '走斑马线过' + (road ? road.name : '马路') + '（' + dist + ' 米）'); }
      else if (where?.kind === 'bridge') { const water = regions().find((r) => r.kind === 'water' && (r.parts || [r.rect]).some((p) => inRect((L.a[0] + L.b[0]) / 2, (L.a[1] + L.b[1]) / 2, p, 4))); text = (turn && turn !== '继续' ? turn + '，' : '') + '经' + where.name + (water ? '过' + water.name : '') + '，向' + dirName(L.h0) + ' ' + dist + ' 米'; }
      else text = (i ? turn + '，' : '从当前位置') + '向' + dirName(L.h0) + (where ? (where.kind === 'park' ? '穿过' : where.kind === 'water' ? '沿' + where.name + '岸边' : '沿') + (where.kind === 'water' ? '' : where.name) : '') + '步行 ' + dist + ' 米';
      out.push({ kind: where?.kind === 'crosswalk' ? 'crosswalk' : where?.kind === 'bridge' ? 'bridge' : i ? 'turn' : 'depart', turn, dir: dirName(L.h0), place: where?.name || '', distance: dist, at: L.a.slice(), to: L.b.slice(), text });
    });
    out.push({ kind: 'arrive', turn: '', dir: '', place: '', distance: 0, at: points[points.length - 1].slice(), text: '到达' + (destinationName || '目的地') + '附近；入口、营业与通行权限照常生效' });
    return out;
  }

  /* ---------------------------------------------------------------- features for rendering */
  function features() {
    const M = ensure(); if (!M) return null;
    if (featureCache) return featureCache;
    const N = M.N, buildings = [], props = [], fences = [], green = [], blocks = [], named = new Map();
    for (const b of (N.buildings || []).concat(N.modernBuildings || [])) named.set(b.id, b);
    for (const p of M.polys) {
      const k = p.kind;
      if (k === 'building') buildings.push({ id: p.id, rect: p.rect, poly: p.poly, floors: named.get(p.id)?.F || null, name: named.get(p.id)?.name || null });
      else if (k === 'block') blocks.push(p); else if (k === 'fence') fences.push(p); else if (k === 'green') green.push(p); else if (k === 'prop') props.push(p);
    }
    /* facade-only buildings without their own collider (school buildings, podium towers) */
    const have = new Set(buildings.map((b) => b.id));
    for (const b of N.modernBuildings || []) if (!have.has(b.id)) buildings.push({ id: b.id, rect: [b.x0, b.y0, b.x0 + b.W, b.y0 + b.D], floors: b.F, name: b.name, facade: true });
    for (const mk of [root.RongqiaoMarket3?.data]) if (mk?.towers) for (const t of mk.towers) buildings.push({ id: 'rqm3_' + t.id, rect: t.rect, floors: t.floors, facade: true });
    const markets = [root.RongqiaoMarket, root.RongqiaoMarket2?.info, root.RongqiaoMarket3?.info].filter(Boolean).map((m) => ({ id: m.ID || m.id, name: m.NAME || m.name, rect: (m.RECT || m.rect).slice(0, 4) }));
    featureCache = { ground: M.ground, gcode: M.gcode, carriage: M.carriage, buildings, props, fences, green, blocks, markets, water: M.water, bridges: bridges(), crosswalks: M.crosswalks, lanes: M.lanes, bounds: Object.assign({}, M.D.bounds), regions: regions(), transit: transit() };
    return featureCache;
  }
  function transit() {
    const D = street() || {}, stops = [], lines = [];
    const objStops = (D.objects || []).filter((o) => o.interact === 'community_bus_stop' && Array.isArray(o.reach));
    const ext = root.EAST_SERVICES_EXTENSION?.busStops || [], ng = D.rongqiaoBusNg?.stops || [];
    const byLane = {};
    for (const s of ext.concat(ng)) { const o = objStops.find((o) => o.id === s.id); stops.push({ id: s.id, name: s.name || o?.name || (s.id.includes('east') ? '槐东便民街' : '井槐里'), x: s.reach[0], y: s.reach[1], lane: s.lane, at: s.frontStop }); (byLane[s.lane] = byLane[s.lane] || []).push(s.frontStop); }
    const T = D.traffic || {};
    for (const [id, ats] of Object.entries(byLane)) { const l = (T.lanes || []).find((l) => l.id === id); if (!l || ats.length < 2) continue; const a = Math.min(...ats), b = Math.max(...ats); lines.push({ id, name: /ng/.test(id) ? (D.rongqiaoBusNg?.line || '南关路线') : '井槐里 ⇄ 槐东便民街', dir: l.dir, axis: l.axis, c: l.c, from: a, to: b, color: /ng/.test(id) ? '#d9480f' : '#1c7ed6' }); }
    const metro = (D.objects || []).filter((o) => o.interact === 'metro').map((o) => ({ id: o.id, name: o.name, x: (o.reach || [o.x, o.y])[0], y: (o.reach || [o.x, o.y])[1], line: '3号线' }));
    return { stops, lines, metro };
  }

  /* ---------------------------------------------------------------- POI catalogue (stable ids, cold-load safe) */
  /** extra destinations derived from expansion data; each is [id, name, x, y, desc, {cat, rect}] like phone POIS */
  function pois() {
    if (poiCache) return poiCache;
    const N = north(), D = street() || {}, out = [], E1 = N.expansion?.names || {}, E2 = N.expansionE2?.names || {}, E4 = N.expansionE4 || {};
    const add = (id, name, x, y, desc, cat, extra) => { if (name && Number.isFinite(x) && Number.isFinite(y) && !out.some((p) => p[0] === id)) out.push([id, name, +x.toFixed(2), +y.toFixed(2), desc, Object.assign({ cat }, extra || {})]); };
    const front = (r, side = 's', off = 1.6) => side === 's' ? [(r[0] + r[2]) / 2, r[1] - off] : side === 'n' ? [(r[0] + r[2]) / 2, r[3] + off] : side === 'w' ? [r[0] - off, (r[1] + r[3]) / 2] : [r[2] + off, (r[1] + r[3]) / 2];
    for (const [mk, short] of [[root.RongqiaoMarket, 'rq_market'], [root.RongqiaoMarket2?.info, 'rq_market2'], [root.RongqiaoMarket3?.info, 'rq_market3']]) {
      if (!mk) continue; const g = (mk.GATES || mk.gates || {}).S || Object.values(mk.GATES || mk.gates || {})[0]; if (!g) continue;
      add('market_' + short, mk.NAME || mk.name, g.out[0], g.out[1], '无缝开放室内菜市场 · 约 05:30–20:30 · 从南门进入；四门可进出', 'life', { rect: (mk.RECT || mk.rect).slice(0, 4) });
    }
    const m3 = root.RongqiaoMarket3?.data; if (m3?.door) add('home_rqm3', '万家花园 · 住户门厅', m3.door[0], m3.door[1] - 1.2, '万家菜市场综合楼西侧住户电梯与楼梯核，回家不穿过菜市场', 'home');
    for (const s of E4.schools || []) { const g = s.gate; add('school_' + s.id, s.name, g[0] + (s.gateFace === 'w' ? -1.6 : 0), g[1] + (s.gateFace === 's' ? -1.6 : 0), (s.kind === 'primary' ? '小学' : '中学') + '校门 · 仅外观，接送与上下学人流在门前', 'school', { rect: s.rect }); }
    for (const b of N.modernBuildings || []) {
      if (b.kind === 'school') continue;
      const r = [b.x0, b.y0, b.x0 + b.W, b.y0 + b.D];
      if (b.kind === 'office') add('office_' + b.id, b.name, ...(b.entry || front(r, 'w')), b.desc || b.F + '层写字楼 · 南关路东端，门前有公交站', 'work', { rect: r });
      else if (b.kind === 'mall') add('mall_' + b.id, b.name, ...(b.entry || front(r, 's')), b.desc || b.F + '层商场 · 主路北侧', 'shop', { rect: r });
    }
    const tj = (N.modernBuildings || []).filter((b) => b.kind === 'retail'); if (tj.length) { const r = bboxOf(tj.map((b) => [b.x0, b.y0, b.x0 + b.W, b.y0 + b.D])); add('retail_tianjie', tj[0].name, ...front(r, 's', 1.4), '步行街：咖啡、茶饮、面包、花店、书店等', 'shop', { rect: r }); }
    const E3 = N.expansionE3; for (const c of E3?.transition?.compounds || []) if (c.gate) add('compound_' + c.key, c.name, c.gate[0], c.gate[1] - 1, '商品房小区大门 · 门岗与道闸', 'home');
    const cols = D.colliders || [], col = (id) => cols.find((c) => c.id === id)?.rect;
    if (col('rqe_clinic')) add('e1_clinic', E1.clinic || '社区卫生服务中心', ...front(col('rqe_clinic'), 's'), '3层社康中心 + 药房 · 外观（室内后续开放）', 'life', { rect: col('rqe_clinic') });
    if (col('rqe_kinder')) add('e1_kinder', E1.kinder || '幼儿园', ...front(col('rqe_kinder'), 's'), '2层幼儿园 · 外观', 'school', { rect: col('rqe_kinder') });
    if (col('rqe_transfer')) add('e1_transfer', E1.transfer || '垃圾转运站', ...front(col('rqe_transfer'), 'n'), '片区东南边缘背街 · 外观', 'life', { rect: col('rqe_transfer') });
    /* parks / bridges / riverside */
    if (N.expansionE2) {
      add('park_e2_south', E2.southPark || '榕桥滨河公园', 64, 178, '月河南岸：望月亭、柳岸、滨河广场、古桥桥头广场', 'park');
      add('park_e2_north', E2.northPark || '月河湾公园', 64, 250, '月河北岸：花海、亲水广场、中式园林与清风亭', 'park');
    }
    for (const [k, p] of (E4.river?.parks || []).entries()) add('park_e4_' + (k ? 'n' : 's'), k ? '榕溪滨河公园 · 北园' : '榕溪滨河公园 · 南园', (p[0] + p[2]) / 2, (p[1] + p[3]) / 2, '月河东段滨河公园：榕树、木棉、凤凰木、十字园路', 'park', { rect: p });
    if (N.expansionP9) { const P = N.expansionP9, c = P.park; add('park_p9_hxk', P.names.park, (c[0] + c[2]) / 2, (c[1] + c[3]) / 2, '槐溪汇入月河南岸的小公园。名字未经确认', 'park', { rect: c }); }
    for (const b of bridges()) { const r = b.rect, id = 'bridge_' + Math.round(r[0]) + '_' + Math.round(r[1]); const deckX = r[2] - r[0] > 10 ? r[0] + 2.5 : (r[0] + r[2]) / 2; add(id, b.name, deckX, (r[1] + r[3]) / 2, '桥面可步行' + (/小桥/.test(b.name) ? '（' + b.name + '）' : '，跨越月河'), 'park', { rect: r }); }
    /* bus stops (both lines) */
    for (const s of transit().stops) add('bus_' + s.id, s.name + '公交站', s.x, s.y, (/ng/.test(s.lane) ? (D.rongqiaoBusNg?.line || '南关路线') : '井槐里 ⇄ 槐东便民街') + ' · ' + ({ eb: '东行', wb: '西行', eb_ng: '东行', wb_ng: '西行' }[s.lane] || '') + ' · 06:00–23:00 · ¥2', 'transit');
    for (const extra of [].concat(D.mapPois || [], N.mapPois || [])) if (extra?.id && extra.name) add(extra.id, extra.name, extra.x, extra.y, extra.desc || '', extra.cat || 'life', extra);
    poiCache = out; return out;
  }

  /* ---------------------------------------------------------------- public */
  SP.mapWorld = {
    CELL, CLEAR, ensure, signature: () => (ensure() ? cacheSig : ''), features, regions, pois, transit, plan, snap, walkable, staticHit, roadBlocked, inWater, onBridge, placeAt, steps, bridges,
    cellValue: (x, y) => { if (!ensure() || !grid) return 0; const [i, j] = toCell(x, y); return cellValue(i, j); },
    tilesComputed: () => (grid ? grid.tiles.reduce((a, b) => a + b, 0) : 0),
    missingChunks: () => (ensure() ? model.missing.slice() : []),
    invalidate: () => { model = null; cacheSig = ''; grid = null; },
    setWeight: (w) => { WEIGHT = w; planCache = new Map(); },
  };
})(typeof window !== 'undefined' ? window : globalThis);
