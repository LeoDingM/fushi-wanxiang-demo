/* Explicit, portable progress snapshots for the 45-degree street game. */
(function (SP) {
  "use strict";
  if (!SP || !SP.game || !SP.world || !SP.place || !SP.clock) return;
  if (SP.progressSave && SP.progressSave.installed) return;
  const G = SP.game, W = SP.world, PL = SP.place, C = SP.clock, CH = SP.chunks;
  const PS = (SP.progressSave = {});
  PS.installed = true;
  const MAX_CHUNK_STATES = 120;
  PS.maxChunkStates = MAX_CHUNK_STATES;
  const KEY = "fushi-wanxiang.progress.v2", LEGACY_KEY = "fushi-wanxiang.progress.v1";
  const FORMAT = "fushi-progress", VERSION = 3, CONTENT_VERSION = "I18";
  // Capture and import must accept the same bounded portable record.
  const MAX_RECORD_CHARS = 5_000_000;
  const SIZE_ERROR = "存档数据过大（最多 500 万字符），本次操作未完成，原有本机存档未覆盖。请先在「人生档案」导出完整事件 JSON 留存；不会自动裁剪事实记录。";
  // Provenance: released I3 ZIP (SHA-256 71dbf8fc1f2fca0f6142f5c4acb40ac677871c4f1cc8e99990bda47bc3608904).
  // The v1 signature is accepted only when I3 objects remain an unchanged
  // prefix, earlier chunk rectangles have only expanded, and I3 scenes remain.
  const I3_CONTRACT = Object.freeze({ objectCount: 1647, objectsHash: "82f6e46c", chunkCount: 2,
    chunksHash: "c04ae819", chunks: [["east", [46.5, -40, 96, 64]], ["community_east", [94, 0, 128, 34]]],
    scenes: ["community_reading_room", "community_workspace_room", "neighborhood_services",
      "roof", "room_2f02", "stair_1f", "stair_2f", "stair_3f", "stair_4f", "stair_5f", "stair_6f",
      "store_24", "store_24_staff"], roofRect: [-5.7, 13.3, 8.7, 24.7] });
  const LEGACY_SIGNATURES = Object.freeze({ f6e37be9: I3_CONTRACT });
  const WEATHER = new Set(["clear", "rain", "snow", "fog"]);
  const DIR = new Set(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]);
  const CLOCK_KEYS = ["day", "min", "scale", "weather", "target", "intensity", "tInt", "wet", "snow", "fog", "manualDay", "wind"];
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const obj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
  const finite = (v, lo, hi) => typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const checksum = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0).toString(16).padStart(8, "0"); };
  const objectIdentity = (o) => [o.id, o.type, o.x, o.y, o.state];
  const chunkIdentity = (c) => [c.id, c.rect];
  const worldSignature = () => checksum(JSON.stringify({
    ids: (window.SCENE_DATA.objects || []).map(objectIdentity),
    chunks: (window.SCENE_DATA.chunks || []).map(chunkIdentity), scenes: Object.keys(SP.scenes).sort()
  }));
  const worldContract = () => ({ objectCount: window.SCENE_DATA.objects.length,
    objectsHash: checksum(JSON.stringify(window.SCENE_DATA.objects.map(objectIdentity))),
    chunkCount: window.SCENE_DATA.chunks.length,
    chunks: window.SCENE_DATA.chunks.map(chunkIdentity),
    chunksHash: checksum(JSON.stringify(window.SCENE_DATA.chunks.map(chunkIdentity))),
    scenes: Object.keys(SP.scenes).sort(), roofRect: window.SCENE_DATA.roof.rect.slice() });
  function additiveWorldMatches(contract) {
    const D = window.SCENE_DATA;
    if (!obj(contract) || !Number.isSafeInteger(contract.objectCount) || contract.objectCount < 1 ||
        contract.objectCount > D.objects.length || !Number.isSafeInteger(contract.chunkCount) ||
        contract.chunkCount < 0 || contract.chunkCount > D.chunks.length ||
        !/^[0-9a-f]{8}$/.test(contract.objectsHash || "") || !/^[0-9a-f]{8}$/.test(contract.chunksHash || "") ||
        !Array.isArray(contract.chunks) || contract.chunks.length !== contract.chunkCount ||
        !Array.isArray(contract.scenes) || !Array.isArray(contract.roofRect) || contract.roofRect.length !== 4) return false;
    const currentScenes = new Set(Object.keys(SP.scenes));
    return checksum(JSON.stringify(D.objects.slice(0, contract.objectCount).map(objectIdentity))) === contract.objectsHash &&
      checksum(JSON.stringify(contract.chunks)) === contract.chunksHash &&
      contract.chunks.every(([id, rect], i) => {
        const next = D.chunks[i];
        return next && next.id === id && Array.isArray(rect) && rect.length === 4 &&
          rect.every((n) => typeof n === "number" && Number.isFinite(n)) &&
          next.rect[0] <= rect[0] && next.rect[1] <= rect[1] &&
          next.rect[2] >= rect[2] && next.rect[3] >= rect[3];
      }) &&
      contract.scenes.every((id) => typeof id === "string" && currentScenes.has(id)) &&
      JSON.stringify(contract.roofRect) === JSON.stringify(D.roof.rect);
  }
  function signatureForContract(contract) {
    const D = window.SCENE_DATA;
    return checksum(JSON.stringify({ ids: D.objects.slice(0, contract.objectCount).map(objectIdentity),
      chunks: contract.chunks, scenes: contract.scenes }));
  }
  const error = (reason) => ({ ok: false, reason });
  const success = (extra) => Object.assign({ ok: true }, extra || {});
  PS.key = KEY; PS.legacyKey = LEGACY_KEY; PS.version = VERSION;

  // Chunk streaming keeps its own private unload memo. Mirror only changed states
  // so a parcel, gate or shutter survives saving while its district is off-screen.
  let chunkStates = {};
  const baseSources = new Map((window.SCENE_DATA.objects || []).map((o) => [o.id, o]));
  const chunkSources = new Map();
  function sourceState(o) {
    let sources = baseSources;
    if (o._chunk) {
      sources = chunkSources.get(o._chunk);
      if (!sources) {
        const data = window.SCENE_CHUNKS && window.SCENE_CHUNKS[o._chunk];
        sources = new Map(((data && data.objects) || []).map((q) => [q.id, q]));
        chunkSources.set(o._chunk, sources);
      }
    }
    const src = sources.get(o.id);
    return src && (src.state || (SP.K.pieces[src.type] && SP.K.pieces[src.type].states[0]));
  }
  // Reuse the environment's source-reference cache; only tracked objects need clocks.
  PS.environmentSourceStates = function (payload) {
    const catalog = SP.environmentState?.catalog?.();
    if (!catalog) throw new Error("环境场景目录尚未准备好。");
    const all = {};
    for (const [scene, rows] of Object.entries(catalog)) for (const [id, c] of Object.entries(rows)) {
      const overrides = scene !== "street" ? payload.interiors?.[scene] : c.chunk ? payload.chunks?.[c.chunk] : payload.street;
      (all[scene] || (all[scene] = {}))[id] = own(overrides || {}, id) ? overrides[id] : c.source.state || c.states[0];
    }
    return all;
  };
  function changed(o, into) {
    if (!o || !o.id || o._sharedHomeFixture || typeof o.state !== "string") return;
    const base = sourceState(o);
    // New fleet meshes have their own extension; original bikes retain damage state.
    if (o._sharedMobility && base == null) return;
    if (base == null || o.state !== base) into[o.id] = o.state;
    else delete into[o.id];
  }
  function applyStates(objects, states) {
    let n = 0;
    for (const o of objects) if (own(states, o.id) && o.state !== states[o.id]) { o.state = states[o.id]; n++; }
    if (n) {
      W.rebuildColliders(); W.groundDirty = true;
      if (SP.env && SP.env.invalidateLights) SP.env.invalidateLights();
      if (SP.layers && SP.layers.reset) SP.layers.reset();
    }
  }
  function applyChunkStates(id) {
    // The streaming module also keeps a private unload memo. A newly loaded
    // save must override that memo even when the saved object is at its default.
    const states = chunkStates[id] || {}, objects = W.objects.filter((o) => o._chunk === id);
    let n = 0;
    for (const o of objects) {
      const next = own(states, o.id) ? states[o.id] : sourceState(o);
      if (next && o.state !== next) { o.state = next; n++; }
    }
    if (n) {
      W.groundDirty = true;
      if (SP.chunks && SP.chunks.deferRebuild && SP.chunks.deferRebuild()) return;      // perf: inside a chunk batch -> its single rebuild
      W.rebuildColliders();
      if (SP.env && SP.env.invalidateLights) SP.env.invalidateLights();
      if (SP.layers && SP.layers.reset) SP.layers.reset();
    }
  }
  if (CH && CH.drop && CH.apply) {
    const drop0 = CH.drop, apply0 = CH.apply;
    CH.drop = function (c) {
      if (W.chunksIn && W.chunksIn[c.id]) {
        const m = chunkStates[c.id] || (chunkStates[c.id] = {});
        for (const o of W.objects) if (o._chunk === c.id) changed(o, m);
      }
      return drop0.call(CH, c);
    };
    CH.apply = function (c) {
      const added = apply0.call(CH, c);
      if (added) applyChunkStates(c.id);
      return added;
    };
  }

  function sourceLoadingReason() {
    return (window.SCENE_DATA.chunks || []).some(c => !Array.isArray(window.SCENE_CHUNKS?.[c.id]?.objects))
      ? "街区资料仍在加载，请稍后重试。" : null;
  }
  function guard() {
    if (!G.ps || !SP.player || !W.data) return "游戏尚未准备好。";
    const loading = sourceLoadingReason(); if (loading) return loading;
    if (SP.metroActive || (SP.cbd && SP.cbd.active)) return "请先离开地铁或商务区，再保存或读取街区进度。";
    if (G.busy() || C.ff) return "当前动作或场景切换尚未完成，请稍候。";
    if (SP.storePayroll?.canSave?.() === false) return "工资正在结算，请稍后保存或读取进度。";
    if (SP.phoneAI?.isPending()) return "API 回复尚未完成，请稍后保存或读档。";
    if (SP.player.carry) return "请先停好单车，再保存或读取进度。";
    return null;
  }
  function stripSharedHomeFixtures(states) { if (SP.sharedHome?.isFixtureId) for (const id of Object.keys(states || {})) if (SP.sharedHome.isFixtureId(id)) delete states[id]; return states; }
  function interiorStates() {
    const all = clone(PL.istate || {});
    if (W.interior) all[W.sceneId] = clone(PL.stateOf(W.sceneId));
    for (const states of Object.values(all)) stripSharedHomeFixtures(states);
    return all;
  }
  function streetStates() {
    const source = W.interior ? PL.street && PL.street.objects : W.objects;
    if (!source) throw new Error("街区状态尚未准备好");
    const base = {}, chunks = clone(chunkStates);
    for (const o of source) {
      if (o._chunk) changed(o, chunks[o._chunk] || (chunks[o._chunk] = {}));
      else changed(o, base);
    }
    return { base, chunks };
  }
  function clockState() {
    const result = {}; for (const k of CLOCK_KEYS) result[k] = C[k]; return result;
  }
  function capturePayload() {
    const s = streetStates(), scene = PL.where(), P = SP.player, interiors = interiorStates();
    const ps = G.rules.load(G.rules.serialize(G.ps));
    if (SP.socialEncountersSave) ps.socialEncounters = SP.socialEncountersSave.captureState(ps, C.abs());
    if (!SP.socialAppointmentsSave) throw new Error("预约存档模块尚未准备好，暂不能保存当前进度");
    ps.socialAppointments = SP.socialAppointmentsSave.captureState(ps, C.abs());
    if (!SP.socialExchangeSave) throw new Error("赠借存档模块尚未准备好，暂不能保存当前进度");
    ps.socialExchange = SP.socialExchangeSave.captureState(ps, C.abs());
    if (!SP.cityIncidentsSave) throw new Error("城市现场存档模块尚未准备好，暂不能保存当前进度");
    ps.cityIncidents = SP.cityIncidentsSave.captureState(ps, C.abs());
    if (!SP.livingCitySave) throw new Error("城市日常存档模块尚未准备好，暂不能保存当前进度");
    Object.assign(ps, SP.livingCitySave.captureState(ps, C.abs(), { street: s.base, chunks: s.chunks, interiors }));
    if (!SP.socialRetrospectionSave) throw new Error("社会回溯存档模块尚未准备好");
    ps.socialRetrospection = SP.socialRetrospectionSave.captureState(ps, C.abs());
    if (!SP.mediaNewsSave) throw new Error("公开资讯存档模块尚未准备好");
    ps.mediaNews = SP.mediaNewsSave.captureState(ps, C.abs());
    if (!SP.heardNotesSave) throw new Error("私人听闻存档模块尚未准备好");
    ps.heardNotes = SP.heardNotesSave.captureState(ps, C.abs());
    if (!SP.leaseTalkSave) throw new Error("租住转述存档模块尚未准备好");
    ps.leaseTalk = SP.leaseTalkSave.captureState(ps, C.abs());
    if (!SP.workTalkSave) throw new Error("工作陈述存档模块尚未准备好");
    ps.workTalk = SP.workTalkSave.captureState(ps, C.abs());
    if (!SP.fixtureTalkSave) throw new Error("门灯所见陈述存档尚未准备好");
    ps.fixtureTalk = SP.fixtureTalkSave.captureState(ps, C.abs());
    if (!SP.socialFlowSave) throw new Error("街坊消息存档尚未准备好");
    ps.socialFlow = SP.socialFlowSave.captureState(ps, C.abs());
    if (!SP.animalsSave) throw Error("动物存档尚未准备好");
    ps.animals = SP.animalsSave.captureState(ps, C.abs());
    if (!SP.neighborDaySave) throw new Error("邻居日程存档模块尚未准备好");
    ps.neighborDay = SP.neighborDaySave.captureState(ps, C.abs());
    if (!SP.vendorDaySave) throw new Error("王阿姨日程存档模块尚未准备好");
    ps.vendorDay = SP.vendorDaySave.captureState(ps, C.abs());
    if (!SP.routineWorkSave) throw new Error("作息工作存档模块尚未准备好");
    ps.routineWork = SP.routineWorkSave.captureState(ps, C.abs());
    if (SP.employmentSave) ps.employment = SP.employmentSave.captureState(ps, C.abs());
    else if (ps.employment) throw Error("岗位模块未准备好");
    if (SP.householdSave) ps.household = SP.householdSave.captureState(ps, C.abs());
    else if (ps.household) throw Error("家庭账本模块未准备好");
    if (SP.playerWorkSave) ps.playerWork = SP.playerWorkSave.captureState(ps, C.abs());
    if (SP.commerceSave) ps.commerce = SP.commerceSave.captureState(ps, C.abs());
    else if (ps.commerce) throw Error("外卖网购模块未准备好");
    if (SP.wetMarketSave) ps.wetMarket = SP.wetMarketSave.captureState(ps, C.abs());
    else if (ps.wetMarket) throw Error("菜市场模块未准备好");
    else if (ps.playerWork) throw Error("雇佣记录模块未准备好");
    if (!SP.residentMemorySave) throw new Error("本人经验记忆存档未准备好");
    ps.residentMemory = SP.residentMemorySave.captureState(ps, C.abs());
    if (!SP.streetParkingSave) throw new Error("停车存档模块尚未准备好，暂不能保存当前进度");
    ps.streetParking = SP.streetParkingSave.captureState(ps, C.abs());
    if (!own(ps, "canteenSupply")) ps.canteenSupply = window.CanteenSupply.fresh(C.abs());
    if (!window.CanteenSupply.validate(ps.canteenSupply, C.abs())) throw new Error("食堂供货账目无效");
    window.CanteenSupply.advance(ps.canteenSupply, C.abs());
    if (!own(ps, "npcConflict")) ps.npcConflict = window.NpcConflictModel.fresh();
    if (!own(ps, "lifeChronicle")) ps.lifeChronicle = window.LifeChronicleModel.fresh(C.abs(), ps);
    ps.phoneApi = SP.phoneAI.captureState();
    if (!window.NpcConflictModel.validate(ps.npcConflict, C.abs()) ||
        !window.LifeChronicleModel.validate(ps.lifeChronicle, C.abs())) throw new Error("治安或人生记录无效");
    if ((ps.npcConflict.player.health === 0) !== !!ps.lifeChronicle.death) throw new Error("死亡状态与人生档案不一致");
    if (!SP.phoneAI.validateState(ps.phoneApi)) throw new Error("存档中的 API 设置无效");
    return { worldSignature: worldSignature(), worldContract: worldContract(), extensions: { socialExchange: 1, cityIncidents: 1, sharedMobility: 1, npcDailyLife: 1, mobilityOperations: 1, neighborhoodStore: 1, environmentState: 1, storeSupply: 1, sharedHome: 1, socialRetrospection: 1, mediaNews: 1, heardNotes: 1, leaseTalk: 1, workTalk: 1, fixtureTalk: 1, socialFlow: 1, animals: 1, neighborDay: 1, vendorDay: 1, routineWork: 1, residentMemory: 1, ...(SP.employmentSave ? {employment: 1} : {}), ...(SP.householdSave ? {household: 1} : {}), ...(SP.playerWorkSave ? {playerWork: 1} : {}), ...(SP.commerceSave ? {commerce: 1} : {}), ...(SP.wetMarketSave ? {wetMarket: 1} : {}) }, ps, clock: clockState(),
      location: { scene, x: P.x, y: P.y, dir: P.dir }, interiors, street: s.base, chunks: s.chunks };
  }
  PS.capture = function () {
    const blocked = guard(); if (blocked) return error(blocked);
    try {
      const payload = capturePayload();
      // Only the portable snapshot is encoded. The live archive and rollback
      // snapshot retain authoritative v1 event objects throughout gameplay.
      if (!window.ChronicleArchiveCodec) throw new Error("人生归档模块尚未准备好");
      payload.ps.lifeChronicle = window.ChronicleArchiveCodec.encode(payload.ps.lifeChronicle, C.abs());
      // Keep complete flat receipts in live state and rollback snapshots; encode only the portable copy.
      if (!window.SharedHomeModel?.encode) throw new Error("住房归档模块尚未准备好");
      payload.ps.sharedHome.ledger = window.SharedHomeModel.encode(payload.ps.sharedHome.ledger, C.abs());
      if (!payload.ps.sharedHome.ledger) throw new Error("住房归档编码失败");
      if (!SP.npcDailyLife?.encode) throw new Error("居民个人账本归档模块尚未准备好");
      payload.ps.npcDailyLife = SP.npcDailyLife.encode(payload.ps.npcDailyLife, C.abs());
      if (!payload.ps.npcDailyLife) throw new Error("居民个人账本归档编码失败");
      const raw = JSON.stringify(payload);
      const record = { format: FORMAT, version: VERSION, schemaVersion: VERSION, contentVersion: CONTENT_VERSION,
        savedAt: new Date().toISOString(), checksum: checksum(raw), payload };
      const text = JSON.stringify(record);
      if (text.length > MAX_RECORD_CHARS) return error(SIZE_ERROR);
      return success({ text, record });
    } catch (e) { return error(`保存失败：${e.message}`); }
  };

  function validateStates(m, label) {
    if (!obj(m) || Object.keys(m).length > 30000) throw new Error(`${label}格式无效`);
    for (const [id, state] of Object.entries(m))
      if (!id || id.length > 120 || typeof state !== "string" || !/^[a-zA-Z0-9_.-]{1,64}$/.test(state)) throw new Error(`${label}包含无效对象状态`);
  }
  const optionalTime = (value) => value === null || finite(value, 0, 1e12);
  function validateCommunityProgress(ps, contentVersion, clock) {
    // I11/I12 modules are optional on older saves. Validate present data before
    // commit; a missing module must not silently accept an unvalidated field.
    for (const [field, module, label] of [
      ["communityPolice", SP.communityPolice, "报案"],
      ["communityBarber", SP.communityBarber, "理发"],
      ["clinicMedication", SP.clinicMedication, "健康打卡"],
      ["housingLeases", SP.housingLeases, "现代租房合同"]
    ]) if (own(ps, field) && (!module || typeof module.validate !== "function" || !module.validate(ps[field])))
      throw new Error(`${label}记录无效`);
    if (ps.communityLibrary != null) {
      const library = ps.communityLibrary;
      const books = new Set(["city_walks", "garden_notes", "riverside_stories"]);
      const loan = library && library.loan;
      if (!obj(library) || Object.keys(library).some((k) => !["loan", "returns", "completedBooks", "lastBorrowDay"].includes(k)) ||
          !(loan === null || (obj(loan) && Object.keys(loan).every((k) => ["bookId", "borrowedAt", "dueAt", "readMinutes"].includes(k)) &&
            books.has(loan.bookId) && finite(loan.borrowedAt, 0, 1e12) && finite(loan.dueAt, 0, 1e12) &&
            loan.dueAt === loan.borrowedAt + 10080 && Number.isSafeInteger(loan.readMinutes) && loan.readMinutes >= 0 && loan.readMinutes <= 60)) ||
          !Number.isSafeInteger(library.returns) || library.returns < 0 ||
          !Array.isArray(library.completedBooks) || library.completedBooks.length > books.size ||
          !library.completedBooks.every((id) => books.has(id)) || new Set(library.completedBooks).size !== library.completedBooks.length ||
          !Number.isSafeInteger(library.lastBorrowDay) || library.lastBorrowDay < -1)
        throw new Error("阅览室借阅数据无效");
      const bookItems = Object.entries(ps.items).filter(([id, count]) => id.startsWith("book_") && count > 0);
      if (bookItems.some(([id]) => !books.has(id.slice(5))) ||
          (loan === null ? bookItems.length !== 0 :
            (bookItems.length !== 1 || bookItems[0][0] !== `book_${loan.bookId}` || bookItems[0][1] !== 1)))
        throw new Error("借阅记录与背包书籍不匹配");
    }
    // Shared reading was added in I6. Older saves may lack the day marker;
    // the migrated default keeps the first session available immediately.
    if (ps.communitySocial != null && ["I4", "I5"].includes(contentVersion) &&
        obj(ps.communitySocial.lin) && !own(ps.communitySocial.lin, "lastSharedDay"))
      ps.communitySocial.lin.lastSharedDay = -1;
    if (ps.communitySocial != null) {
      const all = ps.communitySocial, lin = all && all.lin;
      if (!obj(all) || Object.keys(all).some((k) => k !== "lin") || !obj(lin) ||
          Object.keys(lin).some((k) => !["familiarity", "lastGreetingDay", "greetings", "lastSharedDay"].includes(k)) ||
          !Number.isSafeInteger(lin.familiarity) || lin.familiarity < 0 || lin.familiarity > 100 ||
          !Number.isSafeInteger(lin.lastGreetingDay) || lin.lastGreetingDay < -1 ||
          !Number.isSafeInteger(lin.greetings) || lin.greetings < 0 ||
          (["I6", "I7", "I8", "I9", "I10", "I11", "I12", "I13", "I14", "I15", "I16", "I17", CONTENT_VERSION].includes(contentVersion) && !Number.isSafeInteger(lin.lastSharedDay)) ||
          (own(lin, "lastSharedDay") && (!Number.isSafeInteger(lin.lastSharedDay) || lin.lastSharedDay < -1)))
        throw new Error("街坊社交数据无效");
    }
    if (ps.communityWork != null) {
      const w = ps.communityWork;
      if (!obj(w) || !["idle", "accepted", "working", "ready", "completed", "cancelled"].includes(w.status) ||
          !optionalTime(w.acceptedDay) || !optionalTime(w.acceptedAt) || !optionalTime(w.startedAt) ||
          !optionalTime(w.finishAt) || !Number.isSafeInteger(w.completed) || w.completed < 0 ||
          !finite(w.earnedTotal, 0, 1e12)) throw new Error("共享办公任务数据无效");
    }
    if (ps.communityLostFound != null) {
      const s = ps.communityLostFound, c = s && s.case;
      if (!obj(s) || typeof s.found !== "boolean" || !optionalTime(s.foundAt) ||
          !Number.isSafeInteger(s.reputation) || s.reputation < 0 || !Number.isSafeInteger(s.closedCases) ||
          s.closedCases < 0 || !(c === null || (obj(c) && typeof c.receipt === "string" && c.receipt.length <= 80 &&
            ["pending", "closed"].includes(c.status) && finite(c.filedAt, 0, 1e12) &&
            finite(c.handoverAt, 0, 1e12) && (c.closedAt == null || finite(c.closedAt, 0, 1e12)) &&
            typeof c.claimChecked === "boolean" && typeof c.rewarded === "boolean")))
        throw new Error("失物登记数据无效");
    }
    if (ps.communityRoutines != null) {
      const all = ps.communityRoutines, lin = all && all.lin;
      if (!obj(all) || Object.keys(all).length > 20) throw new Error("街坊日常数据无效");
      if (lin != null) {
        if (!obj(lin)) throw new Error("街坊日常数据无效");
        const allowed = new Set(["x", "y", "node", "path", "phase", "hidden", "lastAbs", "scene"]);
        if (Object.keys(lin).some((k) => !allowed.has(k))) throw new Error("街坊日常数据无效");
        // I4 stored all routine positions on the street. I5 adds an explicit
        // scene-local graph; only that known I4 shape receives a default.
        if (!own(lin, "scene") && contentVersion === "I4") lin.scene = "street";
        const routine = SP.communityRoutines;
        const nodes = routine && routine.nodesFor ? routine.nodesFor(lin.scene) :
          (lin.scene === "street" && routine ? routine.nodes : null);
        const maxNode = nodes ? nodes.length : 0;
        if (!obj(lin) || !finite(lin.x, -1000, 1000) || !finite(lin.y, -1000, 1000) ||
            !own(lin, "scene") || !["street", "community_reading_room", "community_canteen_room"].includes(lin.scene) || !nodes || maxNode < 1 ||
            !Number.isSafeInteger(lin.node) || lin.node < 0 || lin.node >= maxNode ||
            !Array.isArray(lin.path) || lin.path.length > 100 ||
            !lin.path.every((n) => Number.isSafeInteger(n) && n >= 0 && n < maxNode) ||
            !["home", "rain-home", "morning-errands", "square-break", "afternoon-errands", "evening-reading", "lunch-canteen"].includes(lin.phase) ||
            typeof lin.hidden !== "boolean" || !finite(lin.lastAbs, 0, 1e12)) throw new Error("街坊日常数据无效");
        if (lin.path.length > 0) {
          const edge = new Set((routine.edgesFor ? routine.edgesFor(lin.scene) : routine.edges || [])
            .map(([a, b]) => `${Math.min(a, b)}:${Math.max(a, b)}`));
          let prev = lin.node;
          for (const next of lin.path) {
            if (!edge.has(`${Math.min(prev, next)}:${Math.max(prev, next)}`)) throw new Error("街坊日常路线数据无效");
            prev = next;
          }
        }
        const bounds = lin.scene === "street" ? window.SCENE_DATA.bounds : SP.scenes[lin.scene] && SP.scenes[lin.scene].bounds;
        if (!bounds || lin.x < bounds.x0 - 0.02 || lin.x > bounds.x1 + 0.02 ||
            lin.y < bounds.y0 - 0.02 || lin.y > bounds.y1 + 0.02) throw new Error("街坊日常位置超出场景范围");
      }
    }
    const now = clock.day * 1440 + clock.min;
    if (ps.phone != null) {
      const s = ps.phone, destinations = new Set((SP.phone?.pois || []).map(p => p[0]));
      const people = new Set(["lin", "librarian", "landlord", "vendor", "canteen", "repair", "civic", "transit", "zhang", "daily_wen", "daily_shen"]);
      if (!obj(s) || Object.keys(s).length !== 2 || !own(s, "target") || !own(s, "messages") ||
          !(s.target === null || destinations.has(s.target)) || !Array.isArray(s.messages) || s.messages.length > 200)
        throw new Error("手机记录无效");
      s.messages = s.messages.map(m => {
        if (!obj(m) || !people.has(m.contact) || !finite(m.at, 0, Math.min(now, 1e12))) throw new Error("手机记录无效");
        if (Object.keys(m).length === 3 && own(m, "reply") && typeof m.reply === "string" && m.reply.length <= 500)
          return {contact:m.contact, role:"assistant", text:m.reply, at:m.at, mode:"local"};
        if (!["contact", "at", "role", "text"].every(k => own(m, k)) ||
            Object.keys(m).some(k => !["contact", "at", "role", "text", "mode"].includes(k)) ||
            !["user", "assistant"].includes(m.role) || typeof m.text !== "string" || !m.text.trim() || m.text.length > 2000 ||
            (own(m, "mode") && !["local", "ai"].includes(m.mode))) throw new Error("手机记录无效");
        return m;
      });
    }
    if (ps.communityBus != null) {
      const s = ps.communityBus;
      if (!obj(s) || Object.keys(s).length !== 3 ||
          ["rides", "spent", "lastRideAt"].some((k) => !own(s, k)) ||
          !Number.isSafeInteger(s.rides) || s.rides < 0 ||
          !Number.isSafeInteger(s.spent) || s.spent !== s.rides * 2 ||
          (s.rides === 0 ? s.lastRideAt !== null : !finite(s.lastRideAt, 0, Math.min(now, 1e12))))
        throw new Error("公交乘车记录无效");
    }
    const mealIds = ["lunch_set", "daily_set"], prices = { lunch_set: 18, daily_set: 26 };
    const boxes = Object.keys(ps.items).filter((id) => id.startsWith("canteen_box_"));
    if (boxes.some((id) => !mealIds.some((mealId) => id === `canteen_box_${mealId}`)))
      throw new Error("食堂餐盒种类无效");
    if (ps.communityCanteen == null) {
      if (boxes.some((id) => ps.items[id] !== 0)) throw new Error("食堂餐盒缺少订单记录");
    } else {
      const s = ps.communityCanteen, meal = s && s.meal;
      if (!obj(s) || Object.keys(s).some((k) => !["meal", "mealsEaten", "mealsOrdered"].includes(k)) ||
          !Number.isSafeInteger(s.mealsEaten) || s.mealsEaten < 0 || s.mealsEaten > 1e6 ||
          !Number.isSafeInteger(s.mealsOrdered) || s.mealsOrdered < 0 || s.mealsOrdered > 1e6 ||
          !(meal === null || (obj(meal) && Object.keys(meal).length === 4 &&
            ["id", "paid", "orderedAt", "packed"].every((k) => own(meal, k)) &&
            mealIds.includes(meal.id) && meal.paid === prices[meal.id] &&
            finite(meal.orderedAt, 0, Math.min(now, 1e12)) && typeof meal.packed === "boolean")) ||
          s.mealsOrdered < s.mealsEaten + (meal ? 1 : 0))
        throw new Error("食堂订单数据无效");
      for (const id of mealIds) {
        const expected = meal && meal.id === id ? 1 : 0;
        if ((ps.items[`canteen_box_${id}`] || 0) !== expected) throw new Error("食堂订单与背包餐盒不匹配");
      }
    }
    if (ps.communityRepair != null) {
      const s = ps.communityRepair;
      if (!obj(s) || Object.keys(s).length !== 5 ||
          ["status", "acceptedAt", "finishAt", "completedAt", "paid"].some((k) => !own(s, k)) ||
          !["idle", "pending", "ready", "completed"].includes(s.status))
        throw new Error("自行车维修数据无效");
      if (s.status === "idle") {
        if (s.acceptedAt !== null || s.finishAt !== null || s.completedAt !== null || s.paid !== 0)
          throw new Error("自行车维修空闲状态无效");
      } else if (!finite(s.acceptedAt, 0, Math.min(now, 1e12)) ||
          s.finishAt !== s.acceptedAt + 30 || s.paid !== 12 ||
          (s.status === "completed" ? !finite(s.completedAt, s.finishAt, Math.min(now, 1e12)) : s.completedAt !== null))
        throw new Error("自行车维修时间或金额无效");
    }
  }
  function validate(text) {
    const loading = sourceLoadingReason(); if (loading) throw new Error(loading);
    if (typeof text !== "string") throw new Error("存档不是文本");
    if (text.length > MAX_RECORD_CHARS) throw new Error(SIZE_ERROR);
    let record; try { record = JSON.parse(text); } catch (_) { throw new Error("存档不是有效 JSON"); }
    if (!obj(record) || record.format !== FORMAT || !obj(record.payload) ||
        ![1, 2, VERSION].includes(record.version)) throw new Error("存档格式或版本不兼容");
    if (record.checksum !== checksum(JSON.stringify(record.payload))) throw new Error("存档校验失败，文件可能已损坏");
    const p = record.payload;
    let migrated = false;
    let sourceContentVersion;
    if (record.version === 1) {
      const contract = LEGACY_SIGNATURES[p.worldSignature];
      if (!contract || !additiveWorldMatches(contract)) throw new Error("旧存档对应的街区版本与当前游戏不同");
      migrated = true; sourceContentVersion = "I3";
    } else {
      if (record.schemaVersion !== record.version || (record.version === VERSION && record.contentVersion !== CONTENT_VERSION) || !["I4", "I5", "I6", "I7", "I8", "I9", "I10", "I11", "I12", "I13", "I14", "I15", "I16", "I17", CONTENT_VERSION].includes(record.contentVersion) ||
          !additiveWorldMatches(p.worldContract)) throw new Error("存档结构或街区版本不兼容");
      // The signature must still match the saved prefix contract. A later
      // additive release may append objects, chunks or scenes after it.
      if (p.worldSignature !== signatureForContract(p.worldContract))
        throw new Error("存档对应的街区版本与当前游戏不同");
      sourceContentVersion = record.contentVersion;
      migrated = record.version !== VERSION || record.contentVersion !== CONTENT_VERSION;
    }
    if (!obj(p.ps) || p.ps.v !== 3 || !finite(p.ps.money, -1e9, 1e9) || !obj(p.ps.items) || !obj(p.ps.stats) ||
        !obj(p.ps.needs) || !obj(p.ps.flags) || !obj(p.ps.aff) || !obj(p.ps.met) || !obj(p.ps.perks) ||
        !Array.isArray(p.ps.log) || !Array.isArray(p.ps.bills) ||
        !finite(p.ps.owed, 0, 1e12) || !finite(p.ps.rentDue, 0, 1e12) || !finite(p.ps.rentPaid, 0, 1e12))
      throw new Error("人物或背包数据无效");
    for (const need of G.rules.needs) if (!finite(p.ps.needs[need], 0, 100)) throw new Error("人物需求数据无效");
    for (const n of Object.values(p.ps.items)) if (!Number.isSafeInteger(n) || n < 0 || n > 1e6) throw new Error("背包数量无效");
    if (!obj(p.ps.stats.actions) || !finite(p.ps.stats.spent, 0, 1e12) || !finite(p.ps.stats.earned, 0, 1e12) ||
        !Number.isSafeInteger(p.ps.stats.shifts) || !Number.isSafeInteger(p.ps.stats.fines)) throw new Error("收支数据无效");
    if (p.ps.clothes && (!obj(p.ps.clothes) || !obj(p.ps.clothes.rack) || !finite(p.ps.clothes.clean, 0, 1e6) || !finite(p.ps.clothes.dirty, 0, 1e6)))
      throw new Error("衣物数据无效");
    if (p.ps.meter && (!obj(p.ps.meter) || !["water", "power", "gas"].every((k) => finite(p.ps.meter[k], 0, 1e12))))
      throw new Error("水电表数据无效");
    if (p.ps.power && (!obj(p.ps.power) || !obj(p.ps.power.on) || !obj(p.ps.power.kwh))) throw new Error("电器数据无效");
    if (G.rules.data.lease) {
      const l = p.ps.lease;
      if (!obj(l) || !own(G.rules.data.lease.plans, l.plan) || !finite(l.rent, 0, 1e9) ||
          !finite(l.deposit, 0, 1e12) || !Number.isSafeInteger(l.anchor) || l.anchor < 1 || l.anchor > 31 ||
          !Number.isSafeInteger(l.periods) || l.periods < 1 || !finite(l.fees, 0, 1e12) ||
          !(l.late === null || finite(l.late, 0, 1e12)) || !finite(l.check, 0, 1e12)) throw new Error("租约数据无效");
    }
    if (G.rules.data.utilities && (!p.ps.meter || !finite(p.ps.utilNext, 0, 1e12))) throw new Error("水电数据无效");
    if (G.rules.data.laundry && !p.ps.clothes) throw new Error("衣物数据无效");
    if (G.rules.data.appliances && !p.ps.power) throw new Error("电器数据无效");
    if (p.ps.communityDeliveries && p.ps.communityDeliveries.active) {
      const a = p.ps.communityDeliveries.active, jobs = SP.communityDeliveries && SP.communityDeliveries.jobs;
      if (!obj(a) || !jobs || !jobs.some((j) => j.id === a.id && j.target === a.target) || !(p.ps.items["courier-parcel"] > 0))
        throw new Error("配送单与背包包裹不匹配");
    }
    const c = p.clock;
    if (!obj(c) || Object.keys(c).length !== CLOCK_KEYS.length || !CLOCK_KEYS.every((k) => own(c, k)) ||
        !Number.isSafeInteger(c.day) || c.day < 0 || c.day > 1e7 || !finite(c.min, 0, 1440) ||
        !finite(c.scale, 0, 1000) || !WEATHER.has(c.weather) || !WEATHER.has(c.target) ||
        !["intensity", "tInt", "wet", "snow", "fog"].every((k) => finite(c[k], 0, 1)) ||
        !Number.isSafeInteger(c.manualDay) || !finite(c.wind, 0, 10)) throw new Error("日历或天气数据无效");
    // The outer checksum was verified over the compact payload before any
    // migration. Decode only after the imported clock is known to be valid.
    if (record.version === VERSION) {
      if (!own(p.ps, "lifeChronicle") || !window.ChronicleArchiveCodec) throw new Error("缺少有效的人生归档记录");
      p.ps.lifeChronicle = window.ChronicleArchiveCodec.decode(p.ps.lifeChronicle, c.day * 1440 + c.min);
    }
    if (!SP.socialExchangeSave) throw new Error("赠借存档模块尚未准备好，暂不能读取进度");
    if (SP.socialExchangeSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true;
    if (!SP.cityIncidentsSave) throw new Error("城市现场存档模块尚未准备好，暂不能读取进度");
    if (SP.cityIncidentsSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true;
    if (!SP.livingCitySave) throw new Error("城市日常存档模块尚未准备好，暂不能读取进度");
    if (SP.livingCitySave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min, p)) migrated = true;
    if (!SP.socialRetrospectionSave) throw new Error("社会回溯存档模块尚未准备好");
    if (SP.socialRetrospectionSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true;
    if (!SP.mediaNewsSave) throw new Error("公开资讯存档模块尚未准备好");
    if (SP.mediaNewsSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true;
    if (!SP.heardNotesSave) throw new Error("私人听闻存档模块尚未准备好");
    if (SP.heardNotesSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true;
    if (!SP.leaseTalkSave) throw new Error("租住转述存档模块尚未准备好");
    if (SP.leaseTalkSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true;
    if (!SP.workTalkSave) throw new Error("工作陈述存档模块尚未准备好");
    if (SP.workTalkSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true;
    if (!SP.fixtureTalkSave) throw new Error("门灯所见陈述存档尚未准备好");
    if (SP.fixtureTalkSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true;
    if (!SP.socialFlowSave) throw new Error("街坊消息存档尚未准备好");
    if (SP.socialFlowSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true;
    if (!SP.animalsSave) throw Error("动物存档尚未准备好");
    if (SP.animalsSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true;
    if (!SP.neighborDaySave) throw new Error("邻居日程存档模块尚未准备好");
    if (SP.neighborDaySave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true;
    if (!SP.vendorDaySave) throw new Error("王阿姨日程存档模块尚未准备好");
    if (SP.vendorDaySave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true;
    if (!SP.routineWorkSave) throw new Error("作息工作存档模块尚未准备好");
    if (SP.routineWorkSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true;
    if (!SP.residentMemorySave) throw new Error("本人经验记忆存档未准备好");
    if (SP.residentMemorySave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true;
    if (SP.employmentSave) { if (SP.employmentSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true; }
    else if (p.ps.employment || p.extensions?.employment) throw Error("岗位模块未准备好");
    if (SP.householdSave) { if (SP.householdSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true; }
    else if (p.ps.household || p.extensions?.household) throw Error("家庭账本模块未准备好");
    if (SP.playerWorkSave) { if (SP.playerWorkSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true; }
    else if (p.ps.playerWork || p.extensions?.playerWork) throw Error("雇佣记录模块未准备好");
    if (SP.commerceSave) { if (SP.commerceSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true; }
    else if (p.ps.commerce || p.extensions?.commerce) throw Error("外卖网购模块未准备好");
    if (SP.wetMarketSave) { if (SP.wetMarketSave.prepareState(p.ps, p.extensions, c.day * 1440 + c.min)) migrated = true; }
    else if (p.ps.wetMarket || p.extensions?.wetMarket) throw Error("菜市场模块未准备好");
    validateCommunityProgress(p.ps, sourceContentVersion, c);
    const at = c.day * 1440 + c.min, onlineStateRequired = ["I17", CONTENT_VERSION].includes(sourceContentVersion);
    // Local I16 contains parking, while online I16 introduced supply. Both migrate
    // additively; I17 and the merged I18 must retain all online native records.
    if (sourceContentVersion === "I16" && !own(p.ps, "canteenSupply") && !own(p.ps, "streetParking"))
      throw new Error("I16 存档缺少停车或供货分支记录");
    if (!own(p.ps, "canteenSupply")) {
      if (onlineStateRequired) throw new Error("存档缺少食堂供货账目");
      p.ps.canteenSupply = window.CanteenSupply.fresh(at);
    }
    if (!window.CanteenSupply.validate(p.ps.canteenSupply, at)) throw new Error("食堂库存或交易账目不一致");
    if (!own(p.ps, "npcConflict")) {
      if (onlineStateRequired) throw new Error("缺少治安记录");
      p.ps.npcConflict = window.NpcConflictModel.fresh();
    }
    if (!own(p.ps, "lifeChronicle")) {
      if (onlineStateRequired) throw new Error("缺少人生记录");
      p.ps.lifeChronicle = window.LifeChronicleModel.fresh(at, p.ps);
    }
    if (!window.NpcConflictModel.validate(p.ps.npcConflict, at) ||
        !window.LifeChronicleModel.validate(p.ps.lifeChronicle, at)) throw new Error("治安或人生档案无效");
    if ((p.ps.npcConflict.player.health === 0) !== !!p.ps.lifeChronicle.death) throw new Error("死亡状态与人生档案不一致");
    if (!own(p.ps, "phoneApi")) {
      if (onlineStateRequired) throw new Error("缺少 API 设置记录");
      p.ps.phoneApi = SP.phoneAI.captureState();
    }
    if (!SP.phoneAI.validateState(p.ps.phoneApi)) throw new Error("存档中的 API 设置无效");
    if (sourceContentVersion === CONTENT_VERSION &&
        (!own(p.ps, "socialEncounters") || p.ps.socialEncounters?.version !== 3 || !own(p.ps, "socialAppointments")))
      throw new Error("当前存档缺少有效社交或预约记录");
    if (SP.socialEncountersSave) SP.socialEncountersSave.prepareState(p.ps, sourceContentVersion, c.day * 1440 + c.min);
    else if (sourceContentVersion === CONTENT_VERSION || own(p.ps, "socialEncounters"))
      throw new Error("街头交谈存档模块尚未准备好");
    if (SP.socialAppointmentsSave) SP.socialAppointmentsSave.prepareState(p.ps, sourceContentVersion, c.day * 1440 + c.min);
    else if (sourceContentVersion === CONTENT_VERSION || own(p.ps, "socialAppointments"))
      throw new Error("预约存档模块尚未准备好");
    if (SP.streetParkingSave) SP.streetParkingSave.prepareState(p.ps, sourceContentVersion, c.day * 1440 + c.min);
    else if (sourceContentVersion === CONTENT_VERSION || own(p.ps, "streetParking"))
      throw new Error("停车存档模块尚未准备好");
    const loc = p.location, scene = loc && loc.scene, room = scene && SP.scenes[scene];
    if (!obj(loc) || !(scene === "street" || scene === "roof" || (room && room.interior)) ||
        !finite(loc.x, -1000, 1000) || !finite(loc.y, -1000, 1000) || !DIR.has(loc.dir)) throw new Error("位置或场景无效");
    const bounds = scene === "street" || scene === "roof" ? window.SCENE_DATA.bounds : room.bounds;
    if (bounds && (loc.x < bounds.x0 - 0.02 || loc.x > bounds.x1 + 0.02 ||
        loc.y < bounds.y0 - 0.02 || loc.y > bounds.y1 + 0.02)) throw new Error("人物位置超出场景范围");
    // riverfix (2026-10-18): an old save standing where the river / the moved schools are now goes to the nearest walkable point
    if (scene === "street" && typeof window.RONGQIAO_RELOCATE === "function") { const q = window.RONGQIAO_RELOCATE(loc.x, loc.y); if (q) { loc.x = q[0]; loc.y = q[1]; } }
    if (scene === "street" && window.RONGQIAO_NORTH && window.RONGQIAO_NORTH.forbidden(loc.x, loc.y))
      throw new Error("人物位置位于施工围挡或建筑内部");
    if (scene === "roof") {
      const rect = window.SCENE_DATA.roof && window.SCENE_DATA.roof.rect;
      const radius = SP.player.radius || 0.22;
      if (!Array.isArray(rect) || rect.length !== 4 || loc.x - radius < rect[0] || loc.x + radius > rect[2] ||
          loc.y - radius < rect[1] || loc.y + radius > rect[3]) throw new Error("天台位置超出护栏范围");
    }
    if (!obj(p.interiors) || Object.keys(p.interiors).length > 100) throw new Error("室内状态无效");
    for (const [id, states] of Object.entries(p.interiors)) {
      if (!SP.scenes[id] || !SP.scenes[id].interior) throw new Error(`未知室内场景：${id}`);
      validateStates(states, `室内 ${id}`);
    }
    validateStates(p.street, "街区");
    // 2026-10-24 B2: loading every street chunk records a state bag per chunk. The old cap of 50
    // rejected a normal save once 城中村西缘 added two chunks. 2026-10-25 P11 第七片 is the 65th chunk.
    // 第八片 is the 66th. 第九片 is the 67th. 第十片 is the 68th. 第十一片 is the 69th. 第十二片 is the 70th. 第十三片 is the 71st. 第十四片 is the 72nd. 第十五片 is the 73rd. 第十六片 is the 74th. 第十七片 is the 75th. 第十八片 is the 76th.
    // 2026-10-26 Site138: 河东东澄是第 80 块。上限从 80 抬到 120，仍是一次键数比较，不改流式加载距离。超过 120 的伪造袋仍拒绝。
    if (!obj(p.chunks) || Object.keys(p.chunks).length > MAX_CHUNK_STATES) throw new Error("街区分块状态无效");
    const knownChunks = new Set((window.SCENE_DATA.chunks || []).map((x) => x.id));
    for (const [id, states] of Object.entries(p.chunks)) {
      if (!knownChunks.has(id)) throw new Error(`未知街区分块：${id}`);
      validateStates(states, `分块 ${id}`);
    }
    // I9 replaces civic decoration, while all interactive window and door IDs
    // remain. Retire only the seven removed, noninteractive decoration states.
    // Do this after checksum/shape validation and before committing the snapshot.
    const civic = window.COMMUNITY_CIVIC_ART;
    if (migrated && civic && p.chunks.community_east) {
      for (const id of civic.removedIds) delete p.chunks.community_east[id];
    }
    for (const states of Object.values(p.interiors)) stripSharedHomeFixtures(states);
    stripSharedHomeFixtures(p.street); for (const states of Object.values(p.chunks)) stripSharedHomeFixtures(states);
    return { payload: p, migrated, contentVersion: sourceContentVersion };
  }
  PS.inspect = function (text) { try { const v = validate(text), p = v.payload;
    return success({ scene: p.location.scene, day: p.clock.day, money: p.ps.money, migrated: v.migrated,
      contentVersion: v.contentVersion }); } catch (e) { return error(e.message); } };

  function restoreClock(c) {
    for (const k of CLOCK_KEYS) C[k] = c[k];
    C.season = C.seasonOf(C.day); SP.season = C.season; C.ff = null; C.lampsOn = false; C.computeAmbient();
    if (SP.tint) SP.tint.night = SP.clamp((C.dark - 0.2) / 0.4, 0, 1);
    if (SP.env) SP.env.night = SP.tint ? SP.tint.night : 0;
  }
  function commit(p) {
    const wasRestoring = PS.restoring;
    PS.restoring = true;
    try { commitState(p); }
    finally { PS.restoring = wasRestoring; }
  }
  function commitState(p) {
    const safe = window.SCENE_DATA.spawn;
    if (W.interior || SP.player.level === "roof") PL.enter("street", [safe.x, safe.y, safe.dir]);
    G.closeMenu(); G.queue = []; G.activity = null; G.trans = null;
    G.ps = G.rules.load(G.rules.serialize(p.ps));
    restoreClock(p.clock);
    SP.phoneAI.restoreState(G.ps.phoneApi);
    SP.npcConflict?.resetRuntime();
    SP.conflictDialogue?.resetRuntime();
    SP.lifeChronicle?.resetRuntime();
    if (SP.socialEncountersSave) SP.socialEncountersSave.applyCommitted(G.ps, C.abs());
    if (SP.socialAppointmentsSave) SP.socialAppointmentsSave.applyCommitted(G.ps, C.abs());
    if (!SP.socialExchangeSave) throw new Error("赠借存档模块尚未准备好");
    SP.socialExchangeSave.applyCommitted(G.ps, C.abs());
    PL.istate = clone(p.interiors);
    chunkStates = clone(p.chunks);
    W.interior = false; W.sceneId = "street"; W.load(window.SCENE_DATA); W.portals = [];
    applyStates(W.objects, p.street);
    if (SP.traffic && SP.traffic.reset) SP.traffic.reset();
    PL.enter(p.location.scene, [p.location.x, p.location.y, p.location.dir]);
    if (!SP.cityIncidentsSave) throw new Error("城市现场存档模块尚未准备好");
    SP.cityIncidentsSave.applyCommitted(G.ps, C.abs());
    if (!SP.livingCitySave) throw new Error("城市日常存档模块尚未准备好");
    SP.livingCitySave.applyCommitted(G.ps, C.abs(), p);
    if (!SP.socialRetrospectionSave) throw new Error("社会回溯存档模块尚未准备好");
    SP.socialRetrospectionSave.applyCommitted(G.ps, C.abs());
    if (!SP.mediaNewsSave) throw new Error("公开资讯存档模块尚未准备好");
    SP.mediaNewsSave.applyCommitted(G.ps, C.abs());
    if (!SP.heardNotesSave) throw new Error("私人听闻存档模块尚未准备好");
    SP.heardNotesSave.applyCommitted(G.ps, C.abs());
    if (!SP.leaseTalkSave) throw new Error("租住转述存档模块尚未准备好");
    SP.leaseTalkSave.applyCommitted(G.ps, C.abs());
    if (!SP.workTalkSave) throw new Error("工作陈述存档模块尚未准备好");
    SP.workTalkSave.applyCommitted(G.ps, C.abs());
    if (!SP.fixtureTalkSave) throw new Error("门灯所见陈述存档尚未准备好");
    SP.fixtureTalkSave.applyCommitted(G.ps, C.abs());
    if (!SP.socialFlowSave) throw new Error("街坊消息存档尚未准备好");
    SP.socialFlowSave.applyCommitted(G.ps, C.abs());
    SP.animalsSave.applyCommitted(G.ps, C.abs());
    if (!SP.neighborDaySave) throw new Error("邻居日程存档模块尚未准备好");
    SP.neighborDaySave.applyCommitted(G.ps, C.abs());
    if (!SP.vendorDaySave) throw new Error("王阿姨日程存档模块尚未准备好");
    SP.vendorDaySave.applyCommitted(G.ps, C.abs());
    if (!SP.routineWorkSave) throw new Error("作息工作存档模块尚未准备好");
    SP.routineWorkSave.applyCommitted(G.ps, C.abs());
    if (!SP.residentMemorySave) throw new Error("本人经验记忆存档未准备好");
    SP.residentMemorySave.applyCommitted(G.ps, C.abs());
    if (SP.employmentSave) SP.employmentSave.applyCommitted(G.ps, C.abs());
    if (SP.householdSave) SP.householdSave.applyCommitted(G.ps, C.abs());
    if (SP.playerWorkSave) SP.playerWorkSave.applyCommitted(G.ps, C.abs());
    if (SP.commerceSave) SP.commerceSave.applyCommitted(G.ps, C.abs());
    if (SP.wetMarketSave) SP.wetMarketSave.applyCommitted(G.ps, C.abs());
    if (SP.streetParkingSave) SP.streetParkingSave.applyCommitted(G.ps, C.abs());
    G.spawnAt = [SP.player.x, SP.player.y]; G.lastXY = [SP.player.x, SP.player.y]; G.armed = false;
    if (G.syncPower) G.syncPower();
    if (SP.env && SP.env.invalidateLights) SP.env.invalidateLights();
    if (SP.env && SP.env.clearStamps) SP.env.clearStamps();
    if (SP.communityDeliveries && SP.communityDeliveries.refresh) SP.communityDeliveries.refresh();
    if (SP.layers && SP.layers.reset) SP.layers.reset();
  }
  PS.restore = function (text) {
    const blocked = guard(); if (blocked) return error(blocked);
    let v; try { v = validate(text); } catch (e) { return error(e.message); }
    const p = v.payload;
    let previous; try { previous = capturePayload(); } catch (e) { return error(`读取前无法备份当前进度：${e.message}`); }
    try { commit(p); return success({ scene: p.location.scene, day: p.clock.day, migrated: v.migrated,
      contentVersion: v.contentVersion }); }
    catch (e) {
      try { commit(previous); return error(`读取失败，已恢复原进度：${e.message}`); }
      catch (recovery) { return error(`读取失败，恢复原进度也失败：${e.message}；${recovery.message}`); }
    }
  };
  PS.saveLocal = function () {
    const r = PS.capture(); if (!r.ok) return r;
    try { window.localStorage.setItem(KEY, r.text); return success({ text: r.text }); }
    catch (_) { return error("本地存储不可用；请点“导出 JSON”备份到文件。"); }
  };
  PS.loadLocal = function () {
    let text; try { text = window.localStorage.getItem(KEY) || window.localStorage.getItem(LEGACY_KEY); }
    catch (_) { return error("本地存储不可用；请使用“导入 JSON”。"); }
    return text ? PS.restore(text) : error("还没有本地存档。请先保存，或导入 JSON 文件。");
  };

  function ui() {
    const wrap = document.getElementById("wrap"), bar = document.getElementById("bar");
    if (!wrap || !bar) return;
    const button = (label, parent, cls) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; if (cls) b.className = cls; parent.appendChild(b); return b; };
    const launch = button("存档", bar);
    const touchParent = document.querySelector("#community-touch-tools nav") || document.getElementById("evbar");
    const touchLaunch = touchParent ? button("存档", touchParent, "ebtn") : null;
    if (touchLaunch) touchLaunch.id = "community-save-launch-touch";
    const panel = document.createElement("div"); panel.id = "progress-save-panel";
    Object.assign(panel.style, { position: "absolute", top: "42px", left: "50%", transform: "translateX(-50%)", zIndex: "65",
      width: "min(370px, calc(100% - 20px))", boxSizing: "border-box", padding: "12px", borderRadius: "10px",
      border: "1px solid #657080", background: "rgba(20,24,32,.97)", boxShadow: "0 8px 26px #0009", display: "none" });
    const title = document.createElement("div"); title.textContent = "井槐里 · 进度存档";
    Object.assign(title.style, { color: "#f0d49c", fontWeight: "bold", marginBottom: "7px" }); panel.appendChild(title);
    const help = document.createElement("div"); help.textContent = "手动保存。地铁和商务区内请先返回街面；JSON 可跨浏览器导入，支持 I3–I18 旧存档；新版紧凑存档需使用支持该格式的新版游戏读取。人生事件无损保存。";
    Object.assign(help.style, { color: "#b8c0ca", fontSize: "11px", marginBottom: "8px" }); panel.appendChild(help);
    const row = document.createElement("div"); row.style.cssText = "display:flex;flex-wrap:wrap;gap:5px"; panel.appendChild(row);
    const save = button("保存本机", row), load = button("读取本机", row), exp = button("导出 JSON", row), imp = button("导入文本", row);
    const file = document.createElement("input"); file.type = "file"; file.accept = ".json,application/json"; file.style.display = "none"; panel.appendChild(file);
    const pick = button("选取 JSON 文件", row), close = button("关闭", row);
    const area = document.createElement("textarea"); area.placeholder = "导出的 JSON 会显示在这里；也可粘贴 JSON 后点“导入文本”。";
    area.style.cssText = "display:block;width:100%;height:76px;box-sizing:border-box;margin-top:8px;background:#12161d;color:#e2e8f1;border:1px solid #56606d;border-radius:4px;font:11px/1.3 monospace"; panel.appendChild(area);
    const status = document.createElement("div"); status.setAttribute("role", "status"); status.style.cssText = "min-height:17px;margin-top:6px;color:#f0d49c;font-size:12px"; panel.appendChild(status);
    wrap.appendChild(panel);
    const touchStyle = document.createElement("style");
    touchStyle.textContent = "body.mobile #progress-save-panel{position:fixed!important;top:50%!important;left:50%!important;transform:translate(-50%,-50%)!important;z-index:1500!important;width:min(370px,calc(100vw - 24px))!important;max-height:calc(100dvh - 24px);overflow-y:auto;touch-action:pan-y;overscroll-behavior:contain}body.mobile #progress-save-panel button{min-height:44px;margin:3px}body.mobile #progress-save-panel textarea{font-size:16px!important}";
    document.head.appendChild(touchStyle);
    for (const name of ["touchstart", "touchmove", "touchend"]) panel.addEventListener(name, e => e.stopPropagation(), { passive: true });
    // Gameplay hotkeys are registered on window. Keep the textarea and panel
    // controls usable without swallowing keyup, which clears held movement keys.
    panel.addEventListener("keydown", (e) => e.stopPropagation());
    const show = (r, okText) => { status.textContent = r.ok ? okText : r.reason; status.style.color = r.ok ? "#a5e4b2" : "#ffbdab"; };
    const toggle = () => { panel.style.display = panel.style.display === "none" ? "block" : "none";
      if (panel.style.display === "block") { if (SP.isTouch) document.body.appendChild(panel); SP.touchRelease && SP.touchRelease(); window.dispatchEvent(new Event("blur"));
        const nav = document.querySelector("#community-touch-tools nav"); if (nav) { nav.hidden = true;
          const b = document.getElementById("community-tools-toggle"); b.textContent = "工具"; b.setAttribute("aria-expanded", "false"); }
      }
    };
    launch.onclick = toggle; if (touchLaunch) touchLaunch.onclick = toggle; close.onclick = () => panel.style.display = "none";
    save.onclick = () => show(PS.saveLocal(), "已保存到本机。建议定期导出 JSON 备份。");
    load.onclick = () => { const r = PS.loadLocal(); show(r, r.migrated ? "旧版进度已读取；可另存新版。" : "进度已读取。"); };
    exp.onclick = () => {
      const r = PS.capture(); if (!r.ok) return show(r);
      area.value = r.text; area.focus(); area.select();
      try { const url = URL.createObjectURL(new Blob([r.text], { type: "application/json" }));
        const a = document.createElement("a"); a.href = url; a.download = `fushi-progress-day-${C.day + 1}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
      catch (_) { /* selectable JSON remains available for manual copy */ }
      show(r, "JSON 已生成并尝试下载；也可以复制下方文本。");
    };
    imp.onclick = () => { const r = PS.restore(area.value);
      show(r, r.migrated ? "旧版 JSON 已导入；本地旧存档未覆盖。" : "JSON 已导入当前游戏；本地存档未覆盖。"); };
    pick.onclick = () => file.click();
    file.onchange = async () => {
      const f = file.files && file.files[0]; if (!f) return;
      try { area.value = await f.text(); const r = PS.restore(area.value);
        show(r, r.migrated ? "旧版文件已导入；本地旧存档未覆盖。" : "文件已导入当前游戏；本地存档未覆盖。"); }
      catch (e) { show(error(`无法读取文件：${e.message}`)); }
      file.value = "";
    };
  }
  ui();
})(window.SP = window.SP || {});
