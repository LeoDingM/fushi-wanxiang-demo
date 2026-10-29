(function(root){
 'use strict';const SP=root.SP,G=SP.game,W=SP.world,C=SP.clock,M=root.LifeChronicleModel,D=root.document;let panel=null,deathShown=false,seenConflict=0,activeRequest=null;
 const theme=D.createElement('link');theme.rel='stylesheet';theme.dataset.chronicleStyle='true';theme.href=new URL('chronicle_theme.css',D.currentScript.src).href;D.head.append(theme);
 function cancelRequest(message='润色已取消，本地列传已保留。'){
  const request=activeRequest;if(!request)return;activeRequest=null;request.controller.abort();request.finish(message);
 }
 function close(){cancelRequest();if(panel)panel.hidden=true;}
 function state(){return G.ps.lifeChronicle||(G.ps.lifeChronicle=M.fresh(C.abs(),G.ps));}
 function record(kind,source,summary,facts={},at=C.abs(),parent=null){if(!G.ps||SP.progressSave?.restoring)return null;return M.add(state(),{at,kind,source,summary,facts,parent});}
 const labels={spend:'消费付款',earn:'获得收入',shift_paid:'工作发薪',rent_paid:'支付房租',rent_owed:'房租逾期',util_paid:'支付水电物业费用',store_checkout:'便利店结账',job_apply:'应聘工作',job_start:'开始工作',action:'完成日常活动',quest_done:'完成委托',buy:'购买物品'};
 G.rules.onNote=function(ps,e){if(ps!==G.ps)return;const label=labels[e.type]||e.label||e.type;const amount=e.amount??e.pay??e.total;record('rule:'+e.type,'shared_rules',label+(amount!=null?' · ¥'+amount:'')+(e.why?' · '+e.why:''),e,Number.isFinite(e.t)?e.t:C.abs());};
 const log0=W.logEvent;W.logEvent=function(text){
  if(typeof text==='string'&&/李默|买下|付款|合同|接单|完成|阅读|问候|租|工资|报警|民警|警员|攻击|反击|交付|借阅|归还|用餐|理发|取药|预约/.test(text))record('world_note','gameplay',text,{scene:W.sceneId||'street'});
  return log0.apply(this,arguments);
 };
 SP.socialEncountersLive?.subscribe(e=>record('social:'+e.kind,'social_rules','与'+(root.SocialEncounters.profiles[e.target]?.name||e.target)+'的交谈 · '+e.kind,e,e.at));
 const switch0=G.switchScene;G.switchScene=function(to){const from=SP.place.where();const result=switch0.apply(this,arguments);if(SP.place.where()!==from){cancelRequest('场景已切换，润色已取消；原始记录已保留。');record('scene_change','navigation','从'+from+'前往'+to,{from,to});}return result;};
 function sceneName(id){
  if(id==='street')return '井槐里街区';
  const name=SP.scenes?.[id]?.name;
  return typeof name==='string'&&name.trim()&&name!==id?name:'未命名地点';
 }
 function exportArchive(compact=false){
  let url;try{
   const s=state(),packed=compact===true;
   if(packed&&!root.ChronicleArchiveCodec)throw new Error('归档模块尚未就绪，请重新加载页面。');
   const data=packed?root.ChronicleArchiveCodec.encode(s,C.abs()):{format:'fushi-life-archive',version:1,chronicle:s,biography:M.biography(s,sceneName)};
   const text=JSON.stringify(data,null,packed?undefined:2),blob=new Blob([text],{type:'application/json'}),a=D.createElement('a');url=URL.createObjectURL(blob);a.href=url;
   a.download=packed?'fushi-life-chronicle-compact.json':'fushi-life-chronicle.json';a.click();
   SP.toast(packed?'已导出紧凑人生档案 · '+text.length.toLocaleString()+' 字符。仅含人生记录，不是游戏进度。':'已导出完整人生记录。');
  }catch(e){SP.toast('导出失败：'+e.message+'；原始人生记录未更改。');}
  finally{if(url)setTimeout(()=>URL.revokeObjectURL(url),1000);}
 }
 function show(){
  if(!G.ps){SP.toast('游戏仍在加载，请稍候。');return;}
  cancelRequest();
  if(!panel){panel=D.createElement('div');panel.id='life-chronicle';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','chronicle-title');D.body.append(panel);for(const ev of ['touchstart','touchmove','touchend'])panel.addEventListener(ev,e=>e.stopPropagation(),{passive:true});}
  const node=(tag,value,cls)=>{const n=D.createElement(tag);if(value)n.textContent=value;if(cls)n.className=cls;return n;};
  panel.replaceChildren();const s=state(),section=node('section',null,'chronicle-sheet'),header=node('header'),heading=node('div'),title=node('h2',s.death?'李默 · 人生列传':'人生档案');title.id='chronicle-title';
  heading.append(title,node('p','李默 · '+(s.death?'人生已终':'人生仍在继续')+' · '+s.events.length+' 条事件'));header.append(heading);
  const body=node('div',null,'chronicle-body'),aiCard=node('article',null,'chronicle-card chronicle-ai'),rawCard=node('article',null,'chronicle-card chronicle-original'),status=node('p',null,'chronicle-status'),text=node('pre',s.polished?.text||'','chronicle-prose'),rawText=node('pre',M.biography(s,sceneName),'chronicle-prose');
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');text.hidden=!s.polished;
  const setStatus=(kind,message)=>{aiCard.dataset.state=kind;status.textContent=message;aiCard.setAttribute('aria-busy',String(kind==='loading'));};
  aiCard.append(node('span','AI 附注','chronicle-eyebrow'),node('h3','以事件为据，写一篇列传'),status,text);
  setStatus(s.polished?'success':'empty',s.polished?'已保存上次润色；地点中文显示已更新，旧附注可重新润色。AI 文本仍需对照原始事件核对。':s.events.length?'原始列传已生成。启用全局 API 后，可在下方润色；结果会单独保存。':'还没有可引用的事件。完成一次游戏活动后，人生档案会逐步积累。');
  rawCard.append(node('span','原始记录','chronicle-eyebrow'),node('h3','游戏中的真实经历'),node('p','按游戏记录生成，AI 润色不会改写这些事件。','chronicle-muted'),rawText);
  const details=node('details',null,'chronicle-events'),summary=node('summary','查看完整事件记录'),list=node('ol'),filters=node('div',null,'chronicle-filters');
  const searchLabel=node('label','搜索事件记录'),search=node('input');search.type='search';search.placeholder='输入事件关键词';searchLabel.append(search);filters.append(searchLabel);
  const pages=node('nav',null,'chronicle-pages'),newer=node('button','较新记录','secondary'),older=node('button','更早记录','secondary'),pageStatus=node('span');
  newer.type=older.type='button';pages.setAttribute('aria-label','事件分页');pageStatus.setAttribute('role','status');pages.append(newer,pageStatus,older);
  let offset=0;
  function renderEvents(){
   const page=M.query(s,{offset,limit:20,search:search.value,sceneName});list.replaceChildren();
   for(const e of page.items){const row=node('li'),minute=Math.floor(e.at%1440);row.append(node('small','#'+e.id+' · 第 '+(Math.floor(e.at/1440)+1)+' 日 '+String(Math.floor(minute/60)).padStart(2,'0')+':'+String(minute%60).padStart(2,'0')),node('p',M.eventSummary(e,sceneName)));list.append(row);}
   if(!page.items.length)list.append(node('li',page.total?'本页暂无记录':'没有匹配的事件'));
   newer.disabled=offset===0;older.disabled=offset+20>=page.total;
   pageStatus.textContent=page.total?(offset+1)+'–'+Math.min(offset+20,page.total)+' / '+page.total+' 条':'0 条';
  }
  search.oninput=()=>{offset=0;renderEvents();};newer.onclick=()=>{offset=Math.max(0,offset-20);renderEvents();};older.onclick=()=>{offset+=20;renderEvents();};
  details.append(summary,filters,pages,list);renderEvents();rawCard.append(details);body.append(aiCard,rawCard);
  const actions=node('footer',null,'chronicle-actions');
  const button=(label,fn,host=actions,secondary=false)=>{const b=node('button',label,secondary?'secondary':'');b.type='button';b.onclick=fn;host.append(b);return b;};
  const closeButton=button('关闭',close,header,true);
  const polish=button('API 润色',async()=>{
   if(activeRequest)return;
   body.scrollTop=0;
   if(!SP.phoneAI?.settings?.().enabled){setStatus('unconfigured','先在手机 API 设置中启用服务；本地列传已经可用。');return;}
   if(SP.phoneAI.isPending()){setStatus('waiting','另一个 API 请求正在进行，请完成或取消后重试。');return;}
   const s=state();if(!s.events.length){setStatus('empty','目前还没有可引用的事件，请完成一次游戏活动后再润色。');return;}
   setStatus('loading','正在依据事件记录润色…最多等待 90 秒，可随时取消。');polish.disabled=true;cancel.hidden=false;
   const request={owner:G.ps,archive:s,scene:SP.place.where(),controller:new AbortController(),finish(message){polish.disabled=false;cancel.hidden=true;if(message)setStatus('cancelled',message);}};activeRequest=request;
   try{
    const facts=M.copy(M.recent(s,80)).map(e=>({...e,displaySummary:M.eventSummary(e,sceneName)})),r=await SP.phoneAI.polishBiography({name:s.name,events:facts,localText:M.biography(s,sceneName),signal:request.controller.signal});
    if(activeRequest!==request||request.controller.signal.aborted||request.owner!==G.ps||request.archive!==state()||request.scene!==SP.place.where()||panel.hidden)return;
    s.polished={at:C.abs(),text:r.text,eventIds:r.eventIds};text.textContent=r.text;text.hidden=false;setStatus('success','AI 润色附注 · 引用 '+r.eventIds.length+' 条事件（'+r.eventIds.slice(0,6).join('、')+(r.eventIds.length>6?'…':'')+'）。内容仍需核对，完整引用见导出档案；原始事件未改写。');
   }catch(e){if(activeRequest===request)setStatus('error','润色失败，保留本地列传：'+e.message);}
   finally{if(activeRequest===request){activeRequest=null;request.finish();}}
  });
  const cancel=button('取消润色',()=>cancelRequest(),actions,true);cancel.hidden=true;
  button('原始列传',()=>{cancelRequest();body.scrollTop=rawCard.offsetTop-body.offsetTop;},actions,true);
  button('导出完整事件 JSON',()=>exportArchive(),actions,true);
  button('导出紧凑事件档案',()=>exportArchive(true),actions,true);
  section.append(header,body,actions);panel.append(section);panel.hidden=false;SP.touchRelease?.();
  const nav=D.querySelector('#community-touch-tools nav');if(nav)nav.hidden=true;const toggle=D.getElementById('community-tools-toggle');if(toggle){toggle.textContent='工具';toggle.setAttribute('aria-expanded','false');}
  root.dispatchEvent(new Event('blur'));closeButton.focus({preventScroll:true});
 }
 const busy0=G.busy;G.busy=function(){return !!(panel&&!panel.hidden)||busy0.apply(this,arguments);};
 root.addEventListener('keydown',e=>{if(panel&&!panel.hidden){if(e.key==='Escape'){close();e.preventDefault();}e.stopImmediatePropagation();}},true);
 const update0=G.update;G.update=function(){const r=update0.apply(this,arguments);if(!G.ps)return r;if(activeRequest&&(activeRequest.owner!==G.ps||activeRequest.archive!==G.ps.lifeChronicle||activeRequest.scene!==SP.place.where()))cancelRequest('游戏状态已切换，润色已取消。');const s=state(),conflict=G.ps.npcConflict;
  for(const e of conflict?.events||[])if(e.id>seenConflict){record('conflict:'+e.kind,'conflict_rules',e.text,{caseId:e.caseId,eventId:e.id,details:e.facts||{},case:(()=>{const c=conflict.cases.find(c=>c.id===e.caseId);if(!c)return null;const {dialogue,...facts}=c;return M.copy({...facts,dialogueLastId:dialogue?dialogue.nextId-1:0});})()},e.at);seenConflict=e.id;}
  if(conflict?.player.health===0&&!s.death){const damage=conflict.player.lastDamage,cause=damage?.source==='police'?'严重暴力事件中的警方枪击':damage?.source==='npc'?'与居民冲突中受到反击':'战斗受伤';M.die(s,C.abs(),cause,{money:G.ps.money,spent:G.ps.stats.spent,earned:G.ps.stats.earned,unpaid:conflict.player.debt,weapon:conflict.player.weapon,damage:damage||null});try{root.localStorage.setItem('fushi.life.lastDeath.v1',JSON.stringify(s));}catch(_){} }
  if(s.death&&!deathShown){deathShown=true;show();}return r;
 };
 const bar=D.getElementById('bar');if(bar){const b=D.createElement('button');b.textContent='人生档案';b.onclick=show;bar.append(b);}
 const mobileHost=D.querySelector('#community-touch-tools nav');if(mobileHost){const b=D.createElement('button');b.type='button';b.id='chronicle-launch-touch';b.textContent='人生档案';b.onclick=show;mobileHost.append(b);}
 SP.lifeChronicle={state,record,show,isOpen:()=>!!(panel&&!panel.hidden),close,exportArchive,resetRuntime(){close();seenConflict=G.ps?.npcConflict?.events.at(-1)?.id||0;deathShown=false;}};
})(window);
