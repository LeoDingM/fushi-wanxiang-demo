/* Nearby incidental expression only. Never edits NPC routes, schedules or saves. */
(function(root){
 'use strict';const SP=root.SP,G=SP?.game,W=SP?.world,C=SP?.clock;if(!G||!W||!C||SP.npcLifeAmbient)return;
 const RANGE=7,MAX_BUBBLES=3,ACTOR_COOLDOWN=60,EMIT_GAP=5,AI_GAP=90;
 const bubbles=new Map();let cooldown=new WeakMap(),owner=G.ps,scene=where(),lastTick=-Infinity,nextEmit=(SP.now||0)+2,nextAI=-Infinity,serial=0,request=null;
 const now=()=>Number.isFinite(SP.now)?SP.now:0;
 function where(){return SP.place?.where?.()||(W.interior?W.sceneId:'street');}
 function clear(){request?.controller.abort();request=null;bubbles.clear();cooldown=new WeakMap();owner=G.ps;scene=where();nextEmit=now()+2;lastTick=-Infinity;}
 function road(a){if(W.interior)return false;const tr=W.data?.traffic,r=(a.radius||.22)+.25;
  for(const lane of tr?.lanes||[]){const across=lane.axis==='x'?a.y:a.x,along=lane.axis==='x'?a.x:a.y;if(Number.isFinite(lane.c)&&Array.isArray(lane.range)&&along>=lane.range[0]-r&&along<=lane.range[1]+r&&Math.abs(across-lane.c)<=1.5+r)return true;}
  for(const cw of tr?.crosswalks||[])if(a.x>=cw.x0-r&&a.x<=cw.x1+r&&a.y>=cw.y0-r&&a.y<=cw.y1+r)return true;
  return false;
 }
 function eligible(a){
  const p=SP.player,conflict=G.ps?.npcConflict?.people?.[a?.id];
  if(!G.ps||!a||!p||a===p||a.isPlayer||a.hidden||a.isAnimal||a.dead||a.vehicle||a.police||a.cityResponder||/police|medic|nurse|firefighter/.test(a.set||'')||a.injured||a.medicalPatient||a.stretcher||a.restrained||a.crossing||p.level==='roof'||SP.metroActive||root.FushiMetro?.core?.active||SP.cbd?.active||SP.progressSave?.restoring)return false;
  if(!(SP.actors?.list||[]).includes(a)||(a.level||'street')!==(p.level||'street')||a.scene&&a.scene!==where()||a.sceneId&&a.sceneId!==where())return false;
  if(!Number.isFinite(a.x)||!Number.isFinite(a.y)||Math.hypot(a.x-p.x,a.y-p.y)>RANGE||road(a))return false;
  if(conflict&&(conflict.health<100||conflict.restrained||conflict.mode!=='calm')||SP.cityIncidents?.poseFor?.(a)||SP.cityIncidents?.holdsActor?.(a.id)||SP.npcConversations?.holdsActor?.(a.id)||SP.cityIncidents?.speechFor?.(a))return false;
  if(a.conflictSpeech?.until>now()||SP.conflictDialogue?.holdsActor?.(a.id)||SP.socialEncountersLive?.candidate?.engine?.current?.()?.target===a.id)return false;
  if(typeof W.blockedStatic!=='function')return false;for(let t=.1;t<1;t+=.1)if(W.blockedStatic(p.x+(a.x-p.x)*t,p.y+(a.y-p.y)*t,.05))return false;
  return true;
 }
 function available(){return !!G.ps&&!SP.player?.dead&&G.ps.npcConflict?.player?.health!==0&&!SP.progressSave?.restoring&&!G.busy?.()&&!SP.phone?.isOpen?.()&&!SP.nearbyPicker?.isOpen?.();}
 function role(a){const job=a.diversity?.job||a.profile?.job||a.job||a.set||'';if(/office/.test(job))return '上班族';if(/student/.test(job))return '学生';if(/vendor/.test(job))return '摊主';if(/clerk/.test(job))return '店员';if(/barber/.test(job))return '理发师';if(a.id==='community_resident_lin')return '社区邻居';return '街坊';}
 function local(a,kind){
  const job=role(a),min=C.min||0,phase=a.id==='community_resident_lin'?SP.communityRoutines?.state?.()?.phase||'':'';
  let text;
  if(C.weather==='rain')text='雨还在下，脚下得留神。';else if(C.weather==='snow')text='下雪了，走路慢一点。';
  else if(phase==='evening-reading')text='傍晚了，按平时的安排去翻几页书。';else if(phase==='rain-home')text='天气不太好，还是按原来的安排走。';
  else if(job==='上班族')text=min<360||min>=1200?'夜深了，路上得留意时间。':min<600?'早上出门，得留意时间。':min<1020?'忙了一阵，也得缓口气。':'走完这一段，慢慢调整一下状态。';
  else if(job==='学生')text=min<720?'想想今天要看的内容。':'有不明白的，回头再看看。';
  else if(job==='摊主')text=min<600?'忙的时候也得把东西摆整齐。':'有空就整理一下摊前。';
  else if(job==='店员')text='做事仔细一点，别着急。';else if(min>=1200||min<360)text='夜深了，走路放轻一点。';else text='今天天气还好，慢慢走。';
  return kind==='phone'?[text,'嗯，我听着，你慢慢说。','先说到这里，路上得留意周围。']:[text];
 }
 function valid(b){return owner===G.ps&&scene===where()&&b.owner===G.ps&&b.scene===where()&&bubbles.get(b.actor)===b&&now()<b.until&&available()&&eligible(b.actor);}
 function polish(b){const api=SP.phoneAI;if(request||now()<nextAI||!api?.settings?.().enabled||api.isPending?.()||typeof api.ambientSpeech!=='function')return;
  nextAI=now()+AI_GAP;const controller=new AbortController(),token={controller,b};request=token;
  const context={time:String(C.hhmm?.()||String(Math.floor((C.min||0)/60)).padStart(2,'0')+':'+String(Math.floor((C.min||0)%60)).padStart(2,'0')),weather:String(C.weather||'clear'),routine:b.actor.id==='community_resident_lin'?String(SP.communityRoutines?.state?.()?.phase||''):'',scene:where()};
  Promise.resolve().then(()=>{if(!valid(b)||controller.signal.aborted)return null;return api.ambientSpeech({kind:b.kind,actorId:b.actor.id,profile:{role:role(b.actor)},context,localLines:b.lines.slice(),signal:controller.signal});}).then(result=>{
   if(request!==token||controller.signal.aborted||!valid(b))return;const lines=result?.lines;if(!Array.isArray(lines)||lines.length!==b.lines.length||!lines.every(x=>typeof x==='string'&&x.trim()&&x.length<=72))return;b.lines=lines.map(x=>x.trim());
  }).catch(()=>{}).finally(()=>{if(request===token)request=null;});
 }
 function tick(){
  if(owner!==G.ps||scene!==where()){clear();return;}
  for(const [a,b]of bubbles)if(!valid(b))bubbles.delete(a);
  if(request&&!valid(request.b)){request.controller.abort();request=null;}
  if(now()-lastTick<.5)return;lastTick=now();if(!available()||now()<nextEmit||bubbles.size>=MAX_BUBBLES)return;
  const candidates=(SP.actors?.list||[]).filter(a=>eligible(a)&&!bubbles.has(a)&&now()>=(cooldown.get(a)||0));
  if(!candidates.length){nextEmit=now()+1;return;}
  const actor=candidates[serial%candidates.length],kind=serial++%2===0?'phone':'mutter',duration=kind==='phone'?12:5,b={actor,kind,owner:G.ps,scene:where(),lines:local(actor,kind),startedAt:now(),until:now()+duration};
  bubbles.set(actor,b);cooldown.set(actor,now()+ACTOR_COOLDOWN);nextEmit=now()+EMIT_GAP;polish(b);
 }
 function speechFor(actor){const b=bubbles.get(actor);if(!b||!valid(b))return null;const progress=Math.max(0,Math.min(1,(now()-b.startedAt)/(b.until-b.startedAt))),index=Math.min(b.lines.length-1,Math.floor(progress*b.lines.length));return {text:b.lines[index],kind:b.kind,progress};}
 const update0=G.update;G.update=function(){const result=update0.apply(this,arguments);tick();return result;};
 SP.npcLifeAmbient={speechFor,tick,resetRuntime:clear};
})(window);
