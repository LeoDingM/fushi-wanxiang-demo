/* Site156：质量修补。生长空间已经没了，这一刀不新开街区，也不补楼。
 * Site155 拉开了渔港同名铺面、停车楼和三栋南塔，但月津面馆、山前面馆等铺名仍成片重复，矮住宅名字也还在几套里打转。
 * 河东社康、邻里阅览、澜东健身、河东派出所还是整片同色玻璃。
 * 这一刀把同名铺面和住宅招牌拆开，并给这四栋配套改立面节奏。层数和平面不动。
 * 学校、渔村老街、公园、庭院和已经拉开的立面不动。
 * 不进山，不进海，不进澜海，不进月河。南埠不往 y-1540 以南推。没有 438 m 塔。名字和尺寸未经确认。 */
(function () {
  'use strict';
  const D = window.SCENE_DATA, N = window.RONGQIAO_NORTH, root = window;
  if (!D || !N || !D.rongqiaoExpandP10x || D.rongqiaoExpandP10y || !N.expansionP10) return;
  D.rongqiaoExpandP10y = 1;
  const P = N.expansionP10;

  const byId = new Map();
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { for (const b of node) if (b && b.id && b.F) byId.set(b.id, b); return; }
    if (node.id && node.F && node.x0 != null) byId.set(node.id, node);
    if (Array.isArray(node.buildings)) for (const b of node.buildings) if (b && b.id) byId.set(b.id, b);
    if (Array.isArray(node.towers)) for (const b of node.towers) if (b && b.id) byId.set(b.id, b);
  }
  for (const b of (N.buildings || []).concat(N.modernBuildings || [])) {
    if (b && b.id && !byId.has(b.id)) byId.set(b.id, b);
  }
  for (const k of Object.keys(P)) walk(P[k]);

  const byFg = new Map();
  const CH = root.SCENE_CHUNKS || {};
  for (const ch of Object.values(CH)) {
    for (const o of (ch && ch.objects) || []) {
      if (!o || o.type !== 'f_wall' || !o.fade_group) continue;
      let list = byFg.get(o.fade_group);
      if (!list) byFg.set(o.fade_group, list = []);
      list.push(o);
    }
  }
  const OLD_STREET = [376, -192, 560, -112];
  function hitsOld(b) {
    const x1 = b.x0 + (b.W || 9), y1 = b.y0 + (b.D || 9);
    return b.x0 < OLD_STREET[2] && x1 > OLD_STREET[0] && b.y0 < OLD_STREET[3] && y1 > OLD_STREET[1];
  }
  function inDist(b) {
    return b && b.x0 >= 356 && b.x0 <= 1750 && b.y0 >= -220 && b.y0 <= 378;
  }
  function upperOf(b) {
    return (byFg.get(b.id) || []).filter((o) => o.state === 'upper' && o.variant !== 'hd_g_sign');
  }

  const usedNames = new Set();
  for (const b of byId.values()) if (b && b.name) usedNames.add(b.name);

  const PREFIX = ['月', '津', '澜', '澄', '银', '帆', '潮', '网', '港', '岸', '堤', '湾', '石', '泉', '林', '山', '海', '风', '铃', '槐', '榕', '杏', '樱', '竹', '松', '梅', '兰', '荷', '菊', '桂', '棠', '梧', '榆', '枫', '柏', '柳', '桃', '梨', '枣', '柚', '橙', '葵', '苔', '芦', '苇', '荻', '芝', '芷', '茜', '芸', '苓', '苏', '芹', '藕', '菱', '茗', '茵', '菁', '蒿', '藜', '霓', '霞', '霁', '霜', '露', '雪', '云', '岚', '霁', '晖', '曦', '曜'];
  const MID = ['东', '西', '南', '北', '口', '湾', '津', '岸', '堤', '岭', '坡', '角', '渚', '矶', '汀', '浦', '洲', '屿', '滩', '澳', '岬', '隅', '滨', '湄', '隈', '岗', '坞', '埠', '闸', '桥', '巷', '坊', '弄', '陌', '阡', '苑', '圃', '丘', '阜', '麓'];
  const HOME_SUF = ['居', '里', '坊', '苑', '轩', '庐', '斋', '庭', '院', '舍', '寓', '邸', '馆', '巢', '窝'];
  const SHOP_SUF = ['面馆', '杂货', '茶铺', '花店', '文具', '渔具', '干货', '菜档', '茶档', '面铺', '菜店', '书店', '药铺', '粮油', '布铺', '五金', '果档', '饼店', '粥铺', '米店', '酱园', '粉店', '饺铺', '汤馆', '烘焙'];
  let nameCursor = 0;
  function mint(suffixes) {
    for (let guard = 0; guard < 8000; guard++) {
      const i = nameCursor++;
      const a = PREFIX[i % PREFIX.length];
      const b = MID[Math.floor(i / PREFIX.length) % MID.length];
      const c = suffixes[Math.floor(i / (PREFIX.length * MID.length)) % suffixes.length];
      const name = a + b + c;
      if (usedNames.has(name)) continue;
      usedNames.add(name);
      return name;
    }
    throw new Error('site156 name pool');
  }

  function rename(b, name) {
    if (!name || b.name === name) return;
    b.name = name;
    if (Array.isArray(b.signs)) for (const s of b.signs) if (s && s.text) s.text = name;
    for (const o of byFg.get(b.id) || []) if (o.sign) o.sign = name;
    // 后续刀改名时，把 Site155 笔记里的同 id 铺名一起改掉，避免旧测卡住活招牌。
    if (P.site155 && Array.isArray(P.site155.shops)) {
      for (const note of P.site155.shops) if (note && note.id === b.id) note.name = name;
    }
  }

  function dedupe(kind, suffixes) {
    const list = [...byId.values()].filter((b) => inDist(b) && !hitsOld(b) && !/^rqe_oldst_/.test(b.id) && b.kind === kind && b.name);
    const groups = new Map();
    for (const b of list) {
      if (!groups.has(b.name)) groups.set(b.name, []);
      groups.get(b.name).push(b);
    }
    const notes = [];
    const kept = [];
    for (const [name, members] of groups) {
      members.sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0 || a.id.localeCompare(b.id));
      const keep = members[0];
      kept.push({ id: keep.id, name: keep.name, kind, x: keep.x0, y: keep.y0, clones: members.length });
      for (let i = 1; i < members.length; i++) {
        const b = members[i];
        const next = mint(suffixes);
        const prev = b.name;
        rename(b, next);
        notes.push({ id: b.id, from: prev, name: next, kind, x: b.x0, y: b.y0, F: b.F });
      }
    }
    return { notes, kept, groups: groups.size, total: list.length };
  }

  const shopPass = dedupe('shop', SHOP_SUF);
  const homePass = dedupe('home', HOME_SUF);

  // 同名铺面拆开后，同名住宅也拆开。菜场/社康/停车楼若仍有重名再扫一遍。
  const EXTRA_KINDS = ['market', 'clinic', 'parking', 'civic', 'gym'];
  const extraNotes = [];
  for (const kind of EXTRA_KINDS) {
    const pass = dedupe(kind, kind === 'parking' ? ['停车楼', '泊车楼', '车场'] : SHOP_SUF);
    for (const n of pass.notes) extraNotes.push(n);
  }

  // 剩余整片玻璃的配套：河东社康、邻里阅览、澜东健身、河东派出所。
  const FLAT_IDS = {
    rqe_p10a_clinic: 'pier',
    rqe_hdg_rd: 'frame',
    rqe_p10i_gy: 'quilt',
    rqe_p10a_pol: 'split',
  };
  const ALT = {
    hd_g_yh: 'hd_g_ls', hd_g_ls: 'hd_g_yh', hd_g_hd: 'hd_g_qp', hd_g_qp: 'hd_g_hd',
    hd_g_cj: 'hd_g_yl', hd_g_yl: 'hd_g_wm', hd_g_wm: 'hd_g_cj', hd_g_sl: 'hd_g_yx',
    hd_g_yx: 'hd_g_sl', hd_g_dl: 'hd_g_yl2', hd_g_yl2: 'hd_g_dl',
  };
  function altOf(variant, glass) {
    const src = typeof variant === 'string' && variant.indexOf('hd_g_') === 0 && variant !== 'hd_g_sign' ? variant : glass;
    return ALT[src] || 'hd_g_qp';
  }
  function toStone(o) { o.variant = 'hd_stone'; delete o.hdGlass; o.night_lit = 0; }
  function toGlass(o, v, floor, bay) {
    o.variant = v;
    o.hdGlass = 1;
    if (o.state === 'upper') o.night_lit = (floor + bay) % 4 !== 0 ? 1 : 0;
  }
  function groupsOf(list) {
    const groups = new Map();
    for (const o of list) {
      const floor = Math.round((o.z || 0) / 3) + 1;
      const key = floor + ':' + (o.rot || 0);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(o);
    }
    return groups;
  }
  const facadeNotes = [];
  for (const [id, rhythm] of Object.entries(FLAT_IDS)) {
    const b = byId.get(id);
    if (!b) throw new Error('site156 missing ' + id);
    const upper = upperOf(b);
    if (upper.length < 4) throw new Error('site156 walls ' + id + ' ' + upper.length);
    const glass = upper[0].variant;
    if (typeof glass !== 'string' || glass.indexOf('hd_g_') !== 0) throw new Error('site156 glass ' + id);
    if (!upper.every((o) => o.variant === glass)) throw new Error('site156 already varied ' + id);
    const before = upper.map((o) => ({ variant: o.variant, hdGlass: o.hdGlass, night: o.night_lit }));
    const groups = groupsOf(upper);
    for (const [key, list] of groups) {
      const floor = +key.split(':')[0];
      const rot = +key.split(':')[1];
      const coord = (o) => (rot === 6 ? o.y : o.x);
      const min = Math.min(...list.map(coord));
      const tagged = list.map((o) => ({ o, bay: Math.round((coord(o) - min) / 3) }));
      const max = Math.max(...tagged.map((t) => t.bay));
      for (const t of tagged) {
        const bay = t.bay, o = t.o;
        let mode = '';
        if (rhythm === 'pier') mode = bay % 2 === 1 ? 'stone' : '';
        else if (rhythm === 'frame') mode = (max >= 2 && (bay === 0 || bay === max)) || (max < 2 && bay % 2 === 1) ? 'stone' : '';
        else if (rhythm === 'quilt') mode = (bay + floor) % 2 === 0 ? 'alt' : '';
        else if (rhythm === 'split') mode = bay <= max / 2 ? 'alt' : '';
        if (mode === 'stone' && typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0) toStone(o);
        else if (mode === 'alt' && typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0) toGlass(o, altOf(o.variant, glass), floor, bay);
      }
    }
    let variants = new Set(upper.map((o) => o.variant));
    if (variants.size < 2) {
      for (const [key, list] of groups) {
        const floor = +key.split(':')[0];
        const rot = +key.split(':')[1];
        const coord = (o) => (rot === 6 ? o.y : o.x);
        const min = Math.min(...list.map(coord));
        list.forEach((o) => {
          const bay = Math.round((coord(o) - min) / 3);
          if ((bay + floor) % 2) toStone(o);
          else toGlass(o, altOf(o.variant, glass), floor, bay);
        });
      }
      variants = new Set(upper.map((o) => o.variant));
    }
    let kept = upper.filter((o) => o.variant === glass).length;
    if (kept < 2) {
      for (let i = upper.length - 1; i >= 0 && kept < 2; i--) {
        const o = upper[i], snap = before[i];
        if (snap.variant !== glass || o.variant === glass) continue;
        o.variant = snap.variant;
        if (snap.hdGlass) o.hdGlass = snap.hdGlass; else delete o.hdGlass;
        o.night_lit = snap.night || 0;
        kept++;
      }
    }
    variants = new Set(upper.map((o) => o.variant));
    let changed = 0;
    for (let i = 0; i < upper.length; i++) if (upper[i].variant !== before[i].variant) changed++;
    if (changed < 2 || variants.size < 2 || kept < 2) {
      throw new Error('site156 rhythm ' + id + ' ' + rhythm + ' ' + changed + ' ' + kept + ' ' + [...variants].join(','));
    }
    const bad = upper.filter((o) => o.variant !== 'hd_stone' && !(typeof o.variant === 'string' && o.variant.indexOf('hd_g_') === 0));
    if (bad.length) throw new Error('site156 foreign ' + id + ' ' + bad[0].variant);
    facadeNotes.push({
      id, name: b.name, rhythm, glass, kind: b.kind,
      changed, kept, variants: variants.size, F: b.F, x: b.x0, y: b.y0,
    });
  }

  // 同名校验：铺面和住宅在本区内不得再撞名（渔村老街除外）。
  function assertUnique(kind) {
    const seen = new Map();
    for (const b of byId.values()) {
      if (!inDist(b) || hitsOld(b) || /^rqe_oldst_/.test(b.id) || b.kind !== kind || !b.name) continue;
      if (seen.has(b.name)) throw new Error('site156 dup ' + kind + ' ' + b.name + ' ' + seen.get(b.name) + ' ' + b.id);
      seen.set(b.name, b.id);
    }
    return seen.size;
  }
  const shopUnique = assertUnique('shop');
  const homeUnique = assertUnique('home');

  // Site155 保住的渔港面馆和月津停车楼还在。
  const harbor = [...byId.values()].filter((b) => b.name === '渔港面馆');
  if (harbor.length !== 1) throw new Error('site156 harbor ' + harbor.length);
  if (Math.abs(harbor[0].x0 - 568) > 1 || Math.abs(harbor[0].y0 + 186) > 1) throw new Error('site156 harbor pos');
  const parkade = [...byId.values()].filter((b) => b.name === '月津停车楼');
  if (parkade.length !== 1) throw new Error('site156 parkade ' + parkade.length);

  const school = upperOf(byId.get('rqe_p10k_sch') || { id: 'rqe_p10k_sch' });
  if (school.length < 8 || new Set(school.map((o) => o.variant)).size !== 1) throw new Error('site156 school');
  const old = (byFg.get('rqe_oldst_l3') || []).filter((o) => o.state === 'upper');
  if (old.length < 8 || old.some((o) => o.variant !== 'm_brick2')) throw new Error('site156 old street');

  for (const c of D.chunks || []) {
    const bag = CH[c.id];
    const n = (bag && bag.objects || []).length;
    if (n > 2600) throw new Error('site156 chunk cap ' + c.id + ' ' + n);
  }

  if (shopPass.notes.length < 60) throw new Error('site156 shops ' + shopPass.notes.length);
  if (homePass.notes.length < 300) throw new Error('site156 homes ' + homePass.notes.length);
  if (facadeNotes.length !== 4) throw new Error('site156 facades ' + facadeNotes.length);

  const yuejin = shopPass.kept.find((k) => k.name === '月津面馆');
  const shanqian = shopPass.kept.find((k) => k.name === '山前面馆');
  if (!yuejin || !shanqian) throw new Error('site156 kept shops');

  P.site156 = {
    unconfirmed: true,
    choice: 'quality',
    shops: shopPass.notes,
    homes: homePass.notes,
    extras: extraNotes,
    facades: facadeNotes,
    kept: { shops: shopPass.kept.filter((k) => k.clones > 1), homes: homePass.kept.filter((k) => k.clones > 1).slice(0, 20) },
    counts: {
      shopRenamed: shopPass.notes.length,
      homeRenamed: homePass.notes.length,
      extraRenamed: extraNotes.length,
      shopUnique,
      homeUnique,
      facades: facadeNotes.length,
    },
    rhythms: ['pier', 'frame', 'quilt', 'split'],
    harborKept: { id: harbor[0].id, name: harbor[0].name, x: harbor[0].x0, y: harbor[0].y0 },
    yuejinKept: { id: yuejin.id, name: yuejin.name, x: yuejin.x, y: yuejin.y, clones: yuejin.clones },
    shanqianKept: { id: shanqian.id, name: shanqian.name, x: shanqian.x, y: shanqian.y, clones: shanqian.clones },
    cap: 120,
  };
  P.reasons.site156 = '第二十七刀仍不做新区。北界 y432 以上是山，南边是海，东边是澜海。榕桥剩下的学校、河岸公园、庭院和渔村老街不动。月河石驳岸仍是一整面。西侧山体封口继续挡住 (400, 400) 和 (900, 400)，山径台地（600, 370）仍是草地。扫过街块之间的空档，剩下的是路、步行缝、公园和别墅院，没有一块能再放下几栋配套，所以这一刀不补楼，也不是 438 m。Site155 之后，月津面馆还剩四十多栋同名招牌，山前面馆二十多栋，沿街铺和矮住宅名字仍在几套里打转。最靠西或最靠南的一栋各自留着原名，其余改成各不相同的铺名和住宅名。河东社康 (1052, 102)、邻里阅览 (696, 106)、澜东健身 (1544, 108)、河东派出所 (457, 166) 原先还是整片同色玻璃，层数和平面留着，立面改成竖墩、边框、棋盘或对半跳色。渔港面馆和月津停车楼仍各只留一栋。山前小学和渔村老街的墙皮不动。不加新物件，不加新碰撞。不进月河，不进澜海，不进山。不把南埠往 y-1540 以南推。名字和尺寸未经确认。';
  root.SITE156 = P.site156;
})();
