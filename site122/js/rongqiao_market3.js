/* E4e (2026-10-18): 万家菜市场综合楼 (coastal plan v2 §7.3, mapped into the current world — see /workspace/fushi-plan/coastal/v2-to-game-mapping.md)
 * — riverside mixed-use block at the west end of the 月河 south bank (x -106.5..-64.5, y 157.5..185.5), the promenade + river to its north.
 * 1F: the SAME market system as 榕桥菜市场 (js/rongqiao_market.js layout() translated by DX/DY, ids rq_market -> rq_market3), the same
 * seamless open interior (【Leo已定 2026-10-17 20:09】 only wet markets: roof hide, near-wall cut, pendant lights), four gates
 * (S main gate on the back lane, N gate onto the riverside promenade, W gate onto the west strip, E gate onto the service lane), the same
 * schedule-driven goods / shutters. Single ledger: stalls carry rqStall 'm3_<id>' (WetMarketModel v3).
 * 2–3F commercial podium (own stair door on the east service lane, interiors not open yet) + two residential towers on the podium roof:
 * A 12F (floors 4–12) by the core in the west, B 9F (floors 4–9) toward the 4–7F 城中村 in the east, a residents' roof garden between.
 * All above-hall pieces carry cutaway role 'roof' so they open away with the market roof when the player walks in.
 * Residents: a separate lift + stair core on the west side with its own street door on the west strip — they never walk through
 * the market; its floors are interior scenes (js/rongqiao_m3_residence.js: lobby, then floors 4–12; tower B via the 4F roof garden).
 * Site: the second row of E3 background flats (bgn3..5) and the planted strip are cleared at load (presentation only).
 * Chunk appends after every older chunk (RONGQIAO_LATE_CHUNKS): older saves keep their chunk prefix. Name / layout 未经Leo确认.
 * (Formerly drafted as 南埠菜市场; renamed — v2 keeps 南埠 for the southern 南埠 area / 南埠涌.) */
