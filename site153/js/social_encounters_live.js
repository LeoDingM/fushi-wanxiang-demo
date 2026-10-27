/* Candidate bridge. Bootstrap BEFORE phone/dev-god key capture; register AFTER game/save/phone.
 * Not auto-installed and not included by formal index. */
(function(root){
 'use strict';
 let owner=null;
 if(root.addEventListener)root.addEventListener('keydown',e=>{
  if(root.SP?.appointmentsUI?.isOpen()){
   if(e.key==='Escape'){e.preventDefault();root.SP.appointmentsUI.close();}
   e.stopImmediatePropagation();return;
  }
  if(!owner?.isOpen())return;
  if(e.key==='Escape'&&!e.isComposing){e.preventDefault();owner.close();}
  else owner.candidate?.handleKey?.(e);
  // Default text entry / browser focus traversal remains, game listeners receive no keys.
  e.stopImmediatePropagation();
 },true);
 const clone=x=>JSON.parse(JSON.stringify(x)),plain=x=>x&&Object.getPrototypeOf(x)===Object.prototype;
 const FORMAT='fushi.social.candidate.bundle',KEY='fushi.social.candidate.preview.v1';
 function register(SP,options={}){
  if(SP.socialEncountersLive)return SP.socialEncountersLive;
  const Social=root.SocialEncounters,PS=SP.progressSave,G=SP.game;
  if(!Social||!PS?.capture||!PS?.inspect||!PS?.restore||!G)throw Error('交谈候选须在游戏、社交内核、存档和phone之后register。');
  const base={capture:PS.capture,inspect:PS.inspect,restore:PS.restore,saveLocal:PS.saveLocal,loadLocal:PS.loadLocal};
  const formal=!!options.formal,candidate=Social.attach(SP,{formal}),listeners=new Set();let chooser=null,refresh=null,attentionSession=null,attentionUntil=0;const launches=[];
  const busy0=G.busy;
  const isOpen=()=>!!candidate.engine.current()||!!(chooser&&!chooser.hidden);
  function clearInput(){SP.touchRelease?.();if(SP.input)for(const k of Object.keys(SP.input))SP.input[k]=false;root.dispatchEvent?.(new Event('blur'));}
  function close(){candidate.close();attentionSession=null;attentionUntil=0;if(chooser)chooser.hidden=true;clearInput();}
  const api={candidate,isOpen,close,base,key:KEY,subscribe(fn){if(typeof fn!=='function')throw Error('事件订阅需要函数。');listeners.add(fn);return()=>listeners.delete(fn);}};
  owner=api;
  G.busy=function(){return isOpen()||busy0.apply(this,arguments);};
  // A willing NPC briefly gives the conversation attention; the rest of the world runs.
  function attentive(){const s=candidate.engine.current();if(!s)return null;if(attentionSession!==s.id){attentionSession=s.id;attentionUntil=Date.now()+45000;}return Date.now()<attentionUntil&&!candidate.adapter.pressure(s.target)?s:null;}
  const npcUpdate0=SP.npcs?.update,holding0=SP.communitySocial?.holding;
  if(npcUpdate0)SP.npcs.update=function(dt){const s=attentive(),a=s&&SP.npcs.list.find(a=>a.id===s.target),before=a?.brain?.dwell;if(a?.brain)a.brain.dwell=Math.max(before||0,dt+.1);try{return npcUpdate0.apply(this,arguments);}finally{if(a?.brain)a.brain.dwell=before;}};
  if(holding0)SP.communitySocial.holding=function(){return attentive()?.target==='community_resident_lin'||holding0.apply(this,arguments);};
  for(const name of ['turn','prepareText']){const original=candidate.engine[name];candidate.engine[name]=function(){const before=candidate.engine.snapshot().nextEvent,r=original.apply(this,arguments);for(const evt of candidate.engine.snapshot().events.filter(e=>e.id>=before))for(const fn of listeners)try{fn(clone(evt));}catch(_){}return r;};}
  function choose(){
   if(candidate.engine.current())return {ok:false,reason:'请先结束当前交谈。'};
   if(busy0.call(G)||SP.phone?.isOpen())return {ok:false,reason:'请先关闭手机或结束当前活动。'};
   if(!root.document)return {ok:false,reason:'当前环境没有目标选择界面。'};
   const D=root.document,tools=D.querySelector('#community-touch-tools nav');if(tools){tools.hidden=true;const toggle=D.getElementById('community-tools-toggle');if(toggle){toggle.textContent='工具';toggle.setAttribute('aria-expanded','false');}}
   if(!chooser){const style=D.createElement('style');style.textContent='#social-live-targets[hidden]{display:none}#social-live-targets{position:fixed;inset:0;display:grid;place-items:center;background:#0008;z-index:1601;color:#edf2e8;font:15px/1.6 system-ui}#social-live-targets section{width:min(410px,92vw);box-sizing:border-box;background:#19342e;padding:16px;border:1px solid #92b1a0;border-radius:12px;max-height:86dvh;overflow:auto}#social-live-targets button{font:inherit;min-height:44px;margin:5px;padding:8px}#social-live-launch{position:fixed;left:10px;top:calc(env(safe-area-inset-top,0px) + 52px);z-index:90;min-height:44px;border-radius:8px;background:#19342e;color:#edf2e8;border:1px solid #92b1a0;padding:8px;font:14px system-ui}';D.head.appendChild(style);chooser=D.createElement('div');chooser.id='social-live-targets';chooser.hidden=true;chooser.setAttribute('role','dialog');chooser.setAttribute('aria-modal','true');chooser.setAttribute('aria-label','选择附近居民');D.body.appendChild(chooser);for(const ev of ['touchstart','touchmove','touchend'])chooser.addEventListener(ev,e=>e.stopPropagation(),{passive:true});}
   if(!D.getElementById('social-chooser-theme')){const theme=D.createElement('style');theme.id='social-chooser-theme';theme.textContent='#social-live-targets{background:#0a1217aa;color:#25323d;color-scheme:light}#social-live-targets section{background:#f2f5f5;border:1px solid #fff7;border-top:4px solid #c5a66f;border-radius:20px;padding:24px;box-shadow:0 24px 80px #0006}#social-live-targets h2{font-size:22px;margin:0 0 8px;color:#20363e}#social-live-targets p{color:#576b74;font-size:13px;margin:8px 0 18px}#social-live-targets button{display:block;box-sizing:border-box;width:100%;margin:8px 0;padding:14px 16px;border:1px solid #c8d5da;border-radius:12px;background:#fff;color:#25323d;text-align:left;font:600 14px system-ui;cursor:pointer}#social-live-targets button:last-child{margin-top:20px;background:#315967;color:#fff;text-align:center;border-color:#315967}#social-live-targets button:focus-visible{outline:3px solid #b58232;outline-offset:2px}';D.head.appendChild(theme);}
   chooser.replaceChildren();const section=D.createElement('section'),title=D.createElement('h2'),note=D.createElement('p');title.textContent=formal?'遇见街坊':'附近居民 · 交谈预览';note.textContent='和身边的人打个招呼，聊聊近况。';section.append(title,note);
   const ids=candidate.engine.nearby();if(!ids.length){const empty=D.createElement('p');empty.textContent='附近没有可交谈居民。走近实际街道上的小林、王阿姨或上班族再试。';section.appendChild(empty);}
   for(const id of ids){const b=D.createElement('button');b.textContent=Social.profiles[id].name+' · '+Social.profiles[id].role;b.dataset.actorId=id;b.onclick=()=>{chooser.hidden=true;const r=candidate.show(id);if(!r.ok)SP.toast?.(r.reason);};section.appendChild(b);}
   const exit=D.createElement('button');exit.textContent='结束 / 返回街道';exit.onclick=close;section.appendChild(exit);chooser.appendChild(section);chooser.hidden=false;clearInput();exit.focus();return {ok:true,targets:ids};
  }
  api.choose=choose;
  function unpack(text){
   let packet;try{packet=JSON.parse(text);}catch(_){return {native:true,text};}
   if(packet?.format!==FORMAT)return {native:true,text};
   if(!plain(packet)||Object.keys(packet).sort().join(',')!=='format,mainText,social,version'||packet.version!==1||typeof packet.mainText!=='string'||packet.mainText.length>8e6)throw Error('候选存档封装格式无效。');
   const r=base.inspect.call(PS,packet.mainText);if(!r.ok)throw Error(r.reason||'主存档无效。');
   const s=packet.social;if(!plain(s)||Object.keys(s).sort().join(',')!=='at,candidate,legacyLin,state'||!['social-encounters-1','social-encounters-2'].includes(s.candidate)||!Social.validate(s.state)||!candidate.adapter.validLegacy(s.legacyLin))throw Error('社交扩展状态无效。');
   const main=JSON.parse(packet.mainText).payload,at=main.clock.day*1440+main.clock.min,lin=main.ps.communitySocial?.lin||null;
   if(!Number.isFinite(s.at)||s.at!==at||JSON.stringify(lin)!==JSON.stringify(s.legacyLin))throw Error('主存档时间或小林关系与社交扩展不匹配。');
   if(!Social.validate(s.state,s.at))throw Error('社交事件时间、问候日期或会话高水位无效。');
   if(s.legacyLin&&s.legacyLin.lastGreetingDay>Math.floor(s.at/1440))throw Error('主存档问候日期在未来，不能恢复此候选组合。');
   return {native:false,packet,inspection:r};
  }
  function capture(){
   if(isOpen())return {ok:false,reason:'请先结束交谈再保存。'};
   const r=base.capture.call(PS);if(!r.ok)return r;
   const record={format:FORMAT,version:1,mainText:r.text,social:candidate.capture()};return {ok:true,record,text:JSON.stringify(record)};
  }
  function inspect(text){try{const p=unpack(text);return p.native?base.inspect.call(PS,text):{...p.inspection,socialCandidate:true,eventCount:p.packet.social.state.events.length};}catch(e){return {ok:false,reason:e.message};}}
  function restore(text){
   let p;try{p=unpack(text);}catch(e){return {ok:false,reason:e.message};}
   // Validate before closing UI or mutating either part of the world.
   const valid=p.native?base.inspect.call(PS,text):p.inspection;if(!valid.ok)return valid;
   close();const prior=base.capture.call(PS);if(!prior.ok)return prior;const priorSocial=candidate.capture();
   const mainResult=base.restore.call(PS,p.native?text:p.packet.mainText);if(!mainResult.ok)return mainResult;
   const sr=p.native?candidate.engine.restore(Social.fresh()):candidate.restore(p.packet.social);
   if(sr.ok){clearInput();return {...mainResult,socialCandidate:!p.native,socialMigrated:p.native};}
   const rollback=base.restore.call(PS,prior.text),socialRollback=rollback.ok?candidate.restore(priorSocial):{ok:false};
   return {ok:false,reason:sr.reason+'；'+(rollback.ok&&socialRollback.ok?'已恢复原进度。':'回滚失败，请保留原快照。')};
  }
  api.capture=capture;api.inspect=inspect;api.restore=restore;
  // Preview-only install: existing save UI now calls these contract-compatible methods.
  if(!formal){PS.capture=capture;PS.inspect=inspect;PS.restore=restore;
  PS.saveLocal=function(){const r=capture();if(!r.ok)return r;try{root.localStorage.setItem(KEY,r.text);return r;}catch(_){return {ok:false,reason:'候选本地存储不可用，请导出备份。'};}};
  PS.loadLocal=function(){try{const text=root.localStorage.getItem(KEY);return text?restore(text):{ok:false,reason:'还没有候选存档；正式存档未被覆盖。'};}catch(_){return {ok:false,reason:'候选本地存储不可用。'};}};}
  api.formal=formal;api.uninstall=function(){close();root.clearInterval(refresh);for(const b of launches)b.remove();chooser?.remove();G.busy=busy0;if(npcUpdate0)SP.npcs.update=npcUpdate0;if(holding0)SP.communitySocial.holding=holding0;if(!formal)Object.assign(PS,base);if(owner===api)owner=null;delete SP.socialEncountersLive;};
  if(root.document){const D=root.document,bar=D.getElementById('bar'),mobileTools=D.querySelector('#community-touch-tools nav');for(const [host,id]of [[bar,'social-live-launch'],[mobileTools,'social-live-launch-mobile']]){if(!host)continue;const b=D.createElement('button');b.id=id;b.style.cssText='position:static;min-height:44px';b.textContent=formal?'交谈（4位居民）':'交谈 · 独立预览';b.onclick=()=>{const r=choose();if(!r.ok)SP.toast?.(r.reason);};host.appendChild(b);launches.push(b);}refresh=root.setInterval(()=>{for(const b of launches){b.hidden=!!SP.cbd?.active||!!SP.metroActive||!!root.FushiMetro?.core?.active||SP.player.level==='roof'||!!SP.phone?.isOpen()||!!G.menu;b.disabled=isOpen()||busy0.call(G);}},250);}
  SP.socialEncountersLive=api;return api;
 }
 root.SocialEncountersLive={register,FORMAT,KEY};if(typeof module!=='undefined'&&module.exports)module.exports=root.SocialEncountersLive;
})(typeof window!=='undefined'?window:globalThis);
