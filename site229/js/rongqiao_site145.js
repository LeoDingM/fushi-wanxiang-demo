/* Site145：把互相压住的封边从楼和水面里裁开，并把河东三条超长分块按东西向拆开。
 * 楼的位置不动。原来的分块矩形不缩小，旧存档的分块前缀仍对得上。新分块接在列表末尾。
 * 名字未经确认。不做 438 m 塔，南埠不往南推。 */
(function () {
  'use strict';
  const root = window;
  const D = root.SCENE_DATA;
  const N = root.RONGQIAO_NORTH;
  if (!D || root.site145Settle) return;

  function rectEq(a, b) {
    return a && b && a.length >= 4 && b.length >= 4 && a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
  }
  function overlaps(a, b) {
    return a[0] < b[2] - 0.05 && b[0] < a[2] - 0.05 && a[1] < b[3] - 0.05 && b[1] < a[3] - 0.05;
  }
  function area(r) {
    return Math.max(0, r[2] - r[0]) * Math.max(0, r[3] - r[1]);
  }
  function subtract(a, b) {
    const ix0 = Math.max(a[0], b[0]), iy0 = Math.max(a[1], b[1]);
    const ix1 = Math.min(a[2], b[2]), iy1 = Math.min(a[3], b[3]);
    if (!(ix0 < ix1 && iy0 < iy1)) return [a.slice()];
    const out = [];
    if (iy0 - a[1] > 1e-4) out.push([a[0], a[1], a[2], iy0]);
    if (a[3] - iy1 > 1e-4) out.push([a[0], iy1, a[2], a[3]]);
    if (ix0 - a[0] > 1e-4) out.push([a[0], iy0, ix0, iy1]);
    if (a[2] - ix1 > 1e-4) out.push([ix1, iy0, a[2], iy1]);
    return out.filter((r) => r[2] - r[0] > 0.02 && r[3] - r[1] > 0.02);
  }
  function prio(id) {
    const s = String(id || '');
    if (/^rqe4_river|^rqe4_creek|^rqe3_river|^rqe2_w|^rqe_p9_river|^rqe_p9_creek|^rqe_p9_canal/.test(s)) return 200;
    if (/river|creek|canal|water/.test(s)) return 100;
    if (/edge|eedge|_west/.test(s)) return 70;
    if (/^rqe_e\d_/.test(s) && !/edge|wedge|margin|nedge|bg/.test(s)) return 60;
    return 10;
  }
  function loserOf(a, b) {
    const pa = prio(a.id), pb = prio(b.id);
    if (pa !== pb) return pa < pb ? a : b;
    const aa = area(a.rect), bb = area(b.rect);
    if (Math.abs(aa - bb) > 0.01) return aa > bb ? a : b;
    return String(a.id) > String(b.id) ? a : b;
  }
  function replaceCollider(col, win, pieces) {
    const old = col.rect.slice();
    const still = (D.colliders || []).some((c) => c !== col && c.rect && rectEq(c.rect, old));
    if (N && N.solids) {
      N.solids = N.solids.filter((s) => !rectEq(s, old));
      if (still) N.solids.push(old.slice());
    }
    if (N && N.water) {
      let hit = false;
      const waters = [];
      for (const w of N.water) {
        if (rectEq(w, old)) { hit = true; continue; }
        waters.push(w);
      }
      if (hit) {
        if (still) waters.push(old.slice());
        for (const p of pieces) waters.push(p.slice());
        N.water = waters;
      }
    }
    const idx = D.colliders.indexOf(col);
    if (!pieces.length) {
      if (idx >= 0) D.colliders.splice(idx, 1);
      return;
    }
    col.rect = pieces[0].slice();
    if (N && N.solids) N.solids.push(col.rect.slice());
    for (let i = 1; i < pieces.length; i++) {
      const rect = pieces[i].slice();
      D.colliders.push({ id: col.id + '_s145_' + (D._s145n = (D._s145n || 0) + 1), rect });
      if (N && N.solids) N.solids.push(rect.slice());
    }
    if (win && rectEq(win.rect, old) && N && N.solids && !N.solids.some((s) => rectEq(s, old))) N.solids.push(old.slice());
  }
  function resolveOverlaps() {
    const cuts = [];
    let guard = 0;
    while (guard++ < 500) {
      const rs = (D.colliders || []).filter((c) => c && c.rect && c.rect.length >= 4);
      let pair = null;
      for (let i = 0; i < rs.length && !pair; i++) {
        for (let j = i + 1; j < rs.length; j++) {
          if (!overlaps(rs[i].rect, rs[j].rect)) continue;
          if (!/^rqe_/.test(rs[i].id || '') && !/^rqe_/.test(rs[j].id || '')) continue;
          pair = [rs[i], rs[j]];
          break;
        }
      }
      if (!pair) break;
      const lose = loserOf(pair[0], pair[1]);
      const win = lose === pair[0] ? pair[1] : pair[0];
      const pieces = subtract(lose.rect, win.rect);
      cuts.push(lose.id + ' < ' + win.id);
      replaceCollider(lose, win, pieces);
    }
    let left = 0;
    const rs = (D.colliders || []).filter((c) => c && c.rect && c.rect.length >= 4);
    for (let i = 0; i < rs.length; i++) {
      if (!/^rqe_/.test(rs[i].id || '')) continue;
      for (let j = 0; j < rs.length; j++) {
        if (i === j) continue;
        if (overlaps(rs[i].rect, rs[j].rect)) left++;
      }
    }
    return { cuts, left, guard };
  }
  function groundBox() {
    const G = D.ground;
    if (!G || !G.chunk) return null;
    return [G.origin[0], G.origin[1], G.origin[0] + G.cols * G.chunk, G.origin[1] + G.rows * G.chunk];
  }
  function clipBox(rect, box) {
    const n = [Math.max(rect[0], box[0]), Math.max(rect[1], box[1]), Math.min(rect[2], box[2]), Math.min(rect[3], box[3])];
    if (n[2] - n[0] <= 0.02 || n[3] - n[1] <= 0.02) return [];
    return [n];
  }
  function roadTiles(rect) {
    const G = D.ground, ch = G.chunk, tiles = [];
    const c0 = Math.floor((rect[0] - G.origin[0]) / ch), c1 = Math.floor((rect[2] - 1e-4 - G.origin[0]) / ch);
    const r0 = Math.floor((rect[1] - G.origin[1]) / ch), r1 = Math.floor((rect[3] - 1e-4 - G.origin[1]) / ch);
    for (let r = r0; r <= r1; r++) {
      const row = G.data_south_to_north[r];
      if (!row) continue;
      for (let c = c0; c <= c1; c++) if (row[c] && /[AB]/.test(row[c])) tiles.push([G.origin[0] + c * ch, G.origin[1] + r * ch, G.origin[0] + (c + 1) * ch, G.origin[1] + (r + 1) * ch]);
    }
    return tiles;
  }
  /* 叠区裁完之后，封边不能伸出地面，也不能压在车行道上。水面矩形不动。 */
  function trimToGround() {
    const box = groundBox();
    if (!box) return [];
    const notes = [];
    const list = (D.colliders || []).slice();
    for (const col of list) {
      if (!col || !col.rect || !/^rqe_/.test(col.id || '')) continue;
      if (/^rqe4_river|^rqe4_creek|^rqe3_river|^rqe2_w|^rqe_p9_river|^rqe_p9_creek|^rqe_p9_canal/.test(col.id)) continue;
      let pieces = clipBox(col.rect, box);
      if (!pieces.length) {
        notes.push(col.id + ' drop');
        replaceCollider(col, null, []);
        continue;
      }
      const roads = [];
      for (const p of pieces) roads.push(...roadTiles(p));
      for (const road of roads) {
        const next = [];
        for (const p of pieces) next.push(...subtract(p, road));
        pieces = next;
      }
      if (pieces.length === 1 && rectEq(pieces[0], col.rect)) continue;
      notes.push(col.id + ' ' + pieces.length);
      replaceCollider(col, null, pieces);
    }
    return notes;
  }
  function renameWillows() {
    const lists = [];
    if (D.objects) lists.push(D.objects);
    for (const ch of Object.values(root.SCENE_CHUNKS || {})) if (ch && ch.objects) lists.push(ch.objects);
    const used = new Set();
    for (const list of lists) for (const o of list) if (o && o.id) used.add(o.id);
    let n = 0;
    for (const list of lists) for (const o of list) {
      if (!o || o.type !== 'rq_x_tree' || !/willow/.test(o.variant || '')) continue;
      if (/^(rqe\d_t_willow_|rqm3_tree_)/.test(o.id || '')) continue;
      const base = 'rqe9_t_willow_' + String(o.id || 'x').replace(/^rqp9_/, '');
      let id = base, k = 1;
      while (used.has(id)) id = base + '_' + (k++);
      used.delete(o.id);
      used.add(id);
      o.id = id;
      n++;
    }
    return n;
  }
  function emitBins(parentId, objects, y0, y1, label) {
    const groups = new Map();
    for (const o of objects) {
      const b = Math.floor(o.x / 160) * 160;
      if (!groups.has(b)) groups.set(b, []);
      groups.get(b).push(o);
    }
    const bands = [];
    for (const [b, list] of groups) {
      if (list.length <= 2500) bands.push([b, b + 160, list]);
      else {
        const sub = new Map();
        for (const o of list) {
          const s = Math.floor(o.x / 80) * 80;
          if (!sub.has(s)) sub.set(s, []);
          sub.get(s).push(o);
        }
        for (const [s, sl] of sub) bands.push([s, s + 80, sl]);
      }
    }
    const made = [];
    const have = new Set((D.chunks || []).map((c) => c.id));
    for (const [x0, x1, list] of bands) {
      if (!list.length) continue;
      if (list.length > 2600) throw new Error('site145 bin ' + parentId + ' ' + x0 + ' ' + list.length);
      const id = parentId + '_w' + x0;
      if (have.has(id)) throw new Error('site145 duplicate chunk ' + id);
      root.SCENE_CHUNKS[id] = { objects: list, colliders: [] };
      const rect = [x0, y0, x1, y1];
      const height = y1 - y0;
      if (rect[2] - rect[0] > 0 && height > 0 && (rect[2] - rect[0]) * height >= 80000) {
        throw new Error('site145 chunk still huge ' + id);
      }
      D.chunks.push({ id, name: label + x0, rect, src: 'js/rongqiao_site145.js', load_m: 40, unload_m: 80 });
      have.add(id);
      made.push({ id, n: list.length, rect });
    }
    return made;
  }
  function splitBands() {
    if (D.rongqiaoSite145) return D.rongqiaoSite145.bands || [];
    const CH = root.SCENE_CHUNKS || {};
    const pin12 = (o) => {
      const fg = String(o.fade_group || '');
      if (fg.startsWith('rqe_oldst_')) return true;
      if (o.type === 'rq_x_dry' || o.type === 'rq_x_banyan') return true;
      if (o.type === 'rq_x_boat' && o.y < -220) return true;
      if (o.type === 'rq_x_sign_s' && /^(yg|hx|cp|hb|mz)$/.test(o.variant || '')) return true;
      return false;
    };
    const jobs = [
      ['rqe_p10_e10', '望山', (o) => o.fade_group === 'rqe_p10o_ts' || (o.x >= 640 && o.x < 800)],
      ['rqe_p10_e11', '南堤', (o) => o.x >= 320 && o.x < 480],
      ['rqe_p10_e12', '渔港', pin12],
    ];
    const bands = [];
    for (const [id, label, keepFn] of jobs) {
      const ch = CH[id];
      const meta = (D.chunks || []).find((c) => c.id === id);
      if (!ch || !ch.objects || !meta) continue;
      const keep = [], move = [];
      for (const o of ch.objects) (keepFn(o) ? keep : move).push(o);
      if (keep.length > 2600) throw new Error('site145 keep ' + id + ' ' + keep.length);
      ch.objects = keep;
      const made = emitBins(id, move, meta.rect[1], meta.rect[3], label);
      bands.push({ id, keep: keep.length, made });
    }
    const info = {
      unconfirmed: true,
      added: bands.reduce((n, b) => n + b.made.length, 0),
      bands,
      note: '河东望山、南堤、渔港三条带子按 160 m 拆开，每块不超过 2600 个物件。原块矩形不缩小。听山酒店仍在望山块，渔村老街仍在渔港块。',
    };
    D.rongqiaoSite145 = info;
    if (N && N.expansionP10) {
      N.expansionP10.site145 = info;
      N.expansionP10.reasons = N.expansionP10.reasons || {};
      N.expansionP10.reasons.site145 = 'Site145：E3 背景楼 rqe_e3_bgr3 不再和槐溪北侧封边叠在一起，封边让出楼的脚印。月河水面里的 rqe_p10_north 裁到河岸以外，河面上不再压着封边。伸出地面的封边收到地面边上，压在车行道上的南侧封边让出车道。垂柳编号改成 rqe9_t_willow_。河东望山、南堤、渔港三条超长分块拆成东西向小块，每块不超过 2600 个物件，楼还在原来的位置。原分块矩形不缩小，新块接在列表末尾，载入距离仍是 40 m。北界仍是 y378，南埠仍停在 y-1540。没有 438 m 塔。名字未经确认。';
    }
    return bands;
  }

  function settle() {
    const willows = renameWillows();
    const seams = resolveOverlaps();
    seams.trimmed = trimToGround();
    const bands = splitBands();
    root.SITE145 = { willows, seams, bands, chunks: D.chunks.length };
    return root.SITE145;
  }
  root.site145Settle = settle;
  settle();
})();
