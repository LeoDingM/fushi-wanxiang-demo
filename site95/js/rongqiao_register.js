/* 榕桥片区 chunk index registration (P2/P3).
 * Runs after every other script that appends to SCENE_DATA.chunks (shared_home_scene.js) and before progress_save.js,
 * so the chunk list of every older save stays an exact index-by-index prefix of the current list (additive world contract). */
(function (root) {
  'use strict';
  const D = root.SCENE_DATA;
  if (!D) return;
  const have = new Set((D.chunks || []).map((c) => c.id));
  /* P2/P3 chunks first, then the expansion phases (E1 data loads before the market's runtime chunk but must index after it) */
  /* E5+: TAIL chunks are data chunks (loaded before core.js) that must index after the runtime market chunks (market2 / market3 push LATE) */
  for (const c of (root.RONGQIAO_PENDING_CHUNKS || []).concat(root.RONGQIAO_LATE_CHUNKS || [], root.RONGQIAO_TAIL_CHUNKS || [])) if (!have.has(c.id)) { D.chunks.push(c); have.add(c.id); }
  root.RONGQIAO_PENDING_CHUNKS = []; root.RONGQIAO_LATE_CHUNKS = []; root.RONGQIAO_TAIL_CHUNKS = [];
})(window);
