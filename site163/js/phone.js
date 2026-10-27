/* In-world iPhone-style community phone. Game state stays in the save schema. */
(function (SP) {
  'use strict';
  if (!SP || !SP.game || !SP.clock || !SP.world) return;
  const G = SP.game, C = SP.clock, W = SP.world, R = G.rules;
  const PHONE_CSS = document.currentScript?.src ? new URL('phone.css', document.currentScript.src).href : 'iso45/js/phone.css';
  const POIS = [
    ['home', '我的住处 · 12号楼', 1.5, 12.1, '回到单元门，再上二楼。'],
    ['metro', '井槐里地铁站', 37.8, -8.45, '06:00–23:00 · 3号线'],
    ['bus', '老街南侧公交站', -20, -7.9, '06:00–23:00 · 东行至便民街 · ¥2'],
    ['return_bus', '便民街北侧公交站', 145, 1.15, '06:00–23:00 · 西行至井槐里 · ¥2'],
    ['clinic', '街坊药房 / ATM', 31.9, 12, '08:00–21:00 · 诊疗、取药和存取款'],
    ['library', '社区阅览室', 100.5, 18.1, '08:00–21:00 · 借阅、阅读与休息'],
    ['work', '邻里共创工作间', 117.5, 18.1, '09:00–20:00 · 到前台接单，工作两小时后结算 ¥80'],
    ['petshop','喵汪小屋 · 宠物店',117.5,34.1,'09:00–20:00 · 宠物口粮、猫狗照料与领养，位于警务站东侧。'],
    ['civic', '社区警务站', 100.5, 34.1, '09:00–17:00 · 失物登记与回执查询'],
    ['canteen', '槐东社区食堂', 136.5, 3.6, '07:00–20:00 · ¥18 / ¥26 套餐，支持打包'],
    ['repair', '老陈修车铺', 151.5, 3.6, '09:00–18:00 · 公共单车检修 ¥12'],
    ['shared_home', '栖和公寓 · 101室', 210.5, 34.8, '住宅区最东侧，从云境住宅沿前场向东。入口在南侧前场，先到大厅看房；三室两厅两卫。'],
    ['cbd', 'CBD · 经地铁前往', 37.8, -8.45, '地图只标注出发站口，不是CBD位置。正向行程连接实际进站、安检、本人购票、候车乘车和CBD出站；返程仍按原方式手动乘坐。', {via:'metro'}]
  ];
  // Native saves validate target IDs before any streamed objects or vehicle UI are needed.
  // These are verified authored entrances/stations, not a permissive target-string migration.
  const STABLE_PLACES=[['shop24_S1F_1_shop','24便利店',37,3.9],['community_barber_door','槐东剪艺',145.5,3.6],['modern_residence_door','澜山雅庭 · 住宅大厅',177,8.8],['modern_residence_B_door','云境住宅 · 大厅',172.5,34.8]];
  const STABLE_PARKING=[['alley','巷口停放区',-18,2.5],['shop','沿街店铺停放区',38,2.5],['court','小区停放区',14,26],['east_residential','东住宅前场停放区',184,33.5],['qihe','栖和前场停放区',214.5,33.5],['east_shop_west','槐东西段路旁停放区',52,2.5],['east_shop_mid','槐东中段路旁停放区',70,2.5],['east_shop_east','槐东东段路旁停放区',88,2.5],['community_green','花园公共铺地旁停放区',110,4],['service_lane','便民街路旁停放区',151,24],['modern_west','现代住宅西前场停放区',175,33.5]];
  for(const [id,name,x,y]of STABLE_PLACES)POIS.push(['place_'+id,name,x,y,'前往实际入口；到门口后按原互动方式进入，营业时间和通行权限照常生效。']);
  for(const [id,name,x,y]of STABLE_PARKING)POIS.push(['parking_'+id,name,x,y,'共享车停放区：请本人在线内安全下车，并在原共享车界面明确还车结账。导航到达不会自动还车或扣结算款。']);
  const fallbackPeople = [
    { id: 'lin', name: '小林', role: '邻居', avatar: '林', color: '#62a879' },
    { id: 'librarian', name: '顾老师', role: '社区阅览室', avatar: '顾', color: '#6587bf' },
    { id: 'landlord', name: '房东', role: '租约与缴租', avatar: '房', color: '#b47b5a' }
  ];
  const fallbackNames = Object.fromEntries(fallbackPeople.map(p => [p.id, p.name]));
  let opened = false, phoneOwner = null, tab = 'home', activeChat = null, travelChoice = null, panel, appBody, appHeader, appTitle, backButton, rightButton;
  let shell, statusClock, statusDate, notice, nav, lastFocus, pendingSend = null, sendError = null, sendSeq = 0;
  const dollar = n => '¥' + Number(n || 0).toFixed(2);
  const time = abs => {
    const a = Math.max(0, Number(abs) || 0), day = Math.floor(a / 1440), min = Math.floor(a % 1440), d = R.date(a);
    return { day, min, date: `${d.y}年${d.m}月${d.d}日`, clock: `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}` };
  };
  const currentTime = () => time(C.abs());
  const external = () => !!(window.FushiMetro?.core?.active || SP.cbd?.active);
  const text = (tag, value, parent) => { const e = document.createElement(tag); e.textContent = value == null ? '' : String(value); parent.appendChild(e); return e; };
  const button = (label, parent, fn, cls = '') => { const b = text('button', label, parent); b.type = 'button'; if (cls) b.className = cls; b.onclick = fn; return b; };
  const state = () => {
    const ps = G.ps;
    if (!ps.phone) ps.phone = { target: null, messages: [] };
    if (!Array.isArray(ps.phone.messages)) ps.phone.messages = [];
    // Compatibility for a pre-migration in-memory session; the save migrator owns ZIP conversion.
    if (ps.phone.messages.some(m => m && m.reply != null && !m.role)) {
      ps.phone.messages = ps.phone.messages.flatMap(m => m && m.reply != null && !m.role
        ? [{ contact: m.contact, role: 'assistant', text: String(m.reply).slice(0, 2000), at: m.at, mode: 'local' }]
        : [m]);
    }
    return ps.phone;
  };
  const unlocked = p => {
    if (typeof p.unlocked === 'function') { try { return !!p.unlocked(); } catch (_) { return false; } }
    if (p.id === 'lin') return Number(G.ps.communitySocial?.lin?.greetings) > 0;
    return true;
  };
  const people = () => Array.isArray(SP.phoneAI?.contacts) ? SP.phoneAI.contacts : fallbackPeople;
  const person = id => people().find(p => p.id === id) || fallbackPeople.find(p => p.id === id) || { id, name: id, role: '社区联系人', avatar: '邻', color: '#6f8793' };
  const personName = id => person(id).name || fallbackNames[id] || id;
  function tell(s) { if (notice) notice.textContent = s || ''; }
  function goto(next) { tab = next; activeChat = null; render(); }
  function pushMessage(message) {
    const s = arguments.length > 1 ? arguments[1] : state();
    if (!s || !Array.isArray(s.messages)) return;
    s.messages.push(message);
    if (s.messages.length > 200) s.messages.splice(0, s.messages.length - 200);
  }
  function fmtDate(abs) { const t = time(abs); return `${t.date} ${t.clock}`; }
  function row(parent, title, value, opts = {}) {
    const e = document.createElement('section'); e.className = opts.className || 'phone-card'; if (opts.icon && e.dataset) e.dataset.icon = opts.icon; parent.appendChild(e);
    const top = document.createElement('div'); top.className = 'phone-row'; e.appendChild(top);
    text('strong', title, top); if (opts.right) text('small', opts.right, top);
    if (value != null && value !== '') text('p', value, e);
    return e;
  }
  function hero(parent, cls, label, value, subs) { const e = document.createElement('div'); e.className = 'phone-hero' + (cls ? ' ' + cls : ''); parent.appendChild(e); if (cls === 'cal') text('div', value, e).className = 'h-day'; text('div', label, e).className = 'h-label'; if (cls !== 'cal') text('div', value, e).className = 'h-value'; const sub = document.createElement('div'); sub.className = 'h-sub'; e.appendChild(sub); for (const v of subs || []) if (v) text('span', v, sub); return e; }
  function heading(parent, value) { const e = text('div', value, parent); e.className = 'phone-section-title'; return e; }
  // Live time nodes: anything rendered once from the game clock (home widget, calendar header, "今天") is
  // registered here and refreshed by setStatus(), which runs on every new in-game minute while the phone is open.
  let liveNodes = [], liveMinute = -1, liveDay = -1;
  const live = (el, fn) => { liveNodes.push([el, fn]); return el; };
  function refreshLive() {
    for (const [el, fn] of liveNodes) { let v = ''; try { v = String(fn()); } catch (_) { continue; } if (el.textContent !== v) el.textContent = v; }
  }
  function setStatus() {
    if (!statusClock || !statusDate) return;
    refreshLive();
    const t = currentTime(); if (statusClock.textContent !== t.clock) statusClock.textContent = t.clock; statusDate.textContent = '●  ◔  ▰'; statusDate.setAttribute('aria-label', `${t.date} · ${C.weatherName()}`);
  }

  function localReply(id) {
    if (id === 'lin') {
      const phase = G.ps.communityRoutines?.lin?.phase;
      return ({ 'lunch-canteen': '中午去食堂吃饭，13:30后继续办事。', 'evening-reading': '我去阅览室看看书，20:00回家。', 'rain-home': '雨太大，先回家了。', home: '现在在家，白天再聊。' })[phase] || '白天在社区办事，傍晚会去阅览室。';
    }
    if (id === 'librarian') return `阅览室08:00–21:00开放，每次可借一本，借期七天。${G.ps.communityLibrary?.loan ? '你有一本书还没归还，记得带来。' : '到柜台可以查看借阅书目。'}`;
    if (id === 'landlord') return `本期房租${dollar(G.ps.lease?.rent)}，${G.ps.owed > 0 ? `还有欠租${dollar(G.ps.owed)}，可在手机账单中补交。` : '当前没有欠租。'}正常到期会按租约自动扣费。`;
    return `你好，我是${personName(id)}。现在是${fmtDate(C.abs())}，可以在社区里见面聊聊。`;
  }
  function historyFor(id, omitLast) {
    const list = state().messages.filter(m => m && m.contact === id && (m.role === 'user' || m.role === 'assistant'));
    const cut = omitLast ? list.slice(0, -1) : list;
    return cut.slice(-200).map(m => ({ role: m.role, text: String(m.text || '').slice(0, 2000) }));
  }
  function sendExisting(req) {
    if (!req || req.sending) return;
    req.sending = true;
    if (state() === req.phoneState) { pendingSend = req; sendError = null; }
    if (opened && tab === 'contacts' && activeChat === req.contact && state() === req.phoneState) render();
    const api = SP.phoneAI;
    Promise.resolve().then(() => {if(req.owner!==G.ps)throw Error('存档已变化，这条消息没有发送到新的进度。');return api && typeof api.send === 'function'
      ? api.send(req.contact, req.text, req.history)
      : Promise.resolve({ reply: localReply(req.contact), mode: 'local' });})
      .then(result => {
        if (!result || typeof result.reply !== 'string' || !result.reply.trim()) throw new Error('联系人暂时没有回复，请稍后重试。');
        pushMessage({ contact: req.contact, role: 'assistant', text: result.reply.slice(0, 2000), at: C.abs(), mode: result.mode === 'ai' ? 'ai' : 'local' }, req.phoneState);
        if (pendingSend === req) pendingSend = null;
        if (opened && tab === 'contacts' && activeChat === req.contact && state() === req.phoneState) render();
      })
      .catch(err => {
        req.sending = false;
        if (state() === req.phoneState) sendError = { req, message: (err && err.message) || '发送失败，请检查网络和API设置。' };
        if (pendingSend === req) pendingSend = null;
        if (opened && tab === 'contacts' && activeChat === req.contact && state() === req.phoneState) render();
      });
  }
  function sendText(value) {
    if (!opened || phoneOwner !== G.ps) return;
    const contact = activeChat, raw = String(value || ''), msg = raw.trim();
    const phoneState = state();
    if (!contact || !msg || (pendingSend && pendingSend.phoneState === phoneState)) return;
    const p = person(contact); if (!unlocked(p)) return tell('先在社区认识这位联系人，再给TA发消息。');
    if (msg.length > 2000) return tell('单条消息最多2000字，请分开发送。');
    const req = { owner:G.ps, id: ++sendSeq, contact, text: msg, history: historyFor(contact, false), phoneState, sending: false };
    pushMessage({ contact, role: 'user', text: msg, at: C.abs() }, phoneState);
    sendExisting(req);
  }
  function retrySend(req) { if (!req || (pendingSend && pendingSend.phoneState === state())) return; sendExisting(req); }

  function mapApp() { map(); }
  function destinations() {
    const sources=[...(window.SCENE_DATA?.objects||[]),...Object.values(window.SCENE_CHUNKS||{}).flatMap(c=>c?.objects||[]),...(!W.interior?W.objects||[]:SP.place?.street?.objects||[])];
    const main=new Set(STABLE_PLACES.map(p=>p[0]));
    for(const o of sources){if(!o?.name||!main.has(o.id))continue;let p;try{p=W.reachPt?.(o)||o.reach;}catch{continue;}if(Array.isArray(p?.[0]))p=p[0];if(!Array.isArray(p)||!p.slice(0,2).every(Number.isFinite))continue;const entry=POIS.find(q=>q[0]==='place_'+o.id);if(entry){entry[1]=o.name;entry[2]=p[0];entry[3]=p[1];}}
    for(const extra of (SP.mapWorld?.pois?.()||[])){if(POIS.some(q=>q[0]===extra[0]))continue;if(POIS.some(q=>!q[5]?.via&&Math.hypot(q[2]-extra[2],q[3]-extra[3])<1.6))continue;POIS.push(extra.slice());}
    for(const station of (SP.sharedMobility?.stations?.()||[]).slice(0,16)){if(!station||![station.x,station.y].every(Number.isFinite))continue;const entry=POIS.find(p=>p[0]==='parking_'+station.id);if(entry){entry[1]=station.name||entry[1];entry[2]=station.x;entry[3]=station.y;}}
    return POIS;
  }
  function mark(id) {
    if (!destinations().some(p => p[0] === id)) return;
    state().target = id; updateNav(); if (opened && tab === 'map') render(); tell('已标记目的地，尚未出发。可在地图选择出行方式；沿道路和斑马线行走。');
  }
  function showMap(id) {
    if (!G.ps) return false;
    if (external()) { SP.toast('请先返回街道再查看社区地图'); return false; }
    if (!opened && (G.busy() || G.menu || C.ff || SP.player?.carry&&!SP.sharedMobility?.carriedShared?.())) { SP.toast('请先完成当前动作'); return false; }
    tab = 'map'; activeChat = null;
    if (!opened) open(); else render();
    if (id != null) mark(id);
    return opened;
  }
  function viewDestination(id) {
    const p = destinations().find(p => p[0] === id), camera = SP.cameraNavigation;
    if (!p || W.interior || external() || !camera?.canFocus?.()) { tell('请先返回街道，再查看目的地镜头。'); return false; }
    const r = camera.focus(p[2], p[3]);
    if (!r?.ok) { tell(r?.reason || '暂时无法查看目的地镜头。'); return false; }
    close(); SP.toast('镜头查看：'+p[1]+'。人物没有移动；手机地图中可恢复跟随。'); return true;
  }
  function chooseTravel(id){if(!destinations().some(p=>p[0]===id))return;travelChoice={id,owner:G.ps};tab='travel';render();}
  function depart(id,mode,owner=G.ps){
    if(owner!==G.ps){tell('存档已更换，请重新选择目的地。');return false;}
    const p=destinations().find(p=>p[0]===id),N=SP.mapNavigation;if(!p){tell('目的地无效，请重新选择。');return false;}
    if(p[5]?.via==='metro'&&mode!=='metro'){tell('CBD须先步行到地铁站，不能在社区街道直接跨场景骑车到达。');return false;}
    if(p[5]?.via==='metro'){if(!SP.metroJourney?.start){tell('完整地铁行程导航尚未准备好，未出发或扣款。');return false;}mark(id);const r=SP.metroJourney.start({from:'jinghuaili',to:'cbd',name:'CBD'});if(!r?.ok){tell(r?.reason||'暂时无法开始地铁行程，未出发或扣款。');return false;}close();SP.toast('已开始正向地铁行程。到售票机后须本人确认原票款；乘车沿用原过场，停止指引不自动退款。返程仍手动。');return true;}
    if(!N?.start){tell('出行导航尚未准备好，请稍后再试。');return false;}
    mark(id);const r=N.start({id:p[0],name:p[5]?.via==='metro'?'井槐里站（CBD第1段）':p[1],x:p[2],y:p[3],mode:mode==='metro'?'walk':mode});
    if(!r?.ok){tell(r?.reason||'暂时无法出发，人物尚未移动。');return false;}
    close();SP.toast(p[5]?.via==='metro'?'第1段：步行到井槐里站。到站后按原流程购票乘车，再到CBD出站。':mode==='bike'||mode==='ebike'?'先到真实车辆旁；开锁收费须在原扫码界面明确确认，骑行后可在地图继续出行。':'已出发。到建筑门口后仍需本人互动进入；可以在地图停止出行。');return true;
  }
  const finiteEstimate=n=>Number.isFinite(n)&&n>=0;
  function estimateText(e,mode){if(!e||e.ok===false)return e?.reason||'暂时没有可靠估算，请以实际道路与车辆状态为准。';const parts=[];
    if(finiteEstimate(e.distanceMeters))parts.push('路网分段预计约 '+Math.ceil(e.distanceMeters)+' 米（不是完整已规划路线）');
    const pickup=e.pickupWalkMeters??e.walkingMeters,ride=e.rideMeters??e.ridingMeters;if(['bike','ebike'].includes(mode)&&finiteEstimate(pickup)&&finiteEstimate(ride))parts.push('含步行取车约 '+Math.ceil(pickup)+' 米 + 骑行约 '+Math.ceil(ride)+' 米');
    if(finiteEstimate(e.realSeconds)){const seconds=Math.ceil(e.realSeconds);parts.push('预计现实操作 '+(seconds>=60?Math.floor(seconds/60)+'分'+seconds%60+'秒':seconds+'秒'));}
    if(finiteEstimate(e.etaMinutes))parts.push('预计游戏时间 '+Number(e.etaMinutes.toFixed(1))+' 分钟'+(finiteEstimate(e.clockScale)?'（当前1现实秒≈'+e.clockScale+'游戏分钟）':''));
    if(finiteEstimate(e.costCents))parts.push((e.isIncrementalCost?'现有订单预计新增费用':['walk','run'].includes(mode)?'步行段预计费用':'预计本次费用')+' ¥'+(e.costCents/100).toFixed(2));
    if(mode==='bike')parts.push('本游戏新租最低 ¥1.50，每30游戏分钟一档，向上计费');if(mode==='ebike')parts.push('本游戏新租前10游戏分钟 ¥2，之后每10游戏分钟 ¥1，向上计费');
    if(mode==='ebike'){parts.push(e.batteryReachable===true?'当前候选车辆电量预计可达':e.batteryReachable===false?'当前候选车辆电量预计不足':'电量尚未确认，请查看真实车辆');if(finiteEstimate(e.batteryPct))parts.push('当前电量 '+Math.floor(e.batteryPct)+'%');}
    if(Array.isArray(e.assumptions))parts.push(...e.assumptions.filter(s=>typeof s==='string').slice(0,5));parts.push('动态绕行、过街等待及本人扫码确认时间未保证；预计不等于承诺。');return parts.join('；');
  }
  function metroPlan(){const data=window.METRO45?.rules||R.data?.metro,from=data?.stations?.find(s=>s.id==='jinghuaili'),to=data?.stations?.find(s=>s.id==='cbd');if(!from||!to)return{fare:null,rideGameMinutes:null};const km=Math.abs(to.km-from.km),band=data.fare?.bands?.find(b=>km<=b[0]);return{fare:band?.[1]??null,rideGameMinutes:Math.abs(to.min-from.min)};}
  function recommendation(options,metro){if(metro)return'跨区建议地铁：本页步行估算只覆盖去井槐里站这一段；正向可继续实际进站和原乘车流程，票款须本人确认。候车随真实车次变化，站内步行尚无全程ETA；返程仍手动。';const usable=id=>options.find(o=>o.id===id&&o.available&&o.estimate?.ok!==false&&o.estimate?.batteryReachable!==false),walk=usable('walk'),bike=usable('bike'),ebike=usable('ebike'),d=walk?.estimate?.distanceMeters;
    if(finiteEstimate(d)&&d<=150)return'短程建议步行：无需取车和租车收费，门口操作更方便；赶时间可比较跑步，但要考虑体力。';
    const time=o=>finiteEstimate(o?.estimate?.realSeconds)?o.estimate.realSeconds:Infinity,w=time(walk),riders=[bike,ebike].filter(o=>o&&time(o)<w*.8);if(riders.length){const chosen=bike&&riders.includes(bike)&&(!ebike||!riders.includes(ebike)||time(bike)<=time(ebike)*1.25)?bike:riders.reduce((a,b)=>time(a)<time(b)?a:b);return(chosen.id==='bike'?'建议自行车':'建议共享电动车')+'：计入步行取车后，预计仍比全程步行省时；'+(chosen.id==='bike'?'若与电动车用时接近，优先较低费用。':'适合较长距离，请同时核对电量和分档费用。')+'到达仍需本人安全还车。';}
    if(walk)return'建议先比较步行：车辆不可用、取车较远或预计省时不明显时，步行更省操作；费用不是唯一排序依据。';return'暂时不能可靠推荐，请先返回街道，或检查道路、体力和真实车辆状态。';}
  function travelPanel(){const p=destinations().find(p=>p[0]===travelChoice?.id);if(!p){text('p','请返回地图选择目的地。',appBody);return;}heading(appBody,p[1]);text('p',p[4],appBody).className='phone-status';const owner=travelChoice.owner,N=SP.mapNavigation,destination={id:p[0],name:p[5]?.via==='metro'?'井槐里站（CBD第1段）':p[1],x:p[2],y:p[3]},raw=N?.options?.(destination)||[],options=raw.map(o=>({...o,estimate:o.estimate||(finiteEstimate(o.distanceMeters)?o:null)})),find=id=>options.find(o=>o.id===id),metro=p[5]?.via==='metro';
    row(appBody,'出行比较与建议',recommendation(options,metro),{icon:'info'});text('p','以下为已有过街及步行路网的分段近似估算，不是实时完整路径承诺。现实操作时间与游戏时间分开；游戏时钟倍率变化会改变计费档位。',appBody).className='phone-status';
    for(const [id,label]of[['walk','步行'],['run','跑步'],['bike','自行车'],['ebike','共享电动车']]){const o=find(id),available=!metro&&!!o?.available&&o?.estimate?.batteryReachable!==false;const e=row(appBody,label,metro?'CBD跨场景请选下方地铁方案':(o?.reason?o.reason+'；':'')+estimateText(o?.estimate,id),{icon:{walk:'walk',run:'run',bike:'mobility',ebike:'mobility'}[id]});const b=button('以'+label+'出发',e,()=>depart(p[0],id,owner),'phone-btn');b.disabled=!available;}
    const plan=metroPlan(),station=row(appBody,'地铁',metro?'正向阶段：步行到井槐里站 → 实际进站安检 → 售票机本人确认票款'+(finiteEstimate(plan.fare)?'（当前规则预计 ¥'+plan.fare+'）':'')+' → 进闸候车 → 原车次乘车过场'+(finiteEstimate(plan.rideGameMinutes)?'（推进 '+plan.rideGameMinutes+' 游戏分钟）':'')+' → CBD站出闸出站。不是连续车厢模拟；停止指引不自动退票或退款。返程仍手动。 '+estimateText(find('walk')?.estimate,'walk')+' 上述距离、费用和ETA仅属站外步行段，不含地铁票；没有完整进站至出站的总ETA。':'社区内部地点无需跨场景地铁，请选步行或共享骑行。',{icon:'metro'}),b=button('地铁出行 · 导航至CBD',station,()=>depart(p[0],'metro',owner),'phone-btn');b.disabled=!metro||!find('walk')?.available||!SP.metroJourney?.start;
    for(const label of['打车','自驾']){const e=row(appBody,label,'后续开放，目前不能选择。',{icon:'car'}),b=button(label+' · 后续开放',e,()=>{},'phone-btn secondary');b.disabled=true;}
    button('返回地图',appBody,()=>{tab='map';render();},'phone-btn secondary');
  }
  function navigationControls(parent=appBody){const J=SP.metroJourney,j=J?.status?.();if(j?.active){row(parent,'正向地铁行程 · '+(j.label||'按实际阶段进行'),[j.nextAction,j.reason,finiteEstimate(j.fare)?'原票价 ¥'+j.fare+'，本人在原票务菜单确认':'',finiteEstimate(j.waitGameMinutes)?'按真实车次预计等候 '+Number(j.waitGameMinutes.toFixed(1))+' 游戏分钟':'',finiteEstimate(j.rideGameMinutes)?'原乘车过场推进 '+j.rideGameMinutes+' 游戏分钟；不是连续车厢模拟':''].filter(Boolean).join('；'));button('继续正向地铁指引',parent,()=>{const r=J.resume?.();if(r?.ok)close();else tell(r?.reason||'请按当前阶段完成本人票务操作。');},'phone-btn');button('停止地铁指引（不自动退款）',parent,()=>{J.stop('玩家在手机地图停止地铁指引');render();tell('已停止指引。已购票、进站记录和正在进行的原乘车过场均按原规则处理，不自动退票退款。');},'phone-btn secondary');return;}const N=SP.mapNavigation,s=N?.status?.();if(!s)return;if(s.active||s.phase==='await_vehicle'){row(parent,'当前出行',s.phase==='await_vehicle'?'已到车辆旁，尚未开锁。请在原扫码界面确认资费；地图不自动扣费。':s.reason||'正沿实际路线前往入口，手机打开时暂停。');if(s.phase==='await_vehicle'){const show=button('打开原共享车扫码与报价',parent,()=>{const r=SP.sharedMobility?.show?.();if(!r?.ok)tell(r?.reason||'车辆界面暂不可用。');},'phone-btn');show.disabled=!SP.sharedMobility?.show;const resume=button('已确认骑行 · 继续原目的地',parent,()=>{const r=N.resume?.();if(r?.ok)close();else tell(r?.reason||'请先在车辆旁确认骑行。');},'phone-btn');resume.disabled=!N.resume;}button('停止本次出行',parent,()=>{N.stop('玩家在手机地图停止出行');render();tell('已停止；已有租车订单不会自动结算，请本人安全还车。');},'phone-btn secondary');}else if(s.reason)row(parent,'出行状态',s.reason);}
  function payRentNow() { const amt = G.ps.owed; if (!(amt > 0)) return tell('当前不欠房租。'); if (G.ps.money < amt) return tell('零钱不足，未扣款。'); const evs = R.lease.pay(G.ps, C.abs(), true); G.onRuleEvents(evs); G.hud(); render(); tell(`已补交房租 ${dollar(amt)}。`); }
  function payBillsNow() { const result = R.payBills(G.ps, C.abs()); G.onRuleEvents(result.events || []); G.hud(); render(); tell(result.ok ? `已付 ${dollar(result.paid)}，剩余 ${dollar(result.left)}。` : result.reason); }
  function brand(parent, name, sub, cls) { const b = document.createElement('div'); b.className = 'app-brand' + (cls ? ' ' + cls : ''); parent.appendChild(b); text('span', '', b).className = 'app-brand-mark'; const t = document.createElement('div'); b.appendChild(t); text('strong', name, t); text('small', sub, t); return b; }
  function quick(parent, items) { const g = document.createElement('div'); g.className = 'app-quick'; parent.appendChild(g); for (const [label, icon, fn, ok] of items) { const b = button('', g, fn, 'app-quick-btn'); b.setAttribute('aria-label', label); b.disabled = ok === false; const i = text('span', '', b); i.className = 'qi'; if (i.dataset) i.dataset.icon = icon; text('span', label, b).className = 'ql'; } return g; }
  function ledger(parent, limit) {
    const list = (G.ps.log || []).filter(e => e && (Number.isFinite(e.amount) || Number.isFinite(e.pay) || Number.isFinite(e.paid))).slice(-limit).reverse();
    const box = document.createElement('div'); box.className = 'phone-card app-tx'; parent.appendChild(box);
    if (!list.length) { text('p', '暂无收支记录。工资、房租、购物等发生后会在这里列出。', box).className = 'app-empty'; return; }
    const kind = { earn: '收入', spend: '支出', shift_paid: '工资', rent_paid: '房租', bills_paid: '账单', refund: '退款' };
    for (const e of list) { const income = e.type === 'earn' || e.type === 'shift_paid' || e.type === 'refund', amt = Number(e.amount ?? e.pay ?? e.paid) || 0, r = document.createElement('div'); r.className = 'app-tx-row'; box.appendChild(r);
      const l = document.createElement('div'); r.appendChild(l); text('strong', e.why || e.label || kind[e.type] || e.type, l); text('small', `${kind[e.type] || '记录'} · ${Number.isFinite(e.t) ? fmtDate(e.t) : ''}`, l);
      text('span', `${income ? '+' : '−'}${Math.abs(amt).toFixed(2)}`, r).className = 'app-tx-amt' + (income ? ' in' : ''); }
  }
  function bills() {
    brand(appBody, '槐城银行', '个人手机银行 · 游戏内虚构机构');
    hero(appBody, 'bank-card', '活期储蓄 · 零钱余额（元）', Number(G.ps.money || 0).toFixed(2), [`银行活期 ${dollar(G.ps.neighborhoodServices?.bank?.balance)}`, `欠租 ${dollar(G.ps.owed)}`, `待付账单 ${(G.ps.bills || []).length} 笔`]);
    quick(appBody, [['交房租', 'home', payRentNow, G.ps.owed > 0], ['缴账单', 'bill', payBillsNow, (G.ps.bills || []).length > 0], ['ATM网点', 'pin', () => mark('clinic')], ['租约', 'lease', () => goto('lease')]]);
    row(appBody, '账户', `零钱 ${dollar(G.ps.money)} · 银行活期 ${dollar(G.ps.neighborhoodServices?.bank?.balance)}`, { icon: 'wallet' });
    const lease = G.ps.lease || {};
    row(appBody, '租约', `月租 ${dollar(lease.rent)} · 押金 ${dollar(lease.deposit)} · 欠租 ${dollar(G.ps.owed)} · 租期至 ${lease.endDate || '按租约记录'}`, { icon: 'home' });
    button('补交已欠房租', appBody, payRentNow, 'phone-btn');
    heading(appBody, '待付账单');
    const bills = G.ps.bills || [];
    if (!bills.length) row(appBody, '没有待付账单', '水电费用出账后会显示在这里。', { icon: 'bill' });
    for (const b of bills) row(appBody, b.label || '待付账单', dollar(b.amount), { icon: 'bill' });
    button('缴纳待付账单', appBody, payBillsNow, 'phone-btn');
    heading(appBody, '收支明细'); ledger(appBody, 8);
    const preview = R.utilities.preview(G.ps); heading(appBody, '本月预估'); row(appBody, '本月水电及固定费用预计', `${dollar(preview.total)} · 未出账预估，随实际用量变化。`, { icon: 'clock' });
    for (const line of preview.lines) row(appBody, line.label, `${line.qty ?? ''}${line.unit || ''} ${dollar(line.amount)}`, { icon: /水/.test(line.label) ? 'drop' : /电/.test(line.label) ? 'bolt' : 'bill' });
    button('查看 ATM 位置', appBody, () => { mark('clinic'); }, 'phone-btn secondary');
  }
  function leaseApp() {
    brand(appBody, '安居找房', '租房 · 房源 · 租约管理（游戏内虚构平台）');
    const directoryOwner=G.ps;const directory=button('查看住宅入口与可租房源',appBody,()=>{if(!opened||phoneOwner!==directoryOwner||G.ps!==directoryOwner)return;close();const directoryAPI=SP.housingLeases,showDirectory=directoryAPI?.openDirectory||directoryAPI?.open;const r=typeof showDirectory==='function'?showDirectory.call(directoryAPI):{ok:false,reason:'住宅目录暂不可用。'};if(r?.ok===false)SP.toast(r.reason||'请到真实房源入口查看。');},'phone-btn lease-search');directory.style.minHeight='44px';
    const lease = G.ps.lease || {};
    quick(appBody, [['交房租', 'home', payRentNow, G.ps.owed > 0], ['账单', 'bill', () => goto('bank')], ['地图找房', 'pin', () => { tab = 'map'; activeChat = null; render(); mark('shared_home'); }], ['合租公寓', 'people', () => mark('shared_home')]]);
    heading(appBody, '我的租约');
    const house = document.createElement('div'); house.className = 'lease-house'; appBody.appendChild(house);
    const pic = document.createElement('div'); pic.className = 'lease-pic'; house.appendChild(pic); text('span', '在租', pic);
    const info = document.createElement('div'); info.className = 'lease-info'; house.appendChild(info);
    text('strong', '井槐里12号 · 2F-02', info); text('small', `押金 ${dollar(lease.deposit)} · 租期至 ${lease.endDate || '按租约记录'}`, info);
    const price = document.createElement('div'); price.className = 'lease-price'; info.appendChild(price); text('b', Number(lease.rent || 0).toFixed(0), price); text('span', ' 元/月', price);
    const tags = document.createElement('div'); tags.className = 'app-tags'; info.appendChild(tags); for (const t of [G.ps.owed > 0 ? `欠租 ${dollar(G.ps.owed)}` : '无欠租', '到期自动扣费', '房东刘姐']) text('span', t, tags);
    row(appBody, '房东刘姐 · 当前租约', `月租 ${dollar(lease.rent)} · 押金 ${dollar(lease.deposit)} · 欠租 ${dollar(G.ps.owed)} · 租期至 ${lease.endDate || '按租约记录'}`, { icon: 'home' });
    button('补交已欠房租', appBody, payRentNow, 'phone-btn');
    button('查看全部账单', appBody, () => goto('bank'), 'phone-btn secondary');
  }
  function busApp() {
    brand(appBody, '槐城公交', '实时站点 · 线路 · 乘车指引');
    const line = document.createElement('div'); line.className = 'bus-line'; appBody.appendChild(line);
    const top = document.createElement('div'); top.className = 'bus-line-top'; line.appendChild(top); text('b', '社区线', top); text('span', '06:00–23:00 · 单程 ¥2', top);
    for (const [name, dir, id, cls] of [['老街南侧公交站', '东行 → 便民街', 'bus', 'start'], ['便民街北侧公交站', '西行 → 井槐里', 'return_bus', 'end']]) { const st = document.createElement('div'); st.className = 'bus-stop ' + cls; line.appendChild(st); text('i', '', st); const t = document.createElement('div'); st.appendChild(t); text('strong', name, t); text('small', dir + (state().target === id ? ' · 已标记' : ''), t); }
    row(appBody, '社区公交', '06:00–23:00 · 单程 ¥2。老街南站东行、便民街北站西行；到站现场等车，停稳后按 F 上车。', { icon: 'bus' });
    button('标记老街南侧公交站', appBody, () => mark('bus'), 'phone-btn secondary');
    button('标记便民街北侧公交站', appBody, () => mark('return_bus'), 'phone-btn secondary');
    row(appBody, '乘车说明', '手机只提供站点信息与步行指引，乘车需在站台现场完成。', { icon: 'info' });
  }
  function tasks() {
    const ps = G.ps, w = ps.communityWork, d = ps.communityDeliveries?.active, l = ps.communityLibrary?.loan, r = ps.communityRepair;
    brand(appBody, '槐聘', '附近好工作 · 线下到岗办理（游戏内虚构平台）');
    const job = (parent, title, pay, place, tags, status, icon) => { const e = row(parent, title, status, { right: pay, icon, className: 'phone-card job-card' }); const meta = text('div', place, e); meta.className = 'job-place'; const t = document.createElement('div'); t.className = 'app-tags'; e.appendChild(t); for (const x of tags) text('span', x, t); return e; };
    heading(appBody, '推荐职位');
    const J = R.job?.def?.(), playerJob = ps.job;
    job(appBody, '便利店店员', J ? `${J.pay_per_h}元/时` : '按时薪', '24便利店 · 店长赵姐 · 井槐里', ['排班制', '夜班+20%', '员工价便当'], playerJob ? (SP.playerWork?.statusText?.() || '已录用 · 到店内收银台排班') : '到店内收银台找赵姐应聘', 'tasks');
    const workStatus = w ? ({ idle: '待接单', accepted: '已接单', working: '工作中', ready: '待提交', completed: '已完成', cancelled: '已取消' })[w.status] || w.status : '待接单';
    const e = job(appBody, '共享工作间', '80元/单', '邻里共创工作间 · 09:00–20:00', ['每天一单', '2小时', '前台结算'], `状态：${workStatus} · 每天一单 · 09:00–20:00开放 · 每单需工作两小时（120分钟），完成并到前台提交后结算 ¥80。接单、开工和提交都要到现场办理。`, 'tasks'); button('标记工作间', e, () => mark('work'), 'phone-btn secondary');
    job(appBody, '社区配送', '按单结算', '街坊服务站 · 快递柜', ['现场接单', '步行送达'], d ? `进行中：${SP.communityDeliveries?.jobs?.find(j => j.id === d.id)?.destination || d.target} · 到门口按 E 交付。` : '暂无配送单，可在快递柜现场接单。', 'box');
    heading(appBody, '我的事项');
    row(appBody, '借阅', l ? `阅读 ${l.readMinutes}/60 分钟 · ${Math.max(0, Math.ceil((l.dueAt - C.abs()) / 1440))} 天后到期${C.abs() > l.dueAt ? '（已逾期）' : ''}` : '暂无借阅', { icon: 'book' });
    row(appBody, '自行车维修', r ? ({ idle: '未委托', pending: '检修中', ready: '可到门外验收', completed: '已验收' })[r.status] || r.status : '未委托', { icon: 'wrench' });
    row(appBody, '食堂订单', ps.communityCanteen?.meal ? (ps.communityCanteen.meal.packed ? '已打包，可带回家中饭桌吃。' : '已取餐，可在食堂座位吃或到打包台封装。') : '暂无待食用餐盒', { icon: 'meal' });
    row(appBody, '快递取件', `${(G.ps.items['courier-parcel'] || 0) > 0 ? `背包里有 ${G.ps.items['courier-parcel']} 个待送包裹。` : '当前没有待送包裹。'}快递柜业务需到街坊服务站现场办理。`, { icon: 'box' });
  }
  function inventory() {
    const items = G.ps.items || {}, data = R.data.items || {}, entries = Object.entries(items).filter(([, count]) => Number(count) > 0), gear = G.ps.npcConflict?.player?.owned || [];
    hero(appBody, '', '背包物品（件）', String(entries.reduce((n, [, c]) => n + Number(c || 0), 0)), [`${entries.length} 种物品`, `${gear.length} 件随身装备`]);
    if (!entries.length) row(appBody, '背包是空的', '没有物品可直接走地铁安检门；随身装备仍需检查。', { icon: 'bag' });
    for(const id of gear) row(appBody, '随身装备 · '+({knife:'厨房刀',branch:'树枝'}[id]||id), '携带中 · 地铁按物品类别复检', { icon: 'info' });
    if (entries.length) heading(appBody, '物品');
    const grid = document.createElement('div'); grid.className = 'bag-grid'; appBody.appendChild(grid);
    for (const [id, count] of entries) row(grid, data[id]?.label || id.replace(/[_-]/g, ' '), `数量 × ${count}`, { icon: 'bag', className: 'phone-card bag-tile', right: '×' + count });
  }
  function calendar() {
    const now = C.abs(), d = R.date(now), t = currentTime(), today = Math.floor(now / 1440);
    const cal = document.createElement('div'); cal.className = 'cal-month'; appBody.appendChild(cal);
    const head = document.createElement('div'); head.className = 'cal-head'; cal.appendChild(head);
    text('strong', d.y ? `${d.y}年${d.m}月` : `第${today + 1}天`, head); live(text('span', `${t.clock} · ${(()=>{try{return C.seasonName()+' · '+C.weatherName();}catch(_){return '';}})()}`, head), () => `${currentTime().clock} · ${(()=>{try{return C.seasonName()+' · '+C.weatherName();}catch(_){return '';}})()}`);
    const wk = document.createElement('div'); wk.className = 'cal-grid cal-wk'; cal.appendChild(wk); for (const n of '日一二三四五六') text('span', n, wk);
    const grid = document.createElement('div'); grid.className = 'cal-grid'; cal.appendChild(grid);
    const marks = new Set(); if (G.ps.rentDue != null) marks.add(Math.floor(G.ps.rentDue / 1440)); for (const m of (SP.socialFlow?.schedule?.('player') || [])) if (Number.isFinite(m.startAt)) marks.add(Math.floor(m.startAt / 1440));
    const first = today - ((d.d || 1) - 1), lead = ((d.wd - ((d.d || 1) - 1)) % 7 + 7) % 7;
    for (let i = 0; i < lead; i++) text('span', '', grid);
    for (let k = 0; k < 42 - lead; k++) { const day = first + k, dd = R.date(day * 1440); if (k > 0 && dd.d === 1) break; const c = text('span', String(dd.d ?? k + 1), grid); c.className = (day === today ? 'today' : '') + (marks.has(day) ? ' mark' : '') + (dd.off ? ' off' : ''); }
    heading(appBody, '日程');
    for(const m of (SP.socialFlow?.schedule?.('player')||[]).slice(-6))row(appBody,'街坊小聚 · '+m.status,fmtDate(m.startAt)+' — '+fmtDate(m.endAt)+' · 原会面点（'+m.x.toFixed(1)+'，'+m.y.toFixed(1)+'）'+(m.status==='我已退出'?' · 已释放这次约定时间':' · 需要本人到场')+(m.revisions?.length?' · 已全员确认改期':'')+(m.pendingChange?' · 改期提议 '+fmtDate(m.pendingChange.startAt)+' 尚待全员确认，原时间保持':''),{icon:'people'});
    { const today = row(appBody, '今天', `${fmtDate(C.abs())} · ${C.seasonName()} · ${C.weatherName()}`, { icon: 'calendar' }), p = today.children && today.children[today.children.length - 1]; if (p && p.tagName === 'P') live(p, () => `${fmtDate(C.abs())} · ${C.seasonName()} · ${C.weatherName()}`); }
    row(appBody, '租金到期', G.ps.rentDue != null ? (() => { const d = R.date(G.ps.rentDue); return `${d.m}月${d.d}日 · 欠租 ${dollar(G.ps.owed)}`; })() : '以租约为准', { icon: 'home' });
    heading(appBody, '出行时刻');
    row(appBody, '社区公交', '06:00–23:00，单程 ¥2。老街南站东行、便民街北站西行；停稳后按 F 上车。', { icon: 'bus' });
    row(appBody, '3号线', '06:00–23:00 · 双向运行。进站先过安检，再刷卡或扫码；按站台目的地方向候车。', { icon: 'metro' });
    row(appBody, '手机服务范围', '公交和地铁须到站点现场乘坐；手机不支持地铁或CBD室内定位或叫车。外卖用“外卖”App，骑手按路线送到楼下或门口；网购用“购物”App，送到驿站快递柜或上门，须本人签收或取件。', { icon: 'info' });
    button('标记地铁站', appBody, () => mark('metro'), 'phone-btn secondary');
  }
  function avatarNode(p, parent, cls) { const a = text('div', p.avatar || (p.name || '邻').slice(0, 1), parent); a.className = cls || 'phone-avatar'; a.style.background = p.color || '#6587bf'; a.setAttribute('aria-hidden', 'true'); return a; }
  function latestFor(id) { const m = state().messages.filter(m => m.contact === id).at(-1); return m; }
  function contactList() {
    const contacts = people();
    if (!contacts.length) row(appBody, '暂无联系人', '到社区和居民见面后，可以在这里联系他们。');
    for (const p of contacts) {
      const allowed = unlocked(p), last = latestFor(p.id), b = document.createElement('button'); b.type = 'button'; b.className = 'phone-contact'; b.disabled = !allowed; b.onclick = () => { if (allowed) { activeChat = p.id; render(); } }; appBody.appendChild(b);
      avatarNode(p, b);
      const info = document.createElement('div'); info.className = 'phone-contact-info'; b.appendChild(info); text('strong', p.name || p.id, info);
      text('small', last?.text || p.role || '发消息', info);
      if (last) text('span', time(last.at).clock, b).className = 'phone-contact-time';
      if (!allowed) text('small', '需先在社区认识', b);
    }
    if (!SP.phoneAI) row(appBody, '聊天回复', '当前使用本地居民回应；AI连接可在“设置”中配置。');
  }
  function chatView() {
    const p = person(activeChat), shellChat = document.createElement('div'); shellChat.className = 'phone-chat'; appBody.className = 'phone-chat-host'; appBody.appendChild(shellChat);
    const meta = text('div', p.role || '社区联系人', shellChat); meta.className = 'phone-chat-meta';
    const log = document.createElement('div'); log.className = 'phone-chat-log'; shellChat.appendChild(log);
    const msgs = state().messages.filter(m => m.contact === activeChat && (m.role === 'user' || m.role === 'assistant'));
    let lastDay = null;
    for (const m of msgs) {
      const tm = time(m.at); if (lastDay !== tm.day) { text('div', tm.date, log).className = 'phone-chat-time'; lastDay = tm.day; }
      const rowEl = document.createElement('div'); rowEl.className = `phone-bubble-row ${m.role}`; log.appendChild(rowEl);
      avatarNode(p, rowEl, 'phone-bubble-avatar'); const body = document.createElement('div'); body.className = 'phone-bubble-wrap'; rowEl.appendChild(body);
      const bubble = text('div', m.text || '', body); bubble.className = 'phone-bubble';
      text('span', `${tm.clock}${m.mode === 'ai' ? ' · AI' : ''}`, body).className = 'phone-message-time';
    }
    if (pendingSend?.phoneState === state() && pendingSend?.contact === activeChat) text('div', '发送中…', log).className = 'phone-send-state';
    if (sendError?.req?.phoneState === state() && sendError?.req?.contact === activeChat) {
      const e = document.createElement('div'); e.className = 'phone-send-error'; log.appendChild(e); text('span', `发送失败：${sendError.message} `, e);
      button('重试', e, () => retrySend(sendError.req));
    }
    const chatOwner=G.ps,chatId=activeChat,sendCurrent=value=>{if(opened&&phoneOwner===chatOwner&&G.ps===chatOwner&&activeChat===chatId)sendText(value);};
    const quick=document.createElement('div');quick.className='phone-chat-quick';shellChat.appendChild(quick);for(const label of [...(['daily_wen','daily_shen'].includes(activeChat)?['你现在做什么工作？','便利店还招人吗？','你约好的班次几点？']:[]),'有空串门吗？','最近案件有什么进展？','邀请我参加小聚','我不参加小聚了','小聚推迟30分钟','小聚改期进度'])button(label,quick,()=>sendCurrent(label));
    const compose = document.createElement('form'); compose.className = 'phone-chat-compose'; compose.onsubmit = e => { e.preventDefault(); const area = compose.querySelector('textarea'); sendCurrent(area.value); if (!pendingSend && !sendError) area.value = ''; };
    const area = document.createElement('textarea'); area.rows = 1; area.maxLength = 2000; area.placeholder = '发消息…'; area.setAttribute('aria-label', '消息内容'); compose.appendChild(area);
    area.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); compose.requestSubmit(); } });
    const send = text('button', '发送', compose); send.type = 'submit'; send.disabled = !!pendingSend && pendingSend.phoneState === state();
    shellChat.appendChild(compose);
    requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; if (!pendingSend && !sendError) area.focus({ preventScroll: true }); });
    appBody.className = 'phone-chat-host';
  }
  function heardNotesApp(){const owner=G.ps;if(SP.heardNotesUI?.render)return SP.heardNotesUI.render(appBody,{isCurrent:()=>opened&&tab==='heard'&&phoneOwner===owner&&G.ps===owner});text('p','听闻笔记暂时还未准备好，请稍后再看。',appBody).className='phone-status';}
  function commerceApp(which){const owner=G.ps;const ui=SP.commerceUI;if(!ui?.[which==='takeout'?'takeout':'shop']){text('p',(which==='takeout'?'外卖':'购物')+'暂时还未准备好，请稍后再看。',appBody).className='phone-status';return;}ui[which==='takeout'?'takeout':'shop'](appBody,{isCurrent:()=>opened&&tab===which&&phoneOwner===owner&&G.ps===owner,rerender:()=>{if(opened&&tab===which&&phoneOwner===owner&&G.ps===owner)render();}});}
  function newsApp(){const owner=G.ps;if(SP.mediaNewsUI?.render)return SP.mediaNewsUI.render(appBody,{isCurrent:()=>opened&&tab==='news'&&phoneOwner===owner&&G.ps===owner});text('p','新闻暂时还未准备好，请稍后再看。',appBody).className='phone-status';}
  function neighborhoodUpdates(){const owner=G.ps;if(SP.socialRetrospectionUI?.renderPlayer)return SP.socialRetrospectionUI.renderPlayer(appBody,{isCurrent:()=>opened&&tab==='neighborhood'&&phoneOwner===owner&&G.ps===owner,onAsk:id=>{if(!opened||tab!=='neighborhood'||phoneOwner!==owner||G.ps!==owner)return false;close();const r=SP.socialRetrospection?.ask?.(id);SP.toast(r?.text||r?.reason||'请走近后当面问本人。');return !!r?.ok;}});text('p','街坊近况暂时还未准备好，请稍后再看。',appBody).className='phone-status';}
  function chatSettings() {
    const keysPanel=document.createElement("section");keysPanel.className="phone-card phone-keys";appBody.appendChild(keysPanel);SP.keybindings?.render(keysPanel);
    const mobilityOwner=G.ps;const mobility=button('共享出行',appBody,()=>{if(!opened||phoneOwner!==mobilityOwner||G.ps!==mobilityOwner)return;close();const r=SP.sharedMobility?.show?.();if(!r?.ok)SP.toast(r?.reason||'共享出行暂不可用。');},'phone-btn phone-list-btn first');mobility.style.minHeight='44px';if(mobility.dataset)mobility.dataset.icon='mobility';
    const heardOwner=G.ps;const heard=button('私人听闻笔记',appBody,()=>{if(!opened||phoneOwner!==heardOwner||G.ps!==heardOwner){close();return;}goto('heard');},'phone-btn phone-list-btn');heard.style.minHeight='44px';if(heard.dataset)heard.dataset.icon='heard';
    const newsOwner=G.ps;const news=button('新闻与公众号',appBody,()=>{if(!opened||phoneOwner!==newsOwner||G.ps!==newsOwner){close();return;}goto('news');},'phone-btn phone-list-btn');news.style.minHeight='44px';if(news.dataset)news.dataset.icon='news';
    const owner=G.ps;const updates=button('街坊近况',appBody,()=>{if(!opened||phoneOwner!==owner||G.ps!==owner){close();return;}goto('neighborhood');},'phone-btn phone-list-btn last');updates.style.minHeight='44px';if(updates.dataset)updates.dataset.icon='neighborhood';
    const api = SP.phoneAI, s = api && typeof api.settings === 'function' ? api.settings() : { endpoint: '', model: '', enabled: false, hasApiKey: false };
    const warning = document.createElement('div'); warning.className = 'phone-warning';
    text('div', '这是全局 API 配置：手机聊天、现场交谈、路人交谈、警务多人对话、受击反应与列传润色共用。默认使用本地回复；启用后，主动交谈、点击润色以及攻击触发的 NPC 反应会使用接口；反应调用有限频，失败使用本地台词。API 设置会保存在本机，并随游戏存档保存；导出的游戏存档包含 Key，请作为私人文件保管。接口地址改变时，留空会清除原 Key。', warning); appBody.appendChild(warning);
    const form = document.createElement('form'); appBody.appendChild(form);
    const field = (label, type, value, placeholder) => { const wrap = text('label', label, form); wrap.className = 'phone-field'; const input = document.createElement('input'); input.type = type; input.value = value || ''; input.placeholder = placeholder || ''; wrap.appendChild(input); return input; };
    const endpoint = field('API Endpoint（兼容 Chat Completions）', 'url', s.endpoint || '', 'https://服务地址/v1 或完整 /chat/completions');
    const model = field('模型名称', 'text', s.model || '', '例如 gpt-4.1-mini');
    const key = field('API Key（本机与存档保存）', 'password', '', s.hasApiKey ? '已配置；接口地址不变时留空可保留' : 'sk-…'); key.autocomplete = 'new-password';
    const line = document.createElement('div'); line.className = 'phone-setting-toggle'; form.appendChild(line); text('span', '允许发送时调用 AI', line);
    const enabled = document.createElement('input'); enabled.type = 'checkbox'; enabled.checked = !!s.enabled; line.appendChild(enabled);
    const status = text('div', s.enabled ? (s.hasApiKey ? 'AI已启用 · 设置已保留' : 'AI已启用 · 尚未填写Key') : 'AI关闭 · 使用本地回复', form); status.className = 'phone-status';
    const save = text('button', '应用设置', form); save.type = 'submit'; save.className = 'phone-btn';
    form.onsubmit = async e => {
      e.preventDefault(); if (!api || typeof api.configure !== 'function') { status.textContent = 'AI模块尚未接入；当前仍使用本地回复。'; return; }
      save.disabled = true; status.textContent = '正在应用…';
      try {
        const result = await api.configure({ endpoint: endpoint.value.trim(), model: model.value.trim(), apiKey: key.value, enabled: enabled.checked });
        key.value = ''; status.textContent = result?.message || (enabled.checked ? (result?.hasApiKey ? '设置已应用并保留；游戏存档也会保存这些设置。' : '设置已应用，但当前没有配置 API Key。') : 'AI已关闭，联系人将使用本地回复。');
      } catch (err) { status.textContent = `设置未应用：${err?.message || '请检查连接设置。'}`; }
      finally { save.disabled = false; }
    };
  }
  function districtJumpBar(parent) {
    const rows = SP.districtJump?.list?.();
    if (!rows || !rows.length || !parent) return;
    const bar = document.createElement('div'); bar.className = 'district-jump'; parent.appendChild(bar);
    text('span', '区级总览', bar).className = 'district-jump-label';
    for (const d of rows) button(d.name, bar, () => {
      const r = SP.districtJump.go(d.id);
      if (r?.ok) close();
      else tell(r?.reason || '现在不能跳到这个区。');
    }, 'phone-btn secondary');
  }
  function homeScreen() {
    const home = document.createElement('div'); home.className = 'phone-home'; appBody.appendChild(home);
    const t = currentTime(), widget = document.createElement('div'); widget.className = 'phone-home-widget'; home.appendChild(widget);
    live(text('div', t.clock, widget), () => currentTime().clock).className = 'w-time'; live(text('div', (()=>{try{return C.weatherName();}catch(_){return '';}})(), widget), () => { try { return C.weatherName(); } catch (_) { return ''; } }).className = 'w-weather'; live(text('div', `${t.date} · ${(()=>{try{return C.seasonName();}catch(_){return '';}})()}`, widget), () => `${currentTime().date} · ${(()=>{try{return C.seasonName();}catch(_){return '';}})()}`).className = 'w-date';
    const tgtId = G.ps?.phone?.target || null, tgt = tgtId ? destinations().find(p => p[0] === tgtId) : null; text('div', tgt ? `导航目的地 · ${tgt[1]}` : '未设置目的地 · 打开地图选择出行', widget).className = 'w-target';
    const note = text('div', '社区生活服务', home); note.className = 'phone-home-note';
    districtJumpBar(home);
    const apps = [
      ['heard','听闻','👂','#8a695c'], ['news','新闻','📰','#496cb5'], ['contacts', '微信', '💬', '#15b532'], ['bank', '银行', '🏦', '#e7a22e'], ['map', '地图', '🗺️', '#28c963'], ['lease', '租房', '🏠', '#5652d9'],
      ['tasks', '招聘', '💼', '#1687f8'], ['bus', '公交', '🚌', '#ff9411'], ['more', '更多', '···', '#92969d'], ['bag', '背包', '🎒', '#bc42e8'], ['calendar', '日历', '🗓️', '#20bd5b'], ['takeout', '外卖', '🍱', '#f5a623'], ['shop', '购物', '🛍️', '#f2542d']
    ];
    const grid = document.createElement('div'); grid.className = 'phone-icon-grid'; home.appendChild(grid);
    for (const [id, label, glyph, color] of apps) appIcon(id, label, glyph, color, grid);
    const dock = document.createElement('div'); dock.className = 'phone-dock'; home.appendChild(dock);
    for (const [id, label, glyph, color] of [['contacts', '微信', '💬', '#15b532'], ['bank', '银行', '🏦', '#e7a22e'], ['map', '地图', '🗺️', '#28c963'], ['more', '更多', '···', '#92969d']]) appIcon(id, label, glyph, color, dock, true);
  }
  function appIcon(id, label, glyph, color, parent, dock = false) {
    const iconOwner=G.ps;const b = button('', parent, () => {if(!opened||phoneOwner!==iconOwner||G.ps!==iconOwner){return;}goto(id === 'more' ? 'settings' : id);}, 'phone-app-icon'); b.setAttribute('aria-label', label);
    const g = text('span', glyph, b); g.className = 'glyph'; if (g.dataset) g.dataset.icon = id; g.style.background = `linear-gradient(145deg,${color},${color}dd)`;
    if (!dock) text('span', label, b).className = 'label';
  }
  function screenContent() {
    appBody.replaceChildren(); appBody.className = '';
    const theme = tab === 'wallet' ? 'bank' : tab; if (appBody.dataset) appBody.dataset.app = theme; if (shell?.dataset) shell.dataset.app = theme;
    const titles = { home: '李默的 iPhone', map: '地图', travel:'选择出行方式', bank: '银行', wallet: '钱包与账单', lease: '租房', tasks: '招聘与工作', bus: '公交', contacts: activeChat ? personName(activeChat) : '微信', calendar: '日历', bag: '背包', settings: '更多', neighborhood: '街坊近况', news:'新闻与公众号', heard:'私人听闻笔记', takeout:'街坊外卖', shop:'槐集优选' };
    appTitle.textContent = titles[tab] || '槐城生活';
    backButton.textContent = tab === 'home' ? '' : activeChat ? '‹ 微信' : '‹ 返回'; backButton.disabled = tab === 'home';
    backButton.onclick = () => { if (activeChat) { activeChat = null; render(); } else goto('home'); };
    rightButton.textContent = '关闭';
    rightButton.hidden = false;
    rightButton.onclick = close;
    if (tab === 'home') homeScreen();
    else if (tab === 'map') mapApp();
    else if (tab === 'travel') travelPanel();
    else if (tab === 'wallet' || tab === 'bank') bills();
    else if (tab === 'lease') leaseApp();
    else if (tab === 'bus') busApp();
    else if (tab === 'tasks') tasks();
    else if (tab === 'contacts') activeChat ? chatView() : contactList();
    else if (tab === 'calendar') calendar();
    else if (tab === 'bag') inventory();
    else if (tab === 'settings') chatSettings();
    else if (tab === 'neighborhood') neighborhoodUpdates();
    else if (tab === 'news') newsApp();
    else if (tab === 'heard') heardNotesApp();
    else if (tab === 'takeout' || tab === 'shop') commerceApp(tab);
  }
  /* ===== phone-map-nav: real world map (SP.mapWorld + SP.phoneMapView), search, categories, route preview + steps ===== */
  let mapView = null, mapSel = null, mapCam = null, mapQuery = '', mapCat = 'all', mapPreview = null;
  const MAP_CHIPS = [['all', '全部'], ['transit', '公交地铁'], ['life', '生活服务'], ['shop', '购物'], ['school', '学校'], ['park', '公园景点'], ['work', '办公'], ['home', '住宅'], ['parking', '共享停放']];
  function poiCat(p) {
    if (p[5]?.cat) return p[5].cat; if (p[5]?.via === 'metro' || p[0] === 'metro') return 'metro'; if (['bus', 'return_bus'].includes(p[0])) return 'transit';
    if (p[0].startsWith('parking_')) return 'parking'; if (['home', 'shared_home', 'place_modern_residence_door', 'place_modern_residence_B_door'].includes(p[0])) return 'home';
    if (p[0] === 'place_shop24_S1F_1_shop' || p[0] === 'petshop') return 'shop'; if (p[0] === 'work') return 'work'; return 'life';
  }
  const chipMatch = (cat, chip) => chip === 'all' || cat === chip || chip === 'transit' && cat === 'metro';
  function selectPoi(id, center) { mapSel = id; mapPreview = null; const p = destinations().find(q => q[0] === id); if (p && center) mapCam = { ...(mapCam || {}), x: p[2], y: p[3], s: Math.max(mapCam?.s || 0, 1.6) }; render(); if (appBody) appBody.scrollTop = 0; }
  function previewRoute(id) {
    const p = destinations().find(q => q[0] === id), N = SP.mapNavigation; if (!p) return;
    if (!N?.preview) { tell('路线规划尚未准备好。'); return; }
    const r = N.preview({ id: p[0], name: p[5]?.via === 'metro' ? '井槐里站' : p[1], x: p[2], y: p[3] });
    if (!r?.ok) { tell(r?.reason || '暂时无法规划路线。'); return; }
    mapSel = id; mapPreview = { id, route: r }; render(); mapView?.fitRoute?.(); if (mapView?.cam) mapCam = { ...mapView.cam };
    tell('路线约 ' + r.length + ' 米，共 ' + Math.max(1, r.steps.length - 1) + ' 段：避开建筑和水面，过马路只走斑马线，过河走桥。仅预览，人物未移动。');
  }
  function stepsList(parent, steps, current) {
    const ol = document.createElement('ol'); ol.className = 'amap-steps'; parent.appendChild(ol);
    steps.forEach((st, i) => { const li = text('li', st.text, ol); li.className = 'amap-step ' + (st.kind || '') + (i === current ? ' now' : i < (current ?? -1) ? ' done' : ''); });
    return ol;
  }
  function map() {
    if (!SP.phoneMapView) return legacyMap();
    const all = destinations(), onStreet = !W.interior && !external() && Number.isFinite(SP.player?.x), N = SP.mapNavigation, navS = N?.status?.();
    if (mapView) { if (mapView.cam) mapCam = { ...mapView.cam }; mapView.destroy(); mapView = null; }
    if (mapSel && !all.some(p => p[0] === mapSel)) mapSel = null;
    const stage = document.createElement('div'); stage.className = 'amap-stage amap-v2'; appBody.appendChild(stage);
    const search = document.createElement('div'); search.className = 'amap-search'; stage.appendChild(search);
    text('span', '槐城地图', search).className = 'amap-brand';
    const q = document.createElement('input'); q.type = 'search'; q.placeholder = '搜地点、道路、车站'; q.value = mapQuery; q.setAttribute('aria-label', '搜索地图地点'); search.appendChild(q);
    const dist = p => onStreet ? Math.round(Math.hypot(p[2] - SP.player.x, p[3] - SP.player.y)) : null;
    mapView = SP.phoneMapView.create(stage, { pois: all, selected: mapSel, target: state().target, category: poiCat, onSelect: id => selectPoi(id, false),
      onRegion: name => tell(name ? '这里是「' + name + '」。点按圆形地点标记查看详情。' : '点按圆形地点标记查看详情；双指或滚轮缩放，拖动平移。'),
      hidePlayer: () => !onStreet, filter: null });
    if (mapCam) { mapView.cam = { ...mapCam }; mapView.draw(); } else if (onStreet) mapView.centerOn(SP.player.x, SP.player.y, 1.3);
    const keep = () => { if (mapView?.cam) mapCam = { ...mapView.cam }; };
    if (navS?.active && navS.route) mapView.setRoute({ points: navS.route, steps: navS.steps || [] });
    else if (mapPreview && mapPreview.id === mapSel) mapView.setRoute(mapPreview.route);
    const fab = document.createElement('div'); fab.className = 'amap-fab'; stage.appendChild(fab);
    const zin = button('', fab, () => { mapView.zoom(1.6); keep(); }, 'amap-fab-btn zoomin'); zin.setAttribute('aria-label', '放大地图');
    const zout = button('', fab, () => { mapView.zoom(1 / 1.6); keep(); }, 'amap-fab-btn zoomout'); zout.setAttribute('aria-label', '缩小地图');
    const locate = button('', fab, () => { if (onStreet) { mapView.centerOn(SP.player.x, SP.player.y, Math.max(mapView.cam.s, 1.6)); keep(); } const r = SP.cameraNavigation?.follow?.(); tell(r?.ok ? '地图已回到你的位置，镜头已恢复跟随人物。' : r?.reason || '镜头跟随暂不可用。'); }, 'amap-fab-btn locate'); locate.setAttribute('aria-label', '定位到我（恢复人物镜头跟随）'); locate.disabled = !SP.cameraNavigation?.follow && !onStreet;
    const fitAll = button('', fab, () => { mapView.fit(); keep(); }, 'amap-fab-btn fitall'); fitAll.setAttribute('aria-label', '查看全图');
    const clear = button('', fab, () => { state().target = null; mapPreview = null; updateNav(); render(); tell('已清除目的地。'); }, 'amap-fab-btn clear'); clear.setAttribute('aria-label', '清除导航目的地');
    const sheet = document.createElement('div'); sheet.className = 'amap-sheet'; appBody.appendChild(sheet);
    text('div', '', sheet).className = 'amap-handle';
    districtJumpBar(sheet);
    navigationControls(sheet);
    if (navS?.active && Array.isArray(navS.steps) && navS.steps.length) { const card = row(sheet, '路线指引 · 剩余约 ' + (navS.routeRemaining ?? Math.round(navS.remaining)) + ' 米', navS.next ? (navS.next.in > 0 ? navS.next.in + ' 米后：' : '现在：') + navS.next.text : '', { icon: 'pin', className: 'phone-card amap-guide' }); stepsList(card, navS.steps, navS.stepIndex); }
    const sel = mapSel && all.find(p => p[0] === mapSel);
    if (sel) {
      const cat = poiCat(sel), meta = SP.phoneMapView.CAT[cat] || SP.phoneMapView.CAT.life, d = dist(sel);
      const card = row(sheet, sel[1], sel[4], { right: meta.label + (d != null ? ' · 直线 ' + d + ' 米' : ''), icon: cat === 'parking' ? 'mobility' : cat === 'transit' || cat === 'metro' ? 'bus' : 'pin', className: 'phone-card amap-selected' });
      const pr = mapPreview?.id === sel[0] ? mapPreview.route : null;
      if (pr) { text('p', '步行路线约 ' + pr.length + ' 米（避开建筑与水面，斑马线过街，过河走桥）', card).className = 'amap-route-sum'; stepsList(card, pr.steps); }
      const b0 = button(pr ? '重新规划路线' : '路线预览', card, () => previewRoute(sel[0]), 'phone-btn secondary'); b0.disabled = !onStreet || !N?.preview;
      button('出发 · 选择方式', card, () => chooseTravel(sel[0]), 'phone-btn');
      button(state().target === sel[0] ? '已标记' : '设为目的地', card, () => { mark(sel[0]); mapView?.setTarget(sel[0]); }, 'phone-btn secondary');
      const view = button(sel[5]?.via === 'metro' ? '只看出发站镜头' : '只看目的地镜头', card, () => viewDestination(sel[0]), 'phone-btn secondary'); view.disabled = W.interior || external() || !SP.cameraNavigation?.canFocus?.();
      button('收起', card, () => { mapSel = null; mapPreview = null; render(); }, 'phone-btn secondary');
    }
    const chips = document.createElement('div'); chips.className = 'amap-chips'; sheet.appendChild(chips);
    text('p', '地图上北下南、左西右东，按真实街区数据绘制（道路、人行道、河与溪、公园、建筑、公交线）；主画面是45°旋转视角，地点不固定在屏幕某个角。蓝点是你，箭头是朝向；拖动平移，双指/滚轮缩放。仅标记不会移动；选择出发后沿真实道路出行，不会传送或自动进门。过街走斑马线，过河走桥。', sheet).className = 'phone-status';
    const list = all.map(p => ({ p, cat: poiCat(p), d: dist(p) })).sort((a, b) => (a.p[5]?.via ? 1 : 0) - (b.p[5]?.via ? 1 : 0) || (a.d ?? 0) - (b.d ?? 0));
    const cards = [];
    for (const { p, cat, d } of list) {
      const meta = SP.phoneMapView.CAT[cat] || SP.phoneMapView.CAT.life;
      const e = row(sheet, p[5]?.via === 'metro' ? `跨区行程 · ${p[1]}` : p[1], p[4], { right: (state().target === p[0] ? '已标记 · ' : '') + meta.label + (d != null && !p[5]?.via ? ' · ' + d + ' 米' : ''), icon: p[5]?.via === 'metro' ? 'metro' : cat === 'parking' ? 'mobility' : cat === 'transit' || cat === 'metro' ? 'bus' : 'pin' });
      if (e.dataset) e.dataset.cat = cat;
      cards.push([e, cat, `${p[1]} ${p[4]} ${meta.label}`]);
      if (!p[5]?.via) button('在地图上看', e, () => selectPoi(p[0], true), 'phone-btn secondary');
      button('出发 · 选择方式', e, () => chooseTravel(p[0]), 'phone-btn');
      button(state().target === p[0] ? '已标记' : '设为目的地', e, () => mark(p[0]), 'phone-btn secondary');
      const v = button(p[5]?.via === 'metro' ? '只看出发站镜头' : '只看目的地镜头', e, () => viewDestination(p[0]), 'phone-btn secondary'); v.disabled = W.interior || external() || !SP.cameraNavigation?.canFocus?.();
    }
    /* roads / water / parks are searchable too: show them on the map (not destinations) */
    const regionRows = [];
    for (const r of (SP.mapWorld?.regions?.() || []).filter(r => ['road', 'water', 'park', 'district', 'bridge'].includes(r.kind))) {
      if (regionRows.some(x => x[2] === r.name)) continue;
      const e = row(sheet, r.name, { road: '道路', water: '水系', park: '公园', district: '片区', bridge: '桥' }[r.kind] + ' · 在地图上显示位置', { icon: 'pin', className: 'phone-card amap-region' }); e.hidden = true;
      button('在地图上看', e, () => { mapCam = { x: (r.rect[0] + r.rect[2]) / 2, y: (r.rect[1] + r.rect[3]) / 2, s: Math.max(mapCam?.s || 1, 1.2) }; mapView.centerOn(mapCam.x, mapCam.y, mapCam.s); keep(); tell('地图已移到「' + r.name + '」。'); }, 'phone-btn secondary');
      regionRows.push([e, r.kind, r.name]);
    }
    const apply = () => {
      const term = String(q.value || '').trim(); mapQuery = term;
      for (const [e, c, words] of cards) e.hidden = !chipMatch(c, mapCat) || !!term && !words.includes(term);
      for (const [e, , name] of regionRows) e.hidden = !term || !name.includes(term) || mapCat !== 'all';
      mapView.setFilter(mapCat === 'all' ? null : p => chipMatch(poiCat(p), mapCat));
    };
    const chipButtons = [];
    for (const [id, label] of MAP_CHIPS) { const c = button(label, chips, () => { mapCat = id; for (const b of chipButtons) b.className = 'amap-chip' + (b === c ? ' on' : ''); apply(); }, 'amap-chip' + (id === mapCat ? ' on' : '')); chipButtons.push(c); }
    q.oninput = apply; apply();
    const follow = button('恢复人物镜头跟随', sheet, () => { const r = SP.cameraNavigation?.follow?.(); tell(r?.ok ? '镜头已恢复跟随人物。' : r?.reason || '镜头跟随暂不可用。'); }, 'phone-btn secondary'); follow.disabled = !SP.cameraNavigation?.follow;
    button('清除目的地', sheet, () => { state().target = null; mapPreview = null; updateNav(); render(); tell('已清除目的地。'); }, 'phone-btn secondary');
  }
  function legacyMap() {
    const stage = document.createElement('div'); stage.className = 'amap-stage'; appBody.appendChild(stage);
    const search = document.createElement('div'); search.className = 'amap-search'; stage.appendChild(search);
    text('span', '槐城地图', search).className = 'amap-brand';
    const q = document.createElement('input'); q.type = 'search'; q.placeholder = '搜索地点、车站、停放区'; q.setAttribute('aria-label', '搜索地图地点'); search.appendChild(q);
    const cv = document.createElement('canvas'); cv.width = 560; cv.height = 260; cv.className = 'phone-map-canvas'; cv.setAttribute('aria-label', '社区地图：上北下南，含最东侧栖和公寓101室'); stage.appendChild(cv);
    const fab = document.createElement('div'); fab.className = 'amap-fab'; stage.appendChild(fab);
    const locate = button('', fab, () => { const r = SP.cameraNavigation?.follow?.(); tell(r?.ok ? '镜头已恢复跟随人物。' : r?.reason || '镜头跟随暂不可用。'); }, 'amap-fab-btn locate'); locate.setAttribute('aria-label', '定位到我（恢复人物镜头跟随）'); locate.disabled = !SP.cameraNavigation?.follow;
    const clear = button('', fab, () => { state().target = null; updateNav(); render(); tell('已清除目的地。'); }, 'amap-fab-btn clear'); clear.setAttribute('aria-label', '清除导航目的地');
    const sheet = document.createElement('div'); sheet.className = 'amap-sheet'; appBody.appendChild(sheet);
    text('div', '', sheet).className = 'amap-handle';
    destinations(); navigationControls(sheet);
    const chips = document.createElement('div'); chips.className = 'amap-chips'; sheet.appendChild(chips);
    text('p', '地图上北下南、左西右东；主画面是45°旋转视角，栖和公寓不固定在屏幕右上角。编号对应地点，蓝点是你。仅标记不会移动；选择出发后沿真实道路出行，不会传送或自动进门。过街走斑马线。', sheet).className = 'phone-status';
    const data = window.SCENE_DATA || (!W.interior ? W.data : SP.place?.street?.data) || {}, bounds = data.bounds || {}, points = POIS.map(p => [p[2], p[3]]);
    if (!W.interior && !external() && Number.isFinite(SP.player?.x) && Number.isFinite(SP.player?.y)) points.push([SP.player.x, SP.player.y]);
    if ([bounds.x0,bounds.y0,bounds.x1,bounds.y1].every(Number.isFinite)) points.push([bounds.x0,bounds.y0],[bounds.x1,bounds.y1]);
    const x0 = Math.min(...points.map(p=>p[0])), x1 = Math.max(...points.map(p=>p[0])), y0 = Math.min(...points.map(p=>p[1])), y1 = Math.max(...points.map(p=>p[1])), pad = 26;
    const scale = Math.min((cv.width-pad*2)/Math.max(1,x1-x0),(cv.height-pad*2)/Math.max(1,y1-y0)), mx=(x0+x1)/2, my=(y0+y1)/2;
    const ctx = cv.getContext('2d'), xy = (x,y) => [cv.width/2+(x-mx)*scale,cv.height/2-(y-my)*scale];
    ctx.fillStyle = '#eef1ea'; ctx.fillRect(0, 0, cv.width, cv.height);
    for (const [w, c] of [[11, '#d9dde3'], [7, '#ffffff']]) { ctx.strokeStyle = c; ctx.lineWidth = w; for (const lane of data.traffic?.lanes || []) { if (!Array.isArray(lane.range) || !Number.isFinite(lane.c)) continue; const a=lane.axis==='x'?[lane.range[0],lane.c]:[lane.c,lane.range[0]], b=lane.axis==='x'?[lane.range[1],lane.c]:[lane.c,lane.range[1]]; ctx.beginPath();ctx.moveTo(...xy(...a));ctx.lineTo(...xy(...b));ctx.stroke(); } }
    ctx.strokeStyle='#9aa8b8';ctx.lineWidth=3;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(...xy(199,34));ctx.lineTo(...xy(210.5,34.8));ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#4b5563';ctx.font='bold 12px sans-serif';ctx.textAlign='left';ctx.fillText('北 ↑',12,15);
    ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const [i, p] of POIS.entries()) { if(p[5]?.via==='metro')continue;const [x, y] = xy(p[2], p[3]), active = p[0] === state().target||p[0]==='metro'&&state().target==='cbd'; ctx.fillStyle = active ? '#f97316' : p[0].startsWith('parking_') ? '#0f9b8e' : '#2f6fdf'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffffff'; ctx.fillText(String(i + 1), x, y + .3); }
    if (!W.interior && !external()) { const [x, y] = xy(SP.player.x, SP.player.y); ctx.fillStyle = '#1d4ed8'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    const cat = p => p[5]?.via === 'metro' || ['metro', 'bus', 'return_bus'].includes(p[0]) ? 'transit' : p[0].startsWith('parking_') ? 'parking' : 'life';
    const cards = [];
    for (const [i, p] of POIS.entries()) { const e = row(sheet, p[5]?.via==='metro'?`跨区行程 · ${p[1]}`:`${i + 1}. ${p[1]}`, p[4], { right: state().target === p[0] ? '已标记' : '', icon: p[5]?.via==='metro'?'metro':cat(p)==='parking'?'mobility':cat(p)==='transit'?'bus':'pin' }); if (e.dataset) { e.dataset.cat = cat(p); } cards.push([e, cat(p), `${p[1]} ${p[4]}`]); button('出发 · 选择方式',e,()=>chooseTravel(p[0]),'phone-btn');button(state().target === p[0] ? '已标记' : '设为目的地', e, () => mark(p[0]), 'phone-btn secondary');const view=button(p[5]?.via==='metro'?'只看出发站镜头':'只看目的地镜头',e,()=>viewDestination(p[0]),'phone-btn secondary');view.disabled=W.interior||external()||!SP.cameraNavigation?.canFocus?.(); }
    let filterCat = 'all';
    const apply = () => { const term = String(q.value || '').trim(); for (const [e, c, words] of cards) e.hidden = !(filterCat === 'all' || c === filterCat) || !!term && !words.includes(term); };
    const chipButtons = [];
    for (const [id, label] of [['all', '全部'], ['transit', '公交地铁'], ['life', '生活服务'], ['parking', '共享停放']]) { const c = button(label, chips, () => { filterCat = id; for (const b of chipButtons) b.className = 'amap-chip' + (b === c ? ' on' : ''); apply(); }, 'amap-chip' + (id === 'all' ? ' on' : '')); chipButtons.push(c); }
    q.oninput = apply;
    const follow=button('恢复人物镜头跟随',sheet,()=>{const r=SP.cameraNavigation?.follow?.();tell(r?.ok?'镜头已恢复跟随人物。':r?.reason||'镜头跟随暂不可用。');},'phone-btn secondary');follow.disabled=!SP.cameraNavigation?.follow;
    button('清除目的地', sheet, () => { state().target = null; updateNav(); render(); tell('已清除目的地。'); }, 'phone-btn secondary');
  }
  function render() {
    if (!appBody) return;
    if(opened&&phoneOwner!==G.ps){close();return;}
    liveNodes = []; liveDay = Math.floor(C.abs() / 1440); screenContent(); setStatus();
  }
  function tickClock() {
    if (!opened || !G.ps) return; const abs = C.abs(), m = Math.floor(abs); if (m === liveMinute) return; liveMinute = m;
    const day = Math.floor(abs / 1440);
    if (day !== liveDay && (tab === 'calendar' || tab === 'home') && !activeChat) { render(); return; }
    setStatus();
  }
  function close() { opened = false; phoneOwner = null; panel.hidden = true; lastFocus?.focus?.(); updateNav(); }
  function open() {
    if (external()) return SP.toast('请返回街道后使用生活手机');
    if (G.busy() || G.menu || C.ff || SP.player?.carry&&!SP.sharedMobility?.carriedShared?.()) return SP.toast('请先完成当前动作');
    lastFocus = document.activeElement; phoneOwner=G.ps; opened = true; panel.hidden = false; window.dispatchEvent(new Event('blur')); render();
  }
  function updateNav() {
    const p = destinations().find(p => p[0] === G.ps?.phone?.target); if (!nav) return;
    nav.hidden = !p || external(); if (!p) return;
    const d = SP.player && !W.interior ? Math.round(Math.hypot(SP.player.x - p[2], SP.player.y - p[3])) : null;
    const dx=p[2]-(SP.player?.x||0),dy=p[3]-(SP.player?.y||0),directions=['东','东北','北','西北','西','西南','南','东南'],direction=directions[(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8];
    nav.textContent = `目的地：${p[1]}${p[5]?.via==='metro'?' · 第1段至井槐里站，之后本人购票乘车':''} · ${d === null ? '先返回街道' : d < 2 ? '已到达附近' : `地图${direction}方向 · 直线距离 ${d} 米`} · 主画面45°旋转，请沿路行走 · 手机中可清除`;
  }
  function init() {
    if (!document.querySelector('link[data-phone-style]')) { const link = document.createElement('link'); link.rel = 'stylesheet'; link.dataset.phoneStyle = 'true'; link.href = PHONE_CSS; document.head.appendChild(link); }
    const launch = button('手机 P', document.getElementById('bar'), () => opened ? close() : open()); launch.id = 'phone-launch';
    panel = document.createElement('div'); panel.id = 'life-phone'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', '生活手机');
    shell = document.createElement('div'); shell.id = 'phone-screen'; panel.appendChild(shell);
    const status = document.createElement('div'); status.id = 'phone-status'; shell.appendChild(status);
    statusClock = text('span', '', status); const island = text('span', '', status); island.id = 'phone-island'; statusDate = text('span', '', status); statusDate.id = 'phone-status-icons';
    appHeader = document.createElement('div'); appHeader.id = 'phone-app-header'; shell.appendChild(appHeader);
    backButton = text('button', '', appHeader); appTitle = text('h1', '', appHeader); rightButton = text('button', '', appHeader);
    appBody = document.createElement('main'); appBody.id = 'phone-app-main'; shell.appendChild(appBody);
    const homeIndicator = document.createElement('button'); homeIndicator.id = 'phone-home-indicator'; homeIndicator.type = 'button'; homeIndicator.setAttribute('aria-label', '回到手机主屏'); homeIndicator.onclick = () => { tab = 'home'; activeChat = null; render(); }; shell.appendChild(homeIndicator);
    notice = document.createElement('div'); notice.className = 'phone-status'; notice.setAttribute('role', 'status'); shell.appendChild(notice);
    document.body.appendChild(panel);
    const touchLaunch = button('手机', document.body, () => opened ? close() : open()); touchLaunch.id = 'phone-launch-mobile';
    nav = text('div', '', document.getElementById('wrap')); nav.id = 'phone-waypoint'; nav.hidden = true;
    const busy = G.busy; G.busy = function () { return opened || busy.call(this); };
    window.addEventListener('keydown', e => {
      if (opened) {
        if(e.target?.getAttribute?.('data-keybinding')==='true') return;
        if (e.key === 'Escape') { e.preventDefault(); if (activeChat) { activeChat = null; render(); } else close(); }
        else if (e.key === 'Enter' && e.target instanceof HTMLTextAreaElement && e.target.closest('.phone-chat-compose') && !e.shiftKey && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); e.target.closest('form').requestSubmit(); }
        e.stopImmediatePropagation(); return;
      }
      if (e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName || '')) { e.preventDefault(); e.stopImmediatePropagation(); open(); }
    }, true);
    window.addEventListener('click', e => { if (opened && !panel.contains(e.target) && e.target !== touchLaunch && e.target !== launch) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    const evbar = document.getElementById('evbar'); if (evbar) button('手机', evbar, open).className = 'ebtn';
    setInterval(() => { if(opened&&phoneOwner!==G.ps){close();return;}if (!G.ps) return; updateNav(); setStatus(); if (opened && external()) close(); }, 500);
    // Subscribe the open phone to the game clock itself (not only the 500 ms real-time poll): every new in-game minute
    // refreshes the status bar and live widgets; a new in-game day re-renders the date-bound screens (calendar grid).
    if (typeof G.update === 'function') { const update0 = G.update; G.update = function () { const r = update0.apply(this, arguments); tickClock(); return r; }; }
  }
  SP.phone = { open, close, showMap, viewDestination, chooseTravel,depart,isOpen: () => opened, state, get pois(){return destinations();}, contacts: fallbackPeople, mark, render, tickClock, poiCategory: poiCat, previewRoute, selectPlace: id => selectPoi(id, true), get mapView(){ return mapView; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})(window.SP);
