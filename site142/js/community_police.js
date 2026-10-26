/* Selected donor stageD/E/F concepts, rebuilt for the integration police room.
 * No donor scenes, coordinates, global stage patches, or housing permissions. */
(function (root) {
  'use strict';
  const ROOM = 'community_civic_room', COUNTER = 'community_civic_counter';
  const KINDS = { lost_phone: '遗失手机', noise: '夜间噪音', unsafe_wire: '楼道飞线充电' };
  const RECEIPT = 'civic-report-receipt', STAMP = 'civic-report-stamp';
  const plain = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const finite = n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1e12;
  const onDuty = abs => ((abs % 1440) + 1440) % 1440 >= 540 && ((abs % 1440) + 1440) % 1440 < 1020;
  const createState = () => ({ version: 1, nextId: 1, activeId: null, cases: [] });
  const active = s => s.cases.find(c => c.id === s.activeId) || null;
  function validate(s) {
    if (!plain(s) || s.version !== 1 || !Number.isInteger(s.nextId) || s.nextId < 1 || s.nextId > 100000 || !Array.isArray(s.cases) || s.cases.length > 20) return false;
    const ids = new Set();
    for (const c of s.cases) {
      if (!plain(c) || !/^HD-[0-9]{6}$/.test(c.id) || ids.has(c.id) || !Object.hasOwn(KINDS, c.kind) || !['phone', 'counter'].includes(c.channel) || !['recorded', 'accepted', 'interviewed', 'stamped'].includes(c.status) || !finite(c.recordedAt)) return false;
      ids.add(c.id);
      if (!['acceptedAt', 'interviewedAt', 'stampedAt'].every(k => c[k] === null || finite(c[k]))) return false;
      if (c.acceptedAt !== null && c.acceptedAt < c.recordedAt || c.interviewedAt !== null && (c.acceptedAt === null || c.interviewedAt < c.acceptedAt) || c.stampedAt !== null && (c.interviewedAt === null || c.stampedAt < c.interviewedAt)) return false;
      if ((c.status === 'recorded') !== (c.acceptedAt === null) || (['interviewed', 'stamped'].includes(c.status)) !== (c.interviewedAt !== null) || (c.status === 'stamped') !== (c.stampedAt !== null)) return false;
      if (!Array.isArray(c.presentedTo) || c.presentedTo.length > 2 || new Set(c.presentedTo).size !== c.presentedTo.length || !c.presentedTo.every(t => ['landlord', 'property'].includes(t)) || c.presentedTo.length && c.status !== 'stamped') return false;
      const seq = Number(c.id.slice(3)); if (seq >= s.nextId || seq < 1) return false;
    }
    return s.activeId === null ? s.cases.length === 0 : ids.has(s.activeId);
  }
  function failure(reason) { return { ok: false, reason }; }
  function transition(s, command, abs) {
    if (!validate(s) || !finite(abs)) return failure('报案记录格式无效，请先恢复有效存档。');
    const c = active(s), op = command && command.op;
    if (op === 'file') {
      if (!Object.hasOwn(KINDS, command.kind)) return failure('请选择有效报案事项。');
      if (!['phone', 'counter'].includes(command.channel)) return failure('报案渠道无效。');
      if (command.channel === 'counter' && (!onDuty(abs) || abs % 1440 + 12 > 1020)) return failure('登记窗口 09:00–17:00 开放，登记需 12 分钟。');
      if (command.channel === 'phone' && onDuty(abs)) return failure('日间请到社区警务站办理登记。');
      if (c && c.status !== 'stamped') return failure('请先完成当前报案的补材料、询问和盖章。');
      if (s.cases.some(x => x.kind === command.kind && Math.floor(x.recordedAt / 1440) === Math.floor(abs / 1440))) return failure('今天已登记该事项，请查看已有回执。');
      if (s.cases.length >= 20 || s.nextId >= 100000) return failure('报案记录已达容量，请保留当前记录。');
      const id = 'HD-' + String(s.nextId++).padStart(6, '0'), phone = command.channel === 'phone';
      s.cases.push({ id, kind: command.kind, channel: command.channel, status: phone ? 'recorded' : 'accepted', recordedAt: abs, acceptedAt: phone ? null : abs + 12, interviewedAt: null, stampedAt: null, presentedTo: [] }); s.activeId = id;
      return { ok: true, minutes: phone ? 8 : 12, mood: phone ? 0 : 4, document: phone ? null : RECEIPT, text: phone ? `夜间电话已记录 ${id}，白天到窗口补材料领取回执。` : `登记受理完成，回执 ${id} 已放入背包。下一步配合询问。` };
    }
    if (!c) return failure('尚无报案记录，请先登记。');
    if (abs < c.recordedAt || abs < (c.acceptedAt || 0) || abs < (c.interviewedAt || 0) || abs < (c.stampedAt || 0)) return failure('请等待当前办理动作完成。');
    if (op === 'present') {
      if (!['landlord', 'property'].includes(command.target)) return failure('请选择房东或物业。');
      if (c.status !== 'stamped') return failure('请先完成询问和盖章，再出示完整凭证。');
      if (c.presentedTo.includes(command.target)) return failure('该回执已经出示给对方，无需重复提交。');
      c.presentedTo.push(command.target);
      return { ok: true, minutes: 0, mood: 0, text: `${command.target === 'landlord' ? '房东' : '物业'}已查看并登记回执 ${c.id}。` };
    }
    const durations = { accept: 12, interview: 15, stamp: 3 }, minutes = durations[op];
    if (!minutes) return failure('办理事项无效。');
    if (!onDuty(abs) || abs % 1440 + minutes > 1020) return failure(`窗口 09:00–17:00 开放，本次办理需 ${minutes} 分钟。`);
    if (op === 'accept' && c.status === 'recorded') { c.status = 'accepted'; c.acceptedAt = abs + minutes; return { ok: true, minutes, mood: 4, document: RECEIPT, text: `电话登记 ${c.id} 已补齐材料，领取报案回执。` }; }
    if (op === 'interview' && c.status === 'accepted') { c.status = 'interviewed'; c.interviewedAt = abs + minutes; return { ok: true, minutes, mood: 2, energy: -6, text: `询问笔录已确认：${KINDS[c.kind]}。接下来可免费盖业务章。` }; }
    if (op === 'stamp' && c.status === 'interviewed') { c.status = 'stamped'; c.stampedAt = abs + minutes; return { ok: true, minutes, mood: 3, document: STAMP, text: `回执 ${c.id} 已盖章，业务章证明已放入背包，可向房东或物业出示。报案办理完成，调查进展仍待通知。` }; }
    return failure('本项办理已完成或前置手续尚未完成，请查看回执进度。');
  }
  function register(host) {
    const SP = host.SP, G = SP && SP.game, W = SP && SP.world, C = SP && SP.clock;
    if (!G || !W || !C) return null;
    if (SP.communityPolice) return SP.communityPolice;
    const R = G.rules;
    for (const [id, label] of [[RECEIPT, '槐东社区报案回执'], [STAMP, '槐东社区报案业务章证明']]) if (!R.data.items[id]) R.data.items[id] = { label, price: 0 };
    const state = () => G.ps.communityPolice || (G.ps.communityPolice = createState());
    let panel=null,opened=false;
    function touchDock(){const D=host.document;let dock=D.getElementById('community-touch-tools');if(dock)return dock.querySelector('nav');dock=D.createElement('div');dock.id='community-touch-tools';const style=D.createElement('style');style.textContent='#community-touch-tools{display:none;position:fixed;top:calc(66px + env(safe-area-inset-top,0px));right:calc(12px + env(safe-area-inset-right,0px));z-index:135}body.mobile #community-touch-tools{display:block}body.phone-open #community-touch-tools,body:has(#life-phone:not([hidden])) #community-touch-tools{display:none!important}#community-touch-tools button{display:block;min-height:44px;min-width:76px;margin:4px 0;padding:8px;border:1px solid #94a3b8;border-radius:10px;background:#203249e8;color:#ecf2fa;font-size:14px}#community-touch-tools nav[hidden]{display:none}';D.head.appendChild(style);const toggle=D.createElement('button');toggle.type='button';toggle.id='community-tools-toggle';toggle.textContent='工具';toggle.setAttribute('aria-expanded','false');dock.appendChild(toggle);const nav=D.createElement('nav');nav.hidden=true;toggle.onclick=()=>{nav.hidden=!nav.hidden;toggle.textContent=nav.hidden?'工具':'收起工具';toggle.setAttribute('aria-expanded',String(!nav.hidden));};dock.appendChild(nav);D.body.appendChild(dock);return nav;}
    function touchSelection(el){if(el._communitySelection)return;el._communitySelection=true;let contact=null;el.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||!el._communityOrigin)return;const b=e.target.closest('button[data-i]');if(!b)return;contact={id:e.pointerId,x:e.clientX,y:e.clientY,button:b,moved:false};e.stopImmediatePropagation();},true);el.addEventListener('pointermove',e=>{if(contact&&contact.id===e.pointerId&&Math.hypot(e.clientX-contact.x,e.clientY-contact.y)>8)contact.moved=true;},true);el.addEventListener('pointerup',e=>{if(!contact||contact.id!==e.pointerId)return;const c=contact;contact=null;e.stopImmediatePropagation();if(!c.moved&&!c.button.disabled&&el.contains(c.button))G.pick(c.button.dataset.i==='x'?-1:+c.button.dataset.i);},true);el.addEventListener('pointercancel',()=>{contact=null;},true);}
    const close=()=>{opened=false;if(panel)panel.hidden=true;};
    function open(){
      if(!host.document)return {ok:false,reason:'当前环境没有界面。'};
      if(C.ff||G.activity||G.trans||SP.player.carry||SP.metroActive||SP.cbd&&SP.cbd.active)return {ok:false,reason:'请先完成当前动作，并返回社区。'};
      if(G.menu||SP.phone&&SP.phone.isOpen())return {ok:false,reason:'请先关闭当前菜单或手机。'};
      if(!panel){const D=host.document,style=D.createElement('style');style.textContent='#community-police-panel[hidden]{display:none}#community-police-panel{position:fixed;inset:0;z-index:1500;display:grid;place-items:center;background:#0009;font:15px/1.6 system-ui;color:#edf1f7}#community-police-panel section{width:min(420px,92vw);max-height:88dvh;overflow:auto;padding:16px;box-sizing:border-box;background:#182331;border:1px solid #8293aa;border-radius:12px;touch-action:pan-y;overscroll-behavior:contain}#community-police-panel header{display:flex;justify-content:space-between;align-items:center;position:sticky;top:-16px;background:#182331;padding:8px 0}#community-police-panel h2{margin:0;font-size:18px}#community-police-panel button{min-height:44px;padding:8px 12px;margin:6px 0;font-size:15px}#community-police-panel .case-action{display:block;width:100%;text-align:left}';D.head.appendChild(style);panel=D.createElement('div');panel.id='community-police-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','社区警务电话与回执');D.body.appendChild(panel);for(const event of ['touchstart','touchmove','touchend'])panel.addEventListener(event,e=>e.stopPropagation(),{passive:true});}
      const D=host.document;panel.replaceChildren();const body=D.createElement('section');panel.appendChild(body);const header=D.createElement('header');body.appendChild(header);const title=D.createElement('h2');title.textContent='社区警务 · 电话 / 回执';header.appendChild(title);const end=D.createElement('button');end.type='button';end.textContent='关闭';end.onclick=close;header.appendChild(end);const info=D.createElement('p');info.textContent=status();info.setAttribute('role','status');body.appendChild(info);const hours=D.createElement('p');hours.textContent='09:00–17:00 到警务站窗口办理；夜间电话登记需 8 分钟，次日补材料。';body.appendChild(hours);
      for(const [kind,label]of Object.entries(KINDS)){const b=D.createElement('button');b.type='button';b.className='case-action';b.textContent='电话登记：'+label+' · 8 分钟';b.disabled=onDuty(C.abs());b.onclick=()=>{info.textContent=execute({op:'file',kind,channel:'phone'});};body.appendChild(b);}
      opened=true;panel.hidden=false;SP.touchRelease&&SP.touchRelease();const nav=D.querySelector('#community-touch-tools nav');if(nav){nav.hidden=true;const t=D.getElementById('community-tools-toggle');t.textContent='工具';t.setAttribute('aria-expanded','false');}host.dispatchEvent&&host.dispatchEvent(new host.Event('blur'));end.focus();return {ok:true};
    }
    function atCounter(o) { const p = o && W.reachPt(o); return !!(p && W.interior && W.sceneId === ROOM && W.byId[COUNTER] === o && Math.hypot(SP.player.x - p[0], SP.player.y - p[1]) < 2.4); }
    function execute(command, source) {
      if (!G.ps || C.ff || G.activity || G.trans || SP.metroActive || SP.cbd && SP.cbd.active) return '请先完成当前动作，并返回社区。';
      if (command.op !== 'present' && command.channel !== 'phone' && !atCounter(source)) return '请靠近社区警务站的便民服务台办理。';
      const result = transition(state(), command, C.abs()); if (!result.ok) return result.reason;
      if (result.document) R.addItem(G.ps, result.document, 1);
      for (const k of ['mood', 'energy']) if (result[k] && G.ps.needs[k] != null) G.ps.needs[k] = Math.max(0, Math.min(100, G.ps.needs[k] + result[k]));
      // Clock.skipTo expects a minute of day, NOT C.abs()+minutes (donor's day>0 bug).
      if (result.minutes) C.skipTo((C.min + result.minutes) % 1440, .9);
      W.logEvent(`社区报案 · ${result.text}`); if (G.hud) G.hud(); return result.text;
    }
    function status() {
      const c = active(state()); if (!c) return '还没有报案记录。日间到窗口登记，夜间可电话登记后次日补材料。';
      const labels = { recorded: '夜间已记录 · 日间补材料领回执', accepted: '已受理 · 等待询问', interviewed: '询问完成 · 等待盖章', stamped: '办理完成 · 已盖章 · 调查进展待通知' };
      return `回执 ${c.id} · ${KINDS[c.kind]} · ${labels[c.status]}${c.presentedTo.length ? ' · 已出示：' + c.presentedTo.map(t => t === 'landlord' ? '房东' : '物业').join('、') : ''}`;
    }
    function menu(o) {
      const c = active(state()), opts = Object.entries(KINDS).map(([kind, label]) => ({ id: `police_file_${kind}`, label: `登记报案：${label} · 12 分钟`, ok: !c || c.status === 'stamped', reason: '请先办完当前报案', fn: () => execute({ op: 'file', kind, channel: 'counter' }, o) }));
      for (const [op, label, required] of [['accept', '补材料并领取电话报案回执 · 12 分钟', 'recorded'], ['interview', '配合询问并确认笔录 · 15 分钟', 'accepted'], ['stamp', '免费盖业务章 · 3 分钟', 'interviewed']]) opts.push({ id: `police_${op}`, label, ok: !!c && c.status === required, reason: '请按登记、询问、盖章顺序办理', fn: () => execute({ op }, o) });
      opts.push({ id: 'police_status', label: '查看报案回执与办理进度', ok: true, fn: status });
      for (const [target, label] of [['landlord', '房东'], ['property', '物业']]) opts.push({ id: `police_present_${target}`, label: `出示完整回执给${label}（登记备案）`, ok: !!c && c.status === 'stamped' && !c.presentedTo.includes(target), reason: '请完成盖章，凭证只需出示一次', fn: () => execute({ op: 'present', target }, o) });
      // Retain the preceding module's actual lost-property options and callbacks.
      const previous = G.menu && G.menu.o === o ? G.menu.opts.filter(x => !String(x.id).startsWith('police_')) : [];
      G.openMenu(Object.assign({}, o, { _name: '槐东社区警务站 · 报案 / 失物' }), previous.concat(opts)); if (G.menu) G.menu.o = o;
      const el=host.document&&host.document.getElementById('amenu');if(el&&SP.isTouch){if(!el._communityOrigin)el._communityOrigin={parent:el.parentNode,next:el.nextSibling,style:el.style.cssText};host.document.body.appendChild(el);Object.assign(el.style,{position:'fixed',zIndex:'1400',top:'50%',bottom:'auto',transform:'translate(-50%,-50%)',maxHeight:'calc(100dvh - 24px)',width:'min(420px,calc(100vw - 24px))',minWidth:'0',boxSizing:'border-box',overflowY:'auto',touchAction:'pan-y'});if(!el.dataset.communityScroll){el.dataset.communityScroll='1';for(const event of ['touchstart','touchmove','touchend'])el.addEventListener(event,e=>{if(el._communityOrigin)e.stopPropagation();},{passive:true});const close0=G.closeMenu;G.closeMenu=function(){const result=close0.apply(this,arguments),old=el._communityOrigin;if(old){old.parent.insertBefore(el,old.next&&old.next.parentNode===old.parent?old.next:null);el.style.cssText=old.style;delete el._communityOrigin;}return result;};}}
      if(el&&SP.isTouch)touchSelection(el);
    }
    const use0 = G.use, action0 = G.actionFor;
    G.actionFor = function (o, kind) { if (o && o.id === COUNTER && W.interior && W.sceneId === ROOM && kind === 'use') return { label: onDuty(C.abs()) ? '警务窗口 · 报案 / 失物 / 回执' : '警务窗口已下班（09:00–17:00）', do: 'game' }; return action0.apply(this, arguments); };
    G.use = function (o) { if (o && o.id === COUNTER && W.interior && W.sceneId === ROOM) { if (!onDuty(C.abs())) return '报案窗口 09:00–17:00 开放。夜间可在手机警务入口电话登记。'; const result = use0.apply(this, arguments); menu(o); return result; } return use0.apply(this, arguments); };
    if(host.document){const D=host.document,busy0=G.busy;G.busy=function(){return opened||busy0.apply(this,arguments);};host.addEventListener('keydown',e=>{if(opened){if(e.key==='Escape'){e.preventDefault();close();}e.stopImmediatePropagation();}},true);const b=D.createElement('button');b.type='button';b.id='community-police-launch-touch';b.textContent='警务电话';b.onclick=()=>{const r=open();if(!r.ok&&SP.toast)SP.toast(r.reason);};touchDock().appendChild(b);}
    return SP.communityPolice = { state, status, execute, menu, open, close, isOpen:()=>opened, filePhone: kind => execute({ op: 'file', kind, channel: 'phone' }), validate, roomId: ROOM, counterId: COUNTER };
  }
  const api = { ROOM, COUNTER, KINDS, RECEIPT, STAMP, onDuty, createState, active, validate, transition, register };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CommunityPolice = api; if (root.SP) register(root);
})(typeof window !== 'undefined' ? window : globalThis);
