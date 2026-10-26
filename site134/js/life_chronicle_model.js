/* Authoritative event archive and deterministic biography. LLM prose is a separate annotation. */
(function(root){
 'use strict';const copy=x=>JSON.parse(JSON.stringify(x)),finite=x=>Number.isFinite(x)&&x>=0&&x<=1e12;
 const fresh=(at,ps={})=>({version:1,name:'李默',startedAt:at,nextId:1,events:[],death:null,polished:null,baseline:{money:Number(ps.money)||0,spent:Number(ps.stats?.spent)||0,earned:Number(ps.stats?.earned)||0}});
 const pageLimit=n=>typeof n==='number'&&Number.isFinite(n)?Math.max(1,Math.min(80,Math.floor(n))):80;
 const pageOffset=n=>typeof n==='number'&&Number.isSafeInteger(Math.floor(n))&&n>=0?Math.floor(n):0;
 function count(s){return s.events.length;}
 // Recent facts retain recording order, matching the legacy events.slice(-limit).
 function recent(s,limit=80){return s.events.slice(-pageLimit(limit));}
 function eventById(s,id){
  if(!Number.isSafeInteger(id)||id<1)return null;
  const e=s.events[id-1];return e?.id===id?e:null;
 }
 function query(s,{offset=0,limit=80,kind,search,sceneName}={}){
  offset=pageOffset(offset);limit=pageLimit(limit);
  const term=typeof search==='string'?search:'',items=[];let total=0;
  for(let i=count(s)-1;i>=0;i--){const e=s.events[i];
   if(typeof kind==='string'&&kind!==''&&e.kind!==kind||term&&!e.summary.includes(term)&&!(typeof sceneName==='function'&&eventSummary(e,sceneName).includes(term)))continue;
   if(total>=offset&&items.length<limit)items.push(e);total++;
  }
  return {items,total,offset,limit};
 }
 function add(s,{at,kind,source,summary,facts={},parent=null}){
  if(!finite(at)||typeof kind!=='string'||typeof source!=='string'||typeof summary!=='string')return null;
  const e={id:s.nextId++,at,kind:kind.slice(0,64),source:source.slice(0,100),summary:summary.slice(0,600),facts:copy(facts),parent};s.events.push(e);return e;
 }
 function die(s,at,cause,snapshot){
  if(s.death)return s.death;
  const e=add(s,{at,kind:'death',source:'world_rules',summary:'角色死亡：'+cause,facts:snapshot});s.death={at,cause,eventId:e.id,snapshot:copy(snapshot)};return s.death;
 }
 // Resolve presentation only: saved summaries/facts and stable IDs stay untouched.
 function eventSummary(e,sceneName=id=>id){
  if(e.kind!=='scene_change')return e.summary;
  const from=e.facts?.from,to=e.facts?.to;
  if(typeof from!=='string'||typeof to!=='string')return e.summary;
  return '从'+sceneName(from)+'前往'+sceneName(to);
 }
 function biography(s,sceneName=id=>id){
  const at=s.death?.at??recent(s,1)[0]?.at??s.startedAt,days=Math.max(0,Math.floor((at-s.startedAt)/1440));
  const text=[s.name+'列传',`本传依据游戏记录编成，记录始于第 ${Math.floor(s.startedAt/1440)+1} 日。此前经历未完整记录，不作补写。`,`${s.name}在井槐里生活。自本档案开始，历经 ${days} 个完整游戏日。`];
  const significant=s.events.filter(e=>e.kind!=='world_note'||/工作|租|买|报|阅读|送|修|警|约|搬|药|付款|饭|婚|死/.test(e.summary));
  for(const e of significant.slice(-24)){const minute=Math.floor(e.at%1440);text.push(`第 ${Math.floor(e.at/1440)+1} 日 ${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}，${eventSummary(e,sceneName).replace(/[。！]$/,'')}。`);}
  if(s.death)text.push(`其人生终于第 ${Math.floor(s.death.at/1440)+1} 日，死因为${s.death.cause}。身后留下余额 ¥${Number(s.death.snapshot.money).toFixed(2)}，有记录的累计收入 ¥${Number(s.death.snapshot.earned).toFixed(2)}、支出 ¥${Number(s.death.snapshot.spent).toFixed(2)}。`);
  else text.push('此人尚在世，人生记录仍在继续。');
  text.push(`档案共 ${count(s)} 条事件；这里节选最近的重要经历，完整原始记录可导出。`);return text.join('\n\n');
 }
 function validate(s,at){
  if(!s||s.version!==1||typeof s.name!=='string'||s.name.length>60||!finite(s.startedAt)||s.startedAt>at||!Number.isSafeInteger(s.nextId)||s.nextId<1||!Array.isArray(s.events)||s.events.length>100000||s.events.length!==s.nextId-1||!s.baseline||!['money','spent','earned'].every(k=>Number.isFinite(s.baseline[k])))return false;
  for(let i=0;i<s.events.length;i++){const e=s.events[i];if(e.id!==i+1||!finite(e.at)||e.at>at||typeof e.kind!=='string'||e.kind.length>64||typeof e.source!=='string'||e.source.length>100||typeof e.summary!=='string'||e.summary.length>600||!e.facts||typeof e.facts!=='object'||Array.isArray(e.facts)||JSON.stringify(e.facts).length>10000||!(e.parent===null||Number.isSafeInteger(e.parent)&&e.parent>0&&e.parent<e.id))return false;}
  if(s.death&&(!finite(s.death.at)||s.death.at>at||typeof s.death.cause!=='string'||!(eventById(s,s.death.eventId)?.kind==='death'&&eventById(s,s.death.eventId)?.at===s.death.at)))return false;
  if(s.polished&&(!finite(s.polished.at)||s.polished.at>at||typeof s.polished.text!=='string'||s.polished.text.length>6000||!Array.isArray(s.polished.eventIds)||!s.polished.eventIds.every(id=>eventById(s,id)!==null)))return false;
  return true;
 }
 const api={fresh,add,die,count,recent,eventById,query,biography,eventSummary,validate,copy};root.LifeChronicleModel=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
