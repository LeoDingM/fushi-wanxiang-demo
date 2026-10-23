/* E-bike variant assignment (Leo 2026-10-18 00:08 parked e-bike redraw). VARIANT only, seeded by object id: base objects keep
 * [id,type,x,y,state] and chunk ids/order are unchanged, so every old save still loads. Mix ratios 未经Leo确认. */
(function () {
  'use strict';
  const D = window.SCENE_DATA; if (!D || window.RONGQIAO_EBIKES) return;
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const ROWV = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'a', 'b', 'c', 'f'];        // shared rows ('h') only where placed explicitly
  const KITV = ['eb_w', 'eb_r', 'eb_b', 'eb_k', 'eb_p', 'eb_dl', 'eb_dl2', 'eb_qt', 'eb_cn', 'eb_bc', 'eb_w', 'eb_k', 'eb_dl'];
  let n = 0; const last = {};
  const choose = (pool, o) => { let k = hash(o.id + '#ebike') % pool.length; if (pool[k] === last[o.type]) k = (k + 1 + (hash(o.id) % (pool.length - 1))) % pool.length; if (pool[k] === last[o.type]) k = (k + 1) % pool.length; last[o.type] = pool[k]; return pool[k]; };   // no neighbour repeats
  const visit = (list) => { for (const o of list || []) {
    if (o.type === 'p_ebike' && (!o.variant || o.variant === 'base')) { o.variant = choose(KITV, o); n++; }
    else if (o.type === 'rq_ebikes' && (o.variant === 'a' || o.variant === 'b' || !o.variant)) { o.variant = choose(ROWV, o); n++; } } };
  visit(D.objects); const C = window.SCENE_CHUNKS || {}; for (const k of Object.keys(C)) visit(C[k] && C[k].objects);
  window.RONGQIAO_EBIKES = { restyled: n, ROWV, KITV, version: 1 };
})();
