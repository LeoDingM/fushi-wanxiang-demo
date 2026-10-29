(function(root){
 'use strict';
 const SP=root.SP,G=SP.game,C=SP.clock,M=root.NpcConflictModel,DM=root.ConflictDialogueModel,D=root.document;
 let panel=null,log=null,status=null,input=null,send=null,finish=null,cancelButton=null,choices=[],currentId=null,busy=false,controller=null,epoch=0,lastAuto=-Infinity;
 if(D.currentScript?.src&&!D.querySelector('link[data-work-ui-style]')){const css=D.createElement('link');css.rel='stylesheet';css.dataset.workUiStyle='true';css.href=new URL('work_ui.css',D.currentScript.src).href;D.head.append(css);}
 const opened=new Set(),heldIds=new Set();let reacted=new WeakMap();
 const state=()=>G.ps?.npcConflict,findCase=()=>state()?.cases.find(c=>c.id===currentId);
 const name=a=>a?.name||root.SocialEncounters?.profiles?.[a?.id]?.name||(a?.police?'民警':'涉事居民');
 function participants(c){
  const out=[{id:'player',name:'李默',role:'player'},{id:state().unit.officerId||'police',name:'现场民警',role:'police',personality:M.personality(state().unit.officerId||'police')}];
  const ids=c.policeAssault?[c.victim]:[...new Set([c.victim,...state().cases.filter(q=>Math.abs(q.at-c.at)<=30&&Math.hypot(q.x-c.x,q.y-c.y)<15&&q.status!=='closed').map(q=>q.victim)])];
  for(const id of ids){const a=SP.actors.list.find(a=>a.id===id),p=state().people[id];if(out.some(p=>p.id===id)||!a||a.hidden||a.dead||p?.health===0||Math.hypot(a.x-SP.player.x,a.y-SP.player.y)>12)continue;out.push({id,name:name(a),role:a.police?'police':'npc',personality:p?.personality||M.personality(id)});if(out.length>=5)break;}
  return out;
 }
 function record(c,speaker,text,source='local',label){const roster=participants(c),p=roster.find(p=>p.id===speaker),line=DM.append(c,{speaker,name:label||p?.name||'已记录陈述',text,source,at:C.abs()});if(line)M.note(state(),C.abs(),'hearing_speech',c.id,line.name+'：'+line.text,{speaker,lineId:line.id,source,text:line.text,verified:source==='rule'});return line;}
 function say(actor,text,source='local'){if(!actor||actor.dead||actor.hidden)return;actor.conflictSpeech={text:String(text).slice(0,72),until:SP.now+6,source};}
 function react(actor,p,weapon='kick'){
  if(!actor||actor.police||p.health===0||actor.hidden)return;
  const prior=reacted.get(actor);if(prior&&SP.now-prior.at<2)return;
  reacted.set(actor,{hits:p.hits,mode:p.mode,at:SP.now});
  const text=DM.reaction(p,weapon);say(actor,text);
  const s=state(),c=s.cases.findLast(q=>q.victim===actor.id);M.note(s,C.abs(),'reaction_speech',c?.id||null,name(actor)+'：'+text,{speaker:actor.id,text,source:'local'});
  if(!SP.ai?.settings().enabled||SP.ai.isPending()||busy||SP.now-lastAuto<8)return;
  lastAuto=SP.now;const owner=G.ps,token=actor.conflictSpeech;
  SP.ai.conflictSpeech({kind:'reaction',participants:[{id:actor.id,name:name(actor),role:'npc',personality:p.personality}],input:'受到'+({kick:'踢击',knife:'持刀袭击',branch:'树枝击打',fists:'拳击'}[weapon]||'攻击'),context:{emotion:p.emotion,mode:p.mode,localReply:text},history:[]}).then(r=>{
   if(owner!==G.ps||actor.dead||actor.hidden||p.health===0||p.restrained||!['shock','flee','fight','protest','report'].includes(p.mode)||actor.conflictSpeech!==token||SP.now>token.until)return;
   const line=r.lines[0];say(actor,line.text,'ai');M.note(s,C.abs(),'reaction_speech',c?.id||null,name(actor)+'：'+line.text,{speaker:actor.id,text:line.text,source:'ai'});
  }).catch(()=>{});
 }
 function drawSpeech(ctx,a){const s=a.conflictSpeech;if(!s||s.until<=SP.now||a.dead)return;const [x,y]=a.screen(),chars=Array.from(s.text).slice(0,72),lines=[];for(let i=0;i<chars.length;i+=12)lines.push(chars.slice(i,i+12).join(''));const w=Math.max(60,Math.min(168,Math.max(...lines.map(l=>l.length))*13+16)),h=lines.length*17+12,top=y-(a.umbrella?91:83)-h;ctx.save();ctx.fillStyle='rgba(255,250,230,.97)';ctx.strokeStyle='#715b42';ctx.lineWidth=1;ctx.fillRect(x-w/2,top,w,h);ctx.strokeRect(x-w/2,top,w,h);ctx.beginPath();ctx.moveTo(x-4,top+h);ctx.lineTo(x,top+h+6);ctx.lineTo(x+4,top+h);ctx.fill();ctx.fillStyle='#382c28';ctx.font='12px sans-serif';ctx.textAlign='center';lines.forEach((t,i)=>ctx.fillText(t,x,top+17+i*17));ctx.restore();}
 function render(){if(!log)return;const c=findCase();if(!c)return;log.replaceChildren();for(const l of DM.ensure(c).lines){const row=D.createElement('div'),who=D.createElement('strong'),text=D.createElement('p'),role=l.speaker==='player'?'player':l.speaker===(state().unit.officerId||'police')||SP.actors.list.some(a=>a.id===l.speaker&&a.police)||c.policeAssault&&l.speaker===c.victim||l.source==='rule'?'police':'npc';row.className='hearing-line '+l.source+' speaker-'+role;who.textContent=({player:'你 · ',police:'警务 · ',npc:'居民 · '})[role]+l.name+(l.source==='ai'?' · AI表达':l.source==='rule'?' · 处理记录':'');text.textContent=l.text;row.append(who,text);log.append(row);}log.scrollTop=log.scrollHeight;const closed=c.status==='closed',result=c.status==='escorting';input.disabled=busy||closed||result;send.disabled=busy||closed||result;finish.disabled=busy||closed||result;for(const b of choices)b.disabled=busy||closed||result;if(cancelButton)cancelButton.hidden=!busy;finish.textContent=c.status==='processing'?'结束陈述，查看处理结果':'结束陈述，请警员判断';}
 function valid(owner,id,run){return owner===G.ps&&id===currentId&&run===epoch&&!!findCase()&&['inquiry','processing'].includes(findCase().status);}
 async function submit(text,claim){const c=findCase();if(!c||busy||!['inquiry','processing'].includes(c.status)||!text.trim())return;const owner=G.ps,id=c.id,run=epoch;busy=true;controller=new AbortController();const requestController=controller;status.textContent=c.policeAssault?'警员正在记录陈述…':'双方正在回应…';render();
  try{
   let r=null;if(SP.ai?.settings().enabled){try{r=await SP.ai.conflictSpeech({kind:'hearing',participants:participants(c),input:text.slice(0,600),claim,context:{stage:c.status,policeAssault:!!c.policeAssault,firsthandOfficer:c.policeAssault?c.victim:null,policeWitnessed:!!c.policeWitnessed,witnessCount:c.witnesses.length,victimStatement:c.victimStatement,playerClaim:c.statement,npcContinuedAttackObserved:!!state().people[c.victim]?.policeOrderAt},history:DM.ensure(c).lines.slice(-16),signal:requestController.signal});}catch(e){if(requestController.signal.aborted)return;if(!claim){status.textContent='未提交：'+e.message+'；可选择下方陈述继续。';return;}}}
   if(!valid(owner,id,run)||requestController.signal.aborted)return;const intent=claim||r?.claim;if(!intent){status.textContent='自由陈述需要启用手机中的全局 API。';return;}
   M.statement(state(),intent,C.abs(),text);record(c,'player',text,'player');
   const roster=participants(c),allowed=new Set(roster.map(p=>p.id)),lines=r?.lines||(c.policeAssault?roster.filter(p=>p.role==='police').map(p=>({speaker:p.id,text:'你的陈述和异议已记录。我们会核对遭袭警员的亲历记录、伤情及现场事实，处理依据由游戏规则判定。'})):DM.localReplies(roster,intent));
   for(const l of lines){if(!allowed.has(l.speaker)||l.speaker==='player')continue;record(c,l.speaker,l.text,r?'ai':'local');say(SP.actors.list.find(a=>a.id===l.speaker),l.text,r?'ai':'local');}
   status.textContent=r?'已记录本轮对话。可以继续回应或请警员判断。':'已使用本地角色回应。可以继续陈述。';input.value='';
  }finally{if(run===epoch){busy=false;controller=null;render();}}
 }
 function decide(){const c=findCase();if(!c||busy)return;if(c.status==='inquiry')M.finishInquiry(state(),C.abs(),{complete:true});else if(c.status==='processing')M.release(state(),G.ps,C.abs(),{complete:true});else return;
  const basis='判断依据：'+(c.policeAssault?'遭袭警员亲历记录；':c.policeWitnessed?'警员目击；':'警员未目击起因；')+'目击者记录 '+c.witnesses.length+' 人；'+(c.statement?'已记录玩家陈述。':'玩家尚未作出陈述。');
  const result=c.status==='escorting'?'双方说法或伤情仍需核实，接下来带回询问。这不是最终定责。':c.outcome==='onsite_mediation'?'现场询问结束，分开双方，解除本次控制。':c.outcome==='pending_review'?'当前材料不足以最终认定责任，解除控制，保留待核实记录。':'本次游戏处理已作出：支付 ¥'+c.paid+'，欠款 ¥'+c.debt+'。'+(c.falseStatement?'另有与目击材料冲突的指认记录。':'');
  record(c,state().unit.officerId||'police',basis+'\n'+result,'rule','民警 · 本阶段处理结论');status.textContent=c.status==='escorting'?'收起对话后继续押送，到达后会再次询问。':'可收起页面继续游戏；完整对话已进入事件档案。';render();
 }
 function close(){epoch++;controller?.abort();controller=null;busy=false;heldIds.clear();if(panel)panel.hidden=true;SP.touchRelease?.();}
 function dockControls(){
  const controls=D.getElementById?.('conflict-buttons'),bar=D.getElementById?.('bar'),nav=D.querySelector?.('#community-touch-tools nav');if(!controls||!bar||!nav)return;
  let desktop=D.getElementById('conflict-actions-menu');if(!desktop){desktop=D.createElement('details');desktop.id='conflict-actions-menu';const label=D.createElement('summary');label.textContent='随身与互动';desktop.append(label);bar.append(desktop);
   controls.addEventListener('click',()=>{desktop.open=false;nav.hidden=true;const toggle=D.getElementById('community-tools-toggle');if(toggle){toggle.textContent='工具';toggle.setAttribute('aria-expanded','false');}},true);
  }
  const host=D.body.classList.contains('mobile')?nav:desktop;if(controls.parentNode!==host)host.append(controls);
 }
 function show(c=M.active(state())){if(!c||!['inquiry','processing'].includes(c.status))return;close();currentId=c.id;
  if(!panel){panel=D.createElement('div');panel.id='conflict-hearing';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');for(const event of ['touchstart','touchmove','touchend'])panel.addEventListener(event,e=>e.stopPropagation(),{passive:true});D.body.append(panel);}
  const node=(tag,text,cls)=>{const e=D.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
  panel.replaceChildren();const section=node('section'),header=node('header'),heading=node('div'),h=node('h2',c.policeAssault?'警务站 · 袭警事件陈述':c.status==='processing'?'警务站 · 共同询问':'现场 · 双方陈述'),roster=node('p',null,'hearing-roster');panel.setAttribute('aria-label',h.textContent);const people=participants(c);for(const p of people)heldIds.add(p.id);roster.textContent='参与：'+people.map(p=>p.name).join('、')+(c.policeAssault?' · 核对警员亲历记录与玩家陈述':people.some(p=>p.id===c.victim)?'':' · 对方不在近处，使用先前已记录的说法');heading.append(h,roster);header.append(heading);const back=node('button','收起 / 返回现场','secondary');back.type='button';back.onclick=close;header.append(back);section.append(header);
  log=node('div');log.id='hearing-log';log.setAttribute('role','log');log.setAttribute('aria-live','polite');section.append(log);
  const composer=node('footer',null,'hearing-composer');status=node('p','可以多轮交谈；陈述内容不自动成为事实。','hearing-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');composer.append(status);
  const local=node('details',null,'hearing-local'),summary=node('summary','使用本地陈述 · 无需 API'),options=node('div',null,'actions hearing-choices');choices=[];
  for(const [claim,text]of [['admit','我承认先动手，愿意说明经过。'],['defense','我是在保护自己，请核对先后顺序。'],['dispute','我不同意这个说法，请拿出证据。'],['accuse','是对方先动手，我要求调查。']]){const b=node('button',text,'secondary');b.type='button';b.onclick=()=>submit(text,claim);options.append(b);choices.push(b);}local.append(summary,options);composer.append(local);
  const compose=node('div',null,'hearing-input');input=node('textarea');input.maxLength=600;input.placeholder=c.policeAssault?'向警员说明经过或提出异议…（自由发言需要全局 API）':'对警员或对方说些什么…（自由发言需要全局 API）';input.setAttribute('aria-label','本轮陈述');send=node('button','发送发言');send.type='button';send.onclick=()=>submit(input.value);compose.append(input,send);composer.append(compose);
  const actions=node('div',null,'actions hearing-actions');finish=node('button',null,'secondary');finish.type='button';finish.onclick=decide;cancelButton=node('button','取消等待','secondary');cancelButton.type='button';cancelButton.hidden=true;cancelButton.onclick=()=>{controller?.abort();status.textContent='已取消，本轮尚未提交。';};actions.append(finish,cancelButton);composer.append(actions);section.append(composer);panel.append(section);panel.hidden=false;
  const key=c.id+':'+c.status+':'+c.arrestedAt;if(!opened.has(key)){opened.add(key);if(c.policeAssault){record(c,people[1].id,'本次记录为警员遭受攻击的事件。请说明经过或提出异议，警员亲历、伤情及其他现场记录由游戏规则核对。','local');record(c,c.victim,'遭袭警员亲历攻击，原始事件已记录；玩家可以继续作出陈述，陈述不会自动改写事实。','rule','遭袭警员 · 亲历记录');}else {record(c,people[1].id,'先停止争执。你们分别说清起因、谁先动手、之后又发生了什么。','local');for(const p of people.filter(p=>p.role==='npc'))record(c,p.id,'我的说法是他先攻击了我。我愿意说明当时的经过。','local');if(!people.some(p=>p.id===c.victim))record(c,c.victim,c.victimStatement?'对方先前的说法：玩家先动手。该说法仍待核实。':'对方目前无法参与陈述，应核对现场及其他已有记录。','rule','询问记录');}}
  render();SP.touchRelease?.();root.dispatchEvent(new Event('blur'));
 }
 function tick(){dockControls();const s=state();if(!s)return;if(s.player.health===0){close();return;}for(const a of SP.actors.list){const p=s.people[a.id],r=reacted.get(a);if(p&&p.health>0&&!a.hidden&&['shock','flee','fight','report','protest'].includes(p.mode)&&(!r||r.hits!==p.hits||r.mode!==p.mode)&&(!r||SP.now-r.at>=3))react(a,p,s.cases.findLast(c=>c.victim===a.id)?.weapon);}
  const c=M.active(s);if(c&&['inquiry','processing'].includes(c.status)&&!opened.has(c.id+':'+c.status+':'+c.arrestedAt))show(c);
 }
 const busy0=G.busy;G.busy=function(){return !!(panel&&!panel.hidden)||busy0.apply(this,arguments);};
 root.addEventListener('keydown',e=>{if(panel&&!panel.hidden){if(e.key==='Escape'){close();e.preventDefault();}e.stopImmediatePropagation();}},true);
 SP.conflictDialogue={holdsActor:id=>!!(panel&&!panel.hidden&&heldIds.has(id)),show,close,tick,react,drawSpeech,submit,decide,participants,isOpen:()=>!!(panel&&!panel.hidden),resetRuntime(){close();currentId=null;opened.clear();reacted=new WeakMap();for(const a of SP.actors.list)delete a.conflictSpeech;lastAuto=-Infinity;}};
})(window);
