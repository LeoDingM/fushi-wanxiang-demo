/* I15 reading appointment: rule-owned, no UI, no route changes or extra reading rewards. */
(function(root){
 'use strict';
 const ROOM='community_reading_room',SHARED='community_shared_read',HISTORY=16,MAX_TIME=1e12;
 const outcomes=['completed','player_cancelled','weather_cancelled','player_missed','npc_unavailable','not_started','interrupted','window_skipped','fulfilled_elsewhere'];
 const clone=x=>JSON.parse(JSON.stringify(x)),plain=x=>x&&Object.getPrototypeOf(x)===Object.prototype,keys=(x,fields)=>plain(x)&&Object.keys(x).sort().join(',')===fields.slice().sort().join(',');
 const time=n=>Number.isFinite(n)&&n>=0&&n<=MAX_TIME,integer=n=>Number.isSafeInteger(n)&&n>=0&&n<=1e12;
 const schedule=day=>({startAt:day*1440+1080,latestStartAt:day*1440+1110});
 const fresh=()=>({version:1,nextId:1,trust:0,refusalUntilDay:-1,lastRepairDay:-1,lastRepairId:0,active:null,history:[]});
 function validBase(a,at){const {startAt,latestStartAt}=schedule(a.day);return integer(a.id)&&a.id>0&&integer(a.day)&&time(startAt)&&time(latestStartAt)&&time(a.createdAt)&&a.createdAt<startAt&&a.day>=Math.floor(a.createdAt/1440)&&a.day<=Math.floor(a.createdAt/1440)+1&&(at===undefined||a.createdAt<=at);}
 function validStarted(a){const w=schedule(a.day);return time(a.startedAt)&&a.startedAt>=w.startAt&&a.startedAt<=w.latestStartAt;}
 function validate(s,at,allowReading=false){
  if(!keys(s,['version','nextId','trust','refusalUntilDay','lastRepairDay','lastRepairId','active','history'])||s.version!==1||!integer(s.nextId)||s.nextId<1||!Number.isInteger(s.trust)||s.trust< -3||s.trust>3||![s.refusalUntilDay,s.lastRepairDay].every(n=>n===-1||integer(n))||!integer(s.lastRepairId)||s.lastRepairId>=s.nextId||!Array.isArray(s.history)||s.history.length>HISTORY||(at!==undefined&&!time(at)))return false;
  if((s.lastRepairId===0)!==(s.lastRepairDay===-1))return false;
  let previous=0,lastAt=-1;
  for(const h of s.history){
   if(!keys(h,['id','day','createdAt','endedAt','outcome','startedAt','trustDelta'])||!validBase(h,at)||h.id<=previous||h.id>=s.nextId||!time(h.endedAt)||h.endedAt<h.createdAt||h.endedAt<lastAt||(at!==undefined&&h.endedAt>at)||!outcomes.includes(h.outcome)||!Number.isInteger(h.trustDelta)||h.trustDelta< -1||h.trustDelta>1)return false;
   const w=schedule(h.day);
   if(h.outcome==='completed'){if(!validStarted(h)||h.endedAt<h.startedAt+20-1e-6||h.endedAt>h.startedAt+21||![0,1].includes(h.trustDelta))return false;}
   else if(h.outcome==='player_missed'){if(h.startedAt!==null||h.endedAt<=w.latestStartAt||![-1,0].includes(h.trustDelta))return false;}
   else if(h.trustDelta!==0)return false;
   if(['player_cancelled','player_missed','npc_unavailable','not_started','fulfilled_elsewhere'].includes(h.outcome)&&h.startedAt!==null)return false;
   if(h.outcome==='player_cancelled'&&h.endedAt>=w.startAt)return false;
   if(['npc_unavailable','not_started','window_skipped'].includes(h.outcome)&&h.endedAt<=w.latestStartAt&&h.startedAt===null)return false;
   if(h.outcome==='weather_cancelled'&&(h.endedAt<h.day*1440+1020||h.endedAt>w.latestStartAt+21))return false;
   if(h.outcome==='weather_cancelled'&&(h.startedAt===null?h.endedAt>w.latestStartAt:h.endedAt>h.startedAt+21))return false;
   if(h.outcome==='interrupted'&&(!validStarted(h)||h.endedAt>h.startedAt+21))return false;
   if(h.outcome==='window_skipped'&&h.startedAt!==null&&h.endedAt<=h.startedAt+21)return false;
   if(h.startedAt!==null&&(!validStarted(h)||h.endedAt<h.startedAt))return false;
   previous=h.id;lastAt=h.endedAt;
  }
  if(s.active!==null){const a=s.active;if(!keys(a,['id','day','createdAt','status','startedAt','observedAt','windowObserved','npcReadyMinutes','lastNpcReady','playerSeen','obstructed'])||!validBase(a,at)||a.id<=previous||a.id>=s.nextId||!['scheduled','reading'].includes(a.status)||!time(a.observedAt)||a.observedAt<a.createdAt||(at!==undefined&&a.observedAt>at)||!Number.isFinite(a.npcReadyMinutes)||a.npcReadyMinutes<0||a.npcReadyMinutes>30||!['windowObserved','lastNpcReady','playerSeen','obstructed'].every(k=>typeof a[k]==='boolean')||(a.status==='scheduled'&&a.startedAt!==null)||(a.status==='reading'&&(!allowReading||!validStarted(a)||a.startedAt>a.observedAt)))return false;const w=schedule(a.day),elapsed=Math.max(0,Math.min(a.observedAt,w.latestStartAt)-w.startAt);if(a.npcReadyMinutes>elapsed+1e-6||(a.observedAt<w.startAt&&(a.windowObserved||a.playerSeen||a.obstructed||a.lastNpcReady))||(a.status==='scheduled'&&(a.observedAt>w.latestStartAt||(!allowReading&&at!==undefined&&at>w.latestStartAt))))return false;}
  const total=s.nextId-1-(s.active?1:0),retained=Math.min(total,HISTORY);
  if(total<0||s.history.length!==retained||s.history.some((h,i)=>h.id!==total-retained+1+i)||(s.active&&s.active.id!==s.nextId-1))return false;
  if(total===0&&(s.trust!==0||s.refusalUntilDay!==-1||s.lastRepairId!==0))return false;
  if(total<=HISTORY){const base=s.history.reduce((n,h)=>n+h.trustDelta,0),repairs=s.history.filter(h=>h.outcome==='player_missed'&&h.id<=s.lastRepairId).length,delta=s.trust-base;if(s.lastRepairId===0?delta!==0:delta<1||delta>repairs)return false;}
  if(s.refusalUntilDay!==-1&&(total<=HISTORY||(at!==undefined&&s.refusalUntilDay>=Math.floor(at/1440)))&&!s.history.some(h=>h.outcome==='player_missed'&&h.day+1===s.refusalUntilDay))return false;
  if(s.lastRepairId){const row=s.history.find(h=>h.id===s.lastRepairId);if(row){if(row.outcome!=='player_missed'||s.lastRepairDay<row.day)return false;}else if(s.history.length!==HISTORY||s.lastRepairId>=s.history[0].id)return false;}
  if(at!==undefined&&(s.lastRepairDay>Math.floor(at/1440)||s.refusalUntilDay>Math.floor(at/1440)+1))return false;
  return true;
 }
 const normalize=(s,at,allowReading=false)=>validate(s,at,allowReading)?clone(s):null;
 function create(adapter,initial=fresh()){
  let stored=normalize(initial,adapter.now(),true);if(!stored)throw Error('预约初始状态无效。');let generation=1,serial=0,source=adapter.source?.(),runtime=null;const tokens=new Map(),used=new Map(),rescheduledUsed=new Map();
  function ref(){const s=adapter.getState?.()||stored;if(!validate(s,adapter.now(),true))throw Error('预约运行状态无效。');return s;}
  function resetRuntime(){if(runtime)adapter.cancelReading?.();runtime=null;tokens.clear();used.clear();rescheduledUsed.clear();generation++;source=adapter.source?.();}
  function syncSource(){if(adapter.source&&adapter.source()!==source)resetRuntime();}
  function finish(outcome){const s=ref(),a=s.active;if(!a)return null;const prior=s.trust;s.trust=Math.max(-3,Math.min(3,s.trust+(outcome==='completed'?1:outcome==='player_missed'?-1:0)));if(outcome==='player_missed'&&s.trust<=-2)s.refusalUntilDay=Math.max(s.refusalUntilDay,a.day+1);const h={id:a.id,day:a.day,createdAt:a.createdAt,endedAt:adapter.now(),outcome,startedAt:a.startedAt,trustDelta:s.trust-prior};s.history.push(h);if(s.history.length>HISTORY)s.history.shift();s.active=null;runtime=null;tokens.clear();return clone(h);}
  function gate(day,ignoreActive=false){const s=ref(),c=adapter.context(),now=adapter.now(),today=Math.floor(now/1440);if(!integer(day)||![today,today+1].includes(day))return '只能约今天或明天。';if(now>=schedule(day).startAt)return '这个约定时间已经到了，换明天吧。';if(adapter.reserved?.(day))return '小林这段时间已经答应了别人的邀约，换个时间吧。';if(s.active&&!ignoreActive)return '先处理当前约定，再约下一次。';if(!c.nearby)return '要当面走近小林，再提出邀约。';if(c.familiarity<2)return '先多认识小林一些，再约一起读书。';if(c.cooldownUntil>now)return '小林现在想安静一会儿，稍后再约。';if(c.businessBusy)return '先结束手头的活动或菜单。';if(today<=s.refusalUntilDay)return '小林还想缓一缓，现在先不约新的了。';if(day===today&&c.rain)return '今天雨有点大，先不约了，改天吧。';if(c.lastSharedDay===day)return '这一天已经一起读过书了。';if(s.history.some(h=>h.day===day&&h.outcome!=='player_cancelled'))return '这一天的约定已经处理过了，换一天吧。';return null;}
  function offer(day){syncSource();const reason=gate(day);if(reason)return {ok:false,reason};const token=`reading:${generation}:${++serial}`,proposal={day,issuedAt:adapter.now(),source:adapter.source?.()};tokens.set(token,proposal);while(tokens.size>8)tokens.delete(tokens.keys().next().value);return {ok:true,token,day,...schedule(day),text:'小林：18点到阅览室，最晚18点半开始，读20分钟，这个时间你能安排吗？'};}
  function confirm(token){syncSource();if(used.has(token))return {ok:true,duplicate:true,id:used.get(token)};const p=tokens.get(token);if(!p||p.reschedule||p.source!==adapter.source?.()||adapter.now()<p.issuedAt||adapter.now()>p.issuedAt+5)return {ok:false,reason:'提案已经失效，请重新当面确认。'};const reason=gate(p.day);if(reason)return {ok:false,reason};const s=ref(),now=adapter.now(),id=s.nextId++;s.active={id,day:p.day,createdAt:now,status:'scheduled',startedAt:null,observedAt:now,windowObserved:false,npcReadyMinutes:0,lastNpcReady:false,playerSeen:false,obstructed:false};used.set(token,id);while(used.size>16)used.delete(used.keys().next().value);tokens.clear();return {ok:true,id,day:p.day,...schedule(p.day),text:'小林：好，到时在阅览室见。我还是按平时的安排过去。'};}
  // A reschedule proposal never cancels its source appointment. Only a fully
  // revalidated replacement snapshot is committed, keeping v1 save semantics.
  const identity=a=>JSON.stringify([a.id,a.day,a.createdAt,a.status,a.startedAt]);
  function rescheduleGate(day){const a=ref().active;if(!a||a.status!=='scheduled')return '只有尚未开始的阅读约定可以提前改期。';if(adapter.now()>=schedule(a.day).startAt)return '原约定时间已经开始，不能再提前改期。';if(day===a.day)return '请选择与原约定不同的一天。';return gate(day,true);}
  function offerReschedule(day){
   syncSource();const reason=rescheduleGate(day);if(reason)return {ok:false,reason};const s=ref(),a=s.active,token=`reading-reschedule:${generation}:${++serial}`;
   tokens.set(token,{reschedule:true,day,fromDay:a.day,previousId:a.id,issuedAt:adapter.now(),source:adapter.source?.(),state:s,active:a,identity:identity(a)});while(tokens.size>8)tokens.delete(tokens.keys().next().value);
   return {ok:true,token,reschedule:true,day,fromDay:a.day,previousId:a.id,...schedule(day),text:'小林：可以考虑换到'+(day===Math.floor(adapter.now()/1440)?'今天':'明天')+'18点，确认前原约定仍然保留。'};
  }
  function confirmReschedule(token){
   syncSource();if(rescheduledUsed.has(token))return {...rescheduledUsed.get(token),duplicate:true};const p=tokens.get(token),now=adapter.now();
   if(!p?.reschedule||p.source!==adapter.source?.()||now<p.issuedAt||now>p.issuedAt+5)return {ok:false,reason:'改期提案已经失效，原约定未更改，请重新当面确认。'};
   const s=ref();if(p.state!==s||p.active!==s.active||!s.active||p.identity!==identity(s.active))return {ok:false,reason:'原约定已变化，请重新当面确认改期。'};
   const reason=rescheduleGate(p.day);if(reason)return {ok:false,reason};const next=clone(s),a=next.active,id=next.nextId++;
   next.history.push({id:a.id,day:a.day,createdAt:a.createdAt,endedAt:now,outcome:'player_cancelled',startedAt:null,trustDelta:0});if(next.history.length>HISTORY)next.history.shift();
   next.active={id,day:p.day,createdAt:now,status:'scheduled',startedAt:null,observedAt:now,windowObserved:false,npcReadyMinutes:0,lastNpcReady:false,playerSeen:false,obstructed:false};
   if(!validate(next,now,true))return {ok:false,reason:'改期后的预约记录无效，原约定未更改。'};
   if(adapter.setState)adapter.setState(next);else if(adapter.getState)Object.assign(s,next);else stored=next;
   const result={ok:true,rescheduled:true,id,previousId:p.previousId,fromDay:p.fromDay,day:p.day,...schedule(p.day),text:'小林：已经改到'+(p.day===Math.floor(now/1440)?'今天':'明天')+'18点，原来的约定已提前取消，到阅览室见。'};
   rescheduledUsed.set(token,result);while(rescheduledUsed.size>16)rescheduledUsed.delete(rescheduledUsed.keys().next().value);tokens.clear();return {...result};
  }
  function cancel(){syncSource();const a=ref().active;if(!a)return {ok:false,reason:'现在没有待赴的约定。'};if(a.status==='reading')return {ok:false,reason:'已经开始阅读，离开会中断这次活动。'};if(adapter.now()>=schedule(a.day).startAt)return {ok:false,reason:'约定时间已经开始，不能再提前取消。'};return {ok:true,result:finish('player_cancelled'),text:'已提前取消，小林会按原来的安排活动。'};}
  function update(){syncSource();const s=ref(),a=s.active;if(!a)return {ok:true,changed:false};const now=adapter.now(),c=adapter.context(),w=schedule(a.day);
   if(a.status==='reading'){
    if(!runtime||runtime.id!==a.id||runtime.source!==adapter.source?.()){adapter.cancelReading?.();return {ok:true,result:finish('interrupted')};}
    if(now>a.startedAt+21||Math.floor(now/1440)!==a.day){adapter.cancelReading?.();return {ok:true,result:finish('window_skipped')};}
    if(c.rain){adapter.cancelReading?.();return {ok:true,result:finish('weather_cancelled')};}
    if(c.readingActive){if(adapter.activity&&adapter.activity()!==runtime.activity){adapter.cancelReading?.();return {ok:true,result:finish('interrupted')};}a.observedAt=now;return {ok:true,changed:false};}
    if(c.lastSharedDay===a.day&&runtime.priorSharedDay!==a.day&&now>=a.startedAt+20-1e-6)return {ok:true,result:finish('completed')};
    return {ok:true,result:finish('interrupted')};
   }
   if(c.lastSharedDay===a.day)return {ok:true,result:finish('fulfilled_elsewhere')};
   if(now>=a.day*1440+1020&&now<=w.latestStartAt&&Math.floor(now/1440)===a.day&&c.rain)return {ok:true,result:finish('weather_cancelled')};
   const gap=now-a.observedAt,span=Math.max(0,Math.min(now,w.latestStartAt)-Math.max(a.observedAt,w.startAt));
   if(a.observedAt<=w.startAt&&now>=w.startAt&&now<=w.startAt+1&&gap<=5)a.windowObserved=true;
   if(span>0&&gap>5)a.windowObserved=false;
   if(now>=w.startAt&&now<=w.latestStartAt){if(c.playerPresent)a.playerSeen=true;if(c.uncertainAbsence)a.obstructed=true;if(gap<=5&&a.lastNpcReady&&c.npcReady)a.npcReadyMinutes=Math.min(30,a.npcReadyMinutes+span);a.lastNpcReady=!!c.npcReady;}
   if(now>w.latestStartAt){const outcome=!a.windowObserved?'window_skipped':a.npcReadyMinutes<15?'npc_unavailable':a.playerSeen||a.obstructed?'not_started':'player_missed';return {ok:true,result:finish(outcome)};}
   a.observedAt=now;return {ok:true,changed:false};
  }
  function start(){const settled=update();if(settled.result)return {ok:false,reason:'这次约定已经结束。',result:settled.result};const a=ref().active,now=adapter.now();if(!a)return {ok:false,reason:'先当面确认一个阅读约定。'};if(a.status==='reading')return {ok:true,duplicate:true};const w=schedule(a.day);if(now<w.startAt||now>w.latestStartAt)return {ok:false,reason:'请在约定当天18:00–18:30到阅读位开始。'};const c=adapter.context();if(c.cooldownUntil>now)return {ok:false,reason:'小林现在想安静一会儿。'};const gate=adapter.canRead();if(!gate.ok)return gate;const result=adapter.startReading();if(!result?.ok)return result||{ok:false,reason:'未能开始阅读。'};const after=adapter.context();if(!after.readingActive)return {ok:false,reason:'阅读活动没有实际开始。'};a.status='reading';a.startedAt=now;a.observedAt=now;runtime={id:a.id,source:adapter.source?.(),activity:adapter.activity?.(),priorSharedDay:c.lastSharedDay};return {ok:true,id:a.id,text:'已经开始和小林一起读20分钟。'};}
  function explain(){syncSource();const s=ref(),c=adapter.context(),day=Math.floor(adapter.now()/1440);if(!c.nearby||c.cooldownUntil>adapter.now()||c.businessBusy)return {ok:false,reason:'先当面找小林，在能交谈时说明。'};if(s.trust>=0)return {ok:false,reason:'现在没有需要修复的失约信任。'};if(s.lastRepairDay===day)return {ok:false,reason:'今天已经解释过了，给小林一点时间。'};const missed=s.history.filter(h=>h.outcome==='player_missed'&&h.id>s.lastRepairId).at(-1);if(!missed)return {ok:false,reason:'没有新的失约需要解释。'};s.lastRepairId=missed.id;s.lastRepairDay=day;s.trust=Math.min(0,s.trust+1);return {ok:true,trust:s.trust,text:'小林：我听到你的解释了。下次提前说一声，我们再慢慢约。'};}
  function restore(next){const n=normalize(next,adapter.now(),false);if(!n)return {ok:false,reason:'预约存档无效或包含未完成阅读。'};resetRuntime();if(adapter.setState)adapter.setState(n);else stored=n;return {ok:true};}
  return {state:()=>clone(ref()),snapshot:()=>clone(ref()),offer,confirm,offerReschedule,confirmReschedule,cancel,start,update,explain,restore,resetRuntime,canSave:()=>ref().active?.status!=='reading',validate,normalize};
 }
 function register(SP){
  if(SP.socialAppointments)return SP.socialAppointments;const G=SP.game,W=SP.world,C=SP.clock;if(!G||!W||!C||!SP.communitySocial||!SP.communityRoutines)throw Error('阅读邀约须在小林日程和共同阅读之后加载。');
  function stateRef(){return G.ps.socialAppointments||(G.ps.socialAppointments=fresh());}
  function context(){const r=SP.communityRoutines.state(),lin=G.ps.communitySocial?.lin,actor=SP.communityRoutines.actor(),here=W.interior&&W.sceneId===ROOM,door=W.byId?.[SP.communityRoom?.entryId||'community_reading_door'];const nearDoor=!W.interior&&door&&Math.hypot(SP.player.x-door.x,SP.player.y-door.y)<=4;return {nearby:SP.communitySocial.nearby(),familiarity:lin?.familiarity||0,lastSharedDay:lin?.lastSharedDay??-1,cooldownUntil:SP.socialEncountersLive?.candidate.engine.snapshot().people.community_resident_lin?.cooldownUntil||0,businessBusy:!!(G.activity||G.trans||G.menu||C.ff||SP.player.carry||SP.socialEncountersLive?.candidate.engine.current()?.prepared),rain:C.weather==='rain'&&C.intensity>.35,npcReady:!!(r&&r.scene===ROOM&&!r.hidden&&r.node===4&&!r.path.length&&Math.hypot(r.x-3.2,r.y-3.85)<=.55),playerPresent:!!(here||nearDoor),uncertainAbsence:!!(G.activity||G.trans||SP.metroActive||SP.cbd?.active||root.FushiMetro?.core?.active||nearDoor),readingActive:SP.communitySocial.readingActive()};}
  const adapter={reserved:day=>!!(SP.socialFlow?.reservation?.('community_resident_lin',day*1440+1080,day*1440+1130)||SP.socialFlow?.reservation?.('player',day*1440+1080,day*1440+1130)),now:()=>C.abs(),source:()=>G.ps,getState:stateRef,setState:s=>G.ps.socialAppointments=s,context,activity:()=>G.activity,canRead:()=>SP.communitySocial.canRead(),startReading(){const reason=SP.communitySocial.startRead();return reason?{ok:false,reason}:{ok:SP.communitySocial.readingActive()};},cancelReading:()=>SP.communitySocial.cancelRead()};
  const api=create(adapter,G.ps?stateRef():fresh()),update0=G.update;
  G.update=function(){if(G.ps?.socialAppointments?.active?.status==='reading')api.update();const result=update0.apply(this,arguments);if(G.ps)api.update();return result;};
  SP.socialAppointments=api;return api;
 }
 const api={fresh,validate,normalize,create,register,schedule,ROOM,HISTORY};root.SocialAppointments=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root.SP?.game)register(root.SP);
})(typeof window!=='undefined'?window:globalThis);