(function (root) {
  'use strict';
  const D = root.SCENE_DATA, M = root.RongqiaoMarket, N = root.RONGQIAO_NORTH;
  if (!D || !M || !D.rongqiaoMarket2 || D.rongqiaoMarket3) return; D.rongqiaoMarket3 = 1;
  const ID = 'rq_market3', NAME = '万家菜市场综合楼', DX = -148, DY = 57.5, CHUNK = [-112, 150, -56, 194];
  const T = (x, y) => [+(x + DX).toFixed(3), +(y + DY).toFixed(3)], TR = (r) => [r[0] + DX + 0.001, r[1] + DY + 0.001, r[2] + DX - 0.001, r[3] + DY - 0.001].map((v) => +v.toFixed(3));
  const L0 = M.layout(), ren = (id) => String(id).replace(/^rq_market/, ID);
  const keepXY = (x, y) => x >= 47.9 && x < 84 && y >= 98 && y <= 130;
  const DROP = /^rq_roof_/;                     // the hall's own metal deck: the podium above is its roof now
  const objects = L0.objects.filter((o) => keepXY(o.x, o.y) && !DROP.test(o.type)).map((o) => { const n = Object.assign({}, o, { id: ren(o.id) }); [n.x, n.y] = T(o.x, o.y);
    if (n.rqStall) n.rqStall = 'm3_' + n.rqStall; if (Array.isArray(n.reach)) n.reach = n.reach.map((p) => T(p[0], p[1]));
    if (n.fade_group === M.ID) n.fade_group = ID; if (n.cutaway) n.cutaway = Object.assign({}, n.cutaway, { b: ID }); if (n.type === 'rq_mk_signboard') n.variant = 'm3'; return n; });
  const base = L0.base.filter((o) => keepXY(o.x, o.y)).map((o) => { const n = Object.assign({}, o, { id: ren(o.id) }); [n.x, n.y] = T(o.x, o.y); return n; });
  const colliders = L0.colliders.filter((c) => c.rect[0] >= 47.9 && c.rect[2] <= 84 && c.rect[1] >= 98).map((c) => ({ id: ren(c.id), rect: TR(c.rect), solid: c.solid }));
  const gates = {}; for (const [k, g] of Object.entries(L0.gates)) gates[k] = { x: g.x + DX, y: g.y + DY, out: T(...g.out), in: T(...g.in) };
  const RECT = TR(L0.rect);
  // ---- the building above the hall + the core
  const used = new Set(), uid = (s) => { let k = s, n = 1; while (used.has(k)) k = s + '_' + n++; used.add(k); return k; };
  const put = (id, type, x, y, more) => objects.push(Object.assign({ id: uid('rqm3_' + id), type, x: +(+x).toFixed(2), y: +(+y).toFixed(2), z: 0, rot: 0 }, more || {}));
  const ROOF = { fade_group: ID, cutaway: { b: ID, role: 'roof' } };
  const PX0 = -100.5, PY0 = 158, PW = 36, PD = 27, H1 = 3.6;          // podium 36 x 27 (0.5 m overhang W / E, 0.5 m set back from the hall's S wall)
  const TX0 = -100.5, TY0 = 176, TW = 12, TD = 9;                     // v2: two towers on the podium, river side
  const TOWERS = [{ k: 'a', x0: -100.5, top: 12, cap: 'tw' }, { k: 'b', x0: -76.5, top: 6, cap: 'te' }];   // height transition (Leo's rule): A 12F on the river / future 万家桥路 corner, B steps down to a 6F wing toward the 4–7F 城中村; roof garden between
  const TF = 12 - 3;                                                  // residential floors 4..12 (the core serves both: B through the 4F roof garden)
  const CX0 = -106.5, CY0 = 176, CW = 6;                              // lift + stair core (2 x 3 bays), full height
  let h = 0; const hsh = (s) => { h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0) / 4294967296; };
  for (let f = 2; f <= 3; f++) { const z = H1 + (f - 2) * 3;
    for (let b = 0; b < PW / 3; b++) put(`pS${f}_${b}`, 'f_wall', PX0 + b * 3, PY0, Object.assign({ z, state: 'upper', variant: 'nb_pod' }, ROOF));
    for (let b = 0; b < (CY0 - PY0) / 3; b++) put(`pW${f}_${b}`, 'f_wall', PX0, PY0 + 3 + b * 3, Object.assign({ z, rot: 6, state: 'upper', variant: 'nb_pod' }, ROOF)); }
  [['cha', 2, 0], ['den', 2, 4.5], ['pha', 2, 8], ['edu', 3, 0], ['gym', 3, 4.5], ['hair', 3, 8]].forEach(([v, f, b]) => put(`band_${v}`, 'rq_m3_band', PX0 + (b < 4 ? 0 : b < 8 ? 12 : 24) + 1.5, PY0, Object.assign({ z: H1 + (f - 2) * 3 + 2.15, variant: v }, ROOF)));
  /** a flat roof of 6 x 4.5 tiles with parapet runs on the given edges (s / n along x, w / e along y) */
  function roof(key, x0, y0, w, d, z, v, edges, more, edgesOnly) {
    if (!edgesOnly) for (let x = x0; x < x0 + w - 0.01; x += 6) for (let y = y0; y < y0 + d - 0.01; y += 4.5) put(`${key}_t${x}_${y}`, 'rq_m3_dtile', x, y, Object.assign({ z, variant: v }, more));
    for (let x = x0; x < x0 + w - 0.01; x += 6) { if (edges.includes('s')) put(`${key}_ps${x}`, 'rq_m3_par', x, y0, Object.assign({ z, variant: 's' }, more)); if (edges.includes('n')) put(`${key}_pn${x}`, 'rq_m3_par', x, y0 + d - 0.25, Object.assign({ z, variant: 's' }, more)); }
    for (let y = y0; y < y0 + d - 0.01; y += 4.5) { if (edges.includes('w')) put(`${key}_pw${y}`, 'rq_m3_par', x0, y, Object.assign({ z, variant: 'w' }, more)); if (edges.includes('e')) put(`${key}_pe${y}`, 'rq_m3_par', x0 + w - 0.25, y, Object.assign({ z, variant: 'w' }, more)); }
  }
  // podium roof (3F roof, z 9.6): the residents' roof garden — lawn panels on a paved cross path, a rubber-matted play corner with a
  // slide, a pergola with benches, trees in boxes, planters on the parapet line, railings on the parapets; the mall below shows
  // through as skylights, condensers and exhaust ducts. RP props are tagged m3roof (no ground footprint: they stand on the roof).
  const ZD = H1 + 6, RP = Object.assign({ m3roof: true }, ROOF);
  // the SE quarter carries a 5F wing (万家茶楼 dining floors 4–5F + a rooftop restaurant terrace); the rest is the garden
  const WX0 = -76.5, WY0 = PY0, WW = 12, WD = 9, inWing = (c, r) => c >= 4 && r < 2;
  for (let c = 0; c < 6; c++) for (let r = 0; r < 4; r++) { if (inWing(c, r)) continue; const x = PX0 + c * 6, y = PY0 + r * 4.5;
    const v = c >= 4 ? 'play' : r === 2 || c === 3 ? 'deck' : 'lawn'; put(`deck_t${c}_${r}`, 'rq_m3_dtile', x, y, Object.assign({ z: ZD, variant: v }, ROOF)); }
  roof('deckp', PX0, PY0, 24, 18, ZD, null, 'sw', ROOF, true); roof('deckpe', WX0, WY0 + WD, WW, 18 - WD, ZD, null, 'e', ROOF, true);
  roof('deckg', -88.5, 176, 12, 9, ZD, 'deck', 'n', ROOF);
  for (let x = PX0; x < WX0 - 0.1; x += 3) put(`rail_s${x}`, 'rq_x_rail_s', x, PY0 + 0.12, Object.assign({ z: ZD + 1.05 }, RP));
  for (let y = PY0; y < 176 - 0.1; y += 3) put(`rail_w${y}`, 'rq_x_rail_w', PX0 + 0.12, y, Object.assign({ z: ZD + 1.05 }, RP));
  for (let y = WY0 + WD; y < 176 - 0.1; y += 3) put(`rail_e${y}`, 'rq_x_rail_w', PX0 + PW - 0.12, y, Object.assign({ z: ZD + 1.05 }, RP));
  for (const [x, y] of [[-100, 158.5], [-100, 174.4], [-94.5, 174.4], [-87.8, 179], [-79.4, 182.6], [-86.6, 182.6]]) put(`planter_${x}_${y}`, 'rq_x_bed', x, y, Object.assign({ z: ZD, variant: ['a', 'b', 'c'][Math.round(-x) % 3] }, RP));
  for (const [x, y, v] of [[-93.4, 165.2, 'sakura'], [-87.3, 165.2, 'peach'], [-96.6, 172.3, 'willow3'], [-88.4, 172.3, 'sakura'], [-66.2, 174.2, 'peach'], [-83.4, 179.4, 'peach']]) {
    put(`tbox_${x}_${y}`, 'rq_m3_kit', x - 0.7, y - 0.7, Object.assign({ z: ZD, variant: 'tbox' }, RP)); put(`tree_${x}_${y}`, 'rq_x_tree', x, y, Object.assign({ z: ZD + 0.6, variant: v }, RP)); }
  put('perg', 'rq_m3_kit', -99.6, 163.2, Object.assign({ z: ZD, variant: 'perg' }, RP));
  put('slide', 'rq_x_play', -74.6, 168.4, Object.assign({ z: ZD }, RP)); put('slide2', 'rq_x_play', -69.2, 171.6, Object.assign({ z: ZD, rot: 6 }, RP));
  for (const [x, y] of [[-94.2, 158.7], [-88.2, 158.7]]) put(`sky_${x}`, 'rq_roof_sky', x, y, Object.assign({ z: ZD - 3.55, variant: 'in' }, RP));   // the kit skylight sits 3.55 m up its own frame
  put('ac_path', 'rq_m3_kit', -82.2, 158.6, Object.assign({ z: ZD, variant: 'ac' }, RP));
  // the wing: glazed dining floors (S + W faces seen), roof terrace with parasols, kitchen exhaust + condensers, sign band
  for (let f = 4; f <= 5; f++) { const z = ZD + (f - 4) * 3;
    for (let b = 0; b < WW / 3; b++) put(`wS${f}_${b}`, 'f_wall', WX0 + b * 3, WY0, Object.assign({ z, state: 'upper', variant: 'nb_pod' }, ROOF));
    for (let b = 0; b < WD / 3; b++) put(`wW${f}_${b}`, 'f_wall', WX0, WY0 + 3 + b * 3, Object.assign({ z, rot: 6, state: 'upper', variant: 'nb_pod' }, ROOF)); }
  const ZW = ZD + 6; roof('wcap', WX0, WY0, WW, WD, ZW, 'deck', 'swne', ROOF);
  for (let x = WX0; x < WX0 + WW - 0.1; x += 3) put(`wrail_s${x}`, 'rq_x_rail_s', x, WY0 + 0.12, Object.assign({ z: ZW + 1.05 }, RP));
  for (let y = WY0; y < WY0 + WD - 0.1; y += 3) put(`wrail_w${y}`, 'rq_x_rail_w', WX0 + 0.12, y, Object.assign({ z: ZW + 1.05 }, RP));
  for (const [x, y] of [[-75.4, 159.4], [-71.4, 159.4], [-75.4, 163.2]]) put(`umb_${x}_${y}`, 'rq_m3_kit', x, y, Object.assign({ z: ZW, variant: 'umb' }, RP));
  put('wvent', 'rq_m3_kit', -68.2, 163.8, Object.assign({ z: ZW, variant: 'vent' }, RP)); put('wac', 'rq_m3_kit', -68.2, 159.6, Object.assign({ z: ZW, variant: 'ac' }, RP));
  put('band_rft', 'rq_m3_band', WX0 + 1.5, WY0, Object.assign({ z: ZD + 3 + 2.15, variant: 'rft' }, ROOF));
  // street front: a rain canopy over the 1F market frontage along the south pavement
  for (let x = PX0 + 0.5; x < PX0 + PW - 1; x += 6) put(`canopy_${x}`, 'rq_cw_canopy', x, PY0 - 0.5, { z: 0, fade_group: ID });
  for (const T of TOWERS) { for (let f = 4; f <= T.top; f++) { const z = H1 + 6 + (f - 4) * 3;
    // bay rhythm: accent column (b0, A only), balconies in the middle, bay windows on the east bay, plain windows where the balcony skips a floor
    for (let b = 0; b < TW / 3; b++) { const lit = hsh(`m3${T.k}${f}_${b}`) < 0.5, mid = b === 1 || b === 2, balc = mid && (f + b) % 3 !== 0;
      const v = T.k === 'a' && b === 0 ? 'nb_resa' : b === 3 && f % 2 === 0 ? 'nb_resw' : balc ? (lit ? 'nb_resbl' : 'nb_resb') : (lit ? 'nb_resl' : 'nb_res');
      put(`t${T.k}S${f}_${b}`, 'f_wall', T.x0 + b * 3, TY0, Object.assign({ z, state: 'upper', variant: v, night_lit: lit && /l$/.test(v) }, ROOF)); }
    if (T.k === 'b') for (let b = 0; b < TD / 3; b++) put(`tbW${f}_${b}`, 'f_wall', T.x0, TY0 + 3 + b * 3, Object.assign({ z, rot: 6, state: 'upper', variant: b === 1 ? 'nb_resw' : f % 2 ? 'nb_resa' : 'nb_res' }, ROOF)); }
    const zt = H1 + 6 + (T.top - 3) * 3; roof('cap' + T.k, T.x0, TY0, TW, TD, zt, 'roof', 'ne', ROOF);
    for (let x = T.x0; x < T.x0 + TW - 0.01; x += 6) put(`cr${T.k}s${x}`, 'rq_m3_par', x, TY0, Object.assign({ z: zt, variant: 'crs' }, ROOF));            // crown on the seen faces
    for (let y = TY0; y < TY0 + TD - 0.01; y += 4.5) put(`cr${T.k}w${y}`, 'rq_m3_par', T.x0, y, Object.assign({ z: zt, variant: 'crw' }, ROOF));
    // roof equipment on every tower: water tank, lift / pump machine room, solar water heaters
    put('tank' + T.k, 'rq_m3_kit', T.x0 + 1, TY0 + 5.6, Object.assign({ z: zt, variant: 'tank' }, ROOF)); put('mach' + T.k, 'rq_m3_kit', T.x0 + 7.5, TY0 + 5.8, Object.assign({ z: zt, variant: 'mach' }, ROOF));
    for (const x of [T.x0 + 4.2, T.x0 + 7.6]) put(`solar_${T.k}${x}`, 'rq_m3_kit', x, TY0 + 1.6, Object.assign({ z: zt, variant: 'solar' }, ROOF)); }
  const TOP = H1 + 6 + TF * 3;
  put('name', 'rq_m3_name', TX0 + 2, TY0 + 0.3, Object.assign({ z: TOP + 1.1, variant: 'wjhy' }, ROOF));
  const CG = 'rqm3_core';
  for (let f = 1; f <= 3 + TF; f++) { const z = f === 1 ? 0 : f === 2 ? H1 : H1 + (f - 2) * 3, st = f === 1 ? 'ground' : 'upper';
    for (let b = 0; b < CW / 3; b++) put(`cS${f}_${b}`, 'f_wall', CX0 + b * 3, CY0, { z, state: b === 1 ? st : 'upper', variant: 'nb_core', fade_group: CG });
    for (let b = 0; b < TD / 3; b++) put(`cW${f}_${b}`, 'f_wall', CX0, CY0 + 3 + b * 3, { z, rot: 6, state: 'upper', variant: 'nb_core', fade_group: CG }); }
  roof('capc', CX0, CY0, CW, TD, H1 + (3 + TF - 1) * 3, 'roof', 'swne', { fade_group: CG }); put('liftroom', 'rq_m3_kit', CX0 + 1.2, CY0 + 3, { z: H1 + (3 + TF - 1) * 3, variant: 'lift', fade_group: CG });
  const CORE_RECT = [CX0, CY0, CX0 + CW, CY0 + TD], DOOR = [CX0 + 4.5, CY0];
  put('res_door', 'modern_entry_marker', DOOR[0], DOOR[1], { interact: 'rqm3_res_entry', reach: [DOOR[0], CY0 - 1.1], name: '万家花园 · 住户大堂（电梯 / 楼梯）' });
  // ---- outside: e-bike strip on the west strip, bins at the service lane, lamps on the lane, planters along the promenade
  for (const y of [161, 164]) put(`eb_${y}`, 'rq_ebikes', -104.6, y, { variant: y === 161 ? 'a' : 'b' });
  put('com_door', 'modern_entry_marker', -64.3, 166.5, { rot: 6, interact: 'rqm3_com_entry', reach: [-63.2, 166.5], name: '万家菜市场综合楼 · 商业楼梯（2–3F）' });
  put('bins', 'p_trashbin', -63.4, 170.5); put('bins2', 'p_trashbin', -63.4, 162.5);
  const ebC = [[-104.6, 160.9, -102.0, 162.5], [-104.6, 163.9, -102.0, 165.5]];
  // ---- clear the site (E3 background flats bgn3..5, planted strip, trees) — presentation / collision only, no save identity
  const CLEAR = [-106.8, 154.4, -62.2, 186.2], WEST_GONE = [[-124, 147, -112, 156], [-124, 165, -112, 174]];
  const inR = (o, r) => o.x >= r[0] && o.x <= r[2] && o.y >= r[1] && o.y <= r[3];
  const inside = (r, R) => r[0] >= R[0] - 0.4 && r[2] <= R[2] + 0.4 && r[1] >= R[1] - 0.4 && r[3] <= R[3] + 0.4;
  const GONE = new Set(['rqe_e3_bgn3', 'rqe_e3_bgn4', 'rqe_e3_bgn5', 'rqe_e3_bgn6', 'rqe_e3_bgn7']), removed = [];   // bgn6 / 7: 4–5F flats 5.5 m west of the 12F core make way for the 万家桥路 corridor
  root.SCENE_CHUNKS = root.SCENE_CHUNKS || {};
  for (const [cid, ch] of Object.entries(root.SCENE_CHUNKS)) {
    if (!ch || !ch.objects || /^rq_market/.test(cid)) continue;
    ch.objects = ch.objects.filter((o) => { if (GONE.has(o.fade_group) || (/^rqe/.test(o.id) && inR(o, CLEAR))) { removed.push(o.id); return false; } return true; });
  }
  D.objects = D.objects.filter((o) => !(/^rqe/.test(o.id) && inR(o, CLEAR)));
  D.colliders = D.colliders.filter((c) => !(GONE.has(c.id) || (/^rqe/.test(c.id) && inside(c.rect, CLEAR))));
  // phone-map-nav (2026-10-18, 未经Leo确认): 老街北口. The E3 north fence (rqe3_nedge + w_fence run at y 141) and the west hedge
  // (x −43) sealed the whole 万家 block (x −106…−43, y 142…192) off from the district, so none of the four market gates nor the
  // residents' door could be walked to. A 4 m opening at the north end of 榕桥老街 (x −78…−74, the alley between back flats
  // bgn1 / bgn2) links 老街 to the market's back street. Collision / presentation only; no save identity changes.
  const LINK = [-78, -74];
  for (const ch of Object.values(root.SCENE_CHUNKS)) if (ch && ch.objects) ch.objects = ch.objects.filter((o) => !(/^rqe3_nedge_fence_/.test(o.id) && o.x > LINK[0] && o.x < LINK[1]));
  D.colliders = D.colliders.flatMap((c) => (c.id !== 'rqe3_nedge' ? [c] : [{ id: c.id, rect: [c.rect[0], c.rect[1], LINK[0], c.rect[3]] }, { id: 'rqe3_nedge_e', rect: [LINK[1], c.rect[1], c.rect[2], c.rect[3]] }]));
  if (N && N.expansionE3) N.expansionE3.oldStreetNorthLink = { rect: [LINK[0], 140.6, LINK[1], 143.7], name: '老街北口', unconfirmed: true };
  const OLD = N ? N.solids.filter((r) => inside(r, CLEAR)).map((r) => r.slice()) : [];
  if (N) { N.solids = N.solids.filter((r) => !inside(r, CLEAR)); if (N.buildings) N.buildings = N.buildings.filter((b) => !GONE.has(b.id)); N.solids = N.solids.filter((r) => !WEST_GONE.some((g) => g.join() === r.join())); }
  // old saves standing on the cleared plot where it was walkable before E4e move to the nearest walkable point (see RONGQIAO_RELOCATE in E4);
  // positions inside the old flats (already solid) and anywhere else stay rejected as forged
  (root.RONGQIAO_RELOCATE_ZONES = root.RONGQIAO_RELOCATE_ZONES || []).push({ id: 'e4e', rect: CLEAR.slice(), old: OLD });
  // ---- ground: market floor 'M', wet zones 'Q', service strips concrete
  const G = D.ground;
  const paint = (rect, t) => { for (let r = 0; r < G.data_south_to_north.length; r++) { let row = null; for (let c = 0; c < G.cols; c++) { const x = G.origin[0] + (c + 0.5) * G.chunk, y = G.origin[1] + (r + 0.5) * G.chunk; if (x >= rect[0] && x < rect[2] && y >= rect[1] && y < rect[3]) { row = row || G.data_south_to_north[r].split(''); row[c] = t; } } if (row) G.data_south_to_north[r] = row.join(''); } };
  paint([-106.8, 153.4, -62, 186], 'K');
  // 万家桥路 corridor west of the core (outside the bounds until P9 opens it): carriageway + pavements where bgn6 / 7 stood, street trees
  paint([-124, 141, -121, 192], 'S'); paint([-121, 141, -113, 192], 'A'); paint([-113, 141, -106.8, 192], 'S');
  for (let y = 145; y < 190; y += 8) { objects.push({ id: uid('rqm3_wjq_t' + y), type: 'rq_x_tree', x: -122.6, y, z: 0, rot: 0, variant: y % 16 === 1 ? 'kapok' : 'rong' }); objects.push({ id: uid('rqm3_wjq_l' + y), type: 'p_lamp', x: -111.4, y: y + 4, z: 0, rot: 0 }); }
  for (const [r, t] of [[[48, 100, 82, 128], 'M'], [[50, 118, 62, 122], 'Q'], [[68, 118, 82, 122], 'Q'], [[76, 122, 82, 128], 'K'], [[82, 100, 83, 128], 'K']]) paint(TR(r), t);
  D.objects = D.objects.concat(base);
  const allCol = colliders.map((c) => ({ id: c.id, rect: c.rect.slice() })).concat([{ id: CG, rect: CORE_RECT.slice() }], ebC.map((r, i) => ({ id: 'rqm3_c_eb' + i, rect: r })));
  root.SCENE_CHUNKS[ID] = { objects, colliders: allCol };
  (root.RONGQIAO_LATE_CHUNKS = root.RONGQIAO_LATE_CHUNKS || []).push({ id: ID, name: NAME, rect: CHUNK, src: 'js/rongqiao_market3.js', load_m: 40, unload_m: 75 });
  const solids = colliders.filter((c) => c.solid).map((c) => c.rect).concat([CORE_RECT]);
  if (N) for (const r of solids) N.solids.push(r.slice());
  const L = { id: ID, name: NAME, rect: RECT, objects, base, colliders: allCol, lights: L0.lights.map(([x, y, z, r]) => [x + DX, y + DY, z, r]),
    doors: Object.entries(gates).map(([id, g]) => Object.assign({ id }, g)), gates, solids, offset: [DX, DY], podium: [PX0, PY0, PX0 + PW, PY0 + PD], slab: [TX0, TY0, TX0 + TW, TY0 + TD, TOP], towers: TOWERS.map((T) => ({ id: T.k, rect: [T.x0, TY0, T.x0 + TW, TY0 + TD], floors: T.top, top: H1 + 6 + (T.top - 3) * 3 })), garden: [-88.5, 176, -76.5, 185], roofGarden: [PX0, PY0, WX0, 176], play: [WX0, WY0 + WD, PX0 + PW, 176], wing: { rect: [WX0, WY0, WX0 + WW, WY0 + WD], floors: 5, top: ZW }, core: CORE_RECT, door: DOOR, floors: 3 + TF };
  const info = { id: ID, name: NAME, rect: RECT, gates, offset: [DX, DY], removed: removed.length, floors: 3 + TF, ledger: 'ps.wetMarket (same ledger, stalls m3_*)', unconfirmed: true };
  if (N) N.expansionE4e = info;
  const SP = root.SP; if (!SP || !SP.world) { root.RongqiaoMarket3 = { data: L, info }; return; }
  const W = SP.world;
  // roof-garden props stand on the podium roof: they must not leave a footprint on the market floor below (cf. shared_mobility.js)
  if (W.footprints && !W.footprints.m3roof) { const fp0 = W.footprints; W.footprints = function (o) { return o && o.m3roof ? [] : fp0.apply(this, arguments); }; W.footprints.m3roof = true; }
  function sync() {
    const OI = SP.openInterior; if (!OI || W.interior) return false;
    const inWorld = !!(W.chunksIn && W.chunksIn[ID]), reg = !!OI.get(ID);
    if (inWorld && !reg) { OI.register({ id: ID, name: NAME, rect: L.rect, doors: L.doors, lights: L.lights, wallH: 3.6 }); return true; }
    if (!inWorld && reg) { OI.unregister(ID); return true; }
    return false;
  }
  if (SP.chunks) { const CH = SP.chunks, apply0 = CH.apply, drop0 = CH.drop;
    CH.apply = function (c) { const r = apply0.apply(this, arguments); if (c && c.id === ID) sync(); return r; };
    CH.drop = function (c) { const r = drop0.apply(this, arguments); if (c && c.id === ID) sync(); return r; }; }
  const now = () => (SP.clock ? SP.clock.min : 480);
  let phase = null;
  function tick() { const p = M.phaseKey(now()); if (phase !== null && p !== phase && W.chunksIn && W.chunksIn[ID]) { if (SP.layers && SP.layers.reset) SP.layers.reset(); if (SP.env && SP.env.invalidateLights) SP.env.invalidateLights(); } phase = p; }
  if (SP.openInterior) { const OI = SP.openInterior, up0 = OI.update; OI.update = function () { sync(); tick(); return up0.apply(this, arguments); }; }
  const E = SP.env;
  if (E && E.lights) { const lights0 = E.lights; E.lights = function () {
    const out = lights0.apply(this, arguments); if (W.interior || !(W.chunksIn && W.chunksIn[ID])) return out;
    const n = E.night || 0; if (n <= 0.01) return out; const open = M.isOpen(now());
    out.push({ x: 65.5 + DX, y: 99.6 + DY, z: 4.4, r: 3.6, c: [210, 255, 220], a: 0.6 * n, flat: false, refl: true });
    if (open) for (const bx of [48, 51.875, 55.75, 59.625, 67.5, 71.375, 75.25, 79.125]) { out.push({ x: bx + 2 + DX, y: 98.8 + DY, z: 0, r: 3.2, c: [255, 222, 168], a: 0.55 * n, flat: true }); }
    out.push({ x: DOOR[0], y: DOOR[1] - 0.8, z: 2.6, r: 3, c: [255, 240, 210], a: 0.7 * n, flat: false, refl: true });
    return out; }; }
  SP.rongqiaoMarket3 = { data: L, info, sync, tick, get registered() { return !!(SP.openInterior && SP.openInterior.get(ID)); } };
  root.RongqiaoMarket3 = SP.rongqiaoMarket3;
})(typeof window !== 'undefined' ? window : globalThis);
