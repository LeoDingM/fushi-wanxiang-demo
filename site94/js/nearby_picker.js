/* Capture before phone/game handlers; registration after social modules. */
(function(root){
 'use strict';let api;
 const themeHref=root.document.currentScript?.src?new URL('work_ui.css',root.document.currentScript.src).href:null;
 root.addEventListener('keydown',e=>{if(root.SP?.lifeChronicle?.isOpen()){if(e.key==='Escape')root.SP.lifeChronicle.close();e.stopImmediatePropagation();return;}
  if(root.SP?.npcConflict?.isModalOpen()){if(e.key==='Escape')root.SP.npcConflict.closeModal();e.stopImmediatePropagation();return;}
  if(!api?.isOpen())return;if(e.key==='Escape'){e.preventDefault();api.close();}e.stopImmediatePropagation();},true);
 function register(SP){
  if(SP.nearbyPicker)return SP.nearbyPicker;
  const W=SP.world,G=SP.game,D=root.document,proxies=new Map();let panel,mode='',target=null,epoch=0,request=null,conversation=null;
  if(themeHref&&!D.querySelector('link[data-work-ui-style]')){const css=D.createElement('link');css.rel='stylesheet';css.dataset.workUiStyle='true';css.href=themeHref;D.head.append(css);}
  const roles={office:'上班族',student:'学生',uncle:'街坊',vendor:'摊主',rider:'骑手',clerk_zhao:'店员',clerk_zhou:'店员',firefighter:'消防员',police:'警务人员',nurse:'护理人员',nd_police:'巡逻民警'};
  const clear=()=>{SP.touchRelease?.();if(SP.input)for(const k of Object.keys(SP.input))SP.input[k]=false;root.dispatchEvent(new Event('blur'));};
  const close=()=>{conversation?.cancel?.('交谈已结束，保留本地回应。');conversation=null;epoch++;request?.abort();request=null;if(panel)panel.hidden=true;mode='';target=null;clear();};
  function reachable(a){
   const p=SP.player;
   if(!p||!(SP.actors.list||[]).includes(a)||a===p||a.hidden||a.dead||a.vehicle||p.carry||(a.level||'street')!==(p.level||'street')||Math.hypot(a.x-p.x,a.y-p.y)>2.4)return false;
   for(let i=1;i<8;i++)if(W.blockedStatic(p.x+(a.x-p.x)*i/8,p.y+(a.y-p.y)*i/8,.05))return false;
   return true;
  }
  const name=a=>root.SocialEncounters?.profiles[a.id]?.name||a.name||a.brain?.spec?.name||roles[a.set]||'路人';
  const nearest0=W.nearest;
  W.nearest=function(){
   const best=nearest0.apply(this,arguments),list=W.nearList||[];
   for(const a of SP.actors.list||[]){
    if(!reachable(a))continue;
    if(a.id==='community_resident_lin'&&list.some(o=>o.interact==='community_social'))continue;
    let o=proxies.get(a.id);if(!o){o={id:'talk:'+a.id,interact:'passerby_talk'};proxies.set(a.id,o);}
    Object.assign(o,{x:a.x,y:a.y,_name:name(a),actor:a});list.push(o);
   }
   W.nearList=list;return best||list[0]||null;
  };
  const action0=G.actionFor,use0=G.use,busy0=G.busy;
  G.actionFor=function(o,kind){return o?.interact==='passerby_talk'?(kind==='use'?{label:'和'+o._name+'交谈',do:'game'}:null):action0.call(this,o,kind);};
  G.busy=function(){return !!mode||busy0.apply(this,arguments);};
  function frame(title){
   if(!panel){
    panel=D.createElement('div');panel.id='nearby-picker';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');D.body.append(panel);
    for(const ev of ['touchstart','touchmove','touchend'])panel.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
   }
   panel.replaceChildren();panel.setAttribute('aria-label',title);const section=D.createElement('section'),header=D.createElement('header'),h=D.createElement('h2'),body=D.createElement('div');h.textContent=title;body.className='nearby-body';header.append(h);button(header,'关闭',close).className='secondary';section.append(header,body);panel.append(section);panel.hidden=false;clear();return body;
  }
  function button(s,label,fn){const b=D.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;s.append(b);return b;}
  function talk(o){
   if(!reachable(o.actor))return '对方已走远，请靠近再聊。';
   if(conversation)close();
   if(root.SocialEncounters?.profiles[o.actor.id]){const r=SP.socialEncountersLive.candidate.show(o.actor.id);return r.ok?null:r.reason;}
   mode='talk';target=o.actor;const s=frame(o._name+' · 街头交谈');
   const welcome=D.createElement('p');welcome.className='answer';welcome.textContent='你好，有什么事吗？';s.append(welcome);
   const log=D.createElement('div');log.className='passerby-log';log.setAttribute('role','log');log.setAttribute('aria-label','本次街头交谈');log.setAttribute('aria-live','polite');s.append(log);
   const status=D.createElement('p');status.className='nearby-status';status.setAttribute('role','status');status.textContent='可以接着前一句聊，或换一个话题。';s.append(status);
   const session={actor:o.actor,owner:G.ps,scene:SP.place?.where(),epoch,turns:[],active:null};conversation=session;
   const valid=()=>conversation===session&&session.epoch===epoch&&session.owner===G.ps&&target===session.actor&&mode==='talk'&&reachable(session.actor)&&session.scene===SP.place?.where()&&!SP.metroActive&&!SP.cbd?.active;
   const controls=[];let cancel;
   function render(){log.replaceChildren();for(const turn of session.turns){const row=D.createElement('div');row.className='passerby-turn';for(const [who,text,cls]of [['你',turn.input,'player'],[o._name,turn.reply,'resident']]){const line=D.createElement('div'),name=D.createElement('strong'),p=D.createElement('p');line.className='passerby-line '+cls;name.textContent=who;p.textContent=text;line.append(name,p);row.append(line);}log.append(row);}log.scrollTop=log.scrollHeight;}
   function complete(turn,source){if(turn.completed)return;turn.completed=true;turn.source=source;if(valid())SP.lifeChronicle?.record('conversation','passerby','与'+o._name+'交谈',{target:session.actor.id,input:turn.input,reply:turn.reply,expressionSource:source});render();}
   function unlock(){cancel.hidden=true;for(const b of controls)b.disabled=false;}
   session.cancel=(message='已取消等待，保留本地回应。')=>{const token=session.active;if(!token)return;session.active=null;token.controller.abort();if(request===token.controller)request=null;if(valid())complete(token.turn,'local_cancelled');unlock();status.textContent=message;};
   function localReply(text,prior){
    if(o.actor.id==='neighbor_zhang_host'&&(/去哪|去哪里|散步|公园|安排|打算|回家|行程/.test(text)||prior?.topic==='neighbor_day'&&/刚才|接着|继续说|然后呢/.test(text))){try{const said=SP.neighborDay?.speechFor?.(o.actor);if(typeof said?.text==='string'&&said.text.trim())return {topic:'neighbor_day',text:said.text};}catch{}}
    const weather=()=>SP.clock.weather==='rain'?'正在下雨，走路留意湿滑。':SP.clock.weather==='snow'?'下雪了，路上小心。':'现在没有雨雪，出门还算方便。';
    if(prior&&/刚才|为什么|什么意思|接着|继续说|然后呢/.test(text)){
     if(prior.topic==='weather')return {topic:'weather',text:'刚才聊的是天气。'+weather()};
     if(prior.topic==='directions')return {topic:'directions',text:'刚才说到问路，具体路线还是以手机地图为准，我不想把你指错。'};
     if(prior.topic==='work')return {topic:'work',text:'刚才聊到工作。有些私事我还不方便展开，可以换个话题。'};
     return {topic:prior.topic,text:'我记得你刚才说的这句。不过我了解得不多，不能随便补出没发生的事。'};
    }
    if(/地铁|问路/.test(text))return {topic:'directions',text:'你可以打开手机地图确认位置。没确认具体路线，我就不给你乱指路了。'};
    if(/天气|下雨|下雪/.test(text))return {topic:'weather',text:weather()};
    if(/工作|上班|职业/.test(text))return {topic:'work',text:(roles[o.actor.set]||'路人')==='路人'?'刚认识，工作的私事就先不聊了。':'你看我这身打扮，大概能猜到些。我还有自己的事情要忙。'};
    if(/谢谢|再见/.test(text))return {topic:'farewell',text:'不客气，有缘再见。'};
    if(/你好|您好|嗨/.test(text))return {topic:'greeting',text:prior?.topic==='greeting'?'嗯，刚才打过招呼啦。想聊点什么？':'你好，路上碰到打个招呼挺好。'};
    return {topic:'other',text:'这件事我不太了解，不能随便给你下结论。我们可以聊聊天气或问路。'};
   }
   async function respond(text){
    if(session.active)return;
    if(!valid()){session.cancel();status.textContent='对方或游戏状态已变化，交谈结束，请重新走近后开启。';return;}
    const t=String(text).trim().slice(0,200);if(!t)return;
    const completed=session.turns.filter(turn=>turn.completed),prior=completed.at(-1),local=localReply(t,prior),history=completed.slice(-6).flatMap(turn=>[{role:'user',text:turn.input},{role:'assistant',text:turn.reply}]);
    const turn={input:t,reply:local.text,topic:local.topic,completed:false};session.turns.push(turn);if(session.turns.length>12)session.turns.shift();render();
    if(local.topic==='neighbor_day'||!SP.ai?.settings().enabled){complete(turn,'local');status.textContent=local.topic==='neighbor_day'?'本人当前行程 · 本地事实':'本地回应 · 本次交谈';return;}
    const controller=new AbortController(),token={controller,turn};session.active=token;request=controller;cancel.hidden=false;for(const b of controls)b.disabled=true;status.textContent='正在等待 AI 回应…可取消，当前保留本地回应。';
    try{const r=await SP.ai.express({kind:'passerby',input:t,history,context:{name:o._name,weather:SP.clock.weather,localReply:local.text},signal:controller.signal});if(!valid()||controller.signal.aborted||session.active!==token)return;turn.reply=r.reply;complete(turn,'ai');status.textContent='AI 回应 · 仅为交谈，不改变游戏事实。';}
    catch(e){if(!valid()||controller.signal.aborted||session.active!==token)return;complete(turn,'local_fallback');status.textContent='AI 暂不可用，保留本地回应：'+e.message;}
    finally{if(session.active===token){session.active=null;if(request===controller)request=null;unlock();}}
   }
   const topics=D.createElement('div');topics.className='nearby-topics';s.append(topics);for(const text of ['你好',...(o.actor.id==='neighbor_zhang_host'?['您接下来有什么安排？']:[]),'今天天气怎么样？','你做什么工作？','地铁怎么走？'])controls.push(button(topics,text,()=>respond(text)));
   const input=D.createElement('textarea');input.maxLength=200;input.placeholder='对路人说点什么…';input.setAttribute('aria-label','对路人说的话');s.append(input);controls.push(button(s,'发送',()=>{const pending=respond(input.value);input.value='';return pending;}));
   cancel=button(s,'取消等待',()=>session.cancel());cancel.hidden=true;button(s,'结束交谈',close);panel.querySelector?.('header button')?.focus();return null;
  }
  G.use=function(o){return o?.interact==='passerby_talk'?talk(o):use0.call(this,o);};
  function candidates(){const p=SP.player;W.nearest(p.x,p.y,p.dir);return (W.nearList||[]).filter(o=>W.actionFor(o,'use')||W.actionFor(o,'kick'));}
  function choose(){
   if(busy0.call(G)||SP.phone?.isOpen()||SP.metroActive||SP.cbd?.active)return;
   const list=candidates();if(!list.length){SP.toast('附近没有可互动对象。');return;}
   G.closeMenu();mode='choose';const s=frame('选择附近对象');
   for(const o of list){const a=W.actionFor(o,'use'),k=W.actionFor(o,'kick');
    const label=o._name||o.name||a?.label||k?.label||'物件',human=!o.actor?.isAnimal&&(o.interact==='passerby_talk'||o.interact==='community_social');
    button(s,(o.actor?.isAnimal?'动物 · ':human?'人物 · ':'物件 · ')+label+'  — '+(a?.label||k?.label),()=>{
     close();const live=candidates().find(q=>q.id===o.id);if(!live){SP.toast('对象已离开互动范围。');return;}
     const L=W.nearList.filter(q=>W.actionFor(q,'use')||W.actionFor(q,'kick'));SP.state.nearSig=L.map(q=>q.id).join('|');SP.state.pickIdx=L.indexOf(live);SP.state.near=live;SP.state.selectedTargetId=live.id;
     if(a){api.direct=true;try{SP.actions.interact();}finally{api.direct=false;}}else SP.toast('已选中目标，可按 '+(SP.keybindings?.label('kick')||'T')+' 踢。');
    });
   }
   button(s,'返回',close);panel.querySelector?.('header button')?.focus();
  }
  SP.cycleTarget=choose;
  const update0=SP.npcs.update;
  SP.npcs.update=function(dt){const b=target?.brain,prior=b?.dwell;if(b)b.dwell=Math.max(prior||0,dt+.1);try{return update0.apply(this,arguments);}finally{if(b)b.dwell=prior;}};
  api=SP.nearbyPicker={choose,close,isOpen:()=>!!mode,holdsActor:id=>mode==='talk'&&target?.id===id&&conversation?.owner===G.ps&&conversation.scene===SP.place?.where()&&reachable(target),candidates,reachable};return api;
 }
 root.NearbyPicker={register};
})(window);
