/* Fictional non-lethal conflict rules, independent of renderer and real-world law. */
(function(root){
 'use strict';const TYPES=['timid','assertive','aggressive','calm','civic'];
 const BEHAVIOR={timid:{emotion:'恐惧',mode:'flee',report:4},assertive:{emotion:'愤怒',mode:'protest',report:3},aggressive:{emotion:'愤怒',mode:'fight',report:null},calm:{emotion:'克制',mode:'calm',report:5},civic:{emotion:'平静',mode:'report',report:1}};
 const copy=x=>JSON.parse(JSON.stringify(x)),finite=x=>Number.isFinite(x)&&x>=0&&x<=1e12;
 function personality(id){let h=2166136261;for(const c of id)h=Math.imul(h^c.charCodeAt(0),16777619);return TYPES[(h>>>0)%TYPES.length];}
 const PUBLIC_KINDS=['report','dispatch','arrest','inquiry_review','provisional_belief','onsite_release','station_inquiry','processing','release'];
 const fresh=()=>({publicArchive:[],version:1,nextCase:1,nextEvent:1,nextAttackAt:0,people:{},cases:[],events:[],player:{health:100,debt:0,paid:0,owned:[],weapon:'fists',stolen:0},publicCash:0,unit:{caseId:null,x:104.5,y:3,carX:104.5,carY:1.35,scene:'street',officerId:null,lastSeen:null,searchUntil:null}});
 function note(s,at,kind,caseId,text,facts={}){s.events.push({id:s.nextEvent++,at,kind,caseId,text,facts:copy(facts)});if(PUBLIC_KINDS.includes(kind)){if(!s.publicArchive)s.publicArchive=[];if(s.publicArchive.length<512)s.publicArchive.push(copy(s.events.at(-1)));}if(s.events.length>256)s.events.shift();}
 function hit(s,{id,x,y,scene,traits,isPolice=false,witnesses=[],weapon='kick'},at){
  if(!finite(at)||at<s.nextAttackAt)return {ok:false,reason:'先收回这一脚，再进行下一次动作。'};
  if(!id||!finite(x+1000)||!finite(y+1000)||scene!=='street')return {ok:false,reason:'本轮近身冲突先支持老街街面，室内与商务区尚未接入。'};
  if(s.unit.caseId&&s.cases.find(c=>c.id===s.unit.caseId)?.status==='processing')return {ok:false,reason:'正在接受处理。'};
  const kind=isPolice?'civic':traits||personality(id);if(!TYPES.includes(kind))return {ok:false,reason:'性格数据无效。'};
  const p=s.people[id]||(s.people[id]={personality:kind,health:100,hits:0,emotion:'平静',mode:'calm',reactAt:at,until:at,lastCounterAt:-1});
  if(p.health===0)return {ok:false,reason:'对方已经倒下，不能继续攻击。'};
  const damage={kick:8,fists:8,branch:12,knife:30}[weapon];if(!damage)return {ok:false,reason:'武器数据无效。'};
  s.nextAttackAt=at+1;
  p.health=Math.max(0,p.health-damage);p.hits++;p.emotion='惊讶';p.mode='shock';p.reactAt=at+2;p.until=at+60;
  if(p.health===0){p.mode='down';p.emotion='倒地';for(const q of s.cases)if(q.victim===id&&q.status==='observed'&&!q.witnesses.length)q.reportAt=null;}
  const b=BEHAVIOR[p.personality],seen=[...new Set(witnesses)].filter(v=>typeof v==='string'&&v!==id).slice(0,20);
  const reportDelay=p.health===0?(seen.length?1:null):b.report===null?(seen.length?3:null):b.report;
  const c={id:s.nextCase++,victim:id,at,x,y,scene,personality:p.personality,weapon,witnesses:seen,status:'observed',reportAt:reportDelay===null?null:at+reportDelay,reportedAt:null,dispatchAt:null,arrivedAt:null,arrestedAt:null,releaseAt:null,closedAt:null,paid:0,debt:0};
  if(isPolice){
   c.policeAssault=true;c.policeWitnessed=true;c.reportAt=at;c.reportedAt=at;c.status='reported';
   if(p.health>0){p.mode='calm';p.emotion='警戒';}
   note(s,at,'police_assault',c.id,'警员遭受攻击，亲历事实已记录，立即进入警方处置。',{victim:id,weapon,damage,health:p.health});
   if(s.unit.caseId===null&&!s.unit.station&&!s.unit.returning&&s.unit.carPhase!=='returning'&&(!s.unit.carMigration||s.unit.carMigration.done)){
    c.status='dispatching';c.dispatchAt=at;s.unit.caseId=c.id;note(s,at,'dispatch',c.id,'袭警事件已直接接警，警员就近控制现场。');
   }
  }
  s.cases.push(c);if(s.cases.length>100)s.cases=s.cases.filter(q=>q.status!=='closed').concat(s.cases.filter(q=>q.status==='closed').slice(-60)).sort((a,b)=>a.id-b.id);
  note(s,at,'assault',c.id,'近身攻击被受害者发现。',{victim:id,weapon,damage,health:p.health,witnesses:seen});return {ok:true,person:p,case:c};
 }
 function threat(s,{id,x,y,scene,witnesses=[]},ps,at){
  if(!finite(at)||at<s.nextAttackAt||scene!=='street'||!id||!Number.isFinite(x)||!Number.isFinite(y))return {ok:false,reason:'当前不能威胁这个目标。'};
  const kind=personality(id),p=s.people[id]||(s.people[id]={personality:kind,health:100,hits:0,emotion:'平静',mode:'calm',reactAt:at,until:at,lastCounterAt:-1});
  if(p.health===0)return {ok:false,reason:'对方已经倒下。'};
  s.nextAttackAt=at+1;p.threats=(p.threats||0)+1;p.mode=p.personality==='aggressive'?'fight':'flee';p.emotion=p.mode==='fight'?'愤怒':'恐惧';p.reactAt=at;p.until=at+60;p.purse=p.purse??80;
  const seen=[...new Set(witnesses)].filter(v=>typeof v==='string'&&v!==id).slice(0,20),c={id:s.nextCase++,victim:id,at,x,y,scene,personality:p.personality,weapon:'threat',kind:'robbery',witnesses:seen,status:'observed',reportAt:at+2,reportedAt:null,dispatchAt:null,arrivedAt:null,arrestedAt:null,releaseAt:null,closedAt:null,paid:0,debt:0};s.cases.push(c);
  note(s,at,'threat',c.id,'当事人威胁居民交出财物。',{victim:id,weapon:s.player.weapon,witnesses:seen});
  const amount=['timid','calm'].includes(p.personality)?Math.min(20,p.purse):0;
  if(amount){p.purse-=amount;ps.money+=amount;ps.stats.earned+=amount;s.player.stolen+=amount;note(s,at,'robbery_transfer',c.id,'被威胁者交出 ¥'+amount+'，已记为涉案财物。',{from:id,to:'player',amount,remaining:p.purse});}
  return {ok:true,person:p,case:c,amount};
 }
 function advance(s,at){
  for(const p of Object.values(s.people)){
   if(p.mode==='shock'&&at>=p.reactAt){const b=BEHAVIOR[p.personality];p.mode=b.mode;p.emotion=b.emotion;}
   if(at>=p.until&&p.mode!=='down'){p.mode='calm';p.emotion='平静';p.restrained=false;}
  }
  for(const c of s.cases)if(c.status==='observed'&&c.reportAt!==null&&at>=c.reportAt){c.status='reported';c.reportedAt=c.reportAt;note(s,at,'report',c.id,c.witnesses.length?'受害者或目击者报警。':'受害者报警。');}
  if(s.unit.caseId===null&&!s.unit.station&&!s.unit.returning&&s.unit.carPhase!=='returning'&&(!s.unit.carMigration||s.unit.carMigration.done)){const c=s.cases.find(c=>c.status==='reported');if(c){c.status='dispatching';c.dispatchAt=at+3;s.unit.caseId=c.id;note(s,at,'dispatch',c.id,'巡逻组接警，准备出发。');}}
 }
 function active(s){return s.cases.find(c=>c.id===s.unit.caseId)||null;}
 function apprehend(s,at,options={}){const c=active(s);if(!c||!['pursuit','searching'].includes(c.status)||c.arrivedAt===null)return false;const inquiry=!!options.inquiry&&!c.policeAssault;c.status=inquiry?'inquiry':'escorting';c.arrestedAt=at;if(inquiry){c.inquiryRequired=true;c.inquiryUntil=at+8;c.policeWitnessed=c.witnesses.some(id=>id.startsWith('patrol_')||id==='response_officer');c.cautious=!!options.cautious;c.statement=null;c.victimStatement=s.people[c.victim]?.health>0?{speaker:c.victim,claim:'player_attacked_first',verified:false}:null;if(c.victimStatement)note(s,at,'victim_statement',c.id,'警员记录另一方关于先后动手的说法，尚待核实。',c.victimStatement);}s.player.custody={cuffed:!!c.policeAssault||!!options.dangerous||(s.player.escapeCount||0)>0,attempts:0,nextAttemptAt:at,recaptureAt:0};s.player.weapon='fists';note(s,at,'arrest',c.id,inquiry?'警员控制现场，开始听取双方陈述，尚未认定责任。':'警员近距离控制当事人，开始带回警务站。');return true;}

 function struggle(s,at,officers=1){
  const c=active(s),p=s.player,k=p.custody;
  if(!c||!['inquiry','escorting'].includes(c.status)||p.health<=0)return {ok:false,reason:'目前没有被押送。'};
  if(!k||k.cuffed)return {ok:false,reason:'已经上铐，无法挣脱控制。'};
  if(at<k.nextAttemptAt)return {ok:false,reason:'正在恢复体力，稍等再尝试。'};
  k.attempts++;k.nextAttemptAt=at+3;p.surrendered=false;
  s.rng=(Math.imul(s.rng??(c.id*7919+Math.floor(at)*101),1664525)+1013904223)>>>0;
  const chance=Math.max(.08,Math.min(.55,.15+p.health/300-(Math.max(1,officers)-1)*.15)),roll=s.rng/4294967296;
  if(roll<chance){c.status='pursuit';p.escapeCount=(p.escapeCount||0)+1;k.recaptureAt=at+2;s.unit.lastSeen=null;note(s,at,'custody_escape',c.id,'当事人挣脱押送，警员立即转入追赶。',{chance,roll,officers});return {ok:true,escaped:true};}
  k.cuffed=true;note(s,at,'custody_restraint',c.id,'挣扎被制止，警员上铐后继续押送。',{chance,roll,officers});return {ok:true,escaped:false};
 }
 function intervene(s,id,at,restrain=false){
  const p=s.people[id];if(!p||p.health<=0||p.mode!=='fight')return false;
  if(p.policeOrderAt===undefined){p.policeOrderAt=at;note(s,at,'police_separate',active(s)?.id||null,'警员制止追打，要求双方分开陈述。',{actor:id,observed:'continued_attack',originalVictim:id});}
  if(p.personality!=='aggressive'||restrain){p.mode='calm';p.emotion=restrain?'被警员控制':'停止冲突';p.restrained=restrain;p.until=at+60;if(restrain)note(s,at,'npc_restraint',active(s)?.id||null,'继续追打的居民被警员控制，后续行为单独记录。',{actor:id,originalVictim:id});return true;}
  return false;
 }
 function statement(s,value,at,text=''){const c=active(s);if(!c||!['inquiry','escorting','processing'].includes(c.status)||!['admit','defense','dispute','accuse'].includes(value))return false;c.statement=value;note(s,at,'statement',c.id,'玩家陈述已记录，仍需与目击和证词核对。',{speaker:'player',claim:value,text:String(text).slice(0,600),verified:false});return true;}
 function finishInquiry(s,at,options={}){const c=active(s);if(!c||c.status!=='inquiry'||(!options.complete&&at<c.inquiryUntil))return false;
  const disputed=c.statement!=='admit'&&!c.policeWitnessed,serious=c.weapon==='knife'||c.kind==='robbery'||s.people[c.victim]?.health<60;
  note(s,at,'inquiry_review',c.id,'警员核对现场可见伤情、目击情况和双方陈述。',{victim:c.victim,playerClaim:c.statement,policeWitnessed:c.policeWitnessed,witnesses:c.witnesses,disputed});
  const corroborated=c.policeWitnessed||c.witnesses.length>=2;
  c.falseStatement=c.statement==='accuse'&&corroborated;
  let misled=false;if(c.statement==='accuse'&&!corroborated){s.rng=(Math.imul(s.rng??c.id*7919,1664525)+1013904223)>>>0;misled=s.rng/4294967296<(c.cautious?.12:.35);}
  if(c.falseStatement)note(s,at,'statement_contradiction',c.id,'指认与已有目击材料冲突，涉嫌虚假指认，处理严重度增加。',{basis:'corroborated_witnesses',claim:c.statement});
  if(misled&&!serious){c.status='closed';c.releaseAt=at;c.closedAt=at;c.outcome='pending_review';s.player.custody=null;s.unit.caseId=null;note(s,at,'provisional_belief',c.id,'现有证据有限，警员暂采信玩家说法并解除控制；原始记录保留，责任尚未最终认定。');return true;}
  if(serious||c.cautious||disputed||c.falseStatement){c.status='escorting';note(s,at,'station_inquiry',c.id,'伤情、说法分歧或谨慎处置需要进一步核实，决定带回询问。');}
  else {c.status='closed';c.releaseAt=at;c.closedAt=at;c.outcome='onsite_mediation';s.player.custody=null;s.unit.caseId=null;note(s,at,'onsite_release',c.id,'现场询问后分开双方，结束本次现场控制；未直接扣款。');}
  return true;
 }
 function process(s,at){const c=active(s);if(!c||c.status!=='escorting')return false;c.status='processing';c.releaseAt=at+60;note(s,at,'processing',c.id,'到达警务站，接受问询。');return true;}
 function release(s,ps,at,options={}){const c=active(s);if(!c||c.status!=='processing'||(!options.complete&&at<c.releaseAt))return false;if(options.complete)c.releaseAt=Math.min(c.releaseAt,at);if(c.statement==='accuse'&&(c.policeWitnessed||c.witnesses.length>=2)&&!c.falseStatement){c.falseStatement=true;note(s,at,'statement_contradiction',c.id,'后续指认与目击材料冲突，增加游戏处理严重度。');}const fee=c.inquiryRequired&&!c.policeWitnessed&&c.statement!=='admit'&&!c.falseStatement?0:200+(c.falseStatement?100:0);const paid=Math.max(0,Math.min(fee,ps.money));ps.money=Math.round((ps.money-paid)*100)/100;ps.stats.spent+=paid;c.paid=paid;c.debt=fee-paid;c.outcome=fee?'resolved':'pending_review';s.player.paid+=paid;s.player.debt+=c.debt;s.publicCash+=paid;s.player.health=Math.max(50,s.player.health);c.status='closed';c.closedAt=at;s.player.custody=null;s.player.escapeCount=0;for(const p of Object.values(s.people)){p.restrained=false;if(p.mode==='fight'){p.mode='calm';p.emotion='平静';}}s.unit.caseId=null;s.unit.lastSeen=null;s.unit.searchUntil=null;note(s,at,'release',c.id,fee?'问询结束：游戏处理费 ¥'+fee+'，未付部分记为欠款。':'当前证据不足以认定责任，解除控制，保留待核实记录。');return true;}
 function validate(s,at){
  if(!s||s.version!==1||!Number.isSafeInteger(s.nextCase)||s.nextCase<1||!Number.isSafeInteger(s.nextEvent)||s.nextEvent<1||!finite(s.nextAttackAt)||!s.people||!s.player||!finite(s.player.health)||s.player.health>100||!finite(s.player.debt)||!finite(s.player.paid)||!Array.isArray(s.player.owned)||!s.player.owned.every(x=>['branch','knife'].includes(x))||new Set(s.player.owned).size!==s.player.owned.length||!['fists','branch','knife'].includes(s.player.weapon)||(s.player.weapon!=='fists'&&!s.player.owned.includes(s.player.weapon))||!finite(s.player.stolen)||s.publicCash!==s.player.paid||!s.unit||!['x','y','carX','carY'].every(k=>Number.isFinite(s.unit[k])&&Math.abs(s.unit[k])<=1000)||!['street','community_civic_room'].includes(s.unit.scene)||!Array.isArray(s.cases)||s.cases.length>100||!Array.isArray(s.events)||s.events.length>256)return false;
  for(const [id,p]of Object.entries(s.people))if(!id||!TYPES.includes(p.personality)||!finite(p.health)||p.health>100||!Number.isSafeInteger(p.hits)||p.hits<0||!['shock','flee','protest','fight','calm','report','down'].includes(p.mode)||!finite(p.reactAt)||!finite(p.until)||!Number.isFinite(p.lastCounterAt))return false;
  if(s.rng!==undefined&&(!Number.isInteger(s.rng)||s.rng<0||s.rng>4294967295))return false;
  if(s.player.escapeCount!==undefined&&(!Number.isSafeInteger(s.player.escapeCount)||s.player.escapeCount<0))return false;
  const k=s.player.custody;if(k&&(!['cuffed'].every(x=>typeof k[x]==='boolean')||!Number.isSafeInteger(k.attempts)||k.attempts<0||!finite(k.nextAttemptAt)||!finite(k.recaptureAt)))return false;
  for(const p of Object.values(s.people)){if(p.restrained!==undefined&&typeof p.restrained!=='boolean')return false;if(p.policeOrderAt!==undefined&&(!finite(p.policeOrderAt)||p.policeOrderAt>at))return false;}
  const ids=new Set();for(const c of s.cases){
   if(!Number.isSafeInteger(c.id)||c.id<1||c.id>=s.nextCase||ids.has(c.id)||!s.people[c.victim]||!finite(c.at)||c.at>at||!Number.isFinite(c.x)||!Number.isFinite(c.y)||Math.abs(c.x)>1000||Math.abs(c.y)>1000||c.scene!=='street'||!TYPES.includes(c.personality)||!Array.isArray(c.witnesses)||c.witnesses.length>20||!c.witnesses.every(x=>typeof x==='string')||!['observed','reported','dispatching','responding','pursuit','searching','inquiry','escorting','processing','closed'].includes(c.status)||!finite(c.paid)||!finite(c.debt))return false;ids.add(c.id);
   for(const k of ['reportAt','reportedAt','dispatchAt','arrivedAt','arrestedAt','releaseAt','closedAt'])if(c[k]!==null&&(!finite(c[k])||c[k]<c.at))return false;
   if(c.dialogue&&(!root.ConflictDialogueModel||!root.ConflictDialogueModel.validate(c.dialogue,at)))return false;
   if(!['kick','fists','branch','knife','threat'].includes(c.weapon))return false;
   if(c.policeAssault!==undefined&&typeof c.policeAssault!=='boolean')return false;
   if(c.policeWitnessed!==undefined&&typeof c.policeWitnessed!=='boolean')return false;
   if(c.policeAssault&&(c.policeWitnessed!==true||c.reportedAt!==c.at||c.reportAt!==c.at))return false;
   if(c.inquiryRequired!==undefined&&typeof c.inquiryRequired!=='boolean')return false;
   if(c.inquiryRequired&&(!finite(c.inquiryUntil)||typeof c.policeWitnessed!=='boolean'||typeof c.cautious!=='boolean'||c.statement!==null&&!['admit','defense','dispute','accuse'].includes(c.statement)))return false;
   if(c.falseStatement!==undefined&&typeof c.falseStatement!=='boolean')return false;
   if(c.outcome!==undefined&&!['resolved','pending_review','onsite_mediation'].includes(c.outcome))return false;
   if(c.status!=='observed'&&c.reportedAt===null)return false;
   if(['pursuit','searching','inquiry','escorting','processing','closed'].includes(c.status)&&c.arrivedAt===null)return false;
   if(['inquiry','escorting','processing','closed'].includes(c.status)&&c.arrestedAt===null)return false;
   if(['processing','closed'].includes(c.status)&&c.releaseAt===null)return false;
   if(c.status==='closed'&&(c.closedAt===null||c.closedAt<c.releaseAt||Math.abs(c.paid+c.debt-(['onsite_mediation','pending_review'].includes(c.outcome)?0:200+(c.falseStatement?100:0)))>.001))return false;
  }
  if(s.unit.carPhase!==undefined&&!['responding','parked','returning'].includes(s.unit.carPhase))return false;
  if(s.unit.carSpeed!==undefined&&(!Number.isFinite(s.unit.carSpeed)||s.unit.carSpeed<0||s.unit.carSpeed>5))return false;
  if(s.unit.carHeading!==undefined&&(!Number.isFinite(s.unit.carHeading)||Math.abs(s.unit.carHeading)>Math.PI*2))return false;
  const migration=s.unit.carMigration;if(migration!==undefined&&(!migration||migration.version!==1||typeof migration.done!=='boolean'||!Array.isArray(migration.start)||migration.start.length!==2||!migration.start.every(x=>Number.isFinite(x)&&Math.abs(x)<=1000)||!Number.isFinite(migration.distance)||migration.distance<0||migration.distance>2100))return false;
  if(s.unit.station!==undefined&&s.unit.station!==null&&!['entering','seating','hearing','leaving'].includes(s.unit.station))return false;
  if(s.unit.returning!==undefined&&s.unit.returning!==null&&!['patrol_a','patrol_b','response_officer'].includes(s.unit.returning))return false;
  if(s.unit.route!==undefined&&s.unit.route!==null&&(!Array.isArray(s.unit.route)||s.unit.route.length>8000||!s.unit.route.every(p=>Array.isArray(p)&&p.length===2&&p.every(x=>Number.isFinite(x)&&Math.abs(x)<=1000))))return false;
  if(s.player.surrendered!==undefined&&typeof s.player.surrendered!=='boolean')return false;
  if(s.unit.lastSeen!==null&&(!s.unit.lastSeen||!Number.isFinite(s.unit.lastSeen.x)||!Number.isFinite(s.unit.lastSeen.y)||!finite(s.unit.lastSeen.at)||s.unit.lastSeen.at>at))return false;
  if(s.patrols&&Object.values(s.patrols).some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.abs(p.x)>1000||Math.abs(p.y)>1000))return false;
  if(s.unit.caseId!==null&&!ids.has(s.unit.caseId))return false;
  let last=0;for(const e of s.events){if(!Number.isSafeInteger(e.id)||e.id<=last||e.id>=s.nextEvent||!finite(e.at)||e.at>at||typeof e.kind!=='string'||typeof e.text!=='string')return false;last=e.id;}
  if(s.publicArchive!==undefined){if(!Array.isArray(s.publicArchive)||s.publicArchive.length>512)return false;let previous=0;for(const e of s.publicArchive){if(!e||Object.keys(e).sort().join(',')!=='at,caseId,facts,id,kind,text'||!Number.isSafeInteger(e.id)||e.id<=previous||e.id>=s.nextEvent||!finite(e.at)||e.at>at||!PUBLIC_KINDS.includes(e.kind)||!ids.has(e.caseId)||typeof e.text!=='string'||!e.facts||typeof e.facts!=='object')return false;const live=s.events.find(q=>q.id===e.id);if(live&&JSON.stringify(live)!==JSON.stringify(e))return false;previous=e.id;}}
  return true;
 }
 const api={fresh,personality,hit,threat,advance,active,apprehend,struggle,intervene,statement,finishInquiry,process,release,validate,copy,TYPES,BEHAVIOR,note};root.NpcConflictModel=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
