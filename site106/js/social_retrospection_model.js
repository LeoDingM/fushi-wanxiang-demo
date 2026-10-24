/* Limited lease retrospection. Source ledgers own truth; observations own knowledge. */
(function(root){
 'use strict';
 const HOME=root.SharedHomeModel||(typeof require==='function'?require('./shared_home_model.js'):null),CAP=1024,clone=x=>JSON.parse(JSON.stringify(x)),keys=(x,k)=>!!x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join('|')===k.slice().sort().join('|'),time=x=>Number.isFinite(x)&&x>=0&&x<=1e12;
 const BASE=['player','daily_wen','daily_shen'];
 function canonical(id,resolve){if(typeof id!=='string'||!id||id.length>100)return false;if(resolve){const r=resolve(id);return r===id||r?.id===id;}return BASE.includes(id);}
 function ledgerAt(ledger,at){try{return HOME?.prepare(ledger,at)||null;}catch{return null;}}
 function fresh(at=0){return time(at)?{version:1,startedAt:at,nextId:1,observations:[]}:null;}
 function source(ledger,id){return ledger.receipts.find(r=>r.id===id&&r.kind==='checkout');}
 function validEvidence(e){return keys(e,['scene','observer','speaker'])&&typeof e.scene==='string'&&e.scene.length>0&&e.scene.length<=100&&['observer','speaker'].every(k=>Array.isArray(e[k])&&e[k].length===2&&e[k].every(v=>Number.isFinite(v)&&Math.abs(v)<=100000))&&Math.hypot(e.observer[0]-e.speaker[0],e.observer[1]-e.speaker[1])<=2.4;}
 const dedup=o=>[o.sourceRef.receiptId,o.observerId,o.channel,o.speakerId].join('|');
 function prepare(s,at,ledger,resolve){try{
  const home=ledgerAt(ledger,at);if(!home||!keys(s,['version','startedAt','nextId','observations'])||s.version!==1||!time(s.startedAt)||s.startedAt>at||!Array.isArray(s.observations)||s.observations.length>CAP||s.nextId!==s.observations.length+1)return null;
  const seen=new Set();let last=s.startedAt;
  for(let i=0;i<s.observations.length;i++){
   const o=s.observations[i],ref=o?.sourceRef,r=ref&&source(home,ref.receiptId);
   if(!keys(o,['id','sourceRef','observerId','channel','at','speakerId','evidence'])||o.id!==i+1||!keys(ref,['domain','receiptId'])||ref.domain!=='sharedHome'||!Number.isSafeInteger(ref.receiptId)||!r||!canonical(o.observerId,resolve)||!time(o.at)||o.at<last||o.at>at||o.at<r.at||!validEvidence(o.evidence)||!['participant','witness','statement'].includes(o.channel))return null;
   if(o.channel==='participant'){if(o.observerId!==r.actorId||o.speakerId!==null||o.at!==r.at||Math.hypot(o.evidence.observer[0]-o.evidence.speaker[0],o.evidence.observer[1]-o.evidence.speaker[1])>.001)return null;}
   else if(o.channel==='witness'){if(o.observerId===r.actorId||o.speakerId!==r.actorId||o.at!==r.at)return null;}
   else if(o.speakerId!==r.actorId||o.observerId===o.speakerId)return null;
   const key=dedup(o);if(seen.has(key))return null;seen.add(key);last=o.at;
  }return clone(s);
 }catch{return null;}}
 function observe(s,input,ledger,resolve){const fail=reason=>({ok:false,reason});try{
  if(!keys(input,['receiptId','observerId','channel','at','speakerId','evidence']))return fail('回溯观察字段无效');
  const n=prepare(s,input.at,ledger,resolve);if(!n)return fail('回溯来源、时间或已有观察无效');
  const o={id:n.nextId,sourceRef:{domain:'sharedHome',receiptId:input.receiptId},observerId:input.observerId,channel:input.channel,at:input.at,speakerId:input.speakerId,evidence:clone(input.evidence)};
  const old=n.observations.find(x=>dedup(x)===dedup(o));if(old)return{ok:true,state:n,observation:clone(old),duplicate:true};
  if(n.observations.length>=CAP)return fail('社会观察记录已满；本次未加入回溯，退租结算仍然有效');
  n.observations.push(o);n.nextId++;if(!prepare(n,input.at,ledger,resolve))return fail('没有有效的当面观察或真实退租来源');
  return{ok:true,state:n,observation:clone(o),duplicate:false};
 }catch{return fail('回溯观察无法记录');}}
 function facts(ledger,at){const n=ledgerAt(ledger,at);return n?n.receipts.filter(r=>r.kind==='checkout').map(r=>({sourceRef:{domain:'sharedHome',receiptId:r.id},leaseRef:{domain:'sharedHome',receiptId:r.leaseId},causalParentRefs:n.receipts.filter(p=>p.id<r.id&&p.actorId===r.actorId&&p.leaseId===r.leaseId&&['sign','pay'].includes(p.kind)).map(p=>({domain:'sharedHome',receiptId:p.id})),actorId:r.actorId,at:r.at,kind:'lease_checkout',reason:null})):[];}
 function view(s,observerId,ledger,at,resolve){const n=prepare(s,at,ledger,resolve);if(!n||!canonical(observerId,resolve))return[];const result=new Map();for(const o of n.observations){if(o.observerId!==observerId)continue;const r=source(ledger,o.sourceRef.receiptId);result.set(r.id,{receiptId:r.id,actorId:r.actorId,at:r.at,learnedAt:o.at,channel:o.channel,summary:'已办理退租结算',reason:null});}return Array.from(result.values());}
 const api={fresh,prepare,validate:(...args)=>!!prepare(...args),normalize:prepare,observe,facts,view,MAX_OBSERVATIONS:CAP};root.SocialRetrospectionModel=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
